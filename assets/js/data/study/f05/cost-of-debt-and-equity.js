// cost-of-debt-and-equity.js — F05 · The cost of debt and equity. Content only; exercises are in cost-of-debt-and-equity.ex.js.
// Lantern’s inputs come from case.js (MARKET, PEERS, DEBT, TARGET_DV, DERIVED); betas, CAPM and yields from core/corpfin.js.
// Brightcup Coffee’s bond, Glenmere Mills and its figures are fictional; Ferncastle Utilities’ preferred share is F04’s
// fictional example (par $100, 5.5% dividend). Damodaran’s implied premiums and T-bond rates are quoted from his
// “Historical Implied Equity Risk Premiums” page (opened 5 November 2026).
import { MARKET, PEERS, DEBT, TARGET_DV, TAX, WORKING_RATE, DERIVED } from './case.js?v=30';
import * as CF from '../../../core/corpfin.js?v=30';
import { RESULTS as F03R, FACTS as F03F } from '../f03/case.js?v=30';

const { rf, mrp, smallFirm } = MARKET;
const peersU = PEERS.map((p) => CF.unleverBeta(p.beta, p.de, p.tax));
const betaU = peersU.reduce((a, b) => a + b, 0) / peersU.length;
const deT = TARGET_DV / (1 - TARGET_DV);
const betaL = CF.releverBeta(betaU, deT, TAX);
const capmL = CF.capm({ rf, beta: betaL, mrp });
const rEL = capmL + smallFirm;
const rD = DEBT.termLoan.rate;
// Brightcup Coffee’s bond (fictional): 6 years, 5% annual coupon, $96.20 per $100
const BB = { price: 96.2, coupon: 0.05, years: 6 };
const yBB = CF.ytm(BB);
// Glenmere Mills (fictional listed miller)
const GM = { p0: 42, d0: 1.6, g: 0.045, beta: 0.8, bond: 0.052, prem: 0.04 };
const gmD1 = GM.d0 * (1 + GM.g);
const gmDgm = CF.dividendGrowthCost({ d1: gmD1, p0: GM.p0, g: GM.g });
const gmCapm = CF.capm({ rf, beta: GM.beta, mrp });
const gmBond = GM.bond + GM.prem;
const gmAvg = (gmDgm + gmCapm + gmBond) / 3;
// Ferncastle Utilities’ preferred share (F04): $5.50 a year
const FP = { div: 5.5, price: 78.57 };
// Lantern by bond yield plus premium
const lanternBondPlus = rD + 0.04;

export default {
  slug: 'cost-of-debt-and-equity',
  title: 'The cost of debt and equity',
  blurb: 'Estimate what lenders and shareholders require: the cost of debt from yields, after tax; the cost of equity from the CAPM, the dividend growth model and a bond-yield check; and, for a private firm like Lantern, a beta borrowed from listed peers.',
  status: 'draft',
  objectives: [
    'Explain why a firm’s cost of capital is the return its investors require now on investments of similar risk, not the rate it happened to pay in the past.',
    'Calculate the cost of debt as a yield to maturity and after tax, and choose the right rate for a private firm.',
    'Calculate the cost of equity with the capital asset pricing model and the dividend growth model, and check it with the bond-yield-plus-premium rule.',
    'Estimate a private firm’s beta from listed peers by unlevering, averaging and relevering their betas.',
    'Evaluate the judgements in each input, including the contested size and illiquidity premium, and calculate the cost of preferred stock.',
  ],
  prerequisites: [
    { lesson: 'f00/capital-and-liquidity', why: 'The cost of capital was introduced there in words: what lenders and owners expect in return.' },
    { lesson: 'f00/decision-principles', why: 'Systematic and unsystematic risk, and why diversification removes only one of them.' },
    { lesson: 'f04/discounting-cash-flows', why: 'A bond’s yield to maturity is its internal rate of return.' },
    { lesson: 'f04/perpetuities-and-growth', why: 'The Gordon growth model and the value of a preferred share, which this lesson turns round to find a required return.' },
    { lesson: 'f05/net-present-value', why: 'The opportunity cost of capital and Ana’s working rate of 11%.' },
  ],
  case: 'lantern',

  concept: [
    { case: 'Since module 1 Ana has discounted Lantern’s projects at 11% a year, a figure she chose as a reasonable working rate. The roaster, Cold Brew and the kiosks all passed or failed against it. Before she commits money in April 2028 she wants to know where such a rate comes from: what Lantern’s lenders and Lantern’s owner actually require, estimated rather than assumed. This lesson estimates the two pieces; the next combines them into one rate.' },
    { p: 'A business has two broad sources of long-term money. Lenders provide <g>debt</g> under a contract that fixes interest and repayment; shareholders provide <g>equity</g> and keep whatever is left after everyone else has been paid. Each group could put its money elsewhere. The <g>cost of capital</g> is the return each group requires to leave its money in this business rather than in the best alternative of the same risk. It is an <g>opportunity cost</g>: set in the capital market by what investors can earn elsewhere, not by the business’s own accounts.' },
    { p: 'Two consequences follow, and they run through the whole lesson. First, the cost of capital is <b>forward-looking</b>: it is what investors require today for new money, not what the firm agreed to pay years ago. Second, it depends on <b>risk</b>: lenders, who are paid first and have a contract, require less than shareholders, who are paid last and have none. For the same reason a riskier firm pays more for both.' },
    { p: 'The <b>cost of debt</b> is the easier of the two to see, because lenders state a rate. Even so, the right number is the yield lenders would require on new borrowing now, and because interest is deductible for tax, the firm’s cost is lower than the rate the lender receives. The <b>cost of equity</b> has no contract behind it at all. It must be estimated from what shareholders could expect elsewhere for bearing similar risk, using a model of how risk is priced. That estimate is the hardest number in corporate finance, and this lesson is honest about how much judgement it needs.' },
    { table: {
      caption: 'The inputs Ana will use for Lantern, February 2028 (fictional assumptions)',
      head: ['Input', 'Value', 'Where it comes from'],
      align: ['l', 'r', 'l'],
      rows: [
        ['Risk-free rate', '4.2%', 'Ana’s assumption for the long-term government bond yield'],
        ['Market risk premium', '5.5%', 'Ana’s assumption; compared below with published estimates'],
        ['Listed peers’ betas', '0.90 to 1.25', 'Three fictional listed coffee and food firms'],
        ['Cost of new debt (before tax)', '7.5%', 'Coastline Bank’s rate for a new five-year term loan'],
        ['Tax rate', '25%', 'Lantern’s rate on profit'],
        ['Extra premium for a small private firm', '3.0%', 'Ana’s judgement; contested (see below)'],
      ],
      note: 'Every figure is invented for the case and dated February 2028; real market inputs change daily.',
    } },
    { callout: 'key', title: 'The cost of capital belongs to the use of the money', html: 'Investors require a return that matches the risk of what their money is used for. A firm cannot lower the return its shareholders require by paying them less, or lower its cost of debt by remembering a cheap old loan. What it can do is estimate the market’s requirement as carefully as possible and say which judgements the estimate rests on.' },
  ],

  theory: [
    { h: 'The cost of debt: a yield, not a coupon' },
    { p: 'A <g>bond</g> promises fixed interest payments, its coupons, and the <g>face value</g> at maturity. The <g>coupon rate</g> is set when the bond is issued and never changes; the bond’s price moves instead, so that a buyer today earns the return the market now requires. That return is the <g>yield to maturity</g> (YTM): the discount rate at which the present value of the remaining payments equals today’s price. F04 showed it is the bond’s <g>internal rate of return</g> to a buyer who holds it to maturity.' },
    { p: 'Brightcup Coffee, one of Lantern’s fictional listed peers, has a bond with six years left, a 5% coupon paid once a year and a face value of $100. It trades at $96.20. Its coupon is 5%, but nobody buying it today earns 5%: they pay $96.20, collect $5 a year and receive $100 at the end. The yield that makes those payments worth $96.20 is 5.77%, and that, not the coupon, is what lenders currently require from Brightcup. When a bond trades below face value its yield is above its coupon; above face value, below.' },
    { p: 'The yield to maturity is the <i>promised</i> return: it assumes every payment arrives. For a safe borrower the promised and expected returns are almost the same. For a risky one the expected return is lower, because some payments may not arrive, so a high yield overstates what debt really costs a firm close to default. For the borrowers in this course the difference is small and the promised yield is used.' },
    { p: 'Interest is a deductible expense, so each dollar of interest saves the firm 25 cents of tax at Lantern’s rate. The cost that matters to the firm is the <g>after-tax cost of debt</g>, <m>r_D(1 - T)</m>. Brightcup’s is <m>5.77\\% \\times (1 - 0.25) = 4.33\\%</m>. The saving exists only if the firm has taxable profits to deduct the interest from; a firm making losses (or a lender’s own tax position) does not enter. Lantern made a profit of $22,431 in 2027, so the deduction is worth having.' },
    { h: 'The cost of debt for a private firm' },
    { p: 'Lantern has no bonds trading in a market, so it has no yield to read. The equivalent question is: what rate would a lender charge Lantern today for long-term money? Coastline Bank has answered it: 7.5% a year for a new five-year term loan. That is the cost of debt, before tax. Lantern’s older rates are history. The first Coastline note at 6% was agreed in 2026 and is repaid on 1 March 2028; the 7.2% Coastline quoted for an equipment loan in March 2027 was the market’s price a year earlier. Neither tells Ana what new debt costs now.' },
    { p: 'The line of credit at 9% is a different kind of debt: short-term and meant to finance seasonal working capital rather than long-lived projects (F03’s $65,250 of book debt at the end of 2027 includes $24,000 drawn on it), and the next lesson leaves it out of the weights. Lantern’s after-tax cost of long-term debt is therefore <m>7.5\\% \\times (1 - 0.25) = 5.625\\%</m>, or 5.63% to two decimal places. A listed firm without traded bonds does something similar: it looks up the yield on bonds of other firms with the same credit rating, or adds a default spread for its rating to the risk-free rate.' },

    { h: 'The cost of equity: the capital asset pricing model' },
    { p: 'Shareholders are promised nothing, so their required return must be inferred. The standard tool is the <g>capital asset pricing model</g> (CAPM). It starts from F00’s point that diversified investors can remove <g>unsystematic risk</g> cheaply, so the market pays a premium only for <g>systematic risk</g>, the part of a share’s ups and downs that moves with the market as a whole. The CAPM says a share’s required return is the <g>risk-free rate</g> plus its beta times the <g>market risk premium</g>:' },
    { math: String.raw`r_E = r_f + \beta_E \times \text{MRP}` },
    { p: '<g>Beta</g> measures how strongly a share’s returns move with the market’s. A beta of 1 means the share tends to rise and fall with the market one for one; 1.5 means it tends to move 50% more; 0.5, half as much. It is estimated by regressing the share’s past returns on the market’s, usually over two to five years of weekly or monthly data, and the estimate is noisy: OpenStax’s example (section 17.3) quotes IBM’s beta in April 2021 as 0.97 from MarketWatch and 1.25 from Yahoo! Finance. F06 Investment Analysis derives the CAPM and treats beta in depth; here it is a tool.' },
    { p: 'Each input needs a judgement. The <b>risk-free rate</b> is usually the yield on a government bond in the same currency as the cash flows, with a maturity close to the investments being valued, so a long-term bond yield for long-lived projects rather than a three-month bill. The <b>market risk premium</b> (MRP) is the extra return investors expect from the market as a whole over that bond. It cannot be observed; it is estimated either from history (the average past excess return, which depends heavily on the period chosen) or implied from today’s share prices and expected cash payouts. Aswath Damodaran publishes an implied premium for US shares every year: his table gives values between 4.23% and 5.94% for the years 2020 to 2025, and 4.23% for 2025, when his Treasury bond rate was 4.18%. Ana’s assumed 5.5% sits within that range, towards the top; another analyst could defend 4.5%.' },
    { h: 'A beta for a firm with no share price' },
    { p: 'Lantern’s shares are not traded, so it has no beta to estimate. The usual answer is to borrow one from listed firms in the same business, the <b>comparable firms</b> or peers. But a peer’s equity beta reflects two kinds of risk: the risk of its business, and the extra risk its shareholders carry because of its debt. Debt has a fixed claim, so the more of it there is, the more the shareholders’ residual return swings. A peer with more debt than Lantern would overstate Lantern’s risk, and one with less would understate it.' },
    { p: 'The fix is to strip each peer’s leverage out, average the business risk, and put Lantern’s own leverage back in. A peer’s equity beta is its <g>levered beta</g>; removing the effect of its debt gives its <g>unlevered beta</g> (or asset beta), the beta its shares would have with no debt. Using Hamada’s formula, which assumes the firm’s debt is risk-free (a debt beta of zero) and that its debt is a fixed, permanent amount, so that its interest tax shield is as safe as the debt (Modigliani and Miller’s case with tax, which module 4’s capital-structure lesson develops):' },
    { math: String.raw`\beta_U = \dfrac{\beta_L}{1 + (1 - T)\,D/E} \qquad \beta_L = \beta_U \left[1 + (1 - T)\,D/E\right]` },
    { table: {
      caption: 'Lantern’s peers, unlevered (all fictional)',
      head: ['Peer', 'Equity beta', 'D/E', 'Unlevered beta'],
      align: ['l', 'r', 'r', 'r'],
      rows: [
        ['Brightcup Coffee', '1.05', '0.30', '0.857'],
        ['Morrow & Pike Roasters', '0.90', '0.15', '0.809'],
        ['Harbour Street Foods', '1.25', '0.55', '0.885'],
      ],
      foot: [['Average', '', '', '0.850']],
      note: 'D/E is each peer’s market debt-to-equity ratio; tax at 25% for all three. Brightcup: 1.05 ÷ (1 + 0.75 × 0.30) = 0.857.',
    } },
    { p: 'Harbour Street’s equity beta, 1.25, is the highest of the three mainly because it carries the most debt: unlevered, its business risk (0.885) is close to the others’. The average unlevered beta, 0.850, is the estimate of the business risk of selling coffee and food. Averaging several peers also cancels some of the noise in each one’s estimate. Analysts who assume instead that a firm rebalances its debt to a fixed share of its value often unlever without the tax term, <m>\\beta_L = \\beta_U(1 + D/E)</m>; the two versions give somewhat different betas, and this course uses Hamada’s.' },
    { p: 'To relever, Ana needs Lantern’s debt-to-equity ratio. The relevant one is the mix she intends to keep, a target of 20% debt and 80% equity by value (the next lesson explains why a target, and why market values), which is a D/E of <m>0.20 \\div 0.80 = 0.25</m>. Lantern’s levered beta is then <m>0.850 \\times [1 + 0.75 \\times 0.25] = 1.010</m>, and the CAPM gives <m>4.2\\% + 1.010 \\times 5.5\\% = 9.75\\%</m>.' },

    { h: 'The size and illiquidity premium: a contested addition' },
    { p: 'Ana adds 3 percentage points to that 9.75%, making Lantern’s cost of equity 12.75%. Her reasons are common in the valuation of small private firms: Lantern is far smaller than its listed peers, its shares cannot be sold on an exchange, and its owner has most of her wealth in it. Investors, the argument runs, demand more for owning such a firm than the CAPM allows.' },
    { p: 'The case against is strong, and you should know it. Damodaran, reviewing the evidence in 2015, found that the small-firm premium in US share returns was large before 1980 but seemed to have faded since, was concentrated in the very smallest firms and in January, and was barely statistically significant; he wrote that he has never used one and recommended putting the risks of small firms into the cash flows (for example, a probability of failure) rather than into the discount rate. There is a theoretical point too: the CAPM prices only systematic risk, and the risk of a small firm’s failure is largely specific to it. Ana, being undiversified, does bear that risk; a diversified buyer would not pay her for it.' },
    { callout: 'warn', title: 'Say what you added, and why', html: 'This course follows Ana’s choice and adds the 3% to the CAPM, so Lantern’s cost of equity is 12.75%, but it shows the figure without it (9.75%) beside it. When you see a cost of equity for a private firm, ask whether it includes such a premium and how large: a premium of a few points changes a WACC by nearly as much, and can decide a close project.' },

    { h: 'Other estimates of the cost of equity' },
    { p: 'The <b>dividend growth model</b> turns F04’s <g>Gordon growth model</g> round. If a share’s price is the present value of dividends growing for ever at <m>g</m>, <m>P_0 = D_1 \\div (r_E - g)</m>, then the return the price implies is <m>r_E = D_1 \\div P_0 + g</m>: the dividend yield plus growth. Glenmere Mills, a fictional listed flour miller, trades at $42.00 and has just paid $1.60 a year in dividends, which analysts expect to grow at 4.5% a year. Next year’s dividend is <m>1.60 \\times 1.045 = 1.672</m> dollars, and the implied cost of equity is <m>1.672 \\div 42.00 + 4.5\\% = 8.48\\%</m>. The model suits mature firms with steady dividends; it fails for firms that pay no dividend or an irregular one, and the answer moves one for one with the growth rate, the least certain input. It cannot be used for Lantern, whose dividends ($300 and $4,700 in 2026, $2,000 in 2027) follow no growth path and whose shares have no market price.' },
    { p: 'The <b>bond-yield-plus-premium</b> rule of thumb adds a judgemental premium to the firm’s own cost of debt, on the logic that shareholders bear more risk than the firm’s own lenders: <m>r_E \\approx r_D + \\text{premium}</m>. It has no theory behind the size of the premium, but it is a useful check because it starts from the firm’s own credit risk. With a premium of 4 points, Lantern’s gives <m>7.5\\% + 4\\% = 11.5\\%</m>; Glenmere’s, from its 5.2% bond yield, gives 9.2%.' },
    { table: {
      caption: 'Three estimates of the cost of equity',
      head: ['Method', 'Glenmere Mills (fictional)', 'Lantern (fictional)'],
      align: ['l', 'r', 'r'],
      rows: [
        ['CAPM', '8.60% (beta 0.80)', '9.75% (beta 1.010)'],
        ['CAPM plus Ana’s 3% premium', 'not used', '12.75%'],
        ['Dividend growth model', '8.48%', 'not usable'],
        ['Own bond yield plus 4 points', '9.20%', '11.50%'],
      ],
      note: 'All three use the same 4.2% risk-free rate and 5.5% market risk premium where they apply.',
    } },
    { p: 'Where the methods agree, as they roughly do for Glenmere, the estimate deserves more confidence. Where they disagree, as for Lantern, the gap shows how much rests on judgement: here, almost entirely on the size premium.' },

    { h: 'The cost of preferred stock' },
    { p: 'A <g>preferred stock</g> pays a fixed dividend for ever (unless the issuer redeems it), so F04 valued it as a perpetuity, <m>P = D_P \\div r_P</m>. Turned round, its cost is <m>r_P = D_P \\div P_P</m>. Ferncastle Utilities’ fictional preferred share from F04 pays $5.50 a year; at a price of $78.57 its cost is <m>5.50 \\div 78.57 = 7.0\\%</m>. Preferred dividends are paid out of after-tax profit, so unlike interest they earn no tax deduction and need no <m>(1 - T)</m>. Lantern has none.' },
  ],

  formulas: [
    { id: 'cdc-ytm', name: 'Yield to maturity of a bond (annual coupons)',
      tex: String.raw`P_0 = \sum_{t=1}^{n} \dfrac{C}{(1+y)^t} + \dfrac{F}{(1+y)^n}`,
      where: [[String.raw`P_0`, 'The bond’s price today', '$'], [String.raw`C`, 'The coupon paid each year: coupon rate × face value', '$'], [String.raw`F`, 'Face value, repaid at maturity', '$'], [String.raw`n`, 'Years to maturity', 'years'], [String.raw`y`, 'Yield to maturity: the rate that solves the equation', '% per year']],
      assumptions: 'Every payment arrives on time and the bond is held to maturity. Solved by trial or a spreadsheet’s RATE function, not algebra.',
      note: 'With coupons paid twice a year, use half the coupon, twice as many periods and double the half-year yield.' },
    { id: 'cdc-after-tax-debt', name: 'After-tax cost of debt',
      tex: String.raw`r_D^{\text{after tax}} = r_D \,(1 - T)`,
      where: [[String.raw`r_D`, 'Cost of debt before tax: the yield on the firm’s debt, or the rate a lender would charge for new debt', '% per year'], [String.raw`T`, 'The firm’s tax rate on profit', '']],
      assumptions: 'The firm has enough taxable profit to use the interest deduction.' },
    { id: 'cdc-capm', name: 'Cost of equity: the capital asset pricing model',
      tex: String.raw`r_E = r_f + \beta_E \times \text{MRP}`,
      where: [[String.raw`r_E`, 'Cost of equity: the return shareholders require', '% per year'], [String.raw`r_f`, 'Risk-free rate: the yield on a government bond of similar maturity', '% per year'], [String.raw`\beta_E`, 'The equity beta: the share’s sensitivity to market movements', ''], [String.raw`\text{MRP}`, 'Market risk premium: the market’s expected return minus the risk-free rate', '% per year']],
      assumptions: 'Investors are diversified, so only systematic risk is priced; beta is stable.',
      note: 'Any extra premium (for size or illiquidity) is an addition outside the model and should be stated separately.' },
    { id: 'cdc-unlever', name: 'Unlevering and relevering a beta (Hamada)',
      tex: String.raw`\beta_U = \dfrac{\beta_L}{1 + (1 - T)\,D/E}, \qquad \beta_L = \beta_U\left[1 + (1 - T)\,D/E\right]`,
      where: [[String.raw`\beta_L`, 'Levered (equity) beta, reflecting the firm’s debt', ''], [String.raw`\beta_U`, 'Unlevered (asset) beta: business risk alone', ''], [String.raw`D/E`, 'Debt-to-equity ratio at market values', ''], [String.raw`T`, 'Tax rate', '']],
      assumptions: 'Debt is risk-free (debt beta zero) and a fixed, permanent amount (Modigliani–Miller with tax); a firm that rebalances to a target debt share is often modelled with β_L = β_U(1 + D/E) instead; use each peer’s own D/E and tax rate to unlever, the target firm’s to relever.' },
    { id: 'cdc-dgm', name: 'Cost of equity: the dividend growth model',
      tex: String.raw`r_E = \dfrac{D_1}{P_0} + g`,
      where: [[String.raw`r_E`, 'Cost of equity implied by the price', '% per year'], [String.raw`D_1`, 'Dividend per share expected next year: D₀ × (1 + g)', '$'], [String.raw`P_0`, 'Share price today', '$'], [String.raw`g`, 'Constant growth rate of dividends, for ever', '% per year']],
      assumptions: 'Dividends grow at a constant rate for ever and g is below r_E.' },
    { id: 'cdc-preferred', name: 'Cost of preferred stock',
      tex: String.raw`r_P = \dfrac{D_P}{P_P}`,
      where: [[String.raw`r_P`, 'Cost of preferred stock', '% per year'], [String.raw`D_P`, 'Fixed preferred dividend per share a year', '$'], [String.raw`P_P`, 'Price of a preferred share today (net of issue costs for a new issue)', '$']],
      assumptions: 'The dividend is paid for ever; no tax adjustment, because preferred dividends are not deductible.' },
  ],

  examples: [
    { level: 'simple', title: 'Brightcup Coffee’s cost of debt', fictional: true,
      setup: 'Brightcup Coffee’s bond has six years to maturity, a 5% coupon paid annually and a $100 face value, and trades at $96.20. Brightcup pays tax at 25%. What is its cost of debt before and after tax?',
      steps: [
        'The bond pays $5 a year for six years and $100 at the end. The yield to maturity <m>y</m> solves <m>96.20 = 5 \\div (1+y) + \\dots + 105 \\div (1+y)^6</m>.',
        'Try 5%: the payments are worth exactly $100, too much. Try 6%: they are worth $95.08, too little. The yield lies between, nearer 6%.',
        'A spreadsheet gives the exact rate: <x>=RATE(6,5,-96.2,100)</x> returns 5.77%. That is the cost of debt before tax, the return lenders require on Brightcup’s debt now.',
        'After tax: <m>5.77\\% \\times (1 - 0.25) = 4.33\\%</m>. The current yield, <m>5 \\div 96.20 = 5.20\\%</m>, is not the answer: it ignores the $3.80 gain to maturity.',
      ],
      answer: 'Cost of debt 5.77% before tax and 4.33% after tax, not the 5% coupon.',
      interpretation: 'The bond trades below its face value because market rates have risen since it was issued. Brightcup would have to offer about 5.77% to borrow today, and that is the rate to use for new projects.' },
    { level: 'challenging', title: 'Lantern’s cost of equity from its peers', fictional: true,
      setup: 'Use the three peers (Brightcup 1.05 at D/E 0.30; Morrow &amp; Pike 0.90 at 0.15; Harbour Street 1.25 at 0.55; tax 25%), a 4.2% risk-free rate, a 5.5% market risk premium and Lantern’s target of 20% debt. Estimate Lantern’s cost of equity with and without Ana’s 3% premium.',
      steps: [
        'Unlever each peer: Brightcup <m>1.05 \\div (1 + 0.75 \\times 0.30) = 0.857</m>; Morrow &amp; Pike <m>0.90 \\div 1.1125 = 0.809</m>; Harbour Street <m>1.25 \\div 1.4125 = 0.885</m>.',
        'Average the business risk: <m>(0.857 + 0.809 + 0.885) \\div 3 = 0.850</m>.',
        'Lantern’s target D/E: 20% debt and 80% equity gives <m>0.20 \\div 0.80 = 0.25</m>. Relever: <m>0.850 \\times (1 + 0.75 \\times 0.25) = 1.010</m>.',
        'CAPM: <m>4.2\\% + 1.010 \\times 5.5\\% = 9.75\\%</m>. Adding the 3% premium gives 12.75%.',
      ],
      answer: 'Lantern’s cost of equity is 9.75% from the CAPM alone and 12.75% with the size premium.',
      interpretation: 'Lantern’s relevered beta, 1.010, is about the average share’s, even though its business beta is lower, because of its debt. The whole gap between the two answers is one judgement: whether to add a premium for size. The next lesson combines each with the cost of debt and compares the result with Ana’s 11% working rate.' },
    { level: 'applied', title: 'Checking Glenmere Mills’ hurdle rate', fictional: true,
      setup: 'Glenmere Mills’ treasurer reviews the cost of equity each January. The shares trade at $42.00; the dividend just paid was $1.60 and analysts expect 4.5% growth; two data services put beta at about 0.80; Glenmere’s bonds yield 5.2%. With a 4.2% risk-free rate and a 5.5% market risk premium, what range should she report?',
      steps: [
        'Dividend growth model: <m>D_1 = 1.60 \\times 1.045 = 1.672</m>, so <m>r_E = 1.672 \\div 42.00 + 4.5\\% = 3.98\\% + 4.5\\% = 8.48\\%</m>.',
        'CAPM: <m>4.2\\% + 0.80 \\times 5.5\\% = 8.60\\%</m>.',
        'Bond yield plus a 4-point premium: <m>5.2\\% + 4\\% = 9.20\\%</m>, the highest of the three; its 4-point premium is a guess.',
        'The estimates run from 8.48% to 9.20%, with a simple average of 8.76%. The first two, which rest on market data, agree within 0.12 points.',
      ],
      answer: 'About 8.5% to 9.2%; she might report about 8.5% (8.54%, the mean of the two market-based methods) and note the rule of thumb as an upper check.',
      interpretation: 'Agreement between methods built on different data is the best evidence an estimate can have. She would also report how the dividend model moves with growth: at 3.5% growth instead of 4.5% it falls to about 7.4%.' },
  ],

  demo: [
    { widget: 'cdc-ytm', intro: 'Change the price of Brightcup’s bond and watch the yield move the other way. Set the price to $100 and the yield equals the coupon; push it above $100 and the yield falls below the coupon. The after-tax line is what the firm’s debt really costs it.' },
    { widget: 'cdc-peers', intro: 'The peer table unlevers each firm’s beta. Move the debt share: at 0% the cost of equity uses the unlevered beta alone; at Ana’s 20% target it is 12.75% (9.75% from the CAPM plus her 3% premium). The WACC line belongs to the next lesson; here, watch the cost of equity rise with debt.' },
  ],

  mistakes: [
    { title: 'Using the coupon, or an old loan’s rate, as the cost of debt', html: 'The coupon and the rate on an existing loan were set when the money was borrowed. The cost of debt is what lenders require now: the yield to maturity for traded debt, or a lender’s current quote (Coastline’s 7.5%) for a private firm. Lantern’s 6% note says nothing about what new borrowing costs.' },
    { title: 'Forgetting the tax deduction, or applying it to equity', html: 'Interest is deductible, so debt costs <m>r_D(1 - T)</m>. Dividends are not, so the cost of equity (and of preferred stock) needs no tax adjustment. Taking tax off both, or off neither, misstates every rate built on them.' },
    { title: 'Using a peer’s equity beta as it stands', html: 'A peer’s equity beta includes the effect of its own debt. Harbour Street’s 1.25 reflects a D/E of 0.55, far above Lantern’s target. Unlever each peer with its own D/E, average, then relever at the target firm’s D/E.' },
    { title: 'Treating the cost of equity as a precise number', html: 'Beta, the market risk premium and any extra premium are estimates with wide ranges. Quoting 12.754% suggests a precision the inputs do not have. Report the estimate to a sensible precision, show the range from reasonable inputs, and check it with a second method.' },
    { title: 'Mismatching the risk-free rate and the premium', html: 'A market risk premium is measured over a particular rate, usually a long-term government bond. Combining a premium measured over long-term bonds with a short-term bill rate (or the other way round) mixes two bases. Use the rate that matches the premium and the life of the investments.' },
    { title: 'Forcing the dividend growth model on a firm without steady dividends', html: 'The model needs a market price and a dividend that grows steadily for ever, at a rate below the cost of equity. For a private firm, a firm that pays no dividend or one whose growth is temporarily high, it gives nonsense; use the CAPM with peers instead.' },
  ],

  application: [
    { p: '<b>Ana’s assumptions note.</b> Before using a new rate, Ana writes one page for her accountant and for anyone who may later invest. It lists each input, its source and a reasonable range: the risk-free rate (4.2%, a long-term government bond yield, as an assumption for February 2028), the market risk premium (5.5%, inside the range of published implied estimates), the three peers and why each is comparable, the target debt share, Coastline’s 7.5% quote, and the 3% premium with the arguments against it. She shows the cost of equity three ways: 9.75% (CAPM), 12.75% (with the premium) and 11.5% (Coastline’s rate plus 4 points). A reader who disagrees with one judgement can change it and see what follows.' },
    { p: '<b>A listed firm’s annual review.</b> A treasurer like Glenmere’s updates the inputs once a year, or when markets move sharply: the bond yield from current prices, beta from two data services and its own regression, the dividend model with analysts’ growth forecasts. She reports a range and a point estimate to the board, and the finance team uses the point estimate until the next review. The discipline is in using the same method every year, so that a change in the rate reflects a change in the market, not in the analyst.' },
    { p: '<b>A lender’s view.</b> A credit officer pricing a five-year loan for a café group does the first half of this lesson in reverse: she starts from the bank’s funding cost, adds a margin for the borrower’s risk and arrives at the rate she quotes. Coastline’s 7.5% to Lantern is such a price, and is higher than its 7.2% quote of March 2027. The borrower’s cost of debt is the lender’s required return, seen from the other side.' },
  ],

  summary: [
    'The cost of capital is the return investors require now on investments of similar risk: an opportunity cost set in the market, not a figure from the accounts.',
    'The cost of debt is the yield to maturity on the firm’s debt (or a lender’s current quote), not the coupon; after tax it is r_D(1 − T). Lantern: 7.5% before tax, 5.63% after.',
    'The CAPM gives the cost of equity as r_f + β × MRP. Each input is an estimate: a long-term government bond yield, a premium from history or current prices, and a noisy beta.',
    'A private firm borrows beta from listed peers: unlever each with its own D/E, average, relever at the firm’s target D/E. Lantern: 0.850 unlevered, 1.010 at 20% debt, 9.75% from the CAPM.',
    'An extra premium for size or illiquidity is contested; Ana adds 3%, giving 12.75%. State it separately so readers can remove it.',
    'Cross-check with the dividend growth model (D₁ ÷ P₀ + g, for steady dividend payers) and the bond-yield-plus-premium rule.',
    'Preferred stock costs D_P ÷ P_P, with no tax adjustment.',
  ],
  glossary: [
    { term: 'Coupon rate', def: 'The interest a bond pays each year as a percentage of its face value, fixed when the bond is issued.' },
    { term: 'Yield to maturity', def: 'The discount rate at which the present value of a bond’s remaining payments equals its price today: the return a buyer earns by holding it to maturity if every payment is made. Abbreviated YTM.' },
    { term: 'After-tax cost of debt', def: 'The cost of borrowing to a firm once the tax saving on deductible interest is allowed for: the pre-tax cost of debt × (1 − tax rate).' },
    { term: 'Cost of equity', def: 'The return a firm’s shareholders require for bearing the risk of its shares: the return they could expect elsewhere on investments of similar risk.' },
    { term: 'Capital asset pricing model', def: 'A model in which a security’s required return is the risk-free rate plus its beta times the market risk premium, because only systematic risk is rewarded. Abbreviated CAPM.' },
    { term: 'Beta', def: 'A measure of how strongly a security’s returns move with the market’s: 1 for a security that moves with the market, above 1 for one that moves more, below 1 for one that moves less.' },
    { term: 'Market risk premium', def: 'The return investors expect from the market as a whole above the risk-free rate. It cannot be observed and is estimated from history or from current prices. Also called the equity risk premium.' },
    { term: 'Levered beta', def: 'A firm’s equity beta as it is, including the extra risk that its debt places on its shareholders.' },
    { term: 'Unlevered beta', def: 'The beta a firm’s equity would have if it had no debt: a measure of the risk of its business alone. Also called the asset beta.' },
    { term: 'Size premium', def: 'An extra return some analysts add to the cost of equity of small or privately held firms for their size and illiquidity, beyond what the capital asset pricing model gives. Its evidence is contested.' },
  ],
  references: [
    { text: 'Dahlquist, J. &amp; Knight, R. (2022). <i>Principles of Finance</i>, section 17.2, “The Costs of Debt and Equity Capital”. OpenStax.', url: 'https://openstax.org/books/principles-finance/pages/17-2-the-costs-of-debt-and-equity-capital', checked: '2026-11-05' },
    { text: 'Dahlquist, J. &amp; Knight, R. (2022). <i>Principles of Finance</i>, section 17.3, “Calculating the Weighted Average Cost of Capital”. OpenStax.', url: 'https://openstax.org/books/principles-finance/pages/17-3-calculating-the-weighted-average-cost-of-capital', checked: '2026-11-05' },
    { text: 'Damodaran, A. <i>Historical Implied Equity Risk Premiums</i> (data page, updated January 2026). NYU Stern.', url: 'https://pages.stern.nyu.edu/~adamodar/New_Home_Page/datafile/histimpl.html', checked: '2026-11-05' },
    { text: 'Damodaran, A. (2015, 11 April). “The Small Cap Premium: Where is the beef?” <i>Musings on Markets</i>.', url: 'https://aswathdamodaran.blogspot.com/2015/04/the-small-cap-premium-fact-fiction-and.html', checked: '2026-11-05' },
    { text: 'Microsoft. <i>RATE function</i>. Microsoft Support.', url: 'https://support.microsoft.com/en-us/office/rate-function-9f665657-4a7e-4bb7-a030-83fc59e748ce', checked: '2026-11-05' },
  ],
  checks: [
    { what: 'Risk-free rate', value: rf * 100, shown: 4.2 },
    { what: 'Market risk premium', value: mrp * 100, shown: 5.5 },
    { what: 'Lowest peer beta', value: Math.min(...PEERS.map((p) => p.beta)), shown: 0.90 },
    { what: 'Highest peer beta', value: Math.max(...PEERS.map((p) => p.beta)), shown: 1.25 },
    { what: 'Coastline new term loan rate', value: rD * 100, shown: 7.5 },
    { what: 'Tax rate', value: TAX * 100, shown: 25 },
    { what: 'Size premium', value: smallFirm * 100, shown: 3.0 },
    { what: 'Working rate', value: WORKING_RATE * 100, shown: 11 },
    { what: 'Brightcup YTM', value: yBB * 100, shown: 5.77 },
    { what: 'Brightcup YTM above coupon (bond below par)', value: yBB > BB.coupon && BB.price < 100 ? 1 : 0, shown: 1 },
    { what: 'Brightcup PV at 5% equals face', value: [1, 2, 3, 4, 5, 6].reduce((s, t) => s + 5 / 1.05 ** t, 0) + 100 / 1.05 ** 6, shown: 100 },
    { what: 'Brightcup PV at 6%', value: [1, 2, 3, 4, 5, 6].reduce((s, t) => s + 5 / 1.06 ** t, 0) + 100 / 1.06 ** 6, shown: 95.08 },
    { what: 'Brightcup after-tax cost', value: yBB * (1 - TAX) * 100, shown: 4.33 },
    { what: 'Brightcup current yield', value: 5 / BB.price * 100, shown: 5.20 },
    { what: 'Gain to maturity per $100', value: 100 - BB.price, shown: 3.80 },
    { what: 'Lantern 2027 net income (F03)', value: F03R.incomeStatement.netIncome, shown: 22431 },
    { what: 'Lantern after-tax cost of debt', value: rD * (1 - TAX) * 100, shown: 5.625 },
    { what: 'Lantern after-tax cost of debt, 2 dp', value: rD * (1 - TAX) * 100, shown: 5.63 },
    { what: 'First note rate', value: DEBT.firstNote.rate * 100, shown: 6 },
    { what: '2027 quote', value: DEBT.quote2027 * 100, shown: 7.2 },
    { what: 'Line of credit rate', value: DEBT.lineOfCredit.rate * 100, shown: 9 },
    { what: 'Damodaran implied ERP range low (2025)', value: 4.23, shown: 4.23 },
    { what: 'Damodaran implied ERP range high (2022)', value: 5.94, shown: 5.94 },
    { what: 'Damodaran 2025 T-bond rate', value: 4.18, shown: 4.18 },
    { what: 'Ana’s MRP inside Damodaran’s range', value: mrp * 100 >= 4.23 && mrp * 100 <= 5.94 ? 1 : 0, shown: 1 },
    { what: 'Brightcup unlevered', value: peersU[0], shown: 0.857, tol: 0.0005 },
    { what: 'Morrow & Pike unlevered', value: peersU[1], shown: 0.809, tol: 0.0005 },
    { what: 'Harbour Street unlevered', value: peersU[2], shown: 0.885, tol: 0.0005 },
    { what: 'Brightcup unlever denominator', value: 1 + 0.75 * 0.30, shown: 1.225 },
    { what: 'Morrow unlever denominator', value: 1 + (1 - TAX) * PEERS[1].de, shown: 1.1125 },
    { what: 'Harbour unlever denominator', value: 1 + (1 - TAX) * PEERS[2].de, shown: 1.4125 },
    { what: 'Harbour Street has the highest D/E', value: PEERS[2].de === Math.max(...PEERS.map((p) => p.de)) ? 1 : 0, shown: 1 },
    { what: 'Average unlevered beta', value: betaU, shown: 0.850, tol: 0.0005 },
    { what: 'Target D/E', value: deT, shown: 0.25 },
    { what: 'Relever factor', value: 1 + (1 - TAX) * deT, shown: 1.1875 },
    { what: 'Lantern relevered beta', value: betaL, shown: 1.010, tol: 0.0005 },
    { what: 'Lantern relevered beta equals case', value: DERIVED.targetBeta, shown: 1.010, tol: 0.0005 },
    { what: 'Lantern CAPM cost of equity', value: capmL * 100, shown: 9.75 },
    { what: 'Lantern cost of equity with premium', value: rEL * 100, shown: 12.75 },
    { what: 'Lantern cost of equity equals case', value: DERIVED.targetCostOfEquity * 100, shown: 12.75 },
    { what: 'Glenmere D1', value: gmD1, shown: 1.672 },
    { what: 'Glenmere dividend yield', value: gmD1 / GM.p0 * 100, shown: 3.98 },
    { what: 'Glenmere DGM cost', value: gmDgm * 100, shown: 8.48 },
    { what: 'Glenmere CAPM', value: gmCapm * 100, shown: 8.60 },
    { what: 'Glenmere bond plus premium', value: gmBond * 100, shown: 9.20 },
    { what: 'Glenmere average', value: gmAvg * 100, shown: 8.76 },
    { what: 'Glenmere mean of DGM and CAPM', value: (gmDgm + gmCapm) / 2 * 100, shown: 8.54 },
    { what: 'Glenmere CAPM − DGM gap', value: (gmCapm - gmDgm) * 100, shown: 0.12 },
    { what: 'Glenmere DGM at 3.5% growth', value: (GM.d0 * 1.035 / GM.p0 + 0.035) * 100, shown: 7.4, tol: 0.05 },
    { what: 'Lantern bond yield plus premium', value: lanternBondPlus * 100, shown: 11.5 },
    { what: 'Lantern 2027 dividend (F03)', value: F03F.dividends.reduce((a, d) => a + d.amount, 0), shown: 2000 },
    { what: 'Ferncastle preferred cost', value: FP.div / FP.price * 100, shown: 7.0, tol: 0.01 },
    { what: 'Ferncastle dividend (F04: 5.5% of $100)', value: 100 * 0.055, shown: 5.5 },
    { what: 'Coastline 2028 rate above 2027 quote', value: rD > DEBT.quote2027 ? 1 : 0, shown: 1 },
  ],
};
