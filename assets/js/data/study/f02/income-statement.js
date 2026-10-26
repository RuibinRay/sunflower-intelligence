// income-statement.js — F02 · The multi-step income statement. Content only; exercises are in income-statement.ex.js.
// The centrepiece is STATEMENTS.income from case.js; every Lantern figure comes from DERIVED, FACTS, ADJUSTMENTS or RESULTS.
// Other businesses are fictional and live only here.
import { FACTS, ADJUSTMENTS, DERIVED as D, STATEMENTS, RESULTS } from './case.js?v=19';

const F = FACTS, IS = RESULTS.incomeStatement;
const op = Object.fromEntries(IS.lists.operating);                 // operating expenses by account
const costOfSuppliesUsed = F.supplies.bought - F.supplies.onHand;  // 10,900, moved to Cost of Services by e2
const servicesRevenue = D.cateringRevenue + D.trainingRevenue;     // 83,320
const servicesGP = servicesRevenue - D.costOfServices;             // 47,220
const totalExpenses = D.costOfSales + D.operatingExpenses + D.interestExpense + D.incomeTax;   // single-step total
const selling = op['Shipping Expense'] + op['Card and Platform Fees Expense'] + op['Advertising Expense'];
const admin = D.operatingExpenses - selling;
const employee = F.wages.events + F.wages.shopAndOffice;
const e9 = ADJUSTMENTS.find((t) => t.id === 'e9');
// EBITDA against cash from operations: interest and tax paid, and the working-capital items of the first year
const paidInterestTax = F.coastline.interestPaid + F.tax.estimatedPaid;                                   // 6,450
const accountsPayable = (F.inventory.purchases - F.inventory.paid) + (F.supplies.bought - F.supplies.paid) + F.utilities.unpaid;   // 9,210
const fundedBy = accountsPayable + F.wages.payable + D.unearned;                                                // 17,410
const prepaidInsurance = F.insurance.premium - F.insurance.monthly * F.insurance.expired;                       // 300
const tiedUp = D.receivablesNet + D.inventoryEnd + F.supplies.onHand + prepaidInsurance;                        // 13,536
// Teasel Yarn Company (simple example)
const ty = { sales: 420000, returns: 8000, discounts: 2000, cogs: 236000, wages: 61000, rent: 24000, adv: 9500, dep: 7200, util: 5300, intExp: 3000, intRev: 400, rate: 0.25 };
const tyNet = ty.sales - ty.returns - ty.discounts, tyGP = tyNet - ty.cogs, tyOpex = ty.wages + ty.rent + ty.adv + ty.dep + ty.util;
const tyOI = tyGP - tyOpex, tyIBT = tyOI - ty.intExp + ty.intRev, tyTax = tyIBT * ty.rate, tyNI = tyIBT - tyTax;
// Quarrybank Foods (EPS illustration)
const qb = { ni: 12.6, pref: 0.6, sharesH1: 7.5, sharesH2: 8.5 };
const qbShares = (qb.sharesH1 + qb.sharesH2) / 2;
// Coastline’s hypothetical 2027 loan (applied example)
const bankEbitda = D.ebitda + F.inventory.writeDown;
const anaEbitda = D.ebitda + F.inventory.writeDown + D.badDebt;

// The figure: Lantern’s income statement as a staircase of bars, drawn to scale from the case’s figures.
const steps = [
  ['Net revenue', D.revenue, 0, D.revenue, 'total'],
  ['Less cost of sales', D.costOfSales, D.grossProfit, D.revenue, 'less'],
  ['Gross profit', D.grossProfit, 0, D.grossProfit, 'total'],
  ['Less operating expenses', D.operatingExpenses, D.operatingIncome, D.grossProfit, 'less'],
  ['Operating income (EBIT)', D.operatingIncome, 0, D.operatingIncome, 'total'],
  ['Less interest expense', D.interestExpense, D.incomeBeforeTax, D.operatingIncome, 'less'],
  ['Income before tax', D.incomeBeforeTax, 0, D.incomeBeforeTax, 'total'],
  ['Less income tax expense', D.incomeTax, D.netIncome, D.incomeBeforeTax, 'less'],
  ['Net income', D.netIncome, 0, D.netIncome, 'total'],
];
const fmt = (n) => Math.round(n).toLocaleString('en-US');
const sx = (v) => 270 + v * 350 / D.revenue;
const staircase = '<svg viewBox="0 0 640 330" xmlns="http://www.w3.org/2000/svg" font-family="inherit" font-size="14">'
  + steps.map(([label, amt, from, to, kind], i) => {
    const y = 12 + i * 34;
    const bar = kind === 'total'
      ? `<rect x="${sx(from).toFixed(1)}" y="${y}" width="${(sx(to) - sx(from)).toFixed(1)}" height="22" fill="var(--series-1)"/>`
      : `<rect x="${sx(from).toFixed(1)}" y="${y}" width="${Math.max(1.5, sx(to) - sx(from)).toFixed(1)}" height="22" fill="none" stroke="var(--series-2)" stroke-width="2" stroke-dasharray="4 3"/>`;
    return `${bar}<text x="10" y="${y + 16}" fill="currentColor"${kind === 'total' ? ' font-weight="600"' : ''}>${label}</text><text x="258" y="${y + 16}" fill="currentColor" text-anchor="end">${kind === 'less' ? '(' : ''}${fmt(amt)}${kind === 'less' ? ')' : ''}</text>`;
  }).join('')
  + `<path d="M${sx(D.operatingIncome).toFixed(1)} 160 H${sx(D.ebitda).toFixed(1)}" stroke="var(--rule-strong)" stroke-width="2"/><text x="${(sx(D.ebitda) + 6).toFixed(1)}" y="164" fill="currentColor" font-size="13">EBITDA ${fmt(D.ebitda)} adds back D&amp;A of ${fmt(D.depreciation)}</text>`
  + '</svg>';

export default {
  slug: 'income-statement',
  title: 'The multi-step income statement',
  blurb: 'Rebuild Lantern’s first-year income statement in stages: net revenue, cost of sales and gross profit, operating expenses and operating income, interest, income tax and net income. Then calculate EBIT and EBITDA, see the rules for presenting non-GAAP measures, and meet earnings per share.',
  status: 'reviewed',
  objectives: [
    'Prepare a multi-step income statement from an adjusted trial balance, and explain how it differs from a single-step statement.',
    'Calculate gross profit, gross margin, operating income, income before income tax, income tax expense and net income.',
    'Classify expenses by function and by nature, and place each account in the right section of a multi-step statement.',
    'Calculate EBIT and EBITDA from an income statement, and explain the SEC rules for presenting EBITDA as a non-GAAP measure.',
    'Calculate basic earnings per share and state which companies must report it.',
  ],
  prerequisites: [
    { lesson: 'f01/financial-statements', why: 'You prepared Lantern’s single-step income statement for March there; this lesson builds the multi-step version for the year.' },
    { lesson: 'f02/inventory-and-cost-of-goods-sold', why: 'Cost of goods sold and gross profit come from that lesson.' },
    { lesson: 'f00/value-and-valuation-words', why: 'EBIT, EBITDA and earnings per share are defined there; here you calculate them from a full income statement.' },
  ],
  case: 'lantern',

  concept: [
    { case: 'Coastline Bank’s loan agreement also asks for annual financial statements within three months of the year end. In F01 Ana sent the bank a single-step income statement for March: revenues added up, expenses added up, one subtraction. For the first full year the accountant prepares a multi-step statement instead. It reaches the same net income, $27,387, but in stages that show the loan officer where the profit came from.' },
    { p: 'A <g>single-step income statement</g> lists all revenues, then all expenses, and subtracts once. For Lantern’s ten months: net revenue $193,320 minus total expenses $165,933 gives net income of $27,387. It is quick to prepare and hard to misread, but it treats the coffee in a bag, the rent of the kitchen, the interest on the bank loan and the income tax as one undifferentiated pile of cost.' },
    { p: 'A <g>multi-step income statement</g> subtracts the costs in a meaningful order and shows a subtotal after each group. Each subtotal answers a question a reader actually asks:' },
    { list: [
      '<b><g>Gross profit</g></b>: does the business sell its goods and services for more than they cost to provide?',
      '<b><g>Operating income</g></b>: does that margin cover the costs of running the business, such as rent, wages, marketing and depreciation?',
      '<b>Income before income tax</b>: what is left after the costs of borrowing and any other non-operating items?',
      '<b><g>Net income</g></b>: what remains for the owners after income tax?',
    ] },
    { figure: {
      svg: staircase,
      caption: 'Lantern’s income statement for the ten months ended 31 December 2026 as a staircase, bars drawn to scale (fictional figures in dollars). Solid bars are subtotals; dashed bars are the costs deducted between them.',
      alt: `A staircase of nine horizontal bars drawn to scale. Net revenue of ${fmt(D.revenue)} is the longest bar. Cost of sales of ${fmt(D.costOfSales)} is deducted, leaving gross profit of ${fmt(D.grossProfit)}. Operating expenses of ${fmt(D.operatingExpenses)} are deducted, leaving operating income, which equals EBIT, of ${fmt(D.operatingIncome)}. Interest expense of ${fmt(D.interestExpense)} leaves income before income tax of ${fmt(D.incomeBeforeTax)}. Income tax expense of ${fmt(D.incomeTax)} leaves net income of ${fmt(D.netIncome)}, the shortest subtotal. A line extending the operating income bar shows EBITDA of ${fmt(D.ebitda)}, which adds back depreciation and amortisation of ${fmt(D.depreciation)}.`,
    } },
    { p: 'The staircase makes the structure visible. Cost of sales takes almost half of Lantern’s revenue; operating expenses take most of what is left; interest is a sliver; income tax takes a quarter of income before tax. Net income ends at about 14 cents for each dollar of revenue. The statement doesn’t change the arithmetic of F01, only the order in which the costs are subtracted, but that order is what lets a reader compare Lantern with other businesses and with its own next year.' },
    { callout: 'key', title: 'Same bottom line, different story', html: 'Single-step and multi-step statements always give the same net income: the accounts are the same, only grouped differently. What differs is the information in the subtotals. Gross profit and operating income can’t be read from a single-step statement, and they are where most of the analysis in F03 starts.' },
  ],

  theory: [
    { h: 'Lantern’s multi-step income statement' },
    { p: 'The statement below is prepared from Lantern’s adjusted trial balance at 31 December 2026, after the nine year-end adjustments. Its heading names the business, the statement and the period, which for a first year is “the ten months ended 31 December 2026”. Each section is explained in turn after it.' },
    { statement: { ...STATEMENTS.income, note: 'Fictional figures from the Lantern case. Amounts in parentheses are deducted.' } },
    { h: 'Net revenue' },
    { p: 'The statement opens with gross revenue by stream, less the contra-revenue account for refunds, giving <g>net revenue</g> of $193,320, as the revenue recognition lesson derived. Showing the streams separately costs a few lines and tells the reader at once that the shop provides more than half of Lantern’s revenue. A company with sales discounts would deduct them here too.' },
    { h: 'Cost of sales and gross profit' },
    { p: '<g>Cost of sales</g> is the cost of providing what was sold. For the shop it is cost of goods sold, $52,800. For catering and workshops it is <g>cost of services</g>: the event baristas’ wages ($25,200) and the catering supplies and workshop materials used ($10,900), $36,100 in all. In F01’s March books every wage went to Wages Expense and every consumable to Supplies Expense. For the annual statements the accountant records the direct costs of events and workshops in Cost of Services instead, because without them the services would show a gross profit equal to their revenue and the comparison with the shop would be meaningless.' },
    { table: {
      caption: 'Lantern’s gross profit by activity, 2026 (fictional)',
      head: ['', 'Online shop ($)', 'Catering and workshops ($)', 'Total ($)'],
      align: ['l', 'r', 'r', 'r'],
      rows: [
        ['Net revenue', '110,000', '83,320', '193,320'],
        ['Cost of sales', '(52,800)', '(36,100)', '(88,900)'],
        ['Gross profit', '57,200', '47,220', '104,420'],
      ],
      foot: [['Gross margin', '52.0%', '56.7%', '54.0%']],
    } },
    { p: 'Lantern’s <g>gross margin</g> is <m>104{,}420 \\div 193{,}320 \\approx 54.0\\%</m>. The services earn a slightly higher margin than the shop, but the shop also bears costs that sit below gross profit, notably $12,630 of shipping and $4,010 of card and platform fees. Which costs belong in cost of sales is a judgement each business makes and should apply consistently: Lantern treats shipping to customers as a selling cost, while some online retailers include it in cost of sales. When comparing gross margins across companies, check what each puts above the line.' },
    { h: 'Operating expenses: by function or by nature' },
    { p: '<g>Operating expenses</g> are the costs of running the business that are not part of cost of sales. Lantern’s statement lists them account by account, which is common for a small company. Larger companies group them, in one of two ways. The <g>function of expense method</g> groups costs by the activity they serve, such as cost of sales, selling, and general and administrative. The <g>nature of expense method</g> groups them by what they are, such as goods purchased, employee wages, depreciation and rent, without assigning them to activities.' },
    { table: {
      caption: 'Lantern’s operating expenses by function, 2026: one reasonable grouping (fictional)',
      head: ['Function', 'Accounts', 'Amount ($)'],
      align: ['l', 'l', 'r'],
      rows: [
        ['Selling and fulfilment', 'Shipping, card and platform fees, advertising', '23,140'],
        ['General, administrative and other', 'Wages (shop and office), rent, utilities, insurance, depreciation, fuel, bad debts, miscellaneous', '43,564'],
      ],
      foot: [['Total operating expenses', '', '66,704']],
    } },
    { p: 'The grouping is approximate: a full function analysis would allocate the kitchen rent and the espresso equipment’s depreciation between cost of services and administration, the van’s fuel and depreciation to delivery, and part of the shop staff’s wages to fulfilment. Lantern’s summary accounts don’t hold the information to split them, one reason small companies list expenses account by account.' },
    { p: 'The same year by nature looks quite different. There is no cost of sales, so there is no gross profit; instead the reader sees, for example, that wages for all staff come to $43,600, a figure the function method splits between cost of services and operating expenses.' },
    { statement: {
      title: 'Lantern Coffee Co.',
      subtitle: 'Income statement to operating income, expenses by nature, for the ten months ended 31 December 2026',
      sections: [
        { ...STATEMENTS.income.sections[0] },
        { head: 'Operating expenses by nature', rows: [
          ['Coffee bought for resale', F.inventory.purchases],
          ['Increase in inventory', -D.inventoryEnd],
          ['Wages', employee],
          ['Supplies used', costOfSuppliesUsed],
          ['Shipping', op['Shipping Expense']],
          ['Rent', op['Rent Expense']],
          ['Advertising', op['Advertising Expense']],
          ['Depreciation', D.depreciation],
          ['Card and platform fees', op['Card and Platform Fees Expense']],
          ['Utilities', op['Utilities Expense']],
          ['Fuel', op['Fuel Expense']],
          ['Insurance', op['Insurance Expense']],
          ['Bad debts', op['Bad Debt Expense']],
          ['Miscellaneous', op['Miscellaneous Expense']],
        ], total: ['Total expenses', D.costOfSales + D.operatingExpenses] },
        { rows: [['Net revenue', D.revenue], ['Less total expenses', -(D.costOfSales + D.operatingExpenses)]], total: ['Operating income', D.operatingIncome] },
      ],
      note: 'Fictional figures. The increase in inventory is deducted because $5,800 of the coffee bought is still on hand; the write-down is inside it.',
    } },
    { p: 'IFRS requires an analysis of expenses by nature or by function, whichever gives information that is reliable and more relevant (IAS 1 paragraph 99). A company using the function method must show cost of sales separately and disclose additional information on the nature of its expenses, including depreciation and amortisation and employee benefits (paragraphs 103 and 104). US GAAP lets a private company such as Lantern choose a single-step or a multi-step format. IFRS 18, which replaces IAS 1 from 2027, changes these requirements; the course’s last lesson, <i>US GAAP and IFRS</i>, explains how.' },
    { h: 'Operating income' },
    { p: 'Gross profit less operating expenses, plus any gains on selling long-lived assets, is <g>operating income</g> (also called income from operations or operating profit): $37,716 for Lantern, which sold nothing in 2026. It measures what the business earns from its ordinary activities before the cost of its borrowing and before tax, so it can be compared across businesses financed in different ways. Lantern earns about 19.5 cents of operating income per dollar of revenue; turning such figures into ratios and comparing them is the work of F03.' },
    { h: 'Other income and expenses' },
    { p: 'Items that don’t arise from the business’s main operations are shown after operating income, as <g>other income and expenses</g>. Lantern has one: interest expense of $1,200, made up of the $450 paid on the Coastline note on 1 June, 1 September and 1 December, plus $750 accrued at the year end ($50 on the Coastline note for December and $700 on the van note for June to December). Interest revenue on savings would also appear here. Gains and losses on selling equipment would not: US GAAP requires them to be included in income from operations whenever that subtotal is presented (ASC 360-10-45-5), so Lantern’s chart adds a gain after operating expenses and includes a loss among them. IAS 1 doesn’t define operating income, so IFRS practice has varied; IFRS 18 changes this from 2027, as the course’s last lesson explains.' },
    { h: 'Income tax' },
    { p: 'A corporation pays income tax on its taxable profit. The US federal corporate rate is 21% of taxable income (26 U.S.C. §11(b)), a flat rate that applies to taxable years beginning after 31 December 2017; many states also tax corporate income. The Lantern case assumes a combined rate of 25% and, to keep the course introductory, that taxable income equals income before income tax. When the two differ, as they often do, deferred tax arises; later courses cover it.' },
    { p: '<g>Income tax expense</g> for the year is therefore <m>0.25 \\times 36{,}516 = 9{,}129</m> dollars. Lantern paid $6,000 of estimated tax during the year, so the year-end adjustment records the rest as a liability:' },
    { journal: { caption: 'Lantern’s income tax adjustment at 31 December 2026 (fictional)', entries: [{ date: e9.date, lines: e9.lines, memo: e9.text }] } },
    { p: 'Two rates are worth telling apart. The <g>statutory tax rate</g> is the rate set by law (21% federal). The <g>effective tax rate</g> is income tax expense divided by income before income tax: for Lantern <m>9{,}129 \\div 36{,}516 = 25\\%</m>, equal to the assumed rate only because the case has no tax differences. In real companies the two often differ, and the notes explain why.' },
    { h: 'EBIT and EBITDA' },
    { p: 'F00 defined <g>EBIT</g> (earnings before interest and taxes) and <g>EBITDA</g> (EBIT plus depreciation and amortisation). With a multi-step statement both can be calculated in two directions. Working up from the bottom, as the SEC staff describe, EBIT is net income with interest and income tax added back: <m>27{,}387 + 1{,}200 + 9{,}129 = 37{,}716</m>. Working down, it is operating income plus or minus any non-operating items other than interest: Lantern has none, so EBIT equals operating income, $37,716. Adding back depreciation of $4,800 (Lantern has no amortisation) gives EBITDA of $42,516.' },
    { math: String.raw`\text{EBIT} = \text{Net income} + \text{Interest expense} + \text{Income tax expense}, \qquad \text{EBITDA} = \text{EBIT} + \text{D\&A}` },
    { p: 'EBITDA is often described as a proxy for operating cash flow, but it is not cash. Lantern’s net cash from operating activities was $39,940, not $42,516: it paid $6,450 of interest and tax, which EBITDA ignores, while unpaid bills and customers’ advance payments ($17,410) more than covered the cash tied up in receivables, inventory, supplies and prepaid insurance ($13,536). Module 3 reconciles the two. And depreciation, though not a cash payment this year, stands for equipment and a van that will have to be replaced.' },
    { callout: 'standards', title: 'EBITDA and the SEC’s rules on non-GAAP measures', html: 'Neither US GAAP nor IFRS defines EBITDA, so it is a <g>non-GAAP financial measure</g>. When a company registered with the SEC discloses one publicly, Regulation G requires it to present the most directly comparable GAAP measure (for EBITDA, net income) and a quantitative reconciliation between the two, and forbids a presentation that is misleading (17 CFR 244.100(a) and (b)). In filings, Item 10(e) of Regulation S-K also requires the GAAP measure to be shown with equal or greater prominence (Non-GAAP Compliance and Disclosure Interpretation 102.10). The SEC staff’s interpretations define EBITDA as net income plus interest, taxes, depreciation and amortisation, and say a measure calculated differently should not be called EBITDA but given a distinct title, such as <g>Adjusted EBITDA</g> (Interpretation 103.01). Lantern is not an SEC registrant, so the rules don’t bind it, but they describe good practice for any business quoting EBITDA to a lender.' },
    { h: 'Earnings per share' },
    { p: 'Companies whose common shares, or securities that can become common shares, trade in a public market, or that are preparing to sell them in one, must report <g>basic earnings per share</g>, and <g>diluted earnings per share</g> as well when they have potential common shares such as options or convertible securities (ASC 260-10-15-2; IAS 33 sets a similar requirement under IFRS). Basic EPS divides net income available to common shareholders (net income less preferred dividends) by the weighted average number of common shares outstanding during the period; diluted EPS also counts shares that options and convertible securities could add. For example, a fictional listed company, Quarrybank Foods, with net income of $12.6 million, preferred dividends of $0.6 million, and 7.5 million common shares for the first half of the year and 8.5 million for the second, reports basic EPS of <m>(12.6 - 0.6) \\div 8.0 = 1.50</m> dollars. Lantern’s shares are privately held, so it reports no EPS.' },
  ],

  formulas: [
    { id: 'is-gross-profit', name: 'Gross profit and gross margin (multi-step)',
      tex: String.raw`\text{Gross profit} = \text{Net revenue} - \text{Cost of sales}, \qquad \text{Gross margin} = \dfrac{\text{Gross profit}}{\text{Net revenue}}`,
      where: [
        [String.raw`\text{Net revenue}`, 'Revenue less returns, allowances and discounts', '$'],
        [String.raw`\text{Cost of sales}`, 'Cost of goods sold plus cost of services: the direct cost of what was sold', '$'],
      ],
      note: 'Lantern: <m>193{,}320 - 88{,}900 = 104{,}420</m>, a margin of about 54.0%.' },
    { id: 'is-operating-income', name: 'Operating income',
      tex: String.raw`\text{Operating income} = \text{Gross profit} - \text{Operating expenses} + \text{Gains on disposals}`,
      where: [
        [String.raw`\text{Gross profit}`, 'Net revenue less cost of sales', '$'],
        [String.raw`\text{Operating expenses}`, 'Selling, general and administrative and other costs of running the business, including depreciation', '$'],
        [String.raw`\text{Gains on disposals}`, 'Gains on selling long-lived assets such as equipment; losses on disposals are included in operating expenses (ASC 360-10-45-5)', '$'],
      ],
      note: 'Lantern, which sold no equipment in 2026: <m>104{,}420 - 66{,}704 + 0 = 37{,}716</m>.' },
    { id: 'is-net-income', name: 'From operating income to net income',
      tex: String.raw`\text{IBT} = \text{Operating income} + \text{Other income} - \text{Other expenses}, \qquad \text{Net income} = \text{IBT} - \text{Income tax expense}`,
      where: [
        [String.raw`\text{IBT}`, 'Income before income tax', '$'],
        [String.raw`\text{Other income}, \text{Other expenses}`, 'Non-operating items such as interest revenue and interest expense (under US GAAP, gains and losses on disposals are operating items)', '$'],
        [String.raw`\text{Income tax expense}`, 'The tax charged on the period’s income (Lantern: 25% of IBT)', '$'],
      ],
      note: 'Lantern: <m>37{,}716 - 1{,}200 = 36{,}516</m>; <m>36{,}516 - 9{,}129 = 27{,}387</m>.' },
    { id: 'is-ebit-ebitda', name: 'EBIT and EBITDA from net income',
      tex: String.raw`\text{EBIT} = \text{NI} + \text{Interest expense} + \text{Income tax expense}, \qquad \text{EBITDA} = \text{EBIT} + \text{D\&A}`,
      where: [
        [String.raw`\text{NI}`, 'Net income as reported under GAAP', '$'],
        [String.raw`\text{Interest expense}`, 'Interest charged in the period (net of interest revenue, if the company defines it that way)', '$'],
        [String.raw`\text{D\&A}`, 'Depreciation and amortisation expense', '$'],
      ],
      assumptions: 'The SEC staff’s definition. Measures with further adjustments need another name, such as Adjusted EBITDA, and a reconciliation to net income.',
      note: 'Lantern: EBIT <m>27{,}387 + 1{,}200 + 9{,}129 = 37{,}716</m>; EBITDA <m>37{,}716 + 4{,}800 = 42{,}516</m>.' },
    { id: 'is-effective-rate', name: 'Effective tax rate',
      tex: String.raw`\text{Effective tax rate} = \dfrac{\text{Income tax expense}}{\text{Income before income tax}}`,
      where: [
        [String.raw`\text{Income tax expense}`, 'Total tax charged in the income statement for the period', '$'],
        [String.raw`\text{Income before income tax}`, 'The subtotal before tax', '$'],
      ],
      note: 'Lantern: <m>9{,}129 \\div 36{,}516 = 25\\%</m>.' },
    { id: 'is-basic-eps', name: 'Basic earnings per share',
      tex: String.raw`\text{Basic EPS} = \dfrac{\text{Net income} - \text{Preferred dividends}}{\text{Weighted shares}}`,
      where: [
        [String.raw`\text{Net income}`, 'Net income for the period', '$'],
        [String.raw`\text{Preferred dividends}`, 'Dividends due to preferred shareholders for the period', '$'],
        [String.raw`\text{Weighted shares}`, 'The weighted average number of common shares outstanding: each share weighted by the fraction of the period it was outstanding', 'shares'],
      ],
      note: 'Quarrybank Foods: <m>(12.6 - 0.6) \\div 8.0 = 1.50</m> dollars a share.' },
  ],

  examples: [
    { level: 'simple', title: 'A multi-step statement for a yarn shop', fictional: true,
      setup: 'Teasel Yarn Company, a fictional retailer, has these balances in its adjusted trial balance for the year: Sales $420,000; Sales Returns and Allowances $8,000; Sales Discounts $2,000; Cost of Goods Sold $236,000; Wages Expense $61,000; Rent Expense $24,000; Advertising Expense $9,500; Depreciation Expense $7,200; Utilities Expense $5,300; Interest Expense $3,000; Interest Revenue $400. Its income tax rate is 25%. Prepare a multi-step income statement.',
      statement: {
        title: 'Teasel Yarn Company', subtitle: 'Income statement for the year (fictional)',
        sections: [
          { head: 'Revenue', rows: [['Sales', ty.sales], ['Sales returns and allowances', -ty.returns], ['Sales discounts', -ty.discounts]], total: ['Net sales', tyNet] },
          { rows: [['Net sales', tyNet], ['Cost of goods sold', -ty.cogs]], total: ['Gross profit', tyGP] },
          { head: 'Operating expenses', rows: [['Wages', ty.wages], ['Rent', ty.rent], ['Advertising', ty.adv], ['Depreciation', ty.dep], ['Utilities', ty.util]], total: ['Total operating expenses', tyOpex] },
          { rows: [['Gross profit', tyGP], ['Less total operating expenses', -tyOpex]], total: ['Operating income', tyOI] },
          { rows: [['Operating income', tyOI], ['Interest revenue', ty.intRev], ['Interest expense', -ty.intExp]], total: ['Income before income tax', tyIBT] },
          { rows: [['Income before income tax', tyIBT], ['Income tax expense', -tyTax]], total: ['Net income', tyNI] },
        ],
      },
      steps: [
        'Net sales: <m>420{,}000 - 8{,}000 - 2{,}000 = 410{,}000</m>. Both contra-revenue accounts are deducted before any expense.',
        'Gross profit: <m>410{,}000 - 236{,}000 = 174{,}000</m>, a gross margin of <m>174{,}000 \\div 410{,}000 \\approx 42.4\\%</m>.',
        'Operating expenses: <m>61{,}000 + 24{,}000 + 9{,}500 + 7{,}200 + 5{,}300 = 107{,}000</m>; operating income <m>174{,}000 - 107{,}000 = 67{,}000</m>.',
        'Other items: interest revenue and interest expense are not operating, so they come next: <m>67{,}000 + 400 - 3{,}000 = 64{,}400</m> of income before income tax.',
        'Income tax: <m>0.25 \\times 64{,}400 = 16{,}100</m>; net income <m>64{,}400 - 16{,}100 = 48{,}300</m>.',
      ],
      answer: 'Net sales $410,000; gross profit $174,000; operating income $67,000; income before income tax $64,400; net income $48,300.',
      interpretation: 'A single-step statement would show the same $48,300, but not that the shop keeps about 42 cents of gross profit on each dollar of sales and spends 26 cents of it running the shop.' },
    { level: 'challenging', title: 'Lantern’s subtotals: classification, EBIT and EBITDA', fictional: true,
      setup: 'Suppose Lantern’s accountant had kept F01’s classification, leaving the event baristas’ wages in Wages Expense and the supplies used at events and workshops in Supplies Expense, so that only cost of goods sold was deducted to reach gross profit. Calculate gross profit, gross margin and operating income under that classification and under the one the accountant used, then calculate Lantern’s EBIT and EBITDA from the bottom of the statement.',
      table: {
        caption: 'Lantern’s subtotals under two classifications, 2026 (fictional)',
        head: ['Subtotal', 'Cost of goods sold only ($)', 'Cost of sales including services ($)'],
        align: ['l', 'r', 'r'],
        rows: [
          ['Net revenue', '193,320', '193,320'],
          ['Cost of sales', '52,800', '88,900'],
          ['Gross profit', '140,520', '104,420'],
          ['Gross margin', '72.7%', '54.0%'],
          ['Operating expenses', '102,804', '66,704'],
          ['Operating income', '37,716', '37,716'],
        ],
      },
      steps: [
        'Under F01’s classification, cost of sales is only cost of goods sold: gross profit <m>193{,}320 - 52{,}800 = 140{,}520</m>, a margin of <m>140{,}520 \\div 193{,}320 \\approx 72.7\\%</m>. The $36,100 of event wages and supplies moves to operating expenses: <m>66{,}704 + 36{,}100 = 102{,}804</m>.',
        'Under the accountant’s classification: gross profit <m>193{,}320 - 88{,}900 = 104{,}420</m>, about 54.0%, with operating expenses of 66,704.',
        'Operating income is <m>140{,}520 - 102{,}804 = 104{,}420 - 66{,}704 = 37{,}716</m> either way: reclassifying a cost between sections moves subtotals above it, never the total below.',
        'EBIT from the bottom: <m>27{,}387 + 1{,}200 + 9{,}129 = 37{,}716</m>, equal to operating income because Lantern has no other income.',
        'EBITDA: <m>37{,}716 + 4{,}800 = 42{,}516</m>; it adds back the depreciation of the espresso equipment ($2,000) and the van ($2,800).',
      ],
      answer: 'Gross profit $140,520 (72.7%) with cost of goods sold only, or $104,420 (54.0%) with the cost of services included; operating income $37,716 either way; EBIT $37,716; EBITDA $42,516.',
      interpretation: 'The 72.7% figure would make catering look as if it cost nothing to deliver. Gross margin is only as meaningful as the costs put above it, which is why the accountant separated the direct costs of services, and why comparisons of gross margin between companies must check what each includes.' },
    { level: 'applied', title: 'Quoting EBITDA to the bank', fictional: true,
      setup: 'Suppose that in early 2027 Coastline Bank considers lending Lantern $40,000 for a second kitchen. Its term sheet requires 2026 “EBITDA, as defined in the agreement” of at least $40,000, where the agreement defines EBITDA as net income plus interest, income tax, depreciation and amortisation, and inventory write-downs. Ana’s draft letter says “EBITDA: $44,320”, because she has also added back the Holiday Blend write-down and the bad debts as one-off costs. What figures should the letter show, and how should they be labelled?',
      steps: [
        'EBITDA in the standard sense, as the SEC staff define it: <m>27{,}387 + 1{,}200 + 9{,}129 + 4{,}800 = 42{,}516</m>.',
        'EBITDA as the loan agreement defines it adds the inventory write-down: <m>42{,}516 + 400 = 42{,}916</m>, above the $40,000 test. The bank’s definition governs the covenant, whatever the figure is called elsewhere.',
        'Ana’s figure adds bad debts as well: <m>42{,}516 + 400 + 1{,}404 = 44{,}320</m>. Neither definition allows it, and bad debts are a normal, recurring cost of invoicing catering clients, not a one-off. Calling the result EBITDA would misstate both measures.',
        'Good practice, borrowed from the SEC’s rules: start from net income, show each item added back, call any figure that differs from the standard definition by its own name, such as “EBITDA as defined in the loan agreement”, and give net income at least as much prominence.',
      ],
      answer: 'Report net income $27,387, EBITDA $42,516 and “EBITDA as defined in the loan agreement” $42,916, each reconciled from net income. Drop the $44,320, which adds back a recurring cost.',
      interpretation: 'Lantern meets the bank’s test without flattering the figure. A lender that finds an inflated EBITDA in one letter will check every later figure more sceptically; a clear reconciliation from net income costs nothing and builds trust.' },
  ],

  demo: [
    { widget: 'is-drivers', intro: 'Lantern’s 2026 income statement in six inputs. Change one at a time and watch which subtotals move: depreciation changes operating income, EBIT and net income but not EBITDA; interest changes net income but not EBIT; the tax rate touches only the last two lines.' },
  ],

  mistakes: [
    { title: '“A multi-step statement gives a different net income.”', html: 'It groups the same accounts differently. Lantern’s net income is $27,387 in both formats; only the subtotals above it are new.' },
    { title: '“Interest is an operating expense.”', html: 'Interest is the cost of how the business is financed, not of running it, so the multi-step statement shows it after operating income. That is what lets operating income be compared between businesses with different amounts of debt.' },
    { title: '“Income tax expense is the tax paid.”', html: 'Tax expense is the tax charged on the year’s income, whenever it is paid. Lantern’s expense is $9,129; it paid $6,000 during the year and owes $3,129 at the year end.' },
    { title: '“EBITDA is a GAAP figure, and it is the cash the business generates.”', html: 'Neither US GAAP nor IFRS defines EBITDA. It ignores interest and tax actually paid, the cash tied up in receivables and inventory, and the spending needed to replace equipment. Lantern’s EBITDA is $42,516; its operating cash flow is $39,940.' },
    { title: '“Dividends appear at the bottom of the income statement.”', html: 'Dividends are distributions of net income to owners, not costs of earning it. Lantern’s $5,000 of dividends appears in the statement of changes in equity, where it reduces retained earnings.' },
  ],

  application: [
    { p: '<b>The loan officer’s reading.</b> Coastline Bank’s loan officer reads Lantern’s statement from the top. Gross profit of $104,420 says the products and services are priced well above their direct cost, and operating income of $37,716 says the business covers its rent, staff and overheads with room to spare. Interest of $1,200 is small against that operating income, so the loans look affordable from profit; whether they are affordable from cash is a question for the statement of cash flows. For a first year, the officer will mostly be looking for a base to compare 2027 against.' },
    { p: '<b>Ana’s pricing decision.</b> The gross margin table changes how Ana thinks about growth. Each extra dollar of catering and workshop revenue brings about 57 cents of gross profit before any overheads, each extra dollar of shop sales about 52 cents, and the shop’s dollar then pays shipping and card fees as well. Before she spends more on shop advertising, she can ask whether the same money would win more catering clients. The multi-step format doesn’t make the decision, but without it the comparison couldn’t be made.' },
    { p: '<b>An investor reading a press release.</b> When a listed company leads its results announcement with an adjusted figure, an investor reading “Adjusted EBITDA up 18%” goes first to the reconciliation the SEC requires, to see what was added back: interest, tax, depreciation and amortisation are standard; restructuring costs, share-based pay and “one-off” items that recur every year deserve scrutiny. Then the investor checks net income and earnings per share, which the rules require to be shown at least as prominently. F03 develops the analysis that follows.' },
  ],

  summary: [
    'A multi-step income statement deducts costs in stages: net revenue, cost of sales, gross profit, operating expenses, operating income, other income and expenses, income before income tax, income tax, net income. Net income equals the single-step figure.',
    'Lantern, 2026: net revenue $193,320; cost of sales $88,900 (goods $52,800, services $36,100); gross profit $104,420 (54.0%); operating expenses $66,704; operating income $37,716; interest $1,200; income tax $9,129; net income $27,387.',
    'Cost of services collects the direct costs of catering and workshops, so that gross profit is meaningful for a business that sells services as well as goods.',
    'Expenses can be presented by function (cost of sales, selling, administrative) or by nature (goods, wages, depreciation); IAS 1 requires one or the other, with nature disclosures when the function method is used.',
    'Income tax expense is the tax on the year’s income: 25% of $36,516 in the case, against a 21% US federal statutory rate. Lantern paid $6,000 and owes $3,129.',
    'EBIT = net income + interest + tax = $37,716; EBITDA = EBIT + D&A = $42,516. EBITDA is a non-GAAP measure: SEC registrants must reconcile it to net income, give net income equal or greater prominence, and call a differently calculated figure something else, such as Adjusted EBITDA.',
    'Public companies report basic and diluted earnings per share: net income less preferred dividends, divided by the weighted average common shares.',
  ],

  glossary: [
    { term: 'Single-step income statement', def: 'An income statement that adds up all revenues and all expenses and subtracts once to give net income, with no intermediate subtotals.' },
    { term: 'Multi-step income statement', def: 'An income statement that deducts costs in stages and shows subtotals such as gross profit, operating income and income before income tax before net income.' },
    { term: 'Cost of sales', def: 'The direct cost of the goods and services sold in a period: cost of goods sold, plus cost of services for a business that sells services.' },
    { term: 'Cost of services', def: 'The direct costs of providing services sold, such as the wages of staff who deliver them and the materials they use.' },
    { term: 'Operating expenses', def: 'The costs of running a business that are not part of cost of sales, such as selling, general and administrative costs, rent and depreciation.' },
    { term: 'Operating income', def: 'Gross profit less operating expenses: what a business earns from its ordinary activities before interest, other non-operating items and income tax. Also called income from operations or operating profit. Under US GAAP it includes gains and losses on selling long-lived assets.' },
    { term: 'Other income and expenses', def: 'Income and expenses that do not arise from a business’s main operations, such as interest revenue and interest expense. Shown after operating income. Under US GAAP, gains and losses on selling long-lived assets are not among them: they are included in operating income.' },
    { term: 'Income tax expense', def: 'The income tax charged on a period’s income, whether or not it has been paid. Deducted from income before income tax to give net income.' },
    { term: 'Statutory tax rate', def: 'The rate of tax set by law, such as the 21% US federal corporate income tax rate.' },
    { term: 'Effective tax rate', def: 'Income tax expense divided by income before income tax.' },
    { term: 'Function of expense method', def: 'Presenting expenses grouped by the activity they serve, such as cost of sales, selling, and general and administrative.' },
    { term: 'Nature of expense method', def: 'Presenting expenses grouped by their nature, such as goods purchased, employee wages, depreciation and rent, without allocating them to activities.' },
    { term: 'Non-GAAP financial measure', def: 'A measure of financial performance or position, such as EBITDA, that is not defined by the accounting framework used in the financial statements.' },
    { term: 'Adjusted EBITDA', def: 'A label for an EBITDA-like measure with further adjustments beyond net income plus interest, taxes, depreciation and amortisation. Its definition is the company’s own, so it must be read with its reconciliation.' },
    { term: 'Basic earnings per share', def: 'Net income less preferred dividends, divided by the weighted average number of common shares outstanding in the period.' },
    { term: 'Diluted earnings per share', def: 'Earnings per share recalculated as if options, convertible securities and similar instruments had been turned into common shares, when that would reduce it.' },
  ],

  references: [
    { text: 'Franklin, M., Graybeal, P. &amp; Cooper, D. (2019). <i>Principles of Accounting, Volume 1: Financial Accounting</i>, section 6.6, “Describe and Prepare Multi-Step and Simple Income Statements for Merchandising Companies”. OpenStax.', url: 'https://openstax.org/books/principles-financial-accounting/pages/6-6-describe-and-prepare-multi-step-and-simple-income-statements-for-merchandising-companies', checked: '2026-10-23' },
    { text: 'Australian Accounting Standards Board. <i>Compiled AASB 101 Presentation of Financial Statements</i> (compiled 31 December 2022), which incorporates IAS 1 with its paragraph numbering; paragraphs 82, 99, 102, 103 and 104. Federal Register of Legislation.', url: 'https://www.legislation.gov.au/F2015L01626/2022-12-31/2022-12-31/text/original/epub/OEBPS/document_1/document_1.html', checked: '2026-10-23' },
    { text: '<i>United States Code</i>, title 26, §11, “Tax imposed” (subsection (b): 21 percent of taxable income), with the note on Pub. L. 115-97, §13001. Office of the Law Revision Counsel, current through Pub. L. 119-120.', url: 'https://uscode.house.gov/us/usc/119-120/t26/s11/', checked: '2026-10-23' },
    { text: '<i>Code of Federal Regulations</i>, title 17, §244.100, “General requirements” (Regulation G). Legal Information Institute, Cornell Law School.', url: 'https://www.law.cornell.edu/cfr/text/17/244.100', checked: '2026-10-23' },
    { text: 'US Securities and Exchange Commission, Division of Corporation Finance. <i>Non-GAAP Financial Measures: Compliance and Disclosure Interpretations</i>, Questions 102.10, 103.01 and 103.02. Last updated 13 December 2022.', url: 'https://www.sec.gov/divisions/corpfin/guidance/nongaapinterp.htm', checked: '2026-10-23' },
    { text: 'Deloitte. <i>Roadmap: Impairments and Disposals of Long-Lived Assets and Discontinued Operations</i>, section 6.3, “Income Statement Presentation for Disposals That Are Not Discontinued Operations” (quotes ASC 360-10-45-5). DART.', url: 'https://dart.deloitte.com/USDART/home/codification/presentation/asc205-20/roadmap-disposals-long-lived-assets-discontinued-operations/chapter-6-presentation-disclosure-requirements-for/6-3-income-statement-presentation-for', checked: '2026-10-23' },
    { text: 'Deloitte. <i>Roadmap: Earnings per Share</i>, section 2.1, “General” (scope of ASC 260, quoting ASC 260-10-15-2). DART.', url: 'https://dart.deloitte.com/USDART/home/codification/presentation/asc260-10/roadmap-earnings-per-share/chapter-2-scope/2-1-general', checked: '2026-10-23' },
  ],

  checks: [
    // single-step and the staircase
    { what: 'Net income', value: D.netIncome, shown: 27387 },
    { what: 'Net revenue', value: D.revenue, shown: 193320 },
    { what: 'Single-step total expenses', value: totalExpenses, shown: 165933 },
    { what: 'Single-step net income', value: D.revenue - totalExpenses, shown: 27387 },
    { what: 'Net income per dollar of revenue (about 14 cents)', value: D.netIncome / D.revenue * 100, shown: 14, tol: 0.5 },
    { what: 'Cost of sales share of revenue (almost half)', value: D.costOfSales / D.revenue, shown: 0.46, tol: 0.005 },
    { what: 'Tax is a quarter of IBT', value: D.incomeTax / D.incomeBeforeTax, shown: 0.25 },
    // statement sections
    { what: 'Gross revenue', value: D.grossRevenue, shown: 194345 },
    { what: 'Cost of goods sold', value: D.cogs, shown: 52800 },
    { what: 'Cost of services', value: D.costOfServices, shown: 36100 },
    { what: 'Cost of services = event wages + supplies used', value: F.wages.events + costOfSuppliesUsed, shown: 36100 },
    { what: 'Event wages', value: F.wages.events, shown: 25200 },
    { what: 'Supplies used', value: costOfSuppliesUsed, shown: 10900 },
    { what: 'Cost of sales', value: D.costOfSales, shown: 88900 },
    { what: 'Gross profit', value: D.grossProfit, shown: 104420 },
    { what: 'Gross margin', value: D.grossProfit / D.revenue * 100, shown: 54.0, tol: 0.05 },
    { what: 'Shop net revenue', value: D.netOnlineSales, shown: 110000 },
    { what: 'Services revenue', value: servicesRevenue, shown: 83320 },
    { what: 'Shop gross profit', value: D.netOnlineSales - D.cogs, shown: 57200 },
    { what: 'Services gross profit', value: servicesGP, shown: 47220 },
    { what: 'Shop gross margin', value: (D.netOnlineSales - D.cogs) / D.netOnlineSales * 100, shown: 52.0, tol: 0.05 },
    { what: 'Services gross margin', value: servicesGP / servicesRevenue * 100, shown: 56.7, tol: 0.05 },
    { what: 'Services margin (about 57 cents)', value: servicesGP / servicesRevenue * 100, shown: 57, tol: 0.5 },
    { what: 'Shipping', value: op['Shipping Expense'], shown: 12630 },
    { what: 'Card fees', value: op['Card and Platform Fees Expense'], shown: 4010 },
    { what: 'Operating expenses', value: D.operatingExpenses, shown: 66704 },
    { what: 'Selling and fulfilment', value: selling, shown: 23140 },
    { what: 'General and administrative', value: admin, shown: 43564 },
    { what: 'G&A from accounts', value: op['Wages Expense'] + op['Rent Expense'] + op['Utilities Expense'] + op['Insurance Expense'] + op['Depreciation Expense'] + op['Fuel Expense'] + op['Bad Debt Expense'] + op['Miscellaneous Expense'], shown: 43564 },
    { what: 'All wages', value: employee, shown: 43600 },
    { what: 'Inventory on hand', value: D.inventoryEnd, shown: 5800 },
    { what: 'Operating income', value: D.operatingIncome, shown: 37716 },
    { what: 'Operating income per dollar (19.5 cents)', value: D.operatingIncome / D.revenue * 100, shown: 19.5, tol: 0.05 },
    // other items and tax
    { what: 'Interest expense', value: D.interestExpense, shown: 1200 },
    { what: 'Interest paid', value: F.coastline.interestPaid, shown: 450 },
    { what: 'Interest accrued', value: F.coastline.interestAccrued + F.vanNote.principal * F.vanNote.rate * F.vanNote.months / 12, shown: 750 },
    { what: 'Coastline December interest', value: F.coastline.interestAccrued, shown: 50 },
    { what: 'Van note interest', value: F.vanNote.principal * F.vanNote.rate * F.vanNote.months / 12, shown: 700 },
    { what: 'Interest = paid + accrued', value: F.coastline.interestPaid + F.coastline.interestAccrued + F.vanNote.principal * F.vanNote.rate * F.vanNote.months / 12, shown: 1200 },
    // EBITDA against cash from operations
    { what: 'Interest and tax paid', value: paidInterestTax, shown: 6450 },
    { what: 'Unpaid bills and advance payments', value: fundedBy, shown: 17410 },
    { what: 'Cash tied up in receivables, inventory, supplies and prepaid insurance', value: tiedUp, shown: 13536 },
    { what: 'EBITDA reconciles to cash from operations', value: D.ebitda - paidInterestTax - tiedUp + fundedBy, shown: D.cfo },
    { what: 'Engine agrees: working-capital total', value: RESULTS.indirect.workingCapital.reduce((s, [, v]) => s + v, 0) + RESULTS.indirect.workingCapital.filter(([n]) => /interest payable|income taxes payable/i.test(n)).reduce((s, [, v]) => s - v, 0), shown: fundedBy - tiedUp },
    { what: 'Income before tax', value: D.incomeBeforeTax, shown: 36516 },
    { what: 'Tax rate', value: F.tax.rate * 100, shown: 25 },
    { what: 'Income tax', value: D.incomeTax, shown: 9129 },
    { what: 'Income tax = 25% × IBT', value: F.tax.rate * D.incomeBeforeTax, shown: 9129 },
    { what: 'Estimated tax paid', value: F.tax.estimatedPaid, shown: 6000 },
    { what: 'Tax payable', value: D.taxPayable, shown: 3129 },
    { what: 'e9 amount', value: e9.lines[0].dr, shown: 3129 },
    { what: 'Effective rate', value: D.incomeTax / D.incomeBeforeTax * 100, shown: 25 },
    // EBIT, EBITDA
    { what: 'EBIT', value: D.ebit, shown: 37716 },
    { what: 'EBIT bottom-up', value: D.netIncome + D.interestExpense + D.incomeTax, shown: 37716 },
    { what: 'Depreciation', value: D.depreciation, shown: 4800 },
    { what: 'Equipment depreciation', value: F.equipment.monthly * F.equipment.months, shown: 2000 },
    { what: 'Van depreciation', value: F.van.monthly * F.van.months, shown: 2800 },
    { what: 'EBITDA', value: D.ebitda, shown: 42516 },
    { what: 'EBITDA = EBIT + D&A', value: D.ebit + D.depreciation, shown: 42516 },
    { what: 'Cash from operations', value: D.cfo, shown: 39940 },
    { what: 'Dividends', value: D.dividends, shown: 5000 },
    // EPS
    { what: 'Quarrybank weighted shares', value: qbShares, shown: 8.0 },
    { what: 'Quarrybank EPS', value: (qb.ni - qb.pref) / qbShares, shown: 1.50 },
    // Teasel
    { what: 'Teasel net sales', value: tyNet, shown: 410000 },
    { what: 'Teasel gross profit', value: tyGP, shown: 174000 },
    { what: 'Teasel gross margin', value: tyGP / tyNet * 100, shown: 42.4, tol: 0.05 },
    { what: 'Teasel opex', value: tyOpex, shown: 107000 },
    { what: 'Teasel operating income', value: tyOI, shown: 67000 },
    { what: 'Teasel IBT', value: tyIBT, shown: 64400 },
    { what: 'Teasel tax', value: tyTax, shown: 16100 },
    { what: 'Teasel net income', value: tyNI, shown: 48300 },
    { what: 'Teasel 42 cents', value: tyGP / tyNet * 100, shown: 42, tol: 0.5 },
    { what: 'Teasel 26 cents of opex per dollar of sales', value: tyOpex / tyNet * 100, shown: 26, tol: 0.5 },
    // challenging example
    { what: 'GP with COGS only', value: D.revenue - D.cogs, shown: 140520 },
    { what: 'Margin with COGS only', value: (D.revenue - D.cogs) / D.revenue * 100, shown: 72.7, tol: 0.05 },
    { what: 'Opex with services', value: D.operatingExpenses + D.costOfServices, shown: 102804 },
    { what: 'Operating income either way', value: (D.revenue - D.cogs) - (D.operatingExpenses + D.costOfServices), shown: 37716 },
    // applied example
    { what: 'Bank-defined EBITDA', value: bankEbitda, shown: 42916 },
    { what: 'Ana’s figure', value: anaEbitda, shown: 44320 },
    { what: 'Write-down', value: F.inventory.writeDown, shown: 400 },
    { what: 'Bad debts', value: D.badDebt, shown: 1404 },
  ],
};
