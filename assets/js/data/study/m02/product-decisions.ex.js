// product-decisions.ex.js — M02 · Product decisions: widgets, practice and the knowledge check.
// Answer keys live here, not in the page's HTML. Lantern figures come from m02/market.js (fictional); every number is
// recomputed by `check` (see ../AUTHORING.md).

const usd = (n) => `$${Math.round(n).toLocaleString('en-US')}`;
const int = (n) => Math.round(n).toLocaleString('en-US');

export const widgets = {
  'pd-tier-range': {
    type: 'mixsim',
    lock: { price: true, channels: true, promotion: true },
    show: ['satisfaction', 'units', 'margin', 'contribution'],
    note: 'Only the liquid (tier) and the range are open; price, channels and promotion stay at the default plan. The model assumes extra flavours never take sales from each other, so treat its result for three flavours as a best case. Simulated results from a teaching model, not forecasts.',
  },
  'pd-range-cost': {
    type: 'formula', title: 'What does a wider range cost?',
    intro: 'Each extra flavour adds listing fees in every retail channel and its own production costs. How many extra cans must it sell to pay for them?',
    inputs: [
      { id: 'skus', label: 'Flavours in the range', min: 1, max: 6, step: 1, value: 3, fmt: 'int', unit: 'SKUs' },
      { id: 'listing', label: 'Listing fees per flavour per year, all retail channels together', min: 0, max: 20000, step: 500, value: 11000, fmt: 'money' },
      { id: 'extra', label: 'Other fixed cost per extra flavour per year', min: 0, max: 20000, step: 500, value: 6000, fmt: 'money' },
      { id: 'gm', label: 'Gross margin per can', min: 0.1, max: 3, step: 0.01, value: 1.63, fmt: 'money' },
    ],
    compute: (v) => {
      const added = v.skus - 1;
      const extraListing = added * v.listing;
      const extraOther = added * v.extra;
      const extraFixed = extraListing + extraOther;
      const cans = extraFixed / v.gm;
      const perFlavour = (v.listing + v.extra) / v.gm;
      const xs = [1, 2, 3, 4, 5, 6];
      return {
        headline: { label: 'Extra fixed cost per year, compared with one flavour', value: usd(extraFixed) },
        rows: [
          ['Listing fees for the whole range', usd(v.skus * v.listing)],
          ['Extra listing fees', usd(extraListing)],
          ['Other fixed cost of the extra flavours', usd(extraOther)],
          ['Extra cans needed to cover the extra fixed cost', int(cans)],
          ['Extra cans each additional flavour must sell', int(perFlavour)],
        ],
        note: added === 0
          ? 'With one flavour there is no extra range cost. Add flavours to see what each one has to earn.'
          : `Each extra flavour must sell about ${int(perFlavour)} genuinely extra cans a year at ${'$'}${v.gm.toFixed(2)} a can just to pay for itself. Cans it takes from the flavours already on the shelf don’t count, so the real hurdle is higher if flavours cannibalise each other.`,
        chart: { kind: 'bar', x: { label: 'Flavours in the range', values: xs }, series: [{ name: 'Extra fixed cost per year ($)', values: xs.map((k) => (k - 1) * (v.listing + v.extra)) }], y: { label: 'Extra fixed cost ($)' } },
      };
    },
  },
};

const LEVELS = ['Core benefit', 'Actual product', 'Augmented product'];
const CLASSES = ['Convenience', 'Shopping', 'Specialty', 'Unsought'];

export const guided = [
  {
    id: 'm02-pd-g1', type: 'classify', kind: 'applied',
    prompt: 'Harbourside Hotel (fictional) targets business travellers attending conferences in Harbour City. Classify each part of its offer by product level.',
    items: [
      'A good night’s sleep and an easy working day near the conference centre',
      'Quiet rooms with blackout curtains, a large desk and fast Wi-Fi',
      'Free cancellation up to 6 p.m. on the day of arrival',
      'The hotel’s brand and its four-star standard',
      'A free shuttle to the conference centre',
    ],
    categories: LEVELS,
    answer: [0, 1, 2, 1, 2],
    hints: [
      'Ask first what the traveller is really buying. Then ask which items deliver that benefit and which come with it as extras.',
      'Test an item by removing it: could the hotel still deliver a good night’s sleep and a working day? If yes, the item is probably an augmentation.',
    ],
    feedback: {
      1: 'Rooms, curtains, desk and Wi-Fi are the features that deliver the benefit: actual product.',
      2: 'Free cancellation doesn’t change the stay itself; it reduces the risk of booking. That makes it an augmentation.',
      3: 'The brand name and quality standard are part of what the guest buys and can see before booking: actual product.',
      4: 'The shuttle is a service added around the stay: augmented product. A rival without one still delivers the core benefit.',
    },
    solution: 'Core benefit: a good night’s sleep and an easy working day. Actual product: the rooms and their features, and the brand and its quality standard. Augmented product: free cancellation and the shuttle. Most hotels near the conference centre deliver the core benefit, so the competition is in the outer two levels.',
  },
  {
    id: 'm02-pd-g2', type: 'steps', kind: 'numerical',
    prompt: 'Use the market file’s costs per can: Classic blend $0.58, Single-origin $0.74, Organic single-origin $0.88. Taste scores: 6, 7.5 and 8.5.',
    solution: 'Single-origin vs Classic: (0.74 − 0.58) × 10,000 = $1,600. Organic vs Classic over 150,000 cans: (0.88 − 0.58) × 150,000 = $45,000. Cost per taste point from Classic to Single-origin: 0.16 ÷ 1.5 ≈ $0.107 a can, compared with 0.14 ÷ 1.0 = $0.14 from Single-origin to Organic: each step up in taste costs more than the last.',
    steps: [
      { id: 'm02-pd-g2-s1', type: 'num',
        prompt: 'How much more does the Single-origin liquid cost than the Classic blend per 10,000 cans?',
        answer: 1600, check: () => (0.74 - 0.58) * 10000, tol: 0.5, unit: '$', places: 0,
        hints: ['Find the difference per can first.', '$0.16 a can × 10,000 cans.'],
        wrong: [{ value: 160, say: 'That is the difference for 1,000 cans. Multiply $0.16 by 10,000.' }, { value: 7400, say: 'That is the whole cost of 10,000 Single-origin cans. The question asks for the difference from the Classic blend.' }] },
      { id: 'm02-pd-g2-s2', type: 'num',
        prompt: 'If Lantern sells 150,000 cans in a year, how much more would the Organic tier cost than the Classic blend?',
        answer: 45000, check: () => (0.88 - 0.58) * 150000, tol: 0.5, unit: '$', places: 0,
        hints: ['Difference per can: $0.88 − $0.58.', '$0.30 × 150,000.'],
        wrong: [{ value: 21000, say: 'That is the difference between the Organic and the Single-origin. The question compares the Organic with the Classic blend.' }] },
      { id: 'm02-pd-g2-s3', type: 'num',
        prompt: 'Moving from the Classic blend to the Single-origin raises the taste score by 1.5 points. What does that step cost per can for each taste point gained? (Answer in dollars, to three decimal places.)',
        answer: 0.107, check: () => (0.74 - 0.58) / (7.5 - 6), tol: 0.002, unit: '$', places: 3,
        hints: ['Divide the extra cost per can by the extra taste points.', '$0.16 ÷ 1.5.'],
        wrong: [{ value: 0.24, say: 'You multiplied by 1.5. Divide the extra cost by the points gained: $0.16 ÷ 1.5.' }] },
    ],
  },
  {
    id: 'm02-pd-g3', type: 'steps', kind: 'numerical',
    prompt: 'Suppose Lantern sold in supermarkets (listing fee $9,000 per flavour per year) and convenience stores ($4,000 per flavour per year). The three-flavour range also adds $12,000 a year of production runs, labels and plates.',
    solution: 'Listing three flavours in both channels: 3 × (9,000 + 4,000) = $39,000 a year. One flavour would cost 9,000 + 4,000 = $13,000, so the extra listing fees are $26,000. Adding the range’s $12,000 gives $38,000 of extra fixed cost a year.',
    steps: [
      { id: 'm02-pd-g3-s1', type: 'num',
        prompt: 'What are the total listing fees per year for three flavours in both channels?',
        answer: 39000, check: () => 3 * (9000 + 4000), tol: 0.5, unit: '$', places: 0,
        hints: ['Listing fees are charged per flavour (SKU) in each channel.', 'Add the two channels’ fees per flavour, then multiply by 3.'],
        wrong: [{ value: 13000, say: 'That is the cost of one flavour. The fee is charged for each flavour stocked.' }] },
      { id: 'm02-pd-g3-s2', type: 'num',
        prompt: 'How much more is that than the listing fees for one flavour?',
        answer: 26000, check: () => (3 - 1) * (9000 + 4000), tol: 0.5, unit: '$', places: 0,
        hints: ['One flavour costs $9,000 + $4,000.', 'Two extra flavours × $13,000.'] },
      { id: 'm02-pd-g3-s3', type: 'num',
        prompt: 'Including the $12,000 of range costs, what extra fixed cost per year does the three-flavour range add?',
        answer: 38000, check: () => (3 - 1) * (9000 + 4000) + 12000, tol: 0.5, unit: '$', places: 0,
        hints: ['Add the extra listing fees and the range’s own fixed cost.'],
        wrong: [{ value: 51000, say: 'You added the range cost to the total listing fees. Compare with one flavour: only the extra listing fees count.' }] },
    ],
  },
  {
    id: 'm02-pd-g4', type: 'classify', kind: 'conceptual',
    prompt: 'Classify each purchase by consumer product class, based on how each buyer behaves.',
    items: [
      'A commuter grabs whichever canned coffee is in the station chiller',
      'A couple visits four stores and reads reviews before choosing a sofa',
      'A collector travels to another city to buy a watch from one particular maker',
      'A homeowner buys emergency roof repairs after a storm',
      'A student compares three laptops on price, battery life and weight',
    ],
    categories: CLASSES,
    answer: [0, 1, 2, 3, 1],
    hints: [
      'Look at the effort and comparison: little of either, a lot of comparison, special effort for one brand, or no thought until the need appears.',
      'The class describes the buyer’s behaviour, not the product.',
    ],
    feedback: {
      2: 'The collector makes a special effort for one maker and doesn’t compare: specialty.',
      3: 'Nobody plans to buy roof repairs; the need arrives suddenly. That is unsought.',
      4: 'Comparing features and prices across options is shopping behaviour.',
    },
    solution: 'Convenience: the canned coffee (quick, little comparison). Shopping: the sofa and the laptop (comparison of price, quality and style). Specialty: the watch (strong preference and extra effort). Unsought: the emergency roof repairs (no thought until the need arises).',
  },
];

export const independent = [
  {
    id: 'm02-pd-i1', type: 'steps', kind: 'numerical',
    prompt: 'Fernwood Outfitters (fictional) sells three lines. Coats: Heritage coat, Field jacket and Rain mac, each in 3 colours. Knitwear: Crew jumper and Cardigan, each in 4 colours. Accessories: Scarf, Gloves, Hat and Socks, each in 1 colour. Use Kotler’s convention (length = items in a line; depth = versions of each item).',
    solution: 'Width = 3 lines. Total length = 3 + 2 + 4 = 9 items. Depth of the knitwear line = 4 colours per item. Fernwood’s mix is narrow but consistent: all clothing, sold to the same customers.',
    steps: [
      { id: 'm02-pd-i1-s1', type: 'num', prompt: 'What is the width of Fernwood’s product mix?',
        answer: 3, check: () => ['coats', 'knitwear', 'accessories'].length, tol: 0, unit: 'lines', places: 0,
        wrong: [{ value: 9, say: 'That counts items. Width counts product lines.' }] },
      { id: 'm02-pd-i1-s2', type: 'num', prompt: 'How many items are there across all the lines (the total length of the mix)?',
        answer: 9, check: () => 3 + 2 + 4, tol: 0, unit: 'items', places: 0,
        wrong: [{ value: 21, say: 'You counted every colour. Length counts items; colours are depth.' }] },
      { id: 'm02-pd-i1-s3', type: 'num', prompt: 'What is the depth of the knitwear line (versions of each item)?',
        answer: 4, check: () => 4, tol: 0, unit: 'versions', places: 0,
        wrong: [{ value: 2, say: 'That is the knitwear line’s length (two items). Depth counts the versions of each item.' }] },
    ],
  },
  {
    id: 'm02-pd-i2', type: 'mc', kind: 'conceptual',
    prompt: 'Fernwood Outfitters, known for $300 heirloom coats, plans a $90 coat range sold under the Fernwood name. What kind of product decision is this, and what is its main risk?',
    options: [
      'A downward line stretch; it risks making the heirloom coats look less special and taking sales from them.',
      'A brand extension; it risks confusing customers about which category Fernwood sells in.',
      'Line filling; it risks leaving a gap that competitors can enter.',
      'An upward line stretch; it risks customers doubting that Fernwood can make premium coats.',
    ],
    answer: 0,
    feedback: {
      1: 'A brand extension takes a brand into a new category. Coats are Fernwood’s existing category.',
      2: 'Line filling adds items within the current price range. $90 is far below it, so this stretches the line.',
      3: 'Upward means adding a dearer item. A $90 coat below $300 coats stretches the line downward.',
    },
    solution: 'Adding a cheaper item below the line’s current range is a downward stretch. It can reach new customers, but under the same name it can dilute the premium line’s image and cannibalise its sales; that is why some brands stretch downward under a different name.',
  },
  {
    id: 'm02-pd-i3', type: 'classify', kind: 'conceptual',
    prompt: 'Classify each statement about Lantern Cold Brew by the product attribute it describes.',
    items: [
      'A taste panel scores the Single-origin liquid 7.5 out of 10',
      'Every batch is tested so that strength and caffeine stay within the specification',
      'An oat-milk version is added to the range',
      'The can has a matte finish and a hand-drawn lantern that stands out in the chiller',
    ],
    categories: ['Performance quality', 'Conformance quality', 'Feature', 'Style and design'],
    answer: [0, 1, 2, 3],
    feedback: {
      0: 'The taste score measures how well the product does its job: performance quality.',
      1: 'Testing that every batch meets the specification is about consistency: conformance quality.',
    },
    solution: 'The taste score is performance quality (how well it works). Batch testing is conformance quality (how consistently it meets the specification). The oat-milk version is a feature. The matte, hand-drawn can is style and design.',
  },
  {
    id: 'm02-pd-i4', type: 'num', kind: 'numerical',
    prompt: 'Suppose Lantern sold only in natural and specialty grocers (listing fee $2,000 per flavour per year) and its own channel (no listing fee). The three-flavour range adds $12,000 a year of production costs. In natural grocers Lantern keeps a gross margin of $1.4238 a can at $3.49. How many extra cans a year must the three-flavour range sell there to pay for its extra fixed cost? (Round to the nearest can.)',
    answer: 11238, check: () => ((3 - 1) * 2000 + 12000) / 1.4238, tol: 35, unit: 'cans', places: 0,
    wrong: [
      { value: 2809, say: 'That covers only the extra listing fees. Add the $12,000 of production runs, labels and plates.' },
      { value: 12643, say: 'You used the listing fees for all three flavours. Only the two extra flavours add cost compared with one.' },
    ],
    solution: 'Extra listing fees: (3 − 1) × $2,000 = $4,000. Extra fixed cost: $4,000 + $12,000 = $16,000. Extra cans: $16,000 ÷ $1.4238 ≈ 11,238 cans a year, and they must be cans that would not otherwise have been sold as Original.',
  },
  {
    id: 'm02-pd-i5', type: 'mc', kind: 'applied',
    prompt: 'For most of Lantern’s target commuters, a can of cold brew is a convenience product. What does that imply for the rest of Lantern’s mix?',
    options: [
      'The can must be available in many outlets near the moment of thirst, at a price not far from rivals’, with strong visibility at the point of sale.',
      'Lantern should sell in one exclusive outlet so that commuters make a special trip.',
      'Lantern should rely on personal selling to explain the product to each buyer.',
      'Price doesn’t matter, because convenience buyers never notice prices.',
    ],
    answer: 0,
    feedback: {
      1: 'That suits a specialty product. A convenience buyer who doesn’t find Lantern in the chiller simply buys another brand.',
      2: 'Personal selling suits unsought or complex products. A chilled can is chosen in seconds.',
      3: 'Convenience buyers compare less, but a price far above the alternatives on the same shelf still loses them.',
    },
    solution: 'Convenience products are bought often, quickly and with little comparison, so availability (many outlets, chilled, near where people buy), a price close to rivals’ and visibility at the shelf decide sales. This is in tension with a premium story that needs telling, which Lantern must resolve in its place and promotion decisions.',
  },
  {
    id: 'm02-pd-i6', type: 'mc', kind: 'applied',
    prompt: 'A battery-storage installer (fictional) finds that three competitors offer almost identical batteries at similar prices. Where should it look first to differentiate its offer?',
    options: [
      'The augmented product: site design, installation quality, remote monitoring and a performance warranty.',
      'The core benefit: it should persuade warehouses that they don’t need lower energy costs.',
      'Nowhere: an offer with identical batteries is a commodity that can only compete on price.',
      'The product mix width: it should add unrelated product lines.',
    ],
    answer: 0,
    feedback: {
      1: 'The core benefit is what customers need; changing it means serving a different need, not differentiating the same offer.',
      2: 'Levitt’s argument is that any product can be differentiated. When the actual products are alike, the augmented product is where rivals differ.',
      3: 'New, unrelated lines don’t make the battery offer any better for the warehouse buying it.',
    },
    solution: 'When rivals deliver the same core benefit with near-identical actual products, the augmented product (design, installation, monitoring, warranty, support) is where an offer can stand out. In business markets these services often decide the contract.',
  },
];

export const check = [
  {
    id: 'm02-pd-k1', type: 'mc', kind: 'conceptual',
    prompt: 'A university’s online master’s programme in data analytics is aimed at working professionals. Which is its core benefit?',
    options: [
      'Career progress through analytics skills gained without stopping work.',
      'Twelve online modules with recorded lectures and weekly assignments.',
      'A careers service and alumni network available after graduation.',
      'The university’s name on the degree certificate.',
    ],
    answer: 0,
    feedback: {
      1: 'The modules and lectures deliver the benefit; they are the actual product.',
      2: 'Careers support and the alumni network come with the programme: augmented product.',
      3: 'The university’s name is the brand, part of the actual product. It matters because it helps deliver the core benefit.',
    },
    solution: 'The core benefit answers “what is the student really buying?”: career progress through new skills, fitted around work. The modules and brand are the actual product; the careers service and network are the augmented product.',
  },
  {
    id: 'm02-pd-k2', type: 'num', kind: 'numerical',
    prompt: 'From the market file: the Single-origin liquid costs $0.74 a can and the Organic single-origin $0.88. How much more does the Organic cost per 10,000 cans?',
    answer: 1400, check: () => (0.88 - 0.74) * 10000, tol: 0.5, unit: '$', places: 0,
    wrong: [
      { value: 140, say: 'That is the difference for 1,000 cans. Multiply $0.14 by 10,000.' },
      { value: 3000, say: 'That compares the Organic with the Classic blend ($0.58). The question compares it with the Single-origin.' },
    ],
    solution: '($0.88 − $0.74) × 10,000 = $0.14 × 10,000 = $1,400.',
  },
  {
    id: 'm02-pd-k3', type: 'classify', kind: 'conceptual',
    prompt: 'Classify each product by the class it usually falls into for the typical buyer described.',
    items: [
      'Toothpaste, bought during the weekly shop',
      'A wedding dress, chosen after visiting several boutiques',
      'A pre-paid funeral plan',
      'A handmade guitar from one luthier with a two-year waiting list',
    ],
    categories: CLASSES,
    answer: [0, 1, 3, 2],
    feedback: {
      1: 'Visiting several boutiques to compare style, quality and price is shopping behaviour.',
      2: 'Few people think about buying a funeral plan until prompted: unsought.',
      3: 'Waiting two years for one maker shows strong preference and little comparison: specialty.',
    },
    solution: 'Convenience: toothpaste. Shopping: the wedding dress. Unsought: the funeral plan. Specialty: the handmade guitar.',
  },
  {
    id: 'm02-pd-k4', type: 'mc', kind: 'applied',
    prompt: 'Five hotels near a city’s conference centre (all fictional) offer similar rooms at similar rates. One of them wants to win more business travellers. Which change works at the augmented-product level?',
    options: [
      'Guaranteed 2 p.m. late checkout and a free conference-centre shuttle for business guests.',
      'Repositioning the hotel as a family holiday resort.',
      'Cutting the room rate by 20%.',
      'Renovating rooms to a higher standard than the four-star brand requires.',
    ],
    answer: 0,
    feedback: {
      1: 'That changes the target market and the core benefit, not the augmentation for business travellers.',
      2: 'A rate cut is a price decision, and an expensive one if rivals match it.',
      3: 'Renovating rooms improves the actual product. It may help, but it is a different level and a much larger investment.',
    },
    solution: 'Late checkout and a shuttle are services added around the stay: augmented product. When rivals deliver the same core benefit and similar actual products, augmentations are a fast, comparatively cheap way to stand out.',
  },
  {
    id: 'm02-pd-k5', type: 'num', kind: 'numerical',
    prompt: 'Supermarkets charge Lantern a listing fee of $9,000 per flavour per year. How much more does Lantern pay in supermarket listing fees per year if it launches three flavours instead of one?',
    answer: 18000, check: () => (3 - 1) * 9000, tol: 0.5, unit: '$', places: 0,
    wrong: [
      { value: 27000, say: 'That is the total for three flavours. The question asks how much more than one flavour.' },
      { value: 30000, say: 'You added the range’s $12,000 production cost to the extra listing fees. The question asks about listing fees only.' },
    ],
    solution: 'One flavour: $9,000. Three flavours: 3 × $9,000 = $27,000. Extra: $27,000 − $9,000 = $18,000 a year.',
  },
  {
    id: 'm02-pd-k6', type: 'mc', kind: 'conceptual',
    prompt: 'Lantern offers its beans as House Blend, Ethiopian Single-origin and Decaf, each in a 250 g and a 1 kg bag. Using Kotler’s convention, which statement is correct?',
    options: [
      'The line’s length is 3 and its depth is 2.',
      'The line’s length is 2 and its depth is 3.',
      'The line’s length is 6 and its depth is 1.',
      'The mix’s width is 3, because there are three coffees.',
    ],
    answer: 0,
    feedback: {
      1: 'You swapped them. Length counts items (three coffees); depth counts versions of each item (two bag sizes).',
      2: 'Six counts every size of every coffee. Length counts items; the sizes are depth.',
      3: 'Width counts product lines, not items. The three coffees are items in one line.',
    },
    solution: 'Length = number of items in the line = 3 coffees. Depth = versions of each item = 2 bag sizes. Width describes the whole mix (number of lines), not a single line. Remember that OpenStax uses “depth” for the number of items, so check a source’s convention.',
  },
];
