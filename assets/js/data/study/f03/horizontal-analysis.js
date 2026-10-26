// horizontal-analysis.js — F03 · Horizontal analysis. Content only; exercises are in horizontal-analysis.ex.js.
// Lantern’s figures come from case.js (COMPARATIVE, PERIODS, FACTS) and F02’s case (the 2026 shop’s order values);
// checks recompute every printed number with core/ratios.js. Real figures (Starbucks FY2022–FY2024) are from its FY2024
// Form 10-K. Other businesses are fictional: Fernhill Books (simple example), Voltreach Storage (challenging example).
import { COMPARATIVE, PERIODS, FACTS as F } from './case.js?v=20';
import { FACTS as F26 } from '../f02/case.js?v=20';
import { DERIVED as B01 } from '../b01/case.js?v=20';
import * as R from '../../../core/ratios.js?v=20';

const P26 = PERIODS[2026], P27 = PERIODS[2027];
const IS = Object.fromEntries(COMPARATIVE.income.map(([n, a, b]) => [n, [a, b]]));
const BS = Object.fromEntries(COMPARATIVE.balance.map(([n, a, b]) => [n, [a, b]]));
const g = (pair) => R.growth(pair[1], pair[0]);                               // 0.25 = 25%
const ga = (pair) => R.growth(pair[1], pair[0], { annualised: true, prevMonths: 10 });
const usd = (v) => `${v < 0 ? '−' : ''}$${Math.abs(Math.round(v)).toLocaleString('en-US')}`;
const n0 = (v) => `${v < 0 ? '−' : ''}${Math.abs(Math.round(v)).toLocaleString('en-US')}`;
const cell = (v) => (v < 0 ? `(${Math.abs(Math.round(v)).toLocaleString('en-US')})` : Math.round(v).toLocaleString('en-US'));
const pc = (x, d = 1) => (x == null ? 'n/m' : `${x < 0 ? '−' : ''}${Math.abs(x * 100).toFixed(d)}%`);
const signed = (v) => `${v > 0 ? '+' : v < 0 ? '−' : ''}${Math.abs(Math.round(v)).toLocaleString('en-US')}`;

// ---------------------------------------------------------------- Lantern: headline changes
const rev = [P26.revenue, P27.revenue], oi = [P26.operatingIncome, P27.operatingIncome], ni = [P26.netIncome, P27.netIncome];
const cash = [P26.cash, P27.cash], ta = [P26.totalAssets, P27.totalAssets], eq = [P26.equity, P27.equity];
const cl = [P26.currentLiabilities, P27.currentLiabilities], tl = [P26.totalLiabilities, P27.totalLiabilities];
const rev26a = R.annualise(P26.revenue, 10), oi26a = R.annualise(P26.operatingIncome, 10), ni26a = R.annualise(P26.netIncome, 10);
const wages = IS['Wages Expense'], W = F.wages;
const law = IS['Catering Revenue'][1] - (F.catering.invoiced + F.catering.depositsEarned);       // 30,840: the law firm’s contract
const catOther = [IS['Catering Revenue'][0], IS['Catering Revenue'][1] - law];                     // catering other than the law firm
const train = IS['Training Revenue'], shop = IS['Online Sales Revenue'], cafe = IS['Café Sales Revenue'][1];
const rou = BS['Operating Lease Right-of-Use Assets'][1];
const taExRou = [ta[0], ta[1] - rou];
const anaTen = W.ana * 10 / 12;                                                                    // 40,000
const shopOrders = F26.shop.orderValueMarJun + F26.shop.orderValueJulDec;                        // B01’s estimate: orders × average order value
const shopQ4 = B01.revenue.slice(3).reduce((s, x) => s + x, 0);                                    // October–December order value (B01)
const shopQ4Share = shopQ4 / shopOrders;
const m2 = (v) => `$${v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// the comparative income statement: every line, with $ and % change
const isRows = COMPARATIVE.income.map(([n, a, b]) => {
  const label = n.replace(/ Expense$/, ' expense').replace(/ Revenue$/, ' revenue').replace('Cost of Goods Sold', 'Cost of goods sold').replace('Cost of Services', 'Cost of services')
    .replace('Sales Returns and Allowances', 'Sales returns and allowances').replace('Operating Lease Cost', 'Operating lease cost').replace('Card and Platform Fees', 'Card and platform fees');
  // contra lines (both years negative) are compared on their positive amounts: returns grew
  const chg = a === 0 ? null : a < 0 && b < 0 ? (Math.abs(b) - Math.abs(a)) / Math.abs(a) : (b - a) / Math.abs(a);
  return [label, cell(a), cell(b), cell(b - a), chg === null ? 'n/m' : pc(chg)];
});
// the comparative balance sheet, condensed
const b = (n) => BS[n];
const sumPair = (...ps) => [ps.reduce((s, p) => s + p[0], 0), ps.reduce((s, p) => s + p[1], 0)];
const bsLines = [
  ['Cash', b('Cash')],
  ['Accounts receivable, net', sumPair(b('Accounts Receivable'), b('Allowance for Doubtful Accounts'))],
  ['Contract asset', b('Contract Asset')],
  ['Inventory, supplies and prepaid insurance', sumPair(b('Inventory'), b('Supplies'), b('Prepaid Insurance'))],
  ['Total current assets', b('Total current assets')],
  ['Property and equipment, net', [P26.ppeNet, P27.ppeNet]],
  ['Operating lease right-of-use assets', b('Operating Lease Right-of-Use Assets')],
  ['Total assets', b('Total assets')],
  ['Accounts payable and accrued liabilities', sumPair(b('Accounts Payable'), b('Wages Payable'), b('Interest Payable'), b('Income Taxes Payable'))],
  ['Unearned revenue', b('Unearned Revenue')],
  ['Debt due within a year and line of credit', sumPair(b('Current Portion of Long-Term Debt'), b('Line of Credit'))],
  ['Operating lease liabilities, current', b('Current Portion of Operating Lease Liabilities')],
  ['Total current liabilities', b('Total current liabilities')],
  ['Long-term debt', sumPair(b('Notes Payable'), b('Instalment Note Payable'))],
  ['Operating lease liabilities, noncurrent', b('Operating Lease Liabilities')],
  ['Total liabilities', b('Total liabilities')],
  ['Total equity', b('Total equity')],
];
const bsRows = bsLines.map(([n, [a, c]]) => [n, cell(a), cell(c), cell(c - a), a === 0 ? 'n/m' : pc((c - a) / Math.abs(a))]);

// ---------------------------------------------------------------- Starbucks (FY2024 Form 10-K, $ millions)
const SB = { rev: [32250.3, 35975.6, 36176.2], oi: [4617.8, 5870.8, 5408.8], ni: [3281.6, 4124.5, 3760.9], stores: [38038, 40199], co: [19592, 21018] };
const idx = (arr) => arr.map((v) => v / arr[0] * 100);
const sbIdx = { rev: idx(SB.rev), oi: idx(SB.oi), ni: idx(SB.ni) };
const sbCagrRev = R.cagr(SB.rev[2], SB.rev[0], 2), sbCagrOi = R.cagr(SB.oi[2], SB.oi[0], 2);

// ---------------------------------------------------------------- Fernhill Books (fictional, simple example)
const FB = { rev: [820000, 902000], cogs: [492000, 550220], opex: [287000, 314880], other: [-2000, 1500] };
FB.gp = [FB.rev[0] - FB.cogs[0], FB.rev[1] - FB.cogs[1]];
FB.oi = [FB.gp[0] - FB.opex[0], FB.gp[1] - FB.opex[1]];

// ---------------------------------------------------------------- Voltreach Storage (fictional, challenging example)
const VS = { y25: 1150000, y26: 3060000, h2share: 0.6, y27: 3610000 };
VS.seasonal25 = VS.y25 / VS.h2share;

// ---------------------------------------------------------------- the applied bridge (operating income 2026 → 2027)
const cafeDirect = cafe - Math.round(cafe * F.cafes.cogsShare) - W.cafes - F.cafes.lease.monthlyEach * 2 * F.cafes.months - F.cafeCardFees
  - (F.cafes.fitOut.cost / F.cafes.fitOut.life / 12 * F.cafes.months) - (F.cafes.machines.cost / F.cafes.machines.life / 12 * F.cafes.months);
const rest = oi[1] - oi[0] + W.ana + F.research - cafeDirect;

export default {
  slug: 'horizontal-analysis',
  title: 'Horizontal analysis',
  blurb: 'Put two or more years of statements side by side, measure what changed in dollars, percentages, index numbers and compound growth rates, and decide which changes are real, which are produced by the calendar or by a new kind of business, and which matter.',
  status: 'reviewed',
  objectives: [
    'Identify the questions an owner, a lender and an investor bring to a set of statements, and the figures each looks at first.',
    'Calculate dollar and percentage changes, base-year index numbers and compound annual growth rates from comparative statements.',
    'Adjust a comparison for a part-year period by annualising flows, and explain when annualising misleads.',
    'Recognise changes in a business that break comparability (new activities, new costs, new accounting) and restate a comparison on a like-for-like basis.',
    'Assess which changes are material and write a short conclusion a lender or owner can act on.',
  ],
  prerequisites: [
    { lesson: 'f02/income-statement', why: 'You prepared Lantern’s multi-step income statement; this lesson compares two of them line by line.' },
    { lesson: 'f02/balance-sheet-and-equity', why: 'The classified balance sheet is the second statement you compare, and its totals are the bases you divide by.' },
    { lesson: 'f00/capital-and-liquidity', why: 'F00 introduced working capital and the current ratio; this course starts by watching them change.' },
    { text: 'Percentages and compound growth: (end ÷ start)^(1/years) − 1, from F04’s first lesson.' },
  ],
  case: 'lantern',

  concept: [
    { case: `Lantern’s accountant has closed the books for 2027, the year Ana Lim opened the Harbourside and Millbrook cafés. Net revenue rose from ${usd(rev[0])} to ${usd(rev[1])}, yet net income fell from ${usd(ni[0])} to ${usd(ni[1])} and cash from ${usd(cash[0])} to ${usd(cash[1])}. Ana wants to know whether the business is doing better or worse. Coastline Bank, which has lent Lantern money and given it a line of credit, wants to know whether it will be repaid. Both start in the same place: the two years side by side.` },
    { p: '<b>Financial statement analysis</b> turns the statements you learned to prepare in F02 into judgements: what changed and why, how healthy the business is, and what someone should do about it. The statements themselves don’t make those judgements. A net income of $22,431 means little until you know what it was last year, what it would have been without a one-off cost, and what similar businesses earn.' },
    { p: 'Different readers bring different questions. An <b>owner</b> asks whether the business is earning enough on the money invested, whether a new venture is paying its way and whether there is cash to pay a dividend or a salary. A <b>lender</b> asks whether interest and principal will be paid on time, from operating cash rather than from new borrowing, and what is left if things go wrong. An <b>investor</b> deciding whether to buy shares asks how fast profits are growing, how much risk comes with them and what price is fair. Suppliers, employees and tax authorities ask narrower versions of the same questions.' },
    { table: {
      caption: 'Who reads the statements, and what they look at first',
      head: ['Reader', 'Main question', 'Looks first at'],
      align: ['l', 'l', 'l'],
      rows: [
        ['Owner-manager (Ana)', 'Is the business earning enough, and is the new venture paying its way?', 'Revenue and profit by activity, margins, return on equity'],
        ['Lender (Coastline Bank)', 'Will interest and principal be paid on time?', 'Cash from operations, current assets against current liabilities, debt and interest cover'],
        ['Equity investor', 'How fast will profits grow, at what risk and at what price?', 'Growth rates, returns, cash generation, comparisons with peers'],
      ],
    } },
    { p: 'Analysts have three basic tools. <g>Horizontal analysis</g>, this lesson, compares the same line across periods. Vertical analysis, the next lesson, compares each line with a total in the same period. Ratio analysis, modules 2 to 4, relates lines from different parts of the statements (current assets to current liabilities, profit to assets). The three answer different questions and are always used together.' },
    { h: 'Comparative statements and the two measures of change' },
    { p: '<g>Comparative financial statements</g> show the current period and one or more earlier periods in adjacent columns, with the same lines in the same order. Public companies present them as a matter of course: Starbucks’ statement of earnings in its 2024 annual report shows fiscal 2024, 2023 and 2022 side by side. For each line you can then measure two things. The <b>dollar change</b> is the current amount minus the earlier one; it tells you the size of the change. The <b>percentage change</b> divides the dollar change by the earlier amount, the base; it tells you the speed of the change, and lets you compare lines of very different sizes.' },
    { p: `Lantern’s net revenue rose by ${usd(rev[1] - rev[0])}, or ${pc(g(rev))}: it nearly tripled. Its operating income fell by ${usd(oi[0] - oi[1])}, or ${pc(-g(oi))}. The first number says how much more business Lantern did; the second says that none of it reached profit. The table shows every line of the two income statements.` },
    { table: {
      caption: 'Lantern’s comparative income statement (fictional)',
      head: ['Line', '2026, ten months ($)', '2027 ($)', 'Change ($)', 'Change (%)'],
      align: ['l', 'r', 'r', 'r', 'r'],
      rows: isRows,
      note: 'Fictional figures from the case. 2026 runs from 1 March to 31 December (ten months); 2027 is a full year. Negative amounts in parentheses; the percentage change of sales returns is measured on their positive amounts (returns grew); n/m (not meaningful): the base is zero, so a percentage cannot be calculated.',
    } },
    { callout: 'key', title: 'Read the dollars and the percentages together', html: `A percentage on a small base can be huge and unimportant; a small percentage on a large base can matter a great deal. Insurance rose ${pc(g(IS['Insurance Expense']), 0)}, but only by ${usd(IS['Insurance Expense'][1] - IS['Insurance Expense'][0])}. Wages rose ${pc(g(wages))} and by ${usd(wages[1] - wages[0])}: that line needs explaining. A line that starts at zero, like café sales, has no percentage change at all.` },
  ],

  theory: [
    { h: 'Computing changes: the rules' },
    { p: 'The base is always the earlier period. When the base is negative (a loss, or a negative cash flow), the plain formula gives the wrong sign: a loss of $40,000 that becomes a profit of $10,000 has improved, but (10,000 − (−40,000)) ÷ (−40,000) is −125%. Some analysts divide by the absolute value of the base, which gives +125%; this course’s ratio engine does that. Many prefer to write n/m and describe the change in dollars, because a percentage change from a loss to a profit has no natural meaning. When the base is zero, as for Lantern’s contract asset or café sales, no percentage exists: say what the new item is and how large it is.' },
    { p: 'Ratios and margins change in <b>percentage points</b>, not percent. Lantern’s net margin (net income as a share of revenue, the subject of the next lesson) fell from 14.2% to 3.9%: a fall of 10.3 percentage points, which is a 72.6% fall in the margin itself. Write “points” when you subtract two percentages, and keep percent for the relative change.' },
    { h: 'Index numbers: following a line over several years' },
    { p: 'With three or more years, percentage changes from year to year become hard to read. A <g>trend percentage</g> (or base-year index) divides every year’s amount by the amount in a chosen base year and multiplies by 100, so the base year is 100 and every other year reads as a percentage of it. Lines that grow at different speeds then separate on one scale. Choose a base year that was ordinary: an index based on a year of unusually low profit makes every later year look strong.' },
    { p: 'Lantern has only two periods, so the illustration is a real company. Starbucks reported total net revenues of $32,250.3 million for fiscal 2022, $35,975.6 million for 2023 and $36,176.2 million for 2024, and operating income of $4,617.8 million, $5,870.8 million and $5,408.8 million.' },
    { table: {
      caption: 'Starbucks: trend percentages, fiscal 2022 = 100',
      head: ['Line', 'FY2022', 'FY2023', 'FY2024'],
      align: ['l', 'r', 'r', 'r'],
      rows: [
        ['Total net revenues', ...sbIdx.rev.map((v) => v.toFixed(1))],
        ['Operating income', ...sbIdx.oi.map((v) => v.toFixed(1))],
        ['Net earnings attributable to Starbucks', ...sbIdx.ni.map((v) => v.toFixed(1))],
      ],
      note: 'Computed from Starbucks Corporation’s Form 10-K for fiscal 2024, Consolidated Statements of Earnings (fiscal years of 52 or 53 weeks ending around 30 September).',
    } },
    { p: `The index shows what year-on-year changes hide. Revenue rose ${(sbIdx.rev[1] - 100).toFixed(1)}% in fiscal 2023 and then almost stopped (${pc(R.growth(SB.rev[2], SB.rev[1]))}). Operating income rose faster than revenue in 2023 and then fell back to ${sbIdx.oi[2].toFixed(1)}, so the 2023 margin gain was partly lost. Part of the 2023 peak is not operating performance: fiscal 2023’s operating income includes a $91.3 million gain on the sale of assets, which flatters that year’s index. Meanwhile the number of stores grew from ${SB.stores[0].toLocaleString('en-US')} to ${SB.stores[1].toLocaleString('en-US')} (${pc(R.growth(SB.stores[1], SB.stores[0]))}) during fiscal 2024. That count includes licensed stores, which bring Starbucks only licensed-store revenue, so it is not a like-for-like base for total revenue; still, revenue grew far more slowly than the store estate, which tells an analyst to look at sales per store before celebrating the new openings.` },
    { h: 'Growth rates and the compound annual growth rate' },
    { p: `Over several years, the single growth figure analysts quote is the <g>compound annual growth rate</g> (CAGR) you met in F04: the constant yearly rate that takes the first year’s amount to the last year’s. Starbucks’ revenue grew at a CAGR of ${pc(sbCagrRev)} from fiscal 2022 to fiscal 2024: (36,176.2 ÷ 32,250.3)^(1/2) − 1. The number of years is the number of gaps between the first and last year (two), not the number of years in the table (three).` },
    { p: `A CAGR describes only the two ends. Starbucks’ operating income has a CAGR of ${pc(sbCagrOi)} over the same two years, which sounds like steady growth, but it rose 27.1% and then fell 7.9%. Always look at the path as well; a simple average of the yearly growth rates is not the same thing either, and overstates the compound rate whenever growth varies.` },
    { h: 'Part-year periods: Lantern’s ten-month first year' },
    { p: `Lantern’s 2026 runs from 1 March to 31 December. Comparing ten months of revenue with twelve flatters 2027: part of the ${pc(g(rev))} growth is two extra months. The usual correction is to <g>annualise</g> the part-year flows, multiplying them by 12 ÷ 10. Annualised 2026 revenue is ${usd(rev26a)}, and growth on that base is ${pc(ga(rev))} instead of ${pc(g(rev))}. Only flows (revenue, expenses, cash flows) are annualised. Stocks (balance sheet amounts at a date) are never annualised: Lantern’s cash at 31 December 2026 is ${usd(cash[0])}, whatever the length of the year before it.` },
    { p: `Annualising assumes that the missing months are typical of the months you have. For Lantern they are not. The ten months of 2026 include the whole fourth-quarter gift season: about ${pc(shopQ4Share, 0)} of 2026’s shop order value came in October to December (B01’s monthly estimates, orders × average order value). The shop also relaunched on 1 July (B01): order value was ${m2(F26.shop.orderValueMarJun)} in March–June against an estimated ${m2(F26.shop.orderValueJulDec)} in July–December, so 2026’s ten months are anything but typical. The missing months, January and February, are quieter than an average month. Against the same months of 2027, unadjusted growth therefore overstates the change (two extra months) and annualised growth understates it (the 12 ÷ 10 scaling treats the gift peak as an ordinary month): the two figures bracket the truth rather than measure it.` },
    { callout: 'note', title: 'The better fix: same months', html: 'If monthly figures are available, compare March to December 2027 with March to December 2026. Like-for-like months remove both the length problem and the seasonal problem. Lantern’s managers can do this from their own records; an outside lender with only the annual statements cannot, and must annualise and say so.' },
    { h: 'When the business itself changed' },
    { p: `Horizontal analysis assumes the same business in both columns. Lantern’s 2027 breaks that assumption three ways. First, a new activity: the cafés produced ${usd(cafe)} of revenue that had no 2026 counterpart, with their own staff, lease costs and equipment. Second, new costs for the old business: Ana was paid only through dividends in 2026 and drew a salary of ${usd(W.ana)} in 2027, and Lantern spent ${usd(F.research)} on market research. Had Ana been paid at that rate for the ten months of 2026 (${usd(anaTen)}), 2026’s operating income of ${usd(oi[0])} would have been ${usd(oi[0] - anaTen)}: a loss, and its net income a loss of ${usd(-(P26.pretax - anaTen) * 0.75)} after a tax benefit at 25% (in practice, a loss to carry forward). The fall in operating income is partly a change in how the owner is paid, not in how the business performed.` },
    { p: `Third, new accounts and new accounting. The cafés’ leases put a ${usd(rou)} right-of-use asset and an equal lease liability on the balance sheet under ASC 842, so total assets grew ${pc(g(ta))}, but only ${pc(g(taExRou))} without the right-of-use asset. The law firm’s catering contract added a contract asset of ${usd(BS['Contract Asset'][1])} (revenue earned but not yet billable; a later lesson asks how far to trust it). A line of credit, an instalment note for the cold-brew brewer and operating lease cost appear for the first time. Other events that break comparability in larger companies include acquisitions and disposals, changes in accounting policy and new standards. A new standard may or may not be applied to the earlier years shown, depending on the transition method it allows, so read the note on accounting changes before comparing across the year of adoption.` },
    { p: 'The response is to separate the comparable from the new: compare the activities that existed in both years, show the new ones on their own, and adjust for one-off or reclassified costs where you can measure them. The applied worked example below does this for Lantern.' },
    { table: {
      caption: 'Lantern’s comparative balance sheet, condensed (fictional)',
      head: ['Line at 31 December', '2026 ($)', '2027 ($)', 'Change ($)', 'Change (%)'],
      align: ['l', 'r', 'r', 'r', 'r'],
      rows: bsRows,
      note: 'Fictional figures from the case. Balance sheet amounts are stocks at a date, so the ten-month 2026 needs no adjustment. n/m: the base is zero.',
    } },
    { h: 'Materiality: which changes deserve attention' },
    { p: `A full comparative statement has dozens of changes, and an analysis that comments on all of them hides the few that matter. <g>Materiality</g>, from F01, is the test: would the change influence the reader’s decision? Analysts often screen with two thresholds at once, a percentage and a dollar amount, and flag only lines that change by more than both. The thresholds are a working convention chosen for the business and the reader, not a rule. With 10% and $5,000, Lantern’s insurance (${pc(g(IS['Insurance Expense']), 0)}, ${usd(IS['Insurance Expense'][1] - IS['Insurance Expense'][0])}), interest (${pc(g(IS['Interest Expense']))}, ${usd(IS['Interest Expense'][1] - IS['Interest Expense'][0])}) and bad debts (${pc(g(IS['Bad Debt Expense']))}) drop out, as do rent, fuel, miscellaneous costs, sales returns and advertising (up exactly $5,000, not more). Wages, cost of goods sold, cost of services, utilities, depreciation, shipping, card fees, the new lease cost and research stay in, among others, as do cash, current liabilities and the lease balances.` },
    { p: `Size is not the only test. A small change can be material by its nature: interest more than doubled because Lantern began borrowing on a line of credit, which matters to Coastline far more than the ${usd(IS['Interest Expense'][1] - IS['Interest Expense'][0])} suggests. And a line that barely moved can matter because it should have moved: accounts payable rose ${pc(g(BS['Accounts Payable']))} while purchases grew with a business three times the size, a question for the efficiency lesson.` },
    { callout: 'warn', title: 'Growth is not health', html: `Revenue up ${pc(g(rev))}, cash down ${pc(-g(cash))}, current liabilities up ${pc(g(cl))}: horizontal analysis shows the direction of travel, but not whether Lantern can pay its bills. The liquidity, solvency and cash-flow lessons answer that; for now, note that the fastest-growing lines are on the wrong side for a lender.` },
  ],

  formulas: [
    { id: 'hor-dollar-change', name: 'Dollar change',
      tex: String.raw`\Delta X = X_{t} - X_{b}`,
      where: [
        [String.raw`X_{t}`, 'The line’s amount in the period analysed', '$'],
        [String.raw`X_{b}`, 'The same line in the base (earlier) period', '$'],
      ],
      note: `Lantern’s net revenue: <m>577{,}860 - 193{,}320 = 384{,}540</m>.` },
    { id: 'hor-pct-change', name: 'Percentage change',
      tex: String.raw`\%\Delta X = \dfrac{X_{t} - X_{b}}{\lvert X_{b} \rvert} \times 100`,
      where: [
        [String.raw`X_{t}`, 'The line’s amount in the period analysed', '$'],
        [String.raw`X_{b}`, 'The amount in the base period; the absolute value keeps the sign right when the base is negative', '$'],
      ],
      assumptions: 'The base is not zero. When it is, or when it is negative and the reader would be misled, report n/m and describe the change in dollars.',
      note: 'Lantern’s net revenue: <m>384{,}540 \\div 193{,}320 = 198.9\\%</m>.' },
    { id: 'hor-index', name: 'Trend percentage (base-year index)',
      tex: String.raw`\text{Index}_{t} = \dfrac{X_{t}}{X_{0}} \times 100`,
      where: [
        [String.raw`X_{t}`, 'The line’s amount in year t', '$'],
        [String.raw`X_{0}`, 'The amount in the base year, which reads as 100', '$'],
      ],
      note: 'Starbucks’ revenue, FY2024 on FY2022: <m>36{,}176.2 \\div 32{,}250.3 \\times 100 = 112.2</m>.' },
    { id: 'hor-cagr', name: 'Compound annual growth rate',
      tex: String.raw`\text{CAGR} = \left(\dfrac{X_{\text{end}}}{X_{\text{start}}}\right)^{1/n} - 1`,
      where: [
        [String.raw`X_{\text{start}},\ X_{\text{end}}`, 'The amounts in the first and last year', '$'],
        [String.raw`n`, 'The number of years between them (gaps, not columns)', 'years'],
      ],
      assumptions: 'Both amounts are positive and cover periods of the same length.',
      note: 'Starbucks’ revenue, FY2022 to FY2024: <m>(36{,}176.2 \\div 32{,}250.3)^{1/2} - 1 = 5.9\\%</m>.' },
    { id: 'hor-annualise', name: 'Annualising a part-year flow',
      tex: String.raw`X_{\text{annual}} = X_{m} \times \dfrac{12}{m}`,
      where: [
        [String.raw`X_{m}`, 'A flow (revenue, an expense, a cash flow) for a period of m months', '$'],
        [String.raw`m`, 'The number of months the period covers', 'months'],
      ],
      assumptions: 'The missing months are like the average of the months reported. Never annualise balance sheet amounts.',
      note: 'Lantern’s 2026 revenue: <m>193{,}320 \\times 12 \\div 10 = 231{,}984</m>.' },
  ],

  examples: [
    { level: 'simple', title: 'A bookshop’s two years', fictional: true,
      setup: 'Fernhill Books, a fictional independent bookshop, reports the figures in the table for two full years. Calculate the dollar and percentage change for each line, and say what the comparison shows.',
      table: {
        caption: 'Fernhill Books: income statement lines (fictional)',
        head: ['Line', '2026 ($)', '2027 ($)'],
        align: ['l', 'r', 'r'],
        rows: [
          ['Revenue', cell(FB.rev[0]), cell(FB.rev[1])],
          ['Cost of goods sold', cell(FB.cogs[0]), cell(FB.cogs[1])],
          ['Gross profit', cell(FB.gp[0]), cell(FB.gp[1])],
          ['Operating expenses', cell(FB.opex[0]), cell(FB.opex[1])],
          ['Operating income', cell(FB.oi[0]), cell(FB.oi[1])],
          ['Gain (loss) on investments', cell(FB.other[0]), cell(FB.other[1])],
        ],
      },
      steps: [
        `Revenue: <m>902{,}000 - 820{,}000 = 82{,}000</m>; <m>82{,}000 \\div 820{,}000 = 10.0\\%</m>. Cost of goods sold: <m>550{,}220 - 492{,}000 = 58{,}220</m>; <m>58{,}220 \\div 492{,}000 = 11.8\\%</m>.`,
        `Gross profit: <m>351{,}780 - 328{,}000 = 23{,}780</m>, or <m>7.3\\%</m>. Operating expenses: <m>314{,}880 - 287{,}000 = 27{,}880</m>, or <m>9.7\\%</m>.`,
        `Operating income: <m>36{,}900 - 41{,}000 = -4{,}100</m>; <m>-4{,}100 \\div 41{,}000 = -10.0\\%</m>.`,
        'Gain (loss) on investments: the change is <m>1{,}500 - (-2{,}000) = 3{,}500</m>. The base is negative, so report the change in dollars and write n/m for the percentage (dividing by the absolute base would give +175%, which says nothing useful).',
      ],
      answer: 'Revenue +$82,000 (+10.0%); cost of goods sold +$58,220 (+11.8%); gross profit +$23,780 (+7.3%); operating expenses +$27,880 (+9.7%); operating income −$4,100 (−10.0%); investments: from a $2,000 loss to a $1,500 gain, +$3,500 (n/m).',
      interpretation: 'Sales grew, but the cost of the books grew faster than the sales and operating expenses almost as fast, so operating income fell. The pattern points to lower prices or a costlier mix of books; the next lesson’s gross margin (40.0% to 39.0%) puts a number on it.' },
    { level: 'challenging', title: 'A seasonal first year and a growth rate', fictional: true,
      setup: `Voltreach Storage, a fictional installer of home batteries, started trading on 1 July 2025. Its revenue was $1,150,000 for the six months to 31 December 2025, $3,060,000 for 2026 and $3,610,000 for 2027. Installations are seasonal: in 2026 the second half of the year brought ${pc(VS.h2share, 0)} of revenue. Its lender asks for “growth in 2026” and the growth rate from 2025 to 2027. What figures should the analyst give?`,
      steps: [
        `Unadjusted, 2026 revenue is <m>3{,}060{,}000 \\div 1{,}150{,}000 - 1 = 166.1\\%</m> above 2025’s. That compares twelve months with six.`,
        `Annualised: <m>1{,}150{,}000 \\times 12 \\div 6 = 2{,}300{,}000</m>; growth <m>3{,}060{,}000 \\div 2{,}300{,}000 - 1 = 33.0\\%</m>. But the six months Voltreach traded were its busy half, so doubling them overstates a full year.`,
        `Seasonally adjusted: if the second half is 60% of a year, a full 2025 would have been about <m>1{,}150{,}000 \\div 0.6 = 1{,}916{,}667</m>. Growth in 2026 on that base: <m>3{,}060{,}000 \\div 1{,}916{,}667 - 1 = 59.7\\%</m>.`,
        `From 2026 to 2027: <m>3{,}610{,}000 \\div 3{,}060{,}000 - 1 = 18.0\\%</m>. A CAGR from 2025 to 2027 needs a full-year 2025: on the seasonal estimate, <m>(3{,}610{,}000 \\div 1{,}916{,}667)^{1/2} - 1 = 37.2\\%</m> a year.`,
        'A CAGR computed from the six-month figure, <m>(3{,}610{,}000 \\div 1{,}150{,}000)^{1/2} - 1</m>, would be 77.2% a year: a calendar effect, not growth.',
      ],
      answer: 'Report 2026 growth as about 59.7% on a seasonally adjusted base (between the annualised 33.0% and the unadjusted 166.1%, and say how it was estimated), 2027 growth as 18.0%, and a 2025–2027 CAGR of about 37.2% on the estimated full-year 2025.',
      interpretation: 'Every figure depends on how the part-year is treated, so the analyst states the method beside the number. The slowdown from about 60% to 18% is the real news: the first year’s growth came partly from simply having opened.' },
    { level: 'applied', title: 'What explains Lantern’s lower operating income?', fictional: true,
      setup: `Ana asks whether the business she ran in 2026 grew in 2027, and why operating income fell from ${usd(oi[0])} to ${usd(oi[1])} when revenue nearly tripled. Use the comparative income statement and these facts from Lantern’s records: the cafés’ cost of goods sold is 31% of their sales; café staff were paid ${usd(W.cafes)}; the leases cost $4,000 a month for ten months; café card fees were ${usd(F.cafeCardFees)}; the cafés’ fit-out and machines were depreciated by $9,000 in 2027. Utilities, advertising and insurance are not split between the cafés and the rest.`,
      steps: [
        `The 2026 activities, unadjusted and annualised: catering other than the law firm’s new contract <m>87{,}520 \\div 62{,}320 - 1 = 40.4\\%</m> (annualised base <m>74{,}784</m>: <m>17.0\\%</m>); workshops <m>71.4\\%</m> (annualised <m>42.9\\%</m>); online shop <m>70.6\\%</m> (annualised <m>42.2\\%</m>). Because the 2026 gift peak sits inside the ten months, the true like-for-like growth lies between each pair.`,
        `The cafés on their own, before the shared costs: <m>236{,}000 - 73{,}160 - 92{,}000 - 40{,}000 - 4{,}720 - 9{,}000 = 17{,}120</m>.`,
        `Bridge from 2026 to 2027 operating income: Ana’s salary <m>-48{,}000</m>, market research <m>-21{,}000</m>, the cafés <m>+17{,}120</m>; everything else, by difference, <m>32{,}787 - 37{,}716 + 48{,}000 + 21{,}000 - 17{,}120 = +46{,}951</m>.`,
        'Check: <m>37{,}716 - 48{,}000 - 21{,}000 + 17{,}120 + 46{,}951 = 32{,}787</m>.',
      ],
      table: {
        caption: 'Operating income, 2026 to 2027 (fictional)',
        head: ['Step', 'Amount ($)'],
        align: ['l', 'r'],
        rows: [
          ['Operating income, 2026 (ten months)', cell(oi[0])],
          ['Ana’s salary (new in 2027)', cell(-W.ana)],
          ['Market research', cell(-F.research)],
          ['Cafés, before shared costs', cell(cafeDirect)],
          ['Everything else (by difference)', cell(rest)],
        ],
        foot: [['Operating income, 2027', cell(oi[1])]],
      },
      answer: `The 2026 businesses grew by roughly 17% to 71% depending on the line and the treatment of the part-year. Operating income fell by ${usd(oi[0] - oi[1])} because two decisions added ${usd(W.ana + F.research)} of costs (Ana’s salary and research) and the new cafés contributed only ${usd(cafeDirect)} before shared costs in their first ten months; the rest of the business, including two extra months and the law firm’s contract, added ${usd(rest)}.`,
      interpretation: 'The fall in profit is mostly the result of choices, not a decline in the old business. That is good news for Ana, with two cautions: “everything else” includes the law firm’s revenue, which has not yet been billed, and none of this says whether the cash is there, which is Coastline’s question.' },
  ],

  demo: [
    { widget: 'hor-growth', intro: 'Start with Lantern’s revenue: ten months against twelve. Switch the months to 12 and 12 and watch the annualised and unadjusted growth meet; then set the years apart to 2 or more and see how the compound rate differs from the total growth.' },
    { widget: 'hor-sheet', intro: 'Lantern’s condensed income statement. Columns D and E are yours: type a dollar-change formula in D2 and a percentage-change formula in E2, fill them down, and compare your results with the table above. Then change the 2026 figures to annualised ones (multiply by 1.2) and see which lines still grow.' },
    { widget: 'hor-index', intro: 'Starbucks’ trend percentages with fiscal 2022 as the base. Read which line grew fastest over the two years, and which one turned down.' },
  ],

  mistakes: [
    { title: '“Revenue tripled, so the business is three times as good.”', html: 'Growth in revenue says nothing about profit, cash or risk. Lantern’s revenue grew 198.9% while operating income fell 13.1% and cash fell 84.8%. Read every important line, and read the cash and the liabilities as well as the income statement.' },
    { title: '“Ten months against twelve is close enough.”', html: 'Two extra months are 20% more time. Annualise the part-year flows (× 12 ÷ 10), or better compare the same months, and say which you did. Never annualise balance sheet amounts: they are stocks at a date.' },
    { title: '“A percentage change can always be calculated.”', html: 'From a base of zero (a new line such as Lantern’s café sales) there is no percentage change, and from a negative base the plain formula gives the wrong sign. Write n/m and describe the change in dollars.' },
    { title: '“The margin rose from 5% to 7%, so it rose 2%.”', html: 'Subtracting two percentages gives percentage points: the margin rose 2 points, which is a 40% increase in the margin. Use points for differences between percentages and percent for relative changes.' },
    { title: '“The CAGR shows how the business grew each year.”', html: 'A CAGR uses only the first and last amounts. Starbucks’ operating income had a two-year CAGR of 8.2% while it rose 27.1% and then fell 7.9%. Show the path (an index or the yearly changes) beside the CAGR, and count the years as gaps, not columns.' },
  ],

  application: [
    { p: `<b>The lender’s first page.</b> Coastline Bank’s credit analyst opens Lantern’s file with a one-page comparative summary: the income statement and the condensed balance sheet with dollar and percentage changes, a column of 2026 flows annualised and a line explaining that 2026 ran for ten months. She marks every line that passes the bank’s screening thresholds, then writes one sentence for each: what changed, why, and whether it helps or hurts repayment. Revenue growth helps; the fall in cash to ${usd(cash[1])}, the new ${usd(BS['Line of Credit'][1])} line of credit and the ${pc(g(cl))} rise in current liabilities hurt. The cafés and the leases explain most of the balance sheet’s growth, so she asks Lantern for the cafés’ results by month, the only way to see whether their sales are still rising.` },
    { p: '<b>The owner’s questions.</b> Ana reads the same statements with different eyes. The bridge in the applied example tells her that her salary and the research programme, not a failing business, account for the lower profit. Her next questions come from the same table: are the cafés covering their share of the shared costs yet, and will 2028’s results, the first full year of cafés with no research programme, show the operating income she expected? She asks her accountant to keep monthly figures by activity from now on, so next year’s comparison can be like for like.' },
    { p: '<b>Reading a public company.</b> An equity analyst reading Starbucks’ 10-K starts the same way, with the three years of the statement of earnings side by side and the store counts in Item 1. The index numbers show revenue almost flat in fiscal 2024 while stores grew 5.7%, so the analyst reads management’s discussion of comparable store sales for the explanation before forming a view. Horizontal analysis rarely answers the question; it tells the analyst which question to ask next.' },
  ],

  summary: [
    'Owners ask whether the business earns enough, lenders whether they will be repaid, and investors how fast profits will grow at what risk; each starts from the comparative statements.',
    'Horizontal analysis measures each line’s dollar change (size) and percentage change on the earlier base (speed); read them together, and write n/m when the base is zero or negative.',
    'Trend percentages put several years on one scale (base year = 100); the CAGR, (end ÷ start)^(1/years) − 1, summarises growth between two ends but hides the path.',
    'Part-year flows are annualised (× 12 ÷ months) or, better, compared month for month; stocks are never annualised. Seasonal businesses make annualised figures misleading: Lantern’s 2026 includes the whole gift season.',
    'New activities, new costs and new accounting break comparability: separate the comparable from the new, as Lantern’s cafés, Ana’s salary and the leases require.',
    'Materiality decides which changes to discuss: a change can matter by its size in dollars and percent together, or by its nature.',
  ],

  glossary: [
    { term: 'Horizontal analysis', def: 'Comparing the same line of the financial statements across two or more periods, as a dollar change and a percentage change on the earlier period. Also called trend analysis.' },
    { term: 'Comparative financial statements', def: 'Financial statements that show the current period and one or more earlier periods in adjacent columns, with the same lines in the same order.' },
    { term: 'Trend percentage', def: 'A line’s amount in a year divided by its amount in a chosen base year, times 100, so the base year reads 100. Also called a base-year index.' },
    { term: 'Annualise', def: 'To scale a flow for a part-year period to a full year, by multiplying it by 12 and dividing by the number of months it covers. Balance sheet amounts are never annualised.' },
    { term: 'Comparability', def: 'The quality of financial information that lets users identify similarities and differences between periods or between businesses; it is lost when the business, its accounting policies or the length of the period change.' },
  ],

  references: [
    { text: 'Franklin, M., Graybeal, P. &amp; Cooper, D. (2019). <i>Principles of Accounting, Volume 1: Financial Accounting</i>, Appendix A, “Financial Statement Analysis” (horizontal analysis, base year, dollar and percentage change). OpenStax.', url: 'https://openstax.org/books/principles-financial-accounting/pages/a-financial-statement-analysis', checked: '2026-10-26' },
    { text: 'U.S. Securities and Exchange Commission. <i>Beginners’ Guide to Financial Statements</i> (Office of Investor Education and Advocacy; MD&amp;A, the notes and basic ratios).', url: 'https://www.sec.gov/about/reports-publications/beginners-guide-financial-statements', checked: '2026-10-26' },
    { text: 'Starbucks Corporation (2024). Form 10-K for the fiscal year ended 29 September 2024: Consolidated Statements of Earnings, fiscal 2024, 2023 and 2022 (SEC EDGAR, XBRL rendering).', url: 'https://www.sec.gov/Archives/edgar/data/829224/000082922424000057/R3.htm', checked: '2026-10-26' },
    { text: 'Starbucks Corporation (2024). Form 10-K for the fiscal year ended 29 September 2024, Item 1, Business (store counts, “Company-operated and Licensed Store Summary as of September 29, 2024”).', url: 'https://www.sec.gov/Archives/edgar/data/829224/000082922424000057/sbux-20240929.htm', checked: '2026-10-26' },
  ],

  checks: [
    // headline figures
    { what: 'Revenue 2026', value: rev[0], shown: 193320 },
    { what: 'Revenue 2027', value: rev[1], shown: 577860 },
    { what: 'Net income 2026', value: ni[0], shown: 27387 },
    { what: 'Net income 2027', value: ni[1], shown: 22431 },
    { what: 'Cash 2026', value: cash[0], shown: 42940 },
    { what: 'Cash 2027', value: cash[1], shown: 6531 },
    { what: 'Revenue change $', value: rev[1] - rev[0], shown: 384540 },
    { what: 'Revenue change %', value: g(rev) * 100, shown: 198.9, tol: 0.05 },
    { what: 'Operating income 2026', value: oi[0], shown: 37716 },
    { what: 'Operating income 2027', value: oi[1], shown: 32787 },
    { what: 'Operating income fall $', value: oi[0] - oi[1], shown: 4929 },
    { what: 'Operating income fall %', value: -g(oi) * 100, shown: 13.1, tol: 0.05 },
    { what: 'Insurance % change', value: g(IS['Insurance Expense']) * 100, shown: 120, tol: 0.5 },
    { what: 'Insurance $ change', value: IS['Insurance Expense'][1] - IS['Insurance Expense'][0], shown: 1800 },
    { what: 'Wages % change', value: g(wages) * 100, shown: 777.2, tol: 0.05 },
    { what: 'Wages $ change', value: wages[1] - wages[0], shown: 143000 },
    // negative base
    { what: 'Plain formula from a loss', value: (10000 - (-40000)) / -40000 * 100, shown: -125 },
    { what: 'Absolute base from a loss', value: R.growth(10000, -40000) * 100, shown: 125 },
    // margins in points
    { what: 'Net margin 2026', value: R.profitability(P26).netMargin * 100, shown: 14.2, tol: 0.05 },
    { what: 'Net margin 2027', value: R.profitability(P27, P26).netMargin * 100, shown: 3.9, tol: 0.05 },
    { what: 'Net margin fall in points (rounded margins)', value: 14.2 - 3.9, shown: 10.3 },
    { what: 'Net margin relative fall', value: -R.growth(R.profitability(P27).netMargin, R.profitability(P26).netMargin) * 100, shown: 72.6, tol: 0.05 },
    // Starbucks
    { what: 'Starbucks revenue index FY2023', value: sbIdx.rev[1], shown: 111.6, tol: 0.05 },
    { what: 'Starbucks revenue index FY2024', value: sbIdx.rev[2], shown: 112.2, tol: 0.05 },
    { what: 'Starbucks OI index FY2023', value: sbIdx.oi[1], shown: 127.1, tol: 0.05 },
    { what: 'Starbucks OI index FY2024', value: sbIdx.oi[2], shown: 117.1, tol: 0.05 },
    { what: 'Starbucks NI index FY2023', value: sbIdx.ni[1], shown: 125.7, tol: 0.05 },
    { what: 'Starbucks NI index FY2024', value: sbIdx.ni[2], shown: 114.6, tol: 0.05 },
    { what: 'Starbucks revenue growth FY2023', value: R.growth(SB.rev[1], SB.rev[0]) * 100, shown: 11.6, tol: 0.05 },
    { what: 'Starbucks revenue growth FY2024', value: R.growth(SB.rev[2], SB.rev[1]) * 100, shown: 0.6, tol: 0.05 },
    { what: 'Starbucks stores growth FY2024', value: R.growth(SB.stores[1], SB.stores[0]) * 100, shown: 5.7, tol: 0.05 },
    { what: 'Starbucks stores 2023 = company-operated + licensed', value: 19592 + 18446, shown: 38038 },
    { what: 'Starbucks stores 2024 = company-operated + licensed', value: 21018 + 19181, shown: 40199 },
    { what: 'Starbucks revenue CAGR', value: sbCagrRev * 100, shown: 5.9, tol: 0.05 },
    { what: 'Starbucks OI CAGR', value: sbCagrOi * 100, shown: 8.2, tol: 0.05 },
    { what: 'Starbucks OI growth FY2023', value: R.growth(SB.oi[1], SB.oi[0]) * 100, shown: 27.1, tol: 0.05 },
    { what: 'Starbucks OI growth FY2024', value: R.growth(SB.oi[2], SB.oi[1]) * 100, shown: -7.9, tol: 0.05 },
    // part-year
    { what: 'Annualised 2026 revenue', value: rev26a, shown: 231984 },
    { what: 'Annualised revenue growth', value: ga(rev) * 100, shown: 149.1, tol: 0.05 },
    { what: 'Shop orders Mar–Jun', value: F26.shop.orderValueMarJun, shown: 9096.15 },
    { what: 'Shop orders Jul–Dec', value: F26.shop.orderValueJulDec, shown: 101928.4 },
    { what: 'Q4 share of 2026 shop order value (B01)', value: shopQ4Share * 100, shown: 60, tol: 0.5 },
    { what: 'Sales returns % change on positive amounts', value: (1900 - 1025) / 1025 * 100, shown: 85.4, tol: 0.05 },
    { what: 'Starbucks FY2023 gain on sale of assets', value: 5870.8 - (35975.6 - 30494.5 + 298.4), shown: 91.3, tol: 0.05 },
    { what: 'Advertising change', value: IS['Advertising Expense'][1] - IS['Advertising Expense'][0], shown: 5000 },
    // comparability
    { what: 'Café sales', value: cafe, shown: 236000 },
    { what: 'Ana’s salary', value: W.ana, shown: 48000 },
    { what: 'Market research', value: F.research, shown: 21000 },
    { what: 'Ana’s salary for ten months', value: anaTen, shown: 40000 },
    { what: '2026 operating income with a salary', value: oi[0] - anaTen, shown: -2284 },
    { what: '2026 net loss with a salary (after 25% tax)', value: -(P26.pretax - anaTen) * (1 - 0.25), shown: 2613 },
    { what: 'Right-of-use asset', value: rou, shown: 173379 },
    { what: 'Total assets growth', value: g(ta) * 100, shown: 250, tol: 0.05 },
    { what: 'Total assets growth without the right-of-use asset', value: g(taExRou) * 100, shown: 64.9, tol: 0.05 },
    { what: 'Contract asset', value: BS['Contract Asset'][1], shown: 30840 },
    // materiality
    { what: 'Interest % change', value: g(IS['Interest Expense']) * 100, shown: 139.9, tol: 0.05 },
    { what: 'Interest $ change', value: IS['Interest Expense'][1] - IS['Interest Expense'][0], shown: 1679 },
    { what: 'Bad debts % change', value: g(IS['Bad Debt Expense']) * 100, shown: -5.4, tol: 0.05 },
    { what: 'Accounts payable % change', value: g(BS['Accounts Payable']) * 100, shown: 0.8, tol: 0.05 },
    { what: 'Cash % fall', value: -g(cash) * 100, shown: 84.8, tol: 0.05 },
    { what: 'Current liabilities % rise', value: g(cl) * 100, shown: 335.7, tol: 0.05 },
    { what: 'Line of credit drawn', value: BS['Line of Credit'][1], shown: 24000 },
    // formula notes
    { what: 'Formula note: revenue index FY2024', value: 36176.2 / 32250.3 * 100, shown: 112.2, tol: 0.05 },
    // Fernhill Books
    { what: 'Fernhill revenue change', value: FB.rev[1] - FB.rev[0], shown: 82000 },
    { what: 'Fernhill revenue %', value: R.growth(FB.rev[1], FB.rev[0]) * 100, shown: 10, tol: 0.05 },
    { what: 'Fernhill COGS change', value: FB.cogs[1] - FB.cogs[0], shown: 58220 },
    { what: 'Fernhill COGS %', value: R.growth(FB.cogs[1], FB.cogs[0]) * 100, shown: 11.8, tol: 0.05 },
    { what: 'Fernhill gross profit 2026', value: FB.gp[0], shown: 328000 },
    { what: 'Fernhill gross profit 2027', value: FB.gp[1], shown: 351780 },
    { what: 'Fernhill GP change', value: FB.gp[1] - FB.gp[0], shown: 23780 },
    { what: 'Fernhill GP %', value: R.growth(FB.gp[1], FB.gp[0]) * 100, shown: 7.3, tol: 0.05 },
    { what: 'Fernhill opex change', value: FB.opex[1] - FB.opex[0], shown: 27880 },
    { what: 'Fernhill opex %', value: R.growth(FB.opex[1], FB.opex[0]) * 100, shown: 9.7, tol: 0.05 },
    { what: 'Fernhill operating income 2026', value: FB.oi[0], shown: 41000 },
    { what: 'Fernhill operating income 2027', value: FB.oi[1], shown: 36900 },
    { what: 'Fernhill OI change', value: FB.oi[1] - FB.oi[0], shown: -4100 },
    { what: 'Fernhill OI %', value: R.growth(FB.oi[1], FB.oi[0]) * 100, shown: -10, tol: 0.05 },
    { what: 'Fernhill investments change', value: FB.other[1] - FB.other[0], shown: 3500 },
    { what: 'Fernhill investments with |base|', value: R.growth(FB.other[1], FB.other[0]) * 100, shown: 175 },
    { what: 'Fernhill gross margin 2026', value: FB.gp[0] / FB.rev[0] * 100, shown: 40 },
    { what: 'Fernhill gross margin 2027', value: FB.gp[1] / FB.rev[1] * 100, shown: 39 },
    // Voltreach
    { what: 'Voltreach unadjusted growth', value: R.growth(VS.y26, VS.y25) * 100, shown: 166.1, tol: 0.05 },
    { what: 'Voltreach annualised 2025', value: R.annualise(VS.y25, 6), shown: 2300000 },
    { what: 'Voltreach annualised growth', value: R.growth(VS.y26, VS.y25, { annualised: true, prevMonths: 6 }) * 100, shown: 33, tol: 0.05 },
    { what: 'Voltreach seasonal full-year 2025', value: VS.seasonal25, shown: 1916667, tol: 0.5 },
    { what: 'Voltreach seasonal growth', value: R.growth(VS.y26, VS.seasonal25) * 100, shown: 59.7, tol: 0.05 },
    { what: 'Voltreach 2027 growth', value: R.growth(VS.y27, VS.y26) * 100, shown: 18, tol: 0.05 },
    { what: 'Voltreach CAGR on the seasonal base', value: R.cagr(VS.y27, VS.seasonal25, 2) * 100, shown: 37.2, tol: 0.05 },
    { what: 'Voltreach CAGR from the six months', value: R.cagr(VS.y27, VS.y25, 2) * 100, shown: 77.2, tol: 0.05 },
    { what: 'Voltreach second-half share', value: VS.h2share * 100, shown: 60 },
    // applied
    { what: 'Catering other than the law firm, 2027', value: catOther[1], shown: 87520 },
    { what: 'Catering 2026', value: catOther[0], shown: 62320 },
    { what: 'Law firm revenue', value: law, shown: 30840 },
    { what: 'Catering (other) growth', value: g(catOther) * 100, shown: 40.4, tol: 0.05 },
    { what: 'Catering annualised base', value: R.annualise(catOther[0], 10), shown: 74784 },
    { what: 'Catering annualised growth', value: ga(catOther) * 100, shown: 17, tol: 0.05 },
    { what: 'Workshops growth', value: g(train) * 100, shown: 71.4, tol: 0.05 },
    { what: 'Workshops annualised growth', value: ga(train) * 100, shown: 42.9, tol: 0.05 },
    { what: 'Online growth', value: g(shop) * 100, shown: 70.6, tol: 0.05 },
    { what: 'Online annualised growth', value: ga(shop) * 100, shown: 42.2, tol: 0.05 },
    { what: 'Café staff', value: W.cafes, shown: 92000 },
    { what: 'Café cost of goods sold (31%)', value: Math.round(cafe * F.cafes.cogsShare), shown: 73160 },
    { what: 'Lease cost for ten months', value: F.cafes.lease.monthlyEach * 2 * F.cafes.months, shown: 40000 },
    { what: 'Café card fees', value: F.cafeCardFees, shown: 4720 },
    { what: 'Café depreciation', value: F.cafes.fitOut.cost / F.cafes.fitOut.life / 12 * F.cafes.months + F.cafes.machines.cost / F.cafes.machines.life / 12 * F.cafes.months, shown: 9000 },
    { what: 'Café contribution before shared costs', value: cafeDirect, shown: 17120 },
    { what: 'Everything else', value: rest, shown: 46951 },
    { what: 'Bridge adds up', value: oi[0] - W.ana - F.research + cafeDirect + rest, shown: 32787 },
    { what: 'New costs: salary + research', value: W.ana + F.research, shown: 69000 },
    { what: 'Annualised 2026 operating income (widget default)', value: oi26a, shown: 45259.2 },
    { what: 'Annualised 2026 net income', value: ni26a, shown: 32864.4 },
    { what: 'Equity growth', value: g(eq) * 100, shown: 48.2, tol: 0.05 },
    { what: 'Total liabilities growth', value: g(tl) * 100, shown: 416.8, tol: 0.05 },
    { what: 'Margin rises from 5% to 7% relatively', value: (7 - 5) / 5 * 100, shown: 40 },
  ],
};
