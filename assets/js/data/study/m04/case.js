// case.js — the M04 Market Research story: Lantern Coffee Co.'s research in February–April 2027. One source of truth for
// every figure M04's lessons, exercises, assessments and project use. Every name, figure, quotation and finding here is
// invented for teaching, except where a comment cites an earlier course's case, whose figures this file imports.
//
// Agrees with earlier courses:
//   - Lantern's mailing list holds 6,000 people (B04), 520 of them subscribers (B04's December survey invited all 520).
//   - About 1,500 shop customers by December 2026 (M01; B01 counts 1,406 first-time buyers from July to December).
//   - 14 workshops of about 12 participants in 2026 (M01), so 150 workshop participants who never ordered online is
//     within the 168 places sold.
//   - B04's project planned this survey: ±4 points at 95% needs 601 replies; at a 30% response rate, invite 2,004.
//   - B01's September 2026 survey: 240 invited, 79 replied (33%).
//   - Lantern Cold Brew (M02): 250 ml cans planned at $3.49 in Harbour City, where about 4.8 million cans of
//     ready-to-drink coffee are sold a year; the launch plan uses supermarkets, natural and specialty grocers and
//     Lantern's own channel (70% of the category's cans), and M02's product-life-cycle lesson sets a first-year goal of
//     about 100,000 cans. Its three competitors and their usual shelf prices are M02's.
//   - Brewline Catering is the main catering competitor, at $7.50 a head (M01); Lantern charges $9.00.
//
// The story. In February 2027 Ana runs the customer survey B04 planned, on her mailing list, as a proportional
// stratified sample; fewer people reply than she hoped, and not evenly. In March she holds two focus groups on Lantern
// Cold Brew, audits shelf prices and sizes the cold brew market from the top down and the bottom up. The project (an
// office-coffee subscription for offices in Lantern's district) has its own data at the end of this file; lessons and
// module tests must not use it.
import { LIST, OFFICE_SURVEY } from './data.js?v=18';
import { MAILING_LIST, SUBSCRIBER_SURVEY, SURVEY_PLAN, DERIVED as B04 } from '../b04/case.js?v=18';
import { SURVEY as B01_SURVEY, SHOP } from '../b01/case.js?v=18';
import { BUSINESS, COMPETITOR as BREWLINE, CLIENT_INTERVIEWS } from '../m01/case.js?v=18';
import { CATEGORY, CHANNELS, COMPETITORS, DEFAULT_PLAN } from '../m02/market.js?v=18';
import * as S from '../../../core/survey.js?v=18';
import { tableCells } from '../b03/case.js?v=18';

export { MAILING_LIST, SUBSCRIBER_SURVEY, SURVEY_PLAN, B01_SURVEY, BREWLINE, CLIENT_INTERVIEWS, CATEGORY, CHANNELS, COMPETITORS, DEFAULT_PLAN, tableCells };

// ---------------------------------------------------------------- the mailing list (decoded from data.js)
export const STRATA = ['Subscribers', 'Other shop customers', 'Workshop participants', 'Newsletter only'];
/** The same strata as one respondent's segment (the label a survey tool's export would carry). */
export const SEGMENT = ['Subscriber', 'Shop customer', 'Workshop participant', 'Newsletter only'];
export const LEVELS = {
  group: ['Detractor', 'Passive', 'Promoter'],                                   // NPS groups: 0–6, 7–8, 9–10
  coldbrew: ['Definitely would buy', 'Probably would buy', 'Might or might not', 'Probably would not', 'Definitely would not'],
  age: ['18–34', '35–54', '55 or over'],
  heard: ['A friend or family', 'An event or catering', 'A workshop', 'Social media', 'Search or other'],
  status: ['Not invited', 'No reply', 'Complete', 'Partial', 'Refused', 'Bounced'],
  theme: ['Nothing, or left blank', 'Price', 'Delivery speed', 'Range', 'Packaging and waste', 'Website or app', 'Other'],
};
const B60 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx';
const dec = (str, alphabet = '0123456789') => [...str].map((c) => alphabet.indexOf(c));
const stratum = dec(LIST.stratum), npsScore = dec(LIST.nps, 'abcdefghijk');
const group = npsScore.map((v) => (v >= 9 ? 2 : v >= 7 ? 1 : 0));
// response propensity (the chance of completing if invited): the stratum's rate, ×1.2 for promoters and ×0.75 for
// detractors, rescaled so each stratum averages its rate (the generator's rule)
const BASE_RATE = [0.56, 0.34, 0.40, 0.22], MULT = [0.75, 1.0, 1.2];
const rawP = stratum.map((h, i) => BASE_RATE[h] * MULT[group[i]]);
const scale = BASE_RATE.map((b, h) => { const xs = rawP.filter((_, i) => stratum[i] === h); return b / (xs.reduce((a, c) => a + c, 0) / xs.length); });
export const PEOPLE = {
  stratum, nps: npsScore, group, coldbrew: dec(LIST.coldbrew), age: dec(LIST.age), heard: dec(LIST.heard),
  cups: dec(LIST.cups, B60), batch: dec(LIST.batch, B60), status: dec(LIST.status), theme: dec(LIST.theme),
  propensity: rawP.map((p, i) => p * scale[stratum[i]]),
};
export const SIZES = STRATA.map((_, h) => stratum.filter((x) => x === h).length);          // 520, 1,000, 150, 4,330

// ---------------------------------------------------------------- the February 2027 customer survey
/** Sent by e-mail on 2 February 2027 with one reminder on 9 February; closed 16 February. No incentive. A proportional
 *  stratified sample of B04's 2,004 invitations, drawn at random within each stratum. */
export const SURVEY_2027 = {
  sent: '2 February 2027', reminder: '9 February 2027', closed: '16 February 2027', mode: 'web questionnaire, e-mailed link',
  invited: B04.project.surveyPlan.invite, allocation: S.proportionalAllocation(SIZES, B04.project.surveyPlan.invite),
  questions: [
    { id: 'Q1', text: 'How likely are you to recommend Lantern to a friend or colleague?', scale: '0 (not at all likely) to 10 (extremely likely)' },
    { id: 'Q2', text: 'Lantern plans a ready-to-drink cold brew coffee in 250 ml cans at about $3.49. How likely would you be to buy it in the next three months?', scale: LEVELS.coldbrew.join(' / ') },
    { id: 'Q3', text: 'Last week, about how many cups of coffee did you buy away from home?', scale: 'a number' },
    { id: 'Q4', text: 'How did you first hear of Lantern?', scale: LEVELS.heard.join(' / ') },
    { id: 'Q5', text: 'Which age group are you in?', scale: LEVELS.age.join(' / ') },
    { id: 'Q6', text: 'What one thing could Lantern do better?', scale: 'open answer, coded into themes afterwards' },
  ],
};
const idx = (pred) => stratum.map((_, i) => i).filter(pred);
/** The completed questionnaires, one record each (the stratum comes from the list, not from a question). */
export const RESPONDENTS = idx((i) => PEOPLE.status[i] === 2).map((i) => ({
  id: i + 1, stratum: stratum[i], nps: npsScore[i], group: group[i], coldbrew: PEOPLE.coldbrew[i], age: PEOPLE.age[i],
  heard: PEOPLE.heard[i], cups: PEOPLE.cups[i], theme: PEOPLE.theme[i],
}));
/** The completes as a worksheet table (text labels, as an export from a survey tool would give): use with
 *  tableCells(RESPONDENT_COLUMNS, RESPONDENT_ROWS, { at, cols, n }) for sheet widgets and formula items. */
export const RESPONDENT_COLUMNS = ['respondent', 'segment', 'nps', 'cold_brew', 'age', 'first_heard', 'cups_last_week', 'improve'];
export const RESPONDENT_ROWS = RESPONDENTS.map((r) => [r.id, SEGMENT[r.stratum], r.nps, LEVELS.coldbrew[r.coldbrew - 1], LEVELS.age[r.age], LEVELS.heard[r.heard], r.cups, LEVELS.theme[r.theme]]);
const dispo = (h) => { const st = idx((i) => (h == null || stratum[i] === h) && PEOPLE.status[i] > 0).map((i) => PEOPLE.status[i]); const c = (k) => st.filter((x) => x === k).length; return { invited: st.length, I: c(2), P: c(3), R: c(4), NC: c(5), U: c(1) }; };
/** AAPOR dispositions by stratum: I complete, P partial, R refused, NC bounced (not contacted), U no reply. Everyone on
 *  the list is eligible, so under AAPOR's Standard Definitions (10th edition, section 1) the no-replies are eligible
 *  non-respondents, not cases of unknown eligibility; the field keeps the name U, and RR1 = RR3 and RR2 = RR4 because
 *  every case is in the denominator either way. */
export const DISPOSITIONS = { all: dispo(null), byStratum: STRATA.map((_, h) => dispo(h)) };

// ---------------------------------------------------------------- March 2027: qualitative work on Lantern Cold Brew
/** Two 90-minute focus groups on 10 and 12 March 2027, run by a hired moderator from a discussion guide, recorded with
 *  consent and transcribed. Group A: 8 subscribers. Group B: 7 people who buy ready-to-drink coffee at least once a
 *  month but have never bought from Lantern, recruited by an agency with a screener. Each quotation is coded to one
 *  theme by Ana; the second coder (a freelance researcher) agreed on 18 of the 20. */
export const FOCUS_GROUPS = {
  groups: [{ id: 'A', date: '10 March 2027', participants: 8, who: 'Lantern subscribers' }, { id: 'B', date: '12 March 2027', participants: 7, who: 'ready-to-drink coffee buyers who have never bought from Lantern' }],
  themes: ['Taste', 'Price', 'Can and label', 'Where to buy', 'Sustainability', 'Caffeine and health'],
  quotes: [
    { group: 'A', who: 'A3', theme: 0, text: 'If it tastes like the House Blend does when I make it at home, I’d buy it every week.' },
    { group: 'A', who: 'A1', theme: 0, text: 'Most canned coffee tastes burnt to me. Yours would have to taste fresh.' },
    { group: 'B', who: 'B4', theme: 0, text: 'I don’t know the name, so I’d only try it if somebody handed me a free can.' },
    { group: 'A', who: 'A6', theme: 1, text: 'Three fifty is fine for a treat, not for every day.' },
    { group: 'B', who: 'B2', theme: 1, text: 'The one I buy is about two fifty. I’d need a reason to pay a dollar more.' },
    { group: 'B', who: 'B7', theme: 1, text: 'If it were on offer the first week I’d try it, and then we’ll see.' },
    { group: 'A', who: 'A2', theme: 2, text: 'The lantern drawing on the bags is lovely. Put that on the can.' },
    { group: 'B', who: 'B1', theme: 2, text: 'On a shelf full of cans I wouldn’t notice a plain one. It has to stand out.' },
    { group: 'B', who: 'B5', theme: 2, text: 'I want to see straight away whether it has milk and sugar in it.' },
    { group: 'A', who: 'A5', theme: 3, text: 'I’d want it in the shop near my office, not just online.' },
    { group: 'B', who: 'B3', theme: 3, text: 'I buy these at the petrol station on the way to work, so that’s where it needs to be.' },
    { group: 'A', who: 'A8', theme: 3, text: 'Could subscribers add a four-pack to the monthly box?' },
    { group: 'A', who: 'A4', theme: 4, text: 'Cans are fine as long as they’re recyclable. No plastic rings, please.' },
    { group: 'B', who: 'B6', theme: 4, text: 'I care more about the coffee being ethically sourced than about the can.' },
    { group: 'A', who: 'A7', theme: 4, text: 'Lantern already does compostable bags, so I’d expect the can to be just as green.' },
    { group: 'B', who: 'B2', theme: 5, text: 'How much caffeine is in it? Some of these keep me awake all night.' },
    { group: 'A', who: 'A1', theme: 5, text: 'A decaf version would be great for the afternoon.' },
    { group: 'B', who: 'B4', theme: 5, text: 'I’d check the sugar. I’m trying to cut down.' },
    { group: 'A', who: 'A3', theme: 1, text: 'I’d pay more for it than for the big brands because I know who makes it.' },
    { group: 'B', who: 'B6', theme: 3, text: 'If the health food shop on my street had it, I’d try it there.' },
  ],
  coderAgreement: { agreed: 18, of: 20 },
};

/** A shelf-price audit on 15–19 March 2027: the price on the shelf for a single 250 ml can at ten Harbour City stores
 *  (store names withheld; four supermarkets, three convenience stores, three natural and specialty grocers). null = the
 *  brand isn't stocked there; `promo` marks a temporary price cut. M02's usual prices: Summit Brew $3.79, Daily Grind
 *  RTD $2.29, Arcadia Coffee $2.89. */
export const PRICE_AUDIT = {
  brands: COMPETITORS.map((c) => c.name),
  stores: [
    { id: 'S1', channel: 'supermarket', prices: [3.79, 2.29, 2.89] },
    { id: 'S2', channel: 'supermarket', prices: [3.59, 1.99, 2.89], promo: [true, true, false] },
    { id: 'S3', channel: 'supermarket', prices: [3.79, 2.29, 2.79] },
    { id: 'S4', channel: 'supermarket', prices: [3.69, 2.19, 2.99] },
    { id: 'C1', channel: 'convenience', prices: [3.99, 2.49, null] },
    { id: 'C2', channel: 'convenience', prices: [4.19, 2.59, null] },
    { id: 'C3', channel: 'convenience', prices: [3.99, 2.49, null] },
    { id: 'N1', channel: 'natural', prices: [3.89, null, 2.99] },
    { id: 'N2', channel: 'natural', prices: [3.79, null, 3.09] },
    { id: 'N3', channel: 'natural', prices: [3.99, null, 2.99] },
  ],
};

/** Ana's cold brew sizing inputs (March 2027). Store counts are Harbour City's (fictional); the listings and the cans a
 *  store sells a week are Ana's planning assumptions after talking to two store buyers. Direct: Ana's estimate of the
 *  cans a month Lantern's own channel (shop and subscriptions) would sell, a judgement informed by what subscribers said
 *  in the February survey, not a calculation from it. */
export const COLD_BREW_SIZING = {
  stores: { supermarket: 120, convenience: 260, natural: 45 },
  plan: { supermarket: { listed: 30, cansPerWeek: 10 }, natural: { listed: 25, cansPerWeek: 14 } },
  directPerMonth: 1_200,
  goalCans: 100_000,                                          // M02's first-year goal (product-life-cycle lesson)
};

// ---------------------------------------------------------------- the project (lessons and module tests must not use these)
/** Lantern's district: offices with 10 or more staff in the business directory Ana bought (fictional), by size band,
 *  and how many of each she invited to the March 2027 office survey (every large office; more of the middle band). */
export const OFFICE_FRAME = { bands: ['10–49 staff', '50–249 staff', '250 or more staff'], offices: [410, 150, 40], invited: [80, 60, 40] };
export const OFFICE_LEVELS = {
  arrangement: ['None', 'Pod machines', 'Bean-to-cup machine', 'Filter or urn', 'Catered'],
  interest: ['Definitely would sign up', 'Probably would', 'Might or might not', 'Probably would not', 'Definitely would not'],
};
/** The offer described in the survey: a leased bean-to-cup machine, beans delivered weekly and a barista visit each
 *  quarter, for $14 a member of staff a month (minimum 10 staff). */
export const OFFICE_OFFER = { pricePerStaffMonth: 14, minimumStaff: 10 };
export const OFFICES = OFFICE_SURVEY.map(([band, staff, arrangement, spend, interest], i) => ({ id: i + 1, band, staff, arrangement, spend, interest }));
/** What Ana knows before any research (her planning figures, fictional). A year-one launch makes $48,000 of contribution
 *  if demand is strong and loses $30,000 (machine leases, a second van, a part-time barista) if it is weak; before the
 *  research she puts the chance of strong demand at 40%. The survey and the interviews cost $6,000 together. */
export const OFFICE_DECISION = { gainIfStrong: 48_000, lossIfWeak: 30_000, pStrong: 0.4, researchCost: 6_000 };
/** Ana's first draft of the office questionnaire (before a colleague's review): each question with the flaw it has. */
export const OFFICE_DRAFT = [
  { q: 'Don’t you think your staff deserve better coffee than they get now?', flaw: 'Leading' },
  { q: 'How satisfied are you with the price and quality of your current coffee?', flaw: 'Double-barrelled' },
  { q: 'How many cups of coffee did your office drink last year?', flaw: 'Unanswerable from memory' },
  { q: 'How many staff work at your office? 1–10 / 10–50 / 50–250 / 250 or more', flaw: 'Overlapping options' },
  { q: 'Would you sign up for Lantern’s premium artisan bean-to-cup service?', flaw: 'Loaded wording, and no price' },
  { q: 'Which supplier do you use now? Brewline / Daystar / Tidemark', flaw: 'Options not exhaustive' },
];
export const OFFICE_FLAWS = ['Leading', 'Double-barrelled', 'Unanswerable from memory', 'Overlapping options', 'Loaded wording, and no price', 'Options not exhaustive'];
/** Eight interviews with office managers in March 2027 (anonymised; fictional), each remark coded to one theme. */
export const OFFICE_INTERVIEW_THEMES = ['Cost', 'Reliability and maintenance', 'Staff wellbeing', 'Contract terms', 'Sustainability', 'Admin effort'];
export const OFFICE_INTERVIEWS = [
  { who: 'OM1', size: '30 staff', theme: 0, text: 'Anything per head per month gets questioned by finance. I’d need to show it costs less than what we spend on pods.' },
  { who: 'OM2', size: '120 staff', theme: 1, text: 'Our last machine was broken for three weeks and nobody came. Fixing it fast matters more to me than the beans.' },
  { who: 'OM3', size: '400 staff', theme: 2, text: 'People came back to the office for the coffee. It’s one of the few perks everyone notices.' },
  { who: 'OM4', size: '60 staff', theme: 3, text: 'I won’t sign anything longer than a year. We were stuck in a three-year contract last time.' },
  { who: 'OM5', size: '25 staff', theme: 4, text: 'We want to get rid of the pods. The plastic goes straight in the bin.' },
  { who: 'OM6', size: '200 staff', theme: 5, text: 'I just want one invoice and no ordering. If I have to remember to reorder beans, it won’t happen.' },
  { who: 'OM7', size: '80 staff', theme: 0, text: 'Fourteen dollars a head is more than we pay now, but if it replaces the coffee runs people expense, maybe not.' },
  { who: 'OM2', size: '120 staff', theme: 3, text: 'A trial month would make it easy to say yes.' },
  { who: 'OM8', size: '350 staff', theme: 1, text: 'We have three floors. One machine would have a queue; we’d need at least two that are looked after.' },
  { who: 'OM3', size: '400 staff', theme: 4, text: 'Our sustainability report counts waste, so compostable packaging would help us.' },
  { who: 'OM6', size: '200 staff', theme: 2, text: 'A barista visit now and then would be a nice thing for the team, but it isn’t why we’d buy.' },
  { who: 'OM5', size: '25 staff', theme: 5, text: 'I do the ordering on top of my real job, so less admin is the whole point.' },
];
/** Office-coffee offers in the district (March 2027; prices from the suppliers' published price lists and a quote an
 *  office manager shared with Ana; fictional). Price per member of staff a month; minimum contract in months. */
export const OFFICE_COMPETITORS = [
  { name: 'Brewline Office', what: 'Pod machines; pods restocked monthly', pricePerStaffMonth: 11, contractMonths: 24, service: 'next working day' },
  { name: 'Daystar Vending', what: 'Vending machine; each cup billed to the office', pricePerStaffMonth: null, perCup: 0.40, contractMonths: 36, service: 'within 3 working days' },
  { name: 'Tidemark Office', what: 'Bean-to-cup machine; beans and milk delivered', pricePerStaffMonth: 15, contractMonths: 36, service: 'same day' },
  { name: 'Lantern (proposed)', what: 'Bean-to-cup machine; weekly beans; quarterly barista visit', pricePerStaffMonth: OFFICE_OFFER.pricePerStaffMonth, contractMonths: 12, service: 'next working day' },
];
/** Secondary data for the top-down size (fictional): the Harbour City Statistics Office's 2026 business register says
 *  38,500 people work in offices of 10 or more staff in Lantern's district (its count of office-based workplaces, a
 *  year older than Ana's directory); Ana's planning assumptions for turning
 *  stated interest into sign-ups (half of "definitely", a sixth of "probably", none of the rest) and the most offices she
 *  can install and serve in the first year (one van, one technician). */
export const OFFICE_SIZING = { districtStaff10plus: 38_500, conversion: [0.5, 1 / 6, 0, 0, 0], maxInstallsYear1: 35, cupsPerStaffDay: 1.4, workdaysMonth: 21 };

// ---------------------------------------------------------------- derived figures (recomputed by the checker)
const resp = RESPONDENTS;
const byS = STRATA.map((_, h) => resp.filter((r) => r.stratum === h));
const share = (xs, f) => xs.filter(f).length / xs.length;
const npsOf = (xs) => S.nps(xs.map((r) => r.nps));
const post = S.postStratWeights(SIZES, byS.map((x) => x.length));
const w = resp.map((r) => post.weights[r.stratum]);
const wShare = (f) => S.weightedMean(resp.map((r) => (f(r) ? 1 : 0)), w);
const truthShare = (f) => stratum.map((_, i) => i).filter((i) => f({ group: group[i], coldbrew: PEOPLE.coldbrew[i] })).length / stratum.length;
const auditAll = PRICE_AUDIT.stores.flatMap((s) => s.prices).filter((p) => p != null);
const sizingSam = DEFAULT_PLAN.channels.reduce((a, id) => a + CHANNELS.find((c) => c.id === id).volume, 0) * CATEGORY.cansPerYear;
const sz = COLD_BREW_SIZING;
const bottomUp = (sz.plan.supermarket.listed * sz.plan.supermarket.cansPerWeek + sz.plan.natural.listed * sz.plan.natural.cansPerWeek) * 52 + sz.directPerMonth * 12;

export const DERIVED = {
  list: { N: stratum.length, sizes: SIZES },
  survey: {
    allocation: SURVEY_2027.allocation,
    completes: resp.length, completesByStratum: byS.map((x) => x.length),
    rr: S.responseRates(DISPOSITIONS.all), rrByStratum: DISPOSITIONS.byStratum.map((d) => S.responseRates(d)),
    marginPlanned: S.marginOfError(0.5, SURVEY_PLAN && B04.project.surveyPlan.n), marginAchieved: S.marginOfError(0.5, resp.length),
  },
  nps: {
    unweighted: npsOf(resp), byStratum: byS.map(npsOf),
    weighted: (() => { const pP = wShare((r) => r.group === 2), pD = wShare((r) => r.group === 0); return { pP, pD, score: 100 * (pP - pD) }; })(),
    stratified: (() => { const P = S.stratifiedProportion(byS.map((x, h) => ({ N: SIZES[h], n: x.length, x: x.filter((r) => r.group === 2).length }))); return P; })(),
    truth: 100 * (truthShare((r) => r.group === 2) - truthShare((r) => r.group === 0)),
  },
  weights: { perStratum: post.weights, kish: S.kish(w) },
  coldbrew: {
    topBox: S.topBox(resp.map((r) => r.coldbrew), 1), topTwo: S.topBox(resp.map((r) => r.coldbrew), 2),
    topBoxWeighted: wShare((r) => r.coldbrew === 1), topTwoWeighted: wShare((r) => r.coldbrew <= 2),
    truthTopBox: truthShare((r) => r.coldbrew === 1), truthTopTwo: truthShare((r) => r.coldbrew <= 2),
    byStratumTopTwo: byS.map((x) => share(x, (r) => r.coldbrew <= 2)),
    crosstab: S.crosstab(resp.map((r) => STRATA[r.stratum]), resp.map((r) => LEVELS.coldbrew[r.coldbrew - 1]), STRATA, LEVELS.coldbrew),
  },
  cups: { mean: resp.reduce((a, r) => a + r.cups, 0) / resp.length, median: (() => { const s = resp.map((r) => r.cups).sort((a, b) => a - b), m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; })() },
  themes: LEVELS.theme.map((_, k) => resp.filter((r) => r.theme === k).length),
  audit: { mean: auditAll.reduce((a, b) => a + b, 0) / auditAll.length, observations: auditAll.length },
  sizing: {
    tamCans: CATEGORY.cansPerYear, samCans: sizingSam, samShare: sizingSam / CATEGORY.cansPerYear, bottomUpCans: bottomUp,
    goalShareOfSam: sz.goalCans / sizingSam, bottomUpShareOfSam: bottomUp / sizingSam,
  },
  focus: { quotesByTheme: FOCUS_GROUPS.themes.map((_, k) => FOCUS_GROUPS.quotes.filter((q) => q.theme === k).length), agreement: FOCUS_GROUPS.coderAgreement.agreed / FOCUS_GROUPS.coderAgreement.of },
};

export const IDENTITIES = [
  ['the list holds B04’s 6,000 people', stratum.length === MAILING_LIST],
  ['520 subscribers on the list (B04’s December survey invited all 520)', SIZES[0] === SUBSCRIBER_SURVEY.invited],
  ['1,520 shop customers on the list, about the 1,500 M01 and B01 count by December', SIZES[0] + SIZES[1] === 1_520 && Math.abs(SIZES[0] + SIZES[1] - BUSINESS.online.customers) <= 50 && SHOP.newCustomers.reduce((a, b) => a + b, 0) === 1_406],
  ['workshop participants within the 168 places M01’s 14 workshops sold', SIZES[2] <= BUSINESS.workshops.held * BUSINESS.workshops.avgParticipants],
  ['2,004 invitations: B04’s plan', DISPOSITIONS.all.invited === 2_004 && SURVEY_2027.allocation.reduce((a, b) => a + b, 0) === 2_004],
  ['each stratum’s invitations match the proportional allocation', DISPOSITIONS.byStratum.every((d, h) => d.invited === SURVEY_2027.allocation[h])],
  ['B01’s September survey: 79 of 240', B01_SURVEY.sent === 240 && B01_SURVEY.responses === 79],
  ['M02’s category: 4.8 million cans; plan channels carry 70%', CATEGORY.cansPerYear === 4_800_000 && Math.abs(sizingSam - 3_360_000) < 1],
  ['M02’s Cold Brew price $3.49 in the survey question', DEFAULT_PLAN.price === 3.49],
  ['M01: Brewline $7.50 a head', BREWLINE.pricePerHead === 7.5],
  ['every quotation coded to a listed theme', FOCUS_GROUPS.quotes.every((q) => q.theme >= 0 && q.theme < FOCUS_GROUPS.themes.length)],
  ['audit brands are M02’s competitors', PRICE_AUDIT.brands.join() === 'Summit Brew,Daily Grind RTD,Arcadia Coffee'],
];
