// project.js — F03 applied project: a credit review of Brightwater Bike Repair (F01's and F02's project business)
// for Harbour Credit Union, December 2027. The data are in brightwater.js (2027 from F02's project; July–December
// 2026 new here, consistent with F01 and F02). Each `check` recomputes its answer by hand from the statements' raw
// figures; `verify` compares the ratio engine's results with the figures shown.
import { PERIODS, LINES, BENCHMARK as BM, LOAN_REQUEST as LR, PRO_FORMA as PF, RATIOS, INCOME_2026 } from './brightwater.js?v=20';
import { RESULTS as B27, AGING } from '../f02/brightwater.js?v=20';

const money = (x) => `${x < 0 ? '−' : ''}$${Math.round(Math.abs(x)).toLocaleString('en-US')}`;
const c0 = (x) => Math.round(x).toLocaleString('en-US');
const num = (id, prompt, answer, check, solution, wrong, { unit = '$', places = 0, tol = 0.5, kind = 'numerical' } = {}) =>
  ({ id, type: 'num', kind, unit, places, prompt, answer, check, tol, solution, ...(wrong ? { wrong } : {}) });
const r1 = (x) => Math.round(x * 10) / 10;
const r2 = (x) => Math.round(x * 100) / 100;
const p26 = PERIODS[2026], p27 = PERIODS[2027];
const S = B27.statements;

// ---------------------------------------------------------------- the brief's tables
const income = {
  caption: 'Brightwater Bike Repair: income statements ($)',
  head: ['', 'July–December 2026 (6 months)', '2027'], align: ['l', 'r', 'r'],
  rows: [
    ['Repair revenue', c0(LINES[2026].repair), c0(LINES[2027].repair)],
    ['Retail sales revenue', '—', c0(LINES[2027].retail)],
    ['Sales returns and allowances', '—', `(${c0(LINES[2027].returns)})`],
    ['Net revenue', c0(p26.revenue), c0(p27.revenue)],
    ['Cost of sales: mechanics’ wages', c0(INCOME_2026.costOfSales.wages), c0(S.income.lists.cost.find((r) => r[0] === 'Wages Expense')[1])],
    ['Cost of sales: parts and supplies used', c0(INCOME_2026.costOfSales.supplies), c0(S.income.lists.cost.find((r) => r[0] === 'Supplies Expense')[1])],
    ['Cost of sales: cost of goods sold', '—', c0(p27.cogs)],
    ['Gross profit', c0(p26.grossProfit), c0(p27.grossProfit)],
    ['Operating expenses (rent, utilities, advertising, insurance, depreciation, card fees, bad debts, loss on equipment)', c0(p26.grossProfit - p26.operatingIncome), c0(p27.grossProfit - p27.operatingIncome)],
    ['Operating income (EBIT)', c0(p26.ebit), c0(p27.ebit)],
    ['Interest expense', c0(p26.interestExpense), c0(p27.interestExpense)],
    ['Income tax expense (25%)', c0(p26.tax), c0(p27.tax)],
    ['Net income', c0(p26.netIncome), c0(p27.netIncome)],
    ['Depreciation (included above)', c0(p26.da), c0(p27.da)],
    ['Dividends paid to Mateo', c0(p26.dividends), c0(p27.dividends)],
  ],
};
const balance = {
  caption: 'Brightwater Bike Repair: balance sheets at 31 December ($)',
  head: ['', '2026', '2027'], align: ['l', 'r', 'r'],
  rows: [
    ['Cash', c0(p26.cash), c0(p27.cash)],
    ['Accounts receivable, net', c0(p26.receivables), c0(p27.receivables)],
    ['Inventory', '—', c0(p27.inventory)],
    ['Supplies and prepaid insurance', c0(p26.currentAssets - p26.cash - p26.receivables), c0(p27.currentAssets - p27.cash - p27.receivables - p27.inventory)],
    ['Total current assets', c0(p26.currentAssets), c0(p27.currentAssets)],
    ['Equipment, net', c0(p26.ppeNet), c0(p27.ppeNet)],
    ['Total assets', c0(p26.totalAssets), c0(p27.totalAssets)],
    ['Accounts payable', c0(p26.payables), c0(p27.payables)],
    ['Other current liabilities (wages, interest, unearned revenue, income tax)', c0(p26.currentLiabilities - p26.payables - p26.debt), c0(p27.currentLiabilities - p27.payables - 3_000)],
    ['Notes payable due within a year', c0(p26.debt), c0(3_000)],
    ['Total current liabilities', c0(p26.currentLiabilities), c0(p27.currentLiabilities)],
    ['Notes payable (noncurrent)', '—', c0(p27.debt - 3_000)],
    ['Total liabilities', c0(p26.totalLiabilities), c0(p27.totalLiabilities)],
    ['Common stock', c0(12_000), c0(12_000)],
    ['Retained earnings', c0(p26.retainedEarnings), c0(p27.retainedEarnings)],
    ['Total equity', c0(p26.equity), c0(p27.equity)],
  ],
};
const cash = {
  caption: 'Brightwater Bike Repair: cash flows ($)',
  head: ['', 'July–December 2026', '2027'], align: ['l', 'r', 'r'],
  rows: [
    ['Net cash from operating activities', c0(p26.cfo), c0(p27.cfo)],
    ['Equipment bought', `(${c0(p26.capex)})`, `(${c0(p27.capex)})`],
    ['Equipment sold', '—', c0(700)],
    ['Stock issued, borrowing and repayments', c0(12_000 + 5_000), c0(12_000 - 5_000)],
    ['Dividends paid', `(${c0(p26.dividends)})`, `(${c0(p27.dividends)})`],
    ['Cash at the end', c0(p26.cash), c0(p27.cash)],
  ],
  note: 'Credit sales (repairs invoiced to the courier company, the rental fleet and regulars, the only sales on credit, due in 30 days): $9,900 in July–December 2026 and $26,800 in 2027. Of the $6,500 of receivables at 31 December 2027, $2,300 is overdue.',
};
const bench = {
  caption: BM.label,
  head: ['Measure', 'Median'], align: ['l', 'r'],
  rows: [
    ['Current ratio', BM.current.toFixed(1)], ['Quick ratio', BM.quick.toFixed(1)], ['Liabilities to equity', BM.liabilitiesToEquity.toFixed(1)],
    ['Interest coverage (EBIT ÷ interest)', BM.interestCoverage.toFixed(1)], ['Days sales outstanding, on credit sales', `${BM.dsoCredit} days`],
    ['Days inventory outstanding', `${BM.dio} days`], ['Gross margin', `${BM.grossMargin * 100}%`], ['Operating margin', `${BM.operatingMargin * 100}%`],
    ['Net margin', `${BM.netMargin * 100}%`], ['Return on assets', `${BM.roa * 100}%`], ['Return on equity', `${BM.roe * 100}%`],
    ['Cash from operations ÷ net income', BM.cfoToNetIncome.toFixed(1)], ['Dividends ÷ net income', `${BM.payout * 100}%`],
  ],
  note: 'The credit union’s borrowers keep their accounts as Brightwater does, with mechanics’ wages in cost of sales.',
};
const loan = {
  caption: 'The request and the credit union’s usual covenants',
  head: ['Item', 'Detail'], align: ['l', 'l'],
  rows: [
    ['Amount and use', `${money(LR.amount)}, drawn on 1 January 2028: ${money(LR.uses.inventory)} of e-bikes for sale and ${money(LR.uses.equipment)} for an e-bike service bay`],
    ['Terms', `${LR.rate * 100}% a year, five years: ${money(LR.instalment)} of principal each 31 December from 2028, with the year’s interest`],
    ['Existing loan', `${money(LR.existing.principal)} at ${LR.existing.rate * 100}%, ${money(LR.existing.instalment)} repaid each 1 March from 2028, interest paid yearly`],
    ['Covenant: current ratio', `at least ${LR.covenants.minCurrent.toFixed(1)}`],
    ['Covenant: debt to equity (interest-bearing debt ÷ equity)', `at most ${LR.covenants.maxDebtToEquity.toFixed(1)}`],
    ['Covenant: interest coverage (EBIT ÷ interest)', `at least ${LR.covenants.minInterestCoverage.toFixed(1)}`],
    ['Covenant: dividends', `at most ${LR.covenants.maxPayout * 100}% of the year’s net income`],
  ],
};

const widget = {
  type: 'ratios', title: 'Brightwater’s ratios, July–December 2026 and 2027',
  periods: [{ label: 'Jul–Dec 2026', data: p26 }, { label: '2027', data: p27 }],
  groups: ['liquidity', 'efficiency'],
  toggles: ['average', 'annualise', 'creditSales'],
  note: 'Brightwater had no inventory in 2026 and sold goods only from March 2027, so an average inventory for 2027 halves the closing figure, and a 365-day year overstates the days: the questions below adjust for both. Brightwater’s cost of goods sold (the bikes and accessories) is what inventory turnover uses; its cost of sales also includes mechanics’ wages and parts.',
};

export default {
  title: 'A credit review of Brightwater Bike Repair',
  brief: [
    { case: 'December 2027. Mateo Ruiz has asked Harbour Credit Union for a second loan: $25,000 over five years to stock e-bikes and fit out an e-bike service bay. You are the credit union’s analyst. You have Brightwater’s first six months (July–December 2026) and its first full year (2027), whose statements you prepared in F02. In 2027 Brightwater moved to a bigger workshop, rented on a lease of a year or less (so, under ASC 842’s short-term exemption, there is no lease liability), opened a small shop and started selling bikes and accessories. Mateo works in the business and pays himself only through dividends. Everything about Brightwater and the credit union is fictional.' },
    { table: income }, { table: balance }, { table: cash }, { table: bench }, { table: loan },
    { p: 'Work through the stages: what changed, how liquid and efficient Brightwater is, how much debt it can carry, what it earns on its capital, how good its earnings are, and then your recommendation. Use the July–December 2026 figures with care: six months, and a business that has since changed.' },
  ],
  deliverables: [
    'Growth and common-size margins for the two periods, adjusted for the six-month first period, with the main cause of the change in margin.',
    'Liquidity and efficiency ratios against the credit union’s benchmark, with the receivables and inventory days explained.',
    'Solvency now and pro forma with the new loan, tested against each covenant, and the headroom on the tightest one.',
    'Return on equity broken down by the DuPont method, compared with the benchmark, with what drives the difference.',
    'Cash-flow quality (cash from operations against net income, free cash flow, dividends) and Altman’s Z″.',
    'A recommendation memo to the credit committee: lend or not, on what terms and conditions, and what to monitor.',
  ],
  stages: [
    {
      id: 'trends', title: 'What changed',
      html: '<p>Start with growth and margins. The first period is six months, so annualise its flows before comparing growth, and use common-size figures (each line as a share of revenue) for margins, which don’t depend on the period’s length.</p>',
      items: [
        num('f03-pj-1', 'Annualise July–December 2026’s repair revenue and find the growth in repair revenue in 2027, as a percentage to one decimal place.',
          r1((LINES[2027].repair / (LINES[2026].repair * 12 / p26.months) - 1) * 100), () => r1((70_500 / (31_800 * 2) - 1) * 100),
          'Annualised 2026 repair revenue: $31,800 × 12/6 = $63,600. Growth: $70,500 ÷ $63,600 − 1 = 10.8%. Repairs grew modestly; most of the increase in total revenue is the new retail line. Annualising assumes July–December is a typical half-year; for a bike shop it holds part of the summer peak and the winter lull, so treat 10.8% as approximate.',
          [{ value: 121.7, say: 'That compares twelve months with six. Annualise the six months first: × 12/6.' },
            { value: 199.1, say: 'That is total revenue, unannualised. The question asks for repair revenue, with 2026 annualised.' }], { unit: '%', places: 1, tol: 0.15 }),
        num('f03-pj-2', 'What was Brightwater’s gross margin in 2027, as a percentage of net revenue, to one decimal place?',
          r1(p27.grossProfit / p27.revenue * 100), () => r1((95_100 - 33_600 - 7_980 - 14_740) / 95_100 * 100),
          'Gross profit $95,100 − $33,600 − $7,980 − $14,740 = $38,780; ÷ $95,100 = 40.8%. In July–December 2026 it was $18,310 ÷ $31,800 = 57.6%.',
          [{ value: 57.6, say: 'That is 2026’s margin. Use 2027’s gross profit and revenue.' },
            { value: 84.5, say: 'Cost of sales includes the mechanics’ wages and parts as well as the goods sold.' }], { unit: '%', places: 1, tol: 0.15 }),
        num('f03-pj-3', 'What was the gross margin on repairs alone in 2027 (repair revenue less mechanics’ wages and parts used, as a percentage of repair revenue)? One decimal place.',
          r1((LINES[2027].repair - 33_600 - 7_980) / LINES[2027].repair * 100), () => r1((70_500 - 33_600 - 7_980) / 70_500 * 100),
          '($70,500 − $33,600 − $7,980) ÷ $70,500 = $28,920 ÷ $70,500 = 41.0%. In July–December 2026, when repairs were the whole business, it was 57.6%.',
          [{ value: 40.8, say: 'That is the margin on all revenue. Take repair revenue and its own costs only.' },
            { value: 52.3, say: 'Subtract the parts used as well as the wages.' }], { unit: '%', places: 1, tol: 0.15 }),
        { id: 'f03-pj-4', type: 'mc', kind: 'conceptual',
          prompt: 'Gross margin fell from 57.6% to 40.8%. What mainly explains it?',
          options: [
            'Repairs became less profitable: mechanics’ wages outgrew repair revenue, taking the repair margin to about 41%',
            'Only the mix changed: the new retail goods earn far less than repairs, and the repair margin itself held up at its 2026 level',
            'Nothing real: the six-month 2026 period can’t be compared with a full year, so the fall is an illusion of period length',
            'The new workshop equipment’s depreciation is charged to cost of sales, which pushed the 2027 margin down',
          ],
          answer: 0,
          feedback: {
            1: 'The repair margin itself fell from 57.6% to 41.0%, and retail’s gross margin was about 40% (F02), so mix explains little of the fall.',
            2: 'Margins are ratios to revenue, so a six-month period can be compared with a year; growth needs annualising, margins don’t (seasonality aside).',
            3: 'Depreciation is an operating expense in Brightwater’s statements, not part of cost of sales.',
          },
          solution: 'The repair margin fell from 57.6% to 41.0% because the mechanics’ wages grew far faster than repair work: from 30.0% of repair revenue in July–December 2026 to 47.7% in 2027 ($33,600 on $70,500), as the bigger workshop brought more staff before more work. Parts held steady (12.4% then 11.3%). Retail earns about 40%, close to the new repair margin, so the change in mix matters little.' },
      ],
    },
    {
      id: 'liquidity', title: 'Liquidity and working capital',
      html: '<p>Explore the ratios in the widget, then answer. Use average balances for 2027 except where the question says otherwise, and receivables days on credit sales.</p>',
      tool: { kind: 'widget', widget },
      items: [
        num('f03-pj-5', 'What is Brightwater’s quick ratio at 31 December 2027? Two decimal places.',
          r2((p27.cash + p27.receivables) / p27.currentLiabilities), () => r2((14_379 + 6_073) / 8_068),
          '(Cash $14,379 + net receivables $6,073) ÷ current liabilities $8,068 = 2.53. The current ratio is 3.30. Both are well above the benchmark (0.9 and 1.8): Brightwater holds a lot of cash.',
          [{ value: 3.3, say: 'That is the current ratio. The quick ratio leaves out inventory, supplies and prepaid insurance.' },
            { value: 1.78, say: 'That counts cash only (the cash ratio). Receivables are quick assets too.' }], { unit: '', places: 2, tol: 0.01 }),
        num('f03-pj-6', 'What were days sales outstanding in 2027, on credit sales and average net receivables? One decimal place.',
          r1(365 / (p27.creditSales / ((p26.receivables + p27.receivables) / 2))), () => r1(365 / (26_800 / ((2_720 + 6_073) / 2))),
          'Average net receivables: ($2,720 + $6,073) ÷ 2 = $4,396.50. Turnover: $26,800 ÷ $4,396.50 = 6.10. Days: 365 ÷ 6.10 = 59.9 days, against a benchmark of 22 and 30-day terms.',
          [{ value: 16.9, say: 'That divides by all revenue. Most of Brightwater’s sales are paid at once; only the $26,800 invoiced is on credit.' },
            { value: 82.7, say: 'That uses closing receivables. Use the average of the two year-ends.' }], { unit: 'days', places: 1, tol: 0.3 }),
        num('f03-pj-7', 'Brightwater had no inventory at the end of 2026 and sold goods only from March 2027. What are its days inventory outstanding on closing 2027 inventory and the ten months of cost of goods sold? One decimal place.',
          r1(p27.inventory / p27.cogs * 365 * p27.goodsMonths / 12), () => r1(5_120 / 14_740 * 365 * 10 / 12),
          '$5,120 ÷ $14,740 × (365 × 10/12 = 304.2 days) = 105.7 days. The $14,740 is ten months of cost of goods sold, so measure against ten months. Averaging with the $0 of 2026 would halve it, which would understate how long stock sits. The benchmark is 70 days.',
          [{ value: 126.8, say: 'That uses 365 days, but the $14,740 of cost of goods sold covers only the ten months the shop sold goods.' },
            { value: 52.8, say: 'That averages with the $0 of 2026, before the shop sold anything: it halves the true figure.' },
            { value: 27.7, say: 'Inventory turnover uses the cost of goods sold ($14,740), not the whole cost of sales including wages.' }], { unit: 'days', places: 1, tol: 0.3 }),
        { id: 'f03-pj-8', type: 'multi', kind: 'applied',
          prompt: 'Which of these should worry the credit union about Brightwater’s working capital? Select all that apply.',
          options: [
            'Receivables take about 60 days to collect against 30-day terms and a benchmark of 22, and $2,300 of the $6,500 is overdue',
            'Inventory covers about 106 days of goods sold, against a benchmark of 70, in the shop’s first year',
            'The current ratio of 3.30 is far above the benchmark, so Brightwater can’t pay its bills',
            'Cash from operations was under 40% of net income, against a benchmark of 1.1',
          ],
          answer: [0, 1, 3],
          feedback: { 2: 'A high current ratio means plenty of current assets against current liabilities; here it is mostly cash. It can mean idle cash, not an inability to pay.' },
          solution: 'Slow collection (overdue invoices from business customers), slow-moving stock in a new shop, and operating cash well below profit all point the same way: profit is being tied up in working capital. The high current ratio is mostly cash, so it isn’t a worry in itself.' },
      ],
    },
    {
      id: 'solvency', title: 'Debt and covenants',
      html: '<p>Test Brightwater as it is and as it would be with the new loan. For the pro forma balance sheet, assume the loan was drawn and spent on 31 December 2027: $15,000 more inventory, $10,000 more equipment, $25,000 more debt of which $5,000 is due within a year, and equity unchanged.</p>',
      items: [
        num('f03-pj-9', 'What is Brightwater’s debt to equity (interest-bearing debt ÷ equity) pro forma with the new loan? Two decimal places.',
          r2(PF.debtToEquity), () => r2((3_000 + 9_000 + 25_000) / 19_344),
          'Debt: $12,000 existing + $25,000 new = $37,000. Equity $19,344. $37,000 ÷ $19,344 = 1.91, under the covenant’s 2.0 but close to it. Today it is $12,000 ÷ $19,344 = 0.62.',
          [{ value: 0.62, say: 'That is before the new loan. Add the $25,000.' },
            { value: 2.17, say: 'That is total liabilities ÷ equity. The covenant counts interest-bearing debt only.' }], { unit: '', places: 2, tol: 0.01 }),
        num('f03-pj-10', 'What is the pro forma current ratio? Two decimal places.',
          r2(PF.current), () => r2((26_602 + 15_000) / (8_068 + 5_000)),
          'Current assets $26,602 + $15,000 of e-bikes = $41,602 (the loan’s cash comes in and goes straight out). Current liabilities $8,068 + the $5,000 due on 31 December 2028 = $13,068. 41,602 ÷ 13,068 = 3.18: comfortably above 1.5.',
          [{ value: 3.3, say: 'That is today’s. The e-bikes add to current assets and the first instalment to current liabilities.' },
            { value: 3.95, say: 'The loan’s cash is spent at once: $15,000 becomes inventory (current) and $10,000 equipment (noncurrent). Don’t count the $25,000 as cash.' }], { unit: '', places: 2, tol: 0.01 }),
        num('f03-pj-11', 'Brightwater’s interest expense in 2028 would be the existing loan’s ($12,000 at 7% for January–February, $9,000 at 7% from March) plus a year on the new loan. If 2028’s EBIT equalled 2027’s, what would interest coverage be? Two decimal places.',
          r2(PF.coverageAt2027Ebit), () => r2(11_242 / (12_000 * 0.07 * 2 / 12 + 9_000 * 0.07 * 10 / 12 + 25_000 * 0.08)),
          'Interest: $140 + $525 + $2,000 = $2,665. Coverage: $11,242 ÷ $2,665 = 4.22, above the covenant’s 3.0 but below the benchmark’s 5. EBIT could fall to 3 × $2,665 = $7,995 (by about 29%) before the covenant is breached.',
          [{ value: 13.23, say: 'That is 2027’s, with $850 of interest. Add the new loan’s $2,000 and the old loan’s lower balance.' },
            { value: 3.96, say: 'The old loan falls to $9,000 on 1 March: $140 + $525, not a full year on $12,000.' }], { unit: '', places: 2, tol: 0.02 }),
        num('f03-pj-12', 'How far could equity fall before the debt-to-equity covenant (at most 2.0) is breached, pro forma? Answer in dollars.',
          Math.round(PF.equity - PF.debt / 2), () => 19_344 - 37_000 / 2,
          'The covenant allows debt up to 2 × equity, so equity must be at least $37,000 ÷ 2 = $18,500. Pro forma equity is $19,344: the headroom is $844. A year’s dividends larger than net income by more than $844 would breach it.',
          [{ value: 18500, say: 'That is the minimum equity. The question asks how far it can fall: $19,344 − $18,500.' }]),
      ],
    },
    {
      id: 'returns', title: 'Returns',
      html: '<p>Use average total assets and equity for 2027.</p>',
      items: [
        num('f03-pj-13', 'What was Brightwater’s return on equity in 2027? One decimal place.',
          r1(RATIOS[2027].profitability.roe * 100), () => r1(7_794 / ((16_350 + 19_344) / 2) * 100),
          'Average equity ($16,350 + $19,344) ÷ 2 = $17,847. ROE = $7,794 ÷ $17,847 = 43.7%, against a benchmark of 16%.',
          [{ value: 40.3, say: 'That uses closing equity. Use the average of the two year-ends.' },
            { value: 25.2, say: 'That is return on assets. ROE divides by equity.' }], { unit: '%', places: 1, tol: 0.15 }),
        { id: 'f03-pj-14', type: 'steps', kind: 'numerical',
          prompt: 'Break 2027’s ROE into its three DuPont drivers (averages for the balance-sheet items).',
          steps: [
            num('f03-pj-14a', 'Net margin (%), one decimal place.', r1(RATIOS[2027].dupont.netMargin * 100), () => r1(7_794 / 95_100 * 100),
              '$7,794 ÷ $95,100 = 8.2%.', [{ value: 11.8, say: 'That is the operating (EBIT) margin. DuPont’s three steps use net income.' }], { unit: '%', places: 1, tol: 0.1 }),
            num('f03-pj-14b', 'Asset turnover, two decimal places.', r2(RATIOS[2027].dupont.assetTurnover), () => r2(95_100 / ((25_370 + 36_412) / 2)),
              '$95,100 ÷ average total assets $30,891 = 3.08.', [{ value: 2.61, say: 'That uses closing total assets. Use the average.' }], { unit: '', places: 2, tol: 0.02 }),
            num('f03-pj-14c', 'Equity multiplier, two decimal places.', r2(RATIOS[2027].dupont.equityMultiplier), () => r2(((25_370 + 36_412) / 2) / ((16_350 + 19_344) / 2)),
              '$30,891 ÷ $17,847 = 1.73. Check: 8.2% × 3.08 × 1.73 ≈ 43.7%.', [{ value: 1.88, say: 'That is closing assets ÷ closing equity. Use averages so the product equals ROE.' }], { unit: '', places: 2, tol: 0.02 }),
          ],
          solution: 'ROE 43.7% = net margin 8.2% × asset turnover 3.08 × equity multiplier 1.73. The benchmark’s ROE of 16% with an ROA of 8% implies a multiplier near 2: Brightwater uses less leverage, earns a higher margin and turns its assets far faster.' },
        { id: 'f03-pj-15', type: 'mc', kind: 'conceptual',
          prompt: 'Brightwater’s ROE is nearly three times the benchmark’s. What should the analyst make of that?',
          options: [
            'It overstates real profitability: Mateo takes no salary, so profit, and with it ROA and ROE, bears no cost for the owner’s labour',
            'It shows Brightwater is much better run than the credit union’s similar shops, so the loan carries little risk',
            'It comes from heavy borrowing that multiplies a thin margin, so Brightwater is riskier than the benchmark borrowers',
            'It means Brightwater earns more than it can reinvest and should pay out a larger share of its profit as dividends',
          ],
          answer: 0,
          feedback: {
            1: 'High returns can be real, but here part of the profit is Mateo’s unpaid labour, and a small equity base inflates the ratio. Adjust before concluding.',
            2: 'Brightwater’s equity multiplier (1.73) is lower than the benchmark’s (about 2): leverage isn’t the cause.',
            3: 'ROE says nothing on its own about how much to pay out; the cash flow (next stage) argues against higher dividends.',
          },
          solution: 'An owner-manager who takes no salary makes profit, and so ROE, look better than in a business that pays its manager. A lender adjusts for a market salary before judging returns and debt capacity, and remembers that ROE on a small, young equity base moves a lot with each dollar of profit.' },
      ],
    },
    {
      id: 'quality', title: 'Cash and distress',
      html: '<p>Profit is an opinion about the year; cash is a fact. Compare them, and finish with Altman’s Z″ for non-manufacturers.</p>',
      items: [
        num('f03-pj-16', 'What was cash from operations as a multiple of net income in 2027? Two decimal places.',
          r2(p27.cfo / p27.netIncome), () => r2(3_029 / 7_794),
          '$3,029 ÷ $7,794 = 0.39. In July–December 2026 it was $6,900 ÷ $6,000 = 1.15. The benchmark is 1.1: Brightwater’s 2027 profit didn’t turn into cash, mostly because receivables and inventory grew.',
          [{ value: 2.57, say: 'That is net income ÷ cash from operations: the ratio upside down.' }], { unit: '', places: 2, tol: 0.01 }),
        num('f03-pj-17', 'What was free cash flow in 2027 (cash from operations less equipment bought)?',
          p27.cfo - p27.capex, () => 3_029 - 9_000,
          '$3,029 − $9,000 = −$5,971. With $4,800 of dividends on top, Brightwater spent $10,771 more than its operations produced, covered by the new $12,000 loan (less the $5,000 old note repaid) and its cash.',
          [{ value: 3029, say: 'Subtract the $9,000 of equipment bought.' }, { value: -1771, say: 'Free cash flow is before dividends: CFO − capital spending.' }, { value: -5271, say: 'The course’s free cash flow doesn’t net the $700 from the stand sold: CFO − equipment bought.' }]),
        num('f03-pj-18', 'What share of 2027’s net income did Brightwater pay out as dividends? One decimal place.',
          r1(p27.dividends / p27.netIncome * 100), () => r1(4_800 / 7_794 * 100),
          '$4,800 ÷ $7,794 = 61.6%: above the covenant’s 50% limit had it applied in 2027, and well above the benchmark’s 35%, in a year when free cash flow was negative.',
          [{ value: 158.5, say: 'That is the dividend as a share of cash from operations. The covenant is on net income.' }], { unit: '%', places: 1, tol: 0.1 }),
        num('f03-pj-19', 'What is Brightwater’s Altman Z″ at 31 December 2027 (6.56 X1 + 3.26 X2 + 6.72 X3 + 1.05 X4, with X1 working capital, X2 retained earnings and X3 EBIT, each ÷ total assets, and X4 book equity ÷ total liabilities)? Two decimal places.',
          r2(RATIOS.zdouble2027.score), () => r2(6.56 * (26_602 - 8_068) / 36_412 + 3.26 * 7_344 / 36_412 + 6.72 * 11_242 / 36_412 + 1.05 * 19_344 / 17_068),
          'X1 = $18,534 ÷ $36,412 = 0.509; X2 = $7,344 ÷ $36,412 = 0.202; X3 = $11,242 ÷ $36,412 = 0.309; X4 = $19,344 ÷ $17,068 = 1.133. Z″ = 3.339 + 0.658 + 2.075 + 1.190 = 7.26: far above the levels the model associates with distress.',
          [{ value: 8.34, say: 'X2 uses retained earnings ($7,344), not total equity.' }], { unit: '', places: 2, tol: 0.02 }),
        { id: 'f03-pj-20', type: 'mc', kind: 'conceptual',
          prompt: 'Z″ says Brightwater is safe, while the cash-flow ratios raise concerns. Which reading is best?',
          options: [
            'Both are right: Z″ sees today’s strong balance sheet, the cash ratios see growth consuming cash',
            'Z″ is the more reliable measure, because it combines liquidity, profitability and leverage into one tested score',
            'The cash-flow ratios mislead, because depreciation and the loss on the stand haven’t been added back to profit',
            'Z″ can’t be used for Brightwater at all, because the model was built only for listed manufacturing companies',
          ],
          answer: 0,
          feedback: {
            1: 'A composite score is still built from one balance sheet and one year’s EBIT; it can’t see that the cash is being run down by working capital and dividends.',
            2: 'Cash from operations already adds depreciation back; the gap comes from working capital.',
            3: 'That describes the original Z. Z″ was built for non-manufacturers, which includes service and retail businesses; its limits are the small-company and sample issues, not the sector.',
          },
          solution: 'Today’s balance sheet is strong (plenty of cash, modest debt), which is what Z″ measures. The cash-flow ratios describe the direction: cash fell by $3,071 in 2027 as receivables, stock, equipment and dividends absorbed it. The new loan and the e-bike stock would deepen both trends, so the conditions matter more than the score.' },
      ],
    },
    {
      id: 'memo', title: 'Recommendation',
      html: '<p>Write to the credit committee.</p>',
      items: [
        { id: 'f03-pj-21', type: 'short', kind: 'applied',
          prompt: 'Write a memo to Harbour Credit Union’s credit committee (about 250 words): lend the $25,000 or not, on what conditions, and what to monitor. Support every point with a figure from your analysis.',
          rubric: [
            'Gives a clear decision (lend, lend less or on conditions, or decline) in the first sentences.',
            'Supports it with the strengths (liquidity, low leverage today, coverage) and the weaknesses (slow collection, slow stock, cash from operations well below profit, high payout, a falling repair margin), with figures.',
            'Tests the pro forma covenants, names the tightest balance-sheet test with its headroom ($844 of equity on debt to equity), and notes that 2027’s 61.6% payout is already above the 50% dividend limit.',
            'Proposes conditions that address the weaknesses (a dividend limit, staged drawdown or a smaller amount, reporting on receivables and stock, a collection plan).',
            'Notes the limits of the analysis: a six-month first period, a business that changed in 2027, the owner’s unpaid labour, fictional benchmarks from a small peer group.',
          ],
          model: `<b>To:</b> Credit committee · <b>From:</b> Analyst · <b>Re:</b> Brightwater Bike Repair, $25,000 term loan<br><br><b>Recommendation.</b> Lend, but in two stages and with conditions. Brightwater is liquid and lightly geared today: current ratio 3.30, quick ratio 2.53, debt to equity 0.62, interest coverage 13.2, Z″ 7.26. Pro forma, the current-ratio, debt-to-equity and coverage covenants are met (current 3.18, debt to equity 1.91, coverage about 4.2 on 2027’s EBIT), but debt to equity leaves only $844 of headroom, and 2027’s 61.6% payout would breach the 50% dividend covenant, so condition (2) is needed.<br><br><b>Concerns.</b> 2027’s profit didn’t become cash: cash from operations was $3,029 against $7,794 of net income (0.39×; benchmark 1.1). Receivables take about 60 days on credit sales (benchmark 22; $2,300 overdue) and stock covers about 106 days of goods sold (benchmark 70). Free cash flow was −$5,971, yet dividends were $4,800 (62% of profit). The repair margin fell from 57.6% to 41.0% as wages rose ahead of work. ROE of 43.7% (and ROA of 25%) flatters the business because Mateo takes no salary: a market wage for a full-time manager could take most or all of 2027’s $11,242 of EBIT.<br><br><b>Conditions.</b> (1) $15,000 for the service bay and a first batch of e-bikes now; the rest when stock days fall below 90. (2) Dividends at most 50% of net income and none while debt to equity exceeds 1.8. (3) Quarterly accounts with an aged receivables list and stock report; a collection plan for the courier and fleet accounts.<br><br><b>Limits.</b> One full year and a six-month start, in a business that changed shape in 2027; the benchmark is a small peer group. Review after the 2028 spring season.`,
          solution: 'Compare your memo with the model and the rubric. A decision to decline, or to lend a smaller amount, can earn full marks if it follows from the figures and addresses the same risks.' },
      ],
    },
  ],
  rubric: [
    'Every ratio is computed with the stated conventions (annualised six-month flows for growth, averages, credit sales for receivables days, the cost of goods sold for inventory days) and labelled.',
    'Each ratio is compared with the benchmark and with the earlier period, and the cause of each difference is explained, not just described.',
    'The covenant tests use the pro forma balance sheet, and the tightest covenant and its headroom are identified.',
    'The recommendation follows from the analysis, its conditions answer the weaknesses found, and its limits are stated.',
  ],
  verify() {
    const R27 = RATIOS[2027];
    return [
      ['annualised 2026 repair revenue', LINES[2026].repair * 2, 63_600], ['repair growth (%)', (70_500 / 63_600 - 1) * 100, 10.85, 0.01],
      ['gross margin 2027 (%)', R27.profitability.grossMargin * 100, 40.78, 0.01], ['gross margin 2026 (%)', RATIOS[2026].profitability.grossMargin * 100, 57.58, 0.01],
      ['current ratio 2027', R27.liquidity.current, 3.297, 0.001], ['quick ratio 2027', R27.liquidity.quick, 2.535, 0.001],
      ['DSO on credit sales', 365 / (p27.creditSales / ((p26.receivables + p27.receivables) / 2)), 59.88, 0.01],
      ['DIO closing, ten months', p27.inventory / p27.cogs * 365 * 10 / 12, 105.65, 0.01], ['debt to equity 2027', R27.solvency.debtToEquity, 0.620, 0.001],
      ['interest coverage 2027', R27.solvency.interestCoverage, 13.226, 0.001],
      ['pro forma debt to equity', PF.debtToEquity, 1.913, 0.001], ['pro forma current', PF.current, 3.184, 0.001],
      ['2028 interest', PF.interest2028, 2_665], ['pro forma coverage', PF.coverageAt2027Ebit, 4.218, 0.001], ['equity headroom', PF.equity - PF.debt / 2, 844],
      ['ROE 2027 (%)', R27.profitability.roe * 100, 43.67, 0.01], ['ROA 2027 (%)', R27.profitability.roa * 100, 25.23, 0.01],
      ['DuPont product = ROE', R27.dupont.roe, R27.profitability.roe, 1e-12],
      ['CFO / NI 2027', R27.cash.cfoToNetIncome, 0.389, 0.001], ['CFO / NI 2026', RATIOS[2026].cash.cfoToNetIncome, 1.15, 0.001],
      ['FCF 2027', R27.cash.freeCashFlow, -5_971], ['payout 2027 (%)', R27.cash.payout * 100, 61.59, 0.01],
      ['Z″ 2027', RATIOS.zdouble2027.score, 7.261, 0.001], ['cash fell in 2027', p26.cash - p27.cash, 3_071],
      ['overdue receivables', AGING.slice(1).reduce((s, b) => s + b.amount, 0), 2_300],
      ['spent beyond operations', p27.capex + p27.dividends - p27.cfo, 10_771],
    ];
  },
};
