// consumer-decisions.ex.js — M01 · How consumers make buying decisions: widgets, practice and the knowledge check.
// Answer keys live here, not in the page's HTML. Every business, person and score is fictional; every number is
// recomputed by `check` (see ../AUTHORING.md).

const STAGES = ['Need recognition', 'Information search', 'Evaluation of alternatives', 'Purchase decision', 'Post-purchase behaviour'];
const TYPES = ['Complex', 'Dissonance-reducing', 'Habitual', 'Variety-seeking'];
const two = (x) => x.toFixed(2);

export const widgets = {
  'cd-scoring': {
    type: 'formula',
    title: 'Weighted-attribute scores: Lantern’s workshop against two rivals',
    intro: 'Scores out of 10, higher is better. CremaClass online scores 3 for hands-on practice, 9 for price and 10 for timing; Calder College’s evening course scores 8, 4 and 7. Lantern scores 9 for hands-on practice; set its price and timing scores below. Weights are scaled to add up to 100%.',
    inputs: [
      { id: 'wHands', label: 'Weight on hands-on practice', min: 0, max: 100, step: 5, value: 30, fmt: 'int' },
      { id: 'wPrice', label: 'Weight on price', min: 0, max: 100, step: 5, value: 20, fmt: 'int' },
      { id: 'wTime', label: 'Weight on timing', min: 0, max: 100, step: 5, value: 50, fmt: 'int' },
      { id: 'lPrice', label: 'Lantern’s price score', min: 1, max: 10, step: 1, value: 5, fmt: 'int' },
      { id: 'lTime', label: 'Lantern’s timing score', min: 1, max: 10, step: 1, value: 4, fmt: 'int' },
    ],
    compute: (v) => {
      const tot = v.wHands + v.wPrice + v.wTime;
      if (tot <= 0) return { error: 'Give at least one attribute a weight above zero.' };
      const w = [v.wHands / tot, v.wPrice / tot, v.wTime / tot];
      const sc = (s) => w[0] * s[0] + w[1] * s[1] + w[2] * s[2];
      const opts = [['Lantern workshop', [9, v.lPrice, v.lTime]], ['CremaClass online', [3, 9, 10]], ['Calder College evenings', [8, 4, 7]]]
        .map(([n, s]) => ({ n, s: sc(s) }));
      const lantern = opts[0];
      const rival = opts[1].s >= opts[2].s ? opts[1] : opts[2];
      const best = lantern.s > rival.s + 1e-9 ? lantern : rival;
      const gap = rival.s - lantern.s;
      const pct = (x) => `${Math.round(x * 100)}%`;
      let note;
      if (gap < -1e-9) note = `Lantern leads ${rival.n} by ${two(-gap)} points with these weights. Notice which weight you would have to move, and how far, before the lead disappears.`;
      else if (Math.abs(gap) <= 1e-9) note = `Lantern is level with ${rival.n}. Any improvement on an attribute with a weight above zero would put it ahead.`;
      else {
        const tNeed = w[2] > 0 ? gap / w[2] : Infinity;
        const pNeed = w[1] > 0 ? gap / w[1] : Infinity;
        const route = (need, cur, name) => (need === Infinity ? `${name} carries no weight, so changing it can’t help.` : cur + need <= 10 + 1e-9 ? `${name}: +${two(need)} points (to ${two(cur + need)}) would draw level.` : `${name}: +${two(need)} points would be needed, above the top of the 10-point scale, so ${name.toLowerCase()} alone can’t close the gap.`);
        note = `Lantern trails ${rival.n} by ${two(gap)} points. ${route(tNeed, v.lTime, 'Timing')} ${route(pNeed, v.lPrice, 'Price')} The heavier the weight, the smaller the rise needed.`;
      }
      return {
        headline: { label: 'Highest weighted score', value: `${best.n}: ${two(best.s)}` },
        rows: [
          ...opts.map((o) => [o.n, two(o.s)]),
          ['Weights used', `${pct(w[0])} hands-on, ${pct(w[1])} price, ${pct(w[2])} timing`],
        ],
        note,
        chart: {
          kind: 'bar',
          x: { label: 'Option', values: opts.map((o) => o.n) },
          series: [{ name: 'Weighted score (out of 10)', values: opts.map((o) => Math.round(o.s * 100) / 100) }],
          y: { label: 'Weighted score (out of 10)' },
        },
      };
    },
  },
};

export const guided = [
  {
    id: 'm01-cd-g1', type: 'order', kind: 'conceptual',
    prompt: 'Oren, a student, buys a laptop. Put the steps of his purchase in the order of the buying decision process.',
    items: [
      'His old laptop can no longer run the software his course now requires.',
      'He asks classmates which laptops they use and reads reviews of three models.',
      'He compares the three on battery life, weight and price, caring most about battery life.',
      'He orders the model with the best battery life from the cheaper of two retailers.',
      'A month later he rereads the reviews to reassure himself he didn’t overpay.',
    ],
    hints: [
      'The process runs need recognition, information search, evaluation of alternatives, purchase decision, post-purchase behaviour.',
      'Choosing the retailer is part of the purchase decision; rereading reviews after buying is post-purchase.',
    ],
    solution: 'Need recognition (the old laptop can’t run the software), information search (classmates and reviews), evaluation of alternatives (comparing battery life, weight and price), purchase decision (the model and the retailer), post-purchase behaviour (rereading reviews to reduce doubt about the choice, a sign of post-purchase dissonance).',
  },
  {
    id: 'm01-cd-g2', type: 'steps', kind: 'numerical',
    prompt: 'A traveller choosing a hotel for a city break weights location 0.5, price 0.3 and guest reviews 0.2. She scores Hotel A 8 for location, 5 for price and 7 for reviews; Hotel B 6, 8 and 6; Hotel C 9, 3 and 9 (out of 10, higher is better; all fictional). Which hotel does the weighted-attribute model expect her to choose?',
    solution: 'A: 0.5 × 8 + 0.3 × 5 + 0.2 × 7 = 4.0 + 1.5 + 1.4 = 6.9. B: 3.0 + 2.4 + 1.2 = 6.6. C: 4.5 + 0.9 + 1.8 = 7.2. Hotel C has the highest weighted score: its location and reviews outweigh its poor price score because location carries half the weight.',
    steps: [
      { id: 'm01-cd-g2-s1', type: 'num',
        prompt: 'What is Hotel A’s weighted score? Give one decimal place.',
        answer: 6.9, check: () => 0.5 * 8 + 0.3 * 5 + 0.2 * 7, tol: 0.05, unit: 'points', places: 1,
        hints: ['Multiply each score by its weight, then add the three results.', '0.5 × 8 + 0.3 × 5 + 0.2 × 7.'],
        wrong: [
          { value: 6.67, say: 'That is the plain average of 8, 5 and 7. The attributes don’t matter equally to her: multiply each score by its weight.' },
          { value: 20, say: 'That is the sum of the scores. Multiply each one by its weight first.' },
        ] },
      { id: 'm01-cd-g2-s2', type: 'num',
        prompt: 'What is Hotel C’s weighted score? Give one decimal place.',
        answer: 7.2, check: () => 0.5 * 9 + 0.3 * 3 + 0.2 * 9, tol: 0.05, unit: 'points', places: 1,
        hints: ['Use the same weights: 0.5 for location, 0.3 for price, 0.2 for reviews.', '0.5 × 9 + 0.3 × 3 + 0.2 × 9.'],
        wrong: [
          { value: 7, say: 'That is the plain average of 9, 3 and 9. Weight each score before adding.' },
          { value: 6.6, say: 'That is Hotel B’s score. Hotel C scores 9, 3 and 9.' },
        ] },
      { id: 'm01-cd-g2-s3', type: 'mc',
        prompt: 'Hotel B scores 6.6. Which hotel does the model expect her to choose, and why?',
        options: [
          'Hotel C: it leads on location, which carries half the weight.',
          'Hotel B: it is the cheapest, and price is what most travellers look at first.',
          'Hotel A: it has no score below 5, so it is the safest all-round choice.',
          'None of them: scores this close are too similar for the model to rank.',
        ],
        answer: 0,
        hints: ['Compare the three weighted scores: 6.9, 6.6 and 7.2.', 'Which attribute has the largest weight?'],
        feedback: {
          1: 'B is cheapest, but price carries only 0.3 of the weight. Its weighted score, 6.6, is the lowest of the three.',
          2: 'Having no low score is a non-compensatory way of choosing. Under the weighted-attribute model C’s strengths more than make up for its price.',
          3: 'The model ranks the options by their scores, and C leads by 0.3. Close scores are a reason to check the weights with more buyers, not a reason the model can’t rank them.',
        } },
    ],
  },
  {
    id: 'm01-cd-g3', type: 'classify', kind: 'conceptual',
    prompt: 'Classify each purchase by the kind of buying behaviour it shows.',
    items: [
      'A family buys its first electric car after months of research and test drives.',
      'A shopper picks up her usual brand of washing-up liquid without looking at the others.',
      'A couple chooses between three similar-looking mattresses in an afternoon, then reads reviews of the one they bought to reassure themselves.',
      'A student buys a different flavour of crisps each week, just for a change.',
      'A coffee enthusiast compares single-origin beans from five roasters, reading about farms and roast dates, before choosing.',
    ],
    categories: TYPES,
    answer: [0, 2, 1, 3, 0],
    hints: [
      'Ask two questions: does the purchase matter a lot to the buyer (involvement), and do the options differ a lot in the buyer’s eyes?',
      'High involvement with similar options, followed by doubts, is dissonance-reducing; low involvement with options that differ, bought for a change, is variety-seeking.',
    ],
    feedback: {
      2: 'The mattresses matter (expensive, used for years) but look alike, so the couple chooses fairly quickly and then seeks reassurance: dissonance-reducing.',
      3: 'Crisps are a low-involvement purchase, and the student switches for novelty, not because she disliked the last flavour: variety-seeking.',
      4: 'Beans are often bought out of habit, but this buyer is highly involved and sees big differences between roasters: complex buying.',
    },
    solution: 'The car and the enthusiast’s beans are complex buying (high involvement, real differences). The mattresses are dissonance-reducing (high involvement, little visible difference, doubts afterwards). The washing-up liquid is habitual. The crisps are variety-seeking. The same product can fall in different cells for different buyers.',
  },
  {
    id: 'm01-cd-g4', type: 'mc', kind: 'applied',
    prompt: 'A fictional furniture shop sells a sofa for $1,900. Delivery takes four weeks, and some customers cancel before it arrives. Which action is most likely to reduce post-purchase dissonance?',
    options: [
      'An e-mail after payment with the delivery date, care tips and other owners’ reviews.',
      'A discount code for the customer’s next furniture purchase, sent the day after payment.',
      'More advertising for the sofa, aimed at people who haven’t bought one yet.',
      'A rule that paid orders can’t be cancelled, so customers can’t change their minds.',
    ],
    answer: 0,
    hints: [
      'Dissonance is doubt about a choice already made. What would reassure a buyer who is waiting for an expensive sofa?',
      'Look for the option that confirms the choice rather than one that traps the buyer or speaks to someone else.',
    ],
    feedback: {
      1: 'People rarely buy two sofas close together, and a discount on the next one does nothing to settle doubts about this one.',
      2: 'Advertising may bring new buyers, but it isn’t aimed at the customer who is worrying about the sofa she has just paid for.',
      3: 'Removing the way out doesn’t remove the doubt; it turns it into resentment and bad reviews.',
    },
    why: 'Reassurance, useful information and confirmation from other owners all reduce the conflict between “I chose this” and “maybe I shouldn’t have”.',
    solution: 'Dissonance is most likely after an expensive, hard-to-reverse choice between close options, and a four-week wait gives doubt time to grow. Confirming the delivery date, helping the customer look after the sofa and showing that other owners are happy all reassure her that she chose well.',
  },
];

export const independent = [
  {
    id: 'm01-cd-i1', type: 'classify', kind: 'applied',
    prompt: 'Lantern plans several marketing actions for its online shop and workshops. Classify each by the stage of the buying decision process it mainly targets.',
    items: [
      'A reorder reminder e-mailed to a customer who bought a bag of beans a few weeks ago',
      'Paying to appear in search results for “latte art class”',
      'A table on the workshop page comparing what each Lantern workshop covers',
      'Removing one step from the online checkout',
      'A practice guide e-mailed to participants a week after their workshop',
    ],
    categories: STAGES,
    answer: [0, 1, 2, 3, 4],
    feedback: {
      0: 'The reminder prompts the customer to notice a gap (her beans may be running low) before she would otherwise: need recognition.',
      2: 'A comparison table helps buyers weigh options against each other: evaluation of alternatives.',
      4: 'The guide arrives after the purchase. It supports satisfaction and reduces doubt: post-purchase behaviour.',
    },
    solution: 'Reorder reminder: need recognition. Search advertising: information search, so that Lantern is found when people look. Comparison table: evaluation of alternatives. Shorter checkout: purchase decision, where every extra step is a chance for the intention to fade. Practice guide: post-purchase behaviour.',
  },
  {
    id: 'm01-cd-i2', type: 'num', kind: 'numerical',
    prompt: 'Among students choosing a gym, FitBay (fictional) leads with a weighted score of 7.4; Halton Gym (fictional) scores 6.8. The weights are location 0.4, price 0.35 and group classes 0.25. By how many points must Halton’s score for group classes rise, with nothing else changing, for it to draw level with FitBay? Give one decimal place.',
    answer: 2.4, check: () => (7.4 - 6.8) / 0.25, tol: 0.05, unit: 'points', places: 1,
    wrong: [
      { value: 0.6, say: 'That is the gap in weighted scores. Each point on group classes adds only 0.25 of a point to the weighted score, so divide the gap by 0.25.' },
      { value: 1.5, say: 'You divided by the location weight (0.4). The improvement is in group classes, whose weight is 0.25.' },
      { value: 0.15, say: 'You multiplied the gap by the weight. Divide instead: the rise needed is gap ÷ weight.' },
    ],
    solution: 'Gap = 7.4 − 6.8 = 0.6. Each extra point on group classes adds 0.25 to Halton’s weighted score, so it needs 0.6 ÷ 0.25 = 2.4 points to draw level, and a little more to overtake. Improving location would need only 0.6 ÷ 0.4 = 1.5 points, but a gym can rarely move.',
  },
  {
    id: 'm01-cd-i3', type: 'mc', kind: 'conceptual',
    prompt: 'Why can the same 250 g bag of beans be a low-involvement purchase for one of Lantern’s customers and a high-involvement purchase for another?',
    options: [
      'Involvement depends on the buyer and the situation, not only on the product.',
      'The bag costs some customers more than others once delivery is added.',
      'Involvement is set by how much the seller spends advertising the product.',
      'It can’t: involvement is fixed by product type, so beans are always low-involvement.',
    ],
    answer: 0,
    feedback: {
      1: 'Delivery may add to the cost of a small order, but that is not what separates the enthusiast from the routine buyer. What differs is how much the purchase matters to each of them.',
      2: 'Advertising can make people more aware of a product, but involvement is about the buyer’s own stake in the choice.',
      3: 'That is the misconception the lesson warns against. A coffee enthusiast or a gift buyer can be highly involved in buying beans.',
    },
    solution: 'Involvement is how much a purchase matters to a particular buyer: personal relevance, risk and interest. A subscriber reordering her usual bag is barely involved; an enthusiast comparing farms, or someone choosing beans as a gift for a coffee-loving boss, is highly involved.',
  },
  {
    id: 'm01-cd-i4', type: 'multi', kind: 'conceptual',
    prompt: 'Which statements about online customer journeys and the limits of the five-stage model are supported by the lesson? Select all that apply.',
    options: [
      'Buyers can add brands to their consideration set during evaluation.',
      'One customer’s review can become part of another customer’s information search.',
      'A habitual buyer may go from need recognition straight to purchase.',
      'Online, buyers narrow their options steadily from many brands to one, like a funnel.',
      'Once a buyer has paid, the seller can no longer influence whether she buys again.',
      'Every purchase, routine or not, passes through all five stages in the same order.',
    ],
    answer: [0, 1, 2],
    feedback: {
      3: 'Court and colleagues (2009) argued that the funnel misses how people buy: buyers in their study added brands during active evaluation.',
      4: 'The post-purchase experience feeds the loyalty loop. Follow-up, service and reminders all influence the next purchase.',
      5: 'Stages are skipped, reordered and repeated. The sequence is a checklist, not a description of every purchase.',
    },
    solution: 'Consideration sets can grow during evaluation; one customer’s review feeds another’s search; habitual buyers skip stages. The funnel picture, the idea that the sale ends the seller’s influence and the idea of a fixed five-stage order are all contradicted by the lesson.',
  },
  {
    id: 'm01-cd-i5', type: 'num', kind: 'applied',
    prompt: 'A buyer compares three phone plans (fictional) with weights of 0.4 for network coverage, 0.4 for price and 0.2 for data allowance. Plan 1 scores 9, 8 and 4; Plan 2 scores 7, 6 and 7; Plan 3 scores 6, 5 and 9. But she won’t consider any plan with less than 20 GB of data a month, Plan 1 offers 15 GB, while Plans 2 and 3 offer 30 GB and 50 GB. What is the weighted score of the plan she chooses? Give one decimal place.',
    answer: 6.6, check: () => Math.max(0.4 * 7 + 0.4 * 6 + 0.2 * 7, 0.4 * 6 + 0.4 * 5 + 0.2 * 9), tol: 0.05, unit: 'points', places: 1,
    wrong: [
      { value: 7.6, say: 'That is Plan 1’s score, the highest of the three, but Plan 1 fails her 20 GB cut-off. A non-compensatory cut-off removes an option before any scores are compared.' },
      { value: 6.2, say: 'That is Plan 3’s score. Plan 2 scores higher among the plans that pass the cut-off.' },
    ],
    solution: 'Apply the cut-off first: Plan 1 (15 GB) is out. Plan 2: 0.4 × 7 + 0.4 × 6 + 0.2 × 7 = 2.8 + 2.4 + 1.4 = 6.6. Plan 3: 2.4 + 2.0 + 1.8 = 6.2. She chooses Plan 2, scoring 6.6. Plan 1 would have scored 7.6, the highest of all, which shows how a cut-off can rule out the best-scoring option.',
  },
  {
    id: 'm01-cd-i6', type: 'short', kind: 'applied',
    prompt: 'In December many of Lantern’s online customers buy the $58 Gift Box Trio for someone else. Using the five stages, suggest one thing Lantern could do at each stage to help gift buyers, and explain why a gift raises involvement.',
    rubric: [
      'Explains why a gift raises involvement (the choice reflects on the giver; the buyer may not know the recipient’s taste; a deadline adds risk).',
      'Gives an action at each of the five stages that fits that stage.',
      'Includes at least one action aimed at post-purchase doubt or at the recipient’s experience.',
      'Keeps the actions honest: no promises the box can’t keep.',
    ],
    model: 'A gift raises involvement because a poor choice reflects on the giver, the buyer is often guessing at someone else’s taste, and a late delivery spoils the occasion. Need recognition: a reminder in late November to customers who bought gifts last year, and a “gifts for coffee lovers” page that people searching for presents can find. Information search: clear descriptions of the three coffees in the box, photographs of the packaging and reviews from people who gave it. Evaluation: a short guide comparing the gift box with a single bag or a subscription, so the buyer can choose by how well they know the recipient’s taste. Purchase decision: the latest order date for delivery before Christmas shown on the product page, and gift wrapping and a message offered in the basket rather than discovered at the end. Post-purchase: a dispatch e-mail with tracking, a card in the box with brewing tips for the recipient, and an easy exchange if the recipient doesn’t drink, say, decaf. Reassurance matters twice here: for the giver waiting for delivery, and for the recipient, whose experience decides whether the giver buys again.',
  },
];

export const check = [
  {
    id: 'm01-cd-k1', type: 'mc', kind: 'conceptual',
    prompt: 'Why is the weighted-attribute model called compensatory?',
    options: [
      'A high score on one attribute can make up for a low score on another.',
      'It compensates for buyers’ mistakes by correcting their scores.',
      'It rules out any option that fails a minimum standard on any attribute.',
      'It gives every attribute the same weight, so no attribute dominates.',
    ],
    answer: 0,
    feedback: {
      1: 'The model takes the buyer’s scores and weights as they are; it doesn’t correct them.',
      2: 'That describes a conjunctive rule, which is non-compensatory: a weakness can’t be offset.',
      3: 'The weights usually differ; that is the point of weighting. Equal weights would be a special case.',
    },
    solution: 'Scores are multiplied by weights and added, so strength on one attribute raises the total even when another attribute is weak. Under a non-compensatory rule, such as a cut-off, a weakness can’t be offset.',
  },
  {
    id: 'm01-cd-k2', type: 'num', kind: 'numerical',
    prompt: 'A buyer weights reliability 0.5, price 0.3 and design 0.2. A washing machine (fictional) scores 8 for reliability, 6 for price and 5 for design, out of 10. What is its weighted score? Give one decimal place.',
    answer: 6.8, check: () => 0.5 * 8 + 0.3 * 6 + 0.2 * 5, tol: 0.05, unit: 'points', places: 1,
    wrong: [
      { value: 6.33, say: 'That is the plain average of the three scores. Multiply each by its weight before adding.' },
      { value: 19, say: 'That is the sum of the scores. Multiply each by its weight first.' },
    ],
    solution: '0.5 × 8 + 0.3 × 6 + 0.2 × 5 = 4.0 + 1.8 + 1.0 = 6.8.',
  },
  {
    id: 'm01-cd-k3', type: 'classify', kind: 'conceptual',
    prompt: 'Classify each purchase by the kind of buying behaviour it shows.',
    items: [
      'A household tops up its usual brand of toilet paper during the weekly shop.',
      'A first-time buyer chooses a flat after months of viewings, mortgage quotes and advice.',
      'A shopper tries a new yoghurt flavour each week because he gets bored of the same one.',
      'A homeowner picks one of several similar-looking boilers recommended by her plumber, then worries she should have shopped around.',
    ],
    categories: TYPES,
    answer: [2, 0, 3, 1],
    feedback: {
      1: 'A first home is about as involved as buying gets, and flats differ a great deal: complex buying.',
      3: 'The boiler matters (expensive, hard to reverse) but the options look alike to her, and doubt follows the choice: dissonance-reducing.',
    },
    solution: 'Toilet paper: habitual (low involvement, little difference). The flat: complex (high involvement, big differences). The yoghurt: variety-seeking (low involvement, switching for novelty). The boiler: dissonance-reducing (high involvement, options that look alike, doubts afterwards).',
  },
  {
    id: 'm01-cd-k4', type: 'mc', kind: 'applied',
    prompt: 'Lantern’s shop data show that many visitors add the Gift Box Trio to their basket in December and then leave at the last step of the checkout, where the delivery date first appears. Where in the buying process is Lantern losing them, and what is the best first response?',
    options: [
      'At the purchase decision: the delivery date stops them, so show it on the product page.',
      'At need recognition: they don’t really want a gift box, so Lantern should advertise it more.',
      'At evaluation of alternatives: the box scores too low, so Lantern should cut its price.',
      'At post-purchase: buyers are suffering dissonance, so Lantern should send a reassuring e-mail.',
    ],
    answer: 0,
    feedback: {
      1: 'Putting the box in a basket shows the need and the want are there. The intention fails later, at the checkout.',
      2: 'They have already chosen the box over the alternatives. Nothing suggests the price is what stops them; the timing points to the delivery date.',
      3: 'These visitors haven’t bought yet, so there is no purchase to feel dissonance about.',
    },
    why: 'The evidence points to the step where the delivery date appears: a situational factor between intention and purchase.',
    solution: 'Adding the box to the basket shows the visitor has recognised the need, searched and chosen. The intention fails when the delivery date appears, so the problem is at the purchase decision. Showing the date earlier lets gift buyers decide before they invest time in the checkout; Lantern should then measure whether abandonment falls compared with a baseline.',
  },
  {
    id: 'm01-cd-k5', type: 'num', kind: 'applied',
    prompt: 'Among students, a café (fictional) trails the most popular café near campus by 0.45 points in weighted score. Students weight price 0.3 and Wi-Fi quality 0.15. By how many points would the café’s price score have to rise, with nothing else changing, to draw level? Give one decimal place.',
    answer: 1.5, check: () => 0.45 / 0.3, tol: 0.05, unit: 'points', places: 1,
    wrong: [
      { value: 3, say: 'That is the rise needed on Wi-Fi quality (0.45 ÷ 0.15). The question asks about price, whose weight is 0.3.' },
      { value: 0.45, say: 'That is the gap in weighted scores. Divide it by the price weight to find the rise in the price score.' },
      { value: 0.135, say: 'You multiplied the gap by the weight. The rise needed is gap ÷ weight.' },
    ],
    solution: 'Rise needed = gap ÷ weight = 0.45 ÷ 0.3 = 1.5 points on price. On Wi-Fi it would take 0.45 ÷ 0.15 = 3 points, so price is the smaller move in points; whether it is the cheaper move depends on what a lower price costs the café on every cup.',
  },
  {
    id: 'm01-cd-k6', type: 'mc', kind: 'conceptual',
    prompt: 'In their 2009 study of the consumer decision journey, Court and colleagues reported what about the brands buyers consider during active evaluation?',
    options: [
      'Buyers often added brands during evaluation, so the set could grow, not only shrink.',
      'Buyers steadily narrowed their initial set until only one brand was left.',
      'Buyers considered only the brands they already knew before they began looking.',
      'The number of brands considered stopped mattering because buyers decided at the shelf.',
    ],
    answer: 0,
    feedback: {
      1: 'That is the funnel picture the study argued against.',
      2: 'Brands can enter during evaluation: car shoppers in the study added 2.2 brands on average to an initial 3.8.',
      3: 'The study shows the opposite: being considered at each phase of the journey matters, and two-thirds of active-evaluation touchpoints were consumer-driven.',
    },
    solution: 'Court and colleagues described a circular journey (initial consideration, active evaluation, closure or the moment of purchase, and the post-purchase experience) in which brands can be added during active evaluation, for example 2.2 brands on average to an initial set of 3.8 for car shoppers.',
  },
];
