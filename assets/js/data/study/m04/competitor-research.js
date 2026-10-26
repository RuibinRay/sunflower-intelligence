// competitor-research.js — M04 · Competitor research. Content only; exercises are in competitor-research.ex.js.
// Lantern: PRICE_AUDIT (the shelf-price audit, 15–19 March 2027), COMPETITORS and DEFAULT_PLAN (M02, re-exported by
// case.js) and FOCUS_GROUPS from case.js; Brewline Catering and Lantern's catering facts from M01's case (price per head,
// the five lost bids, the second van). Hobbarn Dairy and Thistlecombe Pet Foods are fictional. The codes and laws cited
// were read at their sources on the date in `references`. Not the office market or its competitors (the project's).
// Every printed figure is recomputed in `checks`.
import { PRICE_AUDIT, COMPETITORS, DEFAULT_PLAN, BREWLINE, CLIENT_INTERVIEWS, FOCUS_GROUPS, DERIVED as D } from './case.js?v=17';
import { BUSINESS, OUTLOOK_2027 } from '../m01/case.js?v=17';
import { TIERS } from '../m02/market.js?v=17';

// ---------------------------------------------------------------- the audit, as one row per shelf price
const BRANDS = PRICE_AUDIT.brands;                                         // Summit Brew, Daily Grind RTD, Arcadia Coffee
const CHANNEL_NAME = { supermarket: 'Supermarkets', convenience: 'Convenience stores', natural: 'Natural grocers' };
const ROWS = PRICE_AUDIT.stores.flatMap((s) => s.prices.map((p, j) => (p == null ? null : { store: s.id, channel: s.channel, brand: BRANDS[j], price: p, promo: !!(s.promo && s.promo[j]) }))).filter(Boolean);
const mean = (xs) => xs.reduce((a, b) => a + b, 0) / xs.length;
const sel = (f) => ROWS.filter(f).map((r) => r.price);
const avgB = (b) => mean(sel((r) => r.brand === b));
const avgBC = (b, c) => { const xs = sel((r) => r.brand === b && r.channel === c); return xs.length ? mean(xs) : null; };
const nBC = (b, c) => sel((r) => r.brand === b && r.channel === c).length;
const regBC = (b, c) => mean(sel((r) => r.brand === b && r.channel === c && !r.promo));
const minB = (b) => Math.min(...sel((r) => r.brand === b)), maxB = (b) => Math.max(...sel((r) => r.brand === b));
const [SUMMIT, DAILY, ARCADIA] = BRANDS;
const usual = Object.fromEntries(COMPETITORS.map((c) => [c.name, c.price]));
const PROMOS = ROWS.filter((r) => r.promo);
const LP = DEFAULT_PLAN.price;                                              // $3.49
const SINGLE_Q = TIERS.find((t) => t.id === DEFAULT_PLAN.tier).quality;      // 7.5 (M02's fictional taste panel)
const Q = Object.fromEntries(COMPETITORS.map((c) => [c.name, c.quality]));
const prem = (own, rival) => (own / rival - 1) * 100;
const depth = (reg, promo) => (reg - promo) / reg * 100;

// Brewline (M01)
const LANTERN_HEAD = BUSINESS.catering.pricePerHead, BREW_HEAD = BREWLINE.pricePerHead;

// examples (fictional)
const HOB = { own: { g: 500, p: 3.20 }, a: { g: 450, p: 2.95 }, b: { g: 1000, p: 5.60 }, c: { g: 600, p: 3.80 } };
const per100 = (x) => x.p / x.g * 100;
const TPF = { own: { sup: 1.45, pet: 1.65 }, a: { sup: 1.39, pet: 1.62, disc: 1.19 }, bReg: 1.29, bPromo: 0.99, bDisc: 0.99, n: { sup: 6, pet: 3, disc: 3 }, bPromoStores: 2 };
const tOwn = (TPF.n.sup * TPF.own.sup + TPF.n.pet * TPF.own.pet) / (TPF.n.sup + TPF.n.pet);
const tA = (TPF.n.sup * TPF.a.sup + TPF.n.pet * TPF.a.pet + TPF.n.disc * TPF.a.disc) / (TPF.n.sup + TPF.n.pet + TPF.n.disc);
const tBsup = ((TPF.n.sup - TPF.bPromoStores) * TPF.bReg + TPF.bPromoStores * TPF.bPromo) / TPF.n.sup;
const tB = (TPF.n.sup * tBsup + TPF.n.disc * TPF.bDisc) / (TPF.n.sup + TPF.n.disc);

// ---------------------------------------------------------------- formatting
const m2 = (x) => (Math.round(x * 100 + 1e-9) / 100).toFixed(2);
const d$ = (x) => `$${m2(x)}`;
const f1 = (x) => (Math.round(x * 10 + 1e-9) / 10).toFixed(1);

// ---------------------------------------------------------------- figure: the price ladder
function ladderFigure() {
  const L = 170, R = 610, lo = 1.9, hi = 4.3, x = (v) => L + ((v - lo) / (hi - lo)) * (R - L);
  const rowsY = { [SUMMIT]: 52, [ARCADIA]: 112, [DAILY]: 172 };
  let s = '<svg viewBox="0 0 640 260" xmlns="http://www.w3.org/2000/svg" font-family="inherit" font-size="12" fill="currentColor">';
  for (const b of [SUMMIT, ARCADIA, DAILY]) {
    const y = rowsY[b];
    s += `<text x="10" y="${y + 4}" font-weight="700">${b}</text>`;
    s += `<line x1="${L}" x2="${R}" y1="${y}" y2="${y}" stroke="var(--rule-strong)" stroke-width="1"/>`;
    const seen = {};
    ROWS.filter((r) => r.brand === b).sort((a, c) => a.price - c.price).forEach((r) => {
      const k = (seen[r.price] = (seen[r.price] || 0) + 1);
      const cy = y - 4 - (k - 1) * 9;
      s += r.promo ? `<circle cx="${x(r.price).toFixed(1)}" cy="${cy}" r="4" fill="none" stroke="var(--ink)" stroke-width="1.5"/>` : `<circle cx="${x(r.price).toFixed(1)}" cy="${cy}" r="4" fill="var(--ink)" opacity="0.75"/>`;
    });
    const mu = avgB(b);
    s += `<line x1="${x(mu).toFixed(1)}" x2="${x(mu).toFixed(1)}" y1="${y + 4}" y2="${y + 16}" stroke="var(--series-1)" stroke-width="3"/>`;
    s += `<text x="${x(mu).toFixed(1)}" y="${y + 29}" text-anchor="middle" font-size="11">average ${d$(mu)}</text>`;
  }
  s += `<line x1="${x(LP).toFixed(1)}" x2="${x(LP).toFixed(1)}" y1="24" y2="206" stroke="var(--series-2)" stroke-width="2" stroke-dasharray="6 4"/>`;
  s += `<text x="${x(LP).toFixed(1)}" y="16" text-anchor="middle" font-weight="700">Lantern Cold Brew ${d$(LP)}</text>`;
  s += `<line x1="${L}" x2="${R}" y1="222" y2="222" stroke="var(--ink)" stroke-width="1"/>`;
  for (let v = 2; v <= 4.01; v += 0.5) s += `<line x1="${x(v).toFixed(1)}" x2="${x(v).toFixed(1)}" y1="222" y2="227" stroke="var(--ink)"/><text x="${x(v).toFixed(1)}" y="241" text-anchor="middle" font-size="11">$${v.toFixed(2)}</text>`;
  s += `<text x="${R}" y="256" text-anchor="end" font-size="11" fill="var(--ink-3)">shelf price of a single 250 ml can; hollow circles are promotions</text>`;
  return `${s}</svg>`;
}

// ---------------------------------------------------------------- tables
const cell = (b, c) => { const v = avgBC(b, c); return v == null ? 'not stocked' : `${d$(v)} (${nBC(b, c)})`; };
const auditRows = PRICE_AUDIT.stores.map((s) => [s.id, CHANNEL_NAME[s.channel], ...s.prices.map((p, j) => (p == null ? 'not stocked' : `${d$(p)}${s.promo && s.promo[j] ? '*' : ''}`))]);

export default {
  slug: 'competitor-research',
  title: 'Competitor research',
  blurb: 'Find out what rivals offer, charge and plan, from sources you can use honestly: websites, price lists, reviews, job advertisements, trade shows, filings, customers and store checks. Run a shelf-price audit and summarise it by brand and channel, know where the professional codes and the law draw the line on mystery shopping and confidential information, and turn the findings into decisions about your own offer.',
  status: 'reviewed',
  objectives: [
    'Identify what to learn about a competitor (offer, price, positioning, distribution, promotion, resources, performance and plans) and the decision each answers.',
    'Choose and evaluate sources of competitor information, from websites and job advertisements to filings, customers and store checks.',
    'Design a shelf-price audit and summarise it by brand and channel with AVERAGEIFS, MINIFS and MAXIFS, comparing like with like and separating promoted prices.',
    'Apply the MRS and ESOMAR guidance on mystery shopping, SCIP’s code and the law on trade secrets to decide which research methods are acceptable.',
    'Construct a benchmarking table and turn its findings into implications and questions for your own offer.',
  ],
  prerequisites: [
    { lesson: 'm01/situation-analysis', why: 'The competitor analysis framework, market share and the competitive-strength scorecard are M01’s; this lesson supplies the research behind them.' },
    { lesson: 'b03/conditional-sums-and-counts', why: 'The audit is summarised with AVERAGEIFS, MINIFS, MAXIFS and COUNTIFS.' },
    { lesson: 'm02/pricing-approaches', why: 'Competition-based pricing and Lantern’s planned $3.49 are where the audit’s findings are used.' },
    { lesson: 'm04/the-research-process', why: 'Research ethics (honesty, consent, sugging) apply to competitor research too.' },
  ],
  case: 'lantern',

  concept: [
    { case: `In the week of 15–19 March 2027, Ana recorded the shelf price of a single 250 ml can of each of M02’s three brands, ${SUMMIT}, ${DAILY} and ${ARCADIA}, in ten Harbour City stores, chosen for convenience rather than at random: four supermarkets, three convenience stores and three natural and specialty grocers. She wants to know whether Lantern Cold Brew’s planned ${d$(LP)} still makes sense on real shelves. On the catering side, ${BREWLINE.name} won all ${CLIENT_INTERVIEWS.lostBids} of the bids Lantern lost in 2026, at ${d$(BREW_HEAD)} a head against Lantern’s ${d$(LANTERN_HEAD)}, and she knows little more about it than that.` },

    { h: 'What to find out about a competitor' },
    { p: 'M01’s <g>competitor analysis</g> asked whom customers compare you with and how you compare with them. This lesson is about the research behind it: what to find out, where to find it, and how to do so honestly. OpenStax calls the activity <g>competitive intelligence</g>, the collection of information about competitors from the marketplace on any element of the marketing mix, such as checking competitors’ prices, auditing their promotion or examining their distribution. It is one part of M01’s wider <g>market intelligence</g>.' },
    { table: {
      caption: 'Seven things to learn about a competitor, and the decision each informs',
      head: ['Topic', 'Questions to answer', 'Decision it informs'],
      rows: [
        ['Offer', 'What exactly does it sell: range, sizes, quality, service, guarantees?', 'Your product and its points of difference'],
        ['Price', 'What do customers actually pay, after discounts and promotions?', 'Your price level and price position'],
        ['Positioning', 'Whom does it target, and what does it claim to be best at?', 'Where to position against it'],
        ['Distribution', 'Where is it sold, how widely, and on what terms?', 'Channels and listings'],
        ['Promotion', 'What does it say, where and how often, with how much behind it?', 'Messages and budgets'],
        ['Resources', 'How big is it, what can it make or deliver, what can it spend?', 'How hard it can fight back'],
        ['Performance and plans', 'Is it growing, winning or losing customers, hiring, expanding?', 'Its likely next move'],
      ],
    } },
    { p: 'Collect what could change a decision, and no more. A file of every fact about every rival is expensive and soon out of date. A few facts about the two or three competitors that customers really compare you with, refreshed when they move, are worth far more.' },

    { h: 'Three rules of honest competitor research' },
    { p: 'Most of what a business needs to know about its competitors is public, or can be learned from customers who are free to say it. The difficulty is not access but discipline: knowing which facts matter, recording them so they can be compared, and staying on the right side of the professional codes and the law. Three rules cover most cases.' },
    { ol: [
      '<b>Observe what any customer could see.</b> Published prices, shelves, menus, adverts, job advertisements and filings are fair game; so is buying a rival’s product and testing it.',
      '<b>Ask people what they are free to tell you.</b> Customers, lost prospects and distributors can tell you why they chose a rival; don’t press them for documents they are bound to keep confidential.',
      '<b>Never lie, pay or pressure your way to what a rival keeps secret.</b> Bribery breaches every code; misrepresentation to obtain confidential information breaches their rules on honesty (SCIP’s requires you to say who you are before any interview); and for trade secrets misrepresentation, bribery and inducing a breach of confidence are improper means in law.',
    ] },
    { p: 'The rest of the lesson takes the sources in turn, then the store check, where most of Ana’s evidence comes from, then mystery shopping and the law, and finally how to turn findings into decisions.' },
  ],

  theory: [
    { h: 'Sources and what each is good for' },
    { table: {
      caption: 'Sources of competitor information',
      head: ['Source', 'Shows best', 'Watch for'],
      rows: [
        ['Websites, price lists, catalogues and menus', 'The published offer and list prices', 'List prices may not be what customers pay'],
        ['Store checks and shelf-price audits', 'Prices, promotions, range and availability on the shelf', 'A few stores in one week is a snapshot, not a census'],
        ['Reviews and social media', 'What customers like and dislike', 'Reviewers select themselves, so they aren’t a sample of customers'],
        ['Job advertisements', 'Plans: new sites, products and skills being hired', 'One advert is a hint; a pattern is evidence'],
        ['Trade shows and trade press', 'New products, prices, partners and people', 'Announcements are not results'],
        ['Annual reports and filings', 'Revenue, profit, capacity and stated strategy', 'Whole-company totals, rarely one product or city'],
        ['Customers, lost prospects, suppliers and distributors', 'Why buyers choose a rival and what it offers them', 'Some of what they know is confidential'],
      ],
    } },
    { p: 'Reviews are the easiest source to over-read. The people who post them form a <g>self-selected sample</g>, weighted towards the delighted and the furious, so they show what can go right or wrong, not how often. Count themes in them as you would code open answers, and never report a share of reviewers as a share of customers.' },
    { p: 'For listed companies, filings are the richest public source: the US Securities and Exchange Commission’s EDGAR system gives free access to the documents public companies file, with full-text search, and the secondary-research lesson describes what such filings contain. Most of a small business’s rivals are private, though, and for them the shelf, the trade and the customer matter more.' },
    { p: 'Customers see a rival’s offer from the side that matters. A <g>win–loss analysis</g> interviews buyers soon after they decide, both those who chose you and those who chose a competitor, about what decided it. Asking only the buyers who chose you invites <g>survivorship bias</g>, the flaw in M01’s client interviews; the prospects who went elsewhere hold the evidence you lack.' },

    { h: 'Store checks and shelf-price audits' },
    { p: 'A <g>store check</g> is a visit to a set of outlets to record what is actually on the shelf: which products, at what prices, with how much space, what is on promotion and what is out of stock. A <g>shelf-price audit</g> is a store check focused on prices. Its value is that it measures what shoppers face, not what a price list says. Five design decisions make an audit worth analysing.' },
    { ol: [
      '<b>Purpose.</b> Start from the decision. Ana’s is whether $3.49 fits, so she needs single cans of the rival brands, in the channels of her plan and, for comparison, convenience stores.',
      '<b>Which stores.</b> Cover each channel, and say how the stores were chosen. Only a <g>probability sample</g> of stores, drawn at random from a list of all of them, supports an estimate for the whole city with a margin of error (the sampling-methods lesson); otherwise the audit describes the stores visited.',
      '<b>When.</b> Visit every store in the same week, so that prices are compared under the same promotions; repeat the audit to learn how often rivals promote.',
      '<b>What to record.</b> The shelf price as shown, and when a promotion is on, the regular price too; the pack size; facings and out-of-stocks; the store and the date.',
      '<b>Like with like.</b> Compare the same pack size, or convert to a price per unit of volume, and compare within a channel before comparing across channels.',
    ] },
    { table: {
      caption: 'Ana’s shelf-price audit, 15–19 March 2027: a single 250 ml can (fictional case)',
      head: ['Store', 'Channel', SUMMIT, DAILY, ARCADIA],
      align: ['l', 'l', 'r', 'r', 'r'],
      rows: auditRows,
      note: '* on promotion that week. Store names withheld.',
    } },
    { table: {
      caption: 'Average shelf price by brand and channel (number of stores stocking it)',
      head: ['Brand', 'Supermarkets', 'Convenience stores', 'Natural grocers', 'All stores'],
      align: ['l', 'r', 'r', 'r', 'r'],
      rows: BRANDS.map((b) => [b, cell(b, 'supermarket'), cell(b, 'convenience'), cell(b, 'natural'), `${d$(avgB(b))} (${ROWS.filter((r) => r.brand === b).length})`]),
      note: 'Includes the two promoted prices at S2.',
    } },
    { p: `${SUMMIT} is the dearest brand in every channel and ${DAILY} the cheapest wherever it is sold. Convenience stores charge most for both brands they stock (${d$(avgBC(SUMMIT, 'convenience'))} and ${d$(avgBC(DAILY, 'convenience'))} on average), and natural grocers a little more than supermarkets. Across all stores the ranges are ${d$(minB(SUMMIT))} to ${d$(maxB(SUMMIT))} for ${SUMMIT}, ${d$(minB(DAILY))} to ${d$(maxB(DAILY))} for ${DAILY} and ${d$(minB(ARCADIA))} to ${d$(maxB(ARCADIA))} for ${ARCADIA}.` },
    { p: `Be careful with the “All stores” column. ${DAILY} isn’t sold in natural grocers and ${ARCADIA} isn’t sold in convenience stores, so each brand’s overall average mixes different channels, and the comparison between them partly measures where they are sold. Compare within a channel first.` },
    { p: `Two of the ${D.audit.observations} prices were promotions, both at S2: ${SUMMIT} at ${d$(PROMOS[0].price)} and ${DAILY} at ${d$(PROMOS[1].price)}. Against M02’s usual prices (${d$(usual[SUMMIT])} and ${d$(usual[DAILY])}) those are cuts of ${f1(depth(usual[SUMMIT], PROMOS[0].price))}% and ${f1(depth(usual[DAILY], PROMOS[1].price))}%, the <g>promotion depth</g>. Without them the supermarket averages are ${d$(regBC(SUMMIT, 'supermarket'))} for ${SUMMIT} and ${d$(regBC(DAILY, 'supermarket'))} for ${DAILY}. One week can’t show how often the rivals promote, and the audit missed something it should have recorded: the regular price beside each promoted one.` },
    { p: 'Finally, what the audit can’t say. Its ten stores were not drawn at random (four of Harbour City’s 120 supermarkets, for instance), so its averages describe those stores in that week, with no margin of error for the city. A simple average of shelf prices also ignores which stores sell most. It is good evidence of where the rivals’ prices sit; it is not evidence of what shoppers will do at $3.49, which is M02’s price-response question.' },
    { figure: {
      svg: ladderFigure(),
      caption: `The price ladder from Ana’s audit: every shelf price recorded for each brand, with its all-store average, and Lantern Cold Brew’s planned ${d$(LP)}. The averages mix channels (each brand is sold in different ones), so compare within a channel before reading much into them. Lantern sits between ${ARCADIA} and ${SUMMIT}, nearer ${SUMMIT}.`,
      alt: `A horizontal price scale from $2.00 to $4.00. Three rows of dots show every shelf price recorded. ${SUMMIT}: ten prices from ${d$(minB(SUMMIT))} to ${d$(maxB(SUMMIT))}, average ${d$(avgB(SUMMIT))}, one hollow dot for a promotion at ${d$(PROMOS[0].price)}. ${ARCADIA}: seven prices from ${d$(minB(ARCADIA))} to ${d$(maxB(ARCADIA))}, average ${d$(avgB(ARCADIA))}. ${DAILY}: seven prices from ${d$(minB(DAILY))} to ${d$(maxB(DAILY))}, average ${d$(avgB(DAILY))}, one hollow dot for a promotion at ${d$(PROMOS[1].price)}. A dashed vertical line at ${d$(LP)} marks Lantern Cold Brew, between the ${ARCADIA} and ${SUMMIT} rows’ prices, above every ${ARCADIA} price and below every ${SUMMIT} price.`,
    } },

    { h: 'Mystery shopping and its limits' },
    { p: '<g>Mystery shopping</g> means sending a trained researcher, posing as an ordinary customer, to experience and record a service. When a company shops its own outlets to check service standards, MRS’s guidelines require that its staff have been told it may happen. Shopping competitors is different, because their staff can’t be told, and the professional codes allow it only with care.' },
    { p: 'The MRS Code of Conduct (2023) allows recording only in a company’s own mystery shopping, where staff have been told it may happen, and refers members to separate MRS guidelines. Those guidelines (2011) say that a competitor’s staff must not be identified or recorded in any way, results must be reported in aggregate, the time taken should be as short as possible and no more than a normal customer enquiry, and the staff must suffer no detriment.' },
    { p: 'ESOMAR’s guideline on mystery shopping studies (2005) adds that such studies should be carried out only where no substantial disadvantage will result, with the time and other demands reasonable and kept to a minimum, since for a self-employed professional an enquiry can literally cost lost income; any booking should be cancelled as quickly as possible. Results must not be used to discipline or otherwise disadvantage individuals.' },
    { p: 'Competitive-intelligence professionals have a stricter rule for interviews. The code of ethics of the Strategic Consortium of Intelligence Professionals (SCIP) requires members to comply with all applicable laws and to disclose all relevant information, including their identity and organisation, before every interview. A sound working rule follows from all three: observe what any customer would see and buy what any customer would buy; don’t make a rival do work for a sale that will never happen (a detailed quote, a booking you will cancel) beyond what an ordinary enquiry takes; and never use a false identity to obtain information a real customer wouldn’t be given, or to question a rival’s staff.' },

    { h: 'The legal line: trade secrets' },
    { p: 'The law draws the outer line at trade secrets. In US federal law a <g>trade secret</g> is business information whose owner has taken reasonable measures to keep it secret and which has economic value because it is not generally known or readily found out by proper means (18 U.S.C. § 1839). Acquiring one by “improper means” is misappropriation under the same section, and improper means include theft, bribery, misrepresentation and inducing a breach of a duty to keep it secret; reverse engineering, independent derivation and other lawful means are expressly excluded.' },
    { p: 'The EU’s Trade Secrets Directive (2016/943) draws a similar line. In the UK its rules on lawful and unlawful acquisition take effect through the law of breach of confidence, with the Trade Secrets (Enforcement, etc.) Regulations 2018 filling gaps, as their explanatory note explains. Under the directive, observing, studying, taking apart or testing a product that has been made available to the public is lawful acquisition; unauthorised access to or copying of a holder’s documents, and any other conduct contrary to honest commercial practices, is not.' },
    { callout: 'warn', title: 'An outline, not legal advice', html: 'The practical message is the same everywhere: buy and test rivals’ products, read what they publish, and ask customers what they are free to tell you. Before anything close to the line, such as hiring a rival’s former employee or receiving a document someone shouldn’t have shared, take legal advice.' },

    { h: 'From findings to implications' },
    { p: '<g>Benchmarking</g> lays out your offer or performance beside competitors’ on the same measures. The table is only half the work: each row should end in an implication or a question for your own offer. A gap matters only if customers care about it, and a difference customers can’t see is no difference to them.' },
    { table: {
      caption: `Lantern’s catering against ${BREWLINE.name}: a benchmark from M01’s facts`,
      head: ['Measure', 'Lantern', BREWLINE.name, 'Implication or next question'],
      rows: [
        ['Price per head', d$(LANTERN_HEAD), d$(BREW_HEAD), `Lantern is ${Math.round(prem(LANTERN_HEAD, BREW_HEAD))}% dearer: it must show what the extra ${d$(LANTERN_HEAD - BREW_HEAD)} buys`],
        ['Service', 'Baristas serve at events', 'Self-serve urns and pod machines; no baristas', 'A difference only if clients see and value it'],
        ['Size', 'Smaller', 'Larger', 'Brewline can probably absorb a price war better; Lantern shouldn’t start one'],
        ['Record in 2026', `Lost ${CLIENT_INTERVIEWS.lostBids} bids, all on price`, `Won all ${CLIENT_INTERVIEWS.lostBids}`, 'Ask the five prospects what decided it'],
        ['Plans for 2027', '', 'A second van to serve Lantern’s district', 'Watch its job advertisements and bids in the district'],
        ['Not yet known', '', 'Client numbers, retention, menus, discounts', 'Win–loss calls, its published menus, the trade'],
      ],
    } },
    { p: `Read down the last column and a research plan appears. The price gap is known; what isn’t known is whether the buyers who chose Brewline would pay ${d$(LANTERN_HEAD - BREW_HEAD)} more for baristas if they saw them, which is a question for win–loss calls with the five prospects. Brewline’s second van is a threat to watch, and its job advertisements will say when it arrives. None of this needs anything but public information and honest questions.` },
  ],

  formulas: [
    { id: 'cr-premium', name: 'Price premium over a rival',
      tex: String.raw`\text{Premium} = \dfrac{P_{\text{own}} - P_{\text{rival}}}{P_{\text{rival}}} \times 100`,
      where: [[String.raw`\text{Premium}`, 'Price premium (negative: a discount)', '%'], [String.raw`P_{\text{own}}`, 'Your price for a comparable offer', '$'], [String.raw`P_{\text{rival}}`, 'The rival’s price for the same offer, in the same channel', '$']],
      assumptions: 'The two offers are comparable: same pack size or unit, same channel, both regular or both promoted prices.',
      note: 'Measured against the rival’s price, as M01 defines it. Measured against your own price, the same gap gives a smaller percentage.' },
    { id: 'cr-unit', name: 'Price per unit of volume',
      tex: String.raw`p_{100} = \dfrac{P}{S} \times 100`,
      where: [[String.raw`p_{100}`, 'Price per 100 ml or per 100 g', '$ per 100 ml or g'], ['P', 'Shelf price of the pack', '$'], ['S', 'Pack size', 'ml or g']],
      assumptions: 'The products are otherwise comparable; a multipack’s size is the total of its packs.' },
    { id: 'cr-depth', name: 'Promotion depth',
      tex: String.raw`d = \dfrac{P_{\text{reg}} - P_{\text{promo}}}{P_{\text{reg}}} \times 100`,
      where: [['d', 'Depth of the price cut', '%'], [String.raw`P_{\text{reg}}`, 'Regular shelf price', '$'], [String.raw`P_{\text{promo}}`, 'Promoted shelf price', '$']],
      assumptions: 'The regular price is the one shown on the shelf label at the same store, or a known usual price.' },
    { id: 'cr-mean', name: 'Average shelf price of a brand in a channel',
      tex: String.raw`\bar{p}_{bc} = \dfrac{1}{n_{bc}} \sum_{i \in (b,\,c)} p_i`,
      where: [[String.raw`\bar{p}_{bc}`, 'Average shelf price of brand b in channel c', '$'], [String.raw`n_{bc}`, 'Number of stores in channel c where brand b was recorded', 'stores'], [String.raw`p_i`, 'A recorded shelf price', '$'], ['b', 'A brand', ''], ['c', 'A channel', '']],
      assumptions: 'Each store counts once, whatever it sells; promoted and regular prices are averaged together unless separated.',
      note: 'In Excel: AVERAGEIFS(prices, brands, b, channels, c), with a third criterion to keep regular prices only.' },
  ],

  examples: [
    { level: 'simple', title: 'Comparing yoghurt prices across pack sizes', fictional: true,
      setup: 'Hobbarn Dairy (fictional) sells a 500 g pot of natural yoghurt at $3.20. In a store check it records three rivals: a 450 g pot at $2.95, a 1 kg pot at $5.60, and a multipack of four 150 g pots at $3.80. Which rival is cheapest per 100 g, and what is Hobbarn’s premium over it?',
      steps: [
        String.raw`Put every pack on the same unit (price per unit of volume). Hobbarn: <m>3.20 \div 500 \times 100 = 0.640</m> dollars per 100 g. The 450 g pot: <m>2.95 \div 450 \times 100 \approx 0.656</m>.`,
        String.raw`The 1 kg pot: <m>5.60 \div 1{,}000 \times 100 = 0.560</m>. The multipack holds <m>4 \times 150 = 600</m> g, so <m>3.80 \div 600 \times 100 \approx 0.633</m>.`,
        'Rank them: the 1 kg pot is cheapest per 100 g ($0.56), then the multipack ($0.63), Hobbarn ($0.64) and the 450 g pot ($0.66). On pack price alone the 450 g pot looked cheapest of the four.',
        String.raw`Premium over the cheapest per 100 g: <m>(0.640 - 0.560) \div 0.560 \times 100 \approx 14.3\%</m>.`,
      ],
      answer: 'The 1 kg pot is cheapest at about $0.56 per 100 g; Hobbarn’s $0.64 is a premium of about 14% over it, and Hobbarn is slightly cheaper per 100 g than the 450 g pot.',
      interpretation: 'Comparing pack prices would have made Hobbarn look dear against the $2.95 pot, when per 100 g it is cheaper. The real comparison is with the 1 kg pot, which suits a different shopper (a family buying in bulk), so Hobbarn may not compete with it directly at all: unit prices say where it sits, and the customer says whom it competes with.' },

    { level: 'challenging', title: 'An audit that flattered the competition', fictional: true,
      setup: 'Thistlecombe Pet Foods (fictional) audits 400 g tins of cat food in 12 stores: 6 supermarkets, 3 pet shops and 3 discount grocers. Its own tins average $1.45 in supermarkets and $1.65 in pet shops, and it isn’t sold in discounters. Rival A averages $1.39 in supermarkets, $1.62 in pet shops and $1.19 in discounters. Rival B is sold in supermarkets and discounters only: $1.29 in four supermarkets, $0.99 on promotion in the other two, and $0.99 in discounters. The sales director reads the all-store averages and concludes that Thistlecombe is 8.5% dearer than Rival A and 35% dearer than Rival B. Is she right?',
      steps: [
        String.raw`All-store averages, each store counted once: Thistlecombe <m>(6 \times 1.45 + 3 \times 1.65) \div 9 \approx 1.517</m>; Rival A <m>(6 \times 1.39 + 3 \times 1.62 + 3 \times 1.19) \div 12 \approx 1.398</m>; Rival B <m>(6 \times 1.19 + 3 \times 0.99) \div 9 \approx 1.123</m>, using B’s supermarket average <m>(4 \times 1.29 + 2 \times 0.99) \div 6 = 1.19</m>. Hence her 8.5% and 35%.`,
        String.raw`Compare within channels instead (the price-premium formula). Against Rival A: supermarkets <m>1.45 \div 1.39 - 1 \approx 4.3\%</m>, pet shops <m>1.65 \div 1.62 - 1 \approx 1.9\%</m>. The all-store gap is mostly channel mix: Thistlecombe is sold in pricey pet shops but not in cheap discounters, while Rival A is in both.`,
        String.raw`Separate the promotions. Rival B’s regular supermarket price is $1.29; its promotion cut that by <m>(1.29 - 0.99) \div 1.29 \approx 23.3\%</m> in two of the six supermarkets. Against the regular price, Thistlecombe’s premium is <m>1.45 \div 1.29 - 1 \approx 12.4\%</m>; against B’s supermarket average including the promotion it would be <m>1.45 \div 1.19 - 1 \approx 21.8\%</m>.`,
        'State what the audit can’t show: one week, twelve stores chosen by the team, no sales volumes. It can’t say how often Rival B promotes or how many tins sell at $0.99.',
      ],
      answer: 'No. Within the channels they share, Thistlecombe is about 2% to 4% dearer than Rival A, not 8.5%, and about 12% dearer than Rival B’s regular supermarket price; the larger figures came from mixing channels and promoted prices.',
      interpretation: 'Two habits would have prevented the wrong conclusion: compare within a channel, and keep regular and promoted prices apart. Rival B’s 23% promotion in a third of supermarkets is the real news. If it is a regular pattern, a repeat audit over several weeks will show it, and Thistlecombe’s response should be planned around how often B promotes, not around its average price.' },

    { level: 'applied', title: 'Does $3.49 fit Harbour City’s shelves?', fictional: true,
      setup: `Use Ana’s audit to judge where Lantern Cold Brew’s planned ${d$(LP)} would sit in the two retail channels of her plan, supermarkets and natural grocers, and what the audit can and can’t tell her about it. In M02, ${SUMMIT} is the premium national brand, ${ARCADIA} the mid-priced regional brand and ${DAILY} the value brand.`,
      steps: [
        `Take the channel averages (the average-price formula, in Excel AVERAGEIFS by brand and channel), to three decimals so as not to round twice: supermarkets ${SUMMIT} $${avgBC(SUMMIT, 'supermarket').toFixed(3)}, ${ARCADIA} $${avgBC(ARCADIA, 'supermarket').toFixed(3)}, ${DAILY} $${avgBC(DAILY, 'supermarket').toFixed(3)}; natural grocers ${SUMMIT} $${avgBC(SUMMIT, 'natural').toFixed(3)}, ${ARCADIA} $${avgBC(ARCADIA, 'natural').toFixed(3)}.`,
        `Work out Lantern’s position in supermarkets (the price-premium formula): ${d$(LP)} is ${f1(-prem(LP, avgBC(SUMMIT, 'supermarket')))}% below ${SUMMIT}, ${f1(prem(LP, avgBC(ARCADIA, 'supermarket')))}% above ${ARCADIA} and ${f1(prem(LP, avgBC(DAILY, 'supermarket')))}% above ${DAILY}. With the S2 promotions left out, ${SUMMIT}’s regular average is ${d$(regBC(SUMMIT, 'supermarket'))}, so Lantern is ${f1(-prem(LP, regBC(SUMMIT, 'supermarket')))}% below it.`,
        `In natural grocers: ${f1(-prem(LP, avgBC(SUMMIT, 'natural')))}% below ${SUMMIT} and ${f1(prem(LP, avgBC(ARCADIA, 'natural')))}% above ${ARCADIA}. Prices there run higher, so the same ${d$(LP)} sits relatively lower, ${d$(avgBC(SUMMIT, 'natural') - LP)} under ${SUMMIT}.`,
        `Set it beside the qualitative evidence, without turning it into a share. In March’s focus groups one ready-to-drink buyer said, “${FOCUS_GROUPS.quotes[4].text}” The gap to ${DAILY} in supermarkets is ${d$(LP - avgBC(DAILY, 'supermarket'))}: Lantern needs a visible reason, which is what the single-origin liquid and the can are for.`,
        'List what the audit can’t say: ten stores not chosen at random, one week, two promotions, no sales volumes. It shows where rivals’ prices sit, not how many shoppers will pay $3.49.',
      ],
      answer: `${d$(LP)} places Lantern between ${ARCADIA} and ${SUMMIT} in both planned channels, nearer ${SUMMIT}: about ${Math.round(-prem(LP, avgBC(SUMMIT, 'supermarket')))}% below ${SUMMIT} and ${Math.round(prem(LP, avgBC(ARCADIA, 'supermarket')))}% above ${ARCADIA} in supermarkets, about ${Math.round(-prem(LP, avgBC(SUMMIT, 'natural')))}% below ${SUMMIT} and ${Math.round(prem(LP, avgBC(ARCADIA, 'natural')))}% above ${ARCADIA} in natural grocers. That is consistent with M02’s plan: a single-origin can whose taste-panel score (${SINGLE_Q}) lies between ${ARCADIA}’s and ${SUMMIT}’s, priced below the premium leader.`,
      interpretation: 'The audit confirms that $3.49 is coherent on today’s shelves; it doesn’t confirm that it will sell. Two follow-ups would strengthen it: a repeat audit in a month, recording regular prices beside promotions, to see how often Summit and Daily Grind promote; and the rates-of-sale trial from the market-sizing lesson, which tests what shoppers do at $3.49 rather than where the price sits.' },
  ],

  demo: [
    { widget: 'cr-pivot', intro: 'Ana’s 24 shelf prices as a PivotTable. It opens with the average price by brand and channel. Switch the value to Min or Max to see each brand’s range, put Promotion in the filter and keep only “No” to see regular prices, and count observations to see which brands each channel stocks.' },
    { widget: 'cr-sheet', intro: 'The same audit as a worksheet, one row per shelf price, with AVERAGEIFS, MINIFS, MAXIFS and COUNTIFS summaries. Change a price in column D, or mark another price as a promotion in column E, and watch the summaries respond. Show the formulas to see how the brand in column G and the channel in row 7 are read.' },
  ],

  mistakes: [
    { title: '“The list price is the price.”', html: 'Customers pay shelf prices, discounts and promotions. A rival’s published price list is a starting point; a store check or a buyer’s account of what was quoted shows what customers actually pay.' },
    { title: '“Averages across all stores compare brands fairly.”', html: 'Brands are stocked in different channels, and channels price differently. An all-store average partly measures where a brand is sold. Compare within a channel first, then across channels.' },
    { title: '“Promotions are just part of the average.”', html: 'Mixing promoted and regular prices hides both the regular price level and the promotion strategy. Record the regular price beside every promoted one, report them separately, and repeat the audit to learn how often rivals promote.' },
    { title: '“Ten stores tell us the city’s average price.”', html: 'An audit of stores chosen by the researcher describes those stores in that week. An estimate for every store in the city, with a margin of error, needs stores drawn at random from a full list.' },
    { title: '“Posing as a customer is just good research.”', html: 'Observing an ordinary customer experience is accepted with conditions: no identifying or recording rivals’ staff, no more of their time than a normal enquiry, results in aggregate. A detailed quote for an event that will never happen goes beyond those conditions, SCIP’s code forbids interviewing under a false identity, and for trade secrets misrepresentation is improper means in law.' },
    { title: '“A benchmark table is the conclusion.”', html: 'A table of differences is evidence, not a decision. Each row needs an implication or a question for your own offer, and a gap matters only if customers care about it.' },
  ],

  application: [
    { p: 'In many consumer-goods companies, competitor research is routine rather than occasional. Field sales teams record shelf prices, facings and promotions on their store visits; the brand manager receives a monthly summary by channel and chain and compares each rival’s regular and promoted prices with the brand’s own. The summary feeds two decisions: whether the brand’s price position still matches its positioning, and when to expect a rival’s promotion and plan around it.' },
    { p: 'A business-to-business firm learns most from its bids. After each win or loss, someone who wasn’t on the sales team phones the buyer and asks what decided it, what the winner offered and what would have changed the outcome. Over a year the pattern of answers says more about a rival’s pricing and service than any website, and it is entirely honest, because the buyer chooses what to share.' },
    { p: 'Hotels, airlines and online retailers can track rivals’ published prices every day, by hand or, within the sites’ terms of use, with software that reads the rivals’ public websites. The rule of thumb that keeps it honest is the same as in a store: collect what any customer could see, and nothing a rival has kept private.' },
    { case: `Ana’s note after the audit, March 2027: “On the shelves we checked, ${d$(LP)} puts us between ${ARCADIA} and ${SUMMIT} in both of our planned channels, about 22 to 40 cents under ${SUMMIT}, which fits a single-origin can that undercuts the premium leader. It doesn’t tell us how many cans we’ll sell. I will repeat the audit in April and record regular prices beside any promotions. For catering, I’m booking short calls with the five organisations that chose Brewline, asking what decided it and what they were offered if they are free to say, and I’ll keep an eye on Brewline’s job advertisements for drivers.”` },
    { p: 'In each case the method is the same: decide what you need to know for a decision, collect it from sources you can use openly, compare like with like, and end with what it means for your own offer.' },
  ],

  summary: [
    'Competitor research finds out what rivals offer and charge, how they position, distribute and promote, what resources they have and what they plan; collect only what could change a decision.',
    'Sources range from websites, price lists, reviews and job advertisements to trade shows, filings and, most valuable, customers and lost prospects (win–loss analysis).',
    'A shelf-price audit records what shoppers actually face. Design it around the decision: the same pack, every store in the same week, regular prices beside promoted ones, and an honest statement of how the stores were chosen.',
    'Summarise by brand within each channel (AVERAGEIFS, MINIFS, MAXIFS), separate promotions, and convert to a price per unit when pack sizes differ.',
    'The MRS and ESOMAR guidance allows mystery shopping of competitors only with care: staff not identified or recorded, minimal time, results in aggregate. SCIP requires identity to be disclosed before interviews.',
    'Trade secrets are protected in law: misrepresentation, bribery and inducing a breach of confidence are improper means; buying and testing a product sold to the public is not.',
    'Benchmarking puts offers side by side; each row should end in an implication or a question for your own offer.',
  ],

  glossary: [
    { term: 'Competitive intelligence', def: 'The collection and analysis of information about competitors (their offers, prices, distribution, promotion, resources and plans) from the marketplace, by lawful and ethical means, for decisions.' },
    { term: 'Win–loss analysis', def: 'Interviewing buyers soon after a decision, both those who chose you and those who chose a competitor, about what decided it.' },
    { term: 'Store check', def: 'A visit to a set of outlets to record what is actually on the shelf: products, prices, space, promotions and out-of-stocks.' },
    { term: 'Shelf-price audit', def: 'A store check focused on prices: recording the shelf price of defined products in a set of stores over a short period, with promotions marked.' },
    { term: 'Promotion depth', def: 'The size of a temporary price cut as a percentage of the regular price: (regular − promoted) ÷ regular.' },
    { term: 'Mystery shopping', def: 'Research in which a trained researcher, posing as an ordinary customer, experiences and records a service; of a company’s own outlets, or with conditions of competitors’.' },
    { term: 'Trade secret', def: 'Business information that has value because it is not generally known and that its holder takes reasonable steps to keep secret; acquiring it by improper means, such as misrepresentation, bribery or inducing a breach of confidence, is misappropriation in US law, and EU and UK law call it unlawful acquisition.' },
    { term: 'Benchmarking', def: 'Comparing a business’s offer, prices or performance with competitors’ on the same measures, side by side, to find gaps and their implications.' },
  ],

  references: [
    { text: 'Gomez Albrecht, M., Green, M. &amp; Hoffman, L. (2023). <i>Principles of Marketing</i>, section 6.2, “Sources of Marketing Information” (competitive intelligence). OpenStax.', url: 'https://openstax.org/books/principles-marketing/pages/6-2-sources-of-marketing-information', checked: '2026-10-24' },
    { text: 'Market Research Society (2023). <i>MRS Code of Conduct</i>, operative from 15 May 2023 (rule 29 and its comment on mystery shopping).', url: 'https://www.mrs.org.uk/pdf/MRS-code-of-conduct-2023.pdf', checked: '2026-10-24' },
    { text: 'Market Research Society (2011). <i>MRS Guidelines for Mystery Shopping (Research)</i>, interpreting the 2010 Code (competitor mystery shopping, rule B44).', url: 'https://www.mrs.org.uk/pdf/2013-01-14%20Mystery%20Shopping%20Research%20Guidelines.pdf', checked: '2026-10-24' },
    { text: 'ESOMAR (2005). <i>Mystery Shopping Studies</i>, ESOMAR World Research Codes &amp; Guidelines.', url: 'https://ana.esomar.org/api/public/document/file_renderer/6672', checked: '2026-10-24' },
    { text: 'Strategic Consortium of Intelligence Professionals (SCIP). “SCIP Code of Ethics”.', url: 'https://www.scip.org/page/CodeOfEthics', checked: '2026-10-24' },
    { text: '18 U.S.C. § 1839, Definitions (“trade secret” and “improper means”), Legal Information Institute, Cornell Law School.', url: 'https://www.law.cornell.edu/uscode/text/18/1839', checked: '2026-10-24' },
    { text: 'Directive (EU) 2016/943 of 8 June 2016 on the protection of undisclosed know-how and business information (trade secrets), Chapter II, Articles 3 and 4, as published on legislation.gov.uk (title and dates confirmed on EUR-Lex).', url: 'https://www.legislation.gov.uk/eudr/2016/943/chapter/II', checked: '2026-10-24' },
    { text: 'The Trade Secrets (Enforcement, etc.) Regulations 2018 (SI 2018/597), explanatory note: Chapter II of the directive is implemented in the UK by the common law and equity of breach of confidence, and the Regulations address the gaps. legislation.gov.uk.', url: 'https://www.legislation.gov.uk/uksi/2018/597/note/made', checked: '2026-10-24' },
  ],

  checks: [
    // concept
    { what: 'Lantern price', value: LP, shown: 3.49 },
    { what: 'Brewline price per head', value: BREW_HEAD, shown: 7.5 },
    { what: 'Lantern price per head', value: LANTERN_HEAD, shown: 9 },
    { what: 'Lost bids', value: CLIENT_INTERVIEWS.lostBids, shown: 5 },
    { what: 'Stores audited', value: PRICE_AUDIT.stores.length, shown: 10 },
    { what: 'Supermarkets audited', value: PRICE_AUDIT.stores.filter((s) => s.channel === 'supermarket').length, shown: 4 },
    { what: 'Convenience audited', value: PRICE_AUDIT.stores.filter((s) => s.channel === 'convenience').length, shown: 3 },
    { what: 'Natural audited', value: PRICE_AUDIT.stores.filter((s) => s.channel === 'natural').length, shown: 3 },
    // theory
    { what: 'Observations', value: ROWS.length, shown: 24 },
    { what: 'Observations = DERIVED', value: D.audit.observations, shown: 24 },
    { what: 'Summit supermarket average', value: avgBC(SUMMIT, 'supermarket'), shown: 3.715, tol: 0.0005 },
    { what: 'Summit convenience average', value: avgBC(SUMMIT, 'convenience'), shown: 4.06 },
    { what: 'Summit natural average', value: avgBC(SUMMIT, 'natural'), shown: 3.89 },
    { what: 'Summit all average', value: avgB(SUMMIT), shown: 3.87 },
    { what: 'Daily supermarket average', value: avgBC(DAILY, 'supermarket'), shown: 2.19 },
    { what: 'Daily convenience average', value: avgBC(DAILY, 'convenience'), shown: 2.52 },
    { what: 'Daily all average', value: avgB(DAILY), shown: 2.33 },
    { what: 'Arcadia supermarket average', value: avgBC(ARCADIA, 'supermarket'), shown: 2.89 },
    { what: 'Arcadia natural average', value: avgBC(ARCADIA, 'natural'), shown: 3.02 },
    { what: 'Arcadia all average', value: avgB(ARCADIA), shown: 2.95 },
    { what: 'Stores stocking Summit', value: ROWS.filter((r) => r.brand === SUMMIT).length, shown: 10 },
    { what: 'Stores stocking Daily', value: ROWS.filter((r) => r.brand === DAILY).length, shown: 7 },
    { what: 'Stores stocking Arcadia', value: ROWS.filter((r) => r.brand === ARCADIA).length, shown: 7 },
    { what: 'Summit min', value: minB(SUMMIT), shown: 3.59 },
    { what: 'Summit max', value: maxB(SUMMIT), shown: 4.19 },
    { what: 'Daily min', value: minB(DAILY), shown: 1.99 },
    { what: 'Daily max', value: maxB(DAILY), shown: 2.59 },
    { what: 'Arcadia min', value: minB(ARCADIA), shown: 2.79 },
    { what: 'Arcadia max', value: maxB(ARCADIA), shown: 3.09 },
    { what: 'Promotions', value: PROMOS.length, shown: 2 },
    { what: 'Summit promo price', value: PROMOS[0].price, shown: 3.59 },
    { what: 'Daily promo price', value: PROMOS[1].price, shown: 1.99 },
    { what: 'Summit usual (M02)', value: usual[SUMMIT], shown: 3.79 },
    { what: 'Daily usual (M02)', value: usual[DAILY], shown: 2.29 },
    { what: 'Summit promotion depth %', value: depth(usual[SUMMIT], PROMOS[0].price), shown: 5.3, tol: 0.05 },
    { what: 'Daily promotion depth %', value: depth(usual[DAILY], PROMOS[1].price), shown: 13.1, tol: 0.05 },
    { what: 'Summit regular supermarket average', value: regBC(SUMMIT, 'supermarket'), shown: 3.76 },
    { what: 'Daily regular supermarket average', value: regBC(DAILY, 'supermarket'), shown: 2.26 },
    { what: 'Supermarkets in the city', value: 120, shown: 120 },
    { what: 'Brewline premium %', value: prem(LANTERN_HEAD, BREW_HEAD), shown: 20 },
    { what: 'Extra per head', value: LANTERN_HEAD - BREW_HEAD, shown: 1.5 },
    { what: 'Brewline second van (M01)', value: Number(OUTLOOK_2027.brewlineSecondVan), shown: 1 },
    { what: 'Promotions both at S2', value: Number(PROMOS.every((r) => r.store === 'S2')), shown: 1 },
    // Hobbarn
    { what: 'Hobbarn per 100 g', value: per100(HOB.own), shown: 0.64 },
    { what: 'Rival 450 g per 100 g', value: per100(HOB.a), shown: 0.656, tol: 0.0005 },
    { what: 'Rival 1 kg per 100 g', value: per100(HOB.b), shown: 0.56 },
    { what: 'Multipack grams', value: 4 * 150, shown: 600 },
    { what: 'Multipack per 100 g', value: per100(HOB.c), shown: 0.633, tol: 0.0005 },
    { what: 'Rival 450 g per 100 g (2 dp)', value: per100(HOB.a), shown: 0.66 },
    { what: 'Multipack per 100 g (2 dp)', value: per100(HOB.c), shown: 0.63 },
    { what: 'Hobbarn premium over 1 kg %', value: prem(per100(HOB.own), per100(HOB.b)), shown: 14.3, tol: 0.05 },
    { what: 'Hobbarn about 14%', value: prem(per100(HOB.own), per100(HOB.b)), shown: 14, tol: 0.5 },
    // Thistlecombe
    { what: 'Thistlecombe all-store', value: tOwn, shown: 1.517, tol: 0.0005 },
    { what: 'Rival A all-store', value: tA, shown: 1.398, tol: 0.0005 },
    { what: 'Rival B supermarket average', value: tBsup, shown: 1.19 },
    { what: 'Rival B all-store', value: tB, shown: 1.123, tol: 0.0005 },
    { what: 'All-store premium over A %', value: prem(tOwn, tA), shown: 8.5, tol: 0.05 },
    { what: 'All-store premium over B %', value: prem(tOwn, tB), shown: 35, tol: 0.5 },
    { what: 'Supermarket premium over A %', value: prem(TPF.own.sup, TPF.a.sup), shown: 4.3, tol: 0.05 },
    { what: 'Pet-shop premium over A %', value: prem(TPF.own.pet, TPF.a.pet), shown: 1.9, tol: 0.05 },
    { what: 'B promotion depth %', value: depth(TPF.bReg, TPF.bPromo), shown: 23.3, tol: 0.05 },
    { what: 'Premium over B regular %', value: prem(TPF.own.sup, TPF.bReg), shown: 12.4, tol: 0.05 },
    { what: 'Premium over B supermarket average %', value: prem(TPF.own.sup, tBsup), shown: 21.8, tol: 0.05 },
    { what: 'Stores audited (Thistlecombe)', value: TPF.n.sup + TPF.n.pet + TPF.n.disc, shown: 12 },
    // applied
    { what: 'Below Summit in supermarkets %', value: -prem(LP, avgBC(SUMMIT, 'supermarket')), shown: 6.1, tol: 0.05 },
    { what: 'Above Arcadia in supermarkets %', value: prem(LP, avgBC(ARCADIA, 'supermarket')), shown: 20.8, tol: 0.05 },
    { what: 'Above Daily in supermarkets %', value: prem(LP, avgBC(DAILY, 'supermarket')), shown: 59.4, tol: 0.05 },
    { what: 'Below Summit regular in supermarkets %', value: -prem(LP, regBC(SUMMIT, 'supermarket')), shown: 7.1, tol: 0.05 },
    { what: 'Below Summit in natural %', value: -prem(LP, avgBC(SUMMIT, 'natural')), shown: 10.3, tol: 0.05 },
    { what: 'Above Arcadia in natural %', value: prem(LP, avgBC(ARCADIA, 'natural')), shown: 15.4, tol: 0.05 },
    { what: 'Under Summit in natural ($)', value: avgBC(SUMMIT, 'natural') - LP, shown: 0.40 },
    { what: 'Gap to Daily in supermarkets ($)', value: LP - avgBC(DAILY, 'supermarket'), shown: 1.30 },
    { what: 'Answer: about 6% below Summit', value: Math.round(-prem(LP, avgBC(SUMMIT, 'supermarket'))), shown: 6 },
    { what: 'Answer: about 21% above Arcadia', value: Math.round(prem(LP, avgBC(ARCADIA, 'supermarket'))), shown: 21 },
    { what: 'Answer: about 10% below Summit (natural)', value: Math.round(-prem(LP, avgBC(SUMMIT, 'natural'))), shown: 10 },
    { what: 'Answer: about 15% above Arcadia (natural)', value: Math.round(prem(LP, avgBC(ARCADIA, 'natural'))), shown: 15 },
    { what: 'Note: about 22 cents under Summit (supermarkets)', value: (avgBC(SUMMIT, 'supermarket') - LP) * 100, shown: 22, tol: 0.6 },
    { what: 'Note: 40 cents under Summit (natural)', value: Math.round((avgBC(SUMMIT, 'natural') - LP) * 100), shown: 40 },
    { what: 'Single-origin taste score', value: SINGLE_Q, shown: 7.5 },
    { what: 'Taste score between Arcadia and Summit', value: Number(Q['Arcadia Coffee'] < SINGLE_Q && SINGLE_Q < Q['Summit Brew']), shown: 1 },
    { what: 'Summit supermarket 3 dp', value: avgBC(SUMMIT, 'supermarket'), shown: 3.715, tol: 0.0005 },
    { what: 'Arcadia natural 3 dp', value: avgBC(ARCADIA, 'natural'), shown: 3.023, tol: 0.0005 },
    { what: 'Focus-group quote is B2 on price', value: Number(FOCUS_GROUPS.quotes[4].who === 'B2' && FOCUS_GROUPS.quotes[4].theme === 1), shown: 1 },
  ],
};
