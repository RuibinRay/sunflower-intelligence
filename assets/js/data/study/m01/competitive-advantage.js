// competitive-advantage.js — M01 · Competitive advantage. Content only; exercises are in competitive-advantage.ex.js.
// Lantern and Brewline facts come from ./case.js (fictional); `checks` recompute them from that file. Every other
// business is fictional. The lesson discusses Lantern's options but leaves the choice of strategy to the course project.
import { BUSINESS, CLIENT_INTERVIEWS, COMPETITOR } from './case.js';

const c = BUSINESS.catering;
const R = CLIENT_INTERVIEWS.reasons;
// Orchard Works and Bellweather Desks (fictional coworking spaces), the challenging example and the widget defaults.
const OW = { wtp: 420, cost: 250 };
const BD = { wtp: 340, cost: 200, price: 300 };
const owMax = OW.wtp - (BD.wtp - BD.price);                           // 380

const STICK = '<svg viewBox="0 0 640 320" xmlns="http://www.w3.org/2000/svg" font-family="inherit" font-size="14">'
  + '<rect x="230" y="40" width="70" height="50" style="fill:none;stroke:var(--series-2);stroke-width:2"/>'
  + '<rect x="230" y="90" width="70" height="75" style="fill:none;stroke:var(--series-1);stroke-width:2"/>'
  + '<rect x="230" y="165" width="70" height="125" style="fill:none;stroke:var(--rule-strong);stroke-width:2;stroke-dasharray:5 4"/>'
  + '<line x1="300" y1="40" x2="330" y2="40" style="stroke:currentColor;stroke-width:1"/><text x="336" y="45" fill="currentColor">Willingness to pay: $10</text>'
  + '<line x1="300" y1="90" x2="330" y2="90" style="stroke:currentColor;stroke-width:1"/><text x="336" y="95" fill="currentColor">Price: $8</text>'
  + '<line x1="300" y1="165" x2="330" y2="165" style="stroke:currentColor;stroke-width:1"/><text x="336" y="170" fill="currentColor">Cost of serving the customer: $5</text>'
  + '<text x="265" y="70" text-anchor="middle" font-size="12" fill="currentColor">$2</text>'
  + '<text x="265" y="132" text-anchor="middle" font-size="12" fill="currentColor">$3</text>'
  + '<text x="265" y="232" text-anchor="middle" font-size="12" fill="currentColor">$5</text>'
  + '<text x="336" y="70" font-size="12" fill="var(--ink-3)">customer’s share (willingness to pay − price)</text>'
  + '<text x="336" y="132" font-size="12" fill="var(--ink-3)">business’s margin (price − cost)</text>'
  + '<path d="M210 40 L200 40 L200 165 L210 165" style="fill:none;stroke:currentColor;stroke-width:1.5"/>'
  + '<text x="190" y="98" text-anchor="end" font-weight="700" fill="currentColor">Value created</text>'
  + '<text x="190" y="118" text-anchor="end" fill="currentColor">$10 − $5 = $5</text>'
  + '<text x="265" y="312" text-anchor="middle" font-size="12" fill="var(--ink-3)">$0</text>'
  + '</svg>';

const box = (x, y, color, title, l1, l2) => `<rect x="${x}" y="${y}" width="230" height="104" rx="8" style="fill:none;stroke:var(--series-${color});stroke-width:2"/>`
  + `<text x="${x + 115}" y="${y + 38}" text-anchor="middle" font-weight="700" fill="currentColor">${title}</text>`
  + `<text x="${x + 115}" y="${y + 64}" text-anchor="middle" font-size="12" fill="currentColor">${l1}</text>`
  + `<text x="${x + 115}" y="${y + 82}" text-anchor="middle" font-size="12" fill="currentColor">${l2}</text>`;
const PORTER = '<svg viewBox="0 0 640 330" xmlns="http://www.w3.org/2000/svg" font-family="inherit" font-size="14">'
  + '<text x="400" y="20" text-anchor="middle" font-size="13" fill="var(--ink-3)">Source of advantage</text>'
  + '<text x="285" y="44" text-anchor="middle" font-weight="700" fill="currentColor">Lower cost</text>'
  + '<text x="519" y="44" text-anchor="middle" font-weight="700" fill="currentColor">Differentiation</text>'
  + '<text transform="translate(26 166) rotate(-90)" text-anchor="middle" font-size="13" fill="var(--ink-3)">Competitive scope</text>'
  + '<text x="100" y="114" text-anchor="middle" font-weight="700" fill="currentColor">Broad target</text>'
  + '<text x="100" y="132" text-anchor="middle" font-size="12" fill="currentColor">the whole market</text>'
  + '<text x="100" y="224" text-anchor="middle" font-weight="700" fill="currentColor">Narrow target</text>'
  + '<text x="100" y="242" text-anchor="middle" font-size="12" fill="currentColor">one segment</text>'
  + box(170, 60, 1, 'Cost leadership', 'the lowest cost in the industry,', 'for low prices or higher margins')
  + box(404, 60, 2, 'Differentiation', 'unique in ways buyers value,', 'rewarded with a premium price')
  + box(170, 172, 1, 'Cost focus', 'the lowest cost in serving', 'one chosen segment')
  + box(404, 172, 2, 'Differentiation focus', 'unique for one chosen segment,', 'which pays a premium for it')
  + '<text x="320" y="312" text-anchor="middle" font-size="12" fill="var(--ink-3)">Porter: a firm that pursues more than one without achieving any risks being “stuck in the middle”.</text>'
  + '</svg>';

export default {
  slug: 'competitive-advantage',
  title: 'Competitive advantage',
  blurb: 'Customers choose between alternatives, so a business needs a reason to be chosen that rivals can’t easily copy. Learn where competitive advantage comes from (lower cost, differentiation and focus), how to compare competing on price with competing on value, and how to judge whether an advantage will last.',
  status: 'draft',
  objectives: [
    'Explain competitive advantage as creating more value than rivals, using willingness to pay, price and cost.',
    'Distinguish Porter’s generic strategies (cost leadership, differentiation, cost focus and differentiation focus) and classify businesses by the strategy they follow.',
    'Calculate a price premium and the highest price a difference in customer value can support against a rival.',
    'Compare competing on price with competing on value, including the risks of price wars and of being stuck in the middle.',
    'Evaluate whether a resource or capability can give a sustained advantage, using VRIO.',
    'Explain how positioning communicates a competitive advantage to target customers.',
  ],
  prerequisites: [
    { lesson: 'm01/customer-value', why: 'Competitive advantage is built on customer value: what customers get compared with what they give up, judged against the alternatives.' },
    { lesson: 'm01/situation-analysis', why: 'The choice of how to compete starts from the competitor analysis and the SWOT.' },
    { lesson: 'm01/marketing-objectives', why: 'A competitive strategy is the “how” that must deliver the objectives set in that lesson.' },
  ],
  case: 'lantern',

  concept: [
    { case: `Lantern charges about $${c.pricePerHead.toFixed(2)} a head for catered coffee; ${COMPETITOR.name}, a larger caterer that uses self-serve urns and pod machines and no baristas, charges $${COMPETITOR.pricePerHead.toFixed(2)}. In 2026 Lantern lost ${CLIENT_INTERVIEWS.lostBids} bids, all to Brewline on price. Yet when Ana interviewed ${CLIENT_INTERVIEWS.interviewed} of her clients, ${R['Coffee quality']} named coffee quality as a reason for choosing Lantern, ${R['Reliability on the day']} its reliability on the day and ${R['Baristas’ professionalism']} its baristas’ professionalism; only ${R.Price} named price.` },
    { p: 'Two businesses are selling coffee for the same office events in very different ways. Which way should Lantern compete in 2027? This lesson gives you the tools to answer; the course project asks you to choose and defend the answer.' },
    { p: 'A business wins customers only if they prefer it to the alternatives. A <g>competitive advantage</g> is whatever lets a business attract customers, earn profits or both, better than its rivals can. OpenStax’s <i>Principles of Management</i> describes it by its results: a firm with an advantage attracts more customers, earns more profit or returns more value to its owners than its rivals. This lesson looks at where those results come from.' },

    { h: 'Where advantage comes from: value created' },
    { p: 'Every sale involves three amounts. A customer’s <g>willingness to pay</g>, met in the first lesson of this course, is, here, the most they would pay for an offer rather than go without it. The <b>price</b> is what they actually pay. The <b>cost</b> is what it costs the business to provide the offer to them.' },
    { p: 'The gap between willingness to pay and cost is the <g>value created</g> by the sale, and the price splits it: the customer keeps willingness to pay minus price, and the business keeps price minus cost. Rival offers come in through a comparison: the customer looks at what each leaves them, willingness to pay minus price, and takes the largest.' },
    { figure: {
      svg: STICK,
      caption: 'The value created by one sale, drawn as a stick. The price decides how the value is shared between the customer and the business; it doesn’t change how much value there is.',
      alt: 'A vertical bar divided into three stacked segments, with a scale running from $0 at the bottom. The top of the bar is marked willingness to pay, $10; a line lower down is marked price, $8; a line below that is marked cost of serving the customer, $5. The top segment, $2, is labelled customer’s share (willingness to pay minus price). The middle segment, $3, is labelled business’s margin (price minus cost). The bottom segment, $5, is the cost. A bracket on the left spans the top two segments and is labelled value created, $10 − $5 = $5.',
    } },
    { p: 'A business has a competitive advantage when it creates more value than its rivals: a wider gap between what customers will pay and what it costs to serve them. That gap can be widened from either end. Holding willingness to pay at $10, a business that serves the same customer for $4 instead of $5 creates $6 of value. Alternatively, a business whose offer customers would pay $12 for creates more value even if the better offer costs a little more to provide: $12 − $6 = $6. The first route is a cost advantage; the second is differentiation.' },
    { p: 'This way of seeing advantage, associated with Adam Brandenburger and Harborne Stuart’s value-based view of strategy, makes one thing clear at once: a low price is not an advantage in itself. A price cut only moves value from the business to the customer. It wins customers, but unless the business also has lower costs than its rivals, they can match the cut, and both end up with less.' },

    { h: 'Three generic strategies' },
    { p: 'In <i>Competitive Strategy</i> (1980), Michael Porter argued that firms outperform their rivals in one of three broad ways, which he called <g>generic strategies</g>: overall <g>cost leadership</g>, <g>differentiation</g> and <g>focus</g>. In <i>Competitive Advantage</i> (1985) he made the structure explicit as two questions: is the advantage lower cost or uniqueness, and is it pursued across the whole market or in a narrow segment? That gives four positions, because focus can be pursued through either cost (<b>cost focus</b>) or differentiation (<b>differentiation focus</b>).' },
    { figure: {
      svg: PORTER,
      caption: 'Porter’s generic strategies: the source of the advantage (lower cost or differentiation) crossed with its scope (the whole market or one segment).',
      alt: 'A two-by-two grid. The columns are headed Lower cost and Differentiation, under the label Source of advantage. The rows are labelled Broad target (the whole market) and Narrow target (one segment), under the label Competitive scope. Top left: Cost leadership, the lowest cost in the industry, for low prices or higher margins. Top right: Differentiation, unique in ways buyers value, rewarded with a premium price. Bottom left: Cost focus, the lowest cost in serving one chosen segment. Bottom right: Differentiation focus, unique for one chosen segment, which pays a premium for it. A note below says that, according to Porter, a firm that pursues more than one without achieving any risks being stuck in the middle.',
    } },
    { p: 'Lantern and Brewline illustrate the contrast without settling it. Brewline’s urns and pod machines need no baristas, which suggests it is built to serve each head for less. Lantern’s baristas are a cost Brewline doesn’t carry, and they are among the things Lantern’s current clients say they value. Whether that adds up to an advantage for either firm, and in which part of the market, depends on facts the next sections teach you to look for.' },
    { callout: 'key', title: 'Advantage is relative and customer-judged', html: 'An advantage exists only compared with specific rivals, and only in things customers care about. Low cost that customers can’t see still counts, because it lets the business price lower or earn more; uniqueness that customers don’t value counts for nothing.' },
  ],

  theory: [
    { h: 'The generic strategies in more depth' },
    { table: {
      caption: 'What each generic strategy needs, and how it can fail',
      head: ['Strategy', 'The advantage', 'What it requires', 'The main risk'],
      rows: [
        ['Cost leadership', 'The lowest cost of serving customers in the industry', 'Scale, standard offers, efficient processes, tight control of every cost', 'A rival finds a cheaper way; quality falls so far that customers leave'],
        ['Differentiation', 'Something customers value and will pay more for', 'Design, quality, service, brand or innovation that rivals can’t easily match', 'The premium grows larger than the value customers see; rivals copy the difference'],
        ['Cost focus', 'The lowest cost of serving one segment', 'An offer stripped down to what that segment needs', 'Broad competitors serve the segment well enough; the segment shrinks'],
        ['Differentiation focus', 'Uniqueness that one segment values highly', 'Deep knowledge of the segment and an offer built around it', 'The segment is too small to grow in; broad differentiators move in'],
      ],
    } },
    { p: 'Where do lower costs and valued differences come from? The usual sources are worth listing, because a strategy is only as credible as the source it rests on.' },
    { list: [
      '<b>Sources of lower cost:</b> scale (spreading fixed costs such as equipment, vans and management over more customers); experience (staff who have done the job many times work faster and waste less); a simpler, standardised offer; better processes and technology; cheaper or more reliable inputs; and location.',
      '<b>Sources of differentiation:</b> the product itself (features, quality, reliability); the service around it (speed, flexibility, expertise); the people who deliver it; the brand and what it signals; the channel (being easier to buy from); and relationships built over time.',
    ] },
    { p: 'Each source has a cost side and a customer side. Scale lowers cost only if the business can win the volume; a feature differentiates only if customers value it more than it costs. And the sources interact: standardising an offer to cut costs usually narrows the differences customers can be offered, which is one reason Porter thought firms must choose.' },
    { p: 'OpenStax’s <i>Principles of Management</i> uses well-known examples: Walmart for cost leadership, built on low prices from suppliers, inexpensive stores and relatively low wages; Starbucks for differentiation, whose customers pay premium prices for its atmosphere, service, quality and brand; and a maker of custom snowboard bindings for a small group of riders willing to pay premium prices as differentiation focus. Notice that cost leadership is not the same as the lowest price. A cost leader may charge average prices and earn above-average margins; low cost gives it the choice.' },
    { p: 'Porter warned that a firm that tries to pursue cost leadership and differentiation at once, without achieving either, ends up <g>stuck in the middle</g>: too expensive for price-led buyers and not distinctive enough for buyers who pay for quality. Later researchers qualified the warning. Charles Hill (1988) argued that differentiation and low cost need not be opposites, and that in some circumstances a firm can achieve both. One route is easy to see: a differentiated product that wins a large market may gain the economies of scale that lower its costs. Treat the generic strategies as a way of forcing a clear choice about where the advantage lies, not as a law that forbids combinations.' },

    { h: 'Competing on price and competing on value' },
    { p: 'A differentiator charges a <g>price premium</g>: the amount by which its price exceeds a rival’s, usually expressed as a percentage of the rival’s price. A premium is sustainable when customers value the difference by at least as much as it costs them.' },
    { p: 'The logic follows from the value stick. A customer compares what each option leaves them: willingness to pay minus price. If a rival leaves its customers $40 of value, a business whose offer customers would pay $80 more for can charge up to $80 more than the rival and still leave them as well off. In general, the highest price that still wins the customer is the rival’s price plus the difference in willingness to pay.' },
    { p: 'Three practical consequences follow. First, a differentiator should know, in money, what its difference is worth to the customer: time saved, fewer problems, staff who are happier. The simple worked example below does this for a laundry. Second, the premium must also cover the extra cost of providing the difference, or differentiation destroys value instead of creating it.' },
    { p: 'Third, willingness to pay varies between customers. Some value the difference highly and will pay the premium; others barely value it and will choose the cheaper rival. Which customers to serve is therefore part of the strategy, and is where focus comes in.' },
    { p: 'Competing on price works when the business has a genuine cost advantage, because then it can price below rivals and still earn a margin they can’t match. Without one, a price cut is easy to copy, and a rival that matches it leaves both firms with the same share of customers and less margin each. Repeated rounds of cutting are a <b>price war</b>. A differentiator that cuts its price to match a cheaper rival gives away margin and tells customers that its difference wasn’t worth paying for. That doesn’t mean a differentiator should never move its price; it means price moves should follow from what customers value and what the business can afford, which M02’s pricing lessons develop.' },

    { h: 'Will the advantage last?' },
    { p: 'An advantage that rivals can copy next month is worth little. The resource-based view of strategy asks what the business has, its <b>resources</b> (equipment, money, brands, relationships, people) and <b>capabilities</b> (what it can do with them), that rivals cannot easily get.' },
    { p: 'Jay Barney (1991) proposed that a resource can give a <g>sustained competitive advantage</g> if it is valuable, rare, imperfectly imitable and without a ready substitute. That list is often abbreviated VRIN. Barney later recast it as VRIO, folding substitutes into imitability and adding organisation (Barney, 1995, ‘Looking inside for competitive advantage’, <i>Academy of Management Executive</i> 9(4), 49–61). <g>VRIO</g> is the version now usually taught, including in OpenStax’s <i>Principles of Management</i>: four questions asked of each resource or capability in turn.' },
    { table: {
      caption: 'The VRIO questions and what the answers usually imply',
      head: ['Question', 'If the answer is no'],
      rows: [
        ['<b>Value:</b> does it let the business exploit an opportunity or counter a threat, in ways customers care about?', 'It gives no advantage, and it may be a cost.'],
        ['<b>Rarity:</b> do few competitors have it?', 'It is needed just to compete: competitive parity.'],
        ['<b>Imitability:</b> is it hard or costly for rivals to copy or substitute?', 'The advantage is temporary: it lasts until rivals catch up.'],
        ['<b>Organisation:</b> is the business organised (processes, people, incentives) to make use of it?', 'The advantage is there but unused.'],
      ],
      note: 'Only a resource that passes all four tests is a likely source of sustained advantage.',
    } },
    { p: 'Why are some resources hard to copy? Barney’s paper gives three reasons. Some were built through a particular history that can’t be repeated, such as a reputation earned over decades; some work in ways that even the business can’t fully explain, so rivals don’t know what to copy; and some are socially complex, living in relationships, trust and culture rather than in equipment anyone can buy. A coffee machine is easy to copy; a team whose skill, and whose relationships with clients, were built over years of work together is not.' },
    { p: 'Two cautions apply. VRIO is a structured set of questions, not a measurement: the answers are judgements, and the honest ones often say “not yet”. And no advantage lasts for ever. Customers’ needs change, technologies arrive and rivals learn; a business must keep asking which of its advantages are eroding and which it is building next.' },

    { h: 'Positioning: making the advantage visible' },
    { p: 'An advantage that customers don’t perceive wins no business. <g>Positioning</g> is the place a business wants its offer to occupy in target customers’ minds, relative to competing offers. It is how a competitive strategy is expressed to customers, and the <g>value proposition</g> from the customer-value lesson is its promise in words: the cheapest reliable option, the one with the best coffee at the event, the specialist who understands this kind of client.' },
    { p: 'A good position is relevant to the target customers, distinct from what rivals claim, credible given what the business actually delivers, and consistent across everything customers see, from the proposal to the price. OpenStax’s <i>Principles of Management</i> notes that a strong position differs from rivals’ positions and is hard to copy, which is why positioning and sustainability go together. M02 shows how the marketing mix carries a positioning out, and course M05 teaches how to choose and test one, with perceptual maps and positioning statements.' },
  ],

  formulas: [
    { id: 'ca-value-created', name: 'Value created, and how the price shares it',
      tex: String.raw`V = W - C = \underbrace{(W - P)}_{\text{customer}} + \underbrace{(P - C)}_{\text{business}}`,
      where: [
        ['V', 'Value created by serving one customer', '$ per customer (or per unit)'],
        ['W', 'The customer’s willingness to pay for this offer: the most they would pay rather than go without it', '$ per customer'],
        ['P', 'The price the customer pays', '$ per customer'],
        ['C', 'The cost to the business of serving that customer', '$ per customer'],
      ],
      assumptions: 'W is the value of this offer on its own; rivals enter through the comparison of W − P across offers. In practice W differs between customers and has to be estimated.',
      note: 'Brandenburger and Stuart (1996) define value created more fully, counting suppliers as well; this is the simplified version. A business has a competitive advantage when its V is larger than its rivals’.' },
    { id: 'ca-price-premium', name: 'Price premium',
      tex: String.raw`\text{Premium} = \left(\dfrac{P_f}{P_r} - 1\right) \times 100`,
      where: [
        [String.raw`P_f`, 'The firm’s price', '$ per unit'],
        [String.raw`P_r`, 'The rival’s price for a comparable offer', '$ per unit'],
      ],
      assumptions: 'The two prices are for comparable quantities and terms (per head, per shirt, per month).',
      note: 'Measured against the rival’s price. The same gap measured against the firm’s own price gives a smaller percentage, a common source of confusion.' },
    { id: 'ca-max-price', name: 'Highest price that still wins the customer',
      tex: String.raw`P_{\max} = P_r + (W_f - W_r)`,
      where: [
        [String.raw`P_{\max}`, 'Highest price at which the customer is at least as well off choosing the firm', '$ per unit'],
        [String.raw`P_r`, 'The rival’s price', '$ per unit'],
        [String.raw`W_f`, 'The customer’s willingness to pay for the firm’s offer', '$ per unit'],
        [String.raw`W_r`, 'The customer’s willingness to pay for the rival’s offer', '$ per unit'],
      ],
      assumptions: 'The customer chooses the option that leaves them the most value (W − P), and the rival’s price stays where it is.',
      note: String.raw`Equivalently, <m>W_f - P_{\max} = W_r - P_r</m>: the customer keeps the same amount either way. The sustainable premium in dollars is the gap in willingness to pay; if the rival cuts its price, the ceiling falls by the same amount.` },
  ],

  examples: [
    { level: 'simple', title: 'Is a laundry’s premium worth it to a hotel?', fictional: true,
      setup: 'Greyfriars Laundry charges hotels $2.25 to wash and press a shirt; a rival charges $1.80. One hotel sends 400 shirts a week. Greyfriars returns them the next day and damages fewer: the hotel’s housekeeper estimates that damaged shirts cost the hotel $0.10 a shirt with the rival and $0.02 with Greyfriars, and that the rival’s slower returns cost about $120 a week of staff time. What premium does Greyfriars charge, and is it worth it to this hotel?',
      steps: [
        String.raw`Price premium (the premium formula): <m>(2.25 \div 1.80 - 1) \times 100 = 25\%</m>.`,
        String.raw`In money for this hotel: <m>400 \times (2.25 - 1.80) = 400 \times 0.45 = 180</m> dollars a week, or <m>180 \times 52 = 9{,}360</m> dollars a year.`,
        String.raw`Value of the difference to the hotel: fewer damaged shirts save <m>400 \times (0.10 - 0.02) = 32</m> dollars a week, and faster returns save $120 of staff time: <m>32 + 120 = 152</m> dollars a week.`,
        String.raw`Compare. The hotel pays $180 a week more for $152 a week of extra value, so it is <m>180 - 152 = 28</m> dollars a week worse off with Greyfriars. The premium it would accept is about <m>152 \div 400 = 0.38</m> dollars a shirt, a price of about $2.18.`,
      ],
      answer: 'A 25% premium, $180 a week for this hotel, against about $152 a week of extra value: the premium is $28 a week more than the difference is worth to this hotel.',
      interpretation: 'Greyfriars’ service is genuinely better, but at this price not for this hotel. It has three options: narrow the premium to what the difference is worth, add value the hotel would pay for, or concentrate on hotels that value the difference more (one with more shirts, or more costly staff time). The third is a focus decision. A differentiator needs this calculation for each kind of customer, not just the average.' },

    { level: 'challenging', title: 'Who has the advantage: the dearer or the cheaper space?', fictional: true,
      setup: 'Two coworking spaces compete for the same freelancers. Bellweather Desks charges $300 a month for a desk; it costs $200 a month to serve a member, and a typical member would pay up to $340 for it. Orchard Works offers quiet rooms, better chairs and weekly events; it costs $250 a month to serve a member, and a typical member would pay up to $420. Which space has the competitive advantage, what is the highest price Orchard can charge and still win the typical member, and what would happen if Orchard matched Bellweather’s price?',
      steps: [
        String.raw`Value created per member per month (the value-created formula). Orchard: <m>420 - 250 = 170</m> dollars. Bellweather: <m>340 - 200 = 140</m> dollars. Orchard creates $30 more value per member despite costing $50 more to run: it has the advantage, through differentiation.`,
        String.raw`What the rival leaves the member: <m>340 - 300 = 40</m> dollars. Orchard wins the member at any price that leaves at least as much, so <m>P_{\max} = 300 + (420 - 340) = 380</m> dollars (check: <m>420 - 380 = 40</m>).`,
        String.raw`Margins at that price: Orchard <m>380 - 250 = 130</m> dollars a member, Bellweather <m>300 - 200 = 100</m>. Orchard’s premium is <m>(380 \div 300 - 1) \times 100 \approx 26.7\%</m>.`,
        String.raw`Price competition. If Orchard matched $300 its margin would fall to <m>300 - 250 = 50</m> dollars, giving away <m>130 - 50 = 80</m> dollars a member, and the member would keep <m>420 - 300 = 120</m>, three times what Bellweather offers. If instead Bellweather cut its price to $280, Orchard’s ceiling would fall to <m>280 + 80 = 360</m> dollars: still a margin of $110 against Bellweather’s $80.`,
        'Check the assumption of a typical member. Members who care little for quiet rooms and events might value Orchard at only $350. For them Orchard would have to charge no more than $310 to compete, earning $60; many of them will choose Bellweather, and Orchard may be wise to let them. That is the logic of focus: serve the members who value the difference most.',
      ],
      answer: 'Orchard has the advantage: $170 of value per member-month against $140. It can charge up to $380, a premium of about 26.7%, and earn $130 a member against Bellweather’s $100. Matching Bellweather’s $300 would give away $80 a member for no gain.',
      interpretation: 'The dearer business has the advantage, because advantage is about value created, not price. Its sustainable premium in dollars equals the gap in willingness to pay ($80), whatever the rival charges: a rival’s cut lowers Orchard’s ceiling dollar for dollar, so Orchard need follow a cut only far enough to stay within $80 of the rival’s price, never down to it. The weak point in the analysis is the willingness-to-pay figures: they are estimates, and they differ between members.' },

    { level: 'applied', title: 'Which of a heat-pump installer’s strengths will last?', fictional: true,
      setup: 'Ostlund Heat Pumps installs heat pumps, mostly for housing associations that own thousands of homes. Its owner lists five things she thinks give Ostlund an edge and asks where to invest next year. (a) All its installers hold the manufacturers’ certificates. (b) Ten-year relationships with three housing associations, which give Ostlund repeat contracts and early warning of tenders; a dedicated account manager looks after them. (c) Scheduling software Ostlund built itself, which cuts a day from each installation; similar tools are starting to appear on the market. (d) A record of the running costs of 2,000 heat pumps it has installed, which nobody uses when writing proposals. (e) A showroom on a city-centre street, which its housing-association clients never visit. Apply VRIO.',
      steps: [
        'Value first. The showroom (e) doesn’t help Ostlund win or serve its actual customers, who buy through tenders: it fails the first test and is a cost, not an advantage. The other four help win or deliver contracts.',
        'Rarity. Manufacturer certificates (a) are available to any installer who takes the course, so most serious rivals have them: they are needed to compete, which is competitive parity. The relationships (b), the software (c) and the running-cost record (d) are rare.',
        'Imitability. The software (c) can be copied or bought as similar tools reach the market: a temporary advantage. The relationships (b) were built over ten years of contracts (history) and rest on trust between people (social complexity), so they are hard to copy. The running-cost record (d) can only be built by installing 2,000 heat pumps: also hard to copy.',
        'Organisation. The relationships (b) have an account manager looking after them: organised, so a sustained advantage. The running-cost record (d) is unused: an advantage the business is not organised to exploit.',
        'Decide. Protect (b): keep the account manager, and widen the relationships to more people at each association so they don’t depend on one person. Organise (d): put real running-cost evidence into every proposal, which turns an unused resource into a reason to choose Ostlund. Enjoy (c) while it lasts but don’t build the strategy on it. Keep (a) as the price of entry. Question (e).',
      ],
      answer: '(a) Competitive parity; (b) sustained advantage; (c) temporary advantage; (d) an unexploited advantage; (e) no advantage, and a cost. Invest in protecting the relationships and in using the running-cost record in proposals.',
      interpretation: 'The owner’s list mixed four different things under one word, “edge”. VRIO separated them and pointed the investment at the two resources rivals can’t easily copy, one of which was sitting unused. The judgements (how rare, how hard to copy) are arguable, and the honest answer may change in a year, so the analysis is worth repeating.' },
  ],

  demo: [
    { widget: 'ca-value-stick', intro: 'The challenging example on sliders, with Orchard Works as “your business” and Bellweather Desks as the rival. Lower the rival’s price and watch your highest winning price fall by the same amount. Then raise your cost until your margin at that price disappears: that is the point where your differentiation stops paying. Finally lower your customers’ willingness to pay towards the rival’s and see your advantage vanish.' },
  ],

  mistakes: [
    { title: '“Competitive advantage means being the cheapest.”', html: 'Advantage means creating more value than rivals: a wider gap between what customers will pay and what it costs to serve them. A dearer firm can have the advantage, as Orchard Works does. A low price is an advantage only when it rests on lower costs; otherwise it just hands value to customers until a rival matches it.' },
    { title: '“Differentiation means being different.”', html: 'Only differences that customers value, and value by more than they cost to provide, count. A feature customers don’t notice adds cost and no willingness to pay. Put a money value on the difference for each kind of customer, as in the laundry example.' },
    { title: '“If a cheaper rival takes our customers, we should match its price.”', html: 'Without a cost advantage, matching gives away margin on every customer, invites another cut, and tells customers the difference wasn’t worth paying for. First ask which customers are leaving and what the difference is worth to them. The answer may be to cut costs, to add value or to concentrate on the customers who value the difference; it can’t be found by looking at the price alone.' },
    { title: '“We can be the best and the cheapest for everyone.”', html: 'Porter called the result of trying to be everything “stuck in the middle”. Hill (1988) argued that cost and differentiation can sometimes be combined; if you plan to do both, name the mechanism, such as the scale a popular differentiated product can bring, rather than wishing.' },
    { title: '“Anything we own or do well is a lasting advantage.”', html: 'VRIO says otherwise. A resource every rival has gives parity; one rivals can copy gives a temporary lead; and even a rare, hard-to-copy resource is wasted if the business isn’t organised to use it.' },
    { title: '“Customers will notice our advantage.”', html: 'They notice what is communicated consistently and what they experience. Positioning has to make the advantage visible and believable to the target customers, and every part of the marketing mix has to support it.' },
  ],

  application: [
    { p: 'Strategists rarely meet a choice as clean as the generic-strategy grid suggests. A useful discipline, before choosing, is to write down for each option what would have to be true for it to work, and then to check which of those things the evidence supports. Applied to Lantern’s position against Brewline, the method organises the question without answering it; answering it is the course project.' },
    { case: `The facts: Lantern charges about $${c.pricePerHead.toFixed(2)} a head and Brewline $${COMPETITOR.pricePerHead.toFixed(2)}. Brewline is larger and uses self-serve urns and pod machines with no baristas. Lantern lost ${CLIENT_INTERVIEWS.lostBids} bids in 2026, all to Brewline on price. Its current clients, interviewed in November, mostly named quality, reliability and the baristas as reasons for choosing it. Ana wants catering revenue to grow, and the objectives lesson showed that growth will need new clients as well as kept ones.` },
    { table: {
      caption: 'Lantern against Brewline: what each route would require Ana to believe (questions, not answers)',
      head: ['Route', 'What would have to be true', 'What Ana doesn’t yet know'],
      rows: [
        ['Compete on price across the market', 'Lantern can serve a head for less than Brewline, or could find a way to', 'Brewline’s costs; what Lantern would have to give up to cut its own; how Brewline would respond'],
        ['Differentiate across the market', 'Enough buyers value baristas and better coffee by more than the price difference', 'How much the difference is worth to buyers who chose Brewline; whether they could be persuaded'],
        ['Focus on a segment', 'There is an identifiable group of buyers who value what Lantern does most, and it is large enough for the growth Ana wants', 'Who those buyers are, how many there are, and how to reach them'],
      ],
    } },
    { p: 'Each route raises its own analysis. A price route needs the cost side of the value stick: what it costs Lantern to serve a head, and whether a smaller firm could get below a larger one. A differentiation route needs the willingness-to-pay side: what an hour of barista service and better coffee are worth to an office manager or to the people who attend the event, and whether that exceeds the price gap. A focus route needs segmentation evidence: which clients the interviews describe, and which buyers the lost bids describe. All three need a VRIO check on whatever the advantage would rest on: can Brewline copy it?' },
    { p: 'The same discipline works far from coffee. A regional airline facing a low-cost carrier, a high-street bookshop facing an online retailer, or a payroll firm facing free software all face the choice between matching on price, out-valuing the rival, or serving the customers the rival serves badly. The answer is rarely “all three”, and it is never found by looking only at the price. Write the options down, list what each needs to be true, gather the evidence, and choose the route the evidence supports and the business can sustain.' },
  ],

  summary: [
    'A business has a competitive advantage when it creates more value than its rivals: a wider gap between customers’ willingness to pay and its cost of serving them.',
    'The price only divides the value created between customer and business; a price cut without a cost advantage is easily matched and destroys margin.',
    'Porter’s generic strategies: cost leadership, differentiation, cost focus and differentiation focus. Trying to be everything risks being stuck in the middle, though combinations can work through a clear mechanism.',
    'A price premium is sustainable up to the gap in willingness to pay: the highest winning price is the rival’s price plus that gap, and the premium must also cover the extra cost of the difference.',
    'Willingness to pay differs between customers, so choosing whom to serve is part of the strategy.',
    'VRIO tests whether an advantage will last: valuable, rare, hard to imitate, and a business organised to use it.',
    'Positioning makes the advantage visible to target customers; M05 develops it.',
  ],

  glossary: [
    { term: 'Competitive advantage', def: 'Whatever lets a business attract customers or earn profits better than its rivals; in value terms, creating a wider gap than rivals between customers’ willingness to pay and the cost of serving them. It may be temporary or sustained.' },
    { term: 'Value created', def: 'The customer’s willingness to pay minus the business’s cost of serving them; the price divides it between the customer and the business.' },
    { term: 'Generic strategies', def: 'Michael Porter’s broad ways of outperforming rivals: cost leadership, differentiation and focus, with focus pursued through either cost or differentiation.' },
    { term: 'Cost leadership', def: 'A generic strategy of achieving the lowest cost of serving customers in an industry, so that the business can charge lower prices or earn higher margins than its rivals.' },
    { term: 'Differentiation', def: 'A generic strategy of being unique in ways customers value, so that they will pay a premium price.' },
    { term: 'Focus', def: 'A generic strategy of serving one narrow segment better than broad competitors, through lower cost (cost focus) or differentiation (differentiation focus).' },
    { term: 'Stuck in the middle', def: 'Porter’s term for a firm that pursues low cost and differentiation at once without achieving either, and so has no clear advantage.' },
    { term: 'Price premium', def: 'The amount by which a firm’s price exceeds a rival’s for a comparable offer, usually as a percentage of the rival’s price.' },
    { term: 'Sustained competitive advantage', def: 'An advantage that rivals cannot easily copy or substitute, so that it lasts after they have tried.' },
    { term: 'VRIO', def: 'Four questions for judging whether a resource or capability can give a sustained advantage: is it valuable, rare, hard to imitate, and is the business organised to exploit it?' },
    { term: 'Positioning', def: 'The place a business wants its offer to occupy in target customers’ minds, relative to competing offers.' },
  ],

  references: [
    { text: 'Porter, M. E. (1980). <i>Competitive Strategy: Techniques for Analyzing Industries and Competitors</i>. New York: Free Press. The book was not consulted; its three generic strategies and “stuck in the middle” were confirmed from the abstract on SSRN.', url: 'https://papers.ssrn.com/abstract=1496175', checked: '2026-10-23' },
    { text: 'Porter, M. E. (1985). <i>Competitive Advantage: Creating and Sustaining Superior Performance</i>. New York: Free Press. The book was not consulted; the cost-focus and differentiation-focus variants (chapter 1, pp. 11–15) were confirmed from University of Cambridge, Institute for Manufacturing, “Porter’s Generic Competitive Strategies”.', url: 'https://www.ifm.eng.cam.ac.uk/research/dstools/porters-generic-competitive-strategies/', checked: '2026-10-23' },
    { text: 'Bright, D. S., Cortes, A. H. et al. (2019). <i>Principles of Management</i>, sections 8.5, “The Internal Environment” (VRIO), 8.6, “Competition, Strategy, and Competitive Advantage”, and 8.7, “Strategic Positioning”. OpenStax.', url: 'https://openstax.org/books/principles-management/pages/8-6-competition-strategy-and-competitive-advantage', checked: '2026-10-23' },
    { text: 'Barney, J. (1991). Firm resources and sustained competitive advantage. <i>Journal of Management</i>, 17(1), 99–120. Also Barney, J. B. (1995). Looking inside for competitive advantage. <i>Academy of Management Executive</i>, 9(4), 49–61, doi:10.5465/ame.1995.9512032192. Both confirmed from their Crossref records (with the 1991 abstract); the full texts were not consulted.', url: 'https://doi.org/10.1177/014920639101700108', checked: '2026-10-23' },
    { text: 'Hill, C. W. L. (1988). Differentiation versus low cost or differentiation and low cost: a contingency framework. <i>Academy of Management Review</i>, 13(3), 401–412. Citation confirmed from the Crossref record and the author’s CV; the full text was not consulted.', url: 'https://doi.org/10.2307/258088', checked: '2026-10-23' },
    { text: 'Brandenburger, A. M. &amp; Stuart, H. W. (1996). Value-based business strategy. <i>Journal of Economics &amp; Management Strategy</i>, 5(1), 5–24.', url: 'https://doi.org/10.1111/j.1430-9134.1996.00005.x', checked: '2026-10-23' },
  ],

  checks: [
    { what: 'Lantern price per head (case.js)', value: c.pricePerHead, shown: 9 },
    { what: 'Brewline price per head (case.js)', value: COMPETITOR.pricePerHead, shown: 7.5 },
    { what: 'Bids lost (case.js)', value: CLIENT_INTERVIEWS.lostBids, shown: 5 },
    { what: 'Clients interviewed (case.js)', value: CLIENT_INTERVIEWS.interviewed, shown: 12 },
    { what: 'Interviews: coffee quality (case.js)', value: R['Coffee quality'], shown: 9 },
    { what: 'Interviews: reliability (case.js)', value: R['Reliability on the day'], shown: 7 },
    { what: 'Interviews: baristas (case.js)', value: R['Baristas’ professionalism'], shown: 6 },
    { what: 'Interviews: price (case.js)', value: R.Price, shown: 2 },
    { what: 'Stick: customer’s share', value: 10 - 8, shown: 2 },
    { what: 'Stick: business’s margin', value: 8 - 5, shown: 3 },
    { what: 'Stick: value created', value: 10 - 5, shown: 5 },
    { what: 'Stick: cost route value', value: 10 - 4, shown: 6 },
    { what: 'Stick: differentiation route value', value: 12 - 6, shown: 6 },
    { what: 'Premium text: rival leaves', value: 40, shown: 40 },
    { what: 'Greyfriars: premium %', value: (2.25 / 1.80 - 1) * 100, shown: 25 },
    { what: 'Greyfriars: price gap per shirt', value: 2.25 - 1.80, shown: 0.45 },
    { what: 'Greyfriars: extra per week', value: 400 * (2.25 - 1.80), shown: 180 },
    { what: 'Greyfriars: extra per year', value: 400 * (2.25 - 1.80) * 52, shown: 9360 },
    { what: 'Greyfriars: damage saving per week', value: 400 * (0.10 - 0.02), shown: 32 },
    { what: 'Greyfriars: value of difference per week', value: 400 * (0.10 - 0.02) + 120, shown: 152 },
    { what: 'Greyfriars: hotel worse off per week', value: 400 * (2.25 - 1.80) - (400 * 0.08 + 120), shown: 28 },
    { what: 'Greyfriars: acceptable premium per shirt', value: 152 / 400, shown: 0.38 },
    { what: 'Greyfriars: acceptable price', value: 1.80 + 152 / 400, shown: 2.18 },
    { what: 'Orchard: value created', value: OW.wtp - OW.cost, shown: 170 },
    { what: 'Bellweather: value created', value: BD.wtp - BD.cost, shown: 140 },
    { what: 'Orchard: extra value', value: (OW.wtp - OW.cost) - (BD.wtp - BD.cost), shown: 30 },
    { what: 'Orchard: extra cost', value: OW.cost - BD.cost, shown: 50 },
    { what: 'Bellweather: member keeps', value: BD.wtp - BD.price, shown: 40 },
    { what: 'Orchard: highest winning price', value: owMax, shown: 380 },
    { what: 'Orchard: WTP gap', value: OW.wtp - BD.wtp, shown: 80 },
    { what: 'Orchard: margin at highest price', value: owMax - OW.cost, shown: 130 },
    { what: 'Bellweather: margin', value: BD.price - BD.cost, shown: 100 },
    { what: 'Orchard: premium %', value: (owMax / BD.price - 1) * 100, shown: 26.7, tol: 0.05 },
    { what: 'Orchard: margin if matching', value: BD.price - OW.cost, shown: 50 },
    { what: 'Orchard: margin given away by matching', value: (owMax - OW.cost) - (BD.price - OW.cost), shown: 80 },
    { what: 'Orchard: member keeps if matching', value: OW.wtp - BD.price, shown: 120 },
    { what: 'Orchard: ceiling after rival cut', value: 280 + (OW.wtp - BD.wtp), shown: 360 },
    { what: 'Orchard: margin after rival cut', value: 360 - OW.cost, shown: 110 },
    { what: 'Bellweather: margin after its cut', value: 280 - BD.cost, shown: 80 },
    { what: 'Orchard: low-value member ceiling', value: BD.price + (350 - BD.wtp), shown: 310 },
    { what: 'Orchard: low-value member margin', value: 310 - OW.cost, shown: 60 },
    { what: 'Ostlund: installations on record', value: 2000, shown: 2000 },
  ],
};
