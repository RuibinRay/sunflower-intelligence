// assess-diagnostic.js — M04 course diagnostic: three items per module, each written so that it needs that module’s own
// method, not what B01, B04 and M01 already teach (expected value, sampling designs in outline, the margin of error,
// survey wording basics), so that a student who knows only those courses misses module 1’s items and one who already has
// a module’s methods gets its items right.
// Module 1: the most research could be worth to a decision (the expected value of perfect information), a pitch’s
// market figure judged against a floor and a grossed-up, wider-defined ceiling, and the agreement two coders would need
// for Cohen’s kappa to reach a rule’s 0.80, from a three-theme table.
// Module 2: a Likert score reverse-coded on a 0–4 coding, the cluster slots that match a simple random sample’s
// precision, Kish’s design effect of three weights. Module 3: which figure is the serviceable obtainable market,
// producers’ value with channel-weighted trade margins, a like-for-like price premium (per 100 g, one channel, regular
// prices). Module 4: the margin of error of a Net Promoter Score, a weighted share from Lantern’s 516 completes, words
// for a gap whose interval includes zero.
// Modules 1–3 use only mc, num and formula items, which score 0 or 1, so that the route below can’t be passed on part
// marks; module 4 is not used for routing. New questions on businesses used nowhere else on the site (all fictional),
// not copies of lesson exercises, module tests, the final or the project, and nothing from the project’s scenario or
// data. No hints; solutions are shown on review. Every num item’s `check` recomputes its answer, and the formula item is
// marked by its results on the sheet and on changed copies.
import { RESPONDENT_COLUMNS, RESPONDENT_ROWS, RESPONDENTS, LEVELS, SIZES, tableCells, DERIVED } from './case.js?v=17';
import * as S from '../../../core/survey.js?v=17';
import * as I from '../../../core/inference.js?v=17';

const r = (x, p) => Math.round(x * 10 ** p) / 10 ** p;
const fx = (v, d = 2) => v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
const usd = (v) => `${v < 0 ? '−' : ''}$${Math.abs(Math.round(v)).toLocaleString('en-US')}`;
const pc = (v, d = 1) => `${fx(v * 100, d)}%`;
const sgn = (v, d = 1) => `${v < 0 ? '−' : '+'}${fx(Math.abs(v), d)}`;
const sum = (a) => a.reduce((s, x) => s + x, 0);
const Z = I.normInv(0.975);

// ---------------------------------------------------------------- module 1
// Tarnmoor Cider (fictional): a large or small batch of a new perry, or none; strong demand 30%
const CID = { p: 0.3, large: [60000, -35000], small: [18000, 4000], none: [0, 0] };
const ev = (o) => CID.p * o[0] + (1 - CID.p) * o[1];
const cidBest = Math.max(ev(CID.large), ev(CID.small), ev(CID.none));
const cidPerfect = CID.p * Math.max(CID.large[0], CID.small[0], 0) + (1 - CID.p) * Math.max(CID.large[1], CID.small[1], 0);
const cidEvpi = cidPerfect - cidBest;
// a frozen-berry brand's city (fictional): household diaries (a floor) and a trade association (a wider ceiling)
const BER = { households: 150000, perMonth: 0.4, members: 1.05e6, coverage: 0.7, claim: 1.75e6 };
const berFloor = BER.households * BER.perMonth * 12, berCeiling = BER.members / BER.coverage;
const mn = (v, d = 2) => `${fx(v / 1e6, d)} million`;
// a swimming pool's comment cards (fictional): rows coder 1, columns coder 2
const POOL_THEMES = ['Service', 'Price', 'Facilities'];
const POOL = [[26, 2, 2], [3, 13, 2], [1, 2, 9]];
const poolN = sum(POOL.map(sum));
const poolRow = POOL.map(sum), poolCol = POOL_THEMES.map((_, j) => sum(POOL.map((row) => row[j])));
const poolPo = sum(POOL.map((row, i) => row[i])) / poolN;
const poolPe = sum(poolRow.map((x, i) => x * poolCol[i])) / poolN ** 2;
const poolK = (poolPo - poolPe) / (1 - poolPe);
const poolAgree = sum(POOL.map((row, i) => row[i]));                    // 48 cards now
const KRULE = 0.8;                                                      // the pool's rule for using a codebook
const poolNeedRaw = (KRULE + (1 - KRULE) * poolPe) * poolN;             // p_o = κ + (1 − κ) p_e, in cards
const poolNeed = Math.ceil(poolNeedRaw - 1e-9);
const kappaAt = (cards) => (cards / poolN - poolPe) / (1 - poolPe);

// ---------------------------------------------------------------- module 2
// a library's 'welcoming space' scale (fictional): codes 0–4, items 2 and 4 reverse-worded
const LIB = { answers: [3, 1, 4, 0], reversed: [false, true, false, true], lo: 0, hi: 4 };
const libScore = (rule) => sum(LIB.answers.map((x, j) => (LIB.reversed[j] ? rule(x) : x))) / LIB.answers.length;
// a farmers' market (fictional): 15-minute slots of about 12 shoppers, ICC 0.05, to match an SRS of 400
const MKT = { per: 12, rho: 0.05, srs: 400 };
const mktSlots = (deff) => Math.ceil((MKT.srs * deff) / MKT.per - 1e-9);
const mktDeff = 1 + (MKT.per - 1) * MKT.rho;
// Thornlow Playhouse (fictional): weights 2, 5 and 10
const PLAY = { groups: ['members', 'regular bookers', 'occasional bookers'], N: [600, 1000, 1000], n: [300, 200, 100] };
const playW = PLAY.N.map((k, i) => k / PLAY.n[i]);
const playAll = PLAY.n.flatMap((k, i) => Array(k).fill(playW[i]));
const PK = S.kish(playAll), PK3 = S.kish(playW);

// ---------------------------------------------------------------- module 3
// a laundry-delivery start-up (fictional)
const LAU = { city: 60e6, served: 21e6, pilotShare: 0.03, target: 1.5e6 };
const lauSom = LAU.served * LAU.pilotShare;
const m$ = (v) => (v >= 1e6 ? `$${fx(v / 1e6, v % 1e6 ? 1 : 0)} million` : `$${Math.round(v).toLocaleString('en-US')}`);
// a region's chilled-soup category (fictional): channel volumes and the trade's share of the shelf price
const SOUP = { pots: 2.4e6, price: 3.0, channels: [['supermarkets', 0.55, 0.30], ['convenience stores', 0.30, 0.40], ['farm shops', 0.15, 0.25]] };
const soupShelf = SOUP.pots * SOUP.price;
const soupTrade = sum(SOUP.channels.map(([, v, m]) => v * m));
const soupSimple = sum(SOUP.channels.map(([, , m]) => m)) / SOUP.channels.length;
// a hummus brand (fictional): 200 g pots against a rival's 250 g pots, six stores
const HUM = { own: 200, rival: 250, stores: [
  ['S1', 'Supermarket', 2.40, 2.75, false], ['S2', 'Supermarket', 2.40, 2.10, true], ['S3', 'Supermarket', 2.50, 2.85, false],
  ['S4', 'Supermarket', 2.30, 2.80, false], ['D1', 'Delicatessen', 2.90, null, false], ['D2', 'Delicatessen', 2.80, null, false],
] };
const avg = (a) => sum(a) / a.length;
const humSup = HUM.stores.filter((s) => s[1] === 'Supermarket');
const humOwn = avg(humSup.map((s) => s[2])), humOwnAll = avg(HUM.stores.map((s) => s[2]));
const humRivalReg = avg(humSup.filter((s) => !s[4]).map((s) => s[3])), humRivalAll = avg(humSup.map((s) => s[3]));
const per100 = (price, g) => (price / g) * 100;
const prem = (own, rival) => (own / rival - 1) * 100;
const humKey = prem(per100(humOwn, HUM.own), per100(humRivalReg, HUM.rival));

// ---------------------------------------------------------------- module 4
// a vet practice's clients (fictional)
const VET = S.nps({ promoters: 168, passives: 104, detractors: 48 });
// Lantern's 516 completes: segment, first heard, weight
const W = DERIVED.weights.perStratum;
const L = RESPONDENTS.length + 1;                                       // last data row, 517
const heardCells = {
  ...tableCells(RESPONDENT_COLUMNS, RESPONDENT_ROWS, { cols: ['respondent', 'segment', 'first_heard'] }).cells,
  D1: 'weight', ...Object.fromEntries(RESPONDENTS.map((x, i) => [`D${i + 2}`, W[x.stratum]])),
  F1: LEVELS.heard[1], E1: 'first heard', E2: 'weighted share',
};
const wHeard = (k) => sum(RESPONDENTS.map((x) => (x.heard === k ? W[x.stratum] : 0))) / sum(RESPONDENTS.map((x) => W[x.stratum]));
const uHeard = (k) => RESPONDENTS.filter((x) => x.heard === k).length / RESPONDENTS.length;
// a sports centre's booking app (fictional): two age groups
const APP = I.propTest2(83, 180, 82, 210);

export const items = [
  // ================================================================ Module 1: planning research
  {
    id: 'm04-dg-1', lesson: 'the-research-process', type: 'num', kind: 'applied',
    prompt: 'Tarnmoor Cider (fictional) must decide before the pear harvest whether to make a large batch of a new perry (pear cider), a small batch or none. The owner’s estimates of the season’s profit are in the table, and she puts the chance of strong demand at 30%. What is the most that research telling her in advance whether demand will be strong or weak could be worth to this decision? Give dollars.',
    data: { table: { head: ['Option', 'Strong demand', 'Weak demand'], rows: [['Large batch', '+$60,000', '−$35,000'], ['Small batch', '+$18,000', '+$4,000'], ['No perry this year', '$0', '$0']] } },
    answer: cidEvpi,
    check: () => (0.3 * 60000 + 0.7 * 4000) - Math.max(0.3 * 60000 - 0.7 * 35000, 0.3 * 18000 + 0.7 * 4000, 0),
    unit: '$', places: 0, tol: 0.5,
    wrong: [
      { value: cidPerfect, say: 'That is the expected profit of deciding with perfect information. What the information is worth is its gain over the best choice without it, the small batch.' },
      { value: cidPerfect - ev(CID.large), say: 'That subtracts the large batch’s expected profit, which is negative. Without research she would choose the option with the highest expected value, the small batch at $8,200.' },
      { value: CID.p * CID.large[0] - cidBest, say: 'With perfect information and weak demand she would still make the small batch and earn $4,000, not $0: take the best option in each state.' },
    ],
    solution: `Expected profit without research: large batch 0.3 × 60,000 + 0.7 × (−35,000) = ${usd(ev(CID.large))}; small batch 0.3 × 18,000 + 0.7 × 4,000 = ${usd(ev(CID.small))}; none $0. She would make the small batch, expecting ${usd(cidBest)}. With perfect information she would make the large batch if demand were strong ($60,000) and the small one if it were weak ($4,000): 0.3 × 60,000 + 0.7 × 4,000 = ${usd(cidPerfect)}. The expected value of perfect information is ${usd(cidPerfect)} − ${usd(cidBest)} = ${usd(cidEvpi)}, a ceiling: a study costing more can’t pay for itself, and a real study, being imperfect, is worth less.`,
  },
  {
    id: 'm04-dg-2', lesson: 'secondary-research', type: 'mc', kind: 'conceptual',
    prompt: `A fictional frozen-berry brand’s pitch says that its city’s shops sell ${mn(BER.claim)} kg of frozen berries a year. The city’s statistics office estimates ${BER.households.toLocaleString('en-US')} households, and its household spending diaries found an average of ${BER.perMonth} kg of frozen berries bought a household a month. A trade association says its members sold ${mn(BER.members)} kg of “frozen fruit” (berries, mango, smoothie packs and fruit-and-vegetable mixes) last year, and that its members make about ${Math.round(BER.coverage * 100)}% of the city’s grocery sales. What should an investor conclude about the pitch’s figure?`,
    options: [
      `Too high: even the association’s wider category, grossed up for the sales its members miss, comes to only ${mn(berCeiling, 1)} kg.`,
      `Plausible: it is well above the households’ own ${mn(berFloor)} kg a year, and that figure is only a floor for the whole market.`,
      `Slightly high but plausible: the association’s grossed-up ${mn(berCeiling, 1)} kg estimates the market, and the pitch is only a sixth above it.`,
      'Impossible to judge: the two sources count different products and different buyers, so neither of them can be compared with the pitch.',
    ],
    answer: 0,
    feedback: {
      1: 'Being above the floor is necessary, not enough. The association’s figure, grossed up, is a ceiling, and the pitch is above it too.',
      2: 'The association counts mango, smoothie packs and mixes as well as berries, so its grossed-up figure is a ceiling for frozen berries, not an estimate of them.',
      3: 'Different definitions don’t make sources useless: they make one a floor and the other a ceiling, which is enough to test the claim.',
    },
    solution: `Scale the diary rate to the city: ${BER.households.toLocaleString('en-US')} × ${BER.perMonth} × 12 = ${Math.round(berFloor).toLocaleString('en-US')} kg, a floor, since it counts households only and diaries tend to under-report. Gross up the association’s figure for coverage: ${mn(BER.members)} ÷ ${BER.coverage} = ${mn(berCeiling, 1)} kg, but its definition is wider than frozen berries, so that is a ceiling. The pitch’s ${mn(BER.claim)} kg is above the ceiling: some assumption behind it is wrong, and the brand should be asked where it came from.`,
  },
  {
    id: 'm04-dg-3', lesson: 'qualitative-research', type: 'num', kind: 'numerical',
    prompt: `Two staff at a fictional swimming pool independently coded ${poolN} comment cards into three themes. The table counts the cards by the theme each coder chose: rows for coder 1, columns for coder 2. The pool uses a codebook only once Cohen’s kappa reaches at least ${fx(KRULE)}. After sharpening the codebook’s rules the two recode the cards. If each coder’s totals for the three themes stayed as they are, on how many of the ${poolN} cards would they need to agree for kappa to reach ${fx(KRULE)}? Give a whole number.`,
    data: { table: { head: ['Coder 1 ↓ / coder 2 →', ...POOL_THEMES, 'Total'], rows: [...POOL.map((row, i) => [POOL_THEMES[i], ...row.map(String), String(poolRow[i])]), ['Total', ...poolCol.map(String), String(poolN)]] } },
    answer: poolNeed,
    check: () => Math.ceil((0.8 + 0.2 * ((30 * 30 + 18 * 17 + 12 * 13) / 3600)) * 60 - 1e-9),
    unit: 'cards', places: 0, tol: 0.5,
    wrong: [
      { value: Math.round(KRULE * poolN), say: `That is 80% of the cards, as if kappa were the percent agreement; it is also what they agree on now, with κ ≈ ${fx(poolK, 2)}. Some agreement is expected by chance, so κ = 0.80 needs p_o = 0.80 + 0.20 × p_e.` },
      { value: Math.floor(poolNeedRaw), say: `${Math.floor(poolNeedRaw)} cards give p_o = ${fx(Math.floor(poolNeedRaw) / poolN, 3)} and κ ≈ ${fx(kappaAt(Math.floor(poolNeedRaw)), 3)}, just short of 0.80: round up.` },
      { value: Math.ceil(KRULE * (1 - poolPe) * poolN - 1e-9), say: 'That solves for p_o − p_e, the agreement beyond chance. Add the chance agreement back: p_o = 0.80 × (1 − p_e) + p_e.' },
      { value: poolNeed - poolAgree, say: `That is how many more cards than the present ${poolAgree} they would need to agree on. The question asks for the total.` },
    ],
    solution: `With the coders’ totals unchanged, chance agreement stays p_e = (30 × 30 + 18 × 17 + 12 × 13) ÷ 60² = 1,362 ÷ 3,600 = ${fx(poolPe, 4)}. Kappa reaches 0.80 when (p_o − p_e) ÷ (1 − p_e) = 0.80, that is p_o = 0.80 + 0.20 × ${fx(poolPe, 4)} = ${fx(poolNeedRaw / poolN, 4)}, or ${fx(poolNeedRaw, 1)} of the 60 cards: at least ${poolNeed}, ${poolNeed - poolAgree} more than the ${poolAgree} they agree on now (κ ≈ ${fx(poolK, 2)}). Recoding usually shifts the totals too, so recompute kappa from the new table, and read the disagreements to see which rules still need work.`,
  },

  // ================================================================ Module 2: surveys and samples
  {
    id: 'm04-dg-4', lesson: 'questionnaire-design', type: 'num', kind: 'numerical',
    prompt: 'A fictional library’s survey codes its agreement items from 0 (strongly disagree) to 4 (strongly agree). Its four-item “welcoming space” scale includes two items worded the opposite way: item 2 (“The library feels unwelcoming”) and item 4 (“I feel out of place in the library”). One respondent answered items 1 to 4 with 3, 1, 4 and 0. What is the respondent’s scale score, the average after reverse-coding? Give two decimal places.',
    answer: libScore((x) => LIB.lo + LIB.hi - x),
    check: () => (3 + (4 - 1) + 4 + (4 - 0)) / 4,
    unit: '', places: 2, tol: 0.005,
    wrong: [
      { value: avg(LIB.answers), say: 'That averages the raw codes. Items 2 and 4 run the other way, so reverse them before averaging.' },
      { value: libScore((x) => 6 - x), say: '6 − x is the rule for a scale coded 1 to 5. The reversed code is (lowest + highest) − x, here (0 + 4) − x.' },
      { value: libScore((x) => 5 - x), say: 'On a 0–4 coding the reversed code is (0 + 4) − x = 4 − x, which turns 1 into 3 and 0 into 4.' },
      { value: (3 + 3 + 4 + 0) / 4, say: 'Item 4 is reverse-worded too: its 0 becomes 4.' },
      { value: sum(LIB.answers.map((x, j) => (LIB.reversed[j] ? 4 - x : x))), say: 'That is the sum. The score asked for is the average, which stays on the 0–4 range.' },
    ],
    solution: 'The reversed code is (lowest + highest) − x = (0 + 4) − x. Item 2: 4 − 1 = 3; item 4: 4 − 0 = 4. Score = (3 + 3 + 4 + 4) ÷ 4 = 3.50: a respondent who finds the library welcoming. Without reverse-coding the average is 2.00, near the middle, because the agreeing and disagreeing answers cancel.',
  },
  {
    id: 'm04-dg-5', lesson: 'sampling-methods', type: 'num', kind: 'applied',
    prompt: `A fictional farmers’ market will survey shoppers by choosing 15-minute slots at random across its opening hours and interviewing everyone who arrives in each chosen slot, about ${MKT.per} shoppers a slot. Shoppers who arrive in the same slot tend to answer alike: the intraclass correlation is about ${MKT.rho}. How many slots must it sample for its results to be as precise as those of a simple random sample of ${MKT.srs} shoppers? Round up to a whole number of slots.`,
    answer: mktSlots(mktDeff),
    check: () => Math.ceil((400 * (1 + 11 * 0.05)) / 12 - 1e-9),
    unit: 'slots', places: 0, tol: 0.5,
    wrong: [
      { value: mktSlots(1), say: 'That ignores the clustering. Shoppers in the same slot resemble each other, so each slot carries less information: multiply the 400 by the design effect, 1 + (b − 1)ρ, first.' },
      { value: mktSlots(1 + MKT.per * MKT.rho), say: 'The design effect is 1 + (b − 1)ρ, with b − 1 = 11, not b = 12.' },
      { value: Math.ceil(MKT.srs / mktDeff / MKT.per - 1e-9), say: 'Dividing by the design effect gives the effective size of 400 clustered shoppers. To match 400 independent ones, the sample must be larger: multiply.' },
      { value: Math.round(MKT.srs * mktDeff), say: 'That is the number of shoppers needed. The question asks for slots of about 12 shoppers each.' },
    ],
    solution: `deff ≈ 1 + (12 − 1) × 0.05 = ${fx(mktDeff, 2)}, so the clustered sample needs ${MKT.srs} × ${fx(mktDeff, 2)} = ${Math.round(MKT.srs * mktDeff)} shoppers to carry the precision of ${MKT.srs} independent ones (n_eff = n ÷ deff). At 12 a slot that is ${fx((MKT.srs * mktDeff) / MKT.per, 2)}, rounded up to ${mktSlots(mktDeff)} slots. The slots are chosen at random, so this is a probability sample of visits rather than of shoppers: someone who comes every week has more chances of being chosen than someone who comes once a month. It is cheaper per interview and less precise per shopper.`,
  },
  {
    id: 'm04-dg-6', lesson: 'survey-error', type: 'num', kind: 'numerical',
    prompt: `Thornlow Playhouse (fictional) weighted its audience survey to its booking records: ${PLAY.n[0]} of its ${PLAY.N[0]} members replied (weight ${playW[0]}), ${PLAY.n[1]} of its ${PLAY.N[1].toLocaleString('en-US')} regular bookers (weight ${playW[1]}) and ${PLAY.n[2]} of its ${PLAY.N[2].toLocaleString('en-US')} occasional bookers (weight ${playW[2]}). What is the design effect of these weights, by Kish’s rule? Give two decimal places.`,
    answer: r(PK.deff, 2),
    check: () => 600 / ((300 * 2 + 200 * 5 + 100 * 10) ** 2 / (300 * 4 + 200 * 25 + 100 * 100)),
    unit: '', places: 2, tol: 0.005,
    wrong: [
      { value: PK.nEff, tol: 0.6, say: 'That is the effective sample size, (Σw)² ÷ Σw². The design effect compares it with the 600 respondents: n ÷ n_eff.' },
      { value: r(1 / PK.deff, 2), say: 'That is n_eff ÷ n, upside down. The design effect is n ÷ n_eff, at least 1 when the weights are unequal.' },
      { value: r(PK3.deff, 2), say: 'That treats the three weights as three respondents. Every respondent carries a weight: Σw = 300 × 2 + 200 × 5 + 100 × 10.' },
    ],
    solution: `Σw = 300 × 2 + 200 × 5 + 100 × 10 = ${sum(playAll).toLocaleString('en-US')} (the audience the weights stand for); Σw² = 300 × 4 + 200 × 25 + 100 × 100 = ${sum(playAll.map((w) => w * w)).toLocaleString('en-US')}. Kish’s effective sample size is ${sum(playAll).toLocaleString('en-US')}² ÷ ${sum(playAll.map((w) => w * w)).toLocaleString('en-US')} = ${fx(PK.nEff, 1)}, so the design effect of the weights is 600 ÷ ${fx(PK.nEff, 1)} ≈ ${fx(PK.deff, 2)}: the weighted results are about as precise as ${Math.round(PK.nEff)} equally weighted replies. It is a rule of thumb; the design’s own standard error can differ when the groups differ.`,
  },

  // ================================================================ Module 3: markets and competitors
  {
    id: 'm04-dg-7', lesson: 'market-sizing', type: 'mc', kind: 'conceptual',
    prompt: `A fictional laundry-delivery start-up has four figures in its plan. Households in its city spend ${m$(LAU.city)} a year on laundry and dry-cleaning services, from every provider. Its vans can reach districts where ${m$(LAU.served)} of that is spent. A three-month pilot in one district won about ${Math.round(LAU.pilotShare * 100)}% of the spending there, so it expects about ${m$(lauSom)} in its first year. Its founders have set a first-year target of ${m$(LAU.target)}. Which figure is its serviceable obtainable market, as this course defines it?`,
    options: [
      `${m$(lauSom)}: what the pilot suggests it can win in a year in the districts it serves`,
      `${m$(LAU.target)}: the founders’ target for the first year, the most they plan to win`,
      `${m$(LAU.served)}: the spending in the districts its vans can reach, all providers together`,
      `${m$(LAU.city * LAU.pilotShare)}: ${Math.round(LAU.pilotShare * 100)}% of what the whole city spends a year, the pilot’s share applied citywide`,
    ],
    answer: 0,
    feedback: {
      1: 'A target is what the founders want; the SOM is an estimate of what the evidence says they can win. When the two differ, the plan or the target has to change.',
      2: 'That is the serviceable available market: the part of the total its offer and routes to market could serve, whoever wins it.',
      3: 'The share applies to the districts the vans serve. Applying it to the whole city counts customers the start-up can’t reach.',
    },
    solution: `TAM: ${m$(LAU.city)}, the city’s whole spending. SAM: ${m$(LAU.served)}, the part its vans can serve. SOM: ${m$(lauSom)}, the part of the SAM it can realistically win in a year, here from a pilot rather than a guess. The ${m$(LAU.target)} target is not an estimate: it would need ${pc(LAU.target / LAU.served)} of the serviceable spending, about ${fx(LAU.target / lauSom, 1)} times the pilot’s rate, which is the assumption to test before the founders rely on it.`,
  },
  {
    id: 'm04-dg-8', lesson: 'market-sizing', type: 'num', kind: 'numerical',
    prompt: `A fictional region’s chilled-soup category sells ${fx(SOUP.pots / 1e6, 1)} million pots a year at an average shelf price of $${fx(SOUP.price)} a pot, about the same in every channel. Of the pots, ${SOUP.channels.map(([c, v, m], i) => `${i === SOUP.channels.length - 1 ? 'and ' : ''}${Math.round(v * 100)}% are sold through ${c}, which keep ${Math.round(m * 100)}% of the shelf price`).join('; ')}. What are the category’s sales worth a year to the producers? Give millions of dollars to two decimal places.`,
    answer: r((soupShelf * (1 - soupTrade)) / 1e6, 2),
    check: () => 2.4 * 3 * (1 - (0.55 * 0.3 + 0.3 * 0.4 + 0.15 * 0.25)),
    unit: '$ millions', places: 2, tol: 0.005,
    wrong: [
      { value: soupShelf / 1e6, say: 'That is the value at shelf prices, what shoppers spend. Producers receive the shelf price less what the shops keep.' },
      { value: r((soupShelf * (1 - soupSimple)) / 1e6, 2), say: 'That uses the simple average of the three margins. Weight each channel’s margin by its share of the pots: 0.55 × 0.30 + 0.30 × 0.40 + 0.15 × 0.25.' },
      { value: r((soupShelf * soupTrade) / 1e6, 2), say: 'That is the part of the shelf value the shops keep. The producers receive the rest.' },
      { value: r((soupShelf * (1 - SOUP.channels[0][2])) / 1e6, 2), say: 'That applies the supermarkets’ 30% to every pot. Convenience stores and farm shops keep different shares.' },
    ],
    solution: `Shelf value: ${fx(SOUP.pots / 1e6, 1)} million × $${fx(SOUP.price)} = $${fx(soupShelf / 1e6, 1)} million. The trade’s share, weighted by each channel’s volume: 0.55 × 0.30 + 0.30 × 0.40 + 0.15 × 0.25 = ${fx(soupTrade, 4)}. Producers receive $${fx(soupShelf / 1e6, 1)} million × (1 − ${fx(soupTrade, 4)}) ≈ $${fx((soupShelf * (1 - soupTrade)) / 1e6, 2)} million. Say which figure you quote: shoppers’ spending and producers’ revenue answer different questions.`,
  },
  {
    id: 'm04-dg-9', lesson: 'competitor-research', type: 'num', kind: 'applied',
    prompt: `A fictional hummus brand sells ${HUM.own} g pots; its main rival sells ${HUM.rival} g pots. A one-week store check recorded the shelf prices in the table (* = on promotion that week). Per 100 g, what is the brand’s price premium over the rival in supermarkets, comparing its average with the rival’s average regular (not promoted) price? Measure against the rival’s price and give a percentage to one decimal place.`,
    data: { table: { head: ['Store', 'Channel', `Brand (${HUM.own} g)`, `Rival (${HUM.rival} g)`], rows: HUM.stores.map(([s, c, o, v, p]) => [s, c, `$${fx(o)}`, v == null ? 'not stocked' : `$${fx(v)}${p ? '*' : ''}`]) } },
    answer: r(humKey, 1),
    check: () => (((2.40 + 2.40 + 2.50 + 2.30) / 4 / 200) / ((2.75 + 2.85 + 2.80) / 3 / 250) - 1) * 100,
    unit: '%', places: 1, tol: 0.06,
    wrong: [
      { value: r(prem(humOwn, humRivalReg), 1), say: 'That compares pack prices, but the packs differ in size. Convert both to a price per 100 g first.' },
      { value: r(prem(per100(humOwn, HUM.own), per100(humRivalAll, HUM.rival)), 1), say: 'That includes the rival’s promoted price at S2. The question compares regular prices: leave the promotion out.' },
      { value: r(prem(per100(humOwnAll, HUM.own), per100(humRivalReg, HUM.rival)), 1), say: 'That uses the brand’s average over all six stores, delicatessens included. Compare within one channel: supermarkets, where both are stocked.' },
      { value: r(((per100(humOwn, HUM.own) - per100(humRivalReg, HUM.rival)) / per100(humOwn, HUM.own)) * 100, 1), say: 'That measures the gap against the brand’s own price. A premium over a rival is measured against the rival’s price.' },
    ],
    solution: `Brand in supermarkets: (2.40 + 2.40 + 2.50 + 2.30) ÷ 4 = $${fx(humOwn)}, or $${fx(per100(humOwn, HUM.own), 3)} per 100 g. Rival’s regular supermarket prices: (2.75 + 2.85 + 2.80) ÷ 3 = $${fx(humRivalReg)}, or $${fx(per100(humRivalReg, HUM.rival), 3)} per 100 g. Premium = ${fx(per100(humOwn, HUM.own), 3)} ÷ ${fx(per100(humRivalReg, HUM.rival), 3)} − 1 ≈ ${fx(humKey, 1)}%. On pack price the brand looks about 14% cheaper; per 100 g it is a little dearer. One week in four supermarkets describes those shelves, not every store.`,
  },

  // ================================================================ Module 4: from data to insight
  {
    id: 'm04-dg-10', lesson: 'analysing-survey-data', type: 'num', kind: 'numerical',
    prompt: `A fictional vet practice asked ${VET.n} clients how likely they were to recommend it, from 0 to 10: ${VET.promoters} answered 9 or 10, ${VET.passives} answered 7 or 8 and ${VET.detractors} answered 6 or below. What is the 95% margin of error of its Net Promoter Score, in points? Give one decimal place.`,
    answer: r(VET.margin, 1),
    check: () => 1.959964 * 100 * Math.sqrt((168 / 320 + 48 / 320 - ((168 - 48) / 320) ** 2) / 320),
    unit: 'points', places: 1, tol: 0.06,
    wrong: [
      { value: r(VET.se, 1), say: 'That is the standard error. The margin at 95% is 1.96 times it.' },
      { value: r(Z * 100 * Math.sqrt((VET.pP + VET.pD) / VET.n), 1), say: 'The variance is p_P + p_D − (p_P − p_D)²: you left out the squared term.' },
      { value: r(Z * 100 * Math.sqrt((VET.pP * (1 - VET.pP)) / VET.n), 1), say: 'That is the margin for the promoters’ share alone. The NPS is the difference of two shares that move against each other, so its margin is wider.' },
      { value: r(1.645 * VET.se, 1), say: '1.645 gives a 90% margin. For 95% use 1.96.' },
    ],
    solution: `p_P = 168 ÷ 320 = ${fx(VET.pP, 3)}, p_D = 48 ÷ 320 = ${fx(VET.pD, 3)}, NPS = ${sgn(VET.score)}. SE = 100 × √((${fx(VET.pP, 3)} + ${fx(VET.pD, 3)} − ${fx(VET.pP - VET.pD, 3)}²) ÷ 320) ≈ ${fx(VET.se, 2)} points; margin = 1.96 × ${fx(VET.se, 2)} ≈ ${fx(VET.margin, 1)}, so about ${sgn(VET.low, 0)} to ${sgn(VET.high, 0)} if the clients asked were a random sample.`,
  },
  {
    id: 'm04-dg-11', lesson: 'analysing-survey-data', type: 'formula', kind: 'applied',
    prompt: 'Lantern’s 516 February completes: segment in column B, how each person first heard of Lantern in column C, and in column D each respondent’s weight (their segment’s size on the mailing list ÷ its completes). F1 names one route. In F2, calculate the share of the people on the mailing list who first heard of Lantern through that route, weighted to the list’s segment sizes.',
    sheet: { cells: heardCells, vary: { F1: [LEVELS.heard[0], LEVELS.heard[3], LEVELS.heard[2]] } },
    cell: 'F2', view: `A1:F${L}`, maxHeight: '22rem',
    formats: { D: '0.00', F2: '0.0%' }, widths: { B: 17, C: 20, E: 15, F: 20 },
    answer: `=SUMIFS(D2:D${L},C2:C${L},F1)/SUM(D2:D${L})`,
    alt: [
      `=SUMPRODUCT(D2:D${L}*(C2:C${L}=F1))/SUM(D2:D${L})`,
      `=SUMPRODUCT(D2:D${L},--(C2:C${L}=F1))/SUM(D2:D${L})`,
      `=SUMIF(C2:C${L},F1,D2:D${L})/SUM(D2:D${L})`,
    ],
    wrong: [
      { formula: `=COUNTIF(C2:C${L},F1)/COUNTA(C2:C${L})`, say: 'That is the unweighted share of completes. Subscribers replied far more readily than newsletter-only people, so each answer should count by its weight: sum the weights of the people who gave the route.' },
      { formula: `=SUMIFS(D2:D${L},C2:C${L},F1)/COUNT(D2:D${L})`, say: 'The summed weights stand for people on the list, so divide by the sum of all the weights (the list’s 6,000), not by the 516 respondents.' },
      { formula: `=SUMIFS(D2:D${L},C2:C${L},F1)/6000`, say: 'Typing the list size gives the right answer only while the weights stay as they are. Divide by SUM(D2:D517), which is the list size the weights add up to.' },
    ],
    solution: `<x>=SUMIFS(D2:D517,C2:C517,F1)/SUM(D2:D517)</x>: the weights of the respondents who gave the route, over all the weights (${sum(SIZES).toLocaleString('en-US')}, the list). For “${LEVELS.heard[1]}” it gives ${pc(wHeard(1))}, against ${pc(uHeard(1))} unweighted: newsletter-only people, under-represented among the completes, most often first heard of Lantern at an event or through catering. Report it with its unweighted base (516), and remember that weighting by segment can’t correct differences within a segment.`,
  },
  {
    id: 'm04-dg-12', lesson: 'insights-and-reporting', type: 'mc', kind: 'conceptual',
    prompt: 'A fictional sports centre surveyed members about its new booking app: 83 of 180 members aged under 40 (46%) rated it good or very good, against 82 of 210 members aged 40 or over (39%). Which sentence belongs in the report?',
    options: [
      `The two age groups can’t be told apart on these data: the gap could be anywhere from about ${sgn(APP.low * 100, 0)} to ${sgn(APP.high * 100, 0)} points.`,
      'Younger members rate the app clearly higher than older members, by 7 points, a gap that is larger than the survey’s noise.',
      'There is little or no difference between the age groups, because the 95% interval for the gap between them includes zero.',
      'Younger members rate the app significantly higher, so the app should now be redesigned with older members in mind.',
    ],
    answer: 0,
    feedback: {
      1: `The 95% interval for the gap runs from about ${sgn(APP.low * 100)} to ${sgn(APP.high * 100)} points and includes zero, so the data can’t say which group rates the app higher.`,
      2: '“Little or no difference” fits an interval that includes zero and is narrow. This one is about 20 points wide: the gap could be large in either direction, so “can’t be told apart” is the honest wording.',
      3: 'The gap isn’t beyond chance (p ≈ 0.16), and even a real gap wouldn’t by itself say what to redesign.',
    },
    solution: `Gap: ${pc(APP.p1)} − ${pc(APP.p2)} = ${fx(APP.diff * 100, 1)} points; SE = √(p₁(1 − p₁) ÷ 180 + p₂(1 − p₂) ÷ 210) ≈ ${fx(APP.se * 100, 2)} points; 95% interval ${sgn(APP.low * 100)} to ${sgn(APP.high * 100)}. The interval includes zero and is wide, so the right words are “can’t be told apart on these data”, with the range. Never turn “no evidence of a difference” into “no difference”.`,
  },
];

// The score for each entry is over all the items of the modules before it, and the highest entry passed wins. Modules
// 1–3 score each item 0 or 1, and every entry asks for all the earlier items right: a student who misses any item of
// modules 1–3 starts no later than that item’s module.
export const route = [{ module: 2, ifAtLeast: 1 }, { module: 3, ifAtLeast: 1 }, { module: 4, ifAtLeast: 1 }];
