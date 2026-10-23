// what-is-marketing.ex.js — M01 · What marketing is: widgets, practice and the knowledge check.
// Answer keys live here, not in the page's HTML. Every number is recomputed by `check` (see ../AUTHORING.md).
// All businesses and figures are fictional; the willingness-to-pay figures are assumptions, as in the lesson.

const ENQ = [200, 190, 180, 175, 160, 150, 150, 140, 135, 130, 130, 125, 110, 95, 80];
const money = (v) => {
  const c = Math.round(Math.abs(v));
  return `${v < 0 && c !== 0 ? '−' : ''}$${c.toLocaleString('en-US')}`;
};
const NWD = ['Need', 'Want', 'Demand'];

export const widgets = {
  'wim-workshop-price': {
    type: 'formula',
    title: 'Price, demand and who gains: one Lantern workshop',
    intro: 'Fifteen people enquire, each with an assumed willingness to pay from $80 to $200. Anyone whose willingness to pay is at least the price books a place. Set the price and Lantern’s cost per place.',
    inputs: [
      { id: 'price', label: 'Price per place', min: 50, max: 220, step: 5, value: 125, fmt: 'money' },
      { id: 'cost', label: 'Lantern’s cost per place', min: 40, max: 120, step: 5, value: 70, fmt: 'money' },
    ],
    compute: (v) => {
      const sold = ENQ.filter((w) => w >= v.price);
      const n = sold.length;
      const lantern = n * (v.price - v.cost);
      const people = sold.reduce((s, w) => s + w - v.price, 0);
      const total = lantern + people;
      const gainAt = (p) => ENQ.filter((w) => w >= p).length * (p - v.cost);
      const totalAt = (p) => ENQ.filter((w) => w >= p).reduce((s, w) => s + w - v.cost, 0);
      const grid = Array.from({ length: 18 }, (_, k) => 50 + 10 * k);
      const steps = Array.from({ length: 35 }, (_, k) => 50 + 5 * k);
      const top = Math.max(...steps.map(gainAt));
      const bestList = steps.filter((p) => gainAt(p) > top - 1e-9);
      const best = bestList[0];
      const bestText = bestList.map(money).join(' or ');
      let note;
      if (n === 0) note = `Nobody values a place at ${money(v.price)} or more, so no exchange happens and no value is created.`;
      else if (v.price < v.cost) note = `Lantern loses ${money(v.cost - v.price)} on every place at this price. Customers gain, but Lantern couldn’t keep running workshops like this.`;
      else note = `${n} of the 15 book. The total value created (${money(total)}) depends only on who books and on the cost; the price decides how it is split. On these figures Lantern gains most at ${bestText}.`;
      return {
        headline: { label: `Lantern’s gain from one workshop at ${money(v.price)} a place`, value: money(lantern) },
        rows: [
          ['Places sold (of 15 people who enquired)', String(n)],
          ['Participants’ combined gain', money(people)],
          ['Total value created', money(total)],
          ['Price that earns Lantern most (in steps of $5)', `${bestText}, earning ${money(gainAt(best))}`],
        ],
        note,
        chart: {
          kind: 'line',
          x: { label: 'Price per place ($)', values: grid },
          series: [
            { name: 'Lantern’s gain ($)', values: grid.map(gainAt) },
            { name: 'Total value created ($)', values: grid.map(totalAt) },
          ],
          y: { label: '$ per workshop' },
        },
      };
    },
  },
};

export const guided = [
  {
    id: 'm01-wim-g1', type: 'classify', kind: 'conceptual',
    prompt: 'Classify each statement as a need, a want or demand.',
    items: [
      'Night-shift nurses struggle to stay alert at 4 a.m.',
      'They would like a proper espresso machine in the staff room',
      'The hospital’s staff association pays $2,400 for a machine and a year of beans',
      'A teenager would love Lantern’s single-origin beans but buys supermarket coffee because her allowance won’t stretch to them',
      'A café owner books two places on a Lantern workshop at $125 each',
      'A team that works from home feels cut off from colleagues',
    ],
    categories: NWD,
    answer: [0, 1, 2, 1, 2, 0],
    hints: [
      'A need is a felt lack. A want is a particular way of meeting it. Demand is a want that someone is able and willing to pay for, at the price asked.',
      'The teenager wants the beans, but does she buy them at their price? Feeling cut off says what is lacking, not yet how to fix it.',
    ],
    feedback: {
      2: 'Paying for the machine turns the want into demand: the ability and willingness to pay, at a price.',
      3: 'She wants these beans but can’t pay their price, so she creates no demand for them at that price. Her need for coffee is met by a cheaper offer.',
      5: 'Feeling cut off is a felt lack, with no particular way of fixing it yet: a need. A monthly team lunch or an office coffee morning would be wants.',
    },
    solution: 'Needs: staying alert on a night shift, and feeling connected to colleagues. Wants: an espresso machine in the staff room, and the single-origin beans the teenager can’t afford (a want, not demand, at their price). Demand: the staff association’s $2,400 purchase and the café owner’s two bookings, because each is a want backed by the ability and willingness to pay.',
  },
  {
    id: 'm01-wim-g2', type: 'steps', kind: 'numerical',
    prompt: 'A home-brewing enthusiast is thinking about a Lantern workshop. The most she would pay for a place, given her alternatives (an online video course, or a friend’s advice), is $160. Lantern charges $125, and one more place costs Lantern $70 to deliver (the lesson’s assumption).',
    solution: 'Her gain: $160 − $125 = $35. Lantern’s gain: $125 − $70 = $55. Value created: $160 − $70 = $90, which equals $35 + $55. At $150, if she still books, the total is still $90: she keeps $10 and Lantern $80. The price shares out the value; it doesn’t change how much the exchange creates.',
    steps: [
      { id: 'm01-wim-g2-s1', type: 'num',
        prompt: 'How much does she gain from the exchange?',
        answer: 35, check: () => 160 - 125, unit: '$', places: 0, tol: 0.5,
        hints: ['Her gain is what the place is worth to her minus what she pays.', '$160 − $125.'],
        wrong: [
          { value: 55, say: 'That is Lantern’s gain (price minus cost). Hers is her willingness to pay minus the price.' },
          { value: 90, say: 'That is the total value the exchange creates. Her share is $160 − $125.' },
        ] },
      { id: 'm01-wim-g2-s2', type: 'num',
        prompt: 'How much does Lantern gain?',
        answer: 55, check: () => 125 - 70, unit: '$', places: 0, tol: 0.5,
        hints: ['Lantern’s gain is the price minus its cost of providing the place.', '$125 − $70.'],
        wrong: [{ value: 125, say: 'That is the whole price. Lantern spends $70 delivering the place, so it gains $125 − $70.' }] },
      { id: 'm01-wim-g2-s3', type: 'num',
        prompt: 'How much value does the exchange create in total?',
        answer: 90, check: () => 160 - 70, unit: '$', places: 0, tol: 0.5,
        hints: ['Add the two gains, or subtract the cost from her willingness to pay.', '$35 + $55, or $160 − $70.'],
        wrong: [
          { value: 160, say: 'That is what the place is worth to her. Providing it costs Lantern $70, so the exchange creates $160 − $70.' },
          { value: 20, say: 'You subtracted one gain from the other. The value created is the sum of the two gains.' },
        ] },
      { id: 'm01-wim-g2-s4', type: 'mc',
        prompt: 'Lantern raises the price to $150, and she still books. What happens to the value this exchange creates?',
        options: [
          'It stays $90: she now keeps $10 and Lantern keeps $80.',
          'It rises to $115, because Lantern now earns $25 more.',
          'It falls, because she pays $25 more than before.',
          'Nothing changes at all, because she still books.',
        ],
        answer: 0,
        hints: ['The value created is her willingness to pay minus Lantern’s cost. Has either changed?', 'The price only decides how the $90 is split.'],
        feedback: {
          1: 'Lantern’s extra $25 comes out of her gain, so the total stays the same. Only a better offer or a lower cost raises it.',
          2: 'Her extra $25 goes to Lantern; nothing is lost while she still books. The total would fall only if the higher price stopped her booking.',
          3: 'The total is unchanged, but the split is not: her gain falls from $35 to $10 and Lantern’s rises from $55 to $80.',
        } },
    ],
  },
  {
    id: 'm01-wim-g3', type: 'mc', kind: 'applied',
    prompt: 'A fictional company that makes bedside alarm clocks sees its sales falling as people use their phones to wake up. Which definition of its business best avoids marketing myopia while still guiding its decisions?',
    options: [
      'Helping people wake up on time and start the day well',
      'Making the best alarm clocks in the world, whatever phones do',
      'Improving people’s lives in every way it can',
      'Making every kind of clock more cheaply than any rival',
    ],
    answer: 0,
    hints: [
      'Myopia is defining the business by its product. Which options still do that?',
      'A cure for myopia must also be specific enough to say what to do next.',
    ],
    feedback: {
      1: 'This defines the business by its product, which is the myopia Levitt described: a better alarm clock doesn’t answer the phone.',
      2: 'This is so broad that it reveals no substitutes and guides no decision. Which products would it rule out?',
      3: 'Still a product definition, now with a cost goal added. It ignores why customers are leaving.',
    },
    why: 'It names the customer need (waking up and starting the day), which reveals phones as substitutes and suggests offers such as sleep-friendly lights or apps, while still guiding decisions.',
    solution: 'A customer-based definition names the need the product serves: waking on time and starting the day well. It shows why phones compete with clocks and points to offers the firm could make. “The best alarm clocks” and “every kind of clock” are product definitions; “improving people’s lives” is too broad to guide anything.',
  },
  {
    id: 'm01-wim-g4', type: 'order', kind: 'conceptual',
    prompt: 'A fictional dog-walking business is starting up. Put its first year of work in the order of the marketing process.',
    items: [
      'Interview dog owners in the neighbourhood about what they struggle with on working days',
      'Choose to serve owners who work long office hours, promising reliable midday walks with photo updates',
      'Set the price per walk, build a booking app, fix the area served and print flyers for local vets',
      'Call each owner after the first month and fix whatever disappointed them',
      'Track revenue, profit and how many owners are still booking after three months',
    ],
    hints: [
      'The steps are: understand customers, design a strategy, build the offer, build relationships, capture value.',
      'Choosing whom to serve comes before deciding the price and the app; the follow-up calls come after the first sales.',
    ],
    solution: 'Understand customers (the interviews), design a customer-driven strategy (whom to serve and what to promise), build the offer (price, app, area, flyers), build relationships (the follow-up calls) and capture value (revenue, profit and repeat bookings). The results then feed the next round of interviews.',
  },
];

export const independent = [
  {
    id: 'm01-wim-i1', type: 'classify', kind: 'conceptual',
    prompt: 'Which setting does each piece of marketing belong to?',
    items: [
      'Lantern sells a 1 kg bag of beans to a home espresso enthusiast',
      'Lantern caters Meridian Partners’ two-day conference',
      'A food bank asks supermarkets to donate their surplus stock',
      'A café owner pays for two of her staff to attend a Lantern workshop',
      'A museum invites families to become members',
      'A clothing brand sells jackets to shoppers through its app',
    ],
    categories: ['Consumer (B2C)', 'Business (B2B)', 'Non-profit'],
    answer: [0, 1, 2, 1, 2, 0],
    feedback: {
      3: 'The café owner is buying training for her business’s staff, for use in its operations: a business-to-business sale, even though it is a small one.',
      4: 'A museum is usually a non-profit organisation: what it asks of families is membership and visits, in support of its mission.',
    },
    solution: 'Consumer: the home espresso enthusiast and the jacket shoppers buy for their own use. Business: Meridian Partners and the café owner buy for their organisations’ operations. Non-profit: the food bank and the museum seek donations, time and support for a mission.',
  },
  {
    id: 'm01-wim-i2', type: 'num', kind: 'numerical',
    prompt: 'A fictional battery-storage installer quotes $40,000 to install a system at a warehouse. Given its alternatives, the warehouse would pay up to $52,000 for it. Supplying and fitting the system costs the installer $31,000. If the warehouse accepts, how much value does the exchange create in total?',
    answer: 21000, check: () => 52000 - 31000, unit: '$', places: 0, tol: 0.5,
    wrong: [
      { value: 12000, say: 'That is the warehouse’s gain ($52,000 − $40,000). Add the installer’s gain as well.' },
      { value: 9000, say: 'That is the installer’s gain ($40,000 − $31,000). Add the warehouse’s gain as well.' },
      { value: 52000, say: 'That is what the system is worth to the warehouse. Subtract the installer’s cost of providing it.' },
    ],
    solution: 'Value created = willingness to pay − cost = $52,000 − $31,000 = $21,000. The $40,000 price splits it: the warehouse keeps $12,000 and the installer $9,000. A different price would change the split, not the total.',
  },
  {
    id: 'm01-wim-i3', type: 'mc', kind: 'conceptual',
    prompt: 'Kotler’s 1972 definition describes marketing as creating and offering values to others to achieve a “desired response”. Why was “desired response” an important choice of words?',
    options: [
      'It lets the definition cover exchanges that aren’t purchases, such as donations, votes and volunteering.',
      'It defines marketing as persuasion, whatever value the offer has for the customer.',
      'It limits marketing to the responses that advertising can measure, such as clicks.',
      'It replaced the AMA’s definition, which had applied only to consumer goods.',
    ],
    answer: 0,
    feedback: {
      1: 'Kotler’s definition starts with creating and offering values to others; the response comes in return for value, not instead of it.',
      2: 'The response can be any action the organisation seeks; most are not advertising measures.',
      3: 'The AMA’s current definition is separate and is reviewed regularly. Kotler’s was a scholarly proposal in a journal article.',
    },
    solution: 'Kotler argued for a “generic” concept of marketing that applies to any organisation with people it serves. Calling the aim a desired response, rather than a sale, brings in charities, public services and political campaigns, which seek donations, visits or votes in exchange for value.',
  },
  {
    id: 'm01-wim-i4', type: 'multi', kind: 'applied',
    prompt: 'Which of these business definitions describe a customer need specifically enough to guide decisions? Select all that apply. (All the businesses are hypothetical.)',
    options: [
      'A drill maker: “We help people make holes and fix things to their walls.”',
      'A railway: “We run the best trains in the country.”',
      'A cinema chain: “We give people a great night out around a story on the big screen.”',
      'A bank: “We are in the business of making the world a better place.”',
      'A typewriter maker: “We make typewriters that last for decades.”',
      'A university: “We help working adults gain qualifications that move their careers forward.”',
    ],
    answer: [0, 2, 5],
    feedback: {
      1: 'Defined by the product, like Levitt’s railroads. It hides the cars, coaches and flights that meet the same need.',
      3: 'So broad that it reveals no substitutes and rules nothing out.',
      4: 'Defined by the product. The need, producing written documents, is now met in other ways.',
    },
    solution: 'The drill maker, the cinema chain and the university each name a need (fixing things to walls, a night out, career progress) for identifiable customers, which reveals substitutes and suggests what to offer. The railway and the typewriter maker define themselves by their product; the bank’s definition is too vague to guide anything.',
  },
  {
    id: 'm01-wim-i5', type: 'fill', kind: 'conceptual',
    prompt: 'Complete the description of the marketing process.',
    text: 'In the marketing process, the first four steps [[0]] value for customers and the fifth [[1]] value in return. Choosing which customers to serve and what to promise them is step [[2]]. Deciding the product, its price, how it reaches customers and how it is promoted is step [[3]].',
    blanks: [
      { options: ['create', 'capture', 'measure'], answer: 0 },
      { options: ['creates', 'captures', 'gives away'], answer: 1 },
      { options: ['1', '2', '3', '4'], answer: 1 },
      { options: ['1', '2', '3', '4'], answer: 2 },
    ],
    solution: 'Steps 1 to 4 (understand customers, design a customer-driven strategy, build the offer, build relationships) create value for customers; step 5 captures value in return. Choosing the target market and the value proposition is step 2; the marketing mix is step 3, the subject of M02.',
  },
  {
    id: 'm01-wim-i6', type: 'short', kind: 'applied',
    prompt: 'Write a one-sentence definition of what business Lantern’s workshops are in that avoids marketing myopia. Then, in two or three sentences, explain one decision that definition would change compared with “we run barista courses”.',
    rubric: [
      'The definition names a customer need (for example, café owners getting new staff ready to serve good coffee quickly), not the product.',
      'It is specific enough to guide decisions: it names who has the need, not “making the world better”.',
      'The decision follows from the definition: for example, offering on-site training at a café, short refresher sessions or a follow-up check of each trainee’s drinks.',
      'The answer notes a substitute or competitor that the new definition reveals, such as online video courses or training by an experienced colleague.',
    ],
    model: 'Lantern’s workshops help café owners and other employers get new staff serving consistently good coffee quickly. Seen that way, Lantern’s real competitors include free online videos and a busy manager training staff herself, which are cheaper but slower and less reliable. That suggests offering a short on-site session at the employer’s own machine and a follow-up visit two weeks later to check each trainee’s drinks: things a barista course in Lantern’s room doesn’t do, and that a café owner who measures results would value.',
  },
];

export const check = [
  {
    id: 'm01-wim-k1', type: 'mc', kind: 'conceptual',
    prompt: 'Which is the best description of marketing?',
    options: [
      'Understanding customers’ needs, creating offers they value and capturing value in return',
      'Advertising and promotion that persuade people to buy what a business has made',
      'Selling whatever the business produces at the highest price customers will accept',
      'Researching customers’ opinions and reporting them to the managers who decide',
    ],
    answer: 0,
    feedback: {
      1: 'Advertising is part of communicating, one of the four activities in the AMA’s definition. Marketing starts with understanding customers and deciding what to offer.',
      2: 'That describes the selling mindset. Marketing begins with what customers need, not with what the business has already made.',
      3: 'Research is the first step of the marketing process, not the whole of it. Marketing also designs and delivers the offer and keeps customers.',
    },
    solution: 'The AMA defines marketing as creating, communicating, delivering and exchanging offerings that have value for customers, clients, partners and society. In plain terms: understand customers, create an offer they value more than the alternatives, deliver it and capture enough value to keep going.',
  },
  {
    id: 'm01-wim-k2', type: 'num', kind: 'numerical',
    prompt: 'A customer would pay up to $45 for a Lantern gift box, given the alternatives. Lantern sells it for $38, and each box costs Lantern $22 to make, pack and deliver. How much does Lantern gain from the sale?',
    answer: 16, check: () => 38 - 22, unit: '$', places: 0, tol: 0.5,
    wrong: [
      { value: 7, say: 'That is the customer’s gain ($45 − $38). Lantern’s gain is the price minus its cost.' },
      { value: 23, say: 'That is the total value the sale creates ($45 − $22). Lantern’s share is $38 − $22.' },
      { value: 38, say: 'That is the price. Lantern spends $22 on each box, so it gains $38 − $22.' },
    ],
    solution: 'Lantern’s gain = price − cost = $38 − $22 = $16. The customer gains $45 − $38 = $7, and the sale creates $23 of value in all.',
  },
  {
    id: 'm01-wim-k3', type: 'classify', kind: 'conceptual',
    prompt: 'Classify each statement as a need, a want or demand.',
    items: [
      'New parents are exhausted and struggling to stay awake at work',
      'They would like a machine that makes a latte at the press of a button',
      'They buy a $300 bean-to-cup machine',
      'A student would like a Lantern gift box but has $10 left for the month',
      'An accountancy firm books Lantern for its client breakfast',
    ],
    categories: NWD,
    answer: [0, 1, 2, 1, 2],
    feedback: {
      3: 'Wanting the gift box isn’t demand without the ability to pay its price.',
      4: 'A booking is a want backed by the ability and willingness to pay: demand.',
    },
    solution: 'Need: staying awake (a felt lack). Wants: the latte machine and the gift box the student can’t afford. Demand: buying the $300 machine and booking the breakfast, because both are backed by ability and willingness to pay.',
  },
  {
    id: 'm01-wim-k4', type: 'mc', kind: 'applied',
    prompt: 'A fictional ferry company calls itself “the operator of the best car ferries on the estuary”. A bridge across the estuary will open in three years. What does Levitt’s idea of marketing myopia suggest the company should do first?',
    options: [
      'Redefine itself by the need it meets, getting people and goods across the estuary, and ask what those customers will want once the bridge opens.',
      'Order faster, more comfortable ferries so that it stays the best car-ferry operator on the estuary.',
      'Cut its fares now, so that drivers stay loyal before the bridge opens.',
      'Increase its advertising to remind drivers how good its ferries are.',
    ],
    answer: 0,
    feedback: {
      1: 'Improving the product customers are about to leave is exactly the railroads’ mistake. A faster ferry doesn’t compete with a bridge for most drivers.',
      2: 'A price cut may delay losses but doesn’t answer what customers will need once a better substitute exists.',
      3: 'Advertising a product that a substitute will soon beat doesn’t address the change in the market.',
    },
    why: 'Defining the business by the need reveals the bridge as a substitute for car crossings and points to the needs it won’t meet well, such as foot passengers, cyclists, tourists or freight.',
    solution: 'The company is defining itself by its product, car ferries. Defined by the need, moving people and goods across the estuary, it can see that the bridge will take most car traffic, and ask which customers and needs the bridge will serve badly (foot passengers, cyclists, sightseeing, heavy freight) and what it could offer them.',
  },
  {
    id: 'm01-wim-k5', type: 'num', kind: 'applied',
    prompt: 'Eight people enquire about a fictional pottery class. The most each would pay is $210, $180, $165, $150, $140, $120, $100 and $90. The class charges $140 a place, and each place costs the teacher $60 in clay, firing and her time. Everyone whose willingness to pay is at least the price books. How much does the teacher gain from the class?',
    answer: 400, check: () => [210, 180, 165, 150, 140, 120, 100, 90].filter((w) => w >= 140).length * (140 - 60), unit: '$', places: 0, tol: 0.5,
    wrong: [
      { value: 640, say: 'That assumes all eight book. Only those who would pay at least $140 do.' },
      { value: 320, say: 'You left out the person whose willingness to pay is exactly $140. She books, because the price is no more than what she would pay.' },
      { value: 700, say: 'That is the revenue from five places (5 × $140). Subtract the $60 cost of each place.' },
    ],
    solution: 'Five people would pay $140 or more ($210, $180, $165, $150 and $140), so five book. The teacher gains 5 × ($140 − $60) = $400. Those five keep (210 + 180 + 165 + 150 + 140) − 5 × 140 = $145 between them.',
  },
  {
    id: 'm01-wim-k6', type: 'multi', kind: 'conceptual',
    prompt: 'For an exchange to take place, which conditions must hold? Select all that apply.',
    options: [
      'There are at least two parties.',
      'Each party has something the other values.',
      'Each party is free to accept or reject the offer.',
      'Each party can communicate and deliver what it offers.',
      'Money must change hands.',
      'Both parties must gain exactly the same amount.',
    ],
    answer: [0, 1, 2, 3],
    feedback: {
      4: 'Exchanges can involve time, effort or goods instead of money: a blood donor or a volunteer takes part in an exchange without paying.',
      5: 'Each side expects to be better off, but the split depends on the price and is rarely equal.',
    },
    solution: 'An exchange needs at least two parties, each with something the other values, each able to communicate and deliver, and each free to accept or reject. Money is common but not required, and the gains need not be equal: the price decides how the value created is shared.',
  },
];
