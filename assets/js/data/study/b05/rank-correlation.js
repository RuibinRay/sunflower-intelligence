// rank-correlation.js — B05 · Rank correlation. Content only; exercises are in rank-correlation.ex.js. Uses the cafés'
// log from case.js: temperature against iced drinks and iced share (a monotonic curve), footfall against transactions
// with and without the 14 September slip (SLIP), and rain's zeros (a variable tied at one value on most days). Eight
// June days and seven April days at Harbourside are sliced from the corrected log for the hand calculations. Cobble
// Lane Hotel is fictional. Testing a rank correlation is testing-correlation's; outliers in general are
// outliers-and-influence's; curves that turn back (U shapes) are nonlinear-and-restricted's.
// Every figure printed is recomputed in `checks`.
import { column, CLEAN_ROWS, CAFE_COLUMNS, SLIP, DERIVED as D } from './case.js?v=22';
import * as C from '../../../core/correlation.js?v=22';
import { ranks } from '../../../core/stats.js?v=22';

const at = (n) => CAFE_COLUMNS.indexOf(n);
const H = { cafe: 'Harbourside' }, M = { cafe: 'Millbrook' };
const share = (r) => r[at('iced_drinks')] / (r[at('iced_drinks')] + r[at('hot_drinks')]);
const harb = CLEAN_ROWS.filter((r) => r[at('cafe')] === 'Harbourside');
const slice = (from, n) => { const i = harb.findIndex((r) => r[at('date')] === from); return harb.slice(i, i + n); };
const dayName = (r) => `${r[at('weekday')]} ${Number(r[at('date')].slice(8))} ${{ '04': 'Apr', '06': 'Jun' }[r[at('date')].slice(5, 7)]}`;
const f1 = (v) => v.toFixed(1);
const rk = (v) => (Number.isInteger(v) ? String(v) : v.toFixed(1));
const sgn = (v) => (v < 0 ? `−${Math.abs(v)}` : String(v));

// ---------------------------------------------------------------- eight June days (no ties)
const JUNE = slice('2027-06-02', 8);
const jT = JUNE.map((r) => r[at('high_f')]), jS = JUNE.map((r) => Math.round(share(r) * 1000) / 10);
const jRT = ranks(jT), jRS = ranks(jS), jD = jRT.map((v, i) => v - jRS[i]), jD2 = jD.reduce((s, v) => s + v * v, 0);
const jRho = C.spearman(jT, jS).rho, jR = C.pearson(jT, jS).r, jTau = C.kendall(jT, jS);
const jShort = 1 - (6 * jD2) / (8 * (64 - 1));
// ---------------------------------------------------------------- seven April days (rain tied at zero)
const APRIL = slice('2027-04-11', 7);
const aRain = APRIL.map((r) => r[at('rain_in')]), aFoot = APRIL.map((r) => r[at('footfall')]);
const aRR = ranks(aRain), aRF = ranks(aFoot), aD2 = aRR.reduce((s, v, i) => s + (v - aRF[i]) ** 2, 0);
const aRho = C.spearman(aRain, aFoot).rho, aTau = C.kendall(aRain, aFoot), aShort = 1 - (6 * aD2) / (7 * 48), aR = C.pearson(aRain, aFoot).r;
const aZeros = aRain.filter((v) => v === 0).length, aTiesX = (aZeros * (aZeros - 1)) / 2, aPairs = (7 * 6) / 2;
// ---------------------------------------------------------------- the café log
const icedH = { r: C.pearson(column('high_f', H), column('iced_drinks', H)).r, rho: C.spearman(column('high_f', H), column('iced_drinks', H)).rho, tau: C.kendall(column('high_f', H), column('iced_drinks', H)).tau };
const tauIced = C.kendall(column('high_f'), column('iced_share')).tau;
const fRaw = column('footfall', { ...M, raw: true }), fClean = column('footfall', M), tM = column('transactions', M), dM = column('date', M);
const slipAt = dM.indexOf(SLIP.date);
const mRaw = { r: C.pearson(fRaw, tM).r, rho: C.spearman(fRaw, tM).rho, tau: C.kendall(fRaw, tM).tau };
const mClean = { r: C.pearson(fClean, tM).r, rho: C.spearman(fClean, tM).rho, tau: C.kendall(fClean, tM).tau };
const rainH = column('rain_in', H), footH = column('footfall', H);
const rainHZeros = rainH.filter((v) => v === 0).length;
const rainH3 = { r: C.pearson(rainH, footH).r, rho: C.spearman(rainH, footH).rho, tau: C.kendall(rainH, footH).tau };
const tH = column('high_f', H), iH = column('iced_drinks', H);
const bandMean = (lo, hi) => { const v = iH.filter((_, i) => tH[i] >= lo && tH[i] < hi); return v.reduce((a, b) => a + b, 0) / v.length; };
const rainPooled = { rho: C.spearman(column('rain_in'), column('footfall')).rho };
// ---------------------------------------------------------------- Cobble Lane Hotel (fictional): two 1–5 ratings from 12 guests
const CLEAN_SCORE = [5, 4, 4, 3, 5, 2, 4, 3, 5, 1, 4, 3], OVERALL = [5, 3, 4, 3, 4, 2, 5, 2, 4, 2, 4, 3];
const hotel = { r: C.pearson(CLEAN_SCORE, OVERALL).r, rho: C.spearman(CLEAN_SCORE, OVERALL).rho, k: C.kendall(CLEAN_SCORE, OVERALL) };
const tiePairs = (v) => { const c = {}; v.forEach((u) => { c[u] = (c[u] || 0) + 1; }); return Object.values(c).reduce((s, k) => s + (k * (k - 1)) / 2, 0); };
// ---------------------------------------------------------------- the three shapes in the figure
const XS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const SHAPES = [XS.map((x) => 3 + 0.8 * x), XS.map((x) => 2 ** (x / 1.5)), XS.map((x) => (x - 5.5) ** 2)];
const shapeStats = SHAPES.map((y) => ({ r: C.pearson(XS, y).r, rho: C.spearman(XS, y).rho }));

function shapesFigure() {
  const W = 160, gap = 12, top = 46, B = 190;
  let svg = '<svg viewBox="0 0 520 240" xmlns="http://www.w3.org/2000/svg" font-size="18" fill="currentColor">';
  const titles = ['Linear', 'Curved', 'U shape'];
  const notes = ['r = 1, ρ = 1', 'r = 0.88, ρ = 1', 'r = 0, ρ = 0'];
  SHAPES.forEach((y, k) => {
    const L = 10 + k * (W + gap), lo = Math.min(...y), hi = Math.max(...y);
    const X = (v) => L + 12 + ((v - 1) / 9) * (W - 24), Y = (v) => B - ((v - lo) / (hi - lo)) * (B - top - 10);
    svg += `<line x1="${L}" x2="${L + W}" y1="${B + 8}" y2="${B + 8}" stroke="var(--ink)" stroke-width="1.2"/><line x1="${L}" x2="${L}" y1="${top - 6}" y2="${B + 8}" stroke="var(--ink)" stroke-width="1.2"/>`;
    XS.forEach((x, i) => { svg += `<circle cx="${X(x).toFixed(1)}" cy="${Y(y[i]).toFixed(1)}" r="6" fill="var(--series-${k + 1})"/>`; });
    svg += `<text x="${L + W / 2}" y="${top - 18}" text-anchor="middle" font-weight="bold">${titles[k]}</text>`;
    svg += `<text x="${L + W / 2}" y="${B + 36}" text-anchor="middle" fill="var(--ink-3)">${notes[k]}</text>`;
  });
  return `${svg}</svg>`;
}

export default {
  slug: 'rank-correlation',
  title: 'Rank correlation',
  blurb: 'Replace values by their ranks and measure how consistently one variable rises (or falls) with another, whether or not the path is straight. Calculate Spearman’s ρ and Kendall’s τ-b by hand and in Excel, handle ties, and choose between r, ρ and τ for curves, data-entry slips, ratings and a rainfall column that is zero on most days.',
  status: 'reviewed',
  objectives: [
    'Calculate the ranks of a variable, giving tied values their average rank, by hand and with RANK.AVG.',
    'Calculate Spearman’s ρ as Pearson’s r of the ranks, and with the d² shortcut when there are no ties.',
    'Calculate Kendall’s τ-b from concordant, discordant and tied pairs, and interpret it.',
    'Distinguish a monotonic relationship from a linear one, and explain why ranks resist a single wild value.',
    'Choose between Pearson’s r, Spearman’s ρ and Kendall’s τ-b for curved relationships, ordinal ratings, heavy ties and suspect data, and report the choice.',
  ],
  prerequisites: [
    { lesson: 'b05/covariance-and-pearson', why: 'Spearman’s ρ is Pearson’s r calculated on ranks, so you need r, its range and what it measures.' },
    { lesson: 'b05/scatterplots', why: 'Direction, form and unusual points are read from the plot before any coefficient is chosen.' },
    { lesson: 'b04/describing-distributions', why: 'Medians, percentiles and skewed variables: ranks are the idea behind all three.' },
  ],
  case: 'lantern',

  concept: [
    { case: 'At the end of 2027 Ana runs Pearson’s r on every pair of columns in the cafés’ log. Two results puzzle her. Footfall and transactions, which ought to move almost in step, give r = 0.68 across the 612 café-days; the covariance lesson found 0.98 once the log was checked. And at Harbourside the day’s high temperature and the number of iced drinks sold give r = 0.73, although the scatterplot shows iced drinks rising on almost every warmer day. In both cases r is answering a narrower question than the one she is asking.' },

    { h: 'From values to ranks' },
    { p: 'Pearson’s r measures how closely the points follow a straight line. Ana’s question is often simpler: when one variable is higher, is the other higher too? To answer that, throw away the distances between values and keep only their order. The <g>rank</g> of a value is its position when the values are sorted: the smallest gets rank 1, the next rank 2, and so on up to n.' },
    { p: 'The table shows eight Harbourside days from 2 to 9 June 2027, with the day’s high and the share of drinks that were iced. Wednesday 2 June was the coolest day, 67°F, so it has temperature rank 1; Sunday 6 June, at 77°F, has rank 8. The iced shares are ranked the same way, separately.' },
    { table: {
      caption: 'Harbourside, 2–9 June 2027: temperature and iced share, and their ranks (fictional log)',
      head: ['Day', 'High (°F)', 'Iced share (%)', 'Rank of high', 'Rank of share', 'd'],
      rows: JUNE.map((r, i) => [dayName(r), String(jT[i]), f1(jS[i]), rk(jRT[i]), rk(jRS[i]), sgn(jD[i])]),
      align: ['l', 'r', 'r', 'r', 'r', 'r'],
      note: 'd is the rank of the high minus the rank of the share.',
    } },
    { p: String.raw`The two rank columns agree except on two days: 9 June was the third-coolest day but had the fourth-smallest iced share, and 4 June the reverse. <g>Spearman’s rank correlation</g>, written <m>r_s</m> or “Spearman’s ρ” (rho), is Pearson’s r calculated on the two columns of ranks. Here it is 0.976, against r = 0.915 on the values themselves. The ranks say the hotter the day, the larger the iced share, almost without exception; r is lower because the points bend away from a straight line.` },
    { callout: 'note', title: 'Two meanings of ρ', html: 'The next lesson uses ρ for the population correlation, the value r estimates. Spearman’s statistic is also called ρ by long habit. To keep them apart this course writes “Spearman’s ρ” or <m>r_s</m> for the rank statistic, and plain ρ only for the population correlation.' },

    { h: 'Monotonic, not only linear' },
    { p: 'A <g>monotonic relationship</g> is one in which y never moves against x: as x rises, y rises (or stays level), or y falls throughout. A straight line is monotonic, but so is a curve that climbs steeply and then flattens. Spearman’s ρ is 1 whenever y rises every time x rises, curved or not; Pearson’s r is 1 only for a perfect straight line.' },
    { figure: {
      svg: shapesFigure(),
      caption: 'Three sets of ten points. Linear: a straight line, so r and Spearman’s ρ are both 1. Curved: a curve that keeps rising, so ρ is still 1, because the order is perfect, but r is 0.88. U shape: y falls then rises, and both are 0, although y depends exactly on x.',
      alt: 'Three small scatterplots side by side. The first, labelled Linear, shows ten points on a rising straight line, with r = 1 and ρ = 1. The second, labelled Curved, shows ten points that rise slowly and then steeply, with r = 0.88 and ρ = 1. The third, labelled U shape, shows ten points high at both ends and low in the middle, with r = 0 and ρ = 0.',
    } },
    { p: 'Harbourside’s iced drinks are a curve of the second kind. On days below 55°F the café sold about five iced drinks on average; through the 60s sales climbed steadily, from about 18 a day at 60–64°F to about 28 at 65–69°F; in the mid-70s they jumped, from about 42 a day at 72–74°F to about 68 at 75–77°F; above that they grew more slowly, to about 83 on days of 84°F or more. Across the café’s 306 days, r = 0.73 but Spearman’s ρ = 0.92. Nothing is wrong with r: the link really is far from straight. But if Ana’s question is “do warmer days go with more iced drinks?”, ρ answers it and r understates it. The third panel is a warning in the other direction: ranks don’t rescue a relationship that turns back on itself, which the nonlinear-and-restricted lesson takes up.' },

    { h: 'Kendall’s τ: counting agreeing pairs' },
    { p: 'A second rank measure looks at pairs of days. Take any two of the eight June days. If the hotter of the two also had the larger iced share, the pair is a <g>concordant pair</g>; if the hotter day had the smaller share, it is a <g>discordant pair</g>. Eight days make 8 × 7 ÷ 2 = 28 pairs. Only one is discordant: 4 June and 9 June, where the hotter day (70°F against 69°F) had the smaller share. The other 27 are concordant.' },
    { p: String.raw`Kendall’s τ (tau) is the surplus of concordant over discordant pairs as a share of all pairs: <m>(27 - 1) \div 28 = 0.929</m>. Like ρ it runs from −1 (every pair discordant) to +1 (every pair concordant), and 0 means agreement and disagreement balance. Without ties it also has a plain reading: pick two days at random, and the chance that they are ordered the same way on both variables exceeds the chance that they are ordered oppositely by τ. With ties the version software reports is <g>Kendall’s τ-b</g>, which the In depth section explains.` },

    { h: 'Why ranks resist a slip' },
    { p: 'On 14 September Millbrook’s door counter recorded 256 people; the log shows 2,566, an extra digit typed by hand. On a scatterplot that day sits far to the right of every other day, with an ordinary 130 transactions. Pearson’s r works with distances from the mean, so one point ten times too far out drags it down: with the slip, footfall and transactions at Millbrook give r = 0.52; corrected, r = 0.99.' },
    { p: 'In ranks the slip is merely the busiest day, rank 306 instead of its true 156. That changes one rank, by a bounded amount, and Spearman’s ρ moves only from 0.97 to 0.96. Kendall’s τ-b barely moves either, 0.86 against 0.85. This is the sense in which rank correlations are <g>robust statistics</g>: a single wild value can shift a rank no further than the end of the list. It is also a reason to compute r and ρ side by side: when they disagree sharply, look at the plot before believing either.' },
    { callout: 'key', title: 'What a rank correlation measures', html: 'Spearman’s ρ and Kendall’s τ measure the strength and direction of a <b>monotonic</b> association: how consistently higher values of one variable go with higher (or lower) values of the other. They ignore the distances between values, so they don’t care whether the path is straight, and one extreme value moves them little. Pearson’s r measures <b>linear</b> association, and uses the distances.' },
  ],

  theory: [
    { h: 'Ranking, and what to do with ties' },
    { p: 'Two values that are equal must share a rank. The standard rule gives each the <g>average rank</g> of the positions they occupy. If the third, fourth and fifth smallest values are all 2, each gets (3 + 4 + 5) ÷ 3 = 4, and the next value gets rank 6. The ranks still add up to n(n + 1) ÷ 2, as they would without ties.' },
    { p: 'Excel’s RANK.AVG(number, ref, order) does exactly this. A single-cell Spearman formula such as <x>=CORREL(RANK.AVG(A2:A9,A2:A9,1),RANK.AVG(B2:B9,B2:B9,1))</x> works in Excel 365 and Excel 2021, which evaluate RANK.AVG for every value in the range; in older versions it must be entered as an array formula with Ctrl+Shift+Enter, or you can rank into helper columns and take CORREL of those. Its third argument matters: left out or 0, it ranks from largest to smallest (the largest value gets rank 1); any non-zero value, such as 1, ranks from smallest to largest. For a correlation either direction works, provided both variables are ranked the same way: ranking one up and the other down flips the sign. RANK.EQ, and the older RANK, give tied values the top rank of the group instead of the average, which shifts the ranks and changes ρ when there are ties: use RANK.AVG.' },
    { p: 'Rain is the extreme case in the cafés’ log. Rain fell on only 97 of the 306 days, so at Harbourside 209 days are tied at 0 inches and share the average rank (1 + 209) ÷ 2 = 105. Spearman’s ρ for rain and footfall at Harbourside is then largely a comparison of dry days with wet ones, refined by the order of the 97 wet days. It comes out at −0.23, the same as r (−0.23); τ-b is −0.17. With the cafés pooled, ρ is −0.12.' },

    { h: 'Spearman’s ρ and the d² shortcut' },
    { p: String.raw`The definition is the one in the concept section: rank x, rank y, and take Pearson’s r of the ranks. When there are no ties, the ranks of each variable are exactly 1 to n, their means and standard deviations are known in advance, and the formula collapses to a shortcut in the differences <m>d_i</m> between each observation’s two ranks:` },
    { math: String.raw`r_s = 1 - \dfrac{6\sum d_i^2}{n(n^2 - 1)}` },
    { p: String.raw`For the June days, <m>\sum d_i^2 = 1 + 1 = 2</m>, so <m>r_s = 1 - 6 \times 2 \div (8 \times 63) = 1 - 12 \div 504 = 0.976</m>, the same as Pearson’s r of the ranks. The shortcut is exact only without ties. With ties it gives a different, wrong answer. (Tie-corrected versions of the formula exist, but taking r of the average ranks is simpler and always right.) The challenging example shows a week of rain in which the shortcut gives −0.32 and the true Spearman’s ρ is −0.45. Software always uses the definition; by hand, use the shortcut only when every value in each column is different.` },

    { h: 'Kendall’s τ-a and τ-b' },
    { p: String.raw`Write <m>n_c</m> and <m>n_d</m> for the numbers of concordant and discordant pairs and <m>n_0 = n(n-1)/2</m> for all pairs. Kendall’s original coefficient, τ-a, is <m>(n_c - n_d) \div n_0</m>. A pair tied on x or on y is neither concordant nor discordant, so with many ties τ-a cannot reach ±1 even for a perfect ordering. τ-b corrects the denominator for the ties:` },
    { math: String.raw`\tau_b = \dfrac{n_c - n_d}{\sqrt{(n_0 - n_1)(n_0 - n_2)}}` },
    { p: String.raw`where <m>n_1</m> is the number of pairs tied on x and <m>n_2</m> the number tied on y. Without ties <m>n_1 = n_2 = 0</m> and τ-b equals τ-a. SciPy’s kendalltau reports τ-b by default, and so does this course’s engine. Excel has no function for either: Kendall’s τ needs every pair compared, which is a job for statistical software or a pairwise table, not for a single worksheet formula.` },

    { h: 'Reading the sizes' },
    { p: 'Spearman’s ρ is on the same scale as r: both are correlations, so ρ = 0.96 and r = 0.94 can be compared directly. Kendall’s τ is on a different scale and is usually smaller in size for the same data. For temperature and iced share across both cafés, r = 0.94, Spearman’s ρ = 0.96 and τ-b = 0.83: three descriptions of one very strong association, not a weaker result from τ. Compare τ with τ, and ρ with r.' },
    { p: 'Verbal labels such as “strong” or “weak” are conventions that differ between textbooks, and a scale written for r doesn’t transfer to τ. Report the number and the measure; if you use a label, say whose scale it is.' },

    { h: 'Ordinal data' },
    { p: 'An <g>ordinal variable</g> has ordered categories with no fixed distance between them: a 1–5 rating, a size from small to large, a ranking of suppliers. Pearson’s r treats the gap from 1 to 2 as equal to the gap from 4 to 5, which the scale doesn’t promise. Rank correlations use only the order, which is all an ordinal scale has.' },
    { p: 'Cobble Lane Hotel (fictional) asked 12 guests to rate the cleanliness of their room and their stay overall, each from 1 to 5. Ratings on a five-point scale tie heavily: four guests gave cleanliness a 4, so they share the average rank 7.5. The table shows the three measures.' },
    { table: {
      caption: 'Cobble Lane Hotel (fictional): 12 guests’ cleanliness and overall ratings (1–5)',
      head: ['Measure', 'Value', 'What it uses'],
      rows: [
        ['Pearson’s r', '0.817', 'The ratings as if they were measurements'],
        ['Spearman’s ρ', '0.836', 'Average ranks; Pearson’s r of the ranks'],
        ['Kendall’s τ-b', '0.748', '42 concordant and 2 discordant pairs of 66, corrected for ties'],
      ],
      align: ['l', 'r', 'l'],
    } },
    { p: 'All three agree that guests who rate cleanliness higher tend to rate their stay higher. With this many ties some analysts prefer τ-b, whose tie correction is built into its definition, and NIST’s Dataplot documentation recommends τ-b over τ-a when ties exist. Spearman’s ρ with average ranks is also widely used for ratings. Either is defensible; what isn’t is reporting r on five-point ratings without saying that you have treated them as measurements.' },

    { h: 'Significance, briefly' },
    { p: 'Rank correlations have tests too. Software usually tests Spearman’s ρ with the same t statistic it uses for r, applied to the ranks, and Kendall’s τ with a normal approximation; for small samples without ties exact tables exist. For rain and footfall at Harbourside both give p-values below 0.001. The testing-correlation lesson covers the logic, the t statistic and confidence intervals.' },

    { h: 'Choosing among r, ρ and τ' },
    { table: {
      caption: 'Which correlation to report',
      head: ['Situation', 'Prefer', 'Why'],
      rows: [
        ['Both variables numeric, plot roughly straight, no wild values', 'Pearson’s r', 'Uses all the information; links to regression (B06) and r²'],
        ['A curve that keeps rising or keeps falling', 'Spearman’s ρ (or τ-b)', 'Measures the consistency of the order, which r understates'],
        ['Ordinal data, such as 1–5 ratings', 'Spearman’s ρ or Kendall’s τ-b', 'The scale has order but no fixed distances'],
        ['Many ties, small samples', 'Kendall’s τ-b', 'Its tie correction and pair-counting reading suit heavy ties'],
        ['A suspected slip or extreme value', 'Check it first; report r and ρ side by side', 'Ranks limit the damage but don’t say whether the value is right'],
        ['A curve that turns back (U shape)', 'None of them alone', 'All three can be near 0 for a strong link: plot it'],
      ],
    } },
    { p: 'Ranks cost something. They discard how far apart values are, so for data that really are linear and well behaved r uses more information. They don’t fix a link that changes direction, a relationship that differs between groups (the groups-and-simpsons-paradox lesson), or two variables that both trend through the year. And ρ = 0.96 doesn’t say a slip isn’t there: it says the slip barely changes the order. Finding and correcting it is the outliers-and-influence lesson’s work.' },
  ],

  formulas: [
    { id: 'rank-spearman', name: 'Spearman’s rank correlation (definition)',
      tex: String.raw`r_s = \text{Pearson’s } r \text{ of } \big(\text{rank}(x_i),\ \text{rank}(y_i)\big)`,
      where: [[String.raw`r_s`, 'Spearman’s rank correlation, also written Spearman’s ρ', ''], [String.raw`\text{rank}(x_i)`, 'The rank of observation i’s x value among all the x values, ties given their average rank', ''], [String.raw`\text{rank}(y_i)`, 'The rank of observation i’s y value among all the y values, ranked in the same direction', '']],
      assumptions: 'Paired observations of two variables that can be put in order.',
      note: 'Excel 365 or 2021: <x>=CORREL(RANK.AVG(A2:A9,A2:A9,1),RANK.AVG(B2:B9,B2:B9,1))</x> (older versions: Ctrl+Shift+Enter); or rank each column with RANK.AVG in helper columns and take CORREL of those.' },
    { id: 'rank-d2', name: 'Spearman’s ρ from rank differences (no ties only)',
      tex: String.raw`r_s = 1 - \dfrac{6\sum d_i^2}{n(n^2 - 1)}`,
      where: [[String.raw`d_i`, 'Observation i’s rank on x minus its rank on y', ''], [String.raw`n`, 'Number of paired observations', ''], [String.raw`r_s`, 'Spearman’s rank correlation', '']],
      assumptions: 'No tied values in either variable; with ties it gives a wrong answer.',
      note: 'With ties, use the definition: Pearson’s r of the average ranks.' },
    { id: 'rank-average', name: 'Average rank of a group of tied values',
      tex: String.raw`\text{average rank} = \dfrac{\text{first position} + \text{last position}}{2}`,
      where: [[String.raw`\text{first position}`, 'The position the lowest member of the tied group would take in the sorted list', ''], [String.raw`\text{last position}`, 'The position the highest member would take', '']],
      note: 'Excel’s RANK.AVG; with order 1 the smallest value has position 1.' },
    { id: 'rank-tau-b', name: 'Kendall’s τ-b',
      tex: String.raw`\tau_b = \dfrac{n_c - n_d}{\sqrt{(n_0 - n_1)(n_0 - n_2)}}, \qquad n_0 = \dfrac{n(n-1)}{2}`,
      where: [[String.raw`n_c`, 'Number of concordant pairs: the observation higher on x is also higher on y', ''], [String.raw`n_d`, 'Number of discordant pairs: the observation higher on x is lower on y', ''], [String.raw`n_0`, 'Number of pairs of observations', ''], [String.raw`n_1`, 'Number of pairs tied on x', ''], [String.raw`n_2`, 'Number of pairs tied on y', ''], [String.raw`n`, 'Number of observations', '']],
      assumptions: 'Paired observations that can be put in order on each variable.',
      note: 'Without ties n₁ = n₂ = 0 and τ-b = τ-a = (n_c − n_d) ÷ n₀. Excel has no built-in function.' },
  ],

  examples: [
    { level: 'simple', title: 'Spearman’s ρ for eight June days, two ways', fictional: true,
      setup: 'Use the eight Harbourside days from 2 to 9 June 2027 in the concept section’s table: the day’s high and the share of drinks that were iced. No value is repeated in either column. Calculate Spearman’s ρ by the d² shortcut and check it against Pearson’s r of the ranks.',
      steps: [
        'Rank each column from smallest to largest, separately. Highs: 67°F (2 June) is rank 1 and 77°F (6 June) is rank 8. Shares: 34.6% (2 June) is rank 1 and 71.8% (6 June) rank 8.',
        'Subtract: d = rank of high − rank of share. Six days have d = 0; 4 June has d = 4 − 3 = 1 and 9 June has d = 3 − 4 = −1. The d values always add to 0, a quick check on the ranking.',
        String.raw`Square and add: <m>\sum d^2 = 1 + 1 = 2</m>. With n = 8 and no ties the shortcut applies: <m>r_s = 1 - 6 \times 2 \div (8 \times (64 - 1)) = 1 - 12 \div 504 = 0.976</m>.`,
        'Check by the definition: Pearson’s r of the two rank columns, <x>=CORREL(D2:D9,E2:E9)</x> if the ranks are in D and E, also gives 0.976. Without ties the two routes must agree.',
        'Compare with Pearson’s r of the values themselves: 0.915. The ranks agree almost perfectly while the values bend away from a line.',
      ],
      answer: 'Spearman’s ρ = 0.976 by both routes; Pearson’s r of the values is 0.915.',
      interpretation: 'Over these eight days a hotter day went with a larger iced share every time but once. Eight days are far too few to generalise from (the testing-correlation lesson shows how few), but the pattern matches the whole year’s: Spearman’s ρ for temperature and iced share across all 612 café-days is 0.96.' },
    { level: 'challenging', title: 'A wet week: ties, the shortcut’s error, and Kendall’s τ-b', fictional: true,
      setup: 'Harbourside, Sunday 11 to Saturday 17 April 2027 (corrected log). Rain (inches) and footfall: Sun 0.15 and 151; Mon 0 and 100; Tue 0 and 101; Wed 0 and 96; Thu 0.38 and 54; Fri 0.02 and 81; Sat 0 and 170. Calculate Spearman’s ρ correctly, show what the d² shortcut would give, and calculate Kendall’s τ-b.',
      table: { head: ['Day', 'Rain (in)', 'Footfall', 'Rank of rain', 'Rank of footfall'], rows: APRIL.map((r, i) => [r[at('weekday')], r[at('rain_in')].toFixed(2), String(aFoot[i]), rk(aRR[i]), rk(aRF[i])]), align: ['l', 'r', 'r', 'r', 'r'] },
      steps: [
        'Rank rain from smallest to largest. Four days had no rain; they occupy positions 1 to 4 and share the average rank (1 + 4) ÷ 2 = 2.5. Then 0.02 (Friday) is 5, 0.15 (Sunday) is 6 and 0.38 (Thursday) is 7. Footfall has no ties: 54 is rank 1 up to 170, rank 7.',
        String.raw`Spearman’s ρ by the definition: Pearson’s r of the two rank columns, which gives <m>r_s = -0.453</m>.`,
        String.raw`The shortcut, wrongly applied: the squared rank differences add to 74, and <m>1 - 6 \times 74 \div (7 \times 48) = -0.321</m>. The tie at 2.5 breaks the assumption the shortcut rests on (ranks exactly 1 to 7), so its answer is off by more than 0.1.`,
        String.raw`Kendall’s pairs: 7 days make 21 pairs. The four dry days form 4 × 3 ÷ 2 = 6 pairs tied on rain, which count as neither concordant nor discordant. Of the other 15, 4 are concordant (the wetter day was busier, mostly because Sunday was both wet and busy) and 11 discordant. Footfall has no ties.`,
        String.raw`<m>\tau_b = (4 - 11) \div \sqrt{(21 - 6)(21 - 0)} = -7 \div \sqrt{315} = -0.394</m>. τ-a would be <m>-7 \div 21 = -0.333</m>, pulled towards 0 by the ties.`,
      ],
      answer: 'Spearman’s ρ = −0.453 (the d² shortcut would give −0.321, which is wrong); Kendall’s τ-b = −0.394.',
      interpretation: 'Wetter days went with fewer customers more often than not, but one week can’t separate rain from the day of the week: the busy, wet Sunday works against the pattern, and the two busiest days were a dry Saturday and that Sunday. Across Harbourside’s 306 days ρ is −0.23. The lesson for method is general: with ties, compute ρ as r of the average ranks, never by the shortcut.' },
    { level: 'applied', title: 'Which correlation should Ana report for footfall and transactions?', fictional: true,
      setup: 'Ana’s year-end summary needs one number for how closely transactions follow footfall at Millbrook. Her log, as typed, gives Pearson’s r = 0.519, Spearman’s ρ = 0.963 and Kendall’s τ-b = 0.853 across the café’s 306 days. What should she report?',
      steps: [
        'Notice the disagreement: r and ρ normally sit close together for a relationship as tight as this one. A gap of more than 0.4 means a few points dominate r.',
        'Plot and find the cause: one day, 14 September, shows 2,566 people and 130 transactions. Every other day has fewer than 410 people. Checked against the door counter’s own record, the true figure is 256: a typing slip.',
        'Correct the record, then recompute: r = 0.985, Spearman’s ρ = 0.969, τ-b = 0.860. Correcting one value moved r by 0.47 and ρ by 0.006.',
        'Choose: with the slip corrected, the plot is close to a straight line with no wild points, so Pearson’s r is the natural measure, and it links to the regression Ana will fit in B06. She reports r = 0.985 and notes that Spearman’s ρ, 0.969, agrees.',
      ],
      answer: 'Report r = 0.985 on the corrected log (Spearman’s ρ = 0.969 as a check), and record the 14 September correction. Don’t report r = 0.519 from the uncorrected log, or ρ in its place.',
      interpretation: 'Ranks protected ρ from the slip, but switching to ρ would have hidden an error that also distorts totals, averages and every other analysis using footfall. The useful habit is to compute r and ρ together as a screen: when they disagree, look for the reason before choosing. The outliers-and-influence lesson covers what to do when the extreme value is real rather than a slip.' },
  ],

  demo: [
    { widget: 'rank-iced', intro: 'Harbourside’s 306 days: the day’s high against iced drinks sold. Pearson’s r is 0.734, Spearman’s ρ 0.924. Tick “Plot ranks instead of values”: the curve straightens into a band, and Pearson’s r of the ranks is Spearman’s ρ. Add the least-squares line in each view to see how much better a line fits the ranks.' },
    { widget: 'rank-slip', intro: 'Millbrook’s log as typed, with the 14 September slip. Note r and ρ, then leave out the most influential point: r jumps from 0.519 to 0.985 while ρ hardly changes. Plot the ranks to see why: in ranks the slip is just the top-ranked day.' },
    { widget: 'rank-sheet', intro: 'The eight June days with their ranks, d and d², and both routes to Spearman’s ρ. Change one iced share so that it equals another (type 57.3 in C8, say): RANK.AVG gives the pair an average rank, Pearson’s r of the ranks stays correct, and the d² shortcut drifts away from it.' },
  ],

  mistakes: [
    { title: 'Using the d² shortcut on tied data', html: 'The formula 1 − 6Σd² ÷ (n(n² − 1)) assumes each column’s ranks are exactly 1 to n. With ties it gives a different number, sometimes far off: −0.32 instead of −0.45 for the wet April week. Compute Spearman’s ρ as Pearson’s r of the average ranks whenever any value repeats.' },
    { title: '“τ = 0.83 is weaker than r = 0.94.”', html: 'Kendall’s τ is on its own scale and is usually smaller in size than ρ or r for the same data. Temperature and iced share give r = 0.94, ρ = 0.96 and τ-b = 0.83: one very strong association, three measures. Compare τ only with other τ values.' },
    { title: '“Spearman’s ρ is 0.92, so the relationship is almost linear.”', html: 'ρ measures monotonicity, not straightness. Harbourside’s iced drinks are clearly curved against temperature (r = 0.73) yet ρ = 0.92. To judge whether a line describes the data, look at the scatterplot and compare r with ρ.' },
    { title: 'Ranking the two columns in opposite directions', html: 'RANK.AVG ranks from largest to smallest unless its third argument is non-zero. Ranking temperature with order 1 and iced share with the default reverses one set of ranks and flips the sign of ρ. Use the same order for both columns (order 1 is the usual choice).' },
    { title: '“Ranks are robust, so I don’t need to check the data.”', html: 'Ranks limit how far one bad value can move the coefficient; they don’t correct it or tell you it exists. Millbrook’s slip barely moved ρ but still made footfall’s total and mean wrong. Use a large gap between r and ρ as a reason to look, then fix the record.' },
    { title: 'Using ρ to rescue a U shape', html: 'Rank correlations measure monotonic association. A relationship that falls and then rises can give ρ ≈ 0 as well as r ≈ 0 though y depends strongly on x. Ranks help with curves that keep going one way, not with curves that turn back.' },
  ],

  application: [
    { case: 'Ana’s year-end summary has a column for each pair of measures: Pearson’s r, Spearman’s ρ, and a note when they differ by more than 0.1. Temperature and iced share: r = 0.94, ρ = 0.96, “curved: an S shape, flat in cold weather, steep in mild weather, levelling off on hot days; ρ describes the consistency, r the straight-line fit”. Footfall and transactions: r = 0.98 after correcting 14 September. Rain and footfall: r = −0.14 and ρ = −0.12 pooled, “rain is zero on two days in three, so this mostly compares wet days with dry ones”.' },
    { p: 'The pairing earns its place. When r and ρ agree, the choice hardly matters and r is the conventional one to report. When they disagree, the gap itself is information: a curve (ρ above r), one or two extreme points (usually ρ above r), or occasionally a cluster of extreme points that happen to line up (r above ρ). In each case the next step is the scatterplot, and the number Ana reports depends on what the plot shows, not on which coefficient looks more impressive.' },
    { p: 'Rank correlations are the everyday tool wherever the data are orders rather than measurements. A hotel group compares cleanliness ratings with overall ratings across its properties; a battery-storage installer checks whether the supplier its engineers rank first for reliability is also the one with the fewest warranty claims; an HR team checks whether two interviewers rank the same candidates in a similar order. In each, Spearman’s ρ or Kendall’s τ-b answers “do these orderings agree?” without pretending that the gap between first and second equals the gap between fifth and sixth.' },
    { p: 'They are also a sensible second opinion on skewed money variables, such as sales per customer or order values, where a few very large values dominate r. Reporting both, with a sentence on why they differ, is more honest than choosing whichever is larger. And none of these coefficients says why two things move together: that warmer days go with more iced drinks is plain, but the correlation-and-causation lesson is where a link becomes a claim that one thing causes another.' },
  ],

  summary: [
    'A rank is a value’s position in the sorted list; tied values share the average of the positions they occupy (Excel’s RANK.AVG, with the same order for both columns).',
    'Spearman’s ρ (r_s) is Pearson’s r of the ranks. Without ties it equals 1 − 6Σd² ÷ (n(n² − 1)); with ties that shortcut is wrong.',
    'Kendall’s τ-b counts pairs: (concordant − discordant) ÷ √((n₀ − n₁)(n₀ − n₂)). It is usually smaller in size than ρ, so compare τ with τ.',
    'Rank correlations measure monotonic association: Harbourside’s curved iced-drink sales give r = 0.73 but ρ = 0.92. They are 0 for a U shape, just as r is.',
    'Ranks limit the effect of one wild value: Millbrook’s slip drops r from 0.99 to 0.52 but ρ only from 0.97 to 0.96. They don’t fix the data.',
    'Use ρ or τ-b for ordinal ratings and heavy ties; use r for straight, well-behaved numeric data; compute r and ρ together and investigate when they disagree.',
  ],

  glossary: [
    { term: 'Rank', def: 'An observation’s position when the values of a variable are sorted, usually from the smallest (rank 1) to the largest (rank n).' },
    { term: 'Average rank', def: 'The rank given to each of a group of tied values: the mean of the positions the group occupies in the sorted list. Excel’s RANK.AVG.' },
    { term: 'Spearman’s rank correlation', def: 'Pearson’s correlation coefficient calculated on the ranks of two variables (ties given average ranks), written r_s or Spearman’s ρ. It measures the strength and direction of a monotonic association, from −1 to +1.' },
    { term: 'Monotonic relationship', def: 'A relationship in which one variable never moves against the other: as x increases, y increases or stays level throughout, or decreases or stays level throughout. A straight line is one kind; a curve that keeps rising is another.' },
    { term: 'Concordant pair', def: 'Two observations ordered the same way on both variables: the one that is higher on x is also higher on y.' },
    { term: 'Discordant pair', def: 'Two observations ordered in opposite ways on the two variables: the one that is higher on x is lower on y.' },
    { term: 'Kendall’s τ-b', def: 'A rank correlation from −1 to +1: the number of concordant pairs minus the number of discordant pairs, divided by a denominator that allows for pairs tied on either variable. Written τ-b; without ties it equals Kendall’s original τ-a.' },
  ],

  references: [
    { text: 'NIST/SEMATECH. Dataplot reference manual, “Rank correlation independence test” (Spearman’s ρ as the correlation of ranks, with average ranks for ties).', url: 'https://itl.nist.gov/div898/software/dataplot/refman1/auxillar/rankcorr.htm', checked: '2026-10-26' },
    { text: 'NIST/SEMATECH. Dataplot reference manual, “Kendall’s tau” (concordant and discordant pairs; τ-a, τ-b and the treatment of ties).', url: 'https://itl.nist.gov/div898/software/dataplot/refman2/auxillar/kendell.htm', checked: '2026-10-26' },
    { text: 'SciPy documentation. “scipy.stats.kendalltau” (τ-b as the default; ties in x, in y and in both).', url: 'https://docs.scipy.org/doc/scipy-1.12.0/reference/generated/scipy.stats.kendalltau.html', checked: '2026-10-26' },
    { text: 'Microsoft Support. “RANK.AVG function”.', url: 'https://support.microsoft.com/en-US/excel/functions/rank-avg-function', checked: '2026-10-26' },
    { text: 'Microsoft Support. “CORREL function”.', url: 'https://support.microsoft.com/en-US/excel/functions/correl-function', checked: '2026-10-26' },
  ],

  checks: [
    // the opening and the slip
    { what: 'Pooled footfall–transactions r, raw log', value: D.footTransRaw.r, shown: 0.68 },
    { what: 'Pooled footfall–transactions r, corrected', value: D.footTrans.r, shown: 0.98 },
    { what: 'Harbourside high–iced drinks r (2 dp)', value: icedH.r, shown: 0.73 },
    { what: 'Harbourside high–iced drinks r (3 dp)', value: icedH.r, shown: 0.734, tol: 0.0005 },
    { what: 'Harbourside high–iced drinks rho (2 dp)', value: icedH.rho, shown: 0.92 },
    { what: 'Harbourside high–iced drinks rho (3 dp)', value: icedH.rho, shown: 0.924, tol: 0.0005 },
    { what: 'Café-days in the log', value: D.rows, shown: 612 },
    { what: 'Days per café', value: column('date', H).length, shown: 306 },
    // the June table
    { what: 'June days', value: JUNE.length, shown: 8 },
    { what: 'June: no ties in highs', value: new Set(jT).size, shown: 8 },
    { what: 'June: no ties in shares', value: new Set(jS).size, shown: 8 },
    { what: 'Coolest June day (°F)', value: Math.min(...jT), shown: 67 },
    { what: 'Hottest June day (°F)', value: Math.max(...jT), shown: 77 },
    { what: 'Coolest day is 2 June', value: Number(JUNE[jT.indexOf(67)][at('date')] === '2027-06-02'), shown: 1 },
    { what: 'Hottest day is 6 June', value: Number(JUNE[jT.indexOf(77)][at('date')] === '2027-06-06'), shown: 1 },
    { what: 'Smallest June share (%)', value: Math.min(...jS), shown: 34.6, tol: 0.05 },
    { what: 'Largest June share (%)', value: Math.max(...jS), shown: 71.8, tol: 0.05 },
    { what: '9 June rank of high', value: jRT[7], shown: 3 },
    { what: '9 June rank of share', value: jRS[7], shown: 4 },
    { what: '4 June rank of high', value: jRT[2], shown: 4 },
    { what: '4 June rank of share', value: jRS[2], shown: 3 },
    { what: 'Days with d = 0', value: jD.filter((d) => d === 0).length, shown: 6 },
    { what: 'Sum of d', value: jD.reduce((s, v) => s + v, 0), shown: 0 },
    { what: 'Sum of d²', value: jD2, shown: 2 },
    { what: 'n(n² − 1) for n = 8', value: 8 * (8 ** 2 - 1), shown: 504 },
    { what: '6 × Σd²', value: 6 * jD2, shown: 12 },
    { what: '8² − 1', value: 8 ** 2 - 1, shown: 63 },
    { what: 'Spearman June (definition)', value: jRho, shown: 0.976, tol: 0.0005 },
    { what: 'Spearman June (shortcut)', value: jShort, shown: 0.976, tol: 0.0005 },
    { what: 'Shortcut equals definition without ties', value: jShort, shown: jRho, tol: 1e-12 },
    { what: 'Pearson June values', value: jR, shown: 0.915, tol: 0.0005 },
    { what: 'June pairs', value: (8 * 7) / 2, shown: 28 },
    { what: 'June discordant pairs', value: jTau.discordant, shown: 1 },
    { what: 'June concordant pairs', value: jTau.concordant, shown: 27 },
    { what: 'June tau', value: jTau.tau, shown: 0.929, tol: 0.0005 },
    { what: 'June tau by hand', value: (27 - 1) / 28, shown: jTau.tau, tol: 1e-12 },
    { what: '4 June high', value: jT[2], shown: 70 },
    { what: '9 June high', value: jT[7], shown: 69 },
    { what: '4 June share below 9 June share', value: Number(jS[2] < jS[7]), shown: 1 },
    // the figure
    { what: 'Line r', value: shapeStats[0].r, shown: 1, tol: 1e-9 },
    { what: 'Line rho', value: shapeStats[0].rho, shown: 1, tol: 1e-9 },
    { what: 'Curve r', value: shapeStats[1].r, shown: 0.88 },
    { what: 'Curve rho', value: shapeStats[1].rho, shown: 1, tol: 1e-9 },
    { what: 'U r', value: shapeStats[2].r, shown: 0, tol: 1e-9 },
    { what: 'U rho', value: shapeStats[2].rho, shown: 0, tol: 1e-9 },
    { what: 'Points per panel', value: XS.length, shown: 10 },
    // the slip at Millbrook
    { what: 'Slip true footfall', value: SLIP.actual, shown: 256 },
    { what: 'Slip recorded', value: SLIP.recorded, shown: 2566 },
    { what: 'Slip day transactions', value: tM[slipAt], shown: 130 },
    { what: 'Slip is 14 September', value: Number(SLIP.date === '2027-09-14'), shown: 1 },
    { what: 'Millbrook raw r', value: mRaw.r, shown: 0.52 },
    { what: 'Millbrook raw r (3 dp)', value: mRaw.r, shown: 0.519, tol: 0.0005 },
    { what: 'Millbrook clean r', value: mClean.r, shown: 0.99 },
    { what: 'Millbrook clean r (3 dp)', value: mClean.r, shown: 0.985, tol: 0.0005 },
    { what: 'Slip rank raw', value: ranks(fRaw)[slipAt], shown: 306 },
    { what: 'Slip rank clean', value: ranks(fClean)[slipAt], shown: 156 },
    { what: 'Millbrook clean rho', value: mClean.rho, shown: 0.97 },
    { what: 'Millbrook raw rho', value: mRaw.rho, shown: 0.96 },
    { what: 'Millbrook raw rho (3 dp)', value: mRaw.rho, shown: 0.963, tol: 0.0005 },
    { what: 'Millbrook clean rho (3 dp)', value: mClean.rho, shown: 0.969, tol: 0.0005 },
    { what: 'Millbrook clean tau', value: mClean.tau, shown: 0.86 },
    { what: 'Millbrook raw tau', value: mRaw.tau, shown: 0.85 },
    { what: 'Millbrook raw tau (3 dp)', value: mRaw.tau, shown: 0.853, tol: 0.0005 },
    { what: 'Millbrook clean tau (3 dp)', value: mClean.tau, shown: 0.860, tol: 0.0005 },
    { what: 'Other days under 410 people', value: Number(Math.max(...fRaw.filter((_, i) => i !== slipAt)) < 410), shown: 1 },
    { what: 'r moved by', value: mClean.r - mRaw.r, shown: 0.47 },
    { what: 'rho moved by', value: mClean.rho - mRaw.rho, shown: 0.006, tol: 0.0005 },
    { what: 'Gap between raw r and rho more than 0.4', value: Number(mRaw.rho - mRaw.r > 0.4), shown: 1 },
    { what: 'Slip roughly ten times the true value', value: SLIP.recorded / SLIP.actual, shown: 10, tol: 0.1 },
    // ties
    { what: 'Average rank of 3rd–5th', value: (3 + 4 + 5) / 3, shown: 4 },
    { what: 'Rain days', value: D.rainDays / 2, shown: 97 },
    { what: 'Harbourside dry days', value: rainHZeros, shown: 209 },
    { what: 'Dry days = 306 − rain days', value: 306 - D.rainDays / 2, shown: rainHZeros },
    { what: 'Average rank of dry days', value: (1 + 209) / 2, shown: 105 },
    { what: 'Average rank from the engine', value: ranks(rainH)[rainH.indexOf(0)], shown: 105 },
    { what: 'Harbourside rain rho', value: rainH3.rho, shown: -0.23 },
    { what: 'Harbourside rain r', value: rainH3.r, shown: -0.23 },
    { what: 'Harbourside rain tau', value: rainH3.tau, shown: -0.17 },
    { what: 'Pooled rain rho', value: rainPooled.rho, shown: -0.12 },
    { what: 'Pooled rain r', value: D.rainFootfall.r, shown: -0.14 },
    { what: 'Harbourside rain p (Spearman) below 0.001', value: Number(C.spearman(rainH, footH).p < 0.001), shown: 1 },
    { what: 'Harbourside rain p (Kendall) below 0.001', value: Number(C.kendall(rainH, footH).p < 0.001), shown: 1 },
    { what: 'Wet days at Harbourside', value: 306 - rainHZeros, shown: 97 },
    { what: 'Two days in three dry', value: rainHZeros / 306, shown: 0.67, tol: 0.02 },
    // April
    { what: 'April days', value: APRIL.length, shown: 7 },
    { what: 'April starts Sunday 11 April', value: Number(APRIL[0][at('date')] === '2027-04-11' && APRIL[0][at('weekday')] === 'Sun'), shown: 1 },
    { what: 'April ends Saturday 17 April', value: Number(APRIL[6][at('date')] === '2027-04-17' && APRIL[6][at('weekday')] === 'Sat'), shown: 1 },
    { what: 'April rain as printed', value: Number(JSON.stringify(aRain) === JSON.stringify([0.15, 0, 0, 0, 0.38, 0.02, 0])), shown: 1 },
    { what: 'April footfall as printed', value: Number(JSON.stringify(aFoot) === JSON.stringify([151, 100, 101, 96, 54, 81, 170])), shown: 1 },
    { what: 'April dry days', value: aZeros, shown: 4 },
    { what: 'Average rank of dry days (April)', value: (1 + 4) / 2, shown: 2.5 },
    { what: 'Engine rank of a dry day', value: aRR[1], shown: 2.5 },
    { what: 'Friday rain rank', value: aRR[5], shown: 5 },
    { what: 'Sunday rain rank', value: aRR[0], shown: 6 },
    { what: 'Thursday rain rank', value: aRR[4], shown: 7 },
    { what: 'Smallest April footfall', value: Math.min(...aFoot), shown: 54 },
    { what: 'Largest April footfall', value: Math.max(...aFoot), shown: 170 },
    { what: 'April rho', value: aRho, shown: -0.453, tol: 0.0005 },
    { what: 'April rho (2 dp)', value: aRho, shown: -0.45 },
    { what: 'April d²', value: aD2, shown: 74 },
    { what: '7 × 48', value: 7 * (49 - 1), shown: 336 },
    { what: 'April shortcut', value: aShort, shown: -0.321, tol: 0.0005 },
    { what: 'April shortcut (2 dp)', value: aShort, shown: -0.32 },
    { what: 'Shortcut off by more than 0.1', value: Number(Math.abs(aShort - aRho) > 0.1), shown: 1 },
    { what: 'April pairs', value: aPairs, shown: 21 },
    { what: 'April pairs tied on rain', value: aTiesX, shown: 6 },
    { what: 'April untied pairs', value: aPairs - aTiesX, shown: 15 },
    { what: 'April concordant', value: aTau.concordant, shown: 4 },
    { what: 'April discordant', value: aTau.discordant, shown: 11 },
    { what: 'April footfall no ties', value: new Set(aFoot).size, shown: 7 },
    { what: 'April tau-b', value: aTau.tau, shown: -0.394, tol: 0.0005 },
    { what: 'April tau-b by hand', value: (4 - 11) / Math.sqrt((21 - 6) * 21), shown: aTau.tau, tol: 1e-12 },
    { what: '(21 − 6) × 21', value: (21 - 6) * 21, shown: 315 },
    { what: 'April tau-a', value: (4 - 11) / 21, shown: -0.333, tol: 0.0005 },
    { what: 'April r is not used in prose', value: Number(aR < 0), shown: 1 },
    // sizes
    { what: 'Pooled temp–iced share r', value: D.tempIced.r, shown: 0.94 },
    { what: 'Pooled temp–iced share rho', value: D.tempIcedRho.rho, shown: 0.96 },
    { what: 'Pooled temp–iced share tau-b', value: tauIced, shown: 0.83 },
    // hotel
    { what: 'Hotel guests', value: CLEAN_SCORE.length, shown: 12 },
    { what: 'Guests giving cleanliness 4', value: CLEAN_SCORE.filter((v) => v === 4).length, shown: 4 },
    { what: 'Their average rank', value: ranks(CLEAN_SCORE)[1], shown: 7.5 },
    { what: 'Hotel r', value: hotel.r, shown: 0.817, tol: 0.0005 },
    { what: 'Hotel rho', value: hotel.rho, shown: 0.836, tol: 0.0005 },
    { what: 'Hotel tau-b', value: hotel.k.tau, shown: 0.748, tol: 0.0005 },
    { what: 'Hotel concordant', value: hotel.k.concordant, shown: 42 },
    { what: 'Hotel discordant', value: hotel.k.discordant, shown: 2 },
    { what: 'Hotel pairs', value: (12 * 11) / 2, shown: 66 },
    { what: 'Hotel tau-b by hand', value: (42 - 2) / Math.sqrt((66 - tiePairs(CLEAN_SCORE)) * (66 - tiePairs(OVERALL))), shown: hotel.k.tau, tol: 1e-12 },
    // application
    { what: 'Application: iced share r', value: D.tempIced.r, shown: 0.94 },
    { what: 'Application: corrected r', value: D.footTrans.r, shown: 0.98 },
    { what: 'Application: rain r pooled', value: D.rainFootfall.r, shown: -0.14 },
    { what: 'Application: rain rho pooled', value: rainPooled.rho, shown: -0.12 },
    // the iced-drinks curve, by temperature band (Harbourside)
    { what: 'Mean iced drinks below 55°F (about five)', value: bandMean(0, 55), shown: 5, tol: 0.5 },
    { what: 'Mean iced drinks 60–64°F (about 18)', value: bandMean(60, 65), shown: 18, tol: 0.5 },
    { what: 'Mean iced drinks 65–69°F (about 28)', value: bandMean(65, 70), shown: 28, tol: 0.5 },
    { what: 'Mean iced drinks 72–74°F (about 42)', value: bandMean(72, 75), shown: 42, tol: 0.5 },
    { what: 'Mean iced drinks 75–77°F (about 68)', value: bandMean(75, 78), shown: 68, tol: 0.5 },
    { what: 'Mean iced drinks 84°F and above (about 83)', value: bandMean(84, 200), shown: 83, tol: 0.5 },
    { what: 'Mid-70s jump is the largest step between neighbouring bands', value: Number(bandMean(75, 78) - bandMean(72, 75) > Math.max(bandMean(65, 70) - bandMean(60, 65), bandMean(72, 75) - bandMean(65, 70), bandMean(84, 200) - bandMean(75, 78))), shown: 1 },
    { what: 'Growth above the mid-70s slower than the jump', value: Number(bandMean(84, 200) - bandMean(75, 78) < bandMean(75, 78) - bandMean(72, 75)), shown: 1 },
    { what: 'Note threshold', value: 0.1, shown: 0.1 },
  ],
};
