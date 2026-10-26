// differentiation-and-repositioning.js — M05 · Differentiation and repositioning. Content only; exercises are in
// differentiation-and-repositioning.ex.js. Lantern's map (DERIVED.map), segments (module 2: sizes, spend, loyalty, Cold
// Brew intent) and the study's cost come from case.js; M02's Cold Brew facts and channels come through case.js's
// COMPETITORS and m02/market.js's CHANNELS. A planned position is placed with the map's own projection (core/percmap.js
// project), so the axes stay fixed; the movement per rating point is the component weight ÷ the attribute's standard
// deviation across the brands, cross-checked against NumPy. Tarnley Fitness (the gym map from perceptual-maps) and the
// bookshop are fictional. Every printed figure is recomputed in `checks`.
import { BRANDS, NEEDS, RESPONDENTS, STUDY, COMPETITORS, DERIVED as D } from './case.js?v=16';
import { CHANNELS, TIERS } from '../m02/market.js?v=16';
import { perceptualMap, distance } from '../../../core/percmap.js?v=16';
import { tInv, sampleSizeForPower, normCdf, normInv } from '../../../core/inference.js?v=16';

const M = D.map.brandMeans, MAP = perceptualMap(M), SEG = D.segments.names, SIZE = D.segments.sizes;
const B = (name) => BRANDS.indexOf(name), S = (name) => SEG.indexOf(name), A = (key) => NEEDS.findIndex((n) => n.key === key);
const LA = B('Lantern'), SU = B('Summit Brew'), AR = B('Arcadia Coffee'), CC = B('Corner Cup');
const VR = S('Value routine'), OG = S('On the go'), EX = S('Explorers'), CL = S('Craft and local'), MI = S('Mindful');
const TASTE = A('taste'), PRICE = A('price'), CONV = A('convenience'), ENERGY = A('energy'), LOCAL = A('local'), SUST = A('sustainability');
const IDEALS = D.map.segIdeal.map((p) => MAP.project(p));
const per = (j) => [MAP.vectors[j][0] / MAP.sd[j], MAP.vectors[j][1] / MAP.sd[j]];      // movement per rating point
const plan = (changes) => { const p = M[LA].slice(); for (const [j, v] of Object.entries(changes)) p[+j] = v; return MAP.project(p); };
const dist = (q, s) => distance(q, IDEALS[s]);
const NOW = MAP.scores[LA], C50 = plan({ [CONV]: 5.0 }), CSU = plan({ [CONV]: M[SU][CONV] }), C77 = plan({ [CONV]: 7, [ENERGY]: 7 });
const price = (id) => COMPETITORS.find((c) => c.id === id).price;
const conv = CHANNELS.find((c) => c.id === 'convenience'), single = TIERS.find((t) => t.id === 'single');
// tracking: Lantern's convenience ratings
const lConv = RESPONDENTS.filter((r) => r.rated.includes(LA)).map((r) => r.ratings[r.rated.indexOf(LA)][CONV]);
const mean = (a) => a.reduce((s, x) => s + x, 0) / a.length;
const sdv = (a) => { const m = mean(a); return Math.sqrt(a.reduce((s, x) => s + (x - m) ** 2, 0) / (a.length - 1)); };
const lSd = sdv(lConv), nL = lConv.length, seChange = Math.sqrt(2 * lSd ** 2 / nL), tCrit = tInv(0.975, 2 * nL - 2);
const nNeed = sampleSizeForPower({ delta: 0.3, sigma: lSd, twoSample: true });
// the same with the t distribution: the smallest n per wave for which 2((t.975 + t.80)σ/δ)² ≤ n
const nNeedT = (() => { let n = nNeed; while (2 * ((tInv(0.975, 2 * n - 2) + tInv(0.8, 2 * n - 2)) * lSd / 0.3) ** 2 > n) n++; return n; })();
// but May 2027 is already fixed at nL ratings: power against that baseline (normal approximation, two-sided 5%)
const zA = normInv(0.975), zB = normInv(0.8);
const seVs = (n2) => lSd * Math.sqrt(1 / nL + (Number.isFinite(n2) ? 1 / n2 : 0));
const power = (d, se) => normCdf(d / se - zA) + normCdf(-d / se - zA);
const se162 = seVs(nNeed), pow03 = power(0.3, se162), pow05 = power(0.5, se162), powInf = power(0.3, seVs(Infinity));
const det162 = (zA + zB) * se162, detInf = (zA + zB) * seVs(Infinity);
const lSds = NEEDS.map((_, j) => sdv(RESPONDENTS.filter((r) => r.rated.includes(LA)).map((r) => r.ratings[r.rated.indexOf(LA)][j])));
const rCS = MAP.R[CONV][SUST];
const panel = { lantern: single.quality, summit: COMPETITORS.find((c) => c.id === 'summit').quality };   // M02's 0–10 taste panel (fictional)
const rateShare = nL / STUDY.n, perComplete = STUDY.cost / STUDY.n, sampleNeed = Math.ceil(nNeed / rateShare);
// Tarnley Fitness (fictional), the gym map from the perceptual-maps lesson
const GM = [[4.2, 5.6, 4.0, 5.0, 5.8, 4.6], [6.4, 4.4, 2.8, 6.6, 3.2, 2.6], [2.0, 4.8, 6.6, 3.4, 6.2, 5.8], [5.2, 3.6, 4.8, 3.8, 4.6, 3.4], [1.8, 6.0, 3.6, 4.8, 4.8, 6.4]];
const G = perceptualMap(GM), gBusy = G.project([3.6, 5.4, 3.4, 6.4, 4.6, 5.2]), gClass = G.project([4.4, 4.2, 6.6, 4.4, 5.8, 4.4]);
const gw = (j) => [G.vectors[j][0] / G.sd[j], G.vectors[j][1] / G.sd[j]];
const gPlan = (() => { const p = GM[0].slice(); p[2] = 6.0; return G.project(p); })();

const f2 = (v) => v.toFixed(2), p0 = (v) => `${(v * 100).toFixed(0)}%`, p1 = (v) => `${(v * 100).toFixed(1)}%`;
const sg = (v) => (v < 0 ? `−${Math.abs(v).toFixed(2)}` : v.toFixed(2));
const sgn = (v) => (v < 0 ? `−${Math.abs(v).toFixed(2)}` : `+${v.toFixed(2)}`);
const sg3 = (v) => (v < 0 ? `−${Math.abs(v).toFixed(3)}` : `+${v.toFixed(3)}`);
const f3 = (v) => v.toFixed(3);
const s3 = (v) => (v < 0 ? `−${Math.abs(v).toFixed(3)}` : v.toFixed(3));
const pt = (p) => `(${sg(p[0])}, ${sg(p[1])})`;

// ---------------------------------------------------------------- figure: value positions
const cell = (x, y, title, sub, strong) => `<rect x="${x}" y="${y}" width="150" height="70" rx="6" style="fill:none;stroke:${strong ? 'var(--series-1)' : 'var(--rule-strong)'};stroke-width:${strong ? 2.2 : 1.2}${strong ? '' : ';stroke-dasharray:4 4'}"/>`
  + `<text x="${x + 75}" y="${y + 32}" text-anchor="middle"${strong ? ' font-weight="700"' : ''} fill="${strong ? 'currentColor' : 'var(--ink-3)'}">${title}</text>`
  + `<text x="${x + 75}" y="${y + 52}" text-anchor="middle" font-size="12" fill="${strong ? 'currentColor' : 'var(--ink-3)'}">${sub}</text>`;
const VALUE = '<svg viewBox="0 0 640 290" xmlns="http://www.w3.org/2000/svg" font-family="inherit" font-size="14">'
  + '<text x="388" y="18" text-anchor="middle" font-size="13" fill="var(--ink-3)">Price, compared with rivals</text>'
  + '<text x="233" y="40" text-anchor="middle" font-weight="700" fill="currentColor">More</text><text x="388" y="40" text-anchor="middle" font-weight="700" fill="currentColor">The same</text><text x="543" y="40" text-anchor="middle" font-weight="700" fill="currentColor">Less</text>'
  + '<text transform="translate(22 172) rotate(-90)" text-anchor="middle" font-size="13" fill="var(--ink-3)">Benefits, compared with rivals</text>'
  + '<text x="140" y="90" text-anchor="end" font-weight="700" fill="currentColor">More</text><text x="140" y="168" text-anchor="end" font-weight="700" fill="currentColor">The same</text><text x="140" y="246" text-anchor="end" font-weight="700" fill="currentColor">Less</text>'
  + cell(158, 52, 'More for more', 'premium, priced to match', true) + cell(313, 52, 'More for the same', 'attacks a premium rival', true) + cell(468, 52, 'More for less', 'hard to sustain', true)
  + cell(158, 130, 'The same for more', 'no reason to pay more', false) + cell(313, 130, 'The same for the same', 'no reason to switch', false) + cell(468, 130, 'The same for less', 'needs lower costs', true)
  + cell(158, 208, 'Less for more', 'no reason to buy', false) + cell(313, 208, 'Less for the same', 'no reason to buy', false) + cell(468, 208, 'Less for much less', 'strips out extras', true)
  + '</svg>';

export default {
  slug: 'differentiation-and-repositioning',
  title: 'Differentiation and repositioning',
  blurb: 'Choose how to make an offer different (product, services, channels, people, image), test which differences are worth promoting, and place the offer among the five value positions. Then plan a repositioning on a perceptual map with fixed axes, work out how far customers’ ratings would have to move, and track the result with a repeated survey.',
  status: 'draft',
  objectives: [
    'Identify the ways a company can differentiate an offer: product, services, channels, people and image.',
    'Evaluate which differences are worth promoting with the criteria important, distinctive, superior, communicable, pre-emptive, affordable and profitable.',
    'Classify offers by value position (more for more, more for the same, the same for less, less for much less, more for less) and explain why some are hard to sustain.',
    'Calculate how a planned change in mean ratings moves a brand on a perceptual map with fixed axes, and how far the move brings it towards or away from each segment’s ideal point.',
    'Plan a repositioning with its triggers, risks and a tracking survey large enough to detect the change.',
  ],
  prerequisites: [
    { lesson: 'm05/perceptual-maps', why: 'The map, its loadings and its ideal points are where a planned position is drawn.' },
    { lesson: 'm05/positioning-statements', why: 'Differentiation and repositioning carry out a positioning statement, or change it.' },
    { lesson: 'm01/competitive-advantage', why: 'Differentiation as Porter’s generic strategy, and why a low price needs a cost advantage behind it.' },
    { lesson: 'm02/distribution-channels', why: 'Channel decisions are one of the main ways an offer is differentiated, and the slowest to change.' },
    { lesson: 'b04/comparing-means', why: 'Whether a brand’s mean rating changed between two surveys is a comparison of two means.' },
  ],
  case: 'lantern',

  concept: [
    { case: `On the go drinkers are ${SIZE[OG].n} of the ${STUDY.n} respondents and account for ${p0(SIZE[OG].spendShare)} of their coffee spending, the largest share of any segment. ${p0(D.segments.coldbrewTop2[OG])} of them say they would probably or definitely buy Lantern Cold Brew. Yet on the map their ideal is ${f2(dist(NOW, OG))} from Lantern, and Lantern is rated low on the two things they want most, convenience and energy. Ana’s question for this lesson: could Lantern be seen as more convenient without losing what Craft and local drinkers see in it, and what would it take?` },
    { p: 'M01 defined <g>differentiation</g> as one of Porter’s generic strategies: being unique in ways customers value, so that they will pay a premium. This lesson is about the tools: the ways a business can actually make its offer different, how to choose the differences worth promoting, and what to do when the position customers hold in their minds is no longer the one the business needs.' },

    { h: 'Five ways to differentiate' },
    { p: 'Kotler and Armstrong’s textbook groups the ways to differentiate under a few headings: product and services, channels (distribution), people (personnel) and image. This lesson treats product and services separately, which gives five. Each works through something customers can see or experience; none works by assertion alone.' },
    { list: [
      `<b>Product</b>: features, performance, quality, design or style. For Lantern Cold Brew, single-origin Ethiopian coffee steeped for ${single.detail.match(/(\d+) hours/)[1]} hours.`,
      '<b>Services</b>: speed, convenience, delivery, installation, care. Pre-ordering in Lantern’s cafés, or delivery from its online shop.',
      `<b>Channels</b>: coverage, expertise and performance of distribution. In M02’s market, convenience stores sell ${p0(conv.volume)} of Harbour City’s canned coffee, impulse purchases of chilled singles.`,
      '<b>People</b>: hiring and training staff who are better than rivals’. Lantern’s catering clients named its baristas’ professionalism as a reason for choosing it (M01).',
      '<b>Image</b>: symbols, atmosphere, events and the associations a brand carries. Lantern’s strongest is local and independent.',
    ] },

    { h: 'Which differences are worth promoting?' },
    { p: 'Not every difference deserves to lead. Kotler and Armstrong give seven criteria that a difference should meet before a business builds its positioning on it. The list overlaps with Keller, Sternthal and Tybout’s desirability and deliverability tests from the last lesson; it adds superiority, visibility and affordability for the buyer.' },
    { table: {
      caption: 'Kotler and Armstrong’s criteria for a difference worth promoting, asked of Lantern’s local and independent position',
      head: ['Criterion', 'The question', 'Lantern: local and independent'],
      rows: [
        ['Important', 'Does it deliver a benefit target buyers value highly?', `Yes for Craft and local (index ${D.segments.index[CL][LOCAL]}); no for On the go (${D.segments.index[OG][LOCAL]})`],
        ['Distinctive', 'Do competitors not offer it, or offer it less well?', `Lantern ${f2(M[LA][LOCAL])}; no rival above ${f2(Math.max(...M.filter((_, b) => b !== LA).map((r) => r[LOCAL])))}`],
        ['Superior', 'Is it better than other ways of getting the same benefit?', 'Better than buying a national brand, for buyers who want to support local business'],
        ['Communicable', 'Can buyers see it and be told it?', 'Easy: the name, the place, the people'],
        ['Pre-emptive', 'Is it hard for competitors to copy?', 'Hard: Summit Brew can’t become a local independent'],
        ['Affordable', 'Can buyers afford to pay for it?', `A $3.49 can, below Summit Brew’s $${price('summit').toFixed(2)}`],
        ['Profitable', 'Can the business introduce it at a profit?', 'Yes: claiming it costs Lantern nothing extra, and rivals can’t buy their way into it'],
      ],
    } },

    { h: 'Value positions' },
    { p: 'Customers weigh what they get against what they pay. A widely taught scheme, usually credited to Kotler and Armstrong’s textbook, describes five value propositions on which a brand can be positioned, by its benefits and its price relative to rivals. This course calls them <g>value positions</g>, to keep “value proposition” for M01’s promise of benefits.' },
    { figure: {
      svg: VALUE,
      caption: 'Benefits against price, both compared with rivals. The five solid boxes are the value positions; the dashed ones give customers no better value than a rival and rarely survive comparison.',
      alt: 'A three-by-three grid. Columns: price more, the same, or less than rivals. Rows: benefits more, the same, or less than rivals. Five boxes are drawn solid: more for more (premium, priced to match), more for the same (attacks a premium rival), more for less (hard to sustain), the same for less (needs lower costs) and less for much less (strips out extras). Four boxes are dashed: the same for more, the same for the same, less for more and less for the same, each noted as giving customers no reason to pay more, to switch or to buy. The solid boxes are the five value positions; the dashed ones give customers no better value than a rival.',
    } },
    { p: `“More for less” is the most attractive position to customers. Sherk (2004) calls it the winning one; this course adds M01’s caution that it lasts only if the business has lower costs than its rivals, since otherwise its margins or its quality give way. On the product alone, M02’s taste panel scores Lantern Cold Brew ${panel.lantern} against Summit Brew’s ${panel.summit}, so at $3.49 against $${price('summit').toFixed(2)} the can is nearer “the same, or slightly less, for less”. Customers who judged the can as they judge Lantern’s brand (taste ${f2(M[LA][TASTE])} against ${f2(M[SU][TASTE])}), and who valued local and independent, would see more for less; against Arcadia at $${price('arcadia').toFixed(2)} it would be more for more. Which comparison customers make depends on what they taste and on the frame of reference.` },

    { h: 'Repositioning' },
    { p: '<g>Repositioning</g> is an attempt to move an offer to a different place in customers’ minds. The BCcampus open textbook calls it an effort to “move” a product in consumers’ minds, often so that it appeals to different segments; Lumen Learning describes it as changing the market’s perceptions of an offering so that it can compete better. It starts from an existing position, which is what makes it harder than positioning a new offer: customers already believe something.' },
    { p: `A perceptual map lets a business plan the move before paying for it. Hold the map’s axes where the current brands put them, change the planned brand’s mean ratings, and project the new profile with the same standardisation and weights. Raise Lantern’s convenience rating from ${f2(M[LA][CONV])} to Summit Brew’s ${f2(M[SU][CONV])}, keeping every other rating, and Lantern moves from ${pt(NOW)} to ${pt(CSU)}. It ends ${f2(dist(CSU, CL))} from the Craft and local ideal (from ${f2(dist(NOW, CL))}) and ${f2(dist(CSU, EX))} from the Explorers’ (from ${f2(dist(NOW, EX))}), but still ${f2(dist(CSU, OG))} from On the go’s.` },
    { p: `The arithmetic answers Ana’s question in two parts, on today’s axes and with every other rating held. Being seen as more convenient need not cost Lantern its craft position: Craft and local drinkers want a little more convenience than Lantern offers, so the move brings Lantern closer to them, and closer to the Explorers. That holds only if the craft ratings don’t fall as convenience rises, and across today’s brands convenience and sustainability are rated almost as opposites (correlation ${sg(rCS)}), so a tracking survey has to check it. Convenience alone also doesn’t bring Lantern near On the go drinkers, whose ideal asks for more energy, a lower price and much less of the craft that defines Lantern.` },
    { callout: 'warn', title: 'A slider is not a customer', html: 'Moving a point on a map changes nothing in Harbour City. Ratings change only when customers experience something different: cans in the chiller of the shop they already pass, a café fridge by the door, a can that tastes as good as Lantern’s coffee. The map shows where those experiences would have to take Lantern; a repeated survey shows whether they did.' },
  ],

  theory: [
    { h: 'The arithmetic of a planned move' },
    { p: 'A brand’s score on a dimension is a weighted sum of its standardised ratings, so a change in one rating moves it in a straight line. Each rating point on attribute a moves the brand by the attribute’s weight on each dimension divided by the attribute’s standard deviation across the brands. The weight is the loading divided by the square root of the dimension’s eigenvalue; the formula card below gives the rule.' },
    { table: {
      caption: 'How far one more rating point moves a brand on Lantern’s map, for each attribute (the axes held fixed)',
      head: ['Attribute', 'Dimension 1', 'Dimension 2'],
      rows: NEEDS.map((n, j) => [j === PRICE ? 'A low price' : n.label, sg3(per(j)[0]), sg3(per(j)[1])]),
      align: ['l', 'r', 'r'],
      note: 'Dimension 1 runs from cheap and everywhere (negative) to crafted and ethical (positive); Dimension 2 from light and plain to a kick and something new.',
    } },
    { p: `A convenience point moves a brand ${f2(Math.abs(per(CONV)[0]))} towards the cheap and everywhere end and ${f2(per(CONV)[1])} up. Raising Lantern’s convenience from ${f2(M[LA][CONV])} to 5.00, a rise of ${f2(5 - M[LA][CONV])} points, moves it by ${f2(5 - M[LA][CONV])} × (${s3(per(CONV)[0])}, ${s3(per(CONV)[1])}) = (${sg((5 - M[LA][CONV]) * per(CONV)[0])}, ${sg((5 - M[LA][CONV]) * per(CONV)[1])}), to ${pt(C50)}. Energy works mostly on Dimension 2: a point moves a brand ${f2(per(ENERGY)[1])} up and ${f2(Math.abs(per(ENERGY)[0]))} left.` },
    { p: `The limits show at the extremes. Even rated 7 on both convenience and energy, the top of the scale, Lantern would sit at ${pt(C77)}: ${f2(dist(C77, OG))} from On the go’s ideal, still further than Corner Cup, Summit Brew, Daily Grind RTD or Harbour Basics, and ${f2(dist(C77, CL))} from Craft and local, now further than Arcadia (${f2(D.map.distances[CL][AR])}). The map is saying that On the go drinkers want a different kind of coffee brand, not a more convenient Lantern.` },

    { h: 'Why the axes stay fixed, and when they don’t' },
    { p: 'Fixing the axes makes a planned move readable: everything else stays where it is, so the move is the plan’s alone. It is also an approximation. In a real repeat survey every brand’s means would be re-estimated, and with only six brands one brand’s move can tilt the axes themselves. The arrows would change too if Lantern broke the pattern that makes convenience and craft opposites on today’s map; a convenient craft brand would weaken the correlation between them, and the map would be re-drawn around it.' },
    { p: 'Compare two waves of a survey in both ways. First project the new wave’s brand means onto the old map’s axes, which shows each brand’s movement in the old picture, like for like. Then build the new map from the new wave, which shows whether the structure itself, which attributes go together, has changed. A brand that has truly repositioned shows up in the first; a market whose ideas have changed shows up in the second.' },

    { h: 'Tracking a position over time' },
    { p: 'A <g>tracking survey</g> repeats the same questions on the same kind of sample at intervals, so that changes can be told from differences in method. For a map that means the same attributes in the same wording and scale, the same brands, the same population and sampling design (the same panel and quotas), and the same rule for which brands each respondent rates. Change any of those and a moved point may be an artefact.' },
    { p: `It also means enough ratings of the brand that matters. Lantern’s ${nL} convenience ratings have a standard deviation of ${f2(lSd)}, the largest of its eight attributes, so a change between two waves of ${nL} ratings has a standard error of √(${f2(lSd)}² ÷ ${nL} + ${f2(lSd)}² ÷ ${nL}) = ${f2(seChange)} and must exceed about ${tCrit.toFixed(2)} × ${f2(seChange)} = ${f2(tCrit * seChange)} points to be <g>statistically significant</g> at 5%. B04’s sample-size rule says that ${nNeed} ratings in each of two waves would detect a change of 0.3 points with 80% power (${nNeedT} with the t distribution rather than the normal approximation). Because convenience has the largest standard deviation, ${nNeed} covers all eight attributes.` },
    { p: `Ana’s first wave, though, is already fixed at ${nL} ratings, and its standard error of ${f2(seVs(Infinity))} stays in every comparison with May 2027. With ${nNeed} ratings in 2028 the change has a standard error of ${f3(se162)}: a 0.3-point change is detected with only ${p0(pow03)} power, and 80% power needs a change of about ${f2(det162)}. Even an unlimited 2028 sample couldn’t bring that below ${f2(detInf)}, or lift the power for 0.3 points above ${p0(powInf)}. For Ana’s target of 0.5 points, ${nNeed} ratings in 2028 give ${p0(pow05)} power; changes of 0.3 come within reach only after 2028, once both waves being compared have ${nNeed}.` },
    { p: `At the study’s current rate (${nL} Lantern ratings from ${STUDY.n} respondents), ${nNeed} ratings would need about ${sampleNeed.toLocaleString('en-US')} respondents a wave, about $${Math.round(sampleNeed * perComplete).toLocaleString('en-US')} at the $${perComplete.toFixed(0)} a complete Ana paid in May. That estimate assumes awareness stays at its 2027 level; Cold Brew’s launch should raise it, and with it the share of respondents who can rate Lantern. Another route is a booster sample of people who know Lantern, recruited by the same panel; it changes who rates Lantern, so it must be used the same way in every wave and reported with its base.` },

    { h: 'When to reposition, and what can go wrong' },
    { p: 'Lumen Learning’s reading suggests considering repositioning when there is a need or an opportunity to improve demand: sales that have slowed, a shrinking target segment, new competitors or a rival’s innovation, a shift in the economy or in consumers’ tastes, or a change in the firm’s own leadership, strategy or technology. The process is the positioning process with a different starting point: research, a new positioning statement, the changes that will make it true, and tracking.' },
    { p: 'The same reading lists the pitfalls: too little research before the move; going “a bridge too far”, so that customers stop believing the claims; underestimating “back to basics”; overpromising what the organisation can’t deliver; and a confusing message. One more risk matters most when the current position is valuable: losing the customers who chose the brand for what it was.' },
    { p: `For Lantern that risk is concrete. Craft and local drinkers are ${p1(SIZE[CL].share)} of respondents but ${p1(SIZE[CL].spendShare)} of their spending, with the highest spend per head ($${SIZE[CL].perHead.toFixed(2)} a month) and the highest local-loyalty score of any segment (${f2(D.segments.loyalty[CL])} on the 1–5 scale, against ${f2(D.loyalty.mean)} for all respondents). A move that made Lantern look like a convenience brand would put that at risk for a segment, On the go, that the map says Lantern can’t reach.` },
    { p: 'A business that wants to serve a segment far from its current position has other choices than moving its main brand: a separate product with its own name (a sub-brand), a different channel, or leaving that segment to rivals. Which segments to serve is the targeting decision of module 3; repositioning is how a business changes the position it has, and it should follow that decision, not make it.' },
  ],

  formulas: [
    { id: 'dr-move', name: 'How a change in one mean rating moves a brand on a fixed map',
      tex: String.raw`\Delta x_k = \dfrac{w_{ak}}{s_a}\,\Delta r_a`,
      where: [
        [String.raw`\Delta x_k`, 'The change in the brand’s score on dimension k', 'map units'],
        [String.raw`w_{ak}`, 'The weight of attribute a on dimension k: its loading divided by √(the dimension’s eigenvalue)', ''],
        [String.raw`s_a`, 'The standard deviation of attribute a’s mean ratings across the brands that built the map', 'rating points'],
        [String.raw`\Delta r_a`, 'The planned change in the brand’s mean rating on attribute a', 'rating points'],
      ],
      assumptions: 'The axes are held fixed: the weights, means and standard deviations come from the current map, and no other brand moves.',
      note: 'Changes in several attributes add: sum the movements. The new position is the old one plus the movement on each dimension; its distance to each ideal point uses the distance formula from the perceptual-maps lesson.' },
  ],

  examples: [
    { level: 'simple', title: 'Which difference should a bookshop lead with?', fictional: true,
      setup: 'An independent bookshop (fictional) wants to lead its positioning with one of four differences, against an online retailer and a chain store. (a) Staff who read widely and recommend books in person. (b) The lowest prices in town. (c) Free same-day delivery by bike within the town. (d) A reading café that serves Lantern coffee. Which kind of differentiation is each, and which passes Kotler and Armstrong’s criteria best?',
      steps: [
        'Name the kind of differentiation: (a) people, (b) a value position rather than a difference in the offer, (c) channels and services, (d) product (the shop as an experience) and image.',
        'Important and distinctive: (a) matters to gift buyers and browsers and the online retailer can’t match it in person; (b) matters to price-led buyers but the online retailer is cheaper; (c) matters to some, and the online retailer already delivers, if not the same day; (d) is pleasant but not why most people choose a bookshop.',
        'Superior, communicable, pre-emptive: (a) is better than an algorithm for many buyers, easy to show (handwritten recommendation cards) and hard to copy because it lives in the staff; (c) can be copied by any rival with a courier.',
        'Affordable and profitable: (a) costs wages the shop already pays; (b) would cost margin it can’t spare against a larger rival; (c) costs a rider; (d) costs space and staff.',
      ],
      answer: '(a) Staff recommendations, a people difference, passes all seven criteria best: valued, distinctive, superior for many buyers, easy to communicate, hard to copy, affordable and profitable. (b) fails distinctive, pre-emptive and profitable.',
      interpretation: 'The strongest difference is often one the business already has and undervalues. Leading on price against a larger, cheaper rival fails almost every criterion; leading on people turns a cost the shop already carries into its reason to be chosen.' },

    { level: 'challenging', title: 'Planning a gym’s move on a fixed map', fictional: true,
      setup: `Tarnley Fitness (fictional) is the busy professionals’ nearest gym on the map from the perceptual-maps lesson: ${f2(distance(G.scores[0], gBusy))} from their ideal, with the hotel club next at ${f2(distance(G.scores[4], gBusy))}. Its manager wants to win the class lovers, whose nearest gym is the leisure centre (${f2(distance(G.scores[3], gClass))}), by adding classes until members rate Tarnley 6.0 on classes, up from 4.0. On the map, one point on classes moves a gym by ${sg3(gw(2)[0])} on Dimension 1 and ${sg3(gw(2)[1])} on Dimension 2. Where would Tarnley land, and is the move worth making?`,
      steps: [
        `Movement: a rise of 2.0 points moves Tarnley by 2.0 × (${s3(gw(2)[0])}, ${s3(gw(2)[1])}) = (${sg(2 * gw(2)[0])}, ${sg(2 * gw(2)[1])}).`,
        `New position: ${pt(G.scores[0])} + (${sg(2 * gw(2)[0])}, ${sg(2 * gw(2)[1])}) = ${pt(gPlan)}.`,
        `Distance to the class lovers’ ideal ${pt(gClass)}: √((${sg(gPlan[0])} − (${sg(gClass[0])}))² + (${sg(gPlan[1])} − (${sg(gClass[1])}))²) = ${f2(distance(gPlan, gClass))}. The leisure centre, at ${f2(distance(G.scores[3], gClass))}, is still nearer.`,
        `Distance to the busy professionals’ ideal ${pt(gBusy)}: ${f2(distance(gPlan, gBusy))}, up from ${f2(distance(G.scores[0], gBusy))}. The hotel club (${f2(distance(G.scores[4], gBusy))}) would now be their nearest gym.`,
        'Judge it. The move takes Tarnley away from the segment it already suits without making it the class lovers’ first choice. If classes are worth adding, they need a partner change that keeps Tarnley near the busy professionals (longer opening hours move a gym up and right on this map), or the gym should stay where it is.',
      ],
      answer: `Tarnley would move to ${pt(gPlan)}: ${f2(distance(gPlan, gClass))} from the class lovers (still behind the leisure centre’s ${f2(distance(G.scores[3], gClass))}) and ${f2(distance(gPlan, gBusy))} from the busy professionals (behind the hotel club’s ${f2(distance(G.scores[4], gBusy))}). The move as planned loses one segment without winning the other.`,
      interpretation: 'This is a map’s version of being caught between two segments: a position nearest neither. The calculation costs nothing and was done before a single class was timetabled. It still assumes the axes stay put and that members would rate the new classes 6.0, which only a tracking survey can confirm.' },

    { level: 'applied', title: 'How convenient can Lantern become, and how would Ana know?', fictional: true,
      setup: `Ana wants Lantern to be seen as more convenient, mainly through Cold Brew. Its launch is staged (M04): Lantern’s own channel and natural grocers first, with a randomised test in a few supermarkets. To that she adds module 3’s test in a few convenience stores, which sell ${p0(conv.volume)} of the city’s canned coffee at a ${p0(conv.margin)} trade margin and charge $${conv.listing.toLocaleString('en-US')} a year per product to be listed (M02), and a fridge by the door of each café. Plan the target position, check what it does to each segment’s distance, and design the tracking survey.`,
      steps: [
        `Target: Summit Brew’s convenience rating, ${f2(M[SU][CONV])}, a rise of ${f2(M[SU][CONV] - M[LA][CONV])} points. Movement: ${f2(M[SU][CONV] - M[LA][CONV])} × (${s3(per(CONV)[0])}, ${s3(per(CONV)[1])}) = (${sg(CSU[0] - NOW[0])}, ${sg(CSU[1] - NOW[1])}), from ${pt(NOW)} to ${pt(CSU)}.`,
        `Segments: Craft and local ${f2(dist(NOW, CL))} → ${f2(dist(CSU, CL))} (still nearest, Arcadia next at ${f2(D.map.distances[CL][AR])}); Explorers ${f2(dist(NOW, EX))} → ${f2(dist(CSU, EX))} (Summit Brew is ${f2(D.map.distances[EX][SU])}); On the go ${f2(dist(NOW, OG))} → ${f2(dist(CSU, OG))}; Mindful ${f2(dist(NOW, MI))} → ${f2(dist(CSU, MI))}; Value routine ${f2(dist(NOW, VR))} → ${f2(dist(CSU, VR))}.`,
        'What would make customers’ ratings move: availability where people already shop (the convenience-store test, widened only if it works), visibility (the café fridge, shelf placement), and nothing that dilutes the craft claims. A price cut or a strength claim would move Lantern towards On the go, but away from the drinkers who already choose it.',
        `Tracking: repeat the study in May 2028 with the same attributes, brands, panel and quotas. Against May 2027’s ${nL} ratings, ${nNeed} Lantern ratings in 2028 would detect Ana’s 0.5-point target with ${p0(pow05)} power, but a 0.3-point change with only ${p0(pow03)}. A booster sample of people who know Lantern, used the same way in every wave, is one way to reach ${nNeed}.`,
        'Success criteria, written before the change: Lantern’s convenience rating up by at least 0.5 points; taste, local and sustainability not down by more than sampling error; Lantern still the nearest brand to the Craft and local ideal.',
      ],
      answer: `Aim for Summit Brew’s convenience (${f2(M[SU][CONV])}): Lantern would move to ${pt(CSU)}, closer to Craft and local (${f2(dist(CSU, CL))}) and to the Explorers (${f2(dist(CSU, EX))}), while On the go stays far (${f2(dist(CSU, OG))}). Track it with a repeated survey and a Lantern booster, judged against criteria set in advance.`,
      interpretation: 'On the map Ana can pursue convenience with the craft position intact, provided the craft ratings hold as convenience rises, which is what the tracking survey tests: convenience is a point of parity to reach, not a new identity. What the map advises against is a repositioning towards On the go; if Lantern wants those drinkers, a separate product or brand would be the honest way to reach them, and that is a targeting decision, not a repositioning.' },
  ],

  demo: [
    { widget: 'dr-plan', intro: 'Lantern’s map with sliders for Lantern’s planned ratings. The axes stay where the six brands put them. Raise convenience from 3.1 to 5.4 and watch Lantern move left and slightly up; check in the distance table that it stays nearest Craft and local and gets closer to the Explorers. Then raise energy too, and see the distance to Craft and local grow. Finally try to make Lantern On the go’s nearest brand: notice what you have to give up (taste, local, sustainability) before it gets there.' },
  ],

  mistakes: [
    { title: '“Differentiation means adding features.”', html: 'Features are one of five routes. Services, channels, people and image can differentiate as strongly, and are often harder to copy. Lantern’s strongest difference, local and independent, is an image and a fact about ownership, not a feature.' },
    { title: '“If it is different, promote it.”', html: 'A difference must be important to the target, distinctive, superior, communicable, pre-emptive, affordable and profitable. A difference that fails importance (electric cars to buyers who don’t care) or pre-emption (anything a rival can copy next month) is a weak foundation for a position.' },
    { title: '“More for less is the best position.”', html: 'It is the best for customers and the hardest for the business to hold. Without lower costs than its rivals, a business offering more for less gives up margin or quality until the position collapses. M01’s value stick shows why.' },
    { title: '“Moving the slider shows what will happen.”', html: 'The widget shows where a planned profile would sit if customers rated the brand that way, on today’s axes. Whether they will is a question about experiences, and whether they did is a question for a tracking survey large enough to detect the change.' },
    { title: '“A repeated map with a moved point proves the repositioning worked.”', html: 'Only if the method stayed the same and the change exceeds sampling error. With 61 ratings of Lantern a wave, a change in a mean rating must exceed about 0.35 points before it can be told from chance; and a changed sample design can move a point by itself.' },
    { title: '“Repositioning is how we reach a new segment.”', html: 'Sometimes; but moving the main brand towards a segment far away risks the customers who chose it for what it was. A separate product or brand, a different channel, or leaving the segment to rivals are often better. Choosing segments is targeting; repositioning follows it.' },
  ],

  application: [
    { p: 'Repositioning decisions are rarely made at once. A brand manager states the target position as mean ratings on the map’s attributes, works out what the brand would have to do for customers to rate it that way, writes the success criteria before anything changes, and sets up the tracking survey that will judge the result. The plan is then reviewed after each wave, and abandoned if the costs of the move start to show in the ratings that matter most.' },
    { case: `Ana’s plan for 2027–28. Keep the positioning statement from the last lesson: craft, local and independent, built for Craft and local drinkers and tested on the Explorers. Treat convenience as a point of parity to reach, through channels (starting with the convenience-store test of module 3) and services (a café fridge by the door), with a target of Summit Brew’s ${f2(M[SU][CONV])}. Don’t chase On the go with Lantern’s main brand: the map shows they are ${f2(dist(CSU, OG))} away even at that target. Repeat the needs study in May 2028 with a Lantern booster.` },
    { table: {
      caption: 'Ana’s success criteria for May 2028, set before any change',
      head: ['Measure', 'May 2027', 'Target for May 2028'],
      rows: [
        ['Lantern’s convenience rating', f2(M[LA][CONV]), 'At least 0.5 points higher, beyond sampling error'],
        ['Lantern’s taste, local and sustainability ratings', `${f2(M[LA][TASTE])}, ${f2(M[LA][LOCAL])}, ${f2(M[LA][SUST])}`, 'No fall beyond sampling error'],
        ['Nearest brand to the Craft and local ideal', `Lantern (${f2(D.map.distances[CL][LA])})`, 'Still Lantern'],
        ['Lantern ratings in the wave', String(nL), `At least ${nNeed}: a 0.5-point change detected with ${p0(pow05)} power against May 2027`],
      ],
    } },
    { p: 'The plan is deliberately modest. It changes the parts of the mix that customers experience, not the claims, and it measures the result with a survey designed for the purpose. If convenience rises and the craft ratings hold, Lantern has broken, for itself, the trade-off between convenience and craft that today’s map shows across the market. That would be a real difference, and one hard for rivals on either side of the map to copy.' },
    { p: 'The same sequence serves any repositioning: a gym adding classes, a bank trying to look modern without looking less safe, a travel company moving from cheap package holidays to tailored trips. Plan the target on the map, check every segment’s distance, list what customers would have to experience, set the criteria and the tracking sample before the money is spent, and be willing to stop.' },
  ],

  summary: [
    'The ways to differentiate, after Kotler and Armstrong, are product, services, channels, people and image; each works through what customers can see or experience.',
    'A difference worth promoting is important, distinctive, superior, communicable, pre-emptive, affordable and profitable.',
    'Value positions place an offer’s benefits against its price relative to rivals: more for more, more for the same, the same for less, less for much less and more for less, the last the hardest to sustain without lower costs.',
    'Repositioning tries to move an offer to a different place in customers’ minds; plan it on the map with the axes fixed, where each rating point moves a brand by the attribute’s weight ÷ its standard deviation across the brands.',
    'On fixed axes, with its other ratings held, raising Lantern’s convenience to Summit Brew’s level brings it closer to Craft and local and the Explorers; even at the top of the scale on convenience and energy, it stays far from On the go.',
    `Track a position with a repeated survey: same attributes, brands, wording and sample design, and enough ratings to detect the change. Against May 2027’s ${nL} Lantern ratings, ${nNeed} in 2028 detect a 0.5-point change with ${p0(pow05)} power but a 0.3-point change with only ${p0(pow03)}.`,
    'Repositioning risks the customers who chose the current position, and credibility if it goes too far; reaching a distant segment may call for a separate product or a targeting decision instead.',
  ],

  glossary: [
    { term: 'Value position', def: 'Where an offer sits in the benefits it gives against the price it charges, compared with rivals; Kotler and Armstrong describe five: more for more, more for the same, the same for less, less for much less and more for less.' },
    { term: 'Repositioning', def: 'An attempt to move an existing offer to a different place in customers’ minds, by changing what they believe about it relative to competing offers.' },
    { term: 'Tracking survey', def: 'A survey repeated at intervals with the same questions, population and sampling design, so that changes over time can be told apart from differences in method.' },
    { term: 'Sub-brand', def: 'A separately named offer under a parent brand, used to serve a segment or carry a position the parent brand can’t credibly hold.' },
  ],

  references: [
    { text: 'Kotler, P. &amp; Armstrong, G. <i>Principles of Marketing</i>. Pearson (many editions), the chapter on segmentation, targeting, differentiation and positioning. The book was not consulted. Lecture slides based on the 2006 edition, chapter 7, confirm the ways to differentiate under four headings (product and services, distribution, personnel, image), the seven criteria for a difference worth promoting by name, with short definitions of important, distinctive, pre-emptive and affordable, and the positioning-statement form. The questions given here for superior, communicable and profitable are this course’s wording, and the slides do not show the value positions.', url: 'https://slidetodoc.com/market-segmentation-targeting-positioning-kotler-p-armstrong-g/', checked: '2026-10-25' },
    { text: 'Sherk, R. (2004). Value positioning: more for more, more for the same, the same for less, less for much less, more for less. Teaching notes, Oregon Coast Community College. Confirms the five value positions and their names; it calls more for less “the winning value proposition” and does not cite Kotler and Armstrong. The lesson’s caution that more for less is hard to sustain comes from M01’s argument about cost advantage, not from this source.', url: 'https://oregoncoast.edu/?p=26515', checked: '2026-10-25' },
    { text: 'Lumen Learning. <i>Principles of Marketing</i>, 8.4, “Reading: Repositioning” (when to reposition, the process and its pitfalls). CC BY 4.0.', url: 'https://biz.libretexts.org/Bookshelves/Marketing/Principles_of_Marketing_(Lumen)/08%3A_Positioning/8.04%3A_Reading-_Repositioning', checked: '2026-10-25' },
    { text: '<i>Principles of Marketing – H5P Edition</i> (2022), section 5.4, “Positioning and Repositioning Offerings” (repositioning as moving a product in consumers’ minds). BCcampus Open Education.', url: 'https://opentextbc.ca/principlesofmarketingh5p/chapter/positioning-and-repositioning-offerings/', checked: '2026-10-25' },
    { text: 'Keller, K. L., Sternthal, B. &amp; Tybout, A. M. (2002). Three questions you need to ask about your brand. <i>Harvard Business Review</i>, 80(9), 80–86 (points of difference that are feasible, profitable and defensible).', url: 'https://store.hbr.org/product/three-questions-you-need-to-ask-about-your-brand/R0209F', checked: '2026-10-25' },
  ],

  checks: [
    { what: 'On the go size', value: SIZE[OG].n, shown: 146 },
    { what: 'Respondents', value: STUDY.n, shown: 640 },
    { what: 'On the go spend share %', value: SIZE[OG].spendShare * 100, shown: 27, tol: 0.5 },
    { what: 'On the go top-two %', value: D.segments.coldbrewTop2[OG] * 100, shown: 38, tol: 0.5 },
    { what: 'On the go to Lantern', value: distance(MAP.scores[LA], IDEALS[OG]), shown: 4.48 },
    { what: 'Steeping hours (M02)', value: Number(single.detail.match(/(\d+) hours/)[1]), shown: 20 },
    { what: 'Convenience stores volume %', value: conv.volume * 100, shown: 30 },
    { what: 'Convenience stores margin %', value: conv.margin * 100, shown: 40 },
    { what: 'Convenience listing fee', value: conv.listing, shown: 4000 },
    { what: 'Craft and local index local', value: D.segments.index[CL][LOCAL], shown: 168 },
    { what: 'On the go index local', value: D.segments.index[OG][LOCAL], shown: 68 },
    { what: 'Lantern local', value: M[LA][LOCAL], shown: 6.30 },
    { what: 'Best rival local', value: Math.max(...M.filter((_, b) => b !== LA).map((r) => r[LOCAL])), shown: 3.11 },
    { what: 'Summit price', value: price('summit'), shown: 3.79 },
    { what: 'Arcadia price', value: price('arcadia'), shown: 2.89 },
    { what: 'Lantern taste', value: M[LA][TASTE], shown: 5.92 },
    { what: 'Summit taste', value: M[SU][TASTE], shown: 5.29 },
    { what: 'Lantern convenience', value: M[LA][CONV], shown: 3.15 },
    { what: 'Summit convenience', value: M[SU][CONV], shown: 5.41 },
    { what: 'Lantern position D1', value: MAP.scores[LA][0], shown: 3.20 },
    { what: 'Lantern position D2', value: MAP.scores[LA][1], shown: 0.29 },
    { what: 'Planned (Summit convenience) D1', value: MAP.scores[LA][0] + (M[SU][CONV] - M[LA][CONV]) * MAP.vectors[CONV][0] / MAP.sd[CONV], shown: 2.49 },
    { what: 'Planned (Summit convenience) D2', value: MAP.scores[LA][1] + (M[SU][CONV] - M[LA][CONV]) * MAP.vectors[CONV][1] / MAP.sd[CONV], shown: 0.59 },
    { what: 'Planned to Craft and local', value: dist(CSU, CL), shown: 0.62 },
    { what: 'Now to Craft and local', value: dist(NOW, CL), shown: 0.79 },
    { what: 'Planned to Explorers', value: dist(CSU, EX), shown: 1.37 },
    { what: 'Now to Explorers', value: dist(NOW, EX), shown: 2.12 },
    { what: 'Planned to On the go', value: dist(CSU, OG), shown: 3.74 },
    { what: 'Now to Mindful', value: dist(NOW, MI), shown: 2.54 },
    { what: 'Planned to Mindful', value: dist(CSU, MI), shown: 2.61 },
    { what: 'Now to Value routine', value: dist(NOW, VR), shown: 4.67 },
    { what: 'Planned to Value routine', value: dist(CSU, VR), shown: 4.12 },
    { what: 'Movement per convenience point D1', value: MAP.vectors[CONV][0] / MAP.sd[CONV], shown: -0.313, tol: 0.0005 },
    { what: 'Movement per convenience point D2', value: MAP.vectors[CONV][1] / MAP.sd[CONV], shown: 0.132, tol: 0.0005 },
    { what: 'Movement per convenience point D1 (2 dp)', value: Math.abs(MAP.vectors[CONV][0] / MAP.sd[CONV]), shown: 0.31 },
    { what: 'Movement per convenience point D2 (2 dp)', value: MAP.vectors[CONV][1] / MAP.sd[CONV], shown: 0.13 },
    { what: 'Movement per energy point D2', value: MAP.vectors[ENERGY][1] / MAP.sd[ENERGY], shown: 0.80 },
    { what: 'Movement per energy point D1', value: Math.abs(MAP.vectors[ENERGY][0] / MAP.sd[ENERGY]), shown: 0.27 },
    { what: 'Weight = loading / sqrt(eigenvalue), convenience D1', value: MAP.loadings[CONV][0] / Math.sqrt(MAP.values[0]), shown: -0.399, tol: 0.0005 },
    { what: 'Convenience rise to 5.00', value: 5 - M[LA][CONV], shown: 1.85 },
    { what: 'Move to 5.00 D1', value: (5 - M[LA][CONV]) * MAP.vectors[CONV][0] / MAP.sd[CONV], shown: -0.58 },
    { what: 'Move to 5.00 D2', value: (5 - M[LA][CONV]) * MAP.vectors[CONV][1] / MAP.sd[CONV], shown: 0.24 },
    { what: 'Position at 5.00 D1', value: C50[0], shown: 2.62 },
    { what: 'Position at 5.00 D2', value: C50[1], shown: 0.53 },
    { what: 'Rise to Summit convenience', value: M[SU][CONV] - M[LA][CONV], shown: 2.26 },
    { what: 'Move to Summit D1', value: CSU[0] - NOW[0], shown: -0.71 },
    { what: 'Move to Summit D2', value: CSU[1] - NOW[1], shown: 0.30 },
    { what: '7/7 position D1', value: C77[0], shown: 1.21 },
    { what: '7/7 position D2', value: C77[1], shown: 3.09 },
    { what: '7/7 to On the go', value: dist(C77, OG), shown: 3.14 },
    { what: '7/7 to Craft and local', value: dist(C77, CL), shown: 3.37 },
    { what: 'Arcadia to Craft and local', value: D.map.distances[CL][AR], shown: 1.52 },
    { what: '7/7 further from OG than the four brands', value: [SU, CC, B('Daily Grind RTD'), B('Harbour Basics')].every((b) => D.map.distances[OG][b] < dist(C77, OG)) ? 1 : 0, shown: 1 },
    { what: 'Summit to Explorers', value: D.map.distances[EX][SU], shown: 1.03 },
    { what: 'Lantern convenience ratings', value: nL, shown: 61 },
    { what: 'Lantern convenience SD', value: lSd, shown: 0.96 },
    { what: 'SE of change', value: Math.sqrt(lSd ** 2 / 61 + lSd ** 2 / 61), shown: 0.17 },
    { what: 't critical (120 df)', value: tInv(0.975, 120), shown: 1.98 },
    { what: 'Change needed', value: tInv(0.975, 120) * seChange, shown: 0.35 },
    { what: 'Ratings per wave for 0.3', value: Math.ceil(2 * ((1.959964 + 0.841621) * lSd / 0.3) ** 2), shown: 162 },
    { what: 'Respondents per wave', value: Math.ceil(162 / (61 / 640)), shown: 1700 },
    { what: 'Cost per complete', value: STUDY.cost / STUDY.n, shown: 15 },
    { what: 'Cost of a wave', value: Math.round(1700 * 15), shown: 25500 },
    { what: 'Craft and local share %', value: SIZE[CL].share * 100, shown: 17.0, tol: 0.05 },
    { what: 'Craft and local spend share %', value: SIZE[CL].spendShare * 100, shown: 25.9, tol: 0.05 },
    { what: 'Craft and local spend per head', value: SIZE[CL].perHead, shown: 76.61 },
    { what: 'Craft and local has the highest spend per head', value: SIZE.every((x, g) => g === CL || x.perHead < SIZE[CL].perHead) ? 1 : 0, shown: 1 },
    { what: 'Craft and local loyalty', value: D.segments.loyalty[CL], shown: 3.94 },
    { what: 'All loyalty', value: D.loyalty.mean, shown: 3.05 },
    { what: 'Lantern sustainability', value: M[LA][SUST], shown: 5.64 },
    { what: 'Craft and local to Lantern (table)', value: D.map.distances[CL][LA], shown: 0.79 },
    { what: 'Ratings per wave with t', value: nNeedT, shown: 163 },
    { what: 'Convenience has the largest SD of Lantern’s attributes', value: lSds.indexOf(Math.max(...lSds)) === CONV ? 1 : 0, shown: 1 },
    { what: 'SE of May 2027 mean', value: lSd / Math.sqrt(61), shown: 0.12 },
    { what: 'SE of change, 61 vs 162', value: lSd * Math.sqrt(1 / 61 + 1 / 162), shown: 0.145, tol: 0.0005 },
    { what: 'Power for 0.3, 61 vs 162 %', value: 100 * (normCdf(0.3 / se162 - 1.959964) + normCdf(-0.3 / se162 - 1.959964)), shown: 55, tol: 0.5 },
    { what: 'Detectable at 80%, 61 vs 162', value: (1.959964 + 0.841621) * lSd * Math.sqrt(1 / 61 + 1 / 162), shown: 0.41 },
    { what: 'Detectable at 80%, 61 vs unlimited', value: (1.959964 + 0.841621) * lSd / Math.sqrt(61), shown: 0.35 },
    { what: 'Power for 0.3, 61 vs unlimited %', value: 100 * powInf, shown: 68, tol: 0.5 },
    { what: 'Power for 0.5, 61 vs 162 %', value: 100 * pow05, shown: 93, tol: 0.5 },
    { what: 'Correlation convenience–sustainability across brands', value: rCS, shown: -0.95 },
    { what: 'M02 panel: single-origin can', value: panel.lantern, shown: 7.5 },
    { what: 'M02 panel: Summit Brew', value: panel.summit, shown: 8 },
    // the movement table (all eight attributes)
    { what: 'Move per point taste D1', value: MAP.vectors[A('taste')][0] / MAP.sd[A('taste')], shown: 0.347, tol: 0.0005 },
    { what: 'Move per point taste D2', value: MAP.vectors[A('taste')][1] / MAP.sd[A('taste')], shown: 0.337, tol: 0.0005 },
    { what: 'Move per point price D1', value: MAP.vectors[A('price')][0] / MAP.sd[A('price')], shown: -0.286, tol: 0.0005 },
    { what: 'Move per point price D2', value: MAP.vectors[A('price')][1] / MAP.sd[A('price')], shown: -0.243, tol: 0.0005 },
    { what: 'Move per point convenience D1', value: MAP.vectors[A('convenience')][0] / MAP.sd[A('convenience')], shown: -0.313, tol: 0.0005 },
    { what: 'Move per point convenience D2', value: MAP.vectors[A('convenience')][1] / MAP.sd[A('convenience')], shown: 0.132, tol: 0.0005 },
    { what: 'Move per point sustainability D1', value: MAP.vectors[A('sustainability')][0] / MAP.sd[A('sustainability')], shown: 0.292, tol: 0.0005 },
    { what: 'Move per point sustainability D2', value: MAP.vectors[A('sustainability')][1] / MAP.sd[A('sustainability')], shown: -0.129, tol: 0.0005 },
    { what: 'Move per point energy D1', value: MAP.vectors[A('energy')][0] / MAP.sd[A('energy')], shown: -0.272, tol: 0.0005 },
    { what: 'Move per point energy D2', value: MAP.vectors[A('energy')][1] / MAP.sd[A('energy')], shown: 0.8, tol: 0.0005 },
    { what: 'Move per point health D1', value: MAP.vectors[A('health')][0] / MAP.sd[A('health')], shown: 0.276, tol: 0.0005 },
    { what: 'Move per point health D2', value: MAP.vectors[A('health')][1] / MAP.sd[A('health')], shown: -0.279, tol: 0.0005 },
    { what: 'Move per point local D1', value: MAP.vectors[A('local')][0] / MAP.sd[A('local')], shown: 0.208, tol: 0.0005 },
    { what: 'Move per point local D2', value: MAP.vectors[A('local')][1] / MAP.sd[A('local')], shown: -0.005, tol: 0.0005 },
    { what: 'Move per point novelty D1', value: MAP.vectors[A('novelty')][0] / MAP.sd[A('novelty')], shown: 0.299, tol: 0.0005 },
    { what: 'Move per point novelty D2', value: MAP.vectors[A('novelty')][1] / MAP.sd[A('novelty')], shown: 0.391, tol: 0.0005 },
    // Tarnley
    { what: 'Tarnley to busy', value: distance(G.scores[0], gBusy), shown: 1.15 },
    { what: 'Hotel to busy', value: distance(G.scores[4], gBusy), shown: 1.58 },
    { what: 'Leisure to class lovers', value: distance(G.scores[3], gClass), shown: 1.39 },
    { what: 'Gym per class point D1', value: gw(2)[0], shown: -0.265, tol: 0.0005 },
    { what: 'Gym per class point D2', value: gw(2)[1], shown: -0.327, tol: 0.0005 },
    { what: 'Gym move D1', value: 2 * gw(2)[0], shown: -0.53 },
    { what: 'Gym move D2', value: 2 * gw(2)[1], shown: -0.65 },
    { what: 'Tarnley now D1', value: G.scores[0][0], shown: -0.28 },
    { what: 'Tarnley now D2', value: G.scores[0][1], shown: 0.62 },
    { what: 'Tarnley planned D1', value: gPlan[0], shown: -0.81 },
    { what: 'Tarnley planned D2', value: gPlan[1], shown: -0.03 },
    { what: 'Class lovers ideal D1', value: gClass[0], shown: -0.72 },
    { what: 'Class lovers ideal D2', value: gClass[1], shown: -1.47 },
    { what: 'Busy ideal D1', value: gBusy[0], shown: 0.54 },
    { what: 'Busy ideal D2', value: gBusy[1], shown: 1.43 },
    { what: 'Planned to class lovers', value: distance(gPlan, gClass), shown: 1.44 },
    { what: 'Planned to busy', value: distance(gPlan, gBusy), shown: 1.99 },
  ],
};
