// perceptual-maps.ex.js — M05 · Perceptual maps: widgets, practice and the knowledge check (answer keys live here).
// Lantern's map, ideal points and bases come from case.js (DERIVED.map, segments from module 2). The broadband
// providers, cinema chains, ice-cream maker and hotel brands are fictional. Every num item's `check` recomputes its answer.
import { BRANDS, NEEDS, RESPONDENTS, DERIVED as D } from './case.js?v=15';
import { perceptualMap, distance } from '../../../core/percmap.js?v=15';
import { tInv } from '../../../core/inference.js?v=15';

const M = D.map.brandMeans, SC = D.map.scores, SEG = D.segments.names, IDEAL = D.map.ideal.segments;
const B = (name) => BRANDS.indexOf(name), S = (name) => SEG.indexOf(name), A = (key) => NEEDS.findIndex((n) => n.key === key);
const LA = B('Lantern'), SU = B('Summit Brew'), AR = B('Arcadia Coffee'), CC = B('Corner Cup');
const EX = S('Explorers'), CL = S('Craft and local'), OG = S('On the go'), MI = S('Mindful');
const TASTE = A('taste'), CONV = A('convenience'), LOCAL = A('local');
const SHORT = ['Taste', 'Low price', 'Convenience', 'Sustainability', 'Energy', 'Health', 'Local', 'Novelty'];
const f2 = (v) => v.toFixed(2), r2 = (v) => Math.round(v * 100) / 100, r1 = (v) => Math.round(v * 10) / 10;
const sg = (v) => (v < 0 ? `−${Math.abs(v).toFixed(2)}` : v.toFixed(2));
const MAP = perceptualMap(M);
const exIdeal = D.map.segIdeal[EX];
const twoD = (b) => Math.hypot(M[b][TASTE] - exIdeal[TASTE], M[b][CONV] - exIdeal[CONV]);
const mean = (a) => a.reduce((s, x) => s + x, 0) / a.length;
const sd = (a) => { const m = mean(a); return Math.sqrt(a.reduce((s, x) => s + (x - m) ** 2, 0) / (a.length - 1)); };
const lConv = RESPONDENTS.filter((r) => r.rated.includes(LA)).map((r) => r.ratings[r.rated.indexOf(LA)][CONV]);
const lSd = sd(lConv), lN = lConv.length;
const col = (letter, from, values) => Object.fromEntries(values.map((v, i) => [`${letter}${from + i}`, v]));

// ---------------------------------------------------------------- widgets
export const widgets = {
  'pm-lantern': {
    type: 'percmap', title: 'How Harbour City coffee drinkers see six coffee brands (May 2027)',
    brands: BRANDS, means: M, attributes: SHORT,
    ideals: SEG.map((name, s) => ({ name, profile: D.map.segIdeal[s] })),
    highlight: 'Lantern', vectors: true,
    note: `Mean ratings from 1 to 7 by people who know each brand: Lantern ${D.map.counts[LA]}, Summit Brew ${D.map.counts[SU]}, Daily Grind RTD ${D.map.counts[B('Daily Grind RTD')]}, Arcadia Coffee ${D.map.counts[AR]}, Harbour Basics ${D.map.counts[B('Harbour Basics')]}, Corner Cup ${D.map.counts[CC]}. “Low price” is the rating for “a low price”, so high means cheap. Lantern’s point rests on the smallest base. Ideal points are the five segments’ average ideal coffee, placed with the brands’ standardisation.`,
  },
};

// ---------------------------------------------------------------- guided practice
const distCells = {
  A1: 'brand', B1: 'dimension 1', C1: 'dimension 2', D1: 'distance to ideal',
  ...col('A', 2, BRANDS), ...col('B', 2, SC.map((s) => r2(s[0]))), ...col('C', 2, SC.map((s) => r2(s[1]))),
  F1: 'segment', G1: 'Craft and local', F2: 'ideal: dimension 1', G2: r2(IDEAL[CL][0]), F3: 'ideal: dimension 2', G3: r2(IDEAL[CL][1]),
};
const distR = SC.map((s) => Math.hypot(r2(s[0]) - r2(IDEAL[CL][0]), r2(s[1]) - r2(IDEAL[CL][1])));

export const guided = [
  {
    id: 'm05-pm-g1', type: 'steps', kind: 'numerical',
    prompt: `A two-attribute map of taste and convenience. The table gives each brand’s mean ratings; the Explorers’ ideal coffee is rated ${f2(exIdeal[TASTE])} on taste and ${f2(exIdeal[CONV])} on convenience.`,
    data: { table: { head: ['Brand', 'Taste and quality', 'Convenience'], rows: BRANDS.map((n, b) => [n, f2(M[b][TASTE]), f2(M[b][CONV])]) } },
    solution: `Distances from (${f2(exIdeal[TASTE])}, ${f2(exIdeal[CONV])}): ${BRANDS.map((n, b) => `${n} ${f2(twoD(b))}`).join(', ')}. On these two attributes Arcadia Coffee is nearest the Explorers (${f2(twoD(AR))}) and Summit Brew is ${f2(twoD(SU))} away. On the full eight-attribute map Summit Brew is nearest (${f2(D.map.distances[EX][SU])}) and Arcadia is ${f2(D.map.distances[EX][AR])} away, because the full map also counts health, sustainability and novelty, where Summit Brew is much nearer what Explorers want (their ideal is ${f2(exIdeal[A('health')])} on health, ${f2(exIdeal[A('sustainability')])} on sustainability and ${f2(exIdeal[A('novelty')])} on novelty; Summit Brew is rated ${f2(M[SU][A('health')])}, ${f2(M[SU][A('sustainability')])} and ${f2(M[SU][A('novelty')])}, Arcadia ${f2(M[AR][A('health')])}, ${f2(M[AR][A('sustainability')])} and ${f2(M[AR][A('novelty')])}).`,
    steps: [
      {
        id: 'm05-pm-g1-s1', type: 'num',
        prompt: 'Calculate the distance on this map from the Explorers’ ideal to Summit Brew, in rating points. Give two decimal places.',
        answer: r2(twoD(SU)), check: () => Math.sqrt((M[SU][TASTE] - exIdeal[TASTE]) ** 2 + (M[SU][CONV] - exIdeal[CONV]) ** 2), unit: 'rating points', places: 2, tol: 0.011,
        wrong: [
          { value: r2(twoD(SU) ** 2), say: 'That is the squared distance. Take the square root of the sum of squared differences.' },
          { value: r2(Math.abs(M[SU][TASTE] - exIdeal[TASTE]) + Math.abs(M[SU][CONV] - exIdeal[CONV])), say: 'You added the two differences. The straight-line distance squares each difference, adds them and takes the square root.' },
          { value: r2(Math.abs(M[SU][CONV] - exIdeal[CONV])), say: 'That is the convenience difference alone. Combine both attributes: √(taste difference² + convenience difference²).' },
        ],
        hints: ['d = √((x_b − x_i)² + (y_b − y_i)²), with taste across and convenience up.', `Summit Brew is (${f2(M[SU][TASTE])}, ${f2(M[SU][CONV])}); the ideal is (${f2(exIdeal[TASTE])}, ${f2(exIdeal[CONV])}).`],
      },
      {
        id: 'm05-pm-g1-s2', type: 'mc',
        prompt: 'Which brand is nearest the Explorers’ ideal on this two-attribute map?',
        options: ['Arcadia Coffee', 'Summit Brew', 'Lantern', 'Daily Grind RTD'],
        answer: 0,
        feedback: {
          1: `Summit Brew is ${f2(twoD(SU))} away: much higher on convenience than the Explorers’ ideal.`,
          2: `Lantern is ${f2(twoD(LA))} away: tastier but less convenient than the ideal.`,
          3: `Daily Grind RTD is ${f2(twoD(B('Daily Grind RTD')))} away: far more convenient and less tasty than the Explorers ask for.`,
        },
        hints: ['Work out the distance to each brand, or look for the brand whose two ratings are both close to the ideal’s.', `Arcadia is rated ${f2(M[AR][TASTE])} and ${f2(M[AR][CONV])}.`],
      },
      {
        id: 'm05-pm-g1-s3', type: 'mc',
        prompt: `On the full map, built from all eight attributes, Summit Brew is the Explorers’ nearest brand (${f2(D.map.distances[EX][SU])}) and Arcadia is ${f2(D.map.distances[EX][AR])} away. What best explains why the two maps disagree?`,
        options: [
          'It leaves out health, sustainability and novelty, where Summit Brew is much nearer the Explorers’ ideal than Arcadia is',
          'The full map is the less accurate of the two maps, because it carries only 90% of the differences between the six brands',
          'Different respondents rated the brands for the two maps, so one of the two samples must be biased',
          'Distances on a two-attribute map are in rating points, so they are always shorter than on the full map',
        ],
        answer: 0,
        feedback: {
          1: 'The two-attribute map carries two of eight attributes; the full map carries 90% of the differences on all eight. Leaving attributes out is the bigger loss.',
          2: 'Both maps use the same ratings from the same respondents; only the attributes used differ.',
          3: 'The units differ, but that can’t change which brand is nearest. What changes the answer is which attributes count.',
        },
        hints: ['Which attributes does each map use?', `On health the Explorers’ ideal is ${f2(exIdeal[A('health')])}; Summit Brew is rated ${f2(M[SU][A('health')])} and Arcadia ${f2(M[AR][A('health')])}. Compare sustainability and novelty the same way.`],
      },
    ],
  },
  {
    id: 'm05-pm-g2', type: 'steps', kind: 'conceptual',
    prompt: 'Read the loadings of Lantern’s map (the table in the lesson: each attribute’s correlations with Dimensions 1 and 2).',
    solution: `Dimension 1 runs from a low price and convenience to sustainability, taste, health, local and novelty: cheap and everywhere against crafted and ethical. Local and independent has loadings ${f2(D.map.loadings[LOCAL][0])} and ${sg(D.map.loadings[LOCAL][1])}, so its communality is ${f2(D.map.loadings[LOCAL][0])}² + ${f2(Math.abs(D.map.loadings[LOCAL][1]))}² ≈ ${f2(D.map.loadings[LOCAL][0] ** 2 + D.map.loadings[LOCAL][1] ** 2)}: ${Math.round(100 * (D.map.loadings[LOCAL][0] ** 2 + D.map.loadings[LOCAL][1] ** 2))}% of how the brands differ on local is on the map, and the rest is not. Lantern’s lead on local is bigger than the picture suggests.`,
    steps: [
      {
        id: 'm05-pm-g2-s1', type: 'mc',
        prompt: `Dimension 1’s loadings run from a low price (${sg(D.map.loadings[A('price')][0])}) and convenience (${sg(D.map.loadings[CONV][0])}) to sustainability (${f2(D.map.loadings[A('sustainability')][0])}), taste (${f2(D.map.loadings[TASTE][0])}), health (${f2(D.map.loadings[A('health')][0])}), local (${f2(D.map.loadings[LOCAL][0])}) and novelty (${f2(D.map.loadings[A('novelty')][0])}). Which name for Dimension 1 fits these loadings best?`,
        options: [
          'Cheap and everywhere against crafted and ethical',
          'Lantern against the five other brands',
          'Poor quality against high quality, as measured in blind tests',
          'Ready-to-drink cans against fresh coffee from cafés and roasters',
        ],
        answer: 0,
        feedback: {
          1: 'A dimension is defined by attributes, not by one brand. Lantern scores highest on it, but so do Arcadia and, a little, Summit Brew.',
          2: 'The map shows perceptions, not measured quality; and the dimension mixes ethics, locality and novelty with taste.',
          3: 'The attributes don’t include format, and Corner Cup, a café chain, sits on the cheap and convenient side with the cans.',
        },
        hints: ['Look at which attributes have large loadings at each end.', 'Negative end: price and convenience. Positive end: sustainability, taste, health, local, novelty.'],
      },
      {
        id: 'm05-pm-g2-s2', type: 'num',
        prompt: `Local and independent has loadings of ${f2(D.map.loadings[LOCAL][0])} on Dimension 1 and ${sg(D.map.loadings[LOCAL][1])} on Dimension 2. What percentage of how the brands differ on local and independent does the map show? Give a whole number.`,
        answer: Math.round(100 * (D.map.loadings[LOCAL][0] ** 2 + D.map.loadings[LOCAL][1] ** 2)), check: () => 100 * (D.map.loadings[LOCAL][0] ** 2 + D.map.loadings[LOCAL][1] ** 2), unit: '%', places: 0, tol: 0.6,
        wrong: [
          { value: 79, say: 'You added the two loadings. The communality adds the squared loadings: 0.80² + 0.01².' },
          { value: 80, say: 'That is the loading on Dimension 1 as a percentage. A loading is a correlation; square it to get a share of variance.' },
        ],
        hints: ['The share on the map is the communality: loading₁² + loading₂².', '0.80² ≈ 0.64; the second loading adds almost nothing.'],
      },
      {
        id: 'm05-pm-g2-s3', type: 'mc',
        prompt: 'What does that share mean for reading Lantern’s position?',
        options: [
          'It understates Lantern’s lead on local, so read it with the table of means',
          'Local and independent matters less to coffee drinkers than the other seven attributes',
          'Lantern’s rating on local is unreliable, because it rests on only 61 ratings',
          'The local arrow should be ignored whenever the map is used to make a decision',
        ],
        answer: 0,
        feedback: {
          1: 'Arrow length is about how the brands differ, not about how much customers care. The needs ratings measure importance.',
          2: 'The base is small, but Lantern’s lead on local (6.30 against at most 3.11) is far larger than its sampling error. The communality is about the map, not the base.',
          3: 'Two-thirds of the attribute is on the map, and its arrow is still informative; the point is to read it with the means beside it.',
        },
        hints: ['A communality below 1 means part of the attribute’s variation lies on dimensions not drawn.', 'Lantern’s local rating is 6.30; the best rival’s is 3.11.'],
      },
    ],
  },
  {
    id: 'm05-pm-g3', type: 'formula', kind: 'applied',
    prompt: 'Ana wants a distance table she can reuse for any segment. Columns B and C hold the six brands’ coordinates on Lantern’s map; G2 and G3 hold a segment’s ideal point. In D2, calculate the distance from the ideal point to the brand in row 2, in a formula that can be filled down to D7.',
    sheet: { cells: distCells, vary: { G2: [r2(IDEAL[OG][0]), r2(IDEAL[MI][0])], G3: [r2(IDEAL[OG][1]), r2(IDEAL[MI][1])] } },
    cell: 'D2', fill: 'D2:D7', answer: '=SQRT((B2-$G$2)^2+(C2-$G$3)^2)',
    alt: ['=((B2-$G$2)^2+(C2-$G$3)^2)^0.5', '=SQRT(SUMSQ(B2-$G$2,C2-$G$3))', '=SQRT(($G$2-B2)^2+($G$3-C2)^2)'],
    view: 'A1:G7', formats: { B: '0.00', C: '0.00', D: '0.00', G2: '0.00', G3: '0.00' }, widths: { A: 17, B: 12, C: 12, D: 16, F: 19, G: 15 },
    wrong: [
      { formula: '=SQRT((B2-G2)^2+(C2-G3)^2)', say: 'Without $ the ideal point slides down as you fill: D3 subtracts G3 and G4, not the ideal. Lock it: $G$2 and $G$3.' },
      { formula: '=(B2-$G$2)^2+(C2-$G$3)^2', say: 'That is the squared distance. It ranks the brands in the same order, but the lesson’s distances are its square root.' },
      { formula: '=ABS(B2-$G$2)+ABS(C2-$G$3)', say: 'That adds the two differences (a city-block distance). The map’s distance is the straight line: the square root of the sum of squares.' },
      { formula: `=SQRT((B2-${r2(IDEAL[CL][0])})^2+(C2-(${r2(IDEAL[CL][1])}))^2)`, say: 'With the ideal typed in, the formula works only for Craft and local. Point at G2 and G3 so the table works for any segment.' },
    ],
    hints: ['Distance = √((brand’s dimension 1 − ideal’s dimension 1)² + (brand’s dimension 2 − ideal’s dimension 2)²).', 'The brand moves with the row (B2, C2); the ideal must not ($G$2, $G$3): <x>=SQRT((B2-$G$2)^2+(C2-$G$3)^2)</x>.'],
    solution: `<x>=SQRT((B2-$G$2)^2+(C2-$G$3)^2)</x> filled down gives, for Craft and local, ${BRANDS.map((n, b) => `${n} ${f2(distR[b])}`).join(', ')}: Lantern is nearest. Change G1:G3 to another segment’s ideal and the whole column updates.`,
  },
  {
    id: 'm05-pm-g4', type: 'mc', kind: 'applied',
    prompt: 'Ana’s marketing assistant points at the empty top-right corner of the taste and low-price map: “Nobody is there. Lantern Cold Brew should be the tasty, low-priced coffee.” What is the best response?',
    options: [
      'Agree: an empty region of a perceptual map is unmet demand that the first brand to arrive can take',
      'Ask why it is empty first: good coffee costs more, and no segment’s ideal sits in that corner',
      'Agree, as long as Cold Brew is priced below Daily Grind RTD’s $2.29 so the claim is believed',
      'Disagree: two-attribute maps are always misleading, so read only the full map’s gaps',
    ],
    answer: 1,
    feedback: {
      0: 'Emptiness alone shows no demand. A gap matters only if a segment wants it and the firm can deliver it profitably.',
      2: 'Pricing below the value brand would make the low-price claim credible but would be unlikely to cover the cost of single-origin cold brew; the corner is empty for that reason.',
      3: 'Two-attribute maps are limited, not useless. Here it shows a real trade-off; the question is why the corner is empty.',
    },
    hints: ['A gap is an opportunity only if three things hold. What are they?', 'Look at where the segments’ ideal points sit, and think about what tasty coffee costs.'],
    solution: 'The corner is empty for a reason: across the brands, customers see taste and a low price as a trade-off (correlation −0.96), and better coffee costs more to make. No segment’s ideal sits there either. A gap is worth acting on only if a large enough segment wants it, the firm can deliver it credibly at a profit, and nothing explains the emptiness. This corner fails the second test at least.',
  },
];

// ---------------------------------------------------------------- on your own
export const independent = [
  {
    id: 'm05-pm-i1', type: 'num', kind: 'numerical',
    prompt: `Lantern’s map has eigenvalues ${D.map.values.slice(0, 5).map(f2).join(', ')}, 0, 0 and 0 for its eight standardised attributes. What share of the differences between the brands would a three-dimensional map show? Give a percentage to one decimal place.`,
    answer: r1(100 * D.map.cumulative[2]), check: () => 100 * (D.map.values[0] + D.map.values[1] + D.map.values[2]) / 8, unit: '%', places: 1, tol: 0.06,
    wrong: [
      { value: r1(100 * D.map.cumulative[1]), say: 'That is the two-dimensional map. Add the third eigenvalue.' },
      { value: r1(100 * D.map.ratio[2]), say: 'That is the third dimension alone. The map would show all three.' },
      { value: r1(100 * D.map.cumulative[2] * 8 / 6), say: 'You divided by the number of brands. The eigenvalues of standardised attributes add up to the number of attributes, 8.' },
    ],
    solution: `(${f2(D.map.values[0])} + ${f2(D.map.values[1])} + ${f2(D.map.values[2])}) ÷ 8 = ${(100 * D.map.cumulative[2]).toFixed(1)}%. The third dimension adds ${(100 * D.map.ratio[2]).toFixed(1)} points, which is why a flat map, at ${(100 * D.map.cumulative[1]).toFixed(1)}%, is a reasonable summary.`,
  },
  {
    id: 'm05-pm-i2', type: 'classify', kind: 'conceptual',
    prompt: 'Which of these can Ana read from Lantern’s map, which need other data from the study, and which can’t be learned from the study at all?',
    items: [
      'Which brand sits nearest the Craft and local segment’s ideal point.',
      'Which attributes the six brands are seen to trade off against each other.',
      'How much of the differences between the brands the flat picture leaves out.',
      'How many cans of Cold Brew Lantern will sell in its first year.',
      'Which segments have the highest Cold Brew purchase intent.',
      'How people who have never heard of Lantern would rate it.',
    ],
    categories: ['The map shows it', 'Other data in the study show it', 'The study can’t show it'],
    answer: [0, 0, 0, 2, 1, 2],
    feedback: {
      2: 'The map’s two dimensions carry 90%, so it leaves out about 10%: the map tells you what it misses.',
      3: 'Neither perceptions nor stated intent are sales. A sales forecast needs more (M02’s simulator, a test market).',
      4: 'The intent question is in the study, by segment; it isn’t on the map.',
      5: 'Only people who knew Lantern rated it; the study has no perception of Lantern to report for the others.',
    },
    solution: 'The map shows nearest brands, trade-offs (arrow angles) and its own coverage (90%). Cold Brew intent by segment is elsewhere in the study. Sales and the views of people who don’t know Lantern are beyond the study.',
  },
  {
    id: 'm05-pm-i3', type: 'num', kind: 'numerical',
    prompt: `Lantern’s mean convenience rating, ${f2(M[LA][CONV])}, comes from ${lN} ratings with a standard deviation of ${lSd.toFixed(3)}. Calculate the 95% margin of error of that mean (t* = ${tInv(0.975, lN - 1).toFixed(3)} for ${lN - 1} degrees of freedom). Give two decimal places.`,
    answer: r2(tInv(0.975, lN - 1) * lSd / Math.sqrt(lN)), check: () => tInv(0.975, 60) * lSd / Math.sqrt(61), unit: 'rating points', places: 2, tol: 0.006,
    wrong: [
      { value: r2(tInv(0.975, lN - 1) * lSd / Math.sqrt(640)), say: 'You divided by √640, the whole study. Lantern’s mean rests on its own 61 ratings.' },
      { value: r2(lSd / Math.sqrt(lN)), say: 'That is the standard error. The margin is t* × SE.' },
      { value: r2(tInv(0.975, lN - 1) * lSd / lN), say: 'Divide the standard deviation by √n, not by n.' },
    ],
    solution: `SE = ${lSd.toFixed(3)} ÷ √${lN} = ${(lSd / Math.sqrt(lN)).toFixed(3)}; margin = ${tInv(0.975, lN - 1).toFixed(3)} × ${(lSd / Math.sqrt(lN)).toFixed(3)} ≈ ${f2(tInv(0.975, lN - 1) * lSd / Math.sqrt(lN))}. Lantern’s convenience is somewhere between about ${f2(M[LA][CONV] - tInv(0.975, lN - 1) * lSd / Math.sqrt(lN))} and ${f2(M[LA][CONV] + tInv(0.975, lN - 1) * lSd / Math.sqrt(lN))}: still far below Summit Brew’s ${f2(M[SU][CONV])}, so the conclusion survives the small base.`,
  },
  {
    id: 'm05-pm-i4', type: 'multi', kind: 'conceptual',
    prompt: 'Ana plans to tell her board, “The map proves Craft and local drinkers see Lantern as their brand.” Which of these are genuine weaknesses in that claim? Select all that apply.',
    options: [
      'Lantern’s position rests on 61 ratings, from people who already know it.',
      'Too few Craft and local drinkers rated Lantern to map their view separately.',
      'The map leaves out about a tenth of the differences between the brands.',
      'The ideal point is a segment average and hides disagreement within it.',
      'Principal components can’t be used with ratings on a 1–7 scale.',
      'The map would look different if Lantern’s point were drawn in another colour.',
    ],
    answer: [0, 1, 2, 3],
    feedback: {
      4: 'Mean ratings on a 1–7 scale are standardised and summarised in the usual way; that isn’t a weakness of this map.',
      5: 'Presentation choices don’t change positions. The highlighting is only there to help readers find Lantern.',
    },
    solution: 'Lantern’s point is closest to the Craft and local ideal, but “proves” over-claims. The base is small and leans towards people who know Lantern; Craft and local’s own view of Lantern (18 ratings) can’t be mapped separately; the map shows 90% of the differences; and an average ideal hides spread. Safer: “Among people who know Lantern, its profile is closest to what Craft and local drinkers say they want.”',
  },
  {
    id: 'm05-pm-i5', type: 'order', kind: 'conceptual',
    prompt: 'Put the steps of building an attribute-based perceptual map in order.',
    items: [
      'Choose the attributes, from qualitative research on what drives the choice',
      'Collect each respondent’s ratings of the brands they know on those attributes',
      'Average the ratings into a table of brands by attributes, with each brand’s base',
      'Standardise each attribute across the brands',
      'Find the principal components and keep the first two dimensions',
      'Plot the brands’ scores and the attributes’ loadings as arrows',
      'Project the segments’ ideal points onto the same axes and read the distances',
    ],
    solution: 'Attributes first (they decide what the map can show), then ratings, brand means with bases, standardisation, principal components, the biplot, and finally ideal points placed with the same standardisation and weights.',
  },
  {
    id: 'm05-pm-i6', type: 'mc', kind: 'conceptual',
    prompt: 'On Lantern’s map the arrows for convenience and sustainability point in almost opposite directions. What does that mean?',
    options: [
      'Coffee drinkers who want convenience don’t care about sustainability',
      'Across the brands, convenient ones are seen as less sustainable',
      'No brand could ever be seen as both convenient and sustainable',
      'Sustainability is the more important of the two attributes to customers',
    ],
    answer: 1,
    feedback: {
      0: 'The map describes brands, not customers. Whether convenience seekers care about sustainability is a question for the needs data and the segments.',
      2: 'The pattern is a correlation across six brands as they are today. A brand that changed could break it; that is what repositioning tries to do.',
      3: 'Arrow directions say nothing about importance to customers.',
    },
    solution: `Opposite arrows mean the two attributes are negatively correlated across the brands (here ${sg(MAP.R[CONV][A('sustainability')])}): brands rated convenient (Corner Cup, Daily Grind RTD, Harbour Basics) are rated low on sustainability, and the reverse. It is a fact about how these six brands are seen, not a law and not a statement about customers’ needs.`,
  },
];

// ---------------------------------------------------------------- knowledge check
// broadband providers (fictional): five standardised attributes
const BB = [2.84, 1.21, 0.62, 0.33, 0];
// cinema chains (fictional): a map's coordinates
const CN = { ideal: [0.8, -1.1], brand: [-0.4, 0.5] };

export const check = [
  {
    id: 'm05-pm-k1', type: 'mc', kind: 'conceptual',
    prompt: 'A perceptual map of hotel brands (fictional) places two hotels almost on top of each other. What can you conclude?',
    options: [
      'Guests who rated them see them as alike on the attributes asked',
      'The two hotels offer the same rooms and service at the same price',
      'The two hotels compete for the same segment, so one will fail',
      'Guests prefer these two hotels to all of the others on the map',
    ],
    answer: 0,
    feedback: {
      1: 'A map shows perceptions, not facts. Two hotels can be seen alike and still differ in what they offer.',
      2: 'Closeness says nothing about failure. Two brands can share a segment profitably, and the map shows no segments unless ideal points are added.',
      3: 'Closeness to each other isn’t preference. Preference would need ideal points, and even then it is a model.',
    },
    solution: 'Points close together are brands perceived as similar, on the attributes the survey asked about, by the people who rated them, on the share of the differences the two dimensions carry.',
  },
  {
    id: 'm05-pm-k2', type: 'num', kind: 'numerical',
    prompt: `A map of six broadband providers (fictional) is built from five standardised attributes. The eigenvalues are ${BB.map((v) => v.toFixed(2)).join(', ')}. What percentage of the differences between the providers does the two-dimensional map show? Give one decimal place.`,
    answer: 81, check: () => 100 * (BB[0] + BB[1]) / BB.reduce((a, b) => a + b, 0), unit: '%', places: 1, tol: 0.06,
    wrong: [
      { value: 56.8, say: 'That is Dimension 1 alone. The map has two dimensions.' },
      { value: 67.5, say: 'You divided by the number of providers (6). Standardised attributes give eigenvalues that add up to the number of attributes, 5.' },
      { value: 4.05, say: 'That is the sum of the two eigenvalues. Divide by their total, 5, to get a share.' },
    ],
    solution: '(2.84 + 1.21) ÷ 5 = 4.05 ÷ 5 = 81.0%. With standardised attributes the eigenvalues add to the number of attributes.',
  },
  {
    id: 'm05-pm-k3', type: 'num', kind: 'numerical',
    prompt: 'On a perceptual map of cinema chains (fictional), the families segment’s ideal point is at (0.8, −1.1) and one chain sits at (−0.4, 0.5). How far is the chain from the families’ ideal, in map units? Give two decimal places.',
    answer: 2, check: () => Math.hypot(CN.brand[0] - CN.ideal[0], CN.brand[1] - CN.ideal[1]), unit: 'map units', places: 2, tol: 0.006,
    wrong: [
      { value: 2.8, say: 'You added the differences (1.2 + 1.6). Square them, add, and take the square root.' },
      { value: 4, say: 'That is the squared distance, 1.2² + 1.6². Take its square root.' },
      { value: 0.72, say: 'You dropped the minus signs. The differences are −0.4 − 0.8 = −1.2 and 0.5 − (−1.1) = 1.6.' },
    ],
    solution: '√((−0.4 − 0.8)² + (0.5 − (−1.1))²) = √(1.44 + 2.56) = √4 = 2.00.',
  },
  {
    id: 'm05-pm-k4', type: 'mc', kind: 'applied',
    prompt: 'An ice-cream maker’s map (fictional) shows an empty space where a brand would be seen as both indulgent and low in sugar. No segment’s ideal point is near it; the nearest ideal belongs to a segment of 6% of buyers. What should the maker do?',
    options: [
      'Launch into the space quickly, before a rival notices that it is empty',
      'Drop the idea, because an empty space on a map is never worth anything',
      'Test whether enough buyers want it, and whether it can be made',
      'Reposition the existing range into the space, since the map shows the way',
    ],
    answer: 2,
    feedback: {
      0: 'Emptiness isn’t demand. With no ideal point nearby and only a small segment within reach, the evidence of demand is thin.',
      1: '“Never” goes too far: a gap can be an opportunity when people want it and it can be delivered. Here the evidence is weak, so it needs testing.',
      3: 'Moving the existing range would risk its current buyers for a space with no proven demand.',
    },
    solution: 'A gap is an opportunity only if a large enough segment wants it, the firm can deliver it credibly and profitably, and it isn’t empty for a reason (indulgent and low-sugar may be hard to make taste right). With a small segment and no ideal nearby, it is a hypothesis to test with concept and product tests, not a launch decision.',
  },
  {
    id: 'm05-pm-k5', type: 'multi', kind: 'conceptual',
    prompt: 'Select all the statements about reading a principal-components biplot that are true.',
    options: [
      'A brand far along an attribute’s arrow is, roughly, rated higher on that attribute than the other brands.',
      'An arrow’s squared length is the share of that attribute’s differences the map shows.',
      'Arrows at right angles belong to attributes that are unrelated across the brands.',
      'The longest arrow belongs to the attribute customers care about most.',
      'A brand on the positive side of Dimension 1 is better than one on the negative side.',
    ],
    answer: [0, 1, 2],
    feedback: {
      3: 'Arrow length is about how well the map represents the attribute, not about importance to customers.',
      4: 'Each axis’s sign is arbitrary: flipping it changes nothing. The ends mean what the loadings say.',
    },
    solution: 'True: projection onto an arrow roughly approximates the brand’s relative rating (on maps like Lantern’s, which draw brands by scores and arrows by correlations, only roughly: check the means); the squared length is the communality; right angles mean near-zero correlation across the brands. False: length isn’t importance, and an axis has no good end.',
  },
  {
    id: 'm05-pm-k6', type: 'mc', kind: 'applied',
    prompt: `Lantern’s point on the map rests on ${D.map.counts[LA]} ratings, and 18 of the raters are Craft and local drinkers, a segment that is 17% of the sample. What is the soundest way to describe Lantern’s position in Ana’s report?`,
    options: [
      'Harbour City’s coffee drinkers place Lantern furthest towards crafted and ethical',
      'Craft and local drinkers see Lantern as their brand: its point sits nearest their ideal',
      `Those who know Lantern place it furthest towards crafted and ethical (base ${D.map.counts[LA]})`,
      'Lantern’s point is too uncertain to report and should be left off the map',
    ],
    answer: 2,
    feedback: {
      0: 'Only the 14% who know Lantern rated it, so the map can’t speak for all coffee drinkers.',
      1: 'The map shows Lantern’s profile as rated by everyone who knows it is nearest the Craft and local ideal; it doesn’t show Craft and local drinkers’ own view, which rests on 18 ratings.',
      3: 'Its large differences (taste, local, convenience) are well beyond sampling error. Report the point with its base rather than hiding it.',
    },
    solution: 'Say whose perception it is and how many stand behind it: people who know Lantern, a base of 61, leaning towards its natural customers. Say “furthest towards the crafted and ethical end of the map”, not “the most ethical brand”: Arcadia is rated higher on sustainability. The large differences are reliable; small ones need testing.',
  },
];
