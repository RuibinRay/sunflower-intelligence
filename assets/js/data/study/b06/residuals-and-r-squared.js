// residuals-and-r-squared.js — B06 · Residuals and R². Content only; exercises are in residuals-and-r-squared.ex.js.
// Uses the cafés' corrected log from case.js: Harbourside's sales on transactions (DERIVED.salesOnTransH) for the
// residuals, the sums of squares, R² and the residual standard error; the iced share against the day's high (both
// cafés, B05's r = 0.94) for the first residual plot; footfall against the high and rain at Harbourside for a low R²
// that is still useful; and Harbourside's days with 50–70 transactions for R²'s dependence on the range of x. Otterburn
// Laundry is fictional. Fitting the line is least-squares-line's; tests are module 2's; residual plots in full (spread,
// normality, order) are assumptions-and-diagnostics'. Every figure printed is recomputed in `checks`.
import { column, DERIVED as D } from './case.js?v=31';
import * as R from '../../../core/regression.js?v=31';
import { mean, sd } from '../../../core/stats.js?v=31';

const H = { cafe: 'Harbourside' };
const sum = (a) => a.reduce((s, v) => s + v, 0);
const corr = (a, b) => { const ma = mean(a), mb = mean(b); let sab = 0, saa = 0, sbb = 0; a.forEach((v, i) => { sab += (v - ma) * (b[i] - mb); saa += (v - ma) ** 2; sbb += (b[i] - mb) ** 2; }); return sab / Math.sqrt(saa * sbb); };
const band = (x, e, a, b) => { const k = x.map((v, i) => (v >= a && v < b ? i : -1)).filter((i) => i >= 0); return { n: k.length, e: mean(k.map((i) => e[i])) }; };

// ---------------------------------------------------------------- Harbourside: sales on transactions
const L = D.salesOnTransH;
const tH = column('transactions', H), sH = column('sales', H), dH = column('date', H);
const SST = L.sst, SSE = L.sse, SSR = L.sst - L.sse;
const rH = corr(tH, sH), rYF = corr(sH, Array.from(L.fitted));
const day = (iso) => { const i = dH.indexOf(iso); return { t: tH[i], s: sH[i], f: L.fitted[i], e: L.resid[i] }; };
const JUL = day('2027-07-14'), FEST = day('2027-05-29');
const within2 = L.resid.filter((e) => Math.abs(e) <= 2 * L.sigma).length;
const SB = [[0, 40], [40, 60], [60, 80], [80, 120], [120, 400]].map(([a, b]) => ({ a, b, ...band(tH, L.resid, a, b) }));
const festH = column('festival01', H), NFI = tH.map((_, i) => i).filter((i) => !festH[i]);
const TOP = tH.map((v, i) => (v >= 120 ? i : -1)).filter((i) => i >= 0), TOPF = TOP.filter((i) => festH[i]), TOPN = TOP.filter((i) => !festH[i]);
const LNF = R.fit(NFI.map((i) => sH[i]), { x: NFI.map((i) => tH[i]) });
const SBN = [[0, 40], [40, 60], [60, 80], [80, 120], [120, 400]].map(([a, b]) => ({ a, b, ...band(NFI.map((i) => tH[i]), Array.from(LNF.resid), a, b) }));
const RANGE = (() => { const k = tH.map((v, i) => (v >= 50 && v <= 70 ? i : -1)).filter((i) => i >= 0); return { n: k.length, f: R.fit(k.map((i) => sH[i]), { x: k.map((i) => tH[i]) }) }; })();
// ---------------------------------------------------------------- iced share against the day's high, both cafés
const IC = column('iced_share'), HI = column('high_f');
const IL = R.fit(IC, { x: HI });
const IB = [[0, 45], [45, 55], [55, 65], [65, 75], [75, 85], [85, 100]].map(([a, b]) => ({ a, b, ...band(HI, IL.resid, a, b) }));
const negFit = Array.from(IL.fitted).filter((v) => v < 0).length;
const COLD = HI.map((v, i) => (v < 40 ? i : -1)).filter((i) => i >= 0);
// ---------------------------------------------------------------- low R², still useful: footfall on the high and on rain at Harbourside
const ftH = column('footfall', H), hiH = column('high_f', H), rnH = column('rain_in', H), moH = column('month', H);
const FT = R.fit(ftH, { x: hiH }), RN = R.fit(ftH, { x: rnH });
const mhi = (m) => mean(hiH.filter((_, i) => moH[i] === m));
// the cafés' opening build-up (the generator's ramp: 72% on 1 March rising to 100% after 120 days), held fixed in module 3
const dayH = column('day', H), rampH = dayH.map((d) => Math.min(1, 0.72 + 0.28 * (d - 1) / 120));
const FTR = R.fit(ftH, { High: hiH, Ramp: rampH });
const FTA = R.fit(ftH, { High: hiH, Ramp: rampH, Weekend: column('weekend', H), Rain: rnH, Festival: column('festival01', H) });
// ---------------------------------------------------------------- Otterburn Laundry (fictional): five weeks
const OX = [2, 4, 6, 8, 10], OY = [7, 9, 14, 15, 20];
const OF = R.fit(OY, { x: OX });
const oxm = mean(OX), oym = mean(OY);
const oSxx = sum(OX.map((x) => (x - oxm) ** 2)), oSxy = sum(OX.map((x, i) => (x - oxm) * (OY[i] - oym)));
const ob1 = oSxy / oSxx, ob0 = oym - ob1 * oxm;
const ofit = OX.map((x) => ob0 + ob1 * x), ores = OY.map((y, i) => y - ofit[i]);
const oSSE = sum(ores.map((e) => e * e)), oSST = sum(OY.map((y) => (y - oym) ** 2)), oSSR = sum(ofit.map((f) => (f - oym) ** 2));

function splitFigure() {
  // One point's deviation from ȳ split into the part the line accounts for and the residual. 440 wide; text 15.
  const L0 = 60, Rr = 420, T = 20, Bt = 240;
  const X = (x) => L0 + ((x - 0) / (12 - 0)) * (Rr - L0), Y = (y) => Bt - ((y - 4) / (23 - 4)) * (Bt - T);
  const px = 10, py = 20, pf = ob0 + ob1 * px;
  let svg = '<svg viewBox="0 0 440 300" xmlns="http://www.w3.org/2000/svg" font-size="15" fill="currentColor">';
  svg += `<line x1="${L0}" x2="${Rr}" y1="${Bt}" y2="${Bt}" stroke="var(--ink)"/><line x1="${L0}" x2="${L0}" y1="${T}" y2="${Bt}" stroke="var(--ink)"/>`;
  [0, 4, 8, 12].forEach((x) => { svg += `<text x="${X(x).toFixed(1)}" y="${Bt + 22}" text-anchor="middle" fill="var(--ink-3)">${x}</text>`; });
  [5, 10, 15, 20].forEach((y) => { svg += `<text x="${L0 - 8}" y="${(Y(y) + 5).toFixed(1)}" text-anchor="end" fill="var(--ink-3)">${y}</text>`; });
  svg += `<line x1="${X(0.5).toFixed(1)}" x2="${X(11.5).toFixed(1)}" y1="${Y(oym).toFixed(1)}" y2="${Y(oym).toFixed(1)}" stroke="var(--ink-3)" stroke-width="1.5" stroke-dasharray="6 4"/>`;
  svg += `<line x1="${X(0.5).toFixed(1)}" y1="${Y(ob0 + ob1 * 0.5).toFixed(1)}" x2="${X(10.6).toFixed(1)}" y2="${Y(ob0 + ob1 * 10.6).toFixed(1)}" stroke="var(--series-2)" stroke-width="2.5"/>`;
  OX.forEach((x, i) => { svg += `<circle cx="${X(x).toFixed(1)}" cy="${Y(OY[i]).toFixed(1)}" r="5.5" fill="var(--series-1)"/>`; });
  // brackets to the right of the highlighted point
  const bx = X(px) + 16;
  svg += `<line x1="${bx}" x2="${bx}" y1="${Y(oym).toFixed(1)}" y2="${Y(pf).toFixed(1)}" stroke="var(--series-2)" stroke-width="3"/>`;
  svg += `<line x1="${bx + 8}" x2="${bx + 8}" y1="${Y(pf).toFixed(1)}" y2="${Y(py).toFixed(1)}" stroke="var(--ink)" stroke-width="3"/>`;
  svg += `<text x="${bx + 16}" y="${((Y(oym) + Y(pf)) / 2 + 5).toFixed(1)}">ŷ − ȳ</text>`;
  svg += `<text x="${bx + 16}" y="${(Y(py) + 4).toFixed(1)}">y − ŷ</text>`;
  svg += `<text x="${X(1).toFixed(1)}" y="${(Y(oym) + 20).toFixed(1)}" fill="var(--ink-3)">ȳ = 13</text>`;
  svg += `<text x="${(L0 + Rr) / 2}" y="${Bt + 46}" text-anchor="middle" fill="var(--ink-3)">leaflets (hundreds)</text>`;
  svg += `<text x="18" y="${(T + Bt) / 2}" text-anchor="middle" fill="var(--ink-3)" transform="rotate(-90 18 ${(T + Bt) / 2})">new customers</text>`;
  return `${svg}</svg>`;
}

export default {
  slug: 'residuals-and-r-squared',
  title: 'Residuals and R²',
  blurb: 'Judge how well a line fits: residuals, the split of the total variation into SST = SSR + SSE, R² as the share of variation the line accounts for, and the residual standard error in y’s own units. Read a first residual plot, see a line with R² = 0.88 that is the wrong shape, and learn three things R² can’t tell you.',
  status: 'reviewed',
  objectives: [
    'Calculate residuals and interpret their sign and size in the units of the response.',
    'Calculate the total, regression and residual sums of squares, show that the first is the sum of the other two, and find R² from them.',
    'Interpret R² with careful wording, and show that it equals r² when there is one explanatory variable.',
    'Calculate and interpret the residual standard error, by formula and with STEYX.',
    'Read a residual plot for curvature, and explain why a high R² doesn’t show a line is right, a low R² doesn’t show it is useless, and R² depends on the range of x.',
  ],
  prerequisites: [
    { lesson: 'b06/least-squares-line', why: 'The least-squares line, its slope and intercept, and the normal equations that make residuals add to zero.' },
    { lesson: 'b05/nonlinear-and-restricted', why: 'The S-shaped iced-share curve and the way a restricted range shrinks r, both met again here through R².' },
    { lesson: 'b04/describing-distributions', why: 'Sums of squares, variance and standard deviation, which R² and the residual standard error are built from.' },
    { lesson: 'b03/descriptive-statistics-and-regression', why: 'RSQ, STEYX and the ToolPak’s R Square and Standard Error lines, read here more closely.' },
  ],
  case: 'lantern',

  concept: [
    { case: 'Ana now has a line for Harbourside: sales = −76.58 + 6.64 × transactions. On Wednesday 14 July the café made 81 transactions and took $484.45; the line says $461.35. On Saturday 29 May, a festival day, it made 293 and took $2,108.92; the line says $1,869.26. Is a line that misses by $23 on one day and $240 on another a good line? She needs ways to say how close the days lie to it, in dollars and in proportion.' },

    { h: 'Residuals' },
    { p: String.raw`A <g>residual</g> is the observed value minus the fitted value, <m>e = y - \hat{y}</m>, in y’s units. On 14 July it is <m>484.45 - 461.35 = +23.10</m> dollars: the café took $23.10 more than the line expects for 81 transactions. On 29 May it is +$239.66. A negative residual means a day below the line. Each residual is the part of that day’s sales the line doesn’t account for: the ticket mix, a coach party, the till rounding, chance.` },
    { p: 'Two facts from the least-squares line’s normal equations hold for every fit with an intercept: the residuals add up to exactly zero, and they have zero correlation with x. So a residual’s sign and size carry information about the day, not about which side of the line the method favours.' },

    { h: 'Splitting the variation' },
    { p: String.raw`Without any line, the best single guess for a day’s sales is the mean, $358.17, and the misses from it measure how much sales vary. The <b>total sum of squares</b> adds up their squares: <m>\text{SST} = \sum (y - \bar{y})^2</m>. Each day’s deviation from the mean splits into two pieces, the part the line accounts for and the residual:` },
    { math: String.raw`y - \bar{y} = (\hat{y} - \bar{y}) + (y - \hat{y})` },
    { figure: {
      svg: splitFigure(),
      caption: 'Otterburn Laundry (fictional), five weeks. For the week with 1,000 leaflets, the distance from the mean line (dashed, ȳ = 13) to the point splits into the part the fitted line accounts for, ŷ − ȳ = 6.4, and the residual, y − ŷ = 0.6.',
      alt: 'A scatterplot of new customers (vertical axis, 4 to 23) against leaflets in hundreds (horizontal axis, 0 to 12). Five points rise from (2, 7) to (10, 20). A dashed horizontal line marks the mean of 13 new customers, and a solid fitted line rises through the points. Beside the last point, at 10 hundred leaflets, a long vertical bar runs from the mean line up to the fitted line, labelled ŷ minus ȳ, and a short bar continues from the fitted line up to the point, labelled y minus ŷ.',
    } },
    { p: String.raw`Square both sides and add up over the days, and for a least-squares line with an intercept the cross-term vanishes (In depth shows why), leaving` },
    { math: String.raw`\underbrace{\sum (y - \bar{y})^2}_{\text{SST}} = \underbrace{\sum (\hat{y} - \bar{y})^2}_{\text{SSR}} + \underbrace{\sum (y - \hat{y})^2}_{\text{SSE}}` },
    { p: 'SSR, the <b>regression sum of squares</b>, is the variation in the fitted values; SSE, the residual (error) sum of squares, is what least squares made as small as it could. For Harbourside’s 306 days, SST = 15,397,215, SSR = 15,157,236 and SSE = 239,979 (all in dollars squared). Almost all of the day-to-day variation in sales lies along the line.' },

    { h: 'R², the share of variation accounted for' },
    { math: String.raw`R^2 = \frac{\text{SSR}}{\text{SST}} = 1 - \frac{\text{SSE}}{\text{SST}}` },
    { p: String.raw`For Harbourside <m>R^2 = 15{,}157{,}236 \div 15{,}397{,}215 = 0.984</m>. Say it carefully: “the line accounts for 98.4% of the variation in Harbourside’s daily sales around their mean.” Textbooks and software often say “explains”, and that is the conventional term, but it is a statement about squared deviations, not about causes. It is not “98.4% accurate”, and not “transactions cause 98.4% of sales”. <g>R squared</g> runs from 0 (the line does no better than the mean) to 1 (every point on the line).` },
    { p: String.raw`With one explanatory variable, R² is the square of the correlation: <m>0.9922^2 = 0.984</m>. It is also the squared correlation between y and the fitted values, which is how the idea carries over to models with several explanatory variables in module 3. Because squaring loses the sign, a line with a negative slope has <m>r = -\sqrt{R^2}</m>.` },

    { h: 'The residual standard error' },
    { p: String.raw`R² is a proportion. Ana also needs to know how far off the line typically is, in dollars. The <g>standard error of the regression</g>, or residual standard error, is` },
    { math: String.raw`s = \sqrt{\frac{\text{SSE}}{n - 2}}` },
    { p: String.raw`For Harbourside <m>s = \sqrt{239{,}979 \div 304} = 28.10</m> dollars: the line’s fitted sales are typically about $28 away from a day’s actual sales. Compare it with the standard deviation of sales, $224.68, the typical miss from the mean alone. In Excel it is <x>=STEYX(known_y's,known_x's)</x>, the “Standard Error” line in the ToolPak’s regression output (B03). On 298 of the 306 days (97%) the residual is within two residual standard errors, about ±$56, a rough guide that module 4 refines.` },
    { callout: 'key', title: 'Report both, and look at the residuals', html: 'R² says what share of the variation lies along the line; s says, in y’s units, how far off the line typically is. Neither says whether a straight line is the right shape. A residual plot does.' },
  ],

  theory: [
    { h: 'Why the sums of squares add up' },
    { p: String.raw`Squaring the split gives <m>\sum (y - \bar{y})^2 = \text{SSR} + \text{SSE} + 2\sum (\hat{y} - \bar{y})\,e</m>. The fitted value is <m>\hat{y} = b_0 + b_1 x</m>, so the cross-term is <m>2\sum (b_0 - \bar{y})\,e + 2b_1 \sum x\,e</m>, and both sums are zero by the normal equations (<m>\sum e = 0</m> and <m>\sum x e = 0</m>). The identity holds for least squares with an intercept, which is what Excel’s SLOPE, INTERCEPT, trendline and ToolPak fit. For a line forced through the origin, or a line fitted any other way, SST ≠ SSR + SSE and “1 − SSE ÷ SST” loses its meaning; Excel then reports an R² computed about zero instead of about the mean, which is why the least-squares-line lesson warned against comparing it.` },
    { p: 'The same three sums appear in the ToolPak’s ANOVA table: SS for Regression, Residual and Total. Dividing each by its degrees of freedom gives mean squares, and their ratio is the F statistic; that is module 2’s test.' },

    { h: 'Why n − 2' },
    { p: String.raw`The residual standard error divides by <m>n - 2</m>, not n. Two coefficients were estimated from the same data, and the residuals satisfy two constraints (the normal equations), so only <m>n - 2</m> of them are free to vary. Dividing by n would understate the typical miss, slightly with 306 days and badly with 6. More generally the divisor is <m>n - p</m>, with p coefficients counting the intercept, which is why STEYX and LINEST’s third row agree with the ToolPak.` },

    { h: 'A first residual plot' },
    { p: 'B05 found a correlation of 0.94 between the day’s high and the share of drinks served iced, over both cafés’ 612 days. The least-squares line is iced share = −0.747 + 0.0176 × high, with R² = 0.883 and s = 0.096 (9.6 percentage points). By R² this is an excellent line. Plot the residuals against the high and it isn’t.' },
    { table: {
      caption: 'Average residual of the iced-share line by band of the day’s high (both cafés, 612 days)',
      head: ['High (°F)', 'Days', 'Average residual'],
      rows: IB.map((b) => [b.a === 0 ? 'below 45' : b.b === 100 ? '85 and above' : `${b.a}–${b.b - 1}`, String(b.n), (b.e < 0 ? '−' : '+') + Math.abs(b.e).toFixed(3)]),
      align: ['l', 'r', 'r'],
    } },
    { p: 'The residuals are positive on cold days, negative from 45 to 64 °F, near zero around 70 and positive again from 75 to 84: a wave. A straight line through an S-shaped relationship misses in a pattern: the line runs below the curve on the coldest days, above it through the 50s and early 60s, and below it again in the late 70s and early 80s. Worse, the line gives a negative iced share on the coldest days: it crosses zero at 42.5 °F, and on the 32 café-days below 40 °F it fits −0.13 on average where the observed share was +0.06. The data were generated with a logistic curve in temperature, centred near 69 °F, so this pattern is the truth showing through.' },
    { p: 'Read a residual plot by looking for structure. If the line is the right shape, the residuals scatter evenly around zero with no trend, curve or funnel. A curve says the relationship bends; a funnel says the spread changes with x; isolated large residuals say some days don’t fit. Harbourside’s sales line, R² = 0.984, has a pattern too: its residuals average +$26.52 on days with fewer than 40 transactions, −$11.21 and −$22.98 in the 60–79 and 80–119 bands, and +$32.92 on the 11 days with 120 or more. Five of the 11 busiest days are festival days; the other six sit below the line (−$27 on average), because the festivals pull the line steeper. Fitted without them, the residuals still curve upward at the top (+$24 on the six busiest days), so the bend is real: tickets are larger on busy days, so sales grow a little faster than in proportion to transactions. The assumptions-and-diagnostics lesson reads such plots in full; the transformations-and-influence lesson shows what to do about curves.' },

    { h: 'What R² can’t tell you' },
    { p: '<b>Whether the line is the right shape.</b> Penn State’s regression course puts it bluntly: a high R² does not mean the line fits well, and a perfect curved relationship can have an R² near zero. The iced-share line, at 0.883, describes a curve with a straight line and predicts impossible values. Always plot.' },
    { p: String.raw`<b>Whether the line is useful.</b> At Harbourside, footfall on the day’s high gives R² = 0.190, a figure many people would dismiss. Yet the slope is 2.0 people per °F, and March days averaged 53.1 °F against 83.5 °F in July, so the line puts July’s typical footfall about 61 people above March’s, about one extra barista hour at the morning peak, even though on any single day the line misses by about s = 62 people, because weekends, rain and festivals matter as much as temperature. Rain is weaker still, R² = 0.052, with a slope of −81 people per inch. A low R² says the line leaves most day-to-day variation unexplained; it doesn’t say the slope is unimportant. Part of that 2.0 is the cafés’ opening build-up, which ran through the cold spring; module 3 holds it fixed and finds a smaller slope (1.79 with the build-up alone held fixed, 1.44 once weekends, rain and festivals are added).` },
    { p: String.raw`<b>Anything apart from the range of x it was computed on.</b> R² compares the spread along the line with the total spread of y, and the total spread depends on how widely x varies. Fit Harbourside’s sales line only on the 121 days with 50 to 70 transactions and R² falls from 0.984 to 0.859, while the typical miss falls too, from $28.10 to $13.51. The line fits those days at least as closely; there is simply less variation in sales for it to account for. This is B05’s restricted-range effect on r, squared. Comparing R² across data sets with different ranges of x compares the ranges as much as the fits.` },
    { p: '<b>Causes, or accuracy on new data.</b> R² measures association in the data used to fit the line. It doesn’t show that x causes y, and it is not predictive accuracy: a line fitted to one year can do worse on the next, especially when many explanatory variables are tried (the multicollinearity-and-model-choice lesson tests models on months they weren’t fitted to). Nor can R² be compared between models of different responses, such as sales and the logarithm of sales.' },
    { callout: 'note', title: 'Is 0.6 a “strong” R²?', html: 'Verbal labels for R² (or r) vary between textbooks and fields, and none is a standard; what counts as high in social science would be poor in a laboratory calibration. If you use a label, say whose convention it is. Better, report R² with the residual standard error in y’s units and let the decision decide whether the fit is good enough.' },

    { h: 'In Excel' },
    { p: 'With transactions in B2:B21, sales in C2:C21, the fitted values in E2:E21 and the residuals in F2:F21: <x>=RSQ(C2:C21,B2:B21)</x> gives R²; <x>=STEYX(C2:C21,B2:B21)</x> gives s; <x>=DEVSQ(C2:C21)</x> is SST; <x>=SUMSQ(F2:F21)</x> is SSE; and <x>=1-SUMSQ(F2:F21)/DEVSQ(C2:C21)</x> rebuilds R² from them. <x>=LINEST(C2:C21,B2:B21,TRUE,TRUE)</x> returns R² and s in its third row, and SSR and SSE in its fifth. A residual plot is a scatter chart of column F against column B (or against E); the ToolPak’s “Residual Plots” box draws it for you.' },
  ],

  formulas: [
    { id: 'resid-residual', name: 'Residual',
      tex: String.raw`e = y - \hat{y}`,
      where: [[String.raw`e`, 'Residual', 'y’s units'], [String.raw`y`, 'Observed value', 'y’s units'], [String.raw`\hat{y}`, 'Fitted value from the line', 'y’s units']],
      note: 'For least squares with an intercept, Σe = 0 and the residuals are uncorrelated with x.' },
    { id: 'resid-ss', name: 'Sums of squares',
      tex: String.raw`\text{SST} = \sum (y - \bar{y})^2 = \underbrace{\sum (\hat{y} - \bar{y})^2}_{\text{SSR}} + \underbrace{\sum (y - \hat{y})^2}_{\text{SSE}}`,
      where: [[String.raw`\text{SST}`, 'Total sum of squares: variation of y around its mean', 'y’s units squared'], [String.raw`\text{SSR}`, 'Regression sum of squares: variation of the fitted values', 'y’s units squared'], [String.raw`\text{SSE}`, 'Residual (error) sum of squares', 'y’s units squared'], [String.raw`y, \hat{y}, \bar{y}`, 'Observed, fitted and mean values of the response', 'y’s units']],
      assumptions: 'Least squares with an intercept.',
      note: 'Excel: DEVSQ(y) is SST; SUMSQ(residuals) is SSE. The ToolPak’s ANOVA table lists all three.' },
    { id: 'resid-r2', name: 'R² (coefficient of determination)',
      tex: String.raw`R^2 = \frac{\text{SSR}}{\text{SST}} = 1 - \frac{\text{SSE}}{\text{SST}} = r^2 \;\text{(one explanatory variable)}`,
      where: [[String.raw`R^2`, 'Share of the variation of y around its mean that the line accounts for', ''], [String.raw`\text{SSR}, \text{SSE}, \text{SST}`, 'Regression, residual and total sums of squares', 'y’s units squared'], [String.raw`r`, 'Correlation of x and y', '']],
      note: 'Excel: <x>=RSQ(known_y\'s,known_x\'s)</x>. Adjusted R², for several explanatory variables, is module 3’s.' },
    { id: 'resid-se', name: 'Residual standard error',
      tex: String.raw`s = \sqrt{\frac{\text{SSE}}{n - 2}}`,
      where: [[String.raw`s`, 'Typical size of a residual (also s_e)', 'y’s units'], [String.raw`\text{SSE}`, 'Residual sum of squares', 'y’s units squared'], [String.raw`n`, 'Number of observations', '']],
      note: 'Excel: <x>=STEYX(known_y\'s,known_x\'s)</x>. With p coefficients the divisor is n − p.' },
  ],

  examples: [
    { level: 'simple', title: 'Leaflets and new customers', fictional: true,
      setup: 'Otterburn Laundry (fictional) posted leaflets (in hundreds) for five weeks and counted new customers. Its least-squares line is new customers = 3.4 + 1.6 × leaflets. Calculate the residuals, the three sums of squares, R² and the residual standard error.',
      table: { head: ['Leaflets (hundreds)', 'New customers', 'Fitted', 'Residual'], rows: OX.map((x, i) => [String(x), String(OY[i]), ofit[i].toFixed(1), (ores[i] < 0 ? '−' : '') + Math.abs(ores[i]).toFixed(1)]), align: ['r', 'r', 'r', 'r'] },
      steps: [
        'Fitted values: 3.4 + 1.6 × 2 = 6.6, and so on down the table. Residuals: 7 − 6.6 = 0.4, 9 − 9.8 = −0.8, 1.0, −1.2, 0.6. They add up to 0.',
        String.raw`SSE: <m>0.4^2 + 0.8^2 + 1.0^2 + 1.2^2 + 0.6^2 = 3.6</m>.`,
        String.raw`SST, with <m>\bar{y} = 13</m>: <m>(-6)^2 + (-4)^2 + 1^2 + 2^2 + 7^2 = 106</m>. So SSR = 106 − 3.6 = 102.4, which matches <m>\sum (\hat{y} - \bar{y})^2</m> computed directly.`,
        String.raw`R² <m>= 1 - 3.6 \div 106 = 0.966</m>.`,
        String.raw`Residual standard error: <m>s = \sqrt{3.6 \div (5 - 2)} = 1.10</m> customers.`,
      ],
      answer: 'Residuals 0.4, −0.8, 1.0, −1.2, 0.6; SST = 106, SSR = 102.4, SSE = 3.6; R² = 0.966; s = 1.10 new customers.',
      interpretation: 'The line accounts for 96.6% of the week-to-week variation in new customers, and its fitted values are typically about one customer away from the counts. Five weeks is little evidence, and weeks with more leaflets may differ in other ways (the season, a competitor closing), so this describes the association, not what an extra hundred leaflets would bring.' },
    { level: 'challenging', title: 'Harbourside’s sales line in full', fictional: true,
      setup: 'For Harbourside’s 306 days, the line sales = −76.58 + 6.64 × transactions has SSE = 239,979 and the sales have SST = 15,397,215 (dollars squared). Find SSR, R², r and s, interpret them, and say what the R² of the same line fitted only to the days with 50 to 70 transactions shows.',
      steps: [
        String.raw`SSR = SST − SSE = <m>15{,}397{,}215 - 239{,}979 = 15{,}157{,}236</m>.`,
        String.raw`R² <m>= 15{,}157{,}236 \div 15{,}397{,}215 = 0.984</m>; the slope is positive, so <m>r = +\sqrt{0.984} = 0.992</m>, the correlation B05 reported as 0.99.`,
        String.raw`<m>s = \sqrt{239{,}979 \div 304} = 28.10</m> dollars, against a standard deviation of sales of $224.68.`,
        'Residuals by band of transactions: on average +$26.52 below 40, +$7.28 from 40 to 59, −$11.21 from 60 to 79, −$22.98 from 80 to 119 and +$32.92 at 120 or more. Five of those 11 days are festivals; the other six average −$27.00. Refitted without the festivals, the bands are +$6.12, −$0.08, −$5.46, +$1.36 and +$24.44: a gentle curve, upward at the top.',
        'Restricted to the 121 days with 50–70 transactions: R² = 0.859 and s = $13.51.',
      ],
      answer: 'SSR = 15,157,236; R² = 0.984; r = 0.992; s = $28.10. On the 50–70 days alone, R² = 0.859 with s = $13.51.',
      interpretation: 'The line accounts for 98.4% of the variation in daily sales and is typically about $28 off. The residuals show it is not quite the right shape: sales rise a little faster than in proportion to transactions. Narrowing the range lowers R² while the typical miss halves, which is the clearest demonstration that R² depends on how widely x varies, not only on how well the line fits.' },
    { level: 'applied', title: 'Ordering iced-drink cups from the forecast', fictional: true,
      setup: 'Ana orders iced-drink cups a week ahead from the forecast high. A supplier’s rep suggests the line iced share = −0.747 + 0.0176 × high, “R² = 0.88, so it’s 88% accurate.” Should Ana use it?',
      steps: [
        'Correct the claim: R² = 0.883 means the line accounts for 88% of the variation in the iced share around its mean. It is not a measure of accuracy. The typical miss is s = 0.096, almost 10 percentage points of the drinks.',
        'Plot the residuals against the high (the table in In depth): positive below 45 °F, negative from 45 to 64 °F, positive from 75 to 84 °F. The line is the wrong shape.',
        'Translate the pattern into cups: in the 55–64 °F band, typical of spring and autumn (128 café-days, about a fifth of the year), the line overstates the iced share by 0.095 on average, so it would over-order iced cups on exactly the days she has most of.',
        'Check the cold end: below 42.5 °F the line gives a negative share, an impossible order.',
        'Use something that follows the curve: the average iced share in each 5 °F band of the high from last year, or a curved model (the transformations-and-influence lesson fits one).',
      ],
      answer: 'No. The high R² hides a systematic pattern: the line over-orders iced cups in the 55–64 °F band by about 9.5 percentage points of drinks and gives impossible negative orders on cold days.',
      interpretation: 'R² summarises how much variation a line follows, not whether it follows the right shape. A one-minute residual plot turned an apparently excellent model into one Ana would not use for ordering. The banded averages would also need checking against the new year as it comes in.' },
  ],

  demo: [
    { widget: 'resid-fit', intro: 'Thirty September days at Harbourside, with the flat line at the mean drawn for comparison. The sum of squared residuals for the flat line is SST; for the least-squares line it is SSE. Move the line and watch the share 1 − SSE ÷ SST change; it is R² only at the least-squares line.' },
    { widget: 'resid-toolpak', intro: 'Excel’s regression output for all 306 Harbourside days. Find SST, SSR and SSE in the ANOVA table’s SS column, R Square and the Standard Error above it, and check that Regression SS ÷ Total SS gives R Square. Then switch the X variable to footfall and compare.' },
    { widget: 'resid-iced', intro: 'The iced-share line for both cafés. The residuals-against-fitted plot shows the wave: above zero for the lowest fitted values, below, then above again. (The tests and other plots in this panel are module 4’s; for now, look at the shape.)' },
    { widget: 'resid-range', intro: 'Fit Harbourside’s sales line to a narrower or wider range of transactions and watch R² and the residual standard error. Narrow the range and R² falls even though the line fits those days at least as closely.' },
  ],

  mistakes: [
    { title: '“R² = 0.88, so the model is 88% accurate.”', html: 'R² is the share of the variation of y around its mean that the line accounts for, not a hit rate or an error percentage. The iced-share line has R² = 0.883 and still misses by about 10 percentage points on a typical day. Report the residual standard error for accuracy in y’s units.' },
    { title: 'Trusting a high R² without a residual plot', html: 'A straight line through a curve can have a high R²: the iced-share line’s residuals run positive, negative, positive across temperatures, and it predicts negative shares below 42.5 °F. Plot the residuals before believing any line.' },
    { title: '“R² is low, so x doesn’t matter.”', html: 'Harbourside’s footfall on the high has R² = 0.190, yet its slope of 2.0 people per °F puts July about 61 people above March. A low R² says much of the variation comes from elsewhere (weekends, rain), not that the slope is negligible.' },
    { title: 'Comparing R² across different ranges of x', html: 'Restricting Harbourside’s days to 50–70 transactions drops R² from 0.984 to 0.859 while the typical miss halves. A study with a wider spread of x will show a higher R² for the same relationship.' },
    { title: 'Dividing SSE by n for the residual standard error', html: 'Two coefficients have been estimated, so the residuals have n − 2 degrees of freedom: s = √(SSE ÷ (n − 2)), which is what STEYX computes. Dividing by n understates the typical miss, badly in small samples.' },
    { title: 'Reading “explained” as “caused”', html: '“Transactions explain 98% of the variation in sales” is a statement about squared deviations. It says nothing about what causes sales, and the same R² would come from regressing transactions on sales.' },
  ],

  application: [
    { case: 'Ana’s review of the café models has one line per model. “Sales on transactions, Harbourside: R² = 0.984, typical miss $28 (STEYX), residuals bend gently upward at the top even without the festival days; fine for budgeting inside the usual range. Iced share on the forecast high: R² = 0.883, typical miss 10 points, but the residuals wave, so I order from last year’s averages by 5 °F band instead. Footfall on the high, Harbourside: R² = 0.19, typical miss 62 people; useless for any single day, useful for the season (once module 3 has separated the build-up).”' },
    { p: 'Each line gives three things: R² for the share of variation, s in the response’s units for the size of a typical miss, and a sentence about the residual plot. That combination is what lets a reader decide whether a model is good enough for a purpose. A budget can live with $28 a day; a barista roster for one particular Saturday can’t live with ±62 people, but a seasonal hiring plan can.' },
    { p: 'In other businesses the same habits apply. A retailer forecasting store revenue from floor area might find R² = 0.6 and a typical miss of $400,000 a year: the R² sounds respectable, the miss decides whether it can set targets with it. A battery-storage installer modelling installation hours on system size may see residuals fanning out for larger systems, a sign that a single s overstates precision on small jobs and understates it on big ones (module 4 deals with this). And a delivery firm comparing two cities’ models by R² should first check whether the cities’ routes cover the same range of distances.' },
    { p: 'Two cautions travel with every R² Ana reports. It is computed on the days used to fit the line, so it flatters how well the line will do on next year’s days. And it describes association: a high R² between baristas rostered and sales (B05 found they go together because the roster follows expected trade) would not mean that adding baristas raises sales.' },
  ],

  summary: [
    'A residual is e = y − ŷ, in y’s units; for least squares with an intercept the residuals add to zero and are uncorrelated with x.',
    'SST = SSR + SSE: the total variation of y around its mean splits into the part along the line and the residual part.',
    'R² = SSR ÷ SST = 1 − SSE ÷ SST is the share of the variation the line accounts for; with one explanatory variable it equals r². It is not accuracy and not causation.',
    'The residual standard error s = √(SSE ÷ (n − 2)) (STEYX) is the typical miss in y’s units. Report it with R².',
    'A residual plot shows whether a line is the right shape: the iced-share line has R² = 0.883 but its residuals wave and it predicts negative shares below 42.5 °F.',
    'A low R² can go with a slope that matters (footfall: R² = 0.19, 2.0 people per °F).',
    'R² depends on the range of x: Harbourside’s sales line on 50–70 transactions has R² = 0.859 against 0.984 for all days, with a smaller typical miss.',
  ],

  glossary: [
    { term: 'Total sum of squares', def: 'SST = Σ(y − ȳ)²: the variation of the response around its mean, before any explanatory variable is used. Excel’s DEVSQ.' },
    { term: 'Regression sum of squares', def: 'SSR = Σ(ŷ − ȳ)²: the part of the total sum of squares that the fitted values account for. With least squares and an intercept, SSR = SST − SSE.' },
    { term: 'Residual sum of squares', def: 'SSE = Σ(y − ŷ)²: the sum of the squared residuals, the quantity least squares makes as small as possible. Also called the error sum of squares.' },
    { term: 'Residual plot', def: 'A scatterplot of a model’s residuals against an explanatory variable, the fitted values or the order of the observations. Residuals with no pattern around zero suggest the model’s form fits; a curve, a funnel or a trend says it doesn’t.' },
  ],

  references: [
    { text: 'Illowsky, B. &amp; Dean, S. (2023). <i>Introductory Statistics 2e</i>, section 12.3, “The Regression Equation” (residuals, SSE and the coefficient of determination). OpenStax.', url: 'https://openstax.org/books/introductory-statistics/pages/12-3-the-regression-equation', checked: '2026-11-01' },
    { text: 'Penn State Eberly College of Science. STAT 501 <i>Regression Methods</i>, section 1.8, “R² Cautions”.', url: 'https://online.stat.psu.edu/stat501/book/export/html/893', checked: '2026-11-01' },
    { text: 'Microsoft Support. “STEYX function”.', url: 'https://support.microsoft.com/en-us/excel/functions/steyx-function', checked: '2026-11-01' },
  ],

  checks: [
    // the two days
    { what: '14 July transactions', value: JUL.t, shown: 81 },
    { what: '14 July sales', value: JUL.s, shown: 484.45 },
    { what: '14 July fitted', value: JUL.f, shown: 461.35 },
    { what: '14 July residual', value: JUL.e, shown: 23.10, tol: 0.006 },
    { what: '14 July residual (whole dollars)', value: JUL.e, shown: 23, tol: 0.5 },
    { what: '29 May transactions', value: FEST.t, shown: 293 },
    { what: '29 May sales', value: FEST.s, shown: 2108.92 },
    { what: '29 May fitted', value: FEST.f, shown: 1869.26 },
    { what: '29 May residual', value: FEST.e, shown: 239.66 },
    { what: '29 May residual (whole dollars)', value: FEST.e, shown: 240, tol: 0.5 },
    { what: 'Residuals add to zero', value: sum(L.resid), shown: 0, tol: 1e-6 },
    { what: 'Residuals uncorrelated with x', value: corr(tH, Array.from(L.resid)), shown: 0, tol: 1e-9 },
    // sums of squares
    { what: 'Mean sales', value: mean(sH), shown: 358.17 },
    { what: 'SST', value: SST, shown: 15397215, tol: 0.5 },
    { what: 'SSR', value: SSR, shown: 15157236, tol: 0.5 },
    { what: 'SSE', value: SSE, shown: 239979, tol: 0.5 },
    { what: 'SSR from fitted values', value: sum(Array.from(L.fitted).map((f) => (f - mean(sH)) ** 2)), shown: SSR, tol: 1e-3 },
    { what: 'R²', value: L.r2, shown: 0.984, tol: 0.0005 },
    { what: 'R² (%)', value: L.r2 * 100, shown: 98.4, tol: 0.05 },
    { what: 'R² = r²', value: rH ** 2, shown: L.r2, tol: 1e-12 },
    { what: 'r (4 dp)', value: rH, shown: 0.9922, tol: 0.00005 },
    { what: 'r (3 dp)', value: Math.sqrt(L.r2), shown: 0.992, tol: 0.0005 },
    { what: 'r (2 dp)', value: rH, shown: 0.99 },
    { what: 'R² = corr(y, ŷ)²', value: rYF ** 2, shown: L.r2, tol: 1e-12 },
    { what: 'n − 2', value: L.df, shown: 304 },
    { what: 's', value: L.sigma, shown: 28.10 },
    { what: 's from SSE', value: Math.sqrt(239979 / 304), shown: 28.10 },
    { what: 'SD of sales', value: sd(sH), shown: 224.68 },
    { what: 'Within 2s', value: within2, shown: 298 },
    { what: 'Within 2s (%)', value: within2 / 306 * 100, shown: 97, tol: 0.5 },
    { what: '2s about $56', value: 2 * L.sigma, shown: 56, tol: 0.5 },
    // sales residual bands
    { what: 'Band <40 mean residual', value: SB[0].e, shown: 26.52 },
    { what: 'Band 40–59 mean residual', value: SB[1].e, shown: 7.28 },
    { what: 'Band 60–79 mean residual', value: SB[2].e, shown: -11.21 },
    { what: 'Band 80–119 mean residual', value: SB[3].e, shown: -22.98 },
    { what: 'Band 120+ mean residual', value: SB[4].e, shown: 32.92 },
    { what: 'Band 120+ days', value: SB[4].n, shown: 11 },
    { what: 'Festival days among the 11 busiest', value: TOPF.length, shown: 5 },
    { what: 'Other six busiest days, mean residual', value: mean(TOPN.map((i) => L.resid[i])), shown: -27.00 },
    { what: 'Other six', value: TOPN.length, shown: 6 },
    { what: 'Other six below the line', value: Number(mean(TOPN.map((i) => L.resid[i])) < 0), shown: 1 },
    { what: 'No-festival band <40', value: SBN[0].e, shown: 6.12 },
    { what: 'No-festival band 40–59', value: SBN[1].e, shown: -0.08 },
    { what: 'No-festival band 60–79', value: SBN[2].e, shown: -5.46 },
    { what: 'No-festival band 80–119', value: SBN[3].e, shown: 1.36 },
    { what: 'No-festival band 120+', value: SBN[4].e, shown: 24.44 },
    { what: 'No-festival band 120+ (whole dollars)', value: SBN[4].e, shown: 24, tol: 0.5 },
    { what: 'No-festival top band has six days', value: SBN[4].n, shown: 6 },
    { what: 'Bend is real without festivals: top band well above zero (fails if no upward curve)', value: Number(SBN[4].e > 10 && SBN[4].e > SBN[2].e + 10), shown: 1 },
    { what: 'Full-fit sales residuals positive at both ends, negative in between', value: Number(SB[0].e > 0 && SB[4].e > 0 && SB[2].e < 0 && SB[3].e < 0), shown: 1 },
    // restricted range
    { what: 'Days with 50–70 transactions', value: RANGE.n, shown: 121 },
    { what: 'Restricted R²', value: RANGE.f.r2, shown: 0.859, tol: 0.0005 },
    { what: 'Restricted s', value: RANGE.f.sigma, shown: 13.51 },
    { what: 'Restricted s smaller than full s (the line fits at least as closely)', value: Number(RANGE.f.sigma < L.sigma), shown: 1 },
    { what: 'Typical miss roughly halves', value: RANGE.f.sigma / L.sigma, shown: 0.5, tol: 0.03 },
    // iced share
    { what: 'B05 r iced–high', value: corr(HI, IC), shown: 0.94 },
    { what: 'Café-days', value: IC.length, shown: 612 },
    { what: 'Iced intercept', value: IL.beta[0], shown: -0.747, tol: 0.0005 },
    { what: 'Iced slope', value: IL.beta[1], shown: 0.0176, tol: 0.00005 },
    { what: 'Iced R²', value: IL.r2, shown: 0.883, tol: 0.0005 },
    { what: 'Iced R² (2 dp)', value: IL.r2, shown: 0.88 },
    { what: 'Iced s', value: IL.sigma, shown: 0.096, tol: 0.0005 },
    { what: 'Iced s (points)', value: IL.sigma * 100, shown: 9.6, tol: 0.05 },
    { what: 'Iced s about 10 points', value: IL.sigma * 100, shown: 10, tol: 0.5 },
    { what: 'Iced line crosses zero', value: -IL.beta[0] / IL.beta[1], shown: 42.5, tol: 0.05 },
    { what: 'Café-days below 40 °F', value: COLD.length, shown: 32 },
    { what: 'Cold days fitted share', value: mean(COLD.map((i) => IL.fitted[i])), shown: -0.13, tol: 0.005 },
    { what: 'Cold days observed share', value: mean(COLD.map((i) => IC[i])), shown: 0.06, tol: 0.005 },
    { what: 'Some fitted shares negative', value: Number(negFit > 0), shown: 1 },
    { what: 'Wave: + below 45, − 45–64, + 75–84 (fails if the line were the right shape)', value: Number(IB[0].e > 0.05 && IB[1].e < 0 && IB[2].e < -0.05 && IB[4].e > 0.03), shown: 1 },
    { what: 'Near zero around 70', value: Math.abs(IB[3].e), shown: 0, tol: 0.01 },
    { what: 'Line below the curve on the coldest days (residual > 0, below 45)', value: Number(IB[0].e > 0), shown: 1 },
    { what: 'Line above the curve in the 50s and early 60s (45–54 and 55–64 residuals < 0)', value: Number(IB[1].e < 0 && IB[2].e < 0), shown: 1 },
    { what: 'Line below the curve in the late 70s and early 80s (75–84 residual > 0)', value: Number(IB[4].e > 0), shown: 1 },
    { what: '55–64 band days', value: IB[2].n, shown: 128 },
    { what: '55–64 band over-statement', value: -IB[2].e, shown: 0.095, tol: 0.0005 },
    { what: '55–64 band over-statement (points)', value: -IB[2].e * 100, shown: 9.5, tol: 0.05 },
    { what: '55–64 band about a fifth of the café-days', value: IB[2].n / 612, shown: 0.2, tol: 0.015 },
    { what: 'Planted logistic centre about 69 °F: share crosses its midpoint between 65 and 75', value: Number(mean(IC.filter((_, i) => HI[i] >= 65 && HI[i] < 75)) > 0.4 && mean(IC.filter((_, i) => HI[i] >= 65 && HI[i] < 75)) < 0.55), shown: 1 },
    // footfall on high and rain
    { what: 'Footfall R²', value: FT.r2, shown: 0.190, tol: 0.0005 },
    { what: 'Footfall R² (2 dp)', value: FT.r2, shown: 0.19 },
    { what: 'Footfall slope', value: FT.beta[1], shown: 2.0, tol: 0.05 },
    { what: 'March mean high', value: mhi(3), shown: 53.1, tol: 0.05 },
    { what: 'July mean high', value: mhi(7), shown: 83.5, tol: 0.05 },
    { what: 'July above March on the line', value: FT.beta[1] * (mhi(7) - mhi(3)), shown: 61, tol: 0.5 },
    { what: 'Footfall s', value: FT.sigma, shown: 62, tol: 0.5 },
    { what: 'High slope with the build-up held fixed', value: FTR.beta[1], shown: 1.79 },
    { what: 'High slope with build-up, weekend, rain, festival', value: FTA.beta[1], shown: 1.44 },
    { what: 'Build-up inflates the one-predictor slope', value: Number(FT.beta[1] > FTR.beta[1] && FTR.beta[1] > FTA.beta[1]), shown: 1 },
    { what: '61 people ≈ one barista hour at the peak (55% of transactions, ~14 per barista hour)', value: 61 * 0.47 * 0.55 / 14, shown: 1.1, tol: 0.15 },
    { what: 'Rain R²', value: RN.r2, shown: 0.052, tol: 0.0005 },
    { what: 'Rain slope', value: RN.beta[1], shown: -81, tol: 0.5 },
    // Otterburn
    { what: 'Laundry slope', value: ob1, shown: 1.6, tol: 1e-9 },
    { what: 'Laundry intercept', value: ob0, shown: 3.4, tol: 1e-9 },
    { what: 'Engine agrees (laundry)', value: OF.beta[1], shown: 1.6, tol: 1e-9 },
    { what: 'ȳ laundry', value: oym, shown: 13 },
    { what: 'Fitted at 2', value: ofit[0], shown: 6.6, tol: 1e-9 },
    { what: 'Residual 1', value: ores[0], shown: 0.4, tol: 1e-9 },
    { what: 'Residual 2', value: ores[1], shown: -0.8, tol: 1e-9 },
    { what: 'Fitted at 4', value: ofit[1], shown: 9.8, tol: 1e-9 },
    { what: 'Residual 3', value: ores[2], shown: 1.0, tol: 1e-9 },
    { what: 'Residual 4', value: ores[3], shown: -1.2, tol: 1e-9 },
    { what: 'Residual 5', value: ores[4], shown: 0.6, tol: 1e-9 },
    { what: 'Laundry SSE', value: oSSE, shown: 3.6, tol: 1e-9 },
    { what: 'Laundry SST', value: oSST, shown: 106, tol: 1e-9 },
    { what: 'Laundry SSR', value: oSSR, shown: 102.4, tol: 1e-9 },
    { what: 'Laundry R²', value: 1 - oSSE / oSST, shown: 0.966, tol: 0.0005 },
    { what: 'Laundry R² (%)', value: (1 - oSSE / oSST) * 100, shown: 96.6, tol: 0.05 },
    { what: 'Laundry s', value: Math.sqrt(oSSE / 3), shown: 1.10, tol: 0.005 },
    { what: 'Engine s (laundry)', value: OF.sigma, shown: Math.sqrt(3.6 / 3), tol: 1e-9 },
    { what: 'Figure: week with 10 hundred leaflets, ŷ − ȳ', value: ob0 + ob1 * 10 - oym, shown: 6.4, tol: 1e-9 },
    { what: 'Figure: its residual', value: 20 - (ob0 + ob1 * 10), shown: 0.6, tol: 1e-9 },
  ],
};
