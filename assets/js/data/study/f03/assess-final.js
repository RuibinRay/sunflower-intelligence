// assess-final.js — F03 final assessment: 24 questions across all four modules and all six of the course’s outcomes,
// two or three per lesson (five for module 1, seven for module 2, five for module 3 and seven for module 4). 70% passes.
// Mixed conceptual, numerical and applied items. Six are formula items on worksheets that paste a statement (four on
// their own, two inside steps), marked on the sheet and on copies with the numbers changed, so typed results fail:
// annualised growth for a part-year (f03-fn-1), a two-year common-size statement filled across (f03-fn-4), and the quick
// ratio, receivables days, ROE and the equity multiplier from one restaurant group’s statements (f03-fn-6, -11, -13, -15).
// Items that combine lessons: growth per store from a 10-K’s statements and its Item 1 store counts (f03-fn-2:
// horizontal analysis and reading a filing); common-size margins against dollar growth, then the line behind the change
// (f03-fn-4: common-size and horizontal); a margin compared across two classifications (f03-fn-5: common-size and
// benchmarking); the new money a current-ratio covenant needs, and how the agreement’s definition changes it (f03-fn-7:
// liquidity and solvency); which liabilities are debt and lease debt, then a lease-adjusted covenant recomputed and
// judged (f03-fn-8: what counts as debt; f03-fn-10: solvency and the covenant judgement); growth tying up working capital (f03-fn-12:
// efficiency and cash flow); ROE across a ten-month first period and an owner’s salary (f03-fn-14: horizontal analysis
// and returns); the equity multiplier with and without leases, then what it does to ROE (f03-fn-15: solvency and
// DuPont); 2027’s ROE on 2026’s leverage (f03-fn-16: returns and DuPont); payouts against free cash flow and a
// shareholders’ deficit (f03-fn-18: cash flow and solvency); accruals and red flags, then what a Z″ score adds
// (f03-fn-19: earnings quality and distress scores); a restatement read from an 8-K (f03-fn-20: earnings quality and
// filings); a new lease through Z″ (f03-fn-21: distress scores and leases); the original Z against Z″ for Lantern
// (f03-fn-22); an EBITDA margin with the right D&A from a 10-K (f03-fn-23: common-size and filings); a non-GAAP
// measure whose definition changed (f03-fn-24: filings and free cash flow).
// Lantern’s figures come from case.js and the ratios from core/ratios.js; Starbucks, Amazon and Enron figures are from
// the filings cited in the lessons (REAL-FIGURES.md); every other business is fictional and used nowhere else on the
// site, and nothing comes from the project (Brightwater, Harbour Credit Union). No hints; solutions are shown on review.
// Every num item’s `check` recomputes its answer from the inputs below.
import { PERIODS, COMPARATIVE, FACTS } from './case.js?v=18';
import * as R from '../../../core/ratios.js?v=18';

const fx = (v, d = 2) => `${v < 0 && Math.abs(v) >= 0.5 * 10 ** -d ? '−' : ''}${Math.abs(v).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d })}`;
const usd = (v) => `${v < 0 ? '−' : ''}$${Math.abs(Math.round(v)).toLocaleString('en-US')}`;
const pc = (v, d = 1) => `${v < 0 ? '−' : ''}${fx(Math.abs(v) * 100, d)}%`;
const m1 = (v) => `${v < 0 ? '−' : ''}$${fx(Math.abs(v), 1)} million`;
const sum = (a) => a.reduce((s, x) => s + x, 0);
const r2 = (x) => Math.round(x * 100) / 100;
const r1 = (x) => Math.round(x * 10) / 10;
const avg2 = (a, b) => (a + b) / 2;

// ---------------------------------------------------------------- Lantern (case.js)
const P26 = PERIODS[2026], P27 = PERIODS[2027];
const b27 = (label) => COMPARATIVE.balance.find((r) => r[0] === label)[2];
const LOC = b27('Line of Credit');
const COVENANT = 1.2;                                            // f03/case.js header: Coastline’s 2028 loan (from F00)
const needCash = COVENANT * P27.currentLiabilities - P27.currentAssets;
const LEASE_CUR = b27('Current Portion of Operating Lease Liabilities');
const needCashNoLease = COVENANT * (P27.currentLiabilities - LEASE_CUR) - P27.currentAssets;   // the test leaves lease liabilities out
const S26 = R.solvency(P26), S27 = R.solvency(P27), S27L = R.solvency(P27, { withLeases: true });
const DEBT_LINES = ['Current Portion of Long-Term Debt', 'Line of Credit', 'Notes Payable', 'Instalment Note Payable'];
const LEASE_LINES = ['Current Portion of Operating Lease Liabilities', 'Operating Lease Liabilities'];
const LEV_CAP = 2.5;                                             // a lease-adjusted leverage test (fictional terms)
const PR26 = R.profitability(P26), PR27 = R.profitability(P27, P26);
const D26 = R.dupont(P26), D27 = R.dupont(P27, P26);
const roeOn26Leverage = D27.netMargin * D27.assetTurnover * D26.equityMultiplier;
const Z27 = R.altman(P27, 'zdouble');
const Zorig = R.altman({ ...P27, marketEquity: P27.equity }, 'z');

// ---------------------------------------------------------------- Starbucks, Amazon, Enron (REAL-FIGURES.md; $ millions)
const SB = { rev22: 32250.3, rev23: 35975.6, rev24: 36176.2, cosRev23: 29462.3, cosRev24: 29765.9,
  stores23: 38038, stores24: 40199, coStores23: 19592, coStores24: 21018,
  productCosts24: 11180.6, storeOpex24: 15286.5, opInc24: 5408.8, daIS24: 1512.6, daCF24: 1592.4,
  cfo24: 6095.6, capex24: 2777.5, dividends24: 2585.0, buybacks24: 1266.7, netEarnings24: 3760.9,
  ltd23: 13547.6, ltd24: 14319.5 };
const sbRevGrowth = R.growth(SB.rev24, SB.rev23), sbStoreGrowth = R.growth(SB.stores24, SB.stores23);
const sbCoStoreGrowth = R.growth(SB.coStores24, SB.coStores23), sbCoRevGrowth = R.growth(SB.cosRev24, SB.cosRev23);
const sbPerStore = (rev, n) => rev / n;
const sbPerStoreGrowth = R.growth(sbPerStore(SB.cosRev24, SB.coStores24), sbPerStore(SB.cosRev23, SB.coStores23));
const sbCagr = R.cagr(SB.rev24, SB.rev22, 2);
const sbQuasiGross = (SB.rev24 - SB.productCosts24) / SB.rev24;
const sbFcf = SB.cfo24 - SB.capex24, sbPayout = SB.dividends24 + SB.buybacks24;
const sbEbitdaMargin = (SB.opInc24 + SB.daCF24) / SB.rev24, sbEbitdaMarginIS = (SB.opInc24 + SB.daIS24) / SB.rev24;
const AMZN = { cfo14: 6842, capex14: 4893, fcf14: 1949, cfo23: 84946, capex23: 52729 };
const ENRON = { reported: [105, 703, 893, 979], restated: [9, 590, 643, 847] };
const enronCut = sum(ENRON.reported) - sum(ENRON.restated);

// ---------------------------------------------------------------- Halvergate Climbing Walls (fictional), opened 1 April 2026
const HCW = [
  ['Entry and membership fees', 312_000, 451_000],
  ['Café sales', 63_000, 79_800],
  ['Total revenue', null, null],
  ['Staff costs', 171_000, 236_400],
  ['Rent', 81_000, 108_000],
  ['Other operating expenses', 58_500, 74_200],
  ['Operating income', null, null],
];
const hcwCells = (() => {
  const c = { A1: 'Halvergate Climbing Walls', B1: '2026 ($)', C1: '2027 ($)', D1: 'Growth, annualised', A2: 'Months in the period', B2: 9, C2: 12 };
  HCW.forEach(([n, a, b], i) => { const r = i + 3; c[`A${r}`] = n; if (a !== null) { c[`B${r}`] = a; c[`C${r}`] = b; } });
  for (const col of ['B', 'C']) { c[`${col}5`] = `=SUM(${col}3:${col}4)`; c[`${col}9`] = `=${col}5-${col}6-${col}7-${col}8`; }
  return c;
})();
const hcwRow = (i) => HCW[i].slice(1);
const hcwRev = [0, 1].map((j) => hcwRow(0)[j] + hcwRow(1)[j]);
const hcwOi = [0, 1].map((j) => hcwRev[j] - hcwRow(3)[j] - hcwRow(4)[j] - hcwRow(5)[j]);
const hcwG = (a, b) => R.growth(b, a, { annualised: true, prevMonths: 9 });

// ---------------------------------------------------------------- Bellhouse Bike Hire (fictional)
const BBH = { rev: [820_000, 1_040_000], rentals: [336_200, 395_200], staff: [172_200, 239_200], marketing: [32_800, 115_000], rent: [106_600, 114_400] };
const bbhGp = [0, 1].map((j) => BBH.rev[j] - BBH.rentals[j]);
const bbhOi = [0, 1].map((j) => bbhGp[j] - BBH.staff[j] - BBH.marketing[j] - BBH.rent[j]);
const bbhShare = (key, j) => BBH[key][j] / BBH.rev[j];
const bbhOm = [0, 1].map((j) => bbhOi[j] / BBH.rev[j]);
const bbhCells = (() => {
  const c = { A1: 'Bellhouse Bike Hire', B1: '2026 ($)', C1: '2027 ($)', D1: '2026 (% of revenue)', E1: '2027 (% of revenue)' };
  const rows = [['Revenue', 'rev'], ['Cost of rentals', 'rentals'], ['Gross profit', null], ['Staff', 'staff'], ['Marketing and booking fees', 'marketing'], ['Rent and other', 'rent'], ['Operating income', null]];
  rows.forEach(([n, key], i) => { const r = i + 2; c[`A${r}`] = n; if (key) { c[`B${r}`] = BBH[key][0]; c[`C${r}`] = BBH[key][1]; } });
  for (const col of ['B', 'C']) { c[`${col}4`] = `=${col}2-${col}3`; c[`${col}8`] = `=${col}4-${col}5-${col}6-${col}7`; }
  return c;
})();

// ---------------------------------------------------------------- Bramblegate Dining Co. (fictional), $ thousands
const BG = {
  cash: [410, 260], sti: [150, 90], rec: [180, 240], inv: [120, 140], prepaid: [60, 70],
  ppe: [2_900, 3_300], rou: [4_300, 4_600],
  ap: [380, 420], accrued: [300, 350], cpltd: [200, 250], leaseCur: [520, 560],
  ltd: [1_220, 1_450], leaseNon: [3_900, 4_000], equity: [1_600, 1_670],
  revenue: 12_600, invoiced: 1_460, cos: 3_780, opex: 7_200, dep: 520, interest: 140, taxRate: 0.25,
};
const bgCA = [0, 1].map((j) => BG.cash[j] + BG.sti[j] + BG.rec[j] + BG.inv[j] + BG.prepaid[j]);
const bgTA = [0, 1].map((j) => bgCA[j] + BG.ppe[j] + BG.rou[j]);
const bgCL = [0, 1].map((j) => BG.ap[j] + BG.accrued[j] + BG.cpltd[j] + BG.leaseCur[j]);
const bgTL = [0, 1].map((j) => bgCL[j] + BG.ltd[j] + BG.leaseNon[j]);
const bgEbit = BG.revenue - BG.cos - BG.opex - BG.dep;
const bgPretax = bgEbit - BG.interest, bgNi = bgPretax * (1 - BG.taxRate);
const bgP = (j) => ({ cash: BG.cash[j], shortTermInvestments: BG.sti[j], receivables: BG.rec[j], inventory: BG.inv[j], currentAssets: bgCA[j],
  currentLiabilities: bgCL[j], totalAssets: bgTA[j], totalLiabilities: bgTL[j], equity: BG.equity[j] });
const bgPrev = bgP(0), bgCur = { ...bgP(1), revenue: BG.revenue, netIncome: bgNi, pretax: bgPretax, ebit: bgEbit };
const bgQuick = R.liquidity(bgCur).quick;
const bgDso = R.efficiency({ ...bgCur, revenue: BG.invoiced }, bgPrev).dso;
const bgDsoAll = R.efficiency(bgCur, bgPrev).dso;
const bgRoe = R.profitability(bgCur, bgPrev).roe;
const bgDup = R.dupont(bgCur, bgPrev);
const bgEmNoLease = avg2(bgTA[0] - BG.rou[0], bgTA[1] - BG.rou[1]) / avg2(BG.equity[0], BG.equity[1]);
const bgCells = (label) => {
  const c = { A1: 'Bramblegate Dining Co. ($ thousands)', B1: '31 Dec 2026', C1: '31 Dec 2027', E1: 'Measure', F1: 'Result', E2: label };
  const rows = [
    ['Cash', 'cash'], ['Short-term investments', 'sti'], ['Receivables, net (corporate events)', 'rec'], ['Inventory (food and drink)', 'inv'], ['Prepaid expenses', 'prepaid'],
    ['Total current assets', '=SUM(#2:#6)'], ['Property and equipment, net', 'ppe'], ['Operating lease right-of-use assets', 'rou'], ['Total assets', '=#7+#8+#9'],
    ['Accounts payable', 'ap'], ['Accrued liabilities and event deposits', 'accrued'], ['Current portion of long-term debt', 'cpltd'], ['Current operating lease liabilities', 'leaseCur'],
    ['Total current liabilities', '=SUM(#11:#14)'], ['Long-term debt', 'ltd'], ['Noncurrent operating lease liabilities', 'leaseNon'], ['Total liabilities', '=#15+#16+#17'],
    ['Total equity', 'equity'], ['Total liabilities and equity', '=#18+#19'],
  ];
  rows.forEach(([n, v], i) => {
    const r = i + 2; c[`A${r}`] = n;
    for (const [j, col] of [[0, 'B'], [1, 'C']]) c[`${col}${r}`] = v.startsWith('=') ? v.replace(/#/g, col) : BG[v][j];
  });
  Object.assign(c, {
    A22: 'Income statement', C22: '2027',
    A23: 'Revenue', C23: BG.revenue, A24: 'of which invoiced to corporate clients', C24: BG.invoiced,
    A25: 'Cost of sales', C25: BG.cos, A26: 'Operating expenses (lease cost included)', C26: BG.opex, A27: 'Depreciation', C27: BG.dep,
    A28: 'Operating income', C28: '=C23-C25-C26-C27', A29: 'Interest expense', C29: BG.interest,
    A30: 'Income before tax', C30: '=C28-C29', A31: 'Income tax (25%)', C31: '=C30*0.25', A32: 'Net income', C32: '=C30-C31',
  });
  return c;
};
const BG_VIEW = 'A1:F32', BG_WIDTHS = { A: 34, B: 12, C: 12, E: 24, F: 10 };
const BG_FORMATS = { B: '#,##0', C: '#,##0' };

// ---------------------------------------------------------------- other fictional businesses
// Ottercombe Wholesale: working-capital days, sales and costs growing 20%
const OW = { creditSales: 7_300_000, dso: 45, cogs: 5_475_000, dio: 60, dpo: 30, growth: 0.20 };
const owRec = OW.creditSales / 365 * OW.dso, owInv = OW.cogs / 365 * OW.dio, owPay = OW.cogs / 365 * OW.dpo;
const owNeed = (owRec + owInv - owPay) * OW.growth;
// Feldspar Labs Inc.: five-step factors in two years
const FL = { y26: [0.78, 0.92, 0.12, 0.85, 1.8], y27: [1.12, 0.93, 0.10, 0.88, 1.75] };
const flRoe = (f) => f.reduce((s, x) => s * x, 1);
// Nethercote Signs ($ thousands)
const NS = { netIncome: 410, cfo: 95, taOpen: 3_600, totalAssets: 4_400, currentAssets: 1_350, currentLiabilities: 1_250,
  totalLiabilities: 2_900, retainedEarnings: 820, ebit: 640, equity: 1_500, revGrowth: 0.09, recGrowth: 0.46 };
const nsAccr = R.cashQuality({ netIncome: NS.netIncome, cfo: NS.cfo, totalAssets: NS.totalAssets }, { totalAssets: NS.taOpen }).accrualsRatio;
const nsZ = R.altman(NS, 'zdouble');
// Peverell Cafés ($ thousands): a lease signed and recorded on 31 December
const PCF = { currentAssets: 300, currentLiabilities: 340, totalAssets: 1_500, totalLiabilities: 900, retainedEarnings: 250, ebit: 180, equity: 600 };
const PCF_LEASE = { total: 480, current: 60 };
const pcfAfter = { ...PCF, totalAssets: PCF.totalAssets + PCF_LEASE.total, currentLiabilities: PCF.currentLiabilities + PCF_LEASE.current, totalLiabilities: PCF.totalLiabilities + PCF_LEASE.total };
const pcfZ0 = R.altman(PCF, 'zdouble'), pcfZ1 = R.altman(pcfAfter, 'zdouble');
const pcfNoCurrent = R.altman({ ...pcfAfter, currentLiabilities: PCF.currentLiabilities }, 'zdouble');
const pcfOnlyLiab = R.altman({ ...PCF, totalLiabilities: PCF.totalLiabilities + PCF_LEASE.total }, 'zdouble');

export const items = [
  // ================================================================ Module 1: comparing statements
  {
    id: 'f03-fn-1', lesson: 'horizontal-analysis', type: 'formula', kind: 'applied',
    prompt: 'Halvergate Climbing Walls, a fictional climbing centre, opened on 1 April 2026, so its 2026 column covers nine months; row 2 gives each period’s months. In D3, write a formula for the growth from 2026 to 2027 on annualised figures. It will be filled down to D9.',
    sheet: { cells: hcwCells, fixed: ['B2:C2'] },
    cell: 'D3', fill: 'D3:D9', view: 'A1:D9',
    answer: '=(C3/C$2)/(B3/B$2)-1',
    alt: ['=C3/(B3*$C$2/$B$2)-1', '=C3*$B$2/(B3*$C$2)-1', '=C3/(B3*12/9)-1', '=(C3-B3*12/9)/(B3*12/9)'],
    formats: { B: '#,##0', C: '#,##0', D: '0.0%' }, widths: { A: 26, D: 18 },
    wrong: [
      { formula: '=C3/B3-1', say: 'That compares nine months with twelve, so every line seems to grow by about a third more than it did. Put both periods on a twelve-month basis first, using the months in row 2.' },
      { formula: '=C3/(B3*$B$2/$C$2)-1', say: 'That scales 2026 down by 9 ÷ 12. To annualise nine months, multiply by 12 ÷ 9.' },
      { formula: '=(C3-B3)/C3', say: 'A change is measured on the earlier period, and the nine months must be annualised first.' },
    ],
    solution: `<x>=(C3/C$2)/(B3/B$2)-1</x>: each period’s monthly average, then the change (or <x>=C3/(B3*12/9)-1</x>). Revenue grew ${pc(hcwG(hcwRev[0], hcwRev[1]))} and operating income ${pc(hcwG(hcwOi[0], hcwOi[1]))} on annualised figures, against ${pc(hcwRev[1] / hcwRev[0] - 1)} and ${pc(hcwOi[1] / hcwOi[0] - 1)} unadjusted. Rent shows ${pc(hcwG(hcwRow(4)[0], hcwRow(4)[1]))}: the same monthly rent in both years, which the unadjusted ${pc(hcwRow(4)[1] / hcwRow(4)[0] - 1)} would hide. Annualising assumes the missing months are typical. Halvergate’s busiest months are January to March, which 2026 lacks, so the annualised base is probably too low and the true growth below these figures.`,
  },
  {
    id: 'f03-fn-2', lesson: 'horizontal-analysis', type: 'mc', kind: 'applied',
    prompt: `Starbucks’ total net revenues rose ${pc(sbRevGrowth)} from fiscal 2023 to fiscal 2024, and revenue from company-operated stores ${pc(sbCoRevGrowth)}. Item 1 of its fiscal 2024 Form 10-K shows ${SB.coStores23.toLocaleString('en-US')} company-operated stores at 1 October 2023 and ${SB.coStores24.toLocaleString('en-US')} at 29 September 2024 (${pc(sbCoStoreGrowth)} more), and ${SB.stores24.toLocaleString('en-US')} stores in all (${pc(sbStoreGrowth)} more). What does this horizontal analysis support?`,
    options: [
      `Revenue per company-operated store fell, so the next step is to separate sales in existing stores from the timing of new openings`,
      'Revenue kept pace with the store estate, because most of the new stores were licensed ones that pay Starbucks royalties rather than sales',
      'The store openings destroyed value, because revenue grew far more slowly than the number of stores',
      'Nothing: store counts come from Item 1, not the audited statements, so they can’t be set against revenue',
    ],
    answer: 0,
    feedback: {
      1: `Company-operated stores, whose sales are all revenue, grew ${pc(sbCoStoreGrowth)}, faster than the estate as a whole. Revenue from them grew only ${pc(sbCoRevGrowth)}.`,
      2: 'Horizontal analysis shows that sales per store fell; it doesn’t show why, or whether the new stores will pay back. Stores opened late in the year traded for only part of it.',
      3: 'Item 1’s operating data are exactly what an analyst sets against the statements; the point is to state where each figure comes from.',
    },
    solution: `Revenue per company-operated store: $${fx(sbPerStore(SB.cosRev23, SB.coStores23), 3)} million in fiscal 2023 and $${fx(sbPerStore(SB.cosRev24, SB.coStores24), 3)} million in fiscal 2024 (${pc(sbPerStoreGrowth)}), using year-end counts. Year-end counts overstate the stores open on average, since new stores trade for part of the year, so the fall is partly timing. The next question is how sales changed in stores open in both years: look for comparable-store sales in the MD&A.`,
  },
  {
    id: 'f03-fn-3', lesson: 'horizontal-analysis', type: 'num', kind: 'numerical',
    prompt: `Starbucks’ total net revenues were $${fx(SB.rev22, 1)} million in fiscal 2022 and $${fx(SB.rev24, 1)} million in fiscal 2024 (Form 10-K for fiscal 2024). What was their compound annual growth rate over the two years? Enter a percentage to one decimal place.`,
    answer: r1(sbCagr * 100), check: () => sbCagr * 100, unit: '%', places: 1, tol: 0.05,
    wrong: [
      { value: r1((SB.rev24 / SB.rev22 - 1) * 100), say: 'That is the total growth over the two years. The CAGR is the yearly rate that compounds to it: the square root of 36,176.2 ÷ 32,250.3, minus 1.' },
      { value: r1((SB.rev24 / SB.rev22 - 1) * 50), say: 'Halving the total growth ignores compounding: the second year grows on the first year’s higher base.' },
      { value: r1(((SB.rev24 / SB.rev22) ** (1 / 3) - 1) * 100), say: 'Fiscal 2022 to fiscal 2024 is two years of growth, not three.' },
    ],
    solution: `CAGR = (${fx(SB.rev24, 1)} ÷ ${fx(SB.rev22, 1)})^(1/2) − 1 = ${fx(SB.rev24 / SB.rev22, 4)}^0.5 − 1 = ${pc(sbCagr)} a year. The two years were uneven (${pc(R.growth(SB.rev23, SB.rev22))} then ${pc(sbRevGrowth)}), which a CAGR smooths over: report both.`,
  },
  {
    id: 'f03-fn-4', lesson: 'common-size-statements', type: 'steps', kind: 'numerical',
    prompt: 'Bellhouse Bike Hire, a fictional bike-hire and guided-tour business, sets out two full years of results below. Build its common-size income statement and read it against the dollar figures.',
    solution: `Common-size: each line ÷ that year’s revenue (<x>=B2/B$2</x> filled across and down). Operating margin ${pc(bbhOm[0])} → ${pc(bbhOm[1])}, a change of ${fx((bbhOm[1] - bbhOm[0]) * 100)} points, while operating income rose ${pc(bbhOi[1] / bbhOi[0] - 1)} in dollars. Gross margin rose (cost of rentals ${pc(bbhShare('rentals', 0))} → ${pc(bbhShare('rentals', 1))}), staff rose from ${pc(bbhShare('staff', 0))} to ${pc(bbhShare('staff', 1))} of revenue and marketing and booking fees from ${pc(bbhShare('marketing', 0))} to ${pc(bbhShare('marketing', 1))}: the fees took the margin down. Ask whether they bought the growth in revenue, and whether they will recur.`,
    steps: [
      {
        id: 'f03-fn-4-s1', type: 'formula',
        prompt: 'In D2, write a formula for revenue’s share of revenue that, filled across and down to E8, gives every line of both years as a share of that year’s revenue.',
        sheet: { cells: bbhCells }, cell: 'D2', fill: 'D2:E8', view: 'A1:E8',
        answer: '=B2/B$2', alt: ['=B2*1/B$2'],
        formats: { B: '#,##0', C: '#,##0', D: '0.0%', E: '0.0%' }, widths: { A: 26, D: 18, E: 18 },
        wrong: [
          { formula: '=B2/$B$2', say: 'Fixing the column divides 2027’s lines by 2026’s revenue. Fix only the row (B$2), so the base moves across with the year.' },
          { formula: '=B2/B2', say: 'Without a $ the base moves down with the line, so every cell shows 100%. Fix the row of the revenue line: B$2.' },
          { formula: '=B2/B$8', say: 'A common-size income statement divides by revenue, row 2, not by operating income.' },
        ],
      },
      {
        id: 'f03-fn-4-s2', type: 'num',
        prompt: 'By how many percentage points did the operating margin change from 2026 to 2027? Enter a fall as a negative number, to two decimal places.',
        answer: r2((bbhOm[1] - bbhOm[0]) * 100), check: () => (bbhOm[1] - bbhOm[0]) * 100, unit: 'points', places: 2, tol: 0.01,
        wrong: [
          { value: r2((bbhOi[1] / bbhOi[0] - 1) * 100), say: 'That is the percentage change in operating income in dollars. The margin is operating income ÷ revenue, and revenue grew faster.' },
          { value: r2((bbhOm[1] / bbhOm[0] - 1) * 100), say: 'That is the relative change in the margin. Percentage points are the difference between the two margins.' },
        ],
      },
      {
        id: 'f03-fn-4-s3', type: 'mc',
        prompt: 'Which line did most to change the operating margin?',
        options: ['Marketing and booking fees', 'Cost of rentals (bikes, repairs and mechanics)', 'Staff (front desk and tour guides)', 'Rent and other'],
        answer: 0,
        feedback: {
          1: `Cost of rentals fell from ${pc(bbhShare('rentals', 0))} to ${pc(bbhShare('rentals', 1))} of revenue: it lifted the margin.`,
          2: `Staff rose by ${fx((bbhShare('staff', 1) - bbhShare('staff', 0)) * 100, 1)} points of revenue; the fees rose by ${fx((bbhShare('marketing', 1) - bbhShare('marketing', 0)) * 100, 1)}.`,
          3: `Rent and other fell from ${pc(bbhShare('rent', 0))} to ${pc(bbhShare('rent', 1))}: a largely fixed cost spread over more revenue.`,
        },
      },
    ],
  },
  {
    id: 'f03-fn-5', lesson: 'common-size-statements', type: 'mc', kind: 'conceptual',
    prompt: `Starbucks prints no gross profit line. An analyst takes its fiscal 2024 total net revenues less “product and distribution costs”, ${pc(sbQuasiGross)} of revenues, and sets it beside Lantern’s 2027 gross margin of ${pc(PR27.grossMargin)}, concluding that Starbucks keeps far more of each sale. What is the main problem?`,
    options: [
      'The two cost lines hold different costs, so the margins are not measured on the same classification',
      'Starbucks is more than sixty thousand times Lantern’s size, so percentages of revenue can’t be compared',
      'Starbucks’ margin should be measured on company-operated store revenues only, since licensed stores have no product costs',
      'Lantern’s 2027 margin is flattered by the law firm’s unbilled fee, which has no cost of sales attached',
    ],
    answer: 0,
    feedback: {
      1: 'Common-size statements exist to remove scale. The problem is what each line contains, not the size of the totals.',
      2: 'Licensed stores buy product from Starbucks, so product costs belong to that revenue too; and dropping revenue lines doesn’t fix the classification difference.',
      3: 'The contract revenue does raise the margin a little, but the comparison fails before that: the two “cost of sales” lines aren’t built the same way.',
    },
    solution: `Margins compare only when the costs are classified alike. Starbucks’ store operating expenses (${pc(SB.storeOpex24 / SB.rev24)} of revenues) sit below its product and distribution costs, while Lantern puts its event baristas in cost of services (and its café staff in operating expenses). Compare at the operating margin (${pc(SB.opInc24 / SB.rev24)} against Lantern’s ${pc(PR27.operatingMargin)}), or rebuild both on one classification and say how.`,
  },

  // ================================================================ Module 2: liquidity, solvency and efficiency
  {
    id: 'f03-fn-6', lesson: 'liquidity', type: 'formula', kind: 'numerical',
    prompt: 'Bramblegate Dining Co., a fictional restaurant group, reports under US GAAP. In F2, calculate its quick ratio at 31 December 2027.',
    sheet: { cells: bgCells('Quick ratio, 31 Dec 2027') }, cell: 'F2', view: BG_VIEW,
    answer: '=(C2+C3+C4)/C15', alt: ['=SUM(C2:C4)/C15'],
    formats: { ...BG_FORMATS, F2: '0.00' }, widths: BG_WIDTHS,
    wrong: [
      { formula: '=C7/C15', say: 'That is the current ratio. The quick ratio keeps only cash, short-term investments and receivables.' },
      { formula: '=(C2+C3+C4+C5)/C15', say: 'Inventory is left out of the quick ratio: food and drink must be sold before it becomes cash.' },
      { formula: '=(C2+C4)/C15', say: 'Short-term investments are quick assets: include them with cash and receivables.' },
      { formula: '=(B2+B3+B4)/B15', say: 'Those are the 31 December 2026 figures, column B. Use column C.' },
    ],
    solution: `<x>=(C2+C3+C4)/C15</x> = (${BG.cash[1]} + ${BG.sti[1]} + ${BG.rec[1]}) ÷ ${fx(bgCL[1], 0)} = ${fx(bgQuick)}, down from ${fx(R.liquidity(bgPrev).quick)} a year earlier. A restaurant takes cash at the table and runs on supplier credit, so a low quick ratio is common; what matters is the trend and whether operating cash covers the current lease and debt payments.`,
  },
  {
    id: 'f03-fn-7', lesson: 'liquidity', type: 'steps', kind: 'applied',
    prompt: `Suppose Coastline’s 2028 loan to Lantern requires a current ratio of at least ${fx(COVENANT, 1)}, tested on the balance sheet. At 31 December 2027 Lantern had current assets of ${usd(P27.currentAssets)} and current liabilities of ${usd(P27.currentLiabilities)}, including ${usd(LEASE_CUR)} of operating lease liabilities due in 2028. Work out what it would take to meet the test on those figures.`,
    solution: `Cash raised from a long-term source adds to current assets only: ${usd(P27.currentAssets)} + x = ${fx(COVENANT, 1)} × ${usd(P27.currentLiabilities)}, so x = ${usd(needCash)}. If the agreement leaves the current lease liabilities out of the test, the target falls: ${fx(COVENANT, 1)} × (${usd(P27.currentLiabilities)} − ${usd(LEASE_CUR)}) − ${usd(P27.currentAssets)} = ${usd(needCashNoLease)}. The definition in the agreement matters as much as the balances. Using new cash to repay the line would help less: below a ratio of 1, paying down current liabilities with current assets lowers the ratio. Either route also needs the cash to stay in the business, so dividends would be restricted.`,
    steps: [
      {
        id: 'f03-fn-7-s1', type: 'num',
        prompt: 'How much new cash from a long-term source (new shares, or a loan repayable after 2028), kept in the bank, would lift the current ratio to the minimum? Enter whole dollars.',
        answer: Math.round(needCash), check: () => needCash, unit: '$', places: 0, tol: 1,
        wrong: [
          { value: Math.round(COVENANT * P27.currentLiabilities), say: 'That is the current assets the test needs in total. Subtract the current assets Lantern already has.' },
          { value: Math.round(P27.currentLiabilities - P27.currentAssets), say: 'That brings the ratio to 1.0 only. The test needs 1.2 times current liabilities.' },
        ],
      },
      {
        id: 'f03-fn-7-s2', type: 'num',
        prompt: `If instead the loan agreement defined current liabilities for the test without the ${usd(LEASE_CUR)} current portion of the operating lease liabilities, how much new long-term cash would be needed? Enter whole dollars.`,
        answer: Math.round(needCashNoLease), check: () => needCashNoLease, unit: '$', places: 0, tol: 1,
        wrong: [
          { value: Math.round(needCash - LEASE_CUR), say: 'Leaving the lease liabilities out lowers the target by 1.2 × that amount, not by the amount itself.' },
          { value: Math.round(COVENANT * (P27.currentLiabilities - LEASE_CUR)), say: 'That is the current assets needed in total; subtract the current assets already there.' },
        ],
      },
    ],
  },
  {
    id: 'f03-fn-8', lesson: 'solvency-and-leverage', type: 'classify', kind: 'conceptual',
    prompt: 'Lantern’s balance sheet at 31 December 2027 includes these liabilities. On this course’s conventions, place each one.',
    items: ['Line of Credit', 'Instalment Note Payable (the brewer plan)', 'Current Portion of Operating Lease Liabilities', 'Interest Payable', 'Unearned Revenue', 'Current Portion of Long-Term Debt', 'Operating Lease Liabilities (noncurrent)', 'Accounts Payable'],
    categories: ['Interest-bearing debt', 'Added only in lease-adjusted debt', 'Not debt'],
    answer: [0, 0, 1, 2, 2, 0, 1, 2],
    feedback: {
      1: 'Buying on the supplier’s instalment plan is borrowing: the plan carries interest at its implied rate, so it is debt like a bank loan.',
      2: 'Operating lease liabilities are added when debt is measured with leases, current and noncurrent parts alike.',
      3: 'Interest owed is a short-term accrual, not borrowing; the loans it relates to are already counted.',
      4: 'Unearned revenue is settled by delivering workshops, events and coffee, not by repaying money with interest.',
    },
    solution: `Interest-bearing debt: the current portion of long-term debt, the line of credit, notes payable and the instalment note, ${usd(sum(DEBT_LINES.map(b27)))} in all. Lease-adjusted debt adds the operating lease liabilities, ${usd(sum(LEASE_LINES.map(b27)))}. Payables, accruals and unearned revenue are operating liabilities: they count in total liabilities and the debt ratio, but not in debt.`,
  },
  {
    id: 'f03-fn-9', lesson: 'solvency-and-leverage', type: 'mc', kind: 'conceptual',
    prompt: `Lantern’s net debt ÷ EBITDA was ${fx(S26.netDebtToEbitda)} for 2026 (net debt ${usd(S26.netDebt)}, EBITDA ${usd(S26.ebitda)} for ten months) and ${fx(S27.netDebtToEbitda)} for 2027, before counting leases. What does the 2026 figure tell you?`,
    options: [
      'It held more cash than interest-bearing debt: it had net cash, not net debt',
      'Lantern’s EBITDA was negative in 2026, which turned the whole ratio negative',
      'The ratio is negative, so 2026 was the more indebted year and the business has since deleveraged',
      'A negative ratio has no meaning and should be reported as n/m, like a percentage change on a negative base',
    ],
    answer: 0,
    feedback: {
      1: `EBITDA was ${usd(S26.ebitda)}, positive. The numerator is negative: debt minus cash.`,
      2: 'The reverse: a negative figure means net cash. Net debt rose to positive in 2027, so leverage increased.',
      3: 'A negative net debt is meaningful: it is net cash. Report it as such (or as zero leverage) rather than as a multiple to compare with covenants.',
    },
    solution: `Net debt = ${usd(P26.debt)} of debt − ${usd(P26.cash)} of cash = ${usd(S26.netDebt)}: net cash. By the end of 2027 the cash had gone into the cafés and debt had risen to ${usd(P27.debt)}, so net debt was ${usd(S27.netDebt)}, ${fx(S27.netDebtToEbitda)} times EBITDA, and ${fx(S27L.netDebtToEbitda)} with the leases counted.`,
  },
  {
    id: 'f03-fn-10', lesson: 'solvency-and-leverage', type: 'steps', kind: 'applied',
    prompt: `A lender’s draft terms for Lantern cap net debt ÷ EBITDA at ${fx(LEV_CAP)}, with debt including operating lease liabilities and EBITDA adding back the operating lease cost. Lantern’s 2027 figures: current portion of long-term debt ${usd(b27('Current Portion of Long-Term Debt'))}; line of credit ${usd(LOC)}; notes payable ${usd(b27('Notes Payable'))}; instalment note ${usd(b27('Instalment Note Payable'))}; operating lease liabilities ${usd(b27(LEASE_LINES[0]))} current and ${usd(b27(LEASE_LINES[1]))} noncurrent; cash ${usd(P27.cash)}; operating income ${usd(P27.ebit)}; depreciation ${usd(P27.da)}; operating lease cost ${usd(P27.leaseCost)}.`,
    solution: `Lease-adjusted net debt = ${usd(S27.debt)} + ${usd(P27.leaseLiabilities)} − ${usd(P27.cash)} = ${usd(S27L.netDebt)}. Lease-adjusted EBITDA = ${usd(P27.ebit)} + ${usd(P27.da)} + ${usd(P27.leaseCost)} = ${usd(S27L.ebitda)}. Ratio = ${fx(S27L.netDebtToEbitda, 3)}, just above ${fx(LEV_CAP)}: the draft test would be failed on day one. Lantern should negotiate the level before signing, or reduce net debt (new equity, or retained cash) by about ${usd(S27L.netDebt - LEV_CAP * S27L.ebitda)}.`,
    steps: [
      {
        id: 'f03-fn-10-s1', type: 'num',
        prompt: 'What is Lantern’s lease-adjusted net debt? Enter whole dollars.',
        answer: Math.round(S27L.netDebt), check: () => S27L.netDebt, unit: '$', places: 0, tol: 0.5,
        wrong: [
          { value: Math.round(S27.netDebt), say: 'That leaves the leases out. The terms count operating lease liabilities, current and noncurrent, as debt.' },
          { value: Math.round(S27L.debt), say: 'That is gross debt. Net debt subtracts the cash.' },
          { value: Math.round(S27L.netDebt - b27(LEASE_LINES[0])), say: 'The current portion of the lease liabilities is debt too.' },
        ],
      },
      {
        id: 'f03-fn-10-s2', type: 'num',
        prompt: 'What is the ratio the terms define? Give two decimal places.',
        answer: r2(S27L.netDebtToEbitda), check: () => S27L.netDebtToEbitda, unit: '', places: 2, tol: 0.005,
        wrong: [
          { value: r2(S27L.netDebt / (P27.ebit + P27.da)), say: 'Counting leases as debt means adding the lease cost back to EBITDA too, or the ratio counts the leases twice.' },
          { value: r2(S27.netDebtToEbitda), say: 'That is the ratio without leases, on both lines.' },
        ],
      },
      {
        id: 'f03-fn-10-s3', type: 'mc',
        prompt: `How should Lantern’s adviser read the result against the ${fx(LEV_CAP)} cap?`,
        options: [
          'Lantern would fail it narrowly from the start, so the level or the definition must be negotiated before signing',
          'Lantern meets it comfortably, because its ratio without leases, the figure most banks quote, is less than half the cap',
          'The test can’t apply to Lantern, because operating leases are not debt under US GAAP',
          'Lantern meets it, because its interest coverage of more than ten times shows it can service any debt',
        ],
        answer: 0,
        feedback: {
          1: 'The terms define debt to include the leases; the unadjusted ratio is not the one tested.',
          2: 'A covenant applies whatever the accounting classification, once the contract defines its terms; here the definition includes leases.',
          3: 'Coverage on reported interest leaves out the interest inside the lease cost, and a covenant tests its own ratio, not a different one.',
        },
      },
    ],
  },
  {
    id: 'f03-fn-11', lesson: 'efficiency-and-working-capital', type: 'formula', kind: 'numerical',
    prompt: 'Bramblegate’s diners pay at the table; only corporate events are invoiced, on 30-day terms. In F2, calculate its 2027 receivables days (DSO), using 365 days and the course’s conventions.',
    sheet: { cells: bgCells('Receivables days, 2027') }, cell: 'F2', view: BG_VIEW,
    answer: '=AVERAGE(B4:C4)/C24*365', alt: ['=(B4+C4)/2/C24*365', '=365/(C24/AVERAGE(B4:C4))', '=AVERAGE(B4,C4)*365/C24'],
    formats: { ...BG_FORMATS, F2: '0.0' }, widths: BG_WIDTHS,
    wrong: [
      { formula: '=AVERAGE(B4:C4)/C23*365', say: 'That divides by all revenue, most of it paid at the table. Only invoiced sales pass through receivables: use row 24.' },
      { formula: '=C4/C24*365', say: 'That uses closing receivables. The opening balance sheet exists, so average the two.' },
      { formula: '=C24/AVERAGE(B4:C4)', say: 'That is the receivables turnover. Days = 365 ÷ turnover.' },
    ],
    solution: `<x>=AVERAGE(B4:C4)/C24*365</x> = ${fx(avg2(BG.rec[0], BG.rec[1]), 0)} ÷ ${fx(BG.invoiced, 0)} × 365 = ${fx(bgDso, 1)} days, against 30-day terms. On total revenue the figure would be ${fx(bgDsoAll, 1)} days, which hides slow-paying corporate clients.`,
  },
  {
    id: 'f03-fn-12', lesson: 'efficiency-and-working-capital', type: 'num', kind: 'numerical',
    prompt: `Ottercombe Wholesale, a fictional food distributor, sells ${usd(OW.creditSales)} a year on credit, with cost of goods sold of ${usd(OW.cogs)}. Its receivables days are ${OW.dso}, inventory days ${OW.dio} and payables days ${OW.dpo} (payables on cost of goods sold, which equals its purchases). If sales and costs both grow ${pc(OW.growth, 0)} next year and the three day counts stay the same, how much extra cash will its working capital absorb? Use 365 days and enter whole dollars.`,
    answer: Math.round(owNeed), check: () => owNeed, unit: '$', places: 0, tol: 1,
    wrong: [
      { value: Math.round(owRec * OW.growth), say: 'That is the extra receivables only. Inventory grows too, and supplier credit pays for part of it.' },
      { value: Math.round((owRec + owInv) * OW.growth), say: 'Payables grow as well: suppliers finance part of the extra stock, so subtract their growth.' },
      { value: Math.round((owRec + owInv - owPay) * (1 + OW.growth)), say: 'That is the whole working capital after growth. The cash absorbed is the increase.' },
    ],
    solution: `Receivables = ${usd(OW.creditSales)} ÷ 365 × ${OW.dso} = ${usd(owRec)}; inventory = ${usd(OW.cogs)} ÷ 365 × ${OW.dio} = ${usd(owInv)}; payables = ${usd(OW.cogs)} ÷ 365 × ${OW.dpo} = ${usd(owPay)}. Working capital tied up = ${usd(owRec + owInv - owPay)}; ${pc(OW.growth, 0)} growth with the same days adds ${usd(owNeed)}, which comes out of cash from operations even if profit rises. Profitable growth can still drain cash.`,
  },

  // ================================================================ Module 3: returns
  {
    id: 'f03-fn-13', lesson: 'return-on-assets-and-equity', type: 'formula', kind: 'numerical',
    prompt: 'In F2, calculate Bramblegate’s 2027 return on equity on the course’s convention for a year with an opening balance sheet.',
    sheet: { cells: bgCells('Return on equity, 2027') }, cell: 'F2', view: BG_VIEW,
    answer: '=C32/AVERAGE(B19:C19)', alt: ['=C32/((B19+C19)/2)'],
    formats: { ...BG_FORMATS, F2: '0.0%' }, widths: BG_WIDTHS,
    wrong: [
      { formula: '=C32/C19', say: 'That divides by closing equity. With an opening balance sheet, divide by the average of the two year ends.' },
      { formula: '=C32/AVERAGE(B10:C10)', say: 'That is the return on average total assets. ROE divides net income by the owners’ equity.' },
      { formula: '=C30/AVERAGE(B19:C19)', say: 'Return on equity uses net income, after interest and tax (row 32).' },
    ],
    solution: `<x>=C32/AVERAGE(B19:C19)</x> = ${fx(bgNi, 0)} ÷ ${fx(avg2(BG.equity[0], BG.equity[1]), 0)} = ${pc(bgRoe)}, against a return on average assets of ${pc(bgDup.roa)}: most of the gap is leverage, much of it from the leases.`,
  },
  {
    id: 'f03-fn-14', lesson: 'return-on-assets-and-equity', type: 'multi', kind: 'conceptual',
    prompt: `Lantern’s return on equity was ${pc(PR26.roe)} for 2026 (ten months, on closing equity) and ${pc(PR27.roe)} for 2027 (on average equity). Before telling Ana that her return fell, which adjustments or caveats should an analyst make? Select all that apply.`,
    options: [
      'State that 2026 uses closing equity and 2027 the average, or put both on one basis',
      'Annualise 2026’s net income, or compare like periods, since 2026 covers ten months',
      'Charge 2026 with a market salary for Ana’s work, since she was paid only in dividends',
      'Annualise 2026’s closing equity as well as its net income',
      'Take the café lease cost out of 2027’s net income, since 2026 had no leases',
      'Add 2027’s dividends back to equity, since they were paid out of that year’s profit',
      'Use 2026’s closing equity as the denominator for both years, to keep the base fixed',
    ],
    answer: [0, 1, 2],
    feedback: {
      3: 'Equity is a balance at a date, not a flow: stocks are never annualised.',
      4: 'The lease cost is a real cost of running the cafés. Removing it would overstate 2027’s profit.',
      5: 'Dividends are a distribution of profit already counted in net income; equity is measured after them.',
      6: 'Each year’s profit belongs with the equity employed in that year, not with a fixed earlier balance.',
    },
    solution: `Three things break comparability: the bases (closing against average), the period (ten months against twelve) and the owner’s pay (none in 2026, ${usd(FACTS.wages.ana)} in 2027). Balances are never annualised, real costs stay in, and each year is measured on its own equity.`,
  },
  {
    id: 'f03-fn-15', lesson: 'dupont-analysis', type: 'steps', kind: 'applied',
    prompt: 'Use Bramblegate’s statements to see how much of its leverage comes from its leases.',
    solution: `Equity multiplier = average total assets ÷ average equity = ${fx(avg2(bgTA[0], bgTA[1]), 0)} ÷ ${fx(avg2(BG.equity[0], BG.equity[1]), 0)} = ${fx(bgDup.equityMultiplier)}. Without the right-of-use assets and the lease liabilities, average assets are ${fx(avg2(bgTA[0] - BG.rou[0], bgTA[1] - BG.rou[1]), 0)} and the multiplier ${fx(bgEmNoLease)}. ROE = ${pc(bgDup.netMargin, 2)} × ${fx(bgDup.assetTurnover)} × ${fx(bgDup.equityMultiplier)} = ${pc(bgDup.roe)}: the leases lower the turnover and raise the multiplier, so most of the “leverage” in its ROE is rented premises.`,
    steps: [
      {
        id: 'f03-fn-15-s1', type: 'formula',
        prompt: 'In F2, calculate the 2027 equity multiplier on average balances, as the three-step DuPont analysis uses it.',
        sheet: { cells: bgCells('Equity multiplier, 2027') }, cell: 'F2', view: BG_VIEW,
        answer: '=AVERAGE(B10:C10)/AVERAGE(B19:C19)', alt: ['=(B10+C10)/(B19+C19)'],
        formats: { ...BG_FORMATS, F2: '0.00' }, widths: BG_WIDTHS,
        wrong: [
          { formula: '=C10/C19', say: 'That uses closing balances. DuPont keeps every factor on the same averages, so the product equals ROE.' },
          { formula: '=AVERAGE(B18:C18)/AVERAGE(B19:C19)', say: 'That is liabilities to equity. The equity multiplier is assets ÷ equity, one more than that.' },
          { formula: '=AVERAGE(B19:C19)/AVERAGE(B10:C10)', say: 'Upside down: that is equity’s share of assets.' },
        ],
      },
      {
        id: 'f03-fn-15-s2', type: 'num',
        prompt: 'What would the 2027 equity multiplier be without the right-of-use assets and the lease liabilities, on average balances? Give two decimal places.',
        answer: r2(bgEmNoLease), check: () => bgEmNoLease, unit: '', places: 2, tol: 0.005,
        wrong: [
          { value: r2(bgDup.equityMultiplier), say: 'That still includes the right-of-use assets. Take them out of total assets in both years.' },
          { value: r2(avg2(bgTA[0], bgTA[1] - BG.rou[1]) / avg2(BG.equity[0], BG.equity[1])), say: 'There were leases at the end of 2026 too: remove the right-of-use assets from both year ends before averaging.' },
        ],
      },
      {
        id: 'f03-fn-15-s3', type: 'mc',
        prompt: 'What does the comparison tell an analyst about Bramblegate’s return on equity?',
        options: [
          'Much of its leverage is rented premises: compare it with peers that report their leases the same way',
          'Its leases make it less risky than its multiplier suggests, so the multiplier should be ignored in the analysis',
          'Its ROE would be higher without the leases, because the equity multiplier would fall',
          'The leases change only the balance sheet, so they have no effect on any DuPont factor',
        ],
        answer: 0,
        feedback: {
          1: 'Lease payments are fixed obligations, much like debt service; the multiplier is right to count them. The point is to compare like with like.',
          2: 'ROE is net income ÷ equity, and removing the leases changes neither: the lower multiplier is offset by a higher asset turnover.',
          3: 'The right-of-use assets lower asset turnover and raise the equity multiplier, two of the three factors.',
        },
      },
    ],
  },
  {
    id: 'f03-fn-16', lesson: 'dupont-analysis', type: 'num', kind: 'applied',
    prompt: `Lantern’s 2027 three-step DuPont factors, on average balances, were a net margin of ${pc(D27.netMargin, 2)}, an asset turnover of ${fx(D27.assetTurnover)} and an equity multiplier of ${fx(D27.equityMultiplier)} (ROE ${pc(D27.roe)}). Its 2026 equity multiplier, on closing balances, was ${fx(D26.equityMultiplier)}. With 2027’s margin and turnover but 2026’s leverage, what would its 2027 return on equity have been? Enter a percentage to one decimal place.`,
    answer: r1(roeOn26Leverage * 100), check: () => roeOn26Leverage * 100, unit: '%', places: 1, tol: 0.1,
    wrong: [
      { value: r1(D27.roe * 100), say: 'That is the actual 2027 ROE. Replace the 2027 equity multiplier with 2026’s.' },
      { value: r1(D27.roa * 100), say: 'That is the return on assets (margin × turnover). Multiply by 2026’s equity multiplier.' },
      { value: r1(D26.roe * 100), say: 'That is 2026’s ROE. Keep 2027’s margin and turnover.' },
    ],
    solution: `${pc(D27.netMargin, 2)} × ${fx(D27.assetTurnover)} × ${fx(D26.equityMultiplier)} = ${pc(roeOn26Leverage)}, against ${pc(D27.roe)} reported: about ${fx((D27.roe - roeOn26Leverage) * 100, 1)} points of 2027’s ROE come from the extra leverage, mostly the lease liabilities. It is a rough split: more debt also brings more interest, which the margin already reflects, and 2026’s multiplier is on closing balances.`,
  },
  {
    id: 'f03-fn-17', lesson: 'dupont-analysis', type: 'mc', kind: 'conceptual',
    prompt: `Feldspar Labs Inc., a fictional company, reports five-step DuPont factors (tax burden, interest burden, EBIT margin, asset turnover, equity multiplier) of ${FL.y26.map((x) => fx(x)).join(', ')} for 2026 and ${FL.y27.map((x) => fx(x)).join(', ')} for 2027. Its return on equity rose from ${pc(flRoe(FL.y26))} to ${pc(flRoe(FL.y27))}. What is the most likely explanation?`,
    options: [
      'A tax benefit larger than the year’s tax expense lifted net income above income before tax, and it is unlikely to recur',
      'Its operations improved: a higher return on equity with a lower EBIT margin shows better use of assets',
      'Interest income exceeded interest expense, so financing added to its profit before tax',
      'A tax burden above 1 is impossible, so the 2027 figures must contain an arithmetic error',
    ],
    answer: 0,
    feedback: {
      1: `The operating factors weakened (EBIT margin ${pc(FL.y26[2], 0)} → ${pc(FL.y27[2], 0)}); turnover rose only slightly. The rise in ROE comes from the tax line.`,
      2: 'That would push the interest burden above 1. The interest burden barely moved; the tax burden is the factor above 1.',
      3: 'Net income ÷ income before tax exceeds 1 whenever the tax line is a credit, for example when a valuation allowance is released.',
    },
    solution: `Tax burden = net income ÷ income before tax = ${fx(FL.y27[0])}: net income exceeded income before tax, so the tax line was a credit. Without it (tax burden back to ${fx(FL.y26[0])}), 2027’s ROE would have been ${pc(flRoe([FL.y26[0], ...FL.y27.slice(1)]))}, below 2026’s. Read the tax note before treating the rise as lasting; DuPont shows where a change sits, not whether it will repeat.`,
  },

  // ================================================================ Module 4: judging financial health
  {
    id: 'f03-fn-18', lesson: 'cash-flow-and-earnings-quality', type: 'num', kind: 'applied',
    prompt: `Starbucks’ fiscal 2024 statement of cash flows shows net cash provided by operating activities of $${fx(SB.cfo24, 1)} million, additions to property, plant and equipment of $${fx(SB.capex24, 1)} million, cash dividends paid of $${fx(SB.dividends24, 1)} million and repurchases of common stock of $${fx(SB.buybacks24, 1)} million. By how much did the cash paid to shareholders exceed free cash flow (operating cash flow less capital expenditure)? Enter $ millions to one decimal place.`,
    answer: r1(sbPayout - sbFcf), check: () => sbPayout - sbFcf, unit: '$ millions', places: 1, tol: 0.05,
    wrong: [
      { value: r1(sbPayout - SB.cfo24), say: 'Free cash flow subtracts capital expenditure from operating cash flow first; payouts are then compared with what is left.' },
      { value: r1(sbFcf), say: 'That is free cash flow itself. Compare it with dividends plus buybacks.' },
      { value: r1(SB.dividends24 - sbFcf), say: 'Repurchases of stock are cash paid to shareholders too.' },
    ],
    solution: `Free cash flow = ${fx(SB.cfo24, 1)} − ${fx(SB.capex24, 1)} = ${fx(sbFcf, 1)}; payouts = ${fx(SB.dividends24, 1)} + ${fx(SB.buybacks24, 1)} = ${fx(sbPayout, 1)}; excess ${m1(sbPayout - sbFcf)}, met from borrowing or cash (long-term debt rose from $${fx(SB.ltd23, 1)} million to $${fx(SB.ltd24, 1)} million, and cash fell). Paying out more than is earned over many years is how equity becomes a deficit: here the payouts also exceeded net earnings of $${fx(SB.netEarnings24, 1)} million.`,
  },
  {
    id: 'f03-fn-19', lesson: 'cash-flow-and-earnings-quality', type: 'steps', kind: 'applied',
    prompt: `Nethercote Signs, a fictional private sign maker and installer, reports for 2027 (in $ thousands): net income ${NS.netIncome}; net cash from operating activities ${NS.cfo}; total assets ${fx(NS.taOpen, 0)} on 1 January and ${fx(NS.totalAssets, 0)} on 31 December. At 31 December: current assets ${fx(NS.currentAssets, 0)}; current liabilities ${fx(NS.currentLiabilities, 0)}; total liabilities ${fx(NS.totalLiabilities, 0)}; retained earnings ${NS.retainedEarnings}; book equity ${fx(NS.equity, 0)}. EBIT was ${NS.ebit}. Revenue grew ${pc(NS.revGrowth, 0)} and receivables ${pc(NS.recGrowth, 0)}.`,
    solution: `Accruals ratio = (${NS.netIncome} − ${NS.cfo}) ÷ ${fx(avg2(NS.taOpen, NS.totalAssets), 0)} = ${pc(nsAccr)}: less than a quarter of profit arrived as cash, and receivables grew five times as fast as revenue. Z″ = ${fx(nsZ.terms[0], 3)} + ${fx(nsZ.terms[1], 3)} + ${fx(nsZ.terms[2], 3)} + ${fx(nsZ.terms[3], 3)} = ${fx(nsZ.score)}, in the grey zone (${fx(R.ALTMAN.zdouble.zones[0])}–${fx(R.ALTMAN.zdouble.zones[1])}, Altman’s 4.35 and 5.85 for Z″ with its +3.25 constant, less 3.25). The score uses EBIT and retained earnings as reported, so it inherits the doubtful profit; the receivables are inside its working capital. Read it as a ceiling, and test the receivables (aging, subsequent collections) before relying on either.`,
    steps: [
      {
        id: 'f03-fn-19-s1', type: 'num',
        prompt: 'What is its accruals ratio? Enter a percentage to one decimal place.',
        answer: r1(nsAccr * 100), check: () => nsAccr * 100, unit: '%', places: 1, tol: 0.06,
        wrong: [
          { value: r1((NS.netIncome - NS.cfo) / NS.totalAssets * 100), say: 'That uses closing total assets. Use the average of opening and closing.' },
          { value: r1(-nsAccr * 100), say: 'Accruals are net income minus operating cash; profit is the larger here, so the ratio is positive.' },
        ],
      },
      {
        id: 'f03-fn-19-s2', type: 'num',
        prompt: 'What is its Altman Z″ at 31 December 2027? Give two decimal places.',
        answer: r2(nsZ.score), check: () => nsZ.score, unit: '', places: 2, tol: 0.01,
        wrong: [
          { value: r2(nsZ.score - R.ALTMAN.zdouble.w[3] * nsZ.x[3] + R.ALTMAN.zdouble.w[3] * NS.equity / NS.totalAssets), say: 'X₄ is book equity ÷ total liabilities, not ÷ total assets.' },
          { value: r2(nsZ.score - R.ALTMAN.zdouble.w[0] * nsZ.x[0] + R.ALTMAN.zdouble.w[0] * NS.currentAssets / NS.totalAssets), say: 'X₁ is working capital ÷ total assets: subtract current liabilities first.' },
        ],
      },
      {
        id: 'f03-fn-19-s3', type: 'mc',
        prompt: 'How should a lender combine the two results?',
        options: [
          'Treat the score as a ceiling: it rests on the same accrual-heavy profit',
          'Rely on the score, since a balance-sheet model is not affected by the accruals that weaken the cash flow',
          'Recompute Z″ with operating cash flow in place of EBIT and use that as the true score',
          'Set both aside: when two measures disagree, neither can tell the lender anything about the business',
        ],
        answer: 0,
        feedback: {
          1: 'Z″ uses EBIT and retained earnings, both built from the same profit, and receivables sit inside its working capital.',
          2: 'Altman’s weights were estimated on EBIT; swapping in another figure gives a number with no zones to read it against.',
          3: 'They don’t really disagree: the score is middling and the cash flow explains why it may be generous. Each is evidence to weigh.',
        },
      },
    ],
  },
  {
    id: 'f03-fn-20', lesson: 'cash-flow-and-earnings-quality', type: 'num', kind: 'numerical',
    prompt: `Enron’s Form 8-K of 8 November 2001 restated its net income for 1997 to 2000 (in $ millions) from ${ENRON.reported.join(', ')} as reported to ${ENRON.restated.join(', ')} restated. By what percentage did the restatement reduce its combined net income for the four years? Enter a percentage to one decimal place.`,
    answer: r1(enronCut / sum(ENRON.reported) * 100), check: () => enronCut / sum(ENRON.reported) * 100, unit: '%', places: 1, tol: 0.05,
    wrong: [
      { value: r1(enronCut / sum(ENRON.restated) * 100), say: 'That divides by the restated total. A reduction is measured on what was reported.' },
      { value: r1((ENRON.reported[0] - ENRON.restated[0]) / ENRON.reported[0] * 100), say: 'That is 1997 alone. Add the four years first.' },
      { value: r1(sum(ENRON.reported.map((x, i) => (x - ENRON.restated[i]) / x)) / 4 * 100), say: 'That averages four yearly percentages, which gives tiny 1997 as much weight as 2000. Compare the four-year totals.' },
    ],
    solution: `Reported total ${fx(sum(ENRON.reported), 0)}; restated ${fx(sum(ENRON.restated), 0)}; reduction ${fx(enronCut, 0)}, or ${pc(enronCut / sum(ENRON.reported))}. The 8-K gives the main reason as entities (Chewco, JEDI and an LJM1 subsidiary) that should have been consolidated; consolidating them also added debt in each year. A lesson for reading filings: off-balance-sheet entities and related parties belong on the red-flag list.`,
  },
  {
    id: 'f03-fn-21', lesson: 'distress-scores', type: 'num', kind: 'numerical',
    prompt: `Peverell Cafés, a fictional private café chain, has (in $ thousands) current assets ${PCF.currentAssets}, current liabilities ${PCF.currentLiabilities}, total assets ${fx(PCF.totalAssets, 0)}, total liabilities ${PCF.totalLiabilities}, retained earnings ${PCF.retainedEarnings}, book equity ${PCF.equity} and EBIT ${PCF.ebit}. On 31 December it signs a five-year operating lease for a new café opening in the spring, recording a right-of-use asset and a lease liability of ${PCF_LEASE.total}, of which ${PCF_LEASE.current} falls due within a year. By how much does the lease lower its Altman Z″? Enter the fall as a positive number, to two decimal places.`,
    answer: r2(pcfZ0.score - pcfZ1.score), check: () => pcfZ0.score - pcfZ1.score, unit: '', places: 2, tol: 0.01,
    wrong: [
      { value: r2(pcfZ0.score - pcfNoCurrent.score), say: 'The part of the lease liability due within a year is a current liability: it lowers working capital as well.' },
      { value: r2(pcfZ0.score - pcfOnlyLiab.score), say: 'The right-of-use asset adds to total assets, the denominator of X₁, X₂ and X₃, so those ratios fall too.' },
      { value: r2(pcfZ1.score), say: 'That is the score after the lease. The question asks how far it falls.' },
    ],
    solution: `Before: Z″ = ${pcfZ0.terms.map((t) => fx(t, 3)).join(' + ')} = ${fx(pcfZ0.score)}. After: total assets ${fx(pcfAfter.totalAssets, 0)}, current liabilities ${pcfAfter.currentLiabilities}, total liabilities ${fx(pcfAfter.totalLiabilities, 0)}, so Z″ = ${pcfZ1.terms.map((t) => fx(t, 3)).join(' + ')} = ${fx(pcfZ1.score)}, a fall of ${fx(pcfZ0.score - pcfZ1.score)} from the grey zone (${fx(R.ALTMAN.zdouble.zones[0])}–${fx(R.ALTMAN.zdouble.zones[1])}, Altman’s 4.35 and 5.85 for Z″ with its +3.25 constant, less 3.25) towards distress, with nothing yet earned or paid. Every term falls: working capital, the asset base and the equity cushion. That is why a score fitted on pre-2019 balance sheets reads lease-heavy businesses harshly.`,
  },
  {
    id: 'f03-fn-22', lesson: 'distress-scores', type: 'mc', kind: 'conceptual',
    prompt: `An analyst runs Altman’s original Z on Lantern’s 2027 statements, using book equity in place of the market value it needs, and gets ${fx(Zorig.score)}, in the grey zone. Lantern’s Z″ is ${fx(Z27.score)}, in the distress zone. What mainly explains the gap?`,
    options: [
      `The sales ÷ total assets term, which adds ${fx(Zorig.terms[4])} to the original Z and which Z″ leaves out`,
      'Book equity in place of the market value of equity, which the original model needs for X₄',
      'Z″ gives EBIT ÷ total assets a far larger weight than the original model, and Lantern’s EBIT fell',
      'The original Z puts no weight on working capital, which is negative for Lantern',
    ],
    answer: 0,
    feedback: {
      1: `With book equity the X₄ term is ${fx(Zorig.terms[3])} in the original Z and ${fx(Z27.terms[3])} in Z″: a small part of the gap. Using a value the model wasn’t fitted on is a further reason not to use it.`,
      2: `Z″’s weight on X₃ is larger (${R.ALTMAN.zdouble.w[2]} against ${R.ALTMAN.z.w[2]}), which raises Lantern’s Z″, not lowers it.`,
      3: `The original Z weights X₁ by ${R.ALTMAN.z.w[0]}; Z″ by ${R.ALTMAN.zdouble.w[0]}, so negative working capital costs more in Z″ (${fx(Z27.terms[0])} against ${fx(Zorig.terms[0])}), but that is not the main difference.`,
    },
    solution: `Original Z terms: ${Zorig.terms.map((t) => fx(t)).join(' + ')} = ${fx(Zorig.score)}. The turnover term alone is ${fx(Zorig.terms[4])}: Lantern sells ${fx(Zorig.x[4])} times its assets a year, as cafés and shops do whatever their risk. Altman dropped the term from Z″ to remove that industry effect, and the original model was fitted on public manufacturers anyway. For a private service business Z″ is the model to use.`,
  },
  {
    id: 'f03-fn-23', lesson: 'benchmarking-and-annual-reports', type: 'num', kind: 'numerical',
    prompt: `Starbucks’ fiscal 2024 Form 10-K shows total net revenues of $${fx(SB.rev24, 1)} million and operating income of $${fx(SB.opInc24, 1)} million. Its income statement has a depreciation and amortization line of $${fx(SB.daIS24, 1)} million; the cash-flow statement adds back depreciation and amortization of $${fx(SB.daCF24, 1)} million, because some is recorded within other cost lines. What is its EBITDA margin (operating income plus all depreciation and amortization, over revenues)? Enter a percentage to one decimal place.`,
    answer: r1(sbEbitdaMargin * 100), check: () => sbEbitdaMargin * 100, unit: '%', places: 1, tol: 0.06,
    wrong: [
      { value: r1(sbEbitdaMarginIS * 100), say: 'That adds back only the income-statement line, which leaves out the depreciation recorded in other cost lines. Use the cash-flow add-back, the total.' },
      { value: r1(SB.opInc24 / SB.rev24 * 100), say: 'That is the operating margin. EBITDA adds depreciation and amortization back.' },
    ],
    solution: `EBITDA = ${fx(SB.opInc24, 1)} + ${fx(SB.daCF24, 1)} = ${fx(SB.opInc24 + SB.daCF24, 1)}; margin = ${pc(sbEbitdaMargin)} (${pc(sbEbitdaMarginIS)} with the income-statement line). EBITDA is not a GAAP measure, so state the definition: which D&A, and that operating income here includes $301.2 million of income from equity investees. Under US GAAP its operating lease cost stays inside the margin.`,
  },
  {
    id: 'f03-fn-24', lesson: 'benchmarking-and-annual-reports', type: 'mc', kind: 'applied',
    prompt: `Amazon’s 2014 Form 10-K reports free cash flow of $${AMZN.fcf14.toLocaleString('en-US')} million, which it defines as net cash provided by operating activities less purchases of property and equipment (${AMZN.cfo14.toLocaleString('en-US')} − ${AMZN.capex14.toLocaleString('en-US')}). For a 2014–2023 comparison, a colleague takes the same two lines from the 2023 cash-flow statement and gets $${(AMZN.cfo23 - AMZN.capex23).toLocaleString('en-US')} million. What should the analyst do before using the comparison?`,
    options: [
      'Read the 2023 filing’s own definition and apply one definition to both years',
      'Use it as it stands, because free cash flow is defined by US GAAP and every filing computes it the same way',
      'Replace both figures with net income, which is audited and so comparable from one year to another',
      'Check the auditor’s report, which confirms each non-GAAP measure that management reports in the 10-K',
    ],
    answer: 0,
    feedback: {
      1: 'Free cash flow is a non-GAAP measure: each company defines it, and the definition can change. Amazon’s results release for the first quarter of 2024 reduces cash from operations by purchases of property and equipment net of proceeds from sales and incentives.',
      2: 'Net income answers a different question; the point of free cash flow is the cash left after investment.',
      3: 'The audit opinion covers the financial statements; non-GAAP measures in the MD&A or Item 6 are management’s and are not covered by it.',
    },
    solution: `A non-GAAP measure must be reconciled to the nearest GAAP figure, but the company chooses its definition and can change it. Until the 2023 10-K’s own definition has been read, $${(AMZN.cfo23 - AMZN.capex23).toLocaleString('en-US')} million is the 2014 definition applied to 2023, not a figure Amazon reported. State the definition used, apply it to both years, and cite where each figure comes from.`,
  },
];
