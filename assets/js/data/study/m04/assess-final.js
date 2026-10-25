// assess-final.js — M04 final assessment: 24 questions across all four modules and all eight of the course’s outcomes,
// two or three per lesson (six for module 1, eight for module 2, five for module 3 and five for module 4). 70% passes.
// Mixed conceptual, numerical and applied items; five are formula items (two of them steps) on worksheets, with the
// inputs a formula should read varied or scaled on the marking copies so that typed results fail. Many combine what
// several lessons teach: what research could be worth, then which study passes both tests (m04-fn-1); a growth rate
// across a change of definition (m04-fn-3); coding interviews with a codebook, then what the codes can’t show
// (m04-fn-5); a discussion guide’s funnel, then saturation by group (m04-fn-6); which pretest method finds which problem
// (m04-fn-7); a Neyman allocation, then a stratified estimate from uneven replies, then what weighting corrects
// (m04-fn-9); the stratified standard error in Excel (m04-fn-10); response rates by stratum, then an estimate corrected
// with a follow-up, then what a rate can’t say (m04-fn-12); a bottom-up model, then the assumption that moves it most,
// then the year at its low value (m04-fn-15); how far pooling two groups’ stated intent overstates demand (m04-fn-17);
// Lantern’s premium over a channel’s whole shelf from the audit (m04-fn-18); the interval for two segments’ NPS gap, and
// whether weights matter (m04-fn-21); a survey and a trial on different bases, then the design that tests the insight
// (m04-fn-23). Lantern’s data appear from new angles (the workshop stratum as a frame, the audit as a shelf average, the
// completes’ weighted mean cups, NPS by first-heard route, subscribers against shop customers); the other businesses are
// fictional and used nowhere else on the site, and nothing comes from the project’s scenario or data. No hints;
// solutions are shown on review. Every num item’s `check` recomputes its answer, and every formula item is marked by its
// results on the sheet and on changed copies.
import { RESPONDENT_COLUMNS, RESPONDENT_ROWS, RESPONDENTS, LEVELS, SIZES, STRATA, PRICE_AUDIT, DEFAULT_PLAN, DISPOSITIONS, tableCells, DERIVED } from './case.js?v=13';
import * as S from '../../../core/survey.js?v=13';
import * as I from '../../../core/inference.js?v=13';

const r = (x, p) => Math.round(x * 10 ** p) / 10 ** p;
const fx = (v, d = 2) => v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
const usd = (v) => `${v < 0 ? '−' : ''}$${Math.abs(Math.round(v)).toLocaleString('en-US')}`;
const int = (v) => Math.round(v).toLocaleString('en-US');
const pc = (v, d = 1) => `${fx(v * 100, d)}%`;
const sgn = (v, d = 1) => `${v < 0 ? '−' : '+'}${fx(Math.abs(v), d)}`;
const sum = (a) => a.reduce((s, x) => s + x, 0);
const avg = (a) => sum(a) / a.length;
const col = (letter, from, values) => Object.fromEntries(values.map((v, i) => [`${letter}${from + i}`, v]));
const Z = I.normInv(0.975);

// ---------------------------------------------------------------- module 1: planning research
// Ravelstone Escape Rooms (fictional): a full site, a pop-up or wait; demand strong, moderate or weak
const ESC = { p: [0.4, 0.35, 0.25], full: [90000, 20000, -60000], pop: [30000, 12000, -5000], wait: [0, 0, 0], survey: 6000, groups: 4500, test: 18000 };
const escEv = (o) => sum(ESC.p.map((p, i) => p * o[i]));
const escBest = Math.max(escEv(ESC.full), escEv(ESC.pop), escEv(ESC.wait));
const escPerfectWith = (opts) => sum(ESC.p.map((p, i) => p * Math.max(...opts.map((o) => o[i]))));
const escPerfect = escPerfectWith([ESC.full, ESC.pop, ESC.wait]);
const escEvpi = escPerfect - escBest;
// a regional sports council (fictional): adults who run, with a change of definition in 2025
const TOUR = { y2023: 1.20, y2024: 1.26, y2025old: 1.31, y2025new: 1.62 };
const growth = (a, b) => (b / a - 1) * 100;
// a city library (fictional): the codebook and seven quotations from interviews with lapsed members
const LIB_THEMES = ['Opening hours', 'Stock', 'Digital services', 'Space'];
const LIB_CODEBOOK = [
  ['Opening hours', 'When the library is open, including evenings and weekends', 'Waits inside the library'],
  ['Stock', 'Books and other items to borrow, e-books and audiobooks included', 'The app or website used to borrow them'],
  ['Digital services', 'The website, the app, online renewals and reservations', 'Which e-books or audiobooks it offers'],
  ['Space', 'Seating, study tables, noise and the café', 'When the library is open'],
];
const LIB_QUOTES = [
  ['“I’d come in after work if it stayed open past six.”', 0],
  ['“They never had the e-books I wanted, so I joined the library in the next town.”', 1],
  ['“Renewing online meant three passwords, and the app crashed every time.”', 2],
  ['“Since they put the café in, it’s too noisy to read.”', 3],
  ['“The website says a book is on the shelf when it isn’t.”', 2],
  ['“There’s nowhere to sit near the new books any more.”', 3],
  ['“Half the audiobooks I wanted were missing from the app’s list.”', 1],
];
// an e-bike subscription service (fictional): new codes in each depth interview, two groups
const BIKE = { a: [7, 4, 3, 1, 2, 0, 1, 0, 0, 0], b: [8, 5, 2, 3, 1, 1, 0, 0, 0], run: 3 };
const stopAfter = (xs, run) => { let k = 0; for (let i = 0; i < xs.length; i++) { k = xs[i] === 0 ? k + 1 : 0; if (k === run) return i + 1; } return xs.length; };
const firstZero = (xs) => xs.indexOf(0) + 1;
const thirdZero = (xs) => { let k = 0; for (let i = 0; i < xs.length; i++) if (xs[i] === 0 && ++k === 3) return i + 1; return xs.length; };

// ---------------------------------------------------------------- module 2: surveys and samples
// a boat-trip operator's pretests (fictional): which method found each problem
const PRE_METHODS = ['Cognitive interview', 'Behaviour coding', 'Respondent debriefing', 'Expert review', 'Pilot (small field test)'];
const PRE = [
  ['Thinking aloud as she answered, a passenger said “harbour tour” could mean the one-hour trip or the day cruise', 0],
  ['Asked to put Q4 in his own words, a passenger described a question about the café, not about the crew', 0],
  ['Recordings of the quayside field interviews showed interviewers rewording Q6 in most of them, because it was too long to read out', 1],
  ['Recordings of the same interviews showed passengers asking for Q9 to be read again in most of them', 1],
  ['Asked after the field test what they had counted as “a trip”, most passengers said they had included the free shuttle ferry', 2],
  ['A survey methodologist reading the draft noticed that Q5’s answer scale has three positive labels and only one negative', 3],
  ['In a small field test the median passenger took 14 minutes, against the 8 promised in the invitation', 4],
];
// Winsett Sinfonia (fictional): Neyman allocation of 500 invitations, then the replies
const SIN = { groups: ['Season subscribers', 'Regular single-ticket buyers', 'Occasional buyers'], N: [1200, 4000, 10800], p: [0.8, 0.5, 0.2], n: 500, done: [28, 96, 151], yes: [22, 52, 41] };
const sinS = SIN.p.map((p) => Math.sqrt(p * (1 - p)));
const sinNey = S.neymanAllocation(SIN.N, sinS, SIN.n), sinProp = S.proportionalAllocation(SIN.N, SIN.n);
const sinVar = S.neymanAllocation(SIN.N, SIN.p.map((p) => p * (1 - p)), SIN.n);
const sinRaw = SIN.N.map((k, i) => (SIN.n * k * sinS[i]) / sum(SIN.N.map((m, j) => m * sinS[j])));
const SINE = S.stratifiedProportion(SIN.N.map((k, i) => ({ N: k, n: SIN.done[i], x: SIN.yes[i] })));
const sinPool = sum(SIN.yes) / sum(SIN.done);
const sinShares = SIN.yes.map((y, i) => y / SIN.done[i]);
const sinByInvites = sum(sinNey.map((k, i) => k * sinShares[i])) / SIN.n;
// a regional newspaper (fictional): three editions, the stratified standard error
const NEWS = { editions: ['City', 'Coast', 'Valley'], N: [2400, 1600, 800], n: [120, 100, 80], p: [0.425, 0.55, 0.30] };
const NEWSE = S.stratifiedProportion(NEWS.N.map((k, i) => ({ N: k, n: NEWS.n[i], x: NEWS.p[i] * NEWS.n[i] })));
const newsCells = {
  A1: 'edition', B1: 'subscribers (N)', C1: 'sampled (n)', D1: 'read mainly on the app (share)',
  ...col('A', 2, NEWS.editions), ...col('B', 2, NEWS.N), ...col('C', 2, NEWS.n), ...col('D', 2, NEWS.p),
  E2: 'standard error',
};
// a city zoo (fictional): dispositions by membership type
const ZOO_TYPES = ['Family', 'Individual', 'Senior'];
const ZOO = [[270, 40, 15, 35, 520, 20], [140, 20, 10, 40, 450, 40], [180, 15, 5, 10, 180, 10]];   // I, P, R, NC, U, not eligible
const zooCells = {
  A1: 'membership', B1: 'invited', C1: 'complete', D1: 'partial', E1: 'refused or broke off', F1: 'bounced', G1: 'no reply', H1: 'not eligible', I1: 'RR1',
  ...Object.fromEntries(ZOO.flatMap((row, i) => [[`A${i + 2}`, ZOO_TYPES[i]], [`B${i + 2}`, `=SUM(C${i + 2}:H${i + 2})`], ...row.map((v, j) => [`${'CDEFGH'[j]}${i + 2}`, v])])),
};
const zooRR = ZOO.map(([I, P, R, NC, U]) => S.responseRates({ I, P, R, NC, U }));
const zooInv = ZOO.map(sum);
const ZF = { resp: 61, non: 38 };                                         // the individual members' follow-up
const zooBias = (rate) => (1 - rate) * (ZF.resp - ZF.non);
const zooAll = (rate) => rate * ZF.resp + (1 - rate) * ZF.non;          // completers and the rest, each by its share

// ---------------------------------------------------------------- module 3: markets and competitors
// a frozen-dumpling maker (fictional): its year-one model and Ana-style ranges
const DUMP = { channels: [['Supermarkets', 40, 8], ['Asian grocers', 25, 12], ['Delicatessens', 15, 6]], weeks: 52, web: 900 };
const dumpWeekly = sum(DUMP.channels.map(([, l, v]) => l * v));
const dumpYear = dumpWeekly * DUMP.weeks + DUMP.web * 12;
const dumpCells = {
  A1: 'channel', B1: 'stores listing', C1: 'packs a store a week',
  ...Object.fromEntries(DUMP.channels.flatMap(([c, l, v], i) => [[`A${i + 2}`, c], [`B${i + 2}`, l], [`C${i + 2}`, v]])),
  A6: 'weeks on sale', B6: DUMP.weeks, A7: 'website packs a month', B7: DUMP.web, A9: 'packs in year one',
};
const DR = { supListed: [30, 50], supRate: [5, 12], asianRate: [8, 14], web: [600, 1500] };
const dumpSwing = {
  supListed: (DR.supListed[1] - DR.supListed[0]) * DUMP.channels[0][2] * DUMP.weeks,
  supRate: (DR.supRate[1] - DR.supRate[0]) * DUMP.channels[0][1] * DUMP.weeks,
  asianRate: (DR.asianRate[1] - DR.asianRate[0]) * DUMP.channels[1][1] * DUMP.weeks,
  web: (DR.web[1] - DR.web[0]) * 12,
};
const dumpAtRate = (rate) => dumpYear + (rate - DUMP.channels[0][2]) * DUMP.channels[0][1] * DUMP.weeks;   // supermarkets' rate moved
const dumpLow = dumpAtRate(DR.supRate[0]), dumpHigh = dumpAtRate(DR.supRate[1]);
// a canned-soup category (fictional): a volume-weighted price
const SOUP = { cans: 3.0e6, brands: [['A', 0.5, 2.50], ['B', 0.3, 1.60], ['C', 0.2, 3.20]], supermarkets: 0.6 };
const soupPrice = sum(SOUP.brands.map(([, s, p]) => s * p)), soupSimple = avg(SOUP.brands.map(([, , p]) => p));
const soupSam = SOUP.cans * SOUP.supermarkets;
// a leisure-centre operator's class pass (fictional): intent weighted to two groups, then converted
const PASS = { N: [2000, 8000], n: [300, 200], def: [0.24, 0.06], prob: [0.30, 0.15], c: [0.35, 0.08] };
const passBuyers = (N, def, prob, c = PASS.c) => sum(N.map((k, i) => k * (c[0] * def[i] + c[1] * prob[i])));
const passPool = (k) => sum(PASS.n.map((n, i) => n * k[i])) / sum(PASS.n);
const passPooled = (c = PASS.c) => sum(PASS.N) * (c[0] * passPool(PASS.def) + c[1] * passPool(PASS.prob));
const passRight = passBuyers(PASS.N, PASS.def, PASS.prob), passOver = passPooled() - passRight;
// Lantern's audit, one row per store (wide), for the average regular price of every rival can in a channel
const CH = { supermarket: 'Supermarket', convenience: 'Convenience', natural: 'Natural grocer' };
const BR = PRICE_AUDIT.brands;
const audWide = {
  A1: 'store', B1: 'channel', C1: BR[0], D1: `${BR[0]} on promotion`, E1: BR[1], F1: `${BR[1]} on promotion`, G1: BR[2], H1: `${BR[2]} on promotion`,
  ...Object.fromEntries(PRICE_AUDIT.stores.flatMap((s, i) => {
    const row = i + 2, out = [[`A${row}`, s.id], [`B${row}`, CH[s.channel]]];
    s.prices.forEach((p, j) => { if (p != null) out.push([`${'CEG'[j]}${row}`, p], [`${'DFH'[j]}${row}`, s.promo && s.promo[j] ? 'Yes' : 'No']); });
    return out;
  })),
  J1: 'channel', K1: CH.supermarket, J2: 'Lantern Cold Brew', K2: DEFAULT_PLAN.price, J3: 'premium over the channel’s regular shelf',
};
const LP = DEFAULT_PLAN.price;
// every regular (not promoted) price recorded in a channel, all brands; and the slips' versions
const shelf = (ch, { promos = false } = {}) => PRICE_AUDIT.stores.filter((s) => ch == null || s.channel === ch)
  .flatMap((s) => s.prices.filter((p, j) => p != null && (promos || !(s.promo && s.promo[j]))));
const shelfAvg = (ch, o) => avg(shelf(ch, o));
const summitReg = (ch) => avg(PRICE_AUDIT.stores.filter((s) => s.channel === ch && !(s.promo && s.promo[0])).map((s) => s.prices[0]));
const premium = (base) => (LP / base - 1) * 100;

// ---------------------------------------------------------------- module 4: from data to insight
const W = DERIVED.weights.perStratum;
const L = RESPONDENTS.length + 1;                                       // last data row, 517
const cupsCells = {
  ...tableCells(RESPONDENT_COLUMNS, RESPONDENT_ROWS, { cols: ['respondent', 'segment', 'cups_last_week'] }).cells,
  D1: 'weight', ...Object.fromEntries(RESPONDENTS.map((x, i) => [`D${i + 2}`, W[x.stratum]])), E1: 'weighted mean cups',
};
const wts = RESPONDENTS.map((x) => W[x.stratum]);
const cupsW = sum(RESPONDENTS.map((x, i) => wts[i] * x.cups)) / sum(wts);
const cupsMeans = STRATA.map((_, h) => avg(RESPONDENTS.filter((x) => x.stratum === h).map((x) => x.cups)));
const [NSUB, NSHOP] = DERIVED.nps.byStratum;
const npsZ = (a, b) => (a.score - b.score) / Math.hypot(a.se, b.se);
const gapLow = (a, b, se = Math.hypot(a.se, b.se), z = Z) => a.score - b.score - z * se;
const ROUTE = LEVELS.heard.map((h, k) => ({ route: h, ...S.nps(RESPONDENTS.filter((x) => x.heard === k).map((x) => x.nps)) }));
const zFriendEvent = npsZ(ROUTE[0], ROUTE[1]), zWorkSocial = npsZ(ROUTE[2], ROUTE[3]);
// an ice rink's adult courses (fictional)
const RINK = { surveyed: 600, intent: 0.36, emailed: 2400, booked: 18, places: 60 };

export const items = [
  // ================================================================ Module 1: planning research
  {
    id: 'm04-fn-1', lesson: 'the-research-process', type: 'steps', kind: 'applied',
    prompt: 'Ravelstone Escape Rooms (fictional) is deciding whether to open a full four-room site in a nearby town, run a two-room pop-up there for a year, or wait. The owners’ estimates of the first year’s profit, and the chances they give each level of demand, are in the table.',
    data: { table: { head: ['Option', 'Strong demand (40%)', 'Moderate demand (35%)', 'Weak demand (25%)'], rows: [['Full site', '+$90,000', '+$20,000', '−$60,000'], ['Pop-up', '+$30,000', '+$12,000', '−$5,000'], ['Wait a year', '$0', '$0', '$0']] } },
    steps: [
      {
        id: 'm04-fn-1-s1', type: 'num',
        prompt: 'What is the most that information revealing in advance which level of demand will occur could be worth to this decision? Give dollars.',
        answer: escEvpi,
        check: () => (0.4 * 90000 + 0.35 * 20000 + 0.25 * 0) - (0.4 * 90000 + 0.35 * 20000 - 0.25 * 60000),
        unit: '$', places: 0, tol: 0.5,
        wrong: [
          { value: escPerfect, say: 'That is the expected profit of deciding with perfect information. Its worth is the gain over the best choice without it, the full site.' },
          { value: escPerfect - escEv(ESC.pop), say: 'That subtracts the pop-up’s expected profit. Without information the owners would choose the option with the highest expected value, the full site at $28,000.' },
          { value: escPerfectWith([ESC.full, ESC.pop]) - escBest, say: 'With perfect information and weak demand the owners would wait, for $0, rather than run the pop-up and lose $5,000: waiting is one of the options.' },
          { value: escBest, say: 'That is the expected profit of the best option without information. The value of information is what perfect information would add to it.' },
        ],
        solution: `Expected profits: full site 0.4 × 90,000 + 0.35 × 20,000 + 0.25 × (−60,000) = ${usd(escEv(ESC.full))}; pop-up ${usd(escEv(ESC.pop))}; waiting $0. With perfect information: full site if demand is strong or moderate, wait if it is weak: 0.4 × 90,000 + 0.35 × 20,000 + 0.25 × 0 = ${usd(escPerfect)}. EVPI = ${usd(escPerfect)} − ${usd(escBest)} = ${usd(escEvpi)}.`,
      },
      {
        id: 'm04-fn-1-s2', type: 'mc',
        prompt: `Three studies are proposed: an e-mail survey of the people on the firm’s booking list who live in the new town, asking how often they would play there (${usd(ESC.survey)}); four focus groups on which room themes players want (${usd(ESC.groups)}); and a three-month pop-up room in a shopping centre as a test (${usd(ESC.test)} after its takings). Which should the owners commission?`,
        options: [
          'The survey: it costs less than the ceiling, and a result showing weak demand would switch the choice to waiting',
          'The focus groups: they cost the least, and any study that costs less than the ceiling is worth buying',
          'The three-month test: real bookings are far better evidence than stated intentions, whatever the cost',
          'None of them: the full site is already the best choice without research, so no result can change it',
        ],
        answer: 0,
        feedback: {
          1: 'Costing less than the ceiling is necessary, not enough: the study must also be able to change the choice. Focus groups find reasons and themes; they can’t say whether demand is strong or weak.',
          2: 'Bookings are better evidence, but the test costs more than perfect information could be worth to this decision, so it can’t pay for itself.',
          3: 'The full site is best only while demand is unknown. Evidence of weak demand would switch the choice to waiting and avoid a $60,000 loss, which is where all the value of information lies here.',
        },
        solution: 'Apply both tests. Could the result change the decision? Only a measure of demand could, and the survey and the test measure it; the focus groups don’t. Is the cost below the ceiling? The survey’s is; the test’s isn’t. So the survey, with the action that each result would trigger written down beforehand, and with its limits in mind: people on the booking list are keener than the town’s players in general.',
      },
    ],
    solution: `Without research the full site has the highest expected profit, ${usd(escBest)}. Perfect information would raise that to ${usd(escPerfect)}, because the owners would wait instead of losing $60,000 when demand is weak, so information about demand is worth at most ${usd(escEvpi)}. The ${usd(ESC.survey)} survey passes both tests; the ${usd(ESC.test)} test fails the ceiling and the focus groups can’t change the choice. A real survey is imperfect and worth less than ${usd(escEvpi)}, so its cost matters as well as its quality.`,
  },
  {
    id: 'm04-fn-2', lesson: 'the-research-process', type: 'mc', kind: 'conceptual',
    prompt: 'A fictional pet insurer is deciding whether to add dental cover to its policies for $4 a month extra. Which of these would make a sound action standard for its research brief?',
    options: [
      'Add dental cover if at least 25% of a random sample of policyholders say they would definitely take it at $4 a month',
      'Decide, once the survey results are in, what share of policyholders saying yes would be enough to justify adding the cover',
      'Add dental cover if the survey shows strong interest among policyholders in protecting their pets’ teeth and gums',
      'Estimate, to within about ±4 points, the share of policyholders who would take dental cover at $4 a month',
    ],
    answer: 0,
    feedback: {
      1: 'An action standard is agreed before the results arrive. Set afterwards, it can be moved to suit what people already wanted to do.',
      2: '“Strong interest” isn’t measurable: any result could be read as meeting it or missing it. State the measure and the threshold.',
      3: 'That is a research objective: it says what will be measured and how precisely, but not what decision follows from each result.',
    },
    solution: 'A sound action standard names the measure, the population, the threshold and the decision it triggers, and is agreed before fieldwork. The first does all four. The second is set too late, the third can’t be checked, and the fourth is an objective, which the brief also needs, with the action standard saying what each answer would make the insurer do.',
  },
  {
    id: 'm04-fn-3', lesson: 'secondary-research', type: 'num', kind: 'numerical',
    prompt: 'A fictional regional sports council publishes a yearly estimate of the adults who run regularly. In 2025 it began counting anyone who had run at least once that year, not at least once a month, and its 2025 report gives that year’s estimate on both definitions (table). A running-shoe retailer planning a new store wants the growth in regular runners from 2024 to 2025. What is it? Give a percentage to one decimal place.',
    data: { table: { head: ['Year', 'Adults who run (millions)', 'Counted if they ran'], rows: [['2023', fx(TOUR.y2023), 'At least once a month'], ['2024', fx(TOUR.y2024), 'At least once a month'], ['2025', fx(TOUR.y2025old), 'At least once a month'], ['2025', fx(TOUR.y2025new), 'At least once in the year']] } },
    answer: r(growth(TOUR.y2024, TOUR.y2025old), 1),
    check: () => (1.31 / 1.26 - 1) * 100,
    unit: '%', places: 1, tol: 0.06,
    wrong: [
      { value: r(growth(TOUR.y2024, TOUR.y2025new), 1), say: 'That compares a 2025 estimate on the new definition with a 2024 estimate on the old one. Most of the jump is the change of definition: compare like with like, the monthly runners in both years.' },
      { value: r(growth(TOUR.y2025old, TOUR.y2025new), 1), say: 'That is the difference between the two definitions in 2025, not a change over time.' },
      { value: r(growth(TOUR.y2023, TOUR.y2025old), 1), say: 'That is the growth over two years, from 2023. The question asks for 2024 to 2025.' },
      { value: r(growth(TOUR.y2023, TOUR.y2024), 1), say: 'That is the previous year’s growth, from 2023 to 2024.' },
    ],
    solution: `On one definition throughout: ${fx(TOUR.y2025old)} ÷ ${fx(TOUR.y2024)} − 1 = ${fx(growth(TOUR.y2024, TOUR.y2025old), 1)}%. The new definition’s ${fx(TOUR.y2025new)} million is ${fx(growth(TOUR.y2024, TOUR.y2025new), 1)}% above 2024 only because it counts occasional runners, who buy few running shoes. This is the “does it agree?” question for a secondary source: a jump in the year a definition changed is a break in the series, not growth. From 2026 the retailer should keep following the monthly runners, if the council goes on publishing them.`,
  },
  {
    id: 'm04-fn-4', lesson: 'secondary-research', type: 'multi', kind: 'conceptual',
    prompt: 'A fictional snack brand can buy one of two kinds of syndicated data: retail measurement (sales recorded at the checkouts of the stores that share their scanner data) or a consumer panel (a sample of households who record what they buy over months). Select all the questions that the panel can answer and the retail measurement can’t.',
    options: [
      'Whether households that bought the brand last year have since switched to a rival',
      'How often the same household buys snacks in a typical month of the year',
      'What else the households that buy the brand buy in the same category',
      'Whether the brand’s buyers are mostly young households or older ones',
      'Exactly how many packs each store sold in each week of the year',
      'Why the brand’s buyers chose it rather than one of its rivals',
    ],
    answer: [0, 1, 2, 3],
    feedback: {
      3: 'Checkout data record what was sold, not who bought it. A panel knows each household’s make-up, so it can show who buys.',
      4: 'Store-by-week sales are what retail measurement records. A panel is a sample of households, so it can estimate them only roughly.',
      5: 'Both sources record purchases, not reasons. Why people choose a brand is a question for qualitative research or a survey.',
    },
    solution: 'A panel follows the same households over time, so it shows who buys, how often, what else they buy and when they switch brands, none of which checkout totals can show. Retail measurement gives sales by brand, store and week for the stores that share their data. Neither records reasons, and each has its blind spot: stores and channels that don’t share data for one, households that won’t keep records for the other.',
  },
  {
    id: 'm04-fn-5', lesson: 'qualitative-research', type: 'steps', kind: 'applied',
    prompt: 'A fictional city library ran ten depth interviews with people whose membership had lapsed, and coded what they said with the codebook below.',
    data: { table: { head: ['Theme', 'Use it for', 'Not for'], rows: LIB_CODEBOOK } },
    steps: [
      {
        id: 'm04-fn-5-s1', type: 'classify',
        prompt: 'Code each remark to one theme, following the codebook’s rules.',
        items: LIB_QUOTES.map(([q]) => q),
        categories: LIB_THEMES,
        answer: LIB_QUOTES.map(([, k]) => k),
        feedback: {
          1: 'The complaint is about which e-books it had. The codebook puts e-books under Stock, and Digital services is “not for” them.',
          4: 'It is about the website’s information, which the codebook puts under Digital services; Stock is what there is to borrow.',
          5: 'Seating is Space, even next to the new books: the remark is about having nowhere to sit, not about what there is to borrow.',
          6: 'The complaint is about which audiobooks were available, which is Stock; the app is only where the participant looked.',
        },
        solution: 'Opening hours: staying open past six. Stock: the missing e-books and the missing audiobooks (the codebook puts both under Stock, whatever device they are read on). Digital services: the renewal passwords and the website’s shelf information. Space: the noise since the café opened and the lack of seats.',
      },
      {
        id: 'm04-fn-5-s2', type: 'multi',
        prompt: 'Noise came up in seven of the ten interviews, usually linked to the new café, and all four participants over 60 raised it. Two coders agreed on every passage coded to noise. Select all the statements the report can make.',
        options: [
          'Noise was raised in seven of the ten interviews, most often linked to the café',
          'Phrases such as “too noisy to read” could be used to word a survey question',
          'Current members are likely to be just as bothered by the noise as lapsed ones',
          'With two coders agreeing on every noise passage, the finding holds for all lapsed members',
          'All four participants over 60 raised it, so the noise is what drives older members away',
          'Closing the café would bring most of the lapsed members back to the library',
        ],
        answer: [0, 1],
        feedback: {
          2: 'Only lapsed members were interviewed, so the interviews say nothing about current members, who stayed and may mind the noise less.',
          3: 'Agreement between coders shows that the codebook was applied consistently, not that ten recruited participants stand for every lapsed member.',
          4: 'Four of four in a group of ten interviews is a count within a small, chosen group, not a share; and noticing noise isn’t the same as leaving because of it. A survey of a planned sample could check whether older lapsed members mention it more.',
          5: 'That is a prediction about behaviour and its cause, which interviews can’t test. A trial of quieter hours would.',
        },
        solution: 'The report can say how often a theme came up in the interviews, if it says that is all the count means, and it can pass on participants’ own words for a survey. Coders’ agreement makes the coding reliable, not the sample representative. How common the complaint is, among lapsed or current members or within an age group, and what would bring members back need a survey of a planned sample, or a test.',
      },
    ],
    solution: 'Codebook rules settle the hard cases (e-books and audiobooks are Stock, seating is Space), which is what makes two coders’ work comparable. The interviews then show what lapsed members say and in what words; they can’t show how many lapsed members feel each way or what would bring them back. Those need descriptive research, and a test for the cause.',
  },
  {
    id: 'm04-fn-6', lesson: 'qualitative-research', type: 'steps', kind: 'numerical',
    prompt: 'A fictional e-bike subscription service is running depth interviews with customers who cancelled, in two groups whose experiences differ: those who cancelled within a month (A) and those who cancelled after a year or more (B). The table shows how many new codes each interview added, in the order the interviews were held.',
    data: { table: { head: ['Interview', ...BIKE.a.map((_, i) => String(i + 1))], rows: [['Group A: new codes', ...BIKE.a.map(String)], ['Group B: new codes', ...BIKE.b.map(String), '—']] } },
    steps: [
      {
        id: 'm04-fn-6-s1', type: 'order',
        prompt: 'Put the topics of the discussion guide in the order the interviewer should take them.',
        items: [
          'Welcome: who is asking, the recording and consent, and that there are no right or wrong answers',
          'How they get around town now, in their own words',
          'How they first came to try an e-bike subscription',
          'Their months with the service: what worked and what didn’t',
          'The decision to cancel, step by step',
          'What would have to change for them to come back',
        ],
        solution: 'A funnel: consent and ground rules first, then the participant’s own habits in their own words, then the category, then the service itself, the decision to cancel and finally what would bring them back. The client’s product comes late, so it can’t shape how people describe their habits.',
      },
      {
        id: 'm04-fn-6-s2', type: 'num',
        prompt: `The team stops interviewing a group once three interviews in a row add no new codes. Under that rule, how many interviews will it have held in the two groups together when both groups have stopped?`,
        answer: stopAfter(BIKE.a, BIKE.run) + stopAfter(BIKE.b, BIKE.run),
        check: () => 10 + 9,
        unit: 'interviews', places: 0, tol: 0.5,
        wrong: [
          { value: firstZero(BIKE.a) + firstZero(BIKE.b), say: 'That stops each group at the first interview that added nothing. Group A’s seventh interview still found a new code, so one empty interview isn’t saturation: the rule needs three in a row.' },
          { value: thirdZero(BIKE.a) + thirdZero(BIKE.b), say: 'That stops group A at its third empty interview, but its empty interviews weren’t in a row: the seventh added a code. Count three consecutive interviews with no new codes.' },
          { value: 12, say: 'Twelve is the number within which Guest and colleagues found saturation in one fairly similar group. Saturation is judged in each group from its own interviews.' },
        ],
        solution: `Group A: interviews 6 and 8 to 10 added nothing, but the seventh added a code, so the run of three empty interviews ends at interview ${stopAfter(BIKE.a, BIKE.run)}. Group B: interviews 7 to 9 added nothing, so it stops after ${stopAfter(BIKE.b, BIKE.run)}. ${stopAfter(BIKE.a, BIKE.run)} + ${stopAfter(BIKE.b, BIKE.run)} = ${stopAfter(BIKE.a, BIKE.run) + stopAfter(BIKE.b, BIKE.run)} interviews.`,
      },
    ],
    solution: `A guide that funnels from the participant’s own life to the service keeps the client’s questions from colouring the answers. Saturation is judged within each kind of participant, from the codes each new interview adds: here ${stopAfter(BIKE.a, BIKE.run)} interviews in group A and ${stopAfter(BIKE.b, BIKE.run)} in group B, within the 9 to 17 that Hennink and Kaiser’s review found for fairly similar participants. A rule set in advance stops the team from ending early because the last interview happened to be dull.`,
  },

  // ================================================================ Module 2: surveys and samples
  {
    id: 'm04-fn-7', lesson: 'questionnaire-design', type: 'classify', kind: 'conceptual',
    prompt: 'A fictional boat-trip operator tested its draft passenger survey in several ways before fieldwork. Which method found each problem?',
    items: PRE.map(([t]) => t),
    categories: PRE_METHODS,
    answer: PRE.map(([, k]) => k),
    feedback: {
      1: 'Asking someone to put a question in their own words is a cognitive-interview probe, done one to one on the draft.',
      3: 'Behaviour coding records, question by question, where interviewers and respondents run into trouble in real interviews, such as a question that has to be repeated.',
      4: 'Follow-up questions put to people who have just taken part in a field test are respondent debriefing.',
      5: 'A review by an expert involves no respondent. The Census Bureau counts it as useful but not, in general, as a pretest.',
      6: 'A small field test checks the whole process, the timing included; nobody has to be asked anything to find the median time.',
    },
    solution: 'Cognitive interviews: thinking aloud about “harbour tour” and putting Q4 in his own words. Behaviour coding: the reworded Q6 and the repeated Q9, seen in real interviews. Respondent debriefing: what the field-test passengers counted as a trip. Expert review: the unbalanced scale, found without any respondent. Pilot: the timing. The Census Bureau’s standard asks for at least one method in which real respondents take part, so the expert review alone wouldn’t do.',
  },
  {
    id: 'm04-fn-8', lesson: 'questionnaire-design', type: 'multi', kind: 'conceptual',
    prompt: 'A fictional council’s draft resident survey is a grid of 20 agree/disagree statements, read out by telephone interviewers. Select all the changes that would reduce acquiescence in the answers.',
    options: [
      'Ask about each thing directly, such as “How clean or dirty are the streets near you?”',
      'Run it as a web form that residents fill in alone, with no interviewer present',
      'Offer a choice between two statements, such as “Bins are collected often enough” or “not often enough”',
      'Add more agree/disagree statements, so that each resident’s tendency to agree averages out',
      'Put a “don’t know” filter before every statement, so that unsure residents can opt out',
      'Label only the two end points of each scale, so that the middle points suggest no answer',
    ],
    answer: [0, 1, 2],
    feedback: {
      3: 'More statements worded the same way give the tendency to agree more chances, not fewer, because it pushes every answer the same way. Only statements worded in the opposite direction, reverse-coded, stop it pushing a scale score one way, and even then each answer still carries it.',
      4: 'Krosnick and Presser’s review finds that “don’t know” filters don’t improve the measurement of opinions, and they do nothing about agreeing with whatever is read out.',
      5: 'Krosnick and Presser report that answers are more reliable when every point has a word label. Bare middle points make the task harder and invite short cuts.',
    },
    solution: 'Acquiescence is agreeing whatever the content. It is invited by agree/disagree formats and is stronger when an interviewer is present, so ask about the thing itself on a labelled scale, offer a choice between two statements, and use a self-completion mode. More items of the same kind, “don’t know” filters and unlabelled points don’t help.',
  },
  {
    id: 'm04-fn-9', lesson: 'sampling-methods', type: 'steps', kind: 'applied',
    prompt: `Winsett Sinfonia (fictional) will survey its patrons about a new series of lunchtime concerts, stratified by how they buy: ${int(SIN.N[0])} season subscribers, ${int(SIN.N[1])} regular single-ticket buyers and ${int(SIN.N[2])} occasional buyers. A pilot suggests that about ${SIN.p.map((p) => `${Math.round(p * 100)}%`).join(', ').replace(/, ([^,]*)$/, ' and $1')} of them respectively are interested. It can invite ${SIN.n} patrons and wants the most precise overall estimate for its money; an invitation costs the same in every group.`,
    steps: [
      {
        id: 'm04-fn-9-s1', type: 'num',
        prompt: 'Using Neyman allocation, with each group’s standard deviation √(p(1 − p)) from the pilot’s shares, how many of the 500 invitations should go to occasional buyers? Give a whole number.',
        answer: sinNey[2],
        check: () => Math.round((500 * 10800 * 0.4) / (1200 * 0.4 + 4000 * 0.5 + 10800 * 0.4)),
        unit: 'invitations', places: 0, tol: 0.5,
        wrong: [
          { value: sinProp[2], say: 'That is proportional allocation (337.5 before rounding). Neyman allocation also weights each group by its standard deviation, so the more variable regular buyers get more than their share.' },
          { value: sinProp[2] + 1, say: 'That is proportional allocation (337.5 before rounding). Neyman allocation also weights each group by its standard deviation, so the more variable regular buyers get more than their share.' },
          { value: sinVar[2], say: 'That weights each group by its variance, p(1 − p). Neyman allocation uses the standard deviation, √(p(1 − p)).' },
          { value: Math.round(SIN.n / 3), say: 'That splits the invitations equally. Neyman allocation is in proportion to N_h × S_h.' },
        ],
        solution: `S_h = √(0.8 × 0.2) = 0.4, √(0.5 × 0.5) = 0.5 and √(0.2 × 0.8) = 0.4. N_h × S_h = ${SIN.N.map((k, i) => int(k * sinS[i])).join(', ')}, total ${int(sum(SIN.N.map((k, i) => k * sinS[i])))}. Occasional buyers: 500 × 4,320 ÷ 6,800 = ${fx(sinRaw[2], 2)}, so ${sinNey[2]} (and ${sinNey[0]} subscribers, ${sinNey[1]} regular buyers).`,
      },
      {
        id: 'm04-fn-9-s2', type: 'num',
        prompt: `After fieldwork the completes were ${SIN.done.join(', ').replace(/, ([^,]*)$/, ' and $1')} in the three groups, of whom ${SIN.yes.join(', ').replace(/, ([^,]*)$/, ' and $1')} said they were interested. Estimate the share of all patrons who are interested. Give a percentage to one decimal place.`,
        answer: r(SINE.p * 100, 1),
        check: () => (1200 * (22 / 28) + 4000 * (52 / 96) + 10800 * (41 / 151)) / 16000 * 100,
        unit: '%', places: 1, tol: 0.06,
        wrong: [
          { value: r(sinPool * 100, 1), say: 'That pools the 275 completes. The groups were sampled and replied at very different rates, so weight each group’s share by its number of patrons.' },
          { value: r(avg(sinShares) * 100, 1), say: 'That averages the three groups’ shares as if each held a third of the patrons. Occasional buyers are two-thirds of them.' },
          { value: r(sinByInvites * 100, 1), say: 'That weights each group by its invitations. Neyman allocation isn’t proportional to the groups’ sizes: weight by the patrons in each, N_h ÷ N.' },
        ],
        solution: `Shares: 22 ÷ 28 = ${fx(sinShares[0], 3)}, 52 ÷ 96 = ${fx(sinShares[1], 3)}, 41 ÷ 151 = ${fx(sinShares[2], 3)}. Weighted by patrons: (1,200 × ${fx(sinShares[0], 3)} + 4,000 × ${fx(sinShares[1], 3)} + 10,800 × ${fx(sinShares[2], 3)}) ÷ 16,000 = ${pc(SINE.p)}.`,
      },
      {
        id: 'm04-fn-9-s3', type: 'mc',
        prompt: 'Occasional buyers replied at a lower rate than subscribers. What does the stratified estimate in the previous part correct, and what doesn’t it?',
        options: [
          'It corrects for the groups being sampled and replying at different rates, not for differences within a group',
          'It corrects every difference between the patrons who replied and the patrons who didn’t, group by group',
          'There was nothing to correct: a Neyman sample already matches each group’s share of all the patrons',
          'It changes the margin of error only: weighting alters how precise an estimate is, never the estimate',
        ],
        answer: 0,
        feedback: {
          1: 'Weighting to the groups’ sizes treats the repliers in each group as standing for the whole group. If, within a group, interested patrons were keener to reply, that bias remains.',
          2: 'Neyman allocation isn’t proportional (regular buyers got 29% of the invitations but are 25% of patrons), and the replies came back in different proportions again.',
          3: 'Weighting changed the estimate itself, from the pooled 41.8% to 37.8%; it also costs some precision.',
        },
        solution: 'The stratified estimate weights each group’s share by its size, so it corrects both the deliberate disproportion of the Neyman allocation and the groups’ different response. It assumes that, within each group, repliers resemble non-repliers; a follow-up of non-repliers is the way to check.',
      },
    ],
    solution: `Neyman allocation puts the invitations where they reduce the overall standard error most: ${sinNey.join(', ')}. The replies (${SIN.done.join(', ')}) are out of proportion to the patrons, so the overall share must be weighted: ${pc(SINE.p)}, against ${pc(sinPool)} pooled. Weighting fixes the mix of groups, not differences between repliers and non-repliers inside a group.`,
  },
  {
    id: 'm04-fn-10', lesson: 'sampling-methods', type: 'formula', kind: 'numerical',
    prompt: 'A fictional regional newspaper surveyed a random sample of the subscribers to each of its three editions. B2:B4 hold each edition’s subscribers, C2:C4 the number sampled and D2:D4 the share of those sampled who read the paper mainly on its app. In F2, calculate the standard error of the stratified estimate of the share of all subscribers who read mainly on the app: SE = √(Σ W_h² (1 − n_h ÷ N_h) p̂_h(1 − p̂_h) ÷ (n_h − 1)), with W_h = N_h ÷ N.',
    sheet: { cells: newsCells },
    cell: 'F2', view: 'A1:F4', formats: { B: '#,##0', D: '0.000', F2: '0.0000' }, widths: { A: 9, B: 15, C: 12, D: 26, E: 15, F: 10 },
    answer: '=SQRT(SUMPRODUCT((B2:B4/SUM(B2:B4))^2*(1-C2:C4/B2:B4)*D2:D4*(1-D2:D4)/(C2:C4-1)))',
    alt: [
      '=SQRT(SUMPRODUCT((B2:B4/SUM(B2:B4))^2,1-C2:C4/B2:B4,D2:D4*(1-D2:D4)/(C2:C4-1)))',
      '=SQRT(SUMPRODUCT(B2:B4^2*(1-C2:C4/B2:B4)*D2:D4*(1-D2:D4)/(C2:C4-1)))/SUM(B2:B4)',
      '=SUMPRODUCT((B2:B4/SUM(B2:B4))^2*(1-C2:C4/B2:B4)*D2:D4*(1-D2:D4)/(C2:C4-1))^0.5',
    ],
    wrong: [
      { formula: '=SQRT(SUMPRODUCT((B2:B4/SUM(B2:B4))^2*D2:D4*(1-D2:D4)/(C2:C4-1)))', say: 'That leaves out the finite population correction, 1 − n_h ÷ N_h, which matters here because each edition’s sample is 5% to 10% of its subscribers.' },
      { formula: '=SQRT(SUMPRODUCT((B2:B4/SUM(B2:B4))*(1-C2:C4/B2:B4)*D2:D4*(1-D2:D4)/(C2:C4-1)))', say: 'Each edition’s variance term is weighted by W_h squared, not by W_h: square the share of subscribers.' },
      { formula: '=SQRT(SUMPRODUCT((B2:B4/SUM(B2:B4))^2*(1-C2:C4/B2:B4)*D2:D4*(1-D2:D4)/C2:C4))', say: 'The formula given divides by n_h − 1. Some texts divide by n_h, which matters only in small strata, but the question asks for this one.' },
      { formula: '=SUMPRODUCT((B2:B4/SUM(B2:B4))^2*(1-C2:C4/B2:B4)*D2:D4*(1-D2:D4)/(C2:C4-1))', say: 'That is the variance of the estimate. The standard error is its square root.' },
      { formula: '=SQRT(SUMPRODUCT(B2:B4,D2:D4)/SUM(B2:B4)*(1-SUMPRODUCT(B2:B4,D2:D4)/SUM(B2:B4))/SUM(C2:C4))', say: 'That treats the 300 replies as one simple random sample. A stratified estimate adds the editions’ variances, each weighted by W_h², with its own correction.' },
    ],
    solution: `<x>=SQRT(SUMPRODUCT((B2:B4/SUM(B2:B4))^2*(1-C2:C4/B2:B4)*D2:D4*(1-D2:D4)/(C2:C4-1)))</x> ≈ ${fx(NEWSE.se, 4)}. The weights are ${NEWS.N.map((k) => fx(k / sum(NEWS.N), 3)).join(', ')}; the stratified estimate itself is ${pc(NEWSE.p)}, so the 95% margin is about ±${fx(Z * NEWSE.se * 100, 1)} points. Each term is W_h² × the stratum’s variance of a share, corrected for the part of the stratum sampled.`,
  },
  {
    id: 'm04-fn-11', lesson: 'sampling-methods', type: 'mc', kind: 'applied',
    prompt: `Each person on Lantern’s mailing list sits in one stratum only, and anyone who has ordered online counts as a subscriber or a shop customer even if they also took a workshop: the ${SIZES[2]} people in the workshop stratum are participants who never ordered online. M01’s 14 workshops in 2026 sold about 168 places. Ana wants to know what everyone who took a Lantern workshop in 2026 thought of it, and proposes to survey all ${SIZES[2]} people in the workshop stratum. What is the main problem with that frame?`,
    options: [
      'Undercoverage: participants who also order online sit in other strata, so they can never be chosen',
      'Overcoverage: some of the 150 may never have bought from Lantern, so they must be screened out first',
      `Sampling error: even a survey of all 150 has a margin of error of about ±${Math.round(Z * Math.sqrt(0.25 / SIZES[2]) * 100)} points at 95% confidence`,
      `Non-response: workshop participants completed at only ${Math.round(DERIVED.survey.rrByStratum[2].RR1 * 100)}% in February, so the survey will be biased`,
    ],
    answer: 0,
    feedback: {
      1: 'Everyone in the workshop stratum paid for a Lantern workshop, and Lantern’s workshops all ran in 2026 (M01), so all 150 are in the target population. The frame’s problem is the participants it leaves out.',
      2: 'Inviting all 150 is a census of the frame, so it has no sampling error; and the ±8 points ignores the finite population correction. The problem is who the frame misses, which no margin shows.',
      3: 'Their 54% was the highest response rate of the four strata, and a response rate shows room for bias, not bias. The bigger problem is fixed before anyone is invited.',
    },
    solution: 'The target population is everyone who took a workshop in 2026; the frame is the workshop stratum, which holds only participants who never ordered online. Participants who are also subscribers or shop customers can’t be selected: undercoverage. Ana needs a frame built from the workshop bookings themselves, or she must say that her results describe only the participants who never ordered online.',
  },
  {
    id: 'm04-fn-12', lesson: 'survey-error', type: 'steps', kind: 'numerical',
    prompt: 'A fictional city zoo e-mailed a survey, with one reminder, to a random sample of its members of three membership types. The worksheet gives the final dispositions; “not eligible” are memberships that had lapsed before the survey, so those people are outside the population of current members.',
    steps: [
      {
        id: 'm04-fn-12-s1', type: 'formula',
        prompt: 'In I2, calculate AAPOR’s RR1 for the membership type in row 2, in a formula that can be filled down to I4.',
        sheet: { cells: zooCells },
        cell: 'I2', fill: 'I2:I4', view: 'A1:I4', formats: { I: '0.0%', B: '#,##0', G: '#,##0' }, widths: { A: 12, B: 8, C: 9, D: 8, E: 11, F: 9, G: 9, H: 11, I: 8 },
        answer: '=C2/(B2-H2)',
        alt: ['=C2/SUM(C2:G2)', '=C2/(C2+D2+E2+F2+G2)', '=C2/(SUM(C2:H2)-H2)'],
        wrong: [
          { formula: '=C2/B2', say: 'Cases found not to be eligible are left out of the denominator: these people aren’t current members.' },
          { formula: '=(C2+D2)/(B2-H2)', say: 'That counts partials as responses: it is RR2. RR1 counts completes only.' },
          { formula: '=C2/(B2-H2-F2)', say: 'Bounced invitations stay in the denominator: those members are eligible, just not reached.' },
          { formula: '=C2/(C2+D2+E2)', say: 'That divides by the people who opened the survey or refused. RR1’s denominator is every eligible case, including the bounced and the unanswered.' },
        ],
        solution: `<x>=C2/(B2-H2)</x>, the completes over every eligible case (invited minus not eligible): ${ZOO_TYPES.map((t, i) => `${t.toLowerCase()} ${pc(zooRR[i].RR1)}`).join(', ')}.`,
      },
      {
        id: 'm04-fn-12-s2', type: 'num',
        prompt: `A telephone follow-up of a random sample of the eligible individual members who didn’t complete found that ${ZF.non}% plan to renew, against ${ZF.resp}% of the individual members who completed. Estimate the share of all eligible individual members who plan to renew. Give a percentage to one decimal place.`,
        answer: r(zooAll(zooRR[1].RR1), 1),
        check: () => (140 / (700 - 40)) * 61 + (1 - 140 / (700 - 40)) * 38,
        unit: '%', places: 1, tol: 0.06,
        wrong: [
          { value: r(zooAll(ZOO[1][0] / zooInv[1]), 1), say: 'That uses a response rate with the 40 lapsed memberships left in the denominator. They aren’t eligible: RR1 = 140 ÷ 660.' },
          { value: r(zooAll(zooRR[1].RR2), 1), say: 'That weights by RR2, which counts the 20 partials as respondents, but the 61% comes from the completes. Weight by RR1.' },
          { value: (ZF.resp + ZF.non) / 2, say: 'That averages the two figures as if the two groups were the same size. Weight each by its share of the eligible members: RR1 for the completers, 1 − RR1 for the rest.' },
          { value: r(zooAll(1 - zooRR[1].RR1), 1), say: 'That swaps the weights: the completers are the 21% (RR1), and the 79% who didn’t complete are the ones the 38% describes.' },
          { value: ZF.resp, say: 'That is the completers’ share, which stands only for the 21% who completed.' },
          { value: r(zooBias(zooRR[1].RR1), 1), say: 'That is how far the completers’ 61% overstates the share. The question asks for the share itself.' },
        ],
        solution: `RR1 for individual members = 140 ÷ 660 = ${pc(zooRR[1].RR1)}. Weight each group by its share of the eligible members: ${fx(zooRR[1].RR1, 4)} × ${ZF.resp} + ${fx(1 - zooRR[1].RR1, 4)} × ${ZF.non} ≈ ${fx(zooAll(zooRR[1].RR1), 1)}%, about ${fx(zooBias(zooRR[1].RR1), 1)} points below the completers’ ${ZF.resp}%. The follow-up is a sample too, so the corrected figure has its own margin of error.`,
      },
      {
        id: 'm04-fn-12-s3', type: 'mc',
        prompt: 'Which conclusion about non-response in the zoo’s survey is right?',
        options: [
          'A type with a high response rate can still give badly biased results if its non-respondents differ a lot',
          'The type with the highest response rate is free of non-response bias, since bias comes from low rates',
          'The type with the lowest response rate must be the most biased one on every question in the survey',
          'Weighting the three types to their sizes removes the bias that the follow-up found among individual members',
        ],
        answer: 0,
        feedback: {
          1: 'Bias is (1 − RR) × the gap between respondents and non-respondents. A high rate limits the room for bias, but a large enough gap still produces it.',
          2: 'Bias belongs to each estimate. A low rate allows more of it, but on a question where non-respondents answer like respondents there is none.',
          3: 'The follow-up found a gap within the individual type. Weighting to the types’ sizes corrects their mix, not differences inside a type.',
        },
        solution: 'A response rate is room for bias, not a measure of it: the bias of each estimate depends on how different the non-respondents are on that question. The follow-up measured one such gap; weighting can’t remove it, but combining the follow-up with the completes can.',
      },
    ],
    solution: `RR1: ${ZOO_TYPES.map((t, i) => `${t.toLowerCase()} ${pc(zooRR[i].RR1)}`).join(', ')}, with lapsed memberships left out and bounced invitations kept in. For individual members the follow-up puts the renewal share at about ${fx(zooAll(zooRR[1].RR1), 1)}%, against the completers’ ${ZF.resp}%. No response rate, high or low, says how large such a gap is: only evidence about the non-respondents does.`,
  },
  {
    id: 'm04-fn-13', lesson: 'survey-error', type: 'mc', kind: 'applied',
    prompt: 'For next year’s survey Ana can afford one extra step against non-response bias in Lantern’s Net Promoter Score, which may still flatter Lantern after weighting if, within each segment, keen customers reply more readily. Which step is most likely to help?',
    options: [
      'Phone a random sample of the non-respondents in each segment, and use their answers to estimate the gap',
      'Send a third reminder to every subscriber, since subscribers’ views matter most to the business',
      'Double the invitations to newsletter-only people, so that their completes match their share of the list',
      'Offer everyone who completes the survey a discount code for Lantern Cold Brew, to raise response in every segment',
    ],
    answer: 0,
    feedback: {
      1: 'Subscribers already reply most readily. More replies from them add to the imbalance, and a higher rate helps only if it brings in people unlike those already responding.',
      2: 'More invitations give more completes and the right mix of segments, which weighting already provides. If keen people reply more readily within the segment, the extra completes carry the same tilt.',
      3: 'A discount on the client’s own product turns the survey into promotion: MRS’s regulations on incentives don’t allow price discounts, or the client’s goods, as research incentives. It would also draw in Lantern’s keenest customers most.',
    },
    solution: 'The bias weighting can’t fix lies within the segments, so the useful evidence comes from the people who don’t reply. A follow-up of a random sample of them, by another mode, measures the gap directly, and the bias formula turns it into a correction. Comparing respondents’ and non-respondents’ order histories, from Lantern’s own records, is a cheaper check to run as well.',
  },
  {
    id: 'm04-fn-14', lesson: 'survey-error', type: 'classify', kind: 'conceptual',
    prompt: 'Each change to a customer survey below works against one component of total survey error. Which one?',
    items: [
      'Recruiting customers at the till who have never joined the mailing list',
      'Inviting twice as many people, chosen at random from the same list',
      'Phoning a random sample of the people who ignored the e-mailed invitation',
      'Asking about the cups bought last week instead of over the last year',
      'Having a second person check that each reply was merged with the right segment code',
      'Running cognitive interviews to find the words that respondents misread',
      'Adding a screening question that thanks and closes for anyone who has never bought',
    ],
    categories: ['Coverage error', 'Sampling error', 'Non-response error', 'Measurement error', 'Processing error'],
    answer: [0, 1, 2, 3, 4, 3, 0],
    feedback: {
      1: 'A bigger random sample from the same frame narrows the margin of error, which measures sampling error alone. It does nothing for the other components.',
      4: 'The answers were right; the mistake would enter when the data are handled: processing error.',
      6: 'People on the frame who are outside the target population are overcoverage, one side of coverage error; screening them out fixes it.',
    },
    solution: 'Coverage: adding customers the frame misses, and screening out people it shouldn’t include. Sampling: a larger random sample. Non-response: evidence from those who didn’t reply. Measurement: a recall period people can manage, and cognitive interviews. Processing: checking the merge.',
  },

  // ================================================================ Module 3: markets and competitors
  {
    id: 'm04-fn-15', lesson: 'market-sizing', type: 'steps', kind: 'applied',
    prompt: 'A fictional frozen-dumpling maker is sizing its first year from the bottom up: the stores expected to list it in each channel, the packs each store sells a week, the weeks on sale and its website’s sales.',
    steps: [
      {
        id: 'm04-fn-15-s1', type: 'formula',
        prompt: 'In B9, calculate the packs the maker will sell in year one, from the stores and rates of sale in B2:C4, the weeks in B6 and the website’s packs a month in B7.',
        sheet: { cells: dumpCells },
        cell: 'B9', view: 'A1:C9', formats: { B: '#,##0', C: '#,##0' }, widths: { A: 22, B: 14, C: 20 },
        answer: '=SUMPRODUCT(B2:B4,C2:C4)*B6+B7*12',
        alt: ['=(B2*C2+B3*C3+B4*C4)*B6+B7*12', '=SUMPRODUCT(B2:B4*C2:C4)*B6+12*B7', '=B6*SUMPRODUCT(B2:B4,C2:C4)+12*B7'],
        wrong: [
          { formula: '=SUMPRODUCT(B2:B4,C2:C4)*B6', say: 'That is the shops alone. Add the website’s sales: B7 packs a month for 12 months.' },
          { formula: '=SUM(B2:B4)*AVERAGE(C2:C4)*B6+B7*12', say: 'Averaging the three rates of sale gives the 15 delicatessens the same say as the 40 supermarkets. Multiply each channel’s stores by its own rate, then add: SUMPRODUCT.' },
          { formula: '=SUMPRODUCT(B2:B4,C2:C4)*B6+B7', say: 'B7 is packs a month: multiply it by 12 for the year.' },
          { formula: '=SUMPRODUCT(B2:B4,C2:C4)*52+B7*12', say: 'The 52 is typed into the formula. Refer to the weeks in B6, so that a change to the weeks on sale reaches the result.' },
        ],
        solution: `<x>=SUMPRODUCT(B2:B4,C2:C4)*B6+B7*12</x>: (40 × 8 + 25 × 12 + 15 × 6) × 52 + 900 × 12 = ${int(dumpWeekly)} × 52 + ${int(DUMP.web * 12)} = ${int(dumpYear)} packs.`,
      },
      {
        id: 'm04-fn-15-s2', type: 'mc',
        prompt: `The maker’s low and high values: supermarkets listing ${DR.supListed.join(' to ')}; packs a supermarket sells a week ${DR.supRate.join(' to ')}; packs an Asian grocer sells a week ${DR.asianRate.join(' to ')}; website packs a month ${int(DR.web[0])} to ${int(DR.web[1])}. Moving one assumption at a time between its low and high value, with the others as planned, which should it research first?`,
        options: [
          'The supermarkets’ rate of sale',
          'The website’s sales a month',
          'The number of supermarkets listing it',
          'The Asian grocers’ rate of sale',
        ],
        answer: 0,
        feedback: {
          1: `The website’s range is the widest in relative terms, but it moves the year by ${int(dumpSwing.web)} packs, against ${int(dumpSwing.supRate)} for the supermarkets’ rate of sale, which applies to 40 stores for 52 weeks.`,
          2: `20 more or fewer listings at 8 packs a week move the year by ${int(dumpSwing.supListed)} packs, a little over half the swing of the supermarkets’ rate of sale.`,
          3: `A range of 8 to 14 packs over 25 grocers moves the year by ${int(dumpSwing.asianRate)} packs, the smallest swing of the four.`,
        },
        solution: `Swings, each with the others as planned: supermarkets’ rate (12 − 5) × 40 × 52 = ${int(dumpSwing.supRate)}; website (1,500 − 600) × 12 = ${int(dumpSwing.web)}; supermarket listings (50 − 30) × 8 × 52 = ${int(dumpSwing.supListed)}; Asian grocers’ rate (14 − 8) × 25 × 52 = ${int(dumpSwing.asianRate)}. The supermarkets’ rate of sale moves the estimate most, so a trial in a few supermarkets is the research to fund first.`,
      },
      {
        id: 'm04-fn-15-s3', type: 'num',
        prompt: `With the supermarkets’ rate of sale at its low value, ${DR.supRate[0]} packs a store a week, and every other assumption as planned, how many packs would year one bring? Give a whole number.`,
        answer: dumpLow,
        check: () => (40 * 5 + 25 * 12 + 15 * 6) * 52 + 900 * 12,
        unit: 'packs', places: 0, tol: 0.5,
        wrong: [
          { value: dumpYear - dumpSwing.supRate, say: 'That subtracts the whole swing, from 5 to 12 packs. The low value is 3 packs below the planned 8, not 7.' },
          { value: dumpLow - DUMP.web * 12, say: 'That leaves out the website’s 900 packs a month for 12 months.' },
          { value: dumpYear - (DUMP.channels[0][2] - DR.supRate[0]) * DUMP.channels[0][1], say: 'That takes off the 120 fewer packs a week once. They are lost every week: multiply by the 52 weeks.' },
        ],
        solution: `(40 × 5 + 25 × 12 + 15 × 6) × 52 + 900 × 12 = ${int((DUMP.channels[0][1] * DR.supRate[0] + DUMP.channels[1][1] * DUMP.channels[1][2] + DUMP.channels[2][1] * DUMP.channels[2][2]))} × 52 + ${int(DUMP.web * 12)} = ${int(dumpLow)} packs, ${int(dumpYear - dumpLow)} below the central ${int(dumpYear)}. At the high value of 12 the year would bring ${int(dumpHigh)}.`,
      },
    ],
    solution: `The bottom-up model gives ${int(dumpYear)} packs. The supermarkets’ rate of sale is the assumption that moves it most: at its low value year one brings ${int(dumpLow)} packs, at its high value ${int(dumpHigh)}. Report the central estimate with that range, and test the supermarkets’ rate of sale, with a trial in a few stores, before planning on more.`,
  },
  {
    id: 'm04-fn-16', lesson: 'market-sizing', type: 'num', kind: 'numerical',
    prompt: `A fictional region’s canned-soup category sells ${fx(SOUP.cans / 1e6, 1)} million cans a year. Brand A sells 50% of the cans at an average shelf price of $${fx(SOUP.brands[0][2])}, brand B 30% at $${fx(SOUP.brands[1][2])} and brand C 20% at $${fx(SOUP.brands[2][2])}. A new soup will be sold only in supermarkets, which sell ${Math.round(SOUP.supermarkets * 100)}% of the category’s cans, with the same mix of brands. What is the new soup’s serviceable available market worth a year at shelf prices? Give millions of dollars to two decimal places.`,
    answer: r((soupSam * soupPrice) / 1e6, 2),
    check: () => 3.0 * 0.6 * (0.5 * 2.5 + 0.3 * 1.6 + 0.2 * 3.2),
    unit: '$ millions', places: 2, tol: 0.005,
    wrong: [
      { value: r((soupSam * soupSimple) / 1e6, 2), say: 'That uses the simple average of the three prices. Weight each price by its brand’s share of the cans: the cheap brand B sells more than the dear brand C.' },
      { value: r((SOUP.cans * soupPrice) / 1e6, 2), say: 'That is the whole category, every channel. The SAM is the part sold where the new soup will be: supermarkets’ 60%.' },
      { value: r((soupSam * SOUP.brands[0][2]) / 1e6, 2), say: 'That uses the market leader’s price for every can. Weight the three brands’ prices by their shares.' },
      { value: r(soupSam / 1e6, 2), say: 'That is the SAM in cans. The question asks for its value: multiply by the average price of a can sold.' },
    ],
    solution: `Volume-weighted price: 0.5 × $2.50 + 0.3 × $1.60 + 0.2 × $3.20 = $${fx(soupPrice)} a can (the simple average, $${fx(soupSimple)}, overstates it). SAM: ${fx(SOUP.cans / 1e6, 1)} million × 0.6 = ${fx(soupSam / 1e6, 1)} million cans, worth ${fx(soupSam / 1e6, 1)} million × $${fx(soupPrice)} ≈ $${fx((soupSam * soupPrice) / 1e6, 2)} million at shelf prices, which is shoppers’ spending, not what the producers receive.`,
  },
  {
    id: 'm04-fn-17', lesson: 'market-sizing', type: 'num', kind: 'applied',
    prompt: `A fictional leisure-centre operator plans a monthly class pass. It surveyed a random sample of its ${int(PASS.N[0])} members and of the ${int(PASS.N[1])} non-members on its newsletter list. Of the ${PASS.n[0]} members who replied, ${Math.round(PASS.def[0] * 100)}% said they would definitely buy the pass and ${Math.round(PASS.prob[0] * 100)}% probably; of the ${PASS.n[1]} newsletter readers who replied, ${Math.round(PASS.def[1] * 100)}% definitely and ${Math.round(PASS.prob[1] * 100)}% probably. From a pass it launched at another centre it assumes that ${Math.round(PASS.c[0] * 100)}% of “definitely” answers and ${Math.round(PASS.c[1] * 100)}% of “probably” answers become buyers, and none of the others. A colleague pooled the ${sum(PASS.n)} replies as if they were one random sample of all ${int(sum(PASS.N))} people. By how many buyers does the colleague’s figure overstate the number to plan for? Give a whole number.`,
    answer: Math.round(passOver),
    check: () => 10000 * (0.35 * ((300 * 0.24 + 200 * 0.06) / 500) + 0.08 * ((300 * 0.30 + 200 * 0.15) / 500)) - (2000 * (0.35 * 0.24 + 0.08 * 0.30) + 8000 * (0.35 * 0.06 + 0.08 * 0.15)),
    unit: 'buyers', places: 0, tol: 0.5,
    wrong: [
      { value: Math.round(passPooled()), say: 'That is the colleague’s pooled figure itself. The question asks how far it is above the right one, which applies each group’s shares to its own size.' },
      { value: Math.round(passRight), say: 'That is the number to plan for. The question asks how far the pooled figure is above it.' },
      { value: Math.round(passPooled([1, 1]) - passBuyers(PASS.N, PASS.def, PASS.prob, [1, 1])), say: 'That compares the two figures before the conversion rates. Stated intent overstates buying: convert the answers in both.' },
      { value: Math.round(passPooled([PASS.c[0], 0]) - passBuyers(PASS.N, PASS.def, PASS.prob, [PASS.c[0], 0])), say: 'That converts the “definitely” answers only. Add 8% of the “probably” answers in both figures.' },
    ],
    solution: `Right: members ${int(PASS.N[0])} × (0.35 × 0.24 + 0.08 × 0.30) = ${int(PASS.N[0] * (PASS.c[0] * PASS.def[0] + PASS.c[1] * PASS.prob[0]))}; newsletter readers ${int(PASS.N[1])} × (0.35 × 0.06 + 0.08 × 0.15) = ${int(PASS.N[1] * (PASS.c[0] * PASS.def[1] + PASS.c[1] * PASS.prob[1]))}; ${int(passRight)} buyers. Pooled: the ${sum(PASS.n)} replies give ${pc(passPool(PASS.def))} “definitely” and ${pc(passPool(PASS.prob), 0)} “probably”, but members are ${Math.round((PASS.n[0] / sum(PASS.n)) * 100)}% of the replies and only a fifth of the ${int(sum(PASS.N))} people: ${int(sum(PASS.N))} × (0.35 × ${fx(passPool(PASS.def), 3)} + 0.08 × ${fx(passPool(PASS.prob), 2)}) = ${int(passPooled())}. Pooling overstates the plan by ${int(passOver)} buyers. The conversion rates come from one earlier launch, so show the plan at lower and higher rates too.`,
  },
  {
    id: 'm04-fn-18', lesson: 'competitor-research', type: 'formula', kind: 'numerical',
    prompt: `Ana’s March shelf-price audit, one row per store: the channel in column B, then each rival can’s shelf price beside a column saying whether it was on promotion (${BR[0]} in C and D, ${BR[1]} in E and F, ${BR[2]} in G and H; blanks mean the store doesn’t stock it). K1 names a channel and K2 holds Lantern Cold Brew’s planned price. In K3, calculate Lantern’s premium over the average of all the regular (not promoted) prices recorded in that channel, every brand and store together, as a proportion: negative if Lantern is cheaper.`,
    sheet: { cells: audWide, vary: { K1: [CH.convenience, CH.natural] } },
    cell: 'K3', view: 'A1:K11', formats: { C: '$0.00', E: '$0.00', G: '$0.00', K2: '$0.00', K3: '0.0%' }, widths: { A: 6, B: 14, C: 11, D: 12, E: 13, F: 12, G: 13, H: 12, J: 34, K: 13 },
    answer: '=K2/((SUMIFS(C2:C11,B2:B11,K1,D2:D11,"No")+SUMIFS(E2:E11,B2:B11,K1,F2:F11,"No")+SUMIFS(G2:G11,B2:B11,K1,H2:H11,"No"))/(COUNTIFS(B2:B11,K1,D2:D11,"No")+COUNTIFS(B2:B11,K1,F2:F11,"No")+COUNTIFS(B2:B11,K1,H2:H11,"No")))-1',
    alt: [
      '=K2*(COUNTIFS(B2:B11,K1,D2:D11,"No")+COUNTIFS(B2:B11,K1,F2:F11,"No")+COUNTIFS(B2:B11,K1,H2:H11,"No"))/(SUMIFS(C2:C11,B2:B11,K1,D2:D11,"No")+SUMIFS(E2:E11,B2:B11,K1,F2:F11,"No")+SUMIFS(G2:G11,B2:B11,K1,H2:H11,"No"))-1',
      '=K2/((SUMIFS(C2:C11,D2:D11,"No",B2:B11,K1)+SUMIFS(E2:E11,F2:F11,"No",B2:B11,K1)+SUMIFS(G2:G11,H2:H11,"No",B2:B11,K1))/(COUNTIFS(D2:D11,"No",B2:B11,K1)+COUNTIFS(F2:F11,"No",B2:B11,K1)+COUNTIFS(H2:H11,"No",B2:B11,K1)))-1',
      '=(K2-(SUMIFS(C2:C11,B2:B11,K1,D2:D11,"No")+SUMIFS(E2:E11,B2:B11,K1,F2:F11,"No")+SUMIFS(G2:G11,B2:B11,K1,H2:H11,"No"))/(COUNTIFS(B2:B11,K1,D2:D11,"No")+COUNTIFS(B2:B11,K1,F2:F11,"No")+COUNTIFS(B2:B11,K1,H2:H11,"No")))/((SUMIFS(C2:C11,B2:B11,K1,D2:D11,"No")+SUMIFS(E2:E11,B2:B11,K1,F2:F11,"No")+SUMIFS(G2:G11,B2:B11,K1,H2:H11,"No"))/(COUNTIFS(B2:B11,K1,D2:D11,"No")+COUNTIFS(B2:B11,K1,F2:F11,"No")+COUNTIFS(B2:B11,K1,H2:H11,"No")))',
    ],
    wrong: [
      { formula: '=K2/AVERAGEIFS(C2:C11,B2:B11,K1,D2:D11,"No")-1', say: `That compares Lantern with ${BR[0]} alone. The question asks for the average of every regular price recorded in the channel, all three brands together.` },
      { formula: '=K2/((SUMIFS(C2:C11,B2:B11,K1)+SUMIFS(E2:E11,B2:B11,K1)+SUMIFS(G2:G11,B2:B11,K1))/(COUNTIFS(B2:B11,K1,D2:D11,"<>")+COUNTIFS(B2:B11,K1,F2:F11,"<>")+COUNTIFS(B2:B11,K1,H2:H11,"<>")))-1', say: 'That includes the two promoted prices at S2. Count only the prices whose promotion flag is “No”, in the sums and in the counts.' },
      { formula: '=K2/AVERAGE(AVERAGEIFS(C2:C11,B2:B11,K1,D2:D11,"No"),AVERAGEIFS(E2:E11,B2:B11,K1,F2:F11,"No"),AVERAGEIFS(G2:G11,B2:B11,K1,H2:H11,"No"))-1', say: 'That averages the three brands’ averages, which gives a brand stocked in two stores the same say as one stocked in four, and fails where a brand isn’t stocked at all. Divide the sum of all the regular prices by how many there are.' },
      { formula: '=K2/((SUMIFS(C2:C11,D2:D11,"No")+SUMIFS(E2:E11,F2:F11,"No")+SUMIFS(G2:G11,H2:H11,"No"))/(COUNTIFS(D2:D11,"No")+COUNTIFS(F2:F11,"No")+COUNTIFS(H2:H11,"No")))-1', say: 'That averages the regular prices in every channel. Channels price differently, so keep the condition on the channel in K1.' },
      { formula: '=K2/((SUMIFS(C2:C11,B2:B11,K1,D2:D11,"<>Yes")+SUMIFS(E2:E11,B2:B11,K1,F2:F11,"<>Yes")+SUMIFS(G2:G11,B2:B11,K1,H2:H11,"<>Yes"))/(COUNTIFS(B2:B11,K1,D2:D11,"<>Yes")+COUNTIFS(B2:B11,K1,F2:F11,"<>Yes")+COUNTIFS(B2:B11,K1,H2:H11,"<>Yes")))-1', say: '“<>Yes” also matches the blank flags beside brands a store doesn’t stock, so COUNTIFS counts prices that aren’t there. Match “No”.' },
    ],
    solution: `<x>=K2/((SUMIFS(C2:C11,B2:B11,K1,D2:D11,"No")+SUMIFS(E2:E11,B2:B11,K1,F2:F11,"No")+SUMIFS(G2:G11,B2:B11,K1,H2:H11,"No"))/(COUNTIFS(B2:B11,K1,D2:D11,"No")+COUNTIFS(B2:B11,K1,F2:F11,"No")+COUNTIFS(B2:B11,K1,H2:H11,"No")))-1</x>: the regular prices’ sum over their count, because one AVERAGEIFS can’t span three price columns. In supermarkets the ${shelf('supermarket').length} regular prices sum to $${fx(sum(shelf('supermarket')))}, an average of $${fx(shelfAvg('supermarket'))}, so Lantern’s $${fx(LP)} is ${fx(premium(shelfAvg('supermarket')), 1)}% above that shelf; in convenience stores the premium is ${sgn(premium(shelfAvg('convenience')))}% and in natural grocers ${sgn(premium(shelfAvg('natural')))}%. A shelf average mixes a premium brand with an economy one and depends on which brands each channel stocks (natural grocers carry no ${BR[1]}), so it shows where Lantern sits on the shelf as a whole; the brand-by-brand comparisons are the like-for-like ones (against ${BR[0]}’s regular supermarket price Lantern is ${sgn(premium(summitReg('supermarket')))}%). These are ten stores in one week, not every shelf in Harbour City.`,
  },
  {
    id: 'm04-fn-19', lesson: 'competitor-research', type: 'multi', kind: 'applied',
    prompt: 'A fictional chain of opticians plans to research its three main rivals. Select all the parts of the plan that must change to follow the MRS mystery-shopping guidelines, ESOMAR’s guideline and SCIP’s code of ethics, as the lesson describes them.',
    options: [
      'The report gives each rival branch’s results under the name of the optician who served the shopper',
      'Shoppers book eye tests to see how rivals take bookings, and don’t cancel the appointments',
      'A researcher phones a rival’s head office posing as a student, to ask about its plans for new shops',
      'Each visit lasts no longer than an ordinary customer’s enquiry about frames and prices',
      'Shoppers buy a pair of glasses from each rival and have the lenses tested afterwards',
      'Results are reported for each rival chain as a whole, with no member of staff identified',
    ],
    answer: [0, 1, 2],
    feedback: {
      3: 'Keeping each visit as short as a normal customer enquiry is what MRS’s guidelines ask for.',
      4: 'Buying and testing a product sold to the public is lawful and honest: no one is misled about anything they keep private.',
      5: 'Reporting in aggregate, with no staff identified, is what the MRS guidelines require for competitor mystery shopping.',
    },
    solution: 'Must change: naming the rivals’ staff (MRS: a competitor’s staff must not be identified or recorded, and results are reported in aggregate); bookings left uncancelled (ESOMAR: demands kept to a minimum and any booking cancelled as quickly as possible); and the false identity on the phone (SCIP: disclose your identity and organisation before an interview; misrepresentation to obtain what a rival keeps private is also improper means in trade-secret law). Short visits, buying and testing products, and aggregate reporting are fine.',
  },

  // ================================================================ Module 4: from data to insight
  {
    id: 'm04-fn-20', lesson: 'analysing-survey-data', type: 'formula', kind: 'numerical',
    prompt: 'Lantern’s 516 February completes: column C holds the cups of coffee each respondent bought away from home last week, and column D each respondent’s weight (their segment’s size on the mailing list ÷ its completes). In F1, calculate the mean cups bought last week by the people on the mailing list, weighted to the list’s segment sizes.',
    sheet: { cells: cupsCells },
    cell: 'F1', view: `A1:F${L}`, maxHeight: '22rem', formats: { D: '0.00', F1: '0.00' }, widths: { B: 17, C: 15, E: 19, F: 9 },
    answer: `=SUMPRODUCT(D2:D${L},C2:C${L})/SUM(D2:D${L})`,
    alt: [`=SUMPRODUCT(C2:C${L},D2:D${L})/SUM(D2:D${L})`, `=SUMPRODUCT(C2:C${L}*D2:D${L})/SUM(D2:D${L})`],
    wrong: [
      { formula: `=AVERAGE(C2:C${L})`, say: 'That is the unweighted mean of the completes, in which subscribers count about twice their share of the list. Weight each answer: SUMPRODUCT(weights, cups) ÷ SUM(weights).' },
      { formula: `=SUMPRODUCT(D2:D${L},C2:C${L})/COUNT(C2:C${L})`, say: 'The weighted total stands for the cups of everyone on the list, so divide by the sum of the weights (6,000), not by the 516 respondents.' },
      { formula: `=SUMPRODUCT(D2:D${L},C2:C${L})/6000`, say: 'Typing the list size gives the right answer only while the weights stay as they are. Divide by SUM(D2:D517), the list size the weights add up to.' },
    ],
    solution: `<x>=SUMPRODUCT(D2:D517,C2:C517)/SUM(D2:D517)</x> ≈ ${fx(cupsW, 2)} cups, against ${fx(DERIVED.cups.mean, 2)} unweighted. Weighting hardly moves it, because the segments’ means differ little (${fx(Math.min(...cupsMeans), 2)} to ${fx(Math.max(...cupsMeans), 2)}). The counts are right-skewed, so for a typical person the median, 3 cups, is the better figure; the weighted mean is the one to multiply by 6,000 for a total, with a recall question’s measurement error in mind.`,
  },
  {
    id: 'm04-fn-21', lesson: 'analysing-survey-data', type: 'steps', kind: 'numerical',
    prompt: `In February, the ${NSUB.n} subscribers who completed Ana’s survey gave ${NSUB.promoters} promoters, ${NSUB.passives} passives and ${NSUB.detractors} detractors: an NPS of ${sgn(NSUB.score)} with a standard error of ${fx(NSUB.se, 2)} points. The ${NSHOP.n} other shop customers who completed it gave ${NSHOP.promoters} promoters, ${NSHOP.passives} passives and ${NSHOP.detractors} detractors: ${sgn(NSHOP.score)}, with a standard error of ${fx(NSHOP.se, 2)} points.`,
    steps: [
      {
        id: 'm04-fn-21-s1', type: 'num',
        prompt: 'What is the lower end of the 95% interval for subscribers’ NPS minus shop customers’ NPS, in points? Give one decimal place.',
        answer: r(gapLow(NSUB, NSHOP), 1),
        check: () => ((65 - 10) / 89 - (64 - 9) / 103) * 100 - 1.959964 * Math.hypot(7.1955, 6.4130),
        unit: 'points', places: 1, tol: 0.06,
        wrong: [
          { value: r(gapLow(NSUB, NSHOP, NSUB.se + NSHOP.se), 1), say: 'You added the standard errors. Variances add, so the standard error of the gap is √(SE₁² + SE₂²).' },
          { value: r(gapLow(NSUB, NSHOP, NSUB.se), 1), say: 'Both scores are estimates, so both standard errors count: use √(SE₁² + SE₂²), not the subscribers’ alone.' },
          { value: r(gapLow(NSUB, NSHOP, NSHOP.se), 1), say: 'Both scores are estimates, so both standard errors count: use √(SE₁² + SE₂²), not the shop customers’ alone.' },
          { value: r(gapLow(NSUB, NSHOP, Math.hypot(NSUB.se, NSHOP.se), 1), 1), say: 'That takes one standard error off the gap. A 95% interval goes 1.96 standard errors either side.' },
          { value: r(gapLow(NSUB, NSHOP, Math.hypot(NSUB.se, NSHOP.se), I.normInv(0.95)), 1), say: '1.645 gives a 90% interval. For 95% use 1.96.' },
          { value: r(NSUB.score - NSHOP.score + Z * Math.hypot(NSUB.se, NSHOP.se), 1), say: 'That is the upper end. The lower end subtracts 1.96 standard errors from the gap.' },
        ],
        solution: `Gap: ${fx(NSUB.score, 1)} − ${fx(NSHOP.score, 1)} = ${fx(NSUB.score - NSHOP.score, 1)} points. Variances add, so the gap’s standard error is √(${fx(NSUB.se, 2)}² + ${fx(NSHOP.se, 2)}²) ≈ ${fx(Math.hypot(NSUB.se, NSHOP.se), 2)}. Lower end: ${fx(NSUB.score - NSHOP.score, 1)} − 1.96 × ${fx(Math.hypot(NSUB.se, NSHOP.se), 2)} ≈ ${sgn(gapLow(NSUB, NSHOP))}; the upper end is about ${sgn(NSUB.score - NSHOP.score + Z * Math.hypot(NSUB.se, NSHOP.se))}.`,
      },
      {
        id: 'm04-fn-21-s2', type: 'mc',
        prompt: 'Should this comparison between the two segments use the survey weights?',
        options: [
          'No: within each segment every respondent has the same weight, so each segment’s score is the same weighted or not',
          'Yes: shop customers replied at a lower rate than subscribers, so their score must be weighted up before comparing',
          'Yes: weighting to the list lowers both scores, just as it lowered the overall score from +27.5 to +20.4',
          'No: weights apply only to means, so they can never change a score that is built from two shares',
        ],
        answer: 0,
        feedback: {
          1: 'Weighting shop customers up changes how much they count in an all-respondent figure, not their own score: every one of them carries the same weight.',
          2: 'The overall score fell because weighting changed the mix of segments. Within one segment there is no mix to change.',
          3: 'Weights do change shares and scores when respondents carry different weights, as the overall NPS shows. They don’t here only because each segment has one weight.',
        },
        solution: 'Each segment’s respondents all carry the weight N_h ÷ n_h, so a weighted segment score equals the unweighted one, and comparisons between segments need no weights.',
      },
    ],
    solution: `Subscribers ${sgn(NSUB.score)} against shop customers ${sgn(NSHOP.score)}: a gap of ${fx(NSUB.score - NSHOP.score, 1)} points with a 95% interval from about ${sgn(gapLow(NSUB, NSHOP))} to ${sgn(NSUB.score - NSHOP.score + Z * Math.hypot(NSUB.se, NSHOP.se))}. The interval includes zero and is wide, so on these bases the two segments can’t be told apart, and the comparison needs no weights. Both scores also come from people who chose to reply, so neither is the segment’s true score.`,
  },
  {
    id: 'm04-fn-22', lesson: 'analysing-survey-data', type: 'multi', kind: 'conceptual',
    prompt: 'Ana’s February completes by how each person first heard of Lantern (unweighted). Select all the statements the table supports.',
    data: { table: { head: ['First heard through', 'Base', 'Promoters', 'Detractors', 'NPS', '95% margin (±)'], rows: ROUTE.map((x) => [x.route, String(x.n), pc(x.pP), pc(x.pD), sgn(x.score), fx(x.margin, 1)]) } },
    options: [
      'People who first heard through friends or family gave a clearly higher NPS than those who first heard at an event or catering',
      'The scores of people who first heard at a workshop and through social media can’t be told apart on these bases',
      'Every route has a base of at least 30, so a minimum-base rule of 30 allows each one to be reported on its own',
      'Hearing about Lantern from friends or family makes people more likely to recommend Lantern to others',
      'An NPS of +40.0 means that 40% of the people who first heard through friends or family would recommend Lantern',
      'The workshop route has the widest margin mainly because its base is the smallest of the five',
    ],
    answer: [0, 1, 2, 5],
    feedback: {
      3: 'The table shows an association. People who hear of Lantern from friends may differ in other ways, already liking the kind of coffee their friends drink, for instance; only an experiment could show cause.',
      4: 'The NPS is the promoters’ percentage minus the detractors’: 56.4% − 16.4% = +40.0. It isn’t a percentage of anyone.',
    },
    solution: `Friends or family against events and catering: a gap of ${fx(ROUTE[0].score - ROUTE[1].score, 1)} points with a standard error of ${fx(Math.hypot(ROUTE[0].se, ROUTE[1].se), 2)}, z ≈ ${fx(zFriendEvent, 2)}, beyond chance at the 5% level. Workshop against social media: ${fx(ROUTE[2].score - ROUTE[3].score, 1)} points, z ≈ ${fx(zWorkSocial, 2)}, well within chance. The smallest base is ${Math.min(...ROUTE.map((x) => x.n))}, the workshop route’s, which is why its margin is the widest: its answers actually vary less than any other route’s, but the standard error shrinks only with √n. None of this shows cause, and the scores describe the people who replied, unweighted.`,
  },
  {
    id: 'm04-fn-23', lesson: 'insights-and-reporting', type: 'steps', kind: 'applied',
    prompt: `A fictional ice rink is deciding whether to run six-week adult skating courses at $90. Its evidence: a survey of ${RINK.surveyed} adult visitors drawn at random from its booking records, in which ${Math.round(RINK.intent * 100)}% said they would definitely or probably book a course; six depth interviews with adults who skate, several of whom said they were afraid of falling in front of strangers and would prefer adult-only sessions; a trial course advertised by e-mail to ${int(RINK.emailed)} adult visitors, which took ${RINK.booked} bookings for its ${RINK.places} places in a month; and a check showing two nearby rinks charging $75 and $80 for similar courses.`,
    steps: [
      {
        id: 'm04-fn-23-s1', type: 'mc',
        prompt: `A colleague says the survey and the trial agree: ${Math.round(RINK.intent * 100)}% said they would book, and the trial filled ${Math.round((RINK.booked / RINK.places) * 100)}% of its places. What is wrong with that?`,
        options: [
          `They measure different things: ${RINK.booked} bookings from ${int(RINK.emailed)} adults e-mailed is under 1%, far below the ${Math.round(RINK.intent * 100)}% who said they would`,
          'Nothing: 30% of the places filled is close to the 36% who said they would book, so the trial confirms the survey',
          'The survey must be wrong, so its findings about which visitors are interested should be dropped from the report',
          'The trial must be wrong, because a month is too short for adults to decide, so the survey’s 36% should be used for planning',
        ],
        answer: 0,
        feedback: {
          1: 'A share of places depends on how many places were offered. The comparable figure is bookings as a share of the adults who were offered the course.',
          2: 'Stated intent overstates behaviour, but the survey still shows who is interested and why, which helps target the next course.',
          3: 'A month may understate demand a little, but bookings are what people did with their own money: trust them for volume, and run the trial longer if in doubt.',
        },
        solution: `${RINK.booked} ÷ ${int(RINK.emailed)} = ${pc(RINK.booked / RINK.emailed, 2)} of the adults offered the course booked, against ${Math.round(RINK.intent * 100)}% who said they would. The ${Math.round((RINK.booked / RINK.places) * 100)}% is a fill rate, which would change if the rink offered more or fewer places.`,
      },
      {
        id: 'm04-fn-23-s2', type: 'mc',
        prompt: 'Which recommendation does the evidence support best?',
        options: [
          'Test adult-only courses: offer them to a random half of the adults e-mailed, mixed ones to the rest, and compare bookings',
          'Cut the price to $75 to match the cheaper rival, since price is the likeliest reason that so few adults booked',
          'Plan next season’s courses for 36% of adult visitors to book, since the survey is the largest random sample of the four sources',
          'Hold more depth interviews before changing anything, since six are too few to show why adults don’t book',
        ],
        answer: 0,
        feedback: {
          1: 'Nothing in the evidence points to price: the interviews pointed to a fear of falling in front of strangers, and two rivals’ prices don’t show what this rink’s adults would pay. A price could be tested too, but it isn’t the change the evidence suggests.',
          2: 'Stated intent overstates behaviour, as the trial’s bookings show: plan volume on what people did, not on what they said they would do.',
          3: 'Interviews are exploratory: they have already suggested why adults hold back. Whether adult-only courses would raise bookings is a causal question, and only an experiment answers it.',
        },
        solution: 'The interviews suggest a change; whether it works is a causal question. Offering the two kinds of course to randomly chosen halves of the list and comparing bookings answers it, because the halves differ only in the offer. The evidence gives no reason to cut the price, the survey’s 36% would overstate demand, and more interviews can’t show what a change would do.',
      },
    ],
    solution: `The survey (stated preference) and the trial (revealed preference) disagree by a factor of nearly 50 once they are put on the same base: ${pc(RINK.booked / RINK.emailed, 2)} of adults e-mailed booked, against ${Math.round(RINK.intent * 100)}% who said they would. The interviews suggest why, and the insight leads to a test, adult-only courses offered to a random half of the list, rather than to a forecast. Plan volume on bookings, and use the survey and interviews for who wants lessons and what would help them book.`,
  },
  {
    id: 'm04-fn-24', lesson: 'insights-and-reporting', type: 'classify', kind: 'conceptual',
    prompt: 'A research team is reviewing its draft reports. What should it do about each of these?',
    items: [
      'A bar chart comparing two shares on a value axis that starts at 40%',
      'A weighted share printed with its unweighted base and a note on the weighting',
      'A staff-survey table that hides one small team’s cell but shows every other team and the total',
      'A Net Promoter Score of +18 plotted on an axis labelled “% of customers”',
      'A quotation attributed to “participant B4, non-customer group”',
      'A cross-tab of NPS by branch and age group in which the over-65s at the smallest branch are a cell of two people',
      'Bars with their 95% intervals drawn on them and the base printed under each one',
      '“Proves that customers prefer the new pack”, about a gap whose 95% interval includes zero',
    ],
    categories: ['Keep: honest and safe', 'Change: misleading', 'Change: could identify a respondent'],
    answer: [1, 0, 2, 1, 0, 2, 0, 1],
    feedback: {
      0: 'A truncated axis makes the gap between two shares look several times larger than it is. Start bars for shares at zero.',
      2: 'With the total and every other cell shown, the hidden cell can be worked out by subtraction. Hide a second cell too, or merge the team with another.',
      3: 'An NPS is in points, from −100 to +100, not a percentage of customers.',
      5: 'Anyone who knows the branch could recognise two people. Suppress the cell (and a second one if totals would reveal it), or merge age groups.',
      7: '“Proves” claims far more than a sample can, and an interval that includes zero means the data can’t say which pack is preferred.',
    },
    solution: 'Keep: the labelled weighted figure, the coded attribution, and bars with intervals and bases. Change as misleading: the truncated axis, the NPS shown as a percentage, and “proves” for a gap that isn’t clear. Change as unsafe: the table whose hidden cell can be worked out by subtraction, and the cell of two people.',
  },
];
