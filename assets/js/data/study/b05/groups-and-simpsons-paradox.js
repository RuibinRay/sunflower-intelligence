// groups-and-simpsons-paradox.js — B05 · Groups and Simpson’s paradox. Content only; exercises are in
// groups-and-simpsons-paradox.ex.js. Uses the corrected café log (case.js): footfall and average ticket, pooled and by
// café (DERIVED.footTicket*), the cafés’ monthly averages, and Millbrook’s weekdays and weekends. Tidewater Books is
// fictional; Robinson’s 1930 census figures are as reported by Subramanian et al. (2009). Holding a third variable fixed
// by partial correlation is module 4’s. Every figure printed is recomputed in `checks`.
import { column, DERIVED as D } from './case.js?v=20';
import * as C from '../../../core/correlation.js?v=20';
import { mean, sd } from '../../../core/stats.js?v=20';

// ---------------------------------------------------------------- footfall and average ticket
const F = column('footfall'), A = column('avg_ticket'), CAFE = column('cafe'), DATE = column('date'), T = column('high_f'), I = column('iced_share');
const n = F.length, mx = mean(F), my = mean(A);
const G = ['Harbourside', 'Millbrook'].map((name) => {
  const ix = F.map((_, i) => i).filter((i) => CAFE[i] === name);
  const xs = ix.map((i) => F[i]), ys = ix.map((i) => A[i]);
  return { name, n: ix.length, mx: mean(xs), my: mean(ys), sx: sd(xs), sy: sd(ys), xs, ys,
    spW: xs.reduce((s, x, k) => s + (x - mean(xs)) * (ys[k] - mean(ys)), 0),
    ssx: xs.reduce((s, x) => s + (x - mean(xs)) ** 2, 0), ssy: ys.reduce((s, y) => s + (y - mean(ys)) ** 2, 0) };
});
const [GH, GM] = G;
const spTotal = F.reduce((s, x, i) => s + (x - mx) * (A[i] - my), 0);
const spWithin = GH.spW + GM.spW;
const spBetween = G.reduce((s, g) => s + g.n * (g.mx - mx) * (g.my - my), 0);
const rWithin = spWithin / Math.sqrt((GH.ssx + GM.ssx) * (GH.ssy + GM.ssy));
const rhoAll = C.spearman(F, A).rho, rhoH = C.spearman(GH.xs, GH.ys).rho, rhoM = C.spearman(GM.xs, GM.ys).rho;

// ---------------------------------------------------------------- monthly averages (ecological)
const MONTHS = ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MEANS = [];
for (const g of ['Harbourside', 'Millbrook']) for (let m = 3; m <= 12; m++) {
  const ix = F.map((_, i) => i).filter((i) => CAFE[i] === g && Number(DATE[i].slice(5, 7)) === m);
  MEANS.push({ cafe: g, month: MONTHS[m - 3], f: mean(ix.map((i) => F[i])), a: mean(ix.map((i) => A[i])), t: mean(ix.map((i) => T[i])), ic: mean(ix.map((i) => I[i])) });
}
const ecoR = C.pearson(MEANS.map((p) => p.f), MEANS.map((p) => p.a)).r;
const ecoH = C.pearson(MEANS.filter((p) => p.cafe === 'Harbourside').map((p) => p.f), MEANS.filter((p) => p.cafe === 'Harbourside').map((p) => p.a)).r;
const ecoM = C.pearson(MEANS.filter((p) => p.cafe === 'Millbrook').map((p) => p.f), MEANS.filter((p) => p.cafe === 'Millbrook').map((p) => p.a)).r;
const ecoTemp = C.pearson(MEANS.map((p) => p.t), MEANS.map((p) => p.ic)).r;

// ---------------------------------------------------------------- Millbrook: weekdays and weekends
const MW = column('weekday', { cafe: 'Millbrook' }).map((d) => (d === 'Sat' || d === 'Sun' ? 'weekend' : 'weekday'));
const sub = (k) => ({ x: GM.xs.filter((_, i) => MW[i] === k), y: GM.ys.filter((_, i) => MW[i] === k) });
const MWD = sub('weekday'), MWE = sub('weekend');
const rWd = C.pearson(MWD.x, MWD.y).r, rWe = C.pearson(MWE.x, MWE.y).r;

// ---------------------------------------------------------------- Tidewater Books (fictional)
const CX = [310, 325, 340, 355, 370, 385], CY = [12.10, 12.60, 12.40, 13.30, 13.50, 13.90];
const AX = [110, 125, 140, 155, 170, 185], AY = [24.80, 25.90, 25.50, 26.60, 27.00, 27.60];
const tCity = C.pearson(CX, CY).r, tAir = C.pearson(AX, AY).r, tPool = C.pearson([...CX, ...AX], [...CY, ...AY]).r;

// ---------------------------------------------------------------- figure: the cafés’ monthly averages
const f1 = (x) => Math.round(x * 10) / 10;
function monthlyFigure() {
  const X = (v) => 70 + (v - 80) * 2.6, Y = (v) => 250 - (v - 2.8) * 64;
  let svg = '<svg viewBox="0 0 640 300" xmlns="http://www.w3.org/2000/svg" font-size="11" fill="currentColor">';
  svg += '<line x1="60" x2="620" y1="255" y2="255" stroke="var(--ink-3)"/><line x1="60" x2="60" y1="20" y2="255" stroke="var(--ink-3)"/>';
  [100, 150, 200, 250].forEach((v) => { svg += `<text x="${f1(X(v))}" y="270" text-anchor="middle" font-size="10" fill="var(--ink-3)">${v}</text>`; });
  [3, 4, 5, 6].forEach((v) => { svg += `<text x="54" y="${f1(Y(v)) + 4}" text-anchor="end" font-size="10" fill="var(--ink-3)">$${v}.00</text>`; });
  MEANS.forEach((p) => {
    if (p.cafe === 'Harbourside') svg += `<circle cx="${f1(X(p.f))}" cy="${f1(Y(p.a))}" r="5" fill="var(--series-1)"/>`;
    else svg += `<rect x="${f1(X(p.f)) - 4.5}" y="${f1(Y(p.a)) - 4.5}" width="9" height="9" fill="var(--series-2)"/>`;
  });
  svg += `<text x="${f1(X(150))}" y="${f1(Y(5.85))}" text-anchor="middle">Harbourside (circles): r = ${ecoH.toFixed(2)}</text>`;
  svg += `<text x="${f1(X(215))}" y="${f1(Y(3.62))}" text-anchor="middle">Millbrook (squares): r = ${ecoM.toFixed(2)}</text>`;
  svg += `<text x="${f1(X(200))}" y="${f1(Y(4.55))}" text-anchor="middle" fill="var(--ink-3)">All 20 points together: r = −${Math.abs(ecoR).toFixed(2)}</text>`;
  svg += `<text x="${f1(X(175))}" y="292" text-anchor="middle" font-size="10" fill="var(--ink-3)">Mean daily footfall in the month</text>`;
  svg += '<text x="16" y="138" text-anchor="middle" font-size="10" fill="var(--ink-3)" transform="rotate(-90 16 138)">Mean average ticket</text>';
  return `${svg}</svg>`;
}

export default {
  slug: 'groups-and-simpsons-paradox',
  title: 'Groups and Simpson’s paradox',
  blurb: 'Busier days go with bigger tickets in each of Lantern’s cafés, yet the two cafés pooled say the opposite. Learn why combining groups can reverse, create or inflate a correlation, why correlations of averages are not correlations of individuals, and what to report.',
  status: 'draft',
  objectives: [
    'Calculate a correlation for pooled data and within each group, and recognise Simpson’s paradox when the two disagree in sign.',
    'Explain a reversal by a third variable whose groups differ in both x and y, using group means and a scatterplot coloured by group.',
    'Calculate the within-group and between-group parts of a sum of products, and the pooled within-group correlation.',
    'Distinguish an ecological correlation between group averages from a correlation between individuals, and recognise the ecological fallacy.',
    'Decide which correlation answers a given question and write up grouped data with both the within-group and pooled results.',
  ],
  prerequisites: [
    { lesson: 'b05/covariance-and-pearson', why: 'Covariance as a sum of products of deviations from the means, which this lesson splits into parts.' },
    { lesson: 'b05/scatterplots', why: 'Plotting one group at a time and colouring points by group.' },
    { lesson: 'b05/outliers-and-influence', why: 'How a few points far from the rest can move r; here whole groups do.' },
    { lesson: 'b01/interpreting-results', why: 'Simpson’s paradox and confounding variables, met there with proportions.' },
  ],
  case: 'lantern',

  concept: [
    { case: 'Ana wonders whether busy days are good for the average ticket (sales divided by transactions). If busier mornings mean rushed customers who buy only a coffee, she might push pastries harder on quiet days; if busy days bring groups who add food, she might do the opposite. Across all 612 café-days, footfall and the average ticket have r = −0.324: busier days go with smaller tickets.' },

    { h: 'The same data, split by café' },
    { p: 'Before acting, Ana splits the data by café. At Harbourside, footfall and the average ticket have r = 0.735; at Millbrook, r = 0.517. In both cafés, busier days go with larger tickets. Pooled, the relationship is negative. The two answers can’t both describe what happens on a busy day, and the reason is in the cafés’ averages.' },
    { table: {
      caption: 'Footfall and average ticket by café, March–December 2027',
      head: ['Café', 'Days', 'Mean footfall', 'Mean ticket', 'Ticket range', 'r (within café)'],
      align: ['l', 'r', 'r', 'r', 'l', 'r'],
      rows: [
        ['Harbourside', '306', '139.7', '$5.34', '$4.34–$7.20', '0.735'],
        ['Millbrook', '306', '226.3', '$3.27', '$2.41–$4.09', '0.517'],
        ['Both, pooled', '612', '183.0', '$4.31', '$2.41–$7.20', '−0.324'],
      ],
    } },
    { p: 'Millbrook, in the office district, has far more people through the door, and most of them buy a coffee on the way to work. Harbourside, on the waterfront, has fewer visitors who more often sit down with food. Every one of Millbrook’s 306 days has a smaller average ticket than every one of Harbourside’s. Pool the two, and the comparison that dominates is café against café, many visitors and small tickets against few visitors and large ones, which points downwards. Inside each café, busier days go with larger tickets (the case builds this in: busy days bring more groups and more add-ons).' },
    { p: 'This is <g>Simpson’s paradox</g>: a relationship that holds within each of several groups disappears or reverses when the groups are combined. B01 met it with proportions; here it appears in a correlation. It is not a trick of arithmetic or an error in the data. It arises whenever a third variable, here the café, differs between groups in both x and y.' },
    { callout: 'key', title: 'Plot by group before you pool', html: 'When the data come from groups that might differ (cafés, stores, regions, customer types, years), colour the scatterplot by group and compute r within each group as well as overall. If the group means sit in a different pattern from the points inside each group, the pooled correlation is mostly about the groups.' },

    { h: 'Averages are not individuals' },
    { p: 'Head office sees only monthly summaries. Averaging each café’s footfall and ticket by month gives 20 points, and their correlation is −0.797, much stronger than −0.324 for the days. Inside each café the monthly averages correlate positively (0.950 at Harbourside, 0.744 at Millbrook), but the gap between the cafés dominates even more once the daily noise has been averaged away.' },
    { figure: {
      svg: monthlyFigure(),
      caption: 'Each café’s ten monthly averages of footfall and average ticket. Within each café, busier months have larger tickets; across the two cafés, the busier café has the smaller tickets, so the 20 points together run downwards.',
      alt: 'A scatterplot of 20 points with mean daily footfall in the month from about 90 to 260 on the horizontal axis and the mean average ticket from $3.00 to $6.00 on the vertical axis. Ten circles for Harbourside lie between footfalls of about 92 and 187 and tickets of $5.15 to $5.55, rising gently to the right (r = 0.95). Ten squares for Millbrook lie between footfalls of about 179 and 257 and tickets of $3.17 to $3.35, also rising gently (r = 0.74). Because the squares sit to the right of and well below the circles, all 20 points together run downwards (r = −0.80).',
    } },
    { p: 'A correlation computed between group averages is an <g>ecological correlation</g>. It answers a question about groups (do busier café-months have smaller tickets?), and it can differ from the correlation between individuals in size and even in sign. Reading an ecological correlation as if it described each individual is the <g>ecological fallacy</g>.' },
  ],

  theory: [
    { h: 'Why combining groups can reverse a correlation' },
    { p: 'Covariance, and so r, is built from products of deviations from the overall means. When the data come in groups, each deviation splits into two parts: how far the point is from its own group’s mean, and how far its group’s mean is from the overall mean. The sum of products splits the same way, with no cross term left over:' },
    { math: String.raw`\sum_i (x_i - \bar{x})(y_i - \bar{y}) = \underbrace{\sum_g \sum_{i \in g} (x_i - \bar{x}_g)(y_i - \bar{y}_g)}_{\text{within groups}} + \underbrace{\sum_g n_g (\bar{x}_g - \bar{x})(\bar{y}_g - \bar{y})}_{\text{between groups}}` },
    { p: 'For footfall and the average ticket, the total sum of products is −18,684.6. The within-café part is +8,845.3: inside each café, busier days go with larger tickets. The between-café part is −27,529.9: Millbrook’s mean footfall is 43.3 people above the overall mean and its mean ticket $1.04 below, Harbourside’s the reverse, and with 306 days each these two terms outweigh everything inside the cafés. The pooled correlation is negative because the between-groups part wins.' },
    { p: String.raw`The within part, divided by the within-group sums of squares, gives the <g>within-group correlation</g>: <m>r_W = 8{,}845.3 \div \sqrt{3{,}491{,}519 \times 58.73} = 0.618</m>. It is the correlation of days after each café’s own means have been subtracted, a single answer to “inside a café, do busier days have larger tickets?”. It lies between the two cafés’ own correlations, 0.517 and 0.735.` },
    { callout: 'note', title: 'What makes a reversal possible', html: 'A reversal needs the groups to differ in both x and y, in a direction opposite to the relationship inside them, and by enough to outweigh it. If the cafés had the same mean footfall, or the same mean ticket, the between part would be zero and the pooled correlation would be the within-group one, diluted. The bigger the gap between groups compared with the spread inside them, the more the pooled r reflects the groups.' },

    { h: 'It works in both directions' },
    { p: 'Pooling can strengthen a correlation as well as reverse it. Inside Millbrook, footfall and the average ticket have r = 0.247 on weekdays and 0.128 at weekends. Together, Millbrook’s 306 days give 0.517, stronger than either. Weekdays are both busier (272 visitors on average against 110) and have slightly larger tickets ($3.35 against $3.05), so the gap between weekdays and weekends lines up with the relationship inside them and adds to it. Each weekday and weekend group also spans a narrower range of footfall, which shrinks its own r, as the previous lesson showed.' },
    { p: 'Pooling can also create a correlation where there is none inside any group, whenever groups differ in both variables. And splitting can go on: weekday and weekend inside each café, or month inside each of those. There is no “true” level of splitting; the right level is set by the question being asked.' },

    { h: 'Ecological correlations' },
    { p: 'Averaging within groups removes the variation inside them, so an ecological correlation usually looks stronger than the correlation of the individuals behind it: the 20 café-month averages give −0.797 against −0.324 for the 612 days. Temperature and iced share show the same effect without any reversal: 0.940 across café-days, 0.986 across café-month averages. A strong ecological correlation is accurate about groups and says much less about the individuals in them.' },
    { p: 'The classic warning is Robinson’s (1950) analysis of the 1930 US census, as reported by Subramanian and colleagues (2009). Across individuals, being born abroad and being unable to read had a small positive correlation (r = 0.12); across states, the share of residents born abroad and the share unable to read had a negative correlation (r = −0.53), because immigrants had settled mostly in states where literacy was high. Inferring individual behaviour from the state figures would have got the sign wrong.' },
    { p: 'Ecological correlations are not useless. They are the right tool for questions about groups (should Lantern open its next café in an office district or on the waterfront?) and often the only data available. The error is in moving from groups to individuals without saying so.' },

    { h: 'Finding the groups' },
    { p: 'Groups are not always labelled in the data you are handed. Three places to look: categorical columns that are already there (café, region, channel, customer type, weekday or weekend); time (months, seasons, before and after a price change, which can act like groups); and the scatterplot itself, where separate clouds, or a cloud with a gap in it, often mean a grouping that nobody recorded. In Lantern’s log the café column is there, but a pooled scatterplot of footfall against ticket would show two clouds even without it.' },
    { p: 'When you find a grouping, compare three things: the group means of x and y, the correlation inside each group, and the pooled correlation. If the group means line up with the within-group pattern, pooling strengthens it; if they run against it, pooling weakens or reverses it; if they differ on only one variable, pooling dilutes it. The decomposition in the formula card turns that comparison into numbers.' },
    { p: 'Choose the grouping before you compute, from what you know about the business, not by trying splits until one gives an interesting answer. Splitting the log by café is obvious to anyone who knows Lantern has two very different cafés; splitting it by the day of the month would be a search for patterns, with the many-tests problem that module 4 deals with.' },
    { h: 'Which correlation answers the question?' },
    { list: [
      '<b>A question about days, customers or transactions inside a unit</b> (“on a busy morning at a given café, does the ticket go up?”): use the within-group correlations, each café’s own or the pooled within-group r.',
      '<b>A question about the units themselves</b> (“do busier cafés have smaller tickets?”): use the group means, and say how many groups there are. With two cafés there are only two points, which can’t support a correlation at all.',
      '<b>A question about the whole business</b> (“across all our café-days, what goes with what?”): the pooled correlation describes it, but report the group means and within-group correlations beside it, because the pooled r mixes two different relationships.',
    ] },
    { p: 'The groups that matter are not always recorded. A reversal needs a third variable that differs between groups; if that variable isn’t in the data, no amount of splitting can find it. When the groups are known, partial correlation (module 4) offers another way to hold a third variable fixed, and the correlation-and-causation lesson discusses confounding in general.' },
  ],

  formulas: [
    { id: 'simp-split', name: 'Within-group and between-group sums of products',
      tex: String.raw`\sum_i (x_i - \bar{x})(y_i - \bar{y}) = \sum_g \sum_{i \in g} (x_i - \bar{x}_g)(y_i - \bar{y}_g) + \sum_g n_g (\bar{x}_g - \bar{x})(\bar{y}_g - \bar{y})`,
      where: [[String.raw`x_i, y_i`, 'Observation i’s values', 'units of x, y'], [String.raw`\bar{x}, \bar{y}`, 'Overall means of all observations', 'units of x, y'], [String.raw`\bar{x}_g, \bar{y}_g`, 'Means of group g', 'units of x, y'], [String.raw`n_g`, 'Number of observations in group g', ''], [String.raw`g`, 'The groups (cafés, stores, regions …)', '']],
      assumptions: 'An identity: it holds for any data split into groups.',
      note: 'Divide each part by n − 1 to split the covariance. When the between-groups part has the opposite sign and is larger, the pooled correlation reverses.' },
    { id: 'simp-within-r', name: 'Pooled within-group correlation',
      tex: String.raw`r_W = \dfrac{\sum_g \sum_{i \in g} (x_i - \bar{x}_g)(y_i - \bar{y}_g)}{\sqrt{\sum_g \sum_{i \in g} (x_i - \bar{x}_g)^2 \;\sum_g \sum_{i \in g} (y_i - \bar{y}_g)^2}}`,
      where: [[String.raw`r_W`, 'Correlation within groups, with each group’s own means removed', ''], [String.raw`x_i, y_i`, 'Observation i’s values', 'units of x, y'], [String.raw`\bar{x}_g, \bar{y}_g`, 'Means of the group observation i belongs to', 'units of x, y'], [String.raw`g`, 'The groups', '']],
      note: 'It is Pearson’s r of the deviations from the group means. It summarises the groups’ own correlations in one figure; still report each group’s r if they differ.' },
    { id: 'simp-eco', name: 'Ecological correlation',
      tex: String.raw`r_{\text{eco}} = r\left(\bar{x}_g,\; \bar{y}_g\right)`,
      where: [[String.raw`r_{\text{eco}}`, 'Pearson’s r computed across groups', ''], [String.raw`\bar{x}_g, \bar{y}_g`, 'Each group’s mean of x and of y', 'units of x, y']],
      assumptions: 'Describes groups. It need not equal, or even share a sign with, the correlation between individuals.',
      note: 'Usually stronger than the individual-level r, because averaging removes the variation inside groups.' },
  ],

  examples: [
    { level: 'simple', title: 'Two bookshops, one reversal', fictional: true,
      setup: 'Tidewater Books has a city-centre branch and an airport branch. For six days at each, it recorded footfall and the average basket. City: footfall 310, 325, 340, 355, 370, 385; basket $12.10, $12.60, $12.40, $13.30, $13.50, $13.90. Airport: footfall 110, 125, 140, 155, 170, 185; basket $24.80, $25.90, $25.50, $26.60, $27.00, $27.60. Does a busier day go with a bigger or smaller basket?',
      steps: [
        'Within each branch: city r = 0.958, airport r = 0.956. In both, busier days go with bigger baskets.',
        'Pooled, the twelve days give r = −0.934: busier days go with much smaller baskets.',
        'Group means: the city branch averages 347.5 visitors and a $12.97 basket; the airport 147.5 visitors and a $26.23 basket. The busier branch has the far smaller basket, and with only six days each and little spread inside each branch, that gap dominates the pooled figure.',
      ],
      answer: 'At each branch, busier days go with bigger baskets (r ≈ 0.96). The pooled r of −0.934 compares the branches, not days.',
      interpretation: 'For staffing a branch on a busy day, the within-branch result is the relevant one. The pooled result answers a different question, whether the busier branch sells smaller baskets, and with two branches that is a comparison of two numbers, not a correlation. Travellers buying gifts and city commuters buying a paperback are different customers: the branch is the third variable.' },
    { level: 'challenging', title: 'Splitting Lantern’s sum of products', fictional: true,
      setup: 'Across 612 café-days, footfall and the average ticket have r = −0.324, while each café’s own r is positive. Split the sum of products into within-café and between-café parts, and calculate the pooled within-café correlation.',
      steps: [
        'Means: overall footfall 183.0 and ticket $4.31; Harbourside 139.7 and $5.34; Millbrook 226.3 and $3.27.',
        String.raw`Between cafés: <m>306 \times (139.7 - 183.0) \times (5.34 - 4.31) + 306 \times (226.3 - 183.0) \times (3.27 - 4.31)</m> with unrounded means is −27,529.9. Each café contributes about half: one is below average on footfall and above on ticket, the other the reverse, so both products are negative.`,
        'Within cafés: the sums of products of deviations from each café’s own means are +5,240.6 at Harbourside and +3,604.8 at Millbrook, +8,845.3 in all.',
        'Total: 8,845.3 − 27,529.9 = −18,684.6, the sum of products for all 612 days around the overall means. The between part is about three times the within part, and opposite in sign.',
        String.raw`Within-café correlation: the within-café sums of squares are 3,491,519 for footfall and 58.73 for the ticket, so <m>r_W = 8{,}845.3 \div \sqrt{3{,}491{,}519 \times 58.73} = 0.618</m>.`,
      ],
      answer: 'Sum of products: within cafés +8,845.3, between cafés −27,529.9, total −18,684.6. The pooled within-café correlation is 0.618.',
      interpretation: 'The negative pooled r comes entirely from the difference between the cafés. Inside a café, footfall and the average ticket move together (r_W = 0.618), and that is the figure for questions about busy days. The split also shows what would make the paradox vanish: if the two cafés had the same mean ticket, the between part would be zero.' },
    { level: 'applied', title: 'What should Ana tell the managers?', fictional: true,
      setup: 'Head office’s monthly dashboard shows each café’s average footfall and ticket by month; across the 20 café-months they have r = −0.80. A consultant tells Ana: “Crowds kill your ticket. On busy days, push pastries harder.” What should Ana conclude, and what should she report?',
      steps: [
        'Identify the level: the dashboard’s 20 points are café-month averages, so −0.80 is an ecological correlation, about groups of days.',
        'Look inside the groups: within each café the monthly averages have r = 0.95 (Harbourside) and 0.74 (Millbrook), and the daily data r = 0.735 and 0.517. Busier months and busier days go with larger tickets inside each café.',
        'Find the third variable: the café. Millbrook’s customers buy smaller tickets and come in larger numbers; the negative figure compares the cafés.',
        'Write it down: “Inside each café, busier days go with larger average tickets (r = 0.73 at Harbourside, 0.52 at Millbrook, 2027). Across cafés, Millbrook is busier and has smaller tickets, which is why the combined monthly figures run the other way (r = −0.80).”',
      ],
      answer: 'The consultant has committed the ecological fallacy. Inside each café, busy days go with larger tickets, not smaller ones; the −0.80 compares Millbrook with Harbourside.',
      interpretation: 'There is no evidence that crowds lower the ticket on a given day, so a busy-day pastry push can’t be justified by this figure. A sensible next step is to test a pastry offer on a few days at each café and compare tickets, which the correlation-and-causation lesson discusses. And dashboards that mix cafés should show each café separately, or at least label which comparison a figure makes.' },
  ],

  demo: [
    { widget: 'simp-scatter', intro: 'Footfall against average ticket for all 612 café-days, pooled: r = −0.324. Colour by café and read each café’s own r (0.735 and 0.517). Then turn on the least-squares line: it runs downwards from one café’s cloud to the other’s, across two clouds that each rise.' },
    { widget: 'simp-monthly', intro: 'The cafés’ monthly averages, as head office sees them: 20 points with r = −0.797. Colour by café to see each café’s ten months rise together, and notice that averaging has made every relationship look tighter than the daily one.' },
    { widget: 'simp-sheet', intro: 'Two weeks of both cafés, 3–16 May. G1 gives the pooled r, G2 and G3 each café’s own, and G5:H6 each café’s means. Change one café’s tickets (say, add $2 to every Millbrook ticket in D16:D29) and watch the pooled r change sign while the cafés’ own correlations stay where they were.' },
  ],

  mistakes: [
    { title: '“The correlation across all our data is the real one; splitting is cherry-picking.”', html: 'Pooled data mix the relationship inside groups with the difference between them. When groups differ in both variables, the pooled r can reverse the relationship inside every group. Report both and say which answers the question; splitting by a variable chosen before looking at the results is good practice, not cherry-picking.' },
    { title: '“Busier cafés have smaller tickets, so busy days lower the ticket.”', html: 'That moves from groups to individuals: the ecological fallacy. Across the cafés the busier one has smaller tickets; inside each café, busier days have larger ones. Answer questions about days with day-level data inside each café.' },
    { title: '“With 20 monthly points, r = −0.80 is strong evidence.”', html: 'An ecological correlation is usually stronger than the individual-level one because averaging removes the variation inside groups, and here it is driven by two cafés. Twenty averages from two cafés are closer to two points than to twenty independent observations.' },
    { title: '“Simpson’s paradox only happens with percentages.”', html: 'It happens with any measure of association: proportions, means, correlations, slopes. Whenever a third variable differs between groups in both x and y, pooling can reverse, create or inflate a correlation.' },
    { title: '“If I split by enough variables, I will find the true correlation.”', html: 'Every split answers a different question, and splitting by many variables in search of a pattern is a multiple-testing problem (module 4). Choose the grouping from the question and from what is known about the business, before computing.' },
  ],

  application: [
    { case: 'Ana’s note to her managers: “Inside each café, busier days go with larger average tickets: r = 0.73 at Harbourside and 0.52 at Millbrook across 2027. Millbrook is busier and has smaller tickets, so the two cafés together show the opposite (r = −0.32). Please don’t read the combined monthly dashboard as a statement about busy days; from next month it shows each café on its own line.”' },
    { p: 'Her note shows the habits that keep grouped data honest. She leads with the correlation that answers the managers’ question, which is about days inside their own café. She gives the pooled figure too, so nobody who sees it elsewhere thinks it was hidden, and she names the third variable that explains the difference. And she fixes the dashboard so that the misleading comparison doesn’t keep arriving every month.' },
    { p: 'The same structure turns up across business analytics. Store-level data pool stores of different sizes and locations; customer data pool segments that differ in income and habit; data across years pool periods with different prices. A chain whose larger stores have lower margins may find that within every store, busier weeks have higher margins; a lender whose regions with more applications approve fewer may find the opposite inside each region. In each case the first step is the same: plot by group, compute within-group and pooled correlations, and compare the group means.' },
    { p: 'When summaries are all you have, say so. A correlation between regional averages, monthly figures or store totals is a statement about regions, months or stores. It can guide decisions about those units, such as where to open, what to stock, which months to staff, but it should not be repeated as a fact about individual customers or days without data at that level.' },
  ],

  summary: [
    'Pooled data can show the opposite of every group: footfall and average ticket have r = −0.324 across both cafés but 0.735 at Harbourside and 0.517 at Millbrook. This is Simpson’s paradox.',
    'It happens when a third variable (the café) differs between groups in both x and y: Millbrook has more visitors (226 against 140) and smaller tickets ($3.27 against $5.34).',
    'The sum of products splits exactly into within-group and between-group parts (+8,845.3 and −27,529.9 here); the pooled r is negative because the between part wins. The pooled within-group r is 0.618.',
    'Pooling can also create or strengthen a correlation: Millbrook’s weekdays (0.247) and weekends (0.128) combine to 0.517.',
    'A correlation between group averages is ecological (−0.797 across 20 café-months). It describes groups, is usually stronger than the individual-level r, and can differ in sign; reading it as a fact about individuals is the ecological fallacy.',
    'Choose the correlation that matches the question, plot by group before pooling, and report within-group and pooled results together with the group means.',
  ],

  glossary: [
    { term: 'Within-group correlation', def: 'The correlation between two variables measured inside groups, after each group’s own means have been subtracted, so that differences between the groups play no part.' },
    { term: 'Ecological correlation', def: 'A correlation computed between group averages or rates, such as cafés’ monthly means or regions’ percentages, rather than between individual observations.' },
    { term: 'Ecological fallacy', def: 'The error of assuming that a characteristic of a group or area, such as a neighbourhood’s geodemographic type or average income, holds for each individual in it.' },
    { term: 'Pooled data', def: 'Observations from several groups combined into one dataset and analysed together, ignoring which group each came from.' },
  ],

  references: [
    { text: 'Malinas, G. &amp; Bigelow, J. (2004). “Simpson’s Paradox”. <i>Stanford Encyclopedia of Philosophy</i> (Spring 2006 Edition), ed. E. N. Zalta.', url: 'https://plato.stanford.edu/archives/spr2006/entries/paradox-simpson/', checked: '2026-10-26' },
    { text: 'Subramanian, S. V., Jones, K., Kaddour, A. &amp; Krieger, N. (2009). “Revisiting Robinson: the perils of individualistic and ecologic fallacy”. <i>International Journal of Epidemiology</i>, 38(2), 342–360.', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC2663721/', checked: '2026-10-26' },
    { text: 'Holmes, A., Illowsky, B. &amp; Dean, S. (2023). <i>Introductory Business Statistics 2e</i>, section 13.1, “The Correlation Coefficient r”. OpenStax.', url: 'https://openstax.org/books/introductory-business-statistics-2e/pages/13-1-the-correlation-coefficient-r', checked: '2026-10-26' },
  ],

  checks: [
    // the paradox
    { what: 'Pooled r', value: D.footTicket.r, shown: -0.324, tol: 0.0005 },
    { what: 'Pooled r (2 dp)', value: D.footTicket.r, shown: -0.32 },
    { what: 'Harbourside r', value: D.footTicketH.r, shown: 0.735, tol: 0.0005 },
    { what: 'Harbourside r (2 dp)', value: D.footTicketH.r, shown: 0.73 },
    { what: 'Millbrook r', value: D.footTicketM.r, shown: 0.517, tol: 0.0005 },
    { what: 'Millbrook r (2 dp)', value: D.footTicketM.r, shown: 0.52 },
    { what: 'Days', value: n, shown: 612 },
    { what: 'Harbourside days', value: GH.n, shown: 306 },
    { what: 'Millbrook days', value: GM.n, shown: 306 },
    { what: 'Mean footfall H', value: D.meanFootfallH, shown: 139.7, tol: 0.05 },
    { what: 'Mean footfall M', value: D.meanFootfallM, shown: 226.3, tol: 0.05 },
    { what: 'Mean footfall H (0 dp)', value: D.meanFootfallH, shown: 140, tol: 0.5 },
    { what: 'Mean footfall M (0 dp)', value: D.meanFootfallM, shown: 226, tol: 0.5 },
    { what: 'Mean ticket H', value: D.meanTicketH, shown: 5.34 },
    { what: 'Mean ticket M', value: D.meanTicketM, shown: 3.27 },
    { what: 'Overall mean footfall', value: mx, shown: 183.0, tol: 0.05 },
    { what: 'Overall mean ticket', value: my, shown: 4.31 },
    { what: 'H ticket min', value: Math.min(...GH.ys), shown: 4.34 },
    { what: 'H ticket max', value: Math.max(...GH.ys), shown: 7.20 },
    { what: 'M ticket min', value: Math.min(...GM.ys), shown: 2.41 },
    { what: 'M ticket max', value: Math.max(...GM.ys), shown: 4.09 },
    { what: 'Every Millbrook ticket below every Harbourside ticket', value: Number(Math.max(...GM.ys) < Math.min(...GH.ys)), shown: 1 },
    { what: 'Footfall gap M above mean', value: GM.mx - mx, shown: 43.3, tol: 0.05 },
    { what: 'Ticket gap M below mean', value: my - GM.my, shown: 1.04 },
    // decomposition
    { what: 'Total SP', value: spTotal, shown: -18684.6, tol: 0.05 },
    { what: 'Within SP', value: spWithin, shown: 8845.3, tol: 0.05 },
    { what: 'Between SP', value: spBetween, shown: -27529.9, tol: 0.05 },
    { what: 'Split adds up', value: spWithin + spBetween, shown: spTotal, tol: 1e-6 },
    { what: 'H within SP', value: GH.spW, shown: 5240.6, tol: 0.05 },
    { what: 'M within SP', value: GM.spW, shown: 3604.8, tol: 0.05 },
    { what: 'Between about three times within', value: Math.abs(spBetween) / spWithin, shown: 3, tol: 0.15 },
    { what: 'Within SS footfall', value: GH.ssx + GM.ssx, shown: 3491519, tol: 0.5 },
    { what: 'Within SS ticket', value: GH.ssy + GM.ssy, shown: 58.73 },
    { what: 'Pooled within r', value: rWithin, shown: 0.618, tol: 0.0005 },
    { what: 'Pooled within r by the rounded arithmetic', value: 8845.3 / Math.sqrt(3491519 * 58.73), shown: 0.618, tol: 0.0005 },
    { what: 'Each café contributes about half of the between part', value: (306 * (GH.mx - mx) * (GH.my - my)) / spBetween, shown: 0.5, tol: 0.02 },
    { what: 'Spearman pooled (widget)', value: rhoAll, shown: -0.199, tol: 0.0005 },
    { what: 'Spearman H (widget)', value: rhoH, shown: 0.581, tol: 0.0005 },
    { what: 'Spearman M (widget)', value: rhoM, shown: 0.469, tol: 0.0005 },
    // ecological
    { what: 'Café-months', value: MEANS.length, shown: 20 },
    { what: 'Ecological r', value: ecoR, shown: -0.797, tol: 0.0005 },
    { what: 'Ecological r (2 dp)', value: ecoR, shown: -0.80, tol: 0.005 },
    { what: 'Ecological H', value: ecoH, shown: 0.950, tol: 0.0005 },
    { what: 'Ecological H (2 dp)', value: ecoH, shown: 0.95 },
    { what: 'Ecological M', value: ecoM, shown: 0.744, tol: 0.0005 },
    { what: 'Ecological M (2 dp)', value: ecoM, shown: 0.74 },
    { what: 'Monthly temp–iced', value: ecoTemp, shown: 0.986, tol: 0.0005 },
    { what: 'Daily temp–iced', value: D.tempIced.r, shown: 0.940, tol: 0.0005 },
    { what: 'Figure: H monthly footfall low', value: Math.min(...MEANS.filter((p) => p.cafe === 'Harbourside').map((p) => p.f)), shown: 92, tol: 0.5 },
    { what: 'Figure: H monthly footfall high', value: Math.max(...MEANS.filter((p) => p.cafe === 'Harbourside').map((p) => p.f)), shown: 187, tol: 0.5 },
    { what: 'Figure: H monthly ticket low', value: Math.min(...MEANS.filter((p) => p.cafe === 'Harbourside').map((p) => p.a)), shown: 5.15, tol: 0.03 },
    { what: 'Figure: H monthly ticket high', value: Math.max(...MEANS.filter((p) => p.cafe === 'Harbourside').map((p) => p.a)), shown: 5.55 },
    { what: 'Figure: M monthly footfall low', value: Math.min(...MEANS.filter((p) => p.cafe === 'Millbrook').map((p) => p.f)), shown: 179, tol: 0.5 },
    { what: 'Figure: M monthly footfall high', value: Math.max(...MEANS.filter((p) => p.cafe === 'Millbrook').map((p) => p.f)), shown: 257, tol: 0.5 },
    { what: 'Figure: M monthly ticket low', value: Math.min(...MEANS.filter((p) => p.cafe === 'Millbrook').map((p) => p.a)), shown: 3.17 },
    { what: 'Figure: M monthly ticket high', value: Math.max(...MEANS.filter((p) => p.cafe === 'Millbrook').map((p) => p.a)), shown: 3.35 },
    // Millbrook weekdays and weekends
    { what: 'Millbrook weekday r', value: rWd, shown: 0.247, tol: 0.0005 },
    { what: 'Millbrook weekend r', value: rWe, shown: 0.128, tol: 0.0005 },
    { what: 'Weekday mean footfall', value: mean(MWD.x), shown: 272, tol: 0.5 },
    { what: 'Weekend mean footfall', value: mean(MWE.x), shown: 110, tol: 0.5 },
    { what: 'Weekday mean ticket', value: mean(MWD.y), shown: 3.35 },
    { what: 'Weekend mean ticket', value: mean(MWE.y), shown: 3.05 },
    // Tidewater (fictional)
    { what: 'Tidewater city r', value: tCity, shown: 0.958, tol: 0.0005 },
    { what: 'Tidewater airport r', value: tAir, shown: 0.956, tol: 0.0005 },
    { what: 'Tidewater ≈ 0.96', value: (tCity + tAir) / 2, shown: 0.96, tol: 0.005 },
    { what: 'Tidewater pooled r', value: tPool, shown: -0.934, tol: 0.0005 },
    { what: 'City mean footfall', value: mean(CX), shown: 347.5 },
    { what: 'City mean basket', value: mean(CY), shown: 12.97 },
    { what: 'Airport mean footfall', value: mean(AX), shown: 147.5 },
    { what: 'Airport mean basket', value: mean(AY), shown: 26.23 },
  ],
};
