// summarising-data.js — B01 · Summarising data: changes, averages and spread. Content only; exercises are in
// summarising-data.ex.js. Uses SHOP and DERIVED from case.js: visits (all months), gift-box orders, November and
// December orders, July's web and app counts (the weighted-average example). Conversion, AOV against target and revenue
// for the six months are left to the project. New fictional facts, labelled: the breakdown of July's 118 ratings by
// stars (72, 31, 8, 3, 4: mean 4.39, consistent with the case's 4.4) and a sample of eleven December orders.
// Every other business and figure is fictional and labelled.
import { SHOP as S, DERIVED as D } from './case.js?v=12';

const sum = (a) => a.reduce((x, y) => x + y, 0);
const mean = (a) => sum(a) / a.length;
const sd = (a) => { const m = mean(a); return Math.sqrt(sum(a.map((x) => (x - m) ** 2)) / (a.length - 1)); };
const quant = (a, p) => { const s = [...a].sort((x, y) => x - y); const pos = 1 + (s.length - 1) * p; const k = Math.floor(pos); const f = pos - k; return k >= s.length ? s[s.length - 1] : s[k - 1] + f * (s[k] - s[k - 1]); };
const pc = (a, b) => (b / a - 1) * 100;          // percentage change from a to b

const STARS = [5, 4, 3, 2, 1], JULY_STARS = [72, 31, 8, 3, 4];   // fictional breakdown of July's 118 ratings
const BRANCH_A = [7, 9, 10, 10, 11, 12, 12, 13, 15], BRANCH_B = [3, 5, 8, 10, 11, 12, 14, 17, 19];
const DEC_SAMPLE = [16.5, 19.5, 22, 28, 28, 33, 39, 46, 58, 98, 175];
const SUBS = [1200, 1320, 1254, 1505, 1580];
const g = SUBS.slice(1).map((v, i) => v / SUBS[i] - 1);
const V = D.visits, vg = V.slice(1).map((v, i) => v / V[i] - 1);
const N = 4, Dm = 5;                               // November and December indexes

export default {
  slug: 'summarising-data',
  title: 'Summarising data: changes, averages and spread',
  blurb: 'Most business numbers are summaries: a share, a change, an average, a growth rate. Learn to calculate each one correctly, to say percentage points when you mean them, to choose between the mean and the median, to describe spread, to weight an average properly and to round without misleading.',
  status: 'reviewed',
  objectives: [
    'Calculate proportions, percentages, absolute changes and percentage changes, and name the base of each.',
    'Distinguish a percentage-point change from a percentage change and calculate both.',
    'Calculate month-on-month growth rates and the compound average growth rate over several periods.',
    'Calculate the mean, median and mode, and describe spread with the range, the interquartile range and the standard deviation, choosing the summary that suits the data and the question.',
    'Calculate a weighted average, and explain why a shop’s overall conversion rate is a weighted average of its channels’ rates.',
    'State results to a precision the data support, rounding only at the end.',
  ],
  prerequisites: [
    { lesson: 'b01/kpis', why: 'The KPIs are the rates and averages this lesson summarises and compares.' },
    { lesson: 'b01/data-types', why: 'The level of measurement decides which average is meaningful.' },
    { lesson: 'f00/interest-and-inflation', why: 'Compound growth works for visits and subscribers as it does for money.' },
  ],
  case: 'lantern',

  concept: [
    { case: 'In January 2027 Ana’s assistant drafts a note on December: “Visits up 19.1% on November. Gift-box orders up 162.5%, and gift boxes were 39.6% of December’s orders. Average rating up 0.1.”' },
    { p: 'Every figure is a summary: a change, a percentage, an average. Each is calculated correctly, yet a reader could still misunderstand most of them. This lesson is about producing summaries that cannot be misread.' },

    { h: 'Counts, proportions and percentages' },
    { p: String.raw`A count says how many. A <g>proportion</g> divides a part by the whole it belongs to, giving a number between 0 and 1; a percentage is the proportion multiplied by 100. In December Lantern took 583 orders, of which 231 were gift boxes, so gift boxes were a proportion <m>231 \div 583 \approx 0.396</m>, or 39.6%, of orders.` },
    { p: 'A percentage means nothing until you know its whole. Gift boxes were 39.6% of December’s <i>orders</i>; as a share of December’s <i>revenue</i> they would be larger if, as December’s high average order value suggests, a gift box costs more than a typical order. Always say “of what”, and when you compare two percentages, check that they share the same kind of whole.' },

    { h: 'Absolute and percentage change' },
    { p: String.raw`From November to December Lantern’s visits rose from 13,600 to 16,200. The absolute change is <m>16{,}200 - 13{,}600 = 2{,}600</m> visits. The <g>percentage change</g> divides that by the starting value, the <i>base</i>: <m>2{,}600 \div 13{,}600 \times 100 \approx 19.1\%</m>.` },
    { p: String.raw`Because the base is the starting value, percentage changes are not symmetric. If visits fell back from 16,200 to 13,600, the fall would be the same 2,600 visits but only <m>2{,}600 \div 16{,}200 \times 100 \approx 16.0\%</m>, because the base is now larger. A rise of 50% followed by a fall of 50% leaves you at <m>1.5 \times 0.5 = 0.75</m> of where you started, not back at the beginning.` },

    { h: 'Percentage points' },
    { p: String.raw`When the quantity itself is a percentage, there are two ways to describe a change, and they give different numbers. In the KPIs lesson Westerly Paper Co.’s conversion rate fell from 3.00% to 2.60%. The difference between two percentages is measured in <g>percentage points</g>: a fall of <m>3.00 - 2.60 = 0.40</m> percentage points. The relative change is <m>(2.60 - 3.00) \div 3.00 \times 100 \approx -13.3\%</m>: the rate is 13.3% lower than it was.` },
    { p: 'Both are correct, and both are useful. What is not acceptable is “conversion fell 0.4%”, which most readers take as a relative fall of 0.4%, a change more than thirty times smaller than the real one. Write “percentage points” (or “points”, once the context is clear) for differences between percentages, and “%” only for relative changes.' },
    { callout: 'key', title: 'Points for differences, percent for ratios', html: 'From 3.00% to 2.60% is −0.4 percentage points and −13.3%. When a KPI is a percentage, report the change in points, and add the relative change if it helps.' },

    { h: 'Averages: mean, median and mode' },
    { p: 'An average describes the centre of a set of values with one number. There are three common ones. The <g>mean</g> adds the values and divides by how many there are. The <g>median</g> is the middle value once they are sorted, so half lie at or below it and half at or above. The <g>mode</g> is the value that occurs most often.' },
    { case: 'Lantern’s case data give July’s average rating as 4.4. The shop’s report (fictional) also breaks July’s 118 ratings down by stars.' },
    { table: {
      caption: 'July’s 118 ratings by stars (fictional)',
      head: ['Stars', 'Ratings', 'Stars × ratings'],
      align: ['r', 'r', 'r'],
      rows: [['5', '72', '360'], ['4', '31', '124'], ['3', '8', '24'], ['2', '3', '6'], ['1', '4', '4']],
      foot: [['Total', '118', '518']],
    } },
    { p: String.raw`The mean is <m>518 \div 118 \approx 4.39</m> stars, which rounds to the 4.4 in the case data. To find the median, imagine the 118 ratings sorted from 1 to 5: the middle falls between the 59th and 60th, and since the 46 ratings of 4 stars or fewer fill positions 1 to 46, both are 5s. The median is 5, and so is the mode. The three averages tell slightly different stories: the typical customer gave 5 stars, while a few low ratings pull the mean down to 4.39.` },
    { p: 'Which average is allowed depends on the <g>level of measurement</g>, from the data-types lesson. The mode works for any variable, even a nominal one such as a product name. The median needs an order, so it works for ordinal data such as star ratings. The mean assumes that the steps between values are equal, which a 1–5 rating does not guarantee; averaging ratings is a common and useful convenience, but report the distribution or the median beside it.' },

    { h: 'Spread' },
    { p: 'Two sets of numbers can share an average and still look nothing alike. Here are nine days of orders at two branches of a fictional bakery chain, sorted from smallest to largest. Branch A: 7, 9, 10, 10, 11, 12, 12, 13, 15. Branch B: 3, 5, 8, 10, 11, 12, 14, 17, 19.' },
    { table: {
      caption: 'Summaries of nine days of orders at two bakery branches (fictional)',
      head: ['Branch', 'Mean', 'Median', 'Range', 'IQR', 'Standard deviation'],
      align: ['l', 'r', 'r', 'r', 'r', 'r'],
      rows: [
        ['A', '11', '11', '8', '2', '2.35'],
        ['B', '11', '11', '16', '6', '5.24'],
      ],
    } },
    { figure: {
      svg: '<svg viewBox="0 0 640 210" xmlns="http://www.w3.org/2000/svg" font-size="13" fill="currentColor"><line x1="357" y1="20" x2="357" y2="172" stroke="var(--ink-3)" stroke-width="1.2" stroke-dasharray="4 4"/><text x="357" y="14" text-anchor="middle" font-size="11" fill="var(--ink-3)">mean = median = 11</text><text x="8" y="66">Branch A</text><circle cx="249" cy="62" r="6" fill="var(--series-1)"/><circle cx="303" cy="62" r="6" fill="var(--series-1)"/><circle cx="330" cy="62" r="6" fill="var(--series-1)"/><circle cx="330" cy="48" r="6" fill="var(--series-1)"/><circle cx="357" cy="62" r="6" fill="var(--series-1)"/><circle cx="384" cy="62" r="6" fill="var(--series-1)"/><circle cx="384" cy="48" r="6" fill="var(--series-1)"/><circle cx="411" cy="62" r="6" fill="var(--series-1)"/><circle cx="465" cy="62" r="6" fill="var(--series-1)"/><line x1="330" y1="82" x2="384" y2="82" stroke="var(--ink)" stroke-width="2"/><line x1="330" y1="77" x2="330" y2="87" stroke="var(--ink)" stroke-width="2"/><line x1="384" y1="77" x2="384" y2="87" stroke="var(--ink)" stroke-width="2"/><text x="392" y="86" font-size="11" fill="var(--ink-3)">IQR 2</text><text x="477" y="66" font-size="11" fill="var(--ink-3)">range 8</text><text x="8" y="132">Branch B</text><circle cx="141" cy="128" r="6" fill="var(--series-2)"/><circle cx="195" cy="128" r="6" fill="var(--series-2)"/><circle cx="276" cy="128" r="6" fill="var(--series-2)"/><circle cx="330" cy="128" r="6" fill="var(--series-2)"/><circle cx="357" cy="128" r="6" fill="var(--series-2)"/><circle cx="384" cy="128" r="6" fill="var(--series-2)"/><circle cx="438" cy="128" r="6" fill="var(--series-2)"/><circle cx="519" cy="128" r="6" fill="var(--series-2)"/><circle cx="573" cy="128" r="6" fill="var(--series-2)"/><line x1="276" y1="148" x2="438" y2="148" stroke="var(--ink)" stroke-width="2"/><line x1="276" y1="143" x2="276" y2="153" stroke="var(--ink)" stroke-width="2"/><line x1="438" y1="143" x2="438" y2="153" stroke="var(--ink)" stroke-width="2"/><text x="446" y="152" font-size="11" fill="var(--ink-3)">IQR 6</text><text x="585" y="132" font-size="11" fill="var(--ink-3)">range 16</text><line x1="60" y1="172" x2="600" y2="172" stroke="var(--rule-strong)" stroke-width="1.2"/><line x1="60" y1="172" x2="60" y2="177" stroke="var(--rule-strong)"/><text x="60" y="190" text-anchor="middle" font-size="11">0</text><line x1="195" y1="172" x2="195" y2="177" stroke="var(--rule-strong)"/><text x="195" y="190" text-anchor="middle" font-size="11">5</text><line x1="330" y1="172" x2="330" y2="177" stroke="var(--rule-strong)"/><text x="330" y="190" text-anchor="middle" font-size="11">10</text><line x1="465" y1="172" x2="465" y2="177" stroke="var(--rule-strong)"/><text x="465" y="190" text-anchor="middle" font-size="11">15</text><line x1="600" y1="172" x2="600" y2="177" stroke="var(--rule-strong)"/><text x="600" y="190" text-anchor="middle" font-size="11">20</text><text x="330" y="206" text-anchor="middle" font-size="11" fill="var(--ink-3)">Orders a day</text></svg>',
      caption: 'The two branches’ nine days as dot plots. Both centre on 11 orders a day; branch B’s days are spread much more widely, as its range and interquartile range show.',
      alt: 'Two dot plots on a shared horizontal axis of orders a day from 0 to 20. Branch A’s nine dots cluster between 7 and 15, with two dots stacked at 10 and two at 12; a bracket under them marks the interquartile range from 10 to 12, labelled IQR 2, and a label gives the range as 8. Branch B’s nine dots spread from 3 to 19; its bracket runs from 8 to 14, labelled IQR 6, and its range is 16. A dashed vertical line at 11 marks the mean and median of both branches.',
    } },
    { p: 'Both branches average 11 orders a day, but branch B’s days swing from 3 to 19, and planning its baking is much harder. Three measures of <i>spread</i> capture the difference.' },
    { p: 'The <g>range</g> is the largest value minus the smallest. The <g>interquartile range</g> (IQR) is the width of the middle half of the data. The <g>standard deviation</g> is, roughly, the typical distance of a value from the mean. All three are about twice as large or more for branch B. The next section shows how each is calculated.' },
  ],

  theory: [
    { h: 'Percentage change: three traps' },
    { p: String.raw`<b>Small bases.</b> Lantern’s gift-box orders went from 9 in October to 88 in November, a rise of <m>(88 - 9) \div 9 \times 100 \approx 877.8\%</m>, then to 231 in December, a rise of 162.5%. December’s percentage is far smaller, but its absolute rise, 143 orders, is almost twice November’s 79. A percentage change from a small base is dramatic and often meaningless; this is a <g>base effect</g>. Report the counts beside it.` },
    { p: '<b>Reversals.</b> Equal percentage rises and falls do not cancel, as the concept section showed. To undo a fall of 20% you need a rise of 25%, because the second change works on a smaller base.' },
    { p: '<b>Changes in rates.</b> A change in a percentage has a points version and a relative version. Say which one you mean, every time.' },

    { h: 'Growth over several periods' },
    { p: 'Lantern’s total visits grew every month but one between July and December.' },
    { table: {
      caption: 'Lantern’s shop visits, web and app combined, July–December 2026 (fictional)',
      head: ['Month', 'Visits', 'Change on previous month'],
      align: ['l', 'r', 'r'],
      rows: [['July', '9,800', '—'], ['August', '10,200', '+4.1%'], ['September', '11,400', '+11.8%'], ['October', '11,000', '−3.5%'], ['November', '13,600', '+23.6%'], ['December', '16,200', '+19.1%']],
    } },
    { p: String.raw`Over the five monthly steps visits grew by <m>16{,}200 \div 9{,}800 - 1 \approx 65.3\%</m> in total. What was the average monthly growth? The tempting answer is the mean of the five monthly rates, about 11.0%. It is wrong: 9,800 visits growing at that average rate, 11.02% a month, for five months would reach about 16,500, not 16,200. Growth compounds, so the right average is the <g>compound growth rate</g>, the constant rate that turns the starting value into the final value over the same number of periods:` },
    { math: String.raw`g = \left(\frac{\text{End}}{\text{Start}}\right)^{1/n} - 1 = \left(\frac{16{,}200}{9{,}800}\right)^{1/5} - 1 \approx 10.6\%\ \text{a month}` },
    { p: 'Check it, keeping more decimals than the rounded 10.6%: 9,800 × 1.10575⁵ ≈ 16,200. Over years, the same calculation gives the <g>compound annual growth rate</g> that F04 uses for money. Two cautions apply. A growth rate needs the number of steps, not the number of months: July to December is five steps. And an average growth rate describes the past; Lantern’s last two months were boosted by Christmas gift buying, and projecting 10.6% a month into 2027 would be a mistake that the next lesson explains.' },

    { h: 'The three averages in detail' },
    { p: String.raw`For <m>n</m> values <m>x_1, x_2, \dots, x_n</m>, the mean is <m>\bar{x} = (x_1 + x_2 + \dots + x_n) \div n</m>. The mean has a property the others lack: multiplied by the count, it gives the total. That is why average order value is a mean: AOV × orders = revenue. If you need totals, for a budget, a forecast or a stock order, use the mean.` },
    { p: String.raw`The median of <m>n</m> sorted values sits at position <m>(n + 1) \div 2</m>; when <m>n</m> is even, it is halfway between the two middle values. Because it depends only on the order of the values, a few extreme values cannot drag it far. When data are skewed, the mean is pulled towards the long tail: above the median when there are a few very large values, as with order values, and below it when there are a few very small ones, as with Lantern’s ratings. For “what does a typical customer do?”, the median is usually the better answer.` },
    { p: 'The mode is the only average for nominal data (the most common product, region or channel) and is useful for counts with few possible values, such as packs per order. Some data have two modes, which often signals two groups mixed together: one-pack orders and gift boxes, say.' },

    { h: 'Measuring spread' },
    { p: String.raw`The <b>range</b> is the simplest measure: branch A’s is <m>15 - 7 = 8</m>. It depends on just two values, the most extreme, so one unusual day changes it completely.` },
    { p: String.raw`<b>Quartiles</b> split sorted data into four parts. The first quartile, Q1, has a quarter of the values below it and the third, Q3, three-quarters; the median is the second. There are several ways to calculate quartiles, and B02 explains the choice. This course uses quartiles by linear interpolation, as B02 does (and as Excel’s QUARTILE.INC does): the value at position <m>1 + (n - 1)p</m> in the sorted list, where <m>p</m> is 0.25 for Q1 and 0.75 for Q3, interpolating between neighbours when the position isn’t a whole number.` },
    { p: String.raw`For branch A, <m>n = 9</m>, so Q1 is the 3rd value, 10, and Q3 the 7th, 12. The IQR is <m>12 - 10 = 2</m>: the middle half of branch A’s days lie within 2 orders of each other. For branch B the same positions give 8 and 14, an IQR of 6.` },
    { p: String.raw`The <b>standard deviation</b> uses every value. Take each value’s distance from the mean, square it, add the squares, divide by <m>n - 1</m> and take the square root. For branch A the distances from 11 are −4, −2, −1, −1, 0, 1, 1, 2 and 4; their squares add to 44; <m>44 \div 8 = 5.5</m>; and <m>\sqrt{5.5} \approx 2.35</m> orders. For branch B the squares add to 220, and <m>\sqrt{220 \div 8} \approx 5.24</m>.` },
    { p: String.raw`Squaring makes every distance positive and gives large distances extra weight. Dividing by <m>n - 1</m> rather than <m>n</m> is the convention for a sample, which B04 explains. For roughly symmetric, bell-shaped data, about 95% of values lie within two standard deviations of the mean (the empirical rule, also in B04).` },
    { p: 'Which measure to use follows the same logic as the averages. The standard deviation goes with the mean and suits roughly symmetric data. The IQR goes with the median and resists extreme values, which is why B02 builds its outlier fences on it. The range is quick, but describes only the two extremes.' },

    { h: 'Weighted averages' },
    { p: String.raw`In a <g>weighted average</g> each value counts in proportion to a weight, <m>\bar{x}_w = \sum w_i x_i \div \sum w_i</m>. The most important example in this course is the overall conversion rate. In July Lantern’s website converted <m>205 \div 7{,}400 \approx 2.770\%</m> of its visits and the app <m>89 \div 2{,}400 \approx 3.708\%</m>. The plain average of the two rates is about 3.24%, but the shop’s real conversion was <m>294 \div 9{,}800 = 3.00\%</m>. The overall rate is the channel rates weighted by each channel’s visits:` },
    { math: String.raw`\frac{7{,}400 \times 2.770\% + 2{,}400 \times 3.708\%}{9{,}800} = 0.755 \times 2.770\% + 0.245 \times 3.708\% \approx 3.00\%` },
    { p: 'The website had three-quarters of the visits, so its rate counts three times as much. The plain average treats the two channels as equal and overstates the shop’s conversion. The same rule applies to any average of averages: to average monthly AOVs across several months, weight each month’s AOV by its orders; to average two branches’ ratings, weight by the number of ratings. The weighted result always equals the total of the numerators divided by the total of the denominators, which is the simplest way to compute it. It also means the overall rate can move when nothing but the mix of channels changes, a point the next lesson develops.' },

    { h: 'Rounding and precision' },
    { ol: [
      String.raw`<b>Round at the end.</b> Rounding July’s channel rates to 2.8% and 3.7% before weighting gives <m>(7{,}400 \times 2.8 + 2{,}400 \times 3.7) \div 9{,}800 \approx 3.02\%</m> instead of 3.00%. Keep full precision in the working; round the answer.`,
      'Match the precision to the data. July’s returning share is 38.0952…%; report 38.1%. Four decimal places suggest an accuracy that 294 orders can’t deliver.',
      'Be consistent. Give every value in a column of a table the same number of decimal places, so that differences in digits don’t look like differences in size.',
      'Rounded parts may not add up. Three shares of 33.3% total 99.9%. Say so in a note rather than fudging one figure.',
      'Know when an input was rounded. The case’s average ratings are given to one decimal place, so a change from 4.4 to 4.5 could be anything from just above 0 to just under 0.2 stars.',
    ] },
  ],

  formulas: [
    { id: 'sum-pct-change', name: 'Absolute and percentage change',
      tex: String.raw`\Delta = x_{\text{new}} - x_{\text{old}}, \qquad \%\Delta = \dfrac{x_{\text{new}} - x_{\text{old}}}{x_{\text{old}}} \times 100`,
      where: [
        [String.raw`x_{\text{old}}`, 'The starting value: the base', 'units of x'],
        [String.raw`x_{\text{new}}`, 'The later value', 'units of x'],
        [String.raw`\Delta`, 'Absolute change', 'units of x'],
        [String.raw`\%\Delta`, 'Percentage change', '%'],
      ],
      note: 'The base is the old value, so a rise and a fall of the same size have different percentages.' },
    { id: 'sum-pp', name: 'Change in percentage points',
      tex: String.raw`\Delta_{\text{pp}} = p_{\text{new}} - p_{\text{old}}`,
      where: [
        [String.raw`p_{\text{old}},\ p_{\text{new}}`, 'Two percentages, such as conversion rates in two months', '%'],
        [String.raw`\Delta_{\text{pp}}`, 'Change in percentage points', 'percentage points'],
      ],
      note: 'From 3.00% to 2.60% is −0.40 points; the relative change is (2.60 − 3.00) ÷ 3.00 × 100 ≈ −13.3%.' },
    { id: 'sum-cgr', name: 'Compound growth rate',
      tex: String.raw`g = \left(\dfrac{x_{\text{end}}}{x_{\text{start}}}\right)^{1/n} - 1`,
      where: [
        [String.raw`g`, 'Constant growth rate per period that links start and end', 'per period'],
        [String.raw`x_{\text{start}},\ x_{\text{end}}`, 'Values at the start and end', 'units of x'],
        [String.raw`n`, 'Number of periods (steps) between them', 'periods'],
      ],
      assumptions: 'Both values positive.',
      note: 'Not the mean of the period-by-period rates, which overstates growth when the rates vary.' },
    { id: 'sum-mean-median', name: 'Mean and median',
      tex: String.raw`\bar{x} = \dfrac{1}{n}\sum_{i=1}^{n} x_i, \qquad \text{median position} = \dfrac{n + 1}{2}`,
      where: [
        [String.raw`x_i`, 'The i-th value', 'units of x'],
        [String.raw`n`, 'Number of values', ''],
        [String.raw`\bar{x}`, 'Mean', 'units of x'],
      ],
      note: 'Find the median in the sorted values; with an even n, average the two middle values.' },
    { id: 'sum-iqr', name: 'Quartiles and interquartile range',
      tex: String.raw`\text{position of } Q_p = 1 + (n - 1)p, \qquad \text{IQR} = Q_3 - Q_1`,
      where: [
        [String.raw`Q_p`, 'Quartile: the value with a share p of the sorted data below it', 'units of x'],
        [String.raw`p`, 'The share below the quartile: 0.25 for Q1, 0.75 for Q3', ''],
        [String.raw`n`, 'Number of values', ''],
        [String.raw`\text{IQR}`, 'Interquartile range', 'units of x'],
      ],
      assumptions: 'Quartiles by linear interpolation: values sorted from smallest to largest, interpolating between neighbours when the position is not a whole number (as Excel’s QUARTILE.INC does).',
      note: 'Other quartile methods exist and give slightly different values; state the one you use.' },
    { id: 'sum-sd', name: 'Sample standard deviation',
      tex: String.raw`s = \sqrt{\dfrac{\sum_{i=1}^{n} (x_i - \bar{x})^2}{n - 1}}`,
      where: [
        [String.raw`s`, 'Sample standard deviation', 'units of x'],
        [String.raw`x_i`, 'The i-th value', 'units of x'],
        [String.raw`\bar{x}`, 'Mean of the values', 'units of x'],
        [String.raw`n`, 'Number of values', ''],
      ],
      note: 'Roughly the typical distance of a value from the mean. B04 explains why the divisor is n − 1.' },
    { id: 'sum-weighted', name: 'Weighted average',
      tex: String.raw`\bar{x}_w = \dfrac{\sum_{i} w_i x_i}{\sum_{i} w_i}`,
      where: [
        [String.raw`x_i`, 'The values being averaged, such as each channel’s conversion rate', 'units of x'],
        [String.raw`w_i`, 'Their weights, such as each channel’s visits', 'units of the weight'],
        [String.raw`\bar{x}_w`, 'Weighted average', 'units of x'],
      ],
      note: 'For rates, it equals total numerator ÷ total denominator: overall conversion = all orders ÷ all visits.' },
  ],

  examples: [
    { level: 'simple', title: 'Describing December in the right words', fictional: true,
      setup: 'Lantern’s visits rose from 13,600 in November to 16,200 in December. Its orders were 435 and 583, of which 88 and 231 were gift boxes. Calculate the change in visits, the gift-box share of orders in each month, and the change in that share in percentage points and in relative terms.',
      steps: [
        String.raw`Visits: absolute change <m>16{,}200 - 13{,}600 = 2{,}600</m>; percentage change <m>2{,}600 \div 13{,}600 \times 100 \approx 19.1\%</m>.`,
        String.raw`Gift-box share of orders: November <m>88 \div 435 \times 100 \approx 20.2\%</m>; December <m>231 \div 583 \times 100 \approx 39.6\%</m>.`,
        String.raw`Change in the share, in percentage points: <m>39.62 - 20.23 \approx 19.4</m> points (from the unrounded shares).`,
        String.raw`Relative change in the share: <m>39.62 \div 20.23 - 1 \approx 95.9\%</m>: the share almost doubled.`,
      ],
      answer: 'Visits rose by 2,600 (19.1%). The gift-box share of orders rose from 20.2% to 39.6%: up 19.4 percentage points, a relative rise of 95.9%.',
      interpretation: 'A sentence such as “gift boxes rose 19.4%” would be wrong twice over: the share rose 19.4 points, and the number of gift-box orders rose 162.5%. Name the quantity, then give the change in its proper unit.' },
    { level: 'challenging', title: 'Average growth at a tea subscription business', fictional: true,
      setup: 'Kettle & Leaf, a fictional tea subscription business, had 1,200 subscribers at the end of January, then 1,320, 1,254, 1,505 and 1,580 at the end of February to May. (a) What was the average monthly growth rate from January to May? (b) Why is the mean of the monthly growth rates the wrong answer? (c) In the same period the monthly cancellation rate fell from 4.0% to 3.0%, and the marketing team wrote “cancellations fell 1%”. Correct the sentence.',
      steps: [
        String.raw`Monthly growth rates: <m>1{,}320 \div 1{,}200 - 1 = 10.0\%</m>; <m>1{,}254 \div 1{,}320 - 1 = -5.0\%</m>; <m>1{,}505 \div 1{,}254 - 1 \approx 20.0\%</m>; <m>1{,}580 \div 1{,}505 - 1 \approx 5.0\%</m>.`,
        String.raw`Compound growth rate over four steps: <m>(1{,}580 \div 1{,}200)^{1/4} - 1 \approx 7.12\%</m> a month.`,
        String.raw`The mean of the four monthly rates is <m>(10.0 - 5.0 + 20.0 + 5.0) \div 4 \approx 7.50\%</m>. Applied for four months it gives <m>1{,}200 \times 1.075^4 \approx 1{,}603</m> subscribers, more than the real 1,580. The mean of rates ignores compounding: a fall from a larger base and a rise from a smaller one don’t cancel.`,
        String.raw`Cancellation rate: from 4.0% to 3.0% is a fall of <m>4.0 - 3.0 = 1</m> percentage point, and a relative fall of <m>1 \div 4.0 \times 100 = 25\%</m>.`,
      ],
      answer: '(a) About 7.12% a month, compounded. (b) The mean of the monthly rates, 7.50%, would turn 1,200 into about 1,603, not 1,580. (c) “The cancellation rate fell by 1 percentage point, from 4.0% to 3.0%, a relative fall of 25%.”',
      interpretation: 'The corrected sentence is less flattering than the relative figure and more accurate than the original. A 25% fall in the cancellation rate is a real achievement; “fell 1%” undersold it by a factor of 25, and readers could not tell which figure was meant.' },
    { level: 'applied', title: 'What is a typical December order?', fictional: true,
      setup: 'Ana is thinking of moving the free-delivery threshold, $35 since the July relaunch, to encourage customers to add a bag. She pulls a sample of eleven December orders (fictional): $16.50, $19.50, $22, $28, $28, $33, $39, $46, $58, $98 and $175. Summarise the sample, and say where a threshold should sit if it is to nudge a typical customer.',
      steps: [
        String.raw`Mean: the orders add to $563, so the mean is <m>563 \div 11 \approx 51.18</m> dollars.`,
        String.raw`Median: with <m>n = 11</m> the median is at position <m>(11 + 1) \div 2 = 6</m>: $33. The mode is $28, the only value that occurs twice, which says little in a sample this small.`,
        String.raw`Quartiles: Q1 at position <m>1 + 10 \times 0.25 = 3.5</m>, halfway between $22 and $28: $25. Q3 at position 8.5, halfway between $46 and $58: $52. IQR <m>= 52 - 25 = 27</m> dollars.`,
        'Compare. The mean sits above eight of the eleven orders, pulled up by two large ones (a gift-box order and a bulk order). The median and the quartiles describe the typical customer better: half the orders are $33 or less, and the middle half run from $25 to $52.',
        'Decide. A threshold near the mean, say $50, would be out of reach for most customers and would mostly reward people who already spend that much. A threshold a little above the median, around $40, sits within one more bag of a typical $28–$33 order (Lantern’s bags start at $14).',
      ],
      answer: 'Mean $51.18, median $33, Q1 $25, Q3 $52, IQR $27. The median and IQR describe the typical order; a threshold of about $40, just above the median, is the one a typical customer can reach with one more bag.',
      interpretation: 'The mean is the right number for forecasting December’s revenue, because mean × orders = revenue, but the wrong number for describing what a typical customer spends. Eleven orders are a small sample, so Ana should check the median on the whole month before setting the threshold.' },
  ],

  demo: [
    { widget: 'sum-change', intro: 'Set an old and a new rate. The widget reports the change in percentage points and the relative change. Make the old rate small (say 1%) and see how a small change in points becomes a large relative change.' },
    { widget: 'sum-orders', intro: 'Forty fictional December order values. Compare the mean with the median, look at the long tail of large orders, and switch to a log scale to see the shape of the bulk of the orders.' },
    { widget: 'sum-weighted', intro: 'Lantern’s July channels: the overall conversion rate is a weighted average. Move visits between the channels without changing either channel’s rate and watch the overall rate move.' },
  ],

  mistakes: [
    { title: '“Conversion fell 0.4%.”', html: 'From 3.00% to 2.60% is a fall of 0.4 percentage points, or 13.3% in relative terms. “0.4%” states neither. Use points for differences between percentages.' },
    { title: '“Gift boxes grew 878%, our best result.”', html: 'From 9 to 88 is a huge percentage on a tiny base. December’s 162.5% added more orders (143 against 79). Report the counts with any percentage change, especially from a small base.' },
    { title: '“Average monthly growth is the mean of the monthly rates.”', html: 'Growth compounds. Kettle & Leaf’s mean monthly rate, 7.50%, overstates its compound rate of 7.12%. Use (end ÷ start)^(1/n) − 1, with n the number of steps.' },
    { title: '“The average of the channel rates is the shop’s rate.”', html: 'Only if the channels are the same size. July’s plain average, 3.24%, overstates the shop’s 3.00% because the website, with the lower rate, had three-quarters of the visits. Weight by the denominators, or divide total orders by total visits.' },
    { title: '“The mean is the typical value.”', html: 'In skewed data it isn’t. December’s sample mean of $51.18 was above eight of eleven orders. Use the median for “typical” and the mean for totals.' },
    { title: '“More decimals look more professional.”', html: 'They suggest a precision the data don’t have, and rounding the inputs early shifts the answer (3.02% instead of 3.00% in the July example). Keep full precision while calculating, then round the result sensibly.' },
  ],

  application: [
    { p: 'Official statisticians face the same choices and make them explicitly. The US Bureau of Labor Statistics reports movements in the Consumer Price Index as percentage changes rather than as changes in index points, because a change in points depends on how far the index has moved from its base period, while a percentage change does not. Its own worked example uses the all-items index for urban consumers, not seasonally adjusted: it rose from 277.948 in November 2021 to 278.802 in December 2021, 0.854 points, which is a 0.3% rise. The BLS also notes that a December-to-December change and an annual-average change are different figures, a reminder to state which comparison a growth rate makes.' },
    { p: 'In a monthly business review the same discipline applies to every line. The revenue manager of a fictional hotel reports occupancy, a percentage, as “82%, up 3 points on last year”; the average daily rate, a dollar amount, as “$184, up 4.0%”; and length of stay by its median, because a handful of month-long corporate bookings make the mean misleading. When she combines the hotel’s two buildings, she weights each building’s occupancy by its rooms, never averaging the two percentages.' },
    { case: 'Ana rewrites her assistant’s December note: “Visits rose 19.1% on November, to 16,200. Gift boxes were 231 of 583 orders, 39.6%, up 19.4 percentage points on November’s 20.2%. The average rating was 4.5 from 199 rated orders, against 4.4 in November; at one decimal place the change could be small.” Each number now says what it is a share or change of, and in what unit. The project asks you to write the same kind of note for the whole half-year.' },
  ],

  summary: [
    'A proportion is a part divided by its whole; a percentage is the proportion × 100. Always name the whole.',
    'Percentage change = (new − old) ÷ old × 100. The base is the old value, so equal rises and falls don’t cancel, and small bases give dramatic, often meaningless percentages.',
    'For a quantity that is itself a percentage, report changes in percentage points (3.00% to 2.60% is −0.4 points) and, if useful, the relative change (−13.3%).',
    'Average growth over n periods is the compound rate (end ÷ start)^(1/n) − 1, not the mean of the period rates.',
    'Mean for totals and symmetric data; median for the typical value in skewed data; mode for categories. The level of measurement limits the choice.',
    'Spread: the range (two extremes), the IQR (middle half, robust) and the standard deviation (typical distance from the mean). Pair the IQR with the median and the standard deviation with the mean.',
    'An overall rate is a weighted average of group rates, weighted by the denominators: overall conversion = all orders ÷ all visits.',
    'Keep full precision while calculating, round at the end, and match the decimals to what the data support.',
  ],

  glossary: [
    { term: 'Proportion', def: 'A part divided by the whole it belongs to, a number between 0 and 1. Multiplied by 100 it is a percentage.' },
    { term: 'Percentage change', def: 'The change in a value divided by its starting value, times 100: (new − old) ÷ old × 100. The starting value is the base.' },
    { term: 'Percentage point', def: 'The unit for the difference between two percentages: a change from 8% to 5% is a fall of 3 percentage points (and a relative fall of 37.5%).' },
    { term: 'Base effect', def: 'A large percentage change produced mainly by a small or unusual starting value rather than by a large change in the quantity itself.' },
    { term: 'Compound growth rate', def: 'The constant rate per period that takes a starting value to an ending value over n periods: (end ÷ start)^(1/n) − 1. Over years it is the compound annual growth rate.' },
    { term: 'Mean', def: 'The sum of the values divided by how many there are; the arithmetic average. Multiplied by the count it gives the total.' },
    { term: 'Median', def: 'The middle value of a set of values sorted in order, with half at or below it and half at or above; with an even number of values, the average of the two middle ones.' },
    { term: 'Mode', def: 'The value that occurs most often in a set of values; the only average available for nominal data.' },
    { term: 'Range', def: 'The largest value minus the smallest: a measure of spread that depends only on the two extremes.' },
    { term: 'Quartile', def: 'One of the three values that divide sorted data into four equal parts: a quarter of the data lie below the first quartile (Q1), half below the second (the median) and three-quarters below the third (Q3).' },
    { term: 'Interquartile range', def: 'The third quartile minus the first quartile: the width of the middle half of the data (IQR).' },
    { term: 'Standard deviation', def: 'A measure of spread: roughly the typical distance of values from their mean, calculated as the square root of the average squared distance (dividing by n − 1 for a sample).' },
    { term: 'Weighted average', def: 'An average in which each value counts in proportion to a weight. The mean of all rows equals the average of the group means weighted by group size.' },
  ],

  references: [
    { text: 'Illowsky, B. &amp; Dean, S. (2023). <i>Introductory Statistics 2e</i>, section 2.5, “Measures of the Center of the Data”. OpenStax.', url: 'https://openstax.org/books/introductory-statistics-2e/pages/2-5-measures-of-the-center-of-the-data', checked: '2026-10-23' },
    { text: 'Illowsky, B. &amp; Dean, S. (2023). <i>Introductory Statistics 2e</i>, section 2.7, “Measures of the Spread of the Data”. OpenStax.', url: 'https://openstax.org/books/introductory-statistics-2e/pages/2-7-measures-of-the-spread-of-the-data', checked: '2026-10-23' },
    { text: 'NIST/SEMATECH. <i>e-Handbook of Statistical Methods</i>, section 1.3.5.1, “Measures of Location”.', url: 'https://www.itl.nist.gov/div898/handbook/eda/section3/eda351.htm', checked: '2026-10-23' },
    { text: 'NIST/SEMATECH. <i>e-Handbook of Statistical Methods</i>, section 1.3.5.6, “Measures of Scale”.', url: 'https://www.itl.nist.gov/div898/handbook/eda/section3/eda356.htm', checked: '2026-10-23' },
    { text: 'U.S. Bureau of Labor Statistics. “Calculating percent changes”. Consumer Price Index fact sheet, last modified 9 February 2023.', url: 'https://www.bls.gov/cpi/factsheets/calculating-percent-changes.htm', checked: '2026-10-23' },
  ],

  checks: [
    // case facts
    { what: 'November visits (case)', value: V[N], shown: 13600 },
    { what: 'December visits (case)', value: V[Dm], shown: 16200 },
    { what: 'November orders (case)', value: D.orders[N], shown: 435 },
    { what: 'December orders (case)', value: D.orders[Dm], shown: 583 },
    { what: 'Gift boxes Oct, Nov, Dec (case)', value: S.giftBoxOrders[3] * 10000 + S.giftBoxOrders[4] * 1000 + S.giftBoxOrders[5], shown: 9 * 10000 + 88 * 1000 + 231 },
    { what: 'July average rating (case)', value: S.avgRating[0], shown: 4.4 },
    { what: 'July ratings given (case)', value: S.ratingsGiven[0], shown: 118 },
    { what: 'November and December ratings (case)', value: S.avgRating[N] * 10 + S.avgRating[Dm], shown: 44 + 4.5 },
    { what: 'December rated orders (case)', value: S.ratingsGiven[Dm], shown: 199 },
    // concept
    { what: 'Visits up Nov to Dec (%)', value: pc(V[N], V[Dm]), shown: 19.1, tol: 0.05 },
    { what: 'Gift boxes up Nov to Dec (%)', value: pc(S.giftBoxOrders[N], S.giftBoxOrders[Dm]), shown: 162.5 },
    { what: 'Gift-box proportion of Dec orders', value: S.giftBoxOrders[Dm] / D.orders[Dm], shown: 0.396, tol: 0.0005 },
    { what: 'Gift-box share of Dec orders (%)', value: S.giftBoxOrders[Dm] / D.orders[Dm] * 100, shown: 39.6, tol: 0.05 },
    { what: 'Rating up 0.1', value: S.avgRating[Dm] - S.avgRating[N], shown: 0.1 },
    { what: 'Visits absolute change', value: V[Dm] - V[N], shown: 2600 },
    { what: 'Fall back from 16,200 (%)', value: -pc(V[Dm], V[N]), shown: 16.0, tol: 0.05 },
    { what: '+50% then −50%', value: 1.5 * 0.5, shown: 0.75 },
    { what: 'Westerly points', value: 3.00 - 2.60, shown: 0.40 },
    { what: 'Westerly relative (%)', value: (2.60 - 3.00) / 3.00 * 100, shown: -13.3, tol: 0.05 },
    { what: '0.4% versus 13.3%: about thirty times', value: 13.333 / 0.4, shown: 33, tol: 0.5 },
    { what: 'Ratings total', value: sum(JULY_STARS), shown: 118 },
    { what: 'Stars × ratings: 5', value: 5 * 72, shown: 360 },
    { what: 'Stars × ratings: 4', value: 4 * 31, shown: 124 },
    { what: 'Stars × ratings: 3', value: 3 * 8, shown: 24 },
    { what: 'Stars × ratings: 2', value: 2 * 3, shown: 6 },
    { what: 'Stars × ratings: 1', value: 1 * 4, shown: 4 },
    { what: 'Total stars', value: sum(STARS.map((s, i) => s * JULY_STARS[i])), shown: 518 },
    { what: 'Mean rating', value: 518 / 118, shown: 4.39 },
    { what: 'Mean rating rounds to case value', value: Math.round(518 / 118 * 10) / 10, shown: S.avgRating[0] },
    { what: 'Ratings of 4 stars or fewer', value: 31 + 8 + 3 + 4, shown: 46 },
    { what: 'Branch A mean', value: mean(BRANCH_A), shown: 11 },
    { what: 'Branch B mean', value: mean(BRANCH_B), shown: 11 },
    { what: 'Branch A median', value: quant(BRANCH_A, 0.5), shown: 11 },
    { what: 'Branch B median', value: quant(BRANCH_B, 0.5), shown: 11 },
    { what: 'Branch A range', value: 15 - 7, shown: 8 },
    { what: 'Branch B range', value: 19 - 3, shown: 16 },
    { what: 'Branch A Q1', value: quant(BRANCH_A, 0.25), shown: 10 },
    { what: 'Branch A Q3', value: quant(BRANCH_A, 0.75), shown: 12 },
    { what: 'Branch A IQR', value: quant(BRANCH_A, 0.75) - quant(BRANCH_A, 0.25), shown: 2 },
    { what: 'Branch B Q1', value: quant(BRANCH_B, 0.25), shown: 8 },
    { what: 'Branch B Q3', value: quant(BRANCH_B, 0.75), shown: 14 },
    { what: 'Branch B IQR', value: quant(BRANCH_B, 0.75) - quant(BRANCH_B, 0.25), shown: 6 },
    { what: 'Branch A SD', value: sd(BRANCH_A), shown: 2.35 },
    { what: 'Branch B SD', value: sd(BRANCH_B), shown: 5.24 },
    { what: 'Branch A squares', value: sum(BRANCH_A.map((x) => (x - 11) ** 2)), shown: 44 },
    { what: 'Branch A variance', value: 44 / 8, shown: 5.5 },
    { what: 'Branch B squares', value: sum(BRANCH_B.map((x) => (x - 11) ** 2)), shown: 220 },
    // theory: traps
    { what: 'Gift boxes Oct to Nov (%)', value: pc(9, 88), shown: 877.8, tol: 0.05 },
    { what: 'Gift-box rise Nov to Dec', value: 231 - 88, shown: 143 },
    { what: 'Gift-box rise Oct to Nov', value: 88 - 9, shown: 79 },
    { what: 'Undo a 20% fall', value: (1 / 0.8 - 1) * 100, shown: 25 },
    // theory: growth table
    { what: 'Visits Jul', value: V[0], shown: 9800 },
    { what: 'Visits Aug', value: V[1], shown: 10200 },
    { what: 'Visits Sep', value: V[2], shown: 11400 },
    { what: 'Visits Oct', value: V[3], shown: 11000 },
    { what: 'Jul to Aug (%)', value: vg[0] * 100, shown: 4.1, tol: 0.05 },
    { what: 'Aug to Sep (%)', value: vg[1] * 100, shown: 11.8, tol: 0.05 },
    { what: 'Sep to Oct (%)', value: vg[2] * 100, shown: -3.5, tol: 0.05 },
    { what: 'Oct to Nov (%)', value: vg[3] * 100, shown: 23.6, tol: 0.05 },
    { what: 'Nov to Dec (%)', value: vg[4] * 100, shown: 19.1, tol: 0.05 },
    { what: 'Total growth Jul to Dec (%)', value: pc(V[0], V[5]), shown: 65.3, tol: 0.05 },
    { what: 'Mean of monthly rates (%)', value: mean(vg) * 100, shown: 11.0, tol: 0.05 },
    { what: 'Mean of monthly rates, 2 dp (%)', value: mean(vg) * 100, shown: 11.02, tol: 0.005 },
    { what: 'Visits at mean rate, about 16,500', value: V[0] * (1 + mean(vg)) ** 5, shown: 16500, tol: 50 },
    { what: 'Lantern’s cheapest bag (README list prices)', value: 14, shown: 14 },
    { what: 'Compound monthly growth (%)', value: ((V[5] / V[0]) ** (1 / 5) - 1) * 100, shown: 10.6, tol: 0.05 },
    { what: 'Compound rate, 5 dp', value: (V[5] / V[0]) ** (1 / 5), shown: 1.10575, tol: 0.000005 },
    { what: 'Compound rate reproduces December', value: V[0] * 1.10575 ** 5, shown: 16200, tol: 0.5 },
    { what: 'Steps Jul to Dec', value: 5, shown: 5 },
    // theory: spread
    { what: 'n for branches', value: BRANCH_A.length, shown: 9 },
    { what: 'Q1 position n = 9', value: 1 + 8 * 0.25, shown: 3 },
    { what: 'Q3 position n = 9', value: 1 + 8 * 0.75, shown: 7 },
    { what: 'Empirical rule (%)', value: 95, shown: 95 },
    // theory: weighted
    { what: 'Web July conversion (%, 3 dp)', value: S.webOrders[0] / S.webVisits[0] * 100, shown: 2.770, tol: 0.0005 },
    { what: 'App July conversion (%, 3 dp)', value: S.appOrders[0] / S.appVisits[0] * 100, shown: 3.708, tol: 0.0005 },
    { what: 'Plain average of channel rates (%)', value: (S.webOrders[0] / S.webVisits[0] + S.appOrders[0] / S.appVisits[0]) / 2 * 100, shown: 3.24 },
    { what: 'July conversion (%)', value: D.orders[0] / D.visits[0] * 100, shown: 3.00 },
    { what: 'Web share of visits', value: S.webVisits[0] / D.visits[0], shown: 0.755, tol: 0.0005 },
    { what: 'App share of visits', value: S.appVisits[0] / D.visits[0], shown: 0.245, tol: 0.0005 },
    { what: 'Weighted average (%)', value: (S.webVisits[0] * (S.webOrders[0] / S.webVisits[0]) + S.appVisits[0] * (S.appOrders[0] / S.appVisits[0])) / D.visits[0] * 100, shown: 3.00 },
    { what: 'Web visits about three times app', value: S.webVisits[0] / S.appVisits[0], shown: 3, tol: 0.1 },
    // theory: rounding
    { what: 'Rounded inputs give (%)', value: (7400 * 2.8 + 2400 * 3.7) / 9800, shown: 3.02 },
    { what: 'July returning share unrounded (%)', value: (294 - 182) / 294 * 100, shown: 38.0952, tol: 0.00005 },
    { what: 'Three thirds rounded', value: 3 * 33.3, shown: 99.9 },
    { what: 'Max change 4.4 to 4.5 (stars)', value: 4.55 - 4.35, shown: 0.2 },
    // examples: simple
    { what: 'Nov gift-box share (%)', value: S.giftBoxOrders[N] / D.orders[N] * 100, shown: 20.2, tol: 0.05 },
    { what: 'Nov share 2 dp (%)', value: S.giftBoxOrders[N] / D.orders[N] * 100, shown: 20.23, tol: 0.005 },
    { what: 'Dec share 2 dp (%)', value: S.giftBoxOrders[Dm] / D.orders[Dm] * 100, shown: 39.62, tol: 0.005 },
    { what: 'Share change (points)', value: (S.giftBoxOrders[Dm] / D.orders[Dm] - S.giftBoxOrders[N] / D.orders[N]) * 100, shown: 19.4, tol: 0.05 },
    { what: 'Share relative change (%)', value: ((S.giftBoxOrders[Dm] / D.orders[Dm]) / (S.giftBoxOrders[N] / D.orders[N]) - 1) * 100, shown: 95.9, tol: 0.05 },
    // examples: challenging
    { what: 'K&L Feb (%)', value: g[0] * 100, shown: 10.0, tol: 0.05 },
    { what: 'K&L Mar (%)', value: g[1] * 100, shown: -5.0, tol: 0.05 },
    { what: 'K&L Apr (%)', value: g[2] * 100, shown: 20.0, tol: 0.05 },
    { what: 'K&L May (%)', value: g[3] * 100, shown: 5.0, tol: 0.05 },
    { what: 'K&L compound (%)', value: ((1580 / 1200) ** 0.25 - 1) * 100, shown: 7.12 },
    { what: 'K&L mean of rates (%)', value: mean(g) * 100, shown: 7.50 },
    { what: 'K&L at mean rate', value: 1200 * 1.075 ** 4, shown: 1603, tol: 0.5 },
    { what: 'Cancellation points', value: 4.0 - 3.0, shown: 1 },
    { what: 'Cancellation relative (%)', value: 1 / 4.0 * 100, shown: 25 },
    // examples: applied
    { what: 'Sample total', value: sum(DEC_SAMPLE), shown: 563 },
    { what: 'Sample mean', value: mean(DEC_SAMPLE), shown: 51.18 },
    { what: 'Sample median position', value: (11 + 1) / 2, shown: 6 },
    { what: 'Sample median', value: quant(DEC_SAMPLE, 0.5), shown: 33 },
    { what: 'Sample Q1 position', value: 1 + 10 * 0.25, shown: 3.5 },
    { what: 'Sample Q1', value: quant(DEC_SAMPLE, 0.25), shown: 25 },
    { what: 'Sample Q3 position', value: 1 + 10 * 0.75, shown: 8.5 },
    { what: 'Sample Q3', value: quant(DEC_SAMPLE, 0.75), shown: 52 },
    { what: 'Sample IQR', value: quant(DEC_SAMPLE, 0.75) - quant(DEC_SAMPLE, 0.25), shown: 27 },
    { what: 'Orders below the mean', value: DEC_SAMPLE.filter((x) => x < mean(DEC_SAMPLE)).length, shown: 8 },
    // application (BLS worked example, cited)
    { what: 'CPI points Nov to Dec 2021', value: 278.802 - 277.948, shown: 0.854 },
    { what: 'CPI percent Nov to Dec 2021', value: (278.802 / 277.948 - 1) * 100, shown: 0.3, tol: 0.05 },
  ],
};
