// targeting-strategies.js — M05 · Targeting strategies. Content only; exercises are in targeting-strategies.ex.js.
// Lantern's segments, Cold Brew intent, crosstabs and the persona's figures come from case.js (DERIVED and RESPONDENTS
// with DERIVED.segments.labels); Cold Brew's price, cost and channel margins from m02/market.js. The persona's name
// (Quinn) is a label, not data. Quarrystone Fitness and Ferrisby Books are fictional. Every printed figure is
// recomputed in `checks`.
import { DERIVED as D, RESPONDENTS, LEVELS, STUDY, BRANDS } from './case.js?v=15';
import { CHANNELS, TIERS, DEFAULT_PLAN } from '../m02/market.js?v=15';

// ---------------------------------------------------------------- the figures this lesson quotes
const S = D.segments, NAMES = S.names, LAB = S.labels, R = RESPONDENTS, N = R.length;
const G = (name) => NAMES.indexOf(name);
const VR = G('Value routine'), GO = G('On the go'), EX = G('Explorers'), CL = G('Craft and local'), MI = G('Mindful');
const sum = (a) => a.reduce((x, y) => x + y, 0);
const mean = (a) => sum(a) / a.length;
const median = (a) => { const s = [...a].sort((x, y) => x - y), m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
const members = (g) => R.filter((_, i) => LAB[i] === g);
const n = S.sizes.map((s) => s.n);
// Cold Brew top-two-box intenders by segment
const top2 = NAMES.map((_, g) => members(g).filter((r) => r.coldbrew <= 2).length);
const top2All = R.filter((r) => r.coldbrew <= 2).length;
// distances between segment centres (z units, module 2)
const dz = (a, b) => Math.sqrt(sum(a.map((v, j) => (v - b[j]) ** 2)));
const cdist = (a, b) => dz(S.centres[a], S.centres[b]);
// Cold Brew economics from M02: single-origin liquid, $3.49 a can
const price = DEFAULT_PLAN.price, cogs = TIERS.find((t) => t.id === 'single').cogs;
const ch = (id) => CHANNELS.find((c) => c.id === id);
const perCan = (id) => price * (1 - ch(id).margin) - cogs - ch(id).fulfil;
// the persona: Craft and local
const M = members(CL), nCL = M.length;
const share = (f) => M.filter(f).length / nCL;
const age3059 = share((r) => r.age === 1 || r.age === 2), inc80 = share((r) => r.income >= 2), couple = share((r) => r.household === 1), central = share((r) => r.area === 4);
const cafe = share((r) => r.source === 0), home = share((r) => r.source === 1);
const cupsMean = mean(M.map((r) => r.cups)), cupsMed = median(M.map((r) => r.cups));
const spendMean = S.sizes[CL].perHead, spendMed = median(M.map((r) => r.spend));
const awareCL = S.aware[CL], boughtCL = share((r) => r.bought), loyalCL = S.loyalty[CL], loyalAll = D.loyalty.mean, cbCL = S.coldbrewTop2[CL];
const IX = S.index[CL];
const NEED = ['Taste and quality', 'Price', 'Convenience', 'Sustainability', 'Energy', 'Health', 'Local and independent', 'Novelty'];
// how many members match the card's lines
const broad = [(r) => r.age === 1 || r.age === 2, (r) => r.income >= 2, (r) => r.source === 0, (r) => r.area === 4, (r) => r.household === 1];
const modal = [(r) => r.age === 2, (r) => r.income === 2, (r) => r.source === 0, (r) => r.area === 4, (r) => r.household === 1];
const chain = (list, pool = M) => list.reduce((acc, f) => { const next = acc[acc.length - 1].filter(f); return [...acc, next]; }, [pool]).map((x) => x.length);
const broadChain = chain(broad), modalChain = chain(modal);
const others = R.filter((_, i) => LAB[i] !== CL);
const othersBroad = chain(broad, others)[5];
const needsLine = (r) => r.needs[0] >= 6 && r.needs[6] >= 6;
const needsIn = M.filter(needsLine).length, needsOut = others.filter(needsLine).length;
const outShare = (f) => others.filter(f).length / others.length;
const inc80Out = outShare((r) => r.income >= 2), cafeOut = outShare((r) => r.source === 0);
const modalAlt = chain([(r) => r.age === 1, (r) => r.income === 2, (r) => r.source === 0, (r) => r.area === 4, (r) => r.household === 1])[5];
const goSrc = S.crosstabs.source[GO].map((v) => v / n[GO]);
const modalAge = LEVELS.age[2], ageCounts = LEVELS.age.map((_, l) => M.filter((r) => r.age === l).length);
// Quarrystone Fitness (fictional): a budget brand beside premium clubs
const QF = { Q: 3000, mNew: 14, mOld: 40, c: 0.2 };
const qfInc = QF.Q * QF.mNew - QF.c * QF.Q * QF.mOld, qfBE = QF.mNew / QF.mOld;
// Ferrisby Books (fictional): a young-adult subscription box
const FB = { Q: 1200, mNew: 9, mOld: 6, c: 0.3, F: 4000 };
const fbInc = FB.Q * FB.mNew - FB.c * FB.Q * FB.mOld - FB.F;
const fbBE = (FB.Q * FB.mNew - FB.F) / (FB.Q * FB.mOld);
const fbQ = FB.F / (FB.mNew - FB.c * FB.mOld);

// ---------------------------------------------------------------- formatting
const p0 = (v) => `${Math.round(v * 100)}%`, p1 = (v) => `${(v * 100).toFixed(1)}%`;
const f1 = (v) => v.toFixed(1), f2 = (v) => v.toFixed(2);
const int = (v) => Math.round(v).toLocaleString('en-US');
const tx = (v) => Math.round(v).toLocaleString('en-US').replace(/,/g, '{,}');   // a number inside TeX

// ---------------------------------------------------------------- figures
function strategiesFigure() {
  const PW = 212, PH = 206;
  const panel = (x, y, title, sub, serve, kind) => {
    let s = `<rect x="${x}" y="${y}" width="${PW}" height="${PH}" rx="8" style="fill:none;stroke:var(--rule-strong);stroke-width:1.5"/>`;
    s += `<text x="${x + PW / 2}" y="${y + 24}" text-anchor="middle" font-size="15" font-weight="700" fill="currentColor">${title}</text>`;
    s += `<text x="${x + PW / 2}" y="${y + 42}" text-anchor="middle" font-size="12" fill="var(--ink-3)">${sub}</text>`;
    const cx = (k) => x + 26 + k * 40, cy = y + 170;
    if (kind === 'micro') {
      const mx = x + PW / 2, my = y + 152;
      s += `<circle cx="${mx}" cy="${my}" r="32" style="fill:none;stroke:var(--series-2);stroke-width:1.5"/>`;
      const dots = [[-17, -17], [0, -23], [17, -17], [-21, 0], [21, 0], [-13, 15], [5, 18], [19, 13]];
      dots.forEach(([dx, dy], i) => {
        const px = mx + dx, py = my + dy, ox = x + 13 + i * 24, oy = y + 62;
        s += `<line x1="${ox + 6}" y1="${oy + 12}" x2="${px}" y2="${py}" style="stroke:var(--ink-3);stroke-width:1"/>`;
        s += `<rect x="${ox}" y="${oy}" width="12" height="12" rx="2" style="fill:var(--series-1);fill-opacity:0.35;stroke:var(--series-1);stroke-width:1"/>`;
        s += `<circle cx="${px}" cy="${py}" r="3.5" style="fill:currentColor"/>`;
      });
      s += `<text x="${mx}" y="${y + PH - 8}" text-anchor="middle" font-size="12" fill="var(--ink-3)">an offer per place or person</text>`;
      return s;
    }
    for (let k = 0; k < 5; k++) {
      const on = serve.some((m) => m.to.includes(k));
      s += `<circle cx="${cx(k)}" cy="${cy}" r="14" style="fill:${on ? 'var(--series-2)' : 'none'};fill-opacity:0.3;stroke:var(--series-2);stroke-width:1.5${on ? '' : ';stroke-dasharray:4 3'}"/>`;
      s += `<text x="${cx(k)}" y="${cy + 5}" text-anchor="middle" font-size="13" fill="currentColor">${'ABCDE'[k]}</text>`;
    }
    serve.forEach((m) => {
      const bx = x + m.x;
      s += `<rect x="${bx}" y="${y + 62}" width="${m.w}" height="26" rx="5" style="fill:var(--series-1);fill-opacity:0.2;stroke:var(--series-1);stroke-width:1.5"/>`;
      s += `<text x="${bx + m.w / 2}" y="${y + 80}" text-anchor="middle" font-size="13" fill="currentColor">${m.label}</text>`;
      m.to.forEach((k) => { s += `<line x1="${bx + m.w / 2}" y1="${y + 88}" x2="${cx(k)}" y2="${cy - 14}" style="stroke:var(--ink-3);stroke-width:1"/>`; });
    });
    return s;
  };
  let s = '<svg viewBox="0 0 440 428" xmlns="http://www.w3.org/2000/svg" font-family="inherit" font-size="13">';
  s += panel(6, 6, 'Undifferentiated (mass)', 'one mix for the whole market', [{ x: 66, w: 80, label: 'One mix', to: [0, 1, 2, 3, 4] }]);
  s += panel(222, 6, 'Differentiated', 'a separate mix for each segment', [{ x: 8, w: 60, label: 'Mix 1', to: [0] }, { x: 76, w: 60, label: 'Mix 2', to: [1] }, { x: 144, w: 60, label: 'Mix 3', to: [2] }]);
  s += panel(6, 216, 'Concentrated (niche)', 'one mix for one segment', [{ x: 8, w: 76, label: 'One mix', to: [0] }]);
  s += panel(222, 216, 'Micromarketing', 'local and individual marketing', [], 'micro');
  return `${s}</svg>`;
}

export default {
  slug: 'targeting-strategies',
  title: 'Targeting strategies',
  blurb: 'Decide how many segments to serve and how differently: one offer for everyone, a separate offer for each segment, everything on one segment, or offers shaped for places and people. Count what a new offer takes from the old ones, and build a buyer persona from segment data that says what it stands for and what it can’t.',
  status: 'draft',
  objectives: [
    'Distinguish undifferentiated, differentiated and concentrated marketing and micromarketing (local and individual), and classify a business’s targeting strategy.',
    'Choose a targeting strategy from the company’s resources, how variable its product and market are, the product’s life-cycle stage and competitors’ strategies.',
    'Calculate the incremental contribution of an offer for a new segment after cannibalisation, and the cannibalisation rate at which it breaks even.',
    'Build a buyer persona from segment data, stating the base and the share of the segment each line describes.',
    'Explain the limits of personas and of micromarketing, and target responsibly when personal data are involved.',
  ],
  prerequisites: [
    { lesson: 'm05/evaluating-segments', why: 'The scorecard ranked Lantern’s segments; this lesson decides how many of them to serve and how.' },
    { lesson: 'm05/profiling-segments', why: 'A persona is built from the segment profiles: indexes, means and cross-tabs.' },
    { lesson: 'm02/product-life-cycle', why: 'The life-cycle stage of a product is one of the considerations in choosing a strategy.' },
    { lesson: 'b03/conditional-sums-and-counts', why: 'COUNTIFS checks how many members of a segment match a persona’s lines.' },
  ],
  case: 'lantern',

  concept: [
    { case: `The previous lesson’s scorecard put Craft and local first and Explorers second. Cold Brew complicates the choice. Of the ${N} respondents, ${top2All} (${p1(top2All / N)}) would definitely or probably buy it, a <g>top-two-box score</g>: ${top2[CL]} of the ${n[CL]} in Craft and local (${p1(top2[CL] / n[CL])}), but also ${top2[GO]} of the ${n[GO]} in On the go (${p1(top2[GO] / n[GO])}), a segment that fits Lantern badly (fourth of five on fit) and that Corner Cup already serves. On the go holds more of Cold Brew’s likely buyers than any other segment. Should Lantern concentrate on the drinkers who love what it does, or chase the convenience buyers too?` },
    { p: 'A <g>targeting strategy</g> answers two questions at once: how many segments will the company serve, and how differently will it treat them? The answers range from one offer for the whole market to an offer for every customer. OpenStax’s <i>Principles of Marketing</i> describes four broad strategies, and Kotler and Armstrong’s textbook the same four, splitting the last into local and individual marketing.' },
    { figure: {
      svg: strategiesFigure(),
      caption: 'Four targeting strategies. Circles are segments (filled = served); boxes are marketing mixes. Micromarketing works inside a segment, shaping the offer for small places or single customers.',
      alt: 'Four panels. Undifferentiated (mass), one mix for the whole market: one box labelled One mix with lines to all five segment circles, A to E, all filled. Differentiated, a separate mix for each segment: boxes Mix 1, Mix 2 and Mix 3, each with a line to one circle (A, B and C, filled); circles D and E are dashed and unserved. Concentrated (niche), one mix for one segment: one box with a line to circle A; the other four circles are dashed. Micromarketing, local and individual marketing: one large circle containing eight dots, each dot joined by a line to its own small box; the label beneath says an offer per place or person.',
    } },

    { h: 'Undifferentiated (mass) marketing' },
    { p: 'Undifferentiated marketing, the <g>mass marketing</g> of module 1, treats the market as one group and uses, in OpenStax’s words, “a single marketing mix for the entire market”. Its strength is cost: one product, one campaign and long production runs give economies of scale. It makes sense when customers’ differences are weak or don’t affect what they buy. Its weakness is that it leaves every segment open to a rival that serves it better.' },
    { p: `For Lantern Cold Brew a mass approach would mean one can, one message and every channel for everyone. The average intent of ${p1(top2All / N)} hides a range from ${p1(top2[VR] / n[VR])} in Value routine to ${p1(top2[CL] / n[CL])} in Craft and local, and spending to persuade Value routine would be spending on the people least likely to buy.` },

    { h: 'Differentiated marketing' },
    { p: '<g>Differentiated marketing</g> targets two or more segments with a separate offer or mix for each, often under separate brands. It can win more of the market than one offer can, and a company present in several segments is less exposed when one of them declines or a rival attacks it. The price is cost and complexity: every extra mix needs its own product version, channels, messages and management, and sales one offer wins may be taken from another. Serving more segments than the company can afford to treat differently is the targeting form of module 1’s <g>over-segmentation</g>. Don’t confuse it with M01’s <g>differentiation</g>, which is about standing out from rivals in ways customers value: differentiated marketing means several segments with several mixes, and a firm can do either without the other.' },

    { h: 'Concentrated (niche) marketing' },
    { p: '<g>Concentrated marketing</g> serves one segment with one mix and aims, in OpenStax’s description, to “own” it. A <g>niche</g> is a narrower group still, with distinctive needs that larger firms serve poorly: the small firm hopes to be a big fish in a small pond. Concentration suits companies whose resources would be stretched thin across several segments, and it builds deep knowledge of the customers it serves. Its risk, as the BCcampus textbook puts it, is having all the eggs in one basket: if the segment shrinks, or a large rival moves in, there is nothing to fall back on. It is how a firm carries out M01’s <g>focus</g> strategy, serving one narrow segment better than broad competitors.' },

    { h: 'Micromarketing: places and people' },
    { p: '<g>Micromarketing</g> shapes offers for small local areas or for individual customers. <g>Local marketing</g> adapts the offer to a city, a neighbourhood or a single store; <g>individual marketing</g> adapts it to one customer, usually from data about what that customer has bought or said. OpenStax describes micromarketing as going beyond the niche to target specific individuals within it from the information collected about them. Lantern already has the raw material for both: its own cafés, each with its own neighbourhood, and an online shop that records what each customer buys.' },
    { callout: 'key', title: 'Strategy follows evaluation', html: 'The scorecard ranks the segments; the targeting strategy decides how many of them the company can serve well, and whether one offer can serve them together. A company can afford only as many distinct offers as its resources, and its position in customers’ minds, can carry.' },
  ],

  theory: [
    { h: 'Choosing a strategy' },
    { p: 'Kotler and Armstrong’s textbooks list five considerations for choosing among the strategies: the company’s resources, how variable the product is, the product’s life-cycle stage, how variable the market is, and competitors’ strategies (the labels as listed in M. L. Ripley’s course notes on their <i>Marketing: An Introduction</i>). The notes give only the labels, so the middle column below is the usual reading of each, not a quotation. For the life-cycle stage it follows M02’s life-cycle lesson, where a new product starts with one basic version, and OpenStax’s chapter on the life cycle, where firms in maturity extend a product to new customers and alter it to fit them. None of the five decides alone.' },
    { table: {
      caption: 'Five considerations, the usual reading of each, and Lantern Cold Brew',
      head: ['Consideration', 'The usual reading', 'Lantern Cold Brew'],
      rows: [
        ['Company resources', 'Limited resources favour concentration', 'A small firm planning one new product, with a launch budget, not a national brand’s'],
        ['Product variability', 'Uniform products (salt, fuel) suit mass marketing; products that can vary suit segmenting', 'Coffee varies in taste, strength, format and provenance'],
        ['Life-cycle stage', 'A new product often launches in one basic version, to everyone or to one segment; separate versions for separate segments become common in maturity', `Cold Brew is planned for later in 2027 and will start in its <g>introduction stage</g>; awareness of Lantern is ${p1(D.aware)}`],
        ['Market variability', 'Buyers who want the same things suit mass marketing; buyers who differ suit segmenting', 'Five segments whose Cold Brew intent ranges from about 10% to 46%'],
        ['Competitors’ strategies', 'Segmenting rivals make mass marketing risky; rivals who ignore a segment leave room in it', 'Summit Brew, Daily Grind RTD and Arcadia Coffee already sit at different points of the market'],
      ],
    } },
    { p: 'For Lantern, resources point to concentration; the life-cycle stage allows either one mix for everyone or one target; and product variability, market variability and competitors’ strategies point away from mass marketing. Together they favour one focused offer at launch. That still leaves the question of which segments the offer is for, and whether a second offer should follow.' },

    { h: 'Serving more than one segment' },
    { p: `Two segments can sometimes share one offer. Whether they can depends on how close their needs are. Module 2 summarised each segment by its <g>segment centre</g>, and the distance between two centres, in standardised units, says how different two segments’ needs are. Craft and local’s nearest neighbour is Explorers (${f2(cdist(CL, EX))}); On the go is far away (${f2(cdist(CL, GO))}), almost as far as Value routine (${f2(cdist(CL, VR))}).` },
    { table: {
      caption: 'Three segments’ needs as indexes against the average respondent (100 = average)',
      head: ['Need', 'Craft and local', 'Explorers', 'On the go'],
      rows: [6, 0, 7, 3, 2, 4, 1].map((j) => [NEED[j], String(S.index[CL][j]), String(S.index[EX][j]), String(S.index[GO][j])]),
      align: ['l', 'r', 'r', 'r'],
    } },
    { p: `Craft and local and Explorers both care more than average about taste and novelty, so a craft cold brew with interesting single origins could speak to both with one product and one message. On the go wants the opposite of Craft and local on almost every line: convenience and a caffeine kick, not local provenance. Serving it well would take a second mix, available where it buys on the move and promoted on different benefits.` },
    { p: `On the go buys mostly in supermarkets or ready-to-drink (${p0(goSrc[2])}), at the office or from vending machines (${p0(goSrc[3])}) and at cafés (${p0(goSrc[0])}). The survey doesn’t separate convenience stores from supermarkets. M02’s plan put the cans in supermarkets and M04’s research kept them to a test in a few stores, so some of On the go will meet them there whatever Lantern targets.` },
    { p: 'A second mix carries a cost beyond money. One brand can’t easily stand for “craft, local and worth the walk” and “strong, everywhere, grab it and go” at once: each message weakens the other in customers’ minds. Companies that serve distant segments well often use separate brands for them, which costs more again. Module 4 shows how to read this on a perceptual map.' },

    { h: 'Cannibalisation' },
    { p: '<g>Cannibalisation</g> is the sales a new offer takes from the company’s own existing offers rather than from rivals or from people who would have bought nothing; M02’s product-decisions lesson met it in passing. The <g>cannibalisation rate</g> is the share of the new offer’s sales that come from the company’s existing offers. A new offer is worth adding only if its <g>incremental contribution</g>, its own contribution minus the contribution it takes from the old offers and minus any extra fixed costs, is positive.' },
    { p: 'Cannibalisation hurts most when the new offer is cheaper or earns a thinner margin than the one it replaces, as when a premium brand launches a budget version. It can still be the right move: a company that doesn’t cannibalise its own product may leave a rival to do it. Estimate the rate before launch by asking prospective buyers what they would have bought instead, and measure it after launch from the customers who switch, as M02’s idea of <g>incrementality</g> requires.' },
    { p: `For Lantern the risk runs through its cafés. A Craft and local regular who would have bought a café cold brew and buys a can in one of the test supermarkets instead would earn Lantern $${f2(perCan('supermarket'))} (M02’s figures: $${f2(price)} less the ${p0(ch('supermarket').margin)} the distributor and retailer keep and the $${f2(cogs)} it costs to make and deliver a can), not the margin on a café drink. The study didn’t ask what Cold Brew would replace, so the rate is unknown; a question for Lantern’s next survey.` },

    { h: 'Buyer personas' },
    { p: 'A segment is a table of averages, which is hard to keep in mind when designing a menu, writing an advertisement or training staff. A <g>buyer persona</g> turns the table into a short profile written as if about one person. OpenStax calls it a “semi-fictional representation of an ideal customer”. The software designer Alan Cooper popularised personas in his 1999 book <i>The Inmates Are Running the Asylum</i>, and John Pruitt and Jonathan Grudin (2003), describing their use at Microsoft, insisted that personas be built on data: early ones failed partly because they were designed by committee rather than from research.' },
    { p: 'Built from segment data, a persona takes each line from a number and says which number. A practical order:' },
    { ol: [
      '<b>State what it stands for.</b> The segment’s name, its size (respondents and share) and its share of spending: a persona without its base hides how many people it describes.',
      '<b>Needs first.</b> The highest and lowest values of the segment’s <g>index against the average</g> on each need: what it cares about more, and less, than the average customer. In a <g>needs-based segmentation</g> these define the segment.',
      '<b>Behaviour.</b> How much and how often they buy, and where, with the median beside any mean that a few heavy buyers pull up.',
      '<b>Who they are, as shares.</b> The demographic and regional lines from the cross-tabs, each as the share of the segment it describes (“76% aged 30–59”), not as a fact about the persona (“44 years old”).',
      '<b>The company and them.</b> Awareness, past purchase, loyalty and intent: where the brand starts with this segment.',
      '<b>A name and a quote.</b> The name is a label to make the persona easy to discuss; the quote, if any, comes from a real interview. Neither is a finding.',
    ] },
    { p: 'The card below follows that order for Craft and local. Every figure is an average or a share of the segment’s 109 respondents.' },
    { define: [
      ['Persona', 'Quinn, the neighbourhood regular: a label for Craft and local, not a finding.'],
      ['Stands for', `${nCL} of ${N} respondents (${p1(nCL / N)}) and ${p1(S.sizes[CL].spendShare)} of the study’s coffee spend. Needs study, May 2027 (opt-in panel with quotas on age band, so shares describe respondents).`],
      ['What matters', `Index against the average respondent (100 = average): local and independent ${IX[6]}, taste and quality ${IX[0]}, novelty ${IX[7]}, sustainability ${IX[3]}. Less than average: convenience ${IX[2]}, price ${IX[1]}.`],
      ['How they buy', `${f1(cupsMean)} cups a week on average (median ${cupsMed}); $${f2(spendMean)} a month on average (median $${spendMed}); ${p0(cafe)} buy mostly at a café, ${p0(home)} mostly brew at home.`],
      ['Who they are', `Shares of the segment: ${p0(age3059)} aged 30–59; ${p0(inc80)} with household income over $80k; ${p0(couple)} live as a couple; ${p0(central)} live in Central Harbour City.`],
      ['Lantern and them', `${p0(awareCL)} know Lantern and ${p0(boughtCL)} bought it last year; local loyalty ${f2(loyalCL)} of 5 (all respondents ${f2(loyalAll)}); ${p0(cbCL)} would definitely or probably buy Cold Brew; nearest rival ${BRANDS[D.map.nearestRival[CL].b]}.`],
      ['Quote', 'Take one from a real interview with a member of the segment (M04). Don’t write one.'],
    ] },

    { h: 'What a persona can’t do' },
    { p: `A persona describes the segment’s averages and most common answers, and almost nobody is average on everything. Of the ${nCL} Craft and local respondents, only ${broadChain[5]} match these five of the card’s lines at once: aged 30–59, income over $80k, mostly buying at a café, living in Central and in a couple. Make each line the single most common answer instead (four demographic lines and the main source: ${modalAge}, $80k–120k, café, Central, couple) and only ${modalChain[5]} of the ${nCL} matches; with the other, almost equally common age band (30–44, ${ageCounts[1]} members against ${ageCounts[2]}) it is ${modalAlt}. A persona drawn as one 52-year-old with a precise income describes almost no one in its own segment.` },
    { p: `The demographic lines do lean the segment’s way: ${p0(inc80)} of members have household incomes over $80k against ${p0(inc80Out)} of other respondents, and ${p0(cafe)} against ${p0(cafeOut)} buy mostly at a café. Together, though, they describe almost no one: ${broadChain[5]} members match all five. The needs line covers most of the segment and few outside it: ${needsIn} of the ${nCL} rate both taste and local provenance 6 or 7 out of 7, against ${needsOut} of the other ${N - nCL} respondents. That is module 1’s caution about demographics in another form: they describe who, the needs describe why.` },
    { list: [
      '<b>Stereotypes.</b> A face, a gender and an age invite assumptions the data never made. Pruitt and Grudin note that personas need not be extreme or stereotyped; a neutral name and shares rather than a single age help.',
      '<b>No size.</b> A persona is one person; the segment is 109 respondents standing for a share of every coffee drinker in the city. Keep the base on the card.',
      '<b>Staleness.</b> Needs and channels change. Date the persona and rebuild it when the segmentation is refreshed.',
      '<b>Invention.</b> Hobbies, a job title, a favourite podcast: details the survey didn’t measure make a persona vivid and wrong. Leave them out or mark them as hypotheses to research.',
    ] },

    { h: 'Targeting responsibly when data are personal' },
    { p: 'Micromarketing runs on <g>personal data</g>: purchase histories, locations, what people click. The BCcampus textbook flags the ethical and privacy concerns of microtargeting, which isolates very specific groups from detailed personal data. Collecting more than the offer needs, using data for purposes customers weren’t told about, or inferring sensitive traits from behaviour all break the trust that individual marketing depends on, and in many places the law. B01 covered the legal basics.' },
    { p: 'Targeting can also harm by exclusion. OpenStax describes an advertising platform that let advertisers exclude people from seeing advertisements by race, religion or gender, and which the US Department of Housing and Urban Development sued, citing laws against discrimination in housing. Personas can do the same quietly, if a team designs only for the persona’s demographics and treats everyone else as out of scope. The ethical screen of the previous lesson (product harm and consumer vulnerability) applies to each campaign and channel, not only to the choice of segment.' },
  ],

  formulas: [
    { id: 'ts-incremental', name: 'Incremental contribution of a new offer after cannibalisation',
      tex: String.raw`\Delta C = Q \times m_{\text{new}} - c \times Q \times m_{\text{old}} - F`,
      where: [
        [String.raw`\Delta C`, 'Incremental contribution: what the new offer adds to the company’s total contribution', '$ per period'],
        ['Q', 'Units (or customers) of the new offer sold in the period', 'units'],
        [String.raw`m_{\text{new}}`, 'Contribution per unit of the new offer', '$ per unit'],
        ['c', 'Cannibalisation rate: the share of the new offer’s sales that would otherwise have been sales of the existing offer', ''],
        [String.raw`m_{\text{old}}`, 'Contribution per unit of the existing offer that is lost', '$ per unit'],
        ['F', 'Extra fixed costs of running the new offer in the period', '$ per period'],
      ],
      assumptions: 'Each cannibalised unit of the new offer replaces one unit of the old one. If one new unit replaces a different number of old units, multiply by that number.',
      note: 'Contribution per unit is price received minus variable cost (M02). With F = 0 the formula is Q × (m_new − c × m_old).' },
    { id: 'ts-breakeven-c', name: 'Break-even cannibalisation rate',
      tex: String.raw`c^{*} = \dfrac{Q \times m_{\text{new}} - F}{Q \times m_{\text{old}}}`,
      where: [
        [String.raw`c^{*}`, 'The cannibalisation rate at which the new offer adds nothing; above it, the offer loses money for the company as a whole', ''],
        ['Q', 'Units of the new offer sold', 'units'],
        [String.raw`m_{\text{new}},\ m_{\text{old}}`, 'Contribution per unit of the new and the existing offer', '$ per unit'],
        ['F', 'Extra fixed costs of the new offer', '$ per period'],
      ],
      assumptions: 'As for the incremental contribution. With no extra fixed costs, c* = m_new ÷ m_old.',
      note: 'Compare c* with the best estimate of the actual rate: the wider the gap, the safer the launch.' },
  ],

  examples: [
    { level: 'simple', title: 'Does a gym chain’s budget brand add anything?', fictional: true,
      setup: `Quarrystone Fitness runs premium clubs; each member-month contributes $${QF.mOld} after variable costs. It plans a budget brand for price-sensitive exercisers, which would contribute $${QF.mNew} a member-month, and expects ${int(QF.Q)} budget members. Its survey suggests that ${p0(QF.c)} of them would be existing premium members moving down. What does the budget brand add each month, and at what cannibalisation rate would it add nothing?`,
      steps: [
        String.raw`Contribution from the budget members (the incremental-contribution formula, first term): <m>3{,}000 \times 14 = 42{,}000</m> dollars a month.`,
        String.raw`Contribution lost from premium members who move down: <m>0.2 \times 3{,}000 = 600</m> members, each taking $40 with them: <m>600 \times 40 = 24{,}000</m> dollars.`,
        String.raw`Incremental contribution: <m>42{,}000 - 24{,}000 = ${tx(QF.Q * QF.mNew - QF.c * QF.Q * QF.mOld)}</m> dollars a month (no extra fixed costs are given).`,
        String.raw`Break-even rate (no fixed costs): <m>c^{*} = 14 \div 40 = ${f2(qfBE)}</m>, or 35%.`,
      ],
      answer: `About $${int(qfInc)} a month, and the brand adds nothing if 35% or more of its members are premium members trading down.`,
      interpretation: 'The new brand earns $42,000 but adds only $18,000, because a fifth of its members bring a $40 margin down to $14. The survey’s 20% is an estimate; if the true rate were nearer 35%, the brand would be pointless for the chain as a whole. Quarrystone should keep the two brands clearly apart (different locations, no premium features) to keep the rate down.' },

    { level: 'challenging', title: 'A bookshop’s subscription box for a new segment', fictional: true,
      setup: `Ferrisby Books has served adult readers from one shop. It plans a monthly young-adult subscription box for teenage readers, its first offer for a second segment. Each box contributes $${FB.mNew}; packing staff and software add $${int(FB.F)} a month of fixed costs; it expects ${int(FB.Q)} subscribers. ${p0(FB.c)} of subscribers are thought to be families who would otherwise have bought young-adult books in the shop, where each such family contributes $${FB.mOld} a month. Find the box’s incremental contribution, the break-even cannibalisation rate, and the number of subscribers it needs at the expected rate.`,
      steps: [
        String.raw`Incremental contribution (the formula with fixed costs): <m>1{,}200 \times 9 - 0.3 \times 1{,}200 \times 6 - 4{,}000 = 10{,}800 - 2{,}160 - 4{,}000 = ${tx(fbInc)}</m> dollars a month.`,
        String.raw`Break-even cannibalisation rate: <m>c^{*} = (1{,}200 \times 9 - 4{,}000) \div (1{,}200 \times 6) = 6{,}800 \div 7{,}200 \approx ${f2(fbBE)}</m>, or about ${p0(fbBE)}.`,
        String.raw`Subscribers needed at the expected 30% rate: each subscriber adds <m>9 - 0.3 \times 6 = 7.20</m> dollars net, so the fixed costs need <m>4{,}000 \div 7.20 \approx ${f1(fbQ)}</m>, or ${Math.ceil(fbQ)} subscribers.`,
        'Judge the risk. Cannibalisation could almost wipe out the box’s contribution before the offer lost money: it is not the danger here. The danger is volume: below about 556 subscribers the fixed costs win. The 1,200 is the estimate to test, with a pre-launch sign-up list.',
      ],
      answer: `About $${int(fbInc)} a month; it breaks even at a cannibalisation rate of about ${p0(fbBE)}, and needs at least ${Math.ceil(fbQ)} subscribers at a 30% rate.`,
      interpretation: 'A differentiated move into a second segment is judged on what it adds, after what it takes from the existing business and what it costs to run. Here cannibalisation is a minor issue because the box earns more per subscriber than the shop loses; the fixed costs make volume the real question. With a premium offer cannibalised by a cheaper one, as at Quarrystone, the opposite would hold.' },

    { level: 'applied', title: 'A persona for Craft and local, and how far to trust it', fictional: true,
      setup: `Ana wants a persona for Craft and local to brief her café managers and the agency designing Cold Brew’s launch. Build it from the needs study (module 2’s profile and the respondents’ answers) and test it against the ${nCL} members.`,
      steps: [
        `State what it stands for: ${nCL} of ${N} respondents (${p1(nCL / N)}) and ${p1(S.sizes[CL].spendShare)} of the study’s coffee spend.`,
        `Needs, from the indexes: local and independent ${IX[6]}, taste and quality ${IX[0]}, novelty ${IX[7]}, sustainability ${IX[3]}; less interest than average in price (${IX[1]}) and convenience (${IX[2]}).`,
        `Behaviour: ${f1(cupsMean)} cups a week on average but a median of ${cupsMed}; $${f2(spendMean)} a month on average, median $${spendMed}; ${p0(cafe)} buy mostly at a café and ${p0(home)} brew at home.`,
        `Who they are, as shares: ${p0(age3059)} aged 30–59 (${ageCounts[1]} aged 30–44 and ${ageCounts[2]} aged 45–59, too close to name one band), ${p0(inc80)} with household income over $80k, ${p0(couple)} couples, ${p0(central)} in Central. Lantern: ${p0(awareCL)} know it, ${p0(boughtCL)} bought it last year, local loyalty ${f2(loyalCL)} against ${f2(loyalAll)}, Cold Brew intent ${p0(cbCL)}.`,
        `Test it. A COUNTIFS over the ${nCL} members finds ${broadChain[5]} who match the four demographic lines and the café habit together, and ${modalChain[5]} to ${modalAlt} who match the most common answer on each of the five, depending on which age band is taken as most common. The needs line, taste and local both rated 6 or 7, fits ${needsIn} of them (${p0(needsIn / nCL)}).`,
      ],
      answer: 'The persona card above: needs and behaviour that describe most of the segment, demographic lines given as shares, a label for a name and no invented details.',
      interpretation: `Ana’s briefing should lead with the needs (what ${p0(needsIn / nCL)} of the segment share) and present the demographics as the shares they are. A brief that says “design for a couple in their fifties in Central, earning $80k–120k and drinking at cafés” would design for ${modalChain[5]} of the ${nCL} (${modalAlt} with the other age band). The persona keeps the segment in view; the segment’s tables, with their bases, stay the evidence.` },

    { level: 'applied', title: 'Concentrate, or chase On the go with Cold Brew?', fictional: true,
      setup: `Ana must choose Cold Brew’s targeting strategy for its launch. She has the scorecard (Craft and local first, Explorers second), the Cold Brew intent by segment, the segments’ needs and M02’s economics: at $${f2(price)} a can Lantern would earn $${f2(perCan('supermarket'))} a can through supermarkets, $${f2(perCan('natural'))} through natural grocers, $${f2(perCan('convenience'))} through convenience stores and $${f2(perCan('direct'))} in its own cafés and online shop.`,
      steps: [
        `Where the likely buyers are: ${top2[GO]} of the ${top2All} top-two-box answers come from On the go (${p0(top2[GO] / top2All)}), ${top2[CL]} from Craft and local (${p0(top2[CL] / top2All)}) and ${top2[EX]} from Explorers (${p0(top2[EX] / top2All)}). Mindful holds ${top2[MI]} (${p0(top2[MI] / top2All)}) and Value routine ${top2[VR]} (${p0(top2[VR] / top2All)}). Craft and local and Explorers together hold ${p0((top2[CL] + top2[EX]) / top2All)}.`,
        `Can one offer serve them? Craft and local and Explorers are neighbours (centres ${f2(cdist(CL, EX))} apart) and share a taste for quality and novelty. On the go is ${f2(cdist(CL, GO))} from Craft and local and wants convenience and energy, Lantern’s weak points.`,
        `What On the go would cost: a second mix in convenience stores and offices, where Lantern would earn $${f2(perCan('convenience'))} a can against $${f2(perCan('supermarket'))} in supermarkets; a message about energy and availability that pulls against Lantern’s craft position; and Corner Cup already ${f2(D.map.nearestRival[GO].d)} from the segment’s ideal on the map.`,
        'Resources (a small firm, a launch budget, low awareness) favour one focused offer at launch, and a new product in its introduction stage usually starts with one basic version.',
      ],
      answer: `Launch Cold Brew with one mix aimed at Craft and local and Explorers as one combined target, sold through Lantern’s cafés and online shop and natural grocers, with the supermarket test M04 planned, and treat On the go as a later, separate decision. Strictly, this is neither concentrated marketing (one segment) nor differentiated marketing (a mix for each segment): two neighbouring segments share one offer, which works because their centres are only ${f2(cdist(CL, EX))} apart and both care about taste and novelty.`,
      interpretation: `The launch is designed around ${p0((top2[CL] + top2[EX]) / top2All)} of the likely buyers; the other ${p0(1 - (top2[CL] + top2[EX]) / top2All)}, including On the go’s ${p0(top2[GO] / top2All)} (the largest single group) and Mindful’s ${p0(top2[MI] / top2All)}, are not its target, though some will buy in the test supermarkets or in Lantern’s own channel. Top-two intent also overstates buying: it is a <g>stated preference</g>, and answering “probably” costs nothing (M04). In return Lantern gets a coherent launch it can afford, to be revisited with evidence: sales by channel in the first months, and a test in a few convenience stores to see whether On the go buys a craft can at all. Positioning Cold Brew against Summit Brew, the brand nearest Explorers’ ideal, is the work of module 4.` },
  ],

  demo: [
    { widget: 'ts-persona-pivot', intro: 'All 640 respondents with their segment. The table starts with each segment’s age bands as row percentages: Craft and local’s row is the persona’s age line. Change the columns to Income, Household, Region or Main source to build the card’s other lines, or the value to Spend a month with Average to compare spending. Filter to one segment and put two demographics on rows and columns to see how quickly the people matching both thin out.' },
    { widget: 'ts-cannibal', intro: 'Quarrystone’s budget brand to start with. Raise the cannibalisation rate and watch the incremental contribution fall to zero at 35%; then add fixed costs, or narrow the gap between the two margins, and see where the break-even rate moves.' },
  ],

  mistakes: [
    { title: '“Serving more segments always sells more, so differentiated beats concentrated.”', html: 'Each extra segment needs its own mix, which costs money and management, and some of its sales are taken from the offers you already have. A company should serve as many segments as it can serve well and profitably, which for a small firm with a new product is often one.' },
    { title: '“A niche is a safe place for a small firm.”', html: 'A niche protects a firm from broad competitors only while it stays too small or too specialised to attract them, and it puts all the eggs in one basket. Watch the niche’s size and the larger firms’ moves, and know what you would do if either changed.' },
    { title: '“The new segment’s sales are all extra.”', html: 'Some come from your own customers switching. Subtract the contribution they take with them (the cannibalisation rate times the old margin) and any new fixed costs before judging the offer.' },
    { title: '“A persona is a creative-writing exercise.”', html: 'A persona is a summary of data given a label. Every line should trace to a number about the segment; invented hobbies, jobs and quotes make it vivid and wrong.' },
    { title: '“The persona is our typical customer.”', html: `Averages describe almost no one: only ${modalChain[5]} to ${modalAlt} of Craft and local’s ${nCL} members match the segment’s most common answer on five lines (four demographic and the main source), depending on the age band. Write demographic lines as shares, lead with the needs that most members share, and keep the base on the card.` },
    { title: '“Micromarketing is just using more data.”', html: 'It uses personal data, which brings consent, purpose and privacy obligations, and it can exclude people as easily as it includes them. Collect what the offer needs, tell customers how it is used, and check who the targeting leaves out.' },
  ],

  application: [
    { p: 'Targeting decisions are rarely made once. A company launches with the strategy its resources allow, measures what happens, and widens or narrows its targets as evidence arrives. The professional habit is to write down, with the strategy, what would change it.' },
    { case: `Ana’s plan for Cold Brew’s first year aims one mix, with one craft message, at Craft and local and Explorers as a single combined target, sold through Lantern’s cafés and online shop and natural grocers, with the supermarket test M04 planned. The persona briefs the café managers and the agency, needs first. Her two triggers for revisiting the choice: if convenience stores near Central offices sell a test batch at a steady rate, On the go may be worth a separate mix; if Cold Brew sold in grocers and the test supermarkets takes visible sales from Lantern’s cafés (her next survey will ask café regulars what Cold Brew replaces), the channels need rethinking before anything is added. Both are fictional plans for this lesson.` },
    { p: 'The same reasoning runs through very different businesses. A regional bank may concentrate on small manufacturers it understands, then add a separate offer for start-ups with its own staff and brand. A travel company may use local marketing, with different brochures for each departure city, inside a concentrated strategy aimed at retired couples. A software firm may personalise every customer’s onboarding (individual marketing) while selling one product to one industry.' },
    { p: 'In each case the strategy is judged by three questions this lesson has given you: can the company afford every offer it plans, does each new offer add more than it takes from the others, and does the team designing for the target know who the target really is, from data rather than imagination?' },
  ],

  summary: [
    'A targeting strategy decides how many segments to serve and how differently: undifferentiated (one mix for all), differentiated (a mix per segment), concentrated (one segment or niche) or micromarketing (local and individual).',
    'Choose with five considerations: resources, product variability, life-cycle stage, market variability and competitors’ strategies; for a small firm launching a new product they usually favour concentration.',
    'Segments whose needs are close can share an offer; distant ones need separate mixes, which cost more and can blur the brand.',
    'Judge a new offer by its incremental contribution, Q × m_new − c × Q × m_old − F; it breaks even at c* = (Q × m_new − F) ÷ (Q × m_old).',
    'A buyer persona is segment data given a label: state its base, lead with needs, give demographics as shares, and invent nothing.',
    'Personas describe averages that fit few real members, can carry stereotypes and go stale; micromarketing raises privacy and exclusion risks.',
  ],

  glossary: [
    { term: 'Targeting strategy', def: 'A company’s choice of how many segments to serve and how differently to treat them: undifferentiated, differentiated or concentrated marketing, or micromarketing.' },
    { term: 'Differentiated marketing', def: 'Targeting two or more segments with a separate offer or marketing mix for each; also called segmented or multi-segment marketing.' },
    { term: 'Concentrated marketing', def: 'Targeting one segment or niche with one marketing mix, aiming for a large share of it; also called niche marketing.' },
    { term: 'Niche', def: 'A narrowly defined group of customers, usually within a segment, whose distinctive needs larger competitors serve poorly.' },
    { term: 'Micromarketing', def: 'Tailoring offers and marketing to small local areas (local marketing) or to individual customers (individual marketing), usually with detailed customer data.' },
    { term: 'Local marketing', def: 'Adapting offers and marketing to the customers of a particular city, neighbourhood or store.' },
    { term: 'Individual marketing', def: 'Adapting offers and marketing to a single customer, usually from data on what that customer has bought or said; also called one-to-one marketing.' },
    { term: 'Cannibalisation', def: 'Sales a new offer takes from the same company’s existing offers, rather than from rivals or from people who would otherwise have bought nothing.' },
    { term: 'Cannibalisation rate', def: 'The share of a new offer’s sales that would otherwise have been sales of the company’s existing offers.' },
    { term: 'Incremental contribution', def: 'The change in a company’s total contribution caused by a decision: the new offer’s contribution minus the contribution it takes from existing offers and any extra fixed costs.' },
    { term: 'Buyer persona', def: 'A short profile of a typical member of a target segment, written as if about one person but built from research data on the segment, used to keep the segment’s needs in view in decisions.' },
  ],

  references: [
    { text: 'Gomez Albrecht, M., Green, M. &amp; Hoffman, L. (2023). <i>Principles of Marketing</i>, section 5.5, “Selecting Target Markets”. OpenStax. Undifferentiated, differentiated and concentrated marketing, micromarketing, and buyer personas as a semi-fictional representation of an ideal customer.', url: 'https://openstax.org/books/principles-marketing/pages/5-5-selecting-target-markets', checked: '2026-10-25' },
    { text: '<i>Principles of Marketing – H5P Edition</i> (2022), section 5.3, “Selecting Target Markets and Target-Market Strategies”. BCcampus, CC BY-NC-SA 4.0. Mass, multisegment, concentrated and niche marketing, and microtargeting’s privacy concerns.', url: 'https://opentextbc.ca/principlesofmarketingh5p/chapter/selecting-target-markets-and-target-market-strategies/', checked: '2026-10-25' },
    { text: 'Kotler, P. &amp; Armstrong, G. (2018). <i>Principles of Marketing</i>, 17th ed., chapter 7. Pearson. The book was not consulted; its sections on undifferentiated, differentiated and concentrated marketing, micromarketing (local and individual) and choosing a targeting strategy were confirmed from the book’s table of contents as listed on O’Reilly Learning.', url: 'https://oreilly.com/library/view/principles-of-marketing/9780134492513', checked: '2026-10-25' },
    { text: 'Ripley, M. L. Course notes on chapter 7 of Armstrong and Kotler, <i>Marketing: An Introduction</i>, “Factors to consider in choosing a target-marketing strategy”. York University. The source for the five considerations’ labels; the notes list them without explanation.', url: 'https://www.yorku.ca/lripley/imUsegment.htm', checked: '2026-10-25' },
    { text: 'Gomez Albrecht, M., Green, M. &amp; Hoffman, L. (2023). <i>Principles of Marketing</i>, section 9.4, “Marketing Strategies at Each Stage of the Product Life Cycle”. OpenStax. Maturity strategies of extending a product to new customers and altering it to fit the market.', url: 'https://openstax.org/books/principles-marketing/pages/9-4-marketing-strategies-at-each-stage-of-the-product-life-cycle', checked: '2026-10-25' },
    { text: 'Pruitt, J. &amp; Grudin, J. (2003). Personas: practice and theory. Proceedings of the 2003 Conference on Designing for User Experiences (DUX). Microsoft Research. Cooper’s 1999 book as the source that popularised personas; personas built on data; their risks.', url: 'https://www.microsoft.com/en-us/research/publication/personas-practice-theory/', checked: '2026-10-25' },
    { text: 'Gomez Albrecht, M., Green, M. &amp; Hoffman, L. (2023). <i>Principles of Marketing</i>, section 5.7, “Ethical Concerns and Target Marketing”. OpenStax. Exclusion through advertising platforms.', url: 'https://openstax.org/books/principles-marketing/pages/5-7-ethical-concerns-and-target-marketing', checked: '2026-10-25' },
  ],

  checks: [
    { what: 'Respondents', value: N, shown: 640 },
    { what: 'Top-two intenders, all', value: top2All, shown: 187 },
    { what: 'Top-two share, all %', value: (top2All / N) * 100, shown: 29.2, tol: 0.05 },
    ...NAMES.map((nm, g) => ({ what: `${nm}: intenders`, value: top2[g], shown: [16, 56, 31, 50, 34][g] })),
    ...NAMES.map((nm, g) => ({ what: `${nm}: respondents`, value: n[g], shown: [152, 146, 129, 109, 104][g] })),
    { what: 'C&L intent %', value: (top2[CL] / n[CL]) * 100, shown: 45.9, tol: 0.05 },
    { what: 'OtG intent %', value: (top2[GO] / n[GO]) * 100, shown: 38.4, tol: 0.05 },
    { what: 'VR intent %', value: (top2[VR] / n[VR]) * 100, shown: 10.5, tol: 0.05 },
    { what: 'Intent range low ≈ 10%', value: (top2[VR] / n[VR]) * 100, shown: 10, tol: 0.6 },
    { what: 'Intent range high ≈ 46%', value: (top2[CL] / n[CL]) * 100, shown: 46, tol: 0.5 },
    { what: 'Awareness %', value: D.aware * 100, shown: 13.9, tol: 0.05 },
    { what: 'Centre distance C&L–Explorers', value: cdist(CL, EX), shown: 2.39 },
    { what: 'Centre distance C&L–On the go', value: cdist(CL, GO), shown: 4.51 },
    { what: 'Centre distance C&L–Value routine', value: cdist(CL, VR), shown: 4.68 },
    ...[6, 0, 7, 3, 2, 4, 1].flatMap((j) => [CL, EX, GO].map((g) => ({ what: `Index ${NEED[j]} ${NAMES[g]}`, value: S.index[g][j], shown: { 6: [168, 104, 68], 0: [136, 107, 90], 7: [124, 158, 87], 3: [123, 95, 75], 2: [76, 92, 137], 4: [78, 102, 147], 1: [67, 88, 99] }[j][[CL, EX, GO].indexOf(g)] }))),
    { what: 'Cold Brew price', value: price, shown: 3.49 },
    { what: 'Single-origin cost per can', value: cogs, shown: 0.74 },
    { what: 'Supermarket trade margin %', value: ch('supermarket').margin * 100, shown: 32 },
    { what: 'Per can: supermarket', value: perCan('supermarket'), shown: 1.63 },
    { what: 'Per can: natural', value: perCan('natural'), shown: 1.42 },
    { what: 'Per can: convenience', value: perCan('convenience'), shown: 1.35 },
    { what: 'Per can: direct', value: perCan('direct'), shown: 2.30 },
    { what: 'OtG nearest rival distance', value: D.map.nearestRival[GO].d, shown: 0.57 },
    { what: 'C&L nearest rival is Arcadia', value: BRANDS[D.map.nearestRival[CL].b] === 'Arcadia Coffee' ? 1 : 0, shown: 1 },
    { what: 'OtG nearest rival is Corner Cup', value: BRANDS[D.map.nearestRival[GO].b] === 'Corner Cup' ? 1 : 0, shown: 1 },
    { what: 'Explorers nearest rival is Summit Brew', value: BRANDS[D.map.nearestRival[EX].b] === 'Summit Brew' ? 1 : 0, shown: 1 },
    { what: 'Share of intenders: OtG %', value: (top2[GO] / top2All) * 100, shown: 30, tol: 0.5 },
    { what: 'Share of intenders: C&L %', value: (top2[CL] / top2All) * 100, shown: 27, tol: 0.5 },
    { what: 'Share of intenders: Explorers %', value: (top2[EX] / top2All) * 100, shown: 17, tol: 0.5 },
    { what: 'Share of intenders: C&L + Explorers %', value: ((top2[CL] + top2[EX]) / top2All) * 100, shown: 43, tol: 0.5 },
    // persona
    { what: 'C&L members', value: nCL, shown: 109 },
    { what: 'C&L share of respondents %', value: (nCL / N) * 100, shown: 17.0, tol: 0.05 },
    { what: 'C&L share of spend %', value: S.sizes[CL].spendShare * 100, shown: 25.9, tol: 0.05 },
    { what: 'C&L cups mean', value: cupsMean, shown: 8.4, tol: 0.05 },
    { what: 'C&L cups median', value: cupsMed, shown: 7 },
    { what: 'C&L spend mean', value: spendMean, shown: 76.61 },
    { what: 'C&L spend median', value: spendMed, shown: 68 },
    { what: 'C&L café %', value: cafe * 100, shown: 61, tol: 0.5 },
    { what: 'C&L home-brewed %', value: home * 100, shown: 28, tol: 0.5 },
    { what: 'C&L aged 30–59 %', value: age3059 * 100, shown: 76, tol: 0.5 },
    { what: 'C&L aged 30–44', value: ageCounts[1], shown: 41 },
    { what: 'C&L aged 45–59', value: ageCounts[2], shown: 42 },
    { what: 'C&L income over $80k %', value: inc80 * 100, shown: 78, tol: 0.5 },
    { what: 'C&L couples %', value: couple * 100, shown: 47, tol: 0.5 },
    { what: 'C&L Central %', value: central * 100, shown: 38, tol: 0.5 },
    { what: 'C&L aware %', value: awareCL * 100, shown: 25, tol: 0.5 },
    { what: 'C&L bought %', value: boughtCL * 100, shown: 14, tol: 0.5 },
    { what: 'C&L loyalty', value: loyalCL, shown: 3.94 },
    { what: 'All loyalty', value: loyalAll, shown: 3.05 },
    { what: 'C&L Cold Brew %', value: cbCL * 100, shown: 46, tol: 0.5 },
    ...[6, 0, 7, 3, 2, 1].map((j) => ({ what: `Persona index ${NEED[j]}`, value: IX[j], shown: { 6: 168, 0: 136, 7: 124, 3: 123, 2: 76, 1: 67 }[j] })),
    { what: 'Members matching five broad lines', value: broadChain[5], shown: 5 },
    { what: 'Members matching five modal lines', value: modalChain[5], shown: 1 },
    { what: 'Modal age band is 45–59', value: modalAge === '45–59' ? 1 : 0, shown: 1 },
    { what: 'Needs line inside', value: needsIn, shown: 84 },
    { what: 'Needs line outside', value: needsOut, shown: 4 },
    { what: 'Others', value: N - nCL, shown: 531 },
    { what: 'Income over $80k outside C&L %', value: inc80Out * 100, shown: 34, tol: 0.5 },
    { what: 'Café outside C&L %', value: cafeOut * 100, shown: 26, tol: 0.5 },
    { what: 'Modal lines with 30–44', value: modalAlt, shown: 3 },
    { what: 'OtG supermarket or RTD %', value: goSrc[2] * 100, shown: 39, tol: 0.5 },
    { what: 'OtG office or vending %', value: goSrc[3] * 100, shown: 30, tol: 0.5 },
    { what: 'OtG café %', value: goSrc[0] * 100, shown: 21, tol: 0.5 },
    { what: 'Share of intenders: Mindful %', value: (top2[MI] / top2All) * 100, shown: 18, tol: 0.5 },
    { what: 'Share of intenders: VR %', value: (top2[VR] / top2All) * 100, shown: 9, tol: 0.5 },
    { what: 'Share of intenders outside the pair %', value: (1 - (top2[CL] + top2[EX]) / top2All) * 100, shown: 57, tol: 0.5 },
    { what: 'Modal age band 45–59: a person of 52 lies in it', value: 52 >= 45 && 52 <= 59 ? 1 : 0, shown: 1 },
    { what: 'Needs line share of C&L %', value: (needsIn / nCL) * 100, shown: 77, tol: 0.5 },
    // Quarrystone
    { what: 'QF contribution from budget members', value: QF.Q * QF.mNew, shown: 42000 },
    { what: 'QF members moving down', value: QF.c * QF.Q, shown: 600 },
    { what: 'QF contribution lost', value: QF.c * QF.Q * QF.mOld, shown: 24000 },
    { what: 'QF incremental', value: qfInc, shown: 18000 },
    { what: 'QF break-even rate', value: qfBE, shown: 0.35 },
    // Ferrisby
    { what: 'FB new contribution', value: FB.Q * FB.mNew, shown: 10800 },
    { what: 'FB cannibalised', value: FB.c * FB.Q * FB.mOld, shown: 2160 },
    { what: 'FB incremental', value: fbInc, shown: 4640 },
    { what: 'FB break-even numerator', value: FB.Q * FB.mNew - FB.F, shown: 6800 },
    { what: 'FB break-even denominator', value: FB.Q * FB.mOld, shown: 7200 },
    { what: 'FB break-even rate', value: fbBE, shown: 0.94, tol: 0.005 },
    { what: 'FB break-even rate %', value: fbBE * 100, shown: 94, tol: 0.5 },
    { what: 'FB net per subscriber', value: FB.mNew - FB.c * FB.mOld, shown: 7.2 },
    { what: 'FB subscribers needed', value: fbQ, shown: 555.6, tol: 0.05 },
    { what: 'FB subscribers needed (whole)', value: Math.ceil(fbQ), shown: 556 },
  ],
};
