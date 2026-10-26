// nonlinear-and-restricted.js — B05 · Curves, thresholds and restricted ranges. Content only; exercises are in
// nonlinear-and-restricted.ex.js. Uses the corrected café log (case.js): the iced-share S curve, the peak-wait
// threshold near a load of seven transactions per barista hour, summer-only days and Millbrook's weekdays. The Hollyford
// Hotel, the twelve towns and the reliability figures are fictional. Fitting curves and residual plots are B06's.
// Every figure printed is recomputed in `checks`.
import { column, DERIVED as D } from './case.js?v=20';
import * as C from '../../../core/correlation.js?v=20';
import { mean, sd } from '../../../core/stats.js?v=20';

// ---------------------------------------------------------------- the iced-drink curve
const T = column('high_f'), I = column('iced_share'), MON = column('date').map((d) => Number(d.slice(5, 7)));
const band = (xs, ys, lo, hi) => { const k = xs.map((_, i) => i).filter((i) => xs[i] >= lo && xs[i] < hi); return { n: k.length, m: mean(k.map((i) => ys[i])) }; };
const TB = [[20, 50], [50, 55], [55, 60], [60, 65], [65, 70], [70, 75], [75, 80], [80, 85], [85, 110]].map(([lo, hi]) => ({ lo, hi, ...band(T, I, lo, hi) }));
const pick = (a, keep) => a.filter((_, i) => keep[i]);
const SUM = MON.map((m) => m >= 6 && m <= 8), JUL = MON.map((m) => m === 7), OTH = SUM.map((s) => !s);
const rSummer = C.pearson(pick(T, SUM), pick(I, SUM)), rJuly = C.pearson(pick(T, JUL), pick(I, JUL)), rOther = C.pearson(pick(T, OTH), pick(I, OTH));
const kSummer = sd(T) / sd(pick(T, SUM));
const restrict = (rr, k) => k * rr / Math.sqrt(1 - rr * rr + k * k * rr * rr);

// ---------------------------------------------------------------- the waiting threshold
const L = column('peak_load'), W = column('peak_wait_min');
const LB = [[0, 7], [7, 8], [8, 9], [9, 10], [10, 99]].map(([lo, hi]) => ({ lo, hi, ...band(L, W, lo, hi) }));
const LOW = L.map((l) => l <= 7), HIGH = L.map((l) => l > 7);
const rLow = C.pearson(pick(L, LOW), pick(W, LOW)), rHigh = C.pearson(pick(L, HIGH), pick(W, HIGH));
const HINGE = L.map((l) => Math.max(0, l - 7) ** 2);
const rHinge = C.pearson(HINGE, W).r, rHingeLin = C.pearson(L.map((l) => Math.max(0, l - 7)), W).r;

// ---------------------------------------------------------------- Millbrook's weekdays
const M = { cafe: 'Millbrook' };
const mSt = column('peak_staff_hours', M), mSa = column('sales', M), mWk = column('weekday', M).map((d) => d !== 'Sat' && d !== 'Sun');
const rMAll = C.pearson(mSt, mSa).r, rMWk = C.pearson(pick(mSt, mWk), pick(mSa, mWk)).r;
const kM = sd(mSt) / sd(pick(mSt, mWk));

// ---------------------------------------------------------------- Hollyford Hotel (fictional): a U shape
const HX = [17, 17.5, 18, 18.5, 19, 19.5, 20, 20.5, 21, 21.5, 22];
const HY = [9.6, 7.1, 5.0, 3.6, 2.4, 2.0, 2.5, 3.4, 4.9, 7.0, 9.8];
const hR = C.pearson(HX, HY).r, hRho = C.spearman(HX, HY).rho;
const hSq = C.pearson(HX.map((x) => (x - 19.5) ** 2), HY).r, hAbs = C.pearson(HX.map((x) => Math.abs(x - 19.5)), HY).r;
const hLeft = C.pearson(HX.slice(0, 6), HY.slice(0, 6)).r, hRight = C.pearson(HX.slice(5), HY.slice(5)).r;

// ---------------------------------------------------------------- twelve fictional towns
const TP = [4.2, 6.8, 9.5, 12, 15, 21, 28, 37, 52, 80, 140, 310], TN = [5, 6, 8, 7, 9, 11, 12, 14, 15, 19, 24, 33];
const tR = C.pearson(TP, TN).r, tLog = C.pearson(TP.map(Math.log), TN.map(Math.log)).r, tRho = C.spearman(TP, TN).rho;

// ---------------------------------------------------------------- attenuation (fictional reliabilities)
const AT = { rTrue: 0.8, relX: 0.9, relY: 0.6 };
const rObs = AT.rTrue * Math.sqrt(AT.relX * AT.relY);

// ---------------------------------------------------------------- figure: a U and a threshold
const f1 = (x) => Math.round(x * 10) / 10;
function curvesFigure() {
  // drawn large in viewBox units so the text stays legible when the figure shrinks to a phone's width
  let svg = '<svg viewBox="0 0 660 380" xmlns="http://www.w3.org/2000/svg" font-size="20" fill="currentColor">';
  // left: the hotel
  const X1 = (v) => 75 + (v - 16.8) * 42, Y1 = (v) => 300 - v * 20;
  svg += '<line x1="62" x2="305" y1="300" y2="300" stroke="var(--ink-3)" stroke-width="1.2"/><line x1="62" x2="62" y1="80" y2="300" stroke="var(--ink-3)" stroke-width="1.2"/>';
  [0, 5, 10].forEach((v) => { svg += `<text x="55" y="${f1(Y1(v)) + 6}" text-anchor="end" font-size="18" fill="var(--ink-3)">${v}</text>`; });
  [17, 19, 21].forEach((v) => { svg += `<text x="${f1(X1(v))}" y="324" text-anchor="middle" font-size="18" fill="var(--ink-3)">${v}</text>`; });
  HX.forEach((x, i) => { svg += `<circle cx="${f1(X1(x))}" cy="${f1(Y1(HY[i]))}" r="5.5" fill="var(--series-1)"/>`; });
  svg += '<text x="185" y="356" text-anchor="middle" font-size="18" fill="var(--ink-3)">Thermostat (°C)</text>';
  svg += '<text x="185" y="30" text-anchor="middle">Hotel (fictional)</text><text x="185" y="56" text-anchor="middle">r = 0.00</text>';
  svg += '<text x="18" y="190" text-anchor="middle" font-size="18" fill="var(--ink-3)" transform="rotate(-90 18 190)">Complaints per 100</text>';
  // right: mean peak wait by load band
  const labels = ['<7', '7–8', '8–9', '9–10', '10+'];
  const X2 = (k) => 392 + k * 58, Y2 = (v) => 300 - v * 30;
  svg += '<line x1="355" x2="650" y1="300" y2="300" stroke="var(--ink-3)" stroke-width="1.2"/><line x1="355" x2="355" y1="80" y2="300" stroke="var(--ink-3)" stroke-width="1.2"/>';
  [0, 2, 4, 6].forEach((v) => { svg += `<text x="349" y="${f1(Y2(v)) + 6}" text-anchor="end" font-size="18" fill="var(--ink-3)">${v}</text>`; });
  LB.forEach((b, k) => {
    svg += `<rect x="${X2(k) - 20}" y="${f1(Y2(b.m))}" width="40" height="${f1(300 - Y2(b.m))}" fill="var(--series-2)" opacity="0.85"/>`;
    svg += `<text x="${X2(k)}" y="${f1(Y2(b.m)) - 7}" text-anchor="middle" font-size="18">${b.m.toFixed(1)}</text>`;
    svg += `<text x="${X2(k)}" y="324" text-anchor="middle" font-size="18" fill="var(--ink-3)">${labels[k].replace('<', '&lt;')}</text>`;
  });
  svg += '<text x="508" y="356" text-anchor="middle" font-size="18" fill="var(--ink-3)">Peak load</text>';
  svg += '<text x="508" y="30" text-anchor="middle">Lantern: mean peak</text><text x="508" y="56" text-anchor="middle">wait (minutes)</text>';
  return `${svg}</svg>`;
}

export default {
  slug: 'nonlinear-and-restricted',
  title: 'Curves, thresholds and restricted ranges',
  blurb: 'Pearson’s r measures how close points come to a straight line. Learn what it says, and fails to say, about curves, thresholds and U-shapes, why looking at only part of the range shrinks it, and why noisy measurements do too.',
  status: 'draft',
  objectives: [
    'Recognise from a scatterplot when a relationship is curved, has a threshold or is U-shaped, and explain what Pearson’s r then does and does not describe.',
    'Calculate correlations within ranges of x and with a transformed x (a log or a hinge at a threshold) to show how the strength of a link changes along its range.',
    'Explain why restricting the range of x, for example to summer days or to one café’s weekdays, usually shrinks r, and estimate the effect with the range-restriction formula.',
    'Estimate how unreliable measurements attenuate a correlation, and say what the correction for attenuation assumes.',
    'Choose between Pearson’s r, Spearman’s ρ and a plot with a written description for a curved relationship.',
  ],
  prerequisites: [
    { lesson: 'b05/scatterplots', why: 'Reading the form of a relationship (linear, curved, clustered) from a scatterplot.' },
    { lesson: 'b05/rank-correlation', why: 'Spearman’s ρ and the difference between a monotonic and a linear relationship.' },
    { lesson: 'b05/outliers-and-influence', why: 'How a few points can move r; this lesson looks at what the shape of the whole cloud does.' },
    { lesson: 'b02/skewed-data', why: 'Log transformations and why they need positive values.' },
  ],
  case: 'lantern',

  concept: [
    { case: 'Ana plans the iced-drink stock for next summer from the café log. Across the 612 café-days, the day’s high temperature and the share of drinks served iced have r = 0.940, about as strong as correlations in business data get. Her summer manager, looking only at June to August, finds r = 0.841, and only 0.657 for July. “Temperature hardly matters in high summer,” he says. Who is right?' },

    { h: 'r measures closeness to a line' },
    { p: 'Pearson’s r answers one precise question: how closely do the points cluster around a straight line? It does not measure how strongly y depends on x in general. When the relationship is a straight line with even scatter, the two ideas coincide. When it is curved, has a threshold, or rises and then falls, r can mislead in either direction: it can be high while hiding the shape, or close to zero while the link is strong.' },
    { p: 'The iced-drink share is a curve. On cold days it barely moves: 7.2% of drinks are iced on days below 50°F and 10.4% between 50 and 55°F. Between about 60 and 75°F it climbs fast, by 13 to 16 percentage points for every 5°F. Above 80°F it levels off again near 80%, because some customers want hot coffee whatever the weather. The shape is an S. Because the curve rises all the way, it is a monotonic relationship, and a straight line still fits it fairly well: r = 0.940, and Spearman’s ρ, which needs only a consistent direction, is a little higher at 0.957.' },
    { p: 'The number hides what matters for stock planning: the same 5°F rise changes the iced share by about 3 percentage points on the coldest days and by 13 to 16 on mild ones. A single r can’t say that. A scatterplot, or a table of the iced share by temperature band like the one in the In depth section, can.' },

    { h: 'Thresholds: when r understates the link' },
    { p: 'The morning peak tells a sharper story. Ana divides the number of peak transactions by the barista hours rostered for the peak, giving the peak load: the transactions each barista hour has to serve. Load and the average peak wait have r = 0.830. But the plot is not a cloud around a line. It is a <g>threshold effect</g>: flat at about 1.6 to 1.8 minutes for loads up to 7, then rising ever more steeply, to an average of 5.8 minutes when the load passes 10.' },
    { figure: {
      svg: curvesFigure(),
      caption: 'Left: a fictional hotel’s complaints about room temperature against its thermostat setting, a U shape with r = 0.00. Right: Lantern’s mean peak wait for each band of peak load: flat up to a load of 7, then rising steeply.',
      alt: 'Two panels. The left panel is a scatterplot of 11 points with the thermostat setting from 17 to 22 °C on the horizontal axis and complaints per 100 guests from 0 to 10 on the vertical axis. The points fall from 9.6 at 17 °C to a minimum of 2.0 at 19.5 °C, then rise again to 9.8 at 22 °C, a symmetrical U; the title gives r = 0.00. The right panel is a bar chart of the mean peak wait in minutes for five bands of peak transactions per barista hour: under 7, 1.6 minutes; 7 to 8, 1.7; 8 to 9, 2.2; 9 to 10, 3.1; 10 or more, 5.8.',
    } },
    { p: 'Here r understates the link. On the 169 café-days with a load of 7 or less, load and wait are unrelated (r = −0.10); on the 443 days above 7, r = 0.93. Measured against the shape the data actually follow, the squared distance above 7, the correlation is 0.980. The relationship is close to a law: keep the load under about seven transactions per barista hour and waits stay short. An r of 0.83, read as “strong but loose”, would miss that.' },

    { h: 'U-shapes: when r says nothing' },
    { p: 'A relationship that rises and then falls, or falls and then rises, can have r close to zero however strong it is. The hotel in the figure gets complaints when rooms are too cold and when they are too warm. Across its eleven settings r = 0.00, yet complaints are almost perfectly predictable from the distance between the setting and 19.5°C. A correlation of zero means no straight-line relationship, not no relationship.' },
    { callout: 'key', title: 'Describe the shape, then choose the number', html: 'Before reporting r, look at the scatterplot and say what shape the points make. If it is a line, r summarises it. If it is a monotonic curve, report Spearman’s ρ beside r and describe the curve. If it has a threshold or a turning point, describe it in words and numbers (where it turns, how steep it is on each side), because no single coefficient will.' },

    { h: 'Looking at part of the range' },
    { p: 'Back to the summer manager. Restricting the data to June to August cuts out the cold days, so temperatures run only from 67 to 94°F, with a standard deviation of 6.4°F instead of 15.0°F. With less variation in x, the same scatter around the curve is a larger share of what is left, and r shrinks: from 0.940 for the year to 0.841 for summer and 0.657 for July. July also sits on the flat top of the S, where warmer days add little. Temperature still matters in July, just less than in May, and over a narrower range. Both of them are describing the data correctly; they are describing different data.' },
  ],

  theory: [
    { h: 'Reading the curve in bands' },
    { p: 'A quick way to see a curve’s shape without fitting anything is to group x into bands and average y within each band. The table does this for the iced share; with 612 café-days every band has at least 50 days, so each average is reasonably stable.' },
    { table: {
      caption: 'Share of drinks served iced by the day’s high, both cafés, March–December 2027',
      head: ['High (°F)', 'Café-days', 'Mean iced share'],
      align: ['l', 'r', 'r'],
      rows: TB.map((b) => [b.lo === 20 ? 'below 50' : b.hi === 110 ? '85 and above' : `${b.lo}–${b.hi - 1}`, String(b.n), `${(b.m * 100).toFixed(1)}%`]),
    } },
    { p: 'Read down the last column: small steps at the top of the table, large steps in the middle, small steps again at the bottom. A straight line through these averages would overstate the rise on cold days and on hot days and understate it in between. The departures from a fitted line, its <g>residuals</g>, would show the same pattern; B06 plots residuals properly.' },

    { h: 'Strength along the range: the threshold' },
    { table: {
      caption: 'Peak wait by peak load (transactions per barista hour), both cafés',
      head: ['Load', 'Café-days', 'Mean peak wait (min)'],
      align: ['l', 'r', 'r'],
      rows: LB.map((b) => [b.lo === 0 ? 'under 7' : b.hi === 99 ? '10 or more' : `${b.lo}–${b.hi}`, String(b.n), b.m.toFixed(2)]),
    } },
    { p: String.raw`Correlations within ranges confirm what the bands show: r = −0.10 for loads of 7 or less and 0.93 above 7. A <g>hinge transformation</g> makes the shape explicit: <m>h = \max(0, x - c)</m> is zero below the threshold c and rises one for one above it. With c = 7, the hinge has r = 0.917 with the wait; squaring it, to allow for the wait rising ever faster, gives 0.980. That 0.98 is closer to the truth about this link than 0.83.` },
    { p: 'Two cautions. First, the threshold of 7 came from looking at these data, so a correlation with a hinge chosen to fit them flatters the fit; it describes this year’s log well and should be checked on new data. Second, Spearman’s ρ is 0.867 here, a little above r, because ρ rewards any steady rise, but it is no better at describing a flat stretch followed by a steep one. For a threshold, report where it is and how the slope changes, not only a coefficient.' },
    { callout: 'note', title: 'The case states the cause here', html: 'In this fictional log, waits are built to depend on the load, so describing the threshold as the load lengthening waits is a planted fact, not something the correlation shows. In real data, a threshold in a scatterplot is a description; the correlation-and-causation lesson discusses what it would take to show the load causes the waits.' },

    { h: 'U-shapes and turning points' },
    { p: 'For a symmetrical U, the positive products of z-scores on one side cancel the negative ones on the other, so r comes out near zero. In the hotel’s data, r is −0.97 on the cold side (settings up to 19.5°C) and +0.96 on the warm side; together, 0.00. Spearman’s ρ, which needs a consistent direction, fails too (−0.03). The fix is to measure against the shape: complaints have r = 0.97 with the distance from 19.5°C and 0.999 with its square. As with the threshold, the turning point was read from the data, so state it as a finding to confirm.' },

    { h: 'Transformations in outline' },
    { p: 'Some curves straighten under a transformation. A <g>log transformation</g> turns equal ratios into equal differences, which suits relationships in which y grows by a percentage when x grows by a percentage. In twelve fictional towns, the number of cafés rises with population but more and more slowly: r = 0.950 on the raw values, 0.994 on the logs of both. Logs need positive values, so they can’t be used directly on Lantern’s rainfall, which is zero on most days.' },
    { p: 'Spearman’s ρ is 0.993 for the towns, on raw values or logs alike, because a log keeps every value in the same order. That is a useful property: a rank correlation doesn’t depend on which monotonic transformation you choose, while Pearson’s r does. Fitting a curve after a transformation, and interpreting its slope, belongs to B06.' },

    { h: 'Restricted range' },
    { p: String.raw`<g>Range restriction</g> means the data cover only part of the values the variable takes. If the relationship is a straight line with even scatter, and the restriction is on x alone, then shrinking the standard deviation of x from S to s changes r in a predictable way. With <m>k = S \div s</m>, the correlation over the full range would be <m>r_u = k r_r \div \sqrt{1 - r_r^2 + k^2 r_r^2}</m>, where <m>r_r</m> is the correlation in the restricted data. The formula card gives the details.` },
    { p: 'For the summer days, k = 15.0 ÷ 6.4 ≈ 2.3 and the formula turns the summer r of 0.841 into 0.964, against 0.940 actually observed. It overshoots because the relationship is an S, not a line, and the scatter is not even. The formula is a guide to how much restriction matters, not a way to recover the “true” r.' },
    { p: 'Range restriction is everywhere in business data. Customers who were approved for credit, staff who were hired, products that stayed on the menu, stores that survived: each is a selected group with a narrower range than the population it came from, and correlations inside it are usually weaker than across everyone. The weaker correlation is accurate for the group; it is wrong only if read as a statement about the whole population.' },
    { p: 'Restriction does not always weaken r. If you select the part of a curve where it is steepest, r can rise: for loads above 7, r = 0.93, more than 0.83 for all days. And restricting to the steep part of a curve shrinks r far less than restricting to a flat part: days between 60 and 74°F still give 0.906 for the iced share, against 0.657 for July. The general rule is that r depends on the range you look at, so always say what range it describes.' },

    { h: 'Unreliable measurements attenuate r' },
    { p: String.raw`Every measurement has some error. The door counter misses people in a crowd; a manager timing the queue with a stopwatch on five customers gets a noisy average. Random error adds scatter that has nothing to do with the relationship, so the observed correlation is weaker than the correlation between the true values. Spearman (1904) called this <g>attenuation</g> and gave a correction: if the reliability of each measure is known (the share of its variance that is true variation, often estimated by measuring the same thing twice and correlating the two sets of results), then <m>r_{\text{obs}} \approx r_{\text{true}}\sqrt{\text{rel}_x \, \text{rel}_y}</m>.` },
    { p: 'For example, with fictional figures: if the true correlation is 0.80, the load is measured with reliability 0.90 and the stopwatch waits with reliability 0.60, the observed r would be about 0.80 × √(0.90 × 0.60) = 0.59. Dividing an observed r by √(rel_x × rel_y) estimates the true one, but only as well as the reliabilities are known, and it can produce values above 1 when they are underestimated or when sampling error in r is large. Use the correction to judge whether a weak correlation might come from noisy measurement; better still, measure more reliably.' },
  ],

  formulas: [
    { id: 'nl-hinge', name: 'Hinge at a threshold',
      tex: String.raw`h = \max(0,\; x - c)`,
      where: [[String.raw`h`, 'The hinge: zero below the threshold, the distance above it', 'units of x'], [String.raw`x`, 'The original variable (here the peak load)', 'transactions per barista hour'], [String.raw`c`, 'The threshold, read from the plot or set in advance', 'units of x']],
      assumptions: 'y is roughly flat below c and changes with x above it. A threshold chosen from the same data flatters the fit.',
      note: 'Excel: <x>=MAX(0,A2-7)</x>, filled down. Squaring h, <x>=MAX(0,A2-7)^2</x>, allows y to rise ever faster above c.' },
    { id: 'nl-range', name: 'Correlation over the full range from a restricted one',
      tex: String.raw`r_u = \dfrac{k\, r_r}{\sqrt{1 - r_r^2 + k^2 r_r^2}}, \qquad k = \dfrac{S}{s}`,
      where: [[String.raw`r_u`, 'Estimated correlation over the full range', ''], [String.raw`r_r`, 'Correlation in the restricted data', ''], [String.raw`S`, 'Standard deviation of x over the full range', 'units of x'], [String.raw`s`, 'Standard deviation of x in the restricted data', 'units of x'], [String.raw`k`, 'How many times wider the full range is', '']],
      assumptions: 'A straight-line relationship with even scatter, and selection on x alone.',
      note: 'With k = s ÷ S (below 1) the same formula goes from the full range to a restricted one, and shows that restricting x shrinks r. With a curve or uneven scatter it is only a rough guide.' },
    { id: 'nl-atten', name: 'Attenuation by unreliable measurement',
      tex: String.raw`r_{\text{obs}} \approx r_{\text{true}}\sqrt{\text{rel}_x\,\text{rel}_y}, \qquad r_{\text{true}} \approx \dfrac{r_{\text{obs}}}{\sqrt{\text{rel}_x\,\text{rel}_y}}`,
      where: [[String.raw`r_{\text{obs}}`, 'Correlation between the measured values', ''], [String.raw`r_{\text{true}}`, 'Correlation between the true values', ''], [String.raw`\text{rel}_x, \text{rel}_y`, 'Reliability of each measure: the share of its variance that is true variation, for example a test–retest correlation', '']],
      assumptions: 'Random, independent measurement errors; reliabilities known.',
      note: 'Spearman’s (1904) correction for attenuation. A corrected value above 1 suggests the reliabilities are underestimated (or that sampling error in r is large).' },
  ],

  examples: [
    { level: 'simple', title: 'A U-shape: room temperature and complaints', fictional: true,
      setup: 'The Hollyford Hotel changed its rooms’ default thermostat setting each week for eleven weeks, from 17°C to 22°C in steps of 0.5°C, and counted complaints about room temperature per 100 guests: 9.6, 7.1, 5.0, 3.6, 2.4, 2.0, 2.5, 3.4, 4.9, 7.0 and 9.8. The general manager runs CORREL, gets 0.00, and concludes that the setting doesn’t matter. Is she right?',
      steps: [
        'Plot first: complaints fall from 9.6 to a minimum of 2.0 at 19.5°C and rise again to 9.8 at 22°C, a symmetrical U.',
        'Explain r: on the cold side (17 to 19.5°C) r = −0.97; on the warm side (19.5 to 22°C) r = 0.96. Over the whole range the two cancel, so r = 0.00, and Spearman’s ρ (−0.03) fails for the same reason.',
        'Measure against the shape: the distance from 19.5°C has r = 0.97 with complaints, and its square 0.999. The setting explains almost all of the variation in complaints, through its distance from 19.5°C.',
      ],
      answer: 'No. r = 0.00 because the relationship is a U, not because there is none: complaints are lowest at 19.5°C and rise steeply on either side.',
      interpretation: 'The hotel should set rooms near 19.5°C. The manager’s mistake was to read r = 0 as “no relationship” when it means “no straight-line relationship”. Eleven weeks is a small sample and the turning point was read from the data, so the hotel should confirm it over the next season.' },
    { level: 'challenging', title: 'Where waiting starts: the peak-load threshold', fictional: true,
      setup: 'Across the 612 café-days, the peak load (peak transactions per barista hour) and the average peak wait have r = 0.830. Ana wants to know whether to read this as a strong but loose link, and what it means for the roster.',
      steps: [
        'Band the loads: the mean wait is between about 1.6 and 1.8 minutes in every band up to a load of 7, then 1.73 minutes for 7–8, 2.17 for 8–9, 3.06 for 9–10 and 5.85 for 10 or more. Flat, then steep: a threshold.',
        'Correlate within ranges: up to a load of 7 (169 café-days) r = −0.10; above 7 (443 café-days) r = 0.93. Below the threshold the load doesn’t go with the wait at all; above it, closely.',
        String.raw`Measure against the shape: with the hinge <m>h = \max(0, \text{load} - 7)</m>, r = 0.917; with <m>h^2</m>, r = 0.980. Spearman’s ρ for load and wait is 0.867.`,
        'Read it with care: the threshold of 7 was read from these data, so 0.98 flatters the fit a little. The bands and the within-range correlations do not depend on fitting anything and tell the same story.',
      ],
      answer: 'Not loose: waits barely change up to a load of about 7 and rise steeply after it (r = 0.93 above 7; r = 0.980 with the squared hinge). r = 0.830 understates the link because it measures closeness to a straight line.',
      interpretation: 'For the roster this points to a rule rather than a slope: roster enough barista hours to keep the expected load at or below about 7, because beyond it every extra transaction per barista hour costs more waiting than the last. In this fictional log waits are built to depend on the load, so the rule rests on the case’s planted cause; in real data Ana would test it by rostering differently and watching the waits.' },
    { level: 'applied', title: 'Weekday rosters at Millbrook', fictional: true,
      setup: 'Millbrook’s manager reviews her weekday rosters. On weekdays the barista hours rostered for the peak and the day’s sales have r = 0.52, and she worries that her rosters barely follow the business. Across all of Millbrook’s days r = 0.88. What explains the difference, and should she change how she rosters?',
      steps: [
        'Compare the ranges: across all days the peak roster runs from 3.5 to 10 hours (SD 1.78 hours) because weekends are quiet; on weekdays it runs from 6 to 10 hours (SD 0.82). The weekday data cover a much narrower range of x.',
        'Apply the range-restriction formula as a guide: k = 1.78 ÷ 0.82 ≈ 2.2, and with r = 0.52 on weekdays the formula gives about 0.80 over the full range, close to the 0.88 observed. Most of the gap comes from the narrower range.',
        'Check what is left: weekday sales vary less too (SD $100 against $167), and day-to-day noise in sales is a bigger share of what is left. A weekday r of 0.52 says that, among similar weekdays, the roster tracks sales only loosely, which is expected when the roster is set in advance from the business the manager expects.',
      ],
      answer: 'Mostly range restriction: weekdays use only part of the roster’s range, so r falls from 0.88 to 0.52 even if rostering works the same way on every day.',
      interpretation: 'The weekday figure is accurate for weekdays and says nothing bad about rostering in general. If the manager wants rosters to follow weekday sales more closely, the question is about forecasting weekday demand, not about the correlation. Whether more staff lead to more sales is a causal question for the correlation-and-causation lesson: here the roster is set to expected business.' },
  ],

  demo: [
    { widget: 'nl-iced', intro: 'Temperature against the share of drinks served iced, all 612 café-days. Turn on the least-squares line and look where the points sit above and below it: below at both ends, above in the middle. Then colour by season to see each group’s own r: June–August has the narrower range of temperatures.' },
    { widget: 'nl-wait', intro: 'Peak load against the average peak wait. Turn on the line: it runs above the flat stretch below a load of 7 and below the steep stretch above 10. Plot the ranks to see why Spearman’s ρ is only a little higher than r.' },
    { widget: 'nl-hotel', intro: 'The fictional hotel’s U. Turn on the least-squares line: it is flat, which is what r = 0.00 says. Plot the ranks: ρ fails too.' },
    { widget: 'nl-towns', intro: 'Twelve fictional towns. Take logs of x and of y and watch r rise from 0.950 to 0.994 while Spearman’s ρ stays at 0.993.' },
    { widget: 'nl-atten', intro: 'Choose a true correlation and the reliability of each measure. The observed correlation is the true one times √(rel_x × rel_y). How reliable must a stopwatch wait be before an observed r of 0.5 is believable as a true r of 0.8?' },
  ],

  mistakes: [
    { title: '“r = 0, so the two variables are unrelated.”', html: 'r = 0 means no straight-line relationship. A U-shape (complaints against the thermostat setting) or a pattern that rises then falls can have r near 0 and a near-perfect link. Plot the data before concluding anything.' },
    { title: '“r = 0.94, so the relationship is a straight line.”', html: 'A monotonic curve can give a high r: the iced share is an S, flat at both ends, with r = 0.94. A high r says the points are near some line, not that a line describes them well. Look at the plot or at averages by band.' },
    { title: '“r = 0.83 for load and waits: a strong but loose link.”', html: 'When the relationship has a threshold, r averages a flat stretch and a steep one. Here waits are unrelated to load below 7 and closely related above it (r = 0.93). Describe the threshold; a single r understates the link.' },
    { title: '“Temperature matters less in summer, because r is lower in summer.”', html: 'Summer days cover a narrower range of temperatures (SD 6.4°F against 15.0°F), and a narrower range shrinks r even when the relationship is unchanged. Compare slopes or band averages, not correlations from different ranges.' },
    { title: '“A weak correlation means a weak relationship.”', html: 'Measurement error attenuates r: with reliabilities of 0.9 and 0.6, a true correlation of 0.80 shows up as about 0.59. Before dismissing a link, ask how reliably each variable was measured.' },
  ],

  application: [
    { case: 'Ana’s note for the summer stock plan: “Iced share rises with temperature in an S: about 3 points per 5°F on the coldest days, 13 to 16 points per 5°F between 60 and 75°F, and levelling off near 80% above 80°F (2027 log, both cafés). In July the share averages about 75%, so July orders should follow footfall more than temperature. The lower correlation in summer (0.84, against 0.94 for the year) reflects the narrower range of summer temperatures, not a weaker link.”' },
    { p: 'Her note follows the habits of analysts who deal well with curves. She describes the shape in the units of the decision (percentage points per 5°F) instead of reporting a single coefficient, says over what range each statement holds, and explains a lower correlation before anyone can misread it. The same habits apply wherever relationships bend: price and demand near a competitor’s price, workload and errors near capacity, discounts and orders near a threshold for free delivery.' },
    { p: 'Thresholds deserve special attention in operations because they are where decisions bite. A service desk, a call centre or a café counter works well until utilisation passes a point, beyond which queues tend to lengthen quickly. A correlation across all days blends the calm days and the overloaded ones; a table of averages by band, or correlations within ranges, shows where the threshold is, and that is what a manager needs in order to plan capacity.' },
    { p: 'When comparing correlations across teams, sites or periods, check the ranges first. A branch with very similar days will show weaker correlations than one with very varied days, even if the two behave the same way. Report the range each correlation covers, and prefer comparisons of band averages or slopes, which B06 develops.' },
  ],

  summary: [
    'Pearson’s r measures how closely points cluster around a straight line, not how strongly y depends on x in general.',
    'A monotonic curve can give a high r (the iced-share S: r = 0.940, ρ = 0.957) while hiding where the relationship is steep and where it is flat; averages by band show the shape.',
    'A threshold makes r understate a link: peak waits are unrelated to load up to about 7 (r = −0.10) and closely related above it (r = 0.93); a squared hinge at 7 gives r = 0.980 against 0.830.',
    'A U-shape can give r ≈ 0 with a near-perfect link; measure against the shape (distance from the turning point) and say the turning point was read from the data.',
    'Logs straighten multiplicative curves (r = 0.950 to 0.994 for the fictional towns); Spearman’s ρ doesn’t change under any monotonic transformation.',
    'Restricting the range of x usually shrinks r (summer 0.841, July 0.657, against 0.940 for the year; Millbrook’s weekdays 0.52 against 0.88); always say what range a correlation describes.',
    'Unreliable measurements attenuate r: r_obs ≈ r_true × √(rel_x × rel_y). The correction for attenuation is only as good as the reliabilities.',
  ],

  glossary: [
    { term: 'Threshold effect', def: 'A relationship in which y barely changes with x up to a certain value of x and changes markedly beyond it.' },
    { term: 'Hinge transformation', def: 'Replacing x with max(0, x − c), which is zero up to a threshold c and rises one for one above it, so that a correlation or a fitted line can follow a relationship that starts at the threshold.' },
    { term: 'Range restriction', def: 'Analysing only part of the range a variable can take, such as summer days or hired applicants. It usually shrinks a correlation, though it can raise one when the part selected is where a curve is steepest.' },
    { term: 'Attenuation', def: 'The weakening of an observed correlation by random measurement error in either variable; Spearman’s correction divides the observed r by the square root of the product of the two reliabilities.' },
  ],

  references: [
    { text: 'Holmes, A., Illowsky, B. &amp; Dean, S. (2023). <i>Introductory Business Statistics 2e</i>, section 13.1, “The Correlation Coefficient r”. OpenStax.', url: 'https://openstax.org/books/introductory-business-statistics-2e/pages/13-1-the-correlation-coefficient-r', checked: '2026-10-26' },
    { text: 'NIST/SEMATECH. <i>e-Handbook of Statistical Methods</i>, section 1.3.3.26, “Scatter Plot” (sample plots of quadratic, exponential and other non-linear relationships).', url: 'https://www.itl.nist.gov/div898/handbook/eda/section3/eda33q.htm', checked: '2026-10-26' },
    { text: 'Spearman, C. (1904). “The proof and measurement of association between two things”. <i>American Journal of Psychology</i>, 15, 72–101. Reprinted in <i>International Journal of Epidemiology</i> (2010), 39(5), 1137–1150.', url: 'https://doi.org/10.1093/ije/dyq191', checked: '2026-10-26' },
  ],

  checks: [
    // iced share
    { what: 'Café-days', value: T.length, shown: 612 },
    { what: 'r temp–iced', value: D.tempIced.r, shown: 0.940, tol: 0.0005 },
    { what: 'ρ temp–iced', value: D.tempIcedRho.rho, shown: 0.957, tol: 0.0005 },
    { what: 'Summer r', value: rSummer.r, shown: 0.841, tol: 0.0005 },
    { what: 'Summer r (2 dp)', value: rSummer.r, shown: 0.84 },
    { what: 'Summer café-days', value: rSummer.n, shown: 184 },
    { what: 'July r', value: rJuly.r, shown: 0.657, tol: 0.0005 },
    { what: 'Other months r (widget)', value: rOther.r, shown: 0.883, tol: 0.0005 },
    { what: 'Below 50 iced share', value: TB[0].m * 100, shown: 7.2, tol: 0.05 },
    { what: 'Below 50 days', value: TB[0].n, shown: 124 },
    { what: '50–55 iced share', value: TB[1].m * 100, shown: 10.4, tol: 0.05 },
    { what: 'Every band has at least 50 days', value: Math.min(...TB.map((b) => b.n)), shown: 52 },
    { what: 'Steepest steps: 60–64 to 65–69 (about 16)', value: (TB[4].m - TB[3].m) * 100, shown: 16, tol: 0.5 },
    { what: 'Steepest steps: 65–69 to 70–74 (about 13)', value: (TB[5].m - TB[4].m) * 100, shown: 13, tol: 0.6 },
    { what: 'Cold-day rise about 3 points per 5°F (50–55 to 55–60 and below)', value: (TB[1].m - TB[0].m) * 100, shown: 3, tol: 0.5 },
    { what: 'Top band near 80%', value: TB[8].m * 100, shown: 79.5, tol: 0.05 },
    { what: 'Above 80°F about 80% (80–84 band)', value: TB[7].m * 100, shown: 76.0, tol: 0.05 },
    { what: 'Summer temperatures from 67', value: Math.min(...pick(T, SUM)), shown: 67 },
    { what: 'Summer temperatures to 94', value: Math.max(...pick(T, SUM)), shown: 94 },
    { what: 'Summer SD', value: sd(pick(T, SUM)), shown: 6.4, tol: 0.05 },
    { what: 'Year SD', value: D.sdHigh, shown: 15.0, tol: 0.05 },
    { what: 'k summer', value: kSummer, shown: 2.3, tol: 0.05 },
    { what: 'Range formula on summer', value: restrict(rSummer.r, kSummer), shown: 0.964, tol: 0.0005 },
    { what: 'July iced share averages about 75%', value: mean(pick(I, JUL)) * 100, shown: 75, tol: 0.5 },
    { what: 'r for 60–74°F', value: C.pearson(T.filter((t) => t >= 60 && t < 75), I.filter((_, i) => T[i] >= 60 && T[i] < 75)).r, shown: 0.906, tol: 0.0005 },
    // waits
    { what: 'r load–wait', value: D.loadWait.r, shown: 0.830, tol: 0.0005 },
    { what: 'r load–wait (2 dp)', value: D.loadWait.r, shown: 0.83 },
    { what: 'ρ load–wait', value: D.loadWaitRho.rho, shown: 0.867, tol: 0.0005 },
    { what: 'Low-load mean wait about 1.6', value: LB[0].m, shown: 1.6, tol: 0.05 },
    { what: 'Bands below 7: highest mean about 1.8', value: Math.max(...[[0, 4], [4, 5], [5, 6], [6, 7]].map(([a, b]) => band(L, W, a, b).m)), shown: 1.8, tol: 0.05 },
    { what: 'Bands below 7: lowest mean about 1.6', value: Math.min(...[[0, 4], [4, 5], [5, 6], [6, 7]].map(([a, b]) => band(L, W, a, b).m)), shown: 1.6, tol: 0.05 },
    { what: '7–8 band within 1.6–1.8 too', value: LB[1].m, shown: 1.7, tol: 0.1 },
    { what: 'Coldest-days step (below 50 to 50–54)', value: (TB[1].m - TB[0].m) * 100, shown: 3, tol: 0.5 },
    { what: '7–8 mean', value: LB[1].m, shown: 1.73, tol: 0.005 },
    { what: '8–9 mean', value: LB[2].m, shown: 2.17, tol: 0.005 },
    { what: '9–10 mean', value: LB[3].m, shown: 3.06, tol: 0.005 },
    { what: '10+ mean', value: LB[4].m, shown: 5.85, tol: 0.005 },
    { what: '10+ mean (1 dp)', value: LB[4].m, shown: 5.8, tol: 0.06 },
    { what: 'Days load ≤ 7', value: rLow.n, shown: 169 },
    { what: 'Days load > 7', value: rHigh.n, shown: 443 },
    { what: 'r load ≤ 7', value: rLow.r, shown: -0.10, tol: 0.005 },
    { what: 'r load > 7', value: rHigh.r, shown: 0.93, tol: 0.005 },
    { what: 'Hinge r', value: rHingeLin, shown: 0.917, tol: 0.0005 },
    { what: 'Squared hinge r', value: rHinge, shown: 0.980, tol: 0.0005 },
    // hotel
    { what: 'Hotel r', value: hR, shown: 0.00, tol: 0.005 },
    { what: 'Hotel ρ', value: hRho, shown: -0.03, tol: 0.005 },
    { what: 'Hotel left r', value: hLeft, shown: -0.97, tol: 0.005 },
    { what: 'Hotel right r', value: hRight, shown: 0.96, tol: 0.005 },
    { what: 'Hotel abs distance r', value: hAbs, shown: 0.97, tol: 0.005 },
    { what: 'Hotel squared r', value: hSq, shown: 0.999, tol: 0.0005 },
    { what: 'Hotel minimum', value: Math.min(...HY), shown: 2.0 },
    { what: 'Hotel minimum at 19.5', value: HX[HY.indexOf(Math.min(...HY))], shown: 19.5 },
    { what: 'Hotel weeks', value: HX.length, shown: 11 },
    // towns
    { what: 'Towns raw r', value: tR, shown: 0.950, tol: 0.0005 },
    { what: 'Towns log r', value: tLog, shown: 0.994, tol: 0.0005 },
    { what: 'Towns ρ', value: tRho, shown: 0.993, tol: 0.0005 },
    { what: 'Towns: log10 gives the same r as ln', value: C.pearson(TP.map(Math.log10), TN.map(Math.log10)).r, shown: tLog, tol: 1e-9 },
    // Millbrook weekdays
    { what: 'Millbrook all r', value: rMAll, shown: 0.88, tol: 0.005 },
    { what: 'Millbrook weekday r', value: rMWk, shown: 0.52, tol: 0.005 },
    { what: 'Millbrook all SD staff', value: sd(mSt), shown: 1.78, tol: 0.005 },
    { what: 'Millbrook weekday SD staff', value: sd(pick(mSt, mWk)), shown: 0.82, tol: 0.005 },
    { what: 'k Millbrook', value: kM, shown: 2.2, tol: 0.05 },
    { what: 'Formula gives about 0.80', value: restrict(rMWk, kM), shown: 0.80, tol: 0.005 },
    { what: 'Staff range all low', value: Math.min(...mSt), shown: 3.5 },
    { what: 'Staff range high', value: Math.max(...mSt), shown: 10 },
    { what: 'Weekday staff low', value: Math.min(...pick(mSt, mWk)), shown: 6 },
    { what: 'Weekday staff high', value: Math.max(...pick(mSt, mWk)), shown: 10 },
    { what: 'Weekday sales SD', value: sd(pick(mSa, mWk)), shown: 100, tol: 0.5 },
    { what: 'All sales SD', value: sd(mSa), shown: 167, tol: 0.5 },
    // attenuation
    { what: 'Observed r with reliabilities 0.9 and 0.6', value: rObs, shown: 0.59, tol: 0.005 },
  ],
};
