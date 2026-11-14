// least-squares-line.js — B06 · The least-squares line. Content only; exercises are in least-squares-line.ex.js. Uses
// the cafés' corrected log from case.js: sales on transactions at each café (DERIVED.salesOnTransH, salesOnTransM),
// footfall and the day's high at Harbourside (the two regression lines, regression toward the mean), rain and footfall
// at Harbourside (an intercept that means something), and Harbourside's quietest weekdays from May to November against
// the same weekday a week later (regression toward the mean in the log). Harrier Cycle Hire is fictional. Residuals,
// R² and the residual standard error are residuals-and-r-squared's; tests and intervals are module 2's; the festival
// days' pull on the slope is transformations-and-influence's. Every figure printed is recomputed in `checks`.
import { column, DERIVED as D } from './case.js?v=31';
import * as R from '../../../core/regression.js?v=31';
import { mean, sd } from '../../../core/stats.js?v=31';

const H = { cafe: 'Harbourside' }, M = { cafe: 'Millbrook' };
const sum = (a) => a.reduce((s, v) => s + v, 0);
const corr = (a, b) => { const ma = mean(a), mb = mean(b); let sab = 0, saa = 0, sbb = 0; a.forEach((v, i) => { sab += (v - ma) * (b[i] - mb); saa += (v - ma) ** 2; sbb += (b[i] - mb) ** 2; }); return sab / Math.sqrt(saa * sbb); };

// ---------------------------------------------------------------- sales on transactions, each café
const tH = column('transactions', H), sH = column('sales', H), tM = column('transactions', M), sM = column('sales', M);
const LH = D.salesOnTransH, LM = D.salesOnTransM;
const b1H = LH.beta[1], b0H = LH.beta[0], b1M = LM.beta[1], b0M = LM.beta[0];
const rH = corr(tH, sH), rM = corr(tM, sM);
const perH = sum(sH) / sum(tH), perM = sum(sM) / sum(tM);
const festH = column('festival01', H), NF = tH.map((_, i) => i).filter((i) => !festH[i]);
const LNF = R.fit(NF.map((i) => sH[i]), { x: NF.map((i) => tH[i]) });
const fest = tH.map((_, i) => i).filter((i) => festH[i]);
const POOL = R.fit(column('sales'), { x: column('transactions') });
// ---------------------------------------------------------------- footfall and the day's high at Harbourside: two lines
const hiH = column('high_f', H), ftH = column('footfall', H);
const YX = R.fit(ftH, { x: hiH }), XY = R.fit(hiH, { x: ftH });
const rFT = corr(hiH, ftH);
// ---------------------------------------------------------------- rain: an intercept inside the data
const rnH = column('rain_in', H);
const RAIN = R.fit(ftH, { x: rnH });
const dryH = rnH.filter((v) => v === 0).length;
// ---------------------------------------------------------------- regression toward the mean: quiet weekdays and a week later
const dH = column('date', H), wdH = column('weekday', H);
const CAND = ftH.map((_, i) => i).filter((i) => dH[i] >= '2027-05-01' && dH[i] <= '2027-11-30' && !['Sat', 'Sun'].includes(wdH[i]));
const QUIET = [...CAND].sort((a, b) => ftH[a] - ftH[b] || a - b).slice(0, 10);
const BUSY = [...CAND].sort((a, b) => ftH[b] - ftH[a] || a - b).slice(0, 10);
const NEXT = R.fit(CAND.map((i) => ftH[i + 7]), { x: CAND.map((i) => ftH[i]) });
const rNext = corr(CAND.map((i) => ftH[i]), CAND.map((i) => ftH[i + 7]));
const qNow = mean(QUIET.map((i) => ftH[i])), qNext = mean(QUIET.map((i) => ftH[i + 7]));
const bNow = mean(BUSY.map((i) => ftH[i])), bNext = mean(BUSY.map((i) => ftH[i + 7]));
const cNow = mean(CAND.map((i) => ftH[i])), cNext = mean(CAND.map((i) => ftH[i + 7]));
const qPred = NEXT.beta[0] + NEXT.beta[1] * qNow;
const qRain = QUIET.filter((i) => rnH[i] > 0).length;
// ---------------------------------------------------------------- Harrier Cycle Hire (fictional): six days
const BX = [12, 15, 18, 20, 23, 26], BY = [30, 38, 45, 50, 58, 67];
const bxm = mean(BX), bym = mean(BY);
const BSxx = sum(BX.map((x) => (x - bxm) ** 2)), BSxy = sum(BX.map((x, i) => (x - bxm) * (BY[i] - bym)));
const Bb1 = BSxy / BSxx, Bb0 = bym - Bb1 * bxm;
const BF = R.fit(BY, { x: BX });

function cycleFigure() {
  // 440-wide viewBox; text 15 units. Points, the least-squares line and each residual as a vertical segment.
  const L = 64, Rr = 420, T = 20, Bt = 244;
  const X = (x) => L + ((x - 10) / (28 - 10)) * (Rr - L), Y = (y) => Bt - ((y - 20) / (75 - 20)) * (Bt - T);
  let svg = '<svg viewBox="0 0 440 310" xmlns="http://www.w3.org/2000/svg" font-size="15" fill="currentColor">';
  svg += `<line x1="${L}" x2="${Rr}" y1="${Bt}" y2="${Bt}" stroke="var(--ink)"/><line x1="${L}" x2="${L}" y1="${T}" y2="${Bt}" stroke="var(--ink)"/>`;
  [10, 15, 20, 25].forEach((x) => { svg += `<line x1="${X(x)}" x2="${X(x)}" y1="${Bt}" y2="${Bt + 5}" stroke="var(--ink)"/><text x="${X(x)}" y="${Bt + 22}" text-anchor="middle" fill="var(--ink-3)">${x}</text>`; });
  [20, 40, 60].forEach((y) => { svg += `<text x="${L - 8}" y="${(Y(y) + 5).toFixed(1)}" text-anchor="end" fill="var(--ink-3)">${y}</text>`; });
  svg += `<line x1="${X(10).toFixed(1)}" y1="${Y(Bb0 + Bb1 * 10).toFixed(1)}" x2="${X(28).toFixed(1)}" y2="${Y(Bb0 + Bb1 * 28).toFixed(1)}" stroke="var(--series-2)" stroke-width="2.5"/>`;
  BX.forEach((x, i) => {
    const yh = Bb0 + Bb1 * x;
    svg += `<line x1="${X(x).toFixed(1)}" x2="${X(x).toFixed(1)}" y1="${Y(BY[i]).toFixed(1)}" y2="${Y(yh).toFixed(1)}" stroke="var(--ink)" stroke-width="1.6" stroke-dasharray="4 3"/>`;
    svg += `<circle cx="${X(x).toFixed(1)}" cy="${Y(BY[i]).toFixed(1)}" r="5.5" fill="var(--series-1)"/>`;
  });
  svg += `<circle cx="${X(bxm).toFixed(1)}" cy="${Y(bym).toFixed(1)}" r="6" fill="none" stroke="var(--ink)" stroke-width="2"/>`;
  svg += `<text x="${(X(bxm) - 12).toFixed(1)}" y="${(Y(bym) - 12).toFixed(1)}" text-anchor="end">(x̄, ȳ)</text>`;
  svg += `<text x="${(L + Rr) / 2}" y="${Bt + 46}" text-anchor="middle" fill="var(--ink-3)">high (°C)</text>`;
  svg += `<text x="18" y="${(T + Bt) / 2}" text-anchor="middle" fill="var(--ink-3)" transform="rotate(-90 18 ${(T + Bt) / 2})">bikes hired</text>`;
  return `${svg}</svg>`;
}


export default {
  slug: 'least-squares-line',
  title: 'The least-squares line',
  blurb: 'Turn a scatterplot into a line you can read: the least-squares criterion, the slope b₁ = r·s_y ÷ s_x and the intercept b₀ = ȳ − b₁x̄. Find what an extra transaction is worth at each café, see why Harbourside’s line crosses zero at −$76.58 and why that number means nothing, and meet the two facts that surprise everyone: the line of y on x is not the line of x on y, and extreme days are followed by ordinary ones.',
  status: 'reviewed',
  objectives: [
    'Explain the least-squares criterion and why it measures misses vertically and squares them.',
    'Calculate the slope and intercept of the least-squares line from r, the standard deviations and the means, by hand and in Excel.',
    'Interpret a slope and an intercept in context with their units, and recognise when the intercept has no sensible meaning.',
    'Distinguish the regression of y on x from the regression of x on y, and calculate both slopes from the same summary statistics.',
    'Explain regression toward the mean with ẑ_y = r·z_x, and recognise it when cases are chosen because they were extreme.',
  ],
  prerequisites: [
    { lesson: 'b05/covariance-and-pearson', why: 'Covariance, Pearson’s r and the standard deviation, from which the slope is built.' },
    { lesson: 'b05/scatterplots', why: 'Explanatory and response variables, and reading the form of a scatterplot before fitting anything.' },
    { lesson: 'b05/outliers-and-influence', why: 'How one point can move r; it moves a slope in the same way.' },
    { lesson: 'b03/descriptive-statistics-and-regression', why: 'SLOPE, INTERCEPT, FORECAST.LINEAR, LINEST and the chart trendline, used here without re-teaching.' },
  ],
  case: 'lantern',

  concept: [
    { case: 'B05 ended with a correlation of 0.99 between transactions and sales at Harbourside, the waterfront café, over the 306 days from 1 March to 31 December 2027. That says the days lie close to a straight line. It doesn’t say which line: how many dollars of sales go with one more transaction, or what sales to expect on a day with 80 transactions. Ana needs the line itself.' },

    { h: 'From a scatterplot to a line' },
    { p: String.raw`A straight line through a scatterplot is written <m>\hat{y} = b_0 + b_1 x</m>. Here <m>x</m> is the <g>explanatory variable</g> (transactions), <m>\hat{y}</m> (“y-hat”) is the value the line gives for it, the <b>fitted value</b>, <m>b_1</m> is the <b>slope</b>, the change in <m>\hat{y}</m> for each extra unit of x, and <m>b_0</m> is the <b>intercept</b>, the value of <m>\hat{y}</m> where x = 0. The actual value <m>y</m> (the day’s sales, the <g>response variable</g>) is rarely on the line, and the gap <m>e = y - \hat{y}</m> is the day’s <g>residual</g>: positive when the day sold more than the line says, negative when it sold less.` },
    { p: 'Letters matter here. The b’s are calculated from Ana’s 306 days; module 2 treats them as estimates of a line for all the days the café might trade, written with Greek letters β₀ and β₁. This module is about the b’s: how to find them and how to read them.' },

    { h: 'Which line? The least-squares criterion' },
    { p: 'You could draw many plausible lines through a cloud of points, and people drawing by eye disagree. A rule is needed, and the standard one is <b>least squares</b>: choose the intercept and slope that make the sum of the squared residuals as small as possible.' },
    { math: String.raw`\text{SSE} = \sum (y - \hat{y})^2 = \sum \bigl(y - b_0 - b_1 x\bigr)^2 \quad \text{as small as possible}` },
    { p: String.raw`The line found this way is the <g>least-squares line</g>, also called the <g>regression line</g> of y on x. Three choices are built into the rule. Misses are measured <i>vertically</i>, in y’s units, because the line’s job is to give y for a known x. They are <i>squared</i>, so misses above and below the line can’t cancel and each is counted as a positive amount. And squaring makes a large miss cost far more than a small one: a residual of $200 counts 100 times as much as one of $20. That is why the line has simple formulas, and also why a few extreme points can pull it, as outliers pulled r in B05.` },
    { figure: {
      svg: cycleFigure(),
      caption: 'Harrier Cycle Hire (fictional): six days of the day’s high and bikes hired, with the least-squares line. Each dashed segment is a residual, measured vertically. The line passes through the point of means, (19, 48), circled.',
      alt: 'A scatterplot with the day’s high in degrees Celsius from 10 to 28 on the horizontal axis and bikes hired from 20 to 75 on the vertical axis. Six points rise from (12, 30) to (26, 67). A straight line rises through them from lower left to upper right. Short dashed vertical segments join each point to the line; they are all small, some above the line and some below. An open circle on the line at (19, 48) marks the means of the two variables.',
    } },

    { h: 'The slope and intercept' },
    { p: 'Calculus finds the minimum (In depth shows where it comes from), and the answer is two short formulas. The slope is the sum of cross-products of deviations from the means divided by the sum of squared deviations of x; equivalently, it is the correlation scaled by the two standard deviations:' },
    { math: String.raw`b_1 = \frac{\sum (x - \bar{x})(y - \bar{y})}{\sum (x - \bar{x})^2} = r\,\frac{s_y}{s_x} \qquad b_0 = \bar{y} - b_1\bar{x}` },
    { p: String.raw`At Harbourside, transactions have mean 65.46 and standard deviation 33.57 a day; sales have mean $358.17 and standard deviation $224.68; and r = 0.9922. So <m>b_1 = 0.9922 \times 224.68 \div 33.57 = 6.64</m> dollars per transaction, and <m>b_0 = 358.17 - 6.641 \times 65.46 = -76.58</m> dollars. The fitted line is <m>\widehat{\text{sales}} = -76.58 + 6.64 \times \text{transactions}</m>, the line Excel’s SLOPE and INTERCEPT, or a linear trendline, would give (B03).` },
    { p: String.raw`The second formula says the line always passes through the point of means <m>(\bar{x}, \bar{y})</m>: a day with average transactions is given average sales. The first says something just as useful. Measured in standard deviations, the slope is r itself: a day one standard deviation above average in x is placed r standard deviations above average in y. Because r is never larger than 1 in size, the line never predicts y to be more unusual than x is. The section on regression toward the mean below makes this a central idea.` },
    { callout: 'key', title: 'Reading a slope', html: 'A slope is a rate in y’s units per unit of x: “across Harbourside’s 306 days, each extra transaction went with $6.64 more in sales, on average.” It describes how days differ from one another, not what would happen if one more customer were added to a given day. With one explanatory variable, everything else that varies with x travels with it: busy days are also warm days, weekend days and festival days.' },

    { h: 'Millbrook’s line' },
    { p: String.raw`At Millbrook, the office-district café, the same calculation gives <m>\widehat{\text{sales}} = -34.36 + 3.60 \times \text{transactions}</m>. A transaction there goes with $3.60 of sales against $6.64 at Harbourside, which fits what B05 found: Millbrook’s customers buy smaller orders. The two cafés need two lines. Pooling all 612 rows gives a slope of $3.35 and an intercept of +$67.37, a line that runs between the two bands and describes neither café, for the reason B05’s Simpson’s-paradox lesson gave: the gap between the groups is mixed up with the relationship inside each.` },
  ],

  theory: [
    { h: 'Where the formulas come from' },
    { p: String.raw`SSE is a smooth bowl-shaped function of <m>b_0</m> and <m>b_1</m>; at its lowest point both partial derivatives are zero. Setting them to zero gives the two <b>normal equations</b>:` },
    { math: String.raw`\sum e = \sum (y - b_0 - b_1 x) = 0 \qquad \sum x\,e = \sum x\,(y - b_0 - b_1 x) = 0` },
    { p: String.raw`The first gives <m>b_0 = \bar{y} - b_1\bar{x}</m>; substituting it into the second gives the slope formula. Two facts follow that hold for every least-squares line with an intercept: the residuals add up to zero, so the line is not on average too high or too low; and the residuals have zero correlation with x, so whatever straight-line pattern x carries has been taken into the line. The next lesson uses both to split the variation in y into a part the line accounts for and a part it doesn’t.` },
    { p: 'Why squares rather than, say, the sum of absolute misses? Least absolute deviations is a legitimate method, more resistant to outliers, but it has no closed-form answer and can have several equally good lines. Least squares gives one line, by formula, and its theory (standard errors, tests, intervals) is the one module 2 builds on. The price is sensitivity to extreme points, which the transformations-and-influence lesson measures.' },

    { h: 'Units, and what rescaling does' },
    { p: String.raw`The slope carries units: dollars of sales per transaction, people per °F, °F per person. Change the units and the slope changes with them, though r does not. Per 10 transactions Harbourside’s slope is $66.41; for temperatures in °C instead of °F a slope per degree is multiplied by 1.8, since one °C is 1.8 °F. The intercept is in y’s units. Always write both with their units; a bare “6.64” invites the reader to guess.` },

    { h: 'The intercept, and when it means nothing' },
    { p: String.raw`The intercept is the fitted value at x = 0. Harbourside’s is −$76.58: on a day with no transactions, the line predicts negative sales. That is impossible, and no one should read it as a forecast. There are two reasons it comes out this way, and both are worth recognising.` },
    { p: String.raw`First, x = 0 is far outside the data. Harbourside’s quietest day had 13 transactions, and the line was fitted to days with 13 to 293. Reading the intercept is <g>extrapolation</g> to a place with no evidence. Second, the line is steeper than an average sale. Over the year Harbourside took $109,600.64 from 20,032 transactions, $5.47 per transaction. Because the line passes through the means, <m>b_0 = \bar{x}\,(\bar{y}/\bar{x} - b_1) = 65.46 \times (5.47 - 6.64) = -76.58</m>: the intercept is negative exactly when the slope is larger than sales per transaction. And the slope is larger because tickets are bigger on busy days (B05 found that inside each café busier days go with larger average tickets; it is planted in the case’s data). So the line says something true: moving to a busier day adds a transaction and also raises the average ticket on all of that day’s transactions, so sales rise by more than one average ticket. Its intercept is just where that straight line happens to cross zero. The festival days don’t cause it: without them the slope is $5.91 against $5.38 per transaction, still above, and the intercept is still negative.` },
    { p: String.raw`The $5.47 is total sales divided by total transactions. The average of the 306 daily tickets, the figure B05 quotes (about $5.34), is lower, because it gives a quiet day the same weight as a busy one and quiet days have smaller tickets. At Millbrook the line’s $3.60 is likewise above $3.32 a transaction (B05’s average daily ticket there is about $3.27), and its intercept is −$34.36.` },
    { p: String.raw`An intercept does mean something when x = 0 is a real, observed situation. Regress Harbourside’s footfall on the day’s rain and the line is <m>\widehat{\text{footfall}} = 146.6 - 81.1 \times \text{rain (in)}</m>. Rain is 0 on 209 of the 306 days, so 146.6 people is the fitted footfall on a dry day, close to the 146.6 that the dry days actually averaged (they agree because the wet days lie close to a straight line; if rain’s effect were curved they would not). When 0 isn’t meaningful, you can make the intercept meaningful by <b>centring</b> x: fit sales on (transactions − 65.46), and the intercept becomes the fitted sales on a day with average transactions, $358.17, while the slope is unchanged.` },
    { callout: 'warn', title: 'Don’t force the line through the origin', html: 'Because sales “ought” to be zero with no transactions, it is tempting to tick “Set Intercept = 0” on the trendline or use LINEST with const = FALSE. That fits a different line, one that must pass through (0, 0), so its slope changes too and it no longer passes through the point of means; its R² is also calculated differently and can’t be compared with the usual one. Fit the ordinary line to the range you have, and don’t read it outside that range.' },

    { h: 'One slope, two lines' },
    { p: String.raw`Which variable is x matters. At Harbourside the day’s high (mean 64.18 °F, standard deviation 15.00) and footfall (mean 139.69, standard deviation 69.29) correlate at r = 0.436. The regression of footfall on the high is <m>\widehat{\text{footfall}} = 10.33 + 2.016 \times \text{high}</m>: about 2.0 more people for each degree warmer. The regression of the high on footfall is <m>\widehat{\text{high}} = 50.99 + 0.0944 \times \text{footfall}</m>. If the two were the same line, turning the second round would give 1 ÷ 0.0944 = 10.6 people per degree, five times the first slope. They are different lines.` },
    { math: String.raw`b_{y\cdot x} = r\,\frac{s_y}{s_x} \qquad b_{x\cdot y} = r\,\frac{s_x}{s_y} \qquad b_{y\cdot x}\, b_{x\cdot y} = r^2` },
    { p: String.raw`Here <m>2.016 \times 0.0944 = 0.190 = 0.436^2</m>. The lines coincide only when <m>r = \pm 1</m>; the weaker the correlation, the further apart they swing, both still passing through the point of means. Neither is wrong: the regression of y on x makes the vertical misses smallest and answers “what footfall goes with this temperature?”; the regression of x on y makes the horizontal misses smallest and answers “what temperature goes with this footfall?” Choose by the question. Ana plans staff from the forecast high, so she wants footfall on the high. Swapping the arguments of SLOPE, <x>=SLOPE(high,footfall)</x> instead of <x>=SLOPE(footfall,high)</x>, silently gives the other line.` },

    { h: 'Regression toward the mean' },
    { p: String.raw`Write each variable in standard units, <m>z_x = (x - \bar{x})/s_x</m> and likewise for y. Then the least-squares line becomes simply` },
    { math: String.raw`\hat{z}_y = r\,z_x` },
    { p: String.raw`A Harbourside day one standard deviation warmer than average, about 79 °F, is given footfall only 0.436 standard deviations above average: <m>139.69 + 0.436 \times 69.29 = 169.9</m> people. Run it the other way and a day with footfall one standard deviation above average (209 people) is given a high only 0.436 standard deviations above average, 70.7 °F. In both directions the predicted value is closer to its mean, in standard units, than the value it was predicted from. This is <g>regression to the mean</g>, and it is where regression got its name: Francis Galton’s 1886 paper on heights described the children of very tall or very short parents as less extreme than their parents, “regression towards mediocrity”.` },
    { p: 'Nothing pulls the values back. Whenever two measurements are imperfectly correlated, the cases that are extreme on one are, on average, less extreme on the other, because part of what made them extreme was particular to that measurement: the day’s rain, a passing coach party, chance. The trap is in selection. Pick the quietest days, the worst stores or the patients with the highest readings, and their next measurement will tend to be better whatever you do. A change made in between gets the credit unless you compare with a group that was chosen the same way and left alone.' },
    { p: String.raw`Ana’s log shows it plainly. Take Harbourside’s weekdays from 1 May to 30 November (152 days). The ten quietest averaged 74.6 people; the same weekday a week later averaged 113.9, most of the way back to the 126.2 of all 152 weekdays. Nine of the ten quiet days had rain, and rain is drawn afresh each day in this log, so the next week was usually drier. The ten busiest averaged 172.4 and the same weekday a week later 145.5. Nothing was done to either group. The correlation between a weekday’s footfall and the next week’s is only 0.370, so a week later the line expects most of the gap to have closed.` },

    { h: 'In Excel' },
    { p: 'B03 covered <x>=SLOPE(known_y\'s,known_x\'s)</x>, <x>=INTERCEPT(known_y\'s,known_x\'s)</x>, the chart trendline and LINEST. Two formulas make this lesson’s algebra visible in a worksheet, with transactions in B2:B21 and sales in C2:C21: the slope from r and the standard deviations, <x>=CORREL(B2:B21,C2:C21)*STDEV.S(C2:C21)/STDEV.S(B2:B21)</x>, and the intercept from the means, <x>=AVERAGE(C2:C21)-SLOPE(C2:C21,B2:B21)*AVERAGE(B2:B21)</x>. Each returns exactly what SLOPE and INTERCEPT return. The regression of x on y is <x>=SLOPE(B2:B21,C2:C21)</x>: the same function with the ranges swapped. <x>=LINEST(C2:C21,B2:B21)</x> spills the slope and the intercept side by side, slope first.' },

    { h: 'What a line can’t tell you yet' },
    { p: 'A least-squares line can be fitted to any scatterplot, curved or not, and it always passes through the means. Whether a straight line is a fair summary, and how far the points typically lie from it, is the next lesson’s question (residuals, R² and the residual standard error). Whether the slope could be chance, and how precisely it is known, is module 2’s. And a slope from one explanatory variable mixes in everything that travels with x; holding other variables fixed is module 3’s.' },
  ],

  formulas: [
    { id: 'ls-line', name: 'The fitted line and residual',
      tex: String.raw`\hat{y} = b_0 + b_1 x, \qquad e = y - \hat{y}`,
      where: [[String.raw`\hat{y}`, 'Fitted value of the response for a given x', 'y’s units'], [String.raw`b_0`, 'Intercept: the fitted value at x = 0', 'y’s units'], [String.raw`b_1`, 'Slope: the change in ŷ per unit of x', 'y’s units per x’s unit'], [String.raw`x`, 'Explanatory variable', 'its units'], [String.raw`y`, 'Observed response', 'its units'], [String.raw`e`, 'Residual: observed minus fitted', 'y’s units']],
      note: 'Population counterparts, used from module 2: β₀ and β₁.' },
    { id: 'ls-criterion', name: 'The least-squares criterion',
      tex: String.raw`\text{SSE} = \sum_{i=1}^{n} (y_i - b_0 - b_1 x_i)^2 \;\text{ is minimised}`,
      where: [[String.raw`\text{SSE}`, 'Sum of squared residuals (error sum of squares)', 'y’s units squared'], [String.raw`n`, 'Number of observations', ''], [String.raw`x_i, y_i`, 'The i-th observation', 'their units'], [String.raw`b_0, b_1`, 'Intercept and slope being chosen', 'as above']],
      assumptions: 'None to fit the line; the line is a description. Inference about it (module 2) needs conditions.' },
    { id: 'ls-slope', name: 'Least-squares slope',
      tex: String.raw`b_1 = \frac{\sum (x - \bar{x})(y - \bar{y})}{\sum (x - \bar{x})^2} = r\,\frac{s_y}{s_x}`,
      where: [[String.raw`b_1`, 'Slope', 'y’s units per x’s unit'], [String.raw`x, y`, 'The two variables', 'their units'], [String.raw`\bar{x}, \bar{y}`, 'Means of x and y', 'their units'], [String.raw`r`, 'Pearson correlation of x and y', ''], [String.raw`s_x, s_y`, 'Sample standard deviations of x and y', 'their units']],
      note: 'Excel: <x>=SLOPE(known_y\'s,known_x\'s)</x>, y first.' },
    { id: 'ls-intercept', name: 'Least-squares intercept',
      tex: String.raw`b_0 = \bar{y} - b_1\,\bar{x}`,
      where: [[String.raw`b_0`, 'Intercept', 'y’s units'], [String.raw`b_1`, 'Slope', 'y’s units per x’s unit'], [String.raw`\bar{x}, \bar{y}`, 'Means of x and y', 'their units']],
      note: 'So the line passes through (x̄, ȳ). Excel: <x>=INTERCEPT(known_y\'s,known_x\'s)</x>.' },
    { id: 'ls-two-lines', name: 'The regressions of y on x and of x on y',
      tex: String.raw`b_{y\cdot x} = r\,\frac{s_y}{s_x}, \qquad b_{x\cdot y} = r\,\frac{s_x}{s_y}, \qquad b_{y\cdot x}\,b_{x\cdot y} = r^2`,
      where: [[String.raw`b_{y\cdot x}`, 'Slope for predicting y from x', 'y’s units per x’s unit'], [String.raw`b_{x\cdot y}`, 'Slope for predicting x from y', 'x’s units per y’s unit'], [String.raw`r`, 'Correlation of x and y', ''], [String.raw`s_x, s_y`, 'Standard deviations', 'their units']],
      note: 'The two lines coincide only when r = ±1.' },
    { id: 'ls-standard-units', name: 'The line in standard units',
      tex: String.raw`\hat{z}_y = r\,z_x, \qquad z_x = \frac{x - \bar{x}}{s_x}`,
      where: [[String.raw`z_x`, 'x in standard deviations from its mean', ''], [String.raw`x, \bar{x}`, 'A value of x and the mean of x', 'x’s units'], [String.raw`s_x`, 'Standard deviation of x', 'x’s units'], [String.raw`\hat{z}_y`, 'Fitted y in standard deviations from its mean', ''], [String.raw`r`, 'Correlation of x and y', '']],
      note: 'With |r| below 1 the fitted value is always nearer its mean than x is: regression toward the mean.' },
  ],

  examples: [
    { level: 'simple', title: 'Six days of bike hire', fictional: true,
      setup: 'Harrier Cycle Hire (fictional), a seaside kiosk, recorded the day’s high (°C) and bikes hired on six days. Find the least-squares line by hand and interpret its slope.',
      table: { head: ['High (°C)', 'Bikes', 'x − x̄', 'y − ȳ', '(x − x̄)(y − ȳ)', '(x − x̄)²'], rows: BX.map((x, i) => [String(x), String(BY[i]), String(x - bxm), String(BY[i] - bym), String((x - bxm) * (BY[i] - bym)), String((x - bxm) ** 2)]), foot: [['Sum: 114', '288', '0', '0', String(BSxy), String(BSxx)]], align: ['r', 'r', 'r', 'r', 'r', 'r'] },
      steps: [
        'Means: x̄ = 114 ÷ 6 = 19 °C and ȳ = 288 ÷ 6 = 48 bikes.',
        'Deviations and their products are in the table. The deviations each add to 0, as they always do.',
        String.raw`Slope (the least-squares formula): <m>b_1 = 344 \div 132 = 2.606</m> bikes per °C.`,
        String.raw`Intercept (the line passes through the means): <m>b_0 = 48 - 2.606 \times 19 = -1.52</m> bikes.`,
        String.raw`Line: <m>\widehat{\text{bikes}} = -1.52 + 2.61 \times \text{high}</m>. Check one point: at 20 °C it gives <m>-1.52 + 2.606 \times 20 = 50.6</m>, against 50 actually hired.`,
      ],
      answer: 'ŷ = −1.52 + 2.61x: about 2.6 more bikes hired for each degree warmer, on these six days.',
      interpretation: 'The slope is the useful number: a forecast of 25 °C rather than 20 °C goes with about 13 more hires. The intercept, −1.5 bikes at 0 °C, is meaningless: the kiosk’s days ran from 12 to 26 °C, and a negative number of hires is impossible. Six days is also very little evidence; module 2 shows how uncertain such a slope is.' },
    { level: 'challenging', title: 'What a transaction is worth at each café', fictional: true,
      setup: 'From the year’s summary statistics, find the least-squares line of sales on transactions at Harbourside and at Millbrook, explain why both intercepts are negative, and say what the slopes do and don’t mean.',
      table: { head: ['', 'Harbourside', 'Millbrook'], rows: [['Mean transactions', mean(tH).toFixed(2), mean(tM).toFixed(2)], ['SD of transactions', sd(tH).toFixed(2), sd(tM).toFixed(2)], ['Mean sales ($)', mean(sH).toFixed(2), mean(sM).toFixed(2)], ['SD of sales ($)', sd(sH).toFixed(2), sd(sM).toFixed(2)], ['r', rH.toFixed(4), rM.toFixed(4)]], align: ['l', 'r', 'r'] },
      steps: [
        String.raw`Harbourside slope: <m>b_1 = 0.9922 \times 224.68 \div 33.57 = 6.641</m> dollars per transaction; intercept <m>b_0 = 358.17 - 6.641 \times 65.46 = -76.58</m> dollars.`,
        String.raw`Millbrook slope: <m>b_1 = 0.9821 \times 167.22 \div 45.65 = 3.597</m>; intercept <m>b_0 = 413.07 - 3.597 \times 124.38 = -34.36</m> dollars.`,
        String.raw`Sales per transaction over the year (ȳ ÷ x̄): $5.47 at Harbourside, $3.32 at Millbrook. Each slope is above its café’s figure, so each line, passing through the means, must cross x = 0 below zero: <m>b_0 = \bar{x}(\bar{y}/\bar{x} - b_1)</m>.`,
        'Why the slopes are steeper than an average sale: inside each café, busier days go with larger average tickets (B05; planted in the data), so sales rise faster than in proportion to transactions.',
        'The festival days: Harbourside’s five festival days had 242 to 293 transactions, among the busiest of the year. Leave them out and the slope is $5.91, the intercept −$32.56. Squared misses give such far-out points a strong pull, which the transformations-and-influence lesson measures.',
      ],
      answer: 'Harbourside: sales = −76.58 + 6.64 × transactions. Millbrook: sales = −34.36 + 3.60 × transactions. Both intercepts are negative because each slope exceeds the café’s sales per transaction.',
      interpretation: 'Across Harbourside’s days, each extra transaction went with $6.64 more in sales, on average; at Millbrook, $3.60. These are comparisons between days, and days with more transactions also differ in other ways (bigger groups, warmer weather, festivals), so the slope is not the price of one more sale. Neither intercept is a forecast: no day had fewer than 13 transactions, and sales can’t be negative.' },
    { level: 'applied', title: 'A promotion after the quietest days?', fictional: true,
      setup: 'Ana is considering a “we’ve missed you” push through the loyalty app, sent after any unusually quiet weekday at Harbourside, and plans to judge it by comparing footfall on the quiet day with footfall on the same weekday a week later. Before she runs it, what does the log say would happen with no push at all? Use Harbourside’s 152 weekdays from 1 May to 30 November.',
      steps: [
        'Choose the cases the way the plan would: the ten quietest weekdays, which averaged 74.6 people.',
        'Look a week later, with nothing done: the same weekdays averaged 113.9 people, a rise of 39.3 people, or 53%.',
        String.raw`Compare with the regression line of next week’s footfall on this week’s: <m>\widehat{\text{next}} = 79.86 + 0.369 \times \text{this}</m> (r = 0.370). At 74.6 it predicts 107.4: most of the rise is what imperfect correlation implies.`,
        'Explain it: nine of the ten quiet days had rain, and in this log rain on one day says nothing about rain a week later. The quiet days were extreme partly by bad luck that didn’t repeat.',
        'Check the other tail: the ten busiest weekdays averaged 172.4, and a week later 145.5. The fall is the same effect.',
      ],
      answer: 'With no promotion, the quietest weekdays were followed a week later by footfall 53% higher (74.6 to 113.9 people). A before-and-after comparison would credit the push with a rise that happens anyway.',
      interpretation: 'If Ana runs the push, she should compare quiet days that got it with quiet days, chosen the same way, that didn’t: for example, send it after a randomly chosen half of the quiet days. Only the difference between those groups is evidence about the push. The same trap catches bonuses for the best month, extra training for the worst stores and any intervention aimed at extremes.' },
  ],

  demo: [
    { widget: 'ls-fit', intro: 'Thirty June days at Harbourside: transactions and sales. Move the intercept and slope and watch the residuals and their sum of squares; try to beat the least-squares line, then press the button to see it. Notice that a line through the middle of the cloud can still be too flat or too steep.' },
    { widget: 'ls-standard', intro: 'The line in standard units. Set r, the two standard deviations and how unusual a day is in x; read both slopes, the fitted value and how far it has regressed toward the mean. Try r = 0.436 with Harbourside’s standard deviations, then r = 0.99.' },
    { widget: 'ls-temp', intro: 'All 306 Harbourside days, footfall against the day’s high, with the least-squares line of footfall on the high (tick “Show the least-squares line”). The cloud is wide (r = 0.436), which is exactly when the regressions of y on x and of x on y differ most.' },
    { widget: 'ls-sheet', intro: 'The June days in a worksheet: SLOPE and INTERCEPT, the slope rebuilt from CORREL and STDEV.S, the intercept from the means, and the regression the other way round. Change a day’s sales and every result updates.' },
  ],

  mistakes: [
    { title: '“The intercept is the sales on a day with no customers.”', html: 'Only if x = 0 is inside the data. Harbourside’s quietest day had 13 transactions, and its line crosses zero at −$76.58, an impossible value. The intercept is where a straight line fitted to busy and quiet days happens to meet the axis; read it only when x = 0 is a real, observed situation, or centre x so the intercept describes a typical day.' },
    { title: 'Swapping known_y’s and known_x’s', html: '<x>=SLOPE(footfall,high)</x> and <x>=SLOPE(high,footfall)</x> are different lines, not reciprocals: 2.016 people per °F against 0.0944 °F per person, whose product is r² = 0.190. Put the variable you want to predict first.' },
    { title: '“The slope is what one more customer adds.”', html: 'A slope compares days that differ in x, and everything that travels with x comes along: Harbourside’s busier days are also warmer, weekend and festival days with bigger tickets. That is why its slope, $6.64, is above the $5.47 an average transaction brings in. Read it as “goes with”, not “adds”.' },
    { title: 'Fitting one line to two groups', html: 'All 612 café-days give sales = 67.37 + 3.35 × transactions, a line that runs between Harbourside’s band and Millbrook’s and describes neither. When the scatterplot shows separate groups, fit each, or (module 3) add the group to the model.' },
    { title: 'Crediting an action with regression toward the mean', html: 'Choose cases because they were extreme and they will tend to be less extreme next time, with or without your action: Harbourside’s ten quietest weekdays were 53% busier a week later with nothing done. Compare with a group chosen the same way that didn’t get the action.' },
  ],

  application: [
    { case: 'Ana budgets the cafés’ till takings for 2028 from the transactions each café expects. Her note: “Across 2027, each extra transaction went with $6.64 of sales at Harbourside and $3.60 at Millbrook (least-squares lines of daily sales on transactions). Use these for days in the range we have seen, 13–293 transactions at Harbourside and 38–231 at Millbrook. Don’t use the intercepts: they are negative and describe no real day. Harbourside’s slope leans on its five festival days; without them it is $5.91, so for an ordinary day I use the line fitted without them and treat festivals separately.”' },
    { p: 'The note does what a careful analyst does with any slope: it gives the number with its units and its source, keeps each café on its own line, states the range the line was fitted to, refuses to read the intercept, and flags the handful of days that move the answer. It also chooses the direction of the regression from the decision: Ana knows the transactions she expects and wants sales, so sales is y.' },
    { p: 'The same reading turns up across businesses. A hotel regresses room-service revenue on occupied rooms and quotes dollars per occupied room, not the intercept at zero rooms. A battery-storage installer regresses installation hours on system size and uses the slope in quotes, knowing that a tiny system still needs a site visit the line doesn’t see. A retailer regresses online sales on site visits; marketing wants visits on sales to set traffic targets, which is a different line, not the first turned round.' },
    { p: 'Regression toward the mean deserves its own place in practice. A sales director who sends the bottom ten branches on a training course and sees them improve, or rewards last quarter’s top performers and watches them slip, is often watching regression toward the mean. The defence is to plan the comparison before acting: pick the extremes, give the action to some and not others, and compare the groups.' },
  ],

  summary: [
    'The least-squares line ŷ = b₀ + b₁x makes the sum of squared vertical misses, SSE = Σ(y − ŷ)², as small as possible.',
    'b₁ = Σ(x − x̄)(y − ȳ) ÷ Σ(x − x̄)² = r·s_y ÷ s_x and b₀ = ȳ − b₁x̄, so the line passes through the point of means.',
    'Read a slope in y’s units per unit of x, as a comparison between cases (“goes with”), not as the effect of changing x. Harbourside: $6.64 of sales per transaction; Millbrook: $3.60.',
    'The intercept is the fitted value at x = 0; read it only when x = 0 is inside the data. Harbourside’s −$76.58 means nothing: no day had fewer than 13 transactions.',
    'The regression of y on x and that of x on y are different lines; their slopes multiply to r². Choose the one whose y you want to predict.',
    'In standard units ẑ_y = r·z_x: predictions are less extreme than the values they come from. Cases chosen for being extreme tend to be less extreme next time, with or without an intervention.',
    'Excel: SLOPE and INTERCEPT take y first; <x>=CORREL(x,y)*STDEV.S(y)/STDEV.S(x)</x> gives the same slope.',
  ],

  glossary: [
    { term: 'Fitted value', def: 'The value of the response that a fitted line or model gives for a case’s values of the explanatory variables, written ŷ.' },
    { term: 'Slope', def: 'In a fitted line ŷ = b₀ + b₁x, the coefficient b₁: the change in the fitted value for each one-unit increase in x, in y’s units per unit of x.' },
    { term: 'Intercept', def: 'In a fitted line ŷ = b₀ + b₁x, the coefficient b₀: the fitted value when x is 0. It has a sensible meaning only when x = 0 is within or close to the data.' },
    { term: 'Least squares', def: 'The rule for fitting a line or model that chooses the coefficients making the sum of squared residuals as small as possible.' },
    { term: 'Centring', def: 'Subtracting a fixed value, often the mean, from a variable before fitting, so that the intercept describes a typical case rather than x = 0. The slope is unchanged.' },
  ],

  references: [
    { text: 'Illowsky, B. &amp; Dean, S. (2023). <i>Introductory Statistics 2e</i>, section 12.3, “The Regression Equation”. OpenStax.', url: 'https://openstax.org/books/introductory-statistics/pages/12-3-the-regression-equation', checked: '2026-11-01' },
    { text: 'Microsoft Support. “SLOPE function”.', url: 'https://support.microsoft.com/en-us/excel/functions/slope-function', checked: '2026-11-01' },
    { text: 'Wikipedia. “Regression toward the mean” (on Galton’s 1886 paper and the standardised regression line).', url: 'https://en.wikipedia.org/wiki/Regression_toward_the_mean', checked: '2026-11-01' },
  ],

  checks: [
    // the café lines
    { what: 'Days per café', value: tH.length, shown: 306 },
    { what: 'Harbourside r trans–sales (2 dp)', value: rH, shown: 0.99 },
    { what: 'Harbourside r (4 dp)', value: rH, shown: 0.9922, tol: 0.00005 },
    { what: 'Mean transactions H', value: mean(tH), shown: 65.46, tol: 0.005 },
    { what: 'SD transactions H', value: sd(tH), shown: 33.57, tol: 0.005 },
    { what: 'Mean sales H', value: mean(sH), shown: 358.17, tol: 0.005 },
    { what: 'SD sales H', value: sd(sH), shown: 224.68, tol: 0.005 },
    { what: 'Slope H from r·sy/sx', value: rH * sd(sH) / sd(tH), shown: 6.641, tol: 0.0005 },
    { what: 'Slope H (engine)', value: b1H, shown: 6.64 },
    { what: 'r·sy/sx equals the engine slope', value: rH * sd(sH) / sd(tH), shown: b1H, tol: 1e-9 },
    { what: 'Intercept H', value: b0H, shown: -76.58 },
    { what: 'Intercept from means', value: mean(sH) - b1H * mean(tH), shown: -76.58 },
    { what: 'Slope per 10 transactions', value: 10 * b1H, shown: 66.41 },
    { what: 'Fewest transactions H', value: Math.min(...tH), shown: 13 },
    { what: 'Most transactions H', value: Math.max(...tH), shown: 293 },
    { what: 'Sales H total', value: sum(sH), shown: 109600.64, tol: 0.005 },
    { what: 'Transactions H total', value: sum(tH), shown: 20032 },
    { what: 'Sales per transaction H', value: perH, shown: 5.47 },
    { what: 'Intercept from x̄(ȳ/x̄ − b1)', value: mean(tH) * (perH - b1H), shown: -76.58 },
    { what: 'Slope above sales per transaction (H)', value: Number(b1H > perH), shown: 1 },
    { what: 'B05 mean daily ticket H about 5.34', value: mean(column('avg_ticket', H)), shown: 5.34 },
    { what: 'Mean daily ticket below per-transaction figure', value: Number(mean(column('avg_ticket', H)) < perH), shown: 1 },
    { what: 'Millbrook slope', value: b1M, shown: 3.60 },
    { what: 'Millbrook slope (3 dp)', value: b1M, shown: 3.597, tol: 0.0005 },
    { what: 'Millbrook intercept', value: b0M, shown: -34.36 },
    { what: 'Millbrook r (4 dp)', value: rM, shown: 0.9821, tol: 0.00005 },
    { what: 'Millbrook SD sales', value: sd(sM), shown: 167.22 },
    { what: 'Millbrook SD transactions', value: sd(tM), shown: 45.65 },
    { what: 'Millbrook mean sales', value: mean(sM), shown: 413.07 },
    { what: 'Millbrook mean transactions', value: mean(tM), shown: 124.38 },
    { what: 'Millbrook intercept from means', value: mean(sM) - b1M * mean(tM), shown: -34.36 },
    { what: 'Sales per transaction M', value: perM, shown: 3.32 },
    { what: 'Slope above per-transaction (M)', value: Number(b1M > perM), shown: 1 },
    { what: 'Millbrook range low', value: Math.min(...tM), shown: 38 },
    { what: 'Millbrook range high', value: Math.max(...tM), shown: 231 },
    { what: 'Planted: tickets rise with footfall inside each café (B05)', value: Number(corr(column('footfall', H), column('avg_ticket', H)) > 0 && corr(column('footfall', M), column('avg_ticket', M)) > 0), shown: 1 },
    { what: 'Pooled slope', value: POOL.beta[1], shown: 3.35 },
    { what: 'Pooled intercept', value: POOL.beta[0], shown: 67.37 },
    { what: 'Pooled rows', value: POOL.n, shown: 612 },
    { what: 'Pooled line runs between the two cafés’ lines at each café’s mean', value: Number([mean(tH), mean(tM)].every((x) => { const p = POOL.beta[0] + POOL.beta[1] * x; return p < b0H + b1H * x && p > b0M + b1M * x; })), shown: 1 },
    // festivals
    { what: 'Festival days', value: fest.length, shown: 5 },
    { what: 'Festival transactions low', value: Math.min(...fest.map((i) => tH[i])), shown: 242 },
    { what: 'Festival transactions high', value: Math.max(...fest.map((i) => tH[i])), shown: 293 },
    { what: 'Slope without festivals', value: LNF.beta[1], shown: 5.91 },
    { what: 'Sales per transaction without festivals', value: sum(NF.map((i) => sH[i])) / sum(NF.map((i) => tH[i])), shown: 5.38 },
    { what: 'Without festivals the slope is still above sales per transaction', value: Number(LNF.beta[1] > sum(NF.map((i) => sH[i])) / sum(NF.map((i) => tH[i])) && LNF.beta[0] < 0), shown: 1 },
    { what: 'B05 mean daily ticket M about 3.27', value: mean(column('avg_ticket', M)), shown: 3.27 },
    { what: 'Intercept without festivals', value: LNF.beta[0], shown: -32.56 },
    // two lines
    { what: 'Mean high', value: mean(hiH), shown: 64.18 },
    { what: 'SD high', value: sd(hiH), shown: 15.00 },
    { what: 'Mean footfall H', value: mean(ftH), shown: 139.69 },
    { what: 'SD footfall H', value: sd(ftH), shown: 69.29 },
    { what: 'r high–footfall', value: rFT, shown: 0.436, tol: 0.0005 },
    { what: 'Footfall on high slope', value: YX.beta[1], shown: 2.016, tol: 0.0005 },
    { what: 'Footfall on high slope (1 dp)', value: YX.beta[1], shown: 2.0, tol: 0.05 },
    { what: 'Footfall on high intercept', value: YX.beta[0], shown: 10.33 },
    { what: 'High on footfall slope', value: XY.beta[1], shown: 0.0944, tol: 0.00005 },
    { what: 'High on footfall intercept', value: XY.beta[0], shown: 50.99 },
    { what: 'Inverted x-on-y slope', value: 1 / XY.beta[1], shown: 10.6, tol: 0.05 },
    { what: 'About five times', value: (1 / XY.beta[1]) / YX.beta[1], shown: 5, tol: 0.3 },
    { what: 'Product of slopes', value: YX.beta[1] * XY.beta[1], shown: 0.190, tol: 0.0005 },
    { what: 'Product equals r²', value: YX.beta[1] * XY.beta[1], shown: rFT ** 2, tol: 1e-9 },
    // standard units
    { what: '1 SD warmer than average ≈ 79 °F', value: mean(hiH) + sd(hiH), shown: 79, tol: 0.5 },
    { what: 'Fitted footfall 1 SD warmer', value: mean(ftH) + rFT * sd(ftH), shown: 169.9, tol: 0.05 },
    { what: 'Same from the line', value: YX.beta[0] + YX.beta[1] * (mean(hiH) + sd(hiH)), shown: 169.9, tol: 0.05 },
    { what: 'Footfall 1 SD above average', value: mean(ftH) + sd(ftH), shown: 209, tol: 0.5 },
    { what: 'Fitted high for it', value: mean(hiH) + rFT * sd(hiH), shown: 70.7, tol: 0.05 },
    // rain intercept
    { what: 'Rain intercept', value: RAIN.beta[0], shown: 146.6, tol: 0.05 },
    { what: 'Rain slope', value: RAIN.beta[1], shown: -81.1, tol: 0.05 },
    { what: 'Dry days H', value: dryH, shown: 209 },
    { what: 'Dry-day mean footfall', value: mean(ftH.filter((_, i) => rnH[i] === 0)), shown: 146.6, tol: 0.05 },
    { what: 'Centred intercept = mean sales', value: R.fit(sH, { x: tH.map((v) => v - mean(tH)) }).beta[0], shown: 358.17, tol: 0.005 },
    { what: 'Centring keeps the slope', value: R.fit(sH, { x: tH.map((v) => v - mean(tH)) }).beta[1], shown: b1H, tol: 1e-9 },
    // regression toward the mean
    { what: 'Weekdays 1 May–30 Nov', value: CAND.length, shown: 152 },
    { what: 'Quietest ten mean', value: qNow, shown: 74.6, tol: 0.05 },
    { what: 'A week later', value: qNext, shown: 113.9, tol: 0.05 },
    { what: 'Rise in people', value: qNext - qNow, shown: 39.3, tol: 0.05 },
    { what: 'Rise in %', value: (qNext / qNow - 1) * 100, shown: 53, tol: 0.5 },
    { what: 'All weekdays mean', value: cNow, shown: 126.2, tol: 0.05 },
    { what: 'All weekdays next week, about the same', value: Math.abs(cNext - cNow), shown: 0.2, tol: 0.1 },
    { what: 'Busiest ten mean', value: bNow, shown: 172.4, tol: 0.05 },
    { what: 'Busiest a week later', value: bNext, shown: 145.5, tol: 0.05 },
    { what: 'Next-week correlation', value: rNext, shown: 0.370, tol: 0.0005 },
    { what: 'Next-week intercept', value: NEXT.beta[0], shown: 79.86 },
    { what: 'Next-week slope', value: NEXT.beta[1], shown: 0.369, tol: 0.0005 },
    { what: 'Predicted at 74.6', value: qPred, shown: 107.4, tol: 0.05 },
    { what: 'Quiet days with rain', value: qRain, shown: 9 },
    { what: 'Rain nearly independent day to day (lag-1 |r| < 0.1)', value: Number(Math.abs(R.lag1(rnH)) < 0.1), shown: 1 },
    // Harrier Cycle Hire
    { what: 'x̄ bikes', value: bxm, shown: 19 },
    { what: 'ȳ bikes', value: bym, shown: 48 },
    { what: 'Σx', value: sum(BX), shown: 114 },
    { what: 'Σy', value: sum(BY), shown: 288 },
    { what: 'Sxy', value: BSxy, shown: 344 },
    { what: 'Sxx', value: BSxx, shown: 132 },
    { what: 'Bike slope', value: Bb1, shown: 2.606, tol: 0.0005 },
    { what: 'Bike slope (2 dp)', value: Bb1, shown: 2.61 },
    { what: 'Bike slope (1 dp)', value: Bb1, shown: 2.6, tol: 0.05 },
    { what: 'Bike intercept', value: Bb0, shown: -1.52 },
    { what: 'Bike intercept (1 dp)', value: Bb0, shown: -1.5, tol: 0.05 },
    { what: 'Engine agrees (bikes)', value: BF.beta[1], shown: Bb1, tol: 1e-9 },
    { what: 'Fitted at 20 °C', value: Bb0 + Bb1 * 20, shown: 50.6, tol: 0.05 },
    { what: '25 vs 20 °C: about 13 more', value: Bb1 * 5, shown: 13, tol: 0.1 },
    { what: '°C per °F factor', value: 9 / 5, shown: 1.8 },
  ],
};
