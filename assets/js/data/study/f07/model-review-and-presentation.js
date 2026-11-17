// model-review-and-presentation.js — F07 · Model review and presentation. Content only; exercises are in
// model-review-and-presentation.ex.js. Every figure comes from case.js: MODEL (the linked forecast and its checks),
// DCF, SCENARIO_RESULTS and HISTORY. Spreadsheet-error research is cited in `references`.
import { MODEL as M, OPENING as O, DCF as D, SCENARIO_RESULTS as S, HISTORY, DERIVED, scenario } from './case.js?v=37';

const n = (x) => (Math.round(x) + 0).toLocaleString('en-US');
const pc = (x, d = 1) => `${(x * 100).toFixed(d)}%`;
const R = M.rows, F = M.F, H7 = HISTORY[2027];
const cashLink = R.map((r, t) => r.cash - ((t ? R[t - 1].cash : O.cash) + r.cfo + r.cfi + r.cff));
const reLink = R.map((r, t) => r.retained - ((t ? R[t - 1].retained : O.retained) + r.netIncome - r.dividends));
const capexDep = R.map((r, t) => M.capex[t] / M.dep[t]);
const dso = R.map((r, t) => r.receivables / (F.catering[t] + F.training[t] + F.kitchen[t] + F.coldBrew[t]) * 365);
const cumDiv = R.map((r, t) => R.slice(0, t + 1).reduce((s, x) => s + x.dividends, 0));
const b80 = scenario({ termAmount: 80000 }), s80 = scenario({ online: 0.5, cafeGrowth: 0.02, cans: 0.75, termAmount: 80000 });
const dscr = (rows) => rows.map((x) => x.ebitda / (x.interest + x.debtPrincipal));
const Y = M.years.map((y) => `${y}E`);
const zero = (arr) => arr.every((v) => Math.abs(v) < 0.005);

export default {
  slug: 'model-review-and-presentation',
  title: 'Model review and presentation',
  blurb: 'A model is only useful if someone else can trust it and understand what it says. Review Lantern’s model the way a lender’s analyst would, with integrity checks, formula consistency and reasonableness tests, find errors from their symptoms, and present the result on one page that leads with the answer.',
  status: 'draft',
  objectives: [
    'Apply a review checklist to a financial model: structure, integrity checks, formula consistency, reasonableness and documentation.',
    'Diagnose common model errors from their symptoms in the check rows.',
    'Evaluate a forecast’s reasonableness against the history and against ratios that should be stable.',
    'Design a one-page summary that answers the decision-maker’s question first, with the evidence and the risks.',
    'Document a model so that another person can use, update and audit it.',
  ],
  prerequisites: [
    { lesson: 'f07/modelling-principles', why: 'The design rules a review checks: inputs apart, one formula per row, conventions.' },
    { lesson: 'f07/linking-the-statements', why: 'The balance check, the cash link and the retained earnings roll-forward.' },
    { lesson: 'f07/scenarios-and-sensitivity', why: 'The scenarios and the financing proposal the summary presents.' },
  ],
  case: 'lantern',
  concept: [
    { case: 'Before Ana sends her model and proposal to Coastline, Hollis Avery asks his accountant to look over it. Ana built it carefully and every check row reads zero, but she has been staring at it for three weeks, which is exactly when a builder stops seeing her own mistakes. A review by someone else is the last line of defence, and the bank will do its own anyway.' },
    { h: 'Why models need reviewing' },
    { p: 'Spreadsheet errors are common, and the people who build spreadsheets tend to be confident that theirs are right. Research on operational spreadsheets, summarised by Raymond Panko, found errors in a large share of the models examined and found that developers consistently overestimated how accurate their work was. The errors that matter in a financial model are seldom typing slips that a calculator would catch. They are a hard-coded number that stopped updating, a range that misses a row, a sign the wrong way round, a part year treated as a full one, or an assumption that is internally consistent but unrealistic. Each of the lessons in this course has shown one of them.' },
    { p: 'A review has five layers, from the mechanical to the judgemental, and an experienced reviewer works through them in order, because a model that fails the mechanical checks is not worth arguing about.' },
    { ol: [
      '<b>Structure</b>: inputs in one place, labelled with sources; calculations separate; outputs clear; units and signs stated.',
      '<b>Integrity</b>: the check rows are zero in every period: assets equal liabilities plus equity, the cash flow statement’s cash equals the balance sheet’s, retained earnings roll forward.',
      '<b>Consistency</b>: every forecast cell in a row has the same formula; no typed numbers among formulas; no circular references.',
      '<b>Reasonableness</b>: the forecast’s ratios make sense against the history and against what the business plans.',
      '<b>Documentation</b>: someone else can tell what the model is for, what each input means, and what has changed since the last version.',
    ] },
    { h: 'Lantern’s integrity checks' },
    { table: {
      caption: 'Check rows in Lantern’s model (each must be zero)',
      head: ['Check', ...Y, 'Status'],
      rows: [
        ['Assets − liabilities − equity', ...R.map((r) => n(r.check)), zero(R.map((r) => r.check)) ? 'Pass' : 'Fail'],
        ['Balance sheet cash − cash flow statement cash', ...cashLink.map(n), zero(cashLink) ? 'Pass' : 'Fail'],
        ['Retained earnings − (last year + net income − dividends)', ...reLink.map(n), zero(reLink) ? 'Pass' : 'Fail'],
        ['Line of credit outside 0 to $30,000', ...R.map((r) => (r.loc < 0 || r.loc > 30000 ? '1' : '0')), 'Pass'],
        ['Right-of-use asset − lease liability', ...R.map((r) => n(r.rou - r.leaseLiability)), 'Pass'],
      ],
      align: ['l', 'r', 'r', 'r', 'r', 'r', 'l'],
      note: 'A model can show these checks in a block at the top of the summary, so that anyone opening it sees at once whether it is intact.',
    } },
    { p: 'Integrity checks prove that the model is internally consistent. They do not prove that it is right: a model can balance perfectly and still forecast sales that will never happen. That is what the reasonableness layer is for.' },
  ],
  theory: [
    { h: 'Reasonableness: does the forecast make sense?' },
    { p: 'A reviewer compares the forecast with the history and asks whether each change has a reason. The useful measures are those that should be stable unless something changes them: margins, days of working capital, capital spending against depreciation, growth against the market.' },
    { table: {
      caption: 'Reasonableness measures, history and forecast',
      head: ['Measure', '2027A', ...Y],
      rows: [
        ['Revenue growth', pc(H7.revenue / HISTORY[2026].revenue - 1, 0), ...F.revenue.map((x, t) => pc(x / (t ? F.revenue[t - 1] : H7.revenue) - 1))],
        ['Gross margin', pc(H7.grossProfit / H7.revenue), ...F.grossProfit.map((g, t) => pc(g / F.revenue[t]))],
        ['EBITDA margin (2027 normalised)', pc(DERIVED.normalisedEbitda2027 / H7.revenue), ...F.ebitdaMargin.map((x) => pc(x))],
        ['Receivables days on all invoiced and grocer sales', '25.3', ...dso.map((x) => x.toFixed(1))],
        ['Capital spending ÷ depreciation', (54000 / 19800).toFixed(2), ...capexDep.map((x) => x.toFixed(2))],
      ],
      align: ['l', 'r', 'r', 'r', 'r', 'r', 'r'],
      note: 'Receivables days rise from 25 to about 32 because Cold Brew’s grocers pay in 60 days; the blended figure moves with the mix, as it should.',
    } },
    { p: `The reviewer’s notes on Lantern would read something like this. Revenue growth of ${pc(F.revenue[0] / H7.revenue - 1, 0)} in 2028 is explained by three new activities, then slows sensibly. Gross margin is stable because each line keeps its cost share. The EBITDA margin’s dip and recovery is explained by Cold Brew’s launch. Capital spending is below depreciation from 2029 to 2031 (about ${capexDep[1].toFixed(2)} times): defensible because the 2028 investment is new and will not need replacing for years, but worth a sentence in the notes, and it explains why the 2032 refit is large. No measure moves without a reason.` },
    { h: 'Reading errors from their symptoms' },
    { p: 'When a check row is not zero, its pattern points to the cause. A difference equal to one year’s figure for some item, appearing in one year only, suggests that item is missing from one statement. A difference that grows by a similar amount each year suggests a recurring flow is mishandled, and a cumulative pattern (the difference equals the running total of something) points straight at it: if the balance check equals minus the running total of dividends, dividends were paid in cash but never deducted from retained earnings. A difference of twice an item suggests a sign error. A reviewer forms a hypothesis from the pattern, then checks the formula, which is far faster than reading every cell.' },
    { callout: 'note', title: 'Formula consistency at a glance', html: 'Excel’s Show Formulas view, or a row of formulas compared with the row’s first forecast cell, reveals a different formula in a row in seconds. Many reviewers also colour-test: copy the model, delete every input, and see which cells still show numbers. Any that do were typed in.' },
    { h: 'Testing with extreme inputs' },
    { p: 'A quick way to find logic errors is to give the model inputs whose answer is obvious and see whether it agrees. Set every growth rate to zero: revenue should stay flat at its base, and nothing should jump. Set the term loan to zero: the line of credit should carry the strain, and if it cannot, the funding gap row should say so rather than the cash going negative. Set the tax rate to zero: tax should vanish and every after-tax figure should rise by exactly the tax it no longer pays. Set the interest rate to zero: interest should disappear without anything else changing except profit, tax and cash. Each test takes seconds, and a model that gives a surprising answer to an obvious question has a broken formula somewhere in the chain the test exercised.' },
    { p: 'The scenario explorer in the previous lesson is also a test harness: pushing each slider to its limits and watching for impossible results (negative inventory, a line of credit above its limit, a current ratio that rises when sales fall) is part of reviewing the logic, not only the numbers.' },
    { h: 'Comparing the model with what happens' },
    { p: 'Once the year starts, the model has a new job. Each quarter Ana types the actual results into the history columns and compares them with the forecast, line by line. The differences are variances: revenue lines ahead or behind, costs over or under, working capital days drifting. Large or persistent variances are evidence about the assumptions, and the forecast for the remaining years should be updated with what they teach, not left as it was in February. Lenders often require exactly this: a quarterly comparison of actual results with the forecast that supported the loan, with an explanation of any large differences.' },
    { h: 'Presenting the model' },
    { p: 'The people who decide rarely read the model; they read what the modeller tells them it says. A good one-page summary leads with the answer to their question, then gives the evidence and the risks, in that order. For Coastline the question is whether to lend, and on what terms.' },
    { list: [
      `<b>The answer:</b> Lantern asks for an $80,000 term loan with a stepped covenant (current ratio at least 0.9 at the end of 2028, 1.0 in 2029, 1.2 from 2030).`,
      `<b>The evidence:</b> in the base case the current ratio is ${b80.ratios.map((x) => x.toFixed(2)).join(', ')} at the year ends 2028–2032; debt service coverage is ${dscr(b80.model.rows)[1].toFixed(1)} times in 2029 and rising; the line of credit is repaid in 2029.`,
      `<b>The risks:</b> under slow growth the ratio is ${s80.ratios[0].toFixed(2)} in 2028 and ${s80.ratios[1].toFixed(2)} in 2029, inside the stepped covenant with little headroom; the annual model does not show quarter ends, so Lantern will send a quarterly cash forecast for 2028.`,
      '<b>The key assumptions</b>, each with its source: growth by line, cost shares, working capital days, capital spending, the loan’s terms and the tax rate.',
      '<b>The checks:</b> the model balances and its cash and retained earnings tie in every year.',
    ] },
    { p: 'Charts help when they show one thing each: the current ratio against the covenant line by scenario, cash by year, EBITDA and its margin. A <g>model dashboard</g> collects those charts and the key outputs on one page that updates when the inputs change, so the summary and the model can never disagree.' },
    { h: 'Documentation and versions' },
    { p: 'A model that only its builder understands is a liability. The cover sheet says what the model is for, who built it, its version and date, its units and its main simplifications (here: book depreciation used for tax, the second kitchen’s rent expensed, the line of credit charged on opening balances, an annual model for a quarterly covenant). A change log records what changed in each version and why. Every version sent outside the business is saved and never edited again, so that when Coastline refers to “the forecast you sent in February”, both sides are looking at the same numbers.' },
  ],
  formulas: [
    { id: 'mr-check', name: 'The integrity checks',
      tex: String.raw`\text{Assets}_t - \text{Liabilities}_t - \text{Equity}_t = 0, \quad \text{Cash}^{\text{BS}}_t - \text{Cash}^{\text{CF}}_t = 0, \quad \text{RE}_t - (\text{RE}_{t-1} + \text{NI}_t - \text{Div}_t) = 0`,
      where: [[String.raw`\text{Cash}^{\text{BS}}_t, \text{Cash}^{\text{CF}}_t`, 'Cash on the balance sheet and closing cash in the cash flow statement', '$']],
      assumptions: 'Each must be zero in every period; a non-zero value is a broken link, never something to plug.' },
    { id: 'mr-capexdep', name: 'Capital spending to depreciation',
      tex: String.raw`\text{Ratio}_t = \dfrac{\text{Capex}_t}{\text{Depreciation}_t}`,
      where: [[String.raw`\text{Capex}_t`, 'Capital spending in year t', '$']],
      assumptions: 'Over long periods a stable business has a ratio near or a little above 1; far below 1 for years needs a reason.' },
  ],
  examples: [
    { level: 'simple', title: 'Running the integrity checks', fictional: true,
      setup: `For 2028 the model shows total assets of $${n(R[0].totalAssets)}, total liabilities of $${n(R[0].totalLiabs)} and equity of $${n(R[0].equity)}. Cash at the end of 2027 was $${n(O.cash)}; 2028’s cash flows are operating $${n(R[0].cfo)}, investing −$${n(-R[0].cfi)} and financing $${n(R[0].cff)}; the balance sheet shows cash of $${n(R[0].cash)}. Run the balance check and the cash link.`,
      steps: [
        `Balance check: ${n(R[0].totalAssets)} − ${n(R[0].totalLiabs)} − ${n(R[0].equity)} = ${n(R[0].check)}.`,
        `Cash from the cash flow statement: ${n(O.cash)} + ${n(R[0].cfo)} − ${n(-R[0].cfi)} + ${n(R[0].cff)} = ${n(O.cash + R[0].cfo + R[0].cfi + R[0].cff)}.`,
        `Cash link: ${n(R[0].cash)} − ${n(O.cash + R[0].cfo + R[0].cfi + R[0].cff)} = ${n(cashLink[0])}.`,
        'Both are zero, so the statements are consistent for 2028; repeat for every year.',
      ],
      answer: 'Both checks are zero in 2028 (and in every other year).',
      interpretation: 'Passing the integrity checks means the model adds up; it says nothing yet about whether its assumptions are sensible.' },
    { level: 'challenging', title: 'An error found from its symptom', fictional: true,
      setup: `Suppose a careless edit makes the retained earnings formula ignore dividends, while the cash flow statement still pays them. The balance check would then read ${cumDiv.map((x) => n(-x)).join(', ')} for 2028–2032. Identify the error from the pattern alone.`,
      steps: [
        'The check is zero for 2028 and 2029, then negative and growing: something that starts in 2030 and accumulates.',
        `The differences are ${cumDiv.slice(2).map((x) => n(x)).join(', ')} in size: compare with the dividends of ${R.slice(2).map((r) => n(r.dividends)).join(', ')}. Each difference is the running total of dividends.`,
        'Negative means liabilities and equity exceed assets: equity is too high by the dividends paid, so retained earnings were not reduced while cash was.',
        'Fix the retained earnings formula to subtract dividends; the check returns to zero in every year.',
      ],
      answer: 'Dividends paid in cash but not deducted from retained earnings: the check equals minus the cumulative dividends.',
      interpretation: 'The pattern (zero, then a growing cumulative amount, starting the year dividends start) identified the error without reading a single formula.' },
    { level: 'applied', title: 'The one-page summary for Coastline', fictional: true,
      setup: 'Write the headline and the evidence of Lantern’s summary from the model, in the order a credit committee reads them.',
      steps: [
        'Headline: “Lantern requests an $80,000 five-year term loan at 7.5%, with a current-ratio covenant of 0.9 (2028), 1.0 (2029) and 1.2 from 2030.”',
        `Base case: revenue $${n(F.revenue[0])} in 2028, rising to $${n(F.revenue[4])} by 2032; EBITDA margin ${pc(F.ebitdaMargin[0])} in 2028 (the Cold Brew launch) recovering to ${pc(F.ebitdaMargin[4])}; current ratio ${b80.ratios.map((x) => x.toFixed(2)).join(', ')}.`,
        `Downside (slower growth across the lines): current ratio ${s80.ratios.slice(0, 2).map((x) => x.toFixed(2)).join(' and ')} in 2028–2029, inside the stepped covenant; line of credit repaid by 2030.`,
        'Checks and simplifications: balances and ties in every year; annual model, quarterly cash forecast for 2028 to follow; assumptions and sources on page 2.',
      ],
      answer: 'A one-page summary that leads with the request, then base case, downside, and the model’s checks and limits.',
      interpretation: 'The credit committee can decide from the first page and audit from the rest. The same model, with a different first page, would serve Hollis’s question about value.' },
  ],
  demo: [{ widget: 'mr-errors', intro: 'Plant one of three classic errors in Lantern’s model and watch the check rows. Learn each error’s signature: which years, which sign, and whether it accumulates.' }],
  mistakes: [
    { title: 'Reviewing your own model and calling it reviewed', html: 'Builders see what they meant to build. A review needs someone else, or at least a break and a checklist.' },
    { title: 'Treating integrity checks as proof of accuracy', html: 'A model can balance and still forecast the impossible. Integrity first, then reasonableness.' },
    { title: 'Reading every cell instead of the symptoms', html: 'Start from the check rows and the reasonableness measures; their patterns point to the error far faster than reading formulas one by one.' },
    { title: 'A summary that buries the answer', html: 'Decision-makers read the first lines. Lead with the request or conclusion, then the evidence, then the risks.' },
    { title: 'Charts that try to show everything', html: 'One message per chart: the covenant against its limit, cash by year. A chart with ten series is a table that is harder to read.' },
    { title: 'Editing a version that has been sent', html: 'Once a model has gone to a lender or investor, freeze that version. Make changes in a new one and log them.' },
  ],
  application: [
    { p: 'Large financings often require an independent model audit: an accounting or specialist firm reviews the model before the lenders commit, and its report lists every error, inconsistency and unsupported assumption. Smaller lenders do the same work internally. In both cases the reviewer’s first request is the model’s documentation and its check rows.' },
    { p: 'Inside companies, the same discipline applies to budgets and board papers. A finance team that sends the board a model that does not balance, or a summary that disagrees with its own appendix, loses credibility that takes years to rebuild. Simple habits (a checks block at the top, a frozen copy of everything sent, a change log) prevent most of it.' },
    { case: 'Hollis’s accountant finds nothing wrong with the mechanics and asks for one more sentence in the notes, on why capital spending is below depreciation from 2029. Ana adds it, freezes version 1.0, and sends Coastline her one-page summary, the model and the scenario table. The project at the end of this course asks you to build the whole model yourself.' },
  ],
  summary: [
    'Review a model in layers: structure, integrity, consistency, reasonableness, documentation.',
    'Integrity checks (balance check, cash link, retained earnings roll-forward) must be zero every period; they prove consistency, not accuracy.',
    'Reasonableness compares the forecast with the history: stable measures should move only for a reason.',
    'The pattern of a non-zero check identifies the error: one year, recurring, cumulative or twice an item.',
    'Present the answer first, then the evidence, then the risks, with one message per chart.',
    'Document the model and freeze every version that leaves the business.',
  ],
  glossary: [
    { term: 'Model audit', def: 'An independent review of a financial model’s structure, formulas, assumptions and outputs, often required by lenders before a large financing.' },
    { term: 'Model dashboard', def: 'A one-page view of a model’s key outputs and charts, linked to the model so that it updates when the inputs change.' },
    { term: 'Change log', def: 'A record kept with a model of what changed in each version, when and why.' },
  ],
  references: [
    { text: 'Panko, R. R. (2000). Spreadsheet errors: What we know. What we think we can do. <i>Proceedings of the Spreadsheet Risk Symposium</i>, European Spreadsheet Risks Interest Group (EuSpRIG), Greenwich. arXiv:0802.3457.', url: 'https://arxiv.org/pdf/0802.3457', checked: '2026-10-23' },
    { text: 'ICAEW (2024). <i>Financial Modelling Code</i>. Institute of Chartered Accountants in England and Wales.', url: 'https://www.icaew.com/technical/technology/excel-community/improve-your-financial-modelling-practice', checked: '2026-11-17' },
  ],
  checks: [
    ...R.flatMap((r, t) => [
      { what: `check ${r.year}`, value: r.check, shown: 0, tol: 0.005 },
      { what: `cash link ${r.year}`, value: cashLink[t], shown: 0, tol: 0.005 },
      { what: `re link ${r.year}`, value: reLink[t], shown: 0, tol: 0.005 },
      { what: `capex/dep ${r.year}`, value: capexDep[t], shown: Math.round(capexDep[t] * 100) / 100, tol: 0.005 },
      { what: `dso ${r.year}`, value: dso[t], shown: Math.round(dso[t] * 10) / 10, tol: 0.05 },
      { what: `cum div ${r.year}`, value: cumDiv[t], shown: Math.round(cumDiv[t]), tol: 0.5 },
      { what: `dividends ${r.year}`, value: r.dividends, shown: Math.round(r.dividends), tol: 0.5 },
      { what: `revenue ${r.year}`, value: F.revenue[t], shown: Math.round(F.revenue[t]), tol: 0.5 },
    ]),
    { what: 'Total assets 2028', value: R[0].totalAssets, shown: Math.round(R[0].totalAssets), tol: 0.5 },
    { what: 'Total liabs 2028', value: R[0].totalLiabs, shown: Math.round(R[0].totalLiabs), tol: 0.5 },
    { what: 'Equity 2028', value: R[0].equity, shown: Math.round(R[0].equity), tol: 0.5 },
    { what: 'CF cash 2028', value: O.cash + R[0].cfo + R[0].cfi + R[0].cff, shown: Math.round(O.cash + R[0].cfo + R[0].cfi + R[0].cff), tol: 0.5 },
    { what: 'Capex/dep 2027', value: 54000 / 19800, shown: 2.73, tol: 0.005 },
    { what: 'DSCR 2029 at 80k', value: dscr(b80.model.rows)[1], shown: Math.round(dscr(b80.model.rows)[1] * 10) / 10, tol: 0.05 },
    ...b80.ratios.map((x, t) => ({ what: `b80 ${t}`, value: x, shown: Math.round(x * 100) / 100, tol: 0.005 })),
    ...s80.ratios.slice(0, 2).map((x, t) => ({ what: `s80 ${t}`, value: x, shown: Math.round(x * 100) / 100, tol: 0.005 })),
    { what: 'DSO 2027', value: 10698 / 154360 * 365, shown: 25.3, tol: 0.05 },
  ],
};
