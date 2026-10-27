// return-on-assets-and-equity.js — F03 · Return on assets and equity. Content only; exercises are in
// return-on-assets-and-equity.ex.js. Lantern’s figures come from case.js (PERIODS, COMPARATIVE, FACTS) and the ratios
// from core/ratios.js; checks recompute every printed number. Other businesses are fictional: Saltmarsh Hotel (simple
// example), Kestrel Battery Installations (challenging). Starbucks’ figures are from its FY2024 Form 10-K (SEC EDGAR).
// DuPont analysis is the next lesson; the law firm’s unbilled revenue belongs to cash-flow-and-earnings-quality.
import { PERIODS, FACTS, LEASE } from './case.js?v=22';
import * as R from '../../../core/ratios.js?v=22';

const P26 = PERIODS[2026], P27 = PERIODS[2027];
const pr26 = R.profitability(P26), pr27 = R.profitability(P27, P26);
const avgTA = R.avg(P27, P26, 'totalAssets'), avgEq = R.avg(P27, P26, 'equity');
const lev26 = P26.totalAssets / P26.equity, lev27 = avgTA / avgEq;
const t = FACTS.tax.rate;

// 2026: first-period alternatives
const startEquity = 20_000;                                            // Ana’s stock, 1 March 2026 (F02)
const roe26start = P26.netIncome / ((startEquity + P26.equity) / 2);
const ni26ann = R.annualise(P26.netIncome, P26.months);
// 2026 with ten months of Ana’s 2027 salary
const salary10 = FACTS.wages.ana * 10 / 12;
const pretax26n = P26.pretax - salary10, ni26n = pretax26n * (1 - t);
// ROIC in outline (no lease adjustment)
const nopat27 = P27.ebit * (1 - t);
const ic26 = P26.debt + P26.equity, ic27 = P27.debt + P27.equity, avgIC = (ic26 + ic27) / 2;
// Starbucks FY2024 ($ millions; Form 10-K, statements of earnings and balance sheets)
const SB = { ni: 3760.9, niAll: 3762.3, ta: [29445.5, 31339.3], eq: [-7994.8, -7448.9], div: 2585.0, buyback: 1266.7 };
const sbTA = (SB.ta[0] + SB.ta[1]) / 2, sbEq = (SB.eq[0] + SB.eq[1]) / 2;
// Saltmarsh Hotel (simple)
const SH = { ni: 186_000, ta: [2_960_000, 3_240_000], eq: [1_180_000, 1_300_000] };
const shTA = (SH.ta[0] + SH.ta[1]) / 2, shEq = (SH.eq[0] + SH.eq[1]) / 2;
// Kestrel Battery Installations (challenging)
const KB = { capital: 2_000_000, debt: 1_200_000, rate: 0.08, good: 300_000, bad: 80_000 };
KB.equityB = KB.capital - KB.debt;
const kb = (ebit, debt) => { const ni = (ebit - debt * KB.rate) * (1 - t); return { ni, roe: ni / (KB.capital - debt), roa: ni / KB.capital }; };
const kA = kb(KB.good, 0), kB = kb(KB.good, KB.debt), kAb = kb(KB.bad, 0), kBb = kb(KB.bad, KB.debt);
const kRoic = KB.good * (1 - t) / KB.capital, kRoicBad = KB.bad * (1 - t) / KB.capital, kDE = KB.debt / KB.equityB, kAfter = KB.rate * (1 - t);

export default {
  slug: 'return-on-assets-and-equity',
  title: 'Return on assets and equity',
  blurb: 'Measure how much profit a business earns on the resources it uses and on the owners’ capital, on averages stated openly, and judge when a high return on equity reflects good business and when it reflects borrowing, an unpaid owner or tiny equity.',
  status: 'reviewed',
  objectives: [
    'Calculate return on assets and return on equity on average balances, and state which basis you used.',
    'Explain why a first period, a part year or an unpaid owner-manager distorts returns, and adjust for each.',
    'Explain how leverage links the two ratios, and calculate the effect of debt on return on equity in good and bad years.',
    'Decide when return on equity is not meaningful (tiny or negative equity) and choose a better measure.',
    'Calculate return on invested capital in outline and explain how it differs from return on equity.',
  ],
  prerequisites: [
    { lesson: 'f02/balance-sheet-and-equity', why: 'Returns divide profit by assets and equity, so you need to know what is in each and how equity moves from year to year.' },
    { lesson: 'f03/common-size-statements', why: 'Return on assets is driven by the margins you computed there.' },
    { lesson: 'f03/solvency-and-leverage', why: 'The link between return on assets and return on equity is the leverage measured there.' },
  ],
  case: 'lantern',

  concept: [
    { case: 'Lantern’s 2027 statements are finished. Revenue tripled to $577,860, yet net income fell from $27,387 to $22,431. A friend of Ana’s who works in a bank looks at the figures and tells her not to worry: “your return on equity is over 40%; most listed companies would kill for that.” Coastline Bank’s analyst, reading the same statements, writes in her file that Lantern’s returns “rest on a thin base of equity and a great deal of borrowing”. Both are reading the same two numbers. This lesson is about what those numbers mean.' },
    { p: 'A profit figure on its own can’t tell you whether a business did well. $22,431 is a fine result for a business that needs $50,000 of resources and a poor one for a business that needs $5 million. Return ratios divide profit by what was used to earn it. The two you meet most often divide <g>Net income</g> by total assets and by <g>Equity</g>: the first asks how productive all the business’s resources were, the second how much the owners earned on their capital.' },
    { p: '<g>Return on assets</g> (ROA) is net income divided by average total assets. Every asset is in the denominator, whoever paid for it: the cafés’ machines bought with cash, the brewer bought on the supplier’s plan, the right-of-use assets for the leased cafés. ROA answers the manager’s question: for each dollar of resources the business controlled during the year, how many cents of profit did it produce?' },
    { p: '<g>Return on equity</g> (ROE) is net income divided by average equity, the owners’ book capital (<g>Book value of equity</g>). It answers the owner’s question: for each dollar Ana has in the business, at book value, how many cents did the business earn for her? Net income is already after interest, so it is what belongs to the owners; equity is what they have put in or left in. When a company has preferred stock, the numerator is net income less preferred dividends and the denominator is common equity only, so that both belong to the common shareholders.' },
    { h: 'Why averages' },
    { p: 'Net income is a flow, earned over the whole year. Assets and equity are stocks, measured at a date. Dividing a year’s flow by one date’s stock pairs a year’s profit with resources the business had only at the end (or only at the start). When the balance sheet changes a lot during the year, that matters. Lantern’s total assets rose from $93,676 to $327,883 in 2027, mostly on 1 March, when the cafés’ leases put $202,255 of right-of-use assets on the balance sheet. The course therefore divides by the <b>average</b> of the opening and closing balances, the convention of the course’s ratio engine and of OpenStax’s <i>Principles of Finance</i>.' },
    { table: {
      caption: 'Lantern’s returns (fictional figures). 2026 has no opening balance sheet, so it uses closing balances.',
      head: ['', '2026 (ten months)', '2027'],
      align: ['l', 'r', 'r'],
      rows: [
        ['Net income ($)', '27,387', '22,431'],
        ['Total assets used ($)', '93,676 (closing)', '210,780 (average)'],
        ['Equity used ($)', '42,387 (closing)', '52,603 (average)'],
        ['Return on assets', '29.2%', '10.6%'],
        ['Return on equity', '64.6%', '42.6%'],
      ],
      note: 'Average 2027 total assets: (93,676 + 327,883) ÷ 2 = 210,779.5; average equity (42,387 + 62,818) ÷ 2 = 52,602.5, both rounded to the dollar in the table.',
    } },
    { p: 'ROA fell by almost two thirds, from 29.2% to 10.6%. ROE fell by about a third, from 64.6% to 42.6%. The gap between them widened because each dollar of Ana’s equity carried more assets in 2027 than in 2026: the rest was paid for by lenders, the landlords of the cafés and suppliers. That is <g>Leverage</g>, and it is the reason the bank analyst and Ana’s friend read the same 42.6% so differently.' },
    { callout: 'key', title: 'Return on equity = return on assets × assets per dollar of equity', html: 'Because both ratios share the numerator, <m>\\text{ROE} = \\text{ROA} \\times \\overline{\\text{Total assets}} \\div \\overline{\\text{Equity}}</m>. For Lantern in 2027, with the factors unrounded: <m>10.64\\% \\times 4.007 = 42.6\\%</m>. A high ROE can come from productive assets or from financing each dollar of equity with several dollars of other people’s money. The next lesson, DuPont analysis, splits ROA further into margin and turnover.' },
  ],

  theory: [
    { h: 'The denominator must be stated' },
    { p: 'Analysts use three denominators: the opening balance, the closing balance and the average. Each has a defence. The opening balance is what the owners had committed when the year began, and investment made during the year rarely earns a full year’s profit at once; Damodaran (2007) uses it for that reason. The closing balance is the only one available for a business’s first period. The average treats the year’s resources as building up evenly. None is wrong, but they can give very different answers, and a ratio quoted without its basis can’t be compared with anything.' },
    { table: {
      caption: 'Lantern’s 2027 returns on three denominators (fictional figures)',
      head: ['Denominator', 'Return on assets', 'Return on equity'],
      align: ['l', 'r', 'r'],
      rows: [
        ['Opening balances (31 December 2026)', '23.9%', '52.9%'],
        ['Average of opening and closing', '10.6%', '42.6%'],
        ['Closing balances (31 December 2027)', '6.8%', '35.7%'],
      ],
      note: 'Net income $22,431 in every row. Total assets: opening $93,676, closing $327,883. Equity: opening $42,387, closing $62,818.',
    } },
    { p: 'The spread is widest for ROA, because Lantern’s assets more than tripled. On opening balances the cafés’ assets aren’t in the denominator at all, although they produced much of the year’s revenue; on closing balances they count for twelve months although they were used for ten. The average sits between. For a business whose balance sheet barely changes, the three bases agree closely, which is why the choice is often ignored; for a growing or shrinking business it is the first thing to check.' },
    { h: 'First periods: Lantern’s 2026' },
    { p: 'Lantern began on 1 March 2026 with nothing; Ana’s $20,000 bought its stock that day. There is no opening balance sheet, so the course uses closing balances for 2026: ROA <m>27{,}387 \\div 93{,}676 = 29.2\\%</m> and ROE <m>27{,}387 \\div 42{,}387 = 64.6\\%</m>. Two other reasonable choices give quite different answers. Averaging the $20,000 Ana put in on 1 March with the closing $42,387 gives an ROE of 87.8%. Annualising ten months of net income (<m>27{,}387 \\times 12 \\div 10 = 32{,}864</m>) gives 77.5% on closing equity; but the ten months included the fourth-quarter gift peak and no January or February, so annualising probably overstates a normal year.' },
    { p: 'A first period also has a deeper problem. The closing equity of $42,387 already includes most of the year’s profit, retained in the business, so the denominator grows with the numerator; a business that earned nothing would end its first year with only its contributed capital. Whatever you choose, say what you did and compare like with like: Lantern’s 2027 ROE on closing equity is 35.7%, the figure to set beside 2026’s 64.6%. Even that pair is not fully like-for-like: 64.6% is earned in ten months (77.5% annualised) and 35.7% in twelve.' },
    { h: 'An unpaid owner' },
    { p: 'In 2026 Ana drew no salary: she was paid only through $5,000 of dividends, which are not an expense. From 2027 she is paid $48,000 a year, an operating expense that reduces net income. The two years’ profits therefore measure different things. 2026’s profit is what was left for the owner before paying her for her work; 2027’s is after paying her a market wage.' },
    { p: 'To compare them, charge 2026 with what Ana’s work would have cost: ten months of the $48,000 salary, $40,000. Income before tax becomes <m>36{,}516 - 40{,}000 = -3{,}484</m>. At Lantern’s 25% tax rate the salary would have cut income tax by $10,000, from $9,129 to a credit of $871 (in practice, a loss to carry forward), so net income becomes <m>-3{,}484 \\times 0.75 = -2{,}613</m>. Held against the reported closing balances, ROE is −6.2% and ROA −2.8%. Most of 2026’s spectacular return was Ana’s unpaid labour. Buyers and lenders looking at owner-managed businesses commonly make this adjustment, often called normalising the owner’s pay; for a company whose managers are paid market salaries it isn’t needed.' },
    { callout: 'warn', title: 'Adjust the profit, not just the ratio', html: 'Charging a salary changes income before tax, then income tax, then net income. Subtracting the whole $40,000 from net income ignores the tax it saves; subtracting nothing compares a business with a free manager with one that pays its manager. Keep the balance sheet as reported unless you also know how the cash and retained earnings would have differed.' },
    { h: 'Leverage: why ROE can stay high while margins fall' },
    { p: 'Write <m>\\overline{\\text{Total assets}} \\div \\overline{\\text{Equity}}</m> as the assets each dollar of equity supports. For Lantern it rose from 2.21 at the end of 2026 to 4.01 on 2027’s averages. Equity grew by $20,431 in 2027 (net income $22,431 less a $2,000 dividend); total liabilities grew by $213,776, from $51,289 to $265,065: the lease liabilities of $173,379, the line of credit, the brewer plan and the wages and customer deposits owed by a larger business. So, carrying an extra decimal place: <m>29.24\\% \\times 2.210 = 64.6\\%</m> in 2026 and <m>10.64\\% \\times 4.007 = 42.6\\%</m> in 2027. Leverage nearly doubled and absorbed much of the fall in ROA.' },
    { p: 'Leverage raises ROE only while the business earns more on its capital than the capital costs after tax. The cleanest way to see it uses <g>Return on invested capital</g> (ROIC): operating profit after tax divided by the capital provided by lenders (debt, <m>D</m>) and owners (equity, <m>E</m>). If debt costs <m>r</m> before tax and the tax rate is <m>t</m>, then, as an identity, <m>\\text{ROE} = \\text{ROIC} + (\\text{ROIC} - r(1-t)) \\times D \\div E</m>. Each dollar of debt earns ROIC and costs <m>r(1-t)</m>; the difference, the spread, goes to the owners, magnified by <m>D \\div E</m>. When ROIC falls below the after-tax cost of debt, the spread is negative and leverage pushes ROE below ROIC. The challenging example shows both cases.' },
    { p: 'The identity follows in three lines. Net income is what is left of EBIT after interest and tax: <m>\\text{NI} = (\\text{EBIT} - rD)(1-t)</m>. Since <m>\\text{ROIC} = \\text{EBIT}(1-t) \\div (D+E)</m>, <m>\\text{EBIT}(1-t) = \\text{ROIC} \\times (D+E)</m>, so <m>\\text{NI} = \\text{ROIC} \\times (D+E) - r(1-t)D</m>. Divide by <m>E</m>: <m>\\text{ROE} = \\text{ROIC} + (\\text{ROIC} - r(1-t)) \\times D \\div E</m>. It holds exactly when the same balances (here, averages) are used throughout and there are no non-operating items.' },
    { p: 'For Lantern in 2027, on averages: interest-bearing debt averages <m>(30{,}000 + 65{,}250) \\div 2 = 47{,}625</m> and equity 52,602.5, so <m>D \\div E = 0.905</m>. Interest of $2,879 on that debt is <m>r = 6.05\\%</m>, or 4.53% after tax. ROIC (below) is 24.53%, so the spread is 20.0 points and <m>\\text{ROE} = 24.53\\% + 20.00\\% \\times 0.905 = 42.6\\%</m>: the same answer as net income over average equity. Leverage adds 18.1 points to Lantern’s ROE, and it does so because the business earns far more on its capital than its debt costs. (Treating the lease liabilities as debt would change both ROIC and the spread; F05 takes that up.)' },
    { p: 'Higher ROE from leverage is not free. Interest and lease payments are fixed, so the owners’ result swings more widely and the business can run out of cash in a bad year. That is why the bank analyst’s note mentions Lantern’s current ratio of 0.52 at the end of 2027 (the liquidity lesson) and why the distress-scores lesson returns to these balance sheets. ROE measures the reward; the leverage and liquidity ratios measure the risk taken to get it.' },
    { h: 'When equity is tiny or negative' },
    { p: 'ROE divides by equity, so small equity gives huge answers and negative equity gives nonsense. A business with $5,000 of equity and $50,000 of profit has an ROE of 1,000%, which says more about the denominator than about the business. If equity is negative, a profitable company shows a negative ROE and a loss-making one a positive ROE, two negatives making a positive. In either case report ROE as “not meaningful” and use ROA or ROIC instead; Damodaran (2007) gives the same advice.' },
    { p: 'Starbucks is a real example. At 29 September 2024 its balance sheet shows total assets of $31,339.3 million and total liabilities of $38,780.9 million, so shareholders’ equity is a deficit: −$7,448.9 million attributable to Starbucks. The deficit was built up by returning cash to shareholders: in fiscal 2022, for example, Starbucks repurchased $4,013.0 million of its stock and paid $2,263.3 million of dividends, together far more than its net earnings of $3,283.4 million (including noncontrolling interests, as its cash-flow statement starts). In fiscal 2024 dividends ($2,585.0 million) and repurchases ($1,266.7 million) again exceeded net earnings ($3,762.3 million), yet the deficit narrowed slightly from −$7,994.8 million a year earlier, because other items added to equity. Net earnings attributable to Starbucks were $3,760.9 million, so a mechanical ROE on average equity is <m>3{,}760.9 \\div (-7{,}721.85) = -48.7\\%</m> for a company that made a large profit. Its ROA, <m>3{,}760.9 \\div 30{,}392.4 = 12.4\\%</m>, still means something.' },
    { callout: 'note', title: 'Negative equity is not insolvency', html: 'Starbucks’ deficit comes from returning cash to shareholders, not from losses: its net earnings were positive in each of fiscal 2022, 2023 and 2024. Book equity is an accounting residual: it records what owners contributed and left in, measured by accounting rules, not what the business is worth. The solvency lesson explains why debt to equity is meaningless here for the same reason.' },
    { h: 'Return on invested capital, in outline' },
    { p: 'ROE mixes how well the business operates with how it is financed. ROIC separates them by putting operating profit after tax, often called NOPAT, over the capital that lenders and owners provide, whatever its mix. For Lantern in 2027, before any adjustment for leases: NOPAT <m>32{,}787 \\times 0.75 = 24{,}590</m>; invested capital (interest-bearing debt plus equity) averages <m>(72{,}387 + 128{,}068) \\div 2 = 100{,}227.5</m>; ROIC is 24.5%. Analysts differ on the details: whether to subtract cash, whether to treat lease liabilities as debt (which also means moving the interest inside the lease cost out of operating profit), which tax rate to use. F05 develops ROIC and compares it with the <g>Cost of capital</g>; here it is enough to know that a business creates value for its owners when ROIC exceeds what its capital costs.' },
    { h: 'Variants you will meet' },
    { list: [
      '<b>ROA on operating profit.</b> Net income is after interest, so ROA computed on it falls when a business borrows, even if its assets are as productive as before. Some analysts use EBIT after tax over average total assets instead: Lantern’s 2027 figure is <m>24{,}590 \\div 210{,}779.5 = 11.7\\%</m> against 10.6% on net income. The course uses net income, as the ratio engine does; say which you use.',
      '<b>Return on average common equity.</b> With preferred stock, net income less preferred dividends over common equity, as above.',
      '<b>Annualised quarterly returns.</b> A quarter’s net income times four over average equity; seasonal businesses distort it, as Lantern’s ten months show.',
      '<b>Market-based returns.</b> ROE uses book equity. A shareholder who paid more than book value earns less on the price paid: F00’s market-to-book ratio links the two.',
    ] },
  ],

  formulas: [
    { id: 'roa-average', name: 'Return on assets',
      tex: String.raw`\text{ROA} = \dfrac{\text{Net income}}{\overline{\text{Total assets}}}`,
      where: [
        [String.raw`\text{Net income}`, 'Net income for the period (after interest and tax)', '$'],
        [String.raw`\overline{\text{Total assets}}`, 'Total assets, average of opening and closing (closing when there is no opening balance sheet)', '$'],
        [String.raw`\text{ROA}`, 'Return on assets', '%'],
      ],
      assumptions: 'The period is a year; for a part-year, say whether the profit is annualised.',
      note: 'Lantern 2027: <m>22{,}431 \\div 210{,}779.5 = 10.6\\%</m>.' },
    { id: 'roe-average', name: 'Return on equity',
      tex: String.raw`\text{ROE} = \dfrac{\text{Net income} - \text{Preferred dividends}}{\overline{\text{Common equity}}}`,
      where: [
        [String.raw`\text{Net income}`, 'Net income for the period', '$'],
        [String.raw`\text{Preferred dividends}`, 'Dividends on preferred stock for the period (zero for Lantern)', '$'],
        [String.raw`\overline{\text{Common equity}}`, 'Common shareholders’ equity, average of opening and closing (closing when there is no opening balance sheet)', '$'],
        [String.raw`\text{ROE}`, 'Return on equity', '%'],
      ],
      assumptions: 'Average equity is positive and not tiny relative to total assets; otherwise report ROE as not meaningful.',
      note: 'Lantern 2027: <m>22{,}431 \\div 52{,}602.5 = 42.6\\%</m>.' },
    { id: 'roe-from-roa', name: 'Return on equity from return on assets',
      tex: String.raw`\text{ROE} = \text{ROA} \times \dfrac{\overline{\text{Total assets}}}{\overline{\text{Equity}}}`,
      where: [
        [String.raw`\text{ROA}`, 'Return on assets, on average total assets', '%'],
        [String.raw`\overline{\text{Total assets}}`, 'Total assets, average of opening and closing', '$'],
        [String.raw`\overline{\text{Equity}}`, 'Equity, average of opening and closing', '$'],
        [String.raw`\text{ROE}`, 'Return on equity, on average equity', '%'],
      ],
      assumptions: 'Both ratios use the same numerator and the same basis (average or closing).',
      note: 'The ratio of assets to equity is the equity multiplier of the next lesson. Lantern: <m>10.64\\% \\times 4.007 = 42.6\\%</m>.' },
    { id: 'roe-leverage-spread', name: 'Return on equity and the leverage spread',
      tex: String.raw`\text{ROE} = \text{ROIC} + \bigl(\text{ROIC} - r(1-t)\bigr)\dfrac{D}{E}`,
      where: [
        [String.raw`\text{ROIC}`, 'Return on invested capital: EBIT × (1 − t) ÷ (D + E)', '%'],
        [String.raw`r`, 'Interest rate on the debt: interest expense ÷ D', '%'],
        [String.raw`t`, 'Tax rate', '%'],
        [String.raw`D`, 'Interest-bearing debt', '$'],
        [String.raw`E`, 'Equity', '$'],
        [String.raw`\text{ROE}`, 'Return on equity', '%'],
      ],
      assumptions: 'An identity when invested capital is D + E, there are no non-operating items, and tax is t of income before tax (a loss earns a tax credit at t).',
      note: 'The bracket is the spread. Positive spread: debt raises ROE above ROIC. Negative spread: debt pushes it below.' },
    { id: 'roic-outline', name: 'Return on invested capital (outline)',
      tex: String.raw`\text{ROIC} = \dfrac{\text{EBIT} \times (1 - t)}{\overline{D + E}}`,
      where: [
        [String.raw`\text{EBIT}`, 'Earnings before interest and taxes (Lantern: operating income)', '$'],
        [String.raw`t`, 'Tax rate', '%'],
        [String.raw`\overline{D + E}`, 'Interest-bearing debt plus equity, average of opening and closing', '$'],
        [String.raw`\text{ROIC}`, 'Return on invested capital', '%'],
      ],
      assumptions: 'No adjustment for cash or leases; F05 develops the choices.',
      note: 'Lantern 2027: <m>24{,}590 \\div 100{,}227.5 = 24.5\\%</m>.' },
  ],

  examples: [
    { level: 'simple', title: 'A hotel’s returns', fictional: true,
      setup: 'Saltmarsh Hotel, a fictional seaside hotel, earned net income of $186,000 in 2027. Its total assets were $2,960,000 on 1 January and $3,240,000 on 31 December; its equity was $1,180,000 and $1,300,000. It has no preferred stock. Find its ROA and ROE on average balances, and check them against each other.',
      steps: [
        'Average total assets: <m>(2{,}960{,}000 + 3{,}240{,}000) \\div 2 = 3{,}100{,}000</m>. ROA <m>= 186{,}000 \\div 3{,}100{,}000 = 6.0\\%</m>.',
        'Average equity: <m>(1{,}180{,}000 + 1{,}300{,}000) \\div 2 = 1{,}240{,}000</m>. ROE <m>= 186{,}000 \\div 1{,}240{,}000 = 15.0\\%</m>.',
        'Assets per dollar of equity: <m>3{,}100{,}000 \\div 1{,}240{,}000 = 2.5</m>. Check: <m>6.0\\% \\times 2.5 = 15.0\\%</m>.',
      ],
      answer: 'ROA 6.0%, ROE 15.0%, on average balances.',
      interpretation: 'Each dollar of the hotel’s resources produced 6 cents of profit; each dollar of the owners’ book capital earned 15 cents, because $1.50 of every $2.50 of assets was financed by others. Whether 15% is good depends on what the owners could earn elsewhere for the same risk, and on how safe that leverage is.' },
    { level: 'challenging', title: 'The same business, financed two ways', fictional: true,
      setup: 'Kestrel Battery Installations, a fictional installer of home battery storage, needs $2,000,000 of capital and has no other liabilities. Plan A finances it all with equity. Plan B borrows $1,200,000 at 8% and raises $800,000 of equity. The tax rate is 25%, and a loss earns a tax credit (the group has other profits to set it against). Compare ROA and ROE under each plan in a good year (EBIT $300,000) and a bad year (EBIT $80,000), and confirm the results with the leverage-spread identity.',
      table: {
        caption: 'Kestrel Battery Installations under two financing plans (fictional, $)',
        head: ['', 'A, good', 'B, good', 'A, bad', 'B, bad'],
        align: ['l', 'r', 'r', 'r', 'r'],
        rows: [
          ['EBIT', '300,000', '300,000', '80,000', '80,000'],
          ['Interest at 8%', '0', '96,000', '0', '96,000'],
          ['Income before tax', '300,000', '204,000', '80,000', '(16,000)'],
          ['Tax at 25%', '75,000', '51,000', '20,000', '(4,000)'],
          ['Net income', '225,000', '153,000', '60,000', '(12,000)'],
          ['Equity', '2,000,000', '800,000', '2,000,000', '800,000'],
          ['ROE', '11.25%', '19.125%', '3.00%', '−1.50%'],
        ],
        note: 'Return on equity is shown exactly, without rounding.',
      },
      steps: [
        'Good year. Plan A: net income <m>300{,}000 \\times 0.75 = 225{,}000</m>; ROE <m>= 225{,}000 \\div 2{,}000{,}000 = 11.25\\%</m>. Plan B: interest <m>1{,}200{,}000 \\times 0.08 = 96{,}000</m>; net income <m>(300{,}000 - 96{,}000) \\times 0.75 = 153{,}000</m>; ROE <m>= 153{,}000 \\div 800{,}000 = 19.125\\%</m>.',
        'Identity check, good year: ROIC <m>= 225{,}000 \\div 2{,}000{,}000 = 11.25\\%</m>; after-tax cost of debt <m>8\\% \\times 0.75 = 6\\%</m>; <m>D \\div E = 1.5</m>. ROE <m>= 11.25\\% + (11.25\\% - 6\\%) \\times 1.5 = 19.125\\%</m>.',
        'Bad year. Plan A: <m>80{,}000 \\times 0.75 = 60{,}000</m>, ROE 3.0%. Plan B: <m>(80{,}000 - 96{,}000) \\times 0.75 = -12{,}000</m>, ROE <m>-12{,}000 \\div 800{,}000 = -1.5\\%</m>. Identity: <m>3\\% + (3\\% - 6\\%) \\times 1.5 = -1.5\\%</m>.',
        'ROA uses the same $2,000,000 of assets under both plans, but net income is after interest: good year 11.25% (A) and <m>153{,}000 \\div 2{,}000{,}000 = 7.65\\%</m> (B). Net-income ROA falls when the business borrows although the batteries and vans are equally productive, which is why ROIC is the better measure of operations.',
      ],
      answer: 'Good year: ROE 11.25% (A) against 19.125% (B). Bad year: 3.00% (A) against −1.50% (B). Debt adds 7.875 percentage points in the good year and costs 4.50 in the bad one.',
      interpretation: 'Borrowing at an after-tax 6% pays when the business earns more than 6% on its capital and hurts when it earns less. Plan B’s owners get a higher expected return in exchange for a wider range of outcomes, and in a bad year the interest must still be paid in cash. A high ROE built on Plan B’s structure says as much about risk as about performance.' },
    { level: 'applied', title: 'Was 2027 a worse year for Ana?', fictional: true,
      setup: 'Ana wants to know whether Lantern really performed worse in 2027 than in 2026, as the fall in ROE from 64.6% to 42.6% suggests. Put the two years on a comparable footing, using the figures in this lesson, and give her an answer.',
      steps: [
        'Same basis. 2026 can only be measured on closing balances, so measure 2027 that way too: ROE <m>22{,}431 \\div 62{,}818 = 35.7\\%</m>, ROA <m>22{,}431 \\div 327{,}883 = 6.8\\%</m>, against 64.6% and 29.2% in 2026.',
        'Same costs. Charge 2026 with ten months of Ana’s salary, $40,000, net of the tax it saves: net income <m>(36{,}516 - 40{,}000) \\times 0.75 = -2{,}613</m>. On closing balances, ROE −6.2% and ROA −2.8%.',
        'Same length. 2027 is twelve months and 2026 ten; but 2026, after the salary, made a loss, and annualising a loss doesn’t turn it into a profit. The comparison no longer depends on the period length.',
        'Leverage. 2027’s ROE of 35.7% on closing equity rests on assets of <m>327{,}883 \\div 62{,}818 = 5.2</m> times equity, against 2.2 times at the end of 2026.',
      ],
      answer: 'On a like-for-like basis, after paying Ana, 2026 made a small loss (ROE −6.2%, ROA −2.8% on closing balances) and 2027 a profit (ROE 35.7%, ROA 6.8%). 2027 was the better year operationally; its ROE is high mainly because Lantern now finances five dollars of assets for every dollar of Ana’s equity.',
      interpretation: 'Ana’s friend was right not to worry about the fall, though for a reason he didn’t see: the unpaid salary flattered 2026, so the fall in ROE overstates any decline in the business. The bank analyst was right too: 2027’s ROE depends on borrowing and leases, so the risk side of the balance sheet needs as much attention as the return. One more caution belongs to a later lesson: part of 2027’s revenue has been earned but not yet billed, and the cash-flow-and-earnings-quality lesson asks how much of the profit has turned into cash.' },
  ],

  demo: [
    { widget: 'roe-lantern', intro: 'Lantern’s returns for both years, worked out by the course’s ratio engine. Switch off average balances to see 2027 on closing balances, annualise 2026’s ten months, and charge 2026 with Ana’s salary. Pick a ratio to see its working.' },
    { widget: 'roe-leverage', intro: 'One business, financed with more or less debt. Move the return on invested capital below the after-tax cost of debt and watch leverage turn from friend to enemy.' },
  ],

  mistakes: [
    { title: '“A higher ROE means a better-run business.”', html: 'ROE rises with leverage as well as with performance, and it explodes when equity is small. Lantern’s ROA fell from 29.2% to 10.6% while its ROE fell only to 42.6%, because assets per dollar of equity nearly doubled. Read ROE beside ROA (or ROIC) and the leverage that links them.' },
    { title: '“Dividing by closing balances is fine.”', html: 'For a business whose balance sheet changed a lot, closing balances count new assets for the whole year and understate the return. Lantern’s 2027 ROA is 6.8% on closing assets and 10.6% on average assets. Use averages where an opening balance sheet exists, and always state the basis.' },
    { title: '“Lantern’s 2026 ROE of 64.6% shows how profitable the first year was.”', html: 'It is a ten-month profit on closing equity that already contains most of that profit, earned with an owner who drew no salary. Charge ten months of her $48,000 salary and 2026 makes a loss. Normalise the owner’s pay before comparing owner-managed businesses with each other or with companies that pay managers.' },
    { title: '“Starbucks’ ROE is −48.7%, so it lost money.”', html: 'Starbucks earned net income of $3,760.9 million in fiscal 2024; the minus sign comes from its negative equity. When average equity is negative or tiny, report ROE as not meaningful and use ROA or ROIC.' },
    { title: '“Subtract the owner’s salary from net income.”', html: 'A salary is deductible, so it reduces tax as well. Charge it before tax and recompute the tax: for Lantern, 2026 net income falls by $30,000 (<m>40{,}000 \\times 0.75</m>), not by $40,000.' },
  ],

  application: [
    { p: '<b>The lender’s view.</b> Coastline Bank’s analyst cares less about Lantern’s ROE than about whether the business earns enough on its assets to service what it owes. She records ROA on average assets, ROIC before and after treating the leases as debt, and the leverage that turns them into ROE, and she notes that Lantern’s 2027 return is earned on a balance sheet where liabilities are 81% of total assets (<m>265{,}065 \\div 327{,}883</m>). Her conclusion is that the returns are adequate but the margin of safety is thin: a fall in café sales would hit owners first and lenders soon after, because the lease and loan payments don’t shrink with sales.' },
    { p: '<b>The owner’s view.</b> Ana uses ROE to ask whether the money she has left in Lantern earns more than it would elsewhere. In 2027, after paying Ana her own salary, Lantern earned 42.6% on her average book equity: far above the few percent a savings account pays, but for far more risk. When Lantern sells new shares to an outside investor in 2028 (F00’s Hollis Avery), the investor’s return will depend on the price she pays, not on book equity: an investor who pays twice book value for a share of the profits earns half the ROE on the money put in.' },
    { p: '<b>The manager’s view.</b> Inside the business, ROA (or a return on the assets each unit uses) compares the cafés, the catering kitchen and the online shop. Each café carries its fit-out, its machines and its right-of-use asset; the online shop carries little more than inventory. A café that earns the same profit as the shop on five times the assets is using capital less well, and a decision to open a third café should be judged on the return the new assets will earn, not on the extra revenue.' },
    { p: '<b>Reading any company’s returns.</b> Check the basis (average, opening or closing), the numerator (net income, net income to common, or operating profit after tax), whether the period is a full year, and whether the equity is large enough for ROE to mean anything. Then ask what drives the return: margin, the intensity with which assets are used, or leverage. That last question is the subject of the next lesson.' },
  ],

  summary: [
    'Return on assets is net income over average total assets; return on equity is net income (less preferred dividends) over average common equity. Lantern: ROA 29.2% (2026, closing) and 10.6% (2027, average); ROE 64.6% and 42.6%.',
    'Profit is a flow and assets and equity are stocks, so divide by the average of opening and closing balances. Opening, average and closing bases can differ widely for a growing business: always state the basis.',
    'First periods have no opening balance sheet and part years distort flows; compare like with like (Lantern 2027 on closing equity: 35.7%).',
    'Owner-managers who take no salary inflate profit. Charge a market salary before tax: Lantern’s 2026 becomes a small loss.',
    'ROE = ROA × assets per dollar of equity. Leverage raises ROE above ROIC only while ROIC exceeds the after-tax cost of debt, and it widens the swings both ways.',
    'When equity is tiny or negative (Starbucks at 29 September 2024), ROE is not meaningful: use ROA or ROIC.',
    'ROIC = EBIT × (1 − t) over average debt plus equity measures operations independently of the financing mix; F05 develops it.',
  ],

  glossary: [
    { term: 'Return on assets', def: 'Net income for a period divided by average total assets (closing total assets when there is no opening balance sheet): how much profit each dollar of resources produced. Abbreviated ROA.' },
    { term: 'Return on equity', def: 'Net income less any preferred dividends for a period divided by average common shareholders’ equity: how much the business earned on each dollar of the owners’ book capital. Abbreviated ROE; not meaningful when equity is negative or tiny.' },
    { term: 'Return on invested capital', def: 'Operating profit after tax (EBIT × (1 − tax rate)) divided by the capital provided by lenders and owners (interest-bearing debt plus equity, usually averaged): a return on the business’s operations that does not depend on how they are financed. Abbreviated ROIC; definitions vary in their treatment of cash and leases.' },
  ],

  references: [
    { text: 'Dahlquist, J. &amp; Knight, R. (2022). <i>Principles of Finance</i>, section 6.6, “Profitability Ratios and the DuPont Method” (return on total assets and return on equity on average balances). OpenStax.', url: 'https://openstax.org/books/principles-finance/pages/6-6-profitability-ratios-and-the-dupont-method', checked: '2026-10-26' },
    { text: 'Damodaran, A. (2007). <i>Return on Capital (ROC), Return on Invested Capital (ROIC) and Return on Equity (ROE): Measurement and Implications</i>. NYU Stern School of Business, July 2007 (beginning-of-year denominators, negative book equity, operating leases).', url: 'https://pages.stern.nyu.edu/~adamodar/pdfiles/papers/returnmeasures.pdf', checked: '2026-10-26' },
    { text: 'Starbucks Corporation (2024). Form 10-K for the fiscal year ended 29 September 2024, Consolidated Statements of Earnings (SEC EDGAR financial report R3).', url: 'https://www.sec.gov/Archives/edgar/data/829224/000082922424000057/R3.htm', checked: '2026-10-26' },
    { text: 'Starbucks Corporation (2024). Form 10-K for the fiscal year ended 29 September 2024, Consolidated Balance Sheets (SEC EDGAR financial report R7).', url: 'https://www.sec.gov/Archives/edgar/data/829224/000082922424000057/R7.htm', checked: '2026-10-26' },
    { text: 'Starbucks Corporation (2024). Form 10-K for the fiscal year ended 29 September 2024, Consolidated Statements of Cash Flows (SEC EDGAR financial report R5: cash dividends paid, repurchase of common stock).', url: 'https://www.sec.gov/Archives/edgar/data/829224/000082922424000057/R5.htm', checked: '2026-10-26' },
  ],

  checks: [
    // case: headline figures
    { what: 'Revenue 2027', value: P27.revenue, shown: 577860 },
    { what: 'Net income 2026', value: P26.netIncome, shown: 27387 },
    { what: 'Net income 2027', value: P27.netIncome, shown: 22431 },
    { what: 'Total assets 2026', value: P26.totalAssets, shown: 93676 },
    { what: 'Total assets 2027', value: P27.totalAssets, shown: 327883 },
    { what: 'Equity 2026', value: P26.equity, shown: 42387 },
    { what: 'Equity 2027', value: P27.equity, shown: 62818 },
    { what: 'Lease liability at inception (right-of-use asset)', value: LEASE.initial, shown: 202255 },
    { what: 'Average total assets 2027', value: avgTA, shown: 210779.5 },
    { what: 'Average total assets 2027 (table, rounded)', value: avgTA, shown: 210780, tol: 0.5 },
    { what: 'Average equity 2027', value: avgEq, shown: 52602.5 },
    { what: 'Average equity 2027 (table, rounded)', value: avgEq, shown: 52603, tol: 0.5 },
    { what: 'ROA 2026 closing %', value: pr26.roa * 100, shown: 29.2, tol: 0.05 },
    { what: 'ROA 2027 average %', value: pr27.roa * 100, shown: 10.6, tol: 0.05 },
    { what: 'ROE 2026 closing %', value: pr26.roe * 100, shown: 64.6, tol: 0.05 },
    { what: 'ROE 2027 average %', value: pr27.roe * 100, shown: 42.6, tol: 0.05 },
    { what: 'Assets per dollar of equity 2027 (average)', value: lev27, shown: 4.01 },
    { what: 'Assets per dollar of equity 2026 (closing)', value: lev26, shown: 2.21 },
    { what: 'ROA × leverage = ROE 2027 %', value: pr27.roa * lev27 * 100, shown: 42.6, tol: 0.05 },
    { what: 'ROA × leverage = ROE 2026 %', value: pr26.roa * lev26 * 100, shown: 64.6, tol: 0.05 },
    // three denominators
    { what: 'ROA on opening %', value: P27.netIncome / P26.totalAssets * 100, shown: 23.9, tol: 0.05 },
    { what: 'ROE on opening %', value: P27.netIncome / P26.equity * 100, shown: 52.9, tol: 0.05 },
    { what: 'ROA on closing %', value: P27.netIncome / P27.totalAssets * 100, shown: 6.8, tol: 0.05 },
    { what: 'ROE on closing %', value: P27.netIncome / P27.equity * 100, shown: 35.7, tol: 0.05 },
    // first period
    { what: 'Ana’s stock, 1 March 2026', value: startEquity, shown: 20000 },
    { what: 'ROE 2026 on average of 20,000 and closing %', value: roe26start * 100, shown: 87.8, tol: 0.05 },
    { what: 'Annualised 2026 net income', value: ni26ann, shown: 32864, tol: 0.5 },
    { what: 'ROE 2026 annualised on closing %', value: ni26ann / P26.equity * 100, shown: 77.5, tol: 0.05 },
    // salary
    { what: 'Dividends 2026', value: P26.dividends, shown: 5000 },
    { what: 'Ana’s salary', value: FACTS.wages.ana, shown: 48000 },
    { what: 'Ten months of salary', value: salary10, shown: 40000 },
    { what: 'Income before tax 2026', value: P26.pretax, shown: 36516 },
    { what: 'Normalised pretax 2026', value: pretax26n, shown: -3484 },
    { what: 'Tax effect on the loss', value: -pretax26n * t, shown: 871 },
    { what: 'Tax cut by the salary', value: salary10 * t, shown: 10000 },
    { what: 'Tax 2026 as reported', value: P26.tax, shown: 9129 },
    { what: 'Tax rate %', value: t * 100, shown: 25 },
    { what: 'Normalised NI 2026', value: ni26n, shown: -2613 },
    { what: 'Normalised ROE 2026 %', value: ni26n / P26.equity * 100, shown: -6.2, tol: 0.05 },
    { what: 'Normalised ROA 2026 %', value: ni26n / P26.totalAssets * 100, shown: -2.8, tol: 0.05 },
    { what: 'NI falls by salary after tax', value: P26.netIncome - ni26n, shown: 30000 },
    // leverage
    { what: 'Equity growth 2027', value: P27.equity - P26.equity, shown: 20431 },
    { what: 'Dividends 2027', value: P27.dividends, shown: 2000 },
    { what: 'Equity growth = NI − dividends', value: P27.netIncome - P27.dividends, shown: 20431 },
    { what: 'Liabilities 2026', value: P26.totalLiabilities, shown: 51289 },
    { what: 'Liabilities 2027', value: P27.totalLiabilities, shown: 265065 },
    { what: 'Growth in liabilities', value: P27.totalLiabilities - P26.totalLiabilities, shown: 213776 },
    { what: 'Lease liabilities 2027', value: P27.leaseLiabilities, shown: 173379 },
    { what: 'Current ratio 2027', value: R.liquidity(P27).current, shown: 0.52 },
    { what: 'Debt ratio 2027 %', value: P27.totalLiabilities / P27.totalAssets * 100, shown: 81, tol: 0.5 },
    { what: 'Closing assets ÷ equity 2027', value: P27.totalAssets / P27.equity, shown: 5.2, tol: 0.05 },
    { what: 'Closing assets ÷ equity 2026', value: lev26, shown: 2.2, tol: 0.05 },
    // ROIC
    { what: 'EBIT 2027', value: P27.ebit, shown: 32787 },
    { what: 'NOPAT 2027', value: nopat27, shown: 24590, tol: 0.5 },
    { what: 'Invested capital 2026', value: ic26, shown: 72387 },
    { what: 'Invested capital 2027', value: ic27, shown: 128068 },
    { what: 'Average invested capital', value: avgIC, shown: 100227.5 },
    { what: 'ROIC 2027 %', value: nopat27 / avgIC * 100, shown: 24.5, tol: 0.05 },
    { what: 'Operating ROA 2027 %', value: nopat27 / avgTA * 100, shown: 11.7, tol: 0.05 },
    // Starbucks
    { what: 'Starbucks total assets 2024', value: SB.ta[1], shown: 31339.3 },
    { what: 'Starbucks total liabilities 2024', value: 38780.9, shown: 38780.9 },
    { what: 'Starbucks deficit attributable 2024', value: SB.eq[1], shown: -7448.9 },
    { what: 'Starbucks deficit attributable 2023', value: SB.eq[0], shown: -7994.8 },
    { what: 'Starbucks average deficit', value: sbEq, shown: -7721.85 },
    { what: 'Starbucks average total assets', value: sbTA, shown: 30392.4 },
    { what: 'Starbucks ROE (mechanical) %', value: SB.ni / sbEq * 100, shown: -48.7, tol: 0.05 },
    { what: 'Starbucks ROA %', value: SB.ni / sbTA * 100, shown: 12.4, tol: 0.05 },
    { what: 'Starbucks dividends + buybacks exceed net earnings', value: SB.div + SB.buyback - SB.niAll > 0 ? 1 : 0, shown: 1 },
    { what: 'Starbucks net earnings positive FY2022 ($m 3,281.6)', value: 3281.6 > 0 ? 1 : 0, shown: 1 },
    { what: 'Starbucks net earnings positive FY2023 ($m 4,124.5)', value: 4124.5 > 0 ? 1 : 0, shown: 1 },
    { what: 'Starbucks dividends FY2024', value: SB.div, shown: 2585.0 },
    { what: 'Starbucks repurchases FY2024', value: SB.buyback, shown: 1266.7 },
    { what: 'Starbucks net earnings incl. NCI FY2024', value: SB.niAll, shown: 3762.3 },
    { what: 'Starbucks net earnings attributable FY2024', value: SB.ni, shown: 3760.9 },
    { what: 'Starbucks FY2022 repurchases', value: 4013.0, shown: 4013.0 },
    { what: 'Starbucks FY2022 dividends', value: 2263.3, shown: 2263.3 },
    { what: 'Starbucks FY2022 net earnings', value: 3283.4, shown: 3283.4 },
    { what: 'Starbucks FY2022 payouts exceed earnings', value: 4013.0 + 2263.3 - 3283.4 > 0 ? 1 : 0, shown: 1 },
    { what: 'Starbucks deficit narrowed FY2024', value: SB.eq[1] - SB.eq[0], shown: 545.9 },
    // products with an extra place
    { what: 'ROA 2026 % (2 dp)', value: pr26.roa * 100, shown: 29.24 },
    { what: 'ROA 2027 % (2 dp)', value: pr27.roa * 100, shown: 10.64 },
    { what: 'Leverage 2026 (3 dp)', value: lev26, shown: 2.210, tol: 0.0005 },
    { what: 'Leverage 2027 (3 dp)', value: lev27, shown: 4.007, tol: 0.0005 },
    { what: 'Printed product 29.24 × 2.210', value: 29.24 * 2.210, shown: 64.6, tol: 0.05 },
    { what: 'Printed product 10.64 × 4.007', value: 10.64 * 4.007, shown: 42.6, tol: 0.05 },
    // leverage identity for Lantern
    { what: 'Average debt 2027', value: (P26.debt + P27.debt) / 2, shown: 47625 },
    { what: 'Debt 2027', value: P27.debt, shown: 65250 },
    { what: 'Debt 2026', value: P26.debt, shown: 30000 },
    { what: 'D/E on averages', value: (P26.debt + P27.debt) / 2 / avgEq, shown: 0.905, tol: 0.0005 },
    { what: 'Interest 2027', value: P27.interestExpense, shown: 2879 },
    { what: 'r %', value: P27.interestExpense / ((P26.debt + P27.debt) / 2) * 100, shown: 6.05 },
    { what: 'r after tax %', value: P27.interestExpense / ((P26.debt + P27.debt) / 2) * (1 - t) * 100, shown: 4.53 },
    { what: 'ROIC % (2 dp)', value: nopat27 / avgIC * 100, shown: 24.53 },
    { what: 'Spread pp', value: (nopat27 / avgIC - P27.interestExpense / ((P26.debt + P27.debt) / 2) * (1 - t)) * 100, shown: 20.0, tol: 0.05 },
    { what: 'Printed identity 24.53 + 20.00 × 0.905', value: 24.53 + 20.00 * 0.905, shown: 42.6, tol: 0.05 },
    { what: 'Identity exact = ROE', value: (() => { const D = (P26.debt + P27.debt) / 2, r = P27.interestExpense / D, ro = nopat27 / avgIC; return ro + (ro - r * (1 - t)) * D / avgEq; })(), shown: pr27.roe, tol: 1e-9 },
    { what: 'Leverage adds pp', value: (pr27.roe - nopat27 / avgIC) * 100, shown: 18.1, tol: 0.05 },
    { what: 'Kestrel A bad ROE % (2 dp)', value: kAb.roe * 100, shown: 3.00 },
    { what: 'Kestrel B bad ROE % (2 dp)', value: kBb.roe * 100, shown: -1.50 },
    // Saltmarsh
    { what: 'Saltmarsh average assets', value: shTA, shown: 3100000 },
    { what: 'Saltmarsh ROA %', value: SH.ni / shTA * 100, shown: 6.0, tol: 0.05 },
    { what: 'Saltmarsh average equity', value: shEq, shown: 1240000 },
    { what: 'Saltmarsh ROE %', value: SH.ni / shEq * 100, shown: 15.0, tol: 0.05 },
    { what: 'Saltmarsh leverage', value: shTA / shEq, shown: 2.5 },
    { what: 'Saltmarsh other-financed per 2.50', value: 2.5 - 1, shown: 1.5 },
    // Kestrel
    { what: 'Kestrel A good NI', value: kA.ni, shown: 225000 },
    { what: 'Kestrel A good ROE %', value: kA.roe * 100, shown: 11.25 },
    { what: 'Kestrel interest', value: KB.debt * KB.rate, shown: 96000 },
    { what: 'Kestrel B good pretax', value: KB.good - KB.debt * KB.rate, shown: 204000 },
    { what: 'Kestrel B good tax', value: (KB.good - KB.debt * KB.rate) * t, shown: 51000 },
    { what: 'Kestrel B good NI', value: kB.ni, shown: 153000 },
        { what: 'Kestrel B good ROE % exact', value: kB.roe * 100, shown: 19.125 },
    { what: 'Kestrel ROIC good %', value: kRoic * 100, shown: 11.25 },
    { what: 'Kestrel after-tax debt cost %', value: kAfter * 100, shown: 6 },
    { what: 'Kestrel D/E', value: kDE, shown: 1.5 },
    { what: 'Kestrel identity good %', value: (kRoic + (kRoic - kAfter) * kDE) * 100, shown: 19.125 },
    { what: 'Kestrel A bad NI', value: kAb.ni, shown: 60000 },
    { what: 'Kestrel A bad tax', value: KB.bad * t, shown: 20000 },
    { what: 'Kestrel A bad ROE %', value: kAb.roe * 100, shown: 3.0 },
    { what: 'Kestrel B bad pretax', value: KB.bad - KB.debt * KB.rate, shown: -16000 },
    { what: 'Kestrel B bad tax', value: (KB.bad - KB.debt * KB.rate) * t, shown: -4000 },
    { what: 'Kestrel B bad NI', value: kBb.ni, shown: -12000 },
    { what: 'Kestrel B bad ROE %', value: kBb.roe * 100, shown: -1.5 },
    { what: 'Kestrel identity bad %', value: (kRoicBad + (kRoicBad - kAfter) * kDE) * 100, shown: -1.5 },
    { what: 'Kestrel B good ROA %', value: kB.roa * 100, shown: 7.65 },
    { what: 'Kestrel A good ROA %', value: kA.roa * 100, shown: 11.25 },
    { what: 'Kestrel good-year gain pp', value: (kB.roe - kA.roe) * 100, shown: 7.875 },
    { what: 'Kestrel bad-year cost pp', value: (kAb.roe - kBb.roe) * 100, shown: 4.5 },
  ],
};
