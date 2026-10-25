// project.js — M04 applied project: Office coffee for Harbour City. In March–April 2027 Ana Lim considers an office-coffee
// subscription for offices in Lantern's district (a leased bean-to-cup machine, beans delivered weekly and a quarterly
// barista visit, for $14 a member of staff a month). The student frames the research and weighs what it is worth, fixes
// the draft questionnaire, samples the business directory, analyses the office managers' survey with weights, sizes the
// market from the top down and the bottom up, compares competitors' offers, codes the interviews and writes Ana a memo.
// Every figure comes from case.js (OFFICE_* exports); `verify` recomputes the figures shown, including the worksheet
// formulas through the spreadsheet engine.
import { OFFICE_FRAME, OFFICE_LEVELS, OFFICE_OFFER, OFFICES, OFFICE_DECISION, OFFICE_DRAFT, OFFICE_FLAWS, OFFICE_INTERVIEWS, OFFICE_INTERVIEW_THEMES, OFFICE_COMPETITORS, OFFICE_SIZING, tableCells } from './case.js?v=14';
import * as S from '../../../core/survey.js?v=14';
import { Sheet } from '../../../core/sheet.js?v=14';

const num = (id, prompt, answer, check, solution, wrong, { unit = '', places = 2, tol = 0.005, kind = 'numerical' } = {}) =>
  ({ id, type: 'num', kind, unit, places, prompt, answer, check, tol, solution, ...(wrong ? { wrong } : {}) });
const r = (x, p = 2) => Math.round(x * 10 ** p) / 10 ** p;
const pct = (x, p = 1) => `${(x * 100).toFixed(p)}%`;
const f = (x, p = 0) => x.toLocaleString('en-US', { minimumFractionDigits: p, maximumFractionDigits: p });
const usd = (x, p = 0) => `$${f(x, p)}`;
const sum = (xs) => xs.reduce((a, b) => a + b, 0);

// ---------------------------------------------------------------- framing: what the research is worth
const Dn = OFFICE_DECISION;
const evLaunch = Dn.pStrong * Dn.gainIfStrong - (1 - Dn.pStrong) * Dn.lossIfWeak;          // launch without research
const evPerfect = Dn.pStrong * Dn.gainIfStrong + (1 - Dn.pStrong) * 0;                     // launch only if strong
const evpi = evPerfect - Math.max(evLaunch, 0);

// ---------------------------------------------------------------- the sample and the weights
const B = OFFICE_FRAME.bands, NH = OFFICE_FRAME.offices, INV = OFFICE_FRAME.invited;
const NOFF = sum(NH), NINV = sum(INV);
const byBand = B.map((_, h) => OFFICES.filter((o) => o.band === h));
const nh = byBand.map((x) => x.length), n = OFFICES.length;
const wts = S.postStratWeights(NH, nh).weights;                                                // N_h ÷ n_h
const propAlloc = S.proportionalAllocation(NH, NINV);
const top2 = (o) => o.interest <= 2;
const top2h = byBand.map((x) => x.filter(top2).length);
const strat = S.stratifiedProportion(byBand.map((x, h) => ({ N: NH[h], n: x.length, x: top2h[h] })));
const unweightedTop2 = OFFICES.filter(top2).length / n;
const marginNoFpc = 1.96 * Math.sqrt(sum(byBand.map((x, h) => { const p = top2h[h] / nh[h]; return NH[h] ** 2 * (nh[h] / (nh[h] - 1)) * p * (1 - p) / nh[h]; }))) / NOFF;
const W = (o) => wts[o.band];
const wsum = (g) => sum(OFFICES.map((o) => W(o) * g(o)));
const staffShareTop2 = wsum((o) => o.staff * (top2(o) ? 1 : 0)) / wsum((o) => o.staff);
const staffShareTop2Unw = sum(OFFICES.map((o) => o.staff * (top2(o) ? 1 : 0))) / sum(OFFICES.map((o) => o.staff));
const kishN = S.kish(OFFICES.map((o) => wts[o.band])).nEff;                                     // effective sample size
const largeTop2 = top2h[2], othersTop2 = top2h[0] + top2h[1], othersN = nh[0] + nh[1];
const ROWS = OFFICES.map((o) => [o.id, B[o.band], o.staff, OFFICE_LEVELS.arrangement[o.arrangement], o.spend, OFFICE_LEVELS.interest[o.interest - 1], r(W(o), 3), top2(o) ? 1 : 0]);
const COLS = ['office', 'band', 'staff', 'arrangement', 'monthly_spend', 'interest', 'weight', 'top_two'];
const last = n + 1;
const surveyCells = tableCells(COLS, ROWS, { cols: COLS.slice(0, 6) }).cells;
const weightCells = tableCells(COLS, ROWS).cells;
const COUNT_TOP2 = `=COUNTIFS(B2:B${last},K1,F2:F${last},"${OFFICE_LEVELS.interest[0]}")+COUNTIFS(B2:B${last},K1,F2:F${last},"${OFFICE_LEVELS.interest[1]}")`;
const STAFF_SHARE = `=SUMPRODUCT(G2:G${last},C2:C${last},H2:H${last})/SUMPRODUCT(G2:G${last},C2:C${last})`;

// ---------------------------------------------------------------- sizing
const Z = OFFICE_SIZING, PRICE = OFFICE_OFFER.pricePerStaffMonth;
const meanStaff = byBand.map((x) => sum(x.map((o) => o.staff)) / x.length);
const bottomUpStaff = sum(NH.map((N, h) => N * meanStaff[h]));
const gapPct = (bottomUpStaff / Z.districtStaff10plus - 1) * 100;
const largeStaffShare = (NH[2] * meanStaff[2]) / bottomUpStaff;
const tam = Z.districtStaff10plus * PRICE * 12;
// SAM: offices that already pay for a coffee service the subscription would replace (pod machines, a bean-to-cup
// machine, filter or urn). Offices with no coffee would need a new budget line; catered offices buy their coffee as part
// of a catering contract, a different purchase. The SOM is counted inside the SAM.
const inSam = (o) => [1, 2, 3].includes(o.arrangement);
const samShare = wsum((o) => o.staff * (inSam(o) ? 1 : 0)) / wsum((o) => o.staff);
const sam = tam * samShare;
const expOffices = wsum((o) => (inSam(o) ? Z.conversion[o.interest - 1] : 0));
const expStaff = wsum((o) => (inSam(o) ? o.staff * Z.conversion[o.interest - 1] : 0));
const somRevenue = expStaff * PRICE * 12;
const STRONG = 20;                                                                             // the brief's "strong demand": 20 or more offices
// sensitivity: no "probably" converts; or a third of them do
const expOfficesNoProb = wsum((o) => (inSam(o) && o.interest === 1 ? Z.conversion[0] : 0));
const expOfficesThirdProb = wsum((o) => (!inSam(o) ? 0 : o.interest === 1 ? Z.conversion[0] : o.interest === 2 ? 1 / 3 : 0));

// ---------------------------------------------------------------- competitors and interviews
const daystar = OFFICE_COMPETITORS.find((c) => c.perCup);
const daystarMonth = Z.cupsPerStaffDay * Z.workdaysMonth * daystar.perCup;
const themeCount = OFFICE_INTERVIEW_THEMES.map((_, k) => OFFICE_INTERVIEWS.filter((q) => q.theme === k).length);
const managers = new Set(OFFICE_INTERVIEWS.map((q) => q.who)).size;

export default {
  title: 'Office coffee for Harbour City',
  brief: [
    { case: `It is March 2027. Lantern’s catering clients keep asking whether Lantern could look after their office coffee every day, not only at events. Ana Lim is considering an office-coffee subscription for offices in Lantern’s district: a leased bean-to-cup machine, beans delivered weekly and a barista visit each quarter, for $${PRICE} a member of staff a month (offices of ${OFFICE_OFFER.minimumStaff} or more staff; a 12-month contract). Before she commits to machine leases, a second van and a part-time barista, she wants research she can act on. Lantern, Ana, the offices, the suppliers and every figure are fictional.` },
    { p: 'What you have:' },
    { list: [
      `<b>Ana’s planning figures</b>: a launch makes $${f(Dn.gainIfStrong)} of contribution in its first year if demand is strong (20 or more offices sign up) and loses $${f(Dn.lossIfWeak)} if it is weak; before any research she puts the chance of strong demand at ${pct(Dn.pStrong, 0)}. Not launching makes $0. The research below cost $${f(Dn.researchCost)}.`,
      `<b>A business directory</b>, bought in March 2027, listing the ${NOFF} offices with 10 or more staff in the district, by size band: ${B.map((b, h) => `${NH[h]} with ${b}`).join(', ')}.`,
      `<b>An office survey</b> (March 2027): Ana invited ${INV.map((k, h) => `${k} offices with ${B[h]}`).join(', ')}, chosen at random within each band, and asked the office manager about the current coffee arrangement, the monthly spend and interest in the offer at its price. ${n} returned complete questionnaires.`,
      `<b>Interviews</b> with ${managers} office managers, coded remark by remark.`,
      `<b>Competitors’ offers</b> from published price lists and a quote an office manager shared with Ana, and the Harbour City Statistics Office’s 2026 count of people working in offices of 10 or more staff in the district (${f(Z.districtStaff10plus)}).`,
    ] },
  ],
  deliverables: [
    'The research objectives and what the research was worth before it was done.',
    'A corrected questionnaire: what was wrong with the draft and where the price belongs.',
    'The sampling plan explained, with the weights (offices ÷ replies in each band) and response rates.',
    'Weighted estimates of interest, with their margin of error and what they can and can’t show.',
    'The market sized from the top down and the bottom up (TAM, SAM and a first-year SOM) with the assumptions that drive it.',
    'A comparison with competitors’ offers and the themes from the interviews.',
    'A memo to Ana: launch, don’t launch, or test first, with the evidence and its limits.',
  ],
  stages: [
    {
      id: 'frame', title: 'Frame the research',
      html: '<p>Start with the decision and what better information could be worth to it.</p>',
      items: [
        { id: 'm04-pj-1', type: 'classify', kind: 'conceptual',
          prompt: 'Classify each statement from Ana’s notes.',
          items: [
            'Estimate the share of offices with 10 or more staff in the district that would sign up at $14 a member of staff a month.',
            'Should Lantern launch an office-coffee subscription in its district this year?',
            'Find out why office managers switch coffee suppliers and what makes them hesitate.',
            'Prove that the subscription will make a profit in its first year.',
          ],
          categories: ['Decision problem', 'Descriptive research objective', 'Exploratory research objective', 'Not something research can deliver'],
          answer: [1, 0, 2, 3],
          feedback: {
            1: 'This is the choice Ana has to make. Research informs it; the research problem is what she needs to find out to make it.',
            3: 'Research reduces uncertainty; it can’t prove a future profit. A descriptive objective (how many would sign up) and an exploratory one (why they hesitate) are what it can deliver.',
          },
          solution: 'The decision problem is whether to launch. The research objectives turn it into things research can find out: how many offices would sign up at the price (descriptive: a number with a margin of error) and why managers switch or hesitate (exploratory: themes from interviews). No study proves a future profit.' },
        { id: 'm04-pj-2', type: 'steps', kind: 'numerical',
          prompt: 'Use Ana’s planning figures (in the brief) to value information before any research. Give dollars.',
          steps: [
            num('m04-pj-2-1', 'What is the expected first-year result of launching now, without research?', evLaunch,
              () => Dn.pStrong * Dn.gainIfStrong - (1 - Dn.pStrong) * Dn.lossIfWeak, '',
              [{ value: Dn.pStrong * Dn.gainIfStrong, say: 'That counts only the good outcome. Subtract the 60% chance of losing $30,000.' }, { value: r(0.5 * Dn.gainIfStrong - 0.5 * Dn.lossIfWeak, 0), say: 'That treats strong and weak demand as equally likely. Ana’s prior is 40% strong.' }],
              { unit: '$', places: 0, tol: 0.5 }),
            num('m04-pj-2-2', 'If research could tell Ana for certain whether demand is strong, she would launch only when it is. What is the expected result then?', evPerfect,
              () => Dn.pStrong * Dn.gainIfStrong, '', null, { unit: '$', places: 0, tol: 0.5 }),
            num('m04-pj-2-3', 'What, then, is the most that perfect information about demand could be worth?', evpi,
              () => Dn.pStrong * Dn.gainIfStrong - Math.max(0, Dn.pStrong * Dn.gainIfStrong - (1 - Dn.pStrong) * Dn.lossIfWeak), '',
              [{ value: evPerfect, say: 'That is the expected result with perfect information. Its value is the gain over the best choice without it, launching now.' }],
              { unit: '$', places: 0, tol: 0.5 }),
          ],
          solution: `Launching now: ${pct(Dn.pStrong, 0)} × $${f(Dn.gainIfStrong)} − ${pct(1 - Dn.pStrong, 0)} × $${f(Dn.lossIfWeak)} = $${f(evLaunch)}, a small positive expected result, so without research Ana would just about launch. With perfect information she launches only when demand is strong: ${pct(Dn.pStrong, 0)} × $${f(Dn.gainIfStrong)} = $${f(evPerfect)}. The difference, $${f(evpi)}, is the expected value of perfect information: the ceiling on what any study of demand is worth.` },
        { id: 'm04-pj-3', type: 'mc', kind: 'applied',
          prompt: `The survey and interviews cost $${f(Dn.researchCost)}. What does the expected value of perfect information, $${f(evpi)}, tell Ana?`,
          options: [
            'Research can pay its way, but only if its result might change whether Ana launches',
            'The research is certain to return $18,000, three times its cost, because it reduces uncertainty',
            'Research is not worth doing, since Ana would launch anyway on her prior figures',
            'Nothing useful, because the figure depends on Ana’s guesses about demand and the outcomes',
          ],
          answer: 0,
          feedback: {
            1: 'The $18,000 is a ceiling for perfect information. Real research is imperfect and is worth no more than that, and usually less; it is worth anything only if its result could change what Ana does.',
            2: 'Ana would just about launch now, but her expected result is small and a weak launch loses $30,000. Information that could stop a bad launch is valuable precisely because the decision is close.',
            3: 'The figure rests on Ana’s estimates, but it still bounds the research budget and shows the decision is close. Check how it moves if the estimates change.',
          },
          solution: 'Perfect information is worth at most $18,000 here, so a $6,000 study can be justified, but only because its result could flip the decision: if the survey showed weak demand Ana would not launch and would avoid a $30,000 loss. Imperfect research is worth no more than the ceiling, and usually less, so the research should be designed to answer the one question that decides the launch: how many offices would sign up.' },
      ],
    },
    {
      id: 'questionnaire', title: 'Fix the questionnaire',
      html: `<p>Ana’s first draft of the office questionnaire, before a colleague reviewed it:</p><ol>${OFFICE_DRAFT.map((d) => `<li>${d.q}</li>`).join('')}</ol>`,
      items: [
        { id: 'm04-pj-4', type: 'classify', kind: 'conceptual',
          prompt: 'Name the main problem with each draft question.',
          items: OFFICE_DRAFT.map((d) => d.q),
          categories: OFFICE_FLAWS,
          answer: OFFICE_DRAFT.map((d) => OFFICE_FLAWS.indexOf(d.flaw)),
          feedback: {
            0: 'The wording signals the expected answer. Ask neutrally: “How would you rate the coffee your office has now?” on a balanced scale.',
            1: 'Price and quality are two things; a manager happy with one and not the other can’t answer. Ask two questions.',
            2: 'Nobody can recall a year’s cups. Ask about a recent, short period, or about something the office records (monthly spend).',
            3: 'An office of 10 or 50 staff fits two options. Use 10–49 / 50–249 / 250 or more, matching the directory’s bands.',
            4: '“Premium artisan” sells rather than describes, and interest means little without a price. Describe the offer plainly, with its price.',
            5: 'Many offices use another supplier or none. Add “Another supplier” and “None”.',
          },
          solution: 'The final questionnaire asks one thing at a time, neutrally, about things the manager knows (current arrangement, monthly spend from invoices), with options that cover everyone exactly once, and describes the offer, including the price, before asking about interest.' },
        { id: 'm04-pj-5', type: 'mc', kind: 'applied',
          prompt: 'Where should the subscription’s price appear in the questionnaire?',
          options: [
            'In the description of the offer, just before the question about interest in signing up',
            'After the interest question, so that the price doesn’t put managers off answering',
            'Nowhere: interest without a price is the purest measure of how much offices like the idea',
            'In a separate follow-up survey sent only to the managers who said they were interested',
          ],
          answer: 0,
          feedback: {
            1: 'Then the interest question measures interest in a free or unpriced offer, which overstates demand at $14 a head.',
            2: 'Demand depends on price. An unpriced question measures liking, not willingness to sign up.',
            3: 'Interest measured without the price is still inflated, and the follow-up loses everyone who said no.',
          },
          solution: 'Purchase intent only means something at a stated price. Describe the offer plainly (machine, beans, visits, contract length, $14 a member of staff a month) and then ask how likely the office would be to sign up; ask about current spend before the offer, so the offer doesn’t colour it.' },
      ],
    },
    {
      id: 'sample', title: 'Sample the directory',
      html: `<p>The directory lists ${NH.map((k, h) => `${k} offices with ${B[h]}`).join(', ')}. Ana invited ${INV.join(', ')} offices respectively (${NINV} in all), chosen at random within each band, and ${nh.join(', ')} returned complete questionnaires. None of the ${n} who replied was ineligible, and, as AAPOR’s RR1 does, Ana counts the ${NINV - n} who didn’t reply as eligible. A bought directory is a frame with its own errors: it can still list offices that have closed, moved or shrunk below 10 staff, and miss new ones.</p>`,
      items: [
        num('m04-pj-6', `If Ana had allocated her ${NINV} invitations in proportion to the number of offices in each band, how many offices with ${B[2]} would she have invited?`, propAlloc[2],
          () => S.proportionalAllocation(NH, NINV)[2],
          `${NINV} × ${NH[2]} ÷ ${NOFF} = ${f((NINV * NH[2]) / NOFF, 1)}, so ${propAlloc[2]} (the bands get ${propAlloc.join(', ')}).`,
          [{ value: INV[2], say: 'That is what Ana actually did: every large office. Proportional allocation follows each band’s share of the directory.' }, { value: r(NINV / 3, 0), say: 'That splits the invitations equally between the bands. Proportional allocation follows each band’s share of the offices.' }],
          { unit: 'offices', places: 0, tol: 0.5, kind: 'numerical' }),
        { id: 'm04-pj-7', type: 'mc', kind: 'conceptual',
          prompt: `Why did Ana invite all ${NH[2]} large offices rather than the ${propAlloc[2]} that proportional allocation would give?`,
          options: [
            'Large offices hold much of the staff, and so the revenue, and she needs enough of their replies to read them',
            'Large offices are more likely to reply, so inviting more of them raises the overall response rate the survey reports',
            'A stratified sample must take the same number of offices from every band for its estimates to be unbiased',
            'Inviting every large office turns the survey into a census, so its results need no margin of error at all',
          ],
          answer: 0,
          feedback: {
            1: 'A higher response rate is not the aim; reading the band that carries the revenue is. Response rates also differ for reasons the design can’t control.',
            2: 'Strata can be sampled at different rates. The estimate stays unbiased if each band’s answers are weighted by its share of the population.',
            3: 'Only the large band is a census of invitations, and only those who replied answer. The other bands are samples, and the overall estimate has a margin of error.',
          },
          solution: `With ${propAlloc[2]} invitations Ana would expect only about half a dozen large offices to reply: too few to say anything about them. Yet offices with ${B[2]} employ about ${pct((NH[2] * meanStaff[2]) / bottomUpStaff, 0)} of the staff in the district, so they carry much of the revenue. Disproportionate allocation buys precision where it matters; weighting puts the bands back in proportion when estimating for all offices, at a cost: with these unequal weights Kish’s effective sample is about ${Math.round(kishN)} of the ${n} replies.` },
        { id: 'm04-pj-8', type: 'steps', kind: 'numerical',
          prompt: 'Work out the weights that put the replies back in proportion, and the response rate.',
          steps: [
            num('m04-pj-8-1', `What weight does each responding office with ${B[0]} get (the number of offices it stands for)? Give two decimal places.`, r(wts[0], 2), () => NH[0] / nh[0], '',
              [{ value: r(NH[0] / INV[0], 2), say: 'That is the weight for an invitation (offices ÷ invited). Only those who replied are in the data: divide by the number who replied.' }, { value: r(nh[0] / NH[0], 2), say: 'That is upside down: the share of the band that replied. The weight is offices ÷ replies.' }],
              { places: 2, tol: 0.006 }),
            num('m04-pj-8-2', `What weight does each responding office with ${B[2]} get? Give two decimal places.`, r(wts[2], 2), () => NH[2] / nh[2], '', null, { places: 2, tol: 0.006 }),
            num('m04-pj-8-3', `What was the overall response rate, AAPOR’s RR1 (completed questionnaires ÷ invited offices, counting those that didn’t reply as eligible)? Give a percentage to one decimal place.`, r((n / NINV) * 100, 1), () => (n / NINV) * 100, '',
              [{ value: r((n / NOFF) * 100, 1), say: 'That divides by every office in the directory. The response rate divides by those invited.' }],
              { unit: '%', places: 1, tol: 0.06 }),
          ],
          solution: `Weights are offices ÷ replies in each band: ${NH.map((k, h) => `${k} ÷ ${nh[h]} = ${f(wts[h], 2)}`).join('; ')}. Each small office that replied stands for about ${Math.round(wts[0])} offices; each large one for about ${Math.round(wts[2])}. The response rate was ${n} ÷ ${NINV} = ${pct(n / NINV)} overall (${B.map((b, h) => `${pct(nh[h] / INV[h])} for ${b}`).join(', ')}): well above the customer survey’s 25.7%, though, as <i>Survey error</i> showed, a rate alone doesn’t measure bias. Those who replied may be the keener ones within each band, which weighting by band can’t correct.` },
      ],
    },
    {
      id: 'analyse', title: 'Analyse the office survey',
      html: `<p>The worksheet holds the ${n} replies, one row per office: its size band, staff, current coffee arrangement, monthly coffee spend ($) and interest in the offer at $${PRICE} a member of staff a month. G is each reply’s weight (the offices it stands for) and H is 1 for the top two boxes; use columns J to M for your working.</p>`,
      tool: { kind: 'widget', widget: { type: 'sheet', title: 'Office survey, March 2027', sheet: { cells: weightCells }, view: `A1:M${last}`, editable: `J1:M${last}`, maxHeight: '22rem', widths: { B: 16, D: 20, F: 24 } } },
      items: [
        { id: 'm04-pj-9', type: 'formula', kind: 'applied',
          prompt: `K1 holds a size band (“${B[2]}”). In K2, count the offices in that band whose interest was “${OFFICE_LEVELS.interest[0]}” or “${OFFICE_LEVELS.interest[1]}” (the top two boxes), in a formula that still works if K1 changes.`,
          sheet: { cells: { ...surveyCells, J1: 'Band', K1: B[2], J2: 'Top two boxes' }, vary: { K1: [B[0], B[1]] } },
          cell: 'K2', view: `A1:K${last}`, maxHeight: '20rem', widths: { B: 16, D: 20, F: 24, J: 14, K: 18 },
          answer: COUNT_TOP2,
          alt: [`=SUM(COUNTIFS(B2:B${last},K1,F2:F${last},{"${OFFICE_LEVELS.interest[0]}","${OFFICE_LEVELS.interest[1]}"}))`, `=SUMPRODUCT((B2:B${last}=K1)*((F2:F${last}="${OFFICE_LEVELS.interest[0]}")+(F2:F${last}="${OFFICE_LEVELS.interest[1]}")))`],
          wrong: [
            { formula: `=COUNTIFS(B2:B${last},K1,F2:F${last},"${OFFICE_LEVELS.interest[0]}")`, say: 'That counts only the top box. The top two boxes add “Probably would”.' },
            { formula: `=COUNTIFS(F2:F${last},"${OFFICE_LEVELS.interest[0]}")+COUNTIFS(F2:F${last},"${OFFICE_LEVELS.interest[1]}")`, say: 'That counts every band. Add the condition on column B against K1.' },
            { formula: `=COUNTIFS(B2:B${last},"${B[2]}",F2:F${last},"${OFFICE_LEVELS.interest[0]}")+COUNTIFS(B2:B${last},"${B[2]}",F2:F${last},"${OFFICE_LEVELS.interest[1]}")`, say: `That gives ${top2h[2]} whatever K1 says: the band (or the count) is typed in. Refer to K1.` },
          ],
          solution: `<x>${COUNT_TOP2}</x> gives ${top2h[2]} of the ${nh[2]} large offices; the same formula gives ${top2h[0]} of ${nh[0]} and ${top2h[1]} of ${nh[1]} for the other bands.` },
        { id: 'm04-pj-10', type: 'steps', kind: 'numerical',
          prompt: 'Estimate the share of all offices in the directory whose managers are in the top two boxes. Give percentages to one decimal place.',
          steps: [
            num('m04-pj-10-1', 'Unweighted: the share of the offices that replied.', r(unweightedTop2 * 100, 1), () => (OFFICES.filter(top2).length / OFFICES.length) * 100, '', null, { unit: '%', places: 1, tol: 0.06 }),
            num('m04-pj-10-2', 'Weighted to the directory’s bands (the stratified estimate, Σ (N_h ÷ N) × p_h).', r(strat.p * 100, 1), () => S.stratifiedProportion(byBand.map((x, h) => ({ N: NH[h], n: x.length, x: x.filter(top2).length }))).p * 100, '',
              [{ value: r((sum(top2h.map((k, h) => k / nh[h])) / 3) * 100, 1), say: 'That averages the three bands’ shares equally. Weight each band by its share of the directory’s offices.' }],
              { unit: '%', places: 1, tol: 0.06 }),
            num('m04-pj-10-3', 'The margin of error of the weighted estimate at 95% confidence, in percentage points (stratified standard error with the finite population correction).', r(strat.margin * 100, 1), () => S.stratifiedProportion(byBand.map((x, h) => ({ N: NH[h], n: x.length, x: x.filter(top2).length }))).margin * 100, '',
              [{ value: r(S.marginOfError(unweightedTop2, n) * 100, 1), say: 'That treats the replies as a simple random sample of all offices. The design is stratified with unequal rates: use the stratified standard error.' }, { value: r(marginNoFpc * 100, 1), say: 'That leaves out the finite population correction, 1 − n_h ÷ N_h, which matters here: Ana heard from almost half the large offices.' }],
              { unit: 'points', places: 1, tol: 0.25 }),
          ],
          solution: `Unweighted, ${OFFICES.filter(top2).length} of ${n} = ${pct(unweightedTop2)}. Weighted: ${B.map((b, h) => `${NH[h]}/${NOFF} × ${top2h[h]}/${nh[h]}`).join(' + ')} = ${pct(strat.p)}, lower because the large offices, over-sampled and keener in the replies (${largeTop2} of ${nh[2]} against ${othersTop2} of ${othersN} in the other bands, a gap that on bases this small could be chance), count for only ${NH[2]} of ${NOFF} offices. Standard error ${f(strat.se * 100, 1)} points, so ${pct(strat.p)} ± ${f(strat.margin * 100, 1)} points: somewhere between about ${pct(strat.low, 0)} and ${pct(strat.high, 0)} of offices, a wide range from ${n} replies.` },
        { id: 'm04-pj-11', type: 'formula', kind: 'applied',
          prompt: 'Revenue depends on staff, not offices. Column G holds each reply’s weight (offices it stands for) and H is 1 for the top two boxes. In K4, calculate the weighted share of all staff who work in top-two offices: Σ(weight × staff × top-two) ÷ Σ(weight × staff).',
          sheet: { cells: { ...weightCells, J4: 'Staff share' }, fixed: [`H2:H${last}`] },
          cell: 'K4', view: `A1:K${last}`, maxHeight: '20rem', widths: { B: 16, D: 20, F: 24, J: 14 }, formats: { K4: '0.0%' },
          answer: STAFF_SHARE,
          alt: [`=SUMPRODUCT(G2:G${last}*C2:C${last}*H2:H${last})/SUMPRODUCT(G2:G${last}*C2:C${last})`],
          wrong: [
            { formula: `=SUMPRODUCT(C2:C${last},H2:H${last})/SUM(C2:C${last})`, say: 'That leaves out the weights, so the over-sampled large offices count too much.' },
            { formula: `=SUMPRODUCT(G2:G${last},H2:H${last})/SUM(G2:G${last})`, say: 'That is the weighted share of offices. Multiply by staff as well to get the share of staff.' },
            { formula: `=AVERAGE(H2:H${last})`, say: 'That is the unweighted share of offices that replied.' },
          ],
          solution: `<x>${STAFF_SHARE}</x> = ${pct(staffShareTop2)} of staff work in offices whose manager is in the top two boxes (unweighted, ${pct(staffShareTop2Unw)}; by office, ${pct(strat.p)}). Interest looks higher among large offices (${largeTop2} of ${nh[2]} against ${othersTop2} of ${othersN}), though on bases this small the gap could be chance; that is why it covers a bigger share of staff than of offices.` },
        { id: 'm04-pj-12', type: 'multi', kind: 'conceptual',
          prompt: 'Select every statement the survey supports.',
          options: [
            `Stated interest is likely to overstate sign-ups: “probably would” is a weak signal, so the top-two share is an optimistic reading, not a forecast.`,
            `Weighting by band corrects for the over-sampled large offices, but not for keener managers being likelier to reply within a band.`,
            `About ${pct(strat.p, 0)} of the district’s offices will sign up if Lantern launches at $${PRICE} a member of staff a month.`,
            `Because ${n} offices replied, the estimate is accurate to within about a percentage point either way.`,
            'Large offices matter more to revenue than their number suggests, so their answers deserve a separate look.',
          ],
          answer: [0, 1, 4],
          feedback: {
            2: 'That is the share in the top two boxes, which overstates actual sign-ups; and it carries a margin of about ±10 points.',
            3: `The margin of error is about ±${f(strat.margin * 100, 0)} points: ${n} replies split into three bands is a small sample.`,
          },
          solution: `The survey gives a rough, optimistic reading of interest: weighted, about one office in five is in the top two boxes, give or take ten points, and stated intent tends to overstate behaviour. Weighting fixes the design’s unequal rates, not self-selection within bands. Large offices hold about ${pct(largeStaffShare, 0)} of the staff, the largest share of any band, from under ${Math.ceil((NH[2] / NOFF) * 100)}% of the offices.` },
      ],
    },
    {
      id: 'size', title: 'Size the market',
      html: `<p>Top-down, the Harbour City Statistics Office’s 2026 business register counts ${f(Z.districtStaff10plus)} people working in offices of 10 or more staff in the district. Bottom-up, the directory and the survey give offices and average staff by band. Ana’s planning assumptions turn stated interest into sign-ups: half of “${OFFICE_LEVELS.interest[0]}”, a sixth of “${OFFICE_LEVELS.interest[1]}” and none of the rest. In year one she can install and look after at most ${Z.maxInstallsYear1} offices. The worksheet is the survey again (G the weights, H the top-two flag); use columns J to M for your working.</p>`,
      tool: { kind: 'widget', widget: { type: 'sheet', title: 'Office survey, March 2027', sheet: { cells: weightCells }, view: `A1:M${last}`, editable: `J1:M${last}`, maxHeight: '22rem', widths: { B: 16, D: 20, F: 24 } } },
      items: [
        { id: 'm04-pj-13', type: 'steps', kind: 'numerical',
          prompt: 'Size the market at Lantern’s price.',
          steps: [
            num('m04-pj-13-1', 'Bottom-up, how many staff work in the directory’s offices? Use each band’s offices × the average staff of the band’s replies, and give a whole number.', Math.round(bottomUpStaff), () => sum(NH.map((N, h) => N * meanStaff[h])), '',
              [{ value: Math.round(sum(OFFICES.map((o) => o.staff))), say: 'That adds the staff of the offices that replied. Scale each band up to all its offices.' }],
              { unit: 'staff', places: 0, tol: 30 }),
            num('m04-pj-13-2', 'By what percentage does the bottom-up figure differ from the Statistics Office’s count? Give one decimal place (positive if the bottom-up figure is higher).', r(gapPct, 1), () => (bottomUpStaff / Z.districtStaff10plus - 1) * 100, '',
              [{ value: r((1 - Z.districtStaff10plus / bottomUpStaff) * 100, 1), say: `That divides the gap by the bottom-up figure. Measure it against the Statistics Office’s ${f(Z.districtStaff10plus)}.` }], { unit: '%', places: 1, tol: 0.06 }),
            num('m04-pj-13-3', `TAM: every member of staff in the district’s offices of 10 or more (the Statistics Office’s count) at $${PRICE} a month for a year, in dollars.`, tam, () => Z.districtStaff10plus * PRICE * 12, '',
              [{ value: Z.districtStaff10plus * PRICE, say: 'That is one month. Multiply by 12 for a year.' }],
              { unit: '$', places: 0, tol: 0.5 }),
            num('m04-pj-13-4', 'SAM: staff in offices that already pay for a coffee service the subscription would replace (pod machines, a bean-to-cup machine, or filter or urn), as a weighted share of all staff, times the TAM. Give dollars to the nearest thousand.', r(sam, -3), () => tam * samShare, '',
              [{ value: r(tam * (1 - samShare), -3), say: 'That is the complement: offices with no coffee service, or with coffee bought as part of catering.' }],
              { unit: '$', places: 0, tol: 4000 }),
          ],
          solution: `Bottom-up: ${NH.map((k, h) => `${k} × ${f(meanStaff[h], 2)}`).join(' + ')} ≈ ${f(bottomUpStaff)} staff (from the unrounded means), ${f(gapPct, 1)}% above the register’s ${f(Z.districtStaff10plus)}: close enough that the two routes support each other, given their differences (next question). TAM, in its ceiling form (every potential customer at the offer’s price) = ${f(Z.districtStaff10plus)} × $${PRICE} × 12 = ${usd(tam)} a year. Weighted, ${pct(samShare)} of staff work in offices that already pay for a pod, bean-to-cup or filter service the subscription would replace, so SAM ≈ ${usd(r(sam, -3))}. Offices with no coffee would need a new budget line, and catered offices buy their coffee within a catering contract, so Ana’s definition leaves both out of the SAM: her offer replaces an existing paid coffee service. Catered offices, where the idea came from, are a possible extension once the offer is proven.` },
        { id: 'm04-pj-21', type: 'multi', kind: 'applied',
          prompt: `The bottom-up figure comes out ${f(gapPct, 1)}% above the Statistics Office’s count. Select every reason that could explain a gap in that direction.`,
          options: [
            'The directory may still list offices that have closed, moved away or shrunk below 10 staff since it was compiled',
            'The register’s count is from 2026, a year before the directory and the survey, and offices can have grown since',
            'The average staff of each band come from the offices that replied; if larger offices within a band were likelier to reply, the averages are pushed up',
            'The register is an official statistic, so the directory must be wrong by exactly the size of the gap',
            'The register counts people in every workplace of 10 or more, shops and schools included, so it is the wider measure',
            'Each band’s average comes from a few dozen replies at most, so sampling error in the averages carries into the total',
          ],
          answer: [0, 1, 2, 5],
          feedback: {
            3: 'Official counts have their own definitions, dates and errors. A gap of a few per cent is what two sources built differently would give; neither is exact.',
            4: 'Read the definition: the Statistics Office’s figure counts people in offices of 10 or more staff, the same population as the directory. Were it every workplace, it would be the larger figure, and the comparison would need adjusting.',
          },
          solution: `Both sources measure staff in offices of 10 or more, but by different routes: the register a year earlier; the directory with its frame errors (closed, moved or shrunk offices still listed, new ones missing); and the bottom-up figure through average staff from ${n} replies, with sampling error and perhaps more replies from larger offices. A gap of ${f(gapPct, 1)}% is within what that would give. Check each source’s definition and date before treating either as the truth.` },
        { id: 'm04-pj-14', type: 'steps', kind: 'numerical',
          prompt: 'Estimate the first-year obtainable market (SOM) inside the SAM: count only offices with pod machines, a bean-to-cup machine, or filter or urn, apply Ana’s conversion assumptions, and scale each reply by its weight.',
          steps: [
            num('m04-pj-14-1', 'How many offices would sign up? Give one decimal place.', r(expOffices, 1), () => sum(OFFICES.map((o) => (inSam(o) ? W(o) * Z.conversion[o.interest - 1] : 0))), '',
              [{ value: r(sum(OFFICES.map((o) => (inSam(o) ? Z.conversion[o.interest - 1] : 0))), 1), say: 'That counts only the offices that replied. Each reply stands for its weight in offices.' }, { value: r(wsum((o) => (inSam(o) && top2(o) ? 1 : 0)), 1), say: 'That counts every top-two office as a sign-up. Apply the conversion assumptions: half of “definitely”, a sixth of “probably”.' }, { value: r(wsum((o) => Z.conversion[o.interest - 1]), 1), say: 'That counts every office, including those outside the SAM. The SOM is the part of the SAM Lantern can win.' }],
              { unit: 'offices', places: 1, tol: 0.06 }),
            num('m04-pj-14-2', 'What yearly revenue would those offices bring at full year, in dollars (weighted staff × conversion × $14 × 12)? Give the nearest thousand.', r(somRevenue, -3), () => wsum((o) => (inSam(o) ? o.staff * Z.conversion[o.interest - 1] : 0)) * PRICE * 12, '', null, { unit: '$', places: 0, tol: 500 }),
          ],
          solution: `Within the SAM, weighted sign-ups: Σ weight × conversion = ${f(expOffices, 1)} offices covering ${f(expStaff)} staff, worth ${usd(r(somRevenue, -3))} a year at full year (${pct(somRevenue / sam)} of the SAM). That is within the ${Z.maxInstallsYear1} installations Ana can manage, though large offices may need more than one machine each. The figure leans on the conversion assumptions: if no “probably” converted it would be ${f(expOfficesNoProb, 1)} offices; if a third did, ${f(expOfficesThirdProb, 1)}. Set against the brief, the central estimate, about ${Math.round(expOffices)} offices, is just below the ${STRONG} that Ana’s “strong demand” needs, and the range (about ${Math.round(expOfficesNoProb)} to ${Math.round(expOfficesThirdProb)}) straddles it: on her own figures the survey can’t yet tell strong demand from weak, which is the case for testing first. The SOM also ignores competitors’ lock-ins: offices on Brewline’s 24-month or Daystar’s and Tidemark’s 36-month contracts can’t switch until their contracts end.` },
        { id: 'm04-pj-15', type: 'mc', kind: 'applied',
          prompt: `The SOM rests on three things: the weighted survey shares (±${f(strat.margin * 100, 0)} points), Ana’s conversion assumptions, and the cap of ${Z.maxInstallsYear1} installations. Which is the most useful next step before committing to the launch?`,
          options: [
            'A paid pilot with a handful of offices, to see how many of the interested actually sign and stay',
            'A larger version of the same survey, to narrow the margin of error on stated interest to a few points',
            'A new top-down estimate from national statistics, to replace the district figure in the TAM',
            'More interviews with the office managers who said they definitely would sign up, to confirm their interest',
          ],
          answer: 0,
          feedback: {
            1: 'A bigger survey narrows sampling error but leaves the largest uncertainty, how stated interest turns into contracts, untouched.',
            2: 'The two routes to the market’s size already agree within 4%; the TAM is not what limits the decision.',
            3: 'Interviews explain reasons but can’t measure how many would actually sign, and talking only to enthusiasts is biased.',
          },
          solution: 'The weakest link is behaviour: how many interested offices really sign at $14 a head. A small paid pilot (or a limited launch within the installation cap) measures that directly, tests the service model with large offices, and costs far less than a full launch that goes wrong.' },
      ],
    },
    {
      id: 'competitors', title: 'Read the competition',
      html: `<div class="table-scroll"><table class="data-table study-table"><caption>Office-coffee offers in the district, March 2027 (fictional)</caption><thead><tr><th scope="col">Supplier</th><th scope="col">What it is</th><th scope="col">Price a member of staff a month</th><th scope="col">Minimum contract</th><th scope="col">Repairs</th></tr></thead><tbody>${OFFICE_COMPETITORS.map((c) => `<tr><th scope="row">${c.name}</th><td>${c.what}</td><td class="num">${c.pricePerStaffMonth != null ? `$${c.pricePerStaffMonth}` : `$${c.perCup.toFixed(2)} a cup`}</td><td class="num">${c.contractMonths} months</td><td>${c.service}</td></tr>`).join('')}</tbody></table></div>`,
      items: [
        num('m04-pj-16', `Daystar Vending charges offices $${daystar.perCup.toFixed(2)} a cup. If staff drink ${Z.cupsPerStaffDay} cups each on each of ${Z.workdaysMonth} working days a month, what does Daystar cost a member of staff a month? Give dollars and cents.`, r(daystarMonth, 2),
          () => Z.cupsPerStaffDay * Z.workdaysMonth * daystar.perCup,
          `${Z.cupsPerStaffDay} × ${Z.workdaysMonth} × $${daystar.perCup.toFixed(2)} = $${daystarMonth.toFixed(2)} a member of staff a month, below Lantern’s $${PRICE} and close to Brewline’s $11; but the cost rises with every cup, so busy offices pay more.`,
          [{ value: r(Z.cupsPerStaffDay * daystar.perCup * 30, 2), say: 'That counts 30 days. Offices pay for working days: use 21.' }],
          { unit: '$', places: 2, tol: 0.005, kind: 'applied' }),
        { id: 'm04-pj-17', type: 'classify', kind: 'applied',
          prompt: 'From the table and the interviews, classify each feature of Lantern’s offer.',
          items: [
            'A 12-month minimum contract, against 24 or 36 months elsewhere',
            'The price a member of staff a month, compared with Brewline Office and Daystar',
            'Repairs by the next working day, compared with Tidemark Office’s same-day service',
            'A bean-to-cup machine with no pods, compared with Brewline Office’s pod machines',
          ],
          categories: ['An advantage for Lantern', 'A disadvantage for Lantern'],
          answer: [0, 1, 1, 0],
          feedback: {
            0: 'One manager was stuck in a three-year contract and won’t sign for more than a year: a short contract is a selling point.',
            2: 'Two managers raised reliability (OM2, OM8). Tidemark promises same-day repairs, which is better than Lantern’s next working day.',
          },
          solution: 'Lantern wins on contract length and on doing away with pods (a sustainability point managers raised), and loses on price against pods and vending and on repair speed against Tidemark. Its case to finance has to be value per cup and staff experience, and the repair promise may need strengthening (OM2 and OM8 raised reliability).' },
      ],
    },
    {
      id: 'interviews', title: 'Code the interviews',
      html: `<p>${OFFICE_INTERVIEWS.length} remarks from interviews with ${managers} office managers (anonymised as OM1–OM${managers}). Ana’s codebook has six themes: ${OFFICE_INTERVIEW_THEMES.join(', ').toLowerCase()}.</p>`,
      items: [
        { id: 'm04-pj-18', type: 'classify', kind: 'applied',
          prompt: 'Code each remark to the theme it is mainly about.',
          items: OFFICE_INTERVIEWS.map((q) => `${q.who} (${q.size}): “${q.text}”`),
          categories: OFFICE_INTERVIEW_THEMES,
          answer: OFFICE_INTERVIEWS.map((q) => q.theme),
          feedback: {
            6: 'OM7 talks about price, but as cost compared with what the office spends now: cost.',
            8: 'OM8 talks about queues and needing machines that are looked after: reliability and maintenance.',
            10: 'OM6 mentions the barista visit as a nice thing for staff, while saying it isn’t why they’d buy: staff wellbeing.',
          },
          solution: `Counts by theme: ${OFFICE_INTERVIEW_THEMES.map((t, k) => `${t.toLowerCase()} ${themeCount[k]}`).join(', ')}. Each theme came up twice, so no single concern dominates. Who raised each suggests leads to test, not patterns: reliability from OM2 (120 staff) and OM8 (350, three floors); admin effort from OM5 (25) and OM6 (200).` },
        { id: 'm04-pj-19', type: 'mc', kind: 'conceptual',
          prompt: 'Which conclusion do the interviews support?',
          options: [
            'Reliability and contract length are concerns to address in the offer and to measure in the pilot',
            'A quarter of the district’s offices worry about cost, since 2 of the 8 managers raised it',
            'Office managers don’t care about staff wellbeing, since only two remarks were about it',
            'The interviews show the subscription will succeed, because every manager found something to like',
          ],
          answer: 0,
          feedback: {
            1: 'Eight chosen managers are not a sample from which to estimate shares. Interviews show what matters and why, not how common it is.',
            2: 'Few remarks on a theme don’t show it doesn’t matter; the interviews weren’t designed to count.',
            3: 'Interviews explore reasons; they can’t show success. Several managers also raised reasons not to sign.',
          },
          solution: 'Qualitative interviews explain the reasons behind the numbers and suggest what to test: fast repairs (two machines for large offices), a 12-month contract or a trial month, one invoice and no reordering. How common each concern is would need the survey, or the pilot.' },
      ],
    },
    {
      id: 'memo', title: 'Write Ana’s memo',
      html: '<p>Bring the evidence together for Ana: what to do, how sure she can be, and what the research can’t tell her.</p>',
      items: [
        { id: 'm04-pj-20', type: 'short', kind: 'applied',
          prompt: 'Write Ana a memo of 250–350 words recommending whether to launch the office-coffee subscription now, not launch, or test it first. Give the key figures with their uncertainty, the assumptions they rest on, what the competition and the interviews add, and the next research step.',
          rubric: [
            `Frames the decision and the value of information: launching now has an expected result of only $${f(evLaunch)} on Ana’s figures, perfect information is worth at most $${f(evpi)}, and the research is worth doing because it could change the decision.`,
            `Reports interest correctly: about ${pct(strat.p, 0)} of offices (±${f(strat.margin * 100, 0)} points) in the top two boxes, weighted to the directory; stated intent overstates sign-ups; weighting can’t fix self-selection within bands.`,
            `Sizes the market both ways (about ${f(Math.round(bottomUpStaff / 100) * 100)} staff bottom-up against ${f(Z.districtStaff10plus)} top-down; TAM about ${usd(r(tam / 1e6, 1), 1)} million; SAM about ${usd(r(sam / 1e6, 1), 1)} million) and a first-year SOM of about ${Math.round(expOffices)} offices, noting the installation cap, the conversion assumptions, competitors’ lock-ins, and that the range straddles the ${STRONG} offices of strong demand.`,
            'Uses the competitors and interviews: a short contract and no pods are advantages; price and repair speed are weaknesses; managers’ concerns (cost, reliability, contract terms, admin effort, sustainability) shape the offer and the pilot, as leads to test rather than shares.',
            'Recommends a proportionate next step (a paid pilot or a capped launch) with what to measure, and keeps qualitative findings, stated intent and estimates in their place.',
          ],
          model: `<b>To:</b> Ana · <b>From:</b> analyst · <b>Re:</b> office-coffee subscription<br><br><b>Recommendation.</b> Test before launching: sign a paid pilot with eight to ten offices, including two or three large ones, on 12-month contracts with a trial month.<br><br><b>Why not launch now.</b> On your planning figures, launching now is worth only about $${f(evLaunch)} on average, with a 60% chance of losing $${f(Dn.lossIfWeak)}. Information that could stop a weak launch is worth up to $${f(evpi)}, which is why spending $${f(Dn.researchCost)} on research could be justified: it is a third of that ceiling.<br><br><b>Demand.</b> Weighted to the directory, ${pct(strat.p, 0)} of offices (±${f(strat.margin * 100, 0)} points) say they would definitely or probably sign up at $${PRICE} a head; they employ about ${pct(staffShareTop2, 0)} of staff, since interest looks higher among larger offices (a gap these bases can’t confirm). Stated interest overstates sign-ups: with your conversion assumptions about ${Math.round(expOffices)} offices would sign in year one (between ${Math.round(expOfficesNoProb)} and ${Math.round(expOfficesThirdProb)} on other assumptions), within your cap of ${Z.maxInstallsYear1} installations but just below the ${STRONG} that count as strong demand, with a range that straddles it.<br><br><b>Market.</b> About ${f(Math.round(bottomUpStaff / 100) * 100)} staff work in the district’s offices of 10 or more (the register says ${f(Z.districtStaff10plus)}): a TAM of about ${usd(r(tam / 1e6, 1), 1)} million a year at our price, of which about ${usd(r(sam / 1e6, 1), 1)} million is in offices that already pay for a pod, bean-to-cup or filter service we would replace.<br><br><b>Competition and concerns.</b> Our 12-month contract and pod-free machine are strengths; we cost more than pods and vending, and Tidemark repairs the same day. Managers raised cost, reliability, contract terms, admin effort, sustainability and staff wellbeing, each twice: leads for the pilot to test.<br><br><b>Limits.</b> Seventy-six replies; keener managers may have replied more; office managers answered, but finance often signs; intent is not behaviour; rivals’ 24- and 36-month contracts limit who can switch in year one; the interviews show reasons, not shares.<br><br><b>Next.</b> Measure in the pilot: sign-up rate among interested offices, cups per head, repair calls, and renewals intent at month three.` },
      ],
    },
  ],
  rubric: [
    'The research is framed by the decision, and its value is weighed against its cost before its results are used.',
    'Survey estimates are weighted to the population, reported with their margin of error, and kept apart from forecasts of behaviour.',
    'The market is sized from the top down and the bottom up, with the assumptions behind the SOM stated and tested for sensitivity.',
    'Qualitative findings are used for reasons and hypotheses, not as shares; competitor facts are read from their sources.',
    'The recommendation is proportionate to the evidence and names the next step and what it will measure.',
  ],
  verify() {
    const sh = new Sheet({ cells: { ...surveyCells, K1: B[2], K2: COUNT_TOP2 } });
    const sw = new Sheet({ cells: { ...weightCells, K4: STAFF_SHARE } });
    return [
      ['EV launch', evLaunch, 1200], ['EV perfect information', evPerfect, 19200], ['EVPI', evpi, 18000],
      ['replies by band', nh.join() === '29,28,19' ? 1 : 0, 1], ['proportional allocation', propAlloc.join() === '123,45,12' ? 1 : 0, 1],
      ['weight small', wts[0], 14.138, 0.0005], ['weight large', wts[2], 2.105, 0.0005], ['response rate', n / NINV, 0.4222, 0.00005],
      ['top two, large (COUNTIFS)', sh.get('K2'), top2h[2], 1e-9], ['top two by band', top2h.join() === '6,5,7' ? 1 : 0, 1],
      ['unweighted top two', unweightedTop2, 0.2368, 0.00005], ['stratified top two', strat.p, 0.2106, 0.00005], ['margin', strat.margin, 0.1046, 0.00005],
      ['staff share (SUMPRODUCT)', sw.get('K4'), staffShareTop2, 1e-3], ['staff share', staffShareTop2, 0.2597, 0.00005],
      ['bottom-up staff', bottomUpStaff, 39874.7, 0.05], ['gap %', gapPct, 3.57, 0.005], ['TAM', tam, 6468000], ['SAM share', samShare, 0.7725, 0.00005],
      ['expected offices', expOffices, 18.26, 0.005], ['SOM revenue', somRevenue, 302927, 1], ['SOM inside SAM', somRevenue < sam ? 1 : 0, 1], ['offices if no probably converts', expOfficesNoProb, 7.46, 0.005], ['offices if a third convert', expOfficesThirdProb, 29.06, 0.005],
      ['Daystar a month', daystarMonth, 11.76, 1e-9], ['themes', themeCount.join(), '2,2,2,2,2,2'],
      ['Kish effective n', kishN, 53.86, 0.005], ['margin without fpc', marginNoFpc, 0.1097, 0.00005], ['large offices’ staff share', largeStaffShare, 0.4064, 0.00005],
      ['top two: large / others', `${largeTop2}/${nh[2]} ${othersTop2}/${othersN}`, '7/19 11/57'],
      ['SOM range straddles strong demand', expOfficesNoProb < STRONG && expOfficesThirdProb > STRONG && expOffices < STRONG ? 1 : 0, 1],
      ['TAM shown ($ million)', usd(r(tam / 1e6, 1), 1), '$6.5'], ['SAM shown ($ million)', usd(r(sam / 1e6, 1), 1), '$5.0'],
      ['gap measured on bottom-up', r((1 - Z.districtStaff10plus / bottomUpStaff) * 100, 1), 3.4],
    ];
  },
};
