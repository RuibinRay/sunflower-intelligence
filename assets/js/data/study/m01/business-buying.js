// business-buying.js — M01 · How organisations buy. Content only; exercises are in business-buying.ex.js.
// Lantern and Harbor Tech facts come from ./case.js and f01/case.js (fictional). The lesson teaches the buying-centre
// roles with Harbor Tech's people but leaves the full role map, and the approval question, to the course project.
// Every other business, person and number is fictional unless a source is cited. `checks` recompute every printed number.
import { BUSINESS, HARBOR_TECH } from './case.js?v=17';
import { SHOP } from '../b01/case.js?v=17';

const H = HARBOR_TECH;
const person = Object.fromEntries(H.people.map((p) => [p.name, p]));
const hana = person['Hana Hallett'];
const tom = person['Tom Okoye'];
const lena = person['Lena Brooks'];
const marco = person['Marco Diaz'];
const C = BUSINESS.catering;

/** Vans needed and ordered when end demand changes: orders = vans needed − vans still in service after retirements. */
function fleet(K0, d, growth) {
  let need = K0, act = K0;
  return growth.map((g) => {
    need *= 1 + g;
    const inService = act * (1 - d);
    const now = Math.max(need, inService);
    const orders = now - inService;
    act = now;
    return { need, inService, orders };
  });
}
const SWIFT = fleet(100, 0.1, [0.1, 0, -0.1]);
const PUMPS = { units: 120, price: 3200, service: 18000, years: 5, limit: 250000 };

const CENTRE = '<svg viewBox="0 0 640 356" xmlns="http://www.w3.org/2000/svg" font-family="inherit" font-size="13">'
  + '<circle cx="320" cy="160" r="62" style="fill:none;stroke:currentColor;stroke-width:2"/>'
  + '<text x="320" y="156" text-anchor="middle" font-weight="700" fill="currentColor">The purchase</text><text x="320" y="174" text-anchor="middle" fill="currentColor">decision</text>'
  + [['Initiator', 'suggests the purchase', 6, 18, 1], ['Users', 'will use the product', 6, 134, 2], ['Influencers', 'shape the specification', 6, 250, 3],
    ['Gatekeepers', 'control access to others', 438, 18, 1], ['Buyers', 'deal with suppliers', 438, 134, 2], ['Deciders', 'choose or approve', 438, 250, 3]]
    .map(([role, what, x, y, s]) => `<rect x="${x}" y="${y}" width="196" height="56" rx="8" style="fill:none;stroke:var(--series-${s});stroke-width:2"/><text x="${x + 98}" y="${y + 23}" text-anchor="middle" font-weight="700" fill="currentColor">${role}</text><text x="${x + 98}" y="${y + 42}" text-anchor="middle" font-size="12" fill="currentColor">${what}</text>`).join('')
  + '<g style="stroke:var(--rule-strong);stroke-width:1.5"><line x1="202" y1="46" x2="274" y2="118"/><line x1="202" y1="162" x2="258" y2="161"/><line x1="202" y1="278" x2="274" y2="202"/><line x1="438" y1="46" x2="366" y2="118"/><line x1="438" y1="162" x2="382" y2="161"/><line x1="438" y1="278" x2="366" y2="202"/></g>'
  + '<text x="320" y="330" text-anchor="middle" font-size="12" fill="currentColor">One person can hold several roles, and several people can share one.</text>'
  + '<text x="320" y="347" text-anchor="middle" font-size="12" fill="currentColor">The roles change from purchase to purchase.</text>'
  + '</svg>';

export default {
  slug: 'business-buying',
  title: 'How organisations buy',
  blurb: 'Organisations buy differently from households: their demand is derived from their own customers’, they are fewer and larger, purchasing is a profession, and several people share each decision. Learn the three buying situations, the six roles in a buying centre, the stages of the business buying process and the procurement rules that decide how a seller must sell.',
  status: 'reviewed',
  objectives: [
    'Compare business and consumer markets, and calculate how a change in end demand is amplified in orders for equipment.',
    'Classify purchases as straight rebuys, modified rebuys or new tasks, and explain what each means for the current supplier and a challenger.',
    'Identify the roles in a buying centre (initiators, users, influencers, buyers, deciders and gatekeepers) from what people do in a purchase.',
    'Describe the stages of the business buying process and the procurement rules that govern it.',
    'Recommend how a seller should approach an organisational buyer.',
  ],
  prerequisites: [
    { lesson: 'm01/what-is-marketing', why: 'The lesson builds on the distinction between business-to-consumer and business-to-business marketing.' },
    { lesson: 'm01/consumer-decisions', why: 'The business buying process is compared with the five-stage consumer process, and supplier choice uses the weighted-attribute model.' },
    { text: 'Percentages: finding 10% of a number and increasing a number by 15%, for the calculations of derived demand.' },
  ],
  case: 'lantern',

  concept: [
    { case: `Harbor Tech, a ${H.employees}-person software firm, has been a Lantern catering client since its first month: in March 2026 it paid a $2,400 deposit for three catered events at $800 each. Lantern’s catering now has ${C.clients} corporate clients, each booking about ${C.eventsPerClientYear} events a year at about $${C.revenuePerEvent} an event.` },
    { case: 'When Ana asks how Harbor Tech decides to book, five answers come back. Harbor Tech and its people are fictional.' },
    { list: [
      `${hana.name}, the ${hana.role}, ${hana.part}.`,
      `${tom.name}, the ${tom.role}, ${tom.part}.`,
      `${lena.name}, the ${lena.role}, ${lena.part}.`,
      `The staff, about ${H.employees} people, drink the coffee and fill in the event feedback form.`,
      `${marco.name}, the ${marco.role}, decides which sales calls and samples reach Hana.`,
    ] },
    { p: 'None of those five people is “the customer”. Each takes part in the decision in a different way, and a caterer who talks only to the person who places the order may never reach the people who started the idea, who drink the coffee or who sign the larger cheques. This is what makes organisational buying different, and this lesson gives you the tools to analyse it.' },
    { p: 'Organisations that buy include businesses buying inputs and services to produce what they sell, resellers such as wholesalers and retailers buying goods to sell on, governments, and institutions such as hospitals, universities and charities. Selling to them is <g>business-to-business</g> marketing, and their purchases together make up the <g>business market</g>.' },

    { h: 'How business markets differ' },
    { table: {
      caption: 'Consumer and business markets: typical differences',
      head: ['', 'Consumer markets (B2C)', 'Business markets (B2B)'],
      rows: [
        ['Who buys', 'Individuals and households, for their own use', 'Businesses, resellers, governments and institutions, to operate or to resell'],
        ['Number and size of buyers', 'Many buyers, each buying small amounts', 'Fewer buyers, each buying more; a few customers can be most of a supplier’s sales'],
        ['Where demand comes from', 'The buyer’s own needs and wants', 'Derived from the demand for what the organisation produces or does'],
        ['Who decides', 'One person or a household', 'Several people, often including professional purchasers'],
        ['How they buy', 'Mostly informally, often quickly', 'Formally: specifications, quotes, approvals and contracts'],
        ['Relationship', 'Often anonymous, through retailers', 'Often direct, long-term and negotiated, with personal selling'],
      ],
      note: 'These are tendencies. A small firm buying one laptop behaves much like a household, and a family buying a home goes through a process as formal as many companies’.',
    } },
    { p: 'The difference with the biggest consequences is where demand comes from. <g>Derived demand</g> is demand for a product that arises from the demand for what it helps to produce. Harbor Tech doesn’t want coffee for its own sake: it wants it for staff events, which depend on how many people it employs, how well it is doing and how much it cares about staff engagement. If its sales fall and it cuts events, no price Lantern can offer will bring the bookings back. A business seller therefore has to watch its customers’ markets, not just its customers.' },
    { p: 'Size matters too. Lantern’s online shop serves about 1,500 customers, and its average order value in each month from July to December 2026 was between about $41 and $55. Its catering serves 18 clients, each worth thousands of dollars a year. Losing one online customer is barely noticed; losing one catering client is felt at once. With so few, so valuable customers, the relationship with each one is worth managing deliberately.' },

    { h: 'Three buying situations' },
    { p: 'Not every organisational purchase is the same kind of decision. Patrick Robinson and Charles Faris, with Yoram Wind (1967), distinguished three buying situations, or buy classes, by how new the purchase is to the organisation, how much information it needs and how many alternatives it considers.' },
    { define: [
      ['Straight rebuy', 'The buyer reorders something it has bought before, from the same supplier, on the same terms, often routinely and by someone low in the organisation. Little information is sought and few people are involved.'],
      ['Modified rebuy', 'The buyer wants to change something about a repeat purchase: the specification, the price, the terms or the supplier. More people get involved, more information is sought, and other suppliers get a chance.'],
      ['New task', 'The organisation buys something for the first time. Risk and uncertainty are highest, so it seeks the most information, considers the most alternatives and involves the most people.'],
    ] },
    { p: 'Each situation favours someone different. In a <g>straight rebuy</g> the current supplier, the in-supplier, holds a strong position and its job is to keep quality and service high enough that nobody thinks of looking elsewhere. An out-supplier, any competitor, usually has to turn the purchase into a <g>modified rebuy</g>, giving the buyer a reason to reconsider, such as a better total cost or a problem it can solve. A <g>new task</g> is open to all, and suppliers who help the buyer understand its own need early often shape the specification in their favour.' },

    { h: 'The buying centre' },
    { p: 'The <g>buying centre</g>, also called the decision-making unit, is everyone in an organisation who takes part in a purchase decision. Frederick Webster and Yoram Wind (1972) described five roles in it: users, influencers, buyers, deciders and gatekeepers. Many textbooks, OpenStax among them, add a sixth, the initiator.' },
    { figure: {
      svg: CENTRE,
      caption: 'The six roles in a buying centre. The roles describe what people do in one purchase, not their job titles.',
      alt: 'A circle labelled “The purchase decision” is joined by lines to six boxes, three on each side. On the left: Initiator, who suggests the purchase; Users, who will use the product; Influencers, who shape the specification. On the right: Gatekeepers, who control access to the others; Buyers, who deal with suppliers; Deciders, who choose or approve. A note says one person can hold several roles, several people can share one role, and the roles change from purchase to purchase.',
    } },
    { define: [
      ['Initiator', 'The person who first suggests the purchase, often because they notice a problem.'],
      ['User', 'The people who will use the product or service. They often start the purchase and help define what is needed, and their experience decides whether it is bought again.'],
      ['Influencer', 'People whose views or expertise shape the specification or the choice without making the final decision: engineers, specialists, consultants, and users whose feedback is asked for. Not to be confused with a social-media influencer.'],
      ['Buyer', 'The person with formal responsibility for dealing with suppliers and arranging the terms, often a purchasing professional or, in a small firm, whoever handles the paperwork. In this sense “buyer” is a role, not the whole organisation.'],
      ['Decider', 'The person or group with the power to choose the supplier or approve the purchase. For a large purchase this is often someone senior, or a committee.'],
      ['Gatekeeper', 'Anyone who controls what information and which salespeople reach the others: an executive assistant, an IT manager who vets software suppliers, a purchasing department that insists all contact goes through it.'],
    ] },
    { callout: 'key', title: 'Classify people by what they do, not by their title', html: 'A job title rarely tells you a role. An IT manager can be a gatekeeper, a plant manager can be the decider for small orders and only an influencer for large ones, and a user can be an initiator. One person can hold several roles and several people can share one. Ask, for this purchase: who started it, who will use it, who shapes it, who deals with suppliers, who can say yes, and who controls access?' },
    { case: `Harbor Tech’s five people fill all six roles in its catering purchases between them, and some fill more than one. Working out who plays which role is the first stage of the course project, so this lesson leaves the map to you. When you draw it, use everything the case says about each person, not just their job title.` },
  ],

  theory: [
    { h: 'Derived demand and the acceleration effect' },
    { p: 'Derived demand has a consequence that surprises people. Demand for equipment and other durable inputs depends not only on how much the customer’s own customers buy, but on how fast that is <i>changing</i>. A courier with a fleet of vans replaces a share of the fleet each year as vans wear out. If parcel volumes grow, it must also buy extra vans; if they stop growing, it buys replacements only; if they fall, it may buy nothing at all.' },
    { p: 'So a modest change in end demand produces a large swing in orders for vans. Economists call this the acceleration principle; this lesson calls it the <g>acceleration effect</g>. The challenging example works it through with numbers, and the formula is below.' },
    { p: 'For a supplier of equipment, the lesson is to forecast its customers’ customers. A van maker that read last year’s orders as its trend would expand just as orders were about to halve. The same logic, less sharply, applies to any business input bought in advance of demand: the catering a firm books for staff it plans to hire, the stock a retailer orders for a season it expects to be good.' },

    { h: 'The business buying process' },
    { p: 'Organisational purchases go through more stages than a consumer’s, and the stages are more formal. OpenStax lists eight.' },
    { ol: [
      '<b>Problem recognition.</b> Someone recognises a need or an opportunity, internally (a machine breaks down, staff complain) or externally (a supplier shows a better way).',
      '<b>General need description.</b> The organisation describes in general terms what it needs: how many, what for, how reliable.',
      '<b>Product specification.</b> It turns the need into technical requirements, often with engineers or specialists. A supplier who helps write the specification has an advantage.',
      '<b>Supplier search.</b> It looks for qualified suppliers: those it already knows, trade directories, recommendations, online search.',
      '<b>Proposal solicitation.</b> It asks the qualified suppliers for proposals: a simple quote for a routine item, or a formal <g>request for proposal</g> for a complex one.',
      '<b>Supplier selection.</b> It evaluates the proposals against its criteria and chooses one supplier or several. Many buyers use a weighted scorecard, the weighted-attribute model of the consumer-decisions lesson applied to suppliers.',
      '<b>Order-routine specification.</b> It sets the terms of the order: quantities, delivery schedules, service levels, payment terms, warranties.',
      '<b>Performance review.</b> It judges how the supplier performed, and decides whether to continue, change the terms or switch.',
    ] },
    { p: 'Not every purchase goes through every stage. Robinson, Faris and Wind set the stages against the three buying situations, in what became known as the buygrid. The table shows the usual pattern.' },
    { table: {
      caption: 'Which stages each buying situation usually goes through',
      head: ['Stage', 'New task', 'Modified rebuy', 'Straight rebuy'],
      rows: [
        ['Problem recognition', 'Yes', 'Maybe', 'No (reordering is routine)'],
        ['General need description', 'Yes', 'Maybe', 'No'],
        ['Product specification', 'Yes', 'Yes', 'Yes (unchanged)'],
        ['Supplier search', 'Yes', 'Maybe', 'No'],
        ['Proposal solicitation', 'Yes', 'Maybe', 'No'],
        ['Supplier selection', 'Yes', 'Maybe', 'No'],
        ['Order-routine specification', 'Yes', 'Maybe', 'No (the routine exists)'],
        ['Performance review', 'Yes', 'Yes', 'Yes'],
      ],
      note: 'A typical pattern, not a rule. Textbooks differ in the details; the point is that rebuys skip most of the search and evaluation.',
    } },
    { p: 'Compared with the five consumer stages, the business process splits the consumer’s evaluation into specification, search, proposals and selection, and turns post-purchase behaviour into a formal performance review. Like the consumer model, it is a checklist rather than a law: stages overlap, loop back and are sometimes skipped even in large purchases.' },

    { h: 'How organisations choose suppliers' },
    { p: 'Business buyers weigh more than the price. They care about the <g>total cost of ownership</g>: everything the organisation will pay to acquire, use, maintain and eventually replace the product, which can make a dearer offer cheaper in practice. They care about risk: what happens if a delivery is late, the product fails or the supplier goes out of business. They care about service, reliability and flexibility. And the people in the buying centre care about their own position: Thomas Bonoma (1982) argued that buyers act in their own interest as they see it, and that the person with the title is not always the one who controls the purchase. A purchasing manager, for example, may prefer the supplier least likely to get her blamed if something goes wrong.' },
    { p: 'This is why business buyers are often described as rational and personal at once. A proposal must make the economic case on paper, for the decider and the procurement process, and also answer each person’s own question: will it work for the users, will it meet the engineer’s specification, will the decider be glad they approved it?' },

    { h: 'Procurement rules' },
    { p: 'Most organisations of any size write down how purchases must be made. The rules protect them against waste, error and fraud, and a seller who doesn’t know them can lose a sale it had already won in conversation. Common features include:' },
    { list: [
      '<b>Approval limits.</b> Each person may commit the organisation only up to an <g>approval limit</g>; above it, someone more senior or a committee must approve. The person who places orders is often not allowed to approve large ones.',
      '<b>Competition thresholds.</b> Purchases above a set value need several written quotes, and above a higher value a formal tender or request for proposal, evaluated against published criteria.',
      '<b>Approved suppliers.</b> Staff may have to buy from an <g>approved supplier list</g> of vetted suppliers, so a new supplier must first be approved, which can take weeks.',
      '<b>Separation of duties.</b> The person who requests a purchase, the one who approves it and the one who pays for it are kept apart, the <g>segregation of duties</g> that F01 introduced as an internal control.',
      '<b>Ethics rules.</b> Limits on gifts and hospitality, declarations of conflicts of interest and, during a tender, rules that suppliers may contact only the named procurement officer. Bribery is illegal; in the United States, the Foreign Corrupt Practices Act forbids bribing foreign officials, and OpenStax discusses it in its chapter on business buying.',
    ] },
    { p: 'Public bodies have the strictest rules, because they spend public money. In the United States, the Federal Acquisition Regulation (FAR) governs purchases by federal agencies. Its thresholds are adjusted for inflation: the current ones took effect on 1 October 2025, up from $10,000 and $250,000, and the version in force is FAC 2026-01, effective 13 March 2026.' },
    { p: 'Under the FAR, a purchase at or below the micro-purchase threshold of $15,000 may be made without seeking competing quotations if the price is reasonable, and such purchases are to be spread fairly among qualified suppliers as far as practicable. Between that and the simplified acquisition threshold of $350,000, the contracting officer must promote competition as far as practicable and, where the purchase is not advertised publicly, should consider asking at least three sources. A requirement may not be split into several smaller purchases just to get under a threshold. Larger purchases follow more formal procedures still. Other countries’ governments, and many hospitals, universities and companies, have equivalent rules with their own thresholds.' },
    { callout: 'warn', title: 'Rules change and differ', html: 'Thresholds are revised from time to time, and every organisation sets its own. Treat the figures here as an illustration of how procurement rules work, and check the current rules of any organisation you sell to before you plan the sale.' },

    { h: 'Selling to organisations' },
    { p: 'The ideas of this lesson add up to a plan for selling to an organisation. Find out which buying situation you are in, because it decides whether you are defending, challenging or starting from scratch. Map the buying centre by what people do, and plan what each role needs to hear: users want something that works in their day, influencers want their technical criteria met, deciders want the economic case and a low risk of regret, buyers want a complete, compliant proposal on time, and gatekeepers want a reason to let you through.' },
    { p: 'Learn the procurement rules early, so that your proposal fits the approval limits and competition thresholds rather than running into them. Lower the buyer’s risk with trials, references, guarantees and clear service terms. And remember that in a business market the sale is often the start of a relationship: performance reviews decide the next purchase, and a straight rebuy is won or lost in the months of service before it.' },
  ],

  formulas: [
    { id: 'equipment-orders', name: 'Equipment orders under derived demand (acceleration effect)',
      tex: String.raw`O_t = \max\bigl(0,\; K_t - (1 - d)\,F_{t-1}\bigr) \qquad F_t = \max\bigl(K_t,\; (1 - d)\,F_{t-1}\bigr)`,
      where: [
        [String.raw`O_t`, 'Units of equipment ordered in year t (for example, vans)', 'units'],
        [String.raw`K_t`, 'Units needed in year t, in proportion to the customer’s own demand', 'units'],
        [String.raw`F_t`, 'Units in service at the end of year t, including any spare units kept when demand falls', 'units'],
        [String.raw`F_{t-1}`, 'Units in service at the end of the previous year', 'units'],
        [String.raw`d`, 'Share of the units in service that wear out and are retired each year', 'decimal (0.1 = 10%)'],
        [String.raw`t`, 'Year', ''],
      ],
      assumptions: 'The equipment needed is proportional to the customer’s demand; a fixed share wears out each year; spare equipment is kept rather than sold, so orders can’t fall below zero.',
      note: 'Equivalently, when no units are spare, orders = d × K_{t−1} + (K_t − K_{t−1}): replacements plus growth in the units needed. Because the growth term depends on the change in demand, orders swing by a far larger percentage than demand itself.' },
  ],

  examples: [
    { level: 'simple', title: 'Which buying situation?', fictional: true,
      setup: 'Classify each purchase as a straight rebuy, a modified rebuy or a new task, and say what it means for the current supplier and for a competitor. (a) A hotel group reorders 2,000 bath towels from its usual supplier on the same terms as last quarter. (b) A food manufacturer, unhappy with late deliveries, asks its packaging supplier and two others to quote for a new contract with stricter delivery terms. (c) Swiftline Couriers decides to install its first battery-storage system at its main depot, to cut what it pays for electricity at times of peak demand. All three businesses are fictional.',
      steps: [
        'Ask how new the purchase is. (a) has been bought before, unchanged. (b) has been bought before, but the terms are to change. (c) has never been bought by this organisation.',
        'Ask how much information and how many alternatives the buyer needs. (a) needs none: the order is routine. (b) asks three suppliers for quotes. (c) must learn what battery storage is, what size it needs and who can install it, so it will seek the most information and involve the most people (operations, finance, the site’s electricians, probably an outside consultant).',
        '(a) is therefore a straight rebuy, (b) a modified rebuy and (c) a new task.',
        'What each means for suppliers. In (a) the towel supplier is the in-supplier: it should keep quality and delivery faultless so that nobody thinks of looking elsewhere; a competitor must find a reason to reopen the decision, such as a lower total cost. In (b) the incumbent’s late deliveries have opened the door: it must fix the problem and prove it, while the two challengers have their best chance in years. In (c) nobody is the incumbent, and the supplier that helps Swiftline understand its own need and shape the specification starts with an advantage.',
      ],
      answer: '(a) Straight rebuy. (b) Modified rebuy. (c) New task.',
      interpretation: 'The buying situation tells a seller whether it is defending, challenging or starting from scratch. The same customer can be in all three at once with different products.' },

    { level: 'challenging', title: 'Ten per cent more parcels, twice as many vans', fictional: true,
      setup: 'Swiftline Couriers runs 100 vans and retires 10% of its fleet each year as vans wear out. The number of vans it needs is proportional to its parcel volume. Over three years, parcel volume rises 10%, then stays flat, then falls 10%. How many vans does Swiftline order from its supplier, Ardent Motors, each year, and how does that compare with the change in parcels? Both firms are fictional.',
      table: {
        caption: 'Swiftline’s vans, year by year (fictional)',
        head: ['Year', 'Change in parcels', 'Vans needed', 'Still in service after retirements', 'Vans ordered'],
        align: ['l', 'r', 'r', 'r', 'r'],
        rows: [
          ['1', '+10%', '110', '90', '20'],
          ['2', '0%', '110', '99', '11'],
          ['3', '−10%', '99', '99', '0'],
        ],
      },
      steps: [
        String.raw`Normal year, for comparison: with no growth Swiftline would replace <m>0.1 \times 100 = 10</m> vans.`,
        String.raw`Year 1: it needs <m>100 \times 1.10 = 110</m> vans. After retiring 10 of its 100, it has <m>100 \times 0.9 = 90</m> in service, so it orders <m>110 - 90 = 20</m>: twice the normal 10, a 100% rise in orders from a 10% rise in parcels.`,
        String.raw`Year 2: parcels are flat, so it still needs 110. It retires <m>0.1 \times 110 = 11</m>, leaving 99, and orders <m>110 - 99 = 11</m>. Orders fall from 20 to 11, a drop of 45%, although parcels didn’t fall at all; they merely stopped growing.`,
        String.raw`Year 3: it needs <m>110 \times 0.9 = 99</m> vans. It retires 11 of its 110, leaving exactly 99, so it orders <m>99 - 99 = 0</m>. A 10% fall in parcels wipes out Ardent’s orders from Swiftline.`,
        'Read the pattern. Parcels moved +10%, 0% and −10%; van orders went 20, 11 and 0. Orders depend on the change in parcel volume, not its level, which is why they swing so much more.',
      ],
      answer: 'Swiftline orders 20 vans in year 1, 11 in year 2 and none in year 3, against a normal 10. A 10% rise in parcels doubles orders, a halt in growth cuts them by 45%, and a 10% fall stops them entirely.',
      interpretation: 'For Ardent Motors, Swiftline’s orders are derived demand, and they swing far more than the parcel market behind them. Ardent should forecast parcel volumes, its customers’ customers, rather than extrapolate its own order book, and should expect its sales to fall when its customers’ growth merely slows. Try other paths in the explorer below.' },

    { level: 'applied', title: 'Selling smart infusion pumps to a hospital', fictional: true,
      setup: `Kessler Medical wants to sell Westmere General Hospital 120 “smart” infusion pumps, which check each dose against a library of drugs before delivering it, at $3,200 each, with a five-year service contract at $18,000 a year. The hospital has never used smart pumps. Its rules say any purchase over $250,000 needs a formal tender, evaluated by a panel, and approval by the capital committee, chaired by the chief financial officer, Petra Nakamura. During a tender, suppliers may contact only the procurement manager, Joel Pike. The account manager has learned the following. Greta Ashby, the director of nursing, asked for the review after ward staff reported two near-misses with doses. About 400 ward nurses will use the pumps, and a panel of six nurses will try the shortlisted models on wards. Felix Moss, head of biomedical engineering, will write the technical specification and maintain the pumps. Sana Yusuf, the infection-prevention lead, must confirm that the pumps can be cleaned to the hospital’s standard before any can be bought. Map the buying centre and plan Kessler’s approach. Every name is fictional.`,
      steps: [
        'Buying situation: the hospital has bought infusion pumps before, but never smart pumps, a new technology with new software, training and risks. That makes it a new task: the most information, the most people and the most uncertainty.',
        String.raw`Size and rules: <m>120 \times \$3{,}200 = \$384{,}000</m> for the pumps, plus <m>5 \times \$18{,}000 = \$90{,}000</m> of service, <m>\$474{,}000</m> in all. Whether the hospital counts the pumps alone ($384,000) or the whole contract ($474,000), the purchase is above the $250,000 threshold, so there will be a formal tender and the capital committee must approve it.`,
        'Roles, by what each person does in this purchase. Greta started it: the initiator, and as director of nursing a strong influencer. The ward nurses are the users, and the six on the trial panel are also influencers. Felix shapes the specification: an influencer. Sana can block any pump that fails her cleaning standard: an influencer with a veto, a role some textbooks call an approver. Joel runs the tender and handles all supplier contact: the buyer, and during the tender the gatekeeper. Petra and the capital committee approve the purchase: the deciders.',
        'Plan by role. For the nurses, a ward trial with good training and quick support, because their experience will decide the panel’s view. For Greta, evidence on how dose checking prevents errors, the outcome she cares about. For Felix, full technical documentation and maintenance terms. For Sana, validated cleaning instructions before the tender closes. For Petra’s committee, the five-year cost of ownership and the cost of the errors the pumps are meant to prevent. For Joel, a complete, compliant bid on time, and no attempt to lobby the others behind his back during the tender, which could disqualify Kessler.',
      ],
      answer: 'A new task worth $474,000 including service, so a formal tender and committee approval. Initiator: Greta Ashby. Users: the ward nurses. Influencers: the nurse trial panel, Felix Moss, Sana Yusuf (with a veto) and Greta. Buyer and, during the tender, gatekeeper: Joel Pike. Deciders: Petra Nakamura and the capital committee. Kessler’s plan addresses each role’s concern and respects the tender rules.',
      interpretation: 'No single person could have bought the pumps, and several could have stopped the purchase. A salesperson who had spent the year entertaining the procurement manager, or who had convinced only the director of nursing, would have lost. The plan works because it starts from what each person does and needs, and from the rules, which decide when and how they can be reached.' },
  ],

  demo: [
    { widget: 'bb-accelerator', intro: 'The acceleration effect for a courier’s van fleet. Start with the challenging example: 100 vans, 10% retired each year, parcels +10%, then 0%, then −10%. Then try a gentler slowdown (+10%, +5%, 0%) and notice that van orders fall while parcels are still growing. Finally lower the retirement rate: the longer equipment lasts, the more violently orders swing.' },
  ],

  mistakes: [
    { title: '“The buyer is the person who decides.”', html: 'In a buying centre, the buyer is the role that deals with suppliers and terms. The decider may be someone else, and for a large purchase often is. Find out who can say yes, and up to what amount.' },
    { title: '“A job title tells you someone’s role.”', html: 'Roles are defined by what people do in a particular purchase. An IT manager can be a gatekeeper, a nurse can be the initiator, and a plant manager can be the decider for small orders and only an influencer for large ones.' },
    { title: '“Win over the person you talk to and you have won the sale.”', html: 'Organisational purchases are shared decisions. A seller who reaches only one member of the buying centre leaves the others to be persuaded by someone else, or not at all.' },
    { title: '“Business buyers only care about price.”', html: 'They care about total cost of ownership, reliability, risk and service, and the people involved care about how the decision reflects on them. A higher price can win if it lowers total cost or risk.' },
    { title: '“Orders for business equipment move in step with consumer demand.”', html: 'Derived demand for equipment depends on the change in end demand, so it swings far more. In the Swiftline example a 10% rise in parcels doubled van orders and a halt in growth cut them by 45%.' },
    { title: '“A newcomer can’t win a straight rebuy.”', html: 'Not as a straight rebuy, but a challenger can give the buyer a reason to reopen the decision, turning it into a modified rebuy: a lower total cost, a solution to a problem the in-supplier hasn’t fixed, or a better service level.' },
  ],

  application: [
    { case: 'Corvid Energy, a fictional supplier of battery-storage systems for warehouses and depots, has heard that Swiftline Couriers is looking at battery storage for its main depot. Its key account manager, Amara Rhee, prepares an account plan before she makes contact.' },
    { p: 'She starts with derived demand. Swiftline’s electricity use, and its need for storage, follows its parcel volumes, and its interest in cutting costs follows its margins. Amara reads Swiftline’s annual report and the forecasts for parcel volumes in its region, and notes that a firm whose volumes have just stopped growing will want a short payback.' },
    { p: 'Next, the buying situation and the rules. Swiftline has never bought storage: a new task, so it will need education, and the supplier that helps it understand peak-demand charges may shape the specification. Swiftline’s published guide for suppliers says that any purchase over $100,000 needs three written proposals and board approval, so a request for proposal is likely. She makes sure Corvid is on Swiftline’s approved supplier list before the request goes out, because it can take weeks to be added.' },
    { p: 'Then the buying centre. The operations director raised the idea after the depot’s electricity bill rose: the initiator. The site electricians will live with the system: users, and influencers through their view of safety and maintenance. An outside energy consultant will draft the specification: an influencer. The procurement team will run the request for proposal and control contact with suppliers while it is open: buyer and gatekeeper. The finance director and the board will decide.' },
    { p: 'Amara’s plan gives each a reason to favour Corvid: a site survey and safety briefing for the electricians, open data on performance for the consultant, a ten-year total cost of ownership for finance, and a performance guarantee to lower the board’s risk.' },
    { p: 'Finally, the relationship. If Corvid wins, the first installation becomes a reference for Swiftline’s other depots, which would be modified rebuys rather than new tasks, and the maintenance contract becomes a straight rebuy that Corvid must defend with good service. Amara’s plan therefore runs past the sale, to the performance review that will decide the next one. The same reasoning lets Lantern plan its catering sales: the course project asks you to apply it to Harbor Tech.' },
  ],

  summary: [
    'Business markets differ from consumer markets: demand is derived, buyers are fewer and larger, purchasing is professional and formal, several people share each decision, and relationships last.',
    'Derived demand for equipment depends on the change in end demand, so orders swing far more than the market behind them (the acceleration effect).',
    'Robinson, Faris and Wind’s three buying situations, the straight rebuy, the modified rebuy and the new task, differ in newness, information needed and people involved; each favours the in-supplier or a challenger differently.',
    'A buying centre has six roles: initiator, users, influencers, buyer, decider and gatekeeper. Identify them by what people do in the purchase, not by job title; one person can hold several.',
    'The business buying process has eight stages, from problem recognition to performance review; rebuys skip most of the search and evaluation.',
    'Business buyers weigh total cost of ownership, risk and service as well as price, and work within procurement rules: approval limits, competition thresholds, approved supplier lists and ethics rules.',
    'Selling to an organisation means knowing the buying situation, the buying centre and the rules, and reducing each member’s risk; the sale is often the start of a relationship.',
  ],

  glossary: [
    { term: 'Business market', def: 'The organisations that buy goods and services to produce other products, to run their operations or to resell: businesses, resellers, governments and institutions.' },
    { term: 'Derived demand', def: 'Demand for a product that arises from the demand for what it helps to produce, and ultimately from the demand of consumers.' },
    { term: 'Acceleration effect', def: 'The tendency for orders of equipment and other durable inputs to swing by a much larger percentage than the end demand they serve, because orders depend on the change in demand as well as its level.' },
    { term: 'Straight rebuy', def: 'A buying situation in which an organisation reorders something it has bought before, from the same supplier and on the same terms, with little search or deliberation.' },
    { term: 'Modified rebuy', def: 'A buying situation in which an organisation wants to change the specification, price, terms or supplier of something it has bought before.' },
    { term: 'New task', def: 'A buying situation in which an organisation buys something for the first time, with the most uncertainty, information search and people involved.' },
    { term: 'Buying centre', def: 'All the people in an organisation who take part in a purchase decision, each in one or more roles; also called the decision-making unit.' },
    { term: 'Initiator (buying centre)', def: 'In a buying centre, the person who first suggests the purchase.' },
    { term: 'User (buying centre)', def: 'In a buying centre, the people who will use the product or service; they often help define the need and judge the supplier afterwards.' },
    { term: 'Influencer (buying centre)', def: 'In a buying centre, a person whose views or expertise shape the specification or the choice without making the final decision, such as an engineer or a specialist. Not to be confused with a social-media influencer.' },
    { term: 'Buyer (buying centre)', def: 'In a buying centre, the person with formal responsibility for dealing with suppliers and arranging the terms of the purchase.' },
    { term: 'Decider (buying centre)', def: 'In a buying centre, the person or group with the power to choose the supplier or approve the purchase.' },
    { term: 'Gatekeeper (buying centre)', def: 'In a buying centre, a person who controls what information and which salespeople reach the others.' },
    { term: 'Business buying process', def: 'The stages of an organisational purchase: problem recognition, general need description, product specification, supplier search, proposal solicitation, supplier selection, order-routine specification and performance review.' },
    { term: 'Request for proposal', def: 'A formal invitation to suppliers to propose how they would meet a stated need and at what price, used when the buyer wants to compare solutions as well as prices.' },
    { term: 'Total cost of ownership', def: 'Everything an organisation pays to acquire, use, maintain and eventually replace or dispose of a product over its life, not just the purchase price.' },
    { term: 'Approval limit', def: 'The largest amount a person may commit their organisation to on their own authority; larger purchases need approval from someone more senior or a committee.' },
    { term: 'Approved supplier list', def: 'The suppliers an organisation has vetted and allows its staff to buy from; a new supplier must usually be approved before it can be used.' },
  ],

  references: [
    { text: 'Gomez Albrecht, M., Green, M. &amp; Hoffman, L. (2023). <i>Principles of Marketing</i>, chapter 4, “Business Markets and Purchasing Behavior”: key terms (buy classes, the buying centre and its roles, the B2B buying process, derived demand) and chapter summary. OpenStax.', url: 'https://openstax.org/books/principles-marketing/pages/4-key-terms', checked: '2026-10-23' },
    { text: 'Robinson, P. J. &amp; Faris, C. W., with Wind, Y. (1967). <i>Industrial Buying and Creative Marketing</i>. Boston: Allyn &amp; Bacon, for the Marketing Science Institute. Catalogue record consulted; the book was not.', url: 'https://catalog.hathitrust.org/Record/001321445', checked: '2026-10-23' },
    { text: 'Webster, F. E., Jr. &amp; Wind, Y. (1972). A general model for understanding organizational buying behavior. <i>Journal of Marketing</i>, 36(2), 12–19. Abstract consulted; the five roles as summarised in The Open University’s OpenLearn course <i>Understanding your customers</i>, section 3.4.', url: 'https://doi.org/10.1177/002224297203600204', checked: '2026-10-23' },
    { text: 'Bonoma, T. V. (1982). Major sales: who really does the buying? <i>Harvard Business Review</i>, May–June 1982; reprinted as an HBR Classic (product R0607P), whose description was consulted.', url: 'https://store.hbr.org/product/major-sales-who-really-does-the-buying-hbr-classic/R0607P', checked: '2026-10-23' },
    { text: 'Federal Acquisition Regulation, section 2.101 (definitions of the micro-purchase and simplified acquisition thresholds) and part 13, sections 13.003(c)(2) (no splitting of requirements), 13.104 (promoting competition) and 13.203 (micro-purchases), FAC 2026-01, effective 13 March 2026. Acquisition.gov.', url: 'https://www.acquisition.gov/far/part-13', checked: '2026-10-23' },
    { text: 'Pillsbury Winthrop Shaw Pittman. “Federal Acquisition Regulatory Council inflation thresholds”: the micro-purchase threshold rose from $10,000 to $15,000 and the simplified acquisition threshold from $250,000 to $350,000 on 1 October 2025.', url: 'https://www.pillsburylaw.com/en/news-and-insights/federal-acquisition-regulatory-council-inflation-thresholds.html', checked: '2026-10-23' },
  ],

  checks: [
    { what: 'Harbor Tech employees (case.js)', value: H.employees, shown: 300 },
    { what: 'Hana’s signing limit (case.js text)', value: /up to \$2,000/.test(hana.part) ? 2000 : 0, shown: 2000 },
    { what: 'Tom approves over $2,000 (case.js text)', value: /over \$2,000/.test(tom.part) ? 2000 : 0, shown: 2000 },
    { what: 'F01 m6: deposit for three events at $800', value: 3 * 800, shown: 2400 },
    { what: 'Catering clients (case.js)', value: C.clients, shown: 18 },
    { what: 'Events per client a year (case.js)', value: C.eventsPerClientYear, shown: 6 },
    { what: 'Revenue per event (case.js)', value: C.revenuePerEvent, shown: 820 },
    { what: 'Online customers (case.js)', value: BUSINESS.online.customers, shown: 1500 },
    { what: 'Lowest monthly AOV, Jul–Dec (b01/case.js)', value: Math.round(Math.min(...SHOP.aov)), shown: 41 },
    { what: 'Highest monthly AOV, Jul–Dec (b01/case.js)', value: Math.round(Math.max(...SHOP.aov)), shown: 55 },
    { what: 'Swiftline: normal replacement', value: 0.1 * 100, shown: 10 },
    { what: 'Swiftline: year 1 vans needed', value: SWIFT[0].need, shown: 110 },
    { what: 'Swiftline: year 1 in service', value: SWIFT[0].inService, shown: 90 },
    { what: 'Swiftline: year 1 orders', value: SWIFT[0].orders, shown: 20 },
    { what: 'Swiftline: year 1 rise in orders (%)', value: (SWIFT[0].orders / 10 - 1) * 100, shown: 100 },
    { what: 'Swiftline: year 2 vans needed', value: SWIFT[1].need, shown: 110 },
    { what: 'Swiftline: year 2 retirements', value: 0.1 * SWIFT[0].need, shown: 11 },
    { what: 'Swiftline: year 2 in service', value: SWIFT[1].inService, shown: 99 },
    { what: 'Swiftline: year 2 orders', value: SWIFT[1].orders, shown: 11 },
    { what: 'Swiftline: year 2 fall in orders (%)', value: (1 - SWIFT[1].orders / SWIFT[0].orders) * 100, shown: 45 },
    { what: 'Swiftline: year 3 vans needed', value: SWIFT[2].need, shown: 99 },
    { what: 'Swiftline: year 3 in service', value: SWIFT[2].inService, shown: 99 },
    { what: 'Swiftline: year 3 orders', value: SWIFT[2].orders, shown: 0 },
    { what: 'Pumps: units × price', value: PUMPS.units * PUMPS.price, shown: 384000 },
    { what: 'Pumps: service over five years', value: PUMPS.years * PUMPS.service, shown: 90000 },
    { what: 'Pumps: total', value: PUMPS.units * PUMPS.price + PUMPS.years * PUMPS.service, shown: 474000 },
    { what: 'Pumps: above the threshold', value: PUMPS.units * PUMPS.price > PUMPS.limit ? 1 : 0, shown: 1 },
    { what: 'Pumps: threshold', value: PUMPS.limit, shown: 250000 },
    { what: 'FAR micro-purchase threshold', value: 15000, shown: 15000 },
    { what: 'FAR micro-purchase threshold before 1 October 2025', value: 10000, shown: 10000 },
    { what: 'FAR simplified acquisition threshold before 1 October 2025', value: 250000, shown: 250000 },
    { what: 'FAR simplified acquisition threshold', value: 350000, shown: 350000 },
    { what: 'Swiftline policy threshold (fictional)', value: 100000, shown: 100000 },
  ],
};
