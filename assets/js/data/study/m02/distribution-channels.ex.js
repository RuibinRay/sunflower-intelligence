// distribution-channels.ex.js — M02 · Distribution channels and decisions: widgets, practice and the knowledge check.
// Answer keys live here, not in the page's HTML. Every number is recomputed by `check` (see ../AUTHORING.md).
// Market figures (fictional) come from ./market.js: trade margins 32% / 40% / 38%, listing fees $9,000 / $4,000 /
// $2,000 per SKU per year, direct fulfilment $0.45 a can and $6,000 a year, cost of goods $0.58 / $0.74 / $0.88.

const money = (v) => `${v < 0 ? '−' : ''}$${Math.abs(v).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const pct = (v) => `${(v * 100).toFixed(1)}%`;

export const widgets = {
  'dch-buildup': {
    type: 'formula',
    title: 'Price build-up: from the shelf to Lantern',
    intro: 'Set the shelf price, the trade margin (what the distributor and store keep, as a share of the shelf price), any fulfilment cost and the cost of goods. The calculator shows what Lantern keeps per can and how many cans a year cover a fixed channel cost.',
    inputs: [
      { id: 'price', label: 'Shelf price per can', min: 1.99, max: 4.99, step: 0.01, value: 3.49, fmt: 'money' },
      { id: 'margin', label: 'Trade margin (share of shelf price)', min: 0, max: 60, step: 1, value: 32, fmt: 'pct' },
      { id: 'fulfil', label: 'Fulfilment cost per can (direct channel only)', min: 0, max: 1, step: 0.05, value: 0, fmt: 'money' },
      { id: 'cogs', label: 'Cost of goods per can', min: 0.4, max: 1.2, step: 0.01, value: 0.74, fmt: 'money' },
      { id: 'fee', label: 'Yearly fixed channel cost (listing fees or shop running cost)', min: 0, max: 30000, step: 500, value: 9000, fmt: 'money' },
    ],
    compute: (v) => {
      const m = v.margin / 100;
      const trade = v.price * m;
      const net = v.price - trade - v.fulfil;
      const gm = net - v.cogs;
      const markup = trade / (v.price - trade);
      const payback = gm > 0 ? Math.ceil(v.fee / gm) : null;
      const rows = [
        ['Kept by the distributor and store per can', money(trade)],
        ['Trade margin as a markup on what the trade pays Lantern', m > 0 ? pct(markup) : 'none (no trade margin)'],
        ['Fulfilment per can', money(v.fulfil)],
        ['Gross margin per can (net price − cost of goods)', money(gm)],
        ['Gross margin as a share of the shelf price', pct(gm / v.price)],
        ['Cans a year to cover the fixed cost', payback == null ? 'never: each can loses money' : v.fee === 0 ? '0 (no fixed cost)' : payback.toLocaleString('en-US')],
      ];
      let note;
      if (gm <= 0) note = `At these settings Lantern loses ${money(-gm)} on every can before any fees or promotion: the trade margin and costs take more than the shelf price leaves. Raise the price, choose a cheaper liquid or a channel with a lower margin.`;
      else if (m === 0 && v.fulfil > 0) note = `Selling direct, Lantern keeps the whole shelf price but pays ${money(v.fulfil)} a can to store, pack and deliver it: the intermediary’s work is still done, by Lantern. Its ${money(gm)} gross margin is ${pct(gm / v.price)} of the shelf price.`;
      else note = `Of every ${money(v.price)} the shopper pays, the trade keeps ${money(trade)} and Lantern receives ${money(net)}. After the ${money(v.cogs)} cost of goods, ${money(gm)} a can is left to pay for listing fees, promotion and overhead${v.fee > 0 ? `; ${payback.toLocaleString('en-US')} cans a year cover the ${money(v.fee)} fixed cost alone` : ''}.`;
      const out = {
        headline: { label: 'Net price to Lantern per can', value: money(net) },
        rows,
        note,
      };
      if (gm > 0) {
        out.chart = {
          kind: 'bar',
          x: { label: 'Where the shelf price goes', values: ['Cost of goods', 'Lantern’s gross margin', 'Fulfilment', 'Trade margin'] },
          series: [{ name: 'Dollars per can', values: [v.cogs, gm, v.fulfil, trade].map((x) => Math.round(x * 100) / 100) }],
          y: { label: 'Dollars per can' },
        };
      }
      return out;
    },
  },
  'dch-mixsim': {
    type: 'mixsim',
    lock: { tier: true, range: true, price: true, promotion: true },
    show: ['units', 'contribution', 'share'],
    note: 'Product (single-origin, one flavour), price ($3.49) and the $120,000 promotion plan are fixed at Lantern’s first plan. Only the channels are open. The sampling budget is spread over whichever retail channels you choose, so adding a channel also thins the support in each store. Results come from a teaching model, not a forecast.',
  },
};

export const guided = [
  {
    id: 'm02-dch-g1', type: 'steps', kind: 'numerical',
    prompt: 'Lantern’s single-origin can sells for $3.49 in convenience stores. The distributor and the store together keep 40% of the shelf price, and the can costs Lantern $0.74 to make and deliver. Work through the price build-up. Give each answer to the cent.',
    solution: 'Trade margin per can = 3.49 × 0.40 = $1.396 ≈ $1.40. Net price = 3.49 − 1.396 = $2.094 ≈ $2.09 (or 3.49 × 0.60). Gross margin = 2.094 − 0.74 = $1.354 ≈ $1.35 a can, the lowest of Lantern’s channels.',
    steps: [
      { id: 'm02-dch-g1-s1', type: 'num',
        prompt: 'How much of the shelf price does the trade keep per can?',
        answer: 1.40, check: () => 3.49 * 0.40, unit: '$', places: 2, tol: 0.01,
        hints: ['The trade margin is a share of the shelf price.', 'Multiply the shelf price by 0.40.'],
        wrong: [
          { value: 2.09, say: 'That is what Lantern keeps, the net price. The question asks for the part the distributor and store keep.' },
          { value: 1.12, say: 'That is the supermarkets’ 32%. Convenience stores keep 40%.' },
        ] },
      { id: 'm02-dch-g1-s2', type: 'num',
        prompt: 'What is Lantern’s net price per can?',
        answer: 2.09, check: () => 3.49 * (1 - 0.40), unit: '$', places: 2, tol: 0.01,
        hints: ['Net price = shelf price − what the trade keeps.', 'Equivalently, shelf price × (1 − 0.40).'],
        wrong: [
          { value: 4.89, say: 'You added 40% to the shelf price. The trade margin comes out of the shelf price, so Lantern receives less than $3.49, not more.' },
          { value: 1.40, say: 'That is the trade’s share. Lantern receives the rest of the $3.49.' },
        ] },
      { id: 'm02-dch-g1-s3', type: 'num',
        prompt: 'What is Lantern’s gross margin per can?',
        answer: 1.35, check: () => 3.49 * (1 - 0.40) - 0.74, unit: '$', places: 2, tol: 0.01,
        hints: ['Gross margin per can = net price − cost of goods.', 'Subtract $0.74 from the net price you just found.'],
        wrong: [
          { value: 2.09, say: 'That is the net price. Lantern still has to pay $0.74 to make and deliver the can.' },
          { value: 2.75, say: 'You subtracted the cost of goods from the shelf price, but Lantern never receives the trade’s $1.40.' },
        ] },
    ],
  },
  {
    id: 'm02-dch-g2', type: 'num', kind: 'numerical',
    prompt: 'Lantern decides to launch three flavours in supermarkets and in natural and specialty grocers. Supermarkets charge $9,000 and natural grocers $2,000 per SKU per year to list a product. What are Lantern’s yearly listing fees?',
    answer: 33000, check: () => (9000 + 2000) * 3, unit: '$', places: 0, tol: 0.5,
    hints: ['Each flavour is a separate SKU, and the fee is charged per SKU.', 'Add the two channels’ fees and multiply by the number of flavours.'],
    wrong: [
      { value: 11000, say: 'That is the cost of one flavour. The fee is per SKU, so three flavours pay it three times.' },
      { value: 45000, say: 'That includes convenience stores ($4,000 per SKU), which aren’t in this plan.' },
      { value: 27000, say: 'That is only the supermarkets. Add the natural grocers’ fees too.' },
    ],
    solution: 'Fees per flavour: 9,000 + 2,000 = $11,000. Three flavours: 11,000 × 3 = $33,000 a year, before the $12,000 of extra production cost a three-flavour range carries.',
  },
  {
    id: 'm02-dch-g3', type: 'classify', kind: 'conceptual',
    prompt: 'How many levels does each channel have? Count the intermediaries between the producer and the final customer.',
    items: [
      'Lantern sells a 12-pack through its own online shop.',
      'A natural grocer buys cases straight from Lantern and sells them to shoppers.',
      'Lantern sells to a distributor, which supplies supermarkets, which sell to shoppers.',
      'A broker introduces Lantern to a distributor in another city, which supplies cafés there that sell the cans to customers.',
      'A home battery-storage maker sells and installs systems for homeowners with its own team.',
      'An airline sells a seat through a travel agent.',
    ],
    categories: ['Zero-level (direct)', 'One-level', 'Two-level', 'Three-level'],
    answer: [0, 1, 2, 3, 0, 1],
    hints: ['Count the businesses that stand between the producer and the person who uses the product.', 'An agent or broker counts as a level even though it never owns the goods.'],
    feedback: {
      3: 'Three businesses stand between Lantern and the customer: the broker, the distributor and the cafés. The broker never owns the cans but still performs channel work (finding and persuading the distributor), so it counts.',
      4: 'The maker deals with the homeowner itself, with no intermediary: a direct channel, typical for products that need a survey, installation and support.',
      5: 'The travel agent is the only intermediary between the airline and the passenger, so the channel has one level.',
    },
    solution: 'Online shop: zero-level. Natural grocer buying direct: one-level. Distributor then supermarket: two-level. Broker, distributor and cafés: three-level. Battery maker with its own installers: zero-level. Airline via a travel agent: one-level.',
  },
  {
    id: 'm02-dch-g4', type: 'num', kind: 'numerical',
    prompt: 'Lantern wants to receive $2.60 per can from natural and specialty grocers, where the distributor and the store together keep 38% of the shelf price. What shelf price is needed? Give it to the cent.',
    answer: 4.19, check: () => 2.60 / (1 - 0.38), unit: '$', places: 2, tol: 0.01,
    hints: ['Net price = shelf price × (1 − margin). Here you know the net price and need the shelf price.', 'Divide $2.60 by (1 − 0.38) = 0.62.'],
    wrong: [
      { value: 3.59, say: 'You added 38% to Lantern’s price, treating the margin as a markup. At $3.59 the trade would keep only $0.99, which is 27.6% of the shelf price, not 38%. Divide by 0.62 instead.' },
      { value: 6.84, say: 'You divided by 0.38, the trade’s share. Lantern’s share of the shelf price is 1 − 0.38 = 0.62.' },
    ],
    solution: 'Shelf price = target net price ÷ (1 − margin) = 2.60 ÷ 0.62 = $4.1935… ≈ $4.19. Check: 4.19 × 0.62 = $2.60. That is $0.40 above Summit Brew’s $3.79, which shows how hard it is to earn a high net price in a channel with a large margin.',
  },
];

export const independent = [
  {
    id: 'm02-dch-i1', type: 'num', kind: 'numerical',
    prompt: 'Lantern sells the organic single-origin can (cost of goods $0.88) through its own online shop for $3.99. Fulfilment costs $0.45 a can. What is Lantern’s gross margin per can?',
    answer: 2.66, check: () => 3.99 - 0.45 - 0.88, unit: '$', places: 2, tol: 0.01,
    wrong: [
      { value: 3.11, say: 'You left out fulfilment. Selling direct removes the trade margin but not the cost of packing and delivering each can.' },
      { value: 3.54, say: 'That is the net price after fulfilment. Subtract the $0.88 cost of goods as well.' },
    ],
    solution: 'Net price = 3.99 − 0.45 = $3.54. Gross margin = 3.54 − 0.88 = $2.66 a can (before the online shop’s $6,000 a year of running cost).',
  },
  {
    id: 'm02-dch-i2', type: 'classify', kind: 'conceptual',
    prompt: 'Which distribution intensity does each producer use?',
    items: [
      'A new chewing gum placed at every supermarket checkout, petrol station and kiosk that will take it.',
      'A luxury watchmaker that appoints one authorised dealer per city.',
      'A running-shoe brand sold through specialist running shops and a few department stores.',
      'Lantern’s first plan: supermarkets, natural grocers and its own cafés and online shop, but not convenience stores.',
      'A bottled-water brand in every grocery, convenience store and vending machine it can reach.',
      'A boat builder that gives a single dealer the rights to each stretch of coast.',
    ],
    categories: ['Intensive', 'Selective', 'Exclusive'],
    answer: [0, 2, 1, 1, 0, 2],
    feedback: {
      2: 'The brand chooses outlets that can advise runners and present the shoe well, and leaves out others that would stock it: selective.',
      3: 'Lantern deliberately leaves out convenience stores, which would stock it, so this is selective, not intensive.',
      5: 'One dealer per area is exclusive distribution: the dealer invests in the brand because no nearby rival can sell it.',
    },
    solution: 'Chewing gum and bottled water: intensive (shoppers won’t search for one brand). Running shoes and Lantern’s first plan: selective (some suitable outlets, not all). The watchmaker and the boat builder: exclusive (one outlet per area).',
  },
  {
    id: 'm02-dch-i3', type: 'mc', kind: 'conceptual',
    prompt: 'Lantern’s online shop starts selling 12-packs at a price that works out at $2.99 a can, while supermarkets sell single cans at $3.49. A supermarket buyer tells Lantern that the can will move to the bottom shelf. What is this?',
    options: [
      'Vertical channel conflict: a dispute between members at different levels of the channel.',
      'Horizontal channel conflict: a dispute between two members at the same level of the channel.',
      'Not a channel conflict: Lantern is free to set its own online prices.',
      'A logistics problem, because the online shop delivers the 12-packs straight to customers’ homes.',
    ],
    answer: 0,
    feedback: {
      1: 'Horizontal conflict is between members at the same level, such as two supermarket chains. Here a producer and a retailer, at different levels, disagree.',
      2: 'Lantern can set its online prices, but the retailer can respond by reducing its support: that is exactly what channel conflict looks like.',
      3: 'Delivery isn’t the issue. The dispute is about prices and who wins the shopper’s purchase.',
    },
    solution: 'The producer (Lantern) and a retailer (the supermarket) are at different levels of the channel and disagree about prices: vertical conflict. Lantern could avoid it by keeping online prices in line with the shelf, or by selling different products online (for example subscriptions or gift packs).',
  },
  {
    id: 'm02-dch-i4', type: 'num', kind: 'numerical',
    prompt: 'A distributor keeps 12% of the price it sells to stores at, and the stores keep 30% of the shelf price. What share of the shelf price do the distributor and the stores keep together? Give a percentage to one decimal place.',
    answer: 38.4, check: () => (1 - (1 - 0.12) * (1 - 0.30)) * 100, unit: '%', places: 1, tol: 0.05,
    wrong: [
      { value: 42, say: 'You added the two margins. The distributor’s 12% is a share of a smaller price (what the store pays), so the margins compound: 1 − 0.88 × 0.70.' },
      { value: 61.6, say: 'That is the producer’s share of the shelf price, 0.88 × 0.70. The trade keeps the rest.' },
    ],
    solution: 'Of each $1 of shelf price the store keeps $0.30 and pays $0.70. The distributor keeps 12% of $0.70 = $0.084 and the producer receives 0.70 × 0.88 = $0.616. Combined margin = 1 − 0.616 = 0.384, or 38.4%.',
  },
  {
    id: 'm02-dch-i5', type: 'num', kind: 'applied',
    prompt: 'Lantern is considering the classic-blend can (cost of goods $0.58) in three flavours in supermarkets at $3.49. The supermarket margin is 32% and the listing fee is $9,000 per SKU per year. How many cans a year must supermarkets sell just to cover the listing fees? Round up to a whole can.',
    answer: 15057, check: () => Math.ceil((9000 * 3) / (3.49 * (1 - 0.32) - 0.58)), unit: 'cans', places: 0, tol: 1,
    wrong: [
      { value: 5019, say: 'That covers one flavour. Three flavours pay three fees: $27,000.' },
      { value: 11378, say: 'You divided by the net price. Each can also costs $0.58 to make, so only the gross margin is available to pay fees.' },
      { value: 7737, say: 'You divided by the shelf price. Lantern receives only the net price after the 32% trade margin, and then pays the cost of goods.' },
    ],
    solution: 'Net price = 3.49 × 0.68 = $2.3732; gross margin = 2.3732 − 0.58 = $1.7932 a can. Fees = 3 × 9,000 = $27,000. Cans = 27,000 ÷ 1.7932 = 15,056.9, so 15,057 cans, about 0.7% of the 2,160,000 cans supermarkets sell a year, before any promotion or the $12,000 three-flavour production cost.',
  },
  {
    id: 'm02-dch-i6', type: 'short', kind: 'applied',
    prompt: 'Suppose Lantern decided to launch the organic single-origin can (cost of goods $0.88, taste score 8.5) at $3.99 with one flavour and a promotion budget only half the size of the first plan’s. Recommend which channels to use at launch and which to add later. Support your recommendation with the gross margin per can and fee payback in each channel, and with the fit between each channel and the product.',
    rubric: [
      'Calculates gross margin per can at $3.99 for the channels considered (about $1.83 supermarkets, $1.51 convenience, $1.59 natural, $2.66 direct).',
      'Uses the fees: cans needed to cover each channel’s fixed cost (about 4,910 supermarkets, 2,643 convenience, 1,255 natural, 2,256 direct).',
      'Judges fit: natural grocers’ shoppers pay for quality and provenance; a $3.99 organic can sits above Summit Brew’s $3.79, which matters most where shoppers compare prices.',
      'Recognises that a smaller promotion budget argues for fewer channels, so support is not spread thin.',
      'Gives a staged plan with a condition for expanding (for example sales per store per week), and mentions keeping direct prices consistent to avoid conflict.',
    ],
    model: 'Gross margins per can at $3.99 with the $0.88 organic liquid: supermarkets 3.99 × 0.68 − 0.88 = $1.83; convenience 3.99 × 0.60 − 0.88 = $1.51; natural grocers 3.99 × 0.62 − 0.88 = $1.59; direct 3.99 − 0.45 − 0.88 = $2.66. Fixed costs are covered by about 4,910, 2,643, 1,255 and 2,256 cans respectively. I would launch in natural and specialty grocers and Lantern’s own cafés and online shop. Natural grocers are cheap to enter, their shoppers value exactly what an organic single-origin can offers, and the direct channel earns the most per can and gives Lantern customer data. With half the promotion budget, adding supermarkets now would spread sampling thin across the largest channel, where shoppers compare prices and $3.99 is above Summit’s $3.79. I would add supermarkets once natural-grocer sales per store per week show the can sells at $3.99, and leave convenience stores, with the thinnest margin, for later still. Online prices should stay in line with the shelf so that the retail partners aren’t undercut. (The simulator would earn more in year 1 by adding supermarkets too: starting selectively is a judgement about positioning and risk, not what the year-1 numbers favour.)',
  },
];

export const check = [
  {
    id: 'm02-dch-k1', type: 'mc', kind: 'conceptual',
    prompt: 'A founder says: “If we cut out the distributor and deliver to stores ourselves, we keep the distributor’s share of the price.” What is the main flaw in this reasoning?',
    options: [
      'The distributor’s work (stocking, delivering, selling to stores, giving credit) must still be done and paid for, now by the founder.',
      'Distributors’ margins are set by law, so the founder can’t remove them by delivering to stores directly.',
      'Stores never buy directly from producers, so the founder would lose every shop that stocks the product.',
      'There is no flaw: cutting out an intermediary always raises the producer’s profit by the whole of its margin.',
    ],
    answer: 0,
    feedback: {
      1: 'Trade margins are negotiated, not legally fixed. The real issue is that the functions remain.',
      2: 'Many stores do buy directly from some producers (a one-level channel). The question is whether the producer can do the distributor’s work more cheaply.',
      3: 'Removing an intermediary only raises profit if the producer can perform its functions for less than the margin it was paid, and without losing reach.',
    },
    solution: 'You can eliminate an intermediary but not its functions. The founder would gain the margin but take on the costs of storage, trucks, sales calls, credit and collection, and might reach fewer stores. It pays only if those costs are lower than the margin saved.',
  },
  {
    id: 'm02-dch-k2', type: 'num', kind: 'numerical',
    prompt: 'If Lantern’s can sold for $3.79 in supermarkets, where the trade keeps 32% of the shelf price, what would Lantern’s net price per can be? Give it to the cent.',
    answer: 2.58, check: () => 3.79 * (1 - 0.32), unit: '$', places: 2, tol: 0.01,
    wrong: [
      { value: 1.21, say: 'That is the trade’s share of the shelf price. Lantern receives the other 68%.' },
      { value: 5.00, say: 'You added 32% to the shelf price. The margin comes out of the shelf price.' },
    ],
    solution: 'Net price = 3.79 × (1 − 0.32) = 3.79 × 0.68 = $2.5772 ≈ $2.58.',
  },
  {
    id: 'm02-dch-k3', type: 'num', kind: 'numerical',
    prompt: 'At $3.49 Lantern nets $2.37 a can from supermarkets. What shelf price would give it the same $2.37 a can from convenience stores, where the trade keeps 40%? Give it to the cent.',
    answer: 3.95, check: () => 2.37 / (1 - 0.40), unit: '$', places: 2, tol: 0.01,
    wrong: [
      { value: 3.32, say: 'You added 40% to $2.37 (a markup). The trade keeps 40% of the shelf price, so divide by 0.60.' },
      { value: 3.49, say: 'At $3.49 a convenience store leaves Lantern only $2.09, because its margin is higher than the supermarkets’.' },
    ],
    solution: 'Shelf price = net price ÷ (1 − margin) = 2.37 ÷ 0.60 = $3.95. Check: 3.95 × 0.60 = $2.37. A higher-margin channel needs a higher shelf price for the producer to earn the same per can.',
  },
  {
    id: 'm02-dch-k4', type: 'mc', kind: 'applied',
    prompt: 'Lantern is planning the organic single-origin can at $3.99 with a premium, provenance-led positioning and a small launch budget. Which channel strategy fits best?',
    options: [
      'Start selectively in natural grocers and Lantern’s own cafés and online shop, adding supermarkets once the can sells well.',
      'Go intensive from day one: every supermarket, convenience store and natural grocer, plus the online shop, to build reach fast.',
      'Sell only through convenience stores, where shoppers compare prices less and buy chilled cans on impulse.',
      'Sell only through supermarkets, because they have the most shoppers and sell 45% of the category’s cans.',
    ],
    answer: 0,
    feedback: {
      1: 'Intensive distribution would pay every listing fee and spread a small budget across hundreds of stores where nobody knows the brand, and it clashes with a premium, provenance-led position.',
      2: 'Convenience stores take the largest margin (40%) and their shoppers buy chilled singles on impulse, not organic provenance; a $3.99 can from an unknown brand would struggle there.',
      3: 'Supermarkets have reach, but their shoppers compare prices and $3.99 is above Summit Brew’s $3.79. Without strong promotion, an unknown premium can is easy to overlook there.',
    },
    solution: 'A selective start fits the product, the price and the budget: natural grocers’ shoppers pay for quality and provenance, their fee is low, and the direct channel has the highest margin. Wider distribution can follow once sales per store show the can sells. If you try this plan in the simulator, wider distribution sells more cans and earns more in year 1: the model counts volume and margin but not the brand’s image or the risk of under-supported listings, which is why the choice is a judgement rather than a calculation.',
  },
  {
    id: 'm02-dch-k5', type: 'multi', kind: 'conceptual',
    prompt: 'Which of these are functions that channel intermediaries perform? Select all that apply.',
    options: [
      'Holding stock and bearing the risk that it doesn’t sell',
      'Breaking pallets into cases and single units for shoppers',
      'Financing: paying suppliers before their own customers have paid',
      'Passing information about what sells, where and at what price back to producers',
      'Setting the producer’s cost of goods',
      'Deciding the product’s recipe',
    ],
    answer: [0, 1, 2, 3],
    feedback: {
      4: 'Cost of goods depends on the producer’s ingredients, packaging and production, not on the channel.',
      5: 'The recipe is a product decision. Intermediaries may pass on what customers say about it, but they don’t decide it.',
    },
    solution: 'Intermediaries perform transactional functions (buying, selling, bearing risk), logistical functions (storing, transporting, breaking bulk and building assortments) and facilitating functions (financing and information). Product design and production costs are the producer’s decisions.',
  },
  {
    id: 'm02-dch-k6', type: 'num', kind: 'applied',
    prompt: 'Natural and specialty grocers charge Lantern $2,000 a year to list one flavour. The can sells there for $3.49, the trade keeps 38% and the single-origin liquid costs $0.74 a can. How many cans a year must natural grocers sell to cover the listing fee? Round up to a whole can.',
    answer: 1405, check: () => Math.ceil(2000 / (3.49 * (1 - 0.38) - 0.74)), unit: 'cans', places: 0, tol: 1,
    wrong: [
      { value: 573, say: 'You divided the fee by the shelf price, but Lantern doesn’t keep the shelf price: it keeps the gross margin after the trade margin and the cost of goods.' },
      { value: 925, say: 'You divided by the net price. Each can also costs $0.74 to make, so use the gross margin of about $1.42.' },
    ],
    solution: 'Gross margin per can = 3.49 × 0.62 − 0.74 = $1.4238. Cans = 2,000 ÷ 1.4238 = 1,404.7, so 1,405 cans, about 0.2% of the 720,000 cans natural grocers sell a year.',
  },
];
