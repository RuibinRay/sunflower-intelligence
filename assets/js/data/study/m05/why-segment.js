// why-segment.js — M05 · Why segment? Content only; exercises are in why-segment.ex.js.
// Lantern's May 2027 needs study comes from case.js (RESPONDENTS, NEEDS, STUDY, BRAND_NOTES): this lesson uses only the
// spread of the eight needs, never the k-means segments, which module 2 builds. Glenarrow Cycles, Duncairn Software and
// Tollmere Bank (with Nadia Osei) are fictional. Every printed figure is recomputed in `checks`.
import { RESPONDENTS, NEEDS, STUDY, BRAND_NOTES, M02_LANTERN, DERIVED as D } from './case.js?v=20';

// ---------------------------------------------------------------- the figures this lesson quotes
const R = RESPONDENTS, N = R.length;
const sum = (a) => a.reduce((s, x) => s + x, 0);
const mean = (a) => sum(a) / a.length;
const col = (j) => R.map((r) => r.needs[j]);
const corr = (a, b) => { const ma = mean(a), mb = mean(b); let sab = 0, sa = 0, sb = 0; a.forEach((x, i) => { sab += (x - ma) * (b[i] - mb); sa += (x - ma) ** 2; sb += (b[i] - mb) ** 2; }); return sab / Math.sqrt(sa * sb); };
const J = Object.fromEntries(NEEDS.map((n, j) => [n.key, j]));
const MU = D.needs.means, SD = D.needs.sds;
const top2 = NEEDS.map((_, j) => col(j).filter((v) => v >= 6).length);
const low3 = NEEDS.map((_, j) => col(j).filter((v) => v <= 3).length);
const nearAvg = R.filter((r) => r.needs.every((v, j) => Math.abs(v - MU[j]) <= 1)).length;
const hiPrice = R.filter((r) => r.needs[J.price] >= 6), hiLocal = R.filter((r) => r.needs[J.local] >= 6);
const both = R.filter((r) => r.needs[J.price] >= 6 && r.needs[J.local] >= 6).length;
const hiPriceLowLocal = hiPrice.filter((r) => r.needs[J.local] <= 3).length;
const hiLocalLowPrice = hiLocal.filter((r) => r.needs[J.price] <= 3).length;
const rPL = corr(col(J.price), col(J.local)), rTL = corr(col(J.taste), col(J.local));
const rCE = corr(col(J.convenience), col(J.energy)), rSH = corr(col(J.sustainability), col(J.health));
const grid = Array.from({ length: 7 }, (_, p) => Array.from({ length: 7 }, (__, l) => R.filter((r) => r.needs[J.price] === p + 1 && r.needs[J.local] === l + 1).length));
const gridMax = Math.max(...grid.flat());
const expBoth = (hiPrice.length * hiLocal.length) / N;          // both 6 or 7 if price and local were unrelated
const middle = R.filter((r) => [J.price, J.local].every((j) => r.needs[j] >= 3 && r.needs[j] <= 5)).length;
// nobody is within a point of the average on all eight: how many would be if the needs were unrelated?
const pNear = NEEDS.map((_, j) => col(j).filter((v) => Math.abs(v - MU[j]) <= 1).length / N);
const expNear = N * pNear.reduce((a, b) => a * b, 1);           // expected count under independence
const pNone = (1 - expNear / N) ** N;                            // chance that nobody qualifies (binomial)

// Glenarrow Cycles (fictional): one servicing plan or two
const GC = { N: [2400, 1600], one: [0.10, 0.06], two: [0.15, 0.14], m: 40, F: 9000 };
const gcOne = sum(GC.N.map((n, s) => n * GC.one[s] * GC.m));
const gcTwo = sum(GC.N.map((n, s) => n * GC.two[s] * GC.m));
const gcGain = gcTwo - gcOne - GC.F;
// Duncairn Software (fictional): twelve firmographic cells
const DS = {
  industries: ['Construction', 'Retail', 'Hospitality', 'Professional services'], sizes: ['1–4 staff', '5–19 staff', '20–99 staff'],
  firms: [[6200, 2100, 600], [5400, 1900, 500], [3100, 1400, 300], [7800, 2600, 700]], F: 6000, m: 300, lift: 0.005,
};
const dsMin = DS.F / (DS.lift * DS.m);
const dsCells = DS.firms.flat();
const dsPass = dsCells.filter((n) => n >= dsMin).length;
const dsGain = (n) => n * DS.lift * DS.m - DS.F;
const dsBigger = sum(DS.firms.map((row) => row[1] + row[2]));
const dsAllTwelve = sum(dsCells.map(dsGain));
const dsFour = dsGain(DS.firms[0][0]) + dsGain(DS.firms[1][0]) + dsGain(DS.firms[3][0]) + dsGain(dsBigger);
// Tollmere Bank (fictional): small-business current accounts
const TB = { customers: 18000, variants: 7, kept: 3, perVariant: 40000 };

// ---------------------------------------------------------------- formatting
const p1 = (v) => `${(+(v * 100).toPrecision(12)).toFixed(1)}%`;   // toPrecision first, so 28.75 rounds to 28.8
const f2 = (v) => v.toFixed(2);
const r2 = (v) => `${v < 0 ? '−' : ''}${Math.abs(v).toFixed(2)}`;
const int = (v) => Math.round(v).toLocaleString('en-US');
const pc = (v) => `${+(v * 100).toFixed(2)}%`;
const usd = (v) => `${v < 0 ? '−' : ''}$${Math.abs(Math.round(v)).toLocaleString('en-US')}`;

// ---------------------------------------------------------------- figures
const STP = (() => {
  const box = (x, y, colr, n, l1, l2) => `<rect x="${x}" y="${y}" width="174" height="62" rx="8" style="fill:none;stroke:var(--series-${colr});stroke-width:2"/>`
    + `<text x="${x + 9}" y="${y + 26}" font-weight="700" fill="currentColor">${n}</text>`
    + `<text x="${x + 24}" y="${y + 26}" fill="currentColor">${l1}</text>`
    + `<text x="${x + 24}" y="${y + 44}" fill="currentColor">${l2}</text>`;
  const arrow = (x1, y1, x2, y2) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" style="stroke:var(--ink-3);stroke-width:1.5" marker-end="url(#stp-a)"/>`;
  const title = (x, y, t, sub, anchor = 'start') => `<text x="${x}" y="${y}" text-anchor="${anchor}" fill="currentColor"><tspan font-weight="700" font-size="13.5">${t}</tspan><tspan font-size="11.5" fill="var(--ink-3)"> · ${sub}</tspan></text>`;
  return '<svg viewBox="0 0 380 382" xmlns="http://www.w3.org/2000/svg" font-family="inherit" font-size="12">'
    + '<defs><marker id="stp-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="var(--ink-3)"/></marker></defs>'
    + title(4, 18, 'Segmentation', 'modules 1 and 2')
    + box(4, 28, 1, '1', 'Choose the bases and', 'form the segments') + box(202, 28, 1, '2', 'Profile and size', 'each segment')
    + arrow(180, 59, 199, 59)
    + title(4, 136, 'Targeting', 'module 3')
    + box(202, 146, 2, '3', 'Judge each segment’s', 'attractiveness and fit') + box(4, 146, 2, '4', 'Choose the target', 'segment or segments')
    + arrow(289, 92, 289, 143) + arrow(200, 177, 181, 177)
    + title(376, 254, 'Positioning', 'module 4', 'end')
    + box(4, 264, 3, '5', 'Choose the position', 'to hold in each target') + box(202, 264, 3, '6', 'Build the marketing', 'mix that delivers it')
    + arrow(91, 210, 91, 261) + arrow(180, 295, 199, 295)
    + '<text x="190" y="350" text-anchor="middle" font-size="11.5" fill="var(--ink-3)">Markets change: track the results and revisit</text>'
    + '<text x="190" y="368" text-anchor="middle" font-size="11.5" fill="var(--ink-3)">the segments, the targets and the position.</text>'
    + '</svg>';
})();

function bubbleFigure() {
  const L = 46, T = 40, C = 42, H = 7 * C;
  let s = `<svg viewBox="0 0 360 ${T + H + 62}" xmlns="http://www.w3.org/2000/svg" font-family="inherit" font-size="11" fill="currentColor">`;
  s += `<text x="${L + 3.5 * C}" y="13" text-anchor="middle" fill="var(--ink-3)">Circle area = number of respondents;</text>`;
  s += `<text x="${L + 3.5 * C}" y="27" text-anchor="middle" fill="var(--ink-3)">counts of 10 or more are printed</text>`;
  for (let k = 0; k < 7; k++) {
    s += `<text x="${L + k * C + C / 2}" y="${T + H + 15}" text-anchor="middle">${k + 1}</text>`;
    s += `<text x="${L - 7}" y="${T + (6 - k) * C + C / 2 + 4}" text-anchor="end">${k + 1}</text>`;
  }
  s += `<rect x="${L}" y="${T}" width="${7 * C}" height="${H}" style="fill:none;stroke:var(--rule-strong);stroke-width:1"/>`;
  grid.forEach((row, p) => row.forEach((n, l) => {
    if (!n) return;
    const r = Math.sqrt(n / gridMax) * (C / 2 - 2);
    s += `<circle cx="${L + l * C + C / 2}" cy="${T + (6 - p) * C + C / 2}" r="${r.toFixed(1)}" style="fill:var(--series-1);fill-opacity:0.4;stroke:var(--ink);stroke-width:0.6"/>`;
    if (n >= 10) s += `<text x="${L + l * C + C / 2}" y="${T + (6 - p) * C + C / 2 + 4}" text-anchor="middle">${n}</text>`;
  }));
  s += `<rect x="${L + 5 * C + 2}" y="${T + 2}" width="${2 * C - 4}" height="${2 * C - 4}" style="fill:none;stroke:var(--series-3);stroke-width:1.5;stroke-dasharray:4 3"/>`;
  s += `<text x="${L + 6 * C}" y="${T + 16}" text-anchor="middle" font-size="10.5">both very</text>`;
  s += `<text x="${L + 6 * C}" y="${T + 29}" text-anchor="middle" font-size="10.5">important: ${both}</text>`;
  s += `<text x="${L + 3.5 * C}" y="${T + H + 34}" text-anchor="middle" font-size="12">“From a local, independent business”</text>`;
  s += `<text x="${L + 3.5 * C}" y="${T + H + 50}" text-anchor="middle">1 = not at all important … 7 = essential</text>`;
  s += `<text transform="translate(13 ${T + H / 2}) rotate(-90)" text-anchor="middle" font-size="12">“A low price”</text>`;
  return `${s}</svg>`;
}

export default {
  slug: 'why-segment',
  title: 'Why segment?',
  blurb: 'A market is rarely one crowd wanting one thing. Learn what a market segment is, how segmentation, targeting and positioning fit together, when segmenting pays and when it costs more than it earns, and how to judge whether a set of segments is usable. Then read Lantern’s needs study to decide whether Harbour City has one coffee market or several.',
  status: 'draft',
  objectives: [
    'Define a market segment and market segmentation, and explain how segmentation, targeting and positioning (STP) form one process.',
    'Explain why customers’ differing needs and responses make segmented marketing pay, and when mass marketing is the better choice.',
    'Calculate the gain from tailoring offers to segments after the extra fixed costs, and the smallest segment a tailored offer can pay for.',
    'Assess whether segments are usable with five tests: measurable, substantial, accessible, differentiable and actionable.',
    'Distinguish a priori from post hoc segmentation, and consumer from business segmentation (firmographics).',
    'Evaluate survey evidence on the spread of customers’ needs to decide whether a market is worth segmenting.',
  ],
  prerequisites: [
    { lesson: 'm01/customer-value', why: 'Segments are groups of customers who weigh benefits and costs alike; that lesson defined customer value and the value proposition.' },
    { lesson: 'm01/competitive-advantage', why: 'Positioning and Porter’s focus strategy, both built on segments, were introduced there.' },
    { lesson: 'm01/business-buying', why: 'Segmenting business markets starts from how organisations buy and who is in the buying centre.' },
    { lesson: 'm04/questionnaire-design', why: 'The needs study is a set of rating questions; reading it needs Likert items and the caveats of rating scales.' },
    { lesson: 'm04/sampling-methods', why: 'The study comes from an opt-in panel with quotas, not a probability sample.' },
  ],
  case: 'lantern',

  concept: [
    { case: `In May 2027 Lantern sells coffee through its catering, its cafés and its online shop, and it plans to launch Lantern Cold Brew ($${/\$(\d+\.\d+)/.exec(BRAND_NOTES.Lantern)[1]} a can) later in the year. Only ${Math.round(D.aware * 100)}% of the coffee drinkers Ana surveyed had heard of Lantern (M02’s launch plan assumed ${Math.round(M02_LANTERN.awareness * 100)}%), so every dollar of marketing has to work hard. To decide where to spend it, Ana paid a panel company $${int(STUDY.cost)} for the ${STUDY.name}: ${STUDY.n} ${STUDY.who}, each rating how much eight things matter when they choose coffee, from 1 (not at all important) to 7 (essential). Her first question is the one this lesson answers: does Harbour City have one coffee market, or several?` },
    { p: 'Every business sells to a <g>market</g>, the set of actual and potential buyers of an offering. The temptation is to picture that market as one crowd and to design one offer for its average member. The trouble is that buyers differ: in what they want, in what they will pay, in where they shop and in which messages reach them. An offer designed for the average can end up fitting nobody well.' },
    { p: 'A <g>market segment</g> is a group of buyers within a market who have similar needs or would respond in a similar way to a marketing offer, and who differ in those respects from other groups. <g>Market segmentation</g> is the work of dividing a market into such segments, using variables called <g>segmentation bases</g>: age or region, the benefits people seek, how much they buy, their attitudes. This module surveys the bases; module 2 builds segments from data.' },

    { h: 'Segmentation, targeting and positioning' },
    { p: 'Segmentation is the first stage of a process usually abbreviated <g>STP</g>: segmentation, targeting and positioning. Segmentation finds and describes the segments. Targeting judges how attractive each one is and how well the business can serve it, and chooses the <g>target market</g>: the segment or segments to serve. Positioning decides the place the offer should hold in those customers’ minds relative to rivals, which M01 introduced as <g>positioning</g>, and the marketing mix then delivers it.' },
    { figure: {
      svg: STP,
      caption: 'Segmentation, targeting and positioning as one process. Steps 1 and 2 are modules 1 and 2 of this course; targeting is module 3 and positioning module 4.',
      alt: 'Six numbered boxes in three rows joined by arrows that zigzag down the page. Row one, Segmentation (modules 1 and 2): 1, choose the bases and form the segments; 2, profile and size each segment. Row two, Targeting (module 3): 3, judge each segment’s attractiveness and fit; 4, choose the target segment or segments. Row three, Positioning (module 4): 5, choose the position to hold in each target; 6, build the marketing mix that delivers it. A note below says that markets change, so the results should be tracked and the segments, the targets and the position revisited.',
    } },
    { p: 'The order matters. A position is always a position for someone: “café-quality cold brew” means something to a buyer who cares about taste and nothing to one who wants the cheapest caffeine. And a target can only be chosen from segments that have been described and sized. That is why M01’s <g>marketing strategy</g>, which customers to serve and how to compete for them, starts with segmentation.' },

    { h: 'Why segment at all?' },
    { p: 'Segmentation pays when two conditions hold: customers differ in what they want or in how they respond, and the business can offer different groups something different at a cost they will cover. Then a tailored offer wins more buyers, or wins them at a better price, than one offer for everyone. It also concentrates the budget on the people most likely to respond instead of spreading it across people who never will.' },
    { p: 'The alternative is <g>mass marketing</g>: one offer and one marketing mix for the whole market. It is not a mistake by definition. It is the right choice when buyers really do want much the same thing, when one offer is far cheaper to make and sell than several, or when the market is too small to divide. The question is never “segment or not?” in the abstract, but whether the extra sales from fitting offers to groups exceed the extra cost of running several.' },
    { p: 'The idea has a long history in marketing thought. Wendell Smith, writing in the <i>Journal of Marketing</i> in 1956, described market segmentation as “viewing a heterogeneous market … as a number of smaller homogeneous markets in response to differing product preferences …”. The words carry the logic of this whole course: a market is worth dividing when buyers differ, and each part should be more alike inside than the whole.' },

    { h: 'One coffee market or several?' },
    { p: 'Ana’s study gives her the evidence to start answering. The table shows, for each of the eight needs, the average rating, the standard deviation, and the share of respondents who rated it 6 or 7 (very important) or 1 to 3 (not very important).' },
    { table: {
      caption: `How much each need matters when choosing coffee: ${N} Harbour City coffee drinkers, May 2027 (1 not at all important … 7 essential). <g>Opt-in panel</g> with age quotas; unweighted.`,
      head: ['Need', 'Mean', 'SD', 'Rated 6 or 7', 'Rated 1 to 3'],
      align: ['l', 'r', 'r', 'r', 'r'],
      rows: NEEDS.map((n, j) => [n.label, f2(MU[j]), f2(SD[j]), p1(top2[j] / N), p1(low3[j] / N)]),
      note: 'The same respondent appears in every row.',
    } },
    { p: `Read the means alone and the market looks bland: every need averages between ${f2(Math.min(...MU))} and ${f2(Math.max(...MU))}, the middle of the scale. A product built on that profile would be moderately tasty, moderately cheap and moderately local.` },
    { p: `But the spread tells a different story. Every need has a standard deviation of ${f2(Math.min(...SD))} to ${f2(Math.max(...SD))} points, and for every need some respondents call it essential and others say it hardly matters. No respondent is within one point of the average on all eight needs, though with eight needs that is less telling than it seems: even if the needs were unrelated, only about ${Math.round(expNear)} of ${N} would be. The stronger evidence is in how the needs combine.` },
    { p: `The needs also come in bundles. Of the ${hiPrice.length} respondents who rated a low price 6 or 7, ${hiPriceLowLocal} rated buying from a local, independent business 3 or lower; of the ${hiLocal.length} who rated local 6 or 7, ${hiLocalLowPrice} rated price 3 or lower. Just ${both} respondent rated both 6 or higher, against about ${Math.round(expBoth)} if the two needs were unrelated (${hiPrice.length} × ${hiLocal.length} ÷ ${N}). The figure shows the pattern: the ratings run along the diagonal from price-led to local-led, with a broad middle (${middle} respondents rate both needs 3 to 5) and an almost empty corner where both are very important.` },
    { figure: {
      svg: bubbleFigure(),
      caption: `Ratings of “a low price” against “from a local, independent business”, ${N} respondents. The ratings run from price-led (top left) to local-led (bottom right) through a broad middle; the dashed corner, where both are rated 6 or 7, holds ${both} respondent.`,
      alt: `A seven-by-seven grid of circles. The horizontal axis is the importance of buying from a local, independent business, 1 to 7; the vertical axis is the importance of a low price, 1 to 7, with 7 at the top. Each circle’s area is the number of respondents with that pair of ratings. The largest circle is in the middle, ${grid[3][3]} respondents rating both 4, and the circles form a band running from the upper left (price 6 or 7 with local 2 or 3, for example ${grid[6][1]} rating price 7 and local 2) to the lower right (local 6 or 7 with price 2 or 3, for example ${grid[1][5]} rating price 2 and local 6). The upper right corner, where both are rated 6 or 7, is outlined with a dashed line and holds ${both} respondent.`,
    } },
    { p: `Correlations across all ${N} respondents say the same in numbers. Price and local correlate at ${r2(rPL)}: the more someone cares about price, the less they tend to care about local. Other needs move together: taste with local (${r2(rTL)}), convenience with a strong caffeine kick (${r2(rCE)}), sustainability with low sugar and calories (${r2(rSH)}). Bundles like these are what segments are made of. They suggest that Harbour City holds several kinds of coffee drinker, which is worth knowing before Lantern spends a dollar on Cold Brew.` },
    { callout: 'key', title: 'Evidence for segmenting, not yet segments', html: 'A wide spread and strong bundles say a market is worth dividing. They don’t yet say how many segments there are, who is in each, or whether any is worth serving. Module 2 forms the segments from these ratings with cluster analysis, and module 3 decides which to target.' },
  ],

  theory: [
    { h: 'What a segment is, and what it is not' },
    { p: 'A segment is defined by similarity in needs or in response to marketing, not by a label. “Women aged 30 to 44” is a demographic group; it is a segment only if its members want something in common that other groups don’t, or would react to an offer in common. Equally, a segment is not the same as a <g>target market</g>. Segmentation describes the options; targeting chooses among them, and many segments are described only to be left out.' },
    { p: 'Segments are also a model that the analyst builds, not groups waiting in the market to be found. The same market can be divided in many valid ways (by region, by benefits sought, by how much people buy), and each serves a different decision. A café chain choosing where to open needs a geographic view; one choosing a menu needs a view of tastes. The test of a segmentation is whether it helps a decision, not whether it is “true”.' },
    { p: 'Two kinds of variable play different roles. The <b>bases</b> are the variables the segments are formed on: in Ana’s study, the eight needs. The <g>descriptor variables</g>, or descriptors, are the variables used afterwards to describe the segments and to find and reach their members: age, region, where people buy coffee. The best bases are often hard to observe, such as needs and attitudes, while the best descriptors are easy, such as age and postcode. Much of segmentation is the craft of linking the two.' },

    { h: 'Is a segment usable? Five tests' },
    { p: 'OpenStax’s <i>Principles of Marketing</i> gives five tests of an effective segment, remembered as ADAMS; Kotler and Keller list the same five (France and Ghose, 2019). A segment that fails one may still be interesting, but it can’t yet be marketed to.' },
    { table: {
      caption: 'The five tests of a usable segment, with the question to ask of any segment Lantern considers',
      head: ['Test', 'What it asks', 'Asked of a Lantern segment'],
      rows: [
        ['<b>Measurable</b>', 'Can the segment’s size and buying power be estimated with reasonable accuracy?', 'Can Ana say how many Harbour City adults belong to it, and what they spend on coffee?'],
        ['<b>Substantial</b>', 'Is it large or profitable enough to be worth an offer of its own?', 'Would its members’ spending cover the cost of a tailored offer or campaign?'],
        ['<b>Accessible</b>', 'Can its members be reached at an affordable cost?', 'Is there a channel, medium or place where they gather that Lantern can use?'],
        ['<b>Differentiable</b>', 'Are its members alike inside, and different from other segments, so they respond differently?', 'Would a craft message move this group more than the others?'],
        ['<b>Actionable</b>', 'Can the business design and run an effective programme for it, with the resources it has?', 'Can Lantern make, price and sell what this group wants?'],
      ],
    } },
    { p: 'The tests pull against each other. Making segments more alike inside (differentiable) usually means making them smaller (less substantial). Bases that are close to why people buy, such as needs, tend to fail “accessible”, because few media can be bought by need. The usual compromise is to form segments on needs and then make them accessible by describing them with variables that can be reached, as module 2’s profiling lesson shows. A sixth, informal test is worth adding: the segments should be stable enough to last the life of the plan.' },

    { h: 'A priori and post hoc segmentation' },
    { p: 'There are two broad ways to form segments. In <g>a priori segmentation</g> the basis and the groups are chosen before the data are analysed: by age band, by region, by heavy against light buyers. The data then size and describe groups that someone defined in advance. In <g>post hoc segmentation</g>, also called data-driven segmentation, the groups are formed from the data, usually by clustering respondents on many variables at once, such as the importance of eight needs. Its number and kind of segments emerge from the analysis and the analyst’s judgement.' },
    { p: 'The distinction goes back to the segmentation research of the 1970s. France and Ghose’s review traces it to Green and colleagues in 1977, and Wind’s 1978 review of segmentation research listed “traditional a-priori and clustering-based designs” as the established approaches, against newer flexible and componential ones. Each kind has its strengths, and they are often combined: a priori groups for planning and media, post hoc segments for understanding why people buy.' },
    { table: {
      caption: 'A priori and post hoc segmentation compared',
      head: ['', 'A priori', 'Post hoc (data-driven)'],
      rows: [
        ['Groups defined by', 'The analyst, before looking at the data', 'The analysis, from patterns in the data'],
        ['Typical bases', 'Demographics, region, usage rate, customer type', 'Needs, benefits sought, attitudes'],
        ['Strengths', 'Cheap, easy to explain, usually easy to reach', 'Groups people by what drives their choices'],
        ['Weaknesses', 'Members of a group may want different things', 'Needs a survey and a model; segments must then be profiled to be reached'],
        ['Lantern example', 'Its five regions: North, South, East, West, Central', 'Clusters of the eight needs (module 2)'],
      ],
    } },

    { h: 'Consumer markets and business markets' },
    { p: 'The same logic applies to a <g>business market</g>, with different bases. Instead of demographics, business marketers start with <g>firmographics</g>: OpenStax lists industry, location, size, legal structure and performance. They add technographics (the technology a firm uses), its needs, its value to the seller (how much, how often and at what value it buys) and its behaviour, such as how it engages with the seller online. In a business market the buyer is usually a <g>buying centre</g>, several people with different roles, so a segment may be defined by the organisation and also by who decides.' },
    { p: 'Shapiro and Bonoma (1984) proposed a nested approach for industrial markets: five sets of criteria arranged like rings, from the outer ring, general characteristics such as industry, size and location that are easy to observe, through operating variables, purchasing approaches and situational factors, to the personal characteristics of the buyers at the centre, which are the hardest to assess. A marketer starts from the outside and works in only as far as the extra insight repays the extra effort. The B2B paragraphs of the next two lessons fill in the rings.' },

    { h: 'What segmenting costs, and over-segmentation' },
    { p: `Segmenting is not free. The research comes first: Lantern’s study cost $${int(STUDY.cost)}. Then every extra offer brings costs that one offer doesn’t: product variants, packs and stock, separate campaigns and creative work, staff trained to sell several things, and management attention. A new offer for one segment can also take sales from the business’s existing offers, a risk module 3 calls cannibalisation. The gain from segmenting is what remains after those costs, and the formula card puts it in one line.` },
    { p: `The gain is worth calculating before any decision. Glenarrow Cycles, in the simple example below, wins ${usd(gcTwo - gcOne)} more contribution a year by offering commuters and sport riders separate servicing plans, but the second plan costs ${usd(GC.F)} to run, which leaves a gain of only ${usd(gcGain)}. Turned round, the same arithmetic gives the smallest segment a tailored offer can pay for: the extra fixed cost divided by the extra contribution each member brings.` },
    { p: '<g>Over-segmentation</g> is dividing a market into more segments than the business can use. The symptoms are segments too small to cover the cost of an offer (they fail substantial), too similar to respond differently (they fail differentiable), or so fine that they change from one survey to the next. Twelve tidy cells in a grid of industry by firm size look rigorous, but the challenging example shows how few of them can pay for a campaign of their own. The cure is to merge cells whose members want the same thing, and to keep separate only those that are large enough and different enough.' },
    { p: 'At the other extreme, some businesses tailor to individuals: recommendations in an online shop, or a salesperson’s proposal to one client. That works when tailoring costs little per customer, as it often does online, and module 3 treats it as micromarketing. Between one offer for everyone and one for each person lies the practical range where most segmentation sits: a handful of segments, each worth its own offer.' },
  ],

  formulas: [
    { id: 'ws-gain', name: 'Contribution from a set of offers, and the gain from segmenting',
      tex: String.raw`C = \sum_{s} N_s\, b_s\, m_s, \qquad \Delta = C_{\text{tailored}} - C_{\text{one offer}} - F`,
      where: [
        [String.raw`N_s`, 'Potential buyers in segment s', 'people'],
        [String.raw`b_s`, 'Share of segment s who buy the offer made to them (the purchase rate)', ''],
        [String.raw`m_s`, 'Contribution per buyer in segment s: price less variable cost', '$ per buyer'],
        [String.raw`C`, 'Contribution from the market under one strategy', '$'],
        [String.raw`F`, 'Extra fixed cost of running the tailored offers rather than one (variants, campaigns, training)', '$'],
        [String.raw`\Delta`, 'Gain from segmenting: positive means tailored offers pay', '$'],
      ],
      assumptions: 'The purchase rates are estimates, from research or a test, for the same period as the costs; the tailored offers don’t change the total number of potential buyers.',
      note: 'With the same margin m in every segment, the smallest segment a tailored offer can pay for is F ÷ ((b_tailored − b_one offer) × m), from setting Δ = 0 for that segment alone.' },
  ],

  examples: [
    { level: 'simple', title: 'One servicing plan or two at a bike shop', fictional: true,
      setup: `Glenarrow Cycles has ${int(GC.N[0])} commuters and ${int(GC.N[1])} weekend sport riders in its town who might buy an annual servicing plan. With one general plan, the owner expects ${pc(GC.one[0])} of commuters and ${pc(GC.one[1])} of sport riders to buy. With two tailored plans (a quick-turnaround commuter plan and a race-preparation plan), she expects ${pc(GC.two[0])} and ${pc(GC.two[1])}. Every plan sold contributes $${GC.m}. Running a second plan would cost an extra ${usd(GC.F)} a year in leaflets, parts stock and training. Should she segment?`,
      steps: [
        `One plan: commuters ${int(GC.N[0])} × ${GC.one[0].toFixed(2)} = ${int(GC.N[0] * GC.one[0])} buyers; sport riders ${int(GC.N[1])} × ${GC.one[1].toFixed(2)} = ${int(GC.N[1] * GC.one[1])}. Contribution C = (${int(GC.N[0] * GC.one[0])} + ${int(GC.N[1] * GC.one[1])}) × $${GC.m} = ${usd(gcOne)}.`,
        `Two plans: ${int(GC.N[0])} × ${GC.two[0].toFixed(2)} = ${int(GC.N[0] * GC.two[0])} and ${int(GC.N[1])} × ${GC.two[1].toFixed(2)} = ${int(GC.N[1] * GC.two[1])} buyers, so C = ${int(GC.N[0] * GC.two[0] + GC.N[1] * GC.two[1])} × $${GC.m} = ${usd(gcTwo)}.`,
        `Gain from segmenting: Δ = ${usd(gcTwo)} − ${usd(gcOne)} − ${usd(GC.F)} = ${usd(gcGain)}.`,
        `Break-even: the tailored plans add ${usd(gcTwo - gcOne)} of contribution, so they pay as long as the extra fixed cost stays below that figure.`,
      ],
      answer: `Two plans earn ${usd(gcGain)} a year more than one, after the extra ${usd(GC.F)}: a small gain, which disappears if running the second plan costs more than ${usd(gcTwo - gcOne)}.`,
      interpretation: 'The sport riders respond far more to a plan made for them (14% against 6%), which is the sign of a real segment. But the margin of safety is thin, and the purchase rates are the owner’s estimates. A cheap test, such as offering the race plan for one season, would be worth more than the arithmetic.' },
    { level: 'challenging', title: 'Twelve firmographic cells, or four segments?', fictional: true,
      setup: `Duncairn Software sells accounts software to small firms in its region. Its marketing team has divided the market by industry and number of staff, giving the twelve cells in the table, and wants a tailored campaign for each. A tailored campaign costs ${usd(DS.F)} a year and is expected to win ${+(DS.lift * 100).toFixed(2)} percentage points more of the firms it reaches than the generic campaign; each extra customer is worth $${DS.m} of contribution a year. Which cells can pay for a campaign of their own, and what should the team do instead?`,
      table: {
        caption: 'Duncairn Software: firms in the region by industry and size (fictional)',
        head: ['Industry', ...DS.sizes],
        align: ['l', 'r', 'r', 'r'],
        rows: DS.industries.map((ind, i) => [ind, ...DS.firms[i].map(int)]),
        foot: [['Total', ...DS.sizes.map((_, k) => int(sum(DS.firms.map((row) => row[k]))))]],
      },
      steps: [
        `The smallest cell a campaign can pay for: each firm reached adds ${DS.lift} × $${DS.m} = $${(DS.lift * DS.m).toFixed(2)} of expected contribution, so a campaign costing ${usd(DS.F)} needs ${usd(DS.F)} ÷ $${(DS.lift * DS.m).toFixed(2)} = ${int(dsMin)} firms.`,
        `Only ${dsPass} of the twelve cells reach ${int(dsMin)}: construction, retail and professional-services firms with 1–4 staff (${int(DS.firms[0][0])}, ${int(DS.firms[1][0])} and ${int(DS.firms[3][0])}). The other nine fail the substantial test on their own. Twelve campaigns would lose ${usd(-dsAllTwelve)} in all, because the small cells lose more than the large ones gain.`,
        `Merge where needs are alike. Firms with 5 to 99 staff share needs that the smallest firms don’t (payroll, several users, approval of spending), whatever their industry. Together they number ${int(dsBigger)}, enough for one campaign. Four campaigns (the three large cells plus the larger firms) would earn ${usd(dsFour)}.`,
        `Check the other tests before acting. The ${int(DS.firms[2][0])} small hospitality firms are too few for a campaign of their own, so they get the generic one. And the ${+(DS.lift * 100).toFixed(2)}-point lift is an assumption: if larger firms respond less to tailoring, the merged segment may not pay either.`,
      ],
      answer: `Only ${dsPass} cells can pay for their own campaign. Four campaigns, three for the large small-firm cells and one for all firms with 5–99 staff, earn ${usd(dsFour)} a year more than the generic campaign alone; twelve campaigns would lose ${usd(-dsAllTwelve)}.`,
      interpretation: 'The grid was over-segmented: it divided the market by variables that are easy to observe rather than by differences in what firms need. A firmographic grid is a good start in a business market, but the cells are worth keeping apart only where their members want different things and are numerous enough to pay for the difference.' },
    { level: 'applied', title: 'Is Harbour City one coffee market?', fictional: true,
      setup: `Ana must tell her team whether to plan Lantern’s marketing for “the Harbour City coffee drinker” or for several kinds. Use the needs study (${N} respondents) to decide, and say what the evidence does and doesn’t show.`,
      steps: [
        `Look past the means. All eight needs average between ${f2(Math.min(...MU))} and ${f2(Math.max(...MU))}, with standard deviations of ${f2(Math.min(...SD))} to ${f2(Math.max(...SD))} points on a 1–7 scale. None of the ${N} respondents is within one point of the average on every need, but that alone proves little: about ${Math.round(expNear)} would be even if the needs were unrelated.`,
        `Look for opposites. ${hiPrice.length} respondents rate a low price 6 or 7 and ${hiLocal.length} rate local 6 or 7, but only ${both} rates both that high, against about ${Math.round(expBoth)} if the two needs were unrelated: the people who care most about each are different people who would respond to different offers.`,
        `Look for bundles. Taste goes with local (r = ${r2(rTL)}), convenience with energy (${r2(rCE)}) and sustainability with health (${r2(rSH)}), while price runs against local (${r2(rPL)}). Several distinct combinations of needs suggest several segments.`,
        'Weigh the evidence. The study is an opt-in panel with age quotas, a <g>quota sample</g> rather than a probability sample, so its percentages may not hold for all Harbour City coffee drinkers; but the existence of opposite groups is unlikely to be an artefact of who joined the panel.',
      ],
      answer: 'Harbour City has several coffee markets, not one: needs vary widely and come in distinct, sometimes opposite, bundles. Lantern should plan for segments, formed on these needs in module 2.',
      interpretation: 'This settles the first question of STP, whether to segment, but none of the later ones. It doesn’t say how many segments there are or which Lantern should serve; it does warn that a Cold Brew pitched at the average drinker, half price-led and half craft, would speak to neither of the groups in the corners of the figure.' },
  ],

  demo: [
    { widget: 'ws-pairs', intro: 'All 640 respondents’ eight need ratings, with a grid that counts how many gave each pair of ratings to two needs. Choose the two needs with the drop-downs. Start with price against local, then try convenience against energy (needs that rise together) and taste against novelty. A colour scale shades the busiest cells. Watch the correlation and the count of people who rate both needs 6 or 7.' },
    { widget: 'ws-offers', intro: 'One offer for the whole market or tailored offers for two groups? Set each group’s size, how many would buy each kind of offer, the contribution per buyer and the extra fixed cost of a second offer. Start from the Glenarrow Cycles example, then find the extra cost at which segmenting stops paying, and see what happens when the two groups respond alike.' },
  ],

  mistakes: [
    { title: '“A demographic group is a segment.”', html: 'Only if its members want something in common that other groups don’t, or respond alike to marketing. Age, region and income are often useful descriptors of segments, but people of the same age can want very different coffee. Test a group by its needs and responses, not by its label.' },
    { title: '“The average customer tells us what to offer.”', html: `An average of different groups can fit nobody well. In Ana’s study the needs come in bundles that pull apart: ${hiPrice.length} respondents rate a low price 6 or 7 and ${hiLocal.length} rate local 6 or 7, but only ${both} rates both that high. Look at the spread and at which needs go together before designing for the middle.` },
    { title: '“More segments are always better.”', html: 'Every segment that gets its own offer adds fixed costs. Segments too small to cover them, or too similar to respond differently, are over-segmentation. Calculate the gain after the extra fixed costs, and merge segments that want the same thing.' },
    { title: '“Segmentation finds the true segments in the market.”', html: 'Segments are a model built for a decision. The same market can be divided many valid ways, and the useful one depends on the decision being made. Judge a segmentation by whether it helps that decision and passes the five tests, not by whether it is “real”.' },
    { title: '“Segmenting means a different product for each segment.”', html: 'Segments can be served with different messages, channels, prices or pack sizes as well as different products. Often the cheapest response to a segment is a different message for the same product.' },
  ],

  application: [
    { case: 'Tollmere Bank, a fictional regional bank, offers one current account to all its 18,000 small-business customers. Nadia Osei, its head of marketing, has watched it lose newer customers to online banks, and the board has asked whether the bank should offer several accounts instead.' },
    { p: '<b>She starts from the decision, not the data.</b> The board’s question is which accounts to offer and to whom. That rules out segmenting by, say, customers’ favourite sports, however interesting, and points to bases that would change what an account should include: how the business pays and gets paid, how often it needs help, and how it likes to bank.' },
    { p: '<b>She tries the a priori split first.</b> The bank’s records give a firmographic split for nothing: sole traders, firms with 1–9 staff and firms with 10–49. It is measurable and accessible, because the bank knows every customer’s size. But a survey of a sample of customers shows that needs vary as much within each size band as between them: some sole traders want a cheap app-only account, others want a named adviser.' },
    { p: `<b>She builds segments on needs, then makes them reachable.</b> Clustering the survey answers (module 2’s method) gives seven groups. Each account variant would cost about $40,000 a year to run, so Nadia uses the gain formula with the purchase rates from a pilot, merges the groups whose members want the same features, and keeps ${TB.kept} accounts out of the ${TB.variants} possible. She then describes each of the three segments by size band, sector and how they bank today, so that the bank can assign existing customers and reach new ones.` },
    { p: '<b>She checks the five tests before the board meets.</b> Each segment is large enough to pay for its account (substantial), recognisable from data the bank holds (measurable and accessible), different in what it values (differentiable), and something the bank can deliver with its systems (actionable). Her paper ends with the condition that makes the plan honest: the bank will rerun the survey in a year to see whether the segments have held.' },
  ],

  summary: [
    'A market segment is a group of buyers with similar needs or responses who differ from other groups; segmentation divides a market into such groups using segmentation bases.',
    'Segmentation, targeting and positioning (STP) is one process: describe the segments, choose which to serve, then decide the position to hold with them and build the mix.',
    'Segment when customers differ and offers can be tailored at a cost they cover. Mass marketing suits markets where buyers want much the same thing or one offer is far cheaper.',
    'C = Σ N_s × b_s × m_s for each strategy; the gain from segmenting is C_tailored − C_one offer − F. The smallest segment a tailored offer can pay for is F ÷ (extra purchase rate × margin).',
    'Usable segments are measurable, substantial, accessible, differentiable and actionable (ADAMS). Bases close to why people buy are often the hardest to reach.',
    'A priori segments are defined before the analysis; post hoc segments are formed from data, usually by clustering needs. Business markets start with firmographics and work inward.',
    'Over-segmentation creates segments too small, too similar or too unstable to act on; merge segments that want the same thing.',
    'Lantern’s study shows wide spreads and bundles of needs that pull apart (price against local: 1 respondent rates both 6 or 7, against about 25 expected by chance), so Harbour City is several coffee markets, not one.',
  ],

  glossary: [
    { term: 'Market segment', def: 'A group of buyers within a market who have similar needs or would respond similarly to a marketing offer, and who differ in those respects from other groups.' },
    { term: 'Market segmentation', def: 'Dividing a market into segments of buyers with similar needs or responses, using one or more segmentation bases.' },
    { term: 'Segmentation base', def: 'A variable on which segments are formed, such as region, age, the benefits sought, usage rate or attitude. Variables used only to describe or reach segments once formed are descriptor variables.' },
    { term: 'Descriptor variable', def: 'A variable used to describe and reach a segment once it has been found, such as age, region, income or where people buy, as opposed to the segmentation base used to form it.' },
    { term: 'STP', def: 'Segmentation, targeting and positioning: the process of dividing a market into segments, choosing the segment or segments to serve, and deciding the position to hold with each and the marketing mix that delivers it.' },
    { term: 'Mass marketing', def: 'Offering one marketing mix to the whole market, as if all buyers wanted the same thing; also called undifferentiated marketing.' },
    { term: 'A priori segmentation', def: 'Segmentation in which the basis and the groups are chosen before the data are analysed, such as age bands, regions or heavy against light users.' },
    { term: 'Post hoc segmentation', def: 'Segmentation in which the groups are formed from the data, usually by clustering people on many variables such as their needs; also called data-driven segmentation.' },
    { term: 'Firmographics', def: 'Characteristics of organisations used to segment business markets, such as industry, location, size, legal structure and performance: the business-market counterpart of demographics.' },
    { term: 'Over-segmentation', def: 'Dividing a market into more segments than a business can use: segments too small to pay for an offer of their own, too similar to respond differently, or too unstable to plan for.' },
  ],

  references: [
    { text: 'Gomez Albrecht, M., Green, M. &amp; Hoffman, L. (2023). <i>Principles of Marketing</i>, section 5.1, “Market Segmentation and Consumer Markets”. OpenStax.', url: 'https://openstax.org/books/principles-marketing/pages/5-1-market-segmentation-and-consumer-markets', checked: '2026-10-25' },
    { text: 'Gomez Albrecht, M., Green, M. &amp; Hoffman, L. (2023). <i>Principles of Marketing</i>, section 5.4, “Essential Factors in Effective Market Segmentation” (ADAMS: accessible, differentiable, actionable, measurable, substantial). OpenStax.', url: 'https://openstax.org/books/principles-marketing/pages/5-4-essential-factors-in-effective-market-segmentation', checked: '2026-10-25' },
    { text: 'Gomez Albrecht, M., Green, M. &amp; Hoffman, L. (2023). <i>Principles of Marketing</i>, section 5.2, “Segmentation of B2B Markets” (firmographics, technographics, needs-, value- and behaviour-based segmentation). OpenStax.', url: 'https://openstax.org/books/principles-marketing/pages/5-2-segmentation-of-b2b-markets', checked: '2026-10-25' },
    { text: 'Smith, W. R. (1956). Product differentiation and market segmentation as alternative marketing strategies. <i>Journal of Marketing</i>, 21(1), 3–8. JSTOR 1247695. (Quoted here from France and Ghose, 2019.)', url: 'https://www.jstor.org/stable/1247695', checked: null },
    { text: 'France, S. L. &amp; Ghose, S. (2019). Marketing analytics: methods, practice, implementation, and links to other fields. <i>Expert Systems with Applications</i>; preprint arXiv:1801.09185. Section 4 quotes Smith (1956) and reviews a priori and post hoc segmentation and the criteria for segments.', url: 'https://arxiv.org/abs/1801.09185', checked: '2026-10-25' },
    { text: 'Wind, Y. (2011). Yoram “Jerry” Wind’s contributions to marketing. <i>Review of Marketing Research</i>, Special Issue: Marketing Legends, 8, 269–315 (Table 5 reproduces Wind’s 1978 review of segmentation research).', url: 'https://faculty.wharton.upenn.edu/wp-content/uploads/2012/02/Rev.Mktg.Res.Special.Legends.Issue.pdf', checked: '2026-10-25' },
    { text: 'Shapiro, B. P. &amp; Bonoma, T. V. (1984). How to segment industrial markets. <i>Harvard Business Review</i>, May 1984 (the nested approach: demographics, operating variables, purchasing approaches, situational factors and personal characteristics; summary checked in the publisher’s synopsis on Bookshare).', url: 'https://hbr.org/1984/05/how-to-segment-industrial-markets', checked: null },
  ],

  checks: [
    // the study
    { what: 'Respondents', value: N, shown: 640 },
    { what: 'Study cost', value: STUDY.cost, shown: 9600 },
    { what: 'Awareness in study %', value: Math.round(D.aware * 100), shown: 14 },
    { what: 'M02 awareness %', value: Math.round(M02_LANTERN.awareness * 100), shown: 12 },
    { what: 'Cold Brew price in BRAND_NOTES', value: BRAND_NOTES.Lantern.includes('$3.49') ? 1 : 0, shown: 1 },
    { what: 'Needs', value: NEEDS.length, shown: 8 },
    // the table
    { what: 'Taste mean', value: MU[0], shown: 4.66 },
    { what: 'Price mean', value: MU[1], shown: 4.44 },
    { what: 'Convenience mean', value: MU[2], shown: 4.59 },
    { what: 'Sustainability mean', value: MU[3], shown: 3.85 },
    { what: 'Energy mean', value: MU[4], shown: 4.21 },
    { what: 'Health mean', value: MU[5], shown: 3.62 },
    { what: 'Local mean', value: MU[6], shown: 3.74 },
    { what: 'Novelty mean', value: MU[7], shown: 4.00 },
    { what: 'Taste SD', value: SD[0], shown: 1.28 },
    { what: 'Price SD', value: SD[1], shown: 1.42 },
    { what: 'Convenience SD', value: SD[2], shown: 1.32 },
    { what: 'Sustainability SD', value: SD[3], shown: 1.49 },
    { what: 'Energy SD', value: SD[4], shown: 1.48 },
    { what: 'Health SD', value: SD[5], shown: 1.42 },
    { what: 'Local SD', value: SD[6], shown: 1.61 },
    { what: 'Novelty SD', value: SD[7], shown: 1.67 },
    { what: 'Lowest mean', value: Math.min(...MU), shown: 3.62 },
    { what: 'Highest mean', value: Math.max(...MU), shown: 4.66 },
    { what: 'Smallest SD', value: Math.min(...SD), shown: 1.28 },
    { what: 'Largest SD', value: Math.max(...SD), shown: 1.67 },
    { what: 'Taste 6–7 %', value: (top2[0] / N) * 100, shown: 27.2, tol: 0.05 },
    { what: 'Price 6–7 %', value: (top2[1] / N) * 100, shown: 22.8, tol: 0.05 },
    { what: 'Convenience 6–7 %', value: (top2[2] / N) * 100, shown: 25.8, tol: 0.05 },
    { what: 'Sustainability 6–7 %', value: (top2[3] / N) * 100, shown: 16.6, tol: 0.05 },
    { what: 'Energy 6–7 %', value: (top2[4] / N) * 100, shown: 20.9, tol: 0.05 },
    { what: 'Health 6–7 %', value: (top2[5] / N) * 100, shown: 12.3, tol: 0.05 },
    { what: 'Local 6–7 %', value: (top2[6] / N) * 100, shown: 17.2, tol: 0.05 },
    { what: 'Novelty 6–7 %', value: (top2[7] / N) * 100, shown: 22.2, tol: 0.05 },
    { what: 'Taste 1–3 %', value: (low3[0] / N) * 100, shown: 18.8, tol: 0.05 },
    { what: 'Price 1–3 %', value: (low3[1] / N) * 100, shown: 27.3, tol: 0.05 },
    { what: 'Convenience 1–3 %', value: (low3[2] / N) * 100, shown: 21.9, tol: 0.05 },
    { what: 'Sustainability 1–3 %', value: (low3[3] / N) * 100, shown: 45.8, tol: 0.05 },
    { what: 'Energy 1–3 %', value: (low3[4] / N) * 100, shown: 33.9, tol: 0.05 },
    { what: 'Health 1–3 %', value: (low3[5] / N) * 100, shown: 54.1, tol: 0.05 },
    { what: 'Local 1–3 %', value: (low3[6] / N) * 100, shown: 50.6, tol: 0.05 },
    { what: 'Novelty 1–3 %', value: (low3[7] / N) * 100, shown: 44.1, tol: 0.05 },
    // reading the spread
    { what: 'Within one point of the mean on all eight', value: nearAvg, shown: 0 },
    { what: 'Price rated 6–7', value: hiPrice.length, shown: 146 },
    { what: 'Local rated 6–7', value: hiLocal.length, shown: 110 },
    { what: 'Both 6+', value: both, shown: 1 },
    { what: 'High price, local ≤ 3', value: hiPriceLowLocal, shown: 133 },
    { what: 'High local, price ≤ 3', value: hiLocalLowPrice, shown: 69 },
    { what: 'r price–local', value: rPL, shown: -0.49 },
    { what: 'r taste–local', value: rTL, shown: 0.65 },
    { what: 'r convenience–energy', value: rCE, shown: 0.68 },
    { what: 'r sustainability–health', value: rSH, shown: 0.67 },
    { what: 'Price 7, local 2', value: grid[6][1], shown: 31 },
    { what: 'Price 7, local 3', value: grid[6][2], shown: 34 },
    { what: 'Price 2, local 6', value: grid[1][5], shown: 15 },
    { what: 'Price 4, local 4 (largest cell)', value: grid[3][3], shown: 56 },
    { what: 'Largest cell is 4/4', value: gridMax === grid[3][3] ? 1 : 0, shown: 1 },
    { what: 'Both 6+ expected if unrelated', value: expBoth, shown: 25, tol: 0.5 },
    { what: '146 × 110 ÷ 640', value: (146 * 110) / 640, shown: 25.1, tol: 0.05 },
    { what: 'Both 3–5', value: middle, shown: 286 },
    { what: 'Within a point on all eight, expected if unrelated', value: expNear, shown: 2, tol: 0.5 },
    { what: 'Chance that nobody would be (about 14%)', value: pNone, shown: 0.14, tol: 0.01 },
    // Glenarrow Cycles
    { what: 'GC commuters one plan', value: GC.N[0] * GC.one[0], shown: 240 },
    { what: 'GC sport one plan', value: GC.N[1] * GC.one[1], shown: 96 },
    { what: 'GC contribution one plan', value: gcOne, shown: 13440 },
    { what: 'GC commuters two plans', value: GC.N[0] * GC.two[0], shown: 360 },
    { what: 'GC sport two plans', value: GC.N[1] * GC.two[1], shown: 224 },
    { what: 'GC buyers two plans', value: GC.N[0] * GC.two[0] + GC.N[1] * GC.two[1], shown: 584 },
    { what: 'GC contribution two plans', value: gcTwo, shown: 23360 },
    { what: 'GC extra contribution', value: gcTwo - gcOne, shown: 9920 },
    { what: 'GC gain', value: gcGain, shown: 920 },
    // Duncairn Software
    { what: 'DS contribution per firm reached', value: DS.lift * DS.m, shown: 1.5 },
    { what: 'DS minimum cell', value: dsMin, shown: 4000 },
    { what: 'DS cells passing', value: dsPass, shown: 3 },
    { what: 'DS firms 5–99 staff', value: dsBigger, shown: 10100 },
    { what: 'DS twelve campaigns lose', value: -dsAllTwelve, shown: 23100 },
    { what: 'DS four campaigns', value: dsFour, shown: 20250 },
    { what: 'DS total firms', value: sum(dsCells), shown: 32600 },
    { what: 'DS 1–4 total', value: sum(DS.firms.map((r) => r[0])), shown: 22500 },
    { what: 'DS 5–19 total', value: sum(DS.firms.map((r) => r[1])), shown: 8000 },
    { what: 'DS 20–99 total', value: sum(DS.firms.map((r) => r[2])), shown: 2100 },
    // Tollmere Bank
    { what: 'TB customers', value: TB.customers, shown: 18000 },
    { what: 'TB cost per variant', value: TB.perVariant, shown: 40000 },
    { what: 'TB accounts kept', value: TB.kept, shown: 3 },
    { what: 'TB groups', value: TB.variants, shown: 7 },
  ],
};
