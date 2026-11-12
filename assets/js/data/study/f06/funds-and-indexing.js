// funds-and-indexing.js — F06 · Funds and indexing. Content only; exercises are in funds-and-indexing.ex.js.
// Fund returns and fees from case.js (SERIES, ASSETS): SIMULATED monthly history, fictional funds. The Northgate fund
// was generated as the market plus its own mean-zero noise less 0.08% a month (tools/study/f06-data.py). Fee drag from
// core/investments.js feeDrag. Real-world statements are quoted from the SEC’s Investor.gov bulletins and the S&P Dow
// Jones Indices SPIVA U.S. Year-End 2024 scorecard, opened on 11 November 2026.
import { SERIES, MONTHS, DERIVED, ASSETS, ANA } from './case.js?v=31';
import * as IV from '../../../core/investments.js?v=31';

const st = DERIVED.stats;
const RA = IV.regressBeta(SERIES.active, SERIES.market, SERIES.bills);
const te = IV.trackingError(SERIES.active, SERIES.market) * Math.sqrt(12);
const diff = SERIES.active.map((v, i) => v - SERIES.market[i]);
const mdAnn = diff.reduce((a, b) => a + b, 0) / diff.length * 12;
const wealthEnd = (k) => IV.wealth(SERIES[k], 10_000)[180];
const ya = IV.yearly(MONTHS, SERIES.active), ym = IV.yearly(MONTHS, SERIES.market);
const beat = ya.filter((y, i) => y.ret > ym[i].ret).length;
const sec = (fee) => IV.feeDrag({ amount: 100_000, years: 20, r: 0.04, fee }).net;
const ana = (fee) => IV.feeDrag({ amount: ANA.retirement.lump, years: 30, r: 0.07, fee, monthly: ANA.retirement.monthly });
const AI = ana(ASSETS.market.fee), AA = ana(ASSETS.active.fee);
const feeGap = ASSETS.active.fee - ASSETS.market.fee;

export default {
  slug: 'funds-and-indexing',
  title: 'Funds and indexing',
  blurb: 'Compare mutual funds, ETFs and index funds; work out what fees cost over decades; judge an active fund against its index with alpha and tracking error; and weigh the evidence on active management before choosing a fund.',
  status: 'draft',
  objectives: [
    'Describe how mutual funds, exchange-traded funds and index funds work, and how investors buy and sell them.',
    'Calculate what an expense ratio costs over a long investment horizon, with and without regular contributions.',
    'Calculate tracking difference and tracking error, and judge an active fund against its benchmark with alpha and its standard error.',
    'Summarise the evidence on active management from the SPIVA scorecards and explain why costs make beating the market hard on average.',
    'Evaluate a fund using a checklist: what it holds, what it costs, how closely it tracks, and how it is traded.',
  ],
  prerequisites: [
    { lesson: 'f06/capm-and-beta', why: 'Jensen’s alpha, beta by regression and the standard error of an alpha.' },
    { lesson: 'f06/shares-and-markets', why: 'Indexes, value weighting and how shares trade.' },
    { lesson: 'f00/market-participants', why: 'Mutual funds, ETFs and net asset value were introduced there.' },
    { lesson: 'f04/annuities', why: 'Future value of regular savings, which the fee calculation builds on.' },
  ],
  case: 'lantern',

  concept: [
    { case: 'Ana’s retirement account offers four funds: three Harbourline index funds and the Northgate Active Equity Fund, whose managers pick about 60 home-market shares. Northgate charges 0.85% a year; the Harbourline total-market fund charges 0.04%. Northgate’s brochure says its managers aim to beat the market. Ana wants to know what the extra 0.81 points a year would buy her, what they would cost, and what the evidence says. The funds are fictional and their returns simulated for teaching; for real long-run market returns see Damodaran’s historical returns page (references).' },
    { p: 'A fund pools many investors’ money and invests it in a portfolio they share in proportion to what they put in. A <g>mutual fund</g> is bought from and sold back to the fund itself. The SEC’s Investor.gov bulletin explains that investors “buy or sell mutual fund shares at the NAV per share, plus or minus any applicable fees and charges,” and that the <g>net asset value</g> is typically calculated at the end of each business day. An <g>exchange-traded fund</g> (ETF) is instead bought and sold on a stock exchange, from other investors, at market prices whenever the market is open; its price generally stays close to its NAV but may differ from it.' },
    { p: 'Either kind of fund can be managed in two ways. An <g>actively managed fund</g> relies on the skill of its managers to choose holdings, aiming to beat a benchmark. An <g>index fund</g> simply holds the shares or bonds in a chosen <g>stock market index</g> or bond index; Investor.gov describes index funds as designed to achieve approximately the same return as a particular index before fees. Index investing is often called passive investing. Index funds trade less, so their transaction costs are lower, and Investor.gov notes they generally have lower fees and expenses than actively managed funds.' },
    { p: 'Every fund charges its investors for running it. The <g>expense ratio</g> is the fund’s annual operating costs as a percentage of its assets, taken out of the fund’s assets day by day, so it never appears as a bill: it just lowers the return. A fee of 0.85% sounds small next to a return of 8% or 10%, but it is charged every year on everything in the account, including past growth.' },
    { table: {
      caption: 'Ana’s fund menu (fictional funds; returns simulated for 2013–2027)',
      head: ['Fund', 'Type', 'Expense ratio', 'Mean return a year', 'Growth a year (geometric)'],
      align: ['l', 'l', 'r', 'r', 'r'],
      rows: [
        ['Harbourline Total Market Index', 'Index', '0.04%', '10.43%', '9.57%'],
        ['Harbourline International Index', 'Index', '0.07%', '10.27%', '9.11%'],
        ['Harbourline Aggregate Bond Index', 'Index', '0.05%', '4.31%', '4.31%'],
        ['Northgate Active Equity', 'Active', '0.85%', '9.47%', '8.46%'],
      ],
      note: 'Returns are after each fund’s expenses.',
    } },
    { callout: 'key', title: 'Costs are certain; outperformance is not', html: 'A fund’s expense ratio will be charged every year whatever happens. Any extra return its managers might earn is uncertain and, on the evidence, rare after costs. That asymmetry is the core of the case for low-cost index funds.' },
  ],

  theory: [
    { h: 'What fees cost over decades' },
    { p: 'The SEC’s investor bulletin on fees gives a hypothetical: $100,000 invested for 20 years, growing at 4% a year. With an annual fee of 0.25% it ends at roughly $208,000; at 0.50%, roughly $198,000; at 1.00%, roughly $179,000. The bulletin’s summary is that “Over time, even small ongoing fees have a big impact on your investment portfolio.” The fee is a percentage of a growing balance, and every dollar paid in fees also loses the growth it would have earned.' },
    { p: 'For Ana the stakes are larger, because her horizon is longer and she keeps adding money. Suppose, for illustration only, that the share funds earn 7% a year before fees for 30 years, and she invests $5,000 now and $400 a month. Without any fees she would end with $505,842. In the total-market index fund at 0.04% she would end with $501,715; the fees cost her $4,127, or 0.82% of the final value. In Northgate at 0.85%, unless its managers earn more than the market, she would end with $425,690: fees would take $80,153, or 15.85% of what she would otherwise have, and $76,026 more than the index fund. Her own contributions total $149,000.' },
    { table: {
      caption: 'Ana’s account after 30 years at an assumed 7% a year before fees ($5,000 now plus $400 a month)',
      head: ['Fund’s expense ratio', 'Value after 30 years', 'Cost of fees', 'Share of the no-fee value'],
      align: ['r', 'r', 'r', 'r'],
      rows: [
        ['None', '$505,842', '$0', '0%'],
        ['0.04% (total-market index)', '$501,715', '$4,127', '0.82%'],
        ['0.85% (Northgate)', '$425,690', '$80,153', '15.85%'],
      ],
      note: 'An assumption for illustration, not a forecast: monthly compounding, fees charged as a reduction in the annual return.',
    } },
    { h: 'Tracking difference and tracking error' },
    { p: 'An index fund can’t match its index exactly: it pays its expenses and trading costs, holds a little cash, and may hold a sample of the index rather than every security. The <g>tracking difference</g> is the fund’s return minus the index’s over a period; for a well-run index fund it should be close to minus the expense ratio. <g>Tracking error</g> is the standard deviation of those differences: how much the gap varies from period to period. A good index fund has a tracking difference near its fee and a small tracking error.' },
    { p: 'For an active fund the same measures answer a different question. Tracking error measures how far the managers stray from the benchmark, and so how much the result depends on their choices. Over 2013–2027 the simulated Northgate fund’s monthly returns differed from the index fund’s with a standard deviation of 1.07% a month, or 3.72% a year. Its average shortfall was 0.96 points a year.' },
    { h: 'Northgate against the index' },
    { p: 'The capm-and-beta lesson regressed Northgate’s monthly excess returns on the market’s over the fifteen years: beta 1.00 (0.999), R² 0.95, and alpha −0.079% a month, about −0.95% a year, with a standard error of 0.081% a month (t = −0.98). Over the whole period $10,000 grew to $33,821 in Northgate and $39,381 in the index fund. In 7 of the 15 calendar years Northgate beat the index; in the other 8 it trailed, by as much as 7.8 points.' },
    { p: 'Two readings are possible, and the data can’t choose between them. Northgate’s shortfall is close to its extra fees (0.81 points a year), so its managers may have added nothing before fees. Or they may have some skill, or some negative skill, that fifteen years of noisy results can’t reveal: the t-statistic of about −1 is well inside the range chance produces. The simulation was in fact built with Northgate’s own stock-picking noise averaging zero and a shortfall of exactly 0.08% a month, but a real investor never knows that. What she does know in advance is the fee.' },
    { h: 'The evidence on active management' },
    { p: 'S&amp;P Dow Jones Indices publishes SPIVA scorecards comparing actively managed funds with their benchmark indexes. Its U.S. Year-End 2024 report found that 65.24% of all active large-cap US equity funds underperformed the S&amp;P 500 in 2024. Over longer periods the share was higher: 84.34% over 10 years, 89.50% over 15 years and 91.99% over 20 years. Across all the categories it tracks, the report states: “Over the 15-year period ending December 2024, there were no categories in which a majority of active managers outperformed.”' },
    { p: 'There is a simple reason to expect something like this. Before costs, active investors as a group hold the market (since index investors hold it too, the rest of the market is held by the active ones), so on average their return before costs is the market’s. After costs, which are higher for active funds, the average active dollar must trail the market. Some managers will beat it, but picking them in advance is hard, and a few good years are weak evidence, as Northgate’s record shows.' },
    { p: 'This links to market efficiency, the efficient markets hypothesis: if prices already reflect available information, picking underpriced shares is difficult and costly. How efficient markets are, and what the evidence on anomalies shows, is taken up in the fundamental-analysis lesson. Active management can still have a role, for example in less-researched markets or for specific aims, but the hurdle is the fee.' },
    { h: 'What to check before choosing a fund' },
    { list: [
      '<b>What it holds.</b> Which index (and how it is weighted) or what strategy; how many holdings; how concentrated it is in a few shares or one industry.',
      '<b>What it costs.</b> The expense ratio, any sales charges, and for an ETF the brokerage commission and the bid–ask spread each time you trade. Investor.gov notes that investors in both kinds of fund pay fees and expenses regardless of how the fund performs.',
      '<b>How closely it tracks.</b> For an index fund, the tracking difference against its index over several years, and the tracking error.',
      '<b>How it trades.</b> A mutual fund at the end-of-day NAV; an ETF at market prices during the day, which may differ slightly from its NAV.',
      '<b>For an active fund.</b> Its alpha against a suitable benchmark, the alpha’s standard error, and how long the record is; a short record says almost nothing.',
    ] },
    { callout: 'warn', title: 'Past winners are not reliable future winners', html: 'A fund’s ranking over the last few years is a poor guide to the next few: Northgate beat the index in five of the seven years 2018–2024 and trailed in both 2026 and 2027, by 5.3 and 7.5 points. Judge a fund by what you can know in advance (cost, holdings, tracking) more than by recent returns.' },
  ],

  formulas: [
    { id: 'fund-fee-drag', name: 'Value after fees (lump sum)',
      tex: String.raw`V_n = V_0\left[(1 + r)(1 - f)\right]^{n}`,
      where: [[String.raw`V_n`, 'Value after n years', '$'], [String.raw`V_0`, 'Amount invested now', '$'], [String.raw`r`, 'Return before fees', '% per year'], [String.raw`f`, 'Expense ratio', '% per year'], [String.raw`n`, 'Number of years', 'years']],
      assumptions: 'The fee is taken as a share of the year’s value; with regular contributions each payment grows the same way from when it is made.',
      note: 'The cost of fees is V_n at f = 0 minus V_n at the fund’s fee. A spreadsheet’s FV function with rate (1 + r)(1 − f) − 1 gives the same answer.' },
    { id: 'fund-tracking', name: 'Tracking difference and tracking error',
      tex: String.raw`TD = \bar r_F - \bar r_B, \qquad TE = \text{SD}(r_{F,t} - r_{B,t})`,
      where: [[String.raw`r_{F,t},\ r_{B,t}`, 'Fund and benchmark returns in period t', '%'], [String.raw`\bar r_F,\ \bar r_B`, 'Their averages over the period', '% per year'], [String.raw`TD`, 'Tracking difference: the average gap', '% per year'], [String.raw`TE`, 'Tracking error: the standard deviation of the gap', '% per year']],
      assumptions: 'Same periods for fund and benchmark; monthly tracking error × √12 gives an annual figure.' },
  ],

  examples: [
    { level: 'simple', title: 'Checking the SEC’s fee example', fictional: true,
      setup: 'The SEC’s investor bulletin shows $100,000 invested for 20 years at 4% a year before fees. Reproduce its three cases: fees of 0.25%, 0.50% and 1.00% a year.',
      steps: [
        String.raw`With a fee <m>f</m>, each year’s growth factor is <m>1.04 \times (1 - f)</m>.`,
        String.raw`0.25%: <m>100{,}000 \times (1.04 \times 0.9975)^{20} = \$208{,}413</m>.`,
        String.raw`0.50%: <m>100{,}000 \times (1.04 \times 0.995)^{20} = \$198{,}211</m>; 1.00%: <m>100{,}000 \times (1.04 \times 0.99)^{20} = \$179{,}213</m>.`,
        String.raw`Without fees: <m>100{,}000 \times 1.04^{20} = \$219{,}112</m>.`,
      ],
      answer: 'About $208,000, $198,000 and $179,000, matching the bulletin; with no fee, $219,112.',
      interpretation: 'Moving from a 0.25% fee to 1.00% costs about $29,000 on a $100,000 investment over 20 years, about a quarter of the $119,112 the money would have earned with no fees at all.' },
    { level: 'challenging', title: 'Judging Northgate against the index', fictional: true,
      setup: 'Using the simulated 2013–2027 monthly returns: Northgate’s average return was 9.47% a year and the total-market index fund’s 10.43%; the standard deviation of the monthly differences was 1.07% (3.72% a year); Northgate’s regression alpha was −0.079% a month with a standard error of 0.081%. Northgate charges 0.85% and the index fund 0.04%. What can Ana conclude?',
      steps: [
        String.raw`Average shortfall: <m>9.47\% - 10.43\% = -0.96</m> points a year (the tracking difference against the index fund).`,
        'Tracking error: 3.72% a year. Northgate’s managers took real positions away from the index; in a typical year its return differed from the index’s by several points either way.',
        String.raw`Alpha: <m>-0.079\% \times 12 = -0.95\%</m> a year, <m>t = -0.079 \div 0.081 = -0.98</m>: not significantly different from zero.`,
        'Fee gap: 0.85% − 0.04% = 0.81 points a year, close to the shortfall.',
      ],
      answer: 'Northgate trailed the index by about 0.96 points a year, roughly its extra fee, with an alpha that fifteen years of data can’t tell from zero.',
      interpretation: 'Nothing in the record shows skill that would justify the fee, and nothing proves its absence. The fee, which is certain, decides the question for most investors. $10,000 in Northgate became $33,821 against $39,381 in the index fund.' },
    { level: 'applied', title: 'Ana’s choice of share fund', fictional: true,
      setup: 'Ana will invest $5,000 now and $400 a month for 30 years in a home-market share fund, either the total-market index fund (0.04%) or Northgate (0.85%). For illustration she assumes both earn 7% a year before fees (that is, Northgate’s managers neither add nor lose value before costs). What is the difference at retirement, and what else should she check?',
      steps: [
        'Without fees the account would reach $505,842.',
        'Index fund: $501,715 (fees cost $4,127). Northgate: $425,690 (fees cost $80,153).',
        'Difference: $76,026 in favour of the index fund, about half her total contributions of $149,000.',
        'Other checks: the index fund holds every listed home share, weighted by market value, so it is broadly diversified; Northgate holds about 60. Both are funds in her retirement account, so ETF trading costs don’t arise; if she bought an ETF through a broker she would also check commissions and the bid–ask spread.',
      ],
      answer: 'The index fund leaves her about $76,000 better off after 30 years under these assumptions, for the same pre-fee return.',
      interpretation: 'To break even, Northgate’s managers would need to beat the market by 0.81 points a year, every year, before fees. On the SPIVA evidence most active large-cap funds don’t manage even to match their index over 15 or 20 years.' },
  ],

  demo: [
    { widget: 'fund-fees', intro: 'What an expense ratio costs. Start with Ana’s plan; change the fee from 0.04% to 0.85% and watch the gap open over the decades. Then shorten the horizon to 5 years: fees matter far less for short-term money.' },
    { widget: 'fund-growth', intro: 'Growth of $10,000 in the total-market index fund and in Northgate over the simulated fifteen years, at each year end.' },
    { widget: 'fund-gap', intro: 'Northgate’s return minus the index fund’s, year by year. Look for a pattern: there isn’t a reliable one.' },
  ],

  mistakes: [
    { title: 'Thinking a small fee is a small cost', html: 'A fee is charged on the whole balance every year, including past growth. Over 30 years Northgate’s 0.85% would cost Ana about 16% of her final balance under the lesson’s assumptions; the index fund’s 0.04%, under 1%.' },
    { title: 'Choosing a fund by last year’s return', html: 'One year’s ranking is mostly noise. Northgate beat the index by 6.8 points in 2019 and trailed it by 7.5 points in 2027. Use long records, risk-adjusted measures and their standard errors, and give most weight to costs.' },
    { title: 'Confusing an index with an index fund', html: 'An index is a list and a calculation; you can’t invest in it directly. An index fund holds the securities and pays costs, so its return is the index’s minus its tracking difference, close to minus its fee.' },
    { title: 'Assuming ETFs and index funds are the same thing', html: 'ETF describes how a fund trades (on an exchange during the day); index fund describes what it does (track an index). Most ETFs are index funds, but some are actively managed, and many index funds are mutual funds.' },
    { title: 'Reading tracking error as a cost', html: 'Tracking error is variability of the gap, not its average. A fund with a small tracking error can still trail its index steadily by a large fee; check the tracking difference too.' },
  ],

  application: [
    { p: '<b>A pension plan’s fund menu.</b> The trustees of a fictional employer’s retirement plan choose which funds employees may pick. They review each fund’s expense ratio, its benchmark, its tracking difference and, for active funds, its alpha and the length of its record. Because they have a duty to act in members’ interests, a costly fund that has trailed its benchmark by about its fee for a decade is hard to justify keeping, and many plans offer a low-cost index fund as the default.' },
    { p: '<b>An adviser’s fee disclosure.</b> A fictional adviser shows each new client a table like Ana’s: what the recommended funds will cost over the client’s horizon in dollars, not just percentages, alongside the adviser’s own fee. Clients often notice the dollar figures in a way they never noticed the percentages.' },
    { p: '<b>Ana’s decision.</b> Ana reads Northgate’s brochure again. It shows its best five-year period. She compares it with the index fund over the full fifteen years, notes the 0.81-point fee gap and the SPIVA figures, and concludes that her share money belongs in the index funds. She will not rule out an active fund for ever, but the manager would have to show her a long record, an alpha large relative to its standard error, and a fee that leaves room for both of them.' },
  ],

  summary: [
    'Funds pool investors’ money. Mutual funds are bought and sold at the end-of-day NAV; ETFs trade on an exchange at market prices that stay close to NAV.',
    'Index funds aim to match an index before fees; active funds try to beat a benchmark through their managers’ choices. Index funds generally cost less.',
    'Fees compound: at an assumed 7% for 30 years, Ana’s $5,000 plus $400 a month would lose about $4,100 to a 0.04% fee and $80,200 to 0.85%.',
    'Tracking difference is the average gap from the benchmark; tracking error its standard deviation. Simulated Northgate: −0.96 points a year, tracking error 3.72%.',
    'Northgate’s alpha (−0.95% a year, t = −0.98) can’t be told from zero, and its shortfall matches its extra fee.',
    'SPIVA U.S. Year-End 2024: 84.34% of active large-cap funds trailed the S&amp;P 500 over 10 years and 91.99% over 20. Costs make beating the market hard on average.',
    'Before choosing a fund, check what it holds, what it costs, how closely it tracks and how it trades.',
  ],
  glossary: [
    { term: 'Index fund', def: 'A mutual fund or exchange-traded fund designed to achieve approximately the same return as a particular index before fees, by holding the securities in the index or a representative sample of them.' },
    { term: 'Actively managed fund', def: 'A fund whose managers choose its holdings in an attempt to beat a benchmark index, rather than simply holding the index.' },
    { term: 'Expense ratio', def: 'A fund’s annual operating expenses as a percentage of its assets. It is deducted from the fund’s assets, so it lowers the return investors receive.' },
    { term: 'Tracking difference', def: 'A fund’s return minus its benchmark’s over a period. For an index fund it is usually close to minus its expense ratio.' },
    { term: 'Tracking error', def: 'The standard deviation of the differences between a fund’s returns and its benchmark’s: how much the fund’s results stray from the benchmark’s.' },
  ],
  references: [
    { text: 'U.S. Securities and Exchange Commission, Office of Investor Education and Advocacy (2025, 29 April). <i>Characteristics of Mutual Funds and Exchange-Traded Funds (ETFs) – Investor Bulletin</i>. Investor.gov.', url: 'https://investor.gov/introduction-investing/general-resources/news-alerts/alerts-bulletins/characteristics-mutual-funds-exchange-traded-funds', checked: '2026-11-11' },
    { text: 'U.S. Securities and Exchange Commission (2025, 23 July). <i>How Fees and Expenses Affect Your Investment Portfolio – Investor Bulletin</i>. Investor.gov.', url: 'https://www.investor.gov/introduction-investing/general-resources/news-alerts/alerts-bulletins/investor-bulletins/updated', checked: '2026-11-11' },
    { text: 'U.S. Securities and Exchange Commission. <i>Index Fund</i> (glossary). Investor.gov.', url: 'https://www.investor.gov/introduction-investing/investing-basics/glossary/index-fund', checked: '2026-11-11' },
    { text: 'S&amp;P Dow Jones Indices (2025, 4 March). <i>SPIVA U.S. Year-End 2024</i> (report and article).', url: 'https://www.spglobal.com/spdji/en/spiva/article/spiva-us-year-end-2024', checked: '2026-11-11' },
    { text: 'Damodaran, A. <i>Historical Returns on Stocks, Bonds and Bills: 1928–2024</i> (data page, updated 5 January 2026). NYU Stern.', url: 'https://pages.stern.nyu.edu/~adamodar/New_Home_Page/datafile/histretSP.html', checked: '2026-11-11' },
  ],
  checks: [
    { what: 'Northgate fee', value: ASSETS.active.fee * 100, shown: 0.85 },
    { what: 'Index fee', value: ASSETS.market.fee * 100, shown: 0.04 },
    { what: 'Intl fee', value: ASSETS.intl.fee * 100, shown: 0.07 },
    { what: 'Bond fee', value: ASSETS.bonds.fee * 100, shown: 0.05 },
    { what: 'Fee gap', value: feeGap * 100, shown: 0.81 },
    { what: 'About 60 shares', value: ASSETS.active.holds.includes('about 60') ? 1 : 0, shown: 1 },
    { what: 'Market mean', value: st.market.mean * 100, shown: 10.43 },
    { what: 'Intl mean', value: st.intl.mean * 100, shown: 10.27 },
    { what: 'Bond mean', value: st.bonds.mean * 100, shown: 4.31 },
    { what: 'Active mean', value: st.active.mean * 100, shown: 9.47 },
    { what: 'Market growth', value: st.market.growth * 100, shown: 9.57 },
    { what: 'Intl growth', value: st.intl.growth * 100, shown: 9.11 },
    { what: 'Bond growth', value: st.bonds.growth * 100, shown: 4.31 },
    { what: 'Active growth', value: st.active.growth * 100, shown: 8.46 },
    { what: 'SEC 0.25%', value: sec(0.0025), shown: 208413, tol: 0.5 },
    { what: 'SEC 0.50%', value: sec(0.005), shown: 198211, tol: 0.5 },
    { what: 'SEC 1.00%', value: sec(0.01), shown: 179213, tol: 0.5 },
    { what: 'SEC roughly 208k', value: sec(0.0025) / 1000, shown: 208, tol: 0.5 },
    { what: 'SEC roughly 198k', value: sec(0.005) / 1000, shown: 198, tol: 0.5 },
    { what: 'SEC roughly 179k', value: sec(0.01) / 1000, shown: 179, tol: 0.5 },
    { what: 'SEC no fee', value: sec(0), shown: 219112, tol: 0.5 },
    { what: 'SEC no-fee growth', value: sec(0) - 100000, shown: 119112, tol: 0.5 },
    { what: 'SEC 0.25 → 1.00 cost', value: (sec(0.0025) - sec(0.01)) / 1000, shown: 29, tol: 0.5 },
    { what: 'About a quarter of the growth', value: (sec(0.0025) - sec(0.01)) / (sec(0) - 100000), shown: 0.25, tol: 0.01 },
    { what: 'Ana lump', value: ANA.retirement.lump, shown: 5000 },
    { what: 'Ana monthly', value: ANA.retirement.monthly, shown: 400 },
    { what: 'Ana no-fee', value: AI.gross, shown: 505842, tol: 0.5 },
    { what: 'Ana index', value: AI.net, shown: 501715, tol: 0.5 },
    { what: 'Ana index cost', value: AI.cost, shown: 4127, tol: 0.5 },
    { what: 'Ana index cost (about $4,100)', value: AI.cost, shown: 4100, tol: 50 },
    { what: 'Ana index share', value: AI.share * 100, shown: 0.82 },
    { what: 'Ana active', value: AA.net, shown: 425690, tol: 0.5 },
    { what: 'Ana active cost', value: AA.cost, shown: 80153, tol: 0.5 },
    { what: 'Ana active cost (about $80,200)', value: AA.cost, shown: 80200, tol: 50 },
    { what: 'Ana active share', value: AA.share * 100, shown: 15.85 },
    { what: 'Ana active share about 16%', value: AA.share * 100, shown: 16, tol: 0.5 },
    { what: 'Index vs active', value: AI.net - AA.net, shown: 76026, tol: 0.5 },
    { what: 'About half contributions', value: (AI.net - AA.net) / (5000 + 400 * 360), shown: 0.5, tol: 0.03 },
    { what: 'Contributions', value: ANA.retirement.lump + ANA.retirement.monthly * 360, shown: 149000 },
    { what: 'Index under 1%', value: AI.share < 0.01 ? 1 : 0, shown: 1 },
    { what: 'TE monthly', value: te / Math.sqrt(12) * 100, shown: 1.07 },
    { what: 'TE annual', value: te * 100, shown: 3.72 },
    { what: 'Mean shortfall', value: mdAnn * 100, shown: -0.96 },
    { what: 'Mean shortfall from means', value: (st.active.mean - st.market.mean) * 100, shown: -0.96 },
    { what: 'Beta 1.00', value: RA.beta, shown: 1.00 },
    { what: 'Beta 0.999', value: RA.beta, shown: 0.999, tol: 0.0005 },
    { what: 'R2', value: RA.r2, shown: 0.95 },
    { what: 'Alpha monthly', value: RA.alpha * 100, shown: -0.079, tol: 0.0005 },
    { what: 'Alpha annual', value: RA.alpha * 1200, shown: -0.95 },
    { what: 'Alpha annual from rounded', value: -0.079 * 12, shown: -0.95, tol: 0.006 },
    { what: 'SE alpha', value: RA.seAlpha * 100, shown: 0.081, tol: 0.0005 },
    { what: 't alpha', value: RA.alpha / RA.seAlpha, shown: -0.98 },
    { what: 'Planted −0.08% a month', value: -0.0008 * 100, shown: -0.08 },
    { what: '$10k Northgate', value: wealthEnd('active'), shown: 33821, tol: 0.5 },
    { what: '$10k index', value: wealthEnd('market'), shown: 39381, tol: 0.5 },
    { what: 'Beat in 7 years', value: beat, shown: 7 },
    { what: 'Trailed in 8', value: 15 - beat, shown: 8 },
    { what: 'Largest shortfall', value: Math.min(...ya.map((y, i) => y.ret - ym[i].ret)) * 100, shown: -7.8, tol: 0.05 },
    { what: '2019 gap', value: (ya[6].ret - ym[6].ret) * 100, shown: 6.8, tol: 0.05 },
    { what: '2026 gap', value: (ya[13].ret - ym[13].ret) * 100, shown: -5.3, tol: 0.05 },
    { what: '2027 gap', value: (ya[14].ret - ym[14].ret) * 100, shown: -7.5, tol: 0.05 },
    { what: '2019 index', value: Number(ya[6].year), shown: 2019 },
    { what: 'Beat in 5 of 7 years 2018–2024', value: [5, 6, 7, 8, 9, 10, 11].filter((i) => ya[i].ret > ym[i].ret).length, shown: 5 },
    { what: 'SPIVA 2024', value: 65.24, shown: 65.24 },
    { what: 'SPIVA 10y', value: 84.34, shown: 84.34 },
    { what: 'SPIVA 15y', value: 89.50, shown: 89.50 },
    { what: 'SPIVA 20y', value: 91.99, shown: 91.99 },
  ],
};
