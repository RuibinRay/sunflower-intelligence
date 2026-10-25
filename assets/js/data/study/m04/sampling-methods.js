// sampling-methods.js — M04 · Sampling methods. Content only; exercises are in sampling-methods.ex.js.
// Lantern's mailing list (SIZES, STRATA), the February allocation (SURVEY_2027) and B04's plan (SURVEY_PLAN) come from
// case.js. The list's known answers (PEOPLE) appear only in the sampler demonstration and its checks, never as something
// Ana knows. Brindlecombe Garden Centre, Orrinsby Software and Marrowby Buses are fictional. Non-response, response
// rates and weighting for it are survey-error's; here every design is shown with full response.
import { SIZES, STRATA, SURVEY_2027, SURVEY_PLAN, PEOPLE } from './case.js?v=13';
import * as S from '../../../core/survey.js?v=13';
import * as I from '../../../core/inference.js?v=13';

const N = SIZES.reduce((a, b) => a + b, 0), INV = SURVEY_2027.invited, A = SURVEY_2027.allocation;
const RAW = SIZES.map((k) => (INV * k) / N);
const CUSTOMERS = SIZES[0] + SIZES[1] + SIZES[2];
const Z = I.normInv(0.975);
const nPlan = I.sampleSizeProp(SURVEY_PLAN.margin, SURVEY_PLAN.conf);
const RR = SURVEY_PLAN.responseRate;
const EXP = A.map((a) => a * RR);                                   // expected completes per stratum at 30%
const moeF = (n, Nh) => Z * Math.sqrt(0.25 / n) * Math.sqrt((Nh - n) / (Nh - 1));
const n0_10 = Z ** 2 * 0.25 / 0.1 ** 2;
const nF = (n0, Nh) => n0 / (1 + (n0 - 1) / Nh);
const wsAll = moeF(SIZES[2] * RR, SIZES[2]);

// Brindlecombe Garden Centre (fictional): loyalty tiers
const BR = { N: [5230, 2270, 500], n: 400 };
const BR_RAW = BR.N.map((k) => (BR.n * k) / 8000), BR_ALLOC = S.proportionalAllocation(BR.N, BR.n);
// Orrinsby Software (fictional): plans; disproportionate sample; share who would pay for a new feature
const OR = [{ N: 8000, n: 200, x: 22 }, { N: 1600, n: 200, x: 64 }, { N: 400, n: 100, x: 61 }];
const ORE = S.stratifiedProportion(OR);
const ORPOOL = OR.reduce((a, s) => a + s.x, 0) / OR.reduce((a, s) => a + s.n, 0);
const ORSRS = Math.sqrt(ORE.p * (1 - ORE.p) / 500);
const ORNEY = S.neymanAllocation(OR.map((s) => s.N), ORE.strata.map((s) => Math.sqrt(s.p * (1 - s.p))), 500);
const ORPROP = S.proportionalAllocation(OR.map((s) => s.N), 500);
const OR_ENT = Z * Math.sqrt((0.61 * 0.39) / 99 * (1 - 100 / 400));
// Marrowby Buses (fictional): cluster design
const MB = { buses: 40, per: 25, rho: 0.04 };
const MBdeff = 1 + (MB.per - 1) * MB.rho, MBn = MB.buses * MB.per;

// the sampler demonstration (the list's known answers; the widget draws seeded samples around these expected values)
const PROM = PEOPLE.group.map((g) => (g === 2 ? 1 : 0)), TRUTH = PROM.reduce((a, b) => a + b, 0) / N;
const SE_SRS300 = Math.sqrt(TRUTH * (1 - TRUTH) / 300 * (N - 300) / (N - 1));
const BATCH = {}; PEOPLE.batch.forEach((b, i) => { (BATCH[b] ||= []).push(PROM[i]); });
const BSH = Object.values(BATCH).map((x) => x.reduce((a, c) => a + c, 0) / x.length);
const BM = BSH.reduce((a, b) => a + b, 0) / BSH.length, BV = BSH.reduce((a, b) => a + (b - BM) ** 2, 0) / (BSH.length - 1);
const SE_CL300 = Math.sqrt(BV / 3 * (1 - 3 / BSH.length));
const Q = PEOPLE.propensity.map((x) => Math.min(1, 2.2 * x * x));
const OPTIN = Q.reduce((a, q, i) => a + q * PROM[i], 0) / Q.reduce((a, b) => a + b, 0);

const fmt = (n) => n.toLocaleString('en-US');
const pc = (v, d = 1) => `${(v * 100).toFixed(d)}%`;

// ---------------------------------------------------------------- figure: frame, coverage and the allocation
function frameFigure() {
  const scale = 420 / Math.max(...SIZES), y0 = 236, row = 34;
  let s = '<svg viewBox="0 0 680 396" xmlns="http://www.w3.org/2000/svg" font-family="inherit" font-size="13">';
  s += '<rect x="16" y="34" width="364" height="140" rx="14" style="fill:none;stroke:var(--series-2);stroke-width:2"/>';
  s += '<rect x="232" y="34" width="432" height="140" rx="14" style="fill:none;stroke:var(--series-1);stroke-width:2"/>';
  s += '<text x="124" y="24" text-anchor="middle" font-weight="700" fill="currentColor">Target population: customers</text>';
  s += `<text x="448" y="24" text-anchor="middle" font-weight="700" fill="currentColor">Sampling frame: the mailing list (${fmt(N)})</text>`;
  s += '<text x="124" y="80" text-anchor="middle" fill="currentColor">Customers not</text><text x="124" y="98" text-anchor="middle" fill="currentColor">on the list</text>';
  s += '<text x="124" y="124" text-anchor="middle" font-size="12" fill="var(--ink-3)">undercoverage:</text><text x="124" y="140" text-anchor="middle" font-size="12" fill="var(--ink-3)">can never be chosen</text>';
  s += `<text x="306" y="80" text-anchor="middle" fill="currentColor">Customers</text><text x="306" y="98" text-anchor="middle" fill="currentColor">on the list</text><text x="306" y="122" text-anchor="middle" font-weight="700" fill="currentColor">${fmt(CUSTOMERS)}</text>`;
  s += `<text x="522" y="80" text-anchor="middle" fill="currentColor">Never bought:</text><text x="522" y="98" text-anchor="middle" fill="currentColor">newsletter only</text><text x="522" y="122" text-anchor="middle" font-weight="700" fill="currentColor">${fmt(SIZES[3])}</text>`;
  s += '<text x="522" y="146" text-anchor="middle" font-size="12" fill="var(--ink-3)">overcoverage for a question</text><text x="522" y="162" text-anchor="middle" font-size="12" fill="var(--ink-3)">about customers</text>';
  s += `<text x="16" y="214" font-weight="700" fill="currentColor">Proportional stratified sample: ${fmt(INV)} invitations, ${pc(INV / N)} of every stratum</text>`;
  STRATA.forEach((nm, h) => {
    const y = y0 + h * row, wN = SIZES[h] * scale, wn = A[h] * scale;
    s += `<text x="16" y="${y + 15}" font-size="12" fill="currentColor">${nm}</text>`;
    s += `<text x="232" y="${y + 15}" text-anchor="end" font-size="12" fill="currentColor">${fmt(SIZES[h])} → ${fmt(A[h])}</text>`;
    s += `<rect x="242" y="${y}" width="${wN.toFixed(1)}" height="20" style="fill:none;stroke:var(--series-1);stroke-width:1.5"/>`;
    s += `<rect x="242" y="${y}" width="${wn.toFixed(1)}" height="20" style="fill:var(--series-1);opacity:0.55"/>`;
  });
  s += `<text x="242" y="${y0 + 4 * row + 14}" font-size="12" fill="var(--ink-3)">Outline: people on the list in the stratum. Shaded: invited.</text>`;
  return `${s}</svg>`;
}

export default {
  slug: 'sampling-methods',
  title: 'Sampling methods',
  blurb: 'Who could be in your survey decides what it can tell you. Define the target population, frame and sampling unit; choose among simple random, systematic, stratified, cluster and multistage designs and know what non-probability samples can and can’t support; allocate a stratified sample and estimate from it with a standard error; and size a sample for the subgroups you need to read.',
  status: 'draft',
  objectives: [
    'Define the target population, sampling frame and sampling unit of a survey, and identify the undercoverage and overcoverage between them.',
    'Compare simple random, systematic, stratified, cluster and multistage designs on cost, precision and the frame each needs, using the design effect.',
    'Explain why convenience, judgement, quota and snowball samples, opt-in panels and river samples are not probability samples, and when they are still useful.',
    'Calculate proportional and Neyman allocations of a stratified sample, by hand and in Excel, and a stratified estimate of a proportion with its standard error.',
    'Plan a sample size from a margin of error, adjusted for the expected response rate and for subgroups that must be read separately.',
  ],
  prerequisites: [
    { lesson: 'b01/data-collection', why: 'Populations, samples, sampling frames and the basic random and non-random designs are taken as read.' },
    { lesson: 'b04/sampling-distributions', why: 'The standard error, the finite population correction and the four random designs in statistical terms come from there.' },
    { lesson: 'b04/confidence-intervals', why: 'The margin of error and the sample size n = z²p(1 − p) ÷ E² are used, not re-derived.' },
  ],
  case: 'lantern',

  concept: [
    { case: `B04’s project gave Ana a sample size: ${nPlan} completed questionnaires for a margin of ±${SURVEY_PLAN.margin * 100} points at ${SURVEY_PLAN.conf * 100}%, which at the ${RR * 100}% response she expected meant ${fmt(INV)} invitations. It didn’t say whom to invite. Her mailing list on 1 February 2027 held ${fmt(N)} people in four groups: ${fmt(SIZES[0])} subscribers, ${fmt(SIZES[1])} other shop customers, ${fmt(SIZES[2])} workshop participants and ${fmt(SIZES[3])} people who receive only the newsletter. This lesson is about that choice, and about what it allows her to claim.` },

    { h: 'Who the survey is about, and who it can reach' },
    { p: 'Start with the <g>target population</g>: the whole group a survey’s conclusions are meant to describe, defined by the research question. The <g>sampling frame</g> (B01) is the list or source from which the sample is actually drawn, and the <g>sampling unit</g> is what the frame lists and the design selects: a person, a household, a store, a sign-up batch. Ideally frame and target population coincide. In practice they overlap, and the two kinds of mismatch push results in different ways.' },
    { p: '<g>Undercoverage</g> means members of the target population who are missing from the frame and so can never be chosen, however carefully the sample is drawn. <g>Overcoverage</g> means units on the frame that are outside the target population: they can be chosen, and unless they are screened out, their answers are mixed in with everyone else’s. Both are decided before a single invitation goes out, and neither shows up in a margin of error.' },
    { figure: {
      svg: frameFigure(),
      caption: `Lantern’s mailing list against the customers it is meant to represent, and the February allocation. For a question about customers, ${fmt(SIZES[3])} people on the frame are outside the target, and customers who never joined the list can’t be reached.`,
      alt: `Top: two overlapping rounded rectangles. The left one is labelled “Target population: customers”, the right one “Sampling frame: the mailing list (${fmt(N)})”. The left-only part reads “Customers not on the list; undercoverage: can never be chosen”. The overlap reads “Customers on the list, ${fmt(CUSTOMERS)}”. The right-only part reads “Never bought: newsletter only, ${fmt(SIZES[3])}; overcoverage for a question about customers”. Bottom: “Proportional stratified sample: ${fmt(INV)} invitations, ${pc(INV / N)} of every stratum”, with one horizontal bar per stratum, its outline proportional to the stratum’s size and a shaded part for the invitations: ${STRATA.map((nm, h) => `${nm}, ${fmt(SIZES[h])} on the list, ${fmt(A[h])} invited`).join('; ')}.`,
    } },
    { case: `For Ana’s question about how customers see Lantern, the target population is everyone who has bought from Lantern. Her list holds ${fmt(CUSTOMERS)} of them (subscribers, other shop customers and workshop participants) and misses some: anyone who has unsubscribed, catering clients who deal with Lantern by invoice and never joined the list, and guests who drank Lantern coffee at an event without signing up. It also holds ${fmt(SIZES[3])} newsletter readers who have never bought. For the Cold Brew question the gap is wider still: the people who will decide Cold Brew’s fate are Harbour City’s ready-to-drink coffee buyers, and the list reaches only the small, friendly slice of them who already know Lantern.` },
    { p: 'None of this makes the list useless. It makes the February survey a survey of Lantern’s contacts, whose results describe Lantern’s contacts. Ana can read the customer strata on their own, and she must not read the Cold Brew answers as a measure of the city’s market; sizing that market is module 3’s job.' },

    { h: 'Probability and non-probability samples' },
    { p: 'A <g>probability sample</g> is drawn so that every unit on the frame has a known chance of selection, greater than zero, decided by a random mechanism. OpenStax’s <i>Principles of Marketing</i> puts it as every member having an identified likelihood of being selected. That known chance is what lets the sampling distribution from B04 apply: it is why a standard error and a margin of error mean something.' },
    { p: 'In a <g>non-probability sample</g> the chance that any given person ends up in the sample is unknown, because people are chosen by the researcher’s judgement, by convenience, or by their own decision to take part. Such samples can be quick, cheap and useful, but the formulas for standard errors don’t apply to them as they stand. The AAPOR task force on non-probability sampling concludes that inference from them can be valid only to the extent that the modelling assumptions behind it hold, and warns that analysing them as if they were simple random samples invalidates the standard errors.' },
  ],

  theory: [
    { h: 'Probability designs' },
    { p: 'B01 and B04 introduced the four basic random designs; the question for a researcher is which suits the frame, the budget and the estimates needed. A <g>simple random sample</g> needs only a complete list. A <g>systematic sample</g> takes every kth unit from a random start, which is easy from a list and spreads the sample across it, but can go wrong if the list has a cycle of the same length. Lantern’s list is in sign-up order; every third person from a random start among the first three would give 2,000 invitations.' },
    { p: 'A <g>stratified sample</g> needs the stratum of every unit on the frame before sampling, which Lantern’s list provides. It guarantees each group its share of the sample and is more precise than a simple random sample of the same size when the strata differ on what is measured. A <g>cluster sample</g> selects whole groups, such as stores, streets or sign-up batches, and takes everyone in them. It is cheaper when travelling to or listing every unit is expensive, and less precise, because members of a cluster tend to resemble each other.' },
    { p: 'A <g>multistage sample</g> combines these: it samples clusters, then units within them, sometimes in more than two stages. A national shopper survey might choose towns at random, then supermarkets in each chosen town, then shoppers at set times outside each chosen supermarket. It needs a list only of the units at each stage (towns, then those towns’ supermarkets), not of every shopper in the country, which is why face-to-face surveys of large populations are usually multistage.' },
    { table: {
      caption: 'Probability designs compared',
      head: ['Design', 'Frame it needs', 'Cost', 'Precision for a given n', 'Watch for'],
      rows: [
        ['Simple random', 'A complete list of units', 'Low for a list; high if units are spread out', 'The benchmark', 'Small groups can be under-represented by chance'],
        ['Systematic', 'An ordered list', 'Low', 'About as simple random; better if the list order is meaningful', 'A cycle in the list with the same period'],
        ['Stratified', 'A list with every unit’s stratum', 'Low to moderate', 'Better when strata differ on the measure', 'Disproportionate allocations need weighting'],
        ['Cluster', 'A list of clusters only', 'Lowest per unit when units are spread out', 'Worse: clusters are internally alike', 'Too few clusters; large clusters'],
        ['Multistage', 'Lists at each stage', 'Low for national face-to-face work', 'Worse than simple random; better than one-stage clusters of the same size', 'Complex standard errors'],
      ],
    } },

    { h: 'The design effect' },
    { p: String.raw`The <g>design effect</g> compares a design with simple random sampling: it is the variance of an estimate under the design divided by its variance under a simple random sample of the same size. A design effect of 2 means the design needs twice the sample to match a simple random sample’s precision; its <g>effective sample size</g> is <m>n \div \text{deff}</m>. Stratification usually gives a design effect a little below 1; clustering gives one above it.` },
    { p: String.raw`For clusters of equal size b the design effect is about <m>1 + (b - 1)\rho</m>, where ρ, the <g>intraclass correlation</g>, measures how alike members of the same cluster are (0 if no more alike than strangers, 1 if identical). Because ρ is multiplied by the cluster size, even a small one hurts: Marrowby Buses (fictional) surveying all 25 passengers on each of 40 buses, with ρ = 0.04, has a design effect of <m>1 + 24 \times 0.04 = ${MBdeff.toFixed(2)}</m>, so its ${fmt(MBn)} passengers carry the precision of about ${Math.round(MBn / MBdeff)} independent ones.` },

    { h: 'Allocating a stratified sample' },
    { p: String.raw`<g>Proportional allocation</g> gives each stratum the same share of the sample as it has of the frame: <m>n_h = n \times N_h \div N</m>. Every unit then has the same chance of selection, and the sample is self-weighting: its plain percentages estimate the population’s. For Lantern, <m>${fmt(INV)} \times 520 \div ${fmt(N)} = ${RAW[0].toFixed(2)}</m>, and likewise ${RAW.slice(1).map((v) => v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })).join(', ')} for the other three strata. The parts must be whole and add to ${fmt(INV)}: rounding down gives ${A.map((a, h) => Math.floor(RAW[h])).reduce((x, y) => x + y, 0).toLocaleString('en-US')}, and the largest-remainder method gives the missing invitation to the stratum with the largest fraction left over (subscribers, .68), which is how ${A.map(fmt).join(' / ')} was reached.` },
    { p: String.raw`In Excel, put the stratum sizes in B2:B5 and the sample size in B8, and fill <x>=$B$8*B2/SUM($B$2:$B$5)</x> down for the unrounded allocation. <x>=ROUND(...,0)</x> usually works but can leave the total one out: Brindlecombe Garden Centre’s example below rounds to 401. Check the total, and adjust the stratum with the largest remainder by hand.` },
    { p: String.raw`<g>Disproportionate allocation</g> deliberately samples some strata at higher rates than others, usually to read a small group separately. The units then have unequal chances of selection, so the strata must be combined with population weights, not by pooling the sample: the next section shows how. <g>Neyman allocation</g> is the allocation that minimises the standard error of the overall estimate for a fixed n: <m>n_h \propto N_h S_h</m>, more sample where strata are larger or more variable. For a proportion, <m>S_h = \sqrt{p_h(1 - p_h)}</m> barely changes between 0.3 and 0.7, so Neyman allocation is close to proportional unless some strata have shares near 0 or 1.` },

    { h: 'The stratified estimate and its standard error' },
    { p: String.raw`Whatever the allocation, the <g>stratified estimate</g> of a proportion weights each stratum’s sample proportion by the stratum’s share of the population: <m>\hat{p}_{st} = \sum W_h \hat{p}_h</m>, with <m>W_h = N_h \div N</m>. Its standard error adds the strata’s variances, each weighted by <m>W_h^2</m> and corrected for the share of the stratum sampled. Under proportional allocation <m>\hat{p}_{st}</m> equals the sample’s overall proportion; under disproportionate allocation the two differ, and only the stratified estimate is right.` },
    { p: String.raw`Orrinsby Software (fictional), worked in full below, sampled its three plans at very different rates. Pooling its 500 replies gives ${pc(ORPOOL)} who would pay for a new feature; the stratified estimate is ${pc(ORE.p)}, with a standard error of ${(ORE.se * 100).toFixed(2)} points. The pooled figure counts each Enterprise reply as if it stood for as many customers as a Free reply, when it stands for a tenth as many (4 customers against 40). In Excel, with the stratum sizes in B2:B4, sample sizes in C2:C4 and “yes” counts in D2:D4, the estimate is <x>=SUMPRODUCT(B2:B4,D2:D4/C2:C4)/SUM(B2:B4)</x>.` },

    { h: 'Non-probability designs' },
    { p: 'Five kinds are common in market research, and none gives each unit a known chance of selection.' },
    { list: [
      '<b><g>Convenience sample</g></b> (B01): whoever is easiest to reach, such as shoppers passing a stall.',
      '<b><g>Judgement sample</g></b>: units the researcher picks as typical or informative, such as the five stores a manager thinks represent the chain. OpenStax names it alongside convenience sampling.',
      '<b><g>Quota sample</g></b>: interviewers fill set numbers in groups defined by easily observed traits, such as 50 women and 50 men in each age band, choosing whom to approach themselves. The AAPOR task force describes it as a form of sample matching and recalls that the quota-based polls of the 1948 U.S. presidential election went wrong. The quotas match the population on the quota traits only; within each quota, the interviewer’s choices decide who is asked.',
      '<b><g>Snowball sample</g></b>: participants recruit further participants from among their contacts, useful for groups with no list, such as owners of a rare car. Its make-up depends on who started the chain and whom they know.',
      '<b>Online panels and river samples</b>: an <g>opt-in panel</g> is a pool of volunteers who signed up to take surveys, usually for rewards; a <g>river sample</g>, in AAPOR’s words, is a web-based opt-in approach that recruits respondents through invitations on websites (pop-ups, banners and links). Both are self-selected: the AAPOR task force notes that participation rates in surveys of opt-in panels are often in single digits.',
    ] },
    { p: 'Quota sampling is the one most often mistaken for stratification, because both fix numbers per group. The difference is in the last step: a stratified sample draws at random within each stratum from a list, whereas a quota sample lets interviewers fill each cell with whoever they find. People who are at home, approachable or online at the right moment fill the quotas, and nothing guarantees they resemble the rest of their group.' },
    { p: 'Non-probability samples have honest uses: pretests, <g>qualitative research</g>, exploring hard-to-reach groups, tracking changes over time with a method held constant, and fast reads where a rough answer is enough. What they can’t do is support a margin of error on their own. Report them as what they are (“of 400 panel members who took part”), describe how they were recruited and weighted, and treat their levels with caution.' },

    { h: 'How big a sample?' },
    { p: String.raw`B04 gave the size for a proportion: <m>n = z^2 p(1 - p) \div E^2</m>, with p = 0.5 when nothing is known, so ±4 points at 95% needs ${nPlan} completed questionnaires. Three adjustments turn that into a plan. When the sample is a large share of a small population, the finite population correction reduces the need to <m>n = n_0 \div (1 + (n_0 - 1) \div N)</m>. The number of invitations is the completes needed divided by the expected response rate: <m>${nPlan} \div ${RR} = ${(nPlan / RR).toFixed(1)}</m>, so ${fmt(INV)}. And if a subgroup must be read separately, the size must be worked out for that subgroup, not for the whole.` },
    { p: String.raw`The last adjustment is the one most often missed. A proportional design gives each stratum its share of the completes, so small strata get few. At the planned ${RR * 100}% response, Lantern’s ${A[2]} workshop invitations would yield about ${EXP[2]} completes, a margin of about ±${(moeF(EXP[2], SIZES[2]) * 100).toFixed(0)} points for that group, too wide to say anything about workshop participants on their own. Reading every stratum to ±10 points needs about ${Math.ceil(n0_10)} completes each before the correction (fewer in the small strata), which means a disproportionate design and weighting afterwards.` },
    { p: 'Two warnings go with every sample size. It is a number of usable completes, so the invitations depend on a response rate that is itself a guess. And it controls sampling error only: a large sample from the wrong frame, or one in which the people who reply differ from those who don’t, is precisely wrong. Who replies is the subject of the next lesson.' },
  ],

  formulas: [
    { id: 'sm-prop-alloc', name: 'Proportional allocation',
      tex: String.raw`n_h = n \times \dfrac{N_h}{N}`,
      where: [[String.raw`n_h`, 'The sample (or invitations) given to stratum h', 'units'], [String.raw`n`, 'The total sample', 'units'], [String.raw`N_h`, 'The number of units in stratum h on the frame', 'units'], [String.raw`N`, 'The number of units on the whole frame', 'units']],
      assumptions: 'Round so that the parts add to n (largest remainder).',
      note: 'Every unit has the same chance n ÷ N, so the sample is self-weighting.' },
    { id: 'sm-neyman', name: 'Neyman allocation',
      tex: String.raw`n_h = n \times \dfrac{N_h S_h}{\sum_k N_k S_k}`,
      where: [[String.raw`S_h`, 'The standard deviation of the measure in stratum h; for a proportion, √(p_h(1 − p_h)) from a guess or a past survey', 'units of the measure'], [String.raw`N_h`, 'The size of stratum h', 'units'], [String.raw`N_k,\ S_k`, 'The size and standard deviation of each stratum k, summed over all strata', ''], [String.raw`n,\ n_h`, 'The total sample and stratum h’s part of it', 'units']],
      assumptions: 'Sampling costs the same in every stratum. It minimises the standard error of the overall estimate for one measure; other measures may favour other allocations.' },
    { id: 'sm-strat-est', name: 'Stratified estimate of a proportion',
      tex: String.raw`\hat{p}_{st} = \sum_h W_h \hat{p}_h, \qquad W_h = \dfrac{N_h}{N}`,
      where: [[String.raw`\hat{p}_h`, 'The sample proportion in stratum h', ''], [String.raw`W_h`, 'Stratum h’s share of the population', ''], [String.raw`N_h,\ N`, 'Stratum and population sizes', 'units']],
      assumptions: 'A random sample within each stratum.',
      note: 'In Excel: <x>=SUMPRODUCT(B2:B4,D2:D4/C2:C4)/SUM(B2:B4)</x> with N_h in B, n_h in C and the counts in D.' },
    { id: 'sm-strat-se', name: 'Standard error of a stratified proportion',
      tex: String.raw`\text{SE}(\hat{p}_{st}) = \sqrt{\sum_h W_h^2 \left(1 - \dfrac{n_h}{N_h}\right) \dfrac{\hat{p}_h(1 - \hat{p}_h)}{n_h - 1}}`,
      where: [[String.raw`W_h`, 'Stratum h’s share of the population, N_h ÷ N', ''], [String.raw`n_h,\ N_h`, 'Sample and population sizes in stratum h', 'units'], [String.raw`\hat{p}_h`, 'The sample proportion in stratum h', ''], [String.raw`1 - n_h/N_h`, 'The finite population correction for stratum h', '']],
      assumptions: 'Simple random sampling without replacement within each stratum; at least two units sampled per stratum. Some texts divide by n_h instead of n_h − 1, which matters only in small strata.',
      note: 'The margin of error is z × SE, as in B04.' },
    { id: 'sm-deff', name: 'Design effect and effective sample size (clusters of equal size)',
      tex: String.raw`\text{deff} = \dfrac{\text{Var}_{\text{design}}}{\text{Var}_{\text{SRS}}} \approx 1 + (b - 1)\rho, \qquad n_{\text{eff}} = \dfrac{n}{\text{deff}}`,
      where: [[String.raw`\text{Var}_{\text{design}},\ \text{Var}_{\text{SRS}}`, 'The variance of the estimate under the design, and under a simple random sample of the same size', ''], [String.raw`b`, 'The number of units taken from each cluster', 'units'], [String.raw`\rho`, 'The intraclass correlation: how alike units in the same cluster are', ''], [String.raw`n`, 'The number of units in the sample', 'units'], [String.raw`n_{\text{eff}}`, 'The effective sample size', 'units'], [String.raw`\text{deff}`, 'The design effect', '']],
      assumptions: 'The approximation 1 + (b − 1)ρ is for clusters of equal size with a common ρ.' },
    { id: 'sm-n-plan', name: 'Completes and invitations for a margin of error',
      tex: String.raw`n_0 = \dfrac{z^2 p(1 - p)}{E^2}, \qquad n = \dfrac{n_0}{1 + (n_0 - 1)/N}, \qquad \text{Invitations} = \dfrac{n}{r}`,
      where: [[String.raw`n_0`, 'The completes needed from a large population (B04)', 'units'], [String.raw`z`, 'The z multiplier for the confidence level (1.96 for 95%)', ''], [String.raw`p`, 'A planning value for the proportion (0.5 when unknown)', ''], [String.raw`E`, 'The margin of error wanted, as a proportion', ''], [String.raw`N`, 'The size of the population or stratum', 'units'], [String.raw`n`, 'The completes needed with the finite population correction', 'units'], [String.raw`r`, 'The expected response rate', '']],
      assumptions: 'Round each result up. Work it out separately for every subgroup that must be read on its own.' },
  ],

  examples: [
    { level: 'simple', title: 'Allocating Brindlecombe’s sample of 400', fictional: true,
      setup: 'Brindlecombe Garden Centre (fictional) has 8,000 loyalty members in three tiers: 5,230 Green, 2,270 Silver and 500 Gold. It wants a proportional stratified sample of 400. How many should it draw from each tier?',
      steps: [
        String.raw`Each tier’s share of the frame: <m>5{,}230 \div 8{,}000 = 0.65375</m>, <m>2{,}270 \div 8{,}000 = 0.28375</m>, <m>500 \div 8{,}000 = 0.0625</m>.`,
        String.raw`Unrounded allocation, <m>n_h = 400 \times N_h \div N</m>: ${BR_RAW.map((v) => v.toFixed(1)).join(', ')}.`,
        String.raw`Rounding each to the nearest whole number with Excel’s ROUND (halves away from zero) gives ${BR.N.map((k) => Math.round(400 * k / 8000)).join(' + ')} = ${BR.N.map((k) => Math.round(400 * k / 8000)).reduce((a, b) => a + b, 0)}: one too many.`,
        String.raw`Largest remainder instead: round all down (${BR_RAW.map(Math.floor).join(' + ')} = ${BR_RAW.map(Math.floor).reduce((a, b) => a + b, 0)}), then give the one missing place to the largest remainder. Green and Silver tie at .5; the tie is broken by a rule fixed in advance (here, the larger tier), giving ${BR_ALLOC.join(', ')}.`,
      ],
      answer: `${BR_ALLOC[0]} Green, ${BR_ALLOC[1]} Silver and ${BR_ALLOC[2]} Gold members, drawn at random within each tier.`,
      interpretation: `Every member has the same chance of selection, ${400} ÷ 8,000 = 5%, give or take the rounding, so the 400 replies can be summarised without weights. Only ${BR_ALLOC[2]} Gold members are in it, though: if Brindlecombe needs to read Gold members on their own, it needs a disproportionate design.` },

    { level: 'challenging', title: 'Orrinsby’s disproportionate sample', fictional: true,
      setup: 'Orrinsby Software (fictional) has 8,000 Free, 1,600 Pro and 400 Enterprise customers, and asks a random sample in each plan whether they would pay for a new reporting feature. To read Enterprise customers on their own it samples 200 Free, 200 Pro and 100 Enterprise customers (all reply, for simplicity). 22, 64 and 61 say yes. Estimate the share of all customers who would pay, with its standard error and a 95% margin, and compare it with the pooled sample share.',
      table: { head: ['Plan', 'Customers (N_h)', 'W_h', 'Sampled (n_h)', 'Yes', 'p̂_h'], rows: OR.map((s, i) => [['Free', 'Pro', 'Enterprise'][i], fmt(s.N), ORE.strata[i].W.toFixed(2), s.n, s.x, (s.x / s.n).toFixed(2)]), align: ['l', 'r', 'r', 'r', 'r', 'r'] },
      steps: [
        String.raw`Stratum proportions: <m>22 \div 200 = 0.11</m>, <m>64 \div 200 = 0.32</m>, <m>61 \div 100 = 0.61</m>; weights <m>W_h = N_h \div N</m> = 0.80, 0.16, 0.04.`,
        String.raw`Stratified estimate: <m>0.80 \times 0.11 + 0.16 \times 0.32 + 0.04 \times 0.61 = 0.088 + 0.0512 + 0.0244 = ${ORE.p.toFixed(4)}</m>, or ${pc(ORE.p)}.`,
        String.raw`Variance terms <m>W_h^2 (1 - n_h/N_h)\,\hat{p}_h(1 - \hat{p}_h) \div (n_h - 1)</m>: Free <m>0.64 \times 0.975 \times 0.0979 \div 199 = ${(0.64 * 0.975 * 0.0979 / 199).toFixed(7)}</m>; Pro <m>0.0256 \times 0.875 \times 0.2176 \div 199 = ${(0.0256 * 0.875 * 0.2176 / 199).toFixed(7)}</m>; Enterprise <m>0.0016 \times 0.75 \times 0.2379 \div 99 = ${(0.0016 * 0.75 * 0.2379 / 99).toFixed(7)}</m>.`,
        String.raw`Standard error: <m>\sqrt{${(0.64 * 0.975 * 0.0979 / 199 + 0.0256 * 0.875 * 0.2176 / 199 + 0.0016 * 0.75 * 0.2379 / 99).toFixed(7)}} = ${ORE.se.toFixed(4)}</m>, ${(ORE.se * 100).toFixed(2)} points; margin <m>1.96 \times ${ORE.se.toFixed(4)} = ${ORE.margin.toFixed(4)}</m>, so ${pc(ORE.low)} to ${pc(ORE.high)}.`,
        String.raw`Pooled share: <m>(22 + 64 + 61) \div 500 = ${ORPOOL.toFixed(3)}</m>, ${pc(ORPOOL)}. It is far too high because Enterprise customers, the keenest, make up 20% of the sample but 4% of the customers.`,
        String.raw`The price of the design: a simple random sample of 500 would have had a standard error of about <m>\sqrt{${ORE.p.toFixed(4)} \times ${(1 - ORE.p).toFixed(4)} \div 500} = ${ORSRS.toFixed(4)}</m> for the overall share, a little smaller, but would have contained only about 20 Enterprise customers. The 100 here give Enterprise its own estimate, 61% ± ${(OR_ENT * 100).toFixed(1)} points.`,
      ],
      answer: `About ${pc(ORE.p)} of all customers would pay (95% interval ${pc(ORE.low)} to ${pc(ORE.high)}), not the pooled ${pc(ORPOOL)}.`,
      interpretation: `Disproportionate allocation bought a usable reading of the smallest, most valuable plan at a modest cost in overall precision. Had the overall share been the only goal, Neyman allocation with these shares as planning values would have given ${ORNEY.join(', ')} (against proportional ${ORPROP.join(', ')}): a little more for the more variable plans, nowhere near 100 Enterprise customers. The one thing a disproportionate design forbids is pooling the replies: every overall figure must weight the strata by their size in the population.` },

    { level: 'applied', title: 'What can Lantern’s February design read?', fictional: true,
      setup: `Ana invited ${fmt(INV)} people in proportion to the four strata. Before fieldwork, check what the design can and can’t deliver if ${RR * 100}% reply, and decide whether to change it.`,
      steps: [
        `Allocation: ${STRATA.map((nm, h) => `${nm.toLowerCase()} ${fmt(A[h])}`).join(', ')}, each ${pc(INV / N)} of its stratum.`,
        String.raw`Expected completes at ${RR * 100}%: ${EXP.map((e) => e.toFixed(1)).join(', ')}, about ${fmt(Math.round(EXP.reduce((a, b) => a + b, 0)))} in all, which delivers the planned ±4 points overall.`,
        String.raw`Margins for each stratum read alone (p = 0.5, with the finite population correction): ${EXP.map((e, h) => `±${(moeF(e, SIZES[h]) * 100).toFixed(1)}`).join(', ')} points. The newsletter-only group is read precisely; subscribers and shop customers roughly; workshop participants hardly at all.`,
        String.raw`Ask what each group is for. Subscribers and shop customers are the customers whose view of Lantern Ana most wants, and the likeliest early Cold Brew buyers; workshop participants are a small group she has no decision about. Reading workshop participants to ±10 points would need about ${Math.ceil(nF(n0_10, SIZES[2]))} completes from 150, which at ${RR * 100}% response would take more invitations than there are people. Even inviting all 150 would give about ${SIZES[2] * RR} completes and a margin of about ±${(wsAll * 100).toFixed(0)} points.`,
        'Decide. Ana keeps the proportional design, which is self-weighting and simple, and reports the workshop group only as part of the whole. Had customers’ views been the priority, she could have invited every subscriber and more shop customers, and weighted the results back to the list.',
      ],
      answer: `The design reads the whole list to about ±4 points and the newsletter-only group well, subscribers and shop customers to about ±${(moeF(EXP[0], SIZES[0]) * 100).toFixed(0)} and ±${(moeF(EXP[1], SIZES[1]) * 100).toFixed(0)} points, and workshop participants not at all.`,
      interpretation: 'Sample sizes are decided group by group, for the estimates that matter. And every margin here assumes the 30% response is the same in every group and that those who reply resemble those who don’t; the next lesson shows what happened when it wasn’t.' },
  ],

  demo: [
    { widget: 'sm-sampler', intro: `Lantern’s list as a teaching device: imagine every one of the ${fmt(N)} people answered Q1, so the true share of promoters is known (${pc(TRUTH)}). Leave non-response and weighting off for now. Draw 1,000 samples of 300 with each design and compare the spread: about ${(SE_SRS300 * 100).toFixed(1)} points for simple random and stratified samples, nearly ${(SE_CL300 * 100).toFixed(0)} for samples of three sign-up batches of 100, whose members resemble each other. Then try the open link, which gathers its 300 from whoever chooses to answer: its estimates centre about ${((OPTIN - TRUTH) * 100).toFixed(0)} points too high, and a bigger sample doesn’t help.` },
    { widget: 'sm-alloc', intro: 'Lantern’s allocation as a worksheet. Change the invitations in B8 or the expected response rate in B9 and watch each stratum’s expected completes and margin; try inviting every workshop participant by typing 150 in D4.' },
  ],

  mistakes: [
    { title: '“We sampled at random, so the results describe our market.”', html: 'A random sample describes the frame it was drawn from. Lantern’s list reaches people who already know Lantern, so its Cold Brew answers describe Lantern’s contacts, not Harbour City’s coffee buyers. Define the target population first, then check what the frame misses and what it adds.' },
    { title: '“A quota sample is a stratified sample.”', html: 'Both fix numbers per group, but a quota sample lets interviewers choose whom to approach within each quota, so selection chances are unknown. A stratified sample draws at random from a list within each stratum. Only the second supports a standard error.' },
    { title: '“Pool the replies from a disproportionate sample.”', html: 'When strata are sampled at different rates, the pooled share over-represents the oversampled strata (Orrinsby’s 29.4% against 16.4%). Combine stratum estimates with population weights, W_h = N_h ÷ N.' },
    { title: '“A cluster sample of 1,000 is as good as a random sample of 1,000.”', html: 'Members of a cluster resemble each other, so each adds less new information. With 25 per cluster and an intraclass correlation of 0.04 the design effect is about 2: the 1,000 are worth about 500 independent units.' },
    { title: '“The sample size for the whole survey covers the subgroups too.”', html: 'A margin of ±4 points overall becomes ±13 for a group with 50 completes and ±24 for one with 15. Work out the size for each group you must read separately, and oversample it if needed.' },
    { title: '“With 5,000 opt-in panel replies the margin of error is ±1.4 points.”', html: 'The formula assumes known selection chances. For an opt-in panel they are unknown, and a bias from who volunteered doesn’t shrink with size. AAPOR warns that treating such samples as simple random samples invalidates the standard errors.' },
  ],

  application: [
    { p: 'Agencies choose designs by working backwards from the estimates a client needs and the money available. A retailer that needs results for each of six regions, with a margin of ±5 points in each, needs about 385 completes per region, about 2,300 in all, whatever the regions’ sizes; a client who only needs the national figure can make do with 385, spread in proportion. The frame comes next: a customer database for customers, an address-based list for households, a panel when no list exists and the budget is small.' },
    { p: 'When no frame exists, multistage designs build one stage by stage. A survey of shoppers in a chain’s 120 stores might select 20 stores at random, with chances in proportion to their footfall, then interview shoppers at random times within each, recording how many passed so that each interview can be weighted. The result is less precise than a simple random sample of the same number of shoppers, but it is affordable and still a probability design.' },
    { case: 'For Lantern’s next survey Ana wrote three rules into her research brief. Say whom each question is about before choosing the frame, and screen out anyone outside that population. Size the sample for every group a decision depends on, not just for the total. And never quote a margin of error for anything but the probability sample: the comments people leave on Lantern’s social media pages, however many, are a self-selected sample to be read for ideas, not counted.' },
    { p: 'A sampling plan is finished only when it states the target population, the frame and its gaps, the design and allocation, the completes needed for each group, the expected response and the invitations that follow from it. Everything after that, as the next lesson shows, depends on who actually replies.' },
  ],

  summary: [
    'Define the target population from the question. The frame’s undercoverage (people it misses) and overcoverage (units outside the target) are fixed before sampling, and no margin of error shows them.',
    'A probability sample gives every unit a known, non-zero chance of selection; that is what makes a standard error meaningful. Non-probability samples (convenience, judgement, quota, snowball, opt-in panels, river) don’t, and their inference rests on modelling assumptions.',
    'Simple random and systematic samples need a list; stratified samples need each unit’s stratum and usually gain precision; cluster and multistage samples cut cost and lose precision: deff ≈ 1 + (b − 1)ρ, n_eff = n ÷ deff.',
    'Proportional allocation n_h = n N_h ÷ N is self-weighting; round so the parts add up. Disproportionate allocation reads small groups but requires weighting; Neyman allocation n_h ∝ N_h S_h minimises the overall standard error.',
    'Stratified estimate: p̂_st = Σ W_h p̂_h; SE = √(Σ W_h²(1 − n_h ÷ N_h) p̂_h(1 − p̂_h) ÷ (n_h − 1)). Never pool a disproportionate sample.',
    'Plan sample sizes for every group you must read, apply the finite population correction for small groups, and divide by the expected response rate for invitations.',
  ],

  glossary: [
    { term: 'Target population', def: 'The whole group a survey’s conclusions are meant to describe, defined by the research question, such as all of a business’s customers or all ready-to-drink coffee buyers in a city.' },
    { term: 'Sampling unit', def: 'The thing a sampling frame lists and a design selects, such as a person, a household, a store or a cluster of people.' },
    { term: 'Undercoverage', def: 'Members of the target population who are missing from the sampling frame and so can never be selected.' },
    { term: 'Overcoverage', def: 'Units on the sampling frame that are outside the target population, such as people who have never bought on a list used to survey customers; unless screened out, their answers are mixed in.' },
    { term: 'Probability sample', def: 'A sample drawn by a random mechanism so that every unit on the frame has a known chance of selection greater than zero, which is what makes standard errors and margins of error meaningful.' },
    { term: 'Non-probability sample', def: 'A sample in which the chance that each unit is selected is unknown, because units are chosen by judgement, convenience, quotas, referral or their own decision to take part.' },
    { term: 'Multistage sample', def: 'A probability sample drawn in stages, such as towns, then stores within the chosen towns, then shoppers within the chosen stores, so that a full list is needed only at each stage.' },
    { term: 'Design effect', def: 'The variance of an estimate under a survey’s design divided by its variance under a simple random sample of the same size. Above 1 the design is less precise than simple random sampling; below 1, more.' },
    { term: 'Effective sample size', def: 'The size of a simple random sample that would give the same precision as a survey’s actual sample: the sample size divided by the design effect.' },
    { term: 'Intraclass correlation', def: 'A measure, from 0 to 1, of how alike units in the same cluster are compared with units in different clusters; it drives the design effect of a cluster sample.' },
    { term: 'Proportional allocation', def: 'Dividing a stratified sample among strata in proportion to their sizes, n_h = n × N_h ÷ N, so that every unit has the same chance of selection.' },
    { term: 'Disproportionate allocation', def: 'Sampling some strata at higher rates than others, usually to read small groups separately; estimates for the whole population must then weight the strata by their sizes.' },
    { term: 'Neyman allocation', def: 'The allocation of a stratified sample that minimises the standard error of the overall estimate for a fixed total: n_h in proportion to N_h × S_h, the stratum’s size times its standard deviation.' },
    { term: 'Stratified estimate', def: 'An estimate for the whole population built from stratum results weighted by each stratum’s share of the population, such as p̂ = Σ (N_h ÷ N) × p̂_h for a proportion.' },
    { term: 'Judgement sample', def: 'A non-probability sample of units the researcher picks as typical or informative. Also called a purposive sample.' },
    { term: 'Quota sample', def: 'A non-probability sample in which interviewers fill set numbers of respondents in groups defined by easily observed traits, such as age and sex, choosing whom to approach within each group.' },
    { term: 'Snowball sample', def: 'A non-probability sample in which participants recruit further participants from among their contacts, used for groups that have no list.' },
    { term: 'Opt-in panel', def: 'A pool of volunteers who have signed up to take surveys, usually for rewards; samples drawn from it are self-selected, not probability samples.' },
    { term: 'River sample', def: 'A web-based opt-in sample recruited through invitations placed on websites, such as pop-ups, banners and links, for a single survey or a panel.' },
  ],

  references: [
    { text: 'Albrecht, M. G., Green, M. &amp; Hoffman, L. (2023). <i>Principles of Marketing</i>, section 6.3 “Steps in a Successful Marketing Research Plan” (sample frames, probability and non-probability samples). OpenStax.', url: 'https://openstax.org/books/principles-marketing/pages/6-3-steps-in-a-successful-marketing-research-plan', checked: '2026-10-24' },
    { text: 'Baker, R., Brick, J. M., Bates, N. A., Battaglia, M., Couper, M. P., Dever, J. A., Gile, K. J. &amp; Tourangeau, R. (2013). <i>Report of the AAPOR Task Force on Non-Probability Sampling</i>. American Association for Public Opinion Research.', url: 'https://www.aapor.org/wp-content/uploads/2022/11/NPS_TF_Report_Final_7_revised_FNL_6_22_13.pdf', checked: '2026-10-24' },
    { text: 'Stat Trek. “Sample Size: Stratified Random Samples” (the stratified estimate, its standard error, proportional and Neyman allocation, with a worked example).', url: 'https://stattrek.com/sample-size/stratified-sample', checked: '2026-10-24' },
    { text: 'Zipf, G. &amp; Valliant, R. (2025). “Design Effects and Effective Sample Size”. Vignette for the R package PracTools, CRAN.', url: 'https://cran.r-project.org/web/packages/PracTools/vignettes/Design-effects.html', checked: '2026-10-24' },
  ],

  checks: (() => {
    const strat300 = (() => { const alloc = S.proportionalAllocation(SIZES, 300); let v = 0; SIZES.forEach((Nh, h) => { const ix = PEOPLE.stratum.map((_, i) => i).filter((i) => PEOPLE.stratum[i] === h); const ph = ix.reduce((a, i) => a + PROM[i], 0) / Nh; v += (Nh / N) ** 2 * (1 - alloc[h] / Nh) * (Nh / (Nh - 1)) * ph * (1 - ph) / alloc[h]; }); return Math.sqrt(v); })();
    return [
      // case
      { what: 'List size', value: N, shown: 6000 },
      { what: 'Subscribers', value: SIZES[0], shown: 520 },
      { what: 'Other shop customers', value: SIZES[1], shown: 1000 },
      { what: 'Workshop participants', value: SIZES[2], shown: 150 },
      { what: 'Newsletter only', value: SIZES[3], shown: 4330 },
      { what: 'Customers on the list', value: CUSTOMERS, shown: 1670 },
      { what: 'Invitations', value: INV, shown: 2004 },
      ...[174, 334, 50, 1446].map((v, h) => ({ what: `Allocation stratum ${h} (case.js)`, value: A[h], shown: v })),
      { what: 'Allocation sums to invitations', value: A.reduce((a, b) => a + b, 0), shown: INV },
      { what: 'Share invited (%)', value: INV / N * 100, shown: 33.4, tol: 0.05 },
      { what: 'B04 completes for ±4', value: nPlan, shown: 601 },
      { what: 'B04 margin (points)', value: SURVEY_PLAN.margin * 100, shown: 4 },
      { what: 'B04 response rate (%)', value: RR * 100, shown: 30 },
      { what: '601 ÷ 0.3', value: nPlan / RR, shown: 2003.3, tol: 0.05 },
      { what: 'Invitations = ceiling', value: Math.ceil(nPlan / RR - 1e-9), shown: 2004 },
      { what: 'Raw subscribers', value: RAW[0], shown: 173.68 },
      { what: 'Raw shop', value: RAW[1], shown: 334.00 },
      { what: 'Raw workshop', value: RAW[2], shown: 50.10 },
      { what: 'Raw newsletter', value: RAW[3], shown: 1446.22 },
      { what: 'Floors sum', value: RAW.map(Math.floor).reduce((a, b) => a + b, 0), shown: 2003 },
      { what: 'Subscribers remainder .68', value: RAW[0] - Math.floor(RAW[0]), shown: 0.68, tol: 0.005 },
      { what: 'Systematic: every 3rd of 6,000', value: N / 3, shown: 2000 },
      { what: 'Expected completes subscribers', value: EXP[0], shown: 52.2, tol: 0.05 },
      { what: 'Expected completes shop', value: EXP[1], shown: 100.2, tol: 0.05 },
      { what: 'Expected completes workshop', value: EXP[2], shown: 15 },
      { what: 'Expected completes newsletter', value: EXP[3], shown: 433.8, tol: 0.05 },
      { what: 'Expected completes total', value: EXP.reduce((a, b) => a + b, 0), shown: 601, tol: 0.5 },
      { what: 'Margin subscribers (fpc)', value: moeF(EXP[0], SIZES[0]) * 100, shown: 12.9, tol: 0.05 },
      { what: 'Margin shop (fpc)', value: moeF(EXP[1], SIZES[1]) * 100, shown: 9.3, tol: 0.05 },
      { what: 'Margin workshop (fpc)', value: moeF(EXP[2], SIZES[2]) * 100, shown: 24.1, tol: 0.05 },
      { what: 'Margin newsletter (fpc)', value: moeF(EXP[3], SIZES[3]) * 100, shown: 4.5, tol: 0.05 },
      { what: 'Workshop margin about ±24', value: moeF(EXP[2], SIZES[2]) * 100, shown: 24, tol: 0.5 },
      { what: 'Subscribers margin about ±13', value: moeF(EXP[0], SIZES[0]) * 100, shown: 13, tol: 0.5 },
      { what: 'Shop margin about ±9', value: moeF(EXP[1], SIZES[1]) * 100, shown: 9, tol: 0.5 },
      { what: 'n0 for ±10', value: Math.ceil(n0_10), shown: 97 },
      { what: 'Workshop completes for ±10 with fpc', value: Math.ceil(nF(n0_10, SIZES[2])), shown: 59 },
      { what: '59 ÷ 0.3 exceeds 150', value: Number(Math.ceil(nF(n0_10, SIZES[2])) / RR > SIZES[2]), shown: 1 },
      { what: 'All 150 invited: completes at 30%', value: SIZES[2] * RR, shown: 45 },
      { what: 'All 150 invited: margin about ±12', value: wsAll * 100, shown: 12, tol: 0.5 },
      // mistakes and application
      { what: '±13 for a group of 50 completes', value: Z * Math.sqrt(0.25 / 50) * 100, shown: 13.9, tol: 1 },
      { what: '±24 for 15 completes (fpc, workshop)', value: moeF(15, 150) * 100, shown: 24, tol: 0.5 },
      { what: 'Opt-in 5,000 SRS margin (the wrong claim)', value: Z * Math.sqrt(0.25 / 5000) * 100, shown: 1.4, tol: 0.05 },
      { what: '±5 per region: completes', value: I.sampleSizeProp(0.05), shown: 385 },
      { what: 'Six regions ≈ 2,300', value: 6 * I.sampleSizeProp(0.05), shown: 2300, tol: 15 },
      { what: '2,000 invitations at k = 3', value: 6000 / 3, shown: 2000 },
      // design effect
      { what: 'Marrowby deff', value: MBdeff, shown: 1.96, tol: 0.005 },
      { what: 'Marrowby passengers', value: MBn, shown: 1000 },
      { what: 'Marrowby effective n', value: MBn / MBdeff, shown: 510, tol: 0.5 },
      { what: 'Mistake: deff about 2, worth about 500', value: MBn / MBdeff, shown: 500, tol: 15 },
      // Brindlecombe
      { what: 'Brindlecombe N total', value: BR.N.reduce((a, b) => a + b, 0), shown: 8000 },
      { what: 'Green share', value: 5230 / 8000, shown: 0.65375, tol: 1e-9 },
      { what: 'Silver share', value: 2270 / 8000, shown: 0.28375, tol: 1e-9 },
      { what: 'Gold share', value: 500 / 8000, shown: 0.0625, tol: 1e-9 },
      { what: 'ROUND total', value: BR.N.map((k) => Math.round(400 * k / 8000)).reduce((a, b) => a + b, 0), shown: 401 },
      { what: 'Floors total', value: BR_RAW.map(Math.floor).reduce((a, b) => a + b, 0), shown: 399 },
      ...[262, 113, 25].map((v, h) => ({ what: `Brindlecombe allocation ${h}`, value: BR_ALLOC[h], shown: v })),
      { what: 'Brindlecombe chance 5%', value: 400 / 8000 * 100, shown: 5 },
      // Orrinsby
      { what: 'Orrinsby stratified p', value: ORE.p, shown: 0.1636, tol: 0.00005 },
      { what: 'Orrinsby stratified %', value: ORE.p * 100, shown: 16.4, tol: 0.05 },
      { what: 'Orrinsby SE points', value: ORE.se * 100, shown: 1.83, tol: 0.005 },
      { what: 'Orrinsby SE', value: ORE.se, shown: 0.0183, tol: 0.00005 },
      { what: 'Orrinsby margin', value: ORE.margin, shown: 0.0358, tol: 0.00005 },
      { what: 'Orrinsby low %', value: ORE.low * 100, shown: 12.8, tol: 0.05 },
      { what: 'Orrinsby high %', value: ORE.high * 100, shown: 19.9, tol: 0.05 },
      { what: 'Orrinsby pooled', value: ORPOOL, shown: 0.294, tol: 0.0005 },
      { what: 'Orrinsby pooled %', value: ORPOOL * 100, shown: 29.4, tol: 0.05 },
      { what: 'Orrinsby Free W²', value: 0.8 ** 2, shown: 0.64, tol: 1e-9 },
      { what: 'Orrinsby Free fpc', value: 1 - 200 / 8000, shown: 0.975, tol: 1e-9 },
      { what: 'Orrinsby Free pq', value: 0.11 * 0.89, shown: 0.0979, tol: 1e-9 },
      { what: 'Orrinsby Pro fpc', value: 1 - 200 / 1600, shown: 0.875, tol: 1e-9 },
      { what: 'Orrinsby Pro pq', value: 0.32 * 0.68, shown: 0.2176, tol: 1e-9 },
      { what: 'Orrinsby Ent pq', value: 0.61 * 0.39, shown: 0.2379, tol: 1e-9 },
      { what: 'Orrinsby Ent W²', value: 0.04 ** 2, shown: 0.0016, tol: 1e-12 },
      { what: 'Orrinsby Pro W²', value: 0.16 ** 2, shown: 0.0256, tol: 1e-12 },
      { what: 'Orrinsby Ent fpc', value: 1 - 100 / 400, shown: 0.75, tol: 1e-9 },
      { what: 'Orrinsby Ent share of sample (%)', value: 100 / 500 * 100, shown: 20 },
      { what: 'Orrinsby Ent share of customers (%)', value: 400 / 10000 * 100, shown: 4 },
      { what: 'Enterprise reply stands for a quarter as many as a Free reply', value: (400 / 100) / (8000 / 200), shown: 0.1, tol: 1e-9 },
      { what: 'Orrinsby SRS SE', value: ORSRS, shown: 0.0165, tol: 0.00005 },
      { what: 'SRS of 500: about 20 Enterprise', value: 500 * 400 / 10000, shown: 20 },
      { what: 'Enterprise margin points', value: OR_ENT * 100, shown: 8.3, tol: 0.05 },
      ...[364, 108, 28].map((v, h) => ({ what: `Neyman Orrinsby ${h}`, value: ORNEY[h], shown: v })),
      ...[400, 80, 20].map((v, h) => ({ what: `Proportional Orrinsby ${h}`, value: ORPROP[h], shown: v })),
      // sampler demonstration (the list's known answers)
      { what: 'True promoter share (%)', value: TRUTH * 100, shown: 34.5, tol: 0.06 },
      { what: 'SRS 300 SE (points)', value: SE_SRS300 * 100, shown: 2.7, tol: 0.05 },
      { what: 'Stratified 300 SE about the same (points)', value: strat300 * 100, shown: 2.6, tol: 0.05 },
      { what: 'Cluster: 3 batches SE nearly 5 points', value: SE_CL300 * 100, shown: 5, tol: 0.5 },
      { what: 'Opt-in bias about 22 points', value: (OPTIN - TRUTH) * 100, shown: 22, tol: 0.5 },
      { what: 'Batches of 100', value: N / BSH.length, shown: 100 },
    ];
  })(),
};
