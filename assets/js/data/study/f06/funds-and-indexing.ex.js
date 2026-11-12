// funds-and-indexing.ex.js — F06 · Funds and indexing: widgets, practice and the knowledge check (answer keys live here).
// Fund returns and fees from case.js (SIMULATED monthly history; fictional funds). Every other fund, index and person
// named here is fictional; the SPIVA figures are those quoted in the lesson.
import { SERIES, MONTHS, ASSETS, ANA } from './case.js?v=31';
import * as IV from '../../../core/investments.js?v=31';

const money = (v) => `$${Math.round(v).toLocaleString('en-US')}`;
const pct = (x, d = 2) => `${x < 0 ? '−' : ''}${(Math.abs(x) * 100 + 1e-9).toFixed(d)}%`;
const yearEnds = (k) => { const w = IV.wealth(SERIES[k], 10_000); return Array.from({ length: 16 }, (_, y) => Math.round(w[y * 12])); };
const YEARS = Array.from({ length: 16 }, (_, y) => 2012 + y);
const ya = IV.yearly(MONTHS, SERIES.active), ym = IV.yearly(MONTHS, SERIES.market);
const TD = [[12.10, 12.03], [-4.80, -4.86], [9.30, 9.27], [16.50, 16.41]];

export const widgets = {
  'fund-fees': {
    type: 'formula', title: 'What a fund’s fees cost over time',
    intro: 'An amount invested now plus a monthly contribution, growing at a return before fees, with the fund’s expense ratio taken off each year. The starting values are Ana’s plan in the total-market index fund, at an assumed 7% a year before fees.',
    inputs: [
      { id: 'amount', label: 'Invested now', min: 0, max: 100000, step: 500, value: ANA.retirement.lump, fmt: 'money' },
      { id: 'monthly', label: 'Added each month', min: 0, max: 2000, step: 50, value: ANA.retirement.monthly, fmt: 'money' },
      { id: 'years', label: 'Years invested', min: 1, max: 40, step: 1, value: 30, fmt: 'int', unit: 'years' },
      { id: 'r', label: 'Return before fees (a year)', min: 0, max: 12, step: 0.25, value: 7, fmt: 'pct' },
      { id: 'fee', label: 'Expense ratio (a year)', min: 0, max: 2, step: 0.01, value: ASSETS.market.fee * 100, fmt: 'pct' },
    ],
    compute: (v) => {
      const at = (n) => IV.feeDrag({ amount: v.amount, years: n, r: v.r / 100, fee: v.fee / 100, monthly: v.monthly });
      const F = at(v.years), paid = v.amount + v.monthly * 12 * v.years;
      const xs = Array.from({ length: v.years + 1 }, (_, n) => n);
      return {
        headline: { label: `Value after ${v.years} years, after fees`, value: money(F.net) },
        rows: [
          ['Value with no fees', money(F.gross)],
          ['Cost of fees', money(F.cost)],
          ['Cost as a share of the no-fee value', pct(F.share)],
          ['Total you put in', money(paid)],
        ],
        note: F.gross > 0 ? `Fees of ${pct(v.fee / 100)} a year take ${pct(F.share)} of what the account would otherwise be worth after ${v.years} years. The share grows with the horizon because each year’s fee also loses all its later growth.` : 'Nothing is invested yet: set an amount or a monthly contribution.',
        chart: { kind: 'line', x: { label: 'Years', values: xs }, series: [{ name: 'Value after fees', values: xs.map((n) => Math.round(at(n).net)) }, { name: 'Cost of fees', values: xs.map((n) => Math.round(at(n).cost)) }], y: { label: 'Dollars' } },
      };
    },
  },
  'fund-growth': {
    type: 'chart', kind: 'line', title: 'Growth of $10,000, 2013–2027 (simulated)',
    x: { label: 'Year end', values: YEARS, format: 'year' }, endLabels: false,
    series: [{ name: 'Index fund', values: yearEnds('market') }, { name: 'Northgate', values: yearEnds('active') }],
    y: { label: 'Value ($)' },
    note: 'The Harbourline total-market index fund and the Northgate active fund, after their fees (0.04% and 0.85% a year), from the simulated monthly returns of fictional funds. $10,000 at the end of 2012 became $39,381 in the index fund and $33,821 in Northgate.',
  },
  'fund-gap': {
    type: 'chart', kind: 'line', title: 'Northgate minus the index fund, each year (simulated)',
    x: { label: 'Year', values: ya.map((y) => Number(y.year)), format: 'year' },
    series: [{ name: 'Gap (points)', values: ya.map((y, i) => Math.round((y.ret - ym[i].ret) * 10000) / 100) }],
    y: { label: 'Percentage points' },
    note: 'Points above zero are years Northgate beat the index fund (7 of 15). The average gap is about −1 point a year, close to its extra fee, but any one year’s gap is dominated by noise.',
  },
};

export const guided = [
  {
    id: 'f06-fund-g1', type: 'steps', kind: 'numerical',
    prompt: 'A fictional saver invests $50,000 for 25 years at 6% a year before fees, in either a fund charging 0.20% a year or one charging 1.20%.',
    solution: 'Each year the money grows by 1.06 × (1 − fee). At 0.20%: 50,000 × (1.06 × 0.998)²⁵ = $204,117. At 1.20%: 50,000 × (1.06 × 0.988)²⁵ = $158,687. The extra point of fees costs $45,431, more than 90% of the original $50,000.',
    steps: [
      { id: 'f06-fund-g1-s1', type: 'num', prompt: 'What is the account worth after 25 years in the 0.20% fund? Give a whole number of dollars.',
        answer: 204117, check: () => IV.feeDrag({ amount: 50000, years: 25, r: 0.06, fee: 0.002 }).net, unit: '$', places: 0, tol: 2,
        hints: ['Yearly growth factor: 1.06 × (1 − 0.002).', '50,000 × (1.06 × 0.998)^25.'],
        wrong: [{ value: 214594, say: 'That is the value with no fee at all: 50,000 × 1.06^25.' }] },
      { id: 'f06-fund-g1-s2', type: 'num', prompt: 'And in the 1.20% fund? Give a whole number of dollars.',
        answer: 158687, check: () => IV.feeDrag({ amount: 50000, years: 25, r: 0.06, fee: 0.012 }).net, unit: '$', places: 0, tol: 2,
        hints: ['50,000 × (1.06 × 0.988)^25.'],
        wrong: [{ value: 161437, say: 'That subtracts the fee from the return (4.8% a year). Close, but the fee is a share of the year-end value: (1.06 × 0.988) − 1 = 4.73%.' }] },
      { id: 'f06-fund-g1-s3', type: 'num', prompt: 'How much does the extra 1.00 point of fees cost by the end? Give a whole number of dollars.',
        answer: 45431, check: () => IV.feeDrag({ amount: 50000, years: 25, r: 0.06, fee: 0.002 }).net - IV.feeDrag({ amount: 50000, years: 25, r: 0.06, fee: 0.012 }).net, unit: '$', places: 0, tol: 3,
        hints: ['Subtract the second answer from the first.'],
        wrong: [{ value: 12500, say: 'That is 1% of $50,000 for 25 years with no compounding. The fees also lose the growth they would have earned.' }] },
    ],
  },
  {
    id: 'f06-fund-g2', type: 'formula', kind: 'applied',
    prompt: 'The sheet holds an amount invested (B1), the return before fees (B2), the fund’s expense ratio (B3) and the number of years (B4). In B6, write a formula for the value at the end, with the fee taken as a share of each year’s value.',
    sheet: { cells: { A1: 'Invested now', B1: 20000, A2: 'Return before fees', B2: 0.07, A3: 'Expense ratio', B3: 0.0085, A4: 'Years', B4: 30, A6: 'Value after fees' },
      vary: { B2: [0.05, 0.08], B3: [0.0004, 0.012], B4: [10, 25] } },
    cell: 'B6', view: 'A1:B6', widths: { A: 18, B: 12 }, formats: { B1: '$#,##0', B2: '0.0%', B3: '0.00%', B6: '$#,##0' },
    answer: '=B1*((1+B2)*(1-B3))^B4',
    alt: ['=FV((1+B2)*(1-B3)-1,B4,0,-B1)', '=B1*(1+B2)^B4*(1-B3)^B4', '=-FV((1+B2)*(1-B3)-1,B4,0,B1)'],
    wrong: [
      { formula: '=B1*(1+B2)^B4', say: 'That leaves out the fee: multiply each year’s growth factor by (1 − B3).' },
      { formula: '=B1*(1+B2-B3)^B4', say: 'Close, but that takes the fee off the return rather than off the year-end value. The fund charges a share of its assets: (1 + B2) × (1 − B3).' },
      { formula: '=B1*(1+B2)^B4*(1-B3)', say: 'The fee is charged every year, not once: raise (1 − B3) to the power B4 as well.' },
    ],
    hints: ['Each year the money is multiplied by (1 + return) × (1 − fee).', '=B1*((1+B2)*(1−B3))^B4.'],
    solution: '<x>=B1*((1+B2)*(1-B3))^B4</x> gives $117,849 for $20,000 at 7% for 30 years with a 0.85% fee, against $152,245 with no fee. FV gives the same: <x>=FV((1+B2)*(1-B3)-1,B4,0,-B1)</x>.',
  },
  {
    id: 'f06-fund-g3', type: 'steps', kind: 'numerical',
    prompt: 'A fictional index fund and the fictional index it tracks returned the following over four years.',
    data: { table: { head: ['Year', 'Index', 'Fund'], align: ['l', 'r', 'r'], rows: TD.map(([a, b], i) => [String(2024 + i), `${a.toFixed(2).replace('-', '−')}%`, `${b.toFixed(2).replace('-', '−')}%`]) } },
    solution: 'Differences (fund − index): −0.07, −0.06, −0.03, −0.09 points. Tracking difference: their average, −0.06 points a year (−0.0625 before rounding). Tracking error: their standard deviation, 0.025 points. A steady shortfall of about 0.06 points, with little variation, is what a fund with an expense ratio near 0.06% should show.',
    steps: [
      { id: 'f06-fund-g3-s1', type: 'num', prompt: 'What is the fund’s average tracking difference, in percentage points? Give two decimal places.',
        answer: -0.06, check: () => TD.reduce((s, [a, b]) => s + b - a, 0) / TD.length, unit: '', places: 2, tol: 0.005,
        hints: ['Subtract the index’s return from the fund’s each year, then average.', '(−0.07 − 0.06 − 0.03 − 0.09) ÷ 4.'],
        wrong: [{ value: 0.06, say: 'Check the sign: the fund returned less than the index each year.' }] },
      { id: 'f06-fund-g3-s2', type: 'mc', prompt: 'The fund’s expense ratio is 0.06%. What do the figures suggest?',
        options: ['It tracks well: its shortfall is about its fee and barely varies', 'It tracks badly, because it trailed the index every year', 'Its tracking error is 0.06%, so it is costing more than its fee', 'It must be an active fund, since it does not match the index exactly'],
        answer: 0,
        hints: ['An index fund pays its expenses, so it should trail its index by about its fee.'],
        feedback: { 1: 'Trailing by about the fee every year is exactly what a well-run index fund does.', 2: 'The tracking error is the standard deviation of the gaps, about 0.03 points; −0.06 is the tracking difference, and it matches the fee.', 3: 'No index fund matches its index exactly; costs and cash make small gaps.' } },
    ],
  },
  {
    id: 'f06-fund-g4', type: 'mc', kind: 'conceptual',
    prompt: 'At 11 a.m. markets fall sharply. An investor wants to sell her fund holding at once. Which is true?',
    options: [
      'The ETF sells at once at its market price; the mutual fund at that evening’s NAV',
      'A mutual fund can be sold straight away at its 11 a.m. NAV, while an ETF can be sold only at the NAV calculated at the end of the day',
      'Both can only be sold at the end-of-day NAV, because both are funds',
      'Both can be sold at once at the previous day’s NAV',
    ],
    answer: 0,
    hints: ['Where is each kind of fund bought and sold?', 'Investor.gov: ETF investors can sell on the market at any time it is open; mutual funds use the next calculated NAV.'],
    feedback: {
      1: 'That reverses them: mutual funds are priced once a day, at the end of the business day.',
      2: 'ETFs trade on an exchange during the day at market prices.',
      3: 'Neither uses the previous day’s NAV for a new sale.',
    },
    solution: 'ETF shares trade on an exchange whenever the market is open, at market prices close to (but not always equal to) NAV. Mutual fund shares are sold back to the fund at the next NAV, calculated at the end of the business day.',
  },
];

export const independent = [
  {
    id: 'f06-fund-i1', type: 'num', kind: 'numerical',
    prompt: 'A fictional investor puts $20,000 in a fund for 10 years. The fund earns 8% a year before fees and charges 1% a year. How much do the fees cost her by the end, compared with no fees? Give a whole number of dollars.',
    answer: 4129, check: () => 20000 * 1.08 ** 10 - 20000 * (1.08 * 0.99) ** 10, unit: '$', places: 0, tol: 2,
    wrong: [{ value: 2000, say: 'That is 1% of $20,000 for ten years, with no compounding. The fee is charged on a growing balance and loses its own growth.' }],
    solution: 'No fees: 20,000 × 1.08¹⁰ = $43,178. With fees: 20,000 × (1.08 × 0.99)¹⁰ = $39,050. Cost: $4,129, about a fifth of the original investment.',
  },
  {
    id: 'f06-fund-i2', type: 'num', kind: 'numerical',
    prompt: 'A fictional active fund’s monthly returns differ from its benchmark’s with a standard deviation of 0.5%. What is its annual tracking error? Give a percentage to two decimal places.',
    answer: 1.73, check: () => 0.5 * Math.sqrt(12), unit: '%', places: 2, tol: 0.01,
    wrong: [{ value: 6, say: 'Standard deviations scale with the square root of time: multiply by √12, not 12.' }],
    solution: '0.5% × √12 = 1.73% a year.',
  },
  {
    id: 'f06-fund-i3', type: 'num', kind: 'numerical',
    prompt: 'A fictional active fund’s regression on its benchmark gives an alpha of 0.15% a month with a standard error of 0.12%. What is the t-statistic? Give two decimal places.',
    answer: 1.25, check: () => 0.15 / 0.12, unit: '', places: 2, tol: 0.005,
    wrong: [{ value: 1.8, say: 'That is the annual alpha (0.15% × 12). The t-statistic divides the estimate by its standard error.' }],
    solution: 't = 0.15 ÷ 0.12 = 1.25, below the roughly 2 needed for significance at 5%. The alpha of 1.8% a year may well be luck.',
  },
  {
    id: 'f06-fund-i4', type: 'classify', kind: 'conceptual',
    prompt: 'Classify each feature as describing a mutual fund or an exchange-traded fund (ETF), as Investor.gov describes them.',
    items: [
      'Bought from and sold back to the fund itself',
      'Bought and sold on a stock exchange at market prices',
      'Priced once a day at the NAV calculated at the end of the business day',
      'Its price can differ slightly from its NAV',
      'A brokerage commission may be paid on each purchase or sale',
    ],
    categories: ['Mutual fund', 'ETF'],
    answer: [0, 1, 0, 1, 1],
    feedback: {
      0: 'Mutual fund investors redeem their shares with the fund.',
      1: 'ETF shares trade between investors on an exchange.',
      2: 'Mutual funds transact at the next calculated NAV.',
      3: 'An ETF’s market price generally stays close to its NAV but may vary.',
      4: 'ETF trades go through a broker, who may charge commission.',
    },
    solution: 'Mutual funds: transactions with the fund at the end-of-day NAV. ETFs: exchange trading at market prices during the day, through a broker, at prices that can differ a little from NAV.',
  },
  {
    id: 'f06-fund-i5', type: 'mc', kind: 'applied',
    prompt: 'A friend says: “SPIVA found 65% of active large-cap funds trailed the S&amp;P 500 in 2024, so 35% beat it. I’ll just pick one of those.” What is the main problem with this plan?',
    options: [
      'Over 20 years only about 8% did better than the index; one good year is weak evidence',
      'A 35% chance of picking a winner is too low; she should wait for a year when most funds win',
      'The 2024 winners are a fair bet, since a year is long enough to show a manager’s skill',
      'Last year’s winners tend to be the cheapest funds, so cost alone will find them for her',
    ],
    answer: 0,
    feedback: {
      1: 'Waiting doesn’t help: over longer periods the share of active funds that beat the index is lower, not higher.',
      2: 'One year is mostly noise, as Northgate’s swings from +6.8 to −7.5 points show.',
      3: 'Low fees help, but low fees alone don’t make a fund beat its index.',
    },
    solution: 'Over 20 years 91.99% of active large-cap funds trailed the S&amp;P 500 (funds that closed along the way count as trailing), so only about 8% did better over that horizon. That is a cumulative figure, not a measure of how often winners repeat, but one good year is weak evidence of skill, and cost is the predictor she controls.',
  },
  {
    id: 'f06-fund-i6', type: 'num', kind: 'applied',
    prompt: 'A fictional investor buys $10,000 of an ETF and later sells it. The bid–ask spread is 0.10% of the price, so buying at the ask and selling at the bid costs about 0.10% of the amount in total, and her broker charges $5 commission on each trade. What do the two trades cost her in total? Give a whole number of dollars.',
    answer: 20, check: () => 10000 * 0.001 + 2 * 5, unit: '$', places: 0, tol: 0.5,
    wrong: [{ value: 15, say: 'There are two trades, each with a $5 commission.' }, { value: 10, say: 'Add the two $5 commissions to the $10 spread cost.' }],
    solution: 'Spread: 0.10% × $10,000 = $10. Commissions: 2 × $5 = $10. Total $20, or 0.2% of the amount: small for a long-term holding, large if repeated often.',
  },
];

export const check = [
  {
    id: 'f06-fund-k1', type: 'mc', kind: 'conceptual',
    prompt: 'What is an index fund designed to do?',
    options: [
      'Match an index’s return, before fees',
      'Beat a particular index by choosing its best shares',
      'Achieve the index’s return after fees, with no tracking difference',
      'Hold only the largest shares in a market to reduce its risk',
    ],
    answer: 0,
    feedback: {
      1: 'That is the aim of an actively managed fund.',
      2: 'Fees and costs mean an index fund trails its index slightly; its aim is the index’s return before fees.',
      3: 'Some indexes hold only large shares, but an index fund holds whatever its index holds.',
    },
    solution: 'Investor.gov: index funds are designed to achieve approximately the same return as a particular index before fees, by holding its securities or a representative sample.',
  },
  {
    id: 'f06-fund-k2', type: 'num', kind: 'numerical',
    prompt: 'A fictional saver invests $200 a month for 20 years at 6% a year before fees in a fund charging 0.75% a year. How much do the fees cost her by the end, compared with no fees? Give a whole number of dollars.',
    answer: 7671, check: () => IV.feeDrag({ amount: 0, years: 20, r: 0.06, fee: 0.0075, monthly: 200 }).cost, unit: '$', places: 0, tol: 10,
    wrong: [{ value: 360, say: 'That is 0.75% of her $48,000 of contributions. The fee is charged every year on the whole growing balance.' }],
    solution: 'With no fees the account reaches $90,688; with the 0.75% fee, $83,017. The fees cost $7,671, about 8.5% of the no-fee value.',
  },
  {
    id: 'f06-fund-k3', type: 'multi', kind: 'conceptual',
    prompt: 'Which statements about tracking are true? Select all that apply.',
    options: [
      'A well-run index fund’s tracking difference is usually close to minus its expense ratio.',
      'Tracking error is the average amount by which a fund trails its benchmark.',
      'An active fund with a high tracking error is taking positions far from its benchmark.',
      'A fund with zero tracking error must have zero tracking difference.',
    ],
    answer: [0, 2],
    feedback: {
      1: 'That is the tracking difference. Tracking error is the standard deviation of the gaps.',
      3: 'A fund that trails by exactly its fee every period has a constant gap: zero tracking error but a negative tracking difference.',
    },
    solution: 'Tracking difference is the average gap (about −fee for an index fund); tracking error is its variability (large for an active fund that strays from its benchmark).',
  },
  {
    id: 'f06-fund-k4', type: 'num', kind: 'applied',
    prompt: 'Ana’s colleague has $30,000 to invest for 15 years. Assume 6% a year before fees. How much more would she have at the end in an index fund charging 0.05% than in an active fund charging 1.00%, if the active fund’s managers add nothing before fees? Give a whole number of dollars.',
    answer: 9524, check: () => IV.feeDrag({ amount: 30000, years: 15, r: 0.06, fee: 0.0005 }).net - IV.feeDrag({ amount: 30000, years: 15, r: 0.06, fee: 0.01 }).net, unit: '$', places: 0, tol: 3,
    wrong: [{ value: 4275, say: 'That is 0.95% of $30,000 for 15 years without compounding.' }],
    solution: 'Index fund: 30,000 × (1.06 × 0.9995)¹⁵ = $71,359. Active: 30,000 × (1.06 × 0.99)¹⁵ = $61,835. Difference: $9,524, nearly a third of the amount invested.',
  },
  {
    id: 'f06-fund-k5', type: 'mc', kind: 'applied',
    prompt: 'Northgate’s brochure highlights that it beat the index in five of the seven years 2018–2024. What is the most useful thing for Ana to check next?',
    options: [
      'Its full record, the alpha’s standard error, and its fee',
      'Whether its managers expect to keep beating the index in the next few years, as their brochure says',
      'Its best single year, to see how much it can gain at its peak',
      'Whether the index fund also beat the index in those years',
    ],
    answer: 0,
    feedback: {
      1: 'Managers’ expectations are not evidence. Over the full fifteen years Northgate trailed by about its fee.',
      2: 'A single good year (+6.8 points in 2019) says nothing about skill; Northgate trailed by 7.5 points in 2027.',
      3: 'An index fund trails its own index slightly by design; the comparison that matters is Northgate against it.',
    },
    solution: 'A selected period can flatter any fund. Over 2013–2027 Northgate trailed the index fund by 0.96 points a year, about its 0.81-point extra fee, with an alpha (t = −0.98) that can’t be told from zero.',
  },
  {
    id: 'f06-fund-k6', type: 'mc', kind: 'conceptual',
    prompt: 'Why must the average actively managed dollar trail the market after costs?',
    options: [
      'Together, active money earns the market return before its higher costs',
      'Active managers tend to trade too often, so their picks lose to the index before costs',
      'Index funds hold the largest companies, which usually grow faster than the rest',
      'Prices are usually efficient, so most active picks earn below-market returns before costs',
    ],
    answer: 0,
    feedback: {
      1: 'Before costs, active investors as a group hold the market, so their average return equals the market’s however often they trade.',
      2: 'A total-market index fund holds every listed share by value, not only the largest, and earns exactly the market return.',
      3: 'The argument needs no view on efficiency: it is arithmetic about who holds the market and what they pay.',
    },
    solution: 'Index investors earn the market return less small fees. Since the whole market is held by index and active investors together, active investors as a group also earn the market return before costs. Their higher costs then put the average active dollar behind.',
  },
];
