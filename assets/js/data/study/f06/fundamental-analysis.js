// fundamental-analysis.js — F06 · Fundamental analysis. Content only; exercises are in fundamental-analysis.ex.js.
// Harbour Street Foods and Morrow & Pike Roasters (fictional) come from case.js (COMPANIES, BONDS, MARKET, SERIES);
// valuation pieces from core/investments.js. The market returns are SIMULATED (tools/study/f06-data.py). Quotations:
// Jones & Netter’s Econlib entry “Efficient Capital Markets”, the SEC’s investor bulletin on behavioural patterns
// (16 June 2014) and Barber & Odean (2000), all opened 11 November 2026. Brightcup Coffee is the project’s and is not
// analysed here.
import { COMPANIES, BONDS, MARKET, SERIES } from './case.js?v=31';
import * as IV from '../../../core/investments.js?v=31';
import DCF from './discounted-cash-flow-valuation.js?v=31';

const M = COMPANIES.morrow, H = COMPANIES.harbour;
const { rf, mrp } = MARKET;
const T = 0.25;
const ratios = (c) => ({
  ebitM: c.ebit / c.revenue, ebitdaM: c.ebitda / c.revenue, roe: c.netIncome / c.bookEquity,
  ic: c.bookEquity + c.debt - c.cash, roic: c.ebit * (1 - T) / (c.bookEquity + c.debt - c.cash),
  cover: c.ebit / c.interest, ndE: (c.debt - c.cash) / c.ebitda, capexDa: c.capex / c.da,
  conv: c.fcff / (c.ebit * (1 - T)), payout: c.dps / c.eps, reinv: (c.capex - c.da + c.dNwc) / (c.ebit * (1 - T)),
});
const RH = ratios(H), RM = ratios(M);
// Harbour Street’s WACC
const KH = IV.capm({ rf, beta: 1.25, mrp });
const HB = BONDS.find((b) => b.name.startsWith('Harbour'));
const hbPrice = IV.bondAtYield({ face: 100, couponRate: HB.couponRate, years: HB.years, freq: HB.freq }, HB.ytm).price;
const DEH = H.debt / H.marketCap, WDH = DEH / (1 + DEH), WEH = 1 - WDH;
const WH = WEH * KH + WDH * HB.ytm * (1 - T);
const WM = DCF.checks.find((c) => c.what === 'WACC').value / 100;
const nopH = H.ebit * (1 - T);
const perShare = (ev) => (ev - H.debt + H.cash) / H.shares;
// routes to a value
const noGrowth = perShare(nopH / WH);
const gH = (1 - RH.payout) * RH.roe;
const gordonPE = RH.payout * (1 + gH) / (KH - gH);
const gordonVal = gordonPE * H.eps;
const vd = (roic, g = 0.03, w = WH) => perShare(nopH * (1 + g) * (1 - g / roic) / (w - g));
const vd3 = vd(RH.roic);
const dcfH = (w, g) => { const d = IV.dcf({ fcf: [1, 2, 3, 4, 5].map((t) => H.fcff * 1.05 ** t), rate: w, g }); return { ...d, ps: perShare(d.value) }; };
const D0 = dcfH(WH, 0.03);
const dLo = dcfH(WH + 0.005, 0.025).ps, dHi = dcfH(WH - 0.005, 0.035).ps;
const peerEbitda = perShare(M.m.evEbitda * H.ebitda);
const reinvNeeded5 = 0.05 / RH.roic;
// what the price implies about the return on new investment (value driver, 3% growth)
const kPrice = H.m.ev * (WH - 0.03) / (nopH * 1.03);
const ronicImplied = 0.03 / (1 - kPrice);
const implied = (g) => { const k = H.m.ev * (WH - g) / (nopH * (1 + g)); return k < 1 ? g / (1 - k) : NaN; };
// margin of safety
const mos = 0.25, buyBelow = D0.ps * (1 - mos);
// weak-form check on the simulated market series
const r = SERIES.market;
const lag1 = IV.sampleCov(r.slice(0, -1), r.slice(1)).corr, nPairs = r.length - 1;
const tLag = lag1 * Math.sqrt(nPairs - 2) / Math.sqrt(1 - lag1 * lag1);

export default {
  slug: 'fundamental-analysis',
  title: 'Fundamental analysis',
  blurb: 'Read the business behind a share price: top-down and bottom-up analysis, the ratios that matter for value, quality of earnings, returns on capital against the cost of capital, and a margin of safety. Then weigh whether any of it can beat the market, what the efficient markets hypothesis and its anomalies say, and which of your own biases to watch.',
  status: 'draft',
  objectives: [
    'Distinguish top-down from bottom-up analysis and describe the steps of each.',
    'Analyse a company’s profitability, leverage, cash conversion and return on invested capital, and explain why return on capital against the cost of capital decides whether growth adds value.',
    'Combine DCF, multiples and a no-growth value into a range, and read what a market price implies.',
    'Apply a margin of safety to a value estimate.',
    'Explain the weak, semi-strong and strong forms of the efficient markets hypothesis, the main anomalies, and what they imply for an individual investor.',
    'Recognise familiarity bias and overconfidence in investment decisions.',
  ],
  prerequisites: [
    { lesson: 'f03/return-on-assets-and-equity', why: 'Return on equity and return on invested capital are defined there.' },
    { lesson: 'f03/cash-flow-and-earnings-quality', why: 'Quality of earnings, accruals and free cash flow.' },
    { lesson: 'f06/discounted-cash-flow-valuation', why: 'The DCF, PVGO and the consistency of growth and reinvestment.' },
    { lesson: 'f06/relative-valuation', why: 'Multiples, justified multiples and Harbour Street’s comparison with Morrow & Pike.' },
    { lesson: 'f06/funds-and-indexing', why: 'The evidence on active funds and the Northgate fund against its index.' },
  ],
  case: 'lantern',

  concept: [
    { case: 'Harbour Street Foods trades at 12.7 times its earnings, Morrow &amp; Pike at 18.0. An article Ana reads calls Harbour Street “the value pick in coffee”. The relative valuation lesson suggested that a low multiple may simply be a fair price for a riskier, less profitable company. This lesson reads Harbour Street the way an analyst would, from its accounts to a view on its price, and then asks a harder question: whether analysis like this can expect to beat the market at all. Harbour Street and every figure in its accounts are fictional.' },
    { p: '<g>Fundamental analysis</g> estimates what a share is worth from the business behind it: its markets, competitive position, management, accounts and prospects. Its output is an estimate of <g>intrinsic value</g> to compare with the price. It is the opposite of <g>technical analysis</g>, which looks for patterns in past prices and trading volume without reference to the business.' },
    { p: 'An analyst can work in either direction. <g>Top-down analysis</g> starts with the economy (growth, interest rates, inflation), moves to the industries that should do well or badly in it, and ends with the best companies in those industries. <g>Bottom-up analysis</g> starts with the company, often one the analyst knows well or found by a screen, and works outwards to check that the industry and economy do not undo the case. Most professionals use both: a top-down view sets the context, and bottom-up work decides what to buy.' },
    { p: 'The work has three parts. First, understand how the business makes money and how durable that is. Second, measure it: profitability, returns on capital, debt and the quality of its earnings. Third, turn that into a value, by DCF and by multiples, and compare it with the price, leaving a <g>margin of safety</g> for being wrong. Harbour Street takes us through all three.' },
    { callout: 'key', title: 'Growth is worth paying for only if it earns more than it costs', html: 'A company creates value when it earns a return on the capital it invests above the return its investors require. If its return on capital is below its cost of capital, every dollar it reinvests to grow is worth less than a dollar: growth destroys value. The single most useful number in fundamental analysis is the gap between the two.' },
  ],

  theory: [
    { h: 'Reading the company: Harbour Street against Morrow &amp; Pike' },
    { p: 'Harbour Street makes packaged food (coffee, snacks and frozen meals) and sells it through grocers. Its scale is large, its brands are established, and its markets grow slowly. Morrow &amp; Pike is a smaller speciality roaster. The F03 ratios, applied to their 2027 accounts, show two different businesses:' },
    { table: {
      caption: 'Harbour Street Foods and Morrow &amp; Pike Roasters, 2027 (fictional)',
      head: ['Measure', 'Harbour Street', 'Morrow &amp; Pike'],
      align: ['l', 'r', 'r'],
      rows: [
        ['EBIT margin', '7.4%', '12.1%'],
        ['EBITDA margin', '10.5%', '15.5%'],
        ['Return on equity', '10.3%', '12.0%'],
        ['Return on invested capital', '7.8%', '10.5%'],
        ['WACC', '8.77%', '8.49%'],
        ['Interest cover (EBIT ÷ interest)', '4.5×', '10.2×'],
        ['Net debt ÷ EBITDA', '2.75×', '1.17×'],
        ['Capital spending ÷ depreciation', '1.04', '1.31'],
        ['Free cash flow to the firm ÷ EBIT after tax', '93%', '83%'],
      ],
      note: 'Return on invested capital = EBIT × (1 − 25%) ÷ (book equity + debt − cash), on year-end figures. Harbour Street’s WACC is built below.',
    } },
    { p: 'Harbour Street’s margins are thinner, as a maker of packaged food selling to powerful grocers might expect, and it carries far more debt: net debt of 2.75 years of EBITDA and interest covered 4.5 times, against Morrow &amp; Pike’s 1.17 and 10.2. That debt makes its equity riskier, which is why its beta is 1.25.' },
    { h: 'Quality of earnings' },
    { p: 'Profit is worth what it turns into. F03’s tests of <g>earnings quality</g> ask whether reported profit arrives as cash, whether it will recur and how much it depends on estimates. Two checks are available here. Harbour Street’s free cash flow to the firm is 93% of its EBIT after tax: its operating profit turns into cash. And its capital spending is about equal to its depreciation (1.04 times), so depreciation is a fair charge for keeping the assets working and profit is not flattered by under-investment. Morrow &amp; Pike converts less (83%) because it spends more than its depreciation to grow, which is investment, not a warning sign. A full review would also read the cash flow statement for rising receivables or inventories, one-off gains and changes in accounting estimates (F03’s accruals ratio).' },
    { h: 'Returns on capital against the cost of capital' },
    { p: 'Harbour Street’s <g>return on invested capital</g> is <m>290 \\times 0.75 \\div (1{,}650 + 1{,}188 - 60) = 217.5 \\div 2{,}778 = 7.8\\%</m>. Its WACC, built as in the DCF lesson: cost of equity <m>4.2\\% + 1.25 \\times 5.5\\% = 11.08\\%</m>; cost of debt the 6.10% yield on its 2035 bond (a 5.5% coupon, trading at $96.62 per $100), 4.58% after tax; debt-to-equity 0.55 (F05’s, with debt at book value, close to market because the bond trades near par), so debt is 35.5% of value. WACC = <m>0.645 \\times 11.08\\% + 0.355 \\times 4.58\\% = 8.77\\%</m>.' },
    { p: 'Harbour Street earns 7.8% on capital that costs 8.77%. On its current returns it destroys a little value with every dollar it reinvests, and its return on equity (10.3%) is below its cost of equity (11.08%) too. Morrow &amp; Pike earns 10.5% against 8.49%. This is the deepest reason for the difference in their multiples, and the fundamental analyst’s main question about Harbour Street is whether its returns can rise.' },
    { p: 'The value-driver formula makes the point exact. A company that grows its after-tax operating profit at <m>g</m> for ever, reinvesting enough to earn return <m>\\text{RONIC}</m> on new capital, is worth' },
    { math: String.raw`\text{EV} = \dfrac{\text{NOPAT}_1\,\left(1 - g \div \text{RONIC}\right)}{\text{WACC} - g}` },
    { p: 'where NOPAT is EBIT after tax. With no growth, Harbour Street is worth <m>217.5 \\div 8.77\\% = 2{,}480.5</m> million, or <m>(2{,}480.5 - 1{,}188 + 60) \\div 120 = \\$11.27</m> a share. Growing 3% a year with new capital earning its current 7.8%, it is worth less: $10.56. Growth adds value only when RONIC is above the WACC.' },
    { h: 'From analysis to a range of values' },
    { p: 'Put the methods side by side, as an analyst’s “football field”:' },
    { table: {
      caption: 'Harbour Street: value per share by method (fictional)',
      head: ['Method', 'Value per share', 'What it assumes'],
      align: ['l', 'r', 'l'],
      rows: [
        ['No growth (NOPAT ÷ WACC)', '$11.27', 'Today’s profit, for ever'],
        ['Gordon-implied P/E (8.7 × EPS)', '$12.30', 'ROE stays at 10.3%'],
        ['DCF, free cash flow growing 5% for five years, then 3%', '$23.46', 'Growth with almost no extra investment'],
        ['DCF range (WACC ±0.5 points, terminal growth 2.5% to 3.5%)', '$19.04 to $29.73', 'The same, with the rate and growth varied'],
        ['Morrow &amp; Pike’s EV/EBITDA (10.66)', '$27.03', 'Harbour Street deserves a better company’s multiple'],
        ['Market price, 31 December 2027', '$18.00', ''],
      ],
      note: 'DCF: 2027 free cash flow to the firm of $202.5 million grown 5% a year, discounted at 8.77%, terminal growth 3%; enterprise value less debt $1,188 million plus cash $60 million, ÷ 120 million shares.',
    } },
    { p: 'The methods disagree by more than a factor of two, and the disagreement is informative. The two high values both assume that Harbour Street grows profitably without paying for it. The DCF grows free cash flow 5% a year while reinvesting only 6.9% of its operating profit; at a 7.8% return, 5% growth would need 64% of it. Morrow &amp; Pike’s multiple belongs to a business earning 10.5% on capital. The low values take today’s returns as permanent.' },
    { p: 'The price, $18.00, sits between them, and it can be read backwards. Holding 3% growth and the 8.77% WACC, Harbour Street’s $3,288 million enterprise value is what the value-driver formula gives if new investment earns 19.6%, two and a half times its current return. The figure is very sensitive to the growth assumed: at 3.5% growth it is about 15.2%, at 2.5% about 33.1%, and at 2% no return is high enough. It is also a crude, one-stage lens that has 3% growth start now. Even so, the market is not calling Harbour Street a bargain or a failure: it is betting on a turnaround in returns. An analyst’s view should say whether that is likely: a new management plan, a profitable brand, or costs that will fall, and evidence for each.' },
    { h: 'A margin of safety' },
    { p: 'Every value estimate is uncertain, so a disciplined investor buys only when the price is well below the estimate: the difference is the margin of safety, a cushion for being wrong. With a 25% margin on the $23.46 DCF value she would buy only below <m>0.75 \\times 23.46 = \\$17.60</m>, just under the price, and that DCF is the most generous estimate in the table. On the other methods there is no margin at all. The analysis does not say Harbour Street is a bad company; it says the price already asks for improvement.' },

    { h: 'Can analysis beat the market? The efficient markets hypothesis' },
    { p: 'If thousands of analysts do this work on every listed company, prices should already reflect what they find. The <g>efficient markets hypothesis</g> (EMH) states how much prices reflect, in three forms. As Jones and Netter summarise them: in a weak-form efficient market “future returns cannot be predicted from past returns or any other market-based indicator”; in a semi-strong efficient market “prices reflect all publicly available information about economic fundamentals”; and in the strong form, which they describe as mainly a limiting case, “prices reflect all public and private information”.' },
    { p: 'The forms say which analysis can pay. Weak-form efficiency rules out profits from technical analysis; semi-strong efficiency rules out profits from fundamental analysis of public information too. That does not make fundamental analysis pointless: someone has to do it for prices to be efficient, and an investor still needs it to know what she owns, to avoid overpaying in a mania and to judge a fund. It means an individual should not expect to earn more than the market from it, after costs, without an edge others lack.' },
    { p: 'The simulated data in this course were built with no month-to-month memory: each month’s market excess return was drawn independently, apart from the planted 2020 and 2022 episodes. As a check, the correlation between one month’s return and the next over the 180 months is 0.09, with a t-statistic of 1.22 on 177 degrees of freedom, not significantly different from zero. On real data, tests of this kind are the weak-form evidence; do not read anything about real markets into this simulated one, and check any claim about real history against published series such as Damodaran’s annually updated historical returns on US stocks, bonds and bills.' },
    { p: 'The evidence on real markets is mixed. Researchers have found <g>market anomalies</g>: patterns that a simple risk model does not explain. Jones and Netter describe “the tendency of small-capitalization stocks to earn excessive returns, especially in January”, which many economists now treat as a premium for illiquidity, and momentum: shares with high or low returns over three to twelve months tended to continue in the same direction for the following three to twelve months (Jegadeesh and Titman, 1993, as they report). They also note Fama’s observation that anomalies often disappear with a different period or method. Whether an anomaly is a mispricing or a reward for a risk the model misses is usually disputed. The funds lesson shows the practical test: most professionally managed funds do not beat their index after fees, which is what a nearly efficient market predicts.' },
    { h: 'Your own biases' },
    { p: 'Behavioural finance studies the systematic ways real investors depart from the rational investor of the theory. Two matter most for someone in Ana’s position. The SEC’s Office of Investor Education and Advocacy lists <g>familiarity bias</g> among the patterns that can hurt investors: the tendency to “favor investments from the investor’s own country, region, state or company”. People who work in an industry feel they understand its shares, which makes them overweight it. But their income already depends on that industry, so its shares add to a risk they already carry, and knowing a business as a customer or competitor is not the same as knowing whether its price is right.' },
    { p: 'The second is <g>overconfidence</g>: believing one’s information and judgement are better than they are. Barber and Odean studied 66,465 US households’ brokerage accounts from 1991 to 1996 and found that “those that trade most earn an annual return of 11.4 percent, while the market returns 17.9 percent”; they conclude that “Overconfidence can explain high trading levels and the resulting poor performance of individual investors.” The defence is procedural: write down why you are buying, what value you estimate and what would prove you wrong before you act, and compare the result with an index fund afterwards.' },
  ],

  formulas: [
    { id: 'fun-roic', name: 'Return on invested capital',
      tex: String.raw`\text{ROIC} = \dfrac{\text{EBIT}\,(1 - T)}{\text{Book equity} + \text{Debt} - \text{Cash}}`,
      where: [[String.raw`\text{EBIT}`, 'Earnings before interest and taxes', '$'], [String.raw`T`, 'Tax rate', ''], [String.raw`\text{Book equity}`, 'Shareholders’ equity in the balance sheet', '$'], [String.raw`\text{Debt}, \text{Cash}`, 'Interest-bearing debt and cash', '$']],
      assumptions: 'Year-end figures here; averages of opening and closing capital are common. Definitions vary (F03).' },
    { id: 'fun-value-driver', name: 'Value-driver formula',
      tex: String.raw`\text{EV} = \dfrac{\text{NOPAT}_1\,\left(1 - g \div \text{RONIC}\right)}{\text{WACC} - g}`,
      where: [[String.raw`\text{EV}`, 'Enterprise value', '$'], [String.raw`\text{NOPAT}_1`, 'Next year’s after-tax operating profit, EBIT × (1 − T)', '$'], [String.raw`g`, 'Growth of NOPAT, for ever', '% per year'], [String.raw`\text{RONIC}`, 'Return on new invested capital', '% per year'], [String.raw`\text{WACC}`, 'Weighted average cost of capital', '% per year']],
      assumptions: 'Constant growth and returns for ever; g ÷ RONIC is the share of NOPAT reinvested. With RONIC = WACC the value equals NOPAT₁ ÷ WACC whatever the growth.' },
    { id: 'fun-mos', name: 'Margin of safety',
      tex: String.raw`\text{Margin of safety} = 1 - \dfrac{P}{V}, \qquad \text{buy only if } P \le V\,(1 - m)`,
      where: [[String.raw`P`, 'Market price', '$'], [String.raw`V`, 'Estimated intrinsic value', '$'], [String.raw`m`, 'The margin the investor requires', '']],
      assumptions: 'The size of m is the investor’s judgement of how uncertain V is.' },
  ],

  examples: [
    { level: 'simple', title: 'Harbour Street’s return on invested capital', fictional: true,
      setup: 'In 2027 Harbour Street Foods earned EBIT of $290 million and paid tax at 25%. At the year end it had book equity of $1,650 million, debt of $1,188 million and cash of $60 million. What was its return on invested capital, and how does it compare with its 8.77% WACC?',
      steps: [
        'After-tax operating profit: <m>290 \\times (1 - 0.25) = \\$217.5</m> million.',
        'Invested capital: <m>1{,}650 + 1{,}188 - 60 = \\$2{,}778</m> million, the money lenders and shareholders have put into the operations.',
        'ROIC: <m>217.5 \\div 2{,}778 = 7.8\\%</m>.',
        'Against the WACC: <m>7.8\\% - 8.77\\% = -0.9</m> points.',
      ],
      answer: 'About 7.8%, roughly 0.9 points below the WACC.',
      interpretation: 'On its current returns, Harbour Street earns slightly less than its investors require. Reinvesting at those returns would lower its value, so the analyst’s question is whether returns will rise.' },
    { level: 'challenging', title: 'What Harbour Street’s price assumes', fictional: true,
      setup: 'Harbour Street’s enterprise value at the $18.00 price is $3,288 million. Its 2027 NOPAT was $217.5 million and its WACC is 8.77%. If NOPAT grows 3% a year for ever, what return on new investment does the price imply? Compare with its current 7.8%.',
      steps: [
        'Next year’s NOPAT: <m>217.5 \\times 1.03 = 224.0</m> million.',
        'Value-driver formula: <m>3{,}288 = 224.0 \\times (1 - 0.03 \\div \\text{RONIC}) \\div (0.0877 - 0.03)</m>.',
        'So <m>1 - 0.03 \\div \\text{RONIC} = 3{,}288 \\times 0.0577 \\div 224.0 = 0.847</m>, and the share reinvested is 15.3%.',
        'Solve: <m>\\text{RONIC} = 0.03 \\div 0.153 = 19.6\\%</m>.',
      ],
      answer: 'The price implies new investment earning about 19.6%, two and a half times the current 7.8%.',
      interpretation: 'The market is pricing a turnaround: either much better returns on new investment or growth from somewhere the accounts do not yet show. An analyst who cannot name the source has no reason to think the shares are cheap at $18.00.' },
    { level: 'applied', title: 'An analyst’s view on Harbour Street', fictional: true,
      setup: 'An analyst (fictional) at a pension fund must recommend buy, hold or sell on Harbour Street at $18.00, using the football field in the lesson and a 25% margin of safety.',
      steps: [
        'Rank the estimates: no growth $11.27; Gordon P/E $12.30; DCF $23.46 (range $19.04 to $29.73); Morrow &amp; Pike’s multiple $27.03.',
        'Discard what is inconsistent: the DCF grows free cash flow 5% with reinvestment of 6.9% of NOPAT, but at a 7.8% return 5% growth needs 64%. Morrow &amp; Pike’s multiple belongs to a more profitable business.',
        'Margin of safety: even on the generous DCF, a 25% margin means buying below $17.60. On the other estimates the price is above value.',
        'What would change the view: evidence that returns on new investment will rise well above the cost of capital, such as a credible plan to cut costs or a fast-growing brand.',
      ],
      answer: 'Hold (or do not buy): the price already assumes a large improvement in returns, and there is no margin of safety on any estimate.',
      interpretation: 'The view is conditional and says so: it names the assumption that would make Harbour Street worth more and the evidence that would prove it. A fund that already owns the shares might keep them while watching for that evidence; a new buyer has no cushion.' },
  ],

  demo: [
    { widget: 'fun-growth', intro: 'Harbour Street’s value from the value-driver formula. Start at its current return on new investment (7.8%) and raise growth: the value falls, because growth costs more than it earns. Then raise the return above the WACC and watch growth start adding value. Find the return that makes the value equal the $18.00 price.' },
    { widget: 'fun-field', intro: 'The football field: each method’s value per share against the price. Read it with the table in the lesson: the bars differ because their assumptions differ.' },
  ],

  mistakes: [
    { title: 'Calling a low multiple a bargain', html: 'Harbour Street’s P/E is lower than Morrow &amp; Pike’s because it earns less on its capital, carries more debt and grows more slowly. A low multiple is a bargain only if the business is better than the multiple implies; find out why it is low first.' },
    { title: 'Valuing growth without asking what it earns', html: 'Growth adds value only when new investment earns more than the cost of capital. Harbour Street growing 3% at its current 7.8% return is worth less than Harbour Street not growing ($10.56 against $11.27).' },
    { title: 'Averaging methods that disagree', html: 'When a DCF says $23 and a no-growth value says $11, the average ($17) answers no question. Find the assumption that separates them (here, the return on new investment) and decide what you believe about it.' },
    { title: 'Reading efficiency as “prices are always right”', html: 'The efficient markets hypothesis says it is hard to profit from information others have, not that prices equal intrinsic value at every moment. Prices can be wrong; the hypothesis says you are unlikely to know in which direction more reliably than everyone else.' },
    { title: 'Mistaking familiarity for knowledge', html: 'Knowing a company’s shops, products or people says little about whether its share price is right: the market knows those things too. And owning shares in the industry you work in adds to a risk your income already carries.' },
  ],

  application: [
    { p: '<b>A pension fund’s analyst.</b> An equity analyst covering consumer companies writes an initiation note on each new company: the business and its industry, five years of ratios against peers, quality-of-earnings checks, a DCF with sensitivities, a multiples comparison and a recommendation that states the key assumption and what would change it. Her fund’s portfolio managers care less about her target price than about that assumption.' },
    { p: '<b>A company’s own board.</b> Boards use the same tools from the inside. A food company whose return on capital is below its WACC has a reason to stop expanding into new categories until returns improve, and to explain to shareholders how it will get there. Analysts outside the company will run the value-driver arithmetic whether management does or not.' },
    { p: '<b>Ana’s own rules.</b> Ana does not plan to pick shares for her retirement account; the funds lesson and the evidence on active management point her towards index funds. What fundamental analysis gives her is a way to test a story, including one she tells herself about a company she knows: how it earns money, whether its returns beat its cost of capital, what its price assumes, and how much room for error she has. She keeps a written note for any share she considers, with the value she estimates, the margin she requires and what would prove her wrong.' },
  ],

  summary: [
    'Fundamental analysis estimates intrinsic value from the business; technical analysis looks only at prices and volume.',
    'Top-down: economy, industry, company. Bottom-up: company first, then check the context. Professionals use both.',
    'Read profitability, leverage, cash conversion and earnings quality, and above all ROIC against the WACC: Harbour Street 7.8% against 8.77%; Morrow & Pike 10.5% against 8.49%.',
    'Value-driver: EV = NOPAT₁ (1 − g ÷ RONIC) ÷ (WACC − g). Growth adds value only when RONIC exceeds the WACC.',
    'Combine methods by finding the assumption that separates them. Harbour Street’s $18.00 price implies new investment earning about 19.6%.',
    'A margin of safety (buy only well below estimated value) protects against error in the estimate.',
    'EMH: weak (past prices), semi-strong (all public information), strong (all information). Anomalies exist but are disputed and often fade.',
    'Watch familiarity bias and overconfidence: write down the case and what would prove it wrong before buying.',
  ],
  glossary: [
    { term: 'Fundamental analysis', def: 'Estimating a security’s intrinsic value from the business behind it: its industry, competitive position, management, financial statements and prospects.' },
    { term: 'Technical analysis', def: 'Trying to predict price movements from patterns in past prices and trading volume, without reference to the business.' },
    { term: 'Top-down analysis', def: 'Investment analysis that starts with the economy, moves to the industries likely to do well in it and ends with companies within them.' },
    { term: 'Bottom-up analysis', def: 'Investment analysis that starts with individual companies and then checks that their industry and the economy support the case.' },
    { term: 'Margin of safety', def: 'The gap between an asset’s estimated intrinsic value and the price paid for it, required as a cushion against errors in the estimate.' },
    { term: 'Efficient markets hypothesis', def: 'The proposition that market prices fully reflect available information, in weak (past market data), semi-strong (all public information) or strong (all public and private information) form. Abbreviated EMH.' },
    { term: 'Market anomaly', def: 'A pattern in security returns that a standard model of risk and return does not explain, such as the small-firm or momentum effects.' },
    { term: 'Familiarity bias', def: 'The tendency of investors to favour investments they know, such as those of their own country, region, employer or industry, at the expense of diversification.' },
    { term: 'Overconfidence', def: 'Overestimating the accuracy of one’s own information and judgement, which in investing leads to excessive trading and under-diversification.' },
  ],
  references: [
    { text: 'Jones, S. L. &amp; Netter, J. M. “Efficient Capital Markets”. <i>The Concise Encyclopedia of Economics</i>. Library of Economics and Liberty (Econlib).', url: 'https://www.econlib.org/library/Enc/EfficientCapitalMarkets.html', checked: '2026-11-11' },
    { text: 'Dahlquist, J. &amp; Knight, R. (2022). <i>Principles of Finance</i>, section 11.5, “Efficient Markets”. OpenStax.', url: 'https://openstax.org/books/principles-finance/pages/11-5-efficient-markets', checked: '2026-11-11' },
    { text: 'US Securities and Exchange Commission, Office of Investor Education and Advocacy (2014, 16 June). <i>Investor Bulletin: Behavioral Patterns of U.S. Investors</i>. Investor.gov.', url: 'https://investor.gov/additional-resources/news-alerts/alerts-bulletins/investor-bulletin-behavioral-patterns-us-investors', checked: '2026-11-11' },
    { text: 'Barber, B. M. &amp; Odean, T. (2000). Trading is hazardous to your wealth: the common stock investment performance of individual investors. <i>The Journal of Finance</i>, 55(2).', url: 'https://faculty.haas.berkeley.edu/odean/papers%20current%20versions/individual_investor_performance_final.pdf', checked: '2026-11-11' },
    { text: 'Damodaran, A. <i>Historical Returns on Stocks, Bonds and Bills</i> (data page, updated 5 January 2026). NYU Stern.', url: 'https://pages.stern.nyu.edu/~adamodar/New_Home_Page/datafile/histretSP.html', checked: '2026-11-11' },
  ],
  checks: [
    { what: 'H P/E', value: H.m.pe, shown: 12.7, tol: 0.05 },
    { what: 'M P/E', value: M.m.pe, shown: 18.0, tol: 0.05 },
    { what: 'H EBIT margin', value: RH.ebitM * 100, shown: 7.4, tol: 0.05 },
    { what: 'M EBIT margin', value: RM.ebitM * 100, shown: 12.1, tol: 0.05 },
    { what: 'H EBITDA margin', value: RH.ebitdaM * 100, shown: 10.5, tol: 0.05 },
    { what: 'M EBITDA margin', value: RM.ebitdaM * 100, shown: 15.5, tol: 0.05 },
    { what: 'H ROE', value: RH.roe * 100, shown: 10.3, tol: 0.05 },
    { what: 'M ROE', value: RM.roe * 100, shown: 12.0, tol: 0.05 },
    { what: 'H ROIC', value: RH.roic * 100, shown: 7.8, tol: 0.05 },
    { what: 'M ROIC', value: RM.roic * 100, shown: 10.5, tol: 0.05 },
    { what: 'H WACC', value: WH * 100, shown: 8.77 },
    { what: 'M WACC (DCF lesson)', value: WM * 100, shown: 8.49 },
    { what: 'H cover', value: RH.cover, shown: 4.5, tol: 0.05 },
    { what: 'M cover', value: RM.cover, shown: 10.2, tol: 0.05 },
    { what: 'H net debt/EBITDA', value: RH.ndE, shown: 2.75 },
    { what: 'M net debt/EBITDA', value: RM.ndE, shown: 1.17 },
    { what: 'H capex/DA', value: RH.capexDa, shown: 1.04 },
    { what: 'M capex/DA', value: RM.capexDa, shown: 1.31 },
    { what: 'H conversion', value: RH.conv * 100, shown: 93, tol: 0.5 },
    { what: 'M conversion', value: RM.conv * 100, shown: 83, tol: 0.5 },
    { what: 'H beta', value: 1.25, shown: 1.25 },
    { what: 'H NOPAT', value: nopH, shown: 217.5 },
    { what: 'H EBIT', value: H.ebit, shown: 290 },
    { what: 'H book equity', value: H.bookEquity, shown: 1650 },
    { what: 'H debt', value: H.debt, shown: 1188 },
    { what: 'H cash', value: H.cash, shown: 60 },
    { what: 'H invested capital', value: RH.ic, shown: 2778 },
    { what: 'H cost of equity', value: KH * 100, shown: 11.08 },
    { what: 'H bond yield', value: HB.ytm * 100, shown: 6.10 },
    { what: 'H bond coupon', value: HB.couponRate * 100, shown: 5.5 },
    { what: 'H bond price', value: hbPrice, shown: 96.62 },
    { what: 'H bond yield from price', value: IV.bondYield({ face: 100, couponRate: HB.couponRate, years: HB.years, freq: HB.freq }, 96.62) * 100, shown: 6.10 },
    { what: 'H after-tax debt', value: HB.ytm * (1 - T) * 100, shown: 4.58, tol: 0.006 },
    { what: 'H D/E', value: DEH, shown: 0.55 },
    { what: 'H D/V', value: WDH * 100, shown: 35.5, tol: 0.05 },
    { what: 'H E/V 3 dp', value: WEH, shown: 0.645, tol: 0.0005 },
    { what: 'H D/V 3 dp', value: WDH, shown: 0.355, tol: 0.0005 },
    { what: 'H ROIC − WACC', value: (RH.roic - WH) * 100, shown: -0.9, tol: 0.05 },
    { what: 'H ROE below cost of equity', value: RH.roe < KH ? 1 : 0, shown: 1 },
    { what: 'H no-growth EV', value: nopH / WH, shown: 2480.5, tol: 0.05 },
    { what: 'H no-growth per share', value: noGrowth, shown: 11.27 },
    { what: 'H value at 3% growth, RONIC = ROIC', value: vd3, shown: 10.56 },
    { what: 'Growth lowers H value', value: vd3 < noGrowth ? 1 : 0, shown: 1 },
    { what: 'H Gordon P/E', value: gordonPE, shown: 8.7, tol: 0.05 },
    { what: 'H Gordon value', value: gordonVal, shown: 12.30 },
    { what: 'H DCF', value: D0.ps, shown: 23.46 },
    { what: 'H DCF low', value: dLo, shown: 19.04 },
    { what: 'H DCF high', value: dHi, shown: 29.73 },
    { what: 'H FCFF 2027', value: H.fcff, shown: 202.5 },
    { what: 'M EV/EBITDA', value: M.m.evEbitda, shown: 10.66 },
    { what: 'H at Morrow multiple', value: peerEbitda, shown: 27.03 },
    { what: 'H price', value: H.price, shown: 18.00 },
    { what: 'H shares', value: H.shares, shown: 120 },
    { what: 'H reinvestment', value: RH.reinv * 100, shown: 6.9, tol: 0.05 },
    { what: 'H reinvestment needed at 5%', value: reinvNeeded5 * 100, shown: 64, tol: 0.5 },
    { what: 'Methods differ by more than two times', value: D0.ps / noGrowth > 2 ? 1 : 0, shown: 1 },
    { what: 'H EV', value: H.m.ev, shown: 3288 },
    { what: 'H NOPAT next year', value: nopH * 1.03, shown: 224.0, tol: 0.05 },
    { what: 'WACC − g', value: (WH - 0.03), shown: 0.0577, tol: 0.00005 },
    { what: 'Price-implied 1 − g/RONIC', value: kPrice, shown: 0.847, tol: 0.0005 },
    { what: 'Price-implied reinvestment share', value: (1 - kPrice) * 100, shown: 15.3, tol: 0.05 },
    { what: 'Price-implied RONIC', value: ronicImplied * 100, shown: 19.6, tol: 0.05 },
    { what: 'Two and a half times current ROIC', value: ronicImplied / RH.roic, shown: 2.5, tol: 0.05 },
    { what: 'Implied RONIC at 3.5%', value: implied(0.035) * 100, shown: 15.2, tol: 0.05 },
    { what: 'Implied RONIC at 2.5%', value: implied(0.025) * 100, shown: 33.1, tol: 0.05 },
    { what: 'No implied RONIC at 2%', value: Number.isNaN(implied(0.02)) ? 1 : 0, shown: 1 },
    { what: 'MoS buy-below', value: buyBelow, shown: 17.60 },
    { what: 'MoS buy-below under price', value: buyBelow < H.price ? 1 : 0, shown: 1 },
    { what: 'Average of DCF and no-growth about 17', value: (D0.ps + noGrowth) / 2, shown: 17, tol: 0.5 },
    { what: 'DCF about 23', value: D0.ps, shown: 23, tol: 0.5 },
    { what: 'No-growth about 11', value: noGrowth, shown: 11, tol: 0.3 },
    { what: 'Months', value: r.length, shown: 180 },
    { what: 'Lag-1 correlation', value: lag1, shown: 0.09, tol: 0.005 },
    { what: 'Lag-1 t', value: tLag, shown: 1.22 },
    { what: 'Lag-1 df', value: nPairs - 2, shown: 177 },
    { what: 'Lag-1 not significant at 5%', value: Math.abs(tLag) < 1.97 ? 1 : 0, shown: 1 },
    { what: 'Barber–Odean most active', value: 11.4, shown: 11.4 },
    { what: 'Barber–Odean market', value: 17.9, shown: 17.9 },
    { what: 'Barber–Odean households', value: 66465, shown: 66465 },
  ],
};
