// qualitative-research.js — M04 · Qualitative research. Content only; exercises are in qualitative-research.ex.js.
// The focus groups, quotations, Ana's codes and the 18-of-20 agreement come from ./case.js (fictional); `checks`
// recompute them. New and fictional here: the screener, the discussion guide, the codebook's wording and which theme the
// second coder chose for the two quotations the coders disagreed on (B4’s free can and A7’s compostable bags). Harborview
// Hotel is B01's fictional hotel; the other businesses are fictional.
import { FOCUS_GROUPS, DEFAULT_PLAN, CHANNELS, CLIENT_INTERVIEWS } from './case.js?v=17';

const FG = FOCUS_GROUPS;
const [GA, GB] = FG.groups;
const T = FG.themes;
const Q = FG.quotes;
const nQ = Q.length;
// the second coder's themes: the same as Ana's except for two quotations (fictional; consistent with 18 of 20)
const DISAGREE = { 2: 1, 14: 2 };                                  // B4’s free can → Price; A7’s compostable bags → Can and label
const coder2 = Q.map((q, i) => (i in DISAGREE ? DISAGREE[i] : q.theme));
const agreed = Q.filter((q, i) => q.theme === coder2[i]).length;
const countBy = (codes) => T.map((_, k) => codes.filter((c) => c === k).length);
const ana = countBy(Q.map((q) => q.theme)), two = countBy(coder2);
const po = agreed / nQ;
const pe = ana.reduce((s, a, k) => s + (a / nQ) * (two[k] / nQ), 0);
const kappa = (po - pe) / (1 - pe);
const byGroup = (g) => T.map((_, k) => Q.filter((q) => q.group === g && q.theme === k).length);
const qa = byGroup('A'), qb = byGroup('B');
const speakers = (k) => new Set(Q.filter((q) => q.theme === k).map((q) => q.who)).size;
const quote = (who, k) => Q.find((q) => q.who === who && (k == null || q.theme === k)).text;
const CH_NAME = { supermarket: 'supermarkets', natural: 'natural and specialty grocers', direct: 'Lantern’s own channel', convenience: 'convenience stores' };
const planned = DEFAULT_PLAN.channels.map((id) => CH_NAME[CHANNELS.find((c) => c.id === id).id]);
const plannedText = `${planned.slice(0, -1).join(', ')} and ${planned[planned.length - 1]}`;

// Harborview Hotel (challenging example): two coders, 50 reviews, "mentions staff" yes or no
const HV = { yy: 3, nn: 40, yn: 4, ny: 3 };
const hvN = HV.yy + HV.nn + HV.yn + HV.ny;
const hvPo = (HV.yy + HV.nn) / hvN;
const hvA = (HV.yy + HV.yn) / hvN, hvB = (HV.yy + HV.ny) / hvN;
const hvPe = hvA * hvB + (1 - hvA) * (1 - hvB);
const hvK = (hvPo - hvPe) / (1 - hvPe);

const W = [380, 330, 280, 230, 180, 130];
const STAGES = [
  ['1 Welcome and ground rules', '5 min', 'Recording and consent, confidentiality,', 'no right or wrong answers'],
  ['2 Coffee away from home', '15 min', '“Tell me about the last coffee', 'you bought when you were out.”'],
  ['3 Ready-to-drink coffee', '20 min', '“What do you buy, and where?”', '“Why that one?”'],
  ['4 The Cold Brew can', '35 min', '“What is your first reaction?”', '“What makes you say that?”'],
  ['5 Summing up', '15 min', '“If you could tell Lantern one thing,', 'what would it be?”'],
];
const FUNNEL = '<svg viewBox="0 0 680 322" xmlns="http://www.w3.org/2000/svg" font-family="inherit" font-size="13">'
  + STAGES.map(([title, mins, l1, l2], i) => {
    const y = 12 + i * 60, a = W[i] / 2, b = W[i + 1] / 2;
    return `<path d="M${200 - a} ${y}H${200 + a}L${200 + b} ${y + 54}H${200 - b}Z" style="fill:none;stroke:var(--series-1);stroke-width:2"/>`
      + `<text x="200" y="${y + 24}" text-anchor="middle" font-weight="700" fill="currentColor"${i === 4 ? ' font-size="12"' : ''}>${title}</text>`
      + `<text x="200" y="${y + 42}" text-anchor="middle" font-size="12" fill="var(--ink-3)">${mins}</text>`
      + `<path d="M${200 + (a + b) / 2 + 6} ${y + 27}H408" style="fill:none;stroke:var(--rule-strong);stroke-width:1;stroke-dasharray:3 3"/>`
      + `<text x="414" y="${y + 23}" font-size="12" fill="currentColor">${l1}</text><text x="414" y="${y + 39}" font-size="12" fill="currentColor">${l2}</text>`;
  }).join('')
  + '</svg>';

export default {
  slug: 'qualitative-research',
  title: 'Qualitative research',
  blurb: 'Surveys count; qualitative research explains. Learn when depth interviews, focus groups and observation fit, how to recruit with a screener and write a discussion guide, how many interviews are enough, and how to code transcripts into themes with a codebook, check that two coders agree and report what people said without turning it into numbers it can’t support.',
  status: 'reviewed',
  objectives: [
    'Explain when qualitative research fits a research objective and what it can’t show, such as the share of a market that holds a view.',
    'Compare depth interviews, focus groups and observation, including group dynamics such as dominant voices and the wish to look good.',
    'Design a screener and a funnel-shaped discussion guide with open questions and neutral probes.',
    'Use evidence on saturation to judge how many interviews or groups a study needs.',
    'Apply a codebook to transcripts, calculate percent agreement and Cohen’s kappa between two coders, and report themes and quotations honestly.',
  ],
  prerequisites: [
    { lesson: 'm04/the-research-process', why: 'Qualitative research is the main tool of exploratory designs, and the research codes govern consent and recording.' },
    { lesson: 'm01/situation-analysis', why: 'Lantern’s twelve client interviews, and their survivorship problem, were first analysed there.' },
    { lesson: 'b03/conditional-sums-and-counts', why: 'The codebook worksheet counts codes with COUNTIFS.' },
  ],
  case: 'lantern',

  concept: [
    { case: `By March 2027 the February survey has closed, and Ana can count how many people on her list say they would buy Cold Brew. The numbers can’t tell her why. Do subscribers like the idea because they like Lantern’s coffee, or because a can is convenient? Would someone who buys ready-to-drink coffee on the way to work notice a new brand at all? For these questions she plans two 90-minute focus groups with a hired moderator: ${GA.participants} subscribers on ${GA.date}, and ${GB.participants} people who buy ready-to-drink coffee at least once a month but have never bought from Lantern on ${GB.date}.` },
    { p: '<g>Qualitative research</g> collects words, actions and images from a small number of deliberately chosen people, to understand what they think, how they talk about it and why. Its output is themes, explanations and the language customers use. <g>Quantitative research</g>, such as a survey of a planned sample or an analysis of sales records, measures how many, how much and how often, and, from a probability sample, can estimate a population’s figures with a margin of error. The two answer different questions, and good projects use both.' },

    { h: 'When qualitative research fits' },
    { list: [
      '<b>Exploring a problem</b> you don’t yet understand well enough to ask precise questions about.',
      '<b>Explaining a result</b>: why a survey score is low, why customers left, why a launch disappointed.',
      '<b>Generating hypotheses</b> for a survey or an experiment to test, and the words to use in its questions.',
      '<b>Testing early reactions</b> to a concept, a name, a pack or an advertisement before money is spent on it.',
      '<b>Understanding a process</b>, such as how a household chooses a supplier or how a school chooses a caterer.',
    ] },
    { p: 'It doesn’t fit questions about how many. Fifteen people chosen to hold particular views can’t say what share of a city’s shoppers would buy a can, however vivid their answers. When the objective says “estimate”, the design is descriptive; qualitative work can only prepare for it or explain its result.' },
    { callout: 'key', title: 'Themes, not shares', html: 'Qualitative findings say what views exist, how people express them and why they hold them. They don’t say how common those views are. “Several participants said the price was high” is a finding; “40% think the price is too high” from a focus group is not.' },

    { h: 'Depth interviews and focus groups' },
    { p: 'A <g>depth interview</g> is a one-to-one conversation, often lasting 30 to 90 minutes, in which an interviewer follows a guide but is free to follow the participant wherever the answers lead. A <g>focus group</g> is a discussion of a topic by a small group of people who meet the study’s requirements, led by a moderator; OpenStax puts the usual size at 8 to 12 people. Lantern’s groups, of 8 and 7, are at the small end of that range or just below it, which gives each participant more time.' },
    { table: {
      caption: 'Depth interviews and focus groups compared',
      head: ['', 'Depth interview', 'Focus group'],
      rows: [
        ['Best for', 'Personal, sensitive or complex topics; one person’s decision from start to finish', 'Reactions to concepts and packs; the words people share; how views form in conversation'],
        ['Depth per person', 'High: an hour of one person’s thinking', 'Lower: 90 minutes shared among the group'],
        ['Effects of the group', 'None', 'Ideas spark ideas, but loud voices dominate and people conform'],
        ['Cost per participant', 'Higher', 'Lower'],
        ['Practicalities', 'Easy to schedule, and works well by phone or video', 'Everyone at one time and place; the client can watch'],
      ],
    } },
    { p: 'The group is a focus group’s strength and its risk. One person’s remark reminds another of something; disagreement sharpens reasons. But OpenStax warns that a group can be overwhelmed by one or two aggressive personalities and that the format can discourage reserved people from speaking up. Two further risks are well known: quieter members may go along with what has been said, and people tend to give the answers that make them look good in front of strangers, a tendency the questionnaire-design lesson meets again as a response style. A skilled moderator asks everyone for a first reaction on paper before the discussion, goes round the room, and invites the quiet participants by name.' },

    { h: 'Observation, ethnography and online communities' },
    { p: 'People can’t always say what they do, so sometimes it is better to watch. OpenStax defines observational research as collecting data based on the actions of those observed: shoppers at a chilled-drinks shelf, say, timed as they look, pick up and read cans, with the store’s permission. <g>Ethnography</g> goes further: the researcher spends time in people’s own settings, such as a commuter’s morning or a family’s breakfast, to understand behaviour in its context. Online research communities, in which a recruited group of customers takes part in discussions, diaries and small tasks over weeks or months, carry the same ideas onto a private website.' },
  ],

  theory: [
    { h: 'Recruiting the right people' },
    { p: 'Qualitative participants are chosen on purpose, not at random: the study needs the kinds of people whose views matter to the decision. Lantern needs two kinds, its own subscribers and the much larger group of ready-to-drink buyers who have never bought from it, and puts each in its own group so that neither shapes the other’s discussion. Ana can invite subscribers from her list; the second group needs an agency, which finds people with a <g>screener</g>: a short questionnaire that decides whether a person qualifies for a study, and for which group, before they are invited.' },
    { p: 'The screener for group B (fictional) shows what a screener does:' },
    { ol: [
      'Age: 18 or over (adults only, so no parental consent is needed).',
      'Bought ready-to-drink coffee at least once in the past month: must say yes.',
      'Which of these coffee brands have you bought in the past year? (Lantern appears in a list of eight, so the screener doesn’t reveal who is asking.) Anyone who has bought Lantern is excluded.',
      'Works, or has a close family member who works, in marketing, market research or the coffee or drinks trade: excluded.',
      'Took part in a group discussion or paid interview in the past six months: excluded, to avoid people who take part for a living.',
      'Where they usually buy ready-to-drink coffee (supermarket, convenience store or petrol station, specialty grocer): the agency recruits a mix.',
    ] },
    { p: 'Recruits are told at recruitment, and again at the start of the session, that it will be recorded and that Lantern’s team may watch; the MRS Code of Conduct (rule 29) requires participants to be informed about any recording, monitoring or observation at recruitment and at the beginning of data collection. They are paid a thank-you for their time, and the agency recruits one or two more than needed, because some people won’t come.' },

    { h: 'The discussion guide' },
    { p: 'A <g>discussion guide</g> is the moderator’s plan for an interview or group: the topics in order, the main questions, any tasks, and the time for each. Most guides follow a funnel, from the general to the specific, so that participants describe their own habits and words before they see anything the client has made. In Lantern’s guide the can appears only after 40 minutes, once everyone has described how and where they buy coffee and which canned brands they know.' },
    { figure: {
      svg: FUNNEL,
      caption: 'Lantern’s 90-minute discussion guide as a funnel (fictional). Each stage narrows the topic; the examples on the right are the opening question and a probe.',
      alt: 'Five stacked shapes forming a funnel that narrows from top to bottom, each labelled with a stage and its length, with an example question to its right. 1, Welcome and ground rules, 5 minutes: recording and consent, confidentiality, no right or wrong answers. 2, Coffee away from home, 15 minutes: “Tell me about the last coffee you bought when you were out.” 3, Ready-to-drink coffee, 20 minutes: “What do you buy, and where?” “Why that one?” 4, The Cold Brew can, 35 minutes: “What is your first reaction?” “What makes you say that?” 5, Summing up, 15 minutes: “If you could tell Lantern one thing, what would it be?”',
    } },
    { p: 'The questions are open (“tell me about…”, “how do you decide…”) and the follow-ups are <g>probes</g>: neutral prompts that ask for more without suggesting an answer, such as “What makes you say that?”, “Can you give me an example?” and “What else?” A leading question (“Wouldn’t a stylish can make you more likely to buy it?”) tells participants what the client hopes to hear, and in a group one agreeable answer can carry the room.' },

    { h: 'How many interviews or groups?' },
    { p: 'Qualitative samples are sized by <g>saturation</g>: the point at which further interviews or groups add no new themes. Two studies give it numbers. Guest, Bunce and Johnson (2006) coded 60 in-depth interviews with women in Ghana and Nigeria in rounds of six and found that saturation occurred within the first twelve interviews, with the basic elements of the main themes present as early as six. They warned that twelve will likely not be enough if the group is relatively heterogeneous or the topic diffuse.' },
    { p: 'Hennink and Kaiser (2022) reviewed 23 articles that tested saturation, 17 of them with empirical data, and found that those studies reached it within 9 to 17 interviews or 4 to 8 focus group discussions, mainly where the participants were similar to one another and the objectives narrow. The practical rule follows: plan enough interviews or groups for each kind of person, watch how many new codes each one adds, and stop when a run of them adds nothing.' },
    { p: `By either standard, Lantern’s design is thin: one group of each kind can’t show that the themes are complete. Its findings are a first map, good for wording the next survey’s questions and for hypotheses, not a full account of what ready-to-drink buyers think. M01’s ${CLIENT_INTERVIEWS.interviewed} catering-client interviews match the twelve within which Guest and colleagues found saturation in their fairly similar group, but they have a different weakness: every interviewee was a current client.` },

    { h: 'From transcripts to themes' },
    { p: 'Analysis starts from transcripts, word-for-word written records of each recording. <g>Coding</g> labels each passage with a code, a short name for what it is about, so that passages on the same idea can be collected and compared. A <g>codebook</g> lists the codes with a definition, a rule for when to use each and when not, and an example, so that different coders, or the same coder on different days, code alike. Lantern’s codebook has six themes:' },
    { table: {
      caption: 'Lantern’s codebook for the Cold Brew focus groups (definitions fictional; quotations from the case)',
      head: ['Theme', 'Use it for', 'Not for', 'Example'],
      rows: [
        [T[0], 'How it would or should taste, freshness, wanting to taste it before buying', 'Whether it is worth the money', `“${quote('A1', 0)}”`],
        [T[1], 'The price, value for money, prices of other brands, offers', 'Free samples given so people can taste it', `“${quote('B2', 1)}”`],
        [T[2], 'The can’s design, standing out on the shelf, what the label shows', 'What the can is made of', `“${quote('B1', 2)}”`],
        [T[3], 'Shops, channels and places where people would expect or want to buy it', 'Comments on price in those places', `“${quote('B3', 3)}”`],
        [T[4], 'Recycling, packaging waste, how the coffee is sourced', 'The can’s look', `“${quote('A4', 4)}”`],
        [T[5], 'Caffeine, sugar, milk, decaf and other health concerns', 'Wanting the label to show them (can and label)', `“${quote('A1', 5)}”`],
      ],
    } },
    { p: 'The method most researchers follow is <g>thematic analysis</g>, set out by Braun and Clarke (2006) in six phases: familiarising yourself with the data, generating initial codes, searching for themes, reviewing themes, defining and naming themes, and producing the report. The phases loop: reviewing the themes often sends the analyst back to the transcripts, and the codebook changes as the analysis develops. A theme is a pattern of meaning across the data, not just a heading; “price” becomes a theme when the analyst can say what people mean by it, for example that paying a dollar more than for the brand they buy now needs a reason.' },

    { h: 'Counting codes honestly' },
    { p: `Counting codes shows where the talk went. In Lantern’s ${nQ} coded quotations, ${ana[1]} are about price and ${ana[3]} about where to buy, and ${speakers(1)} different participants raised price. But the ${nQ} are passages Ana selected and coded from three hours of talk, so counts describe her selection, not a population. The moderator’s guide decided how long each topic was discussed, talkative participants supply more quotations, and the ${GA.participants + GB.participants} participants were chosen, not sampled, so “${ana[1]} of ${nQ} quotations” is not “${(ana[1] / nQ * 100).toFixed(0)}% of buyers”.` },
    { p: 'Report counts, if at all, as what they are (“price came up in both groups, raised by four participants”), and keep percentages for descriptive research. The interesting differences are often between groups: in Lantern’s, subscribers talked about matching Lantern’s coffee and its compostable bags, while the non-customers talked about noticing an unknown brand on a shelf and paying more than they pay now.' },

    { h: 'Do two coders agree?' },
    { p: `<g>Inter-coder agreement</g> is the extent to which two people coding the same material independently assign the same codes. The simplest measure is percent agreement: Ana and a freelance researcher, coding separately, agreed on ${agreed} of the ${nQ} quotations, ${(po * 100).toFixed(0)}%. But two coders would agree on some quotations by chance, and more often when one code dominates.` },
    { p: String.raw`<g>Cohen’s kappa</g>, introduced by Jacob Cohen in 1960, corrects for that: <m>\kappa = (p_o - p_e) \div (1 - p_e)</m>, where <m>p_o</m> is the observed agreement and <m>p_e</m> the agreement expected by chance from how often each coder used each code. The second coder put B4’s remark about a free can under Price and A7’s remark about compostable bags under Can and label (the case records only that the coders agreed on 18 of 20; which two they split on is this lesson’s assumption); with those, <m>p_e = 69 \div 400 \approx 0.17</m> and <m>\kappa = (0.90 - 0.1725) \div (1 - 0.1725) \approx 0.88</m>. McHugh (2012) argues that a kappa below 0.60 shows inadequate agreement.` },
    { p: 'The disagreements matter more than the score. Each is a sign that the codebook is unclear, so the coders discuss them and add a rule: a free can offered so people can taste it belongs under Taste, and a remark about what the can is made of belongs under Sustainability. Both quotations stay where Ana put them, and the codebook above now says why.' },

    { h: 'Reporting what people said' },
    { list: [
      'Choose quotations that represent a theme, and say how widely it was shared and by whom (“raised in both groups”).',
      'Include the views that cut against the main pattern; a report of only the agreeable quotations misleads.',
      'Keep the words as spoken; mark any cut with an ellipsis and never join remarks from different people.',
      'Identify participants only by codes such as A3 or B2, and leave out any detail that could identify them.',
      'State the design next to the findings: who took part, how they were recruited and what the method can’t show.',
    ] },
    { p: 'These are the codes’ honest-reporting rules applied to words: the ICC/ESOMAR code requires that published results are not misleading, and the MRS code that findings are clearly supported by the data.' },
  ],

  formulas: [
    { id: 'qr-percent-agreement', name: 'Percent agreement between two coders',
      tex: String.raw`p_o = \dfrac{a}{n}`,
      where: [
        [String.raw`p_o`, 'Observed agreement: the share of units given the same code by both coders', 'proportion (0 to 1)'],
        [String.raw`a`, 'Units both coders gave the same code', 'units'],
        [String.raw`n`, 'Units coded by both coders', 'units'],
      ],
      assumptions: 'Each unit (a quotation, a passage, a review) gets one code from each coder, working independently.',
      note: 'Easy to read but flattering: two coders agree on some units by chance, more often when one code is common.' },
    { id: 'qr-kappa', name: 'Cohen’s kappa',
      tex: String.raw`\kappa = \dfrac{p_o - p_e}{1 - p_e}, \qquad p_e = \sum_{k} q_{1k} \, q_{2k}`,
      where: [
        [String.raw`\kappa`, 'Agreement beyond chance, as a share of the agreement possible beyond chance', ''],
        [String.raw`p_o`, 'Observed agreement (the percent-agreement formula)', 'proportion'],
        [String.raw`p_e`, 'Agreement expected by chance', 'proportion'],
        [String.raw`q_{1k}`, 'Share of units coder 1 gave code k', 'proportion'],
        [String.raw`q_{2k}`, 'Share of units coder 2 gave code k', 'proportion'],
      ],
      assumptions: 'Two coders, the same units, one code per unit from a fixed list. Kappa is 1 for perfect agreement and 0 for agreement no better than chance.',
      note: 'With a common code, chance agreement is high, so kappa can be modest even when percent agreement looks excellent.' },
  ],

  examples: [
    { level: 'simple', title: 'Interviews, groups or watching?', fictional: true,
      setup: 'Choose a qualitative method for each of three fictional research needs. (a) A software firm wants to know why owners of small accounting practices cancelled its subscription. (b) A garden centre wants reactions to three possible names for a loyalty scheme, and the words customers use about them. (c) A supermarket wants to know how shoppers choose at the chilled-drinks shelf.',
      steps: [
        'Need (a) is about one person’s decision from start to finish, the owners are busy, and some may be embarrassed about why they left. Depth interviews by video, arranged at each owner’s convenience, suit it; a group of competitors’ customers would talk less freely.',
        'Need (b) is about reactions and language, which conversation brings out: one person’s “sounds like a bank” prompts another’s alternative. A focus group or two of regular customers suits it, with each person writing a first reaction before the discussion.',
        'Need (c) is about behaviour people barely notice and can’t report accurately afterwards. Observation at the shelf, with the store’s agreement, shows what they look at and pick up; a short interview after the purchase can then ask why.',
        'Check what none of them can do: none estimates how many cancelled for each reason, how many prefer each name or how often shoppers read labels. Those need a descriptive study afterwards, using the reasons, names and behaviours found here.',
      ],
      answer: '(a) Depth interviews; (b) focus groups; (c) observation, followed by short interviews. Each finds the reasons, words or behaviours; a survey would then measure how common they are.',
      interpretation: 'The choice follows the objective: individual decisions and sensitive topics suit interviews, shared reactions suit groups, and unreflective behaviour suits watching.' },

    { level: 'challenging', title: 'When 86% agreement isn’t good enough', fictional: true,
      setup: `Harborview Hotel (fictional) asks two staff members to code ${hvN} online reviews independently: does the review mention the staff? Both said yes for ${HV.yy} reviews and no for ${HV.nn}; the first coder said yes and the second no for ${HV.yn}; the first said no and the second yes for ${HV.ny}. The manager reads “86% agreement” and wants to use the codes to track complaints about staff. Calculate percent agreement and Cohen’s kappa, and advise.`,
      steps: [
        String.raw`Observed agreement (the percent-agreement formula): <m>p_o = (3 + 40) \div 50 = 0.86</m>.`,
        String.raw`Each coder’s share of “yes”: coder 1 <m>(3 + 4) \div 50 = 0.14</m>; coder 2 <m>(3 + 3) \div 50 = 0.12</m>. So “no” has shares 0.86 and 0.88.`,
        String.raw`Chance agreement adds the products for each code: <m>p_e = 0.14 \times 0.12 + 0.86 \times 0.88 = 0.0168 + 0.7568 = 0.7736</m>. Two coders who said “no” about seven times in eight, at random, would agree about 77% of the time.`,
        String.raw`Kappa: <m>\kappa = (0.86 - 0.7736) \div (1 - 0.7736) = 0.0864 \div 0.2264 \approx 0.38</m>.`,
        'Look at what matters. The codes exist to find mentions of staff, and on those the coders disagree more than they agree: they said “yes” together for 3 reviews and apart for 7. Most of the 86% comes from the easy “no” reviews.',
      ],
      answer: 'Percent agreement is 86%, but Cohen’s kappa is only about 0.38, well below McHugh’s 0.60 threshold for adequate agreement. The codes aren’t reliable enough to track complaints about staff.',
      interpretation: 'High percent agreement on a rare code is mostly agreement on its absence. The fix is the codebook: define what counts as mentioning staff (a name, a role, “the reception”?), recode a fresh sample of reviews, and recalculate kappa before relying on the counts.' },

    { level: 'applied', title: 'What did the Cold Brew groups say?', fictional: true,
      setup: `The transcripts of the two groups are coded. Ana coded ${nQ} quotations to the six themes, and a freelance researcher coded them again independently. The table shows Ana’s codes by group. What can she conclude, and what can’t she?`,
      table: {
        caption: `Quotations coded to each theme, by group (Lantern focus groups, ${GA.date} and ${GB.date}; fictional case)`,
        head: ['Theme', `Group A (${GA.participants} subscribers)`, `Group B (${GB.participants} non-customers)`, 'All'],
        align: ['l', 'r', 'r', 'r'],
        rows: T.map((t, k) => [t, String(qa[k]), String(qb[k]), String(ana[k])]),
        foot: [['Total', String(qa.reduce((a, b) => a + b, 0)), String(qb.reduce((a, b) => a + b, 0)), String(nQ)]],
      },
      steps: [
        `Check the coding first. The coders agreed on ${agreed} of ${nQ} quotations (${(po * 100).toFixed(0)}%), and with the second coder’s two different codes Cohen’s kappa is about ${kappa.toFixed(2)}: good enough to use the themes, after the codebook was clarified for the two disagreements.`,
        `Read the themes across the groups. Every theme came up in both groups. Subscribers framed Cold Brew through Lantern: “${quote('A3', 0)}”, and “${quote('A7', 4)}” Non-customers framed it as an unknown brand on a crowded shelf: “${quote('B1', 2)}”, and “${quote('B4', 0)}”`,
        `Look for hypotheses to test, not conclusions. On price, a non-customer anchored on the brand they buy now: “${quote('B2', 1)}” On where to buy, one non-customer buys at a petrol station, a convenience outlet outside the launch plan’s channels (${plannedText}), and another would look in a health food shop, which the natural and specialty grocers cover. Each is a question for the survey analysis, the price audit and the sizing (Modules 3 and 4), not a finding to act on.`,
        `Say what the groups can’t show. ${GA.participants + GB.participants} chosen people in two groups can’t say how many shoppers share these views, and one group of each kind is too few for saturation. “${ana[1]} of ${nQ} quotations were about price” describes the transcripts, not the market.`,
        'Report honestly: quotations attributed by code (A3, B2), the design and its limits stated next to the findings, and the dissenting views included, such as the subscriber who would pay more for a brand they know, alongside the non-customer who wants a reason to pay a dollar more.',
      ],
      answer: `The six themes are reliable enough to use (90% agreement, kappa about ${kappa.toFixed(2)}). The groups suggest that subscribers judge Cold Brew by Lantern’s coffee and values, while non-customers need a reason to notice it and to pay more than their usual brand, and that some expect to find it where they already buy, in one case a petrol station outside the planned channels. These are hypotheses for the survey analysis and the sizing to test, not shares of the market.`,
      interpretation: 'The groups did what exploratory research does: they produced explanations, hypotheses and customers’ own words. Turning them into a decision needs the quantitative evidence, which the rest of the course brings together.' },
  ],

  demo: [
    { widget: 'qr-codebook', intro: 'The 20 coded quotations, with Ana’s theme and the second coder’s side by side. Build the table of codes by theme and group in H1:K7 with COUNTIFS, then calculate the percent agreement in I9. Change one of the second coder’s codes and watch the agreement move.' },
    { widget: 'qr-saturation', intro: 'Sixteen depth interviews from a fictional study of people who stopped paying for a language-learning app. For each interview, one bar shows how many new codes it added and the other how many distinct codes had been found so far. Where would you have stopped?' },
  ],

  mistakes: [
    { title: '“Most of the focus group liked it, so most customers will.”', html: 'A focus group is a handful of people chosen on purpose and talking to one another, so neither its make-up nor its answers stand for a population. Use it to find reasons and hypotheses, and measure how common they are with a descriptive survey.' },
    { title: '“Four of the twenty quotations were about price: 20%.”', html: 'Code counts describe the transcripts: how long the guide spent on each topic and who talked most. They can show where the discussion went, but turning them into percentages invites readers to treat them as shares of a market.' },
    { title: '“Two groups were enough; we heard the same things twice.”', html: 'Saturation is judged within each kind of participant, by whether new interviews or groups add new themes. Evidence suggests 9 to 17 interviews or 4 to 8 groups for fairly similar participants and narrow objectives; one group per kind can’t show saturation.' },
    { title: '“Our coders agree 90% of the time, so the codes are reliable.”', html: 'Percent agreement includes agreement by chance, which is high when one code dominates. Report Cohen’s kappa as well, and read the disagreements: they show where the codebook needs a clearer rule.' },
    { title: '“Ask them straight out whether they’d buy our cold brew.”', html: 'Opening with the client’s product, or with a leading question, tells participants what you want to hear and stops them describing their own habits in their own words. Funnel from the general to the specific, ask open questions and probe neutrally.' },
    { title: '“Pick the best quotes for the report.”', html: 'Choosing only the most quotable or the most flattering remarks misleads as surely as a truncated chart. Pick quotations that represent each theme, say how widely it was shared, include the dissenting views, and never join remarks from different people.' },
  ],

  application: [
    { case: 'A fictional regional building society is redesigning how first-time buyers apply for a mortgage online. Its insight manager runs the qualitative stage before any survey.' },
    { p: '<b>She chooses depth interviews.</b> Borrowing is private, and couples often disagree about it, so she runs twelve one-to-one video interviews with people who started an application in the last three months, six who finished it and six who gave up. A screener, run by a recruitment agency, checks that each person applied for a first home and doesn’t work in financial services; recruits are told at the outset that the interviews will be recorded and that a designer from the society may watch.' },
    { p: '<b>Her guide is a funnel.</b> It starts with the search for a home, moves to how they found out about mortgages and only then to the society’s application, which participants share on screen and talk through. The probes are neutral: “What were you expecting to happen there?” “What did you do next?”' },
    { p: '<b>She codes as she goes.</b> After each interview a colleague and she code the transcript; by the ninth, no new codes appear, and the last three add nothing, so she stops at twelve. A second coder recodes four transcripts: percent agreement is 88%, but kappa is 0.71, and their disagreements reveal one muddled code (“confusing” covered both jargon and missing information), which they split into two.' },
    { p: '<b>She reports themes, not percentages.</b> The strongest theme is that applicants who gave up hit the request for documents they didn’t have to hand, with no way to save the application and return. She reports it with three quotations, one from a participant who didn’t mind the documents at all, and recommends a quick survey of all recent applicants to measure how many abandoned at that step, and an A/B test of a “save and finish later” button to see whether it works. Qualitative work found the problem; quantitative work will size it and test the fix.' },
  ],

  summary: [
    'Qualitative research explains: it finds the views people hold, the words they use and why. It can’t estimate how common a view is; that needs descriptive research.',
    'Depth interviews suit personal, sensitive or complex topics; focus groups suit reactions and shared language but bring dominant voices, conformity and the wish to look good; observation and ethnography show behaviour people can’t report.',
    'Participants are chosen on purpose with a screener, which also excludes people from the industry and those who take part too often; they are told about recording when recruited.',
    'A discussion guide funnels from the general to the specific, with open questions and neutral probes; the client’s product comes late.',
    'Size samples by saturation: studies suggest 9 to 17 interviews or 4 to 8 groups for fairly similar participants and narrow objectives, and more for varied groups.',
    'Analyse with a codebook and thematic analysis. Counts of codes describe transcripts, not populations.',
    'Check coding with percent agreement and Cohen’s kappa, κ = (p_o − p_e) ÷ (1 − p_e), and use the disagreements to improve the codebook. Report representative quotations, dissent included, with participants identified only by codes.',
  ],

  glossary: [
    { term: 'Qualitative research', def: 'Research that collects words, actions and images from a small number of deliberately chosen people, to understand what they think, how they talk about it and why. Its output is themes and explanations, not estimates for a population.' },
    { term: 'Quantitative research', def: 'Research that measures how many, how much and how often, such as a survey of a planned sample or an analysis of records, and, from a probability sample, can estimate a population’s figures with a margin of error.' },
    { term: 'Depth interview', def: 'A one-to-one research conversation, often 30 to 90 minutes long, in which the interviewer follows a guide but is free to follow the participant’s answers.' },
    { term: 'Focus group', def: 'A discussion of a topic by a small group of people who meet a study’s requirements, led by a moderator who follows a discussion guide.' },
    { term: 'Ethnography', def: 'Research in which the researcher spends time in people’s own settings, observing and talking with them, to understand behaviour in its context.' },
    { term: 'Screener', def: 'A short questionnaire used before a study to decide whether a person qualifies to take part, and in which group.' },
    { term: 'Discussion guide', def: 'The moderator’s or interviewer’s plan for a qualitative session: the topics in order, the main questions, any tasks and the time for each.' },
    { term: 'Probe', def: 'A neutral follow-up prompt in an interview or group, such as “What makes you say that?”, that asks for more without suggesting an answer.' },
    { term: 'Saturation', def: 'In qualitative research, the point at which further interviews or groups add no new themes or codes.' },
    { term: 'Coding', def: 'In qualitative analysis, labelling passages of transcripts with codes, short names for what each passage is about, so that passages on the same idea can be collected and compared.' },
    { term: 'Codebook', def: 'The list of codes used in a qualitative analysis, each with a definition, rules for when to use it and when not, and an example.' },
    { term: 'Thematic analysis', def: 'A method for finding, reviewing and reporting patterns of meaning (themes) in qualitative data, set out by Braun and Clarke (2006) in six phases.' },
    { term: 'Inter-coder agreement', def: 'The extent to which two or more people coding the same material independently assign the same codes, measured by percent agreement or Cohen’s kappa.' },
    { term: 'Cohen’s kappa', def: 'A measure of agreement between two coders that corrects for agreement expected by chance: (observed agreement − chance agreement) ÷ (1 − chance agreement).' },
  ],

  references: [
    { text: 'Gomez Albrecht, M., Green, M. &amp; Hoffman, L. (2023). <i>Principles of Marketing</i>, section 6.3 “Steps in a Successful Marketing Research Plan” (focus groups, in-depth interviews, observational and ethnographic research). OpenStax.', url: 'https://openstax.org/books/principles-marketing/pages/6-3-steps-in-a-successful-marketing-research-plan', checked: '2026-10-24' },
    { text: 'Guest, G., Bunce, A. &amp; Johnson, L. (2006). How many interviews are enough? An experiment with data saturation and variability. <i>Field Methods</i>, 18(1), 59–82. doi:10.1177/1525822X05279903', url: 'https://socthesis.fas.harvard.edu/file_url/134', checked: '2026-10-24' },
    { text: 'Hennink, M. &amp; Kaiser, B. N. (2022). Sample sizes for saturation in qualitative research: a systematic review of empirical tests. <i>Social Science &amp; Medicine</i>, 292, 114523. The findings are taken from the abstract.', url: 'https://pubmed.ncbi.nlm.nih.gov/34785096/', checked: '2026-10-24' },
    { text: 'Braun, V. &amp; Clarke, V. (2006). Using thematic analysis in psychology. <i>Qualitative Research in Psychology</i>, 3(2), 77–101. doi:10.1191/1478088706qp063oa. The record and abstract were consulted; the phase names were checked against a published reproduction of the paper’s table of phases.', url: 'https://uwe-repository.worktribe.com/output/1043060/using-thematic-analysis-in-psychology', checked: '2026-10-24' },
    { text: 'McHugh, M. L. (2012). Interrater reliability: the kappa statistic. <i>Biochemia Medica</i>, 22(3), 276–282. doi:10.11613/BM.2012.031', url: 'https://biochemia-medica.com/en/journal/22/3/10.11613/BM.2012.031/fullArticle', checked: '2026-10-24' },
    { text: 'Market Research Society (2023). <i>MRS Code of Conduct</i>. Rule 29 (informing participants about recording and observation) and rules 61–62 (reporting).', url: 'https://www.mrs.org.uk/pdf/MRS-code-of-conduct-2023.pdf', checked: '2026-10-24' },
  ],

  checks: [
    // case facts
    { what: 'Group A participants', value: GA.participants, shown: 8 },
    { what: 'Group B participants', value: GB.participants, shown: 7 },
    { what: 'Participants in all', value: GA.participants + GB.participants, shown: 15 },
    { what: 'Group length (minutes, case.js)', value: 90, shown: 90 },
    { what: 'Hours of talk in two groups', value: 2 * 90 / 60, shown: 3 },
    { what: 'Quotations coded', value: nQ, shown: 20 },
    { what: 'Coders agreed (case.js)', value: FG.coderAgreement.agreed, shown: 18 },
    { what: 'Agreement recomputed from the codes', value: agreed, shown: FG.coderAgreement.agreed },
    { what: 'Percent agreement %', value: po * 100, shown: 90 },
    { what: 'Quotations on price', value: ana[1], shown: 4 },
    { what: 'Quotations on where to buy', value: ana[3], shown: 4 },
    { what: 'Participants raising price', value: speakers(1), shown: 4 },
    { what: 'Price quotations as a share of all (the misleading 20%)', value: ana[1] / nQ * 100, shown: 20 },
    { what: 'Group A total', value: qa.reduce((a, b) => a + b, 0), shown: 10 },
    { what: 'Group B total', value: qb.reduce((a, b) => a + b, 0), shown: 10 },
    { what: 'Theme counts match case DERIVED', value: Number(ana.join() === '3,4,3,4,3,3'), shown: 1 },
    { what: 'Every theme in both groups', value: Number(qa.every((x) => x > 0) && qb.every((x) => x > 0)), shown: 1 },
    { what: 'Client interviews (M01)', value: CLIENT_INTERVIEWS.interviewed, shown: 12 },
    { what: 'Typical focus group, low (OpenStax)', value: 8, shown: 8 },
    { what: 'Typical focus group, high (OpenStax)', value: 12, shown: 12 },
    // kappa for Lantern
    { what: 'Chance agreement numerator', value: ana.reduce((s, a, k) => s + a * two[k], 0), shown: 69 },
    { what: 'Chance agreement denominator', value: nQ * nQ, shown: 400 },
    { what: 'Chance agreement p_e', value: pe, shown: 0.1725 },
    { what: 'Chance agreement p_e (two decimals)', value: pe, shown: 0.17, tol: 0.005 },
    { what: 'Kappa', value: kappa, shown: 0.88, tol: 0.005 },
    { what: 'p_o as decimal', value: po, shown: 0.9 },
    // saturation evidence (verified)
    { what: 'Guest et al.: interviews', value: 60, shown: 60 },
    { what: 'Guest et al.: saturation within', value: 12, shown: 12 },
    { what: 'Guest et al.: basic elements by', value: 6, shown: 6 },
    { what: 'Hennink & Kaiser: articles', value: 23, shown: 23 },
    { what: 'Hennink & Kaiser: empirical', value: 17, shown: 17 },
    { what: 'Hennink & Kaiser: interviews low–high', value: 9 + 17, shown: 26 },
    { what: 'Hennink & Kaiser: groups low–high', value: 4 + 8, shown: 12 },
    { what: 'Braun & Clarke phases', value: 6, shown: 6 },
    { what: 'Cohen year', value: 1960, shown: 1960 },
    { what: 'McHugh threshold', value: 0.6, shown: 0.6 },
    // discussion guide
    { what: 'Guide minutes add to 90', value: 5 + 15 + 20 + 35 + 15, shown: 90 },
    { what: 'Can appears after (minutes)', value: 5 + 15 + 20, shown: 40 },
    { what: 'Screener: brands in the list', value: 8, shown: 8 },
    { what: 'Screener: months since last group', value: 6, shown: 6 },
    { what: 'Screener: minimum age', value: 18, shown: 18 },
    // Harborview
    { what: 'Harborview: reviews', value: hvN, shown: 50 },
    { what: 'Harborview: p_o', value: hvPo, shown: 0.86 },
    { what: 'Harborview: coder 1 yes', value: hvA, shown: 0.14 },
    { what: 'Harborview: coder 2 yes', value: hvB, shown: 0.12 },
    { what: 'Harborview: coder 1 no', value: 1 - hvA, shown: 0.86 },
    { what: 'Harborview: coder 2 no', value: 1 - hvB, shown: 0.88 },
    { what: 'Harborview: yes×yes', value: hvA * hvB, shown: 0.0168 },
    { what: 'Harborview: no×no', value: (1 - hvA) * (1 - hvB), shown: 0.7568 },
    { what: 'Harborview: p_e', value: hvPe, shown: 0.7736 },
    { what: 'Harborview: chance agreement about 77%', value: hvPe * 100, shown: 77, tol: 0.5 },
    { what: 'Harborview: kappa numerator', value: hvPo - hvPe, shown: 0.0864 },
    { what: 'Harborview: kappa denominator', value: 1 - hvPe, shown: 0.2264 },
    { what: 'Harborview: kappa', value: hvK, shown: 0.38, tol: 0.005 },
    { what: 'Harborview: yes together', value: HV.yy, shown: 3 },
    { what: 'Harborview: yes apart', value: HV.yn + HV.ny, shown: 7 },
    // application (fictional)
    { what: 'Building society: interviews', value: 6 + 6, shown: 12 },
    { what: 'Building society: last three add nothing', value: 12 - 9, shown: 3 },
    { what: 'Building society: transcripts recoded', value: 4, shown: 4 },
    { what: 'Building society: agreement %', value: 88, shown: 88 },
    { what: 'Building society: kappa', value: 0.71, shown: 0.71 },
    { what: 'Building society: quotations reported', value: 3, shown: 3 },
  ],
};
