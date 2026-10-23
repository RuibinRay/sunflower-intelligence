// marketing-objectives.ex.js — M01 · Marketing objectives: widgets, practice and the knowledge check.
// Answer keys live here, not in the page's HTML. Every business is fictional; every number is recomputed by `check`
// (see ../AUTHORING.md). Lantern's 2027 catering numbers are left to the course project.

const n = (x) => Math.round(x).toLocaleString('en-US');
const one = (x) => (Math.abs(x - Math.round(x)) < 1e-9 ? n(x) : x.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }));

export const widgets = {
  'obj-growth': {
    type: 'formula',
    title: 'How many new customers does a growth goal need?',
    intro: 'A revenue goal, a retention rate and a change in what each customer pays together decide how many customers must be won; the funnel rates turn that into proposals and leads. Customers are assumed to join and leave at the start of the year.',
    inputs: [
      { id: 'n0', label: 'Customers at the start of the year', min: 20, max: 1000, step: 10, value: 400, fmt: 'int', unit: 'customers' },
      { id: 'ret', label: 'Retention rate', min: 30, max: 95, step: 1, value: 85, fmt: 'pct' },
      { id: 'g', label: 'Revenue growth goal', min: 0, max: 60, step: 1, value: 15, fmt: 'pct' },
      { id: 'p', label: 'Change in revenue per customer', min: -10, max: 20, step: 1, value: 4, fmt: 'pct' },
      { id: 'prop', label: 'Leads that receive a proposal', min: 5, max: 80, step: 1, value: 30, fmt: 'pct' },
      { id: 'win', label: 'Proposals won', min: 5, max: 60, step: 1, value: 25, fmt: 'pct' },
    ],
    compute: (v) => {
      const r = v.ret / 100, g = v.g / 100, p = v.p / 100, c1 = v.prop / 100, c2 = v.win / 100;
      const req = v.n0 * (1 + g) / (1 + p);
      const kept = v.n0 * r;
      const gap = req - kept;
      const need = gap <= 1e-9 ? 0 : Math.ceil(gap - 1e-9);
      const replace = v.n0 * (1 - r);
      const proposals = Math.ceil(need / c2 - 1e-9);
      const leads = Math.ceil(need / (c1 * c2) - 1e-9);
      return {
        headline: { label: 'New customers needed', value: `${n(need)}` },
        rows: [
          ['Customers needed for the revenue goal', one(Math.round(req * 10) / 10)],
          ['Customers kept', one(Math.round(kept * 10) / 10)],
          ['Customers lost, who must be replaced first', one(Math.round(replace * 10) / 10)],
          ['Proposals needed', n(proposals)],
          ['Leads needed', n(leads)],
          ['Chance that a lead becomes a customer', `${(c1 * c2 * 100).toFixed(1)}%`],
        ],
        note: need === 0
          ? `Keeping ${v.ret}% of customers, with revenue per customer changing by ${v.p}%, already meets the goal: no new customers are needed. Check that the change in what customers pay doesn’t itself lower retention.`
          : `About ${Math.min(100, Math.round(Math.min(replace, need) / need * 100))}% of the ${n(need)} new customers only replace those lost. Each point of retention is worth ${one(Math.round(v.n0 / 10) / 10)} customers, or about ${n(v.n0 / 100 / (c1 * c2))} leads.`,
        chart: {
          kind: 'bar',
          x: { label: 'Customers', values: ['At the start', 'Kept', 'New needed', 'Needed for the goal'] },
          series: [{ name: 'Customers', values: [v.n0, Math.round(kept * 10) / 10, need, Math.round(req * 10) / 10] }],
          y: { label: 'Customers' },
        },
      };
    },
  },
};

export const guided = [
  {
    id: 'm01-obj-g1', type: 'classify', kind: 'conceptual',
    prompt: 'Ironbridge Fitness (fictional) has written its plan for next year. Classify each statement as a business goal, a marketing objective, a strategy or a tactic.',
    items: [
      'Increase the gym’s profit by 12% next year',
      'Keep at least 75% of the members on 1 January as members until 31 December',
      'Win members by becoming the area’s specialist in strength training for beginners',
      'Run a free first-month offer in February, advertised on local radio',
      'Have 30% of people aged 25–40 living within two miles recognise the gym’s name by June',
      'Put the monthly fee up from $40 to $42 in January',
    ],
    categories: ['Business goal', 'Marketing objective', 'Strategy', 'Tactic'],
    answer: [0, 1, 2, 3, 1, 3],
    hints: [
      'A goal is about the business as a whole; an objective names a customer behaviour, a measure, a level and a date; a strategy is a choice of whom to serve and how to compete; a tactic is a specific action.',
      'Recognising the gym’s name is something customers do, with a measure and a date. Changing the fee is a single action.',
    ],
    feedback: {
      2: 'Specialising in beginners’ strength training is a choice of whom to serve and how to compete: a strategy. It has no measure or date.',
      4: 'Awareness among a defined group, with a level and a date, is a marketing objective at the top of the funnel.',
      5: 'A fee change is a specific marketing-mix action (price), so it is a tactic. It serves the profit goal and may affect the retention objective.',
    },
    solution: 'Business goal: 12% more profit. Marketing objectives: 75% retention for the year; 30% awareness among 25–40-year-olds nearby by June. Strategy: specialise in strength training for beginners. Tactics: the February free-month offer and the $2 fee rise.',
  },
  {
    id: 'm01-obj-g2', type: 'steps', kind: 'numerical',
    prompt: 'Copperline Window Cleaning (fictional) has 250 commercial contracts on 1 January. In past years it kept 76% of its contracts through the year. It wants 8% more contracts on 31 December than on 1 January, at the same prices, and it wins 40% of the quotes it sends. Work out its targets.',
    solution: 'Contracts needed: 250 × 1.08 = 270. Contracts kept: 250 × 0.76 = 190. New contracts: 270 − 190 = 80 (short form: 250 × (1 + 0.08 − 0.76) = 250 × 0.32 = 80). Quotes: 80 ÷ 0.40 = 200. Of the 80 new contracts, 60 replace those lost and only 20 are growth.',
    steps: [
      { id: 'm01-obj-g2-s1', type: 'num',
        prompt: 'How many contracts does Copperline need on 31 December?',
        answer: 270, check: () => 250 * 1.08, tol: 0.5, unit: 'contracts', places: 0,
        hints: ['8% more than 250.', '250 × 1.08.'],
        wrong: [{ value: 20, say: 'That is the increase. The question asks for the total needed at the year end: 250 + 20.' }] },
      { id: 'm01-obj-g2-s2', type: 'num',
        prompt: 'How many new contracts must it win during the year?',
        answer: 80, check: () => 250 * 1.08 - 250 * 0.76, tol: 0.5, unit: 'contracts', places: 0,
        hints: ['First work out how many of the 250 it keeps: 76% of them.', 'Subtract the 190 it keeps from the 270 it needs.'],
        wrong: [
          { value: 20, say: 'That assumes every contract is kept. Copperline loses 24% of its contracts, which must be replaced first.' },
          { value: 60, say: 'That is only the contracts lost. It must also add the 20 of growth.' },
        ] },
      { id: 'm01-obj-g2-s3', type: 'num',
        prompt: 'How many quotes must it send to win them?',
        answer: 200, check: () => (250 * 1.08 - 250 * 0.76) / 0.40, tol: 0.5, unit: 'quotes', places: 0,
        hints: ['It wins 40% of quotes, so each quote is worth 0.4 of a contract.', 'Divide the new contracts by 0.40.'],
        wrong: [{ value: 32, say: 'You multiplied by the win rate. To win 80 contracts at a 40% win rate it needs more quotes than wins: 80 ÷ 0.40.' }] },
    ],
  },
  {
    id: 'm01-obj-g3', type: 'mc', kind: 'conceptual',
    prompt: 'A fictional dental clinic wants more patients. Which is the best SMART marketing objective?',
    options: [
      'Raise new-patient registrations from 40 to 55 a month by June 2027, with retention kept at 80% or more',
      'Become the best-known dental clinic in the city by advertising on local radio throughout 2027',
      'Raise new-patient registrations from 40 to 200 a month by the end of next month, using a new website',
      'Increase the clinic’s social-media followers by 25% by June 2027 to help the practice grow',
    ],
    answer: 0,
    hints: ['Test each against the five letters: specific, measurable, achievable, relevant, time-bound.', 'Which ones have a measure, a level, a date, a realistic size and a direct link to more patients?'],
    feedback: {
      1: '“Best-known” has no measure or level, and advertising on the radio is a tactic, not an objective.',
      2: 'It is specific and dated, but a fivefold rise in a month is not achievable for most clinics.',
      3: 'Measurable and dated, but followers are not patients. The objective is not relevant to the goal unless followers are shown to lead to registrations.',
    },
    why: 'It names the behaviour, the measure, the starting point and level, and the date, and its guardrail stops the target being met with patients who never return.',
    solution: 'The first option is specific (new-patient registrations), measurable (40 to 55 a month), plausibly achievable, relevant (more patients) and time-bound (by June 2027), with a retention guardrail. The others fail at least one test: no measure, not achievable, or not relevant.',
  },
  {
    id: 'm01-obj-g4', type: 'classify', kind: 'applied',
    prompt: 'A fictional language-learning app sets objectives at every stage of its funnel. Which stage does each measure track?',
    items: [
      'Share of adults in its target countries who recognise the app’s name',
      'Visits to the pricing page',
      'Share of free-trial users who start paying',
      'Share of subscribers still paying after 12 months',
      'New subscribers who joined through a friend’s referral link',
      'Requests from companies for a demonstration of the business plan',
    ],
    categories: ['Awareness', 'Consideration', 'Conversion', 'Retention', 'Advocacy'],
    answer: [0, 1, 2, 3, 4, 1],
    hints: [
      'Ask what the customer has done at that point: heard of the app, looked at it seriously, bought, stayed, or recommended it.',
      'A demonstration request shows serious interest, but no purchase yet.',
    ],
    feedback: {
      1: 'Looking at prices shows a customer weighing the app up: consideration, not yet conversion.',
      4: 'Referrals measure existing customers recommending the app: advocacy, even though the result is a new subscriber.',
      5: 'A company asking for a demonstration is considering the product; conversion comes when it signs.',
    },
    solution: 'Awareness: name recognition. Consideration: pricing-page visits and demonstration requests. Conversion: trial users who start paying. Retention: subscribers still paying after a year. Advocacy: subscribers who arrived through referrals.',
  },
];

export const independent = [
  {
    id: 'm01-obj-i1', type: 'num', kind: 'numerical',
    prompt: 'A fictional software firm has 600 customers, each paying $1,200 a year. It wants revenue 10% higher next year, will raise its price by 5% for everyone, and expects to keep 80% of its customers. How many new customers must it win? Round up only at the end.',
    answer: 149, check: () => Math.ceil(600 * 1200 * 1.10 / (1200 * 1.05) - 600 * 0.80), tol: 0.5, unit: 'customers', places: 0,
    wrong: [
      { value: 180, say: 'That ignores the price rise: with each customer paying 5% more, fewer customers are needed (660 ÷ 1.05 ≈ 628.6, not 660).' },
      { value: 148, say: 'You rounded down. 628.6 − 480 = 148.6, and 148 customers would leave the firm just short of its goal: round up to 149.' },
      { value: 60, say: 'That is only the growth, as if every customer stayed. The firm loses 20% of its 600 customers and must replace them first.' },
    ],
    solution: 'Revenue target: 600 × 1,200 × 1.10 = $792,000. Revenue per customer next year: 1,200 × 1.05 = $1,260. Customers needed: 792,000 ÷ 1,260 ≈ 628.6. Customers kept: 600 × 0.80 = 480. New customers: 628.6 − 480 = 148.6, rounded up to 149.',
  },
  {
    id: 'm01-obj-i2', type: 'num', kind: 'numerical',
    prompt: 'A fictional events company needs 45 new corporate clients next year. In its funnel, 20% of enquiries lead to a site visit and 50% of site visits lead to a booking. How many enquiries does it need?',
    answer: 450, check: () => 45 / (0.20 * 0.50), tol: 0.5, unit: 'enquiries', places: 0,
    wrong: [
      { value: 64.3, say: 'You added the two rates (70%). Rates along a funnel multiply: 0.20 × 0.50 = 0.10.' },
      { value: 90, say: 'That uses only the last stage. 90 site visits are needed, and only 20% of enquiries become site visits.' },
      { value: 225, say: 'That uses only the first stage. Divide by both rates: 45 ÷ (0.20 × 0.50).' },
    ],
    solution: 'Each enquiry becomes a booking with probability 0.20 × 0.50 = 0.10. Enquiries needed = 45 ÷ 0.10 = 450 (450 enquiries → 90 site visits → 45 bookings).',
  },
  {
    id: 'm01-obj-i3', type: 'mc', kind: 'applied',
    prompt: 'A fictional office-supplies firm rewarded its sales team for the number of new clients won. New clients doubled, but many were won with 30% discounts and left within three months. Which change to its objectives best fixes the problem?',
    options: [
      'Keep the new-client target but add guardrails: average discount at most 10%, and 70% of new clients still buying after a year',
      'Drop numerical objectives altogether and let the sales team judge which clients are worth winning',
      'Raise the new-client target, so that the team wins enough full-price clients alongside the discounted ones',
      'Reward the team on the revenue each new client brings in during the month the client signs up',
    ],
    answer: 0,
    feedback: {
      1: 'Without any measure the firm can’t tell whether the team is doing well. The problem was a single measure, not measurement itself.',
      2: 'A bigger target strengthens the incentive that caused the discounting. It makes the problem worse.',
      3: 'First-month revenue still rewards signing clients who leave in month three, and discounts barely show in it.',
    },
    why: 'Guardrail metrics stop a target from being met in ways that damage the business, the problem Goodhart’s law predicts.',
    solution: 'A single acquisition target invited the team to buy clients with discounts, and the clients won that way didn’t stay. Keeping the target but adding guardrails on price (average discount) and quality (12-month retention of new clients) rewards winning clients who are worth having.',
  },
  {
    id: 'm01-obj-i4', type: 'multi', kind: 'conceptual',
    prompt: 'Which statements about retention and growth targets are correct? Select all that apply.',
    options: [
      'With 70% retention, a business must win new customers equal to 30% of its starting base just to stay the same size.',
      'Raising retention by 5 percentage points cuts the new customers needed by 5% of the starting base.',
      'If revenue per customer rises, fewer customers are needed to reach the same revenue target.',
      'Growth of 10% needs new customers equal to 10% of the starting base, whatever the retention rate.',
      'Retention affects profit but not the number of new customers a growth target needs.',
    ],
    answer: [0, 1, 2],
    feedback: {
      3: 'That holds only if nobody leaves. New customers needed = N₀(1 + g − r): with 80% retention, 10% growth needs 30% of the base.',
      4: 'Retention sits inside the formula: every customer kept is one fewer to win.',
    },
    solution: 'From N_new = N_req − r × N₀: lost customers (1 − r of the base) must be replaced before any growth counts; each point of retention saves 1% of the base; and a higher revenue per customer lowers N_req. Growth alone never tells you the number of new customers.',
  },
  {
    id: 'm01-obj-i5', type: 'short', kind: 'applied',
    prompt: 'Rookwood Kayak Tours (fictional) sold 2,400 trips last season at $60 each. Returning customers booked 720 of them; the other 1,680 came from first-time customers who found Rookwood through its website, which had 56,000 visits (3% of them led to a booking). The owner wants revenue 20% higher next season at the same price, and plans a season pass for regular paddlers. Write three SMART marketing objectives, at different stages of the funnel, that together deliver the goal. Show the numbers.',
    rubric: [
      'Works out the trips needed: 2,400 × 1.2 = 2,880.',
      'Sets objectives at three different stages (for example retention, consideration and conversion), each with a measure, a level, a starting point and a period.',
      'Makes the objectives add up: trips from returning customers plus visits × conversion rate equals 2,880.',
      'Notes at least one assumption or risk (for example that extra visits convert at the same rate) or adds a guardrail.',
    ],
    model: 'Goal: 2,400 × 1.2 = 2,880 trips at $60 ($172,800). (1) Retention: 900 trips booked by returning customers in the 2027 season, up from 720, through the new season pass (measured in the booking system). (2) Consideration: 60,000 visits to the booking pages between March and September 2027, up from 56,000. (3) Conversion: 3.3% of those visits ending in a booking, up from 3.0%, measured monthly. Check: 900 + 60,000 × 0.033 = 900 + 1,980 = 2,880 trips. The plan assumes the extra visits convert as well as the old ones, so I would track conversion monthly from April, and add a guardrail that the average customer rating stays at 4.5 or more, so that trips aren’t filled by overcrowding the guided groups.',
  },
  {
    id: 'm01-obj-i6', type: 'order', kind: 'conceptual',
    prompt: 'Put the steps for turning a revenue goal into marketing objectives in a sensible order.',
    items: [
      'Turn the revenue goal into a revenue target in money for the period',
      'Divide by next period’s revenue per customer to find the customers needed',
      'Subtract the customers expected to stay, using the retention rate, and round up',
      'Divide the new customers needed by the funnel’s conversion rates to find the leads needed',
      'Write SMART objectives for each lever, with owners and guardrails, and check them against capacity and history',
    ],
    solution: 'Money first (the target), then customers (target ÷ revenue per customer), then new customers (minus those kept), then activity (through the funnel), then the objectives themselves, checked bottom-up against what the business has achieved before and what it can deliver.',
  },
];

export const check = [
  {
    id: 'm01-obj-k1', type: 'mc', kind: 'conceptual',
    prompt: 'What is the difference between a business goal and a marketing objective?',
    options: [
      'A goal says what the business wants overall; an objective says what customers must do to deliver it',
      'A business goal covers several years, while a marketing objective is any target for a single month',
      'There is none: they are the same target, written up by different departments',
      'A marketing objective describes which advertising the business will run to meet the goal',
    ],
    answer: 0,
    feedback: {
      1: 'Time spans differ between sources, and objectives can run for a year or more. The real difference is the level: the whole business versus customer behaviour.',
      2: 'A revenue goal can be met by different customer behaviours (new customers, retention, frequency, price). The marketing objective chooses and quantifies them.',
      3: 'Advertising is a tactic. An objective says what result is wanted, not which action will produce it.',
    },
    solution: 'A business goal (25% more revenue, 12% more profit) states what the business wants. A marketing objective translates it into what customers must do, how much and by when: win 103 clients, keep 85% of them, raise awareness to 35%.',
  },
  {
    id: 'm01-obj-k2', type: 'num', kind: 'numerical',
    prompt: 'A fictional office-cleaning company starts the year with 320 contracts and expects to keep 75% of them through the year. It wants 5% more contracts at the end of the year than at the start, at the same prices. How many new contracts must it win?',
    answer: 96, check: () => 320 * (1 + 0.05 - 0.75), tol: 0.5, unit: 'contracts', places: 0,
    wrong: [
      { value: 16, say: 'That is only the growth, as if every contract were kept. A quarter of them (80) will be lost and must be replaced too.' },
      { value: 80, say: 'That is only the contracts lost. Add the 16 of growth.' },
      { value: 336, say: 'That is the total needed at the year end. Subtract the 240 contracts it keeps.' },
    ],
    solution: 'Needed: 320 × 1.05 = 336. Kept: 320 × 0.75 = 240. New: 336 − 240 = 96, which is 320 × (1 + 0.05 − 0.75) = 320 × 0.30. Of these, 80 replace lost contracts and 16 are growth.',
  },
  {
    id: 'm01-obj-k3', type: 'num', kind: 'numerical',
    prompt: 'A fictional subscription-box company has 5,000 subscribers at the start of the year and a fixed year-end target. How many fewer new subscribers does it need to win if its retention rate rises from 60% to 65%?',
    answer: 250, check: () => 5000 * 0.65 - 5000 * 0.60, tol: 0.5, unit: 'subscribers', places: 0,
    wrong: [
      { value: 5, say: 'That is the change in percentage points. Apply it to the 5,000 subscribers: 5% of 5,000.' },
      { value: 3250, say: 'That is how many subscribers it keeps at 65%. The question asks for the difference from 60%.' },
    ],
    solution: 'At 60% it keeps 3,000 subscribers; at 65% it keeps 3,250. With the same target, it needs 3,250 − 3,000 = 250 fewer new subscribers: each point of retention is worth 1% of the starting base, here 50 subscribers.',
  },
  {
    id: 'm01-obj-k4', type: 'classify', kind: 'conceptual',
    prompt: 'Which SMART test does each objective most clearly fail?',
    items: [
      'Raise awareness of the brand among small businesses by June 2027',
      'Increase the share of trial users who become paying customers from 8% to 10%',
      'Double the number of paying customers in the next four weeks, for a firm that grew 3% last year',
      'Gain 5,000 new followers on a video app by March, for a firm that sells only to hospitals',
    ],
    categories: ['Measurable', 'Achievable', 'Relevant', 'Time-bound'],
    answer: [0, 3, 1, 2],
    feedback: {
      0: 'It has a date and a group, but no measure or level: raised from what, to what, measured how?',
      1: 'It is specific and measurable, but there is no date or period.',
      3: 'Hospital buyers are unlikely to be won through a consumer video app; the objective doesn’t serve the goal.',
    },
    solution: 'Awareness with no measure or level fails Measurable. The trial-conversion objective has no date: Time-bound. Doubling in four weeks after 3% growth in a year is not Achievable. Video-app followers for a firm selling to hospitals is not Relevant.',
  },
  {
    id: 'm01-obj-k5', type: 'mc', kind: 'applied',
    prompt: 'A fictional events venue sets three objectives for next year: raise its room-hire prices by 15%, double the share of enquiries it converts into bookings, and keep every one of its regular corporate clients. What is the main problem with this set?',
    options: [
      'The objectives pull against each other: a 15% price rise makes converting enquiries and keeping clients harder',
      'None of the three objectives can be measured, because they give no numbers for the venue to aim at',
      'Three objectives are too few for a business plan; a venue should set at least ten objectives',
      'Price objectives belong to the finance department, so the price rise should be left out of the marketing plan',
    ],
    answer: 0,
    feedback: {
      1: 'Each one is measurable: 15%, double the conversion rate, 100% retention. The problem is how they interact.',
      2: 'Three to five objectives are easier to pursue than ten. The number isn’t the problem.',
      3: 'Price is a marketing-mix decision, and its effect on customers is exactly what marketing objectives must take into account.',
    },
    why: 'Objectives must be consistent with each other; checking each pair shows that the price rise works against the other two.',
    solution: 'Each objective is measurable, but together they are inconsistent: a higher price usually lowers conversion and retention. The venue should decide which lever matters most, set realistic levels for the others given the price rise (for example 90% retention), and track them together.',
  },
  {
    id: 'm01-obj-k6', type: 'num', kind: 'applied',
    prompt: 'A fictional college wants 120 students to enrol on a new course. From past years: 25% of enquiries become applications, 60% of applications get an offer, 50% of offers are accepted, and 80% of those who accept actually enrol. How many enquiries does it need?',
    answer: 2000, check: () => 120 / (0.25 * 0.60 * 0.50 * 0.80), tol: 0.5, unit: 'enquiries', places: 0,
    wrong: [
      { value: 1600, say: 'You left out the last stage: only 80% of those who accept actually enrol.' },
      { value: 480, say: 'That uses only the first stage. Divide by all four rates multiplied together: 0.25 × 0.60 × 0.50 × 0.80 = 0.06.' },
    ],
    solution: 'Each enquiry becomes an enrolment with probability 0.25 × 0.60 × 0.50 × 0.80 = 0.06. Enquiries needed = 120 ÷ 0.06 = 2,000. Check: 2,000 → 500 applications → 300 offers → 150 acceptances → 120 enrolments.',
  },
];
