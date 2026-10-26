// dupont-analysis.js — F03 · DuPont analysis. Content only; exercises are in dupont-analysis.ex.js.
// Lantern’s figures come from case.js (PERIODS) and the ratios from core/ratios.js (dupont), on the same averages so the
// product equals ROE exactly; checks recompute every printed number. Harbourline Roasters is F00’s fictional listed
// roaster (f00/case.js, $ millions, one year, closing balances). Starbucks’ figures are from its FY2024 Form 10-K.
// Other businesses are fictional: Ridgeline Outdoor (simple example).
import { PERIODS, FACTS, LEASE } from './case.js?v=19';
import * as R from '../../../core/ratios.js?v=19';
import { HARBOURLINE as HL, HARBOURLINE_DETAIL as HD } from '../f00/case.js?v=19';

const P26 = PERIODS[2026], P27 = PERIODS[2027];
const d26 = R.dupont(P26), d27 = R.dupont(P27, P26);
const t = FACTS.tax.rate;
// Harbourline (one year, closing)
const hl = R.dupont({ revenue: HL.revenue, netIncome: HL.netIncome, pretax: HD.profitBeforeTax, ebit: HL.ebit, totalAssets: HD.totalAssets, equity: HD.bookEquity });
// Starbucks FY2024 ($ millions)
const SB = { ni: 3760.9, rev: 36176.2, ta: [29445.5, 31339.3], eq: [-7994.8, -7448.9], gain2023: 91.3 };
const sb = R.dupont({ revenue: SB.rev, netIncome: SB.ni, totalAssets: SB.ta[1], equity: SB.eq[1] }, { totalAssets: SB.ta[0], equity: SB.eq[0] });
// change as factors (order-free)
const fM = d27.netMargin / d26.netMargin, fT = d27.assetTurnover / d26.assetTurnover, fL = d27.equityMultiplier / d26.equityMultiplier;
// sequential substitution, margin → turnover → multiplier
const s1 = d27.netMargin * d26.assetTurnover * d26.equityMultiplier, s2 = d27.netMargin * d27.assetTurnover * d26.equityMultiplier;
// …and the reverse order, multiplier → turnover → margin
const r1 = d26.netMargin * d26.assetTurnover * d27.equityMultiplier, r2 = d26.netMargin * d27.assetTurnover * d27.equityMultiplier;
// annualised 2026
const at26a = R.annualise(P26.revenue, P26.months) / P26.totalAssets;
// leases off the balance sheet (2027 only: 2026 had none)
const exLease = { ...P27, totalAssets: P27.totalAssets - P27.rightOfUse };
const dx = R.dupont(exLease, P26);
// research treated as one-off
const research = FACTS.research;
const niX = P27.netIncome + research * (1 - t);
const dr = R.dupont({ ...P27, netIncome: niX }, P26);
// Ridgeline Outdoor (simple)
const RO = { rev: 8_400_000, ni: 504_000, ta: [5_400_000, 6_600_000], eq: [2_300_000, 2_500_000] };
const roTA = (RO.ta[0] + RO.ta[1]) / 2, roEq = (RO.eq[0] + RO.eq[1]) / 2;
// Ana’s 2028 targets (application)
const tgt = { m: 0.06, at: 2.9, em: 3.5 };

export default {
  slug: 'dupont-analysis',
  title: 'DuPont analysis',
  blurb: 'Split return on equity into margin, asset turnover and leverage, in three steps and in five, so that you can say why returns moved, compare businesses built in different ways, and see what the decomposition hides.',
  status: 'reviewed',
  objectives: [
    'Calculate the three-step DuPont decomposition on average balances so that the product equals return on equity exactly.',
    'Calculate the five-step decomposition and explain what the tax burden and interest burden measure.',
    'Explain why Lantern’s return on equity fell from 2026 to 2027 by measuring how much each factor changed.',
    'Compare businesses with different strategies and capital structures through their DuPont factors.',
    'Identify what DuPont analysis hides: leases inflating the multiplier, one-off items in the margin, and negative equity.',
  ],
  prerequisites: [
    { lesson: 'f03/return-on-assets-and-equity', why: 'DuPont splits the return on equity defined there, on the same average balances.' },
    { lesson: 'f03/efficiency-and-working-capital', why: 'Asset turnover, the middle factor, comes from that lesson.' },
    { lesson: 'f03/solvency-and-leverage', why: 'The equity multiplier is a leverage ratio; that lesson explains how leases enter it.' },
  ],
  case: 'lantern',

  concept: [
    { case: 'Coastline Bank’s analyst has written that Lantern’s 2027 return on equity of 42.6% “held up only because of leverage”. Ana disagrees: revenue tripled, and the cafés are busy. They are arguing about a single number, which can’t settle it. Ana needs to know how much of the change came from profitability, how much from how hard Lantern worked its assets, and how much from borrowing.' },
    { p: '<g>DuPont analysis</g> answers that question by writing return on equity as a product of ratios that each measure one thing. It is named after the DuPont company; OpenStax’s <i>Principles of Finance</i> traces it to 1919, when DuPont began using it to measure its own performance. The idea is simple algebra. Multiply and divide net income over equity by revenue and by average total assets, and the extra terms cancel:' },
    { math: String.raw`\text{ROE} = \frac{\text{Net income}}{\text{Revenue}} \times \frac{\text{Revenue}}{\overline{\text{Total assets}}} \times \frac{\overline{\text{Total assets}}}{\overline{\text{Equity}}}` },
    { p: 'The first factor is the <b>net margin</b>: cents of profit per dollar of sales, a measure of profitability. The second is <b>asset turnover</b>: dollars of sales per dollar of assets, a measure of how intensively the business uses its resources (the efficiency lesson). The third is the <b>equity multiplier</b>: dollars of assets per dollar of equity, a measure of leverage (the solvency lesson). The first two together are return on assets; the third turns return on assets into return on equity, as the previous lesson showed.' },
    { callout: 'key', title: 'Use the same averages everywhere', html: 'The product equals ROE exactly only if the total assets in the turnover are the same figure as in the multiplier, and the equity in the multiplier is the equity in ROE. This course uses the average of opening and closing balances in all three (closing balances for Lantern’s first period, 2026). Mixing a closing-balance multiplier with an average-balance turnover gives a product that is close to ROE but not equal to it, and an argument about the difference that nobody can settle.' },
    { h: 'Lantern, 2026 and 2027' },
    { table: {
      caption: 'Lantern’s three-step DuPont decomposition (fictional figures). 2026: ten months, closing balances; 2027: averages.',
      head: ['Factor', '2026', '2027', '2027 ÷ 2026'],
      align: ['l', 'r', 'r', 'r'],
      rows: [
        ['Net margin', '14.2%', '3.9%', '× 0.274'],
        ['Asset turnover', '2.06', '2.74', '× 1.328'],
        ['Equity multiplier', '2.21', '4.01', '× 1.813'],
        ['Return on equity (the product)', '64.6%', '42.6%', '× 0.660'],
      ],
      note: '2027: 22,431 ÷ 577,860 = 3.88%; 577,860 ÷ 210,779.5 = 2.742; 210,779.5 ÷ 52,602.5 = 4.007. The factors are shown rounded; their unrounded product is the ROE.',
    } },
    { p: 'Read the last column as multipliers. The margin collapsed to about a quarter of its 2026 level: on its own that would have cut ROE from 64.6% to 17.7%. Turnover rose by a third, because the cafés added $236,000 of sales on assets that, apart from the leases, cost little. The equity multiplier rose by four fifths, because the leases, the line of credit and the brewer plan financed most of the new assets. Turnover and leverage together multiplied ROE by 2.41 (<m>1.328 \\times 1.813</m>), which offset most of the margin’s collapse: <m>0.274 \\times 2.41 = 0.660</m>.' },
    { p: 'So both Ana and the analyst are partly right. Lantern’s operations really did change: it now sells far more per dollar of assets. But it earns far less on each sale, and without the extra leverage its ROE would have been about 23.5% (<m>3.88\\% \\times 2.742 \\times 2.210</m>), not 42.6%. The next section splits the margin to find out where the profit went.' },
  ],

  theory: [
    { h: 'The five-step decomposition' },
    { p: 'The net margin mixes three things: how much profit operations make, how much of it goes to lenders as interest, and how much to the government as tax. The five-step version separates them by writing net income over revenue as three fractions, with income before tax and EBIT cancelling:' },
    { math: String.raw`\text{ROE} = \underbrace{\frac{\text{Net income}}{\text{Income before tax}}}_{\text{tax burden}} \times \underbrace{\frac{\text{Income before tax}}{\text{EBIT}}}_{\text{interest burden}} \times \underbrace{\frac{\text{EBIT}}{\text{Revenue}}}_{\text{EBIT margin}} \times \frac{\text{Revenue}}{\overline{\text{Total assets}}} \times \frac{\overline{\text{Total assets}}}{\overline{\text{Equity}}}` },
    { p: 'The <g>Tax burden</g> is the share of pretax profit the owners keep after income tax: one minus the effective tax rate. The <g>Interest burden</g> is the share of <g>EBIT</g> left after interest: 1.00 for a business with no debt, lower the more of its operating profit goes to lenders. The names are traditional but back to front: a higher “burden” is better, because more is kept. The EBIT margin is operating profitability before any financing or tax, the figure most comparable across businesses with different debts and tax positions.' },
    { table: {
      caption: 'Five-step decomposition: Lantern and Harbourline Roasters (fictional figures)',
      head: ['Factor', 'Lantern 2026', 'Lantern 2027', 'Harbourline'],
      align: ['l', 'r', 'r', 'r'],
      rows: [
        ['Tax burden', '0.75', '0.75', '0.76'],
        ['Interest burden', '0.97', '0.91', '0.82'],
        ['EBIT margin', '19.5%', '5.7%', '9.5%'],
        ['Asset turnover', '2.06', '2.74', '0.97'],
        ['Equity multiplier', '2.21', '4.01', '2.20'],
        ['Return on equity', '64.6%', '42.6%', '12.7%'],
      ],
      note: 'Lantern 2026 uses closing balances (ten months); 2027 uses averages. Harbourline (F00’s fictional listed roaster, $ millions) is shown for one year on closing balances: revenue 640, EBIT 61, income before tax 50, net income 38, total assets 660, equity 300.',
    } },
    { p: 'Lantern’s tax burden is exactly 0.75 in both years because the case taxes income before tax at a flat 25%; a real company’s burden moves with tax credits, foreign rates and items that are not deductible. Its interest burden fell from 0.97 to 0.91: interest rose from $1,200 to $2,879 (the line of credit and the brewer plan) while EBIT fell from $37,716 to $32,787. The real damage is in the EBIT margin, down from 19.5% to 5.7%. The cafés’ wages ($92,000), lease cost ($40,000) and depreciation, Ana’s salary ($48,000) and $21,000 of market research all arrived in 2027, and gross profit didn’t grow fast enough to carry them. The common-size lesson traces those lines; DuPont tells you that this is where to look.' },
    { callout: 'warn', title: 'The interest burden ignores interest inside the lease cost', html: 'Under ASC 842 an operating lease has a single straight-line lease cost in operating expenses, so the interest implicit in Lantern’s $40,000 café lease cost ($11,124 of it in 2027, on the case’s schedule) sits above EBIT. The interest burden of 0.91 therefore understates how much of Lantern’s operating profit is really a financing cost: treat the $11,124 as interest, so that EBIT becomes <m>32{,}787 + 11{,}124 = 43{,}911</m>, and the interest burden is <m>29{,}908 \\div 43{,}911 = 0.68</m>. Meanwhile while the equity multiplier counts the lease liabilities in full. The two factors treat the same leases differently.' },
    { h: 'Comparing the years fairly' },
    { p: 'Two caveats apply to the 2026 column. First, it uses closing balances, because there is no opening balance sheet; the previous lesson showed how much the basis can matter. Second, 2026 has ten months of revenue but a full closing balance sheet, so its asset turnover is understated: annualised, it is <m>193{,}320 \\times 12 \\div 10 \\div 93{,}676 = 2.48</m>, and ROE becomes 77.5%. Margin and the multiplier don’t change when you annualise, because a margin divides one flow by another and the multiplier divides one stock by another. On the annualised figures turnover rose only a little from 2026 to 2027 (2.48 to 2.74), and the case for leverage as the force holding ROE up gets stronger.' },
    { h: 'Measuring each factor’s contribution' },
    { p: 'Because ROE is a product, the cleanest way to describe a change is as a product too: <m>\\text{ROE}_{2027} = \\text{ROE}_{2026} \\times 0.274 \\times 1.328 \\times 1.813</m>. Each factor’s ratio says by how much it multiplied ROE, and the answer doesn’t depend on the order in which you take them. Analysts often want percentage points instead, and use sequential substitution: replace one factor at a time with its new value and record the change in ROE at each step.' },
    { table: {
      caption: 'Lantern, 2026 to 2027: sequential substitution in two orders (fictional figures, percentage points of ROE)',
      head: ['Factor', 'Margin first', 'Multiplier first'],
      align: ['l', 'r', 'r'],
      rows: [
        ['Net margin', '−46.9', '−113.0'],
        ['Asset turnover', '+5.8', '+38.5'],
        ['Equity multiplier', '+19.1', '+52.5'],
        ['Total change in ROE', '−22.0', '−22.0'],
      ],
    } },
    { p: 'The totals agree, but the split depends heavily on the order. When the factors change a lot, as Lantern’s did, each step multiplies the factors already changed, so whichever is taken later gets credit for the interaction. Report the order you used, or use the order-free ratios above. Either way the story is the same: the margin fell, and turnover and leverage made up some of the loss.' },
    { h: 'Comparing businesses' },
    { p: 'DuPont shows that the same ROE can be built in very different ways. A café and caterer like Lantern runs on thin margins and high turnover: it owns little and sells a lot. A roaster like Harbourline needs roasting plant and warehouses, so it turns its assets about once a year and needs a higher margin to earn a return. Harbourline’s ROA is <m>5.94\\% \\times 0.970 = 5.8\\%</m> against Lantern’s 10.6% in 2027, and its multiplier of 2.20 is close to Lantern’s 2026 level. Its five-step factors show the weight of its $210 million of debt: an interest burden of 0.82, lower than Lantern’s.' },
    { p: 'Starbucks shows where the method breaks down. In fiscal 2024 its net margin was 10.4% (<m>3{,}760.9 \\div 36{,}176.2</m>, net earnings attributable to Starbucks over total net revenues) and its asset turnover 1.19 (<m>36{,}176.2 \\div 30{,}392.4</m>, on average total assets), so ROA was 12.4%. But its shareholders’ equity was negative at both year ends, so the equity multiplier is <m>30{,}392.4 \\div (-7{,}721.85) = -3.94</m> and the product is −48.7%: the decomposition of a meaningless ROE. For a company with negative or tiny equity, stop at ROA, or use return on invested capital.' },
    { h: 'What DuPont hides' },
    { p: '<b>Leases move value between turnover and the multiplier.</b> Since ASC 842, an operating lease puts a right-of-use asset and a lease liability on the balance sheet. Lantern’s 2027 total assets include $173,379 of right-of-use assets. Take them out (and the equal lease liabilities with them), as an older balance sheet would have shown the cafés, and the 2027 decomposition becomes: net margin 3.9% (the lease cost is an operating expense either way), asset turnover 4.66, equity multiplier 2.36. ROE is still 42.6%, but the story changes: on that basis leverage barely rose (2.21 to 2.36), and turnover more than doubled. Much of what looks like a jump in leverage is the accounting for leases, which are a real obligation but a different one from a bank loan. When you compare companies, or a company before and after ASC 842, check how leases are treated before reading the multiplier.' },
    { p: '<b>One-off items sit in the margin.</b> DuPont takes net income as reported. Lantern’s $21,000 of market research in 2027 paid for the year’s surveys and studies; if Ana judges it a one-off, net income without it would have been <m>22{,}431 + 21{,}000 \\times 0.75 = 38{,}181</m>, a net margin of 6.6% and an ROE of 72.6%. Gains work the other way: Starbucks’ fiscal 2023 operating income included a $91.3 million gain on the sale of assets. Before reading a margin, look for such items in the income statement and its notes, and decide openly whether to remove them. The cash-flow-and-earnings-quality lesson adds a further question for Lantern: how much of 2027’s revenue has been earned but not yet billed.' },
    { p: '<b>The multiplier counts every liability, not just debt.</b> Supplier credit, wages owed and customer deposits raise the multiplier as much as a bank loan does, though they cost no interest and are part of normal trading. A business that collects cash in advance can have a high multiplier and little risk; one with the same multiplier made of short-term borrowing is far riskier. DuPont measures how much leverage there is, not what kind or how dangerous: read it with the solvency and liquidity ratios.' },
    { p: '<b>It says nothing about cash or risk.</b> A rising ROE can come with falling cash, as Lantern’s 2027 shows (cash fell from $42,940 to $6,531). And because the factors are book values, everything that affects the accounts (depreciation lives, what is capitalised, revenue estimates) flows through them.' },
  ],

  formulas: [
    { id: 'dupont-three-step', name: 'DuPont decomposition: three steps',
      tex: String.raw`\text{ROE} = \frac{\text{Net income}}{\text{Revenue}} \times \frac{\text{Revenue}}{\overline{\text{Total assets}}} \times \frac{\overline{\text{Total assets}}}{\overline{\text{Equity}}}`,
      where: [
        [String.raw`\text{Net income}`, 'Net income for the period (less preferred dividends, if any)', '$'],
        [String.raw`\text{Revenue}`, 'Net revenue for the period', '$'],
        [String.raw`\overline{\text{Total assets}}`, 'Total assets, average of opening and closing (closing when there is no opening balance sheet)', '$'],
        [String.raw`\overline{\text{Equity}}`, 'Equity, average of opening and closing (closing when there is no opening balance sheet)', '$'],
        [String.raw`\text{ROE}`, 'Return on equity', '%'],
      ],
      assumptions: 'The same average total assets in the turnover and the multiplier, so the product equals ROE exactly. Not meaningful when equity is negative.',
      note: 'Net margin × asset turnover × equity multiplier. Lantern 2027, factors unrounded to three figures: <m>3.88\\% \\times 2.742 \\times 4.007 = 42.6\\%</m>.' },
    { id: 'dupont-five-step', name: 'DuPont decomposition: five steps',
      tex: String.raw`\text{ROE} = \frac{\text{NI}}{\text{EBT}} \times \frac{\text{EBT}}{\text{EBIT}} \times \frac{\text{EBIT}}{\text{Revenue}} \times \frac{\text{Revenue}}{\overline{\text{Total assets}}} \times \frac{\overline{\text{Total assets}}}{\overline{\text{Equity}}}`,
      where: [
        [String.raw`\text{NI}`, 'Net income', '$'],
        [String.raw`\text{EBT}`, 'Earnings (income) before tax', '$'],
        [String.raw`\text{EBIT}`, 'Earnings before interest and taxes (Lantern: operating income)', '$'],
        [String.raw`\text{Revenue}`, 'Net revenue', '$'],
        [String.raw`\overline{\text{Total assets}}`, 'Total assets, average of opening and closing', '$'],
        [String.raw`\overline{\text{Equity}}`, 'Equity, average of opening and closing', '$'],
        [String.raw`\text{ROE}`, 'Return on equity', '%'],
      ],
      assumptions: 'EBIT and EBT positive; with a loss the burdens lose their meaning. Interest inside operating lease cost stays in EBIT.',
      note: 'Tax burden × interest burden × EBIT margin × asset turnover × equity multiplier. Lantern 2027: <m>0.75 \\times 0.912 \\times 5.674\\% \\times 2.742 \\times 4.007 = 42.6\\%</m>.' },
    { id: 'dupont-change-factors', name: 'A change in ROE as a product of factor changes',
      tex: String.raw`\frac{\text{ROE}_1}{\text{ROE}_0} = \frac{m_1}{m_0} \times \frac{a_1}{a_0} \times \frac{e_1}{e_0}`,
      where: [
        [String.raw`\text{ROE}_0,\ \text{ROE}_1`, 'Return on equity in the earlier and later period', '%'],
        [String.raw`m_0,\ m_1`, 'Net margin in each period', '%'],
        [String.raw`a_0,\ a_1`, 'Asset turnover in each period', ''],
        [String.raw`e_0,\ e_1`, 'Equity multiplier in each period', ''],
      ],
      assumptions: 'Both periods decomposed on a stated basis; the result doesn’t depend on the order of the factors.',
      note: 'Lantern, 2026 to 2027: <m>0.274 \\times 1.328 \\times 1.813 = 0.660</m>, and <m>64.6\\% \\times 0.660 = 42.6\\%</m>.' },
  ],

  examples: [
    { level: 'simple', title: 'An outdoor retailer’s three factors', fictional: true,
      setup: 'Ridgeline Outdoor, a fictional retailer of camping and climbing gear, had revenue of $8,400,000 and net income of $504,000 in 2027. Its total assets were $5,400,000 at the start of the year and $6,600,000 at the end; its equity $2,300,000 and $2,500,000. Decompose its return on equity into three factors, on average balances, and check the product.',
      steps: [
        'Net margin <m>= 504{,}000 \\div 8{,}400{,}000 = 6.0\\%</m>.',
        'Average total assets <m>= (5{,}400{,}000 + 6{,}600{,}000) \\div 2 = 6{,}000{,}000</m>; asset turnover <m>= 8{,}400{,}000 \\div 6{,}000{,}000 = 1.40</m>.',
        'Average equity <m>= (2{,}300{,}000 + 2{,}500{,}000) \\div 2 = 2{,}400{,}000</m>; equity multiplier <m>= 6{,}000{,}000 \\div 2{,}400{,}000 = 2.50</m>.',
        'Product: <m>6.0\\% \\times 1.40 \\times 2.50 = 21.0\\%</m>. Directly: <m>504{,}000 \\div 2{,}400{,}000 = 21.0\\%</m>. They agree because the same averages are used throughout.',
      ],
      answer: 'Net margin 6.0% × asset turnover 1.40 × equity multiplier 2.50 = ROE 21.0%.',
      interpretation: 'Ridgeline earns 6 cents on each dollar of sales, sells $1.40 a year for each dollar of assets (an ROA of 8.4%), and finances $2.50 of assets with each dollar of equity. To raise its ROE it could improve its margin, sell more from the same stores and stock, or borrow more; only the first two make the business better rather than riskier.' },
    { level: 'challenging', title: 'Why Lantern’s ROE fell: the five factors and their contributions', fictional: true,
      setup: 'Decompose Lantern’s ROE in five steps for both years, find which factors changed most, and measure each three-step factor’s contribution to the change from 64.6% to 42.6%, by the order-free ratios and by sequential substitution. Use the course’s bases: 2026 closing balances, 2027 averages.',
      steps: [
        'Tax burden: <m>27{,}387 \\div 36{,}516 = 0.75</m> and <m>22{,}431 \\div 29{,}908 = 0.75</m>, unchanged.',
        'Interest burden: <m>36{,}516 \\div 37{,}716 = 0.97</m> and <m>29{,}908 \\div 32{,}787 = 0.91</m>. EBIT margin: <m>37{,}716 \\div 193{,}320 = 19.5\\%</m> and <m>32{,}787 \\div 577{,}860 = 5.7\\%</m>. Turnover 2.06 and 2.74; multiplier 2.21 and 4.01. The products are 64.6% and 42.6%.',
        'Factor ratios, 2027 over 2026: net margin <m>3.88\\% \\div 14.17\\% = 0.274</m> (within it, the EBIT margin <m>5.7\\% \\div 19.5\\% = 0.29</m> and the interest burden <m>0.91 \\div 0.97 = 0.94</m>); turnover <m>2.742 \\div 2.064 = 1.328</m>; multiplier <m>4.007 \\div 2.210 = 1.813</m>. Check: <m>0.274 \\times 1.328 \\times 1.813 = 0.660 = 42.6\\% \\div 64.6\\%</m>.',
        'Sequential substitution, margin first: new margin with old turnover and multiplier gives 17.7%, a change of −46.9 points; then new turnover, 23.5%, +5.8 points; then new multiplier, 42.6%, +19.1 points. Total −22.0 points.',
        'Multiplier first: 117.1% (+52.5 points), then turnover, 155.6% (+38.5), then margin, 42.6% (−113.0). Same total, very different split.',
      ],
      answer: 'The EBIT margin is most of the story: it fell to × 0.29 of its 2026 level, which accounts for most of the × 0.274 fall in net margin; interest took a slightly larger share and tax was unchanged. Turnover (× 1.328) and leverage (× 1.813) offset most of it. In points, the split depends on the order: margin first gives −46.9, +5.8 and +19.1.',
      interpretation: 'The analyst’s claim survives the arithmetic: without the higher multiplier, Lantern’s ROE would have been 23.5%. Ana’s claim survives too: turnover rose. But the decisive change is operating profitability, which only cost control or higher prices and volumes in the cafés can fix. A sensible report gives the factor ratios, then one order of substitution, labelled.' },
    { level: 'applied', title: 'Lantern against a roaster and a giant', fictional: true,
      setup: 'Hollis Avery, the fictional investor F00 introduced, is considering a stake in Lantern in 2028. She asks how Lantern’s returns are built compared with Harbourline Roasters (F00’s fictional listed roaster) and with Starbucks (fiscal 2024, from its Form 10-K). Use the figures in this lesson.',
      table: {
        caption: 'Three-step factors (Lantern and Harbourline fictional; Starbucks from its FY2024 Form 10-K)',
        head: ['Factor', 'Lantern 2027', 'Harbourline', 'Starbucks FY2024'],
        align: ['l', 'r', 'r', 'r'],
        rows: [
          ['Net margin', '3.9%', '5.9%', '10.4%'],
          ['Asset turnover', '2.74', '0.97', '1.19'],
          ['Return on assets', '10.6%', '5.8%', '12.4%'],
          ['Equity multiplier', '4.01', '2.20', '−3.94'],
          ['Return on equity', '42.6%', '12.7%', 'not meaningful'],
        ],
        note: 'Lantern on averages; Harbourline on closing balances (one year only); Starbucks on averages of its FY2023 and FY2024 year ends, net earnings and equity attributable to Starbucks.',
      },
      steps: [
        'Margins: Starbucks keeps 10.4 cents per dollar of sales, Harbourline 5.9 and Lantern 3.9. Lantern’s is the thinnest, partly because of its year of opening costs.',
        'Turnover: Lantern sells $2.74 per dollar of assets, more than twice Starbucks’ 1.19 and nearly three times Harbourline’s 0.97, even with the cafés’ right-of-use assets on its balance sheet.',
        'ROA, with the factors unrounded: <m>3.88\\% \\times 2.742 = 10.6\\%</m> for Lantern, <m>5.94\\% \\times 0.970 = 5.8\\%</m> for Harbourline, <m>10.4\\% \\times 1.19 = 12.4\\%</m> for Starbucks. On this measure Lantern is between the two.',
        'Leverage: Lantern’s multiplier of 4.01 is nearly twice Harbourline’s; Starbucks’ is negative, so its ROE can’t be compared at all.',
      ],
      answer: 'Lantern’s ROA of 10.6% is respectable beside Harbourline’s 5.8% and Starbucks’ 12.4%, built on high turnover and a thin margin. Its ROE of 42.6% against Harbourline’s 12.7% is mostly leverage (4.01 against 2.20) and turnover; Starbucks’ ROE is not meaningful.',
      interpretation: 'For Hollis, the comparison says that Lantern’s high ROE should not be the reason to invest: compare ROA, and ask whether the margin can recover toward a level like Harbourline’s or Starbucks’ as the cafés mature. Scale matters too: a business with a few hundred thousand dollars of revenue is far more exposed to one bad season than a listed company, which the benchmarking lesson takes up.' },
  ],

  demo: [
    { widget: 'dup-lantern', intro: 'The three-step and five-step factors for Lantern, with Harbourline and Starbucks as peers. Take the leases off the balance sheet to see turnover and the multiplier trade places; treat the market research as a one-off to see the margin recover. Annualise 2026 to put its turnover on a full-year footing.' },
    { widget: 'dup-explain', intro: 'Set a margin, a turnover and a multiplier and compare the resulting ROE with Lantern’s 2026. The starting values are Lantern’s 2027 factors: try restoring the 2026 margin, or 2026 leverage, one at a time.' },
  ],

  mistakes: [
    { title: '“The product is close to ROE, so the bases don’t matter.”', html: 'If the turnover uses closing assets and the multiplier average assets, or the multiplier closing equity and ROE average equity, the product won’t equal ROE and the factors can’t be compared with each other. Use the same averages throughout so that the identity holds exactly.' },
    { title: '“A rising equity multiplier means the business borrowed more from the bank.”', html: 'The multiplier counts every liability: lease liabilities, supplier credit, wages owed, customer deposits. Most of Lantern’s 2027 increase came from the cafés’ lease liabilities. Look at what the liabilities are before calling the change borrowing, and use the solvency ratios to judge risk.' },
    { title: '“A higher interest burden is worse.”', html: 'The interest burden is income before tax over EBIT: the share of operating profit left after interest. 1.00 means no interest at all. Higher is better, despite the name; the same goes for the tax burden.' },
    { title: '“The order of substitution doesn’t matter.”', html: 'It does when factors change a lot. Lantern’s margin effect is −46.9 points if you change it first and −113.0 points if you change it last. State the order, or describe the change with the order-free factor ratios (× 0.274, × 1.328, × 1.813).' },
    { title: '“DuPont works for any company.”', html: 'With negative equity the multiplier is negative and the product meaningless, as Starbucks’ fiscal 2024 shows. With a loss, the burdens lose their meaning. In those cases decompose ROA (margin × turnover) and analyse leverage separately.' },
  ],

  application: [
    { p: '<b>The credit file.</b> Coastline Bank’s analyst puts the five-step table in Lantern’s file with one paragraph of interpretation: the EBIT margin, not volume, is the problem; interest takes a growing share; and the multiplier of 4.01 is mostly lease liabilities, which are fixed payments for five years. She also records the decomposition with the leases taken out, so that she can compare Lantern with older borrowers whose cafés were rented before ASC 842. Her recommendation turns on the margin: if it doesn’t recover in 2028, the leases and loans will be paid out of a shrinking cushion.' },
    { p: '<b>Setting targets.</b> Ana uses the decomposition to plan 2028. She doesn’t want more leverage, so she plans for a multiplier of about 3.5 as the line of credit is repaid; she expects turnover of about 2.9 with a full year of both cafés. Then the margin decides the outcome: at 6.0%, the 2028 ROE would be <m>6.0\\% \\times 2.9 \\times 3.5 = 60.9\\%</m>. Working backwards, she can ask what margin she needs for any return she wants, and which costs must fall to reach it. DuPont turns a single target into one for each lever she controls.' },
    { p: '<b>Comparing strategies.</b> An investor compares coffee businesses by asking how each makes its return: a premium roaster with high margins and slow turnover, a chain of small cafés with thin margins and fast turnover, a franchisor with almost no assets. None is wrong; each brings different risks. Two businesses with the same ROE may differ completely in how fragile that return is, and the multiplier, read with the leases, shows how much of the return the owners would lose if sales fell.' },
    { p: '<b>Checking any DuPont table.</b> Confirm that the factors multiply to the ROE quoted, that the bases are stated, that leases are treated consistently across the companies compared, that one-off items are identified, and that equity is positive and meaningful. Then the decomposition is a map of where to look next: the common-size statements for a margin, the efficiency ratios for turnover, the solvency ratios for leverage.' },
  ],

  summary: [
    'DuPont writes ROE = net margin × asset turnover × equity multiplier: profitability × efficiency × leverage. The first two make ROA.',
    'Use the same averages in every factor so the product equals ROE exactly. Lantern: 14.17% × 2.064 × 2.210 = 64.6% (2026, closing); 3.88% × 2.742 × 4.007 = 42.6% (2027, averages).',
    'Five steps split the net margin into tax burden × interest burden × EBIT margin. Lantern’s EBIT margin fell from 19.5% to 5.7%: the source of the decline. Higher burdens are better.',
    'Describe a change as a product of factor ratios (Lantern: × 0.274, × 1.328, × 1.813); sequential substitution in points depends on the order.',
    'Different business models reach their returns differently: Lantern by turnover and leverage, Harbourline with slow turnover, Starbucks with a higher margin but negative equity, where DuPont stops at ROA.',
    'DuPont hides how leases move value from turnover to the multiplier (Lantern without them: turnover 4.66, multiplier 2.36), one-off items in the margin, what kind of liabilities make up the multiplier, and cash.',
  ],

  glossary: [
    { term: 'DuPont analysis', def: 'The decomposition of return on equity into net margin × asset turnover × equity multiplier (three steps), or tax burden × interest burden × EBIT margin × asset turnover × equity multiplier (five steps), to show how much of a return comes from profitability, efficiency and leverage.' },
    { term: 'Tax burden', def: 'Net income divided by income before tax: the share of pretax profit the owners keep after income tax (one minus the effective tax rate). A factor of the five-step DuPont decomposition; higher is better.' },
    { term: 'Interest burden', def: 'Income before tax divided by EBIT: the share of operating profit left after interest expense (1.00 with no interest). A factor of the five-step DuPont decomposition; higher is better.' },
  ],

  references: [
    { text: 'Dahlquist, J. &amp; Knight, R. (2022). <i>Principles of Finance</i>, section 6.6, “Profitability Ratios and the DuPont Method” (the three-factor decomposition on average balances; the method’s origin at DuPont in 1919). OpenStax.', url: 'https://openstax.org/books/principles-finance/pages/6-6-profitability-ratios-and-the-dupont-method', checked: '2026-10-26' },
    { text: 'Damodaran, A. (2007). <i>Return on Capital (ROC), Return on Invested Capital (ROIC) and Return on Equity (ROE): Measurement and Implications</i>. NYU Stern School of Business, July 2007 (operating leases as debt; negative book equity).', url: 'https://pages.stern.nyu.edu/~adamodar/pdfiles/papers/returnmeasures.pdf', checked: '2026-10-26' },
    { text: 'Starbucks Corporation (2024). Form 10-K for the fiscal year ended 29 September 2024, Consolidated Statements of Earnings (SEC EDGAR financial report R3).', url: 'https://www.sec.gov/Archives/edgar/data/829224/000082922424000057/R3.htm', checked: '2026-10-26' },
    { text: 'Starbucks Corporation (2024). Form 10-K for the fiscal year ended 29 September 2024, Consolidated Balance Sheets (SEC EDGAR financial report R7).', url: 'https://www.sec.gov/Archives/edgar/data/829224/000082922424000057/R7.htm', checked: '2026-10-26' },
  ],

  checks: [
    // three-step, Lantern
    { what: 'Net margin 2026 %', value: d26.netMargin * 100, shown: 14.2, tol: 0.05 },
    { what: 'Net margin 2027 %', value: d27.netMargin * 100, shown: 3.9, tol: 0.05 },
    { what: 'Net margin 2027 % (2 dp)', value: d27.netMargin * 100, shown: 3.88, tol: 0.005 },
    { what: 'Net margin 2026 % (2 dp)', value: d26.netMargin * 100, shown: 14.17, tol: 0.005 },
    { what: 'Asset turnover 2026', value: d26.assetTurnover, shown: 2.06 },
    { what: 'Asset turnover 2027', value: d27.assetTurnover, shown: 2.74 },
    { what: 'Equity multiplier 2026', value: d26.equityMultiplier, shown: 2.21 },
    { what: 'Equity multiplier 2027', value: d27.equityMultiplier, shown: 4.01 },
    { what: 'ROE 2026 %', value: d26.roe * 100, shown: 64.6, tol: 0.05 },
    { what: 'ROE 2027 %', value: d27.roe * 100, shown: 42.6, tol: 0.05 },
    { what: 'Product = ROE 2027 (engine)', value: R.profitability(P27, P26).roe, shown: d27.roe, tol: 1e-12 },
    { what: 'Revenue 2027', value: P27.revenue, shown: 577860 },
    { what: 'Revenue 2026', value: P26.revenue, shown: 193320 },
    { what: 'Net income 2027', value: P27.netIncome, shown: 22431 },
    { what: 'Net income 2026', value: P26.netIncome, shown: 27387 },
    { what: 'Average total assets 2027', value: R.avg(P27, P26, 'totalAssets'), shown: 210779.5 },
    { what: 'Average equity 2027', value: R.avg(P27, P26, 'equity'), shown: 52602.5 },
    { what: 'Margin factor', value: fM, shown: 0.27 },
    { what: 'Turnover factor', value: fT, shown: 1.33 },
    { what: 'Multiplier factor', value: fL, shown: 1.81 },
    { what: 'ROE factor', value: d27.roe / d26.roe, shown: 0.66 },
    { what: 'Turnover × leverage factor', value: fT * fL, shown: 2.41 },
    { what: 'Factors multiply to ROE ratio', value: fM * fT * fL, shown: d27.roe / d26.roe, tol: 1e-12 },
    { what: 'Café sales', value: FACTS.cafes.sales, shown: 236000 },
    { what: 'ROE with 2027 margin, 2026 turnover and multiplier %', value: s1 * 100, shown: 17.7, tol: 0.05 },
    { what: 'ROE without extra leverage %', value: s2 * 100, shown: 23.5, tol: 0.05 },
    { what: 'Margin factor (3 dp)', value: fM, shown: 0.274, tol: 0.0005 },
    { what: 'Turnover factor (3 dp)', value: fT, shown: 1.328, tol: 0.0005 },
    { what: 'Multiplier factor (3 dp)', value: fL, shown: 1.813, tol: 0.0005 },
    { what: 'ROE factor (3 dp)', value: d27.roe / d26.roe, shown: 0.660, tol: 0.0005 },
    { what: 'Printed 0.274 × 1.328 × 1.813', value: 0.274 * 1.328 * 1.813, shown: 0.660, tol: 0.0005 },
    { what: 'Printed 1.328 × 1.813', value: 1.328 * 1.813, shown: 2.41 },
    { what: 'Printed 0.274 × 2.41', value: 0.274 * 2.41, shown: 0.660, tol: 0.0005 },
    { what: 'Printed 64.6 × 0.660', value: 64.6 * 0.660, shown: 42.6, tol: 0.05 },
    { what: 'Net margin 2027 (2 dp) for products', value: d27.netMargin * 100, shown: 3.88 },
    { what: 'Turnover 2027 (3 dp)', value: d27.assetTurnover, shown: 2.742, tol: 0.0005 },
    { what: 'Multiplier 2027 (3 dp)', value: d27.equityMultiplier, shown: 4.007, tol: 0.0005 },
    { what: 'Turnover 2026 (3 dp)', value: d26.assetTurnover, shown: 2.064, tol: 0.0005 },
    { what: 'Multiplier 2026 (3 dp)', value: d26.equityMultiplier, shown: 2.210, tol: 0.0005 },
    { what: 'Printed 3.88 × 2.742 × 4.007', value: 3.88 * 2.742 * 4.007, shown: 42.6, tol: 0.05 },
    { what: 'Printed 3.88 × 2.742 × 2.210', value: 3.88 * 2.742 * 2.210, shown: 23.5, tol: 0.05 },
    { what: 'Printed 14.17 × 2.064 × 2.210', value: 14.17 * 2.064 * 2.210, shown: 64.6, tol: 0.05 },
    { what: 'Printed 3.88 × 2.742 (ROA)', value: 3.88 * 2.742, shown: 10.6, tol: 0.05 },
    { what: 'Harbourline net margin (2 dp)', value: hl.netMargin * 100, shown: 5.94 },
    { what: 'Harbourline turnover (3 dp)', value: hl.assetTurnover, shown: 0.970, tol: 0.0005 },
    { what: 'Printed 5.94 × 0.970 (ROA)', value: 5.94 * 0.970, shown: 5.8, tol: 0.05 },
    { what: 'Printed 10.4 × 1.19 (Starbucks ROA)', value: 10.4 * 1.19, shown: 12.4, tol: 0.05 },
    { what: 'Printed 2.742 ÷ 2.064', value: 2.742 / 2.064, shown: 1.328, tol: 0.0005 },
    { what: 'Printed 4.007 ÷ 2.210', value: 4.007 / 2.210, shown: 1.813, tol: 0.0005 },
    { what: 'Printed 3.88 ÷ 14.17', value: 3.88 / 14.17, shown: 0.274, tol: 0.0005 },
    { what: 'Interest burden 2027 (3 dp)', value: d27.interestBurden, shown: 0.912, tol: 0.0005 },
    { what: 'EBIT margin 2027 (3 dp %)', value: d27.ebitMargin * 100, shown: 5.674, tol: 0.0005 },
    { what: 'Printed five-step product', value: 0.75 * 0.912 * 5.674 * 2.742 * 4.007, shown: 42.6, tol: 0.05 },
    { what: 'EBIT with lease interest', value: P27.ebit + LEASE.interest2027, shown: 43911 },
    { what: 'Interest burden with lease interest', value: P27.pretax / (P27.ebit + LEASE.interest2027), shown: 0.68 },
    // five-step
    { what: 'Tax burden 2026', value: d26.taxBurden, shown: 0.75 },
    { what: 'Tax burden 2027', value: d27.taxBurden, shown: 0.75 },
    { what: 'Interest burden 2026', value: d26.interestBurden, shown: 0.97 },
    { what: 'Interest burden 2027', value: d27.interestBurden, shown: 0.91 },
    { what: 'EBIT margin 2026 %', value: d26.ebitMargin * 100, shown: 19.5, tol: 0.05 },
    { what: 'EBIT margin 2027 %', value: d27.ebitMargin * 100, shown: 5.7, tol: 0.05 },
    { what: 'Five-step product 2027', value: d27.roe5, shown: d27.roe, tol: 1e-12 },
    { what: 'Five-step product 2026', value: d26.roe5, shown: d26.roe, tol: 1e-12 },
    { what: 'Pretax 2026', value: P26.pretax, shown: 36516 },
    { what: 'Pretax 2027', value: P27.pretax, shown: 29908 },
    { what: 'EBIT 2026', value: P26.ebit, shown: 37716 },
    { what: 'EBIT 2027', value: P27.ebit, shown: 32787 },
    { what: 'Interest 2026', value: P26.interestExpense, shown: 1200 },
    { what: 'Interest 2027', value: P27.interestExpense, shown: 2879 },
    { what: 'Tax rate %', value: t * 100, shown: 25 },
    { what: 'Café wages', value: FACTS.wages.cafes, shown: 92000 },
    { what: 'Lease cost 2027', value: LEASE.cost2027, shown: 40000 },
    { what: 'Ana’s salary', value: FACTS.wages.ana, shown: 48000 },
    { what: 'Market research', value: research, shown: 21000 },
    { what: 'Lease interest 2027', value: LEASE.interest2027, shown: 11124 },
    { what: 'EBIT margin factor', value: d27.ebitMargin / d26.ebitMargin, shown: 0.29 },
    { what: 'Interest burden factor', value: d27.interestBurden / d26.interestBurden, shown: 0.94 },
    // Harbourline
    { what: 'Harbourline revenue', value: HL.revenue, shown: 640 },
    { what: 'Harbourline EBIT', value: HL.ebit, shown: 61 },
    { what: 'Harbourline pretax', value: HD.profitBeforeTax, shown: 50 },
    { what: 'Harbourline net income', value: HL.netIncome, shown: 38 },
    { what: 'Harbourline total assets', value: HD.totalAssets, shown: 660 },
    { what: 'Harbourline equity', value: HD.bookEquity, shown: 300 },
    { what: 'Harbourline debt', value: HL.debt, shown: 210 },
    { what: 'Harbourline tax burden', value: hl.taxBurden, shown: 0.76 },
    { what: 'Harbourline interest burden', value: hl.interestBurden, shown: 0.82 },
    { what: 'Harbourline EBIT margin %', value: hl.ebitMargin * 100, shown: 9.5, tol: 0.05 },
    { what: 'Harbourline turnover', value: hl.assetTurnover, shown: 0.97 },
    { what: 'Harbourline multiplier', value: hl.equityMultiplier, shown: 2.20 },
    { what: 'Harbourline ROE %', value: hl.roe * 100, shown: 12.7, tol: 0.05 },
    { what: 'Harbourline net margin %', value: hl.netMargin * 100, shown: 5.9, tol: 0.05 },
    { what: 'Harbourline ROA %', value: hl.roa * 100, shown: 5.8, tol: 0.05 },
    { what: 'Lantern ROA 2027 %', value: d27.roa * 100, shown: 10.6, tol: 0.05 },
    // annualised 2026
    { what: 'Annualised turnover 2026', value: at26a, shown: 2.48 },
    { what: 'Annualised ROE 2026 %', value: at26a * d26.netMargin * d26.equityMultiplier * 100, shown: 77.5, tol: 0.05 },
    { what: 'Total assets 2026', value: P26.totalAssets, shown: 93676 },
    // substitution
    { what: 'Margin-first: margin effect pp', value: (s1 - d26.roe) * 100, shown: -46.9, tol: 0.05 },
    { what: 'Margin-first: turnover effect pp', value: (s2 - s1) * 100, shown: 5.8, tol: 0.05 },
    { what: 'Margin-first: multiplier effect pp', value: (d27.roe - s2) * 100, shown: 19.1, tol: 0.05 },
    { what: 'Total change pp', value: (d27.roe - d26.roe) * 100, shown: -22.0, tol: 0.05 },
    { what: 'Multiplier-first: step 1 ROE %', value: r1 * 100, shown: 117.1, tol: 0.05 },
    { what: 'Multiplier-first: step 2 ROE %', value: r2 * 100, shown: 155.6, tol: 0.05 },
    { what: 'Multiplier-first: multiplier effect pp', value: (r1 - d26.roe) * 100, shown: 52.5, tol: 0.05 },
    { what: 'Multiplier-first: turnover effect pp', value: (r2 - r1) * 100, shown: 38.5, tol: 0.05 },
    { what: 'Multiplier-first: margin effect pp', value: (d27.roe - r2) * 100, shown: -113.0, tol: 0.05 },
    // Starbucks
    { what: 'Starbucks net margin %', value: sb.netMargin * 100, shown: 10.4, tol: 0.05 },
    { what: 'Starbucks turnover', value: sb.assetTurnover, shown: 1.19 },
    { what: 'Starbucks ROA %', value: sb.roa * 100, shown: 12.4, tol: 0.05 },
    { what: 'Starbucks multiplier', value: sb.equityMultiplier, shown: -3.94 },
    { what: 'Starbucks product %', value: sb.roe * 100, shown: -48.7, tol: 0.05 },
    { what: 'Starbucks average assets', value: (SB.ta[0] + SB.ta[1]) / 2, shown: 30392.4 },
    { what: 'Starbucks average equity', value: (SB.eq[0] + SB.eq[1]) / 2, shown: -7721.85 },
    { what: 'Starbucks revenue', value: SB.rev, shown: 36176.2 },
    { what: 'Starbucks net earnings', value: SB.ni, shown: 3760.9 },
    { what: 'Starbucks FY2023 gain on sale', value: SB.gain2023, shown: 91.3 },
    // leases off
    { what: 'Right-of-use assets 2027', value: P27.rightOfUse, shown: 173379 },
    { what: 'Ex-lease turnover', value: dx.assetTurnover, shown: 4.66 },
    { what: 'Ex-lease multiplier', value: dx.equityMultiplier, shown: 2.36 },
    { what: 'Ex-lease ROE unchanged', value: dx.roe, shown: d27.roe, tol: 1e-12 },
    // research one-off
    { what: 'NI without research', value: niX, shown: 38181 },
    { what: 'Margin without research %', value: dr.netMargin * 100, shown: 6.6, tol: 0.05 },
    { what: 'ROE without research %', value: dr.roe * 100, shown: 72.6, tol: 0.05 },
    // cash
    { what: 'Cash 2026', value: P26.cash, shown: 42940 },
    { what: 'Cash 2027', value: P27.cash, shown: 6531 },
    // Ridgeline
    { what: 'Ridgeline margin %', value: RO.ni / RO.rev * 100, shown: 6.0, tol: 0.05 },
    { what: 'Ridgeline average assets', value: roTA, shown: 6000000 },
    { what: 'Ridgeline turnover', value: RO.rev / roTA, shown: 1.40 },
    { what: 'Ridgeline average equity', value: roEq, shown: 2400000 },
    { what: 'Ridgeline multiplier', value: roTA / roEq, shown: 2.50 },
    { what: 'Ridgeline product %', value: RO.ni / RO.rev * RO.rev / roTA * roTA / roEq * 100, shown: 21.0, tol: 0.05 },
    { what: 'Ridgeline direct ROE %', value: RO.ni / roEq * 100, shown: 21.0, tol: 0.05 },
    { what: 'Ridgeline ROA %', value: RO.ni / roTA * 100, shown: 8.4, tol: 0.05 },
    // application
    { what: 'Target ROE 2028 %', value: tgt.m * tgt.at * tgt.em * 100, shown: 60.9, tol: 0.05 },
  ],
};
