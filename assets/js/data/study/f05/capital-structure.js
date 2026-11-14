// capital-structure.js — F05 · Capital structure. Content only; exercises are in capital-structure.ex.js.
// Brookvale Bakeries (the running example), Winterbourne Ferries (the applied example) and every figure about them are
// fictional. Lantern appears only for general points about its past financing (F03’s 2027 accounts and module 3’s 20%
// target); the 2028 financing is the course project’s and is not used here. Modigliani–Miller numbers come from
// core/corpfin.js (mm); survey figures from Graham & Harvey (2002) and Myers (1984), both opened on 2026-11-05.
import { TARGET_DV, TAX, DERIVED, DEBT } from './case.js?v=31';
import { PERIODS } from '../f03/case.js?v=31';
import * as CF from '../../../core/corpfin.js?v=31';

const P27 = PERIODS[2027];
// ---------------------------------------------------------------- Brookvale Bakeries (fictional), no taxes
const B = { shares: 100_000, price: 20, ebit: [120_000, 240_000, 360_000], debt: 800_000, rD: 0.08 };
B.V = B.shares * B.price;                                   // 2,000,000
B.rU = B.ebit[1] / B.V;                                     // 12%
B.bought = B.debt / B.price;                                // 40,000
B.left = B.shares - B.bought;                               // 60,000
B.E = B.left * B.price;                                     // 1,200,000
B.int = B.debt * B.rD;                                      // 64,000
const epsU = B.ebit.map((e) => e / B.shares);
const epsL = B.ebit.map((e) => (e - B.int) / B.left);
const roeU = B.ebit.map((e) => e / B.V);
const roeL = B.ebit.map((e) => (e - B.int) / B.E);
const beEbit = B.int * B.shares / (B.shares - B.left);       // EBIT at which EPS is equal: 160,000
const mm0 = CF.mm({ Vu: B.V, D: B.debt, rU: B.rU, rD: B.rD, tax: 0 });
// homemade leverage: $12,000 for 1% of the levered equity, or 1% of the unlevered firm with $8,000 borrowed
const home = { stake: 0.01, own: 0.01 * B.E, borrow: 0.01 * B.debt };
const payLev = B.ebit.map((e) => home.stake * (e - B.int));
const payHome = B.ebit.map((e) => home.stake * e - home.borrow * B.rD);
// ---------------------------------------------------------------- with corporate tax at 25%
const T = TAX;
const BT = { D: 400_000 };
BT.Vu = B.ebit[1] * (1 - T) / B.rU;                         // 1,500,000
BT.priceU = BT.Vu / B.shares;                               // 15
const mmT = CF.mm({ Vu: BT.Vu, D: BT.D, rU: B.rU, rD: B.rD, tax: T });
BT.price = mmT.VL / B.shares;                               // 16
BT.bought = BT.D / BT.price;                                // 25,000
BT.left = B.shares - BT.bought;                             // 75,000
BT.shield = T * B.rD * BT.D;                                // 8,000 a year
BT.equityCF = (B.ebit[1] - B.rD * BT.D) * (1 - T);          // 156,000
BT.govU = B.ebit[1] * T;                                    // 60,000
BT.govL = (B.ebit[1] - B.rD * BT.D) * T;                    // 52,000
// ---------------------------------------------------------------- trade-off (stylised): PV(distress) = s × D² ÷ V_U
const sev = 0.5, dist = (D) => sev * D * D / BT.Vu, valueAt = (D) => BT.Vu + T * D - dist(D);
const grid = [0, 300_000, 600_000, 900_000, 1_200_000];
const dStar = T * BT.Vu / (2 * sev);                        // 375,000
// ---------------------------------------------------------------- Winterbourne Ferries (fictional), applied example
const W = { ebit: 9_000_000, down: 4_500_000, debt: 20_000_000, rD: 0.06, newRate: 0.07, extra: 20_000_000, cov: 3.0 };
W.int = W.debt * W.rD;                                      // 1.2m
W.intNew = W.int + W.extra * W.newRate;                     // 2.6m
W.maxInt = W.down / W.cov;                                  // 1.5m
W.maxExtra = (W.maxInt - W.int) / W.newRate;                // 4.29m
const fmt = (v) => Math.round(v).toLocaleString('en-US');

export default {
  slug: 'capital-structure',
  title: 'Capital structure',
  blurb: 'Does borrowing make a business more valuable? Work through Modigliani and Miller’s answer without and with taxes, then the costs of financial distress, the trade-off and pecking-order theories, agency costs and covenants, and what finance directors say they actually do.',
  status: 'draft',
  objectives: [
    'Compare debt and equity as claims on a business: priority, control, taxes, covenants and flexibility.',
    'Calculate how financial leverage changes earnings per share and return on equity, and find the EBIT at which two financing plans give the same EPS.',
    'Apply Modigliani and Miller’s propositions without taxes, and explain the homemade-leverage argument behind them.',
    'Calculate the present value of the interest tax shield, the levered firm’s value <m>V_L = V_U + T D</m>, and the cost of equity with corporate tax.',
    'Explain the costs of financial distress, the trade-off and pecking-order theories, and the agency costs of debt and equity, and evaluate them against survey evidence.',
  ],
  prerequisites: [
    { lesson: 'f05/weighted-average-cost-of-capital', why: 'The cost of equity, the after-tax cost of debt and the WACC are the rates whose behaviour this lesson explains.' },
    { lesson: 'f03/solvency-and-leverage', why: 'Leverage and coverage ratios, and Lantern’s 2027 debt, are measured there.' },
    { lesson: 'f00/governance-and-agency', why: 'Agency costs, risk shifting and covenants are introduced there; this lesson adds what they mean for how much to borrow.' },
    { lesson: 'f04/perpetuities-and-growth', why: 'A permanent tax saving is valued as a perpetuity.' },
  ],
  case: 'lantern',

  concept: [
    { case: String.raw`Ana has financed Lantern in three ways so far: her own $20,000 of shares, profit kept in the business, and borrowing (Coastline Bank’s loans, the line of credit, the brewer’s instalment plan and, if you count them, the cafés’ leases). At the end of 2027 its interest-bearing debt was $${fmt(P27.debt)} against equity of $${fmt(P27.equity)}, a debt-to-equity ratio of ${(P27.debt / P27.equity).toFixed(2)}. In module 3 she assumed a long-run debt share of ${TARGET_DV * 100}% of Lantern’s value to work out a cost of capital. Where should a target like that come from? Is debt cheap money, as it looks, or does borrowing only move risk around?` },
    { p: 'A firm’s <g>capital structure</g> is the mix of debt and equity it uses to finance its assets. The question of this lesson is whether that mix changes how much the business is worth. The assets, the coffee, the cafés and the customers, produce the cash. Debt and equity are two ways of dividing that cash among the people who provided the money. Finance theory’s first answer is that the division should not matter; its later answers say why, in practice, it does.' },

    { h: 'Debt and equity are different claims' },
    { table: {
      caption: 'Debt and equity compared',
      head: ['', 'Debt', 'Equity'],
      align: ['l', 'l', 'l'],
      rows: [
        ['What the investor is owed', 'Fixed interest and principal on set dates', 'Whatever is left after everyone else is paid: the residual'],
        ['In default or liquidation', 'Paid first, up to what is owed', 'Paid last, often nothing'],
        ['Control', 'No votes, but covenants restrict what the firm may do', 'Votes for the board; the owners decide'],
        ['Tax (US corporations, and most systems)', 'Interest is deductible, so it reduces taxable profit', 'Dividends are paid from after-tax profit'],
        ['Term', 'Matures and must be repaid or refinanced', 'Permanent'],
        ['Cost to the firm', 'Lower required return, because it is safer', 'Higher required return, because it bears the risk'],
      ],
    } },
    { p: String.raw`Because lenders are paid first, debt is safer than equity and its required return is lower: in module 3 a lender would charge Lantern ${(DEBT.termLoan.rate * 100).toFixed(1)}% while its owners need about ${(DERIVED.targetCostOfEquity * 100).toFixed(1)}%. That makes debt look cheap. The central lesson of capital-structure theory is that the look is misleading: every dollar of debt makes the remaining equity riskier, and the owners’ required return, the <g>cost of equity</g>, rises to match.` },

    { h: 'Leverage magnifies earnings per share' },
    { p: '<b>Brookvale Bakeries</b>, a fictional listed chain, has no debt. Its 100,000 shares trade at $20, so the firm is worth $2,000,000. Its earnings before interest and taxes (EBIT) depend on the economy: $120,000 in a recession, $240,000 in a normal year, $360,000 in a boom, each equally likely, and the same pattern is expected for ever, so expected EBIT is $240,000 a year. Ignore taxes for now. The board is considering a recapitalisation: borrow $800,000 at 8% for good and use it to buy back 40,000 shares at $20. The assets and the EBIT are unchanged; only the financing differs.' },
    { table: {
      caption: 'Brookvale Bakeries (fictional): two capital structures, no taxes',
      head: ['', 'Recession', 'Normal', 'Boom'],
      align: ['l', 'r', 'r', 'r'],
      rows: [
        ['EBIT ($)', fmt(B.ebit[0]), fmt(B.ebit[1]), fmt(B.ebit[2])],
        ['All equity: EPS (100,000 shares)', `$${epsU[0].toFixed(2)}`, `$${epsU[1].toFixed(2)}`, `$${epsU[2].toFixed(2)}`],
        ['All equity: return on equity', `${(roeU[0] * 100).toFixed(1)}%`, `${(roeU[1] * 100).toFixed(1)}%`, `${(roeU[2] * 100).toFixed(1)}%`],
        ['Interest on $800,000 at 8% ($)', fmt(B.int), fmt(B.int), fmt(B.int)],
        ['Levered: net income ($)', fmt(B.ebit[0] - B.int), fmt(B.ebit[1] - B.int), fmt(B.ebit[2] - B.int)],
        ['Levered: EPS (60,000 shares)', `$${epsL[0].toFixed(2)}`, `$${epsL[1].toFixed(2)}`, `$${epsL[2].toFixed(2)}`],
        ['Levered: return on equity ($1,200,000)', `${(roeL[0] * 100).toFixed(1)}%`, `${(roeL[1] * 100).toFixed(1)}%`, `${(roeL[2] * 100).toFixed(1)}%`],
      ],
      note: 'Return on equity here is net income ÷ the market value of the equity, so that it can be compared with investors’ required returns.',
    } },
    { p: String.raw`In a normal year leverage raises <g>earnings per share</g> (EPS) from $${epsU[1].toFixed(2)} to $${epsL[1].toFixed(2)} and the return on equity from ${(roeU[1] * 100).toFixed(1)}% to ${(roeL[1] * 100).toFixed(1)}%. In a recession it lowers them, to $${epsL[0].toFixed(2)} and ${(roeL[0] * 100).toFixed(1)}%. The range of EPS between recession and boom widens from $${(epsU[2] - epsU[0]).toFixed(2)} to $${(epsL[2] - epsL[0]).toFixed(2)}. The two plans give the same EPS when EBIT is $${fmt(beEbit)}: the level at which the assets earn ${(beEbit / B.V * 100).toFixed(0)}% on their $2,000,000 value, exactly the interest rate. Above it, borrowed money earns more than it costs and the shareholders keep the difference; below it they make up the shortfall. This is the <g>leverage</g> F03 measured with ratios, seen from the shareholders’ side.` },
    { callout: 'key', title: 'Higher expected EPS is not higher value', html: 'Leverage raised Brookvale’s expected EPS and also its risk. Whether the shares are worth more depends on whether the extra expected return is more than enough to pay for the extra risk. Modigliani and Miller showed that, in a market without taxes or other frictions, it is exactly enough and no more.' },
  ],

  theory: [
    { h: 'Modigliani and Miller without taxes' },
    { p: 'Franco Modigliani and Merton Miller, who both later received the Nobel prize in economics, asked (in what are now called the <g>Modigliani–Miller propositions</g>) what capital structure does to value in a perfect capital market: no taxes, no costs of bankruptcy or of issuing securities, investors and firms borrowing at the same rate, everyone with the same information, and the firm’s investment decisions fixed. Their answer comes in two propositions.' },
    { p: '<b>Proposition I.</b> The value of a firm does not depend on its capital structure: <m>V_L = V_U</m>, where <m>V_L</m> is the value of the firm with debt (levered) and <m>V_U</m> its value without (unlevered). The value comes from the assets’ cash flows and their risk; dividing the cash flows between lenders and shareholders does not change their total.' },
    { p: String.raw`The argument is that investors can borrow on their own account, which is called <g>homemade leverage</g>. Suppose levered Brookvale’s equity is fairly priced at $${fmt(B.E)}. An investor with $${fmt(home.own)} can buy 1% of it (600 shares) and receive 1% of EBIT minus the interest, or she can buy 1% of the unlevered Brookvale (1,000 shares, $20,000) with her $${fmt(home.own)} and $${fmt(home.borrow)} borrowed at 8%:` },
    { table: {
      caption: 'Homemade leverage: two ways to hold 1% of a levered Brookvale (fictional)',
      head: ['Payoff ($)', 'Recession', 'Normal', 'Boom'],
      align: ['l', 'r', 'r', 'r'],
      rows: [
        ['1% of the levered firm’s equity: 1% × (EBIT − 64,000)', fmt(payLev[0]), fmt(payLev[1]), fmt(payLev[2])],
        ['1% of the unlevered firm (1% × EBIT) less 8% on $8,000', fmt(payHome[0]), fmt(payHome[1]), fmt(payHome[2])],
      ],
      note: 'Both cost the investor $12,000 of her own money.',
    } },
    { p: 'The payoffs are identical in every state of the economy, so the two positions must cost the same. If levered shares sold for more, investors would make their own leverage with unlevered shares instead and nobody would pay the premium; if they sold for less, investors would buy them and “unlever” by lending. Any capital structure a firm can choose, an investor can copy or undo at no cost, so a firm cannot create value by choosing one.' },
    { p: String.raw`<b>Proposition II.</b> The cost of equity rises with leverage. Let <m>r_U</m> be the return investors require on the assets (the cost of capital of the unlevered firm), <m>r_D</m> the cost of debt and <m>D/E</m> the debt-to-equity ratio at market values. Then <m>r_E = r_U + (r_U - r_D)\,D/E</m>. For Brookvale, <m>r_U = 240{,}000 \div 2{,}000{,}000 = 12\%</m>, and after the recapitalisation <m>D/E = 800{,}000 \div 1{,}200{,}000 = 0.667</m>, so <m>r_E = 12\% + (12\% - 8\%) \times 0.667 = ${(mm0.rE * 100).toFixed(2)}\%</m>, the expected return on equity in the table. The weighted average cost of capital (WACC) is unchanged: <m>0.6 \times ${(mm0.rE * 100).toFixed(2)}\% + 0.4 \times 8\% = ${(mm0.wacc * 100).toFixed(0)}\%</m>. Cheap debt is offset, exactly, by dearer equity.` },
    { figure: {
      svg: `<svg viewBox="0 0 440 300" xmlns="http://www.w3.org/2000/svg" font-size="16" fill="currentColor">
  <line x1="60" y1="250" x2="420" y2="250" stroke="var(--rule-strong)" stroke-width="1.5"/>
  <line x1="60" y1="250" x2="60" y2="30" stroke="var(--rule-strong)" stroke-width="1.5"/>
  <text x="240" y="285" text-anchor="middle">Debt to equity, D/E</text>
  <text x="18" y="140" text-anchor="middle" transform="rotate(-90 18 140)">Required return</text>
  <line x1="60" y1="130" x2="400" y2="50" stroke="var(--series-1)" stroke-width="3"/>
  <line x1="60" y1="130" x2="400" y2="130" stroke="var(--series-3)" stroke-width="3" stroke-dasharray="8 5"/>
  <line x1="60" y1="190" x2="400" y2="190" stroke="var(--series-2)" stroke-width="3"/>
  <text x="54" y="135" text-anchor="end">r<tspan dy="4" font-size="14">U</tspan></text>
  <text x="54" y="195" text-anchor="end">r<tspan dy="4" font-size="14">D</tspan></text>
  <text x="300" y="60" text-anchor="middle">r<tspan dy="4" font-size="14">E</tspan></text>
  <text x="300" y="118" text-anchor="middle">WACC</text>
  <text x="300" y="214" text-anchor="middle">r<tspan dy="4" font-size="14">D</tspan></text>
</svg>`,
      caption: 'Proposition II without taxes: the cost of equity rises in a straight line with D/E, the cost of debt stays put (while debt is safe), and the WACC stays at <m>r_U</m>.',
      alt: 'A chart with debt to equity on the horizontal axis and required return on the vertical axis. A horizontal line near the bottom is the cost of debt. A dashed horizontal line higher up, starting at the unlevered cost of capital, is the WACC. A line for the cost of equity starts at the unlevered cost of capital when debt to equity is zero and rises steadily to the right, above the WACC line.',
    } },
    { p: 'Proposition II is why “debt is cheaper” is not an argument for borrowing. The owners of levered Brookvale are not wrong to want 14.67% rather than 12%: their shares now carry all of the assets’ risk on a smaller base of equity. Module 3’s relevered beta says the same thing in CAPM’s language.' },
    { callout: 'note', title: 'Why a theory that “doesn’t hold” matters', html: 'No real market is perfect, so no one believes Proposition I literally. Its value is as a checklist: if capital structure does change value, it must be through something the propositions assume away, such as taxes, the costs of financial distress, information that managers have and investors don’t, or the incentives debt creates. The rest of the lesson takes those in turn.' },

    { h: 'Adding corporate tax: the interest tax shield' },
    { p: String.raw`Interest is deductible from taxable profit; dividends are not. Every dollar of interest therefore saves the firm <m>T</m> dollars of tax, where <m>T</m> is the corporate tax rate. The saving is the <g>interest tax shield</g>, <m>T \times r_D \times D</m> a year. If the debt is permanent and as risky as the interest payments, the shields are a perpetuity discounted at <m>r_D</m>, and their present value is <m>T r_D D \div r_D = T \times D</m>. Proposition I becomes <m>V_L = V_U + T \times D</m>. (OpenStax states the annual shield, tax rate × interest; the perpetuity step that turns it into <m>T \times D</m> is the standard textbook derivation shown here.)` },
    { p: String.raw`Put the 25% tax back into Brookvale. The unlevered firm now earns <m>240{,}000 \times 0.75 = 180{,}000</m> after tax in a normal year and is worth <m>180{,}000 \div 0.12 = ${fmt(BT.Vu)}</m>, or $${BT.priceU.toFixed(2)} a share; the government’s claim of $${fmt(BT.govU)} a year has taken a quarter of the value. Suppose Brookvale borrows $${fmt(BT.D)} for good at 8% and buys back shares. Its interest of $32,000 saves <m>0.25 \times 32{,}000 = ${fmt(BT.shield)}</m> of tax a year, worth <m>${fmt(BT.shield)} \div 0.08 = ${fmt(mmT.taxShieldPV)}</m>. The firm is worth <m>${fmt(BT.Vu)} + ${fmt(mmT.taxShieldPV)} = ${fmt(mmT.VL)}</m>.` },
    { p: String.raw`The gain goes to the shareholders when the plan is announced: the share price rises to <m>${fmt(mmT.VL)} \div 100{,}000 = \$${BT.price.toFixed(2)}</m>, so the $${fmt(BT.D)} buys back <m>${fmt(BT.D)} \div ${BT.price.toFixed(0)} = ${fmt(BT.bought)}</m> shares, and the remaining ${fmt(BT.left)} shares are worth $${fmt(mmT.E)}. Nothing about the bakeries changed. The government’s claim fell, from $${fmt(BT.govU)} to $${fmt(BT.govL)} a year of tax, and the shareholders gained the difference’s present value.` },
    { p: String.raw`With tax, Proposition II becomes <m>r_E = r_U + (r_U - r_D)(1 - T)\,D/E</m>. For Brookvale, <m>D/E = ${fmt(BT.D)} \div ${fmt(mmT.E)} = 0.333</m> and <m>r_E = 12\% + 4\% \times 0.75 \times 0.333 = ${(mmT.rE * 100).toFixed(0)}\%</m>; the shareholders’ $${fmt(BT.equityCF)} a year on $${fmt(mmT.E)} confirms it. The WACC, <m>0.75 \times ${(mmT.rE * 100).toFixed(0)}\% + 0.25 \times 8\% \times 0.75 = ${(mmT.wacc * 100).toFixed(2)}\%</m>, is now below 12%, and it keeps falling as debt rises. Taken alone, the tax shield says a firm should borrow almost everything.` },
    { p: 'Three cautions keep the shield in proportion. It is worth <m>T \\times D</m> only if the debt is permanent and the firm always has taxable profit to deduct the interest from; a firm with losses, or whose interest exceeds its EBIT, saves nothing on the extra interest. Many tax systems now cap the interest a company may deduct, so check the current rules before counting on it. And investors pay personal tax too: in many systems interest income is taxed more heavily than share returns, which shrinks the advantage, though in a survey of US finance directors only 4.5% said investors’ taxes were important to their debt decisions (Graham &amp; Harvey, 2002).' },

    { h: 'The costs of financial distress' },
    { p: '<g>Financial distress</g> is the condition of a firm that has trouble meeting its obligations to lenders. Its costs fall into two groups. <b>Direct costs</b> are the fees of a bankruptcy or a restructuring: lawyers, accountants, consultants, appraisers, auctioneers. <b>Indirect costs</b> are usually larger and start well before any bankruptcy: customers stop buying a product they fear will not be supported, suppliers demand cash on delivery, good staff leave, managers spend their time negotiating with banks instead of running the business, and assets are sold quickly at low prices.' },
    { p: 'Distress also changes owners’ incentives, as F00’s lesson on governance and agency showed. With the firm near default, shareholders gain from risky gambles (<g>risk shifting</g>), because the lenders bear most of a failure. They also lose interest in safe, valuable projects that would mainly rescue the lenders: if a new investment’s payoff would go largely to repaying existing debt, the shareholders who must fund it may turn it down. This is <g>debt overhang</g>, an underinvestment cost of debt. Lenders anticipate all of this and charge for it in advance, so the firm, and therefore its shareholders, bear the expected costs of distress through a higher cost of debt.' },

    { h: 'The trade-off theory' },
    { p: 'The <g>trade-off theory</g> puts the two forces together. Each extra dollar of debt adds tax shield; it also adds to the expected costs of distress, slowly at low debt and quickly as default becomes likely. The value of the firm is' },
    { math: String.raw`V_L = V_U + \text{PV(tax shields)} - \text{PV(costs of financial distress)}` },
    { p: String.raw`and the best capital structure is the debt level at which one more dollar adds as much expected distress cost as tax saving. The table uses a stylised assumption for Brookvale with tax: the present value of distress costs is <m>0.5 \times D^2 \div V_U</m>, small for a little debt and rising steeply. The widget below lets you change it.` },
    { table: {
      caption: 'Brookvale Bakeries (fictional): value against debt under a stylised trade-off, unlevered value $1,500,000, tax 25%',
      head: ['Debt ($)', 'PV of tax shields ($)', 'PV of distress costs ($)', 'Firm value ($)'],
      align: ['r', 'r', 'r', 'r'],
      rows: grid.map((D) => [fmt(D), fmt(T * D), fmt(dist(D)), fmt(valueAt(D))]),
      note: String.raw`The distress-cost assumption is invented for illustration; real distress costs cannot be read off a formula. With it, value peaks at debt of $${fmt(dStar)} (firm value $${fmt(valueAt(dStar))}, a debt share of ${(dStar / valueAt(dStar) * 100).toFixed(1)}%).`,
    } },
    { p: 'The trade-off theory predicts a target debt ratio for each firm, and predicts which firms should borrow more: those with steady, taxable profits and tangible assets that keep their value in distress (property, vehicles, utilities’ networks) can borrow more; those whose value lies in growth opportunities, brands, research or people, which melt away in distress, should borrow less. Ana’s assumed 20% for Lantern in module 3, a <g>target capital structure</g>, is a judgement of this kind. The theory leaves puzzles too. Myers (1984) judged that it explains observed debt ratios only weakly (in his words, with “an unacceptably low R²”), since debt ratios vary widely among apparently similar firms. It also cannot explain why a very profitable firm, with the most taxable profit to shield, would choose little debt, which is what the pecking order below predicts.' },

    { h: 'The pecking order' },
    { p: 'The <g>pecking order theory</g> starts from <g>asymmetric information</g>: managers know more about their firm’s prospects than outside investors do. Investors know that managers acting for existing shareholders prefer to sell new shares when the shares are overpriced, so they read an equity issue as bad news and mark the price down; Myers (1984) notes that, on average, a firm’s share price falls when it announces a share issue. Debt is less exposed to this, because its value depends less on what managers know. Myers (1984), drawing on his work with Nicholas Majluf, set out the resulting order of finance:' },
    { ol: ['Use internal funds first: retained profit and cash in hand. Dividends are set with investment needs in mind but are sticky, so internal funds rise and fall with profits.', 'If outside money is needed, issue the safest security first: debt.', 'Then hybrid securities such as convertible bonds.', 'New shares only as a last resort.'] },
    { p: 'In this view there is no target debt ratio. A firm’s leverage is the accumulated record of its need for outside money: a very profitable firm with few investment needs ends up with little debt, which is the pattern the trade-off theory struggles to explain. Myers reported that, for US non-financial companies over 1973–1982, internally generated cash covered on average 62% of capital spending, and net new share issues were never more than 6% of external financing.' },
    { p: 'Lantern’s first two years follow the order, for a small-firm reason as well as an information one: Ana kept most of her profit in the business, borrowed from her bank and a supplier, and sold no shares to anyone else, which would have meant sharing ownership and control. Many owner-managed firms finance the same way.' },

    { h: 'Agency costs: debt as discipline and as temptation' },
    { p: 'F00 described two agency relationships and their <g>agency costs</g>. Between managers and shareholders, the danger is that managers with spare cash spend it on growth for its own sake or on comforts; debt helps, because interest and repayments must be paid, leaving less spare cash and bringing in lenders who watch. Between shareholders and lenders, debt creates the risk shifting and underinvestment described above, and the temptation to pay out cash to shareholders before the lenders are paid. Debt therefore reduces one set of agency costs and creates another, and a firm’s best capital structure balances these as well as taxes and distress.' },
    { p: 'Lenders protect themselves with <g>covenants</g>. <b>Affirmative covenants</b> require things: audited accounts each year, insurance, upkeep of the assets. <b>Negative covenants</b> forbid things without the lender’s consent: more borrowing, selling major assets, paying dividends above a limit, merging. <b>Financial covenants</b> set ratios: a minimum interest coverage or current ratio, a maximum debt to EBITDA. A maintenance covenant must hold at every test date; an incurrence covenant is tested only when the firm takes an action, such as new borrowing. Breaking a covenant is a default that lets the lender demand repayment, so in practice it starts a renegotiation. Covenants make debt cheaper, because they limit the behaviour lenders would otherwise charge for, at the cost of the firm’s flexibility.' },

    { h: 'What finance directors say they do' },
    { p: 'Graham and Harvey surveyed 392 chief financial officers of US companies and published the results in 2002. On debt policy, almost 60% cited <b>financial flexibility</b> (keeping room to borrow when opportunities arise) and the firm’s credit rating as important or very important; their main aim was preserving flexibility rather than minimising their <g>weighted average cost of capital</g>. About 45% rated the tax advantage of interest as important or very important, but only 21.4% said the same of the costs of bankruptcy or distress. Of the firms, 44% had a strict or somewhat strict target debt ratio or range, 37% a flexible target and 19% none. On the pecking order the evidence was mixed: 46.8% said insufficient internal funds was an important reason to issue debt. Of CFOs who had seriously considered issuing shares, 69% named dilution of earnings per share as important, and about two-thirds said they were reluctant to issue shares they thought undervalued.' },
    { p: 'Read together, the theories are partial models rather than rivals with one winner. Taxes push towards debt; distress costs and lost flexibility push back; information problems make outside equity expensive; and agency costs cut both ways. Which force dominates depends on the firm: its taxes, the safety and tangibility of its assets, how much its managers know that investors don’t, and how much spare cash it generates.' },
  ],

  formulas: [
    { id: 'cap-eps', name: 'Earnings per share with debt',
      tex: String.raw`\text{EPS} = \dfrac{(\text{EBIT} - r_D D)(1 - T)}{N}`,
      where: [[String.raw`\text{EBIT}`, 'Earnings before interest and taxes', '$'], [String.raw`r_D D`, 'Interest: the rate on debt times the debt', '$'], [String.raw`T`, 'Corporate tax rate', ''], [String.raw`N`, 'Shares outstanding', 'shares']],
      note: 'With no debt, EPS = EBIT(1 − T) ÷ N.' },
    { id: 'cap-ebit-breakeven', name: 'EBIT at which two financing plans give the same EPS',
      tex: String.raw`\dfrac{(\text{EBIT}^* - I_1)(1 - T)}{N_1} = \dfrac{(\text{EBIT}^* - I_2)(1 - T)}{N_2}`,
      where: [[String.raw`\text{EBIT}^*`, 'The break-even (indifference) EBIT', '$'], [String.raw`I_1, I_2`, 'Interest under each plan', '$'], [String.raw`N_1, N_2`, 'Shares outstanding under each plan', 'shares'], [String.raw`T`, 'Corporate tax rate (it cancels)', '']],
      assumptions: 'The same EBIT under both plans.',
      note: 'For an all-equity plan against a levered one: EBIT* = I × N₁ ÷ (N₁ − N₂). Brookvale: 64,000 × 100,000 ÷ 40,000 = 160,000.' },
    { id: 'cap-mm1', name: 'Modigliani–Miller Proposition I',
      tex: String.raw`V_L = V_U \quad\text{(no taxes)}, \qquad V_L = V_U + T D \quad\text{(corporate tax, permanent debt)}`,
      where: [[String.raw`V_L`, 'Value of the levered firm: debt plus equity', '$'], [String.raw`V_U`, 'Value of the same firm with no debt', '$'], [String.raw`T`, 'Corporate tax rate', ''], [String.raw`D`, 'Permanent debt, at market value', '$']],
      assumptions: 'Perfect capital markets apart from corporate tax; the firm always pays tax; the debt is permanent and its tax shields as risky as the debt.' },
    { id: 'cap-mm2', name: 'Modigliani–Miller Proposition II: the cost of equity',
      tex: String.raw`r_E = r_U + (r_U - r_D)(1 - T)\dfrac{D}{E}`,
      where: [[String.raw`r_E`, 'Cost of equity of the levered firm', '%'], [String.raw`r_U`, 'Cost of capital of the unlevered firm (the assets’ required return)', '%'], [String.raw`r_D`, 'Cost of debt', '%'], [String.raw`T`, 'Corporate tax rate; set T = 0 for the case without taxes', ''], [String.raw`D/E`, 'Debt to equity at market values', '']],
      note: 'Without taxes the WACC stays at <m>r_U</m>; with tax it falls as D/E rises. Module 3’s relevered beta is the same relationship in CAPM terms.' },
    { id: 'cap-tax-shield', name: 'Interest tax shield and its present value',
      tex: String.raw`\text{Tax shield} = T \times r_D \times D \text{ a year}, \qquad \text{PV} = \dfrac{T r_D D}{r_D} = T D`,
      where: [[String.raw`T`, 'Corporate tax rate', ''], [String.raw`r_D`, 'Interest rate on the debt, also the discount rate for the shields', '%'], [String.raw`D`, 'Permanent debt', '$']],
      assumptions: 'Permanent debt and taxable profit every year. For debt repaid over time, discount each year’s shield separately.' },
    { id: 'cap-tradeoff', name: 'The trade-off theory',
      tex: String.raw`V_L = V_U + \text{PV(tax shields)} - \text{PV(costs of financial distress)}`,
      where: [[String.raw`V_U`, 'Value of the firm with no debt', '$'], [String.raw`\text{PV(tax shields)}`, 'Present value of the tax saved by deducting interest', '$'], [String.raw`\text{PV(costs of financial distress)}`, 'Present value of expected direct and indirect costs of distress, which grow with debt', '$']],
      note: 'The optimal debt level is where the last dollar of debt adds as much expected distress cost as tax saving.' },
  ],

  examples: [
    { level: 'simple', title: 'Brookvale’s EPS under two plans',
      fictional: true,
      setup: 'Brookvale Bakeries (fictional) has 100,000 shares at $20 and no debt. EBIT will be $120,000, $240,000 or $360,000. The alternative plan borrows $800,000 at 8% and buys back 40,000 shares. Ignore taxes. Find EPS in each state under both plans, and the EBIT at which the plans give the same EPS.',
      steps: [
        String.raw`All equity: EPS = EBIT ÷ 100,000 = $${epsU[0].toFixed(2)}, $${epsU[1].toFixed(2)}, $${epsU[2].toFixed(2)}.`,
        String.raw`Levered: interest <m>800{,}000 \times 0.08 = ${fmt(B.int)}</m>; shares left <m>100{,}000 - 40{,}000 = 60{,}000</m>; EPS = (EBIT − 64,000) ÷ 60,000 = $${epsL[0].toFixed(2)}, $${epsL[1].toFixed(2)}, $${epsL[2].toFixed(2)}.`,
        String.raw`Break-even: <m>\text{EBIT}^* \div 100{,}000 = (\text{EBIT}^* - 64{,}000) \div 60{,}000</m>, so <m>60{,}000\,\text{EBIT}^* = 100{,}000\,\text{EBIT}^* - 6{,}400{,}000{,}000</m> and <m>\text{EBIT}^* = ${fmt(beEbit)}</m>.`,
        String.raw`Check: at $${fmt(beEbit)} both plans give EPS of $${(beEbit / B.shares).toFixed(2)}, and the assets earn <m>${fmt(beEbit)} \div 2{,}000{,}000 = 8\%</m>, the interest rate.`,
      ],
      answer: String.raw`All equity: $${epsU[0].toFixed(2)} / $${epsU[1].toFixed(2)} / $${epsU[2].toFixed(2)}. Levered: $${epsL[0].toFixed(2)} / $${epsL[1].toFixed(2)} / $${epsL[2].toFixed(2)}. The plans tie at EBIT of $${fmt(beEbit)}.`,
      interpretation: 'Borrowing raises EPS whenever the assets earn more than the 8% the debt costs, which they do in a normal year and a boom. It also widens the swing of EPS, so the comparison of expected EPS alone says nothing about which plan shareholders should prefer.' },
    { level: 'challenging', title: 'Brookvale’s recapitalisation with tax',
      fictional: true,
      setup: 'Now Brookvale pays corporate tax at 25%. Its normal-year EBIT of $240,000 is expected for ever, investors require 12% on the unlevered firm, and it can borrow permanently at 8%. It announces that it will borrow $400,000 and use it to buy back shares. Under Modigliani and Miller with corporate tax, find the firm’s value, the share price after the announcement, the shares bought back, the cost of equity and the WACC.',
      steps: [
        String.raw`Unlevered value: <m>V_U = 240{,}000 \times (1 - 0.25) \div 0.12 = ${fmt(BT.Vu)}</m>, or $${BT.priceU.toFixed(2)} a share.`,
        String.raw`Tax shield: <m>0.25 \times 0.08 \times 400{,}000 = ${fmt(BT.shield)}</m> a year; for permanent debt its value is <m>T D = 0.25 \times 400{,}000 = ${fmt(mmT.taxShieldPV)}</m>. So <m>V_L = ${fmt(BT.Vu)} + ${fmt(mmT.taxShieldPV)} = ${fmt(mmT.VL)}</m>.`,
        String.raw`The announcement moves the value to the shares at once: price <m>${fmt(mmT.VL)} \div 100{,}000 = \$${BT.price.toFixed(2)}</m>. The buyback at that price retires <m>400{,}000 \div ${BT.price.toFixed(0)} = ${fmt(BT.bought)}</m> shares, leaving ${fmt(BT.left)} worth <m>${fmt(BT.left)} \times ${BT.price.toFixed(0)} = ${fmt(mmT.E)}</m>, which is <m>V_L - D</m>.`,
        String.raw`Cost of equity: <m>r_E = 12\% + (12\% - 8\%)(0.75)(400{,}000 \div ${fmt(mmT.E)}) = ${(mmT.rE * 100).toFixed(0)}\%</m>. Check by cash flows: <m>(240{,}000 - 32{,}000) \times 0.75 = ${fmt(BT.equityCF)}</m>, and <m>${fmt(BT.equityCF)} \div ${fmt(mmT.E)} = ${(BT.equityCF / mmT.E * 100).toFixed(0)}\%</m>.`,
        String.raw`WACC: <m>0.75 \times ${(mmT.rE * 100).toFixed(0)}\% + 0.25 \times 8\% \times 0.75 = ${(mmT.wacc * 100).toFixed(2)}\%</m>. Check: <m>180{,}000 \div 0.1125 = ${fmt(180_000 / mmT.wacc)}</m>, the levered value.`,
      ],
      answer: String.raw`V_L = $${fmt(mmT.VL)}; share price $${BT.price.toFixed(2)}; ${fmt(BT.bought)} shares bought back; r_E = ${(mmT.rE * 100).toFixed(0)}%; WACC = ${(mmT.wacc * 100).toFixed(2)}%.`,
      interpretation: 'The shareholders gain $1 a share, all of it tax the government no longer collects. Discounting the unlevered after-tax cash flow at the lower WACC gives the same levered value, which is why a WACC with after-tax debt cost already includes the tax shield. Before taking the $100,000 at face value, ask whether the debt is really permanent and whether Brookvale will always have profit to deduct the interest from.' },
    { level: 'applied', title: 'How much more can Winterbourne Ferries borrow?',
      fictional: true,
      setup: 'Winterbourne Ferries, a fictional listed operator, pays tax at 25% and has $20 million of debt at 6%. Its EBIT is $9 million in a normal year but fell to $4.5 million in its last bad year, after a fuel-price spike. A shareholder group urges it to borrow another $20 million, at 7%, and buy back shares, citing the tax saving. Its loan agreement has a maintenance covenant: EBIT must be at least 3.0 times interest. Assess the proposal.',
      steps: [
        String.raw`The tax argument: permanent extra debt of $20 million adds <m>0.25 \times 20 = 5</m> million of tax-shield value, if Winterbourne can always use the deduction.`,
        String.raw`Interest after the borrowing: <m>20 \times 0.06 + 20 \times 0.07 = 1.2 + 1.4 = ${(W.intNew / 1e6).toFixed(1)}</m> million. Coverage in a normal year: <m>9 \div ${(W.intNew / 1e6).toFixed(1)} = ${(W.ebit / W.intNew).toFixed(2)}</m>; in a bad year: <m>4.5 \div ${(W.intNew / 1e6).toFixed(1)} = ${(W.down / W.intNew).toFixed(2)}</m>, well below the 3.0 covenant. Today’s bad-year coverage is <m>4.5 \div 1.2 = ${(W.down / W.int).toFixed(2)}</m>.`,
        String.raw`Debt the covenant allows in a bad year: interest at most <m>4.5 \div 3.0 = ${(W.maxInt / 1e6).toFixed(1)}</m> million, so extra interest at most $0.3 million, or <m>0.3 \div 0.07 = ${(W.maxExtra / 1e6).toFixed(2)}</m> million of new debt, whose tax shield is worth about <m>0.25 \times ${(W.maxExtra / 1e6).toFixed(2)} = ${(T * W.maxExtra / 1e6).toFixed(2)}</m> million.`,
        'Weigh it: a breach in a bad year would hand the lenders the right to demand repayment exactly when refinancing is hardest and fuel costs are squeezing the business, inviting the indirect costs of distress (suppliers’ terms, cancelled bookings, a forced sale of a vessel). Those costs are not in the $5 million.',
      ],
      answer: String.raw`The full $20 million adds about $5 million of tax-shield value but would breach the coverage covenant in a year like the last bad one (${(W.down / W.intNew).toFixed(2)} times against 3.0). About $${(W.maxExtra / 1e6).toFixed(2)} million of extra debt keeps bad-year coverage at 3.0, with a tax shield worth about $${(T * W.maxExtra / 1e6).toFixed(2)} million.`,
      interpretation: 'This is the trade-off theory in practice: the tax gain is easy to measure, the distress cost is not, and covenants make the downside concrete. A board would also ask whether a buyback is the best use of the borrowing capacity, which preserves the financial flexibility that finance directors say they value most.' },
  ],

  demo: [
    { widget: 'cap-eps', intro: 'Brookvale’s two plans, with shares bought back at $20. Move EBIT across $160,000 and watch the lines cross. Add tax: both EPS lines fall by the same proportion, so the crossing point does not move. Raise the interest rate and the crossing moves right.' },
    { widget: 'cap-mm', intro: 'Brookvale as Modigliani and Miller see it: the assets’ beta of 0.8 gives <m>r_U = 12\\%</m> with an 8% risk-free rate and a 5% market risk premium, and debt costs the risk-free rate. With tax set to None, the WACC stays at 12% at every debt share (Proposition I) while the cost of equity climbs (Proposition II). Switch tax to 25%: the WACC falls as debt rises and the Firm value row shows <m>V_L = V_U + TD</m>. At 25% debt you should see the worked example’s 13% and 11.25%. The widget holds <m>V_U</m> at the after-tax $1,500,000 in both settings, so with tax off its firm value is $1,500,000 rather than the lesson’s no-tax $2,000,000.' },
    { widget: 'cap-tradeoff', intro: 'The stylised trade-off. Find the debt that maximises value at the defaults ($375,000), then make distress costs more severe (a business whose value would vanish in distress) or less severe (one with saleable, tangible assets) and watch the best debt level move. Set the tax rate to zero: with no tax shield, any debt only adds distress cost.' },
  ],

  mistakes: [
    { title: '“Debt is cheaper than equity, so borrowing more lowers the cost of capital.”', html: 'Debt’s required return is lower, but each dollar of debt raises the cost of equity (Proposition II). Without taxes the two effects cancel exactly; with tax the WACC falls only by the value of the tax shield, and distress costs push it back up beyond some point.' },
    { title: '“Leverage raised EPS, so it raised the share price.”', html: 'Brookvale’s expected EPS rose from $2.40 to $2.93 with no change in value: the extra expected earnings are payment for extra risk. A plan that raises EPS can lower the share price, and one that lowers EPS can raise it.' },
    { title: '“The tax shield is always worth T × D.”', html: 'T × D assumes permanent debt and a firm that can always use the deduction. Debt that is repaid in five years has five years of shields; a firm with losses or with interest above its EBIT gets no shield on the extra interest; interest-deduction caps can limit it further.' },
    { title: '“Financial distress means bankruptcy fees.”', html: 'Legal and advisory fees are the direct costs. The larger costs are indirect and start before any default: lost customers and suppliers’ credit, departing staff, fire sales, and owners who gamble or refuse good projects because the gains would go to the lenders.' },
    { title: '“One capital-structure theory is right and the others are wrong.”', html: 'Each is a model of one force: taxes, distress, information or incentives. Survey evidence supports parts of several: CFOs value flexibility and ratings, many have targets, and many also prefer internal funds and avoid issuing undervalued shares.' },
  ],

  application: [
    { p: '<b>A finance director sets a target.</b> The chief financial officer of a fictional listed food company works out how much debt her firm can carry in a bad year with its covenants and a credit rating she wants to keep, rather than how much would minimise the WACC on paper. She sets a range for net debt to EBITDA, holds the bottom of it in good years so that the firm can borrow quickly for an acquisition, and uses buybacks to stop debt falling far below the range. That is the trade-off theory with flexibility added, which is how the CFOs in Graham and Harvey’s survey describe their own policies.' },
    { p: '<b>An analyst reads a leveraged recapitalisation.</b> When a fictional retailer announces it will borrow to buy back a fifth of its shares, an analyst separates the effects. Expected EPS will rise mechanically; that is not news. The tax shield adds value if the retailer has steady taxable profit. Against that, the retailer’s value lies in its brand and its leases, which would lose value fast in distress, so the expected distress cost is high. She also asks why managers chose this moment: a buyback can signal that they think the shares are undervalued, the mirror image of the pecking order’s equity issue.' },
    { p: '<b>A small private firm.</b> For a business like Lantern, the questions are the same but the answers are shaped by size. A bank lends against tangible assets and steady cash flow, with covenants; outside equity means sharing ownership, control and information with an investor who will price the uncertainty. That is why small firms lean on retained profit, bank debt and leases, and why the cost of capital estimated in module 3 includes a premium for a small private firm. Whatever the size of the firm, a borrowing plan is worth testing in a bad year as well as a normal one.' },
  ],

  summary: [
    'Capital structure is the mix of debt and equity. Debt has a fixed, prior claim, tax-deductible interest and covenants; equity has the residual claim and control.',
    'Leverage raises expected EPS and ROE when the assets earn more than the interest rate, and widens their swings. Brookvale’s plans tie at EBIT of $160,000.',
    'Modigliani–Miller without taxes: firm value and the WACC do not depend on capital structure (homemade leverage); the cost of equity rises with D/E: <m>r_E = r_U + (r_U - r_D)D/E</m>.',
    'With corporate tax and permanent debt, <m>V_L = V_U + TD</m> and <m>r_E = r_U + (r_U - r_D)(1 - T)D/E</m>; the WACC falls as debt rises. Brookvale: $1,600,000, 13% and 11.25%.',
    'The costs of financial distress, direct and indirect, including risk shifting and debt overhang, offset the tax shield: the trade-off theory gives a target debt level.',
    'The pecking order: with asymmetric information, firms use internal funds, then debt, then equity as a last resort, and have no target ratio.',
    'Debt disciplines managers but creates conflicts with lenders, which covenants control. Almost 60% of surveyed CFOs rated financial flexibility and credit ratings important; few aimed to minimise the WACC.',
  ],

  glossary: [
    { term: 'Homemade leverage', def: 'Borrowing or lending by investors on their own account to copy or undo a firm’s capital structure; the argument behind Modigliani and Miller’s Proposition I.' },
    { term: 'Modigliani–Miller propositions', def: 'Proposition I: in a perfect capital market a firm’s value does not depend on its capital structure. Proposition II: the cost of equity rises with the debt-to-equity ratio, so the weighted average cost of capital stays the same. With corporate tax, the value rises by the present value of the interest tax shield.' },
    { term: 'Interest tax shield', def: 'The tax a firm saves because interest is deductible: the tax rate times the interest paid. For permanent debt its present value is the tax rate times the debt.' },
    { term: 'Financial distress', def: 'The condition of a firm that has difficulty meeting its obligations to lenders. Its costs include direct costs (legal and advisory fees in bankruptcy or restructuring) and indirect costs (lost customers, suppliers and staff, forced asset sales, distorted investment).' },
    { term: 'Debt overhang', def: 'Underinvestment by a firm with heavy debt: shareholders turn down a valuable project because much of its payoff would go to existing lenders.' },
    { term: 'Trade-off theory', def: 'The theory that a firm chooses its debt level by balancing the tax advantage of debt against the expected costs of financial distress, giving a target debt ratio.' },
    { term: 'Pecking order theory', def: 'The theory that, because managers know more than investors, firms prefer internal funds, then debt, and issue new equity only as a last resort, so they have no target debt ratio.' },
    { term: 'Asymmetric information', def: 'A situation in which one party to a transaction, such as a firm’s managers, knows more than the other, such as outside investors.' },
  ],

  references: [
    { text: 'Dahlquist, J. &amp; Knight, R. (2022). <i>Principles of Finance</i>, section 17.4, “Capital Structure Choices”. OpenStax.', url: 'https://openstax.org/books/principles-finance/pages/17-4-capital-structure-choices', checked: '2026-11-05' },
    { text: 'Dahlquist, J. &amp; Knight, R. (2022). <i>Principles of Finance</i>, section 17.5, “Optimal Capital Structure”. OpenStax.', url: 'https://openstax.org/books/principles-finance/pages/17-5-optimal-capital-structure', checked: '2026-11-05' },
    { text: 'Myers, S. C. (1984). “The Capital Structure Puzzle.” NBER Working Paper 1393 (published in the <i>Journal of Finance</i> 39(3), 575–592).', url: 'https://www.nber.org/papers/w1393.pdf', checked: '2026-11-05' },
    { text: 'Graham, J. &amp; Harvey, C. (2002). “How Do CFOs Make Capital Budgeting and Capital Structure Decisions?” <i>Journal of Applied Corporate Finance</i> 15(1).', url: 'https://people.duke.edu/~charvey/Research/Published_Papers/P76_How_do_CFOs.pdf', checked: '2026-11-05' },
  ],

  checks: [
    // Lantern (F03)
    { what: 'Lantern debt 2027', value: P27.debt, shown: 65250 },
    { what: 'Lantern equity 2027', value: P27.equity, shown: 62818 },
    { what: 'Lantern D/E 2027', value: P27.debt / P27.equity, shown: 1.04 },
    { what: 'Target D/V', value: TARGET_DV * 100, shown: 20 },
    { what: 'Lender rate (module 3)', value: DEBT.termLoan.rate * 100, shown: 7.5 },
    { what: 'Cost of equity at target (module 3)', value: DERIVED.targetCostOfEquity * 100, shown: 12.8, tol: 0.05 },
    // Brookvale, no tax
    { what: 'Brookvale value', value: B.V, shown: 2000000 },
    { what: 'Interest', value: B.int, shown: 64000 },
    { what: 'Shares bought', value: B.bought, shown: 40000 },
    { what: 'Shares left', value: B.left, shown: 60000 },
    { what: 'Levered equity', value: B.E, shown: 1200000 },
    { what: 'EPS U recession', value: epsU[0], shown: 1.20 },
    { what: 'EPS U normal', value: epsU[1], shown: 2.40 },
    { what: 'EPS U boom', value: epsU[2], shown: 3.60 },
    { what: 'ROE U recession', value: roeU[0] * 100, shown: 6.0, tol: 0.05 },
    { what: 'ROE U normal', value: roeU[1] * 100, shown: 12.0, tol: 0.05 },
    { what: 'ROE U boom', value: roeU[2] * 100, shown: 18.0, tol: 0.05 },
    { what: 'NI L recession', value: B.ebit[0] - B.int, shown: 56000 },
    { what: 'NI L normal', value: B.ebit[1] - B.int, shown: 176000 },
    { what: 'NI L boom', value: B.ebit[2] - B.int, shown: 296000 },
    { what: 'EPS L recession', value: epsL[0], shown: 0.93 },
    { what: 'EPS L normal', value: epsL[1], shown: 2.93 },
    { what: 'EPS L boom', value: epsL[2], shown: 4.93 },
    { what: 'ROE L recession', value: roeL[0] * 100, shown: 4.7, tol: 0.05 },
    { what: 'ROE L normal', value: roeL[1] * 100, shown: 14.7, tol: 0.05 },
    { what: 'ROE L boom', value: roeL[2] * 100, shown: 24.7, tol: 0.05 },
    { what: 'EPS range U', value: epsU[2] - epsU[0], shown: 2.40 },
    { what: 'EPS range L', value: epsL[2] - epsL[0], shown: 4.00 },
    { what: 'Leverage lowers EPS in recession', value: epsL[0] < epsU[0] ? 1 : 0, shown: 1 },
    { what: 'Leverage raises EPS in normal year and boom', value: epsL[1] > epsU[1] && epsL[2] > epsU[2] ? 1 : 0, shown: 1 },
    { what: 'Break-even EBIT', value: beEbit, shown: 160000 },
    { what: 'Break-even EPS', value: beEbit / B.shares, shown: 1.60 },
    { what: 'Break-even EPS levered', value: (beEbit - B.int) / B.left, shown: 1.60 },
    { what: 'Break-even return on assets', value: beEbit / B.V * 100, shown: 8 },
    { what: 'Break-even product', value: B.int * B.shares, shown: 6400000000 },
    { what: 'r_U', value: B.rU * 100, shown: 12 },
    { what: 'D/E levered', value: B.debt / B.E, shown: 0.667, tol: 0.0005 },
    { what: 'rE no tax', value: mm0.rE * 100, shown: 14.67 },
    { what: 'rE no tax (14.67%) by ROE', value: roeL[1] * 100, shown: 14.67 },
    { what: 'WACC no tax', value: mm0.wacc * 100, shown: 12 },
    { what: 'V_L = V_U no tax', value: mm0.VL, shown: 2000000 },
    { what: 'D/V weight', value: B.debt / B.V, shown: 0.4 },
    // homemade leverage
    { what: '1% of levered equity cost', value: home.own, shown: 12000 },
    { what: 'Shares in 1% levered', value: 0.01 * B.left, shown: 600 },
    { what: 'Shares in 1% unlevered', value: 0.01 * B.shares, shown: 1000 },
    { what: 'Cost of 1% unlevered', value: 0.01 * B.V, shown: 20000 },
    { what: 'Borrowed', value: home.borrow, shown: 8000 },
    { what: 'Payoff levered recession', value: payLev[0], shown: 560 },
    { what: 'Payoff levered normal', value: payLev[1], shown: 1760 },
    { what: 'Payoff levered boom', value: payLev[2], shown: 2960 },
    { what: 'Payoff homemade recession', value: payHome[0], shown: 560 },
    { what: 'Payoff homemade normal', value: payHome[1], shown: 1760 },
    { what: 'Payoff homemade boom', value: payHome[2], shown: 2960 },
    { what: 'Identical payoffs', value: payLev.every((x, i) => Math.abs(x - payHome[i]) < 1e-9) ? 1 : 0, shown: 1 },
    // with tax
    { what: 'After-tax EBIT', value: B.ebit[1] * (1 - T), shown: 180000 },
    { what: 'V_U with tax', value: BT.Vu, shown: 1500000 },
    { what: 'Price unlevered with tax', value: BT.priceU, shown: 15 },
    { what: 'Government claim unlevered', value: BT.govU, shown: 60000 },
    { what: 'Government claim levered', value: BT.govL, shown: 52000 },
    { what: 'Interest on 400k', value: B.rD * BT.D, shown: 32000 },
    { what: 'Annual shield', value: BT.shield, shown: 8000 },
    { what: 'PV shield', value: mmT.taxShieldPV, shown: 100000 },
    { what: 'PV shield by perpetuity', value: BT.shield / B.rD, shown: 100000 },
    { what: 'V_L with tax', value: mmT.VL, shown: 1600000 },
    { what: 'Price after announcement', value: BT.price, shown: 16 },
    { what: 'Gain a share', value: BT.price - BT.priceU, shown: 1 },
    { what: 'Shares bought with tax', value: BT.bought, shown: 25000 },
    { what: 'Shares left with tax', value: BT.left, shown: 75000 },
    { what: 'Equity with tax', value: mmT.E, shown: 1200000 },
    { what: 'Equity = shares × price', value: BT.left * BT.price, shown: 1200000 },
    { what: 'D/E with tax', value: BT.D / mmT.E, shown: 0.333, tol: 0.0005 },
    { what: 'rE with tax', value: mmT.rE * 100, shown: 13 },
    { what: 'Equity cash flow', value: BT.equityCF, shown: 156000 },
    { what: 'rE by cash flow', value: BT.equityCF / mmT.E * 100, shown: 13 },
    { what: 'WACC with tax', value: mmT.wacc * 100, shown: 11.25 },
    { what: 'WACC with tax by weights', value: (0.75 * mmT.rE + 0.25 * B.rD * (1 - T)) * 100, shown: 11.25 },
    { what: 'V_L = after-tax EBIT / WACC', value: 180_000 / mmT.wacc, shown: 1600000 },
    { what: 'WACC below 12% with tax', value: mmT.wacc < B.rU ? 1 : 0, shown: 1 },
    { what: 'WACC keeps falling with debt (tax)', value: CF.mm({ Vu: BT.Vu, D: 800_000, rU: 0.12, rD: 0.08, tax: T }).wacc < mmT.wacc ? 1 : 0, shown: 1 },
    { what: 'Survey: investor taxes important', value: 4.5, shown: 4.5 },
    // trade-off table
    { what: 'Shield 300k', value: T * 300_000, shown: 75000 },
    { what: 'Shield 600k', value: T * 600_000, shown: 150000 },
    { what: 'Shield 900k', value: T * 900_000, shown: 225000 },
    { what: 'Shield 1.2m', value: T * 1_200_000, shown: 300000 },
    { what: 'Distress 300k', value: dist(300_000), shown: 30000 },
    { what: 'Distress 600k', value: dist(600_000), shown: 120000 },
    { what: 'Distress 900k', value: dist(900_000), shown: 270000 },
    { what: 'Distress 1.2m', value: dist(1_200_000), shown: 480000 },
    { what: 'Value 300k', value: valueAt(300_000), shown: 1545000 },
    { what: 'Value 600k', value: valueAt(600_000), shown: 1530000 },
    { what: 'Value 900k', value: valueAt(900_000), shown: 1455000 },
    { what: 'Value 1.2m', value: valueAt(1_200_000), shown: 1320000 },
    { what: 'Optimal debt', value: dStar, shown: 375000 },
    { what: 'Value at optimum', value: valueAt(dStar), shown: 1546875 },
    { what: 'D/V at optimum', value: dStar / valueAt(dStar) * 100, shown: 24.2, tol: 0.05 },
    { what: 'Optimum beats every grid point', value: grid.every((D) => valueAt(D) <= valueAt(dStar)) ? 1 : 0, shown: 1 },
    { what: 'Table peak at 300k among grid', value: grid.reduce((a, D) => (valueAt(D) > valueAt(a) ? D : a), 0), shown: 300000 },
    // Myers and Graham & Harvey
    { what: 'Myers: internal cash covered', value: 62, shown: 62 },
    { what: 'Myers: share issues at most', value: 6, shown: 6 },
    { what: 'G&H respondents', value: 392, shown: 392 },
    { what: 'G&H tax important', value: 45, shown: 45 },
    { what: 'G&H distress important', value: 21.4, shown: 21.4 },
    { what: 'G&H strict targets', value: 44, shown: 44 },
    { what: 'G&H flexible targets', value: 37, shown: 37 },
    { what: 'G&H no target', value: 19, shown: 19 },
    { what: 'G&H targets add to 100', value: 44 + 37 + 19, shown: 100 },
    { what: 'G&H insufficient internal funds', value: 46.8, shown: 46.8 },
    { what: 'G&H EPS dilution', value: 69, shown: 69 },
    // Winterbourne
    { what: 'W new interest', value: W.intNew / 1e6, shown: 2.6 },
    { what: 'W normal coverage', value: W.ebit / W.intNew, shown: 3.46 },
    { what: 'W bad coverage', value: W.down / W.intNew, shown: 1.73 },
    { what: 'W bad coverage today', value: W.down / W.int, shown: 3.75 },
    { what: 'W max interest', value: W.maxInt / 1e6, shown: 1.5 },
    { what: 'W extra interest allowed', value: (W.maxInt - W.int) / 1e6, shown: 0.3 },
    { what: 'W max extra debt', value: W.maxExtra / 1e6, shown: 4.29 },
    { what: 'W shield of max extra', value: T * W.maxExtra / 1e6, shown: 1.07 },
    { what: 'W shield of $20m', value: T * W.extra / 1e6, shown: 5 },
    { what: 'W interest parts', value: W.int / 1e6 + W.extra * W.newRate / 1e6, shown: 2.6 },
    { what: 'Brookvale EPS 2.40 → 2.93', value: epsL[1] - epsU[1], shown: 0.53 },
  ],
};
