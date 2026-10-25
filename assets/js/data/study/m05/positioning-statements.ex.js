// positioning-statements.ex.js — M05 · Positioning statements: widgets, practice and the knowledge check (answer keys
// live here). Lantern's needs indexes (module 2) and brand ratings (the map) come from case.js; Ana's screening rule is a
// fictional rule of thumb. The swimming school, the car-share scheme, the oat drink, the museum and the other drafts are
// fictional. Every num item's `check` recomputes its answer.
import { BRANDS, NEEDS, DERIVED as D } from './case.js?v=15';
import { propTest2 } from '../../../core/inference.js?v=15';

const M = D.map.brandMeans, IX = D.segments.index, SEG = D.segments.names;
const B = (name) => BRANDS.indexOf(name), S = (name) => SEG.indexOf(name), A = (key) => NEEDS.findIndex((n) => n.key === key);
const LA = B('Lantern'), SU = B('Summit Brew'), AR = B('Arcadia Coffee'), CC = B('Corner Cup');
const OG = S('On the go'), MI = S('Mindful'), CL = S('Craft and local');
const PRICE = A('price'), CONV = A('convenience'), ENERGY = A('energy');
const ATTR = NEEDS.map((n, j) => (j === PRICE ? 'A low price' : n.label));
const r2 = (v) => Math.round(v * 100) / 100, f2 = (v) => v.toFixed(2), p1 = (v) => `${(v * 100).toFixed(1)}%`;
const SCREEN = (r) => `=IF(B${r}<$B$3,"Less important",IF(E${r}>=$B$4,"Point of difference",IF(E${r}<=-$B$4,"Parity to reach","Parity held")))`;
function screenCells(target, rival, withScreen) {
  const cells = {
    A1: 'Target segment', B1: target, A2: 'Rival brand', B2: rival,
    A3: 'Important if index ≥', B3: 110, A4: 'Lead or gap from', B4: 0.5,
    A6: 'Attribute', B6: 'Target index', C6: 'Lantern', D6: 'Rival', E6: 'Lantern − rival', F6: 'Screen',
    H5: 'Needs index by segment (100 = average respondent)', N5: 'Mean brand ratings (1–7)',
  };
  const IXC = 'HIJKL', BMC = 'NOPQRS';
  SEG.forEach((name, k) => { cells[`${IXC[k]}6`] = name; });
  BRANDS.forEach((name, k) => { cells[`${BMC[k]}6`] = name; });
  ATTR.forEach((a, j) => {
    const r = 7 + j;
    cells[`A${r}`] = a;
    SEG.forEach((_, k) => { cells[`${IXC[k]}${r}`] = IX[k][j]; });
    BRANDS.forEach((_, k) => { cells[`${BMC[k]}${r}`] = Math.round(M[k][j] * 10000) / 10000; });
    cells[`B${r}`] = `=INDEX(H${r}:L${r},MATCH($B$1,$H$6:$L$6,0))`;
    cells[`C${r}`] = `=INDEX(N${r}:S${r},MATCH("Lantern",$N$6:$S$6,0))`;
    cells[`D${r}`] = `=INDEX(N${r}:S${r},MATCH($B$2,$N$6:$S$6,0))`;
    cells[`E${r}`] = `=C${r}-D${r}`;
    if (withScreen) cells[`F${r}`] = SCREEN(r);
  });
  return cells;
}
const SHEET_FMT = { B: '0', C: '0.00', D: '0.00', E: '0.00', B4: '0.0', H: '0', I: '0', J: '0', K: '0', L: '0', N: '0.00', O: '0.00', P: '0.00', Q: '0.00', R: '0.00', S: '0.00' };
const SHEET_W = { A: 18, B: 13, C: 7, D: 7, E: 12, F: 18, G: 3 };
// what the screen gives (unrounded ratings) for a target and a rival
const screenOf = (seg, rival, j) => { const g = M[LA][j] - M[rival][j]; return IX[seg][j] < 110 ? 'Less important' : g >= 0.5 ? 'Point of difference' : g <= -0.5 ? 'Parity to reach' : 'Parity held'; };

// ---------------------------------------------------------------- widgets
export const widgets = {
  'st-screen': {
    type: 'sheet', title: 'Ana’s screen: points of difference and parity for a target and a rival',
    sheet: { cells: screenCells('Craft and local', 'Arcadia Coffee', true) },
    view: 'A1:S14', editable: 'B3:B4', mark: ['F7:F14'], maxHeight: '30rem',
    controls: [
      { cell: 'B1', label: 'Target segment', options: SEG.map((s) => [s, s]) },
      { cell: 'B2', label: 'Rival brand', options: BRANDS.filter((b) => b !== 'Lantern').map((b) => [b, b]) },
    ],
    formats: SHEET_FMT,
    widths: SHEET_W, tools: ['formulas', 'reset'],
    note: 'Column B looks up the target’s needs index (columns H to L); C and D look up Lantern’s and the rival’s mean ratings (columns N to S); F applies Ana’s rule of thumb with the thresholds in B3 and B4. The rule is a screen for candidates, not a verdict: an attribute marked “Point of difference” still has to pass the credible and consistent tests.',
  },
};

// ---------------------------------------------------------------- guided practice
export const guided = [
  {
    id: 'm05-st-g1', type: 'classify', kind: 'conceptual',
    prompt: 'A swimming school (fictional) drafts its positioning statement: “For parents of nervous four- to seven-year-olds, Kelderby Swim is the swimming school where children learn to love the water, because every class has four children and a teacher in the pool.” Its notes add that its fees and its weekday and Saturday times are much like the council pool’s. Name the part each phrase plays.',
    items: [
      'parents of nervous four- to seven-year-olds',
      'the swimming school',
      'where children learn to love the water',
      'every class has four children and a teacher in the pool',
      'fees much like the council pool’s',
      'weekday and Saturday class times',
    ],
    categories: ['Target', 'Frame of reference', 'Point of difference', 'Reason to believe', 'Point of parity'],
    answer: [0, 1, 2, 3, 4, 4],
    feedback: {
      1: '“Swimming school” is what parents compare it with: the council pool’s lessons and other schools.',
      2: 'This is the benefit that sets it apart for nervous children.',
      3: 'A class of four with the teacher in the water is a checkable fact that makes the benefit credible.',
      4: 'Fees like the rival’s are something it must match, not something to claim.',
      5: 'Times that suit parents are needed to be considered at all; the rival offers them too.',
    },
    hints: ['The template: For [target], [brand] is the [frame] that [point of difference], because [reason to believe].', 'Anything it shares with the council pool is parity, not difference.'],
    solution: 'Target: parents of nervous four- to seven-year-olds. Frame: a swimming school. Point of difference: children learn to love the water. Reason to believe: four children per class with a teacher in the pool. Points of parity: similar fees and the usual class times.',
  },
  {
    id: 'm05-st-g2', type: 'steps', kind: 'applied',
    prompt: `Ana tests whether Lantern Cold Brew could be positioned for On the go drinkers in the canned-coffee frame, against Summit Brew. On the go’s needs indexes are: ${ATTR.map((a, j) => `${a.toLowerCase()} ${IX[OG][j]}`).join(', ')}.`,
    solution: `Under Ana’s rule (index of at least 110) only convenience (${IX[OG][CONV]}) and energy (${IX[OG][ENERGY]}) matter to On the go. Lantern trails Summit Brew on both, by ${f2(M[SU][CONV] - M[LA][CONV])} and ${f2(M[SU][ENERGY] - M[LA][ENERGY])}: parity to reach, with no point of difference on anything the target cares about. A statement promising On the go drinkers convenience and a kick would fail the credible test today, and the distinct test too, since Corner Cup and Summit Brew already sit nearer their ideal.`,
    steps: [
      {
        id: 'm05-st-g2-s1', type: 'multi',
        prompt: 'Which attributes are important to On the go under Ana’s rule (an index of at least 110)? Select all that apply.',
        options: ATTR,
        answer: [CONV, ENERGY],
        feedback: { [A('taste')]: `Taste’s index is ${IX[OG][A('taste')]}: below average for this segment.`, [PRICE]: `A low price is ${IX[OG][PRICE]}, about average: below the rule’s 110.`, [A('novelty')]: `Novelty is ${IX[OG][A('novelty')]}.` },
        hints: ['Read the index for each attribute and keep those of 110 or more.', 'Two attributes qualify.'],
      },
      {
        id: 'm05-st-g2-s2', type: 'mc',
        prompt: `Lantern is rated ${f2(M[LA][CONV])} on convenience and ${f2(M[LA][ENERGY])} on energy; Summit Brew ${f2(M[SU][CONV])} and ${f2(M[SU][ENERGY])}. Under the screen (a lead or gap counts from 0.5 points), what are these two attributes for Lantern?`,
        options: [
          'Parity Lantern would have to reach on both',
          'Points of difference, because the target values them',
          'Parity held on energy, parity to reach on convenience',
          'Less important, because Lantern isn’t strong on them',
        ],
        answer: 0,
        feedback: {
          1: 'Mattering to the target makes an attribute relevant; a point of difference also needs Lantern to lead, and it trails.',
          2: `The energy gap is ${f2(M[SU][ENERGY] - M[LA][ENERGY])}, beyond the 0.5 threshold: parity to reach, like convenience.`,
          3: 'Importance comes from the target’s needs, not from Lantern’s strengths. These are the two attributes On the go care most about.',
        },
        hints: ['Both are important to the target; now compare Lantern with Summit Brew.', `Gaps: −${f2(M[SU][CONV] - M[LA][CONV])} and −${f2(M[SU][ENERGY] - M[LA][ENERGY])}.`],
      },
      {
        id: 'm05-st-g2-s3', type: 'mc',
        prompt: 'A draft reads: “For busy people who need a kick on the move, Lantern Cold Brew is the canned coffee that keeps you going wherever you are, because it is strong cold brew in a can.” Which of the four tests does it fail most clearly?',
        options: [
          'Relevant: busy people don’t care about energy or convenience',
          'Consistent: the price of a can doesn’t match a promise of energy',
          'Credible: people don’t see Lantern as convenient or energising',
          'None: every one of the four tests is passed by the draft as written',
        ],
        answer: 2,
        feedback: {
          0: 'The opposite: energy and convenience are exactly what On the go care about. The claim is relevant.',
          1: 'Price isn’t the problem the evidence shows. The ratings are.',
          3: 'Lantern trails Summit Brew on both claims, and all five rivals sit closer to On the go’s ideal than Lantern does. It fails credible, and distinct too.',
        },
        hints: ['Which test asks whether the offer is seen to deliver the claim?', 'Compare the claim with Lantern’s ratings.'],
      },
    ],
  },
  {
    id: 'm05-st-g3', type: 'formula', kind: 'applied',
    prompt: 'Build Ana’s screen. B1 names the target, B2 the rival; columns B to E look up the target’s needs index (from H to L), Lantern’s and the rival’s ratings (from N to S) and the gap. In F7, write a formula that can be filled down to F14 and shows “Less important” if the index in B7 is below the threshold in B3; otherwise “Point of difference” if the gap in E7 is at least B4, “Parity to reach” if it is B4 or more below zero, and “Parity held” in between.',
    sheet: { cells: screenCells('Mindful', 'Arcadia Coffee', false), vary: { B1: ['Craft and local', 'On the go', 'Explorers'], B2: ['Summit Brew', 'Corner Cup'] } },
    cell: 'F7', fill: 'F7:F14', answer: SCREEN(7),
    alt: [
      '=IF(B7>=$B$3,IF(E7>=$B$4,"Point of difference",IF(E7<=-$B$4,"Parity to reach","Parity held")),"Less important")',
      '=IFS(B7<$B$3,"Less important",E7>=$B$4,"Point of difference",E7<=-$B$4,"Parity to reach",TRUE,"Parity held")',
      '=IF(B7<$B$3,"Less important",IF(ABS(E7)<$B$4,"Parity held",IF(E7>0,"Point of difference","Parity to reach")))',
    ],
    view: 'A1:S14', formats: SHEET_FMT, widths: SHEET_W, maxHeight: '30rem',
    wrong: [
      { formula: '=IF(B7<110,"Less important",IF(E7>=0.5,"Point of difference",IF(E7<=-0.5,"Parity to reach","Parity held")))', say: 'With 110 and 0.5 typed in, changing the rule in B3 or B4 changes nothing. Point at $B$3 and $B$4.' },
      { formula: '=IF(B7<B3,"Less important",IF(E7>=B4,"Point of difference",IF(E7<=-B4,"Parity to reach","Parity held")))', say: 'Without $ the thresholds slide down as you fill: F8 compares with B4 and B5. Lock them: $B$3 and $B$4.' },
      { formula: '=IF(B7<$B$3,"Less important",IF(E7>=$B$4,"Point of difference","Parity held"))', say: 'A gap of B4 or more below zero is parity to reach, not parity held: add the third test.' },
      { formula: '=IF(B7<$B$3,"Less important",IF(ABS(E7)>=$B$4,"Point of difference","Parity held"))', say: 'ABS treats a big gap as if it were a big lead. Trailing the rival by half a point is parity to reach.' },
    ],
    variants: 6,
    hints: ['Nest the tests: first importance, then a lead, then a gap; whatever is left is parity held.', '<x>=IF(B7<$B$3,"Less important",IF(E7>=$B$4,"Point of difference",IF(E7<=-$B$4,"Parity to reach","Parity held")))</x>'],
    solution: `<x>=IF(B7<$B$3,"Less important",IF(E7>=$B$4,"Point of difference",IF(E7<=-$B$4,"Parity to reach","Parity held")))</x> filled down. For Mindful against Arcadia: ${ATTR.map((a, j) => `${a.toLowerCase()} ${screenOf(MI, AR, j).toLowerCase()}`).join('; ')}. Lantern’s one relevant difference for Mindful drinkers is local; on health, which they rate highest of all, it trails Arcadia by ${f2(M[AR][A('health')] - M[LA][A('health')])}.`,
  },
  {
    id: 'm05-st-g4', type: 'mc', kind: 'applied',
    prompt: 'Ana considers framing Cold Brew as “a café-quality coffee to take with you” instead of “a canned cold coffee”. What would change?',
    options: [
      'Nothing important: a frame of reference is only wording, and the rivals stay the same whichever is chosen',
      'Café drinks become the rivals, so taste is expected and convenience may become the can’s advantage',
      'Summit Brew becomes the main rival, so local and independent is no longer a point of difference',
      'Lantern no longer needs points of parity, because a café-quality coffee has no category to belong to',
    ],
    answer: 1,
    feedback: {
      0: 'The frame tells customers what to compare the offer with, so it changes the rivals and with them what counts as parity.',
      2: 'Summit Brew is the main rival in the canned frame, not the café frame; and local stays a difference against Corner Cup (Lantern 6.30 against Corner Cup’s 2.66).',
      3: 'Every frame has points of parity. Here they would be café taste and something new to try.',
    },
    hints: ['What would a customer compare a “café-quality coffee to take with you” with?', 'In the café frame, which of Lantern’s strengths would be ordinary?'],
    solution: 'The frame chooses the rivals. As a café drink to take away, Cold Brew competes with Corner Cup’s takeaway coffee and Lantern’s own cafés: café taste becomes a point of parity, and a can’s convenience (no queue, no cup) could become a difference. As a canned coffee, it competes with Summit Brew, where taste and local roots are differences and convenience is the parity at risk.',
  },
];

// ---------------------------------------------------------------- on your own
const CT = { n: 150, a: 62, b: 45 };
const CTT = propTest2(CT.a, CT.n, CT.b, CT.n);

export const independent = [
  {
    id: 'm05-st-i1', type: 'mc', kind: 'conceptual',
    prompt: 'What does an offer’s frame of reference decide?',
    options: [
      'Its rivals, and so which qualities count as parity and which as differences',
      'The price it charges, which must match the average price in the category',
      'Which segment it should target, since each frame has exactly one segment',
      'The words of its tagline, which should repeat the frame’s name',
    ],
    answer: 0,
    feedback: {
      1: 'The frame informs pricing, but it doesn’t set a price; a premium offer can sit in the same frame as a value one.',
      2: 'The target comes first and the frame is chosen to suit it, not the other way round, and a frame can contain several segments.',
      3: 'Taglines are for customers and change with campaigns; the frame belongs to the positioning.',
    },
    solution: 'The frame of reference is the category or goal the offer competes in. It tells customers what to compare it with, which fixes the rivals; and against those rivals some qualities are ordinary (points of parity) and some special (possible points of difference).',
  },
  {
    id: 'm05-st-i2', type: 'classify', kind: 'applied',
    prompt: 'A city car-share scheme (fictional) targets people who drive less than once a week, against the main rival scheme. Its research shows what the target values and how both schemes are rated (1–7). Classify each attribute for the scheme.',
    items: [
      'Cars parked within a five-minute walk: target values it highly; scheme 5.1, rival 5.3.',
      'Pay by the minute with no monthly fee: target values it highly; scheme 6.2, rival 3.4.',
      'Electric cars only: target is indifferent; scheme 6.8, rival 2.1.',
      'Clean cars: target values it highly; scheme 4.9, rival 5.0.',
      'Insurance included: target values it highly; scheme 3.2, rival 5.8.',
    ],
    categories: ['Point of difference', 'Point of parity held', 'Parity to reach', 'Not worth claiming to this target'],
    answer: [1, 0, 3, 1, 2],
    feedback: {
      0: 'Valued, and level with the rival: parity held. Not a reason to choose, but a reason not to reject.',
      1: 'Valued, and far ahead of the rival: the point of difference for people who drive rarely.',
      2: 'A big lead on something the target doesn’t care about doesn’t persuade this target, however true it is.',
      3: 'Level with the rival on something valued: parity held.',
      4: 'Valued, and well behind: parity the scheme must reach before its difference can work.',
    },
    solution: 'Point of difference: pay by the minute (valued, +2.8). Parity held: nearby cars and clean cars (valued, level). Parity to reach: insurance (valued, −2.6). Electric-only is a real difference, but not one this target values, so it isn’t the lead claim to them.',
  },
  {
    id: 'm05-st-i3', type: 'fill', kind: 'conceptual',
    prompt: 'Complete the positioning statement for Lantern’s cafés and beans aimed at Craft and local drinkers.',
    text: 'For Harbour City coffee drinkers who [[0]], Lantern is the [[1]] that [[2]], because [[3]].',
    blanks: [
      { options: ['want the lowest price they can find for a cup', 'need a strong caffeine kick on the way to work each morning', 'care about taste and want to support local business'], answer: 2 },
      { options: ['independent coffee company', 'supermarket’s own-label coffee range', 'national chain of coffee shops'], answer: 0 },
      { options: ['is open earlier, and in more places, than any other café in the city', 'serves better-tasting coffee and always has something new to try', 'is the cheapest specialty coffee in the whole city'], answer: 1 },
      { options: ['it is owned and run in Harbour City and adds a new coffee every month', 'its coffee was rated 5.92 out of 7 for taste by the people in Ana’s survey', 'it plans to open more cafés across Harbour City than Corner Cup has'], answer: 0 },
    ],
    solution: 'Target: drinkers who care about taste and want to support a local business (Craft and local’s top indexes are local and taste). Frame: an independent coffee company, against Corner Cup and Arcadia. Point of difference: better-tasting coffee with something new to try (not sustainability, on which Arcadia is rated higher). Reason to believe: something customers can check, its local ownership and a new coffee every month (a practice Lantern would have to adopt). A survey score is Ana’s evidence, not a customer’s proof.',
  },
  {
    id: 'm05-st-i4', type: 'num', kind: 'numerical',
    prompt: `Suppose (fictional) Ana runs a monadic concept test of Cold Brew written two ways. Of ${CT.n} Craft and local and Explorers drinkers who read the local-first concept, ${CT.a} chose the top two boxes of the purchase-intent scale; of ${CT.n} who read the taste-first concept, ${CT.b} did. Calculate the two-proportion z statistic (pooled) for the difference. Give two decimal places.`,
    answer: r2(CTT.z), check: () => { const p = (62 + 45) / 300; return (62 / 150 - 45 / 150) / Math.sqrt(p * (1 - p) * (2 / 150)); }, unit: '', places: 2, tol: 0.02,
    wrong: [
      { value: r2(CTT.diff / Math.sqrt(CTT.pool * (1 - CTT.pool) / CT.n)), say: 'You used the standard error of one proportion. The difference of two needs both samples: √(p̂(1 − p̂)(1/n₁ + 1/n₂)).' },
      { value: r2(100 * CTT.diff), say: 'That is the difference in percentage points. Divide the difference in proportions by its standard error.' },
      { value: r2(CTT.diff / Math.sqrt(CTT.pool * (1 - CTT.pool) / 300)), say: 'You used 300 as one sample size. The concepts were read by two separate groups of 150: √(p̂(1 − p̂)(1/150 + 1/150)).' },
    ],
    solution: `Shares: ${p1(CTT.p1)} and ${p1(CTT.p2)}; pooled p̂ = 107 ÷ 300 = ${CTT.pool.toFixed(3)}; SE = √(${CTT.pool.toFixed(3)} × ${(1 - CTT.pool).toFixed(3)} × (1/150 + 1/150)) = ${CTT.sePool.toFixed(4)}; z = ${CTT.diff.toFixed(4)} ÷ ${CTT.sePool.toFixed(4)} ≈ ${CTT.z.toFixed(2)}, two-sided p ≈ ${CTT.pValue.toFixed(3)}. The local-first concept leads, but only just beyond the 5% line; with stated intent overstating purchase, Ana should treat it as the better of two words, not a forecast.`,
  },
  {
    id: 'm05-st-i5', type: 'short', kind: 'applied',
    prompt: `Write a positioning statement for Lantern’s cafés and beans aimed at the Explorers segment (needs indexes: ${ATTR.map((a, j) => `${a.toLowerCase()} ${IX[S('Explorers')][j]}`).join(', ')}). Their nearest brand on the map is Summit Brew; Lantern leads Summit Brew on novelty by ${f2(M[LA][A('novelty')] - M[SU][A('novelty')])} and on taste by ${f2(M[LA][A('taste')] - M[SU][A('taste')])}. Then say which of the four tests is weakest for your statement.`,
    rubric: [
      'Names the Explorers by their need (novelty, new flavours), not by demographics.',
      'Chooses a frame that brings Summit Brew, or another named rival, into the comparison.',
      'Leads with novelty, the target’s highest index, as the point of difference.',
      'Gives a reason to believe that customers can check, not a survey score.',
      'Names the weakest test and why (for example credible: the base of 61 ratings, or consistent: does Lantern’s range actually change often enough?).',
    ],
    model: '“For Harbour City coffee drinkers who are always looking for something new, Lantern is the independent coffee company that always has a coffee you haven’t tried yet, because its cafés and online shop change their guest coffees every month.” Weakest test: credible and consistent together. Lantern leads Summit Brew on novelty (5.20 against 4.48) among the 61 people who rate it, but a monthly change of guest coffees is a practice it would have to run without fail (fictional), and a concept test among Explorers should check that the promise is believed.',
    solution: 'See the model answer. A good statement targets the Explorers’ novelty need, frames Lantern against Summit Brew, and backs the promise with a practice customers can see.',
  },
  {
    id: 'm05-st-i6', type: 'multi', kind: 'conceptual',
    prompt: 'Keller, Sternthal and Tybout describe ways to handle two benefits that customers think can’t go together. Which are among them? Select all that apply.',
    options: [
      'Establish one benefit first and add the other later.',
      'Use an unrelated attribute or endorser that lends credibility to the doubted benefit.',
      'Argue that the two benefits are complements rather than opposites.',
      'Cut the price, so that customers stop asking about either benefit.',
      'Claim both benefits as loudly as possible, so that customers remember both.',
    ],
    answer: [0, 1, 2],
    feedback: {
      3: 'A price cut changes the value position; it doesn’t resolve the doubt, and it may deepen it if cheap implies low quality.',
      4: 'Repetition doesn’t create belief. The article’s methods each give customers a reason to accept the second benefit.',
    },
    solution: 'Sequencing (Miller Lite: “great taste” before “less filling”), leveraging an unrelated attribute (well-liked celebrities lending credibility) and reframing as complements (Apple: the most powerful computers are the ones people actually use).',
  },
];

// ---------------------------------------------------------------- knowledge check
export const check = [
  {
    id: 'm05-st-k1', type: 'mc', kind: 'conceptual',
    prompt: 'Which statement best describes a point of parity?',
    options: [
      'A feature the offer shares with rivals and must be good enough at to be considered',
      'A feature on which the offer and every rival are rated exactly the same',
      'The single benefit the offer provides better than any of its rivals in the market',
      'A price set equal to the main rival’s price, so that customers compare on quality alone',
    ],
    answer: 0,
    feedback: {
      1: 'Parity means good enough, not identical: a brand can trail a little and still break even on a point of parity.',
      2: 'That is a point of difference.',
      3: 'Price can be a point of parity, but parity is a much wider idea: anything needed to belong to the frame.',
    },
    solution: 'Points of parity are features shared with competitors that an offer must be good enough at to be accepted as a credible member of its frame of reference. Missing them, an offer isn’t considered, however different it is.',
  },
  {
    id: 'm05-st-k2', type: 'mc', kind: 'applied',
    prompt: 'An oat drink (fictional) could be framed as “milk for your coffee” or as “a plant-based breakfast drink”. In the first frame its rivals are dairy milks and other barista oat drinks. What is most likely to be a point of parity in that frame?',
    options: [
      'Foaming as well as dairy milk does when steamed',
      'Being made from oats rather than from dairy milk',
      'Having more fibre than other breakfast drinks have',
      'Being sold in the breakfast-drinks aisle of supermarkets',
    ],
    answer: 0,
    feedback: {
      1: 'Against dairy milk, being made from oats is a difference (good or bad depending on the target), not parity.',
      2: 'Fibre against breakfast drinks belongs to the second frame, not the first.',
      3: 'That is where the second frame would put it; in the coffee frame it would sit with the milks.',
    },
    solution: 'In the “milk for your coffee” frame, a drink must do what milk does in coffee: steam, foam and not curdle. That is the bar for being considered at all, a point of parity. Being made from oats is the difference.',
  },
  {
    id: 'm05-st-k3', type: 'num', kind: 'numerical',
    prompt: 'In a museum’s monadic concept test (fictional), 150 people read one positioning concept and 40% chose the top two boxes. What is the 95% margin of error of that share, in percentage points? Use z* = 1.96 and give one decimal place.',
    answer: 7.8, check: () => 100 * 1.96 * Math.sqrt(0.4 * 0.6 / 150), unit: 'points', places: 1, tol: 0.06,
    wrong: [
      { value: 4, say: 'That is the standard error, 100 × √(0.4 × 0.6 ÷ 150). The margin is 1.96 × SE.' },
      { value: 15.7, say: 'That is the whole width of the interval. The margin is half of it.' },
      { value: 0.6, say: 'You divided by 150 outside the square root. SE = √(p(1 − p) ÷ n).' },
    ],
    solution: 'SE = √(0.40 × 0.60 ÷ 150) = 0.0400; margin = 1.96 × 0.0400 ≈ 0.078, or 7.8 points. A second concept would need to differ by more than this to be told apart, which is why concept differences need the two-proportion test.',
  },
  {
    id: 'm05-st-k4', type: 'classify', kind: 'conceptual',
    prompt: 'Each draft positioning fails one of M01’s four tests. Which one?',
    items: [
      'A budget hotel (fictional) claims “the city’s most luxurious rooms” while guests rate its rooms 3.1 out of 7.',
      'A bank (fictional) claims “a mobile app” as its point of difference when every rival offers one.',
      'A bakery (fictional) positions on “artisan, slow-fermented bread” but sells it in plastic bags at the lowest price in town.',
      'A sports drink (fictional) aimed at marathon runners leads on “a can design that matches your outfit”.',
    ],
    categories: ['Relevant', 'Distinct', 'Credible', 'Consistent'],
    answer: [2, 1, 3, 0],
    feedback: {
      0: 'Guests’ own ratings contradict the claim: it isn’t believable.',
      1: 'Everyone has an app: that is parity, not a difference.',
      2: 'The packaging and price undercut the artisan promise: the mix doesn’t support the positioning.',
      3: 'Marathon runners choose drinks for performance; a matching can isn’t what they value.',
    },
    solution: 'Luxury claims against low ratings: not credible. An app everyone has: not distinct. Artisan bread at the lowest price in plastic: not consistent. Fashion for marathon runners: not relevant.',
  },
  {
    id: 'm05-st-k5', type: 'mc', kind: 'conceptual',
    prompt: 'How does a positioning statement differ from a tagline?',
    options: [
      'The statement is internal and complete; the tagline is a short line for customers',
      'The statement is for customers; the tagline guides the team that delivers the offer',
      'They are the same thing written at different lengths for different readers',
      'The tagline comes first, and the statement is written to explain the tagline',
    ],
    answer: 0,
    feedback: {
      1: 'The other way round: customers never see the positioning statement.',
      2: 'They do different jobs. A tagline can change with each campaign; the positioning shouldn’t.',
      3: 'Writing the line first tends to produce something clever with no target or proof behind it.',
    },
    solution: 'A positioning statement is an internal summary of target, frame, point of difference and reason to believe, used to keep the whole mix consistent. A tagline is a catchphrase for customers that sums up the offer’s essence, and it should follow from the positioning.',
  },
  {
    id: 'm05-st-k6', type: 'multi', kind: 'applied',
    prompt: 'Which of these could serve as reasons to believe for customers in Lantern Cold Brew’s positioning? Select all that apply.',
    options: [
      'It is single-origin Ethiopian coffee steeped for 20 hours.',
      'It comes from an independent coffee company based in Harbour City.',
      'People who know Lantern rated its taste 5.92 out of 7 in Ana’s survey.',
      'Lantern Cold Brew is closer to the Craft and local ideal point on the map.',
    ],
    answer: [0, 1],
    feedback: {
      2: 'That is evidence for Ana, from 61 people rating Lantern’s cafés and beans; it isn’t a fact about the can that customers can check.',
      3: 'Customers never see the map, and the map rates Lantern as a brand; the survey didn’t rate the can.',
    },
    solution: 'A reason to believe is something customers can check about the offer: the coffee and the steeping method, and the local, independent company behind it. Survey ratings and map distances are the evidence Ana used to choose the position; they aren’t proof that customers can see.',
  },
];
