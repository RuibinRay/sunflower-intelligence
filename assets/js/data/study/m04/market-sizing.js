// market-sizing.js — M04 · Market sizing. Content only; exercises are in market-sizing.ex.js.
// Lantern Cold Brew: CATEGORY, CHANNELS and DEFAULT_PLAN (M02, re-exported by case.js), COLD_BREW_SIZING, PRICE_AUDIT and
// the February survey's intent figures (DERIVED.coldbrew, DERIVED.list) come from case.js; M02's simulator figure from
// core/mixsim.js; Lantern's awareness and M02's break-even inputs from m02/market.js. This lesson's own fictional
// assumptions: Ana's low and high values for the sensitivity table, the conversion rates (40% and 10%, with 25%/5% and
// 60%/20%) and a four-pack a month per regular buyer. Quarrymoor Creamery and Tillworth Bakery are fictional. The truth
// the survey estimates (DERIVED.coldbrew.truth*) appears only in the “What Ana couldn’t see” callout. Not the office
// market (the project's). Every printed figure is recomputed in `checks`.
import { CATEGORY, CHANNELS, DEFAULT_PLAN, COLD_BREW_SIZING as SZ, PRICE_AUDIT, DERIVED as D } from './case.js?v=15';
import { LANTERN, TIERS } from '../m02/market.js?v=15';
import { simulate } from '../../../core/mixsim.js?v=15';

// ---------------------------------------------------------------- the figures the lesson quotes
const TAM = CATEGORY.cansPerYear;                                        // 4,800,000
const CH = Object.fromEntries(CHANNELS.map((c) => [c.id, c]));
const chCans = (id) => CH[id].volume * TAM;                                // cans a year sold in a channel
const SAM = D.sizing.samCans;                                              // 3,360,000
const WEEKS = 52;
const P = SZ.plan;
const SUP = P.supermarket.listed * P.supermarket.cansPerWeek * WEEKS;    // 15,600
const NAT = P.natural.listed * P.natural.cansPerWeek * WEEKS;            // 18,200
const DIR = SZ.directPerMonth * 12;                                      // 14,400
const BU = SUP + NAT + DIR;                                              // 48,200
const GOAL = SZ.goalCans;                                                // 100,000
const LISTED = P.supermarket.listed + P.natural.listed;                  // 55
const supStoreWeek = chCans('supermarket') / SZ.stores.supermarket / WEEKS; // 346 category cans a store a week
const natStoreWeek = chCans('natural') / SZ.stores.natural / WEEKS;         // 308
const retailNeed = GOAL - DIR;                                           // 85,600
const weeklyNow = (SUP + NAT) / WEEKS;                                   // 650
const speedUp = retailNeed / (SUP + NAT);                                // 2.53
const supRateNeeded = (GOAL - NAT - DIR) / (P.supermarket.listed * WEEKS);         // 43.2
const supStoresNeeded = (GOAL - NAT - DIR) / (P.supermarket.cansPerWeek * WEEKS);  // 129.6
const allNat = SZ.stores.natural * P.natural.cansPerWeek * WEEKS;                   // 32,760
const supStoresWithAllNat = Math.ceil((GOAL - allNat - DIR) / (P.supermarket.cansPerWeek * WEEKS)); // 102
const directNeeded = (GOAL - SUP - NAT) / 12;                           // 5,517 a month

// value
const AUD = D.audit.mean;                                                // $3.1525 over 24 shelf prices
const tamValue = TAM * AUD;
const brandMeans = PRICE_AUDIT.brands.map((_, j) => { const xs = PRICE_AUDIT.stores.map((s) => s.prices[j]).filter((x) => x != null); return xs.reduce((a, x) => a + x, 0) / xs.length; });
const meanOfMeans = brandMeans.reduce((a, b) => a + b, 0) / 3;
const tradeShare = CHANNELS.reduce((a, c) => a + c.volume * c.margin, 0);     // 0.321 (cafés and online at 0)
const producerValue = tamValue * (1 - tradeShare);

// intent (weighted to the list's strata) and conversion assumptions (fictional)
const N = D.list.N;                                                      // 6,000
const CB = D.coldbrew;
const pDef = CB.topBoxWeighted, pProb = CB.topTwoWeighted - CB.topBoxWeighted;
const nDef = N * pDef, nProb = N * pProb;
const PACK = 4;
const buyers = (a, b, d = pDef, p = pProb) => N * (d * a + p * b);
const mid = buyers(0.4, 0.1), low = buyers(0.25, 0.05), high = buyers(0.6, 0.2);
const tDef = CB.truthTopBox, tProb = CB.truthTopTwo - CB.truthTopBox;
const truthMid = buyers(0.4, 0.1, tDef, tProb);

// M02's simulator (a teaching model: every store in a chosen channel stocks Lantern)
const SIM = simulate(DEFAULT_PLAN);
const simCh = Object.fromEntries(SIM.byChannel.map((c) => [c.id, c.units]));
const simSupRate = simCh.supermarket / SZ.stores.supermarket / WEEKS;    // 14.8
const simNatRate = simCh.natural / SZ.stores.natural / WEEKS;            // 37.2
const simOnAnaListings = P.supermarket.listed * simSupRate * WEEKS + P.natural.listed * simNatRate * WEEKS + simCh.direct; // ≈ 91,000
const simOnAnaListingsAnaDirect = simOnAnaListings - simCh.direct + DIR;  // ≈ 86,000

// M02's break-even (pricing-approaches): fixed costs ÷ average contribution per can over the three channels
const single = TIERS.find((t) => t.id === 'single').cogs;
const contrib = { supermarket: 3.49 * (1 - 0.32) - single, natural: 3.49 * (1 - 0.38) - single, direct: 3.49 - 0.45 - single };
const avgContrib = (0.45 * contrib.supermarket + 0.15 * contrib.natural + 0.10 * contrib.direct) / 0.70;
const breakEven = Math.ceil(197000 / avgContrib);

// sensitivity (Ana's fictional low and high values)
const model = (sl, sv, nl, nv, d) => sl * sv * WEEKS + nl * nv * WEEKS + d * 12;
const BASE = [30, 10, 25, 14, 1200], LO = [20, 6, 18, 8, 600], HI = [40, 14, 30, 20, 1800];
const swing = (i) => { const a = [...BASE], b = [...BASE]; a[i] = LO[i]; b[i] = HI[i]; return [model(...a), model(...b)]; };
const SW = [0, 1, 2, 3, 4].map(swing);
const allLow = model(...LO), allHigh = model(...HI);
const ratesLow = model(BASE[0], LO[1], BASE[2], LO[3], LO[4]), ratesHigh = model(BASE[0], HI[1], BASE[2], HI[3], HI[4]);   // listings as planned

// examples: Quarrymoor Creamery and Tillworth Bakery (fictional)
const QM = { tubs: 9_000_000, plant: 0.06, channels: 0.8, price: 6.5, trade: 0.35, share: 0.05 };
const qTam = QM.tubs * QM.plant, qSam = qTam * QM.channels, qShelf = qSam * QM.price, qNet = QM.price * (1 - QM.trade), qProd = qShelf * (1 - QM.trade), qSom = qSam * QM.share, qSomValue = qSom * qNet;
const TB = { households: 21_000, gf: 0.07, loaves: 1.2, share: 0.15, trial: [40, 34], busy: 1.4, shops: 6, members: 2_600, recorded: 0.55, buyRate: 0.09, perYear: 26 };
const tTown = TB.households * TB.gf * TB.loaves * WEEKS, tTop = tTown * TB.share;
const tTrial = (TB.trial[0] + TB.trial[1]) / 2, tAvgShop = tTrial / TB.busy, tShop = tAvgShop * TB.shops * WEEKS;
const tMembers = TB.members * TB.buyRate, tMemberLoaves = tMembers * TB.perYear, tCust = tMemberLoaves / TB.recorded;

// ---------------------------------------------------------------- formatting
const c0 = (x) => Math.round(x).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
const pc = (v, d = 1) => `${(v * 100).toFixed(d)}%`;

// ---------------------------------------------------------------- figure: the sizing funnel
function funnelFigure() {
  const t = (x, y, s, o = '') => `<text x="${x}" y="${y}" text-anchor="middle" fill="currentColor"${o}>${s}</text>`;
  let s = '<svg viewBox="0 0 640 300" xmlns="http://www.w3.org/2000/svg" font-family="inherit" font-size="13">';
  s += '<defs><marker id="ms-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>';
  s += '<rect x="130" y="16" width="380" height="58" rx="8" style="fill:none;stroke:var(--series-1);stroke-width:2"/>';
  s += t(320, 40, 'TAM: canned ready-to-drink coffee, Harbour City', ' font-weight="700"') + t(320, 61, `${(TAM / 1e6).toFixed(1)} million cans a year, all brands and channels`);
  s += '<rect x="170" y="92" width="300" height="58" rx="8" style="fill:none;stroke:var(--series-2);stroke-width:2"/>';
  s += t(320, 116, 'SAM: cans sold in the planned channels', ' font-weight="700"') + t(320, 137, `${(SAM / 1e6).toFixed(2)} million cans (${pc(SAM / TAM, 0)} of TAM)`);
  s += '<rect x="170" y="168" width="142" height="72" rx="8" style="fill:none;stroke:var(--series-3);stroke-width:2.5"/>';
  s += t(241, 190, 'SOM (bottom-up)', ' font-weight="700"') + t(241, 210, `${c0(BU)} cans`) + t(241, 229, `${pc(BU / SAM)} of SAM`, ' font-size="12"');
  s += '<rect x="328" y="168" width="142" height="72" rx="8" style="fill:none;stroke:var(--ink-3);stroke-width:2;stroke-dasharray:6 4"/>';
  s += t(399, 190, 'M02’s goal', ' font-weight="700"') + t(399, 210, `${c0(GOAL)} cans`) + t(399, 229, `${pc(GOAL / SAM)} of SAM`, ' font-size="12"');
  s += '<line x1="70" y1="20" x2="70" y2="236" stroke="currentColor" stroke-width="1.5" marker-end="url(#ms-arrow)"/>';
  s += '<line x1="570" y1="236" x2="570" y2="20" stroke="currentColor" stroke-width="1.5" marker-end="url(#ms-arrow)"/>';
  s += '<text x="20" y="266" fill="currentColor" font-weight="700">Top-down</text><text x="20" y="284" fill="var(--ink-3)" font-size="12">start from the category, apply shares</text>';
  s += '<text x="620" y="266" text-anchor="end" fill="currentColor" font-weight="700">Bottom-up</text><text x="620" y="284" text-anchor="end" fill="var(--ink-3)" font-size="12">build from stores, rates of sale and customers</text>';
  return `${s}</svg>`;
}

export default {
  slug: 'market-sizing',
  title: 'Market sizing',
  blurb: 'How big is the market, and how much of it can you win? Define a market by its products, customers, place and period; separate TAM, SAM and SOM; estimate from the top down and the bottom up; use survey intent with an explicit conversion assumption; and report a range with the assumption that drives it, not one hopeful number.',
  status: 'reviewed',
  objectives: [
    'Define a market size by its products, customers, place, period and unit, and convert volume into value at a stated price level.',
    'Distinguish the total addressable, serviceable available and serviceable obtainable markets (TAM, SAM and SOM), stating the definitions you use.',
    'Calculate a market or sales estimate from the top down (category × shares) and from the bottom up (outlets × rate of sale, or customers × buying × frequency), in Excel.',
    'Apply an explicit conversion assumption to stated purchase intent, and explain why intent is not behaviour.',
    'Evaluate an estimate by triangulation, sensitivity analysis and sanity checks, and work out what would have to be true for a goal to be reached.',
  ],
  prerequisites: [
    { lesson: 'm02/product-life-cycle', why: 'M02 set Lantern Cold Brew’s first-year goal of about 100,000 cans in a category of 4.8 million; this lesson tests it.' },
    { lesson: 'm01/situation-analysis', why: 'Market share and substitutes, which define what a market includes, were introduced there.' },
    { lesson: 'm04/survey-error', why: 'The February survey’s weighted intent figures and the caution about stated intentions come from that lesson.' },
    { lesson: 'b03/what-if-analysis', why: 'The sizing model uses Goal Seek, a data table and sensitivity analysis.' },
  ],
  case: 'lantern',

  concept: [
    { case: `It is March 2027. Lantern Cold Brew is still a plan: 250 ml cans at $3.49 in Harbour City, where about ${(TAM / 1e6).toFixed(1)} million cans of ready-to-drink coffee are sold a year. M02’s plan set a first-year goal of about ${c0(GOAL)} cans. Since then Ana has talked to two store buyers, asked her mailing list about Cold Brew in the February survey and audited competitors’ shelf prices. Before she orders a first production run, her board wants to know how many cans Lantern can really expect to sell, and whether ${c0(GOAL)} is an estimate or a hope.` },

    { h: 'What a market size is' },
    { p: `A <g>market size</g> is the quantity of a product that a defined group of customers buys in a defined place over a defined period. All four parts matter. “The cold brew market” means nothing until you say which products count (canned ready-to-drink coffee only, or bottles and café iced coffee too), whose purchases count, where and over how long. Harbour City’s ${(TAM / 1e6).toFixed(1)} million cans is a yearly figure for canned ready-to-drink coffee, all brands and all channels; change any part of the definition and the number changes, and so does every <g>market share</g> calculated from it.` },
    { p: `Size can be measured in <b>volume</b> (units: cans, tubs, memberships, seats) or in <b>value</b> (money), and value is volume times an average price. Say which price. Shoppers pay the shelf price; producers receive the shelf price less what the shops and distributors keep. At $3.49 on a supermarket shelf, Lantern receives about $${(3.49 * (1 - CH.supermarket.margin)).toFixed(2)} a can (M02).` },

    { h: 'TAM, SAM and SOM' },
    { p: 'Market sizes are often given as three nested figures. The <g>total addressable market</g> (TAM) is the whole demand for the product category in the place and period, whoever supplies it. The <g>serviceable available market</g> (SAM) is the part of the TAM that the business’s offer and its routes to market could serve. The <g>serviceable obtainable market</g> (SOM) is the part of the SAM that the business can realistically win in the period, given its resources and its competitors.' },
    { p: 'The labels are most used in start-up and technology practice, and sources define them differently. TechTarget describes TAM as the revenue opportunity at a 100% market share, “as if no competition exists”; Carta describes it as the total demand for your product across all potential customers. For one source SAM is the part of the TAM a company’s products can serve, for another the part it can reasonably expect to reach, and some put a time limit on SOM while others don’t. So say in words what each of your three figures counts. This course uses the definitions in the previous paragraph.' },
    { figure: {
      svg: funnelFigure(),
      caption: `Lantern Cold Brew’s market as a funnel (not to scale). The TAM is M02’s ${(TAM / 1e6).toFixed(1)} million cans; the SAM is the ${pc(SAM / TAM, 0)} sold in the three kinds of outlet in Lantern’s plan; the SOM is Ana’s bottom-up estimate, beside M02’s goal. Top-down estimates work down the funnel; bottom-up estimates build up from stores and customers.`,
      alt: `Three tiers of boxes, narrowing downwards. The top box reads “TAM: canned ready-to-drink coffee, Harbour City, ${(TAM / 1e6).toFixed(1)} million cans a year, all brands and channels”. The middle box reads “SAM: cans sold in the planned channels, ${(SAM / 1e6).toFixed(2)} million cans (${pc(SAM / TAM, 0)} of TAM)”. The bottom tier has two boxes side by side: “SOM (bottom-up), ${c0(BU)} cans, ${pc(BU / SAM)} of SAM” and, with a dashed border, “M02’s goal, ${c0(GOAL)} cans, ${pc(GOAL / SAM)} of SAM”. An arrow on the left points down, labelled “Top-down: start from the category, apply shares”; an arrow on the right points up, labelled “Bottom-up: build from stores, rates of sale and customers”. The boxes are not drawn to scale.`,
    } },
    { p: `For Lantern Cold Brew the TAM is M02’s ${(TAM / 1e6).toFixed(1)} million cans a year. The SAM is the cans sold through the three kinds of outlet in Lantern’s plan: supermarkets (${pc(CH.supermarket.volume, 0)} of the category’s cans), natural and specialty grocers (${pc(CH.natural.volume, 0)}) and cafés and online shops (${pc(CH.direct.volume, 0)}), the kind of outlet Lantern runs itself. Together they sell ${pc(SAM / TAM, 0)} of the category, ${(SAM / 1e6).toFixed(2)} million cans; the convenience stores’ ${pc(CH.convenience.volume, 0)} is outside it because the plan leaves them out. The SOM is the figure the board is asking for.` },

    { h: 'Two routes to an estimate' },
    { p: '<g>Top-down market sizing</g> starts from the whole category and narrows it with shares: the cans sold in the planned channels, then the share of those the business might win. <g>Bottom-up market sizing</g> builds the figure from its parts: how many stores will stock the product and how many it sells in each, or how many customers will buy and how often. Top-down is quick and shows the scale. Bottom-up is slower, but every input is something a store buyer, a customer or a trial can confirm or contradict.' },
    { p: `Ana’s bottom-up estimate for year one is ${c0(BU)} cans: ${P.supermarket.listed} supermarkets at ${P.supermarket.cansPerWeek} cans a store a week, ${P.natural.listed} natural grocers at ${P.natural.cansPerWeek}, and ${c0(SZ.directPerMonth)} cans a month through Lantern’s own cafés and online shop. M02’s goal is ${c0(GOAL)}. One is ${pc(BU / SAM)} of the SAM and the other ${pc(GOAL / SAM)}. This lesson is about deciding which to believe, and what would have to be true for the larger one.` },
    { callout: 'key', title: 'A size is a claim with four parts', html: 'Products, customers, place and period, in a stated unit and, for value, at a stated price level. “A $15 million market” isn’t a fact until you can say what was counted, where, over how long and at which price.' },
  ],

  theory: [
    { h: 'Drawing the boundary' },
    { p: 'The first decision is which products count. Draw the line too tightly and you miss real competition; draw it too loosely and the market looks huge while your share looks tiny. M01’s <g>substitutes</g> give the test: a product belongs in the market if the customers you want treat it as a real alternative.' },
    { table: {
      caption: 'Four ways to draw Lantern Cold Brew’s market (only the first is measured in the case)',
      head: ['Market definition', 'What it adds', 'Useful for'],
      rows: [
        [`Canned ready-to-drink coffee, Harbour City, a year (${(TAM / 1e6).toFixed(1)} million cans)`, 'The category Lantern enters', 'Shares, shelf space, the launch plan'],
        ['Ready-to-drink coffee in any pack', 'Bottles and cartons', 'A brand that might add bottles, or shoppers who switch between packs'],
        ['Cold coffee bought away from home', 'Iced coffee from cafés and kiosks', 'Lantern’s own cafés, and long-term growth'],
        ['Cold caffeinated drinks on the go', 'Energy drinks and iced tea', 'Rarely: too broad to guide a launch'],
      ],
    } },
    { p: 'The broader definitions aren’t wrong; they answer different questions. A launch plan needs the category the product will be shelved in, because that is where shoppers compare it and where store buyers judge it.' },

    { h: 'TAM, SAM and SOM in practice' },
    { p: 'A TAM can be measured two ways. Where the category already sells, count what it sells now, as Lantern’s 4.8 million cans do. Where buyers have no current product to count, or you want the ceiling, count every potential customer at the offer’s price (customers × quantity × price), TechTarget’s “100% market share”; it is usually far larger, so say which you used.' },
    { p: 'The TAM is narrowed to the SAM by whatever limits what the business could serve: the channels it will sell through, the regions it can deliver to, the customer types its offer suits. Lantern’s SAM is limited by channel. A stricter analyst would count only the stores expected to list Lantern, which gives a much smaller SAM (an exercise asks you to work it out). Neither choice is wrong, but the shares calculated from them differ, so say which you used.' },
    { p: 'The SOM has to come from evidence about what the business can win: listings, rates of sale, customers who will buy. It is an estimate. A goal is different: a target the business sets itself. When a goal is larger than the SOM, the plan has to change, or the goal does.' },
    { table: {
      caption: 'Lantern Cold Brew, year one: the three figures and the goal (fictional case)',
      head: ['Figure', 'What it counts', 'Cans', 'Share of TAM'],
      align: ['l', 'l', 'r', 'r'],
      rows: [
        ['TAM', 'Canned ready-to-drink coffee, all brands and channels', c0(TAM), '100%'],
        ['SAM', 'Cans sold in supermarkets, natural grocers and cafés and online shops', c0(SAM), pc(SAM / TAM, 0)],
        ['SOM', 'Ana’s bottom-up estimate of Lantern’s first year', c0(BU), pc(BU / TAM)],
        ['Goal', 'M02’s first-year target (not an estimate)', c0(GOAL), pc(GOAL / TAM)],
      ],
    } },

    { h: 'Top-down: from the category to a share' },
    { p: `A top-down estimate multiplies the category by a chain of shares. Its inputs usually come from <g>secondary data</g>: <g>trade associations</g>, <g>syndicated data</g> from retail panels, industry reports and <g>official statistics</g> (the secondary-research lesson covers where to find them and how to judge them; OpenStax gives an industry report of all related product sales as an example). Lantern’s chain is short: ${(TAM / 1e6).toFixed(1)} million × ${pc(SAM / TAM, 0)} = ${(SAM / 1e6).toFixed(2)} million cans in the SAM. The last link, the share of the SAM that Lantern will win, is the hard one, and nothing in the category data says what it should be.` },
    { callout: 'warn', title: '“If we get just 1% of the market…”', html: `The commonest top-down error is to pick a small share of a large market and call it modest. One per cent of Harbour City’s ${(TAM / 1e6).toFixed(1)} million cans is ${c0(TAM * 0.01)}, almost exactly Ana’s bottom-up estimate, yet for a new brand known to about ${pc(LANTERN.awareness, 0)} of category buyers (M02) that share is not modest: every can has to be won from a store buyer and then from a shopper. A share in a top-down estimate needs evidence of its own, such as what comparable new brands achieved in their first year.` },

    { h: 'Bottom-up: from outlets or from customers' },
    { p: 'For a product sold in shops, a bottom-up estimate multiplies the number of outlets that will stock it by its <g>rate of sale</g>, the units an outlet sells in a period, usually per store per week. Outlet counts come from store lists, distributors and official business statistics: in the United States, the Census Bureau’s County Business Patterns gives the number of <g>establishments</g> with paid employees by six-digit industry code for every county, each year. Rates of sale come from store buyers, from comparable products and, best of all, from a trial in a few stores.' },
    { p: 'For a product sold direct, or to customers the business can count, build from customers instead: the number of people in the target group, the share who will buy, how often they buy and how much each time. The same structure fits a service (members × uptake × visits × price) and a business product (firms × adoption × seats × price per seat).' },
    { table: {
      caption: 'Ana’s bottom-up estimate for Lantern Cold Brew’s first year (fictional case)',
      head: ['Route', 'Stores listing', 'Cans a store a week', 'Periods', 'Cans a year'],
      align: ['l', 'r', 'r', 'r', 'r'],
      rows: [
        ['Supermarkets', `${P.supermarket.listed} of ${SZ.stores.supermarket}`, String(P.supermarket.cansPerWeek), `${WEEKS} weeks`, c0(SUP)],
        ['Natural and specialty grocers', `${P.natural.listed} of ${SZ.stores.natural}`, String(P.natural.cansPerWeek), `${WEEKS} weeks`, c0(NAT)],
        ['Lantern’s cafés and online shop', '', `${c0(SZ.directPerMonth)} cans a month`, '12 months', c0(DIR)],
      ],
      foot: [['Total', '', '', '', c0(BU)]],
    } },
    { p: 'The listings and rates of sale are Ana’s planning assumptions after talking to two store buyers; the direct figure is her estimate of what Lantern’s own cafés and online shop will sell, informed by what subscribers said in the February survey, not a calculation from it. Each is a number that someone can challenge, which is the point of building from the bottom.' },

    { h: 'Volume into value' },
    { p: `To turn cans into dollars, multiply by an average price, and choose it with care. The right average is weighted by volume, the price of the average can actually sold, which needs each brand’s sales. Ana’s shelf-price audit (the next lesson) gives ${D.audit.observations} shelf prices from ten stores, averaging $${AUD.toFixed(2)}, so the category is worth about ${(TAM / 1e6).toFixed(1)} million × $${AUD.toFixed(2)} ≈ $${(tamValue / 1e6).toFixed(1)} million a year at shelf prices. The average of the three brands’ own averages is $${meanOfMeans.toFixed(2)}, which gives $${(TAM * meanOfMeans / 1e6).toFixed(1)} million. If the cheapest brand, Daily Grind, sells the most cans (it is the best known, at 75% awareness in M02), the true figure is lower still.` },
    { p: `Value at shelf prices is what shoppers spend; producers receive less. In M02’s three retail channels the distributors and retailers keep 32% to 40% of the shelf price. Weighting those margins by each channel’s share of the category, and assuming the cafés and online shops keep nothing (true only of a brand selling through its own, as Lantern will), the trade keeps ${pc(tradeShare)}, so producers receive at most about $${(producerValue / 1e6).toFixed(1)} million. Quote the figure that matches the decision, and say which it is.` },

    { h: 'Using what customers say they will do' },
    { p: `Surveys give another bottom-up route: ask people how likely they are to buy, then count buyers. In February Ana asked her mailing list, on a five-point <g>purchase-intent scale</g>, how likely they would be to buy Lantern Cold Brew at about $3.49 in the next three months. Weighted to the list’s four groups by <g>post-stratification</g> (the survey-error lesson explains the weights), ${pc(pDef)} said they definitely would and ${pc(pProb)} probably would: about ${c0(nDef)} and ${c0(nProb)} of the ${c0(N)} people on the list.` },
    { p: 'Stated intent isn’t behaviour: the survey-error lesson showed that it tends to overstate buying, most of all for new products. Armstrong, Morwitz and Kumar (2000) found that forecasts built on purchase intentions for existing products were more accurate than extrapolating past sales, but they note that intentions-based methods often give biased estimates, overstating or understating actual buying, and that sales data should be used to correct the bias where they exist. A new product has no sales of its own, so the correction is an assumption: a conversion rate for each answer, borrowed where possible from a comparable launch, and varied to see what it does.' },
    { p: `The list is roughly the people Lantern’s own cafés and online shop already reach (café customers who never joined it are missing), so it suits the <g>direct channel</g>, provided those who buy do so there rather than in a supermarket, or they would be counted twice. Suppose 40% of those who said “definitely” and 10% of those who said “probably” become regular buyers, each taking a four-pack a month (fictional assumptions). That gives ${c0(nDef)} × 0.40 + ${c0(nProb)} × 0.10 ≈ ${c0(mid)} regular buyers and about ${c0(mid * PACK)} cans a month, against Ana’s ${c0(SZ.directPerMonth)}.` },
    { p: `Now vary the assumption. At 25% and 5% the estimate is about ${c0(low * PACK)} cans a month; at 60% and 20%, about ${c0(high * PACK)}. The conversion rates move the answer by a factor of nearly three.` },
    { p: `The intent route puts the own channel at about ${c0(mid * PACK)} cans a month against Ana’s ${c0(SZ.directPerMonth)}, so her figure is the more cautious; even at ${c0(high * PACK)} a month the bottom-up total would be about ${c0(Math.round((SUP + NAT + high * PACK * 12) / 500) * 500)} cans, still short of the goal. Notice also what the question measured: intent to try within three months. How many of those who try come back every month is a separate assumption that no intent question answers.` },
    { callout: 'note', title: 'What Ana couldn’t see', html: `Because the case holds every person’s answer, the survey can be compared with a truth Ana had no way of observing. On the whole list ${pc(tDef)} would say “definitely” and ${pc(tProb)} “probably”, against her weighted ${pc(pDef)} and ${pc(pProb)}. With the same 40% and 10%, the truth gives about ${c0(truthMid * PACK)} cans a month instead of ${c0(mid * PACK)}: a difference of about ${c0(Math.round((mid - truthMid) * PACK / 10) * 10)} cans, small beside the range of ${c0(low * PACK)} to ${c0(high * PACK)} that the conversion assumption creates.` },

    { h: 'Triangulating: what a gap means' },
    { p: '<g>Triangulation</g> in sizing means estimating the same quantity by independent routes and comparing the results (the secondary-research lesson does the same with sources). Agreement is reassuring only if the routes really are independent. Disagreement is more useful, because it points at the assumption that differs. Lantern has two estimates for year one, and a target.' },
    { table: {
      caption: 'Two estimates and a target for Lantern Cold Brew’s first year',
      head: ['Figure', 'Cans', 'What it assumes'],
      align: ['l', 'r', 'l'],
      rows: [
        ['Ana’s bottom-up estimate', c0(BU), `${LISTED} listings at the buyers’ rates of sale; ${c0(SZ.directPerMonth)} cans a month direct`],
        ['M02’s first-year goal', c0(GOAL), 'A target, set before any store was asked'],
        ['M02’s Marketing Mix Simulator, default plan', c0(Math.round(SIM.year.units / 1000) * 1000), 'A teaching model in which every store in a chosen channel stocks Lantern'],
      ],
    } },
    { p: `The simulator seems to support the goal until you look at what it assumes. It treats a channel as all or nothing: once Lantern chooses supermarkets, it is on every supermarket’s shelf. Spread over all ${SZ.stores.supermarket} supermarkets, its ${c0(simCh.supermarket)} supermarket cans come to about ${simSupRate.toFixed(1)} cans a store a week, and its natural-grocer cans to about ${Math.round(simNatRate)} a store a week, against the buyers’ ${P.supermarket.cansPerWeek} and ${P.natural.cansPerWeek}.` },
    { p: `Put Ana’s ${LISTED} listings into the simulator’s rates of sale and its figure falls to about ${c0(Math.round(simOnAnaListings / 1000) * 1000)} cans; use her direct estimate as well and it is about ${c0(Math.round(simOnAnaListingsAnaDirect / 1000) * 1000)}. The rest of the gap is the rates of sale. How many stores will list Lantern, and how fast it sells in each, are the two things to research next.` },
    { p: `The gap matters for money as well as volume. M02’s pricing lesson put the default plan’s break-even at about ${c0(Math.round(breakEven / 1000) * 1000)} cans a year. On Ana’s estimate, the first year wouldn’t cover its fixed costs, and even the goal is below break-even; whether that is acceptable for a launch year is the board’s judgement, but the sizing makes it visible.` },

    { h: 'Sensitivity, ranges and sanity checks' },
    { p: 'A sizing model has many inputs, and they are not equally important. A <g>sensitivity analysis</g> moves one input at a time from a low to a high value you can defend, holding the others at their central values, and ranks the inputs by how much they move the answer. Ana’s low and high values, her own judgements after the buyer conversations (fictional), give the table below.' },
    { table: {
      caption: 'Sensitivity of Ana’s bottom-up estimate (central value 48,200 cans), largest swing first',
      head: ['Assumption (central value)', 'Low–high', 'Cans at low', 'Cans at high', 'Swing'],
      align: ['l', 'r', 'r', 'r', 'r'],
      rows: [
        [`Natural grocers: cans a store a week (${BASE[3]})`, `${LO[3]}–${HI[3]}`, c0(SW[3][0]), c0(SW[3][1]), c0(SW[3][1] - SW[3][0])],
        [`Own channel: cans a month (${c0(BASE[4])})`, `${LO[4]}–${c0(HI[4])}`, c0(SW[4][0]), c0(SW[4][1]), c0(SW[4][1] - SW[4][0])],
        [`Supermarkets: cans a store a week (${BASE[1]})`, `${LO[1]}–${HI[1]}`, c0(SW[1][0]), c0(SW[1][1]), c0(SW[1][1] - SW[1][0])],
        [`Supermarkets listing Lantern (${BASE[0]})`, `${LO[0]}–${HI[0]}`, c0(SW[0][0]), c0(SW[0][1]), c0(SW[0][1] - SW[0][0])],
        [`Natural grocers listing Lantern (${BASE[2]})`, `${LO[2]}–${HI[2]}`, c0(SW[2][0]), c0(SW[2][1]), c0(SW[2][1] - SW[2][0])],
      ],
    } },
    { p: `The rate of sale in natural grocers matters most: natural grocers supply the largest part of Ana’s estimate (${c0(NAT)} cans), and she is unsure of their rate (${LO[3]} to ${HI[3]} cans). Her range for the own channel is wider still in relative terms, but that channel supplies less. The ranking depends on the ranges, so they must be honest, not chosen to make a point.` },
    { p: `With every input at its low value the model gives ${c0(allLow)} cans, and with every one at its high value ${c0(allHigh)}. Those extremes are unlikely, but not because errors cancel: the three rates of sale all depend on how shoppers take to the can, so they may well miss together. With the listings as planned and every rate at its low value the model gives ${c0(ratesLow)} cans; at its high value, ${c0(ratesHigh)}. Even that is below ${c0(GOAL)}.` },
    { p: `Report the result as a range around a central figure and name what drives it: “about ${c0(Math.round(BU / 1000) * 1000)} cans, ${c0(Math.floor(SW[3][0] / 1000) * 1000)} to ${c0(Math.ceil(SW[3][1] / 1000) * 1000)} if any one assumption is off, and most sensitive to how fast it sells in natural grocers.” Then sanity-check the figure against what you already know.` },
    { list: [
      `<b>The category.</b> An average Harbour City supermarket sells about ${Math.round(supStoreWeek)} ready-to-drink coffee cans a week (${(chCans('supermarket') / 1e6).toFixed(2)} million ÷ ${SZ.stores.supermarket} ÷ ${WEEKS}), so Ana’s ${P.supermarket.cansPerWeek} cans would be ${pc(P.supermarket.cansPerWeek / supStoreWeek)} of a listing store’s category, plausible for a new brand. In natural grocers ${P.natural.cansPerWeek} of about ${Math.round(natStoreWeek)} is ${pc(P.natural.cansPerWeek / natStoreWeek + 1e-9, 2)}.`,
      '<b>Capacity.</b> Can the co-packer make the volume, and can a small team serve every store that lists the product?',
      '<b>Units and periods.</b> Weeks against months, cans against four-packs, a calendar year against a launch year that starts part-way through it.',
      '<b>Double counting.</b> A subscriber who buys in the online shop and in a supermarket appears in two routes.',
    ] },
    { p: 'A figure that fails a sanity check is wrong somewhere, even if every multiplication is right.' },
  ],

  formulas: [
    { id: 'ms-value', name: 'Market value from volume',
      tex: String.raw`V = Q \times \bar{p}`,
      where: [['V', 'Market value over the period', '$'], ['Q', 'Market volume over the period', 'units'], [String.raw`\bar{p}`, 'Average price per unit sold, at a stated level: the shelf price, or what producers receive', '$ per unit']],
      assumptions: 'The average is weighted by volume (the price of the average unit sold). A simple average of shelf prices is only a stand-in.',
      note: 'Producers’ value = shelf value × (1 − the trade’s share of the shelf price).' },
    { id: 'ms-topdown', name: 'Top-down sizing (a chain of shares)',
      tex: String.raw`Q_{\text{SAM}} = a \times Q_{\text{TAM}}, \qquad Q_{\text{SOM}} = m \times Q_{\text{SAM}}`,
      where: [[String.raw`Q_{\text{TAM}}`, 'Total addressable market: the category’s sales, all suppliers and channels', 'units or $'], [String.raw`a`, 'Share of the TAM the business’s offer and routes to market could serve', ''], [String.raw`Q_{\text{SAM}}`, 'Serviceable available market', 'units or $'], [String.raw`m`, 'Share of the SAM the business expects to win in the period', ''], [String.raw`Q_{\text{SOM}}`, 'Serviceable obtainable market: the estimate for the business', 'units or $']],
      assumptions: 'Each share applies to the figure before it, for the same products, place and period.',
      note: 'With several filters (channel, region, customer type), a is their product. The share m needs evidence of its own.' },
    { id: 'ms-outlets', name: 'Bottom-up sizing from outlets',
      tex: String.raw`Q = W \sum_{c} L_c \, v_c`,
      where: [['Q', 'Units sold in the period', 'units'], ['W', 'Weeks in the period', 'weeks'], [String.raw`L_c`, 'Outlets in channel c that stock the product', 'outlets'], [String.raw`v_c`, 'Rate of sale in channel c: units an outlet sells a week', 'units per outlet per week'], ['c', 'A channel', '']],
      assumptions: 'Every listing outlet in a channel sells at the channel’s average rate, every week of the period.',
      note: 'Add sales through any direct channel separately (cans a month × 12 for Lantern).' },
    { id: 'ms-customers', name: 'Bottom-up sizing from customers',
      tex: String.raw`Q = N \times r \times f \times u`,
      where: [['Q', 'Units sold in the period', 'units'], ['N', 'Customers in the target group', 'people or firms'], ['r', 'Share of them who buy in the period', ''], ['f', 'Purchases per buyer in the period', 'purchases'], ['u', 'Units per purchase', 'units']],
      assumptions: 'The share who buy and their frequency apply to the whole target group; segments that differ are summed separately (SUMPRODUCT).',
      note: 'Multiply by price for value; for a service, u is often 1 and f the number of visits.' },
    { id: 'ms-intent', name: 'Buyers from stated intent',
      tex: String.raw`B = N \sum_{k} c_k \, p_k`,
      where: [['B', 'Expected buyers', 'people'], ['N', 'People the survey represents', 'people'], [String.raw`p_k`, 'Share giving answer k (weighted to the population)', ''], [String.raw`c_k`, 'Conversion assumption: share of those giving answer k who will actually buy', ''], ['k', 'An answer on the intent scale (definitely, probably …)', '']],
      assumptions: 'The c_k are assumptions, ideally from comparable launches or past sales; they are not measured by the survey.',
      note: 'Show the result at low and high values of the c_k.' },
    { id: 'ms-required', name: 'Rate of sale needed to reach a goal',
      tex: String.raw`v^{*} = \dfrac{G - Q_{\text{other}}}{L \times W}`,
      where: [[String.raw`v^{*}`, 'Rate of sale needed in one channel', 'units per outlet per week'], ['G', 'The goal for the period', 'units'], [String.raw`Q_{\text{other}}`, 'Units expected from every other route', 'units'], ['L', 'Outlets listing the product in that channel', 'outlets'], ['W', 'Weeks in the period', 'weeks']],
      assumptions: 'The other routes deliver what the plan assumes.',
      note: 'Goal Seek finds the same value in a model. Solve for L instead to find the listings needed.' },
  ],

  examples: [
    { level: 'simple', title: 'Sizing a plant-based ice cream from the top down', fictional: true,
      setup: 'Quarrymoor Creamery (fictional) plans an oat-milk ice cream in 500 ml tubs for its home region. A trade report it bought says that shoppers in the region buy 9.0 million tubs of ice cream a year, 6% of them plant-based. The creamery will sell only through supermarkets and farm shops, which sell 80% of the plant-based tubs. Plant-based tubs average $6.50 on the shelf, and the shops keep 35% of the shelf price. Size the market in tubs and in dollars, and work out what 5% of the serviceable market would be worth to the creamery in a year.',
      steps: [
        String.raw`Define the market first. The creamery competes with other plant-based ice creams, so take the category as plant-based tubs in the region over a year. TAM: <m>9{,}000{,}000 \times 0.06 = 540{,}000</m> tubs. Defining it as all ice cream would give 9.0 million tubs and make every share look tiny.`,
        String.raw`Narrow to the channels it will use (the top-down chain): SAM <m>= 540{,}000 \times 0.80 = 432{,}000</m> tubs.`,
        String.raw`Convert to value at a stated price (<m>V = Q \times \bar{p}</m>). At shelf prices: <m>432{,}000 \times 6.50 = 2{,}808{,}000</m> dollars. At the creamery’s net price, after the shops’ 35%: <m>6.50 \times 0.65 = 4.225</m> dollars a tub, so <m>2{,}808{,}000 \times 0.65 = 1{,}825{,}200</m> dollars.`,
        String.raw`Apply the share: 5% of the SAM is <m>432{,}000 \times 0.05 = 21{,}600</m> tubs, worth <m>21{,}600 \times 4.225 = 91{,}260</m> dollars a year to the creamery.`,
      ],
      answer: 'TAM 540,000 tubs; SAM 432,000 tubs, worth $2.81 million at shelf prices or $1.83 million to producers; 5% of the SAM is 21,600 tubs, about $91,000 a year to Quarrymoor.',
      interpretation: 'The top-down chain gives the scale in four multiplications, but its last input, 5%, came from nowhere. Before the creamery plans production it should build the same figure from the bottom up: how many supermarkets and farm shops will stock the tub, and how many each sells a week.' },

    { level: 'challenging', title: 'Three estimates for a gluten-free loaf', fictional: true,
      setup: 'Tillworth Bakery (fictional) has six shops in its town and is deciding whether to bake a gluten-free loaf every day. It has three ways to estimate a year’s sales. (1) The town has 21,000 households; a regional shopper survey (fictional) found that 7% of households buy gluten-free bread, 1.2 loaves a week on average, and Tillworth sells about 15% of the bread the town buys. (2) In a two-week trial in its two busiest shops the loaf sold 40 and 34 a week, and those shops serve 1.4 times as many customers as the average Tillworth shop. (3) Its loyalty scheme has 2,600 members and records 55% of the bakery’s sales; 9% of members bought the trial loaf, about once a fortnight. Estimate the year’s loaves by each route, and decide what to plan for.',
      steps: [
        String.raw`Top-down (category × shares): <m>21{,}000 \times 0.07 = 1{,}470</m> households buy gluten-free bread; <m>1{,}470 \times 1.2 \times 52 = 91{,}728</m> loaves a year in the town, the TAM. At Tillworth’s usual 15%: <m>91{,}728 \times 0.15 \approx 13{,}759</m> loaves.`,
        String.raw`Bottom-up by shop (outlets × rate of sale × weeks): the trial shops averaged <m>(40 + 34) \div 2 = 37</m> loaves a week. An average shop would sell about <m>37 \div 1.4 \approx 26.4</m>, so six shops for 52 weeks give <m>26.43 \times 6 \times 52 \approx 8{,}246</m> loaves.`,
        String.raw`Bottom-up by customer (customers × share who buy × frequency × units): <m>2{,}600 \times 0.09 = 234</m> members buying, 26 times a year, one loaf each: <m>6{,}084</m> loaves. Members account for 55% of sales, so if other customers behave alike the total is <m>6{,}084 \div 0.55 \approx 11{,}062</m> loaves.`,
        'Read the gap. The two bottom-up routes give about 8,200 and 11,100; the top-down gives 13,800. The top-down assumes Tillworth wins gluten-free buyers at its usual share of all bread, but many such households may buy from supermarkets’ free-from shelves, which nothing here measured. The shop route may still be high, because a two-week trial catches curious first-time buyers; the customer route assumes that customers outside the scheme buy like its members. The customer route rests on the same two-week trial, so it isn’t independent of the shop route, and it assumes every member who tried the loaf buys it every fortnight all year, a repeat rate the trial couldn’t measure.',
        'Decide. Plan on the bottom-up range, about 8,000 to 11,000 loaves a year (roughly 160 to 210 a week across the six shops), and treat 13,800 as an upper bound until the share has been tested.',
      ],
      answer: 'Top-down about 13,759; by shop about 8,246; by customer about 11,062 loaves a year. Plan for about 8,000 to 11,000 (160 to 210 a week), not 13,800.',
      interpretation: 'The routes don’t agree, and that is informative: the gap sits on one assumption, the share of gluten-free buyers who would buy from a bakery. A month of real sales, compared week by week, will test it better than more desk research, so the bakery can start at the lower volume and revise after the first month.' },

    { level: 'applied', title: 'What would have to be true for 100,000 cans?', fictional: true,
      setup: `M02’s plan set a first-year goal of about ${c0(GOAL)} cans of Lantern Cold Brew. Ana’s bottom-up estimate, after talking to two store buyers, is ${c0(BU)}: ${P.supermarket.listed} of Harbour City’s ${SZ.stores.supermarket} supermarkets listing Lantern at ${P.supermarket.cansPerWeek} cans a store a week, ${P.natural.listed} of its ${SZ.stores.natural} natural and specialty grocers at ${P.natural.cansPerWeek}, and ${c0(SZ.directPerMonth)} cans a month through Lantern’s own channel. Her board asks whether the goal is realistic and, if not, what would have to be true to reach it.`,
      steps: [
        String.raw`Place both figures in the funnel (share of SAM = Q ÷ SAM). Goal: <m>100{,}000 \div 3{,}360{,}000 = 3.0\%</m>. Bottom-up: <m>48{,}200 \div 3{,}360{,}000 = 1.4\%</m>. The gap, <m>100{,}000 - 48{,}200 = 51{,}800</m> cans, is larger than the whole bottom-up estimate.`,
        String.raw`Rates of sale (the required-rate formula). Holding the listings and the own channel, the stores must sell <m>100{,}000 - 14{,}400 = 85{,}600</m> cans a year, <m>85{,}600 \div 52 \approx 1{,}646</m> a week across the ${LISTED} stores, against <m>300 + 350 = 650</m> in Ana’s plan: <m>${speedUp.toFixed(2)}</m> times her rates of sale in every store. If only the supermarkets sped up, they would need <m>(100{,}000 - 18{,}200 - 14{,}400) \div (30 \times 52) \approx 43.2</m> cans a store a week.`,
        String.raw`Listings. At 10 cans a week a supermarket adds <m>10 \times 52 = 520</m> cans a year, so with the natural grocers as planned the goal needs <m>67{,}400 \div 520 \approx 129.6</m> supermarkets: more than the 120 in Harbour City. With all 45 natural grocers listing (<m>45 \times 14 \times 52 = 32{,}760</m> cans), it still needs ${supStoresWithAllNat} of the 120.`,
        String.raw`Own channel. On its own it would need <m>(100{,}000 - 15{,}600 - 18{,}200) \div 12 \approx 5{,}517</m> cans a month, nearly a can a month for every one of the 6,000 people on Lantern’s mailing list.`,
        `Sanity-check the most plausible route. ${supRateNeeded.toFixed(1)} cans a week would be ${pc(supRateNeeded / supStoreWeek)} of an average supermarket’s ${Math.round(supStoreWeek)} category cans, for a brand known to about ${pc(LANTERN.awareness, 0)} of category buyers. The sensitivity table agrees: with every assumption at its high value the model reaches only ${c0(allHigh)} cans.`,
      ],
      answer: `On the evidence, ${c0(GOAL)} cans is a hope, not an estimate. It needs Lantern to sell ${speedUp.toFixed(1)} times as fast as the buyers expect in every listing store, or to be listed in more supermarkets than Harbour City has, or to sell nearly a can a month to everyone on its list. The bottom-up estimate is about ${c0(Math.round(BU / 1000) * 1000)} cans (${pc(BU / SAM)} of the SAM).`,
      interpretation: `Asking what would have to be true turned an argument about optimism into three conditions that can be checked. The board can now put the right questions to store buyers (how many stores, how fast) and fund a trial of rates of sale in a few stores. It also shows what is at stake: with M02’s break-even at about ${c0(Math.round(breakEven / 1000) * 1000)} cans, the first year is an investment on either figure.` },
  ],

  demo: [
    { widget: 'ms-model', intro: 'Ana’s sizing model as live formulas. Run Goal Seek as set (G12 to 100,000 by changing F9) and compare the rate of sale it finds with what an average supermarket sells of the whole category (B17). Then build the data table (listings in E9 down the side, the rate of sale in F9 across the top) and find the combinations that reach the goal. Change E10 or F10 to test the natural grocers, or B5 for the own channel.' },
    { widget: 'ms-swing', intro: 'The sensitivity table as a chart: each pair of bars shows how far the year-one estimate moves from 48,200 cans when one assumption goes to Ana’s low value (below the axis) or her high value (above it), the others held at their central values. Compare the lengths of the pairs to find the assumption to research first, then compare the longest bar with the 51,800 cans the goal would need.' },
  ],

  mistakes: [
    { title: '“Our TAM is the opportunity.”', html: 'The TAM counts every sale in the category, by every competitor, through every channel. A business can win only part of its SAM, and only with listings, customers and time. Lead with the SOM and show how it was built; quote the TAM for context.' },
    { title: '“One per cent of a big market is a safe assumption.”', html: 'A share chosen to sound modest is still an assumption, and for a new brand 1% can be hard. One per cent of Harbour City’s category is 48,000 cans, which is Ana’s whole plan: 55 listings at the buyers’ rates of sale plus 1,200 cans a month direct. Build the share from listings and rates of sale, or from customers, rather than picking it.' },
    { title: '“The goal is our forecast.”', html: 'A goal is a target; an estimate is what the evidence supports. When the two differ, as 100,000 and 48,200 do, work out what would have to be true for the goal, check it, and change either the plan or the goal.' },
    { title: '“Customers who say they will buy are buyers.”', html: 'Stated intent isn’t behaviour, and intentions-based forecasts can overstate or understate buying. Apply an explicit conversion rate to each answer, vary it, and remember that a question about the next three months measures trial, not repeat purchase.' },
    { title: '“A single number looks more professional.”', html: 'A point estimate hides how uncertain it is. Give a central figure, a range and the assumption that moves it most: that tells the reader what to watch and what to research next.' },
    { title: '“Volume times the average shelf price is the producers’ revenue.”', html: 'Shelf prices measure what shoppers spend. Producers receive the price after the trade’s margin, and a simple average of shelf prices isn’t weighted by what sells. State the price level and how the average was formed.' },
  ],

  application: [
    { p: 'Three people use market sizes in three different ways. An investor reading a start-up’s pitch looks past the TAM, which is usually large and easy to find, to how the SAM is defined and to the bottom-up build of the SOM: how many customers, at what price, reached through which channel. A pitch that offers only “1% of a huge market” hasn’t done the work.' },
    { p: 'A retailer’s category buyer, deciding whether to list a new product, thinks in rates of sale: how many units a store a week, against the products already on the shelf, and what the space and the listing fee would earn otherwise. A supplier that can show credible rates of sale from a trial, rather than a share of the national market, gets a more serious hearing.' },
    { p: 'A product manager uses the range, not the central figure, to plan production and stock. A first run sized to the central estimate, with a contract that allows a quick second run, keeps both too little and too much stock affordable. The assumption with the widest swing tells her what to measure first, usually in a small <g>test market</g> or a trial in a few stores.' },
    { case: `Ana’s note to her board, March 2027: “Our bottom-up estimate for Cold Brew’s first year is about ${c0(Math.round(BU / 1000) * 1000)} cans, ${pc(BU / SAM)} of the cans sold in our planned channels, and ${c0(Math.floor(SW[3][0] / 1000) * 1000)} to ${c0(Math.ceil(SW[3][1] / 1000) * 1000)} if any one assumption is off. The ${c0(GOAL)}-can goal would need us to sell ${speedUp.toFixed(1)} times as fast as the store buyers expect in every store that lists us, or to be listed in more supermarkets than Harbour City has. I propose we replace the goal with this range, size the first production run to the central figure, and measure rates of sale in a few stores before ordering a second. Whether to launch on these numbers is for our April review.”` },
    { p: 'The same discipline applies to a bakery planning a new loaf, a software firm pricing an add-on or a gym chain opening a site: define the market, build the estimate from parts someone can check, compare routes, and report a range with the assumption that drives it.' },
  ],

  summary: [
    'A market size is the quantity of a defined product bought by defined customers in a defined place and period, in units (volume) or money (value); change the definition and the size, and every share, change.',
    'TAM is the whole category, SAM the part the business’s offer and channels could serve, SOM the part it can realistically win; sources define them differently, so say what each of yours counts.',
    'Top-down multiplies the category by shares, and its weak link is the share you assume you will win. Bottom-up builds from outlets × rate of sale × weeks, or customers × share who buy × frequency × units.',
    'Value = volume × average price: say which price (shelf or producers’), and weight the average by volume where you can.',
    'Stated intent needs an explicit conversion assumption for each answer; vary it, and don’t mistake intent to try for repeat buying.',
    'Triangulate: estimate by independent routes and read a gap as a pointer to the assumption that differs.',
    'Run a sensitivity analysis, report a central figure with a range and its main driver, and sanity-check against the category, capacity, units and double counting.',
    'Ask what would have to be true for a goal: Lantern’s 100,000 cans needs 2.5 times the buyers’ rates of sale, or more supermarkets than Harbour City has.',
  ],

  glossary: [
    { term: 'Market size', def: 'The quantity of a product bought by a defined group of customers in a defined place over a defined period, measured in units (volume) or money (value).' },
    { term: 'Total addressable market', def: 'TAM: the whole demand for a product category in a defined place and period, whoever supplies it, measured either as what the category sells now or, as a ceiling, as every potential customer buying at the offer’s price. Definitions vary between sources; some describe it as the revenue available at a 100% market share.' },
    { term: 'Serviceable available market', def: 'SAM: the part of the total addressable market that a business’s offer and routes to market could serve, such as the sales in the channels it plans to use. Definitions vary between sources.' },
    { term: 'Serviceable obtainable market', def: 'SOM: the part of the serviceable available market that a business can realistically win in a stated period, given its resources and competitors. An estimate, not a goal.' },
    { term: 'Top-down market sizing', def: 'Estimating a market, or a business’s sales, by starting from the whole category and narrowing it with shares: the channels or segments served, then the share the business expects to win.' },
    { term: 'Bottom-up market sizing', def: 'Estimating a market, or a business’s sales, by building it from its parts: outlets × rate of sale × periods, or customers × the share who buy × how often × how much.' },
    { term: 'Rate of sale', def: 'The number of units of a product an outlet sells in a period, usually per store per week; also called velocity.' },
  ],

  references: [
    { text: 'TechTarget (2023). “What is TAM SAM SOM?” Written in 2019 and revised by TechTarget editors in 2023; definitions of TAM, SAM and SOM and of top-down and bottom-up sizing.', url: 'https://www.techtarget.com/enterprise-software/definition/TAM-SAM-SOM', checked: '2026-10-24' },
    { text: 'The Carta Team (2023, 14 April). “Market size: TAM, SAM, &amp; SOM”. Carta.', url: 'https://carta.com/blog/market-size/', checked: '2026-10-24' },
    { text: 'Armstrong, J. S., Morwitz, V. G. &amp; Kumar, V. (2000). Sales forecasts for existing consumer products and services: do purchase intentions contribute to accuracy? <i>International Journal of Forecasting</i>, 16(3), 383–397. The sentences on bias are in the authors’ working paper (MPRA paper 81689, April 2000).', url: 'https://mpra.ub.uni-muenchen.de/81689/1/MPRA_paper_81689.pdf', checked: '2026-10-24' },
    { text: 'U.S. Census Bureau. “County Business Patterns” (programme overview: establishments, employment and payroll by six-digit NAICS industry, for the nation, states, counties, metropolitan areas and ZIP codes, annually since 1964).', url: 'https://www.census.gov/econ/overview/mu0800.html', checked: '2026-10-24' },
    { text: 'U.S. Census Bureau. “About County Business Patterns (CBP)” (annual statistics for establishments with paid employees).', url: 'https://www.census.gov/programs-surveys/cbp/about.html', checked: '2026-10-24' },
    { text: 'Gomez Albrecht, M., Green, M. &amp; Hoffman, L. (2023). <i>Principles of Marketing</i>, section 6.3, “Steps in a Successful Marketing Research Plan” (internal and external secondary data, including an industry report of all related product sales). OpenStax.', url: 'https://openstax.org/books/principles-marketing/pages/6-3-steps-in-a-successful-marketing-research-plan', checked: '2026-10-24' },
  ],

  checks: [
    // concept
    { what: 'TAM cans (millions)', value: TAM / 1e6, shown: 4.8 },
    { what: 'Goal cans', value: GOAL, shown: 100000 },
    { what: 'Lantern receives in supermarkets', value: 3.49 * (1 - CH.supermarket.margin), shown: 2.37 },
    { what: 'Supermarket share of category', value: CH.supermarket.volume * 100, shown: 45 },
    { what: 'Natural share of category', value: CH.natural.volume * 100, shown: 15 },
    { what: 'Cafés and online share', value: CH.direct.volume * 100, shown: 10 },
    { what: 'Convenience share', value: CH.convenience.volume * 100, shown: 30 },
    { what: 'SAM share of TAM %', value: SAM / TAM * 100, shown: 70 },
    { what: 'SAM cans (millions)', value: SAM / 1e6, shown: 3.36 },
    { what: 'SAM cans', value: 0.7 * TAM, shown: 3360000 },
    { what: 'Supermarkets listing', value: P.supermarket.listed, shown: 30 },
    { what: 'Supermarket cans a store a week', value: P.supermarket.cansPerWeek, shown: 10 },
    { what: 'Natural listing', value: P.natural.listed, shown: 25 },
    { what: 'Natural cans a store a week', value: P.natural.cansPerWeek, shown: 14 },
    { what: 'Direct cans a month', value: SZ.directPerMonth, shown: 1200 },
    { what: 'Bottom-up total', value: BU, shown: 48200 },
    { what: 'Bottom-up = DERIVED', value: D.sizing.bottomUpCans, shown: 48200 },
    { what: 'Bottom-up share of SAM %', value: BU / SAM * 100, shown: 1.4, tol: 0.05 },
    { what: 'Goal share of SAM %', value: GOAL / SAM * 100, shown: 3.0, tol: 0.05 },
    { what: 'Goal share of SAM = DERIVED', value: D.sizing.goalShareOfSam * 100, shown: 2.98, tol: 0.005 },
    // theory
    { what: 'Bottom-up share of TAM %', value: BU / TAM * 100, shown: 1.0, tol: 0.05 },
    { what: 'Goal share of TAM %', value: GOAL / TAM * 100, shown: 2.1, tol: 0.05 },
    { what: '1% of TAM', value: TAM * 0.01, shown: 48000 },
    { what: 'Lantern awareness % (M02)', value: LANTERN.awareness * 100, shown: 12 },
    { what: 'Supermarkets in the city', value: SZ.stores.supermarket, shown: 120 },
    { what: 'Natural grocers in the city', value: SZ.stores.natural, shown: 45 },
    { what: 'Supermarket cans a year', value: SUP, shown: 15600 },
    { what: 'Natural cans a year', value: NAT, shown: 18200 },
    { what: 'Direct cans a year', value: DIR, shown: 14400 },
    { what: 'Audit observations', value: D.audit.observations, shown: 24 },
    { what: 'Audit mean price', value: AUD, shown: 3.15 },
    { what: 'TAM value at shelf ($m)', value: tamValue / 1e6, shown: 15.1, tol: 0.05 },
    { what: 'Mean of brand means', value: meanOfMeans, shown: 3.05 },
    { what: 'Brand means match audit (Summit)', value: brandMeans[0], shown: 3.87 },
    { what: 'TAM value at brand-mean price ($m)', value: TAM * meanOfMeans / 1e6, shown: 14.6, tol: 0.05 },
    { what: 'Trade margins 32–40%: low', value: Math.min(CH.supermarket.margin, CH.convenience.margin, CH.natural.margin) * 100, shown: 32 },
    { what: 'Trade margins 32–40%: high', value: Math.max(CH.supermarket.margin, CH.convenience.margin, CH.natural.margin) * 100, shown: 40 },
    { what: 'Weighted trade share %', value: tradeShare * 100, shown: 32.1, tol: 0.05 },
    { what: 'Producer value ($m)', value: producerValue / 1e6, shown: 10.3, tol: 0.05 },
    { what: 'Weighted top box %', value: pDef * 100, shown: 13.7, tol: 0.05 },
    { what: 'Weighted second box %', value: pProb * 100, shown: 24.6, tol: 0.05 },
    { what: 'List size', value: N, shown: 6000 },
    { what: 'People saying definitely', value: nDef, shown: 819, tol: 0.5 },
    { what: 'People saying probably', value: nProb, shown: 1475, tol: 0.5 },
    { what: 'Regular buyers at 40/10', value: mid, shown: 475, tol: 0.5 },
    { what: 'Cans a month at 40/10', value: mid * PACK, shown: 1900, tol: 0.5 },
    { what: 'Cans a month at 25/5', value: low * PACK, shown: 1114, tol: 0.5 },
    { what: 'Cans a month at 60/20', value: high * PACK, shown: 3146, tol: 0.5 },
    { what: 'Factor of nearly three', value: high / low, shown: 2.8, tol: 0.05 },
    { what: 'Truth top box %', value: tDef * 100, shown: 12.7, tol: 0.05 },
    { what: 'Truth second box %', value: tProb * 100, shown: 26.6, tol: 0.05 },
    { what: 'Truth cans a month at 40/10', value: truthMid * PACK, shown: 1854, tol: 0.5 },
    { what: 'Truth difference (rounded to 10)', value: Math.round((mid - truthMid) * PACK / 10) * 10, shown: 50 },
    { what: 'Listings', value: LISTED, shown: 55 },
    { what: 'Simulator units (rounded)', value: Math.round(SIM.year.units / 1000) * 1000, shown: 199000 },
    { what: 'Simulator supermarket cans', value: simCh.supermarket, shown: 92139, tol: 0.5 },
    { what: 'Simulator supermarket rate', value: simSupRate, shown: 14.8, tol: 0.05 },
    { what: 'Simulator natural rate', value: Math.round(simNatRate), shown: 37 },
    { what: 'Simulator on Ana’s listings (rounded)', value: Math.round(simOnAnaListings / 1000) * 1000, shown: 91000 },
    { what: 'Simulator on Ana’s listings and direct (rounded)', value: Math.round(simOnAnaListingsAnaDirect / 1000) * 1000, shown: 86000 },
    { what: 'M02 break-even (hand)', value: breakEven, shown: 117013 },
    { what: 'M02 break-even rounded', value: Math.round(breakEven / 1000) * 1000, shown: 117000 },
    { what: 'Swing natural rate low', value: SW[3][0], shown: 40400 },
    { what: 'Swing natural rate high', value: SW[3][1], shown: 56000 },
    { what: 'Swing natural rate', value: SW[3][1] - SW[3][0], shown: 15600 },
    { what: 'Swing direct low', value: SW[4][0], shown: 41000 },
    { what: 'Swing direct high', value: SW[4][1], shown: 55400 },
    { what: 'Swing direct', value: SW[4][1] - SW[4][0], shown: 14400 },
    { what: 'Swing supermarket rate low', value: SW[1][0], shown: 41960 },
    { what: 'Swing supermarket rate high', value: SW[1][1], shown: 54440 },
    { what: 'Swing supermarket rate', value: SW[1][1] - SW[1][0], shown: 12480 },
    { what: 'Swing supermarket listings low', value: SW[0][0], shown: 43000 },
    { what: 'Swing supermarket listings high', value: SW[0][1], shown: 53400 },
    { what: 'Swing supermarket listings', value: SW[0][1] - SW[0][0], shown: 10400 },
    { what: 'Swing natural listings low', value: SW[2][0], shown: 43104 },
    { what: 'Swing natural listings high', value: SW[2][1], shown: 51840 },
    { what: 'Swing natural listings', value: SW[2][1] - SW[2][0], shown: 8736 },
    { what: 'Natural grocers the largest part of the estimate', value: Number(NAT > SUP && NAT > DIR), shown: 1 },
    { what: 'Swing order: natural rate largest', value: Number([0, 1, 2, 4].every((i) => SW[i][1] - SW[i][0] < SW[3][1] - SW[3][0])), shown: 1 },
    { what: 'Base of the model', value: model(...BASE), shown: 48200 },
    { what: 'All low', value: allLow, shown: 20928 },
    { what: 'All high', value: allHigh, shown: 81920 },
    { what: 'Rates low, listings as planned', value: ratesLow, shown: 26960 },
    { what: 'Rates low by hand', value: 30 * 6 * 52 + 25 * 8 * 52 + 600 * 12, shown: 26960 },
    { what: 'Rates high, listings as planned', value: ratesHigh, shown: 69440 },
    { what: 'Rates high by hand', value: 30 * 14 * 52 + 25 * 20 * 52 + 1800 * 12, shown: 69440 },
    { what: 'Natural range low', value: LO[3], shown: 8 },
    { what: 'Natural range high', value: HI[3], shown: 20 },
    { what: 'Own channel relative range wider (±50% vs ±43%)', value: Number((HI[4] - LO[4]) / BASE[4] > (HI[3] - LO[3]) / BASE[3]), shown: 1 },
    { what: 'Bottom-up with intent-high direct (about 71,500)', value: SUP + NAT + high * PACK * 12, shown: 71500, tol: 50 },
    { what: 'Rounded to 500', value: Math.round((SUP + NAT + high * PACK * 12) / 500) * 500, shown: 71500 },
    { what: 'Range quoted: 40,000', value: Math.floor(SW[3][0] / 1000) * 1000, shown: 40000 },
    { what: 'Range quoted: 56,000', value: Math.ceil(SW[3][1] / 1000) * 1000, shown: 56000 },
    { what: 'Central figure about 48,000', value: Math.round(BU / 1000) * 1000, shown: 48000 },
    { what: 'Supermarket category cans a store a week', value: Math.round(supStoreWeek), shown: 346 },
    { what: 'Supermarket channel cans (millions)', value: chCans('supermarket') / 1e6, shown: 2.16 },
    { what: 'Lantern share of a listing supermarket %', value: P.supermarket.cansPerWeek / supStoreWeek * 100, shown: 2.9, tol: 0.05 },
    { what: 'Natural category cans a store a week', value: Math.round(natStoreWeek), shown: 308 },
    { what: 'Lantern share of a listing natural grocer %', value: P.natural.cansPerWeek / natStoreWeek * 100, shown: 4.55, tol: 0.0005 },
    // examples: Quarrymoor
    { what: 'Quarrymoor TAM', value: qTam, shown: 540000 },
    { what: 'Quarrymoor SAM', value: qSam, shown: 432000 },
    { what: 'Quarrymoor SAM at shelf', value: qShelf, shown: 2808000 },
    { what: 'Quarrymoor net price', value: qNet, shown: 4.225, tol: 0.0005 },
    { what: 'Quarrymoor producers’ value', value: qProd, shown: 1825200 },
    { what: 'Quarrymoor SOM', value: qSom, shown: 21600 },
    { what: 'Quarrymoor SOM value', value: qSomValue, shown: 91260 },
    { what: 'Quarrymoor $2.81m', value: qShelf / 1e6, shown: 2.81 },
    { what: 'Quarrymoor $1.83m', value: qProd / 1e6, shown: 1.83 },
    // Tillworth
    { what: 'Tillworth GF households', value: TB.households * TB.gf, shown: 1470 },
    { what: 'Tillworth town loaves (TAM)', value: tTown, shown: 91728 },
    { what: 'Tillworth top-down', value: tTop, shown: 13759, tol: 0.5 },
    { what: 'Tillworth trial average', value: tTrial, shown: 37 },
    { what: 'Tillworth average shop', value: tAvgShop, shown: 26.4, tol: 0.05 },
    { what: 'Tillworth by shop', value: tShop, shown: 8246, tol: 0.5 },
    { what: 'Tillworth members buying', value: tMembers, shown: 234 },
    { what: 'Tillworth member loaves', value: tMemberLoaves, shown: 6084 },
    { what: 'Tillworth by customer', value: tCust, shown: 11062, tol: 0.5 },
    { what: 'Tillworth about 8,200', value: tShop, shown: 8200, tol: 50 },
    { what: 'Tillworth about 11,100', value: tCust, shown: 11100, tol: 50 },
    { what: 'Tillworth about 13,800', value: tTop, shown: 13800, tol: 50 },
    { what: 'Tillworth about 160 a week', value: tShop / 52, shown: 160, tol: 2 },
    { what: 'Tillworth about 210 a week', value: tCust / 52, shown: 210, tol: 3 },
    // applied
    { what: 'Gap to goal', value: GOAL - BU, shown: 51800 },
    { what: 'Gap larger than bottom-up', value: Number(GOAL - BU > BU), shown: 1 },
    { what: 'Retail cans needed', value: retailNeed, shown: 85600 },
    { what: 'Retail cans needed a week', value: retailNeed / WEEKS, shown: 1646, tol: 0.5 },
    { what: 'Retail cans a week now', value: weeklyNow, shown: 650 },
    { what: 'Supermarket cans a week now', value: SUP / WEEKS, shown: 300 },
    { what: 'Natural cans a week now', value: NAT / WEEKS, shown: 350 },
    { what: 'Speed-up factor', value: speedUp, shown: 2.53, tol: 0.005 },
    { what: 'Speed-up 1 dp', value: speedUp, shown: 2.5, tol: 0.05 },
    { what: 'Supermarket rate needed', value: supRateNeeded, shown: 43.2, tol: 0.05 },
    { what: 'Supermarket cans a store a year', value: P.supermarket.cansPerWeek * WEEKS, shown: 520 },
    { what: 'Cans the supermarkets must supply', value: GOAL - NAT - DIR, shown: 67400 },
    { what: 'Supermarkets needed', value: supStoresNeeded, shown: 129.6, tol: 0.05 },
    { what: 'All natural cans', value: allNat, shown: 32760 },
    { what: 'Supermarkets needed with all natural', value: supStoresWithAllNat, shown: 102 },
    { what: 'Direct needed a month', value: directNeeded, shown: 5517, tol: 0.5 },
    { what: 'Rate needed as share of category %', value: supRateNeeded / supStoreWeek * 100, shown: 12.5, tol: 0.05 },
  ],
};
