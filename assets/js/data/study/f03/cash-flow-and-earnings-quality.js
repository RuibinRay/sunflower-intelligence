// cash-flow-and-earnings-quality.js — F03 · Cash flow and earnings quality. Content only; exercises are in
// cash-flow-and-earnings-quality.ex.js.
// Lantern’s figures come from case.js (PERIODS, COMPARATIVE, FACTS, LEASE) and core/ratios.js (cashQuality). Real
// figures (Amazon 2012–2014, Enron’s 2001 restatement and the Powers Report) are from REAL-FIGURES.md and the filings
// cited. Rowan & Pike Outfitters is fictional.
import { PERIODS, COMPARATIVE, FACTS, LEASE, OPENING } from './case.js?v=18';
import * as R from '../../../core/ratios.js?v=18';

const P26 = PERIODS[2026], P27 = PERIODS[2027];
const Q26 = R.cashQuality(P26), Q27 = R.cashQuality(P27, P26);
const avgTA = (P26.totalAssets + P27.totalAssets) / 2;                         // 210,779.5
const ind = Object.fromEntries(COMPARATIVE.indirect2027);
const wcLines = COMPARATIVE.indirect2027.slice(2, -1);                          // the ten working-capital lines
const wcTotal = wcLines.reduce((s, r) => s + r[1], 0);                          // −33,890
const law = FACTS.lawFirm;
const contract = P27.contractAsset;                                             // 30,840
const taxRate = FACTS.tax.rate;
const noCA = { pretax: P27.pretax - contract, ni: P27.netIncome - contract * (1 - taxRate) };   // −932, −699
const perPoint = law.baseFee * 0.01 * law.months2027 / 12;                     // $300 of 2027 revenue per point of CPI
const cpi2 = Math.round(law.baseFee * 1.02 * law.months2027 / 12);             // 30,600
const cashFlow = Object.fromEntries(COMPARATIVE.cash.map(([l, a, b]) => [l, [a, b]]));
const fin27 = cashFlow['Net cash from financing activities'][1];                // 9,250
const leasePrincipal = LEASE.paid2027 - LEASE.interest2027;                    // 28,876
const fmt = (v) => (v < 0 ? `(${Math.abs(v).toLocaleString('en-US')})` : v.toLocaleString('en-US'));
const signed = (v) => `${v < 0 ? '−' : '+'}${Math.abs(v).toLocaleString('en-US')}`;

// Amazon (REAL-FIGURES.md §2, 2014 Form 10-K), $ millions
const AMZN = { years: [2012, 2013, 2014], ni: [-39, 274, -241], cfo: [4180, 5475, 6842], capex: [3785, 3444, 4893], fcf: [395, 2031, 1949],
  da: [2159, 3253, 4746], ap2014: 16459, inv2014: 8299, ar2014: 5612, ca2014: 31327, cl2014: 28089,
  sbc2014: 1497, wc2014: [-1193, -1039, 1759, 706, 4433, -3692] };   // 2014 cash-flow statement (R2): stock-based compensation and working-capital lines
// Enron (REAL-FIGURES.md §3, Form 8-K of 8 November 2001, Table 1), $ millions
const ENRON = { reported: [105, 703, 893, 979], restated: [9, 590, 643, 847], debtUp: [711, 561, 685, 628],
  jedi: [45, 107, 153, 91], ljm: [0, 0, 95, 8], audit: [51, 6, 2, 33],
  rev: [40112, 100789], ta: [33381, 65503], debt: [8152, 10229] };   // 1999 and 2000, Form 10-K for 2000, Item 6
const enronCut = ENRON.reported.map((v, i) => v - ENRON.restated[i]);          // 96, 113, 250, 132

// Rowan & Pike Outfitters (fictional), $ thousands: years 1 and 2
const RP = { rev: [4200, 4620], ar: [520, 810], ni: [310, 420], cfo: [360, 120], gain: 90, capDev: 150 };
const dso = (ar, rev) => ar / rev * 365;

export default {
  slug: 'cash-flow-and-earnings-quality',
  title: 'Cash flow and earnings quality',
  blurb: 'Test how much of a profit has arrived as cash: compare cash from operations with net income, measure accruals and free cash flow, find the estimates inside earnings, and recognise the warning signs of aggressive accounting.',
  status: 'draft',
  objectives: [
    'Calculate the ratio of cash from operations to net income, total accruals, the accruals ratio and free cash flow, stating the balances used.',
    'Explain, line by line from the indirect method, why Lantern’s 2027 profit of $22,431 produced only $8,341 of operating cash.',
    'Assess how much a profit depends on estimates, such as an unbilled contract asset measured with an inflation forecast.',
    'Distinguish growth that consumes cash from accounting that inflates profit, using Amazon’s and Enron’s filings.',
    'Apply a list of red flags to a set of statements and decide what further evidence an analyst should ask for.',
  ],
  prerequisites: [
    { lesson: 'f02/indirect-method', why: 'Every measure here starts from the reconciliation of net income to cash from operations.' },
    { lesson: 'f02/revenue-recognition', why: 'Lantern’s contract asset is revenue recognised over time under ASC 606, before it can be billed.' },
    { lesson: 'f03/efficiency-and-working-capital', why: 'Working capital that grows with the business is the main reason profit and operating cash differ.' },
  ],
  case: 'lantern',

  concept: [
    { case: 'Lantern’s 2027 income statement shows net income of $22,431. Over the same year its cash fell from $42,940 to $6,531, and by December it had drawn $24,000 on Coastline’s line of credit. Coastline’s credit analyst, reviewing the line, writes one question at the top of her notes: how much of this profit is cash?' },
    { p: 'Profit and cash differ because financial statements are prepared on the <g>accrual basis</g>: revenue is recorded when it is earned and expenses when they are incurred, whenever the cash moves. That is the right way to measure performance, but it means net income contains amounts that have not yet become cash, and some that never will if an estimate turns out wrong. <g>Earnings quality</g> is the analyst’s word for how far reported profit can be trusted as a guide to the cash the business generates and will go on generating.' },
    { p: 'Three questions make the idea concrete. Has the profit arrived as cash, or is it sitting in receivables, contract assets and inventory? Will it recur, or does it include one-off gains? And how much of it rests on estimates, such as bad debts, useful lives or a forecast of inflation, that management chose? None of these makes a profit wrong. Each tells you how much weight it can bear.' },
    { h: 'Cash from operations against net income' },
    { p: 'The first test is the simplest: divide cash from operations (CFO) by net income. A ratio near or above 1 means the profit has come in as cash; a ratio well below 1 means much of it is still tied up somewhere. The gap between them, net income minus CFO, is called total <g>accruals</g> in this sense: the part of profit not yet matched by operating cash.' },
    { table: {
      caption: 'Lantern: profit, operating cash and free cash flow',
      head: ['', '2026 (ten months) ($)', '2027 ($)'],
      align: ['l', 'r', 'r'],
      rows: [
        ['Net income', fmt(P26.netIncome), fmt(P27.netIncome)],
        ['Net cash from operating activities (CFO)', fmt(P26.cfo), fmt(P27.cfo)],
        ['CFO ÷ net income', Q26.cfoToNetIncome.toFixed(2), Q27.cfoToNetIncome.toFixed(2)],
        ['Accruals (net income − CFO)', fmt(Q26.accruals), fmt(Q27.accruals)],
        ['Capital expenditure', fmt(P26.capex), fmt(P27.capex)],
        ['Free cash flow (CFO − capital expenditure)', fmt(Q26.freeCashFlow), fmt(Q27.freeCashFlow)],
      ],
      note: 'Fictional figures from Lantern’s statements. 2026 runs from 1 March to 31 December 2026; neither year is annualised here, because the ratio of two flows from the same period needs no adjustment.',
    } },
    { p: 'The two years point opposite ways. In 2026 operations brought in $1.46 for every dollar of profit: depreciation was charged without any cash leaving, and suppliers, staff, the tax authority and customers who paid in advance were all, in effect, financing Lantern’s first year. In 2027 only $0.37 of each dollar of profit arrived as cash, and the accruals swung from −$12,553 to +$14,090.' },
    { h: 'Where 2027’s profit went' },
    { p: 'The indirect method, which you used in F02, answers the question line by line. It starts from net income and lists every reason the two figures differ. Here is Lantern’s 2027 reconciliation.' },
    { table: {
      caption: 'Lantern 2027: from net income to cash from operations',
      head: ['Line', '$'],
      align: ['l', 'r'],
      rows: COMPARATIVE.indirect2027.slice(0, -1).map(([l, v]) => [l, fmt(v)]),
      foot: [['Net cash from operating activities', fmt(P27.cfo)]],
      note: 'Fictional figures. Depreciation is added back because it used no cash this year; every other line is a change in an operating current asset or liability.',
    } },
    { p: `Depreciation of $19,800 lifts operating cash above profit, as it did in 2026. The working-capital lines pull the other way, by $33,890 in total, and one line dominates them: the increase of $30,840 in the <g>contract asset</g>. That is the law firm’s catering. Lantern has served the firm’s events since 1 April and recognised nine months of an estimated $41,120 annual fee as revenue, but the contract says the fee is paid at the end of each contract year, on 31 March 2028. The revenue is real under ASC 606, and it is in net income, but not a cent of it is in cash.` },
    { callout: 'key', title: 'Take out the unbilled revenue and the profit disappears', html: `Lantern’s income before tax was $29,908. Without the $30,840 of unbilled law-firm revenue it would have been <m>29{,}908 - 30{,}840 = -932</m>, a loss before tax. After a 25% tax benefit of $233 (a loss carried forward, if Lantern can use it) the net loss would be $699; with no benefit, $932. Without that revenue, and still bearing the cost of the events, Lantern would have made a loss. That doesn’t make the profit false. It means 2027’s profit is a claim on one client’s payment in March 2028, and its quality depends on that client and on the estimate of the fee.` },
    { h: 'Free cash flow' },
    { p: '<g>Free cash flow</g> (FCF) takes the analysis one step further. Operating cash has to pay for the equipment, fit-outs and other long-lived assets that keep the business running and growing, called <g>capital expenditure</g> (capex). What is left is free for lenders and owners: to repay debt, pay dividends or build up cash. The usual definition, and Amazon’s published one, is CFO minus capital expenditure.' },
    { p: `Lantern’s 2027 free cash flow was <m>8{,}341 - 54{,}000 = -45{,}659</m>. The $54,000 was the cafés’ fit-out ($36,000) and machines ($18,000), all paid in cash. The shortfall was met by running down cash by $36,409 and by net financing of $9,250: $24,000 drawn on the line of credit, less $12,750 of loan repayments and a $2,000 dividend. Check: <m>-45{,}659 + 9{,}250 = -36{,}409</m>.` },
    { p: 'Negative free cash flow is not, by itself, a bad sign. A business that is investing to grow spends cash before the new assets earn it; the cafés were open for ten months of 2027 and their first full year is 2028. The question an analyst asks is whether the investment is a one-off step or a habit, and how it was paid for. Lantern’s was paid for with a cash buffer that is now gone and a line of credit that is 80% drawn, which is why the quality of 2027’s profit matters so much to Coastline.' },
  ],

  theory: [
    { h: 'The measures and their conventions' },
    { p: 'Four measures cover most of what an analyst needs. Each is defined exactly as in the course’s ratio engine, so the lessons, the exercises and the ratios widget agree.' },
    { list: [
      '<b>CFO ÷ net income.</b> How many dollars of operating cash each dollar of profit produced. Meaningless when net income is near zero or negative: then compare the dollar amounts.',
      '<b>Total accruals</b> = net income − CFO. Positive when profit runs ahead of cash, negative when cash runs ahead.',
      '<b>Accruals ratio</b> = (net income − CFO) ÷ average total assets. Scaling by assets lets you compare years and companies of different sizes. For 2027 the average is of the opening and closing balance sheets; for 2026 there is no opening balance sheet (Lantern started on 1 March 2026 with nothing), so 2026 uses closing total assets.',
      '<b>Free cash flow</b> = CFO − capital expenditure, and the <b>FCF margin</b> = FCF ÷ revenue. Some analysts also subtract dividends, or only the capex needed to maintain the existing assets; OpenStax’s accounting text shows both versions. State the definition you use.',
    ] },
    { p: `Lantern’s accruals ratio was <m>-12{,}553 \\div 93{,}676 = -13.4\\%</m> in 2026 (closing total assets) and <m>14{,}090 \\div 210{,}779.5 = 6.7\\%</m> in 2027, where 210,779.5 is the average of $93,676 and $327,883. The 2027 figure is flattered by the size of the balance sheet: $173,379 of it is the cafés’ right-of-use asset, which ASC 842 brought onto the balance sheet in March. Treat a large positive accruals ratio as a prompt to look for the reason, not as a verdict.` },
    { p: 'A fifth measure looks at investment: <b>capex ÷ depreciation</b>. A business that spends about as much as its depreciation is maintaining its assets; one that spends much more is growing them. Lantern’s 2027 ratio was <m>54{,}000 \\div 19{,}800 = 2.73</m>, a growth year. A ratio well below 1 year after year can mean assets are wearing out without replacement, which flatters free cash flow for a while.' },
    { h: 'Estimates inside earnings' },
    { p: 'Every profit contains estimates. The analyst’s job is to find the large ones and ask how much they could move. Lantern’s 2027 statements have four.' },
    { list: [
      `<b>The contract asset.</b> The law firm’s fee is $40,000 a year in March 2027 dollars, raised by the consumer price index. Lantern estimated 2.8% inflation, giving <m>40{,}000 \\times 1.028 = 41{,}120</m> for the first contract year and <m>41{,}120 \\times 9/12 = 30{,}840</m> for April–December. Each percentage point of inflation moves 2027 revenue by <m>40{,}000 \\times 0.01 \\times 9/12 = 300</m> dollars. The estimate is small; the timing and the single client are the real exposure.`,
      '<b>The allowance for doubtful accounts.</b> Set from an aging of catering receivables; a higher loss rate on the over-60-day band would cut profit at once.',
      '<b>Useful lives.</b> The fit-out is depreciated over the five-year leases and the machines over five years. Longer lives would mean lower depreciation and higher profit, with no change in cash.',
      '<b>The lease measurement.</b> The right-of-use asset and lease liability ($202,255 at the start) use Coastline’s 7.2% as the discount rate. The straight-line lease cost of $40,000 doesn’t depend on it, but the balance sheet does.',
    ] },
    { p: 'Notice what the list shows: estimates change profit, never cash. That is why comparing profit with cash is the most reliable single test of earnings quality. Cash from operations can be shifted between years too, by delaying payments to suppliers or selling receivables, but it is much harder to create from nothing.' },
    { h: 'Leases and comparing operating cash flows' },
    { p: `Under US GAAP (ASC 842) the payments on an operating lease are operating cash outflows: Lantern’s $40,000 of café rent is inside its CFO. Under IFRS 16 there is no operating lease category for lessees, and the principal part of each lease payment is a financing outflow. And since IAS 7 was amended by IFRS 18, for periods beginning on or after 1 January 2027, a company whose main business is not lending or investing must classify interest paid as financing too; the old choice between operating and financing is gone. On IFRS, then, Lantern’s 2027 operating cash flow would be $40,000 higher: the principal of <m>40{,}000 - 11{,}124 = 28{,}876</m> dollars and the $11,124 of interest would both be financing outflows. Free cash flow would rise by the same amount, though nothing about the cafés’ economics changed.` },
    { callout: 'standards', title: 'US GAAP and IFRS: lease payments in the cash-flow statement', html: 'US GAAP: operating lease payments are operating activities; for a finance lease, the principal is financing and the interest is classified like other interest paid (operating). IFRS 16: the principal portion of lease payments is financing; the interest portion is classified like other interest paid, which under IAS 7 as amended by IFRS 18 (periods beginning on or after 1 January 2027) is financing for a company whose main business is not lending or investing (before IFRS 18 it could choose operating); short-term, low-value and variable lease payments are operating. Before comparing the CFO or free cash flow of a US and an IFRS company that lease heavily, put them on the same basis.' },
    { h: 'Reinvestment over reported profit: Amazon, 2012–2014' },
    { p: 'The opposite pattern to Lantern’s is a business whose reported profit looks poor while its operations produce a great deal of cash. Amazon’s filings for 2012–2014 are a well-known example.' },
    { table: {
      caption: 'Amazon.com, Inc., 2012–2014 ($ millions)',
      head: ['', '2012', '2013', '2014'],
      align: ['l', 'r', 'r', 'r'],
      rows: [
        ['Net income (loss)', ...AMZN.ni.map(fmt)],
        ['Net cash provided by operating activities', ...AMZN.cfo.map(fmt)],
        ['Purchases of property and equipment, including internal-use software and website development', ...AMZN.capex.map((v) => fmt(-v))],
        ['Free cash flow (Amazon’s non-GAAP measure)', ...AMZN.fcf.map(fmt)],
        ['Depreciation of property and equipment and other amortisation', ...AMZN.da.map(fmt)],
      ],
      note: 'Source: Amazon.com, Inc., Form 10-K for 2014: statements of operations and cash flows, and Item 6 (free cash flow, footnote 2). The 2014 10-K defines free cash flow as net cash from operating activities less those purchases.',
    } },
    { p: 'In 2014 Amazon reported a net loss of $241 million and operating cash of $6,842 million. The gap was $7,083 million. Depreciation and amortisation ($4,746 million) and stock-based compensation ($1,497 million), both noncash, explain most of it; working capital released a further $974 million, because payables grew faster than inventories plus receivables. Amazon’s operating working capital (receivables plus inventories minus payables) was negative: at the end of 2014 it owed suppliers $16,459 million, more than its inventories ($8,299 million) and receivables ($5,612 million) together, a net −$2,548 million. Customers paid before Amazon paid its suppliers, so growth released cash instead of absorbing it. (Its total working capital, all current assets less all current liabilities, was positive: $31,327 million against $28,089 million.) Free cash flow stayed positive while profit was close to zero.' },
    { p: 'The lesson cuts both ways. Low profit with strong cash flow can be a sign of conservative or investment-heavy accounting, not weakness. But Amazon’s model depends on suppliers’ terms; a business with Lantern’s structure, where a large client pays a year after the first event, sits on the other side of that trade.' },
    { h: 'Aggressive accounting: Enron’s restatement' },
    { p: `On 8 November 2001 Enron filed a Form 8-K saying it would restate its financial statements for 1997 to 2001. Entities it had kept off its balance sheet should have been consolidated: Chewco and JEDI from November 1997, and a subsidiary of LJM1, a related-party partnership, from 1999. The filing’s Table 1 shows the effect. The restatement (mainly consolidation, plus earlier proposed audit adjustments and reclassifications) cut net income by $96 million (1997), $113 million (1998), $250 million (1999) and $132 million (2000); consolidation alone accounted for $45, $107, $248 and $99 million of that. Consolidating JEDI and Chewco raised debt by $711, $561, $685 and $628 million in those years. For 2000, reported net income of $979 million became $847 million.` },
    { p: 'The Board’s special investigative committee reported in February 2002 (the Powers Report). Its summary found that many of the most significant transactions were designed to produce favourable financial-statement results rather than real economic objectives or a transfer of risk, and that the hedging transactions with those entities led Enron to report earnings from the third quarter of 2000 to the third quarter of 2001 that were almost $1 billion higher than should have been reported.' },
    { quote: { text: 'Many of the most significant transactions apparently were designed to accomplish favorable financial statement results, not to achieve bona fide economic objectives or to transfer risk.', cite: 'Report of Investigation by the Special Investigative Committee of the Board of Directors of Enron Corp. (Powers Report), 1 February 2002, p. 4.' } },
    { p: `What could an analyst have seen beforehand? Not the restated figures. The 2000 10-K showed revenues up from $${ENRON.rev[0].toLocaleString('en-US')} million to $${ENRON.rev[1].toLocaleString('en-US')} million in a year, total assets nearly doubled from $${ENRON.ta[0].toLocaleString('en-US')} million to $${ENRON.ta[1].toLocaleString('en-US')} million and debt up from $${ENRON.debt[0].toLocaleString('en-US')} million to $${ENRON.debt[1].toLocaleString('en-US')} million. Rapid growth is not a red flag in itself; growth financed by debt, with earnings that depend on transactions with related parties, is the pattern the list below is built to catch.` },
    { h: 'Red flags' },
    { p: 'No single sign proves anything. Several together are a reason to read the notes closely and to ask management questions before relying on the profit.' },
    { list: [
      '<b>Receivables or contract assets growing faster than sales.</b> Revenue is being recognised before customers pay, or customers are paying more slowly.',
      '<b>Operating cash persistently below net income</b>, year after year, without an investment or growth story that explains it.',
      '<b>Costs capitalised that peers expense</b>, such as start-up, advertising or routine maintenance costs, or useful lives longer than peers use. Capitalising moves the cash outflow into investing and the expense into later years.',
      '<b>One-off gains inside operating income</b>: sales of property, insurance settlements, the release of provisions.',
      '<b>Related-party transactions</b> and entities kept off the balance sheet, especially when the related party is an officer of the company.',
      '<b>Changes in estimates or policies</b>, such as longer useful lives, lower bad-debt rates or a new revenue policy, that raise profit in the year they are made.',
      '<b>Dividends or buybacks paid while free cash flow is negative</b>, financed by debt.',
      '<b>Non-GAAP “adjusted” earnings</b> that drift further above GAAP net income each year.',
    ] },
    { p: 'Lantern trips two of them in 2027: a contract asset that grew from nothing to $30,840, and a $2,000 dividend paid in a year of negative free cash flow. Neither is improper. Both belong in Coastline’s file. Analysts who want a more formal screen sometimes use statistical models such as Beneish’s M-score, which combines several of these signals into one score; like Altman’s Z-scores in the next lesson, it flags firms for review rather than proving anything.' },
  ],

  formulas: [
    { id: 'cfq-cfo-ni', name: 'Cash from operations to net income',
      tex: String.raw`\text{CFO-to-NI} = \dfrac{\text{CFO}}{\text{NI}}`,
      where: [[String.raw`\text{CFO}`, 'Net cash from operating activities for the period', '$'], [String.raw`\text{NI}`, 'Net income for the same period', '$']],
      assumptions: 'Both figures cover the same period, so part-year periods need no annualising. Not meaningful when net income is close to zero or negative.',
      note: 'Lantern: <m>8{,}341 \\div 22{,}431 = 0.37</m> in 2027; <m>39{,}940 \\div 27{,}387 = 1.46</m> in 2026.' },
    { id: 'cfq-accruals', name: 'Total accruals (cash-flow measure)',
      tex: String.raw`\text{Accruals} = \text{NI} - \text{CFO}`,
      where: [[String.raw`\text{NI}`, 'Net income', '$'], [String.raw`\text{CFO}`, 'Net cash from operating activities', '$']],
      note: 'Positive: profit is ahead of cash. Lantern 2027: <m>22{,}431 - 8{,}341 = 14{,}090</m>.' },
    { id: 'cfq-accruals-ratio', name: 'Accruals ratio',
      tex: String.raw`\text{Accruals ratio} = \dfrac{\text{NI} - \text{CFO}}{\overline{\text{Total assets}}}`,
      where: [[String.raw`\text{NI} - \text{CFO}`, 'Total accruals for the period', '$'], [String.raw`\overline{\text{Total assets}}`, 'Average of opening and closing total assets (closing only when there is no opening balance sheet)', '$']],
      assumptions: 'Scaling by assets makes the measure comparable across years and companies. Lease right-of-use assets enlarge the denominator for lessees under ASC 842 and IFRS 16.',
      note: 'Lantern 2027: <m>14{,}090 \\div 210{,}779.5 = 6.7\\%</m>.' },
    { id: 'cfq-fcf', name: 'Free cash flow',
      tex: String.raw`\text{FCF} = \text{CFO} - \text{Capex}`,
      where: [[String.raw`\text{FCF}`, 'Free cash flow: operating cash left after investment in long-lived assets', '$'], [String.raw`\text{CFO}`, 'Net cash from operating activities', '$'], [String.raw`\text{Capex}`, 'Capital expenditure: cash paid for property, plant, equipment and similar assets, as a positive number', '$']],
      assumptions: 'A non-GAAP measure: definitions vary (some subtract dividends, some only maintenance capex, Amazon later netted proceeds and incentives). State the one you use.',
      note: 'Lantern 2027: <m>8{,}341 - 54{,}000 = -45{,}659</m>.' },
    { id: 'cfq-capex-da', name: 'Capital expenditure to depreciation',
      tex: String.raw`\text{Capex-to-D\&A} = \dfrac{\text{Capex}}{\text{D\&A}}`,
      where: [[String.raw`\text{Capex}`, 'Capital expenditure for the period', '$'], [String.raw`\text{D\&A}`, 'Depreciation and amortisation for the period', '$']],
      note: 'Above 1: growing the asset base; well below 1 for years: assets may be wearing out. Lantern 2027: <m>54{,}000 \\div 19{,}800 = 2.73</m>.' },
  ],

  examples: [
    { level: 'simple', title: 'Lantern’s 2027 quality measures', fictional: true,
      setup: 'From Lantern’s 2027 statements: net income $22,431; net cash from operating activities $8,341; purchases of equipment and leasehold improvements $54,000; total assets $93,676 at 31 December 2026 and $327,883 at 31 December 2027. Calculate CFO ÷ net income, total accruals, the accruals ratio and free cash flow.',
      steps: [
        'CFO ÷ net income: <m>8{,}341 \\div 22{,}431 = 0.372</m>, or 0.37 to two places.',
        'Total accruals: <m>22{,}431 - 8{,}341 = 14{,}090</m>. Profit ran $14,090 ahead of operating cash.',
        'Average total assets: <m>(93{,}676 + 327{,}883) \\div 2 = 210{,}779.5</m>. Accruals ratio: <m>14{,}090 \\div 210{,}779.5 = 0.0668</m>, or 6.7%.',
        'Free cash flow: <m>8{,}341 - 54{,}000 = -45{,}659</m>.',
      ],
      answer: 'CFO ÷ net income 0.37; accruals $14,090; accruals ratio 6.7%; free cash flow −$45,659.',
      interpretation: 'Only 37 cents of each dollar of 2027 profit arrived as operating cash, and after the cafés’ fit-out and machines Lantern spent $45,659 more than its operations produced. The reconciliation shows why: the $30,840 contract asset.' },
    { level: 'challenging', title: 'How much of the profit rests on one estimate?', fictional: true,
      setup: `Lantern recognised $30,840 of revenue on the law firm’s contract: nine months of a first-year fee estimated at $40,000 × 1.028. Its 2027 income before tax was $29,908 and its tax rate is 25%. (a) What would net income have been without that revenue? (b) What would it have been had Lantern estimated 2.0% inflation instead of 2.8%? (c) What do the answers say about the quality of the profit?`,
      steps: [
        'Without the revenue: income before tax <m>29{,}908 - 30{,}840 = -932</m>. At 25% the tax effect is a benefit of 233 (a loss carried forward, if Lantern can use it later), so net income is <m>-932 + 233 = -699</m>; equivalently <m>22{,}431 - 30{,}840 \\times 0.75 = -699</m>. With no tax benefit the loss is 932.',
        'At 2.0% inflation the revenue is <m>40{,}000 \\times 1.020 \\times 9/12 = 30{,}600</m>, $240 less. After tax, net income falls by <m>240 \\times 0.75 = 180</m>, to <m>22{,}431 - 180 = 22{,}251</m>.',
        'Operating cash is $8,341 in every case: the contract asset is unbilled, so neither the revenue nor the inflation estimate touched cash in 2027 (the tax effect would show only in a later year’s payments).',
        'So the estimate barely matters, but the contract does: the whole of 2027’s profit depends on one client paying about $41,120 on 31 March 2028.',
      ],
      answer: '(a) A net loss of $699 after a $233 tax benefit ($932 if no benefit can be recognised). (b) Net income of $22,251, $180 lower. (c) The profit is sensitive to the existence and collection of the contract asset, not to the inflation estimate.',
      interpretation: 'Without the law-firm revenue, the rest of Lantern produced $8,341 of operating cash against a small loss: the cash flow of the cafés, shop and catering is better than their profit. Coastline’s analyst should therefore check the law firm’s creditworthiness and the contract terms, not argue about the CPI forecast.' },
    { level: 'applied', title: 'A lender screens an outdoor retailer for red flags', fictional: true,
      setup: 'Rowan & Pike Outfitters, a fictional outdoor-clothing wholesaler, asks its bank to raise its overdraft limit. Its figures, in thousands of dollars, for the last two years: revenue $4,200 and $4,620; receivables at the year end $520 and $810; net income $310 and $420; cash from operations $360 and $120. The notes to year 2 add that $150 of product-design costs were capitalised for the first time (expensed in year 1) and that operating income includes a $90 gain on selling a warehouse (treat it as after tax). Screen the figures for red flags and say what the bank should ask.',
      steps: [
        'Growth: revenue rose <m>(4{,}620 - 4{,}200) \\div 4{,}200 = 10.0\\%</m>; receivables rose <m>(810 - 520) \\div 520 = 55.8\\%</m>. Receivables are growing more than five times as fast as sales.',
        'Days sales outstanding on closing receivables (365 days): year 1 <m>520 \\div 4{,}200 \\times 365 = 45.2</m> days; year 2 <m>810 \\div 4{,}620 \\times 365 = 64.0</m> days.',
        'CFO ÷ net income fell from <m>360 \\div 310 = 1.16</m> to <m>120 \\div 420 = 0.29</m>.',
        'Underlying profit: take out the $90 gain and the $150 of design costs that year 1 would have expensed (ignoring their tax effect): <m>420 - 90 - 150 = 180</m>, against $310 the year before.',
      ],
      answer: 'Three red flags: receivables growing faster than sales (DSO up from 45.2 to 64.0 days), CFO falling to 0.29 of net income, and a profit increase that comes from a one-off gain and a change in accounting policy. On a comparable basis profit fell from $310 to about $180 thousand.',
      interpretation: 'The bank should ask for an aged receivables listing (are a few large customers paying late, or are sales being booked early?), the reason for capitalising design costs and the auditor’s view of it, and a cash-flow forecast for the extra overdraft. Reported profit rose 35%; the evidence says the business weakened.' },
  ],

  demo: [
    { widget: 'cfq-ratios', intro: 'Lantern’s cash-flow quality measures for both years. Tick the adjustment to see 2027 without the law firm’s unbilled revenue (and the tax on it): net income turns negative while operating cash doesn’t move. Pick a ratio to see its working.' },
    { widget: 'cfq-explorer', intro: 'Start from Lantern’s 2027 figures. Change the working capital absorbed, the capital expenditure or the profit and watch CFO ÷ net income, the accruals ratio and free cash flow respond. Try setting the working capital absorbed to zero: that is roughly Lantern without the contract asset’s timing.' },
  ],

  mistakes: [
    { title: '“Lantern made a profit, so it generated cash.”', html: 'Profit is measured on the accrual basis; cash is not. In 2027 Lantern earned $22,431 and its operations produced $8,341, because $30,840 of revenue was unbilled. Always read the cash-flow statement next to the income statement.' },
    { title: '“Negative free cash flow means the business is failing.”', html: 'Free cash flow is negative whenever investment exceeds operating cash, which is normal in a year of expansion. Ask what the capex bought, whether it will produce cash, and how it was financed. Lantern’s −$45,659 is the cafés; the concern is that it used up the cash buffer and most of the credit line.' },
    { title: '“Depreciation is added back, so more depreciation means more cash.”', html: 'Depreciation is a noncash expense; the add-back only undoes it. Changing useful lives changes profit and accruals, never operating cash (apart from tax). That is exactly why comparing profit with cash exposes estimates.' },
    { title: '“A ratio of CFO to net income of 3.5 is excellent.”', html: 'Not when net income is tiny or negative: the ratio explodes or changes sign. Amazon’s 2014 ratio would be negative (CFO $6,842 million against a $241 million loss). Compare the amounts in dollars and use the accruals ratio, which divides by assets instead.' },
    { title: '“Lease-heavy companies under IFRS and US GAAP have comparable operating cash flows.”', html: 'Under IFRS 16 the principal part of lease payments is financing; under ASC 842 operating lease payments are operating. An IFRS reporter with Lantern’s cafés would show $40,000 more operating cash and free cash flow in 2027 (principal and, under IFRS 18, interest both in financing). Adjust before you compare.' },
  ],

  application: [
    { p: '<b>The credit file.</b> Coastline’s analyst rewrites her note on Lantern after reading the reconciliation. The decline in operating cash is explained: $30,840 is due from a law firm on 31 March 2028, and the cafés’ fit-out and machines are one-off investments already paid for. What worries her is not the quality of the accounting but its timing. Until the law firm pays, Lantern has $6,531 of cash, $6,000 of undrawn credit and a $10,000 note due on 1 March 2028, a month before the money arrives. She asks Ana for the law firm’s payment record on its first invoices, a monthly cash forecast to April 2028, and confirmation that no dividend will be paid until the line is reduced.' },
    { p: '<b>The owner’s view.</b> For Ana the same analysis changes a decision. The cafés’ 2027 profit looks thin after their lease cost, wages and depreciation, but their cash is better than their profit: the till takings arrive daily and depreciation is a large noncash charge. Her free cash flow problem was the one-off fit-out. Before she opens a third café she plans to wait for a full year of the first two, to see whether their operating cash covers the next fit-out without the credit line.' },
    { p: '<b>An equity analyst’s screen.</b> An analyst covering listed retailers runs the red-flag list on each company every quarter: receivables and contract assets against revenue, CFO against net income over three years, capitalised costs, gains in operating income and the gap between adjusted and GAAP earnings. Companies that trip several flags get a closer reading of the notes and the MD&A, and questions on the next earnings call. A company like Amazon in 2014, with a reported loss and rising free cash flow, passes the cash tests easily; one whose earnings grow while its cash shrinks does not.' },
  ],

  summary: [
    'Earnings quality asks whether profit has arrived as cash, whether it will recur and how much it rests on estimates.',
    'Compare cash from operations with net income: Lantern’s ratio fell from 1.46 (2026) to 0.37 (2027), and accruals swung from −$12,553 to $14,090.',
    'The indirect method shows why: in 2027 the $30,840 law-firm contract asset, unbilled until 31 March 2028, absorbed almost all of the profit; without it Lantern would have made a loss ($699 after a tax benefit, $932 before tax).',
    'Free cash flow = CFO − capital expenditure. Lantern’s −$45,659 reflects the cafés’ fit-out and machines, paid for from cash reserves and the line of credit.',
    'Estimates (useful lives, allowances, inflation forecasts) move profit but not cash; lease classification moves cash between activities (IFRS 16 versus ASC 842), so adjust before comparing.',
    'Amazon (2012–2014) shows low profit with strong cash flow from noncash charges and negative operating working capital (payables above inventories plus receivables); Enron’s 2001 restatement shows how off-balance-sheet, related-party structures inflated earnings.',
    'Red flags: receivables growing faster than sales, CFO persistently below net income, capitalised costs, one-off gains, related parties, changed estimates, payouts funded by debt.',
  ],

  glossary: [
    { term: 'Earnings quality', def: 'How far reported profit can be relied on as a guide to the cash a business generates and will go on generating: whether it has arrived as cash, whether it will recur and how much it depends on management’s estimates.' },
    { term: 'Free cash flow', def: 'Cash from operating activities minus capital expenditure: the operating cash left for lenders and owners after paying for long-lived assets. A non-GAAP measure whose exact definition varies between companies.' },
    { term: 'Capital expenditure', def: 'Cash spent on property, plant, equipment and similar long-lived assets (capex), reported in investing activities.' },
    { term: 'Accruals ratio', def: 'Net income minus cash from operating activities, divided by average total assets: the share of the asset base by which profit ran ahead of (positive) or behind (negative) operating cash.' },
    { term: 'Restatement', def: 'A revision of previously issued financial statements to correct an error, so the earlier figures can no longer be relied on.' },
  ],

  references: [
    { text: 'Franklin, M., Graybeal, P. &amp; Cooper, D. (2019). <i>Principles of Accounting, Volume 1: Financial Accounting</i>, section 16.5, “Use Information from the Statement of Cash Flows to Prepare Ratios to Assess Liquidity and Solvency”. OpenStax.', url: 'https://openstax.org/books/principles-financial-accounting/pages/16-5-use-information-from-the-statement-of-cash-flows-to-prepare-ratios-to-assess-liquidity-and-solvency', checked: '2026-10-26' },
    { text: 'Amazon.com, Inc. (2015). Form 10-K for the fiscal year ended 31 December 2014: Item 6, Selected Consolidated Financial Data (free cash flow and its definition), and the consolidated statements, including the statements of cash flows (R2). SEC EDGAR.', url: 'https://www.sec.gov/Archives/edgar/data/0001018724/000101872415000006/amzn-20141231x10k.htm', checked: '2026-10-26' },
    { text: 'Enron Corp. (2001). Form 8-K, 8 November 2001, Exhibit 99.1: “Enron Provides Additional Information About Related Party and Off-Balance Sheet Transactions; Company to Restate Earnings for 1997–2001”. SEC EDGAR.', url: 'https://www.sec.gov/Archives/edgar/data/0001024401/000095012901503835/h91831ex99-1.txt', checked: '2026-10-26' },
    { text: 'Powers, W. C., Troubh, R. S. &amp; Winokur, H. S. (2002). <i>Report of Investigation by the Special Investigative Committee of the Board of Directors of Enron Corp.</i>, 1 February 2002 (filed with Enron’s Form 8-K). SEC EDGAR.', url: 'https://www.sec.gov/Archives/edgar/data/0001024401/000090951802000089/big.txt', checked: '2026-10-26' },
    { text: 'Enron Corp. (2001). Form 8-K, 8 November 2001, Item 5 and Table 1 (net income, debt and equity as reported and restated). SEC EDGAR.', url: 'https://www.sec.gov/Archives/edgar/data/0001024401/000095012901503835/h91831e8-k.txt', checked: '2026-10-26' },
    { text: 'Enron Corp. (2001). Form 10-K for 2000, Item 6, Selected Financial Data. SEC EDGAR.', url: 'https://www.sec.gov/Archives/edgar/data/1024401/000102440101500010/ene10-k.txt', checked: '2026-10-26' },
    { text: 'Amazon.com, Inc. (2024). Exhibit 99.2, “Reconciliation of Non-GAAP Financial Measures” (free cash flow defined with purchases of property and equipment net of proceeds from sales and incentives). SEC EDGAR.', url: 'https://www.sec.gov/Archives/edgar/data/1018724/000110465924045915/tm246113d3_ex99-2.htm', checked: '2026-10-26' },
    { text: 'Boissou, V. &amp; Ahuja, K. (2026). “IFRS 18 changes the statement of cash flows”. KPMG, 1 June 2026.', url: 'https://kpmg.com/us/en/articles/2026/ifrs-18-changes-statement-cash-flows.html', checked: '2026-10-26' },
    { text: 'KPMG Australia (2019). “AASB 16 Check: How to classify lease payments on lessees’ cash flow statements”, 31 May 2019 (AASB 16 is the Australian equivalent of IFRS 16).', url: 'https://kpmg.com/au/en/insights/financial-reporting/leases/aasb-16-check-cash-flow-statement-lessee-impact.html', checked: '2026-10-26' },
  ],

  checks: [
    // the case and the comparison table
    { what: 'Net income 2027', value: P27.netIncome, shown: 22431 },
    { what: 'Net income 2026', value: P26.netIncome, shown: 27387 },
    { what: 'Cash at the start of 2027', value: OPENING.Cash, shown: 42940 },
    { what: 'Cash at the end of 2027', value: P27.cash, shown: 6531 },
    { what: 'Line of credit drawn', value: FACTS.lineOfCredit.draws.reduce((s, d) => s + d.amount, 0), shown: 24000 },
    { what: 'CFO 2026', value: P26.cfo, shown: 39940 },
    { what: 'CFO 2027', value: P27.cfo, shown: 8341 },
    { what: 'CFO ÷ NI 2026', value: Q26.cfoToNetIncome, shown: 1.46 },
    { what: 'CFO ÷ NI 2027', value: Q27.cfoToNetIncome, shown: 0.37 },
    { what: 'CFO ÷ NI 2027 (three places)', value: Q27.cfoToNetIncome, shown: 0.372, tol: 0.0005 },
    { what: 'Accruals 2026', value: Q26.accruals, shown: -12553 },
    { what: 'Accruals 2027', value: Q27.accruals, shown: 14090 },
    { what: 'Capex 2026', value: P26.capex, shown: 22000 },
    { what: 'Capex 2027', value: P27.capex, shown: 54000 },
    { what: 'FCF 2026', value: Q26.freeCashFlow, shown: 17940 },
    { what: 'FCF 2027', value: Q27.freeCashFlow, shown: -45659 },
    // the reconciliation
    { what: 'Depreciation add-back 2027', value: ind['Depreciation'], shown: 19800 },
    { what: 'Working-capital lines total', value: wcTotal, shown: -33890 },
    { what: 'Reconciliation adds up', value: P27.netIncome + ind['Depreciation'] + wcTotal, shown: 8341 },
    { what: 'Contract asset increase', value: -ind['Increase in contract asset'], shown: 30840 },
    { what: 'Contract asset', value: contract, shown: 30840 },
    { what: 'First-year fee', value: law.baseFee * (1 + law.expectedInflation), shown: 41120 },
    { what: 'Nine months of the fee', value: 41120 * 9 / 12, shown: 30840 },
    { what: 'Base fee', value: law.baseFee, shown: 40000 },
    { what: 'Inflation estimate %', value: law.expectedInflation * 100, shown: 2.8 },
    { what: 'Income before tax', value: P27.pretax, shown: 29908 },
    { what: 'Pre-tax without the contract asset', value: noCA.pretax, shown: -932 },
    { what: 'Tax on that', value: noCA.pretax * taxRate, shown: -233 },
    { what: 'Net income without the contract asset', value: noCA.ni, shown: -699 },
    { what: 'Net income without (route 2)', value: -932 + 233, shown: -699 },
    { what: 'Tax rate %', value: taxRate * 100, shown: 25 },
    // free cash flow funding
    { what: 'Fit-out', value: FACTS.cafes.fitOut.cost, shown: 36000 },
    { what: 'Machines', value: FACTS.cafes.machines.cost, shown: 18000 },
    { what: 'Cash fall 2027', value: OPENING.Cash - P27.cash, shown: 36409 },
    { what: 'Net financing 2027', value: fin27, shown: 9250 },
    { what: 'Loan repayments 2027', value: -(cashFlow['Repayment of instalment note payable'][1] + cashFlow['Repayment of notes payable'][1]), shown: 12750 },
    { what: 'Dividend 2027', value: P27.dividends, shown: 2000 },
    { what: 'Financing pieces', value: 24000 - 12750 - 2000, shown: 9250 },
    { what: 'FCF + financing = change in cash', value: Q27.freeCashFlow + fin27, shown: -36409 },
    { what: 'Line 80% drawn', value: 24000 / FACTS.lineOfCredit.limit * 100, shown: 80 },
    { what: 'Cafés open ten months', value: FACTS.cafes.months, shown: 10 },
    // theory
    { what: 'Accruals ratio 2026 %', value: Q26.accrualsRatio * 100, shown: -13.4, tol: 0.05 },
    { what: 'Total assets 2026', value: P26.totalAssets, shown: 93676 },
    { what: 'Total assets 2027', value: P27.totalAssets, shown: 327883 },
    { what: 'Average total assets', value: avgTA, shown: 210779.5 },
    { what: 'Accruals ratio 2027 %', value: Q27.accrualsRatio * 100, shown: 6.7, tol: 0.05 },
    { what: 'Accruals ratio 2027 (4 places)', value: Q27.accrualsRatio, shown: 0.0668, tol: 0.00005 },
    { what: 'Right-of-use asset 2027', value: P27.rightOfUse, shown: 173379 },
    { what: 'Capex ÷ D&A 2027', value: Q27.capexToDa, shown: 2.73 },
    { what: 'D&A 2027', value: P27.da, shown: 19800 },
    { what: 'CPI: revenue per point', value: perPoint, shown: 300 },
    { what: 'Lease liability at the start', value: LEASE.initial, shown: 202255 },
    { what: 'Lease rate %', value: LEASE.rate * 100, shown: 7.2 },
    { what: 'Lease cost 2027', value: LEASE.cost2027, shown: 40000 },
    { what: 'Lease payments 2027', value: LEASE.paid2027, shown: 40000 },
    { what: 'Lease interest 2027', value: LEASE.interest2027, shown: 11124 },
    { what: 'Lease principal 2027', value: leasePrincipal, shown: 28876 },
    // Amazon
    { what: 'Amazon NI 2012', value: AMZN.ni[0], shown: -39 },
    { what: 'Amazon NI 2014', value: AMZN.ni[2], shown: -241 },
    { what: 'Amazon FCF 2012', value: AMZN.cfo[0] - AMZN.capex[0], shown: AMZN.fcf[0] },
    { what: 'Amazon FCF 2013', value: AMZN.cfo[1] - AMZN.capex[1], shown: AMZN.fcf[1] },
    { what: 'Amazon FCF 2014', value: AMZN.cfo[2] - AMZN.capex[2], shown: 1949 },
    { what: 'Amazon CFO 2014', value: AMZN.cfo[2], shown: 6842 },
    { what: 'Amazon D&A 2014', value: AMZN.da[2], shown: 4746 },
    { what: 'Amazon AP 2014', value: AMZN.ap2014, shown: 16459 },
    { what: 'Amazon inventories 2014', value: AMZN.inv2014, shown: 8299 },
    { what: 'Amazon receivables 2014', value: AMZN.ar2014, shown: 5612 },
    { what: 'Amazon AP exceeds inv + AR', value: AMZN.ap2014 > AMZN.inv2014 + AMZN.ar2014 ? 1 : 0, shown: 1 },
    // Enron and Amazon additions
    { what: 'Amazon gap 2014', value: AMZN.cfo[2] - AMZN.ni[2], shown: 7083 },
    { what: 'Amazon SBC 2014', value: AMZN.sbc2014, shown: 1497 },
    { what: 'Amazon WC released 2014', value: AMZN.wc2014.reduce((a, b) => a + b, 0), shown: 974 },
    { what: 'Amazon operating WC 2014', value: AMZN.ar2014 + AMZN.inv2014 - AMZN.ap2014, shown: -2548 },
    { what: 'Amazon current assets 2014', value: AMZN.ca2014, shown: 31327 },
    { what: 'Amazon current liabilities 2014', value: AMZN.cl2014, shown: 28089 },
    { what: 'Amazon total WC positive', value: AMZN.ca2014 - AMZN.cl2014, shown: 3238 },
    { what: 'Enron consolidation 1997', value: ENRON.jedi[0] + ENRON.ljm[0], shown: 45 },
    { what: 'Enron consolidation 1998', value: ENRON.jedi[1] + ENRON.ljm[1], shown: 107 },
    { what: 'Enron consolidation 1999', value: ENRON.jedi[2] + ENRON.ljm[2], shown: 248 },
    { what: 'Enron consolidation 2000', value: ENRON.jedi[3] + ENRON.ljm[3], shown: 99 },
    { what: 'Enron restatement ties', value: ENRON.jedi.reduce((s, v, i) => s + v + ENRON.ljm[i] + ENRON.audit[i], 0), shown: 96 + 113 + 250 + 132 },
    { what: 'IFRS 18 CFO uplift', value: LEASE.paid2027, shown: 40000 },
    { what: 'No-benefit loss', value: -noCA.pretax, shown: 932 },
    { what: 'Tax benefit', value: -noCA.pretax * taxRate, shown: 233 },
    // Enron
    { what: 'Enron NI cut 1997', value: enronCut[0], shown: 96 },
    { what: 'Enron NI cut 1998', value: enronCut[1], shown: 113 },
    { what: 'Enron NI cut 1999', value: enronCut[2], shown: 250 },
    { what: 'Enron NI cut 2000', value: enronCut[3], shown: 132 },
    { what: 'Enron debt up 1997', value: ENRON.debtUp[0], shown: 711 },
    { what: 'Enron debt up 2000', value: ENRON.debtUp[3], shown: 628 },
    { what: 'Enron reported 2000', value: ENRON.reported[3], shown: 979 },
    { what: 'Enron restated 2000', value: ENRON.restated[3], shown: 847 },
    { what: 'Enron revenues 1999', value: ENRON.rev[0], shown: 40112 },
    { what: 'Enron revenues 2000', value: ENRON.rev[1], shown: 100789 },
    { what: 'Enron total assets 1999', value: ENRON.ta[0], shown: 33381 },
    { what: 'Enron total assets 2000', value: ENRON.ta[1], shown: 65503 },
    { what: 'Enron assets nearly doubled', value: ENRON.ta[1] / ENRON.ta[0], shown: 1.96 },
    { what: 'Enron debt 1999', value: ENRON.debt[0], shown: 8152 },
    { what: 'Enron debt 2000', value: ENRON.debt[1], shown: 10229 },
    // Rowan & Pike
    { what: 'RP revenue growth %', value: (RP.rev[1] - RP.rev[0]) / RP.rev[0] * 100, shown: 10.0 },
    { what: 'RP receivables growth %', value: (RP.ar[1] - RP.ar[0]) / RP.ar[0] * 100, shown: 55.8, tol: 0.05 },
    { what: 'RP DSO year 1', value: dso(RP.ar[0], RP.rev[0]), shown: 45.2, tol: 0.05 },
    { what: 'RP DSO year 2', value: dso(RP.ar[1], RP.rev[1]), shown: 64.0, tol: 0.05 },
    { what: 'RP CFO/NI year 1', value: RP.cfo[0] / RP.ni[0], shown: 1.16 },
    { what: 'RP CFO/NI year 2', value: RP.cfo[1] / RP.ni[1], shown: 0.29 },
    { what: 'RP underlying profit', value: RP.ni[1] - RP.gain - RP.capDev, shown: 180 },
    { what: 'RP reported profit rise %', value: (RP.ni[1] - RP.ni[0]) / RP.ni[0] * 100, shown: 35, tol: 0.5 },
    // CPI example
    { what: 'Revenue at 2.0% inflation', value: cpi2, shown: 30600 },
    { what: 'Revenue difference', value: contract - cpi2, shown: 240 },
    { what: 'After-tax difference', value: (contract - cpi2) * (1 - taxRate), shown: 180 },
    { what: 'Net income at 2.0%', value: P27.netIncome - (contract - cpi2) * (1 - taxRate), shown: 22251 },
    // mistakes
    { what: 'Undrawn credit', value: FACTS.lineOfCredit.limit - 24000, shown: 6000 },
    { what: 'Coastline note due 1 March 2028', value: 10000, shown: 10000 },
    { what: 'Cents of each dollar', value: Q27.cfoToNetIncome * 100, shown: 37, tol: 0.5 },
  ],
};
