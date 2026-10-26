// liquidity.js — F03 · Liquidity. Content only; exercises are in liquidity.ex.js.
// Lantern’s figures come from case.js (COMPARATIVE, PERIODS) and the ratios from core/ratios.js. 2026 is ten months,
// but every ratio here except the operating cash flow ratio is a balance-sheet ratio, so the period’s length doesn’t
// matter to it. Starbucks FY2024 figures are from its Form 10-K (EDGAR’s XBRL rendering: R7 is the balance sheet, R5 the
// cash flows); Harbourline Roasters is F00’s fictional roaster. The 2028 covenant of 1.2 is F00’s hypothetical
// (governance-and-agency). Solvency, the Z-score and the credit decision belong to later lessons.
import { PERIODS, COMPARATIVE, FACTS } from './case.js?v=18';
import { HARBOURLINE as HB, HARBOURLINE_DETAIL as HBD } from '../f00/case.js?v=18';
import * as R from '../../../core/ratios.js?v=18';

const P26 = PERIODS[2026], P27 = PERIODS[2027];
const L26 = R.liquidity(P26), L27 = R.liquidity(P27);
const row = (label) => COMPARATIVE.balance.find((r) => r[0] === label);
const b26 = (label) => row(label)[1], b27 = (label) => row(label)[2];
const fmt = (v) => (v < 0 ? `(${Math.abs(v).toLocaleString('en-US')})` : v.toLocaleString('en-US'));
const r2 = (v) => v.toFixed(2);

// current liabilities by kind, 2027
const CL = {
  debt27: b27('Current Portion of Long-Term Debt') + b27('Line of Credit'),                 // 51,091
  lease27: b27('Current Portion of Operating Lease Liabilities'),                             // 37,010
};
CL.trade27 = P27.currentLiabilities - CL.debt27 - CL.lease27;                                 // 26,436
const brewer2028 = b27('Current Portion of Long-Term Debt') - 10_000 - 5_000;                 // 12,091

// the working-capital bridge: ΔWC = ΔEquity + ΔNoncurrent liabilities − ΔNoncurrent assets
const NC26 = b26('Total noncurrent assets'), NC27 = b27('Total noncurrent assets');
const BR = {
  retained: P27.netIncome - P27.dividends,                                                    // 20,431
  ppe: -(P27.ppeNet - P26.ppeNet),                                                            // −58,200
  lease: -P27.rightOfUse + b27('Operating Lease Liabilities'),                                // −37,010
  debt: (b27('Notes Payable') + b27('Instalment Note Payable')) - b26('Notes Payable'),       // −10,841
};
BR.total = BR.retained + BR.ppe + BR.lease + BR.debt;                                          // −85,620

// the cash story
const CF = (label) => COMPARATIVE.cash.find((r) => r[0] === label)[2];
const capex = -CF('Net cash used in investing activities');                                   // 54,000
const repaid = -(CF('Repayment of instalment note payable') + CF('Repayment of notes payable'));   // 12,750

// what-ifs on the 2027 balance sheet
const ca27 = P27.currentAssets, cl27 = P27.currentLiabilities;
const crNoContract = (ca27 - P27.contractAsset) / cl27;                                      // 0.25
const crNoLease = ca27 / (cl27 - CL.lease27);                                                // 0.76
const undrawn = FACTS.lineOfCredit.limit - b27('Line of Credit');                           // 6,000
const COV = 1.2;
const needCA = COV * cl27, shortfall = needCA - ca27;                                        // 137,444; 78,340
const termOut = b27('Line of Credit') + 10_000;                                              // 34,000
const crTermOut = ca27 / (cl27 - termOut);                                                   // 0.73
const shortfallTermOut = COV * (cl27 - termOut) - ca27;                                      // 37,540

// Starbucks FY2024 (52 weeks ended 29 September 2024), $ millions, Form 10-K
const SB = { ca: 6847.4, cl: 9070.0, cash: 3286.2, sti: 257.0, ar: 1213.8, inv: 1777.3, prepaid: 313.1,
  leaseCur: 1463.1, deferredCur: 1781.2, cfo: 6095.6, ca23: 7303.4, cl23: 9345.3 };
const SBL = R.liquidity({ currentAssets: SB.ca, currentLiabilities: SB.cl, cash: SB.cash, shortTermInvestments: SB.sti, receivables: SB.ar, cfo: SB.cfo });

// Harbourline (fictional, F00), $ millions
const HBL = R.liquidity({ currentAssets: HB.currentAssets, currentLiabilities: HB.currentLiabilities, cash: HB.cash, receivables: HBD.receivables });

// The bridge from 2026’s working capital to 2027’s, as a horizontal waterfall.
const bridgeSVG = (() => {
  const rows = [['Working capital, 31 Dec 2026', P26.currentAssets - P26.currentLiabilities, 't'],
    ['Profit kept (net income − dividends)', BR.retained, 'f'],
    ['Cafés’ fit-out, machines and brewer, net', BR.ppe, 'f'],
    ['Lease payments due in 2028', BR.lease, 'f'],
    ['Long-term debt falling due in 2028', BR.debt, 'f'],
    ['Working capital, 31 Dec 2027', L27.workingCapital, 't']];
  const x0 = 470, scale = 300 / 100000, rowH = 28, top = 10;
  let run = 0, out = '';
  rows.forEach(([label, v, kind], i) => {
    const y = top + i * rowH;
    const from = kind === 't' ? 0 : run, to = kind === 't' ? v : run + v;
    const lo = Math.min(from, to), hi = Math.max(from, to);
    const fill = kind === 't' ? 'var(--series-3)' : v >= 0 ? 'var(--series-1)' : 'var(--series-2)';
    out += `<text x="240" y="${y + 17}" text-anchor="end" fill="currentColor">${label}</text>`;
    out += `<rect x="${(x0 + lo * scale).toFixed(1)}" y="${y + 5}" width="${Math.max(1, (hi - lo) * scale).toFixed(1)}" height="16" fill="${fill}"/>`;
    const amt = `${v < 0 ? '−' : kind === 't' ? '' : '+'}$${Math.abs(v).toLocaleString('en-US')}`;
    out += v >= 0 ? `<text x="${(x0 + hi * scale + 6).toFixed(1)}" y="${y + 18}" fill="currentColor">${amt}</text>`
      : `<text x="${(x0 + lo * scale - 6).toFixed(1)}" y="${y + 18}" text-anchor="end" fill="currentColor">${amt}</text>`;
    run = to;
  });
  const h = top + rows.length * rowH + 8;
  return `<svg viewBox="0 0 640 ${h}" xmlns="http://www.w3.org/2000/svg" font-family="inherit" font-size="12"><line x1="${x0}" y1="${top}" x2="${x0}" y2="${h - 4}" stroke="var(--rule-strong)"/>${out}</svg>`;
})();
const bridgeAlt = 'Horizontal waterfall chart from Lantern’s working capital at 31 December 2026 to 31 December 2027. It starts at $30,187. Profit kept in the business adds $20,431. The cafés’ fit-out, machines and the brewer, net of the year’s depreciation, subtract $58,200. The lease payments due in 2028 subtract $37,010. Long-term debt falling due in 2028, net of new long-term borrowing, subtracts $10,841. Working capital ends at −$55,433, below zero.';

export default {
  slug: 'liquidity',
  title: 'Liquidity',
  blurb: 'Measure whether a business can pay what falls due in the next year: working capital and the current, quick, cash and operating cash flow ratios, what belongs in each and why, and how to explain a fall like Lantern’s from 2.15 to 0.52.',
  status: 'draft',
  objectives: [
    'Calculate working capital and the current, quick, cash and operating cash flow ratios from a classified balance sheet and a statement of cash flows.',
    'Classify current assets and liabilities by how close they are to cash, including a contract asset, prepayments, unearned revenue, current lease liabilities and a drawn line of credit.',
    'Explain why cafés and restaurants can run current ratios below 1 without being in difficulty, using Starbucks’ balance sheet.',
    'Analyse a change in working capital with the balance-sheet identity, and explain what drove Lantern’s fall from 2.15 to 0.52.',
    'Identify window dressing and assess what a minimum current ratio covenant would require of a borrower.',
  ],
  prerequisites: [
    { lesson: 'f00/capital-and-liquidity', why: 'Working capital, the current ratio and the quick ratio were introduced there; this lesson builds on them.' },
    { lesson: 'f02/balance-sheet-and-equity', why: 'The ratios read a classified balance sheet: current and noncurrent items, and the current portion of long-term debt.' },
    { lesson: 'f02/revenue-recognition', why: 'The contract asset and unearned revenue (a contract liability) come from there.' },
    { lesson: 'f03/common-size-statements', why: 'You will compare Lantern with Starbucks, a business hundreds of thousands of times larger.' },
  ],
  case: 'lantern',

  concept: [
    { case: 'In January 2028 Coastline Bank’s credit officer reads Lantern’s 2027 statements, as the bank does every year for its borrowers. One line stops her. At 31 December 2026 Lantern had $2.15 of current assets for every dollar it owed within the year; at 31 December 2027 it had $0.52. Ana’s first reaction is that the business has never been busier, and she is right: revenue roughly tripled. Both facts are true at once, and this lesson shows how.' },
    { p: '<g>Liquidity</g>, for a business, is its ability to pay its obligations as they fall due. Liquidity analysis asks a narrow question: will the cash that arrives over the coming months, together with the cash already held, cover the bills, wages, rent and loan payments due over the same months? It is a different question from profitability (does the business earn more than it spends over a year?) and from <g>solvency</g> (is it worth more than everything it owes, in the long run?). A profitable, solvent business can still fail for lack of cash on the wrong day.' },
    { p: 'F00 introduced the first two measures: <g>working capital</g>, current assets minus current liabilities, and the <g>current ratio</g>, current assets divided by current liabilities. Both rest on the balance sheet’s one-year line: a current asset is expected to turn into cash, or be used up, within a year (or the operating cycle, if longer); a current liability is due within a year. This lesson adds three stricter measures, shows what belongs in each, and uses them to explain Lantern’s year.' },
    { table: {
      caption: 'Lantern Coffee Co.: current assets and current liabilities at 31 December (fictional, $)',
      head: ['', '2026', '2027'],
      align: ['l', 'r', 'r'],
      rows: [
        ...COMPARATIVE.balance.slice(0, COMPARATIVE.balance.findIndex((r) => r[0] === 'Total current assets')).map(([n, a, b]) => [n, fmt(a), fmt(b)]),
        ['<b>Total current assets</b>', `<b>${fmt(P26.currentAssets)}</b>`, `<b>${fmt(P27.currentAssets)}</b>`],
        ...COMPARATIVE.balance.slice(COMPARATIVE.balance.findIndex((r) => r[0] === 'Total assets') + 1, COMPARATIVE.balance.findIndex((r) => r[0] === 'Total current liabilities')).map(([n, a, b]) => [n, fmt(a), fmt(b)]),
        ['<b>Total current liabilities</b>', `<b>${fmt(P26.currentLiabilities)}</b>`, `<b>${fmt(P27.currentLiabilities)}</b>`],
      ],
      note: 'From the comparative balance sheet. The allowance is shown as a negative amount. 2026 is the end of Lantern’s first ten months of trading.',
    } },
    { p: 'Read the two columns before computing anything. Current assets barely moved, from $56,476 to $59,104, but their make-up changed completely: cash fell from $42,940 to $6,531, and a new item, the $30,840 <g>contract asset</g> for the law firm’s catering, now makes up more than half of the total. Current liabilities more than quadrupled, from $26,289 to $114,537, and almost all of the increase is borrowing and leases: the current portion of long-term debt ($27,091), the line of credit ($24,000) and the current portion of the cafés’ operating lease liabilities ($37,010). The ratios put numbers on what the table already says.' },
    { table: {
      caption: 'Lantern’s liquidity ratios',
      head: ['Measure', '2026', '2027'],
      align: ['l', 'r', 'r'],
      rows: [
        ['Working capital ($)', fmt(L26.workingCapital), '−55,433'],
        ['Current ratio', r2(L26.current), r2(L27.current)],
        ['Quick ratio', r2(L26.quick), r2(L27.quick)],
        ['Cash ratio', r2(L26.cash), r2(L27.cash)],
        ['Operating cash flow ratio', `${r2(L26.operatingCashFlow)} (ten months)`, r2(L27.operatingCashFlow)],
      ],
      note: 'Balance-sheet figures at 31 December. The operating cash flow ratio divides the period’s cash from operations by year-end current liabilities; 2026’s covers ten months.',
    } },
    { p: 'Every measure fell, and the stricter the measure, the harder it fell. At the end of 2026 Lantern could have paid every current liability out of cash alone and had cash left over (a cash ratio of 1.63). At the end of 2027 its cash covered 6 cents of each dollar due within the year. The rest of the lesson explains what each ratio counts, why the fall happened, and why a ratio below 1 is normal for some businesses and alarming for others.' },
    { callout: 'key', title: 'Liquidity is about timing and composition', html: 'A current ratio compares two totals at one date. Two businesses with the same ratio can be in very different positions: one holds cash and owes suppliers on 30-day terms; the other holds slow-moving stock and owes a bank loan due next week. Always look at what the current assets are, when they will turn into cash, and when each liability falls due.' },
  ],

  theory: [
    { h: 'A ladder of measures' },
    { p: 'The liquidity ratios form a ladder. Each step leaves out the current assets that are furthest from cash, so each answers a harsher version of the same question.' },
    { list: [
      '<b>Current ratio</b>: all current assets against all current liabilities. It assumes every current asset will become cash in time to meet the liabilities.',
      '<b>Quick ratio</b> (acid test): only cash, short-term investments and receivables, the assets that are already money or a customer’s promise to pay on a fixed date. Inventory (it must be sold first), prepayments (they will never come back as cash) and a contract asset (it is not yet billable) are left out.',
      '<b><g>Cash ratio</g></b>: cash and short-term investments only. It asks what could be paid tomorrow if nothing more came in.',
      '<b><g>Operating cash flow ratio</g></b>: cash from operations for the period against current liabilities at its end. It replaces a stock of assets with a flow: how much of what is owed would one period’s operations pay off?',
    ] },
    { p: 'None of these has a single right value. OpenStax’s <i>Principles of Finance</i> calls a 2 : 1 current ratio “actually quite high for most companies and most industries”, and notes that many firms operate successfully with a cash ratio below 1, since idle cash earns little. What matters is the comparison: with the same business in earlier years, with similar businesses, and with what the business must pay soon.' },

    { h: 'What goes in, and why' },
    { p: 'The balance sheet decides what is current; the analyst decides how close to cash each current item really is. Lantern’s 2027 balance sheet has examples of almost every kind.' },
    { table: {
      caption: 'Lantern’s current items at 31 December 2027, and where each belongs',
      head: ['Item', 'Current', 'Quick', 'Cash', 'Why'],
      align: ['l', 'l', 'l', 'l', 'l'],
      rows: [
        ['Cash, $6,531', 'Yes', 'Yes', 'Yes', 'Already money.'],
        ['Accounts receivable, net, $10,698', 'Yes', 'Yes', 'No', 'Catering clients invoiced on 30-day terms; net of the allowance for those not expected to pay.'],
        ['Contract asset, $30,840', 'Yes', 'No', 'No', 'Earned but not yet billable: the law firm pays its first year’s fee on 31 March 2028. One client, and an amount that depends on the CPI estimate.'],
        ['Inventory, $9,475', 'Yes', 'No', 'No', 'Beans and café stock: cash only when sold, at the till or online.'],
        ['Supplies, $960; prepaid insurance, $600', 'Yes', 'No', 'No', 'Used up in the business; they will never be turned back into cash.'],
      ],
    } },
    { p: 'The liabilities need the same care. <b>Accounts payable, wages, interest and income taxes payable</b> are paid in cash, mostly within weeks. <b>Unearned revenue</b> ($9,060 of deposits, workshop places and subscriptions) is different: the cash has already been received, and the obligation is settled by delivering the events, workshops and coffee. It needs cash only if customers ask for refunds, or for the costs of delivering. The <b>current portion of long-term debt</b> ($27,091) is principal Lantern must repay in 2028: the Coastline note ($10,000, due 1 March 2028), the van note’s instalment ($5,000) and the brewer plan’s 2028 principal ($12,091). The <b><g>line of credit</g></b> ($24,000 drawn) is shown as current. The <b>current portion of operating lease liabilities</b> ($37,010) is the part of the cafés’ lease liability that the 2028 rent payments will reduce.' },
    { callout: 'standards', title: 'Leases in current liabilities', html: 'Under ASC 842, which public companies in the US have applied for periods beginning after 15 December 2018 and other entities for periods beginning after 15 December 2021, a lessee recognises a right-of-use asset and a lease liability for an operating lease. The liability is split between current and noncurrent like a loan, but the right-of-use asset is noncurrent. Every new lease therefore lowers working capital and the current ratio. Before ASC 842 the cafés’ rent would have appeared only as an expense; the payments would still have been due. IFRS 16 has required the same for annual periods beginning on or after 1 January 2019. Leases as debt are taken up in the next lesson, <i>Solvency and leverage</i>.' },

    { h: 'Why Lantern’s ratios fell' },
    { p: 'The quickest way to explain a change in working capital uses the accounting equation. Split each side into current and noncurrent parts: current assets + noncurrent assets = current liabilities + noncurrent liabilities + equity. Rearranged:' },
    { math: String.raw`\text{Working capital} = \text{Equity} + \text{Noncurrent liabilities} - \text{Noncurrent assets}` },
    { p: 'Working capital is the part of the long-term funding (equity and long-term debt) that is not tied up in long-term assets. It rises when the business keeps profits or borrows long-term, and falls when it buys long-lived assets or when long-term debt moves into the coming year. Lantern’s working capital fell by $85,620 in 2027, and the identity splits the fall into four causes.' },
    { table: {
      caption: 'Why Lantern’s working capital fell from $30,187 to −$55,433 in 2027',
      head: ['Cause', 'Effect ($)', 'From the balance sheet'],
      align: ['l', 'r', 'l'],
      rows: [
        ['Profit kept in the business', '+20,431', 'Net income $22,431 less the $2,000 dividend'],
        ['Cafés’ fit-out and machines, and the brewer, net of depreciation', '−58,200', 'Property and equipment, net, up from $37,200 to $95,400'],
        ['Lease payments due in 2028', '−37,010', 'Right-of-use asset $173,379 (noncurrent) against noncurrent lease liabilities of $136,369'],
        ['Long-term debt falling due in 2028, net of new long-term debt', '−10,841', 'Noncurrent debt down from $25,000 to $14,159'],
      ],
      foot: [['Change in working capital', '−85,620', '']],
    } },
    { figure: { svg: bridgeSVG, caption: 'Lantern’s working capital, 2026 to 2027 (fictional figures in dollars).', alt: bridgeAlt } },
    { p: 'The biggest cause is the cafés. Lantern paid $36,000 for the fit-out and $18,000 for the machines in cash: long-lived assets bought with money that had been working capital. The statement of cash flows tells the same story from the other side. Operations brought in $8,341; buying the fit-out and machines took $54,000; repaying the van note and the brewer plan took $12,750 and the dividend $2,000. The $24,000 drawn on the line of credit filled part of the gap, and cash fell by $36,409. In effect Lantern paid for five-year assets with cash and with a loan due within a year, which is why its working capital went below zero.' },
    { p: 'The next two causes are not new spending but the passage of time. The leases put $37,010 of 2028 payments into current liabilities. The Coastline note, borrowed in 2026 for two years, is now due on 1 March 2028, and the brewer plan’s 2028 instalments are current. Look at Lantern’s current liabilities by kind and the point is plain: the trade items (payables, wages, interest, unearned revenue and tax) total $26,436, almost exactly the whole of 2026’s current liabilities ($26,289). All of the increase is debt ($51,091) and leases ($37,010).' },
    { p: 'The contract asset hides a further weakness. Without it the current ratio would be 0.25, not 0.52. It will turn into cash, $41,120 if the CPI estimate holds, on 31 March 2028, a month after the Coastline note’s $10,000 falls due. Liquidity is a calendar question as much as a ratio question, and the next cash-flow lessons return to what the contract asset means for the quality of 2027’s profit.' },

    { h: 'What the balance sheet does not show' },
    { list: [
      '<b>Undrawn facilities.</b> Lantern can still draw $6,000 on its $30,000 line of credit. Cash a business can borrow at short notice is liquidity that no ratio counts; companies describe their facilities in the notes and in management’s discussion.',
      '<b>Timing within the year.</b> The ratios compare totals, not dates. Wages due on 5 January and a note due on 1 March count the same.',
      '<b>Seasonality.</b> A balance sheet is a photograph of one day. Lantern’s year ends just after its December gift peak, when stock has been sold and cash collected; another date would give other ratios.',
      '<b>The owner.</b> A small company’s owner can often lend to it or invest more. That is support, not liquidity of the business itself, and a lender will not count on it unless it is written down.',
    ] },

    { h: 'Why cafés and restaurants run low current ratios' },
    { p: 'A business that is paid at the till holds few receivables, and one that sells fresh food and drink holds little stock. Its suppliers, meanwhile, give it normal trade credit. Its current assets are therefore small compared with what it owes, and a current ratio below 1 can be perfectly healthy if cash keeps arriving every day. Starbucks is the clearest example.' },
    { table: {
      caption: 'Starbucks Corporation: liquidity at 29 September 2024 ($ millions)',
      head: ['Item', 'FY2024', 'Note'],
      align: ['l', 'r', 'l'],
      rows: [
        ['Total current assets', '6,847.4', 'Cash and cash equivalents 3,286.2; short-term investments 257.0; receivables 1,213.8; inventories 1,777.3; prepaid and other 313.1'],
        ['Total current liabilities', '9,070.0', 'Includes the current operating lease liability, 1,463.1, and stored-value card liability and current deferred revenue, 1,781.2'],
        ['Current ratio', r2(SBL.current), 'FY2023: 0.78'],
        ['Quick ratio', r2(SBL.quick), ''],
        ['Net cash provided by operating activities', '6,095.6', 'Operating cash flow ratio 0.67'],
      ],
      note: 'Source: Starbucks Corporation Form 10-K for the fiscal year ended 29 September 2024, consolidated balance sheets and statements of cash flows.',
    } },
    { p: 'Two of Starbucks’ largest current liabilities make the ratio look worse than the position is. The stored-value card liability is money customers have already paid onto their cards; it is settled with coffee, not cash. The current operating lease liability is rent on the stores that produce the cash. Against both stand $6,095.6 million of operating cash flow in a year, enough to pay two-thirds of all current liabilities. Lantern’s 2027 operating cash flow ratio, 0.07, is the real difference: its cafés now give it a café’s balance sheet without, yet, a café chain’s cash flow.' },
    { p: 'For comparison, Harbourline Roasters, the fictional roaster from F00, has a current ratio of 1.50 and a quick ratio of 0.83. A roaster holds green and roasted coffee and sells to shops on credit, so its current assets are larger. Comparing Lantern with a peer means choosing one with the same business model, and Lantern is now a mixture: part café, part online shop, part caterer.' },

    { h: 'Comparing a ten-month year with a twelve-month one' },
    { p: 'The current, quick and cash ratios compare two balances at one date, so the length of the period before that date doesn’t enter them: 2026’s ratios compare directly with 2027’s. The operating cash flow ratio does mix a flow with a balance. Lantern’s 2026 cash from operations, $39,940, covers ten months; annualised (× 12 ÷ 10) it would be $47,928 and the ratio 1.82 rather than 1.52. Annualising assumes the missing two months look like the average ones, and Lantern’s first ten months included its December peak, so treat the 1.82 as an upper figure.' },

    { h: 'Window dressing' },
    { p: '<g>Window dressing</g> means arranging transactions around the year end so that the balance sheet looks better than the business’s normal position. The common moves: paying suppliers just before the year end, delaying purchases, chasing collections into December, or borrowing on 30 December and repaying on 2 January. Whether a move helps depends on whether the ratio is above or below 1. Paying a liability with cash takes the same amount off both totals: above 1 that raises the ratio, below 1 it lowers it.' },
    { list: [
      'At the end of 2026 (ratio 2.15), paying $6,000 of payables on 31 December would have raised the current ratio to 2.49 without making Lantern any more able to pay its bills.',
      'At the end of 2027 (ratio 0.52), the same payment would lower it to 0.49. Drawing the last $6,000 of the line of credit and holding the cash would instead raise it to 0.54, by adding the same amount to both totals.',
    ] },
    { p: 'An analyst guards against window dressing by comparing the year end with quarterly figures where they exist, by reading the cash-flow statement for unusual December movements, and by checking whether short-term borrowing at the year end matches the interest paid during the year.' },

    { h: 'Covenants in outline' },
    { p: 'Lenders write liquidity tests into loan agreements. A <g>covenants</g> clause might require a minimum current ratio, tested on the borrower’s quarterly or annual statements; failing it is a default that lets the lender demand repayment, raise the rate or impose conditions, although lenders often agree a waiver instead. The agreement defines the ratio, and the definition matters: whether operating lease liabilities, the current portion of the lender’s own loan or the drawn line of credit count as current liabilities can decide whether a borrower passes. The applied example below tests Lantern’s 2027 balance sheet against the 1.2 minimum in the loan Coastline is discussing for 2028.' },
  ],

  formulas: [
    { id: 'liq-working-capital', name: 'Working capital',
      tex: String.raw`\text{Working capital} = \text{Current assets} - \text{Current liabilities}`,
      where: [
        [String.raw`\text{Current assets}`, 'Cash and the assets expected to become cash or be used up within a year (or the operating cycle, if longer)', '$'],
        [String.raw`\text{Current liabilities}`, 'Obligations due within a year, including the current portions of long-term debt and of lease liabilities', '$'],
      ],
      assumptions: 'Both totals from the same balance sheet date.',
      note: 'Lantern 2027: <m>59{,}104 - 114{,}537 = -55{,}433</m>. Equivalently, equity + noncurrent liabilities − noncurrent assets.' },
    { id: 'liq-current', name: 'Current ratio',
      tex: String.raw`\text{Current ratio} = \dfrac{\text{Current assets}}{\text{Current liabilities}}`,
      where: [
        [String.raw`\text{Current assets}`, 'Total current assets', '$'],
        [String.raw`\text{Current liabilities}`, 'Total current liabilities', '$'],
      ],
      assumptions: 'Every current asset will become cash in time to meet the current liabilities.',
      note: 'A pure number, shown to two decimal places. Lantern: 2.15 (2026), 0.52 (2027).' },
    { id: 'liq-quick', name: 'Quick (acid-test) ratio',
      tex: String.raw`\text{Quick ratio} = \dfrac{\text{Cash} + \text{Short-term investments} + \text{Receivables (net)}}{\text{Current liabilities}}`,
      where: [
        [String.raw`\text{Cash}`, 'Cash and cash equivalents', '$'],
        [String.raw`\text{Short-term investments}`, 'Marketable securities that can be sold quickly at close to their value', '$'],
        [String.raw`\text{Receivables (net)}`, 'Accounts receivable less the allowance for doubtful accounts; not a contract asset', '$'],
        [String.raw`\text{Current liabilities}`, 'Total current liabilities', '$'],
      ],
      assumptions: 'Inventory, prepayments, supplies and contract assets are left out.',
      note: 'Lantern 2027: <m>(6{,}531 + 10{,}698) \\div 114{,}537 = 0.15</m>.' },
    { id: 'liq-cash', name: 'Cash ratio',
      tex: String.raw`\text{Cash ratio} = \dfrac{\text{Cash} + \text{Short-term investments}}{\text{Current liabilities}}`,
      where: [
        [String.raw`\text{Cash} + \text{Short-term investments}`, 'Money on hand and investments that can be sold at once', '$'],
        [String.raw`\text{Current liabilities}`, 'Total current liabilities', '$'],
      ],
      note: 'Lantern: 1.63 (2026), 0.06 (2027).' },
    { id: 'liq-ocf', name: 'Operating cash flow ratio',
      tex: String.raw`\text{Operating cash flow ratio} = \dfrac{\text{CFO}}{\text{Current liabilities}}`,
      where: [
        [String.raw`\text{CFO}`, 'Net cash from operating activities for the period', '$'],
        [String.raw`\text{Current liabilities}`, 'Total current liabilities at the end of the period', '$'],
      ],
      assumptions: 'A twelve-month period; annualise a part-year CFO (× 12 ÷ months) before comparing, and say that you did.',
      note: 'Some analysts divide by average current liabilities. Lantern 2027: <m>8{,}341 \\div 114{,}537 = 0.07</m>.' },
    { id: 'liq-wc-identity', name: 'Working capital from the long-term side of the balance sheet',
      tex: String.raw`\Delta\text{Working capital} = \Delta\text{Equity} + \Delta\text{Noncurrent liabilities} - \Delta\text{Noncurrent assets}`,
      where: [
        [String.raw`\Delta`, 'Closing balance minus opening balance', '$'],
        [String.raw`\text{Equity}`, 'Total shareholders’ equity', '$'],
        [String.raw`\text{Noncurrent liabilities}`, 'Long-term debt, noncurrent lease liabilities and other long-term obligations', '$'],
        [String.raw`\text{Noncurrent assets}`, 'Property and equipment (net), right-of-use assets and other long-term assets', '$'],
      ],
      note: 'Lantern 2027: <m>20{,}431 + 125{,}528 - 231{,}579 = -85{,}620</m>.' },
  ],

  examples: [
    { level: 'simple', title: 'Lantern’s liquidity ratios, two year ends',
      fictional: true,
      setup: 'Use the current assets and current liabilities in the first table of the lesson, and Lantern’s cash from operations ($39,940 for the ten months of 2026; $8,341 for 2027), to calculate the five measures for both year ends.',
      steps: [
        String.raw`Working capital: <m>56{,}476 - 26{,}289 = 30{,}187</m> (2026); <m>59{,}104 - 114{,}537 = -55{,}433</m> (2027).`,
        String.raw`Current ratio: <m>56{,}476 \div 26{,}289 = 2.15</m>; <m>59{,}104 \div 114{,}537 = 0.52</m>.`,
        String.raw`Quick ratio, with cash and net receivables only (Lantern has no short-term investments; the contract asset, inventory, supplies and prepayment are out): <m>(42{,}940 + 6{,}796) \div 26{,}289 = 1.89</m>; <m>(6{,}531 + 10{,}698) \div 114{,}537 = 0.15</m>.`,
        String.raw`Cash ratio: <m>42{,}940 \div 26{,}289 = 1.63</m>; <m>6{,}531 \div 114{,}537 = 0.06</m>.`,
        String.raw`Operating cash flow ratio: <m>39{,}940 \div 26{,}289 = 1.52</m> for ten months (1.82 annualised); <m>8{,}341 \div 114{,}537 = 0.07</m>.`,
      ],
      answer: '2026: working capital $30,187; current 2.15; quick 1.89; cash 1.63; operating cash flow 1.52 (ten months). 2027: working capital −$55,433; current 0.52; quick 0.15; cash 0.06; operating cash flow 0.07.',
      interpretation: 'At the end of 2026 Lantern was very liquid, arguably more than it needed to be. At the end of 2027 it depends on cash it has not yet received: the law firm’s fee, the next months’ sales and its remaining $6,000 of credit line.' },
    { level: 'challenging', title: 'Where did $85,620 of working capital go?',
      fictional: true,
      setup: 'Using Lantern’s comparative balance sheet (noncurrent assets $37,200 and $268,779; noncurrent liabilities $25,000 and $150,528; equity $42,387 and $62,818), explain the change in working capital in 2027 by cause. The noncurrent items are: property and equipment, net, $37,200 and $95,400; right-of-use assets $0 and $173,379; notes payable $25,000 and $10,000; instalment note payable $0 and $4,159; noncurrent operating lease liabilities $0 and $136,369.',
      steps: [
        String.raw`Check the total with the identity: <m>\Delta\text{WC} = \Delta\text{Equity} + \Delta\text{NCL} - \Delta\text{NCA} = 20{,}431 + 125{,}528 - 231{,}579 = -85{,}620</m>, which agrees with <m>-55{,}433 - 30{,}187</m>.`,
        String.raw`Equity: up $20,431, which is net income of $22,431 less the $2,000 dividend; no shares were issued.`,
        String.raw`Property and equipment: up <m>95{,}400 - 37{,}200 = 58{,}200</m>, net of the year’s depreciation; this reduces working capital by $58,200.`,
        String.raw`Leases: the right-of-use asset ($173,379) is entirely noncurrent, but only $136,369 of the liability is; the difference, <m>173{,}379 - 136{,}369 = 37{,}010</m>, is the current lease liability, which reduces working capital.`,
        String.raw`Debt: noncurrent debt fell from $25,000 to <m>10{,}000 + 4{,}159 = 14{,}159</m>, a change of −10,841. The Coastline note ($10,000) and the van’s 2028 instalment ($5,000) moved into current liabilities, and of the brewer plan’s $16,250 only $4,159 is due after 2028.`,
        String.raw`Total: <m>20{,}431 - 58{,}200 - 37{,}010 - 10{,}841 = -85{,}620</m>.`,
      ],
      answer: 'Profit kept added $20,431; the new long-lived assets took $58,200; the leases’ 2028 payments $37,010; and debt falling due, net, $10,841. Working capital fell by $85,620.',
      interpretation: 'The cafés explain most of the fall: their fit-out and machines were paid for in cash, and their leases bring a year’s rent into current liabilities. Profit was not the problem. A business that funds long-lived assets from working capital and short-term borrowing will see these ratios fall, however well it trades.' },
    { level: 'applied', title: 'Could Lantern meet a 1.2 covenant?',
      fictional: true,
      setup: 'Coastline is discussing a five-year loan for 2028 whose agreement would require a current ratio of at least 1.2 (F00’s scenario). Ana asks what it would take for a balance sheet like Lantern’s at 31 December 2027 to pass. Consider three options: (a) new equity received as cash; (b) replacing the line of credit and the Coastline note with long-term borrowing; (c) a definition that leaves operating lease liabilities out of current liabilities.',
      steps: [
        String.raw`Today: <m>59{,}104 \div 114{,}537 = 0.52</m>. Passing needs current assets of <m>1.2 \times 114{,}537 = 137{,}444</m>, so a shortfall of <m>137{,}444 - 59{,}104 = 78{,}340</m>.`,
        String.raw`(a) New equity held as cash adds to current assets only: Lantern would need about $78,340 of it.`,
        String.raw`(b) Moving the $24,000 line and the $10,000 note into a long-term loan takes $34,000 off current liabilities: <m>59{,}104 \div 80{,}537 = 0.73</m>. Still short: it would also need <m>1.2 \times 80{,}537 - 59{,}104 = 37{,}540</m> more current assets.`,
        String.raw`(c) Leaving out the $37,010 of current lease liabilities: <m>59{,}104 \div 77{,}527 = 0.76</m>. Even a lenient definition fails.`,
        'Judgement: no single change gets Lantern to 1.2. A combination of long-term refinancing and new equity would, and the 1.2 would have to be tested on the balance sheet after the new loan and Hollis’s investment, not on this one.',
      ],
      answer: 'Lantern would fail a 1.2 test by a wide margin: it needs about $78,340 more current assets, or $37,540 more after refinancing $34,000 of short-term debt. Excluding leases from the definition still leaves it at 0.76.',
      interpretation: 'Before signing, Ana should negotiate the covenant’s definition and level as carefully as the interest rate, and plan the 2028 financing so the first test date falls after the law firm’s fee and the new equity arrive. Whether the bank should lend at all is a credit decision for module 4.' },
  ],

  demo: [
    { widget: 'liq-ratios', intro: 'Lantern’s two year ends beside Starbucks and the fictional Harbourline. Pick a ratio to see its working. Then try the adjustments on 2027: draw the rest of the credit line, refinance the short-term debt, or leave the leases out, and see which ratios move and which don’t.' },
    { widget: 'liq-dress', intro: 'A window-dressing explorer. Start from Lantern’s 2027 totals, then pay liabilities with cash (a positive amount) or borrow short-term and hold the cash (a negative amount). Try it again from 2026’s totals, where the ratio starts above 1.' },
  ],

  mistakes: [
    { title: '“A current ratio below 1 means the business can’t pay its bills.”', html: 'It means current liabilities exceed current assets on one date. Starbucks has run below 1 (0.75 at its 2024 year end) while generating $6.1 billion of operating cash a year, because its sales arrive as cash every day and part of its current liabilities is settled in coffee. Judge a low ratio with the cash flow that refills it.' },
    { title: '“The higher the current ratio, the better.”', html: 'Beyond what the business needs, idle cash and slow stock earn little, and a high ratio can be manufactured at the year end. Lantern’s 2.15 at the end of 2026 included cash it spent on the cafés’ fit-out two months later. Compare with similar businesses and with the business’s own needs.' },
    { title: '“The contract asset is as good as a receivable.”', html: 'A receivable is an unconditional right to be paid: only time stands between the business and the cash. A contract asset depends on something else, such as further performance or a billing date. Lantern’s $30,840 can’t be invoiced until 31 March 2028 and rests on a CPI estimate, so it stays out of the quick ratio.' },
    { title: '“Unearned revenue will drain cash like a payable.”', html: 'The cash has already arrived; the obligation is met by delivering the event, workshop or coffee. It costs cash only through the cost of delivering and any refunds. It still counts in current liabilities, so the standard ratios treat it like a payable; say so when it is large, as Starbucks’ stored-value card liability is.' },
    { title: '“Leave the lease liabilities out: rent is an operating cost.”', html: 'Since ASC 842, the part of an operating lease liability due within a year is a current liability, and the payments are as contractual as a loan’s. Leaving them out is a deliberate adjustment, not a correction; if you make it (some loan agreements do), say so and make it consistently for every business you compare.' },
    { title: 'Turning the ratio upside down', html: 'Current liabilities divided by current assets gives 1.94 for Lantern in 2027 and invites the conclusion that liquidity improved. The current ratio is assets over liabilities: how many dollars of current assets stand behind each dollar due.' },
  ],

  application: [
    { p: '<b>The credit officer’s review.</b> Coastline’s credit officer starts from the ratios but writes her review around dates. Lantern holds $6,531 of cash and $6,000 of undrawn credit line. Against that, in the first quarter of 2028 it must pay its year-end payables, wages and taxes ($16,557 of trade items other than unearned revenue and interest), three months of café rent ($12,000), the brewer plan’s instalments and, on 1 March, the $10,000 Coastline note. Its main inflows are daily café, shop and workshop takings and, on 31 March, the law firm’s fee. Her question is whether the takings cover the gap until 31 March; the ratios told her to ask it.' },
    { p: '<b>Ana’s options.</b> Ana can improve liquidity in four ways, and each has a cost. She can bring in long-term money (Hollis Avery’s equity or a term loan) so that long-lived assets are no longer financed from working capital. She can convert the line of credit into a term loan, which moves it out of current liabilities but adds a repayment schedule. She can ask the law firm to pay quarterly rather than annually in arrears, which would shrink the contract asset and bring cash forward. Or she can slow spending: the 2028 Cold Brew launch, more market research and dividends can all wait. The efficiency lesson measures how much cash each of these releases.' },
    { p: '<b>A supplier’s view.</b> Kilnworth Roasting sells Lantern its beans on 30-day terms. Its credit controller sees the same balance sheet and asks a simpler question: will Lantern keep paying on time? The quick ratio of 0.15 would worry her if she looked at it alone; Lantern’s record of paying within terms and the steady cash from the cafés will matter more. Liquidity ratios start conversations; the payment history and the cash calendar finish them.' },
  ],

  summary: [
    'Liquidity is the ability to pay obligations as they fall due; it is different from profitability and from solvency.',
    'The ladder of measures: current ratio (all current assets), quick ratio (cash, short-term investments and net receivables), cash ratio (cash and short-term investments) and the operating cash flow ratio (a period’s cash from operations against year-end current liabilities).',
    'Classify with care: a contract asset, inventory and prepayments are current but not quick; unearned revenue is settled by delivering; current lease liabilities and current portions of debt are contractual cash payments.',
    'Lantern’s current ratio fell from 2.15 to 0.52 because it paid for the cafés’ fit-out and machines in cash, took on leases whose 2028 payments are current, saw the Coastline note and the brewer’s instalments fall due within the year, and borrowed $24,000 short-term; its trade liabilities hardly changed.',
    'Working capital equals equity plus noncurrent liabilities minus noncurrent assets, which explains any change by cause.',
    'A ratio below 1 is normal for businesses paid at the till with steady cash flow, such as Starbucks (0.75 in FY2024, with an operating cash flow ratio of 0.67); Lantern’s 0.07 operating cash flow ratio is the real concern.',
    'Window dressing can move a ratio either way: paying liabilities with cash raises a ratio above 1 and lowers one below 1.',
    'Covenants turn liquidity into a legal test; the definition of the ratio is negotiable and decisive.',
  ],

  glossary: [
    { term: 'Cash ratio', def: 'Cash and short-term investments divided by current liabilities: what could be paid at once if nothing more came in.' },
    { term: 'Operating cash flow ratio', def: 'Net cash from operating activities for a period divided by current liabilities at its end: how much of what is owed within the year one period’s operations would pay.' },
    { term: 'Window dressing', def: 'Arranging transactions around a reporting date, such as paying suppliers early or borrowing for a few days, so that the statements look better than the business’s normal position.' },
    { term: 'Line of credit', def: 'An agreement under which a lender stands ready to lend up to a set limit, which the borrower draws on and repays as it needs; interest is charged only on the amount drawn.' },
  ],

  references: [
    { text: 'Dahlquist, J. &amp; Knight, R. (2022). <i>Principles of Finance</i>, section 6.3, “Liquidity Ratios”. OpenStax.', url: 'https://openstax.org/books/principles-finance/pages/6-3-liquidity-ratios', checked: '2026-10-26' },
    { text: 'U.S. Securities and Exchange Commission (2007). <i>Beginners’ Guide to Financial Statements</i>.', url: 'https://www.sec.gov/reportspubs/investor-publications/investorpubsbegfinstmtguide', checked: '2026-10-26' },
    { text: 'Starbucks Corporation (2024). Form 10-K for the fiscal year ended 29 September 2024: consolidated balance sheets (SEC EDGAR financial report R7).', url: 'https://www.sec.gov/Archives/edgar/data/829224/000082922424000057/R7.htm', checked: '2026-10-26' },
    { text: 'Starbucks Corporation (2024). Form 10-K for the fiscal year ended 29 September 2024: consolidated statements of cash flows (SEC EDGAR financial report R5).', url: 'https://www.sec.gov/Archives/edgar/data/829224/000082922424000057/R5.htm', checked: '2026-10-26' },
    { text: 'IFRS Foundation. <i>IFRS 16 Leases</i> (standard summary page).', url: 'https://www.ifrs.org/issued-standards/list-of-standards/ifrs-16-leases/', checked: '2026-10-26' },
    { text: 'Deloitte. <i>Roadmap: Leases</i>, section 1.2, “Overview” (ASU 2016-02, ASC 842, effective dates). DART.', url: 'https://dart.deloitte.com/USDART/home/codification/broad-transactions/asc842-10/roadmap-leasing/chapter-1-overview/1-2-overview', checked: '2026-10-26' },
  ],

  checks: [
    // the balance sheet table and the ratios
    { what: 'Current assets 2026', value: P26.currentAssets, shown: 56476 },
    { what: 'Current assets 2027', value: P27.currentAssets, shown: 59104 },
    { what: 'Current liabilities 2026', value: P26.currentLiabilities, shown: 26289 },
    { what: 'Current liabilities 2027', value: P27.currentLiabilities, shown: 114537 },
    { what: 'Cash 2026', value: P26.cash, shown: 42940 },
    { what: 'Cash 2027', value: P27.cash, shown: 6531 },
    { what: 'Contract asset', value: P27.contractAsset, shown: 30840 },
    { what: 'Contract asset more than half of current assets', value: P27.contractAsset / P27.currentAssets > 0.5 ? 1 : 0, shown: 1 },
    { what: 'Receivables net 2026', value: P26.receivables, shown: 6796 },
    { what: 'Receivables net 2027', value: P27.receivables, shown: 10698 },
    { what: 'Inventory 2027', value: P27.inventory, shown: 9475 },
    { what: 'Supplies 2027', value: b27('Supplies'), shown: 960 },
    { what: 'Prepaid insurance 2027', value: b27('Prepaid Insurance'), shown: 600 },
    { what: 'Unearned revenue 2027', value: b27('Unearned Revenue'), shown: 9060 },
    { what: 'Current portion of LTD 2027', value: b27('Current Portion of Long-Term Debt'), shown: 27091 },
    { what: 'Brewer plan 2028 principal', value: brewer2028, shown: 12091 },
    { what: 'Line of credit drawn', value: b27('Line of Credit'), shown: 24000 },
    { what: 'Line of credit limit', value: FACTS.lineOfCredit.limit, shown: 30000 },
    { what: 'Current lease liabilities', value: CL.lease27, shown: 37010 },
    { what: 'Working capital 2026', value: L26.workingCapital, shown: 30187 },
    { what: 'Working capital 2027', value: L27.workingCapital, shown: -55433 },
    { what: 'Current ratio 2026', value: L26.current, shown: 2.15 },
    { what: 'Current ratio 2027', value: L27.current, shown: 0.52 },
    { what: 'Quick ratio 2026', value: L26.quick, shown: 1.89 },
    { what: 'Quick ratio 2027', value: L27.quick, shown: 0.15 },
    { what: 'Cash ratio 2026', value: L26.cash, shown: 1.63 },
    { what: 'Cash ratio 2027', value: L27.cash, shown: 0.06 },
    { what: 'Cash covers 6 cents per dollar', value: Math.round(L27.cash * 100), shown: 6 },
    { what: 'OCF ratio 2026 (ten months)', value: L26.operatingCashFlow, shown: 1.52 },
    { what: 'OCF ratio 2027', value: L27.operatingCashFlow, shown: 0.07 },
    { what: 'CFO 2026', value: P26.cfo, shown: 39940 },
    { what: 'CFO 2027', value: P27.cfo, shown: 8341 },
    { what: 'CFO 2026 annualised', value: R.annualise(P26.cfo, 10), shown: 47928 },
    { what: 'OCF ratio 2026 annualised', value: R.annualise(P26.cfo, 10) / P26.currentLiabilities, shown: 1.82 },
    // current liabilities by kind
    { what: 'Trade current liabilities 2027', value: CL.trade27, shown: 26436 },
    { what: 'Debt in current liabilities 2027', value: CL.debt27, shown: 51091 },
    // the bridge
    { what: 'Bridge: retained profit', value: BR.retained, shown: 20431 },
    { what: 'Net income 2027', value: P27.netIncome, shown: 22431 },
    { what: 'Dividend 2027', value: P27.dividends, shown: 2000 },
    { what: 'Bridge: PPE', value: BR.ppe, shown: -58200 },
    { what: 'PPE net 2026', value: P26.ppeNet, shown: 37200 },
    { what: 'PPE net 2027', value: P27.ppeNet, shown: 95400 },
    { what: 'Bridge: leases', value: BR.lease, shown: -37010 },
    { what: 'Right-of-use asset', value: P27.rightOfUse, shown: 173379 },
    { what: 'Noncurrent lease liabilities', value: b27('Operating Lease Liabilities'), shown: 136369 },
    { what: 'Bridge: debt', value: BR.debt, shown: -10841 },
    { what: 'Noncurrent debt 2027', value: b27('Notes Payable') + b27('Instalment Note Payable'), shown: 14159 },
    { what: 'Notes payable 2026', value: b26('Notes Payable'), shown: 25000 },
    { what: 'Notes payable 2027', value: b27('Notes Payable'), shown: 10000 },
    { what: 'Instalment note noncurrent', value: b27('Instalment Note Payable'), shown: 4159 },
    { what: 'Brewer plan owed', value: b27('Instalment Note Payable') + brewer2028, shown: 16250 },
    { what: 'Bridge total', value: BR.total, shown: -85620 },
    { what: 'Bridge total = change in WC', value: L27.workingCapital - L26.workingCapital, shown: -85620 },
    { what: 'Noncurrent assets 2026', value: NC26, shown: 37200 },
    { what: 'Noncurrent assets 2027', value: NC27, shown: 268779 },
    { what: 'Noncurrent liabilities 2026', value: b26('Total noncurrent liabilities'), shown: 25000 },
    { what: 'Noncurrent liabilities 2027', value: b27('Total noncurrent liabilities'), shown: 150528 },
    { what: 'Equity 2026', value: P26.equity, shown: 42387 },
    { what: 'Equity 2027', value: P27.equity, shown: 62818 },
    { what: 'ΔEquity', value: P27.equity - P26.equity, shown: 20431 },
    { what: 'ΔNCL', value: b27('Total noncurrent liabilities') - b26('Total noncurrent liabilities'), shown: 125528 },
    { what: 'ΔNCA', value: NC27 - NC26, shown: 231579 },
    // the cash story
    { what: 'Capex 2027', value: capex, shown: 54000 },
    { what: 'Fit-out', value: FACTS.cafes.fitOut.cost, shown: 36000 },
    { what: 'Machines', value: FACTS.cafes.machines.cost, shown: 18000 },
    { what: 'Repayments', value: repaid, shown: 12750 },
    { what: 'Cash fell by', value: P26.cash - P27.cash, shown: 36409 },
    { what: 'Cash identity', value: P27.cfo - capex + b27('Line of Credit') - repaid - P27.dividends, shown: -36409 },
    // what-ifs
    { what: 'Current ratio without the contract asset', value: crNoContract, shown: 0.25 },
    { what: 'Undrawn line', value: undrawn, shown: 6000 },
    { what: 'Law firm fee estimate', value: FACTS.lawFirm.baseFee * (1 + FACTS.lawFirm.expectedInflation), shown: 41120 },
    { what: 'Revenue roughly tripled', value: P27.revenue / P26.revenue, shown: 3, tol: 0.05 },
    { what: 'CL more than quadrupled', value: P27.currentLiabilities / P26.currentLiabilities > 4 ? 1 : 0, shown: 1 },
    // Starbucks and Harbourline
    { what: 'Starbucks current ratio FY2024', value: SBL.current, shown: 0.75 },
    { what: 'Starbucks current ratio FY2023', value: SB.ca23 / SB.cl23, shown: 0.78 },
    { what: 'Starbucks quick ratio FY2024', value: SBL.quick, shown: 0.52 },
    { what: 'Starbucks OCF ratio', value: SBL.operatingCashFlow, shown: 0.67 },
    { what: 'Starbucks current assets add up (to rounding)', value: SB.cash + SB.sti + SB.ar + SB.inv + SB.prepaid, shown: 6847.4, tol: 0.05 },
    { what: 'Starbucks CFO $ billions', value: SB.cfo / 1000, shown: 6.1, tol: 0.05 },
    { what: 'Harbourline current ratio', value: HBL.current, shown: 1.5 },
    { what: 'Harbourline quick ratio', value: HBL.quick, shown: 0.83 },
    // window dressing
    { what: 'Pay 6,000 at end 2026', value: (P26.currentAssets - 6000) / (P26.currentLiabilities - 6000), shown: 2.49 },
    { what: 'Pay 6,000 at end 2027', value: (P27.currentAssets - 6000) / (P27.currentLiabilities - 6000), shown: 0.49 },
    { what: 'Draw 6,000 at end 2027', value: (P27.currentAssets + 6000) / (P27.currentLiabilities + 6000), shown: 0.54 },
    // the covenant
    { what: 'Current assets needed for 1.2', value: needCA, shown: 137444, tol: 0.5 },
    { what: 'Shortfall', value: shortfall, shown: 78340, tol: 0.5 },
    { what: 'Term-out amount', value: termOut, shown: 34000 },
    { what: 'CL after term-out', value: cl27 - termOut, shown: 80537 },
    { what: 'Current ratio after term-out', value: crTermOut, shown: 0.73 },
    { what: 'Shortfall after term-out', value: shortfallTermOut, shown: 37540, tol: 0.5 },
    { what: 'CL without leases', value: cl27 - CL.lease27, shown: 77527 },
    { what: 'Current ratio without leases', value: crNoLease, shown: 0.76 },
    // application
    { what: 'Q1 2028 trade items other than unearned revenue and interest', value: b27('Accounts Payable') + b27('Wages Payable') + b27('Income Taxes Payable'), shown: 16557 },
    { what: 'Three months of café rent', value: 3 * 2 * FACTS.cafes.lease.monthlyEach, shown: 12000 },
    // mistakes
    { what: 'Upside-down ratio', value: P27.currentLiabilities / P27.currentAssets, shown: 1.94 },
  ],
};
