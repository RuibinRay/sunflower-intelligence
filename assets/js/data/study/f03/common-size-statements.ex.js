// common-size-statements.ex.js — F03 · Common-size statements: widgets, practice and the knowledge check.
// Answer keys live here, not in the page's HTML. Every number is recomputed by `check` (see ../AUTHORING.md).
// Lantern’s figures come from case.js, Harbourline’s from f00/case.js, Starbucks’ from its FY2024 Form 10-K;
// every other business is fictional.
import { PERIODS, COMPARATIVE, FACTS as F } from './case.js?v=19';
import { HARBOURLINE as H, HARBOURLINE_DETAIL as HD } from '../f00/case.js?v=19';
import * as R from '../../../core/ratios.js?v=19';

const P26 = PERIODS[2026], P27 = PERIODS[2027];
const IS = Object.fromEntries(COMPARATIVE.income.map(([n, a, b]) => [n, [a, b]]));
const BS = Object.fromEntries(COMPARATIVE.balance.map(([n, a, b]) => [n, [a, b]]));
const money = (v) => `${v < 0 ? '−' : ''}$${Math.abs(Math.round(v)).toLocaleString('en-US')}`;
const r1 = (x) => Math.round(x * 1000) / 10;
const share = (n, y) => IS[n][y] / [P26.revenue, P27.revenue][y];
const occ = (y) => IS['Rent Expense'][y] + IS['Operating Lease Cost'][y];
const opex = (p) => p.grossProfit - p.operatingIncome;

// Lantern’s assets at 31 December 2027, condensed (for the worksheet and the formula item)
const otherCurrent = BS['Inventory'][1] + BS['Supplies'][1] + BS['Prepaid Insurance'][1];
const assetCells = () => ({
  A1: 'Asset at 31 December 2027', B1: 'Amount ($)', C1: '% of total assets',
  A2: 'Cash', B2: P27.cash,
  A3: 'Accounts receivable, net', B3: P27.receivables,
  A4: 'Contract asset', B4: P27.contractAsset,
  A5: 'Inventory, supplies and prepaid insurance', B5: otherCurrent,
  A6: 'Property and equipment, net', B6: P27.ppeNet,
  A7: 'Operating lease right-of-use assets', B7: P27.rightOfUse,
  A8: 'Total assets', B8: '=SUM(B2:B7)',
});

const harbourline = { revenue: H.revenue, operatingIncome: H.ebit, ebit: H.ebit, da: H.da, interestExpense: HD.interest, pretax: HD.profitBeforeTax, tax: HD.tax, netIncome: H.netIncome, totalAssets: HD.totalAssets, equity: HD.bookEquity };
const starbucks = { revenue: 36176.2, operatingIncome: 5408.8, ebit: 5408.8, da: 1592.4, netIncome: 3760.9 };

export const widgets = {
  'cs-ratios': {
    type: 'ratios',
    title: 'Margins: Lantern, Harbourline Roasters and Starbucks',
    periods: [{ label: 'Lantern 2026 (10 months)', data: P26 }, { label: 'Lantern 2027', data: P27 }],
    peers: [
      { label: 'Harbourline ($m)', data: harbourline, note: 'Fictional (F00).' },
      { label: 'Starbucks FY2024 ($m)', data: starbucks, note: 'Form 10-K for fiscal 2024.' },
    ],
    ratios: ['grossMargin', 'operatingMargin', 'ebitdaMargin', 'netMargin'],
    toggles: ['annualise'],
    adjust: [{ id: 'cafe-staff', label: 'Move the café staff’s $92,000 of wages from operating expenses into cost of sales (Lantern 2027)', period: 1, delta: { cogs: F.wages.cafes, grossProfit: -F.wages.cafes } }],
    select: 'grossMargin',
    note: 'Lantern and Harbourline are fictional. Harbourline reports its operating costs as one line and Starbucks presents no gross profit, so neither has a gross margin. Starbucks’ EBITDA uses the cash-flow statement’s total depreciation and amortization ($1,592.4 million) and its net margin net earnings attributable to Starbucks.',
  },
  'cs-bars': {
    type: 'chart', kind: 'bar',
    title: 'Lantern: where each dollar of revenue went (% of net revenue)',
    x: { label: 'Line', values: ['Goods', 'Services', 'Wages', 'Occupancy', 'Other opex', 'Op. income'] },
    series: [
      { name: '2026 (ten months)', values: [r1(share('Cost of Goods Sold', 0)), r1(share('Cost of Services', 0)), r1(share('Wages Expense', 0)), r1(occ(0) / P26.revenue), r1((opex(P26) - IS['Wages Expense'][0] - occ(0)) / P26.revenue), r1(P26.operatingIncome / P26.revenue)] },
      { name: '2027', values: [r1(share('Cost of Goods Sold', 1)), r1(share('Cost of Services', 1)), r1(share('Wages Expense', 1)), r1(occ(1) / P27.revenue), r1((opex(P27) - IS['Wages Expense'][1] - occ(1)) / P27.revenue), r1(P27.operatingIncome / P27.revenue)] },
    ],
    y: { label: '% of net revenue' },
    note: 'Fictional figures from the case. Goods: cost of goods sold; Services: cost of services; Wages: wages expense; Occupancy: kitchen rent and café lease cost; Other opex: the other operating expenses; Op. income: operating income. Each year’s six bars add to 100% of net revenue (to rounding). Wages and occupancy rose by 18.4 and 3.2 points; operating income fell by 13.8 points.',
  },
  'cs-sheet': {
    type: 'sheet',
    title: 'Lantern’s assets at 31 December 2027',
    sheet: { cells: assetCells() },
    view: 'A1:C8',
    formats: { B: '#,##0', C: '0.0%' },
    widths: { A: 34, B: 12, C: 16 },
    editable: true,
    mark: ['C2:C8'],
    tools: ['formulas', 'fill', 'reset'],
    note: 'Fictional figures from the case. B8 adds up the assets. Divide each line by B8, with a $ sign to keep the total fixed as you fill down.',
  },
};

export const guided = [
  {
    id: 'f03-cs-g1', type: 'steps', kind: 'numerical',
    prompt: 'Kestrel Cinemas, a fictional cinema chain, reports for 2027: net revenue $6,400,000; film rental and concession costs (its cost of sales) $2,880,000; operating expenses $2,688,000, of which depreciation and amortisation is $448,000. Enter each margin as a percentage to one decimal place.',
    solution: 'Gross profit = 6,400,000 − 2,880,000 = 3,520,000: gross margin 55.0%. Operating income = 3,520,000 − 2,688,000 = 832,000: operating margin 13.0%. EBITDA = 832,000 + 448,000 = 1,280,000: EBITDA margin 20.0%.',
    steps: [
      { id: 'f03-cs-g1-s1', type: 'num', prompt: 'What is the gross margin?',
        answer: 55, check: () => (6400000 - 2880000) / 6400000 * 100, unit: '%', places: 1, tol: 0.05,
        hints: ['Gross profit ÷ net revenue.', '(6,400,000 − 2,880,000) ÷ 6,400,000.'],
        wrong: [{ value: 45, say: 'That is cost of sales as a share of revenue. The gross margin is what is left: 100% − 45%.' }] },
      { id: 'f03-cs-g1-s2', type: 'num', prompt: 'What is the operating margin?',
        answer: 13, check: () => (6400000 - 2880000 - 2688000) / 6400000 * 100, unit: '%', places: 1, tol: 0.05,
        hints: ['Operating income = gross profit − operating expenses.', '832,000 ÷ 6,400,000.'],
        wrong: [{ value: 20, say: 'That adds depreciation back (EBITDA). Operating income is after all operating expenses, including depreciation.' }] },
      { id: 'f03-cs-g1-s3', type: 'num', prompt: 'What is the EBITDA margin?',
        answer: 20, check: () => (6400000 - 2880000 - 2688000 + 448000) / 6400000 * 100, unit: '%', places: 1, tol: 0.05,
        hints: ['EBITDA = operating income + depreciation and amortisation.', '(832,000 + 448,000) ÷ 6,400,000.'],
        wrong: [{ value: 6, say: 'Depreciation is added back to operating income, not subtracted again.' }] },
    ],
  },
  {
    id: 'f03-cs-g2', type: 'formula', kind: 'numerical',
    prompt: 'Lantern’s assets at 31 December 2027 are below, with the total in B8. In C2, write a formula for cash as a share of total assets that still works when it is filled down to C8.',
    sheet: { cells: assetCells() },
    cell: 'C2', fill: 'C2:C8',
    answer: '=B2/$B$8',
    alt: ['=B2/B$8', '=B2/SUM($B$2:$B$7)'],
    view: 'A1:C8',
    formats: { B: '#,##0', C: '0.0%' },
    widths: { A: 34 },
    wrong: [
      { formula: '=B2/B8', say: 'Right for C2, but when it is filled down the divisor moves to B9, B10 … which are empty. Fix the total with $B$8 (or B$8).' },
      { formula: '=B8/B2', say: 'That is upside down: the line goes on top and the total underneath.' },
    ],
    hints: ['Each line ÷ total assets.', 'The total must not move when you fill down: write it as $B$8.'],
    solution: '=B2/$B$8, filled down: cash 2.0%, receivables 3.3%, contract asset 9.4%, inventory, supplies and prepaid insurance 3.4%, property and equipment 29.1%, right-of-use assets 52.9%, total 100.0%.',
  },
  {
    id: 'f03-cs-g3', type: 'mc', kind: 'conceptual',
    prompt: `Lantern’s gross margin rose from ${(P26.grossProfit / P26.revenue * 100).toFixed(1)}% in 2026 to ${(P27.grossProfit / P27.revenue * 100).toFixed(1)}% in 2027, while its operating margin fell from ${(P26.operatingIncome / P26.revenue * 100).toFixed(1)}% to ${(P27.operatingIncome / P27.revenue * 100).toFixed(1)}%. What best explains the two moving in opposite directions?`,
    options: [
      'Café sales carry a low cost of goods, while café staff and leases sit in operating expenses',
      'Lantern raised its prices in 2027, which lifted the gross margin and cut the volume of coffee and food it sold',
      'The 2026 figures cover ten months, so the 2026 margins are understated until annualised',
      'Interest and income tax rose in 2027, which reduces the operating margin',
    ],
    answer: 0,
    feedback: {
      1: 'Nothing in the statements shows a price rise; and the operating margin falls between gross profit and operating income, which a price rise wouldn’t cause.',
      2: 'Margins divide two flows for the same months, so the period length cancels out: annualising changes no margin.',
      3: 'Interest and tax are below operating income; they move the net margin, not the operating margin.',
    },
    hints: ['Which costs are in cost of sales, and which are below gross profit?', 'The cafés’ cost of goods is 31% of their sales; where are their staff and leases?'],
    solution: 'The cafés added sales with a cost of goods of 31%, lower than the shop’s, so the gross margin rose. Their staff ($92,000), the leases ($40,000) and Ana’s salary are operating expenses, below gross profit, so the operating margin fell.',
  },
  {
    id: 'f03-cs-g4', type: 'num', kind: 'applied',
    prompt: `A competitor of Lantern’s puts all store staff in cost of sales. To compare gross margins, restate Lantern’s 2027 income statement with the café staff’s ${money(F.wages.cafes)} of wages moved from operating expenses into cost of sales. Lantern’s 2027 net revenue was ${money(P27.revenue)} and its gross profit ${money(P27.grossProfit)}. What is the restated gross margin? Enter a percentage to one decimal place.`,
    answer: 45.3, check: () => (P27.grossProfit - F.wages.cafes) / P27.revenue * 100, unit: '%', places: 1, tol: 0.05,
    hints: ['Moving a cost into cost of sales lowers gross profit by the same amount.', `(${P27.grossProfit.toLocaleString('en-US')} − ${F.wages.cafes.toLocaleString('en-US')}) ÷ ${P27.revenue.toLocaleString('en-US')}.`],
    wrong: [
      { value: 61.2, say: 'That is the reported gross margin. Move the $92,000 into cost of sales first.' },
      { value: 77.1, say: 'Moving a cost into cost of sales lowers gross profit; subtract the $92,000, don’t add it.' },
      { value: 5.7, say: 'That is the operating margin, which the reclassification doesn’t change.' },
    ],
    solution: `Restated gross profit: ${P27.grossProfit.toLocaleString('en-US')} − 92,000 = 261,655. Gross margin: 261,655 ÷ 577,860 = 45.3%, against 61.2% as reported and 54.0% in 2026. The operating margin stays at 5.7%.`,
  },
];

export const independent = [
  {
    id: 'f03-cs-i1', type: 'num', kind: 'numerical',
    prompt: 'In fiscal 2024 Starbucks reported revenues from company-operated stores of $29,765.9 million (out of total net revenues of $36,176.2 million) and store operating expenses of $15,286.5 million. Store operating expenses relate to company-operated stores. Express them as a percentage of company-operated store revenues, to one decimal place.',
    answer: 51.4, check: () => 15286.5 / 29765.9 * 100, unit: '%', places: 1, tol: 0.05,
    wrong: [
      { value: 42.3, say: 'That divides by total net revenues, which include licensed-store and other revenue the stores’ costs don’t relate to.' },
      { value: 194.7, say: 'Upside down: the expense goes on top and the revenue underneath.' },
    ],
    solution: '15,286.5 ÷ 29,765.9 = 51.4%. Choosing the base that matches the cost (company-operated store revenues) gives a more useful figure than the 42.3% of total net revenues on the common-size statement.',
  },
  {
    id: 'f03-cs-i2', type: 'num', kind: 'applied',
    prompt: `Lantern’s 2027 operating expenses were ${money(opex(P27))} on net revenue of ${money(P27.revenue)}. They include Ana’s first salary (${money(F.wages.ana)}) and a market research programme (${money(F.research)}) that had no counterpart in 2026. What share of revenue did the other operating expenses take? Enter a percentage to one decimal place.`,
    answer: 43.6, check: () => (opex(P27) - F.wages.ana - F.research) / P27.revenue * 100, unit: '%', places: 1, tol: 0.05,
    wrong: [
      { value: 55.5, say: 'That is all operating expenses. Take out the salary and the research first.' },
      { value: 47.2, say: 'Take out both items: the research as well as the salary.' },
    ],
    solution: '(320,868 − 48,000 − 21,000) ÷ 577,860 = 251,868 ÷ 577,860 = 43.6%, against 34.5% in 2026: even without the new items, operating expenses took a much larger share, mainly because of the cafés’ staff and leases.',
  },
  {
    id: 'f03-cs-i3', type: 'mc', kind: 'applied',
    prompt: 'Starbucks’ common-size balance sheet at 29 September 2024 shows total liabilities of 123.7% of total assets. What does that tell an analyst?',
    options: [
      'Shareholders’ equity is negative (a deficit of 23.7% of assets), so ratios built on equity need care',
      'The figure must be an error, because total liabilities can never exceed total assets on any company’s balance sheet',
      'Starbucks cannot pay its current liabilities, because they are larger than its current assets',
      'The percentages were calculated on revenue rather than total assets, which inflates them',
    ],
    answer: 0,
    feedback: {
      1: 'Assets = liabilities + equity still holds; when liabilities exceed assets, equity is negative. That is unusual but not an error.',
      2: 'Total liabilities against total assets says nothing about current items alone; liquidity is the next module.',
      3: 'Total liabilities ($38,780.9 million) really do exceed total assets ($31,339.3 million).',
    },
    solution: 'Total liabilities exceed total assets, so equity is a deficit: 31,339.3 − 38,780.9 = −7,441.6 ($ million), −23.7% of assets. Return on equity and debt to equity then have a negative denominator and mean nothing.',
  },
  {
    id: 'f03-cs-i4', type: 'num', kind: 'numerical',
    prompt: `Harbourline Roasters (fictional) holds inventory of $${HD.inventory} million and total assets of $${HD.totalAssets} million. What is inventory on its common-size balance sheet? Enter a percentage to one decimal place.`,
    answer: 10.6, check: () => HD.inventory / HD.totalAssets * 100, unit: '%', places: 1, tol: 0.05,
    wrong: [
      { value: 10.9, say: 'That divides by revenue ($640 million). A balance sheet line is divided by total assets.' },
      { value: 38.9, say: 'That divides by current assets. The common-size base is total assets.' },
    ],
    solution: '70 ÷ 660 = 10.6% of total assets.',
  },
  {
    id: 'f03-cs-i5', type: 'classify', kind: 'conceptual',
    prompt: 'On a common-size statement, what is each line divided by?',
    items: [
      'Cost of goods sold',
      'Accounts receivable',
      'Operating lease right-of-use assets',
      'Interest expense',
      'Unearned revenue',
      'Retained earnings',
      'Depreciation expense',
      'Operating income',
    ],
    categories: ['Net revenue', 'Total assets'],
    answer: [0, 1, 1, 0, 1, 1, 0, 0],
    feedback: {
      4: 'Unearned revenue is a liability on the balance sheet, so it is divided by total assets (equal to total liabilities and equity), despite its name.',
      5: 'Retained earnings are part of equity, on the balance sheet.',
      6: 'Depreciation expense is an income statement line; accumulated depreciation would be on the balance sheet.',
    },
    solution: 'Income statement lines (cost of goods sold, interest expense, depreciation expense, operating income) are divided by net revenue; balance sheet lines (receivables, right-of-use assets, unearned revenue, retained earnings) by total assets.',
  },
  {
    id: 'f03-cs-i6', type: 'short', kind: 'applied',
    prompt: 'Using the margins table and the common-size balance sheets in the lesson, write four to six sentences for Ana comparing Lantern’s 2027 with Harbourline Roasters, and say what she should do about the difference.',
    rubric: [
      'Quotes at least two margins for both businesses (for example operating 5.7% against 9.5%, net 3.9% against 5.9%).',
      'Locates Lantern’s gap in operating expenses (wages and leases), not in gross profit.',
      'Notes that one-off or new costs (research, Ana’s first salary, the cafés’ first months) explain part of the gap.',
      'Compares how the two are financed (equity 19.2% against 45.5% of assets; Lantern’s lease liabilities).',
      'Recommends something concrete (monitor café wage and lease shares monthly, rebuild equity or cash before borrowing more) and notes the limits of comparing with a much larger business.',
    ],
    model: 'Lantern keeps less of each dollar of revenue than Harbourline at every level: its operating margin was 5.7% in 2027 against Harbourline’s 9.5%, and its net margin 3.9% against 5.9%. The gap opens below gross profit, in operating expenses: wages took 27.9% of revenue and the cafés’ leases another 6.9%. Part of it will not recur, since research took 3.6% of revenue, and the cafés were in their first ten months. Lantern is also financed far more by liabilities, with equity at only 19.2% of its assets against 45.5% at Harbourline, largely because of the café leases. Ana should track the cafés’ wage and lease shares every month and rebuild cash and equity before taking on more debt; Harbourline is more than a thousand times her size, so its margins are a direction, not a target.',
  },
];

export const check = [
  {
    id: 'f03-cs-k1', type: 'num', kind: 'numerical',
    prompt: 'A fictional ferry operator reports net revenue of $18,400,000, operating income of $2,208,000 and interest expense of $368,000, and pays income tax at 25% of its income before tax. What is its net margin? Enter a percentage to one decimal place.',
    answer: 7.5, check: () => (2208000 - 368000) * (1 - 0.25) / 18400000 * 100, unit: '%', places: 1, tol: 0.05,
    wrong: [
      { value: 12, say: 'That is the operating margin. Subtract interest and tax to reach net income.' },
      { value: 10, say: 'That is income before tax as a share of revenue. Take off the 25% tax.' },
      { value: 7, say: 'Tax is charged on income after interest: (2,208,000 − 368,000) × 0.75, not 2,208,000 × 0.75 − 368,000.' },
    ],
    solution: 'Income before tax = 2,208,000 − 368,000 = 1,840,000; net income = 1,840,000 × 0.75 = 1,380,000; net margin = 1,380,000 ÷ 18,400,000 = 7.5%.',
  },
  {
    id: 'f03-cs-k2', type: 'mc', kind: 'conceptual',
    prompt: 'Which question can a common-size income statement on its own not answer?',
    options: [
      'Whether the business made enough profit in dollars to repay its loans',
      'Which costs took a larger share of revenue than in the previous year',
      'Where between gross profit and net income the margin was lost',
      'Whether two businesses of different sizes spend similar shares on staff',
    ],
    answer: 0,
    feedback: {
      1: 'That is exactly what comparing two common-size years shows.',
      2: 'The cascade of margins locates the loss between subtotals.',
      3: 'Removing size is the point of common-size statements.',
    },
    solution: 'Common-size statements remove scale, so they cannot say whether the dollars are enough. A 3.9% net margin is $22,431 for Lantern: the dollars, the cash flows and the debt payments are needed to judge repayment.',
  },
  {
    id: 'f03-cs-k3', type: 'num', kind: 'applied',
    prompt: 'At 29 September 2024 Starbucks reported a stored value card liability and current portion of deferred revenue of $1,781.2 million, noncurrent deferred revenue of $5,963.6 million and total assets of $31,339.3 million. What share of its total assets is financed by deferred revenue (both parts)? Enter a percentage to one decimal place.',
    answer: 24.7, check: () => (1781.2 + 5963.6) / 31339.3 * 100, unit: '%', places: 1, tol: 0.05,
    wrong: [
      { value: 19, say: 'Include the current part as well as the noncurrent part.' },
      { value: 5.7, say: 'Include the noncurrent part, which is the larger.' },
      { value: 21.4, say: 'That divides by total net revenues ($36,176.2 million). A balance sheet line is divided by total assets.' },
    ],
    solution: '(1,781.2 + 5,963.6) ÷ 31,339.3 = 7,744.8 ÷ 31,339.3 = 24.7%. But most of it is not customer money: the bulk of the noncurrent part is a royalty prepaid in 2018 by Nestlé, recognised over 40 years (the deferred-revenue note, R79). Read the note before calling a liability customer funding.',
  },
  {
    id: 'f03-cs-k4', type: 'mc', kind: 'applied',
    prompt: 'Two fictional coffee chains are alike in every way, with the same shop leases, but one reports under US GAAP (ASC 842, operating leases) and the other under IFRS 16. How will their EBITDA margins compare?',
    options: [
      'The IFRS reporter’s is higher, because its lease charges are depreciation and interest, which EBITDA excludes',
      'The US GAAP reporter’s is higher, because ASC 842 keeps operating leases off the balance sheet',
      'They are equal, because both frameworks put the leases on the balance sheet',
      'The IFRS reporter’s is lower, because IFRS 16 adds interest on the lease liability to operating costs',
    ],
    answer: 0,
    feedback: {
      1: 'ASC 842 puts operating leases on the balance sheet too (a right-of-use asset and a lease liability). The difference is in the income statement.',
      2: 'Both put the leases on the balance sheet, but the expense differs: a single lease cost in operating expenses under ASC 842, depreciation and interest under IFRS 16.',
      3: 'Under IFRS 16 the interest on the lease liability is a finance cost, below operating profit, and outside EBITDA.',
    },
    solution: 'Under ASC 842 an operating lease gives a single straight-line lease cost inside operating expenses, so it reduces EBITDA. Under IFRS 16 the same lease is charged as depreciation and interest, both excluded from EBITDA, so the IFRS reporter’s EBITDA margin is higher.',
  },
  {
    id: 'f03-cs-k5', type: 'num', kind: 'numerical',
    prompt: 'A fictional hotel’s balance sheet shows total liabilities of $15,600,000 and total equity of $10,400,000. On its common-size balance sheet, what percentage of total assets does equity finance? Enter it to one decimal place.',
    answer: 40, check: () => 10400000 / (15600000 + 10400000) * 100, unit: '%', places: 1, tol: 0.05,
    wrong: [
      { value: 66.7, say: 'That divides equity by liabilities. Total assets = liabilities + equity = $26,000,000.' },
      { value: 60, say: 'That is the liabilities’ share. Equity’s share is the rest.' },
    ],
    solution: 'Total assets = 15,600,000 + 10,400,000 = 26,000,000. Equity = 10,400,000 ÷ 26,000,000 = 40.0%; liabilities finance the other 60.0%.',
  },
  {
    id: 'f03-cs-k6', type: 'multi', kind: 'conceptual',
    prompt: 'Which statements about common-size statements are true? Select all that apply.',
    options: [
      'Margins from a ten-month period can be compared with a full year’s without annualising',
      'Moving a cost from operating expenses into cost of sales changes the operating margin',
      'A line’s common-size share can fall while its dollar amount rises',
      'The common-size balance sheet divides each line by total liabilities and equity, which equals total assets',
      'Common-size statements show whether a business has enough cash to pay its debts',
    ],
    answer: [0, 2, 3],
    feedback: {
      1: 'Both lines are above operating income, so only the gross margin changes.',
      4: 'Margins and shares are accrual measures of structure; cash and debt service need the cash-flow statement and liquidity ratios.',
    },
    solution: 'True: margins need no annualising (both parts cover the same months); a share falls when the total grows faster than the line; the balance sheet base is total assets, which equals total liabilities and equity. False: a reclassification above operating income leaves the operating margin unchanged, and common-size figures say nothing about cash.',
  },
];
