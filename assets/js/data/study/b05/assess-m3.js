// assess-m3.js — B05 module 3 test: When correlations mislead (outliers-and-influence, nonlinear-and-restricted,
// groups-and-simpsons-paradox). New questions, not copies of lesson exercises. No hints; solutions are shown when the
// student reviews the test. Café data come from case.js; Pinecrest Clinics, Northway Couriers, Marlow Insurance, the
// city survey and the other small datasets are fictional. Formula items are marked by their results (core/sheet.js
// gradeFormula); every num item's `check` recomputes its answer.
import { CLEAN_ROWS, CAFE_COLUMNS } from './case.js?v=20';
import * as C from '../../../core/correlation.js?v=20';

const at = (name) => CAFE_COLUMNS.indexOf(name);
const fx = (v, d = 3) => (v < 0 ? '−' : '') + Math.abs(v).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
const col = (letter, from, values) => Object.fromEntries(values.map((v, i) => [`${letter}${from + i}`, v]));
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const dayLabel = (iso) => `${Number(iso.slice(8, 10))} ${MONTHS[Number(iso.slice(5, 7)) - 1]}`;

// Harbourside, 18 April – 1 May: footfall and the peak wait (1 May: a short roster, a 9.2-minute wait)
const APR = CLEAN_ROWS.filter((r) => r[at('cafe')] === 'Harbourside' && r[at('date')] >= '2027-04-18' && r[at('date')] <= '2027-05-01');
const aprF = APR.map((r) => r[at('footfall')]), aprW = APR.map((r) => r[at('peak_wait_min')]), aprD = APR.map((r) => dayLabel(r[at('date')]));
const aprAll = C.pearson(aprF, aprW).r;
const aprNo = C.pearson(aprF.filter((_, i) => aprD[i] !== '1 May'), aprW.filter((_, i) => aprD[i] !== '1 May')).r;
const aprInf = C.influence(aprF, aprW);
const aprRest = aprF.filter((_, i) => aprD[i] !== '1 May');
const may1 = APR.find((r) => r[at('date')] === '2027-05-01');

// Millbrook, July: peak load and wait
const JUL = CLEAN_ROWS.filter((r) => r[at('cafe')] === 'Millbrook' && r[at('date')] >= '2027-07-01' && r[at('date')] <= '2027-07-30');
const julL = JUL.map((r) => Math.round(r[at('transactions')] * 0.55 / r[at('peak_staff_hours')] * 100) / 100), julW = JUL.map((r) => r[at('peak_wait_min')]);
const julAll = C.pearson(julL, julW).r, julHigh = C.pearson(julL.filter((l) => l > 7), julW.filter((_, i) => julL[i] > 7)).r;
const julNHigh = julL.filter((l) => l > 7).length;

// both cafés, 4–17 October, interleaved by date (so a fixed block of rows is not one café)
const OCT = CLEAN_ROWS.filter((r) => r[at('date')] >= '2027-10-04' && r[at('date')] <= '2027-10-17');
const octC = OCT.map((r) => r[at('cafe')]), octF = OCT.map((r) => r[at('footfall')]), octT = OCT.map((r) => Math.round(r[at('sales')] / r[at('transactions')] * 100) / 100);
const octPooled = C.pearson(octF, octT).r;
const octM = C.pearson(octF.filter((_, i) => octC[i] === 'Millbrook'), octT.filter((_, i) => octC[i] === 'Millbrook')).r;
const octH = C.pearson(octF.filter((_, i) => octC[i] === 'Harbourside'), octT.filter((_, i) => octC[i] === 'Harbourside')).r;

export const items = [
  // ---------------------------------------------------------------- outliers-and-influence
  {
    id: 'b05-m3-1', lesson: 'outliers-and-influence', type: 'mc', kind: 'conceptual',
    prompt: 'Across 300 days, a shop’s daily high temperature and its sales have r = 0.45. One extra day is added: an ordinary temperature, but record sales from a private event. What happens to r, and why?',
    options: [
      'It falls, because the new day sits far above the pattern at an ordinary temperature and inflates the spread of sales.',
      'It rises, because a record value adds a large positive product of z-scores, whatever the temperature that day.',
      'It barely changes, because one day among 301 has a weight of only about a third of one per cent in r.',
      'It becomes negative, because the new day lies more than three standard deviations from the mean of sales.',
    ],
    answer: 0,
    feedback: {
      1: 'Its z-score for temperature is near 0, so its product z_x z_y is small. The large z_y mostly inflates s_y, which shrinks every other day’s contribution.',
      2: 'One day can matter far more than 1/301 of r, as Millbrook’s slip showed (r fell from 0.981 to 0.679 among 612 days).',
      3: 'A point’s distance from the mean doesn’t set the sign of r.',
    },
    solution: 'The event day is an outlier in y only. At an ordinary temperature its own term z_x z_y ÷ (n − 1) is close to zero, but its huge sales inflate the standard deviation of sales, so every other day’s z-score for sales shrinks and r falls. If the event is genuine, keep it and report r with and without it.',
  },
  {
    id: 'b05-m3-2', lesson: 'outliers-and-influence', type: 'formula', kind: 'numerical',
    prompt: `Harbourside, 18 April – 1 May 2027: column A names the day, B holds footfall and C the average wait at the morning peak. E1 shows r for all ${APR.length} days. 1 May had a 9.2-minute wait. In E2, calculate r with 1 May left out, by filtering on the day’s name in column A.`,
    sheet: { cells: { A1: 'Day', B1: 'Footfall', C1: 'Peak wait (min)', ...col('A', 2, aprD), ...col('B', 2, aprF), ...col('C', 2, aprW), D1: 'r, all days', E1: `=CORREL(B2:B${APR.length + 1},C2:C${APR.length + 1})`, D2: 'r without 1 May' } },
    cell: 'E2', answer: `=CORREL(FILTER(B2:B${APR.length + 1},A2:A${APR.length + 1}<>"1 May"),FILTER(C2:C${APR.length + 1},A2:A${APR.length + 1}<>"1 May"))`,
    alt: [`=PEARSON(FILTER(B2:B${APR.length + 1},A2:A${APR.length + 1}<>"1 May"),FILTER(C2:C${APR.length + 1},A2:A${APR.length + 1}<>"1 May"))`, `=CORREL(B2:B${APR.length},C2:C${APR.length})`],
    view: `A1:E${APR.length + 1}`,
    formats: { E1: '0.000', E2: '0.000' }, widths: { C: 15, D: 16 },
    wrong: [
      { formula: `=CORREL(FILTER(B2:B${APR.length + 1},A2:A${APR.length + 1}="1 May"),FILTER(C2:C${APR.length + 1},A2:A${APR.length + 1}="1 May"))`, say: 'That keeps only 1 May. Use <> (not equal to) to keep every other day.' },
      { formula: `=CORREL(B2:B${APR.length + 1},C2:C${APR.length + 1})`, say: 'That is every day, as in E1.' },
    ],
    solution: `<x>=CORREL(FILTER(B2:B15,A2:A15<>"1 May"),FILTER(C2:C15,A2:A15<>"1 May"))</x> = ${fx(aprNo)}, against ${fx(aprAll)} with 1 May. In this fortnight 1 May (a Saturday with ${may1[at('footfall')]} visitors, when no other day had more than ${Math.max(...aprRest)}) is far out on both variables and in the direction of the trend, so it raises r; leaving it out lowers r by ${fx(aprAll - aprNo, 2)}. Over the whole year the same day pulls r the other way. Its roster had only ${may1[at('peak_staff_hours')]} barista hours: a genuine day, to be kept and reported both ways.`,
  },
  {
    id: 'b05-m3-3', lesson: 'outliers-and-influence', type: 'mc', kind: 'applied',
    prompt: 'Pinecrest Clinics (fictional) correlates weekly appointment numbers with patient waiting times across 52 weeks: r = 0.38. One week, during a system outage that is fully documented, waiting times were four times their usual level; without it r = 0.61. Which write-up is best?',
    options: [
      'r = 0.61 across 51 normal weeks; including the documented outage week, r = 0.38. The outage, not the appointment numbers, explains that week’s waits.',
      'r = 0.61 across the year; the outage week was removed from the data because it was an outlier that weakened the correlation.',
      'r = 0.38 across all 52 weeks, since removing a week is never acceptable and the outage is part of the clinic’s real experience.',
      'r = 0.50, the average of the two correlations, which balances the outage week against the 51 normal weeks of the year.',
    ],
    answer: 0,
    feedback: {
      1: 'Removing it silently, and for the reason that it weakened r, is choosing the answer. Say why it differs and report both.',
      2: 'Keeping it is fine, but the reader needs to know that one documented week moves r from 0.61 to 0.38.',
      3: 'An average of two correlations answers neither question.',
    },
    solution: 'The outage week is genuine but caused by something other than the number of appointments. Report the correlation for normal weeks, which answers the question about appointments, beside the figure with every week, and say what the outage week was.',
  },

  // ---------------------------------------------------------------- nonlinear-and-restricted
  {
    id: 'b05-m3-4', lesson: 'nonlinear-and-restricted', type: 'num', kind: 'numerical',
    prompt: 'Across all applicants, Marlow Insurance (fictional) expects an aptitude score and first-year sales to correlate r = 0.80 (straight line, even scatter). It will hire only top scorers, whose scores will have one third of the applicants’ standard deviation. Use the range-restriction formula with k = s ÷ S = 1/3 to estimate r among the hired staff. Give two decimal places.',
    answer: 0.41, check: () => { const k = 1 / 3, r = 0.8; return k * r / Math.sqrt(1 - r * r + k * k * r * r); }, unit: '', places: 2, tol: 0.005,
    wrong: [
      { value: 0.27, say: 'r doesn’t shrink in proportion to the spread. Put k = 1/3 into k r ÷ √(1 − r² + k² r²).' },
      { value: 0.96, say: 'That uses k = 3, which goes from a restricted to a full range. Here you go from full to restricted: k = 1/3.' },
    ],
    solution: 'r_r = (1/3)(0.80) ÷ √(1 − 0.64 + (1/9)(0.64)) = 0.2667 ÷ √0.4311 = 0.2667 ÷ 0.6566 ≈ 0.41. The same formula works in both directions. Among hired staff the score will look like a weak predictor even though it separates applicants well, so Marlow should judge the test on all applicants, not on its hires.',
  },
  {
    id: 'b05-m3-5', lesson: 'nonlinear-and-restricted', type: 'formula', kind: 'numerical',
    prompt: `Millbrook, July 2027: B2:B31 hold the peak load (transactions per barista hour) and C2:C31 the average peak wait. E1 shows r for all 30 days. In E2, calculate r for the days with a load above 7 only.`,
    sheet: { cells: { A1: 'Day', B1: 'Peak load', C1: 'Peak wait (min)', ...col('A', 2, JUL.map((r) => dayLabel(r[at('date')]))), ...col('B', 2, julL), ...col('C', 2, julW), D1: 'r, all days', E1: '=CORREL(B2:B31,C2:C31)', D2: 'r, load above 7' } },
    cell: 'E2', answer: '=CORREL(FILTER(B2:B31,B2:B31>7),FILTER(C2:C31,B2:B31>7))',
    alt: ['=PEARSON(FILTER(B2:B31,B2:B31>7),FILTER(C2:C31,B2:B31>7))', '=CORREL(FILTER(C2:C31,B2:B31>7),FILTER(B2:B31,B2:B31>7))'],
    view: 'A1:E31', maxHeight: '22rem',
    formats: { B: '0.00', E1: '0.000', E2: '0.000' }, widths: { C: 15, D: 16 },
    wrong: [
      { formula: '=CORREL(FILTER(B2:B31,B2:B31>7),C2:C31)', say: 'Filter both columns with the same condition, or the pairs no longer line up.' },
    ],
    solution: `<x>=CORREL(FILTER(B2:B31,B2:B31>7),FILTER(C2:C31,B2:B31>7))</x> = ${fx(julHigh)} for the ${julNHigh} days above 7, against ${fx(julAll)} for all 30. Restricting the range raised r here, because the days kept are the steep part of a threshold: above a load of 7 the wait follows the load closely.`,
  },
  {
    id: 'b05-m3-6', lesson: 'nonlinear-and-restricted', type: 'classify', kind: 'conceptual',
    prompt: 'For each finding, choose the best description of what the correlation is doing.',
    items: [
      'Northway Couriers (fictional): delivery errors are flat until about 40 parcels per driver per day, then climb; r over all days is 0.55.',
      'A taste panel scores coffee by brewing temperature: scores peak in the middle of the range and fall at both ends; r is 0.02.',
      'Across fourteen fictional cities, sales rise with population ever more slowly; r is 0.91 on the values and 0.99 on the logs.',
      'Satisfaction measured by one noisy question correlates 0.30 with repeat purchases; with a reliable ten-item scale, 0.45.',
    ],
    categories: ['r understates a link with a threshold', 'r misses a link with a turning point', 'r grows when a multiplicative curve is straightened', 'Measurement error attenuates r'],
    answer: [0, 1, 2, 3],
    feedback: {
      0: 'Flat, then rising: describe where the threshold is and how steep the rise is.',
      1: 'Rising then falling: the two sides cancel in r.',
      2: 'Logs turn equal ratios into equal differences, so a curve that grows by percentages straightens; Spearman’s ρ would be the same on either scale.',
      3: 'A noisier measure of satisfaction adds random scatter and weakens the observed correlation.',
    },
    solution: 'Each pattern calls for a different response: describe a threshold, measure against a turning point, use logs (or ranks) for a multiplicative curve, and measure more reliably (or correct for attenuation) when error weakens r.',
  },

  // ---------------------------------------------------------------- groups-and-simpsons-paradox
  {
    id: 'b05-m3-7', lesson: 'groups-and-simpsons-paradox', type: 'mc', kind: 'conceptual',
    prompt: 'Northway Couriers (fictional) has a city depot and a rural depot. Inside each depot, days with more parcels per driver have higher on-time rates (drivers’ routes are denser). Pooled across both depots, more parcels per driver go with lower on-time rates. Which fact about the depots would explain the reversal?',
    options: [
      'The city depot handles many more parcels per driver and has lower on-time rates than the rural depot overall.',
      'The city depot has more drivers than the rural depot, so it contributes more days to the pooled data.',
      'Both depots have the same average on-time rate, but the city depot’s rates vary more from day to day.',
      'The rural depot’s parcels per driver vary more from day to day than the city depot’s parcels do.',
    ],
    answer: 0,
    feedback: {
      1: 'Unequal numbers of days change the weights but can’t reverse the sign unless the depots also differ in both variables.',
      2: 'With equal mean on-time rates the between-depot part is zero, so pooling can dilute but not reverse the relationship.',
      3: 'Differences in spread change each depot’s own r, not the sign of the pooled one.',
    },
    solution: 'A reversal needs the groups to differ in both x and y, against the direction of the relationship inside them. If the city depot carries more parcels per driver and is less punctual overall (traffic, perhaps), the between-depot part of the sum of products is negative and can outweigh the positive within-depot part.',
  },
  {
    id: 'b05-m3-8', lesson: 'groups-and-simpsons-paradox', type: 'num', kind: 'numerical',
    prompt: 'For two groups of fictional data, the within-group sums of products add up to +400 and the between-group part is −1,000. The total sums of squares (around the overall means) are 2,500 for x and 900 for y. Calculate the pooled correlation r. Give two decimal places.',
    answer: -0.4, check: () => (400 - 1000) / Math.sqrt(2500 * 900), unit: '', places: 2, tol: 0.005,
    wrong: [
      { value: 0.27, say: 'That uses only the within-group part. The pooled sum of products is within plus between: 400 − 1,000 = −600.' },
      { value: -0.67, say: 'That uses only the between-group part. Add the two parts: −600.' },
    ],
    solution: 'Pooled sum of products = 400 + (−1,000) = −600. r = −600 ÷ √(2,500 × 900) = −600 ÷ 1,500 = −0.40. Inside the groups x and y move together; the gap between the groups is large enough to make the pooled correlation negative.',
  },
  {
    id: 'b05-m3-9', lesson: 'groups-and-simpsons-paradox', type: 'formula', kind: 'applied',
    prompt: 'Both cafés, 4–17 October 2027, in date order, so the two cafés’ rows alternate: B holds the café, C footfall and D the average ticket. G1 shows the pooled r. In G2, calculate Millbrook’s own correlation between footfall and average ticket.',
    sheet: { cells: { A1: 'Day', B1: 'Café', C1: 'Footfall', D1: 'Avg ticket ($)', ...col('A', 2, OCT.map((r) => dayLabel(r[at('date')]))), ...col('B', 2, octC), ...col('C', 2, octF), ...col('D', 2, octT), F1: 'r, pooled', G1: '=CORREL(C2:C29,D2:D29)', F2: 'r, Millbrook' } },
    cell: 'G2', answer: '=CORREL(FILTER(C2:C29,B2:B29="Millbrook"),FILTER(D2:D29,B2:B29="Millbrook"))',
    alt: ['=PEARSON(FILTER(C2:C29,B2:B29="Millbrook"),FILTER(D2:D29,B2:B29="Millbrook"))', '=CORREL(FILTER(D2:D29,B2:B29="Millbrook"),FILTER(C2:C29,B2:B29="Millbrook"))', '=CORREL(FILTER(C2:C29,B2:B29<>"Harbourside"),FILTER(D2:D29,B2:B29<>"Harbourside"))'],
    view: 'A1:G29', maxHeight: '22rem',
    formats: { D: '$#,##0.00', G1: '0.000', G2: '0.000' }, widths: { D: 13, F: 14 },
    wrong: [
      { formula: '=CORREL(C2:C15,D2:D15)', say: 'The rows alternate between the cafés, so rows 2–15 hold both. Select Millbrook’s rows with FILTER on column B.' },
      { formula: '=CORREL(C2:C29,D2:D29)', say: 'That is the pooled r in G1.' },
    ],
    solution: `<x>=CORREL(FILTER(C2:C29,B2:B29="Millbrook"),FILTER(D2:D29,B2:B29="Millbrook"))</x> = ${fx(octM)} (Harbourside’s is ${fx(octH)}), while the pooled r is ${fx(octPooled)}. With the rows in date order, no fixed block holds one café, which is why a FILTER on the café name is safer than picking ranges by hand.`,
  },
  {
    id: 'b05-m3-10', lesson: 'groups-and-simpsons-paradox', type: 'mc', kind: 'applied',
    prompt: 'A fictional city survey reports that across its 25 neighbourhoods, those with a higher average household income have a higher average spend in cafés (r = 0.82). A café chain wants to target its loyalty offers at its higher-income customers in every neighbourhood. What does the survey support?',
    options: [
      'It supports opening in higher-income neighbourhoods, but says nothing reliable about which customers within a neighbourhood spend more.',
      'It shows that within every neighbourhood the higher-income households spend more in cafés than the lower-income ones.',
      'It supports both decisions equally well, because a correlation of 0.82 across 25 neighbourhoods is very strong.',
      'It supports neither decision, because correlations between averages are always weaker than individual correlations.',
    ],
    answer: 0,
    feedback: {
      1: 'That moves from neighbourhoods to households, the ecological fallacy. Households’ own incomes and spending might be only weakly related.',
      2: 'Strength doesn’t change the level: 0.82 describes neighbourhoods.',
      3: 'Ecological correlations are usually stronger, not weaker, and they do answer questions about the groups themselves.',
    },
    solution: 'The survey’s correlation is ecological: it describes neighbourhoods, and supports decisions about neighbourhoods, such as where to open. Targeting individual customers needs customer-level data, because inside a neighbourhood the relationship between income and café spending could be weak or even reversed.',
  },
];
