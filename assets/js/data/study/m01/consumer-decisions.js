// consumer-decisions.js — M01 · How consumers make buying decisions. Content only; exercises are in consumer-decisions.ex.js.
// Lantern facts come from ./case.js (fictional); every other business, person and number here is invented and labelled.
// `checks` recompute every printed number.
import { BUSINESS, DERIVED } from './case.js';

const W = BUSINESS.workshops;
const score = (w, s) => w.reduce((t, wi, i) => t + wi * s[i], 0);
// Attributes for the workshop examples: hands-on practice, price, timing (scores out of 10, fictional).
const NADIA = [0.5, 0.2, 0.3];
const N = { lantern: [9, 5, 6], crema: [3, 9, 10], calder: [8, 4, 4] };
const OFFICE = [0.3, 0.2, 0.5];
const O = { lantern: [9, 5, 4], crema: [3, 9, 10], calder: [8, 4, 7] };
// Attributes for the e-bikes: range, comfort, price (scores out of 10, fictional).
const COMMUTE = [0.5, 0.2, 0.3];
const OCCASIONAL = [0.2, 0.3, 0.5];
const BIKE = { strider: [9, 9, 3], arrowline: [5, 6, 9], volta: [7, 7, 6] };

const PROCESS = '<svg viewBox="0 0 722 224" xmlns="http://www.w3.org/2000/svg" font-family="inherit" font-size="13"><defs><marker id="cd-ar" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>'
  + [['1. Need', 'recognition'], ['2. Information', 'search'], ['3. Evaluation of', 'alternatives'], ['4. Purchase', 'decision'], ['5. Post-purchase', 'behaviour']]
    .map(([a, b], i) => { const x = 6 + i * 145; return `<rect x="${x}" y="80" width="130" height="60" rx="6" style="fill:none;stroke:var(--series-${(i % 3) + 1});stroke-width:2"/><text x="${x + 65}" y="105" text-anchor="middle" font-size="12" font-weight="700" fill="currentColor">${a}</text><text x="${x + 65}" y="123" text-anchor="middle" font-size="12" fill="currentColor">${b}</text>`; }).join('')
  + [0, 1, 2, 3].map((i) => { const x = 136 + i * 145; return `<line x1="${x + 1}" y1="110" x2="${x + 13}" y2="110" style="stroke:currentColor;stroke-width:1.5" marker-end="url(#cd-ar)"/>`; }).join('')
  + '<path d="M71 80L71 44L506 44L506 76" style="fill:none;stroke:currentColor;stroke-width:1.5;stroke-dasharray:6 4" marker-end="url(#cd-ar)"/>'
  + '<text x="288" y="34" text-anchor="middle" font-size="12" fill="currentColor">routine, low-involvement purchases often skip the middle stages</text>'
  + '<path d="M651 140L651 184L71 184L71 144" style="fill:none;stroke:currentColor;stroke-width:1.5;stroke-dasharray:6 4" marker-end="url(#cd-ar)"/>'
  + '<text x="361" y="206" text-anchor="middle" font-size="12" fill="currentColor">experience feeds the next purchase: satisfaction, reviews, loyalty</text>'
  + '</svg>';

/** One check per printed term w_i × s_i, against the literal values the text prints. */
const terms = (label, w, s, shown) => s.map((x, i) => ({ what: `${label}: term ${i + 1}`, value: w[i] * x, shown: shown[i] }));

const online = BUSINESS.online.customers.toLocaleString('en-US');

export default {
  slug: 'consumer-decisions',
  title: 'How consumers make buying decisions',
  blurb: 'Every purchase, from a bag of beans to a barista course, comes out of a decision, made in seconds or over weeks. Learn the five stages of the buying process, how involvement changes it, how buyers weigh alternatives (with a scoring model you can calculate), what happens after the sale, and where the tidy model breaks down, online and off.',
  status: 'draft',
  objectives: [
    'Describe the five stages of the consumer buying process and what a marketer can do at each one.',
    'Distinguish high- from low-involvement purchases and classify buying behaviour as complex, dissonance-reducing, habitual or variety-seeking.',
    'Calculate weighted-attribute scores for competing offers and the improvement an offer needs to draw level with the leader.',
    'Explain post-purchase dissonance and how sellers can reduce it.',
    'Evaluate the limits of linear decision models, including the way online journeys loop, skip stages and add options.',
  ],
  prerequisites: [
    { lesson: 'm01/what-is-marketing', why: 'The lesson uses the difference between a need and a want.' },
    { lesson: 'm01/customer-value', why: 'Post-purchase evaluation compares what the buyer got with what they expected, the idea of satisfaction from that lesson.' },
    { text: 'Multiplying and adding decimals, for example 0.5 × 9 + 0.2 × 5.' },
  ],
  case: 'lantern',

  concept: [
    { case: `By the end of 2026 Lantern Coffee Co. sells to three kinds of buyer. ${BUSINESS.catering.clients} offices and event organisers book its catering. People book places on its barista workshops: ${W.held} so far this year, with about ${W.avgParticipants} people at each, at $${W.pricePerPerson} a place. And about ${online} customers have bought beans, the Cold Brew Pack or gift boxes from its online shop. Ana Lim has noticed that these buyers decide in very different ways. Some online customers reorder the same 250 g bag every month without a second look; others spend a week over a $58 gift box; and many people who read the workshop page never book. Every name and figure in this case is invented for teaching.` },
    { p: 'This lesson is about the second and third groups: individuals and households buying for their own use, the <g>business-to-consumer</g> side of Lantern. Organisations buy to run their operations or to resell, and the last lesson of this module covers how they buy. Remember from the first lesson that the <g>customer</g>, who chooses and pays, is not always the <g>consumer</g>, who uses the product: someone buying a gift box is the customer, and the person who drinks the coffee is the consumer. <i>Consumer behaviour</i> is the study of how people choose, buy, use and dispose of products, and why. Marketers study it for a practical reason: they can influence a choice only at the moments when it is being made, so they need to know what those moments are.' },

    { h: 'The five-stage buying process' },
    { p: 'Introductory textbooks describe a considered purchase as a sequence of five stages, the <g>buying decision process</g>: need recognition, information search, evaluation of alternatives, the purchase decision and post-purchase behaviour. The process starts well before anything is bought and carries on after the sale.' },
    { figure: {
      svg: PROCESS,
      caption: 'The buying decision process. The solid arrows show the textbook sequence; the dashed arrows show two common departures from it: routine purchases that skip stages, and the loop from one purchase into the next.',
      alt: 'Five boxes in a row joined by arrows from left to right: 1. Need recognition, 2. Information search, 3. Evaluation of alternatives, 4. Purchase decision, 5. Post-purchase behaviour. A dashed arrow runs above the row from Need recognition directly to Purchase decision, labelled “routine, low-involvement purchases often skip the middle stages”. A second dashed arrow runs below the row from Post-purchase behaviour back to Need recognition, labelled “experience feeds the next purchase: satisfaction, reviews, loyalty”.',
    } },
    { p: 'Here is the process in one purchase.' },
    { case: `Nadia Farouk was given an espresso machine for her birthday. A month later her milk still comes out as flat foam, while a friend posts photographs of perfect latte art. The gap between what she has and what she wants is <b>need recognition</b>. She first thinks about what she already knows: a barista once poured hearts in her coffee at a conference (internal search). Then she searches online, reads reviews and asks the friend (external search). She ends up with three options: Lantern’s three-hour Saturday workshop at $${W.pricePerPerson}, with hands-on practice in a small group; CremaClass, an online video course at $39; and a six-evening course at Calder College for $210. She weighs them on hands-on practice, price and timing (<b>evaluation of alternatives</b>) and chooses Lantern, but the first Saturday on offer clashes with a wedding, so she books the next one (<b>purchase decision</b>). Afterwards she compares the workshop with what she expected, posts her first rosetta and, when Lantern’s follow-up e-mail arrives with a practice guide, stops wondering whether the online course would have done (<b>post-purchase behaviour</b>). Nadia, CremaClass and Calder College are fictional.` },

    { h: 'Involvement: how much the decision matters' },
    { p: '<g>Involvement</g> is how much a purchase matters to the buyer: how personally relevant it is, how much is at stake and how interested they are in the category. What is at stake has several sides: money, whether the product will work, what other people will think, and the time lost if the choice turns out wrong. When involvement is high, buyers work through every stage with care; when it is low, they skip most of them.' },
    { p: 'Involvement belongs to the buyer and the situation, not to the product. For Nadia a $125 workshop is a considered choice; for a café owner booking the same workshop for a new employee it may be a routine booking. A bag of beans is a habit for many of Lantern’s online customers and a subject of research for an enthusiast comparing farms and roast dates. A gift raises involvement for almost anyone, because a poor choice reflects on the giver.' },
    { p: 'The idea has a long history in advertising research. Herbert Krugman (1965) argued that much television advertising works on viewers who are barely paying attention. Rather than persuading them with arguments, repetition gradually shifts which ideas about a product come to mind first, and a shopper may form a clear opinion only after buying and trying it. That reverses the textbook order, in which people evaluate first and buy afterwards.' },
    { callout: 'key', title: 'Ask which decision your buyer is making', html: 'Before planning any marketing, ask how involved the target buyer is. A high-involvement buyer wants information, comparisons and reassurance. A low-involvement buyer wants the product to be easy to find, easy to recognise and easy to buy again.' },
  ],

  theory: [
    { h: 'Stage by stage' },
    { p: '<b>Need recognition.</b> A purchase begins when a buyer notices a gap between their actual state and a desired state. The trigger can be internal (hunger, shoes that have worn through) or external (an advertisement, a friend’s photographs, the smell from a bakery). Marketers can prompt recognition of a gap the buyer already has, for example with a reorder e-mail when a subscriber’s beans should be running low. What they cannot do for long is invent a need the buyer doesn’t have; what they shape is the want, the particular way of meeting the need, as the first lesson of this course explained.' },
    { p: '<b>Information search.</b> <i>Internal search</i> draws on memory: past purchases and brands the buyer already knows. <i>External search</i> draws on four kinds of source: personal (family, friends, colleagues), commercial (advertising, websites, packaging, salespeople), public (independent reviews, ratings sites, the media) and experiential (handling, tasting or trying the product). Because personal and public sources don’t come from the seller, buyers often treat them as more credible than commercial ones, which is why the next lesson spends time on word of mouth. Search is longer when involvement and risk are high, when the buyer knows little about the category and when the options differ a lot; it is shorter under time pressure or after a good past experience.' },
    { p: 'Search also narrows the field. Of all the options that exist, a buyer knows only some, the awareness set, and seriously considers fewer still: the <g>consideration set</g>, sometimes called the evoked set. An option that isn’t in the consideration set when the buyer chooses can’t be chosen, however good it is, which is why so much marketing aims at nothing more than being considered.' },
    { p: '<b>Evaluation of alternatives.</b> Buyers judge options on a few attributes that matter to them, such as price, quality, convenience or style, and they care about some attributes more than others. OpenStax describes this as consumers viewing a product as a “bundle of product attributes”. Marketers model the judgement with a <g>weighted-attribute model</g>: give each attribute an importance weight, score each option on each attribute, multiply and add. The option with the highest total is the one the model expects the buyer to prefer; the formula is below. The model is <i>compensatory</i> because strength on one attribute can make up for weakness on another: CremaClass’s low price partly compensates for its lack of hands-on practice.' },
    { p: 'Not every buyer compensates. Under a <g>non-compensatory rule</g> a weakness can’t be offset. A <i>conjunctive</i> rule sets cut-offs that every option must pass (nothing over $2,200; nothing without a warranty), and only the options that pass all of them are compared. A <i>lexicographic</i> rule picks the best option on the most important attribute and looks at the next attribute only to break a tie. Buyers also use shortcuts: a higher price taken as a sign of higher quality, the familiar brand bought again, a country of origin trusted for a product. Low-involvement buyers lean heavily on such shortcuts.' },
    { p: '<b>Purchase decision.</b> An intention to buy is not yet a purchase. Two things can come between them: other people’s attitudes (a partner who thinks $125 is too much for a coffee lesson) and unexpected situational factors (a date clash, a sold-out session, a delivery charge that appears only at the checkout). The decision also has parts: where to buy, when, how much and how to pay. Online, every extra step in the checkout is a chance for the intention to fade, which is why sellers watch the share of baskets that are abandoned.' },
    { p: '<b>Post-purchase behaviour.</b> After buying, the customer compares what they got with what they expected. That comparison decides <g>customer satisfaction</g>, as the lesson on customer value set out, and satisfaction decides whether they buy again, what they tell other people and what they write in reviews. The process therefore loops: today’s experience becomes part of the information search for the next purchase, by this customer and by everyone who reads their review.' },

    { h: 'Post-purchase dissonance' },
    { p: 'Even a satisfied buyer can feel uneasy. <g>Post-purchase dissonance</g> is the discomfort a buyer feels after a choice when they doubt it was the right one, often because the options they turned down had attractive features of their own. The idea comes from the psychologist Leon Festinger’s theory of cognitive dissonance (1957): people dislike holding conflicting thoughts, such as “I chose this” and “the other one might have been better”, and look for ways to reduce the conflict. In everyday speech it is called buyer’s remorse.' },
    { p: 'Dissonance is most likely when the purchase is important or expensive, hard to reverse, and the alternatives were close. Buyers reduce it by seeking reassurance (reading good reviews of what they bought) or by returning the product. Sellers can help, and have good reason to, because an uneasy customer is less likely to buy again: confirm the choice with useful follow-up, offer guarantees and easy returns, and above all don’t promise more than the product delivers, because an inflated expectation guarantees a disappointment. Dissonance is not the same as dissatisfaction. Nadia enjoyed her workshop and still wondered, briefly, whether the cheaper course would have done.' },

    { h: 'Four kinds of buying behaviour' },
    { p: 'Combining involvement with how much the brands differ, as the buyer sees them, gives a common classification of buying behaviour.' },
    { table: {
      caption: 'Four kinds of buying behaviour',
      head: ['', 'Brands differ a lot', 'Brands differ little'],
      rows: [
        ['High involvement', '<b>Complex buying</b>: extensive search and careful evaluation. A car, a university course, a first espresso machine.', '<b>Dissonance-reducing buying</b>: a fairly quick choice among similar options, then doubts. Floor tiles; a sofa from several similar ranges.'],
        ['Low involvement', '<b>Variety-seeking buying</b>: switching brands for a change, not from dissatisfaction. Snacks; a different coffee origin each month.', '<b>Habitual buying</b>: routine repurchase with little thought. Milk; the usual bag of house-blend beans.'],
      ],
      note: 'The classification follows OpenStax, section 3.1. The examples are illustrations: where a purchase falls depends on the buyer.',
    } },
    { p: 'Each cell calls for different marketing. Complex buyers want detailed information and fair comparisons. Dissonance-reducing buyers want reassurance after the sale. Habitual buyers are held by availability, a recognisable pack and a reminder at the right moment; a challenger has to break the habit with a reason to try something new, such as a sample or a trial price. Variety-seekers respond to new flavours and limited editions, and a market leader can keep them by offering variety within its own range. The four types are tendencies, not fixed labels: the same person can buy beans out of habit for the office and with great care as a gift.' },

    { h: 'Online journeys' },
    { p: 'Shopping online did not abolish the stages, but it changed how people move through them. Searching costs little, strangers’ reviews are a click away, comparison sites lay options side by side, and many people research on a phone while standing in a shop. Each point at which a buyer meets a brand, from a search result to a delivery text message, is a <g>touchpoint</g>, and the whole sequence of touchpoints and decisions, from first noticing a need to the experience after buying, is the <g>customer journey</g>.' },
    { p: 'In 2009 four McKinsey consultants, David Court, Dave Elzinga, Susan Mulder and Ole Jørgen Vetvik, studied the purchase decisions of almost 20,000 consumers in five industries on three continents. They argued that the funnel, in which buyers start with many brands and steadily narrow them down, misses how people actually buy. They described instead a circular journey with four phases: initial consideration, active evaluation, the moment of purchase, and the post-purchase experience, which feeds a loyalty loop into the next decision. Buyers in their study often <i>added</i> brands during evaluation: car shoppers, for example, added an average of 2.2 brands to an initial set of 3.8. And they reported that two-thirds of the touchpoints during active evaluation were driven by consumers, such as reviews and word of mouth, rather than pushed by companies.' },
    { p: 'For a seller this means three things. Missing the initial consideration set is no longer fatal, because a brand can still be found during evaluation, but only if search results, reviews and comparison sites show it at that moment. What customers say after buying is part of the next buyer’s search. And the post-purchase experience is not the end of the job; it starts the next journey.' },

    { h: 'The limits of linear models' },
    { p: 'The five stages are a useful way to organise thinking, not a description of every purchase. Real decisions depart from the model in at least four ways.' },
    { list: [
      '<b>Stages are skipped.</b> A habitual buyer goes from need recognition straight to purchase. Nothing is searched or evaluated because nothing needs to be.',
      '<b>Stages come in a different order.</b> An impulse buyer buys first and evaluates afterwards. Free samples let people try a product before they have searched at all, and Krugman’s low-involvement viewers form opinions after buying.',
      '<b>Stages repeat.</b> Buyers loop back from evaluation to search when a new option appears or a review raises a doubt, and an online journey can stretch over weeks of visits.',
      '<b>The model assumes deliberate reasoning by one person.</b> Many choices rest on habit, emotion, mood and the shortcuts and biases covered in the next lesson, and many are made by couples, families or groups of friends.',
    ] },
    { callout: 'warn', title: 'A checklist, not a law', html: 'Use the five stages to ask where a buyer could be lost and what would help them at that point. Don’t use them to predict what a particular person will do, and don’t assume buyers really calculate weighted scores. The model describes the trade-offs people make; its weights and scores have to come from asking real buyers, which M04 Market Research teaches.' },
  ],

  formulas: [
    { id: 'weighted-attribute-score', name: 'Weighted-attribute score of an option',
      tex: String.raw`S_j = \sum_{i} w_i \, s_{ij}`,
      where: [
        [String.raw`S_j`, 'Weighted score of option j', 'points (same scale as the scores)'],
        [String.raw`w_i`, 'Importance weight of attribute i; the weights add up to 1', ''],
        [String.raw`s_{ij}`, 'Score of option j on attribute i, as the buyer judges it (here on a 1–10 scale)', 'points'],
        [String.raw`i,\ j`, 'Labels: i runs over the attributes, j identifies the option', ''],
      ],
      assumptions: 'The buyer is willing to trade attributes off against each other (the model is compensatory), and the weights and scores describe that buyer or a group of similar buyers. Scores must be on the same scale, with higher always better: a cheap option gets a high price score.',
      note: 'Weights and scores come from research with buyers (surveys, interviews, or the conjoint analysis taught in M04). Different groups of buyers have different weights, which is the starting point for segmentation in M05.' },
    { id: 'score-gap-to-close', name: 'Improvement needed to draw level with the leader',
      tex: String.raw`\Delta s_{kj} = \dfrac{S_{\text{lead}} - S_j}{w_k}`,
      where: [
        [String.raw`\Delta s_{kj}`, 'Rise in option j’s score on attribute k that would bring its weighted score level with the leader’s', 'points'],
        [String.raw`S_{\text{lead}}`, 'Weighted score of the option currently in the lead', 'points'],
        [String.raw`S_j`, 'Weighted score of option j', 'points'],
        [String.raw`w_k`, 'Importance weight of attribute k', ''],
      ],
      assumptions: 'Only attribute k changes and every other score and weight stays the same. To overtake rather than tie, the rise must be larger than this.',
      note: 'The heavier the weight, the smaller the rise needed. If the rise would take the score above the top of the scale, no improvement on that attribute alone can close the gap. A point on one attribute may cost far more to deliver than a point on another, so compare the cost of each route, not just the points.' },
  ],

  examples: [
    { level: 'simple', title: 'Nadia scores her three options', fictional: true,
      setup: 'Nadia cares most about hands-on practice (weight 0.5), then timing (0.3), then price (0.2). She scores each option out of 10 on each attribute, a higher score always being better (so a cheaper option scores higher on price). Which option does the weighted-attribute model expect her to choose?',
      table: {
        caption: 'Nadia’s scores out of 10 (fictional)',
        head: ['Option', 'Hands-on (0.5)', 'Price (0.2)', 'Timing (0.3)'],
        align: ['l', 'r', 'r', 'r'],
        rows: [
          ['Lantern workshop, $125', '9', '5', '6'],
          ['CremaClass online, $39', '3', '9', '10'],
          ['Calder College evenings, $210', '8', '4', '4'],
        ],
      },
      steps: [
        String.raw`Check the weights add up to 1: <m>0.5 + 0.2 + 0.3 = 1</m>.`,
        String.raw`Lantern: <m>0.5 \times 9 + 0.2 \times 5 + 0.3 \times 6 = 4.5 + 1.0 + 1.8 = 7.3</m>.`,
        String.raw`CremaClass: <m>0.5 \times 3 + 0.2 \times 9 + 0.3 \times 10 = 1.5 + 1.8 + 3.0 = 6.3</m>.`,
        String.raw`Calder College: <m>0.5 \times 8 + 0.2 \times 4 + 0.3 \times 4 = 4.0 + 0.8 + 1.2 = 6.0</m>.`,
        String.raw`See why Lantern wins against the cheapest option. Its hands-on advantage over CremaClass is worth <m>0.5 \times (9 - 3) = 3.0</m> points; CremaClass’s price and timing advantages are worth <m>0.2 \times (9 - 5) = 0.8</m> and <m>0.3 \times (10 - 6) = 1.2</m>. Net: <m>3.0 - 0.8 - 1.2 = 1.0</m>, the gap between 7.3 and 6.3.`,
      ],
      answer: 'Lantern scores 7.3, CremaClass 6.3 and Calder College 6.0, so the model expects Nadia to choose Lantern’s workshop.',
      interpretation: 'CremaClass is far cheaper, but price carries only a fifth of the weight in Nadia’s judgement, and hands-on practice carries half. For a buyer like Nadia, Lantern should talk about practice on real machines, not about price.' },

    { level: 'challenging', title: 'One set of e-bikes, two kinds of rider', fictional: true,
      setup: 'Pacer Cycles, a fictional bike shop, sells three e-bikes: the Arrowline City ($1,700), the Volta Flex ($2,100) and the Strider Tour ($2,600). Its research gives scores out of 10 on range, comfort and price (higher is better), and weights for two groups of customers: commuters (range 0.5, comfort 0.2, price 0.3) and occasional riders (range 0.2, comfort 0.3, price 0.5). (a) Which bike leads with each group? (b) A commuter will not spend more than $2,200. Which bike does she choose? (c) Volta’s maker wants the Volta Flex to draw level with the leader among commuters by improving one attribute. How much would each attribute’s score have to rise?',
      table: {
        caption: 'Scores out of 10 (fictional)',
        head: ['E-bike', 'Range', 'Comfort', 'Price'],
        align: ['l', 'r', 'r', 'r'],
        rows: [
          ['Strider Tour, $2,600', '9', '9', '3'],
          ['Arrowline City, $1,700', '5', '6', '9'],
          ['Volta Flex, $2,100', '7', '7', '6'],
        ],
      },
      steps: [
        String.raw`Commuters: Strider <m>0.5 \times 9 + 0.2 \times 9 + 0.3 \times 3 = 4.5 + 1.8 + 0.9 = 7.2</m>; Arrowline <m>2.5 + 1.2 + 2.7 = 6.4</m>; Volta <m>3.5 + 1.4 + 1.8 = 6.7</m>. The Strider Tour leads.`,
        String.raw`Occasional riders: Strider <m>0.2 \times 9 + 0.3 \times 9 + 0.5 \times 3 = 1.8 + 2.7 + 1.5 = 6.0</m>; Arrowline <m>1.0 + 1.8 + 4.5 = 7.3</m>; Volta <m>1.4 + 2.1 + 3.0 = 6.5</m>. The Arrowline City leads. Same bikes and same scores, but the weights reverse the ranking.`,
        'Apply the commuter’s cut-off first (a conjunctive rule). The Strider Tour costs $2,600, over her $2,200 limit, so it is out whatever its score. Of the two left, the Volta Flex (6.7) beats the Arrowline City (6.4).',
        String.raw`Use the gap formula for (c). The Volta Flex trails the Strider Tour by <m>7.2 - 6.7 = 0.5</m> among commuters. Range: <m>0.5 \div 0.5 = 1.0</m> point. Price: <m>0.5 \div 0.3 \approx 1.67</m> points. Comfort: <m>0.5 \div 0.2 = 2.5</m> points.`,
        'Judge the routes. A 1-point rise in range (from 7 to 8) would bring the Volta level and anything more would put it ahead. A price-score rise of 1.67 points means a real price cut, which costs margin on every bike; a 2.5-point comfort rise is the largest change. The cheapest route in points is the heaviest-weighted attribute, but the maker must still compare what each point costs to deliver.',
      ],
      answer: '(a) Commuters: Strider Tour 7.2, Volta Flex 6.7, Arrowline City 6.4. Occasional riders: Arrowline City 7.3, Volta Flex 6.5, Strider Tour 6.0. (b) With a $2,200 cut-off the commuter chooses the Volta Flex (6.7 against 6.4). (c) To draw level among commuters the Volta Flex needs +1.0 point on range, or about +1.67 on price, or +2.5 on comfort.',
      interpretation: 'There is no single best bike: the answer depends on whose weights you use and on cut-offs the scores don’t show. A shop that recommended the Strider Tour to everyone would lose the occasional riders, and a commuter on a budget never weighs the Strider at all. That is why marketers measure weights for each group of customers and ask about deal-breakers as well.' },

    { level: 'applied', title: 'Evening sessions or a price cut?', fictional: true,
      setup: `Ana wants more office workers to book Lantern’s workshops. Interviews with a handful of office workers who looked at the workshop page but didn’t book (fictional) suggest weights of 0.3 for hands-on practice, 0.2 for price and 0.5 for timing: weekends are precious, and evenings near the office suit them. They score Lantern’s Saturday workshop 9 for hands-on, 5 for price and 4 for timing; CremaClass 3, 9 and 10; and Calder College’s evening course 8, 4 and 7. Ana is considering two changes: (A) cutting the price from $${W.pricePerPerson} to $99, which would raise Lantern’s price score to 7; or (B) adding weekday evening sessions near the business district, which would raise its timing score to 9. Which change, if either, should she make?`,
      steps: [
        String.raw`Today: Lantern <m>0.3 \times 9 + 0.2 \times 5 + 0.5 \times 4 = 2.7 + 1.0 + 2.0 = 5.7</m>; CremaClass <m>0.9 + 1.8 + 5.0 = 7.7</m>; Calder College <m>2.4 + 0.8 + 3.5 = 6.7</m>. Lantern comes last with these buyers, although it came first with Nadia.`,
        String.raw`Change A: <m>2.7 + 0.2 \times 7 + 2.0 = 6.1</m>. Still last. The gap formula shows why: to draw level with CremaClass through price alone, Lantern’s price score would have to rise by <m>(7.7 - 5.7) \div 0.2 = 10</m> points, to 15 on a 10-point scale. No price cut can do it.`,
        String.raw`Change B: <m>2.7 + 1.0 + 0.5 \times 9 = 8.2</m>, ahead of CremaClass’s 7.7. Through timing, Lantern needs <m>(7.7 - 5.7) \div 0.5 = 4</m> points just to draw level (a timing score of 8), so the evening sessions’ 9 puts it ahead.`,
        String.raw`Count the cost of A. At this year’s bookings, <m>${W.held} \times ${W.avgParticipants} = 168</m> places, a $26 cut would give up <m>168 \times 26 = \$4{,}368</m> of the $${DERIVED.workshopRevenue.toLocaleString('en-US')} workshop revenue, about 20.8%, and win no office workers. B costs a barista’s evenings and a room, which Ana has to price, but it keeps the price.`,
      ],
      answer: 'Make change B. Evening sessions would lift Lantern’s score with office workers from 5.7 to 8.2, ahead of CremaClass’s 7.7. Cutting the price to $99 would lift it only to 6.1, leave it last, and give up about $4,368 a year of revenue at current bookings.',
      interpretation: 'Lantern lost these buyers on timing, not on price, so a price cut would have spent money on the wrong problem. The analysis rests on a handful of interviews, so before investing Ana should test it cheaply, for example by advertising two evening dates and counting bookings. Notice also that the same workshop scored 7.3 with Nadia and 5.7 with office workers: weights belong to groups of buyers, not to the product.' },
  ],

  demo: [
    { widget: 'cd-scoring', intro: 'The weighted-attribute model for Lantern’s workshop against CremaClass and Calder College, starting from the office workers’ weights in the applied example. Raise Lantern’s timing score to 9 to see change B, or its price score to 7 to see change A. Then change the weights: give hands-on practice 50, price 20 and timing 30, roughly Nadia’s weights (her own timing score for Lantern was 6, not 4), and watch the ranking move. The weights are scaled to add up to 100% whatever you enter.' },
  ],

  mistakes: [
    { title: '“Every purchase goes through all five stages.”', html: 'Only considered, high-involvement purchases do. A habitual buyer goes from need recognition straight to purchase; an impulse buyer buys first and evaluates afterwards. Ask which kind of decision your buyer is making before deciding where to spend effort.' },
    { title: '“The decision ends at the checkout.”', html: 'Post-purchase behaviour decides repeat purchases, word of mouth and reviews, and reviews feed other people’s searches. A seller who stops at the sale gives up the stage that shapes the next one.' },
    { title: '“Involvement is a property of the product.”', html: 'It depends on the buyer and the situation. The same bag of beans is a routine purchase for one customer, a hobby for another and a nerve-racking gift for a third.' },
    { title: '“The highest weighted score is what people will buy.”', html: 'The model describes trade-offs; it isn’t a calculation buyers perform. Its result depends on whose weights you use, and a non-compensatory cut-off (a budget limit, a missing feature) can rule out the top-scoring option before any trade-off is made.' },
    { title: '“Online buyers move down a funnel that only narrows.”', html: 'Court and colleagues (2009) found buyers adding brands during evaluation, and most touchpoints at that stage were driven by consumers rather than companies. A brand can be added late, and can be dropped late, on the strength of a review.' },
    { title: '“Buyer’s remorse means the product was bad.”', html: 'Dissonance is doubt about the choice, not dissatisfaction with the product. It is most likely after important, hard-to-reverse choices between close options, and reassurance, guarantees and honest expectations reduce it.' },
  ],

  application: [
    { case: 'Holloway Home, a fictional online furniture retailer, sells sofas from $900 to $2,400. A sofa is a high-involvement purchase: expensive, bulky to send back and seen by every visitor to the buyer’s home. Its customer-experience manager, Ines Dunmore, maps the customer journey for sofas stage by stage, using the website’s data and interviews with 40 recent buyers and 40 people who left without buying.' },
    { p: 'Her map turns each stage into a question. At <b>information search</b>, buyers can’t touch the fabric, so many order free swatches; she cuts swatch delivery from a week to two days, because a buyer waiting for swatches is a buyer still searching elsewhere. At <b>evaluation</b>, interviewees compare three or four sofas on comfort, size, fabric, price and delivery time, so the site’s comparison page lets visitors filter on the attributes they care about most: a weighted-attribute model in practical form.' },
    { p: 'The <b>purchase decision</b> is where the data point. Each month about 2,000 shopping baskets contain a sofa and about 1,400 of them are abandoned, 70%, leaving about 600 orders. The interviews explain much of it: the delivery date appeared only at the last step of the checkout, and buyers who discovered it was six weeks away left. Ines has the delivery date shown on every product page and in the basket. Over the next two months abandonment averages 64%, so about 2,000 × 0.36 = 720 baskets become orders, 120 more a month. At an average order of about $1,500, that is roughly $180,000 a month of extra sales. Before claiming the credit she checks against a baseline, as B01 taught: the same months last year, and the abandonment rate for chairs and tables, whose pages did not change. The share of baskets that become orders is a <g>conversion rate</g>, so she states its denominator: baskets, not visits.' },
    { p: 'At <b>post-purchase</b>, interviews show that buyers worry most in the weeks between paying and delivery, when they can’t yet sit on the sofa and keep seeing others they might have bought. Holloway now sends a note after payment with the delivery date, care instructions for the chosen fabric and a reminder of the returns policy. It is an attempt to reduce post-purchase dissonance, and Ines will judge it by the share of orders cancelled before delivery.' },
    { p: 'The same map works anywhere a decision takes time. A university can follow applicants from enquiry to enrolment and ask where they drop out; a hotel can follow guests from searching to booking to reviewing. Lantern can do it for its workshops: the applied example found a timing problem in evaluation, and the same method would show whether people are lost later, at a clumsy booking form or a session that is already full.' },
  ],

  summary: [
    'Considered purchases pass through five stages: need recognition, information search, evaluation of alternatives, the purchase decision and post-purchase behaviour. Each is a point where a marketer can help or lose the buyer.',
    'Involvement, how much a purchase matters to the buyer, decides how much of the process is used. It depends on the buyer and the situation as well as the product.',
    'Combining involvement with perceived brand differences gives four kinds of buying behaviour: complex, dissonance-reducing, habitual and variety-seeking.',
    'The weighted-attribute model multiplies each score by its importance weight and adds them up. Different groups of buyers have different weights, and non-compensatory cut-offs can rule an option out before any trade-off.',
    'The gap formula shows how much one attribute must improve to draw level with the leader; the heaviest-weighted attribute needs the smallest rise, but cost matters too.',
    'Post-purchase dissonance is doubt after an important choice between close options; reassurance, guarantees and honest expectations reduce it.',
    'Online journeys loop, add options during evaluation and depend on consumer-driven touchpoints such as reviews. The five stages are a checklist for finding where buyers are lost, not a law of behaviour.',
  ],

  glossary: [
    { term: 'Buying decision process', def: 'The five stages a consumer goes through in a considered purchase: need recognition, information search, evaluation of alternatives, purchase decision and post-purchase behaviour. Routine purchases skip stages.' },
    { term: 'Need recognition', def: 'The first stage of the buying decision process: the buyer notices a gap between their actual state and a desired state, prompted by an internal or external trigger.' },
    { term: 'Information search', def: 'The stage in which a buyer looks for information about ways to meet a need, from memory (internal search) or from personal, commercial, public and experiential sources (external search).' },
    { term: 'Consideration set', def: 'The options a buyer seriously considers when choosing, a subset of the options they know about; also called the evoked set.' },
    { term: 'Weighted-attribute model', def: 'A compensatory model of choice: each option’s score on each attribute is multiplied by the attribute’s importance weight and the results are added. The option with the highest total is the one the buyer is expected to prefer.' },
    { term: 'Non-compensatory rule', def: 'A choice rule under which a weakness on one attribute can’t be made up by strength on another, such as a cut-off every option must pass (conjunctive) or choosing the best option on the most important attribute (lexicographic).' },
    { term: 'Post-purchase dissonance', def: 'Discomfort after a purchase when the buyer doubts the choice, often because the rejected options had attractive features; also called buyer’s remorse.' },
    { term: 'Involvement', def: 'How much a purchase matters to the buyer: its personal relevance, what is at stake and the buyer’s interest in the category. It depends on the buyer and the situation as well as the product.' },
    { term: 'Complex buying behaviour', def: 'Buying with high involvement among brands that differ significantly: extensive search and careful evaluation.' },
    { term: 'Dissonance-reducing buying behaviour', def: 'Buying with high involvement among brands that seem alike: a fairly quick choice, often followed by doubts the buyer then tries to reduce.' },
    { term: 'Habitual buying behaviour', def: 'Buying with low involvement among brands that seem alike: routine repurchase with little search or evaluation.' },
    { term: 'Variety-seeking buying behaviour', def: 'Buying with low involvement among brands that differ: switching brands for a change rather than from dissatisfaction.' },
    { term: 'Touchpoint', def: 'Any point at which a customer meets a brand, such as an advertisement, a search result, a review, a website, a salesperson or a delivery message.' },
    { term: 'Customer journey', def: 'The whole sequence of touchpoints and decisions a customer goes through, from first noticing a need to the experience after the purchase.' },
  ],

  references: [
    { text: 'Gomez Albrecht, M., Green, M. &amp; Hoffman, L. (2023). <i>Principles of Marketing</i>, section 3.1, “Understanding Consumer Markets and Buying Behavior” (the four types of buying behaviour). OpenStax.', url: 'https://openstax.org/books/principles-marketing/pages/3-1-understanding-consumer-markets-and-buying-behavior', checked: '2026-10-23' },
    { text: 'Gomez Albrecht, M., Green, M. &amp; Hoffman, L. (2023). <i>Principles of Marketing</i>, section 3.3, “The Consumer Purchasing Decision Process”. OpenStax.', url: 'https://openstax.org/books/principles-marketing/pages/3-3-the-consumer-purchasing-decision-process', checked: '2026-10-23' },
    { text: 'Krugman, H. E. (1965). The impact of television advertising: learning without involvement. <i>Public Opinion Quarterly</i>, 29(3), 349–356. The abstract was consulted; the full text is not free to read.', url: 'https://doi.org/10.1086/267335', checked: '2026-10-23' },
    { text: 'Court, D., Elzinga, D., Mulder, S. &amp; Vetvik, O. J. (2009). The consumer decision journey. <i>McKinsey Quarterly</i>, 2009 number 3.', url: 'https://www.mckinsey.com/~/media/McKinsey/Business%20Functions/Marketing%20and%20Sales/Our%20Insights/The%20consumer%20decision%20journey/The%20consumer%20decision%20journey.pdf', checked: '2026-10-23' },
    { text: 'Festinger, L. (1957). <i>A Theory of Cognitive Dissonance</i>. Title, author and year confirmed from the Stanford University Press edition’s catalogue page; the book itself was not consulted.', url: 'https://www.degruyterbrill.com/document/doi/10.1515/9781503620766/html', checked: '2026-10-23' },
  ],

  checks: [
    ...terms('Nadia: Lantern', NADIA, N.lantern, [4.5, 1.0, 1.8]),
    ...terms('Nadia: CremaClass', NADIA, N.crema, [1.5, 1.8, 3.0]),
    ...terms('Nadia: Calder', NADIA, N.calder, [4.0, 0.8, 1.2]),
    ...terms('Bikes: commuter Strider', COMMUTE, BIKE.strider, [4.5, 1.8, 0.9]),
    ...terms('Bikes: commuter Arrowline', COMMUTE, BIKE.arrowline, [2.5, 1.2, 2.7]),
    ...terms('Bikes: commuter Volta', COMMUTE, BIKE.volta, [3.5, 1.4, 1.8]),
    ...terms('Bikes: occasional Strider', OCCASIONAL, BIKE.strider, [1.8, 2.7, 1.5]),
    ...terms('Bikes: occasional Arrowline', OCCASIONAL, BIKE.arrowline, [1.0, 1.8, 4.5]),
    ...terms('Bikes: occasional Volta', OCCASIONAL, BIKE.volta, [1.4, 2.1, 3.0]),
    ...terms('Office: Lantern', OFFICE, O.lantern, [2.7, 1.0, 2.0]),
    ...terms('Office: CremaClass', OFFICE, O.crema, [0.9, 1.8, 5.0]),
    ...terms('Office: Calder', OFFICE, O.calder, [2.4, 0.8, 3.5]),
    { what: 'Catering clients (case.js)', value: BUSINESS.catering.clients, shown: 18 },
    { what: 'Workshops held (case.js)', value: W.held, shown: 14 },
    { what: 'Average participants (case.js)', value: W.avgParticipants, shown: 12 },
    { what: 'Workshop price (case.js)', value: W.pricePerPerson, shown: 125 },
    { what: 'Online customers (case.js)', value: BUSINESS.online.customers, shown: 1500 },
    { what: 'Gift Box Trio price (B02 dataset)', value: 58, shown: 58 },
    { what: 'Nadia: weights add to 1', value: NADIA.reduce((a, b) => a + b, 0), shown: 1 },
    { what: 'Nadia: Lantern score', value: score(NADIA, N.lantern), shown: 7.3 },
    { what: 'Nadia: CremaClass score', value: score(NADIA, N.crema), shown: 6.3 },
    { what: 'Nadia: Calder score', value: score(NADIA, N.calder), shown: 6.0 },
    { what: 'Nadia: Lantern term hands-on', value: 0.5 * 9, shown: 4.5 },
    { what: 'Nadia: Lantern term price', value: 0.2 * 5, shown: 1.0 },
    { what: 'Nadia: Lantern term timing', value: 0.3 * 6, shown: 1.8 },
    { what: 'Nadia: hands-on advantage', value: 0.5 * (N.lantern[0] - N.crema[0]), shown: 3.0 },
    { what: 'Nadia: CremaClass price advantage', value: 0.2 * (N.crema[1] - N.lantern[1]), shown: 0.8 },
    { what: 'Nadia: CremaClass timing advantage', value: 0.3 * (N.crema[2] - N.lantern[2]), shown: 1.2 },
    { what: 'Nadia: net gap', value: score(NADIA, N.lantern) - score(NADIA, N.crema), shown: 1.0 },
    { what: 'Bikes: commuter Strider', value: score(COMMUTE, BIKE.strider), shown: 7.2 },
    { what: 'Bikes: commuter Arrowline', value: score(COMMUTE, BIKE.arrowline), shown: 6.4 },
    { what: 'Bikes: commuter Volta', value: score(COMMUTE, BIKE.volta), shown: 6.7 },
    { what: 'Bikes: occasional Strider', value: score(OCCASIONAL, BIKE.strider), shown: 6.0 },
    { what: 'Bikes: occasional Arrowline', value: score(OCCASIONAL, BIKE.arrowline), shown: 7.3 },
    { what: 'Bikes: occasional Volta', value: score(OCCASIONAL, BIKE.volta), shown: 6.5 },
    { what: 'Bikes: Volta gap to Strider (commuters)', value: score(COMMUTE, BIKE.strider) - score(COMMUTE, BIKE.volta), shown: 0.5 },
    { what: 'Bikes: range rise needed', value: (score(COMMUTE, BIKE.strider) - score(COMMUTE, BIKE.volta)) / COMMUTE[0], shown: 1.0 },
    { what: 'Bikes: price rise needed', value: (score(COMMUTE, BIKE.strider) - score(COMMUTE, BIKE.volta)) / COMMUTE[2], shown: 1.67, tol: 0.005 },
    { what: 'Bikes: comfort rise needed', value: (score(COMMUTE, BIKE.strider) - score(COMMUTE, BIKE.volta)) / COMMUTE[1], shown: 2.5 },
    { what: 'Bikes: range 7 + 1', value: BIKE.volta[0] + 1, shown: 8 },
    { what: 'Office: Lantern today', value: score(OFFICE, O.lantern), shown: 5.7 },
    { what: 'Office: CremaClass', value: score(OFFICE, O.crema), shown: 7.7 },
    { what: 'Office: Calder', value: score(OFFICE, O.calder), shown: 6.7 },
    { what: 'Office: change A score', value: score(OFFICE, [9, 7, 4]), shown: 6.1 },
    { what: 'Office: change A price term', value: 0.2 * 7, shown: 1.4 },
    { what: 'Office: price rise needed', value: (score(OFFICE, O.crema) - score(OFFICE, O.lantern)) / OFFICE[1], shown: 10 },
    { what: 'Office: price score needed', value: O.lantern[1] + (score(OFFICE, O.crema) - score(OFFICE, O.lantern)) / OFFICE[1], shown: 15 },
    { what: 'Office: change B score', value: score(OFFICE, [9, 5, 9]), shown: 8.2 },
    { what: 'Office: change B timing term', value: 0.5 * 9, shown: 4.5 },
    { what: 'Office: timing rise needed', value: (score(OFFICE, O.crema) - score(OFFICE, O.lantern)) / OFFICE[2], shown: 4 },
    { what: 'Office: timing score to draw level', value: O.lantern[2] + (score(OFFICE, O.crema) - score(OFFICE, O.lantern)) / OFFICE[2], shown: 8 },
    { what: 'Office: gap to CremaClass', value: score(OFFICE, O.crema) - score(OFFICE, O.lantern), shown: 2.0 },
    { what: 'Workshop places this year', value: W.held * W.avgParticipants, shown: 168 },
    { what: 'Price cut per place', value: W.pricePerPerson - 99, shown: 26 },
    { what: 'Revenue given up by change A', value: W.held * W.avgParticipants * (W.pricePerPerson - 99), shown: 4368 },
    { what: 'Workshop revenue (case.js)', value: DERIVED.workshopRevenue, shown: 21000 },
    { what: 'Share of workshop revenue given up (%)', value: W.held * W.avgParticipants * (W.pricePerPerson - 99) / DERIVED.workshopRevenue * 100, shown: 20.8, tol: 0.05 },
    { what: 'Court et al.: car shoppers initial set', value: 3.8, shown: 3.8 },
    { what: 'Court et al.: brands added', value: 2.2, shown: 2.2 },
    { what: 'Holloway: abandonment before (%)', value: 1400 / 2000 * 100, shown: 70 },
    { what: 'Holloway: orders before', value: 2000 - 1400, shown: 600 },
    { what: 'Holloway: share converted after', value: 1 - 0.64, shown: 0.36 },
    { what: 'Holloway: orders after', value: 2000 * (1 - 0.64), shown: 720 },
    { what: 'Holloway: extra orders', value: 2000 * (1 - 0.64) - (2000 - 1400), shown: 120 },
    { what: 'Holloway: extra sales a month', value: (2000 * (1 - 0.64) - (2000 - 1400)) * 1500, shown: 180000 },
  ],
};
