// valuation-edgar.js — public-company statements from SEC EDGAR's XBRL "company facts" API, mapped to the valuation
// engine's fields with the source of every figure (tag, filing, period, retrieval date). Pure functions plus two
// fetchers. Verified 5 November 2026: data.sec.gov/submissions/ allows cross-origin browser requests (it sends
// Access-Control-Allow-Origin: *), but the XBRL endpoints (companyfacts, companyconcept, frames) and
// www.sec.gov/files/company_tickers.json do not, so a browser on another domain cannot read them directly. The page
// therefore tries the fetch, and when it is blocked it gives the exact URL to open and the JSON to upload instead;
// factsToHistory() does the same mapping either way, locally.
// SEC's fair-access policy asks automated clients to identify themselves and stay under ten requests a second; a
// browser sends its own User-Agent, and the studio makes at most two requests per lookup.
import { fin } from './valuation.js?v=25';

export const SUBMISSIONS_URL = (cik) => `https://data.sec.gov/submissions/CIK${String(cik).padStart(10, '0')}.json`;
export const factsUrl = (cik) => `https://data.sec.gov/api/xbrl/companyfacts/CIK${String(cik).padStart(10, '0')}.json`;
export const filingIndexUrl = (cik, accn) => `https://www.sec.gov/Archives/edgar/data/${+cik}/${String(accn).replace(/-/g, '')}/`;
export const companySearchUrl = (q) => `https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&company=${encodeURIComponent(q)}&type=10-K&owner=include&count=40`;
export const EDGAR_POLICY_URL = 'https://www.sec.gov/os/accessing-edgar-data';
export const EDGAR_API_DOC_URL = 'https://www.sec.gov/search-filings/edgar-application-programming-interfaces';

/** Ticker → CIK for 160 large SEC registrants, copied from www.sec.gov/files/company_tickers.json on 5 November 2026.
 *  CIKs never change; names are as SEC lists them. Any other company: use its CIK from EDGAR's company search. */
export const CIKS = [["NVDA",1045810,"NVIDIA CORP"],["AAPL",320193,"Apple Inc."],["MSFT",789019,"MICROSOFT CORP"],["GOOGL",1652044,"Alphabet Inc."],["AMZN",1018724,"AMAZON COM INC"],["META",1326801,"Meta Platforms, Inc."],["AVGO",1730168,"Broadcom Inc."],["TSLA",1318605,"Tesla, Inc."],["LLY",59478,"ELI LILLY & Co"],["BRK-B",1067983,"BERKSHIRE HATHAWAY INC"],["WMT",104169,"Walmart Inc."],["MU",723125,"MICRON TECHNOLOGY INC"],["JPM",19617,"JPMORGAN CHASE & CO"],["AMD",2488,"ADVANCED MICRO DEVICES INC"],["V",1403161,"VISA INC."],["XOM",2115436,"ExxonMobil Holdings Corp"],["JNJ",200406,"JOHNSON & JOHNSON"],["ASML",937966,"ASML HOLDING NV"],["MA",1141391,"Mastercard Inc"],["ABBV",1551152,"AbbVie Inc."],["COST",909832,"COSTCO WHOLESALE CORP /NEW"],["CVX",93410,"CHEVRON CORP"],["PLTR",1321655,"Palantir Technologies Inc."],["KO",21344,"COCA COLA CO"],["CSCO",858877,"CISCO SYSTEMS, INC."],["ORCL",1341439,"ORACLE CORP"],["PG",80424,"PROCTER & GAMBLE Co"],["UNH",731766,"UNITEDHEALTH GROUP INC"],["MRK",310158,"Merck & Co., Inc."],["BAC",70858,"BANK OF AMERICA CORP /DE/"],["GE",40545,"GENERAL ELECTRIC CO"],["HD",354950,"HOME DEPOT, INC."],["PM",1413329,"Philip Morris International Inc."],["INTC",50863,"INTEL CORP"],["NVS",1114448,"NOVARTIS AG"],["AMAT",6951,"APPLIED MATERIALS INC /DE"],["SHEL",1306965,"Shell plc"],["MS",895421,"MORGAN STANLEY"],["HSBC",1089113,"HSBC HOLDINGS PLC"],["LRCX",707549,"LAM RESEARCH CORP"],["PANW",1327567,"Palo Alto Networks Inc"],["CAT",18230,"CATERPILLAR INC"],["AZN",901832,"ASTRAZENECA PLC"],["TXN",97476,"TEXAS INSTRUMENTS INC"],["RY",1000275,"ROYAL BANK OF CANADA"],["RTX",101829,"RTX Corp"],["SAP",1000184,"SAP SE"],["NFLX",1065280,"NETFLIX INC"],["GS",886982,"GOLDMAN SACHS GROUP INC"],["TMO",97745,"THERMO FISHER SCIENTIFIC INC."],["DELL",1571996,"Dell Technologies Inc."],["WFC",72971,"WELLS FARGO & COMPANY/MN"],["AMGN",318154,"AMGEN INC"],["BABA",1577552,"Alibaba Group Holding Ltd"],["CRWD",1535527,"CrowdStrike Holdings, Inc."],["GEV",1996810,"GE Vernova Inc."],["MUFG",67088,"MITSUBISHI UFJ FINANCIAL GROUP INC"],["LIN",1707925,"LINDE PLC"],["IBM",51143,"INTERNATIONAL BUSINESS MACHINES CORP"],["TM",1094517,"TOYOTA MOTOR CORP/"],["AXP",4962,"AMERICAN EXPRESS CO"],["ANET",1596532,"Arista Networks, Inc."],["ARM",1973239,"ARM HOLDINGS PLC /UK"],["CYATY",2070829,"Contemporary Amperex Technology Co., Limited/ADR"],["GILD",882095,"GILEAD SCIENCES, INC."],["APH",820313,"AMPHENOL CORP /DE/"],["TD",947263,"TORONTO DOMINION BANK"],["TTE",879764,"TotalEnergies SE"],["ADI",6281,"ANALOG DEVICES INC"],["C",831001,"CITIGROUP INC"],["KLAC",319201,"KLA CORP"],["BHP",811809,"BHP Group Ltd"],["DIS",1744489,"Walt Disney Co"],["ABT",1800,"ABBOTT LABORATORIES"],["BLK",2012383,"BlackRock, Inc."],["PEP",77476,"PEPSICO INC"],["SHOP",1594805,"SHOPIFY INC."],["VZ",732712,"VERIZON COMMUNICATIONS INC"],["MCD",63908,"MCDONALDS CORP"],["CRM",1108524,"Salesforce, Inc."],["DE",315189,"DEERE & CO"],["UNP",100885,"UNION PACIFIC CORP"],["NEE",753308,"NEXTERA ENERGY INC"],["NVO",353278,"NOVO NORDISK A S"],["WELL",766704,"WELLTOWER INC."],["QCOM",804328,"QUALCOMM INC/DE"],["COP",1163165,"CONOCOPHILLIPS"],["PFE",78003,"PFIZER INC"],["TMUS",1283699,"T-Mobile US, Inc."],["SAN",891478,"Banco Santander, S.A."],["DHR",313616,"DANAHER CORP /DE/"],["RTNTF",887028,"RIO TINTO LTD"],["ATEYY",1158838,"ADVANTEST CORP"],["BUD",1668717,"Anheuser-Busch InBev SA/NV"],["SNDK",2023554,"Sandisk Corp"],["ISRG",1035267,"INTUITIVE SURGICAL INC"],["ACN",1467373,"Accenture plc"],["SCHW",316709,"SCHWAB CHARLES CORP"],["MRVL",1835632,"Marvell Technology, Inc."],["ETN",1551182,"Eaton Corp plc"],["TJX",109198,"TJX COMPANIES INC /DE/"],["SMFG",1022837,"SUMITOMO MITSUI FINANCIAL GROUP, INC."],["SONY",313838,"Sony Group Corp"],["LMT",936468,"LOCKHEED MARTIN CORP"],["SCCO",1001838,"SOUTHERN COPPER CORP/"],["UBS",1610520,"UBS Group AG"],["T",732717,"AT&T INC."],["HTHIY",47710,"HITACHI LTD"],["BX",1393818,"Blackstone Inc."],["CB",896159,"Chubb Ltd"],["UL",217410,"UNILEVER PLC"],["DTEGY",946770,"DEUTSCHE TELEKOM AG"],["STX",1137789,"Seagate Technology Holdings plc"],["BA",12927,"BOEING CO"],["UBER",1543151,"Uber Technologies, Inc"],["PBR",1119639,"PETROBRAS - PETROLEO BRASILEIRO SA"],["SPGI",64040,"S&P Global Inc."],["VRTX",875320,"VERTEX PHARMACEUTICALS INC / MA"],["RIO",863064,"RIO TINTO PLC"],["PGR",80661,"PROGRESSIVE CORP/OH/"],["BBVA",842180,"BANCO BILBAO VIZCAYA ARGENTARIA, S.A."],["IBKR",1381197,"Interactive Brokers Group, Inc."],["BTI",1303523,"British American Tobacco p.l.c."],["WDC",106040,"WESTERN DIGITAL CORP"],["MO",764180,"ALTRIA GROUP, INC."],["COF",927628,"CAPITAL ONE FINANCIAL CORP"],["BMY",14272,"BRISTOL MYERS SQUIBB CO"],["MDT",1613103,"Medtronic plc"],["PLD",1045609,"Prologis, Inc."],["SMERY",1830056,"Siemens Energy AG/ADR"],["SPOT",1639920,"Spotify Technology S.A."],["BP",313807,"BP PLC"],["MPC",1510295,"Marathon Petroleum Corp"],["LOW",60667,"LOWES COMPANIES INC"],["BMO",927971,"BANK OF MONTREAL /CAN/"],["PH",76334,"Parker-Hannifin Corp"],["SBUX",829224,"STARBUCKS CORP"],["HDB",1144967,"HDFC BANK LTD"],["SYK",310764,"STRYKER CORP"],["ADP",8670,"AUTOMATIC DATA PROCESSING INC"],["MCK",927653,"MCKESSON CORP"],["CVS",64803,"CVS HEALTH Corp"],["MFG",1335730,"MIZUHO FINANCIAL GROUP INC"],["PDD",1737806,"PDD Holdings Inc."],["BKNG",1075531,"Booking Holdings Inc."],["BNS",9631,"BANK OF NOVA SCOTIA"],["NOW",1373715,"ServiceNow, Inc."],["NEM",1164727,"NEWMONT Corp /DE/"],["CNQ",1017413,"CANADIAN NATURAL RESOURCES Ltd"],["ENB",895728,"ENBRIDGE INC"],["CME",1156375,"CME GROUP INC."],["GLW",24741,"CORNING INC /NY"],["VLO",1035002,"VALERO ENERGY CORP/TX"],["SNY",1121404,"Sanofi"],["IBN",1103838,"ICICI BANK LTD"],["SO",92122,"SOUTHERN CO"],["EQNR",1140625,"EQUINOR ASA"],["MAR",1048286,"MARRIOTT INTERNATIONAL INC /MD/"],["PSX",1534701,"Phillips 66"],["CM",1045520,"CANADIAN IMPERIAL BANK OF COMMERCE /CAN/"]];
/** Matches a ticker exactly, or a company name by substring (case-insensitive). A bare number is taken as a CIK. */
export function lookupTicker(q) {
  const t = String(q || '').trim();
  if (!t) return [];
  if (/^\d{1,10}$/.test(t)) return [{ ticker: '', cik: +t, name: `CIK ${t}` }];
  const up = t.toUpperCase(), lo = t.toLowerCase();
  const exact = CIKS.filter((r) => r[0] === up), rest = CIKS.filter((r) => r[0] !== up && (r[0].startsWith(up) || r[2].toLowerCase().includes(lo)));
  return [...exact, ...rest].slice(0, 12).map(([ticker, cik, name]) => ({ ticker, cik, name }));
}

/** XBRL tags tried for each field, in order of preference (us-gaap taxonomy; dei for shares outstanding). */
export const TAGS = {
  revenue: ['RevenueFromContractWithCustomerExcludingAssessedTax', 'Revenues', 'SalesRevenueNet', 'RevenueFromContractWithCustomerIncludingAssessedTax', 'SalesRevenueGoodsNet', 'RevenuesNetOfInterestExpense'],
  cogs: ['CostOfGoodsAndServicesSold', 'CostOfRevenue', 'CostOfGoodsSold', 'CostOfServices'],
  grossProfit: ['GrossProfit'],
  opex: ['OperatingExpenses', 'SellingGeneralAndAdministrativeExpense'],
  ebit: ['OperatingIncomeLoss'],
  da: ['DepreciationDepletionAndAmortization', 'DepreciationAndAmortization', 'DepreciationAmortizationAndAccretionNet', 'Depreciation'],
  interestExpense: ['InterestExpense', 'InterestExpenseNonoperating', 'InterestExpenseDebt', 'InterestAndDebtExpense'],
  interestIncome: ['InvestmentIncomeInterest', 'InterestIncomeOther', 'NonoperatingIncomeExpense'],
  pretax: ['IncomeLossFromContinuingOperationsBeforeIncomeTaxesExtraordinaryItemsNoncontrollingInterest', 'IncomeLossFromContinuingOperationsBeforeIncomeTaxesMinorityInterestAndIncomeLossFromEquityMethodInvestments'],
  tax: ['IncomeTaxExpenseBenefit'],
  netIncome: ['NetIncomeLoss', 'ProfitLoss', 'NetIncomeLossAvailableToCommonStockholdersBasic'],
  shares: ['WeightedAverageNumberOfDilutedSharesOutstanding', 'WeightedAverageNumberOfShareOutstandingBasicAndDiluted', 'WeightedAverageNumberOfSharesOutstandingBasic'],
  dividends: ['PaymentsOfDividends', 'PaymentsOfDividendsCommonStock', 'PaymentsOfOrdinaryDividends'],
  buybacks: ['PaymentsForRepurchaseOfCommonStock'],
  cash: ['CashAndCashEquivalentsAtCarryingValue', 'CashCashEquivalentsRestrictedCashAndRestrictedCashEquivalents', 'Cash'],
  shortTermInvestments: ['MarketableSecuritiesCurrent', 'ShortTermInvestments', 'AvailableForSaleSecuritiesDebtSecuritiesCurrent'],
  receivables: ['AccountsReceivableNetCurrent', 'ReceivablesNetCurrent'],
  inventory: ['InventoryNet', 'InventoryFinishedGoodsNetOfReserves'],
  otherCurrentAssets: ['OtherAssetsCurrent', 'PrepaidExpenseAndOtherAssetsCurrent'],
  currentAssets: ['AssetsCurrent'],
  ppeNet: ['PropertyPlantAndEquipmentNet', 'PropertyPlantAndEquipmentAndFinanceLeaseRightOfUseAssetAfterAccumulatedDepreciationAndAmortization'],
  goodwill: ['Goodwill'],
  intangibles: ['IntangibleAssetsNetExcludingGoodwill', 'FiniteLivedIntangibleAssetsNet'],
  otherNoncurrentAssets: ['OtherAssetsNoncurrent'],
  totalAssets: ['Assets'],
  payables: ['AccountsPayableCurrent', 'AccountsPayableAndAccruedLiabilitiesCurrent'],
  currentDebt: ['LongTermDebtCurrent', 'DebtCurrent', 'ShortTermBorrowings', 'CommercialPaper'],
  otherCurrentLiabilities: ['OtherLiabilitiesCurrent', 'AccruedLiabilitiesCurrent'],
  currentLiabilities: ['LiabilitiesCurrent'],
  longTermDebt: ['LongTermDebtNoncurrent', 'LongTermDebt', 'LongTermDebtAndCapitalLeaseObligations'],
  leaseLiabilities: ['OperatingLeaseLiability', 'OperatingLeaseLiabilityNoncurrent'],
  otherNoncurrentLiabilities: ['OtherLiabilitiesNoncurrent'],
  totalLiabilities: ['Liabilities'],
  minorityInterest: ['MinorityInterest'],
  preferredEquity: ['PreferredStockValue'],
  equity: ['StockholdersEquity', 'StockholdersEquityIncludingPortionAttributableToNoncontrollingInterest'],
  retainedEarnings: ['RetainedEarningsAccumulatedDeficit'],
  cfo: ['NetCashProvidedByUsedInOperatingActivities', 'NetCashProvidedByUsedInOperatingActivitiesContinuingOperations'],
  capex: ['PaymentsToAcquirePropertyPlantAndEquipment', 'PaymentsToAcquireProductiveAssets', 'PaymentsForCapitalImprovements'],
  investingCF: ['NetCashProvidedByUsedInInvestingActivities', 'NetCashProvidedByUsedInInvestingActivitiesContinuingOperations'],
  financingCF: ['NetCashProvidedByUsedInFinancingActivities', 'NetCashProvidedByUsedInFinancingActivitiesContinuingOperations'],
};
const INSTANT = new Set(['cash', 'shortTermInvestments', 'receivables', 'inventory', 'otherCurrentAssets', 'currentAssets', 'ppeNet', 'goodwill', 'intangibles', 'otherNoncurrentAssets', 'totalAssets', 'payables', 'currentDebt', 'otherCurrentLiabilities', 'currentLiabilities', 'longTermDebt', 'leaseLiabilities', 'otherNoncurrentLiabilities', 'totalLiabilities', 'minorityInterest', 'preferredEquity', 'equity', 'retainedEarnings']);
const dayDiff = (a, b) => (Date.parse(b) - Date.parse(a)) / 86400000;

/** Annual values of one tag: one per fiscal-year end, from 10-K (or 20-F/40-F) filings; the most recently filed figure
 *  for a period wins, so restatements replace the original. Duration facts must span about a year. */
function annualValues(fact, instant) {
  const units = fact?.units || {};
  const unit = Object.keys(units).find((u) => /^(USD|shares|pure)$/.test(u)) || Object.keys(units)[0];
  if (!unit) return { unit: null, rows: [] };
  const best = new Map();
  for (const r of units[unit]) {
    if (!/^(10-K|10-K\/A|20-F|20-F\/A|40-F|40-F\/A)$/.test(r.form || '')) continue;
    if (!instant) { if (!r.start || dayDiff(r.start, r.end) < 350 || dayDiff(r.start, r.end) > 380) continue; }
    const key = r.end;
    const cur = best.get(key);
    if (!cur || (r.filed || '') > (cur.filed || '') || ((r.filed || '') === (cur.filed || '') && r.frame && !cur.frame)) best.set(key, r);
  }
  return { unit, rows: [...best.values()].sort((a, b) => (a.end < b.end ? -1 : 1)) };
}

/**
 * Maps a companyfacts JSON document to history periods. `years` keeps the most recent n fiscal years; `unit` is the
 * money unit to convert to (1e6 for millions). Shares are converted to the same unit.
 */
export function factsToHistory(facts, { years = 6, unit = 1e6 } = {}) {
  const gaap = facts?.facts?.['us-gaap'] || facts?.facts?.['ifrs-full'] || {};
  if (!facts?.facts || !Object.keys(gaap).length) return { error: 'This JSON has no us-gaap facts in it. It should be the companyfacts document from data.sec.gov.' };
  const byEnd = new Map(), tags = {}, periods = new Map(), warnings = [];
  for (const [field, candidates] of Object.entries(TAGS)) {
    const instant = INSTANT.has(field);
    let chosen = null;
    for (const tag of candidates) { if (gaap[tag]) { const av = annualValues(gaap[tag], instant); if (av.rows.length) { chosen = { tag, ...av }; break; } } }
    if (!chosen) continue;
    tags[field] = chosen.tag;
    const scale = field === 'shares' ? 1 / unit : (chosen.unit === 'USD' ? 1 / unit : 1 / unit);
    for (const r of chosen.rows) {
      const end = r.end, fy = +end.slice(0, 4);
      const row = byEnd.get(end) || { year: fy, end };
      row[field] = r.val * scale;
      byEnd.set(end, row);
      const p = periods.get(end) || { end, year: fy, forms: new Set(), filed: '', accn: '' };
      p.forms.add(r.form);
      if ((r.filed || '') > p.filed) { p.filed = r.filed; p.accn = r.accn; }
      periods.set(end, p);
    }
  }
  // fiscal years ending within the same calendar year (a 52/53-week year can end on 30 Dec or 2 Jan): keep the later end
  const rows = [...byEnd.values()].sort((a, b) => (a.end < b.end ? -1 : 1));
  const byYear = new Map();
  for (const r of rows) { const prev = byYear.get(r.year); byYear.set(r.year, prev ? { ...prev, ...r } : r); }
  let history = [...byYear.values()].sort((a, b) => a.year - b.year);
  // drop sparse years (a stray instant fact) and keep the recent ones
  history = history.filter((h) => fin(h.revenue) || fin(h.totalAssets)).slice(-years);
  if (!history.length) return { error: 'No annual 10-K figures were found in this document.' };
  if (!tags.revenue) warnings.push('No revenue tag was recognised (some companies report revenue under an industry tag); enter revenue by hand.');
  if (!tags.da) warnings.push('No depreciation and amortisation tag was found; it is often only in the cash-flow statement footnotes. Enter it from the 10-K.');
  const currency = Object.keys(gaap[tags.revenue || tags.totalAssets]?.units || {})[0] || 'USD';
  if (currency !== 'USD') warnings.push(`Figures are reported in ${currency}, not USD.`);
  return {
    history: history.map(({ end, ...h }) => h),
    source: { kind: 'edgar', entityName: facts.entityName, cik: facts.cik, currency, unit, tags, retrieved: new Date().toISOString().slice(0, 10),
      periods: history.map((h) => { const p = periods.get(h.end) || periods.get([...periods.keys()].find((k) => k.startsWith(String(h.year)))) || {}; return { year: h.year, end: h.end, form: [...(p.forms || [])].join('/'), filed: p.filed, accn: p.accn, url: p.accn ? filingIndexUrl(facts.cik, p.accn) : '' }; }),
      note: `US GAAP figures from SEC EDGAR company facts (XBRL) for ${facts.entityName}, CIK ${facts.cik}: annual values from 10-K filings, the latest filed figure for each fiscal year. Period ends and accession numbers listed per year.` },
    warnings,
  };
}

/** Company name, SIC, fiscal year end and recent 10-K filings from the submissions endpoint (allowed cross-origin). */
export async function fetchSubmissions(cik) {
  const r = await fetch(SUBMISSIONS_URL(cik), { headers: { Accept: 'application/json' } });
  if (!r.ok) throw new Error(`SEC returned ${r.status} for CIK ${cik}.`);
  const j = await r.json();
  const rec = j.filings?.recent || {};
  const tenKs = (rec.form || []).map((f, i) => ({ form: f, filed: rec.filingDate?.[i], accn: rec.accessionNumber?.[i], period: rec.reportDate?.[i], doc: rec.primaryDocument?.[i] })).filter((x) => /^(10-K|20-F|40-F)$/.test(x.form)).slice(0, 8);
  return { name: j.name, cik: j.cik, sic: j.sic, sicDescription: j.sicDescription, fiscalYearEnd: j.fiscalYearEnd, tickers: j.tickers || [], exchanges: j.exchanges || [], tenKs: tenKs.map((x) => ({ ...x, url: `https://www.sec.gov/Archives/edgar/data/${+j.cik}/${String(x.accn).replace(/-/g, '')}/${x.doc}` })) };
}
/** Tries the companyfacts endpoint; rejects with { corsBlocked: true } when the browser cannot read it. */
export async function fetchFacts(cik) {
  try {
    const r = await fetch(factsUrl(cik), { headers: { Accept: 'application/json' } });
    if (!r.ok) throw new Error(`SEC returned ${r.status} for CIK ${cik}.`);
    return await r.json();
  } catch (e) {
    if (e instanceof TypeError) { const err = new Error('The browser could not read data.sec.gov directly (the XBRL API sends no cross-origin header).'); err.corsBlocked = true; throw err; }
    throw e;
  }
}
