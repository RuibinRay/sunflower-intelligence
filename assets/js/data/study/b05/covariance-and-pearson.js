// covariance-and-pearson.js — B05 · Covariance and Pearson’s r. Content only; exercises are in
// covariance-and-pearson.ex.js. Uses the cafés' corrected log (case.js: column, CLEAN_ROWS, DERIVED) for covariance and
// its units, r and its z-score form, changes of scale (°F to °C), r² and the footfall–transactions–sales chain.
// Northgate Gym is fictional. Every figure printed is recomputed in `checks` with core/correlation.js.
import { column, CLEAN_ROWS, CAFE_COLUMNS, DERIVED as D } from './case.js?v=20';
import * as C from '../../../core/correlation.js?v=20';
import { mean, sd } from '../../../core/stats.js?v=20';

const H = { cafe: 'Harbourside' }, M = { cafe: 'Millbrook' };
const at = (n) => CAFE_COLUMNS.indexOf(n);
const pr = (a, b, o) => C.pearson(column(a, o), column(b, o)).r;
const sdp = (a) => Math.sqrt(a.reduce((s, v) => s + (v - mean(a)) ** 2, 0) / a.length);

// ---------------------------------------------------------------- footfall and transactions, both cafés
const FOOT = column('footfall'), TRANS = column('transactions'), SALES = column('sales');
const covFT = C.covariance(FOOT, TRANS), sF = sd(FOOT), sT = sd(TRANS), rFT = covFT / (sF * sT);
const covFTh = C.covariance(column('footfall', H), column('transactions', H));
const covFTm = C.covariance(column('footfall', M), column('transactions', M));
const covHund = C.covariance(FOOT.map((v) => v / 100), TRANS);
const rZ = C.rFromZ(FOOT, TRANS);
const nAll = FOOT.length;
// quadrant counts around the means
const mF = mean(FOOT), mT = mean(TRANS);
const agree = FOOT.filter((v, i) => (v - mF) * (TRANS[i] - mT) > 0).length;

// ---------------------------------------------------------------- temperature and iced share, Millbrook
const HF = column('high_f', M), IS = column('iced_share', M), HC = HF.map((f) => (f - 32) * 5 / 9);
const covF = C.covariance(HF, IS), covCel = C.covariance(HC, IS), covPct = C.covariance(HF, IS.map((v) => v * 100));
const rF = C.pearson(HF, IS).r, rCel = C.pearson(HC, IS).r;
const covPop = C.covariance(HF, IS, { population: true }), nM = HF.length;
const mixed = covPop / (sd(HF) * sd(IS));
const rNeg = C.pearson(HF.map((v) => 100 - v), IS).r;
const rLog = C.pearson(HF, IS.map((v) => Math.log(v + 0.01))).r;

// ---------------------------------------------------------------- the chain
const chain = [['footfall', 'transactions'], ['transactions', 'sales'], ['footfall', 'sales']].map(([a, b]) => ({ a, b, all: pr(a, b), h: pr(a, b, H), m: pr(a, b, M) }));

// ---------------------------------------------------------------- Northgate Gym (fictional): classes booked and towels laundered
const GX = [4, 6, 7, 9, 10, 12], GY = [60, 75, 90, 95, 110, 128];
const gmx = mean(GX), gmy = mean(GY);
const gdx = GX.map((v) => v - gmx), gdy = GY.map((v) => v - gmy), gprod = gdx.map((v, i) => v * gdy[i]);
const gSxy = gprod.reduce((s, v) => s + v, 0), gSxx = gdx.reduce((s, v) => s + v * v, 0), gSyy = gdy.reduce((s, v) => s + v * v, 0);
const gCov = C.covariance(GX, GY), gR = C.pearson(GX, GY).r, gsx = sd(GX), gsy = sd(GY);
const gz = GX.map((v, i) => ((v - gmx) / gsx) * ((GY[i] - gmy) / gsy));

// ---------------------------------------------------------------- a U-shape (fictional, round numbers)
const UX = [-3, -2, -1, 0, 1, 2, 3], UY = UX.map((v) => v * v);
const uR = C.pearson(UX, UY).r;

// ---------------------------------------------------------------- figure: the gym's deviations by quadrant
const f1 = (x) => Math.round(x * 10) / 10;
function quadrantFigure() {
  const L = 70, R = 600, T = 30, B = 270;
  const X = (v) => L + ((v - 2) / 12) * (R - L), Y = (v) => B - ((v - 50) / 90) * (B - T);
  let svg = '<svg viewBox="0 0 640 320" xmlns="http://www.w3.org/2000/svg" font-size="12" fill="currentColor">';
  svg += `<line x1="${L}" x2="${R}" y1="${B}" y2="${B}" stroke="var(--ink)"/><line x1="${L}" x2="${L}" y1="${T}" y2="${B}" stroke="var(--ink)"/>`;
  [4, 6, 8, 10, 12].forEach((v) => { svg += `<text x="${f1(X(v))}" y="${B + 16}" text-anchor="middle" font-size="11" fill="var(--ink-3)">${v}</text>`; });
  [60, 80, 100, 120].forEach((v) => { svg += `<text x="${L - 8}" y="${f1(Y(v) + 4)}" text-anchor="end" font-size="11" fill="var(--ink-3)">${v}</text>`; });
  svg += `<text x="${(L + R) / 2}" y="${B + 36}" text-anchor="middle" font-size="12">Classes booked (x)</text>`;
  svg += `<text x="18" y="${(T + B) / 2}" text-anchor="middle" font-size="12" transform="rotate(-90 18 ${(T + B) / 2})">Towels laundered (y)</text>`;
  svg += `<line x1="${f1(X(gmx))}" x2="${f1(X(gmx))}" y1="${T}" y2="${B}" stroke="var(--rule-strong)" stroke-dasharray="5 4"/>`;
  svg += `<line x1="${L}" x2="${R}" y1="${f1(Y(gmy))}" y2="${f1(Y(gmy))}" stroke="var(--rule-strong)" stroke-dasharray="5 4"/>`;
  svg += `<text x="${f1(X(gmx)) + 6}" y="${T + 12}" font-size="11" fill="var(--ink-3)">mean x = ${gmx}</text>`;
  svg += `<text x="${R - 4}" y="${f1(Y(gmy)) - 6}" text-anchor="end" font-size="11" fill="var(--ink-3)">mean y = ${gmy}</text>`;
  svg += `<text x="${R - 10}" y="${T + 30}" text-anchor="end" font-size="12">upper right: (+)(+) = +</text>`;
  svg += `<text x="${L + 10}" y="${B - 12}" font-size="12">lower left: (−)(−) = +</text>`;
  svg += `<text x="${L + 10}" y="${T + 30}" font-size="12" fill="var(--ink-3)">upper left: (−)(+) = −</text>`;
  svg += `<text x="${R - 10}" y="${B - 12}" text-anchor="end" font-size="12" fill="var(--ink-3)">lower right: (+)(−) = −</text>`;
  GX.forEach((v, i) => {
    svg += `<line x1="${f1(X(v))}" x2="${f1(X(gmx))}" y1="${f1(Y(GY[i]))}" y2="${f1(Y(GY[i]))}" stroke="var(--series-2)" stroke-width="1"/>`;
    svg += `<circle cx="${f1(X(v))}" cy="${f1(Y(GY[i]))}" r="5" fill="var(--series-1)"/>`;
    svg += `<text x="${f1(X(v)) + 8}" y="${f1(Y(GY[i])) + 4}" font-size="11">${gprod[i] > 0 ? '+' : '−'}${Math.abs(gprod[i])}</text>`;
  });
  return `${svg}</svg>`;
}

const fx = (v, d = 2) => v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
const sg = (v, d = 2) => `${v < 0 ? '−' : ''}${fx(Math.abs(v), d)}`;

export default {
  slug: 'covariance-and-pearson',
  title: 'Covariance and Pearson’s r',
  blurb: 'Turn a scatterplot into a number. Build covariance from the products of deviations, see why its size depends on the units, divide by the two standard deviations to get Pearson’s r, read r as the average product of z-scores, and interpret r² with care. Then follow footfall to transactions to sales through the cafés’ log.',
  status: 'draft',
  objectives: [
    'Calculate the sample covariance of two variables by hand and with COVARIANCE.S, and explain what its sign and its units tell you.',
    'Calculate Pearson’s r from the covariance and the two standard deviations, and as the average product of z-scores.',
    'Explain why r lies between −1 and 1, why linear changes of units leave it unchanged, and why it measures only straight-line association.',
    'Interpret r² as the share of variance that a straight line accounts for, without overclaiming.',
    'Use CORREL, PEARSON, RSQ, COVARIANCE.S and COVARIANCE.P correctly, and report correlations along a chain of measures.',
  ],
  prerequisites: [
    { lesson: 'b05/scatterplots', why: 'Covariance and r summarise what a scatterplot shows; read the plot first.' },
    { lesson: 'b04/describing-distributions', why: 'Means, standard deviations and z-scores are the building blocks of r.' },
    { lesson: 'b03/descriptive-statistics-and-regression', why: 'CORREL, RSQ and the R Square of a regression, met there as Excel outputs.' },
  ],
  case: 'lantern',

  concept: [
    { case: 'Ana’s scatterplots of the café log show footfall and transactions rising together in a thin band, and transactions and sales doing the same within each café. Before she presents them, she wants one number per pair that says how closely each pair moves together: a number that doesn’t change if footfall is counted in hundreds, and that she can compare across pairs and cafés.' },

    { h: 'From a plot to a number' },
    { p: String.raw`Draw a vertical line through the mean of x and a horizontal line through the mean of y. They split the scatterplot into four quarters. For a positive association most points lie upper right (both values above their means) or lower left (both below); for a negative one, upper left or lower right. Each point’s <g>deviation from the mean</g>, <m>x_i - \bar{x}</m> and <m>y_i - \bar{y}</m>, says how far it lies from those lines, with a sign.` },
    { p: String.raw`Multiply each point’s two deviations. A point in the upper right gives (+) × (+), positive; lower left, (−) × (−), also positive; the other two quarters give negative products. Add the products up: a large positive total means the points mostly agree in direction, a large negative one that they mostly disagree, and a total near 0 that neither wins. Of the 612 café-days, ${agree} lie upper right or lower left for footfall and transactions.` },
    { figure: {
      svg: quadrantFigure(),
      caption: `Northgate Gym (fictional): classes booked and towels laundered on six days. Dashed lines mark the means (8 classes, 93 towels). Each label is the point’s product of deviations, (x − 8) × (y − 93); all six are positive, and they add to ${gSxy}.`,
      alt: `A scatterplot of six points rising from lower left to upper right, with axes classes booked from 4 to 12 and towels laundered from 60 to 128. A dashed vertical line at the mean of x, 8, and a dashed horizontal line at the mean of y, 93, divide the plot into quarters labelled upper right (+)(+) = +, lower left (−)(−) = +, upper left (−)(+) = − and lower right (+)(−) = −. Every point lies in the upper-right or lower-left quarter, and each is labelled with its positive product: ${gprod.join(', ')}.`,
    } },

    { h: 'Covariance' },
    { p: String.raw`Divide the sum of products by n − 1 and you have the sample <g>covariance</g>, <m>s_{xy}</m>: roughly the average product of deviations, with n − 1 for the same reason the sample variance uses it. For the gym, the six products add to ${gSxy}, so <m>s_{xy} = ${gSxy} \div 5 = ${fx(gCov, 1)}</m>. Excel’s <x>=COVARIANCE.S(A2:A7,B2:B7)</x> gives the same.` },
    { math: String.raw`s_{xy} = \dfrac{\sum (x_i - \bar{x})(y_i - \bar{y})}{n - 1}` },
    { p: `The sign is the useful part: positive covariance means the variables tend to move together, negative means they move in opposite directions. The size is hard to read. Its units are the product of the two variables’ units: footfall and transactions over the 612 café-days have a covariance of ${fx(covFT, 1)} people × transactions, a unit nobody can picture. Count footfall in hundreds of people instead and the covariance falls to ${fx(covHund, 2)}, though nothing about the relationship has changed.` },
    { p: `Size also mixes strength with spread. Millbrook’s covariance of footfall and transactions, ${fx(covFTm, 0)}, is larger than Harbourside’s, ${fx(covFTh, 0)}, but the two relationships are equally tight: each café’s correlation is 0.985. Millbrook’s figure is bigger only because its days vary more. So a covariance can’t be compared across pairs measured in different units, or even across groups with different spreads.` },

    { h: 'Pearson’s r: covariance without the units' },
    { p: String.raw`To remove the units, divide the covariance by both standard deviations. The result is <g>Pearson’s r</g>, the <g>Correlation coefficient</g> B03 calculated with CORREL:` },
    { math: String.raw`r = \dfrac{s_{xy}}{s_x\, s_y}` },
    { p: String.raw`For the gym, <m>s_x = ${fx(gsx, 3)}</m> classes and <m>s_y = ${fx(gsy, 3)}</m> towels, so <m>r = ${fx(gCov, 1)} \div (${fx(gsx, 3)} \times ${fx(gsy, 3)}) = ${fx(gR, 3)}</m>. For footfall and transactions at the two cafés, <m>r = ${fx(covFT, 1)} \div (${fx(sF, 2)} \times ${fx(sT, 2)}) = ${fx(rFT, 3)}</m>, the 0.98 of the scatterplots lesson. The units cancel (people × transactions over people times transactions), so r is a pure number, and the same whichever units the variables are measured in.` },
    { p: 'r runs from −1 to +1. It is +1 only when every point lies exactly on a rising straight line and −1 only on a falling one; 0 means no straight-line trend at all. Values in between say how close the points come to a line. In the log, footfall and transactions (0.98) come very close, iced share and the day’s high (0.94) close, and rain and footfall (−0.14) hardly at all.' },

    { h: 'r as the average product of z-scores' },
    { p: String.raw`There is a second way to see r. Turn each value into a <g>Z-score</g>, its distance from the mean in standard deviations: <m>z_x = (x - \bar{x}) \div s_x</m>. Then r is the sum of the products of the two z-scores, divided by n − 1:` },
    { math: String.raw`r = \dfrac{1}{n-1} \sum z_{x_i} z_{y_i}` },
    { p: String.raw`This is the same calculation in a different order: dividing each deviation by its standard deviation first, instead of dividing the covariance afterwards. It explains why r has no units (z-scores have none) and why it ignores where each variable’s values sit and how widely they spread: z-scores have mean 0 and standard deviation 1 whatever the original scale. For the 612 café-days the average product of z-scores for footfall and transactions is ${fx(rZ, 3)}, the same as r.` },
  ],

  theory: [
    { h: 'Why r stays between −1 and 1' },
    { p: String.raw`The products of deviations can’t add up to more than the deviations themselves allow. In symbols, <m>|\sum (x_i - \bar{x})(y_i - \bar{y})| \le \sqrt{\sum (x_i - \bar{x})^2 \sum (y_i - \bar{y})^2}</m>, a result called the Cauchy–Schwarz inequality, with equality only when every y-deviation is the same multiple of its x-deviation, which is to say when the points lie on one straight line. Dividing both sides by the right-hand side gives <m>|r| \le 1</m>. That is why an r of exactly ±1 means a perfect straight line and nothing else does.` },

    { h: 'Changes of units leave r alone' },
    { p: String.raw`A <g>linear transformation</g> changes a variable to <m>a + bx</m>: adding a constant shifts it, multiplying by a constant rescales it. Converting °F to °C, <m>(F - 32) \times 5/9</m>, is one; so is counting in hundreds, or in dollars instead of cents. Shifting changes every deviation by nothing; rescaling multiplies every deviation, and the standard deviation, by the same factor, so the factors cancel in r.` },
    { math: String.raw`r(a + b\,x,\; c + d\,y) = \operatorname{sign}(b\,d)\; r(x, y)` },
    { p: `At Millbrook the day’s high and the iced share have a covariance of ${fx(covF, 3)} (°F × share) and r = ${fx(rF, 3)}. In °C the covariance becomes ${fx(covCel, 3)}, five-ninths as large, and r is still ${fx(rCel, 3)}. Express the share as a percentage instead and the covariance becomes ${fx(covPct, 1)}, a hundred times larger; r doesn’t move. Multiply by a negative number, as when a thermometer reading is replaced by “degrees below 100°F”, and r keeps its size but flips its sign (${sg(rNeg, 3)}). Only a nonlinear change, such as taking logs, can change r’s size: log of the iced share gives r = ${fx(rLog, 3)} with the high.` },

    { h: 'r measures straight-line association only' },
    { p: String.raw`r answers one question: how closely do the points follow a straight line? A strong relationship of another shape can have a modest r, or none. Take seven points on the U-shape <m>y = x^2</m>, for x from −3 to 3: y is completely determined by x, yet r = ${fx(Math.abs(uR) < 1e-12 ? 0 : uR, 0)}, because the falling half cancels the rising half exactly. The iced share’s S-curve has r = 0.94, but Spearman’s rank correlation, which asks only whether the points always rise, is 0.96; the rank-correlation lesson explains the difference. Peak waits climb slowly with the load per barista and then steeply, a hockey stick whose strength r understates; the nonlinear-and-restricted lesson deals with it.` },
    { p: 'So r is a fair summary of a relationship only when the plot shows a roughly straight band with no points that break it. When the plot shows a curve, clusters or a stray point, report what the plot shows and treat r with suspicion, as the scatterplots lesson’s Anscombe quartet showed.' },

    { h: 'r² and shared variance' },
    { p: String.raw`Squaring r gives <m>r^2</m>, which B03 met as <g>R squared</g> in Excel’s regression output. With one x it is the share of the variance of y that the least-squares line on x accounts for: OpenStax’s wording is the percent of variation in the dependent variable that can be explained by variation in x using the regression line. The rest, <m>1 - r^2</m>, is variation the line leaves unexplained. For footfall and transactions, <m>r^2 = ${fx(rFT, 3)}^2 = ${fx(rFT ** 2, 3)}</m>: a straight line in footfall accounts for about ${Math.round(rFT ** 2 * 100)}% of the day-to-day variance in transactions.` },
    { p: 'Three cautions keep that sentence honest.' },
    { list: [
      '<b>“Accounts for” is statistical, not causal.</b> r² is symmetric too: footfall accounts for the same share of the variance in transactions as transactions do of footfall. It says how much variance the two share, not which way any influence runs.',
      String.raw`<b>r² shrinks faster than r.</b> An r of 0.5 sounds like halfway, but <m>r^2 = 0.25</m>: a line accounts for a quarter of the variance. An r of 0.3 gives 0.09. Moderate correlations leave most of the variation unexplained.`,
      '<b>r² is not predictive accuracy.</b> It is a share of variance, not the size of a typical prediction error; a high r² can still leave misses too big for the decision at hand. Prediction and its errors belong to B06.',
    ] },

    { h: 'Samples, populations and missing values' },
    { p: String.raw`The covariance with n − 1, COVARIANCE.S, is the sample covariance, the right choice when the data are a sample from a larger process, as 306 days are from the cafés’ trading. COVARIANCE.P divides by n and describes the data as a complete population. The r you get is the same either way, as long as the standard deviations match: COVARIANCE.S with STDEV.S, or COVARIANCE.P with STDEV.P. Mixing them multiplies r by (n − 1) ÷ n: for Millbrook’s 306 days, ${fx(covPop, 4)} ÷ (${fx(sd(HF), 3)} × ${fx(sd(IS), 4)}) = ${fx(mixed, 4)} instead of ${fx(rF, 4)}, a small slip with 306 rows and a larger one with 12.` },
    { p: String.raw`The r of a sample estimates the <g>population correlation</g>, written <m>\rho</m> (rho): the correlation over all the days the cafés could have traded under the same conditions. The testing-correlation lesson asks how far r can stray from <m>\rho</m> by chance. Note that <m>\rho</m> also names Spearman’s rank correlation, so this course writes “Spearman’s ρ” or <m>r_s</m> for that.` },
    { p: 'When a value is missing, CORREL, COVARIANCE.S and the course’s engine use every row that has both values and skip the rest: <g>Pairwise deletion</g>. Each pair’s r may then come from slightly different rows, which matters when you compare several correlations; say how many pairs each one uses.' },

    { h: 'The Excel functions' },
    { table: {
      caption: 'Excel functions for covariance and correlation',
      head: ['Function', 'Returns', 'Note'],
      rows: [
        ['<x>=COVARIANCE.S(x,y)</x>', 'Sample covariance (n − 1)', 'Units of x × units of y'],
        ['<x>=COVARIANCE.P(x,y)</x>', 'Population covariance (n)', 'Pair it with STDEV.P'],
        ['<x>=CORREL(x,y)</x>', 'Pearson’s r', 'Ignores text, logical values and blanks; #N/A if the ranges differ in size'],
        ['<x>=PEARSON(x,y)</x>', 'Pearson’s r', 'The same as CORREL'],
        ['<x>=RSQ(y,x)</x>', 'r²', 'The order doesn’t matter; it loses r’s sign'],
        ['<x>=STANDARDIZE(x,mean,sd)</x>', 'A z-score', 'With SUMPRODUCT, gives r as the average product of z-scores'],
      ],
      align: ['l', 'l', 'l'],
    } },
    { p: 'CORREL returns #DIV/0! if either range has no spread (every value the same), because a standard deviation of 0 can’t be divided by. Its arguments can be given in either order, like every function in the table, since r and the covariance are symmetric.' },

    { h: 'How strong is strong?' },
    { p: 'There is no agreed scale. Different textbooks attach “weak”, “moderate” and “strong” to different cut-offs, and what counts as strong depends on the field: in a café’s till data, footfall and transactions at 0.98 is unremarkable, while in a study of people’s behaviour 0.3 can be a notable finding. If you use a scale, name its source and say it is a convention. Better still, give the number, show the plot, and say what the relationship means for the decision: “a line in footfall accounts for about 96% of the variance in transactions” tells the reader more than “strong”.' },
  ],

  formulas: [
    { id: 'pear-cov', name: 'Sample covariance',
      tex: String.raw`s_{xy} = \dfrac{\sum_{i=1}^{n} (x_i - \bar{x})(y_i - \bar{y})}{n - 1}`,
      where: [[String.raw`s_{xy}`, 'Sample covariance of x and y', 'units of x × units of y'], [String.raw`x_i, y_i`, 'The paired values of unit i', 'their units'], [String.raw`\bar{x}, \bar{y}`, 'The means of x and y', 'their units'], [String.raw`n`, 'Number of pairs', '']],
      assumptions: 'Paired numeric data; rows with a missing value are left out (pairwise deletion).',
      note: 'Excel: COVARIANCE.S(x, y). COVARIANCE.P divides by n instead.' },
    { id: 'pear-r', name: 'Pearson’s correlation coefficient',
      tex: String.raw`r = \dfrac{s_{xy}}{s_x\, s_y} = \dfrac{\sum (x_i - \bar{x})(y_i - \bar{y})}{\sqrt{\sum (x_i - \bar{x})^2 \sum (y_i - \bar{y})^2}}`,
      where: [[String.raw`r`, 'Pearson’s correlation coefficient, from −1 to +1', ''], [String.raw`s_{xy}`, 'Sample covariance', 'units of x × units of y'], [String.raw`s_x, s_y`, 'Sample standard deviations of x and y (STDEV.S)', 'their units'], [String.raw`x_i, y_i`, 'The paired values', 'their units'], [String.raw`\bar{x}, \bar{y}`, 'The means', 'their units']],
      assumptions: 'Measures straight-line association only; read it with a scatterplot.',
      note: 'Excel: CORREL(x, y) or PEARSON(x, y). The n − 1 cancels, so the right-hand form needs no n.' },
    { id: 'pear-z', name: 'r as the average product of z-scores',
      tex: String.raw`r = \dfrac{1}{n - 1} \sum_{i=1}^{n} \left(\dfrac{x_i - \bar{x}}{s_x}\right) \left(\dfrac{y_i - \bar{y}}{s_y}\right)`,
      where: [[String.raw`r`, 'Pearson’s correlation coefficient', ''], [String.raw`n`, 'Number of pairs', ''], [String.raw`x_i, y_i`, 'The paired values', 'their units'], [String.raw`\bar{x}, \bar{y}`, 'The means', 'their units'], [String.raw`s_x, s_y`, 'Sample standard deviations', 'their units']],
      note: 'Excel: =SUMPRODUCT(STANDARDIZE(x,AVERAGE(x),STDEV.S(x)),STANDARDIZE(y,AVERAGE(y),STDEV.S(y)))/(COUNT(x)-1).' },
    { id: 'pear-linear', name: 'r under a change of units',
      tex: String.raw`r(a + b\,x,\; c + d\,y) = \operatorname{sign}(b\,d)\; r(x, y)`,
      where: [[String.raw`r(x, y)`, 'Pearson’s correlation of x and y', ''], [String.raw`x, y`, 'The original variables', 'their units'], [String.raw`a, c`, 'Constants added to x and y (shifts)', 'units of x, y'], [String.raw`b, d`, 'Constants multiplying x and y (rescaling), not zero', ''], [String.raw`\operatorname{sign}(b\,d)`, '+1 if b and d have the same sign, −1 if not', '']],
      note: 'The covariance becomes b × d × s_xy: it changes with the units, r doesn’t. A nonlinear change (logs, squares) can change r.' },
    { id: 'pear-r2', name: 'Coefficient of determination for one x',
      tex: String.raw`r^2 = 1 - \dfrac{\text{variance of y left around the least-squares line}}{\text{variance of y}}`,
      where: [[String.raw`r^2`, 'Share of the variance of y that the least-squares line on x accounts for, from 0 to 1', ''], [String.raw`\text{variance of y}`, 'Sum of squared deviations of y from its mean', 'units of y squared'], [String.raw`\text{variance of y left around the least-squares line}`, 'Sum of squared residuals from the line', 'units of y squared']],
      note: 'Excel: RSQ(y, x). Symmetric in x and y; a share of variance, not a measure of prediction accuracy (B06).' },
  ],

  examples: [
    { level: 'simple', title: 'Covariance and r by hand: classes and towels', fictional: true,
      setup: `Northgate Gym (fictional) recorded the classes booked and the towels laundered on six days: (${GX.map((v, i) => `${v}, ${GY[i]}`).join('), (')}). Calculate the covariance and Pearson’s r by hand, and check r as the average product of z-scores.`,
      table: {
        head: ['Day', 'Classes x', 'Towels y', 'x − x̄', 'y − ȳ', 'Product'],
        rows: GX.map((v, i) => [String(i + 1), String(v), String(GY[i]), sg(gdx[i], 0), sg(gdy[i], 0), sg(gprod[i], 0)]),
        foot: [['Sum', String(GX.reduce((s, v) => s + v, 0)), String(GY.reduce((s, v) => s + v, 0)), '0', '0', String(gSxy)]],
        align: ['l', 'r', 'r', 'r', 'r', 'r'],
      },
      steps: [
        String.raw`Means: <m>\bar{x} = ${GX.reduce((s, v) => s + v, 0)} \div 6 = ${gmx}</m> classes and <m>\bar{y} = ${GY.reduce((s, v) => s + v, 0)} \div 6 = ${gmy}</m> towels. The deviations in each column add to 0, as deviations from a mean always do.`,
        String.raw`Products of deviations: all six are positive, because every day is above both means or below both. Their sum is ${gSxy}, so the covariance is <m>s_{xy} = ${gSxy} \div (6 - 1) = ${fx(gCov, 1)}</m> class-towels.`,
        String.raw`Standard deviations: the squared x-deviations add to ${gSxx}, so <m>s_x = \sqrt{${gSxx} \div 5} = ${fx(gsx, 3)}</m>; the squared y-deviations add to ${fx(gSyy, 0)}, so <m>s_y = \sqrt{${fx(gSyy, 0)} \div 5} = ${fx(gsy, 3)}</m>.`,
        String.raw`Pearson’s r: <m>r = ${fx(gCov, 1)} \div (${fx(gsx, 3)} \times ${fx(gsy, 3)}) = ${fx(gR, 4)}</m>. Equivalently <m>r = ${gSxy} \div \sqrt{${gSxx} \times ${fx(gSyy, 0)}} = ${fx(gR, 4)}</m>, where the n − 1 has cancelled.`,
        String.raw`Check with z-scores: the products <m>z_x z_y</m> are ${gz.map((v) => fx(v, 3)).join(', ')}; they add to ${fx(gz.reduce((s, v) => s + v, 0), 3)}, and ${fx(gz.reduce((s, v) => s + v, 0), 3)} ÷ 5 = ${fx(gz.reduce((s, v) => s + v, 0) / 5, 4)}, the same r.`,
      ],
      answer: `Covariance ${fx(gCov, 1)} class-towels; r = ${fx(gR, 3)}.`,
      interpretation: `On these six days more classes went with more towels, almost exactly in a straight line. The covariance, ${fx(gCov, 1)}, is in class-towels and would change if towels were counted in loads; r = ${fx(gR, 3)} would not. Six days is a very small sample: the testing-correlation lesson shows how uncertain an r from six pairs is.` },
    { level: 'challenging', title: 'Does the unit matter? Temperature and iced share at Millbrook', fictional: true,
      setup: `For Millbrook’s ${nM} days, Ana’s sheet gives the covariance of the day’s high (°F) and the iced share (a proportion) as ${fx(covF, 4)}, with standard deviations ${fx(sd(HF), 3)}°F and ${fx(sd(IS), 4)}. Her supplier works in °C and percentages. Calculate r, then the covariance and r in the supplier’s units, and find what goes wrong if she divides COVARIANCE.P by the STDEV.S figures.`,
      steps: [
        String.raw`r in Ana’s units: <m>r = ${fx(covF, 4)} \div (${fx(sd(HF), 3)} \times ${fx(sd(IS), 4)}) = ${fx(rF, 3)}</m>.`,
        String.raw`To °C: <m>C = (F - 32) \times 5/9</m>. Subtracting 32 doesn’t change any deviation; multiplying by 5/9 multiplies every temperature deviation, and the standard deviation, by 5/9. So the covariance becomes <m>${fx(covF, 4)} \times 5/9 = ${fx(covCel, 4)}</m> and <m>s_x = ${fx(sd(HF), 3)} \times 5/9 = ${fx(sd(HC), 3)}</m>°C.`,
        String.raw`To percentages: multiplying the share by 100 multiplies its deviations and standard deviation by 100: covariance <m>${fx(covCel, 4)} \times 100 = ${fx(covCel * 100, 2)}</m> (°C × percentage points), <m>s_y = ${fx(sd(IS) * 100, 2)}</m> points.`,
        String.raw`r in the supplier’s units: <m>${fx(covCel * 100, 2)} \div (${fx(sd(HC), 3)} \times ${fx(sd(IS) * 100, 2)}) = ${fx(C.pearson(HC, IS.map((v) => v * 100)).r, 3)}</m>, the same as before: the factors 5/9 and 100 appear above and below the line and cancel.`,
        String.raw`The mixed-up version: COVARIANCE.P divides by n = ${nM} instead of ${nM - 1}, giving ${fx(covPop, 4)}; divided by the sample standard deviations it gives <m>${fx(mixed, 4)}</m>, which is <m>r \times ${nM - 1}/${nM}</m>. With 306 rows the error is in the third decimal place; with 12 rows it would be 1/12, about 8%.`,
      ],
      answer: `r = ${fx(rF, 3)} in both sets of units. The covariance changes from ${fx(covF, 4)} (°F × share) to ${fx(covCel * 100, 2)} (°C × percentage points). Mixing COVARIANCE.P with STDEV.S gives ${fx(mixed, 4)}, slightly too small.`,
      interpretation: 'Report r, not the covariance, when people use different units: the supplier and Ana will agree on 0.94 whatever thermometer they use. The covariance is still useful as an ingredient (it reappears in regression slopes in B06), but its size means nothing on its own. And keep the n − 1 or n consistent across the numerator and denominator.' },
    { level: 'applied', title: 'Footfall, transactions and sales: following the chain', fictional: true,
      setup: 'Ana wants to know whether the door counter is worth reading every morning as an early guide to the day’s sales. Footfall leads to transactions, and transactions add up to sales: the log is built that way. Calculate the correlation at each link, pooled and for each café, and say what she should report.',
      table: {
        head: ['Pair', 'Both cafés', 'Harbourside', 'Millbrook'],
        rows: chain.map((c) => [`${c.a} – ${c.b}`, fx(c.all, 3), fx(c.h, 3), fx(c.m, 3)]),
        align: ['l', 'r', 'r', 'r'],
      },
      steps: [
        `Plot first: each pair, one café at a time. Footfall–transactions is a thin straight band in each café; transactions–sales too; pooled, transactions–sales splits into two bands (the scatterplots lesson).`,
        `Footfall–transactions: r = ${fx(chain[0].all, 3)} pooled, ${fx(chain[0].h, 3)} and ${fx(chain[0].m, 3)} by café. r² ≈ ${fx(chain[0].all ** 2, 2)}: a line in footfall accounts for about ${Math.round(chain[0].all ** 2 * 100)}% of the variance in transactions.`,
        `Transactions–sales: r = ${fx(chain[1].all, 3)} pooled but ${fx(chain[1].h, 3)} and ${fx(chain[1].m, 3)} within the cafés. The pooled figure is lower because Harbourside’s average ticket (about $${fx(D.meanTicketH)}) is much higher than Millbrook’s (about $${fx(D.meanTicketM)}), so the two cafés lie on different lines. The within-café figures describe the link; the pooled one mixes two groups.`,
        `Footfall–sales, the end-to-end link: r = ${fx(chain[2].h, 3)} at Harbourside and ${fx(chain[2].m, 3)} at Millbrook (r² ≈ ${fx(chain[2].h ** 2, 2)} and ${fx(chain[2].m ** 2, 2)}). Each café’s footfall is a close guide to its own sales. Pooled, r = ${fx(chain[2].all, 3)}.`,
        'Language: in the log, footfall becomes transactions and transactions add up to sales, so here the direction is known from how the business works, not from the correlations. The correlations measure how tightly each link holds.',
      ],
      answer: `By café, every link is very close to a straight line: r is about 0.97–0.99 at each step. Footfall alone accounts for about ${Math.round(Math.min(chain[2].h, chain[2].m) ** 2 * 100)}–${Math.round(Math.max(chain[2].h, chain[2].m) ** 2 * 100)}% of the variance in each café’s daily sales. Report by café; the pooled transactions–sales r of ${fx(chain[1].all, 2)} mixes two different ticket sizes.`,
      interpretation: 'Yes, the morning door count is a good early guide, café by café. The useful lesson for Ana’s report is where the chain is loose: not between people and purchases, but between the two cafés’ ticket sizes. A single pooled correlation would have hidden that. What the correlations can’t tell her is how to raise sales: that takes knowing what brings people through the door and what they spend, which the last lessons of the course discuss.' },
  ],

  demo: [
    { widget: 'pear-chain', intro: 'Footfall against transactions for both cafés. Turn on the least-squares line and the colours by café, and compare r and r² pooled with each café’s own figures.' },
    { widget: 'pear-scale', intro: 'Millbrook’s day’s high and iced share. Rescale the temperature, shift it, or flip its sign, and watch the covariance and the standard deviation change while r stays put (or only changes sign).' },
    { widget: 'pear-sheet', intro: 'Twelve June days at Millbrook with every function in this lesson. Change any footfall or transaction and watch the covariance, r and r² update; compare COVARIANCE.S ÷ (STDEV.S × STDEV.S) with COVARIANCE.P ÷ (STDEV.P × STDEV.P), and with the mixed version.' },
  ],

  mistakes: [
    { title: '“Millbrook’s covariance is bigger, so its relationship is stronger.”', html: `Covariance grows with the spread of each variable. Millbrook’s ${fx(covFTm, 0)} beats Harbourside’s ${fx(covFTh, 0)} because Millbrook’s days vary more, but both cafés’ r is 0.985. Compare correlations, not covariances.` },
    { title: '“r = 0.5 means a relationship halfway to perfect.”', html: 'r² = 0.25: a line accounts for a quarter of the variance, and three quarters is left over. Square r before deciding how much it explains.' },
    { title: '“r² = 0.96, so footfall causes 96% of transactions.”', html: 'r² is a share of variance that two variables have in common, and it is symmetric. It says nothing about which way influence runs, and nothing about a percentage of the transactions themselves.' },
    { title: 'Converting units and expecting r to change', html: 'Any linear change of units (°F to °C, dollars to thousands, a share to a percentage) leaves r alone; only the sign can flip, when one variable is multiplied by a negative number. If converting units changed your r, there is a mistake in the conversion.' },
    { title: 'Mixing sample and population formulas', html: 'COVARIANCE.P ÷ (STDEV.S × STDEV.S) is r × (n − 1) ÷ n, too small. Use COVARIANCE.S with STDEV.S, COVARIANCE.P with STDEV.P, or just CORREL.' },
    { title: 'Reading a near-zero r as “no relationship”', html: 'r measures straight-line association. A U-shape can be a perfect relationship with r = 0. Plot first.' },
  ],

  application: [
    { case: 'Ana’s report to her two managers has one page per link in the chain: a scatterplot for each café, and under it r and r² for each café and pooled. Her summary line reads: “At both cafés, the morning door count is a close guide to the day’s sales: a straight line in footfall accounts for about 94–96% of the day-to-day variance in sales. The two cafés differ in ticket size, not in how footfall turns into sales, so we report them separately.”' },
    { p: 'This is the everyday professional use of r: a compact, unit-free summary that lets you compare how tightly different pairs hold together, and spot where a chain of measures is loose. It is always reported with the plot, with the number of pairs, and broken down by group when the groups differ.' },
    { p: 'Covariance has a quieter role. It is rarely reported on its own, because its size depends on the units, but it is the ingredient behind r, behind regression slopes in B06 (the slope of the least-squares line is the covariance divided by the variance of x), and behind portfolio risk in finance, where the covariance of two assets’ returns decides how much combining them reduces risk. Wherever it appears, read its sign and convert it to r before judging its size.' },
    { p: 'Finally, use r² carefully. “A straight line in footfall accounts for 96% of the variance in transactions” is accurate. “Footfall explains 96% of transactions” is not: it sounds causal, it misnames variance as transactions, and it hides that the line is a straight one fitted to these 306 days at each café, not a law. The causal question, whether getting more people through the door would raise sales, needs more than a correlation, as the last lesson of this course shows.' },
  ],

  summary: [
    'Covariance averages the products of deviations from the means (dividing by n − 1): positive when the variables move together, negative when they move apart. Its size depends on the units and the spreads.',
    'Pearson’s r = s_xy ÷ (s_x s_y): covariance without the units, always between −1 and +1, and ±1 only for a perfect straight line.',
    'r is also the average product of z-scores, Σ z_x z_y ÷ (n − 1).',
    'Linear changes of units (°F to °C, shares to percentages) never change r; a negative multiplier flips its sign; only nonlinear changes such as logs can change its size.',
    'r measures straight-line association only: a curve or a U-shape can be strong with a modest or zero r.',
    'r² is the share of the variance of y that a straight line in x accounts for. It is symmetric, shrinks faster than r, and is neither causal nor a measure of prediction accuracy.',
    'In Excel: COVARIANCE.S, COVARIANCE.P, CORREL (= PEARSON) and RSQ. Keep sample with sample and population with population.',
    'Along the chain, footfall–transactions–sales are each close to a straight line within each café (r ≈ 0.97–0.99); pooling the cafés lowers transactions–sales to 0.83 because their ticket sizes differ.',
  ],

  glossary: [
    { term: 'Deviation from the mean', def: 'How far a value lies above or below the mean of its variable: x − x̄, positive above the mean and negative below.' },
    { term: 'Covariance', def: 'The average product of two variables’ deviations from their means (dividing by n − 1 for a sample, by n for a population): positive when they tend to move together, negative when they move in opposite directions. Its units are the product of the two variables’ units.' },
    { term: 'Pearson’s r', def: 'The correlation coefficient for straight-line association: the covariance of two variables divided by the product of their standard deviations, from −1 to +1. Also called the Pearson product-moment correlation.' },
    { term: 'Population correlation', def: 'The correlation of two variables over a whole population or process, written ρ (rho), which a sample’s r estimates.' },
    { term: 'Linear transformation', def: 'A change of a variable to a + b × x, such as a change of units; it shifts and rescales the values without changing their order or the shape of their relationships.' },
  ],

  references: [
    { text: 'Holmes, A., Illowsky, B. &amp; Dean, S. (2023). <i>Introductory Business Statistics 2e</i>, section 13.1, “The Correlation Coefficient r”. OpenStax.', url: 'https://openstax.org/books/introductory-business-statistics-2e/pages/13-1-the-correlation-coefficient-r', checked: '2026-10-26' },
    { text: 'Illowsky, B. &amp; Dean, S. (2023). <i>Introductory Statistics 2e</i>, section 12.3, “The Regression Equation” (the correlation coefficient and the coefficient of determination). OpenStax.', url: 'https://openstax.org/books/introductory-statistics-2e/pages/12-3-the-regression-equation', checked: '2026-10-26' },
    { text: 'Microsoft Support. “CORREL function”.', url: 'https://support.microsoft.com/en-US/excel/functions/correl-function', checked: '2026-10-26' },
    { text: 'Microsoft Support. “COVARIANCE.S function”.', url: 'https://support.microsoft.com/en-US/excel/functions/covariance-s-function', checked: '2026-10-26' },
  ],

  checks: [
    // quadrants and covariance of footfall and transactions
    { what: 'Café-days', value: nAll, shown: 612 },
    { what: 'Points agreeing in direction', value: agree, shown: 592 },
    { what: 'Most points agree', value: Number(agree > nAll / 2), shown: 1 },
    { what: 'Covariance footfall–transactions', value: covFT, shown: 4252.4, tol: 0.05 },
    { what: 'Covariance with footfall in hundreds', value: covHund, shown: 42.52, tol: 0.005 },
    { what: 'Covariance Millbrook', value: covFTm, shown: 3666, tol: 0.5 },
    { what: 'Covariance Harbourside', value: covFTh, shown: 2292, tol: 0.5 },
    { what: 'r Harbourside', value: pr('footfall', 'transactions', H), shown: 0.985, tol: 0.0005 },
    { what: 'r Millbrook', value: pr('footfall', 'transactions', M), shown: 0.985, tol: 0.0005 },
    { what: 'SD footfall', value: sF, shown: 87.15 },
    { what: 'SD transactions', value: sT, shown: 49.72 },
    { what: 'r from cov', value: rFT, shown: 0.981, tol: 0.0005 },
    { what: 'r from printed rounded figures', value: 4252.4 / (87.15 * 49.72), shown: 0.981, tol: 0.0005 },
    { what: 'r engine agrees', value: D.footTrans.r, shown: rFT, tol: 1e-12 },
    { what: 'r from z-scores', value: rZ, shown: 0.981, tol: 0.0005 },
    { what: 'r 2 dp', value: rFT, shown: 0.98 },
    { what: 'iced share r', value: D.tempIced.r, shown: 0.94 },
    { what: 'rain r', value: D.rainFootfall.r, shown: -0.14 },
    { what: 'r²', value: rFT ** 2, shown: 0.963, tol: 0.0005 },
    { what: 'r² percent', value: rFT ** 2 * 100, shown: 96, tol: 0.5 },
    // gym
    { what: 'Gym mean x', value: gmx, shown: 8 },
    { what: 'Gym mean y', value: gmy, shown: 93 },
    { what: 'Gym sum x', value: GX.reduce((s, v) => s + v, 0), shown: 48 },
    { what: 'Gym sum y', value: GY.reduce((s, v) => s + v, 0), shown: 558 },
    { what: 'Gym Sxy', value: gSxy, shown: 347 },
    { what: 'Gym products all positive', value: gprod.filter((v) => v > 0).length, shown: 6 },
    ...[132, 36, 3, 2, 34, 140].map((v, i) => ({ what: `Gym product ${i + 1}`, value: gprod[i], shown: v })),
    { what: 'Gym Sxx', value: gSxx, shown: 42 },
    { what: 'Gym Syy', value: gSyy, shown: 2940 },
    { what: 'Gym cov', value: gCov, shown: 69.4, tol: 0.05 },
    { what: 'Gym sx', value: gsx, shown: 2.898, tol: 0.0005 },
    { what: 'Gym sy', value: gsy, shown: 24.249, tol: 0.0005 },
    { what: 'Gym r', value: gR, shown: 0.9875, tol: 0.00005 },
    { what: 'Gym r 3 dp', value: gR, shown: 0.987, tol: 0.0006 },
    { what: 'Gym r from sums', value: gSxy / Math.sqrt(gSxx * gSyy), shown: gR, tol: 1e-12 },
    { what: 'Gym r from rounded sds', value: 69.4 / (2.898 * 24.249), shown: 0.9875, tol: 0.0001 },
    { what: 'Gym z sum', value: gz.reduce((s, v) => s + v, 0), shown: gR * 5, tol: 1e-9 },
    // units
    { what: 'Millbrook days', value: nM, shown: 306 },
    { what: 'cov °F', value: covF, shown: 3.9346, tol: 0.00005 },
    { what: 'cov °F 3 dp', value: covF, shown: 3.935, tol: 0.0005 },
    { what: 'cov °C', value: covCel, shown: 2.1859, tol: 0.00005 },
    { what: 'cov °C 3 dp', value: covCel, shown: 2.186, tol: 0.0005 },
    { what: 'cov °C = 5/9 cov °F', value: covCel / covF, shown: 5 / 9, tol: 1e-9 },
    { what: 'cov percent', value: covPct, shown: 393.5, tol: 0.05 },
    { what: 'cov °C percent', value: covCel * 100, shown: 218.59, tol: 0.005 },
    { what: 'SD high °F', value: sd(HF), shown: 14.997, tol: 0.0005 },
    { what: 'SD high °C', value: sd(HC), shown: 8.332, tol: 0.0005 },
    { what: 'SD share', value: sd(IS), shown: 0.2778, tol: 0.00005 },
    { what: 'SD share points', value: sd(IS) * 100, shown: 27.78, tol: 0.005 },
    { what: 'r °F', value: rF, shown: 0.944, tol: 0.0005 },
    { what: 'r °C', value: rCel, shown: 0.944, tol: 0.0005 },
    { what: 'r same', value: rCel - rF, shown: 0, tol: 1e-12 },
    { what: 'r 4 dp', value: rF, shown: 0.9443, tol: 0.00005 },
    { what: 'negative flips', value: rNeg, shown: -0.944, tol: 0.0005 },
    { what: 'log r differs from r', value: Number(Math.abs(rLog - rF) > 0.005), shown: 1 },
    { what: 'cov pop', value: covPop, shown: 3.9217, tol: 0.00005 },
    { what: 'mixed', value: mixed, shown: 0.9412, tol: 0.00005 },
    { what: 'mixed = r (n−1)/n', value: mixed, shown: rF * (nM - 1) / nM, tol: 1e-12 },
    { what: 'n − 1', value: nM - 1, shown: 305 },
    { what: '1/12 about 8%', value: 100 / 12, shown: 8, tol: 0.5 },
    { what: 'iced share both cafés r', value: D.tempIced.r, shown: 0.94 },
    { what: 'Spearman iced', value: D.tempIcedRho.rho, shown: 0.96 },
    // U shape
    { what: 'U r', value: uR, shown: 0, tol: 1e-12 },
    { what: 'U points', value: UX.length, shown: 7 },
    // r² cautions
    { what: '0.5²', value: 0.5 ** 2, shown: 0.25 },
    { what: '0.3²', value: 0.3 ** 2, shown: 0.09 },
    // chain
    { what: 'chain F–T all', value: chain[0].all, shown: 0.981, tol: 0.0005 },
    { what: 'chain T–S all', value: chain[1].all, shown: 0.834, tol: 0.0005 },
    { what: 'chain T–S all 2 dp', value: chain[1].all, shown: 0.83 },
    { what: 'chain T–S H', value: chain[1].h, shown: 0.992, tol: 0.0005 },
    { what: 'chain T–S M', value: chain[1].m, shown: 0.982, tol: 0.0005 },
    { what: 'chain F–S H', value: chain[2].h, shown: 0.981, tol: 0.0005 },
    { what: 'chain F–S M', value: chain[2].m, shown: 0.968, tol: 0.0005 },
    { what: 'chain F–S all', value: chain[2].all, shown: 0.885, tol: 0.0005 },
    { what: 'by café all links 0.97–0.99 (min)', value: Math.min(...chain.flatMap((c) => [c.h, c.m])), shown: 0.97, tol: 0.005 },
    { what: 'by café all links 0.97–0.99 (max)', value: Math.max(...chain.flatMap((c) => [c.h, c.m])), shown: 0.99, tol: 0.005 },
    { what: 'F–S r² H', value: chain[2].h ** 2, shown: 0.96 },
    { what: 'F–S r² M', value: chain[2].m ** 2, shown: 0.94 },
    { what: 'F–T r² 2 dp', value: chain[0].all ** 2, shown: 0.96 },
    { what: 'ticket H', value: D.meanTicketH, shown: 5.34, tol: 0.005 },
    { what: 'ticket M', value: D.meanTicketM, shown: 3.27, tol: 0.005 },
    { what: 'rows used', value: CLEAN_ROWS.filter((row) => Number.isFinite(row[at('footfall')])).length, shown: 612 },
  ],
};
