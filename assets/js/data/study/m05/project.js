// project.js — M05 applied project: Positioning Lantern's barista workshops (June 2027). Lantern runs a three-hour
// Saturday barista workshop for about 12 people at $125 a place (M01, B03). Ana surveyed 210 past attendees and
// newsletter readers about what they want from a workshop, what they would pay and how they see Lantern's workshops
// against Calder College's six-evening course, Kettle Lane Coffee Club's tasting evenings and CremaClass online. The
// student segments them, sizes and profiles the segments, scores them, builds a persona, reads the map, checks a planned
// change beyond the map, writes the positioning and recommends what to change. Every figure comes from case.js
// (WORKSHOP_* exports); `verify` recomputes them, including the worksheet formula through the spreadsheet engine.
import { WORKSHOP_OFFER as OFFER, WORKSHOP_NEEDS as NEEDS, WORKSHOP_PROVIDERS as PROVIDERS, WORKSHOP_LEVELS as LEVELS, WORKSHOP_RESPONDENTS as RESP, WORKSHOP_DERIVED as WD, WORKSHOP_STRENGTHS, tableCells } from './case.js?v=19';
import { weightedScore, distance, perceptualMap, idealDistances } from '../../../core/percmap.js?v=19';
import { mulberry32 } from '../../../core/rng.js?v=19';
import { Sheet } from '../../../core/sheet.js?v=19';

const num = (id, prompt, answer, check, solution, wrong, { unit = '', places = 2, tol = 0.005, kind = 'numerical' } = {}) =>
  ({ id, type: 'num', kind, unit, places, prompt, answer, check, tol, solution, ...(wrong ? { wrong } : {}) });
const r = (x, p = 2) => Math.round(x * 10 ** p) / 10 ** p;
const pct = (x, p = 1) => `${(x * 100).toFixed(p)}%`;
const f = (x, p = 0) => x.toLocaleString('en-US', { minimumFractionDigits: p, maximumFractionDigits: p });
const f2 = (x) => x.toFixed(2).replace('-', '−');
const sum = (xs) => xs.reduce((a, b) => a + b, 0);
const mean = (xs) => sum(xs) / xs.length;

// ---------------------------------------------------------------- segments (lettered by size, as the widget letters them)
const LET = ['A', 'B', 'C', 'D'];
const N = RESP.length, K = WD.k;
const NAMES = WD.names;                                     // Home enthusiasts, Social groups, Gift buyers, Aspiring baristas
const G = (name) => NAMES.indexOf(name);
const HOME = G('Home enthusiasts'), SOCIAL = G('Social groups'), GIFT = G('Gift buyers'), BARISTA = G('Aspiring baristas');
const SEG_CATS = ['Gift buyers', 'Aspiring baristas', 'Home enthusiasts', 'Social groups'];   // the names, not in size order
const J = (key) => NEEDS.findIndex((n) => n.key === key);
const SKILLS = J('skills'), SOC = J('social'), GIFTJ = J('gift'), CAREER = J('career'), VALUE = J('value'), SCHED = J('schedule');
const share = WD.sizes.map((s) => s / N);
const IX = WD.index.map((row) => row.map((v) => Math.round(v)));
const elbow = WD.elbow, I = (k) => elbow.find((e) => e.k === k).inertia, SIL = (k) => elbow.find((e) => e.k === k).silhouette;
const bestK = elbow.slice().sort((a, b) => b.silhouette - a.silhouette)[0].k;
const members = (g) => RESP.filter((_, i) => WD.labels[i] === g);
const AGE_N = LEVELS.age.map((_, a) => sum(WD.age.map((row) => row[a])));   // respondents in each age band
const ageTop = (g) => { const a = WD.age[g]; const k = a.indexOf(Math.max(...a)); return { band: LEVELS.age[k], share: a[k] / WD.sizes[g] }; };

// the worksheet: one row per respondent with the segment letter, age band, past attendance, willingness to pay and needs
const COLS = ['respondent', 'segment', 'age', 'attended', 'wtp', ...NEEDS.map((n) => n.key)];
const ROWS = RESP.map((p, i) => [p.id, LET[WD.labels[i]], LEVELS.age[p.age], p.past ? 'Yes' : 'No', p.wtp, ...p.needs]);
const last = N + 1;
const wsCells = tableCells(COLS, ROWS).cells;
const colOf = (name) => String.fromCharCode(65 + COLS.indexOf(name));
const WTP_C = colOf('wtp'), SEG_C = colOf('segment');
const SEG_R = `${SEG_C}2:${SEG_C}${last}`, WTP_R = `${WTP_C}2:${WTP_C}${last}`;
// the share of the segment in N1 whose stated willingness to pay is at least the price in N3
const PAY_F = `=COUNTIFS(${SEG_R},N1,${WTP_R},">="&N3)/COUNTIF(${SEG_R},N1)`;
const payShare = (g, price) => members(g).filter((p) => p.wtp >= price).length / WD.sizes[g];
const wtpOf = (g) => mean(members(g).map((p) => p.wtp));

// ---------------------------------------------------------------- the scorecard
const maxS = Math.max(...share), maxW = Math.max(...WD.wtp), maxF = Math.max(...WD.fit.map(Math.abs));
const roomScores = (dist) => { const rv = dist.map((row) => Math.min(...row.slice(1))), mx = Math.max(...rv); return { rival: rv, score: rv.map((v) => (100 * v) / mx) }; };
const ROOM2 = roomScores(WD.map.distances);                                          // nearest rival on the map
const FACT = {
  size: share.map((v) => (100 * v) / maxS),
  wtp: WD.wtp.map((v) => (100 * v) / maxW),
  fit: WD.fit.map((v) => 50 + (50 * v) / maxF),
  room: ROOM2.score,                                                                  // farther from rivals = more room
};
const FACTORS = [FACT.size, FACT.wtp, FACT.fit, FACT.room];
const W_ANA = [2, 2, 3, 2], W_EQUAL = [1, 1, 1, 1];
const score = (w, factors = FACTORS) => weightedScore(factors, w);
const top = (w, factors = FACTORS) => { const s = score(w, factors); return s.indexOf(Math.max(...s)); };
const sAna = score(W_ANA), sEq = score(W_EQUAL);
const factorsShown = FACTORS.map((F) => F.map((v) => r(v, 2)));                     // the table prints two decimals
const anaFromShown = sum(W_ANA.map((w, k) => w * factorsShown[k][GIFT])) / sum(W_ANA);

// ---------------------------------------------------------------- the map, measured on the map and in all six attributes
const MAPF = perceptualMap(WD.map.means);
const z = (p) => p.map((v, j) => (v - MAPF.mu[j]) / MAPF.sd[j]);
const d6 = (a, b) => Math.hypot(...z(a).map((v, j) => v - z(b)[j]));                // all six standardised attributes
const FULL = idealDistances(MAPF, WD.map.ideal, NEEDS.length);
const ROOM6 = roomScores(FULL);
const FACTORS6 = [FACT.size, FACT.wtp, FACT.fit, ROOM6.score];
const s6Ana = score(W_ANA, FACTORS6), s6Eq = score(W_EQUAL, FACTORS6);
const nearestOf = (g) => { const d = WD.map.distances[g]; return d.indexOf(Math.min(...d)); };
const nearestFull = (g) => FULL[g].indexOf(Math.min(...FULL[g]));
const inPlane = WD.map.ideal.map((p) => { const q = MAPF.project(p); return (q[0] ** 2 + q[1] ** 2) / z(p).reduce((a, b) => a + b * b, 0); });
// how often random ratings of four options on six attributes give a two-dimensional map as good (seeded: the same
// figures on every build), the benchmark the perceptual-maps lesson uses
const randomMaps = (nB, nA, reps, seed) => {
  const rnd = mulberry32(seed), out = [];
  for (let k = 0; k < reps; k++) { const pm = perceptualMap(Array.from({ length: nB }, () => Array.from({ length: nA }, () => 1 + 6 * rnd()))); if (!pm.error) out.push(pm.cumulative[1]); }
  out.sort((a, b) => a - b);
  return { n: out.length, mean: mean(out), p95: out[Math.floor(0.95 * out.length)], atLeast: (x) => out.filter((v) => v >= x).length / out.length };
};
const SIM = randomMaps(PROVIDERS.length, NEEDS.length, 2000, 2027);

// Ana's planned changes: gift vouchers and weekday evening sessions (which office workers asked for in M01)
const LANTERN_MEANS = WD.map.means[0];
const PLAN = LANTERN_MEANS.slice(); PLAN[GIFTJ] = 6.0; PLAN[SCHED] = 5.0;
const GIFT_ONLY = LANTERN_MEANS.slice(); GIFT_ONLY[GIFTJ] = 6.0;                    // vouchers alone
const planPt = WD.project(PLAN);
const planDist = WD.map.idealPts.map((q) => distance(planPt, q));
const nowDist = WD.map.distances.map((row) => row[0]);
const now6 = WD.map.ideal.map((id) => d6(LANTERN_MEANS, id)), plan6 = WD.map.ideal.map((id) => d6(PLAN, id)), gift6 = WD.map.ideal.map((id) => d6(GIFT_ONLY, id));
const IDEAL = WD.map.ideal;

// ---------------------------------------------------------------- the screen of positioning-statements (fictional rule)
const KL = PROVIDERS.indexOf('Kettle Lane Coffee Club'), CA = PROVIDERS.indexOf('Calder College');
const lead = (rival, j) => LANTERN_MEANS[j] - WD.map.means[rival][j];

// ---------------------------------------------------------------- economics of a workshop (B03)
const CONTRIB = OFFER.places * OFFER.price - OFFER.costPerWorkshop;               // a full workshop: $950

const profileHtml = `<div class="table-scroll"><table class="data-table study-table"><caption>The four segments (k = ${K}), lettered by size: each need’s index against the average respondent (100 = average)</caption><thead><tr><th scope="col">Segment</th><th scope="col">Respondents</th>${NEEDS.map((n) => `<th scope="col">${n.label}</th>`).join('')}</tr></thead><tbody>${LET.map((L, g) => `<tr><th scope="row">${L}</th><td class="num">${WD.sizes[g]}</td>${IX[g].map((v) => `<td class="num">${v}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
const factorHtml = `<div class="table-scroll"><table class="data-table study-table"><caption>Factor scores (0–100), room measured on the map</caption><thead><tr><th scope="col">Segment</th><th scope="col">Size</th><th scope="col">Willingness to pay</th><th scope="col">Fit</th><th scope="col">Room</th></tr></thead><tbody>${LET.map((L, g) => `<tr><th scope="row">${L}, ${NAMES[g]}</th>${factorsShown.map((F) => `<td class="num">${f2(F[g])}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
const idealHtml = `<div class="table-scroll"><table class="data-table study-table"><caption>The two target segments’ ideal ratings and Lantern Workshops’ ratings, now and with Ana’s plan (1–7; for Value, high means cheap)</caption><thead><tr><th scope="col">Attribute</th><th scope="col">Ideal: Home enthusiasts</th><th scope="col">Ideal: Gift buyers</th><th scope="col">Lantern now</th><th scope="col">Lantern planned</th></tr></thead><tbody>${NEEDS.map((n, j) => `<tr><th scope="row">${n.label}</th><td class="num">${f2(IDEAL[HOME][j])}</td><td class="num">${f2(IDEAL[GIFT][j])}</td><td class="num">${f2(LANTERN_MEANS[j])}</td><td class="num">${f2(PLAN[j])}</td></tr>`).join('')}</tbody></table></div>`;

export default {
  title: 'Positioning Lantern’s barista workshops',
  brief: [
    { case: `It is June 2027. Lantern’s barista workshop is a three-hour Saturday session for about ${OFFER.places} people at $${OFFER.price} a place, run in a hired room with Lantern’s training machine; a full one contributes about $${f(CONTRIB)} after $${OFFER.costPerWorkshop} for the room, materials and a second trainer. Lantern ran ${OFFER.held2026} workshops from March to December 2026, in person, online and hybrid; this project is about the in-person one. Ana wants to run more of them without cutting the price, but she doesn’t know who books them or why, what they should stand for against the alternatives, or what to change. Lantern, Ana, the other providers and every figure are fictional.` },
    { p: 'What you have:' },
    { list: [
      `<b>A survey</b> of ${N} people (past attendees and newsletter readers who opened the e-mail invitation; not a probability sample): how much each of six things matters in a workshop (1 not at all, 7 essential), what they would pay for a three-hour workshop, age band, whether they have attended before, their ideal workshop rated on the same six attributes, and their ratings of four options on those attributes. Most respondents haven’t taken the other three options, so their ratings of those are impressions.`,
      `<b>The six needs</b>: ${NEEDS.map((n) => `${n.label.toLowerCase()} (“${n.q}”)`).join('; ')}.`,
      `<b>The options rated</b>: ${PROVIDERS.join(', ')}. Calder College runs a six-evening course for $${OFFER.calderPrice} with a certificate at the end; Kettle Lane Coffee Club runs cheap tasting evenings for groups of friends; CremaClass is an online video course for $${OFFER.cremaPrice}, available at any time.`,
      `<b>Ana’s view of her workshops</b>: strong on hands-on skills, fun and as a gift; weak on careers (no certificate), price (far above CremaClass) and times (Saturdays only). She is thinking about two changes: gift vouchers, and weekday evening sessions, which office workers asked for (M01).`,
    ] },
  ],
  deliverables: [
    'The segmentation: the variables, the number of segments and why, and each segment’s profile and size.',
    'A weighted scorecard of the segments, with how sensitive the choice is to the weights and to how competition is measured, and a targeting strategy.',
    'A persona for the target segment, built from the data.',
    'A reading of the perceptual map, and a check of Ana’s planned changes on the map and in the full ratings.',
    'A positioning statement, the changes that would make it credible, and a memo to Ana.',
  ],
  stages: [
    {
      id: 'frame', title: 'Frame the problem',
      html: '<p>Start with the STP process: what each step decides, and what to segment on.</p>',
      items: [
        { id: 'm05-pj-1', type: 'classify', kind: 'conceptual',
          prompt: 'Which step of segmentation, targeting and positioning does each task belong to?',
          items: [
            'Group the survey’s respondents by what they want from a workshop',
            'Score each group on size, willingness to pay, fit and competition',
            'Decide what Lantern’s workshops should stand for against Calder College and Kettle Lane',
            'Write the reason the chosen group should believe Lantern’s promise',
            'Decide whether to serve one group or two, and which',
          ],
          categories: ['Segmentation', 'Targeting', 'Positioning'],
          answer: [0, 1, 2, 2, 1],
          solution: 'Segmentation finds groups that want different things; targeting evaluates them (size, value, fit, competition) and chooses how many to serve and which; positioning decides what the offer stands for in the chosen groups’ minds, including the reason to believe it.' },
        { id: 'm05-pj-2', type: 'mc', kind: 'applied',
          prompt: 'Ana’s first idea is to segment workshop customers by age band. Why segment on the six workshop needs instead?',
          options: [
            'Needs explain why people book, which the offer and its message must answer; age only describes who books',
            `Age bands would give segments too small to be substantial, since only ${N} people answered the survey`,
            'Needs-based segments are usually easier to reach through media than age groups, so they cost Lantern less to target',
            'Lantern’s rivals already segment by age, so an age-based segmentation would make Lantern’s workshops look like theirs',
          ],
          answer: 0,
          feedback: {
            1: `Size isn’t the reason: a segment is worth having for what its members want, and age doesn’t say why anyone books. (The age bands would hold ${Math.min(...AGE_N)} to ${Math.max(...AGE_N)} respondents each.)`,
            2: 'The reverse is usually true: needs-based segments are harder to reach, so you profile them with demographics and channels afterwards.',
            3: 'What rivals segment on doesn’t decide the base; what explains why people book does.',
          },
          solution: 'A needs-based (benefit) segmentation groups people by what they want from the offer, which is what product, price and message decisions must answer. Demographics then describe the segments so Lantern can find and reach them.' },
      ],
    },
    {
      id: 'segment', title: 'Segment the respondents',
      html: `<p>The tool runs k-means on the six needs, standardised, for k = 2 to 6. Segments are lettered by size, largest first.</p>`,
      tool: { kind: 'widget', widget: { type: 'cluster', title: 'Workshop needs survey, June 2027', rows: RESP.map((p) => p.needs), vars: NEEDS.map((n) => n.label), k: 4, ks: [2, 3, 4, 5, 6] } },
      items: [
        { id: 'm05-pj-3', type: 'mc', kind: 'applied',
          prompt: 'From the elbow, the silhouette and what the segments mean, how many segments should Ana use?',
          options: [
            `${bestK}: the elbow bends there, the silhouette peaks there, and each of the four segments has a clear profile`,
            `2: the silhouette is close to its peak there, and two segments are the easiest for a small business to serve`,
            `6: the within-cluster sum of squares is lowest there, so those segments fit the respondents’ answers best`,
            `5: one more than the elbow suggests, in case a small but valuable segment is hiding inside a larger one`,
          ],
          answer: 0,
          feedback: {
            1: `Two segments merge groups with different needs, and its silhouette (${SIL(2).toFixed(3)}) is below k = ${bestK}’s (${SIL(bestK).toFixed(3)}).`,
            2: 'The within-cluster sum of squares falls as k rises, so its lowest value is at the largest k tried. Look for where the fall flattens.',
            3: `Adding a segment “to be safe” splits a real segment: k = 5’s silhouette (${SIL(5).toFixed(3)}) is lower, and the extra segment adds little.`,
          },
          solution: `The within-cluster sum of squares falls by ${f(I(3) - I(4), 1)} from k = 3 to 4 but only ${f(I(4) - I(5), 1)} from 4 to 5, so the elbow is at 4, where the silhouette is also highest (${SIL(4).toFixed(3)}). The four profiles are distinct and easy to name.` },
        { id: 'm05-pj-4', type: 'classify', kind: 'applied',
          prompt: `Name each segment from its profile (index against the average respondent, 100 = average): ${LET.map((L, g) => `${L}: ${NEEDS.map((n, j) => `${n.label.toLowerCase()} ${IX[g][j]}`).join(', ')}`).join('. ')}.`,
          items: LET.map((L) => `Segment ${L}`),
          categories: SEG_CATS,
          answer: LET.map((_, g) => SEG_CATS.indexOf(NAMES[g])),
          solution: `${LET.map((L, g) => `${L}, ${NAMES[g]}: highest index on ${NEEDS[IX[g].indexOf(Math.max(...IX[g]))].label.toLowerCase()} (${Math.max(...IX[g])})`).join('; ')}. A name should come from the segment’s highest indexes and promise no more than the profile shows.` },
      ],
    },
    {
      id: 'profile', title: 'Profile and size the segments',
      html: `${profileHtml}<p>What people say they would pay is a stated answer, and stated answers overstate what people go on to pay (M04): Aspiring baristas name $${f(WD.wtp[BARISTA], 0)} on average for three hours, more than Calder College charges for six evenings. Use it to compare segments, not to set a price.</p><p>The worksheet has one row per respondent: the segment letter, age band, whether they have attended before, what they say they would pay for a three-hour workshop ($) and the six ratings. N1 holds a segment letter and N3 a price.</p>`,
      items: [
        { id: 'm05-pj-5', type: 'formula', kind: 'applied',
          prompt: 'In N2, calculate the share of the segment in N1 who say they would pay at least the price in N3, in a formula that still works if N1 or N3 changes.',
          sheet: { cells: { ...wsCells, M1: 'Segment', N1: LET[HOME], M2: 'Would pay the price', M3: 'Price ($)', N3: OFFER.price }, vary: { N1: LET.filter((_, g) => g !== HOME), N3: [100, 150] } },
          cell: 'N2', view: `A1:N${last}`, maxHeight: '20rem', widths: { A: 11, C: 9, D: 9, M: 18, N: 10 }, formats: { N2: '0.0%' },
          answer: PAY_F,
          alt: [`=COUNTIFS(${SEG_R},N1,${WTP_R},">="&N3)/COUNTIFS(${SEG_R},N1)`, `=COUNTIFS(${SEG_C}:${SEG_C},N1,${WTP_C}:${WTP_C},">="&N3)/COUNTIF(${SEG_C}:${SEG_C},N1)`],
          wrong: [
            { formula: `=COUNTIFS(${SEG_R},N1,${WTP_R},">="&N3)/COUNT(${WTP_R})`, say: 'That divides by all respondents, so it is a share of the survey. Divide by the number in the segment, COUNTIF on the segment column.' },
            { formula: `=COUNTIFS(${SEG_R},N1,${WTP_R},">"&N3)/COUNTIF(${SEG_R},N1)`, say: 'That leaves out people who would pay exactly the price. “At least” is <x>>=</x>.' },
            { formula: `=COUNTIFS(${SEG_R},N1,${WTP_R},">=${OFFER.price}")/COUNTIF(${SEG_R},N1)`, say: 'The price is typed in, so the formula won’t follow N3. Join the operator to the cell: <x>">="&N3</x>.' },
            { formula: `=COUNTIFS(${WTP_R},N1,${SEG_R},">="&N3)/COUNTIF(${SEG_R},N1)`, say: 'Each criteria range must sit before its own criterion: the segment column goes with N1, the willingness-to-pay column with <x>">="&N3</x>.' },
          ],
          solution: `<x>${PAY_F}</x>. At $${OFFER.price}: ${LET.map((L, g) => `${L} ${pct(payShare(g, OFFER.price))}`).join(', ')}. Most of every segment except ${LET[SOCIAL]} says it would pay the price; in ${LET[SOCIAL]} only ${pct(payShare(SOCIAL, OFFER.price))} do (mean $${f(wtpOf(SOCIAL), 2)}). These are stated answers, so read them as a ranking, not a forecast.` },
        num('m05-pj-6', `What share of the ${N} respondents is in the Gift buyers segment? Give a percentage to one decimal place.`, r(share[GIFT] * 100, 1), () => (WD.sizes[GIFT] / N) * 100,
          `${WD.sizes[GIFT]} ÷ ${N} = ${pct(share[GIFT])}. A share of this survey, not of Harbour City: the respondents are people already on Lantern’s list who chose to answer.`,
          [{ value: r((WD.sizes[GIFT] / Math.max(...WD.sizes)) * 100, 1), say: 'That divides by the largest segment. Divide by all respondents.' }],
          { unit: '%', places: 1, tol: 0.06 }),
        { id: 'm05-pj-7', type: 'multi', kind: 'conceptual',
          prompt: 'Select every statement the profiles and sizes support.',
          options: [
            `Social groups say they would pay $${f(WD.wtp[SOCIAL], 2)} on average, below Lantern’s $${OFFER.price}, so the current offer looks dear to them`,
            `Fewer than a third of Gift buyers (${pct(WD.past[GIFT], 0)}) have attended before, so they are mostly new to Lantern’s workshops`,
            `Aspiring baristas say they would pay $${f(WD.wtp[BARISTA], 2)} on average, so Lantern should raise the price of every workshop`,
            `Home enthusiasts are ${pct(share[HOME], 0)} of Harbour City’s coffee drinkers who want a workshop`,
            `Home enthusiasts are the largest segment, and more than half of them (${pct(WD.past[HOME], 0)}) have attended before`,
          ],
          answer: [0, 1, 4],
          feedback: {
            2: 'One segment’s stated willingness to pay doesn’t set the price for the others, and stated answers overstate: raising every price would lose Social groups and probably some Home enthusiasts.',
            3: 'The survey covers people on Lantern’s list who answered an e-mail, not the city: its shares are shares of respondents.',
          },
          solution: 'The profiles support statements about these respondents: who says they would pay what, who is new. They don’t give population shares (an e-mail survey of Lantern’s list), and one segment’s stated willingness to pay doesn’t set the price for all.' },
      ],
    },
    {
      id: 'target', title: 'Score and choose',
      html: `<p>Ana scores each segment from 0 to 100 on four factors, each against the best segment: <b>size</b> (share of respondents), <b>willingness to pay</b> (stated, so it ranks segments rather than measuring them), <b>fit</b> with her workshops’ strengths (50 = average, from each segment’s standardised needs against Ana’s view: +1 for skills, social and gift, −1 for career, price and times) and <b>room</b> (how far the segment’s ideal point is from the nearest rival on the map). Her weights are size ${W_ANA[0]}, willingness to pay ${W_ANA[1]}, fit ${W_ANA[2]}, room ${W_ANA[3]}.</p>${factorHtml}<p>Three cautions. Size comes from a survey of Lantern’s own list, which over-represents people who already come: ${pct(WD.past[HOME], 0)} of Home enthusiasts have attended, against ${pct(WD.past[GIFT], 0)} of Gift buyers. Fit uses Ana’s view, and the ratings don’t all agree with it: respondents rate Calder College above Lantern on hands-on skills (${f2(WD.map.means[CA][SKILLS])} against ${f2(LANTERN_MEANS[SKILLS])}) and Kettle Lane above it on social (${f2(WD.map.means[KL][SOC])} against ${f2(LANTERN_MEANS[SOC])}). And room measures how far the nearest rival is, not whether Lantern is nearer: Home enthusiasts’ ideal is far from every option, Lantern included.</p>`,
      items: [
        num('m05-pj-8', 'What is Gift buyers’ weighted score with Ana’s weights? Give one decimal place.', r(sAna[GIFT], 1), () => score(W_ANA)[GIFT],
          `(${W_ANA.map((w, k) => `${w} × ${f2(factorsShown[k][GIFT])}`).join(' + ')}) ÷ ${sum(W_ANA)} = ${f2(sum(W_ANA.map((w, k) => w * factorsShown[k][GIFT])))} ÷ ${sum(W_ANA)} = ${f2(anaFromShown)}, or ${anaFromShown.toFixed(1)}.`,
          [{ value: r(sEq[GIFT], 1), say: 'That gives every factor the same weight. Use Ana’s weights.' }, { value: r(sum(W_ANA.map((w, k) => w * FACTORS[k][GIFT])), 1), say: 'That is the weighted sum. Divide by the total of the weights.' }],
          { places: 1, tol: 0.1 }),
        { id: 'm05-pj-9', type: 'mc', kind: 'applied',
          prompt: `With Ana’s weights Gift buyers score ${sAna[GIFT].toFixed(1)} and Home enthusiasts ${sAna[HOME].toFixed(1)}. With every weight equal, Home enthusiasts score ${sEq[HOME].toFixed(1)} and Gift buyers ${sEq[GIFT].toFixed(1)}. What should Ana conclude?`,
          options: [
            'The scorecard can’t settle it: the choice turns on how much fit should count against size, her call to argue',
            'Gift buyers win, because Ana’s own weights are the ones that count, and with them her scorecard has a clear winner',
            'Home enthusiasts probably win, because equal weights are the more neutral way to combine factors on different scales',
            'Neither segment is worth serving yet, because a scorecard whose winner changes with the weights is unreliable',
          ],
          answer: 0,
          feedback: {
            1: `A lead of ${(sAna[GIFT] - sAna[HOME]).toFixed(1)} points that reverses with a different reasonable set of weights is not a clear winner.`,
            2: 'Equal weights are a choice too: they say size matters as much as fit. No weighting is free of judgement.',
            3: 'A scorecard’s sensitivity is information, not a failure: it shows which judgement decides the choice.',
          },
          solution: `The winner flips with the weights: Ana’s weights favour Gift buyers (${sAna[GIFT].toFixed(1)} against ${sAna[HOME].toFixed(1)}), equal weights Home enthusiasts (${sEq[HOME].toFixed(1)} against ${sEq[GIFT].toFixed(1)}). How room is measured matters as well: in all six standardised attributes the nearest rivals are ${NAMES.map((n, g) => `${f2(ROOM6.rival[g])} from ${n}`).join(', ')}, room becomes ${NAMES.map((n, g) => `${ROOM6.score[g].toFixed(1)} for ${n}`).join(', ')}, and Gift buyers lead under both weightings (${s6Ana[GIFT].toFixed(1)} against ${s6Ana[HOME].toFixed(1)}; ${s6Eq[GIFT].toFixed(1)} against ${s6Eq[HOME].toFixed(1)}). The scorecard narrows the field to two; the decision is a judgement Ana should state and defend.` },
        { id: 'm05-pj-10', type: 'mc', kind: 'applied',
          prompt: 'Which targeting strategy fits Lantern’s workshops best?',
          options: [
            'Concentrate on Aspiring baristas, who say they would pay the most, and compete with Calder College on certificates',
            'Serve Home enthusiasts and Gift buyers with the core workshop plus a gift version; leave the rest to rivals',
            'Offer one workshop to everyone at one price, since all four segments want to learn something more about coffee',
            'Serve all four segments from next season, each with its own workshop, its own price and its own schedule',
          ],
          answer: 1,
          feedback: {
            0: 'They say they would pay most, but they want a qualification Lantern doesn’t offer, and Calder College sits nearest their ideal: the poorest fit of the four.',
            2: `An undifferentiated offer ignores that Social groups find $${OFFER.price} dear and Aspiring baristas want a certificate: it would fit no one well.`,
            3: 'Four offers would stretch a business that runs one Saturday workshop at a time with one training machine, and two of the segments fit Lantern poorly.',
          },
          solution: 'A differentiated strategy on the two segments that score well: the hands-on workshop Home enthusiasts already buy, plus a gift version (vouchers valid for a year, booked as a present) for Gift buyers. Social groups (price) and Aspiring baristas (certificates) are better served by Kettle Lane and Calder College.' },
      ],
    },
    {
      id: 'persona', title: 'Build a persona',
      html: `<p>Gift buyers (segment ${LET[GIFT]}): ${WD.sizes[GIFT]} respondents; say they would pay $${WD.wtp[GIFT].toFixed(2)} on average; ${pct(WD.past[GIFT], 0)} have attended before; age bands ${LEVELS.age.map((a, k) => `${a} ${WD.age[GIFT][k]}`).join(', ')}; highest index: gift ${IX[GIFT][GIFTJ]} (social ${IX[GIFT][SOC]} is about average).</p>`,
      items: [
        { id: 'm05-pj-11', type: 'multi', kind: 'applied',
          prompt: 'Ana drafts a persona for Gift buyers. Which details are supported by the survey data? Select all that apply.',
          options: [
            'Buys a workshop mainly as a present for someone else',
            `Says they would pay about $${Math.round(WD.wtp[GIFT] / 5) * 5} for a three-hour workshop`,
            `${pct(ageTop(GIFT).share, 0)} are aged ${ageTop(GIFT).band}, the largest band, and about three in four haven’t been to a Lantern workshop`,
            'Drives a hybrid car and reads lifestyle magazines at the weekend',
            'Has two children and works as a teacher in the North of the city',
            'Wants a barista certificate to help find work in a café',
          ],
          answer: [0, 1, 2],
          feedback: {
            3: 'Nothing in the survey says so: invented details make a persona vivid and wrong.',
            4: 'The survey didn’t ask about children, jobs or where people live: these are invented.',
            5: `That is Aspiring baristas (career index ${IX[BARISTA][CAREER]}); Gift buyers rate career below average (${IX[GIFT][CAREER]}).`,
          },
          solution: `A persona should be real data given a face, not a story: the gift motive (index ${IX[GIFT][GIFTJ]}), what they say they would pay, the age bands given as shares (${pct(ageTop(GIFT).share, 0)} aged ${ageTop(GIFT).band}) and the fact that ${pct(1 - WD.past[GIFT], 0)} are new to Lantern. Details the survey didn’t measure belong in follow-up interviews, not in the persona.` },
      ],
    },
    {
      id: 'map', title: 'Read the map and check the plan',
      html: `<p>The map places the four options by their average ratings on the six attributes; the rings are the four segments’ ideal workshops, also rated on the six attributes (a segment that cares little about an attribute rates its ideal low on it). You can plan a new position for Lantern Workshops with the sliders (the axes stay where the ratings put them).</p><p>For the last question in this stage: the two target segments’ ideal ratings, and Lantern’s ratings now and with Ana’s plan.</p>${idealHtml}`,
      tool: { kind: 'widget', widget: { type: 'percmap', title: 'Barista workshops in Harbour City, June 2027', brands: PROVIDERS, means: WD.map.means, attributes: NEEDS.map((n) => n.label), ideals: NAMES.map((nm, g) => ({ name: nm, profile: WD.map.ideal[g] })), highlight: PROVIDERS[0], move: true, noun: ['option', 'options'] } },
      items: [
        { id: 'm05-pj-12', type: 'mc', kind: 'conceptual',
          prompt: `The map’s two dimensions carry ${pct(WD.map.cumulative[1], 0)} of the differences between the four options. How much should that reassure Ana?`,
          options: [
            `Only partly: four options give a high share easily (random ratings average ${pct(SIM.mean, 0)}), and ideal points can sit off the map`,
            'A great deal: above 80%, the map shows the four options very much as Harbour City’s workshop customers see them',
            'Not much, because a perceptual map is only trustworthy when its two dimensions carry less than half of the differences',
            `A great deal, because all ${N} respondents rated all four options on all six attributes, so nothing is missing`,
          ],
          answer: 0,
          feedback: {
            1: `A high share means little is lost in two dimensions, but with four options it comes easily (random ratings average ${pct(SIM.mean, 0)}), and it says nothing about whether the attributes asked were the right ones.`,
            2: 'There is no such rule: a low share would be the worry.',
            3: 'Everyone rated every option, but most respondents haven’t taken the other three, so those ratings are impressions; and the respondents are Lantern’s list, not every workshop customer.',
          },
          solution: `In 2,000 maps of random ratings for four options on six attributes, two dimensions carried ${pct(SIM.mean, 1)} on average, the top 5% above ${pct(SIM.p95, 1)}, and ${pct(SIM.atLeast(WD.map.cumulative[1]), 1)} reached this map’s ${pct(WD.map.cumulative[1], 1)}. So the map shows more than chance, but four options set a high bar: random ratings already average ${pct(SIM.mean, 0)}. It is also a share of the options’ ratings, not of the segments’ ideal points: only ${pct(inPlane[HOME], 0)} of Home enthusiasts’ ideal (its squared standardised distance from the centre) and ${pct(inPlane[GIFT], 0)} of Gift buyers’ lie in the map’s plane. Measured in all six attributes, Lantern is still the nearest option to both (${f2(FULL[HOME][0])} and ${f2(FULL[GIFT][0])}, against ${f2(nowDist[HOME])} and ${f2(nowDist[GIFT])} on the map). Read the map for its pattern, and check anything that matters in the full ratings.` },
        { id: 'm05-pj-13', type: 'mc', kind: 'applied',
          prompt: 'Which option sits nearest each of the two segments Lantern is considering?',
          options: [
            `Gift buyers: ${PROVIDERS[nearestOf(GIFT)]}; Home enthusiasts: ${PROVIDERS[nearestOf(HOME)]}, with ${PROVIDERS[CA]} close behind`,
            `Gift buyers: ${PROVIDERS[KL]}; Home enthusiasts: ${PROVIDERS[CA]}, a little ahead of Lantern Workshops`,
            `Gift buyers: ${PROVIDERS[3]}; Home enthusiasts: ${PROVIDERS[0]}, well ahead of every rival`,
            `Both segments: ${PROVIDERS[KL]}, whose low price and evening times suit both kinds of buyer`,
          ],
          answer: 0,
          feedback: {
            1: `Kettle Lane is nearest Social groups (${f2(WD.map.distances[SOCIAL][KL])}); for Gift buyers Lantern is nearer (${f2(WD.map.distances[GIFT][0])} against ${f2(WD.map.distances[GIFT][KL])}), and for Home enthusiasts Lantern edges Calder (${f2(WD.map.distances[HOME][0])} against ${f2(WD.map.distances[HOME][CA])}).`,
            2: `CremaClass is the farthest option from Gift buyers (${f2(WD.map.distances[GIFT][3])}), and Home enthusiasts’ ideal is ${f2(WD.map.distances[HOME][0])} from Lantern and ${f2(WD.map.distances[HOME][CA])} from Calder College: hardly well ahead.`,
            3: 'Price and times matter to Social groups, but Gift buyers’ ideal is closest to Lantern’s giftable workshop.',
          },
          solution: `Distances on the map from each ideal: Gift buyers ${PROVIDERS.map((p, b) => `${p} ${f2(WD.map.distances[GIFT][b])}`).join(', ')}; Home enthusiasts ${PROVIDERS.map((p, b) => `${p} ${f2(WD.map.distances[HOME][b])}`).join(', ')}. Lantern is nearest both, but Calder College contests Home enthusiasts.` },
        num('m05-pj-14', `Ana’s plan is gift vouchers and weekday evening sessions. Suppose they lift Lantern’s average gift rating from ${f2(LANTERN_MEANS[GIFTJ])} to 6.0 and its schedule rating from ${f2(LANTERN_MEANS[SCHED])} to 5.0, with everything else unchanged. Set the sliders, then give the planned position’s distance on the map from Gift buyers’ ideal point, to two decimal places.`,
          r(planDist[GIFT], 2), () => distance(WD.project(PLAN), WD.map.idealPts[GIFT]),
          `The planned point is (${f2(planPt[0])}, ${f2(planPt[1])}), ${f2(planDist[GIFT])} from Gift buyers’ ideal against ${f2(nowDist[GIFT])} now, and ${f2(planDist[HOME])} from Home enthusiasts’ (now ${f2(nowDist[HOME])}). On the map the plan looks good for both; the next question checks it.`,
          [{ value: r(nowDist[GIFT], 2), say: 'That is today’s distance. Move both sliders first.' }],
          { places: 2, tol: 0.03, kind: 'applied' }),
        { id: 'm05-pj-15', type: 'mc', kind: 'applied',
          prompt: 'Before recommending the plan, Ana’s analyst checks it in all six attributes, using the table of ideal and planned ratings above the map. What does the check show?',
          options: [
            `It takes Lantern farther from both ideals (Gift buyers ${f2(now6[GIFT])} to ${f2(plan6[GIFT])}; Home enthusiasts ${f2(now6[HOME])} to ${f2(plan6[HOME])}): evenings overshoot Gift buyers’ ideal`,
            `It moves Lantern nearer both ideals (Gift buyers ${f2(nowDist[GIFT])} to ${f2(planDist[GIFT])} on the map): with ${pct(WD.map.cumulative[1], 0)} of the differences on the map, its distances are the full ones`,
            `It helps Gift buyers (gift rating nearer their ${f2(IDEAL[GIFT][GIFTJ])}) but moves Lantern away from Home enthusiasts, whose ideal gift rating is only ${f2(IDEAL[HOME][GIFTJ])}`,
            'It can’t be judged from these ratings, because ideal points are averages of what people say they want, not of what they buy',
          ],
          answer: 0,
          feedback: {
            1: `The ${pct(WD.map.cumulative[1], 0)} is a share of the options’ ratings, not of the ideal points, so distances to the ideals can differ off the map. In all six attributes the plan is ${f2(plan6[GIFT])} from Gift buyers’ ideal, farther than today’s ${f2(now6[GIFT])}.`,
            2: `Half right: Home enthusiasts do move away. But Gift buyers do too (${f2(now6[GIFT])} to ${f2(plan6[GIFT])}), because their ideal schedule is ${f2(IDEAL[GIFT][SCHED])} and the evenings push Lantern to 5.0.`,
            3: 'Stated ideals are imperfect, but they are what the plan is meant to move towards, and they give a clear answer here.',
          },
          solution: `In all six standardised attributes the plan is farther from both ideals: Gift buyers ${f2(now6[GIFT])} to ${f2(plan6[GIFT])}, Home enthusiasts ${f2(now6[HOME])} to ${f2(plan6[HOME])}. Gift buyers’ ideal schedule is ${f2(IDEAL[GIFT][SCHED])} (index ${IX[GIFT][SCHED]}), so 5.0 overshoots it; evenings matter to Social groups (${IX[SOCIAL][SCHED]}) and Aspiring baristas (${IX[BARISTA][SCHED]}), the segments Lantern isn’t targeting. The map hid this because only ${pct(inPlane[GIFT], 0)} and ${pct(inPlane[HOME], 0)} of the two ideals lie in its plane. Vouchers alone would bring Lantern slightly nearer Gift buyers (${f2(gift6[GIFT])}) but take it farther from Home enthusiasts (${f2(gift6[HOME])}), whose ideal gift rating is ${f2(IDEAL[HOME][GIFTJ])}: so offer the gift version alongside the core workshop rather than reshaping the core. Check a planned move in the full ratings before trusting the picture.` },
      ],
    },
    {
      id: 'position', title: 'Write the positioning',
      html: '<p>A positioning statement names the target, the frame of reference, the point of difference and the reason to believe it; the points of parity are named alongside it.</p>',
      items: [
        { id: 'm05-pj-16', type: 'classify', kind: 'conceptual',
          prompt: 'Classify each part of Ana’s draft positioning for the gift version of the workshop.',
          items: [
            'People looking for a memorable present for a coffee lover',
            'Hands-on barista workshops in Harbour City',
            'Real espresso and milk skills on professional machines, as the courses it competes with teach',
            'Designed as a gift: a voucher valid for a year and a bag of Lantern’s own beans to take home',
            'Its trainers are the baristas who run Lantern’s catering, and every voucher comes with a bag of the beans Lantern sells in its cafés',
          ],
          categories: ['Target', 'Frame of reference', 'Point of parity', 'Point of difference', 'Reason to believe'],
          answer: [0, 1, 2, 3, 4],
          solution: 'Target: who it is for. Frame of reference: the category it competes in, which tells customers what to compare it with. Point of parity: what it must match the rivals on to be considered. Point of difference: what it alone offers that the target values. Reason to believe: the evidence that makes the difference credible.' },
        { id: 'm05-pj-17', type: 'mc', kind: 'applied',
          prompt: `Using the screen from Positioning statements (an attribute matters if the target’s index is at least 110; a lead of 0.5 rating points or more over the nearest rival is a difference), which point of difference is strongest for Gift buyers against ${PROVIDERS[KL]}?`,
          options: [
            'Vouchers valid for a year, booked as a present, with a bag of Lantern’s beans to take home',
            `Gift cards at 20% off when someone books two places, to undercut ${PROVIDERS[KL]}’s tasting evenings`,
            'A recognised barista certificate at the end, to help people find work in cafés across Harbour City',
            'Sessions at any time of day or night, so whoever receives the present can fit it in easily',
          ],
          answer: 0,
          feedback: {
            1: `Gift buyers rate price below average (index ${IX[GIFT][VALUE]}) and Kettle Lane is cheaper anyway (rated ${f2(WD.map.means[KL][VALUE])} on value against Lantern’s ${f2(LANTERN_MEANS[VALUE])}): a discount gives away margin for little.`,
            2: `A certificate is what Aspiring baristas want (career index ${IX[BARISTA][CAREER]}); Gift buyers rate it low (${IX[GIFT][CAREER]}), and Lantern can’t credibly offer one.`,
            3: `Any-time access is what CremaClass offers, and Gift buyers rate times below average (index ${IX[GIFT][SCHED]}).`,
          },
          solution: `Gift is the one attribute that clears the screen for Gift buyers (index ${IX[GIFT][GIFTJ]}), and Lantern leads ${PROVIDERS[KL]} on it by ${f2(lead(KL, GIFTJ))} points. Social (index ${IX[GIFT][SOC]}) doesn’t clear it, and Kettle Lane leads there anyway (by ${f2(-lead(KL, SOC))}), so “sociable” is not a difference to claim. The gift offer is relevant, distinct, credible (Lantern’s trainers run its catering and it already sells beans) and can be consistent, if the vouchers, the booking page and the session all say gift: M01’s four tests.` },
      ],
    },
    {
      id: 'memo', title: 'Write Ana’s memo',
      html: '<p>Bring it together: who the workshops are for, what they should stand for, and what to change first.</p>',
      items: [
        { id: 'm05-pj-18', type: 'short', kind: 'applied',
          prompt: 'Write Ana a memo of 250–350 words: the segments and why four, your target and strategy with the scorecard’s sensitivity, a persona in two sentences, where Lantern sits on the map and what the check of her plan showed, a positioning statement, and the first two changes to make with how you would know they worked.',
          rubric: [
            'Segments: four needs-based segments (elbow and silhouette agree at four), named from their profiles, sized as shares of respondents on Lantern’s list (not of the city).',
            `Targeting: the scorecard puts Gift buyers (${sAna[GIFT].toFixed(1)}) and Home enthusiasts (${sAna[HOME].toFixed(1)}) close together; the winner flips with the weights, and with room measured in six attributes Gift buyers lead under both; the choice is argued, not read off.`,
            `Persona built only from the data (gift motive, a stated willingness to pay of about $${Math.round(WD.wtp[GIFT] / 5) * 5}, mostly new to Lantern, age bands as shares).`,
            `Map: Lantern nearest both target segments, Calder College contesting Home enthusiasts; a high two-dimensional share is easy with four options (random ratings average about ${pct(SIM.mean, 0)}); the vouchers-and-evenings plan looked better on the map but is worse in all six attributes.`,
            'A positioning statement (target, frame of reference, point of difference, reason to believe), with the points of parity named; changes that make it credible (a gift version with vouchers, not weekday evenings for this target) with measures (voucher sales, bookings from new customers, gift ratings in a repeat survey).',
          ],
          model: `<b>To:</b> Ana · <b>Re:</b> who the workshops are for<br><br><b>Segments.</b> The ${N} replies split into four groups by what they want: Home enthusiasts (${WD.sizes[HOME]}), Social groups (${WD.sizes[SOCIAL]}), Gift buyers (${WD.sizes[GIFT]}) and Aspiring baristas (${WD.sizes[BARISTA]}); the elbow and the silhouette both point to four. These are shares of people on our list who answered, which favours people who already come, not shares of the city.<br><br><b>Target.</b> Gift buyers and Home enthusiasts score almost level (${sAna[GIFT].toFixed(1)} and ${sAna[HOME].toFixed(1)} on your weights; equal weights reverse the order), so I recommend serving both: the core hands-on workshop for Home enthusiasts and a gift version for Gift buyers. Social groups find $${OFFER.price} dear and Aspiring baristas want a certificate we can’t give.<br><br><b>Persona.</b> “The gift giver” buys a workshop as a present for a coffee lover and says they would pay about $${Math.round(WD.wtp[GIFT] / 5) * 5}. Three in four have never been to one of our workshops.<br><br><b>Map.</b> We sit nearest both segments’ ideals, though Calder College is almost as near Home enthusiasts. Vouchers plus weekday evenings look better on the map but are worse in the full ratings: Gift buyers don’t want evenings, and the map hid it.<br><br><b>Positioning.</b> For people looking for a memorable present for a coffee lover, Lantern’s workshop is the hands-on barista class designed as a gift, with a voucher valid for a year and a bag of the beans we sell, because our trainers are the baristas who run our catering. Real espresso skills are our point of parity.<br><br><b>Next.</b> Launch vouchers for the gift version; leave weekday evenings for a separate test with office workers. Measure voucher sales, how many bookings come from new customers, and the gift rating in a repeat survey in six months.` },
      ],
    },
  ],
  rubric: [
    'The segmentation is needs-based, its number of segments is justified by more than one criterion, and segments are named and sized honestly.',
    'Targeting weighs attractiveness and fit, shows the scorecard’s sensitivity, and chooses a strategy that suits Lantern’s resources.',
    'The persona contains only what the data support, with stated answers treated as stated.',
    'The map is read for its pattern with its limits stated, and a planned change is checked in the full ratings, not only on the map.',
    'The positioning statement is complete and credible, and the recommended changes come with measures.',
  ],
  verify() {
    const sh = (seg, price) => new Sheet({ cells: { ...wsCells, N1: LET[seg], N3: price, N2: PAY_F } }).get('N2');
    return [
      ['segments k', K, 4], ['sizes', WD.sizes.join(), '72,52,51,35'], ['names', NAMES.join(), 'Home enthusiasts,Social groups,Gift buyers,Aspiring baristas'],
      ['each name is its segment’s highest index', NAMES.map((n, g) => NEEDS[IX[g].indexOf(Math.max(...IX[g]))].key).join(), 'skills,social,gift,career'],
      ['best silhouette at 4', bestK, 4], ['elbow drop 3→4 over 3× 4→5', I(3) - I(4) > 3 * (I(4) - I(5)) ? 1 : 0, 1],
      ['pay-share formula, Home at $125', sh(HOME, OFFER.price), payShare(HOME, OFFER.price), 1e-9], ['pay-share formula, Social at $150', sh(SOCIAL, 150), payShare(SOCIAL, 150), 1e-9],
      ['pay-share Home', payShare(HOME, 125), 0.694, 0.0005], ['pay-share Social', payShare(SOCIAL, 125), 0.096, 0.0005], ['pay-share Gift', payShare(GIFT, 125), 0.784, 0.0005], ['pay-share Aspiring', payShare(BARISTA, 125), 0.971, 0.0005],
      ['WTP Aspiring baristas', WD.wtp[BARISTA], 238, 0.01], ['Aspiring baristas name more than Calder charges', WD.wtp[BARISTA] > OFFER.calderPrice ? 1 : 0, 1],
      ['Gift buyers share', share[GIFT], 0.2429, 0.00005], ['Gift buyers past share', WD.past[GIFT], 0.2353, 0.00005], ['Gift buyers aged 30–44', ageTop(GIFT).share, 21 / 51, 1e-9],
      ['score Gift (Ana)', sAna[GIFT], 77.35, 0.005], ['score Home (Ana)', sAna[HOME], 76.02, 0.005], ['score Home (equal)', sEq[HOME], 78.88, 0.005], ['score Gift (equal)', sEq[GIFT], 75.94, 0.005],
      ['score from the two-decimal table rounds the same', r(anaFromShown, 1), r(sAna[GIFT], 1)], ['winner Ana', NAMES[top(W_ANA)], 'Gift buyers'], ['winner equal', NAMES[top(W_EQUAL)], 'Home enthusiasts'],
      ['6-D room', ROOM6.score.map((v) => v.toFixed(1)).join(), '100.0,25.7,93.5,57.1'], ['6-D: Gift leads with Ana’s weights', NAMES[top(W_ANA, FACTORS6)], 'Gift buyers'], ['6-D: Gift leads with equal weights', NAMES[top(W_EQUAL, FACTORS6)], 'Gift buyers'],
      ['map 2D share', WD.map.cumulative[1], 0.978, 0.0005], ['random 4×6 maps: mean', SIM.mean, 0.874, 0.0005],
      ['nearest to Gift', PROVIDERS[nearestOf(GIFT)], PROVIDERS[0]], ['nearest to Home', PROVIDERS[nearestOf(HOME)], PROVIDERS[0]],
      ['6-D: Lantern still nearest Home and Gift', [nearestFull(HOME), nearestFull(GIFT)].join(), '0,0'],
      ['plan distance to Gift on the map', planDist[GIFT], 0.64, 0.005], ['plan nearer both on the map', planDist[HOME] < nowDist[HOME] && planDist[GIFT] < nowDist[GIFT] ? 1 : 0, 1],
      ['plan farther from both in six attributes', plan6[HOME] > now6[HOME] && plan6[GIFT] > now6[GIFT] ? 1 : 0, 1], ['six-attribute distances', [now6[GIFT], plan6[GIFT], now6[HOME], plan6[HOME]].map(f2).join(), '1.41,1.63,1.90,2.17'],
      ['vouchers alone: nearer Gift, farther from Home', gift6[GIFT] < now6[GIFT] && gift6[HOME] > now6[HOME] ? 1 : 0, 1],
      ['Gift buyers’ ideal schedule below 5', IDEAL[GIFT][SCHED] < 5 ? 1 : 0, 1], ['social below the 110 screen for Gift buyers', IX[GIFT][SOC] < 110 ? 1 : 0, 1], ['Lantern leads Kettle Lane on gift by 0.5+', lead(KL, GIFTJ) >= 0.5 ? 1 : 0, 1],
      ['contribution of a full workshop (B03)', CONTRIB, 950], ['Social groups say they would pay below the price', WD.wtp[SOCIAL] < OFFER.price ? 1 : 0, 1],
      ['strengths as Ana sees them', WORKSHOP_STRENGTHS.join(), '1,1,1,-1,-1,-1'],
    ];
  },
};
