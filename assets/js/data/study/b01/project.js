// project.js — B01 applied project: a review of Lantern Coffee's online shop, July–December 2026.
// Every fact comes from case.js (SHOP, SURVEY, TARGETS); every number is computed here and checked by `verify`.
import { MONTHS, SHOP as S, SURVEY as Q, TARGETS as T, DERIVED as D } from './case.js';

const r1 = (x) => Math.round(x * 10) / 10, r2 = (x) => Math.round(x * 100) / 100;
const money = (x) => `$${x.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const sum = (a) => a.reduce((s, x) => s + x, 0);

const conv = D.conversion, rev = D.revenue;
const sixRevenue = sum(rev);                                        // 101,928.40
const weightedAov = sixRevenue / sum(D.orders);                     // 46.37
const simpleAov = sum(S.aov) / 6;                                   // 44.80
const ppChange = conv[2] - conv[1];                                 // −0.90 points
const relChange = (conv[2] / conv[1] - 1) * 100;                    // −28.9 %
const webAug = D.webConversion[1], webSep = D.webConversion[2];     // 2.91, 1.80
const appAug = D.appConversion[1], appSep = D.appConversion[2];     // 3.68, 3.58
const expectedWeb = S.webVisits[2] * S.webOrders[1] / S.webVisits[1];   // 256
const lostOrders = expectedWeb - S.webOrders[2];                    // 98
const lostRevenue = lostOrders * S.aov[2];                          // 4,067
const growth = (rev[5] / rev[0] - 1) * 100;                         // 166.2 %
const response = Q.responses / Q.sent * 100;                        // 32.9 %
const agree = Q.checkoutEasy.agree / Q.responses * 100;             // 55.7 %

const fmt = (x) => x.toLocaleString('en-US');
const SHOP_TABLE = {
  table: {
    caption: 'Lantern’s online shop, July–December 2026 (fictional)',
    head: ['Month', 'Web visits', 'App visits', 'Web orders', 'App orders', 'Average order value', 'New customers'],
    rows: MONTHS.map((m, i) => [m, fmt(S.webVisits[i]), fmt(S.appVisits[i]), fmt(S.webOrders[i]), fmt(S.appOrders[i]), `$${S.aov[i].toFixed(2)}`, fmt(S.newCustomers[i])]),
    align: ['l', 'r', 'r', 'r', 'r', 'r', 'r'],
  },
};
const KPI_ROWS = MONTHS.map((m, i) => [m, `${conv[i].toFixed(2)}%`, `$${S.aov[i].toFixed(2)}`, money(rev[i]), `${D.returningShare[i].toFixed(1)}%`]);

const num = (id, kind, prompt, answer, check, tol, solution, wrong, unit = '%', places = 1) =>
  ({ id, type: 'num', kind, unit, places, prompt, answer, check, tol, solution, ...(wrong ? { wrong } : {}) });

export default {
  title: 'Lantern’s online-shop review',
  brief: [
    { case: 'It is January 2027. Ana Lim wants a review of Lantern’s online shop for the second half of 2026 before she plans the new year. She has two questions: “Is the shop doing well?” and “What happened in September?” On 1 September a redesigned checkout went live on the website (the app was not changed); on 5 October a fix for a payment-page bug on mobile browsers was released. Lantern, its customers and every figure are fictional.' },
    SHOP_TABLE,
    { p: 'Ana set four targets in July: a conversion rate (orders ÷ visits) of at least 3.0%, an average order value of at least $45, revenue of at least $15,000 a month and at least 35% of orders from returning customers. On 1 October she e-mailed a short survey to the 240 customers who had ordered in September; 79 replied. 44 agreed that “the new checkout was easy to use”, 17 were neutral and 18 disagreed.' },
    { p: 'You will turn Ana’s questions into measurable ones, calculate the shop’s KPIs, find out where September’s fall came from, judge how strong the evidence is and recommend what to do and measure next. Round as each question asks.' },
  ],
  deliverables: [
    'Ana’s two questions restated as measurable questions, each labelled with the kind of analytics it needs.',
    'The shop’s KPIs for the six months against Ana’s targets, including a correctly weighted average order value.',
    'A diagnosis of September: how much conversion fell, in which channel, and what it cost.',
    'An assessment of the survey and of other explanations for the fall.',
    'A recommendation to Ana of about 200–300 words: what to do, and what to measure to know it worked.',
  ],
  stages: [
    {
      id: 'frame', title: 'Frame the questions',
      html: '<p>“Is the shop doing well?” cannot be answered until “doing well” is defined, and “What happened in September?” is two questions: what changed, and why. Start by sorting the questions Ana could ask and choosing measurable versions.</p>',
      items: [
        { id: 'b01-pj-1', type: 'classify', kind: 'conceptual',
          prompt: 'Which kind of analytics does each question need?',
          items: ['How many orders did the shop take in each month of 2026?', 'Why did September’s orders fall when visits rose?', 'How many gift boxes should Lantern stock for December 2027?', 'Should Lantern roll back the new checkout or fix it?'],
          categories: ['Descriptive', 'Diagnostic', 'Predictive', 'Prescriptive'],
          answer: [0, 1, 2, 3],
          feedback: { 2: 'Stocking for next December needs a forecast of demand first: that is prediction. Choosing what to do with the forecast would be prescriptive.', 3: 'This asks which action to take, which is prescriptive; it relies on the diagnosis but goes further.' },
          solution: 'Counting orders describes what happened; explaining the fall diagnoses why; estimating next December’s demand predicts; choosing between rolling back and fixing prescribes an action.' },
        { id: 'b01-pj-2', type: 'mc', kind: 'applied',
          prompt: 'Which is the best measurable version of “Is the shop doing well?”',
          options: [
            'Did the shop meet each of Ana’s four targets (conversion, order value, revenue, returning share) in each month from July to December 2026?',
            'Are customers happy with the shop?',
            'Did the shop sell more in December than in July?',
            'Is the shop growing faster than other coffee shops online?',
          ],
          answer: 0,
          feedback: { 1: 'Happiness matters, but this names no measure, period or threshold.', 2: 'This is measurable but answers a narrower question, and December is a gift month, so the comparison is unfair.', 3: 'Ana has no data on other shops, so this cannot be answered from what she holds.' },
          solution: 'A measurable question names the measures, the targets, the units (each month) and the period. Ana’s four targets supply all of them.' },
      ],
    },
    {
      id: 'kpis', title: 'Calculate the KPIs',
      html: '<p>Use the table in the brief. Conversion is total orders (web plus app) ÷ total visits; revenue is orders × average order value.</p>',
      items: [
        num('b01-pj-3', 'numerical', 'What was the shop’s conversion rate in September? Give a percentage to two decimal places.',
          r2(conv[2]), () => (158 + 93) / (8800 + 2600) * 100, 0.01,
          `(158 + 93) ÷ (8,800 + 2,600) = 251 ÷ 11,400 ≈ ${conv[2].toFixed(2)}%.`,
          [{ value: 1.8, say: 'That is the website alone. Conversion for the shop uses all orders and all visits.' }, { value: 2.69, say: 'That averages the web and app rates (1.80 and 3.58). The app had far fewer visits, so a simple average overweights it.' }], '%', 2),
        num('b01-pj-4', 'numerical', 'What was revenue in December? Give dollars and cents.',
          r2(rev[5]), () => (446 + 137) * 55.3, 0.01, `583 orders × $55.30 = ${money(rev[5])}.`, [{ value: 24663.8, say: 'That uses web orders only. Revenue counts both channels.' }], '$', 2),
        { id: 'b01-pj-5', type: 'rows', kind: 'applied',
          prompt: 'Select every month in which the shop missed Ana’s conversion target of at least 3.0%.',
          data: { table: { head: ['Month', 'Conversion', 'Average order value', 'Revenue', 'Returning share'], rows: KPI_ROWS } },
          answer: [2, 3],
          solution: `September (${conv[2].toFixed(2)}%) and October (${conv[3].toFixed(2)}%) missed it. July is exactly 3.00%, which meets an “at least 3.0%” target.` },
        num('b01-pj-6', 'numerical', 'By what percentage did monthly revenue grow from July to December? One decimal place.',
          r1(growth), () => ((583 * 55.3) / (294 * 41.2) - 1) * 100, 0.1,
          `${money(rev[5])} ÷ ${money(rev[0])} − 1 ≈ ${growth.toFixed(1)}%. Much of it is the December gift season, so this is not a growth rate to expect every half-year.`,
          [{ value: 266.2, say: 'That is December as a percentage of July. Growth is that minus 100%.' }], '%', 1),
        num('b01-pj-7', 'numerical', 'What was the average order value over all six months taken together (total revenue ÷ total orders)? Dollars and cents.',
          r2(weightedAov), () => [294 * 41.2, 316 * 40.8, 251 * 41.5, 319 * 42.1, 435 * 47.9, 583 * 55.3].reduce((a, b) => a + b) / (294 + 316 + 251 + 319 + 435 + 583), 0.01,
          `Total revenue ${money(sixRevenue)} ÷ ${fmt(sum(D.orders))} orders ≈ ${money(weightedAov)}.`,
          [{ value: 44.8, say: 'That averages the six monthly figures as if each month had the same number of orders. December, with the most orders and the highest value, should count for more.' }], '$', 2),
        { id: 'b01-pj-8', type: 'mc', kind: 'applied',
          prompt: 'Did the shop meet Ana’s order-value target of $45 over the half-year?',
          options: [
            'Yes over the half-year as a whole ($46.37), though only November and December were above $45 on their own',
            'No: the average of the monthly figures is $44.80, below the target',
            'Yes: every month was close to $45, so the target was met',
          ],
          answer: 0,
          feedback: { 1: 'The simple average of monthly figures ignores how many orders each month had. The half-year’s order value is total revenue ÷ total orders.', 2: 'July to October were all between $40.80 and $42.10, well below $45.' },
          solution: `Taken together the six months give ${money(weightedAov)} an order, above $45, because the high-value gift months had the most orders. Month by month, only November and December met the target. Say which you mean when you report it.` },
      ],
    },
    {
      id: 'diagnose', title: 'Diagnose September',
      html: '<p>Visits rose by almost 12% from August to September, yet orders fell by about 21%. Break the change down: by how much did conversion fall, and was the fall in both channels or one?</p>',
      items: [
        num('b01-pj-9', 'numerical', 'By how many percentage points did the shop’s conversion rate change from August to September? Use a minus sign for a fall; two decimal places.',
          r2(ppChange), () => (251 / 11400 - 316 / 10200) * 100, 0.01,
          `${conv[2].toFixed(2)}% − ${conv[1].toFixed(2)}% ≈ ${ppChange.toFixed(2)} percentage points. In relative terms that is a fall of about ${Math.abs(relChange).toFixed(0)}%.`,
          [{ value: -28.93, say: 'That is the relative change in percent. The question asks for the difference in percentage points.' }], 'points', 2),
        num('b01-pj-10', 'numerical', 'What was the website’s conversion rate in September? Two decimal places.',
          r2(webSep), () => 158 / 8800 * 100, 0.01, `158 ÷ 8,800 ≈ ${webSep.toFixed(2)}%, down from ${webAug.toFixed(2)}% in August. The app went from ${appAug.toFixed(2)}% to ${appSep.toFixed(2)}%.`, null, '%', 2),
        { id: 'b01-pj-11', type: 'mc', kind: 'applied',
          prompt: 'What does the channel split suggest?',
          options: [
            'The fall is almost all on the website, which is where the checkout changed; the app, which did not change, held steady',
            'Both channels fell by about the same amount, so the cause is something that affects all customers, such as prices',
            'The app caused the fall, because it converts better and its share of visits dropped',
          ],
          answer: 0,
          feedback: { 1: `The app moved from ${appAug.toFixed(2)}% to ${appSep.toFixed(2)}%; the website from ${webAug.toFixed(2)}% to ${webSep.toFixed(2)}%. The falls are very different.`, 2: 'The app’s share of visits did fall a little, but that explains only a small part. The website’s own conversion fell by more than a third.' },
          solution: 'Comparing the channel that changed with one that did not is a natural control. The website fell sharply; the app barely moved. That points to the website and the 1 September checkout, though it does not yet prove it.' },
        num('b01-pj-12', 'applied', 'If the website had converted at its August rate in September, how many more web orders would it have taken? Whole orders.',
          Math.round(lostOrders), () => 8800 * 224 / 7700 - 158, 0.5,
          `At August’s rate, 8,800 × (224 ÷ 7,700) = ${expectedWeb.toFixed(0)} orders, against the 158 taken: about ${lostOrders.toFixed(0)} orders. At September’s $41.50 average, that is about ${money(lostRevenue)} of revenue.`,
          [{ value: 66, say: 'That is 224 − 158: it ignores that September had more web visits than August.' }], 'orders', 0),
        { id: 'b01-pj-13', type: 'mc', kind: 'applied',
          prompt: 'In October, after the 5 October fix, web conversion recovered to 2.67%. What is the most careful reading?',
          options: [
            'The fix helped, but web conversion is still below August’s 2.91%, so either the fix was partial or something else is also at work',
            'The fix fully solved the problem',
            'The fix made no difference, because conversion did not return to its August level',
          ],
          answer: 0,
          feedback: { 1: 'October is still below August, and the fix came five days into the month, so the month mixes before and after.', 2: 'A large recovery from 1.80% to 2.67% is unlikely to be chance with this many visits; the fix probably helped.' },
          solution: 'The recovery is real but incomplete. Two cautions: the fix arrived on 5 October, so the month blends both versions, and one month is a short record. Weekly or daily figures around 5 October would show more.' },
      ],
    },
    {
      id: 'evidence', title: 'Judge the evidence',
      html: '<p>Ana’s survey and the timing both point at the checkout. Before recommending anything, check how strong that evidence is and what else could explain the fall.</p>',
      items: [
        num('b01-pj-14', 'numerical', 'What was the survey’s response rate? One decimal place.',
          r1(response), () => 79 / 240 * 100, 0.1, `79 ÷ 240 ≈ ${response.toFixed(1)}%.`, [{ value: 25, say: 'That divides by 316, August’s orders. The survey went to the 240 customers who ordered in September.' }], '%', 1),
        { id: 'b01-pj-15', type: 'multi', kind: 'conceptual',
          prompt: 'Which are real weaknesses of the survey as evidence about the new checkout? Select all that apply.',
          options: [
            'It reached only people who completed an order, not the visitors the checkout put off',
            'App buyers, who never saw the new checkout, were asked about it too',
            'Fewer than half replied, and those who replied may differ from those who did not',
            '79 replies is too few to calculate a percentage',
            'There is no earlier survey about the old checkout to compare with',
          ],
          answer: [0, 1, 2, 4],
          feedback: { 3: 'Any number of replies gives a percentage. A small sample makes the percentage less precise, but 79 is enough to see a rough picture.' },
          solution: `The people most affected by a bad checkout are the ones who gave up, and they were never surveyed (survivorship). App buyers answered a question about something they did not use. A ${response.toFixed(0)}% response rate invites non-response bias. With no baseline, “${agree.toFixed(0)}% found it easy” cannot be compared with anything.` },
        { id: 'b01-pj-16', type: 'multi', kind: 'applied',
          prompt: 'Visits rose by almost 12% in September. Which other explanations should Ana rule out before blaming the checkout? Select all that apply.',
          options: [
            'A September promotion brought in visitors less likely to buy',
            'Web visits were counted differently after the redesign (for example, page reloads counted as new visits)',
            'The app’s conversion fell, dragging down the total',
            'A competitor cut prices in September',
          ],
          answer: [0, 1, 3],
          feedback: { 2: 'The app’s conversion barely moved; the fall is on the website.' },
          solution: 'A change in who visits (a promotion), in how visits are measured (a tracking change with the redesign) or in the market (a competitor) could each lower web conversion. The app’s steadiness argues against market-wide causes, since app customers would face the same competitor, but it does not rule out a web-only promotion or a measurement change.' },
      ],
    },
    {
      id: 'recommend', title: 'Recommend',
      html: '<p>Write Ana a short recommendation she can act on: what the half-year shows, what you think happened in September and how sure you are, what to do, and what to measure to know whether it worked.</p>',
      items: [
        { id: 'b01-pj-17', type: 'short', kind: 'applied',
          prompt: 'Write your recommendation to Ana (about 200–300 words).',
          rubric: [
            'Summarises the half-year against the targets, saying which were met overall and month by month.',
            'Gives the September fall in percentage points and locates it in the website, with the app as the comparison.',
            'Puts a cost on the fall (orders or revenue) and says how it was estimated.',
            'States the uncertainty: the survey’s weaknesses and at least one alternative explanation to rule out.',
            'Recommends an action and a measurement (for example, an A/B test of the checkout, and weekly web conversion and checkout completion).',
            'Is written for Ana: short sentences, terms explained.',
          ],
          model: `The shop had a strong half-year overall. Revenue rose from ${money(rev[0])} in July to ${money(rev[5])} in December, mostly thanks to gift boxes, and the average order over the six months was ${money(weightedAov)}, above your $45 target, although only November and December cleared it on their own. The share of orders from returning customers fell to ${D.returningShare[5].toFixed(0)}% in December, below your 35% target, because of the many new gift buyers.<br><br>September is the exception. Conversion fell from ${conv[1].toFixed(2)}% to ${conv[2].toFixed(2)}%, about ${Math.abs(ppChange).toFixed(1)} percentage points. Almost all of the fall was on the website, where conversion dropped from ${webAug.toFixed(2)}% to ${webSep.toFixed(2)}%, while the app, which did not change, held steady. At August’s web rate you would have taken about ${lostOrders.toFixed(0)} more orders, roughly ${money(Math.round(lostRevenue))} of revenue. The timing points to the new checkout, and October’s partial recovery after the fix supports that.<br><br>I would not lean on the survey: it only reached people who completed an order, included app buyers and has no earlier survey to compare with. Before concluding, check that the redesign did not change how visits are counted and that no promotion brought in unusual visitors.<br><br>Next, test the checkout properly: show half of website visitors the old version and half the new one for a few weeks, and compare checkout completion and conversion. Track web conversion weekly against 3.0%, so a problem shows within days, not at month end.`,
          solution: 'Compare your answer with the model and the rubric. Other recommendations can earn full marks if they follow from the evidence and say how success will be measured.' },
      ],
    },
  ],
  rubric: [
    'Every figure is correct to the precision asked and labelled (percent vs percentage points; monthly vs half-year).',
    'Rates are calculated with the right denominators, and averages across months are weighted by orders.',
    'The diagnosis compares the changed channel with an unchanged one and says how sure it is.',
    'Fictional facts are presented as the case, and the recommendation says what to measure next.',
  ],
  verify() {
    return [
      ['Sep conversion', conv[2], 2.2018, 0.0001], ['Dec revenue', rev[5], 32239.9, 0.005], ['growth', growth, 166.1639, 0.0001],
      ['six-month revenue', sixRevenue, 101928.4, 0.005], ['weighted AOV', weightedAov, 46.3732, 0.0001], ['simple AOV', simpleAov, 44.8, 1e-9],
      ['pp change', ppChange, -0.8963, 0.0001], ['web Sep', webSep, 1.7955, 0.0001], ['expected web', expectedWeb, 256, 1e-9],
      ['lost orders', lostOrders, 98, 1e-9], ['lost revenue', lostRevenue, 4067, 1e-6], ['response', response, 32.9167, 0.0001],
      ['agree', agree, 55.6962, 0.0001], ['web+app avg Sep', (webSep + appSep) / 2, 2.6862, 0.0001],
    ];
  },
};
