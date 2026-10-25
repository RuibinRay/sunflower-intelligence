// insights-and-reporting.js — M04 · Insights and reporting. Content only; exercises are in insights-and-reporting.ex.js.
// Draws on modules 1–3 only through case.js: the survey (DERIVED.coldbrew, nps, weights, survey), the focus groups
// (FOCUS_GROUPS, DERIVED.focus), the price audit (PRICE_AUDIT) and the sizing (COLD_BREW_SIZING, DERIVED.sizing), plus
// M02's plan (DEFAULT_PLAN) and M01's client interviews. Brackenmoor Folk Festival and Yarrowdale Dental are fictional.
// Ana's recommendation and decision rule are this lesson's (fictional) additions. Every printed figure is in `checks`.
import { RESPONDENTS, STRATA, FOCUS_GROUPS, PRICE_AUDIT, COLD_BREW_SIZING, DEFAULT_PLAN, CLIENT_INTERVIEWS, DERIVED as D } from './case.js?v=13';
import * as I from '../../../core/inference.js?v=13';

// ---------------------------------------------------------------- the figures this lesson quotes
const R = RESPONDENTS, N = R.length, Z = I.normInv(0.975);
const byS = STRATA.map((_, h) => R.filter((r) => r.stratum === h));
const t2 = byS.map((g) => g.filter((r) => r.coldbrew <= 2).length), nS = byS.map((g) => g.length);
const share = t2.map((x, h) => x / nS[h]);
const marg = share.map((p, h) => Z * Math.sqrt((p * (1 - p)) / nS[h]));
const WT = D.coldbrew.topTwoWeighted, NEFF = D.weights.kish.nEff;
const WM = Z * Math.sqrt((WT * (1 - WT)) / NEFF);
const SUBSHOP = I.propTest2(t2[0], nS[0], t2[1], nS[1]), SUBNEWS = I.propTest2(t2[0], nS[0], t2[3], nS[3]);
const mean = (a) => a.reduce((s, x) => s + x, 0) / a.length;
const brandAvg = PRICE_AUDIT.brands.map((_, j) => mean(PRICE_AUDIT.stores.map((s) => s.prices[j]).filter((p) => p != null)));
const brandN = PRICE_AUDIT.brands.map((_, j) => PRICE_AUDIT.stores.filter((s) => s.prices[j] != null).length);
const PRICE = DEFAULT_PLAN.price;
const SZ = D.sizing, CBS = COLD_BREW_SIZING;
const buSuper = CBS.plan.supermarket.listed * CBS.plan.supermarket.cansPerWeek * 52;
const buNatural = CBS.plan.natural.listed * CBS.plan.natural.cansPerWeek * 52;
const buDirect = CBS.directPerMonth * 12;
const Q = (who, theme) => FOCUS_GROUPS.quotes.find((q) => q.who === who && q.theme === theme).text;
const FG = FOCUS_GROUPS, FGN = FG.groups.reduce((s, g) => s + g.participants, 0);
// Yarrowdale Dental (fictional): stated against revealed demand for evening appointments
const YD = { surveyed: 640, wouldUse: 333, slots: 120, booked: 46, weeks: 8 };
// a truncated axis: subscribers against other shop customers on an axis starting at 50%
const AX0 = 50, sub = share[0] * 100, shop = share[1] * 100;

// ---------------------------------------------------------------- figures
const f1 = (x) => (Math.round(x * 10) / 10).toFixed(1);
const pct = (v) => `${(v * 100).toFixed(1)}%`;
const money = (v) => `$${v.toFixed(2)}`;

function ladderFigure() {
  const boxes = [
    ['Finding', 'What the data show', ['Weighted, 38.2% of the list', 'say they would buy;', 'subscribers 61.8%,', 'newsletter-only 31.0%.']],
    ['Insight', 'Why, and so what', ['Appeal rests on knowing', 'Lantern’s coffee; strangers', 'judge one more can', 'on price and on trial.']],
    ['Recommendation', 'Now what', ['Launch where Lantern', 'is known, sample to', 'strangers, and test', 'supermarkets first.']],
  ];
  const W = 196, H = 132, G = 36, T = 44;
  let s = '<svg viewBox="0 0 680 220" xmlns="http://www.w3.org/2000/svg" font-size="12" fill="currentColor">';
  s += '<defs><marker id="ir-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="var(--ink)"/></marker></defs>';
  boxes.forEach(([head, sub2, lines], i) => {
    const x = 10 + i * (W + G);
    s += `<rect x="${x}" y="${T}" width="${W}" height="${H}" rx="8" fill="var(--series-${i + 1})" fill-opacity="0.14" stroke="var(--rule-strong)" stroke-width="1.2"/>`;
    s += `<text x="${x + W / 2}" y="${T - 22}" text-anchor="middle" font-size="14" font-weight="600">${head}</text>`;
    s += `<text x="${x + W / 2}" y="${T - 6}" text-anchor="middle" font-size="11" fill="var(--ink-3)">${sub2}</text>`;
    lines.forEach((ln, k) => { s += `<text x="${x + 14}" y="${T + 30 + k * 22}">${ln}</text>`; });
    if (i < 2) s += `<line x1="${x + W + 4}" y1="${T + H / 2}" x2="${x + W + G - 4}" y2="${T + H / 2}" stroke="var(--ink)" stroke-width="1.6" marker-end="url(#ir-arrow)"/>`;
  });
  s += `<text x="340" y="${T + H + 34}" text-anchor="middle" font-size="11" fill="var(--ink-3)">Each step needs the one before it; an insight rests on more than one finding.</text>`;
  return `${s}</svg>`;
}

function honestFigure() {
  const bars = [['Subscribers', share[0], marg[0], nS[0]], ['Other shop customers', share[1], marg[1], nS[1]], ['Newsletter only', share[3], marg[3], nS[3]], ['All, weighted', WT, WM, N]];
  const L = 60, Rt = 640, T = 24, B = 210, max = 0.8;
  const X = (i) => L + 40 + i * ((Rt - L - 80) / (bars.length - 1));
  const Y = (v) => B - (v / max) * (B - T);
  let s = '<svg viewBox="0 0 680 290" xmlns="http://www.w3.org/2000/svg" font-size="12" fill="currentColor">';
  for (let v = 0; v <= max + 1e-9; v += 0.2) {
    s += `<line x1="${L}" x2="${Rt}" y1="${f1(Y(v))}" y2="${f1(Y(v))}" stroke="var(--rule-strong)" stroke-width="${v === 0 ? 1.4 : 0.5}"/>`;
    s += `<text x="${L - 8}" y="${f1(Y(v)) + 4}" text-anchor="end" font-size="11" fill="var(--ink-3)">${Math.round(v * 100)}%</text>`;
  }
  bars.forEach(([name, p, m, n], i) => {
    const x = X(i), w = 64;
    s += `<rect x="${f1(x - w / 2)}" y="${f1(Y(p))}" width="${w}" height="${f1(B - Y(p))}" fill="var(--series-${i === 3 ? 2 : 1})" opacity="0.55" stroke="var(--ink)" stroke-width="0.6"/>`;
    s += `<line x1="${f1(x)}" x2="${f1(x)}" y1="${f1(Y(p - m))}" y2="${f1(Y(p + m))}" stroke="var(--ink)" stroke-width="1.6"/>`;
    s += `<line x1="${f1(x - 9)}" x2="${f1(x + 9)}" y1="${f1(Y(p - m))}" y2="${f1(Y(p - m))}" stroke="var(--ink)" stroke-width="1.6"/>`;
    s += `<line x1="${f1(x - 9)}" x2="${f1(x + 9)}" y1="${f1(Y(p + m))}" y2="${f1(Y(p + m))}" stroke="var(--ink)" stroke-width="1.6"/>`;
    s += `<text x="${f1(x + 14)}" y="${f1(Y(p) - 6)}" font-size="12" font-weight="600">${pct(p)}</text>`;
    s += `<text x="${f1(x)}" y="${B + 18}" text-anchor="middle">${name}</text>`;
    s += `<text x="${f1(x)}" y="${B + 34}" text-anchor="middle" font-size="11" fill="var(--ink-3)">base ${n}</text>`;
  });
  s += `<text x="${L}" y="${B + 60}" font-size="11" fill="var(--ink-3)">Lines: 95% intervals. Weighted figure: weighted to the list’s segment sizes, interval from Kish’s effective n (469).</text>`;
  s += `<text x="${L}" y="${B + 76}" font-size="11" fill="var(--ink-3)">Workshop participants (base 27) not shown separately: base below 30. Axis starts at 0.</text>`;
  return `${s}</svg>`;
}

export default {
  slug: 'insights-and-reporting',
  title: 'Insights and reporting',
  blurb: 'Turn findings into insights and recommendations by combining survey, qualitative and secondary evidence; say what research can’t show and when only an experiment will do; and write a research report with honest charts, uncertainty in plain words and respondents kept anonymous.',
  status: 'draft',
  objectives: [
    'Distinguish a finding, an insight and a recommendation, and write an insight that explains a finding and implies an action.',
    'Combine quantitative, qualitative and secondary evidence by triangulation, and judge what the combination does and doesn’t support.',
    'Identify what a survey can’t show, such as causes or behaviour, and recommend a test market or A/B test where only an experiment can answer.',
    'Plan a research report from executive summary to appendix, including the method details that professional codes require.',
    'Design honest charts and tables, and describe uncertainty in words a manager can act on.',
    'Apply confidentiality in reporting: attributions that identify no one, small-cell suppression and care with quotations.',
  ],
  prerequisites: [
    { lesson: 'm04/analysing-survey-data', why: 'Bases, cross-tabs, top-box scores, the NPS and weighted results are the findings this lesson turns into a report.' },
    { lesson: 'm04/qualitative-research', why: 'The focus groups and the rules for reporting quotations honestly.' },
    { lesson: 'm04/market-sizing', why: 'The top-down and bottom-up sizes of the cold brew market.' },
    { lesson: 'm04/competitor-research', why: 'The shelf-price audit of Lantern Cold Brew’s rivals.' },
    { lesson: 'b01/interpreting-results', why: 'Correlation isn’t causation, confounding, and comparison groups.' },
    { lesson: 'b03/charts-and-conditional-formatting', why: 'Chart choice and the truncated axis.' },
  ],
  case: 'lantern',

  concept: [
    { case: 'By the first week of April 2027 Ana has every result her research plan asked for: the February survey, two focus groups on 10 and 12 March, a shelf-price audit at ten stores on 15–19 March, and her top-down and bottom-up sizing of the cold brew market. M02’s launch plan for Lantern Cold Brew sells 250 ml cans at $3.49 through supermarkets, natural and specialty grocers and Lantern’s own channel, with a first-year goal of about 100,000 cans. Ana must now turn four sets of results into one decision, and write it up for the people who will carry it out.' },
    { p: 'A stack of accurate figures doesn’t make a decision. That 38.2% of the list would definitely or probably buy, that Summit Brew averages $3.87 on the shelf and that a bottom-up estimate comes to 48,200 cans are all true, and none of them says what to do. This lesson is about the last step of research: turning findings into insights and recommendations, saying honestly what the research can’t show, and reporting it so that readers can check the work while respondents stay protected.' },

    { h: 'Findings, insights and recommendations' },
    { p: 'A <g>finding</g> is a fact the research established, stated with its base and its uncertainty: weighted to the list’s segments, 38.2% say they would definitely or probably buy Cold Brew, with 61.8% of subscribers against 31.0% of newsletter-only contacts. An <g>insight</g> explains why a finding occurs, rests on more than one piece of evidence, and points to something to do that the findings alone don’t. A recommendation is the action itself, with the conditions under which it should be taken and how its result will be checked.' },
    { figure: {
      svg: ladderFigure(),
      caption: 'From finding to insight to recommendation for Lantern Cold Brew. The insight explains the gap between segments and turns it into an action.',
      alt: 'Three boxes in a row joined by arrows. The first, headed “Finding: what the data show”, reads “Weighted, 38.2% of the list say they would buy; subscribers 61.8%, newsletter-only 31.0%.” The second, headed “Insight: why, and so what”, reads “Appeal rests on knowing Lantern’s coffee; strangers judge one more can on price and on trial.” The third, headed “Recommendation: now what”, reads “Launch where Lantern is known, sample to strangers, and test supermarkets first.” A note below says each step needs the one before it and an insight rests on more than one finding.',
    } },
    { p: '“Subscribers like Lantern more than newsletter readers do” isn’t an insight: it restates the finding. “Cold Brew’s appeal rests on knowing Lantern’s coffee” is one, because it explains the gap between the segments, it is supported by the focus groups as well as the survey, and it implies something specific: the people who don’t know Lantern need a reason to try the can.' },

    { h: 'Triangulation: four views of Cold Brew' },
    { p: '<g>Triangulation</g> checks a conclusion against evidence from different methods, whose weaknesses differ, so that agreement strengthens it and disagreement shows where to look. Ana has four sources on Cold Brew, each with something the others lack: the survey, the focus groups, the <g>shelf-price audit</g> and the sizing.' },
    { table: {
      caption: 'What each piece of Lantern’s 2027 research says about Cold Brew, and what it can’t say',
      head: ['Source', 'What it says', 'What it can’t say'],
      align: ['l', 'l', 'l'],
      rows: [
        ['Survey (February; 516 completes)', `Weighted, ${pct(WT)} in the top two boxes; subscribers ${pct(share[0])}, newsletter-only ${pct(share[3])}.`, 'How many will actually buy; anything about people not on Lantern’s list.'],
        [`Focus groups (March; ${FGN} people)`, 'Subscribers talk about taste and trust; ready-to-drink buyers who don’t know Lantern talk about price and about needing to try it.', 'How common any view is.'],
        [`Price audit (March; ${PRICE_AUDIT.stores.length} stores)`, `At ${money(PRICE)}, Cold Brew would be ${money(PRICE - brandAvg[2])} above Arcadia Coffee’s average shelf price, ${money(PRICE - brandAvg[1])} above Daily Grind RTD’s and ${money(brandAvg[0] - PRICE)} below Summit Brew’s.`, 'Sales at those prices; anything outside one week.'],
        ['Sizing (March)', `Bottom-up, ${SZ.bottomUpCans.toLocaleString('en-US')} cans in year one, ${(SZ.bottomUpShareOfSam * 100).toFixed(1)}% of the planned channels’ ${(SZ.samCans / 1e6).toFixed(2)} million; the goal of ${CBS.goalCans.toLocaleString('en-US')} is ${(SZ.goalShareOfSam * 100).toFixed(1)}%.`, 'Whether Ana’s listings and sales per store will happen.'],
      ],
    } },
    { p: `The sources agree on the shape of the answer. The survey finds intent highest where people know Lantern; subscribers in the focus groups say “${Q('A3', 0)}” and “${Q('A3', 1)}”. People who don’t know Lantern are cooler in the survey and say, in the focus group, “${Q('B2', 1)}” and “${Q('B4', 0)}”; the audit confirms that the cheapest cans on the shelf, Daily Grind RTD’s, average ${money(PRICE - brandAvg[1])} less. And the bottom-up estimate, built from listings and sales per store rather than from intent, comes to about half the goal. That is the insight: Cold Brew’s first-year volume will come from Lantern’s own customers and from turning strangers into triers, and the second is the risk.` },

    { h: 'What research can and can’t show' },
    { p: 'A survey shows associations: subscribers are keener on Cold Brew. It can’t show that subscribing makes people keener, because loyalty to Lantern may lead people both to subscribe and to want its new product: a <g>confounding variable</g> of the kind B01 described. Nor can it show what people will do: intent is a <g>stated preference</g>, what people say they would choose, and <i>Survey error</i> showed that it overstates buying. A <g>revealed preference</g> is read from what people actually choose, in sales records or in a test.' },
    { p: 'Some questions only an experiment can answer. Whether free cans turn strangers into repeat buyers, or whether $3.49 sells fewer cans than $2.99, are questions about <g>causation</g>, and the reliable way to answer them is to vary the cause on purpose and compare. A <g>test market</g> (M02) launches in a few stores before the rest; an <g>A/B test</g> (B01) randomly assigns visitors to two versions of a web page or offer. B12 Experimental Design teaches how to design both.' },

    { h: 'Reporting it' },
    { p: 'The research report carries the findings to people who weren’t in the analysis. It leads with the answer, separates what the data show from what the researcher concludes, shows every figure with its base and uncertainty, and states its limitations as plainly as its results. It also protects the people who took part: no one should be identifiable from a quotation, a table cell or a chart.' },
    { callout: 'key', title: 'Three tests for every line of a report', html: '<b>Is it supported?</b> Every claim traces to data, with its base and margin; anything else is labelled as interpretation. <b>Is it useful?</b> Findings lead to insights and insights to actions, with the condition that would change the action. <b>Is it safe?</b> No respondent can be recognised, and no figure is shown on a base too small to bear it.' },
  ],

  theory: [
    { h: 'Writing an insight' },
    { p: 'An insight answers “why?” and then “so what?”. A useful test has three parts: does it explain a finding rather than restate it; does more than one piece of evidence support it; and does it suggest an action that a reader of the findings alone wouldn’t have reached? “Delivery speed was raised by 18.0% of subscribers and 8.1% of newsletter-only respondents” is a finding. “Subscribers notice delivery because the monthly box is a promise, and one late box breaks it” is a candidate insight: it explains the gap, it can be checked against the wording of the open answers and Lantern’s delivery records, and it suggests fixing the subscription deliveries first.' },
    { p: 'Insights are hypotheses with evidence, not facts. Write them so that they could turn out wrong, say what evidence supports them, and say what would show them wrong. An insight built on one striking quotation, or on a difference smaller than its margin of error, is a guess.' },

    { h: 'Triangulating in practice' },
    { p: 'Sources can converge (they point the same way), complement each other (one explains what another only measures, as the focus groups explain the survey’s gap between segments) or diverge. Divergence is itself a finding: if the survey had shown newsletter readers as keen as subscribers while the focus group of non-buyers rejected the price, Ana would need to ask which sample was unusual, or whether the survey’s price wording differed from what the focus group was shown. Weigh sources by their quality for the question at hand, not by counting them like votes: two weak sources that share a weakness, such as two surveys of Lantern’s own list, don’t make a strong one.' },
    { p: 'Qualitative evidence never becomes a share. In Ana’s two <g>focus groups</g>, four of the 20 coded quotations were about price, but that doesn’t mean 20% of buyers care about price: the quotations were chosen to illustrate themes, and the 15 participants were recruited, not sampled. Two coders agreed on 18 of the 20 codes (90%), an <g>inter-coder agreement</g> that says the themes were applied consistently, not how common they are.' },

    { h: 'Association, causation and experiments' },
    { p: 'A cross-tab or a chi-square test shows that two answers go together. To read it as a cause you would need to rule out every other explanation, which observational data rarely allow. B01’s comparison groups help, and so does a pattern that holds within subgroups, but the strongest design assigns the cause at random. The questions Ana’s report must leave open are causal ones: whether sampling raises repeat buying, and how much the price changes sales.' },
    { p: 'A test market answers such questions with real purchases. A design for Cold Brew: list it in some of the planned supermarkets for twelve weeks, offer free cans in half of them chosen at random, and compare cans sold per store per week. Random assignment means the two halves differ only by chance and by the sampling, so a clear difference can be put down to the sampling. Experiments cost time and money, so run one when the decision is large and the answer uncertain, which is the value-of-research logic of <i>The research process</i>.' },

    { h: 'Stated and revealed preference' },
    { p: 'Stated preferences are cheap to collect and can cover products that don’t exist yet, but they are hypothetical: answering “probably” costs nothing, and people want to please a researcher, or a brand they like. Revealed preferences are what people did with their own money, but they exist only for choices people have actually faced. Use stated intent to compare groups, rank options and spot problems, and revealed behaviour, from sales data or a test, to forecast volume. When the two disagree, trust behaviour about how much and use the survey to understand who and why.' },

    { h: 'The research report' },
    { p: 'A report is organised around the reader’s decision, not around the order in which the work was done. This course uses the structure below; some organisations put the limitations straight after the method, which is equally good, provided they are not left out.' },
    { table: {
      caption: 'The parts of a research report',
      head: ['Part', 'What it does', 'In Ana’s Cold Brew report'],
      align: ['l', 'l', 'l'],
      rows: [
        ['Executive summary', 'The answer first: the recommendation, the three or four findings behind it with their uncertainty, and the main limitation, on one page.', 'Launch in stages, with the evidence and the decision rule.'],
        ['Background and objectives', 'The decision, the research questions and what the research was meant to settle.', 'Whether and how to launch Cold Brew in 2027.'],
        ['Method', 'Who did what, to whom, when and how: enough to judge the results.', 'Survey, focus groups, audit and sizing, each with its sample and dates.'],
        ['Findings', 'The results, organised by research question, each with its base and margin.', 'Intent by segment, reasons, prices, size.'],
        ['Limitations', 'What could make the findings wrong, and in which direction.', 'Lantern’s own list; stated intent; non-response.'],
        ['Conclusions and recommendations', 'The interpretation and the actions, kept apart from the findings.', 'The staged launch and its decision rule.'],
        ['Appendix', 'The questionnaire, full tables, the code frame and technical details.', 'The six questions, every cross-tab, the weights.'],
      ],
    } },
    { p: 'For a survey, the method section should cover what AAPOR’s Code of Professional Ethics and Practices (revised 2021) requires researchers to disclose when they release results: who sponsored and conducted the research, the exact question wording, the population studied, how the sample was drawn and recruited, the mode and dates of data collection, the sample sizes and the precision of the results, how the data were weighted and processed, and a general statement of the design’s limitations. For Ana’s survey that means 2,004 invitations from the mailing list, a proportional stratified sample, a web questionnaire from 2 to 16 February 2027, 516 completes (a response rate of 25.7%), weighting to segment sizes and the margins that go with it.' },
    { p: 'The professional codes add a rule of presentation: findings, interpretation and recommendations must be told apart. The MRS Code of Conduct (2023) requires members to ensure that outputs “clearly distinguish between facts, opinion, and interpretation” (rule 60), and the ICC/ESOMAR International Code (2025 revision) asks researchers to distinguish findings from their interpretation and from any recommendations, and to give clients enough technical information to judge the results. A report that blends them leaves the reader unable to tell evidence from advocacy.' },

    { h: 'Honest charts and tables' },
    { p: 'A chart is honest when a reader who looks at it quickly takes away what the data support and no more. The rules follow from the earlier lessons:' },
    { list: [
      '<b>Show the base</b> under every bar or column, and say whether figures are weighted; give weighted figures with their unweighted base.',
      '<b>Show uncertainty</b>: intervals on bars, or margins in a note, so that readers don’t read differences smaller than the noise.',
      '<b>Start bars at zero.</b> A <g>truncated axis</g> exaggerates differences between shares. With the axis starting at 50%, subscribers’ 61.8% bar is 2.2 times the height of other shop customers’ 55.3% bar, although the true ratio is 1.12 and the two can’t be told apart.',
      '<b>Leave out bases below your minimum</b>, or mark them clearly, rather than plotting them like the rest.',
      '<b>Keep scales in their natural order</b> (definitely … definitely not), use the same axis for charts that will be compared, and label units: an NPS is in points, not per cent.',
    ] },
    { figure: {
      svg: honestFigure(),
      caption: 'An honest chart of Cold Brew intent: bases under each bar, 95% intervals, a weighted overall figure labelled as such, a zero baseline, and the small segment left out with a note.',
      alt: `A bar chart of the share in the top two boxes for Cold Brew, with a vertical axis from 0% to 80%. Subscribers ${pct(share[0])} (base ${nS[0]}), interval about ${f1((share[0] - marg[0]) * 100)}% to ${f1((share[0] + marg[0]) * 100)}%. Other shop customers ${pct(share[1])} (base ${nS[1]}), interval ${f1((share[1] - marg[1]) * 100)}% to ${f1((share[1] + marg[1]) * 100)}%. Newsletter only ${pct(share[3])} (base ${nS[3]}), interval ${f1((share[3] - marg[3]) * 100)}% to ${f1((share[3] + marg[3]) * 100)}%. All, weighted ${pct(WT)} (base ${N}), interval ${f1((WT - WM) * 100)}% to ${f1((WT + WM) * 100)}%. Notes say the lines are 95% intervals, the weighted figure uses Kish’s effective n of 469, and workshop participants (base 27) are not shown because their base is below 30.`,
    } },

    { h: 'Uncertainty in words' },
    { p: 'Most readers don’t read intervals, so the words must carry them. Give a range where it matters (“between 34% and 43% of the list”), and choose the verb by what the interval allows.' },
    { table: {
      caption: 'Choosing words for a comparison from its 95% interval',
      head: ['What the interval shows', 'Words that fit', 'Lantern example'],
      align: ['l', 'l', 'l'],
      rows: [
        ['The whole interval is on one side of zero', '“higher”, “clearly higher”, “by between … and … points”', `Subscribers are clearly keener than newsletter-only contacts: by ${f1(SUBNEWS.low * 100)} to ${f1(SUBNEWS.high * 100)} points.`],
        ['The interval includes zero and is wide', '“can’t be told apart on these data”, “we can’t say which is higher”', `Subscribers and other shop customers: the gap could be anywhere from ${f1(SUBSHOP.low * 100)} to +${f1(SUBSHOP.high * 100)} points.`],
        ['The interval includes zero and is narrow', '“little or no difference”', 'Only when the data could have detected a difference that mattered.'],
        ['The base is below the minimum', 'No figure: “too few answers to report separately”', 'Workshop participants (27).'],
      ],
    } },
    { p: 'Avoid words that claim more than a sample can: “proves”, “all customers”, “will buy”. Avoid “significant” on its own for readers who will hear “important”; say what the test showed instead (“a gap this large would rarely arise by chance”). And never turn “no evidence of a difference” into “no difference”.' },

    { h: 'Confidentiality and anonymity in reporting' },
    { p: 'People take part in research on a promise of <g>confidentiality</g>: the researcher may know who said what but won’t reveal it. Ana’s survey isn’t anonymous in the strict sense, since each answer is linked to a person on her list, so it is the reporting that must keep the promise. The MRS Code of Conduct (2023) requires members to preserve participants’ anonymity in what they share unless they have consented to be identified (rule 49), to take reasonable action to make anonymisation effective (rule 50), and to take particular care not to identify participants inadvertently, especially where samples are very small, as in business and employee projects (rule 51). The ICC/ESOMAR Code asks researchers to ensure that personal data can’t be traced by <g>deductive disclosure</g>: recognising someone by combining details that are harmless on their own.' },
    { p: 'Three habits keep a report safe. Attribute quotations by role or group code (“participant A3, subscriber group”), never by name, and cut details that point to one person, such as an employer, a job title or a street. Suppress small cells: Ana’s 27 workshop participants include only 5 aged 55 or over, and crossing them with how they first heard of Lantern produces cells of two and three people whom the workshop leader could recognise. This <g>cell suppression</g> has a trap: if a table shows a total and every cell but one, the hidden cell can be worked out, so a second cell must be hidden too or the categories merged. And treat business-to-business work with extra care: Lantern’s 12 catering clients are few enough that a quotation about “a law firm’s board meeting” could identify one of them.' },

    { h: 'Acting on research' },
    { p: 'Research is worth what it changes. A recommendation should name who will do what by when, the condition under which the plan changes, and the measure that will be watched. The condition works best as an <g>action standard</g>, agreed before the results arrive so that nobody can move it to suit them. After the decision, compare what happened with what the research predicted: the gap is the best evidence on how far to trust the next survey.' },
  ],

  formulas: [],

  examples: [
    { level: 'simple', title: 'Sorting a festival’s research notes', fictional: true,
      setup: 'Brackenmoor Folk Festival surveyed 1,200 ticket holders after its 2026 festival. Its marketing officer has five lines for the report: (a) “62% of first-time visitors rated the campsite poor or very poor, against 21% of returning visitors.” (b) “First-timers judge the campsite against hotels, because nobody told them what to bring; returners pack for it.” (c) “Send first-time buyers a what-to-bring guide with their tickets in 2027 and compare campsite ratings with 2026.” (d) “The campsite is unpopular.” (e) “Ratings of the music were high in every group.” Which line is the insight, and what is wrong with line (d)?',
      steps: [
        'Findings state what the data show, with groups and figures: (a) and (e) are findings, both checkable against the survey tables.',
        'An insight explains why and implies something to do: (b) explains the gap in (a), and it is supported by more than the ratings if the open answers mention not knowing what to bring. It is the insight.',
        'A recommendation is an action with a way to check it: (c), which also builds in a comparison, 2027 against 2026.',
        'Line (d) is a finding stated badly: it drops the base, the groups and the size of the gap, and so hides the very difference that leads to the insight.',
      ],
      answer: 'Line (b) is the insight; (a) and (e) are findings and (c) the recommendation. Line (d) should be replaced by the finding it summarises, (a), with its base.',
      interpretation: 'A report built only from lines like (d) gives readers nothing to act on. The comparison in (a) is what makes the insight possible, which is why the finding should keep its groups and figures. The guide is cheap to test, and the 2027 survey will show whether it worked, though a change in ratings could also come from the weather, so the officer should say so.' },
    { level: 'challenging', title: 'Evening appointments: what patients say and what they do', fictional: true,
      setup: `Yarrowdale Dental runs four practices. In its patient survey, ${YD.wouldUse} of ${YD.surveyed} patients said they would use evening appointments (6 to 8 p.m.) “often” or “sometimes”. The group then opened evening sessions at one practice for ${YD.weeks} weeks, offering ${YD.slots} appointments; ${YD.booked} were booked. The manager wants to open evenings at all four practices. What should the research report say?`,
      steps: [
        `Findings: ${pct(YD.wouldUse / YD.surveyed)} of surveyed patients say they would use evenings (a stated preference); ${pct(YD.booked / YD.slots)} of the evening slots offered were booked over ${YD.weeks} weeks (a revealed preference).`,
        'Triangulate: the two point the same way (there is some demand) but disagree on how much. Saying “sometimes” costs nothing, and the survey can’t show how often “sometimes” is; the bookings are what patients did. Trust the bookings for volume.',
        'Ask what the trial can’t show: it ran at one practice, recently opened and perhaps not yet known to patients, and eight weeks may be too short for a habit to form. Bookings might grow; they might also have come from patients who would otherwise have booked daytime slots.',
        'Recommend: keep evenings at the trial practice for another quarter, advertise them to its patients, and track both evening bookings and daytime bookings; extend to a second practice only if evening slots pass a fill rate set in advance, such as 60%.',
      ],
      answer: `The report should say that about half of patients say they would use evenings, but only ${pct(YD.booked / YD.slots)} of evening slots were booked in an ${YD.weeks}-week trial, so demand is real but much smaller than the survey suggests; extend evenings only if a longer trial reaches a fill rate set in advance.`,
      interpretation: 'The survey still has a job: crossing interest with age and working hours shows who wants evenings and why, which helps target the advertising. What it can’t do is size the demand. A trial that also tracked daytime bookings would show whether evenings add patients or only move them.' },
    { level: 'applied', title: 'Ana’s recommendation on Cold Brew', fictional: true,
      setup: 'Using all four sources and their limits, write the recommendation section of Ana’s Cold Brew report: what to do, why, and what would change the plan.',
      steps: [
        `State the findings with their bases: weighted, ${pct(WT)} of the list (unweighted base ${N}) in the top two boxes, roughly ${Math.round((WT - WM) * 100)}% to ${Math.round((WT + WM) * 100)}%; subscribers ${pct(share[0])} against newsletter-only ${pct(share[3])}; non-buyers in the focus groups compare ${money(PRICE)} with cans costing a dollar less; bottom-up volume ${SZ.bottomUpCans.toLocaleString('en-US')} cans against a goal of ${CBS.goalCans.toLocaleString('en-US')}.`,
        `Draw the insight from where the sources agree: appeal rests on knowing Lantern; strangers decide on price and trial. The bottom-up estimate points the same way: natural grocers, whose shoppers pay more for quality and provenance (M02), and Lantern’s own channel supply ${buNatural.toLocaleString('en-US')} and ${buDirect.toLocaleString('en-US')} cans, more than two-thirds of it; supermarkets supply ${buSuper.toLocaleString('en-US')}.`,
        `Recommend actions that match the evidence: launch in Lantern’s own channel and the natural grocers; plan year one on about 48,000 cans, not 100,000; aim the plan’s $${DEFAULT_PLAN.promotion.sampling.toLocaleString('en-US')} sampling budget at people who don’t know Lantern; and list in a few supermarkets first as a test market, with free cans in half of them chosen at random.`,
        'Set the decision rule before launch: extend to the other planned supermarkets only if the test stores reach a <g>rate of sale</g> of at least 10 cans a store a week over 12 weeks, Ana’s own planning figure, and keep the sampling only if sampled stores sell clearly more.',
        'State the limits: the survey covers Lantern’s list, not the city’s ready-to-drink buyers; intent is stated, not behaviour; non-response probably flatters the results, since promoters answered more readily; the focus groups show reasons, not shares; the audit is one week; and the sizing rests on Ana’s assumptions about listings and sales per store.',
      ],
      answer: 'Launch Cold Brew in stages: Lantern’s own channel and natural grocers first, sampling aimed at people who don’t know Lantern, and a randomised test in a few supermarkets with a decision rule of 10 cans a store a week; plan on about 48,000 cans in year one, with the 100,000-can goal treated as what success in the test would unlock.',
      interpretation: 'The recommendation follows from the insight and is bounded by the limits: it doesn’t ask the survey to forecast volume, and it lets the test market answer the causal questions, sampling and supermarket demand, that no survey can. If the test stores sell well, the goal comes back into reach; if they don’t, Lantern has spent a fraction of a full supermarket launch to find out.' },
  ],

  demo: [
    { widget: 'ir-words', intro: 'Two groups’ percentages and bases give an interval for the gap and the words it supports. Start with subscribers against other shop customers, then try subscribers against newsletter-only contacts (31.0%, base 297), and a base of 27 to see the small-base rule apply.' },
    { widget: 'ir-chart', intro: 'Cold Brew intent by segment as a report chart: bases in the labels, the weighted figure marked, the small segment left out. The axis starts at zero; compare what the gap between the first two bars looks like here with the truncated axis described in In depth.' },
  ],

  mistakes: [
    { title: '“The insight is that 38% would buy.”', html: 'That is a finding. An insight explains why a finding occurs, rests on more than one source, and implies an action the finding alone doesn’t, such as aiming sampling at people who don’t know Lantern.' },
    { title: '“Four sources agree, so the case is proven.”', html: 'Sources that share a weakness don’t strengthen each other: a survey of Lantern’s list and focus groups of its subscribers both over-represent people who know Lantern. Triangulation is strong when the methods’ weaknesses differ.' },
    { title: '“Four of the 20 quotations were about price, so 20% of buyers care about price.”', html: 'Quotations are chosen to illustrate themes from a recruited group of 15. Qualitative work shows what views exist and why, not how common they are.' },
    { title: '“Subscribers are keener, so turning customers into subscribers will raise demand.”', html: 'The survey shows an association. Loyal customers choose to subscribe and also like Lantern’s coffee: a confounding variable. Only a design that varies the cause, such as an experiment, can show what subscribing does.' },
    { title: '“Put everything in the findings; readers can judge.”', html: 'The codes require findings, interpretation and recommendations to be told apart. Lead with the answer in the executive summary, keep each finding with its base and margin, and label conclusions as conclusions.' },
    { title: '“A quotation is anonymous if the name is removed.”', html: 'A job title, an employer, a street or a small group can identify someone just as well. Attribute by group code, cut identifying details, suppress small cells, and take extra care with business-to-business samples.' },
  ],

  application: [
    { case: `Ana’s executive summary, as she presents it to her team on 6 April 2027: “Recommendation: launch Lantern Cold Brew in stages. The people who know Lantern want it: weighted to our list, ${pct(WT)} say they would definitely or probably buy (roughly ${Math.round((WT - WM) * 100)}% to ${Math.round((WT + WM) * 100)}%; 516 completes), with subscribers far keener than newsletter-only contacts (${Math.round(share[0] * 100)}% against ${Math.round(share[3] * 100)}%). People who don’t know Lantern compare ${money(PRICE)} with cans that cost a dollar less and want to try before they buy. Our bottom-up estimate is about 48,000 cans in year one, half the goal. So we launch in our own channel and natural grocers, aim free cans at strangers, and test a few supermarkets before listing in the rest. These are stated intentions from our own customers, not forecasts of sales.”` },
    { p: '<b>She answers the question behind the question.</b> Her team asks whether 38% means the goal is safe. Ana explains that the figure describes people on Lantern’s own list, who know the brand, and that intent overstates buying; the sizing, built from stores and sales per store, is the better guide to volume. She shows the chart with intervals and leaves the workshop participants out, saying why.' },
    { p: '<b>She keeps the respondents out of it.</b> A team member asks who said the can should have a lantern on it. Ana quotes the remark by its code, A2, as in the report, and declines to say more: participants were promised anonymity. The catering interviews from November 2026 appear only as counts of reasons, because 12 clients are few enough to recognise.' },
    { p: '<b>She writes down what would change her mind.</b> The decision log records the plan, the owner of each action, and the rule: if the test supermarkets average fewer than 10 cans a store a week over 12 weeks, Lantern stays out of the remaining supermarkets for 2027 and puts the money into its own channel. When the test ends she will compare its sales with the bottom-up assumptions, and the gap will tell her how far to trust the next round of research.' },
  ],

  summary: [
    'A finding states what the data show, with base and uncertainty; an insight explains why, rests on more than one source and implies an action; a recommendation is the action, with its conditions and a way to check it.',
    'Triangulation combines methods whose weaknesses differ. Convergence strengthens a conclusion, divergence is itself a finding, and qualitative counts never become shares.',
    'Surveys show associations and stated preferences. Causes and volumes need revealed behaviour or an experiment: a test market or an A/B test.',
    'A report leads with the answer, discloses its method (AAPOR’s list: sponsor, wording, population, sample, mode, dates, sizes and precision, weighting, processing, limitations) and keeps findings apart from interpretation.',
    'Honest charts show bases and intervals, start bars at zero, leave out small bases and keep scales in order; words follow the interval: “clearly higher” only when it excludes zero.',
    'Keep respondents anonymous: quotations by code, identifying details cut, small cells suppressed (and a second cell when totals would reveal the first), extra care with business samples.',
    'Act on research with an owner, a decision rule set in advance and a later comparison of outcome with prediction.',
  ],

  glossary: [
    { term: 'Finding', def: 'A fact a piece of research established, stated with its base and uncertainty, such as the share of respondents who chose an answer.' },
    { term: 'Insight', def: 'An explanation of why a finding occurs, supported by more than one piece of evidence, that suggests an action the findings alone don’t.' },
    { term: 'Stated preference', def: 'What people say they would choose or do, collected in a survey or interview; for a purchase it usually overstates what they go on to do.' },
    { term: 'Revealed preference', def: 'A preference inferred from what people actually chose or bought, as in sales records or a test market.' },
    { term: 'Executive summary', def: 'The opening page of a report, giving the answer and the recommendation first, with the main findings, their uncertainty and the main limitation.' },
    { term: 'Deductive disclosure', def: 'Identifying a research participant by combining pieces of information that don’t identify anyone on their own, such as a role, a location and an age group.' },
    { term: 'Cell suppression', def: 'Withholding a table cell based on too few people to report reliably or anonymously; a second cell is withheld when totals would otherwise reveal the first.' },
  ],

  references: [
    { text: 'Gomez Albrecht, M., Green, M. &amp; Hoffman, L. (2023). <i>Principles of Marketing</i>, section 6.3, “Steps in a Successful Marketing Research Plan” (step 7, preparing the research report and recommendations). OpenStax.', url: 'https://openstax.org/books/principles-marketing/pages/6-3-steps-in-a-successful-marketing-research-plan', checked: '2026-10-24' },
    { text: 'American Association for Public Opinion Research (2021). <i>AAPOR Code of Professional Ethics and Practices</i>, section III.A, “Disclosure Standards”.', url: 'https://aapor.org/standards-and-ethics/disclosure-standards', checked: '2026-10-24' },
    { text: 'Market Research Society (2023). <i>MRS Code of Conduct</i>, effective 15 May 2023: rules 49–51 (participant anonymity) and 58–64 (reporting).', url: 'https://www.mrs.org.uk/pdf/MRS-code-of-conduct-2023.pdf', checked: '2026-10-24' },
    { text: 'ICC and ESOMAR (2025). <i>ICC/ESOMAR International Code on Market, Opinion and Social Research and Data Analytics</i>, fifth edition: articles 6 (data protection, deductive disclosure), 7 (fit for purpose), 8 (transparency) and 9 (publishing findings).', url: 'https://community.esomar.org/uploads/public/knowledge-and-standards/codes-and-guidelines/ICCESOMAR-International-Code_English.pdf', checked: '2026-10-24' },
    { text: 'Parker, J. D., Talih, M., Malec, D. J. et al. (2017). <i>National Center for Health Statistics Data Presentation Standards for Proportions</i>. Vital and Health Statistics, Series 2, No. 175.', url: 'https://stacks.cdc.gov/view/cdc/47786', checked: '2026-10-24' },
  ],

  checks: [
    // the research Ana has
    { what: 'Audit stores', value: PRICE_AUDIT.stores.length, shown: 10 },
    { what: 'Focus-group participants', value: FGN, shown: 15 },
    { what: 'Quotations', value: FG.quotes.length, shown: 20 },
    { what: 'Price quotations', value: D.focus.quotesByTheme[1], shown: 4 },
    { what: 'Price quotations as % of quotations', value: (D.focus.quotesByTheme[1] / FG.quotes.length) * 100, shown: 20 },
    { what: 'Coders agreed', value: FG.coderAgreement.agreed, shown: 18 },
    { what: 'Agreement %', value: D.focus.agreement * 100, shown: 90 },
    { what: 'Cold Brew price', value: PRICE, shown: 3.49 },
    { what: 'Goal cans', value: CBS.goalCans, shown: 100000 },
    { what: 'Summit average', value: brandAvg[0], shown: 3.87 },
    { what: 'Above Arcadia', value: PRICE - brandAvg[2], shown: 0.54 },
    { what: 'Above Daily Grind', value: PRICE - brandAvg[1], shown: 1.16 },
    { what: 'Below Summit', value: brandAvg[0] - PRICE, shown: 0.38 },
    { what: 'A dollar or more less: Daily Grind gap', value: Number(PRICE - brandAvg[1] >= 1), shown: 1 },
    { what: 'Bottom-up cans', value: SZ.bottomUpCans, shown: 48200 },
    { what: 'Bottom-up about 48,000', value: SZ.bottomUpCans, shown: 48000, tol: 500 },
    { what: 'Bottom-up share of SAM %', value: SZ.bottomUpShareOfSam * 100, shown: 1.4, tol: 0.05 },
    { what: 'Goal share of SAM %', value: SZ.goalShareOfSam * 100, shown: 3.0, tol: 0.05 },
    { what: 'SAM millions', value: SZ.samCans / 1e6, shown: 3.36 },
    { what: 'Bottom-up about half the goal', value: SZ.bottomUpCans / CBS.goalCans, shown: 0.5, tol: 0.02 },
    { what: 'Bottom-up supermarkets', value: buSuper, shown: 15600 },
    { what: 'Bottom-up natural', value: buNatural, shown: 18200 },
    { what: 'Bottom-up direct', value: buDirect, shown: 14400 },
    { what: 'Natural + direct more than two-thirds', value: Number((buNatural + buDirect) / SZ.bottomUpCans > 2 / 3), shown: 1 },
    { what: 'Bottom-up parts add up', value: buSuper + buNatural + buDirect, shown: SZ.bottomUpCans },
    { what: 'Sampling budget', value: DEFAULT_PLAN.promotion.sampling, shown: 40000 },
    { what: 'Decision rule: Ana’s supermarket cans a store a week', value: CBS.plan.supermarket.cansPerWeek, shown: 10 },
    { what: 'Test weeks', value: 12, shown: 12 },
    { what: 'Catering clients interviewed', value: CLIENT_INTERVIEWS.interviewed, shown: 12 },
    // the survey
    { what: 'Weighted top two %', value: WT * 100, shown: 38.2, tol: 0.05 },
    { what: 'Weighted top two, whole %', value: WT * 100, shown: 38, tol: 0.5 },
    { what: 'Subscribers top two %', value: share[0] * 100, shown: 61.8, tol: 0.05 },
    { what: 'Newsletter top two %', value: share[3] * 100, shown: 31.0, tol: 0.05 },
    { what: 'Shop top two %', value: share[1] * 100, shown: 55.3, tol: 0.05 },
    { what: 'Subscribers whole %', value: share[0] * 100, shown: 62, tol: 0.5 },
    { what: 'Newsletter whole %', value: share[3] * 100, shown: 31, tol: 0.5 },
    { what: 'Completes', value: N, shown: 516 },
    { what: 'Invitations', value: D.survey.allocation.reduce((a, b) => a + b, 0), shown: 2004 },
    { what: 'RR1 %', value: D.survey.rr.RR1 * 100, shown: 25.7, tol: 0.05 },
    { what: 'Weighted margin low (whole %)', value: (WT - WM) * 100, shown: 34, tol: 0.5 },
    { what: 'Weighted margin high (whole %)', value: (WT + WM) * 100, shown: 43, tol: 0.5 },
    { what: 'Kish n', value: NEFF, shown: 469, tol: 0.5 },
    { what: 'Sub v news CI low', value: SUBNEWS.low * 100, shown: 19.4, tol: 0.05 },
    { what: 'Sub v news CI high', value: SUBNEWS.high * 100, shown: 42.2, tol: 0.05 },
    { what: 'Sub v shop CI low', value: SUBSHOP.low * 100, shown: -7.5, tol: 0.05 },
    { what: 'Sub v shop CI high', value: SUBSHOP.high * 100, shown: 20.4, tol: 0.05 },
    { what: 'Workshop base', value: nS[2], shown: 27 },
    { what: 'Workshop 55 or over', value: byS[2].filter((r) => r.age === 2).length, shown: 5 },
    { what: 'Workshop 55+ by first heard: largest cell', value: Math.max(...[0, 1, 2, 3, 4].map((k) => byS[2].filter((r) => r.age === 2 && r.heard === k).length)), shown: 3 },
    { what: 'Workshop 55+ by first heard: smallest non-empty cell', value: Math.min(...[0, 1, 2, 3, 4].map((k) => byS[2].filter((r) => r.age === 2 && r.heard === k).length).filter((x) => x > 0)), shown: 2 },
    { what: 'Minimum base', value: 30, shown: 30 },
    { what: 'Delivery speed, subscribers %', value: (byS[0].filter((r) => r.theme === 2).length / nS[0]) * 100, shown: 18.0, tol: 0.05 },
    { what: 'Delivery speed, newsletter only %', value: (byS[3].filter((r) => r.theme === 2).length / nS[3]) * 100, shown: 8.1, tol: 0.05 },
    // truncated axis
    { what: 'Apparent ratio with axis at 50%', value: (sub - AX0) / (shop - AX0), shown: 2.2, tol: 0.05 },
    { what: 'True ratio', value: sub / shop, shown: 1.12 },
    // Brackenmoor
    { what: 'Brackenmoor ticket holders', value: 1200, shown: 1200 },
    { what: 'Brackenmoor first-timers poor %', value: 62, shown: 62 },
    { what: 'Brackenmoor returners poor %', value: 21, shown: 21 },
    // Yarrowdale
    { what: 'Yarrowdale would use %', value: (YD.wouldUse / YD.surveyed) * 100, shown: 52.0, tol: 0.05 },
    { what: 'Yarrowdale about half', value: YD.wouldUse / YD.surveyed, shown: 0.5, tol: 0.03 },
    { what: 'Yarrowdale fill %', value: (YD.booked / YD.slots) * 100, shown: 38.3, tol: 0.05 },
    { what: 'Yarrowdale practices', value: 4, shown: 4 },
    { what: 'Yarrowdale fill-rate rule %', value: 60, shown: 60 },
    { what: 'Yarrowdale weeks', value: YD.weeks, shown: 8 },
    // codes
    { what: 'MRS rule on facts and interpretation', value: 60, shown: 60 },
    { what: 'AAPOR code revision year', value: 2021, shown: 2021 },
  ],
};
