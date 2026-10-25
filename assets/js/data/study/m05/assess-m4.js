// assess-m4.js — M05 module 4 test: Positioning (perceptual-maps, positioning-statements, differentiation-and-repositioning).
// New questions on new businesses (an airline, a supermarket chain, Halvard Journeys, a frozen-meals maker, a dog-food brand, a plant nursery,
// a theatre, a bank's app, a supermarket's own label, a cinema chain and a regional newspaper, all fictional), with angles the lessons
// don't drill: the share of an attribute left off a map, choosing the nearest of several ideals, reasons a gap can be
// empty, how the frame decides parity, sizing a concept cell, a move from two rating changes at once and sizing a tracking wave. No hints; solutions
// are shown when the student reviews the test. Every num item's `check` recomputes its answer.
import { normInv, sampleSizeForPower } from '../../../core/inference.js?v=14';

// Halvard Journeys (fictional): its position and three segments' ideal points
const HV = { at: [1.2, -0.4], ideals: { adventure: [2.0, 0.3], comfort: [0.6, -1.5], budget: [-1.8, 0.9] } };
const hd = (p) => Math.hypot(HV.at[0] - p[0], HV.at[1] - p[1]);
// a bank's app (fictional): movement per rating point on two attributes
const BK = { at: [-0.8, 0.2], ease: [0.30, 0.10], safe: [-0.05, 0.40], dEase: 1.5, dSafe: 0.5, ideal: [0.3, 0.9] };
const bkNew = [BK.at[0] + BK.dEase * BK.ease[0] + BK.dSafe * BK.safe[0], BK.at[1] + BK.dEase * BK.ease[1] + BK.dSafe * BK.safe[1]];
const r2 = (v) => Math.round(v * 100) / 100, r1 = (v) => Math.round(v * 10) / 10;
const z = normInv(0.975);

export const items = [
  // ---------------------------------------------------------------- perceptual-maps
  {
    id: 'm05-m4-1', lesson: 'perceptual-maps', type: 'num', kind: 'numerical',
    prompt: 'On a principal-components map of airlines (fictional), the arrow for “legroom” has loadings of 0.45 on Dimension 1 and −0.60 on Dimension 2. What percentage of how the airlines differ on legroom lies off the map, on the dimensions not drawn? Give one decimal place.',
    answer: 43.8, check: () => 100 * (1 - (0.45 ** 2 + 0.60 ** 2)), unit: '%', places: 1, tol: 0.06,
    wrong: [
      { value: 56.3, say: 'That is the share on the map, 0.45² + 0.60². The question asks what is left off it: 1 minus that.' },
      { value: 25, say: 'You subtracted the arrow’s length (0.75) from 1. The share of variance uses the squared loadings: 1 − (0.45² + 0.60²).' },
      { value: -5, say: 'Loadings are correlations: square them before adding. 1 − (0.45 + 0.60) is not a share of anything.' },
    ],
    solution: 'The communality is 0.45² + (−0.60)² = 0.2025 + 0.36 = 0.5625, so the map shows 56.25% of the airlines’ differences on legroom and 43.75%, about 43.8%, lies off it. Readers should check the table of means before drawing conclusions about legroom from the picture.',
  },
  {
    id: 'm05-m4-2', lesson: 'perceptual-maps', type: 'mc', kind: 'applied',
    prompt: 'On a perceptual map of five supermarket chains (fictional), the arrows for “fresh produce” and “helpful staff” point to the upper right, close together, and the arrow for “low prices” points to the left. One chain sits far out to the upper right. Which conclusion does the map support?',
    options: [
      'That chain’s shoppers care more about fresh produce and helpful staff than about price',
      'Helpful staff make shoppers rate a chain’s produce as fresher than it is',
      'It is rated above the others on produce and staff, and lower on low prices (dearer)',
      'The chain should cut its prices to move into the empty space on the left',
    ],
    answer: 2,
    feedback: {
      0: 'The map describes how chains are seen, not what shoppers want. Importance comes from needs data.',
      1: 'Arrows close together mean the two ratings go together across these chains; that is a correlation, not a cause.',
      3: 'The left of the map is where cheaper chains sit; moving there would give up what the chain is rated highly for, and an empty space needs demand behind it.',
    },
    solution: 'A brand far along an arrow is rated high on that attribute relative to the others; one far from the “low prices” arrow, which points the other way, is rated lower on low prices: seen as dearer. On a map that draws brands by scores and arrows by correlations these readings are rough, so check the means. The map says nothing about importance or causes.',
  },
  {
    id: 'm05-m4-3', lesson: 'perceptual-maps', type: 'num', kind: 'numerical',
    prompt: `Halvard Journeys (fictional), a travel company, sits at (${HV.at[0]}, −0.4) on its market’s perceptual map. Three segments’ ideal points are: adventure seekers (2.0, 0.3), comfort seekers (0.6, −1.5) and budget backpackers (−1.8, 0.9). How far is Halvard from the nearest of the three ideals? Give two decimal places.`,
    answer: r2(Math.min(...Object.values(HV.ideals).map(hd))), check: () => Math.min(Math.hypot(1.2 - 2.0, -0.4 - 0.3), Math.hypot(1.2 - 0.6, -0.4 + 1.5), Math.hypot(1.2 + 1.8, -0.4 - 0.9)), unit: 'map units', places: 2, tol: 0.006,
    wrong: [
      { value: r2(hd(HV.ideals.comfort)), say: 'That is the comfort seekers’ distance, the second nearest. The adventure seekers’ ideal is closer: √(0.8² + 0.7²).' },
      { value: r2(hd(HV.ideals.adventure) ** 2), say: 'That is the squared distance to the adventure seekers. Take the square root.' },
      { value: 1.5, say: 'You added the differences (0.8 + 0.7). The straight-line distance squares them, adds and takes the square root.' },
    ],
    solution: `Adventure seekers: √(0.8² + 0.7²) = √1.13 ≈ ${hd(HV.ideals.adventure).toFixed(2)}. Comfort seekers: √(0.6² + 1.1²) = √1.57 ≈ ${hd(HV.ideals.comfort).toFixed(2)}. Budget backpackers: √(3.0² + 1.3²) ≈ ${hd(HV.ideals.budget).toFixed(2)}. The nearest is the adventure seekers’ ideal, ${hd(HV.ideals.adventure).toFixed(2)} away.`,
  },
  {
    id: 'm05-m4-4', lesson: 'perceptual-maps', type: 'multi', kind: 'conceptual',
    prompt: 'A frozen-meals maker (fictional) finds an empty space on its map where a brand would be seen as both the most nutritious and the cheapest. Which of these could explain why the space is empty? Select all that apply.',
    options: [
      'Nutritious recipes cost more to make, so a brand there couldn’t cover its costs.',
      'No segment of shoppers has an ideal point near that space.',
      'Shoppers wouldn’t believe a brand that claimed both at once.',
      'A brand the survey didn’t ask about may already be seen that way.',
      'Gaps on a principal-components map are produced by the arbitrary signs of the axes.',
    ],
    answer: [0, 1, 2, 3],
    feedback: {
      4: 'Flipping an axis moves every point together; it can’t create or remove a gap between brands.',
    },
    solution: 'A gap can be empty because it can’t be delivered at a profit, because nobody wants it, because a claim there wouldn’t be believed, or because the map leaves out a brand that already holds it. Only after ruling these out is it an opportunity worth testing. Axis signs don’t create gaps.',
  },
  // ---------------------------------------------------------------- positioning-statements
  {
    id: 'm05-m4-5', lesson: 'positioning-statements', type: 'classify', kind: 'applied',
    prompt: 'A plant nursery (fictional) must frame its new houseplant service either as “a garden centre”, against local garden centres that don’t deliver, or as “an online plant shop”, against national websites with no premises and no staff to talk to in person. Classify each feature by the frame in which it would be a point of difference.',
    items: [
      'Delivery to your door within two days.',
      'A nursery you can visit to choose your own plants.',
      'Staff on hand to answer questions in person.',
      'A free video call with a horticulturist about the plants that suit your light.',
      'Prices close to both the garden centres’ and the national websites’.',
    ],
    categories: ['A difference only as a garden centre', 'A difference only as an online plant shop', 'A difference in both frames', 'Parity in both frames'],
    answer: [0, 1, 1, 2, 3],
    feedback: {
      0: 'Garden centres don’t deliver, so delivery sets it apart from them; every national website delivers, so online it is parity.',
      1: 'Websites have no premises, so a nursery to visit stands out online; every garden centre has one.',
      2: 'People to talk to in person are normal in a garden centre and missing online.',
      3: 'Neither rival offers this, so it is a difference whichever frame is chosen.',
      4: 'Matching both rivals’ prices keeps the nursery in either comparison without setting it apart.',
    },
    solution: 'The frame decides the rivals, and the rivals decide what is parity. Delivery is a difference only against garden centres; premises and staff in person are differences only against websites; the video call is a difference in both; matching prices is parity in both.',
  },
  {
    id: 'm05-m4-6', lesson: 'positioning-statements', type: 'mc', kind: 'conceptual',
    prompt: 'A dog-food brand (fictional) positions on “easier digestion for sensitive dogs”. Which is the strongest reason to believe?',
    options: [
      'Its packaging shows a calm, healthy-looking dog beside a bowl on every bag',
      'Each recipe passes a published feeding trial run by a vet school',
      'Eight in ten owners in its own survey say their dogs love the taste',
      'Its sales grew faster last year than any other brand in the premium aisle',
    ],
    answer: 1,
    feedback: {
      0: 'An image asserts the benefit; it doesn’t prove it.',
      2: 'Liking the taste is a different benefit from digestion.',
      3: 'Growth shows popularity, not that the food is easier to digest.',
    },
    solution: 'A reason to believe is a checkable fact that makes the point of difference credible. A published feeding trial is provable and speaks directly to digestion; the others either assert, change the subject or point to popularity.',
  },
  {
    id: 'm05-m4-7', lesson: 'positioning-statements', type: 'num', kind: 'numerical',
    prompt: 'A theatre (fictional) will test three positioning concepts, monadically. It wants each concept’s top-two-box share to have a 95% margin of error of no more than ±5 percentage points, expecting shares of about 40%. How many respondents does each concept cell need? Use z* = 1.96 and round up to a whole person.',
    answer: Math.ceil(z ** 2 * 0.4 * 0.6 / 0.05 ** 2), check: () => Math.ceil(1.959964 ** 2 * 0.4 * 0.6 / 0.0025), unit: 'respondents', places: 0, tol: 0.5,
    wrong: [
      { value: Math.ceil(z ** 2 * 0.25 / 0.05 ** 2), say: 'That uses p = 0.5, the most cautious assumption; the theatre expects about 40%, so use 0.4 × 0.6.' },
      { value: Math.ceil(z ** 2 * 0.4 * 0.6 / 0.10 ** 2), say: 'That gives ±10 points: the margin is 0.05, half the interval’s width, not 0.10.' },
      { value: Math.ceil(3 * z ** 2 * 0.4 * 0.6 / 0.05 ** 2), say: 'That is the total for three cells. The question asks for each cell.' },
    ],
    solution: `n = z*² × p(1 − p) ÷ margin² = 1.96² × 0.40 × 0.60 ÷ 0.05² ≈ ${(z ** 2 * 0.24 / 0.0025).toFixed(1)}, so ${Math.ceil(z ** 2 * 0.24 / 0.0025)} per concept and about ${3 * Math.ceil(z ** 2 * 0.24 / 0.0025)} in all. Even then, two concepts would need to differ by more than about 7 points before the difference could be trusted.`,
  },
  // ---------------------------------------------------------------- differentiation-and-repositioning
  {
    id: 'm05-m4-8', lesson: 'differentiation-and-repositioning', type: 'classify', kind: 'conceptual',
    prompt: 'Halvard Journeys (fictional) lists ways it is different from online booking sites. Classify each by the way it differentiates.',
    items: [
      'Itineraries built around each traveller’s pace, with rest days planned in.',
      'A helpline answered by a person at any hour while you travel.',
      'Booking in person at partner travel agents in twelve towns.',
      'Guides who live in the regions they show you.',
      'Sponsoring a well-known award for responsible travel writing.',
    ],
    categories: ['Product', 'Services', 'Channels', 'People', 'Image'],
    answer: [0, 1, 2, 3, 4],
    feedback: {
      0: 'The trip itself: product.',
      1: 'Help around the trip: services.',
      2: 'Where and how it is bought: channels.',
      3: 'Who delivers it: people.',
      4: 'An association the brand buys into: image.',
    },
    solution: 'Tailored itineraries are the product; the round-the-clock helpline a service; partner agents a channel; local guides people; the award sponsorship image.',
  },
  {
    id: 'm05-m4-9', lesson: 'differentiation-and-repositioning', type: 'num', kind: 'applied',
    prompt: `A bank (fictional) sits at (−0.8, 0.2) on a perceptual map of banks’ apps. On that map, each rating point on “easy to use” moves an app by (+0.30, +0.10), and each point on “feels safe” by (−0.05, +0.40). The bank plans to raise its “easy to use” rating by ${BK.dEase} points and its “feels safe” rating by ${BK.dSafe}, with the axes fixed. How far will it then be from the young savers’ ideal at (0.3, 0.9)? Give two decimal places.`,
    answer: r2(Math.hypot(bkNew[0] - BK.ideal[0], bkNew[1] - BK.ideal[1])), check: () => Math.hypot(-0.8 + 1.5 * 0.30 + 0.5 * -0.05 - 0.3, 0.2 + 1.5 * 0.10 + 0.5 * 0.40 - 0.9), unit: 'map units', places: 2, tol: 0.006,
    wrong: [
      { value: r2(Math.hypot(BK.at[0] + BK.dEase * BK.ease[0] - BK.ideal[0], BK.at[1] + BK.dEase * BK.ease[1] - BK.ideal[1])), say: 'You applied the “easy to use” change only. The movements from the two ratings add.' },
      { value: r2(Math.hypot(BK.at[0] - BK.ideal[0], BK.at[1] - BK.ideal[1])), say: 'That is today’s distance. Move the bank first.' },
      { value: r2(Math.hypot(BK.at[0] + BK.ease[0] + BK.safe[0] - BK.ideal[0], BK.at[1] + BK.ease[1] + BK.safe[1] - BK.ideal[1])), say: 'You moved one point on each attribute. Multiply each movement by its planned change, 1.5 and 0.5.' },
    ],
    solution: `New position: Dimension 1 −0.8 + 1.5 × 0.30 + 0.5 × (−0.05) = ${bkNew[0].toFixed(3)}; Dimension 2 0.2 + 1.5 × 0.10 + 0.5 × 0.40 = ${bkNew[1].toFixed(2)}. Distance to (0.3, 0.9): √(${(BK.ideal[0] - bkNew[0]).toFixed(3)}² + ${(BK.ideal[1] - bkNew[1]).toFixed(2)}²) ≈ ${Math.hypot(bkNew[0] - BK.ideal[0], bkNew[1] - BK.ideal[1]).toFixed(2)}, down from ${Math.hypot(BK.at[0] - BK.ideal[0], BK.at[1] - BK.ideal[1]).toFixed(2)}.`,
  },
  {
    id: 'm05-m4-10', lesson: 'differentiation-and-repositioning', type: 'mc', kind: 'applied',
    prompt: 'A supermarket’s premium own-label coffee (fictional) is rated as good as the leading brand in blind tests and is priced 25% below it. What is its value position, and what does holding it require?',
    options: [
      'More for more: a premium product that needs a premium price behind it to stay credible',
      'The same for less, which lasts only if its costs are lower than the brand’s',
      'Less for much less: it works only once the coffee’s extras are stripped out',
      'More for less: the strongest position, and one that needs nothing further to hold',
    ],
    answer: 1,
    feedback: {
      0: 'It is priced below the leading brand, not above it.',
      2: 'Blind tests rate it as good as the brand: nothing has been stripped out.',
      3: 'Its benefits are equal, not greater; and more for less is the hardest position to hold, not the easiest.',
    },
    solution: 'Equal benefits at a lower price is “the same for less”. It lasts only if the seller’s costs are lower, which an own label often achieves (no national advertising, its own shelves, no trade margin to a brand owner). Without that, a price war would erode it.',
  },
  {
    id: 'm05-m4-11', lesson: 'differentiation-and-repositioning', type: 'num', kind: 'numerical',
    prompt: 'A cinema chain (fictional) tracks how its brand is rated on “good value” in a survey repeated each year. Ratings have a standard deviation of about 1.1. How many ratings of the chain does each wave need to detect a change of 0.25 points between two waves with 80% power, testing two-sided at 5%? Use the normal approximation and round up.',
    answer: sampleSizeForPower({ delta: 0.25, sigma: 1.1, twoSample: true }), check: () => 2 * ((1.959964 + 0.841621) * 1.1 / 0.25) ** 2, unit: 'ratings per wave', places: 0, tol: 1,
    wrong: [
      { value: Math.ceil(((1.959964 + 0.841621) * 1.1 / 0.25) ** 2), say: 'That is the one-sample size. Both waves are estimates, so the two-sample formula has a factor of 2.' },
      { value: Math.ceil(2 * (1.959964 * 1.1 / 0.25) ** 2), say: 'You left out the power term. For 80% power add z = 0.84 to 1.96 before squaring.' },
      { value: Math.ceil(2 * (1.959964 + 0.841621) ** 2 * 1.1 / 0.25 ** 2), say: 'You used the standard deviation where the formula needs the variance, 1.1².' },
    ],
    solution: `n per wave = 2 × (z₀.₉₇₅ + z₀.₈₀)² × σ² ÷ δ² = 2 × (1.960 + 0.842)² × 1.1² ÷ 0.25² ≈ ${(2 * ((1.959964 + 0.841621) * 1.1 / 0.25) ** 2).toFixed(1)}, so ${sampleSizeForPower({ delta: 0.25, sigma: 1.1, twoSample: true })} ratings of the chain in each wave. If only some respondents rate the chain, the survey itself must be larger.`,
  },
  {
    id: 'm05-m4-12', lesson: 'differentiation-and-repositioning', type: 'mc', kind: 'conceptual',
    prompt: 'A regional newspaper (fictional) relaunches as “the city’s fastest breaking-news app”, but its app still updates once a day. Readers soon mock the slogan. Which repositioning pitfall is this?',
    options: [
      'Underestimating a “back to basics” approach that would have worked better',
      'Overpromising: a claim the organisation can’t live up to',
      'A confusing positioning that mixes several different messages',
      'Repositioning when no trigger, such as falling demand, was present',
    ],
    answer: 1,
    feedback: {
      0: 'Going back to basics might have been the better route, but the failure described is a promise the product contradicts.',
      2: 'The message is clear; it just isn’t true.',
      3: 'A relaunch suggests a trigger; the failure is in the claim, not the timing.',
    },
    solution: 'Promising speed the app doesn’t deliver is overpromising, and it is also “a bridge too far”: readers stop believing the claim. The new position should have followed changes customers could experience, faster updates first, the slogan afterwards.',
  },
];
