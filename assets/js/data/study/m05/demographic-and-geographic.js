// demographic-and-geographic.js — M05 · Demographic and geographic segmentation. Content only; exercises are in
// demographic-and-geographic.ex.js. Lantern's needs study from case.js (RESPONDENTS, LEVELS, NEEDS, STUDY): region, age,
// household and income against cups, spend and main source, computed here from the respondents (never the k-means
// segments, which module 2 builds). Kestrelton Fitness, Copperwick Books, its supplier's neighbourhood types and Fernhollow
// Travel (with Owen Pryce) are fictional; CACI's Acorn is real and described only from CACI's own pages. Every printed figure
// is recomputed in `checks`.
import { RESPONDENTS, LEVELS, NEEDS, STUDY } from './case.js?v=20';
import * as I from '../../../core/inference.js?v=20';

// ---------------------------------------------------------------- the figures this lesson quotes
const R = RESPONDENTS, N = R.length;
const sum = (a) => a.reduce((s, x) => s + x, 0);
const mean = (a) => sum(a) / a.length;
const median = (a) => { const s = [...a].sort((x, y) => x - y), m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
const J = Object.fromEntries(NEEDS.map((n, j) => [n.key, j]));
const SRC = LEVELS.source;
const by = (k) => LEVELS[k].map((_, l) => R.filter((r) => r[k] === l));
const xtab = (k) => by(k).map((g) => SRC.map((_, s) => g.filter((r) => r.source === s).length));
const AGE = by('age'), AREA = by('area'), INC = by('income'), HH = by('household');
const T_AGE = xtab('age'), T_AREA = xtab('area'), T_INC = xtab('income'), T_HH = xtab('household');
const C_AGE = I.chisqIndependence(T_AGE), C_AREA = I.chisqIndependence(T_AREA), C_INC = I.chisqIndependence(T_INC), C_HH = I.chisqIndependence(T_HH);
const ALL = SRC.map((_, s) => R.filter((r) => r.source === s).length);
const share = (row, s) => row[s] / sum(row);
const A_SPEND_INC = I.anova1(INC.map((g) => g.map((r) => r.spend)));
const A_CUPS_AGE = I.anova1(AGE.map((g) => g.map((r) => r.cups)));
const A_CUPS_HH = I.anova1(HH.map((g) => g.map((r) => r.cups)));
const A_LOCAL_INC = I.anova1(INC.map((g) => g.map((r) => r.needs[J.local])));
const A_NOV_AGE = I.anova1(AGE.map((g) => g.map((r) => r.needs[J.novelty])));
const A_TASTE_INC = I.anova1(INC.map((g) => g.map((r) => r.needs[J.taste])));
const etaBy = (G) => NEEDS.map((_, j) => I.anova1(G.map((g) => g.map((r) => r.needs[j]))).eta2);
const spendInc = INC.map((g) => mean(g.map((r) => r.spend)));
const localInc = INC.map((g) => mean(g.map((r) => r.needs[J.local])));
const top = INC[3], topHiLocal = top.filter((r) => r.needs[J.local] >= 6).length, topLoLocal = top.filter((r) => r.needs[J.local] <= 3).length;
const ageShare = AGE.map((g) => g.length / N), areaShare = AREA.map((g) => g.length / N);

// Kestrelton Fitness (fictional): preferred class time by age band
const KF = { ages: ['18–34', '35–54', '55 and over'], times: ['Early morning', 'Lunchtime', 'Evening'], t: [[60, 40, 200], [120, 90, 190], [110, 70, 70]] };
const KFC = I.chisqIndependence(KF.t);
const kfRow = KF.t.map((row) => row.map((v) => v / sum(row)));
// Copperwick Books (fictional): customers by neighbourhood type from a (fictional) supplier's classification
const CB = {
  types: ['City-centre renters', 'Young families on new estates', 'Established suburban owners', 'Retired village households', 'Student areas'],
  hh: [9000, 12000, 15000, 6000, 4000], cust: [540, 360, 1350, 420, 80], leaflets: 20000,
};
const cbPen = CB.hh.map((h, i) => (CB.cust[i] / h) * 1000);
const cbAll = (sum(CB.cust) / sum(CB.hh)) * 1000;
// Fernhollow Travel (fictional)
const FT = { couples: 41000, bookedRate: 0.012, brochure: 0.65 };

// ---------------------------------------------------------------- formatting
const p1 = (v) => `${(+(v * 100).toPrecision(12)).toFixed(1)}%`;   // toPrecision first, so 28.75 rounds to 28.8
const f1 = (v) => v.toFixed(1), f2 = (v) => v.toFixed(2), f3 = (v) => v.toFixed(3);
const int = (v) => Math.round(v).toLocaleString('en-US');
const money = (v) => `$${v.toFixed(2)}`;
const pv = (p) => (p < 0.001 ? 'p &lt; 0.001' : `p = ${p.toFixed(3)}`);

function sourceFigure() {
  const rows = [...LEVELS.age.map((a, i) => [a, T_AGE[i]]), ['All respondents', ALL]];
  const X0 = 6, BW = 368, T0 = 70, H = 26, G = 44;
  const height = T0 + rows.length * G + 30;
  const fills = [['var(--series-1)', 0.6], ['var(--series-2)', 0.45], ['var(--series-3)', 0.5], ['var(--ink-3)', 0.25]];
  let s = `<svg viewBox="0 0 380 ${height}" xmlns="http://www.w3.org/2000/svg" font-family="inherit" font-size="12" fill="currentColor">`;
  SRC.forEach((label, k) => {
    const x = X0 + (k % 2) * 190, y = 6 + Math.floor(k / 2) * 22;
    s += `<rect x="${x}" y="${y}" width="14" height="14" style="fill:${fills[k][0]};fill-opacity:${fills[k][1]};stroke:var(--ink);stroke-width:0.6"/>`;
    s += `<text x="${x + 20}" y="${y + 12}">${label}</text>`;
  });
  rows.forEach(([name, row], i) => {
    const y = T0 + i * G, n = sum(row);
    let x = X0;
    s += `<text x="${X0}" y="${y - 4}"${i === rows.length - 1 ? ' font-weight="600"' : ''}>${name} (${n})</text>`;
    row.forEach((v, k) => {
      const w = (v / n) * BW;
      s += `<rect x="${x.toFixed(1)}" y="${y}" width="${w.toFixed(1)}" height="${H}" style="fill:${fills[k][0]};fill-opacity:${fills[k][1]};stroke:var(--ink);stroke-width:0.6"/>`;
      if (w > 24) s += `<text x="${(x + w / 2).toFixed(1)}" y="${y + 17}" text-anchor="middle" font-size="11.5">${Math.round((v / n) * 100)}%</text>`;
      x += w;
    });
  });
  s += `<text x="${X0}" y="${height - 8}" font-size="11" fill="var(--ink-3)">Base in brackets. Unweighted.</text>`;
  return `${s}</svg>`;
}

export default {
  slug: 'demographic-and-geographic',
  title: 'Demographic and geographic segmentation',
  blurb: 'Age, household, income and where people live are the oldest bases for segmenting a market, because they are easy to count and to reach. Learn what each variable captures, how geodemographic systems such as Acorn classify neighbourhoods, and how to test with cross-tabs whether a demographic really separates buyers. Lantern’s study shows why demographics describe who buys far better than why.',
  status: 'draft',
  objectives: [
    'Describe the main demographic variables (age, life stage and household, gender, income, occupation, education, ethnicity) and geographic units, and what each can and can’t tell a marketer.',
    'Explain how geodemographic classifications such as CACI’s Acorn assign neighbourhoods to types, and the ecological fallacy that limits them.',
    'Explain why demographic bases are popular (measurable and accessible) and why they rarely explain why people buy.',
    'Analyse a behaviour against a demographic with a cross-tab, the chi-square test and Cramér’s V, and judge the strength of the association, not only its significance.',
    'Calculate and compare penetration rates by area or neighbourhood type to decide where to market.',
  ],
  prerequisites: [
    { lesson: 'm05/why-segment', why: 'Segments, segmentation bases and the five tests of a usable segment are defined there.' },
    { lesson: 'm04/analysing-survey-data', why: 'Cross-tabs percentaged within the explanatory variable, and the base of every figure.' },
    { lesson: 'b04/proportions-and-chi-square', why: 'The chi-square test of independence and Cramér’s V, used here without being derived again.' },
    { lesson: 'm01/influences-on-buying', why: 'Culture, subculture and social class, which several demographic variables stand in for.' },
  ],
  case: 'lantern',

  concept: [
    { case: `Lantern’s media agency has proposed a Cold Brew launch campaign aimed at “adults 25 to 44 in Central Harbour City”, because that is how it buys advertising. Before agreeing, Ana wants to know whether age and region separate coffee drinkers who behave differently. Her needs study records every respondent’s region (Lantern’s five: North, South, East, West and Central), age band, household and income band, alongside how many cups of coffee they drink a week, what they spend on coffee a month and where they mostly get it.` },
    { p: '<g>Demographic segmentation</g> divides a market by characteristics of people: age, life stage and household, gender, income, occupation, education and ethnicity. <g>Geographic segmentation</g> divides it by where people live or buy: country, region, city, neighbourhood, climate, or how urban the area is. OpenStax calls these the “who” and the “where” of segmentation. They are usually the first bases a business tries, and the reasons are practical.' },

    { h: 'The demographic variables' },
    { list: [
      '<b>Age</b> shapes needs through the body (energy, health), through life events and through the products people grew up with. It is usually recorded in bands, as in Ana’s study: 18–29, 30–44, 45–59 and 60 or over.',
      '<b><g>Life stage</g> and household</b>: whether someone lives alone, with a partner, with children or in a shared house changes budgets, time and who influences a purchase, often more than age itself. Ana’s study records single, couple, family with children and sharing.',
      '<b>Gender</b> matters for some categories and not at all for many; asking about it respectfully, with inclusive answer options, and resisting stereotypes are part of doing it well.',
      '<b>Income</b> limits what people can buy. Household income in bands is the usual measure; many people decline to answer, and income is not the same as spending on the category.',
      '<b>Occupation and education</b> relate to income and to <g>social class</g> (M01), and to how and when people buy: a shift worker’s coffee day differs from an office worker’s.',
      '<b>Ethnicity</b>, self-identified, can signal a <g>subculture</g> with preferences of its own (foods, festivals, languages). It calls for particular care: segments should be used to serve people better, never to exclude them.',
    ] },

    { h: 'Geographic units' },
    { p: 'Geography works at every scale. A national brand may segment by region; a café chain by city and neighbourhood; a delivery business by postcode. Climate drives demand for some products (iced coffee sells in heat), and population density decides which channels work: a dense city centre supports cafés on every corner, a rural area needs supermarkets and home delivery. Geography also matters because a business’s own reach is geographic: Lantern can serve only where its cafés, its delivery and its retail listings are.' },

    { h: 'Who drinks coffee where? Lantern’s study' },
    { p: `The figure crosses age with where respondents mostly get their coffee, percentaged within each age band, as M04 taught: the band is the explanatory variable. There are real differences. Respondents aged 60 or over home-brew most (${p1(share(T_AGE[3], 1))}, against ${p1(share(T_AGE[0], 1))} of 18–29s), and 18–29s buy most often from supermarkets or as ready-to-drink cans (${p1(share(T_AGE[0], 2))}). By region, Central respondents use cafés most (${p1(share(T_AREA[4], 0))}, against ${p1(ALL[0] / N)} overall).` },
    { figure: {
      svg: sourceFigure(),
      caption: `Main source of coffee by age band, ${N} respondents: the share of each band by where they mostly get their coffee. Each bar adds to 100%.`,
      alt: `Five horizontal bars, one per age band and one for all respondents, each divided into four parts for café, home-brewed, supermarket or ready-to-drink, and office or vending. 18–29 (${AGE[0].length}): ${T_AGE[0].map((v) => Math.round((v / AGE[0].length) * 100)).join('%, ')}%. 30–44 (${AGE[1].length}): ${T_AGE[1].map((v) => Math.round((v / AGE[1].length) * 100)).join('%, ')}%. 45–59 (${AGE[2].length}): ${T_AGE[2].map((v) => Math.round((v / AGE[2].length) * 100)).join('%, ')}%. 60 and over (${AGE[3].length}): ${T_AGE[3].map((v) => Math.round((v / AGE[3].length) * 100)).join('%, ')}%. All respondents (${N}): ${ALL.map((v) => Math.round((v / N) * 100)).join('%, ')}%. The home-brewed share rises with age; the bars otherwise look broadly similar.`,
    } },
    { p: `Are the differences larger than chance? B04’s chi-square test of independence says yes for age (χ² = ${f1(C_AGE.stat)}, ${C_AGE.df} degrees of freedom, ${pv(C_AGE.p)}) and for region (χ² = ${f1(C_AREA.stat)}, ${C_AREA.df} df, ${pv(C_AREA.p)}). But <g>Cramér’s V</g>, which measures the strength of the association on a scale from 0 to 1, is only ${f2(C_AGE.cramersV)} for age and ${f2(C_AREA.cramersV)} for region: real but modest. Every age band and every region contains plenty of café buyers, home-brewers and can buyers. Household type shows no detectable association with source (${pv(C_HH.p)}).` },
    { p: `Spending and drinking tell the same story. Mean monthly spend is higher in the upper income bands: ${money(spendInc[0])} under $40k, ${money(spendInc[1])} at $40k–80k, ${money(spendInc[2])} at $80k–120k and ${money(spendInc[3])} over $120k, a clear difference (F = ${f1(A_SPEND_INC.F)}, ${pv(A_SPEND_INC.p)}); yet income accounts for only ${p1(A_SPEND_INC.eta2)} of the variation in spend between respondents (η², <g>eta squared</g>: the share of the total sum of squares between the bands). The study finds no evidence that cups a week differ by age band (${pv(A_CUPS_AGE.p)}) or by household (${pv(A_CUPS_HH.p)}).` },
    { callout: 'key', title: 'Demographics describe who, rarely why', html: 'Age, income and region are associated with Lantern’s coffee drinkers’ behaviour, but weakly: within every demographic group there are coffee drinkers of every kind. Demographic groups make poor segments when needs differ inside them. They make excellent <g>descriptor variables</g>, the variables that help find and reach segments formed on something closer to why people buy.' },
  ],

  theory: [
    { h: 'Why demographics are so widely used' },
    { p: 'Demographic and geographic bases pass two of the five tests from <i>Why segment?</i> almost automatically. They are <b>measurable</b>: national censuses count people by age, household and area, so the size of a demographic segment can be estimated without a survey, and a business’s own records often hold its customers’ ages and postcodes. They are <b>accessible</b>: much advertising is planned and bought by audience age, sex and region, and postcodes make direct mail and local media possible. They are also easy to explain and slow to change.' },
    { p: 'They fail most often on <b>differentiable</b>. Russell Haley argued in 1968 that segmentations built on descriptive characteristics of buyers are poor predictors of future buying, because they are associated with buying rather than its cause; France and Ghose’s review reports similar conclusions from later work. A 35-year-old can be a budget home-brewer or a café connoisseur, and age alone can’t tell them apart.' },
    { p: `Lantern’s study shows how mixed a demographic group can be. Respondents with incomes over $120k rate “from a local, independent business” higher on average than those under $40k (${f2(localInc[3])} against ${f2(localInc[0])}), and income explains ${p1(A_LOCAL_INC.eta2)} of the variation in that rating, more than for any other need. Yet of the ${top.length} respondents in the top band, ${topHiLocal} rate local 6 or 7 while ${topLoLocal} rate it 3 or lower. Targeting “high earners” for a craft message would reach about as many people indifferent to it as people who care.` },

    { h: 'Using demographic variables well' },
    { p: '<b>Age, life stage and generation.</b> Record age in bands that match the decision, not round decades by habit. Life stage often explains more than age: a 30-year-old couple and a 30-year-old parent of toddlers have different mornings. A <g>generation</g> is a cohort born in the same span of years; labels such as “millennials” have boundaries that vary between sources. A single survey can’t separate an age effect (people change as they age) from a cohort effect (a generation keeps its habits): the 18–29s’ taste for novelty may or may not last.' },
    { p: '<b>Gender and ethnicity.</b> Ask only when the answer would change a decision, offer inclusive and self-described options, and report differences without turning them into stereotypes. In many countries anti-discrimination law restricts treating customers differently, in prices or access, on grounds such as sex, race or religion, so check the law before a segment defined this way affects what anyone is offered. Used well, these variables help a business serve groups it has overlooked.' },
    { p: '<b>Income, occupation and education.</b> Income in bands is easier to answer than an exact figure, but expect refusals and treat them as missing, not as zero (M04). Household income suits household purchases; personal income suits personal ones. And income measures what people could spend, not what they do spend on the category, which is why Lantern’s spend varies far more within income bands than between them.' },

    { h: 'Geographic segmentation and geodemographics' },
    { p: 'Geographic segments are defined by place: regions, cities, neighbourhoods, climate zones, or urban against rural areas. They are often the natural unit for decisions that are themselves geographic: where to open a café, which shops to sell through, which areas get the leaflet drop. Their limitation is the same as demographics’: the people in one place differ widely.' },
    { p: '<g>Geodemographic segmentation</g> combines the two. It starts from the observation that neighbours tend to resemble one another, classifies every small area into types using census and other data, and describes each type with survey data. CACI’s Acorn, a widely used UK system, assigns each of the 1.6 million UK postcodes to one of 7 categories, 22 groups and 65 types, built from CACI’s address data and the 2021 Census and described with survey data from YouGov, Ipsos FRS and Kantar’s TGI. Businesses use it to profile their customers’ postcodes, to find areas whose profile matches their best customers, and to size markets locally.' },
    { p: 'Geodemographics carries a specific risk, the <g>ecological fallacy</g>: assuming that a characteristic of an area holds for each person in it. A postcode classified as “young families” contains retired couples and students too, and a leaflet sent to every household in it reaches them all. Classifications also age between censuses as areas change. Use the types to choose where to concentrate effort, and measure the response, rather than as a description of each household.' },

    { h: 'Testing a demographic: cross-tabs, chi-square and Cramér’s V' },
    { p: 'The test of a demographic basis is whether the groups differ in something that matters: needs, behaviour or response. For a categorical outcome such as main source, build a <g>cross-tabulation</g> percentaged within each demographic group (M04) and test it with B04’s chi-square test of independence, checking that every expected count is at least 5. For a numerical outcome such as spend, compare the groups’ means with one-way ANOVA (B04) and report η², the share of the variation that lies between the groups.' },
    { p: `Then judge the strength, not only the p-value. With ${N} respondents, small associations are statistically significant: Lantern’s age-by-source table gives ${pv(C_AGE.p)} with V = ${f2(C_AGE.cramersV)}. V has no universal thresholds: B04 gives none, and conventional benchmarks depend on the size of the table (the smaller of r − 1 and c − 1).` },
    { p: `The practical question is better: would the difference change what Lantern offers or where it advertises? A band where ${p1(share(T_AGE[3], 1))} home-brew, against ${p1(ALL[1] / N)} overall, may justify a beans promotion in media that older readers use; it doesn’t make age a segmentation of coffee drinkers. And testing every demographic against every outcome will produce some “significant” results by chance, B04’s multiple-testing problem, so decide the comparisons that matter first.` },
    { p: `Finally, remember where the data came from. Ana’s study is an <g>opt-in panel</g> with quotas on age band, a <g>quota sample</g>, so its age mix (${p1(ageShare[0])} aged 18–29, ${p1(ageShare[3])} aged 60 or over) was set by the quotas, not measured, and its regional mix (${p1(areaShare[4])} Central) needn’t match Harbour City’s. Comparisons between groups inside the sample are more trustworthy than its shares, but even they assume that panel members in each group resemble the coffee drinkers they stand for, which M04’s <i>Sampling methods</i> warned is an assumption, not a fact.` },
  ],

  formulas: [
    { id: 'dg-penetration', name: 'Penetration rate of an area or neighbourhood type',
      tex: String.raw`\text{Penetration} = \dfrac{C_g}{H_g} \times 1{,}000`,
      where: [
        [String.raw`C_g`, 'Customers (or buyers) living in area or neighbourhood type g', 'customers'],
        [String.raw`H_g`, 'Households (or people) in area or type g', 'households'],
        [String.raw`\text{Penetration}`, 'Customers per 1,000 households in g', 'per 1,000'],
      ],
      assumptions: 'Customers and households are counted for the same areas and the same period; customers’ addresses are matched to the classification correctly.',
      note: 'Compare each area’s penetration with the overall rate, total customers ÷ total households × 1,000. Multiplying by 1,000 (or 100 for a percentage) only changes the scale.' },
  ],

  examples: [
    { level: 'simple', title: 'Class times by age at a gym chain', fictional: true,
      setup: `Kestrelton Fitness asked ${int(sum(KF.t.flat()))} members which time they would most like a new class. Does the preferred time differ by age band, and how strongly?`,
      table: {
        caption: 'Kestrelton Fitness: preferred class time by age band (fictional)',
        head: ['Age band', ...KF.times, 'Members'],
        align: ['l', 'r', 'r', 'r', 'r'],
        rows: KF.ages.map((a, i) => [a, ...KF.t[i].map(String), String(sum(KF.t[i]))]),
        foot: [['All members', ...KF.times.map((_, k) => String(sum(KF.t.map((row) => row[k])))), String(sum(KF.t.flat()))]],
      },
      steps: [
        `Percentage within each age band, the explanatory variable: 18–34s ${kfRow[0].map(p1).join(', ')}; 35–54s ${kfRow[1].map(p1).join(', ')}; members 55 and over ${kfRow[2].map(p1).join(', ')} (early morning, lunchtime, evening).`,
        `Read across: two-thirds of 18–34s want an evening class, while members 55 and over split between early morning (${p1(kfRow[2][0])}) and evening (${p1(kfRow[2][2])}).`,
        `Test: every expected count is at least ${f1(KFC.minExpected)}, so the chi-square test applies. χ² = ${f1(KFC.stat)} with ${KFC.df} degrees of freedom, ${pv(KFC.p)}.`,
        `Strength: Cramér’s V = √(${f1(KFC.stat)} ÷ (${sum(KF.t.flat())} × 2)) = ${f2(KFC.cramersV)}, clearly stronger than Lantern’s age-by-source association (${f2(C_AGE.cramersV)}).`,
      ],
      answer: `Preferred time differs by age beyond chance (χ² = ${f1(KFC.stat)}, ${pv(KFC.p)}, V = ${f2(KFC.cramersV)}): evening dominates for 18–34s, while older members are more evenly split.`,
      interpretation: 'Age is a useful a priori basis here because the decision, when to timetable a class, is one that age bands do separate. An early-morning class marketed to members 55 and over, and an evening class to younger members, follows from the table. Even so, plenty of members in every band prefer other times.' },
    { level: 'challenging', title: 'Where to deliver a bookshop’s leaflets', fictional: true,
      setup: `Copperwick Books has matched its ${int(sum(CB.cust))} loyalty-card customers’ postcodes to a data supplier’s classification of its catchment into five neighbourhood types (both fictional). It can afford ${int(CB.leaflets)} leaflets, one per household, to win new customers. Which neighbourhood types should get them?`,
      table: {
        caption: 'Copperwick Books: households and customers by neighbourhood type (fictional)',
        head: ['Neighbourhood type', 'Households', 'Customers'],
        align: ['l', 'r', 'r'],
        rows: CB.types.map((t, i) => [t, int(CB.hh[i]), int(CB.cust[i])]),
        foot: [['Catchment', int(sum(CB.hh)), int(sum(CB.cust))]],
      },
      steps: [
        `Penetration per 1,000 households: ${CB.types.map((t, i) => `${t.toLowerCase()} ${int(CB.cust[i])} ÷ ${int(CB.hh[i])} × 1,000 = ${f1(cbPen[i])}`).join('; ')}. Across the catchment, ${int(sum(CB.cust))} ÷ ${int(sum(CB.hh))} × 1,000 = ${f1(cbAll)}.`,
        `Rank by penetration: established suburban owners (${f1(cbPen[2])}) and retired village households (${f1(cbPen[3])}) are well above the average; city-centre renters (${f1(cbPen[0])}) are at it; young families (${f1(cbPen[1])}) and student areas (${f1(cbPen[4])}) are below.`,
        `Fit the budget: the two strongest types hold ${int(CB.hh[2] + CB.hh[3])} households, ${int(CB.hh[2] + CB.hh[3] - CB.leaflets)} more than the ${int(CB.leaflets)} leaflets. Cover all ${int(CB.hh[2])} suburban households and ${int(CB.leaflets - CB.hh[2])} of the ${int(CB.hh[3])} village ones, choosing the villages nearest the shop.`,
        'Question the logic before printing. High penetration means the shop already does well there, which suggests a good fit but also that many willing buyers are already customers. A low-penetration type, such as young families, may hold untapped demand that a different message (a children’s section) could unlock. And each leaflet reaches a household, not a type: some suburban households will never buy books.',
      ],
      answer: `Leaflet the established suburban owners (${f1(cbPen[2])} customers per 1,000 households) and most of the retired village households (${f1(cbPen[3])}), and consider a separate test for young families rather than ignoring them.`,
      interpretation: 'Geodemographic types make a geographic budget decision easy to reason about, but penetration measures past success, not future response. A sensible plan spends most of the budget where the profile fits and keeps a small test where it doesn’t, then compares the response per 1,000 leaflets.' },
    { level: 'applied', title: 'Should Lantern segment Harbour City by age and region?', fictional: true,
      setup: `Use the needs study (${N} respondents) to judge the agency’s proposal: are age and region good bases for segmenting Lantern’s market, or only useful descriptors?`,
      steps: [
        `Source by age: χ² = ${f1(C_AGE.stat)} (${C_AGE.df} df, ${pv(C_AGE.p)}), V = ${f2(C_AGE.cramersV)}. By region: χ² = ${f1(C_AREA.stat)} (${C_AREA.df} df, ${pv(C_AREA.p)}), V = ${f2(C_AREA.cramersV)}. By income: V = ${f2(C_INC.cramersV)} (${pv(C_INC.p)}). By household: ${pv(C_HH.p)}, no evidence of an association. All the significant associations are weak.`,
        `Spend and cups: income explains ${p1(A_SPEND_INC.eta2)} of the variation in monthly spend; the study finds no evidence that cups a week differ by age or household (${pv(A_CUPS_AGE.p)} and ${pv(A_CUPS_HH.p)}).`,
        `Needs: the strongest demographic link is income with the importance of local (η² = ${f3(A_LOCAL_INC.eta2)}), followed by income with taste (${f3(A_TASTE_INC.eta2)}); age’s strongest link is with novelty (${f3(A_NOV_AGE.eta2)}): 18–29s rate new flavours highest. Even the strongest leaves nearly nine-tenths of the variation within the groups.`,
        'Apply the five tests: age and region are measurable and accessible, but the groups barely differ in behaviour, so they fail differentiable as segments of coffee drinkers.',
      ],
      answer: 'Age and region are weak bases for Lantern: they are associated with where people buy and what they spend, but every age band and region mixes all kinds of coffee drinkers. Use them as descriptors to reach segments formed on needs, not as the segments themselves.',
      interpretation: 'The agency’s “25 to 44 in Central” isn’t wrong as a media buy if the segment Lantern targets turns out to be concentrated there. But that has to be shown after the segments are formed (module 2’s profiling lesson), not assumed before.' },
  ],

  demo: [
    { widget: 'dg-pivot', intro: 'All 640 respondents as a PivotTable. It opens with age band in Rows and main source in Columns, as % of Row Total. Try Region and Income band in Rows; then switch Values to Monthly spend or Cups a week with Average, to compare groups’ means; then filter to one region. Ask of each table whether the groups differ enough to market to differently.' },
  ],

  mistakes: [
    { title: '“The difference is significant, so age is a good segmentation base.”', html: `With hundreds of respondents, weak associations are significant: Lantern’s age-by-source table has ${pv(C_AGE.p)} but V = ${f2(C_AGE.cramersV)}. Judge the strength (V, η², the size of the gaps in percentage points) and whether it would change a decision.` },
    { title: '“High earners want premium, local coffee.”', html: `On average they rate local higher, but ${topLoLocal} of the ${top.length} top-band respondents rate it 3 or lower. An average difference between groups is not a description of every member: test for spread within the group before targeting it.` },
    { title: '“Everyone in a ‘young families’ postcode is a young family.”', html: 'That is the ecological fallacy. A neighbourhood type describes the area’s typical profile, not each household. Use geodemographic types to choose where to concentrate effort, and measure the response.' },
    { title: '“The survey shows that a third of Harbour City’s coffee drinkers are 18–29.”', html: 'The age mix of a quota sample is set by the quotas. Use the sample to compare groups, and take population shares from census data or a probability sample.' },
    { title: '“Income tells us what people spend on coffee.”', html: `Income bounds what people can spend; it explains only ${p1(A_SPEND_INC.eta2)} of the variation in Lantern’s respondents’ monthly coffee spend. Measure category spending directly when it matters.` },
  ],

  application: [
    { case: `Fernhollow Travel, a fictional coach-holiday company, wants to fill its off-season tours. Owen Pryce, its marketing analyst, has the bookings of the last three years and access to census counts and a geodemographic classification for the region.` },
    { p: '<b>He starts with what the business already knows.</b> Matching past bookers’ postcodes and ages shows that retired couples book most off-season tours. That is an a priori demographic segment, and it passes two tests at once: census tables give the number of retired couples in each area (measurable), and the company can reach them by post and through local newspapers (accessible).' },
    { p: `<b>He sizes it before he targets it.</b> The census gives about ${int(FT.couples)} retired couples within reach of the company’s pick-up points (fictional). At last year’s rate of ${p1(FT.bookedRate)} booking an off-season tour, that is about ${int(FT.couples * FT.bookedRate)} couples a year: a substantial segment for a coach company, but one Fernhollow already reaches well.` },
    { p: `<b>He checks whether the demographic explains the behaviour.</b> A short survey of past bookers asks why they chose an off-season tour. ${p1(FT.brochure)} of the retired couples say the lower price, but many mention quieter destinations or a hotel included; younger bookers without children give the same reasons. The demographic describes most of the bookers, but the reasons cut across it, so Owen recommends messages built around the reasons (“quieter, cheaper, all included”) placed in media that reach retired couples first.` },
    { p: '<b>He uses geography for the media plan, with a check.</b> The geodemographic types with the most past bookers per 1,000 households get the brochure drop; two lower-scoring types get a smaller test drop, so the company learns whether it has been missing demand rather than assuming the classification is the whole story.' },
  ],

  summary: [
    'Demographic segmentation divides a market by people’s characteristics (age, life stage and household, gender, income, occupation, education, ethnicity); geographic segmentation by place (region, city, neighbourhood, climate, urban or rural).',
    'They are popular because they are measurable (censuses, customer records) and accessible (media and data are sold by them), and easy to explain.',
    'They describe who buys far better than why: within every demographic group there are buyers of every kind, so they often fail the differentiable test as segments, while making excellent descriptors.',
    'Geodemographic systems such as CACI’s Acorn classify every postcode into types (Acorn: 7 categories, 22 groups, 65 types); beware the ecological fallacy of treating an area’s type as each household’s.',
    'Test a demographic with a cross-tab percentaged within the group, B04’s chi-square test and Cramér’s V, or ANOVA and η² for a numerical outcome; judge strength and usefulness, not only the p-value.',
    'Penetration = customers ÷ households × 1,000 compares areas or neighbourhood types; it measures past success, not future response.',
    'In Lantern’s study, age, region and income are associated with where people buy and what they spend, but weakly (V about 0.10–0.14; income explains under 7% of spend).',
  ],

  glossary: [
    { term: 'Demographic segmentation', def: 'Dividing a market by characteristics of people such as age, life stage and household, gender, income, occupation, education and ethnicity.' },
    { term: 'Geographic segmentation', def: 'Dividing a market by place: country, region, city, neighbourhood, climate or how urban an area is.' },
    { term: 'Life stage', def: 'A person’s position in the course of life as shaped by household and family, such as living alone, living with a partner, raising children or retired; it often explains needs better than age alone.' },
    { term: 'Generation', def: 'A cohort of people born in the same span of years, such as those born in the 1980s; the boundaries of named generations vary between sources.' },
    { term: 'Geodemographic segmentation', def: 'Classifying small areas, such as postcodes, into types of neighbourhood using census and other data, and describing each type with survey data, on the principle that neighbours tend to resemble one another.' },
    { term: 'Ecological fallacy', def: 'The error of assuming that a characteristic of a group or area, such as a neighbourhood’s geodemographic type or average income, holds for each individual in it.' },
    { term: 'Penetration rate', def: 'The number of a business’s customers in an area or group per 1,000 (or per 100) households or people there; it compares how well the business has done in different areas.' },
  ],

  references: [
    { text: 'Gomez Albrecht, M., Green, M. &amp; Hoffman, L. (2023). <i>Principles of Marketing</i>, section 5.1, “Market Segmentation and Consumer Markets” (geographic, demographic, psychographic and behavioural segmentation). OpenStax.', url: 'https://openstax.org/books/principles-marketing/pages/5-1-market-segmentation-and-consumer-markets', checked: '2026-10-25' },
    { text: 'CACI. “What is Acorn?” (postcodes, categories, groups and types; data sources and uses).', url: 'https://acorn.caci.co.uk/what-is-acorn', checked: '2026-10-25' },
    { text: 'CACI. “How Acorn works.”', url: 'https://acorn.caci.co.uk/how-acorn-works/', checked: '2026-10-25' },
    { text: 'Haley, R. I. (1968). Benefit segmentation: a decision-oriented research tool. <i>Journal of Marketing</i>, 32(3). doi:10.1177/002224296803200306 (abstract: descriptive characteristics of buyers are poor predictors of future buying).', url: 'https://doi.org/10.1177/002224296803200306', checked: '2026-10-25' },
    { text: 'France, S. L. &amp; Ghose, S. (2019). Marketing analytics: methods, practice, implementation, and links to other fields. <i>Expert Systems with Applications</i>; preprint arXiv:1801.09185 (section 4 on segmentation bases).', url: 'https://arxiv.org/abs/1801.09185', checked: '2026-10-25' },
  ],

  checks: [
    { what: 'Respondents', value: N, shown: 640 },
    { what: 'Regions', value: LEVELS.area.length, shown: 5 },
    // the figure and source cross-tabs
    { what: '60+ home-brewed %', value: share(T_AGE[3], 1) * 100, shown: 45.9, tol: 0.05 },
    { what: '18–29 home-brewed %', value: share(T_AGE[0], 1) * 100, shown: 19.4, tol: 0.05 },
    { what: '18–29 supermarket or RTD %', value: share(T_AGE[0], 2) * 100, shown: 33.5, tol: 0.05 },
    { what: 'Central café %', value: share(T_AREA[4], 0) * 100, shown: 39.5, tol: 0.05 },
    { what: 'Café overall %', value: (ALL[0] / N) * 100, shown: 31.9, tol: 0.05 },
    { what: 'Home-brewed overall %', value: (ALL[1] / N) * 100, shown: 28.75, tol: 0.06 },
    { what: 'Age bases', value: AGE.map((g) => g.length).join() === '206,200,149,85' ? 1 : 0, shown: 1 },
    { what: 'Age χ²', value: C_AGE.stat, shown: 29.6, tol: 0.05 },
    { what: 'Age df', value: C_AGE.df, shown: 9 },
    { what: 'Age p < 0.001', value: C_AGE.p < 0.001 ? 1 : 0, shown: 1 },
    { what: 'Age V', value: C_AGE.cramersV, shown: 0.12 },
    { what: 'Region χ²', value: C_AREA.stat, shown: 36.9, tol: 0.05 },
    { what: 'Region df', value: C_AREA.df, shown: 12 },
    { what: 'Region p < 0.001', value: C_AREA.p < 0.001 ? 1 : 0, shown: 1 },
    { what: 'Region V', value: C_AREA.cramersV, shown: 0.14 },
    { what: 'Income V', value: C_INC.cramersV, shown: 0.10 },
    { what: 'Income p', value: C_INC.p, shown: 0.027, tol: 0.0005 },
    { what: 'Household p', value: C_HH.p, shown: 0.258, tol: 0.0005 },
    { what: 'Expected counts at least 5', value: Math.min(C_AGE.minExpected, C_AREA.minExpected, C_INC.minExpected, C_HH.minExpected) >= 5 ? 1 : 0, shown: 1 },
    // spend and cups
    { what: 'Spend under $40k', value: spendInc[0], shown: 41.62 },
    { what: 'Spend $80k–120k', value: spendInc[2], shown: 60.35 },
    { what: 'Spend by income F', value: A_SPEND_INC.F, shown: 15.0, tol: 0.05 },
    { what: 'Spend by income p < 0.001', value: A_SPEND_INC.p < 0.001 ? 1 : 0, shown: 1 },
    { what: 'Spend by income η² %', value: A_SPEND_INC.eta2 * 100, shown: 6.6, tol: 0.05 },
    { what: 'Cups by age p', value: A_CUPS_AGE.p, shown: 0.348, tol: 0.0005 },
    { what: 'Cups by household p', value: A_CUPS_HH.p, shown: 0.919, tol: 0.0005 },
    // local by income
    { what: 'Local, over $120k', value: localInc[3], shown: 4.52 },
    { what: 'Local, under $40k', value: localInc[0], shown: 3.25 },
    { what: 'Local by income η² %', value: A_LOCAL_INC.eta2 * 100, shown: 11.0, tol: 0.05 },
    { what: 'Local by income η²', value: A_LOCAL_INC.eta2, shown: 0.110, tol: 0.0005 },
    { what: 'Novelty by age η²', value: A_NOV_AGE.eta2, shown: 0.062, tol: 0.0005 },
    { what: 'Taste by income η²', value: A_TASTE_INC.eta2, shown: 0.096, tol: 0.0005 },
    { what: 'Taste is second for income', value: [...etaBy(INC)].sort((a, b) => b - a)[1] === A_TASTE_INC.eta2 ? 1 : 0, shown: 1 },
    { what: 'Novelty is age’s strongest need', value: Math.max(...etaBy(AGE)) === A_NOV_AGE.eta2 ? 1 : 0, shown: 1 },
    { what: 'Spend $40k–80k', value: spendInc[1], shown: 45.42 },
    { what: 'Spend over $120k', value: spendInc[3], shown: 56.45 },
    { what: 'Local η² is the largest for income', value: NEEDS.every((_, j) => I.anova1(INC.map((g) => g.map((r) => r.needs[j]))).eta2 <= A_LOCAL_INC.eta2) ? 1 : 0, shown: 1 },
    { what: 'Novelty highest among 18–29s', value: AGE.every((g) => mean(g.map((r) => r.needs[J.novelty])) <= mean(AGE[0].map((r) => r.needs[J.novelty]))) ? 1 : 0, shown: 1 },
    { what: 'Top income band n', value: top.length, shown: 97 },
    { what: 'Top band local 6–7', value: topHiLocal, shown: 37 },
    { what: 'Top band local ≤ 3', value: topLoLocal, shown: 36 },
    { what: 'Nearly nine-tenths within groups', value: 1 - A_LOCAL_INC.eta2, shown: 0.89, tol: 0.01 },
    // sample shares
    { what: '18–29 share %', value: ageShare[0] * 100, shown: 32.2, tol: 0.05 },
    { what: '60+ share %', value: ageShare[3] * 100, shown: 13.3, tol: 0.05 },
    { what: 'Central share %', value: areaShare[4] * 100, shown: 26.9, tol: 0.05 },
    // Kestrelton
    { what: 'KF members', value: sum(KF.t.flat()), shown: 950 },
    { what: 'KF 18–34 early %', value: kfRow[0][0] * 100, shown: 20.0, tol: 0.05 },
    { what: 'KF 18–34 lunch %', value: kfRow[0][1] * 100, shown: 13.3, tol: 0.05 },
    { what: 'KF 18–34 evening %', value: kfRow[0][2] * 100, shown: 66.7, tol: 0.05 },
    { what: 'KF 35–54 early %', value: kfRow[1][0] * 100, shown: 30.0, tol: 0.05 },
    { what: 'KF 35–54 lunch %', value: kfRow[1][1] * 100, shown: 22.5, tol: 0.05 },
    { what: 'KF 35–54 evening %', value: kfRow[1][2] * 100, shown: 47.5, tol: 0.05 },
    { what: 'KF 55+ early %', value: kfRow[2][0] * 100, shown: 44.0, tol: 0.05 },
    { what: 'KF 55+ lunch %', value: kfRow[2][1] * 100, shown: 28.0, tol: 0.05 },
    { what: 'KF 55+ evening %', value: kfRow[2][2] * 100, shown: 28.0, tol: 0.05 },
    { what: 'KF two-thirds', value: kfRow[0][2], shown: 0.667, tol: 0.001 },
    { what: 'KF min expected', value: KFC.minExpected, shown: 52.6, tol: 0.05 },
    { what: 'KF χ²', value: KFC.stat, shown: 82.6, tol: 0.05 },
    { what: 'KF df', value: KFC.df, shown: 4 },
    { what: 'KF V', value: KFC.cramersV, shown: 0.21 },
    { what: 'KF V by hand', value: Math.sqrt(82.6 / (950 * 2)), shown: 0.21 },
    // Copperwick
    { what: 'CB customers', value: sum(CB.cust), shown: 2750 },
    { what: 'CB households', value: sum(CB.hh), shown: 46000 },
    { what: 'CB pen renters', value: cbPen[0], shown: 60.0, tol: 0.05 },
    { what: 'CB pen families', value: cbPen[1], shown: 30.0, tol: 0.05 },
    { what: 'CB pen suburban', value: cbPen[2], shown: 90.0, tol: 0.05 },
    { what: 'CB pen village', value: cbPen[3], shown: 70.0, tol: 0.05 },
    { what: 'CB pen students', value: cbPen[4], shown: 20.0, tol: 0.05 },
    { what: 'CB pen all', value: cbAll, shown: 59.8, tol: 0.05 },
    { what: 'CB top two households', value: CB.hh[2] + CB.hh[3], shown: 21000 },
    { what: 'CB over budget', value: CB.hh[2] + CB.hh[3] - CB.leaflets, shown: 1000 },
    { what: 'CB village leaflets', value: CB.leaflets - CB.hh[2], shown: 5000 },
    // Fernhollow
    { what: 'FT couples', value: FT.couples, shown: 41000 },
    { what: 'FT rate %', value: FT.bookedRate * 100, shown: 1.2, tol: 0.05 },
    { what: 'FT couples booking', value: FT.couples * FT.bookedRate, shown: 492 },
    { what: 'FT price reason %', value: FT.brochure * 100, shown: 65.0, tol: 0.05 },
    { what: 'Study n', value: STUDY.n, shown: 640 },
  ],
};
