// Run: node tests/workbook.test.mjs
// The workbook engine end to end: the genuine .xls and .xlsx sample workbooks (tests/make_workbooks.py) are read in
// full, classified, mapped and turned into a company project whose statements and ratios are compared with figures
// worked independently in pandas (tests/fixtures-workbook.json). Then awkward workbooks built here: negative expenses,
// several currencies, an unusual fiscal year, quarterly columns, forecasts, formulas without stored results, text numbers.
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import * as W from '../assets/js/core/workbook.js';
import * as V from '../assets/js/core/valuation.js';
import * as R from '../assets/js/core/ratios.js';
const require = createRequire(import.meta.url);
const XLSX = require('../assets/vendor/xlsx.full.min.js');
const { readWorkbook } = require('../assets/js/core/workbook-read.js');

const fx = JSON.parse(readFileSync(new URL('./fixtures-workbook.json', import.meta.url)));
let fails = 0, checks = 0;
const close = (label, got, want, tol = 1e-9) => { checks++; const ok = typeof got === 'number' && Number.isFinite(got) && Math.abs(got - want) <= tol * Math.max(1, Math.abs(want)); if (!ok) { fails++; console.log(`FAIL ${label}: got ${got}, want ${want}`); } };
const truth = (label, cond) => { checks++; if (!cond) { fails++; console.log(`FAIL ${label}`); } };
const load = (f) => readWorkbook(XLSX, readFileSync(new URL(`../assets/data/samples/${f}`, import.meta.url)), f);
const MAP = { sti: 'shortTermInvestments', ar: 'receivables', inv: 'inventory', oca: 'otherCurrentAssets', ppe: 'ppeNet', gw: 'goodwill', intang: 'intangibles', onca: 'otherNoncurrentAssets', ta: 'totalAssets', ap: 'payables', curd: 'currentDebt', ocl: 'otherCurrentLiabilities', ltd: 'longTermDebt', leases: 'leaseLiabilities', oncl: 'otherNoncurrentLiabilities', tl: 'totalLiabilities', retained: 'retainedEarnings', cfi: 'investingCF', cff: 'financingCF' };
const SAME = ['revenue', 'cogs', 'grossProfit', 'opex', 'da', 'ebit', 'interestExpense', 'interestIncome', 'pretax', 'tax', 'netIncome', 'cash', 'currentAssets', 'currentLiabilities', 'equity', 'cfo', 'capex', 'dividends', 'buybacks', 'nwcChange'];

// ---------------------------------------------------------------- 1. every row of both formats is read
const xls = load('helio-foods-group.xls'), xlsx = load('helio-foods-group.xlsx');
truth('.xls is detected as BIFF', xls.format === 'xls'); truth('.xlsx is detected', xlsx.format === 'xlsx');
for (const [wb, key] of [[xls, 'xls'], [xlsx, 'xlsx']]) {
  truth(`${key}: every sheet is present`, wb.sheets.length === Object.keys(fx.sheets[key]).length);
  for (const s of wb.sheets) truth(`${key} › ${s.name}: ${fx.sheets[key][s.name]} rows read`, s.nRows === fx.sheets[key][s.name] && s.rows.length === s.nRows);
  const rec = wb.sheets.find((s) => s.name === 'Monthly records');
  truth(`${key}: 11,520 records plus the header`, rec.nRows === 11521);
  close(`${key}: the records' amounts add to the pandas total`, rec.sum, fx.recordsSum);
  truth(`${key}: dates arrive as ISO text`, rec.rows[1][0] === '2020-01-31' && rec.rows[11520][0] === '2025-12-31');
}
const ord = xlsx.sheets.find((s) => s.name === 'Sales orders');
truth('xlsx: 15,001 order lines plus the header', ord.nRows === 15002);

// ---------------------------------------------------------------- 2. classification, units, quality
const an = W.analyseWorkbook(xlsx), anXls = W.analyseWorkbook(xls);
const kind = (a, n) => a.sheets.find((s) => s.name === n);
truth('statements are recognised', ['Income Statement', 'Balance Sheet', 'Cash Flow'].every((n) => kind(an, n).kind === 'statement'));
truth('statement types', kind(an, 'Income Statement').statement === 'is' && kind(an, 'Balance Sheet').statement === 'bs' && kind(an, 'Cash Flow').statement === 'cf');
truth('long records are recognised', kind(an, 'Monthly records').kind === 'records' && kind(anXls, 'Monthly records').kind === 'records');
truth('the order lines are a dataset', kind(an, 'Sales orders').kind === 'dataset');
truth('notes are notes', kind(an, 'Notes').kind === 'notes');
truth('thousands and USD are read from the sheet text', kind(an, 'Income Statement').unit === 1e3 && kind(an, 'Income Statement').currency === 'USD');
truth('six fiscal years across', kind(an, 'Income Statement').periods.map((p) => p.fy).join() === fx.years.join());
truth('the three expense lines are parts of operating expenses', kind(an, 'Income Statement').lines.filter((l) => l.field === 'opex' && l.part).length === 3);
truth('32 accounts found in the records', kind(an, 'Monthly records').accounts.length === 32 && kind(an, 'Monthly records').accounts.filter((a) => a.field).length >= 28);
truth('balance-sheet accounts default to period-end balances', kind(an, 'Monthly records').accounts.find((a) => a.field === 'cash').mode === 'last' && kind(an, 'Monthly records').accounts.find((a) => a.field === 'revenue').mode === 'sum');
const q = kind(an, 'Sales orders').quality;
truth('quality: every order row was checked', q.rows === 15001);
truth('quality: the two blank cells are found', q.missing === fx.ordersMissing);
truth('quality: the repeated row is found', q.duplicates === fx.ordersDuplicates);
truth('quality: the abnormal unit price is found', q.outliers.some((o) => /unit price/i.test(o.column) && o.examples.some((e) => e.value === 9999)));
const oc = kind(an, 'Sales orders').columns;
close('orders: revenue adds to the pandas total over all rows', oc.find((c) => /revenue/i.test(c.name)).sum, fx.ordersRevenueSum);
close('orders: units add to the pandas total', oc.find((c) => c.name === 'Units').sum, fx.ordersUnitsSum);
const sm = W.summariseDataset(ord, kind(an, 'Sales orders'), { measure: oc.find((c) => /revenue/i.test(c.name)).index, dim: oc.find((c) => c.name === 'Region').index });
for (const [y, v] of sm.byYear) close(`orders: revenue in ${y}`, v, fx.ordersRevenueByYear[y]);
for (const [d, v] of sm.byDim) close(`orders: revenue in ${d}`, v, fx.ordersRevenueByRegion[d]);

// ---------------------------------------------------------------- 3. the company project, from statements and from records
function compare(tag, project) {
  truth(`${tag}: six years`, project.history.map((h) => h.year).join() === fx.years.join());
  for (const h of project.history) {
    const want = fx.annual[h.year];
    for (const k of SAME) if (h[k] !== undefined) close(`${tag} ${h.year} ${k}`, h[k], want[k] / 1000, 1e-9);
    for (const [a, b] of Object.entries(MAP)) if (h[b] !== undefined) close(`${tag} ${h.year} ${b}`, h[b], want[a] / 1000, 1e-9);
    if (h.shares !== undefined) close(`${tag} ${h.year} shares (millions)`, h.shares, want.shares, 1e-9);
  }
}
const set = W.defaultSettings(an);
const built = W.buildProject(xlsx, an, set);
compare('xlsx', built.project);
truth('xlsx: statements and records agree (no disagreement warnings)', !built.issues.some((i) => /apart/.test(i.text)));
truth('xlsx: negative outflows are stored as sizes and disclosed', built.project.history.every((h) => h.capex > 0 && h.dividends > 0) && built.issues.some((i) => /Capital expenditure is reported as a negative/.test(i.text)));
truth('xlsx: lineage names the sheet and cell', built.lineage[2025].revenue.sheet === 'Income Statement' && built.lineage[2025].revenue.cells[0] === 'G5' && built.lineage[2025].revenue.scaled === 0.001);
truth('xlsx: operating expenses are the sum of three lines', built.lineage[2025].opex.parts.length === 3);
truth('xlsx: every statement field needed for a DCF is covered', V.missingFor(built.project, 'dcf').missing.length === 0);
truth('xlsx: no market data is invented', Object.keys(built.project.market).length === 0 && built.project.peers.length === 0);
compare('xls', W.buildProject(xls, anXls, W.defaultSettings(anXls)).project);
{ // records alone
  const s2 = W.defaultSettings(an); ['Income Statement', 'Balance Sheet', 'Cash Flow'].forEach((n) => { s2.sheets[n].use = false; });
  const b2 = W.buildProject(xlsx, an, s2);
  compare('records only', b2.project);
  truth('records only: built from 11,520 rows', b2.lineage[2025].revenue.parts === undefined && /sum of 60 rows/.test(b2.lineage[2025].revenue.how));
}
truth('the project passes the engine\'s validation', !V.validate(built.project).some((w) => w.level !== 'info'));

// ---------------------------------------------------------------- 4. ratios against pandas
{
  const H = V.historical(built.project);
  H.forEach((x, i) => {
    const y = String(x.year), want = (k) => fx.ratios[k][y];
    close(`${y} gross margin`, x.margins.gross, want('grossMargin')); close(`${y} EBITDA margin`, x.margins.ebitda, want('ebitdaMargin')); close(`${y} EBIT margin`, x.margins.ebit, want('ebitMargin')); close(`${y} net margin`, x.margins.net, want('netMargin'));
    close(`${y} current ratio`, x.ratios.liquidity.current, want('current')); close(`${y} quick ratio`, x.ratios.liquidity.quick, want('quick')); close(`${y} cash ratio`, x.ratios.liquidity.cash, want('cashRatio'));
    close(`${y} debt to equity`, x.ratios.solvency.debtToEquity, want('debtToEquity')); close(`${y} net debt / EBITDA`, x.ratios.solvency.netDebtToEbitda, want('netDebtToEbitda')); close(`${y} interest coverage`, x.ratios.solvency.interestCoverage, want('interestCoverage'));
    close(`${y} free cash flow`, x.p.fcf, want('fcf') / 1000);
    close(`${y} Altman Z″`, R.altman({ ...x.p }, 'zdouble').score, want('altmanZdouble'));
    if (i > 0) {
      close(`${y} ROA`, x.ratios.profitability.roa, want('roa')); close(`${y} ROE`, x.ratios.profitability.roe, want('roe')); close(`${y} ROIC`, x.drivers.roic, want('roic'));
      close(`${y} asset turnover`, x.ratios.efficiency.assetTurnover, want('assetTurnover')); close(`${y} inventory turnover`, x.ratios.efficiency.inventoryTurnover, want('inventoryTurnover'));
      close(`${y} DSO`, x.ratios.efficiency.dso, want('dso')); close(`${y} DIO`, x.ratios.efficiency.dio, want('dio')); close(`${y} DPO`, x.ratios.efficiency.dpo, want('dpo')); close(`${y} cash conversion cycle`, x.ratios.efficiency.cashConversionCycle, want('ccc'));
      close(`${y} revenue growth`, x.growth.revenue, want('revenueGrowth')); close(`${y} net income growth`, x.growth.netIncome, want('netIncomeGrowth'));
    }
  });
  close('revenue CAGR', R.cagr(H[5].p.revenue, H[0].p.revenue, 5), fx.revenueCagr);
}

// ---------------------------------------------------------------- 5. awkward workbooks, written and read back as real files
const make = (sheets, bookType = 'xlsx') => { const wb = XLSX.utils.book_new(); for (const [name, aoa] of Object.entries(sheets)) XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(aoa), name); return readWorkbook(XLSX, XLSX.write(wb, { type: 'array', bookType }), `test.${bookType}`); };
const go = (wb, tweak) => { const a = W.analyseWorkbook(wb), s = W.defaultSettings(a); if (tweak) tweak(s, a); return { a, ...W.buildProject(wb, a, s) }; };
{ // expenses as negatives, numbers as text, blanks and dashes, a forecast column, duplicate year columns
  const wb = make({ 'P&L': [['Acme Ltd income statement (EUR millions)'], ['', '2022', '2023', '2023 restated', '2024', '2025E'], ['Revenue', '1,000', '1,100', '1,090', '1,250', '1,400'], ['Cost of sales', '(600)', '(650)', '(648)', '(730)', '(800)'], ['Operating expenses', -200, -215, -214, -240, -260], ['Depreciation', '-', -42, -42, -45, -47], ['Operating profit', 160, 193, 186, 235, 293], ['Interest expense', -12, -12, -12, 'n/a', -11], ['Net profit', 111, 136, 131, 170, 215]] }, 'xls');
  const r = go(wb);
  truth('messy: EUR and millions are read', r.a.sheets[0].currency === 'EUR' && r.a.sheets[0].unit === 1e6);
  truth('messy: the forecast column is left out and said so', r.project.history.map((h) => h.year).join() === '2022,2023,2024' && r.issues.some((i) => /2025E/.test(i.text) && /forecast/.test(i.text)));
  truth('messy: duplicate year columns are flagged, the first kept', r.project.history[1].revenue === 1100 && r.issues.some((i) => /2 columns are labelled fiscal 2023/.test(i.text)));
  truth('messy: "(600)" and "1,000" are numbers', r.project.history[0].revenue === 1000 && r.project.history[0].cogs === 600);
  truth('messy: negative expenses become positive sizes, disclosed', r.project.history[2].opex === 240 && r.lineage[2024].opex.signFlipped === true);
  truth('messy: a dash or n/a stays missing, nothing is filled in', r.project.history[0].da === undefined && r.project.history[2].interestExpense === undefined);
  truth('messy: validation notices EBIT does not tie', V.validate(r.project).length > 0);
}
{ // quarterly columns add up to years; a year with three quarters is left out
  const wb = make({ Income: [['', 'Q1 2023', 'Q2 2023', 'Q3 2023', 'Q4 2023', 'Q1 2024', 'Q2 2024', 'Q3 2024'], ['Revenue', 10, 12, 11, 15, 12, 14, 13], ['Net income', 1, 2, 1, 3, 2, 2, 2], ['Total assets', 100, 104, 106, 110, 112, 115, 117]] });
  const r = go(wb);
  truth('quarters: four quarters make the year', r.project.history.length === 1 && r.project.history[0].revenue === 48 && r.project.history[0].netIncome === 7);
  truth('quarters: balances take the last quarter', r.project.history[0].totalAssets === 110);
  truth('quarters: a part year is left out with a warning', r.issues.some((i) => /fiscal 2024 has 3 part-year columns/.test(i.text)));
}
{ // long records in two currencies with a June fiscal year end
  const rows = [['Date', 'Account', 'Currency', 'Amount']];
  for (let m = 0; m < 24; m++) { const d = new Date(Date.UTC(2022, 6 + m + 1, 0)).toISOString().slice(0, 10); rows.push([d, 'Revenue', 'USD', 100 + m], [d, 'Net income', 'USD', 10], [d, 'Total assets', 'USD', 1000 + m], [d, 'Revenue', 'EUR', 50]); }
  const wb = make({ Ledger: rows });
  const r = go(wb, (s) => { s.fyEndMonth = 6; });
  truth('fiscal year: July 2022 to June 2023 is fiscal 2023', r.project.history.map((h) => h.year).join() === '2023,2024');
  close('fiscal year: flows are summed over the twelve months', r.project.history[0].revenue * 1e6, 100 * 12 + 66);
  close('fiscal year: balances are the June figure', r.project.history[0].totalAssets * 1e6, 1011);
  truth('currencies: EUR rows are left out, counted and reported, not added to dollars', r.issues.some((i) => i.level === 'error' && /24 rows are in EUR \(total 1,200\)/.test(i.text)));
  const r2 = go(wb, (s) => { s.fyEndMonth = 6; s.fx = { EUR: 1.1 }; });
  close('currencies: with a rate given they are converted', r2.project.history[0].revenue * 1e6, 100 * 12 + 66 + 12 * 50 * 1.1);
  const r3 = go(wb, (s) => { s.fyEndMonth = 12; });
  truth('part years: six months of a calendar year are left out', r3.project.history.map((h) => h.year).join() === '2023' && r3.issues.some((i) => /fiscal 2022 has 6 months of records, not twelve/.test(i.text)));
}
{ // one row per year, lines across; units differ between sheets; formulas without stored results
  const ws = XLSX.utils.aoa_to_sheet([['Fiscal year', 'Revenue', 'EBITDA', 'Net income', 'Capital expenditure'], ['FY2023', 5000, 900, 400, 300], ['FY2024', 5600, 1010, 470, 320]]);
  ws.B4 = { t: 'n', f: 'SUM(B2:B3)' }; ws['!ref'] = 'A1:E4'; ws.A4 = { t: 's', v: 'Total' };
  const wbk = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wbk, ws, 'KPIs (USD thousands)');
  XLSX.utils.book_append_sheet(wbk, XLSX.utils.aoa_to_sheet([['Balance sheet, USD millions'], ['', 'FY2023', 'FY2024'], ['Total assets', 12, 13.5], ['Total liabilities', 7, 7.6], ['Total equity', 5, 5.9]]), 'BS');
  const wb = readWorkbook(XLSX, XLSX.write(wbk, { type: 'array', bookType: 'xlsx' }), 'k.xlsx');
  truth('formulas: a formula with no stored result is counted and reported', wb.sheets[0].formulasNoCache === 1 && wb.warnings.some((w) => /no stored result/.test(w)));
  const r = go(wb);
  truth('rows as years: the sheet is read with years down', r.a.sheets[0].kind === 'statement' && r.a.sheets[0].orientation === 'periods-down');
  truth('units: each sheet is scaled by its own unit', r.project.history[1].revenue === 5.6 && r.project.history[1].totalAssets === 13.5 && r.a.issues.some((i) => /different units/.test(i.text)));
}
{ // a macro-enabled workbook is flagged, never run; csv and tsv read too
  const wbk = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wbk, XLSX.utils.aoa_to_sheet([['a', 'b'], [1, 2]]), 'S'); wbk.vbaraw = new Uint8Array([0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1, 0, 0, 0, 0]);
  const wb = readWorkbook(XLSX, XLSX.write(wbk, { type: 'array', bookType: 'xlsm', bookVBA: true }), 'm.xlsm');
  truth('macros: detected and reported, values still read', wb.hasMacros === true && wb.warnings.some((w) => /macros/.test(w)) && wb.sheets[0].rows[1][1] === 2);
  const enc = new TextEncoder();
  const csv = readWorkbook(XLSX, enc.encode('Line,FY2023,FY2024\nRevenue,"1,200","1,500"\nNet income,100,(20)\nTotal assets,900,950\n'), 'x.csv');
  const rc = go(csv);
  truth('csv: quoted thousands and bracketed negatives', rc.project.history[1].revenue === 1500 && rc.project.history[1].netIncome === -20);
  const tsv = readWorkbook(XLSX, enc.encode('Line\tFY2023\tFY2024\nRevenue\t1200\t1500\nNet income\t100\t120\nTotal assets\t900\t950\n'), 'x.tsv');
  truth('tsv: read', go(tsv).project.history[0].revenue === 1200);
}
// ---------------------------------------------------------------- 6. period labels
for (const [label, fy, kindWant, extra] of [['FY2023', 2023, 'year'], [2021, 2021, 'year'], ['FY23', 2023, 'year'], ['2023A', 2023, 'year'], ['2025E', 2025, 'year', 'estimate'], ['Q3 2024', 2024, 'quarter'], ['2024Q1', 2024, 'quarter'], ['H1 2023', 2023, 'half'], ['2023-24', 2024, 'year', 'split'], ['FY2023/2024', 2024, 'year', 'split'], ['Year ended December 31, 2022', 2022, 'year'], ['Dec 2023', 2023, 'month'], ['2024-06-30', 2024, 'date'], ['Nine months ended Sep 30, 2024', 2024, 'month', 'partial'], ['Budget 2026', 2026, 'year', 'estimate']]) {
  const p = W.parsePeriod(label);
  truth(`period “${label}”`, p && p.fy === fy && p.kind === kindWant && (!extra || p[extra] === true));
}
truth('not periods', [null, '', 'Revenue', 1234.5, 12, 'Fiscal year ended December 31', true].every((v) => W.parsePeriod(v) === null));
truth('unit text', W.readUnitText('(in thousands of US dollars)').unit === 1e3 && W.readUnitText('EUR m').unit === 1e6 && W.readUnitText('£000').unit === 1e3 && W.readUnitText('£000').currency === 'GBP' && W.readUnitText('Revenue').unit === null);
truth('labels', W.matchField('4000 Product revenue').field === 'revenue' && W.matchField('Net cash provided by (used in) financing activities').field === 'financingCF' && W.matchField('Research and development').part === true && W.matchField('Banana') === null);

// ---------------------------------------------------------------- 7. metrics catalogue and the Excel export's formulas
{
  const M = await import('../assets/js/core/metrics.js');
  const X = await import('../assets/js/core/intel-export.js');
  const SH = await import('../assets/js/core/sheet.js');
  const H = V.historical(built.project), t = M.metricTable(H);
  truth('every metric has a formula, a source and a lesson', M.METRICS.every((m) => m.formula && m.source && m.learn && typeof m.value === 'function'));
  close('metric table: ROE 2025', t.roe[5], fx.ratios.roe['2025']); close('metric table: cash conversion cycle 2024', t.ccc[4], fx.ratios.ccc['2024']); close('metric table: ROIC 2023', t.roic[3], fx.ratios.roic['2023']);
  truth('first-year growth is unavailable, with the missing input named', !Number.isFinite(t.revenueGrowth[0]) && M.missingInputs(M.METRIC.revenueGrowth, H, 0).join() === 'Prior-year revenue');
  // recalculate every formula of the exported sheet with the site's spreadsheet engine
  const g = X.analysisGrid(built.project, H), cells = {};
  g.rows.forEach((row, r) => row.forEach((cell, c) => { if (cell === '' || cell == null) return; const a = SH.addr(r, c); cells[a] = cell && typeof cell === 'object' ? (cell.f ? `=${cell.f}` : cell.v) : cell; }));
  const sheet = new SH.Sheet({ cells });
  let formulas = 0, compared = 0;
  for (const m of M.METRICS) g.ratioCells[m.id].forEach((a, i) => { if (!a) return; compared++; if (sheet.isFormula(a)) formulas++; close(`Excel export: ${m.id} FY${H[i].year} recalculates to the dashboard's value`, sheet.get(a), t[m.id][i], 1e-9); });
  truth('Excel export: the ratio cells are formulas', formulas >= 150 && formulas === compared);
  const bytes = X.buildAnalysisWorkbook(built.project, H, { lineage: built.lineage, issues: built.issues });
  const back = readWorkbook(XLSX, bytes, 'analysis.xlsx');
  truth('Excel export: a valid workbook with four sheets that SheetJS reads back', back.sheets.map((s) => s.name).join() === 'Analysis,Lineage,Checks,Notes' && back.sheets[0].formulas === formulas);
  truth('CSV exports carry every year', X.statementsCSV(H).split('\n')[0].endsWith('FY2025') && X.ratiosCSV(H).split('\n').length === M.METRICS.length + 1);
  const hs = M.healthSummary(H);
  truth('health summary reads the latest year', hs.length >= 4 && hs.every((x) => ['good', 'warn', 'bad'].includes(x.kind)));
  const tor = V.tornado(built.project, V.defaultAssumptions(built.project));
  truth('tornado: drivers ranked by their effect', tor.ok && tor.rows.length >= 5 && tor.rows.every((r, i) => i === 0 || r.range <= tor.rows[i - 1].range));
}

console.log(`${checks - fails}/${checks} workbook checks passed`);
if (fails) process.exit(1);
