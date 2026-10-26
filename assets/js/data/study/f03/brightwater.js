// brightwater.js — the F03 project's data: Brightwater Bike Repair's two periods (July–December 2026 and 2027) as
// inputs to core/ratios.js, the loan Mateo asks Harbour Credit Union for in January 2028, and the credit union's
// benchmark for similar borrowers. Every name and figure is invented for teaching.
//
// 2027 comes from f02/brightwater.js (the F02 project, which students prepared themselves). F02 gives only the 2026
// balance sheet; the July–December 2026 income statement below is new in F03 and agrees with everything known:
// - f01/brightwater.js (July 2026: revenue $6,220, rent $1,200 a month, wages, supplies, $60 a month of insurance,
//   $80 a month of depreciation, $25 a month of interest, a $400 dividend on 31 July);
// - f02/brightwater.js's balances at 31 December 2026: retained earnings $4,350 = net income $6,000 − dividends $1,650;
//   the allowance ($140, nothing written off in 2026) = bad debt expense; accumulated depreciation $480 = six months at
//   $80; prepaid insurance $360 = $720 − six months at $60; interest payable $150 = six months at $25; income taxes
//   payable $1,050 = 2026's $2,000 of tax less $950 paid during the year;
// - cash: the statement of cash flows it implies ties to $17,450 of cash at 31 December 2026 (see IDENTITIES).
// Brightwater's accountant puts the mechanics' wages and the parts used in cost of sales (F02), unlike Lantern.
// The workshop is rented on a lease of 12 months or less, so ASC 842's short-term exemption applies: rent is an expense
// and there is no lease liability.
import * as R from '../../../core/ratios.js?v=19';
import { RESULTS as B27, OPENING as B26_BS, AGING } from '../f02/brightwater.js?v=19';

/** July–December 2026, in summary (fictional, consistent with F01 and F02). */
export const INCOME_2026 = {
  repairRevenue: 31_800,
  costOfSales: { wages: 9_540, supplies: 3_950 },
  operating: { rent: 7_200, utilities: 1_050, advertising: 600, insurance: 360, depreciation: 480, cardFees: 330, badDebt: 140 },
  interest: 150, tax: 2_000, dividends: 1_650,
  creditSales: 9_900,           // invoiced to the courier company, the rental fleet and regulars
  equipmentBought: 4_800,       // all paid in 2026
};
const I = INCOME_2026;
const cos26 = I.costOfSales.wages + I.costOfSales.supplies;
const opex26 = Object.values(I.operating).reduce((s, v) => s + v, 0);
const ebit26 = I.repairRevenue - cos26 - opex26;
const ni26 = ebit26 - I.interest - I.tax;
const S = B27.statements;
const bs26 = S.balance2026, bs27 = S.balance;
const ca26 = bs26.assets.currentTotal;
const cfo26 = ni26 + I.operating.depreciation
  - (B26_BS['Accounts Receivable'] - B26_BS['Allowance for Doubtful Accounts']) - B26_BS.Supplies - B26_BS['Prepaid Insurance']
  + B26_BS['Accounts Payable'] + B26_BS['Wages Payable'] + B26_BS['Interest Payable'] + B26_BS['Unearned Revenue'] + B26_BS['Income Taxes Payable'];

/** The two periods, in core/ratios.js's fields. Inventory turnover uses the cost of the goods sold only (`cogs`),
 *  not the wages and parts in cost of sales; gross profit is the statement's. */
export const PERIODS = {
  2026: {
    months: 6, revenue: I.repairRevenue, cogs: 0, grossProfit: I.repairRevenue - cos26, operatingIncome: ebit26, ebit: ebit26,
    interestExpense: I.interest, pretax: ebit26 - I.interest, tax: I.tax, netIncome: ni26, da: I.operating.depreciation,
    cash: B26_BS.Cash, receivables: B26_BS['Accounts Receivable'] - B26_BS['Allowance for Doubtful Accounts'], inventory: 0,
    currentAssets: ca26, ppeNet: bs26.assets.noncurrentTotal, totalAssets: bs26.assets.total, payables: B26_BS['Accounts Payable'],
    currentLiabilities: bs26.liabilities.currentTotal, totalLiabilities: bs26.liabilities.total, debt: B26_BS['Short-Term Notes Payable'],
    leaseLiabilities: 0, equity: bs26.equityTotal, retainedEarnings: B26_BS['Retained Earnings'],
    cfo: cfo26, capex: I.equipmentBought, dividends: I.dividends, creditSales: I.creditSales,
  },
  2027: {
    months: 12, revenue: B27.revenue, cogs: B27.cogs, grossProfit: B27.grossProfit, operatingIncome: B27.operatingIncome, ebit: B27.ebit,
    interestExpense: S.income.interestExpense, pretax: B27.incomeBeforeTax, tax: B27.incomeTax, netIncome: B27.netIncome, da: S.income.depreciationAmortisation,
    cash: B27.cash, receivables: B27.receivablesNet, inventory: B27.inventoryEnd, currentAssets: B27.currentAssets, ppeNet: bs27.assets.noncurrentTotal,
    totalAssets: B27.totalAssets, payables: bs27.liabilities.current.find((r) => r[0] === 'Accounts Payable')[1],
    currentLiabilities: B27.currentLiabilities, totalLiabilities: B27.totalLiabilities,
    debt: bs27.liabilities.current.find((r) => r[0] === 'Current Portion of Long-Term Debt')[1] + bs27.liabilities.noncurrent.find((r) => r[0] === 'Notes Payable')[1],
    leaseLiabilities: 0, equity: B27.equity, retainedEarnings: B27.retainedEarnings,
    cfo: B27.cfo, capex: -S.cash.lines.find((l) => l[0] === 'Purchase of equipment')[1], dividends: B27.dividends,
    creditSales: 26_800,       // repairs invoiced in 2027 (F02's project: receivables $2,860 + $26,800 − $22,780 − $380 = $6,500)
    purchases: 11_960 + 6_300 + 8_100,   // bought on account (bikes, accessories, parts): AP $1,180 + $26,360 − $25,490 paid = $2,050
    goodsMonths: 10,           // the shop sold goods only from March
  },
};

/** Revenue by line, for the trend and common-size stages. */
export const LINES = {
  2026: { repair: I.repairRevenue, retail: 0, returns: 0 },
  2027: { repair: S.income.lists.revenue.find((r) => r[0] === 'Repair Revenue')[1], retail: S.income.lists.revenue.find((r) => r[0] === 'Retail Sales Revenue')[1],
          returns: S.income.lists.contra.find((r) => r[0] === 'Sales Returns and Allowances')[1] },
};

/** Harbour Credit Union's benchmark: medians for its small repair-and-retail borrowers' 2027 accounts (fictional). */
export const BENCHMARK = {
  label: 'Harbour Credit Union: median of similar borrowers, 2027 (fictional)',
  current: 1.8, quick: 0.9, liabilitiesToEquity: 1.2, interestCoverage: 5, dsoCredit: 22, dio: 70,
  grossMargin: 0.42, operatingMargin: 0.08, netMargin: 0.05, roa: 0.08, roe: 0.16, cfoToNetIncome: 1.1, payout: 0.35,
};

/** December 2027: Mateo asks for a five-year loan, drawn on 1 January 2028, to add e-bikes and an e-bike service bay.
 *  Repaid $5,000 each 31 December from 2028, with the year's interest, so the first $5,000 is current at 31 December 2027. */
export const LOAN_REQUEST = {
  applied: '2027-12-10', drawn: '2028-01-01', amount: 25_000, rate: 0.08, years: 5, instalment: 5_000,   // $5,000 of principal each 31 December from 2028, with the year's interest
  uses: { inventory: 15_000, equipment: 10_000 },
  existing: { principal: 12_000, rate: 0.07, instalment: 3_000, next: '2028-03-01' },  // F02: $3,000 each 1 March from 2028
  covenants: { minCurrent: 1.5, maxDebtToEquity: 2.0, minInterestCoverage: 3.0, maxPayout: 0.5 },
};

// ---------------------------------------------------------------- derived figures (recomputed by the checker)
const L = LOAN_REQUEST, p27 = PERIODS[2027];
/** The balance sheet at 31 December 2027 as if the loan had been made and spent that day (pro forma). */
const proCA = p27.currentAssets + L.uses.inventory;           // the cash comes in and goes straight out on inventory and equipment
const proCL = p27.currentLiabilities + L.instalment;           // the first $5,000 is due within a year
const proDebt = p27.debt + L.amount;
const interest2028 = L.existing.principal * L.existing.rate * 2 / 12 + (L.existing.principal - L.existing.instalment) * L.existing.rate * 10 / 12
  + L.amount * L.rate;                                         // the old loan's balance falls on 1 March; the new loan all year
export const PRO_FORMA = {
  currentAssets: proCA, currentLiabilities: proCL, current: proCA / proCL,
  debt: proDebt, equity: p27.equity, debtToEquity: proDebt / p27.equity,
  totalAssets: p27.totalAssets + L.amount, totalLiabilities: p27.totalLiabilities + L.amount,
  interest2028, coverageAt2027Ebit: p27.ebit / interest2028,
  ebitForCoverage3: 3 * interest2028,
};

export const RATIOS = {
  2026: R.analyse(PERIODS[2026]),
  2027: R.analyse(PERIODS[2027], PERIODS[2026]),
  zdouble2026: R.altman(PERIODS[2026], 'zdouble'),
  zdouble2027: R.altman(PERIODS[2027], 'zdouble'),
};

export const IDENTITIES = [
  ['2026 net income − dividends = retained earnings at 31 December 2026', ni26 - I.dividends === B26_BS['Retained Earnings']],
  ['2026 tax = 25% of income before tax', I.tax === (ebit26 - I.interest) * 0.25],
  ['2026 bad debts = the allowance (nothing written off in 2026)', I.operating.badDebt === B26_BS['Allowance for Doubtful Accounts']],
  ['2026 depreciation = accumulated depreciation', I.operating.depreciation === B26_BS['Accumulated Depreciation—Equipment']],
  ['2026 insurance = $720 policy − prepaid', I.operating.insurance === 720 - B26_BS['Prepaid Insurance']],
  ['2026 interest = interest payable (none paid)', I.interest === B26_BS['Interest Payable']],
  ['2026 rent = $1,200 × 6', I.operating.rent === 1_200 * 6],
  ['2026 cash: CFO − equipment + stock + note − dividends = cash at 31 December', cfo26 - I.equipmentBought + 12_000 + 5_000 - I.dividends === B26_BS.Cash],
  ['2026 revenue covers July’s $6,220', I.repairRevenue > 6_220],
  ['the balance sheet still balances pro forma', Math.abs(PRO_FORMA.totalAssets - PRO_FORMA.totalLiabilities - p27.equity) < 1e-9],
  ['2027 periods agree with F02: equity', p27.equity === bs27.equityTotal],
  ['2027 receivables = aging total − allowance', p27.receivables === AGING.reduce((s, b) => s + b.amount, 0) - B27.allowanceNeeded],
  ['2027 payables = opening + purchases on account − payments', B26_BS['Accounts Payable'] + p27.purchases - 25_490 === p27.payables],
  ['July 2026 lies inside the six months', I.costOfSales.wages >= 1_920 && I.costOfSales.supplies >= 820 && I.operating.utilities >= 185 && I.dividends >= 400],
];
