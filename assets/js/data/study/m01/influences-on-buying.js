// influences-on-buying.js — M01 · What influences buying. Content only; exercises are in influences-on-buying.ex.js.
// Lantern's online-shop prices come from the B02 dataset and the delivery terms (free over $35, otherwise $4.95) from
// b01/case.js. Every other business, person and number is fictional unless a source is cited. `checks` recompute every
// printed number.
import { BUSINESS } from './case.js';
import { DELIVERY as SHIP } from '../b01/case.js';

const PRICE = { houseBlend: 14, huila: 17, giftBox: 58 };   // 250 g bags and the Gift Box Trio (B02 dataset)
const FREE_OVER = SHIP.freeOver;                           // free delivery on orders over this amount (b01/case.js)
const DELIVERY = SHIP.charge;                              // delivery charge on smaller orders (b01/case.js)
const MASLOW = [85, 70, 50, 40, 10];                       // Maslow's illustrative percentages, in his order (1943)
const total = (N, r, n) => N * (1 - r ** (n + 1)) / (1 - r);  // customers after n rounds of referrals
const longRun = (N, r) => N / (1 - r);

const LAYERS = '<svg viewBox="0 0 640 330" xmlns="http://www.w3.org/2000/svg" font-family="inherit" font-size="13">'
  + '<rect x="8" y="8" width="624" height="314" rx="14" style="fill:none;stroke:var(--rule-strong);stroke-width:2"/>'
  + '<rect x="44" y="48" width="552" height="238" rx="12" style="fill:none;stroke:var(--series-1);stroke-width:2"/>'
  + '<rect x="80" y="88" width="480" height="162" rx="10" style="fill:none;stroke:var(--series-2);stroke-width:2"/>'
  + '<rect x="116" y="128" width="408" height="86" rx="8" style="fill:none;stroke:var(--series-3);stroke-width:2"/>'
  + [['Cultural', 'culture, subculture, social class', 22, 618, 32], ['Social', 'reference groups, family, roles, status', 58, 582, 72],
    ['Personal', 'life stage, occupation, income, lifestyle', 94, 546, 112], ['Psychological', 'motivation, perception, learning, attitudes', 130, 510, 152]]
    .map(([name, what, x1, x2, y]) => `<text x="${x1}" y="${y}" font-weight="700" fill="currentColor">${name}</text><text x="${x2}" y="${y}" text-anchor="end" font-size="12" fill="currentColor">${what}</text>`).join('')
  + '<rect x="250" y="166" width="140" height="36" rx="18" style="fill:none;stroke:currentColor;stroke-width:1.5"/>'
  + '<text x="320" y="189" text-anchor="middle" font-weight="700" fill="currentColor">The buyer</text>'
  + '<text x="320" y="272" text-anchor="middle" font-size="12" fill="currentColor">broad, shared, slow to change (outside) → individual, quicker to change (inside)</text>'
  + '<text x="320" y="308" text-anchor="middle" font-size="12" fill="currentColor">Situational factors act at the moment of purchase: time, mood, setting, company</text>'
  + '</svg>';

export default {
  slug: 'influences-on-buying',
  title: 'What influences buying',
  blurb: 'Why do two people with the same need buy different things? Learn the cultural, social, personal and psychological influences on a purchase; what motivation, perception, learning and attitudes mean; why word of mouth carries so much weight; and how anchoring, defaults and loss aversion shape choices, with the evidence and the ethics of using them.',
  status: 'draft',
  objectives: [
    'Classify influences on a purchase as cultural, social, personal or psychological.',
    'Explain motivation, perception, learning and attitudes, and evaluate Maslow’s hierarchy of needs against the evidence.',
    'Explain how reference groups, opinion leaders and word of mouth affect choices, and calculate a simple referral multiplier.',
    'Define anchoring, the default effect and loss aversion accurately and recognise them in prices and online-shop design.',
    'Evaluate whether a use of behavioural insight serves customers or exploits them.',
  ],
  prerequisites: [
    { lesson: 'm01/consumer-decisions', why: 'This lesson explains what shapes each stage of the buying decision process, and the weights and scores of the weighted-attribute model.' },
    { lesson: 'f00/finance-time-and-risk', why: 'Loss aversion is easily confused with risk aversion, which F00 defines.' },
  ],
  case: 'lantern',

  concept: [
    { case: `Three of Lantern’s online customers share the same need, good coffee at home, and buy in three different ways. One has subscribed since the summer and receives a 250 g bag of House Blend every month without looking at anything else. One read about the $${PRICE.giftBox} Gift Box Trio in a colleague’s message and bought two as end-of-year presents. A third put a bag of Colombia Huila ($${PRICE.huila}) and a bag of House Blend ($${PRICE.houseBlend}) in her basket, saw a delivery charge at the checkout and left. Lantern delivers free on orders over $${FREE_OVER} and charges $${DELIVERY.toFixed(2)} on smaller ones (B01). The three customers are fictional.` },
    { p: 'The previous lesson described how a decision unfolds. This one asks what shapes it: why people with the same need want different things, notice different things and react differently to the same price. Marketing textbooks group the influences in four layers, from the broad and slow to change to the personal and quick to change: cultural, social, personal and psychological. OpenStax adds <i>situational</i> factors that act at the moment of purchase, such as time pressure, mood, the layout of the shop and who the buyer is with. The delivery charge that lost the third customer was one of those.' },
    { figure: {
      svg: LAYERS,
      caption: 'Four layers of influence on a buyer, as most introductory textbooks group them. The layers are a way of sorting influences, not a causal model: in any one purchase they act together.',
      alt: 'Four nested rounded rectangles with the buyer at the centre. The outer layer is labelled Cultural: culture, subculture, social class. Inside it is Social: reference groups, family, roles, status. Inside that is Personal: life stage, occupation, income, lifestyle. The innermost is Psychological: motivation, perception, learning, attitudes, around a small box labelled The buyer. A note says influences run from broad, shared and slow to change on the outside to individual and quicker to change on the inside. A second note says situational factors act at the moment of purchase: time, mood, setting and company.',
    } },

    { h: 'Cultural influences' },
    { p: '<g>Culture</g> is the set of values, ideas and attitudes that members of a group learn and share. It shapes which needs feel pressing and which ways of meeting them seem normal: whether coffee means an espresso drunk standing at a bar or a mug of filter coffee at a desk, whether a gift is opened in front of the giver, which holidays call for presents. Culture is learned, so it changes, but slowly, and marketers usually adapt to it rather than try to change it.' },
    { p: 'Within a culture, a <g>subculture</g> is a group whose members share values or experiences of their own: an ethnic or religious group, a region, or a community of enthusiasts such as cyclists or home baristas. <g>Social class</g> describes relatively lasting divisions of a society by income, occupation and education. Class shapes priorities as well as budgets: OpenStax notes that a buyer with little to spare may put price first while a better-off buyer weighs quality first, and that people are also influenced by a class they hope to join.' },

    { h: 'Social influences' },
    { p: 'A <g>reference group</g> is a group a person compares themselves with. It may be a group they belong to (friends, colleagues, a running club), one they would like to belong to, or one they want to avoid resembling. Its influence is greatest for things other people can see: clothes, cars, the coffee on a desk at work, a gift. Within groups, an <g>opinion leader</g> is someone others turn to for advice because of their knowledge or standing, not necessarily their wealth. The friend whose latte art prompted Nadia, in the previous lesson, was acting as one.' },
    { p: 'Family is usually the most influential reference group of all. The family a person grows up in shapes early habits and brand loyalties; the household they form later shapes everyday buying. Within a household, different members often play different parts in one purchase: one suggests it, another has opinions, one decides, one pays, others use it. The last lesson of this module finds the same roles inside organisations. People’s roles and status (manager, parent, student) also shape what they buy, because each role carries expectations about what is appropriate.' },

    { h: 'Personal influences' },
    { p: 'Personal influences belong to the individual. Needs change with <i>age and life stage</i>: a student, a new parent and a retired couple buy differently, although OpenStax warns that age on its own is often a weak predictor of behaviour. <i>Occupation</i> and <i>economic situation</i> set what people need and what they can afford. A <g>lifestyle</g> is a person’s pattern of living, expressed in their activities, interests and opinions; two people of the same age and income can live very different lives. <i>Personality and self-concept</i> matter because people tend to buy brands that fit how they see themselves.' },

    { h: 'Psychological influences' },
    { p: 'Four processes inside the buyer complete the picture. <b>Motivation</b> explains why a person acts at all. <b>Perception</b> decides what they notice and how they interpret it. <b>Learning</b> describes how experience changes what they do next time. <b>Beliefs and attitudes</b> are what they think and feel about the options. The theory section takes each in turn and then looks at the mental shortcuts that make buying quick and sometimes predictably biased.' },
    { callout: 'key', title: 'Influences set the weights and the scores', html: 'The weighted-attribute model of the previous lesson needs weights and scores. Culture, reference groups and life stage shape what matters to a buyer: the weights. Perception, learning and beliefs shape how each option is judged: the scores. Marketing that changes either one can change the choice.' },
  ],

  theory: [
    { h: 'Motivation and Maslow’s hierarchy' },
    { p: 'A <g>motive</g> is a need that has become pressing enough to make a person act. The best-known theory of motives is the psychologist Abraham Maslow’s (1943). He proposed five sets of basic needs: physiological (food, water, sleep), safety, love or belonging, esteem, and self-actualisation (becoming what one is capable of becoming). He arranged them in a hierarchy: when the lower needs are fairly well satisfied, the higher ones emerge and come to dominate behaviour. Textbooks usually draw <g>Maslow’s hierarchy of needs</g> as a pyramid.' },
    { p: 'Maslow himself was more cautious than most diagrams. In the same paper he wrote that the hierarchy is not as rigid as he might have implied, that people are usually partly satisfied in all their basic needs at once, and he offered figures for an average person (85% of physiological needs satisfied, 70% of safety needs, 50% of love needs, 40% of esteem needs and 10% of self-actualisation needs) that he explicitly called arbitrary and illustrative.' },
    { p: 'The evidence has not been kind to the strict version. Wahba and Bridwell (1976), reviewing the research then available, found little consistent support for Maslow’s ranking of needs. Tay and Diener (2011) used Gallup World Poll data from 123 countries and found that the needs Maslow described do appear to be universal and linked to well-being, but that the order in which they were met had little bearing on how much each contributed; people reported good social relationships and a sense of self-actualisation even when their basic needs were not fully met.' },
    { p: 'For a marketer the theory is still useful as a checklist of the kinds of benefit an offer can provide. The same product can serve different needs: a coffee can be a way to stay awake (physiological), a reason to sit with friends (belonging), or, as a $58 gift box, a way to be seen as thoughtful (esteem). What the theory can’t do is predict that people will buy for higher needs only once lower ones are met. People on tight budgets still buy gifts and small treats, and a marketer who assumed otherwise would misread them.' },
    { callout: 'warn', title: 'A heuristic, not a law', html: 'Use Maslow’s list to ask which needs an offer meets and how to talk about them. Don’t treat the order as a tested rule of human behaviour: Maslow didn’t claim it was rigid, and later research found little support for a fixed sequence.' },

    { h: 'Perception' },
    { p: '<g>Perception</g> is the process by which a person selects, organises and interprets information to form a meaningful picture of the world. Two people can face the same shelf or web page and perceive different things, because of three processes. <g>Selective attention</g>: people notice only a small share of what is around them, mostly what relates to a current need. <i>Selective distortion</i>: they interpret information to fit what they already believe, so a fan of a brand reads an ambiguous review kindly. <i>Selective retention</i>: they remember what supports their attitudes and forget what doesn’t.' },
    { p: 'The lesson for marketers is that a message sent is not a message received. An offer has to be noticed by someone with the need, at a moment when it is relevant, and read the way it was meant. Price and packaging are read as cues too: a buyer who can’t taste the coffee before buying uses the price, the bag and the brand to judge it.' },

    { h: 'Learning' },
    { p: 'Learning is a change in behaviour that comes from experience. A buyer has a drive (a need), meets a cue (an advert, a reminder, a smell), responds (buys), and the result either reinforces the response or discourages it. Repeated satisfying purchases turn into habits, which is how habitual buying, from the previous lesson, comes about. A disappointing first purchase teaches the opposite, and the lesson lasts.' },
    { p: 'Buyers also generalise, transferring a good experience with one product to others under the same brand, and discriminate, learning to tell similar products apart. Lantern’s subscription works partly because each satisfying delivery strengthens the habit of not looking elsewhere.' },

    { h: 'Beliefs and attitudes' },
    { p: 'A belief is a descriptive thought about something: “Lantern roasts in small batches.” An <g>attitude</g> is a lasting evaluation of an object or idea, with the feelings and tendency to act that go with it: “I like Lantern and I’d buy from it again.” Attitudes are hard to change, so a business usually does better to fit its offer to existing attitudes than to fight them.' },
    { p: 'When an attitude must change, the weighted-attribute model shows three routes. Change a <i>belief</i> about your own offer (raise a score, for example by letting people taste the coffee). Change the <i>importance</i> buyers attach to an attribute (raise the weight of freshness by explaining why roast dates matter). Or add an <i>attribute</i> buyers hadn’t considered (traceable farms). A fourth route, changing beliefs about competitors, is risky and must rest on claims that are true and fair.' },

    { h: 'Word of mouth and reference groups at work' },
    { p: '<g>Word of mouth</g> is communication about products between customers rather than from the seller: a recommendation over lunch, a review, a post. It carries weight for the reasons the previous lesson gave for personal and public sources: it doesn’t come from the seller, it can answer the buyer’s own questions, and it often comes from someone the buyer knows. Information about what many other people have chosen (“1,200 people bought this box this month”) works in a similar way and is often called social proof: buyers take others’ choices as a sign of a good one, which is why the number must be true. Social-media influencers are opinion leaders whom brands can pay, which is exactly why an undisclosed paid endorsement misleads the people who trust it.' },
    { p: String.raw`Word of mouth also multiplies. If every new customer brings in, on average, <m>r</m> further customers, then <m>N</m> customers won directly bring <m>Nr</m> more, who bring <m>Nr^2</m>, and so on. As long as <m>r</m> is below 1, the total approaches <m>N \div (1 - r)</m>: with <m>r = 0.25</m>, every 3 customers won directly become about 4. This <g>referral multiplier</g> rests on strong assumptions, set out on the formula card. The most important is incrementality: some referred customers would have come anyway, and only the rest are extra.` },

    { h: 'Shortcuts and biases' },
    { p: 'Buyers face more choices than they can analyse, so they use mental shortcuts, or heuristics. In 1974 the psychologists Amos Tversky and Daniel Kahneman showed that such shortcuts are usually useful but lead to systematic errors, or biases. Three matter especially in buying.' },
    { p: String.raw`<b>Anchoring.</b> <g>Anchoring</g> is the tendency for an estimate of an uncertain value to be pulled towards a number seen first, even an irrelevant one. In Tversky and Kahneman’s best-known demonstration, people watched a wheel of fortune stop at a number and were then asked what percentage of African countries were members of the United Nations. Those who saw 10 gave a median estimate of 25%; those who saw 65 gave 45%.` },
    { p: String.raw`In buying, the anchor might be a list price, a “was” price, the most expensive item shown first or the opening offer in a negotiation. A $58 gift box placed beside single bags may make $${PRICE.huila} for a bag feel modest. A false “was” price used as an anchor is not clever marketing but deception; M02 covers the rules on reference prices.` },
    { p: '<b>Defaults.</b> The <g>default effect</g> is the tendency to stay with whichever option is pre-selected. Johnson and Goldstein (2004) studied consent to organ donation. In an online experiment with 161 respondents, the share agreeing to donate was about twice as high when the default was to be a donor (people had to opt out) as when it was not (people had to opt in). They gave three explanations: changing a default takes effort; people read a default as a recommendation; and the default becomes the reference point, so leaving it feels like a loss. In shops, defaults include pre-selected delivery speeds, subscription boxes, insurance add-ons and data-sharing settings.' },
    { p: '<b>Loss aversion.</b> Kahneman and Tversky’s prospect theory (1979) holds that people judge outcomes as gains or losses from a reference point, and that a loss weighs more than a gain of the same size. That is <g>loss aversion</g>. It is not the same as <g>risk aversion</g>, defined in F00 as preferring a certain amount to a gamble with the same expected value; loss aversion is about the asymmetry between losing and gaining. Prospect theory also found that people facing a sure loss often prefer a gamble that might avoid it, the reverse of the risk aversion they show for gains, but that comes from the shape of the value function, not from loss aversion itself. In buying, loss aversion explains why a surcharge feels worse than a discount of the same size that is not received, why the end of a free trial stings, and why “don’t lose your free delivery” can move a buyer more than “earn free delivery”.' },
    { callout: 'warn', title: 'Effects vary: test before relying on them', html: 'These are tendencies found in studies, and how strong they are depends on the people, the product and the setting. Before building a page or a price around one, test it: an <g>A/B test</g> (B01) shows half of the visitors each version and compares what they do.' },

    { h: 'Nudges and dark patterns' },
    { p: 'Richard Thaler and Cass Sunstein (2008), who popularised the term, define a <g>nudge</g> as any aspect of how a choice is presented that changes behaviour predictably without forbidding options or significantly changing incentives. By that definition every choice page nudges somehow; the question is in which direction. A nudge that makes a good choice easier (a clear reminder, a sensible default the buyer can change in one click) helps both sides.' },
    { p: 'A <g>dark pattern</g> steers people into choices they would not make if they understood them: a pre-ticked add-on, a countdown timer that resets, “only 2 left” when there are 200, a subscription that takes one click to start and five screens to cancel. Dark patterns can lift this month’s numbers, but they work against customer value and destroy trust when buyers notice. Four questions separate a helpful nudge from a dark pattern: is it true; is the choice it encourages in the customer’s interest; is it easy to reverse; and would the customer be comfortable if they saw exactly how it worked?' },
  ],

  formulas: [
    { id: 'referral-multiplier', name: 'Customers including referrals (referral multiplier)',
      tex: String.raw`T_n = N \, \dfrac{1 - r^{\,n+1}}{1 - r} \qquad T_{\infty} = \dfrac{N}{1 - r}`,
      where: [
        [String.raw`T_n`, 'Total customers after n rounds of referrals, including the N won directly', 'customers'],
        [String.raw`T_{\infty}`, 'Long-run total if referrals carried on for ever', 'customers'],
        [String.raw`N`, 'Customers won directly (by advertising, say) at the start', 'customers'],
        [String.raw`r`, 'Average number of new customers each new customer refers, from 0 up to but not including 1', 'customers per customer'],
        [String.raw`n`, 'Number of rounds of referrals counted', 'rounds'],
      ],
      assumptions: 'Each customer refers r others once, soon after joining; r stays the same in every round; the market never runs out of people to refer; and every referred customer is extra. In practice r falls as a market fills up, and some referred customers would have joined anyway.',
      note: 'The long-run multiplier is 1 ÷ (1 − r): 1.33 when r = 0.25 and 2 when r = 0.5. To value a referral programme, count only the incremental referred customers: (T − N) × (share who would not have joined anyway).' },
  ],

  examples: [
    { level: 'simple', title: 'Why did Lucia buy the gift box?', fictional: true,
      setup: `Lucia Marsh buys two of Lantern’s $${PRICE.giftBox} Gift Box Trios in December, one for her manager and one for her father. In a short interview she says: (a) “Giving my team leader something at the end of the year is just what you do where I work.” (b) “A colleague who knows coffee recommended it.” (c) “I was promoted in October, so I could spend a bit more this year.” (d) “I’d seen the box twice on Instagram and it stuck in my mind.” (e) “I want people to think I chose something special.” (f) “My family always exchanges presents at New Year.” Classify each reason as a cultural, social, personal or psychological influence.`,
      steps: [
        '(a) is a norm of her workplace, a group she belongs to and compares herself with: a social influence (reference group, and her role at work).',
        '(b) is advice from someone others turn to on coffee: a social influence (an opinion leader, by word of mouth).',
        '(c) is about her occupation and economic situation: a personal influence.',
        '(d) is about what she noticed and remembered: a psychological influence (selective attention and retention, the basis of learning).',
        '(e) is about her own esteem motive: a psychological influence (motivation).',
        '(f) is a shared custom of the society and family tradition she grew up in: a cultural influence. Family traditions sit between cultural and social influences; this one comes from the wider culture’s calendar of gift-giving.',
      ],
      answer: 'Cultural: (f). Social: (a) and (b). Personal: (c). Psychological: (d) and (e).',
      interpretation: 'One purchase, six influences across all four layers. Several were within Lantern’s reach: it can be visible where people look for gifts, make recommending easy, and present the box as a thoughtful choice. Others, such as Lucia’s promotion and her family’s custom, it can only recognise and plan around, for example by promoting gifts before the holidays its customers celebrate.' },

    { level: 'challenging', title: 'Is a referral reward worth paying?', fictional: true,
      setup: 'Bramley Bakes, a fictional baking-kit subscription, wins 400 new subscribers in March through advertising. Its data suggest each new subscriber refers 0.25 new subscribers on average, within a month of joining. It is considering a $10 credit for every subscriber who refers someone who joins. Its survey of referred subscribers suggests 40% of them would have joined anyway. (a) How many subscribers will the March cohort bring in after three rounds of referrals, and in the long run? (b) What does the referral credit cost per incremental subscriber in the long run? Advertising currently costs about $40 per new subscriber.',
      steps: [
        String.raw`Round by round: 400 direct, then <m>400 \times 0.25 = 100</m>, then <m>100 \times 0.25 = 25</m>, then <m>25 \times 0.25 = 6.25</m>. After three rounds: <m>400 + 100 + 25 + 6.25 = 531.25</m>, about 531 subscribers. The formula agrees: <m>400 \times (1 - 0.25^4) \div (1 - 0.25) = 531.25</m>.`,
        String.raw`Long run: <m>T_{\infty} = 400 \div (1 - 0.25) = 533.3</m>. Most of the multiplier arrives in the first two rounds because each round is a quarter of the one before.`,
        String.raw`Referred subscribers in the long run: <m>533.3 - 400 = 133.3</m>. If 40% would have joined anyway, the incremental ones are <m>133.3 \times 0.6 = 80</m>.`,
        String.raw`The credit is paid on every referral, incremental or not: <m>133.3 \times \$10 = \$1{,}333</m>. Per incremental subscriber: <m>1{,}333 \div 80 \approx \$16.67</m>.`,
        'Compare: $16.67 per extra subscriber against about $40 through advertising. The credit looks good value, provided the 0.25 rate holds once a reward is offered (it may rise, which helps) and the survey’s 40% is about right (people may overstate that they would have joined anyway, or understate it).',
      ],
      answer: 'About 531 subscribers after three rounds and about 533 in the long run, of which about 133 are referred and about 80 incremental. The credit costs about $1,333, or about $16.67 per incremental subscriber, well below the $40 advertising cost.',
      interpretation: 'The multiplier is real but modest at r = 0.25, and counting every referred subscriber as extra would overstate the programme’s value by two-thirds (133 against 80). The cost per incremental customer is the number to compare with other ways of winning customers. The customer-value lesson shows how to ask whether either cost is worth paying, by comparing it with what a subscriber is worth.' },

    { level: 'applied', title: 'Three proposals for Lantern’s online shop', fictional: true,
      setup: `Ana’s web agency proposes three changes before Christmas. (1) Show the $${PRICE.giftBox} Gift Box Trio first on the gifts page, above the single bags at $${PRICE.houseBlend} to $19.50. (2) Pre-tick “Subscribe monthly” on every bean product page, so that buyers must untick it to buy once. (3) Show a message in the basket when an order is $${FREE_OVER} or less: “Spend over $${FREE_OVER} and delivery is free.” Use this lesson to judge each one; orders of $${FREE_OVER} or less pay the $${DELIVERY.toFixed(2)} delivery charge.`,
      steps: [
        'Proposal 1 uses anchoring. Seeing the gift box first sets a high anchor, so the single bags may seem modest and some buyers may trade up. It is legitimate because every price is real and the buyer sees everything; it would become deception only if a false “was” price were invented as the anchor. Verdict: acceptable, and worth an A/B test.',
        'Proposal 2 uses the default effect. Many buyers would keep the tick through inertia or because they read it as a recommendation, and would be charged again next month for coffee they never chose to subscribe to. It fails the four questions: the choice it pushes is not clearly in the buyer’s interest, and the buyer wouldn’t be comfortable seeing how it worked. Verdict: reject. Offer the subscription as a clear, unticked option that states its saving.',
        String.raw`Proposal 3 works on the delivery charge, which buyers feel as a loss on top of the price, and gives them a goal to reach; the message itself is framed as a gain. Take the third customer’s basket: <m>${PRICE.huila} + ${PRICE.houseBlend} = 31</m> dollars, or <m>31 + ${DELIVERY.toFixed(2)} = 35.95</m> with delivery. Adding another bag of House Blend makes <m>31 + ${PRICE.houseBlend} = 45</m>, delivered free: she pays <m>45 - 35.95 = 9.05</m> dollars more and gets a $${PRICE.houseBlend} bag of beans.`,
        'Judge proposal 3. The message is true and the trade is good value for a customer who will drink the extra coffee, so it serves her. It would turn manipulative if it hid the delivery charge until the last step (which is what lost her) or nagged repeatedly. Verdict: accept, and show the delivery charge and the threshold early, on the product page as well as in the basket.',
      ],
      answer: 'Accept proposal 1 (with real prices only) and proposal 3 (with the delivery charge shown early); reject proposal 2, a pre-ticked subscription, as a dark pattern. For the $31 basket, adding a $14 bag costs the customer $9.05 more than paying for delivery.',
      interpretation: 'All three proposals use behavioural insight; what separates them is whether the customer would endorse the choice if she saw how it was framed. Ana should A/B test proposals 1 and 3 against the current pages and measure repeat purchases and complaints as well as this month’s orders, because a tactic that loses trust shows its cost later.' },
  ],

  demo: [
    { widget: 'ib-referral', intro: 'The referral multiplier, with incrementality and a reward. Start with Bramley Bakes’ figures, then raise the referral rate to see the multiplier grow towards 1 ÷ (1 − r); notice how much of the total arrives in the first two rounds. Then raise the share of referred customers who would have joined anyway and watch the cost per incremental customer climb.' },
  ],

  mistakes: [
    { title: '“Maslow proved that people satisfy lower needs before higher ones.”', html: 'Maslow said his hierarchy was not rigid, and reviews of the evidence (Wahba and Bridwell, 1976) found little consistent support for a fixed order. Tay and Diener (2011) found the needs broadly universal but the order of fulfilment of little consequence. Use the list of needs; don’t rely on the sequence.' },
    { title: '“Loss aversion is just another name for risk aversion.”', html: 'Risk aversion is preferring a certain amount to a gamble with the same expected value. Loss aversion is weighting a loss more than an equal gain, measured from a reference point. Risk aversion is about certainty versus a gamble, and prospect theory found it often reverses when people face a sure loss. They describe different things, so name the right one.' },
    { title: '“An anchor works only if it is relevant.”', html: 'In Tversky and Kahneman’s demonstration the anchor came from a wheel of fortune, and it still moved people’s estimates. That is why the first price a buyer sees matters, and why invented “was” prices are deceptive.' },
    { title: '“A default is neutral because the customer can change it.”', html: 'Defaults change outcomes because changing them takes effort, because people read them as recommendations and because the default becomes the reference point. Choosing a default is choosing for most of your customers, so choose one they would endorse.' },
    { title: '“Every referred customer is a customer we wouldn’t otherwise have had.”', html: 'Some would have come anyway. Value word of mouth and referral rewards on incremental customers only, as in the Bramley Bakes example, where counting everyone overstated the gain by two-thirds.' },
    { title: '“Demographics explain behaviour.”', html: 'Age, income and occupation are easy to measure, but OpenStax warns that age alone is often a weak predictor. Lifestyle, reference groups, attitudes and the situation can matter more, and the same person buys differently in different roles.' },
  ],

  application: [
    { case: 'Brightmere Energy, a fictional electricity retailer, offers two tariffs: a standard tariff and a renewable tariff backed by renewable-energy certificates, which costs $3 more a month. Its pricing manager, Teodor Vance, must decide which tariff new customers get unless they choose otherwise. About 8,000 new customers join each quarter.' },
    { p: 'Teodor knows from Johnson and Goldstein’s work that the default is likely to decide what most new customers end up on, so there is no neutral choice: an opt-in sign-up page is a default too. He runs a quarter-long A/B test. Half of the new customers see the standard tariff pre-selected and can opt in to the renewable one; the other half see the renewable tariff pre-selected, with its price stated beside it, and can switch with one click, during sign-up or at any time afterwards.' },
    { p: 'In the opt-in group, 12% choose the renewable tariff: about 4,000 × 0.12 = 480 customers. In the default group, 74% keep it: about 4,000 × 0.74 = 2,960 customers, six times as many. That is a far larger effect than any advertising campaign Brightmere has run. Teodor also tracks the measures that would reveal a dark pattern: in the default group, 1.5% of customers complain that they didn’t realise they were on the renewable tariff, and switching back in the first three months is no higher than usual switching between tariffs.' },
    { p: 'He takes the four questions to the management meeting.' },
    { list: [
      '<b>Is it true?</b> The price and what the certificates do are stated beside the default.',
      '<b>Is it in customers’ interest?</b> Most of Brightmere’s customers say in its surveys that they want renewable power, although the extra $3 a month matters to some of them.',
      '<b>Is it easy to reverse?</b> One click, at any time.',
      '<b>Would customers be comfortable seeing how it works?</b> Mostly, but not all of them, as the next paragraph shows.',
    ] },
    { p: 'The 1.5% who complain suggest the presentation can improve, so he proposes adding a line to the first bill reminding customers which tariff they are on and how to switch. Brightmere adopts the renewable default with those safeguards and keeps measuring complaints and switching.' },
    { p: 'The same reasoning applies wherever a business designs a choice: insurance add-ons at a checkout, the delivery option selected by default, the payment plan a gym puts first, the order in which a menu lists dishes. Influences on buying are not only something marketers observe; through prices, pages and defaults, marketers create some of them, and so carry responsibility for how they are used.' },
  ],

  summary: [
    'Influences on buying fall into four layers, cultural, social, personal and psychological, plus situational factors at the moment of purchase. They act together, and together they shape the weights and scores buyers use.',
    'Reference groups, opinion leaders and family shape what people buy, most of all for things others can see. Word of mouth is trusted because it doesn’t come from the seller.',
    'Maslow’s five needs are a useful checklist of benefits, but Maslow himself said the order isn’t rigid and the evidence gives little support to a fixed sequence.',
    'Perception is selective, learning turns satisfying purchases into habits, and attitudes are hard to change; the weighted-attribute model shows the routes: change beliefs, change importance or add an attribute.',
    'The referral multiplier is N ÷ (1 − r) in the long run, but only incremental referred customers add value.',
    'Anchoring pulls judgements towards a first number; defaults stick through effort, implied endorsement and loss aversion; loss aversion makes losses weigh more than equal gains and is different from risk aversion.',
    'Behavioural insight can help customers (a helpful nudge) or exploit them (a dark pattern). Ask whether it is true, in the customer’s interest, easy to reverse and something the customer would accept if they saw how it worked.',
  ],

  glossary: [
    { term: 'Culture', def: 'The values, ideas and attitudes that members of a group learn and share, which shape what they need, want and regard as normal.' },
    { term: 'Subculture', def: 'A group within a culture whose members share values or experiences of their own, such as an ethnic or religious group, a region or a community of enthusiasts.' },
    { term: 'Social class', def: 'A relatively lasting division of a society whose members have similar income, occupation and education, and often similar values.' },
    { term: 'Reference group', def: 'A group a person compares themselves with, belongs to, would like to belong to or wants to avoid resembling, whose standards influence what they buy.' },
    { term: 'Opinion leader', def: 'A person whose views others in a group seek out and follow because of their knowledge, experience or standing, not necessarily their wealth or education.' },
    { term: 'Word of mouth', def: 'Communication about products and brands between customers, in person or online (recommendations, reviews, posts), rather than from the seller.' },
    { term: 'Lifestyle', def: 'A person’s pattern of living, expressed in their activities, interests and opinions.' },
    { term: 'Motive', def: 'A need that has become pressing enough to make a person act to satisfy it.' },
    { term: 'Maslow’s hierarchy of needs', def: 'Abraham Maslow’s (1943) theory that people have five sets of basic needs (physiological, safety, belonging, esteem and self-actualisation) and that higher needs come to dominate as lower ones are largely satisfied. Research gives little support to a strict order.' },
    { term: 'Perception', def: 'The process by which a person selects, organises and interprets information to form a meaningful picture of the world.' },
    { term: 'Selective attention', def: 'The tendency to notice only a small share of the messages and stimuli around us, mostly those related to a current need or interest.' },
    { term: 'Attitude', def: 'A person’s lasting evaluation of an object or idea, such as a brand, with the feelings and tendency to act that go with it.' },
    { term: 'Anchoring', def: 'The tendency for an estimate of an uncertain value, such as what a price should be, to be pulled towards a number seen first, even an irrelevant one (Tversky and Kahneman, 1974).' },
    { term: 'Default effect', def: 'The tendency for people to stay with whichever option is pre-selected for them, so that the choice of default changes what most people end up with.' },
    { term: 'Loss aversion', def: 'The tendency for a loss to weigh more than a gain of the same size, both measured from a reference point (Kahneman and Tversky, 1979). It is different from risk aversion.' },
    { term: 'Referral multiplier', def: 'The factor by which referrals multiply the customers won directly: 1 ÷ (1 − r) in the long run when each new customer refers r new customers on average (r below 1).' },
    { term: 'Nudge', def: 'Any aspect of how a choice is presented that changes behaviour predictably without forbidding options or significantly changing incentives (Thaler and Sunstein, 2008). A nudge can help or harm the person nudged.' },
    { term: 'Dark pattern', def: 'A design that steers people into choices they would not make if they understood them, such as a pre-ticked add-on or a cancellation made deliberately hard.' },
  ],

  references: [
    { text: 'Gomez Albrecht, M., Green, M. &amp; Hoffman, L. (2023). <i>Principles of Marketing</i>, section 3.2, “Factors That Influence Consumer Buying Behavior”. OpenStax.', url: 'https://openstax.org/books/principles-marketing/pages/3-2-factors-that-influence-consumer-buying-behavior', checked: '2026-10-23' },
    { text: 'Maslow, A. H. (1943). A theory of human motivation. <i>Psychological Review</i>, 50, 370–396. Full text in York University’s Classics in the History of Psychology.', url: 'https://psychclassics.yorku.ca/Maslow/motivation.htm', checked: '2026-10-23' },
    { text: 'Wahba, M. A. &amp; Bridwell, L. G. (1976). Maslow reconsidered: a review of research on the need hierarchy theory. <i>Organizational Behavior and Human Performance</i>, 15(2), 212–240. The citation was confirmed from Crossref; the article is not free to read, and its conclusion is reported here as quoted in secondary accounts.', url: 'https://doi.org/10.1016/0030-5073(76)90038-6', checked: '2026-10-23' },
    { text: 'Tay, L. &amp; Diener, E. (2011). Needs and subjective well-being around the world. <i>Journal of Personality and Social Psychology</i>, 101(2), 354–365. Findings as reported by the University of Illinois News Bureau, “Researchers look for ingredients of happiness around the world”.', url: 'https://news.illinois.edu/researchers-look-for-ingredients-of-happiness-around-the-world/', checked: '2026-10-23' },
    { text: 'Tversky, A. &amp; Kahneman, D. (1974). Judgment under uncertainty: heuristics and biases. <i>Science</i>, 185(4157), 1124–1131.', url: 'https://doi.org/10.1126/science.185.4157.1124', checked: '2026-10-23' },
    { text: 'Kahneman, D. &amp; Tversky, A. (1979). Prospect theory: an analysis of decision under risk. <i>Econometrica</i>, 47(2), 263–292. Abstract consulted on the Econometric Society’s page.', url: 'https://www.econometricsociety.org/publications/econometrica/1979/03/01/prospect-theory-analysis-decision-under-risk', checked: '2026-10-23' },
    { text: 'Thaler, R. H. &amp; Sunstein, C. R. (2008). <i>Nudge: Improving Decisions about Health, Wealth, and Happiness</i>. New Haven, CT: Yale University Press. The definition of a nudge (p. 6) was confirmed from the Behavioral Economics Guide’s encyclopedia entry; the book itself was not consulted.', url: 'https://www.behavioraleconomics.com/resources/mini-encyclopedia-of-be/nudge/', checked: '2026-10-23' },
    { text: 'Johnson, E. J. &amp; Goldstein, D. G. (2004). Defaults and donation decisions. <i>Transplantation</i>, 78(12), 1713–1716.', url: 'https://doi.org/10.1097/01.tp.0000149788.10382.b2', checked: '2026-10-23' },
  ],

  checks: [
    { what: 'House Blend 250 g price (B02 dataset)', value: PRICE.houseBlend, shown: 14 },
    { what: 'Colombia Huila 250 g price (B02 dataset)', value: PRICE.huila, shown: 17 },
    { what: 'Gift Box Trio price (B02 dataset)', value: PRICE.giftBox, shown: 58 },
    { what: 'Ethiopia Yirgacheffe 250 g price (B02 dataset)', value: 19.5, shown: 19.5 },
    { what: 'Free delivery threshold (b01/case.js)', value: FREE_OVER, shown: 35 },
    { what: 'Delivery charge (b01/case.js)', value: DELIVERY, shown: 4.95 },
    { what: 'Online customers (case.js), not printed but consistent', value: BUSINESS.online.customers, shown: 1500 },
    ...[['physiological', 85], ['safety', 70], ['love', 50], ['esteem', 40], ['self-actualisation', 10]].map(([need, pct], i) => ({ what: `Maslow (1943): ${need} needs satisfied (%)`, value: MASLOW[i], shown: pct })),
    { what: 'Tay and Diener: countries', value: 123, shown: 123 },
    { what: 'Anchoring: low anchor and median', value: 10 * 100 + 25, shown: 1025 },
    { what: 'Anchoring: high anchor and median', value: 65 * 100 + 45, shown: 6545 },
    { what: 'Johnson and Goldstein: respondents', value: 161, shown: 161 },
    { what: 'Multiplier example: 3 become 4 at r = 0.25', value: 3 * longRun(1, 0.25), shown: 4 },
    { what: 'Long-run multiplier at r = 0.25', value: longRun(1, 0.25), shown: 1.33, tol: 0.005 },
    { what: 'Long-run multiplier at r = 0.5', value: longRun(1, 0.5), shown: 2 },
    { what: 'Bramley: round 1', value: 400 * 0.25, shown: 100 },
    { what: 'Bramley: round 2', value: 400 * 0.25 ** 2, shown: 25 },
    { what: 'Bramley: round 3', value: 400 * 0.25 ** 3, shown: 6.25 },
    { what: 'Bramley: after three rounds', value: total(400, 0.25, 3), shown: 531.25 },
    { what: 'Bramley: after three rounds, rounded', value: Math.round(total(400, 0.25, 3)), shown: 531 },
    { what: 'Bramley: long run', value: longRun(400, 0.25), shown: 533.3, tol: 0.05 },
    { what: 'Bramley: long run, rounded', value: Math.round(longRun(400, 0.25)), shown: 533 },
    { what: 'Bramley: referred, long run', value: longRun(400, 0.25) - 400, shown: 133.3, tol: 0.05 },
    { what: 'Bramley: referred, rounded', value: Math.round(longRun(400, 0.25) - 400), shown: 133 },
    { what: 'Bramley: share not joining anyway', value: 1 - 0.4, shown: 0.6 },
    { what: 'Bramley: incremental', value: (longRun(400, 0.25) - 400) * 0.6, shown: 80 },
    { what: 'Bramley: credit cost', value: (longRun(400, 0.25) - 400) * 10, shown: 1333, tol: 0.5 },
    { what: 'Bramley: cost per incremental', value: (longRun(400, 0.25) - 400) * 10 / ((longRun(400, 0.25) - 400) * 0.6), shown: 16.67, tol: 0.005 },
    { what: 'Bramley: overstatement two-thirds', value: ((longRun(400, 0.25) - 400) - (longRun(400, 0.25) - 400) * 0.6) / ((longRun(400, 0.25) - 400) * 0.6), shown: 2 / 3, tol: 0.001 },
    { what: 'Basket before delivery', value: PRICE.huila + PRICE.houseBlend, shown: 31 },
    { what: 'Basket with delivery', value: PRICE.huila + PRICE.houseBlend + DELIVERY, shown: 35.95 },
    { what: 'Basket with a third bag', value: PRICE.huila + 2 * PRICE.houseBlend, shown: 45 },
    { what: 'Basket: extra paid', value: (PRICE.huila + 2 * PRICE.houseBlend) - (PRICE.huila + PRICE.houseBlend + DELIVERY), shown: 9.05 },
    { what: 'Brightmere: renewable premium per month', value: 3, shown: 3 },
    { what: 'Brightmere: new customers a quarter', value: 8000, shown: 8000 },
    { what: 'Brightmere: each test group', value: 8000 / 2, shown: 4000 },
    { what: 'Brightmere: opt-in choosers', value: 4000 * 0.12, shown: 480 },
    { what: 'Brightmere: default keepers', value: 4000 * 0.74, shown: 2960 },
    { what: 'Brightmere: ratio about six', value: Math.round((4000 * 0.74) / (4000 * 0.12)), shown: 6 },
  ],
};
