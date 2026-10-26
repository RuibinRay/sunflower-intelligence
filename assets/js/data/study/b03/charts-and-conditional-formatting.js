// charts-and-conditional-formatting.js — B03 · Charts and conditional formatting. Content only; exercises are in
// charts-and-conditional-formatting.ex.js. Uses the spring orders (ORDERS, DERIVED.byRegion, byMonth, byChannel) from
// case.js: order value by region and month, the $1,512 office order LC-10144, weekly orders. New fictional facts,
// labelled: Ana's draft chart with an axis starting at 45, and Pedalworks' parts sheet (applied example).
// Every figure printed is recomputed in `checks`.
import { ORDERS, ORDER_COLUMNS, PRODUCTS, DERIVED as D } from './case.js?v=18';
import { PARTS } from './charts-and-conditional-formatting.ex.js?v=18';

const col = (n) => ORDERS.map((r) => r[ORDER_COLUMNS.indexOf(n)]);
const sum = (a) => a.reduce((s, x) => s + x, 0);
const r2 = (x) => Math.round(x * 100) / 100;
const R = D.byRegion.value, M = D.byMonth, BULK = D.bulk.value;
const TOTAL = D.orderValue;

// weekly orders, Monday 2 March to Sunday 28 June 2026 (17 full weeks)
const WEEK0 = Date.UTC(2026, 2, 2);
const weekOf = (iso) => Math.floor((Date.parse(`${iso}T00:00:00Z`) - WEEK0) / 864e5 / 7);
const WEEKLY = Array.from({ length: 17 }, (_, w) => col('order_date').filter((d) => weekOf(d) === w).length);

// WCAG contrast ratio from 8-bit sRGB grey levels
const lin = (c) => { const s = c / 255; return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; };
const lum = (g) => lin(g);                    // a grey: R = G = B
const ratio = (a, b) => { const [hi, lo] = [Math.max(a, b), Math.min(a, b)]; return (hi + 0.05) / (lo + 0.05); };

// Pedalworks' parts sheet (fictional; defined in the .ex.js for the demo widget): part, on hand, reorder point, weekly use
const onHand = PARTS.map((p) => p[1]);
const iconLo = Math.min(...onHand), iconHi = Math.max(...onHand);
const out = PARTS.filter((p) => p[1] === 0), low = PARTS.filter((p) => p[1] > 0 && p[1] <= p[2]);

// ---------------------------------------------------------------- figures (built from the data so they stay exact)
const fmt1 = (x) => Math.round(x * 10) / 10;
function axisFigure() {
  const vals = [M.orders.Mar, M.orders.Apr, M.orders.May, M.orders.Jun], mons = ['Mar', 'Apr', 'May', 'Jun'];
  let s = '<svg viewBox="0 0 640 270" xmlns="http://www.w3.org/2000/svg" font-size="12" fill="currentColor">';
  const panel = (x0, base, top, ticks, title) => {
    const yb = 220, yt = 40, w = 240, y = (v) => yb - ((v - base) / (top - base)) * (yb - yt);
    s += `<text x="${x0 + w / 2}" y="18" text-anchor="middle" font-size="13">${title}</text>`;
    ticks.forEach((t) => { s += `<line x1="${x0}" x2="${x0 + w}" y1="${fmt1(y(t))}" y2="${fmt1(y(t))}" stroke="var(--rule-strong)" stroke-width="0.6" stroke-dasharray="3 3"/><text x="${x0 - 6}" y="${fmt1(y(t)) + 4}" text-anchor="end" font-size="11" fill="var(--ink-3)">${t}</text>`; });
    vals.forEach((v, i) => { const cx = x0 + 30 + i * 60, t = y(v); s += `<rect x="${cx - 18}" y="${fmt1(t)}" width="36" height="${fmt1(yb - t)}" fill="var(--series-1)"/><text x="${cx}" y="${fmt1(t) - 6}" text-anchor="middle" font-size="11">${v}</text><text x="${cx}" y="${yb + 16}" text-anchor="middle" font-size="11">${mons[i]}</text>`; });
    s += `<line x1="${x0}" x2="${x0 + w}" y1="${yb}" y2="${yb}" stroke="var(--ink)" stroke-width="1.2"/>`;
  };
  panel(50, 45, 65, [45, 55, 65], 'Axis starts at 45');
  panel(370, 0, 70, [0, 35, 70], 'Axis starts at 0');
  return `${s}<text x="320" y="262" text-anchor="middle" font-size="11" fill="var(--ink-3)">Orders per month, March–June 2026</text></svg>`;
}
function ruleFigure() {
  const rows = ORDERS.slice(0, 6).map((r) => [r[0], r[ORDER_COLUMNS.indexOf('subscription')]]);
  const X0 = 40, Y0 = 30, cw = 82, rh = 30, cols = ['A', 'B', 'C', 'D', 'E', 'F'];
  let s = '<svg viewBox="0 0 640 320" xmlns="http://www.w3.org/2000/svg" font-size="12" fill="currentColor">';
  cols.forEach((c, j) => { s += `<text x="${X0 + j * cw + cw / 2}" y="${Y0 - 8}" text-anchor="middle" font-size="11" fill="var(--ink-3)">${c}</text>`; });
  for (let i = 0; i <= 6; i++) {
    const y = Y0 + i * rh, yes = i > 0 && rows[i - 1][1] === 'yes';
    s += `<text x="${X0 - 8}" y="${y + 19}" text-anchor="end" font-size="11" fill="var(--ink-3)">${i + 1}</text>`;
    if (yes) s += `<rect x="${X0}" y="${y}" width="${cw * 6}" height="${rh}" fill="var(--series-2)" opacity="0.28"/>`;
    cols.forEach((c, j) => { s += `<rect x="${X0 + j * cw}" y="${y}" width="${cw}" height="${rh}" fill="none" stroke="var(--rule-strong)" stroke-width="0.8"/>`; });
    s += `<text x="${X0 + 6}" y="${y + 19}" font-size="11">${i === 0 ? 'order_id' : rows[i - 1][0]}</text>`;
    s += `<text x="${X0 + 5 * cw + 6}" y="${y + 19}" font-size="11">${i === 0 ? 'subscription' : rows[i - 1][1]}</text>`;
  }
  s += `<rect x="${X0}" y="${Y0 + rh}" width="${cw * 6}" height="${rh * 6}" fill="none" stroke="var(--ink)" stroke-width="2"/>`;
  s += `<rect x="${X0 + 3 * cw + 3}" y="${Y0 + 3 * rh + 3}" width="${cw - 6}" height="${rh - 6}" fill="none" stroke="var(--series-1)" stroke-width="2" stroke-dasharray="4 3"/><text x="${X0 + 3 * cw + cw / 2}" y="${Y0 + 3 * rh + 19}" text-anchor="middle" font-size="11">D4</text>`;
  s += `<text x="${X0}" y="${Y0 + 7 * rh + 24}" font-size="12">Applies to A2:F7. Rule typed for A2:  =$F2=&quot;yes&quot;</text>`;
  s += `<text x="${X0}" y="${Y0 + 7 * rh + 44}" font-size="12">In D4 Excel evaluates  =$F4=&quot;yes&quot;   (column locked by $, row moves)</text>`;
  s += `<text x="${X0}" y="${Y0 + 7 * rh + 64}" font-size="12">Without the $, D4 would test I4, an empty cell, and never highlight.</text>`;
  return `${s}</svg>`;
}

function comboFigure() {
  const orders = [M.orders.Mar, M.orders.Apr, M.orders.May, M.orders.Jun], value = [M.value.Mar, M.value.Apr, M.value.May, M.value.Jun];
  const mons = ['Mar', 'Apr', 'May', 'Jun'];
  let s = '<svg viewBox="0 0 680 280" xmlns="http://www.w3.org/2000/svg" font-size="12" fill="currentColor">';
  const panel = (x0, lo, hi, title) => {
    const yb = 220, yt = 40, w = 240, yp = (v) => yb - (v / 70) * (yb - yt), ys = (v) => yb - ((v - lo) / (hi - lo)) * (yb - yt);
    s += `<text x="${x0 + w / 2}" y="18" text-anchor="middle" font-size="13">${title}</text>`;
    [0, 35, 70].forEach((t) => { s += `<line x1="${x0}" x2="${x0 + w}" y1="${fmt1(yp(t))}" y2="${fmt1(yp(t))}" stroke="var(--rule-strong)" stroke-width="0.6" stroke-dasharray="3 3"/><text x="${x0 - 6}" y="${fmt1(yp(t)) + 4}" text-anchor="end" font-size="11" fill="var(--ink-3)">${t}</text>`; });
    [lo, (lo + hi) / 2, hi].forEach((t) => { s += `<text x="${x0 + w + 6}" y="${fmt1(ys(t)) + 4}" font-size="11" fill="var(--ink-3)">$${t.toLocaleString('en-US')}</text>`; });
    orders.forEach((v, i) => { const cx = x0 + 30 + i * 60; s += `<rect x="${cx - 18}" y="${fmt1(yp(v))}" width="36" height="${fmt1(yb - yp(v))}" fill="var(--series-1)" opacity="0.55"/><text x="${cx}" y="${yb + 16}" text-anchor="middle" font-size="11">${mons[i]}</text>`; });
    s += `<polyline points="${value.map((v, i) => `${x0 + 30 + i * 60},${fmt1(ys(v))}`).join(' ')}" fill="none" stroke="var(--series-2)" stroke-width="2.6"/>`;
    value.forEach((v, i) => { s += `<circle cx="${x0 + 30 + i * 60}" cy="${fmt1(ys(v))}" r="4" fill="var(--series-2)"/>`; });
    s += `<line x1="${x0}" x2="${x0 + w}" y1="${yb}" y2="${yb}" stroke="var(--ink)" stroke-width="1.2"/>`;
  };
  panel(50, 0, 6000, 'Secondary axis $0 to $6,000');
  panel(370, 1800, 3000, 'Secondary axis $1,800 to $3,000');
  return `${s}<text x="340" y="268" text-anchor="middle" font-size="11" fill="var(--ink-3)">Columns: orders per month (left axis, 0 to 70). Line: order value (right axis).</text></svg>`;
}

export default {
  slug: 'charts-and-conditional-formatting',
  title: 'Charts and conditional formatting',
  blurb: 'A chart or a highlighted cell should answer one question at a glance. Choose the chart from the question, build it honestly in Excel (a title that states the finding, bars from zero, colour that never carries the meaning alone), and use conditional formatting, including formula rules with mixed references, to make the cells that matter stand out.',
  status: 'reviewed',
  objectives: [
    'Choose a chart type from the question it must answer: a comparison, a change over time, a composition, a distribution or a relationship.',
    'Build an Excel chart whose title states the finding, with labelled axes, units and direct labels, and calculate the figures it needs, such as shares of a total.',
    'Evaluate a chart’s scales and colours: bars from zero, when a line chart may zoom, the risks of truncated and secondary axes, and colour that is never the only cue.',
    'Apply Excel’s conditional formatting rules (highlight cells, top/bottom, above average, duplicates, data bars, colour scales and icon sets) and explain what each one compares.',
    'Write formula-based conditional formatting rules with mixed references that highlight whole rows, and manage rule order and Stop If True.',
  ],
  prerequisites: [
    { lesson: 'b03/pivot-tables', why: 'The monthly and regional summaries charted here are the ones the PivotTable lesson builds.' },
    { lesson: 'b03/cells-and-formulas', why: 'Formula rules for conditional formatting depend on relative, absolute and mixed references.' },
    { lesson: 'b03/conditional-sums-and-counts', why: 'Chart data are often small summary tables built with SUMIFS and COUNTIFS.' },
    { lesson: 'b01/summarising-data', why: 'Shares of a total, percentage change and the shape of a distribution are what most charts show.' },
  ],
  case: 'lantern',

  concept: [
    { case: 'Ana has her spring summaries: order value and orders by month, region and channel, built with <g>PivotTables</g> from the 231 cleaned orders. Before the July relaunch she wants a two-page spring review (fictional) that her accountant and her part-time packer can read in a minute. Each chart on it has to answer one question, and her order sheet has to show, without scrolling and sorting, which orders need a second look.' },
    { p: 'A chart is an argument made with shapes. Before you choose a type, write down the question the reader should be able to answer, then pick the chart that makes that answer easiest to see. Excel will draw almost anything you select; it can’t know what you want the reader to notice.' },

    { h: 'Start from the question' },
    { p: 'Business charts usually answer one of five kinds of question. The Financial Times’ <i>Visual Vocabulary</i>, presented in the EU’s data.europa.eu visualisation guide, sorts charts by the pattern they highlight in the same spirit: magnitude, change over time, part-to-whole, distribution, correlation, and also ranking and deviation from a reference.' },
    { table: {
      caption: 'Five kinds of question and the charts that answer them (Lantern’s spring data)',
      head: ['Question', 'Lantern example', 'Chart that answers it', 'Excel chart'],
      rows: [
        ['Comparison: which is bigger?', 'Which region brought in the most order value?', 'Bars, sorted, from zero', 'Clustered Bar or Column'],
        ['Change over time', 'How did orders move week by week?', 'A line (columns for a few periods)', 'Line, Line with Markers'],
        ['Composition: what share?', 'What share of order value came through the app?', 'Stacked or 100% stacked bars; a pie only for a few parts of one whole', 'Stacked Column, Pie'],
        ['Distribution: how are values spread?', 'What does a typical order look like?', 'Histogram, box and whisker', 'Histogram, Box and Whisker'],
        ['Relationship: do two measures move together?', 'Do bigger catering events bring bigger invoices?', 'Scatter (XY)', 'Scatter'],
      ],
    } },
    { p: 'The question also decides what goes on the axes. For a comparison, the categories go on one axis and the measure on the other; sort the bars so that the order itself says something. For change over time, time runs left to right at equal intervals. For a relationship, the variable you think drives the other goes on the horizontal axis.' },

    { h: 'The parts of a chart' },
    { p: 'Every Excel chart is built from <g>data series</g>: sets of related values, such as order value for each region, each drawn in its own colour. A column, bar or line chart has a <g>category axis</g>, which places its labels (regions, months) in order along it, and a <g>value axis</g>, which has a numeric scale. A <g>scatter chart</g> has two value axes. Around them sit the chart title, axis titles, a legend that names the series, data labels on the bars or points, and gridlines.' },
    { p: 'Two of these do most of the work. The <b>title</b> should state the finding, not the topic: “Central led spring order value only because of one $1,512 office order” tells the reader what to see, while “Order value by region” leaves them to work it out. <b>Labels</b> should sit next to what they name; with one or two series, label the lines or bars directly and delete the legend, which forces the eye to travel back and forth.' },

    { h: 'Making a chart in Excel' },
    { p: 'Arrange the data as a small table: labels in the first column, one column per series, a header in the first row. Select it and choose Insert &gt; Recommended Charts, which previews the charts Excel suggests for that data; the All Charts tab lists every type. On Windows, Alt+F1 inserts a chart of the default type beside the data at once, and F11 puts one on a separate chart sheet; neither asks what the chart is for. The chart stays linked to its cells, so it redraws when they change; a chart built on a PivotTable is a PivotChart, which the PivotTable lesson introduces.' },
    { p: 'Once the chart exists, add or remove parts with the Chart Elements button beside it (titles, axis titles, data labels, legend, trendline), change its type with Change Chart Type, and change which cells it plots with Select Data. Right-click a part and choose its Format command, such as Format Axis, to set its options, including the minimum and maximum of a value axis.' },

    { h: 'Honest scales' },
    { p: 'A bar shows its value by its <i>length</i>, so a bar chart must start at zero. If the axis starts at 45, a bar for 63 orders is 18 units long and a bar for 49 orders is 4 units long, and the first looks four and a half times the second although it is only 29% larger. A line shows its values by <i>position</i> and its changes by slope, so a line chart may zoom in to show variation, as long as the axis is labelled and the reader is not asked to compare heights with zero.' },
    { figure: {
      svg: axisFigure(),
      caption: 'The same four months drawn twice (Ana’s draft, fictional, on the left). With the axis starting at 45, April’s bar is 4.5 times May’s; from zero the bars are in their true proportion, 63 to 49.',
      alt: 'Two column charts of Lantern’s orders per month, March to June 2026: 59, 63, 49 and 60. In the left chart the value axis runs from 45 to 65, so May’s bar is a short stub and April’s is four and a half times taller. In the right chart the axis runs from 0 to 70 and the four bars look similar, May about four-fifths of April.',
    } },
    { callout: 'key', title: 'Bars start at zero; lines may zoom', html: 'Length is the message in a bar chart, so cutting the axis distorts it. A line chart can use a narrower axis to show movement, because the reader reads position and slope, not length. Say so on the axis, and never mix the two in one comparison.' },

    { h: 'Colour and clutter' },
    { p: 'Use colour for meaning, not decoration: one strong colour for the series or bar you want noticed and a quiet grey for context. Remove what carries no information, such as 3-D effects, shadows, heavy gridlines and a legend for a single series. Every element left should help answer the question in the title.' },
    { p: 'Colour must never be the only cue. The Web Content Accessibility Guidelines (WCAG 2.2), written for web content but a sound standard for any chart, ask that colour is not the only visual means of conveying information (success criterion 1.4.1, level A), that bars, lines and other graphical objects needed to understand a chart have a <g>contrast ratio</g> of at least 3:1 against what is next to them (1.4.11, level AA), and that ordinary text has at least 4.5:1 (1.4.3, level AA). In a chart that means labels or markers as well as colours, and no pale series on a white background.' },

    { h: 'Conditional formatting' },
    { p: '<g>Conditional formatting</g> applies a format to a cell only while a rule about its value is true, and re-applies it whenever the values change. It turns a sheet into a chart of itself: the large orders stand out, the duplicates are marked, a colour gradient shows high and low. You’ll find it at Home &gt; Conditional Formatting.' },
    { p: 'The built-in rules compare each cell with a number or with the rest of the range: greater than 100, the top 10 items, above average, duplicates. When the condition depends on another column, you write a <b>formula rule</b> for the first cell of the range. In this lesson’s order sheet (order_id in A, customer_id B, product C, order_total D, channel E, subscription F), shading every column of a subscription order’s row takes a rule on A2:F16 written as <x>=$F2="yes"</x>: the <code>$</code> keeps every cell looking at column F, and the unlocked row lets each row test its own subscription flag.' },
  ],

  theory: [
    { h: 'Why bars beat pies' },
    { p: 'Cleveland and McGill (1984) measured how accurately people read quantities from different graphical encodings. They ranked the elementary tasks from most to least accurate: position along a common scale; position along non-aligned scales; length, direction and angle; area; volume and curvature; shading and colour saturation. In their experiment, judgements of position, as in a bar chart, were more accurate than judgements of angle, as in a pie chart.' },
    { p: 'That ranking explains most chart advice. Sorted bars on a common baseline use the most accurate task. In a stacked column only the bottom segment sits on the baseline; the others float, so comparing them across columns is a judgement of length on non-aligned scales. A pie asks for angles and areas. Microsoft suggests a pie chart only when there is one data series, no negative values, almost no zeros, and no more than seven categories that together make the whole.' },
    { table: {
      caption: 'Lantern’s spring order value by channel: a composition with two parts',
      head: ['Channel', 'Orders', 'Order value', 'Share of order value'],
      align: ['l', 'r', 'r', 'r'],
      rows: [
        ['Web', '132', '$5,439.95', '59.8%'],
        ['App', '99', '$3,656.20', '40.2%'],
      ],
      foot: [['Total', '231', '$9,096.15', '100.0%']],
    } },
    { p: 'Two parts of one whole are a fair use of a pie, or of a single 100% stacked bar. Five regions are already harder: their shares of spring order value run from 16.7% to 23.4%, and slices that close in size are hard to rank by eye. A sorted bar chart of the same five numbers ranks them at a glance.' },

    { h: 'Choosing between similar charts' },
    { p: '<b>Column or bar.</b> Both compare categories. Microsoft suggests a bar chart (horizontal) when the labels are long, and bars also suit a ranking of many items, because the labels read left to right. Columns suit a handful of periods.' },
    { p: '<b>Line or scatter.</b> In a line chart the horizontal axis is a category axis: text labels go at equal spacing whatever they say, a date axis puts dates in time order, and numbers are treated as labels. A scatter chart has two value axes and places every point at its numeric x. So if the x values are numbers that aren’t evenly spaced, such as the number of guests at each catering event, a line chart misplaces them; Microsoft’s rule of thumb is a line chart for non-numeric x values and a scatter chart for numeric ones.' },
    { p: '<b>Stacked and 100% stacked.</b> A stacked column emphasises the total and shows the parts inside it; a 100% stacked column makes every column the same height and shows shares, which suits comparing a mix across months or regions. Use either with two or three parts at most, and put the part the reader must compare on the baseline.' },
    { p: '<b>Histogram and box and whisker.</b> Both show a distribution, and Excel 2016 and later have both (Insert &gt; Insert Statistic Chart). A histogram groups a numeric column into bins and draws a bar for the count in each: by default Excel sets the bin width by Scott’s normal reference rule, and you can set a bin width, a number of bins, and overflow and underflow bins instead. A <g>box and whisker chart</g> draws the quartiles as a box, the median inside it and whiskers beyond, with outlier points past the whiskers. The next lesson builds the frequency table behind a histogram.' },
    { p: '<b>Combo charts and secondary axes.</b> A <g>combo chart</g> combines chart types, typically columns with a line, and Microsoft suggests a <g>secondary axis</g> when series vary widely or are of different kinds, such as price and volume. Use it with care: the two scales are independent, so where the line crosses the columns, and how steep it looks, depend on axis limits that someone chose. Label both axes with units, colour each axis like its series, and ask whether a ratio of the two (order value per order, say) or two charts one above the other would say it more plainly.' },
    { figure: {
      svg: comboFigure(),
      caption: 'The same spring orders (columns) and order value (line) twice, with only the secondary axis’s limits changed. On the left the line lies flat below every column; on the right it starts low, crosses the columns twice and spikes in May.',
      alt: 'Two combo charts of Lantern’s March to June 2026. In both, columns show orders per month (59, 63, 49 and 60) against a left axis from 0 to 70, and a line shows order value ($1,975.85, $2,175.55, $2,929.75 and $2,015.00) against a right axis. In the left chart the right axis runs from $0 to $6,000, so the line is low and nearly flat, below all four columns. In the right chart the right axis runs from $1,800 to $3,000, so the line starts near the bottom, rises steeply above the May column and falls again, crossing the columns twice.',
    } },
    { p: '<b>Sparklines.</b> A <g>sparkline</g> is a tiny chart inside one worksheet cell (Insert &gt; Sparklines: Line, Column or Win/Loss). Put one at the end of each row of a table, for example each product’s weekly sales, to show many trends side by side without a chart for each. Markers can pick out individual points, and an axis can be shown when values change sign.' },

    { h: 'Truncated axes and their exaggeration' },
    { p: String.raw`When a bar chart’s value axis starts at a baseline <m>b</m> above zero, two bars for values <m>v_1</m> and <m>v_2</m> have lengths <m>v_1 - b</m> and <m>v_2 - b</m>. Their apparent ratio is <m>(v_1 - b) \div (v_2 - b)</m>, while the true ratio is <m>v_1 \div v_2</m>. The closer <m>b</m> is to the smaller value, the greater the exaggeration. A <g>truncated axis</g> on a line chart doesn’t carry this error, because nobody reads a line’s height from zero, but it can still make a small wobble look like a crisis, so label it.` },

    { h: 'Conditional formatting rules in Excel' },
    { list: [
      '<b>Highlight Cells Rules</b>: Greater Than, Less Than, Between, Equal To, Text that Contains, A Date Occurring and Duplicate Values. Each compares a cell with a value you type (or a cell you point to).',
      '<b>Top/Bottom Rules</b>: Top 10 Items, Top 10%, Bottom 10 Items, Bottom 10%, Above Average and Below Average. The 10 is only the default: you can choose 1 to 1,000 items or 1% to 100% of the range. Average rules compare with the mean of the selected range.',
      '<b>Data Bars</b>: a bar inside each cell, longer for larger values.',
      '<b>Color Scales</b>: a two- or three-colour gradient between the minimum, a midpoint and the maximum.',
      '<b>Icon Sets</b>: three to five icons, each for a band of values set by thresholds. Microsoft says the default bands are equal in size; with three arrows that is roughly the top, middle and bottom third of the way from the lowest value to the highest (the sheets in this lesson split at 67% and 33%).',
      '<b>New Rule &gt; Use a formula to determine which cells to format</b>: any formula that returns TRUE or FALSE.',
    ] },
    { p: 'By default (Automatic) a data bar’s length is proportional to its value, so the longest bar belongs to the largest value; a colour scale runs from the lowest value to the highest. You can change either by setting the minimum and maximum types (a number, a percent, a percentile or a formula). That matters when one value dwarfs the rest. Lantern’s office order of $1,512 would stretch the data bars so far that a $58 gift box got a sliver of a bar; setting the maximum to a number, such as 200, or to a percentile, restores the comparison among ordinary orders.' },
    { h: 'Formula rules and mixed references' },
    { p: 'A formula rule is written for the top-left cell of the “Applies to” range, and Excel adjusts it for every other cell as if the formula had been filled across and down: relative references move, absolute ones don’t. That is why whole-row highlighting needs a <g>mixed reference</g> such as <code>$F2</code>, with the column locked and the row free. The formula must return TRUE or FALSE (or 1 or 0), and it must start with an equals sign.' },
    { figure: {
      svg: ruleFigure(),
      caption: 'A formula rule is written for the first cell of the range and moved to every other cell. With the column locked, every cell of a row tests that row’s column F.',
      alt: 'A grid of worksheet columns A to F and rows 1 to 7, with Lantern’s first six orders in rows 2 to 7 and the subscription flag in column F. The rule applies to A2:F7 and is typed for A2 as: dollar F 2 equals “yes”. Rows 3 and 7 hold the two subscription orders, LC-10002 and LC-10006, and both rows are shaded across all six columns. Cell D4 is outlined. A note says that in D4 Excel evaluates the rule with dollar F 4: the column stays F because of the dollar sign and the row moves to 4. Without the dollar sign D4 would test I4, an empty cell.',
    } },
    { p: 'Useful patterns, each written for row 2 of a range that starts in column A: <x>=$D2>=100</x> (orders of $100 or more); <x>=AND($E2="app",$D2>=30)</x> (app orders of at least $30); <x>=COUNTIF($B$2:$B$232,$B2)>1</x> (customers with more than one order: the whole range locked, the row free); <x>=$D2>=LARGE($D$2:$D$232,10)</x> (the ten largest orders, with ties; LARGE(range, k) returns the kth largest value). One trap: when you click cells while typing a rule, Excel inserts absolute references such as <code>$D$2</code>, which would make every row test row 2. Delete the <code>$</code> before the row number.' },
    { p: 'Test a rule before trusting it. Type the same formula in a spare cell of row 2, fill it across and down, and check that it says TRUE exactly where you expect: conditional formatting will move it in the same way. If the formula returns an error in some cells, those cells are not formatted, so a rule can fail silently.' },

    { h: 'Rule order and Stop If True' },
    { p: 'Home &gt; Conditional Formatting &gt; Manage Rules lists the rules for a range in order of precedence, top to bottom; a new rule goes to the top, and Move Up and Move Down change the order. When two true rules set different things (one bold, one a red fill), both apply. When they conflict (two fills), the rule higher in the list wins. A true rule also overrides any manual formatting of the cell.' },
    { p: 'Stop If True, a tick box beside each rule, stops Excel evaluating the rules below it once that rule is true. Microsoft describes it as a backward-compatibility setting, and it isn’t available for data bars, colour scales or icon sets. Because conflicting formats are already settled by precedence, Stop If True matters when a lower rule sets something that doesn’t conflict, such as bold, a data bar or an icon set, which a formula rule with Stop If True hides for the rows it matches.' },
    { callout: 'warn', title: 'Pitfalls', html: 'Copying, pasting and filling cells that carry a rule create new rules for the destination, so a busy sheet can collect dozens of near-duplicates: check Manage Rules (show rules for “This Worksheet”) now and then. Keep to a few rules with clear meanings, give every colour a meaning stated in a note or a status column, and remember that a rule that returns an error formats nothing.' },
  ],

  formulas: [
    { id: 'cc-share', name: 'Share of a whole (100% stacked bar or pie)',
      tex: String.raw`s_i = \dfrac{x_i}{\sum_{j} x_j} \times 100`,
      where: [
        [String.raw`x_i`, 'The value of part i, such as one channel’s order value', 'units of x'],
        [String.raw`\sum_{j} x_j`, 'The total of all the parts', 'units of x'],
        [String.raw`s_i`, 'Part i’s share of the whole', '%'],
      ],
      assumptions: 'The parts add up to the whole and none is negative.',
      note: 'In Excel, fill <x>=B2/SUM($B$2:$B$6)</x> down and format it as a percentage: the total is locked, the part moves.' },
    { id: 'cc-truncation', name: 'Apparent ratio of two bars on a truncated axis',
      tex: String.raw`\text{apparent ratio} = \dfrac{v_1 - b}{v_2 - b} \quad \text{against the true ratio} \quad \dfrac{v_1}{v_2}`,
      where: [
        [String.raw`v_1, v_2`, 'The two values the bars show', 'units of v'],
        [String.raw`b`, 'The value at which the axis starts (its minimum)', 'units of v'],
      ],
      assumptions: 'Both values are above the baseline.',
      note: 'With b = 0 the two ratios are equal, which is why bar charts start at zero.' },
    { id: 'cc-contrast', name: 'WCAG contrast ratio',
      tex: String.raw`\text{contrast ratio} = \dfrac{L_1 + 0.05}{L_2 + 0.05}`,
      where: [
        [String.raw`L_1`, 'Relative luminance of the lighter colour (0 for black to 1 for white)', ''],
        [String.raw`L_2`, 'Relative luminance of the darker colour', ''],
      ],
      assumptions: 'Relative luminance as WCAG defines it: 0.2126 R + 0.7152 G + 0.0722 B, after converting each sRGB channel to linear light.',
      note: 'Ranges from 1:1 (the same colour) to 21:1 (black on white). Chart bars and lines need at least 3:1 against their background; text needs 4.5:1.' },
  ],

  examples: [
    { level: 'simple', title: 'A bar chart whose title tells the truth', fictional: true,
      setup: 'Ana’s PivotTable gives spring order value by region (the table). Which chart should show “which region brought in the most?”, how should it be arranged, and what should its title say?',
      table: {
        caption: 'Spring order value by region, March–June 2026',
        head: ['', 'A: Region', 'B: Orders', 'C: Order value'],
        align: ['r', 'l', 'r', 'r'],
        rows: [['2', 'Central', '25', '$2,125.90'], ['3', 'East', '52', '$1,923.70'], ['4', 'West', '53', '$1,854.30'], ['5', 'North', '58', '$1,672.05'], ['6', 'South', '43', '$1,520.20']],
        foot: [['7', 'Total', '231', '$9,096.15']],
      },
      steps: [
        'Name the question: a comparison of five categories on one measure. A bar or column chart answers it; sorted bars read as a ranking, so sort the table from largest to smallest before charting (it already is).',
        'Select A1:A6, hold Ctrl (Command on a Mac) and select C1:C6, then choose Insert &gt; Recommended Charts and pick a clustered bar chart. Excel draws a bar chart’s first row nearest the axis, so the sorted table puts Central at the bottom: in Format Axis for the vertical (category) axis, tick Categories in reverse order to put the largest bar at the top. Check that the value axis starts at $0, as a bar chart must.',
        'Check what drives the ranking before writing the title. Central has the fewest orders (25) but the most value because LC-10144, the $1,512 office order, is one of them. Without it Central’s value is <m>2{,}125.90 - 1{,}512.00 = 613.90</m> dollars, the smallest of the five.',
        'Write a title that states the finding: “Central led spring order value only because of one $1,512 office order”. Add data labels so readers don’t have to read values off the axis, and delete the legend (there is one series).',
      ],
      answer: 'A sorted bar chart from zero, titled “Central led spring order value only because of one $1,512 office order”, with data labels and no legend. Without that order Central’s spring value is $613.90, the lowest of the five regions.',
      interpretation: 'The chart is not wrong without the note, but it invites the wrong conclusion: that Central is Lantern’s strongest market. The title turns a picture into an accurate statement. The Explore section shows both series side by side.' },
    { level: 'challenging', title: 'Repairing a draft with a cut axis and two scales', fictional: true,
      setup: 'Ana’s first draft (fictional) shows orders per month as columns with the value axis minimum set to 45, and her accountant suggests adding order value as a line on a secondary axis. Spring orders were 59, 63, 49 and 60 (March to June), and order value $1,975.85, $2,175.55, $2,929.75 and $2,015.00. (a) How exaggerated is the April–May comparison in the draft? (b) What is wrong with the combo chart, and what would show the same information more plainly?',
      steps: [
        String.raw`True ratio of April to May orders: <m>63 \div 49 \approx 1.29</m>, so April had 29% more orders.`,
        String.raw`Apparent ratio with the axis starting at 45: the bars are <m>63 - 45 = 18</m> and <m>49 - 45 = 4</m> units long, a ratio of <m>18 \div 4 = 4.5</m>. The draft makes April look four and a half times May. Set the minimum back to 0.`,
        'The combo chart puts two measures with unrelated scales on one picture. Whether the order-value line rises above the order columns, and how steep it looks, depends only on the limits chosen for each axis, as the figure in the In depth section shows; a reader will still compare them as if they shared one. May’s order value also jumps because of one order: $1,512 of its $2,929.75 is LC-10144.',
        String.raw`A plainer alternative is a ratio of the two measures, order value per order: March <m>1{,}975.85 \div 59 \approx 33.49</m>, April <m>2{,}175.55 \div 63 \approx 34.53</m>, May <m>2{,}929.75 \div 49 \approx 59.79</m>, June <m>2{,}015.00 \div 60 \approx 33.58</m> dollars. Without LC-10144, May’s is <m>1{,}417.75 \div 48 \approx 29.54</m> dollars.`,
        'Chart average order value by month as one series from zero, with a note on May, or keep orders and order value as two separate column charts with the same months, one above the other.',
      ],
      answer: '(a) The draft shows a 4.5-to-1 difference where the true ratio is about 1.29 to 1. (b) The secondary axis makes the line’s position arbitrary; average order value per month ($33.49, $34.53, $59.79, $33.58; May $29.54 without the office order) or two aligned charts answer the accountant’s question without a second scale.',
      interpretation: 'Both repairs come from asking what the reader should compare. Monthly orders were steady, between 49 and 63; the value per order was steady too, apart from one exceptional order in May. A chart that hides either fact is less useful than the table it came from.' },
    { level: 'applied', title: 'A reorder sheet that a colour-blind manager can read', fictional: true,
      setup: 'Pedalworks (fictional), a bike repair shop, keeps its workshop parts in a sheet: part (A), on hand (B), reorder point (C) and weekly use (D) in rows 2 to 9. The manager wants the sheet itself to show, every Monday, what must be ordered: anything out of stock urgently, anything at or below its reorder point this week. One of the mechanics is colour-blind.',
      table: {
        caption: 'Pedalworks’ parts sheet (fictional)',
        head: ['', 'A: Part', 'B: On hand', 'C: Reorder point', 'D: Weekly use', 'E: Status'],
        align: ['r', 'l', 'r', 'r', 'r', 'l'],
        rows: PARTS.map((p, i) => [String(i + 2), p[0], String(p[1]), String(p[2]), String(p[3]), p[1] === 0 ? 'Out' : p[1] <= p[2] ? 'Reorder' : 'OK']),
      },
      steps: [
        'Select A2:E9, the whole block, starting from A2, so each rule is written for row 2.',
        'Rule 1 (urgent): New Rule &gt; Use a formula, <x>=$B2=0</x>, red fill. The <code>$</code> on B keeps every cell of the row looking at its own on-hand count.',
        'Rule 2 (this week): <x>=$B2<=$C2</x>, yellow fill. An out-of-stock part also satisfies this rule, so the two fills conflict. Excel puts each new rule at the top, so in Manage Rules move rule 1 above rule 2: the higher rule wins the conflicting fill, so an out-of-stock row is red, never yellow. Stop If True isn’t needed for that; it would matter only if rule 2 also set something that doesn’t conflict, such as bold.',
        `Rule 3 (stock at a glance): an icon set of three arrows on B2:B9. The bands are equal in size, so with on-hand counts from ${iconLo} to ${iconHi} an arrow points up at about ${(iconLo + 0.67 * (iconHi - iconLo)).toFixed(1)} or more and sideways at about ${(iconLo + 0.33 * (iconHi - iconLo)).toFixed(1)} or more. A down arrow on an out-of-stock row adds nothing to the red, and that is where Stop If True helps: ticked on rule 1, it stops every rule below, the icon set included, for the rows rule 1 matches, so those rows show red with no arrow.`,
        'Don’t rely on colour: fill E2 with <x>=IF(B2=0,"Out",IF(B2<=C2,"Reorder","OK"))</x> and copy it down. The status word says what the colour says, for the colour-blind mechanic, for a printout in black and white and for a filter.',
        `Read the result. Out: ${out.map((p) => p[0]).join(' and ')} (${out.length} rows, red). Reorder: ${low.map((p) => p[0]).join(', ')} (${low.length} rows, yellow). Chain, tyres and bar tape are above their reorder points.`,
      ],
      answer: `Two formula rules on A2:E9, <x>=$B2=0</x> above <x>=$B2<=$C2</x>, an icon set on B2:B9 that Stop If True on the first rule hides for out-of-stock rows, and a status column. This Monday’s order list has ${out.length + low.length} parts: ${out.length} urgent and ${low.length} at or below their reorder points.`,
      interpretation: 'The rules turn a list into a decision, and they keep working when next week’s counts are typed in. The status column is not decoration: it makes the meaning independent of colour, and it lets the manager filter the sheet to the rows that need an order.' },
  ],

  demo: [
    { widget: 'cc-region', intro: 'Spring order value by region, sorted, with and without the $1,512 office order, drawn here as columns (in Excel the simple example’s bar chart, largest at the top, reads more easily as a ranking). Which bar changes, and how would you title each version?' },
    { widget: 'cc-weekly', intro: 'Orders per week over 17 spring weeks. The line chart’s value axis is zoomed to the data, which is fine for a line: read the slope and the dips, not the height above zero.' },
    { widget: 'cc-cf', intro: 'Lantern’s first 15 orders with one rule already applied: whole rows of subscription orders, <x>=$F2="yes"</x> on A2:F16. Open Conditional formatting and add your own: data bars on D2:D16, the top 3 orders, or a formula rule such as <x>=AND($E2="app",$D2>=30)</x>. Then try the same rule without the <code>$</code> signs and see which cells it misses.' },
    { widget: 'cc-invoices', intro: 'A histogram of all 76 catering invoices in 2026, with bins that include their upper edge, as Excel counts. Where does the median event ($790) fall, and what is the lone bar far to the right? The next lesson explains why that event is set aside.' },
    { widget: 'cc-parts', intro: 'Pedalworks’ parts sheet from the applied example, with its three rules. Untick Stop If True on the first rule and watch arrows appear on the out-of-stock rows; move the rules up and down and see which fill wins.' },
  ],

  mistakes: [
    { title: '“Excel picked the chart, so it must suit the data.”', html: 'Recommended Charts suggests charts for the shape of the selection, and Alt+F1 inserts the default chart type, whatever your question. Decide the question first (comparison, trend, composition, distribution, relationship), then the chart.' },
    { title: '“The title is ‘Order value by region’.”', html: 'That is a label, not a message. State the finding, such as “Central led only because of one $1,512 office order”, so the reader knows what to look for and you are forced to check it is true.' },
    { title: '“Starting the axis at 45 makes the differences easier to see.”', html: 'In a bar chart it makes them wrong: 63 against 49 looked like 4.5 to 1. Start bars at zero; zoom only line charts, and label the axis.' },
    { title: '“Red for bad, green for good is clear enough.”', html: 'Many readers can’t tell some pairs of colours apart, and printouts are often black and white. WCAG 1.4.1 asks that colour is never the only cue: add a status word, an icon or a direct label.' },
    { title: '“My rule highlights only the first column.”', html: 'A whole-row rule written as <x>=F2="yes"</x> moves to <x>=G2="yes"</x>, <x>=H2="yes"</x> … in the other columns. Lock the column with a mixed reference, <x>=$F2="yes"</x>, and write the rule for the top-left cell of the range.' },
    { title: '“I set two rules; the second one is ignored.”', html: 'When two true rules set conflicting formats, the one higher in Manage Rules wins, and Stop If True on a rule stops the ones below it. Check the order, and remember a rule that returns an error formats nothing.' },
  ],

  application: [
    { p: 'Monthly management packs often mix a few charts with a table full of conditional formats. The test to apply is the same in both: can the reader say what to do after ten seconds? A finance team’s variance table, for instance, might shade only the lines more than 10% from budget, with the variance written beside the shading, and put one chart above it whose title says which line drove the month.' },
    { case: 'Ana’s spring review ends up with four visuals and one rule set: a sorted bar chart of order value by region, titled with the office-order caveat; a line of weekly orders, steady at 9 to 16 a week; a single 100% bar of web against app (59.8% to 40.2%); and a histogram of order values, which the next lesson builds. On the order sheet, a formula rule shades subscription rows, data bars show order totals with the maximum set to $200 so the office order doesn’t flatten the others, and a status column repeats every colour in words.' },
    { p: 'The same habits carry into the dashboards lesson at the end of this course: a question for every visual, a title that states the finding, honest scales, and colour that is never alone. Conditional formatting also becomes a quality check. On Lantern’s full order sheet (quantity in G, unit_price in H, discount in I, order_total in J), a rule such as <x>=ABS($J2-($G2*$H2-$I2))>0.005</x> would shade any order whose total doesn’t equal quantity × price − discount, the check that B02’s cleaning relied on.' },
  ],

  summary: [
    'Start from the question: bars for comparisons, lines for change over time, stacked or 100% bars (or a pie with few parts) for composition, histograms and box plots for distributions, scatter charts for relationships.',
    'Give every chart a title that states the finding, label axes with units, label series directly, and remove clutter.',
    'Bars start at zero, because length carries the value; a line chart may zoom. On a truncated axis two bars look (v₁ − b) ÷ (v₂ − b) times different instead of v₁ ÷ v₂.',
    'Use a line chart for categories at equal intervals and a scatter chart when x is numeric; be wary of secondary axes, and consider a ratio or two aligned charts instead.',
    'Colour is never the only cue (WCAG 1.4.1); chart elements need 3:1 contrast and text 4.5:1.',
    'Conditional formatting rules: highlight cells, top/bottom, above/below average, duplicates, data bars, colour scales, icon sets and formula rules that return TRUE or FALSE.',
    'A formula rule is written for the top-left cell of the range and moved like a filled formula; lock the column, <x>=$F2="yes"</x>, to format whole rows.',
    'Rules higher in Manage Rules win conflicts; Stop If True stops the rules below; copying cells multiplies rules, and an error formats nothing.',
  ],

  glossary: [
    { term: 'Data series', def: 'A set of related values plotted together in a chart, such as order value for each month. Each series has its own colour or marker and its own entry in the legend.' },
    { term: 'Category axis', def: 'The axis of a column, bar or line chart that places text labels at equal spacing whatever they say, or dates in time order (a date axis); numbers placed on it are treated as labels.' },
    { term: 'Value axis', def: 'A chart axis with a numeric scale. Column, bar and line charts have one; a scatter chart has two.' },
    { term: 'Scatter chart', def: 'A chart with two value axes that plots each observation as a point at its x and y values, used to show the relationship between two numeric variables. Also called an XY chart.' },
    { term: 'Box and whisker chart', def: 'A chart of a distribution that draws the first and third quartiles as a box with the median inside it, whiskers for the spread beyond the box, a marker for the mean, and separate points for outliers. Also called a box plot.' },
    { term: 'Combo chart', def: 'A chart that combines two or more chart types, such as columns and a line, often with a secondary axis.' },
    { term: 'Secondary axis', def: 'A second value axis, usually on the right of a chart, with its own scale for one or more series.' },
    { term: 'Sparkline', def: 'A tiny chart inside a single worksheet cell that shows the trend of a row or column of numbers.' },
    { term: 'Truncated axis', def: 'A value axis that starts above zero. It distorts bar lengths, and so the comparisons a bar chart makes.' },
    { term: 'Contrast ratio', def: 'A measure of the difference in brightness between two colours, (L₁ + 0.05) ÷ (L₂ + 0.05), where L₁ and L₂ are the relative luminances of the lighter and darker colour; it runs from 1:1 to 21:1.' },
    { term: 'Conditional formatting', def: 'Formatting that a spreadsheet applies to a cell only while a rule about its value, or a formula, is true, and that updates when the values change.' },
    { term: 'Data bar', def: 'A conditional format that draws a bar inside each cell whose length, by default, is proportional to the cell’s value.' },
    { term: 'Colour scale', def: 'A conditional format that shades cells along a gradient of two or three colours between the lowest and highest values.' },
    { term: 'Icon set', def: 'A conditional format that puts one of three to five icons in each cell according to the band of values, set by thresholds, that the cell falls in.' },
  ],

  references: [
    { text: 'Microsoft Support. “Available chart types in Office”, with “Present your data in a scatter chart or a line chart” and “Use sparklines to show data trends”.', url: 'https://support.microsoft.com/en-us/excel/available-chart-types-in-office', checked: '2026-10-23' },
    { text: 'Microsoft Support. “Use conditional formatting to highlight information in Excel”.', url: 'https://support.microsoft.com/en-us/excel/use-conditional-formatting-to-highlight-information-in-excel', checked: '2026-10-23' },
    { text: 'Microsoft Support. “Create a histogram” and “Create a box and whisker chart”.', url: 'https://support.microsoft.com/en-us/excel/create-a-histogram', checked: '2026-10-23' },
    { text: 'Cleveland, W. S. &amp; McGill, R. (1984). Graphical perception: theory, experimentation, and application to the development of graphical methods. <i>Journal of the American Statistical Association</i>, 79(387), 531–554.', url: 'https://doi.org/10.1080/01621459.1984.10478080', checked: '2026-10-23' },
    { text: 'W3C (2023). <i>Understanding WCAG 2.2</i>: success criteria 1.4.1 Use of Color, 1.4.3 Contrast (Minimum) and 1.4.11 Non-text Contrast.', url: 'https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html', checked: '2026-10-23' },
    { text: 'data.europa.eu. <i>Data Visualisation Guide</i>: “Choosing charts”, on the Financial Times’ Visual Vocabulary.', url: 'https://data.europa.eu/apps/data-visualisation-guide/choosing-charts-the-message', checked: '2026-10-23' },
  ],

  checks: [
    // case figures
    { what: 'Orders', value: D.orders, shown: 231 },
    { what: 'Order value', value: TOTAL, shown: 9096.15 },
    { what: 'Office order LC-10144', value: BULK, shown: 1512 },
    { what: 'Central value', value: R.Central, shown: 2125.90 },
    { what: 'East value', value: R.East, shown: 1923.70 },
    { what: 'West value', value: R.West, shown: 1854.30 },
    { what: 'North value', value: R.North, shown: 1672.05 },
    { what: 'South value', value: R.South, shown: 1520.20 },
    { what: 'Central orders', value: D.byRegion.orders.Central, shown: 25 },
    { what: 'East orders', value: D.byRegion.orders.East, shown: 52 },
    { what: 'West orders', value: D.byRegion.orders.West, shown: 53 },
    { what: 'North orders', value: D.byRegion.orders.North, shown: 58 },
    { what: 'South orders', value: D.byRegion.orders.South, shown: 43 },
    { what: 'Regions add to total', value: r2(sum(Object.values(R))), shown: 9096.15 },
    { what: 'Central without the office order', value: R.Central - BULK, shown: 613.90 },
    { what: 'Central without it is the smallest', value: Number(R.Central - BULK < Math.min(R.East, R.West, R.North, R.South)), shown: 1 },
    { what: 'Smallest region share (%)', value: Math.min(...Object.values(R)) / TOTAL * 100, shown: 16.7, tol: 0.05 },
    { what: 'Largest region share (%)', value: Math.max(...Object.values(R)) / TOTAL * 100, shown: 23.4, tol: 0.05 },
    { what: 'Web orders', value: D.byChannel.orders.web, shown: 132 },
    { what: 'App orders', value: D.byChannel.orders.app, shown: 99 },
    { what: 'Web value', value: D.byChannel.value.web, shown: 5439.95 },
    { what: 'App value', value: D.byChannel.value.app, shown: 3656.20 },
    { what: 'Web share (%)', value: D.byChannel.value.web / TOTAL * 100, shown: 59.8, tol: 0.05 },
    { what: 'App share (%)', value: D.byChannel.value.app / TOTAL * 100, shown: 40.2, tol: 0.05 },
    // months and the axis example
    { what: 'March orders', value: M.orders.Mar, shown: 59 },
    { what: 'April orders', value: M.orders.Apr, shown: 63 },
    { what: 'May orders', value: M.orders.May, shown: 49 },
    { what: 'June orders', value: M.orders.Jun, shown: 60 },
    { what: 'March value', value: M.value.Mar, shown: 1975.85 },
    { what: 'April value', value: M.value.Apr, shown: 2175.55 },
    { what: 'May value', value: M.value.May, shown: 2929.75 },
    { what: 'June value', value: M.value.Jun, shown: 2015.00 },
    { what: 'Office order was in May', value: Number(ORDERS.find((r) => r[0] === D.bulk.id)[1].slice(5, 7)), shown: 5 },
    { what: 'April bar on axis from 45', value: M.orders.Apr - 45, shown: 18 },
    { what: 'May bar on axis from 45', value: M.orders.May - 45, shown: 4 },
    { what: 'Apparent ratio', value: (M.orders.Apr - 45) / (M.orders.May - 45), shown: 4.5 },
    { what: 'True ratio April/May', value: M.orders.Apr / M.orders.May, shown: 1.29 },
    { what: 'April more than May (%)', value: (M.orders.Apr / M.orders.May - 1) * 100, shown: 29, tol: 0.5 },
    { what: 'May about four-fifths of April', value: M.orders.May / M.orders.Apr, shown: 0.8, tol: 0.03 },
    { what: 'AOV March', value: M.value.Mar / M.orders.Mar, shown: 33.49 },
    { what: 'AOV April', value: M.value.Apr / M.orders.Apr, shown: 34.53 },
    { what: 'AOV May', value: M.value.May / M.orders.May, shown: 59.79 },
    { what: 'AOV June', value: M.value.Jun / M.orders.Jun, shown: 33.58 },
    { what: 'May value without office order', value: M.value.May - BULK, shown: 1417.75 },
    { what: 'May orders without office order', value: M.orders.May - 1, shown: 48 },
    { what: 'May AOV without office order', value: (M.value.May - BULK) / (M.orders.May - 1), shown: 29.54 },
    { what: 'Monthly orders lowest', value: Math.min(...Object.values(M.orders)), shown: 49 },
    { what: 'Monthly orders highest', value: Math.max(...Object.values(M.orders)), shown: 63 },
    // weekly
    { what: 'Weeks charted', value: WEEKLY.length, shown: 17 },
    { what: 'Fewest orders in a week', value: Math.min(...WEEKLY), shown: 9 },
    { what: 'Most orders in a week', value: Math.max(...WEEKLY), shown: 16 },
    // data bars
    { what: 'Gift Box Trio shop price', value: PRODUCTS.find((p) => p[0] === 'Gift Box Trio')[3], shown: 58 },
    // contrast
    { what: 'Black on white', value: ratio(lum(255), lum(0)), shown: 21 },
    { what: 'Graphical objects threshold', value: 3, shown: 3 },
    { what: 'Text threshold', value: 4.5, shown: 4.5 },
    // applied
    { what: 'Parts in the sheet', value: PARTS.length, shown: 8 },
    { what: 'Out of stock', value: out.length, shown: 2 },
    { what: 'At or below reorder point', value: low.length, shown: 3 },
    { what: 'Parts to order', value: out.length + low.length, shown: 5 },
    { what: 'Lowest on hand', value: iconLo, shown: 0 },
    { what: 'Highest on hand', value: iconHi, shown: 22 },
    { what: 'Up arrow from (67%)', value: iconLo + 0.67 * (iconHi - iconLo), shown: 14.7, tol: 0.05 },
    { what: 'Side arrow from (33%)', value: iconLo + 0.33 * (iconHi - iconLo), shown: 7.3, tol: 0.05 },
    { what: 'Median catering invoice (76 events)', value: D.eventMedian, shown: 790 },
    { what: 'Combo figure: May value inside the $1,800–$3,000 axis', value: Number(M.value.May < 3000 && M.value.Mar > 1800), shown: 1 },
  ],
};

export { WEEKLY, PARTS, lum, ratio };
