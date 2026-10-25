// secondary-research.ex.js — M04 · Secondary research: widgets, practice and the knowledge check (answer keys live
// here). The Harbour City Statistics Office's diary figure and the grocers' association report are the lesson's
// (fictional); every other business and figure here is fictional too. Facts about County Business Patterns, the American
// Community Survey, the Living Costs and Food Survey, Form 10-K and Companies House are from the lesson's references.

const f = (n) => Math.round(n).toLocaleString('en-US');
const HH = { households: 312000, cansPerMonth: 1.1 };
const CATEGORY = 4.8e6, CEILING = 5.9e6 / 0.85;

export const widgets = {
  'sr-reconcile': {
    type: 'formula',
    title: 'From household diaries to the whole category',
    intro: 'The Statistics Office’s 2025 diaries give the cans that Harbour City households say they bought. Adjust for what the diaries miss and for cans bought outside households, and compare the implied total with the launch plan’s 4.8 million and the grocers’ grossed-up 6.9 million units, which include bottles and cartons and so are only a ceiling.',
    inputs: [
      { id: 'hh', label: 'Households in Harbour City', min: 250000, max: 380000, step: 2000, value: 312000, fmt: 'int' },
      { id: 'cans', label: 'Cans per household per month (diaries)', min: 0.6, max: 1.6, step: 0.05, value: 1.1, fmt: 'num' },
      { id: 'under', label: 'Allowance for under-reporting in the diaries', min: 0, max: 30, step: 1, value: 0, fmt: 'pct' },
      { id: 'out', label: 'Share of all cans bought outside households', min: 0, max: 40, step: 1, value: 0, fmt: 'pct' },
    ],
    compute: (v) => {
      const own = v.hh * v.cans * 12;
      const reported = own * (1 + v.under / 100);
      const total = reported / (1 - v.out / 100);
      const gap = (total / CATEGORY - 1) * 100;
      const note = total > CEILING
        ? `The implied total, ${f(total)} cans, is above the grocers’ ceiling of about ${f(CEILING)} units of all chilled coffee drinks: these assumptions can’t all be right.`
        : Math.abs(gap) <= 5
          ? `The implied total is within 5% of the launch plan’s 4.8 million (${gap >= 0 ? '+' : '−'}${Math.abs(gap).toFixed(1)}%). Ask whether these allowances are believable, not only whether they fit.`
          : `The implied total is ${Math.abs(gap).toFixed(1)}% ${gap > 0 ? 'above' : 'below'} the launch plan’s 4.8 million. ${gap < 0 ? 'Buying by offices, commuters and visitors, or under-reporting in the diaries, would close the gap.' : 'That would make the launch plan’s figure an underestimate.'}`;
      return {
        headline: { label: 'Implied category total (cans a year)', value: f(total) },
        rows: [
          ['Households’ own reported cans a year', f(own)],
          ['After the under-reporting allowance', f(reported)],
          ['Launch plan’s figure (M02)', f(CATEGORY)],
          ['Grocers’ grossed-up figure, all chilled coffee drinks (a ceiling)', f(CEILING)],
        ],
        note,
        chart: {
          kind: 'bar',
          x: { label: 'Figure', values: ['Diaries', 'Implied total', 'Launch plan', 'Grocers’ ceiling'] },
          series: [{ name: 'Millions of units a year', values: [own, total, CATEGORY, CEILING].map((x) => Math.round(x / 1e4) / 100) }],
          y: { label: 'Millions of units a year' },
        },
      };
    },
  },
};

export const guided = [
  {
    id: 'm04-sr-g1', type: 'classify', kind: 'conceptual',
    prompt: 'In January 2027 Ana lists her evidence for the Cold Brew research. Classify each source.',
    items: [
      'The online shop’s order records for March to June 2026',
      'The December 2026 subscriber survey on delivery frequency, reread in January for ideas',
      'The February 2027 questionnaire sent to a sample of the mailing list',
      'The Harbour City Statistics Office’s household spending survey',
      'The Harbour City Grocers’ Association’s annual report on chilled drinks',
      'The two focus groups on Cold Brew held in March 2027',
      'Notes from the twelve catering-client interviews of November 2026',
    ],
    categories: ['Internal secondary data', 'External secondary data', 'Primary data for this study'],
    answer: [0, 0, 2, 1, 1, 2, 0],
    hints: [
      'Ask two questions of each: was it collected for the Cold Brew research, and did it come from inside Lantern?',
      'Lantern’s own earlier surveys and interviews are internal secondary data: they were collected for other questions.',
    ],
    feedback: {
      1: 'The December survey was Lantern’s own, but it was collected to decide delivery frequency. Reused for Cold Brew it is internal secondary data, not primary.',
      2: 'The February questionnaire was designed for the 2027 research objectives: primary data.',
      6: 'The interviews were Lantern’s own research for another purpose (why clients chose it), so they are internal secondary data now.',
    },
    solution: 'Internal secondary: the order records, the December survey and the client interviews (Lantern’s own data, collected for other purposes). External secondary: the Statistics Office’s survey and the association’s report. Primary: the February survey and the March focus groups, both designed for the 2027 objectives.',
  },
  {
    id: 'm04-sr-g2', type: 'steps', kind: 'applied',
    prompt: 'A fictional e-bike shop wants to know how many e-bikes are sold a year in its region. A regional cycle traders’ association reports that its members sold 18,000 bicycles in 2026, and that members make about 75% of the region’s bicycle sales.',
    solution: 'Gross up for coverage: 18,000 ÷ 0.75 = 24,000 bicycles. The association counts all bicycles, children’s and road bikes included, so this is a ceiling for e-bikes, not an estimate. Applying the 22% e-bike share from the national survey gives 24,000 × 0.22 = 5,280 e-bikes, as long as the region’s mix is like the nation’s; the shop should check that against its own suppliers’ figures.',
    steps: [
      { id: 'm04-sr-g2-s1', type: 'num',
        prompt: 'Gross up the members’ sales for coverage. How many bicycles were sold in the region? Give a whole number.',
        answer: 24000, check: () => 18000 / 0.75, tol: 0.5, unit: 'bicycles', places: 0,
        hints: ['Members sell 75% of the bicycles, so the whole market is bigger than their 18,000.', 'T = T_c ÷ c = 18,000 ÷ 0.75.'],
        wrong: [
          { value: 13500, say: 'That multiplies by 0.75, which shrinks the figure. Members are only part of the market, so divide by their share.' },
          { value: 4500, say: 'That is the uncovered quarter alone (24,000 − 18,000 would be 6,000; 18,000 × 0.25 is 4,500). The total is 18,000 ÷ 0.75.' },
        ] },
      { id: 'm04-sr-g2-s2', type: 'mc',
        prompt: 'What does the grossed-up figure tell the e-bike shop?',
        options: [
          'It is a ceiling for e-bikes, since it counts every kind of bicycle',
          'It is the number of e-bikes sold, since e-bikes are bicycles',
          'It is too uncertain to use, since it comes from a trade association',
          'It is a floor for e-bikes, since the association has only 75% coverage',
        ],
        answer: 0,
        hints: ['Compare the association’s definition (bicycles) with the shop’s question (e-bikes).'],
        feedback: {
          1: 'The association’s definition is wider than the shop’s: children’s bikes, road bikes and others are in it. A wider definition gives a ceiling.',
          2: 'An association figure needs checking, but it isn’t useless: with its definition and coverage understood, it bounds the answer.',
          3: 'Grossing up has already corrected for coverage. The remaining problem is the definition, which makes the figure too high, not too low.',
        } },
      { id: 'm04-sr-g2-s3', type: 'num',
        prompt: 'A national survey finds that 22% of bicycles sold are e-bikes. If the region is like the nation, how many e-bikes were sold there in 2026?',
        answer: 5280, check: () => 18000 / 0.75 * 0.22, tol: 0.5, unit: 'e-bikes', places: 0,
        hints: ['Apply the e-bike share to the whole region’s bicycles, not to the members’ sales.', '24,000 × 0.22.'],
        wrong: [{ value: 3960, say: 'That applies the share to the members’ 18,000. The share belongs to the whole market of 24,000.' }] },
    ],
  },
  {
    id: 'm04-sr-g3', type: 'mc', kind: 'conceptual',
    prompt: 'A fictional pharmacy chain in the US wants the number of people aged 65 and over in a town of about 30,000 people, from the American Community Survey. Which estimate should it use?',
    options: [
      'The 5-year estimates: 1-year ones exist only for areas of 65,000 or more',
      'The 1-year estimates, because they are the most current and the most reliable',
      'The 1-year estimates for the county, divided by the county’s number of towns',
      'Either one, because the two always give the same figure for a town',
    ],
    answer: 0,
    hints: ['Check whether a 1-year estimate exists for a town of 30,000.', 'The Census Bureau’s threshold for 1-year estimates is 65,000 people.'],
    feedback: {
      1: 'The 1-year estimates are the most current, but the 5-year estimates are the most reliable, and for a town of 30,000 only the 5-year estimates are published.',
      2: 'Dividing a county total equally among its towns assumes they are all the same; it invents a figure the survey never measured.',
      3: 'The two describe different periods and rest on different sample sizes, so they generally differ.',
    },
    solution: 'The town is below the 65,000 threshold for 1-year estimates, so the 5-year estimates (60 months of data) are the ones available. They are less current but rest on the largest sample; quote the figure with its margin of error.',
  },
  {
    id: 'm04-sr-g4', type: 'multi', kind: 'applied',
    prompt: 'A drinks company wants to use the UK Living Costs and Food Survey to estimate how much university students spend on alcohol each week. Which concerns does the ONS’s own guide to the survey raise? Select all that apply.',
    options: [
      'Spending is self-reported, and reported spending on alcohol looks lower than other sources suggest',
      'Communal establishments such as student halls of residence are not covered',
      'A small sample makes detailed breakdowns, such as one group’s spending on one item, volatile',
      'The survey covers Scotland only, so students at English and Welsh universities are missing',
      'The response rate is above 90%, so any non-response can safely be ignored in the analysis',
      'Households keep their spending diaries for a whole year, which tires them out and lowers quality',
    ],
    answer: [0, 1, 2],
    hints: ['Think about definitions (what is recorded), coverage (who is in it) and accuracy (how many answered).', 'Students in halls live in communal establishments.'],
    feedback: {
      3: 'The survey covers private households across the UK; Northern Ireland’s fieldwork is run by its own statistics agency.',
      4: 'The guide reports a response rate of 26% in Great Britain and 28% for the UK in the financial year ending 2025, so non-response is a real concern.',
      5: 'Members aged 16 and over keep diaries for two weeks, not a year.',
    },
    solution: 'The guide warns that spending is self-reported and may be under-reported (alcohol and tobacco especially), that it covers private households only, leaving out communal establishments such as student halls, and that the relatively small sample makes detailed results volatile. Students in halls are exactly the group the company wants, so this source can’t answer the question on its own.',
  },
];

export const independent = [
  {
    id: 'm04-sr-i1', type: 'classify', kind: 'conceptual',
    prompt: 'A fictional hotel group is judging secondary sources on hotel demand in its city. Which of the six evaluation questions does each concern belong to?',
    items: [
      'The tourism board’s visitor count is the latest available, but it describes 2022',
      'The figure comes from a booking platform’s press release about its own growth',
      'A consultancy’s report quotes “industry sources” and doesn’t say how its estimate was made',
      'The visitor survey counts day trippers as well as overnight guests',
      'The airport survey asks only passengers arriving on international flights',
      'The city’s hotel-night count jumped by a third in the year its method changed',
    ],
    categories: ['Who made it, and why?', 'How was it made?', 'What exactly was counted?', 'Who and what does it cover?', 'When?', 'Does it agree?'],
    answer: [4, 0, 1, 2, 3, 5],
    feedback: {
      3: 'Day trippers don’t stay in hotels: the problem is what the source counts as a visitor, its definition.',
      4: 'Leaving out domestic arrivals is a coverage problem: part of the population isn’t in the source at all.',
      5: 'A break in a series when the method changes is a consistency problem: the before and after figures don’t measure the same thing.',
    },
    solution: 'Timeliness: the 2022 visitor count. Who and why: a platform’s press release about itself. Method: “industry sources” with no method. Definition: day trippers counted as visitors. Coverage: international arrivals only. Consistency: the jump when the method changed.',
  },
  {
    id: 'm04-sr-i2', type: 'num', kind: 'numerical',
    prompt: 'A fictional pet-food maker reads in a statistics office’s household survey that households in its city buy an average of 2.4 kg of dry dog food a month (all households, including those without a dog). The city has 85,000 households. How many kilograms of dry dog food do its households buy in a year? Give a whole number.',
    answer: 85000 * 2.4 * 12, check: () => 85000 * 2.4 * 12, tol: 0.5, unit: 'kg', places: 0,
    wrong: [
      { value: 85000 * 2.4, say: 'That is a month’s purchases. The rate is per month, so multiply by 12 for a year.' },
      { value: 85000 * 2.4 * 52, say: 'The rate is per month, not per week: a year has 12 months.' },
    ],
    solution: 'T = N × r × k = 85,000 × 2.4 × 12 = 2,448,000 kg a year. The figure covers households only (not kennels or breeders) and inherits any under-reporting in the survey.',
  },
  {
    id: 'm04-sr-i3', type: 'mc', kind: 'applied',
    prompt: 'A café-equipment supplier counts the coffee shops in a US county from County Business Patterns. Which kind of business will its count miss?',
    options: [
      'A coffee cart run by its owner, who has no employees',
      'A chain café whose head office is in another state',
      'A coffee shop that opened in January and employed two baristas by March',
      'A café that is one of three establishments owned by the same company',
    ],
    answer: 0,
    feedback: {
      1: 'County Business Patterns counts establishments where they are, whatever the location of the head office.',
      2: 'A shop with paid employees in the pay period including 12 March is in the count.',
      3: 'Each location is a separate establishment, so all three cafés are counted, not one company.',
    },
    solution: 'County Business Patterns covers only establishments with paid employees; owner-run businesses with no employees are in the Census Bureau’s separate Nonemployer Statistics. The supplier needs both to count every coffee business, and should remember that the counts are of locations (establishments), not companies.',
  },
  {
    id: 'm04-sr-i4', type: 'multi', kind: 'conceptual',
    prompt: 'Which of these can you expect to find in a company’s annual report on Form 10-K? Select all that apply.',
    options: [
      'Audited annual financial statements',
      'A discussion of the material risk factors facing the company',
      'Management’s discussion and analysis of its results',
      'Unaudited quarterly financial statements for each quarter',
      'The names of its largest customers’ buyers and what they pay',
      'Next year’s marketing plan, product by product',
    ],
    answer: [0, 1, 2],
    feedback: {
      3: 'Unaudited quarterly statements are in Form 10-Q, filed each quarter.',
      4: 'Filings disclose what securities law requires investors to know, not commercial details such as individual buyers and prices.',
      5: 'Companies don’t publish their marketing plans; the risk factors and management’s discussion may hint at priorities, nothing more.',
    },
    solution: 'The 10-K contains audited annual financial statements, the material risk factors and management’s discussion and analysis of results. Quarterly unaudited statements are in the 10-Q; customer details and plans are not disclosed.',
  },
  {
    id: 'm04-sr-i5', type: 'num', kind: 'numerical',
    prompt: 'Two fictional sources estimate a city’s annual sales of plant-based milk: a retail-measurement report says 1.36 million litres and a statistics office’s household survey, scaled up, says 1.6 million litres. By what percentage is the household figure above the retail figure? Give one decimal place.',
    answer: (1.6 / 1.36 - 1) * 100, check: () => (1.6 - 1.36) / 1.36 * 100, tol: 0.06, unit: '%', places: 1,
    wrong: [
      { value: (1.6 - 1.36) / 1.6 * 100, say: 'That divides by the household figure. “Above the retail figure” makes the retail figure the base: (1.6 − 1.36) ÷ 1.36.' },
      { value: 0.24, say: 'That is the gap in millions of litres. Divide it by the retail figure to express it as a percentage.' },
    ],
    solution: '(1.6 − 1.36) ÷ 1.36 × 100 = 17.6%. A gap like this needs explaining before either figure is used: the retail report may miss stores that don’t share their data, and the household survey may count cafés’ purchases no differently from homes’ or carry sampling error.',
  },
];

export const check = [
  {
    id: 'm04-sr-k1', type: 'mc', kind: 'conceptual',
    prompt: 'A fictional ice-cream maker sizes its market from an official table of household spending on “ice cream and frozen desserts”. What is the main risk in using it?',
    options: [
      'The category includes products it doesn’t make, such as frozen cakes',
      'Official tables are always out of date by several years, too late to use',
      'Household spending figures from a survey can’t be trusted for anything',
      'The table will include the maker’s own past sales twice',
    ],
    answer: 0,
    feedback: {
      1: 'Official statistics are often a year or two behind, which matters, but the definition is the bigger problem here, whatever the year.',
      2: 'A documented household survey can be used well if its definition, coverage and accuracy are understood.',
      3: 'A household survey records what households bought; nothing counts the maker’s sales twice.',
    },
    solution: 'The table’s definition is wider than the maker’s market, so it overstates it. The maker needs the share of the category that is ice cream, from another source, or should treat the figure as a ceiling. It should also note that the table covers households only, not cafés and restaurants.',
  },
  {
    id: 'm04-sr-k2', type: 'num', kind: 'numerical',
    prompt: 'A fictional retail-measurement service records 2.1 million units of a snack sold in a year through the stores that supply it with scanner data. Those stores account for about 70% of the snack’s sales. Estimate the market’s total sales. Give millions of units to one decimal place.',
    answer: 2.1 / 0.7, check: () => 2.1 / 0.7, tol: 0.05, unit: 'million units', places: 1,
    wrong: [
      { value: 2.1 * 0.7, say: 'That multiplies by the coverage, which makes the market smaller than the covered part. Divide by it: 2.1 ÷ 0.7.' },
      { value: 2.1 * 1.3, say: 'Adding 30% is not the same as dividing by 70%: the stores missing are 30% of the total, not 30% of the covered sales.' },
    ],
    solution: 'T = T_c ÷ c = 2.1 ÷ 0.70 = 3.0 million units, assuming the stores not covered sell the snack like the covered ones. If the missing stores are, say, convenience stores with a different mix, the gross-up is only approximate.',
  },
  {
    id: 'm04-sr-k3', type: 'classify', kind: 'applied',
    prompt: 'Ana has five questions in January 2027. Which source should she look at first for each?',
    items: [
      'How often do Lantern’s online subscribers reorder?',
      'How many households live in Harbour City?',
      'How many cans of each rival brand do Harbour City supermarkets sell each week?',
      'Would people who have never bought from Lantern try a can at $3.49?',
      'Which product lines are growing at a listed coffee company?',
    ],
    categories: ['Lantern’s internal records', 'Official statistics', 'Syndicated retail data', 'Company filings', 'New primary research'],
    answer: [0, 1, 2, 4, 3],
    feedback: {
      2: 'Brand sales by store type and week are what retail measurement sells; no official source reports them by brand.',
      3: 'No existing source has asked about a product that isn’t on sale yet. This needs primary research, and the focus groups are designed for it.',
      4: 'A listed company’s 10-K, with its management’s discussion, is the free source; the trade press may add commentary.',
    },
    solution: 'Subscribers’ reordering: Lantern’s own order records. Households: official statistics. Rival brands’ sales: syndicated retail data (paid). Reactions to a product not yet on sale: new primary research. A listed company’s growing lines: its filings.',
  },
  {
    id: 'm04-sr-k4', type: 'mc', kind: 'applied',
    prompt: 'A fictional UK supplier looks up a potential distributor on the Companies House register before signing a contract. What can it rely on the register for?',
    options: [
      'Its filing history and officers; its accounts have had only basic checks',
      'A guarantee from Companies House that the accounts are accurate and audited',
      'The distributor’s sales to each of its customers last year',
      'Nothing, because the register can only be searched by paying subscribers',
    ],
    answer: 0,
    feedback: {
      1: 'Companies House says it makes only basic checks on accounts and can’t take responsibility for errors in them.',
      2: 'The register holds what companies file, not their customer-by-customer sales.',
      3: 'Searching the register is free, and no registration is needed to view company information.',
    },
    solution: 'The register is free to search and shows a company’s filing history, its current and resigned officers and the dates of its accounts and confirmation statements. Companies House checks that filings are complete and valid, but it only makes basic checks on accounts, so they are evidence to weigh, not a guarantee.',
  },
  {
    id: 'm04-sr-k5', type: 'multi', kind: 'conceptual',
    prompt: 'Two sources bracket a market figure: a household survey gives a lower figure and a trade association’s grossed-up, wider-defined figure gives a higher one. Which conclusions are justified? Select all that apply.',
    options: [
      'The two sources don’t contradict the figure',
      'The figure has been proved correct',
      'The gaps should be explained by definitions and coverage',
      'The figure should be reported with a range and its sources',
      'The higher source must be wrong, because it disagrees with the lower one',
      'The average of the two sources is the true market size',
    ],
    answer: [0, 2, 3],
    feedback: {
      1: 'A figure between a floor and a ceiling is consistent with both, not proved: other values in the range are consistent too.',
      4: 'Both can be right about different things: the association counts more products and more buyers.',
      5: 'Averaging a floor and a ceiling built on different definitions gives a number that measures nothing in particular.',
    },
    solution: 'Bracketing shows consistency, not proof. Explain each gap (what the household survey leaves out, what the association adds), report the figure with its range and sources, and test the assumptions that matter in the next step.',
  },
  {
    id: 'm04-sr-k6', type: 'fill', kind: 'conceptual',
    prompt: 'Complete the statements.',
    text: 'A business’s own sales records are [[0]] secondary data. In County Business Patterns, a single physical location at which business is conducted is an [[1]], and businesses with no paid employees are [[2]]. Checking an estimate against other sources and methods is called [[3]].',
    blanks: [
      { options: ['internal', 'external', 'primary'], answer: 0 },
      { options: ['establishment', 'enterprise', 'industry'], answer: 0 },
      { options: ['left out', 'counted twice', 'counted as one'], answer: 0 },
      { options: ['triangulation', 'grossing up', 'syndication'], answer: 0 },
    ],
    solution: 'Sales records are internal secondary data. County Business Patterns counts establishments (locations, not companies) with paid employees, leaving out non-employers, which have their own Census Bureau product. Checking an estimate against independent evidence is triangulation.',
  },
];
