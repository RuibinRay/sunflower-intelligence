// measuring-returns.js — F06 · Measuring returns. Content only; exercises are in measuring-returns.ex.js.
// The market history is SIMULATED (case.js SERIES, from tools/study/f06-data.py): every fund, index and share is
// fictional. Ana’s plan (ANA) and her 2.8% inflation assumption come from case.js (F04). Corriebank Ferries is a
// fictional listed company. Damodaran’s figures are quoted from his “Historical Returns on Stocks, Bonds and Bills”
// page (updated 5 January 2026, opened 11 November 2026); the compound rates derived from them are our arithmetic.
import { MONTHS, SERIES, ANA, DERIVED } from './case.js?v=31';
import * as IV from '../../../core/investments.js?v=31';

const st = DERIVED.stats;
const years = IV.yearly(MONTHS, SERIES.market);
const ym = years.map((y) => y.ret);
const yArith = ym.reduce((a, b) => a + b, 0) / ym.length;
const yGeo = IV.geometric(ym);
const ySd = Math.sqrt(ym.reduce((s, v) => s + (v - yArith) ** 2, 0) / (ym.length - 1));
const wealthM = IV.wealth(ym);
const wealthB = IV.wealth(IV.yearly(MONTHS, SERIES.bonds).map((y) => y.ret));
const wealthT = IV.wealth(IV.yearly(MONTHS, SERIES.bills).map((y) => y.ret));
const mMonthArith = IV.arithmetic(SERIES.market), mMonthGeo = IV.geometric(SERIES.market);
const excessMonth = SERIES.market.reduce((s, v, i) => s + v - SERIES.bills[i], 0) / SERIES.market.length;
const infl = ANA.inflation;
const realM = IV.realReturn(st.market.growth, infl), realB = IV.realReturn(st.bonds.growth, infl), realT = IV.realReturn(st.bills.growth, infl);
// Corriebank Ferries (fictional): bought at $40.00, $1.40 of dividends, sold at $43.20 a year later
const CB = { p0: 40, p1: 43.2, d: 1.4 };
// scenarios for the market fund next year (fictional)
const SCEN = [{ p: 0.25, r: 0.30 }, { p: 0.50, r: 0.10 }, { p: 0.25, r: -0.15 }];
const sc = IV.scenarios(SCEN);
const billNext = 0.04;
// Ana’s account: $5,000 now and $400 at the end of each month for 30 years
const fv = (rate, yrs = 30) => { const i = (1 + rate) ** (1 / 12) - 1, n = yrs * 12; return ANA.retirement.lump * (1 + i) ** n + ANA.retirement.monthly * ((1 + i) ** n - 1) / i; };
// Damodaran’s values of $100 invested at the start of 1928, at the end of 2025 (98 years)
const DAM = { stocks: 1_157_598.95, bills: 2_578.30, bonds: 7_752.88, years: 2025 - 1928 + 1 };
const damRate = (v) => (v / 100) ** (1 / DAM.years) - 1;
const num = (s) => parseFloat(String(s).replace('−', '-').replace(/[%$,]/g, ''));

const YEAR_ROWS = [
  ['2013', '−5.2%', '0.948'], ['2014', '46.5%', '1.388'], ['2015', '3.6%', '1.438'], ['2016', '37.2%', '1.973'],
  ['2017', '18.1%', '2.331'], ['2018', '10.8%', '2.583'], ['2019', '15.0%', '2.972'], ['2020', '−10.1%', '2.673'],
  ['2021', '15.0%', '3.075'], ['2022', '−26.9%', '2.248'], ['2023', '−4.8%', '2.141'], ['2024', '−0.9%', '2.121'],
  ['2025', '33.9%', '2.840'], ['2026', '17.2%', '3.330'], ['2027', '18.3%', '3.938'],
];
const SUMMARY = [
  ['bills', 'One-month bills', '2.03%', '2.05%', '$1.36'],
  ['bonds', 'Aggregate Bond Index Fund', '4.31%', '4.31%', '$1.88'],
  ['intl', 'International Index Fund', '10.27%', '9.11%', '$3.70'],
  ['market', 'Total Market Index Fund', '10.43%', '9.57%', '$3.94'],
  ['morrow', 'Morrow &amp; Pike Roasters (one share)', '9.59%', '6.71%', '$2.65'],
  ['harbour', 'Harbour Street Foods (one share)', '12.53%', '7.60%', '$3.00'],
];

export default {
  slug: 'measuring-returns',
  title: 'Measuring returns',
  blurb: 'Turn prices and payouts into returns you can compare: holding-period returns, arithmetic and geometric averages, annualised and real returns, expected returns from scenarios and the premium over the risk-free rate, using fifteen years of simulated fund returns and Ana’s retirement plan.',
  status: 'draft',
  objectives: [
    'Calculate a holding-period return from prices and income, split it into its price and income parts, and annualise it.',
    'Calculate the arithmetic and geometric mean of a series of returns and explain why the geometric mean is never larger.',
    'Choose the right average for a question: the expected return for one period, or the compound growth of money over many.',
    'Convert nominal returns into real returns with the Fisher relation and measure a return in excess of the risk-free rate.',
    'Calculate an expected return from scenarios and contrast it with an average of past returns.',
  ],
  prerequisites: [
    { lesson: 'f04/simple-and-compound-interest', why: 'Compounding and the compound annual growth rate, which the geometric mean generalises.' },
    { lesson: 'f04/inflation-and-real-returns', why: 'The exact Fisher relation between nominal returns, real returns and inflation.' },
    { lesson: 'f00/finance-time-and-risk', why: 'Expected value, the risk-free rate and the risk premium were introduced there in words.' },
    { lesson: 'f06/shares-and-markets', why: 'What a share, a dividend and an index fund are.' },
  ],
  case: 'lantern',

  concept: [
    { case: 'It is June 2028. On 1 July Ana opens a retirement account with $5,000, a gift from her parents, and will add $400 at the end of every month until she retires in about 30 years. Her flat-deposit savings stay where F04 put them, $914.19 a month in her Sandpiper Online savings account for April 2032, and her $6,000 emergency fund stays in cash. Before she chooses what the retirement account holds, she wants to know how to measure what investments have earned, so that she compares like with like.' },
    { p: 'A <b>return</b> measures what an investment earned relative to what it cost. Owning a share or a fund pays you in two ways: its price may rise or fall, and it may pay income, <g>dividends</g> on shares or coupons on bonds. The <g>total return</g> counts both. A return measured over the time you hold the investment, from the day you buy to the day you sell or value it, is its <g>holding-period return</g>.' },
    { p: 'One period’s return is easy. The questions start when there are many. If an investment rises 50% one year and falls 50% the next, its average yearly return is 0%, yet $100 became $150 and then $75. The plain average, the <b>arithmetic mean</b>, describes a typical single year; the <g>geometric mean</g>, the constant rate that would have produced the same ending wealth, describes what compounding actually did. Here it is −13.4% a year. Both are correct answers to different questions, and confusing them is the commonest error in the subject.' },
    { p: 'A return also needs a yardstick. Against <g>inflation</g> it becomes a <g>real return</g>: what the money gained in purchasing power. Against the <g>risk-free rate</g> it becomes an <g>excess return</g>: what investors earned for bearing <g>risk</g>, a historical measure of the <g>risk premium</g>. And for decisions about the future, the figure you want is an <g>expected return</g>: a probability-weighted view of what might happen, which history can inform but cannot supply.' },
    { callout: 'warn', title: 'The market history in this course is simulated', html: 'The fifteen years of monthly returns used in F06 (January 2013 to December 2027) were generated by a computer program for teaching. The funds, their index and the companies are fictional, and the sizes were chosen to look broadly like long-run US figures, so the methods you practise here are the ones you would use on real data. Never quote these numbers as facts about real markets. Real history should be checked against sources such as Aswath Damodaran’s annually updated table of historical returns on US stocks, bonds and bills.' },
    { table: {
      caption: 'Fifteen years of simulated total returns, January 2013 – December 2027',
      head: ['Asset (all fictional)', 'Arithmetic mean, a year', 'Compound growth, a year', '$1 became'],
      align: ['l', 'r', 'r', 'r'],
      rows: SUMMARY.map((r) => r.slice(1)),
      note: 'Arithmetic mean: the mean monthly return × 12. Compound growth: the geometric mean monthly return compounded over 12 months, (1 + g)<sup>12</sup> − 1. Fund returns are after the funds’ fees. Simulated for teaching, not real market history.',
    } },
    { p: 'Read the table across. The share funds earned far more than bills and bonds; a dollar in the total market fund became $3.94. And in every row the compound growth rate is at or below the arithmetic mean, by more where returns swung more: the single shares lost about three to five points a year to compounding. The rest of this lesson explains where each number comes from, and which one to use for which decision.' },
  ],

  theory: [
    { h: 'The holding-period return' },
    { p: String.raw`Buy at a price <m>P_0</m>, receive income <m>D</m> while you hold the investment, and sell or value it at <m>P_1</m>. The holding-period return is the gain divided by what you paid: <m>\text{HPR} = (P_1 - P_0 + D) \div P_0</m>. It splits into a <b>price return</b> (or capital gain yield), <m>(P_1 - P_0) \div P_0</m>, and an <b>income return</b> (the dividend yield for a share), <m>D \div P_0</m>. OpenStax calls the result the realised return: “The realized return of an investment is the total return that occurs over a particular time period.”` },
    { p: 'A price index ignores income; a <b>total return</b> index assumes every payout is reinvested. For shares the difference compounds into a large gap over decades, so always ask which one a chart shows. Every monthly return for the funds and shares in this course is a total return, and each fund’s return is after its fees.' },
    { p: 'A holding-period return measures one sum of money over one stretch of time. Ana’s account will not be one sum: she adds $400 a month. Its return can be measured in two ways. The <b>time-weighted return</b> links each month’s return, as the fund tables in this lesson do; it measures the investment, regardless of when money arrived. The <b>money-weighted return</b> is the <g>internal rate of return</g> of her own deposits and the ending value (F04); it measures her experience, and is higher than the time-weighted return if she happened to add most money just before good months. Fund reports use the first, because the manager does not control the timing of deposits.' },

    { h: 'Annualising' },
    { p: String.raw`Returns over different lengths of time can be compared only once they are put on the same basis, usually a year. A return earned over <m>T</m> years compounds to an annual rate of <m>(1 + \text{HPR})^{1/T} - 1</m>, the <g>compound annual growth rate</g> of F04. A 30% gain over two and a half years is <m>1.30^{1/2.5} - 1 = 11.07\%</m> a year, not <m>30\% \div 2.5 = 12\%</m>. In the same way a monthly growth rate <m>g</m> compounds to <m>(1 + g)^{12} - 1</m> a year.` },
    { p: 'This course follows one convention for monthly averages: the <b>arithmetic</b> monthly mean is multiplied by 12, and the <b>geometric</b> monthly mean is compounded. Multiplying is not exact compounding, but it keeps the annual figure an arithmetic mean, which is what the risk measures of the next lesson and the portfolio lessons of module 3 are built on. Say which you have used whenever you report an annual figure.' },

    { h: 'Arithmetic and geometric means' },
    { p: String.raw`For <m>n</m> period returns <m>r_1, \dots, r_n</m>, the <b>arithmetic mean</b> is <m>\bar r = (r_1 + \dots + r_n) \div n</m> and the geometric mean is <m>g = [(1+r_1)(1+r_2)\cdots(1+r_n)]^{1/n} - 1</m>. The geometric mean is the single rate that, compounded <m>n</m> times, turns $1 into the same ending wealth as the actual returns did. Compounding works on the growth factors <m>1 + r</m>, which is why the geometric mean multiplies them rather than adding the returns.` },
    { p: String.raw`The geometric mean is never larger than the arithmetic mean, and the two are equal only when every return is the same. The gap grows with how much the returns vary: approximately, <m>g \approx \bar r - \tfrac{1}{2}\sigma^2</m>, where <m>\sigma</m> is the standard deviation of the returns, the measure of spread that the next lesson treats in full. A loss needs a larger gain to recover from it (after −50%, +100%), so swings cost compound growth even when they average out. Investors call this cost <b>volatility drag</b>.` },
    { p: String.raw`The simulated total market fund shows all of this. Its fifteen calendar-year returns, from −26.9% in 2022 to +46.5% in 2014, have an arithmetic mean of 11.19% and a geometric mean of 9.57%: $1 at the start of 2013 became $3.94 by the end of 2027, and <m>3.938^{1/15} - 1 = 9.57\%</m>. Their standard deviation is 19.33%, so the approximation gives <m>11.19\% - \tfrac{1}{2}(0.1933)^2 = 9.32\%</m>, close to the exact 9.57%.` },
    { p: 'Monthly data tell the same story at a finer grain. The fund’s mean monthly return is 0.869% and its geometric mean monthly return 0.764%. Compounding the geometric monthly mean gives 9.57% a year again: compound growth does not depend on how finely you slice the period. The arithmetic mean does. Twelve times the monthly mean is 10.43%, not the 11.19% of the calendar years, because a calendar-year return already includes compounding within the year. This is why an arithmetic mean should always be quoted with its period and how it was annualised.' },
    { callout: 'key', title: 'Which mean answers which question', html: 'To estimate the return of one future period drawn from the same history, the arithmetic mean is the better guide. To describe how money actually grew, or to plan how a sum may grow over many years, use the geometric mean. Over a long horizon a typical outcome grows at about the geometric rate; compounding the arithmetic mean instead gives the average of all the possible ending values, which a few very good outcomes pull upwards.' },

    { h: 'Growth of $1' },
    { p: 'A <g>wealth index</g> follows $1 invested at the start through every period’s return, with all income reinvested: it is the running product of the growth factors. It shows the path as well as the destination: the total market fund’s dollar was worth $3.07 at the end of 2021, $2.25 at the end of 2022, and did not pass its 2021 value again until 2026. The bond fund’s dollar grew to $1.88 and bills’ to $1.36. The chart in Explore draws all three.' },

    { h: 'Real returns' },
    { p: String.raw`F04’s exact <g>Fisher relation</g> converts a <g>nominal return</g> into a real one: <m>1 + r_{\text{real}} = (1 + r_{\text{nominal}}) \div (1 + \pi)</m>, where <m>\pi</m> is inflation over the same period. The simulated history has no inflation series, so to see what the funds’ compound growth would mean in purchasing power, apply Ana’s planning assumption of 2.8% a year. The market fund’s 9.57% becomes <m>1.0957 \div 1.028 - 1 = 6.58\%</m> real; the bond fund’s 4.31% becomes 1.47%; and bills’ 2.05% becomes −0.73%: money in bills would have lost purchasing power.` },
    { p: 'The shortcut of subtracting inflation (9.57% − 2.8% = 6.77%) is close at low rates and wrong by more as rates rise. Long-horizon plans are clearest in real terms, because a real ending value is in dollars of today’s spending power.' },

    { h: 'Expected return from scenarios' },
    { p: String.raw`History tells you what happened. A decision needs a view of what may happen, and the simplest is a set of scenarios with probabilities. The <g>expected return</g> is their probability-weighted average, <m>E(r) = \sum_s p_s r_s</m>: F00’s <g>expected value</g> applied to a return. Suppose an analyst gives the total market fund three scenarios for next year (fictional): a strong year (+30%) with probability 0.25, a normal year (+10%) with 0.50 and a downturn (−15%) with 0.25. Then <m>E(r) = 0.25 \times 30\% + 0.50 \times 10\% + 0.25 \times (-15\%) = 8.75\%</m>.` },
    { p: 'The expected return is not a return anyone is expected to earn. No scenario pays 8.75%; it is the centre of the distribution of outcomes. The probabilities and the outcomes are judgements, so an expected return is only as good as the scenarios behind it, and history is one input to them, not a substitute.' },

    { h: 'Excess returns and the risk premium' },
    { p: String.raw`An excess return subtracts the risk-free rate for the same period: <m>r_t - r_{f,t}</m>. In this course the risk-free asset is the one-month bill, whose return each month is known when the month begins. The market fund’s mean excess return over the fifteen years is 0.70% a month, 8.40% a year (the simulation set it there on purpose). The bond fund’s is 2.28% a year. Against the analyst’s scenarios, with a one-year bill paying 4.0% (fictional), the market’s expected excess return next year is <m>8.75\% - 4.0\% = 4.75\%</m>.` },
    { p: 'An average excess return over a past period is a historical estimate of the risk premium. F05’s <g>market risk premium</g> of 5.5% is a different quantity: a forward-looking assumption measured over long-term government bonds rather than bills. A premium measured over bills is larger, because bills usually yield less than long-term bonds, so always say what a premium is measured over and over which years.' },

    { h: 'What real history looks like' },
    { p: 'For comparison with the simulation, Damodaran’s table of US returns (updated January 2026) shows that $100 invested at the start of 1928 in the S&amp;P 500 with dividends reinvested was worth $1,157,598.95 at the end of 2025; in three-month Treasury bills, $2,578.30; and in ten-year Treasury bonds, $7,752.88. Over those 98 years that is compound growth of about 10.0%, 3.4% and 4.5% a year (our arithmetic from his figures), before inflation. One country’s century, chosen because its data are good, is still a single history: it is evidence about the future, not a promise.' },
  ],

  formulas: [
    { id: 'ret-hpr', name: 'Holding-period return',
      tex: String.raw`\text{HPR} = \dfrac{P_1 - P_0 + D}{P_0} = \underbrace{\dfrac{P_1 - P_0}{P_0}}_{\text{price return}} + \underbrace{\dfrac{D}{P_0}}_{\text{income return}}`,
      where: [[String.raw`P_0`, 'Price paid at the start', '$'], [String.raw`P_1`, 'Price (or value) at the end', '$'], [String.raw`D`, 'Income received during the period: dividends, coupons, fund distributions', '$']],
      assumptions: 'Income is counted when received and not reinvested within the period.' },
    { id: 'ret-annualise', name: 'Annualising a holding-period return',
      tex: String.raw`r_{\text{annual}} = (1 + \text{HPR})^{1/T} - 1`,
      where: [[String.raw`r_{\text{annual}}`, 'The equivalent compound rate a year', '% per year'], [String.raw`\text{HPR}`, 'Holding-period return over the whole period', ''], [String.raw`T`, 'Length of the period', 'years (12 months = 1)']],
      assumptions: 'The annual rate that compounds to the same total. For a monthly geometric mean g, the annual rate is (1 + g)^12 − 1.' },
    { id: 'ret-arith', name: 'Arithmetic mean return',
      tex: String.raw`\bar r = \dfrac{1}{n}\sum_{t=1}^{n} r_t`,
      where: [[String.raw`r_t`, 'Return in period t', '% per period'], [String.raw`n`, 'Number of periods', '']],
      note: 'This course annualises a monthly arithmetic mean by multiplying by 12.' },
    { id: 'ret-geo', name: 'Geometric mean return',
      tex: String.raw`g = \left[\prod_{t=1}^{n}(1 + r_t)\right]^{1/n} - 1 \approx \bar r - \tfrac{1}{2}\sigma^2`,
      where: [[String.raw`g`, 'Geometric mean return: the compound rate per period', '% per period'], [String.raw`r_t`, 'Return in period t', '% per period'], [String.raw`n`, 'Number of periods', ''], [String.raw`\bar r`, 'Arithmetic mean return', '% per period'], [String.raw`\sigma`, 'Standard deviation of the returns', '% per period']],
      assumptions: 'The approximation is close when returns are modest; the exact formula always holds. In a spreadsheet: =GEOMEAN(1+range)−1.' },
    { id: 'ret-real', name: 'Real return (exact Fisher relation)',
      tex: String.raw`r_{\text{real}} = \dfrac{1 + r_{\text{nominal}}}{1 + \pi} - 1`,
      where: [[String.raw`r_{\text{nominal}}`, 'Return in dollars', '% per year'], [String.raw`\pi`, 'Inflation over the same period', '% per year']],
      assumptions: 'Both rates cover the same period.' },
    { id: 'ret-expected', name: 'Expected return from scenarios',
      tex: String.raw`E(r) = \sum_{s=1}^{S} p_s\, r_s`,
      where: [[String.raw`E(r)`, 'Expected return', '%'], [String.raw`p_s`, 'Probability of scenario s (the probabilities sum to 1)', ''], [String.raw`r_s`, 'Return if scenario s happens', '%'], [String.raw`S`, 'Number of scenarios', '']] },
    { id: 'ret-excess', name: 'Excess return',
      tex: String.raw`r^{e}_t = r_t - r_{f,t}`,
      where: [[String.raw`r_t`, 'Return on the investment in period t', '%'], [String.raw`r_{f,t}`, 'Risk-free return for the same period (one-month bills here)', '%']],
      note: 'Its average over a past period is a historical estimate of the risk premium; say which risk-free rate and which years.' },
  ],

  examples: [
    { level: 'simple', title: 'One year in Corriebank Ferries', fictional: true,
      setup: 'Ana’s friend bought 100 shares of Corriebank Ferries, a fictional listed ferry operator, at $40.00 each. Over the next year she received dividends of $1.40 a share, and at the end of the year the shares traded at $43.20. What was her holding-period return, and how much of it came from the dividend?',
      steps: [
        'Price return: <m>(43.20 - 40.00) \\div 40.00 = 3.20 \\div 40.00 = 8.0\\%</m>.',
        'Income return (dividend yield on the purchase price): <m>1.40 \\div 40.00 = 3.5\\%</m>.',
        'Holding-period return: <m>(43.20 - 40.00 + 1.40) \\div 40.00 = 4.60 \\div 40.00 = 11.5\\%</m>, the sum of the two parts.',
        'In dollars on 100 shares: a $320 rise in value plus $140 of dividends, $460 on $4,000.',
      ],
      answer: 'A total return of 11.5% for the year: 8.0% from the price and 3.5% from dividends.',
      interpretation: 'A price chart would have shown only 8.0%. Income is part of the return, and over many years reinvested dividends make up a large share of what shareholders earn.' },
    { level: 'challenging', title: 'Fifteen years of the total market fund', fictional: true,
      setup: 'The table gives the simulated Harbourline Total Market Index Fund’s calendar-year total returns and the value at each year-end of $1 invested at the start of 2013. Find the arithmetic and geometric mean yearly returns, check the geometric mean against the growth of $1, and compare the gap with the approximation g ≈ r̄ − ½σ².',
      table: { head: ['Year', 'Total return', 'Value of $1 at year-end'], align: ['l', 'r', 'r'], rows: YEAR_ROWS },
      steps: [
        'Arithmetic mean: add the fifteen returns and divide by 15: <m>167.85\\% \\div 15 = 11.19\\%</m> a year.',
        'Geometric mean: multiply the growth factors, <m>0.948 \\times 1.465 \\times \\dots \\times 1.183 = 3.938</m>, which is the final value of $1; then <m>3.938^{1/15} - 1 = 9.57\\%</m> a year.',
        'The gap is <m>11.19\\% - 9.57\\% = 1.62</m> percentage points. The yearly returns have a sample standard deviation of 19.33%, so <m>\\tfrac{1}{2}(0.1933)^2 = 1.87</m> points: the approximation predicts 9.32%, a little below the exact figure.',
        'Check with the monthly data: the geometric mean monthly return, 0.764%, compounds to <m>1.00764^{12} - 1 = 9.57\\%</m>, the same as the calendar years. Compound growth does not depend on how the period is sliced.',
      ],
      answer: 'Arithmetic mean 11.19% a year, geometric mean 9.57% a year; $1 became $3.94.',
      interpretation: 'An investor who held the fund for the whole fifteen years earned 9.57% a year compounded. Quoting 11.19% as “the fund’s return” would overstate what money in it actually grew at by 1.62 points a year. The swings, not the fees or the timing, account for the gap. These returns are simulated.' },
    { level: 'applied', title: 'What Ana’s account might grow to', fictional: true,
      setup: 'Ana will put $5,000 into her retirement account on 1 July 2028 and $400 at the end of every month for 30 years ($149,000 in all). To see what different ways of reading the fund’s history would imply, she projects the account as if it were all in the total market fund and the next 30 years compounded at (a) the simulated arithmetic mean of yearly returns, 11.19%; (b) the geometric mean, 9.57%; (c) the geometric mean in real terms with her 2.8% inflation assumption, 6.58%.',
      steps: [
        'Turn each annual rate into a monthly one by compounding backwards: for 9.57%, <m>1.0957^{1/12} - 1 = 0.764\\%</m> a month (the fund’s geometric mean monthly return).',
        'Future value of the lump sum plus the monthly annuity (F04): <m>FV = 5{,}000(1+i)^{360} + 400 \\times [(1+i)^{360} - 1] \\div i</m>.',
        'At 11.19%: $1,161,046. At 9.57%: $836,742. At the real 6.58%: $467,277 in today’s dollars.',
        'Compare: using the arithmetic mean adds $324,304 (39%) to the geometric projection; stating the result in today’s money removes almost half of it.',
      ],
      answer: 'About $837,000 in 30 years’ dollars at the simulated geometric mean, or about $467,000 in today’s purchasing power; the arithmetic mean would suggest $1.16 million.',
      interpretation: 'For a plan, use the geometric mean and real terms: $467,000 of today’s spending power is the figure Ana can compare with what she will need. None of these is a forecast. They rest on a simulated history, on holding only shares (module 3 decides the mix) and on no change in her deposits, and the next lesson shows how wide the range around any such figure is.' },
  ],

  demo: [
    { widget: 'ret-growth', intro: 'The value of $1 invested in January 2013 in each simulated asset, at each year-end. Notice the market fund’s fall in 2022 and how long it took to regain its 2021 level, and how smooth the bills line is.' },
    { widget: 'ret-years', intro: 'The same fifteen years as calendar-year returns. The market fund’s bars swing between −27% and +47%; the bond fund’s mostly sit between 0% and 11%, with one bad year in 2022.' },
    { widget: 'ret-drag', intro: 'Set an arithmetic mean and a standard deviation and see the approximate compound growth rate and where a sum ends up. Raise the standard deviation with the mean fixed: the compound rate falls. Set it to 0 and the two means agree.' },
  ],

  mistakes: [
    { title: 'Averaging returns to describe growth', html: 'A fund that gains 50% and then loses 50% has an arithmetic mean of 0% but has lost a quarter of the money. To describe or project compound growth use the geometric mean, or follow $1 through the returns.' },
    { title: 'Leaving out the income', html: 'A price return ignores dividends and coupons. Comparing a share’s price change with a fund’s total return, or reading a price index as if it were what investors earned, understates shares’ returns. Check that both figures are total returns.' },
    { title: 'Annualising by division', html: 'A 30% gain over 2.5 years is 11.07% a year, not 12%: compound with <m>(1 + \\text{HPR})^{1/T} - 1</m>. Multiplying a monthly <i>arithmetic</i> mean by 12 is a stated convention; multiplying a monthly <i>growth</i> rate by 12 is an error.' },
    { title: 'Subtracting inflation', html: 'A real return is <m>(1 + r) \\div (1 + \\pi) - 1</m>. Subtracting is a shortcut that overstates the real return, by more as rates rise. Never mix a nominal return with a real one in the same comparison.' },
    { title: 'Treating a past average as the expected return', html: 'Fifteen years of history, real or simulated, is one draw of what could have happened. A past average is evidence for an expected return, not the expected return itself, and it depends heavily on the start and end dates. Say which period an average covers.' },
    { title: 'Judging an account by a fund’s published return', html: 'A fund’s time-weighted return measures the fund. An investor who added money before falls and withdrew before rises earned a different, money-weighted return. Compare like with like.' },
  ],

  application: [
    { p: '<b>Ana’s planning note.</b> Ana’s projection for her accountant states each assumption in a line: the deposits, the return as a geometric mean, the inflation rate, and the result in today’s dollars. She shows two rates, not one, because no single history pins the return down; the next lesson adds the spread of outcomes around them. She keeps the deposit savings and the emergency fund out of the projection: money she needs within four years is a different problem, and the next lesson shows with the same data why it does not belong in shares.' },
    { p: '<b>Reading a fund report.</b> A fund report usually shows cumulative returns and annualised returns over one, three, five and ten years. Read the annualised figures as geometric means, check that they are total returns after fees, compare them with the fund’s benchmark over the same dates, and notice the start date: a period that begins just after a crash flatters every average. The funds-and-indexing lesson in module 3 adds what fees cost and how to judge an active fund.' },
    { p: '<b>A pension trustee’s assumptions.</b> Trustees who must decide what a scheme can promise its members work in real, compound terms: they ask what the assets may earn above inflation each year over decades, and treat higher arithmetic figures as an upper bound. They also separate the return they assume from the return they hope for, and test the plan against lower figures, the subject of the next lesson.' },
  ],

  summary: [
    'A holding-period return is (P₁ − P₀ + D) ÷ P₀: a price return plus an income return. Use total returns, with income reinvested.',
    'Annualise by compounding: (1 + HPR)^(1/T) − 1. This course annualises a monthly arithmetic mean by × 12 and a monthly geometric mean by compounding.',
    'The geometric mean is never above the arithmetic mean; the gap is about ½σ², so more volatile investments lose more to compounding.',
    'Use the arithmetic mean for one period’s expected return and the geometric mean for compound growth over many periods.',
    'Real return = (1 + nominal) ÷ (1 + inflation) − 1. Long plans are clearest in real terms.',
    'An expected return is a probability-weighted average of scenarios: a view of the future, not an average of the past.',
    'An excess return is the return minus the risk-free rate; its past average estimates the risk premium. Say what it is measured over.',
    'F06’s market history is simulated: the simulated total market fund grew 9.57% a year compounded (arithmetic mean 11.19% of calendar years).',
  ],
  glossary: [
    { term: 'Total return', def: 'The whole return on an investment over a period: the change in its price plus the income it paid (dividends, coupons or distributions), usually as a percentage of the starting price.' },
    { term: 'Holding-period return', def: 'The total return earned over the time an investment is held: (ending price − starting price + income) ÷ starting price.' },
    { term: 'Geometric mean', def: 'The nth root of the product of n positive values, equal to the back-transformed mean of their logs; never larger than the arithmetic mean.' },
    { term: 'Wealth index', def: 'The value over time of $1 invested at the start, found by compounding each period’s total return. Also called the growth of $1.' },
    { term: 'Expected return', def: 'The probability-weighted average of the returns an investment could earn over a future period: the sum of each possible return times its probability.' },
    { term: 'Excess return', def: 'The return on an investment minus the risk-free return over the same period.' },
  ],
  references: [
    { text: 'Dahlquist, J. &amp; Knight, R. (2022). <i>Principles of Finance</i>, section 15.1, “Risk and Return to an Individual Asset”. OpenStax.', url: 'https://openstax.org/books/principles-finance/pages/15-1-risk-and-return-to-an-individual-asset', checked: '2026-11-11' },
    { text: 'Damodaran, A. <i>Historical Returns on Stocks, Bonds and Bills: 1928–2024</i> (data page, updated 5 January 2026; its table runs to 2025). NYU Stern.', url: 'https://pages.stern.nyu.edu/~adamodar/New_Home_Page/datafile/histretSP.html', checked: '2026-11-11' },
    { text: 'Microsoft. <i>GEOMEAN function</i>. Microsoft Support.', url: 'https://support.microsoft.com/en-us/office/geomean-function-db1ac48d-25a5-40a0-ab83-0b38980e40d5', checked: '2026-11-11' },
  ],
  checks: [
    // the case
    { what: 'Retirement lump sum', value: ANA.retirement.lump, shown: 5000 },
    { what: 'Monthly deposit', value: ANA.retirement.monthly, shown: 400 },
    { what: 'F04 deposit saving a month', value: ANA.deposit.monthly, shown: 914.19 },
    { what: 'Emergency fund', value: ANA.emergency, shown: 6000 },
    { what: 'Inflation assumption', value: infl * 100, shown: 2.8 },
    { what: 'Months in the history', value: MONTHS.length, shown: 180 },
    { what: 'Total deposits over 30 years', value: ANA.retirement.lump + ANA.retirement.monthly * 360, shown: 149000 },
    // 50 / −50
    { what: '+50% then −50%: arithmetic', value: (0.5 - 0.5) / 2 * 100, shown: 0 },
    { what: '+50% then −50%: $100 → $150', value: 100 * 1.5, shown: 150 },
    { what: '+50% then −50%: then $75', value: 100 * 1.5 * 0.5, shown: 75 },
    { what: '+50% then −50%: geometric', value: IV.geometric([0.5, -0.5]) * 100, shown: -13.4, tol: 0.05 },
    // the summary table
    ...SUMMARY.flatMap(([k, name, a, g, w]) => [
      { what: `${name}: arithmetic ×12`, value: st[k].mean * 100, shown: num(a) },
      { what: `${name}: compound growth`, value: st[k].growth * 100, shown: num(g) },
      { what: `${name}: $1 became`, value: IV.wealth(SERIES[k]).at(-1), shown: num(w) },
    ]),
    { what: 'Compound growth ≤ arithmetic mean in every row', value: SUMMARY.every(([k]) => st[k].growth <= st[k].mean + 0.0003) ? 1 : 0, shown: 1 },
    { what: 'Gap largest for the most volatile (Harbour Street, single shares)', value: SUMMARY.every(([k]) => st.harbour.mean - st.harbour.growth >= st[k].mean - st[k].growth) ? 1 : 0, shown: 1 },
    { what: 'Single shares lose 3–5 points: Morrow', value: (st.morrow.mean - st.morrow.growth) * 100, shown: 2.9, tol: 0.05 },
    { what: 'Single shares lose 3–5 points: Harbour', value: (st.harbour.mean - st.harbour.growth) * 100, shown: 4.9, tol: 0.05 },
    { what: 'Share funds earned more than bills and bonds', value: Math.min(st.market.mean, st.intl.mean) > Math.max(st.bonds.mean, st.bills.mean) ? 1 : 0, shown: 1 },
    // HPR and annualising
    { what: 'Corriebank price return', value: (CB.p1 - CB.p0) / CB.p0 * 100, shown: 8.0 },
    { what: 'Corriebank price rise per share', value: CB.p1 - CB.p0, shown: 3.20 },
    { what: 'Corriebank income return', value: CB.d / CB.p0 * 100, shown: 3.5 },
    { what: 'Corriebank HPR', value: IV.hpr(CB.p0, CB.p1, CB.d) * 100, shown: 11.5 },
    { what: 'Corriebank gain per share', value: CB.p1 - CB.p0 + CB.d, shown: 4.60 },
    { what: 'Corriebank value rise on 100 shares', value: (CB.p1 - CB.p0) * 100, shown: 320 },
    { what: 'Corriebank dividends on 100 shares', value: CB.d * 100, shown: 140 },
    { what: 'Corriebank total on 100 shares', value: (CB.p1 - CB.p0 + CB.d) * 100, shown: 460 },
    { what: 'Corriebank cost of 100 shares', value: CB.p0 * 100, shown: 4000 },
    { what: '30% over 2.5 years, annualised', value: (1.3 ** (1 / 2.5) - 1) * 100, shown: 11.07 },
    { what: '30% ÷ 2.5', value: 30 / 2.5, shown: 12 },
    { what: 'After −50%, +100% recovers', value: 0.5 * 2, shown: 1 },
    // the market fund: calendar years
    ...YEAR_ROWS.flatMap(([y, r, w], i) => [
      { what: `Market ${y} return`, value: ym[i] * 100, shown: num(r), tol: 0.05 },
      { what: `Market $1 at end ${y}`, value: wealthM[i + 1], shown: num(w), tol: 0.0005 },
    ]),
    { what: 'Lowest calendar year (2022)', value: Math.min(...ym) * 100, shown: -26.9, tol: 0.05 },
    { what: 'Highest calendar year (2014)', value: Math.max(...ym) * 100, shown: 46.5, tol: 0.05 },
    { what: 'Sum of yearly returns', value: ym.reduce((a, b) => a + b, 0) * 100, shown: 167.85 },
    { what: 'Arithmetic mean of calendar years', value: yArith * 100, shown: 11.19 },
    { what: 'Geometric mean of calendar years', value: yGeo * 100, shown: 9.57 },
    { what: 'Geometric from $1', value: (wealthM.at(-1) ** (1 / 15) - 1) * 100, shown: 9.57 },
    { what: 'Final value of $1', value: wealthM.at(-1), shown: 3.938, tol: 0.0005 },
    { what: 'Final value of $1, 2 dp', value: wealthM.at(-1), shown: 3.94 },
    { what: 'Geometric equals the monthly compound growth', value: (yGeo - st.market.growth) * 100, shown: 0 },
    { what: 'Gap arithmetic − geometric', value: (yArith - yGeo) * 100, shown: 1.62 },
    { what: 'SD of calendar years', value: ySd * 100, shown: 19.33 },
    { what: 'Half the variance', value: 0.5 * 0.1933 ** 2 * 100, shown: 1.87 },
    { what: 'Approximate geometric', value: (yArith - 0.5 * ySd ** 2) * 100, shown: 9.32 },
    { what: 'Approximation below the exact', value: yArith - 0.5 * ySd ** 2 < yGeo ? 1 : 0, shown: 1 },
    { what: 'Monthly arithmetic mean', value: mMonthArith * 100, shown: 0.869 },
    { what: 'Monthly geometric mean', value: mMonthGeo * 100, shown: 0.764 },
    { what: 'Monthly geometric compounded', value: ((1 + mMonthGeo) ** 12 - 1) * 100, shown: 9.57 },
    { what: 'Monthly arithmetic × 12', value: mMonthArith * 12 * 100, shown: 10.43 },
    { what: '$1 at end 2021', value: wealthM[9], shown: 3.07, tol: 0.005 },
    { what: '$1 at end 2022', value: wealthM[10], shown: 2.25, tol: 0.005 },
    { what: 'Not past its 2021 value until 2026', value: wealthM.slice(10, 14).every((v) => v < wealthM[9]) && wealthM[14] > wealthM[9] ? 1 : 0, shown: 1 },
    { what: 'Bonds $1 became', value: wealthB.at(-1), shown: 1.88 },
    { what: 'Bills $1 became', value: wealthT.at(-1), shown: 1.36 },
    // real returns
    { what: 'Market real', value: realM * 100, shown: 6.58 },
    { what: 'Market growth (for real)', value: st.market.growth * 100, shown: 9.57 },
    { what: 'Bonds growth', value: st.bonds.growth * 100, shown: 4.31 },
    { what: 'Bonds real', value: realB * 100, shown: 1.47 },
    { what: 'Bills growth', value: st.bills.growth * 100, shown: 2.05 },
    { what: 'Bills real', value: realT * 100, shown: -0.73 },
    { what: 'Subtract shortcut', value: st.market.growth * 100 - 2.8, shown: 6.77 },
    // scenarios and excess returns
    { what: 'Scenario expected return', value: sc.er * 100, shown: 8.75 },
    { what: 'Scenario expected excess', value: (sc.er - billNext) * 100, shown: 4.75 },
    { what: 'Bill next year', value: billNext * 100, shown: 4.0 },
    { what: 'Market mean excess a month', value: excessMonth * 100, shown: 0.70 },
    { what: 'Market mean excess a year', value: excessMonth * 12 * 100, shown: 8.40 },
    { what: 'Bonds mean excess a year', value: (st.bonds.mean - st.bills.mean) * 100, shown: 2.28 },
    { what: 'F05 market risk premium', value: 5.5, shown: 5.5 },
    // Ana’s projection
    { what: 'FV at the arithmetic mean', value: fv(yArith), shown: 1161046, tol: 1 },
    { what: 'FV at the geometric mean', value: fv(yGeo), shown: 836742, tol: 1 },
    { what: 'FV at the real geometric mean', value: fv(IV.realReturn(yGeo, infl)), shown: 467277, tol: 1 },
    { what: 'Monthly rate from 9.57%', value: ((1 + yGeo) ** (1 / 12) - 1) * 100, shown: 0.764 },
    { what: 'Extra from the arithmetic mean', value: fv(yArith) - fv(yGeo), shown: 324304, tol: 1 },
    { what: 'Extra as a share', value: (fv(yArith) / fv(yGeo) - 1) * 100, shown: 39, tol: 0.5 },
    { what: 'Real removes almost half', value: (1 - fv(IV.realReturn(yGeo, infl)) / fv(yGeo)) * 100, shown: 44, tol: 0.5 },
    { what: 'About $837,000', value: fv(yGeo) / 1000, shown: 837, tol: 0.5 },
    { what: 'About $467,000', value: fv(IV.realReturn(yGeo, infl)) / 1000, shown: 467, tol: 0.5 },
    { what: 'About $1.16 million', value: fv(yArith) / 1e6, shown: 1.16 },
    // Damodaran
    { what: 'Damodaran years 1928–2025', value: DAM.years, shown: 98 },
    { what: 'S&P 500 compound', value: damRate(DAM.stocks) * 100, shown: 10.0, tol: 0.05 },
    { what: 'T-bills compound', value: damRate(DAM.bills) * 100, shown: 3.4, tol: 0.05 },
    { what: 'T-bonds compound', value: damRate(DAM.bonds) * 100, shown: 4.5, tol: 0.05 },
    { what: 'S&P value quoted', value: 1157598.95, shown: 1157598.95 },
    { what: 'Bills value quoted', value: 2578.30, shown: 2578.30 },
    { what: 'Bonds value quoted', value: 7752.88, shown: 7752.88 },
  ],
};
