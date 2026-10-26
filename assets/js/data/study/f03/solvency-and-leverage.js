// solvency-and-leverage.js — F03 · Solvency and leverage. Content only; exercises are in solvency-and-leverage.ex.js.
// Lantern’s figures come from case.js (PERIODS, COMPARATIVE, LEASE, BREWER, FACTS) and the ratios from core/ratios.js.
// Starbucks FY2024 figures are from its Form 10-K (EDGAR’s XBRL rendering: R7 balance sheet, R3 earnings, R5 cash flows);
// Harbourline Roasters is F00’s fictional roaster ($ millions). Tidewater Bank (applied example) is fictional.
// Lease-adjusted ratios are made consistent here by moving the lease cost’s interest part below EBIT and its
// amortisation part into D&A, so that debt and EBITDA are adjusted together.
import { PERIODS, COMPARATIVE, LEASE, BREWER, FACTS } from './case.js?v=18';
import { HARBOURLINE as HB, HARBOURLINE_DETAIL as HBD } from '../f00/case.js?v=18';
import * as R from '../../../core/ratios.js?v=18';

const P26 = PERIODS[2026], P27 = PERIODS[2027];
const S26 = R.solvency(P26), S27 = R.solvency(P27), SA = R.solvency(P27, { withLeases: true });   // SA: leases as debt, earnings adjusted
const b27 = (label) => COMPARATIVE.balance.find((r) => r[0] === label)[2];
const pct = (v) => `${(v * 100).toFixed(1)}%`;
const x2 = (v) => v.toFixed(2);

const ebitda26 = P26.ebit + P26.da, ebitda27 = P27.ebit + P27.da;
const ebitda26a = R.annualise(ebitda26, 10);
// leases treated like loans in the income statement too
const leaseInt = LEASE.interest2027, leaseAmort = LEASE.cost2027 - LEASE.interest2027;      // 11,124 and 28,876
const ADJ = { ebit: SA.ebit, interestExpense: SA.interest };                                  // 43,911 and 14,003
const ebitdaAdj = SA.ebitda;                                                                  // 92,587
// the classic slip: leases in debt, EBITDA left after the lease cost (computed by hand)
const S27L = { debt: SA.debt, netDebt: SA.netDebt, netDebtToEbitda: SA.netDebt / ebitda27 };   // 4.41
// the composition of 2027’s liabilities
const opLiab27 = P27.totalLiabilities - P27.debt - P27.leaseLiabilities;                     // 26,436
// the van note: $20,000 at 6%, $5,000 a year from 1 June 2027
const van27 = 20_000 - 5_000;
const locRate = FACTS.lineOfCredit.rate;
// interest by loan, 2027
const INT = { coastline: 10_000 * 0.06, van: 20_000 * 0.06 * 5 / 12 + 15_000 * 0.06 * 7 / 12, brewer: BREWER.interestAccrued2027,
  loc: FACTS.lineOfCredit.draws.reduce((s, d) => s + d.amount * locRate * (13 - Number(d.date.slice(5, 7))) / 12, 0) };

// Starbucks FY2024, $ millions
const SB = { ta: 31339.3, tl: 38780.9, equity: -7441.6, ltd: 14319.5, ltdCur: 1248.9, std: 0, leaseCur: 1463.1, leaseNon: 8771.6,
  cash: 3286.2, sti: 257.0, opInc: 5408.8, interest: 562.0, daCF: 1592.4, daIS: 1512.6, equityInvestees: 301.2 };
SB.debt = SB.ltd + SB.ltdCur + SB.std;
SB.leases = SB.leaseCur + SB.leaseNon;
const SBR = R.solvency({ totalAssets: SB.ta, totalLiabilities: SB.tl, equity: SB.equity, debt: SB.debt, cash: SB.cash + SB.sti, ebit: SB.opInc, da: SB.daCF, interestExpense: SB.interest });
const SBpay = { div: 2263.3 + 2431.8 + 2585.0, buy: 4013.0 + 984.4 + 1266.7, ni: 3281.6 + 4124.5 + 3760.9 };
// Harbourline (fictional, F00), $ millions
const HBR = R.solvency({ totalAssets: HBD.totalAssets, totalLiabilities: HBD.totalAssets - HBD.bookEquity, equity: HBD.bookEquity, debt: HB.debt, cash: HB.cash, ebit: HB.ebit, da: HB.da, interestExpense: HBD.interest });

// Tidewater Bank (fictional): maximum net debt ÷ EBITDA of 3.0
const MAX = 3.0, LOAN = 60_000;
const head = { plain: MAX * ebitda27 - S27.netDebt, leases: MAX * ebitdaAdj - SA.netDebt };
const pro = { plain: (S27.netDebt + LOAN) / ebitda27, leases: (SA.netDebt + LOAN) / ebitdaAdj, mixed: (S27L.netDebt + LOAN) / ebitda27 };

export default {
  slug: 'solvency-and-leverage',
  title: 'Solvency and leverage',
  blurb: 'Measure how far a business is financed by borrowing and how easily it carries the cost: debt and leverage ratios, interest and EBITDA coverage, net debt to EBITDA, leases and vendor finance as debt, and what to do when equity turns negative.',
  status: 'draft',
  objectives: [
    'Calculate the debt ratio, liabilities to equity, debt to equity, debt to capital and the equity multiplier, and explain how they relate.',
    'Calculate interest coverage, EBITDA coverage and net debt to EBITDA, and interpret them for a lender.',
    'Identify what counts as debt, including vendor finance such as an instalment plan and, as an adjustment, operating lease liabilities under ASC 842.',
    'Adjust leverage and coverage ratios for leases consistently, so that debt and earnings are measured on the same basis.',
    'Explain why debt to equity and return on equity lose their meaning when equity is negative, using Starbucks.',
  ],
  prerequisites: [
    { lesson: 'f03/liquidity', why: 'Liquidity looks at the coming year; solvency at the whole capital structure. Lantern’s 2027 balance sheet is the same.' },
    { lesson: 'f00/capital-and-liquidity', why: 'Debt, equity, leverage and the debt-to-equity ratio were introduced there.' },
    { lesson: 'f00/value-and-valuation-words', why: 'EBIT, EBITDA and net debt are defined there.' },
    { text: 'The brewer’s instalment plan and its implied rate from F04 (annuities) help but are not essential.' },
  ],
  case: 'lantern',

  concept: [
    { case: 'At the end of 2026 Lantern was financed mostly by Ana: equity of $42,387 against $30,000 of loans (the Coastline note and the van note). By the end of 2027 its equity had grown to $62,818, but it also owed $65,250 of interest-bearing debt and $173,379 of lease liabilities for the two cafés. Coastline’s credit officer has a second question after liquidity: how much of Lantern now belongs, in effect, to its lenders and landlords, and how comfortably does it earn their interest?' },
    { p: '<g>Solvency</g> is the ability to meet all obligations over the long run, not just those due this year. A business is solvent when its assets are worth more than everything it owes and when its earnings can carry the cost of its debt. <g>Leverage</g> (in the UK, gearing) is the use of borrowed money to finance the business. Leverage is not bad in itself: interest is fixed, so when the business earns more than the debt costs, the owners keep the difference. But fixed payments must be made in bad years too, so leverage magnifies losses as well as gains, and every lender asks how much there is.' },
    { p: 'Solvency ratios come in two families. <b>Leverage ratios</b> compare stocks on the balance sheet: how much of the assets is financed by liabilities or debt rather than by equity. <b>Coverage ratios</b> compare flows: how many times the year’s earnings cover the interest, or how many years of earnings the debt represents. A lender wants both, because a business can have little debt and weak earnings, or a lot of debt and strong earnings.' },
    { table: {
      caption: 'Lantern’s leverage and coverage (fictional)',
      head: ['Measure', '2026', '2027'],
      align: ['l', 'r', 'r'],
      rows: [
        ['Total liabilities ÷ total assets (debt ratio)', pct(S26.debtRatio), pct(S27.debtRatio)],
        ['Total liabilities ÷ equity', x2(S26.liabilitiesToEquity), x2(S27.liabilitiesToEquity)],
        ['Interest-bearing debt ÷ equity', x2(S26.debtToEquity), x2(S27.debtToEquity)],
        ['Debt ÷ (debt + equity)', pct(S26.debtToCapital), pct(S27.debtToCapital)],
        ['Equity multiplier (total assets ÷ equity)', x2(S26.equityMultiplier), x2(S27.equityMultiplier)],
        ['Interest coverage (EBIT ÷ interest expense)', x2(S26.interestCoverage), x2(S27.interestCoverage)],
        ['EBITDA coverage', x2(S26.ebitdaCoverage), x2(S27.ebitdaCoverage)],
        ['Net debt ($)', '−12,940', '58,719'],
        ['Net debt ÷ EBITDA', `${x2(S26.netDebtToEbitda)} (ten months)`, x2(S27.netDebtToEbitda)],
      ],
      note: 'Balances at 31 December; 2026’s earnings cover ten months. Debt is interest-bearing debt only; leases are added in the In depth section.',
    } },
    { p: 'Every leverage measure rose and every coverage measure fell. Liabilities went from 54.8% to 80.8% of total assets, and for every dollar of equity Lantern now has $4.22 of liabilities rather than $1.21. Interest coverage fell from 31.43 to 11.39 times. Lantern held more cash than debt at the end of 2026 (negative net debt); a year later its debt exceeded its cash by $58,719.' },
    { p: 'Two different stories sit inside those numbers. Interest-bearing debt only doubled, from $30,000 to $65,250, and debt to equity rose modestly, from 0.71 to 1.04. Total liabilities rose more than fivefold, from $51,289 to $265,065, and almost two-thirds of the 2027 total is one item: the cafés’ lease liabilities. Whether leases are debt is therefore the most important judgement in Lantern’s solvency analysis, and this lesson takes it slowly.' },
    { callout: 'key', title: 'Say which “debt” you mean', html: 'Analysts use “debt” for at least three things: total liabilities, interest-bearing debt, and interest-bearing debt plus lease liabilities. Lantern’s 2027 “debt to equity” is 4.22, 1.04 or 3.80 depending on the choice. None is wrong; mixing them is. This course uses interest-bearing debt unless it says otherwise, and calls the first ratio liabilities to equity.' },
  ],

  theory: [
    { h: 'Leverage ratios and how they connect' },
    { p: 'The leverage ratios all compare the two ways a business finances its assets: by owing (liabilities) or by owning (equity). Because total assets = total liabilities + equity, they carry much the same information and can be converted into each other:' },
    { math: String.raw`\text{Equity multiplier} = \dfrac{\text{Total assets}}{\text{Equity}} = 1 + \dfrac{\text{Total liabilities}}{\text{Equity}} = \dfrac{1}{1 - \text{Debt ratio}}` },
    { p: 'Lantern 2027: <m>1 + 4.22 = 5.22</m>, and <m>1 \\div (1 - 0.808) = 5.22</m>. The equity multiplier says Lantern controls $5.22 of assets for each dollar of equity; it reappears in the DuPont analysis of return on equity in module 3. The debt-to-capital ratio uses interest-bearing debt only: of the long-term funding provided by lenders and owners together, how much came from lenders? Lantern’s rose from 41.4% to 50.9%.' },
    { p: 'Which liabilities matter? Trade payables, wages, taxes and unearned revenue are owed, but they arise from operating and they carry no interest; a lender worries most about claims that rank alongside its own and charge interest. Lantern’s 2027 liabilities split three ways: $65,250 of interest-bearing debt (24.6%), $173,379 of lease liabilities (65.4%) and $26,436 of operating liabilities (10.0%).' },
    { table: {
      caption: 'Lantern’s interest-bearing debt at 31 December 2027 (fictional)',
      head: ['Loan', 'Rate', 'Owed ($)', 'Due in 2028 ($)', '2027 interest ($)'],
      align: ['l', 'r', 'r', 'r', 'r'],
      rows: [
        ['Coastline note', '6%', '10,000', '10,000', '600'],
        ['Van note', '6%', '15,000', '5,000', '1,025'],
        ['Brewer instalment plan', '4.73% (implied)', '16,250', '12,091', '714'],
        ['Line of credit', '9%', '24,000', '24,000', '540'],
      ],
      foot: [['Total', '', '65,250', '51,091', '2,879']],
      note: 'The brewer plan’s rate is the annual rate implied by 24 payments of $1,050 for a $24,000 brewer (0.394% a month × 12). The line of credit was drawn in two $12,000 tranches, on 1 September and 1 November.',
    } },

    { h: 'Vendor finance is debt' },
    { p: 'Lantern bought its cold-brew brewer on the supplier’s plan: 24 monthly payments of $1,050, $25,200 in all, for a machine whose cash price is $24,000. It recorded the brewer and an instalment note at $24,000, and the $1,200 difference is interest, spread over the plan at its <g>implied interest rate</g> (F04 found it cheaper than Coastline’s 7.2% loan). The supplier is a lender in all but name, and the plan is interest-bearing debt with a repayment schedule. <g>Vendor financing</g> of this kind must be counted with the bank loans; had Lantern recorded it with its accounts payable, its debt ratios would look lower than its real borrowing.' },

    { h: 'Coverage: can earnings carry the debt?' },
    { p: '<b>Interest coverage</b> (times interest earned) divides EBIT by interest expense. EBIT is used because interest is paid out of earnings before tax; for Lantern, which has no income outside its operations, EBIT is operating income. Lantern’s fell from <m>37{,}716 \\div 1{,}200 = 31.43</m> to <m>32{,}787 \\div 2{,}879 = 11.39</m>. <b>EBITDA coverage</b> adds back depreciation and amortisation, which use no cash in the year, and fell less steeply, from 35.43 to 18.27. Because both earnings and interest are flows over the same period, coverage ratios are not distorted by 2026’s ten months.' },
    { p: 'Two cautions. First, 2026’s EBIT was earned before Ana took any salary; the $48,000 she was paid in 2027 alone is larger than 2027’s EBIT, so 2026’s 31.43 flatters the business. Second, coverage counts interest, not principal. Lantern must repay $51,091 of debt principal in 2028, more than the $42,231 its 2027 EBITDA would leave after interest and tax. A lender looking at repayments as well uses a debt-service measure, comparing cash flow with interest plus scheduled principal.' },
    { p: '<b>Net debt to EBITDA</b> asks how many years of EBITDA would repay the debt, net of cash. <g>Net debt</g> is debt minus cash; Lantern’s was −$12,940 at the end of 2026 (more cash than debt) and $58,719 at the end of 2027, or 1.12 times EBITDA. Because it divides a balance by a flow, a part-year needs annualising: 2026’s ten-month EBITDA of $42,516 is $51,019 a year, giving −0.25 rather than −0.30. Lenders often set a maximum for this ratio in loan agreements, and define both sides carefully.' },

    { h: 'Leases as debt' },
    { p: 'An operating lease commits the lessee to fixed payments for years, like a loan used to buy the asset. Since ASC 842 (effective for public companies for periods beginning after 15 December 2018, and for other entities three years later), lessees record that commitment: a <g>right-of-use asset</g> and a <g>lease liability</g> at the present value of the payments. Lantern’s cafés added $202,255 of each on 1 March 2027, discounted at 7.2%; by the year end the liability was $173,379. The liability is on the balance sheet, so it is already in the debt ratio and liabilities to equity. Whether it also belongs in “debt” is the analyst’s choice.' },
    { callout: 'standards', title: 'Operating leases in the statements under ASC 842 and IFRS 16', html: 'Under US GAAP an operating lease’s cost is one straight-line expense in operating income (Lantern’s Operating Lease Cost, $40,000 for ten months). The interest on the liability is inside that cost, so it is not in interest expense, EBIT is after it, and the payments are operating cash outflows. IFRS 16, effective for annual periods beginning on or after 1 January 2019, has a single lessee model: apart from leases of 12 months or less and of low-value assets, every lease is accounted for like a purchase on credit, with depreciation of the right-of-use asset and interest on the liability. The same café would therefore show higher EBIT and EBITDA, and more interest, under IFRS than under US GAAP. Compare across the two frameworks only after adjusting.' },
    { p: 'If the lease liability is counted as debt, the income statement must be adjusted to match, or the ratios mix two bases. Treat the lease as a loan throughout: split the $40,000 lease cost into its interest part, $11,124 (the accretion on the liability), and its amortisation part, $28,876. Move the interest below EBIT into interest expense, and add the amortisation to depreciation and amortisation.' },
    { table: {
      caption: 'Lantern 2027, with and without the leases as debt',
      head: ['Measure', 'Leases not debt', 'Leases as debt, adjusted consistently'],
      align: ['l', 'r', 'r'],
      rows: [
        ['Debt ($)', '65,250', '238,629'],
        ['EBIT ($)', '32,787', '43,911'],
        ['Interest expense ($)', '2,879', '14,003'],
        ['EBITDA ($)', '52,587', '92,587'],
        ['Debt ÷ equity', x2(S27.debtToEquity), x2(SA.debtToEquity)],
        ['Debt ÷ capital', pct(S27.debtToCapital), pct(SA.debtToCapital)],
        ['Interest coverage', x2(S27.interestCoverage), x2(SA.interestCoverage)],
        ['Net debt ÷ EBITDA', x2(S27.netDebtToEbitda), x2(SA.netDebtToEbitda)],
      ],
      note: 'Adjusted EBITDA adds back the whole lease cost, since the lease is now treated as financing. Adding the lease liability to debt but keeping EBITDA after the lease cost gives net debt ÷ EBITDA of 4.41: debt on one basis, earnings on another.',
    } },
    { p: 'The adjustment changes the picture more than any other in Lantern’s analysis. Interest coverage falls from 11.39 to 3.14: once the cafés’ rent is treated as financing, nearly a third of Lantern’s earnings before financing costs go to its lenders and landlords. Net debt to EBITDA rises from 1.12 to 2.51. The unadjusted figures are not wrong, but they describe a business that rents its cafés as if it owned them outright.' },

    { h: 'When equity is negative' },
    { p: 'Equity is a residual: assets minus liabilities. When a company pays its owners more, over the years, than it earns, or makes large losses, equity can fall below zero, and the company reports a <g>shareholders’ deficit</g>. Starbucks is the best-known example among large companies.' },
    { table: {
      caption: 'Starbucks Corporation, FY2024 ($ millions)',
      head: ['Measure', 'Value', 'Comment'],
      align: ['l', 'r', 'l'],
      rows: [
        ['Total assets', '31,339.3', ''],
        ['Total liabilities', '38,780.9', ''],
        ['Total shareholders’ equity (deficit)', '(7,441.6)', 'Negative at both FY2023 and FY2024 year ends'],
        ['Debt (long-term debt and its current portion)', '15,568.4', 'Plus operating lease liabilities of 10,234.7'],
        ['Debt ratio', pct(SBR.debtRatio), 'Above 100%: liabilities exceed assets'],
        ['Debt ÷ equity', x2(SBR.debtToEquity), 'Negative: not meaningful'],
        ['Interest coverage (operating income ÷ interest expense)', x2(SBR.interestCoverage), ''],
        ['Net debt ÷ EBITDA', x2(SBR.netDebtToEbitda), 'Cash and short-term investments 3,543.2; EBITDA 7,001.2'],
      ],
      note: 'EBITDA uses the cash-flow statement’s total depreciation and amortisation, 1,592.4, rather than the income statement line, 1,512.6, which excludes amounts recorded within other cost lines. Starbucks’ operating income includes 301.2 of income from equity investees. Source: Form 10-K for the fiscal year ended 29 September 2024.',
    } },
    { p: 'A debt-to-equity ratio of −2.09 does not mean Starbucks has negative leverage; it means the ratio has stopped working. As equity approaches zero, debt ÷ equity and the equity multiplier rise without limit; when equity crosses zero they flip sign and any comparison breaks. Return on equity fails the same way. With negative equity, use measures that don’t divide by it: debt ratio, debt to EBITDA and coverage. By those, Starbucks covers its interest 9.62 times and its net debt is 1.72 times EBITDA: a company with heavy obligations that its earnings carry comfortably.' },
    { p: 'Where the deficit came from matters too. In its fiscal years 2022 to 2024 Starbucks paid $7,280.1 million in dividends and $6,264.1 million to repurchase its own shares, $13,544.2 million in all, against net earnings attributable to Starbucks of $11,167.0 million. Paying out more than it earned, financed partly by borrowing, is a choice about capital structure, not a sign of losses. A small business with negative equity from accumulated losses is a very different case, and the debt ratio alone won’t tell them apart: read the statement of changes in equity.' },
    { p: 'For comparison, Harbourline Roasters, the fictional roaster from F00, has a debt ratio of 54.5%, debt to equity of 0.70, interest coverage of 5.55 and net debt of 1.77 times EBITDA, close to Lantern’s 2026 leverage but with much weaker coverage.' },
  ],

  formulas: [
    { id: 'solv-debt-ratio', name: 'Debt ratio (total liabilities to total assets)',
      tex: String.raw`\text{Debt ratio} = \dfrac{\text{Total liabilities}}{\text{Total assets}}`,
      where: [[String.raw`\text{Total liabilities}`, 'Everything the business owes, current and noncurrent, including lease liabilities', '$'], [String.raw`\text{Total assets}`, 'Total assets on the same balance sheet', '$']],
      note: 'Shown as a percentage. Lantern: 54.8% (2026), 80.8% (2027). Above 100% means negative equity.' },
    { id: 'solv-liab-equity', name: 'Liabilities to equity',
      tex: String.raw`\text{Liabilities to equity} = \dfrac{\text{Total liabilities}}{\text{Equity}}`,
      where: [[String.raw`\text{Total liabilities}`, 'Everything the business owes', '$'], [String.raw`\text{Equity}`, 'Total shareholders’ equity', '$']],
      note: 'Some textbooks call this the debt-to-equity ratio. Lantern 2027: <m>265{,}065 \\div 62{,}818 = 4.22</m>.' },
    { id: 'solv-debt-equity', name: 'Debt to equity (interest-bearing debt)',
      tex: String.raw`\text{Debt to equity} = \dfrac{\text{Debt}}{\text{Equity}}`,
      where: [[String.raw`\text{Debt}`, 'Interest-bearing debt: notes, loans, instalment notes, drawn credit lines and their current portions (add lease liabilities only as a stated adjustment)', '$'], [String.raw`\text{Equity}`, 'Total shareholders’ equity', '$']],
      assumptions: 'Equity is positive; with negative equity the ratio is not meaningful.',
      note: 'Lantern: <m>30{,}000 \\div 42{,}387 = 0.71</m> (2026); <m>65{,}250 \\div 62{,}818 = 1.04</m> (2027).' },
    { id: 'solv-debt-capital', name: 'Debt to capital',
      tex: String.raw`\text{Debt to capital} = \dfrac{\text{Debt}}{\text{Debt} + \text{Equity}}`,
      where: [[String.raw`\text{Debt}`, 'Interest-bearing debt, as above', '$'], [String.raw`\text{Equity}`, 'Total shareholders’ equity', '$']],
      note: 'Lantern: 41.4% (2026), 50.9% (2027).' },
    { id: 'solv-equity-multiplier', name: 'Equity multiplier',
      tex: String.raw`\text{Equity multiplier} = \dfrac{\text{Total assets}}{\text{Equity}} = 1 + \dfrac{\text{Total liabilities}}{\text{Equity}}`,
      where: [[String.raw`\text{Total assets}`, 'Total assets', '$'], [String.raw`\text{Equity}`, 'Total shareholders’ equity', '$']],
      note: 'Here on closing balances; DuPont analysis (module 3) uses averages. Lantern: 2.21 (2026), 5.22 (2027).' },
    { id: 'solv-interest-coverage', name: 'Interest coverage (times interest earned)',
      tex: String.raw`\text{Interest coverage} = \dfrac{\text{EBIT}}{\text{Interest expense}}`,
      where: [[String.raw`\text{EBIT}`, 'Earnings before interest and taxes; for a business with no non-operating items, operating income', '$'], [String.raw`\text{Interest expense}`, 'Interest expense for the same period (it excludes the interest inside an operating lease cost under US GAAP)', '$']],
      note: 'Lantern: 31.43 (2026), 11.39 (2027); 3.14 with leases treated as debt.' },
    { id: 'solv-ebitda-coverage', name: 'EBITDA coverage',
      tex: String.raw`\text{EBITDA coverage} = \dfrac{\text{EBIT} + \text{D\&A}}{\text{Interest expense}}`,
      where: [[String.raw`\text{EBIT} + \text{D\&A}`, 'EBITDA: EBIT plus depreciation and amortisation', '$'], [String.raw`\text{Interest expense}`, 'Interest expense for the same period', '$']],
      note: 'Lantern: 35.43 (2026), 18.27 (2027).' },
    { id: 'solv-netdebt-ebitda', name: 'Net debt to EBITDA',
      tex: String.raw`\text{Net debt to EBITDA} = \dfrac{\text{Debt} - \text{Cash}}{\text{EBIT} + \text{D\&A}}`,
      where: [[String.raw`\text{Debt} - \text{Cash}`, 'Net debt: interest-bearing debt less cash and short-term investments', '$'], [String.raw`\text{EBIT} + \text{D\&A}`, 'EBITDA for a twelve-month period (annualise a part-year)', '$']],
      assumptions: 'Debt and EBITDA on the same basis: if lease liabilities are added to debt, add the lease cost back to EBITDA.',
      note: 'In years: how long EBITDA would take to repay net debt. Lantern 2027: 1.12; 2.51 with leases as debt.' },
    { id: 'solv-lease-adjust', name: 'Lease-adjusted debt and EBITDA (US GAAP operating leases)',
      tex: String.raw`\text{Debt}_{\text{adj}} = \text{Debt} + \text{Lease liabilities}, \quad \text{EBITDA}_{\text{adj}} = \text{EBITDA} + \text{Operating lease cost}`,
      where: [[String.raw`\text{Lease liabilities}`, 'Current and noncurrent operating lease liabilities', '$'], [String.raw`\text{Operating lease cost}`, 'The straight-line lease expense in operating income: its interest part moves to interest expense, its amortisation part to D&amp;A', '$']],
      note: 'Lantern 2027: <m>65{,}250 + 173{,}379 = 238{,}629</m>; <m>52{,}587 + 40{,}000 = 92{,}587</m>.' },
  ],

  examples: [
    { level: 'simple', title: 'Lantern’s leverage, two year ends',
      fictional: true,
      setup: 'From Lantern’s balance sheets: total assets $93,676 and $327,883; total liabilities $51,289 and $265,065; equity $42,387 and $62,818; interest-bearing debt $30,000 and $65,250. Calculate the debt ratio, liabilities to equity, debt to equity and the equity multiplier for both year ends.',
      steps: [
        String.raw`Debt ratio: <m>51{,}289 \div 93{,}676 = 54.8\%</m>; <m>265{,}065 \div 327{,}883 = 80.8\%</m>.`,
        String.raw`Liabilities to equity: <m>51{,}289 \div 42{,}387 = 1.21</m>; <m>265{,}065 \div 62{,}818 = 4.22</m>.`,
        String.raw`Debt to equity (interest-bearing debt only): <m>30{,}000 \div 42{,}387 = 0.71</m>; <m>65{,}250 \div 62{,}818 = 1.04</m>.`,
        String.raw`Equity multiplier: <m>93{,}676 \div 42{,}387 = 2.21</m>; <m>327{,}883 \div 62{,}818 = 5.22</m>. Check: <m>1 + 1.21 = 2.21</m> and <m>1 + 4.22 = 5.22</m>.`,
      ],
      answer: '2026: 54.8%, 1.21, 0.71, 2.21. 2027: 80.8%, 4.22, 1.04, 5.22.',
      interpretation: 'Measured by all liabilities, Lantern’s leverage more than tripled; measured by interest-bearing debt, it rose by about half. The gap between the two is the leases, which is why the next example adjusts for them.' },
    { level: 'challenging', title: 'Leases as debt, done consistently',
      fictional: true,
      setup: 'Restate Lantern’s 2027 debt to equity, interest coverage and net debt to EBITDA treating the cafés’ operating leases as debt. Lease liabilities are $173,379 at 31 December 2027; the $40,000 lease cost for the year includes $11,124 of interest on the liability. EBIT is $32,787, depreciation $19,800, interest expense $2,879, debt $65,250, cash $6,531, equity $62,818.',
      steps: [
        String.raw`Debt: <m>65{,}250 + 173{,}379 = 238{,}629</m>. Debt to equity <m>238{,}629 \div 62{,}818 = 3.80</m>, against 1.04.`,
        String.raw`Split the lease cost: interest 11,124; amortisation <m>40{,}000 - 11{,}124 = 28{,}876</m>.`,
        String.raw`Earnings and interest on the loan basis: EBIT <m>32{,}787 + 11{,}124 = 43{,}911</m> (the interest is no longer an operating cost); interest expense <m>2{,}879 + 11{,}124 = 14{,}003</m>; coverage <m>43{,}911 \div 14{,}003 = 3.14</m>.`,
        String.raw`EBITDA: <m>43{,}911 + 19{,}800 + 28{,}876 = 92{,}587</m>, which is the reported 52,587 plus the whole 40,000 lease cost. Net debt <m>238{,}629 - 6{,}531 = 232{,}098</m>; net debt ÷ EBITDA <m>232{,}098 \div 92{,}587 = 2.51</m>.`,
        String.raw`The inconsistent version, leases in debt but EBITDA after the lease cost, gives <m>232{,}098 \div 52{,}587 = 4.41</m>: it counts the leases as debt without giving back the earnings that pay for them.`,
      ],
      answer: 'With leases as debt: debt to equity 3.80, interest coverage 3.14, net debt to EBITDA 2.51 (not 4.41).',
      interpretation: 'Treated as financing, the cafés make Lantern a heavily leveraged business whose earnings cover its financing costs about three times. That is the comparison a lender would make with a café owner who borrowed to buy its premises.' },
    { level: 'applied', title: 'How much more can Lantern borrow?',
      fictional: true,
      setup: 'Before accepting Coastline’s 2028 offer, Ana asks Tidewater Bank, a fictional lender, for a quote on a $60,000 five-year loan for the second kitchen. Tidewater’s term sheet allows net debt of at most 3.0 times EBITDA and defines debt to include lease liabilities. Using 2027’s figures, how much headroom does Lantern have, and would the loan fit? Assume the loan is spent on the kitchen, so cash does not rise.',
      steps: [
        String.raw`Without leases (for comparison): maximum net debt <m>3.0 \times 52{,}587 = 157{,}761</m>; headroom <m>157{,}761 - 58{,}719 = 99{,}042</m>. After the loan: <m>(58{,}719 + 60{,}000) \div 52{,}587 = 2.26</m>. It fits.`,
        String.raw`With leases, and EBITDA before the lease cost: maximum <m>3.0 \times 92{,}587 = 277{,}761</m>; headroom <m>277{,}761 - 232{,}098 = 45{,}663</m>. After the loan: <m>292{,}098 \div 92{,}587 = 3.15</m>. It doesn’t fit.`,
        String.raw`With leases in debt but EBITDA after the lease cost, Lantern would already be at 4.41 and the loan would take it to <m>292{,}098 \div 52{,}587 = 5.55</m>.`,
        'Judgement: under Tidewater’s definition the loan is about $14,000 too large on 2027’s earnings. Ana could borrow about $45,000, wait for a year of full café earnings (2027 had only ten months of them), or ask that the definition match debt with EBITDA before lease costs, which the term sheet must state explicitly.',
      ],
      answer: 'Headroom is $45,663 under a lease-inclusive definition with matching EBITDA, so a $60,000 loan would take Lantern to 3.15, over the 3.0 limit; without leases it would be 2.26 and fit easily.',
      interpretation: 'The same business passes or fails depending on how the agreement defines debt and EBITDA. Read the definitions before the numbers, and test a loan on the figures after the borrowing, not before it.' },
  ],

  demo: [
    { widget: 'solv-ratios', intro: 'Lantern’s two year ends beside Starbucks and the fictional Harbourline. Tick “Count operating lease liabilities as debt”: Lantern’s 2027 debt to equity rises to 3.80, and because the widget restates EBIT, interest and EBITDA on the same basis, coverage falls to 3.14 and net debt to EBITDA rises to 2.51 (not the mismatched 4.41). Starbucks’ debt to equity shows why negative equity breaks the ratio.' },
    { widget: 'solv-equity', intro: 'Change the balance sheet and watch the leverage ratios. Lower total assets until equity approaches zero: liabilities to equity and the equity multiplier explode, then become meaningless below zero, while the debt ratio keeps telling a sensible story.' },
  ],

  mistakes: [
    { title: '“Debt to equity and liabilities to equity are the same ratio.”', html: 'They share a denominator, not a numerator. Lantern’s 2027 liabilities to equity is 4.22; its interest-bearing debt to equity is 1.04. Textbooks and data providers use both names loosely, so state your definition and use the same one for every company you compare.' },
    { title: '“Operating leases aren’t debt because the payments are operating expenses.”', html: 'The payments are as fixed as a loan’s, and since ASC 842 the obligation is on the balance sheet. Counting the liability as debt is a choice, but leaving it out treats Lantern as if it owned its cafés outright. Show the ratios both ways when leases are large.' },
    { title: '“Add the leases to debt and keep EBITDA as reported.”', html: 'That puts the leases in the numerator and their cost in the denominator too: Lantern’s net debt to EBITDA comes out at 4.41 instead of 2.51. If the lease is debt, its cost is financing: add the lease cost back to EBITDA, and move its interest part into interest expense for coverage.' },
    { title: 'Using net income for interest coverage', html: 'Net income is after interest and tax, so it understates what is available to pay interest: <m>22{,}431 \\div 2{,}879 = 7.79</m> instead of 11.39 for Lantern. Use EBIT, the earnings before the interest you are testing.' },
    { title: '“Negative debt to equity means low leverage.”', html: 'Starbucks’ −2.09 comes from negative equity, a shareholders’ deficit, not from negative debt. When equity is negative or tiny, debt to equity, the equity multiplier and return on equity are not meaningful; use the debt ratio, debt to EBITDA and coverage instead.' },
    { title: '“High interest coverage means the debt is safe.”', html: 'Coverage ignores principal. Lantern covers its 2027 interest 11.39 times but must repay $51,091 of principal in 2028, and its lease payments as well. Look at the repayment schedule and the cash flow that will meet it.' },
  ],

  application: [
    { p: '<b>Coastline’s credit review, continued.</b> The credit officer records Lantern’s leverage both ways and writes one sentence on each. Excluding leases, Lantern is moderately geared (debt to equity 1.04, net debt 1.12 times EBITDA) and covers its interest more than eleven times. Including leases, it is heavily geared (3.80, and 2.51 times lease-adjusted EBITDA) with coverage of about three times. She notes that most of the interest-bearing debt is short-term (the line of credit, the Coastline note and the brewer plan’s 2028 payments) and that the business will need to refinance part of it in 2028, which links solvency back to the liquidity review.' },
    { p: '<b>Ana’s capital structure.</b> Ana has financed growth almost entirely with borrowing and leases: no new shares in 2027, and a dividend of $2,000. That kept her ownership at 100% but left equity thin. Hollis Avery’s planned investment in 2028 would lower every leverage ratio at once; the question for Ana is the price of that equity against the interest and the covenants of more debt. F05 develops the trade-off; this lesson gives her the measures to see it.' },
    { p: '<b>Reading a large company.</b> An analyst reviewing Starbucks for a bond fund ignores its debt to equity, which is meaningless, and its return on equity, which is too. She looks at coverage (9.62 times), net debt to EBITDA (1.72, before leases) and the size of the lease liabilities, $10,234.7 million, about two-thirds as large as the company’s financial debt. Then she reads the notes for the maturity of both, because a company that pays out more than it earns relies on refinancing each maturity as it falls due.' },
  ],

  summary: [
    'Solvency is the ability to meet all obligations over the long run; leverage is financing with borrowed money, which magnifies both gains and losses.',
    'Leverage ratios (debt ratio, liabilities to equity, debt to equity, debt to capital, equity multiplier) compare balances and convert into one another: equity multiplier = 1 + liabilities ÷ equity.',
    'Coverage ratios compare flows: EBIT or EBITDA against interest expense; net debt to EBITDA gives the years of earnings the debt represents. Annualise part-year EBITDA when dividing a balance by it.',
    'Lantern 2026 → 2027: debt ratio 54.8% → 80.8%; debt to equity 0.71 → 1.04; interest coverage 31.43 → 11.39; net debt −$12,940 → $58,719 (1.12 times EBITDA).',
    'Vendor finance, such as Lantern’s brewer plan at an implied 4.73%, is interest-bearing debt and belongs with the bank loans.',
    'Operating lease liabilities are on the balance sheet under ASC 842; counting them as debt is a judgement that must be applied consistently: add the lease cost back to EBITDA and its interest to interest expense. Lantern: debt to equity 3.80, coverage 3.14, net debt to EBITDA 2.51.',
    'With negative equity (Starbucks: a deficit of $7,441.6 million), debt to equity and ROE are meaningless; use the debt ratio, debt to EBITDA and coverage.',
  ],

  glossary: [
    { term: 'Debt ratio', def: 'Total liabilities divided by total assets: the share of the assets financed by what the business owes rather than by its owners.' },
    { term: 'Equity multiplier', def: 'Total assets divided by shareholders’ equity: the dollars of assets controlled for each dollar of equity. It equals 1 plus liabilities to equity.' },
    { term: 'Debt-to-capital ratio', def: 'Interest-bearing debt divided by the sum of interest-bearing debt and equity: the share of the long-term funding provided by lenders.' },
    { term: 'Interest coverage ratio', def: 'Earnings before interest and taxes divided by interest expense: how many times the period’s earnings cover its interest. Also called times interest earned.' },
    { term: 'Vendor financing', def: 'Credit given by the seller of an asset, such as an instalment plan for equipment, so that the buyer pays over time; it is a loan from the seller and is counted as debt.' },
    { term: 'Right-of-use asset', def: 'A lessee’s right to use a leased asset for the lease term, recognised as an asset at the start of the lease, usually at the amount of the lease liability.' },
    { term: 'Lease liability', def: 'A lessee’s obligation to make the lease payments, measured at their present value at a discount rate such as the lessee’s incremental borrowing rate, and reduced as payments are made.' },
    { term: 'Shareholders’ deficit', def: 'Negative shareholders’ equity: total liabilities exceed total assets, usually because of accumulated losses or because distributions to owners have exceeded earnings.' },
  ],

  references: [
    { text: 'Dahlquist, J. &amp; Knight, R. (2022). <i>Principles of Finance</i>, section 6.4, “Solvency Ratios”. OpenStax.', url: 'https://openstax.org/books/principles-finance/pages/6-4-solvency-ratios', checked: '2026-10-26' },
    { text: 'Deloitte. <i>Roadmap: Leases</i>, section 1.2, “Overview” (ASU 2016-02, ASC 842, effective dates). DART.', url: 'https://dart.deloitte.com/USDART/home/codification/broad-transactions/asc842-10/roadmap-leasing/chapter-1-overview/1-2-overview', checked: '2026-10-26' },
    { text: 'IFRS Foundation. <i>IFRS 16 Leases</i> (standard summary page).', url: 'https://www.ifrs.org/issued-standards/list-of-standards/ifrs-16-leases/', checked: '2026-10-26' },
    { text: 'Starbucks Corporation (2024). Form 10-K for the fiscal year ended 29 September 2024: consolidated balance sheets (SEC EDGAR financial report R7).', url: 'https://www.sec.gov/Archives/edgar/data/829224/000082922424000057/R7.htm', checked: '2026-10-26' },
    { text: 'Starbucks Corporation (2024). Form 10-K for the fiscal year ended 29 September 2024: consolidated statements of earnings (SEC EDGAR financial report R3).', url: 'https://www.sec.gov/Archives/edgar/data/829224/000082922424000057/R3.htm', checked: '2026-10-26' },
    { text: 'Starbucks Corporation (2024). Form 10-K for the fiscal year ended 29 September 2024: consolidated statements of cash flows (SEC EDGAR financial report R5).', url: 'https://www.sec.gov/Archives/edgar/data/829224/000082922424000057/R5.htm', checked: '2026-10-26' },
  ],

  checks: [
    // case facts in the prose
    { what: 'Equity 2026', value: P26.equity, shown: 42387 },
    { what: 'Equity 2027', value: P27.equity, shown: 62818 },
    { what: 'Debt 2026', value: P26.debt, shown: 30000 },
    { what: 'Debt 2027', value: P27.debt, shown: 65250 },
    { what: 'Lease liabilities 2027', value: P27.leaseLiabilities, shown: 173379 },
    { what: 'Lease liabilities at the start', value: LEASE.initial, shown: 202255 },
    { what: 'Lease rate', value: LEASE.rate * 100, shown: 7.2 },
    { what: 'Total assets 2026', value: P26.totalAssets, shown: 93676 },
    { what: 'Total assets 2027', value: P27.totalAssets, shown: 327883 },
    { what: 'Total liabilities 2026', value: P26.totalLiabilities, shown: 51289 },
    { what: 'Total liabilities 2027', value: P27.totalLiabilities, shown: 265065 },
    { what: 'Liabilities more than fivefold', value: P27.totalLiabilities / P26.totalLiabilities > 5 ? 1 : 0, shown: 1 },
    { what: 'Leases almost two-thirds of liabilities', value: P27.leaseLiabilities / P27.totalLiabilities, shown: 0.654, tol: 0.0005 },
    { what: 'Debt ratio 2026', value: S26.debtRatio * 100, shown: 54.8, tol: 0.05 },
    { what: 'Debt ratio 2027', value: S27.debtRatio * 100, shown: 80.8, tol: 0.05 },
    { what: 'Liabilities to equity 2026', value: S26.liabilitiesToEquity, shown: 1.21 },
    { what: 'Liabilities to equity 2027', value: S27.liabilitiesToEquity, shown: 4.22 },
    { what: 'Debt to equity 2026', value: S26.debtToEquity, shown: 0.71 },
    { what: 'Debt to equity 2027', value: S27.debtToEquity, shown: 1.04 },
    { what: 'Debt to capital 2026', value: S26.debtToCapital * 100, shown: 41.4, tol: 0.05 },
    { what: 'Debt to capital 2027', value: S27.debtToCapital * 100, shown: 50.9, tol: 0.05 },
    { what: 'Equity multiplier 2026', value: S26.equityMultiplier, shown: 2.21 },
    { what: 'Equity multiplier 2027', value: S27.equityMultiplier, shown: 5.22 },
    { what: 'Identity: 1/(1 − debt ratio)', value: 1 / (1 - S27.debtRatio), shown: 5.22 },
    { what: 'Interest coverage 2026', value: S26.interestCoverage, shown: 31.43 },
    { what: 'Interest coverage 2027', value: S27.interestCoverage, shown: 11.39 },
    { what: 'EBITDA coverage 2026', value: S26.ebitdaCoverage, shown: 35.43 },
    { what: 'EBITDA coverage 2027', value: S27.ebitdaCoverage, shown: 18.27 },
    { what: 'EBIT 2026', value: P26.ebit, shown: 37716 },
    { what: 'EBIT 2027', value: P27.ebit, shown: 32787 },
    { what: 'Interest 2026', value: P26.interestExpense, shown: 1200 },
    { what: 'Interest 2027', value: P27.interestExpense, shown: 2879 },
    { what: 'Net debt 2026', value: S26.netDebt, shown: -12940 },
    { what: 'Net debt 2027', value: S27.netDebt, shown: 58719 },
    { what: 'Net debt / EBITDA 2026 (ten months)', value: S26.netDebtToEbitda, shown: -0.30 },
    { what: 'Net debt / EBITDA 2027', value: S27.netDebtToEbitda, shown: 1.12 },
    { what: 'EBITDA 2026', value: ebitda26, shown: 42516 },
    { what: 'EBITDA 2026 annualised', value: ebitda26a, shown: 51019, tol: 0.5 },
    { what: 'Net debt / EBITDA 2026 annualised', value: S26.netDebt / ebitda26a, shown: -0.25 },
    { what: 'EBITDA 2027', value: ebitda27, shown: 52587 },
    { what: 'Depreciation 2027', value: P27.da, shown: 19800 },
    { what: 'Cash 2027', value: P27.cash, shown: 6531 },
    { what: 'Ana salary', value: FACTS.wages.ana, shown: 48000 },
    { what: 'Salary larger than EBIT', value: FACTS.wages.ana > P27.ebit ? 1 : 0, shown: 1 },
    { what: 'Net income 2027', value: P27.netIncome, shown: 22431 },
    { what: 'Dividend 2027', value: P27.dividends, shown: 2000 },
    // composition of liabilities and debt
    { what: 'Operating liabilities 2027', value: opLiab27, shown: 26436 },
    { what: 'Debt share', value: P27.debt / P27.totalLiabilities * 100, shown: 24.6, tol: 0.05 },
    { what: 'Lease share', value: P27.leaseLiabilities / P27.totalLiabilities * 100, shown: 65.4, tol: 0.05 },
    { what: 'Operating share', value: opLiab27 / P27.totalLiabilities * 100, shown: 10.0, tol: 0.05 },
    { what: 'Van note owed', value: van27, shown: 15000 },
    { what: 'Van note due 2028', value: 5000, shown: 5000 },
    { what: 'Brewer owed', value: BREWER.end2027, shown: 16250 },
    { what: 'Brewer due 2028', value: BREWER.current2027, shown: 12091 },
    { what: 'Brewer rate (annual)', value: BREWER.apr * 100, shown: 4.73, tol: 0.005 },
    { what: 'Brewer monthly rate', value: BREWER.monthlyRate * 100, shown: 0.394, tol: 0.0005 },
    { what: 'Brewer plan total', value: FACTS.brewer.instalment * FACTS.brewer.payments, shown: 25200 },
    { what: 'Brewer interest in the plan', value: FACTS.brewer.instalment * FACTS.brewer.payments - FACTS.brewer.price, shown: 1200 },
    { what: 'Line of credit', value: b27('Line of Credit'), shown: 24000 },
    { what: 'Debt table total', value: 10000 + van27 + BREWER.end2027 + b27('Line of Credit'), shown: 65250 },
    { what: 'Debt due 2028', value: 10000 + 5000 + BREWER.current2027 + b27('Line of Credit'), shown: 51091 },
    { what: 'Interest: Coastline', value: INT.coastline, shown: 600 },
    { what: 'Interest: van', value: INT.van, shown: 1025 },
    { what: 'Interest: brewer', value: INT.brewer, shown: 714 },
    { what: 'Interest: line of credit', value: INT.loc, shown: 540 },
    { what: 'Interest total', value: INT.coastline + INT.van + INT.brewer + INT.loc, shown: 2879 },
    // leases
    { what: 'Lease cost', value: LEASE.cost2027, shown: 40000 },
    { what: 'Lease interest', value: leaseInt, shown: 11124 },
    { what: 'Lease amortisation', value: leaseAmort, shown: 28876 },
    { what: 'Lease-adjusted debt', value: S27L.debt, shown: 238629 },
    { what: 'Lease-adjusted EBIT', value: ADJ.ebit, shown: 43911 },
    { what: 'Lease-adjusted interest', value: ADJ.interestExpense, shown: 14003 },
    { what: 'Lease-adjusted EBITDA', value: ebitdaAdj, shown: 92587 },
    { what: 'Lease-adjusted EBITDA by parts', value: SA.ebit + P27.da + leaseAmort, shown: 92587 },
    { what: 'Lease-adjusted EBITDA = EBITDA + lease cost', value: ebitda27 + LEASE.cost2027, shown: 92587 },
    { what: 'Lease-adjusted D/E', value: SA.debtToEquity, shown: 3.80 },
    { what: 'Lease-adjusted D/C', value: SA.debtToCapital * 100, shown: 79.2, tol: 0.05 },
    { what: 'Lease-adjusted coverage', value: SA.interestCoverage, shown: 3.14 },
    { what: 'Lease-adjusted net debt', value: SA.netDebt, shown: 232098 },
    { what: 'Lease-adjusted ND/EBITDA', value: SA.netDebtToEbitda, shown: 2.51 },
    { what: 'Mixed ND/EBITDA', value: S27L.netDebtToEbitda, shown: 4.41 },
    { what: 'Nearly a third to lenders and landlords', value: ADJ.interestExpense / ADJ.ebit, shown: 0.32, tol: 0.005 },
    // Starbucks
    { what: 'Starbucks debt', value: SB.debt, shown: 15568.4, tol: 0.05 },
    { what: 'Starbucks leases', value: SB.leases, shown: 10234.7, tol: 0.05 },
    { what: 'Starbucks equity = assets − liabilities', value: SB.ta - SB.tl, shown: -7441.6, tol: 0.05 },
    { what: 'Starbucks debt ratio', value: SBR.debtRatio * 100, shown: 123.7, tol: 0.05 },
    { what: 'Starbucks D/E', value: SBR.debtToEquity, shown: -2.09 },
    { what: 'Starbucks coverage', value: SBR.interestCoverage, shown: 9.62 },
    { what: 'Starbucks cash + STI', value: SB.cash + SB.sti, shown: 3543.2, tol: 0.05 },
    { what: 'Starbucks EBITDA', value: SB.opInc + SB.daCF, shown: 7001.2, tol: 0.05 },
    { what: 'Starbucks ND/EBITDA', value: SBR.netDebtToEbitda, shown: 1.72 },
    { what: 'Starbucks leases about two-thirds of debt', value: SB.leases / SB.debt, shown: 0.66, tol: 0.01 },
    { what: 'Starbucks dividends FY22–24', value: SBpay.div, shown: 7280.1, tol: 0.05 },
    { what: 'Starbucks buybacks FY22–24', value: SBpay.buy, shown: 6264.1, tol: 0.05 },
    { what: 'Starbucks payouts FY22–24', value: SBpay.div + SBpay.buy, shown: 13544.2, tol: 0.05 },
    { what: 'Starbucks net earnings FY22–24', value: SBpay.ni, shown: 11167.0, tol: 0.05 },
    // Harbourline
    { what: 'Harbourline debt ratio', value: HBR.debtRatio * 100, shown: 54.5, tol: 0.05 },
    { what: 'Harbourline D/E', value: HBR.debtToEquity, shown: 0.70 },
    { what: 'Harbourline coverage', value: HBR.interestCoverage, shown: 5.55 },
    { what: 'Harbourline ND/EBITDA', value: HBR.netDebtToEbitda, shown: 1.77 },
    // Tidewater
    { what: 'Max net debt without leases', value: MAX * ebitda27, shown: 157761 },
    { what: 'Headroom without leases', value: head.plain, shown: 99042 },
    { what: 'Pro forma without leases', value: pro.plain, shown: 2.26 },
    { what: 'Max net debt with leases', value: MAX * ebitdaAdj, shown: 277761 },
    { what: 'Headroom with leases', value: head.leases, shown: 45663 },
    { what: 'Pro forma net debt with leases', value: SA.netDebt + LOAN, shown: 292098 },
    { what: 'Pro forma with leases', value: pro.leases, shown: 3.15 },
    { what: 'Pro forma mixed', value: pro.mixed, shown: 5.55 },
    { what: 'Loan about $14,000 too large', value: LOAN - head.leases, shown: 14000, tol: 400 },
    // mistakes
    { what: 'EBITDA after interest and tax 2027', value: ebitda27 - P27.interestExpense - P27.tax, shown: 42231 },
    { what: 'Coverage on net income', value: P27.netIncome / P27.interestExpense, shown: 7.79 },
  ],
};
