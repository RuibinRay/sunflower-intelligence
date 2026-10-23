// influences-on-buying.ex.js — M01 · What influences buying: widgets, practice and the knowledge check.
// Answer keys live here, not in the page's HTML. Every business, person and figure is fictional unless the lesson cites
// a source; every number is recomputed by `check` (see ../AUTHORING.md).

const LAYERS = ['Cultural', 'Social', 'Personal', 'Psychological'];
const BIASES = ['Anchoring', 'Default effect', 'Loss aversion'];
const whole = (x) => Math.round(x).toLocaleString('en-US');
const dollars = (x) => `$${x.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const widgets = {
  'ib-referral': {
    type: 'formula',
    title: 'Referral multiplier: how word of mouth adds customers',
    intro: 'Customers won directly each refer r new customers on average, who refer r each in turn. Some referred customers would have joined anyway; a reward is paid on every referral.',
    inputs: [
      { id: 'N', label: 'Customers won directly', min: 50, max: 2000, step: 50, value: 400, fmt: 'int' },
      { id: 'r', label: 'Referrals per new customer (r)', min: 0, max: 0.9, step: 0.05, value: 0.25, fmt: 'num' },
      { id: 'n', label: 'Rounds of referrals counted', min: 1, max: 10, step: 1, value: 3, fmt: 'int' },
      { id: 'anyway', label: 'Referred customers who would have joined anyway', min: 0, max: 100, step: 5, value: 40, fmt: 'pct' },
      { id: 'reward', label: 'Reward paid per referral', min: 0, max: 30, step: 1, value: 10, fmt: 'money' },
    ],
    compute: (v) => {
      const rounds = Array.from({ length: v.n + 1 }, (_, k) => k);
      const cum = rounds.map((k) => (v.r === 0 ? v.N : v.N * (1 - v.r ** (k + 1)) / (1 - v.r)));
      const tn = cum[cum.length - 1];
      const tinf = v.N / (1 - v.r);
      const referred = tinf - v.N;
      const incr = referred * (1 - v.anyway / 100);
      const cost = referred * v.reward;
      const cpi = incr > 1e-9 ? dollars(cost / incr) : 'no incremental customers';
      const shareFirstTwo = referred > 1e-9 ? ((v.N * v.r + v.N * v.r * v.r) / referred) * 100 : 0;
      return {
        headline: { label: `Customers after ${v.n} round${v.n === 1 ? '' : 's'} of referrals`, value: whole(tn) },
        rows: [
          ['Long-run total, N ÷ (1 − r)', whole(tinf)],
          ['Long-run multiplier, 1 ÷ (1 − r)', (1 / (1 - v.r)).toFixed(2)],
          ['Referred customers (long run)', whole(referred)],
          ['Of which incremental', whole(incr)],
          ['Reward cost (long run)', dollars(cost)],
          ['Reward cost per incremental customer', cpi],
        ],
        note: referred < 1e-9
          ? 'With r = 0 nobody refers anyone: the customers won directly are all there is.'
          : `The first two rounds bring ${Math.round(shareFirstTwo)}% of all the referred customers the long run will ever bring, so most of the effect arrives quickly. Only the ${whole(incr)} incremental customers add value; judge the reward by its cost per incremental customer, not per referral.`,
        chart: {
          kind: 'line',
          x: { label: 'Round of referrals', values: rounds },
          series: [
            { name: 'Customers so far', values: cum.map((x) => Math.round(x)) },
            { name: 'Long-run total', values: rounds.map(() => Math.round(tinf)) },
          ],
          y: { label: 'Customers' },
        },
      };
    },
  },
};

export const guided = [
  {
    id: 'm01-ib-g1', type: 'classify', kind: 'conceptual',
    prompt: 'Classify each influence on a purchase as cultural, social, personal or psychological.',
    items: [
      'A family always buys its festival cake from the same bakery, as the custom of its community demands.',
      'A teenager wants the trainers her friends at school wear.',
      'A newly retired couple, with time on their hands, books a cookery course.',
      'A shopper starts noticing adverts for running shoes only after deciding to take up running.',
      'A man keeps buying the same razor because it has never let him down.',
      'A household stops eating out after losing one of its two incomes.',
    ],
    categories: LAYERS,
    answer: [0, 1, 2, 3, 3, 2],
    hints: [
      'Cultural influences are shared customs and values of a society or community; social influences come from groups and people around the buyer; personal ones are the buyer’s own circumstances; psychological ones happen inside the buyer’s mind.',
      'Noticing adverts only once you need the product is selective attention. Buying again because it worked before is learning.',
    ],
    feedback: {
      0: 'A shared custom of a community is cultural: it is learned and shared, not a matter of what one group of friends does.',
      2: 'Retirement is a change in life stage, a personal influence.',
      3: 'Noticing only what relates to a current need is selective attention, part of perception: psychological.',
      4: 'Repeating a purchase because it was rewarded before is learning: psychological.',
    },
    solution: 'The festival cake: cultural. The trainers: social (a reference group). The cookery course: personal (life stage). The running adverts: psychological (selective attention). The razor: psychological (learning through reinforcement). Eating out less: personal (economic situation).',
  },
  {
    id: 'm01-ib-g2', type: 'steps', kind: 'numerical',
    prompt: 'A fictional meal-kit company wins 600 new customers through advertising. Each new customer refers, on average, 0.2 new customers, who refer at the same rate.',
    solution: 'Round 1: 600 × 0.2 = 120. Round 2: 120 × 0.2 = 24. After two rounds: 600 + 120 + 24 = 744, which the formula confirms: 600 × (1 − 0.2³) ÷ (1 − 0.2) = 744. Long run: 600 ÷ (1 − 0.2) = 750. The referrals add at most 150 customers, before asking how many of them would have joined anyway.',
    steps: [
      { id: 'm01-ib-g2-s1', type: 'num',
        prompt: 'How many customers do the 600 refer in the first round?',
        answer: 120, check: () => 600 * 0.2, tol: 0.5, unit: 'customers', places: 0,
        hints: ['Each of the 600 refers 0.2 customers on average.', '600 × 0.2.'],
        wrong: [{ value: 720, say: 'That is the total after the first round. The question asks only for the referred customers.' }] },
      { id: 'm01-ib-g2-s2', type: 'num',
        prompt: 'How many customers are there in total after two rounds of referrals?',
        answer: 744, check: () => 600 * (1 + 0.2 + 0.2 ** 2), tol: 0.5, unit: 'customers', places: 0,
        hints: ['The second round is a fifth of the first: 120 × 0.2 = 24.', 'Add the three groups: 600 + 120 + 24.'],
        wrong: [
          { value: 720, say: 'That stops after one round. The 120 referred customers refer 0.2 each too.' },
          { value: 840, say: 'You counted 120 again in the second round. Each round is 0.2 times the one before: 120 × 0.2 = 24.' },
        ] },
      { id: 'm01-ib-g2-s3', type: 'num',
        prompt: 'What total does the referral multiplier give in the long run?',
        answer: 750, check: () => 600 / (1 - 0.2), tol: 0.5, unit: 'customers', places: 0,
        hints: ['Long-run total = N ÷ (1 − r).', '600 ÷ 0.8.'],
        wrong: [
          { value: 3000, say: 'You divided by r. The long-run total is N ÷ (1 − r), not N ÷ r.' },
          { value: 150, say: 'That is the number of referred customers in the long run. Add the 600 won directly.' },
        ] },
    ],
  },
  {
    id: 'm01-ib-g3', type: 'mc', kind: 'conceptual',
    prompt: 'Which statement about Maslow’s hierarchy of needs is best supported by Maslow’s own paper and the later evidence?',
    options: [
      'The five needs are a useful checklist, but the evidence gives little support to a fixed order.',
      'Research has confirmed that people pursue esteem only once their safety needs are fully met.',
      'Maslow said the order was rigid, and later research confirmed that it was.',
      'The hierarchy has been disproved, so the five needs are of no use in marketing.',
    ],
    answer: 0,
    hints: [
      'What did Maslow say about how rigid the order is, and about people being partly satisfied in several needs at once?',
      'Tay and Diener (2011) found the needs broadly universal, but what did they find about the order?',
    ],
    feedback: {
      1: 'That is the strict reading of the theory, which the evidence doesn’t support: Tay and Diener found people reporting social and self-actualisation needs met even when basic needs were not.',
      2: 'Maslow wrote that the hierarchy was not as rigid as he might have implied, and Wahba and Bridwell (1976) found little consistent support for the ranking.',
      3: 'The order has little support, but the needs themselves appear broadly universal and linked to well-being, so the list remains a useful checklist of benefits.',
    },
    solution: 'Maslow described his hierarchy as not rigid, with people partly satisfied in all their needs at once. Later research found little consistent support for a fixed order, while Tay and Diener found the needs themselves broadly universal. Use the list; don’t rely on the sequence.',
  },
  {
    id: 'm01-ib-g4', type: 'classify', kind: 'applied',
    prompt: 'Which behavioural effect does each selling tactic mainly rely on?',
    items: [
      'A car dealer opens the conversation with the most expensive version before showing the model the buyer asked about.',
      'An airline’s booking page has seat insurance already selected.',
      'A loyalty scheme’s e-mail says: “Don’t lose the 2,000 points you’ve earned: renew by Friday.”',
      'A wine list puts a $120 bottle at the top, so the $45 bottles look reasonable.',
      'A software firm enrols trial users in its annual plan unless they choose monthly billing.',
      'A shop describes a card fee as a “cash discount” rather than a “card surcharge”.',
    ],
    categories: BIASES,
    answer: [0, 1, 2, 0, 1, 2],
    hints: [
      'A first number that pulls later judgements is anchoring; a pre-selected option is a default; a frame that makes something feel like a loss uses loss aversion.',
      'A surcharge is a loss from the price buyers expect; a discount not received is a gain forgone. Which feels worse?',
    ],
    feedback: {
      2: 'The e-mail frames not renewing as losing something already earned, which feels worse than failing to earn points: loss aversion.',
      5: 'Calling the same fee a cash discount avoids presenting card users with a loss (a surcharge), which buyers resent more than a missed discount: loss aversion through framing.',
    },
    solution: 'The expensive car first and the $120 wine are anchors. The pre-selected insurance and the automatic annual plan are defaults. The “don’t lose your points” e-mail and the cash-discount framing rely on loss aversion. Whether each is acceptable depends on the four questions: is it true, in the customer’s interest, easy to reverse, and would the customer accept it if they saw how it worked?',
  },
];

export const independent = [
  {
    id: 'm01-ib-i1', type: 'mc', kind: 'conceptual',
    prompt: 'Which situation shows loss aversion rather than risk aversion?',
    options: [
      'Shoppers object more to a $5 surcharge for paying by card than to missing a $5 discount for paying in cash.',
      'An investor prefers a certain $1,000 to a 50% chance of $2,000 and nothing otherwise.',
      'A buyer keeps choosing the same familiar brand because it has always worked well for her.',
      'A shopper judges what a sofa should cost from the first price tag she happened to see that day.',
    ],
    answer: 0,
    feedback: {
      1: 'Preferring a certain amount to a gamble with the same expected value is risk aversion, as F00 defines it.',
      2: 'That is learning: a habit reinforced by good experiences.',
      3: 'That is anchoring: an estimate pulled towards the first number seen.',
    },
    solution: 'The two outcomes are worth the same $5, but the surcharge is framed as a loss from the expected price and the missed discount as a gain forgone. Reacting more strongly to the loss is loss aversion. Risk aversion concerns certainty versus a gamble, which is a different comparison.',
  },
  {
    id: 'm01-ib-i2', type: 'num', kind: 'numerical',
    prompt: 'A fictional language-learning app wins 1,000 subscribers through a campaign. Each new subscriber refers 0.3 new subscribers on average. Using the referral multiplier, how many subscribers will the campaign have produced in the long run? Round to the nearest whole subscriber.',
    answer: 1429, check: () => Math.round(1000 / (1 - 0.3)), tol: 0.5, unit: 'subscribers', places: 0,
    wrong: [
      { value: 1300, say: 'That counts only the first round of referrals. The referred subscribers refer others too: the long-run total is N ÷ (1 − r).' },
      { value: 3333, say: 'You divided by r. The long-run total is N ÷ (1 − r) = 1,000 ÷ 0.7.' },
      { value: 429, say: 'That is the number of referred subscribers. Add the 1,000 won directly.' },
    ],
    solution: 'Long-run total = N ÷ (1 − r) = 1,000 ÷ 0.7 = 1,428.6, about 1,429 subscribers, of whom about 429 were referred. Before valuing them, ask how many would have joined anyway.',
  },
  {
    id: 'm01-ib-i3', type: 'multi', kind: 'conceptual',
    prompt: 'Which statements about perception are correct? Select all that apply.',
    options: [
      'Two shoppers looking at the same web page can notice different things.',
      'A loyal fan may read an ambiguous review of the brand favourably.',
      'People tend to remember messages that support what they already think.',
      'A message repeated often enough is always received the way it was meant.',
      'Price tells buyers nothing about quality; only trying the product does.',
      'Everyone who sees the same advert perceives the same thing.',
    ],
    answer: [0, 1, 2],
    feedback: {
      3: 'Repetition can help a message get noticed, but selective distortion means it can still be read in ways the sender didn’t intend.',
      4: 'Buyers who can’t try a product before buying often use the price, the pack and the brand as cues to quality.',
      5: 'Perception is selective: people notice, interpret and remember according to their needs and existing beliefs.',
    },
    solution: 'Perception is selective in three ways: attention (what is noticed), distortion (how it is interpreted) and retention (what is remembered). Price and packaging act as cues to quality. A message sent is not the same as a message received.',
  },
  {
    id: 'm01-ib-i4', type: 'mc', kind: 'applied',
    prompt: 'A fictional online travel agent adds travel insurance at $29 to every booking, already selected; customers must untick it to travel without. Many don’t notice it. What should its marketing manager recommend?',
    options: [
      'Leave it unselected and explain what it covers: a pre-selected add-on is a dark pattern.',
      'Keep it: customers can untick the box, so the default is neutral and the choice is still theirs.',
      'Keep it but make the box smaller, so that it doesn’t distract customers from completing the booking.',
      'Stop offering insurance at all, since presenting any option on a booking page is manipulation.',
    ],
    answer: 0,
    feedback: {
      1: 'Defaults are not neutral: changing them takes effort, people read them as recommendations, and leaving them feels like a loss. A default many customers don’t notice decides for them.',
      2: 'Making the box harder to see makes the problem worse: it exploits inattention.',
      3: 'Offering useful cover clearly is a service. The issue is pre-selecting it for customers who wouldn’t choose it.',
    },
    solution: 'Apply the four questions. The price is true, but the choice isn’t clearly in every customer’s interest, many don’t notice it, and customers who later discovered the $29 would not be comfortable with how it was added. Offering the insurance as a clear, unselected option with its cover explained respects the customer; measuring complaints and refunds would show the cost of the current design.',
  },
  {
    id: 'm01-ib-i5', type: 'fill', kind: 'conceptual',
    prompt: 'Complete the sentences.',
    text: 'A colleague who knows a lot about cameras, and whose advice others seek, is an [[0]]. The group of people a teenager wants to look like is a [[1]]. Customers telling each other about a product, in person or online, is [[2]]. Showing a $3,000 camera first so that a $900 camera seems affordable relies on [[3]].',
    blanks: [
      { options: ['opinion leader', 'initiator', 'influencer in a buying centre'], answer: 0 },
      { options: ['subculture', 'reference group', 'social class'], answer: 1 },
      { options: ['word of mouth', 'personal selling', 'advertising'], answer: 0 },
      { options: ['anchoring', 'the default effect', 'loss aversion'], answer: 0 },
    ],
    solution: 'Opinion leader; reference group (an aspirational one); word of mouth; anchoring. A subculture is a group within a culture sharing values, and a social class is a lasting division by income, occupation and education; neither is defined by whom a person wants to resemble.',
  },
  {
    id: 'm01-ib-i6', type: 'short', kind: 'applied',
    prompt: 'For December, Lantern’s web agency proposes: (1) a banner on the Gift Box Trio page, “Order by 18 December for delivery before Christmas”, with a live countdown to that date; (2) a line under the box, “143 people bought this box this week”, updated from real orders; (3) a pop-up that appears when a visitor tries to leave the page, offering 10% off if they order within the next 10 minutes, a timer that restarts each time the page is opened. Evaluate each proposal using the lesson’s ideas and its four questions, and recommend what Ana should do.',
    rubric: [
      'Names the behavioural idea each proposal uses (a real deadline, social proof from a reference group, artificial urgency and loss framing).',
      'Applies the four questions (true, in the customer’s interest, easy to reverse, acceptable if seen) to each.',
      'Distinguishes the honest proposals from the deceptive one with a reason.',
      'Recommends what to do, including what to test or measure.',
    ],
    model: 'Proposal 1 states a real deadline. Christmas delivery really does depend on ordering in time, so the banner is true and helps gift buyers plan; the countdown adds urgency, but the urgency is genuine. Accept it, and make sure the date is right. Proposal 2 uses social proof: buyers take other people’s choices as a sign of a good choice, as they do with reference groups and word of mouth. If the number is real and current, it is honest information; accept it, but never inflate it. Proposal 3 is a dark pattern. The 10-minute limit is false, because the timer restarts, and the pop-up uses loss aversion (“lose the discount”) to rush a decision the buyer might otherwise think through. It fails the first and last questions: it isn’t true, and buyers who noticed the reset would feel tricked. Reject it. If Ana wants a December offer, it should be a real one with a real end date. Test proposals 1 and 2 against the current page with an A/B test and measure orders, returns and complaints, not only this week’s sales.',
  },
];

export const check = [
  {
    id: 'm01-ib-k1', type: 'mc', kind: 'conceptual',
    prompt: 'Which is an accurate definition of anchoring?',
    options: [
      'An estimate of an uncertain value is pulled towards a number seen first, even an irrelevant one.',
      'Buyers tend to stay with whichever option a seller has pre-selected for them at checkout.',
      'A loss weighs more in a buyer’s mind than a gain of exactly the same size does.',
      'Buyers prefer brands that the people they admire are seen to recommend or use.',
    ],
    answer: 0,
    feedback: {
      1: 'That is the default effect.',
      2: 'That is loss aversion.',
      3: 'That describes the influence of reference groups and opinion leaders.',
    },
    solution: 'Anchoring (Tversky and Kahneman, 1974): estimates are pulled towards an initial value. In their demonstration, an anchor from a wheel of fortune (10 or 65) moved estimates of the share of African countries in the United Nations (medians of 25% and 45%).',
  },
  {
    id: 'm01-ib-k2', type: 'num', kind: 'numerical',
    prompt: 'A fictional plant-delivery service wins 900 customers through advertising. Each new customer refers 0.25 new customers on average, and a survey suggests 40% of referred customers would have joined anyway. In the long run, how many incremental customers do the referrals add?',
    answer: 180, check: () => (900 / (1 - 0.25) - 900) * (1 - 0.4), tol: 0.5, unit: 'customers', places: 0,
    wrong: [
      { value: 300, say: 'That is all the referred customers. 40% of them would have joined anyway, so only 60% are incremental.' },
      { value: 120, say: 'That is the 40% who would have joined anyway. The incremental customers are the other 60%.' },
      { value: 1200, say: 'That is the long-run total including the 900 won directly. The question asks for the incremental referred customers.' },
    ],
    solution: 'Long-run total = 900 ÷ (1 − 0.25) = 1,200, so referrals bring 1,200 − 900 = 300 customers. Incremental: 300 × (1 − 0.4) = 180.',
  },
  {
    id: 'm01-ib-k3', type: 'classify', kind: 'conceptual',
    prompt: 'Classify each influence as cultural, social, personal or psychological.',
    items: [
      'A new parent switches to a bigger car.',
      'A student buys the laptop her course’s most respected tutor uses.',
      'In the buyer’s country, giving clocks as gifts is considered unlucky.',
      'A shopper distrusts a brand after one bad experience years ago.',
    ],
    categories: LAYERS,
    answer: [2, 1, 0, 3],
    feedback: {
      0: 'Becoming a parent is a change in life stage: a personal influence.',
      1: 'The tutor is someone others look to for advice: an opinion leader, a social influence.',
      3: 'A lasting reaction to one experience is learning, which shapes attitudes: psychological.',
    },
    solution: 'The bigger car: personal (life stage). The tutor’s laptop: social (an opinion leader). The clocks: cultural (a shared belief of the society). The distrust: psychological (learning and attitudes).',
  },
  {
    id: 'm01-ib-k4', type: 'mc', kind: 'applied',
    prompt: 'Office workers tell Lantern that its coffee tastes excellent, but they don’t think freshness matters much when choosing beans. Lantern roasts every week. Which action aims to change the importance buyers give an attribute, rather than their belief about Lantern?',
    options: [
      'A tasting that sets a week-old roast beside a two-month-old one, showing how flavour fades.',
      'Free samples so that more office workers taste how good Lantern’s coffee is.',
      'Information about the farms Lantern buys from, an attribute buyers hadn’t considered.',
      'A lower price, so that Lantern scores higher on value for money.',
    ],
    answer: 0,
    feedback: {
      1: 'Samples change the belief (Lantern’s score on taste), not how much taste or freshness matters.',
      2: 'That adds a new attribute to the buyer’s evaluation, a third route.',
      3: 'A lower price changes Lantern’s score on price, not the importance of freshness.',
    },
    why: 'If buyers learn that freshness changes flavour, freshness gains weight in their evaluation, and Lantern, which roasts weekly, gains from the higher weight.',
    solution: 'The weighted-attribute model gives three routes: change beliefs (scores), change importance (weights) or add an attribute. The side-by-side tasting raises the weight of freshness; samples and price change scores; farm information adds an attribute.',
  },
  {
    id: 'm01-ib-k5', type: 'mc', kind: 'conceptual',
    prompt: 'What did Maslow himself say, in his 1943 paper, about the order of his hierarchy of needs?',
    options: [
      'That it is less rigid than he may have implied: people are partly satisfied in all needs at once.',
      'That it is a strict sequence, in which each need must be fully met before the next appears.',
      'That it describes purchases of luxury goods well but does not apply to everyday shopping.',
      'That surveys of well-being in 123 countries had already confirmed it as a law.',
    ],
    answer: 0,
    feedback: {
      1: 'That is the popular reading of the pyramid, which Maslow himself rejected.',
      2: 'Maslow wrote about human motivation in general, not about kinds of purchase.',
      3: 'The 123-country study is Tay and Diener’s, published in 2011, nearly seventy years later.',
    },
    solution: 'Maslow wrote that the hierarchy was not as rigid as he might have implied and that most people are partly satisfied and partly unsatisfied in all their basic needs at the same time, giving percentages he called arbitrary and illustrative.',
  },
  {
    id: 'm01-ib-k6', type: 'multi', kind: 'conceptual',
    prompt: 'Johnson and Goldstein (2004) gave reasons why defaults change what people end up choosing. Which of these are among them? Select all that apply.',
    options: [
      'Changing a default takes effort.',
      'People read the default as a recommendation from whoever set it.',
      'The default becomes the reference point, so leaving it feels like a loss.',
      'The default option is always the cheapest.',
      'People can’t see the other options.',
      'Defaults work only when the stakes are trivial.',
    ],
    answer: [0, 1, 2],
    feedback: {
      3: 'Defaults can be any option: the organ-donation default isn’t about price at all.',
      4: 'The other options are usually visible; people stay with the default anyway.',
      5: 'Their example, organ donation, is about as far from trivial as a decision gets.',
    },
    solution: 'Effort, implied endorsement and loss aversion (the default as reference point). In their online experiment, the share agreeing to donate was about twice as high when people had to opt out as when they had to opt in, although every option was visible and one click away.',
  },
];
