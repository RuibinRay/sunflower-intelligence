// competitive-advantage.ex.js — M01 · Competitive advantage: widgets, practice and the knowledge check.
// Answer keys live here, not in the page's HTML. Every business is fictional; every number is recomputed by `check`
// (see ../AUTHORING.md). The choice of Lantern's strategy is left to the course project.

const usd = (x) => `${x < 0 ? '−' : ''}$${Math.abs(Math.round(x)).toLocaleString('en-US')}`;

export const widgets = {
  'ca-value-stick': {
    type: 'formula',
    title: 'Value created and the highest winning price',
    intro: 'All amounts are per customer per month. A customer chooses the option that leaves them the most: willingness to pay minus price. Defaults: Orchard Works (your business) against Bellweather Desks (the rival).',
    inputs: [
      { id: 'wf', label: 'Your customers’ willingness to pay', min: 200, max: 600, step: 10, value: 420, fmt: 'money' },
      { id: 'cf', label: 'Your cost of serving a customer', min: 100, max: 500, step: 10, value: 250, fmt: 'money' },
      { id: 'wr', label: 'Willingness to pay for the rival', min: 200, max: 600, step: 10, value: 340, fmt: 'money' },
      { id: 'cr', label: 'The rival’s cost of serving a customer', min: 100, max: 500, step: 10, value: 200, fmt: 'money' },
      { id: 'pr', label: 'The rival’s price', min: 150, max: 600, step: 10, value: 300, fmt: 'money' },
    ],
    compute: (v) => {
      if (v.pr > v.wr) return { error: 'The rival’s price is above what customers would pay for it, so it would sell nothing. Lower the rival’s price or raise its customers’ willingness to pay.' };
      const vf = v.wf - v.cf, vr = v.wr - v.cr;
      const surplusR = v.wr - v.pr;
      const pmax = v.pr + (v.wf - v.wr);
      if (pmax <= 0) return { error: 'Customers value the rival’s offer so much more than yours that even a free offer from you would leave them worse off than buying from the rival: no price wins them. Raise your customers’ willingness to pay, or lower their willingness to pay for the rival.' };
      const mf = pmax - v.cf, mr = v.pr - v.cr;
      const prem = (pmax / v.pr - 1) * 100;
      const who = vf > vr ? 'You create more value than the rival: you have the competitive advantage.'
        : vf < vr ? 'The rival creates more value than you: it has the competitive advantage.'
          : 'You and the rival create the same value: neither has an advantage.';
      return {
        headline: { label: 'Highest price that still wins the customer', value: usd(pmax) },
        rows: [
          ['Value you create (willingness to pay − cost)', usd(vf)],
          ['Value the rival creates', usd(vr)],
          ['What the rival leaves the customer', usd(surplusR)],
          ['Your margin at the highest winning price', usd(mf)],
          ['The rival’s margin at its price', usd(mr)],
          ['Your premium over the rival at that price', `${prem >= 0 ? '' : '−'}${Math.abs(prem).toFixed(1)}%`],
        ],
        note: mf < 0
          ? `${who} But at ${usd(pmax)} you would lose ${usd(-mf)} on every customer: you can’t win this customer profitably.`
          : `${who} Your sustainable price gap in dollars equals the gap in willingness to pay (${usd(v.wf - v.wr)}); if the rival cuts its price, your ceiling falls by the same amount.`,
        chart: {
          kind: 'bar',
          x: { label: 'Business', values: ['Your business', 'Rival'] },
          series: [
            { name: 'Value created ($)', values: [vf, vr] },
            { name: 'Margin ($)', values: [mf, mr] },
            { name: 'Customer keeps ($)', values: [v.wf - pmax, surplusR] },
          ],
          y: { label: '$ per customer per month' },
        },
      };
    },
  },
};

const GENERIC = ['Cost leadership', 'Differentiation', 'Cost focus', 'Differentiation focus'];

export const guided = [
  {
    id: 'm01-ca-g1', type: 'classify', kind: 'conceptual',
    prompt: 'Which of Porter’s generic strategies is each fictional business following?',
    items: [
      'An airline with one type of aircraft, no free meals and the lowest fares on every route it flies',
      'A furniture maker selling a full range, from sofas to office desks, to households and businesses nationwide at above-average prices, on the strength of its design and a 25-year guarantee',
      'A bakery that makes only gluten-free bread, at premium prices, for people who can’t eat gluten',
      'A uniform supplier serving only schools, with the lowest prices in that niche from a few standard designs made in long runs',
      'A software firm whose accounting package has features no rival offers, sold to businesses of every size',
      'A builders’ merchant serving only small trade customers, with low prices from a no-frills warehouse',
    ],
    categories: GENERIC,
    answer: [0, 1, 3, 2, 1, 2],
    hints: [
      'Ask two questions of each: is the advantage low cost or something customers value and pay more for? And does the business serve many customer segments or just one?',
      'Scope means the range of customer segments served, not geography. Schools and small trade customers are single segments; households and businesses of every kind, or businesses of every size, are many.',
    ],
    feedback: {
      2: 'One segment (people who can’t eat gluten), served with something they value and pay more for: differentiation focus.',
      3: 'One segment (schools), served at the lowest cost through standard designs and long runs: cost focus.',
      5: 'A narrow target (small trade customers) with a low-cost model: cost focus, not broad cost leadership.',
    },
    solution: 'Cost leadership: the airline. Differentiation: the furniture maker and the software firm (unique, valued, many segments). Cost focus: the uniform supplier and the builders’ merchant (lowest cost for one segment). Differentiation focus: the gluten-free bakery (unique for one segment).',
  },
  {
    id: 'm01-ca-g2', type: 'steps', kind: 'numerical',
    prompt: 'Two fictional driving schools compete for learners. School A charges $40 a lesson; it costs $28 to provide one, and a typical learner would pay up to $50 for it. School B uses newer cars and instructors with better pass rates; a lesson costs it $33 to provide, and a typical learner would pay up to $60. Work through the value stick.',
    solution: 'Value created per lesson: B 60 − 33 = $27, A 50 − 28 = $22, so B has the advantage. A leaves a learner 50 − 40 = $10, so B can charge up to 60 − 10 = $50 (the rival’s $40 plus the $10 gap in willingness to pay) and earn 50 − 33 = $17 a lesson against A’s 40 − 28 = $12.',
    steps: [
      { id: 'm01-ca-g2-s1', type: 'num',
        prompt: 'How much value does School B create per lesson?',
        answer: 27, check: () => 60 - 33, tol: 0.5, unit: '$', places: 0,
        hints: ['Value created = willingness to pay − cost. The price doesn’t enter.', '60 − 33.'],
        wrong: [{ value: 22, say: 'That is School A’s value created (50 − 28). Use School B’s figures.' }] },
      { id: 'm01-ca-g2-s2', type: 'num',
        prompt: 'What is the highest price School B can charge and still leave a typical learner at least as well off as School A does?',
        answer: 50, check: () => 40 + (60 - 50), tol: 0.5, unit: '$', places: 0,
        hints: ['School A leaves the learner 50 − 40 = $10. School B must leave at least that much.', '60 − 10, or equivalently 40 + (60 − 50).'],
        wrong: [
          { value: 60, say: 'At $60 the learner keeps nothing with School B but $10 with School A, so would choose A.' },
          { value: 40, say: 'Matching A’s price wins the learner, but B can charge more: learners value B’s lessons $10 more.' },
        ] },
      { id: 'm01-ca-g2-s3', type: 'num',
        prompt: 'What is School B’s margin per lesson at that price?',
        answer: 17, check: () => (40 + (60 - 50)) - 33, tol: 0.5, unit: '$', places: 0,
        hints: ['Margin = price − cost.', '50 − 33.'],
        wrong: [{ value: 27, say: 'That is the whole value created. At $50 the learner keeps $10 of it; B keeps the rest.' }] },
      { id: 'm01-ca-g2-s4', type: 'mc',
        prompt: 'What does the comparison show?',
        options: [
          'School B: it creates more value per lesson, though it costs more to run',
          'School A has the advantage, because it is cheaper to run and charges less',
          'Neither has an advantage, because both leave learners exactly $10 at those prices',
          'School B has the advantage only if it charges the same $40 as School A',
        ],
        answer: 0,
        hints: ['Compare value created: 27 against 22.', 'A higher cost doesn’t rule out an advantage if willingness to pay rises by more.'],
        feedback: {
          1: 'A is cheaper to run, but learners value its lessons $10 less, more than its $5 cost saving. It creates less value.',
          2: 'Leaving learners the same $10 is what makes B’s $50 the winning price. The advantage shows in the margins: $17 against $12.',
          3: 'At $40 B would still win learners, but it would hand them $10 of value it could have kept.',
        } },
    ],
  },
  {
    id: 'm01-ca-g3', type: 'mc', kind: 'applied',
    prompt: 'A fictional city hotel lists four things it believes give it an edge. Which is most likely to be a source of sustained competitive advantage?',
    options: [
      'A 40-year deal under which the city’s conference centre books its speakers into the hotel',
      'New mattresses in every room, bought from the supplier that the city’s other hotels also use',
      'A booking website built on a standard platform that any hotel can buy and set up in a week',
      'A 10% discount for guests who book directly, which any rival could copy the next morning',
    ],
    answer: 0,
    hints: ['Run each through VRIO: valuable, rare, hard to imitate, organised to use.', 'Which one could a rival not buy or copy quickly?'],
    feedback: {
      1: 'Valuable, but not rare: rivals buy the same mattresses. That is competitive parity.',
      2: 'A standard platform anyone can buy is neither rare nor hard to imitate.',
      3: 'A discount is easy to copy and moves value to guests rather than creating it.',
    },
    why: 'The arrangement is valuable, rare and hard to copy because it rests on a long history and a relationship, the kinds of resource rivals can’t buy.',
    solution: 'Only the conference-centre arrangement passes the rarity and imitability tests: it was built over 40 years and rests on a relationship. It still needs the O of VRIO: the hotel must be organised to keep the arrangement working and to make the most of the guests it brings.',
  },
  {
    id: 'm01-ca-g4', type: 'num', kind: 'numerical',
    prompt: 'A fictional organic vegetable-box company charges $31.20 a week; a supermarket’s comparable box costs $24. What is the organic company’s price premium? Give a percentage.',
    answer: 30, check: () => (31.20 / 24 - 1) * 100, tol: 0.05, unit: '%', places: 1,
    hints: ['The premium is measured against the rival’s price.', '(31.20 ÷ 24 − 1) × 100.'],
    wrong: [
      { value: 23.1, say: 'You divided the $7.20 gap by the company’s own price. The premium is measured against the rival’s price: 7.20 ÷ 24.' },
      { value: 7.2, say: 'That is the gap in dollars. Express it as a percentage of the rival’s price.' },
    ],
    solution: 'Premium = (31.20 ÷ 24 − 1) × 100 = (1.30 − 1) × 100 = 30%. Equivalently, the $7.20 gap is 30% of the supermarket’s $24.',
  },
];

export const independent = [
  {
    id: 'm01-ca-i1', type: 'num', kind: 'numerical',
    prompt: 'A rival’s accounting software is priced at $40 a month, and a typical small business would pay up to $55 a month for it. The same business would pay up to $70 for a fictional firm’s software. What is the highest monthly price at which the firm still leaves the business at least as well off as the rival does?',
    answer: 55, check: () => 40 + (70 - 55), tol: 0.5, unit: '$', places: 0,
    wrong: [
      { value: 70, say: 'At $70 the business keeps nothing with the firm, but $15 with the rival, so it would choose the rival.' },
      { value: 40, say: 'Matching the rival’s price wins the business but gives away the $15 extra it values the firm’s software at.' },
      { value: 15, say: 'That is the gap in willingness to pay: the premium in dollars. Add it to the rival’s price.' },
    ],
    solution: 'The rival leaves the business 55 − 40 = $15. The firm must leave at least $15, so its highest price is 70 − 15 = $55, which is the rival’s $40 plus the $15 gap in willingness to pay.',
  },
  {
    id: 'm01-ca-i2', type: 'classify', kind: 'applied',
    prompt: 'A fictional engineering firm runs VRIO on five of its resources. What does VRIO conclude about each?',
    items: [
      'A city-centre showroom that its business customers never visit',
      'Design software that every rival firm also uses',
      'A popular new feature in its client app that rivals could copy within months',
      'A reputation for safety built over 50 years, managed by a team that keeps it in every proposal',
      'A patent on a cheaper process that the firm has not yet used in its work or mentioned to clients',
    ],
    categories: ['No advantage', 'Competitive parity', 'Temporary advantage', 'Sustained advantage', 'Unexploited advantage'],
    answer: [0, 1, 2, 3, 4],
    feedback: {
      0: 'It fails the first question: it doesn’t help the firm win or serve its customers. It is a cost, not an advantage.',
      2: 'Valuable and rare for now, but easy to copy: the lead lasts only until rivals catch up.',
      4: 'Valuable, rare and protected, but the firm isn’t organised to use it yet: the O of VRIO.',
    },
    solution: 'Showroom: not valuable to these customers, so no advantage. Common software: valuable but not rare, so parity. The app feature: valuable and rare but easy to copy, so temporary. The 50-year reputation, organised and used: sustained. The unused patent: valuable, rare and hard to imitate, but unexploited until the firm organises to use it.',
  },
  {
    id: 'm01-ca-i3', type: 'mc', kind: 'conceptual',
    prompt: 'A fictional restaurant chain cut its prices to compete with fast-food outlets and, at the same time, added table service and a longer menu to compete with fine dining. Its costs rose as its prices fell, and diners of both kinds went elsewhere. In Porter’s terms, what happened?',
    options: [
      'It became stuck in the middle: neither cheap nor distinctive enough for either kind of diner',
      'It moved into cost focus, because it narrowed its target to a single segment of diners',
      'It moved into differentiation focus, because it added service that only some diners value',
      'It achieved cost leadership, because it now charges the lowest prices among sit-down restaurants',
    ],
    answer: 0,
    feedback: {
      1: 'It did the opposite of narrowing: it tried to serve both fast-food and fine-dining customers.',
      2: 'Focus means serving one segment especially well. The chain tried to serve two at once, and served neither well.',
      3: 'Cost leadership needs the lowest costs, not just low prices. Its costs rose.',
    },
    solution: 'The chain pursued low price and differentiation at once without the cost base for the first or a clear difference for the second: Porter’s “stuck in the middle”. Hill (1988) argued that cost and differentiation can sometimes be combined, but that needs a mechanism, such as the scale a popular differentiated product can bring, not price cuts made while costs rise.',
  },
  {
    id: 'm01-ca-i4', type: 'multi', kind: 'conceptual',
    prompt: 'Which of these are likely sources of a cost advantage? Select all that apply.',
    options: [
      'Economies of scale from serving many more customers than rivals',
      'A simpler, standardised offer',
      'Cheaper inputs through long-term contracts with suppliers',
      'Experienced staff who do the work faster and waste less',
      'A better-known brand than any rival, built up over many years of advertising',
      'A wider range of products than any rival, so customers find everything in one place',
    ],
    answer: [0, 1, 2, 3],
    feedback: {
      4: 'A strong brand raises willingness to pay: it is a source of differentiation, and it usually costs money to build.',
      5: 'A wider range usually raises costs (more stock, more processes). It can differentiate, but it rarely lowers cost.',
    },
    solution: 'Scale spreads fixed costs; standardisation cuts complexity; supply contracts lower input prices; experience makes work faster and less wasteful. A famous brand and a wide range raise what customers will pay, or what they can choose from, not the cost of serving them.',
  },
  {
    id: 'm01-ca-i5', type: 'short', kind: 'applied',
    prompt: 'A fictional independent bookshop in a small town faces an online retailer that sells the same new books about 25% cheaper. The shop has knowledgeable staff, hosts author events and runs a children’s reading club. Using the value stick and Porter’s generic strategies, explain two ways the shop could compete and the main risk of each, then recommend one and say what evidence would confirm it.',
    rubric: [
      'Explains why competing on price is unlikely to work without a cost advantage (the online retailer’s scale), using the idea that a price cut only moves value to the customer.',
      'Describes a differentiation or differentiation-focus route based on what some customers value (advice, events, the club) and how it raises willingness to pay or lowers other costs to the customer.',
      'Gives a credible risk for each route (for example a price war the shop can’t win; a segment too small, or customers who browse in the shop and buy online).',
      'Recommends one route and names evidence that would confirm it, such as how many customers attend events and then buy, or what families would pay for the club.',
    ],
    model: 'A price route would mean cutting towards the online price. The value stick shows why that is dangerous: a price cut only moves value from the shop to the customer, and the online retailer’s scale gives it far lower costs, so it can always cut further. The shop would lose its margin without gaining an advantage. The alternative is differentiation focus: serve the customers who value what an online retailer can’t offer, such as parents who want help choosing books, readers who come to author events and children in the reading club. For them, willingness to pay for buying in the shop is higher, because the advice and the events are part of what they get. The risk is that this group is too small, or that people enjoy the events and then buy the books online. I would recommend differentiation focus, tied to buying in the shop: signed copies at events, club members’ orders through the shop, recommendations that come with the sale. Evidence to confirm it: the share of event attendees and club families who buy in the shop over three months, and whether a modest club fee is accepted.',
  },
  {
    id: 'm01-ca-i6', type: 'num', kind: 'numerical',
    prompt: 'A fictional maker of premium office chairs sells a chair for $500; each costs it $300 to make and deliver. A rival sells a cheaper chair for $420. If the premium maker matched the rival’s price, what percentage of its margin per chair would it give up?',
    answer: 40, check: () => (500 - 420) / (500 - 300) * 100, tol: 0.05, unit: '%', places: 1,
    wrong: [
      { value: 16, say: 'That is the $80 cut as a share of the price. The question asks about the margin: $80 of the $200 margin.' },
      { value: 80, say: 'That is the margin given up in dollars per chair. Express it as a share of the $200 margin.' },
    ],
    solution: 'Margin now: 500 − 300 = $200. Margin at $420: 420 − 300 = $120. Given up: $80, which is 80 ÷ 200 = 40% of the margin, although the price fell by only 16%. That is why matching a cheaper rival’s price is so expensive for a firm without a cost advantage.',
  },
];

export const check = [
  {
    id: 'm01-ca-k1', type: 'mc', kind: 'conceptual',
    prompt: 'Which statement best describes a competitive advantage?',
    options: [
      'Creating more value than rivals: a wider gap between willingness to pay and cost',
      'Charging a lower price than every rival, whatever it costs the business to serve its customers',
      'Having more customers than any rival, measured by market share in the most recent year',
      'Spending more on advertising than rivals, so that customers hear about the business first',
    ],
    answer: 0,
    feedback: {
      1: 'A low price without lower costs only moves value to customers, and rivals can match it. It is not an advantage in itself.',
      2: 'Market share can be a result of an advantage, or of years of underpricing. It doesn’t say where the advantage comes from.',
      3: 'Advertising may make an advantage visible, but spending more isn’t one, and rivals can match it.',
    },
    solution: 'A business has a competitive advantage when it creates more value than its rivals: customers would pay more for its offer relative to what it costs to provide. That lets it win customers, earn higher margins, or both.',
  },
  {
    id: 'm01-ca-k2', type: 'num', kind: 'numerical',
    prompt: 'A fictional hairdresser charges $57.50 for a cut; the salon across the road charges $50. What is the first hairdresser’s price premium? Give a percentage.',
    answer: 15, check: () => (57.50 / 50 - 1) * 100, tol: 0.05, unit: '%', places: 1,
    wrong: [
      { value: 13, say: 'You divided the $7.50 gap by the hairdresser’s own price. The premium is measured against the rival’s price: 7.50 ÷ 50.' },
      { value: 7.5, say: 'That is the gap in dollars. Express it as a percentage of the rival’s $50.' },
    ],
    solution: 'Premium = (57.50 ÷ 50 − 1) × 100 = 15%. The $7.50 gap is 15% of the rival’s price (and about 13% of the hairdresser’s own, which is why the base must be stated).',
  },
  {
    id: 'm01-ca-k3', type: 'classify', kind: 'conceptual',
    prompt: 'Which generic strategy is each fictional business following?',
    items: [
      'A budget hotel chain with small rooms, self-check-in and the lowest rates in every city it serves',
      'A hotel for travellers with dogs, with dog beds, a walking service and premium rates',
      'A car maker whose cars sell at premium prices across the whole market on the strength of their safety record',
      'A printer serving only local estate agents, keeping prices low with standard templates printed in bulk',
    ],
    categories: GENERIC,
    answer: [0, 3, 1, 2],
    feedback: {
      1: 'One segment (travellers with dogs), served with something they value and pay more for: differentiation focus.',
      3: 'One segment (estate agents), served at low cost through standardisation: cost focus.',
    },
    solution: 'Budget hotel: cost leadership. Dog-friendly hotel: differentiation focus. Safety-led car maker: differentiation across the market. Estate agents’ printer: cost focus.',
  },
  {
    id: 'm01-ca-k4', type: 'mc', kind: 'applied',
    prompt: 'A fictional engineering firm’s best team has worked together for 15 years and solves problems no rival can. But the firm assigns the team to routine jobs and never mentions it in proposals. What does VRIO conclude about the team?',
    options: [
      'Valuable, rare and hard to copy, but not organised for use: an unused advantage',
      'It is not valuable, because customers don’t know about it and so won’t pay more for it',
      'It is easy to imitate, because any rival could hire engineers with similar qualifications',
      'It is already a sustained advantage, whatever the firm does with it, because it is rare',
    ],
    answer: 0,
    feedback: {
      1: 'The capability would be valuable to customers if they saw it; that customers don’t know about it is a failure of organisation, the O of VRIO.',
      2: 'Rivals can hire qualified engineers, but not a team with 15 years of working together: history and social complexity make it hard to copy.',
      3: 'VRIO’s fourth question exists for this case: a rare, hard-to-copy resource that isn’t used gives no advantage.',
    },
    solution: 'The team passes value, rarity and imitability: 15 years of shared experience can’t be bought. It fails organisation: the firm neither deploys it on the work where it matters nor tells clients about it. Fixing that (assigning the team to complex bids, featuring its record in proposals) would turn an unused advantage into a real one.',
  },
  {
    id: 'm01-ca-k5', type: 'num', kind: 'applied',
    prompt: 'A rival charges $70 for a service that a typical customer would pay up to $90 for. A fictional firm’s version costs it $60 to provide, and the same customer would pay up to $110 for it. What is the highest price the firm can charge and still leave the customer at least as well off as the rival does?',
    answer: 90, check: () => 70 + (110 - 90), tol: 0.5, unit: '$', places: 0,
    wrong: [
      { value: 110, say: 'At $110 the customer keeps nothing with the firm but $20 with the rival.' },
      { value: 70, say: 'Matching the rival wins the customer but gives away the $20 extra the customer values the firm’s service at.' },
      { value: 50, say: 'That is the value the firm creates (110 − 60). The question asks for the highest winning price.' },
    ],
    solution: 'The rival leaves the customer 90 − 70 = $20. The firm must leave at least $20: 110 − 20 = $90, the rival’s $70 plus the $20 gap in willingness to pay. At $90 the firm’s margin is 90 − 60 = $30, against the rival’s unknown margin.',
  },
  {
    id: 'm01-ca-k6', type: 'multi', kind: 'conceptual',
    prompt: 'Which statements about competing on price and on value are correct? Select all that apply.',
    options: [
      'A firm without a cost advantage that matches a cheaper rival’s price gives up margin on every sale.',
      'Differentiation pays only if customers value the difference by more than it costs to provide.',
      'Porter’s focus strategies serve a narrow segment, through either lower cost or differentiation.',
      'Any resource a firm owns, such as its equipment or its premises, is a source of sustained competitive advantage.',
      'A higher price always means that the customer gets less value than they would get from a cheaper rival.',
    ],
    answer: [0, 1, 2],
    feedback: {
      3: 'Only resources that are valuable, rare, hard to imitate and organised for use give a sustained advantage (VRIO).',
      4: 'Customers compare willingness to pay minus price. A dearer offer they value much more can leave them better off.',
    },
    solution: 'Matching a price without lower costs only transfers margin to customers; differentiation must be worth more to customers than it costs; and focus is a narrow scope with either source of advantage. Owning a resource is not enough (VRIO), and a higher price can still be better value.',
  },
];
