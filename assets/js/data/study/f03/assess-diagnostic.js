// assess-diagnostic.js — F03 course diagnostic: three items per module, each written so that it needs that module’s own
// method, not what F00 and F02 already teach (preparing the statements, the current ratio and working capital, the
// cash-flow statement) or F04 (the time value of money), so that a student who knows only those courses misses a
// module’s items and one who already has the module’s method gets them right.
// Module 1: a change read from base-year index numbers (a percentage, not index points); a gross margin restated onto a
// rival’s classification of crew wages; which line of a comparative statement is material (dollars against operating
// income, not the largest percentage).
// Module 2: a quick ratio that leaves out a contract asset and prepaid expenses; net debt ÷ EBITDA on interest-bearing
// debt only; receivables days on credit sales and average receivables.
// Module 3: return on average equity; reading a three-step DuPont split behind an unchanged ROE; the interest burden
// implied by an interest coverage ratio.
// Module 4: the accruals ratio on average total assets; Altman’s Z″ from a balance sheet when only the weights are given
// (the student must know the four ratios); where in a Form 10-K unbilled revenue and its judgements are explained.
// Modules 1–3 use only mc and num items, which score 0 or 1, so the route below can’t be passed on part marks; module 4
// is not used for routing. Every business is fictional and appears nowhere else on the site; nothing comes from the
// project (Brightwater, Harbour Credit Union). New questions, not copies of lesson exercises or module-test items.
// No hints; solutions are shown on review. Every num item’s `check` recomputes its answer from the inputs below.
import * as R from '../../../core/ratios.js?v=18';

const fx = (v, d = 2) => v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
const usd = (v) => `${v < 0 ? '−' : ''}$${Math.abs(Math.round(v)).toLocaleString('en-US')}`;
const pc = (v, d = 1) => `${v < 0 ? '−' : ''}${fx(Math.abs(v) * 100, d)}%`;

// ---------------------------------------------------------------- module 1
// Thrushcombe Aquarium (fictional): operating expenses as index numbers, 2023 = 100
const AQ = { i2026: 128, i2027: 144 };
const aqChange = AQ.i2027 / AQ.i2026 - 1;
// Quillan Removals (fictional): crews’ wages sit in its cost of sales; its rival puts them in operating expenses
const QR = { revenue: 900_000, costOfSales: 558_000, crewWages: 207_000, rivalMargin: 0.58 };
const qrReported = (QR.revenue - QR.costOfSales) / QR.revenue;
const qrRestated = (QR.revenue - (QR.costOfSales - QR.crewWages)) / QR.revenue;
// Vellacott Garden Tools (fictional): four lines of a comparative income statement
const VG = { revenue: 4_800_000, operatingIncome: 360_000,
  lines: { legal: [2_000, 9_000], cos: [2_900_000, 3_074_000], ads: [50_000, 40_000], badDebt: [1_000, 3_000] } };
const vgCh = (key) => VG.lines[key][1] - VG.lines[key][0];
const vgPct = (key) => vgCh(key) / VG.lines[key][0];

// ---------------------------------------------------------------- module 2
// Westray Architects (fictional): current assets at the year end
const WA = { cash: 64_000, shortTermInvestments: 30_000, receivables: 118_000, contractAssets: 86_000, prepaid: 12_000, currentLiabilities: 200_000 };
const waCA = WA.cash + WA.shortTermInvestments + WA.receivables + WA.contractAssets + WA.prepaid;
const waQuick = R.liquidity({ ...WA, currentAssets: waCA }).quick;
// Gallowmere Cold Stores (fictional), $ millions
const GC = { ebit: 2.4, da: 1.1, loanCurrent: 1.2, loanNoncurrent: 8.6, payables: 1.5, cash: 0.7 };
const gcDebt = GC.loanCurrent + GC.loanNoncurrent;
const gcRatio = R.solvency({ ebit: GC.ebit, da: GC.da, debt: gcDebt, cash: GC.cash }).netDebtToEbitda;
// Pennistone Veterinary Clinic (fictional): most fees are paid at the desk; farms and insurers are invoiced
const PV = { revenue: 1_800_000, invoiced: 292_000, recOpen: 34_000, recClose: 46_000 };
const pvDso = R.efficiency({ revenue: PV.invoiced, receivables: PV.recClose }, { receivables: PV.recOpen }).dso;

// ---------------------------------------------------------------- module 3
// Crannoch Opticians (fictional)
const CO = { netIncome: 84_000, eqOpen: 240_000, eqClose: 320_000, taOpen: 610_000, taClose: 790_000 };
const coRoe = R.profitability({ netIncome: CO.netIncome, equity: CO.eqClose, totalAssets: CO.taClose }, { equity: CO.eqOpen, totalAssets: CO.taOpen }).roe;
// Sorrelby Hotels (fictional): three-step DuPont factors, on average balances
const SH = { y26: { margin: 0.10, turnover: 0.75, multiplier: 2.0 }, y27: { margin: 0.0625, turnover: 0.80, multiplier: 3.0 } };
const shRoe = (y) => y.margin * y.turnover * y.multiplier;
// Wyndlow Haulage (fictional): interest coverage (EBIT ÷ interest expense)
const WH = { coverage: 5 };
const whBurden = 1 - 1 / WH.coverage;                       // income before tax ÷ EBIT = (EBIT − interest) ÷ EBIT

// ---------------------------------------------------------------- module 4
// Ullesthorpe Furniture (fictional), $ millions
const UF = { netIncome: 1.32, cfo: 0.48, taOpen: 9.6, taClose: 11.4 };
const ufRatio = R.cashQuality({ netIncome: UF.netIncome, cfo: UF.cfo, totalAssets: UF.taClose }, { totalAssets: UF.taOpen }).accrualsRatio;
// Marrick Tutors (fictional, private, a service business), $ thousands
const MT = { currentAssets: 420, currentLiabilities: 380, totalAssets: 1_600, totalLiabilities: 1_000, retainedEarnings: 260, ebit: 120, equity: 600, revenue: 2_900 };
const mtZ = R.altman(MT, 'zdouble');
const W = R.ALTMAN.zdouble.w;
const mtWrongX4 = mtZ.score - W[3] * mtZ.x[3] + W[3] * (MT.equity / MT.totalAssets);
const mtWrongX1 = mtZ.score - W[0] * mtZ.x[0] + W[0] * (MT.currentAssets / MT.totalAssets);

export const items = [
  // ================================================================ Module 1: comparing statements
  {
    id: 'f03-dg-1', lesson: 'horizontal-analysis', type: 'num', kind: 'numerical',
    prompt: `Thrushcombe Aquarium, a fictional visitor attraction, shows its operating expenses as index numbers with 2023 = 100. The index is ${AQ.i2026} for 2026 and ${AQ.i2027} for 2027. By what percentage did operating expenses rise from 2026 to 2027? Enter a percentage to one decimal place.`,
    answer: 12.5, check: () => aqChange * 100, unit: '%', places: 1, tol: 0.05,
    wrong: [
      { value: 16, say: `That is the rise in index points (${AQ.i2027} − ${AQ.i2026}). Points are measured against the 2023 base, so they are a percentage only of 2023’s expenses. Divide the 2027 index by the 2026 index.` },
      { value: 44, say: 'That is the rise since the base year, 2023. The question asks for the change from 2026 to 2027.' },
      { value: 11.1, say: `That divides the change by the 2027 index. A percentage change is measured on the earlier year: ${AQ.i2027} ÷ ${AQ.i2026} − 1.` },
    ],
    solution: `Index numbers keep the ratios between years: 2027 ÷ 2026 = ${AQ.i2027} ÷ ${AQ.i2026} = ${fx(AQ.i2027 / AQ.i2026, 3)}, a rise of ${pc(aqChange)}. The ${AQ.i2027 - AQ.i2026}-point rise is ${AQ.i2027 - AQ.i2026}% of 2023’s expenses, not of 2026’s.`,
  },
  {
    id: 'f03-dg-2', lesson: 'common-size-statements', type: 'num', kind: 'applied',
    prompt: `Quillan Removals, a fictional removals firm, reports revenue of ${usd(QR.revenue)} and cost of sales of ${usd(QR.costOfSales)}, which includes ${usd(QR.crewWages)} of wages for its removal crews. A rival reports a gross margin of ${pc(QR.rivalMargin, 0)}, but puts its crews’ wages in operating expenses. What is Quillan’s gross margin on the rival’s classification? Enter a percentage to one decimal place.`,
    answer: 61, check: () => qrRestated * 100, unit: '%', places: 1, tol: 0.05,
    wrong: [
      { value: 38, say: `That is Quillan’s gross margin as reported, with the crews in cost of sales. To compare with the rival, take the ${usd(QR.crewWages)} out of cost of sales.` },
      { value: 15, say: 'That subtracts the crews’ wages a second time. They are already inside the cost of sales; moving them out raises gross profit.' },
      { value: 23, say: 'That is the crews’ wages as a share of revenue: the size of the reclassification, not the restated margin.' },
    ],
    solution: `Cost of sales without the crews: ${usd(QR.costOfSales)} − ${usd(QR.crewWages)} = ${usd(QR.costOfSales - QR.crewWages)}. Gross profit: ${usd(QR.revenue)} − ${usd(QR.costOfSales - QR.crewWages)} = ${usd(QR.revenue - QR.costOfSales + QR.crewWages)}, a gross margin of ${pc(qrRestated)} against ${pc(qrReported)} as reported. On the same classification Quillan’s margin is above the rival’s ${pc(QR.rivalMargin, 0)}; its operating margin is unaffected by the move.`,
  },
  {
    id: 'f03-dg-3', lesson: 'horizontal-analysis', type: 'mc', kind: 'applied',
    prompt: `Vellacott Garden Tools, a fictional manufacturer, had revenue of ${usd(VG.revenue)} and operating income of ${usd(VG.operatingIncome)} this year. Its comparative income statement shows these changes on last year. Which most needs explaining in an analyst’s report?`,
    options: [
      `Cost of sales rose ${pc(vgPct('cos'))}, from ${usd(VG.lines.cos[0])} to ${usd(VG.lines.cos[1])}`,
      `Legal fees rose ${pc(vgPct('legal'), 0)}, from ${usd(VG.lines.legal[0])} to ${usd(VG.lines.legal[1])}, after a dispute with a supplier`,
      `Bad debt expense rose ${pc(vgPct('badDebt'), 0)}, from ${usd(VG.lines.badDebt[0])} to ${usd(VG.lines.badDebt[1])}, as one garden centre failed`,
      `Advertising fell ${pc(-vgPct('ads'), 0)}, from ${usd(VG.lines.ads[0])} to ${usd(VG.lines.ads[1])}`,
    ],
    answer: 0,
    feedback: {
      1: `The percentage is large because the base is tiny: ${usd(vgCh('legal'))} is under 2% of operating income. Note it, but it isn’t what moved the results.`,
      2: `A ${usd(vgCh('badDebt'))} change is immaterial beside ${usd(VG.operatingIncome)} of operating income, however large the percentage.`,
      3: `A ${usd(-vgCh('ads'))} saving is small next to the ${usd(vgCh('cos'))} rise in cost of sales.`,
    },
    solution: `Judge materiality in dollars against a relevant total, then look at percentages. Cost of sales rose by ${usd(vgCh('cos'))}, equal to ${pc(vgCh('cos') / VG.operatingIncome, 0)} of operating income, so it is the change that drives the results, even though ${pc(vgPct('cos'))} is the smallest percentage in the list. The others are a few thousand dollars each.`,
  },

  // ================================================================ Module 2: liquidity, solvency and efficiency
  {
    id: 'f03-dg-4', lesson: 'liquidity', type: 'num', kind: 'numerical',
    prompt: `Westray Architects, a fictional practice, reports these current assets at 31 December 2027: cash ${usd(WA.cash)}; Treasury bills maturing in 90 days ${usd(WA.shortTermInvestments)}; accounts receivable, net, ${usd(WA.receivables)}; contract assets (work done for clients but not yet billable) ${usd(WA.contractAssets)}; prepaid expenses ${usd(WA.prepaid)}. Its current liabilities are ${usd(WA.currentLiabilities)}. What is its quick ratio? Give two decimal places.`,
    answer: 1.06, check: () => waQuick, unit: '', places: 2, tol: 0.005,
    wrong: [
      { value: 1.49, say: 'That counts the contract assets. They are not yet an unconditional right to be paid, so they stay out of the quick ratio with the prepaid expenses.' },
      { value: 1.55, say: 'That is the current ratio, with every current asset. The quick ratio keeps only cash, short-term investments and receivables.' },
      { value: 0.47, say: 'That is the cash ratio (cash and short-term investments only). The quick ratio also counts receivables.' },
      { value: 0.91, say: 'The Treasury bills are short-term investments that can be turned into cash quickly: they count as quick assets.' },
    ],
    solution: `Quick assets = cash + short-term investments + receivables = ${usd(WA.cash)} + ${usd(WA.shortTermInvestments)} + ${usd(WA.receivables)} = ${usd(WA.cash + WA.shortTermInvestments + WA.receivables)}. Quick ratio = ${usd(WA.cash + WA.shortTermInvestments + WA.receivables)} ÷ ${usd(WA.currentLiabilities)} = ${fx(waQuick)}. Contract assets become receivables only when the work can be billed, and prepaid expenses will never be turned into cash.`,
  },
  {
    id: 'f03-dg-5', lesson: 'solvency-and-leverage', type: 'num', kind: 'numerical',
    prompt: `Gallowmere Cold Stores, a fictional warehousing company with no leases, reports (in $ millions): operating income (EBIT) ${fx(GC.ebit, 1)}; depreciation ${fx(GC.da, 1)}; bank loans ${fx(GC.loanCurrent, 1)} due within a year and ${fx(GC.loanNoncurrent, 1)} after; accounts payable ${fx(GC.payables, 1)}; cash ${fx(GC.cash, 1)}. What is its net debt ÷ EBITDA? Give two decimal places.`,
    answer: 2.6, check: () => gcRatio, unit: '', places: 2, tol: 0.005,
    wrong: [
      { value: 3.03, say: 'That counts accounts payable as debt. Net debt uses interest-bearing debt only: the bank loans, current and noncurrent.' },
      { value: 3.79, say: 'That divides by EBIT. The ratio uses EBITDA, EBIT plus depreciation and amortisation.' },
      { value: 2.8, say: 'That is gross debt ÷ EBITDA. Net debt subtracts the cash.' },
      { value: 2.26, say: 'The bank loan due within a year is still debt: include both parts.' },
    ],
    solution: `Debt = ${fx(GC.loanCurrent, 1)} + ${fx(GC.loanNoncurrent, 1)} = ${fx(gcDebt, 1)}; net debt = ${fx(gcDebt, 1)} − ${fx(GC.cash, 1)} = ${fx(gcDebt - GC.cash, 1)}. EBITDA = ${fx(GC.ebit, 1)} + ${fx(GC.da, 1)} = ${fx(GC.ebit + GC.da, 1)}. Net debt ÷ EBITDA = ${fx(gcDebt - GC.cash, 1)} ÷ ${fx(GC.ebit + GC.da, 1)} = ${fx(gcRatio)}: about two and a half years of operating cash earnings, before tax, interest and investment, would repay the borrowing.`,
  },
  {
    id: 'f03-dg-6', lesson: 'efficiency-and-working-capital', type: 'num', kind: 'applied',
    prompt: `Pennistone Veterinary Clinic, a fictional practice, had revenue of ${usd(PV.revenue)} in 2027. Pet owners pay at the desk; only farms and insurers are invoiced, on 30-day terms, and those invoices came to ${usd(PV.invoiced)}. Its net receivables were ${usd(PV.recOpen)} at the start of the year and ${usd(PV.recClose)} at the end. How many days do invoiced customers take to pay, on average? Use 365 days and give one decimal place.`,
    answer: 50, check: () => pvDso, unit: 'days', places: 1, tol: 0.05,
    wrong: [
      { value: 8.1, say: 'That divides by all revenue, most of it paid at once. Only invoiced sales pass through receivables, so divide by those.' },
      { value: 57.5, say: 'That uses closing receivables. The flow is earned over the whole year, so use the average of the opening and closing balances.' },
      { value: 42.5, say: 'That uses opening receivables alone. Average the opening and closing balances.' },
    ],
    solution: `Average receivables = (${usd(PV.recOpen)} + ${usd(PV.recClose)}) ÷ 2 = ${usd((PV.recOpen + PV.recClose) / 2)}. Receivables turnover on credit sales = ${usd(PV.invoiced)} ÷ ${usd((PV.recOpen + PV.recClose) / 2)} = ${fx(PV.invoiced / ((PV.recOpen + PV.recClose) / 2))}. DSO = 365 ÷ ${fx(PV.invoiced / ((PV.recOpen + PV.recClose) / 2))} = ${fx(pvDso, 1)} days, well beyond the 30-day terms.`,
  },

  // ================================================================ Module 3: returns
  {
    id: 'f03-dg-7', lesson: 'return-on-assets-and-equity', type: 'num', kind: 'numerical',
    prompt: `Crannoch Opticians, a fictional chain of eye clinics, earned net income of ${usd(CO.netIncome)} in 2027. Its total assets were ${usd(CO.taOpen)} on 1 January and ${usd(CO.taClose)} on 31 December; its equity was ${usd(CO.eqOpen)} and ${usd(CO.eqClose)}. What was its return on equity, on the convention this course uses when an opening balance sheet exists? Enter a percentage to one decimal place.`,
    answer: 30, check: () => coRoe * 100, unit: '%', places: 1, tol: 0.05,
    wrong: [
      { value: 26.3, say: 'That divides by closing equity. When the opening balance sheet exists, divide a year’s profit by the average of opening and closing equity.' },
      { value: 35, say: 'That divides by opening equity. Use the average of the opening and closing balances.' },
      { value: 12, say: 'That is the return on average total assets. Return on equity divides by the owners’ equity.' },
    ],
    solution: `Average equity = (${usd(CO.eqOpen)} + ${usd(CO.eqClose)}) ÷ 2 = ${usd((CO.eqOpen + CO.eqClose) / 2)}. ROE = ${usd(CO.netIncome)} ÷ ${usd((CO.eqOpen + CO.eqClose) / 2)} = ${pc(coRoe)}. Net income is earned over the year, so it is set against the equity employed over the year, not at one date.`,
  },
  {
    id: 'f03-dg-8', lesson: 'dupont-analysis', type: 'mc', kind: 'applied',
    prompt: `Sorrelby Hotels, a fictional group, earned a return on equity of ${pc(shRoe(SH.y26), 0)} in both 2026 and 2027. On average balances its net margin went from ${pc(SH.y26.margin, 1)} to ${pc(SH.y27.margin, 2)}, its asset turnover from ${fx(SH.y26.turnover)} to ${fx(SH.y27.turnover)} and its equity multiplier from ${fx(SH.y26.multiplier, 1)} to ${fx(SH.y27.multiplier, 1)}. What should a lender conclude?`,
    options: [
      'The return is unchanged, but it now rests on borrowing rather than on profit from each sale, so the risk is higher',
      'Performance is unchanged, because return on equity is the measure that matters to the owners and to lenders',
      'The hotels are being run better, because asset turnover improved while the return on equity held steady at its old level',
      'The group has become safer, because a falling margin means it is spending more on maintaining its hotels',
    ],
    answer: 0,
    feedback: {
      1: 'The same ROE can come from very different businesses. Here the margin fell by more than a third; only extra leverage kept the return up.',
      2: `Turnover improved only slightly (${fx(SH.y26.turnover)} to ${fx(SH.y27.turnover)}); the large changes are the fall in margin and the rise in leverage.`,
      3: 'A margin says nothing on its own about why costs rose, and more debt per dollar of equity makes the group less safe, not more.',
    },
    solution: `ROE = net margin × asset turnover × equity multiplier: ${pc(SH.y26.margin, 1)} × ${fx(SH.y26.turnover)} × ${fx(SH.y26.multiplier, 1)} = ${pc(shRoe(SH.y26), 1)} in 2026 and ${pc(SH.y27.margin, 2)} × ${fx(SH.y27.turnover)} × ${fx(SH.y27.multiplier, 1)} = ${pc(shRoe(SH.y27), 1)} in 2027. ROA fell from ${pc(SH.y26.margin * SH.y26.turnover, 1)} to ${pc(SH.y27.margin * SH.y27.turnover, 1)}; assets per dollar of equity rose by half. A lender sees a weaker business carrying more debt.`,
  },
  {
    id: 'f03-dg-9', lesson: 'dupont-analysis', type: 'num', kind: 'numerical',
    prompt: `Wyndlow Haulage, a fictional trucking firm with no other income or expenses below operating income, has an interest coverage of ${fx(WH.coverage, 1)} (EBIT ÷ interest expense). What is its interest burden, the five-step DuPont factor? Give two decimal places.`,
    answer: 0.8, check: () => whBurden, unit: '', places: 2, tol: 0.005,
    wrong: [
      { value: 0.2, say: 'That is the share of EBIT that goes on interest (1 ÷ 5). The interest burden is the share left: income before tax ÷ EBIT.' },
      { value: 1.25, say: 'Upside down: the interest burden is income before tax ÷ EBIT, which is at most 1 when there is interest to pay.' },
      { value: 5, say: 'That is the coverage itself. The interest burden is (EBIT − interest) ÷ EBIT.' },
    ],
    solution: `Interest burden = income before tax ÷ EBIT = (EBIT − interest) ÷ EBIT = 1 − interest ÷ EBIT = 1 − 1 ÷ coverage = 1 − 1 ÷ ${fx(WH.coverage, 1)} = ${fx(whBurden)}. Four-fifths of operating profit is left after lenders are paid.`,
  },

  // ================================================================ Module 4: judging financial health
  {
    id: 'f03-dg-10', lesson: 'cash-flow-and-earnings-quality', type: 'num', kind: 'numerical',
    prompt: `Ullesthorpe Furniture, a fictional maker, reports for 2027 (in $ millions): net income ${fx(UF.netIncome)}; net cash from operating activities ${fx(UF.cfo)}; total assets ${fx(UF.taOpen, 1)} on 1 January and ${fx(UF.taClose, 1)} on 31 December. What is its accruals ratio? Enter a percentage to one decimal place, negative if accruals are negative.`,
    answer: 8, check: () => ufRatio * 100, unit: '%', places: 1, tol: 0.05,
    wrong: [
      { value: -8, say: 'The sign: accruals are net income minus operating cash. Profit is higher than cash here, so accruals are positive.' },
      { value: 7.4, say: 'That divides by closing total assets. Use the average of opening and closing.' },
      { value: 36.4, say: 'That is operating cash ÷ net income. The accruals ratio scales the gap by average total assets.' },
    ],
    solution: `Accruals = net income − CFO = ${fx(UF.netIncome)} − ${fx(UF.cfo)} = ${fx(UF.netIncome - UF.cfo)}. Average total assets = (${fx(UF.taOpen, 1)} + ${fx(UF.taClose, 1)}) ÷ 2 = ${fx((UF.taOpen + UF.taClose) / 2, 1)}. Accruals ratio = ${fx(UF.netIncome - UF.cfo)} ÷ ${fx((UF.taOpen + UF.taClose) / 2, 1)} = ${pc(ufRatio)}: well over half of the profit has not yet arrived as cash, so look for where it sits (receivables, inventory, capitalised costs).`,
  },
  {
    id: 'f03-dg-11', lesson: 'distress-scores', type: 'num', kind: 'numerical',
    prompt: `Marrick Tutors, a fictional private tutoring company, reports (in $ thousands): current assets ${MT.currentAssets}; current liabilities ${MT.currentLiabilities}; total assets ${fx(MT.totalAssets, 0)}; total liabilities ${fx(MT.totalLiabilities, 0)}; retained earnings ${MT.retainedEarnings}; book equity ${MT.equity}; EBIT ${MT.ebit}; revenue ${fx(MT.revenue, 0)}. Altman’s model for non-manufacturers is Z″ = ${W[0]}X₁ + ${W[1]}X₂ + ${W[2]}X₃ + ${W[3]}X₄. What is Marrick’s Z″? Give two decimal places.`,
    answer: 1.83, check: () => mtZ.score, unit: '', places: 2, tol: 0.01,
    wrong: [
      { value: r2(mtWrongX4), say: 'X₄ is book equity ÷ total liabilities, not equity ÷ total assets.' },
      { value: r2(mtWrongX1), say: 'X₁ is working capital (current assets − current liabilities) ÷ total assets, not current assets ÷ total assets.' },
    ],
    solution: `X₁ = working capital ÷ total assets = (${MT.currentAssets} − ${MT.currentLiabilities}) ÷ ${fx(MT.totalAssets, 0)} = ${fx(mtZ.x[0], 3)}; X₂ = retained earnings ÷ total assets = ${fx(mtZ.x[1], 4)}; X₃ = EBIT ÷ total assets = ${fx(mtZ.x[2], 3)}; X₄ = book equity ÷ total liabilities = ${fx(mtZ.x[3], 2)}. Z″ = ${fx(mtZ.terms[0], 3)} + ${fx(mtZ.terms[1], 3)} + ${fx(mtZ.terms[2], 3)} + ${fx(mtZ.terms[3], 3)} = ${fx(mtZ.score)}, between the zone boundaries of ${fx(R.ALTMAN.zdouble.zones[0])} and ${fx(R.ALTMAN.zdouble.zones[1])}: the grey zone. Revenue is not used: Z″ has no sales term.`,
  },
  {
    id: 'f03-dg-12', lesson: 'benchmarking-and-annual-reports', type: 'mc', kind: 'conceptual',
    prompt: 'Scarth Systems Inc., a fictional listed software company, reports a large and growing “contract assets” balance. An analyst wants to know what these are, how much revenue was recognised before it could be billed, and which estimates management made. Where in its Form 10-K should she look first?',
    options: [
      'The revenue recognition note to the financial statements, in Item 8',
      'Item 1A, Risk Factors, which lists the risks management sees in its business',
      'The auditor’s report, which explains how each balance on the statements was measured',
      'Item 7, the MD&A’s liquidity section, which explains the cash flows of the year',
    ],
    answer: 0,
    feedback: {
      1: 'Risk factors describe risks in general terms; they don’t reconcile contract balances or state the judgements behind them.',
      2: 'The auditor gives an opinion on the statements as a whole (and may name critical audit matters); the accounting itself is explained in the notes.',
      3: 'The MD&A may mention working capital, but the contract balances, their movements and the judgements are disclosed in the revenue note.',
    },
    solution: 'Under ASC 606 the notes disclose revenue by type, contract assets and liabilities with their movements, when performance obligations are satisfied and the significant judgements. Read that note first, then the MD&A for management’s explanation and the critical accounting estimates.',
  },
];

function r2(x) { return Math.round(x * 100) / 100; }

// The score for each entry is over all the items of the modules before it, and the highest entry passed wins. Modules
// 1–3 score each item 0 or 1, and every entry asks for all the earlier items right: a student who misses any item of
// modules 1–3 starts no later than that item’s module.
export const route = [{ module: 2, ifAtLeast: 1 }, { module: 3, ifAtLeast: 1 }, { module: 4, ifAtLeast: 1 }];
