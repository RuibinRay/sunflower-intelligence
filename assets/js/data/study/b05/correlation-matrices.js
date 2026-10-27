// correlation-matrices.js — B05 · Correlation matrices. Content only; exercises are in correlation-matrices.ex.js.
// Uses the cafés' daily log (case.js: MATRIX, MATRIX_COLUMNS, column) for the year's matrix and Harbourside's June
// (30 days) for the many-tests example. Pinecrest Hotel is fictional. Partial correlation is the next lesson's;
// causes are correlation-and-causation's. Every figure printed is recomputed in `checks`.
import { MATRIX, MATRIX_COLUMNS, DERIVED as D, column } from './case.js?v=22';
import * as C from '../../../core/correlation.js?v=22';

// ---------------------------------------------------------------- the year's matrix (both cafés, 612 days)
const R = MATRIX.r, P = MATRIX.p, NAMES = MATRIX.names;
const ix = (n) => NAMES.indexOf(n);
const rr = (a, b) => R[ix(a)][ix(b)];
const LABEL = { high_f: 'High (°F)', rain_in: 'Rain (in)', footfall: 'Footfall', transactions: 'Transactions', sales: 'Sales', iced_share: 'Iced share', peak_staff_hours: 'Peak barista hours', peak_wait_min: 'Peak wait' };
const all = Object.fromEntries(MATRIX_COLUMNS.map((n) => [n, column(n)]));
const count = (M, alpha = 0.05) => { const Q = M.pAdj || M.p; let s = 0; for (let i = 0; i < Q.length; i++) for (let j = i + 1; j < Q.length; j++) if (Q[i][j] < alpha) s++; return s; };
const YEAR = { none: count(C.matrix(all)), bonferroni: count(C.matrix(all, { adjustMethod: 'bonferroni' })), holm: count(C.matrix(all, { adjustMethod: 'holm' })), bh: count(C.matrix(all, { adjustMethod: 'fdr_bh' })) };
const SPEAR = C.matrix(all, { method: 'spearman' });
const byCafe = (a, b, cafe) => C.pearson(column(a, { cafe }), column(b, { cafe })).r;

// ---------------------------------------------------------------- Harbourside in June (30 days)
const JUNE_IDX = column('date').map((d, i) => i).filter((i) => column('date')[i].slice(5, 7) === '06' && column('cafe')[i] === 'Harbourside');
const june = Object.fromEntries(MATRIX_COLUMNS.map((n) => [n, JUNE_IDX.map((i) => column(n)[i])]));
const JM = C.matrix(june);
const JPAIRS = [];
for (let i = 0; i < 8; i++) for (let j = i + 1; j < 8; j++) JPAIRS.push({ a: NAMES[i], b: NAMES[j], r: JM.r[i][j], p: JM.p[i][j] });
JPAIRS.sort((x, y) => x.p - y.p || Math.abs(y.r) - Math.abs(x.r));   // ties at p = 0 go to the larger |r|
const JP = JPAIRS.map((x) => x.p);
const JB = C.adjust(JP, 'bonferroni'), JH = C.adjust(JP, 'holm'), JF = C.adjust(JP, 'fdr_bh');
const JUNE = { none: JP.filter((p) => p < 0.05).length, bonferroni: JB.filter((p) => p < 0.05).length, holm: JH.filter((p) => p < 0.05).length, bh: JF.filter((p) => p < 0.05).length };

// ---------------------------------------------------------------- Pinecrest Hotel (fictional): ten p-values
const HOTEL = [0.0004, 0.0021, 0.0049, 0.0068, 0.012, 0.028, 0.041, 0.13, 0.36, 0.72];
const HB = C.adjust(HOTEL, 'bonferroni'), HH = C.adjust(HOTEL, 'holm'), HF = C.adjust(HOTEL, 'fdr_bh');
const nSig = (a) => a.filter((p) => p < 0.05).length;

// ---------------------------------------------------------------- formatting and figure
const f2 = (v) => (v < 0 ? '−' : '') + Math.abs(v).toFixed(2);
const f1 = (x) => Math.round(x * 10) / 10;
const pTxt = (p) => (p < 0.001 ? 'below 0.001' : p.toFixed(4));

function matrixTable() {
  const order = MATRIX_COLUMNS;
  return {
    caption: 'Pearson correlations between the cafés’ daily measures, 1 March – 31 December 2027 (both cafés, 612 days; lower triangle)',
    head: ['', ...order.slice(0, 7).map((_, j) => String(j + 1))],
    align: ['l', 'r', 'r', 'r', 'r', 'r', 'r', 'r'],
    rows: order.slice(1).map((n, i) => [`${i + 2} ${LABEL[n]}`, ...order.slice(0, 7).map((m, j) => (j <= i ? f2(rr(n, m)) : ''))]),
    note: 'Columns are numbered as the rows: 1 High (°F), 2 Rain (in), 3 Footfall, 4 Transactions, 5 Sales, 6 Iced share, 7 Peak barista hours, 8 Peak wait. Every cell uses all 612 days.',
  };
}

function thresholdFigure() {
  // ranks 1–20 of the June p-values against the three procedures' thresholds (p above 0.06 are drawn at the top edge)
  const W = 640, H = 300, L = 60, Rm = 20, T = 30, B = 50, m = 28, top = 0.06;
  const X = (k) => L + (k - 0.5) * ((W - L - Rm) / 20), Y = (p) => T + (1 - Math.min(p, top) / top) * (H - T - B);
  let svg = `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" font-size="12" fill="currentColor">`;
  [0, 0.01, 0.02, 0.03, 0.04, 0.05, 0.06].forEach((v) => { svg += `<line x1="${L}" x2="${W - Rm}" y1="${f1(Y(v))}" y2="${f1(Y(v))}" stroke="var(--rule-strong)" stroke-width="0.5" stroke-dasharray="3 3"/><text x="${L - 6}" y="${f1(Y(v)) + 4}" text-anchor="end" font-size="11" fill="var(--ink-3)">${v.toFixed(2)}</text>`; });
  // BH line k·α/m, Holm α/(m − k + 1), Bonferroni α/m
  const path = (fn) => Array.from({ length: 20 }, (_, i) => `${i ? 'L' : 'M'}${f1(X(i + 1))},${f1(Y(fn(i + 1)))}`).join(' ');
  svg += `<path d="${path((k) => (k * 0.05) / m)}" fill="none" stroke="var(--series-2)" stroke-width="2"/>`;
  svg += `<path d="${path((k) => 0.05 / (m - k + 1))}" fill="none" stroke="var(--series-3)" stroke-width="2" stroke-dasharray="6 3"/>`;
  svg += `<path d="${path(() => 0.05 / m)}" fill="none" stroke="var(--ink)" stroke-width="1.5" stroke-dasharray="2 3"/>`;
  svg += `<line x1="${L}" x2="${W - Rm}" y1="${f1(Y(0.05))}" y2="${f1(Y(0.05))}" stroke="var(--ink-3)" stroke-width="1.2"/>`;
  JP.slice(0, 20).forEach((p, i) => { svg += `<circle cx="${f1(X(i + 1))}" cy="${f1(Y(p))}" r="4" fill="var(--series-1)"/>`; });
  [1, 5, 10, 15, 20].forEach((k) => { svg += `<text x="${f1(X(k))}" y="${H - B + 18}" text-anchor="middle" font-size="11" fill="var(--ink-3)">${k}</text>`; });
  svg += `<text x="${(L + W - Rm) / 2}" y="${H - 10}" text-anchor="middle" font-size="11" fill="var(--ink-3)">Rank of the p-value (1 = smallest)</text>`;
  svg += `<text x="${L}" y="18" font-size="11">p-value</text>`;
  svg += `<text x="${f1(X(20)) - 4}" y="${f1(Y(0.05)) - 6}" text-anchor="end" font-size="11" fill="var(--ink-3)">α = 0.05, no adjustment</text>`;
  svg += `<text x="${f1(X(18))}" y="${f1(Y((18 * 0.05) / m)) - 8}" text-anchor="end" font-size="11">Benjamini–Hochberg</text>`;
  svg += `<text x="${f1(X(20))}" y="${f1(Y(0.05 / 9)) - 8}" text-anchor="end" font-size="11">Holm</text>`;
  svg += `<text x="${f1(X(20))}" y="${f1(Y(0.05 / m)) + 16}" text-anchor="end" font-size="11">Bonferroni</text>`;
  return `${svg}</svg>`;
}

export default {
  slug: 'correlation-matrices',
  title: 'Correlation matrices',
  blurb: 'Put every pair of measures in one table, read it as a map of what goes with what, spot measures that say the same thing, and test 28 correlations at once without being fooled by the false alarms that many tests produce: Bonferroni, Holm and the Benjamini–Hochberg false discovery rate.',
  status: 'reviewed',
  objectives: [
    'Construct a correlation matrix and its heatmap in Excel, with CORREL or the Analysis ToolPak’s Correlation tool, and read its structure: blocks, redundant measures and near-zero pairs.',
    'Calculate the number of distinct pairs among m variables and explain why testing them all at α = 0.05 produces false alarms.',
    'Apply the Bonferroni, Holm and Benjamini–Hochberg procedures to a set of p-values and explain what each controls: the family-wise error rate or the false discovery rate.',
    'Recognise the limits of a matrix: pooled groups, nonlinear links, pairwise deletion and the impossibility of some combinations of correlations.',
    'Use a matrix to choose follow-up questions rather than to report conclusions.',
  ],
  prerequisites: [
    { lesson: 'b05/testing-correlation', why: 'The t test of H₀: ρ = 0 that each cell of the matrix can carry, and why tiny correlations are significant with 612 pairs.' },
    { lesson: 'b04/anova', why: 'The family-wise error rate and the Bonferroni correction, which this lesson builds on.' },
    { lesson: 'b05/groups-and-simpsons-paradox', why: 'Why a correlation over two pooled groups can differ from the correlation inside each.' },
    { lesson: 'b03/cells-and-formulas', why: 'Mixed references ($B$2:$B$31 against C$2:C$31) when filling CORREL across a grid.' },
  ],
  case: 'lantern',

  concept: [
    { case: 'By the end of December 2027 Ana has ten months of her cafés’ daily log: 306 days at Harbourside and 306 at Millbrook. She has looked at a few scatterplots one at a time, but she has eight daily measures that matter to her (the high temperature, rain, footfall, transactions, sales, the share of iced drinks, the barista hours rostered for the 7–11 a.m. peak and the average wait at the peak), and she wants to see everything that goes with everything before she decides what to investigate.' },

    { h: 'From pairs to a matrix' },
    { p: String.raw`Eight measures make <m>8 \times 7 \div 2 = 28</m> distinct pairs. A <g>scatterplot matrix</g> of all 28 is possible but cramped, and the pattern across 28 small plots is hard to hold in your head. A <g>correlation matrix</g> puts all the pairs in one square table: one row and one column for each variable, and in each cell the correlation of the row’s variable with the column’s. The table below is the Pearson matrix for the year, both cafés together.` },
    { table: matrixTable() },
    { p: 'Three features make a correlation matrix quick to read. The diagonal is all 1s, because every variable correlates perfectly with itself, so tables often leave it out. The matrix is symmetric, because the correlation of footfall with sales is the correlation of sales with footfall, so half of it is enough: here the lower triangle. And every cell is on the same scale, −1 to +1, whatever the variables’ units, so cells can be compared directly in a way that covariances can’t.' },

    { h: 'Reading the matrix' },
    { p: 'Read a matrix by looking for its structure before its single numbers. This one has three groups. The first is how busy the day was: footfall, transactions, sales, peak barista hours and peak wait correlate with each other at 0.53 to 0.98. The second is the weather’s effect on the menu: the high temperature and the iced share correlate at 0.94, the S-shaped curve of the nonlinear-and-restricted lesson. The third is rain, which correlates weakly and negatively with footfall, transactions, sales and peak wait (−0.12 to −0.15), and hardly at all with peak barista hours (0.03) or the high temperature (0.05).' },
    { p: 'Between the groups, the high temperature goes with the busy measures only modestly, at 0.21 to 0.29, and with the peak wait at only 0.08. A matrix like this is a summary of linear association; it says nothing about why. Some of the links the case was built with (footfall, transactions and sales form a chain; warm days bring more iced drinks), and some are side effects of how the cafés are run, as the next sections show.' },

    { h: 'Redundant measures' },
    { p: 'Footfall and transactions correlate at 0.98: on the year’s data, knowing one tells you almost everything about the other (r² = 0.96). Two such measures are <g>redundant measures</g> for most questions. Their correlations with everything else are nearly identical, so they are not two independent pieces of evidence that busy days have longer waits; they are one piece counted twice. When you choose which measures to carry into later analysis, keep the one closer to the question (transactions, if the question is about the till) and say why.' },
    { p: 'Peak barista hours correlate with footfall at 0.92 and with transactions at 0.93. That is not because baristas bring customers in: the case’s managers roster more baristas for the peak on days they expect to be busy, so the roster follows the expected crowd. In regression (B06) measures this closely related cause a problem called multicollinearity: their separate effects can’t be estimated well. Here it is enough to notice that the matrix’s strongest cells often reflect how a business is run rather than how one measure affects another.' },

    { h: 'A heatmap' },
    { p: 'A <g>heatmap</g> colours each cell by its value, usually with one colour for positive correlations, another for negative ones, and pale cells near 0. It makes blocks visible at a glance, but only if related variables sit next to each other: the Explore widget puts the iced share beside the high temperature, so the busy block shows as a dark square in the lower right of its map, where the table above, in the log’s column order, splits it. Good heatmaps make the numbers available too, because colour alone is hard to read precisely and impossible for some readers; the widget gives them in a data table beneath the map.' },
    { callout: 'key', title: 'Choose a cell, look at its scatterplot', html: 'Every cell is a single number summarising a scatterplot. Before you report a cell, look at its plot: an r of 0.08 (high temperature and peak wait) can hide nothing at all or a curve that a straight line misses, and the scatterplots lesson’s warning about 612 overlapping points applies to every cell. The Explore widget draws the scatterplot of any cell you choose.' },

    { h: 'One table, many tests' },
    { p: String.raw`Each cell can carry the testing-correlation lesson’s test of H₀: ρ = 0. Twenty-eight cells mean 28 tests. B04’s ANOVA lesson showed the problem: if every null hypothesis were true and the tests were independent, the chance of at least one false alarm among 28 tests at α = 0.05 would be <m>1 - 0.95^{28} \approx 0.76</m>, and on average 1.4 cells would be “significant” by chance alone. Tests in a matrix share variables, so they are not independent and the exact figure differs, but the warning stands: a matrix scanned for stars will find some.` },
    { p: 'With the whole year, the many-tests problem is not the main danger. With 612 days, any correlation larger than 0.08 in size is significant at 5%, so 24 of the 28 cells pass, and 22 to 24 still pass after the adjustments in the In depth section. Here the question is not whether a correlation is zero but whether it is large enough to matter, the <g>practical significance</g> of the testing-correlation lesson. The adjustments matter when samples are small: in Harbourside’s 30 June days, 18 cells are significant at 5% unadjusted, but only 10 survive the Bonferroni correction, 13 Holm’s method and 16 the Benjamini–Hochberg procedure. The challenging example works through them.' },
  ],

  theory: [
    { h: 'What a correlation matrix is' },
    { p: String.raw`For m variables, the correlation matrix is the m × m table whose cell in row i and column j is <m>r_{ij}</m>, the correlation of variable i with variable j. It has 1s on the diagonal, <m>r_{ij} = r_{ji}</m>, and <m>m(m-1)/2</m> distinct off-diagonal cells. A Spearman matrix holds Spearman’s ρ in each cell instead; the rank-correlation lesson explains when to prefer it. For the log the two tell the same story: high temperature and iced share are 0.94 by Pearson and 0.96 by Spearman, because the S-shaped curve is monotonic but not straight.` },
    { p: String.raw`Not every symmetric table of numbers between −1 and 1 can be a correlation matrix. If x and y correlate at 0.9 and y and z at 0.9, then x and z must correlate at least <m>0.9 \times 0.9 - \sqrt{(1 - 0.9^2)(1 - 0.9^2)} = 0.62</m>: variables that both follow y closely must follow each other. The general bound for any three variables is in the Formulas section. A valid matrix is what mathematicians call positive semidefinite; you rarely need the term, but you will meet its failure when a matrix is assembled from different sources or different rows.` },

    { h: 'Pairwise deletion and the n behind each cell' },
    { p: 'When some values are missing, the engine used in this course works out each cell from the rows where both of its variables are present, which is pairwise deletion. Each cell can then rest on a different set of rows and a different n, so cells are less comparable, and in bad cases the table as a whole can break the bound above. Report the n of each cell (the Explore widget shows it when you choose one), or use only rows complete on every variable, listwise deletion, if few are lost. Ana’s log has no missing values, so every cell of her matrix uses all 612 days.' },

    { h: 'Pooled groups and curves' },
    { p: 'A matrix pools whatever rows you give it, and a matrix of <g>pooled data</g> can mislead. Footfall and sales correlate at 0.89 over both cafés but at 0.98 inside Harbourside and 0.97 inside Millbrook: Millbrook has more customers with smaller tickets, so pooling the cafés blurs a nearly straight line into two. Peak barista hours and peak wait correlate at 0.53 pooled and 0.42 inside each café. The groups-and-simpsons-paradox lesson shows a pair whose sign flips. Before trusting a pooled matrix, compute it within each group too.' },
    { p: 'A matrix also holds only linear association (or monotonic association, for Spearman). Peak waits rise steeply once the load passes about seven transactions per barista hour, and rain is zero on 209 of the 306 days; a single number in a cell can’t show either shape. A near-zero cell means “no straight-line link”, not “no link”.' },

    { h: 'Building one in Excel' },
    { p: 'The Analysis ToolPak’s <b>Correlation</b> tool (Data &gt; Data Analysis &gt; Correlation) takes a block of columns with labels and returns a correlation matrix; Microsoft’s page describes each entry as CORREL’s value for that pair, and the Covariance tool beside it as doing the same with COVARIANCE.P. In use, the tool fills the lower triangle with 1s on the diagonal, writes values rather than formulas (so rerun it when the data change) and gives no p-values.' },
    { p: 'With formulas, each cell is a CORREL. With the data in B2:E31 and the variable names along the top of a grid, the cell for row variable B and column variable C is <x>=CORREL($B$2:$B$31,C$2:C$31)</x>: the dollar signs fix the row variable’s range while the column variable’s range moves as you fill right. One more column of tests is <x>=T.DIST.2T(ABS(r)*SQRT(n-2)/SQRT(1-r^2),n-2)</x> with r and n replaced by their cells, the p-value of the testing-correlation lesson’s t test. Excel has no function for the adjustments below, but each is one or two columns of formulas.' },

    { h: 'Controlling the family-wise error rate: Bonferroni and Holm' },
    { p: String.raw`The <g>family-wise error rate</g> is the chance of at least one false alarm among the m tests. The <g>Bonferroni correction</g> keeps it at or below α by testing each hypothesis at <m>\alpha / m</m>: for 28 pairs, <m>0.05 \div 28 = 0.00179</m>. Equivalently, multiply each p-value by m (capped at 1) and compare the adjusted p-value with α. It needs no assumption about how the tests depend on each other, which suits a matrix, whose tests share variables. Its cost is power: with many tests, real but moderate correlations fail the strict threshold.` },
    { p: String.raw`<g>Holm’s method</g> (Holm, 1979) keeps the same guarantee and never rejects fewer hypotheses. Sort the p-values from smallest to largest, <m>p_{(1)} \le p_{(2)} \le \dots \le p_{(m)}</m>. Compare the smallest with <m>\alpha/m</m>, the next with <m>\alpha/(m-1)</m>, and so on, the k-th with <m>\alpha/(m-k+1)</m>. Reject while each p-value is below its threshold and stop at the first that isn’t: it and every larger p-value stand. The first comparison is Bonferroni’s; after that each threshold is a little less strict, because once a hypothesis is rejected there is one fewer that could be a false alarm. Holm proved that the guarantee holds whatever the dependence between the tests.` },

    { h: 'Controlling the false discovery rate: Benjamini–Hochberg' },
    { p: String.raw`When a matrix is used to screen for leads rather than to confirm findings, guarding against even one false alarm is often too strict. Benjamini and Hochberg (1995) proposed controlling a different quantity, the <g>false discovery rate</g>: the expected proportion of false alarms among the hypotheses rejected (0 if none is rejected). At q = 0.05, about one in twenty of the pairs you report as discoveries may be false, on average.` },
    { p: String.raw`The <g>Benjamini–Hochberg procedure</g> sorts the p-values in the same way and compares the k-th smallest with <m>k\,q/m</m>, a threshold that rises in a straight line. Find the largest k whose p-value is at or below its threshold, and reject that hypothesis and every one with a smaller p-value, even if some of those were above their own thresholds. It works from the largest p-value down, so it is called a step-up procedure; Holm’s works from the smallest up and is a step-down. Benjamini and Hochberg proved the control for independent tests. The statsmodels documentation, whose procedures this course’s engine follows, notes that most of these procedures are also robust when the tests are positively correlated. Tests in a matrix need not all be, since they share variables in both directions, so when a guarantee matters Holm’s method (or the more conservative Benjamini–Yekutieli variant, which statsmodels also offers) is the safe choice.` },
    { figure: {
      svg: thresholdFigure(),
      caption: 'Harbourside, June 2027: the 20 smallest of the 28 p-values in rank order, against each procedure’s threshold. Bonferroni’s threshold is flat at 0.05 ÷ 28; Holm’s rises slowly from it; Benjamini–Hochberg’s rises in a straight line to 0.05 at rank 28. Points above 0.06 are drawn at the top edge.',
      alt: 'A chart with the rank of each p-value from 1 to 20 on the horizontal axis and the p-value from 0 to 0.06 on the vertical axis. Ten p-values sit at or very near zero. From rank 11 they rise: about 0.002 at ranks 11 and 12, 0.003 and 0.004 at ranks 13 and 14, then 0.012, 0.022, 0.033, 0.044 and 0.051, and the last at the top edge. A flat dotted line marks Bonferroni’s threshold of 0.0018, which the rank 11 p-value just exceeds. A dashed curve marks Holm’s threshold, rising slowly from 0.0018; the p-values stay under it up to rank 13. A straight solid line marks the Benjamini–Hochberg threshold, rising by 0.0018 per rank; the largest p-value under it is at rank 16. A grey horizontal line marks 0.05, which 18 p-values are below.',
    } },

    { h: 'Which to use' },
    { list: [
      '<b>Confirming a few planned relationships.</b> When a report will act on each finding, control the family-wise error rate with Holm’s method; it is never worse than Bonferroni.',
      '<b>Screening many pairs for leads.</b> When a matrix is a first look and every lead will be checked again, control the false discovery rate with Benjamini–Hochberg, and say that a share of the leads may be false.',
      '<b>Defining the family.</b> The adjustment depends on m, so decide before looking which tests form the family: the 28 cells of one matrix, not only the cells that looked interesting. Running a Pearson matrix, then a Spearman matrix, then one for each café and each month multiplies the tests again; an adjustment within each matrix doesn’t correct for that <g>p-hacking</g>.',
      '<b>Large samples.</b> With hundreds of rows almost every cell is significant with or without adjustment, so judge the size of each correlation and its interval instead.',
    ] },
  ],

  formulas: [
    { id: 'mat-pairs', name: 'Number of distinct pairs in a matrix',
      tex: String.raw`\text{pairs} = \dfrac{m(m-1)}{2}`,
      where: [[String.raw`m`, 'Number of variables in the matrix', ''], [String.raw`\text{pairs}`, 'Distinct off-diagonal cells, one test each', '']],
      note: 'Eight variables give 28 pairs; ten give 45.' },
    { id: 'mat-bound', name: 'The range a third correlation must lie in',
      tex: String.raw`r_{xy}\,r_{yz} - \sqrt{(1 - r_{xy}^2)(1 - r_{yz}^2)} \;\le\; r_{xz} \;\le\; r_{xy}\,r_{yz} + \sqrt{(1 - r_{xy}^2)(1 - r_{yz}^2)}`,
      where: [[String.raw`r_{xy}, r_{yz}`, 'The correlations of x with y and of y with z', ''], [String.raw`r_{xz}`, 'The correlation of x with z', '']],
      assumptions: 'All three correlations are worked out from the same rows.',
      note: 'A matrix that breaks it was assembled from different rows (pairwise deletion) or different sources.' },
    { id: 'mat-bonferroni', name: 'Bonferroni-adjusted p-value',
      tex: String.raw`\tilde{p}_i = \min(1,\; m\,p_i)`,
      where: [[String.raw`p_i`, 'The unadjusted p-value of test i', ''], [String.raw`m`, 'Number of tests in the family', ''], [String.raw`\tilde{p}_i`, 'Adjusted p-value, compared with α', '']],
      assumptions: 'None about dependence between the tests.',
      note: 'The same as testing each p-value against α ÷ m. Controls the family-wise error rate at α.' },
    { id: 'mat-holm', name: 'Holm’s step-down thresholds',
      tex: String.raw`\text{reject } H_{(1)}, \dots, H_{(k)} \text{ while } p_{(k)} < \dfrac{\alpha}{m - k + 1}`,
      where: [[String.raw`p_{(k)}`, 'The k-th smallest p-value', ''], [String.raw`H_{(k)}`, 'Its null hypothesis', ''], [String.raw`k`, 'Rank, 1 for the smallest p-value', ''], [String.raw`m`, 'Number of tests', ''], [String.raw`\alpha`, 'Family-wise error rate to control', '']],
      assumptions: 'None about dependence between the tests.',
      note: 'Stop at the first p-value that is not below its threshold. Adjusted p-values: (m − k + 1) p₍ₖ₎, made non-decreasing in rank and capped at 1.' },
    { id: 'mat-bh', name: 'Benjamini–Hochberg step-up rule',
      tex: String.raw`k^{*} = \max\left\{k : p_{(k)} \le \dfrac{k}{m}\,q\right\}; \quad \text{reject } H_{(1)}, \dots, H_{(k^{*})}`,
      where: [[String.raw`p_{(k)}`, 'The k-th smallest p-value', ''], [String.raw`H_{(k)}`, 'Its null hypothesis', ''], [String.raw`k^{*}`, 'The largest rank meeting the rule', ''], [String.raw`k`, 'Rank, 1 for the smallest p-value', ''], [String.raw`m`, 'Number of tests', ''], [String.raw`q`, 'False discovery rate to control', '']],
      assumptions: 'Proved for independent tests; robust to the positive dependence usual in a matrix.',
      note: 'Adjusted p-values: p₍ₖ₎ × m ÷ k, made non-increasing from the largest rank down and capped at 1.' },
  ],

  examples: [
    { level: 'simple', title: 'Three adjustments for ten p-values', fictional: true,
      setup: 'Pinecrest Hotel (fictional) correlated five weekly measures (occupancy, average room rate, review score, spa bookings and staff on shift) over a year and tested all 10 pairs. Sorted from smallest to largest, the p-values are 0.0004, 0.0021, 0.0049, 0.0068, 0.012, 0.028, 0.041, 0.13, 0.36 and 0.72. How many pairs are significant at 0.05 with no adjustment, with Bonferroni, with Holm’s method and with Benjamini–Hochberg at q = 0.05?',
      table: {
        caption: 'Pinecrest Hotel’s p-values and the thresholds they are compared with',
        head: ['Rank k', 'p-value', 'Bonferroni α/m', 'Holm α/(m − k + 1)', 'BH kq/m'],
        align: ['r', 'r', 'r', 'r', 'r'],
        rows: HOTEL.map((p, i) => [String(i + 1), String(p), '0.0050', (0.05 / (10 - i)).toFixed(4), ((i + 1) * 0.005).toFixed(4)]),
      },
      steps: [
        'No adjustment: seven p-values are below 0.05 (all up to 0.041).',
        String.raw`Bonferroni: with <m>m = 10</m> each test uses <m>0.05 \div 10 = 0.005</m>. Three p-values (0.0004, 0.0021 and 0.0049) are below it.`,
        String.raw`Holm: the thresholds are 0.05 ÷ 10, then 0.05 ÷ 9, then 0.05 ÷ 8, and so on. 0.0004 &lt; 0.0050, 0.0021 &lt; 0.0056, 0.0049 &lt; 0.0063 and 0.0068 &lt; 0.0071 are rejected; 0.012 is not below 0.0083, so the procedure stops there and the six largest stand.`,
        String.raw`Benjamini–Hochberg: the thresholds are <m>k \times 0.005</m>. Working down from the largest rank, the first p-value at or below its threshold is rank 6, 0.028 against 0.030 (rank 7’s 0.041 is above 0.035). Reject ranks 1 to 6.`,
      ],
      answer: 'Seven pairs with no adjustment, three with Bonferroni, four with Holm and six with Benjamini–Hochberg.',
      interpretation: 'The four counts answer different questions. If the hotel will act on each pair as a finding, it should use Holm’s four, with at most a 5% chance that any of them is a false alarm. If the matrix is a screen for leads to check next season, Benjamini–Hochberg’s six are reasonable, expecting that, on average, at most about one in twenty such leads will turn out false.' },

    { level: 'challenging', title: 'Twenty-eight tests on thirty days', fictional: true,
      setup: 'Ana computes the eight-measure matrix for Harbourside in June 2027 alone: 30 days, 28 pairs. Which correlations survive each adjustment at 0.05, and what explains the differences? The table shows ranks 9 to 19 of the 28 p-values, where the decisions change.',
      table: {
        caption: 'Harbourside, June 2027: ranks 9–19 of the 28 p-values, with each procedure’s threshold',
        head: ['Rank', 'Pair', 'r', 'p-value', 'Holm α/(m − k + 1)', 'BH kq/m'],
        align: ['r', 'l', 'r', 'r', 'r', 'r'],
        rows: JPAIRS.slice(8, 19).map((x, i) => [String(i + 9), `${LABEL[x.a]} – ${LABEL[x.b]}`, f2(x.r), x.p.toFixed(4), (0.05 / (28 - (i + 8))).toFixed(4), ((i + 9) * 0.05 / 28).toFixed(4)]),
      },
      steps: [
        String.raw`With n = 30 a correlation needs a size of at least 0.36 to be significant at 5% (the testing-correlation lesson’s critical r, <m>t^{*}/\sqrt{n - 2 + t^{*2}}</m> with 28 df). Eighteen of the 28 cells reach it, from transactions–sales (0.99) down to footfall–iced share (0.37, p = 0.044).`,
        String.raw`Bonferroni tests each at <m>0.05 \div 28 = 0.00179</m>. Ten pairs pass. Rank 11, rain–transactions, has p = 0.0018 (r = −0.55) and misses by a hair: at n = 30 Bonferroni needs a correlation of about 0.55 in size.`,
        'Holm compares rank 11 with 0.05 ÷ 18 = 0.0028 and rejects it; rank 12 (0.0024 against 0.0029) and rank 13 (0.0030 against 0.0031) are rejected too; rank 14, rain–footfall, has 0.0038 against 0.0033 and stops the procedure. Thirteen pairs survive.',
        'Benjamini–Hochberg looks for the largest rank whose p-value is at or below k × 0.05 ÷ 28. Rank 16, high–footfall, has 0.022 against 0.029; ranks 17 and above are all above their thresholds (0.033 against 0.030 at rank 17). Sixteen pairs are discoveries.',
        'What changes between the procedures is the band of moderate correlations, 0.42 to 0.55 in size: rain with transactions, sales and footfall, and peak barista hours with the high temperature and the iced share, and the high temperature with footfall. The ten strong ones survive everything; the last two of the 18 (high–transactions at 0.39 and footfall–iced share at 0.37) survive nothing but the unadjusted test.',
      ],
      answer: 'Eighteen pairs are significant unadjusted, ten after Bonferroni, thirteen after Holm and sixteen after Benjamini–Hochberg (all at 0.05).',
      interpretation: 'On 30 days, how Ana handles the 28 tests changes what she can claim about rain. With Holm’s method, rain–transactions and rain–sales survive but rain–footfall doesn’t, which is odd if rain keeps people away; with Benjamini–Hochberg all three survive as leads. The sensible reading is that June gives moderate evidence that rainy days were quieter at Harbourside, consistent with the whole year’s weaker but clearer −0.23, and that a month is too short to separate the rain pairs from one another. The example is fictional, like all of Lantern’s log.' },

    { level: 'applied', title: 'From a matrix to a list of questions', fictional: true,
      setup: 'Ana’s year matrix (the table in The idea) has 24 significant cells. She doesn’t want 24 findings; she wants the few questions worth her time in January. Turn the matrix into a short list.',
      steps: [
        'Remove duplicates first. Footfall and transactions correlate at 0.98, so their rows say the same thing; she keeps transactions, the measure her till records, and treats footfall as a check on it.',
        'Look for links that would change a decision. Peak barista hours and peak wait correlate at +0.53: taken at face value, more baristas go with longer waits, which would be a reason to roster fewer. Both also rise with how busy the day is (transactions correlate with barista hours at 0.93 and with waits at 0.77), so the pair needs a comparison at a given number of transactions: the partial-correlation lesson.',
        'Check pooled cells by café. High temperature and sales correlate at 0.29 pooled, 0.40 at Harbourside and 0.15 at Millbrook: the waterfront café’s trade follows the weather far more than the office café’s.',
        'Note what the matrix can’t show. Rain correlates with sales at only −0.15, but rain falls on 97 of the 306 days and is zero on the rest, so a straight-line summary undersells a link that appears only on wet days (the nonlinear-and-restricted lesson).',
      ],
      answer: 'Three questions for January: do more baristas shorten waits at a given level of trade; does Harbourside’s stock and staffing need to follow the forecast more closely than Millbrook’s; and how much does a wet day cost each café?',
      interpretation: 'The matrix did its job: it pointed at three questions and away from 21 cells that are significant but either duplicated, expected or too weak to change anything. None of the three is answered by the matrix itself; each needs a closer look, and the first needs the next lesson.' },
  ],

  demo: [
    { widget: 'mat-year', intro: 'The year’s matrix for both cafés. Choose a cell to see its scatterplot: compare footfall–transactions (one tight line) with peak barista hours–peak wait (a cloud). Switch to Spearman and watch high–iced share rise to 0.96. Then turn on an adjustment: with 612 days, Bonferroni removes only two of the 24 significant pairs.' },
    { widget: 'mat-june', intro: 'Harbourside in June: 30 days. Start with no adjustment (18 significant pairs), then try Bonferroni, Holm and Benjamini–Hochberg and find the cells that change. Choose rain–transactions to see the correlation that misses Bonferroni’s threshold by a hair.' },
    { widget: 'mat-bound', intro: 'Set the correlations of x with y and of y with z and see the range in which the third correlation must lie. Two correlations of 0.9 force the third to be at least 0.62; two of 0.5 allow anything from −0.5 to 1.' },
  ],

  mistakes: [
    { title: '“Twenty-four cells are significant, so I have 24 findings.”', html: 'With 612 days, any correlation larger than 0.08 in size is significant. Significance only says the correlation is unlikely to be exactly zero; whether 0.08 matters to anyone is a separate question. Report the size of each correlation and its interval, and pick out the few that would change a decision.' },
    { title: '“I’ll choose the adjustment after I see which one keeps my favourite pair.”', html: 'Choosing Bonferroni, Holm or Benjamini–Hochberg after seeing the results is another way of trying analyses until one works. Decide before looking: Holm when every rejection will be acted on as a finding, Benjamini–Hochberg when the matrix is a screen for leads. Define the family (which tests) in advance too.' },
    { title: '“Footfall and transactions both correlate with waiting, so that’s two pieces of evidence.”', html: 'Two measures that correlate at 0.98 carry nearly the same information. Their correlations with a third variable will be nearly identical, so counting both double-counts one piece of evidence. Choose one, or combine them, before you count links.' },
    { title: '“The cell is near zero, so the two are unrelated.”', html: 'A cell holds linear (or, for Spearman, monotonic) association over the rows you gave it. A curve, a U-shape, a variable that is zero on most days, or two groups pulling in opposite directions can all give a cell near zero. Look at the scatterplot and compute the matrix within each group.' },
    { title: '“A matrix of pairwise correlations is always valid.”', html: 'With pairwise deletion each cell may use different rows, and the table as a whole can then be impossible: for instance, 0.9 and 0.9 with a third cell of 0.2, below the 0.62 that the bound requires. Check the n behind each cell and, if many values are missing, consider listwise deletion or report the missing data.' },
  ],

  application: [
    { p: 'A correlation matrix is one of the first things an analyst builds when a dataset arrives with many measures: a retailer’s weekly store KPIs, a hotel’s nightly operating figures, a fund’s daily returns on many assets, or the dozen questions of a customer survey. It answers three practical questions quickly. Which measures are near-duplicates, so that a dashboard or model needs only one of them? Which pairs are strong enough to deserve a closer look? And which expected links are missing, which may point to a data problem (a broken feed, a column in the wrong units) rather than a business insight?' },
    { case: 'Ana’s January note reads: “The daily log’s correlation matrix (eight measures, both cafés, 612 days) has three blocks: how busy the day was (footfall, transactions, sales, peak barista hours and peak wait), the weather and the iced share, and rain. Footfall and transactions are near-duplicates (r = 0.98), so I will use transactions. With this many days almost every pair is statistically significant, so I have ranked pairs by size instead. Three questions follow: whether baristas shorten waits at a given level of trade, why Harbourside’s sales follow the weather (r = 0.40) more than Millbrook’s (0.15), and what a wet day costs each café. None of these correlations shows what causes what.”' },
    { p: 'Her note follows the habits that make a matrix useful rather than misleading. It states the rows used (both cafés, all days) and the n. It treats the matrix as a map that suggests questions, not as a list of results. It removes duplicates before counting links. It checks pooled results within each café. And it avoids causal words: the cells say what goes with what, and the last lesson of this module is about what more it would take to say what causes what.' },
    { p: 'When a matrix is used to confirm findings, the adjustment for many tests belongs in the report: say how many pairs were tested, which procedure was used and why, and give both the adjusted and unadjusted p-values for the pairs you discuss. When it is used for screening, say so, and treat every lead as a hypothesis to test again on new data, such as the next quarter’s log. A lead that holds up on data it wasn’t found in is worth far more than one that survives an adjustment on the data that suggested it.' },
  ],

  summary: [
    'A correlation matrix shows every pair of m variables in one symmetric table with 1s on the diagonal; it has m(m − 1)/2 distinct pairs (28 for 8 variables). A heatmap colours the cells, and should print the numbers too.',
    'Read the structure first: blocks of related measures, redundant measures (footfall and transactions, r = 0.98, carry one piece of evidence, not two) and near-zero pairs. Then look at the scatterplot behind any cell you report.',
    'A matrix pools the rows you give it and holds only linear (or monotonic) association: compute it within groups, and remember that a near-zero cell can hide a curve.',
    'Some combinations of correlations are impossible: if r_xy = r_yz = 0.9, r_xz must be at least 0.62. Pairwise deletion can produce such impossible matrices.',
    'Testing every cell makes false alarms likely. Bonferroni (α ÷ m) and Holm’s step-down method control the family-wise error rate whatever the dependence; Holm is never less powerful. Benjamini–Hochberg controls the false discovery rate and finds more leads.',
    'With hundreds of rows almost every cell is significant, so judge practical size; with a few dozen rows the adjustment decides what you can claim (June at Harbourside: 18 unadjusted, 10 Bonferroni, 13 Holm, 16 Benjamini–Hochberg).',
    'Use a matrix as a map for questions, decide the family and the adjustment before looking, and check leads on new data. A matrix says what goes with what, not why.',
  ],

  glossary: [
    { term: 'Correlation matrix', def: 'A square, symmetric table of the correlations between every pair of a set of variables, with 1s on the diagonal; m variables give m(m − 1)/2 distinct pairs.' },
    { term: 'Heatmap', def: 'A table or matrix drawn as a grid of coloured cells, the colour showing each cell’s value; for a correlation matrix, one colour for positive and another for negative correlations, paler near zero.' },
    { term: 'Redundant measures', def: 'Two or more variables so closely correlated that they carry nearly the same information, so that using both adds little and can double-count evidence.' },
    { term: 'Holm’s method', def: 'A step-down procedure that controls the family-wise error rate: sort the m p-values, compare the k-th smallest with α ÷ (m − k + 1), and reject until the first that is not below its threshold. Never less powerful than Bonferroni.' },
    { term: 'False discovery rate', def: 'The expected proportion of false alarms among the hypotheses rejected (taken as 0 when none is rejected).' },
    { term: 'Benjamini–Hochberg procedure', def: 'A step-up procedure that controls the false discovery rate at q: sort the m p-values and reject every hypothesis up to the largest rank k whose p-value is at or below k × q ÷ m.' },
  ],

  references: [
    { text: 'Holmes, A., Illowsky, B. &amp; Dean, S. (2023). <i>Introductory Business Statistics 2e</i>, section 13.1, “The Correlation Coefficient r”. OpenStax.', url: 'https://openstax.org/books/introductory-business-statistics-2e/pages/13-1-the-correlation-coefficient-r', checked: '2026-10-26' },
    { text: 'Microsoft Support. “Use the Analysis ToolPak to perform complex data analysis” (the Correlation and Covariance tools).', url: 'https://support.microsoft.com/en-us/topic/6c67ccf0-f4a9-487c-8dec-bdb5a2cefab6', checked: '2026-10-26' },
    { text: 'Holm, S. (1979). “A simple sequentially rejective multiple test procedure”. <i>Scandinavian Journal of Statistics</i>, 6(2), 65–70.', url: 'https://www.ime.usp.br/~abe/lista/pdf4R8xPVzCnX.pdf', checked: '2026-10-26' },
    { text: 'Benjamini, Y. &amp; Hochberg, Y. (1995). “Controlling the false discovery rate: a practical and powerful approach to multiple testing”. <i>Journal of the Royal Statistical Society, Series B</i>, 57(1), 289–300.', url: 'https://www.dcscience.net/Benjamini-Hochberg-1995-FDR.pdf', checked: '2026-10-26' },
    { text: 'statsmodels. “statsmodels.stats.multitest.multipletests” (documentation).', url: 'https://www.statsmodels.org/stable/generated/statsmodels.stats.multitest.multipletests.html', checked: '2026-10-26' },
    { text: 'NIST/SEMATECH. <i>e-Handbook of Statistical Methods</i>, section 7.4.7.3, “Bonferroni’s method”.', url: 'https://itl.nist.gov/div898/handbook/prc/section4/prc473.htm', checked: '2026-10-26' },
  ],

  checks: [
    // the year's matrix
    { what: 'Days per café', value: D.days, shown: 306 },
    { what: 'Rows', value: D.rows, shown: 612 },
    { what: 'Pairs of 8 variables', value: (8 * 7) / 2, shown: 28 },
    { what: 'Pairs in MATRIX', value: MATRIX.pairs, shown: 28 },
    { what: 'Busy block, smallest r (staff–wait)', value: Math.min(rr('footfall', 'transactions'), rr('footfall', 'sales'), rr('footfall', 'peak_staff_hours'), rr('footfall', 'peak_wait_min'), rr('transactions', 'sales'), rr('transactions', 'peak_staff_hours'), rr('transactions', 'peak_wait_min'), rr('sales', 'peak_staff_hours'), rr('sales', 'peak_wait_min'), rr('peak_staff_hours', 'peak_wait_min')), shown: 0.53 },
    { what: 'Busy block, largest r', value: rr('footfall', 'transactions'), shown: 0.98 },
    { what: 'High–iced share', value: rr('high_f', 'iced_share'), shown: 0.94 },
    { what: 'Rain with busy block: least negative (transactions)', value: rr('rain_in', 'transactions'), shown: -0.12 },
    { what: 'Rain with busy block: most negative', value: Math.min(rr('rain_in', 'footfall'), rr('rain_in', 'transactions'), rr('rain_in', 'sales'), rr('rain_in', 'peak_wait_min')), shown: -0.15 },
    { what: 'Rain–staff', value: rr('rain_in', 'peak_staff_hours'), shown: 0.03 },
    { what: 'High–rain', value: rr('high_f', 'rain_in'), shown: 0.05 },
    { what: 'High with busy measures, low end (transactions)', value: rr('high_f', 'transactions'), shown: 0.21 },
    { what: 'High with busy measures, high end (sales)', value: rr('high_f', 'sales'), shown: 0.29 },
    { what: 'High with busy measures: footfall within range', value: Number(rr('high_f', 'footfall') > 0.2 && rr('high_f', 'footfall') < 0.29 && rr('high_f', 'peak_staff_hours') > 0.2 && rr('high_f', 'peak_staff_hours') < 0.29), shown: 1 },
    { what: 'High–peak wait', value: rr('high_f', 'peak_wait_min'), shown: 0.08 },
    { what: 'r² footfall–transactions', value: rr('footfall', 'transactions') ** 2, shown: 0.96 },
    { what: 'Staff–footfall', value: rr('peak_staff_hours', 'footfall'), shown: 0.92 },
    { what: 'Staff–transactions', value: rr('peak_staff_hours', 'transactions'), shown: 0.93 },
    { what: 'Staff–wait', value: rr('peak_staff_hours', 'peak_wait_min'), shown: 0.53 },
    { what: 'Transactions–wait', value: rr('transactions', 'peak_wait_min'), shown: 0.77 },
    { what: 'Rain–sales', value: rr('rain_in', 'sales'), shown: -0.15 },
    // many tests
    { what: '1 − 0.95^28', value: 1 - 0.95 ** 28, shown: 0.76 },
    { what: 'Expected false alarms 28 × 0.05', value: 28 * 0.05, shown: 1.4 },
    { what: 'Critical r at n = 612', value: C.criticalR(612), shown: 0.08 },
    { what: 'Year: significant unadjusted', value: YEAR.none, shown: 24 },
    { what: 'Year: significant after Bonferroni', value: YEAR.bonferroni, shown: 22 },
    { what: 'Year: after BH', value: YEAR.bh, shown: 24 },
    { what: 'Year: Bonferroni removes two', value: YEAR.none - YEAR.bonferroni, shown: 2 },
    { what: 'Year: Holm', value: YEAR.holm, shown: 23 },
    { what: 'June days', value: JUNE_IDX.length, shown: 30 },
    { what: 'June: unadjusted', value: JUNE.none, shown: 18 },
    { what: 'June: Bonferroni', value: JUNE.bonferroni, shown: 10 },
    { what: 'June: Holm', value: JUNE.holm, shown: 13 },
    { what: 'June: BH', value: JUNE.bh, shown: 16 },
    // theory
    { what: 'Spearman high–iced', value: SPEAR.r[ix('high_f')][ix('iced_share')], shown: 0.96 },
    { what: 'Pearson high–iced (case)', value: D.tempIced.r, shown: 0.94 },
    { what: 'Bound with 0.9 and 0.9', value: 0.9 * 0.9 - Math.sqrt((1 - 0.81) * (1 - 0.81)), shown: 0.62 },
    { what: 'Bound with 0.5 and 0.5: lower', value: 0.25 - Math.sqrt(0.75 * 0.75), shown: -0.5 },
    { what: 'Bound with 0.5 and 0.5: upper', value: 0.25 + Math.sqrt(0.75 * 0.75), shown: 1 },
    { what: 'Footfall–sales pooled', value: rr('footfall', 'sales'), shown: 0.89 },
    { what: 'Footfall–sales Harbourside', value: byCafe('footfall', 'sales', 'Harbourside'), shown: 0.98 },
    { what: 'Footfall–sales Millbrook', value: byCafe('footfall', 'sales', 'Millbrook'), shown: 0.97 },
    { what: 'Staff–wait Harbourside', value: byCafe('peak_staff_hours', 'peak_wait_min', 'Harbourside'), shown: 0.42 },
    { what: 'Staff–wait Millbrook', value: byCafe('peak_staff_hours', 'peak_wait_min', 'Millbrook'), shown: 0.42 },
    { what: 'Millbrook more footfall', value: Number(D.meanFootfallM > D.meanFootfallH && D.meanTicketM < D.meanTicketH), shown: 1 },
    { what: 'Rain zero on 209 days (both cafés share the weather)', value: D.days - D.rainDays / 2, shown: 209 },
    { what: 'Rain on 97 days', value: D.rainDays / 2, shown: 97 },
    { what: 'Bonferroni threshold for 28', value: 0.05 / 28, shown: 0.00179, tol: 0.000005 },
    // Pinecrest
    { what: 'Hotel: unadjusted', value: nSig(HOTEL), shown: 7 },
    { what: 'Hotel: Bonferroni', value: nSig(HB), shown: 3 },
    { what: 'Hotel: Holm', value: nSig(HH), shown: 4 },
    { what: 'Hotel: BH', value: nSig(HF), shown: 6 },
    { what: 'Hotel: 0.05/10', value: 0.05 / 10, shown: 0.005, tol: 0.00005 },
    { what: 'Hotel Holm thresholds 0.05/9', value: 0.05 / 9, shown: 0.0056, tol: 0.00005 },
    { what: 'Hotel Holm 0.05/8', value: 0.05 / 8, shown: 0.0063, tol: 0.00005 },
    { what: 'Hotel Holm 0.05/7', value: 0.05 / 7, shown: 0.0071, tol: 0.00005 },
    { what: 'Hotel Holm 0.05/6', value: 0.05 / 6, shown: 0.0083, tol: 0.00005 },
    { what: 'Hotel BH rank 6', value: (6 * 0.05) / 10, shown: 0.030, tol: 0.00005 },
    { what: 'Hotel BH rank 7', value: (7 * 0.05) / 10, shown: 0.035, tol: 0.00005 },
    // June detail
    { what: 'Critical r at n = 30', value: C.criticalR(30), shown: 0.36 },
    { what: 'June top pair transactions–sales', value: Number(JPAIRS[0].a === 'transactions' && JPAIRS[0].b === 'sales'), shown: 1 },
    { what: 'June transactions–sales r', value: JPAIRS[0].r, shown: 0.99 },
    { what: 'Largest June |r| is the top pair', value: Math.max(...JPAIRS.map((x) => Math.abs(x.r))), shown: JPAIRS[0].r, tol: 1e-12 },
    { what: 'June rank 18 is footfall–iced share', value: Number(JPAIRS[17].a === 'footfall' && JPAIRS[17].b === 'iced_share'), shown: 1 },
    { what: 'June rank 18 r', value: JPAIRS[17].r, shown: 0.37 },
    { what: 'June rank 18 p', value: JPAIRS[17].p, shown: 0.044, tol: 0.0005 },
    { what: 'June rank 11 is rain–transactions', value: Number(JPAIRS[10].a === 'rain_in' && JPAIRS[10].b === 'transactions'), shown: 1 },
    { what: 'June rank 11 p', value: JPAIRS[10].p, shown: 0.0018, tol: 0.00005 },
    { what: 'June rank 11 just misses Bonferroni', value: Number(JPAIRS[10].p > 0.05 / 28), shown: 1 },
    { what: 'June rank 11 r', value: JPAIRS[10].r, shown: -0.55 },
    { what: 'Bonferroni critical r at n = 30', value: C.criticalR(30, 0.05 / 28), shown: 0.55 },
    { what: 'Holm threshold rank 11', value: 0.05 / 18, shown: 0.0028, tol: 0.00005 },
    { what: 'June rank 12 p', value: JPAIRS[11].p, shown: 0.0024, tol: 0.00005 },
    { what: 'Holm threshold rank 12', value: 0.05 / 17, shown: 0.0029, tol: 0.00005 },
    { what: 'June rank 13 p', value: JPAIRS[12].p, shown: 0.0030, tol: 0.00005 },
    { what: 'Holm threshold rank 13', value: 0.05 / 16, shown: 0.0031, tol: 0.00005 },
    { what: 'June rank 14 is rain–footfall', value: Number(JPAIRS[13].a === 'rain_in' && JPAIRS[13].b === 'footfall'), shown: 1 },
    { what: 'June rank 14 p', value: JPAIRS[13].p, shown: 0.0038, tol: 0.00005 },
    { what: 'Holm threshold rank 14', value: 0.05 / 15, shown: 0.0033, tol: 0.00005 },
    { what: 'June rank 16 is high–footfall', value: Number(JPAIRS[15].a === 'high_f' && JPAIRS[15].b === 'footfall'), shown: 1 },
    { what: 'June rank 16 p', value: JPAIRS[15].p, shown: 0.022, tol: 0.0005 },
    { what: 'BH threshold rank 16', value: (16 * 0.05) / 28, shown: 0.029, tol: 0.0005 },
    { what: 'June rank 17 p', value: JPAIRS[16].p, shown: 0.033, tol: 0.0005 },
    { what: 'BH threshold rank 17', value: (17 * 0.05) / 28, shown: 0.030, tol: 0.0005 },
    { what: 'June ranks 11–16 moderate band, smallest |r|', value: Math.min(...JPAIRS.slice(10, 16).map((x) => Math.abs(x.r))), shown: 0.42 },
    { what: 'June ranks 11–16 moderate band, largest |r|', value: Math.max(...JPAIRS.slice(10, 16).map((x) => Math.abs(x.r))), shown: 0.55 },
    { what: 'June rank 13 is high–staff', value: Number(JPAIRS[12].a === 'high_f' && JPAIRS[12].b === 'peak_staff_hours'), shown: 1 },
    { what: 'June rank 17 high–transactions r', value: JPAIRS[16].r, shown: 0.39 },
    { what: 'June rank 12 rain–sales', value: Number(JPAIRS[11].a === 'rain_in' && JPAIRS[11].b === 'sales'), shown: 1 },
    { what: 'Whole-year rain–footfall at Harbourside', value: D.rainFootfallH.r, shown: -0.23 },
    // figure caption values
    { what: 'Bonferroni 0.0018 (figure alt)', value: 0.05 / 28, shown: 0.0018, tol: 0.00005 },
    { what: 'June rank 15 p (figure alt 0.012)', value: JPAIRS[14].p, shown: 0.012, tol: 0.0005 },
    { what: 'June rank 19 p (figure alt 0.051)', value: JPAIRS[18].p, shown: 0.051, tol: 0.0005 },
    { what: 'June rank 18 p (figure alt 0.044)', value: JPAIRS[17].p, shown: 0.044, tol: 0.0005 },
    { what: 'June rank 20 above 0.06 (top edge)', value: Number(JPAIRS[19].p > 0.06), shown: 1 },
    { what: 'June ranks 1–10 near zero', value: Number(JPAIRS[9].p < 0.0001), shown: 1 },
    // applied
    { what: 'High–sales Harbourside', value: byCafe('high_f', 'sales', 'Harbourside'), shown: 0.40 },
    { what: 'High–sales Millbrook', value: byCafe('high_f', 'sales', 'Millbrook'), shown: 0.15 },
    { what: '21 cells not on the list', value: YEAR.none - 3, shown: 21 },
  ],
};
