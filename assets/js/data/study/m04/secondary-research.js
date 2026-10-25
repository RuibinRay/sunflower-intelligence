// secondary-research.js — M04 · Secondary research. Content only; exercises are in secondary-research.ex.js.
// Lantern's internal records come from earlier courses' cases (B01, B03, B04, M01) and M02's market file, via imports;
// `checks` recompute them. The Harbour City Statistics Office, the Harbour City Grocers’ Association, the town of Kelstow
// and every figure attached to them are fictional. Facts about real statistics offices and registers are from the pages
// cited in `references`, checked on 24 October 2026.
import { CATEGORY, CHANNELS, DEFAULT_PLAN, MAILING_LIST, SUBSCRIBER_SURVEY, CLIENT_INTERVIEWS, STRATA, SIZES } from './case.js?v=14';
import { SHOP } from '../b01/case.js?v=14';
import { ORDERS, ORDER_COLUMNS } from '../b03/case.js?v=14';
import { HARBOURLINE } from '../f00/case.js?v=14';
import { ciProp } from '../../../core/inference.js?v=14';

const f = (n) => Math.round(n).toLocaleString('en-US');
const product = ORDER_COLUMNS.indexOf('product');
const coldBrewPacks = ORDERS.filter((r) => r[product] === 'Cold Brew Pack').length;
const newBuyers = SHOP.newCustomers.reduce((a, b) => a + b, 0);
const ch = Object.fromEntries(CHANNELS.map((c) => [c.id, c.volume]));

// Harbour City (fictional): the Statistics Office's 2025 household spending diaries and the grocers' association report
const HH = { households: 312000, cansPerMonth: 1.1, diaries: 2140, response: 0.31 };
const hhCans = HH.households * HH.cansPerMonth * 12;
const GA = { units: 5.9e6, coverage: 0.85 };
const gaGross = GA.units / GA.coverage;
// Kelstow (fictional): dog groomers
const KG = { employers: 14, nonemployers: 26, listings: 31, sampled: 10, active: 7 };
const kgEst = KG.listings * KG.active / KG.sampled;
const kgCi = ciProp(KG.active, KG.sampled, 0.95, 'wilson');

export default {
  slug: 'secondary-research',
  title: 'Secondary research',
  blurb: 'Before collecting anything new, find out what is already known. Learn to search a business’s own records and outside sources (official statistics, trade associations, syndicated and panel data, company filings, digital traces), judge each source by who made it and why, its method, definitions, coverage, timeliness and consistency, and combine sources so that each checks the others.',
  status: 'reviewed',
  objectives: [
    'Distinguish internal from external secondary data, and identify the internal records that can answer a marketing question.',
    'Describe what official statistics, trade associations, syndicated and panel data, company filings and digital-trace data offer, and what each leaves out.',
    'Evaluate a secondary source by who made it and why, its method, definitions, coverage, timeliness and consistency.',
    'Calculate a population total from a survey rate, and gross up a figure for incomplete coverage.',
    'Combine sources to check one against another (triangulation) and report a range that states what each source covers.',
  ],
  prerequisites: [
    { lesson: 'm04/the-research-process', why: 'Secondary research is step 3 of the process, and it starts from the research objectives.' },
    { lesson: 'b01/data-types', why: 'You need the distinction between primary and secondary data, and the idea of panel data.' },
    { lesson: 'b02/profiling-and-validation', why: 'Judging a secondary source uses the data-quality dimensions, timeliness and consistency among them.' },
    { lesson: 'b04/confidence-intervals', why: 'A secondary estimate comes from a sample too; the Wilson interval reappears in a worked example.' },
  ],
  case: 'lantern',

  concept: [
    { case: `Before Ana writes a single survey question, she spends two days on what already exists. Lantern’s own records hold more than she expected: every online order since the shop opened, ${f(newBuyers)} first-time buyers between July and December 2026, the December survey that ${SUBSCRIBER_SURVEY.responded} of ${SUBSCRIBER_SURVEY.invited} subscribers answered, the ${CLIENT_INTERVIEWS.interviewed} catering-client interviews and the mailing list itself. The Cold Brew launch plan rests on one outside figure, ${(CATEGORY.cansPerYear / 1e6).toFixed(1)} million cans of ready-to-drink coffee sold in Harbour City a year, which it gives without a source. Is it right?` },
    { p: '<g>Secondary research</g>, also called desk research, is finding, judging and using data that already exists: <g>secondary data</g>, collected by someone else or by the business itself for another purpose. It comes before <g>primary data</g> in almost every project for three reasons. It is cheaper and faster, often free. It tells you what is already known, so new research can concentrate on what isn’t. And some things can only come from secondary sources: no small business can count every shop in a city or every household in a country.' },
    { p: 'Its weakness is the other side of the same coin. Secondary data was collected to answer someone else’s question, with their definitions, their population and their timing, and OpenStax’s comparison of the two kinds notes that it can be outdated. Most of the skill lies in judging how far a source is from your question, and in combining sources so that each checks the others.' },

    { h: 'Internal and external data' },
    { p: 'Secondary data is internal or external. OpenStax’s <i>Principles of Marketing</i> defines <g>internal data</g> as data that already exists in the company’s databases: sales, prices, promotions, launches, logistics, customer records and earlier research. <g>External data</g> is data that originates outside the organisation: official statistics, industry reports, competitors’ websites, reviews, news. External data that a business has bought or collected and stored becomes, from then on, part of its internal data.' },
    { table: {
      caption: 'Lantern’s internal sources for the 2027 research (fictional case, from earlier courses)',
      head: ['Source', 'What it shows', 'What it can’t show'],
      rows: [
        ['Online shop orders (B01, B03)', `Who buys what, how often and how much; ${coldBrewPacks} of the ${ORDERS.length} orders from March to June 2026 were the Cold Brew Pack, beans for making cold brew at home`, 'Anything about people who have never ordered online'],
        ['Monthly visits and orders by channel (B01)', `How the shop grew: ${f(newBuyers)} first-time buyers from July to December 2026`, 'Why visitors left without buying'],
        ['December subscriber survey (B04)', `${SUBSCRIBER_SURVEY.responded} of ${SUBSCRIBER_SURVEY.invited} subscribers on how often they want deliveries`, 'The views of anyone who isn’t a subscriber, or anything about Cold Brew'],
        ['Catering-client interviews (M01)', `Why ${CLIENT_INTERVIEWS.interviewed} current clients chose Lantern`, `The prospects who chose a rival (${CLIENT_INTERVIEWS.lostBids} bids lost in 2026)`],
        ['The mailing list', `${f(MAILING_LIST)} people in four groups, from ${f(SIZES[0])} ${STRATA[0].toLowerCase()} to ${f(SIZES[3])} newsletter-only contacts`, 'Customers who never signed up'],
      ],
    } },
    { p: 'Internal data has one great strength, which is that it records what customers actually did, and one great limit, which is that it records only Lantern’s own customers. The 9 Cold Brew Pack orders are a hint that some online buyers like cold coffee; they say nothing about whether shoppers in a supermarket would pay $3.49 for a can. For that, Ana needs to look outside.' },

    { h: 'External sources' },
    { table: {
      caption: 'The main kinds of external secondary source',
      head: ['Source', 'Examples', 'Strengths', 'Watch for'],
      rows: [
        ['Official statistics', 'Population counts, business counts, household spending surveys', 'Large samples or full counts; published methods; often free', 'Definitions and areas chosen for government purposes; published months or years later'],
        ['Trade associations and the trade press', 'Industry sales estimates, members’ surveys, market reports', 'Specific to the industry; sometimes the only source for a niche', 'Members only; an interest in promoting the industry; methods often unpublished'],
        ['Syndicated and panel data', 'Retail sales measured at store checkouts; household purchase panels', 'Detailed by brand, store type and week', 'Costly; licence limits; stores and households not covered'],
        ['Company filings and reports', 'Annual reports, regulatory filings', 'Figures filed with regulators; audited annual statements for listed companies', 'Totals across many products and places; little on private firms'],
        ['Digital traces and big data', 'Search trends, public social posts and reviews, app and card data bought from other firms', 'Huge, fast and close to behaviour', 'Self-selected, not representative; definitions change; privacy limits'],
        ['Competitors’ own material', 'Websites, price lists, catalogues, job advertisements', 'Current and free', 'Written to sell; the competitor-research lesson covers it'],
      ],
    } },
    { callout: 'key', title: 'Someone else’s question', html: 'Every secondary figure answers the question its collector asked, with their definitions, their population and their timing. Before using one, find out what was counted, where, when and how, and how far that is from your question.' },
  ],

  theory: [
    { h: 'Official statistics' },
    { p: '<g>Official statistics</g> are figures published by government statistical offices and agencies, such as population counts, business counts and household surveys. They are usually the largest and best-documented sources available, and their documentation is where to start. Three examples show what to read for.' },
    { p: '<b>Business counts.</b> The U.S. Census Bureau’s County Business Patterns is an annual series of the number of establishments, their employment and their payroll by industry, for areas down to counties and ZIP codes. An <g>establishment</g>, in the Census Bureau’s definition, is a single physical location at which business is conducted: one supermarket company with forty stores is forty establishments. Employment is counted for the pay period that includes 12 March. And the series covers only establishments with paid employees; businesses with none appear in a separate product, Nonemployer Statistics, so a coffee cart run by its owner alone is invisible in County Business Patterns.' },
    { p: '<b>Population surveys.</b> The Census Bureau’s American Community Survey publishes its full 1-year tables only for areas with 65,000 or more people; simplified 1-year supplemental tables reach areas of 20,000 or more; and 5-year estimates, built from 60 months of data, cover every area, down to census tracts and block groups. The Bureau’s guidance states the trade-off plainly: the 1-year estimates are the most current, while the 5-year estimates rest on the largest sample and are the most reliable. Both are sample estimates, so read them with their margins of error, which the Census Bureau publishes at the 90% confidence level rather than the 95% that B04 used. And compare like with like: a 1-year figure for a city against a 5-year figure for a town mixes two periods.' },
    { p: '<b>Household spending.</b> The UK’s Office for National Statistics measures household spending with the Living Costs and Food Survey, a voluntary survey of private households in which members aged 16 and over record their daily spending for two weeks; its results appear in <i>Family spending in the UK</i>. Its quality guide is candid about the limits. The achieved sample in the financial year ending 2025 was 4,998 households, the response rate was 26% in Great Britain and 28% for the UK, spending is self-reported and may be under-reported (reported spending on tobacco and alcohol appears lower than other sources suggest), and communal establishments such as student halls of residence are left out.' },
    { p: 'None of this makes these sources poor. It makes them sources with documented definitions, coverage and accuracy, which is exactly what lets you judge how far they are from your question. A source that publishes nothing about its method is harder to use, not easier.' },

    { h: 'Trade associations and the trade press' },
    { p: 'A <g>trade association</g> is an organisation that represents the businesses in an industry, and many publish sales estimates, members’ surveys and market reports. For a niche, such as chilled coffee drinks in one city, an association or a trade magazine may be the only source. Read three things before using one: whose sales it covers (usually its members’, not the whole market), how it got the figure (a census of members, a sample, or an estimate), and why it published it (associations exist to promote their industry, so they have a reason to report growth).' },

    { h: 'Syndicated and panel data' },
    { p: 'OpenStax describes <g>syndicated data</g> as a type of external secondary data available through subscription services: a research firm collects the data once and sells it to many clients. Two kinds matter most for consumer goods. Retail measurement records sales at the checkouts of the stores that supply their scanner data, by brand, store type and week. A <g>consumer panel</g> is a sample of households or people who record what they buy over months or years, so it shows who buys, how often, what else they buy and when they switch brands.' },
    { p: 'Each has its own blind spot. Retail measurement misses stores that don’t share their data, and channels such as Lantern’s own online shop; panels depend on the households willing to record their shopping, which may differ from those who aren’t. A panel produces <g>panel data</g> in B01’s sense, the same units observed over time, which is why it can show switching that a single survey can’t. Syndicated data is often expensive, and its licence usually limits who may see it and what may be published.' },

    { h: 'Company filings' },
    { p: 'Companies that report to a securities regulator publish detailed filings, a free source on competitors and customers. In the US, the SEC’s EDGAR database gives free public access to them. The annual report on Form 10-K contains audited annual financial statements, a discussion of the material risk factors facing the company and management’s discussion and analysis of its results; Form 10-Q gives unaudited quarterly statements, and Form 8-K reports material events between them.' },
    { p: `F00’s fictional Harbourline Roasters Inc., a listed roaster with $${HARBOURLINE.revenue} million of revenue, would file a 10-K whose risk factors and management’s discussion might say which product lines are growing; its revenue, though, would cover every product and every region together. In the UK, the Companies House register can be searched free of charge, without registering, for a company’s filing history, its officers and the dates of its accounts. Companies House checks that filings are complete and valid, but it says it makes only basic checks on accounts and cannot take responsibility for the consequences of errors or omissions in the register’s data.` },

    { h: 'Big data and digital traces' },
    { p: 'OpenStax’s <i>Principles of Marketing</i> describes <g>big data</g> as “the countless number of records that continues in an increasing capacity and at a faster rate”, and characterises it by three Vs: volume (how much there is), velocity (how fast it grows) and variety (how many kinds of data and contributors). For a marketer the main sources are digital traces of behaviour: web and app analytics (sessions, pages viewed, abandoned baskets, the web data of B01), transaction and loyalty-card records (<g>transactional data</g> linked to a customer), search trends (how interest in a term rises and falls) and <g>social listening</g>, which tracks what people say in public posts, reviews and forums. A business’s own analytics and loyalty-card records are internal data; search trends, public posts and data bought from platforms are external.' },
    { p: 'OpenStax places such data in a <g>marketing information system</g>, which a business uses to collect, analyse and report findings from its internal and external data; it calls the system an ever-changing database that needs marketers to act on what it holds, and among the names for that information it lists marketing intelligence, M01’s <g>market intelligence</g>. It also notes a difficulty: because the data keep changing, it is hard to settle on an approach to analysing them. Nearly all of these records are secondary data, created by running a website, a till or a social network rather than to answer a research question, so the six questions in the next section apply to them in full.' },
    { p: '<b>Volume isn’t representativeness.</b> A million posts come from the people who chose to post, often the keenest and the angriest, plus bots, duplicate accounts and paid reviewers. However large it is, a social-listening count is a <g>self-selected sample</g> of opinion: it can show what is being said and how the conversation changes, not what share of customers think it. Loyalty-card data covers only card holders, and web analytics only the visits it records.' },
    { p: '<b>Definitions and platforms change without notice.</b> A change in an analytics tool’s session settings, in how a platform ranks or filters posts, or in which reviews it shows can move a series overnight, the digital version of a series that jumps when its method changes. Record the settings, the query and the date with every extract, and check for changes before reading a trend.' },
    { p: '<b>Privacy limits use.</b> Records that can be linked to a person are <g>personal data</g>, so using them for research needs a legal basis under the rules B01 outlined, and customers may not expect their purchases or posts to be studied. A public post is not consent to be profiled: analyse themes and counts, and never quote or report anyone in a way that identifies them.' },

    { h: 'Evaluating a source' },
    { p: 'Six questions cover almost every problem with a secondary source. The first two are about the source, the other four about how well its numbers fit your question.' },
    { table: {
      caption: 'Six questions to ask of any secondary source',
      head: ['Question', 'What to check', 'Warning sign'],
      rows: [
        ['Who made it, and why?', 'Who collected it, who paid, and what it was for', 'A seller’s report on the size of its own market'],
        ['How was it made?', 'Census, sample (how drawn, how many, what response rate) or estimate; whether the method is published', 'No method, or “industry sources”'],
        ['What exactly was counted?', 'The definitions of the product, the unit and the measure', '“Chilled coffee drinks” when you need cans of ready-to-drink coffee; establishments when you need companies'],
        ['Who and what does it cover?', 'Which people, places, businesses or channels are in and out', 'Private households only; employers only; members only'],
        ['When?', 'The period it describes and when it was published', 'A five-year-old figure for a market that changes every year'],
        ['Does it agree?', 'With itself over time, and with other sources', 'A jump in the year the method changed'],
      ],
    } },
    { p: 'The questions echo the data-quality dimensions of B01 and B02, <g>timeliness</g> among them, applied to a whole source rather than to values in a table. Write the answers down: a short source log with the source, its date, its definitions, its coverage and its link saves the next person, or you next year, from repeating the work.' },

    { h: 'Combining sources' },
    { p: '<g>Triangulation</g> is checking a finding or an estimate against evidence from other sources or methods. Agreement raises confidence; disagreement is a clue, usually to a difference in definitions, coverage or timing that has to be explained before either figure is used. The method has four moves: put each figure on the same unit and period; adjust for what each covers, for example grossing up a members-only figure by the members’ share; compare; and explain each gap.' },
    { p: 'The result is usually a range, not a point. Two sources that bracket a figure from below and above don’t prove it, but they show it isn’t contradicted, and they tell you which assumption would have to change for it to be wrong. Report the range with what each end covers, and carry it into the next step of the research: market sizing (Module 3) starts from it.' },

    { h: 'The limits of secondary data' },
    { p: 'Secondary data can’t tell you how people will react to something that doesn’t exist yet: no statistics office has measured interest in Lantern Cold Brew. Its definitions may never match yours, its areas may be wrong for a business that serves one district, and the latest figures may describe a market that has since moved. And publishing someone else’s data has its own rules: check the licence, and cite the source.' },
  ],

  formulas: [
    { id: 'sr-scale-up', name: 'Scaling a survey rate to a population total',
      tex: String.raw`T = N \times r \times k`,
      where: [
        [String.raw`T`, 'Total for the whole population over a year', 'units a year'],
        [String.raw`N`, 'Number of units in the population, such as households', 'households'],
        [String.raw`r`, 'Average quantity per unit per period, from a survey', 'units per household per period'],
        [String.raw`k`, 'Number of periods in a year (12 for a monthly rate, 52 for a weekly one)', ''],
      ],
      assumptions: 'The survey’s average applies to the whole population (its sample is representative and its answers accurate), and its definition of the quantity is the one you need.',
      note: 'The total inherits every limit of the rate: under-reporting in a diary, or a population that leaves some buyers out, carries straight into T.' },
    { id: 'sr-gross-up', name: 'Grossing up for coverage',
      tex: String.raw`T = \dfrac{T_c}{c}`,
      where: [
        [String.raw`T`, 'Estimated total for the whole market', 'units'],
        [String.raw`T_c`, 'Total reported for the part the source covers, such as an association’s members', 'units'],
        [String.raw`c`, 'Share of the market the covered part accounts for', 'proportion (0 to 1)'],
      ],
      assumptions: 'The share c is known from a trustworthy source, and the uncovered part behaves like the covered part.',
      note: 'If the source’s definition is wider than yours, the grossed-up figure is a ceiling for your market, not an estimate of it.' },
  ],

  examples: [
    { level: 'simple', title: 'Which census estimate for which town?', fictional: true,
      setup: 'A fictional children’s bookshop chain in the US has a branch in a city of about 250,000 people and wants to open in a town of about 15,000. It wants the number of children under 10 in each place, from the American Community Survey. Which estimates should it use, and how should it compare the two places?',
      steps: [
        'Check availability. The Census Bureau publishes full 1-year estimates only for areas of 65,000 people or more, and simplified supplemental 1-year tables for areas of 20,000 or more. The city qualifies for both; the town, at about 15,000, is below both thresholds, so for the town only the 5-year estimates exist.',
        'Weigh the trade-off. The 1-year estimate for the city is the most current; the 5-year estimates, built from 60 months of data, rest on a larger sample and are more reliable, but they describe a five-year period rather than last year.',
        'Keep the comparison consistent. Comparing a 1-year figure for the city with a 5-year figure for the town would mix two periods, so use the 5-year estimates for both places. If the city’s 1-year figure is also wanted, report it separately as the latest view.',
        'Read the margins of error. Both are sample estimates, published with margins of error at the 90% confidence level, and a small town’s estimate can have a wide margin. To compare the places, test the difference rather than judging by whether the intervals overlap, and compare rates per head (children under 10 as a share of each population), since the places differ so much in size.',
      ],
      answer: 'Use the 5-year estimates for both places, because the town is below both 1-year thresholds (65,000 for the full tables, 20,000 for the supplemental ones) and the comparison needs the same period; quote each with its margin of error and compare rates per head.',
      interpretation: 'The right source was obvious; the right version of it wasn’t. Most mistakes with official statistics are of this kind: the figure is accurate, but it measures a slightly different thing, place or period from the one the question needs.' },

    { level: 'challenging', title: 'How many dog groomers compete in Kelstow?', fictional: true,
      setup: `A fictional mobile dog-grooming start-up wants to know how many groomers already work in the fictional town of Kelstow. The fictional Kelstow Statistics Office’s business count (March 2025) shows ${KG.employers} establishments with paid employees in “pet care services (except veterinary)”, an industry that includes grooming, boarding and training; its separate count of businesses without employees (tax year 2024) shows ${KG.nonemployers} more in the same industry. An online directory (January 2027) lists ${KG.listings} businesses under “dog grooming”. The founder phones ${KG.sampled} of the ${KG.listings} listings chosen at random: ${KG.active} are active groomers in Kelstow, 2 have closed and 1 is outside the town. Estimate the number of groomers, and say how sure the estimate is.`,
      steps: [
        `Check the definitions. The statistics office’s industry includes boarding kennels, trainers and pet sitters as well as groomers, so its figures count more than the start-up’s competitors. Together they give ${KG.employers + KG.nonemployers} businesses in pet care: a ceiling for the number of groomers, not an estimate.`,
        `Check the coverage. Like County Business Patterns, the employer count leaves out businesses with no employees, and many groomers work alone from a van. Using the ${KG.employers} employer establishments alone would badly undercount; the non-employer table is essential.`,
        'Check the timing. The business counts describe 2024 and early 2025; the directory is current but unvetted, with closed businesses and listings from elsewhere.',
        String.raw`Use the phone check to correct the directory. Seven of the ten sampled listings were active groomers in Kelstow, so the estimate is <m>31 \times 7 \div 10 = 21.7</m>, about 22 groomers. But ten calls is a small sample: B04’s Wilson interval for 7 of 10 runs from about 40% to 89%, which gives <m>31 \times 0.40 \approx 12</m> to <m>31 \times 0.89 \approx 28</m> groomers. (The interval ignores the finite population correction; with 10 of the 31 listings phoned, it would be a little narrower.)`,
        'Triangulate and decide. About 22 sits well below the ceiling of 40 pet-care businesses, as it should, though the official counts are two years older than the directory. The cheapest way to narrow the range is to phone the other 21 listings, turning the estimate into a count of the directory; groomers who aren’t listed would still be missed, so the founder should also ask a few vets and pet shops which groomers they recommend.',
      ],
      answer: `About 22 active groomers (a plausible range of roughly 12 to 28 from the ten-call check), well within the ${KG.employers + KG.nonemployers} pet-care businesses in the official counts. Phoning the remaining listings would settle the directory’s share.`,
      interpretation: 'No source answered the question on its own: the official counts had the wrong definition and the directory had no quality control. Together, with a small check of the weakest source, they give a usable range and show exactly what would narrow it.' },

    { level: 'applied', title: 'Is 4.8 million cans a year right?', fictional: true,
      setup: `Ana wants to know whether the launch plan’s ${(CATEGORY.cansPerYear / 1e6).toFixed(1)} million cans of ready-to-drink coffee a year is a sound base for sizing Cold Brew. She finds two outside sources (both fictional). The Harbour City Statistics Office’s 2025 household spending survey, in which ${f(HH.diaries)} households kept two-week diaries (a ${HH.response * 100}% response rate), found that households bought an average of ${HH.cansPerMonth} cans of ready-to-drink coffee a month; the office estimates that the city has ${f(HH.households)} households. The Harbour City Grocers’ Association’s 2026 report says its members sold ${(GA.units / 1e6).toFixed(1)} million units of “chilled coffee drinks” (cans, bottles and cartons, including milk-based iced coffee), and that its members account for about ${GA.coverage * 100}% of all chilled coffee drinks sold in the city (the association’s own estimate).`,
      steps: [
        String.raw`Put the household figure on a yearly basis (the scaling formula): <m>312{,}000 \times 1.1 \times 12 = 4{,}118{,}400</m> cans, about 4.1 million.`,
        'Ask what it leaves out. It counts only households in the city, not offices buying for their staff, commuters from outside or visitors; and like the ONS’s diary survey it is self-reported, so purchases may be under-reported, and a 31% response leaves room for non-response bias, which could push it either way. The first three gaps all push it down, so treat it as a rough floor for the category, with that caveat.',
        String.raw`Gross up the association’s figure for coverage: <m>5.9 \div 0.85 \approx 6.94</m> million units. Check where the 85% comes from first: it is the association’s own estimate, and the grossed-up figure is only as good as it is. The definition is wider than Ana’s (bottles and cartons, milk-based drinks), so this is a ceiling for cans of ready-to-drink coffee, not an estimate of them.`,
        String.raw`Compare. The launch plan’s 4.8 million sits between the floor of 4.1 million and the ceiling of 6.9 million. It is <m>(4{,}800{,}000 - 4{,}118{,}400) \div 4{,}118{,}400 \approx 16.6\%</m> above the household figure, a gap that buying by offices, commuters and visitors, plus some under-reporting, could plausibly explain.`,
        `Add the internal view. ${coldBrewPacks} of the ${ORDERS.length} spring orders (${(coldBrewPacks / ORDERS.length * 100).toFixed(1)}%) were the Cold Brew Pack: a hint that some of Lantern’s own customers like cold coffee, and nothing about cans on a supermarket shelf. And record what was found: the two sources, their dates, definitions and coverage, in Lantern’s source log.`,
      ],
      answer: 'The 4.8 million is consistent with both outside sources: above the households’ own diaries (4.1 million, a rough floor) and below the grocers’ grossed-up, wider-defined figure (6.9 million, a ceiling). Ana keeps it as the category figure, with the range and its two sources noted.',
      interpretation: 'Triangulation didn’t prove the figure; it showed that two independent sources don’t contradict it, and it named the assumptions that matter: how much is bought outside households and how much the diaries miss. Those are the inputs the market-sizing lesson tests.' },
  ],

  demo: [
    { widget: 'sr-reconcile', intro: 'Start from the Statistics Office’s diary figure. Add an allowance for under-reporting and a share of cans bought outside households (offices, commuters, visitors) and watch the implied category total move towards, or past, the launch plan’s 4.8 million. Which combinations reach it, and are they believable? Note that no setting can be checked against the grocers’ figure except as a ceiling.' },
  ],

  mistakes: [
    { title: '“It’s an official statistic, so it answers my question.”', html: 'Official statistics are accurate for their own definitions. A count of establishments is not a count of companies; a survey of private households leaves out halls of residence; a business count may leave out every firm without employees. Read the definitions and the coverage before reading the number.' },
    { title: '“The association says the market is 5.9 million, so it is.”', html: 'An association reports its members’ sales, in its own product definition, with its own interest in the industry’s image. Gross it up only if you know the members’ share, and treat a wider definition as a ceiling, not an estimate.' },
    { title: '“Two sources disagree, so one of them is wrong.”', html: 'More often both are right about different things: different products, places, buyers or years. Put them on the same definition and explain each gap before choosing; the explanation is often the most useful finding.' },
    { title: '“Our own records describe the market.”', html: 'Internal data records what your customers did, completely and cheaply, and nothing about the people who never bought from you. It is the best source on your customers and a biased one on the market.' },
    { title: '“Secondary research is what you do if you can’t afford primary research.”', html: 'It is what you do first, whatever the budget: it shows what is already known, sharpens the objectives and sets the figures a survey will be checked against. Primary research should only fill the gaps it leaves.' },
  ],

  application: [
    { case: 'A fictional regional bakery chain is choosing between two towns for its next shop. Its marketing manager has a week and no research budget, so she starts at her desk.' },
    { p: '<b>Internal first.</b> The chain’s loyalty-card data shows which postcode areas its existing customers come from and how far they travel; its till data shows sales by hour, which tells her that commuters matter. Both describe current customers only, so she uses them to decide what to look for, not to forecast a new town.' },
    { p: '<b>Then the official figures.</b> The local statistics office gives each town’s population and number of households, and its business count gives the number of bakeries and cafés. She reads the definitions before the numbers: the business count includes only employers, so she adds the separate count of businesses without employees, and she uses figures for the same year in both towns.' },
    { p: '<b>Then the trade.</b> A bakers’ trade magazine estimates national sales of fresh bread; she notes it but doesn’t scale it down to the towns, because the national mix of supermarkets and bakeries may not match either town. The listed supermarket group in one town publishes an annual report, and its risk factors mention the closure of stores in “smaller market towns”, which she checks against the local press.' },
    { p: '<b>Then the judgement.</b> Her one-page source log lists each source, its date, its definitions and what it leaves out. The two towns are close on population, but the second has fewer bakeries per household on both the employer and the non-employer counts, and its supermarket is closing. Before recommending it, she asks for one piece of primary research the desk can’t supply: a count of morning foot traffic past the two candidate sites.' },
    { p: 'The pattern is the same for any business: internal data to know your customers, official data for the size and shape of the market, trade and company sources for context and competitors, all judged by the same six questions, and primary research only for what is left.' },
  ],

  summary: [
    'Secondary research comes first: it is cheaper and faster, shows what is already known and sometimes is the only source. Its limit is that it answers someone else’s question.',
    'Internal data (a business’s own records and earlier research) shows what its customers did; external data (official statistics, trade associations, syndicated and panel data, company filings) describes the wider market.',
    'Official statistics are documented: read the definitions (an establishment is not a company), the coverage (employers only, private households only), the timing and the accuracy (sample sizes, response rates, under-reporting).',
    'Trade associations usually report members only; syndicated retail data misses stores and channels that don’t share data; consumer panels depend on who agrees to record; filings cover listed or registered companies and add up many products.',
    'Judge every source by six questions: who made it and why, how, what exactly was counted, what it covers, when, and whether it agrees with itself and with others.',
    'Scale a survey rate to a total with T = N × r × k, and gross up for coverage with T = T_c ÷ c; a wider definition makes the result a ceiling.',
    'Big data and digital traces (analytics, loyalty cards, search trends, social listening) are large but not representative: say who is missing, record settings and dates, and respect privacy limits.',
    'Triangulate: put sources on one definition, adjust for coverage, compare, explain each gap, and report a range with what each end covers.',
  ],

  glossary: [
    { term: 'Secondary research', def: 'Finding, judging and using data that already exists, collected by someone else or by the business itself for another purpose. Also called desk research.' },
    { term: 'Internal data', def: 'Secondary data that already exists inside the organisation, such as sales records, customer records and earlier research.' },
    { term: 'External data', def: 'Data that originates outside the organisation, such as official statistics, industry reports, competitors’ websites and reviews.' },
    { term: 'Official statistics', def: 'Figures published by government statistical offices and agencies, such as population counts, business counts and household surveys, usually with documented methods and definitions.' },
    { term: 'Establishment', def: 'In business statistics, a single physical location at which business is conducted, such as one shop or one factory. A company may consist of one or many establishments.' },
    { term: 'Trade association', def: 'An organisation that represents the businesses in an industry; many publish members’ sales estimates and market reports.' },
    { term: 'Syndicated data', def: 'Data collected by a research firm once and sold by subscription to many clients, such as retail sales measured at store checkouts or household purchase panels.' },
    { term: 'Consumer panel', def: 'A sample of households or people who record what they buy over months or years, so that their purchases can be followed over time.' },
    { term: 'Big data', def: 'Very large, fast-growing and varied collections of records, such as transactions, web logs and social media posts; OpenStax describes it by three Vs: volume, velocity and variety.' },
    { term: 'Marketing information system', def: 'The means by which a business collects, analyses and reports marketing information from its internal and external data, so that it is ready for decisions.' },
    { term: 'Social listening', def: 'Tracking what people say in public online posts, reviews and forums about a brand, product or topic, usually with software that counts mentions and classifies their tone.' },
    { term: 'Triangulation', def: 'Checking a finding or an estimate against evidence from other sources or methods. Agreement raises confidence; disagreement points to differences in definitions, coverage, timing or method that must be explained.' },
  ],

  references: [
    { text: 'Gomez Albrecht, M., Green, M. &amp; Hoffman, L. (2023). <i>Principles of Marketing</i>, sections 6.1 “Marketing Research and Big Data” (big data and its three Vs; the marketing information system), 6.2 “Sources of Marketing Information” and 6.3 “Steps in a Successful Marketing Research Plan” (internal and external data; primary and secondary data; syndicated data). OpenStax.', url: 'https://openstax.org/books/principles-marketing/pages/6-1-marketing-research-and-big-data', checked: '2026-10-24' },
    { text: 'U.S. Census Bureau. “About County Business Patterns (CBP)”.', url: 'https://www.census.gov/programs-surveys/cbp/about.html', checked: '2026-10-24' },
    { text: 'U.S. Census Bureau. “County Business Patterns (CBP) Glossary” (establishment; paid employment; nonemployers).', url: 'https://www.census.gov/programs-surveys/cbp/about/glossary.html', checked: '2026-10-24' },
    { text: 'U.S. Census Bureau. “Using 1-Year or 5-Year American Community Survey Data”. ACS guidance for data users (1-year, 1-year supplemental and 5-year estimates).', url: 'https://www.census.gov/programs-surveys/acs/guidance/estimates.html', checked: '2026-10-24' },
    { text: 'U.S. Census Bureau (2020). <i>Understanding and Using American Community Survey Data: What All Data Users Need to Know</i>, chapter 3 “Understanding and Using ACS Single-Year and Multiyear Estimates” (supplemental tables as simplified versions of popular tables) and chapter 7 “Understanding Error and Determining Statistical Significance” (margins of error published at the 90 percent confidence level).', url: 'https://www.census.gov/content/dam/Census/library/publications/2020/acs/acs_general_handbook_2020_ch03.pdf', checked: '2026-10-24' },
    { text: 'Office for National Statistics. “Living Costs and Food Survey guide” (quality and methodology information).', url: 'https://www.ons.gov.uk/peoplepopulationandcommunity/personalandhouseholdfinances/incomeandwealth/methodologies/livingcostsandfoodsurveyqmi', checked: '2026-10-24' },
    { text: 'U.S. Securities and Exchange Commission, Investor.gov. “Using EDGAR to Research Investments”.', url: 'https://www.investor.gov/research-before-you-invest/research/researching-investments/using-edgar-researching-public-companies', checked: '2026-10-24' },
    { text: 'Companies House. “Searching the Companies House register”. GOV.UK guidance.', url: 'https://www.gov.uk/guidance/searching-the-companies-house-register', checked: '2026-10-24' },
  ],

  checks: [
    // Lantern's internal and M02 figures
    { what: 'Category cans a year, millions (M02)', value: CATEGORY.cansPerYear / 1e6, shown: 4.8 },
    { what: 'First-time buyers Jul–Dec 2026 (B01)', value: newBuyers, shown: 1406 },
    { what: 'December survey replies (B04)', value: SUBSCRIBER_SURVEY.responded, shown: 312 },
    { what: 'December survey invited (B04)', value: SUBSCRIBER_SURVEY.invited, shown: 520 },
    { what: 'Client interviews (M01)', value: CLIENT_INTERVIEWS.interviewed, shown: 12 },
    { what: 'Bids lost (M01)', value: CLIENT_INTERVIEWS.lostBids, shown: 5 },
    { what: 'Cold Brew Pack orders, spring (B03)', value: coldBrewPacks, shown: 9 },
    { what: 'Spring orders (B03)', value: ORDERS.length, shown: 231 },
    { what: 'Cold Brew Pack share of spring orders %', value: coldBrewPacks / ORDERS.length * 100, shown: 3.9, tol: 0.05 },
    { what: 'Mailing list (B04)', value: MAILING_LIST, shown: 6000 },
    { what: 'Subscribers on the list', value: SIZES[0], shown: 520 },
    { what: 'Newsletter-only contacts', value: SIZES[3], shown: 4330 },
    { what: 'Cold Brew price (M02)', value: DEFAULT_PLAN.price, shown: 3.49 },
    { what: 'Planned channels’ share of cans (M02)', value: ch.supermarket + ch.natural + ch.direct, shown: 0.7 },
    // real sources (verified facts)
    { what: 'CBP reference pay period: 12 March', value: 12, shown: 12 },
    { what: 'ACS 1-year threshold', value: 65000, shown: 65000 },
    { what: 'ACS 5-year months', value: 60, shown: 60 },
    { what: 'LCF diary length (weeks)', value: 2, shown: 2 },
    { what: 'LCF diary age', value: 16, shown: 16 },
    { what: 'LCF achieved sample FYE 2025', value: 4998, shown: 4998 },
    { what: 'LCF response rate GB %', value: 26, shown: 26 },
    { what: 'LCF response rate UK %', value: 28, shown: 28 },
    { what: 'Harbourline revenue ($m, F00)', value: HARBOURLINE.revenue, shown: 640 },
    // simple example
    { what: 'Bookshop: city population', value: 250000, shown: 250000 },
    { what: 'Bookshop: town population', value: 15000, shown: 15000 },
    { what: 'Bookshop: town below both 1-year thresholds', value: Number(15000 < 20000 && 15000 < 65000), shown: 1 },
    { what: 'ACS supplemental 1-year threshold', value: 20000, shown: 20000 },
    { what: 'OpenStax big-data Vs', value: 3, shown: 3 },
    { what: 'A million posts (illustration)', value: 1e6, shown: 1000000 },
    { what: 'ACS published margins: confidence level %', value: 90, shown: 90 },
    { what: 'B04 confidence level %', value: 95, shown: 95 },
    { what: 'Kelstow: counts older than directory (years)', value: 2027 - 2025, shown: 2 },
    { what: 'Bookshop: children under 10', value: 10, shown: 10 },
    // Kelstow
    { what: 'Kelstow: employer establishments', value: KG.employers, shown: 14 },
    { what: 'Kelstow: non-employer businesses', value: KG.nonemployers, shown: 26 },
    { what: 'Kelstow: pet-care ceiling', value: KG.employers + KG.nonemployers, shown: 40 },
    { what: 'Kelstow: listings', value: KG.listings, shown: 31 },
    { what: 'Kelstow: listings phoned', value: KG.sampled, shown: 10 },
    { what: 'Kelstow: active groomers in sample', value: KG.active, shown: 7 },
    { what: 'Kelstow: closed + outside', value: 2 + 1, shown: KG.sampled - KG.active },
    { what: 'Kelstow: estimate', value: kgEst, shown: 21.7 },
    { what: 'Kelstow: estimate rounded', value: Math.round(kgEst), shown: 22 },
    { what: 'Kelstow: Wilson low %', value: kgCi.low * 100, shown: 40, tol: 0.5 },
    { what: 'Kelstow: Wilson high %', value: kgCi.high * 100, shown: 89, tol: 0.5 },
    { what: 'Kelstow: low count (rounded factor 0.40)', value: 31 * 0.40, shown: 12, tol: 0.5 },
    { what: 'Kelstow: high count (rounded factor 0.89)', value: 31 * 0.89, shown: 28, tol: 0.5 },
    { what: 'Kelstow: low count from the interval', value: KG.listings * kgCi.low, shown: 12, tol: 0.5 },
    { what: 'Kelstow: high count from the interval', value: KG.listings * kgCi.high, shown: 28, tol: 0.5 },
    { what: 'Kelstow: listings left to phone', value: KG.listings - KG.sampled, shown: 21 },
    // Harbour City triangulation
    { what: 'Households (Statistics Office)', value: HH.households, shown: 312000 },
    { what: 'Cans per household per month', value: HH.cansPerMonth, shown: 1.1 },
    { what: 'Diary households', value: HH.diaries, shown: 2140 },
    { what: 'Diary response rate %', value: HH.response * 100, shown: 31 },
    { what: 'Household cans a year', value: hhCans, shown: 4118400 },
    { what: 'Household cans a year, millions', value: hhCans / 1e6, shown: 4.1, tol: 0.05 },
    { what: 'Association units, millions', value: GA.units / 1e6, shown: 5.9 },
    { what: 'Association coverage %', value: GA.coverage * 100, shown: 85 },
    { what: 'Association grossed up, millions', value: gaGross / 1e6, shown: 6.94, tol: 0.005 },
    { what: 'Association grossed up, millions (one decimal)', value: gaGross / 1e6, shown: 6.9, tol: 0.05 },
    { what: 'Gap of 4.8M over household figure %', value: (CATEGORY.cansPerYear - hhCans) / hhCans * 100, shown: 16.6, tol: 0.05 },
    { what: '4.8M between floor and ceiling', value: Number(hhCans < CATEGORY.cansPerYear && CATEGORY.cansPerYear < gaGross), shown: 1 },
  ],
};
