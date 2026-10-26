// interpreting-results.ex.js — B01 · Interpreting results: charts, comparisons and causes: widgets, practice and the
// knowledge check. Answer keys live here, not in the page's HTML. Every number is recomputed by `check` (see ../AUTHORING.md).
// The gift-box chart and the axis widget's defaults use Lantern's monthly orders (case.js); every other business and
// figure is fictional.
import { SHOP as S, DERIVED as D } from './case.js?v=18';

const pct = (v, d = 2) => `${v < 0 ? '−' : ''}${Math.abs(v).toFixed(d)}%`;
const signed = (v, d = 2) => `${v > 0 ? '+' : v < 0 ? '−' : ''}${Math.abs(v).toFixed(d)}`;
const round2 = (v) => Math.round(v * 100) / 100;

export const widgets = {
  'int-axis': {
    type: 'formula',
    title: 'What a truncated axis does to a bar chart',
    intro: 'Two values shown as bars, and the value at which the chart’s vertical axis starts. Starts at Lantern’s August and September orders.',
    inputs: [
      { id: 'before', label: 'First value', min: 50, max: 1000, step: 1, value: D.orders[1], fmt: 'int' },
      { id: 'after', label: 'Second value', min: 50, max: 1000, step: 1, value: D.orders[2], fmt: 'int' },
      { id: 'start', label: 'Axis starts at', min: 0, max: 600, step: 5, value: 240, fmt: 'int' },
    ],
    compute: (v) => {
      const lo = Math.min(v.before, v.after);
      if (v.start >= lo) return { headline: { label: 'Apparent change on this chart', value: '—' }, rows: [], note: '', error: `The axis must start below both values (below ${lo}), or a bar vanishes. Lower the axis start.` };
      const actual = (v.after - v.before) / v.before * 100;
      const dB = v.before - v.start, dA = v.after - v.start;
      const apparent = (dA - dB) / dB * 100;
      const same = Math.abs(actual) < 1e-9;
      return {
        headline: { label: 'Apparent change on this chart', value: `${signed(apparent, 1)}%` },
        rows: [
          ['Actual change in the data', `${signed(actual, 1)}%`],
          ['Bar lengths as drawn', `${dB} and ${dA}`],
          ['Exaggeration (apparent ÷ actual)', same ? '—' : `${(apparent / actual).toFixed(1)} times`],
        ],
        note: same
          ? 'The two values are equal, so the bars are equal on any axis.'
          : v.start === 0
            ? 'With the axis at zero, bar lengths are proportional to the values: the apparent change equals the actual change.'
            : `Starting the axis at ${v.start} cuts the same ${v.start} units off both bars, so the difference between them looks ${(apparent / actual).toFixed(1)} times as large as it is. The data haven’t changed; only the picture has.`,
        chart: { kind: 'bar', x: { label: 'Bar', values: ['First value', 'Second value'] }, series: [{ name: `Bar length drawn from ${v.start}`, values: [dB, dA] }], y: { label: `Length of bar above ${v.start}`, format: 'int' } },
      };
    },
  },
  'int-mix': {
    type: 'formula',
    title: 'Rate and mix: Simpson’s paradox',
    intro: 'Two periods; in each, a website and an app with their own conversion rates and the website’s share of visits. Starts at Northwind Outfitters’ figures (fictional).',
    inputs: [
      { id: 'sA', label: 'Period A: website share of visits', min: 10, max: 90, step: 1, value: 60, fmt: 'pct' },
      { id: 'wA', label: 'Period A: website conversion', min: 0.5, max: 6, step: 0.1, value: 2.5, fmt: 'pct' },
      { id: 'aA', label: 'Period A: app conversion', min: 0.5, max: 6, step: 0.1, value: 4.0, fmt: 'pct' },
      { id: 'sB', label: 'Period B: website share of visits', min: 10, max: 90, step: 1, value: 77, fmt: 'pct' },
      { id: 'wB', label: 'Period B: website conversion', min: 0.5, max: 6, step: 0.1, value: 2.6, fmt: 'pct' },
      { id: 'aB', label: 'Period B: app conversion', min: 0.5, max: 6, step: 0.1, value: 4.2, fmt: 'pct' },
    ],
    compute: (v) => {
      const a = v.sA / 100, b = v.sB / 100;
      const oA = a * v.wA + (1 - a) * v.aA;
      const oB = b * v.wB + (1 - b) * v.aB;
      const adj = a * v.wB + (1 - a) * v.aB;
      const rateEff = adj - oA, mixEff = oB - adj, total = oB - oA;
      const bothUp = v.wB >= v.wA && v.aB >= v.aA && (v.wB > v.wA || v.aB > v.aA);
      const bothDown = v.wB <= v.wA && v.aB <= v.aA && (v.wB < v.wA || v.aB < v.aA);
      const note = bothUp && total < -0.005
        ? `Simpson’s paradox: both channels converted better in period B, yet the overall rate fell ${Math.abs(total).toFixed(2)} points, because the mix moved towards the ${b > a ? 'website' : 'app'}, the lower-converting channel. The rates alone added ${signed(rateEff)} points; the mix took away ${Math.abs(mixEff).toFixed(2)}.`
        : bothDown && total > 0.005
          ? `The reverse paradox: both channels converted worse in period B, yet the overall rate rose ${total.toFixed(2)} points, because the mix moved towards the ${b > a ? 'website' : 'app'}, the higher-converting channel.`
          : Math.abs(b - a) < 1e-9
            ? `The two periods have the same mix, so the whole change of ${signed(total)} points comes from the channel rates.`
            : `The overall rate changed by ${signed(total)} points: ${signed(rateEff)} from the channel rates and ${signed(mixEff)} from the mix. Set the two periods’ shares equal and the mix effect disappears.`;
      return {
        headline: { label: 'Change in overall conversion', value: `${signed(total)} points` },
        rows: [
          ['Overall, period A', pct(oA)],
          ['Overall, period B', pct(oB)],
          ['Period B’s rates at period A’s mix', pct(adj)],
          ['Rate effect', `${signed(rateEff)} points`],
          ['Mix effect', `${signed(mixEff)} points`],
        ],
        note,
        chart: { kind: 'bar', x: { label: 'Rate', values: ['Website', 'App', 'Overall'] }, series: [{ name: 'Period A', values: [v.wA, v.aA, round2(oA)] }, { name: 'Period B', values: [v.wB, v.aB, round2(oB)] }], y: { label: 'Conversion (%)', format: 'pct' } },
      };
    },
  },
  'int-gifts': {
    type: 'chart', kind: 'bar',
    title: 'Lantern’s orders by month, July–December 2026 (fictional)',
    x: { label: 'Month', values: ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] },
    series: [
      { name: 'Gift-box orders', values: S.giftBoxOrders },
      { name: 'Other orders', values: D.orders.map((o, i) => o - S.giftBoxOrders[i]) },
    ],
    y: { label: 'Orders', format: 'int' },
    note: 'Gift-box orders went from 9 in October to 88 in November and 231 in December: a rise of almost 880% from a tiny base, then 162.5%. Other orders grew far more slowly, from 310 in October to 352 in December. Comparing December with November mixes this seasonal pattern with any underlying change; from March 2027 Lantern can compare each month with the same month a year earlier.',
  },
};

export const guided = [
  {
    id: 'b01-int-g1', type: 'steps', kind: 'numerical',
    prompt: 'A fictional bike shop’s slide shows weekly sales of $1,050 and then $1,000 as bars on a vertical axis that starts at $950.',
    solution: 'Drawn bars: 1,050 − 950 = 100 and 1,000 − 950 = 50, so the second looks 50% lower. The real fall is 50 ÷ 1,050 ≈ 4.76%. The chart exaggerates the change more than tenfold.',
    steps: [
      { id: 'b01-int-g1-s1', type: 'num', prompt: 'By what percentage does the second bar look lower than the first?',
        answer: 50, check: () => ((1050 - 950) - (1000 - 950)) / (1050 - 950) * 100, unit: '%', places: 1, tol: 0.05,
        hints: ['Each bar is drawn from 950, so its length is the value minus 950.', 'Lengths 100 and 50.'],
        wrong: [{ value: 4.76, say: 'That is the real fall. The question asks how large it looks: compare the drawn lengths, 100 and 50.' }] },
      { id: 'b01-int-g1-s2', type: 'num', prompt: 'By what percentage did sales actually fall? Two decimal places.',
        answer: 4.76, check: () => (1050 - 1000) / 1050 * 100, unit: '%', places: 2, tol: 0.005,
        hints: ['Percentage change uses the values, not the drawn lengths.', '(1,050 − 1,000) ÷ 1,050 × 100.'],
        wrong: [
          { value: 50, say: 'That is how large the fall looks on the truncated axis. Use the values themselves.' },
          { value: 5, say: 'You divided by the new value, 1,000. The base is the old value, 1,050.' },
        ] },
    ],
  },
  {
    id: 'b01-int-g2', type: 'classify', kind: 'conceptual',
    prompt: 'Each statement describes two things that move together. Classify the most likely non-causal explanation.',
    items: [
      'Ice-cream sales and sunburn cases rise and fall together through the year.',
      'Shops that sell more spend more on advertising; each shop’s budget is set at 5% of its sales in the same year.',
      'Over six months, a shop’s orders rose in exactly the months when rainfall rose in a city 3,000 km away.',
      'The three salespeople with the worst March figures were coached, and all three did better in April.',
      'App customers spend more per order than website customers; the app is mostly installed by loyal regular buyers.',
    ],
    categories: ['Confounding variable', 'Reverse causation', 'Chance', 'Regression to the mean'],
    answer: [0, 1, 2, 3, 0],
    hints: ['Look for a third factor, a cause running the other way, a short series, or units picked because they were extreme.', 'Summer drives one of them; customer loyalty drives another.'],
    feedback: {
      0: 'Sunny weather raises both ice-cream sales and sunburn: a confounder.',
      1: 'Each budget is set from the shop’s own sales, so sales drive advertising: the causation runs from sales to advertising, whatever advertising also does.',
      2: 'With six data points, unrelated series often line up by coincidence.',
      3: 'The three were chosen for being the worst; some improvement was likely without coaching.',
      4: 'Loyalty drives both using the app and spending more: the app need not cause the higher spending.',
    },
    solution: 'Confounding: ice cream and sunburn (summer), app and spending (loyalty). Reverse causation: budgets set as a share of sales. Chance: rainfall far away over six months. Regression to the mean: the coached worst performers.',
  },
  {
    id: 'b01-int-g3', type: 'steps', kind: 'applied',
    prompt: 'A fictional hotel’s direct-booking site had, in period A, 4,000 desktop visits with 200 bookings and 6,000 mobile visits with 120 bookings: an overall conversion of 3.20%. In period B it had 3,000 desktop visits with 156 bookings (5.2%) and 9,000 mobile visits with 189 bookings (2.1%). Both devices improved. What happened overall, and why?',
    solution: 'Overall B = 345 ÷ 12,000 = 2.875% ≈ 2.88%, down from 3.20%. At period A’s mix (40% desktop, 60% mobile), period B’s rates give 0.4 × 5.2 + 0.6 × 2.1 = 3.34%, so the rates alone would have raised conversion; the shift towards mobile, the lower-converting device, pulled it down. Simpson’s paradox.',
    steps: [
      { id: 'b01-int-g3-s1', type: 'num', prompt: 'What was overall conversion in period B? Three decimal places.',
        answer: 2.875, check: () => (156 + 189) / (3000 + 9000) * 100, unit: '%', places: 3, tol: 0.006,
        hints: ['Add the bookings and the visits across devices.', '345 ÷ 12,000.'],
        wrong: [{ value: 3.65, say: 'That is the plain average of 5.2% and 2.1%. Mobile has three times desktop’s visits: divide total bookings by total visits.' }] },
      { id: 'b01-int-g3-s2', type: 'num', prompt: 'What would period B’s overall conversion have been at period A’s mix of visits (40% desktop, 60% mobile)? Two decimal places.',
        answer: 3.34, check: () => 0.4 * (156 / 3000 * 100) + 0.6 * (189 / 9000 * 100), unit: '%', places: 2, tol: 0.005,
        hints: ['Weight period B’s device rates by period A’s shares.', '0.4 × 5.2% + 0.6 × 2.1%.'],
        wrong: [{ value: 2.88, say: 'That uses period B’s own mix (25% desktop). Use period A’s shares: 0.4 and 0.6.' }] },
      { id: 'b01-int-g3-s3', type: 'mc', prompt: 'Why did overall conversion fall?',
        options: ['More of the visits came from mobile, the lower-converting device', 'Both devices converted worse in period B than in period A', 'The site had fewer visits in period B, so bookings fell too', 'Desktop bookings fell, which shows that desktop got worse'],
        answer: 0,
        hints: ['Compare the device rates first, then the device shares.'],
        feedback: { 1: 'Both device rates rose: desktop 5.0% to 5.2%, mobile 2.0% to 2.1%.', 2: 'Visits rose, from 10,000 to 12,000.', 3: 'Desktop bookings fell because desktop visits fell; desktop’s rate rose.' } },
    ],
  },
  {
    id: 'b01-int-g4', type: 'order', kind: 'applied',
    prompt: 'Put the steps of diagnosing an unexpected fall in a KPI in the order you should take them.',
    items: [
      'Check the data: tracking, definitions, missing days, duplicates',
      'Compare the change with normal variation and the same period last year',
      'Find which driver moved: visits, conversion or order value',
      'Segment by channel, device, product and customer type',
      'Pin down when it started, using daily data',
      'Test explanations with comparison groups, reversals and mechanisms',
      'Write the finding with its uncertainty and the next step',
    ],
    hints: ['Before asking why the business changed, make sure the data did not.', 'Narrow down from the whole KPI to its driver, then to where and when, before testing why.'],
    solution: 'Real? Unusual? Which driver? Where? When? Why? How sure? Each step can end the investigation early: a tracking error found in step one saves all the rest.',
  },
];

export const independent = [
  {
    id: 'b01-int-i1', type: 'num', kind: 'numerical',
    prompt: 'A fictional online shop took 868 orders in January (31 days) and 812 in February (28 days, not a leap year). By what percentage did orders per day change? Give one decimal place, with a minus sign for a fall.',
    answer: 3.6, check: () => ((812 / 28) / (868 / 31) - 1) * 100, unit: '%', places: 1, tol: 0.05,
    wrong: [{ value: -6.45, say: 'That compares the monthly totals. February is three days shorter: compare orders per day (28 and 29).' }],
    solution: 'January: 868 ÷ 31 = 28 a day. February: 812 ÷ 28 = 29 a day. Change: 29 ÷ 28 − 1 ≈ +3.6%. The monthly total fell 6.5% only because February is shorter.',
  },
  {
    id: 'b01-int-i2', type: 'num', kind: 'numerical',
    prompt: 'A fictional retailer redesigned its website in March; its app was unchanged. Website conversion went from 3.2% in February to 3.9% in March, and app conversion from 3.0% to 3.4%. Using difference in differences, estimate the redesign’s effect on website conversion, in percentage points.',
    answer: 0.3, check: () => (3.9 - 3.2) - (3.4 - 3.0), unit: 'percentage points', places: 1, tol: 0.005,
    wrong: [
      { value: 0.7, say: 'That is the website’s whole rise. The app rose 0.4 points without any redesign, so subtract it.' },
      { value: 21.88, tol: 0.05, say: 'That is the website’s relative rise. Work in percentage points and subtract the app’s change.' },
    ],
    solution: 'Website change: 3.9 − 3.2 = 0.7 points. App change: 3.4 − 3.0 = 0.4 points, which shows what happened without a redesign (the season, say). Estimated effect: 0.7 − 0.4 = 0.3 points, assuming the two would otherwise have moved in parallel.',
  },
  {
    id: 'b01-int-i3', type: 'rows', kind: 'applied',
    prompt: 'A fictional company’s analysts wrote these findings. Select every finding whose wording claims more than its evidence supports.',
    data: { table: {
      head: ['Finding as written', 'Evidence behind it'],
      rows: [
        ['“The new banner caused a 15% rise in sales.”', 'Sales in the week after the banner went up, compared with the week before'],
        ['“The fall is consistent with a delivery problem, but we haven’t ruled out the price change made the same week.”', 'Timing only; two changes in the same week'],
        ['“In a randomised test, the new checkout raised conversion by about 0.4 points.”', 'A randomised A/B test with 200,000 visitors'],
        ['“Customers who read our blog are more loyal, so the blog creates loyalty.”', 'A correlation between blog visits and repeat orders'],
        ['“The coaching programme turned our three worst branches around.”', 'The three lowest-rated branches in March were coached and improved in April; no comparison branches'],
        ['“We can’t tell yet whether the email helped; a holdout group next month would settle it.”', 'Orders rose in a month with both an email and a public holiday'],
      ],
    } },
    answer: [0, 3, 4],
    solution: 'The banner finding rests on a before-and-after comparison of one week, which can’t separate the banner from anything else that changed. The blog finding reads causation into a correlation; loyal customers may read more of it anyway. The coaching finding ignores regression to the mean: the worst branches were likely to improve anyway. The other three match their wording to their evidence.',
  },
  {
    id: 'b01-int-i4', type: 'mc', kind: 'applied',
    prompt: 'A fictional retail chain picks the ten shops with the biggest falls in sales in the first quarter and sends them a turnaround team. In the second quarter all ten improve. What should the analyst say?',
    options: [
      'Some of the improvement was likely anyway; compare with similar shops that had no team.',
      'The team worked: all ten shops improved, and that would be very unlikely to happen by chance.',
      'The team made no difference: the improvement is all regression to the mean.',
      'Nothing can be learned at all, because the shops were not chosen at random.',
    ],
    answer: 0,
    feedback: {
      1: 'All ten improving is what regression to the mean predicts for shops picked as the worst, so it is not unlikely at all without help.',
      2: 'Regression to the mean explains some improvement, not necessarily all of it. Without a comparison you can’t say the team did nothing.',
      3: 'A comparison with similar shops that got no team can still estimate the effect.',
    },
    solution: 'Shops picked for an extreme quarter partly had bad luck, which tends not to repeat. The team may have helped too. To separate the two, compare the ten with similar shops that had similar falls but no team, or next time give the team to half of the shops chosen at random.',
  },
  {
    id: 'b01-int-i5', type: 'num', kind: 'numerical',
    prompt: 'A fictional chart shows two bars, for 80 and 100, on an axis that starts at 70. How many times taller does the 100 bar look than the 80 bar?',
    answer: 3, check: () => (100 - 70) / (80 - 70), unit: 'times', places: 1, tol: 0.05,
    wrong: [{ value: 1.25, say: 'That is the true ratio of the values (100 ÷ 80). The bars are drawn from 70, so their lengths are 30 and 10.' }],
    solution: 'Drawn lengths: 100 − 70 = 30 and 80 − 70 = 10, so the bar looks 3 times as tall, although 100 is only 1.25 times 80.',
  },
  {
    id: 'b01-int-i6', type: 'multi', kind: 'conceptual',
    prompt: 'A shop’s website conversion fell in the month a redesign launched. Which of these would strengthen the claim that the redesign caused the fall? Select all that apply.',
    options: [
      'App conversion, where nothing changed, stayed steady',
      'Website conversion recovered when the redesign was rolled back',
      'Error logs show the new payment page failing on some browsers',
      'The fall began on the day of the launch, in daily data',
      'Visits rose in the same month',
      'Several staff members dislike the new design',
    ],
    answer: [0, 1, 2, 3],
    feedback: {
      4: 'Rising visits don’t connect the fall in conversion to the redesign.',
      5: 'Staff opinions aren’t evidence of what customers did.',
    },
    solution: 'A steady comparison group, a reversal, a mechanism and a sharp start on the launch day each make other explanations less likely. Rising visits and staff opinions say nothing about the cause.',
  },
];

export const check = [
  {
    id: 'b01-int-k1', type: 'mc', kind: 'conceptual',
    prompt: 'Which situation is an example of Simpson’s paradox?',
    options: [
      'A new price raised the buying rate in both regions, but lowered it for the two combined.',
      'Sales rose after a campaign, but only because the campaign ran during the Christmas season.',
      'The worst-performing shop improved the next month, although nothing about it had changed.',
      'A bar chart with an axis starting near the data made a 2% rise look like a 50% rise.',
    ],
    answer: 0,
    feedback: {
      1: 'That is confounding by seasonality, not a reversal between groups and total.',
      2: 'That is regression to the mean.',
      3: 'That is a misleading truncated axis.',
    },
    solution: 'Simpson’s paradox is a relationship that holds in every group but reverses (or disappears) when the groups are combined, usually because the groups’ sizes or mix differ between the things being compared.',
  },
  {
    id: 'b01-int-k2', type: 'num', kind: 'numerical',
    prompt: 'A fictional shop had 9,000 website visits converting at 2.0% and 1,000 app visits converting at 5.0%. What was its overall conversion rate? One decimal place.',
    answer: 2.3, check: () => (9000 * 0.02 + 1000 * 0.05) / 10000 * 100, unit: '%', places: 1, tol: 0.05,
    wrong: [{ value: 3.5, say: 'That is the plain average of the two rates. The website has nine times the app’s visits: weight by visits.' }],
    solution: 'Orders = 9,000 × 0.02 + 1,000 × 0.05 = 180 + 50 = 230. Overall = 230 ÷ 10,000 × 100 = 2.3%, or 0.9 × 2.0% + 0.1 × 5.0%.',
  },
  {
    id: 'b01-int-k3', type: 'mc', kind: 'applied',
    prompt: 'A fictional report shows a shop’s monthly conversion rate as a line chart whose vertical axis runs from 2.0% to 3.5%, clearly labelled. A manager says the chart is misleading because the axis doesn’t start at zero. Is she right?',
    options: [
      'Not necessarily: lines are read by position, so a labelled axis near the data can be fair.',
      'Yes: every chart, whether it shows lines or bars, must start its vertical axis at zero to be honest.',
      'Yes: a conversion rate must always be drawn on an axis running from 0% to 100%.',
      'No: the range of an axis never affects how large a change appears to a reader.',
    ],
    answer: 0,
    feedback: {
      1: 'The zero rule is for bars, which encode values by length. Lines encode by position.',
      2: 'On an axis to 100%, a rate moving between 2% and 3.5% would look flat; the picture would hide real changes.',
      3: 'Axis ranges change how large a change looks, which is why the axis must be labelled and the slope fair.',
    },
    solution: 'Bars must start at zero because their lengths are compared. Lines are read by position and slope, so a labelled axis that starts near the data can be honest, provided it doesn’t make a small change look dramatic.',
  },
  {
    id: 'b01-int-k4', type: 'num', kind: 'applied',
    prompt: 'In the month after a fictional redesign, website conversion fell from 3.0% to 2.4% on 15,000 website visits, while app conversion was unchanged. About how many website orders did the fall cost, assuming the website would otherwise have converted at 3.0%?',
    answer: 90, check: () => 15000 * (3.0 - 2.4) / 100, unit: 'orders', places: 0, tol: 0.5,
    wrong: [
      { value: 360, say: 'That is the number of orders the website actually took (15,000 × 2.4%). The loss is the difference from 3.0%.' },
      { value: 450, say: 'That is the number of orders at 3.0%. Subtract the 360 actually taken.' },
    ],
    solution: 'Expected at 3.0%: 15,000 × 0.030 = 450 orders. Actual at 2.4%: 15,000 × 0.024 = 360. Lost: 450 − 360 = 90 orders, or 15,000 × 0.6 points ÷ 100.',
  },
  {
    id: 'b01-int-k5', type: 'classify', kind: 'conceptual',
    prompt: 'Match each body of evidence with the strongest wording it supports.',
    items: [
      'A randomised A/B test with a large sample',
      'A comparison group, a reversal when the change was undone, and an observed mechanism',
      'Timing alone, with another change made in the same week',
      'A correlation across five monthly values',
    ],
    categories: ['“caused”', '“strongly suggests”', '“is consistent with”', '“we can’t tell yet”'],
    answer: [0, 1, 2, 3],
    feedback: {
      1: 'Without randomisation another cause can’t be fully excluded, but three independent kinds of evidence point the same way.',
      2: 'Timing fits, but the other change fits just as well.',
      3: 'Five points can line up by chance, and a confounder may drive both series.',
    },
    solution: 'Only a randomised experiment justifies “caused”. Several independent kinds of evidence justify “strongly suggests”. Timing alone justifies “is consistent with”. A short correlation justifies only “we can’t tell yet”, with a plan to find out.',
  },
  {
    id: 'b01-int-k6', type: 'fill', kind: 'applied',
    prompt: 'Complete the finding for a fictional online bookshop that redesigned its desktop site on 2 March and rolled it back on 6 April.',
    text: 'Orders fell 12% in March while visits rose. The fall was confined to [[0]], which got the new design; [[1]], which kept the old one, was unchanged. Desktop conversion recovered after the [[2]]. Because this was not a [[3]], we can’t exclude another desktop-only cause, but the evidence [[4]] that the redesign was responsible.',
    blanks: [
      { options: ['mobile', 'desktop', 'all devices'], answer: 1 },
      { options: ['mobile', 'desktop', 'the whole site'], answer: 0 },
      { options: ['launch on 2 March', 'start of the month', 'rollback on 6 April'], answer: 2 },
      { options: ['monthly report', 'randomised experiment', 'large sample'], answer: 1 },
      { options: ['strongly suggests', 'proves', 'cannot suggest'], answer: 0 },
    ],
    solution: 'The comparison group (mobile) and the reversal (the rollback) support a strong statement, but without randomisation “proves” overclaims. “Strongly suggests”, with the remaining doubt named, matches the evidence.',
  },
];
