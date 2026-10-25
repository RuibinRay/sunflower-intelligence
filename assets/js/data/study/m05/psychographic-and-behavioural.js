// psychographic-and-behavioural.js — M05 · Psychographic and behavioural segmentation. Content only; exercises are in
// psychographic-and-behavioural.ex.js. Lantern's needs study from case.js (RESPONDENTS, LEVELS, NEEDS, DERIVED.loyalty):
// cups a week (heavy and light users), monthly spend, the three-item local-loyalty scale and awareness and purchase of
// Lantern, computed here from the respondents (never the k-means segments, which module 2 builds). Cairnhaven Bakery,
// Pinemoor Leisure and Bellwick Grocers (with Freya Lindgren) are fictional; VALS, Haley's toothpaste study and the
// Ehrenberg-Bass figures are real and described only from the sources cited. Every printed figure is recomputed in `checks`.
import { RESPONDENTS, LEVELS, NEEDS, DERIVED as D } from './case.js?v=15';
import * as I from '../../../core/inference.js?v=15';

// ---------------------------------------------------------------- the figures this lesson quotes
const R = RESPONDENTS, N = R.length;
const sum = (a) => a.reduce((s, x) => s + x, 0);
const mean = (a) => sum(a) / a.length;
const median = (a) => { const s = [...a].sort((x, y) => x - y), m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
const corr = (a, b) => { const ma = mean(a), mb = mean(b); let sab = 0, sa = 0, sb = 0; a.forEach((x, i) => { sab += (x - ma) * (b[i] - mb); sa += (x - ma) ** 2; sb += (b[i] - mb) ** 2; }); return sab / Math.sqrt(sa * sb); };
const J = Object.fromEntries(NEEDS.map((n, j) => [n.key, j]));
const cups = R.map((r) => r.cups), spend = R.map((r) => r.spend);
const totC = sum(cups), totS = sum(spend);
const byCups = [...R].sort((a, b) => b.cups - a.cups), bySpend = [...R].sort((a, b) => b.spend - a.spend);
const FIFTH = Math.round(N / 5);
const topS = bySpend.slice(0, FIFTH);
const topSpendShare = sum(topS.map((r) => r.spend)) / totS;
const minTopSpend = Math.min(...topS.map((r) => r.spend));
const BANDS = [['Light (1–4 cups)', 1, 4], ['Medium (5–15 cups)', 5, 15], ['Heavy (16 or more)', 16, 99]];
const band = BANDS.map(([name, lo, hi]) => { const g = R.filter((r) => r.cups >= lo && r.cups <= hi); return { name, g, n: g.length, cupShare: sum(g.map((r) => r.cups)) / totC, spendShare: sum(g.map((r) => r.spend)) / totS, perHead: mean(g.map((r) => r.spend)), cafe: g.filter((r) => r.source === 0).length / g.length }; });
const [LT, , HV] = band;
const needMean = (g, k) => mean(g.map((r) => r.needs[J[k]]));
const tHL = I.tTest2(HV.g.map((r) => r.spend), LT.g.map((r) => r.spend));
const HV_SHARE = HV.n / N;
const rCupsSpend = corr(cups, spend);
// the local-loyalty scale: three Likert items, 1–5
const score = R.map((r) => sum(r.loyal) / 3);
const ALPHA = D.loyalty.alpha;
const rLoyalLocal = corr(score, R.map((r) => r.needs[J.local]));
const loBand = R.filter((_, i) => score[i] <= 7 / 3 + 1e-9), hiBand = R.filter((_, i) => score[i] >= 11 / 3 - 1e-9);
const cafeLo = loBand.filter((r) => r.source === 0).length / loBand.length, cafeHi = hiBand.filter((r) => r.source === 0).length / hiBand.length;
const spendLo = mean(loBand.map((r) => r.spend)), spendHi = mean(hiBand.map((r) => r.spend));
const cbLo = loBand.filter((r) => r.coldbrew <= 2).length / loBand.length, cbHi = hiBand.filter((r) => r.coldbrew <= 2).length / hiBand.length;
const midBand = R.filter((_, i) => score[i] > 7 / 3 + 1e-9 && score[i] < 11 / 3 - 1e-9);
const loyalCB = I.chisqIndependence([loBand, midBand, hiBand].map((g) => [g.filter((r) => r.coldbrew <= 2).length, g.filter((r) => r.coldbrew > 2).length]));
const loyalCafe = I.chisqIndependence([loBand, midBand, hiBand].map((g) => [g.filter((r) => r.source === 0).length, g.filter((r) => r.source !== 0).length]));
// readiness for Lantern: unaware, aware but not bought, bought in the past year
const unaware = R.filter((r) => !r.aware), awareOnly = R.filter((r) => r.aware && !r.bought), bought = R.filter((r) => r.bought);
const cb2 = (g) => g.filter((r) => r.coldbrew <= 2).length / g.length;

// Cairnhaven Bakery (fictional): loyalty-card holders by how many loaves they bought
const CB = { holders: 2000, groups: [[400, 18400], [600, 13800], [1000, 7800]] };
const cbTot = sum(CB.groups.map((g) => g[1]));
// Pinemoor Leisure (fictional): interest in a social swim club by benefit sought and by age
const PL = {
  benefits: ['Fitness', 'Relaxation', 'Meeting people', 'Family activities'], ben: [[45, 255], [80, 170], [105, 45], [20, 80]],
  ages: ['18–34', '35–54', '55 and over'], age: [[85, 165], [95, 235], [70, 150]],
};
const PLB = I.chisqIndependence(PL.ben), PLA = I.chisqIndependence(PL.age);
const plRate = (row) => row[0] / sum(row);
// Bellwick Grocers (fictional)
const BG = { orders: 260000, topUp: 0.58, weekly: 0.31 };

// ---------------------------------------------------------------- formatting
const p1 = (v) => `${(+(v * 100).toPrecision(12)).toFixed(1)}%`;   // toPrecision first, so 28.75 rounds to 28.8
const f1 = (v) => v.toFixed(1), f2 = (v) => v.toFixed(2);
const int = (v) => Math.round(v).toLocaleString('en-US');
const money = (v) => `$${v.toFixed(2)}`;
const pv = (p) => (p < 0.001 ? 'p &lt; 0.001' : `p = ${p.toFixed(2)}`);
const r2 = (v) => `${v < 0 ? '−' : ''}${Math.abs(v).toFixed(2)}`;

const BASES = (() => {
  const items = [
    ['Geographic', 'region, postcode, climate', 1], ['Demographic', 'age, life stage, income', 1],
    ['Usage rate and loyalty status', 'from purchase records', 2], ['Occasions and readiness', 'when they buy, how far along they are', 2],
    ['Lifestyle, values, personality', 'psychographics, from surveys', 3], ['Benefits sought (needs)', 'from importance ratings', 3],
  ];
  let s = '<svg viewBox="0 0 380 372" xmlns="http://www.w3.org/2000/svg" font-family="inherit" font-size="12.5">'
    + '<defs><marker id="pb-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="var(--ink-3)"/></marker></defs>'
    + '<line x1="14" y1="330" x2="14" y2="30" style="stroke:var(--ink-3);stroke-width:1.5" marker-end="url(#pb-a)"/>'
    + '<text x="4" y="18" font-size="11.5" fill="var(--ink-3)">Easier to measure and reach</text>'
    + '<line x1="366" y1="30" x2="366" y2="330" style="stroke:var(--ink-3);stroke-width:1.5" marker-end="url(#pb-a)"/>'
    + '<text x="376" y="352" text-anchor="end" font-size="11.5" fill="var(--ink-3)">Closer to the reasons people choose</text>';
  items.forEach(([t, sub, colr], i) => {
    const y = 52 + i * 50, x = 34 + i * 14;
    s += `<circle cx="${x}" cy="${y}" r="7" style="fill:var(--series-${colr});fill-opacity:0.6;stroke:var(--ink);stroke-width:0.8"/>`
      + `<text x="${x + 14}" y="${y + 1}" font-weight="600" fill="currentColor">${t}</text>`
      + `<text x="${x + 14}" y="${y + 17}" font-size="11.5" fill="var(--ink-3)">${sub}</text>`;
  });
  return `${s}</svg>`;
})();

export default {
  slug: 'psychographic-and-behavioural',
  title: 'Psychographic and behavioural segmentation',
  blurb: 'People of the same age and postcode can want very different things. Segment instead by how people live and what they value (psychographics), or by what they do and seek: the benefits they want, how much they buy, when and how loyally. Learn why these bases explain choices better than demographics and why they are harder to reach, check the 80/20 claim on Lantern’s heavy coffee drinkers, and use an attitude scale as a segmentation base.',
  status: 'draft',
  objectives: [
    'Describe psychographic bases (lifestyle, values, personality) and the VALS framework in outline, and say how they are measured.',
    'Distinguish the behavioural bases: benefits sought, usage rate, occasions, user and loyalty status, readiness stage and attitude.',
    'Calculate the share of volume or spending that comes from the heaviest buyers, and test the 80/20 claim against data rather than assuming it.',
    'Explain why benefit and needs segmentation explain choices better than demographics, and why such segments are harder to reach.',
    'Use a multi-item attitude scale as a segmentation base, and judge which behaviours it does and doesn’t predict.',
    'Identify the bases used to segment business markets beyond firmographics.',
  ],
  prerequisites: [
    { lesson: 'm05/demographic-and-geographic', why: 'Demographic and geographic bases, cross-tabs with chi-square and Cramér’s V, and the limits of “who” variables.' },
    { lesson: 'm01/influences-on-buying', why: 'Lifestyle, attitudes, motives and the other psychological influences on buying were defined there.' },
    { lesson: 'm04/questionnaire-design', why: 'Psychographic and attitude bases are measured with Likert items and scales, checked with Cronbach’s alpha.' },
    { lesson: 'm01/consumer-decisions', why: 'Involvement and the buying decision process, which readiness stages describe.' },
  ],
  case: 'lantern',

  concept: [
    { case: `Ana’s head barista has a theory: “Our customers aren’t an age group. They’re coffee people. They drink a lot of it, they care where it comes from, and they want to support places like ours.” The theory makes three claims about kinds of people, how much they drink, what they value and how loyal they feel, that the needs study can test. It recorded cups of coffee a week, monthly spend and a three-item scale of loyalty to local, independent businesses for each of the ${N} respondents.` },
    { p: 'The previous lesson showed that demographics describe who buys far better than why. This lesson turns to bases closer to the why. <g>Psychographic segmentation</g> divides a market by how people live and what they are like: their <g>lifestyle</g> (activities, interests and opinions, from M01), their <g>values</g> and their <g>personality</g>. <g>Behavioural segmentation</g> divides it by what people do and seek in the category: the benefits they want, how much they buy, when, how loyally, and how ready they are to buy.' },

    { h: 'Psychographics: how people live and what they value' },
    { p: 'Two people with the same age and income can lead very different lives: one cycles to work, cooks from scratch and reads labels; the other works shifts and grabs whatever is quickest. Psychographics captures that difference. It is measured with statements people rate, such as “I try new foods whenever I can” (an interest) or “Protecting the environment matters more to me than convenience” (a value), combined into scales as M04’s <i>Questionnaire design</i> taught and checked for reliability with <g>Cronbach’s alpha</g>.' },
    { p: 'A long-established commercial psychographic system is VALS, launched by SRI International in 1978, relaunched in a new version in 1989 and offered today by Strategic Business Insights, an SRI spin-off. In SRI’s words, VALS “uses psychology to describe the dynamics underlying consumer preferences and choices”. OpenStax lists its eight US types: Innovators, Thinkers, Achievers, Experiencers, Believers, Strivers, Makers and Survivors. OpenStax’s descriptions place the types by the resources they have, from Innovators with the most to Survivors with the fewest, and by what drives them: knowledge for Thinkers, excelling at work and in the family for Achievers, being different for Experiencers.' },

    { h: 'Behaviour: what people seek and do' },
    { p: 'Behavioural bases come closest to the purchase itself. The most influential is <g>benefit segmentation</g>, named by Russell Haley in 1968: divide buyers by the benefits they seek from the product, because those benefits are the reasons a segment exists. Haley’s illustration was toothpaste, where he described a sensory segment (flavour and appearance), sociables (bright, white teeth), worriers (preventing decay) and an independent, price-led segment. Measuring how important a list of needs is to each buyer and clustering them, as Ana’s study does with eight coffee needs, is the modern form: <g>needs-based segmentation</g>.' },
    { p: 'Other behavioural bases describe the buying itself. <g>Usage rate</g> separates non-users from light, medium and heavy users. Occasions divide buying by when and why it happens: the commuter’s morning cup, the weekend treat, the office meeting.' },
    { p: '<g>User status</g> separates non-users, former users, first-time users and regular users; <g>loyalty status</g> how firmly customers stick to one brand. The <g>buyer-readiness stage</g> places people from unaware, through aware and interested, to intending to buy. And attitude, how people feel about the product or the brand, can be a basis too.' },

    { h: 'Heavy and light coffee drinkers: does 80/20 hold?' },
    { p: `A rule of thumb says that 80% of a business’s revenue comes from the top 20% of its customers; OpenStax states it as the Pareto principle. In Ana’s study, the ${HV.n} respondents who drink 16 or more cups a week, ${p1(HV_SHARE)} of them, account for ${p1(HV.cupShare)} of all the cups the ${N} drink. Ranked by monthly spend instead, the top fifth (the ${FIFTH} who spend most, each at least $${minTopSpend} a month) account for ${p1(topSpendShare)} of spending. Concentrated, yes; 80/20, no. Treat the rule as a pattern to check against data, not as a law.` },
    { table: {
      caption: `Light, medium and heavy coffee drinkers: ${N} respondents, May 2027. Unweighted.`,
      head: ['Usage band (cups a week)', 'Respondents', 'Share of respondents', 'Share of cups', 'Share of spend', 'Spend per head (month)'],
      align: ['l', 'r', 'r', 'r', 'r', 'r'],
      rows: band.map((b) => [b.name, String(b.n), p1(b.n / N), p1(b.cupShare), p1(b.spendShare), money(b.perHead)]),
      foot: [['All', String(N), '100%', '100%', '100%', money(mean(spend))]],
      note: 'Percentages are rounded, so they may not add to exactly 100.',
    } },
    { p: `The table holds a surprise. Heavy drinkers account for ${p1(HV.cupShare)} of the cups but only ${p1(HV.spendShare)} of the spending, the same as their share of respondents: they spend about the same per head as light drinkers (${money(HV.perHead)} against ${money(LT.perHead)} a month; a two-sample t test gives t = ${f2(tHL.t)}, ${pv(tHL.p)}). Across all respondents, cups and spend are uncorrelated (r = ${r2(rCupsSpend)}). Heavy drinkers get many cheap cups at home, from supermarkets and from office machines; light drinkers buy fewer, dearer cups, ${p1(LT.cafe)} of them mainly at cafés against ${p1(HV.cafe)} of heavy drinkers. Whether “heavy” means volume or value changes who the best customers are.` },
    { callout: 'key', title: 'Behavioural bases explain more, and are harder to reach', html: 'Benefits, needs and usage are closer to why and how people buy than age or postcode, so segments built on them differ more in what they want and how they respond. But nobody sells advertising to “people who value sustainability”: such segments must be profiled with variables that can be reached, as module 2’s profiling lesson shows. A business’s own customers are the exception, because their purchases are in its records.' },
  ],

  theory: [
    { h: 'Measuring psychographics' },
    { p: 'Lifestyle is commonly measured with “AIO” statements about activities, interests and opinions, as OpenStax describes. For segmentation the items work best when they are few and targeted at the category: for coffee, attitudes to independent shops, interest in new flavours, concern about sugar. Each scale should hold several items that measure one idea, reach an acceptable Cronbach’s alpha and relate to the behaviour it is meant to explain. Segments are then formed either a priori, by cutting a scale (high, middle and low), or post hoc, by clustering several scales together.' },
    { p: 'Values are not the same as the opinions in an AIO battery. An opinion is a view on a particular topic, such as “organic coffee is overpriced”; a value is a lasting belief about what matters in life, such as “protecting the environment comes first”, which shapes many opinions and choices at once. Questionnaires usually keep the two in separate scales.' },
    { p: 'Psychographics has two known weaknesses. Labels such as “free spirits” are vivid but can promise more than the data show, a risk module 2 returns to when naming segments. And broad personality traits are weak predictors of what people buy: Lastovicka and Joachimsthaler (1988) note that reviews have generally found weak evidence for the belief that consumers choose products to fit their personalities, and argue that part of the reason is unreliable measures of behaviour. Category-specific attitudes and values sit closer to the purchase than general traits, which makes them a more promising place to start.' },
    { p: 'VALS illustrates both the appeal and the limits. Its types are memorable and come with descriptions of how each group shops and what it reads, which helps creative teams. But a VALS type is a classification of a person’s general motivations, not of their needs in a particular category: two Experiencers may want different coffee. Like any psychographic system, it is most useful when the types are shown, with data, to differ in the category being marketed.' },

    { h: 'The behavioural bases in more detail' },
    { p: 'Kotler’s <i>Principles of Marketing</i> (3rd ed., 1986) listed the behavioural variables with their usual breakdowns, and the table follows it, with a coffee example for each.' },
    { table: {
      caption: 'Behavioural segmentation variables (after Kotler’s list) with coffee examples',
      head: ['Variable', 'Typical breakdown', 'Coffee example'],
      rows: [
        ['Occasion', 'Regular occasion, special occasion', 'The morning commute; a weekend treat; meetings at work'],
        ['Benefits sought', 'The benefit that matters most, such as quality, service or economy', 'Taste, a low price, a caffeine kick, low sugar'],
        ['User status', 'Non-user, ex-user, potential user, first-time user, regular user', 'Has never bought Lantern; bought once; buys weekly'],
        ['Usage rate', 'Light, medium, heavy user', 'Cups a week, or dollars a month'],
        ['Loyalty status', 'None, medium, strong, absolute', 'Always buys at the same café; switches freely'],
        ['Readiness stage', 'Unaware, aware, informed, interested, desirous, intending to buy', `${p1(unaware.length / N)} of Ana’s respondents hadn’t heard of Lantern`],
        ['Attitude towards the product', 'Enthusiastic, positive, indifferent, negative, hostile', 'Loves canned coffee; would never drink it'],
      ],
    } },
    { p: `Readiness stage matters because each stage needs a different job from marketing. Of Ana’s ${N} respondents, ${unaware.length} (${p1(unaware.length / N)}) were at the first stage, unaware of Lantern. Of the ${awareOnly.length + bought.length} who knew it, ${awareOnly.length} hadn’t bought it in the past year and ${bought.length} had, a split by user status rather than readiness. Intent to buy Cold Brew (the <g>top-two-box score</g>: definitely or probably would buy) was ${p1(cb2(unaware))} among the unaware against ${p1(cb2(awareOnly))} among aware non-buyers and ${p1(cb2(bought))} among recent buyers: awareness first, then trial, is the obvious order of tasks, though the people who know Lantern may also differ in other ways.` },
    { p: 'Usage rate is the base where the 80/20 claim lives, and it deserves scepticism. Sharp, Romaniuk and Graham (2019), researchers at the Ehrenberg-Bass Institute and London South Bank University, report that a consumer brand’s heaviest 20% of buyers generally contribute not much more than half its sales: in an earlier analysis they cite, the average across categories was 59%, ranging from 44% for hair conditioner to 68% for dog food. The share also depends on the period: in one European panel study it was about 40% over a quarter, 50% over a year and 60% over five years, because a longer window counts more light buyers. The practical lesson is that light buyers usually matter more than the rule suggests, so check the concentration in your own data before deciding to market only to heavy users.' },
    { p: 'Usage also depends on what is counted. Lantern’s heavy drinkers by cups are not heavy by spend, because a cup at home costs a fraction of a café cup. For a café chain, spend is the measure that matters; for a bean supplier, volume might be. The course M06 Customer Analytics and RFM builds this idea into RFM scores and customer lifetime value, which combine how recently, how often and how much customers buy.' },

    { h: 'Why needs explain more, and why they are harder to reach' },
    { p: 'Benefits sought and needs are close to the reason for choice: someone who rates a low price 7 and local 2 will choose differently from someone who rates them the other way round, whatever their age. Haley’s argument was exactly this: segment first on what causes buying, then describe the segments. The cost is that needs are invisible. They exist only in survey answers, so a needs-based segment can’t be found in a census, bought as a media audience or recognised in a shop.' },
    { figure: {
      svg: BASES,
      caption: 'The trade-off between segmentation bases: the closer a base is to why people choose, the harder it usually is to measure and reach. The order is a judgement, not a measurement, and purchase records make behaviour easy to observe for a firm’s own customers.',
      alt: 'Six segmentation bases listed from top to bottom, each a little further to the right, between two arrows: one on the left pointing up, labelled easier to measure and reach, and one on the right pointing down, labelled closer to the reasons people choose. From the top: geographic (region, postcode, climate); demographic (age, life stage, income); usage rate and loyalty status (from purchase records); occasions and readiness (when they buy, how far along they are); lifestyle, values and personality (psychographics, from surveys); and benefits sought, or needs (from importance ratings).',
    } },
    { p: 'Two routes bridge the gap. The first is profiling: once needs-based segments are formed, describe them with <g>descriptor variables</g> that can be reached (age, region, where they buy, which media they use) and target through those, accepting some waste. The second is a typing tool, a few survey questions that assign a new customer to a segment, which module 2 builds for Lantern. For a business’s own customers there is a third: behaviour in purchase records (usage, occasions, loyalty) is both close to why and directly reachable, which is why loyalty-card and online data have made behavioural segmentation so common.' },

    { h: 'An attitude as a base: Lantern’s local-loyalty scale' },
    { p: `The study measured loyalty to local businesses with three <g>Likert items</g> on a 1–5 scale (“${LEVELS.loyal[0]}”, “${LEVELS.loyal[1]}” and “${LEVELS.loyal[2]}”). Their Cronbach’s alpha is ${f2(ALPHA)}, so the items hang together well, and each respondent’s score is the mean of the three, averaging ${f2(D.loyalty.mean)}. The score correlates at ${f2(rLoyalLocal)} with the separate rating of how important it is that coffee comes “from a local, independent business”: two measures of related ideas agreeing, a piece of evidence for the scale’s validity.` },
    { p: `As an a priori base, cut the score into high loyalty (${int(hiBand.length)} respondents scoring 3.67 or more, at least 11 of a possible 15 points), low loyalty (${int(loBand.length)} scoring 2.33 or less) and the middle. The attitude predicts the behaviour that expresses it: ${p1(cafeHi)} of the highly loyal mainly get coffee from cafés against ${p1(cafeLo)} of the least loyal (χ² = ${f1(loyalCafe.stat)}, ${pv(loyalCafe.p)}, V = ${f2(loyalCafe.cramersV)}), and they spend ${money(spendHi)} a month against ${money(spendLo)}. It barely predicts interest in a new canned product: ${p1(cbHi)} of the highly loyal would definitely or probably buy Lantern Cold Brew against ${p1(cbLo)} of the least loyal (${pv(loyalCB.p)}, V = ${f2(loyalCB.cramersV)}).` },
    { p: 'The lesson is general: an attitude base predicts behaviour in proportion to how closely the behaviour expresses the attitude. Loyalty to local businesses is a strong guide to who visits independent cafés and a weak guide to who buys a can in a supermarket, which is exactly the tension Lantern faces in deciding how to sell Cold Brew. Stated attitudes also run ahead of action, the gap M04 warned about with purchase intentions.' },

    { h: 'Business markets' },
    { p: 'In business markets the same ideas work inward from firmographics. OpenStax lists needs-based segmentation (what the customer needs from the product), value-based segmentation, also called tiering, by the value a customer brings from how much, how often and at what value it buys, and behavioural segmentation by how the customer engages with the seller, such as website visits and e-mail responses, often combined with value. In Shapiro and Bonoma’s nested approach, these sit in the inner rings: how the customer organises its buying, the situation of each purchase, and the personal characteristics of the people in the buying centre.' },
  ],

  formulas: [
    { id: 'pb-top-share', name: 'Share of volume (or spend) from the heaviest buyers',
      tex: String.raw`S_q = \dfrac{\sum_{i \in \text{top } q} x_i}{\sum_{i} x_i} \times 100`,
      where: [
        [String.raw`x_i`, 'What buyer i bought in the period: units, cups, visits or dollars', 'units or $'],
        [String.raw`q`, 'The share of buyers counted as heaviest, after ranking all buyers from heaviest to lightest (q = 20% for the 80/20 check)', '%'],
        [String.raw`S_q`, 'Share of the total bought by the heaviest q of buyers', '%'],
      ],
      assumptions: 'Every buyer’s purchases are counted over the same period; buyers who bought nothing are left out (or the share is stated as of all customers, including them).',
      note: 'Excel, with purchases in B2:B641 and a cut-off in F1: <x>=SUMIFS(B2:B641,B2:B641,">="&F1)/SUM(B2:B641)</x>. The share depends on the period: a longer window counts more light buyers and raises S_q.' },
  ],

  examples: [
    { level: 'simple', title: 'Does 80/20 hold at a bakery?', fictional: true,
      setup: `Cairnhaven Bakery has ${int(CB.holders)} loyalty-card holders. Ranked by loaves bought last year, the top ${int(CB.groups[0][0])} bought ${int(CB.groups[0][1])} loaves, the next ${int(CB.groups[1][0])} bought ${int(CB.groups[1][1])} and the remaining ${int(CB.groups[2][0])} bought ${int(CB.groups[2][1])}. What share of loaves did the heaviest 20% buy?`,
      steps: [
        `Find the heaviest 20%: ${int(CB.holders)} × 0.20 = ${int(CB.holders * 0.2)} card holders, the top group.`,
        `Total loaves: ${int(CB.groups[0][1])} + ${int(CB.groups[1][1])} + ${int(CB.groups[2][1])} = ${int(cbTot)}.`,
        `Share: S = ${int(CB.groups[0][1])} ÷ ${int(cbTot)} × 100 = ${f1((CB.groups[0][1] / cbTot) * 100)}%.`,
        `Compare: the heaviest fifth buy ${f1((CB.groups[0][1] / cbTot) * 100)}% of loaves, not 80%; the lightest half buy ${f1((CB.groups[2][1] / cbTot) * 100)}%.`,
      ],
      answer: `The heaviest 20% of card holders bought ${f1((CB.groups[0][1] / cbTot) * 100)}% of the loaves: concentrated, but far from 80/20.`,
      interpretation: 'This is close to the pattern Sharp, Romaniuk and Graham report for consumer brands, about half from the heaviest fifth over a year. A bakery that marketed only to its heaviest buyers would ignore customers who bring over half its sales.' },
    { level: 'challenging', title: 'Benefits or age? Who wants a social swim club', fictional: true,
      setup: `Pinemoor Leisure surveyed ${int(sum(PL.ben.flat()))} members about a new evening social swim club. Members gave the main benefit they seek from membership and their age band, and said whether they would join. Which base, benefit sought or age, separates likely joiners better, and how should Pinemoor reach them?`,
      table: {
        caption: 'Pinemoor Leisure: would join a social swim club, by main benefit sought (fictional)',
        head: ['Main benefit sought', 'Would join', 'Would not', 'Members', 'Share who would join'],
        align: ['l', 'r', 'r', 'r', 'r'],
        rows: PL.benefits.map((b, i) => [b, String(PL.ben[i][0]), String(PL.ben[i][1]), String(sum(PL.ben[i])), p1(plRate(PL.ben[i]))]),
        foot: [['All members', String(sum(PL.ben.map((r) => r[0]))), String(sum(PL.ben.map((r) => r[1]))), String(sum(PL.ben.flat())), p1(sum(PL.ben.map((r) => r[0])) / sum(PL.ben.flat()))]],
      },
      steps: [
        `By benefit: the share who would join runs from ${p1(plRate(PL.ben[3]))} (family activities) and ${p1(plRate(PL.ben[0]))} (fitness) to ${p1(plRate(PL.ben[2]))} (meeting people). χ² = ${f1(PLB.stat)}, ${PLB.df} df, ${pv(PLB.p)}, Cramér’s V = ${f2(PLB.cramersV)}.`,
        `By age (${PL.ages.map((a, i) => `${a}: ${p1(plRate(PL.age[i]))} of ${sum(PL.age[i])}`).join('; ')}): χ² = ${f1(PLA.stat)}, ${PLA.df} df, ${pv(PLA.p)}, V = ${f2(PLA.cramersV)}. Benefit sought is far more strongly associated with joining than age is, and age tells Pinemoor almost nothing.`,
        `Size the segment: the “meeting people” members are ${sum(PL.ben[2])} of ${sum(PL.ben.flat())}, but they supply ${PL.ben[2][0]} of the ${sum(PL.ben.map((r) => r[0]))} likely joiners (${p1(PL.ben[2][0] / sum(PL.ben.map((r) => r[0])))}).`,
        'Reach: a benefit can’t be seen on a membership card, and the social seekers are spread across ages, so age-based promotion would waste most of its reach. But they are members: Pinemoor can ask the benefit question at renewal, or use behaviour it already records, such as attendance at group classes, as a descriptor.',
      ],
      answer: `Benefit sought separates likely joiners far better than age (V = ${f2(PLB.cramersV)} against ${f2(PLA.cramersV)}). Promote the club to members who seek to meet people, found through a renewal question or class attendance, not by age.`,
      interpretation: 'This is Haley’s argument in miniature: the benefit people seek is close to why they would join, and age is not. The work that remains is the one every needs-based segment needs, finding a reachable descriptor, and here a business’s own records make it unusually easy.' },
    { level: 'applied', title: 'Are Lantern’s best prospects heavy, loyal coffee drinkers?', fictional: true,
      setup: 'Test the head barista’s theory that Lantern’s customers “drink a lot, care where it comes from and want to support places like ours”, using cups a week, spend and the local-loyalty scale.',
      steps: [
        `Heavy drinkers: the ${p1(HV_SHARE)} who drink 16 or more cups a week drink ${p1(HV.cupShare)} of the cups but account for only ${p1(HV.spendShare)} of spending, and spend about the same per head as light drinkers (${money(HV.perHead)} against ${money(LT.perHead)}; t = ${f2(tHL.t)}, ${pv(tHL.p)}).`,
        `What heavy drinkers want: they rate convenience (${f2(needMean(HV.g, 'convenience'))} against ${f2(needMean(LT.g, 'convenience'))} for light drinkers) and a caffeine kick (${f2(needMean(HV.g, 'energy'))} against ${f2(needMean(LT.g, 'energy'))}) higher, and local lower (${f2(needMean(HV.g, 'local'))} against ${f2(needMean(LT.g, 'local'))}). That is not a craft café’s customer.`,
        `Loyal locals: the highly loyal (${int(hiBand.length)} respondents) use cafés more (${p1(cafeHi)} against ${p1(cafeLo)}) and spend more (${money(spendHi)} against ${money(spendLo)}) than the least loyal.`,
        `But for Cold Brew the attitude barely matters: top-two intent is ${p1(cbHi)} among the highly loyal and ${p1(cbLo)} among the least loyal (${pv(loyalCB.p)}).`,
      ],
      answer: 'Half right. Loyalty to local businesses does mark valuable café customers; heavy drinking does not, because heavy drinkers buy cheap, convenient cups and care less about local. Neither base on its own identifies Cold Brew’s prospects.',
      interpretation: 'Usage and attitude are useful bases, but each answers a different question: who spends in cafés, who drinks volume, who would try a can. That is the case for forming segments on several needs at once, which module 2 does, rather than on any single behaviour or attitude.' },
  ],

  demo: [
    { widget: 'pb-curve', intro: 'Rank the 640 respondents from heaviest to lightest, once by cups a week and once by monthly spend, and see what share of the total the top 10%, 20% … 50% account for. The third series is what each group would account for if everyone drank or spent the same. Read the Top 20% bars for the 80/20 check, and notice how much closer to equal shares spending is.' },
    { widget: 'pb-sheet', intro: 'The respondents’ cups, spend, main source and three loyalty items as a worksheet. Try a heavy-user share in J2 with <x>=SUMIFS(B2:B641,B2:B641,">="&J1)/SUM(B2:B641)</x>, change the cut-off in J1, build the loyalty score in H2 with <x>=AVERAGE(E2:G2)</x> and fill it down, then count highly loyal café buyers with COUNTIFS.' },
  ],

  mistakes: [
    { title: '“80% of our sales come from 20% of our customers.”', html: `Check it. In Lantern’s study the ${p1(HV_SHARE)} who drink 16 or more cups a week account for ${p1(HV.cupShare)} of cups, and the top fifth by spend for ${p1(topSpendShare)} of spending; Sharp, Romaniuk and Graham find that a consumer brand’s heaviest 20% of buyers usually give not much more than half its sales. The share also grows with the length of the period measured.` },
    { title: '“Heavy users are our most valuable customers.”', html: `Only if “heavy” is measured in what matters to the business. Lantern’s heaviest drinkers by cups spend about the same per head as light drinkers (${money(HV.perHead)} against ${money(LT.perHead)}; t = ${f2(tHL.t)}, ${pv(tHL.p)}), because their cups are cheap ones. Rank by spend or margin when value is the question.` },
    { title: '“A psychographic type tells us what people want from our product.”', html: 'Systems such as VALS classify general motivations and lifestyles, not needs in a category. Show with data that the types differ in your category before building segments on them, and be wary of vivid labels that promise more than the data show.' },
    { title: '“Customers with the right attitude will buy our new product.”', html: `Attitudes predict the behaviours that express them. Lantern’s local-loyalty scale predicts café use and spend, but Cold Brew intent barely differs between its high and low scorers (${p1(cbHi)} against ${p1(cbLo)}). Test the attitude against the behaviour you care about.` },
    { title: '“Needs-based segments are better, so we don’t need demographics.”', html: 'Needs explain choice better, but they can’t be seen or bought as media. Needs-based segments still need demographic, geographic and behavioural descriptors, or a typing tool, before anyone can reach their members.' },
  ],

  application: [
    { case: `Bellwick Grocers, a fictional regional supermarket, runs an online delivery service with about ${int(BG.orders)} orders a year. Freya Lindgren, its customer-insight manager, has been asked why online sales have stopped growing and what to do about it.` },
    { p: `<b>She starts with behaviour she can see.</b> Order data gives every online customer’s usage rate, timing and basket. Grouping orders by occasion shows two patterns: small, frequent top-up orders (${p1(BG.topUp)} of orders) and large weekly shops (${p1(BG.weekly)}), with the rest irregular. Growth has stalled in the weekly shops, while top-ups are rising. Occasion turns out to be a better base than any customer demographic the service holds.` },
    { p: '<b>She checks the 80/20 claim before acting on it.</b> The marketing team wants to concentrate on its heaviest customers. Freya ranks customers by spend over a year and finds that the top fifth account for about half of online sales, not 80%, so she argues against abandoning lighter customers, who are also the main source of new weekly shoppers.' },
    { p: '<b>She adds the why with a short survey.</b> A survey of a sample of customers asks how important each of eight things is: delivery slots, price, substitutions, freshness and so on. Clustering the answers gives needs-based segments that cut across the occasions: some weekly shoppers care most about price, others about reliable slots. Because each surveyed customer is linked to their orders, Freya can describe each needs segment by its order behaviour, which makes the segments reachable through the bank of customers Bellwick already has.' },
    { p: '<b>She recommends what each segment needs.</b> Price-led weekly shoppers get a delivery pass that removes the fee; slot-led ones get guaranteed evening slots; top-up customers get a lower minimum order. Her report states the limits: the survey sample may over-represent engaged customers, and the segments must be re-checked after six months, because occasion and need patterns change with seasons and prices.' },
  ],

  summary: [
    'Psychographic segmentation uses lifestyle (activities, interests, opinions), values and personality, measured with rating scales; VALS, from SRI and now Strategic Business Insights, describes eight US types that differ in resources and in what drives them.',
    'Behavioural segmentation uses benefits sought, usage rate, occasions, user status, loyalty status, readiness stage and attitude towards the product.',
    'Benefit segmentation (Haley, 1968) groups buyers by the benefits they seek, the reasons segments exist; needs-based segmentation is its modern, survey-and-cluster form.',
    'S_q = the heaviest q of buyers’ purchases ÷ all purchases. Check 80/20 against data: in Lantern’s study the 20.8% who drink 16 or more cups a week drink 45.7% of cups, and consumer brands typically get about half their sales from their heaviest 20%.',
    'Volume and value can rank customers differently: Lantern’s heavy drinkers by cups spend about the same per head as light drinkers ($50.34 against $49.25 a month).',
    'Needs and benefits explain choice better than demographics but are harder to reach; profiling with reachable descriptors, typing tools and customers’ own purchase records bridge the gap.',
    'An attitude base predicts the behaviours that express it: Lantern’s local-loyalty scale (alpha 0.86) predicts café use and spend, not Cold Brew intent.',
    'Business markets add needs-based, value-based (tiering) and behavioural bases inside the firmographic rings.',
  ],

  glossary: [
    { term: 'Psychographic segmentation', def: 'Dividing a market by how people live and what they are like: their lifestyle (activities, interests and opinions), values and personality.' },
    { term: 'Values', def: 'A person’s lasting beliefs about what is important or desirable in life, such as security, achievement or protecting the environment, which guide their choices.' },
    { term: 'Personality', def: 'The distinctive and relatively stable pattern of traits that shapes how a person thinks, feels and behaves, such as sociability or openness to new experiences.' },
    { term: 'Behavioural segmentation', def: 'Dividing a market by what people seek and do in the category: the benefits sought, usage rate, occasions, user and loyalty status, readiness stage or attitude towards the product.' },
    { term: 'Benefit segmentation', def: 'Dividing buyers by the benefits they seek from a product, on the view that those benefits are the reasons segments exist; named by Russell Haley in 1968.' },
    { term: 'Needs-based segmentation', def: 'Forming segments from how important different needs or benefits are to each buyer, usually measured with importance ratings and grouped by cluster analysis; a post hoc form of benefit segmentation.' },
    { term: 'Usage rate', def: 'How much of a product a buyer uses or buys in a period, usually banded into non-users and light, medium and heavy users.' },
    { term: 'User status', def: 'A buyer’s relationship to a product or brand as a user: non-user, ex-user, potential user, first-time user or regular user.' },
    { term: 'Loyalty status', def: 'How consistently a buyer sticks to one brand or seller, from no loyalty (switching freely) to absolute loyalty.' },
    { term: 'Buyer-readiness stage', def: 'How far a person has moved towards buying a product: unaware, aware, informed, interested, desirous or intending to buy.' },
  ],

  references: [
    { text: 'Gomez Albrecht, M., Green, M. &amp; Hoffman, L. (2023). <i>Principles of Marketing</i>, section 5.1, “Market Segmentation and Consumer Markets” (psychographic and behavioural segmentation, VALS, usage rate and the Pareto principle). OpenStax.', url: 'https://openstax.org/books/principles-marketing/pages/5-1-market-segmentation-and-consumer-markets', checked: '2026-10-25' },
    { text: 'SRI International. “VALS™ market research” (history: launched 1978, new VALS 1989, now offered by Strategic Business Insights).', url: 'https://www.sri.com/hoi/vals-market-research/', checked: '2026-10-25' },
    { text: 'Haley, R. I. (1968). Benefit segmentation: a decision-oriented research tool. <i>Journal of Marketing</i>, 32(3). doi:10.1177/002224296803200306. Haley’s toothpaste segments as summarised in Weiss, A., “How to Segment Markets”, MarketingProfs.', url: 'https://www.marketingprofs.com/Tutorials/Segmentation1.asp', checked: '2026-10-25' },
    { text: 'Sharp, B., Romaniuk, J. &amp; Graham, C. (2019). <i>Marketing’s 60/20 Pareto Law</i>. Technical report, SSRN (Ehrenberg-Bass Institute and London South Bank University). doi:10.2139/ssrn.3498097.', url: 'https://openresearch.lsbu.ac.uk/item/88vw1', checked: '2026-10-25' },
    { text: 'Kotler, P. (1986). <i>Principles of Marketing</i>, 3rd ed., Table 10-1, “Major segmentation variables for consumer markets”, as reproduced in a University of Washington course handout.', url: 'https://faculty.washington.edu/harryb/courses/INFO%20Course/segmentation.htm', checked: '2026-10-25' },
    { text: 'Lastovicka, J. L. &amp; Joachimsthaler, E. A. (1988). Improving the detection of personality-behavior relationships in consumer research. <i>Journal of Consumer Research</i> (March 1988). doi:10.1086/209138 (abstract checked in the Synapse index).', url: 'https://doi.org/10.1086/209138', checked: '2026-10-25' },
    { text: 'Gomez Albrecht, M., Green, M. &amp; Hoffman, L. (2023). <i>Principles of Marketing</i>, section 5.2, “Segmentation of B2B Markets”. OpenStax.', url: 'https://openstax.org/books/principles-marketing/pages/5-2-segmentation-of-b2b-markets', checked: '2026-10-25' },
  ],

  checks: [
    { what: 'Respondents', value: N, shown: 640 },
    // concentration
    { what: 'Top fifth size', value: FIFTH, shown: 128 },
    { what: 'Top fifth by spend min spend', value: minTopSpend, shown: 70 },
    { what: 'Top fifth by spend share %', value: topSpendShare * 100, shown: 38.6, tol: 0.05 },
    // bands
    { what: 'Light n', value: band[0].n, shown: 151 },
    { what: 'Medium n', value: band[1].n, shown: 356 },
    { what: 'Heavy n', value: band[2].n, shown: 133 },
    { what: 'Light share %', value: (band[0].n / N) * 100, shown: 23.6, tol: 0.05 },
    { what: 'Medium share %', value: (band[1].n / N) * 100, shown: 55.6, tol: 0.05 },
    { what: 'Heavy share %', value: (band[2].n / N) * 100, shown: 20.8, tol: 0.05 },
    { what: 'Light cups %', value: band[0].cupShare * 100, shown: 6.2, tol: 0.05 },
    { what: 'Medium cups %', value: band[1].cupShare * 100, shown: 48.0, tol: 0.05 },
    { what: 'Heavy cups %', value: band[2].cupShare * 100, shown: 45.7, tol: 0.05 },
    { what: 'Light spend %', value: band[0].spendShare * 100, shown: 23.1, tol: 0.05 },
    { what: 'Medium spend %', value: band[1].spendShare * 100, shown: 56.1, tol: 0.05 },
    { what: 'Heavy spend %', value: band[2].spendShare * 100, shown: 20.8, tol: 0.05 },
    { what: 'Light per head', value: band[0].perHead, shown: 49.25 },
    { what: 'Medium per head', value: band[1].perHead, shown: 50.72 },
    { what: 'Heavy per head', value: band[2].perHead, shown: 50.34 },
    { what: 'All per head', value: mean(spend), shown: 50.29 },
    { what: 'Heavy spend share equals respondent share', value: Math.abs(HV.spendShare - HV.n / N) < 0.001 ? 1 : 0, shown: 1 },
    { what: 't heavy vs light', value: tHL.t, shown: 0.31 },
    { what: 'p heavy vs light', value: tHL.p, shown: 0.76 },
    { what: 'Summary: heavy per head', value: HV.perHead, shown: 50.34 },
    { what: 'Summary: light per head', value: LT.perHead, shown: 49.25 },
    { what: 'Summary: heavy share of people %', value: HV_SHARE * 100, shown: 20.8, tol: 0.05 },
    { what: 'Summary: heavy share of cups %', value: HV.cupShare * 100, shown: 45.7, tol: 0.05 },
    { what: 'Aware', value: awareOnly.length + bought.length, shown: 89 },
    { what: 'Panel shares by period (40, 50, 60)', value: 40 + 50 + 60, shown: 150 },
    { what: 'r cups spend', value: rCupsSpend, shown: -0.01 },
    { what: 'Light café %', value: LT.cafe * 100, shown: 39.1, tol: 0.05 },
    { what: 'Heavy café %', value: HV.cafe * 100, shown: 20.3, tol: 0.05 },
    { what: 'Heavy convenience', value: needMean(HV.g, 'convenience'), shown: 5.17 },
    { what: 'Light convenience', value: needMean(LT.g, 'convenience'), shown: 4.08 },
    { what: 'Heavy energy', value: needMean(HV.g, 'energy'), shown: 4.89 },
    { what: 'Light energy', value: needMean(LT.g, 'energy'), shown: 3.68 },
    { what: 'Heavy local', value: needMean(HV.g, 'local'), shown: 3.01 },
    { what: 'Light local', value: needMean(LT.g, 'local'), shown: 4.19 },
    // readiness
    { what: 'Unaware n', value: unaware.length, shown: 551 },
    { what: 'Unaware %', value: (unaware.length / N) * 100, shown: 86.1, tol: 0.05 },
    { what: 'Aware not bought', value: awareOnly.length, shown: 50 },
    { what: 'Bought', value: bought.length, shown: 39 },
    { what: 'CB top-two unaware %', value: cb2(unaware) * 100, shown: 27.4, tol: 0.05 },
    { what: 'CB top-two aware only %', value: cb2(awareOnly) * 100, shown: 40.0, tol: 0.05 },
    { what: 'CB top-two bought %', value: cb2(bought) * 100, shown: 41.0, tol: 0.05 },
    // loyalty
    { what: 'Alpha', value: ALPHA, shown: 0.86 },
    { what: 'Loyalty mean', value: D.loyalty.mean, shown: 3.05 },
    { what: 'Scale mean recomputed', value: mean(score), shown: 3.05 },
    { what: 'r loyalty local', value: rLoyalLocal, shown: 0.52 },
    { what: 'High loyalty n', value: hiBand.length, shown: 205 },
    { what: 'Low loyalty n', value: loBand.length, shown: 193 },
    { what: '11 of 15 points', value: 11 / 3, shown: 3.67 },
    { what: '7 of 15 points', value: 7 / 3, shown: 2.33 },
    { what: 'Café high %', value: cafeHi * 100, shown: 47.3, tol: 0.05 },
    { what: 'Café low %', value: cafeLo * 100, shown: 17.6, tol: 0.05 },
    { what: 'Loyal × café χ²', value: loyalCafe.stat, shown: 40.9, tol: 0.05 },
    { what: 'Loyal × café p < 0.001', value: loyalCafe.p < 0.001 ? 1 : 0, shown: 1 },
    { what: 'Loyal × café V', value: loyalCafe.cramersV, shown: 0.25 },
    { what: 'Spend high', value: spendHi, shown: 59.95 },
    { what: 'Spend low', value: spendLo, shown: 43.91 },
    { what: 'CB high %', value: cbHi * 100, shown: 32.2, tol: 0.05 },
    { what: 'CB low %', value: cbLo * 100, shown: 26.4, tol: 0.05 },
    { what: 'Loyal × CB p', value: loyalCB.p, shown: 0.45 },
    { what: 'Loyal × CB V', value: loyalCB.cramersV, shown: 0.05 },
    // Cairnhaven
    { what: 'CB holders', value: CB.holders, shown: 2000 },
    { what: 'CB top fifth', value: CB.holders * 0.2, shown: 400 },
    { what: 'CB total loaves', value: cbTot, shown: 40000 },
    { what: 'CB top share %', value: (CB.groups[0][1] / cbTot) * 100, shown: 46.0, tol: 0.05 },
    { what: 'CB lightest half %', value: (CB.groups[2][1] / cbTot) * 100, shown: 19.5, tol: 0.05 },
    { what: 'CB over half from the rest', value: 1 - CB.groups[0][1] / cbTot, shown: 0.54 },
    // Pinemoor
    { what: 'PL members', value: sum(PL.ben.flat()), shown: 800 },
    { what: 'PL members by age', value: sum(PL.age.flat()), shown: 800 },
    { what: 'PL joiners', value: sum(PL.ben.map((r) => r[0])), shown: 250 },
    { what: 'PL joiners by age', value: sum(PL.age.map((r) => r[0])), shown: 250 },
    { what: 'PL fitness %', value: plRate(PL.ben[0]) * 100, shown: 15.0, tol: 0.05 },
    { what: 'PL relaxation %', value: plRate(PL.ben[1]) * 100, shown: 32.0, tol: 0.05 },
    { what: 'PL social %', value: plRate(PL.ben[2]) * 100, shown: 70.0, tol: 0.05 },
    { what: 'PL family %', value: plRate(PL.ben[3]) * 100, shown: 20.0, tol: 0.05 },
    { what: 'PL all %', value: 250 / 800 * 100, shown: 31.3, tol: 0.05 },
    { what: 'PL benefit χ²', value: PLB.stat, shown: 147.7, tol: 0.05 },
    { what: 'PL benefit df', value: PLB.df, shown: 3 },
    { what: 'PL benefit V', value: PLB.cramersV, shown: 0.43 },
    { what: 'PL age 18–34 %', value: plRate(PL.age[0]) * 100, shown: 34.0, tol: 0.05 },
    { what: 'PL age 35–54 %', value: plRate(PL.age[1]) * 100, shown: 28.8, tol: 0.05 },
    { what: 'PL age 55+ %', value: plRate(PL.age[2]) * 100, shown: 31.8, tol: 0.05 },
    { what: 'PL age χ²', value: PLA.stat, shown: 1.8, tol: 0.05 },
    { what: 'PL age df', value: PLA.df, shown: 2 },
    { what: 'PL age p', value: PLA.p, shown: 0.40 },
    { what: 'PL age V', value: PLA.cramersV, shown: 0.05 },
    { what: 'PL social share of joiners %', value: (PL.ben[2][0] / 250) * 100, shown: 42.0, tol: 0.05 },
    { what: 'PL expected ≥ 5', value: PLB.minExpected >= 5 && PLA.minExpected >= 5 ? 1 : 0, shown: 1 },
    // Bellwick
    { what: 'BG orders', value: BG.orders, shown: 260000 },
    { what: 'BG top-up %', value: BG.topUp * 100, shown: 58.0, tol: 0.05 },
    { what: 'BG weekly %', value: BG.weekly * 100, shown: 31.0, tol: 0.05 },
    // Sharp et al.
    { what: 'Ehrenberg-Bass average', value: 59, shown: 59 },
  ],
};
