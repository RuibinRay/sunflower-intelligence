// financial-planning.js — F05 · Financial planning. Content only; exercises are in financial-planning.ex.js.
// Isbister Outdoor Gear (percent-of-sales and growth rates) and Sallowfield Garden Centre (cash budget) and every
// figure about them are fictional. Lantern’s 2027 accounts (F03) are used only for a historical internal and sustainable
// growth rate; Lantern’s 2028 cash budget and funds needed belong to the course project and are not used here.
// AFN, growth rates and the cash budget come from core/corpfin.js (afn, internalGrowth, sustainableGrowth, cashBudget).
// The AFN, IGR and SGR formulas follow the standard textbook treatment and are derived in the lesson; the cited OpenStax
// sections support the forecasting and cash-budget method only.
import { PERIODS } from '../f03/case.js?v=28';
import * as CF from '../../../core/corpfin.js?v=28';

const P26 = PERIODS[2026], P27 = PERIODS[2027];
// ---------------------------------------------------------------- Isbister Outdoor Gear (fictional)
const I = { sales: 2_000_000, ca: 500_000, fa: 700_000, spont: 200_000, loan: 400_000, equity: 600_000, margin: 0.06, payout: 0.4, g: 0.25, tax: 0.25, rate: 0.08 };
I.assets = I.ca + I.fa;
I.ni = I.margin * I.sales; I.div = I.payout * I.ni;
const AF = CF.afn({ sales0: I.sales, growth: I.g, assets: I.assets, spontaneous: I.spont, margin: I.margin, payout: I.payout });
const s1 = AF.s1, ni1 = I.margin * s1, div1 = I.payout * ni1;
const pf = { ca: I.ca * (1 + I.g), fa: I.fa * (1 + I.g), spont: I.spont * (1 + I.g), equity: I.equity + AF.retained };
pf.assets = pf.ca + pf.fa; pf.le = pf.spont + I.loan + pf.equity;
// spare capacity: fixed assets at 80% of capacity, so no new fixed assets for 25% growth
const util = 0.8, fullCap = I.sales / util;
const AFc = CF.afn({ sales0: I.sales, growth: I.g, assets: I.ca, spontaneous: I.spont, margin: I.margin, payout: I.payout });
// financing feedback: AFN borrowed at 8% for the year, interest after tax cuts retained earnings
const fb = (1 - I.payout) * I.rate * (1 - I.tax);              // 0.036
const afnIter = AF.afn / (1 - fb);
// growth rates
const roa = I.ni / I.assets, roe = I.ni / I.equity, b = 1 - I.payout;
const igr = CF.internalGrowth(roa, b), sgr = CF.sustainableGrowth(roe, b);
const atIgr = CF.afn({ sales0: I.sales, growth: igr, assets: I.assets, spontaneous: 0, margin: I.margin, payout: I.payout });
const atSgr = CF.afn({ sales0: I.sales, growth: sgr, assets: I.assets, spontaneous: I.spont, margin: I.margin, payout: I.payout });
// Lantern 2027 (historical)
const L = { ni: P27.netIncome, div: P27.dividends, ta: P27.totalAssets, eq: P27.equity, eq0: P26.equity };
L.b = 1 - L.div / L.ni; L.roa = L.ni / L.ta; L.roe = L.ni / L.eq;
L.igr = CF.internalGrowth(L.roa, L.b); L.sgr = CF.sustainableGrowth(L.roe, L.b);
L.retained = L.ni - L.div;
// ---------------------------------------------------------------- Sallowfield Garden Centre (fictional): cash budget
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June'];
const S = { opening: 25_000, minimum: 15_000, rate: 0.01, limit: 80_000,
  receipts: [30_000, 35_000, 60_000, 95_000, 110_000, 70_000], payments: [52_000, 68_000, 75_000, 70_000, 62_000, 50_000] };
const CB = CF.cashBudget({ opening: S.opening, receipts: S.receipts, payments: S.payments, minimum: S.minimum, rate: S.rate });
const CBlow = CF.cashBudget({ opening: S.opening, receipts: S.receipts.map((r, i) => (i >= 2 && i <= 4 ? r * 0.8 : r)), payments: S.payments, minimum: S.minimum, rate: S.rate });
const intTotal = CB.rows.reduce((s, r) => s + r.interest, 0);
const fmt = (v) => Math.round(v).toLocaleString('en-US');
const pct = (v, d = 1) => `${(v * 100).toFixed(d)}%`;
const sgn = (v) => (v < 0 ? `(${fmt(-v)})` : fmt(v));

export default {
  slug: 'financial-planning',
  title: 'Financial planning',
  blurb: 'Turn a sales forecast into the money a business will need: percent-of-sales forecasts and additional funds needed, the internal and sustainable growth rates, a monthly cash budget with a line of credit, and scenarios that show what could go wrong.',
  status: 'draft',
  objectives: [
    'Build a percent-of-sales forecast of the income statement and balance sheet and calculate the additional funds needed (AFN).',
    'Adjust the forecast for spare capacity and for the interest on new borrowing, and explain the method’s assumptions.',
    'Calculate and interpret the internal and sustainable growth rates, and identify what limits a firm’s growth.',
    'Prepare a monthly cash budget with a minimum cash balance and a line of credit, and find the peak borrowing.',
    'Use scenarios and covenant tests to judge whether a financing plan is robust.',
  ],
  prerequisites: [
    { lesson: 'f03/return-on-assets-and-equity', why: 'ROA, ROE and Lantern’s 2027 figures, which the growth rates build on.' },
    { lesson: 'f03/liquidity', why: 'The current ratio and the line of credit; a cash budget is liquidity looked at forwards.' },
    { lesson: 'f05/payout-policy', why: 'The payout and retention ratios decide how much profit stays in the business to finance growth.' },
    { lesson: 'f05/capital-structure', why: 'How the money a plan needs should be raised, and the covenants that come with debt.' },
  ],
  case: 'lantern',

  concept: [
    { case: String.raw`Lantern’s revenue in 2027 was $${fmt(P27.revenue)}, its first full year and the year the two cafés opened. The growth was paid for partly by profit kept in the business and mostly by other people’s money: interest-bearing debt rose from $${fmt(P26.debt)} to $${fmt(P27.debt)}, and the cafés’ leases added $${fmt(P27.leaseLiabilities)} of lease liabilities. Would the money have been there if sales had come in later than planned? Financial planning asks that question before the money is spent.` },
    { p: 'A <b>financial plan</b> turns a forecast of sales and investment into forecasts of the statements, and so into the amount and timing of the money the business will need. Planning does not predict the future; it shows the financial consequences of the future the managers expect, and of the ones they fear, while there is still time to act: to arrange a loan, delay an investment, slow growth or keep more profit. Lenders ask for plans for the same reason: a borrower who has worked out when it will need cash, and how it will repay, is a better risk.' },
    { p: 'Plans work at two horizons. A <b>long-term plan</b>, usually annual for three to five years, asks how much outside money growth will need and what kind. A <b>short-term plan</b>, usually monthly for the coming year, asks whether there will be enough cash each month, given that receipts and payments do not arrive together. The first is built with pro forma statements and the second with a <g>cash budget</g>.' },

    { h: 'The percent-of-sales method' },
    { p: String.raw`The simplest long-term forecast assumes that many items move in proportion to sales. <b>Isbister Outdoor Gear</b>, a fictional retailer of tents and hiking gear, had sales of $2,000,000 last year, a net profit margin of 6% and a payout ratio of 40%. Its assets were $1,200,000: $500,000 of current assets (inventory, receivables, cash) and $700,000 of fixed assets, all fully used. It owed $200,000 of payables and accruals, $400,000 to its bank, and had equity of $600,000. It expects sales to grow by 25% next year.` },
    { p: 'The forecast sorts each balance sheet item by what drives it. Assets needed to support sales (inventory, receivables, and fixed assets when the business is at full capacity) rise with sales. <g>Spontaneous liabilities</g>, mainly payables and accrued wages and taxes, rise with sales automatically: buy more stock on credit and the payables follow. Bank loans, bonds and share capital change only when someone decides to borrow or raise money, so the first draft holds them fixed. Retained earnings grow by next year’s profit less dividends. Whatever is left, assets needed minus everything that finances them, is the <g>additional funds needed</g>.' },
    { table: {
      caption: 'Isbister Outdoor Gear (fictional): a percent-of-sales forecast, $',
      head: ['', 'Last year', 'Next year (+25%)', 'Rule'],
      align: ['l', 'r', 'r', 'l'],
      rows: [
        ['Sales', fmt(I.sales), fmt(s1), 'Forecast'],
        ['Net income', fmt(I.ni), fmt(ni1), '6% of sales'],
        ['Dividends', fmt(I.div), fmt(div1), '40% of net income'],
        ['Current assets', fmt(I.ca), fmt(pf.ca), '25% of sales'],
        ['Fixed assets', fmt(I.fa), fmt(pf.fa), '35% of sales (full capacity)'],
        ['Total assets', fmt(I.assets), fmt(pf.assets), ''],
        ['Payables and accruals', fmt(I.spont), fmt(pf.spont), '10% of sales'],
        ['Bank loan', fmt(I.loan), fmt(I.loan), 'Unchanged until decided'],
        ['Equity', fmt(I.equity), fmt(pf.equity), 'Plus net income less dividends'],
        ['Total liabilities and equity', fmt(I.assets), fmt(pf.le), ''],
      ],
      foot: [['Additional funds needed', '', fmt(pf.assets - pf.le), 'Assets less liabilities and equity']],
    } },
    { p: String.raw`Isbister needs $${fmt(AF.afn)} more than its own growth will provide. The same answer comes straight from a formula: the assets needed for $${fmt(AF.dS)} of extra sales, <m>0.60 \times ${fmt(AF.dS)} = ${fmt(AF.needAssets)}</m>, less the spontaneous liabilities that come with them, <m>0.10 \times ${fmt(AF.dS)} = ${fmt(AF.spont)}</m>, less the earnings retained, <m>0.06 \times ${fmt(s1)} \times 0.60 = ${fmt(AF.retained)}</m>.` },
    { callout: 'key', title: 'Growth uses cash', html: 'A profitable business can run out of money by growing. Every extra dollar of sales ties up more inventory, receivables and equipment before it brings in cash; profit kept in the business pays for only part of that. The faster the growth, the more of it must be financed from outside.' },
  ],

  theory: [
    { h: 'Additional funds needed' },
    { p: 'OpenStax’s forecasting chapter builds full pro forma statements and lets cash balance them; the shortcut below, standard in corporate-finance textbooks, gives the same gap in one line when the ratios are constant.' },
    { math: String.raw`\text{AFN} = \frac{A^*}{S_0}\,\Delta S - \frac{L^*}{S_0}\,\Delta S - m\,S_1\,(1 - d)` },
    { p: String.raw`Here <m>A^*</m> is the assets that rise with sales, <m>L^*</m> the spontaneous liabilities, <m>S_0</m> and <m>S_1</m> this year’s and next year’s sales, <m>\Delta S = S_1 - S_0</m>, <m>m</m> the net profit margin and <m>d</m> the payout ratio. A negative AFN is a surplus: the business generates more than it needs, and can repay debt, raise the payout or hold the cash. The AFN is a first draft of a financing need. How to raise it, by bank debt, by new equity, by cutting the dividend, is the capital-structure and payout question of this module’s other lessons.` },

    { h: 'The assumptions, and how to relax them' },
    { p: 'Percent of sales is a starting point, and every assumption in it can fail.' },
    { list: [
      '<b>Constant ratios.</b> Some assets grow more slowly than sales because of economies of scale: a warehouse that serves $2 million of sales may serve $3 million. Some grow faster: a new market may need more inventory per dollar of sales. Fixed costs do not move with sales at all, so the profit margin may rise as the business grows.',
      '<b>Full capacity.</b> If fixed assets have spare capacity, sales can grow without new ones until the capacity is used.',
      '<b>Smooth assets.</b> Real fixed assets come in lumps: half a delivery van cannot be bought. A plan may need a large investment in one year and none in the next.',
      '<b>Financing has no feedback.</b> New borrowing brings interest, which lowers profit and so retained earnings, which raises the need a little. The forecast must be iterated, or the interest estimated in advance.',
      '<b>Payout and margin fixed.</b> Managers can change the dividend or cut costs, and a plan should show what each would do.',
    ] },
    { p: String.raw`<b>Spare capacity.</b> Suppose Isbister’s fixed assets were running at ${pct(util, 0)} of capacity. They could support sales of <m>2{,}000{,}000 \div 0.8 = ${fmt(fullCap)}</m>, which is exactly next year’s forecast, so no new fixed assets are needed. Only current assets grow: <m>0.25 \times ${fmt(AF.dS)} = ${fmt(AFc.needAssets)}</m>, and the AFN becomes <m>${fmt(AFc.needAssets)} - ${fmt(AF.spont)} - ${fmt(AF.retained)} = ${fmt(AFc.afn)}</m>: a surplus of $${fmt(-AFc.afn)}. Whether the business is at capacity changes the answer from a $${fmt(AF.afn)} need to a small surplus.` },
    { p: String.raw`<b>Financing feedback.</b> If Isbister borrows the AFN at 8% from the start of the year, each dollar costs 8 cents of interest, 6 cents after 25% tax, of which 60% would have been retained: retained earnings fall by <m>0.6 \times 0.08 \times 0.75 = ${fb.toFixed(3)}</m> per dollar borrowed. The need solves <m>\text{AFN} = ${fmt(AF.afn)} + ${fb.toFixed(3)} \times \text{AFN}</m>, so <m>\text{AFN} = ${fmt(AF.afn)} \div (1 - ${fb.toFixed(3)}) = ${fmt(afnIter)}</m>. Spreadsheet models do the same by iterating until the balance sheet balances.` },

    { h: 'How fast can a business grow without outside money?' },
    { p: String.raw`Two benchmark growth rates, in their standard textbook form, come from setting the AFN to zero. The <g>internal growth rate</g> is the fastest a firm can grow with no outside money of any kind: no new borrowing, no new shares and, in the strict version, no increase in spontaneous liabilities either, so retained earnings must pay for every new asset. The <g>sustainable growth rate</g> is the fastest it can grow with no new shares while keeping its debt-to-equity ratio constant: retained earnings add to equity, and debt grows in proportion. With <m>b</m> the retention ratio and ROA and ROE measured on end-of-year totals:` },
    { math: String.raw`\text{IGR} = \frac{\text{ROA} \times b}{1 - \text{ROA} \times b}, \qquad \text{SGR} = \frac{\text{ROE} \times b}{1 - \text{ROE} \times b}` },
    { p: String.raw`For Isbister, ROA <m>= 120{,}000 \div 1{,}200{,}000 = 10\%</m>, ROE <m>= 120{,}000 \div 600{,}000 = 20\%</m> and <m>b = 0.6</m>. The internal growth rate is <m>0.06 \div 0.94 = ${(igr * 100).toFixed(2)}\%</m> and the sustainable growth rate <m>0.12 \div 0.88 = ${(sgr * 100).toFixed(2)}\%</m>. At ${pct(igr, 2)} growth, with no new liabilities, the retained profit exactly pays for the new assets. At ${pct(sgr, 2)}, the retained profit raises equity by ${pct(sgr, 2)}, and $${fmt(atSgr.afn)} of new bank debt (the bank loan growing by the same ${pct(sgr, 2)}) keeps the debt-to-equity ratio where it was. Isbister’s planned 25% is well above both: it must raise new equity, borrow more than its current leverage allows, retain more, or grow more slowly.` },
    { p: 'The sustainable growth rate can be split into the levers that set it. By the DuPont identity of F03, ROE is the profit margin times asset turnover times the equity multiplier, so a firm can grow faster without new shares only by earning a higher margin, using its assets more intensively, borrowing more against its equity, or retaining more of its profit. If its sales grow faster than its SGR, one of those must change or it must issue shares. That makes the SGR a consistency check on a plan: a plan that assumes 25% growth, a constant payout and constant leverage, with an SGR of 13.6%, cannot be financed as written.' },
    { callout: 'note', title: 'A convention to watch', html: String.raw`These formulas use ROA and ROE on <i>end-of-year</i> totals. F03 measures ROA and ROE on average balances, which gives higher figures for a growing firm. The SGR also equals retained earnings divided by equity at the start of the year: <m>(\text{NI} - \text{Dividends}) \div E_{\text{start}}</m>, which avoids the conversion.` },
    { p: String.raw`Lantern’s 2027 figures give a historical calculation. Net income was $${fmt(L.ni)}, the dividend $${fmt(L.div)} (so <m>b = ${(L.b * 100).toFixed(1)}\%</m>), total assets at the year end $${fmt(L.ta)} and equity $${fmt(L.eq)}. ROA on the year-end total is ${pct(L.roa, 2)} and ROE ${pct(L.roe, 2)}, giving an internal growth rate of ${pct(L.igr, 2)} and a sustainable growth rate of ${pct(L.sgr, 1)}. The SGR is exactly how fast equity grew from retained profit: <m>${fmt(L.retained)} \div ${fmt(L.eq0)} = ${(L.retained / L.eq0 * 100).toFixed(1)}\%</m>, from $${fmt(L.eq0)} to $${fmt(L.eq)}. It is so high because Lantern’s equity is thin: each dollar of it supported $${(L.ta / L.eq).toFixed(2)} of assets at the year end, much of it leased. Keeping that leverage constant as Lantern grows would mean borrowing and leasing on the same scale again, so the SGR describes 2027’s financing rather than a growth rate Lantern could rely on.` },

    { h: 'The cash budget' },
    { p: 'Annual forecasts hide the months. A business with a seasonal trade can be profitable over the year and still run out of cash in the months when it buys stock before it sells it. A <g>cash budget</g> lists, month by month, the cash expected in (collections from customers, which lag sales on credit), the cash expected out (suppliers, wages, rent, interest, tax, equipment, dividends) and the resulting balance. Depreciation is not in it, because it is not a payment. The business sets a <b>minimum cash balance</b> as a buffer for surprises, and plans to draw on a <g>line of credit</g> when cash would fall below it and to repay when it rises above.' },
    { p: String.raw`<b>Sallowfield Garden Centre</b>, a fictional business, buys plants and stock in winter for its spring trade. It starts January with $${fmt(S.opening)} of cash, wants to keep at least $${fmt(S.minimum)}, and has an $${fmt(S.limit)} line of credit at 1% a month. Interest each month is charged on the balance drawn at the start of the month; draws and repayments happen at the end of the month.` },
    { table: {
      caption: 'Sallowfield Garden Centre (fictional): cash budget, January–June ($)',
      head: ['Month', 'Receipts', 'Payments', 'Interest', 'Draw (repay)', 'Cash at end', 'Line drawn at end'],
      align: ['l', 'r', 'r', 'r', 'r', 'r', 'r'],
      rows: CB.rows.map((r, i) => [MONTHS[i], fmt(r.receipts), fmt(r.payments), fmt(r.interest), sgn(r.borrow - r.repay), fmt(r.end), fmt(r.debt)]),
      note: 'Each month: cash at the start + receipts − payments − interest, then a draw to bring cash up to $15,000 or a repayment of any surplus above it. Figures rounded to the dollar; the calculation keeps the cents.',
    } },
    { p: String.raw`Cash falls below the minimum in each of the first three months, and the line peaks at $${fmt(CB.peakDebt)} at the end of March, inside the $${fmt(S.limit)} limit. April’s and May’s sales repay it, and Sallowfield ends June with $${fmt(CB.endCash)} and nothing drawn, after $${fmt(intTotal)} of interest. The budget tells the owner how large a line to arrange, when the bank will be repaid, and that the plan relies on spring sales arriving on time.` },

    { h: 'Scenarios and covenants' },
    { p: String.raw`A plan built on one forecast hides its risk. <b>Scenario planning</b> reruns it under other assumptions: a bad spring, a late payment from a large customer, a supplier who wants paying sooner. Suppose Sallowfield’s receipts in March, April and May come in 20% below the budget. The line then peaks at $${fmt(CBlow.peakDebt)} at the end of March, uncomfortably close to its $${fmt(S.limit)} limit, and $${fmt(CBlow.endDebt)} is still drawn at the end of June. The owner can see now that a wet spring would need a larger line, cheaper stock or later payments to suppliers.` },
    { p: 'Lenders’ conditions belong in the plan too. Loans and credit lines often carry <g>covenants</g>: a minimum current ratio or interest coverage, a maximum debt to EBITDA, and for many credit lines a requirement to repay the line in full for a period each year, to show it is financing seasonal stock rather than permanent needs. A plan should forecast each covenant ratio alongside the statements, in every scenario, because a breach lets the lender demand repayment just when the business is short of cash. The capital-structure lesson showed the same test on Winterbourne Ferries.' },
  ],

  formulas: [
    { id: 'plan-afn', name: 'Additional funds needed (percent of sales)',
      tex: String.raw`\text{AFN} = \frac{A^*}{S_0}\,\Delta S - \frac{L^*}{S_0}\,\Delta S - m\,S_1\,(1 - d)`,
      where: [[String.raw`A^*`, 'Assets that rise in proportion to sales (all assets at full capacity)', '$'], [String.raw`L^*`, 'Spontaneous liabilities: payables and accruals that rise with sales', '$'], [String.raw`S_0, S_1`, 'Sales this year and next year', '$'], [String.raw`\Delta S`, 'Increase in sales, S₁ − S₀', '$'], [String.raw`m`, 'Net profit margin, net income ÷ sales', ''], [String.raw`d`, 'Payout ratio', '']],
      assumptions: 'Those assets and liabilities keep their ratios to sales; the margin and payout are constant; new financing adds no interest (relax by iterating).' },
    { id: 'plan-igr', name: 'Internal growth rate',
      tex: String.raw`\text{IGR} = \frac{\text{ROA} \times b}{1 - \text{ROA} \times b}`,
      where: [[String.raw`\text{ROA}`, 'Net income ÷ total assets at the end of the year', ''], [String.raw`b`, 'Retention ratio, 1 − payout ratio', '']],
      assumptions: 'No outside finance of any kind; assets grow with sales.' },
    { id: 'plan-sgr', name: 'Sustainable growth rate',
      tex: String.raw`\text{SGR} = \frac{\text{ROE} \times b}{1 - \text{ROE} \times b} = \frac{\text{NI} - \text{Dividends}}{E_{\text{start}}}`,
      where: [[String.raw`\text{ROE}`, 'Net income ÷ equity at the end of the year', ''], [String.raw`b`, 'Retention ratio', ''], [String.raw`\text{NI} - \text{Dividends}`, 'Retained earnings for the year', '$'], [String.raw`E_{\text{start}}`, 'Equity at the start of the year', '$']],
      assumptions: 'No new shares; debt grows with equity so that the debt-to-equity ratio is constant; margin, asset turnover and payout constant.' },
    { id: 'plan-cash', name: 'Cash budget, one month',
      tex: String.raw`C_{\text{end}} = C_{\text{start}} + R - P - i\,B_{\text{start}} + \text{Draw} - \text{Repay}`,
      where: [[String.raw`C_{\text{start}}, C_{\text{end}}`, 'Cash at the start and end of the month', '$'], [String.raw`R, P`, 'Cash receipts and payments in the month', '$'], [String.raw`i`, 'Interest rate on the line of credit per month', ''], [String.raw`B_{\text{start}}`, 'Line of credit drawn at the start of the month', '$'], [String.raw`\text{Draw}, \text{Repay}`, 'Amount drawn to restore the minimum balance, or repaid from cash above it', '$']],
      note: 'Draw = max(0, minimum − cash before financing); repay = min(line drawn, cash before financing − minimum) when cash is above the minimum.' },
  ],

  examples: [
    { level: 'simple', title: 'Isbister’s additional funds needed',
      fictional: true,
      setup: 'Isbister Outdoor Gear (fictional): sales $2,000,000, assets $1,200,000 all rising with sales, spontaneous liabilities $200,000, net margin 6%, payout 40%. Sales are forecast to grow 25%. How much outside money does it need?',
      steps: [
        String.raw`Sales rise by <m>2{,}000{,}000 \times 0.25 = ${fmt(AF.dS)}</m> to ${fmt(s1)}.`,
        String.raw`Assets needed: <m>(1{,}200{,}000 \div 2{,}000{,}000) \times ${fmt(AF.dS)} = 0.60 \times ${fmt(AF.dS)} = ${fmt(AF.needAssets)}</m>.`,
        String.raw`Spontaneous financing: <m>0.10 \times ${fmt(AF.dS)} = ${fmt(AF.spont)}</m>. Retained earnings: <m>0.06 \times ${fmt(s1)} \times (1 - 0.4) = ${fmt(AF.retained)}</m>.`,
        String.raw`AFN <m>= ${fmt(AF.needAssets)} - ${fmt(AF.spont)} - ${fmt(AF.retained)} = ${fmt(AF.afn)}</m>.`,
      ],
      answer: String.raw`$${fmt(AF.afn)} of additional funds.`,
      interpretation: 'Even a profitable retailer needs outside money to grow by a quarter in a year, because more than half of the new assets are not covered by payables or retained profit. The next decision is where the $160,000 comes from.' },
    { level: 'challenging', title: 'Isbister with spare capacity and interest',
      fictional: true,
      setup: 'Rework Isbister’s forecast twice. (a) Its fixed assets ($700,000) are running at 80% of capacity, so only current assets ($500,000) rise with sales. (b) Back at full capacity, the AFN will be borrowed at 8% from the start of the year; tax is 25% and 60% of profit is retained. Find the AFN in each case.',
      steps: [
        String.raw`(a) Capacity: the fixed assets can support <m>2{,}000{,}000 \div 0.8 = ${fmt(fullCap)}</m> of sales, so 25% growth needs none. Current assets: <m>0.25 \times ${fmt(AF.dS)} = ${fmt(AFc.needAssets)}</m>.`,
        String.raw`(a) AFN <m>= ${fmt(AFc.needAssets)} - ${fmt(AF.spont)} - ${fmt(AF.retained)} = ${fmt(AFc.afn)}</m>: a surplus of $${fmt(-AFc.afn)}.`,
        String.raw`(b) Each dollar borrowed costs $0.08 of interest, $0.06 after tax, and lowers retained earnings by <m>0.6 \times 0.06 = ${fb.toFixed(3)}</m>.`,
        String.raw`(b) So <m>\text{AFN} = ${fmt(AF.afn)} + ${fb.toFixed(3)}\,\text{AFN}</m>, giving <m>\text{AFN} = ${fmt(AF.afn)} \div ${(1 - fb).toFixed(3)} = ${fmt(afnIter)}</m>.`,
      ],
      answer: String.raw`(a) A surplus of $${fmt(-AFc.afn)}. (b) $${fmt(afnIter)}.`,
      interpretation: 'Capacity matters far more than the financing feedback: knowing how hard the existing equipment is working is the first question in any growth plan. The interest feedback is small but real, and a plan that ignores it will come up a little short.' },
    { level: 'applied', title: 'Sallowfield plans for a wet spring',
      fictional: true,
      setup: String.raw`Sallowfield Garden Centre (fictional) has the cash budget in the In depth section: opening cash $25,000, a $15,000 minimum, an $80,000 line of credit at 1% a month. Its bank’s terms require the line to be fully repaid by 30 June each year. The owner wants to know whether the plan survives a spring in which March to May receipts fall 20% short.`,
      steps: [
        String.raw`Base budget: the line peaks at $${fmt(CB.peakDebt)} at the end of March and is repaid in May; June ends with $${fmt(CB.endCash)} of cash. Both bank terms are met.`,
        String.raw`Wet spring: receipts in March, April and May become $${fmt(S.receipts[2] * 0.8)}, $${fmt(S.receipts[3] * 0.8)} and $${fmt(S.receipts[4] * 0.8)}. Rerunning the budget, the line peaks at $${fmt(CBlow.peakDebt)} at the end of March, $${fmt(S.limit - CBlow.peakDebt)} below the limit.`,
        String.raw`At the end of June $${fmt(CBlow.endDebt)} is still drawn: the repayment condition is broken.`,
        'Options: ask the bank now for a later clean-up date or a larger line; agree longer payment terms with the main plant supplier; or buy less stock for March and accept some lost sales. Each can be tested in the same budget.',
      ],
      answer: String.raw`The base plan works. In a wet spring the limit holds (peak $${fmt(CBlow.peakDebt)}) but $${fmt(CBlow.endDebt)} would still be owed at 30 June, breaking the bank’s repayment condition.`,
      interpretation: 'The scenario turns a vague worry into a number and a date, while there is time to negotiate. Asking a bank for flexibility before a breach is far easier than asking after one.' },
  ],

  demo: [
    { widget: 'plan-afn', intro: 'Isbister’s forecast. Move growth down to 6%, close to the internal growth rate of 6.38%: Isbister now has a small surplus, because payables finance part of the new assets as well as retained profit. Lower the capacity utilisation and see how much growth the existing equipment can absorb. Cut the payout ratio to zero to see how far retained profit alone can go.' },
    { widget: 'plan-cash', intro: 'Sallowfield’s cash budget. Set the spring shortfall to 20% and watch the line of credit approach its $80,000 limit and fail to be repaid by June. Then raise the minimum cash balance, or the opening cash, and see which month is most at risk.' },
  ],

  mistakes: [
    { title: '“A profitable business doesn’t need to borrow to grow.”', html: 'Growth needs assets before it brings in cash. Isbister earns 6% on sales and retains 60% of it, yet needs $160,000 of outside money to grow by 25%: its internal growth rate is only 6.38%.' },
    { title: 'Growing every balance sheet item with sales', html: 'Bank loans, bonds and share capital change only by decision, so the forecast holds them fixed and the AFN shows how much new financing is needed. Growing them with sales assumes the financing has already been arranged and hides the gap.' },
    { title: 'Ignoring spare capacity', html: 'If equipment is under-used, sales can grow without new fixed assets. Isbister’s need turns from $160,000 to a $15,000 surplus at 80% utilisation. Ask how hard the assets are working before scaling them.' },
    { title: 'Putting depreciation or accrued revenue in a cash budget', html: 'A cash budget records cash when it moves: collections when customers pay, suppliers when they are paid. Depreciation is not a payment, and sales on credit are not receipts until collected.' },
    { title: '“The sustainable growth rate is the growth the business can sustain.”', html: 'It is the growth possible with no new shares, constant leverage, margin, turnover and payout. Lantern’s 48.2% for 2027 reflects thin equity and heavy leasing; a different mix of financing gives a different rate. Use it as a consistency check on a plan, not as a forecast.' },
  ],

  application: [
    { p: '<b>A finance director prepares for the bank.</b> The finance director of a fictional furniture maker growing at 20% a year builds a three-year percent-of-sales forecast, then refines it: separate rules for inventory and receivables based on days outstanding (F03’s working-capital ratios), a new factory line in year two rather than spread smoothly, and interest on the new borrowing iterated into the profit forecast. The AFN in each year sets the size of the loan she asks for; a monthly cash budget for the first year sets the line of credit; and the forecast covenant ratios, in a base case and a downturn, show the bank the loan is repayable.' },
    { p: '<b>A founder chooses a growth rate.</b> The founder of a fictional skincare brand finds that her sustainable growth rate is 15% while her plan assumes 40%. Rather than assume finance will appear, she lists the levers: raise the margin by cutting promotion, speed up collections to lift asset turnover, stop paying herself a dividend, borrow more, or sell shares to an investor. Each changes the AFN, and each has a cost, the capital-structure and payout trade-offs of this module.' },
    { p: '<b>A seasonal business arranges its line.</b> A fictional ski-hire business runs its monthly cash budget each summer for the winter ahead under three scenarios: a normal season, a late snowfall and a poor season. It arranges a line of credit large enough for the poor-season peak, agrees the repayment date with the bank before the season, and watches actual cash against the budget each month, so that a shortfall shows up in December rather than in March.' },
  ],

  summary: [
    'Financial planning turns forecasts of sales and investment into forecasts of the statements, so that financing needs are known before money is spent.',
    'Percent of sales: assets and spontaneous liabilities move with sales; debt and equity change only by decision; retained earnings grow by profit less dividends. AFN = (A*/S₀)ΔS − (L*/S₀)ΔS − mS₁(1 − d). Isbister: $160,000.',
    'Relax the assumptions: spare capacity can remove the need (Isbister: a $15,000 surplus at 80% utilisation); interest on new debt raises it (to $165,975).',
    'Internal growth rate = ROA·b ÷ (1 − ROA·b): growth with no outside money. Sustainable growth rate = ROE·b ÷ (1 − ROE·b): no new shares, constant leverage. Isbister: 6.38% and 13.64%.',
    'Growth faster than the SGR needs a higher margin, turnover, leverage or retention, or new shares. Lantern’s 2027 SGR of 48.2% reflects thin equity.',
    'A cash budget tracks receipts and payments month by month, with a minimum balance and a line of credit. Sallowfield’s line peaks at $60,571 in March and is repaid by May.',
    'Scenarios and covenant tests show whether the plan survives bad outcomes; a 20% shortfall in spring leaves Sallowfield owing $22,390 at the end of June.',
  ],

  glossary: [
    { term: 'Additional funds needed', def: 'The outside financing a firm needs to support forecast sales: the increase in assets required, less the increase in spontaneous liabilities and the earnings retained. Abbreviated AFN.' },
    { term: 'Spontaneous liabilities', def: 'Liabilities, such as accounts payable and accrued wages and taxes, that rise automatically with sales as part of normal operations, without a financing decision.' },
    { term: 'Internal growth rate', def: 'The highest growth rate a firm can achieve with no outside financing of any kind, financing new assets only from retained earnings: ROA × b ÷ (1 − ROA × b) on end-of-year assets.' },
    { term: 'Sustainable growth rate', def: 'The highest growth rate a firm can achieve without issuing new shares while keeping its debt-to-equity ratio constant: ROE × b ÷ (1 − ROE × b) on end-of-year equity.' },
    { term: 'Cash budget', def: 'A forecast, usually month by month, of a business’s cash receipts, cash payments and cash balance, showing when it will need to borrow and when it can repay.' },
  ],

  references: [
    { text: 'Dahlquist, J. &amp; Knight, R. (2022). <i>Principles of Finance</i>, section 18.3, “Pro Forma Financials”. OpenStax.', url: 'https://openstax.org/books/principles-finance/pages/18-3-pro-forma-financials', checked: '2026-11-05' },
    { text: 'Dahlquist, J. &amp; Knight, R. (2022). <i>Principles of Finance</i>, section 18.4, “Generating the Complete Forecast”. OpenStax.', url: 'https://openstax.org/books/principles-finance/pages/18-4-generating-the-complete-forecast', checked: '2026-11-05' },
    { text: 'Dahlquist, J. &amp; Knight, R. (2022). <i>Principles of Finance</i>, section 19.6, “Using Excel to Create the Short-Term Plan”. OpenStax.', url: 'https://openstax.org/books/principles-finance/pages/19-6-using-excel-to-create-the-short-term-plan', checked: '2026-11-05' },
  ],

  checks: [
    // Lantern
    { what: 'Revenue 2027', value: P27.revenue, shown: 577860 },
    { what: 'Debt 2026', value: P26.debt, shown: 30000 },
    { what: 'Debt 2027', value: P27.debt, shown: 65250 },
    { what: 'Lease liabilities 2027', value: P27.leaseLiabilities, shown: 173379 },
    { what: 'Lantern NI', value: L.ni, shown: 22431 },
    { what: 'Lantern dividend', value: L.div, shown: 2000 },
    { what: 'Lantern b', value: L.b * 100, shown: 91.1, tol: 0.05 },
    { what: 'Lantern TA', value: L.ta, shown: 327883 },
    { what: 'Lantern equity', value: L.eq, shown: 62818 },
    { what: 'Lantern equity start', value: L.eq0, shown: 42387 },
    { what: 'Lantern ROA end', value: L.roa * 100, shown: 6.84 },
    { what: 'Lantern ROE end', value: L.roe * 100, shown: 35.71 },
    { what: 'Lantern IGR', value: L.igr * 100, shown: 6.65 },
    { what: 'Lantern SGR', value: L.sgr * 100, shown: 48.2, tol: 0.05 },
    { what: 'Lantern retained', value: L.retained, shown: 20431 },
    { what: 'Lantern SGR = retained / start equity', value: L.retained / L.eq0 * 100, shown: 48.2, tol: 0.05 },
    { what: 'Lantern equity grew by retained profit', value: L.eq0 + L.retained, shown: 62818 },
    { what: 'Lantern assets per dollar of equity', value: L.ta / L.eq, shown: 5.22 },
    // Isbister
    { what: 'Isbister assets', value: I.assets, shown: 1200000 },
    { what: 'Isbister L+E', value: I.spont + I.loan + I.equity, shown: 1200000 },
    { what: 'Isbister NI', value: I.ni, shown: 120000 },
    { what: 'Isbister dividends', value: I.div, shown: 48000 },
    { what: 'Sales next year', value: s1, shown: 2500000 },
    { what: 'NI next year', value: ni1, shown: 150000 },
    { what: 'Dividends next year', value: div1, shown: 60000 },
    { what: 'CA next year', value: pf.ca, shown: 625000 },
    { what: 'FA next year', value: pf.fa, shown: 875000 },
    { what: 'TA next year', value: pf.assets, shown: 1500000 },
    { what: 'Spontaneous next year', value: pf.spont, shown: 250000 },
    { what: 'Equity next year', value: pf.equity, shown: 690000 },
    { what: 'L+E next year', value: pf.le, shown: 1340000 },
    { what: 'AFN from statements', value: pf.assets - pf.le, shown: 160000 },
    { what: 'CA share of sales', value: I.ca / I.sales * 100, shown: 25 },
    { what: 'FA share of sales', value: I.fa / I.sales * 100, shown: 35 },
    { what: 'Spontaneous share', value: I.spont / I.sales * 100, shown: 10 },
    { what: 'Assets share', value: I.assets / I.sales, shown: 0.60 },
    { what: 'dS', value: AF.dS, shown: 500000 },
    { what: 'Assets needed', value: AF.needAssets, shown: 300000 },
    { what: 'Spontaneous', value: AF.spont, shown: 50000 },
    { what: 'Retained', value: AF.retained, shown: 90000 },
    { what: 'AFN', value: AF.afn, shown: 160000 },
    { what: 'Retained + spont cover', value: (AF.spont + AF.retained) / AF.needAssets, shown: 0.47, tol: 0.01 },
    { what: 'More than half not covered', value: AF.afn / AF.needAssets > 0.5 ? 1 : 0, shown: 1 },
    { what: 'Full-capacity sales', value: fullCap, shown: 2500000 },
    { what: 'Capacity: CA needed', value: AFc.needAssets, shown: 125000 },
    { what: 'Capacity AFN', value: AFc.afn, shown: -15000 },
    { what: 'Feedback factor', value: fb, shown: 0.036, tol: 0.0005 },
    { what: 'Feedback after-tax interest', value: I.rate * (1 - I.tax), shown: 0.06 },
    { what: '1 − factor', value: 1 - fb, shown: 0.964, tol: 0.0005 },
    { what: 'AFN with feedback', value: afnIter, shown: 165975, tol: 0.5 },
    { what: 'ROA', value: roa * 100, shown: 10 },
    { what: 'ROE', value: roe * 100, shown: 20 },
    { what: 'ROA × b', value: roa * b, shown: 0.06 },
    { what: 'ROE × b', value: roe * b, shown: 0.12 },
    { what: 'IGR', value: igr * 100, shown: 6.38 },
    { what: 'SGR', value: sgr * 100, shown: 13.64 },
    { what: 'AFN zero at IGR with no spontaneous liabilities', value: Math.abs(atIgr.afn) < 1e-6 ? 1 : 0, shown: 1 },
    { what: 'New debt at SGR', value: atSgr.afn, shown: 54545, tol: 0.5 },
    { what: 'New debt at SGR = loan × SGR', value: I.loan * sgr, shown: 54545, tol: 0.5 },
    { what: 'Planned 25% above SGR and IGR', value: I.g > sgr && I.g > igr ? 1 : 0, shown: 1 },
    { what: 'SGR 13.6%', value: sgr * 100, shown: 13.6, tol: 0.05 },
    // Sallowfield
    { what: 'Opening cash', value: S.opening, shown: 25000 },
    { what: 'Minimum', value: S.minimum, shown: 15000 },
    { what: 'Limit', value: S.limit, shown: 80000 },
    { what: 'Jan draw', value: CB.rows[0].borrow, shown: 12000 },
    { what: 'Feb interest', value: CB.rows[1].interest, shown: 120 },
    { what: 'Feb draw', value: CB.rows[1].borrow, shown: 33120 },
    { what: 'Mar interest', value: CB.rows[2].interest, shown: 451, tol: 0.5 },
    { what: 'Mar draw', value: CB.rows[2].borrow, shown: 15451, tol: 0.5 },
    { what: 'Apr interest', value: CB.rows[3].interest, shown: 606, tol: 0.5 },
    { what: 'Apr repay', value: CB.rows[3].repay, shown: 24394, tol: 0.5 },
    { what: 'May interest', value: CB.rows[4].interest, shown: 362, tol: 0.5 },
    { what: 'May repay', value: CB.rows[4].repay, shown: 36177, tol: 0.5 },
    { what: 'May end cash', value: CB.rows[4].end, shown: 26461, tol: 0.5 },
    { what: 'Jun end cash', value: CB.rows[5].end, shown: 46461, tol: 0.5 },
    { what: 'Line Jan', value: CB.rows[0].debt, shown: 12000 },
    { what: 'Line Feb', value: CB.rows[1].debt, shown: 45120 },
    { what: 'Line Mar', value: CB.rows[2].debt, shown: 60571, tol: 0.5 },
    { what: 'Line Apr', value: CB.rows[3].debt, shown: 36177, tol: 0.5 },
    { what: 'Line May', value: CB.rows[4].debt, shown: 0 },
    { what: 'Peak', value: CB.peakDebt, shown: 60571, tol: 0.5 },
    { what: 'Peak is March', value: CB.rows.findIndex((r) => r.debt === CB.peakDebt), shown: 2 },
    { what: 'Below minimum in first three months', value: CB.rows.slice(0, 3).every((r) => r.borrow > 0) && CB.rows.slice(3).every((r) => r.borrow === 0) ? 1 : 0, shown: 1 },
    { what: 'Repaid in May', value: CB.rows[3].debt > 0 && CB.rows[4].debt === 0 ? 1 : 0, shown: 1 },
    { what: 'Interest total', value: intTotal, shown: 1539, tol: 0.5 },
    { what: 'Monthly rate', value: S.rate * 100, shown: 1 },
    { what: 'Wet spring Mar receipts', value: S.receipts[2] * 0.8, shown: 48000 },
    { what: 'Wet spring Apr receipts', value: S.receipts[3] * 0.8, shown: 76000 },
    { what: 'Wet spring May receipts', value: S.receipts[4] * 0.8, shown: 88000 },
    { what: 'Wet spring peak', value: CBlow.peakDebt, shown: 72571, tol: 0.5 },
    { what: 'Wet spring peak is March', value: CBlow.rows.findIndex((r) => r.debt === CBlow.peakDebt), shown: 2 },
    { what: 'Wet spring headroom', value: S.limit - CBlow.peakDebt, shown: 7429, tol: 0.5 },
    { what: 'Wet spring June owed', value: CBlow.endDebt, shown: 22390, tol: 0.5 },
    { what: 'Shortfall 20%', value: 20, shown: 20 },
  ],
};
