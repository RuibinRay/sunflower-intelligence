// differentiation-and-repositioning.ex.js — M05 · Differentiation and repositioning: widgets, practice and the knowledge
// check (answer keys live here). Lantern's map and ideal points come from case.js (DERIVED.map; segments from module 2).
// The second survey wave, the hotel map and the other businesses are fictional. Every num item's `check` recomputes its
// answer.
import { BRANDS, NEEDS, COMPETITORS, DERIVED as D } from './case.js?v=14';
import { perceptualMap, distance } from '../../../core/percmap.js?v=14';
import { TIERS } from '../m02/market.js?v=14';

const M = D.map.brandMeans, MAP = perceptualMap(M), SEG = D.segments.names;
const B = (name) => BRANDS.indexOf(name), S = (name) => SEG.indexOf(name), A = (key) => NEEDS.findIndex((n) => n.key === key);
const LA = B('Lantern'), SU = B('Summit Brew');
const CL = S('Craft and local'), OG = S('On the go'), EX = S('Explorers');
const CONV = A('convenience'), TASTE = A('taste');
const SHORT = ['Taste', 'Low price', 'Convenience', 'Sustainability', 'Energy', 'Health', 'Local', 'Novelty'];
const IDEALS = D.map.segIdeal.map((p) => MAP.project(p));
const per = (j) => [MAP.vectors[j][0] / MAP.sd[j], MAP.vectors[j][1] / MAP.sd[j]];
const plan = (changes) => { const p = M[LA].slice(); for (const [j, v] of Object.entries(changes)) p[+j] = v; return MAP.project(p); };
const P15 = plan({ [CONV]: M[LA][CONV] + 1.5 });
// the investor's plan for On the go: energy 7, a low price 6.3, convenience 7
const INV = plan({ [A('energy')]: 7, [A('price')]: 6.3, [CONV]: 7 });
const panel = { lantern: TIERS.find((t) => t.id === 'single').quality, summit: COMPETITORS.find((c) => c.id === 'summit').quality };   // M02's taste panel (fictional)
const f2 = (v) => v.toFixed(2), r2 = (v) => Math.round(v * 100) / 100;
const sg = (v) => (v < 0 ? `−${Math.abs(v).toFixed(2)}` : v.toFixed(2));
const sg3 = (v) => (v < 0 ? `−${Math.abs(v).toFixed(3)}` : `+${v.toFixed(3)}`);
const pt = (p) => `(${sg(p[0])}, ${sg(p[1])})`;
const price = (id) => COMPETITORS.find((c) => c.id === id).price;

// ---------------------------------------------------------------- widgets
export const widgets = {
  'dr-plan': {
    type: 'percmap', title: 'Plan Lantern’s position on the May 2027 map',
    brands: BRANDS, means: M, attributes: SHORT,
    ideals: SEG.map((name, s) => ({ name, profile: D.map.segIdeal[s] })),
    highlight: 'Lantern', move: true, vectors: true,
    note: `The sliders set the mean ratings Lantern would need; the map’s axes, the other brands and the ideal points stay where the May 2027 study put them. Each convenience point moves Lantern by ${sg3(per(CONV)[0])} on Dimension 1 and ${sg3(per(CONV)[1])} on Dimension 2. Lantern’s current ratings rest on ${D.map.counts[LA]} people who know it. “Low price” is the rating for “a low price”, so high means cheap.`,
  },
};

// ---------------------------------------------------------------- guided practice
export const guided = [
  {
    id: 'm05-dr-g1', type: 'classify', kind: 'conceptual',
    prompt: 'Ana lists ways Lantern could make itself different. Classify each by Kotler and Armstrong’s five ways to differentiate.',
    items: [
      'Listing Lantern Cold Brew in convenience stores across Harbour City.',
      'Training every barista to talk customers through the month’s guest coffee.',
      'Single-origin Ethiopian coffee steeped for 20 hours.',
      'Pre-ordering in the cafés so that a drink is ready on arrival.',
      'Sponsoring the city’s neighbourhood street festivals.',
      'A recyclable can printed with the name of the farm.',
    ],
    categories: ['Product', 'Services', 'Channels', 'People', 'Image'],
    answer: [2, 3, 0, 1, 4, 0],
    feedback: {
      0: 'Where and how the offer is available: channel differentiation.',
      1: 'What the staff know and do: people differentiation.',
      2: 'What the coffee itself is: product differentiation.',
      3: 'Something done for the customer around the product: service differentiation.',
      4: 'Associations and events: image differentiation.',
      5: 'Packaging and design are part of the product.',
    },
    hints: ['Ask what the customer meets: the thing itself, help around it, where it is sold, who serves it, or what the brand stands for.', 'Packaging counts as product; events and sponsorship as image.'],
    solution: 'Channels: convenience-store listing. People: trained baristas. Product: the coffee and the can. Services: pre-ordering. Image: festival sponsorship.',
  },
  {
    id: 'm05-dr-g2', type: 'steps', kind: 'numerical',
    prompt: `On Lantern’s map, one convenience point moves a brand by ${sg3(per(CONV)[0])} on Dimension 1 and ${sg3(per(CONV)[1])} on Dimension 2. Lantern sits at ${pt(MAP.scores[LA])}; the Craft and local ideal is at ${pt(IDEALS[CL])}. Ana plans for customers to rate Lantern 1.5 points higher on convenience, everything else unchanged.`,
    solution: `Movement: 1.5 × (${sg3(per(CONV)[0])}, ${sg3(per(CONV)[1])}) = (${sg(1.5 * per(CONV)[0])}, ${sg(1.5 * per(CONV)[1])}); new position ${pt(P15)}. Distance to Craft and local: √((${sg(P15[0])} − ${sg(IDEALS[CL][0])})² + (${sg(P15[1])} − (${sg(IDEALS[CL][1])}))²) ≈ ${f2(distance(P15, IDEALS[CL]))}, down from ${f2(D.map.distances[CL][LA])}. Lantern moves closer to the Craft and local ideal because that ideal asks for a little more convenience than Lantern offers today.`,
    steps: [
      {
        id: 'm05-dr-g2-s1', type: 'num',
        prompt: 'By how much does Lantern’s Dimension 1 score change? Give two decimal places, with a minus sign if it falls.',
        answer: r2(1.5 * per(CONV)[0]), check: () => 1.5 * MAP.vectors[CONV][0] / MAP.sd[CONV], unit: 'map units', places: 2, tol: 0.006,
        wrong: [
          { value: r2(-1.5 * per(CONV)[0]), say: 'The sign: more convenience moves a brand towards the cheap and everywhere end, where convenience’s arrow points (negative on Dimension 1).' },
          { value: r2(1.5 * per(CONV)[1]), say: 'That is the change on Dimension 2. Dimension 1’s movement per point is −0.313.' },
          { value: r2(per(CONV)[0]), say: 'That is the movement for one point. The plan is 1.5 points: multiply.' },
        ],
        hints: ['Δx = movement per point × change in rating.', '1.5 × (−0.313).'],
      },
      {
        id: 'm05-dr-g2-s2', type: 'num',
        prompt: 'How far would Lantern then be from the Craft and local ideal? Give two decimal places.',
        answer: r2(distance(P15, IDEALS[CL])), check: () => Math.hypot(MAP.scores[LA][0] + 1.5 * per(CONV)[0] - IDEALS[CL][0], MAP.scores[LA][1] + 1.5 * per(CONV)[1] - IDEALS[CL][1]), unit: 'map units', places: 2, tol: 0.012,
        wrong: [
          { value: r2(D.map.distances[CL][LA]), say: 'That is today’s distance. Move Lantern first: add the movement on both dimensions.' },
          { value: r2(Math.hypot(MAP.scores[LA][0] + 1.5 * per(CONV)[0] - IDEALS[CL][0], MAP.scores[LA][1] - IDEALS[CL][1])), say: 'You moved Lantern on Dimension 1 only. Convenience also moves it up by 1.5 × 0.132 on Dimension 2.' },
        ],
        hints: [`New position: (3.20 − 0.47, 0.29 + 0.20).`, 'Distance = √(Δx² + Δy²) to the ideal at (2.48, −0.03).'],
      },
      {
        id: 'm05-dr-g2-s3', type: 'mc',
        prompt: 'Why does becoming more convenient bring Lantern closer to the Craft and local ideal rather than further away?',
        options: [
          'Craft and local drinkers care more about convenience than any other segment does',
          'Lantern overshoots their ideal, which asks for a bit more convenience',
          'The axes move when Lantern changes, so every brand gets closer to every ideal point',
          'Convenience and local are positively correlated across the six brands on the map',
        ],
        answer: 1,
        feedback: {
          0: `Their convenience index is ${D.segments.index[CL][CONV]}, below average; On the go’s is ${D.segments.index[OG][CONV]}.`,
          2: 'The axes are held fixed in a planned move; only Lantern moves.',
          3: 'The opposite: across the brands convenience and local point in nearly opposite directions.',
        },
        hints: ['Compare Lantern’s position with the ideal’s on Dimension 1.', `Lantern is at ${sg(MAP.scores[LA][0])}; the ideal at ${sg(IDEALS[CL][0])}.`],
      },
    ],
  },
  {
    id: 'm05-dr-g3', type: 'classify', kind: 'conceptual',
    prompt: 'Classify each offer (all fictional) by its value position.',
    items: [
      'A hotel with larger rooms and better service than its rivals, priced 40% above them.',
      'A camera with more features than the market leader, at the market leader’s price.',
      'An airline with no meals, no seat choice and fares half its rivals’.',
      'An online pharmacy selling the same branded medicines as high-street chemists, for less.',
      'A store chain promising better quality than its rivals at lower prices.',
    ],
    categories: ['More for more', 'More for the same', 'The same for less', 'Less for much less', 'More for less'],
    answer: [0, 1, 3, 2, 4],
    feedback: {
      0: 'More benefits at a higher price: more for more.',
      1: 'More benefits at the same price: more for the same, the classic attack on a premium leader.',
      2: 'Fewer benefits at a much lower price: less for much less.',
      3: 'Identical products at a lower price: the same for less, which needs lower costs to last.',
      4: 'More benefits at a lower price: more for less, the hardest to sustain.',
    },
    hints: ['Compare benefits first (more, the same, less), then price.', 'Identical products cheaper is “the same for less”; stripped-down and much cheaper is “less for much less”.'],
    solution: 'Hotel: more for more. Camera: more for the same. Airline: less for much less. Pharmacy: the same for less. Store chain: more for less.',
  },
  {
    id: 'm05-dr-g4', type: 'multi', kind: 'applied',
    prompt: 'Ana’s assistant suggests a 310 ml can of Cold Brew instead of 250 ml, at the same $3.49, as the lead difference. Which of Kotler and Armstrong’s criteria does that difference fail? Select all that apply.',
    options: ['Important', 'Distinctive', 'Superior', 'Communicable', 'Pre-emptive', 'Affordable', 'Profitable'],
    answer: [4, 6],
    feedback: {
      0: 'More coffee for the money matters to some buyers; it isn’t where the idea fails most clearly.',
      1: 'No rival offers 310 ml today, so it is distinctive for now; the problem is how long that lasts.',
      3: 'A bigger can is easy to see and to say.',
      5: 'Same price, so buyers can afford it.',
    },
    hints: ['Which criteria ask about rivals’ responses and about the business’s own margin?', 'Any rival can change its can size; 24% more coffee costs 24% more to fill.'],
    solution: 'It fails pre-emptive (any rival can match a can size within months) and profitable (24% more coffee at the same price cuts the margin on every can). It is also off-position: Lantern’s differences are craft and local, not quantity, so a bigger can would pull its value position towards “more for less” without a cost advantage to support it.',
  },
];

// ---------------------------------------------------------------- on your own
// a fictional second wave (May 2028) of Lantern's convenience ratings
const W2 = { mean: 3.52, sd: 0.98, n: 64 }, W1 = { mean: 3.15, sd: 0.96, n: 61 };
const seW = Math.sqrt(W1.sd ** 2 / W1.n + W2.sd ** 2 / W2.n);

export const independent = [
  {
    id: 'm05-dr-i1', type: 'num', kind: 'numerical',
    prompt: `Suppose (fictional) the May 2028 wave gives Lantern a mean convenience rating of ${W2.mean} from ${W2.n} ratings (SD ${W2.sd}), against ${W1.mean} from ${W1.n} (SD ${W1.sd}) in May 2027. Calculate the t statistic for the change (Welch: SE = √(s₁²/n₁ + s₂²/n₂)). Give two decimal places.`,
    answer: r2((W2.mean - W1.mean) / seW), check: () => (3.52 - 3.15) / Math.sqrt(0.96 ** 2 / 61 + 0.98 ** 2 / 64), unit: '', places: 2, tol: 0.02,
    wrong: [
      { value: r2((W2.mean - W1.mean) / (W2.sd / Math.sqrt(W2.n))), say: 'You used only the 2028 standard error. Both means are estimates: combine both variances.' },
      { value: r2((W2.mean - W1.mean) / (W1.sd / Math.sqrt(W1.n) + W2.sd / Math.sqrt(W2.n))), say: 'You added the standard errors. Variances add: SE = √(SE₁² + SE₂²).' },
      { value: r2(W2.mean - W1.mean), say: 'That is the change itself. Divide it by its standard error.' },
    ],
    solution: `SE = √(${W1.sd}² ÷ ${W1.n} + ${W2.sd}² ÷ ${W2.n}) = ${seW.toFixed(4)}; t = (${W2.mean} − ${W1.mean}) ÷ ${seW.toFixed(4)} ≈ ${((W2.mean - W1.mean) / seW).toFixed(2)}, with about 123 degrees of freedom: two-sided p ≈ 0.035. The rise of 0.37 is beyond chance at 5%, but it falls short of Ana’s target of 0.5 points; and the result is only comparable if the panel, quotas and questions stayed the same.`,
  },
  {
    id: 'm05-dr-i2', type: 'order', kind: 'applied',
    prompt: 'Put the steps of a repositioning plan in order.',
    items: [
      'Research why the current position no longer serves the business',
      'Choose the target segment and write the new positioning statement',
      'Plan the target position on the map with the axes fixed, checking every segment’s distance',
      'Set the success criteria and the tracking sample before anything changes',
      'Change what customers experience: product, services, channels, people, image',
      'Repeat the survey and compare the waves on the old axes and on a new map',
    ],
    solution: 'Research first (Lumen’s first pitfall is too little of it), then target and statement, then the planned move, then the criteria and tracking design, then the changes customers will experience, and finally the repeated survey, read both on the old axes and on a re-estimated map.',
  },
  {
    id: 'm05-dr-i3', type: 'classify', kind: 'conceptual',
    prompt: 'Lumen Learning’s reading on repositioning lists reasons to consider it and pitfalls to avoid. Classify each.',
    items: [
      'A new competitor enters with a similar offer at a lower price.',
      'Customers’ tastes move towards something the brand doesn’t stand for.',
      'Promising more than the organisation can deliver.',
      'Moving so far from the old position that customers stop believing the claims.',
      'A change in the company’s own leadership and strategy.',
      'A new message so muddled that customers can’t tell what the brand stands for.',
    ],
    categories: ['A reason to consider repositioning', 'A pitfall of repositioning'],
    answer: [0, 0, 1, 1, 0, 1],
    feedback: {
      2: 'Overpromising creates expectations the organisation can’t meet.',
      3: 'Lumen calls this going “a bridge too far”.',
      5: 'A confusing positioning is a pitfall: the message has to be clear.',
    },
    solution: 'Reasons: competition, changing consumer tastes, internal change (and the wider economy). Pitfalls: overpromising, a bridge too far, a confusing message (and too little research, and underestimating “back to basics”).',
  },
  {
    id: 'm05-dr-i4', type: 'mc', kind: 'conceptual',
    prompt: 'A brand manager compares two waves of a perceptual-map survey. Why should she both project the new wave’s brand means onto the old axes and build a new map from the new wave?',
    options: [
      'The old axes show how each brand moved, like for like; the new map shows whether the structure changed',
      'The old axes are more accurate, and the new map only checks that the two surveys used the same attributes',
      'The new map corrects for sampling error in the old wave, so the two together give a confidence interval',
      'Projecting onto the old axes removes the effect of any change in the sample design between the waves',
    ],
    answer: 0,
    feedback: {
      1: 'Neither is more accurate: they answer different questions. Checking the attributes is a matter of design, done before fieldwork.',
      2: 'Neither map gives an interval. Changes in brand means are tested with their standard errors.',
      3: 'Nothing in the analysis removes a change in sample design; keep the design the same.',
    },
    solution: 'On fixed axes, every brand’s movement can be read in one picture. A re-estimated map shows whether customers now link the attributes differently, for example whether convenience and craft are still opposites. A brand that has repositioned shows in the first; a market whose structure has changed shows in the second.',
  },
  {
    id: 'm05-dr-i5', type: 'num', kind: 'numerical',
    prompt: `Ana wants Lantern to move 0.5 map units towards the cheap and everywhere end of Dimension 1 by improving convenience alone. One convenience point moves a brand ${sg3(per(CONV)[0])} on Dimension 1. How many rating points higher must Lantern’s convenience rating be? Give two decimal places.`,
    answer: r2(0.5 / Math.abs(per(CONV)[0])), check: () => 0.5 / Math.abs(MAP.vectors[CONV][0] / MAP.sd[CONV]), unit: 'rating points', places: 2, tol: 0.011,
    wrong: [
      { value: r2(0.5 * Math.abs(per(CONV)[0])), say: 'You multiplied. The movement is points × 0.313, so points = 0.5 ÷ 0.313.' },
      { value: r2(0.5 / per(CONV)[1]), say: 'That uses Dimension 2’s movement per point (0.132). The target is on Dimension 1.' },
    ],
    solution: `0.5 ÷ ${Math.abs(per(CONV)[0]).toFixed(3)} ≈ ${(0.5 / Math.abs(per(CONV)[0])).toFixed(2)} points: from ${f2(M[LA][CONV])} to about ${f2(M[LA][CONV] + 0.5 / Math.abs(per(CONV)[0]))}. Customers would have to experience Lantern as markedly easier to find, which is a matter of channels and services rather than claims.`,
  },
  {
    id: 'm05-dr-i6', type: 'multi', kind: 'applied',
    prompt: 'Ana’s investor suggests repositioning the whole Lantern brand towards On the go drinkers: stronger coffee, lower prices, “coffee for people in a hurry”. Which risks does the evidence point to? Select all that apply.',
    options: [
      `Craft and local drinkers, ${(100 * D.segments.sizes[CL].spendShare).toFixed(1)}% of spending and the most loyal segment, may stop seeing Lantern as theirs.`,
      `Lantern’s ratings on convenience (${f2(M[LA][CONV])}) and energy make the new claims hard to believe.`,
      'Corner Cup and Summit Brew sit far closer to On the go’s ideal than Lantern would be even after those changes.',
      'A lower price without lower costs would erode Lantern’s margin.',
      'On the go drinkers are too few to matter: they are the smallest segment.',
    ],
    answer: [0, 1, 2, 3],
    feedback: {
      4: `On the go is ${D.segments.sizes[OG].n} of 640 respondents and the largest share of spending; the problem is not their size but Lantern’s distance from them.`,
    },
    solution: `All four real risks: losing the core (Craft and local, ${(100 * D.segments.sizes[CL].spendShare).toFixed(1)}% of spending, loyalty ${f2(D.segments.loyalty[CL])} of 5), a bridge too far (the claims contradict the ratings), entrenched rivals (even rated 7 on energy and convenience and 6.3 on a low price, Lantern would be ${f2(distance(INV, IDEALS[OG]))} from On the go’s ideal, against ${f2(D.map.distances[OG][B('Corner Cup')])} for Corner Cup and ${f2(D.map.distances[OG][SU])} for Summit Brew, and ${f2(distance(INV, IDEALS[CL]))} from Craft and local’s), and a price cut without a cost advantage. On the go is not small; it is far away.`,
  },
];

// ---------------------------------------------------------------- knowledge check
// a hotel map (fictional): one point on "quiet rooms" moves a hotel by (+0.35, −0.20)
const HT = { at: [0.40, 1.10], per: [0.35, -0.20], rise: 1.2, ideal: [1.00, 0.50] };
const htNew = [HT.at[0] + HT.rise * HT.per[0], HT.at[1] + HT.rise * HT.per[1]];

export const check = [
  {
    id: 'm05-dr-k1', type: 'mc', kind: 'conceptual',
    prompt: 'What makes repositioning harder than positioning a new offer?',
    options: [
      'Customers already hold beliefs about the offer, which the new position has to overcome',
      'Repositioning needs a new perceptual map, while positioning can use an existing one',
      'A repositioned brand has to change its name, logo and packaging at the same time',
      'Repositioning is only possible when sales are falling, so there is less money to spend',
    ],
    answer: 0,
    feedback: {
      1: 'Both use maps of how customers see the market today; the planned position is drawn on the existing axes.',
      2: 'Changing the name is one option, not a requirement; many repositionings work through the mix and the message.',
      3: 'Falling sales are one trigger among several; competitors, tastes and strategy are others.',
    },
    solution: 'Repositioning starts from an existing position. Customers already believe something about the offer, so the business must move those beliefs, and risks losing the customers who held them. That is why it needs evidence, a credible path and tracking.',
  },
  {
    id: 'm05-dr-k2', type: 'num', kind: 'numerical',
    prompt: `On a hotel map (fictional), one point on “quiet rooms” moves a hotel by +0.35 on Dimension 1 and −0.20 on Dimension 2. A hotel at (0.40, 1.10) plans for its quiet-rooms rating to rise by ${HT.rise} points. How far will it then be from the business travellers’ ideal at (1.00, 0.50)? Give two decimal places.`,
    answer: r2(distance(htNew, HT.ideal)), check: () => Math.hypot(0.40 + 1.2 * 0.35 - 1.00, 1.10 - 1.2 * 0.20 - 0.50), unit: 'map units', places: 2, tol: 0.006,
    wrong: [
      { value: r2(distance(HT.at, HT.ideal)), say: 'That is the distance before the change. Move the hotel first: (0.40 + 1.2 × 0.35, 1.10 − 1.2 × 0.20).' },
      { value: r2(Math.hypot(HT.at[0] + HT.rise * HT.per[0] - HT.ideal[0], HT.at[1] - HT.ideal[1])), say: 'You moved the hotel on Dimension 1 only. The rating also moves it down Dimension 2 by 1.2 × 0.20.' },
      { value: r2(Math.hypot(HT.at[0] + HT.per[0] - HT.ideal[0], HT.at[1] + HT.per[1] - HT.ideal[1])), say: 'That is a one-point rise. The plan is 1.2 points.' },
    ],
    solution: `New position: (0.40 + 1.2 × 0.35, 1.10 − 1.2 × 0.20) = (${htNew[0].toFixed(2)}, ${htNew[1].toFixed(2)}). Distance: √((${htNew[0].toFixed(2)} − 1.00)² + (${htNew[1].toFixed(2)} − 0.50)²) = √(${((htNew[0] - 1) ** 2).toFixed(4)} + ${((htNew[1] - 0.5) ** 2).toFixed(4)}) ≈ ${distance(htNew, HT.ideal).toFixed(2)}, down from ${distance(HT.at, HT.ideal).toFixed(2)}.`,
  },
  {
    id: 'm05-dr-k3', type: 'classify', kind: 'conceptual',
    prompt: 'Each proposed lead difference (all fictional) fails one of Kotler and Armstrong’s criteria most clearly. Which?',
    items: [
      'A bank offers a slightly higher savings rate that any rival could match next week.',
      'A car maker’s engine is 2% more efficient, but buyers can’t see or feel the difference.',
      'A furniture shop adds hand-carved legs that would double the price its buyers can pay.',
      'A gym offers free towels, as every other gym in town already does.',
    ],
    categories: ['Distinctive', 'Communicable', 'Pre-emptive', 'Affordable'],
    answer: [2, 1, 3, 0],
    feedback: {
      0: 'Easily matched: not pre-emptive.',
      1: 'Real but invisible to buyers: not communicable.',
      2: 'Buyers can’t pay for it: not affordable.',
      3: 'Everyone offers it: not distinctive.',
    },
    solution: 'Rate any rival can match: pre-emptive. An unnoticeable gain: communicable. A price buyers can’t pay: affordable. Free towels everywhere: distinctive.',
  },
  {
    id: 'm05-dr-k4', type: 'mc', kind: 'applied',
    prompt: `M02’s taste panel scores Lantern Cold Brew’s single-origin can ${panel.lantern} out of 10 against Summit Brew’s ${panel.summit}, and the can is planned at $3.49 against Summit Brew’s $${price('summit').toFixed(2)}. On the product alone, what is its value position against Summit Brew, and what would make that position hold?`,
    options: [
      'More for more: a premium can at a premium price, which needs nothing further to hold',
      'More for less: more taste for less money, which needs lower costs than Summit Brew’s',
      'The same, or slightly less, for less: it needs lower costs or a reason beyond taste',
      'Less for much less: a stripped-down can that needs a much lower price to work',
    ],
    answer: 2,
    feedback: {
      0: `Its price is below Summit Brew’s, not above it; against Arcadia ($${price('arcadia').toFixed(2)}) it would be more for more.`,
      1: `On the product alone the panel puts the can slightly behind Summit Brew (${panel.lantern} against ${panel.summit}), not ahead. Customers who judge it by Lantern’s brand ratings might see more for less, but a blind test would have to support that.`,
      3: `$3.49 is only $${(price('summit') - 3.49).toFixed(2)} below Summit Brew, not much less, and nothing has been stripped out.`,
    },
    solution: `On taste alone the can is close to Summit Brew’s, slightly behind (${panel.lantern} against ${panel.summit}), at a lower price: the same, or slightly less, for less. That position lasts only with lower costs than Summit Brew’s or a reason to choose beyond taste, which is why the positioning leads with local and independent. If a blind test showed the can as good as Summit Brew, customers who value local could see it as more for less.`,
  },
  {
    id: 'm05-dr-k5', type: 'mc', kind: 'conceptual',
    prompt: 'Why does the map widget keep the axes fixed when you plan a new position for Lantern?',
    options: [
      'Real repeat surveys never re-estimate axes, so the widget copies that practice',
      'So the move is the plan’s alone: the other brands and ideal points stay where they are',
      'Because fixed axes make the planned position more accurate than a new survey would',
      'So that Lantern can never move beyond the area covered by the other five brands',
    ],
    answer: 1,
    feedback: {
      0: 'A real repeat survey would rebuild the map; with six brands one brand’s move can tilt the axes. Compare waves both ways.',
      2: 'A plan is a what-if, not a measurement; a new survey is the only evidence of what customers think.',
      3: 'A planned profile can land anywhere; the plotting window grows to show it.',
    },
    solution: 'Holding the standardisation and weights fixed makes the planned point comparable with today’s map: only the planned brand moves. It is a planning device; a real change would be measured by a repeat survey, read on the old axes and on a new map.',
  },
  {
    id: 'm05-dr-k6', type: 'multi', kind: 'applied',
    prompt: 'Which of these belong in Ana’s success criteria for the convenience plan, set before anything changes? Select all that apply.',
    options: [
      'Lantern’s convenience rating up by at least 0.5 points, beyond sampling error.',
      'Taste, local and sustainability ratings not down beyond sampling error.',
      'Lantern still the nearest brand to the Craft and local ideal.',
      'Enough Lantern ratings in the 2028 wave to detect the change.',
      'Lantern becomes the nearest brand to On the go’s ideal.',
      'The 2028 survey uses new attributes chosen to show Lantern’s improvements.',
    ],
    answer: [0, 1, 2, 3],
    feedback: {
      4: 'The plan treats convenience as parity for Lantern’s own targets; the map shows On the go is out of reach even at the top of the scale.',
      5: 'Changing the attributes breaks the comparison between waves. Keep the questions the same.',
    },
    solution: 'Criteria should name the change sought (convenience), the things that must not get worse (craft ratings, nearest brand for Craft and local) and the sample that can detect it. Becoming On the go’s nearest brand isn’t the aim, and new attributes would make the waves incomparable.',
  },
];
