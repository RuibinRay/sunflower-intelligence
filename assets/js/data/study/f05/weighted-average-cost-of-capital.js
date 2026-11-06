// weighted-average-cost-of-capital.js — F05 · The weighted average cost of capital. Content only; exercises are in
// weighted-average-cost-of-capital.ex.js. Lantern’s WACC is DERIVED.targetWacc in case.js (target weights, TARGET_DV);
// its 2027 book values come from f03/case.js. Wren Valley Storage, Fizzwell Drinks and Northmoor Group are fictional.
// The post-financing WACC (DERIVED.wacc) belongs to the course project and is not used here.
import { MARKET, PEERS, DEBT, TARGET_DV, TAX, WORKING_RATE, DERIVED, coldBrewFlows } from './case.js?v=28';
import { PERIODS } from '../f03/case.js?v=28';
import * as CF from '../../../core/corpfin.js?v=28';
import { npv, irr } from '../../../core/invest.js?v=28';

const { rf, mrp, smallFirm } = MARKET;
const rD = DEBT.termLoan.rate, rDat = rD * (1 - TAX);
const rE = DERIVED.targetCostOfEquity, W = DERIVED.targetWacc;
const capmOnly = rf + DERIVED.targetBeta * mrp;
const W0 = (1 - TARGET_DV) * capmOnly + TARGET_DV * rDat;           // without the size premium
const deT = TARGET_DV / (1 - TARGET_DV);
// Lantern’s book values, 31 December 2027 (F03)
const B = PERIODS[2027];
const bookDV = B.debt / (B.debt + B.equity);
// peers’ market debt shares
const peerDV = PEERS.map((p) => p.de / (1 + p.de));
const peerDVavg = peerDV.reduce((a, b) => a + b, 0) / peerDV.length;
// Lantern’s WACC at other debt shares, debt held at 7.5%
const waccAt = (dv) => { const b = CF.releverBeta(DERIVED.betaU, dv / (1 - dv), TAX); const e = rf + b * mrp + smallFirm; return CF.wacc({ E: 1 - dv, D: dv, rE: e, rD, tax: TAX }).wacc; };
// Cold Brew
const cb = coldBrewFlows().fcf;
const cbAt11 = npv(WORKING_RATE, cb), cbAtW = npv(W, cb), cbIrr = irr(cb);
// Fizzwell Drinks (fictional listed canned-drinks maker): the pure play for Cold Brew
const FZ = { beta: 1.40, de: 0.20 };
const fzU = CF.unleverBeta(FZ.beta, FZ.de, TAX), fzL = CF.releverBeta(fzU, deT, TAX);
const fzE = rf + fzL * mrp + smallFirm, fzW = CF.wacc({ E: 1 - TARGET_DV, D: TARGET_DV, rE: fzE, rD, tax: TAX }).wacc;
const cbAtFz = npv(fzW, cb);
// Wren Valley Storage (fictional listed battery-storage installer), $ millions
const WV = { shares: 12, price: 18.5, face: 90, bondPrice: 1.04, rE: 0.12, ytm: 0.064, bookE: 140 };
const wvE = WV.shares * WV.price, wvD = WV.face * WV.bondPrice;
const wvM = CF.wacc({ E: wvE, D: wvD, rE: WV.rE, rD: WV.ytm, tax: TAX });
const wvB = CF.wacc({ E: WV.bookE, D: WV.face, rE: WV.rE, rD: WV.ytm, tax: TAX });
// Wren Valley flotation: $20m at 70% equity / 30% debt, 5% and 1%
const fA = 0.7 * 0.05 + 0.3 * 0.01, gross = 20 / (1 - fA);
// Northmoor Group (fictional): water division 60% of value at 6.5%, hotels 40% at 12.0%
const NM = { wW: 0.6, rW: 0.065, rH: 0.12, irrW: 0.075, irrH: 0.10 };
const nmW = NM.wW * NM.rW + (1 - NM.wW) * NM.rH;
const infl = 0.025, realW = (1 + W) / (1 + infl) - 1;

const svgRisk = `<svg viewBox="0 0 440 320" role="img" xmlns="http://www.w3.org/2000/svg">
  <g fill="none" stroke="var(--rule-strong)" stroke-width="1.5"><path d="M60 270 H425"/><path d="M60 270 V30"/></g>
  <path d="M60 210 L420 60" fill="none" stroke="var(--series-1)" stroke-width="3"/>
  <path d="M60 150 H420" fill="none" stroke="var(--series-2)" stroke-width="3" stroke-dasharray="8 6"/>
  <circle cx="350" cy="122" r="7" fill="var(--series-3)"/>
  <circle cx="115" cy="172" r="7" fill="var(--series-3)"/>
  <g font-size="14" fill="var(--ink)">
    <text x="420" y="44" text-anchor="end">Required return for the risk</text>
    <text x="420" y="176" text-anchor="end">Firm’s WACC</text>
    <text x="362" y="127">A</text>
    <text x="127" y="196">B</text>
    <text x="242" y="298" text-anchor="middle">Systematic risk of the project (beta)</text>
    <text x="22" y="150" text-anchor="middle" transform="rotate(-90 22 150)">Return</text>
  </g>
</svg>`;

export default {
  slug: 'weighted-average-cost-of-capital',
  title: 'The weighted average cost of capital',
  blurb: 'Combine the costs of debt and equity into one rate with market-value or target weights, estimate Lantern’s WACC, and learn when that rate is the wrong one: projects riskier or safer than the firm, flotation costs, and the usual mistakes.',
  status: 'draft',
  objectives: [
    'Calculate the weighted average cost of capital from the costs of debt, preferred stock and equity and their market-value weights.',
    'Explain why market-value or target weights are used rather than book values, and choose weights for a private firm.',
    'Calculate Lantern’s WACC at its 20% target debt share and compare it with Ana’s 11% working rate.',
    'Explain why the WACC suits only projects as risky as the firm, and estimate a project’s rate with the pure-play approach.',
    'Identify common WACC mistakes, including double-counting interest and mixing nominal and real rates, and allow for flotation costs.',
  ],
  prerequisites: [
    { lesson: 'f05/cost-of-debt-and-equity', why: 'The after-tax cost of debt, the cost of equity from the CAPM and the unlevered and relevered betas.' },
    { lesson: 'f05/project-cash-flows', why: 'Project free cash flows leave interest out; this lesson shows where financing enters instead.' },
    { lesson: 'f03/solvency-and-leverage', why: 'Lantern’s debt and equity at book value at the end of 2027.' },
    { lesson: 'f04/inflation-and-real-returns', why: 'Nominal and real rates, and why they must match the cash flows.' },
  ],
  case: 'lantern',

  concept: [
    { case: 'Ana now has two rates for Lantern: lenders require 7.5% before tax on new long-term debt (5.63% after tax), and she estimates that she, as the only shareholder, requires 12.75% (9.75% from the CAPM plus a 3% premium for size). A new project will be paid for with a mix of both, in the proportions Lantern aims to keep: 20% debt, 80% equity. What return must the project earn to pay both groups what they require?' },
    { p: 'The answer is the <g>weighted average cost of capital</g> (WACC): the costs of the firm’s sources of capital, each weighted by its share of the firm’s value. If 80% of every dollar invested comes from equity requiring 12.75% and 20% from debt costing 5.63% after tax, the dollar must earn' },
    { math: String.raw`\text{WACC} = 0.80 \times 12.75\% + 0.20 \times 5.63\% = 10.20\% + 1.13\% = 11.33\%` },
    { p: 'A project that earns exactly 11.33% after tax pays the lenders their interest, saves the tax the interest deducts, and leaves Ana exactly the 12.75% she requires on her share. Earning more creates value for her; earning less destroys it. That is why the WACC is the <g>discount rate</g> for the free cash flows of module 1: those cash flows leave interest out (financing enters through the rate instead), and they are the cash available to all the investors together.' },
    { p: 'Lantern’s 11.33% is close to the 11% working rate Ana has used since module 1, so nothing she has concluded so far changes. Cold Brew’s NPV falls from $25,737 at 11% to $24,992 at 11.33%, still comfortably positive, and its IRR of 27.1% is far above either rate. The closeness is partly luck: the estimate rests on several judgements, the largest being the 3% premium. Without it, the WACC would be 8.93%.' },
    { table: {
      caption: 'Lantern’s WACC at its target weights (fictional figures)',
      head: ['Source', 'Weight', 'Cost', 'After tax', 'Weight × cost'],
      align: ['l', 'r', 'r', 'r', 'r'],
      rows: [
        ['Equity (CAPM 9.75% + 3% premium)', '80%', '12.75%', '12.75%', '10.20%'],
        ['Debt (Coastline’s rate for new five-year money)', '20%', '7.50%', '5.63%', '1.13%'],
      ],
      foot: [['WACC', '100%', '', '', '11.33%']],
      note: 'Equity from the peer betas relevered at D/E 0.25, as in the previous lesson. The weights are Ana’s target, not today’s balance sheet.',
    } },
    { callout: 'key', title: 'The WACC is the right rate only for an average project', html: 'The WACC is the return investors require on the firm as a whole: on its existing mix of activities, financed in its target mix. It is the right discount rate for a project only if the project is about as risky as the firm’s existing business and is financed in the same proportions. A riskier project needs a higher rate, a safer one a lower rate, whatever the firm’s WACC.' },
  ],

  theory: [
    { h: 'The formula and its weights' },
    { p: 'With debt <m>D</m>, preferred stock <m>P</m> and common equity <m>E</m>, the firm’s value is <m>V = D + P + E</m> and' },
    { math: String.raw`\text{WACC} = \dfrac{E}{V}\,r_E + \dfrac{P}{V}\,r_P + \dfrac{D}{V}\,r_D(1 - T)` },
    { p: 'Only the debt term carries <m>(1 - T)</m>, because only interest is deductible. Each cost is a market rate from the previous lesson, and each weight is a share of the firm’s value. The weights must add to 100%. Short-term operating liabilities such as payables and accrued wages are left out: they carry no explicit interest, and their cost is already in the operating cash flows (a supplier who gives credit charges for it in its prices).' },
    { h: 'Market-value weights, not book values' },
    { p: 'The weights should be <b>market values</b>, because the required returns belong to the market values. A shareholder who could sell her shares for $222 million wants 12% on $222 million, not on the $140 million the balance sheet records. Book equity is a historical figure: the money shareholders paid in plus the profits kept, measured by accounting rules. It ignores what the firm’s future cash flows are worth, so for a profitable firm it is usually far below market value (F00 compared the two as the <g>market-to-book ratio</g>). For debt, the two are often close, because loans are recorded at what is owed and market rates have not usually moved far; for bonds issued years ago they can differ, and the market value is the price.' },
    { p: 'Wren Valley Storage, a fictional listed battery-storage installer, has 12 million shares trading at $18.50, so its equity is worth $222.0 million; its book equity is $140 million. Its bonds have a face value of $90 million and trade at 104% of face, $93.6 million. At market values debt is 29.7% of the firm; at book values it would be 39.1%. With a 12% cost of equity and a 6.4% yield (4.8% after tax), the WACC is 9.86% at market weights and 9.18% at book weights. Book weights put too much weight on the cheaper source and understate the cost.' },
    { p: 'Lantern shows the problem in a stronger form. At 31 December 2027 its interest-bearing debt was $65,250 and its book equity $62,818 (F03), so at book values debt would be 50.9% of its capital. But $62,818 records only the $20,000 Ana paid in and the profits Lantern has kept; it says nothing about what a business earning $22,431 after tax in its second year is worth. Lantern has no share price, so the market value of its equity cannot be read off a screen, and its book weights are a poor guide to the risks its investors bear.' },
    { h: 'Target weights' },
    { p: 'Even for a listed firm, today’s market weights move with the share price every day, and the firm may be in the middle of borrowing or repaying. A project lasting years is financed over years, so most analysts use <b>target weights</b>: the mix of debt and equity, at market values, that the firm aims to keep over the long run. A firm’s own statements of policy, its history, and its peers’ structures are the evidence for the target.' },
    { p: 'For a private firm, the target is the only practical choice. Lantern’s listed peers carry debt of 23.1%, 13.0% and 35.5% of their market value (D/E of 0.30, 0.15 and 0.55), an average of 23.9%. Ana aims for 20%: a little below the peers, reflecting her caution as an owner with most of her wealth in the business. Using the target keeps the WACC consistent with the beta, which was relevered at the same D/E of 0.25.' },
    { p: 'Lantern’s line of credit is a judgement call. It is meant to finance seasonal working capital rather than long-lived projects (it stood at $24,000 at the end of 2027, after two draws, and that $24,000 is part of the $65,250 above), so this course leaves it out. An analyst who saw it drawn permanently would treat it as long-term debt and include it at its 9%.' },
    { h: 'How the WACC changes with the debt share' },
    { p: 'Move Lantern’s target and both costs move. More debt raises the relevered beta, and so the cost of equity; at a fixed 7.5% cost of debt, the WACC falls slowly, from 11.88% with no debt to 11.33% at 20% and 11.05% at 30%, because more of the firm is financed by debt whose interest saves tax. (The widget below assumes Coastline would charge more above 25% debt, which gives about 11.28% at 30% instead.) That fall does not continue for ever: lenders charge more as debt grows, and the risk and costs of financial distress rise. The capital-structure lesson in module 4 asks whether, and how far, borrowing more adds value.' },

    { h: 'One rate for the firm, or a rate for each project?' },
    { p: 'The WACC reflects the average risk of everything the firm already does. A project is worth taking if it earns more than investors would require <i>for that project’s risk</i>, which may differ from the firm’s average. Investors who buy a coffee company’s shares don’t require the same return on a new canned-drinks line as on its cafés, just because the same company owns both.' },
    { figure: { svg: svgRisk,
      caption: 'Using one rate for every project. Project A is risky and earns more than the firm’s WACC but less than its risk requires: one rate accepts it wrongly. Project B is safe and earns less than the WACC but more than its risk requires: one rate rejects it wrongly.',
      alt: 'A chart with the project’s systematic risk (beta) on the horizontal axis and return on the vertical axis. A solid line rises from left to right: the return required for each level of risk. A dashed horizontal line marks the firm’s WACC; the two cross in the middle, at the firm’s average risk. Point A lies on the right, at high risk, above the dashed WACC line but below the rising required-return line. Point B lies on the left, at low risk, below the WACC line but above the required-return line.' } },
    { p: 'A firm that applies its WACC to every project accepts too many risky projects (like A) and rejects too many safe ones (like B). Over time it drifts towards riskier activities, and its WACC rises with them. The remedy is to give each project a rate that matches its own systematic risk. Three ways are used in practice:' },
    { list: [
      '<b>The <g>pure-play approach</g>.</b> Find listed firms that do only what the project does, unlever their betas, and relever at the firm’s target D/E: the method of the previous lesson, applied to the project instead of the firm.',
      '<b>A <g>divisional cost of capital</g>.</b> A firm with distinct divisions estimates a rate for each from its own peers, and every project in a division uses the division’s rate.',
      '<b>Risk classes.</b> Some firms set the WACC for average projects and adjust it by fixed amounts for classes of project: lower for cost-saving replacements, higher for new products or new markets. The adjustments are judgements, but cruder errors are avoided.',
    ] },
    { p: 'Only systematic risk belongs in the rate. A project whose sales are uncertain but unrelated to the economy needs careful cash-flow forecasts and sensitivity analysis, not a higher rate; raising the rate for every worry counts the same risk twice (the project-risk lesson in module 2 explains why).' },
    { p: 'Is Cold Brew as risky as the cafés? It is a packaged drink sold through grocers to people who may never visit a Lantern café, with heavy promotion in a crowded category. Its natural peers are not coffee shops but drinks makers. Fizzwell Drinks, a fictional listed maker of canned drinks, has an equity beta of 1.40 at a D/E of 0.20. Unlevered, its business beta is 1.217, well above the coffee peers’ 0.850, and the pure-play method gives Cold Brew a rate of 13.25% (worked below). At that rate Cold Brew’s NPV is $20,875, smaller than at Lantern’s WACC but still positive; its IRR of 27.1% clears both. The decision survives the higher rate, which is what Ana needed to know.' },

    { h: 'Flotation costs' },
    { p: 'Raising new money costs money: underwriters’ fees and the <g>underwriting spread</g> for public issues, lenders’ arrangement fees, legal and accounting costs. These are <g>flotation costs</g>: for example, a few percent of the amount raised for new shares, and less for a bank loan. There are two ways to allow for them. One raises the cost of capital, for example by using the net proceeds per share, <m>P_0(1 - f)</m>, in the dividend growth model. The other, often recommended, leaves the WACC alone and adds the flotation costs to the project’s initial outlay, because they are a cash cost of this project, paid once, not a cost that recurs every year.' },
    { p: 'For the second method, average the flotation cost rates with the target weights, <m>f_A = \\tfrac{E}{V} f_E + \\tfrac{D}{V} f_D</m>, and gross up the amount needed. Wren Valley needs $20 million for a new plant and finances at a target of 70% equity and 30% debt, with flotation costs of 5% on equity and 1% on debt: <m>f_A = 0.7 \\times 5\\% + 0.3 \\times 1\\% = 3.8\\%</m>. To net $20 million it must raise <m>20 \\div (1 - 0.038) = 20.79</m> million dollars, so the project’s outlay is $20.79 million, not $20 million. The Lantern examples in these lessons leave flotation costs out.' },
    { h: 'Nominal and real' },
    { p: 'The costs in the WACC are market rates, and market rates include expected inflation: Lantern’s 11.33% is a <b>nominal</b> rate. It must discount nominal cash flows, forecast in the dollars of each future year with prices and wages rising. If cash flows are forecast in today’s dollars (real terms), the rate must be real too: with 2.5% expected inflation (an assumption), <m>(1.1133 \\div 1.025) - 1 = 8.61\\%</m>. Mixing a nominal rate with real cash flows undervalues a typical project.' },
  ],

  formulas: [
    { id: 'wacc-def', name: 'Weighted average cost of capital',
      tex: String.raw`\text{WACC} = \dfrac{E}{V}\,r_E + \dfrac{P}{V}\,r_P + \dfrac{D}{V}\,r_D\,(1 - T), \qquad V = E + P + D`,
      where: [[String.raw`E, P, D`, 'Market values (or target values) of common equity, preferred stock and interest-bearing debt', '$'], [String.raw`V`, 'Their total: the value of the firm’s capital', '$'], [String.raw`r_E`, 'Cost of equity', '% per year'], [String.raw`r_P`, 'Cost of preferred stock', '% per year'], [String.raw`r_D`, 'Cost of debt before tax (yield on new debt)', '% per year'], [String.raw`T`, 'Tax rate', '']],
      assumptions: 'The project is as risky as the firm and is financed in the same proportions, kept over its life; the firm can use the interest deduction.',
      note: 'Drop the P term when there is no preferred stock. Use the rate for discounting free cash flows, which exclude interest.' },
    { id: 'wacc-pure-play', name: 'A project’s rate by the pure-play approach',
      tex: String.raw`\beta_{\text{project}} = \beta_{U,\text{peer}}\left[1 + (1 - T)\dfrac{D}{E}\right], \qquad r_{\text{project}} = \dfrac{E}{V}\left(r_f + \beta_{\text{project}}\,\text{MRP}\right) + \dfrac{D}{V}\,r_D(1 - T)`,
      where: [[String.raw`\beta_{U,\text{peer}}`, 'Unlevered beta of listed firms that do only what the project does', ''], [String.raw`\beta_{\text{project}}`, 'That beta relevered at the firm’s target debt-to-equity ratio', ''], [String.raw`D/E, D/V, E/V`, 'The firm’s target ratios at market value', ''], [String.raw`r_f, \text{MRP}`, 'Risk-free rate and market risk premium', '% per year'], [String.raw`r_D`, 'The firm’s cost of debt before tax', '% per year'], [String.raw`T`, 'Tax rate', ''], [String.raw`r_{\text{project}}`, 'The discount rate for the project’s free cash flows', '% per year']],
      assumptions: 'The peers’ business risk matches the project’s; the project is financed at the firm’s target mix. Add any extra premium the firm applies to equity.' },
    { id: 'wacc-flotation', name: 'Flotation costs: the weighted rate and the grossed-up amount',
      tex: String.raw`f_A = \dfrac{E}{V} f_E + \dfrac{D}{V} f_D, \qquad \text{Amount raised} = \dfrac{\text{Amount needed}}{1 - f_A}`,
      where: [[String.raw`f_E, f_D`, 'Flotation costs as a share of the amount raised, for equity and for debt', ''], [String.raw`E/V, D/V`, 'Target weights', ''], [String.raw`f_A`, 'Weighted average flotation cost', '']],
      assumptions: 'New money is raised in the target proportions; the difference between the two amounts is added to the project’s outlay.' },
    { id: 'wacc-real', name: 'Real WACC from nominal',
      tex: String.raw`1 + \text{WACC}_{\text{real}} = \dfrac{1 + \text{WACC}_{\text{nominal}}}{1 + i}`,
      where: [[String.raw`\text{WACC}_{\text{nominal}}`, 'The WACC from market rates', '% per year'], [String.raw`i`, 'Expected inflation rate', '% per year'], [String.raw`\text{WACC}_{\text{real}}`, 'The rate for cash flows forecast in today’s prices', '% per year']],
      assumptions: 'Discount nominal cash flows at the nominal rate, real at the real rate; never mix them.' },
  ],

  examples: [
    { level: 'simple', title: 'Wren Valley Storage at market and book weights', fictional: true,
      setup: 'Wren Valley Storage has 12 million shares at $18.50 and book equity of $140 million. Its bonds, face value $90 million, trade at 104% of face and yield 6.4%. Its cost of equity is 12% and its tax rate 25%. Find its WACC with market-value weights, and with book weights for comparison.',
      steps: [
        'Market values: equity <m>12 \\times 18.50 = 222.0</m> million dollars; debt <m>90 \\times 1.04 = 93.6</m> million; total 315.6 million.',
        'Weights: equity <m>222.0 \\div 315.6 = 70.3\\%</m>, debt <m>93.6 \\div 315.6 = 29.7\\%</m>.',
        'After-tax cost of debt: <m>6.4\\% \\times 0.75 = 4.8\\%</m>. WACC <m>= 0.703 \\times 12\\% + 0.297 \\times 4.8\\% = 9.86\\%</m>.',
        'At book values (equity $140 million, debt $90 million) debt would be 39.1% of the total and the WACC <m>0.609 \\times 12\\% + 0.391 \\times 4.8\\% = 9.18\\%</m>.',
      ],
      answer: 'WACC 9.86% at market weights; book weights would give 9.18%.',
      interpretation: 'The market values the equity well above its book value, so book weights overstate the share of cheap debt and understate the cost of capital by 0.68 points: enough to accept projects that destroy value.' },
    { level: 'challenging', title: 'A rate for Cold Brew from a pure play', fictional: true,
      setup: 'Fizzwell Drinks, a fictional listed canned-drinks maker, has an equity beta of 1.40 and a D/E of 0.20, taxed at 25%. Use it as the pure play for Cold Brew, with Lantern’s target (20% debt, D/E 0.25), Coastline’s 7.5%, a 4.2% risk-free rate, a 5.5% market risk premium and Ana’s 3% premium. Does Cold Brew still have a positive NPV?',
      steps: [
        'Unlever Fizzwell: <m>1.40 \\div (1 + 0.75 \\times 0.20) = 1.40 \\div 1.15 = 1.217</m>, the business risk of canned drinks, against 0.850 for the coffee peers.',
        'Relever at Lantern’s D/E of 0.25: <m>1.217 \\times 1.1875 = 1.446</m>.',
        'Cost of equity for Cold Brew: <m>4.2\\% + 1.446 \\times 5.5\\% + 3\\% = 15.15\\%</m>.',
        'Project rate: <m>0.80 \\times 15.15\\% + 0.20 \\times 5.63\\% = 13.25\\%</m>.',
        'Discount Cold Brew’s free cash flows (from the project-cash-flows lesson) at 13.25%: NPV <m>\\approx</m> $20,875, against $24,992 at Lantern’s WACC of 11.33% (both at the unrounded rates).',
      ],
      answer: 'Cold Brew’s rate is about 13.25%, almost 2 points above Lantern’s WACC; its NPV stays positive, at about $20,875.',
      interpretation: 'Treating Cold Brew as an average Lantern project would understate its risk, but here the error does not change the decision: the IRR of 27.1% clears any reasonable rate. A project closer to the line could have flipped.' },
    { level: 'applied', title: 'Northmoor Group’s two divisions', fictional: true,
      setup: 'Northmoor Group (fictional) owns a regulated water business, 60% of its value, whose pure-play rate is 6.5%, and a hotels business, 40%, whose rate is 12.0%. The board has two proposals: renewing water mains, with an IRR of 7.5%, and refurbishing a hotel, with an IRR of 10.0%. Both are typical of their divisions. Which should it accept?',
      steps: [
        'The group’s WACC is the value-weighted average of the divisions’ rates: <m>0.6 \\times 6.5\\% + 0.4 \\times 12.0\\% = 8.7\\%</m>.',
        'Against the group’s 8.7%: the hotel’s 10.0% passes and the water mains’ 7.5% fails. The group would refurbish the hotel and leave the mains.',
        'Against each division’s own rate: the water mains earn 7.5%, above the 6.5% their risk requires; the hotel earns 10.0%, below the 12.0% its risk requires.',
        'Each project should be judged at the rate for its own risk: accept the mains, reject the refurbishment.',
      ],
      answer: 'Accept the water mains (7.5% against 6.5%) and reject the hotel refurbishment (10.0% against 12.0%); the group WACC gets both wrong.',
      interpretation: 'A single group rate penalises the safe division and subsidises the risky one. Repeated across many decisions, it shifts the group towards hotels, raises its risk and its WACC, and wastes the water division’s low cost of capital.' },
  ],

  demo: [
    { widget: 'wacc-lantern', intro: 'The peer betas relevered at each debt share, with Ana’s 3% premium. Start at the 20% target (WACC 11.33%). Push the debt share up: the cost of equity climbs, and above 25% the cost of debt steps up too (illustrative rates). Notice how flat the WACC is over a wide range of targets.' },
    { widget: 'wacc-project', intro: 'A rate for one project from a pure-play peer. The starting values are Fizzwell Drinks as Cold Brew’s peer. Lower the peer beta to the coffee peers’ level and the rate falls to about Lantern’s WACC; raise it and watch Cold Brew’s NPV shrink. Push the peer beta to its maximum: does Cold Brew’s NPV ever turn negative? (Its IRR is 27.1%.)' },
    { widget: 'wacc-calc', intro: 'Enter any firm’s market values and costs. Try Wren Valley’s figures with its book equity instead of its market value, and see the WACC fall.' },
  ],

  mistakes: [
    { title: 'Using the firm’s WACC for every project', html: 'The WACC is the rate for a project as risky as the firm’s existing business. Using it for a riskier project accepts it too easily; for a safer one, rejects it too easily. Estimate a rate from the project’s own peers (pure play), a divisional rate, or at least a risk class.' },
    { title: 'Weighting with book values', html: 'Book equity records past contributions and retained profits, not what the equity is worth. For a profitable firm it understates equity’s weight and so understates the WACC. Use market values or, for a private firm, a target mix consistent with the peers’ market-value structures.' },
    { title: 'Counting the cost of debt twice', html: 'Interest is a financing flow. If a project’s cash flows already deduct interest and are then discounted at the WACC, the cost of debt is charged twice: once in the cash flows and again in the rate. Leave interest out of free cash flow; the debt term in the WACC carries it.' },
    { title: 'Getting the tax on debt wrong', html: 'The debt cost in the WACC is after tax, <m>r_D(1 - T)</m>, because free cash flows compute tax on EBIT as if there were no interest. Using the pre-tax rate ignores the tax saving; taking the tax saving in the cash flows as well as in the rate counts it twice.' },
    { title: 'Mixing nominal and real', html: 'A WACC built from market rates is nominal. Discounting cash flows forecast in today’s prices at a nominal rate undervalues them; inflating cash flows and discounting at a real rate overvalues them. Match the two.' },
    { title: 'Weights that don’t match the beta', html: 'The relevered beta was computed at a D/E; the WACC must use the same mix. Relevering at 0.25 and then weighting debt at 40% mixes two capital structures and gives a rate no investor would require.' },
  ],

  application: [
    { p: '<b>Ana’s rates for 2028.</b> Ana adopts 11.33% as Lantern’s WACC for projects like its existing business: a café refit, kiosks that speed up café orders, equipment that replaces something it already uses. For Cold Brew she uses the pure-play 13.25%; for the solar panels, whose savings depend on electricity prices rather than coffee sales, she notes that the WACC is probably too high and that the decision there rests more on the cash flows than on the rate. She records each judgement, so that her accountant, and anyone she later asks for money, can see where each rate came from.' },
    { p: '<b>A capital budgeting manual.</b> In a larger firm the treasury publishes the rates once a year: a group WACC, a rate for each division from its own peers, and rules for exceptional projects (a new country, a new technology). Project teams cannot choose their own rate; they must justify a different one to the treasury. The point is consistency: two managers with the same project should reach the same answer, and a manager should not be able to make a project pass by choosing a lower rate.' },
    { p: '<b>Checking a valuation.</b> When an analyst reviews a business valuation built on discounted free cash flows, the WACC is one of the first things she tests. Are the weights market or target values, not book? Is the cost of debt a current yield, after tax? Does the beta’s D/E match the weights? Is any extra premium stated and defended? Are the rate and the cash flows both nominal? Each of these errors is common, and each can move a valuation by more than the forecasts do.' },
  ],

  summary: [
    'The WACC weights each source’s cost by its share of the firm’s value: (E/V) r_E + (P/V) r_P + (D/V) r_D(1 − T). It discounts free cash flows, which exclude interest.',
    'Use market-value weights, or target weights for the mix kept over the project’s life; book values understate equity for a profitable firm. Lantern’s book weights (50.9% debt) would mislead.',
    'Lantern at its 20% target: 0.80 × 12.75% + 0.20 × 5.63% = 11.33%, close to Ana’s 11% working rate; 8.93% without the size premium.',
    'The WACC suits only projects as risky as the firm. Use a pure-play peer, a divisional rate or a risk class for others: Cold Brew’s pure-play rate is about 13.25%, and its NPV stays positive.',
    'Treat flotation costs as part of a project’s outlay: gross up the amount needed by 1 − f_A.',
    'Avoid the common mistakes: one rate for every project, book weights, interest in the cash flows as well as the rate, the wrong tax treatment, nominal against real, and weights that don’t match the beta.',
  ],
  glossary: [
    { term: 'Weighted average cost of capital', def: 'The average of the costs of a firm’s sources of capital (equity, preferred stock and after-tax debt), each weighted by its share of the firm’s value: the return the firm must earn on an average-risk project to pay all its investors what they require. Abbreviated WACC.' },
    { term: 'Market-value weights', def: 'Shares of a firm’s capital measured at what each claim is worth in the market now, rather than at the amounts recorded in the balance sheet.' },
    { term: 'Target capital structure', def: 'The mix of debt and equity, at market values, that a firm aims to keep over the long run, used to weight its costs of capital.' },
    { term: 'Pure-play approach', def: 'Estimating a project’s cost of capital from listed firms that do only what the project does: their betas are unlevered, then relevered at the investing firm’s target mix.' },
    { term: 'Divisional cost of capital', def: 'A cost of capital estimated for one division of a firm from that division’s own business risk, used for the division’s projects instead of the firm’s overall WACC.' },
    { term: 'Flotation costs', def: 'The costs of issuing new securities or arranging new borrowing: underwriting fees and spreads, arrangement fees, legal and accounting costs.' },
  ],
  references: [
    { text: 'Dahlquist, J. &amp; Knight, R. (2022). <i>Principles of Finance</i>, section 17.3, “Calculating the Weighted Average Cost of Capital”. OpenStax.', url: 'https://openstax.org/books/principles-finance/pages/17-3-calculating-the-weighted-average-cost-of-capital', checked: '2026-11-05' },
    { text: 'Dahlquist, J. &amp; Knight, R. (2022). <i>Principles of Finance</i>, section 17.2, “The Costs of Debt and Equity Capital”. OpenStax.', url: 'https://openstax.org/books/principles-finance/pages/17-2-the-costs-of-debt-and-equity-capital', checked: '2026-11-05' },
    { text: 'Damodaran, A. (2015, 11 April). “The Small Cap Premium: Where is the beef?” <i>Musings on Markets</i>.', url: 'https://aswathdamodaran.blogspot.com/2015/04/the-small-cap-premium-fact-fiction-and.html', checked: '2026-11-05' },
  ],
  checks: [
    { what: 'Cost of new debt', value: rD * 100, shown: 7.5 },
    { what: 'After-tax cost of debt', value: rDat * 100, shown: 5.63 },
    { what: 'Cost of equity', value: rE * 100, shown: 12.75 },
    { what: 'CAPM part', value: capmOnly * 100, shown: 9.75 },
    { what: 'Premium', value: smallFirm * 100, shown: 3 },
    { what: 'Target equity weight', value: (1 - TARGET_DV) * 100, shown: 80 },
    { what: 'Target debt weight', value: TARGET_DV * 100, shown: 20 },
    { what: 'Equity contribution', value: (1 - TARGET_DV) * rE * 100, shown: 10.20 },
    { what: 'Debt contribution', value: TARGET_DV * rDat * 100, shown: 1.13 },
    { what: 'Lantern WACC', value: W * 100, shown: 11.33 },
    { what: 'Lantern WACC by hand equals case', value: ((1 - TARGET_DV) * rE + TARGET_DV * rDat) * 100, shown: 11.33 },
    { what: 'Working rate', value: WORKING_RATE * 100, shown: 11 },
    { what: 'Cold Brew NPV at 11%', value: cbAt11, shown: 25737, tol: 0.5 },
    { what: 'Cold Brew NPV at WACC', value: cbAtW, shown: 24992, tol: 0.5 },
    { what: 'Cold Brew IRR', value: cbIrr * 100, shown: 27.1, tol: 0.05 },
    { what: 'WACC without premium', value: W0 * 100, shown: 8.93 },
    { what: 'Target D/E', value: deT, shown: 0.25 },
    { what: 'Wren Valley equity value', value: wvE, shown: 222.0 },
    { what: 'Wren Valley bond value', value: wvD, shown: 93.6 },
    { what: 'Wren Valley total', value: wvE + wvD, shown: 315.6 },
    { what: 'Wren Valley equity weight', value: wvM.wE * 100, shown: 70.3, tol: 0.05 },
    { what: 'Wren Valley debt weight', value: wvM.wD * 100, shown: 29.7, tol: 0.05 },
    { what: 'Wren Valley book debt weight', value: wvB.wD * 100, shown: 39.1, tol: 0.05 },
    { what: 'Wren Valley book equity weight', value: wvB.wE * 100, shown: 60.9, tol: 0.05 },
    { what: 'Wren Valley after-tax debt', value: WV.ytm * 0.75 * 100, shown: 4.8 },
    { what: 'Wren Valley WACC market', value: wvM.wacc * 100, shown: 9.86 },
    { what: 'Wren Valley WACC book', value: wvB.wacc * 100, shown: 9.18 },
    { what: 'Wren Valley gap', value: (wvM.wacc - wvB.wacc) * 100, shown: 0.68, tol: 0.006 },
    { what: 'Wren Valley market equity above book', value: wvE > WV.bookE ? 1 : 0, shown: 1 },
    { what: 'Lantern debt 2027 (F03)', value: B.debt, shown: 65250 },
    { what: 'Lantern equity 2027 (F03)', value: B.equity, shown: 62818 },
    { what: 'Lantern book D/V', value: bookDV * 100, shown: 50.9, tol: 0.05 },
    { what: 'Lantern 2027 net income (F03)', value: PERIODS[2027].netIncome, shown: 22431 },
    { what: 'Ana paid in', value: B.equity - B.retainedEarnings, shown: 20000 },
    { what: 'Brightcup D/V', value: peerDV[0] * 100, shown: 23.1, tol: 0.05 },
    { what: 'Morrow D/V', value: peerDV[1] * 100, shown: 13.0, tol: 0.05 },
    { what: 'Harbour D/V', value: peerDV[2] * 100, shown: 35.5, tol: 0.05 },
    { what: 'Peer D/V average', value: peerDVavg * 100, shown: 23.9, tol: 0.05 },
    { what: 'Target below peer average', value: TARGET_DV < peerDVavg ? 1 : 0, shown: 1 },
    { what: 'Line of credit drawn', value: DEBT.lineOfCredit.drawn, shown: 24000 },
    { what: 'Line of credit rate', value: DEBT.lineOfCredit.rate * 100, shown: 9 },
    { what: 'WACC with no debt', value: waccAt(0) * 100, shown: 11.88 },
    { what: 'WACC at 30% debt', value: waccAt(0.3) * 100, shown: 11.05 },
    { what: 'WACC at 30% with debt at 8.5% (widget band)', value: (() => { const b = CF.releverBeta(DERIVED.betaU, 0.3 / 0.7, TAX); return CF.wacc({ E: 0.7, D: 0.3, rE: rf + b * mrp + smallFirm, rD: 0.085, tax: TAX }).wacc * 100; })(), shown: 11.28 },
    { what: 'WACC falls with debt at fixed rD', value: waccAt(0) > waccAt(0.2) && waccAt(0.2) > waccAt(0.3) ? 1 : 0, shown: 1 },
    { what: 'Fizzwell D/E', value: FZ.de, shown: 0.20 },
    { what: 'Fizzwell unlever denominator', value: 1 + 0.75 * FZ.de, shown: 1.15 },
    { what: 'Fizzwell unlevered', value: fzU, shown: 1.217, tol: 0.0005 },
    { what: 'Coffee peers unlevered', value: DERIVED.betaU, shown: 0.850, tol: 0.0005 },
    { what: 'Relever factor', value: 1 + 0.75 * deT, shown: 1.1875 },
    { what: 'Cold Brew relevered beta', value: fzL, shown: 1.446, tol: 0.0005 },
    { what: 'Cold Brew cost of equity', value: fzE * 100, shown: 15.15 },
    { what: 'Cold Brew rate', value: fzW * 100, shown: 13.25 },
    { what: 'Cold Brew NPV at pure-play rate', value: cbAtFz, shown: 20875, tol: 0.5 },
    { what: 'Cold Brew rate above WACC by almost 2 points', value: (fzW - W) * 100, shown: 1.92, tol: 0.006 },
    { what: 'IRR above pure-play rate', value: cbIrr > fzW ? 1 : 0, shown: 1 },
    { what: 'Flotation weighted', value: fA * 100, shown: 3.8 },
    { what: 'Gross amount', value: gross, shown: 20.79 },
    { what: 'Wren equity flotation', value: 5, shown: 5 },
    { what: 'Northmoor group WACC', value: nmW * 100, shown: 8.7 },
    { what: 'Northmoor hotel passes group rate', value: NM.irrH > nmW ? 1 : 0, shown: 1 },
    { what: 'Northmoor mains fail group rate', value: NM.irrW < nmW ? 1 : 0, shown: 1 },
    { what: 'Northmoor mains pass own rate', value: NM.irrW > NM.rW ? 1 : 0, shown: 1 },
    { what: 'Northmoor hotel fails own rate', value: NM.irrH < NM.rH ? 1 : 0, shown: 1 },
    { what: 'Real WACC', value: realW * 100, shown: 8.61 },
  ],
};
