// partial-correlation.js — B05 · Partial correlation. Content only; exercises are in partial-correlation.ex.js.
// Uses the cafés' daily log (case.js: column, DERIVED.staffWait, DERIVED.staffWaitGivenTrans) for peak barista hours,
// peak waits and transactions, Harbourside's weather, footfall and sales for the mediator and collider cases.
// Swiftwing Air is fictional. Regression slopes and prediction are B06's; causal reasoning is correlation-and-causation's.
// Every figure printed is recomputed in `checks`.
import { DERIVED as D, column } from './case.js?v=20';
import * as C from '../../../core/correlation.js?v=20';
import { mean, ranks } from '../../../core/stats.js?v=20';
import { tSf } from '../../../core/inference.js?v=20';

// ---------------------------------------------------------------- staffing and waits (both cafés, 612 days)
const S = column('peak_staff_hours'), W = column('peak_wait_min'), T = column('transactions'), LOAD = column('peak_load');
const CAFE = column('cafe').map((c) => (c === 'Millbrook' ? 1 : 0));
const rSW = C.pearson(S, W).r, rST = C.pearson(S, T).r, rWT = C.pearson(W, T).r;
const PT = C.partial(S, W, [T]), PTC = C.partial(S, W, [T, CAFE]), PL = C.partial(S, W, [LOAD]);
const PR = C.partial(ranks(S), ranks(W), [ranks(T)]);
const H = { cafe: 'Harbourside' }, M = { cafe: 'Millbrook' };
const cafeR = (o) => C.pearson(column('peak_staff_hours', o), column('peak_wait_min', o)).r;
const cafeP = (o) => C.partial(column('peak_staff_hours', o), column('peak_wait_min', o), [column('transactions', o)]).r;
const band = (a, b) => { const i = T.map((_, k) => k).filter((k) => T[k] >= a && T[k] < b); return { n: i.length, r: C.pearson(i.map((k) => S[k]), i.map((k) => W[k])).r, wait: mean(i.map((k) => W[k])) }; };
const BANDS = [[0, 100], [100, 150], [150, 200], [200, 300]].map(([a, b]) => ({ a, b, ...band(a, b) }));
const PSS = C.partial(S, column('sales'), [T]);

// ---------------------------------------------------------------- Harbourside: weather, footfall, sales (mediator) and weather, rain (collider)
const hHigh = column('high_f', H), hSales = column('sales', H), hFoot = column('footfall', H), hRain = column('rain_in', H);
const MED = { r: C.pearson(hHigh, hSales).r, p: C.partial(hHigh, hSales, [hFoot]).r, foot: C.pearson(hHigh, hFoot).r };
const COL = { r: C.pearson(hHigh, hRain).r, part: C.partial(hHigh, hRain, [hFoot]), rainFoot: C.pearson(hRain, hFoot).r };

// ---------------------------------------------------------------- Swiftwing Air (fictional): crew, complaints, passengers on 50 flights
const KA = { xy: 0.40, xz: 0.85, yz: 0.60, n: 50 };
const kaP = C.partialFromR(KA.xy, KA.xz, KA.yz), kaDf = KA.n - 3, kaT = kaP * Math.sqrt(kaDf / (1 - kaP * kaP)), kaPv = 2 * tSf(Math.abs(kaT), kaDf);

// ---------------------------------------------------------------- figure: confounder, mediator, collider
function dagFigure() {
  const node = (x, y, t) => `<rect x="${x - 52}" y="${y - 16}" width="104" height="32" rx="6" fill="none" stroke="var(--ink)" stroke-width="1.2"/><text x="${x}" y="${y + 4}" text-anchor="middle" font-size="12">${t}</text>`;
  const arrow = (x1, y1, x2, y2) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="var(--ink)" stroke-width="1.4" marker-end="url(#pc-arr)"/>`;
  let svg = '<svg viewBox="0 0 660 230" xmlns="http://www.w3.org/2000/svg" font-size="12" fill="currentColor">';
  svg += '<defs><marker id="pc-arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--ink)"/></marker></defs>';
  // confounder
  svg += '<text x="110" y="20" text-anchor="middle" font-weight="bold">Confounder</text>';
  svg += node(110, 60, 'Busy day') + node(50, 170, 'Baristas') + node(170, 170, 'Wait');
  svg += arrow(95, 77, 62, 152) + arrow(125, 77, 158, 152);
  svg += '<text x="110" y="215" text-anchor="middle" font-size="11" fill="var(--ink-3)">Hold it fixed</text>';
  // mediator
  svg += '<text x="330" y="20" text-anchor="middle" font-weight="bold">Mediator</text>';
  svg += node(270, 170, 'Warm day') + node(330, 60, 'Footfall') + node(390, 170, 'Sales');
  svg += arrow(282, 152, 317, 78) + arrow(343, 78, 378, 152);
  svg += '<text x="330" y="215" text-anchor="middle" font-size="11" fill="var(--ink-3)">Don’t hold it fixed for the total link</text>';
  // collider
  svg += '<text x="550" y="20" text-anchor="middle" font-weight="bold">Collider</text>';
  svg += node(490, 60, 'Warm day') + node(610, 60, 'Rain') + node(550, 170, 'Footfall');
  svg += arrow(502, 78, 537, 152) + arrow(598, 78, 563, 152);
  svg += '<text x="550" y="215" text-anchor="middle" font-size="11" fill="var(--ink-3)">Holding it fixed creates a link</text>';
  return `${svg}</svg>`;
}

export default {
  slug: 'partial-correlation',
  title: 'Partial correlation',
  blurb: 'Ask what remains of a correlation when a third variable is held fixed: by comparing like with like, by correlating residuals, or with the first-order formula. Then learn which variables to hold fixed (confounders) and which not to (mediators and colliders).',
  status: 'draft',
  objectives: [
    'Explain what it means to hold a third variable fixed, and compare days that are alike on it to see the idea at work.',
    'Calculate a partial correlation by correlating residuals and with the first-order formula, in Excel and by hand, and test it with n − 2 − k degrees of freedom.',
    'Interpret a partial correlation that differs in size or sign from the simple correlation, without claiming more than it shows.',
    'Distinguish confounders, mediators and colliders, and explain why controlling for a mediator or a collider misleads.',
    'Identify the limits of partial correlation: straight-line control only, measurement error in the control, and variables left out.',
  ],
  prerequisites: [
    { lesson: 'b05/correlation-matrices', why: 'The matrix in which peak barista hours and peak waits correlate at +0.53, the puzzle this lesson resolves.' },
    { lesson: 'b05/testing-correlation', why: 'The t test of a correlation, which a partial correlation reuses with fewer degrees of freedom.' },
    { lesson: 'b05/nonlinear-and-restricted', why: 'The steep rise in waits once the load passes about seven transactions per barista hour.' },
    { lesson: 'b03/descriptive-statistics-and-regression', why: 'SLOPE, INTERCEPT and the least-squares line, used here only to take out a third variable’s straight-line part.' },
  ],
  case: 'lantern',

  concept: [
    { case: 'Ana’s correlation matrix shows peak barista hours and the peak wait correlating at +0.53 over both cafés’ 612 days. Read at face value, days with more baristas at the 7–11 a.m. peak had longer waits, and a manager under pressure to cut costs might conclude that extra baristas get in each other’s way. Ana suspects something else: both numbers rise on busy days. More customers mean longer queues, and her managers roster more baristas on days they expect to be busy.' },

    { h: 'Comparing like with like' },
    { p: 'The way to check is to compare days that were equally busy. If the extra baristas are only a sign of a busy day, then among days with about the same number of transactions the link should disappear; if baristas shorten queues, it should turn negative. The table splits the 612 days by transactions and finds the correlation of peak barista hours with the peak wait inside each band.' },
    { table: {
      caption: 'Peak barista hours and peak wait within bands of daily transactions (both cafés, 612 days)',
      head: ['Transactions', 'Days', 'Mean peak wait (min)', 'r (barista hours, wait)'],
      align: ['l', 'r', 'r', 'r'],
      rows: BANDS.map((b) => [`${b.a}–${b.b - 1}`, String(b.n), b.wait.toFixed(2), (b.r < 0 ? '−' : '') + Math.abs(b.r).toFixed(2)]),
    } },
    { p: 'Inside every band the correlation is negative: −0.58 and −0.59 on days with 100 to 199 transactions, where queues build, and only −0.13 on quiet days, when the wait is about two minutes whatever the roster. Among equally busy days, more barista hours go with shorter waits. The positive correlation over all days came from mixing quiet days, with few baristas and short waits, with busy days, with more baristas and longer waits. This is the same mechanism as the groups-and-simpsons-paradox lesson, with a continuous variable instead of two cafés.' },
    { p: 'Bands are a rough tool. They throw away information (days with 101 and 149 transactions are treated alike), the bands can be few days each, and with two or three variables to hold fixed the bands multiply fast. Partial correlation does the same job with all the data at once.' },

    { h: 'Holding transactions fixed with residuals' },
    { p: 'Draw the least-squares line through the scatterplot of peak barista hours against transactions. Each day’s <g>residual</g> is its barista hours minus the line’s value at its number of transactions: positive on days rostered more heavily than usual for that much trade, negative on days rostered lightly. Do the same for the peak wait: a positive residual means a longer wait than usual for that many transactions. Both residuals have had transactions’ straight-line part taken out, so their correlation is the link between barista hours and waits with transactions held fixed. That correlation is the <g>partial correlation</g>.' },
    { p: String.raw`For the 612 days it is <m>r_{SW \cdot T} = -0.725</m>, where S is peak barista hours, W the peak wait and T transactions, and the dot is read “holding fixed”. The sign has flipped: on days with more barista hours than usual for their trade, waits were shorter than usual for their trade. The Explore widget plots the two sets of residuals; switch it to the raw values to see the +0.53 cloud again.` },
    { callout: 'key', title: 'A partial correlation answers a different question', html: 'The simple correlation, +0.53, asks: on days with more barista hours, were waits longer? Yes, because those were busy days. The partial correlation, −0.72, asks: on days equally busy, did more barista hours go with shorter waits? Yes. Both are correct answers to their own questions. Ana’s roster decision depends on the second.' },

    { h: 'The first-order formula' },
    { p: 'With one variable held fixed, the partial correlation can be worked out from the three simple correlations, so a correlation matrix is enough:' },
    { math: String.raw`r_{SW\cdot T} = \dfrac{r_{SW} - r_{ST}\,r_{WT}}{\sqrt{(1 - r_{ST}^2)(1 - r_{WT}^2)}} = \dfrac{0.535 - 0.926 \times 0.767}{\sqrt{(1 - 0.926^2)(1 - 0.767^2)}} = \dfrac{-0.175}{0.242} \approx -0.725` },
    { p: String.raw`The numerator subtracts from <m>r_{SW}</m> the part that both variables’ links with transactions would produce on their own, <m>r_{ST} \times r_{WT} = 0.710</m>. The simple correlation, 0.535, is less than that, so once transactions are accounted for the remaining link is negative. The denominator rescales the result to the −1 to 1 range, using what is left of each variable after transactions are taken out. It is called first-order because it holds one variable fixed; a simple correlation is zero-order.` },
    { p: 'The case was built this way. The generator lets the peak wait depend on transactions per barista hour, so more baristas shorten the wait at a given level of trade, and lets the managers roster for the trade they expect. The partial correlation recovers the planted direction from the log; the simple correlation points the wrong way. With real data no one tells you what was planted, which is why the correlation-and-causation lesson asks what more evidence a causal claim needs.' },
  ],

  theory: [
    { h: 'Definition and notation' },
    { p: String.raw`The partial correlation of x and y holding z fixed, <m>r_{xy\cdot z}</m>, is the correlation between the residuals of x after a least-squares fit on z and the residuals of y after a least-squares fit on z. With several variables held fixed, <m>z_1, \dots, z_k</m>, fit each of x and y on all of them at once (multiple regression, B06) and correlate the residuals: <m>r_{xy\cdot z_1 \dots z_k}</m> is of order k. The first-order formula gives the same number as the residual method when one variable is held fixed. Like any correlation it lies between −1 and 1.` },
    { p: 'Ana can hold the café fixed as well as transactions, as a 0/1 variable (1 for Millbrook). The second-order partial correlation is −0.719, almost unchanged from −0.725, so the difference between the cafés was not what made the simple correlation positive. Inside each café separately, with transactions held fixed, it is −0.54 at Harbourside and −0.83 at Millbrook: the direction agrees, the strength differs.' },

    { h: 'Testing a partial correlation' },
    { p: String.raw`To test <m>H_0: \rho_{xy\cdot z} = 0</m>, use the testing-correlation lesson’s t statistic with k fewer degrees of freedom, one for each variable held fixed: <m>t = r\sqrt{(n - 2 - k) / (1 - r^2)}</m> on <m>n - 2 - k</m> df (Penn State’s STAT 505 notes give the same rule). For the 612 days, <m>t = -0.725\sqrt{609 / (1 - 0.725^2)} \approx -25.9</m> on 609 df, and the two-sided p-value is below 0.001. In Excel, <x>=T.DIST.2T(ABS(t),n-2-k)</x>. The interval and power ideas of the testing-correlation lesson carry over the same way.` },

    { h: 'Partial correlation in Excel' },
    { p: 'There is no PARTIAL function. Two routes give the same answer for one control. The formula route: three CORREL cells and the first-order formula, <x>=(B1-B2*B3)/SQRT((1-B2^2)*(1-B3^2))</x> with r_xy, r_xz and r_yz in B1:B3. The residual route: a column of residuals for each variable, <x>=C2-(INTERCEPT(C$2:C$32,$D$2:$D$32)+SLOPE(C$2:C$32,$D$2:$D$32)*$D2)</x> with the control in column D, filled down and across, then CORREL of the two residual columns. The residual route shows each day’s residual, so you can plot them and spot the days that drive the result, and it extends to several controls with LINEST.' },

    { h: 'What a partial correlation can’t do' },
    { list: [
      '<b>It removes only the straight-line part of the control.</b> Waits rise along a curve as trade grows (a <g>threshold effect</g>), and the bands show the link between baristas and waits is weak on quiet days and strong on busy ones. The single partial correlation, −0.72, averages over that. Partial correlation on ranks (−0.47 here) or a comparison within bands can show what the straight line misses.',
      '<b>It can’t hold fixed what wasn’t measured.</b> If something else drives both variables, such as a school holiday that brings both a crowd and extra staff, holding transactions fixed doesn’t remove it.',
      '<b>A control measured with error controls only partly.</b> If the door counter misses some customers, holding footfall fixed leaves some of the busy-day effect in, a problem called <g>residual confounding</g>.',
      '<b>It is still a correlation.</b> A partial correlation says how two variables go together at given values of a third; whether one causes the other needs the evidence of the next lesson.',
    ] },

    { h: 'Which variables to hold fixed' },
    { p: 'The arithmetic will hold anything fixed. Whether it should depends on how the variables are connected, which the data alone can’t tell you; it comes from knowing how the business works and the order in which things happen. Three cases matter.' },
    { figure: {
      svg: dagFigure(),
      caption: 'Three ways a third variable can be connected. Arrows show what affects what. Hold a confounder fixed; don’t hold a mediator fixed if you want the whole link; never hold a collider fixed.',
      alt: 'Three small diagrams of boxes and arrows. Left, labelled Confounder: an arrow from Busy day to Baristas and an arrow from Busy day to Wait; caption “Hold it fixed”. Middle, labelled Mediator: an arrow from Warm day to Footfall and from Footfall to Sales; caption “Don’t hold it fixed for the total link”. Right, labelled Collider: arrows from Warm day and from Rain both pointing into Footfall; caption “Holding it fixed creates a link”.',
    } },
    { p: String.raw`A <g>confounding variable</g> affects both variables, as a busy day drives both the roster and the queue. Holding it fixed removes the link it creates, which is what Ana did with transactions.` },
    { p: String.raw`A <g>mediator</g> lies on the path from one variable to the other: x affects m, and m affects y. Holding a mediator fixed removes the part of the link that runs through it, so the partial correlation measures only what is left, not the whole effect. At Harbourside warm days bring more people to the waterfront (the case’s generator makes footfall rise with the temperature there), and more people buy more. The high temperature and sales correlate at 0.40; holding footfall fixed gives −0.19. The 0.40 answers “do warm days go with higher sales?”; the −0.19 answers a narrower question, “at a given footfall, do warm days go with higher sales?”, and the answer may reflect something else, such as cheaper iced drinks. Within the case the peak load is the starkest example: it is transactions per barista hour, the route through which baristas shorten waits, and holding it fixed leaves barista hours and waits correlating at +0.07, as if baristas didn’t matter.` },
    { p: String.raw`A <g>collider</g> is affected by both variables. Holding a collider fixed creates a link between its causes even if they are unrelated, because among days with the same value of the collider, a high value of one cause must be offset by the other (Cole and colleagues, 2010, give clear examples). At Harbourside the high temperature and rain are almost unrelated (r = 0.05), but warm days raise footfall and rain lowers it. Holding footfall fixed gives a partial correlation of 0.17 (p = 0.004): among days with the same footfall, the warmer ones were more often wet, because a warm, dry day would have drawn more people. The link is created by the analysis, not by the weather.` },
    { callout: 'warn', title: 'More controls are not always better', html: 'It is tempting to hold fixed every variable in the dataset “to be safe”. That removes confounding but can also remove the effect you care about (a mediator) or create a false link (a collider). Choose controls from what you know about the order and mechanism of the process, and say which you held fixed and why.' },
  ],

  formulas: [
    { id: 'part-first-order', name: 'First-order partial correlation',
      tex: String.raw`r_{xy\cdot z} = \dfrac{r_{xy} - r_{xz}\,r_{yz}}{\sqrt{(1 - r_{xz}^2)(1 - r_{yz}^2)}}`,
      where: [[String.raw`r_{xy\cdot z}`, 'Correlation of x and y holding z fixed', ''], [String.raw`r_{xy}`, 'Simple correlation of x and y', ''], [String.raw`r_{xz}, r_{yz}`, 'Correlations of x and of y with the control z', '']],
      assumptions: 'All three correlations from the same rows; z’s links with x and y are roughly straight lines.',
      note: 'Undefined if z correlates perfectly with x or y. Gives the same value as correlating residuals.' },
    { id: 'part-residual', name: 'Partial correlation as a correlation of residuals',
      tex: String.raw`r_{xy\cdot z} = \operatorname{corr}(e_x, e_y), \quad e_x = x - (a_x + b_x z), \quad e_y = y - (a_y + b_y z)`,
      where: [[String.raw`r_{xy\cdot z}`, 'Partial correlation of x and y holding z fixed', ''], [String.raw`e_x, e_y`, 'Residuals of x and of y after a least-squares line on z', 'units of x, of y'], [String.raw`a_x, b_x`, 'Intercept and slope of the line of x on z (INTERCEPT, SLOPE)', 'units of x; of x per unit of z'], [String.raw`a_y, b_y`, 'Intercept and slope of the line of y on z', 'units of y; of y per unit of z'], [String.raw`x, y, z`, 'The two variables of interest and the control', 'their units']],
      note: 'With several controls, fit x and y on all of them (LINEST or multiple regression, B06) and correlate the residuals.' },
    { id: 'part-test', name: 'Test of a partial correlation',
      tex: String.raw`t = r_{xy\cdot z}\sqrt{\dfrac{n - 2 - k}{1 - r_{xy\cdot z}^2}}, \qquad \text{df} = n - 2 - k`,
      where: [[String.raw`r_{xy\cdot z}`, 'The partial correlation', ''], [String.raw`n`, 'Number of rows complete on every variable', ''], [String.raw`k`, 'Number of variables held fixed', ''], [String.raw`t`, 'Test statistic for H₀: the partial correlation is 0', ''], [String.raw`\text{df}`, 'Degrees of freedom', '']],
      assumptions: 'As for the test of a simple correlation, applied to the residuals.',
      note: 'Excel: T.DIST.2T(ABS(t), n − 2 − k).' },
  ],

  examples: [
    { level: 'simple', title: 'Cabin crew and complaints', fictional: true,
      setup: 'Swiftwing Air (fictional) looked at 50 flights. The number of cabin crew and the number of passenger complaints correlate at 0.40, which worries the operations director. Crew correlate with the number of passengers at 0.85 (bigger flights carry more crew) and complaints with passengers at 0.60. What is the correlation of crew and complaints holding passengers fixed, and is it significant at 5%?',
      steps: [
        String.raw`Name the variables: x = crew, y = complaints, z = passengers; <m>r_{xy} = 0.40</m>, <m>r_{xz} = 0.85</m>, <m>r_{yz} = 0.60</m>.`,
        String.raw`Numerator: <m>r_{xy} - r_{xz} r_{yz} = 0.40 - 0.85 \times 0.60 = 0.40 - 0.51 = -0.11</m>.`,
        String.raw`Denominator: <m>\sqrt{(1 - 0.85^2)(1 - 0.60^2)} = \sqrt{0.2775 \times 0.64} = 0.4214</m>, so <m>r_{xy\cdot z} = -0.11 \div 0.4214 \approx -0.261</m>.`,
        String.raw`Test with one variable held fixed: df = 50 − 2 − 1 = 47, <m>t = -0.261\sqrt{47 \div (1 - 0.261^2)} \approx -1.85</m>, and <x>=T.DIST.2T(1.85,47)</x> ≈ 0.070.`,
      ],
      answer: 'r(crew, complaints · passengers) ≈ −0.26, t ≈ −1.85 on 47 df, p ≈ 0.070: not significant at 5%.',
      interpretation: 'The worrying +0.40 comes from flight size: big flights have more crew and more complaints. On flights of the same size there is a weak tendency for more crew to go with fewer complaints, but 50 flights are too few to be sure of it. The director should stop worrying about crew causing complaints and, if she wants to know whether extra crew reduce them, look at more flights or test it directly.' },

    { level: 'challenging', title: 'Baristas and waits, three ways', fictional: true,
      setup: 'Use Ana’s full log to find the partial correlation of peak barista hours (S) and the peak wait (W) holding transactions (T) fixed, by the formula and by residuals; test it; then check whether the café, or the curve in waits, changes the conclusion.',
      steps: [
        String.raw`Simple correlations from the matrix: <m>r_{SW} = 0.535</m>, <m>r_{ST} = 0.926</m>, <m>r_{WT} = 0.767</m>. Formula: <m>(0.535 - 0.710) \div \sqrt{0.142 \times 0.412} = -0.175 \div 0.242 \approx -0.725</m>.`,
        'Residuals: fitting barista hours and waits each on transactions and correlating the 612 pairs of residuals gives −0.725 as well, the same value, as it must with one control.',
        String.raw`Test: k = 1, so df = 609 and <m>t \approx -25.9</m>; the two-sided p-value is below 0.001.`,
        'Café: holding the café fixed as well (a second-order partial) gives −0.719; within Harbourside alone, −0.54, and within Millbrook alone, −0.83. The sign is the same everywhere.',
        'The curve: within bands of transactions the correlation is −0.13 on quiet days (under 100 transactions) and −0.58 to −0.59 on days with 100 to 199. On ranks the partial correlation is −0.47. The straight-line partial correlation summarises a link that is weak when the cafés are quiet and strong when they are busy.',
      ],
      answer: 'r(S, W · T) = −0.725 (t ≈ −25.9, 609 df, p below 0.001), robust to holding the café fixed and negative in both cafés and in every band of trade, but much stronger on busy days than quiet ones.',
      interpretation: 'At a given level of trade, days rostered with more barista hours had shorter peak waits, most clearly on busy days. That agrees with what the case’s generator planted (waits depend on transactions per barista hour). It is the opposite of what the simple +0.53 suggested, and it is the number Ana should bring to a roster discussion, with the caveat that the log is observational.' },

    { level: 'applied', title: 'Which partial correlation answers the roster question?', fictional: true,
      setup: 'Ana’s operations manager has run three partial correlations of peak barista hours and the peak wait over the 612 days and asks which one should guide the roster: holding transactions fixed (−0.72), holding the peak load fixed (+0.07), or holding nothing fixed (+0.53).',
      steps: [
        'Write down how the variables are connected. Expected trade drives the roster and actual trade drives the queue, so transactions are a confounder of barista hours and waits. The peak load is transactions × 0.55 ÷ barista hours: it is computed from the roster itself, and it is the route by which extra baristas shorten the queue, so it is a mediator.',
        'Holding nothing fixed (+0.53) mixes busy and quiet days and answers “were waits longer on heavily rostered days?”, which is no help for a decision.',
        'Holding the load fixed (+0.07, p = 0.10) removes the very route through which baristas work. It answers “at the same load per barista, do more baristas go with shorter waits?”, and the answer is no, because at the same load, more baristas means more customers.',
        'Holding transactions fixed (−0.72) compares equally busy days and keeps the baristas’ route open. It answers the roster question: on a day with a given amount of trade, do more barista hours go with shorter waits?',
      ],
      answer: 'Use the partial correlation holding transactions fixed, −0.72. Holding nothing fixed confounds the link with busy days, and holding the load fixed controls for a mediator and hides the link.',
      interpretation: 'The choice of control is a judgement about how the café works, made before looking at the numbers. Ana’s note to the operations manager should say which variable was held fixed and why, and that a planned trial (the next lesson) would show more convincingly how much each extra barista hour shortens the queue.' },
  ],

  demo: [
    { widget: 'part-resid', intro: 'Each point is a day: its barista hours above or below the usual for its transactions, against its wait above or below the usual. Pearson’s r here is the partial correlation, −0.725. Colour by café to see that both cafés slope down, and turn on the least-squares line.' },
    { widget: 'part-raw', intro: 'The same days before holding transactions fixed: barista hours against the peak wait, r = +0.53. Colour by café, then compare the cloud with the residual plot above.' },
    { widget: 'part-formula', intro: 'Set the three simple correlations and see the partial correlation. Start at Ana’s values (0.535, 0.926 and 0.767). Then lower r(S, T): when the roster follows trade less closely, the gap between the simple and the partial correlation shrinks.' },
  ],

  mistakes: [
    { title: '“The partial correlation is the real correlation; the simple one was wrong.”', html: 'Both are correct answers to different questions. The simple correlation describes how barista hours and waits went together across all days; the partial correlation describes how they went together at a given level of trade. Say which question you are answering.' },
    { title: '“I held everything fixed to be safe.”', html: 'Holding a mediator fixed removes the effect you want to measure (holding the peak load fixed makes baristas look useless); holding a collider fixed creates a link that doesn’t exist (temperature and rain, once footfall is fixed). Choose each control from what you know about the process.' },
    { title: '“Holding transactions fixed means the busy-day effect is gone completely.”', html: 'A partial correlation removes only the straight-line part of the control’s link, and only for the control as measured. The baristas–wait link is weak on quiet days and strong on busy ones, and anything unmeasured that drives both is still there. Look at bands or ranks, and list what you couldn’t hold fixed.' },
    { title: '“I used n − 2 degrees of freedom for the partial correlation.”', html: 'Each variable held fixed uses up one more degree of freedom: test with n − 2 − k. With 612 rows it hardly matters; with 30 rows and three controls it does.' },
    { title: '“A negative partial correlation proves that baristas shorten waits.”', html: 'It shows that, at a given level of trade, the two went together that way. A manager who rosters extra baristas on days she expects a rush that doesn’t come would produce the same pattern without any effect of the baristas. Causal claims need the evidence of the next lesson.' },
  ],

  application: [
    { p: 'Partial correlation is how analysts ask whether a link survives once an obvious common driver is accounted for. A retailer finds that stores with more staff have more shrinkage, and holds store size fixed. A hospital finds that wards with more nurses have more incidents, and holds the number and severity of patients fixed. A marketing team finds that customers who open more emails spend more, and holds their past spending fixed. In each case the simple correlation mixes the effect of interest with the effect of size or busyness, and the partial correlation compares like with like.' },
    { case: 'Ana’s note to her operations manager reads: “Over the 612 café-days, more peak barista hours went with longer waits (r = +0.53), because both rise on busy days. Holding the day’s transactions fixed, the link reverses: on days with the same trade, more barista hours went with shorter waits (partial r = −0.72, p below 0.001), in both cafés, and most clearly on days with more than 100 transactions. I did not hold the load per barista fixed, because it is how baristas shorten queues. This is observational, so before changing the roster I would like to trial it.”' },
    { p: 'Her note does what a good partial-correlation report does. It gives the simple and the partial correlation side by side, so the reader sees what holding transactions fixed changed. It names the control and explains why it is a confounder, and names the variable deliberately not held fixed and why. It shows where the link is strong and where it is weak rather than relying on one number. And it stops short of a causal claim, which the last lesson of the module takes up.' },
    { p: 'In regression (B06) the same idea appears as a coefficient: the slope on barista hours in a model that also contains transactions measures the change in waits per extra barista hour at a given level of trade. Partial correlation gives the strength of that link on the −1 to 1 scale; regression gives its size in minutes per hour. Both depend on the same choice of controls.' },
  ],

  summary: [
    'A partial correlation measures the link between two variables holding one or more others fixed. With one control it is r_xy·z = (r_xy − r_xz r_yz) ÷ √((1 − r_xz²)(1 − r_yz²)).',
    'It equals the correlation of the residuals of x and y after each is fitted on the control by least squares; comparing like with like in bands shows the same idea roughly.',
    'Peak barista hours and waits correlate at +0.53 because both rise on busy days; holding transactions fixed the partial correlation is −0.72, the sign the case planted.',
    'Test a partial correlation with t = r√((n − 2 − k) ÷ (1 − r²)) on n − 2 − k degrees of freedom, k being the number of controls.',
    'Hold confounders fixed. Don’t hold a mediator fixed when you want the whole link (holding the load fixed hides the baristas’ effect), and never hold a collider fixed (it creates a link between temperature and rain).',
    'A partial correlation removes only the straight-line part of the measured controls: curves, measurement error and unmeasured drivers remain. It is still a correlation, not proof of cause.',
  ],

  glossary: [
    { term: 'Partial correlation', def: 'The correlation between two variables after the straight-line part of their links with one or more other variables has been removed: the correlation of their residuals. Written r_xy·z for one control z.' },
    { term: 'Mediator', def: 'A variable on the path between two others, through which one affects the other (x affects m, and m affects y). Holding it fixed removes the part of the link that runs through it.' },
    { term: 'Collider', def: 'A variable affected by two others. Holding it fixed, or selecting on it, creates an association between its causes even when they are unrelated.' },
    { term: 'Residual confounding', def: 'The confounding that remains after adjusting for a confounder that is measured imperfectly or held fixed only roughly, such as by a straight line or in broad bands.' },
  ],

  references: [
    { text: 'Penn State Eberly College of Science. <i>STAT 505: Applied Multivariate Statistical Analysis</i>, Lesson 6, “Multivariate Conditional Distribution and Partial Correlation” (sections 6.1–6.3).', url: 'https://online.stat.psu.edu/stat505/lesson/6', checked: '2026-10-26' },
    { text: 'Cole, S. R., Platt, R. W., Schisterman, E. F., Chu, H., Westreich, D., Richardson, D. &amp; Poole, C. (2010). “Illustrating bias due to conditioning on a collider”. <i>International Journal of Epidemiology</i>, 39(2), 417–420.', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC2846442', checked: '2026-10-26' },
    { text: 'Illowsky, B. &amp; Dean, S. <i>Introductory Statistics 2e</i>, section 12.4, “Testing the Significance of the Correlation Coefficient”. OpenStax.', url: 'https://openstax.org/books/introductory-statistics/pages/12-4-testing-the-significance-of-the-correlation-coefficient', checked: '2026-10-26' },
    { text: 'Microsoft Support. “CORREL function”.', url: 'https://support.microsoft.com/en-us/excel/correl-function', checked: '2026-10-26' },
  ],

  checks: [
    { what: 'Simple r staff–wait', value: rSW, shown: 0.53 },
    { what: 'Simple r staff–wait (3 dp)', value: rSW, shown: 0.535, tol: 0.0005 },
    { what: 'Case staffWait agrees', value: D.staffWait.r, shown: rSW, tol: 1e-12 },
    { what: 'Days', value: S.length, shown: 612 },
    { what: 'r staff–transactions', value: rST, shown: 0.926, tol: 0.0005 },
    { what: 'r wait–transactions', value: rWT, shown: 0.767, tol: 0.0005 },
    { what: 'Partial (3 dp)', value: PT.r, shown: -0.725, tol: 0.0005 },
    { what: 'Partial (2 dp)', value: PT.r, shown: -0.72 },
    { what: 'Partial by formula = by residuals', value: C.partialFromR(rSW, rST, rWT), shown: PT.r, tol: 1e-9 },
    { what: 'Case partial agrees', value: D.staffWaitGivenTrans.r, shown: PT.r, tol: 1e-12 },
    { what: 'Product rST × rWT', value: rST * rWT, shown: 0.710, tol: 0.0005 },
    { what: 'Numerator', value: rSW - rST * rWT, shown: -0.175, tol: 0.0005 },
    { what: 'Denominator', value: Math.sqrt((1 - rST ** 2) * (1 - rWT ** 2)), shown: 0.242, tol: 0.0005 },
    { what: '1 − rST²', value: 1 - rST ** 2, shown: 0.142, tol: 0.0005 },
    { what: '1 − rWT²', value: 1 - rWT ** 2, shown: 0.412, tol: 0.0005 },
    { what: 'Rounded arithmetic gives −0.725', value: (0.535 - 0.926 * 0.767) / Math.sqrt((1 - 0.926 ** 2) * (1 - 0.767 ** 2)), shown: -0.725, tol: 0.003 },
    // bands
    { what: 'Band 100–149 r', value: BANDS[1].r, shown: -0.58 },
    { what: 'Band 150–199 r', value: BANDS[2].r, shown: -0.59 },
    { what: 'Band 0–99 r', value: BANDS[0].r, shown: -0.13 },
    { what: 'Every band negative', value: Number(BANDS.every((b) => b.r < 0)), shown: 1 },
    { what: 'Quiet-day mean wait about two minutes', value: BANDS[0].wait, shown: 2, tol: 0.05 },
    { what: 'Bands cover all days', value: BANDS.reduce((s, b) => s + b.n, 0), shown: 612 },
    { what: 'Transactions below 300', value: Math.max(...T), shown: 293 },
    // test
    { what: 'df', value: PT.df, shown: 609 },
    { what: 't', value: PT.t, shown: -25.9, tol: 0.05 },
    { what: 'p below 0.001', value: Number(PT.p < 0.001), shown: 1 },
    { what: 't by the lesson formula', value: -0.725 * Math.sqrt(609 / (1 - 0.725 ** 2)), shown: -25.9, tol: 0.1 },
    // café and ranks
    { what: 'Second-order (transactions and café)', value: PTC.r, shown: -0.719, tol: 0.0005 },
    { what: 'Harbourside partial', value: cafeP(H), shown: -0.54 },
    { what: 'Millbrook partial', value: cafeP(M), shown: -0.83 },
    { what: 'Rank partial', value: PR.r, shown: -0.47 },
    { what: 'Partial given load', value: PL.r, shown: 0.07 },
    { what: 'Partial given load p', value: PL.p, shown: 0.10, tol: 0.005 },
    // mediator, collider
    { what: 'Harbourside high–sales', value: MED.r, shown: 0.40 },
    { what: 'Harbourside high–sales | footfall', value: MED.p, shown: -0.19 },
    { what: 'Harbourside high–footfall positive', value: Number(MED.foot > 0), shown: 1 },
    { what: 'Harbourside high–rain', value: COL.r, shown: 0.05 },
    { what: 'Harbourside high–rain | footfall', value: COL.part.r, shown: 0.17 },
    { what: 'Collider p', value: COL.part.p, shown: 0.004, tol: 0.0005 },
    { what: 'Rain lowers footfall at Harbourside (negative r)', value: Number(COL.rainFoot < 0), shown: 1 },
    // Swiftwing Air
    { what: 'KA numerator', value: KA.xy - KA.xz * KA.yz, shown: -0.11 },
    { what: 'KA product', value: KA.xz * KA.yz, shown: 0.51 },
    { what: 'KA 1 − 0.85²', value: 1 - KA.xz ** 2, shown: 0.2775, tol: 0.00005 },
    { what: 'KA 1 − 0.60²', value: 1 - KA.yz ** 2, shown: 0.64 },
    { what: 'KA denominator', value: Math.sqrt((1 - KA.xz ** 2) * (1 - KA.yz ** 2)), shown: 0.4214, tol: 0.00005 },
    { what: 'KA partial', value: kaP, shown: -0.261, tol: 0.0005 },
    { what: 'KA partial 2 dp', value: kaP, shown: -0.26 },
    { what: 'KA df', value: kaDf, shown: 47 },
    { what: 'KA t', value: kaT, shown: -1.85 },
    { what: 'KA p', value: kaPv, shown: 0.070, tol: 0.0005 },
    { what: 'KA p from rounded t', value: 2 * tSf(1.85, 47), shown: 0.070, tol: 0.001 },
    // other
    { what: 'Staff–sales holding transactions (not printed: sanity)', value: Number(Math.abs(PSS.r) < 0.2), shown: 1 },
    { what: 'Load is transactions × 0.55 ÷ barista hours', value: LOAD[0], shown: (T[0] * 0.55) / S[0], tol: 1e-12 },
  ],
};
