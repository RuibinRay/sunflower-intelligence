// positioning-statements.js — M05 · Positioning statements. Content only; exercises are in positioning-statements.ex.js.
// Lantern's figures come from case.js: the segments' needs indexes (DERIVED.segments.index, module 2), the brands' mean
// ratings and distances on the map (DERIVED.map, the previous lesson), Cold Brew intent by segment, and M02's Cold Brew
// facts (price $3.49, single-origin Ethiopian steeped 20 hours, rivals' prices) through case.js's COMPETITORS. Ana's
// screening rule (index of at least 110, a lead or gap of at least 0.5 points) is a fictional rule of thumb. Velloway
// Cycles and Larkspan Software are fictional. Every printed figure is recomputed in `checks`.
import { BRANDS, NEEDS, COMPETITORS, BRAND_NOTES, DERIVED as D } from './case.js?v=18';
import { propTest2 } from '../../../core/inference.js?v=18';
import { TIERS } from '../m02/market.js?v=18';

const M = D.map.brandMeans, IX = D.segments.index, SEG = D.segments.names, SIZE = D.segments.sizes, DIST = D.map.distances;
const B = (name) => BRANDS.indexOf(name), S = (name) => SEG.indexOf(name), A = (key) => NEEDS.findIndex((n) => n.key === key);
const LA = B('Lantern'), SU = B('Summit Brew'), DG = B('Daily Grind RTD'), AR = B('Arcadia Coffee'), CC = B('Corner Cup');
const CL = S('Craft and local'), OG = S('On the go'), EX = S('Explorers'), MI = S('Mindful');
const TASTE = A('taste'), PRICE = A('price'), CONV = A('convenience'), SUST = A('sustainability'), ENERGY = A('energy'), HEALTH = A('health'), LOCAL = A('local'), NOVELTY = A('novelty');
const price = (id) => COMPETITORS.find((c) => c.id === id).price;
const panel = { lantern: TIERS.find((t) => t.id === 'single').quality, summit: COMPETITORS.find((c) => c.id === 'summit').quality };   // M02's 0–10 taste panel (fictional)
const intentRank = (s) => 1 + D.segments.coldbrewTop2.filter((v) => v > D.segments.coldbrewTop2[s]).length;
const gap = (rival, j) => M[LA][j] - M[rival][j];
// Ana's screen (fictional rule of thumb): important if the target's index is at least 110; a lead or gap counts at 0.5 points
const screen = (seg, rival, j) => (IX[seg][j] < 110 ? 'Less important' : gap(rival, j) >= 0.5 ? 'Point of difference' : gap(rival, j) <= -0.5 ? 'Parity to reach' : 'Parity held');
const label = (j) => (j === PRICE ? 'A low price' : NEEDS[j].label);
const screenRows = (seg, rival) => NEEDS.map((_, j) => [label(j), String(IX[seg][j]), M[LA][j].toFixed(2), M[rival][j].toFixed(2), sg(gap(rival, j)), screen(seg, rival, j)]);
// Larkspan Software (fictional): a monadic concept test of two positionings
const LK = { n: 180, a: 81, b: 59, believeA: 4.6, believeB: 5.3 };
const LKT = propTest2(LK.a, LK.n, LK.b, LK.n);

const f2 = (v) => v.toFixed(2), p0 = (v) => `${(v * 100).toFixed(0)}%`, p1 = (v) => `${(v * 100).toFixed(1)}%`;
const sg = (v) => (v < 0 ? `−${Math.abs(v).toFixed(2)}` : `+${v.toFixed(2)}`);

// ---------------------------------------------------------------- figure: the parts of a positioning statement
const part = (x, w, color, top, words, sub) => `<rect x="${x}" y="40" width="${w}" height="74" rx="8" style="fill:none;stroke:var(--series-${color});stroke-width:2"/>`
  + `<text x="${x + w / 2}" y="30" text-anchor="middle" font-size="12" fill="var(--ink-3)">${top}</text>`
  + `<text x="${x + w / 2}" y="72" text-anchor="middle" font-weight="700" fill="currentColor">${words}</text>`
  + `<text x="${x + w / 2}" y="94" text-anchor="middle" font-size="12" fill="currentColor">${sub}</text>`;
const PARTS = '<svg viewBox="0 0 640 250" xmlns="http://www.w3.org/2000/svg" font-family="inherit" font-size="14">'
  + part(4, 150, 1, 'For …', 'Target', 'who it is for')
  + part(162, 150, 2, '[brand] is the …', 'Frame of reference', 'what it competes as')
  + part(320, 150, 3, 'that …', 'Point of difference', 'why it is better')
  + part(478, 158, 1, 'because …', 'Reason to believe', 'the proof')
  + '<path d="M237 122 L237 150 L398 150 L398 122" style="fill:none;stroke:var(--rule-strong);stroke-width:1.5"/>'
  + '<text x="318" y="170" text-anchor="middle" font-size="12" fill="currentColor">The frame sets the rivals, and so decides which</text>'
  + '<text x="318" y="186" text-anchor="middle" font-size="12" fill="currentColor">benefits are points of parity and which can be points of difference</text>'
  + '<path d="M79 122 L79 214 L557 214 L557 122" style="fill:none;stroke:var(--rule-strong);stroke-width:1.5;stroke-dasharray:5 4"/>'
  + '<text x="318" y="236" text-anchor="middle" font-size="12" fill="var(--ink-3)">Test the whole: relevant to the target, distinct from rivals, credible, consistent with the mix</text>'
  + '</svg>';

export default {
  slug: 'positioning-statements',
  title: 'Positioning statements',
  blurb: 'Choose the frame of reference an offer competes in, the points of parity it must match and the points of difference it can own, and write them into a positioning statement with a reason to believe. Then test the statement against M01’s four tests and with customers in a concept test.',
  status: 'draft',
  objectives: [
    'Choose a frame of reference for an offer and explain how it decides the rivals and the associations that matter.',
    'Distinguish points of parity from points of difference, and identify candidates for each from segment needs and brand ratings.',
    'Write a positioning statement with a target, a frame of reference, a point of difference and a reason to believe.',
    'Evaluate a positioning against the four tests (relevant, distinct, credible, consistent), including benefits that seem to conflict.',
    'Plan a concept test of positioning options and interpret its results, including the difference between two concepts.',
  ],
  prerequisites: [
    { lesson: 'm05/perceptual-maps', why: 'The map, the ideal points and the brands’ mean ratings are the evidence a positioning is built from.' },
    { lesson: 'm05/profiling-segments', why: 'The segments’ needs indexes say which attributes matter to a target.' },
    { lesson: 'm01/competitive-advantage', why: 'Positioning and its four tests (relevant, distinct, credible, consistent) were introduced there.' },
    { lesson: 'm01/customer-value', why: 'A value proposition is the promise a positioning makes to customers.' },
    { lesson: 'b04/proportions-and-chi-square', why: 'The two-proportion z test compares two concepts’ purchase intent.' },
  ],
  case: 'lantern',

  concept: [
    { case: `The map gave Ana a picture of where Lantern stands. Now she has to say what Lantern will stand for, and she has two offers to position. Lantern’s cafés and beans are known to ${p0(D.aware)} of the coffee drinkers in her study, whose ratings place Lantern furthest towards the crafted and ethical end of the map. Lantern Cold Brew, to be priced at $3.49 a can against Summit Brew’s $${price('summit').toFixed(2)}, is not yet on sale (it is planned for later in 2027), so the study rated Lantern as a brand, not the can. Cold Brew’s strongest purchase intent comes from two segments at opposite sides of the map: Craft and local (${p0(D.segments.coldbrewTop2[CL])} top-two) and On the go (${p0(D.segments.coldbrewTop2[OG])}).` },
    { p: 'A <g>positioning statement</g> is a short internal statement of a positioning: who the offer is for, what it competes as, how it is different and better, and why anyone should believe that. Customers never see it. It is written for the people who make the offer and sell it, so that the product, the price, where it is sold and what is said about it all pull the same way, which is the job of the <g>marketing mix</g> from M02. A statement that can’t settle an argument about the label, the price or the shelf is too vague to be useful.' },

    { h: 'Three questions about a position' },
    { p: 'Kevin Lane Keller, Brian Sternthal and Alice Tybout (2002) argued in the <i>Harvard Business Review</i> that positioning had concentrated too narrowly on differences. Their article asks three questions of any brand: “Have we established a frame?”, “Are we leveraging our points of parity?” and “Are the points of difference compelling?” Each question names one part of a positioning, and the rest of this lesson takes them in turn.' },

    { h: 'The frame of reference' },
    { p: 'The <g>frame of reference</g> is the category or goal the offer competes in: what customers should compare it with. The article describes the frame as signalling the goal a customer can expect to achieve by using the brand. Choosing the frame chooses the rivals, and the rivals decide which of the offer’s qualities count as ordinary and which as special.' },
    { table: {
      caption: 'Two frames for Lantern Cold Brew, and what each implies',
      head: ['Frame of reference', 'Rivals customers will compare it with', 'What it must match to belong'],
      rows: [
        ['A canned cold coffee from the chiller', 'Summit Brew ($3.79), Arcadia Coffee ($2.89), Daily Grind RTD ($2.29)', 'Sold where people buy cans; cold and ready to drink; a recognisable price'],
        ['A café-quality coffee to take with you', 'Corner Cup’s takeaway iced coffee; Lantern’s own cafés', 'Café taste; something new to try; a reason to pick a can over a cup'],
      ],
    } },
    { p: 'Neither frame is right in itself. In the first, Lantern’s local roots are unusual and its weak convenience rating is a problem; in the second, taste is expected and convenience is the can’s advantage. The frame has to suit the target, so it is chosen after the target, never before.' },

    { h: 'Points of parity and points of difference' },
    { p: '<g>Points of parity</g> are the features an offer shares with its competitors: the things it must be good enough at to be accepted as a credible member of its frame. <g>Points of difference</g> are the benefits that set it apart from its competitors. The article’s point is that both matter. A brand with strong differences but missing parity isn’t considered at all, because customers don’t accept it as a member of the category.' },
    { p: 'Parity doesn’t mean equality. A brand can “break even” on a point of parity, being good enough, while it wins on a difference. The article’s example is Subway: its advertising led on healthfulness with taste treated as good enough, although Subway’s executives saw taste as essential to the fast-food frame and later ran a taste campaign alongside. Points of difference have a higher bar. They must be desirable, which means relevant to the target and believable, and deliverable, which means feasible, profitable and defensible against rivals who would like to copy them.' },

    { h: 'Writing the statement' },
    { p: 'OpenStax gives two common templates. One reads “For [target audience], [brand name] is the [your market] that delivers [your points of differentiation] so they can [end benefit] because [your evidence]”; the other puts the brand first. This course uses a shortened form of the first, with the end benefit folded into the point of difference. The last part, the <g>reason to believe</g>, is the proof that makes the point of difference credible.' },
    { figure: {
      svg: PARTS,
      caption: 'The four parts of a positioning statement. The frame sets the rivals; the rivals decide what is parity and what can be a difference; the reason to believe makes the difference credible.',
      alt: 'Four boxes in a row. The first, headed “For …”, is the target: who it is for. The second, headed “[brand] is the …”, is the frame of reference: what it competes as. The third, headed “that …”, is the point of difference: why it is better. The fourth, headed “because …”, is the reason to believe: the proof. A bracket joins the frame and the point of difference with the note that the frame sets the rivals, and so decides which benefits are points of parity and which can be points of difference. A dashed bracket under all four says: test the whole, relevant to the target, distinct from rivals, credible, consistent with the mix.',
    } },
    { p: 'A worked statement for a bike workshop (the simple example below) reads: “For commuters who ride an e-bike every day, Velloway Cycles is the bike workshop that gets you back on the road the same day, because it lends you an e-bike while yours is fixed.” Each part does one job. Change the target to weekend racers and the frame, the difference and the proof would all have to change with it.' },
    { callout: 'key', title: 'Parity first, then difference', html: 'Before claiming a difference, check that the offer clears the bar of its frame. A canned coffee that customers can’t find where they buy cans, or a café whose coffee isn’t good enough, never gets the chance to show what makes it different.' },
  ],

  theory: [
    { h: 'Choosing a frame of reference' },
    { p: 'A frame can be named by a product category (“a canned cold coffee”), by a goal (“something to keep you going through the afternoon”) or by an occasion (“a treat on the walk to work”). Each one brings a different set of rivals into view. The article notes that market leaders usually market on the points of parity of their category: their aim is to be the obvious member of it. By the same logic a newcomer usually has to establish what it is before it can say why it is better.' },
    { p: 'Frames can be too wide or too narrow. “A drink” invites comparison with everything from water to beer and says nothing; “the only Ethiopian single-origin cold brew in Harbour City” is so narrow that it defines away the rivals customers will actually weigh it against. A useful test is to ask what customers would buy instead. One business can need several frames, one for each offer and target: Lantern’s cafés compete with Corner Cup, its beans with supermarket coffee such as Harbour Basics, and its Cold Brew, once launched, with Summit Brew in the chiller.' },

    { h: 'Finding points of parity and difference in the data' },
    { p: 'The segment profiles and the brand ratings answer the article’s questions with evidence rather than opinion. A point of difference should be <b>relevant</b> to the target, shown by a high needs index in its profile; <b>distinct</b>, shown by a clear lead over the rivals in the frame; and <b>credible</b>, shown by the offer actually delivering it. A point of parity is an attribute the target cares about on which the offer must not trail the rivals by much.' },
    { p: 'Ana turns that into a screen (a fictional rule of thumb, not a standard). An attribute is important to a target if its needs index is at least 110. Lantern has a point of difference where it leads the chosen rival by at least 0.5 rating points, holds parity within half a point either side, and has parity to reach where it trails by 0.5 or more. Half a point is about four times the standard error of a difference between Lantern’s mean, from 61 ratings, and a rival’s, so a lead of that size is not sampling noise.' },
    { table: {
      caption: 'Ana’s screen for Lantern’s cafés and beans: target Craft and local, rival Arcadia Coffee (its next-nearest brand)',
      head: ['Attribute', 'Craft and local index', 'Lantern', 'Arcadia', 'Lantern − Arcadia', 'Screen'],
      rows: screenRows(CL, AR),
      align: ['l', 'r', 'r', 'r', 'r', 'l'],
      note: 'Index: the segment’s mean need ÷ the average respondent’s × 100 (module 2). Ratings: mean ratings of each brand by people who know it.',
    } },
    { p: `For Craft and local against Arcadia, Lantern has three points of difference that matter to the target: local and independent (${sg(gap(AR, LOCAL))}), novelty (${sg(gap(AR, NOVELTY))}) and taste (${sg(gap(AR, TASTE))}). On sustainability, which the segment also values (index ${IX[CL][SUST]}), Lantern holds parity: Arcadia is rated slightly higher. Against Corner Cup or Summit Brew, sustainability would be a difference too (${sg(gap(CC, SUST))} and ${sg(gap(SU, SUST))}), which shows the earlier point in numbers: the rival, and so the frame, decides what counts as a difference.` },
    { table: {
      caption: 'The same screen for On the go against Summit Brew, the nearest rival in the canned-coffee frame',
      head: ['Attribute', 'On the go index', 'Lantern', 'Summit Brew', 'Lantern − Summit', 'Screen'],
      rows: screenRows(OG, SU),
      align: ['l', 'r', 'r', 'r', 'r', 'l'],
    } },
    { p: `For On the go the two attributes that matter, energy (index ${IX[OG][ENERGY]}) and convenience (${IX[OG][CONV]}), are both parity Lantern would have to reach: it trails Summit Brew by ${f2(-gap(SU, ENERGY))} on energy and ${f2(-gap(SU, CONV))} on convenience. Lantern’s real differences (local, taste, sustainability) are on attributes On the go drinkers care less about than the average respondent does. That is the case against a Cold Brew position aimed at them, in two tables.` },

    { h: 'When benefits seem to conflict' },
    { p: 'The article warns that owning one benefit can imply lacking another: customers who believe a product is inexpensive tend to doubt that it is of the highest quality. It describes three ways out. <b>Sequencing</b>: establish one benefit first and add the second later, as Miller Lite did with “great taste” before “less filling”. <b>Leveraging an unrelated attribute</b>: use something else that lends credibility, as Miller Lite did with well-liked celebrities. <b>Reframing the two as complements</b>: Apple argued that the most powerful computers are the ones people actually use, against the assumption that easy meant weak.' },
    { p: `Lantern faces a version of this. Across the six brands, those seen as convenient are seen as less crafted: the convenience arrow points almost opposite the sustainability and local arrows. A Cold Brew claim of “craft” may therefore suggest “hard to find”. Sequencing (be the craft can first, then widen distribution) or reframing (craft you can carry) are both possible. The last lesson in this module shows how far Lantern would have to move on the map to be seen as convenient at all.` },

    { h: 'Value proposition, positioning statement and tagline' },
    { p: 'Three related things are often confused. The <g>value proposition</g> from M01 is the promise of benefits that gives target customers a reason to choose the offer; Lumen Learning’s <i>Principles of Marketing</i> describes the end result of positioning as a market-focused value proposition, the compelling reason the target should buy. The positioning statement is the internal summary of that promise: target, frame, difference and proof. A <g>tagline</g> is a catchphrase for customers that sums up the offer’s essence; the BCcampus open textbook’s example is Wendy’s “It’s better than fast food”, which sets the frame and the difference in five words. A tagline can be changed by an advertising agency every year; the positioning should not be.' },

    { h: 'Testing a positioning' },
    { p: 'Test a draft first against M01’s four tests, and rewrite it before customers see it if it fails any one of them.' },
    { list: [
      '<b>Relevant</b>: does the point of difference matter to the target, by its needs profile?',
      '<b>Distinct</b>: is it something rivals in the frame don’t already claim and own on the map?',
      '<b>Credible</b>: does the offer deliver it, and is there proof customers can check?',
      '<b>Consistent</b>: does every part of the mix support it, from the product to the price and the shelf?',
    ] },
    { p: 'Then test it with customers. <g>Qualitative research</g> comes first: depth interviews or focus groups show which words the target uses and which claims it finds hard to believe. A <g>concept test</g> follows: each respondent from the target reads a short description of the offer written to express one positioning, and answers questions on appeal, how different it seems, how believable it is and how likely they would be to buy, on a <g>purchase-intent scale</g> as M04 designed. In a <b>monadic</b> test each respondent sees only one concept, so the concepts are compared between randomly assigned, comparable groups and none colours the reading of another.' },
    { p: 'Read a concept test with three cautions. Stated intent overstates what people will do (M04’s <g>stated preference</g> against <g>revealed preference</g>), so compare concepts with each other rather than reading the top-two share as a forecast. The difference between two concepts needs B04’s <g>two-proportion z test</g>, because two cells of 150 or 200 respondents each carry a margin of error of several points. And a concept test tests words: whether Cold Brew tastes as good as its concept promises needs a product test.' },
  ],

  formulas: [],

  examples: [
    { level: 'simple', title: 'A positioning statement for a bike workshop', fictional: true,
      setup: 'Velloway Cycles (fictional) is an independent bike shop. Its owner’s notes: “Most of our repair customers ride e-bikes to work every day. The chain store nearby and the mobile mechanic both charge about what we do and use genuine parts. The chain takes three to five days; the mobile mechanic comes only at weekends. We fix most e-bikes the same day, and we have twelve loan e-bikes so customers can still ride to work.” Write the positioning statement, and say which features are points of parity.',
      steps: [
        'Target: the notes say who matters most, commuters who ride an e-bike every day. Their need is to keep riding to work.',
        'Frame of reference: what would they use instead? The chain store’s workshop and the mobile mechanic: the frame is “bike workshop”.',
        'Points of parity: a fair price and genuine parts, which both rivals also offer. Velloway must match them, not claim them.',
        'Point of difference: same-day repair, which neither rival offers and which matters to someone who rides every day.',
        'Reason to believe: the loan fleet of twelve e-bikes is provable and makes the promise of staying on the road credible even when a repair takes longer.',
      ],
      answer: '“For commuters who ride an e-bike every day, Velloway Cycles is the bike workshop that gets you back on the road the same day, because it lends you an e-bike while yours is fixed.” Fair prices and genuine parts are points of parity.',
      interpretation: 'The statement tells the owner what to protect (the loan fleet, mechanics who can turn repairs round in a day) and what not to boast about (prices and parts, which rivals match). If the chain store started same-day repairs, the difference would erode, and the loan fleet would become the part that is hard to copy.' },

    { level: 'challenging', title: 'Choosing between two positionings with a concept test', fictional: true,
      setup: `Larkspan Software (fictional) sells appointment-booking software to dental practices. It has two candidate positionings. A: “For practice managers who lose money to empty chairs, Larkspan is the booking system that refills cancellations automatically, because it texts the waiting list the moment a slot opens.” B: “For practice managers short of time, Larkspan is the booking system that takes an afternoon to learn, because set-up is done for you by a named trainer.” In a monadic concept test, ${LK.n} practice managers read A and another ${LK.n} read B. ${LK.a} who read A and ${LK.b} who read B said they would definitely or probably ask for a demonstration; mean believability (1–7) was ${LK.believeA} for A and ${LK.believeB} for B. Which positioning should Larkspan take forward?`,
      steps: [
        `Top-two shares: A ${LK.a} ÷ ${LK.n} = ${p1(LKT.p1)}; B ${LK.b} ÷ ${LK.n} = ${p1(LKT.p2)}. The difference is ${(100 * LKT.diff).toFixed(1)} percentage points.`,
        `Is the difference more than chance? B04’s two-proportion z test: pooled share (${LK.a} + ${LK.b}) ÷ ${2 * LK.n} = ${LKT.pool.toFixed(3)}; standard error √(${LKT.pool.toFixed(3)} × ${(1 - LKT.pool).toFixed(3)} × (1/${LK.n} + 1/${LK.n})) = ${LKT.sePool.toFixed(4)}; z = ${LKT.diff.toFixed(4)} ÷ ${LKT.sePool.toFixed(4)} = ${LKT.z.toFixed(2)}, two-sided p = ${LKT.pValue.toFixed(3)}. A’s lead is unlikely to be chance.`,
        `Weigh believability. A is more appealing but less believed (${LK.believeA} against ${LK.believeB}): automatic refilling sounds too good to some managers. The reason to believe, texting the waiting list, needs to be shown, perhaps with a practice’s results.`,
        'Apply the four tests. A is relevant (empty chairs cost money) and distinct if rivals don’t refill automatically; its credibility is the weak point, which the concept test has located. B is credible but a weaker difference: ease of learning matters once, at set-up, and rivals can copy a named trainer.',
        'Remember what the test measured: stated interest in a demonstration, from managers who read a paragraph. It ranks the concepts; it doesn’t forecast sales.',
      ],
      answer: `Take A forward (top-two ${p1(LKT.p1)} against ${p1(LKT.p2)}, z = ${LKT.z.toFixed(2)}, p = ${LKT.pValue.toFixed(3)}), and strengthen its reason to believe before launch, because its believability (${LK.believeA}) trails B’s (${LK.believeB}).`,
      interpretation: 'A concept test is most useful when it shows not only which concept wins but why the winner might fail. Here the evidence says the difference is attractive and the proof is not yet convincing, which tells Larkspan what to work on: demonstrations, case results, a free trial. Ease of learning can still appear in the mix as a point of parity.' },

    { level: 'applied', title: 'Positioning Lantern Cold Brew', fictional: true,
      setup: `Ana drafts a positioning for Lantern Cold Brew, planned at $3.49 a can: single-origin Ethiopian coffee steeped for 20 hours, which M02’s taste panel scored ${panel.lantern} out of 10 against Summit Brew’s ${panel.summit}. Purchase intent is highest in Craft and local (${p0(D.segments.coldbrewTop2[CL])}) and On the go (${p0(D.segments.coldbrewTop2[OG])}), then Mindful (${p0(D.segments.coldbrewTop2[MI])}) and Explorers (${p0(D.segments.coldbrewTop2[EX])}). Use the screens and the map to write the statement for the more credible target, and say what the other target would require.`,
      steps: [
        `Choose the target from the screens. For On the go, Lantern has no point of difference on what they care about and parity to reach on both energy and convenience; their ideal is ${f2(DIST[OG][LA])} from Lantern on the map, against ${f2(DIST[OG][CC])} for Corner Cup. For Craft and local, Lantern leads on the needs they rate highest and is the nearest brand to their ideal (${f2(DIST[CL][LA])}). Module 3 chose Craft and local and Explorers as one launch target; the screens show the statement must be built on Craft and local’s needs and reaches Explorers only through novelty (index ${IX[EX][NOVELTY]}, where Lantern leads Summit Brew by ${f2(gap(SU, NOVELTY))}), so test it on them. Their Cold Brew intent is only ${p0(D.segments.coldbrewTop2[EX])}, ${['', 'first', 'second', 'third', 'fourth', 'fifth'][intentRank(EX)]} of the five segments, and novelty is the only need of theirs that clears Ana’s 110.`,
        `Choose the frame. Craft and local drinkers will meet Cold Brew in the chiller next to Summit Brew, so the frame is a canned cold coffee, and Summit Brew is the rival that matters: the premium can at $${price('summit').toFixed(2)}.`,
        `Set the points of parity. In that frame a can must be cold, ready to drink and easy enough to find. Lantern’s convenience rating (${f2(M[LA][CONV])}, against Summit Brew’s ${f2(M[SU][CONV])}) is the parity at risk; Craft and local care less than average about it (index ${IX[CL][CONV]}), but they still have to find the can. Taste is parity too, for now: people who know Lantern rate its taste above Summit Brew’s (${f2(M[LA][TASTE])} against ${f2(M[SU][TASTE])}), but M02’s panel scores the can itself ${panel.lantern} against Summit Brew’s ${panel.summit}, so the can must match Summit Brew in a blind test before taste is claimed.`,
        `Set the point of difference. Against Summit Brew, Lantern’s clearest lead is local and independent (${sg(gap(SU, LOCAL))}), the target’s highest need (index ${IX[CL][LOCAL]}); sustainability (${sg(gap(SU, SUST))}) and novelty (${sg(gap(SU, NOVELTY))}) support it. Lead with local, and keep taste as parity until the blind test.`,
        'Find a reason to believe that customers can check. The ratings are evidence for Ana, not proof for customers, and they rate Lantern’s cafés and beans, not the can. The provable facts are the company and the coffee: owned and run in Harbour City, single-origin Ethiopian, steeped for 20 hours.',
        `Run the four tests. Relevant: local is the target’s top need. Distinct: no rival is rated above ${f2(M[AR][LOCAL])} on local. Credible: the local claim, yes; a taste claim against Summit Brew, not until a blind test. Consistent: a $3.49 price below Summit Brew’s $${price('summit').toFixed(2)} needs care, because on the product alone it is nearer “the same, or slightly less, for less” and a lower price can signal lower quality to buyers who judge by price.`,
      ],
      answer: '“For Harbour City coffee drinkers who care about taste and want to support a local business, Lantern Cold Brew is the canned cold coffee made by the city’s own independent coffee company, because it is single-origin Ethiopian coffee steeped for 20 hours by a business owned and run in Harbour City.” Points of parity: cold, ready to drink, easy enough to find, and a taste that matches Summit Brew’s in a blind test.',
      interpretation: 'The statement rests on what the data support: the local, independent position Lantern already owns, pointed at the segment nearest it, with taste held back until the can has proved it. The alternative, a convenience-and-energy position for On the go, fails the credible and distinct tests today. Whether to chase On the go anyway is a targeting decision; what Lantern would have to change to make such a position credible is the subject of the next lesson. Before the positioning goes into packaging and advertising, a monadic concept test among Craft and local and Explorers drinkers, and a taste test of the can, would check the two weakest links.' },
  ],

  demo: [
    { widget: 'st-screen', intro: 'Ana’s screen as a worksheet. Pick a target segment and a rival brand from the lists: the needs index, Lantern’s and the rival’s mean ratings and the screen update. Start with Craft and local against Arcadia Coffee, then switch the rival to Summit Brew and watch sustainability turn from parity into a point of difference. Then pick On the go: which attributes matter, and where does Lantern stand? Change the thresholds in B3 and B4 and see how much of the answer depends on the rule of thumb.' },
  ],

  mistakes: [
    { title: '“A positioning statement is our slogan.”', html: 'The statement is internal and complete: target, frame, difference and proof. A tagline is for customers and can change with each campaign. Writing the slogan first tends to produce a clever line with no target and no proof behind it.' },
    { title: '“Only the differences matter.”', html: 'An offer that misses its frame’s points of parity is not considered, however different it is. Keller, Sternthal and Tybout’s second question, about points of parity, is there because brands kept failing on it. Check parity first.' },
    { title: '“Our point of difference is whatever we are best at.”', html: 'A difference must matter to the target (a high needs index), be clearly ahead of the rivals in the frame, and be deliverable and defensible. Lantern is clearly ahead on local and independent, but that difference is only a weak argument for On the go drinkers, whose index for it is 68.' },
    { title: '“The frame of reference is obvious.”', html: 'The frame is a choice, and it chooses the rivals. In the chiller, Lantern Cold Brew will be a canned coffee next to Summit Brew; as a café drink to take away, it competes with Corner Cup. The same rating can be parity in one frame and a difference in another.' },
    { title: '“The survey proves it, so customers will believe it.”', html: 'Survey results are Ana’s evidence, not a reason to believe for customers. A reason to believe is something customers can check: the coffee, the method, the place, a guarantee. And ratings of Lantern’s cafés don’t prove anything about a can the survey didn’t rate.' },
    { title: '“The concept with the higher score wins.”', html: 'Two concept cells of 150 to 200 people each have margins of error of several points. Test the difference (B04’s two-proportion z test), look at believability as well as intent, and remember that stated intent overstates purchase.' },
  ],

  application: [
    { p: 'A brand manager writes positioning statements when something forces a choice: a launch, a new segment, a rival’s move, an agency brief. The statement then becomes the test for every later decision. Does this label, this price, this shop, this advertisement support “the canned cold coffee from Harbour City’s own independent coffee company”? If not, either the decision or the statement is wrong.' },
    { case: `Ana writes two statements. Lantern’s cafés and beans, for Craft and local drinkers, against Arcadia and Corner Cup: “For Harbour City coffee drinkers who care about taste and want to support a local business, Lantern is the independent coffee company that serves better-tasting coffee and always has something new to try, because it is owned and run in Harbour City and adds a new single-origin coffee every month.” The monthly new coffee is a practice Lantern would have to adopt (fictional): Ana notes that a reason to believe must be true before it is written. She leaves sustainability out of the difference: Arcadia is rated higher on it (${f2(M[AR][SUST])} against ${f2(M[LA][SUST])}), so against Arcadia it is parity, and only against Corner Cup (${sg(gap(CC, SUST))}) would it stand out. Lantern Cold Brew, built for the same drinkers and tested on the Explorers, takes the canned-coffee frame against Summit Brew, as in the applied example.` },
    { table: {
      caption: 'Ana’s four tests of the Cold Brew statement, with the evidence she has and the evidence she still needs',
      head: ['Test', 'Evidence now', 'Still needed'],
      rows: [
        ['Relevant', `Local (index ${IX[CL][LOCAL]}) is Craft and local’s top need; taste (${IX[CL][TASTE]}) is next`, `How much Explorers value local (index ${IX[EX][LOCAL]}, about average)`],
        ['Distinct', `Lantern ${f2(M[LA][LOCAL])} on local; no rival above ${f2(M[AR][LOCAL])}`, 'Whether Summit Brew could claim craft credibly'],
        ['Credible', `Lantern ${f2(M[LA][LOCAL])} on local, from ${D.map.counts[LA]} ratings; M02’s panel scores the can ${panel.lantern} against Summit Brew’s ${panel.summit}`, 'A blind taste test of the can; a concept test’s believability score'],
        ['Consistent', 'Single-origin coffee, 20-hour steep, local company', 'A price and shelf that say craft, not discount'],
      ],
    } },
    { p: 'The table is the agenda for research before the positioning is used. A monadic concept test among Craft and local and Explorers drinkers, with the Cold Brew concept written two ways (local first, taste first), would test relevance and believability together. A blind taste test against Summit Brew would test the one claim no survey of perceptions can settle. Neither study costs as much as a campaign built on a statement nobody believes.' },
    { p: 'The statement also revises M02’s working answer. M02 started from a target of commuters and office workers who “care how it tastes and want something cold and quick”, and the value proposition “The cold brew our cafés serve, ready when you are.” The needs study tested that assumption. The drinkers it describes overlap most with the On the go segment, which sits on the far side of the map from Lantern and whose top needs, energy and convenience, are parity Lantern would have to reach. So the target becomes module 3’s Craft and local and Explorers, with the statement built on Craft and local’s needs and tested on the Explorers, and it leads with local and independent rather than speed.' },
    { p: 'Outside coffee the same discipline applies. A building society that wants younger savers must decide whether it is “a savings account” (against banks and their apps) or “a local financial adviser” (against independent advisers); its points of parity, an easy app or professional qualifications, follow from that choice. A training provider, a hotel or a software firm faces the same three questions: what frame, which parity, which difference, and what proof.' },
  ],

  summary: [
    'A positioning statement is an internal summary of a positioning: for [target], [brand] is the [frame of reference] that [point of difference], because [reason to believe].',
    'Keller, Sternthal and Tybout’s three questions: is the frame established, are the points of parity in place, are the points of difference compelling?',
    'The frame of reference chooses the rivals, and the rivals decide which qualities are parity and which can be differences.',
    'Points of parity are what the offer must be good enough at to belong; points of difference must be relevant and believable (desirable) and feasible, profitable and defensible (deliverable).',
    'Segment needs indexes show relevance; brand ratings against the rival in the frame show distinctiveness and the parity at risk.',
    'Test a draft with M01’s four tests (relevant, distinct, credible, consistent), then with customers: qualitative research for language, a monadic concept test for appeal, believability and intent, with differences tested.',
    'For Lantern, the data support a local, independent position for Craft and local drinkers, with taste as parity until a blind test confirms it; a convenience position for On the go fails the credible and distinct tests today, which revises M02’s working answer.',
  ],

  glossary: [
    { term: 'Positioning statement', def: 'A short internal statement of a positioning: the target, the frame of reference, the point of difference and the reason to believe.' },
    { term: 'Frame of reference', def: 'The category or goal an offer competes in, which tells customers what to compare it with and so decides its rivals.' },
    { term: 'Points of parity', def: 'Features an offer shares with its competitors and must be good enough at to be accepted as a credible member of its frame of reference.' },
    { term: 'Points of difference', def: 'Benefits that set an offer apart from its competitors; to work they must be relevant and believable to the target, and feasible, profitable and defensible for the firm.' },
    { term: 'Reason to believe', def: 'The proof in a positioning statement that makes its point of difference credible: something customers can check, such as an ingredient, a method or a guarantee.' },
    { term: 'Tagline', def: 'A short catchphrase, used with customers, that sums up the essence of an offer or brand.' },
    { term: 'Concept test', def: 'A survey in which target customers read a short description of a proposed offer or positioning and rate its appeal, distinctiveness, believability and their intent to buy.' },
  ],

  references: [
    { text: 'Keller, K. L., Sternthal, B. &amp; Tybout, A. M. (2002). Three questions you need to ask about your brand. <i>Harvard Business Review</i>, 80(9), 80–86 (product R0209F). Citation and description confirmed from the HBR Store and Kellogg School of Management listings; the article’s content was read in a course copy.', url: 'https://store.hbr.org/product/three-questions-you-need-to-ask-about-your-brand/R0209F', checked: '2026-10-25' },
    { text: 'Gomez Albrecht, M., Green, M. &amp; Hoffman, L. (2023). <i>Principles of Marketing</i>, section 5.6, “Product Positioning” (positioning statement templates). OpenStax. Read in the LibreTexts copy of the same edition.', url: 'https://biz.libretexts.org/Bookshelves/Marketing/Principles_of_Marketing_(OpenStax)/02%3A_Understanding_the_Marketplace/05%3A_Market_Segmentation_Targeting_and_Positioning/5.06%3A__Product_Positioning', checked: '2026-10-25' },
    { text: 'Lumen Learning. <i>Principles of Marketing</i>, 8.13, “Reading: Defining Positioning and Differentiation” (the parts of a positioning statement; the value proposition as the end result of positioning). CC BY 4.0.', url: 'https://biz.libretexts.org/Bookshelves/Marketing/Principles_of_Marketing_(Lumen)/08%3A_Positioning/8.13%3A_Reading-_Defining_Positioning_and_Differentiation', checked: '2026-10-25' },
    { text: '<i>Principles of Marketing – H5P Edition</i> (2022), section 5.4, “Positioning and Repositioning Offerings” (taglines). BCcampus Open Education.', url: 'https://opentextbc.ca/principlesofmarketingh5p/chapter/positioning-and-repositioning-offerings/', checked: '2026-10-25' },
  ],

  checks: [
    { what: 'Awareness %', value: D.aware * 100, shown: 14, tol: 0.5 },
    { what: 'Cold Brew price', value: 3.49, shown: 3.49 },
    { what: 'Cold Brew price (BRAND_NOTES)', value: Number(/\$(\d+\.\d+)/.exec(BRAND_NOTES.Lantern)[1]), shown: 3.49 },
    { what: 'Summit price', value: price('summit'), shown: 3.79 },
    { what: 'Arcadia price', value: price('arcadia'), shown: 2.89 },
    { what: 'Daily Grind price', value: price('daily'), shown: 2.29 },
    { what: 'Top-two Craft and local %', value: D.segments.coldbrewTop2[CL] * 100, shown: 46, tol: 0.5 },
    { what: 'Top-two On the go %', value: D.segments.coldbrewTop2[OG] * 100, shown: 38, tol: 0.5 },
    { what: 'Top-two Mindful %', value: D.segments.coldbrewTop2[MI] * 100, shown: 33, tol: 0.5 },
    { what: 'Top-two Explorers %', value: D.segments.coldbrewTop2[EX] * 100, shown: 24, tol: 0.5 },
    { what: 'Gap local vs Arcadia', value: M[LA][LOCAL] - M[AR][LOCAL], shown: 3.18 },
    { what: 'Gap novelty vs Arcadia', value: M[LA][NOVELTY] - M[AR][NOVELTY], shown: 1.21 },
    { what: 'Gap taste vs Arcadia', value: M[LA][TASTE] - M[AR][TASTE], shown: 1.20 },
    { what: 'Gap sustainability vs Arcadia', value: M[LA][SUST] - M[AR][SUST], shown: -0.36 },
    { what: 'Gap sustainability vs Corner Cup', value: M[LA][SUST] - M[CC][SUST], shown: 2.33 },
    { what: 'Gap sustainability vs Summit', value: M[LA][SUST] - M[SU][SUST], shown: 1.63 },
    { what: 'Craft and local index sustainability', value: IX[CL][SUST], shown: 123 },
    { what: 'Craft and local index local', value: IX[CL][LOCAL], shown: 168 },
    { what: 'Craft and local index taste', value: IX[CL][TASTE], shown: 136 },
    { what: 'Craft and local index convenience', value: IX[CL][CONV], shown: 76 },
    { what: 'On the go index energy', value: IX[OG][ENERGY], shown: 147 },
    { what: 'On the go index convenience', value: IX[OG][CONV], shown: 137 },
    { what: 'On the go index local', value: IX[OG][LOCAL], shown: 68 },
    { what: 'Explorers index novelty', value: IX[EX][NOVELTY], shown: 158 },
    { what: 'Explorers index local', value: IX[EX][LOCAL], shown: 104 },
    { what: 'Energy gap to Summit', value: M[SU][ENERGY] - M[LA][ENERGY], shown: 0.84 },
    { what: 'Convenience gap to Summit', value: M[SU][CONV] - M[LA][CONV], shown: 2.26 },
    { what: 'Gap local vs Summit', value: M[LA][LOCAL] - M[SU][LOCAL], shown: 4.15 },
    { what: 'Gap novelty vs Summit', value: M[LA][NOVELTY] - M[SU][NOVELTY], shown: 0.71 },
    { what: 'Gap taste vs Summit', value: M[LA][TASTE] - M[SU][TASTE], shown: 0.63 },
    { what: 'Lantern convenience', value: M[LA][CONV], shown: 3.15 },
    { what: 'Summit convenience', value: M[SU][CONV], shown: 5.41 },
    { what: 'Lantern local', value: M[LA][LOCAL], shown: 6.30 },
    { what: 'Arcadia local (best rival)', value: Math.max(...M.filter((_, b) => b !== LA).map((r) => r[LOCAL])), shown: 3.11 },
    { what: 'Lantern taste', value: M[LA][TASTE], shown: 5.92 },
    { what: 'Summit taste', value: M[SU][TASTE], shown: 5.29 },
    { what: 'Lantern base', value: D.map.counts[LA], shown: 61 },
    { what: 'On the go to Lantern', value: DIST[OG][LA], shown: 4.48 },
    { what: 'On the go to Corner Cup', value: DIST[OG][CC], shown: 0.57 },
    { what: 'Craft and local to Lantern', value: DIST[CL][LA], shown: 0.79 },
    { what: 'Half a point ≈ 4 SE of a difference', value: 0.5 / Math.sqrt(0.96 ** 2 / 61 + 0.95 ** 2 / 289), shown: 4, tol: 0.5 },
    { what: 'Velloway loan e-bikes', value: 12, shown: 12 },
    { what: 'M02 panel: single-origin can', value: panel.lantern, shown: 7.5 },
    { what: 'M02 panel: Summit Brew', value: panel.summit, shown: 8 },
    { what: 'Explorers rank on Cold Brew intent', value: intentRank(EX), shown: 4 },
    { what: 'Explorers clear 110 only on novelty', value: IX[EX].filter((v) => v >= 110).length === 1 && IX[EX][NOVELTY] >= 110 ? 1 : 0, shown: 1 },
    { what: 'Arcadia sustainability', value: M[AR][SUST], shown: 6.00 },
    { what: 'Lantern sustainability', value: M[LA][SUST], shown: 5.64 },
    { what: 'Larkspan A share %', value: LK.a / LK.n * 100, shown: 45.0, tol: 0.05 },
    { what: 'Larkspan B share %', value: LK.b / LK.n * 100, shown: 32.8, tol: 0.05 },
    { what: 'Larkspan difference pp', value: (LK.a - LK.b) / LK.n * 100, shown: 12.2, tol: 0.05 },
    { what: 'Larkspan pooled', value: (LK.a + LK.b) / (2 * LK.n), shown: 0.389, tol: 0.0005 },
    { what: 'Larkspan 1 − pooled', value: 1 - (LK.a + LK.b) / (2 * LK.n), shown: 0.611, tol: 0.0005 },
    { what: 'Larkspan SE', value: Math.sqrt(0.38889 * 0.61111 * (2 / 180)), shown: 0.0514, tol: 0.00005 },
    { what: 'Larkspan diff (proportion)', value: (81 - 59) / 180, shown: 0.1222, tol: 0.00005 },
    { what: 'Larkspan z', value: LKT.z, shown: 2.38 },
    { what: 'Larkspan p', value: LKT.pValue, shown: 0.017, tol: 0.0005 },
    { what: 'Larkspan respondents in all', value: 2 * LK.n, shown: 360 },
  ],
};
