// perceptual-maps.js — M05 · Perceptual maps. Content only; exercises are in perceptual-maps.ex.js.
// Lantern's map comes from case.js: the six brands' mean ratings on the eight attributes (DERIVED.map.brandMeans, from
// each respondent's ratings of three brands they know), their principal components (DERIVED.map, core/percmap.js,
// cross-checked against NumPy), the five segments' ideal points and the distances from each ideal to each brand. The
// segments themselves come from module 2 (DERIVED.segments). The bookshops and Tarnley Fitness are fictional; the gym
// map is computed here with the same engine. Every printed figure is recomputed in `checks`.
import { BRANDS, NEEDS, RESPONDENTS, STUDY, DERIVED as D } from './case.js?v=14';
import { perceptualMap, distance } from '../../../core/percmap.js?v=14';
import { tTest2, tInv } from '../../../core/inference.js?v=14';

// ---------------------------------------------------------------- Lantern's map (case.js)
const M = D.map.brandMeans, MAP = perceptualMap(M);
const SEG = D.segments.names, SIZE = D.segments.sizes, IDEAL = D.map.ideal.segments, DIST = D.map.distances;
const g = (name) => SEG.indexOf(name);
const VR = g('Value routine'), OG = g('On the go'), EX = g('Explorers'), CL = g('Craft and local'), MI = g('Mindful');
const B = (name) => BRANDS.indexOf(name);
const LA = B('Lantern'), SU = B('Summit Brew'), DG = B('Daily Grind RTD'), AR = B('Arcadia Coffee'), HB = B('Harbour Basics'), CC = B('Corner Cup');
const A = (key) => NEEDS.findIndex((n) => n.key === key);
const TASTE = A('taste'), PRICE = A('price'), CONV = A('convenience'), SUST = A('sustainability'), ENERGY = A('energy'), HEALTH = A('health'), LOCAL = A('local'), NOVELTY = A('novelty');
const LOAD = D.map.loadings, SC = D.map.scores;
const comm = (j) => LOAD[j][0] ** 2 + LOAD[j][1] ** 2;
const nearest = (s) => DIST[s].reduce((best, d, b) => (d < DIST[s][best] ? b : best), 0);
// ratings behind each brand's mean
const ratingsOf = (b) => RESPONDENTS.filter((r) => r.rated.includes(b)).map((r) => r.ratings[r.rated.indexOf(b)]);
const mean = (a) => a.reduce((s, x) => s + x, 0) / a.length;
const sd = (a) => { const m = mean(a); return Math.sqrt(a.reduce((s, x) => s + (x - m) ** 2, 0) / (a.length - 1)); };
const LR = ratingsOf(LA), SR = ratingsOf(SU), ARR = ratingsOf(AR);
const lConvSd = sd(LR.map((x) => x[CONV])), lConvSe = lConvSd / Math.sqrt(LR.length), sConvSe = sd(SR.map((x) => x[CONV])) / Math.sqrt(SR.length);
const t60 = tInv(0.975, LR.length - 1);
const tasteT = tTest2(LR.map((x) => x[TASTE]), SR.map((x) => x[TASTE]));
const sustT = tTest2(LR.map((x) => x[SUST]), ARR.map((x) => x[SUST]));
const labels = D.segments.labels;
const raters = RESPONDENTS.map((r, i) => (r.rated.includes(LA) ? i : -1)).filter((i) => i >= 0);
const ratersIn = (s) => raters.filter((i) => labels[i] === s).length;
const aware = RESPONDENTS.filter((r) => r.aware).length;
// the two-attribute map: taste against a low price across the six brands
const colOf = (j) => M.map((r) => r[j]);
const corr = (a, b) => { const ma = mean(a), mb = mean(b); let s = 0, sa = 0, sb = 0; a.forEach((x, i) => { s += (x - ma) * (b[i] - mb); sa += (x - ma) ** 2; sb += (b[i] - mb) ** 2; }); return s / Math.sqrt(sa * sb); };
const rTP = corr(colOf(TASTE), colOf(PRICE)), rEN = corr(colOf(ENERGY), colOf(NOVELTY)), rCS = corr(colOf(CONV), colOf(SUST));
const lsTwo = Math.hypot(M[LA][TASTE] - M[SU][TASTE], M[LA][PRICE] - M[SU][PRICE]);

// ---------------------------------------------------------------- Tarnley Fitness (fictional): five gyms, six attributes
const GYMS = ['Tarnley Fitness', 'the budget chain', 'the boutique studio', 'the leisure centre', 'the hotel club'];
const GATTR = ['Low price', 'Equipment', 'Classes', 'Opening hours', 'Friendly staff', 'Not crowded'];
const GM = [
  [4.2, 5.6, 4.0, 5.0, 5.8, 4.6],
  [6.4, 4.4, 2.8, 6.6, 3.2, 2.6],
  [2.0, 4.8, 6.6, 3.4, 6.2, 5.8],
  [5.2, 3.6, 4.8, 3.8, 4.6, 3.4],
  [1.8, 6.0, 3.6, 4.8, 4.8, 6.4],
];
const GMAP = perceptualMap(GM);
const GIDEAL = { busy: [3.6, 5.4, 3.4, 6.4, 4.6, 5.2], classes: [4.4, 4.2, 6.6, 4.4, 5.8, 4.4] };
const gBusy = GMAP.project(GIDEAL.busy), gClass = GMAP.project(GIDEAL.classes);
const gd = (p, b) => distance(GMAP.scores[b], p);
const gComm = (j) => GMAP.loadings[j][0] ** 2 + GMAP.loadings[j][1] ** 2;

// ---------------------------------------------------------------- the bookshops (fictional): a two-attribute map
const SHOPS = [['The chain bookshop', 5.8, 4.0], ['The independent bookshop', 4.4, 2.6], ['The supermarket’s book aisle', 2.2, 6.0], ['The online retailer', 6.6, 5.8], ['The charity shop', 3.0, 6.6]];
const STUDENTS = [5.0, 6.2], GIFTS = [4.8, 3.0];
const sd2 = (s, p) => Math.hypot(s[1] - p[0], s[2] - p[1]);

// ---------------------------------------------------------------- formatting
const f2 = (v) => v.toFixed(2), f1 = (v) => v.toFixed(1), p0 = (v) => `${(v * 100).toFixed(0)}%`, p1 = (v) => `${(v * 100).toFixed(1)}%`;
const sg = (v) => (v < 0 ? `−${Math.abs(v).toFixed(2)}` : v.toFixed(2));
const pt = (p) => `(${sg(p[0])}, ${sg(p[1])})`;

// ---------------------------------------------------------------- figure: the two-attribute map
function twoAttrFigure() {
  const X = (v) => 70 + (v - 2.5) * 135, Y = (v) => 380 - (v - 2.5) * 87.5;
  const pos = { [LA]: [0, 22, 'middle'], [SU]: [0, 22, 'middle'], [DG]: [10, 5, 'start'], [AR]: [10, 6, 'start'], [HB]: [10, 5, 'start'], [CC]: [10, 5, 'start'] };
  let s = '<svg viewBox="0 0 640 440" xmlns="http://www.w3.org/2000/svg" font-family="inherit" font-size="13" fill="currentColor">';
  s += `<rect x="${X(5.2)}" y="${Y(6.5)}" width="${X(6.5) - X(5.2)}" height="${Y(5.2) - Y(6.5)}" style="fill:none;stroke:var(--rule-strong);stroke-width:1.5;stroke-dasharray:3 4"/>`;
  s += `<text x="${(X(5.2) + X(6.5)) / 2}" y="${Y(6.0)}" text-anchor="middle" font-size="12" fill="var(--ink-3)">No brand is seen as</text>`;
  s += `<text x="${(X(5.2) + X(6.5)) / 2}" y="${Y(6.0) + 16}" text-anchor="middle" font-size="12" fill="var(--ink-3)">both tasty and low-priced</text>`;
  s += `<line x1="70" y1="380" x2="610" y2="380" style="stroke:currentColor;stroke-width:1"/><line x1="70" y1="30" x2="70" y2="380" style="stroke:currentColor;stroke-width:1"/>`;
  [3, 4, 5, 6].forEach((v) => {
    s += `<line x1="${X(v)}" y1="380" x2="${X(v)}" y2="385" style="stroke:currentColor"/><text x="${X(v)}" y="399" text-anchor="middle" font-size="12">${v}</text>`;
    s += `<line x1="65" y1="${Y(v)}" x2="70" y2="${Y(v)}" style="stroke:currentColor"/><text x="60" y="${Y(v) + 4}" text-anchor="end" font-size="12">${v}</text>`;
  });
  s += '<text x="340" y="428" text-anchor="middle" font-size="13">Taste and quality (mean rating, 1–7)</text>';
  s += '<text transform="translate(22 205) rotate(-90)" text-anchor="middle" font-size="13">A low price (mean rating, 1–7)</text>';
  // the direction along which the six brands differ most (first principal component of the two standardised ratings)
  const mt = mean(colOf(TASTE)), mp = mean(colOf(PRICE)), st = sd(colOf(TASTE)), sp = sd(colOf(PRICE)), k = 1.5;
  s += `<line x1="${X(mt - k * st).toFixed(1)}" y1="${Y(mp + k * sp).toFixed(1)}" x2="${X(mt + k * st).toFixed(1)}" y2="${Y(mp - k * sp).toFixed(1)}" style="stroke:var(--series-3);stroke-width:1.5;stroke-dasharray:7 5"/>`;
  s += '<text x="82" y="350" font-size="12" fill="var(--ink-3)">Dashed line: the direction along which</text>';
  s += `<text x="82" y="366" font-size="12" fill="var(--ink-3)">the brands differ most (${p0((1 + Math.abs(rTP)) / 2)} of the differences)</text>`;
  BRANDS.forEach((name, b) => {
    const x = X(M[b][TASTE]), y = Y(M[b][PRICE]);
    s += b === LA
      ? `<rect x="${(x - 6).toFixed(1)}" y="${(y - 6).toFixed(1)}" width="12" height="12" style="fill:var(--series-2);stroke:var(--ink);stroke-width:1"/>`
      : `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="6" style="fill:var(--series-1);stroke:var(--ink);stroke-width:1"/>`;
    const [dx, dy, anchor] = pos[b];
    s += `<text x="${(x + dx).toFixed(1)}" y="${(y + dy).toFixed(1)}" text-anchor="${anchor}"${b === LA ? ' font-weight="700"' : ''}>${name}</text>`;
  });
  return `${s}</svg>`;
}

export default {
  slug: 'perceptual-maps',
  title: 'Perceptual maps',
  blurb: 'Draw how customers see competing brands: plot two ratings against each other, or summarise many ratings with principal components. Read the dimensions, the attribute arrows and the segments’ ideal points, measure distances on the map, and judge whether an empty space is an opportunity or empty for a reason.',
  status: 'draft',
  objectives: [
    'Explain what a perceptual map shows (customers’ average perceptions of brands relative to each other) and what it can’t show.',
    'Build a two-attribute map from brands’ mean ratings and read each brand’s nearest rivals on it.',
    'Interpret a map made with principal components: the dimensions’ shares of the variance, the loadings drawn as arrows, the brands’ positions and how well each attribute is represented.',
    'Calculate the distance on the map from a segment’s ideal point to each brand, and find each segment’s nearest brand.',
    'Evaluate whether a gap on a map is a market opportunity, and state a map’s limits: small bases, the attributes asked and averages that hide segments.',
  ],
  prerequisites: [
    { lesson: 'm05/profiling-segments', why: 'The five segments and their names come from module 2; here each gets an ideal point on the map.' },
    { lesson: 'm01/competitive-advantage', why: 'Positioning, the place an offer holds in customers’ minds relative to rivals, is what a perceptual map draws.' },
    { lesson: 'm04/questionnaire-design', why: 'The brand ratings are rating-scale items; how they were asked decides what they can mean.' },
    { lesson: 'b02/scaling', why: 'The attributes are standardised across the brands before the map is built, as in B02.' },
    { lesson: 'b04/confidence-intervals', why: 'A brand’s mean rating is an estimate; its standard error and interval show how far a small base can be trusted.' },
  ],
  case: 'lantern',

  concept: [
    { case: `In May 2027 Ana’s needs study asked each of its ${STUDY.n} coffee drinkers to rate three of the six brands they knew on the same eight attributes as their needs, from 1 to 7, and then to rate their ideal coffee the same way. Module 2 turned the needs ratings into five segments. This lesson turns the brand ratings into a picture of the market as these coffee drinkers see it: where Lantern stands against Summit Brew, Daily Grind RTD, Arcadia Coffee, Harbour Basics and Corner Cup, and which segment each brand sits closest to.` },
    { p: 'A <g>perceptual map</g> is a chart that places competing brands by how customers perceive them, so that brands seen as alike sit close together and brands seen as different sit far apart. OpenStax’s <i>Principles of Marketing</i> describes it as a visual diagram of how the average target consumer perceives a product relative to its competitors. Two words in that description carry the weight. <b>Perceives</b>: the map shows beliefs, which may differ from what a blind taste test or a price check would find. <b>Average</b>: each point is a mean over many people, so the map is only as good as the ratings behind it.' },
    { p: 'A map is how <g>positioning</g> becomes visible. M01 defined positioning as the place a business wants its offer to hold in target customers’ minds, relative to competing offers; a perceptual map shows the place it actually holds today. The gap between the two is what the rest of this module works on.' },

    { h: 'The simplest map: two attributes' },
    { p: 'Choose two attributes that matter to the purchase, plot each brand’s mean rating on one against its mean rating on the other, and read the picture. OpenStax calls these <g>determinant attributes</g>: the attributes customers use in making their purchase decision. The study’s price attribute asks how far a brand offers “a low price”, so a high rating means cheap.' },
    { table: {
      caption: 'Mean ratings of the six brands on three of the eight attributes (1 = not at all … 7 = completely), Harbour City coffee drinkers who know each brand, May 2027',
      head: ['Brand', 'Rated by', 'Taste and quality', 'A low price', 'Convenience'],
      rows: BRANDS.map((name, b) => [name, String(D.map.counts[b]), f2(M[b][TASTE]), f2(M[b][PRICE]), f2(M[b][CONV])]),
      align: ['l', 'r', 'r', 'r', 'r'],
      note: 'Each respondent rated three brands they knew, so each brand has its own base. Opt-in panel with quotas on age band (fictional).',
    } },
    { figure: {
      svg: twoAttrFigure(),
      caption: 'A two-attribute map: taste against a low price. The six brands lie close to one line, and the corner where a brand would be seen as both tasty and cheap is empty.',
      alt: `A scatter chart with taste and quality on the horizontal axis and a low price on the vertical axis, both mean ratings from 1 to 7. Harbour Basics (taste ${f2(M[HB][TASTE])}, low price ${f2(M[HB][PRICE])}) and Daily Grind RTD (${f2(M[DG][TASTE])}, ${f2(M[DG][PRICE])}) sit top left: cheap but rated low on taste. Corner Cup (${f2(M[CC][TASTE])}, ${f2(M[CC][PRICE])}) and Arcadia Coffee (${f2(M[AR][TASTE])}, ${f2(M[AR][PRICE])}) sit in the middle. Summit Brew (${f2(M[SU][TASTE])}, ${f2(M[SU][PRICE])}) and Lantern, drawn as a square (${f2(M[LA][TASTE])}, ${f2(M[LA][PRICE])}), sit bottom right: tasty but not cheap. A dashed line runs from top left to bottom right through the brands, marking the direction along which they differ most. A dotted box in the top right corner, where taste and a low price are both above 5.2, is labelled: no brand is seen as both tasty and low-priced.`,
    } },
    { p: `The brands fall along a band from cheap but plain (Harbour Basics, Daily Grind RTD) to tasty but dear (Summit Brew, Lantern), with Corner Cup and Arcadia Coffee in between. Across the six brands the two ratings have a <g>correlation coefficient</g> of ${sg(rTP)}: these coffee drinkers see taste and a low price as a trade-off. On this map Lantern’s nearest rival is Summit Brew, √((${f2(M[LA][TASTE])} − ${f2(M[SU][TASTE])})² + (${f2(M[LA][PRICE])} − ${f2(M[SU][PRICE])})²) = ${f2(lsTwo)} rating points away.` },
    { p: `A two-attribute map is quick to build and easy to explain, but the two attributes you pick decide what you see. Swap the low price for convenience and Summit Brew moves well away from Lantern: it is rated ${f2(M[SU][CONV])} on convenience against Lantern’s ${f2(M[LA][CONV])}. The study measured eight attributes, and a map that uses them all needs a way of summarising them.` },

    { h: 'A map from many ratings' },
    { p: 'With eight attributes each brand is a point in eight dimensions, which nobody can draw. <g>Principal components analysis</g> (PCA) finds the two directions that show as much as possible of how the brands differ. It starts by standardising each attribute across the brands, as B02 taught: subtract the six brands’ mean rating and divide by their standard deviation. Without that step the attribute on which brands differ most in raw points (local and independent, with a standard deviation of 1.65 across the brands) would outweigh one on which they differ least (energy, 0.78).' },
    { p: '<b>Dimension 1</b> is the direction along which the six brands are most spread out. <b>Dimension 2</b> is the direction, at right angles to it, that captures most of what is left. Each brand’s position on a dimension, its score, is a weighted sum of its standardised ratings, with the weights chosen by the analysis. On the two-attribute map above, the dashed line is Dimension 1 of just two ratings: because taste and a low price move so closely together, that one line carries 98% of the differences between the brands.' },
    { p: `Each dimension carries a share of the variance: the differences between the brands’ standardised ratings. For Lantern’s six brands Dimension 1 carries ${p0(D.map.ratio[0])} and Dimension 2 ${p0(D.map.ratio[1])}, ${p0(D.map.cumulative[1])} together. The flat map therefore shows about nine-tenths of how the six brands’ average ratings differ, and leaves out a tenth.` },
    { p: 'Each attribute is drawn as an arrow from the centre. Its coordinates are the attribute’s <g>loadings</g>: its correlation with each dimension. The arrow points towards brands rated high on the attribute, and its length, at most 1, shows how well the two dimensions represent it. A chart that shows the brands as points and the attributes as arrows on the same axes is a <g>biplot</g>, a display introduced by Gabriel (1971).' },
    { table: {
      caption: 'How each attribute lines up with the map’s two dimensions: loadings (correlations with each dimension) and the share of the attribute’s differences the map shows',
      head: ['Attribute', 'Dimension 1', 'Dimension 2', 'Share on the map'],
      rows: NEEDS.map((n, j) => [j === PRICE ? 'A low price' : n.label, sg(LOAD[j][0]), sg(LOAD[j][1]), p0(comm(j))]),
      align: ['l', 'r', 'r', 'r'],
      note: `The share on the map is the sum of the two squared loadings. Dimension 1 carries ${p1(D.map.ratio[0])} of the variance and Dimension 2 ${p1(D.map.ratio[1])}.`,
    } },
    { p: `The loadings give the dimensions their meaning. Dimension 1 runs from a low price (${sg(LOAD[PRICE][0])}) and convenience (${sg(LOAD[CONV][0])}) to sustainability (${sg(LOAD[SUST][0])}), taste (${sg(LOAD[TASTE][0])}), health (${sg(LOAD[HEALTH][0])}), local (${sg(LOAD[LOCAL][0])}) and novelty (${sg(LOAD[NOVELTY][0])}): call it <i>cheap and everywhere</i> against <i>crafted and ethical</i>. Dimension 2 runs from health (${sg(LOAD[HEALTH][1])}) and a low price (${sg(LOAD[PRICE][1])}) to energy (${sg(LOAD[ENERGY][1])}), novelty (${sg(LOAD[NOVELTY][1])}) and taste (${sg(LOAD[TASTE][1])}): <i>light and plain</i> against <i>a kick and something new</i>. The names are interpretations, as segment names were in module 2; the loadings are what the data say.` },

    { h: 'Ideal points: where each segment would like a brand to be' },
    { p: 'Every respondent also rated their ideal coffee on the eight attributes. Average a segment’s ideal ratings, standardise them with the brands’ means and standard deviations, and weight them as the brands were weighted: the result is the segment’s <g>ideal point</g>, on the same map as the brands. A brand near a segment’s ideal point is close to what that segment says it wants, and the distance between them on the map measures how close.' },
    { table: {
      caption: 'Each segment’s ideal point on Lantern’s map, its nearest brand, and Lantern’s distance from it (distances in the map’s standardised units)',
      head: ['Segment (respondents)', 'Ideal point', 'Nearest brand', 'Distance', 'Lantern’s distance'],
      rows: SEG.map((name, s) => [`${name} (${SIZE[s].n})`, pt(IDEAL[s]), BRANDS[nearest(s)], f2(DIST[s][nearest(s)]), f2(DIST[s][LA])]),
      align: ['l', 'r', 'l', 'r', 'r'],
      note: 'The segments are module 2’s five k-means segments of the 640 respondents.',
    } },
    { p: `Each segment’s nearest brand is a different brand, and that is itself a finding: the market is already divided, and every segment has a brand that sits close to what it wants. Lantern is nearest the Craft and local ideal, ${f2(DIST[CL][LA])} away, and far from On the go (${f2(DIST[OG][LA])}) and Value routine (${f2(DIST[VR][LA])}), whose ideals lie on the other side of the map near Corner Cup and Harbour Basics.` },

    { h: 'Gaps on the map' },
    { p: 'A gap is a region of the map with no brand in it. OpenStax notes that a map can reveal holes or gaps that may signal an opportunity, and the word “may” matters. A gap is worth acting on only when three things hold: people want what would sit there, shown by the ideal point of a large enough segment nearby; the firm can deliver it credibly, at a cost its price covers; and nothing explains the emptiness except that nobody has tried.' },
    { p: 'On the two-attribute map the tasty and cheap corner is empty for a reason: better coffee costs more to buy and make, so a brand that sat there would struggle to cover its costs, and customers might not believe it. On the full map the space around the Explorers’ ideal, between Lantern and Summit Brew, is more interesting. The Explorers’ nearest brand is Summit Brew at 1.03, a longer distance than three other segments have to travel to theirs, so that segment is served less closely than most. That makes it worth investigating, not yet worth acting on.' },
    { callout: 'key', title: 'Perceptions, on the attributes asked, for the people asked', html: 'A perceptual map shows how the people surveyed see the brands they know, on the attributes the questionnaire asked about, averaged over everyone who rated each brand, and only as much of the differences as two dimensions can carry. Each of those limits can change a conclusion, so state them beside the map.' },
  ],

  theory: [
    { h: 'Where the ratings come from, and how far to trust them' },
    { p: 'The brand ratings are rating-scale items of the kind M04 designed, asking how well each of the eight attributes describes the brand, from 1 to 7. Respondents rated only brands they knew, because a rating of an unknown brand would be a guess. Each brand’s mean is therefore based on a different number of people, its <g>base</g>.' },
    { p: `The bases run from ${D.map.counts[CC]} ratings of Corner Cup to only <b>${D.map.counts[LA]} of Lantern</b>. Only ${aware} of the ${STUDY.n} respondents (${p0(D.aware)}) knew Lantern, and ${D.map.counts[LA]} of them were asked to rate it. A small base makes a mean less precise. Lantern’s convenience ratings have a standard deviation of ${f2(lConvSd)}, so the <g>standard error</g> of their mean is ${f2(lConvSd)} ÷ √${D.map.counts[LA]} = ${f2(lConvSe)}, and a 95% <g>confidence interval</g> runs from ${f2(M[LA][CONV] - t60 * lConvSe)} to ${f2(M[LA][CONV] + t60 * lConvSe)}. Summit Brew’s mean, from ${D.map.counts[SU]} ratings, has a standard error of ${f2(sConvSe)}.` },
    { p: `Large gaps survive a small base. Lantern’s taste rating is ${f2(tasteT.diff)} points above Summit Brew’s, with a Welch t of ${f2(tasteT.t)}, far beyond chance. Smaller ones need checking before they are used: Arcadia’s sustainability rating is ${f2(-sustT.diff)} points above Lantern’s (t = ${sg(sustT.t)}, p = ${sustT.p.toFixed(3)}), so the difference is real but not large. Test a difference of a few tenths of a point involving Lantern, as here, before building a claim on it.` },
    { p: `Who rated a brand matters as much as how many. ${ratersIn(CL)} of Lantern’s ${D.map.counts[LA]} raters (${p0(ratersIn(CL) / D.map.counts[LA])}) are in the Craft and local segment, which is ${p0(SIZE[CL].share)} of the sample; only ${ratersIn(VR)} (${p0(ratersIn(VR) / D.map.counts[LA])}) are in Value routine, which is ${p0(SIZE[VR].share)}. Lantern’s point shows how the people who know it see it, and they lean towards its natural customers. The 86% who don’t know Lantern have no perception of it to map, which is a finding in its own right.` },

    { h: 'How principal components build the map' },
    { ol: [
      '<b>Brand means.</b> Average each brand’s ratings on each attribute: a table of brands by attributes (six by eight here).',
      '<b>Standardise across the brands.</b> For each attribute, subtract the brands’ mean and divide by their standard deviation, so every attribute has mean 0 and standard deviation 1 across the brands.',
      '<b>Find the directions.</b> The analysis looks at how the attributes vary together across the brands (their correlations) and finds the direction with the most variance, then the next at right angles to it, and so on. The variance each direction carries is its <b>eigenvalue</b>; with standardised attributes the eigenvalues add up to the number of attributes.',
      '<b>Place the brands.</b> Each brand’s score on a dimension is a weighted sum of its standardised ratings, with that dimension’s weights.',
      '<b>Draw the arrows.</b> Each attribute’s loading on a dimension is its correlation with the brands’ scores on that dimension.',
      '<b>Place anything else with the same recipe.</b> An ideal point, or a brand you are planning, is standardised with the brands’ means and standard deviations and weighted with the same weights, so it lands on the same axes without moving anyone else.',
    ] },
    { p: `For Lantern’s six brands the eigenvalues are ${D.map.values.slice(0, 5).map(f2).join(', ')}, and the last three are zero: six points can spread in at most five directions. Each share is an eigenvalue divided by 8, so Dimension 1 carries ${f2(D.map.values[0])} ÷ 8 = ${p1(D.map.ratio[0])}. Note what the ${p0(D.map.cumulative[1])} is a share of: the differences between six brands’ averages, not between ${STUDY.n} people. Individual ratings vary far more than averages do, and the map shows none of that spread.` },

    { h: 'Reading a biplot' },
    { list: [
      '<b>Position along an arrow.</b> Drop a line from a brand to the line through an arrow: the further along the arrow it lands, the higher the brand’s rating on that attribute compared with the other brands. The reading is approximate, as good as the map’s representation of that attribute. Lantern lies far along the arrows for local, sustainability and taste, and well back on convenience and a low price.',
      `<b>Angles between arrows.</b> Arrows that point the same way belong to attributes that rise and fall together across these brands; arrows pointing in opposite directions are traded off; arrows at right angles are unrelated. Convenience and sustainability point almost opposite ways (their correlation across the six brands is ${sg(rCS)}), while energy and novelty are nearly at right angles (${f2(rEN)}).`,
      `<b>Arrow length.</b> An arrow’s squared length is the share of that attribute’s differences the map shows. Local and independent has the shortest arrow, with ${p0(comm(LOCAL))} on the map: Lantern’s lead on local (${f2(M[LA][LOCAL])} against at most ${f2(Math.max(...M.filter((_, b) => b !== LA).map((r) => r[LOCAL])))} for any rival) is understated by the picture.`,
      '<b>The axes have no fixed direction.</b> The analysis decides each dimension’s sign arbitrarily; flipping an axis changes nothing. “Right” is not better than “left”, and the names belong to whoever reads the loadings.',
      '<b>Distances are in standardised units on two dimensions.</b> Compare them within one map. A distance of 1 on this map and 1 on another map built from other brands or attributes mean different things.',
    ] },

    { h: 'Ideal points and their assumptions' },
    { p: 'Reading the distance from an ideal point as appeal assumes that a segment prefers whichever brand is closest to its ideal, with both dimensions counting equally. That is a model. Three cautions apply. Ideal ratings can drift high on everything desirable (an ideal coffee that tastes great and costs little), which pushes ideal points towards the edge of the map rather than among the brands. A segment’s average ideal hides how much its members disagree. And the distance uses only the two dimensions drawn, so differences on the tenth of the variance left off the map are ignored.' },
    { p: `The all-respondent ideal sits at ${pt(D.map.ideal.all)}, near the centre-right of the map. A business that positions for that average ideal is positioning for nobody in particular: no segment’s ideal sits close to it (the nearest, the Explorers’, is ${f2(distance(D.map.ideal.all, IDEAL[EX]))} away), which is the argument for segmenting in the first place.` },

    { h: 'Other kinds of map, in outline' },
    { p: 'This lesson’s map is attribute-based: customers rate brands on named attributes, and the map summarises those ratings. Factor analysis and discriminant analysis are related ways of building such maps. A similarity-based map asks customers only how alike pairs of brands are, and multidimensional scaling places the brands so that the distances on the map match the judgements; the dimensions are named afterwards, which captures attributes nobody thought to ask about but makes naming harder. When the data are counts of yes/no associations (“Which of these brands is friendly?”), correspondence analysis draws a similar picture. Each method answers a slightly different question, and none of them shows more than the data put in.' },

    { h: 'What a map cannot tell you' },
    { list: [
      '<b>Attributes nobody asked about.</b> The map has eight attributes because the questionnaire did. If something else drives choice (whether a brand is sold at the office, say), it isn’t on the map. The list of attributes should come from <g>qualitative research</g> before the survey, as M04 described.',
      '<b>People nobody asked.</b> The study is an <g>opt-in panel</g> with quotas on age band, not a probability sample, and each brand was rated only by people who knew it.',
      `<b>Differences between segments.</b> A brand’s mean averages over everyone who rated it. Craft and local and On the go may see Lantern differently, but Lantern’s ${D.map.counts[LA]} ratings split into five segments leave between ${Math.min(...SEG.map((_, s) => ratersIn(s)))} and ${Math.max(...SEG.map((_, s) => ratersIn(s)))} per segment: too few to map each segment’s view.`,
      '<b>Change.</b> A map is a snapshot of May 2027. Whether a position is moving shows only in a repeated survey, the subject of this module’s last lesson.',
      '<b>Choice.</b> Closeness to an ideal suggests appeal; it doesn’t measure purchase. Price, availability and habit also decide what people buy.',
    ] },
  ],

  formulas: [
    { id: 'pm-distance', name: 'Distance on the map between an ideal point and a brand',
      tex: String.raw`d = \sqrt{(x_b - x_i)^2 + (y_b - y_i)^2}`,
      where: [
        ['d', 'The straight-line distance on the map between the brand and the ideal point', 'map units'],
        [String.raw`x_b,\ y_b`, 'The brand’s coordinates on Dimensions 1 and 2', 'map units'],
        [String.raw`x_i,\ y_i`, 'The ideal point’s coordinates on Dimensions 1 and 2', 'map units'],
      ],
      assumptions: 'Both points are on the same map, built from the same brands and attributes. On a two-attribute map the coordinates are mean ratings and the distance is in rating points.',
      note: 'The same formula gives the distance between two brands. Shorter means closer to what the segment says it wants, on the two dimensions drawn.' },
    { id: 'pm-share', name: 'Share of the variance a dimension carries',
      tex: String.raw`\text{Share}_k = \dfrac{\lambda_k}{\lambda_1 + \lambda_2 + \cdots + \lambda_p} = \dfrac{\lambda_k}{p}`,
      where: [
        [String.raw`\lambda_k`, 'The eigenvalue of dimension k: the variance it carries across the brands', ''],
        ['p', 'The number of standardised attributes (the eigenvalues add up to p)', 'attributes'],
      ],
      assumptions: 'The attributes are standardised across the brands, so each contributes a variance of 1.',
      note: 'The two-dimensional map shows Share₁ + Share₂ of the differences between the brands’ average ratings.' },
    { id: 'pm-communality', name: 'Share of an attribute shown on a two-dimensional map',
      tex: String.raw`h^2_a = \ell_{a1}^2 + \ell_{a2}^2`,
      where: [
        [String.raw`h^2_a`, 'The communality: the share of attribute a’s variance across the brands that the two dimensions represent (0 to 1)', ''],
        [String.raw`\ell_{a1},\ \ell_{a2}`, 'Attribute a’s loadings on Dimensions 1 and 2: its correlations with the brands’ scores', ''],
      ],
      assumptions: 'Loadings are correlations, as in a map of standardised attributes.',
      note: 'The arrow’s length is the square root of the communality. A short arrow means the map hides much of how brands differ on that attribute.' },
  ],

  examples: [
    { level: 'simple', title: 'Four kinds of bookshop and two kinds of book buyer', fictional: true,
      setup: `A survey in a market town (fictional) asked book buyers to rate five places that sell books on two attributes from 1 to 7, and to rate their ideal bookshop the same way. Students’ ideal is (range ${STUDENTS[0]}, low prices ${STUDENTS[1]}); people buying books as gifts want (${GIFTS[0]}, ${GIFTS[1]}). Which seller is nearest each group’s ideal, and what does the map say to the independent bookshop?`,
      table: { head: ['Seller', 'Range of titles', 'Low prices'], rows: SHOPS.map((s) => [s[0], f1(s[1]), f1(s[2])]), align: ['l', 'r', 'r'] },
      steps: [
        'Plot the five sellers with range across and low prices up. The online retailer sits top right, rated high on both; the supermarket and the charity shop sit top left (cheap, narrow range); the chain bookshop sits right of centre and the independent bottom centre (dearer, middling range).',
        `Distance from the students’ ideal, √((range − ${STUDENTS[0]})² + (low prices − ${STUDENTS[1]})²): the chain ${f2(sd2(SHOPS[0], STUDENTS))}, the independent ${f2(sd2(SHOPS[1], STUDENTS))}, the supermarket ${f2(sd2(SHOPS[2], STUDENTS))}, online ${f2(sd2(SHOPS[3], STUDENTS))} and the charity shop ${f2(sd2(SHOPS[4], STUDENTS))}. Nearest: the online retailer.`,
        `Distance from the gift buyers’ ideal: the chain ${f2(sd2(SHOPS[0], GIFTS))}, the independent ${f2(sd2(SHOPS[1], GIFTS))}, the supermarket ${f2(sd2(SHOPS[2], GIFTS))}, online ${f2(sd2(SHOPS[3], GIFTS))} and the charity shop ${f2(sd2(SHOPS[4], GIFTS))}. Nearest: the independent bookshop.`,
        'Read the gaps. No seller sits near the bottom left (narrow range and dear), and nobody should want to. The top right is occupied by the online retailer alone, which is why it is nearest the students.',
      ],
      answer: `The online retailer is nearest the students (${f2(sd2(SHOPS[3], STUDENTS))} rating points); the independent bookshop is nearest the gift buyers (${f2(sd2(SHOPS[1], GIFTS))}).`,
      interpretation: 'The independent can’t win students on these two attributes without matching the online retailer on price, which it almost certainly can’t afford. It already sits close to gift buyers, so its question is how many of them there are and what else they value (advice, wrapping, a pleasant shop), none of which this two-attribute map shows.' },

    { level: 'challenging', title: 'Reading a gym chain’s principal-components map', fictional: true,
      setup: `Tarnley Fitness (fictional) surveyed local gym-goers, who rated five gyms they knew on six attributes. The principal components of the five gyms’ mean ratings give eigenvalues ${GMAP.values.slice(0, 4).map(f2).join(', ')}, 0 and 0. The table gives the loadings; the gyms’ scores are Tarnley ${pt(GMAP.scores[0])}, the budget chain ${pt(GMAP.scores[1])}, the boutique studio ${pt(GMAP.scores[2])}, the leisure centre ${pt(GMAP.scores[3])} and the hotel club ${pt(GMAP.scores[4])}. Two segments’ ideal points, projected on the same map, are busy professionals ${pt(gBusy)} and class lovers ${pt(gClass)}. How good is the map, what do its dimensions mean, and is there a gap Tarnley should look at?`,
      table: { head: ['Attribute', 'Dimension 1', 'Dimension 2'], rows: GATTR.map((a, j) => [a, sg(GMAP.loadings[j][0]), sg(GMAP.loadings[j][1])]), align: ['l', 'r', 'r'] },
      steps: [
        `How much the map shows. Six standardised attributes give eigenvalues adding to 6, so Dimension 1 carries ${f2(GMAP.values[0])} ÷ 6 = ${p1(GMAP.ratio[0])} and Dimension 2 ${f2(GMAP.values[1])} ÷ 6 = ${p1(GMAP.ratio[1])}: ${p1(GMAP.cumulative[1])} together. A two-dimensional map is a fair summary of how these five gyms differ.`,
        `Name the dimensions from the loadings. Dimension 1 runs from friendly staff (${sg(GMAP.loadings[4][0])}), not crowded (${sg(GMAP.loadings[5][0])}) and classes (${sg(GMAP.loadings[2][0])}) to a low price (${sg(GMAP.loadings[0][0])}) and opening hours (${sg(GMAP.loadings[3][0])}): <i>personal and spacious</i> against <i>cheap and always open</i>. Dimension 2 runs from classes (${sg(GMAP.loadings[2][1])}) to equipment (${sg(GMAP.loadings[1][1])}): <i>classes</i> against <i>kit</i>.`,
        `Check each attribute’s share on the map (the communality, loading² + loading²). Friendly staff is lowest: ${sg(GMAP.loadings[4][0])}² + ${sg(GMAP.loadings[4][1])}² = ${f2(gComm(4))}, so ${p0(1 - gComm(4))} of how the gyms differ on friendliness is off the map. The others are between ${f2(Math.min(...[0, 1, 2, 3, 5].map(gComm)))} and ${f2(Math.max(...[0, 1, 2, 3, 5].map(gComm)))}.`,
        `Distances from the class lovers’ ideal: Tarnley ${f2(gd(gClass, 0))}, the budget chain ${f2(gd(gClass, 1))}, the boutique studio ${f2(gd(gClass, 2))}, the leisure centre ${f2(gd(gClass, 3))}, the hotel club ${f2(gd(gClass, 4))}. From the busy professionals’ ideal: Tarnley ${f2(gd(gBusy, 0))}, the budget chain ${f2(gd(gBusy, 1))}, the boutique studio ${f2(gd(gBusy, 2))}, the leisure centre ${f2(gd(gBusy, 3))}, the hotel club ${f2(gd(gBusy, 4))}.`,
        `Judge the gap. The class lovers’ ideal sits between the boutique studio and the leisure centre with no gym closer than ${f2(gd(gClass, 3))}, while Tarnley is the busy professionals’ nearest gym (${f2(gd(gBusy, 0))}, with the hotel club next at ${f2(gd(gBusy, 4))}). The class lovers are the less closely served segment, but Tarnley would have to move towards classes, away from where its own nearest customers want it.`,
      ],
      answer: `The map shows ${p1(GMAP.cumulative[1])} of the differences; its dimensions are personal and spacious against cheap and always open, and classes against kit. Tarnley is nearest the busy professionals; the class lovers’ ideal is a thinly served space, ${f2(gd(gClass, 3))} from the nearest gym and ${f2(gd(gClass, 0))} from Tarnley.`,
      interpretation: 'The map points to a question rather than an answer: is the class lovers’ segment big enough, and could Tarnley add classes credibly without losing the busy professionals it already suits? The last lesson of this module shows how to plan such a move on the map before paying for it.' },

    { level: 'applied', title: 'Where Lantern stands, and whom it stands near', fictional: true,
      setup: 'Ana wants to know three things before she drafts Lantern’s positioning: where Lantern sits on the map, which segments’ ideals it is near and far from, and how much weight its own point can bear. Use the map, the ideal points and the bases.',
      steps: [
        `Lantern’s position. Its score is ${pt(SC[LA])}: the furthest of any brand towards the crafted and ethical end of Dimension 1 and a little above the centre on Dimension 2. Its nearest brands are Arcadia Coffee (${f2(distance(SC[LA], SC[AR]))} away, lower on Dimension 2: healthier and plainer) and Summit Brew (${f2(distance(SC[LA], SC[SU]))}, higher: more of a kick, and more convenient).`,
        `Which ideals it is near. Craft and local is the only segment whose nearest brand is Lantern (${f2(DIST[CL][LA])}); Arcadia is next for that segment at ${f2(DIST[CL][AR])}. Explorers are ${f2(DIST[EX][LA])} from Lantern and ${f2(DIST[EX][SU])} from Summit Brew. Mindful are ${f2(DIST[MI][LA])} from Lantern and only ${f2(DIST[MI][AR])} from Arcadia.`,
        `Which ideals it is far from. On the go (${f2(DIST[OG][LA])}) and Value routine (${f2(DIST[VR][LA])}) sit on the far side of the map. On the go’s nearest brand is Corner Cup (${f2(DIST[OG][CC])}), then Summit Brew (${f2(DIST[OG][SU])}) and Daily Grind RTD (${f2(DIST[OG][DG])}).`,
        `How much weight Lantern’s point can bear. It rests on ${D.map.counts[LA]} ratings, ${p0(ratersIn(CL) / D.map.counts[LA])} of them from Craft and local, against bases of ${Math.min(...D.map.counts.filter((_, b) => b !== LA))} to ${Math.max(...D.map.counts)} for the rivals. Its big differences (taste, local and independent, convenience) are well beyond sampling error; small ones are not. And it is a rating of Lantern as a brand, which raters know from its cafés and beans, not a rating of the can of Cold Brew.`,
      ],
      answer: `Lantern holds a distinct crafted and ethical position nearest the Craft and local ideal (${f2(DIST[CL][LA])}), with Arcadia and Summit Brew its nearest rivals on either side; it is far from On the go (${f2(DIST[OG][LA])}) and Value routine (${f2(DIST[VR][LA])}). The point rests on ${D.map.counts[LA]} ratings from people who know Lantern.`,
      interpretation: `The map gives Ana her competitive set for each segment: Arcadia for Craft and local and Mindful drinkers, Summit Brew for Explorers, Corner Cup and Summit Brew for On the go. It also shows the tension the next two lessons work on. Cold Brew’s top-two intent is highest in Craft and local (${p0(D.segments.coldbrewTop2[CL])}) and On the go (${p0(D.segments.coldbrewTop2[OG])}), two segments at opposite sides of the map.` },
  ],

  demo: [
    { widget: 'pm-lantern', intro: 'Lantern’s map from the May 2027 study: the six brands, the eight attribute arrows and the five segments’ ideal points. Switch the arrows off to see the brands alone, then on again and read Lantern’s position along the local, taste and convenience arrows. Switch the ideal points on and find each segment’s nearest brand in the distance table; check that Lantern is in bold only for Craft and local. Then look at the arrow for local and independent: it is the shortest, so the map understates Lantern’s biggest lead.' },
  ],

  mistakes: [
    { title: '“The map shows where the brands really are.”', html: 'It shows how the people surveyed perceive them. Lantern’s convenience rating of 3.15 is a belief held by people who know Lantern, and it may lag behind what Lantern actually offers. That is why a map is a positioning tool: the place in customers’ minds is the thing being managed.' },
    { title: '“Every empty space on the map is an opportunity.”', html: 'A gap is an opportunity only if a large enough segment wants what would sit there, the firm can deliver it credibly at a cost its price covers, and the space isn’t empty for a reason. The tasty and cheap corner of the two-attribute map is empty because good coffee costs more, not because nobody has noticed it.' },
    { title: '“A long arrow means customers care about that attribute.”', html: 'An arrow’s length shows how well the two dimensions represent how the brands differ on that attribute. How much customers care comes from the needs ratings and the segment profiles. An attribute everyone cares about but on which all brands are rated alike has a short arrow, or barely shapes the map at all.' },
    { title: '“Every brand’s point is equally reliable.”', html: 'Each point is a mean with its own base. Lantern’s rests on 61 ratings, Corner Cup’s on 456. Report the bases with the map, and treat small differences involving a small base as uncertain.' },
    { title: '“Brands close together on Dimension 1 are similar.”', html: 'Read both dimensions, and remember that the map leaves out a tenth of the differences. Two brands close on the map may still differ on an attribute the map represents poorly, such as local and independent here. Check the table of means before claiming two brands are seen alike.' },
    { title: '“The right-hand end of a dimension is the good end.”', html: 'The direction of each axis is arbitrary; the analysis could flip it without changing anything. The ends mean whatever the loadings say, and whether a position is good depends on which segment you want to be near.' },
  ],

  application: [
    { p: 'A brand manager uses a perceptual map as a position review, before anyone writes a positioning statement or plans a campaign. The review asks four questions in order: where are we, and who is near us; which rival is nearest each segment we might serve; what would have to change for us to be nearer the segment we want; and how good is the evidence. The answers become the inputs to the next two lessons.' },
    { case: `Ana’s review for Lantern. Lantern holds the crafted and ethical end of the map alone, nearest the Craft and local ideal. That segment is ${SIZE[CL].n} of the ${STUDY.n} respondents but spends the most per head ($${SIZE[CL].perHead.toFixed(2)} a month) and has the highest Cold Brew intent (${p0(D.segments.coldbrewTop2[CL])} top-two). Its nearest rival for Craft and local is Arcadia Coffee, which holds the Mindful drinkers more closely than Lantern does. Summit Brew sits between Lantern and the convenient brands, nearest the Explorers, and is the brand Cold Brew will be compared with on the shelf.` },
    { table: {
      caption: 'Ana’s position review: what the map says, and what it can’t',
      head: ['Question', 'What the map says', 'What it can’t say'],
      rows: [
        ['Where is Lantern?', 'The crafted and ethical end of Dimension 1, alone', 'How Lantern Cold Brew, which the survey didn’t rate, will be seen'],
        ['Who is it near?', `Craft and local (${f2(DIST[CL][LA])}); Explorers next (${f2(DIST[EX][LA])})`, 'How each segment sees Lantern: too few ratings per segment'],
        ['Who are the rivals?', 'Arcadia for Craft and local and Mindful; Summit Brew for Explorers; Corner Cup for On the go', 'Rivals on attributes the survey didn’t ask about'],
        ['How good is the evidence?', `${D.map.counts[LA]} ratings of Lantern; ${p0(D.map.cumulative[1])} of the differences on the map`, 'Whether people who don’t know Lantern would see it the same way'],
      ],
    } },
    { p: 'Two decisions follow from the review, and both belong to the lessons ahead. The first is what Lantern should claim, and against whom: the frame of reference, the points of parity and the points of difference that make up a positioning statement. The second is whether Lantern should try to move on the map, towards the On the go drinkers who like the idea of canned cold brew, and what such a move would cost in credibility with the Craft and local drinkers who already see Lantern as theirs.' },
    { p: 'The same review works for any business with rivals customers can compare: a gym deciding whether to add classes, a bank checking whether its new app has changed how it is seen, a travel company comparing itself with online booking sites. In each case the map is only as good as the attributes asked, the people asked and the number of ratings behind each point, so the review starts by stating those limits.' },
  ],

  summary: [
    'A perceptual map places brands by how customers perceive them: alike brands close, different brands far apart. It shows perceptions, not facts.',
    'A two-attribute map plots mean ratings directly; it is quick but shows only the two attributes chosen, and a different pair can change the picture.',
    'A principal-components map summarises many standardised ratings in two dimensions. Each dimension carries a share of the variance (its eigenvalue ÷ the number of attributes); Lantern’s map carries 68% and 21%, 90% together.',
    'Loadings, drawn as arrows, are each attribute’s correlations with the dimensions: an arrow points towards brands rated high on it, and its squared length (the communality) is the share of that attribute the map shows.',
    'Ideal points place each segment’s ideal on the same map; the distance from an ideal point to a brand measures how close the brand is to what the segment says it wants. Lantern is nearest the Craft and local ideal.',
    'A gap is an opportunity only if a large enough segment wants it, the firm can deliver it credibly and profitably, and it isn’t empty for a reason.',
    'State the limits beside any map: the bases (Lantern’s 61 ratings), who rated each brand, the attributes asked, the averages that hide segments, and the share of the differences left off the map.',
  ],

  glossary: [
    { term: 'Perceptual map', def: 'A chart that places competing brands by how customers perceive them, so that brands seen as alike sit close together; built from customers’ ratings or similarity judgements.' },
    { term: 'Determinant attributes', def: 'The attributes customers use in making a purchase decision, and so the ones worth putting on a perceptual map.' },
    { term: 'Principal components analysis', def: 'A method that summarises many correlated variables in a few uncorrelated dimensions, the first carrying the most variance, the second the most of what is left, and so on. On a perceptual map it is applied to brands’ standardised mean ratings.' },
    { term: 'Eigenvalue', def: 'In principal components analysis, the variance a dimension carries. With standardised variables the eigenvalues add up to the number of variables, so each divided by that number is the dimension’s share of the variance.' },
    { term: 'Loadings', def: 'In principal components analysis of standardised variables, the correlations between each variable and each dimension; on a perceptual map they are drawn as arrows.' },
    { term: 'Communality', def: 'The share of a variable’s variance that the retained dimensions represent; on a two-dimensional map, the sum of its two squared loadings.' },
    { term: 'Biplot', def: 'A chart that shows the rows of a data table as points and its columns as arrows on the same axes, such as brands and attributes on a perceptual map.' },
    { term: 'Ideal point', def: 'The position on a perceptual map of the profile a customer or segment says it would most like; brands nearer it are closer to what that customer or segment wants.' },
  ],

  references: [
    { text: 'Gomez Albrecht, M., Green, M. &amp; Hoffman, L. (2023). <i>Principles of Marketing</i>, section 5.6, “Product Positioning” (perceptual maps, determinant attributes, gaps). OpenStax. Read in the LibreTexts copy of the same edition.', url: 'https://biz.libretexts.org/Bookshelves/Marketing/Principles_of_Marketing_(OpenStax)/02%3A_Understanding_the_Marketplace/05%3A_Market_Segmentation_Targeting_and_Positioning/5.06%3A__Product_Positioning', checked: '2026-10-25' },
    { text: 'Greenacre, M. (2010). <i>Biplots in Practice</i>, chapter 6, “Principal Component Analysis Biplots”. Bilbao: Fundación BBVA.', url: 'https://fbbva.es/wp-content/uploads/2017/05/dat/greenacre_c06_2010.pdf', checked: '2026-10-25' },
    { text: 'Gabriel, K. R. (1971). The biplot graphic display of matrices with application to principal component analysis. <i>Biometrika</i>, 58(3), 453–467. Citation and abstract confirmed from the bibliography of Greenacre (2010); the paper itself was not consulted.', url: 'https://fbbva.es/wp-content/uploads/2017/05/dat/greenacre_ap0B_2010.pdf', checked: '2026-10-25' },
    { text: 'NIST/SEMATECH (2012). <i>e-Handbook of Statistical Methods</i>, section 6.5.5.2, “Principal Components: Numerical Example” (eigenvalues of the correlation matrix, cumulative proportions, communalities).', url: 'https://itl.nist.gov/div898/handbook/pmc/section5/pmc552.htm', checked: '2026-10-25' },
  ],

  checks: [
    { what: 'Respondents (case.js)', value: STUDY.n, shown: 640 },
    { what: 'Base: Lantern', value: D.map.counts[LA], shown: 61 },
    { what: 'Base: Corner Cup', value: D.map.counts[CC], shown: 456 },
    { what: 'Base: Summit Brew', value: D.map.counts[SU], shown: 289 },
    { what: 'Base: smallest rival (Arcadia)', value: Math.min(...D.map.counts.filter((_, b) => b !== LA)), shown: 270 },
    { what: 'Lantern taste mean', value: M[LA][TASTE], shown: 5.92 },
    { what: 'Lantern low-price mean', value: M[LA][PRICE], shown: 3.41 },
    { what: 'Lantern convenience mean', value: M[LA][CONV], shown: 3.15 },
    { what: 'Summit taste mean', value: M[SU][TASTE], shown: 5.29 },
    { what: 'Summit low-price mean', value: M[SU][PRICE], shown: 3.31 },
    { what: 'Summit convenience mean', value: M[SU][CONV], shown: 5.41 },
    { what: 'Harbour Basics taste', value: M[HB][TASTE], shown: 3.04 },
    { what: 'Harbour Basics low price', value: M[HB][PRICE], shown: 6.29 },
    { what: 'Daily Grind taste', value: M[DG][TASTE], shown: 3.52 },
    { what: 'Daily Grind low price', value: M[DG][PRICE], shown: 5.83 },
    { what: 'Corner Cup taste', value: M[CC][TASTE], shown: 4.66 },
    { what: 'Corner Cup low price', value: M[CC][PRICE], shown: 4.28 },
    { what: 'Arcadia taste', value: M[AR][TASTE], shown: 4.71 },
    { what: 'Arcadia low price', value: M[AR][PRICE], shown: 3.73 },
    { what: 'Lantern local mean', value: M[LA][LOCAL], shown: 6.30 },
    { what: 'Best rival local mean (Arcadia)', value: Math.max(...M.filter((_, b) => b !== LA).map((r) => r[LOCAL])), shown: 3.11 },
    { what: 'Correlation taste–low price across brands', value: rTP, shown: -0.96 },
    { what: 'Two-attribute PC1 share', value: (1 + Math.abs(rTP)) / 2 * 100, shown: 98, tol: 0.5 },
    { what: 'Lantern–Summit distance on taste × low price', value: Math.sqrt((5.918 - 5.291) ** 2 + (3.410 - 3.308) ** 2), shown: 0.64, tol: 0.006 },
    { what: 'SD of local across brands', value: MAP.sd[LOCAL], shown: 1.65 },
    { what: 'SD of energy across brands', value: MAP.sd[ENERGY], shown: 0.78 },
    { what: 'Dimension 1 share %', value: MAP.values[0] / 8 * 100, shown: 68, tol: 0.5 },
    { what: 'Dimension 1 share % (1 dp)', value: MAP.values[0] / 8 * 100, shown: 68.4, tol: 0.05 },
    { what: 'Dimension 2 share %', value: MAP.values[1] / 8 * 100, shown: 21, tol: 0.5 },
    { what: 'Dimension 2 share % (1 dp)', value: MAP.values[1] / 8 * 100, shown: 21.5, tol: 0.05 },
    { what: 'Two dimensions together %', value: (MAP.values[0] + MAP.values[1]) / 8 * 100, shown: 90, tol: 0.5 },
    { what: 'Eigenvalue 1', value: MAP.values[0], shown: 5.47 },
    { what: 'Eigenvalue 2', value: MAP.values[1], shown: 1.72 },
    { what: 'Eigenvalue 3', value: MAP.values[2], shown: 0.59 },
    { what: 'Eigenvalue 4', value: MAP.values[3], shown: 0.18 },
    { what: 'Eigenvalue 5', value: MAP.values[4], shown: 0.04 },
    { what: 'Loading price D1', value: MAP.loadings[PRICE][0], shown: -0.86 },
    { what: 'Loading convenience D1', value: MAP.loadings[CONV][0], shown: -0.93 },
    { what: 'Loading sustainability D1', value: MAP.loadings[SUST][0], shown: 0.96 },
    { what: 'Loading taste D1', value: MAP.loadings[TASTE][0], shown: 0.87 },
    { what: 'Loading health D1', value: MAP.loadings[HEALTH][0], shown: 0.82 },
    { what: 'Loading local D1', value: MAP.loadings[LOCAL][0], shown: 0.80 },
    { what: 'Loading novelty D1', value: MAP.loadings[NOVELTY][0], shown: 0.79 },
    { what: 'Loading health D2', value: MAP.loadings[HEALTH][1], shown: -0.46 },
    { what: 'Loading price D2', value: MAP.loadings[PRICE][1], shown: -0.41 },
    { what: 'Loading energy D2', value: MAP.loadings[ENERGY][1], shown: 0.82 },
    { what: 'Loading novelty D2', value: MAP.loadings[NOVELTY][1], shown: 0.58 },
    { what: 'Loading taste D2', value: MAP.loadings[TASTE][1], shown: 0.48 },
    { what: 'Communality local %', value: (MAP.loadings[LOCAL][0] ** 2 + MAP.loadings[LOCAL][1] ** 2) * 100, shown: 64, tol: 0.5 },
    { what: 'Correlation convenience–sustainability', value: rCS, shown: -0.95 },
    { what: 'Correlation energy–novelty', value: rEN, shown: 0.04 },
    { what: 'Ideal Value routine', value: IDEAL[VR][0], shown: -1.24 },
    { what: 'Ideal On the go D2', value: IDEAL[OG][1], shown: 1.09 },
    { what: 'Ideal Explorers D1', value: IDEAL[EX][0], shown: 1.12 },
    { what: 'Ideal Craft and local D1', value: IDEAL[CL][0], shown: 2.48 },
    { what: 'Ideal Mindful D2', value: IDEAL[MI][1], shown: -2.00 },
    { what: 'All-respondent ideal D1', value: D.map.ideal.all[0], shown: 0.42 },
    { what: 'All-respondent ideal D2', value: D.map.ideal.all[1], shown: -0.22 },
    { what: 'All-respondent ideal to Explorers ideal', value: distance(D.map.ideal.all, IDEAL[EX]), shown: 1.14 },
    { what: 'Explorers nearest of segment ideals to the overall ideal', value: [VR, OG, CL, MI].every((x) => distance(D.map.ideal.all, IDEAL[x]) > distance(D.map.ideal.all, IDEAL[EX])) ? 1 : 0, shown: 1 },
    { what: 'Craft and local to Lantern', value: distance(SC[LA], IDEAL[CL]), shown: 0.79 },
    { what: 'Craft and local to Arcadia', value: distance(SC[AR], IDEAL[CL]), shown: 1.52 },
    { what: 'On the go to Lantern', value: distance(SC[LA], IDEAL[OG]), shown: 4.48 },
    { what: 'On the go to Corner Cup', value: distance(SC[CC], IDEAL[OG]), shown: 0.57 },
    { what: 'On the go to Summit', value: distance(SC[SU], IDEAL[OG]), shown: 1.50 },
    { what: 'On the go to Daily Grind', value: distance(SC[DG], IDEAL[OG]), shown: 1.59 },
    { what: 'Value routine to Lantern', value: distance(SC[LA], IDEAL[VR]), shown: 4.67 },
    { what: 'Value routine to Harbour Basics', value: distance(SC[HB], IDEAL[VR]), shown: 1.15 },
    { what: 'Explorers to Summit', value: distance(SC[SU], IDEAL[EX]), shown: 1.03 },
    { what: 'Explorers to Lantern', value: distance(SC[LA], IDEAL[EX]), shown: 2.12 },
    { what: 'Mindful to Arcadia', value: distance(SC[AR], IDEAL[MI]), shown: 0.48 },
    { what: 'Mindful to Lantern', value: distance(SC[LA], IDEAL[MI]), shown: 2.54 },
    { what: 'Lantern score D1', value: SC[LA][0], shown: 3.20 },
    { what: 'Lantern score D2', value: SC[LA][1], shown: 0.29 },
    { what: 'Lantern–Arcadia distance', value: distance(SC[LA], SC[AR]), shown: 2.10 },
    { what: 'Lantern–Summit distance', value: distance(SC[LA], SC[SU]), shown: 3.09 },
    { what: 'Aware of Lantern', value: RESPONDENTS.filter((r) => r.aware).length, shown: 89 },
    { what: 'Awareness %', value: D.aware * 100, shown: 14, tol: 0.5 },
    { what: 'Not aware %', value: (1 - D.aware) * 100, shown: 86, tol: 0.5 },
    { what: 'Lantern convenience SD', value: lConvSd, shown: 0.96 },
    { what: 'Lantern convenience SE', value: lConvSd / Math.sqrt(61), shown: 0.12 },
    { what: 'CI low', value: M[LA][CONV] - tInv(0.975, 60) * lConvSe, shown: 2.90 },
    { what: 'CI high', value: M[LA][CONV] + tInv(0.975, 60) * lConvSe, shown: 3.39 },
    { what: 'Summit convenience SE', value: sConvSe, shown: 0.05 },
    { what: 'Taste gap Lantern−Summit', value: tasteT.mean1 - tasteT.mean2, shown: 0.63 },
    { what: 'Taste Welch t', value: tasteT.t, shown: 5.46 },
    { what: 'Sustainability gap Arcadia−Lantern', value: sustT.mean2 - sustT.mean1, shown: 0.36 },
    { what: 'Sustainability Welch t', value: sustT.t, shown: -3.07 },
    { what: 'Sustainability p', value: sustT.p, shown: 0.003, tol: 0.0005 },
    { what: 'Lantern raters in Craft and local', value: ratersIn(CL), shown: 18 },
    { what: 'Share of raters Craft and local %', value: ratersIn(CL) / 61 * 100, shown: 30, tol: 0.5 },
    { what: 'Craft and local share of sample %', value: SIZE[CL].n / 640 * 100, shown: 17, tol: 0.5 },
    { what: 'Lantern raters in Value routine', value: ratersIn(VR), shown: 6 },
    { what: 'Share of raters Value routine %', value: ratersIn(VR) / 61 * 100, shown: 10, tol: 0.5 },
    { what: 'Value routine share of sample %', value: SIZE[VR].n / 640 * 100, shown: 24, tol: 0.5 },
    { what: 'Fewest raters in a segment', value: Math.min(...SEG.map((_, s) => ratersIn(s))), shown: 6 },
    { what: 'Most raters in a segment', value: Math.max(...SEG.map((_, s) => ratersIn(s))), shown: 18 },
    { what: 'Segment size Craft and local', value: SIZE[CL].n, shown: 109 },
    { what: 'Spend per head Craft and local', value: SIZE[CL].perHead, shown: 76.61 },
    { what: 'Cold Brew top-two Craft and local %', value: D.segments.coldbrewTop2[CL] * 100, shown: 46, tol: 0.5 },
    { what: 'Cold Brew top-two On the go %', value: D.segments.coldbrewTop2[OG] * 100, shown: 38, tol: 0.5 },
    // the full loadings table, communalities, means table and ideal-point table
    { what: 'Loading table taste D1', value: MAP.loadings[A('taste')][0], shown: 0.87 },
    { what: 'Loading table taste D2', value: MAP.loadings[A('taste')][1], shown: 0.48 },
    { what: 'Share on map taste %', value: comm(A('taste')) * 100, shown: 99, tol: 0.5 },
    { what: 'Loading table price D1', value: MAP.loadings[A('price')][0], shown: -0.86 },
    { what: 'Loading table price D2', value: MAP.loadings[A('price')][1], shown: -0.41 },
    { what: 'Share on map price %', value: comm(A('price')) * 100, shown: 90, tol: 0.5 },
    { what: 'Loading table convenience D1', value: MAP.loadings[A('convenience')][0], shown: -0.93 },
    { what: 'Loading table convenience D2', value: MAP.loadings[A('convenience')][1], shown: 0.22 },
    { what: 'Share on map convenience %', value: comm(A('convenience')) * 100, shown: 92, tol: 0.5 },
    { what: 'Loading table sustainability D1', value: MAP.loadings[A('sustainability')][0], shown: 0.96 },
    { what: 'Loading table sustainability D2', value: MAP.loadings[A('sustainability')][1], shown: -0.24 },
    { what: 'Share on map sustainability %', value: comm(A('sustainability')) * 100, shown: 97, tol: 0.5 },
    { what: 'Loading table energy D1', value: MAP.loadings[A('energy')][0], shown: -0.49 },
    { what: 'Loading table energy D2', value: MAP.loadings[A('energy')][1], shown: 0.82 },
    { what: 'Share on map energy %', value: comm(A('energy')) * 100, shown: 91, tol: 0.5 },
    { what: 'Loading table health D1', value: MAP.loadings[A('health')][0], shown: 0.82 },
    { what: 'Loading table health D2', value: MAP.loadings[A('health')][1], shown: -0.46 },
    { what: 'Share on map health %', value: comm(A('health')) * 100, shown: 89, tol: 0.5 },
    { what: 'Loading table local D1', value: MAP.loadings[A('local')][0], shown: 0.80 },
    { what: 'Loading table local D2', value: MAP.loadings[A('local')][1], shown: -0.01 },
    { what: 'Share on map local %', value: comm(A('local')) * 100, shown: 64, tol: 0.5 },
    { what: 'Loading table novelty D1', value: MAP.loadings[A('novelty')][0], shown: 0.79 },
    { what: 'Loading table novelty D2', value: MAP.loadings[A('novelty')][1], shown: 0.58 },
    { what: 'Share on map novelty %', value: comm(A('novelty')) * 100, shown: 96, tol: 0.5 },
    { what: 'Base DG', value: D.map.counts[DG], shown: 406 },
    { what: 'Base AR', value: D.map.counts[AR], shown: 270 },
    { what: 'Base HB', value: D.map.counts[HB], shown: 438 },
    { what: 'Ideal table VR D1', value: IDEAL[VR][0], shown: -1.24 },
    { what: 'Ideal table VR D2', value: IDEAL[VR][1], shown: -1.17 },
    { what: 'Ideal table OG D1', value: IDEAL[OG][0], shown: -1.21 },
    { what: 'Ideal table OG D2', value: IDEAL[OG][1], shown: 1.09 },
    { what: 'Ideal table EX D1', value: IDEAL[EX][0], shown: 1.12 },
    { what: 'Ideal table EX D2', value: IDEAL[EX][1], shown: 0.68 },
    { what: 'Ideal table CL D1', value: IDEAL[CL][0], shown: 2.48 },
    { what: 'Ideal table CL D2', value: IDEAL[CL][1], shown: -0.03 },
    { what: 'Ideal table MI D1', value: IDEAL[MI][0], shown: 2.09 },
    { what: 'Ideal table MI D2', value: IDEAL[MI][1], shown: -2.00 },
    { what: 'Means table LA taste', value: M[LA][TASTE], shown: 5.92 },
    { what: 'Means table LA low price', value: M[LA][PRICE], shown: 3.41 },
    { what: 'Means table LA convenience', value: M[LA][CONV], shown: 3.15 },
    { what: 'Means table SU taste', value: M[SU][TASTE], shown: 5.29 },
    { what: 'Means table SU low price', value: M[SU][PRICE], shown: 3.31 },
    { what: 'Means table SU convenience', value: M[SU][CONV], shown: 5.41 },
    { what: 'Means table DG taste', value: M[DG][TASTE], shown: 3.52 },
    { what: 'Means table DG low price', value: M[DG][PRICE], shown: 5.83 },
    { what: 'Means table DG convenience', value: M[DG][CONV], shown: 6.08 },
    { what: 'Means table AR taste', value: M[AR][TASTE], shown: 4.71 },
    { what: 'Means table AR low price', value: M[AR][PRICE], shown: 3.73 },
    { what: 'Means table AR convenience', value: M[AR][CONV], shown: 3.91 },
    { what: 'Means table HB taste', value: M[HB][TASTE], shown: 3.04 },
    { what: 'Means table HB low price', value: M[HB][PRICE], shown: 6.29 },
    { what: 'Means table HB convenience', value: M[HB][CONV], shown: 5.98 },
    { what: 'Means table CC taste', value: M[CC][TASTE], shown: 4.66 },
    { what: 'Means table CC low price', value: M[CC][PRICE], shown: 4.28 },
    { what: 'Means table CC convenience', value: M[CC][CONV], shown: 6.15 },
    // bookshops
    { what: 'Students to chain', value: Math.hypot(5.8 - 5.0, 4.0 - 6.2), shown: 2.34 },
    { what: 'Students to independent', value: Math.hypot(4.4 - 5.0, 2.6 - 6.2), shown: 3.65 },
    { what: 'Students to supermarket', value: Math.hypot(2.2 - 5.0, 6.0 - 6.2), shown: 2.81 },
    { what: 'Students to online', value: Math.hypot(6.6 - 5.0, 5.8 - 6.2), shown: 1.65 },
    { what: 'Students to charity shop', value: Math.hypot(3.0 - 5.0, 6.6 - 6.2), shown: 2.04 },
    { what: 'Gifts to chain', value: Math.hypot(5.8 - 4.8, 4.0 - 3.0), shown: 1.41 },
    { what: 'Gifts to independent', value: Math.hypot(4.4 - 4.8, 2.6 - 3.0), shown: 0.57 },
    { what: 'Gifts to supermarket', value: Math.hypot(2.2 - 4.8, 6.0 - 3.0), shown: 3.97 },
    { what: 'Gifts to online', value: Math.hypot(6.6 - 4.8, 5.8 - 3.0), shown: 3.33 },
    { what: 'Gifts to charity shop', value: Math.hypot(3.0 - 4.8, 6.6 - 3.0), shown: 4.02 },
    // Tarnley Fitness
    { what: 'Gym eigenvalue 1', value: GMAP.values[0], shown: 3.90 },
    { what: 'Gym eigenvalue 2', value: GMAP.values[1], shown: 1.72 },
    { what: 'Gym eigenvalue 3', value: GMAP.values[2], shown: 0.29 },
    { what: 'Gym eigenvalue 4', value: GMAP.values[3], shown: 0.09 },
    { what: 'Gym dimension 1 share %', value: GMAP.values[0] / 6 * 100, shown: 64.9, tol: 0.05 },
    { what: 'Gym dimension 2 share %', value: GMAP.values[1] / 6 * 100, shown: 28.6, tol: 0.05 },
    { what: 'Gym two dimensions %', value: (GMAP.values[0] + GMAP.values[1]) / 6 * 100, shown: 93.6, tol: 0.05 },
    { what: 'Gym loading friendly D1', value: GMAP.loadings[4][0], shown: -0.90 },
    { what: 'Gym loading friendly D2', value: GMAP.loadings[4][1], shown: -0.13 },
    { what: 'Gym loading not crowded D1', value: GMAP.loadings[5][0], shown: -0.90 },
    { what: 'Gym loading classes D1', value: GMAP.loadings[2][0], shown: -0.76 },
    { what: 'Gym loading price D1', value: GMAP.loadings[0][0], shown: 0.93 },
    { what: 'Gym loading hours D1', value: GMAP.loadings[3][0], shown: 0.80 },
    { what: 'Gym loading classes D2', value: GMAP.loadings[2][1], shown: -0.62 },
    { what: 'Gym loading equipment D2', value: GMAP.loadings[1][1], shown: 0.88 },
    { what: 'Gym communality friendly', value: GMAP.loadings[4][0] ** 2 + GMAP.loadings[4][1] ** 2, shown: 0.83 },
    { what: 'Gym friendly off the map %', value: (1 - GMAP.loadings[4][0] ** 2 - GMAP.loadings[4][1] ** 2) * 100, shown: 17, tol: 0.5 },
    { what: 'Gym communality min of others', value: Math.min(...[0, 1, 2, 3, 5].map((j) => GMAP.loadings[j][0] ** 2 + GMAP.loadings[j][1] ** 2)), shown: 0.94 },
    { what: 'Gym communality max of others', value: Math.max(...[0, 1, 2, 3, 5].map((j) => GMAP.loadings[j][0] ** 2 + GMAP.loadings[j][1] ** 2)), shown: 0.97 },
    { what: 'Tarnley score D1', value: GMAP.scores[0][0], shown: -0.28 },
    { what: 'Tarnley score D2', value: GMAP.scores[0][1], shown: 0.62 },
    { what: 'Budget chain D1', value: GMAP.scores[1][0], shown: 2.95 },
    { what: 'Boutique D2', value: GMAP.scores[2][1], shown: -0.89 },
    { what: 'Leisure centre D2', value: GMAP.scores[3][1], shown: -1.69 },
    { what: 'Hotel club D2', value: GMAP.scores[4][1], shown: 1.66 },
    { what: 'Busy professionals ideal D1', value: gBusy[0], shown: 0.54 },
    { what: 'Busy professionals ideal D2', value: gBusy[1], shown: 1.43 },
    { what: 'Class lovers ideal D1', value: gClass[0], shown: -0.72 },
    { what: 'Class lovers ideal D2', value: gClass[1], shown: -1.47 },
    { what: 'Class lovers to Tarnley', value: distance(GMAP.scores[0], gClass), shown: 2.14 },
    { what: 'Class lovers to budget', value: distance(GMAP.scores[1], gClass), shown: 4.08 },
    { what: 'Class lovers to boutique', value: distance(GMAP.scores[2], gClass), shown: 1.69 },
    { what: 'Class lovers to leisure centre', value: distance(GMAP.scores[3], gClass), shown: 1.39 },
    { what: 'Class lovers to hotel', value: distance(GMAP.scores[4], gClass), shown: 3.14 },
    { what: 'Busy to Tarnley', value: distance(GMAP.scores[0], gBusy), shown: 1.15 },
    { what: 'Busy to budget', value: distance(GMAP.scores[1], gBusy), shown: 2.66 },
    { what: 'Busy to boutique', value: distance(GMAP.scores[2], gBusy), shown: 3.68 },
    { what: 'Busy to leisure', value: distance(GMAP.scores[3], gBusy), shown: 3.12 },
    { what: 'Busy to hotel', value: distance(GMAP.scores[4], gBusy), shown: 1.58 },
  ],
};
