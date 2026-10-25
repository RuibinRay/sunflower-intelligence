// project.js — M02 applied project: a launch plan for Lantern Cold Brew (fictional), built and tested in the
// Marketing Mix Simulator. Every market figure comes from market.js (through mixsim.js, which re-exports it).
// Questions never depend on the student's own choices: they use market-file calculations, or simulator estimates
// for fixed plans (the default plan and named variations), which `verify` recomputes with the engine.
import * as X from '../../../core/mixsim.js?v=13';

const { CATEGORY, TIERS, CHANNELS, LANTERN, DEFAULT_PLAN: D } = X;
const TIER = Object.fromEntries(TIERS.map((t) => [t.id, t]));
const CH = Object.fromEntries(CHANNELS.map((c) => [c.id, c]));
/** Lantern’s gross margin per can in a channel: shelf price less the trade margin (or fulfilment), less cost of goods. */
const gm = (ch, price, tier) => (ch === 'direct' ? price - CH.direct.fulfil : price * (1 - CH[ch].margin)) - TIER[tier].cogs;
const year = (plan) => X.simulate(plan).year;
const channel = (plan, id) => X.simulate(plan).byChannel.find((c) => c.id === id);
const promo = (k, v) => ({ ...D, promotion: { ...D.promotion, [k]: v } });

// The fixed plans the questions refer to.
const AT_379 = { ...D, price: 3.79 };
const WITH_CONV = { ...D, channels: [...D.channels, 'convenience'] };
const ORGANIC = { tier: 'organic', range: 'one', price: 3.79, channels: ['supermarket', 'natural', 'direct'], promotion: { digital: 50000, sampling: 40000, trade: 10000, pr: 20000 } };
const VALUE = { tier: 'classic', range: 'one', price: 2.79, channels: ['supermarket', 'convenience'], promotion: { digital: 40000, sampling: 20000, trade: 40000, pr: 0 } };
/** Fixed costs of the default plan’s decisions with the whole promotion budget treated as fixed (as in the lessons). */
const FC_DEFAULT = CH.supermarket.listing + CH.natural.listing + CH.direct.fixed + 120000 + LANTERN.overhead;
const W3 = ['supermarket', 'natural', 'direct'];
const avg3 = (price, tier) => W3.reduce((a, c) => a + CH[c].volume * gm(c, price, tier), 0) / W3.reduce((a, c) => a + CH[c].volume, 0);
const pct = (a, b) => (b / a - 1) * 100;

const MARKET_TABLE = {
  table: {
    caption: 'Harbour City’s ready-to-drink coffee market (fictional market file)',
    head: ['Channel', 'Share of category cans', 'Trade keeps', 'Listing fee per flavour a year', 'Brands on the shelf'],
    rows: [
      ['Supermarkets', '45%', '32% of shelf price', '$9,000', 'Summit, Daily Grind, Arcadia'],
      ['Convenience stores', '30%', '40%', '$4,000', 'Summit, Daily Grind'],
      ['Natural and specialty grocers', '15%', '38%', '$2,000', 'Summit, Arcadia'],
      ['Lantern cafés and online shop', '10%', 'none ($0.45 a can fulfilment; $6,000 a year)', '—', 'Lantern only'],
    ],
    align: ['l', 'r', 'l', 'r', 'l'],
  },
};

export default {
  title: 'Launch plan for Lantern Cold Brew',
  brief: [
    { case: 'Ana Lim is about to launch Lantern Cold Brew, a 250 ml can of cold brew, in Harbour City. She has asked you for a launch plan: which liquid and range, what price, which channels and how to spend the promotion budget, with a one-page recommendation she can take to her board. Lantern, Harbour City, its retailers and its competitors are all fictional, and so is every figure.' },
    { p: 'The market file sets the facts. About 4,800,000 cans of ready-to-drink coffee are sold in Harbour City a year, 25% more than an average quarter in the third quarter (summer) and 15% fewer in the first and fourth. Three brands share the shelf: Summit Brew (premium, $3.79, taste score 8, known to 60% of category buyers), Arcadia Coffee (mid-priced, $2.89, score 6, 50%) and Daily Grind RTD (value, $2.29, score 4.5, 75%). Only 12% of category buyers know Lantern. Lantern can use the Classic blend (score 6, $0.58 a can), the Single-origin (7.5, $0.74) or the Organic single-origin (8.5, $0.88), in one flavour or three (three add $12,000 a year of production cost). Launch overhead is $60,000 a year whatever you choose.' },
    MARKET_TABLE,
    { p: 'You will work through the plan one decision at a time in the Marketing Mix Simulator, check its numbers by hand, test your whole plan against two alternatives and write the recommendation. Your plan and the simulator’s results are saved in this browser as you go, so you can use them in the write-up.' },
    { callout: 'warn', title: 'Simulated, not forecast', html: 'The simulator is a teaching model with invented coefficients. It is good for comparing plans on the same basis and finding trade-offs; it is not a forecast of what a real launch would sell. Label its numbers as simulated estimates in everything you write.' },
  ],
  deliverables: [
    'A launch plan for Lantern Cold Brew: liquid and range, shelf price, channels, and a promotion budget split across the four vehicles.',
    'Hand calculations that support it: the price build-up in each chosen channel, the break-even volume and the volume change any price move would need.',
    'A comparison of your plan with at least two alternatives on the same measures, recorded from the simulator.',
    'A one-page recommendation to Ana (about 350–450 words) that states the plan, the evidence, the risks and what to test before committing the whole budget.',
  ],
  stages: [
    // ------------------------------------------------------------ 1
    {
      id: 'situation', title: 'The situation and the target',
      html: '<p>Start where any plan starts: who the can is for and what the market looks like. Re-read the brief and the market table, then answer the questions. Write down, in a sentence each, the target market and the positioning you will plan for. The course’s working answer is commuters and office workers who buy coffee when they are out and care how it tastes, with Lantern positioned as café-quality cold brew priced below a café drink and close to Summit; you may choose a different one if you can defend it.</p>',
      items: [
        {
          id: 'm02-pj-s1', type: 'num', kind: 'numerical',
          prompt: 'Lantern’s distributor needs to plan stock for summer. How many cans of ready-to-drink coffee, all brands, does the market file imply are sold through supermarkets in the third quarter?',
          answer: 675000, check: () => CATEGORY.cansPerYear / 4 * CATEGORY.seasonality[2] * CH.supermarket.volume, unit: 'cans', places: 0, tol: 0.5,
          wrong: [
            { value: 540000, say: 'That is an average quarter (4,800,000 ÷ 4 × 0.45). The third quarter sells 25% more: multiply by its seasonal index, 1.25.' },
            { value: 1500000, say: 'That is the third quarter for all channels. Supermarkets sell 45% of the category’s cans.' },
            { value: 2160000, say: 'That is the supermarkets’ whole year. Divide by four quarters and apply the third-quarter index.' },
          ],
          solution: 'Average quarter = 4,800,000 ÷ 4 = 1,200,000 cans. Third quarter = 1,200,000 × 1.25 = 1,500,000. Supermarkets’ share = 1,500,000 × 0.45 = 675,000 cans.',
        },
        {
          id: 'm02-pj-s2', type: 'mc', kind: 'applied',
          prompt: 'Which statement of Lantern’s launch problem is best supported by the market file?',
          options: [
            'Lantern’s first problem is attention and trial: only 12% of category buyers know it, against 50% to 75% for the established brands, so the plan must get the can noticed and tasted where it is sold, at a price that supports its positioning.',
            'Lantern’s first problem is quality: all three of its liquids taste worse than every competitor’s.',
            'Lantern has no problem: a better liquid always wins share on the shelf.',
            'Lantern’s first problem is price: it must undercut Daily Grind’s $2.29 to sell any cans.',
          ],
          answer: 0,
          feedback: {
            1: 'The Single-origin (7.5) beats Arcadia (6) and Daily Grind (4.5), and the Organic (8.5) beats Summit (8).',
            2: 'Shoppers who don’t know a brand, or can’t taste it before buying, can’t reward its quality. Awareness and trial come first.',
            3: 'Undercutting a value brand would contradict a café-quality positioning and leave Lantern little per can: at $2.29 a supermarket can of Single-origin earns it only about $0.82.',
          },
          solution: 'The market file shows a quality advantage (taste scores of 7.5 or 8.5 are available) but a large awareness gap (12% against 50–75%). A new brand in a category with three established names must win attention and trial, through promotion and through being on the right shelves, without a price that undercuts the positioning.',
        },
        {
          id: 'm02-pj-s3', type: 'multi', kind: 'conceptual',
          prompt: 'Which statements about Lantern’s market are true according to the market file? Select all that apply.',
          options: [
            'Daily Grind RTD is not sold in natural and specialty grocers.',
            'Selling through its own cafés and online shop, Lantern pays no trade margin but pays $0.45 a can for fulfilment and $6,000 a year to run the channel.',
            'Convenience stores keep the largest share of the shelf price of any channel.',
            'Natural and specialty grocers sell more of the category’s cans than convenience stores.',
            'Summit Brew is known to more category buyers than Daily Grind RTD.',
          ],
          answer: [0, 1, 2],
          feedback: {
            3: 'Natural grocers sell 15% of category cans; convenience stores sell 30%.',
            4: 'Summit is known to 60% of category buyers, Daily Grind to 75%.',
          },
          solution: 'Daily Grind is stocked only in supermarkets and convenience stores. The direct channel has no trade margin but costs $0.45 a can and $6,000 a year. Convenience stores keep 40%, more than supermarkets (32%) and natural grocers (38%). Natural grocers are the smaller retail channel (15% against 30%), and Daily Grind (75%) is better known than Summit (60%).',
        },
      ],
    },
    // ------------------------------------------------------------ 2
    {
      id: 'product-price', title: 'Choose the product and the price',
      html: '<p>The simulator below fixes the channels (supermarkets, natural grocers and Lantern’s own cafés and online shop) and the promotion budget ($120,000) at the default plan, so that you can see what the liquid, the range and the price do on their own. Try each liquid at several prices. Watch contribution and profit after overhead, not only cans: a plan that sells more cans can earn less. Choose a liquid, a range and a price, and write down why. Then check the economics by hand.</p>',
      tool: { kind: 'mix', lock: { channels: true, promotion: true }, show: ['units', 'share', 'revenue', 'margin', 'contribution', 'elasticity'] },
      items: [
        {
          id: 'm02-pj-p1', type: 'num', kind: 'numerical',
          prompt: 'Suppose Lantern chose the Organic single-origin liquid ($0.88 a can) at $3.79, one flavour, with the default channels and the $120,000 promotion budget. Fixed costs are the listing fees ($9,000 in supermarkets, $2,000 in natural grocers), the direct channel’s $6,000, the promotion budget (all treated as fixed) and the $60,000 overhead. Assume Lantern’s cans sell across the three channels in proportion to their shares of category volume (45%, 15% and 10%). How many cans a year does the plan need to break even? Round up to a whole can.',
          answer: 112095, check: () => Math.ceil(FC_DEFAULT / avg3(3.79, 'organic')), unit: 'cans', places: 0, tol: 0.5,
          wrong: [
            { value: 103824, say: 'You used the Single-origin cost of $0.74. The Organic liquid costs $0.88 a can.' },
            { value: 105030, say: 'You took a simple average of the three channels’ contributions. Weight them by volume: 45, 15 and 10 of every 70 cans.' },
            { value: 67698, say: 'You divided by the shelf price minus the cost. Lantern keeps only 68% or 62% of the shelf price in the stores, and pays $0.45 a can to sell direct.' },
          ],
          solution: 'Fixed costs = 9,000 + 2,000 + 6,000 + 120,000 + 60,000 = $197,000. Contribution per can at $3.79: supermarkets 3.79 × 0.68 − 0.88 = $1.6972; natural grocers 3.79 × 0.62 − 0.88 = $1.4698; direct 3.79 − 0.45 − 0.88 = $2.46. Weighted average = (0.45 × 1.6972 + 0.15 × 1.4698 + 0.10 × 2.46) ÷ 0.70 = 1.23021 ÷ 0.70 ≈ $1.7574. Break-even = 197,000 ÷ 1.7574 ≈ 112,094.7, so 112,095 cans. The simulator’s estimate for this plan differs a little, because it treats trade promotions as discounts on promoted cans and works out its own channel mix.',
        },
        {
          id: 'm02-pj-p2', type: 'num', kind: 'numerical',
          prompt: 'With the Single-origin liquid and one flavour (the default plan), the simulator’s estimate is 198,995 cans in year 1 at $3.49 and 175,975 cans at $3.79. Set both prices to see them. What is the midpoint price elasticity between these two points? Give two decimal places.',
          answer: -1.49, check: () => { const q1 = year(D).units, q2 = year(AT_379).units; return ((q2 - q1) / ((q1 + q2) / 2)) / ((3.79 - 3.49) / ((3.79 + 3.49) / 2)); }, unit: '', places: 2, tol: 0.01,
          wrong: [
            { value: -1.35, say: 'You used the starting values (the point formula). The midpoint formula divides each change by the average of the two values.' },
            { value: -1.44, say: 'That is close to the simulator’s own elasticity at $3.49, a point measure at one price. The question asks for the midpoint (arc) elasticity between the two readings.' },
            { value: 1.49, say: 'Cans fall as the price rises, so the elasticity is negative.' },
          ],
          solution: '%ΔQ = (175,975 − 198,995) ÷ 187,485 ≈ −12.28%. %ΔP = 0.30 ÷ 3.64 ≈ 8.24%. E ≈ −12.28 ÷ 8.24 ≈ −1.49: elastic over this range. The simulator shows a point elasticity at each price (about −1.44 at $3.49 and −1.56 at $3.79); the arc value lies between them, as it should.',
        },
        {
          id: 'm02-pj-p3', type: 'num', kind: 'applied',
          prompt: 'Moving the Single-origin can (cost of goods $0.74) from $3.49 to $3.79 in natural and specialty grocers, which keep 38% of the shelf price: what percentage change in natural-grocer volume would leave Lantern’s contribution there unchanged? Use a minus sign for a fall and give two decimal places.',
          answer: -11.55, check: () => { const cm = gm('natural', 3.49, 'single'); const dP = (3.79 - 3.49) * (1 - CH.natural.margin); return -dP / (cm + dP) * 100; }, unit: '%', places: 2, tol: 0.05,
          wrong: [
            { value: -17.40, say: 'You used the $0.30 shelf-price change. Lantern receives 62% of it: 0.30 × 0.62 = $0.186.' },
            { value: -13.06, say: 'You divided by the old contribution per can. After the rise each can contributes 1.4238 + 0.186 = $1.6098.' },
          ],
          solution: 'Old contribution per can = 3.49 × 0.62 − 0.74 = $1.4238. Lantern’s net price rises by 0.30 × 0.62 = $0.186, to a contribution of $1.6098. Required change = −0.186 ÷ 1.6098 ≈ −11.55%: if natural-grocer volume falls by less than about 11.55%, the rise adds contribution there. (For supermarkets the same test gives −11.10%.)',
        },
        {
          id: 'm02-pj-p4', type: 'mc', kind: 'applied',
          prompt: 'In the simulator, moving the default plan from $3.49 to $3.79 changes the simulator’s estimate of Lantern’s supermarket cans by about −14.19% and of its natural-grocer cans by about −8.83%. The rise can absorb volume falls of 11.10% in supermarkets and 11.55% in natural grocers before contribution drops. What follows?',
          options: [
            'The rise loses contribution in supermarkets, where volume falls by more than it can absorb, and gains it in natural grocers, where volume falls by less; overall, the simulator’s estimate of profit barely moves.',
            'The rise gains contribution in every channel, because every can earns more.',
            'The rise loses contribution in every channel, because volume falls everywhere.',
            'Nothing follows, because the simulator’s numbers aren’t forecasts.',
          ],
          answer: 0,
          feedback: {
            1: 'Each can earns more, but in supermarkets 14.19% fewer cans more than offsets that: the rise can only absorb an 11.10% fall.',
            2: 'Volume falls everywhere, but in natural grocers it falls by less than the 11.55% the higher contribution per can can absorb.',
            3: 'Simulated estimates aren’t forecasts, but they can still be compared with a hand calculation to see where a trade-off lies; that is what the model is for.',
          },
          solution: 'Compare each channel’s volume change with its required change. Supermarkets: −14.19% is worse than −11.10%, so contribution falls. Natural grocers: −8.83% is better than −11.55%, so contribution rises. The two roughly cancel: the simulator’s estimate of profit after overhead goes from $122,956 to $121,618. Price sensitivity differs by channel, so one shelf price is a compromise between them.',
        },
        {
          id: 'm02-pj-p5', type: 'mc', kind: 'conceptual',
          prompt: 'Whatever liquid and price you choose, the simulator shows Lantern’s price elasticity as larger in magnitude in supermarkets than in natural grocers. Which explanation fits the market file and the model?',
          options: [
            'Supermarket shoppers compare prices on the shelf, so price weighs more in their choice; natural-grocer shoppers weigh quality and provenance more and price less.',
            'Supermarkets keep a smaller trade margin, so Lantern’s net price changes more there.',
            'Lantern sells more cans in supermarkets, and bigger volumes always mean more elastic demand.',
            'Natural grocers don’t stock any competitor, so shoppers there have no alternative.',
          ],
          answer: 0,
          feedback: {
            1: 'Elasticity measures how shoppers respond to the shelf price they see. The trade margin changes what Lantern keeps per can, not how shoppers react.',
            2: 'Volume itself doesn’t make demand elastic; what matters is how much shoppers weigh price against the alternatives.',
            3: 'Natural grocers stock Summit Brew and Arcadia Coffee.',
          },
          solution: 'The market file describes supermarket shoppers as comparing prices on the shelf and natural-grocer shoppers as paying for quality and provenance. The model reflects this with a larger price coefficient for supermarkets (0.55 against 0.36) and a larger quality coefficient for natural grocers, so the same price change moves supermarket volume by a larger percentage.',
        },
      ],
    },
    // ------------------------------------------------------------ 3
    {
      id: 'channels', title: 'Choose the channels',
      html: '<p>Now the promotion budget is fixed at the default plan and everything else is open. Set the liquid, range and price you chose in stage 2, then try different combinations of channels. For each, look at the by-channel table: cans, net price, contribution and the share Lantern wins. Build the price build-up for each channel you keep, by hand, and decide which channels to launch in and which to leave for later. Remember the model’s limits: it doesn’t include retailers dropping slow sellers, or the extra work each channel brings.</p>',
      tool: { kind: 'mix', lock: { promotion: true } },
      items: [
        {
          id: 'm02-pj-c1', type: 'num', kind: 'numerical',
          prompt: 'Suppose Lantern sold the Single-origin can (cost of goods $0.74) at $3.79 in three flavours. Convenience stores keep 40% of the shelf price and charge $4,000 per flavour a year to list it. How many cans a year would convenience stores need to sell just to cover the listing fees? Round up to a whole can.',
          answer: 7823, check: () => Math.ceil(3 * CH.convenience.listing / gm('convenience', 3.79, 'single')), unit: 'cans', places: 0, tol: 0.5,
          wrong: [
            { value: 2608, say: 'That covers one flavour. Listing fees are charged per flavour (per SKU): three flavours pay $12,000.' },
            { value: 5278, say: 'You divided by the net price ($2.274). Each can also costs $0.74 to make, so divide by the gross margin, $1.534.' },
            { value: 8863, say: 'You used the $3.49 price. At $3.79 Lantern keeps 3.79 × 0.60 − 0.74 = $1.534 a can.' },
          ],
          solution: 'Gross margin per can = 3.79 × (1 − 0.40) − 0.74 = 2.274 − 0.74 = $1.534. Fees = 3 × 4,000 = $12,000. Cans = 12,000 ÷ 1.534 ≈ 7,822.7, so 7,823 a year, before any promotion or the range’s own $12,000 production cost.',
        },
        {
          id: 'm02-pj-c2', type: 'multi', kind: 'applied',
          prompt: 'Set the default plan (Single-origin, one flavour, $3.49) and add convenience stores to its three channels. According to the simulator’s estimates, which of these happen? Select all that apply.',
          options: [
            'Lantern’s total cans rise.',
            'Lantern’s supermarket cans fall.',
            'Contribution per can falls.',
            'Profit after overhead falls.',
            'Listing fees rise by $12,000 a year.',
            'Awareness at the end of the year rises.',
          ],
          answer: [0, 1, 2],
          feedback: {
            3: 'In the simulator profit after overhead rises, from about $122,956 to about $172,330: the extra cans more than pay for the fee and the lower margin.',
            4: 'One flavour pays one listing fee: $4,000 a year in convenience stores.',
            5: 'In the model awareness depends only on the digital and PR budgets, which haven’t changed.',
          },
          solution: 'The simulator’s estimates: total cans rise from about 198,995 to about 239,729; supermarket cans fall from about 92,139 to about 86,867 (and natural-grocer cans from about 87,075 to about 82,667); contribution per can falls from about $1.51 to about $1.47, because convenience stores keep 40%; listing fees rise by $4,000; awareness is unchanged at about 22%; profit after overhead rises to about $172,330.',
        },
        {
          id: 'm02-pj-c3', type: 'mc', kind: 'conceptual',
          prompt: 'With the default promotion budget ($40,000 of sampling and $20,000 of trade promotions among it), adding a retail channel in the simulator always lowers Lantern’s cans in the retail channels it already uses. Why?',
          options: [
            'The same sampling and trade budgets are spread over more stores, so each store gets less support and Lantern’s appeal at the shelf rises less.',
            'The new channel’s shoppers stop buying in the old channels (cannibalisation).',
            'Competitors cut their prices when Lantern enters a new channel.',
            'Awareness falls when the brand is spread across more channels.',
          ],
          answer: 0,
          feedback: {
            1: 'The model leaves out cannibalisation between channels: each channel’s shoppers are separate.',
            2: 'Competitors don’t react in this model; their prices and awareness stay fixed.',
            3: 'Awareness depends only on advertising and PR spending in the model, not on the channels.',
          },
          solution: 'In the model, sampling works through a stock of trial divided by the coverage of the retail channels chosen, and the trade budget pays for promoted weeks across every retail channel. Adding a channel raises coverage, so the same budget does less in each store. This is a real trade-off too: support spread thinly can leave every listing under-supported.',
        },
        {
          id: 'm02-pj-c4', type: 'mc', kind: 'applied',
          prompt: 'The simulator’s estimate says that adding convenience stores to the default plan raises profit after overhead by about $49,000, yet the course’s channel lesson calls convenience stores the closest call and stops short of a full launch in them. What is the most defensible conclusion for Lantern?',
          options: [
            'Treat the gain as a hypothesis worth testing: the model assumes full distribution from day one and leaves out the extra selling and delivery work, retailers dropping slow sellers, shoppers who would have bought Lantern in another channel anyway and how competitors would respond, so pilot convenience stores in one chain and check sales per store per week before rolling out.',
            'Add convenience stores everywhere at launch: the model shows they pay.',
            'Ignore the simulator: a lesson’s advice always outweighs numbers.',
            'Drop supermarkets instead, since convenience stores add more profit.',
          ],
          answer: 0,
          feedback: {
            1: 'The gain is a simulated estimate from invented coefficients. It is worth acting on only once it has been checked against evidence from the real channel.',
            2: 'The lesson’s reasoning and the model’s estimate are both worth weighing. When they disagree, find out which assumption drives the difference and test it.',
            3: 'The simulator says the opposite: removing supermarkets would remove the channel that sells most of Lantern’s cans.',
          },
          solution: 'A model is a way to find trade-offs, not a verdict. This one already counts the 40% margin, the $4,000 listing fee, Lantern’s low awareness against Summit’s and Daily Grind’s habitual buyers, and the sampling and trade budgets spread over more stores, and it still finds a gain. So those arguments alone don’t justify waiting. The case for caution rests on what the model leaves out: it counts Lantern as stocked in every convenience store from day one and charges nothing for the extra selling and delivery work; it can’t see a retailer delisting a slow seller; it ignores cannibalisation (some convenience buyers would otherwise have bought Lantern in a supermarket); and it holds competitors fixed. Whether those risks are worth about $49,000 of simulated profit is a judgement, and a pilot in one chain turns it into evidence.',
        },
      ],
    },
    // ------------------------------------------------------------ 4
    {
      id: 'promotion', title: 'Set the promotion budget and mix',
      html: '<p>This stage holds the product, the price and the channels at the default plan, so that everyone sees the same effect of promotion. Move each budget slider in turn and watch awareness, cans, contribution and profit after overhead. Ask what each vehicle does (ads and PR build awareness, sampling turns it into trial, trade promotions buy volume with margin) and where its returns start to fall. Then decide the budget and split for your own plan, and justify it by objective and task.</p>',
      tool: { kind: 'mix', lock: { tier: true, range: true, price: true, channels: true }, show: ['units', 'share', 'contribution', 'awareness', 'satisfaction'] },
      items: [
        {
          id: 'm02-pj-m1', type: 'num', kind: 'applied',
          prompt: 'With the default plan, the simulator’s estimate of profit after overhead is $122,956 with $50,000 of social and search ads and $72,769 with none (everything else unchanged). Treat the difference as the ads’ incremental effect, as a holdout test would. What is the marketing ROI of the $50,000? Give a percentage to one decimal place.',
          answer: 100.4, check: () => (year(D).profit - year(promo('digital', 0)).profit) / 50000 * 100, unit: '%', places: 1, tol: 0.1,
          wrong: [
            { value: 200.4, say: 'The profit difference already has the $50,000 taken off. Incremental contribution before the ad cost is 50,187 + 50,000 = $100,187, and ROI = (100,187 − 50,000) ÷ 50,000.' },
            { value: 69.0, say: 'That is the percentage change in profit. ROI compares the gain with the money spent to get it.' },
          ],
          solution: 'Difference in profit = 122,956 − 72,769 = $50,187, after paying for the ads. Incremental contribution before the ad cost = 50,187 + 50,000 = $100,187. ROI = (100,187 − 50,000) ÷ 50,000 ≈ 100.4%. In the model, with only 12% awareness to start from, advertising pays; in a real launch you would check this with a geographic or holdout test.',
        },
        {
          id: 'm02-pj-m2', type: 'mc', kind: 'applied',
          prompt: 'Ana’s finance adviser asks for $20,000 less promotion. Starting from the default plan, which single $20,000 cut does least damage to the simulator’s estimate of profit after overhead? Try each one.',
          options: [
            'Trade promotions from $20,000 to $0.',
            'Social and search ads from $50,000 to $30,000.',
            'In-store sampling and displays from $40,000 to $20,000.',
            'It makes no difference which vehicle is cut: a dollar is a dollar.',
          ],
          answer: 0,
          feedback: {
            1: 'Cutting the ads costs most: awareness falls and the simulator’s profit estimate drops to about $107,492.',
            2: 'At $40,000 sampling is already a little past the budget that earns the most in the simulator, so this cut costs little (profit about $121,771); but cutting trade promotions costs nothing at all in the model: profit rises.',
            3: 'Each vehicle works differently, with different returns at the margin, which is the reason to compare them.',
          },
          solution: 'The simulator’s estimates of profit after overhead: default $122,956; ads cut to $30,000, about $107,492; sampling cut to $20,000, about $121,771; trade promotions cut to $0, about $133,234. In the model the trade budget buys about 6,000 extra cans but gives away 20% of the price on every promoted can, so it costs more than it earns. The model doesn’t count repeat purchases by shoppers who first try the can on a deal, or the retailer support (displays, keeping the listing) that a few deals can buy, so a small trade budget may still be worth keeping for the listings. If you keep one, say what the simulator says it costs.',
        },
        {
          id: 'm02-pj-m3', type: 'mc', kind: 'conceptual',
          prompt: 'The simulator’s estimates for the default plan with sampling budgets of $0, $20,000, $40,000 and $60,000 are about 164,149, 185,194, 198,995 and 208,141 cans. What do they show?',
          options: [
            'Diminishing returns: each extra $20,000 of sampling buys fewer extra cans (about 21,045, then 13,801, then 9,146), so at some point the next $20,000 costs more than it earns.',
            'Constant returns: every $20,000 buys the same number of extra cans.',
            'Increasing returns: the more Lantern spends on sampling, the more each dollar earns.',
            'Sampling has no effect on sales.',
          ],
          answer: 0,
          feedback: {
            1: 'The gains shrink: about 21,045, then 13,801, then 9,146 cans for each extra $20,000.',
            2: 'Each step adds fewer cans than the one before, the opposite of increasing returns.',
            3: 'Sales rise with sampling; they just rise more slowly at higher budgets.',
          },
          solution: 'The extra cans per $20,000 fall from about 21,045 to 13,801 to 9,146. In the model sampling’s lift approaches a ceiling (+50% appeal at the shelf), so each dollar does less than the last. The simulator’s profit estimate peaks at about $30,000 to $35,000 of sampling (about $123,459) and falls to about $116,999 at $60,000. Budget by objective and task, and stop where the next task no longer pays.',
        },
        {
          id: 'm02-pj-m4', type: 'num', kind: 'numerical',
          prompt: 'The simulator’s estimate of Lantern’s revenue for the default plan, after trade margins and direct fulfilment, is $467,212. What percentage of that revenue is the plan’s $120,000 promotion budget? Give one decimal place.',
          answer: 25.7, check: () => 120000 / year(D).revenue * 100, unit: '%', places: 1, tol: 0.1,
          wrong: [
            { value: 37.5, say: 'You divided by gross profit ($319,956). The question asks about revenue.' },
            { value: 17.3, say: 'You valued the cans at the $3.49 shelf price. Lantern’s revenue is what it receives after the trade’s share and fulfilment.' },
          ],
          solution: '120,000 ÷ 467,212 × 100 ≈ 25.7%. A launch spends heavily relative to first-year sales because awareness has to be built before sales arrive, which is why a percentage-of-sales rule would starve it.',
        },
      ],
    },
    // ------------------------------------------------------------ 5
    {
      id: 'test', title: 'Test the plan against two alternatives',
      html: '<p>Everything is open now. Enter your full plan and record its results: cans, share, contribution, profit after overhead, break-even cans, awareness and satisfaction. Then build at least two alternatives that differ in a meaningful way (for example the default plan, a value plan and a premium plan) and record the same measures for each. Where two plans differ in more than one decision, change one decision at a time to find out which one drives the difference. Keep the table for your write-up.</p>',
      tool: { kind: 'mix' },
      items: [
        {
          id: 'm02-pj-t1', type: 'num', kind: 'numerical',
          prompt: 'For the default plan, the simulator’s estimates are 198,995 cans in year 1 and a break-even of 117,425 cans. What is the plan’s margin of safety: the share of simulated sales that could be lost before the plan stops breaking even? Give a percentage to one decimal place.',
          answer: 41.0, check: () => { const y = year(D); return (y.units - y.breakEvenUnits) / y.units * 100; }, unit: '%', places: 1, tol: 0.1,
          wrong: [
            { value: 69.5, say: 'You divided by the break-even volume. The margin of safety is measured against the expected (here, simulated) sales.' },
            { value: 59.0, say: 'That is break-even as a share of simulated sales. The margin of safety is the rest: 100% − 59.0%.' },
          ],
          solution: 'Margin of safety = (198,995 − 117,425) ÷ 198,995 × 100 ≈ 41.0%. Sales could fall about 41% short of the simulated estimate before the plan loses money, a useful cushion given how uncertain a launch is.',
        },
        {
          id: 'm02-pj-t2', type: 'mc', kind: 'conceptual',
          prompt: 'The pricing lesson worked out by hand that the default plan breaks even at 117,013 cans; the simulator’s estimate is 117,425. Why do they differ?',
          options: [
            'The hand calculation treats the whole $120,000 promotion budget as fixed and assumes cans sell in proportion to each channel’s category volume; the simulator treats trade promotions as discounts on promoted cans and works out its own channel mix.',
            'One of them must contain an arithmetic error, because break-even has only one answer.',
            'The simulator includes the competitors’ costs.',
            'The simulator leaves out the $60,000 overhead.',
          ],
          answer: 0,
          feedback: {
            1: 'Break-even depends on assumptions about costs and the channel mix. Different, stated assumptions give different, correct answers.',
            2: 'Lantern’s break-even depends only on Lantern’s costs and prices; competitors affect how many cans it sells, not how many it needs.',
            3: 'The simulator’s break-even includes the overhead: it divides fixed costs, marketing and the $60,000 overhead by contribution per can.',
          },
          solution: 'In the simulator the $20,000 trade budget is spent as 20% discounts on promoted cans, so it lowers contribution per can instead of adding to fixed costs, and the mix of cans comes from the model (natural grocers sell almost as many of Lantern’s cans as supermarkets). The hand calculation assumes a mix proportional to category volume. Both are right under their own assumptions; say which you use.',
        },
        {
          id: 'm02-pj-t3', type: 'mc', kind: 'applied',
          prompt: 'The table shows the simulator’s estimates for three plans. Value: Classic blend at $2.79 in supermarkets and convenience stores, with $40,000 ads, $20,000 sampling and $40,000 trade promotions. Default: Single-origin at $3.49 in supermarkets, natural grocers and Lantern’s own channel, with the default $120,000 budget. Premium: Organic single-origin at $3.79 in the same three channels, with $50,000 ads, $40,000 sampling, $10,000 trade promotions and $20,000 PR. All are one flavour. Which plan does the evidence favour?',
          data: { table: { head: ['Plan', 'Cans in year 1', 'Profit after overhead', 'Break-even cans', 'Margin of safety'], rows: [['Value', '140,024', '$8,590', '131,529', '6.1%'], ['Default', '198,995', '$122,956', '117,425', '41.0%'], ['Premium', '216,501', '$162,161', '115,951', '46.4%']] } },
          options: [
            'Premium: it has the highest simulated profit and margin of safety, and its decisions fit a café-quality positioning (taste score 8.5 at Summit’s price, natural grocers that pay for provenance), though its price and liquid should be tested before the whole budget is committed.',
            'Value: a low price always wins in a category with a value brand.',
            'Default: it is the simulator’s starting plan, so it must be the best.',
            'None: simulated numbers can’t support any choice.',
          ],
          answer: 0,
          feedback: {
            1: 'The value plan barely breaks even in the simulation (a margin of safety of about 6%), and a Classic blend at $2.79 competes head-on with Arcadia and Daily Grind, which have far higher awareness.',
            2: 'The default is a sensible first plan, not an optimum: the premium plan beats it on every measure in the table.',
            3: 'Simulated estimates can’t prove a plan will work, but they can compare plans on the same basis; the choice should then be tested in the market.',
          },
          solution: 'On the simulator’s estimates the premium plan sells the most cans, earns the most ($162,161 after overhead) and has the widest margin of safety ((216,501 − 115,951) ÷ 216,501 ≈ 46.4%). It is also the most consistent with Lantern’s positioning. The value plan is fragile (8,590 of profit, 6.1% margin of safety) and contradicts the brand. Before committing, test the $3.79 price and the organic liquid in a few stores, because the model can’t know how real shoppers will respond.',
        },
        {
          id: 'm02-pj-t4', type: 'multi', kind: 'conceptual',
          prompt: 'Which practices make a comparison of launch plans in the simulator fair and useful? Select all that apply.',
          options: [
            'Compare plans on profit after overhead, contribution and break-even, not on cans or share alone.',
            'When plans differ in several decisions, change one decision at a time to see which one drives the difference.',
            'Check each plan’s margin of safety: how far sales could fall short before it loses money.',
            'Treat the plan with the highest simulated profit as a forecast of what Lantern will earn.',
            'Prefer the plan with the highest market share, because share leads to profit.',
          ],
          answer: [0, 1, 2],
          feedback: {
            3: 'The simulator is a teaching model with invented coefficients; its numbers are estimates for comparison, not forecasts.',
            4: 'Share can be bought with low prices or heavy trade promotion that earn little or nothing per can. Share is a means to profit, not a substitute for it: compare plans on profit and on how much risk they carry.',
          },
          solution: 'Compare plans on the measures that decide whether a plan pays (contribution, profit after overhead, break-even and margin of safety), isolate the decision that causes each difference, and remember that simulated numbers are comparisons under stated assumptions, not forecasts.',
        },
      ],
    },
    // ------------------------------------------------------------ 6
    {
      id: 'recommend', title: 'Write the recommendation',
      html: '<p>Write a one-page recommendation to Ana, about 350–450 words. Lead with the decision: the plan in one or two sentences. Then give the evidence (your hand calculations and the simulator’s estimates, labelled as simulated), the comparison with your two alternatives, the main risks and what the model leaves out, and the tests you would run before committing the whole budget. Your saved plan and results from the earlier stages are there to quote.</p>',
      items: [
        {
          id: 'm02-pj-r1', type: 'short', kind: 'applied',
          prompt: 'Write your one-page recommendation to Ana Lim on Lantern Cold Brew’s launch plan.',
          rubric: [
            'States the plan in full at the start: liquid and range, shelf price, channels, and the promotion budget by vehicle.',
            'States the target market and positioning, and shows that each of the four decisions fits them and the others.',
            'Supports the plan with hand calculations (price build-up in each channel, break-even, and the required-volume test for the chosen price) that agree with the market file.',
            'Compares the plan with at least two alternatives on the same measures, and labels every simulator number as a simulated estimate.',
            'Names the main risks and at least two things the model leaves out, and proposes specific tests (with the result that would change the decision) before the whole budget is committed.',
          ],
          model: 'Recommendation. Launch Lantern Cold Brew as a premium can: the Organic single-origin liquid, one flavour, at $3.79, in supermarkets, natural and specialty grocers and Lantern’s own cafés and online shop, with $120,000 of promotion: $50,000 social and search ads, $40,000 in-store sampling and displays, $20,000 PR and events and $10,000 of trade promotions.<br><br>Why it fits. The target is commuters and office workers who buy coffee out and care how it tastes. Its taste score of 8.5 beats Summit Brew’s 8, so Summit’s $3.79 is credible, and natural-grocer shoppers pay for organic provenance. One flavour keeps listing fees at $11,000 a year. Ads and PR build awareness from 12%; sampling turns it into trial at the shelf.<br><br>The economics. Lantern keeps $1.70 a can in supermarkets (3.79 × 0.68 − 0.88), $1.47 in natural grocers (3.79 × 0.62 − 0.88) and $2.46 direct (3.79 − 0.45 − 0.88). With $197,000 of fixed costs (the whole promotion budget and the $60,000 overhead included) and cans spread in proportion to category volume, the plan breaks even at about 112,095 cans.<br><br>Against the alternatives. On the simulator’s estimates (a teaching model, not a forecast), this plan sells about 216,501 cans and earns about $162,161 after overhead, a margin of safety of about 46%. The default Single-origin plan at $3.49 earns about $122,956 (41%); a value plan (Classic blend at $2.79 in supermarkets and convenience stores) earns about $8,590 and contradicts the brand. Changing one decision at a time, most of the gain comes from the product and price: the Organic can at $3.79 with the default promotion split earns about $153,111, the default can with my split about $131,141.<br><br>Where I depart from the simulator. It says the premium plan’s $10,000 of trade promotions costs about $4,700 of profit in the simulator. I keep a few deal windows of no more than 20% off: they help win and keep listings, and the model counts neither that nor repeat buying by shoppers who try a can on deal. It also says convenience stores would add about $54,000, after their 40% margin, the fee and thinner sampling; but it ignores delisting of slow sellers, cannibalisation and competitor responses, so I would pilot one chain and roll out only if sales per store per week hold up.<br><br>Risks. Summit could cut its price, and awareness is simulated to reach only about 23% by year end, so many shoppers will meet an unknown brand at a premium price.<br><br>Before committing. Run a four-week price test ($3.59 against $3.79) in a few supermarkets and natural grocers, and a randomised sampling holdout. If supermarket volume at $3.79 is more than about 8% below volume at $3.59 (the most the higher price can absorb: 0.136 ÷ 1.6972), I would move to $3.59; if sampled stores don’t outsell unsampled ones, I would move sampling money into ads.',
        },
      ],
    },
  ],
  rubric: [
    'Your plan states a target market and a positioning, and every one of the four decisions fits them and the other decisions, checked pair by pair.',
    'Every hand calculation shows its method (price build-up for each chosen channel, break-even volume, the required-volume test for your price) and agrees with the market file.',
    'You compared your plan with at least two alternatives on the same measures (cans, contribution, profit after overhead, break-even, margin of safety), changing one decision at a time to explain the differences.',
    'Every simulator number is labelled as a simulated estimate from a teaching model, and you name at least two things the model leaves out that could change the decision.',
    'Your recommendation leads with the decision and ends with specific tests to run before committing the whole budget, including the result that would change your mind.',
  ],
  /** Every simulator estimate and hand-calculated figure printed in this project, recomputed: [what, value, shown, tol]. */
  verify() {
    const d = year(D), hi = year(AT_379), cv = year(WITH_CONV), og = year(ORGANIC), vl = year(VALUE);
    const sD = channel(D, 'supermarket'), nD = channel(D, 'natural'), sH = channel(AT_379, 'supermarket'), nH = channel(AT_379, 'natural');
    const sC = channel(WITH_CONV, 'supermarket'), nC = channel(WITH_CONV, 'natural');
    const samp = [0, 20000, 40000, 60000].map((v) => year(promo('sampling', v)).units);
    const r = (v) => Math.round(v);
    return [
      ['Default plan: cans', r(d.units), 198995, 0.5],
      ['Default plan: profit after overhead', r(d.profit), 122956, 0.5],
      ['Default plan: break-even cans', r(d.breakEvenUnits), 117425, 0.5],
      ['Default plan: revenue to Lantern', r(d.revenue), 467212, 0.5],
      ['Default plan: gross profit', r(d.grossProfit), 319956, 0.5],
      ['Default plan: contribution per can', d.contributionPerCan, 1.51, 0.005],
      ['Default plan: awareness at year end (%)', d.awarenessEnd * 100, 22, 0.5],
      ['Default plan at $3.79: cans', r(hi.units), 175975, 0.5],
      ['Default plan at $3.79: profit after overhead', r(hi.profit), 121618, 0.5],
      ['Simulator elasticity at $3.49', d.elasticity, -1.44, 0.005],
      ['Simulator elasticity at $3.79', hi.elasticity, -1.56, 0.005],
      ['Supermarket cans change, $3.49 to $3.79 (%)', pct(sD.units, sH.units), -14.19, 0.005],
      ['Natural-grocer cans change, $3.49 to $3.79 (%)', pct(nD.units, nH.units), -8.83, 0.005],
      ['Required change, supermarkets (%)', -(0.30 * 0.68) / (gm('supermarket', 3.49, 'single') + 0.30 * 0.68) * 100, -11.10, 0.005],
      ['Midpoint elasticity, %ΔQ', (hi.units - d.units) / ((hi.units + d.units) / 2) * 100, -12.28, 0.005],
      ['Midpoint elasticity, %ΔP', 0.30 / 3.64 * 100, 8.24, 0.005],
      ['With convenience: cans', r(cv.units), 239729, 0.5],
      ['With convenience: profit after overhead', r(cv.profit), 172330, 0.5],
      ['With convenience: extra profit (thousands)', (cv.profit - d.profit) / 1000, 49, 0.5],
      ['With convenience: contribution per can', cv.contributionPerCan, 1.47, 0.005],
      ['With convenience: supermarket cans', r(sC.units), 86867, 0.5],
      ['Default: supermarket cans', r(sD.units), 92139, 0.5],
      ['With convenience: natural-grocer cans', r(nC.units), 82667, 0.5],
      ['Default: natural-grocer cans', r(nD.units), 87075, 0.5],
      ['With convenience: listing fees added', cv.listingFees - d.listingFees, 4000, 0.5],
      ['With convenience: awareness unchanged', cv.awarenessEnd - d.awarenessEnd, 0, 1e-9],
      ['No digital: profit after overhead', r(year(promo('digital', 0)).profit), 72769, 0.5],
      ['Digital $30,000: profit after overhead', r(year(promo('digital', 30000)).profit), 107492, 0.5],
      ['Sampling $20,000: profit after overhead', r(year(promo('sampling', 20000)).profit), 121771, 0.5],
      ['Sampling $60,000: profit after overhead', r(year(promo('sampling', 60000)).profit), 116999, 0.5],
      ['No trade promotions: profit after overhead', r(year(promo('trade', 0)).profit), 133234, 0.5],
      ['No trade promotions: cans given up (thousands)', (d.units - year(promo('trade', 0)).units) / 1000, 6, 0.5],
      ['Sampling $0: cans', r(samp[0]), 164149, 0.5],
      ['Sampling $20,000: cans', r(samp[1]), 185194, 0.5],
      ['Sampling $60,000: cans', r(samp[3]), 208141, 0.5],
      ['Sampling step 1 extra cans', r(samp[1]) - r(samp[0]), 21045, 0.5],
      ['Sampling step 2 extra cans', r(samp[2]) - r(samp[1]), 13801, 1],
      ['Sampling step 3 extra cans', r(samp[3]) - r(samp[2]), 9146, 1],
      ['Default margin of safety (%)', (d.units - d.breakEvenUnits) / d.units * 100, 41.0, 0.05],
      ['Value plan: cans', r(vl.units), 140024, 0.5],
      ['Value plan: profit after overhead', r(vl.profit), 8590, 0.5],
      ['Value plan: break-even cans', r(vl.breakEvenUnits), 131529, 0.5],
      ['Value plan: margin of safety (%)', (vl.units - vl.breakEvenUnits) / vl.units * 100, 6.1, 0.05],
      ['Premium plan: cans', r(og.units), 216501, 0.5],
      ['Premium plan: profit after overhead', r(og.profit), 162161, 0.5],
      ['Premium plan: break-even cans', r(og.breakEvenUnits), 115951, 0.5],
      ['Premium plan: margin of safety (%)', (og.units - og.breakEvenUnits) / og.units * 100, 46.4, 0.05],
      ['Premium plan: awareness at year end (%)', og.awarenessEnd * 100, 23, 0.5],
      ['Hand break-even, default fixed costs', FC_DEFAULT, 197000, 0],
      ['Organic $3.79 supermarket margin', gm('supermarket', 3.79, 'organic'), 1.70, 0.005],
      ['Organic $3.79 natural margin', gm('natural', 3.79, 'organic'), 1.47, 0.005],
      ['Organic $3.79 direct margin', gm('direct', 3.79, 'organic'), 2.46, 0.005],
      ['One flavour listing fees, default channels', CH.supermarket.listing + CH.natural.listing, 11000, 0],
      ['Single-origin supermarket margin at $2.29', gm('supermarket', 2.29, 'single'), 0.82, 0.005],
      ['Sampling $30,000: profit after overhead', r(year(promo('sampling', 30000)).profit), 123459, 0.5],
      ['Organic: volume fall $3.79 can absorb vs $3.59, supermarkets (%)', (0.20 * 0.68) / gm('supermarket', 3.79, 'organic') * 100, 8, 0.05],
      ['Lesson hand break-even, default plan', Math.ceil(FC_DEFAULT / avg3(3.49, 'single')), 117013, 0],
      // model answer: one decision at a time, and where it departs from the simulator
      ['Premium product and price, default promotion split: profit after overhead', r(year({ ...ORGANIC, promotion: { ...D.promotion } }).profit), 153111, 0.5],
      ['Default product and price, premium promotion split: profit after overhead', r(year({ ...D, promotion: { ...ORGANIC.promotion } }).profit), 131141, 0.5],
      ['Premium plan: profit given up by its $10,000 of trade promotions (thousands)', (year({ ...ORGANIC, promotion: { ...ORGANIC.promotion, trade: 0 } }).profit - og.profit) / 1000, 4.7, 0.05],
      ['Premium plan: profit added by convenience stores (thousands)', (year({ ...ORGANIC, channels: [...ORGANIC.channels, 'convenience'] }).profit - og.profit) / 1000, 54, 0.5],
    ];
  },
};
