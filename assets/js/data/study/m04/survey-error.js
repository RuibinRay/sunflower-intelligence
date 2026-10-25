// survey-error.js — M04 · Survey error. Content only; exercises are in survey-error.ex.js.
// Lantern's February 2027 outcomes (DISPOSITIONS, RESPONDENTS, DERIVED.survey, DERIVED.nps, DERIVED.weights,
// DERIVED.coldbrew) come from case.js. The list's known answers (PEOPLE) appear only in the "What Ana couldn't see"
// callout, the sampler demonstrations and their checks, never as something Ana knows. Saltreed Festival and Tamberlake
// Gyms are fictional. Calculating and testing the NPS, top boxes and cross-tabs is module 4's; this lesson is about the
// errors around them.
import { SIZES, STRATA, SURVEY_2027, SURVEY_PLAN, DISPOSITIONS, DERIVED, PEOPLE } from './case.js?v=13';
import * as S from '../../../core/survey.js?v=13';
import * as I from '../../../core/inference.js?v=13';

const D = DERIVED, DS = DISPOSITIONS, ALL = DS.all;
const N = SIZES.reduce((a, b) => a + b, 0), INV = SURVEY_2027.invited;
const RR = D.survey.rr, RRS = D.survey.rrByStratum, NC = D.survey.completesByStratum, n = D.survey.completes;
const nPlan = I.sampleSizeProp(SURVEY_PLAN.margin, SURVEY_PLAN.conf);
const W = D.weights.perStratum, K = D.weights.kish;
const NPSU = D.nps.unweighted, NPSW = D.nps.weighted, NPSS = D.nps.byStratum;
const SEST = D.nps.stratified;                                   // stratified (= weighted) promoter share and its SE
const seKish = Math.sqrt(NPSW.pP * (1 - NPSW.pP) / K.nEff);
const seNoF = Math.sqrt(SEST.strata.reduce((a, h) => a + h.W ** 2 * h.p * (1 - h.p) / (h.n - 1), 0));   // the same SE without the FPC
const CB = D.coldbrew;

// What Ana couldn't see: the invited sample's known answers
const idx = (f) => PEOPLE.status.map((s, i) => i).filter(f);
const invited = idx((i) => PEOPLE.status[i] > 0), resp = invited.filter((i) => PEOPLE.status[i] === 2), non = invited.filter((i) => PEOPLE.status[i] !== 2);
const prom = (i) => PEOPLE.group[i] === 2;
const share = (ix, f) => ix.filter(f).length / ix.length;
const pInv = share(invited, prom), pResp = share(resp, prom), pNon = share(non, prom);
const byH = STRATA.map((_, h) => ({ r: share(resp.filter((i) => PEOPLE.stratum[i] === h), prom), nr: share(non.filter((i) => PEOPLE.stratum[i] === h), prom) }));
const TRUTH_NPS = D.nps.truth, TRUTH_P = share(PEOPLE.stratum.map((_, i) => i), prom);

// Saltreed Festival (fictional): dispositions of a post-event e-mail survey
const SF = { I: 610, P: 90, R: 45, NC: 105, U: 1640, NE: 10 };
const SF_INV = SF.I + SF.P + SF.R + SF.NC + SF.U + SF.NE, SF_EL = SF_INV - SF.NE, SFR = S.responseRates(SF);
// Tamberlake Gyms (fictional): weighting by membership type
const TG = { N: [2400, 4800, 800], n: [90, 210, 150], x: [45, 147, 135], names: ['Off-peak', 'Standard', 'Premium'] };
const TGw = TG.N.map((k, i) => k / TG.n[i]);
const TGall = TG.n.flatMap((k, i) => Array(k).fill(TGw[i]));
const TGK = S.kish(TGall), TGE = S.stratifiedProportion(TG.N.map((k, i) => ({ N: k, n: TG.n[i], x: TG.x[i] })));
const TGU = TG.x.reduce((a, b) => a + b, 0) / TG.n.reduce((a, b) => a + b, 0);

const fmt = (v) => v.toLocaleString('en-US');
const tf = (v) => fmt(v).replace(/,/g, '{,}');                     // thousands separators inside TeX
const pc = (v, d = 1) => `${(v * 100).toFixed(d)}%`;
const sgn = (v, d = 1) => `${v < 0 ? '−' : '+'}${Math.abs(v).toFixed(d)}`;

// ---------------------------------------------------------------- figure: total survey error
const TSE = (() => {
  const bx = (x, y, w, t) => `<rect x="${x}" y="${y}" width="${w}" height="34" rx="7" style="fill:none;stroke:var(--series-1);stroke-width:1.8"/><text x="${x + w / 2}" y="${y + 22}" text-anchor="middle" fill="currentColor">${t}</text>`;
  const arrow = (x, y1, y2, err) => `<path d="M${x} ${y1}V${y2}" style="fill:none;stroke:var(--rule-strong);stroke-width:1.5"/><path d="M${x - 4} ${y2 - 6}L${x} ${y2}L${x + 4} ${y2 - 6}" style="fill:none;stroke:var(--rule-strong);stroke-width:1.5"/><text x="${x + 12}" y="${(y1 + y2) / 2 + 4}" font-size="12" font-style="italic" fill="var(--series-2)">${err}</text>`;
  let s = '<svg viewBox="0 0 680 400" xmlns="http://www.w3.org/2000/svg" font-family="inherit" font-size="13">';
  s += '<text x="170" y="18" text-anchor="middle" font-weight="700" fill="currentColor">Measurement</text><text x="170" y="34" text-anchor="middle" font-size="12" fill="var(--ink-3)">is each answer right?</text>';
  s += '<text x="510" y="18" text-anchor="middle" font-weight="700" fill="currentColor">Representation</text><text x="510" y="34" text-anchor="middle" font-size="12" fill="var(--ink-3)">are these the right people?</text>';
  const L = [['Construct: what we want to know', 46], ['Question as asked', 116], ['Answer given', 186], ['Answer as recorded and coded', 256]];
  L.forEach(([t, y]) => { s += bx(50, y, 240, t); });
  s += arrow(170, 80, 116, 'validity') + arrow(170, 150, 186, 'measurement error') + arrow(170, 220, 256, 'processing error');
  const R = [['Target population', 46], ['Sampling frame', 102], ['Sample', 158], ['Respondents', 214], ['Weighted respondents', 270]];
  R.forEach(([t, y]) => { s += bx(400, y, 220, t); });
  s += arrow(510, 80, 102, 'coverage error') + arrow(510, 136, 158, 'sampling error') + arrow(510, 192, 214, 'non-response error') + arrow(510, 248, 270, 'adjustment error');
  s += '<rect x="250" y="350" width="180" height="36" rx="8" style="fill:none;stroke:var(--series-3);stroke-width:2.2"/><text x="340" y="373" text-anchor="middle" font-weight="700" fill="currentColor">Survey estimate</text>';
  s += '<path d="M170 290V330H300V350M510 304V330H380V350" style="fill:none;stroke:var(--rule-strong);stroke-width:1.5"/>';
  return `${s}</svg>`;
})();

export default {
  slug: 'survey-error',
  title: 'Survey error',
  blurb: 'A margin of error measures one kind of error. Learn the others (coverage, non-response, measurement, processing) as one system, calculate response rates by AAPOR’s definitions, see why a response rate is not a measure of bias, weight responses back to the population and count what weighting costs, and read stated intentions for what they are.',
  status: 'reviewed',
  objectives: [
    'Distinguish the components of total survey error (coverage, sampling, non-response, adjustment, measurement and processing) and identify the step at which each enters a survey.',
    'Classify survey cases by AAPOR’s final dispositions and calculate the response rates RR1 and RR2.',
    'Calculate non-response bias from the response rate and the difference between respondents and non-respondents, and explain why a response rate alone doesn’t measure bias.',
    'Calculate post-stratification weights, a weighted estimate, the Kish effective sample size and the design effect of unequal weights, and explain what weighting can’t fix.',
    'Evaluate stated purchase intentions against behaviour, and identify measurement and processing errors from wording, mode, memory and data handling.',
  ],
  prerequisites: [
    { lesson: 'b01/data-collection', why: 'The four biases (sampling, non-response, survivorship, measurement), the response rate and the bounds non-response allows are built on here.' },
    { lesson: 'm04/sampling-methods', why: 'Frames, coverage, the stratified estimate and the design effect are used throughout.' },
    { lesson: 'm04/questionnaire-design', why: 'Wording, response styles, order and mode are the sources of measurement error.' },
  ],
  case: 'lantern',

  concept: [
    { case: `Ana’s survey closed on ${SURVEY_2027.closed}. Of the ${fmt(INV)} people invited, ${n} completed the questionnaire: ${pc(RR.RR1)}, not the ${SURVEY_PLAN.responseRate * 100}% she had planned for, so the margin of error for a share near 50% is ±${(D.survey.marginAchieved * 100).toFixed(1)} points rather than ±${(D.survey.marginPlanned * 100).toFixed(0)}. Response was far from even: about half the subscribers replied, against a fifth of the newsletter-only group. The ${n} completes give a Net Promoter Score of ${sgn(NPSU.score)}. Ana’s question is the one this lesson answers: how far can she trust it?` },

    { h: 'Total survey error' },
    { p: '<g>Total survey error</g> is the idea that a survey estimate can be wrong for many reasons, and that they should be designed against and judged together rather than one at a time. Groves and Lyberg (2010), reviewing its history, trace it back to Deming, who in 1944 listed thirteen factors affecting survey results, from non-response, sampling and interviewer effects to processing errors and timeliness, and note that the term is not tightly defined: different authors include different components. A widely used version, from Groves and colleagues’ textbook <i>Survey Methodology</i> (2004), follows the two paths an estimate travels.' },
    { figure: {
      svg: TSE,
      caption: 'Total survey error: an estimate is only as good as both paths. On the representation side the question is who answered; on the measurement side, what their answers mean. The margin of error covers sampling error alone.',
      alt: 'Two columns of boxes joined by downward arrows, each arrow labelled with the error that can enter at that step. Left column, headed “Measurement: is each answer right?”: “Construct: what we want to know”, arrow labelled validity, “Question as asked”, arrow labelled measurement error, “Answer given”, arrow labelled processing error, “Answer as recorded and coded”. Right column, headed “Representation: are these the right people?”: “Target population”, arrow labelled coverage error, “Sampling frame”, arrow labelled sampling error, “Sample”, arrow labelled non-response error, “Respondents”, arrow labelled adjustment error, “Weighted respondents”. Lines from the bottom of both columns meet in a box labelled “Survey estimate”.',
    } },
    { p: 'On the representation side, <g>coverage error</g> arises from the gap between the target population and the frame (undercoverage and overcoverage, from Sampling methods); <g>sampling error</g> from studying a sample rather than everyone; non-response error from the difference between those sampled and those who answer; and adjustment error from weighting that corrects the wrong things. On the measurement side, a question may not capture the construct at all (validity), answers may depart from the truth (<g>measurement error</g>), and recording, coding and editing may introduce mistakes (<g>processing error</g>).' },
    { p: 'B01’s four biases fit inside this map. <g>Sampling bias</g> and <g>survivorship bias</g> are coverage and selection problems on the representation side; <g>non-response bias</g> is the systematic part of non-response error; <g>measurement bias</g> is the systematic part of measurement error. What the map adds is that the errors compound, and that fixing one (a bigger sample) does nothing for another (a biased frame).' },
    { p: String.raw`Each error has a systematic part, bias, and a random part, variance. Groves and Lyberg recall that Hansen and colleagues wrote the total as the <g>mean squared error</g>: <m>\text{MSE} = \text{bias}^2 + \text{variance}</m>, plus terms for how errors interact. They also note that most surveys routinely measure only one component, the sampling variance. That is the margin of error, and it is why a margin of ±4.3 points says nothing about whether the estimate is 10 points too high.` },

    { h: 'Response rates by the book' },
    { p: 'The American Association for Public Opinion Research (AAPOR) publishes <i>Standard Definitions</i>, now in its tenth edition (2023), so that response rates mean the same thing from one survey to the next. Every case drawn into the sample is given a <g>final disposition</g> in one of four groups: interviews (complete, or partial); eligible cases that weren’t interviewed (refusals and break-offs, non-contacts and others); cases of unknown eligibility; and cases that turn out not to be eligible, which are left out of the rates altogether.' },
    { p: 'Researchers must define in advance what counts as complete and partial. AAPOR gives examples rather than one rule: in one, more than 80% of the questions answered is a complete and 50% to 80% a partial. Ana set her rule before fieldwork (fictional): all five closed questions (Q1 to Q5) answered is a complete, whether or not the open Q6 was filled in; three or four, a partial; fewer than three, a <g>break-off</g>, counted with refusals.' },
    { table: {
      caption: 'Lantern’s February 2027 survey: final dispositions by stratum',
      head: ['Stratum', 'Invited', 'Complete (I)', 'Partial (P)', 'Refused or broke off (R)', 'Bounced (NC)', 'No reply (eligible)'],
      rows: [...STRATA.map((nm, h) => { const d = DS.byStratum[h]; return [nm, fmt(d.invited), d.I, d.P, d.R, d.NC, fmt(d.U)]; })],
      foot: [['All', fmt(ALL.invited), ALL.I, ALL.P, ALL.R, ALL.NC, fmt(ALL.U)]],
      align: ['l', 'r', 'r', 'r', 'r', 'r', 'r'],
    } },
    { p: String.raw`<g>RR1</g>, AAPOR’s strictest response rate, counts only completes: <m>\text{RR1} = I \div (I + P + R + NC + O + U)</m>, ${n} ÷ ${fmt(INV)} = ${pc(RR.RR1)}. <g>RR2</g> counts partials as responses too: <m>(${n} + ${ALL.P}) \div ${tf(INV)}</m> = ${pc(RR.RR2)}. Everyone on Lantern’s list belongs to the population it was drawn for, so no case is ineligible, and every bounced or unanswered invitation stays in the denominator.` },
    { p: String.raw`AAPOR’s RR3 and RR4 allow an estimated share of the unknown-eligibility cases to be removed from the denominator, which matters for samples such as random phone numbers, where many may not belong to anyone eligible. Always say which rate you report. By stratum, RR1 was ${RRS.map((r) => pc(r.RR1)).join(', ').replace(/, ([^,]*)$/, ' and $1')} for subscribers, shop customers, workshop participants and newsletter-only readers, and RR2 ${RRS.map((r) => pc(r.RR2)).join(', ').replace(/, ([^,]*)$/, ' and $1')}.` },
    { p: `Fewer completes than planned means a wider margin: with ${n} instead of ${nPlan}, ±${(D.survey.marginAchieved * 100).toFixed(2)} points instead of ±${(D.survey.marginPlanned * 100).toFixed(2)}. That loss is visible and modest. The serious question is about the ${fmt(INV - n)} people who didn’t complete.` },

    { h: 'Why a response rate is not a measure of bias' },
    { p: String.raw`B01 combined respondents and non-respondents as a weighted average. Rearranged, the same identity gives the bias of the respondents’ figure: <m>\bar{y}_r - \bar{y} = (1 - \text{RR})(\bar{y}_r - \bar{y}_{nr})</m>, the share who didn’t respond times the difference between respondents and non-respondents. Bias needs both: a low response rate with no difference does no harm, and a high one with a large difference still misleads.` },
    { p: 'This is why AAPOR states that response rate information alone is insufficient for determining how much non-response error exists. The U.S. National Research Council’s 2013 review of non-response cites Groves and Peytcheva’s compilation of 59 studies, which found very little correlation between non-response rates and their measures of bias, and concludes that a falling response rate means only that the potential for bias has increased. Bias belongs to each estimate, not to the survey: the same non-respondents can distort one question badly and another hardly at all.' },
    { p: `Ana can’t see her non-respondents’ answers, but she can see who they are. Subscribers were ${pc(SIZES[0] / N)} of the list and ${pc(NC[0] / n)} of the completes; newsletter-only readers were ${pc(SIZES[3] / N)} of the list and ${pc(NC[3] / n)} of the completes. The segments also answered very differently: Net Promoter Scores of ${NPSS.map((x) => sgn(x.score, 0)).join(', ')} for subscribers, shop customers, workshop participants and newsletter-only readers. A respondent pool tilted towards subscribers will flatter Lantern, and that tilt is the one thing she can correct.` },
  ],

  theory: [
    { h: 'Weighting to the population' },
    { p: String.raw`<g>Post-stratification</g> gives every respondent in group h the <g>survey weight</g> <m>w_h = N_h \div n_h</m>: the number of people on the frame that each respondent stands for. Lantern’s weights are ${STRATA.map((nm, h) => `${fmt(SIZES[h])} ÷ ${NC[h]} = ${W[h].toFixed(2)}`).join('; ')}. Each newsletter-only respondent now counts about two and a half times as much as each subscriber, and the weighted respondents add back up to the ${fmt(N)} on the list.` },
    { p: String.raw`A weighted share is <m>\sum w_i y_i \div \sum w_i</m>, which, with one weight per stratum, equals the stratified estimate from Sampling methods: <m>\sum W_h \hat{p}_h</m>. Weighted, ${pc(NPSW.pP)} of Lantern’s contacts are promoters and ${pc(NPSW.pD)} detractors, so the weighted Net Promoter Score is ${sgn(NPSW.score)}, against ${sgn(NPSU.score)} unweighted. Seven points of the unweighted score came from the over-representation of the three customer segments.` },
    { table: {
      caption: 'Lantern’s post-stratification weights (respondents are February’s completes)',
      head: ['Stratum', 'On the list (N_h)', 'Respondents (n_h)', 'Weight N_h ÷ n_h', 'Share of list', 'Share of respondents'],
      rows: STRATA.map((nm, h) => [nm, fmt(SIZES[h]), NC[h], W[h].toFixed(2), pc(SIZES[h] / N), pc(NC[h] / n)]),
      foot: [['All', fmt(N), n, '', '100.0%', '100.0%']],
      align: ['l', 'r', 'r', 'r', 'r', 'r'],
    } },

    { h: 'What weighting costs' },
    { p: String.raw`Unequal weights make an estimate less precise, because a few heavily weighted respondents move it more. Kish’s rule of thumb measures the loss: the <g>effective sample size</g> is <m>(\sum w_i)^2 \div \sum w_i^2</m>, and the <g>design effect</g> of the weights is <m>n \div n_{\text{eff}} = 1 + \text{CV}^2(w)</m>, one plus the squared coefficient of variation of the weights. For Lantern’s ${n} completes, <m>n_{\text{eff}} = ${K.nEff.toFixed(1)}</m> and the design effect ${K.deff.toFixed(3)}: the weighting costs about ${Math.round(n - K.nEff)} completes’ worth of precision.` },
    { p: `Zipf and Valliant’s guide to design effects warns that Kish’s formula rests on restrictive assumptions (equal variances in every stratum) and can mislead when strata differ, or when response rates differ across groups. Both hold here. Computed directly with the stratified standard error from Sampling methods, the weighted share of promoters has a standard error of ${(seNoF * 100).toFixed(2)} points before the finite population correction (${(SEST.se * 100).toFixed(2)} with it), against ${(seKish * 100).toFixed(2)} from Kish’s effective sample size: because the segments differ so much in their share of promoters, stratifying wins back most of what the unequal weights cost. Use n_eff as a quick warning; use the design’s own standard error when it matters.` },

    { h: 'What weighting can’t fix' },
    { p: 'Post-stratification makes the respondents match the population on the weighting variable, and nothing else. It removes bias only to the extent that, within each weighting group, respondents answer like the non-respondents in that group: in B02’s terms, that the missing answers are <g>MAR</g> given the stratum. If, within every stratum, the people who liked Lantern were keener to reply, weighting by stratum reproduces their enthusiasm at the right scale.' },
    { callout: 'note', title: 'What Ana couldn’t see', html: `In this teaching case every person on the list has a known answer to Q1, so the truth is available, though never to Ana. Among the ${fmt(INV)} invited, ${pc(pInv)} are promoters: ${pc(pResp)} of those who completed and ${pc(pNon)} of those who didn’t. The bias formula gives (1 − ${RR.RR1.toFixed(4)}) × (${(pResp * 100).toFixed(1)} − ${(pNon * 100).toFixed(1)}) = ${((1 - RR.RR1) * (pResp - pNon) * 100).toFixed(1)} points, exactly the gap between ${pc(pResp)} and ${pc(pInv)}. Within every stratum, respondents were likelier to be promoters than non-respondents (${STRATA.map((nm, h) => `${nm.toLowerCase()} ${pc(byH[h].r, 0)} against ${pc(byH[h].nr, 0)}`).join('; ')}). So the weighted score, ${sgn(NPSW.score)}, still sits far above the list’s true Net Promoter Score of about ${sgn(TRUTH_NPS, 0)}.` },
    { p: `The same respondents distort different questions by different amounts. For Q2, weighting moves the share who would definitely or probably buy Cold Brew from ${pc(CB.topTwo)} to ${pc(CB.topTwoWeighted)}, within about a point of the list’s true ${pc(CB.truthTopTwo)}: willingness to try Cold Brew had little to do with who replied, once the strata were balanced. Recommending Lantern had a great deal to do with it. Run the two samplers below with non-response and weighting switched on and compare.` },
    { p: 'Weighting has the same limits on a larger scale. Pew Research Center weighted large online opt-in samples on demographic and political variables by several methods: average estimated bias across 24 benchmarks fell from 8.4 points unweighted to no lower than about 6 points, and in Pew’s words, “even the most effective adjustment procedures were unable to remove most of the bias.” Which variables went into the weights mattered more than the method used.' },
    { p: 'What helps is evidence about the non-respondents and better variables to weight on. Follow up a random sample of non-respondents by another mode, as B01’s hotel did, and use their answers to estimate the gap directly. Compare respondents with non-respondents on everything the frame already records: for Lantern, order history, subscription length and sign-up channel. Weight on the variables that predict both replying and the answer. And raise response where it is lowest, with reminders, a shorter questionnaire or a small incentive, while remembering that a higher rate helps only if it brings in people unlike those already responding.' },

    { h: 'Measurement error: wording, mode and memory' },
    { p: 'On the other side of the map, answers can be wrong however representative the respondents. Questionnaire design covered the main sources: wording that leads, loads or confuses; response styles such as acquiescence and social desirability; order effects; and the mode, which changes how social pressures and option orders work. Memory adds two more. People forget, and they misplace events in time, pulling them into or out of the period asked about, which is why Q3 asks about last week, not last month.' },
    { p: '<g>Item non-response</g>, a respondent skipping some questions, sits between the two sides: the person answered the survey but not the question. It is distinct from <g>unit non-response</g>, not answering at all, and is handled in the analysis (module 4) by reporting bases and coding missing answers rather than treating blanks as zeros.' },

    { h: 'Stated intentions are not purchases' },
    { p: 'Purchase-intent questions are measurement with a special problem: they ask people to predict their own future behaviour. Morwitz, Steckel and Gupta’s (2007) analysis of studies relating intentions to later purchases found intentions more strongly related to purchases for existing products than for new ones, for durable goods than for non-durables, over short horizons than long ones, and for specific brands or models than for whole categories. Sun and Morwitz (2010) describe respondents who exaggerate their demand, producing a positive intention bias that is likely in new-product surveys; in one of their data sets, 15.3% of respondents said they would buy a personal computer within a year, but only 5.7% did.' },
    { p: `Lantern’s Q2 is about a new, non-durable product, asked with a three-month horizon and a named brand: two conditions that weaken the link and two that help. The weighted ${pc(CB.topTwoWeighted)} who say they would definitely or probably buy Cold Brew is a measure of interest among Lantern’s contacts, not a forecast of buyers. Module 3’s market sizing turns intent into an estimate of purchases only with an explicit conversion assumption, and tests how much the answer depends on it.` },

    { h: 'Processing error' },
    { p: 'Errors also enter after the answers arrive. A partial is counted as a complete; a stratum code is attached to the wrong respondent when the list is merged with the survey export; a scale is keyed in reverse; weights are applied to the wrong rows; an open answer is coded by one person differently from another. Most of these are systematic: they push estimates one way rather than averaging out. The defences are routine and dull: a written data plan, checks that weighted totals reproduce the frame’s, a second coder for open answers with <g>inter-coder agreement</g> checked, and keeping the raw export untouched alongside every edited version.' },
  ],

  formulas: [
    { id: 'se-rr', name: 'AAPOR response rates RR1 and RR2',
      tex: String.raw`\text{RR1} = \dfrac{I}{(I + P) + (R + NC + O) + U} \qquad \text{RR2} = \dfrac{I + P}{(I + P) + (R + NC + O) + U}`,
      where: [[String.raw`I`, 'Complete interviews', 'cases'], [String.raw`P`, 'Partial interviews', 'cases'], [String.raw`R`, 'Refusals and break-offs', 'cases'], [String.raw`NC`, 'Non-contacts (for an e-mail survey, invitations that bounced)', 'cases'], [String.raw`O`, 'Other eligible non-interviews', 'cases'], [String.raw`U`, 'Cases of unknown eligibility. On a list where everyone is known to be eligible there are none: AAPOR (10th edition, section 1) counts unanswered invitations as eligible non-respondents, in the denominator either way', 'cases']],
      assumptions: 'Cases found to be ineligible are excluded from the denominator. The definitions of complete and partial are set before fieldwork.',
      note: 'RR3 and RR4 replace U with e × U, where e is the estimated share of unknown cases that are eligible (AAPOR, Standard Definitions, 10th edition, 2023).' },
    { id: 'se-nrbias', name: 'Non-response bias of a respondent mean or share',
      tex: String.raw`\bar{y}_r - \bar{y} = (1 - \text{RR})\,(\bar{y}_r - \bar{y}_{nr})`,
      where: [[String.raw`\bar{y}_r`, 'The mean or share among respondents', ''], [String.raw`\bar{y}_{nr}`, 'The mean or share among non-respondents', ''], [String.raw`\bar{y}`, 'The mean or share among everyone sampled', ''], [String.raw`\text{RR}`, 'The response rate', '']],
      assumptions: 'Treats each sampled person as a fixed respondent or non-respondent; it is B01’s weighted average of the two groups, rearranged.',
      note: 'ȳ_nr is unknown unless non-respondents are followed up; the formula shows why a response rate alone can’t give the bias.' },
    { id: 'se-weight', name: 'Post-stratification weights and a weighted estimate',
      tex: String.raw`w_h = \dfrac{N_h}{n_h}, \qquad \bar{y}_w = \dfrac{\sum_i w_i y_i}{\sum_i w_i} = \sum_h \dfrac{N_h}{N}\,\bar{y}_h`,
      where: [[String.raw`w_h`, 'The weight of each respondent in group h', 'people per respondent'], [String.raw`N_h`, 'The number in group h in the population (on the frame)', 'people'], [String.raw`n_h`, 'The number of respondents in group h', 'people'], [String.raw`w_i,\ y_i`, 'Respondent i’s weight and answer (1 or 0 for a share)', ''], [String.raw`\bar{y}_h`, 'The mean or share among group h’s respondents', ''], [String.raw`N`, 'The population size', 'people'], [String.raw`\bar{y}_w`, 'The weighted estimate', '']],
      assumptions: 'Population counts N_h are known. The estimate is unbiased only if respondents answer like non-respondents within each group.' },
    { id: 'se-kish', name: 'Kish effective sample size and the design effect of weighting',
      tex: String.raw`n_{\text{eff}} = \dfrac{\left(\sum_i w_i\right)^2}{\sum_i w_i^2}, \qquad \text{deff}_w = \dfrac{n}{n_{\text{eff}}} = 1 + \text{CV}^2(w)`,
      where: [[String.raw`w_i`, 'Respondent i’s weight', ''], [String.raw`n`, 'The number of respondents', 'people'], [String.raw`n_{\text{eff}}`, 'The effective sample size', 'people'], [String.raw`\text{CV}(w)`, 'The coefficient of variation of the weights (their standard deviation, dividing by n, ÷ their mean)', ''], [String.raw`\text{deff}_w`, 'The design effect of the unequal weights', '']],
      assumptions: 'A rule of thumb: it assumes equal variances across weighting groups and ignores any gain from stratification (Zipf and Valliant).',
      note: 'With one weight per stratum: n_eff = (Σ n_h w_h)² ÷ Σ n_h w_h², in Excel <x>=SUMPRODUCT(C2:C5,D2:D5)^2/SUMPRODUCT(C2:C5,D2:D5^2)</x>.' },
    { id: 'se-mse', name: 'Mean squared error',
      tex: String.raw`\text{MSE} = \text{bias}^2 + \text{variance}`,
      where: [[String.raw`\text{bias}`, 'The average amount by which the estimate misses the true value, over repetitions of the survey', 'units of the estimate'], [String.raw`\text{variance}`, 'The spread of the estimate over repetitions', 'units squared'], [String.raw`\text{MSE}`, 'The average squared distance between the estimate and the truth', 'units squared']],
      assumptions: 'The margin of error reflects the sampling part of the variance only.' },
  ],

  examples: [
    { level: 'simple', title: 'Saltreed Festival’s response rates', fictional: true,
      setup: `Saltreed Festival (fictional) e-mailed its post-event survey to ${fmt(SF_INV)} ticket buyers. Final dispositions: ${SF.I} completes, ${SF.P} partials, ${SF.R} refusals and break-offs, ${SF.NC} bounced invitations, ${fmt(SF.U)} with no reply, and ${SF.NE} addresses that turned out to belong to the festival’s own staff, who are not in the population. Calculate RR1 and RR2.`,
      steps: [
        `Remove the ineligible cases: ${fmt(SF_INV)} − ${SF.NE} = ${fmt(SF_EL)} eligible cases. Ticket buyers who didn’t reply or whose e-mail bounced stay in: they are in the population, just not reached or not willing.`,
        String.raw`RR1 counts completes only: <m>${SF.I} \div ${tf(SF_EL)} = ${SFR.RR1.toFixed(4)}</m>, ${pc(SFR.RR1)}.`,
        String.raw`RR2 counts partials too: <m>(${SF.I} + ${SF.P}) \div ${tf(SF_EL)} = ${SFR.RR2.toFixed(4)}</m>, ${pc(SFR.RR2)}.`,
        `Check what the rates don’t say: whether the ${fmt(SF_EL - SF.I)} non-completers differ from the ${SF.I} who completed in what the survey asked.`,
      ],
      answer: `RR1 = ${pc(SFR.RR1)}; RR2 = ${pc(SFR.RR2)}.`,
      interpretation: 'Report both, with the definitions of complete and partial. Dividing by all 2,500, or dropping the bounced invitations from the denominator, would give different numbers that look comparable and aren’t.' },

    { level: 'challenging', title: 'Weighting Tamberlake’s renewal survey', fictional: true,
      setup: `Tamberlake Gyms (fictional) surveyed members about renewing. Its ${fmt(TG.N.reduce((a, b) => a + b, 0))} members are ${fmt(TG.N[0])} off-peak, ${fmt(TG.N[1])} standard and ${fmt(TG.N[2])} premium; of these, ${TG.n[0]}, ${TG.n[1]} and ${TG.n[2]} replied, and ${TG.x[0]}, ${TG.x[1]} and ${TG.x[2]} said they would renew. Premium members, who use the app most, replied far more often. Estimate the share of all members who will say they would renew, and say what the weighting costs and what it can’t fix.`,
      table: { head: ['Membership', 'Members (N_h)', 'Respondents (n_h)', 'Would renew', 'Share', 'Weight N_h ÷ n_h'], rows: TG.names.map((nm, i) => [nm, fmt(TG.N[i]), TG.n[i], TG.x[i], pc(TG.x[i] / TG.n[i]), TGw[i].toFixed(2)]), align: ['l', 'r', 'r', 'r', 'r', 'r'] },
      steps: [
        String.raw`Unweighted: <m>(45 + 147 + 135) \div 450 = ${TGU.toFixed(4)}</m>, ${pc(TGU)}. Premium members are 10% of members but a third of respondents.`,
        String.raw`Weights: <m>2{,}400 \div 90 = ${TGw[0].toFixed(2)}</m>, <m>4{,}800 \div 210 = ${TGw[1].toFixed(2)}</m>, <m>800 \div 150 = ${TGw[2].toFixed(2)}</m>.`,
        String.raw`Weighted share: <m>(2{,}400 \times 0.50 + 4{,}800 \times 0.70 + 800 \times 0.90) \div 8{,}000 = 5{,}280 \div 8{,}000 = ${TGE.p.toFixed(3)}</m>, ${pc(TGE.p)}: ${((TGU - TGE.p) * 100).toFixed(1)} points lower.`,
        String.raw`Cost: <m>\sum w_i = 8{,}000</m> (the weights add back to the members); <m>\sum w_i^2 = 90 \times ${TGw[0].toFixed(3)}^2 + 210 \times ${TGw[1].toFixed(3)}^2 + 150 \times ${TGw[2].toFixed(3)}^2 = ${fmt(Math.round(TGall.reduce((a, w) => a + w * w, 0))).replace(',', '{,}')}</m>; <m>n_{\text{eff}} = 8{,}000^2 \div ${fmt(Math.round(TGall.reduce((a, w) => a + w * w, 0))).replace(',', '{,}')} = ${TGK.nEff.toFixed(1)}</m>, a design effect of ${TGK.deff.toFixed(2)}.`,
        `Limits: the weights fix the mix of membership types. If, within each type, members who plan to leave were less likely to reply, the ${pc(TGE.p)} is still too high, and nothing in these data can show it. A follow-up phone call to a random sample of non-respondents would.`,
      ],
      answer: `About ${pc(TGE.p)} of members say they would renew (weighted), not ${pc(TGU)}; the weighting reduces the effective sample from 450 to about ${Math.round(TGK.nEff)}.`,
      interpretation: 'The unweighted figure reflected who was keen to reply as much as who would renew. Weighting removed the part of that bias that runs through membership type, at the price of about a fifth of the sample’s precision.' },

    { level: 'applied', title: 'How far can Ana trust the February NPS?', fictional: true,
      setup: `From ${n} completes, the unweighted Net Promoter Score is ${sgn(NPSU.score)}. Assess the survey’s errors and decide what Ana should report.`,
      steps: [
        `Coverage: the frame is Lantern’s list, so the results describe Lantern’s contacts, not all coffee buyers, and they miss customers who never joined the list.`,
        `Sampling and response: ${pc(RR.RR1)} RR1 (${pc(RR.RR2)} with partials); ${n} completes against ${nPlan} planned, so ±${(D.survey.marginAchieved * 100).toFixed(1)} points for a share near 50%.`,
        `Non-response by stratum: RR1 of ${RRS.map((r) => pc(r.RR1, 0)).join(', ')}. The strata with the highest response also have the highest scores (${NPSS.map((x) => sgn(x.score, 0)).join(', ')}), so the unweighted score is tilted upwards.`,
        `Weight to the list: weights ${W.map((w) => w.toFixed(2)).join(', ')}; weighted promoters ${pc(NPSW.pP)}, detractors ${pc(NPSW.pD)}, NPS ${sgn(NPSW.score)}. Kish’s n_eff = ${K.nEff.toFixed(0)}.`,
        'Remaining risk: within each segment, the keenest customers may have been the likeliest to reply. Nothing in the survey can rule that out, so the weighted score is better described as an upper estimate than as the truth.',
      ],
      answer: `Report the weighted score, ${sgn(NPSW.score)}, with the response rate (${pc(RR.RR1)}), the weighting to the list’s four segments, and a plain warning that customers who like Lantern may have been keener to reply, so the true score could be lower.`,
      interpretation: 'The difference between +27.5 and +20.4 is the part of the error Ana could see and correct. The rest needs evidence from outside the respondents, such as a follow-up of non-respondents or the order records of those who did and didn’t reply.' },
  ],

  demo: [
    { widget: 'se-sampler-nps', intro: `The same list as in Sampling methods, now with non-response: each person invited completes the survey with their own probability (about half for subscribers, a fifth for newsletter-only readers, and higher for promoters within every segment). With non-response on and weighting off, draw 1,000 stratified samples: the estimates centre about ${(Math.round(((PEOPLE.propensity.reduce((a, p, i) => a + p * (PEOPLE.group[i] === 2 ? 1 : 0), 0) / PEOPLE.propensity.reduce((a, b) => a + b, 0)) - TRUTH_P) * 100))} points above the truth. Tick “Weight the responses” and draw again: the bias falls but doesn’t vanish.` },
    { widget: 'se-sampler-cb', intro: 'The same respondents, a different question: the share who would definitely or probably buy Cold Brew. Repeat the experiment. Weighting removes most of this question’s bias, because willingness to try Cold Brew is less tied to who replied once the segments are balanced.' },
    { widget: 'se-sheet', intro: 'Lantern’s dispositions, response rates and weights as live formulas. Change a stratum’s completes or partials to see RR1, RR2, the weights and Kish’s effective sample size respond; try what an even 30% response in every stratum would have done to the weights.' },
  ],

  mistakes: [
    { title: '“Our 26% response rate means the results are unreliable; at 60% they would be fine.”', html: 'A response rate measures room for bias, not bias. AAPOR states that response rates alone are insufficient to determine non-response error, and Groves and Peytcheva’s 59 studies found little correlation between the two. What matters is whether non-respondents differ on what you are measuring.' },
    { title: '“Weighting removes non-response bias.”', html: 'Weighting corrects the mix of respondents on the weighting variables only. Lantern’s weighted NPS, +20.4, still overstates the truth because within every segment promoters replied more readily. Pew found that even the best adjustments left most of the bias in opt-in samples.' },
    { title: '“The margin of error is the error.”', html: 'It reflects sampling variance alone. Coverage gaps, non-response, wording, mode and processing mistakes can each be larger, and none of them shrinks as the sample grows.' },
    { title: '“Response rate = replies ÷ invitations, however you count.”', html: 'Whether partials count (RR2) or not (RR1), and what happens to bounced invitations and ineligible cases, change the figure. Use AAPOR’s definitions, set your complete and partial rules in advance, and say which rate you report.' },
    { title: '“Weights are free.”', html: 'Unequal weights reduce precision: Lantern’s 516 completes carry about the information of 469 equally weighted ones by Kish’s rule. Very large weights on a few respondents are a warning sign; collapse small groups or trim extreme weights, and say so.' },
    { title: '“38% said they would buy, so 38% will buy.”', html: 'Stated intentions overstate purchases, especially for new products (Sun and Morwitz), and predict less well for new, non-durable products and long horizons (Morwitz, Steckel and Gupta). Treat intent as a signal of interest and apply an explicit, tested conversion assumption when sizing a market.' },
  ],

  application: [
    { p: 'Professional surveys publish their quality, not just their results. AAPOR’s definitions exist so that a reader can compare one survey’s response rate with another’s; many statistics offices publish quality reports listing response rates, weighting variables and known coverage gaps; and good market research reports carry a method statement with the frame, the dates, the mode, the dispositions, the weighting and the margin, so that a reader can judge the errors the numbers can’t show.' },
    { p: 'The most useful habit is a non-response analysis. Before reporting, compare respondents with non-respondents on everything the frame records. A retailer surveying loyalty-card holders can compare the two groups’ spending, visit frequency and tenure from its own transaction data; if respondents spend 40% more, every satisfaction figure is suspect, and the transaction variables become candidates for weighting. When a decision is large, budget for a follow-up of a random sample of non-respondents by a different mode.' },
    { case: `Ana’s survey note to herself, filed with the results: “Invited ${fmt(INV)}; RR1 ${pc(RR.RR1)}, RR2 ${pc(RR.RR2)}; response ranged from ${pc(RRS[3].RR1, 0)} (newsletter only) to ${pc(RRS[2].RR1, 0)} (workshop participants). Results weighted to the list’s four segments; effective sample ${K.nEff.toFixed(0)}. Weighted NPS ${sgn(NPSW.score)}, probably an upper estimate because keener customers are likelier to reply. Cold Brew intent is interest, not a forecast. Next time: compare respondents’ and non-respondents’ order histories, weight on them if they differ, and phone a random 50 non-respondents.”` },
    { p: 'None of this makes a survey worthless. It makes its claims match its evidence. A weighted score with an honest warning, a response rate stated by a standard definition and an intent figure treated as interest will survive scrutiny; a raw +27.5 presented as “what our customers think” will not.' },
  ],

  summary: [
    'Total survey error: coverage, sampling, non-response and adjustment errors on the representation side; validity, measurement and processing errors on the measurement side. The margin of error measures only sampling variance; MSE = bias² + variance.',
    'AAPOR’s final dispositions: completes and partials; refusals and break-offs, non-contacts and others; unknown eligibility; not eligible (excluded). RR1 = I ÷ all eligible and unknown cases; RR2 adds partials to the numerator. Say which rate you report.',
    'Non-response bias = (1 − RR) × (respondents − non-respondents). A low rate allows bias; it doesn’t prove it, and a high rate doesn’t prevent it. Bias differs from question to question.',
    'Post-stratification weights w_h = N_h ÷ n_h make the respondents match the population on the weighting variables; the weighted estimate equals the stratified estimate.',
    'Weighting costs precision: Kish’s n_eff = (Σw)² ÷ Σw², deff = 1 + CV²(w), a rule of thumb. It can’t fix differences between respondents and non-respondents within a weighting group.',
    'Stated purchase intentions tend to overstate buying, especially for new products, and relate less closely to purchases for new products, non-durables, long horizons and whole categories. Treat them as interest, not forecasts.',
    'Processing errors (coding, merging, keying, weighting the wrong rows) are prevented by a data plan, checks against the frame and second coders.',
  ],

  glossary: [
    { term: 'Total survey error', def: 'The combined error in a survey estimate from every source (coverage, sampling, non-response, adjustment, measurement and processing), considered together when designing and judging a survey.' },
    { term: 'Coverage error', def: 'Error in a survey estimate that arises because the sampling frame misses part of the target population (undercoverage) or includes units outside it (overcoverage), and those units differ on what is measured.' },
    { term: 'Measurement error', def: 'The difference between the answer a respondent gives and the true value, from wording, response styles, order, mode or memory. Its systematic part is measurement bias.' },
    { term: 'Processing error', def: 'Error introduced after answers are collected, in recording, coding, editing, merging or weighting the data.' },
    { term: 'Mean squared error', def: 'The average squared distance between an estimate and the true value over repetitions of a survey: bias squared plus variance.' },
    { term: 'Final disposition', def: 'The outcome code given to every case in a survey sample at the end of fieldwork, in AAPOR’s four groups: interview (complete or partial), eligible non-interview, unknown eligibility, and not eligible.' },
    { term: 'Break-off', def: 'A respondent who starts a questionnaire but stops before answering enough questions to count as a partial; AAPOR counts break-offs with refusals.' },
    { term: 'RR1', def: 'AAPOR’s Response Rate 1: complete interviews divided by all eligible cases and cases of unknown eligibility, I ÷ ((I + P) + (R + NC + O) + U).' },
    { term: 'RR2', def: 'AAPOR’s Response Rate 2: complete and partial interviews divided by all eligible cases and cases of unknown eligibility, (I + P) ÷ ((I + P) + (R + NC + O) + U).' },
    { term: 'Unit non-response', def: 'A sampled person or unit giving no usable answers at all, so that it is missing from the respondents.' },
    { term: 'Item non-response', def: 'A respondent leaving particular questions unanswered while answering the rest of the survey.' },
    { term: 'Survey weight', def: 'The number of population members a respondent stands for in an estimate, used so that weighted respondents reproduce the population’s make-up.' },
    { term: 'Post-stratification', def: 'Weighting respondents after a survey so that each group’s weighted total matches its known population count: each respondent in group h gets the weight N_h ÷ n_h.' },
  ],

  references: [
    { text: 'Groves, R. M. &amp; Lyberg, L. (2010). “Total Survey Error: Past, Present, and Future”. <i>Public Opinion Quarterly</i> 74(5), 849–879. doi:10.1093/poq/nfq065 (listed in the issue’s contents).', url: 'https://academic.oup.com/poq/issue/74/5', checked: '2026-10-24' },
    { text: 'American Association for Public Opinion Research (2023). <i>Standard Definitions: Final Dispositions of Case Codes and Outcome Rates for Surveys</i>, 10th edition.', url: 'https://aapor.org/wp-content/uploads/2023/05/Standards-Definitions-10th-edition.pdf', checked: '2026-10-24' },
    { text: 'National Research Council (2013). <i>Nonresponse in Social Science Surveys: A Research Agenda</i>, chapter 2 “Nonresponse Bias”. The National Academies Press.', url: 'https://www.nationalacademies.org/read/18293/chapter/4', checked: '2026-10-24' },
    { text: 'Zipf, G. &amp; Valliant, R. (2025). “Design Effects and Effective Sample Size”. Vignette for the R package PracTools, CRAN.', url: 'https://cran.r-project.org/web/packages/PracTools/vignettes/Design-effects.html', checked: '2026-10-24' },
    { text: 'Mercer, A., Lau, A. &amp; Kennedy, C. (2018). “For Weighting Online Opt-In Samples, What Matters Most?” Pew Research Center.', url: 'https://www.pewresearch.org/methods/2018/01/26/for-weighting-online-opt-in-samples-what-matters-most/', checked: '2026-10-24' },
    { text: 'Morwitz, V. G., Steckel, J. H. &amp; Gupta, A. (2007). “When do purchase intentions predict sales?” <i>International Journal of Forecasting</i> 23(3), 347–364.', url: 'https://www.academia.edu/35359803/When_do_purchase_intentions_predict_sales', checked: '2026-10-24' },
    { text: 'Sun, B. &amp; Morwitz, V. G. (2010). “Stated intentions and purchase behavior: A unified model”. <i>International Journal of Research in Marketing</i> 27(4), 356–366.', url: 'https://english.ckgsb.edu.cn/wp-content/uploads/2017/12/intention.pdf', checked: '2026-10-24' },
  ],

  checks: (() => {
    const promNR = PEOPLE.propensity.reduce((a, p, i) => a + p * (PEOPLE.group[i] === 2 ? 1 : 0), 0) / PEOPLE.propensity.reduce((a, b) => a + b, 0);
    const sumW2 = TGall.reduce((a, w) => a + w * w, 0);
    return [
      // case: response
      { what: 'Invited', value: INV, shown: 2004 },
      { what: 'Completes', value: n, shown: 516 },
      { what: 'Partials', value: ALL.P, shown: 56 },
      { what: 'Refused', value: ALL.R, shown: 27 },
      { what: 'Bounced', value: ALL.NC, shown: 57 },
      { what: 'No reply', value: ALL.U, shown: 1348 },
      { what: 'Dispositions add up', value: ALL.I + ALL.P + ALL.R + ALL.NC + ALL.U, shown: INV },
      { what: 'RR1 %', value: RR.RR1 * 100, shown: 25.7, tol: 0.05 },
      { what: 'RR2 %', value: RR.RR2 * 100, shown: 28.5, tol: 0.05 },
      { what: 'RR1 4 dp', value: RR.RR1, shown: 0.2575, tol: 0.00005 },
      { what: 'Planned response %', value: SURVEY_PLAN.responseRate * 100, shown: 30 },
      { what: 'RR1 subscribers %', value: RRS[0].RR1 * 100, shown: 51.1, tol: 0.05 },
      { what: 'RR1 shop %', value: RRS[1].RR1 * 100, shown: 30.8, tol: 0.05 },
      { what: 'RR1 workshop %', value: RRS[2].RR1 * 100, shown: 54.0, tol: 0.05 },
      { what: 'RR1 newsletter %', value: RRS[3].RR1 * 100, shown: 20.5, tol: 0.05 },
      { what: 'RR2 subscribers %', value: RRS[0].RR2 * 100, shown: 57.5, tol: 0.05 },
      { what: 'RR2 shop %', value: RRS[1].RR2 * 100, shown: 33.8, tol: 0.05 },
      { what: 'RR2 workshop %', value: RRS[2].RR2 * 100, shown: 54.0, tol: 0.05 },
      { what: 'RR2 newsletter %', value: RRS[3].RR2 * 100, shown: 23.0, tol: 0.05 },
      { what: 'About half the subscribers replied', value: RRS[0].RR1, shown: 0.5, tol: 0.02 },
      { what: 'A fifth of newsletter-only replied', value: RRS[3].RR1, shown: 0.2, tol: 0.01 },
      { what: 'Margin achieved (points)', value: D.survey.marginAchieved * 100, shown: 4.31, tol: 0.005 },
      { what: 'Margin achieved 1 dp', value: D.survey.marginAchieved * 100, shown: 4.3, tol: 0.05 },
      { what: 'Margin planned (points)', value: D.survey.marginPlanned * 100, shown: 4.00, tol: 0.005 },
      { what: 'Planned completes', value: nPlan, shown: 601 },
      { what: 'Did not complete', value: INV - n, shown: 1488 },
      { what: 'Completes by stratum', value: NC.join(), shown: '89,103,27,297', tol: 0, str: true },
      // NPS
      { what: 'Unweighted NPS', value: NPSU.score, shown: 27.5, tol: 0.05 },
      { what: 'Weighted NPS', value: NPSW.score, shown: 20.4, tol: 0.05 },
      { what: 'Unweighted − weighted ≈ 7', value: NPSU.score - NPSW.score, shown: 7, tol: 0.5 },
      { what: 'NPS subscribers', value: NPSS[0].score, shown: 62, tol: 0.5 },
      { what: 'NPS shop', value: NPSS[1].score, shown: 53, tol: 0.5 },
      { what: 'NPS workshop', value: NPSS[2].score, shown: 41, tol: 0.5 },
      { what: 'NPS newsletter', value: NPSS[3].score, shown: 7, tol: 0.5 },
      { what: 'Weighted promoters %', value: NPSW.pP * 100, shown: 40.5, tol: 0.05 },
      { what: 'Weighted detractors %', value: NPSW.pD * 100, shown: 20.1, tol: 0.05 },
      { what: 'Subscribers share of list %', value: SIZES[0] / N * 100, shown: 8.7, tol: 0.05 },
      { what: 'Subscribers share of completes %', value: NC[0] / n * 100, shown: 17.2, tol: 0.05 },
      { what: 'Newsletter share of list %', value: SIZES[3] / N * 100, shown: 72.2, tol: 0.05 },
      { what: 'Newsletter share of completes %', value: NC[3] / n * 100, shown: 57.6, tol: 0.05 },
      { what: 'Shop share of list %', value: SIZES[1] / N * 100, shown: 16.7, tol: 0.05 },
      { what: 'Shop share of completes %', value: NC[1] / n * 100, shown: 20.0, tol: 0.05 },
      { what: 'Workshop share of list %', value: SIZES[2] / N * 100, shown: 2.5, tol: 0.05 },
      { what: 'Workshop share of completes %', value: NC[2] / n * 100, shown: 5.2, tol: 0.05 },
      // weights
      { what: 'Weight subscribers', value: W[0], shown: 5.84 },
      { what: 'Weight shop', value: W[1], shown: 9.71 },
      { what: 'Weight workshop', value: W[2], shown: 5.56 },
      { what: 'Weight newsletter', value: W[3], shown: 14.58 },
      { what: 'Newsletter weight ≈ 2.5 × subscriber weight', value: W[3] / W[0], shown: 2.5, tol: 0.05 },
      { what: 'Weighted total = list', value: W.reduce((a, w, h) => a + w * NC[h], 0), shown: 6000, tol: 1e-6 },
      { what: 'Kish n_eff', value: K.nEff, shown: 469.3, tol: 0.05 },
      { what: 'Kish n_eff whole', value: K.nEff, shown: 469, tol: 0.5 },
      { what: 'Kish deff', value: K.deff, shown: 1.099, tol: 0.0005 },
      { what: 'Completes lost to weighting', value: n - K.nEff, shown: 47, tol: 0.5 },
      { what: 'Stratified SE of promoters (points)', value: SEST.se * 100, shown: 2.07, tol: 0.005 },
      { what: 'Kish-based SE (points)', value: seKish * 100, shown: 2.27, tol: 0.005 },
      { what: 'Stratified promoter share = weighted', value: SEST.p, shown: NPSW.pP, tol: 1e-9 },
      // what Ana couldn't see
      { what: 'Invited promoters %', value: pInv * 100, shown: 34.3, tol: 0.05 },
      { what: 'Respondent promoters %', value: pResp * 100, shown: 45.9, tol: 0.05 },
      { what: 'Non-respondent promoters %', value: pNon * 100, shown: 30.3, tol: 0.05 },
      { what: 'Bias formula (points)', value: (1 - RR.RR1) * (pResp - pNon) * 100, shown: 11.6, tol: 0.05 },
      { what: 'Bias = respondents − invited', value: (pResp - pInv) * 100, shown: (1 - RR.RR1) * (pResp - pNon) * 100, tol: 1e-9 },
      { what: 'Respondents − non-respondents', value: (pResp - pNon) * 100, shown: 15.6, tol: 0.05 },
      { what: '1 − RR1 4 dp', value: RR.RR1, shown: 0.2575, tol: 0.00005 },
      ...byH.map((b, h) => ({ what: `Stratum ${h} respondents > non-respondents`, value: Number(b.r > b.nr), shown: 1 })),
      { what: 'Subs resp prom %', value: byH[0].r * 100, shown: 73, tol: 0.5 },
      { what: 'Subs non prom %', value: byH[0].nr * 100, shown: 55, tol: 0.5 },
      { what: 'Shop resp prom %', value: byH[1].r * 100, shown: 62, tol: 0.5 },
      { what: 'Shop non prom %', value: byH[1].nr * 100, shown: 43, tol: 0.5 },
      { what: 'WS resp prom %', value: byH[2].r * 100, shown: 59, tol: 0.5 },
      { what: 'WS non prom %', value: byH[2].nr * 100, shown: 57, tol: 0.5 },
      { what: 'NL resp prom %', value: byH[3].r * 100, shown: 31, tol: 0.5 },
      { what: 'NL non prom %', value: byH[3].nr * 100, shown: 25, tol: 0.5 },
      { what: 'Truth NPS about +8', value: TRUTH_NPS, shown: 8, tol: 0.5 },
      { what: 'NR bias in the sampler (points)', value: (promNR - TRUTH_P) * 100, shown: 11, tol: 0.5 },
      // Cold Brew
      { what: 'Top two unweighted %', value: CB.topTwo * 100, shown: 42.2, tol: 0.05 },
      { what: 'Top two weighted %', value: CB.topTwoWeighted * 100, shown: 38.2, tol: 0.05 },
      { what: 'Top two truth %', value: CB.truthTopTwo * 100, shown: 39.3, tol: 0.05 },
      { what: 'Weighted within about a point of truth', value: Math.abs(CB.topTwoWeighted - CB.truthTopTwo) * 100, shown: 1, tol: 0.1 },
      // Pew, NRC, Sun & Morwitz
      { what: 'Pew benchmarks', value: 24, shown: 24 },
      { what: 'Pew unweighted bias', value: 8.4, shown: 8.4 },
      { what: 'Pew best about 6', value: 6, shown: 6 },
      { what: 'Groves & Peytcheva studies', value: 59, shown: 59 },
      { what: 'Deming factors', value: 13, shown: 13 },
      { what: 'Sun & Morwitz stated %', value: 15.3, shown: 15.3 },
      { what: 'Sun & Morwitz bought %', value: 5.7, shown: 5.7 },
      { what: 'AAPOR example complete above 80%', value: 80, shown: 80 },
      { what: 'AAPOR example partial from 50%', value: 50, shown: 50 },
      { what: 'Lantern rule: five closed questions (Q1 to Q5)', value: 5, shown: 5 },
      { what: 'Stratified SE before the FPC (points)', value: seNoF * 100, shown: 2.15, tol: 0.005 },
      // Saltreed
      { what: 'Saltreed invited', value: SF_INV, shown: 2500 },
      { what: 'Saltreed eligible', value: SF_EL, shown: 2490 },
      { what: 'Saltreed RR1 4 dp', value: SFR.RR1, shown: 0.2450, tol: 0.00005 },
      { what: 'Saltreed RR1 %', value: SFR.RR1 * 100, shown: 24.5, tol: 0.05 },
      { what: 'Saltreed RR2 4 dp', value: SFR.RR2, shown: 0.2811, tol: 0.00005 },
      { what: 'Saltreed RR2 %', value: SFR.RR2 * 100, shown: 28.1, tol: 0.05 },
      { what: 'Saltreed non-completers', value: SF_EL - SF.I, shown: 1880 },
      // Tamberlake
      { what: 'Tamberlake members', value: 8000, shown: TG.N.reduce((a, b) => a + b, 0) },
      { what: 'Tamberlake respondents', value: 450, shown: TG.n.reduce((a, b) => a + b, 0) },
      { what: 'Tamberlake unweighted', value: TGU, shown: 0.7267, tol: 0.00005 },
      { what: 'Tamberlake unweighted %', value: TGU * 100, shown: 72.7, tol: 0.05 },
      { what: 'Premium share of members %', value: 800 / 8000 * 100, shown: 10 },
      { what: 'Premium share of respondents: a third', value: 150 / 450, shown: 1 / 3, tol: 1e-9 },
      { what: 'Weight off-peak', value: TGw[0], shown: 26.67 },
      { what: 'Weight standard', value: TGw[1], shown: 22.86 },
      { what: 'Weight premium', value: TGw[2], shown: 5.33 },
      { what: 'Weighted numerator', value: 2400 * 0.5 + 4800 * 0.7 + 800 * 0.9, shown: 5280, tol: 1e-6 },
      { what: 'Tamberlake weighted', value: TGE.p, shown: 0.660, tol: 0.0005 },
      { what: 'Tamberlake weighted %', value: TGE.p * 100, shown: 66.0, tol: 0.05 },
      { what: 'Tamberlake difference', value: (TGU - TGE.p) * 100, shown: 6.7, tol: 0.05 },
      { what: 'Σw', value: TGall.reduce((a, b) => a + b, 0), shown: 8000, tol: 1e-6 },
      { what: 'Σw²', value: sumW2, shown: 177981, tol: 0.5 },
      { what: 'Tamberlake n_eff', value: TGK.nEff, shown: 359.6, tol: 0.05 },
      { what: 'Tamberlake n_eff whole', value: TGK.nEff, shown: 360, tol: 0.5 },
      { what: 'Tamberlake deff', value: TGK.deff, shown: 1.25, tol: 0.005 },
      { what: 'About a fifth of precision lost', value: 1 - TGK.nEff / 450, shown: 0.2, tol: 0.005 },
      { what: 'Squared weights shown (3 dp)', value: TGw[0], shown: 26.667, tol: 0.0005 },
      { what: 'Squared weights shown (3 dp) standard', value: TGw[1], shown: 22.857, tol: 0.0005 },
      { what: 'Squared weights shown (3 dp) premium', value: TGw[2], shown: 5.333, tol: 0.0005 },
      // application
      { what: 'A random 50 non-respondents', value: 50, shown: 50 },
      { what: 'Respondents spend 40% more (illustration)', value: 40, shown: 40 },
    ].filter((c) => !c.str).concat([
      ...[89, 103, 27, 297].map((v, h) => ({ what: `Completes stratum ${h}`, value: NC[h], shown: v })),
    ]);
  })(),
};
