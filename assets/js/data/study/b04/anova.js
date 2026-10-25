// anova.js — B04 · One-way analysis of variance. Content only; exercises are in anova.ex.js. Uses the 2026 catering
// events' invoice per guest-day by event type (PER_GUEST_BY_TYPE; DERIVED.eventTypes.anova) and the events' clients
// and hours (EVENTS). Welch's ANOVA, the Kruskal–Wallis test and the pairwise Welch t tests are worked here from the
// data with core/inference.js (anovaWelch, kruskal, tTest2), tested against SciPy; the engine has no Tukey HSD. The bike-share
// scheme and the helpline are fictional. Every printed figure is recomputed in `checks`.
import { PER_GUEST_BY_TYPE, EVENT_TYPES, EVENTS, EVENT_COLUMNS, DERIVED as D } from './case.js?v=14';
import * as I from '../../../core/inference.js?v=14';
import { mean, variance } from '../../../core/stats.js?v=14';

// ---------------------------------------------------------------- Lantern's event types
const AN = D.eventTypes.anova;
const G = EVENT_TYPES.map((t) => PER_GUEST_BY_TYPE[t]);
const T = Object.fromEntries(EVENT_TYPES.map((t, i) => [t, i]));
const SDS = AN.vars.map(Math.sqrt);
const sum = (a) => a.reduce((s, x) => s + x, 0);
const allValues = G.flat();
const WELCH = I.anovaWelch(G), KW = I.kruskal(G);
const PAIRS = [];
EVENT_TYPES.forEach((a, i) => EVENT_TYPES.slice(i + 1).forEach((b) => PAIRS.push({ a, b, ...I.tTest2(PER_GUEST_BY_TYPE[a], PER_GUEST_BY_TYPE[b]) })));
const byP = [...PAIRS].sort((x, y) => x.p - y.p);
const LT = PAIRS.find((x) => x.a === 'Launch' && x.b === 'Team day');
const col = (name) => EVENTS.map((r) => r[EVENT_COLUMNS.indexOf(name)]);
const clients = col('client'), types = col('event_type'), hours = col('hours');
const nClients = new Set(clients).size;
const harborTech = clients.filter((c) => c === 'Harbor Tech').length;
const maxClientEvents = Math.max(...[...new Set(clients)].map((c) => clients.filter((x) => x === c).length));
const meanHours = (t) => mean(hours.filter((_, i) => types[i] === t));
const sortedMeeting = [...PER_GUEST_BY_TYPE.Meeting].sort((a, b) => a - b);
const sdRatio = Math.max(...SDS) / Math.min(...SDS);
const FWER10 = 1 - 0.95 ** 10;

// ---------------------------------------------------------------- the bike-share scheme (fictional)
const BIKE = { Harbour: [22, 25, 28, 24, 26], Market: [30, 27, 33, 31, 29], 'Station Square': [26, 24, 29, 23, 28] };
const BG = Object.values(BIKE);
const BK = I.anova1(BG);
const dev = (g) => g.map((x) => x - mean(g));
const ssOf = (g) => sum(dev(g).map((d) => d * d));
const spread3 = BG.map((g) => g.map((x) => mean(g) + 3 * (x - mean(g))));
const BK3 = I.anova1(spread3);

// ---------------------------------------------------------------- the helpline (fictional), summary statistics only
const HL = { n: [20, 25, 18, 22], m: [6.2, 6.9, 7.4, 6.5], s: [1.4, 1.6, 1.5, 1.3] };
const HN = sum(HL.n), HGM = sum(HL.n.map((n, i) => n * HL.m[i])) / HN;
const HSSB = sum(HL.n.map((n, i) => n * (HL.m[i] - HGM) ** 2)), HSSW = sum(HL.n.map((n, i) => (n - 1) * HL.s[i] ** 2));
const HMSB = HSSB / 3, HMSW = HSSW / (HN - 4), HF = HMSB / HMSW;
const HCA = (() => { const q1 = HL.s[2] ** 2 / HL.n[2], q2 = HL.s[0] ** 2 / HL.n[0], se = Math.sqrt(q1 + q2), t = (HL.m[2] - HL.m[0]) / se, df = (q1 + q2) ** 2 / (q1 * q1 / (HL.n[2] - 1) + q2 * q2 / (HL.n[0] - 1)); return { t, df, p: 2 * I.tSf(Math.abs(t), df) }; })();

// ---------------------------------------------------------------- formatting and figure
const f1 = (x) => Math.round(x * 10) / 10;
const fx = (v, d = 2) => v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
const sig = (v, k = 6) => String(Number(v.toPrecision(k)));
function spreadFigure() {
  const Y = (v) => 250 - ((v - 14) / 26) * 200;
  const names = ['Harbour', 'Market', 'Station Sq.'];
  let s = '<svg viewBox="0 0 640 300" xmlns="http://www.w3.org/2000/svg" font-size="12" fill="currentColor">';
  [[0, BG, BK, 'As recorded'], [320, spread3, BK3, 'Three times the spread']].forEach(([x0, groups, res, title]) => {
    const L = x0 + 44, R = x0 + 300;
    s += `<text x="${x0 + 172}" y="18" text-anchor="middle" font-size="12">${title}: F = ${res.F.toFixed(2)}, p = ${res.p.toFixed(3)}</text>`;
    s += `<line x1="${L}" x2="${L}" y1="${Y(40)}" y2="${Y(14)}" stroke="var(--ink)" stroke-width="1.2"/><line x1="${L}" x2="${R}" y1="${Y(14)}" y2="${Y(14)}" stroke="var(--ink)" stroke-width="1.2"/>`;
    for (let v = 15; v <= 40; v += 5) s += `<line x1="${L - 4}" x2="${L}" y1="${f1(Y(v))}" y2="${f1(Y(v))}" stroke="var(--ink)"/><text x="${L - 7}" y="${f1(Y(v)) + 4}" text-anchor="end" font-size="11" fill="var(--ink-3)">${v}</text>`;
    s += `<line x1="${L}" x2="${R}" y1="${f1(Y(27))}" y2="${f1(Y(27))}" stroke="var(--ink-3)" stroke-width="1.2" stroke-dasharray="5 4"/>`;
    groups.forEach((g, j) => {
      const cx = L + 50 + j * 80, m = mean(g);
      g.forEach((v, q) => { s += `<circle cx="${cx + (q % 2 ? 7 : -7)}" cy="${f1(Y(v))}" r="4" fill="var(--series-${j + 1})" opacity="0.9"/>`; });
      s += `<line x1="${cx - 22}" x2="${cx + 22}" y1="${f1(Y(m))}" y2="${f1(Y(m))}" stroke="var(--ink)" stroke-width="2.6"/>`;
      s += `<text x="${cx}" y="${Y(14) + 18}" text-anchor="middle" font-size="11" fill="var(--ink-3)">${names[j]}</text>`;
    });
  });
  s += '<text x="320" y="292" text-anchor="middle" font-size="11" fill="var(--ink-3)">Hire length (minutes). Solid bars: station means. Dashed line: grand mean, 27 minutes.</text>';
  return `${s}</svg>`;
}

export default {
  slug: 'anova',
  title: 'One-way analysis of variance (ANOVA)',
  blurb: 'Compare the means of several groups at once without inflating the chance of a false alarm. Split variation into between- and within-group parts, build the F statistic by hand and with Excel’s Anova: Single Factor, check the conditions, measure the effect with η², and find which groups differ with adjusted comparisons.',
  status: 'reviewed',
  objectives: [
    'Explain why comparing several means with a t test for every pair inflates the family-wise error rate, and calculate that rate.',
    'Calculate the between-group and within-group sums of squares, degrees of freedom, mean squares and F for a one-way ANOVA, by hand and with DEVSQ.',
    'Use Excel’s Anova: Single Factor and read its SUMMARY and ANOVA tables, finding p-values and critical values with F.DIST.RT and F.INV.RT.',
    'Assess the conditions of one-way ANOVA (independence, normality, equal variances) and choose a response when they fail, such as Welch’s ANOVA.',
    'Interpret a significant or non-significant F with η², identify which groups differ with Bonferroni-adjusted comparisons, and explain what Tukey’s HSD does.',
  ],
  prerequisites: [
    { lesson: 'b04/comparing-means', why: 'Two-sample t tests, the pooled variance and Welch’s test are what ANOVA extends to several groups.' },
    { lesson: 'b04/hypothesis-testing', why: 'Null hypotheses, p-values, α and the multiple-testing problem behind the family-wise error rate.' },
    { lesson: 'b04/proportions-and-chi-square', why: 'The chi-square distribution, which the F distribution is built from.' },
    { lesson: 'b04/describing-distributions', why: 'Sums of squares, DEVSQ and degrees of freedom.' },
    { lesson: 'b03/descriptive-statistics-and-regression', why: 'The Analysis ToolPak and Lantern’s catering events.' },
  ],
  case: 'lantern',

  concept: [
    { case: 'B03 fitted a line to Lantern’s catering invoices and found that Ana’s rule of “about $9 a head” misprices small and large events. Now she asks a different question of the same 76 events of 2026: does the kind of event matter? Measured as invoice per guest-day (a two-day event counts its guests twice), team days averaged $11.25, conferences $10.32, meetings $9.63, breakfasts $9.47 and launches $9.00. Are those real differences between kinds of event, or the scatter of individual events that any five groups would show?' },
    { p: 'This is a comparison of several means. <i>Comparing means</i> compared two with a t test. With five groups the obvious move, a t test for every pair, has a problem, and the standard solution, the <g>analysis of variance</g> (ANOVA), works by comparing two kinds of variation. This lesson covers one-way ANOVA, in which the groups are defined by one categorical variable, here the event type.' },

    { h: 'Why not ten t tests?' },
    { p: String.raw`Five event types make <m>5 \times 4 \div 2 = 10</m> pairs. Each t test at α = 0.05 has a 5% chance of a false alarm, a <g>Type I error</g>, when the two means are really equal. If the ten tests were independent, the chance of at least one false alarm among them would be <m>1 - 0.95^{10} \approx 0.40</m>. The tests share data, so they aren’t independent and the exact figure differs, but the point stands: the more tests, the likelier a spurious “significant” difference. The probability of at least one false positive in a set of tests is the <g>family-wise error rate</g>.` },
    { p: String.raw`ANOVA asks one question first, at one α. The <g>null hypothesis</g> is <m>H_0\colon \mu_1 = \mu_2 = \dots = \mu_k</m>, every group has the same population mean, against <m>H_1</m>, at least one mean differs. Only if the answer is yes does it make sense to ask which groups differ, with methods that keep the family-wise error rate under control.` },

    { h: 'Two kinds of variation' },
    { p: 'Each event’s invoice per guest-day differs from the mean of all 76 events, $9.86, for two reasons. Its type’s mean differs from the grand mean (team days are higher, launches lower), and the event itself differs from its type’s mean (one meeting earned $17.14 per guest-day, another $7.01). The first is <g>between-group variation</g>, the second <g>within-group variation</g>. If event type made no difference, the type means would scatter around the grand mean only as far as the within-group variation lets the means of groups of 11 to 28 events wander by chance.' },
    { figure: {
      svg: spreadFigure(),
      caption: `Five hire lengths at each of three docking stations of a bike-share scheme (fictional). Left, as recorded: the station means are far apart compared with the scatter within each station, so F is large (${BK.F.toFixed(2)}). Right, the same station means with every hire three times as far from its station’s mean: the same between-group variation is now small compared with the within-group variation, and F falls to ${BK3.F.toFixed(2)}.`,
      alt: `Two dot plots side by side, each with hire length in minutes from 15 to 40 on the vertical axis and three stations, Harbour, Market and Station Square, along the bottom. Each station has five dots and a solid bar at its mean: 25, 30 and 26 minutes. A dashed horizontal line marks the grand mean of 27 minutes. In the left panel the dots lie close to their station’s bar, within about 3 minutes; it is titled F = ${BK.F.toFixed(2)}, p = ${BK.p.toFixed(3)}. In the right panel the bars are at the same heights but the dots spread from about 16 to 39 minutes and overlap heavily between stations; it is titled F = ${BK3.F.toFixed(2)}, p = ${BK3.p.toFixed(3)}.`,
    } },
    { p: 'ANOVA turns the comparison into a ratio. The between-group variation, scaled to a variance, is the numerator; the within-group variation, pooled across the groups, is the denominator. If the null hypothesis is true both estimate the same quantity, the variance of individual values, so their ratio, the <g>F statistic</g>, should be near 1. A large F says the means are further apart than the scatter within the groups explains.' },
    { p: 'For Lantern’s event types, Excel’s Analysis ToolPak gives F = 2.75 with a p-value of 0.035: at the 5% level, evidence that the event types don’t all have the same mean invoice per guest-day. The rest of the lesson shows where those numbers come from, which conditions they rest on (here they need care), how big the differences are, and which types differ.' },
  ],

  theory: [
    { h: 'The one-way ANOVA model' },
    { p: String.raw`There are k groups. Group i has <m>n_i</m> observations with mean <m>\bar{x}_i</m> and sample variance <m>s_i^2</m>; there are <m>N = n_1 + \dots + n_k</m> observations in all, with grand mean <m>\bar{x}</m>. The model says each observation is its group’s population mean plus a random error, <m>x_{ij} = \mu_i + \varepsilon_{ij}</m>, where the errors are independent, normally distributed and have the same variance <m>\sigma^2</m> in every group. OpenStax lists the conditions the same way: normal populations, random and independent samples, equal standard deviations, a categorical factor and a numerical response.` },

    { h: 'Sums of squares' },
    { p: String.raw`ANOVA splits the total variation into its two parts. The total <g>sum of squares</g>, SST, adds up every observation’s squared distance from the grand mean. The sum of squares between groups, SSB, adds up each group mean’s squared distance from the grand mean, weighted by the group’s size. The sum of squares within groups, SSW, adds up every observation’s squared distance from its own group’s mean, which is the same as <m>\sum (n_i - 1) s_i^2</m>. The three always satisfy SST = SSB + SSW.` },
    { math: String.raw`\underbrace{\sum_{i}\sum_{j} (x_{ij} - \bar{x})^2}_{\text{SST}} = \underbrace{\sum_{i} n_i (\bar{x}_i - \bar{x})^2}_{\text{SSB}} + \underbrace{\sum_{i}\sum_{j} (x_{ij} - \bar{x}_i)^2}_{\text{SSW}}` },
    { p: 'For Lantern’s 76 events, SSB = 35.687, SSW = 230.759 and SST = 266.446, in dollars squared. Excel calculates each without the ToolPak: <x>=DEVSQ(range)</x> returns the sum of squared deviations from the range’s own mean, so SST is DEVSQ of all the values, SSW is the sum of each group’s DEVSQ, and SSB = SST − SSW. The worksheet in the Explore section builds a whole ANOVA table this way.' },

    { h: 'Degrees of freedom, mean squares and F' },
    { p: String.raw`Each sum of squares has its <g>degrees of freedom</g>: <m>k - 1</m> between groups (k group means, tied together by the grand mean), <m>N - k</m> within groups (N observations, k group means estimated from them) and <m>N - 1</m> in total; the first two add up to the third. A <g>mean square</g> is a sum of squares divided by its degrees of freedom: <m>\text{MSB} = \text{SSB} \div (k - 1)</m> and <m>\text{MSW} = \text{SSW} \div (N - k)</m>. The F statistic is their ratio, <m>F = \text{MSB} \div \text{MSW}</m>.` },
    { p: String.raw`For Lantern, <m>\text{MSB} = 35.687 \div 4 \approx 8.922</m>, <m>\text{MSW} = 230.759 \div 71 \approx 3.250</m> and <m>F = 8.922 \div 3.250 \approx 2.75</m>. MSW is the pooled variance of the <g>pooled t test</g> extended to k groups, and its square root, $1.80, is the typical distance of an event from its type’s mean. F is large only when MSB is large relative to MSW: when the group means are spread out more than the within-group scatter explains.` },

    { h: 'The F distribution' },
    { p: 'If the null hypothesis and the model’s conditions hold, F follows an <g>F distribution</g> with k − 1 and N − k degrees of freedom, the distribution of the ratio of two independent chi-square variables, each divided by its degrees of freedom. It is never negative and is skewed to the right. Its mean, df₂ ÷ (df₂ − 2), is close to 1 when the denominator df is large: about 1.03 for Lantern’s 71. Only a large F is evidence against the null hypothesis, so the test uses the right tail; OpenStax calls one-way ANOVA “always right-tailed”.' },
    { p: 'In Excel, <x>=F.DIST.RT(x,deg_freedom1,deg_freedom2)</x> returns the right-tail probability, the p-value: <x>=F.DIST.RT(2.745,4,71)</x> ≈ 0.035. <x>=F.INV.RT(probability,deg_freedom1,deg_freedom2)</x> returns the <g>critical value</g>: <x>=F.INV.RT(0.05,4,71)</x> ≈ 2.50, and Lantern’s F of 2.75 lies just beyond it. Microsoft’s examples: <x>=F.DIST.RT(15.2068649,6,4)</x> returns 0.01 and <x>=F.INV.RT(0.01,6,4)</x> returns 15.20686. The numerator df comes first, and swapping the two gives a different distribution; both functions truncate a df that isn’t a whole number.' },
    { p: 'With two groups, one-way ANOVA is the pooled two-sample t test of <i>Comparing means</i>: F equals t², with the same p-value. Microsoft’s ToolPak page says that with only two samples you can use T.TEST instead; with type 2, the pooled test, it gives the ANOVA’s two-tailed p-value. ANOVA earns its keep with three groups or more.' },

    { h: 'Excel’s Anova: Single Factor' },
    { p: 'With the Analysis ToolPak loaded (B03 showed how), choose Data &gt; Data Analysis &gt; Anova: Single Factor, which Microsoft describes as a simple analysis of variance on data for two or more samples. Put each group in its own column with its name in the first row, select the block as the Input Range, set Grouped By to Columns, tick Labels in first row, and leave Alpha at 0.05 unless you want another level. The groups needn’t be the same size: leave the cells below a shorter column empty, since a 0 would count as an observation. Like B03’s Descriptive Statistics and Regression tools it writes values, not formulas, so run it again when the data change.' },
    { p: 'The output has two tables. SUMMARY lists each group’s Count, Sum, Average and Variance (the sample variance, as VAR.S gives it). ANOVA has a row each for Between Groups, Within Groups and Total, with the columns SS, df, MS, F, P-value and F crit. Lantern’s, with the event types in five columns:' },
    { table: {
      caption: 'ANOVA: invoice per guest-day by event type, Lantern’s 76 catering events of 2026 (Anova: Single Factor, Alpha 0.05)',
      head: ['Source of Variation', 'SS', 'df', 'MS', 'F', 'P-value', 'F crit'],
      align: ['l', 'r', 'r', 'r', 'r', 'r', 'r'],
      rows: [
        ['Between Groups', sig(AN.ssb), String(AN.dfb), sig(AN.msb), sig(AN.F), sig(AN.p), sig(AN.fCrit)],
        ['Within Groups', sig(AN.ssw), String(AN.dfw), sig(AN.msw), '', '', ''],
        ['Total', sig(AN.sst), String(AN.dft), '', '', '', ''],
      ],
    } },
    { p: 'P-value is F.DIST.RT of F, and F crit is F.INV.RT of Alpha, both with the Between Groups and Within Groups df. F is above F crit (2.75 against 2.50), which is the same as P-value below Alpha (0.035 against 0.05), so the null hypothesis of equal means is rejected at the 5% level. The Explore section reproduces both tables.' },

    { h: 'Checking the conditions' },
    { p: `<b>Independence.</b> The observations should be independent: ideally random samples, or units assigned to groups at random. Lantern’s 76 events are not a random sample; they are every event of 2026, and the analysis treats them as a sample of the catering Lantern will go on doing. They also come from only ${nClients} clients, Harbor Tech alone booking ${harborTech} events, and events for one client may resemble each other (the same office, menu and budget), so they are not fully independent. That is a caveat to state, not something a calculation can fix.` },
    { p: '<b>Normality.</b> Each group should come from a normal population. ANOVA tolerates moderate departures, especially as samples grow (Penn State’s STAT 500 notes call its test statistic fairly robust), but outliers matter. Lantern’s meetings are right-skewed, with two invoices far above the rest ($14.62 and $17.14 per guest-day), and one team day earned $16.11.' },
    { p: '<b>Equal variances.</b> The groups should share one population variance. A common rule of thumb, given in Penn State’s STAT 500 notes, is that the largest sample standard deviation should be no more than about twice the smallest. Lantern’s groups fail it: meetings have a standard deviation of $2.15 and launches $0.68, a ratio of 3.2, because launches are priced very consistently.' },
    { table: {
      caption: 'Invoice per guest-day by event type (the ToolPak’s SUMMARY, with standard deviations)',
      head: ['Event type', 'Events', 'Mean ($)', 'Standard deviation ($)'],
      align: ['l', 'r', 'r', 'r'],
      rows: EVENT_TYPES.map((t, i) => [t, String(AN.counts[i]), fx(AN.means[i]), fx(SDS[i])]),
      foot: [['All events', String(AN.n), fx(AN.grand), fx(Math.sqrt(AN.sst / AN.dft))]],
    } },
    { p: 'When the conditions are doubtful, check whether the conclusion depends on them. <b>Welch’s ANOVA</b> drops the equal-variance assumption by weighting each group by nᵢ ÷ sᵢ², and Delacre and colleagues (2019) recommend it as the default for comparing means. It isn’t in the ToolPak, but statistical software runs it: for Lantern it gives F ≈ 4.13 on 4 and 30.3 df, p ≈ 0.009. Here the largest group, meetings, also has the largest spread, which makes the ordinary F conservative; when the smallest group has the largest spread it errs the other way and finds differences too often.' },
    { p: 'The <b>Kruskal–Wallis test</b> compares the groups’ ranks instead of their values, so it doesn’t assume normality: for Lantern H ≈ 13.0 on 4 df, p ≈ 0.011. A log transformation (B02) is a third option for right-skewed groups. Here every route points the same way, so the conclusion that the types differ doesn’t rest on the equal-variance assumption.' },

    { h: 'How big are the differences?' },
    { p: String.raw`A p-value says whether the means differ, not by how much. The simplest <g>effect size</g> for ANOVA is <g>eta squared</g>, <m>\eta^2 = \text{SSB} \div \text{SST}</m>, the share of the total variation that lies between the groups. For Lantern <m>\eta^2 = 35.687 \div 266.446 \approx 0.134</m>: 13.4% of the variation in invoice per guest-day goes with event type, and 86.6% is variation among events of the same type. Report it with the means themselves: the gap between the highest and lowest types is $2.25 per guest-day.` },

    { h: 'What a significant F does and doesn’t tell you' },
    { p: 'A significant F says the group means are not all equal. It doesn’t say which differ, or that they all differ: one group out of line is enough. A non-significant F is not proof of equal means, only a lack of evidence against them, as with any test.' },
    { p: 'To find which groups differ, compare pairs in a way that keeps the family-wise error rate in check. <b>Tukey’s HSD</b> (honestly significant difference) compares every pair and is the usual choice when all pairs matter; NIST’s handbook says it has the edge when all pairwise comparisons are of interest. It needs the studentised range distribution, for which Excel has no function, so it is run in statistical software. The <g>Bonferroni correction</g> works anywhere: to make m comparisons with a family-wise error rate of at most α, test each one at α ÷ m.' },
    { p: `For Lantern’s five types m = 10, so each pair is tested at 0.05 ÷ 10 = 0.005. Because the variances differ, use <g>Welch’s t test</g> for each pair: with the types in columns A to E in the SUMMARY’s order, <x>=T.TEST(D2:D12,E2:E12,2,3)</x> compares launches with team days. Only that pair clears the bar, with p ≈ 0.004 and team days $2.25 higher; the next smallest p-value, conferences against launches, is 0.018. Tukey’s HSD, run in statistical software, also finds only this pair; its usual form assumes equal variances, but the Games–Howell version, which doesn’t, agrees.` },
    { p: 'Comparisons planned before seeing the data, such as each type against one standard type, need fewer adjustments than all pairs. Picking the biggest gap after looking and testing only that one is the <g>multiple testing</g> trap in disguise: the biggest of ten gaps is not a fair draw. The challenging example shows it happening.' },

    { h: 'Beyond one factor' },
    { p: 'Two-way ANOVA handles two categorical factors at once, for example event type and season, and tests whether their effects interact; the ToolPak’s Anova: Two-Factor With Replication needs the same number of observations for every combination (its dialog takes a single Rows per sample). ANOVA is also a special case of regression on group indicators, which B06 Regression Analysis develops. And the Kruskal–Wallis test above is the rank-based alternative when the groups are far from normal.' },
  ],

  formulas: [
    { id: 'an-fwer', name: 'Family-wise error rate for independent tests',
      tex: String.raw`\text{FWER} = 1 - (1 - \alpha)^m, \qquad m = \dfrac{k(k - 1)}{2} \text{ pairs}`,
      where: [[String.raw`\alpha`, 'Significance level of each test', ''], [String.raw`m`, 'Number of tests', ''], [String.raw`k`, 'Number of groups', ''], [String.raw`\text{FWER}`, 'Probability of at least one false positive among the m tests, if every null hypothesis is true', '']],
      assumptions: 'The tests are independent. Pairwise tests share data, so this is a guide to the size of the problem rather than an exact rate.',
      note: 'The Bonferroni inequality gives an upper bound for any tests: FWER ≤ m × α.' },
    { id: 'an-ss', name: 'Sums of squares for one-way ANOVA',
      tex: String.raw`\text{SSB} = \sum_{i=1}^{k} n_i (\bar{x}_i - \bar{x})^2, \qquad \text{SSW} = \sum_{i=1}^{k} (n_i - 1) s_i^2, \qquad \text{SST} = \text{SSB} + \text{SSW}`,
      where: [[String.raw`k`, 'Number of groups', ''], [String.raw`n_i`, 'Number of observations in group i', ''], [String.raw`\bar{x}_i`, 'Mean of group i', 'units of x'], [String.raw`\bar{x}`, 'Grand mean of all N observations', 'units of x'], [String.raw`s_i^2`, 'Sample variance of group i (VAR.S)', 'units of x squared']],
      note: 'In Excel: SST = DEVSQ(all values); SSW = the sum of each group’s DEVSQ; SSB = SST − SSW.' },
    { id: 'an-f', name: 'Mean squares and the F statistic',
      tex: String.raw`\text{MSB} = \dfrac{\text{SSB}}{k - 1}, \qquad \text{MSW} = \dfrac{\text{SSW}}{N - k}, \qquad F = \dfrac{\text{MSB}}{\text{MSW}}`,
      where: [[String.raw`\text{SSB}, \text{SSW}`, 'Sums of squares between and within groups', 'units of x squared'], [String.raw`k`, 'Number of groups', ''], [String.raw`N`, 'Total number of observations', ''], [String.raw`F`, 'Test statistic, compared with the F distribution with k − 1 and N − k degrees of freedom', '']],
      assumptions: 'Independent observations; each group normal; equal population variances.',
      note: 'p-value: F.DIST.RT(F, k − 1, N − k). Critical value: F.INV.RT(α, k − 1, N − k).' },
    { id: 'an-eta', name: 'Eta squared',
      tex: String.raw`\eta^2 = \dfrac{\text{SSB}}{\text{SST}}`,
      where: [[String.raw`\text{SSB}`, 'Sum of squares between groups', 'units of x squared'], [String.raw`\text{SST}`, 'Total sum of squares', 'units of x squared'], [String.raw`\eta^2`, 'Share of the total variation that lies between the groups, from 0 to 1', '']],
      note: 'From the ToolPak’s output: SS for Between Groups divided by SS for Total.' },
    { id: 'an-bonferroni', name: 'Bonferroni-adjusted significance level',
      tex: String.raw`\alpha_{\text{each}} = \dfrac{\alpha}{m}`,
      where: [[String.raw`\alpha`, 'Family-wise significance level wanted', ''], [String.raw`m`, 'Number of comparisons made', ''], [String.raw`\alpha_{\text{each}}`, 'Level at which each comparison is tested', '']],
      note: 'Equivalently, multiply each p-value by m (capping at 1) and compare it with α.' },
  ],

  examples: [
    { level: 'simple', title: 'Hire lengths at three docking stations', fictional: true,
      setup: 'Gullwing Bikes runs a city bike-share scheme. It recorded the length of five hires (minutes) starting at each of three docking stations: Harbour 22, 25, 28, 24, 26; Market 30, 27, 33, 31, 29; Station Square 26, 24, 29, 23, 28. Do mean hire lengths differ between the stations, at α = 0.05?',
      table: {
        caption: 'Gullwing Bikes: five hires per station',
        head: ['Station', 'Hires', 'Mean (minutes)', 'Σ(x − x̄ᵢ)²'],
        align: ['l', 'r', 'r', 'r'],
        rows: Object.keys(BIKE).map((k, i) => [k, '5', String(mean(BG[i])), String(ssOf(BG[i]))]),
        foot: [['All', '15', String(BK.grand), String(BK.ssw)]],
      },
      steps: [
        'Means: 125 ÷ 5 = 25, 150 ÷ 5 = 30 and 130 ÷ 5 = 26 minutes. The grand mean is 405 ÷ 15 = 27 minutes.',
        String.raw`Between groups: <m>\text{SSB} = 5(25 - 27)^2 + 5(30 - 27)^2 + 5(26 - 27)^2 = 20 + 45 + 5 = 70</m>.`,
        String.raw`Within groups: Harbour’s deviations from 25 are −3, 0, 3, −1 and 1, giving <m>9 + 0 + 9 + 1 + 1 = 20</m>; Market’s give 20 and Station Square’s 26, so <m>\text{SSW} = 66</m> and <m>\text{SST} = 136</m>.`,
        String.raw`Degrees of freedom <m>3 - 1 = 2</m> and <m>15 - 3 = 12</m>; <m>\text{MSB} = 70 \div 2 = 35</m>, <m>\text{MSW} = 66 \div 12 = 5.5</m>, so <m>F = 35 \div 5.5 \approx 6.36</m>. <x>=F.DIST.RT(6.36,2,12)</x> ≈ 0.013, and the critical value <x>=F.INV.RT(0.05,2,12)</x> ≈ 3.89.`,
      ],
      answer: 'F ≈ 6.36 on 2 and 12 degrees of freedom, p ≈ 0.013: at the 5% level, mean hire length differs between the stations. η² = 70 ÷ 136 ≈ 0.51.',
      interpretation: 'Market’s hires averaged 4 to 5 minutes longer than the other two stations’, and half the variation in these fifteen hires goes with the station. Which stations differ needs a follow-up comparison, and five hires per station is far too few to check normality or equal spread: Gullwing should collect a few weeks of hires before redistributing bikes on the strength of it.' },
    { level: 'challenging', title: 'Four helpline teams from a summary report', fictional: true,
      setup: 'Duneview Energy’s helpline has four teams. A supervisor sampled calls at random from each team and reports the number of calls, the mean handling time and the standard deviation (minutes): team A 20, 6.2, 1.4; B 25, 6.9, 1.6; C 18, 7.4, 1.5; D 22, 6.5, 1.3. There are no raw data. The supervisor adds that team C took 1.2 minutes longer than team A, and that a Welch t test of those two teams gives p ≈ 0.016. Do the teams’ mean handling times differ, and should team C be singled out?',
      table: {
        caption: 'Duneview Energy helpline: the supervisor’s summary',
        head: ['Team', 'Calls (n)', 'Mean (minutes)', 'SD (minutes)', '(n − 1)s²'],
        align: ['l', 'r', 'r', 'r', 'r'],
        rows: ['A', 'B', 'C', 'D'].map((t, i) => [t, String(HL.n[i]), fx(HL.m[i], 1), fx(HL.s[i], 1), fx((HL.n[i] - 1) * HL.s[i] ** 2)]),
        foot: [['All', String(HN), fx(HGM, 3), '', fx(HSSW)]],
      },
      steps: [
        'Conditions first: the largest SD over the smallest is 1.6 ÷ 1.3 ≈ 1.23, well inside the rule of thumb; the calls were sampled at random; 18 to 25 calls per team. One-way ANOVA is reasonable.',
        String.raw`Grand mean, weighting each team by its calls: <m>(20 \times 6.2 + 25 \times 6.9 + 18 \times 7.4 + 22 \times 6.5) \div 85 = 572.7 \div 85 \approx 6.738</m>. Then <m>\text{SSB} = \sum n_i (\bar{x}_i - 6.738)^2 \approx 15.58</m>.`,
        String.raw`<m>\text{SSW} = \sum (n_i - 1) s_i^2 = 37.24 + 61.44 + 38.25 + 35.49 = 172.42</m>, so <m>\text{SST} \approx 188.00</m>. With n in B2:B5 and the SDs in D2:D5, <x>=SUMPRODUCT(B2:B5-1,D2:D5^2)</x> gives SSW in one formula; the ToolPak can’t help without raw data.`,
        String.raw`<m>\text{MSB} = 15.58 \div 3 \approx 5.19</m>, <m>\text{MSW} = 172.42 \div 81 \approx 2.13</m> and <m>F \approx 2.44</m>. <x>=F.DIST.RT(2.44,3,81)</x> ≈ 0.070; the critical value <x>=F.INV.RT(0.05,3,81)</x> is about 2.72. <m>\eta^2 = 15.58 \div 188.00 \approx 0.083</m>.`,
        'The C-against-A test compares the largest of the six pairwise gaps, chosen after looking at the means. A Bonferroni adjustment for six pairs tests each at 0.05 ÷ 6 ≈ 0.0083, and 0.016 is above it.',
      ],
      answer: 'F ≈ 2.44 on 3 and 81 degrees of freedom, p ≈ 0.07: no evidence at the 5% level that the teams’ mean handling times differ. Team C’s p-value of 0.016 doesn’t survive a Bonferroni adjustment for six pairs (threshold 0.0083).',
      interpretation: 'The report doesn’t justify singling out team C: its gap is the largest of six chosen after the fact. Nor does it show that the teams are alike: with about 20 calls per team, differences of a minute could be real and missed. The helpline should decide which comparisons matter, sample more calls, and test again.' },
    { level: 'applied', title: 'Does event type change what Lantern earns per guest?', fictional: true,
      setup: 'Ana is deciding whether her quote sheet should price event types differently. Using invoice per guest-day for the 76 events of 2026, test whether the types’ means differ, check the conditions, measure the size of the differences and find which types differ.',
      steps: [
        `Describe (the SUMMARY table above): means from $9.00 (launches, 11 events) to $11.25 (team days, 11 events), with ${AN.counts[1]} meetings, the largest group.`,
        `Conditions: the largest standard deviation over the smallest is 2.15 ÷ 0.68 ≈ 3.2, failing the rule of thumb; meetings are right-skewed with two high values; the events come from ${nClients} clients, most of them repeat bookers (Harbor Tech alone booked ${harborTech}), and are every event of the year, not a random sample.`,
        'ANOVA (Anova: Single Factor): F ≈ 2.75 on 4 and 71 df, p ≈ 0.035, F crit 2.50. Because the equal-variance condition fails, check the conclusion with Welch’s ANOVA (p ≈ 0.009) and the Kruskal–Wallis test (p ≈ 0.011): all agree.',
        'Size: η² ≈ 0.134; the highest and lowest type means differ by $2.25 per guest-day.',
        'Which types: Bonferroni-adjusted Welch t tests at 0.005 each. Only team days against launches qualifies, p ≈ 0.004.',
        `Alternative explanations: team days ran ${fx(meanHours('Team day'), 1)} hours on average against ${fx(meanHours('Launch'), 1)} for launches, so event type and event length are tangled.`,
      ],
      answer: 'Invoice per guest-day differs by event type (F ≈ 2.75, p ≈ 0.035; Welch p ≈ 0.009; η² ≈ 0.13). After a Bonferroni adjustment only team days ($11.25) and launches ($9.00) differ clearly.',
      interpretation: 'The evidence supports looking at team-day and launch pricing, not a surcharge for every type. Because team days also run longer, the difference may be about hours rather than type, and only a model with both, the multiple regression of B06, can separate them. The data are one year’s events, mostly from repeat clients, so Ana should treat the result as a description of 2026 and watch whether it holds in 2027.' },
  ],

  demo: [
    { widget: 'an-sheet', intro: 'Gullwing’s hire lengths with a full ANOVA table built from DEVSQ, F.DIST.RT and F.INV.RT. Change a hire in B2:D6 and watch SSB, SSW and F respond: moving one Market hire towards 27 lowers SSB; making the Harbour hires more spread out raises SSW.' },
    { widget: 'an-toolpak', intro: 'The ToolPak’s Anova: Single Factor output for Lantern’s five event types. Match each number to the In depth section, and change Alpha to see that only F crit moves.' },
    { widget: 'an-fcurve', intro: 'The F distribution with 4 and 71 degrees of freedom, Lantern’s F of 2.75 and the 5% rejection region. Change the degrees of freedom to see how the critical value falls as the denominator df grow.' },
    { widget: 'an-fwer', intro: 'How the chance of at least one false alarm grows with the number of groups when every pair gets its own test, and the per-test level a Bonferroni correction would use instead.' },
  ],

  mistakes: [
    { title: '“With five groups, run a t test on every pair.”', html: 'Ten tests at α = 0.05 have roughly a 40% chance of at least one false alarm between them. Run the ANOVA first, then compare pairs with Tukey’s HSD or a Bonferroni adjustment.' },
    { title: '“A significant F means every group differs.”', html: 'It means the means are not all equal. One group out of line is enough: for Lantern only team days against launches survives the follow-up comparisons.' },
    { title: '“p = 0.07, so the four teams perform the same.”', html: 'A non-significant F is a lack of evidence, not proof of equal means. Small groups can miss real differences; say what size of difference the data could have detected, or collect more.' },
    { title: '“F.DIST gives the ANOVA p-value.”', html: '<x>=F.DIST(F,df1,df2,TRUE)</x> is the left-tail probability. The p-value is the right tail, <x>=F.DIST.RT(F,df1,df2)</x>, with the between-groups df first.' },
    { title: '“The ToolPak checks the conditions for you.”', html: 'It prints F and a p-value whatever the data look like. Check the spread (largest SD within about twice the smallest), outliers and independence yourself. Welch’s ANOVA allows for unequal variances and Kruskal–Wallis for non-normal groups; nothing fixes a lack of independence.' },
    { title: '“A bigger F means bigger differences.”', html: 'F grows with sample size as well as with the gaps between means. Judge size from the means and η², and significance from the p-value.' },
  ],

  application: [
    { p: 'Analysts use one-way ANOVA wherever several groups are compared on one measure: handling time across call-centre teams, yield across production lines, basket value across store formats, test scores across training methods. In a designed experiment, where units are assigned to groups at random, a significant F supports a causal conclusion about the groups. In observational data such as Lantern’s it describes differences and leaves their causes open.' },
    { case: 'Ana’s note for her catering review reads: “Invoice per guest-day differed by event type (Welch’s ANOVA, which allows for the unequal spreads, p = 0.009; ordinary one-way ANOVA F = 2.75 on 4 and 71 df, p = 0.035; η² = 0.13). After a Bonferroni adjustment, only team days ($11.25) and launches ($9.00) differ clearly. These are all 2026 events from 18 clients, most of them repeat bookers (Harbor Tech alone booked 11), not random samples.” Before adding anything to the quote sheet she checks what else goes with team days: they ran 6.6 hours on average against 4.2 for launches, so she asks B06’s question, whether hours or type drives the price, before changing it.' },
    { p: 'The reporting habit is the same as for every test: the group sizes and means, F with its two degrees of freedom and its p-value, an effect size, the follow-up comparisons with the adjustment named, and the conditions that might weaken the result. A small table of means with the ANOVA line underneath usually tells a reader more than the ToolPak’s full output.' },
  ],

  summary: [
    'Testing every pair of k groups at α makes k(k − 1) ÷ 2 tests and inflates the family-wise error rate (about 40% for 10 independent tests at 5%). ANOVA tests H₀: all means equal, once.',
    'SST = SSB + SSW: variation between group means (weighted by group size) plus variation within groups. In Excel, DEVSQ gives each.',
    'MSB = SSB ÷ (k − 1), MSW = SSW ÷ (N − k), F = MSB ÷ MSW. Under H₀, F follows an F distribution with k − 1 and N − k df and is near 1.',
    'The test is right-tailed: p = F.DIST.RT(F, k − 1, N − k); critical value F.INV.RT(α, k − 1, N − k). Anova: Single Factor prints both, as P-value and F crit.',
    'Conditions: independence, normality within groups, equal variances (largest SD no more than about twice the smallest). Welch’s ANOVA allows for unequal variances and Kruskal–Wallis for non-normal groups; nothing fixes a lack of independence.',
    'η² = SSB ÷ SST measures size. A significant F says not all means are equal; Tukey’s HSD or Bonferroni-adjusted tests (each at α ÷ m) say which differ.',
    'A non-significant F is not proof of equal means, and in observational data a significant one is not proof of a cause.',
  ],

  glossary: [
    { term: 'Analysis of variance', def: 'A method for testing whether several group means are equal by comparing the variation between the group means with the variation within the groups; one-way ANOVA has one categorical factor. Abbreviated ANOVA.' },
    { term: 'Family-wise error rate', def: 'The probability of at least one false positive (Type I error) among a set of tests when every null hypothesis is true. It grows with the number of tests.' },
    { term: 'Between-group variation', def: 'The variation of the group means around the grand mean, measured by the sum of squares between groups, Σ nᵢ(x̄ᵢ − x̄)².' },
    { term: 'Within-group variation', def: 'The variation of observations around their own group’s mean, measured by the sum of squares within groups, Σ(nᵢ − 1)sᵢ².' },
    { term: 'Mean square', def: 'A sum of squares divided by its degrees of freedom: an estimate of variance. In one-way ANOVA, MS between = SSB ÷ (k − 1) and MS within = SSW ÷ (N − k).' },
    { term: 'F statistic', def: 'In one-way ANOVA, the ratio of the mean square between groups to the mean square within groups. It is near 1 when the null hypothesis of equal means is true and large when the means differ.' },
    { term: 'F distribution', def: 'The distribution of the ratio of two independent chi-square variables, each divided by its degrees of freedom. It has a numerator and a denominator df, is never negative and is skewed to the right.' },
    { term: 'Eta squared', def: 'An effect size for ANOVA: the sum of squares between groups divided by the total sum of squares, the share of the variation that lies between the groups.' },
    { term: 'Bonferroni correction', def: 'A way to control the family-wise error rate when making m comparisons: test each at α ÷ m, or multiply each p-value by m.' },
  ],

  references: [
    { text: 'Holmes, A., Illowsky, B. &amp; Dean, S. (2017). <i>Introductory Business Statistics</i>, sections 12.2, “One-Way ANOVA”, and 12.3, “The F Distribution and the F-Ratio”. OpenStax.', url: 'https://openstax.org/books/introductory-business-statistics/pages/12-3-the-f-distribution-and-the-f-ratio', checked: '2026-10-24' },
    { text: 'NIST/SEMATECH. <i>e-Handbook of Statistical Methods</i>, section 1.3.6.6.5, “F Distribution”.', url: 'https://itl.nist.gov/div898/handbook/eda/section3/eda3665.htm', checked: '2026-10-24' },
    { text: 'NIST/SEMATECH. <i>e-Handbook of Statistical Methods</i>, section 7.4.7, “How can we make multiple comparisons?”, with 7.4.7.3, “Bonferroni’s method”.', url: 'https://itl.nist.gov/div898/handbook/prc/section4/prc47.htm', checked: '2026-10-24' },
    { text: 'Penn State Eberly College of Science. STAT 500 <i>Applied Statistics</i>, section 10.2.1, “ANOVA Assumptions”.', url: 'https://online.stat.psu.edu/stat500/book/export/html/607', checked: '2026-10-24' },
    { text: 'Microsoft Support. “F.DIST.RT function” and “F.INV.RT function”.', url: 'https://support.microsoft.com/en-us/excel/functions/f-dist-rt-function', checked: '2026-10-24' },
    { text: 'Microsoft Support. “Use the Analysis ToolPak to perform complex data analysis” (Anova: Single Factor).', url: 'https://support.microsoft.com/en-us/excel/use-the-analysis-toolpak-to-perform-complex-data-analysis', checked: '2026-10-24' },
    { text: 'Delacre, M., Leys, C., Mora, Y. L. &amp; Lakens, D. (2019). Taking parametric assumptions seriously: arguments for the use of Welch’s F-test instead of the classical F-test in one-way ANOVA. <i>International Review of Social Psychology</i>, 32(1).', url: 'https://doaj.org/article/258fa30b5d304f3d9900c7b6b93b37f9', checked: '2026-10-24' },
  ],

  checks: [
    // the case and the means
    { what: 'Events', value: AN.n, shown: 76 },
    { what: 'Event types', value: AN.k, shown: 5 },
    { what: 'Team day mean', value: AN.means[T['Team day']], shown: 11.25 },
    { what: 'Conference mean', value: AN.means[T.Conference], shown: 10.32 },
    { what: 'Meeting mean', value: AN.means[T.Meeting], shown: 9.63 },
    { what: 'Breakfast mean', value: AN.means[T.Breakfast], shown: 9.47 },
    { what: 'Launch mean', value: AN.means[T.Launch], shown: 9.00 },
    { what: 'Grand mean', value: AN.grand, shown: 9.86 },
    { what: 'Highest single meeting', value: Math.max(...PER_GUEST_BY_TYPE.Meeting), shown: 17.14 },
    { what: 'Second-highest meeting', value: sortedMeeting[sortedMeeting.length - 2], shown: 14.62 },
    { what: 'Lowest single meeting', value: Math.min(...PER_GUEST_BY_TYPE.Meeting), shown: 7.01 },
    { what: 'Highest team day', value: Math.max(...PER_GUEST_BY_TYPE['Team day']), shown: 16.11 },
    { what: 'Smallest group', value: Math.min(...AN.counts), shown: 11 },
    { what: 'Largest group', value: Math.max(...AN.counts), shown: 28 },
    { what: 'Launches', value: AN.counts[T.Launch], shown: 11 },
    { what: 'Team days', value: AN.counts[T['Team day']], shown: 11 },
    // family-wise error
    { what: 'Pairs of five types', value: (5 * 4) / 2, shown: 10 },
    { what: 'FWER for 10 tests', value: FWER10, shown: 0.40 },
    { what: 'FWER for 10 tests, about 40%', value: FWER10 * 100, shown: 40, tol: 0.5 },
    { what: 'Bonferroni level for 10 pairs', value: 0.05 / 10, shown: 0.005 },
    // the ANOVA table
    { what: 'SSB', value: AN.ssb, shown: 35.687, tol: 0.0005 },
    { what: 'SSW', value: AN.ssw, shown: 230.759, tol: 0.0005 },
    { what: 'SST', value: AN.sst, shown: 266.446, tol: 0.0005 },
    { what: 'MSB (3 dp)', value: AN.msb, shown: 8.922, tol: 0.0005 },
    { what: 'MSW (3 dp)', value: AN.msw, shown: 3.250, tol: 0.0005 },
    { what: 'F from the 3-dp mean squares', value: 8.922 / 3.25, shown: 2.75 },
    { what: 'eta squared from the 3-dp sums', value: 35.687 / 266.446, shown: 0.134 },
    { what: 'SST = SSB + SSW', value: AN.ssb + AN.ssw, shown: AN.sst, tol: 1e-9 },
    { what: 'df between', value: AN.dfb, shown: 4 },
    { what: 'df within', value: AN.dfw, shown: 71 },
    { what: 'df total', value: AN.dft, shown: 75 },
    { what: 'MSB', value: AN.msb, shown: 8.92 },
    { what: 'MSW', value: AN.msw, shown: 3.25 },
    { what: 'F', value: AN.F, shown: 2.75 },
    { what: 'F (3 dp, as typed in F.DIST.RT)', value: AN.F, shown: 2.745, tol: 0.0005 },
        { what: 'p-value', value: AN.p, shown: 0.035 },
    { what: 'F.DIST.RT(2.745,4,71)', value: I.fSf(2.745, 4, 71), shown: 0.035 },
    { what: 'F crit', value: AN.fCrit, shown: 2.50 },
    { what: 'F above F crit', value: Number(AN.F > AN.fCrit), shown: 1 },
    { what: 'Pooled SD √MSW', value: Math.sqrt(AN.msw), shown: 1.80 },
    { what: 'Mean of F(4, 71)', value: 71 / 69, shown: 1.03 },
    { what: 'Microsoft: F.DIST.RT(15.2068649,6,4)', value: I.fSf(15.2068649, 6, 4), shown: 0.01, tol: 0.000001 },
    { what: 'Microsoft: F.INV.RT(0.01,6,4)', value: I.fInvSf(0.01, 6, 4), shown: 15.20686, tol: 0.000005 },
    { what: 'eta squared', value: AN.eta2, shown: 0.134 },
    { what: 'eta squared %', value: AN.eta2 * 100, shown: 13.4, tol: 0.05 },
    { what: 'within share %', value: (1 - AN.eta2) * 100, shown: 86.6, tol: 0.05 },
    { what: 'eta squared, 2 dp', value: AN.eta2, shown: 0.13 },
    { what: 'Highest minus lowest mean', value: Math.max(...AN.means) - Math.min(...AN.means), shown: 2.25 },
    // the printed ANOVA table and SUMMARY
    { what: 'Table: SSB', value: AN.ssb, shown: 35.6867, tol: 0.00005 },
    { what: 'Table: MSB', value: AN.msb, shown: 8.92168, tol: 0.000005 },
    { what: 'Table: F', value: AN.F, shown: 2.74503, tol: 0.000005 },
    { what: 'Table: P-value', value: AN.p, shown: 0.0349177, tol: 0.0000005 },
    { what: 'Table: F crit', value: AN.fCrit, shown: 2.50076, tol: 0.000005 },
    { what: 'Table: SSW', value: AN.ssw, shown: 230.759, tol: 0.0005 },
    { what: 'Table: MSW', value: AN.msw, shown: 3.25013, tol: 0.000005 },
    { what: 'Table: SST', value: AN.sst, shown: 266.446, tol: 0.0005 },
    { what: 'Conference SD', value: SDS[T.Conference], shown: 1.67 },
    { what: 'Breakfast SD', value: SDS[T.Breakfast], shown: 1.53 },
    { what: 'Team day SD', value: SDS[T['Team day']], shown: 1.99 },
    { what: 'Conferences', value: AN.counts[T.Conference], shown: 13 },
    { what: 'Meetings', value: AN.counts[T.Meeting], shown: 28 },
    { what: 'Breakfasts', value: AN.counts[T.Breakfast], shown: 13 },
    { what: 'SD of all 76 events', value: Math.sqrt(AN.sst / AN.dft), shown: 1.88 },
    { what: 'Launch variance (widget note)', value: AN.vars[T.Launch], shown: 0.46 },
    { what: 'Meeting variance (widget note)', value: AN.vars[T.Meeting], shown: 4.63 },
    // conditions
    { what: 'Clients', value: nClients, shown: 18 },
    { what: 'Harbor Tech events', value: harborTech, shown: 11 },
    { what: 'Harbor Tech is the most frequent client', value: Number(harborTech === maxClientEvents), shown: 1 },
    { what: 'Clients who booked more than once', value: [...new Set(clients)].filter((c) => clients.filter((x) => x === c).length > 1).length, shown: 16 },
    { what: 'Meetings are the largest group', value: Number(AN.counts[T.Meeting] === Math.max(...AN.counts)), shown: 1 },
    { what: 'Meeting SD', value: SDS[T.Meeting], shown: 2.15 },
    { what: 'Launch SD', value: SDS[T.Launch], shown: 0.68 },
    { what: 'Meeting SD is the largest', value: Number(SDS[T.Meeting] === Math.max(...SDS)), shown: 1 },
    { what: 'Launch SD is the smallest', value: Number(SDS[T.Launch] === Math.min(...SDS)), shown: 1 },
    { what: 'SD ratio', value: sdRatio, shown: 3.2, tol: 0.05 },
    { what: 'SD ratio from the rounded SDs', value: 2.15 / 0.68, shown: 3.2, tol: 0.05 },
    { what: 'Welch F', value: WELCH.F, shown: 4.13 },
    { what: 'Welch df2', value: WELCH.df2, shown: 30.3, tol: 0.05 },
    { what: 'Welch p', value: WELCH.p, shown: 0.009, tol: 0.0005 },
    { what: 'Kruskal–Wallis H', value: KW.H, shown: 13.0, tol: 0.05 },
    { what: 'Kruskal–Wallis p', value: KW.p, shown: 0.011, tol: 0.0005 },
    // follow-ups
    { what: 'Launch v team day Welch p', value: LT.p, shown: 0.004, tol: 0.0005 },
    { what: 'Launch v team day is the smallest p', value: Number(byP[0] === LT), shown: 1 },
    { what: 'Only one pair below 0.005', value: PAIRS.filter((x) => x.p < 0.005).length, shown: 1 },
    { what: 'Second smallest p is conference v launch', value: Number(byP[1].a === 'Conference' && byP[1].b === 'Launch'), shown: 1 },
    { what: 'Second smallest p', value: byP[1].p, shown: 0.018, tol: 0.0005 },
    { what: 'Team days minus launches', value: -LT.diff, shown: 2.25 },
    { what: 'Launch rows D2:D12 (11 events)', value: AN.counts[T.Launch] + 1, shown: 12 },
    { what: 'Team day rows E2:E12 (11 events)', value: AN.counts[T['Team day']] + 1, shown: 12 },
    { what: 'Launch is the 4th type (column D)', value: T.Launch, shown: 3 },
    { what: 'Team day is the 5th type (column E)', value: T['Team day'], shown: 4 },
    { what: 'Team day hours', value: meanHours('Team day'), shown: 6.6, tol: 0.05 },
    { what: 'Launch hours', value: meanHours('Launch'), shown: 4.2, tol: 0.05 },
    // the bike-share example
    { what: 'Harbour mean', value: mean(BIKE.Harbour), shown: 25 },
    { what: 'Market mean', value: mean(BIKE.Market), shown: 30 },
    { what: 'Station Square mean', value: mean(BIKE['Station Square']), shown: 26 },
    { what: 'Harbour total', value: sum(BIKE.Harbour), shown: 125 },
    { what: 'Market total', value: sum(BIKE.Market), shown: 150 },
    { what: 'Station Square total', value: sum(BIKE['Station Square']), shown: 130 },
    { what: 'Bike total', value: sum(BG.flat()), shown: 405 },
    { what: 'Bike grand mean', value: BK.grand, shown: 27 },
    { what: 'Bike SSB', value: BK.ssb, shown: 70 },
    { what: 'Bike SSB parts', value: 5 * 4 + 5 * 9 + 5 * 1, shown: 70 },
    { what: 'Harbour SS', value: ssOf(BIKE.Harbour), shown: 20 },
    { what: 'Market SS', value: ssOf(BIKE.Market), shown: 20 },
    { what: 'Station Square SS', value: ssOf(BIKE['Station Square']), shown: 26 },
    { what: 'Bike SSW', value: BK.ssw, shown: 66 },
    { what: 'Bike SST', value: BK.sst, shown: 136 },
    { what: 'Bike MSB', value: BK.msb, shown: 35 },
    { what: 'Bike MSW', value: BK.msw, shown: 5.5 },
    { what: 'Bike F', value: BK.F, shown: 6.36 },
    { what: 'Bike p', value: BK.p, shown: 0.013, tol: 0.0005 },
    { what: 'Bike F crit', value: BK.fCrit, shown: 3.89 },
    { what: 'Bike eta squared', value: BK.eta2, shown: 0.51 },
    { what: 'Bike: Market 4 to 5 minutes above the others', value: Number(mean(BIKE.Market) - mean(BIKE['Station Square']) === 4 && mean(BIKE.Market) - mean(BIKE.Harbour) === 5), shown: 1 },
    { what: 'Spread ×3 F', value: BK3.F, shown: 0.71 },
    { what: 'Spread ×3 keeps the means', value: Number(spread3.every((g, i) => Math.abs(mean(g) - mean(BG[i])) < 1e-9)), shown: 1 },
    { what: 'Spread ×3 lowest value', value: Math.min(...spread3.flat()), shown: 16, tol: 0.5 },
    { what: 'Spread ×3 highest value', value: Math.max(...spread3.flat()), shown: 39, tol: 0.5 },
    { what: 'Bike hires within about 3 minutes of their mean', value: Math.max(...BG.map((g) => Math.max(...dev(g).map(Math.abs)))), shown: 3 },
    // the helpline example
    { what: 'Helpline calls', value: HN, shown: 85 },
    { what: 'Helpline weighted total', value: sum(HL.n.map((n, i) => n * HL.m[i])), shown: 572.7, tol: 0.0005 },
    { what: 'Helpline grand mean', value: HGM, shown: 6.738, tol: 0.0005 },
    { what: 'Helpline SSB', value: HSSB, shown: 15.58 },
    { what: 'Helpline (n−1)s² A', value: 19 * 1.4 ** 2, shown: 37.24 },
    { what: 'Helpline (n−1)s² B', value: 24 * 1.6 ** 2, shown: 61.44 },
    { what: 'Helpline (n−1)s² C', value: 17 * 1.5 ** 2, shown: 38.25 },
    { what: 'Helpline (n−1)s² D', value: 21 * 1.3 ** 2, shown: 35.49 },
    { what: 'Helpline SSW', value: HSSW, shown: 172.42 },
    { what: 'Helpline SST', value: HSSB + HSSW, shown: 188.00 },
    { what: 'Helpline MSB', value: HMSB, shown: 5.19 },
    { what: 'Helpline MSW', value: HMSW, shown: 2.13 },
    { what: 'Helpline F', value: HF, shown: 2.44 },
    { what: 'Helpline df within', value: HN - 4, shown: 81 },
    { what: 'Helpline p', value: I.fSf(HF, 3, HN - 4), shown: 0.070, tol: 0.0005 },
    { what: 'Helpline p (as typed)', value: I.fSf(2.44, 3, 81), shown: 0.07, tol: 0.005 },
    { what: 'Helpline F crit', value: I.fInvSf(0.05, 3, 81), shown: 2.72 },
    { what: 'Helpline eta squared', value: HSSB / (HSSB + HSSW), shown: 0.083, tol: 0.0005 },
    { what: 'Helpline SD ratio', value: 1.6 / 1.3, shown: 1.23 },
    { what: 'Helpline C − A', value: HL.m[2] - HL.m[0], shown: 1.2 },
    { what: 'Helpline C v A Welch p', value: HCA.p, shown: 0.016, tol: 0.0005 },
    { what: 'Helpline pairs', value: (4 * 3) / 2, shown: 6 },
    { what: 'Helpline Bonferroni level', value: 0.05 / 6, shown: 0.0083, tol: 0.00005 },
    { what: 'Helpline about 20 calls per team', value: HN / 4, shown: 20, tol: 2 },
  ],
};
