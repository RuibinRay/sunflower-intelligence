// common-size-statements.js — F03 · Common-size statements. Content only; exercises are in common-size-statements.ex.js.
// Lantern’s figures come from case.js (COMPARATIVE, PERIODS, FACTS); Harbourline Roasters (fictional peer) from
// f00/case.js; Starbucks FY2024 from its Form 10-K. Other businesses are fictional: Larch & Loom (simple example),
// Copperleaf Bakeries and Juniper Street Bakery (challenging example). checks recompute every printed number.
import { COMPARATIVE, PERIODS, FACTS as F } from './case.js?v=18';
import { HARBOURLINE as H, HARBOURLINE_DETAIL as HD } from '../f00/case.js?v=18';
import * as R from '../../../core/ratios.js?v=18';

const P26 = PERIODS[2026], P27 = PERIODS[2027];
const IS = Object.fromEntries(COMPARATIVE.income.map(([n, a, b]) => [n, [a, b]]));
const BS = Object.fromEntries(COMPARATIVE.balance.map(([n, a, b]) => [n, [a, b]]));
const usd = (v) => `${v < 0 ? '−' : ''}$${Math.abs(Math.round(v)).toLocaleString('en-US')}`;
const pc = (x, d = 1) => `${x < 0 ? '−' : ''}${Math.abs(x * 100).toFixed(d)}%`;
const p1 = (x) => `${x < 0 ? '−' : ''}${Math.abs(x * 100).toFixed(1)}`;
const pts = (x) => `${x > 0 ? '+' : x < 0 ? '−' : ''}${Math.abs(x * 100).toFixed(1)}`;
const M26 = R.profitability(P26), M27 = R.profitability(P27, P26);

// ---------------------------------------------------------------- Lantern: the common-size income statement
const label = (n) => n.replace(/ Expense$/, ' expense').replace(/ Revenue$/, ' revenue').replace('Cost of Goods Sold', 'Cost of goods sold').replace('Cost of Services', 'Cost of services')
  .replace('Sales Returns and Allowances', 'Sales returns and allowances').replace('Operating Lease Cost', 'Operating lease cost').replace('Card and Platform Fees', 'Card and platform fees');
const csIS = R.commonSize(COMPARATIVE.income.map(([n, a]) => [n, a]), P26.revenue);
const csIS27 = R.commonSize(COMPARATIVE.income.map(([n, , b]) => [n, b]), P27.revenue);
const isRows = csIS.map(([n, , s], i) => [label(n), p1(s), p1(csIS27[i][2]), pts(csIS27[i][2] - s)]);
const sh = (n, y) => IS[n][y] / [P26.revenue, P27.revenue][y];
const costOfSales = [P26.cogs / P26.revenue, P27.cogs / P27.revenue];
const opex = [P26.grossProfit - P26.operatingIncome, P27.grossProfit - P27.operatingIncome];
const ebitda = [P26.ebit + P26.da, P27.ebit + P27.da];
// the chart groups: rent and lease together; other operating expenses by difference
const occ = [IS['Rent Expense'][0] + IS['Operating Lease Cost'][0], IS['Rent Expense'][1] + IS['Operating Lease Cost'][1]];
const otherOpex = [opex[0] - IS['Wages Expense'][0] - occ[0], opex[1] - IS['Wages Expense'][1] - occ[1]];

// ---------------------------------------------------------------- classification: café staff into cost of sales
const cafeStaff = F.wages.cafes;
const gmReclass = (P27.grossProfit - cafeStaff) / P27.revenue;

// ---------------------------------------------------------------- Lantern: the common-size balance sheet
const ta = [P26.totalAssets, P27.totalAssets];
const bsPair = (...names) => [names.reduce((s, n) => s + BS[n][0], 0), names.reduce((s, n) => s + BS[n][1], 0)];
const bsLines = [
  ['Cash', bsPair('Cash')],
  ['Accounts receivable, net', [P26.receivables, P27.receivables]],
  ['Contract asset', bsPair('Contract Asset')],
  ['Inventory, supplies and prepaid insurance', bsPair('Inventory', 'Supplies', 'Prepaid Insurance')],
  ['Total current assets', bsPair('Total current assets')],
  ['Property and equipment, net', [P26.ppeNet, P27.ppeNet]],
  ['Operating lease right-of-use assets', bsPair('Operating Lease Right-of-Use Assets')],
  ['Total assets', bsPair('Total assets')],
  ['Total current liabilities', bsPair('Total current liabilities')],
  ['Operating lease liabilities (current and noncurrent)', [P26.leaseLiabilities, P27.leaseLiabilities]],
  ['Debt (notes, instalment note, line of credit)', [P26.debt, P27.debt]],
  ['Total liabilities', bsPair('Total liabilities')],
  ['Total equity', bsPair('Total equity')],
];
const bsRows = bsLines.map(([n, [a, b]]) => [n, p1(a / ta[0]), p1(b / ta[1]), pts(b / ta[1] - a / ta[0])]);
const s = (pair, y) => pair[y] / ta[y];

// ---------------------------------------------------------------- Starbucks FY2024 ($ millions, Form 10-K)
const SB = { rev: 36176.2, pdc: 11180.6, soe: 15286.5, ooe: 565.6, daIS: 1512.6, ga: 2523.3, opexTotal: 31068.6, equityInv: 301.2, oi: 5408.8,
  interest: 562.0, tax: 1207.3, ni: 3760.9, daCF: 1592.4,
  ta: 31339.3, cash: 3286.2, ppe: 8665.5, rou: 9286.2, leaseCur: 1463.1, leaseNon: 8771.6, ltdCur: 1248.9, ltd: 14319.5, tl: 38780.9, eq: -7441.6 };
const sbS = (x) => x / SB.rev, sbB = (x) => x / SB.ta;
const sbEbitda = (SB.oi + SB.daCF) / SB.rev;

// ---------------------------------------------------------------- Harbourline Roasters (fictional, $ millions, f00)
const hEbitda = H.ebit + H.da;
const hb = (x) => x / HD.totalAssets;

// ---------------------------------------------------------------- Larch & Loom (fictional, simple example)
const LL = { rev: 4800000, cogs: 2160000, sga: 1920000, da: 240000, interest: 96000, taxRate: 0.25 };
LL.gp = LL.rev - LL.cogs; LL.oi = LL.gp - LL.sga - LL.da; LL.ebitda = LL.oi + LL.da; LL.pretax = LL.oi - LL.interest; LL.tax = LL.pretax * LL.taxRate; LL.ni = LL.pretax - LL.tax;

// ---------------------------------------------------------------- two bakery chains (fictional, challenging example)
const CB = { rev: 12000000, cos: 6600000, staffIn: 3000000, opex: 4200000 };          // store staff inside cost of sales
const JS = { rev: 3000000, cos: 960000, staff: 840000, other: 870000 };              // store staff in operating expenses
CB.gp = CB.rev - CB.cos; CB.oi = CB.gp - CB.opex;
JS.gp = JS.rev - JS.cos; JS.oi = JS.gp - JS.staff - JS.other;

export default {
  slug: 'common-size-statements',
  title: 'Common-size statements',
  blurb: 'Express every line of the income statement as a share of revenue and every line of the balance sheet as a share of total assets, read the margins that result, and compare a small business with one thousands of times its size without being misled by how each one classifies its costs.',
  status: 'draft',
  objectives: [
    'Prepare a common-size income statement (as a percentage of net revenue) and a common-size balance sheet (as a percentage of total assets).',
    'Calculate and interpret the gross, operating, EBITDA and net margins.',
    'Explain how the classification of a cost (cost of sales or operating expense) and the accounting for leases move margins, and restate two businesses on the same basis.',
    'Compare a small business with a much larger one using common-size figures, and state what common-size analysis cannot show.',
  ],
  prerequisites: [
    { lesson: 'f03/horizontal-analysis', why: 'You compared Lantern’s two years line by line; this lesson compares the lines within each year.' },
    { lesson: 'f02/income-statement', why: 'The multi-step income statement’s subtotals (gross profit, operating income) are the margins’ numerators.' },
    { lesson: 'f02/balance-sheet-and-equity', why: 'Total assets, the base of the common-size balance sheet, and the classification of its lines come from there.' },
  ],
  case: 'lantern',

  concept: [
    { case: `Coastline Bank’s credit analyst has Lantern’s comparative statements and the horizontal analysis. She knows revenue nearly tripled and operating income fell. Her next question is about structure: out of each dollar Lantern took in, how much went on coffee and food, how much on staff and rent, and how much was left? And does that look like a coffee business that can carry debt? Answering it means putting 2026 (${usd(P26.revenue)} of revenue in ten months) and 2027 (${usd(P27.revenue)}) on the same scale, and later putting Lantern beside companies far larger than itself.` },
    { p: '<g>Vertical analysis</g> expresses each line of a statement as a percentage of a base figure in the same statement and the same period. A statement with every line shown that way is a <g>common-size statement</g>. On the income statement the base is net revenue (net sales), so each line reads as cents per dollar of revenue. On the balance sheet the base is total assets, which equals total liabilities and equity, so each line reads as a share of everything the business controls, or of how it is financed.' },
    { p: `Dividing by a total removes size. Lantern’s 2026 and 2027 income statements differ by a factor of three, and Starbucks’ revenue is tens of thousands of times Lantern’s, yet on a common-size statement all three add to 100%. Vertical and horizontal analysis are partners: horizontal analysis says how fast a line grew; vertical analysis says whether it grew faster than the business around it. In 2027, ${pc(costOfSales[1])} of each dollar of Lantern’s revenue went on cost of sales, ${pc(opex[1] / P27.revenue)} on operating expenses, and ${pc(M27.operatingMargin)} was left as operating income; net income was ${pc(M27.netMargin)}.` },
    { table: {
      caption: 'Lantern’s common-size income statement (% of net revenue; fictional)',
      head: ['Line', '2026 (%)', '2027 (%)', 'Change (points)'],
      align: ['l', 'r', 'r', 'r'],
      rows: isRows,
      note: 'Fictional figures from the case. Each line is divided by that year’s net revenue; expenses as positive shares; sales returns (contra-revenue) as a negative share of net revenue. 2026 covers ten months, but both the line and the base cover the same months, so no annualising is needed. Rounded to one decimal place, so columns may not add exactly.',
    } },
    { callout: 'key', title: 'One margin up, the others down', html: `Lantern’s gross margin rose from ${pc(M26.grossMargin)} to ${pc(M27.grossMargin)} while its operating margin fell from ${pc(M26.operatingMargin)} to ${pc(M27.operatingMargin)}. Wages expense, which now includes the café staff and Ana’s salary, rose from ${pc(sh('Wages Expense', 0))} to ${pc(sh('Wages Expense', 1))} of revenue, and the cafés’ lease cost added ${pc(sh('Operating Lease Cost', 1))}. The cafés sell coffee with a low cost of goods but need staff and premises, and Lantern records those below gross profit.` },
  ],

  theory: [
    { h: 'Building a common-size statement' },
    { p: 'Divide every line by the base and keep the signs: expenses are shares of revenue, so cost of goods sold of 28.2% means 28.2 cents of each revenue dollar. Use net revenue, after returns and discounts, as the base, so that the subtotals read directly as margins. Use the same base for every line in a column, and show the change between years in percentage points. Because a common-size line is a ratio of two amounts from the same period, it needs no annualising: Lantern’s ten-month 2026 can be compared with 2027 directly, though seasonal months with an unusual mix of sales still colour a part-year.' },
    { p: 'The standard bases are conventions, and an analyst may choose a narrower one when it matches the question. A cost that belongs to one activity is better divided by that activity’s revenue: Lantern’s café staff as a share of café sales, not of all revenue, tells Ana whether the cafés are staffed sensibly. The same applies to a segment of a large company, or to a balance sheet line set against current assets rather than total assets. Say which base you used; a percentage without its base cannot be checked or compared.' },
    { h: 'The four margins' },
    { p: `Four subtotals of the multi-step income statement, divided by net revenue, give the margins analysts quote most. The <g>gross margin</g> (gross profit ÷ net revenue) shows what is left after the direct cost of what was sold; it reflects pricing and the cost of goods. The <g>operating margin</g> (operating income ÷ net revenue) shows what is left after running the business; since Lantern has no other income, its operating income is its <g>EBIT</g>. The <g>EBITDA margin</g> adds depreciation and amortisation back, so it is not affected by how long ago assets were bought or how they are depreciated. The <g>net margin</g> (net income ÷ net revenue) is what the owners keep after interest and tax.` },
    { table: {
      caption: 'Margins: Lantern, Harbourline Roasters and Starbucks',
      head: ['Margin', 'Lantern 2026', 'Lantern 2027', 'Harbourline', 'Starbucks FY2024'],
      align: ['l', 'r', 'r', 'r', 'r'],
      rows: [
        ['Gross margin', pc(M26.grossMargin), pc(M27.grossMargin), 'n/a', 'n/a'],
        ['EBITDA margin', pc(M26.ebitdaMargin), pc(M27.ebitdaMargin), pc(hEbitda / H.revenue), pc(sbEbitda)],
        ['Operating margin', pc(M26.operatingMargin), pc(M27.operatingMargin), pc(H.ebit / H.revenue), pc(sbS(SB.oi))],
        ['Net margin', pc(M26.netMargin), pc(M27.netMargin), pc(H.netIncome / H.revenue), pc(sbS(SB.ni))],
      ],
      note: 'Lantern and Harbourline Roasters Inc. are fictional (Harbourline’s figures are F00’s, in $ millions; it reports operating costs as one line, so it shows no gross profit). Starbucks: Form 10-K for fiscal 2024; operating income includes $301.2 million of income from equity investees; EBITDA adds the cash-flow statement’s depreciation and amortization ($1,592.4 million, total D&amp;A) rather than the income-statement line ($1,512.6 million), which excludes D&amp;A recorded within other cost lines; net margin uses net earnings attributable to Starbucks. Starbucks presents no gross profit (see below).',
    } },
    { p: `Read the margins as a cascade. Lantern kept ${pc(M27.grossMargin)} of revenue after the direct cost of sales in 2027, but operating expenses took ${pc(opex[1] / P27.revenue)}, leaving ${pc(M27.operatingMargin)}; interest took ${pc(sh('Interest Expense', 1))} and tax ${pc(sh('Income Tax Expense', 1))}, leaving a net margin of ${pc(M27.netMargin)}. A margin that falls between two subtotals locates the problem: in 2027 the damage was done between gross profit and operating income.` },
    { h: 'Classification moves margins' },
    { p: `A margin depends on which lines sit above it. Lantern records the wages of its event baristas (${usd(F.wages.events)} in 2027) in cost of services, because they are hired for each catering job; the café staff (${usd(cafeStaff)}) are in wages expense, an operating expense, because they work fixed shifts whatever the day’s takings. Both choices are defensible. Had Lantern put the café staff in cost of sales, its 2027 gross margin would have been ${pc(gmReclass)} instead of ${pc(M27.grossMargin)}, below 2026’s ${pc(M26.grossMargin)}, and the story “gross margin improved” would have disappeared. The operating margin would not change at all: moving a cost between two lines above operating income changes the subtotal between them, not the operating income.` },
    { p: `Companies choose their own expense captions, and two businesses in the same industry can put the same cost on different lines. Starbucks does not present cost of sales or gross profit at all. Its statement of earnings lists product and distribution costs (${pc(sbS(SB.pdc))} of total net revenues in fiscal 2024), store operating expenses (${pc(sbS(SB.soe))}), other operating expenses, depreciation and amortization, and general and administrative expenses as separate operating expenses. Subtracting only product and distribution costs from revenue would give ${pc(1 - sbS(SB.pdc))}, a figure Starbucks does not report and that is not comparable with a retailer’s gross margin that includes store costs. When two companies classify differently, compare the margins below the point where their classifications converge (operating or EBITDA margin), or rebuild both on one definition from the notes.` },
    { callout: 'standards', title: 'Leases and EBITDA: US GAAP and IFRS', html: `Under US GAAP (ASC 842) an operating lease produces a single, straight-line lease cost in operating expenses, so Lantern’s ${usd(F.cafes.lease.monthlyEach * 2 * F.cafes.months)} of café lease cost sits inside EBITDA. IFRS 16, effective since 2019, has no operating-lease category for lessees: the same leases would be charged as depreciation of the right-of-use asset and interest on the lease liability, and the IASB’s effects analysis notes that EBITDA under IFRS 16 excludes all lease expenses. Restated that way, Lantern’s 2027 EBITDA margin would be about ${pc((ebitda[1] + F.cafes.lease.monthlyEach * 2 * F.cafes.months) / P27.revenue)} rather than ${pc(M27.ebitdaMargin)}. Leases of 12 months or less and leases of low-value assets are exempt under IFRS 16: their payments are still expensed, typically on a straight-line basis, so they stay among operating costs under both frameworks. Compare EBITDA margins across the two frameworks only after adjusting for leases.` },
    { h: 'The common-size balance sheet' },
    { p: `On the balance sheet the base is total assets. The common-size view shows how the business has deployed its resources and how it has financed them, independent of size. Lantern’s balance sheet changed character in 2027: cash fell from ${pc(s(bsPair('Cash'), 0))} of total assets to ${pc(s(bsPair('Cash'), 1))}, the cafés’ right-of-use assets became ${pc(s(bsPair('Operating Lease Right-of-Use Assets'), 1))} of the total, and equity, which financed ${pc(s(bsPair('Total equity'), 0))} of the assets at the end of 2026, financed only ${pc(s(bsPair('Total equity'), 1))} a year later.` },
    { table: {
      caption: 'Lantern’s common-size balance sheet, condensed (% of total assets; fictional)',
      head: ['Line at 31 December', '2026 (%)', '2027 (%)', 'Change (points)'],
      align: ['l', 'r', 'r', 'r'],
      rows: bsRows,
      note: 'Fictional figures from the case. Total liabilities plus total equity equal total assets (100%) in each year.',
    } },
    { p: 'A falling share is not always a falling amount. Lantern’s property and equipment grew from $37,200 to $95,400, yet its share of total assets fell from 39.7% to 29.1%, because the right-of-use assets grew faster still. Read the common-size percentages beside the dollar amounts and the horizontal changes, never instead of them.' },
    { h: 'Comparing with a much larger business' },
    { p: `Common-size statements make comparisons across scale possible. Harbourline Roasters, F00’s fictional listed roaster, has revenue of $${H.revenue} million, about ${Math.round(H.revenue * 1e6 / P27.revenue).toLocaleString('en-US')} times Lantern’s; Starbucks’ fiscal 2024 revenue of $36,176.2 million is about ${Math.round(SB.rev * 1e6 / P27.revenue).toLocaleString('en-US')} times. On the margins table, Lantern’s 2026 margins beat both, before Ana was paid a salary, while its 2027 operating margin of ${pc(M27.operatingMargin)} is below Harbourline’s ${pc(H.ebit / H.revenue)} and well below Starbucks’ ${pc(sbS(SB.oi))}.` },
    { p: `The balance sheets differ more. Harbourline’s equity finances ${pc(hb(HD.bookEquity))} of its assets and its debt ${pc(hb(H.debt))}; Lantern’s equity finances ${pc(s(bsPair('Total equity'), 1))}, with lease liabilities at ${pc(P27.leaseLiabilities / ta[1])} and other debt at ${pc(P27.debt / ta[1])}. Starbucks’ total liabilities are ${pc(sbB(SB.tl))} of its total assets, so its shareholders’ equity is a deficit of ${pc(-sbB(SB.eq))} of assets; its operating lease liabilities are ${pc(sbB(SB.leaseCur + SB.leaseNon))} and its right-of-use assets ${pc(sbB(SB.rou))}. A negative equity line is a warning that some ratios built on equity will mean nothing, a point the solvency and returns lessons take up.` },
    { h: 'What common-size statements cannot show' },
    { list: [
      `<b>Scale.</b> A ${pc(M27.netMargin)} net margin on ${usd(P27.revenue)} is ${usd(P27.netIncome)}: enough for one owner-manager, not for a business that must also repay ${usd(P27.debt)} of debt. Dollars still matter, and so does size: a large chain buys coffee and leases premises on terms a two-café business cannot get.`,
      '<b>Cash and timing.</b> Margins are accrual measures. Lantern’s 2027 revenue includes the law firm’s contract revenue that will not be billed until March 2028; the cash-flow lessons ask how much of the margin arrived as cash.',
      '<b>Growth.</b> Each percentage is one year’s structure. A share can fall while the amount rises, as Lantern’s property and equipment did; pair vertical with horizontal analysis.',
      '<b>Whether a percentage is good.</b> A 27.9% wage share means little without a benchmark for comparable cafés and caterers, which the benchmarking lesson discusses.',
      '<b>Causes.</b> A percentage that changes because its base changed (revenue fell, or a large asset was added) can look like a change in the line itself.',
    ] },
  ],

  formulas: [
    { id: 'cs-income', name: 'Common-size income statement line',
      tex: String.raw`\text{Line, \% of revenue} = \dfrac{\text{Line amount}}{\text{Net revenue}} \times 100`,
      where: [
        [String.raw`\text{Line amount}`, 'Any line of the income statement for the period (revenue, cost, subtotal)', '$'],
        [String.raw`\text{Net revenue}`, 'Revenue after returns, allowances and discounts, for the same period', '$'],
      ],
      note: 'Lantern’s 2027 cost of goods sold: <m>163{,}125 \\div 577{,}860 = 28.2\\%</m>.' },
    { id: 'cs-balance', name: 'Common-size balance sheet line',
      tex: String.raw`\text{Line, \% of total assets} = \dfrac{\text{Line amount}}{\text{Total assets}} \times 100`,
      where: [
        [String.raw`\text{Line amount}`, 'Any asset, liability or equity line at the balance sheet date', '$'],
        [String.raw`\text{Total assets}`, 'Total assets at the same date (equal to total liabilities and equity)', '$'],
      ],
      note: 'Lantern’s right-of-use assets at 31 December 2027: <m>173{,}379 \\div 327{,}883 = 52.9\\%</m>.' },
    { id: 'cs-gross-margin', name: 'Gross margin',
      tex: String.raw`\text{Gross margin} = \dfrac{\text{Net revenue} - \text{Cost of sales}}{\text{Net revenue}}`,
      where: [
        [String.raw`\text{Net revenue}`, 'Revenue after returns, allowances and discounts', '$'],
        [String.raw`\text{Cost of sales}`, 'Cost of goods sold plus cost of services, as the business classifies them', '$'],
      ],
      assumptions: 'Depends on what the business puts in cost of sales; compare only like definitions.',
      note: 'Lantern 2027: <m>(577{,}860 - 224{,}205) \\div 577{,}860 = 61.2\\%</m>.' },
    { id: 'cs-operating-margin', name: 'Operating margin',
      tex: String.raw`\text{Operating margin} = \dfrac{\text{Operating income}}{\text{Net revenue}}`,
      where: [
        [String.raw`\text{Operating income}`, 'Gross profit less operating expenses (EBIT when there is no other income or expense)', '$'],
        [String.raw`\text{Net revenue}`, 'Revenue after returns, allowances and discounts', '$'],
      ],
      note: 'Lantern 2027: <m>32{,}787 \\div 577{,}860 = 5.7\\%</m>.' },
    { id: 'cs-ebitda-margin', name: 'EBITDA margin',
      tex: String.raw`\text{EBITDA margin} = \dfrac{\text{EBIT} + \text{D\&A}}{\text{Net revenue}}`,
      where: [
        [String.raw`\text{EBIT}`, 'Earnings before interest and taxes; for Lantern, operating income', '$'],
        [String.raw`\text{D\&A}`, 'Depreciation and amortisation for the period (all of it, wherever it is presented)', '$'],
        [String.raw`\text{Net revenue}`, 'Revenue after returns, allowances and discounts', '$'],
      ],
      assumptions: 'A non-GAAP measure: under US GAAP operating lease cost stays inside EBITDA; under IFRS 16 it does not.',
      note: 'Lantern 2027: <m>(32{,}787 + 19{,}800) \\div 577{,}860 = 9.1\\%</m>.' },
    { id: 'cs-net-margin', name: 'Net margin',
      tex: String.raw`\text{Net margin} = \dfrac{\text{Net income}}{\text{Net revenue}}`,
      where: [
        [String.raw`\text{Net income}`, 'Net income for the period (attributable to the parent’s owners when there are noncontrolling interests)', '$'],
        [String.raw`\text{Net revenue}`, 'Revenue after returns, allowances and discounts', '$'],
      ],
      note: 'Lantern 2027: <m>22{,}431 \\div 577{,}860 = 3.9\\%</m>. Also called the net profit margin or return on sales.' },
  ],

  examples: [
    { level: 'simple', title: 'A clothing brand’s margins', fictional: true,
      setup: 'Larch &amp; Loom, a fictional clothing brand, reports for 2027: net revenue $4,800,000; cost of goods sold $2,160,000; selling, general and administrative expenses $1,920,000; depreciation and amortisation $240,000; interest expense $96,000; income tax at 25% of income before tax. Prepare its common-size income statement and its four margins.',
      steps: [
        'Gross profit: <m>4{,}800{,}000 - 2{,}160{,}000 = 2{,}640{,}000</m>; gross margin <m>2{,}640{,}000 \\div 4{,}800{,}000 = 55.0\\%</m>. Cost of goods sold is <m>45.0\\%</m>.',
        'Operating income: <m>2{,}640{,}000 - 1{,}920{,}000 - 240{,}000 = 480{,}000</m>; operating margin <m>10.0\\%</m>. Selling, general and administrative expenses are <m>40.0\\%</m> and D&amp;A <m>5.0\\%</m>.',
        'EBITDA: <m>480{,}000 + 240{,}000 = 720{,}000</m>; EBITDA margin <m>15.0\\%</m>.',
        'Income before tax: <m>480{,}000 - 96{,}000 = 384{,}000</m> (<m>8.0\\%</m>); tax <m>96{,}000</m> (<m>2.0\\%</m>); net income <m>288{,}000</m>, a net margin of <m>6.0\\%</m>.',
      ],
      table: {
        caption: 'Larch &amp; Loom: common-size income statement for 2027 (fictional)',
        head: ['Line', 'Amount ($)', '% of net revenue'],
        align: ['l', 'r', 'r'],
        rows: [
          ['Net revenue', '4,800,000', '100.0'],
          ['Cost of goods sold', '(2,160,000)', '45.0'],
          ['Gross profit', '2,640,000', '55.0'],
          ['Selling, general and administrative expenses', '(1,920,000)', '40.0'],
          ['Depreciation and amortisation', '(240,000)', '5.0'],
          ['Operating income', '480,000', '10.0'],
          ['Interest expense', '(96,000)', '2.0'],
          ['Income before income tax', '384,000', '8.0'],
          ['Income tax expense', '(96,000)', '2.0'],
          ['Net income', '288,000', '6.0'],
        ],
      },
      answer: 'Cost of goods sold 45.0%, gross margin 55.0%; SG&amp;A 40.0%, D&amp;A 5.0%, operating margin 10.0%; EBITDA margin 15.0%; interest 2.0%, income before tax 8.0%, tax 2.0%, net margin 6.0%.',
      interpretation: 'Of each dollar of sales, 45 cents buys the clothes, 40 cents runs the brand and 6 cents reaches the owners. Selling and administration, not the product cost, is the line to watch: a fall in its share is the fastest route to a better operating margin.' },
    { level: 'challenging', title: 'Two bakery chains, two classifications', fictional: true,
      setup: 'Two fictional bakery-café chains report for 2027. Copperleaf Bakeries: revenue $12,000,000; cost of sales $6,600,000, which includes $3,000,000 of store staff wages; operating expenses $4,200,000. Juniper Street Bakery: revenue $3,000,000; cost of sales (ingredients and packaging) $960,000; store staff wages $840,000 and other operating expenses $870,000, both in operating expenses. A lender says Juniper is “the better business: a 68% gross margin against 45%”. Is it?',
      steps: [
        'As reported: Copperleaf gross margin <m>(12{,}000{,}000 - 6{,}600{,}000) \\div 12{,}000{,}000 = 45.0\\%</m>, operating margin <m>1{,}200{,}000 \\div 12{,}000{,}000 = 10.0\\%</m>. Juniper gross margin <m>(3{,}000{,}000 - 960{,}000) \\div 3{,}000{,}000 = 68.0\\%</m>, operating margin <m>330{,}000 \\div 3{,}000{,}000 = 11.0\\%</m>.',
        'Restate Juniper with store staff in cost of sales, as Copperleaf does: cost of sales <m>960{,}000 + 840{,}000 = 1{,}800{,}000</m>; gross margin <m>1{,}200{,}000 \\div 3{,}000{,}000 = 40.0\\%</m>, below Copperleaf’s 45.0%.',
        'Or restate Copperleaf with staff out of cost of sales: <m>6{,}600{,}000 - 3{,}000{,}000 = 3{,}600{,}000</m>; gross margin <m>70.0\\%</m>, above Juniper’s 68.0%. On either common definition Copperleaf’s gross margin is higher.',
        'The operating margins need no restatement: staff are above operating income in both. Juniper’s 11.0% beats Copperleaf’s 10.0% because its other costs are a smaller share: Copperleaf’s operating expenses are <m>35.0\\%</m> of revenue; Juniper’s other operating expenses are <m>29.0\\%</m>.',
      ],
      table: {
        caption: 'Gross margin on each definition (fictional)',
        head: ['Definition', 'Copperleaf', 'Juniper Street'],
        align: ['l', 'r', 'r'],
        rows: [
          ['As reported', '45.0%', '68.0%'],
          ['Store staff in cost of sales', '45.0%', '40.0%'],
          ['Store staff in operating expenses', '70.0%', '68.0%'],
          ['Operating margin (unaffected)', '10.0%', '11.0%'],
        ],
      },
      answer: 'No. The 23-point gap in reported gross margin is classification. On a common definition Copperleaf’s gross margin is higher (45.0% against 40.0%, or 70.0% against 68.0%), while Juniper’s operating margin is higher, 11.0% against 10.0%, because of lower overheads.',
      interpretation: 'Compare margins only on the same definition. The operating margin, below the point where the two classifications meet, is the fair comparison here; Juniper’s advantage is in its overheads, not its baking. Common-size statements also hide that Copperleaf is four times Juniper’s size.' },
    { level: 'applied', title: 'Lantern beside Harbourline: what should Coastline ask?', fictional: true,
      setup: 'Coastline’s analyst compares Lantern’s 2027 common-size statements with Harbourline Roasters’, a much larger fictional roaster, before Lantern asks to increase its line of credit. Use the margins table and the common-size balance sheets above.',
      steps: [
        `Margins: Lantern’s EBITDA margin is ${pc(M27.ebitdaMargin)} against Harbourline’s ${pc(hEbitda / H.revenue)}; its operating margin ${pc(M27.operatingMargin)} against ${pc(H.ebit / H.revenue)}; its net margin ${pc(M27.netMargin)} against ${pc(H.netIncome / H.revenue)}. Lantern earns less on each dollar at every level.`,
        `Lantern’s EBITDA includes the café lease cost (${pc(sh('Operating Lease Cost', 1))} of revenue), and it also bears a cost that should not recur: research was ${pc(sh('Market Research Expense', 1))} of revenue. Without the research, Lantern’s operating margin would have been <m>(32{,}787 + 21{,}000) \\div 577{,}860 = 9.3\\%</m>, close to Harbourline’s.`,
        `Financing: equity finances ${pc(s(bsPair('Total equity'), 1))} of Lantern’s assets and ${pc(hb(HD.bookEquity))} of Harbourline’s. Lantern’s lease liabilities alone are ${pc(P27.leaseLiabilities / ta[1])} of its assets.`,
        `Liquidity in outline: cash is ${pc(s(bsPair('Cash'), 1))} of Lantern’s assets and ${pc(hb(H.cash))} of Harbourline’s; Lantern’s current liabilities are ${pc(s(bsPair('Total current liabilities'), 1))} of its assets against ${pc(s(bsPair('Total current assets'), 1))} in current assets.`,
      ],
      answer: `Lantern’s margins are thinner than Harbourline’s at every level (operating ${pc(M27.operatingMargin)} against ${pc(H.ebit / H.revenue)}), mostly because of the research programme and the cafés’ first-year costs, and its balance sheet is financed far more by liabilities (equity ${pc(s(bsPair('Total equity'), 1))} of assets against ${pc(hb(HD.bookEquity))}). The analyst should ask whether the research recurs, how the cafés’ wage and lease shares are trending month by month, and how Lantern will rebuild cash before lending more.`,
      interpretation: 'Common-size statements tell the analyst where Lantern differs from a peer and therefore what to ask; they do not tell her whether to lend. That needs the liquidity, solvency and cash-flow measures of the next modules, and the knowledge that Harbourline, many times Lantern’s size, is not the perfect benchmark either.' },
  ],

  demo: [
    { widget: 'cs-ratios', intro: 'Lantern’s margins beside Harbourline’s and Starbucks’. Tick “Annualise part-year flows” and notice that no margin moves. Then tick the reclassification of café staff and watch the gross margin fall while the operating margin stays where it was.' },
    { widget: 'cs-bars', intro: 'Where each dollar of revenue went, 2026 against 2027. Compare the wage and occupancy bars with the operating income bar.' },
    { widget: 'cs-sheet', intro: 'Lantern’s balance sheet at 31 December 2027. Type a formula in C2 that divides cash by total assets, fill it down, and check your column against the common-size table. Then try the 2026 figures from the comparative balance sheet in column B.' },
  ],

  mistakes: [
    { title: '“Juniper’s 68% gross margin beats Copperleaf’s 45%.”', html: 'Gross margins depend on what each business puts in cost of sales. Restate both on one definition, or compare a margin below the point where the classifications meet, such as the operating margin. Starbucks presents no gross profit at all.' },
    { title: '“Lantern’s 2026 margins must be annualised first.”', html: 'A margin divides one flow by another for the same months, so the period length cancels out. Annualise flows for horizontal comparisons, not for margins. (Seasonality can still make a part-year’s mix unusual.)' },
    { title: '“Property’s share fell, so Lantern has less equipment.”', html: 'A common-size share can fall because the total grew faster. Lantern’s property and equipment rose from $37,200 to $95,400 while its share fell from 39.7% to 29.1%. Read the dollars and the horizontal change beside the percentage.' },
    { title: '“A common-size balance sheet uses revenue as its base.”', html: 'The balance sheet’s base is total assets (equal to total liabilities and equity), both measured at the same date. Revenue is a flow over a period and is the base for the income statement only.' },
    { title: '“EBITDA margins are comparable everywhere.”', html: 'EBITDA is not defined by US GAAP, and lease accounting differs: under ASC 842 operating lease cost stays inside EBITDA, while under IFRS 16 it is replaced by depreciation and interest, which EBITDA excludes. Adjust before comparing a US GAAP reporter with an IFRS one.' },
  ],

  application: [
    { p: `<b>The lender’s structure check.</b> Coastline’s analyst keeps a page of common-size statements for every small-business borrower in food and drink. Lantern’s 2027 page shows wages at ${pc(sh('Wages Expense', 1))} of revenue and occupancy (kitchen rent and café leases) at ${pc(occ[1] / P27.revenue)}, against ${pc(sh('Wages Expense', 0))} and ${pc(occ[0] / P26.revenue)} in 2026. Those two lines explain most of the fall in the operating margin. Her credit memo states the margins, names the lines that moved and asks Lantern for the cafés’ monthly wage and lease shares, because a café business whose wages stay near a quarter of revenue in its second year needs higher prices or fewer staff hours to service more debt.` },
    { p: '<b>The owner’s targets.</b> Ana uses the same percentages to set targets. If café staff can be scheduled to cost no more than a set share of café sales, she can check it every month from the till reports and the payroll without waiting for the year-end statements. She also learns to explain her margins in the bank’s terms: the gross margin rose because the cafés’ coffee costs little to make, but their staff and premises sit below gross profit, which is why she shows the operating margin first.' },
    { p: '<b>The investor’s screen.</b> An equity analyst comparing Starbucks with other restaurant companies would not compare gross margins, because Starbucks presents none. She would compare operating margins and EBITDA margins, adjusting for leases where a peer reports under IFRS, and use the common-size balance sheet to spot what is unusual: a shareholders’ deficit and lease liabilities of about a third of total assets.' },
  ],

  summary: [
    'Vertical analysis divides each line by a base in the same statement: net revenue for the income statement, total assets for the balance sheet. The result, a common-size statement, removes scale.',
    'The gross, operating, EBITDA and net margins are the income statement’s subtotals as a share of revenue; where a margin falls between two subtotals shows where the problem is. Lantern’s gross margin rose from 54.0% to 61.2% while its operating margin fell from 19.5% to 5.7%.',
    'Margins need no annualising: both parts cover the same months.',
    'Classification moves margins: Lantern’s café staff in operating expenses, its event baristas in cost of services, and Starbucks’ separate product, store and administrative lines. Compare like definitions, or the operating margin.',
    'Lease accounting moves EBITDA: under ASC 842 operating lease cost is inside EBITDA, under IFRS 16 it is not.',
    'Common-size statements make a two-café business comparable with Harbourline or Starbucks, but they hide scale, cash, growth and causes: read them with the dollars and the horizontal changes.',
  ],

  glossary: [
    { term: 'Vertical analysis', def: 'Expressing each line of a financial statement as a percentage of a base in the same statement and period: net revenue for the income statement, total assets for the balance sheet.' },
    { term: 'Common-size statement', def: 'A financial statement in which every line is shown as a percentage of a base figure (net revenue or total assets), so that businesses of different sizes, or one business in different years, can be compared.' },
    { term: 'Operating margin', def: 'Operating income divided by net revenue: the share of each dollar of revenue left after the costs of running the business, before interest and income tax.' },
    { term: 'EBITDA margin', def: 'EBITDA (earnings before interest, taxes, depreciation and amortisation) divided by net revenue. A non-GAAP measure, affected by how leases are accounted for.' },
    { term: 'Net margin', def: 'Net income divided by net revenue: the share of each dollar of revenue the owners keep after all expenses, interest and tax. Also called the net profit margin.' },
  ],

  references: [
    { text: 'Dahlquist, J. &amp; Knight, R. (2022). <i>Principles of Finance</i>, section 5.7, “Common-Size Statements”. OpenStax.', url: 'https://openstax.org/books/principles-finance/pages/5-7-common-size-statements', checked: '2026-10-26' },
    { text: 'Franklin, M., Graybeal, P. &amp; Cooper, D. (2019). <i>Principles of Accounting, Volume 1: Financial Accounting</i>, Appendix A, “Financial Statement Analysis” (vertical analysis and its bases). OpenStax.', url: 'https://openstax.org/books/principles-financial-accounting/pages/a-financial-statement-analysis', checked: '2026-10-26' },
    { text: 'Starbucks Corporation (2024). Form 10-K for the fiscal year ended 29 September 2024: Consolidated Statements of Earnings (SEC EDGAR, XBRL rendering).', url: 'https://www.sec.gov/Archives/edgar/data/829224/000082922424000057/R3.htm', checked: '2026-10-26' },
    { text: 'Starbucks Corporation (2024). Form 10-K for the fiscal year ended 29 September 2024: Consolidated Balance Sheets (SEC EDGAR, XBRL rendering).', url: 'https://www.sec.gov/Archives/edgar/data/829224/000082922424000057/R7.htm', checked: '2026-10-26' },
    { text: 'Starbucks Corporation (2024). Form 10-K for the fiscal year ended 29 September 2024: Consolidated Statements of Cash Flows (depreciation and amortization of $1,592.4 million; SEC EDGAR, XBRL rendering).', url: 'https://www.sec.gov/Archives/edgar/data/829224/000082922424000057/R5.htm', checked: '2026-10-26' },
    { text: 'IFRS Foundation (2016). <i>IFRS 16 Leases: Effects Analysis</i>, January 2016: section 4.1, p. 27 (EBITDA applying IFRS 16 excludes all expenses related to leases); Executive Summary, p. 5 (under the FASB model, expenses related to former operating leases are reported typically on a straight-line basis within operating costs); pp. 19 and 38 (short-term and low-value leases expensed).', url: 'https://www.ifrs.org/-/media/project/leases/ifrs/published-documents/ifrs16-effects-analysis.pdf', checked: '2026-10-26' },
  ],

  checks: [
    // Lantern income statement
    { what: 'Revenue 2026', value: P26.revenue, shown: 193320 },
    { what: 'Revenue 2027', value: P27.revenue, shown: 577860 },
    { what: 'Cost of sales share 2027', value: costOfSales[1] * 100, shown: 38.8, tol: 0.05 },
    { what: 'Cost of goods sold share 2027', value: sh('Cost of Goods Sold', 1) * 100, shown: 28.2, tol: 0.05 },
    { what: 'Operating expenses share 2027', value: opex[1] / P27.revenue * 100, shown: 55.5, tol: 0.05 },
    { what: 'Operating margin 2027', value: M27.operatingMargin * 100, shown: 5.7, tol: 0.05 },
    { what: 'Net margin 2027', value: M27.netMargin * 100, shown: 3.9, tol: 0.05 },
    { what: 'Gross margin 2026', value: M26.grossMargin * 100, shown: 54, tol: 0.05 },
    { what: 'Gross margin 2027', value: M27.grossMargin * 100, shown: 61.2, tol: 0.05 },
    { what: 'Operating margin 2026', value: M26.operatingMargin * 100, shown: 19.5, tol: 0.05 },
    { what: 'Wages share 2026', value: sh('Wages Expense', 0) * 100, shown: 9.5, tol: 0.05 },
    { what: 'Wages share 2027', value: sh('Wages Expense', 1) * 100, shown: 27.9, tol: 0.05 },
    { what: 'Lease cost share 2027', value: sh('Operating Lease Cost', 1) * 100, shown: 6.9, tol: 0.05 },
    { what: 'EBITDA margin 2026', value: M26.ebitdaMargin * 100, shown: 22, tol: 0.05 },
    { what: 'EBITDA margin 2027', value: M27.ebitdaMargin * 100, shown: 9.1, tol: 0.05 },
    { what: 'Net margin 2026', value: M26.netMargin * 100, shown: 14.2, tol: 0.05 },
    { what: 'Interest share 2027', value: sh('Interest Expense', 1) * 100, shown: 0.5, tol: 0.05 },
    { what: 'Tax share 2027', value: sh('Income Tax Expense', 1) * 100, shown: 1.3, tol: 0.05 },
    { what: 'Research share 2027', value: sh('Market Research Expense', 1) * 100, shown: 3.6, tol: 0.05 },
    // classification
    { what: 'Event baristas 2027', value: F.wages.events, shown: 41600 },
    { what: 'Café staff', value: cafeStaff, shown: 92000 },
    { what: 'Gross margin with café staff in cost of sales', value: gmReclass * 100, shown: 45.3, tol: 0.05 },
    // Starbucks
    { what: 'Starbucks product and distribution share', value: sbS(SB.pdc) * 100, shown: 30.9, tol: 0.05 },
    { what: 'Starbucks store operating share', value: sbS(SB.soe) * 100, shown: 42.3, tol: 0.05 },
    { what: 'Starbucks revenue less product and distribution', value: (1 - sbS(SB.pdc)) * 100, shown: 69.1, tol: 0.05 },
    { what: 'Starbucks operating margin', value: sbS(SB.oi) * 100, shown: 15, tol: 0.05 },
    { what: 'Starbucks EBITDA margin (cash-flow D&A)', value: sbEbitda * 100, shown: 19.4, tol: 0.05 },
    { what: 'Starbucks net margin', value: sbS(SB.ni) * 100, shown: 10.4, tol: 0.05 },
    { what: 'Starbucks operating income from its lines', value: SB.rev - SB.opexTotal + SB.equityInv, shown: 5408.8, tol: 0.05 },
    { what: 'Starbucks total liabilities share', value: sbB(SB.tl) * 100, shown: 123.7, tol: 0.05 },
    { what: 'Starbucks deficit share', value: -sbB(SB.eq) * 100, shown: 23.7, tol: 0.05 },
    { what: 'Starbucks deficit = assets − liabilities', value: SB.ta - SB.tl, shown: -7441.6, tol: 0.05 },
    { what: 'Starbucks lease liabilities share', value: sbB(SB.leaseCur + SB.leaseNon) * 100, shown: 32.7, tol: 0.05 },
    { what: 'Starbucks right-of-use share', value: sbB(SB.rou) * 100, shown: 29.6, tol: 0.05 },
    { what: 'Starbucks revenue as a multiple of Lantern’s', value: Math.round(SB.rev * 1e6 / P27.revenue), shown: 62604 },
    // leases and EBITDA
    { what: 'Café lease cost 2027', value: F.cafes.lease.monthlyEach * 2 * F.cafes.months, shown: 40000 },
    { what: 'EBITDA margin without lease cost', value: (ebitda[1] + 40000) / P27.revenue * 100, shown: 16, tol: 0.05 },
    // balance sheet
    { what: 'Cash share 2026', value: s(bsPair('Cash'), 0) * 100, shown: 45.8, tol: 0.05 },
    { what: 'Cash share 2027', value: s(bsPair('Cash'), 1) * 100, shown: 2, tol: 0.05 },
    { what: 'ROU share 2027', value: s(bsPair('Operating Lease Right-of-Use Assets'), 1) * 100, shown: 52.9, tol: 0.05 },
    { what: 'Equity share 2026', value: s(bsPair('Total equity'), 0) * 100, shown: 45.2, tol: 0.05 },
    { what: 'Equity share 2027', value: s(bsPair('Total equity'), 1) * 100, shown: 19.2, tol: 0.05 },
    { what: 'PP&E 2026', value: P26.ppeNet, shown: 37200 },
    { what: 'PP&E 2027', value: P27.ppeNet, shown: 95400 },
    { what: 'PP&E share 2026', value: P26.ppeNet / ta[0] * 100, shown: 39.7, tol: 0.05 },
    { what: 'PP&E share 2027', value: P27.ppeNet / ta[1] * 100, shown: 29.1, tol: 0.05 },
    { what: 'Lease liabilities share 2027', value: P27.leaseLiabilities / ta[1] * 100, shown: 52.9, tol: 0.05 },
    { what: 'Debt share 2027', value: P27.debt / ta[1] * 100, shown: 19.9, tol: 0.05 },
    { what: 'Current liabilities share 2027', value: s(bsPair('Total current liabilities'), 1) * 100, shown: 34.9, tol: 0.05 },
    { what: 'Current assets share 2027', value: s(bsPair('Total current assets'), 1) * 100, shown: 18, tol: 0.05 },
    { what: 'Formula note: ROU share', value: 173379 / 327883 * 100, shown: 52.9, tol: 0.05 },
    { what: 'Formula note: gross margin 2027', value: (577860 - 224205) / 577860 * 100, shown: 61.2, tol: 0.05 },
    { what: 'Formula note: cost of sales 2027', value: P27.cogs, shown: 224205 },
    { what: 'Formula note: operating income 2027', value: P27.operatingIncome, shown: 32787 },
    { what: 'Formula note: D&A 2027', value: P27.da, shown: 19800 },
    { what: 'Formula note: COGS 2027', value: IS['Cost of Goods Sold'][1], shown: 163125 },
    { what: 'Net income 2027', value: P27.netIncome, shown: 22431 },
    { what: 'Debt 2027', value: P27.debt, shown: 65250 },
    // Harbourline
    { what: 'Harbourline revenue', value: H.revenue, shown: 640 },
    { what: 'Harbourline as a multiple of Lantern', value: Math.round(H.revenue * 1e6 / P27.revenue), shown: 1108 },
    { what: 'Harbourline EBITDA margin', value: hEbitda / H.revenue * 100, shown: 14.5, tol: 0.05 },
    { what: 'Harbourline operating margin', value: H.ebit / H.revenue * 100, shown: 9.5, tol: 0.05 },
    { what: 'Harbourline net margin', value: H.netIncome / H.revenue * 100, shown: 5.9, tol: 0.05 },
    { what: 'Harbourline equity share', value: hb(HD.bookEquity) * 100, shown: 45.5, tol: 0.05 },
    { what: 'Harbourline debt share', value: hb(H.debt) * 100, shown: 31.8, tol: 0.05 },
    { what: 'Harbourline cash share', value: hb(H.cash) * 100, shown: 6.8, tol: 0.05 },
    // applied
    { what: 'Operating margin without research', value: (P27.operatingIncome + F.research) / P27.revenue * 100, shown: 9.3, tol: 0.05 },
    { what: 'Occupancy share 2027', value: occ[1] / P27.revenue * 100, shown: 9.4, tol: 0.05 },
    { what: 'Occupancy share 2026', value: occ[0] / P26.revenue * 100, shown: 6.2, tol: 0.05 },
    // Larch & Loom
    { what: 'L&L gross profit', value: LL.gp, shown: 2640000 },
    { what: 'L&L gross margin', value: LL.gp / LL.rev * 100, shown: 55 },
    { what: 'L&L COGS share', value: LL.cogs / LL.rev * 100, shown: 45 },
    { what: 'L&L operating income', value: LL.oi, shown: 480000 },
    { what: 'L&L operating margin', value: LL.oi / LL.rev * 100, shown: 10 },
    { what: 'L&L SG&A share', value: LL.sga / LL.rev * 100, shown: 40 },
    { what: 'L&L D&A share', value: LL.da / LL.rev * 100, shown: 5 },
    { what: 'L&L EBITDA', value: LL.ebitda, shown: 720000 },
    { what: 'L&L EBITDA margin', value: LL.ebitda / LL.rev * 100, shown: 15 },
    { what: 'L&L income before tax', value: LL.pretax, shown: 384000 },
    { what: 'L&L pretax share', value: LL.pretax / LL.rev * 100, shown: 8 },
    { what: 'L&L tax', value: LL.tax, shown: 96000 },
    { what: 'L&L tax share', value: LL.tax / LL.rev * 100, shown: 2 },
    { what: 'L&L interest share', value: LL.interest / LL.rev * 100, shown: 2 },
    { what: 'L&L net income', value: LL.ni, shown: 288000 },
    { what: 'L&L net margin', value: LL.ni / LL.rev * 100, shown: 6 },
    // bakeries
    { what: 'Copperleaf gross margin', value: CB.gp / CB.rev * 100, shown: 45 },
    { what: 'Copperleaf operating income', value: CB.oi, shown: 1200000 },
    { what: 'Copperleaf operating margin', value: CB.oi / CB.rev * 100, shown: 10 },
    { what: 'Juniper gross margin', value: JS.gp / JS.rev * 100, shown: 68 },
    { what: 'Juniper operating income', value: JS.oi, shown: 330000 },
    { what: 'Juniper operating margin', value: JS.oi / JS.rev * 100, shown: 11 },
    { what: 'Juniper cost of sales with staff', value: JS.cos + JS.staff, shown: 1800000 },
    { what: 'Juniper gross margin with staff', value: (JS.rev - JS.cos - JS.staff) / JS.rev * 100, shown: 40 },
    { what: 'Juniper gross profit with staff', value: JS.rev - JS.cos - JS.staff, shown: 1200000 },
    { what: 'Copperleaf cost of sales without staff', value: CB.cos - CB.staffIn, shown: 3600000 },
    { what: 'Copperleaf gross margin without staff', value: (CB.rev - CB.cos + CB.staffIn) / CB.rev * 100, shown: 70 },
    { what: 'Copperleaf opex share', value: CB.opex / CB.rev * 100, shown: 35 },
    { what: 'Juniper other opex share', value: JS.other / JS.rev * 100, shown: 29 },
    { what: 'Reported gross margin gap (points)', value: (JS.gp / JS.rev - CB.gp / CB.rev) * 100, shown: 23 },
    { what: 'Copperleaf is four times Juniper', value: CB.rev / JS.rev, shown: 4 },
  ],
};
