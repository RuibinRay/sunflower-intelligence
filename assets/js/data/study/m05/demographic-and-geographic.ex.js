// demographic-and-geographic.ex.js — M05 · Demographic and geographic segmentation: widgets, practice and the knowledge
// check (answer keys live here). Lantern's 640 respondents come from case.js (RESPONDENTS, LEVELS). Text columns don't
// change on the marker's test copies, so formula items that count text labels `vary` a label cell. Rookhaven Pet
// Supplies, the hotel group, the insurer, the ice-cream maker and the other businesses named here are fictional. Every num
// item's `check` recomputes its answer.
import { RESPONDENTS, LEVELS } from './case.js?v=19';
import * as I from '../../../core/inference.js?v=19';

const R = RESPONDENTS, N = R.length, L = N + 1;                 // data rows 2..641
const sum = (a) => a.reduce((s, x) => s + x, 0);
const mean = (a) => sum(a) / a.length;
const int = (v) => Math.round(v).toLocaleString('en-US');
const p1 = (v) => `${(+(v * 100).toPrecision(12)).toFixed(1)}%`;   // toPrecision first, so 28.75 rounds to 28.8
const col = (letter, from, values) => Object.fromEntries(values.map((v, i) => [`${letter}${from + i}`, v]));
const SRC = LEVELS.source;

// ---------------------------------------------------------------- widgets
const records = R.map((r) => ({
  Region: LEVELS.area[r.area], 'Age band': LEVELS.age[r.age], Household: LEVELS.household[r.household], 'Income band': LEVELS.income[r.income],
  'Main source': SRC[r.source], 'Knows Lantern': r.aware ? 'Yes' : 'No',
  Respondents: 1, 'Cups a week': r.cups, 'Monthly spend ($)': r.spend,
}));

export const widgets = {
  'dg-pivot': {
    type: 'pivot', title: 'Lantern’s needs study: 640 Harbour City coffee drinkers, May 2027',
    records,
    fields: ['Age band', 'Region', 'Income band', 'Household', 'Main source', 'Knows Lantern'],
    values: ['Respondents', 'Cups a week', 'Monthly spend ($)'],
    defaults: { rows: 'Age band', cols: 'Main source', value: 'Respondents', agg: 'sum', show: 'pct-row' },
    order: { 'Age band': LEVELS.age, Region: LEVELS.area, 'Income band': LEVELS.income, Household: LEVELS.household, 'Main source': SRC, 'Knows Lantern': ['Yes', 'No'] },
    formats: { 'Cups a week': '0.0', 'Monthly spend ($)': '$#,##0.00' },
    note: 'Respondents is 1 for each person, so its Sum counts them and % of Row Total percentages each row within its group, the M04 rule when the row field is the explanatory variable. With Average of Monthly spend ($) the table compares groups’ mean spend: income bands differ by up to about $19 a month, while the respondents within any band range from a few dollars to well over $100.',
  },
};

// ---------------------------------------------------------------- guided practice
const regionSheet = (() => {
  const cells = { A1: 'respondent', B1: 'region', C1: 'main_source', E1: 'region', F1: 'café respondents', G1: 'café share' };
  R.forEach((r, i) => { cells[`A${i + 2}`] = r.id; cells[`B${i + 2}`] = LEVELS.area[r.area]; cells[`C${i + 2}`] = SRC[r.source]; });
  return { ...cells, ...col('E', 2, LEVELS.area) };
})();
const cafeBy = LEVELS.area.map((_, l) => R.filter((r) => r.area === l && r.source === 0).length);
const nBy = LEVELS.area.map((_, l) => R.filter((r) => r.area === l).length);
const CA = I.chisqIndependence(LEVELS.area.map((_, l) => SRC.map((__, s) => R.filter((r) => r.area === l && r.source === s).length)));
const HOTEL = { chi: 48.0, n: 1200, r: 4, c: 3 };
const hotelV = Math.sqrt(HOTEL.chi / (HOTEL.n * Math.min(HOTEL.r - 1, HOTEL.c - 1)));

export const guided = [
  {
    id: 'm05-dg-g1', type: 'steps', kind: 'applied',
    prompt: 'Does café buying differ by region? Column B holds each respondent’s region and column C where they mostly get their coffee.',
    solution: `<x>=COUNTIFS($B$2:$B$641,E2,$C$2:$C$641,"Café")</x> filled down gives ${cafeBy.join(', ')} for North, South, East, West and Central; <x>=F2/COUNTIF($B$2:$B$641,E2)</x> gives ${cafeBy.map((c, l) => p1(c / nBy[l])).join(', ')}. Central leads, but the full region-by-source table has V = ${CA.cramersV.toFixed(2)}: a real but weak association.`,
    steps: [
      {
        id: 'm05-dg-g1-s1', type: 'formula',
        prompt: 'In F2, count the respondents from the region in E2 whose main source is “Café”, in a formula that can be filled down to F6.',
        sheet: { cells: regionSheet, vary: { E2: ['South', 'West'] } },
        cell: 'F2', fill: 'F2:F6', answer: `=COUNTIFS($B$2:$B$${L},E2,$C$2:$C$${L},"Café")`,
        alt: [`=COUNTIFS($C$2:$C$${L},"Café",$B$2:$B$${L},E2)`, `=SUMPRODUCT(($B$2:$B$${L}=E2)*($C$2:$C$${L}="Café"))`],
        view: `A1:G${L}`, widths: { A: 11, B: 10, C: 20, E: 10, F: 16, G: 12 }, maxHeight: '22rem',
        wrong: [
          { formula: `=COUNTIFS(B2:B${L},E2,C2:C${L},"Café")`, say: 'Without $ the ranges slide down as you fill, so lower rows miss the first respondents. Fix them: $B$2:$B$641 and $C$2:$C$641.' },
          { formula: `=COUNTIF($C$2:$C$${L},"Café")`, say: 'That counts café buyers in every region, the same 204 in each row. Add the region criterion with COUNTIFS.' },
          { formula: `=COUNTIF($B$2:$B$${L},E2)`, say: 'That counts all the region’s respondents, the base. Add the second criterion: main source is “Café”.' },
        ],
        hints: ['Two criteria: the region in E2 and the source “Café”.', '<x>=COUNTIFS($B$2:$B$641,E2,$C$2:$C$641,"Café")</x>.'],
      },
      {
        id: 'm05-dg-g1-s2', type: 'formula',
        prompt: 'The counts are now in F2:F6. In G2, show the café respondents as a share of all respondents in the region in E2, in a formula that can be filled down to G6.',
        sheet: { cells: { ...regionSheet, ...col('F', 2, LEVELS.area.map((_, i) => `=COUNTIFS($B$2:$B$${L},E${i + 2},$C$2:$C$${L},"Café")`)) }, vary: { E2: ['South', 'West'] } },
        cell: 'G2', fill: 'G2:G6', answer: `=F2/COUNTIF($B$2:$B$${L},E2)`,
        alt: [`=F2/COUNTIFS($B$2:$B$${L},E2)`],
        view: `A1:G${L}`, formats: { G: '0.0%' }, widths: { A: 11, B: 10, C: 20, E: 10, F: 16, G: 12 }, maxHeight: '22rem',
        wrong: [
          { formula: `=F2/COUNTA($B$2:$B$${L})`, say: 'Dividing by all 640 respondents gives each region’s café buyers as a share of everyone, which mixes region size with café use. Percentage within the region: divide by its own respondents.' },
          { formula: '=F2/SUM($F$2:$F$6)', say: 'That is each region’s share of all café buyers, a column percentage. To compare regions, divide by each region’s own respondents.' },
          { formula: `=F2/COUNTIF(B2:B${L},E2)`, say: 'Without $ the range slides as you fill. Lock it: $B$2:$B$641.' },
        ],
        hints: ['Percentage within the explanatory variable: the region is the base.', 'Divide by the number of respondents in the region: <x>COUNTIF($B$2:$B$641,E2)</x>.'],
      },
      {
        id: 'm05-dg-g1-s3', type: 'mc',
        prompt: `The full region-by-source table gives χ² = ${CA.stat.toFixed(1)} with ${CA.df} degrees of freedom, p < 0.001, and Cramér’s V = ${CA.cramersV.toFixed(2)}. What should Ana conclude?`,
        options: [
          'Region is associated with where people buy coffee, but weakly: every region mixes all kinds of buyer',
          'Region strongly determines where people buy coffee, so each of the five regions needs a different marketing plan',
          'There is no association: a V of 0.14 is too small to differ from zero',
          'Region matters little overall, but Central’s café buyers form a segment of their own, to target with café offers',
        ],
        answer: 0,
        feedback: {
          1: 'A p-value below 0.001 shows the association is unlikely to be chance; V of 0.14 shows it is weak. Strength, not significance, says how different the regions are.',
          2: 'The chi-square test says the association is real (p < 0.001); V measures how strong it is, and 0.14 is weak, not zero.',
          3: 'Even in Central, three in five respondents mainly get coffee elsewhere. A region is a place to concentrate café marketing, not a segment of café buyers.',
        },
        hints: ['The p-value and V answer different questions.', 'V runs from 0 (no association) to 1 (complete association).'],
      },
    ],
  },
  {
    id: 'm05-dg-g2', type: 'classify', kind: 'conceptual',
    prompt: 'Classify each variable as a segmentation base.',
    items: [
      'Household income band',
      'The climate zone a customer lives in',
      'The neighbourhood type assigned to a customer’s postcode by a classification built from census data',
      'Whether the household includes children under 5',
      'Population density of the customer’s district',
      'How strongly the customer agrees that “I prefer independent shops”',
    ],
    categories: ['Demographic', 'Geographic', 'Geodemographic', 'Neither: a psychographic or attitudinal base'],
    answer: [0, 1, 2, 0, 1, 3],
    feedback: {
      0: 'Income is a characteristic of the person or household: demographic.',
      1: 'Climate describes the place: geographic.',
      2: 'A postcode classified into a neighbourhood type combines place and demographics: geodemographic.',
      3: 'Household composition, the life stage, is demographic.',
      4: 'Density describes the place: geographic.',
      5: 'A general attitude like this is psychographic; attitude towards a particular product is listed among the behavioural bases in the next lesson.',
    },
    hints: ['Demographic: about the person or household. Geographic: about the place.', 'Geodemographic: a type assigned to an area from data about the people who live there.'],
    solution: 'Demographic: income band and children under 5 (life stage). Geographic: climate zone and population density. Geodemographic: the postcode’s neighbourhood type. The preference for independent shops is an attitude, a psychographic base.',
  },
  {
    id: 'm05-dg-g3', type: 'num', kind: 'numerical',
    prompt: `A hotel group (fictional) crossed guests’ age band (${HOTEL.r} bands) with how they booked (${HOTEL.c} channels) for ${int(HOTEL.n)} guests and found χ² = ${HOTEL.chi.toFixed(1)}. What is Cramér’s V? Give three decimal places.`,
    answer: Math.round(hotelV * 1000) / 1000, check: () => Math.sqrt(48 / (1200 * Math.min(4 - 1, 3 - 1))), unit: '', places: 3, tol: 0.002,
    wrong: [
      { value: Math.round(Math.sqrt(48 / (1200 * 3)) * 1000) / 1000, say: 'You used min(r, c) = 3. Cramér’s V divides by n × min(r − 1, c − 1): here min(3, 2) = 2.' },
      { value: Math.round((48 / 2400) * 1000) / 1000, say: 'That is V², 0.020. Take the square root.' },
      { value: Math.round(Math.sqrt(48 / 1200) * 1000) / 1000, say: 'That leaves out min(r − 1, c − 1), which is 2 for a 4 × 3 table.' },
    ],
    hints: ['V = √(χ² ÷ (n × min(r − 1, c − 1))), from B04.', 'min(4 − 1, 3 − 1) = 2, so V = √(48 ÷ 2,400).'],
    solution: `V = √(48.0 ÷ (1,200 × 2)) = √0.020 ≈ ${hotelV.toFixed(3)}. The association between age and booking channel is weak, though with 1,200 guests it is highly significant.`,
  },
  {
    id: 'm05-dg-g4', type: 'mc', kind: 'applied',
    prompt: 'Ana’s study recruited from an opt-in panel with quotas on age band: 32.2% of respondents are aged 18–29. A colleague writes: “A third of Harbour City’s coffee drinkers are under 30.” What is wrong with the claim?',
    options: [
      'The age mix was fixed by the quotas, so it can’t estimate the population’s age mix',
      'The figure is right but should be rounded to 32% to avoid suggesting false precision',
      'The 18–29 band is too wide; the claim would only hold for a narrower band such as 18–24',
      'An opt-in panel over-represents young people, so the true share must be smaller',
    ],
    answer: 0,
    feedback: {
      1: 'Rounding doesn’t help: the share was set by the panel company’s quotas, not measured in the population.',
      2: 'The band width isn’t the issue; any age share in a quota sample reflects the quotas.',
      3: 'We don’t know the direction of any error; with quotas the sample’s age mix reflects the quota targets, not a measurement of the population.',
    },
    hints: ['What did the quotas control?', 'Where would a population share of age come from instead?'],
    solution: 'In a quota sample the numbers in each age band are set by the quotas, so the sample’s age shares describe the design, not the population. Take population shares from census data or a probability sample, and use the panel to compare groups.',
  },
];

// ---------------------------------------------------------------- on your own
// Rookhaven Pet Supplies (fictional): home-delivery customers by area type
const RP = { types: ['Inner-city flats', 'Terraced streets', 'Suburban houses', 'Rural villages'], hh: [18000, 22000, 30000, 10000], cust: [270, 550, 1200, 180] };
const rpPen = RP.hh.map((h, i) => (RP.cust[i] / h) * 1000);
const rpAll = (sum(RP.cust) / sum(RP.hh)) * 1000;
const incomeSheet = (() => {
  const cells = { A1: 'respondent', B1: 'income_band', C1: 'spend_month', E1: 'income band', F1: LEVELS.income[2], E2: 'mean monthly spend' };
  R.forEach((r, i) => { cells[`A${i + 2}`] = r.id; cells[`B${i + 2}`] = LEVELS.income[r.income]; cells[`C${i + 2}`] = r.spend; });
  return cells;
})();
const spendIn = (band) => mean(R.filter((r) => LEVELS.income[r.income] === band).map((r) => r.spend));
const AS = I.anova1(LEVELS.income.map((_, l) => R.filter((r) => r.income === l).map((r) => r.spend)));

export const independent = [
  {
    id: 'm05-dg-i1', type: 'num', kind: 'numerical',
    prompt: `Rookhaven Pet Supplies (fictional) delivers pet food to homes. Its customers by area type: ${RP.types.map((t, i) => `${t.toLowerCase()} ${int(RP.cust[i])} of ${int(RP.hh[i])} households`).join('; ')}. What is the penetration rate in terraced streets, in customers per 1,000 households? Give one decimal place.`,
    answer: Math.round(rpPen[1] * 10) / 10, check: () => (550 / 22000) * 1000, unit: 'per 1,000', places: 1, tol: 0.06,
    wrong: [
      { value: Math.round((550 / sum(RP.cust)) * 1000 * 10) / 10, say: 'That divides by all customers: the terraced streets’ share of the customer base. Penetration divides customers by the area’s households.' },
      { value: Math.round((22000 / 550) * 10) / 10, say: 'The division is upside down: customers ÷ households, then × 1,000.' },
      { value: Math.round((550 / 22000) * 100 * 10) / 10, say: 'That is per 100 households, a percentage (2.5%). The question asks per 1,000.' },
    ],
    solution: `550 ÷ 22,000 × 1,000 = ${rpPen[1].toFixed(1)} customers per 1,000 households, close to the overall ${rpAll.toFixed(1)} (${int(sum(RP.cust))} ÷ ${int(sum(RP.hh))} × 1,000). Suburban houses lead at ${rpPen[2].toFixed(1)}; inner-city flats trail at ${rpPen[0].toFixed(1)}.`,
  },
  {
    id: 'm05-dg-i2', type: 'formula', kind: 'applied',
    prompt: 'Column B holds each respondent’s income band and column C their monthly spend on coffee. In F2, calculate the mean monthly spend of respondents in the income band named in F1, so that the result is right for whichever band F1 names.',
    sheet: { cells: incomeSheet, vary: { F1: [LEVELS.income[0], LEVELS.income[3]] } },
    cell: 'F2', answer: `=AVERAGEIFS(C2:C${L},B2:B${L},F1)`,
    alt: [`=SUMIFS(C2:C${L},B2:B${L},F1)/COUNTIF(B2:B${L},F1)`, `=AVERAGEIF(B2:B${L},F1,C2:C${L})`],
    view: `A1:F${L}`, formats: { C: '$#,##0', F2: '$#,##0.00' }, widths: { A: 11, B: 13, C: 12, E: 20, F: 12 }, maxHeight: '22rem',
    wrong: [
      { formula: `=AVERAGE(C2:C${L})`, say: 'That is the mean of all 640 respondents. Add the condition on the income band: AVERAGEIFS(C2:C641,B2:B641,F1).' },
      { formula: `=AVERAGEIFS(C2:C${L},B2:B${L},"$80k–120k")`, say: 'With the band typed in, the formula ignores F1. Refer to F1 so it works for any band.' },
      { formula: `=SUMIFS(C2:C${L},B2:B${L},F1)/COUNTA(C2:C${L})`, say: 'That divides the band’s total spend by all 640 respondents. Divide by the number in the band, or use AVERAGEIFS.' },
    ],
    solution: `<x>=AVERAGEIFS(C2:C641,B2:B641,F1)</x> gives $${spendIn(LEVELS.income[2]).toFixed(2)} for the $80k–120k band; the four bands run from $${spendIn(LEVELS.income[0]).toFixed(2)} to $${spendIn(LEVELS.income[2]).toFixed(2)}. The means differ clearly, but one-way ANOVA puts only ${p1(AS.eta2)} of the variation in spend between the bands.`,
  },
  {
    id: 'm05-dg-i3', type: 'multi', kind: 'conceptual',
    prompt: 'Select all the practices that reflect careful use of demographic variables.',
    options: [
      'Offering inclusive, self-described options when asking about gender or ethnicity.',
      'Checking the law before a segment defined by sex, race or religion affects prices or access.',
      'Recording a refused income question as an income of zero, so that every respondent has a value.',
      'Treating a difference between age bands in one survey as proof that the younger cohort will keep its habits as it ages.',
      'Choosing age bands that match the decision rather than round decades by habit.',
      'Asking about ethnicity in every survey in case it turns out to be useful.',
    ],
    answer: [0, 1, 4],
    feedback: {
      2: 'A refusal is a missing value, not zero: zero is a real (and rare) income. Code it as missing, as M04 taught.',
      3: 'One survey can’t separate an age effect (people change as they age) from a cohort effect (a generation keeps its habits).',
      5: 'Ask for sensitive data only when the answer would change a decision; collecting it “just in case” adds burden and risk for no purpose.',
    },
    solution: 'Careful: inclusive options, checking the law before segments defined by protected characteristics affect offers, and bands chosen for the decision. Careless: coding refusals as zero, reading an age difference as a lasting cohort trait, and collecting sensitive data without a purpose.',
  },
  {
    id: 'm05-dg-i4', type: 'mc', kind: 'applied',
    prompt: `In Lantern’s study, mean monthly spend on coffee runs from $${spendIn(LEVELS.income[0]).toFixed(2)} in the lowest income band to $${spendIn(LEVELS.income[2]).toFixed(2)} at $80k–120k (F = ${AS.F.toFixed(1)}, p < 0.001), and η² = ${AS.eta2.toFixed(3)}. Which statement does this support?`,
    options: [
      'The bands differ in mean spend, but most of the variation lies within each band',
      'Income explains most of what people spend on coffee, so Lantern should segment its market by income band',
      'Income explains little overall, but each higher-income respondent spends about $19 a month more than each lower-income one',
      'The F test shows that spend has no relationship with income, because η² is close to zero',
    ],
    answer: 0,
    feedback: {
      1: `η² = ${AS.eta2.toFixed(3)} means income bands account for under 7% of the variation in spend; over 93% lies within them.`,
      2: 'That is a difference in means, not a statement about each person: many low-income respondents spend more than many high-income ones.',
      3: 'The F test is significant (p < 0.001): there is a relationship. η² says it is small, not absent.',
    },
    solution: `The means differ beyond chance (F = ${AS.F.toFixed(1)}, p < 0.001), but η² = SS between ÷ SS total = ${AS.eta2.toFixed(3)}: income accounts for ${p1(AS.eta2)} of the variation in monthly spend. Within every band people spend very different amounts, so income describes the market’s spend poorly.`,
  },
  {
    id: 'm05-dg-i5', type: 'fill', kind: 'conceptual',
    prompt: 'Choose the term that completes each sentence.',
    text: 'Whether someone lives alone, with a partner or with young children describes their [[0]]. People born in the same span of years form a [[1]]. If 18–29s rate novelty highest because people seek variety while young and settle as they age, the difference is due to the [[2]]; if they keep the taste for novelty as they grow older, it is due to the [[3]].',
    blanks: [
      { options: ['generation', 'life stage', 'social class', 'subculture'], answer: 1 },
      { options: ['life stage', 'subculture', 'generation', 'segment'], answer: 2 },
      { options: ['cohort effect', 'age effect', 'ecological fallacy', 'period effect'], answer: 1 },
      { options: ['age effect', 'period effect', 'ecological fallacy', 'cohort effect'], answer: 3 },
    ],
    solution: 'Life stage; generation (a cohort); an age effect (people change as they age); a cohort effect (a generation keeps its habits). One cross-sectional survey can’t tell the last two apart.',
  },
];

// ---------------------------------------------------------------- knowledge check
const SSB = 48000, SSW = 552000;

export const check = [
  {
    id: 'm05-dg-k1', type: 'mc', kind: 'conceptual',
    prompt: 'Which pair of the five segment tests do demographic and geographic bases usually pass most easily?',
    options: [
      'Measurable and accessible: censuses count them, and media and mailing lists are sold by them',
      'Differentiable and actionable: groups defined by age or place respond differently and are easy to serve',
      'Substantial and differentiable: demographic groups are large and their members want the same things',
      'Actionable and measurable: a business can always design an offer for an age group and count its sales',
    ],
    answer: 0,
    feedback: {
      1: 'Differentiable is where demographics most often fail: people of the same age or area can want very different things.',
      2: 'Large, yes; alike in what they want, often not. That is the weakness of demographic bases.',
      3: 'Measurable, yes. Whether an offer for an age group is actionable depends on the group wanting something in common, which isn’t guaranteed.',
    },
    solution: 'Demographic and geographic segments are measurable (census and customer records) and accessible (media audiences and mailing lists are defined by them). They most often fail differentiable, because members of the same group differ in needs.',
  },
  {
    id: 'm05-dg-k2', type: 'num', kind: 'numerical',
    prompt: `A one-way ANOVA of customers’ monthly spend by region (fictional) gives a sum of squares between regions of ${int(SSB)} and a sum of squares within regions of ${int(SSW)}. What share of the variation in spend lies between regions (η²)? Give a percentage to one decimal place.`,
    answer: Math.round((SSB / (SSB + SSW)) * 1000) / 10, check: () => (48000 / (48000 + 552000)) * 100, unit: '%', places: 1, tol: 0.06,
    wrong: [
      { value: Math.round((SSB / SSW) * 1000) / 10, say: 'η² divides by the total sum of squares, between plus within: 48,000 ÷ 600,000.' },
      { value: Math.round((SSW / (SSB + SSW)) * 1000) / 10, say: 'That is the share within regions. η² is the share between them.' },
    ],
    solution: `η² = SS between ÷ SS total = 48,000 ÷ (48,000 + 552,000) = 48,000 ÷ 600,000 = ${((SSB / (SSB + SSW)) * 100).toFixed(1)}%. Region accounts for 8% of the variation in spend; the other 92% lies between customers in the same region.`,
  },
  {
    id: 'm05-dg-k3', type: 'mc', kind: 'applied',
    prompt: 'A home insurer (fictional) learns that one neighbourhood type in a geodemographic classification has a high average household income, and plans to quote higher premiums to every household in those postcodes because “they can afford it”. What is the main flaw in the reasoning?',
    options: [
      'It treats the area’s average as true of each household, the ecological fallacy',
      'Geodemographic classifications are far too old to describe household income at all',
      'Average income is a geographic variable, not a demographic one',
      'Income can’t be measured for postcodes or areas, only for individual households',
    ],
    answer: 0,
    feedback: {
      1: 'Classifications do age between censuses, but the deeper flaw would remain with an up-to-date one.',
      2: 'Income describes households, a demographic variable; averaging it over an area makes it geodemographic. The label isn’t the flaw.',
      3: 'Area averages can be estimated; the error is applying an average to every household in the area.',
    },
    solution: 'An area’s average describes its typical household, not each one: many households in a high-income postcode are not high-income. Treating the average as each household’s characteristic is the ecological fallacy; pricing on it also risks unfair treatment, so the insurer should check the law and its fairness policy too.',
  },
  {
    id: 'm05-dg-k4', type: 'multi', kind: 'applied',
    prompt: `In Lantern’s study, 45.9% of respondents aged 60 or over mainly home-brew, against 19.4% of 18–29s; for the whole age-by-source table χ² = 29.6, 9 df, p < 0.001, Cramér’s V = 0.12. Which conclusions are supported? Select all that apply.`,
    options: [
      'Age and main source are associated beyond what chance would produce.',
      'The association is weak: every age band contains many café, home and can buyers.',
      'A beans promotion could reasonably favour media that reach older coffee drinkers.',
      'Age is a strong basis for segmenting Harbour City’s coffee drinkers, given how small the p-value is.',
      'Most respondents aged 60 or over mainly home-brew their coffee.',
    ],
    answer: [0, 1, 2],
    feedback: {
      3: 'V = 0.12 is weak; age groups mix all kinds of coffee drinker, so they fail the differentiable test as segments.',
      4: '45.9% is less than half: most respondents aged 60 or over get their coffee elsewhere.',
    },
    solution: 'The p-value shows a real association and V shows it is weak. The higher home-brewing rate among older respondents can guide where a beans promotion is advertised, but age doesn’t separate coffee drinkers well enough to be the segmentation, and fewer than half of the over-60s home-brew.',
  },
  {
    id: 'm05-dg-k5', type: 'mc', kind: 'conceptual',
    prompt: 'Which statement about CACI’s Acorn is accurate?',
    options: [
      'It assigns each UK postcode to a category, group and type, from address and census data plus surveys',
      'It classifies individual consumers by their values and motivations from their answers to a personal questionnaire',
      'It sorts businesses into segments by industry, number of employees and legal structure',
      'It is a list of the five tests a segment must pass, from measurable to actionable',
    ],
    answer: 0,
    feedback: {
      1: 'That describes a psychographic system such as VALS, the next lesson’s subject; Acorn classifies places.',
      2: 'That describes firmographic segmentation of business markets.',
      3: 'Those are the ADAMS tests from Why segment?, not a classification system.',
    },
    solution: 'Acorn is a geodemographic classification: each of the 1.6 million UK postcodes is assigned to one of 7 categories, 22 groups and 65 types, built from CACI’s address data and the 2021 Census and described with survey data.',
  },
  {
    id: 'm05-dg-k6', type: 'mc', kind: 'applied',
    prompt: 'An ice-cream maker (fictional) finds that sales per 1,000 households are twice as high in coastal towns as inland. Its sales director proposes cutting inland advertising entirely. What is the best response?',
    options: [
      'Make coastal towns the priority but test inland before cutting it: low penetration may reflect past effort',
      'Agree: penetration shows inland households don’t want ice cream, so advertising there is wasted',
      'Disagree: penetration rates can’t be compared between areas with different numbers of households',
      'Agree, but only after weighting the coastal figures down to the inland population size',
    ],
    answer: 0,
    feedback: {
      1: 'Penetration measures past success, which depends on what the firm has done in each area, as well as on demand.',
      2: 'Penetration is per 1,000 households precisely so that areas of different sizes can be compared.',
      3: 'Weighting doesn’t change the logic: a rate per 1,000 is already comparable across areas.',
    },
    solution: 'Penetration compares areas fairly because it is a rate, and a doubled rate makes coastal towns a sensible priority. But it records past results, which depend on distribution and marketing as well as demand; a test in some inland towns would show whether demand there is low or just unserved.',
  },
];
