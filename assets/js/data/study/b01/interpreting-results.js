// interpreting-results.js — B01 · Interpreting results: charts, comparisons and causes. Content only; exercises are in
// interpreting-results.ex.js. Uses SHOP and DERIVED from case.js: monthly orders and visits, gift-box orders, and the
// dates of the checkout redesign (1 September) and the payment-page fix (5 October). The September diagnosis itself
// (web against app conversion, August against September) is left to the project: the worked diagnosis uses a fictional
// shop, Alderbank Outdoor, with the same structure and different numbers. Every other business and figure is fictional.
import { SHOP as S, DERIVED as D, SURVEY } from './case.js';

const AUG = 1, SEP = 2;
const fallPct = (D.orders[AUG] - D.orders[SEP]) / D.orders[AUG] * 100;         // 20.6
const drawn = (v) => v - 240;                                                   // bar lengths on an axis starting at 240
const visualFall = (drawn(D.orders[AUG]) - drawn(D.orders[SEP])) / drawn(D.orders[AUG]) * 100;
// Northwind Outfitters (fictional): period A and B by channel
const NA = { wv: 6000, wo: 150, av: 4000, ao: 160 }, NB = { wv: 10000, wo: 260, av: 3000, ao: 126 };
const rate = (o, v) => o / v * 100;
const shareA = NA.wv / (NA.wv + NA.av), shareB = NB.wv / (NB.wv + NB.av);
const overA = rate(NA.wo + NA.ao, NA.wv + NA.av), overB = rate(NB.wo + NB.ao, NB.wv + NB.av);
const bAtA = shareA * rate(NB.wo, NB.wv) + (1 - shareA) * rate(NB.ao, NB.av);
// Alderbank Outdoor (fictional): desktop and mobile, April, May, June
const PA = { dv: 20000, do: 600, mv: 30000, mo: 600 }, PM = { dv: 21000, do: 441, mv: 31000, mo: 620 }, PJ = { dv: 20500, do: 595, mv: 30500, mo: 610 };

export default {
  slug: 'interpreting-results',
  title: 'Interpreting results: charts, comparisons and causes',
  blurb: 'Numbers don’t interpret themselves. Learn to read a chart critically, to compare like with like, to tell correlation from causation, to spot Simpson’s paradox and regression to the mean, to diagnose why a KPI moved, and to write a finding that says how sure you are.',
  status: 'reviewed',
  objectives: [
    'Read a chart critically, checking its axes, where its vertical axis starts, its scale and its encoding, and calculate how much a truncated axis exaggerates a change.',
    'Compare like with like, adjusting for period length, base effects and seasonality.',
    'Distinguish correlation from causation, and identify confounding variables and the evidence that would support a causal claim.',
    'Explain Simpson’s paradox and regression to the mean, and recognise them in business data.',
    'Diagnose a change in a KPI by decomposing it into drivers and segments and comparing it with an unaffected group.',
    'Write a finding that states the change, the comparison, the evidence and the remaining uncertainty.',
  ],
  prerequisites: [
    { lesson: 'b01/summarising-data', why: 'Percentage changes, percentage points and weighted averages are the raw material of every interpretation.' },
    { lesson: 'b01/problem-solving-frameworks', why: 'The driver tree and hypothesis-driven work structure a diagnosis.' },
    { lesson: 'b01/data-collection', why: 'Experiments, samples and bias decide how far a result can be trusted.' },
  ],
  case: 'lantern',

  concept: [
    { case: 'September 2026 worried everyone at Lantern. Orders fell from 316 in August to 251, although visits rose from 10,200 to 11,400. Three explanations reach Ana within a day.' },
    { case: 'A colleague says the new website checkout, launched on 1 September, caused the fall. A friend who runs a café says September is always quiet after the summer. And a slide arrives with a bar chart on which September’s bar is barely a seventh the height of August’s.' },
    { p: 'Each is a claim about what the numbers mean. This lesson is about testing such claims before acting on them.' },

    { h: 'Reading a chart' },
    { p: 'A chart is an argument made with shapes, so read it as you would read an argument. Before looking at the shapes, check:' },
    { ol: [
      '<b>Title and source:</b> what is measured, for which period, from which data.',
      '<b>Axes and units:</b> what each axis shows, in what units, and whether time is evenly spaced.',
      '<b>Axis start:</b> where the vertical axis starts. Is it zero, and if not, does the chart say so?',
      '<b>Scale:</b> linear or logarithmic, and whether two different scales share the picture (a dual axis).',
      '<b>Encoding:</b> whether values are shown by length (bars), position (lines and dots) or area (bubbles, icons).',
      '<b>Selection:</b> which periods, groups or comparisons the author chose to show, and which they left out.',
    ] },
    { figure: {
      svg: '<svg viewBox="0 0 640 240" xmlns="http://www.w3.org/2000/svg" font-size="13" fill="currentColor"><text x="130" y="22" text-anchor="middle" font-weight="600">Axis starts at 240</text><line x1="40" y1="40" x2="40" y2="200" stroke="var(--rule-strong)" stroke-width="1.2"/><line x1="40" y1="200" x2="290" y2="200" stroke="var(--rule-strong)" stroke-width="1.2"/><text x="34" y="204" text-anchor="end" font-size="11" fill="var(--ink-3)">240</text><line x1="40" y1="200" x2="290" y2="200" stroke="var(--rule-strong)" stroke-width="0.5" stroke-dasharray="2 3"/><text x="34" y="151" text-anchor="end" font-size="11" fill="var(--ink-3)">270</text><line x1="40" y1="147" x2="290" y2="147" stroke="var(--rule-strong)" stroke-width="0.5" stroke-dasharray="2 3"/><text x="34" y="97" text-anchor="end" font-size="11" fill="var(--ink-3)">300</text><line x1="40" y1="93" x2="290" y2="93" stroke="var(--rule-strong)" stroke-width="0.5" stroke-dasharray="2 3"/><text x="34" y="44" text-anchor="end" font-size="11" fill="var(--ink-3)">330</text><line x1="40" y1="40" x2="290" y2="40" stroke="var(--rule-strong)" stroke-width="0.5" stroke-dasharray="2 3"/><rect x="56" y="104" width="40" height="96" fill="var(--series-1)"/><text x="76" y="218" text-anchor="middle" font-size="12">Jul</text><text x="76" y="99" text-anchor="middle" font-size="11">294</text><rect x="114" y="65" width="40" height="135" fill="var(--series-1)"/><text x="134" y="218" text-anchor="middle" font-size="12">Aug</text><text x="134" y="60" text-anchor="middle" font-size="11">316</text><rect x="172" y="180" width="40" height="20" fill="var(--series-2)"/><text x="192" y="218" text-anchor="middle" font-size="12">Sep</text><text x="192" y="175" text-anchor="middle" font-size="11">251</text><rect x="230" y="60" width="40" height="140" fill="var(--series-1)"/><text x="250" y="218" text-anchor="middle" font-size="12">Oct</text><text x="250" y="55" text-anchor="middle" font-size="11">319</text><text x="460" y="22" text-anchor="middle" font-weight="600">Axis starts at 0</text><line x1="370" y1="40" x2="370" y2="200" stroke="var(--rule-strong)" stroke-width="1.2"/><line x1="370" y1="200" x2="620" y2="200" stroke="var(--rule-strong)" stroke-width="1.2"/><text x="364" y="204" text-anchor="end" font-size="11" fill="var(--ink-3)">0</text><line x1="370" y1="200" x2="620" y2="200" stroke="var(--rule-strong)" stroke-width="0.5" stroke-dasharray="2 3"/><text x="364" y="158" text-anchor="end" font-size="11" fill="var(--ink-3)">100</text><line x1="370" y1="154" x2="620" y2="154" stroke="var(--rule-strong)" stroke-width="0.5" stroke-dasharray="2 3"/><text x="364" y="113" text-anchor="end" font-size="11" fill="var(--ink-3)">200</text><line x1="370" y1="109" x2="620" y2="109" stroke="var(--rule-strong)" stroke-width="0.5" stroke-dasharray="2 3"/><text x="364" y="67" text-anchor="end" font-size="11" fill="var(--ink-3)">300</text><line x1="370" y1="63" x2="620" y2="63" stroke="var(--rule-strong)" stroke-width="0.5" stroke-dasharray="2 3"/><rect x="386" y="66" width="40" height="134" fill="var(--series-1)"/><text x="406" y="218" text-anchor="middle" font-size="12">Jul</text><text x="406" y="61" text-anchor="middle" font-size="11">294</text><rect x="444" y="56" width="40" height="144" fill="var(--series-1)"/><text x="464" y="218" text-anchor="middle" font-size="12">Aug</text><text x="464" y="51" text-anchor="middle" font-size="11">316</text><rect x="502" y="85" width="40" height="115" fill="var(--series-2)"/><text x="522" y="218" text-anchor="middle" font-size="12">Sep</text><text x="522" y="80" text-anchor="middle" font-size="11">251</text><rect x="560" y="54" width="40" height="146" fill="var(--series-1)"/><text x="580" y="218" text-anchor="middle" font-size="12">Oct</text><text x="580" y="49" text-anchor="middle" font-size="11">319</text><text x="320" y="236" text-anchor="middle" font-size="11" fill="var(--ink-3)">Lantern’s monthly orders, July–October 2026 (fictional)</text></svg>',
      caption: 'The same four months of Lantern’s orders drawn twice. On the left the axis starts at 240, so September’s bar looks a seventh the height of August’s; on the right it starts at zero and shows September at about four-fifths of August.',
      alt: 'Two bar charts side by side of Lantern’s monthly orders for July, August, September and October 2026: 294, 316, 251 and 319. The left chart’s vertical axis runs from 240 to 330, so the September bar is a short stub and the other bars are many times taller. The right chart’s axis runs from 0 to 350, so all four bars are of similar height and September is visibly but modestly lower.',
    } },
    { p: String.raw`Bars encode values by their length, so a bar chart must start at zero: otherwise the lengths no longer compare the values. On the left chart August’s bar is drawn <m>316 - 240 = 76</m> units long and September’s <m>251 - 240 = 11</m>, so September looks <m>(76 - 11) \div 76 \approx 85.5\%</m> lower. The real fall was <m>(316 - 251) \div 316 \approx 20.6\%</m>. The chart exaggerates the change about four times.` },
    { p: 'Line charts are different. They encode values by position and change by slope, so a vertical axis that doesn’t start at zero can be honest, and is often necessary: a conversion rate moving between 2% and 4% is invisible on an axis running to 100%. The test is whether the axis is labelled clearly and whether the slope fairly reflects the size of the change. Dual axes deserve suspicion, because the author chooses both scales and so decides where the lines cross. Areas are hardest of all: an icon twice as tall and twice as wide covers four times the area.' },

    { h: 'Compare like with like' },
    { p: String.raw`Any statement of change compares a result with a <g>baseline</g>, and the comparison must be fair. The definitions must match, as the KPIs lesson stressed. So must the periods: August has 31 days and September 30. Per day, orders fell from <m>316 \div 31 \approx 10.2</m> to <m>251 \div 30 \approx 8.4</m>, a fall of about 17.9%. The shorter month explains only about 8 of the 65 missing orders; the fall is real.` },
    { p: 'Seasons matter too. Many businesses have a regular yearly pattern, or <g>seasonality</g>: Lantern sells gift boxes in November and December, cafés sell more cold drinks in summer. Comparing a month with the month before mixes the change you care about with the seasonal pattern. The usual remedy is to compare a month with the same month a year earlier. Lantern began trading on 1 March 2026, so it has no earlier September: the café owner’s claim can’t be checked with Lantern’s own data, and needs other evidence, such as industry figures or the experience of similar shops.' },
    { p: 'Lantern’s gift-box orders show the other trap, the <g>base effect</g> from the summarising-data lesson: they rose from 9 in October to 88 in November, an increase of almost 880%, because the starting point was tiny and the season had arrived. The Explore section charts them month by month.' },

    { h: 'Correlation is not causation' },
    { p: 'Two quantities are <g>correlated</g> when they tend to move together: when one is high, the other tends to be high (or low). <g>Causation</g> means that changing one would change the other. Correlation is evidence worth following up, but it is not proof of causation, for three reasons.' },
    { list: [
      '<b>A third factor drives both.</b> A <g>confounding variable</g> affects both quantities and makes them move together. From October to December Lantern’s visits and its average rating both rose. Christmas is a likely confounder: it brings more visitors and more gift-box buyers, whose orders may be rated more warmly.',
      '<b>The causation runs the other way.</b> Shops that advertise more may sell more, or shops that sell more may have more to spend on advertising.',
      '<b>Chance.</b> With only six monthly values, two unrelated series can easily appear related, especially if both happen to trend upwards. Short series and many comparisons produce coincidences.',
    ] },
    { p: 'The checkout claim is a before-and-after comparison: something changed on 1 September, and orders fell in September. Timing is evidence, but weak on its own, because other things also changed in September. Stronger evidence comes from three places.' },
    { p: 'The first is a <g>comparison group</g> that did not get the change: Lantern’s app buyers never saw the new website checkout, so if app buyers carried on as before while website buyers stopped converting, the checkout is implicated. The second is a reversal: a fix for a payment-page bug on mobile browsers was released on 5 October, so if website conversion recovered after that date, the case strengthens. The third is a mechanism, such as error logs showing failed payments. The project asks you to look at the numbers; this lesson gives you the method.' },
  ],

  theory: [
    { h: 'What would establish a cause?' },
    { p: 'The strongest evidence for causation comes from a randomised experiment, such as the <g>A/B test</g> described in the data-collection lesson: if visitors are assigned at random to the old checkout (the <g>control group</g>) or the new one, the two groups differ, on average, only in the checkout, so a difference in their conversion can be put down to it, give or take chance. When an experiment wasn’t run, analysts build a case from several kinds of evidence, none conclusive alone:' },
    { list: [
      '<b>Timing:</b> the effect follows the supposed cause, and not before.',
      '<b>A comparison group:</b> a similar group that did not get the change, and that shows what would probably have happened without it.',
      '<b>Reversal:</b> undoing the change undoes the effect.',
      '<b>Dose and response:</b> more of the cause gives more of the effect (more affected visitors, bigger fall).',
      '<b>Mechanism:</b> a plausible route from cause to effect, ideally observed directly.',
      '<b>Alternatives ruled out:</b> other explanations checked and found wanting.',
    ] },
    { p: String.raw`The comparison-group idea has a name and a simple formula. The <g>difference-in-differences</g> estimate of an effect is the change in the affected group minus the change in the unaffected group over the same period: <m>(T_{\text{after}} - T_{\text{before}}) - (C_{\text{after}} - C_{\text{before}})</m>. Subtracting the comparison group’s change removes whatever affected both groups, such as the season. It assumes that, without the change, the two groups would have moved in parallel; that assumption can be checked, roughly, by looking at how they moved in earlier months.` },

    { h: 'Simpson’s paradox' },
    { p: 'Overall figures mix groups, and the mix itself can move the total. <g>Simpson’s paradox</g> is the name for a relationship that holds within every group but disappears or reverses when the groups are combined. The classic case, analysed by Bickel, Hammel and O’Connell in 1975, concerns graduate admissions at the University of California, Berkeley: men were admitted at a higher rate than women overall, yet when the 85 departments were examined one by one, only a few showed a significant difference, and about as many favoured women as favoured men. Women had applied more often to the departments that admitted a smaller share of all applicants.' },
    { p: 'In business the commonest version involves channels. The challenging example below follows a fictional shop whose website and app conversion rates both rose while its overall conversion fell, because a campaign shifted visits towards the website, the channel with the lower rate. The overall rate is a weighted average of the channel rates, weighted by each channel’s share of visits, so it can change because the rates changed, because the shares changed, or both. Separating the two is called a mix analysis: recompute the new period’s overall rate using the old period’s shares, and compare.' },
    { p: 'Lantern’s app converts better than its website, so Lantern’s overall conversion depends on its mix of web and app visits as well as on each channel’s rate. Before blaming or crediting anything for a change in the overall rate, check each channel’s rate and each channel’s share. The project asks whether September’s mix changed enough to matter.' },

    { h: 'Regression to the mean' },
    { p: 'Measurements that are unusually high or low partly because of chance tend to be followed by measurements closer to the average. This is <g>regression to the mean</g>. Barnett, van der Pols and Dobson describe it as a pattern in which unusually large or small measurements tend to be followed by ones nearer the mean, and warn that it is most likely to mislead when units are chosen because they were extreme.' },
    { p: 'Suppose a fictional chain of twenty cafés sends the managers of its four lowest-rated cafés in March on a training course, and in April those four improve from an average of 3.6 stars to 3.9. The course may have worked. But the four highest-rated cafés, which had no training, fell from 4.7 to 4.5, and the chain as a whole stayed at 4.2. Part of every extreme month is luck, and luck doesn’t repeat reliably, so the worst tend to improve and the best tend to slip with no intervention at all. Only a comparison, for example training two of the four low-rated cafés and not the other two, can separate the course’s effect from regression to the mean.' },
    { p: 'Lantern’s September was its worst month for orders, and October was better. Some of that recovery may be regression to the mean, some may be the 5 October fix. A comparison group, the app, helps to tell them apart.' },

    { h: 'Small samples and noise' },
    { p: 'Every rate built on few cases is noisy, because <g>sampling error</g> shrinks only as the number of cases grows. A product page with 3 orders from 40 visits converts at 7.5%; another with 2 from 40 converts at 5.0%. The 2.5-point gap is one order and means almost nothing.' },
    { p: 'Survey researchers make the same point formally: Pew Research Center notes that estimates for subgroups have larger margins of error because they rest on fewer cases, and that a lead of one figure over another is less certain than either figure alone. Lantern’s October survey drew 79 responses; any conclusion about a subgroup, such as app buyers, rests on fewer still. B04 shows how to put a number on this uncertainty with confidence intervals; for now, report the counts and be cautious with small ones.' },

    { h: 'Diagnosing a change in a KPI' },
    { p: 'When a KPI moves unexpectedly, the work is <g>diagnostic analytics</g>: explaining why something happened. Work through the questions in order; each one can end the investigation.' },
    { ol: [
      '<b>Is it real?</b> Check the data before the business: a tracking change, a definition change, missing days or duplicate records can all produce a “fall”. The data-quality lesson lists what to check.',
      '<b>Is it unusual?</b> Compare it with normal month-to-month variation and, where possible, with the same period last year.',
      '<b>Which driver moved?</b> Use the driver tree: revenue = visits × conversion × AOV. A fall in orders with rising visits points at conversion.',
      '<b>Where is it?</b> Segment: by channel, device, product, new against returning customers. A change concentrated in one segment points at a cause that affects only that segment.',
      '<b>When did it start?</b> Daily data around the suspected date. A step on the day of a launch is far more telling than a gradual drift.',
      '<b>Why?</b> Form hypotheses and test them with comparison groups, reversals and mechanisms, as above.',
      '<b>How sure are you?</b> Weigh the evidence, name the alternatives you couldn’t rule out, and say what would settle the question.',
    ] },

    { h: 'Writing a finding with its uncertainty' },
    { p: 'A finding is a short statement that someone else will act on. It should say what changed and compared with what, where, the likely cause with its evidence, what is still uncertain, and what to do or measure next. Match the strength of the words to the strength of the evidence:' },
    { table: {
      caption: 'Matching the words to the evidence',
      head: ['Evidence', 'Wording'],
      rows: [
        ['A randomised experiment with an adequate sample', '“The new checkout reduced conversion by …”'],
        ['A clear comparison group, a reversal and a mechanism', '“The evidence strongly suggests the checkout caused …”'],
        ['Timing and one segment only', '“The fall is consistent with a checkout problem, but …”'],
        ['A correlation in a few data points', '“We can’t tell yet whether …; to find out, we would …”'],
      ],
    } },
    { p: 'Two habits help. Give numbers with their denominators and comparisons (“orders fell 20.6%, from 316 to 251, while visits rose 11.8%”), and state the alternatives you checked and those you couldn’t. A reader who knows how sure you are can decide how much to bet on your conclusion.' },
  ],

  formulas: [
    { id: 'int-per-day', name: 'Rate per day',
      tex: String.raw`\text{Per day} = \dfrac{X}{d}`,
      where: [
        [String.raw`X`, 'A count for the period, such as orders in a month', 'units of X'],
        [String.raw`d`, 'Days in the period', 'days'],
      ],
      note: 'Removes differences in period length before comparing months of 28, 30 and 31 days.' },
    { id: 'int-mix', name: 'Overall rate as a mix of group rates',
      tex: String.raw`r = \sum_{i} s_i\, r_i, \qquad s_i = \dfrac{V_i}{\sum_j V_j}`,
      where: [
        [String.raw`r`, 'Overall rate, such as overall conversion', '%'],
        [String.raw`r_i`, 'Rate in group i, such as a channel’s conversion', '%'],
        [String.raw`s_i`, 'Group i’s share of the denominator; the shares add to 1', ''],
        [String.raw`V_i`, 'Group i’s denominator, such as its visits', 'visits'],
      ],
      note: 'The overall rate moves if the group rates change, if the shares change, or both.' },
    { id: 'int-mix-adjusted', name: 'Mix-adjusted rate',
      tex: String.raw`r_B^{\,\text{at A’s mix}} = \sum_i s_{A,i}\, r_{B,i}`,
      where: [
        [String.raw`r_{B,i}`, 'Rate in group i in period B', '%'],
        [String.raw`s_{A,i}`, 'Group i’s share of the denominator in period A', ''],
      ],
      note: 'Compared with period A’s overall rate, it shows the change due to the group rates alone; the rest of the change is due to the mix.' },
    { id: 'int-did', name: 'Difference in differences',
      tex: String.raw`\text{Effect} \approx (T_{\text{after}} - T_{\text{before}}) - (C_{\text{after}} - C_{\text{before}})`,
      where: [
        [String.raw`T_{\text{before}},\ T_{\text{after}}`, 'The measure in the group that got the change, before and after it', 'units of the measure'],
        [String.raw`C_{\text{before}},\ C_{\text{after}}`, 'The same measure in a comparison group that did not', 'units of the measure'],
      ],
      assumptions: 'Without the change, the two groups would have moved in parallel.',
      note: 'For rates, every term and the effect are in percentage points.' },
  ],

  examples: [
    { level: 'simple', title: 'How much did September’s orders really fall?', fictional: true,
      setup: 'The slide Ana received shows Lantern’s orders for July to October (294, 316, 251 and 319) as bars on an axis that starts at 240. How large does the fall from August to September look, how large was it, and how large was it per day?',
      steps: [
        String.raw`Read where the axis starts: 240. Bars are drawn from there, so August’s bar is <m>316 - 240 = 76</m> long and September’s <m>251 - 240 = 11</m>.`,
        String.raw`Apparent fall: <m>(76 - 11) \div 76 \approx 85.5\%</m>. September’s bar is about a seventh of August’s.`,
        String.raw`Actual fall: <m>(316 - 251) \div 316 \approx 20.6\%</m>. The chart exaggerates the change by a factor of about <m>85.5 \div 20.6 \approx 4.2</m>.`,
        String.raw`Like with like: per day, <m>316 \div 31 \approx 10.19</m> orders in August and <m>251 \div 30 \approx 8.37</m> in September, a fall of about 17.9%.`,
      ],
      answer: 'The chart makes the fall look like 85.5%; it was 20.6% (17.9% per day). Redraw the bars from zero, or use a line chart with a clearly labelled axis.',
      interpretation: 'A fall of a fifth is serious and worth diagnosing; a fall of six-sevenths would be a crisis. The truncated axis turned the first into the second. Check where the axis starts before reacting to the shape.' },
    { level: 'challenging', title: 'Both channels improved, yet conversion fell', fictional: true,
      setup: 'Northwind Outfitters, a fictional online outdoor-gear shop, ran a social-media campaign that sent visitors to its website. Before the campaign (period A) the website had 6,000 visits and 150 orders and the app 4,000 visits and 160 orders. During it (period B) the website had 10,000 visits and 260 orders and the app 3,000 visits and 126 orders. The marketing director says the campaign hurt conversion. Did it?',
      table: {
        caption: 'Northwind Outfitters by channel (fictional)',
        head: ['Channel', 'Visits A', 'Orders A', 'Visits B', 'Orders B'],
        align: ['l', 'r', 'r', 'r', 'r'],
        rows: [
          ['Website', '6,000', '150', '10,000', '260'],
          ['App', '4,000', '160', '3,000', '126'],
        ],
        foot: [['Total', '10,000', '310', '13,000', '386']],
      },
      steps: [
        String.raw`Channel rates: the website rose from <m>150 \div 6{,}000 = 2.50\%</m> to <m>260 \div 10{,}000 = 2.60\%</m>; the app from <m>160 \div 4{,}000 = 4.00\%</m> to <m>126 \div 3{,}000 = 4.20\%</m>. Both improved.`,
        String.raw`Overall: <m>310 \div 10{,}000 = 3.10\%</m> in A and <m>386 \div 13{,}000 \approx 2.97\%</m> in B, a fall of about 0.13 percentage points. This is Simpson’s paradox.`,
        String.raw`The mix: the website’s share of visits rose from <m>6{,}000 \div 10{,}000 = 60\%</m> to <m>10{,}000 \div 13{,}000 \approx 77\%</m>, and the website is the lower-converting channel.`,
        String.raw`Mix-adjusted rate: period B’s channel rates at period A’s mix give <m>0.60 \times 2.60\% + 0.40 \times 4.20\% = 3.24\%</m>. The rates alone would have raised overall conversion by <m>3.24 - 3.10 = 0.14</m> points; the shift in mix lowered it by <m>2.97 - 3.24 \approx -0.27</m> points. Together: about −0.13.`,
        String.raw`Counts: orders rose from 310 to 386, by 76. Whether the campaign was worth its cost depends on that cost, but it did not make either channel convert worse.`,
      ],
      answer: 'No. Both channels converted better during the campaign (website 2.50% → 2.60%, app 4.00% → 4.20%). Overall conversion fell from 3.10% to 2.97% only because the campaign shifted the mix towards the lower-converting website: a rate effect of +0.14 points and a mix effect of −0.27 points. Orders rose by 76.',
      interpretation: 'An overall rate can fall while every part of the business improves. Before acting on a change in a total, split it by the groups that make it up and separate the change in rates from the change in mix.' },
    { level: 'applied', title: 'Diagnosing a dip at Alderbank Outdoor', fictional: true,
      setup: 'Alderbank Outdoor, a fictional online shop, redesigned its product pages for desktop computers on 1 May; mobile pages were unchanged. Orders fell in May. On 3 June the desktop redesign was rolled back. Its AOV was $80 in every month. Diagnose the dip and write the finding.',
      table: {
        caption: 'Alderbank Outdoor by device (fictional)',
        head: ['Month', 'Desktop visits', 'Desktop orders', 'Mobile visits', 'Mobile orders'],
        align: ['l', 'r', 'r', 'r', 'r'],
        rows: [
          ['April', '20,000', '600', '30,000', '600'],
          ['May', '21,000', '441', '31,000', '620'],
          ['June', '20,500', '595', '30,500', '610'],
        ],
      },
      steps: [
        'Is it real? The analytics team confirms that tracking and the definition of an order did not change on 1 May, and no days are missing.',
        String.raw`Which driver moved? Visits rose from 50,000 to 52,000 (+4.0%) while orders fell from 1,200 to 1,061 (−11.6%), and AOV was flat. So conversion fell: <m>1{,}200 \div 50{,}000 = 2.40\%</m> to <m>1{,}061 \div 52{,}000 \approx 2.04\%</m>.`,
        String.raw`Where? Desktop conversion fell from <m>600 \div 20{,}000 = 3.00\%</m> to <m>441 \div 21{,}000 = 2.10\%</m>; mobile stayed at <m>600 \div 30{,}000 = 2.00\%</m> and <m>620 \div 31{,}000 = 2.00\%</m>. The fall is entirely on desktop, the only device that got the redesign.`,
        String.raw`Comparison group: difference in differences <m>= (2.10 - 3.00) - (2.00 - 2.00) = -0.90</m> percentage points on desktop. Anything that affected both devices, such as the season, cancels out.`,
        String.raw`Reversal: after the rollback, desktop conversion in June was <m>595 \div 20{,}500 \approx 2.90\%</m>, close to April’s 3.00%.`,
        String.raw`Size: at April’s 3.00%, May’s 21,000 desktop visits would have produced 630 orders, not 441: about 189 orders, or <m>189 \times 80 = 15{,}120</m> dollars of revenue.`,
        'Alternatives: a change in desktop traffic sources in May (a campaign aimed at desktop users, say) could also lower desktop conversion. The team checks and finds desktop traffic sources unchanged.',
      ],
      answer: 'Finding: “Orders fell 11.6% in May (1,200 to 1,061) while visits rose 4.0%. The fall was confined to desktop, where conversion dropped from 3.00% to 2.10%; mobile, which kept the old pages, held at 2.00%. Desktop conversion recovered to 2.90% after the redesign was rolled back on 3 June. The evidence strongly suggests the desktop redesign cost about 189 orders ($15,120) in May. It was not a randomised test, so we can’t exclude another desktop-only change, but traffic sources were unchanged. Before relaunching, test the new design against the old with a randomised A/B test.”',
      interpretation: 'Each step narrowed the question: from orders to conversion, from all visitors to desktop, from a coincidence in time to a pattern with a comparison group and a reversal. The finding says how strong the evidence is and how to make it stronger. The project asks you to do the same for Lantern’s September, using the app as the comparison group and the 5 October fix as the reversal.' },
  ],

  demo: [
    { widget: 'int-axis', intro: 'Two values and the point where a bar chart’s axis starts. Raise the axis start towards the smaller value and watch the drawn bars, and the apparent change, grow more dramatic while the data stay the same.' },
    { widget: 'int-mix', intro: 'Two channels in two periods. Start at Northwind Outfitters’ figures, where both channel rates rise and the overall rate falls. Then set the two periods’ website shares equal and the paradox disappears.' },
    { widget: 'int-gifts', intro: 'Lantern’s gift-box orders and other orders by month. Notice how small the base is before November, and how much of December’s growth is gift boxes.' },
  ],

  mistakes: [
    { title: '“The chart shows orders collapsed.”', html: 'Check where the axis starts. On an axis from 240, a 20.6% fall looks like 85.5%. Bars must start at zero; lines may not, but the axis must be labelled.' },
    { title: '“It happened right after the launch, so the launch caused it.”', html: 'Timing alone can’t separate a cause from a coincidence. Look for a comparison group that didn’t get the change, a reversal and a mechanism, as in the Alderbank example.' },
    { title: '“Every channel improved, so the total must have.”', html: 'Not if the mix shifted towards a weaker channel: Northwind’s two channels both improved while its overall conversion fell. Split totals by group and separate rate from mix.' },
    { title: '“Our worst performers improved after the programme, so it works.”', html: 'Units picked because they were extreme tend to move back towards the average anyway: regression to the mean. Compare with similar units that didn’t get the programme.' },
    { title: '“These two rose together, so one drives the other.”', html: 'A confounder may drive both, the causation may run the other way, or it may be chance in a short series. Correlation is a reason to investigate, not a conclusion.' },
    { title: '“The data prove it.”', html: 'Data from an uncontrolled comparison rarely prove anything. Say what the evidence shows, how strong it is, what you couldn’t rule out and what would settle it.' },
  ],

  application: [
    { p: 'Interpreting results is the step where analysis turns into decisions, so it is where professional standards matter most.' },
    { p: 'Official statistics agencies deal with seasonality as a matter of routine. The US Census Bureau explains that it seasonally adjusts its quarterly services figures to remove effects that recur in the same part of the calendar each year, such as tax season or travel season, because those swings can hide the underlying direction of recent change; adjusted figures make neighbouring quarters easier to compare. It also cautions that seasonal factors rest on present and past experience, so future patterns may differ. A business with years of history can do the same in a simpler way, by comparing each month with the same month a year earlier.' },
    { p: 'In medicine, regression to the mean is a standard caution. Barnett and colleagues point out that patients are often selected for treatment because a measurement was unusually high, and some of the later improvement would have happened anyway; well-designed studies include a comparison group for exactly that reason. A business that sends its worst-performing stores, salespeople or campaigns for “turnaround” faces the same trap.' },
    { p: 'In an online business the analyst’s diagnosis often decides whether a launch is rolled back. A fictional travel site’s analyst found that bookings fell 8% after a redesign; segmenting showed the fall only among returning customers on one browser, and the error logs showed a broken saved-card feature. Rolling back the whole redesign would have thrown away improvements elsewhere; fixing one feature was enough.' },
    { case: 'For Lantern, the method is now clear. Ana’s September question goes through the diagnosis in order: confirm the data, find the driver (visits rose, so conversion fell), split by channel, use app buyers as the comparison group for the new website checkout, check whether website conversion recovered after the 5 October fix, look at the mix, and write the finding with its uncertainty. The survey she sent on 1 October can add customers’ own views, but its small sample and its question about a checkout that app buyers never saw limit what it can show. The project asks you to do the calculations and write the finding.' },
  ],

  summary: [
    'Read a chart’s title, axes, axis start, scale and encoding before its shape. Bars must start at zero; a truncated axis exaggerated September’s 20.6% fall into an apparent 85.5%.',
    'Compare like with like: the same definitions, the same length of period (per day if months differ) and, for seasonal businesses, the same period a year earlier.',
    'Correlation is not causation: a confounder, reverse causation or chance can make two series move together.',
    'Evidence for a cause: a randomised experiment, or failing that timing, a comparison group, a reversal, a mechanism and alternatives ruled out. Difference in differences = change in the affected group − change in the comparison group.',
    'Simpson’s paradox: every group can improve while the total worsens, because the mix shifted. Separate rate effects from mix effects.',
    'Regression to the mean: extreme results tend to be followed by more ordinary ones, so improvements after selecting the worst need a comparison group.',
    'Small samples are noisy; report counts and treat small differences with caution.',
    'Diagnose in order (is it real, unusual, which driver, where, when, why, how sure) and write findings whose wording matches the strength of the evidence.',
  ],

  glossary: [
    { term: 'Seasonality', def: 'A regular pattern that repeats at the same time each year (or week, or day), such as gift buying in December.' },
    { term: 'Correlated', def: 'Describes two quantities that tend to move together, so that high values of one tend to go with high (or low) values of the other. Correlation alone does not show that one causes the other.' },
    { term: 'Causation', def: 'A relationship in which changing one quantity would change another.' },
    { term: 'Confounding variable', def: 'A third variable that affects both of two quantities being compared, making them move together, or apart, without either causing the other. Also called a confounder.' },
    { term: 'Comparison group', def: 'A group that did not get a change, used to estimate what would probably have happened to the affected group without it.' },
    { term: 'Difference-in-differences', def: 'An estimate of an effect: the change in the affected group minus the change in a comparison group over the same period, assuming the two would otherwise have moved in parallel.' },
    { term: 'Simpson’s paradox', def: 'A relationship that holds within each of several groups but disappears or reverses when the groups are combined, usually because the groups’ sizes or mix differ.' },
    { term: 'Regression to the mean', def: 'The tendency of unusually high or low measurements, which are partly due to chance, to be followed by measurements closer to the average.' },
  ],

  references: [
    { text: 'Illowsky, B. &amp; Dean, S. (2023). <i>Introductory Statistics 2e</i>, section 12.3, “The Regression Equation” (correlation and causation). OpenStax.', url: 'https://openstax.org/books/introductory-statistics-2e/pages/12-3-the-regression-equation', checked: '2026-10-23' },
    { text: 'Weinberger, N. Simpson’s paradox. <i>The Stanford Encyclopedia of Philosophy</i>, first published 24 March 2021, substantive revision 6 June 2026.', url: 'https://plato.stanford.edu/entries/paradox-simpson/', checked: '2026-10-23' },
    { text: 'Bickel, P. J., Hammel, E. A. &amp; O’Connell, J. W. (1975). Sex bias in graduate admissions: data from Berkeley. <i>Science</i>, 187(4175), 398–404.', url: 'https://doi.org/10.1126/science.187.4175.398', checked: '2026-10-23' },
    { text: 'Barnett, A. G., van der Pols, J. C. &amp; Dobson, A. J. (2005). Regression to the mean: what it is and how to deal with it. <i>International Journal of Epidemiology</i>, 34(1), 215–220.', url: 'https://academic.oup.com/ije/article/34/1/215/638499', checked: '2026-10-23' },
    { text: 'U.S. Census Bureau. “Quarterly Services: Seasonal Adjustment FAQs”.', url: 'https://www.census.gov/services/qss/seasonally_adjusted_faqs.html', checked: '2026-10-23' },
    { text: 'Mercer, A. (2016). 5 key things to know about the margin of error in election polls. Pew Research Center, 8 September 2016.', url: 'https://www.pewresearch.org/short-reads/2016/09/08/understanding-the-margin-of-error-in-election-polls/', checked: '2026-10-23' },
  ],

  checks: [
    // case facts
    { what: 'August orders (case)', value: D.orders[AUG], shown: 316 },
    { what: 'September orders (case)', value: D.orders[SEP], shown: 251 },
    { what: 'July orders (case)', value: D.orders[0], shown: 294 },
    { what: 'October orders (case)', value: D.orders[3], shown: 319 },
    { what: 'August visits (case)', value: D.visits[AUG], shown: 10200 },
    { what: 'September visits (case)', value: D.visits[SEP], shown: 11400 },
    { what: 'Gift boxes October (case)', value: S.giftBoxOrders[3], shown: 9 },
    { what: 'Gift boxes November (case)', value: S.giftBoxOrders[4], shown: 88 },
    { what: 'Visits rise Oct to Dec (case)', value: D.visits[5] - D.visits[3], shown: 5200 },
    { what: 'Rating rise Oct to Dec (case)', value: S.avgRating[5] - S.avgRating[3], shown: 0.2 },
    { what: 'Lantern began trading (day of March 2026)', value: 1, shown: 1 },
    { what: 'Survey responses (case)', value: SURVEY.responses, shown: 79 },
    { what: 'Monthly values in the case', value: S.webVisits.length, shown: 6 },
    // concept
    { what: 'September bar a seventh of August’s', value: drawn(D.orders[SEP]) / drawn(D.orders[AUG]), shown: 1 / 7, tol: 0.005 },
    { what: 'Drawn August bar', value: drawn(D.orders[AUG]), shown: 76 },
    { what: 'Drawn September bar', value: drawn(D.orders[SEP]), shown: 11 },
    { what: 'Apparent fall (%)', value: visualFall, shown: 85.5, tol: 0.05 },
    { what: 'Actual fall (%)', value: fallPct, shown: 20.6, tol: 0.05 },
    { what: 'Exaggeration about four times', value: visualFall / fallPct, shown: 4.2, tol: 0.05 },
    { what: 'September about four-fifths of August', value: D.orders[SEP] / D.orders[AUG], shown: 0.8, tol: 0.01 },
    { what: 'August orders per day', value: D.orders[AUG] / 31, shown: 10.2, tol: 0.05 },
    { what: 'September orders per day', value: D.orders[SEP] / 30, shown: 8.4, tol: 0.05 },
    { what: 'Per-day fall (%)', value: (1 - (D.orders[SEP] / 30) / (D.orders[AUG] / 31)) * 100, shown: 17.9, tol: 0.05 },
    { what: 'Orders explained by the shorter month', value: D.orders[SEP] * 31 / 30 - D.orders[SEP], shown: 8, tol: 0.5 },
    { what: 'Missing orders', value: D.orders[AUG] - D.orders[SEP], shown: 65 },
    { what: 'Gift boxes Oct to Nov, almost 880%', value: (S.giftBoxOrders[4] / S.giftBoxOrders[3] - 1) * 100, shown: 878, tol: 0.5 },
    // theory
    { what: 'Bickel, Hammel and O’Connell year', value: 1975, shown: 1975 },
    { what: 'Berkeley departments analysed', value: 101 - 16, shown: 85 },
    { what: 'Cafés: low four improved (stars)', value: 3.9 - 3.6, shown: 0.3 },
    { what: 'Cafés: top four fell (stars)', value: 4.7 - 4.5, shown: 0.2 },
    { what: 'Small pages: 3 of 40 (%)', value: 3 / 40 * 100, shown: 7.5 },
    { what: 'Small pages: 2 of 40 (%)', value: 2 / 40 * 100, shown: 5.0 },
    { what: 'Small pages: gap (points)', value: 3 / 40 * 100 - 2 / 40 * 100, shown: 2.5 },
    { what: 'Finding wording: visits rose (%)', value: (D.visits[SEP] / D.visits[AUG] - 1) * 100, shown: 11.8, tol: 0.05 },
    // examples: simple
    { what: 'Simple: exaggeration factor from rounded figures', value: 85.5 / 20.6, shown: 4.2, tol: 0.05 },
    { what: 'Simple: August per day (2 dp)', value: D.orders[AUG] / 31, shown: 10.19 },
    { what: 'Simple: September per day (2 dp)', value: D.orders[SEP] / 30, shown: 8.37 },
    // examples: challenging (Northwind)
    { what: 'Northwind web rate A (%)', value: rate(NA.wo, NA.wv), shown: 2.50 },
    { what: 'Northwind web rate B (%)', value: rate(NB.wo, NB.wv), shown: 2.60 },
    { what: 'Northwind app rate A (%)', value: rate(NA.ao, NA.av), shown: 4.00 },
    { what: 'Northwind app rate B (%)', value: rate(NB.ao, NB.av), shown: 4.20 },
    { what: 'Northwind visits A', value: NA.wv + NA.av, shown: 10000 },
    { what: 'Northwind visits B', value: NB.wv + NB.av, shown: 13000 },
    { what: 'Northwind orders A', value: NA.wo + NA.ao, shown: 310 },
    { what: 'Northwind orders B', value: NB.wo + NB.ao, shown: 386 },
    { what: 'Northwind overall A (%)', value: overA, shown: 3.10 },
    { what: 'Northwind overall B (%)', value: overB, shown: 2.97 },
    { what: 'Northwind overall change (points)', value: overB - overA, shown: -0.13 },
    { what: 'Northwind web share A (%)', value: shareA * 100, shown: 60 },
    { what: 'Northwind web share B (%)', value: shareB * 100, shown: 77, tol: 0.5 },
    { what: 'Northwind mix-adjusted (%)', value: bAtA, shown: 3.24 },
    { what: 'Northwind rate effect (points)', value: bAtA - overA, shown: 0.14 },
    { what: 'Northwind mix effect (points)', value: overB - bAtA, shown: -0.27 },
    { what: 'Northwind extra orders', value: (NB.wo + NB.ao) - (NA.wo + NA.ao), shown: 76 },
    // examples: applied (Alderbank)
    { what: 'Alderbank visits April', value: PA.dv + PA.mv, shown: 50000 },
    { what: 'Alderbank visits May', value: PM.dv + PM.mv, shown: 52000 },
    { what: 'Alderbank visits change (%)', value: ((PM.dv + PM.mv) / (PA.dv + PA.mv) - 1) * 100, shown: 4.0 },
    { what: 'Alderbank orders April', value: PA.do + PA.mo, shown: 1200 },
    { what: 'Alderbank orders May', value: PM.do + PM.mo, shown: 1061 },
    { what: 'Alderbank orders change (%)', value: ((PM.do + PM.mo) / (PA.do + PA.mo) - 1) * 100, shown: -11.6, tol: 0.05 },
    { what: 'Alderbank conversion April (%)', value: rate(PA.do + PA.mo, PA.dv + PA.mv), shown: 2.40 },
    { what: 'Alderbank conversion May (%)', value: rate(PM.do + PM.mo, PM.dv + PM.mv), shown: 2.04 },
    { what: 'Alderbank desktop April (%)', value: rate(PA.do, PA.dv), shown: 3.00 },
    { what: 'Alderbank desktop May (%)', value: rate(PM.do, PM.dv), shown: 2.10 },
    { what: 'Alderbank mobile April (%)', value: rate(PA.mo, PA.mv), shown: 2.00 },
    { what: 'Alderbank mobile May (%)', value: rate(PM.mo, PM.mv), shown: 2.00 },
    { what: 'Alderbank DiD (points)', value: (rate(PM.do, PM.dv) - rate(PA.do, PA.dv)) - (rate(PM.mo, PM.mv) - rate(PA.mo, PA.mv)), shown: -0.90 },
    { what: 'Alderbank desktop June (%)', value: rate(PJ.do, PJ.dv), shown: 2.90 },
    { what: 'Alderbank expected desktop orders May', value: PM.dv * rate(PA.do, PA.dv) / 100, shown: 630 },
    { what: 'Alderbank lost orders', value: PM.dv * rate(PA.do, PA.dv) / 100 - PM.do, shown: 189 },
    { what: 'Alderbank lost revenue', value: (PM.dv * rate(PA.do, PA.dv) / 100 - PM.do) * 80, shown: 15120 },
    { what: 'Travel site fall (%)', value: 8, shown: 8 },
  ],
};
