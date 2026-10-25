// project.js — M05 applied project: Positioning Lantern's barista workshops (June 2027). Lantern runs a three-hour
// Saturday barista workshop for about 12 people at $125 a place (M01, B03). Ana surveyed 210 past attendees and
// newsletter readers about what they want from a workshop, what they would pay and how they see Lantern's workshops
// against Calder College's six-evening course, Kettle Lane Coffee Club's tasting evenings and CremaClass online. The student segments them, sizes
// and profiles the segments, scores them, builds a persona, reads the map, writes the positioning and recommends the
// changes that would make it true. Every figure comes from case.js (WORKSHOP_* exports); `verify` recomputes them.
import { WORKSHOP_OFFER as OFFER, WORKSHOP_NEEDS as NEEDS, WORKSHOP_PROVIDERS as PROVIDERS, WORKSHOP_LEVELS as LEVELS, WORKSHOP_RESPONDENTS as RESP, WORKSHOP_DERIVED as WD, WORKSHOP_STRENGTHS, tableCells } from './case.js?v=14';
import { weightedScore, distance } from '../../../core/percmap.js?v=14';
import { Sheet } from '../../../core/sheet.js?v=14';

const num = (id, prompt, answer, check, solution, wrong, { unit = '', places = 2, tol = 0.005, kind = 'numerical' } = {}) =>
  ({ id, type: 'num', kind, unit, places, prompt, answer, check, tol, solution, ...(wrong ? { wrong } : {}) });
const r = (x, p = 2) => Math.round(x * 10 ** p) / 10 ** p;
const pct = (x, p = 1) => `${(x * 100).toFixed(p)}%`;
const f = (x, p = 0) => x.toLocaleString('en-US', { minimumFractionDigits: p, maximumFractionDigits: p });
const sum = (xs) => xs.reduce((a, b) => a + b, 0);
const mean = (xs) => sum(xs) / xs.length;

// ---------------------------------------------------------------- segments (lettered by size, as the widget letters them)
const LET = ['A', 'B', 'C', 'D'];
const N = RESP.length, K = WD.k;
const NAMES = WD.names;                                     // Home enthusiasts, Social groups, Gift buyers, Aspiring baristas
const G = (name) => NAMES.indexOf(name);
const HOME = G('Home enthusiasts'), SOCIAL = G('Social groups'), GIFT = G('Gift buyers'), BARISTA = G('Aspiring baristas');
const SEG_CATS = ['Gift buyers', 'Aspiring baristas', 'Home enthusiasts', 'Social groups'];   // the names, not in size order
const share = WD.sizes.map((s) => s / N);
const IX = WD.index.map((row) => row.map((v) => Math.round(v)));
const elbow = WD.elbow, I = (k) => elbow.find((e) => e.k === k).inertia, SIL = (k) => elbow.find((e) => e.k === k).silhouette;
const bestK = elbow.slice().sort((a, b) => b.silhouette - a.silhouette)[0].k;

// the worksheet: one row per respondent with the segment letter, age band, past attendance, willingness to pay and needs
const COLS = ['respondent', 'segment', 'age', 'attended', 'wtp', ...NEEDS.map((n) => n.key)];
const ROWS = RESP.map((p, i) => [p.id, LET[WD.labels[i]], LEVELS.age[p.age], p.past ? 'Yes' : 'No', p.wtp, ...p.needs]);
const last = N + 1;
const wsCells = tableCells(COLS, ROWS).cells;
const colOf = (name) => String.fromCharCode(65 + COLS.indexOf(name));
const WTP_C = colOf('wtp'), GIFT_C = colOf('gift'), SEG_C = colOf('segment');
const WTP_F = `=AVERAGEIFS(${WTP_C}2:${WTP_C}${last},${SEG_C}2:${SEG_C}${last},N1)`;
const GIFT_F = `=AVERAGEIFS(${GIFT_C}2:${GIFT_C}${last},${SEG_C}2:${SEG_C}${last},N1)/AVERAGE(${GIFT_C}2:${GIFT_C}${last})*100`;
const wtpOf = (g) => mean(RESP.filter((_, i) => WD.labels[i] === g).map((p) => p.wtp));
const giftIx = (g) => (mean(RESP.filter((_, i) => WD.labels[i] === g).map((p) => p.needs[2])) / mean(RESP.map((p) => p.needs[2]))) * 100;

// ---------------------------------------------------------------- the scorecard
const maxS = Math.max(...share), maxW = Math.max(...WD.wtp), maxF = Math.max(...WD.fit.map(Math.abs));
const rivalD = WD.map.distances.map((row) => Math.min(...row.slice(1)));           // nearest rival provider to each ideal
const maxR = Math.max(...rivalD);
const FACT = {
  size: share.map((v) => (100 * v) / maxS),
  wtp: WD.wtp.map((v) => (100 * v) / maxW),
  fit: WD.fit.map((v) => 50 + (50 * v) / maxF),
  room: rivalD.map((v) => (100 * v) / maxR),                                       // farther from rivals = more room
};
const FACTORS = [FACT.size, FACT.wtp, FACT.fit, FACT.room];
const W_ANA = [2, 2, 3, 2], W_EQUAL = [1, 1, 1, 1];
const score = (w) => weightedScore(FACTORS, w);
const top = (w) => { const s = score(w); return s.indexOf(Math.max(...s)); };
const sAna = score(W_ANA), sEq = score(W_EQUAL);

// ---------------------------------------------------------------- the map and a planned position
const LANTERN_MEANS = WD.map.means[0];
const PLAN = LANTERN_MEANS.slice(); PLAN[2] = 6.0; PLAN[5] = 5.0;                  // gift vouchers; weekday evening sessions
const planPt = WD.project(PLAN);
const planDist = WD.map.idealPts.map((q) => distance(planPt, q));
const nowDist = WD.map.distances.map((row) => row[0]);
const nearestOf = (g) => { const d = WD.map.distances[g]; return d.indexOf(Math.min(...d)); };

// ---------------------------------------------------------------- economics of a workshop (B03)
const CONTRIB = OFFER.places * OFFER.price - OFFER.costPerWorkshop;               // a full workshop: $950

const profileHtml = `<div class="table-scroll"><table class="data-table study-table"><caption>The four segments (k = ${K}), lettered by size: each need’s index against the average respondent (100 = average)</caption><thead><tr><th scope="col">Segment</th><th scope="col">Respondents</th>${NEEDS.map((n) => `<th scope="col">${n.label}</th>`).join('')}</tr></thead><tbody>${LET.map((L, g) => `<tr><th scope="row">${L}</th><td class="num">${WD.sizes[g]}</td>${IX[g].map((v) => `<td class="num">${v}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;

export default {
  title: 'Positioning Lantern’s barista workshops',
  brief: [
    { case: `It is June 2027. Lantern’s barista workshop is a three-hour Saturday session for a small group (about ${OFFER.places} places) at $${OFFER.price} a place, run in a hired room with Lantern’s training machine. Lantern ran ${OFFER.held2026} workshops from March to December 2026, in person, online and hybrid; this project is about the in-person one. A full workshop contributes about $${f(CONTRIB)} after the $${OFFER.costPerWorkshop} for the room, materials and a second trainer. Ana wants to run more of them without cutting the price, and she doesn’t know who books them or why. She wants to know who the workshops are for, what they should stand for against the alternatives, and what to change. Lantern, Ana, the other providers and every figure are fictional.` },
    { p: 'What you have:' },
    { list: [
      `<b>A survey</b> of ${N} people (past attendees and newsletter readers who opened the e-mail invitation; not a probability sample): how much each of six things matters in a workshop (1 not at all, 7 essential), what they would pay for a three-hour workshop, age band, whether they have attended before, their ideal workshop and their ratings of four options on the same six attributes.`,
      `<b>The six needs</b>: ${NEEDS.map((n) => `${n.label.toLowerCase()} (“${n.q}”)`).join('; ')}.`,
      `<b>The options rated</b>: ${PROVIDERS.join(', ')}. Calder College runs a six-evening course for $${OFFER.calderPrice} with a certificate at the end; Kettle Lane Coffee Club runs cheap tasting evenings for groups of friends; CremaClass is an online video course for $${OFFER.cremaPrice}, available at any time.`,
      `<b>Ana’s view of her workshops</b>: strong on hands-on skills, fun and as a gift; weak on careers (no certificate), price (far above CremaClass) and times (Saturdays only).`,
    ] },
  ],
  deliverables: [
    'The segmentation: the variables, the number of segments and why, and each segment’s profile and size.',
    'A weighted scorecard of the segments, with how sensitive the choice is to the weights, and a targeting strategy.',
    'A persona for the target segment, built from the data.',
    'A reading of the perceptual map: where Lantern sits, its nearest rivals and what a planned change would do.',
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
            'Check whether each group is large enough to fill sessions before choosing',
          ],
          categories: ['Segmentation', 'Targeting', 'Positioning'],
          answer: [0, 1, 2, 2, 1],
          feedback: {
            4: 'Whether a segment is big enough to be worth serving is part of evaluating segments, which is targeting. (Segmentation also asks whether segments are substantial, but choosing among them on size is a targeting decision.)',
          },
          solution: 'Segmentation finds groups that want different things; targeting evaluates them (size, value, fit, competition) and chooses; positioning decides what the offer stands for in the chosen group’s minds, including the reason to believe it.' },
        { id: 'm05-pj-2', type: 'mc', kind: 'applied',
          prompt: 'Ana’s first idea is to segment workshop customers by age band. Why segment on the six workshop needs instead?',
          options: [
            'Needs explain why people book, which the offer and its message must answer; age only describes who books',
            'Using age bands in marketing is unlawful under consumer-protection rules, so needs are the only lawful basis for Lantern',
            'Needs-based segments are always easier to reach through media than age groups, so they cost Lantern less to target',
            'Age can’t be measured reliably in a survey, while ratings of needs on a 1–7 scale carry no measurement error at all',
          ],
          answer: 0,
          feedback: {
            1: 'Using age in marketing is lawful in general; the point is what age can and can’t tell you, not whether you may use it.',
            2: 'The reverse is usually true: needs-based segments are harder to reach, so you profile them with demographics and channels afterwards.',
            3: 'Ratings carry measurement error too; age is one of the most reliably measured survey variables.',
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
            `2: the fewest segments are always best, because they are the easiest for a small business to serve and remember`,
            `6: the within-cluster sum of squares is lowest there, so those segments fit the respondents’ answers best`,
            `5: one more than the elbow suggests, to be safe in case a small but valuable segment has been missed`,
          ],
          answer: 0,
          feedback: {
            1: `Two segments merge groups with different needs: its silhouette (${SIL(2).toFixed(3)}) is below k = ${bestK}’s (${SIL(bestK).toFixed(3)}).`,
            2: 'The within-cluster sum of squares always falls as k rises, so its lowest value is always at the largest k tried. Look for where the fall flattens.',
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
      html: `${profileHtml}<p>The worksheet has one row per respondent: the segment letter, age band, whether they have attended before, what they would pay for a three-hour workshop ($) and the six ratings. N1 holds a segment letter.</p>`,
      items: [
        { id: 'm05-pj-5', type: 'formula', kind: 'applied',
          prompt: `In N2, calculate the average amount the segment in N1 would pay for a workshop, in a formula that still works if N1 changes.`,
          sheet: { cells: { ...wsCells, M1: 'Segment', N1: LET[BARISTA], M2: 'Average pay ($)' }, vary: { N1: LET.filter((_, g) => g !== BARISTA) } },
          cell: 'N2', view: `A1:N${last}`, maxHeight: '20rem', widths: { A: 11, C: 9, D: 9, M: 16, N: 12 }, formats: { N2: '$0.00' },
          answer: WTP_F,
          alt: [`=SUMIFS(${WTP_C}2:${WTP_C}${last},${SEG_C}2:${SEG_C}${last},N1)/COUNTIFS(${SEG_C}2:${SEG_C}${last},N1)`, `=AVERAGEIFS(${WTP_C}:${WTP_C},${SEG_C}:${SEG_C},N1)`],
          wrong: [
            { formula: `=AVERAGE(${WTP_C}2:${WTP_C}${last})`, say: 'That is everyone’s average. Use AVERAGEIFS with the segment column and N1.' },
            { formula: `=SUMIFS(${WTP_C}2:${WTP_C}${last},${SEG_C}2:${SEG_C}${last},N1)`, say: 'That is the segment’s total. Divide by the number of respondents in it, or use AVERAGEIFS.' },
            { formula: `=AVERAGEIFS(${WTP_C}2:${WTP_C}${last},${SEG_C}2:${SEG_C}${last},"${LET[BARISTA]}")`, say: 'The letter is typed in, so the formula won’t follow N1. Refer to N1.' },
          ],
          solution: `<x>${WTP_F}</x>: ${LET.map((L, g) => `${L} $${wtpOf(g).toFixed(2)}`).join(', ')}. Only segment ${LET[SOCIAL]} averages below the $${OFFER.price} price.` },
        num('m05-pj-6', `What share of the ${N} respondents is in the Gift buyers segment? Give a percentage to one decimal place.`, r(share[GIFT] * 100, 1), () => (WD.sizes[GIFT] / N) * 100,
          `${WD.sizes[GIFT]} ÷ ${N} = ${pct(share[GIFT])}. A share of this survey, not of Harbour City: the respondents are people already on Lantern’s list who chose to answer.`,
          [{ value: r((WD.sizes[GIFT] / Math.max(...WD.sizes)) * 100, 1), say: 'That divides by the largest segment. Divide by all respondents.' }],
          { unit: '%', places: 1, tol: 0.06 }),
        { id: 'm05-pj-7', type: 'multi', kind: 'conceptual',
          prompt: 'Select every statement the profiles and sizes support.',
          options: [
            `Social groups would pay $${f(WD.wtp[SOCIAL], 2)} on average, below Lantern’s $${OFFER.price}, so the current offer is dear for them`,
            `Fewer than a third of Gift buyers (${pct(WD.past[GIFT], 0)}) have attended before, so they are mostly new to Lantern’s workshops`,
            `Aspiring baristas would pay $${f(WD.wtp[BARISTA], 2)} on average, so Lantern should raise the price of every workshop`,
            `Home enthusiasts are ${pct(share[HOME], 0)} of Harbour City’s coffee drinkers who want a workshop`,
            `Home enthusiasts are the largest segment, and more than half of them (${pct(WD.past[HOME], 0)}) have attended before`,
          ],
          answer: [0, 1, 4],
          feedback: {
            2: 'One segment’s willingness to pay says nothing about the others: raising every price would lose Social groups and probably some Home enthusiasts.',
            3: 'The survey covers people on Lantern’s list who answered an e-mail, not the city: its shares are shares of respondents.',
          },
          solution: 'The profiles support statements about these respondents: who pays what, who is new. They don’t give population shares (an e-mail survey of Lantern’s list), and one segment’s willingness to pay doesn’t set the price for all.' },
      ],
    },
    {
      id: 'target', title: 'Score and choose',
      html: `<p>Ana scores each segment from 0 to 100 on four factors: <b>size</b> (share of respondents, against the largest), <b>willingness to pay</b> (against the highest), <b>fit</b> with her workshops’ strengths (50 = average, from each segment’s standardised needs against Ana’s strengths: +1 for skills, social and gift, −1 for career, price and times) and <b>room</b> (how far the segment’s ideal is from the nearest rival on the map, against the farthest). Her weights are size ${W_ANA[0]}, willingness to pay ${W_ANA[1]}, fit ${W_ANA[2]}, room ${W_ANA[3]}.</p><div class="table-scroll"><table class="data-table study-table"><caption>Factor scores (0–100)</caption><thead><tr><th scope="col">Segment</th><th scope="col">Size</th><th scope="col">Willingness to pay</th><th scope="col">Fit</th><th scope="col">Room</th></tr></thead><tbody>${LET.map((L, g) => `<tr><th scope="row">${L}, ${NAMES[g]}</th>${FACTORS.map((F) => `<td class="num">${F[g].toFixed(1)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`,
      items: [
        num('m05-pj-8', 'What is Gift buyers’ weighted score with Ana’s weights? Give one decimal place.', r(sAna[GIFT], 1), () => score(W_ANA)[GIFT],
          `(${W_ANA.map((w, k) => `${w} × ${FACTORS[k][GIFT].toFixed(1)}`).join(' + ')}) ÷ ${sum(W_ANA)} = ${sAna[GIFT].toFixed(1)}.`,
          [{ value: r(sEq[GIFT], 1), say: 'That gives every factor the same weight. Use Ana’s weights.' }, { value: r(sum(W_ANA.map((w, k) => w * FACTORS[k][GIFT])), 1), say: 'That is the weighted sum. Divide by the total of the weights.' }],
          { places: 1, tol: 0.06 }),
        { id: 'm05-pj-9', type: 'mc', kind: 'applied',
          prompt: `With Ana’s weights Gift buyers score ${sAna[GIFT].toFixed(1)} and Home enthusiasts ${sAna[HOME].toFixed(1)}. With every weight equal, Home enthusiasts score ${sEq[HOME].toFixed(1)} and Gift buyers ${sEq[GIFT].toFixed(1)}. What should Ana conclude?`,
          options: [
            'The scorecard can’t settle it: the choice turns on how much fit should count against size, which is her call to argue',
            'Gift buyers win, because Ana’s own weights are the ones that count, and with them her scorecard has a clear winner',
            'Home enthusiasts win, because equal weights are the only objective way to combine factors measured on different scales',
            'Neither segment is worth serving, because a scorecard whose winner changes with the weights is unreliable',
          ],
          answer: 0,
          feedback: {
            1: `A lead of ${(sAna[GIFT] - sAna[HOME]).toFixed(1)} points that reverses with a different reasonable set of weights is not a clear winner.`,
            2: 'Equal weights are a choice too: they say size matters as much as fit. No weighting is free of judgement.',
            3: 'A scorecard’s sensitivity is information, not a failure: it shows which judgement decides the choice.',
          },
          solution: `The winner flips with the weights: Ana’s weights favour Gift buyers (${sAna[GIFT].toFixed(1)} against ${sAna[HOME].toFixed(1)}), equal weights Home enthusiasts (${sEq[HOME].toFixed(1)} against ${sEq[GIFT].toFixed(1)}). The scorecard narrows the field to two; the decision turns on how much fit should count against size, and Ana should say so.` },
        { id: 'm05-pj-10', type: 'mc', kind: 'applied',
          prompt: 'Which targeting strategy fits Lantern’s workshops best?',
          options: [
            'Concentrate on Aspiring baristas, who would pay the most, and compete with Calder College on certificates',
            'Serve Home enthusiasts and Gift buyers: the core workshop plus a gift version, leaving the other two to rivals',
            'Offer one workshop to everyone at one price, since all four segments want to learn something more about coffee',
            'Serve all four segments from next season, each with its own workshop, its own price and its own schedule',
          ],
          answer: 1,
          feedback: {
            0: 'They would pay most, but they want a qualification Lantern doesn’t offer, and Calder College sits nearest their ideal: the poorest fit of the four.',
            2: `An undifferentiated offer ignores that Social groups find $${OFFER.price} dear and Aspiring baristas want a certificate: it would fit no one well.`,
            3: 'Four offers would stretch a business that runs one Saturday workshop at a time with one training machine, and two of the segments fit Lantern poorly.',
          },
          solution: 'A differentiated strategy on the two segments that score well: the hands-on workshop Home enthusiasts already buy, plus a gift version (vouchers and weekday evening sessions) for Gift buyers. Social groups (price) and Aspiring baristas (certificates) are better served by Kettle Lane and Calder College.' },
      ],
    },
    {
      id: 'persona', title: 'Build a persona',
      html: `<p>Gift buyers (segment ${LET[GIFT]}): ${WD.sizes[GIFT]} respondents; would pay $${WD.wtp[GIFT].toFixed(2)} on average; ${pct(WD.past[GIFT], 0)} have attended before; age bands ${LEVELS.age.map((a, k) => `${a} ${WD.age[GIFT][k]}`).join(', ')}; highest indexes: gift ${IX[GIFT][2]}, social ${IX[GIFT][1]}.</p>`,
      items: [
        { id: 'm05-pj-11', type: 'multi', kind: 'applied',
          prompt: 'Ana drafts a persona for Gift buyers. Which details are supported by the survey data? Select all that apply.',
          options: [
            `Buys a workshop mainly as a present for someone else, and values it being a sociable occasion`,
            `Would pay around $${Math.round(WD.wtp[GIFT] / 5) * 5} for a three-hour workshop`,
            `Most likely aged ${LEVELS.age[WD.age[GIFT].indexOf(Math.max(...WD.age[GIFT]))]}, and usually hasn’t been to a Lantern workshop`,
            'Drives a hybrid car and reads lifestyle magazines at the weekend',
            'Has two children and works as a teacher in the North of the city',
            'Wants a barista certificate to help find work in a café',
          ],
          answer: [0, 1, 2],
          feedback: {
            3: 'Nothing in the survey says so: invented details make a persona vivid and wrong.',
            4: 'The survey didn’t ask about children, jobs or where people live: these are invented.',
            5: `That is Aspiring baristas (career index ${IX[BARISTA][3]}); Gift buyers rate career below average (${IX[GIFT][3]}).`,
          },
          solution: 'A persona should be an average of real data given a face, not a story: the gift motive and sociability (the indexes), the willingness to pay, the age band and the fact that most are new to Lantern. Details the survey didn’t measure belong in follow-up interviews, not in the persona.' },
      ],
    },
    {
      id: 'map', title: 'Read the map',
      html: `<p>The map places the four options by their average ratings on the six attributes; the gold rings are the four segments’ ideal workshops. You can plan a new position for Lantern Workshops with the sliders (the axes stay where the ratings put them).</p>`,
      tool: { kind: 'widget', widget: { type: 'percmap', title: 'Barista workshops in Harbour City, June 2027', brands: PROVIDERS, means: WD.map.means, attributes: NEEDS.map((n) => n.label), ideals: NAMES.map((nm, g) => ({ name: nm, profile: WD.map.ideal[g] })), highlight: PROVIDERS[0], move: true, noun: ['option', 'options'] } },
      items: [
        { id: 'm05-pj-12', type: 'mc', kind: 'conceptual',
          prompt: `The map’s two dimensions carry ${pct(WD.map.cumulative[1], 0)} of the differences between the four options. How much should that reassure Ana?`,
          options: [
            'Little: four options always fit exactly in three dimensions, so a high share in two comes almost free',
            'Fully: anything above 80% means the map shows the four options exactly as Harbour City’s customers see them',
            'Not at all: a perceptual map is only valid when its two dimensions carry less than half of the differences',
            `Fully, because all ${N} respondents rated all four options on all six attributes`,
          ],
          answer: 0,
          feedback: {
            1: 'A high share means little is lost in two dimensions; it says nothing about whether the attributes asked were the right ones, and with four points it comes almost free.',
            2: 'There is no such rule: a low share would be the worry.',
            3: 'Everyone rated every option here, but the respondents are still Lantern’s list, not every workshop customer.',
          },
          solution: 'With n options, n − 1 dimensions always carry all the differences between their averages, so four options fit almost perfectly in two or three. Read the map for its broad pattern, check it against the averages, and remember it shows only the attributes Ana asked about.' },
        { id: 'm05-pj-13', type: 'mc', kind: 'applied',
          prompt: 'Which option sits nearest each of the two segments Lantern is considering?',
          options: [
            `Gift buyers: ${PROVIDERS[nearestOf(GIFT)]}; Home enthusiasts: ${PROVIDERS[nearestOf(HOME)]}, with ${PROVIDERS[1]} close behind`,
            `Gift buyers: ${PROVIDERS[2]}; Home enthusiasts: ${PROVIDERS[1]}, well ahead of Lantern Workshops`,
            `Gift buyers: ${PROVIDERS[3]}; Home enthusiasts: ${PROVIDERS[0]}, far ahead of every rival`,
            `Both segments: ${PROVIDERS[2]}, because its low price and evening times suit everyone`,
          ],
          answer: 0,
          feedback: {
            1: `Kettle Lane is nearest Social groups (${WD.map.distances[SOCIAL][2].toFixed(2)}); for Gift buyers Lantern is nearer (${WD.map.distances[GIFT][0].toFixed(2)} against ${WD.map.distances[GIFT][2].toFixed(2)}).`,
            2: `CremaClass is the farthest option from Gift buyers (${WD.map.distances[GIFT][3].toFixed(2)}), and Home enthusiasts’ ideal is ${WD.map.distances[HOME][0].toFixed(2)} from Lantern and ${WD.map.distances[HOME][1].toFixed(2)} from Calder College: hardly far ahead.`,
            3: 'Price and times matter, but Gift buyers’ ideal is closest to Lantern’s giftable, sociable workshop.',
          },
          solution: `Distances on the map from each ideal: Gift buyers ${PROVIDERS.map((p, b) => `${p} ${WD.map.distances[GIFT][b].toFixed(2)}`).join(', ')}; Home enthusiasts ${PROVIDERS.map((p, b) => `${p} ${WD.map.distances[HOME][b].toFixed(2)}`).join(', ')}. Lantern is nearest both, but Calder College contests Home enthusiasts.` },
        num('m05-pj-14', `Ana plans gift vouchers and weekday evening sessions. Suppose they lift Lantern’s average gift rating from ${LANTERN_MEANS[2].toFixed(2)} to 6.0 and its schedule rating from ${LANTERN_MEANS[5].toFixed(2)} to 5.0, with everything else unchanged. Set the sliders, then give the planned position’s distance on the map from Gift buyers’ ideal point, to two decimal places.`,
          r(planDist[GIFT], 2), () => distance(WD.project(PLAN), WD.map.idealPts[GIFT]),
          `The planned point is (${planPt[0].toFixed(2)}, ${planPt[1].toFixed(2)}), ${planDist[GIFT].toFixed(2)} from Gift buyers’ ideal against ${nowDist[GIFT].toFixed(2)} now, and ${planDist[HOME].toFixed(2)} from Home enthusiasts’ (now ${nowDist[HOME].toFixed(2)}): the changes bring Lantern nearer both. Ratings move only if customers experience the change.`,
          [{ value: r(nowDist[GIFT], 2), say: 'That is today’s distance. Move both sliders first.' }],
          { places: 2, tol: 0.03, kind: 'applied' }),
      ],
    },
    {
      id: 'position', title: 'Write the positioning',
      html: '<p>A positioning statement names the target, the frame of reference, the point of difference and the reason to believe it.</p>',
      items: [
        { id: 'm05-pj-15', type: 'classify', kind: 'conceptual',
          prompt: 'Classify each part of Ana’s draft positioning for the gift workshop.',
          items: [
            'For people looking for a memorable present for a coffee lover',
            'A hands-on barista workshop',
            'Like the rivals, it teaches real espresso and milk skills on professional machines',
            'The only workshop in Harbour City designed as a gift: a voucher, a sociable small group and a bag of the beans you roast',
            'Because Lantern roasts its own beans and its trainers are the baristas who serve its catering events',
          ],
          categories: ['Target', 'Frame of reference', 'Point of parity', 'Point of difference', 'Reason to believe'],
          answer: [0, 1, 2, 3, 4],
          solution: 'Target: who it is for. Frame of reference: the category it competes in, which tells customers what to compare it with. Point of parity: what it must match the rivals on to be considered. Point of difference: what it alone offers that the target values. Reason to believe: the evidence that makes the difference credible.' },
        { id: 'm05-pj-16', type: 'mc', kind: 'applied',
          prompt: 'Which point of difference is strongest for Gift buyers?',
          options: [
            'A ready-made gift: vouchers valid for a year, a sociable small group and coffee to take home',
            `A lower price: a $99 workshop, less than half the price of Calder College’s $${OFFER.calderPrice} six-evening course`,
            'A recognised barista certificate at the end, to help people find work in cafés across Harbour City',
            'Sessions available at any time of day or night, so the buyer never has to plan around a date',
          ],
          answer: 0,
          feedback: {
            1: `Gift buyers rate price close to average (index ${IX[GIFT][4]}) and would pay $${WD.wtp[GIFT].toFixed(0)}: competing on price gives away margin for little, and Kettle Lane is cheaper anyway.`,
            2: `A certificate is what Aspiring baristas want (career index ${IX[BARISTA][3]}); Gift buyers rate it low (${IX[GIFT][3]}), and Lantern can’t credibly offer one.`,
            3: 'Any-time access is what CremaClass offers, and it gives up the sociable occasion Gift buyers value.',
          },
          solution: `It is relevant (gift index ${IX[GIFT][2]}, social ${IX[GIFT][1]}), distinct (no rival offers it), credible (Lantern roasts its own beans and already runs small, sociable sessions) and deliverable with vouchers and evening sessions: M01’s four tests.` },
      ],
    },
    {
      id: 'memo', title: 'Write Ana’s memo',
      html: '<p>Bring it together: who the workshops are for, what they should stand for, and what to change first.</p>',
      items: [
        { id: 'm05-pj-17', type: 'short', kind: 'applied',
          prompt: 'Write Ana a memo of 250–350 words: the segments and why four, your target and strategy with the scorecard’s sensitivity, a persona in two sentences, where Lantern sits on the map, a positioning statement, and the first two changes to make with how you would know they worked.',
          rubric: [
            `Segments: four needs-based segments (elbow and silhouette agree at four), named from their profiles, sized as shares of respondents (not of the city).`,
            `Targeting: the scorecard puts Gift buyers (${sAna[GIFT].toFixed(1)}) and Home enthusiasts (${sAna[HOME].toFixed(1)}) close together and the winner flips with the weights; the choice is argued, not read off.`,
            `Persona built only from the data (gift motive, sociability, willingness to pay about $${Math.round(WD.wtp[GIFT] / 5) * 5}, mostly new to Lantern, age band).`,
            'Map: Lantern nearest both target segments; Calder College contests Home enthusiasts; four options fit almost any two-dimensional map.',
            'A positioning statement with target, frame of reference, point of parity, point of difference and reason to believe; changes that make it credible (vouchers, weekday evening sessions) with measures (voucher sales, evening bookings, ratings in a repeat survey).',
          ],
          model: `<b>To:</b> Ana · <b>Re:</b> who the workshops are for<br><br><b>Segments.</b> The ${N} replies split into four groups by what they want: Home enthusiasts (${WD.sizes[HOME]}), Social groups (${WD.sizes[SOCIAL]}), Gift buyers (${WD.sizes[GIFT]}) and Aspiring baristas (${WD.sizes[BARISTA]}); the elbow and the silhouette both point to four. These are shares of people on our list who answered, not of the city.<br><br><b>Target.</b> Gift buyers and Home enthusiasts score almost level (${sAna[GIFT].toFixed(1)} and ${sAna[HOME].toFixed(1)} on my weights; equal weights reverse the order), so I recommend serving both: the core hands-on workshop for Home enthusiasts and a gift version for Gift buyers. Social groups find $${OFFER.price} dear (they would pay $${WD.wtp[SOCIAL].toFixed(0)}) and Aspiring baristas want a certificate we can’t give.<br><br><b>Persona.</b> “The gift giver”: wants a memorable present for a coffee lover and a sociable evening, would pay about $${Math.round(WD.wtp[GIFT] / 5) * 5}, and has usually never been to one of our workshops.<br><br><b>Map.</b> We sit nearest both segments’ ideals, but Calder College is almost as near Home enthusiasts. The map has only four options, so it fits almost perfectly; read it for the pattern.<br><br><b>Positioning.</b> For people looking for a memorable present for a coffee lover, Lantern’s workshop is the hands-on barista experience designed as a gift: real espresso skills like any course, plus a voucher, a small sociable group and beans we roast ourselves.<br><br><b>Next.</b> Sell vouchers and add one weekday evening session a month. Measure voucher sales, evening bookings and how full each workshop is, and repeat the ratings in six months to see whether the gift and schedule scores have moved.` },
      ],
    },
  ],
  rubric: [
    'The segmentation is needs-based, its number of segments is justified by more than one criterion, and segments are named and sized honestly.',
    'Targeting weighs attractiveness and fit, shows the scorecard’s sensitivity, and chooses a strategy that suits Lantern’s resources.',
    'The persona contains only what the data support.',
    'The map is read for its pattern with its limits stated, and a planned change is tested on it.',
    'The positioning statement is complete and credible, and the recommended changes come with measures.',
  ],
  verify() {
    const sh = new Sheet({ cells: { ...wsCells, N1: LET[BARISTA], N2: WTP_F } });
    const sg = new Sheet({ cells: { ...wsCells, N1: LET[GIFT], N2: GIFT_F } });
    return [
      ['segments k', K, 4], ['sizes', WD.sizes.join(), '72,52,51,35'], ['names', NAMES.join(), 'Home enthusiasts,Social groups,Gift buyers,Aspiring baristas'],
      ['best silhouette at 4', bestK, 4], ['elbow drop 3→4 over 3× 4→5', I(3) - I(4) > 3 * (I(4) - I(5)) ? 1 : 0, 1],
      ['WTP formula (Aspiring baristas)', sh.get('N2'), wtpOf(BARISTA), 1e-9], ['WTP Aspiring baristas', WD.wtp[BARISTA], 238, 0.01],
      ['gift index formula (Gift buyers)', sg.get('N2'), giftIx(GIFT), 1e-9], ['gift index', IX[GIFT][2], 175],
      ['Gift buyers share', share[GIFT], 0.2429, 0.00005], ['Gift buyers past share', WD.past[GIFT], 0.2353, 0.00005],
      ['score Gift (Ana)', sAna[GIFT], 77.35, 0.005], ['score Home (Ana)', sAna[HOME], 76.02, 0.005], ['score Home (equal)', sEq[HOME], 78.88, 0.005], ['score Gift (equal)', sEq[GIFT], 75.94, 0.005], ['winner Ana', NAMES[top(W_ANA)], 'Gift buyers'],
      ['winner equal', NAMES[top(W_EQUAL)], 'Home enthusiasts'], ['map 2D share', WD.map.cumulative[1], 0.978, 0.0005],
      ['nearest to Gift', PROVIDERS[nearestOf(GIFT)], PROVIDERS[0]], ['nearest to Home', PROVIDERS[nearestOf(HOME)], PROVIDERS[0]],
      ['plan distance to Gift', planDist[GIFT], 0.64, 0.005], ['plan nearer Home too', planDist[HOME] < nowDist[HOME] ? 1 : 0, 1],
      ['contribution of a full workshop (B03)', CONTRIB, 950], ['Social groups pay below the price', WD.wtp[SOCIAL] < OFFER.price ? 1 : 0, 1],
    ];
  },
};
