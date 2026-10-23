// what-is-marketing.js — M01 · What marketing is. Content only; exercises are in what-is-marketing.ex.js.
// Lantern facts come from ./case.js (fictional); `checks` recompute them. Workshop willingness-to-pay figures and the
// $70 cost of a place are this lesson's own assumptions, labelled in the text.
import { BUSINESS, HARBOR_TECH, CLIENT_INTERVIEWS } from './case.js';

const W = BUSINESS.workshops;
const ENQ = [200, 190, 180, 175, 160, 150, 150, 140, 135, 130, 130, 125, 110, 95, 80]; // the 15 enquirers (assumed)
const COST = 70;                                                                            // cost of one more place (assumed)
const buyers = (p) => ENQ.filter((w) => w >= p);
const seller = (p) => buyers(p).length * (p - COST);
const sumW = (p) => buyers(p).reduce((s, w) => s + w, 0);
const keep = (p) => sumW(p) - buyers(p).length * p;

const PROCESS = '<svg viewBox="0 0 640 228" xmlns="http://www.w3.org/2000/svg" font-family="inherit" font-size="13"><defs><marker id="wim-ar" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>'
  + [['1. Understand', 'customers and', 'the market'], ['2. Choose whom', 'to serve and', 'what to promise'], ['3. Build the', 'offer: the', 'marketing mix'], ['4. Keep and', 'grow customer', 'relationships'], ['5. Capture', 'value in', 'return']]
    .map(([a, b, c], i) => { const x = 10 + i * 126; const s = i < 4 ? 1 : 2; return `<rect x="${x}" y="56" width="112" height="78" rx="6" style="fill:none;stroke:var(--series-${s});stroke-width:2"/><text x="${x + 56}" y="81" text-anchor="middle" font-weight="700" fill="currentColor">${a}</text><text x="${x + 56}" y="100" text-anchor="middle" fill="currentColor">${b}</text><text x="${x + 56}" y="118" text-anchor="middle" fill="currentColor">${c}</text>`; }).join('')
  + [0, 1, 2, 3].map((i) => { const x = 122 + i * 126; return `<line x1="${x + 1}" y1="95" x2="${x + 13}" y2="95" style="stroke:currentColor;stroke-width:1.5" marker-end="url(#wim-ar)"/>`; }).join('')
  + '<path d="M10 46V36H500V46" style="fill:none;stroke:var(--series-1);stroke-width:1.5"/><text x="255" y="26" text-anchor="middle" fill="currentColor">Create value for customers</text>'
  + '<path d="M514 46V36H626V46" style="fill:none;stroke:var(--series-2);stroke-width:1.5"/><text x="570" y="26" text-anchor="middle" fill="currentColor">Capture value</text>'
  + '<path d="M570 134V170H66V140" style="fill:none;stroke:currentColor;stroke-width:1.5;stroke-dasharray:6 4" marker-end="url(#wim-ar)"/>'
  + '<text x="318" y="194" text-anchor="middle" font-size="12" fill="currentColor">Results, and what customers say, feed the next round of understanding</text>'
  + '<text x="318" y="214" text-anchor="middle" font-size="12" fill="currentColor">(a loop, not a one-way ladder)</text>'
  + '</svg>';

export default {
  slug: 'what-is-marketing',
  title: 'What marketing is',
  blurb: 'Marketing is not advertising with a bigger budget. Learn how marketers define it, why a voluntary exchange creates value for both sides, how needs, wants and demand differ, why defining a business by its product is dangerous, and what marketing looks like in consumer, business, service and non-profit settings.',
  status: 'draft',
  objectives: [
    'Explain what marketing is, using the American Marketing Association’s definition and a scholarly alternative, and why it is more than advertising and selling.',
    'Distinguish needs, wants and demand, and identify the market offering that answers them.',
    'Calculate the value an exchange creates and how the price divides it between buyer and seller.',
    'Recognise marketing myopia and restate a business in terms of the customer need it serves.',
    'Describe the five steps of the marketing process and what marketers do at each.',
    'Compare marketing in consumer, business, service and non-profit settings.',
  ],
  prerequisites: [
    { text: 'No marketing background is needed. You should be comfortable with subtraction, multiplication and percentages.' },
    { lesson: 'f00/finance-accounting-economics', why: 'Exchange rests on the economist’s ideas of scarcity and opportunity cost: every purchase means giving up something else.' },
  ],
  case: 'lantern',

  concept: [
    { case: 'It is November 2026. Lantern Coffee Co., which Ana Lim started on 1 March, now has three lines of business. It caters coffee for offices and events, with baristas who make every drink to order, and has 18 corporate clients. It runs barista-training workshops: 14 in 2026, with 12 participants on average at $125 a place. And its online shop, open since March, is on course for about 1,500 customers by December.' },
    { case: 'As she plans 2027, Ana has started to ask what “marketing” should mean for a business like hers. Every name and figure in this case is invented for teaching.' },
    { p: 'Ask people what marketing is and most say advertising, or perhaps selling. Both are part of it. But if they were the whole of it, Ana would need marketing only after she had decided what to offer, to whom and at what price, and those earlier decisions are where most of marketing’s work is done. This lesson builds a definition from the ground up, starting with the simplest thing that happens in any market: two parties exchanging something each of them values.' },

    { h: 'Two definitions' },
    { p: 'The American Marketing Association (AMA), a professional association for marketers and marketing academics, maintains a formal definition. A panel of five marketing scholars reviews the AMA’s definitions regularly; the panel listed beside the current wording is the 2017 panel.' },
    { quote: { text: 'Marketing is the activity, set of institutions, and processes for creating, communicating, delivering, and exchanging offerings that have value for customers, clients, partners, and society at large.', cite: 'American Marketing Association, “Definitions of Marketing”' } },
    { p: 'Three features of that sentence matter. It speaks of <i>offerings</i>, not just products: a catered event, a training morning and a bag of beans are all offerings. It names four activities, creating, communicating, delivering and exchanging, so advertising (one way of communicating) is a part of one activity among four. And it says the value must reach customers, partners and society at large, not only the seller. Put plainly, <g>marketing</g> is the work of understanding what a group of customers needs, creating an offer they value more than the alternatives, making it easy to find and to get, and capturing enough of the value created to keep the organisation going.' },
    { p: 'Scholars have proposed other definitions, and comparing two of them shows what is essential. In 1972 Philip Kotler, writing in the <i>Journal of Marketing</i>, argued for a “generic” concept of marketing that applies to any organisation with people it serves. He saw marketing as “the disciplined task of creating and offering values to others for the purpose of achieving a desired response”.' },
    { p: 'The desired response need not be a purchase. It can be a donation, a vote, a booking or a visit to a blood-donation centre. Kotler’s definition puts the exchange of value at the centre; the AMA’s adds the institutions and processes that make exchange possible, and a duty to society. Neither mentions advertising.' },

    { h: 'Exchange: why both sides can gain' },
    { p: 'In marketing, <b>exchange</b> is the act of obtaining something of value from someone by offering something in return. It is the idea underneath both definitions. At least four conditions must hold for an exchange to happen (textbooks word and number the list differently): there are at least two parties; each has something the other values; each can communicate with the other and deliver what it offers; and each is free to accept or reject the offer.' },
    { p: 'The last condition is the important one. Because either side can say no, an exchange that happens freely leaves each side expecting to be better off than before. That is how marketing creates value rather than merely moving it from one pocket to another.' },
    { p: 'A simple measure makes the point. Call the most a customer would pay for an offer, given the alternatives open to her, her <g>willingness to pay</g>. The gap between her willingness to pay and the seller’s cost is the value the exchange creates, and the price decides how that value is shared.' },
    { case: 'A café owner books a place on a Lantern workshop to train a new member of staff. She judges the morning worth up to $180 to her: that is her willingness to pay. Lantern charges $125. Delivering one more place costs Lantern about $70 in the trainer’s time, beans, milk and the room. (The $180 and the $70 are assumptions for this lesson.)' },
    { p: 'The exchange creates $180 − $70 = $110 of value. The café owner keeps $180 − $125 = $55 of it, and Lantern keeps $125 − $70 = $55.' },
    { callout: 'key', title: 'The price divides value; it doesn’t create it', html: 'Raising the price moves value from the customer to the seller, and cutting it moves value back. Only a better offer (more benefit to the customer) or a cheaper way to deliver it (lower cost) makes the total bigger. The customer buys only if the price is no more than her willingness to pay, and the seller can go on selling only if the price covers its cost.' },

    { h: 'Needs, wants and demand' },
    { p: 'Marketers separate three things that everyday speech runs together.' },
    { define: [
      ['Need', 'A state of felt lack that a person or organisation is motivated to fix: staying alert through a long afternoon, feeling looked after at work, getting a team through a busy day.'],
      ['Want', 'The particular form a need takes, shaped by culture, experience and the options a person knows about. The need to stay alert becomes a want for a barista-made flat white in one office and for a can of energy drink in another.'],
      ['Demand', 'A want backed by the ability and the willingness to pay for it. Demand is always demand at a price: at $9 a head, some offices want Lantern’s baristas and can pay for them; at a much higher price, fewer would.'],
    ] },
    { case: 'Harbor Tech, a 300-person software firm, was one of Lantern’s first catering clients. After an engagement survey, its head of people, Lena Brooks, asked for better coffee at staff events. The <i>need</i> is for staff to feel valued and stay engaged. The <i>want</i> is barista-made coffee at those events. <i>Demand</i> appears only when the office manager, Hana Hallett, books an event at Lantern’s price and the budget set by the finance director allows it.' },
    { p: 'The distinction matters because the three change at different speeds. Needs are stable; wants shift as new offers appear; demand moves with price, income and budgets. A business that counts wants overestimates its market, because many people who want something will not pay for it. A business that never looks behind wants to the need misses its real competition: Harbor Tech’s need could also be met by a team lunch, a games evening or a bonus.' },

    { h: 'Market offerings and markets' },
    { p: 'A <g>market offering</g> is the combination of goods, services, information and experiences a business offers to satisfy a need or want. Few offerings are purely one thing. Lantern’s catering is a service built around goods: coffee and milk, turned into drinks on site by baristas. A workshop is a service and an experience whose outcome is a skill. The online shop sells goods, but the delivery, the roasting date on the bag and the brewing guide are part of what customers buy.' },
    { p: 'A <g>market</g> is the set of actual and potential buyers of an offering. The people in it play two parts that are easy to confuse: the <g>customer</g> chooses and pays, and the <g>consumer</g> uses the offering. At Harbor Tech the firm is the customer and its 300 staff are the consumers, so Lantern has to satisfy both: the people who decide and pay, and the people who drink the coffee.' },

    { h: 'Marketing myopia' },
    { p: 'In 1960 Theodore Levitt, later a professor of marketing at Harvard Business School and editor of the <i>Harvard Business Review</i>, published “Marketing Myopia” in the <i>Harvard Business Review</i>. His best-known example was the American railroads. They did not decline because people stopped needing to travel or to move freight. They let other forms of transport take their customers because they thought of themselves as being in the railroad business rather than the transportation business: they were oriented to their product, not to their customers.' },
    { p: '<g>Marketing myopia</g> is that mistake in general: defining a business by what it makes instead of by the customer need it serves. It blinds a business to substitutes, which meet the same need in a different way, and to changes in what customers want. Lantern would be myopic if it thought of its catering as “selling coffee by the cup”. Its corporate clients are buying something closer to an event that runs smoothly and staff who feel looked after. That view reveals rivals Lantern would otherwise ignore, and needs it could also serve.' },
    { callout: 'warn', title: 'Broad is not the same as useful', html: 'The cure for myopia is not the broadest possible definition. “We are in the happiness business” is broad enough to include everything and too vague to guide any decision. A useful definition names the need, the customers who have it and the capabilities the business brings, so that it reveals substitutes and still tells you what to do next.' },
  ],

  theory: [
    { h: 'The marketing process' },
    { p: 'Textbooks describe the work of marketing as a process. OpenStax’s <i>Principles of Marketing</i> sets out five steps, and this course and the ones after it follow the same outline. The first four steps create value for customers; the fifth captures value in return.' },
    { figure: {
      svg: PROCESS,
      caption: 'The marketing process in five steps. The first four create value for customers and the fifth captures value for the business; the dashed arrow shows that results feed the next round.',
      alt: 'Five boxes in a row joined left to right by arrows: 1. Understand customers and the market; 2. Choose whom to serve and what to promise; 3. Build the offer: the marketing mix; 4. Keep and grow customer relationships; 5. Capture value in return. A bracket over the first four boxes is labelled “Create value for customers” and a bracket over the fifth is labelled “Capture value”. A dashed arrow runs from the fifth box back underneath the row to the first, with the note that results, and what customers say, feed the next round of understanding: a loop, not a one-way ladder.',
    } },
    { ol: [
      '<b>Understand the marketplace and customers.</b> Find out what customers need and want, what they do now and what else competes for their money and time. Lantern’s November interviews with 12 of its clients are this step at work; the third lesson of this module looks at them, and M04 Market Research teaches the methods properly.',
      '<b>Design a customer-driven strategy.</b> Choose which customers to serve (the target market) and what to promise them that the alternatives don’t (the value proposition). Should Lantern pursue large technology firms or small professional offices? M05 Market Segmentation and Positioning covers these choices.',
      '<b>Build the offer.</b> Turn the strategy into decisions about the product, its price, how it reaches customers and how it is communicated: the marketing mix, the subject of the next course, M02. For Lantern’s catering that means the menu, the price per head, how events are booked and whether prospects get a free tasting.',
      '<b>Build profitable relationships.</b> Satisfy customers, keep them and grow what they buy. Winning new customers is costly, and satisfied customers buy again and recommend the business to others. The next lesson covers satisfaction, loyalty and retention.',
      '<b>Capture value in return.</b> Sales, profit, and loyal customers who will go on buying. OpenStax calls the potential profit from a business’s current and potential customers its <g>customer equity</g>; the next lesson measures one customer’s contribution to it as lifetime value.',
    ] },
    { p: 'Together these steps make up the <g>marketing process</g> as this course uses the term. Notice where advertising sits: inside step 3, as one of four groups of decisions, after the business has understood its customers and chosen whom to serve.' },
    { callout: 'note', title: 'A loop, not a ladder', html: 'The steps are drawn in order for teaching. In practice they overlap and repeat. What Lantern learns when a client fails to rebook (step 4) sends it back to understanding customers (step 1), and a change of price (step 3) can change which customers it attracts (step 2).' },

    { h: 'Marketing in different settings' },
    { p: 'The same ideas apply wherever there is an exchange, but the setting changes what marketing looks like. Marketing to people who buy for their own use is <g>business-to-consumer</g> (B2C) marketing; marketing to organisations that buy for their operations or to resell is <g>business-to-business</g> (B2B) marketing. Lantern does both.' },
    { table: {
      caption: 'Four settings for marketing (Fenmoor Food Bank is fictional, like Lantern)',
      head: ['Setting', 'Who buys', 'Example', 'What changes for the marketer'],
      rows: [
        ['Consumer (B2C)', 'Individuals and households, for their own use', 'Lantern’s online shop selling beans to home brewers', 'Many customers and small purchases; convenience, brand and reviews matter; communication reaches people in large numbers'],
        ['Business (B2B)', 'Organisations, for their operations or to resell', 'Lantern catering Harbor Tech’s staff events', 'Fewer, larger customers; several people take part in each decision; reliability, terms and the relationship matter'],
        ['Services', 'Consumers or organisations', 'Lantern’s workshops, and its catering', 'The offering is a performance that can’t be stored or inspected before it is bought; the people who deliver it are part of what is sold'],
        ['Non-profit', 'Donors, volunteers, members and the public', 'Fenmoor Food Bank asking supermarkets for surplus food and residents for volunteer time', 'Two audiences, those who give and those who are helped; the “price” is often time or effort; success is judged by the mission, not by profit'],
      ],
    } },
    { p: 'The non-profit row would once have surprised marketers. In 1969 Philip Kotler and Sidney Levy argued in the <i>Journal of Marketing</i> that marketing is a pervasive activity that goes far beyond selling toothpaste, soap and steel, and that non-business organisations face the same marketing tasks as firms: improving what they offer, deciding what to ask in return, making it easy to take part and communicating with the people they serve. Kotler’s 1972 definition, with its “desired response”, grew out of that argument. The second module of this course returns to business buyers, and M03 covers services marketing in depth.' },

    { h: 'What marketers actually do' },
    { p: 'The United States Bureau of Labor Statistics describes marketing managers as estimating the demand for products and services, identifying potential markets, and helping to develop pricing strategies and strategies for winning and keeping customers, working with product development, sales and public relations. Its list of their duties includes starting market research studies and analysing the findings, planning campaigns and deciding in which media to advertise. In larger organisations the work is divided among several roles.' },
    { list: [
      '<b>Market research analysts</b> design surveys and interviews, and analyse sales and customer data to find out what customers need and how they behave.',
      '<b>Brand and product managers</b> look after an offering: what it should be, for whom and at what price, coordinating the people who make, sell and promote it.',
      '<b>Digital marketing specialists</b> run websites, search, social media and email, and measure what each brings in.',
      '<b>Account managers and salespeople</b>, especially in B2B markets, manage the relationship with each large customer.',
    ] },
    { p: 'At Lantern, Ana does all of these jobs in the hours she can spare from running events. She interviews clients, decides the menu and the price, posts on social media and visits prospects with samples. Knowing which job she is doing at a given moment helps her see which ones are being neglected.' },

    { h: 'Limits of the definitions' },
    { p: 'Definitions of marketing change, and the AMA reviews its own regularly. A definition broad enough to include creating, communicating, delivering and exchanging can make marketing sound like the whole of the business. In practice the marketing function is narrower than that; the definition describes a way of thinking about customers that the whole business shares, which is the subject of this module’s third lesson.' },
    { p: 'A harder question is whether marketing creates needs. OpenStax’s position, common in textbooks, is that it does not: marketing uncovers wants, and customers decide how much value an offer creates. That is broadly right about needs, which come from people’s lives rather than from advertising.' },
    { p: 'Wants are another matter. Marketing shapes which form a need takes, and wants can be shaped towards things that do the buyer little good. That is why the third lesson of this module turns to the societal marketing concept and to marketing ethics.' },
    { p: 'Finally, the step most people picture when they hear “marketing”, building the offer and telling people about it, is the subject of the next course, M02 The 4Ps Marketing Mix. This course stays with the steps on either side of it: understanding customers, creating value for them and choosing where and how to compete.' },
  ],

  formulas: [
    { id: 'm01-exchange-value', name: 'Value created by an exchange, and how the price divides it',
      tex: String.raw`V = W - C \qquad \text{Gain to buyer} = W - P \qquad \text{Gain to seller} = P - C`,
      where: [
        [String.raw`V`, 'Value created by the exchange: the total gain to both sides', '$'],
        [String.raw`W`, 'Willingness to pay: the most the buyer would pay for the offer, given the alternatives', '$'],
        [String.raw`P`, 'Price paid', '$'],
        [String.raw`C`, 'Seller’s cost of providing this one sale (only the costs the sale causes)', '$'],
      ],
      assumptions: 'The buyer buys only if P ≤ W, and the seller can keep selling only if P ≥ C. W is the buyer’s own judgement and is rarely known exactly; it depends on the alternatives she has.',
      note: 'The two gains add up to V, whatever the price: the price only shares V out. Economists call the buyer’s gain consumer surplus and the seller’s gain producer surplus. M02’s lesson on pricing approaches uses the same idea to set prices from customers’ value.' },
  ],

  examples: [
    { level: 'simple', title: 'Need, want or demand?', fictional: true,
      setup: 'Classify each statement as a need, a want or demand. (a) Harbor Tech’s staff feel flat and distracted in long afternoon meetings. (b) They would like flat whites made by a barista rather than filter coffee from an urn. (c) Harbor Tech books Lantern to serve 90 people at its next all-staff meeting, at $9 a head. (d) A student would love to take a Lantern workshop but can’t afford $125 this month. (e) A hotel signs three of its staff up for a Lantern workshop at $125 each.',
      steps: [
        'Apply the tests in order. A need is a felt lack; a want is a particular way of meeting it; demand is a want that someone is able and willing to pay for at the price asked.',
        '(a) is a need: a lack of energy and attention that people want to fix. It says nothing yet about how to fix it.',
        '(b) is a want: the form the need has taken for these people. An energy drink or a walk round the block would also meet the need; they want barista coffee.',
        '(c) is demand: the want backed by the ability and the willingness to pay. The booking is worth 90 × $9 = $810 to Lantern.',
        '(d) is a want that is not demand: without the ability to pay $125, it produces no sale at that price. At a lower price, or with a payment plan, it might. (e) is demand: a booking worth 3 × $125 = $375.',
      ],
      answer: '(a) need; (b) want; (c) demand; (d) a want that is not demand at this price; (e) demand.',
      interpretation: 'Only (c) and (e) bring in revenue, yet (a) and (b) tell Lantern why they did, and (d) shows that demand depends on the price. A business that listened only to its bookings would never learn about (a) and (b); one that counted every enthusiastic student as demand would overestimate its market.' },

    { level: 'challenging', title: 'Who buys a workshop place, and who gains?', fictional: true,
      setup: 'Fifteen people enquire about Lantern’s next workshop. Suppose Lantern knew the most each would pay for a place (in practice it can’t; these figures are assumed): $200, $190, $180, $175, $160, $150, $150, $140, $135, $130, $130, $125, $110, $95 and $80. One more place costs Lantern $70 to deliver, and the room holds 15. Compare prices of $100, $125 and $150: how many places sell, what does Lantern gain, what do participants gain, and how much value does the workshop create in total?',
      table: {
        caption: 'One workshop at three prices (assumed willingness to pay; cost $70 a place)',
        head: ['Price', 'Places sold', 'Lantern’s gain', 'Participants’ gain', 'Total value created'],
        align: ['l', 'r', 'r', 'r', 'r'],
        rows: [
          ['$100', '13', '$390', '$675', '$1,065'],
          ['$125', '12', '$660', '$365', '$1,025'],
          ['$150', '7', '$560', '$155', '$715'],
        ],
      },
      steps: [
        'Find who buys at $125. A person buys if the price is no more than her willingness to pay. Twelve of the fifteen figures are $125 or more, so 12 places sell, which is the average size of Lantern’s workshops.',
        'Lantern’s gain is the price minus the cost, for each place sold: 12 × ($125 − $70) = $660.',
        'The participants’ gain: their willingness to pay adds up to $1,865, and they pay 12 × $125 = $1,500, so they keep $365 between them. The total value created is $660 + $365 = $1,025, the same as $1,865 − 12 × $70.',
        'Now try $150. Only the 7 people who value a place at $150 or more buy. Lantern gains 7 × $80 = $560 and participants gain $1,205 − 7 × $150 = $155, a total of $715. Five exchanges that would have created value no longer happen, so the total falls by $1,025 − $715 = $310, and Lantern’s own gain falls too.',
        'Now try $100. Thirteen people buy, because the person who values a place at $110 joins. Lantern gains 13 × $30 = $390 and participants gain $1,975 − 13 × $100 = $675: a total of $1,065, the most of the three prices, of which Lantern keeps the least.',
      ],
      answer: 'At $125, 12 places sell, Lantern gains $660 and participants $365: the workshop creates $1,025 of value. At $150 Lantern’s gain falls to $560 and the total to $715; at $100 the total rises to $1,065 but Lantern’s gain falls to $390.',
      interpretation: 'The price does two jobs at once. It decides how many exchanges happen, which is demand at that price, and how the value of each is shared. Lantern can’t see anyone’s willingness to pay, which is why M02 and M04 teach ways to estimate it. Try other prices in the explorer below: $130 also earns Lantern $660, from one fewer participant.' },

    { level: 'applied', title: 'What business is Ferngate Maps in?', fictional: true,
      setup: 'Ferngate Maps (fictional) publishes printed road atlases and folded walking maps. Over five years its road-atlas sales fell from 120,000 copies a year to 45,000, while its walking-map sales rose from 30,000 to 39,000. The board must choose next year’s main investment: (A) a redesigned, more detailed road atlas, or (B) waterproof walking maps sold with a downloadable route that works without a phone signal. The managing director says: “We are a map printer. We should print better maps.” Use the idea of marketing myopia to advise the board.',
      steps: [
        'Measure what happened. Road atlases: (45,000 − 120,000) ÷ 120,000 = −0.625, a fall of 62.5%. Walking maps: (39,000 − 30,000) ÷ 30,000 = 0.30, a rise of 30%. The two products are moving in opposite directions.',
        'Ask what need each product meets. A road atlas meets the need to find the way by car. That need has not gone away; phone navigation and satnav now meet it more conveniently, at no extra cost and always up to date. These are substitutes that a more detailed atlas cannot beat.',
        'A walking map meets a different need: finding a route safely on foot, often in hills where a phone has no signal or its battery runs flat, and choosing a walk worth doing. Here paper still has advantages, and the downloadable route adds what phones do well.',
        'Name the myopia. “We are a map printer” defines Ferngate by its product and its process. Plan A improves the product customers are leaving, as Levitt’s railroads went on thinking only about running railways. A customer-based definition, such as “we help walkers find and enjoy routes they could not plan alone”, points to plan B and to further offers, such as route guides.',
        'Check the definition against Ferngate’s capabilities. Its surveyors, route data and reputation among walkers are what it can build on. “We are in the outdoor-leisure business” would be too broad to guide anything: Ferngate has no advantage in selling tents.',
      ],
      answer: 'Recommend plan B. Road-atlas sales fell 62.5% in five years because substitutes now meet the same need better, while walking-map sales rose 30% where Ferngate’s capabilities still give it an edge.',
      interpretation: 'Curing myopia doesn’t mean abandoning the old product overnight: road atlases may still earn money for years, and Ferngate can keep selling them with little new investment. The point is where to invest next. The board should also test plan B before committing to it fully, for example by selling the map-and-route bundle in two regions first.' },
  ],

  demo: [
    { widget: 'wim-workshop-price', intro: 'The fifteen people from the challenging example, each with an assumed willingness to pay, and Lantern’s cost per place. Move the price and watch three things: how many places sell (demand at that price), how much Lantern keeps, and how much value the workshop creates in total. Then raise the cost per place and see which prices stop making sense for Lantern. The chart shows Lantern’s gain and the total value at prices from $50 to $220, in $10 steps.' },
  ],

  mistakes: [
    { title: '“Marketing means advertising and selling.”', html: 'Advertising is part of one of the four activities in the AMA’s definition. Marketing starts earlier, with understanding customers and deciding what to offer them and at what price, and it continues after the sale, with keeping customers. Advertising a poor offer only speeds up the moment customers find out.' },
    { title: '“Marketing creates needs.”', html: 'Needs come from people’s lives: to stay alert, to belong, to look after others. Marketing shapes the wants through which people meet them, and it can shape them badly, which is why ethics matters. Saying that marketing creates needs blames the wrong thing and hides what marketers are actually responsible for.' },
    { title: '“If people want it, there is demand for it.”', html: 'Demand needs the ability and the willingness to pay, at the price asked. Many people who would like a barista course will not pay $125 for one. Count demand at a price, not enthusiasm.' },
    { title: '“In an exchange, one side’s gain is the other side’s loss.”', html: 'In a voluntary exchange both sides expect to gain: the customer values the offer at more than the price, and the seller receives more than its cost. The price shares out the value created; it doesn’t decide whether value is created. In the workshop example the exchange creates $110, and each side keeps $55.' },
    { title: '“To avoid myopia, define the business as broadly as possible.”', html: 'A definition such as “we are in the happiness business” reveals no substitutes and guides no decision. Define the business by a real customer need, for identifiable customers, that the business’s capabilities let it serve.' },
    { title: '“Marketing is for companies that sell to consumers.”', html: 'Businesses that sell to other businesses, service firms, charities, hospitals and public bodies all need to understand the people they serve and to offer them something worth their money, time or effort. Kotler and Levy made this argument in 1969, and Lantern’s catering is itself a business-to-business service.' },
  ],

  application: [
    { case: 'Brackwater Blood Service, a fictional regional blood-donation service, needs 1,200 donations a month from donors aged 18 to 24 to replace older donors as they stop giving. It is collecting 840, 70% of what it needs. Its new marketing manager, Imogen, has nothing to sell and no price to set, and she still has a marketing job to do.' },
    { p: 'She starts with exchange. A donor gives an hour of her time, some discomfort and a little anxiety. In return she gets the knowledge that her blood may save a life, a short health check, and a drink and a biscuit. No money changes hands, but the exchange still has to leave the donor feeling better off, or she won’t come back. The “price” Imogen can work on is the time and effort that donating costs.' },
    { p: 'Next come needs, wants and demand. The need to help others is not the problem, and many young adults say they would like to give blood. What is missing is demand in the marketing sense: the willingness and ability to give at the current “price”. A survey of 400 young people who have never donated (fictional) shows why: 46% had never been asked or didn’t know where to go, 33% couldn’t reach sessions held during working hours, and 21% were afraid of needles.' },
    { p: 'Each finding points to a different part of the offer. The 46% need information and an invitation: a booking app, and a campaign that asks them directly. The 33% need a lower time cost: evening sessions on two university campuses. The 21% need reassurance: short videos of first-time donors, and the option to come with a friend. Imogen avoids myopia by defining the service around the donor’s experience of giving rather than around “collecting blood”, which would have led her to count only the units collected and ignore why people stay away.' },
    { p: 'Six months later the service collects 1,020 donations a month from 18-to-24-year-olds, 180 more than before, a rise of about 21%, and still short of the 1,200 it needs. Imogen reports both numbers, then goes back to step one of the marketing process: which donors gave once and didn’t return, and why? The work is recognisably marketing, the same work a brand manager does for a can of cold brew, with time and goodwill in place of money.' },
  ],

  summary: [
    'Marketing is creating, communicating, delivering and exchanging offerings that have value for customers, partners and society (the AMA); Kotler (1972) described it as creating and offering value to others to achieve a desired response.',
    'A voluntary exchange creates value for both sides. The value created is the buyer’s willingness to pay minus the seller’s cost, and the price divides it between them.',
    'A need is a felt lack; a want is the form the need takes; demand is a want backed by the ability and willingness to pay, always at a price.',
    'A market offering combines goods, services, information and experiences. The customer chooses and pays; the consumer uses the offering; they are not always the same.',
    'Marketing myopia (Levitt, 1960) is defining a business by its product instead of the need it serves. The cure is a customer-based definition that is still specific enough to guide decisions.',
    'The marketing process: understand customers, design a customer-driven strategy, build the offer, build profitable relationships and capture value in return, then learn and repeat.',
    'Marketing applies in consumer, business, service and non-profit settings; what changes is who buys, what is exchanged and how decisions are made.',
  ],

  glossary: [
    { term: 'Marketing', def: 'The activity of creating, communicating, delivering and exchanging offerings that have value for customers, clients, partners and society (a paraphrase of the American Marketing Association’s definition).' },
    { term: 'Exchange (marketing)', def: 'Obtaining something of value from someone by offering something in return. It needs at least two parties, each with something the other values, each able to communicate and deliver, and each free to accept or reject the offer.' },
    { term: 'Willingness to pay', def: 'The most a customer would pay for an offer, given the alternatives open to them. It is the customer’s own judgement and is rarely known exactly.' },
    { term: 'Need', def: 'A state of felt lack that a person or organisation is motivated to fix, such as staying alert or feeling valued at work.' },
    { term: 'Want', def: 'The particular form a need takes, shaped by culture, experience and the options a person knows about.' },
    { term: 'Demand', def: 'A want backed by the ability and the willingness to pay for it. Demand is always demand at a particular price.' },
    { term: 'Market offering', def: 'The combination of goods, services, information and experiences a business offers to satisfy a need or want.' },
    { term: 'Market', def: 'The set of actual and potential buyers of an offering.' },
    { term: 'Customer', def: 'The person or organisation that chooses and pays for an offering. The customer is not always the consumer who uses it.' },
    { term: 'Consumer', def: 'The person who uses an offering, who may or may not be the customer who chose and paid for it.' },
    { term: 'Marketing myopia', def: 'Defining a business by the product it makes rather than the customer need it serves, which hides substitutes and changes in what customers want (Theodore Levitt, 1960).' },
    { term: 'Marketing process', def: 'The five steps of marketing work used in this course: understand customers and the market, design a customer-driven strategy, build the offer, build profitable relationships, and capture value in return.' },
    { term: 'Customer equity', def: 'The potential profit a business can earn from its current and potential customers.' },
    { term: 'Business-to-consumer', def: 'Marketing to individuals and households who buy for their own use. Abbreviated B2C.' },
    { term: 'Business-to-business', def: 'Marketing to organisations that buy for their own operations or to resell. Abbreviated B2B.' },
  ],

  references: [
    { text: 'American Marketing Association. “Definitions of Marketing”: the definition of marketing, and the note that a panel of five scholars (the 2017 panel) reviews the AMA’s definitions.', url: 'https://www.ama.org/the-definition-of-marketing-what-is-marketing/', checked: '2026-10-23' },
    { text: 'Kotler, P. (1972). A generic concept of marketing. <i>Journal of Marketing</i>, 36(2), 46–54. The abstract was consulted.', url: 'https://doi.org/10.1177/002224297203600209', checked: '2026-10-23' },
    { text: 'Kotler, P. &amp; Levy, S. J. (1969). Broadening the concept of marketing. <i>Journal of Marketing</i>, 33(1), 10–15. The abstract was consulted.', url: 'https://doi.org/10.1177/002224296903300103', checked: '2026-10-23' },
    { text: 'Levitt, T. (1960, July–August). Marketing myopia. <i>Harvard Business Review</i>, 45–56. Reprinted in <i>Harvard Business Review</i>, July–August 2004 (the page consulted); the 1960 publication details were confirmed from EBSCO’s Research Starter on marketing myopia.', url: 'https://hbr.org/2004/07/marketing-myopia', checked: '2026-10-23' },
    { text: 'Gomez Albrecht, M., Green, M. &amp; Hoffman, L. (2023). <i>Principles of Marketing</i>, sections 1.1 “Marketing and the Marketing Process” and 1.5 “Determining Consumer Needs and Wants”. OpenStax.', url: 'https://openstax.org/books/principles-marketing/pages/1-1-marketing-and-the-marketing-process', checked: '2026-10-23' },
    { text: 'U.S. Bureau of Labor Statistics. “Advertising, Promotions, and Marketing Managers”, <i>Occupational Outlook Handbook</i>: what they do.', url: 'https://www.bls.gov/ooh/management/advertising-promotions-and-marketing-managers.htm', checked: '2026-10-23' },
  ],

  checks: [
    { what: 'Catering clients (case.js)', value: BUSINESS.catering.clients, shown: 18 },
    { what: 'Workshops held (case.js)', value: W.held, shown: 14 },
    { what: 'Average participants (case.js)', value: W.avgParticipants, shown: 12 },
    { what: 'Workshop price per place (case.js)', value: W.pricePerPerson, shown: 125 },
    { what: 'Online customers by December (case.js)', value: BUSINESS.online.customers, shown: 1500 },
    { what: 'Catering price per head (case.js)', value: BUSINESS.catering.pricePerHead, shown: 9 },
    { what: 'Harbor Tech employees (case.js)', value: HARBOR_TECH.employees, shown: 300 },
    { what: 'Clients interviewed (case.js)', value: CLIENT_INTERVIEWS.interviewed, shown: 12 },
    { what: 'Café owner: value created', value: 180 - 70, shown: 110 },
    { what: 'Café owner: her gain', value: 180 - W.pricePerPerson, shown: 55 },
    { what: 'Café owner: Lantern’s gain', value: W.pricePerPerson - 70, shown: 55 },
    { what: 'Simple: 90 heads at $9', value: 90 * BUSINESS.catering.pricePerHead, shown: 810 },
    { what: 'Simple: three places at $125', value: 3 * W.pricePerPerson, shown: 375 },
    { what: 'Enquirers', value: ENQ.length, shown: 15 },
    { what: 'Places sold at $125 equals the case average', value: buyers(125).length, shown: W.avgParticipants },
    { what: 'Lantern’s gain at $125', value: seller(125), shown: 660 },
    { what: 'Willingness to pay of buyers at $125', value: sumW(125), shown: 1865 },
    { what: 'Paid at $125', value: 12 * 125, shown: 1500 },
    { what: 'Participants’ gain at $125', value: keep(125), shown: 365 },
    { what: 'Total value at $125', value: seller(125) + keep(125), shown: 1025 },
    { what: 'Total value at $125, second route', value: sumW(125) - 12 * COST, shown: 1025 },
    { what: 'Places sold at $150', value: buyers(150).length, shown: 7 },
    { what: 'Margin per place at $150', value: 150 - COST, shown: 80 },
    { what: 'Lantern’s gain at $150', value: seller(150), shown: 560 },
    { what: 'Willingness to pay of buyers at $150', value: sumW(150), shown: 1205 },
    { what: 'Participants’ gain at $150', value: keep(150), shown: 155 },
    { what: 'Total value at $150', value: seller(150) + keep(150), shown: 715 },
    { what: 'Exchanges lost at $150', value: buyers(125).length - buyers(150).length, shown: 5 },
    { what: 'Total value lost at $150', value: (seller(125) + keep(125)) - (seller(150) + keep(150)), shown: 310 },
    { what: 'Places sold at $100', value: buyers(100).length, shown: 13 },
    { what: 'Margin per place at $100', value: 100 - COST, shown: 30 },
    { what: 'Lantern’s gain at $100', value: seller(100), shown: 390 },
    { what: 'Willingness to pay of buyers at $100', value: sumW(100), shown: 1975 },
    { what: 'Participants’ gain at $100', value: keep(100), shown: 675 },
    { what: 'Total value at $100', value: seller(100) + keep(100), shown: 1065 },
    { what: 'Lantern’s gain at $130 (explorer)', value: seller(130), shown: 660 },
    { what: 'Places sold at $130', value: buyers(130).length, shown: 11 },
    { what: 'Ferngate: road-atlas change', value: (45000 - 120000) / 120000, shown: -0.625 },
    { what: 'Ferngate: walking-map change', value: (39000 - 30000) / 30000, shown: 0.30 },
    { what: 'Brackwater: share of need met', value: 840 / 1200, shown: 0.70 },
    { what: 'Brackwater: survey shares add to 100%', value: 46 + 33 + 21, shown: 100 },
    { what: 'Brackwater: extra donations', value: 1020 - 840, shown: 180 },
    { what: 'Brackwater: rise (%)', value: (1020 - 840) / 840 * 100, shown: 21, tol: 0.5 },
  ],
};
