// business-buying.ex.js — M01 · How organisations buy: widgets, practice and the knowledge check.
// Answer keys live here, not in the page's HTML. Every organisation, person and figure is fictional unless the lesson
// cites a source; every number is recomputed by `check` (see ../AUTHORING.md). Harbor Tech's buying-centre map is
// left to the course project, so no item here asks for it.

const SITUATIONS = ['Straight rebuy', 'Modified rebuy', 'New task'];
const ROLES = ['Initiator', 'User', 'Influencer', 'Buyer', 'Decider', 'Gatekeeper'];
const vans = (x) => { const r = Math.round(x * 10) / 10; return r.toLocaleString('en-US', { maximumFractionDigits: 1 }); };

/** Units needed and ordered each year: orders = units needed − units still in service after retirements (never below 0). */
function path(K0, d, growth) {
  let need = K0, act = K0;
  return growth.map((g) => {
    need *= 1 + g;
    const inService = act * (1 - d);
    const now = Math.max(need, inService);
    const out = { need, inService, orders: now - inService, idle: now - need };
    act = now;
    return out;
  });
}

export const widgets = {
  'bb-accelerator': {
    type: 'formula',
    title: 'The acceleration effect: a courier’s van orders',
    intro: 'The vans a courier needs are proportional to its parcel volume. Each year a share of the fleet wears out and is retired; the courier orders enough vans to meet its needs and never sells spare vans.',
    inputs: [
      { id: 'K0', label: 'Vans in the fleet at the start', min: 20, max: 500, step: 10, value: 100, fmt: 'int', unit: 'vans' },
      { id: 'd', label: 'Share of the fleet retired each year', min: 0, max: 30, step: 1, value: 10, fmt: 'pct' },
      { id: 'g1', label: 'Change in parcels, year 1', min: -20, max: 30, step: 1, value: 10, fmt: 'pct' },
      { id: 'g2', label: 'Change in parcels, year 2', min: -20, max: 30, step: 1, value: 0, fmt: 'pct' },
      { id: 'g3', label: 'Change in parcels, year 3', min: -20, max: 30, step: 1, value: -10, fmt: 'pct' },
    ],
    compute: (v) => {
      const d = v.d / 100;
      const p = path(v.K0, d, [v.g1 / 100, v.g2 / 100, v.g3 / 100]);
      const normal = d * v.K0;
      const vsNormal = (o) => (normal > 1e-9 ? `${o >= normal ? '+' : '−'}${Math.round(Math.abs(o / normal - 1) * 100)}% against a normal year` : 'no normal replacement to compare with');
      const idle = p.reduce((m, y) => Math.max(m, y.idle), 0);
      const sign = (g) => `${g > 0 ? '+' : g < 0 ? '−' : ''}${Math.abs(g)}%`;
      return {
        headline: { label: 'Vans ordered in years 1, 2 and 3', value: p.map((y) => vans(y.orders)).join(' → ') },
        rows: [
          ['Normal year (replacements only)', `${vans(normal)} vans`],
          ...p.map((y, i) => [`Year ${i + 1}: parcels ${sign([v.g1, v.g2, v.g3][i])}`, `${vans(y.orders)} vans (${vsNormal(y.orders)})`]),
          ['Most spare vans in any year', `${vans(idle)} vans`],
        ],
        note: idle > 1e-9
          ? `Parcels fell faster than vans wore out, so the courier was left with spare vans and ordered nothing. That is when a van maker’s sales collapse, although its customer is still delivering most of its parcels.`
          : `Parcels changed by ${sign(v.g1)}, ${sign(v.g2)} and ${sign(v.g3)}, but van orders swung far more, because orders depend on the change in parcel volume, not its level. The less of the fleet is retired each year, the wilder the swings.`,
        chart: {
          kind: 'bar',
          x: { label: 'Year', values: ['Normal year', 'Year 1', 'Year 2', 'Year 3'] },
          series: [{ name: 'Vans ordered', values: [normal, ...p.map((y) => y.orders)].map((x) => Math.round(x * 10) / 10) }],
          y: { label: 'Vans ordered' },
        },
      };
    },
  },
};

export const guided = [
  {
    id: 'm01-bb-g1', type: 'classify', kind: 'conceptual',
    prompt: 'Classify each organisational purchase as a straight rebuy, a modified rebuy or a new task.',
    items: [
      'A school reorders printer paper from its usual stationer through the same online account.',
      'A hotel chain asks its laundry contractor and two rivals to quote again after complaints about stained sheets.',
      'A city council buys its first electric buses.',
      'A restaurant group keeps its wine merchant but switches to a cheaper house wine from the same list.',
      'A software company buys cyber-security insurance for the first time because a large client demands it.',
    ],
    categories: SITUATIONS,
    answer: [0, 1, 2, 1, 2],
    hints: [
      'Ask whether the organisation has bought this before and, if so, whether anything about the purchase is changing.',
      'Changing the product within the same supplier’s range still changes the specification: that is a modification, not a routine reorder.',
    ],
    feedback: {
      1: 'The hotel has bought laundry services before, but it is reopening the supplier and the terms: a modified rebuy.',
      3: 'Same supplier, but a different product: the specification has changed, so it is a modified rebuy.',
      4: 'The company has never bought this kind of cover, so it must learn what it needs and who offers it: a new task.',
    },
    solution: 'Printer paper: straight rebuy. The laundry contract and the house wine: modified rebuys (the terms or the specification change). The electric buses and the cyber-security insurance: new tasks, bought for the first time, with the most information search and the most people involved.',
  },
  {
    id: 'm01-bb-g2', type: 'steps', kind: 'numerical',
    prompt: 'A fictional bakery chain has 50 ovens and retires 10% of them each year as they wear out. The number of ovens it needs is proportional to the bread it sells. Next year it expects to sell 20% more bread; the year after, the same amount again.',
    solution: 'Normal year: 0.1 × 50 = 5 ovens. Year 1: it needs 50 × 1.2 = 60 ovens, has 50 × 0.9 = 45 still in service, and orders 60 − 45 = 15, three times the normal 5. Year 2: it still needs 60, has 60 × 0.9 = 54 in service, and orders 60 − 54 = 6, a fall of 60% from 15 although bread sales did not fall at all.',
    steps: [
      { id: 'm01-bb-g2-s1', type: 'num',
        prompt: 'In a normal year, with no change in bread sales, how many ovens does the chain order?',
        answer: 5, check: () => 0.1 * 50, tol: 0.05, unit: 'ovens', places: 0,
        hints: ['In a normal year it only replaces the ovens that wear out.', '10% of 50.'],
        wrong: [{ value: 50, say: 'That is the whole fleet. Only the 10% that wear out need replacing.' }] },
      { id: 'm01-bb-g2-s2', type: 'num',
        prompt: 'With 20% more bread next year, how many ovens does it order?',
        answer: 15, check: () => 50 * 1.2 - 50 * 0.9, tol: 0.05, unit: 'ovens', places: 0,
        hints: ['Ovens needed: 50 × 1.2 = 60. Ovens still in service after retirements: 50 × 0.9 = 45.', 'Orders = ovens needed − ovens still in service.'],
        wrong: [
          { value: 10, say: 'That is only the growth (60 − 50). The chain must also replace the 5 ovens that wear out.' },
          { value: 6, say: 'That is 20% more than the normal 5. Orders depend on the extra ovens needed, not on growing the replacement order by 20%.' },
          { value: 60, say: 'That is the number of ovens needed in total. Most of them are already in service.' },
        ] },
      { id: 'm01-bb-g2-s3', type: 'num',
        prompt: 'The year after, bread sales stay the same. How many ovens does it order then?',
        answer: 6, check: () => 60 - 60 * 0.9, tol: 0.05, unit: 'ovens', places: 0,
        hints: ['It still needs 60 ovens, and now retires 10% of 60.', '60 − 60 × 0.9.'],
        wrong: [
          { value: 15, say: 'That would need another 20% growth in bread sales. With flat sales, the chain only replaces worn-out ovens.' },
          { value: 5, say: 'The fleet is now 60, so 10% of it is 6, not 5.' },
        ] },
    ],
  },
  {
    id: 'm01-bb-g3', type: 'classify', kind: 'applied',
    prompt: 'A fictional university department is replacing its laboratory freezers. Classify each person or group by the role they mainly play in this purchase.',
    items: [
      'A researcher whose samples were ruined when an old freezer failed, and who asked for all the freezers to be replaced',
      'The 30 researchers and technicians who will store their samples in the new freezers',
      'The laboratory safety officer, who writes the alarm and temperature-monitoring requirements into the specification',
      'The university’s purchasing officer, who requests quotes and negotiates the terms',
      'The head of department, who must sign off any equipment purchase over $20,000',
      'The department administrator, who screens calls from suppliers’ sales representatives',
    ],
    categories: ROLES,
    answer: [0, 1, 2, 3, 4, 5],
    hints: [
      'Ask what each person does in this purchase: start it, use the product, shape the specification, deal with suppliers, approve it, or control access.',
      'The researcher who asked for the replacement will also be a user, but her distinctive part in this purchase is starting it.',
    ],
    feedback: {
      0: 'She will use a freezer too, but what sets her apart is that she started the purchase: the initiator.',
      2: 'Writing requirements into the specification shapes the choice without making it: an influencer.',
      5: 'Deciding which sales calls get through controls access to the others: a gatekeeper, whatever the job title.',
    },
    solution: 'The researcher who asked for the replacement is the initiator (and a user). The researchers and technicians are the users. The safety officer is an influencer. The purchasing officer is the buyer. The head of department, with the power to approve, is the decider. The administrator is the gatekeeper.',
  },
  {
    id: 'm01-bb-g4', type: 'mc', kind: 'applied',
    prompt: 'A fictional manufacturer’s purchasing policy says: up to $5,000, any manager may buy with one quote; from $5,000 to $50,000, three written quotes and the head of purchasing’s approval are needed; above $50,000, a formal request for proposal and the finance director’s approval. A salesperson has persuaded the plant manager to buy a $38,000 conveyor upgrade. What should she expect next?',
    options: [
      'Two competing quotes will be sought, and the head of purchasing must approve, so the plant manager can’t simply sign.',
      'The plant manager can sign the order straight away, because he is already convinced and the budget is his.',
      'A formal request for proposal will be issued, and the finance director will make the final decision on it.',
      'Nothing more: once a supplier has been chosen by a manager, the policy no longer requires any quotes.',
    ],
    answer: 0,
    hints: [
      'Find the band that $38,000 falls into.',
      'The policy decides who approves and how many quotes are needed, whatever the plant manager thinks.',
    ],
    feedback: {
      1: 'The plant manager’s limit under this policy is $5,000. At $38,000 he is an influencer, not the decider.',
      2: 'That applies above $50,000. At $38,000 the rule is three written quotes and the head of purchasing’s approval.',
      3: 'The policy applies whatever a manager prefers; that is its purpose.',
    },
    why: 'At $38,000 the purchase is in the middle band: three written quotes and the head of purchasing’s approval.',
    solution: '$38,000 lies between $5,000 and $50,000, so the manufacturer must get three written quotes (two more besides hers) and the head of purchasing must approve. The salesperson should make sure her quote is complete and competitive on total cost, and that the head of purchasing, now the decider, has what he needs, rather than relying on the plant manager’s enthusiasm.',
  },
];

export const independent = [
  {
    id: 'm01-bb-i1', type: 'multi', kind: 'conceptual',
    prompt: 'Which of these are typical of business markets rather than consumer markets? Select all that apply.',
    options: [
      'Demand is derived from the demand for the buyer’s own products or services.',
      'A few large customers can account for most of a supplier’s sales.',
      'Several people often take part in one purchase decision.',
      'Prices are often negotiated and written into contracts.',
      'Purchases are usually made on impulse by one person.',
      'Sellers reach buyers mainly through mass advertising and retailers.',
    ],
    answer: [0, 1, 2, 3],
    feedback: {
      4: 'Impulse purchases by one person are a feature of low-involvement consumer buying. Organisational purchases are usually planned and shared.',
      5: 'With few, large customers, business sellers rely more on personal selling and direct relationships than on mass advertising through retailers.',
    },
    solution: 'Derived demand, few large customers, shared decisions and negotiated contracts are typical of business markets. Impulse buying and mass advertising through retailers are typical of consumer markets, although the contrasts are tendencies rather than rules.',
  },
  {
    id: 'm01-bb-i2', type: 'num', kind: 'numerical',
    prompt: 'A fictional car-hire firm runs 500 cars and retires 20% of its fleet each year. The number of cars it needs is proportional to its bookings. Next year bookings are expected to fall by 10%. How many new cars will it order?',
    answer: 50, check: () => 500 * 0.9 - 500 * 0.8, tol: 0.5, unit: 'cars', places: 0,
    wrong: [
      { value: 100, say: 'That is a normal year’s replacements. With 10% fewer bookings it needs only 450 cars, and 400 remain in service.' },
      { value: 450, say: 'That is the number of cars it needs in total. Subtract the 400 still in service after retirements.' },
      { value: 0, say: 'The firm needs 450 cars but only 400 remain after it retires 100, so it still orders some.' },
    ],
    solution: 'Cars needed: 500 × 0.9 = 450. Still in service after retiring 20%: 500 × 0.8 = 400. Orders: 450 − 400 = 50, half the normal 100. A 10% fall in bookings halves the car maker’s orders from this firm.',
  },
  {
    id: 'm01-bb-i3', type: 'mc', kind: 'applied',
    prompt: 'A fictional supplier of cleaning products wants to win a hotel group whose current supplier has delivered reliably for years on a standing order. Which approach has the best chance?',
    options: [
      'Show the hotel group a lower total cost or a problem it can solve, giving it a reason to reopen the decision.',
      'Cut its price list and wait for the hotel group’s next routine order to arrive in the normal way.',
      'Send the clerk who places the standing order a generous gift so that she switches the order.',
      'Advertise widely to hotel guests in the hope that they ask the hotels for its products.',
    ],
    answer: 0,
    feedback: {
      1: 'In a straight rebuy the order goes to the in-supplier without anyone looking at other price lists. Nothing reaches the decision until something reopens it.',
      2: 'Gifts meant to win an order break most organisations’ ethics rules and may be illegal. They also go to the wrong person: the clerk places the order but doesn’t choose the supplier.',
      3: 'Hotel guests rarely notice or care about cleaning products. The decision sits inside the hotel group’s buying centre.',
    },
    solution: 'This is a straight rebuy, which favours the in-supplier. An out-supplier must turn it into a modified rebuy by giving the buying centre a reason to reconsider: a lower total cost of ownership, a better result, or a problem the current supplier hasn’t solved, presented to the people who can reopen the decision.',
  },
  {
    id: 'm01-bb-i4', type: 'order', kind: 'conceptual',
    prompt: 'Put the stages of the business buying process in order.',
    items: [
      'Problem recognition',
      'General need description',
      'Product specification',
      'Supplier search',
      'Proposal solicitation',
      'Supplier selection',
      'Order-routine specification',
      'Performance review',
    ],
    solution: 'Problem recognition, general need description, product specification, supplier search, proposal solicitation, supplier selection, order-routine specification, performance review. A new task usually goes through all eight; a straight rebuy skips most of the search and evaluation.',
  },
  {
    id: 'm01-bb-i5', type: 'mc', kind: 'applied',
    prompt: 'Brackley Office (fictional) is bidding to refurnish the offices of Pemberton Legal, a fictional law firm. The office manager loved Brackley’s sample chairs, but says: “Finance will decide, and they only look at the price per desk.” What should Brackley’s salesperson do?',
    options: [
      'Ask to put the case to finance too, in its terms: total cost over the furniture’s life, reliability and warranty.',
      'Cut the price per desk to the cheapest rival’s level, because the decider looks only at the price.',
      'Leave it to the office manager, who is the buyer and is sure to argue Brackley’s case well.',
      'Go over the office manager’s head and lobby the firm’s senior partners directly, without telling her.',
    ],
    answer: 0,
    feedback: {
      1: 'That assumes finance can’t be shown another way to judge value, and gives up margin before anyone has tested the assumption.',
      2: 'The office manager is an ally, but she isn’t the decider and may not make the economic case the way finance needs it.',
      3: 'Going round the buyer behind her back risks losing the ally Brackley already has, and may break the firm’s rules for suppliers.',
    },
    solution: 'The office manager is the buyer and an influencer, but finance is the decider. The salesperson should ask, through the office manager, to give finance what it needs: the cost per desk over the furniture’s life, warranty and replacement terms, and evidence of reliability. That respects the buyer and reaches the decider in its own terms.',
  },
  {
    id: 'm01-bb-i6', type: 'short', kind: 'applied',
    prompt: 'Tallis Software (fictional) sells timetabling software to universities. At one university: the registrar asked for a new system after a term in which hundreds of lectures clashed; the timetabling team of eight will use it every day; the IT security manager must approve any system that stores student data; the head of procurement runs all tenders over $100,000 and is the only permitted contact during one; and the university’s finance committee approves contracts over $250,000. Tallis’s system costs $60,000 a year on a five-year contract. Write a short account plan: the buying situation, the buying centre, the procurement route and what Tallis should offer each role.',
    rubric: [
      'Identifies the buying situation and justifies it (a new task or a modified rebuy, depending on what the university used before; either is accepted with a reason).',
      'Maps every person or group to a role by what they do, noting anyone with more than one role or a veto.',
      'Works out the contract value (5 × $60,000 = $300,000) and the procurement route it triggers: a tender, run by the head of procurement, and finance-committee approval.',
      'Proposes something specific for each role and respects the tender’s contact rule.',
    ],
    model: 'Buying situation: if the university timetables with spreadsheets today, this is a new task; if it is replacing another system, a modified rebuy. Either way the clash-filled term has reopened the decision, and several people are involved. Buying centre: the registrar is the initiator and a strong influencer; the timetabling team are the users; the IT security manager is an influencer with a veto; the head of procurement is the buyer and, during the tender, the gatekeeper; the finance committee is the decider. Procurement route: five years at $60,000 is $300,000, over both the $100,000 tender threshold and the $250,000 committee threshold, so Tallis must win a formal tender and then committee approval, and may contact only the head of procurement while the tender is open. Offer: for the registrar, evidence of how the system prevents clashes, ideally from a similar university; for the timetabling team, a trial with their own data and training; for the IT security manager, documentation of how student data are stored and protected, ready before the tender closes; for the head of procurement, a complete, compliant bid on time; for the finance committee, the five-year total cost set against the cost of last term’s clashes. Before the tender, Tallis can help the registrar understand the options; once it opens, everything goes through procurement.',
  },
];

export const check = [
  {
    id: 'm01-bb-k1', type: 'mc', kind: 'conceptual',
    prompt: 'What is derived demand?',
    options: [
      'Demand for a product that arises from the demand for what it helps to produce.',
      'Demand that a seller creates through advertising rather than through price cuts.',
      'Demand from organisations that resell goods rather than use them themselves.',
      'Demand estimated from a firm’s past sales figures rather than from surveys.',
    ],
    answer: 0,
    feedback: {
      1: 'Advertising may stimulate demand, but derived demand is about where demand comes from: the buyer’s own customers.',
      2: 'Resellers are one kind of business buyer, but derived demand applies to every business purchase, including inputs used in production.',
      3: 'That describes a forecasting method, not a kind of demand.',
    },
    solution: 'Derived demand is demand for an input that comes from the demand for the outputs it helps produce: a courier’s demand for vans derives from the demand for parcel deliveries, and a firm’s demand for catering from the staff events it holds.',
  },
  {
    id: 'm01-bb-k2', type: 'num', kind: 'numerical',
    prompt: 'A fictional print firm has 40 presses and retires 10% of them each year. The presses it needs are proportional to its orders, which are expected to rise by 15% next year. How many new presses will it buy?',
    answer: 10, check: () => 40 * 1.15 - 40 * 0.9, tol: 0.05, unit: 'presses', places: 0,
    wrong: [
      { value: 6, say: 'That is only the growth (46 − 40). The firm must also replace the 4 presses that wear out.' },
      { value: 4.6, say: 'That is 15% more than the normal 4 replacements. Orders depend on the extra presses needed, plus replacements.' },
      { value: 46, say: 'That is the number of presses needed in total; 36 of them are still in service.' },
    ],
    solution: 'Presses needed: 40 × 1.15 = 46. Still in service after retiring 10%: 40 × 0.9 = 36. New presses: 46 − 36 = 10, two and a half times the normal 4. A 15% rise in orders produces a 150% rise in press purchases.',
  },
  {
    id: 'm01-bb-k3', type: 'classify', kind: 'applied',
    prompt: 'A fictional hotel is replacing its booking system. Classify each person or group by the role they mainly play.',
    items: [
      'The front-desk team, who will use the system on every shift',
      'The general manager, who has the final say on the contract',
      'The IT consultant who writes the technical requirements',
      'The revenue manager, who proposed replacing the old system after a spate of double bookings',
      'The group purchasing officer, who requests proposals and negotiates the terms',
      'The general manager’s assistant, who decides which vendors’ calls are put through',
    ],
    categories: ROLES,
    answer: [1, 4, 2, 0, 3, 5],
    feedback: {
      3: 'Proposing the replacement started the purchase: the revenue manager is the initiator, and probably an influencer too.',
      5: 'Controlling which calls reach the general manager is the gatekeeper’s role, whatever the job title.',
    },
    solution: 'Front desk: users. General manager: decider. IT consultant: influencer. Revenue manager: initiator. Purchasing officer: buyer. Assistant: gatekeeper.',
  },
  {
    id: 'm01-bb-k4', type: 'mc', kind: 'applied',
    prompt: 'A fictional packaging firm learns that its largest customer, unhappy about late deliveries, has invited two competitors to quote. What is the best response?',
    options: [
      'Fix the delivery problem, show the evidence, and propose terms that guarantee punctual delivery.',
      'Cut the price, since price is the only thing a professional buyer really compares in the end.',
      'Do nothing different: as the in-supplier it will keep the business because of the relationship.',
      'Ask the customer to cancel the request for quotes out of respect for their long relationship.',
    ],
    answer: 0,
    feedback: {
      1: 'Price may matter, but the customer reopened the decision because of late deliveries. A cut that leaves the problem unsolved answers the wrong question.',
      2: 'A modified rebuy means the in-supplier’s position is no longer safe: the challengers now have a real chance.',
      3: 'Asking the buyer to abandon its own process ignores the reason for it and is likely to annoy the buying centre.',
    },
    solution: 'Late deliveries have turned a straight rebuy into a modified rebuy. The incumbent should remove the reason the customer is looking elsewhere, prove it with evidence (for example on-time delivery figures) and lower the customer’s risk with terms such as guaranteed delivery windows.',
  },
  {
    id: 'm01-bb-k5', type: 'multi', kind: 'conceptual',
    prompt: 'Which statements about procurement rules are correct, according to the lesson? Select all that apply.',
    options: [
      'Under the Federal Acquisition Regulation (as of 13 March 2026), a US federal micro-purchase of up to $15,000 may be made without competing quotations if the price is reasonable.',
      'An approval limit can mean that the person who places orders is not allowed to approve a large one.',
      'A supplier that is not on an organisation’s approved supplier list may have to be approved before staff can buy from it.',
      'During a tender, contacting buying-centre members other than the named procurement officer can break the rules.',
      'Procurement rules are the same in every organisation, so a seller needs to learn them only once.',
      'The Federal Acquisition Regulation requires at least three quotes for every federal purchase, however small.',
    ],
    answer: [0, 1, 2, 3],
    feedback: {
      4: 'Every organisation sets its own thresholds and procedures, and they change over time. Check them for each customer.',
      5: 'Micro-purchases (up to $15,000 under the current FAR) can be made without competing quotations if the price is reasonable.',
    },
    solution: 'The FAR allows micro-purchases without competing quotations when the price is reasonable; approval limits separate placing orders from approving large ones; approved supplier lists must often be joined first; and tender rules can restrict contact to one officer. Rules differ between organisations and change over time.',
  },
  {
    id: 'm01-bb-k6', type: 'mc', kind: 'conceptual',
    prompt: 'Which statement about buying-centre roles is correct?',
    options: [
      'Roles are defined by what people do in a purchase, and one person can hold several.',
      'Each role belongs to a fixed job title: the buyer is always the purchasing manager.',
      'Every buying centre has exactly six people, with one person in each of the six roles.',
      'The decider is always the most senior person in the organisation, whatever the purchase.',
    ],
    answer: 0,
    feedback: {
      1: 'Titles rarely settle roles: an office manager or a receptionist can be the buyer or the gatekeeper, and in a small firm the owner may hold every role.',
      2: 'A buying centre can be one person or dozens; roles can be shared, combined or missing.',
      3: 'Approval limits often push small decisions down: an office manager may decide small orders while a director decides large contracts.',
    },
    solution: 'Roles describe what people do in a particular purchase. One person can hold several, several people can share one, and the roles, including who decides, can change with the size and kind of purchase.',
  },
];
