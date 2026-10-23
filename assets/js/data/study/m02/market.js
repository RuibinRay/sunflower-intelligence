// market.js — the fictional market for Lantern Cold Brew, used by M02 The 4Ps Marketing Mix and the Marketing Mix
// Simulator. Every name and number here is invented for teaching: no real brand, retailer or market is described.
//
// Lantern Coffee Co. (the business from F01) plans to launch a ready-to-drink cold brew in 250 ml cans in
// Harbour City, a fictional metropolitan area. Lessons quote these figures in worked examples; the simulator
// (assets/js/core/mixsim.js) uses the same ones, so a student who works an example by hand and then opens the
// simulator sees the same costs, margins and competitors.

export const CATEGORY = {
  name: 'Ready-to-drink (RTD) coffee in cans',
  region: 'Harbour City (fictional)',
  cansPerYear: 4_800_000,            // all brands, all channels
  seasonality: [0.85, 1.05, 1.25, 0.85], // share of an average quarter's volume, Q1–Q4 (sums to 4)
  can: '250 ml',
};

/** Product choices: the liquid (tier) and how many flavours. Cost of goods per can includes liquid, can,
 *  co-packer fee and freight to the distributor. Quality is a 0–10 taste-panel score (fictional). */
export const TIERS = [
  { id: 'classic', name: 'Classic blend', detail: 'Brazil–Colombia blend, steeped 16 hours', quality: 6, cogs: 0.58 },
  { id: 'single', name: 'Single-origin', detail: 'Ethiopian single origin, steeped 20 hours', quality: 7.5, cogs: 0.74 },
  { id: 'organic', name: 'Organic single-origin', detail: 'Certified organic, steeped 20 hours', quality: 8.5, cogs: 0.88 },
];
export const RANGES = [
  { id: 'one', name: 'One flavour', flavours: ['Original'], skus: 1, fixed: 0 },
  { id: 'three', name: 'Three flavours', flavours: ['Original', 'Oat Milk Latte', 'Vanilla'], skus: 3, fixed: 12_000 }, // extra production runs, labels, plates
];

/** Where cans are sold. `volume` is the channel's share of category cans. `margin` is what the distributor and
 *  retailer together keep, as a share of the shelf price. `listing` is the yearly fee per SKU to be stocked
 *  (slotting, listing and merchandising). The direct channel has no trade margin but costs Lantern fulfilment. */
export const CHANNELS = [
  { id: 'supermarket', name: 'Supermarkets', volume: 0.45, margin: 0.32, listing: 9_000, fulfil: 0, note: 'Biggest volume; shoppers compare prices on the shelf.' },
  { id: 'convenience', name: 'Convenience stores', volume: 0.30, margin: 0.40, listing: 4_000, fulfil: 0, note: 'Impulse purchases, chilled singles; less price comparison.' },
  { id: 'natural', name: 'Natural and specialty grocers', volume: 0.15, margin: 0.38, listing: 2_000, fulfil: 0, note: 'Fewer shoppers, more of them pay for quality and provenance.' },
  { id: 'direct', name: 'Lantern cafés and online shop', volume: 0.10, margin: 0, listing: 0, fulfil: 0.45, fixed: 6_000, note: 'Lantern keeps the whole price but pays packing and delivery; reach is limited to its own customers.' },
];

/** Competitors (fictional). Price is the usual shelf price per can; awareness is the share of category buyers who
 *  know the brand; `in` lists the channels that stock it. */
export const COMPETITORS = [
  { id: 'summit', name: 'Summit Brew', position: 'Premium national brand', price: 3.79, quality: 8, awareness: 0.60, in: ['supermarket', 'convenience', 'natural'] },
  { id: 'daily', name: 'Daily Grind RTD', position: 'Value brand', price: 2.29, quality: 4.5, awareness: 0.75, in: ['supermarket', 'convenience'] },
  { id: 'arcadia', name: 'Arcadia Coffee', position: 'Mid-priced regional brand', price: 2.89, quality: 6, awareness: 0.50, in: ['supermarket', 'natural'] },
];

/** Promotion vehicles. Spend is per year, split evenly across quarters unless the simulator lets the user phase it. */
export const PROMOTION = [
  { id: 'digital', name: 'Social and search ads', does: 'Builds awareness; measurable clicks and reach.' },
  { id: 'sampling', name: 'In-store sampling and displays', does: 'Turns awareness into trial at the shelf.' },
  { id: 'trade', name: 'Trade promotions', does: 'Funds temporary price cuts in stores: more units now, less margin per can.' },
  { id: 'pr', name: 'PR and events', does: 'Earned coverage and local events; slower, cheaper awareness.' },
];

/** Lantern before the launch: people who already know the name from its catering and cafés. */
export const LANTERN = { awareness: 0.12, overhead: 60_000 }; // overhead: launch team and brand work per year, fixed

/** The plan the simulator opens with, and the one lessons use when they need "a sensible first plan". */
export const DEFAULT_PLAN = {
  tier: 'single',
  range: 'one',
  price: 3.49,
  channels: ['supermarket', 'natural', 'direct'],
  promotion: { digital: 50_000, sampling: 40_000, trade: 20_000, pr: 10_000 },
};
