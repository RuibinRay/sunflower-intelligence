// questionnaire-design.js — M04 · Questionnaire design. Content only; exercises are in questionnaire-design.ex.js.
// Lantern's February 2027 questions come from case.js (SURVEY_2027). Ana's first draft, its pretest and every other
// business here (Tamberlake Gyms, Marrowby Buses) are fictional. Pew Research Center, Krosnick & Presser (2010), the
// U.S. Census Bureau, OpenStax and Reichheld (2003) are cited for real findings; their figures are checked below.
// Analysing the answers (frequencies, top box, the Net Promoter Score and its standard error) is module 4's.
import { SURVEY_2027 } from './case.js?v=16';

const Q = SURVEY_2027.questions;
const DRAFT = 12, AFTER_REVIEW = 7, FINAL = Q.length;        // Ana's draft, after her review, after the pretest
const DROPPED = 3, MERGED = 2;                                // review: three questions dropped, two pairs merged
const PRETEST = { people: 5, unsureRtd: 2 };
// Brindlecombe Garden Centre (fictional): a three-item "expert advice" scale piloted with six members (1–5 codes)
const ADV = [[4, 4, 4], [2, 2, 3], [5, 4, 4], [4, 3, 3], [2, 3, 1], [4, 2, 3]];
const varS = (xs) => { const m = xs.reduce((a, b) => a + b, 0) / xs.length; return xs.reduce((a, b) => a + (b - m) ** 2, 0) / (xs.length - 1); };
const ADV_ITEM = [0, 1, 2].map((j) => ADV.map((r) => r[j])), ADV_TOT = ADV.map((r) => r[0] + r[1] + r[2]);
const ADV_IV = ADV_ITEM.map(varS), ADV_TV = varS(ADV_TOT), ADV_K = 3;
const ADV_ALPHA = ADV_K / (ADV_K - 1) * (1 - ADV_IV.reduce((a, b) => a + b, 0) / ADV_TV);
// the Saltreed scale in the qd-likert widget (item 3 reverse-worded): alpha with and without reversing
const FEST = [[4, 4, 2, 5], [5, 4, 1, 5], [2, 3, 4, 3], [3, 3, 3, 4], [4, 5, 2, 4], [1, 2, 5, 2], [4, 3, 3, 4], [4, 4, 2, 4]];
const festAlpha = (rev) => { const X = FEST.map((r) => [r[0], r[1], rev ? 6 - r[2] : r[2], r[3]]); const iv = [0, 1, 2, 3].map((j) => varS(X.map((r) => r[j]))); return 4 / 3 * (1 - iv.reduce((a, b) => a + b, 0) / varS(X.map((r) => r[0] + r[1] + r[2] + r[3]))); };

// ---------------------------------------------------------------- figure: five rating formats
const box = (x, y, w, h, l1, l2 = '') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="5" style="fill:none;stroke:var(--series-1);stroke-width:1.5"/>`
  + `<text x="${x + w / 2}" y="${y + (l2 ? 14 : 21)}" text-anchor="middle" font-size="11" fill="currentColor">${l1}</text>`
  + (l2 ? `<text x="${x + w / 2}" y="${y + 27}" text-anchor="middle" font-size="11" fill="currentColor">${l2}</text>` : '');
const label = (y, t, a, b = '') => `<text x="16" y="${y}" font-weight="700" fill="currentColor">${t}</text>`
  + `<text x="16" y="${y + 18}" font-size="12" fill="var(--ink-3)">${a}</text>`
  + (b ? `<text x="16" y="${y + 34}" font-size="12" fill="var(--ink-3)">${b}</text>` : '');
const five = (y, labels) => labels.map(([a, b], i) => box(230 + i * 86, y, 80, 34, a, b)).join('');
const SCALES = '<svg viewBox="0 0 680 430" xmlns="http://www.w3.org/2000/svg" font-family="inherit" font-size="13">'
  // Likert item
  + label(30, 'Likert item', 'agree or disagree', 'with a statement')
  + '<text x="230" y="26" font-size="12" font-style="italic" fill="currentColor">“Lantern’s coffee is good value for money.”</text>'
  + five(36, [['Strongly', 'disagree'], ['Disagree'], ['Neither agree', 'nor disagree'], ['Agree'], ['Strongly', 'agree']])
  // semantic differential
  + label(112, 'Semantic', 'differential: opposite', 'adjectives, 7 points')
  + '<text x="230" y="108" font-size="12" font-style="italic" fill="currentColor">Lantern is …</text>'
  + '<text x="230" y="136" font-size="12" fill="currentColor">Ordinary</text>'
  + [0, 1, 2, 3, 4, 5, 6].map((i) => `<circle cx="${318 + i * 40}" cy="132" r="9" style="fill:none;stroke:var(--series-1);stroke-width:1.5"/>`).join('')
  + '<text x="584" y="136" font-size="12" fill="currentColor">Distinctive</text>'
  // numeric rating: the Net Promoter question
  + label(186, 'Numeric rating', '0 to 10: the Net', 'Promoter question')
  + '<text x="230" y="182" font-size="12" font-style="italic" fill="currentColor">How likely are you to recommend Lantern to a friend or colleague?</text>'
  + Array.from({ length: 11 }, (_, i) => `<rect x="${230 + i * 39}" y="192" width="34" height="26" rx="4" style="fill:none;stroke:var(--series-${i <= 6 ? 2 : i <= 8 ? 3 : 1});stroke-width:1.5"/><text x="${247 + i * 39}" y="210" text-anchor="middle" font-size="12" fill="currentColor">${i}</text>`).join('')
  + '<path d="M230 226V232H498V226M503 226V232H576V226M581 226V232H654V226" style="fill:none;stroke:var(--rule-strong);stroke-width:1.2"/>'
  + '<text x="364" y="248" text-anchor="middle" font-size="11" fill="currentColor">Detractors (0–6)</text>'
  + '<text x="540" y="248" text-anchor="middle" font-size="11" fill="currentColor">Passives</text><text x="540" y="262" text-anchor="middle" font-size="11" fill="currentColor">(7–8)</text>'
  + '<text x="617" y="248" text-anchor="middle" font-size="11" fill="currentColor">Promoters</text><text x="617" y="262" text-anchor="middle" font-size="11" fill="currentColor">(9–10)</text>'
  // purchase intent
  + label(296, 'Purchase intent', 'five verbal points,', 'best first')
  + five(286, [['Definitely', 'would buy'], ['Probably', 'would buy'], ['Might or', 'might not'], ['Probably', 'would not'], ['Definitely', 'would not']])
  // ranking
  + label(366, 'Ranking', 'put the options', 'in order')
  + '<text x="230" y="362" font-size="12" font-style="italic" fill="currentColor">Rank from 1 (matters most) to 4 (matters least):</text>'
  + [['Taste', 230], ['Price', 330], ['Where to buy', 430], ['The can', 570]].map(([t, x]) => `<rect x="${x}" y="374" width="20" height="20" rx="3" style="fill:none;stroke:var(--series-1);stroke-width:1.5"/><text x="${x + 28}" y="389" font-size="12" fill="currentColor">${t}</text>`).join('')
  + '</svg>';

export default {
  slug: 'questionnaire-design',
  title: 'Questionnaire design',
  blurb: 'A survey can only be as good as its questions. Turn research objectives into questions that each earn their place, choose the right question types and rating scales, write options and wording that don’t push answers, guard against response styles and order effects, and pretest the result before anyone sees it, and check that multi-item scales are reliable and valid.',
  status: 'reviewed',
  objectives: [
    'Write survey questions from research objectives, justifying each by the analysis and decision it serves, and plan a questionnaire’s flow, screening and routing.',
    'Choose among open, closed, dichotomous, multiple-choice, ranking and rating questions, and among Likert, semantic differential, numeric, purchase-intent and Net Promoter scales, stating the level of measurement and the analysis each allows.',
    'Write response options that are mutually exclusive and exhaustive, and identify and fix leading, loaded, double-barrelled, ambiguous, double-negative, jargon-laden, recall and sensitive questions.',
    'Explain acquiescence, social desirability, extreme and midpoint responding, question-order effects and primacy and recency, and reduce them by design.',
    'Plan a pretest with cognitive interviews, and compare web, telephone and face-to-face modes in outline.',
    'Assess a multi-item scale’s reliability (test–retest, and internal consistency with Cronbach’s alpha) and the evidence for its validity (content, construct and criterion).',
  ],
  prerequisites: [
    { lesson: 'b01/data-collection', why: 'Pew’s basic rules for survey questions (one thing at a time, no leading wording, balanced scales, pretesting) and the table of weak and better questions are taken as read here.' },
    { lesson: 'b01/data-types', why: 'Levels of measurement (nominal, ordinal, interval, ratio) decide what you can calculate from each answer.' },
    { lesson: 'm04/the-research-process', why: 'Questions are written to answer research objectives, so you need the objectives first.' },
  ],
  case: 'lantern',

  concept: [
    { case: `In January 2027, while she wrote her research brief, Ana drafted the questionnaire for the customer survey that B04’s project planned. The brief (see The research process) names two decisions, whether and how to launch Cold Brew and where to focus Lantern’s 2027 marketing, and gives the survey three objectives: the share of the list who would buy Cold Brew, how likely people are to recommend Lantern, and how they buy coffee, found Lantern and think it could improve. Her first draft ran to twelve questions. The questionnaire that went out on ${SURVEY_2027.sent} had six, and most of this lesson is in the difference.` },

    { h: 'From objectives to questions' },
    { p: 'A <g>questionnaire</g> is a fixed set of questions asked in the same words and order of everyone, with answers recorded in a fixed form, so that one person’s answers can be counted alongside another’s. Writing one starts from the <g>research objective</g>s, not from a blank page. For every question, name the objective it serves, the table or figure you will make from the answers and the decision that figure could change. If you can’t, the question doesn’t earn its place.' },
    { p: 'Questions that nobody will analyse are not harmless. They lengthen the questionnaire, which tires respondents and lowers the quality of the answers that matter. Personal questions that serve no purpose also break the principle of <g>data minimisation</g>. And every extra question is one more chance for a badly worded item to mislead.' },
    { table: {
      caption: 'Lantern’s February 2027 questionnaire: each question and the job it does',
      head: ['Question (as sent)', 'Survey objective it serves', 'How the answers will be used'],
      rows: [
        [`<b>${Q[0].id}</b> ${Q[0].text} (${Q[0].scale})`, '2: recommending Lantern', 'The Net Promoter Score, overall and by segment; a figure to track in later surveys'],
        [`<b>${Q[1].id}</b> ${Q[1].text}`, '1: interest in Cold Brew', 'Shares in the top one and two boxes, overall (weighted) against the brief’s <g>action standard</g>, and by segment; an input to market sizing'],
        [`<b>${Q[2].id}</b> ${Q[2].text}`, '3: buying coffee out', 'How much coffee each segment buys away from home; mean and median'],
        [`<b>${Q[3].id}</b> ${Q[3].text}`, '3: how people found Lantern', 'Which routes bring people in, to weigh marketing effort'],
        [`<b>${Q[4].id}</b> ${Q[4].text}`, 'All three (profile)', 'Who replied, and whether answers differ by age'],
        [`<b>${Q[5].id}</b> ${Q[5].text}`, '3: what to improve', 'Coded into themes and counted'],
      ],
    } },
    { p: 'One thing is missing on purpose: nobody is asked whether they are a subscriber, a shop customer, a workshop participant or a newsletter reader. Lantern’s mailing list already records it, so the survey tool attaches it to each reply. Ask only what you can’t learn another way.' },

    { h: 'Kinds of question' },
    { p: 'An <g>open question</g> lets people answer in their own words, as Q6 does; a <g>closed question</g> asks them to choose from a list. Closed questions come in four common forms. A <g>dichotomous question</g> offers two answers (yes or no). A <g>multiple-choice question</g> offers a list and asks for one answer, or for all that apply. A <g>ranking question</g> asks people to put options in order, and a <g>rating scale</g> asks them to place a judgement on a set of ordered points.' },
    { p: 'The list in a closed question is not neutral: it reminds people of some answers and hides others. Pew Research Center asked one sample in 2008 which issue mattered most in their presidential vote, with five options listed, and another sample the same question with no list. With the list, 58% chose the economy and only 8% gave an answer outside the five. Without it, 35% named the economy and 43% gave an answer that wasn’t on the list. Pew notes that researchers sometimes pilot an open version and build the closed list from the commonest answers.' },
    { p: 'Open questions have two other uses. They suit amounts: Krosnick and Presser’s review of the research finds open questions usually preferable to closed ones for measuring quantities, because the ranges in a closed list can themselves bias answers, which is why Q3 asks for a number. And they collect reasons and ideas nobody thought to list, at the price of <g>coding</g> the answers into themes before they can be counted.' },

    { h: 'Rating scales' },
    { p: 'Most marketing questionnaires measure attitudes with a handful of standard formats, shown in the figure.' },
    { define: [
      ['<g>Likert item</g>', 'A statement with five (sometimes seven) ordered answers from “strongly disagree” to “strongly agree”, named after the psychologist Rensis Likert.'],
      ['<g>Likert scale</g>', 'Several Likert items about one attitude, scored and averaged (or summed) into one number. Some items are worded in the opposite direction and reverse-coded before averaging.'],
      ['<g>Semantic differential</g>', 'A row of points, usually seven, between two opposite adjectives (ordinary … distinctive), on which people place a brand or product.'],
      ['Numeric rating scale', 'A question answered with a number on a stated range, such as 0 to 10, with only the ends labelled.'],
      ['<g>Purchase-intent scale</g>', 'A question about how likely people are to buy a described product, on verbal points from “definitely would buy” to “definitely would not buy”. Lantern’s Q2 is one.'],
      ['Net Promoter question', 'Reichheld’s (2003) question, “How likely is it that you would recommend [company X] to a friend or colleague?”, on a 0 to 10 scale. Bain’s Net Promoter site now gives it as “How likely are you to recommend us to a friend or colleague?”, the form Lantern’s Q1 follows.'],
    ] },
    { figure: {
      svg: SCALES,
      caption: 'Five ways to ask for a judgement. The Net Promoter question groups the eleven points into detractors, passives and promoters; the other formats keep every point.',
      alt: 'Five rows, each showing one question format with a mock-up of its answer options. Row 1, Likert item: the statement “Lantern’s coffee is good value for money.” above five boxes labelled Strongly disagree, Disagree, Neither agree nor disagree, Agree and Strongly agree. Row 2, semantic differential: “Lantern is …” with seven empty circles between the words Ordinary on the left and Distinctive on the right. Row 3, numeric rating, the Net Promoter question: “How likely are you to recommend Lantern to a friend or colleague?” above eleven boxes numbered 0 to 10; a bracket under boxes 0 to 6 is labelled Detractors (0–6), under 7 and 8 Passives (7–8), and under 9 and 10 Promoters (9–10). Row 4, purchase intent: five boxes labelled Definitely would buy, Probably would buy, Might or might not, Probably would not and Definitely would not. Row 5, ranking: “Rank from 1 (matters most) to 4 (matters least):” followed by four small empty boxes labelled Taste, Price, Where to buy and The can.',
    } },
    { p: String.raw`The Net Promoter question is worth knowing exactly, because so many firms track it. Reichheld (2003) calls people who answer 9 or 10 promoters, 7 or 8 “passively satisfied” (usually shortened to passives) and 0 to 6 detractors. The <g>Net Promoter Score</g> is the percentage of promoters minus the percentage of detractors, so it runs from −100 to +100. Calculating it, and its uncertainty, is the subject of module 4; here the point is that the score throws away the difference between a 0 and a 6, so keep to the standard wording if you want to compare with anyone else’s: Reichheld’s, or the close variant Bain gives today, which Lantern’s Q1 follows. Bain defines the three groups in the same way.` },
    { p: 'How many points, and which labels? Krosnick and Presser conclude that seven points are probably best for many rating scales, that answers are more reliable when every point has a word label rather than only the ends, and that the labels should divide the range into roughly equal steps. Pew advises keeping most closed questions to about four or five options, especially on the telephone, where people must hold every option in their heads. Both rules are about what people can answer well, and which applies depends on the mode.' },

    { h: 'What each answer lets you calculate' },
    { p: 'B01 sorted variables by their <g>level of measurement</g>: <g>nominal variable</g>s can only be counted, <g>ordinal variable</g>s can also be put in order, and <g>interval variable</g>s and <g>ratio variable</g>s support differences (and, for ratio, ratios and true zeros). A questionnaire fixes the level of every variable before any data exists, so decide the analysis first and write the question to match it.' },
    { table: {
      caption: 'Lantern’s six questions by what they measure',
      head: ['Question', 'Answer', 'Level', 'Can report', 'Can’t report'],
      rows: [
        ['Q1 recommend', 'A point from 0 to 10', 'Ordinal (often treated as numeric)', 'Shares in each group; the median; the Net Promoter Score', 'That a 10 is “twice as loyal” as a 5'],
        ['Q2 Cold Brew', 'One of five ordered phrases', 'Ordinal', 'Share in each box, or in the top one or two', 'An average with any fixed meaning'],
        ['Q3 cups last week', 'A count', 'Ratio', 'Mean, median, total, “twice as many”', '—'],
        ['Q4 first heard', 'One of five unordered routes', 'Nominal', 'Counts, shares, the most common route', 'Any order or average'],
        ['Q5 age group', 'One of three bands', 'Ordinal', 'Share of each band', 'Mean age (bands lose the detail)'],
        ['Q6 improve', 'Text, coded into themes', 'Nominal (once coded)', 'How often each theme comes up', 'Shares for themes nobody mentioned'],
      ],
    } },
    { p: 'Two choices in the table were deliberate. Q3 asks for a number rather than a band (none, 1–2, 3–5, more), because Ana wants the mean cups a segment buys, which only a ratio variable gives. Q5 asks for a band, because age is only used to describe who replied, and a band is enough for that.' },
  ],

  theory: [
    { h: 'Response options' },
    { p: 'The options to a closed question must be mutually exclusive, so that no answer fits two of them, and exhaustive, so that every answer fits one. Ana’s draft broke both rules. Its age bands, 18–35, 35–55 and 55+, gave someone aged 35 or 55 two boxes to tick, and its list of where people had heard of Lantern (social media, a friend, a market stall) had no box for anyone who came through catering, an event or a workshop. Exhaustive lists come from pilots and from what you already know about the population, not from guesswork.' },
    { p: 'An “Other (please specify)” box looks like a cure for a short list, but Krosnick and Presser report that it is generally ineffective: people tend to choose among the options shown rather than write in their own. “Don’t know” needs judgement too. Their review finds considerable evidence that “don’t know” filters do not improve the measurement of opinions, because many who take that exit do hold a view, so offer it where not knowing is a genuine answer (whether someone has seen a product, say) rather than on every attitude question. “Prefer not to say” belongs on personal questions: it respects people’s right not to answer and records a refusal as a refusal instead of a blank.' },

    { h: 'Wording that pushes answers' },
    { p: 'B01’s table covered the commonest faults with one example each. A questionnaire draft usually holds several at once, as Ana’s did. Each row below is a question from her first draft.' },
    { table: {
      caption: 'Faults in Ana’s first draft (fictional) and how the February questionnaire fixed them',
      head: ['Fault', 'What it is', 'In Ana’s draft', 'Fix'],
      rows: [
        ['<g>Leading question</g>', 'The wording signals the answer the asker wants', '“Do you agree that Lantern is better than the big coffee chains?”', 'Dropped: perceptions of rivals were left to the March focus groups'],
        ['<g>Loaded question</g>', 'The wording carries an assumption or emotive words that the respondent must accept to answer', '“Lantern’s new Cold Brew is made from our much-loved House Blend. How excited are you to try it?” (very, quite, a little)', 'Q2: a neutral description, the price, and a balanced five-point intent scale'],
        ['<g>Double-barrelled question</g>', 'Two questions in one', '“How satisfied are you with Lantern’s coffee and service?”', 'Replaced by Q1, one standard question about recommending'],
        ['Ambiguous wording', 'Words that mean different things to different people', '“How often do you buy coffee out?” (rarely, sometimes, often)', 'Q3: a number, over a stated week'],
        ['<g>Double negative</g>', 'Two negatives that must be untangled before answering', '“Don’t you think it’s not unreasonable to pay more for ethically sourced coffee?”', 'Dropped: no objective needed it'],
        ['Jargon', 'Terms of the trade that respondents don’t use', '“Rate our RTD proposition’s value against competitors’ SKUs.”', 'Merged into Q2, which names the can, the size and the price'],
        ['Recall period', 'Asking people to remember too much, or too long ago', 'Implicit in “how often”', 'Q3 asks about last week only'],
        ['Sensitive question', 'A topic people may not want to disclose', '“What is your annual household income?”', 'Dropped: no objective needed it, and many people prefer not to give it'],
      ],
    } },
    { p: 'Leading and loaded questions are close relatives. A leading question tells people which answer is expected; a loaded one makes them accept something (that they are excited, that the House Blend is much loved) before they can answer at all. Sensitive questions are sometimes necessary: when they are, ask them late, in a self-administered mode, with bands rather than exact figures and a “prefer not to say” option, and only if an objective needs the answer.' },

    { h: 'Response styles' },
    { p: 'A <g>response style</g> is a tendency to answer in a particular way whatever the question says. Four matter most in marketing surveys, and all of them are forms of <g>measurement bias</g>.' },
    { list: [
      '<b><g>Acquiescence</g></b>: agreeing with statements regardless of their content. Krosnick and Presser’s review puts the effect at about 10% on average across studies; Pew finds it stronger among less educated and less informed respondents and when an interviewer is present. Agree/disagree, true/false and yes/no formats invite it; Pew’s remedy is to offer a choice between alternative statements, or to ask about the thing itself.',
      '<b><g>Social desirability bias</g></b>: answering in the way that makes you look good. Pew’s examples are people understating how much they drink and overstating how often they vote or go to church; the effect is larger when an interviewer is present. In marketing surveys the same pressure can inflate reported recycling, healthy eating or loyalty to local and ethical brands.',
      '<b>Extreme responding</b>: choosing the end points of scales more than one’s views warrant.',
      '<b>Midpoint responding</b>: retreating to the middle option, sometimes as an easy way out.',
    ] },
    { p: 'Behind several of these sits <g>satisficing</g>, Krosnick and Presser’s term for taking short cuts instead of doing the work an answer needs: understanding the question, recalling what is relevant, forming a judgement and mapping it onto the options. Satisficing grows with the difficulty of the task and falls with the respondent’s ability and motivation, so long, dull and difficult questionnaires get worse answers. The remedies are design choices. Ask about the thing itself (“How easy or difficult was it to order online?”) instead of asking for agreement with a statement; keep questionnaires short; put sensitive questions in self-administered modes; and word them so that the less flattering answer is easy to give.' },

    { h: 'Reliability and validity' },
    { p: 'Two questions decide whether a measure is worth having. <g>Reliability</g> is its consistency: whether it gives the same result when nothing has changed. <g>Measurement validity</g> is whether it measures what it is meant to. (B01’s data-quality sense of <g>validity</g>, values that conform to their definition, is a different idea: an answer of 4 on a 1-to-5 scale is valid in that sense whether or not the scale measures the right thing.) A measure can be reliable and still invalid, but, in Tavakol and Dennick’s words, “an instrument cannot be valid unless it is reliable”.' },
    { p: 'Two checks of reliability are common. <g>Test–retest reliability</g> asks the same people the same questions twice, a short time apart, and correlates the two sets of scores; Price, Jhangiani and Chiang treat a correlation of +.80 or more as good, for things expected to stay stable (an attitude to a brand, not this morning’s mood). <g>Internal consistency</g> asks whether the items of a multi-item scale, such as a Likert scale, move together. It is usually summarised by <g>Cronbach’s alpha</g> (Cronbach, 1951): the variances of the items compared with the variance of their total.' },
    { math: String.raw`\alpha = \dfrac{k}{k - 1}\left(1 - \dfrac{\sum_i s_i^2}{s_T^2}\right)` },
    { p: 'If the items move together, the total varies far more than the items do separately, and α approaches 1; if they are unrelated, α is near 0, and it goes negative when items pull against each other, as a reverse-worded item left unreversed does. Tavakol and Dennick note that the acceptable values reported range from 0.70 to 0.95, and Price and colleagues treat +.80 as good. Higher is not always better: Tavakol and Dennick note a recommended maximum of 0.90, because a very high α can mean items that ask the same question in different words, lengthening the questionnaire without adding information. Alpha also assumes the items measure one thing without showing that they do, and it rises with the number of items, so a long scale can reach .70 with weakly related items.' },
    { p: 'Validity is argued from several kinds of evidence. <g>Content validity</g> asks whether the items cover every part of the idea as defined, judged by comparing the questions with the definition; face validity, whether a measure looks right on the surface, is weaker evidence, because appearances mislead. <g>Construct validity</g> asks whether scores relate to other measures as they should: strongly to other measures of the same idea (convergent validity) and weakly to measures of different ideas (discriminant validity). <g>Criterion validity</g> asks whether scores agree with an outcome measured at the same time (concurrent validity) or later (predictive validity). Texts group this evidence differently: Price, Jhangiani and Chiang count agreement with another measure of the same idea as criterion evidence and don’t use the term construct validity, while marketing-research texts usually treat convergent and discriminant evidence as construct validity, as this lesson does.' },
    { p: 'Purchase intent is the marketing case of predictive validity. Lantern’s Q2 could give much the same answers if asked twice and still be a poor guide to buying, which is the stated-intent problem Survey error takes up. Its test comes after launch, when Ana can set what list members said in February against what they go on to buy through Lantern’s own channel.' },

    { h: 'Order and context effects' },
    { p: 'Pew notes that “earlier questions can unintentionally provide context for the questions that follow”. In one of its December 2008 surveys, 88% said they were dissatisfied with the way things were going in the country when the question came straight after one about the president’s job, against 78% when it came first: ten points from the order alone. Such <g>order effect</g>s are why a questionnaire usually moves from general questions to specific ones, and why a question tracked over time keeps its place in the questionnaire.' },
    { p: 'Lantern’s questionnaire follows that funnel. Q1 asks about Lantern in general before Q2 asks about one new product, so the product question can’t colour the overall judgement; the factual Q3 to Q5 follow; and the open Q6 comes last, when people have already thought about Lantern. Ana kept this order for every respondent so that next year’s answers can be compared with this year’s.' },
    { p: 'The order of the options matters as well. In a <g>primacy effect</g> people choose options near the top of a list more often; in a <g>recency effect</g> they choose those heard last. Pew links the first to self-administered surveys, where people read the list, and the second to telephone surveys, where they hear it. Krosnick and Presser add that rating scales show primacy in both modes. Pew randomises the order of unordered lists such as Lantern’s Q4, so no option is always first (a catch-all such as “Search or other” stays at the end), but keeps ordered scales in order and reverses them for half the sample, which spreads the effect rather than removing it.' },

    { h: 'Flow: screening, routing and length' },
    { p: 'A questionnaire has a shape. It opens by saying who is asking, why, how long it will take and how answers will be used, so that people can give <g>informed consent</g>. The first questions are easy, engaging and clearly about the topic promised; the main topics follow, each from general to specific; sensitive and demographic questions come near the end, unless one is needed earlier to decide who should answer what. Krosnick and Presser give the same advice and add that related questions belong together.' },
    { p: 'A <g>screening question</g> decides whether someone belongs in the survey at all, and so comes first. A survey of a city’s ready-to-drink coffee buyers would open by asking whether the person has bought a can in the last three months and thank everyone else for their time. Lantern needed no screening question, because everyone on its list was in scope; the longer <g>screener</g> used to recruit focus groups (see Qualitative research) does the same job before a study begins.' },
    { p: '<g>Routing</g> (skip logic) then sends each person only to the questions that apply to them. A web survey tool does this automatically; a paper or telephone questionnaire needs written instructions. Test every path before fieldwork, because a routing error silently removes people from a question.' },
    { p: 'Length is a cost paid by the respondent. Krosnick and Presser note that fatigue can lower the quality of answers later in a self-administered questionnaire, and one symptom is straight-lining: the same answer to every item in a grid. Cut every question that fails the earn-its-place test, put the essential questions first, and tell people honestly how long the survey takes.' },

    { h: 'Pretesting' },
    { p: 'Pew calls pretesting an essential step in questionnaire design. The U.S. Census Bureau’s standard for its own surveys requires at least one method in which real respondents take part, and lists several. In a <g>cognitive interview</g>, one person works through a draft questionnaire and describes their thoughts, either aloud as they answer (thinking aloud) or afterwards; the interviewer probes (“What did ‘ready-to-drink’ mean to you?”) and asks the person to repeat questions in their own words. Behaviour coding records, question by question, where interviewers and respondents run into trouble; respondent debriefing asks follow-up questions after a field test.' },
    { p: 'The Bureau says that a review by survey experts, useful as it is, does not in general satisfy the requirement, because no respondent is involved; it may stand in for respondent pretesting only as a last resort, when time is extremely short. A small field test (a <g>pretest</g> or pilot) then checks the whole process: the invitation, the routing, the timing and the data file the tool produces.' },
    { case: 'Ana’s review cut the draft from twelve questions to seven: she dropped three that no objective needed and merged two pairs. On 26 and 27 January 2027 she ran cognitive interviews with five customers in the shop. Two of the five weren’t sure whether “ready-to-drink” meant a can or a drink made in a café, so Q2 now names the can and its size. Nobody could say which can size they would prefer without seeing the cans, so that question went to the focus groups, leaving six.' },

    { h: 'Mode, in outline' },
    { p: 'The <g>survey mode</g> is how questions reach people and answers come back. OpenStax’s <i>Principles of Marketing</i> compares four (mailed, telephone, in-person and electronic surveys) and notes, for example, that electronic surveys are cheaper and quicker but tend to get low response rates. The mode also changes the answers, as the sections above showed.' },
    { table: {
      caption: 'Three modes compared',
      head: ['', 'Web (self-administered)', 'Telephone (interviewer)', 'Face to face (interviewer)'],
      rows: [
        ['How options reach people', 'Read on a screen: primacy', 'Heard: recency; keep lists to about four or five options', 'Read aloud, or shown on cards'],
        ['Interviewer effects', 'None: best for sensitive questions', 'Acquiescence and social desirability stronger', 'As telephone; rapport helps long interviews'],
        ['Routing and checks', 'Automatic', 'Programmed for the interviewer', 'Programmed on a tablet, or written instructions'],
        ['Cost and speed', 'Cheapest and fastest', 'Middle', 'Dearest and slowest'],
        ['Who can be reached', 'People with an e-mail address or a link', 'People with a known number who answer', 'People at an address or a location'],
      ],
    } },
    { p: 'Because the mode changes answers, Pew warns that switching modes can break a trend: when it moved from telephone to online surveys, comparisons over time became harder, especially for sensitive questions and for answers such as “don’t know” that people volunteer to an interviewer without being offered them. Keep the mode fixed for anything you track, or test the change before relying on it.' },
  ],

  formulas: [
    { id: 'qd-likert-score', name: 'Likert scale score with reverse-coded items',
      tex: String.raw`x'_j = (L + H) - x_j \qquad \text{Score} = \dfrac{1}{k}\sum_{j=1}^{k} y_j, \quad y_j = \begin{cases} x'_j & \text{item } j \text{ reverse-worded} \\ x_j & \text{otherwise} \end{cases}`,
      where: [
        [String.raw`x_j`, 'The code a respondent gave item j (for example 1 = strongly disagree … 5 = strongly agree)', ''],
        [String.raw`x'_j`, 'The reverse-coded value of item j', ''],
        [String.raw`L,\ H`, 'The lowest and highest codes on the scale (1 and 5 on a five-point scale, so a reversed code is 6 − x)', ''],
        [String.raw`y_j`, 'The value used for item j: reversed for reverse-worded items, as given otherwise', ''],
        [String.raw`k`, 'The number of items in the scale', ''],
        [String.raw`j`, 'The item number, from 1 to k', ''],
        [String.raw`\text{Score}`, 'The respondent’s scale score, on the same range as the items', ''],
      ],
      assumptions: 'The items measure one attitude and every item is coded so that a higher code means more of it. Averaging ordinal codes treats the steps as equal, which is a convention, not a fact about the scale.',
      note: 'In Excel, for four items in B2:E2 with the third reverse-worded: <x>=AVERAGE(B2,C2,6-D2,E2)</x>.' },
    { id: 'qd-alpha', name: 'Cronbach’s alpha (internal consistency of a scale)',
      tex: String.raw`\alpha = \dfrac{k}{k - 1}\left(1 - \dfrac{\sum_{i=1}^{k} s_i^2}{s_T^2}\right)`,
      where: [
        [String.raw`k`, 'The number of items in the scale', ''],
        [String.raw`s_i^2`, 'The variance of item i across respondents, after any reverse-coding', 'squared scale points'],
        [String.raw`s_T^2`, 'The variance of respondents’ totals (the sum of their k item codes)', 'squared scale points'],
        [String.raw`i`, 'The item number, from 1 to k', ''],
        [String.raw`\alpha`, 'Cronbach’s alpha: up to 1; around 0.70 to 0.90 is the usual target', ''],
      ],
      assumptions: 'The items measure one thing and are coded in the same direction. Use the same kind of variance throughout: sample variances (dividing by n − 1, Excel’s VAR.S) here; dividing every variance by n instead gives the same α.',
      note: 'In Excel, with items in B2:D7 and totals in E2:E7: <x>=3/2*(1-SUM(VAR.S(B2:B7),VAR.S(C2:C7),VAR.S(D2:D7))/VAR.S(E2:E7))</x>.' },
  ],

  examples: [
    { level: 'simple', title: 'What can Tamberlake Gyms do with each answer?', fictional: true,
      setup: 'Tamberlake Gyms, a fictional chain of six gyms, plans a member survey with five questions: (a) “Which Tamberlake gym do you use most?” (a list of the six); (b) “How many times did you visit a Tamberlake gym last week?”; (c) “How satisfied are you with the changing rooms?” (very dissatisfied … very satisfied, five points); (d) “Rank these from 1 to 4 by how much they matter to you: price, opening hours, classes, equipment”; (e) “Is there anything you would change?” Classify each by question type and level of measurement, and say what Tamberlake can report from it.',
      steps: [
        '(a) is a closed, multiple-choice question with one answer. The gyms have no natural order, so the answer is nominal: Tamberlake can count members by gym and name the most used, nothing more.',
        '(b) is an open question asking for a number. A count of visits has a true zero, so it is ratio: means, medians, totals and statements like “twice as often” are all meaningful.',
        '(c) is a rating scale with five verbal points. The points are ordered but not equally spaced in any provable way, so it is ordinal: report the share in each point or the share satisfied (the top two), and the median.',
        '(d) is a ranking question. Each option gets a rank from 1 to 4, which is ordinal; Tamberlake can report how often each option was ranked first, or each option’s median rank. A rank says nothing about how far apart two options are: a member who cares only about price still ranks the other three.',
        '(e) is an open question. Its answers must be coded into themes before anything can be counted, and the counts become nominal data.',
      ],
      answer: 'Nominal (a), ratio (b), ordinal (c) and (d), and open text that becomes nominal once coded (e).',
      interpretation: 'The level is fixed when the question is written. If Tamberlake later wants the average number of visits by gym, it can have it, because (b) asks for a number; had it offered bands such as “none, 1–2, 3 or more”, it could not.' },

    { level: 'challenging', title: 'Repairing Marrowby Buses’ telephone questionnaire', fictional: true,
      setup: 'Marrowby Buses, a fictional bus company, will phone 800 passengers drawn from its smartcard register. Its draft runs: Q1 “Were any of your journeys last month late?”; Q2 “On a scale of 1 to 10, how satisfied are you with Marrowby Buses?”; Q3 “Which of these is the main reason you take the bus: no car, cost, the environment, convenience, it’s quicker, parking is difficult, I enjoy it, a medical condition, I’m under 18, other?”; Q4 “How often do you travel? Daily / Weekly / Sometimes”; Q5 “How satisfied are you with our punctuality and our drivers?”. Find the problems and redesign it.',
      steps: [
        'Q5 is double-barrelled (punctuality and drivers). Split it into two questions, each on a labelled scale; on the telephone Pew advises about four or five options, so use five verbal points read in full.',
        'Q1, about late journeys, comes straight before overall satisfaction in Q2, which invites an order effect: people who have just recalled a late bus may rate everything lower. Ask the general satisfaction question first and the specific punctuality questions after it. The lateness question also needs a clear meaning of “late” (more than five minutes after the timetable, say) and a recall period people can manage.',
        'Q2’s ten-point scale has only numbers, which a listener can’t hold in mind as labels. A five-point verbal scale (very satisfied … very dissatisfied), read in full, suits the telephone better.',
        'Q3 reads ten options aloud: listeners favour the last ones (recency), and the options overlap (cost and no car can both be true). Ask for the main reason as an open question, coded by the interviewer into a short list built from a pilot, or read five options in an order that rotates between calls. “I’m under 18” is not a reason, and research with children brings extra rules, so screen out anyone under 18 at the start instead.',
        'Q4’s options are vague and not exhaustive: someone who travels twice a month has no box, and “sometimes” means different things to different people. Ask “On how many days in the last seven did you travel on a Marrowby bus?” (0 to 7).',
        'Order the result as a funnel: screening (aged 18 or over; travelled in the last month), overall satisfaction, punctuality and drivers, the reason for travelling, travel frequency, then any profile questions.',
      ],
      answer: 'Screen out under-18s first; ask overall satisfaction on a five-point labelled scale before the specific questions; split punctuality from drivers; define “late” and the recall period; replace the long read-aloud list with a coded open question or a short rotating one; and ask frequency as a number of days.',
      interpretation: 'None of the faults would show up in the results as an obvious error. A recency effect in Q3, or an order effect from Q1, would produce plausible-looking percentages that are wrong, which is why the design work comes before fieldwork.' },

    { level: 'challenging', title: 'How consistent is Brindlecombe’s advice scale?', fictional: true,
      setup: 'Brindlecombe Garden Centre (fictional) piloted a three-item scale on its staff’s advice with six loyalty members, each item from 1 (strongly disagree) to 5 (strongly agree): (1) “Staff know their plants”, (2) “The advice I get works in my garden”, (3) “I trust staff recommendations”. Calculate Cronbach’s alpha with sample variances, and say whether the scale is consistent enough to use.',
      table: { head: ['Member', 'Item 1', 'Item 2', 'Item 3', 'Total'], rows: ADV.map((r, i) => [i + 1, r[0], r[1], r[2], ADV_TOT[i]]), align: ['l', 'r', 'r', 'r', 'r'] },
      steps: [
        String.raw`Item variances (sample, dividing by n − 1 = 5): item 1 has mean 3.5 and squared deviations summing to 7.5, so <m>s_1^2 = 7.5 \div 5 = ${ADV_IV[0].toFixed(1)}</m>; likewise <m>s_2^2 = ${ADV_IV[1].toFixed(1)}</m> and <m>s_3^2 = ${ADV_IV[2].toFixed(1)}</m>. Their sum is ${ADV_IV.reduce((a, b) => a + b, 0).toFixed(1)}.`,
        String.raw`Totals: ${ADV_TOT.join(', ')}, mean 9.5; squared deviations sum to 37.5, so <m>s_T^2 = 37.5 \div 5 = ${ADV_TV.toFixed(1)}</m>.`,
        String.raw`Alpha: <m>\alpha = \dfrac{3}{2}\left(1 - \dfrac{${ADV_IV.reduce((a, b) => a + b, 0).toFixed(1)}}{${ADV_TV.toFixed(1)}}\right) = 1.5 \times ${(1 - ADV_IV.reduce((a, b) => a + b, 0) / ADV_TV).toFixed(4)} = ${ADV_ALPHA.toFixed(2)}</m>.`,
        'Read it. 0.80 is inside the range usually recommended (0.70 to 0.90) and not so high that the items look redundant. But six people are a pilot, not proof: alpha from so few respondents is itself uncertain, and it says nothing about whether the scale measures advice quality rather than general liking for the centre.',
        'Check validity next: do the three items cover what “good advice” means to gardeners (content)? Do scores track a separate measure, such as whether members followed advice successfully, more than they track liking for the café (construct)?',
      ],
      answer: `α = ${ADV_ALPHA.toFixed(2)}: consistent enough for a pilot, to be confirmed on the full sample and backed by evidence of validity.`,
      interpretation: 'Alpha answers one question, whether the items move together. A scale can pass it and still miss the point: three near-identical items about liking the centre would score higher and measure advice worse.' },

    { level: 'applied', title: 'From Ana’s draft to the February questionnaire', fictional: true,
      setup: `Ana’s first draft had ${DRAFT} questions, in this order: age band; household income; satisfaction with coffee and service; “Would you recommend Lantern?” (yes/no); how often she buys coffee out; where people heard of Lantern; excitement about Cold Brew; the “RTD proposition” question; “better than the big chains”; the double negative on ethical coffee; preferred can size; and “What could Lantern do better?”. Turn it into the questionnaire that went out on ${SURVEY_2027.sent}.`,
      steps: [
        'Test each question against the survey’s three objectives. Income, “better than the big chains” and the ethical-coffee question serve none of them, so all three go: that is three of the twelve.',
        'Merge where two questions chase one objective. Satisfaction with coffee and service, and the yes/no recommendation, become Q1: one standard question on a 0 to 10 scale, which keeps more detail than yes or no and can be compared with other surveys. The excitement question and the jargon question become Q2: a neutral description of the can, its size and its price, with a balanced purchase-intent scale. That leaves seven.',
        'Fix the options. How often she buys coffee out becomes a number for last week (Q3). Where people heard of Lantern becomes “first heard”, with five exhaustive routes including events and catering and a catch-all (Q4). The overlapping age bands become 18–34, 35–54 and 55 or over (Q5). The open question asks for one thing, to keep answers short and codeable (Q6).',
        'Order as a funnel: the general Q1 first, the specific Q2 next, facts and profile after, and the open question last; demographics move from the start to the end.',
        `Pretest. Five cognitive interviews showed the can size can’t be answered without seeing the cans, so it moves to the focus groups, leaving ${FINAL} questions.`,
      ],
      table: {
        head: ['Draft question', 'Fault', 'In February'],
        rows: [
          ['Age: 18–35 / 35–55 / 55+ (first)', 'Overlapping options; demographics first', 'Q5, fixed bands, near the end'],
          ['Annual household income', 'Sensitive and not needed', 'Dropped'],
          ['Satisfaction with coffee and service', 'Double-barrelled', 'Q1'],
          ['Would you recommend Lantern? (yes/no)', 'Two answers lose detail', 'Q1 (0 to 10)'],
          ['How often do you buy coffee out?', 'Vague quantifiers', 'Q3, a number for last week'],
          ['Where did you hear about us?', 'Not exhaustive; “first” not asked', 'Q4'],
          ['How excited are you to try Cold Brew?', 'Loaded; unbalanced options', 'Q2'],
          ['Rate our RTD proposition…', 'Jargon', 'Q2'],
          ['Is Lantern better than the big chains?', 'Leading; agree/disagree', 'Dropped (focus groups)'],
          ['Don’t you think it’s not unreasonable…?', 'Double negative; leading', 'Dropped'],
          ['Which can size would you prefer?', 'Unanswerable without the cans', 'Dropped after the pretest (focus groups)'],
          ['What could Lantern do better?', 'Broad', 'Q6, “one thing”'],
        ],
      },
      answer: `Three questions dropped for having no objective, two pairs merged, the options and order repaired, and one question removed after the pretest: ${DRAFT} questions became ${FINAL}.`,
      interpretation: 'The February questionnaire is short enough to finish in a few minutes, every answer feeds a named analysis, and none of the wording tells people what Lantern hopes to hear. It still asks people to predict their own buying in Q2, and stated intentions are not purchases: the Survey error lesson takes that up.' },
  ],

  demo: [
    { widget: 'qd-openclosed', intro: 'Pew’s 2008 experiment: the same question asked with five options listed and with none. Compare how many named the economy, and how many gave an answer outside the list, in each version.' },
    { widget: 'qd-likert', intro: 'A four-item Likert scale from a fictional festival survey; item 3 is worded the other way (“The site felt overcrowded”). Column F reverse-codes it, column G forgets to. Change a respondent’s answers and watch the two scores; then give respondent 8 a 5 on every item, as an acquiescent or straight-lining respondent might. G reports a perfect 5.00, F doesn’t, and column H flags the contradiction. Rows 12 and 13 give Cronbach’s alpha for each version of the scale: about 0.96 with item 3 reversed, negative without.' },
  ],

  mistakes: [
    { title: '“One more question costs nothing.”', html: 'Every question costs the respondent time and attention. Longer questionnaires invite satisficing and straight-lining, and lower the quality of the answers that matter. If you can’t name the analysis a question feeds and the decision it could change, cut it.' },
    { title: '“More scale points always measure better.”', html: 'Krosnick and Presser’s review finds reliability lower on scales of two or three points, but the gain levels off after about seven, and especially long scales compromise validity: seven-point scales are probably optimal in many instances, though their fit to the telephone is less certain. Pew advises about four or five options for most closed questions, especially on the phone, where people must hold every option in mind. Choose the number of points for the mode, and label every one.' },
    { title: '“Offering ‘don’t know’ and ‘other’ always improves the data.”', html: 'Evidence reviewed by Krosnick and Presser suggests “don’t know” filters do not improve opinion measurement and that “other” boxes are rarely used. Offer “don’t know” where not knowing is a real answer, and build an exhaustive list from a pilot rather than relying on “other”.' },
    { title: '“We can work out the averages later.”', html: 'The level of measurement is fixed when the question is written. Ask age or spending in bands and no later analysis can recover a mean; ask a 1–5 agreement item and its mean is a convention, not an amount. Decide the analysis, then write the question.' },
    { title: '“Randomise every list.”', html: 'Randomise unordered lists, such as reasons or routes, so that no option is always first. Keep ordered scales in order: shuffling “very satisfied … very dissatisfied” makes them unreadable. To spread primacy or recency on a scale, reverse it for half the sample.' },
    { title: '“A pretest just checks that the link works.”', html: 'Checking the link and the routing is part of it, but the main job is finding out what people think each question means. Cognitive interviews with a handful of real respondents catch ambiguous words, unanswerable questions and missing options that nobody inside the business will notice.' },
  ],

  application: [
    { p: 'In a research agency the questionnaire is a contract between the researcher and the client. Before fieldwork the two agree an analysis plan that lists, for every question, the objective it answers and the tables it will produce; questions with no line in the plan are cut. Standard questions such as the Net Promoter question are used in their published wording, or in one fixed close variant, so that results can be compared over time and with other studies, and anything tracked keeps its wording, place and mode from one wave to the next.' },
    { case: 'Ana’s sign-off sheet for the February questionnaire had five lines: every question is tied to an objective in the brief and to a planned table; Q1 is a close variant of Reichheld’s recommend question (“How likely are you…” for “How likely is it that you would…”) and will be asked in exactly these words, in the same place, next year; Q2 describes the product and its price neutrally on a balanced scale; the options to Q3, Q4 and Q5 are exhaustive and don’t overlap, and Q4’s first four routes are shown in a random order, with “Search or other” always last; and five customers have taken it in cognitive interviews. The web version has also been tested on a phone and a laptop.' },
    { p: 'The questionnaire also decides what the analysis can never show. Q2 measures what people say they would do, not what they will do, and the survey says nothing about people who are not on Lantern’s list. Those limits belong to sampling and survey error, the next two lessons. What good design can promise is narrower and still valuable: that each answer means the same thing to every respondent and to the person who reads the results.' },
    { p: 'The same discipline applies well beyond customer surveys. A software firm writing an onboarding survey, a council consulting residents and a hospital asking patients about their care all face the same choices: which questions earn their place, which formats give the measures they need, and which wording, order and mode let people answer honestly. Pew’s guidance and Krosnick and Presser’s review are written for social research, but the evidence they summarise is about how people answer questions, and that doesn’t change with the client.' },
  ],

  summary: [
    'Start from the research objectives: every question needs an objective, a planned analysis and a decision it could change. Ask only what you can’t learn another way.',
    'Open questions collect reasons, ideas and amounts in people’s own words; closed questions (dichotomous, multiple choice, ranking, rating) are quicker to answer and analyse, but their lists shape the answers.',
    'Standard scales: Likert items and scales (reverse-code opposite items), semantic differentials, numeric ratings, purchase-intent scales and the Net Promoter question (0–10; promoters 9–10, passives 7–8, detractors 0–6).',
    'The question fixes the level of measurement: ask for a number if you need a mean, and decide the analysis before the wording.',
    'Options must be mutually exclusive and exhaustive. Avoid leading, loaded, double-barrelled, ambiguous, double-negative and jargon-laden wording, long recall periods and sensitive questions nobody needs.',
    'Acquiescence, social desirability, extreme and midpoint responding and satisficing bias answers; question order and option order (primacy on screens, recency on the phone) do too. Design against them.',
    'Reliability is consistency (test–retest; internal consistency, by Cronbach’s alpha = k ÷ (k − 1) × (1 − Σ item variances ÷ total variance), usually 0.70 to 0.90). Measurement validity is measuring the right thing (content, construct, criterion). Reliable is not the same as valid.',
    'Shape the flow (easy opener, general to specific, screening first, routing, sensitive and demographic questions last), pretest with cognitive interviews, and keep tracked questions in the same mode: web shows primacy; interviewers bring acquiescence and social desirability.',
  ],

  glossary: [
    { term: 'Questionnaire', def: 'A fixed set of questions asked in the same words and order of every respondent, with answers recorded in a fixed form so that they can be counted and compared.' },
    { term: 'Open question', def: 'A survey question that lets respondents answer in their own words or with their own number, rather than choosing from a list.' },
    { term: 'Closed question', def: 'A survey question that asks respondents to choose from a fixed list of answers.' },
    { term: 'Dichotomous question', def: 'A closed question with exactly two possible answers, such as yes or no.' },
    { term: 'Multiple-choice question', def: 'A closed question that offers a list of answers and asks for one of them, or for all that apply.' },
    { term: 'Ranking question', def: 'A question that asks respondents to put a set of options in order, such as from most to least important. The ranks are ordinal and say nothing about how far apart the options are.' },
    { term: 'Rating scale', def: 'A question format in which respondents place a judgement on a set of ordered points, such as five points from very dissatisfied to very satisfied, or 0 to 10.' },
    { term: 'Likert item', def: 'A statement answered on ordered points of agreement, usually five from “strongly disagree” to “strongly agree”.' },
    { term: 'Likert scale', def: 'A score built by averaging or summing several Likert items that measure one attitude, after reverse-coding any items worded in the opposite direction.' },
    { term: 'Semantic differential', def: 'A rating format with two opposite adjectives at the ends of a row of points, usually seven, on which respondents place a brand, product or idea.' },
    { term: 'Purchase-intent scale', def: 'A question about how likely respondents are to buy a described product, on verbal points such as “definitely would buy”, “probably would buy”, “might or might not”, “probably would not” and “definitely would not”.' },
    { term: 'Net Promoter Score', def: 'A loyalty measure from answers to “How likely is it that you would recommend [company] to a friend or colleague?” on a 0 to 10 scale: the percentage of promoters (9–10) minus the percentage of detractors (0–6), from −100 to +100 (Reichheld, 2003).' },
    { term: 'Leading question', def: 'A question whose wording signals the answer the asker expects or wants, such as “Don’t you agree that…?”.' },
    { term: 'Loaded question', def: 'A question that contains an assumption, or emotive wording, that the respondent must accept in order to answer, such as “How excited are you to try…?”.' },
    { term: 'Double-barrelled question', def: 'A question that asks about two things at once, so that someone who feels differently about each can’t answer it accurately.' },
    { term: 'Double negative', def: 'Wording with two negatives (“not unreasonable”, “oppose not allowing”) that respondents must untangle before they can answer, which leads to mistakes.' },
    { term: 'Response style', def: 'A tendency to answer survey questions in a particular way regardless of their content, such as agreeing, choosing the end points or choosing the middle.' },
    { term: 'Acquiescence', def: 'The tendency to agree with statements, or to say yes, regardless of their content. It biases agree/disagree, true/false and yes/no questions.' },
    { term: 'Social desirability bias', def: 'Measurement bias that arises when respondents give the answer that makes them look good rather than the true one, such as overstating recycling or understating drinking. It is stronger when an interviewer is present.' },
    { term: 'Satisficing', def: 'Answering a survey question with mental short cuts instead of fully understanding it, recalling what is relevant and forming a judgement; it grows with the difficulty and length of a questionnaire (Krosnick and Presser).' },
    { term: 'Order effect', def: 'A change in the answers to a question caused by the questions asked before it, which provide a context for it.' },
    { term: 'Primacy effect', def: 'The tendency to choose options near the start of a list, most common when respondents read the list themselves.' },
    { term: 'Recency effect', def: 'The tendency to choose options near the end of a list, most common when respondents hear the list read aloud.' },
    { term: 'Screening question', def: 'A question at the start of a survey that decides whether a person is in the population the survey is about, and so whether they continue.' },
    { term: 'Routing', def: 'Instructions or programmed rules (skip logic) that send each respondent only to the questions that apply to them, based on their earlier answers.' },
    { term: 'Pretest', def: 'A trial of a questionnaire with people like the intended respondents before fieldwork, to find questions they misunderstand or can’t answer and to check the routing, timing and data.' },
    { term: 'Cognitive interview', def: 'A one-to-one pretest in which a respondent works through a draft questionnaire and describes their thinking, aloud as they answer or afterwards, while the interviewer probes what each question meant to them.' },
    { term: 'Reliability', def: 'The consistency of a measure: whether it gives the same result when what it measures hasn’t changed, across repeated measurements, across the items of a scale or across observers.' },
    { term: 'Measurement validity', def: 'The extent to which a measure captures what it is meant to measure, supported by content, construct and criterion evidence. Distinct from validity in the data-quality sense.' },
    { term: 'Test–retest reliability', def: 'The consistency of a measure over time, assessed by giving the same measure to the same people twice, a short time apart, and correlating the two sets of scores.' },
    { term: 'Internal consistency', def: 'The extent to which the items of a multi-item scale move together, so that they can be treated as measuring one thing; usually summarised by Cronbach’s alpha.' },
    { term: 'Cronbach’s alpha', def: 'A measure of internal consistency: k ÷ (k − 1) × (1 − the sum of the k item variances ÷ the variance of the total score). It runs up to 1; values from about 0.70 to 0.90 are the usual target, and it assumes the items measure one thing (Cronbach, 1951).' },
    { term: 'Content validity', def: 'The extent to which a measure’s items cover every part of the idea it is meant to measure, as defined; judged by comparing the items with the definition. Face validity, whether a measure looks right on the surface, is weaker evidence.' },
    { term: 'Construct validity', def: 'Evidence that a measure’s scores relate to other measures as they should: strongly to other measures of the same idea (convergent validity) and weakly to measures of different ideas (discriminant validity).' },
    { term: 'Criterion validity', def: 'The extent to which a measure’s scores agree with a relevant outcome measured at the same time (concurrent validity) or later (predictive validity), such as stated purchase intent against later purchases.' },
    { term: 'Survey mode', def: 'The way questions reach respondents and answers come back, such as a web questionnaire, a telephone interview or a face-to-face interview. The mode can change the answers.' },
  ],

  references: [
    { text: 'Albrecht, M. G., Green, M. &amp; Hoffman, L. (2023). <i>Principles of Marketing</i>, section 6.3 “Steps in a Successful Marketing Research Plan” (question types; table 6.2 on survey modes). OpenStax.', url: 'https://openstax.org/books/principles-marketing/pages/6-3-steps-in-a-successful-marketing-research-plan', checked: '2026-10-24' },
    { text: 'Pew Research Center. “Writing Survey Questions”. Methods.', url: 'https://www.pewresearch.org/writing-survey-questions/', checked: '2026-10-24' },
    { text: 'Krosnick, J. A. &amp; Presser, S. (2010). “Question and Questionnaire Design”. In P. V. Marsden &amp; J. D. Wright (eds), <i>Handbook of Survey Research</i>, 2nd edn, chapter 9, from p. 263. Emerald.', url: 'https://web.stanford.edu/dept/communication/faculty/krosnick/docs/2010/2010 Handbook of Survey Research.pdf', checked: '2026-10-24' },
    { text: 'U.S. Census Bureau. “Appendix A2: Questionnaire Testing and Evaluation Methods for Censuses and Surveys”. Statistical Quality Standards.', url: 'https://census.gov/about/policies/quality/standards/appendixa2.html', checked: '2026-10-24' },
    { text: 'Reichheld, F. F. (2003). “The One Number You Need to Grow”. <i>Harvard Business Review</i> 81(12), 46–54. Paywalled; the question wording and the three groups quoted here were checked against a reprint of the article.', url: 'https://hbr.org/2003/12/the-one-number-you-need-to-grow', checked: '2026-10-24' },
    { text: 'Cronbach, L. J. (1951). “Coefficient alpha and the internal structure of tests”. <i>Psychometrika</i> 16(3), 297–334. doi:10.1007/BF02310555 (record on IDEAS/RePEc).', url: 'https://ideas.repec.org/a/spr/psycho/v16y1951i3p297-334.html', checked: '2026-10-24' },
    { text: 'Tavakol, M. &amp; Dennick, R. (2011). “Making sense of Cronbach’s alpha”. <i>International Journal of Medical Education</i> 2, 53–55.', url: 'https://www.ijme.net/archive/2/cronbachs-alpha.pdf', checked: '2026-10-24' },
    { text: 'Price, P. C., Jhangiani, R. &amp; Chiang, I.-C. A. (2015). <i>Research Methods in Psychology</i>, 2nd Canadian edition, chapter 5, “Reliability and Validity of Measurement”. BCcampus.', url: 'https://opentextbc.ca/researchmethods/chapter/reliability-and-validity-of-measurement/', checked: '2026-10-24' },
    { text: 'Bain &amp; Company. “Measuring Your Net Promoter Score”. Net Promoter System (the question as Bain gives it today, the 0–10 scale, promoters, passives and detractors, and the calculation).', url: 'https://nps.bain.com/about/measuring-your-net-promoter-score/', checked: '2026-10-24' },
  ],

  checks: [
    { what: 'Questions in the February questionnaire (case.js)', value: Q.length, shown: 6 },
    { what: 'Questions in Ana’s draft', value: DRAFT, shown: 12 },
    { what: 'After review: draft − dropped − merged pairs', value: DRAFT - DROPPED - MERGED, shown: 7 },
    { what: 'After review (constant)', value: AFTER_REVIEW, shown: DRAFT - DROPPED - MERGED },
    { what: 'After the pretest: one more dropped', value: AFTER_REVIEW - 1, shown: FINAL },
    { what: 'Questions dropped at review', value: DROPPED, shown: 3 },
    { what: 'Pairs merged at review', value: MERGED, shown: 2 },
    { what: 'Cognitive interviews', value: PRETEST.people, shown: 5 },
    { what: 'Unsure what ready-to-drink meant', value: PRETEST.unsureRtd, shown: 2 },
    { what: 'Draft table rows = draft questions', value: 12, shown: DRAFT },
    { what: 'Can size in Q2 (ml, case.js question text)', value: Number(/250 ml/.test(Q[1].text)), shown: 1 },
    { what: 'Price in Q2 (case.js question text)', value: Number(/\$3\.49/.test(Q[1].text)), shown: 1 },
    { what: 'Q4 offers five routes (case.js)', value: Q[3].scale.split(' / ').length, shown: 5 },
    { what: 'Q5 offers three bands (case.js)', value: Q[4].scale.split(' / ').length, shown: 3 },
    { what: 'Q2 offers five intent points (case.js)', value: Q[1].scale.split(' / ').length, shown: 5 },
    // Pew (Writing Survey Questions)
    { what: 'Pew 2008 closed version: economy (%)', value: 58, shown: 58 },
    { what: 'Pew 2008 closed version: outside the list (%)', value: 8, shown: 8 },
    { what: 'Pew 2008 open version: economy (%)', value: 35, shown: 35 },
    { what: 'Pew 2008 open version: not on the list (%)', value: 43, shown: 43 },
    { what: 'Pew 2008 options listed', value: 5, shown: 5 },
    { what: 'Pew December 2008 order effect: after approval (%)', value: 88, shown: 88 },
    { what: 'Pew December 2008: asked first (%)', value: 78, shown: 78 },
    { what: 'Pew order effect (points)', value: 88 - 78, shown: 10 },
    { what: 'Pew: four or five options on the phone', value: 4 + 1, shown: 5 },
    // Krosnick and Presser
    { what: 'K&P: average acquiescence effect (points)', value: 10, shown: 10 },
    { what: 'K&P: seven-point scales', value: 7, shown: 7 },
    // NPS definitions (Reichheld)
    { what: 'NPS scale points 0–10', value: 11, shown: 10 - 0 + 1 },
    { what: 'Promoters from 9', value: 9, shown: 9 },
    { what: 'Detractors up to 6', value: 6, shown: 6 },
    { what: 'NPS range: all promoters', value: 100 * (1 - 0), shown: 100 },
    { what: 'NPS range: all detractors', value: 100 * (0 - 1), shown: -100 },
    // Marrowby
    { what: 'Marrowby passengers to phone', value: 800, shown: 800 },
    { what: 'Marrowby Q3 options read aloud', value: 10, shown: 10 },
    { what: 'Days in the last seven', value: 7, shown: 7 },
    // Tamberlake
    { what: 'Tamberlake gyms', value: 6, shown: 6 },
    { what: 'Tamberlake survey questions', value: 5, shown: 5 },
    // Likert formula note
    { what: 'Reverse code on 1–5: L + H', value: 1 + 5, shown: 6 },
    // reliability: Brindlecombe's advice scale
    ...[1.5, 0.8, 1.2].map((v, j) => ({ what: `Advice item ${j + 1} variance`, value: ADV_IV[j], shown: v, tol: 1e-9 })),
    { what: 'Sum of item variances', value: ADV_IV.reduce((a, b) => a + b, 0), shown: 3.5, tol: 1e-9 },
    ...[12, 7, 13, 10, 6, 9].map((v, i) => ({ what: `Advice total ${i + 1}`, value: ADV_TOT[i], shown: v })),
    { what: 'Mean of totals', value: ADV_TOT.reduce((a, b) => a + b, 0) / 6, shown: 9.5 },
    { what: 'Squared deviations of totals', value: ADV_TOT.reduce((a, t) => a + (t - 9.5) ** 2, 0), shown: 37.5 },
    { what: 'Item 1 mean', value: ADV_ITEM[0].reduce((a, b) => a + b, 0) / 6, shown: 3.5 },
    { what: 'Item 1 squared deviations', value: ADV_ITEM[0].reduce((a, x) => a + (x - 3.5) ** 2, 0), shown: 7.5 },
    { what: 'Total variance', value: ADV_TV, shown: 7.5, tol: 1e-9 },
    { what: '1 − 3.5 ÷ 7.5', value: 1 - 3.5 / 7.5, shown: 0.5333, tol: 0.00005 },
    { what: 'k ÷ (k − 1)', value: ADV_K / (ADV_K - 1), shown: 1.5 },
    { what: 'Alpha (advice scale)', value: ADV_ALPHA, shown: 0.80, tol: 1e-9 },
    // reliability thresholds quoted (Price et al.; Tavakol and Dennick)
    { what: 'Price et al.: +.80 good', value: 0.8, shown: 0.8 },
    { what: 'T&D: 0.70 to 0.95', value: 0.95 - 0.70, shown: 0.25, tol: 1e-9 },
    { what: 'T&D: maximum 0.90', value: 0.9, shown: 0.9 },
    // the qd-likert widget's alphas
    { what: 'Saltreed alpha, reversed', value: festAlpha(true), shown: 0.96, tol: 0.005 },
    { what: 'Saltreed alpha, unreversed', value: festAlpha(false), shown: -0.86, tol: 0.005 },
    { what: 'Demo: all-5 respondent, unreversed', value: (5 + 5 + 5 + 5) / 4, shown: 5.00 },
    { what: 'Demo: all-5 respondent, reverse-coded (not 5)', value: (5 + 5 + (6 - 5) + 5) / 4, shown: 4 },
  ],
};
