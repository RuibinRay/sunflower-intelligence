// situation-analysis.js — M01 · Situation analysis. Content only; exercises are in situation-analysis.ex.js.
// Lantern facts come from ./case.js (fictional); `checks` recompute them from that file. Every other business is fictional.
import { BUSINESS, CLIENT_INTERVIEWS, COMPETITOR, GOALS } from './case.js?v=17';

const c = BUSINESS.catering;
const R = CLIENT_INTERVIEWS.reasons;
const share = (n) => (n / CLIENT_INTERVIEWS.interviewed) * 100;

// Larkhill Office Plants (fictional): the weighted competitive-strength scorecard used in the applied example and the widget.
const W1 = [0.4, 0.3, 0.2, 0.1];          // weights from current clients: reliability, plant quality, price, design advice
const W2 = [0.3, 0.2, 0.4, 0.1];          // weights from lost bids: price first
const S = { larkhill: [4, 5, 2, 5], mossgiel: [4, 3, 4, 2], halvorsen: [2, 3, 5, 1] };
const score = (w, s) => w.reduce((t, wi, i) => t + wi * s[i], 0);

const LAYERS = '<svg viewBox="0 0 640 360" xmlns="http://www.w3.org/2000/svg" font-family="inherit" font-size="14">'
  + '<rect x="8" y="8" width="624" height="344" rx="28" style="fill:none;stroke:var(--series-3);stroke-width:2;stroke-dasharray:7 4"/>'
  + '<rect x="122" y="58" width="396" height="244" rx="20" style="fill:none;stroke:var(--series-2);stroke-width:2"/>'
  + '<rect x="236" y="150" width="168" height="60" rx="10" style="fill:none;stroke:var(--series-1);stroke-width:2.5"/>'
  + '<text x="320" y="34" text-anchor="middle" font-weight="700" fill="currentColor">Macroenvironment: wider forces (PESTEL)</text>'
  + '<text x="320" y="84" text-anchor="middle" font-weight="700" fill="currentColor">Microenvironment: actors the business deals with</text>'
  + '<text x="320" y="176" text-anchor="middle" font-weight="700" fill="currentColor">The business</text>'
  + '<text x="320" y="196" text-anchor="middle" font-size="12" fill="currentColor">its people, skills and money</text>'
  + [['Customers', 320, 124], ['Suppliers', 180, 185], ['Intermediaries', 461, 185], ['Competitors', 232, 262], ['Publics', 408, 262]]
    .map(([t, x, y]) => `<text x="${x}" y="${y}" text-anchor="middle" fill="currentColor">${t}</text>`).join('')
  + [['Political', 65, 92], ['Economic', 575, 92], ['Social', 65, 185], ['Technological', 575, 185], ['Environmental', 65, 290], ['Legal', 575, 290]]
    .map(([t, x, y]) => `<text x="${x}" y="${y}" text-anchor="middle" font-size="13" fill="var(--ink-3)">${t}</text>`).join('')
  + '</svg>';

const cell = (x, y, color, title, l1, l2) => `<rect x="${x}" y="${y}" width="244" height="132" rx="8" style="fill:none;stroke:var(--series-${color});stroke-width:2"/>`
  + `<text x="${x + 122}" y="${y + 40}" text-anchor="middle" font-weight="700" fill="currentColor">${title}</text>`
  + `<text x="${x + 122}" y="${y + 72}" text-anchor="middle" font-size="12" fill="currentColor">${l1}</text>`
  + `<text x="${x + 122}" y="${y + 92}" text-anchor="middle" font-size="12" fill="currentColor">${l2}</text>`;
const GRID = '<svg viewBox="0 0 640 340" xmlns="http://www.w3.org/2000/svg" font-family="inherit" font-size="14">'
  + '<text x="257" y="34" text-anchor="middle" font-weight="700" fill="currentColor">Helpful</text>'
  + '<text x="505" y="34" text-anchor="middle" font-weight="700" fill="currentColor">Harmful</text>'
  + '<text x="64" y="110" text-anchor="middle" font-weight="700" fill="currentColor">Internal</text>'
  + '<text x="64" y="130" text-anchor="middle" font-size="12" fill="var(--ink-3)">the business</text>'
  + '<text x="64" y="146" text-anchor="middle" font-size="12" fill="var(--ink-3)">controls it</text>'
  + '<text x="64" y="246" text-anchor="middle" font-weight="700" fill="currentColor">External</text>'
  + '<text x="64" y="266" text-anchor="middle" font-size="12" fill="var(--ink-3)">the business</text>'
  + '<text x="64" y="282" text-anchor="middle" font-size="12" fill="var(--ink-3)">does not control it</text>'
  + cell(135, 50, 1, 'Strengths', 'What it does better than rivals,', 'in ways customers value')
  + cell(383, 50, 2, 'Weaknesses', 'Where it falls short of rivals', 'or of what customers need')
  + cell(135, 194, 3, 'Opportunities', 'Conditions outside it that it', 'could use, if it acts')
  + cell(383, 194, 2, 'Threats', 'Conditions outside it that', 'could harm its results')
  + '</svg>';

export default {
  slug: 'situation-analysis',
  title: 'Situation analysis',
  blurb: 'Before deciding where to go, a business needs an honest picture of where it stands. Learn to scan the marketing environment with PESTEL, profile competitors and compare them with numbers, and build a SWOT analysis that rests on evidence and leads to decisions, knowing what each tool can and can’t tell you.',
  status: 'reviewed',
  objectives: [
    'Distinguish the microenvironment from the macroenvironment, and classify environmental factors with PESTEL.',
    'Analyse competitors, including indirect competitors and substitutes, and compare them with market share and a weighted competitive-strength scorecard.',
    'Construct a SWOT analysis that separates internal from external factors and supports each factor with evidence.',
    'Evaluate the evidence behind a situation analysis, including small samples and research drawn only from current customers.',
    'Explain the known weaknesses of SWOT and PESTEL, and use the TOWS matrix to turn a SWOT into strategic options.',
  ],
  prerequisites: [
    { lesson: 'm01/market-orientation', why: 'A situation analysis is market orientation in practice: gathering intelligence about customers and competitors before deciding.' },
    { lesson: 'm01/business-buying', why: 'Lantern’s catering clients are organisations; reading the evidence about them needs the buying situations and roles from that lesson.' },
    { lesson: 'b01/data-collection', why: 'The lesson judges Lantern’s client interviews with two ideas from that lesson: convenience samples and survivorship bias.' },
  ],
  case: 'lantern',

  concept: [
    { case: `It is late November 2026. Lantern Coffee Co. opened on 1 March, and its catering business now serves ${c.clients} clients, offices and event organisers that book about ${c.eventsPerClientYear} events a year each at $${c.pricePerHead.toFixed(2)} a head. Ana Lim wants catering revenue to grow by ${GOALS.cateringGrowth * 100}% in 2027. Before she sets targets or decides how to compete, she wants an honest picture of where Lantern stands. She has some evidence: interviews with ${CLIENT_INTERVIEWS.interviewed} of the ${c.clients} clients, notes on the ${CLIENT_INTERVIEWS.lostBids} bids Lantern lost this year, all of them to ${COMPETITOR.name} on price, and what she has learned about how Harbor Tech, one of her first clients, buys catering.` },
    { p: 'Plans that skip this step tend to rest on what the owner already believes: that customers love the product, that the competition is weak, that next year will look like this one. A <g>situation analysis</g> replaces those beliefs with a structured review of the business’s current position: its customers, its competitors, the wider forces acting on its market, and its own strengths and weaknesses. It is an early section of almost every marketing plan, coming straight after the executive summary.' },

    { h: 'Where a situation analysis fits' },
    { p: 'Marketing planning can be summed up in four questions, asked in order:' },
    { ol: [
      '<b>Where are we now?</b> The situation analysis: this lesson.',
      '<b>Where do we want to be?</b> Objectives, stated precisely enough to be measured: the next lesson.',
      '<b>How will we get there?</b> Strategy, starting with how the business will compete (the third lesson of this module), and then the marketing mix that carries the strategy out (M02).',
      '<b>How will we know?</b> Measures and reviews, which feed the next round’s situation analysis.',
    ] },
    { p: 'The order matters. An objective set without knowing the starting point is either timid or fanciful, and a strategy chosen without knowing the competitors may be one they already own.' },

    { h: 'Three things to look at' },
    { p: 'A situation analysis looks outward before it looks inward. First, the <b>environment</b>: who and what around the business affects its ability to serve customers. Second, the <b>competitors</b>: who else is trying to win the same customers, and how. Third, the <b>business itself</b>: what it does well and badly, judged against those competitors and by its customers. A SWOT analysis, at the end, pulls the three together.' },

    { h: 'The marketing environment' },
    { p: 'The <g>marketing environment</g> is everything outside the marketing function that affects its ability to build and keep relationships with customers. It is usually divided into two layers.' },
    { p: 'The <g>microenvironment</g> is made up of the actors close to the business that it deals with directly: its customers, its suppliers, the intermediaries that help it reach customers, its competitors, its publics (any group with an interest in it, such as the local press or the people who review it online) and the rest of the business itself, since marketing depends on finance, operations and staff. For a caterer like Lantern, suppliers include whoever provides the beans, the milk and the servicing of the espresso machines; intermediaries might include event venues and event planners who recommend caterers to their clients.' },
    { p: 'The <g>macroenvironment</g> is made up of the wider forces that shape the whole market and that no single business controls: politics, the economy, society, technology, the natural environment and the law. Lantern can negotiate with its milk supplier; it cannot negotiate with the price of coffee beans on world markets or with a city’s rules on single-use cups.' },
    { figure: {
      svg: LAYERS,
      caption: 'The marketing environment in layers. The business deals directly with the actors in its microenvironment; the forces in the macroenvironment act on all of them, and on its competitors too.',
      alt: 'Three nested rounded rectangles. The innermost is labelled “The business: its people, skills and money”. Around it, the middle layer is labelled “Microenvironment: actors the business deals with” and contains five labels: Customers, Suppliers, Intermediaries, Competitors and Publics. The outer layer, drawn with a dashed border, is labelled “Macroenvironment: wider forces (PESTEL)” and has six labels around its edge: Political, Economic, Social, Technological, Environmental and Legal.',
    } },
    { p: 'A standard checklist for the macroenvironment is <g>PESTEL</g>: political, economic, social, technological, environmental and legal factors. Its purpose is to make sure nothing important is missed. It doesn’t say whether a factor is good or bad news. A rise in bean prices hurts every coffee business, but it hurts most the ones that compete only on price; a new rule on reusable cups is a cost for one caterer and a selling point for another that already uses them. Deciding which way a factor cuts, for this business, is the job of the SWOT analysis.' },

    { h: 'Competitors, and the business itself' },
    { p: 'A <g>competitor analysis</g> identifies the businesses, and the other options, that customers could choose instead, and studies their offers, prices, strengths, weaknesses and likely next moves. It includes more than look-alike firms. Lantern’s catering competes with other caterers, but also with cafés that deliver, with coffee machines an office can lease, and with the option of doing nothing special at all.' },
    { p: 'The inward look asks what the business does well and badly. The test is always relative and from the customer’s side: a strength is something the business does better than its rivals in a way its customers value. A caterer’s baristas are a strength only if clients notice them and care, and only if rivals can’t offer the same.' },
    { callout: 'key', title: 'Describe first, judge second', html: 'Collect the facts about the environment, the competitors and the business before deciding which are strengths, weaknesses, opportunities or threats. Judging too early lets the plan you already favour decide which facts you notice.' },
  ],

  theory: [
    { h: 'The microenvironment, actor by actor' },
    { p: 'Each actor in the microenvironment raises its own questions. The table lists them for a business that sells to other organisations, as Lantern’s catering does.' },
    { table: {
      caption: 'Questions a situation analysis asks of each actor in the microenvironment',
      head: ['Actor', 'Who they are', 'Questions to ask'],
      rows: [
        ['Customers', 'Current clients, lost clients, prospects', 'What do they buy, and why? Who decides? What would make them buy more, or leave?'],
        ['Competitors', 'Rival firms, substitutes, doing it in-house', 'Whom do customers compare us with? On what do rivals win?'],
        ['Suppliers', 'Firms providing inputs and services', 'Are prices, quality or reliability changing? How dependent are we on one supplier?'],
        ['Intermediaries', 'Venues, planners, platforms that connect us to customers', 'Who sends us business, and what do they expect in return?'],
        ['Publics', 'Press, reviewers, local business groups, neighbours', 'What do they say about us, and who listens to them?'],
        ['The business', 'Staff, finance, operations', 'Can the rest of the business deliver what marketing promises?'],
      ],
    } },
    { p: 'Strategy textbooks often analyse the forces close to a business with Michael Porter’s five forces model instead (rivalry, new entrants, substitutes, and the bargaining power of buyers and of suppliers). It is a model of how attractive an industry is, and it overlaps with this list. Course M11 covers it.' },

    { h: 'PESTEL in more depth' },
    { table: {
      caption: 'The six PESTEL factors, with questions a coffee caterer might ask',
      head: ['Factor', 'What it covers', 'A question for a coffee caterer'],
      rows: [
        ['Political', 'Government policy and stability: taxes, tariffs, public spending, trade agreements', 'Would a tariff on imported coffee change what beans cost?'],
        ['Economic', 'Growth, employment, interest rates, inflation, exchange rates, input prices', 'If firms cut costs in a downturn, are staff events among the first things to go?'],
        ['Social', 'Demographics, values, habits and tastes', 'How often do staff now come into the office, and how do they want to meet?'],
        ['Technological', 'New products, processes and ways of buying', 'Could better office coffee machines replace a catered coffee service?'],
        ['Environmental', 'Climate, weather, natural resources, pressure to reduce waste and emissions', 'Do clients now ask suppliers about waste and packaging?'],
        ['Legal', 'Laws and regulations: employment, food safety, consumer protection, licensing', 'What do food-hygiene rules require at off-site events?'],
      ],
    } },
    { p: 'Three cautions apply. First, the categories overlap: a tariff is both a political decision and an economic cost, and pressure to cut waste is both a social trend and an environmental one. OpenStax’s <i>Principles of Management</i> notes the overlap and argues, rightly, that it doesn’t make the checklist less useful. Put each factor where it helps the discussion, and don’t argue about the label.' },
    { p: 'Second, as the same text stresses, PESTEL factors are not opportunities or threats in themselves; they become one or the other only in relation to a particular business. Third, the letters vary. PEST, STEEP and STEEPLE (which adds ethics) are all in use; what matters is covering the ground, not the acronym.' },
    { p: 'A PESTEL scan easily produces dozens of factors, most of which will never matter. To prioritise, managers often score each factor for its likely <i>impact</i> on the business and the <i>likelihood</i> that it happens within the planning period, say from 1 to 5 each, and concentrate on the factors with the highest product. The scores are judgements, but writing them down makes disagreements visible and arguable.' },
    { p: 'Treat the product as a rough ranking, not a measurement. The scales are ordinal, 5 × 1 ties with 1 × 5, and a factor with impact 5 but likelihood 2 can drop out of a top-five list although it would hurt most if it happened. Review high-impact factors separately, and score impact by its size, whether the effect is good or bad.' },

    { h: 'Competitor analysis' },
    { p: 'Start by asking whom customers actually compare you with. <b>Direct competitors</b> offer much the same thing to the same customers: for Lantern, other office caterers. <b>Indirect competitors</b> meet the same need in a different way: a café that delivers coffee, or a leased bean-to-cup machine. Economists call an offer that meets the same need differently a <g>substitute</g>.' },
    { p: 'Customers can also choose to do the job themselves, or not at all. Lost sales, and what prospects say they would otherwise do, are the best evidence of who the real competitors are.' },
    { p: 'For each important competitor, find out what it offers and at what price, whom it targets, what it does well and badly in customers’ eyes, how big it is and how it is likely to respond if you move. Sources include its website and price lists, what clients and prospects tell you, the feedback from bids you lose, trade events and public records. Gather it honestly: posing as a customer to obtain a rival’s confidential price list is the kind of practice that damages a firm’s reputation and may break the law.' },
    { p: `The case gives enough to begin a profile of Lantern’s main catering competitor. Notice the unknowns: they are the questions the next round of research should answer.` },
    { table: {
      caption: `A first competitor profile of ${COMPETITOR.name}, from the case facts (fictional)`,
      head: ['Topic', 'What Lantern knows', 'What it doesn’t know yet'],
      rows: [
        ['Offer', 'Self-serve urns and pod machines; no baristas', 'Menus, extras, how it handles large events'],
        ['Price', `$${COMPETITOR.pricePerHead.toFixed(2)} a head, against Lantern’s $${c.pricePerHead.toFixed(2)}`, 'Discounts for large or regular clients'],
        ['Size', 'A larger caterer than Lantern', 'How many clients it serves, and how many it keeps'],
        ['Record against Lantern', `Won all ${CLIENT_INTERVIEWS.lostBids} bids Lantern lost in 2026, on price`, 'Bids Brewline lost to Lantern, and why'],
        ['Likely response', 'Unknown', 'Would it cut prices further if Lantern competed harder?'],
      ],
    } },
    { p: 'A competitor’s size in its market is measured by its <g>market share</g>: its sales as a percentage of the total sales in the market, over the same period. Share can be measured in money or in units, and it depends on how the market is defined. A caterer with 13% of the office-catering market in one city may have far less than 1% of “catering” nationally, so always state the market, the area and the period.' },
    { p: 'To compare competitors on more than size, list the factors that customers say decide their choice, weight each by its importance, score each competitor on each factor and add up the weighted scores: a <g>weighted competitive-strength scorecard</g>. It is the same arithmetic as the <g>weighted-attribute model</g> of the consumer-decisions lesson, seen from the seller’s side. Its value is that it forces two explicit judgements, how much each factor matters and how well each firm performs, and lets you see how sensitive the conclusion is to them. The weights should come from customers, not from the analyst’s view of what ought to matter.' },
    { p: 'Know the scorecard’s limits. It is <i>compensatory</i>: a high rating on one factor makes up for a low one, so screen out any firm that fails a must-have, such as a required safety certificate, before you score. Counting how often customers mention a factor measures what is top of mind, which is not necessarily what matters most: few clients mention safety until something goes wrong. And the ratings are judgements on a 1–5 scale, so gaps of about 0.1 in the weighted scores are not meaningful.' },
    { p: 'Some planners organise the whole review as the <b>5Cs</b>: company, customers, competitors, collaborators (suppliers, intermediaries and partners) and context (the macroenvironment). It covers the same ground as the micro and macro layers in a different order. Use whichever checklist your organisation uses; none of them is a theory.' },

    { h: 'SWOT analysis' },
    { p: 'A <g>SWOT analysis</g> summarises the situation in four lists. <b>Strengths</b> and <b>weaknesses</b> are internal: they belong to the business, which can change them. <b>Opportunities</b> and <b>threats</b> are external: they exist in the environment whether or not the business acts. OpenStax’s <i>Principles of Marketing</i> describes opportunities as openings for something positive to happen, but only if the business can take advantage of them.' },
    { figure: {
      svg: GRID,
      caption: 'The SWOT grid. The rows divide what the business controls from what it doesn’t; the columns divide what helps it reach its objectives from what gets in the way.',
      alt: 'A two-by-two grid. The columns are headed Helpful and Harmful. The rows are labelled Internal (the business controls it) and External (the business does not control it). The top-left cell is Strengths: what the business does better than rivals, in ways customers value. The top-right cell is Weaknesses: where it falls short of rivals or of what customers need. The bottom-left cell is Opportunities: conditions outside it that it could use, if it acts. The bottom-right cell is Threats: conditions outside it that could harm its results.',
    } },
    { p: 'Five rules make a SWOT worth reading.' },
    { ol: [
      '<b>Internal means controllable.</b> A rival’s new branch is external even though it is close by; a shortage of vans is internal even though it was caused by a supplier’s delay.',
      '<b>Opportunities are conditions, not actions.</b> “Launch a subscription service” is something the business might do, a strategy. The opportunity, if there is one, is the condition that makes it attractive, such as employers looking for ways to support people who work from home.',
      '<b>Strengths and weaknesses are relative and customer-judged.</b> Being “good at customer service” is a strength only if customers see it and rivals can’t match it. A belief the owner holds without evidence is a hypothesis to test, not a strength.',
      '<b>Every item needs evidence.</b> Say where it comes from: client interviews, sales records, lost bids, a competitor’s price list. Mark the items that rest on opinion.',
      '<b>Prioritise.</b> Rank strengths and weaknesses by how much they matter competitively, and opportunities and threats by how likely and how large they are. Three well-supported items in each box beat fifteen vague ones.',
    ] },
    { p: 'Some facts belong on both sides. A small business’s size can be a strength (it can respond to a client within a day) and a weakness (it has no cover when someone is ill). Split such a fact into its two effects and list each where it belongs.' },
    { p: 'A SWOT describes; it doesn’t decide. The <g>TOWS matrix</g>, proposed by Heinz Weihrich in 1982, turns it towards strategy by pairing the boxes: <b>SO</b> options use strengths to take opportunities, <b>ST</b> options use strengths to counter threats, <b>WO</b> options fix weaknesses in order to take opportunities, and <b>WT</b> options limit the damage where weaknesses meet threats. The result is a list of options to evaluate, not a decision. The next two lessons of this module, and later course M11, take that step further.' },

    { h: 'What these tools can’t do' },
    { p: 'SWOT is popular because it is quick and needs no data skills; that is also its weakness. Terry Hill and Roy Westbrook studied how consultants used it with 50 companies in a UK government manufacturing-planning scheme; SWOT was used in more than 20 of them. They found long lists of vaguely worded factors (over 40 on average), no prioritisation, no checking of whether the factors were true, and, most damning, no use of the results in the later stages of planning. Their article was titled “SWOT analysis: it’s time for a product recall”.' },
    { p: 'OpenStax’s <i>Principles of Management</i> adds two limits: a SWOT is only as good as the person doing it, and because it is hard to imagine everything, it tends to miss important issues. Both SWOT and PESTEL are heuristics: checklists that prompt good questions, not models that produce answers. Use them with the rules above, attach evidence, keep them short, and make sure each item leads somewhere, to an objective, an option or a question for research.' },
    { callout: 'warn', title: 'The snapshot problem', html: 'A situation analysis describes one moment. Competitors move, clients leave, rules change. Date it, note what would change your view, and repeat it at least once a year, or whenever a large change, such as a new competitor, arrives.' },

    { h: 'The evidence behind the analysis' },
    { p: 'A situation analysis is only as good as its inputs. The usual ones are the business’s own records (sales, clients won and lost, complaints), customer research (interviews and surveys), <b>win–loss reviews</b> (asking prospects why a bid was won or lost) and <g>secondary data</g> such as industry reports and official statistics. Course M04 teaches how to design and judge market research. Two questions apply to every input: who was asked, and who wasn’t?' },
    { p: `Lantern’s interviews show why. Ana asked ${CLIENT_INTERVIEWS.interviewed} of her ${c.clients} catering clients why they chose Lantern, and each could give several reasons.` },
    { table: {
      caption: `Reasons given by ${CLIENT_INTERVIEWS.interviewed} catering clients for choosing Lantern, November 2026 (fictional case)`,
      head: ['Reason', 'Clients naming it', 'Share of clients interviewed'],
      align: ['l', 'r', 'r'],
      rows: Object.entries(R).map(([k, v]) => [k, String(v), `${Math.round(share(v))}%`]),
      note: 'Each client could name several reasons, so the shares add up to more than 100%.',
    } },
    { p: `Three cautions follow. The sample is small: one client more or less changes a share by about 8 percentage points (1 ÷ ${CLIENT_INTERVIEWS.interviewed}). The shares can’t be added up, because the ${Object.values(R).reduce((a, b) => a + b, 0)} mentions came from ${CLIENT_INTERVIEWS.interviewed} people.` },
    { p: `Most important,  everyone interviewed is a current client, someone who has already chosen Lantern. That is a textbook case of <g>survivorship bias</g>: the prospects who chose Brewline are invisible in these figures, and the ${CLIENT_INTERVIEWS.lostBids} lost bids suggest they weighed price very differently. A finding such as “only ${R.Price} of ${CLIENT_INTERVIEWS.interviewed} clients mentioned price” describes the people who stayed with Lantern, not the market. How these findings belong in Lantern’s SWOT is part of the course project.` },
  ],

  formulas: [
    { id: 'sa-market-share', name: 'Market share',
      tex: String.raw`s = \dfrac{Q}{Q_{\text{market}}} \times 100`,
      where: [
        ['s', 'Market share of the business', '%'],
        ['Q', 'The business’s sales in the market over the period', '$ or units'],
        [String.raw`Q_{\text{market}}`, 'Total sales of all businesses in the same market over the same period', '$ or units (the same as Q)'],
      ],
      assumptions: 'The market is defined (which products, which customers, which area) and both sales figures cover the same period and use the same measure.',
      note: 'Share in money and share in units differ when prices differ: a premium brand has a larger share by value than by volume.' },
    { id: 'sa-weighted-strength', name: 'Weighted competitive-strength score',
      tex: String.raw`S_j = \sum_{i} w_i \, s_{ij}, \qquad \sum_i w_i = 1`,
      where: [
        [String.raw`S_j`, 'Weighted strength score of competitor j', 'points on the rating scale'],
        [String.raw`w_i`, 'Weight of factor i: its importance to customers, as a share of the total', ''],
        [String.raw`s_{ij}`, 'Rating of competitor j on factor i, for example from 1 (poor) to 5 (excellent)', 'points'],
      ],
      assumptions: 'The factors are the ones customers use to choose, the weights reflect the customers you want to win, and the ratings are made on the same scale for every competitor.',
      note: 'If importance is recorded as counts (how many customers named each factor), divide each count by the total to get weights that add up to 1. The score is only as good as the weights and ratings: always test how the ranking changes with different, defensible weights.' },
  ],

  examples: [
    { level: 'simple', title: 'Sorting a kayak operator’s environment', fictional: true,
      setup: 'Rookwood Kayak Tours runs guided kayak trips on a coastal estuary. Its owner lists eight things that have changed this year. (a) Fuel and insurance for its minibus cost more, as prices in general have risen. (b) More people in the region say they want outdoor, low-impact holidays. (c) Customers increasingly compare and book tours on phone apps. (d) Storms closed the estuary on more days than usual in the last two summers. (e) A new law requires a qualified first-aider on every commercial water trip. (f) The regional government has announced grants for tourism businesses that hire local young people. (g) A rival operator has opened across the estuary. (h) Rookwood’s kayak supplier has raised its prices. Sort each into the microenvironment or the macroenvironment, and give each macro factor its PESTEL letter.',
      steps: [
        'Ask first whether the item is about a particular actor Rookwood deals with. The rival operator (g) is a competitor and the kayak supplier (h) is a supplier: both are in the microenvironment.',
        'The rest are wider forces that act on every operator on the estuary: the macroenvironment. Give each the letter that best describes its source.',
        '(a) General price rises are economic. (b) A change in what people want from holidays is social. (c) Booking apps are technological. (d) Storms are environmental. (e) A legal requirement is legal. (f) A government grant scheme is political.',
        'Check the borderline items. The supplier’s price rise (h) is micro because it concerns one named supplier; a general rise in the price of plastics would be macro (economic). The first-aid law (e) also comes from government, but its effect is a legal obligation, so legal is the more useful label.',
      ],
      answer: 'Microenvironment: (g) competitor, (h) supplier. Macroenvironment: (a) economic, (b) social, (c) technological, (d) environmental, (e) legal, (f) political.',
      interpretation: 'Sorting is only the first step. The useful question comes next: which of these matter most to Rookwood, and do they help or hurt it? The storms (d) and the first-aid law (e) raise costs or cut trading days; the interest in outdoor holidays (b) and the grants (f) could help, if Rookwood acts on them. That judgement is the SWOT.' },

    { level: 'challenging', title: 'Building a SWOT for an office-plant firm', fictional: true,
      setup: 'Larkhill Office Plants supplies and cares for plants in offices. The owner gives you eight notes. (1) Larkhill’s two horticulturists hold the industry’s plant-care certificate; most rivals’ staff don’t. (2) 17 of its 20 clients have renewed every contract since it opened four years ago. (3) It has one van, so it can’t serve clients more than 30 minutes from its nursery. (4) Several large employers in the city are refitting their offices, and two have asked suppliers for proposals for “living walls” of plants. (5) Mossgiel Interiors, a national firm, has opened a city branch and offers new clients three months free. (6) “We should launch a plant-subscription service for people working from home.” (7) The owner believes Larkhill’s plants are the healthiest in the city. (8) Larkhill is small: it replaces any client’s plant within a day of a request, but it has no cover if one of its two horticulturists is ill. Build the SWOT, then suggest one option from the TOWS matrix.',
      steps: [
        'Apply the internal–external test. Notes 1, 2, 3, 7 and 8 describe Larkhill itself (internal). Notes 4 and 5 describe the market and a rival (external). Note 6 is neither: it is an action Larkhill might take, a strategy, so it stays off the grid and waits for the options stage.',
        'Test the strengths. The certificate (1) is a strength because rivals lack it and it bears on what clients buy: healthy plants. The renewals (2) are strong evidence that clients value the service: 17 ÷ 20 = 85% renewed every contract. The owner’s belief (7) has no evidence yet; it is a hypothesis to check, for example against plant-replacement rates or client feedback, not a strength.',
        'Split the mixed note. Note 8 has two effects: next-day replacement for every client (a strength) and no cover if a horticulturist is ill (a weakness). List each separately. The one van (3) is a weakness: it limits which clients Larkhill can serve.',
        'Place the external notes. The living-wall proposals (4) are an opportunity: a condition Larkhill could use if it acts. Mossgiel’s arrival with a free-trial offer (5) is a threat to Larkhill’s clients and prospects.',
        'Pair the boxes (TOWS). An SO option uses the certified horticulturists to bid for the living-wall work. An ST option uses the next-day replacement promise to offer existing clients longer contracts, with a guaranteed response time, before Mossgiel’s offer reaches them. A WO option asks whether a second van or a partner would let Larkhill bid for employers beyond its 30-minute radius.',
      ],
      answer: 'Strengths: certified horticulturists; 85% of clients renewing every contract; next-day replacement of plants. Weaknesses: one van and a 30-minute service radius; no cover if a horticulturist is ill. Opportunities: employers refitting offices and asking for living walls. Threats: Mossgiel’s new branch and free-trial offer. Off the grid: the subscription idea (an option to evaluate later) and the untested belief about plant health (a question for research).',
      interpretation: 'Half the work was keeping things out: an action dressed as an opportunity and a belief dressed as a strength. The TOWS options are a list to evaluate against Larkhill’s objectives and resources, not a decision; that evaluation is the subject of the next two lessons.' },

    { level: 'applied', title: 'Comparing Larkhill with its rivals', fictional: true,
      setup: 'Larkhill’s owner wants to know how it compares with Mossgiel Interiors and with Halvorsen Green, a cheaper local firm. When she asked her 20 clients what decides their choice of supplier, they made 40 mentions in all: reliability 16, plant quality 12, price 8 and design advice 4. She and two trusted clients rated each firm from 1 to 5 on each factor (the table). The office-plant market in the city is worth about $2.4 million a year; Larkhill’s revenue is $312,000, Mossgiel’s about $960,000 and Halvorsen’s about $216,000. Larkhill also lost 6 bids last year, and in every one the prospect named price first. Compare the three firms.',
      table: {
        caption: 'Weighted competitive-strength scorecard for Larkhill Office Plants (fictional)',
        head: ['Factor', 'Weight', 'Larkhill', 'Mossgiel', 'Halvorsen'],
        align: ['l', 'r', 'r', 'r', 'r'],
        rows: [
          ['Reliability', '0.40', '4', '4', '2'],
          ['Plant quality', '0.30', '5', '3', '3'],
          ['Price', '0.20', '2', '4', '5'],
          ['Design advice', '0.10', '5', '2', '1'],
        ],
        foot: [['Weighted score', '1.00', '4.0', '3.5', '2.8']],
      },
      steps: [
        String.raw`Turn the mentions into weights by dividing each count by the total of 40: reliability <m>16 \div 40 = 0.40</m>, plant quality <m>12 \div 40 = 0.30</m>, price <m>8 \div 40 = 0.20</m>, design advice <m>4 \div 40 = 0.10</m>. They add up to 1.`,
        String.raw`Weight and add each firm’s ratings (the scorecard formula). Larkhill: <m>0.4 \times 4 + 0.3 \times 5 + 0.2 \times 2 + 0.1 \times 5 = 1.6 + 1.5 + 0.4 + 0.5 = 4.0</m>. Mossgiel: <m>1.6 + 0.9 + 0.8 + 0.2 = 3.5</m>. Halvorsen: <m>0.8 + 0.9 + 1.0 + 0.1 = 2.8</m>.`,
        String.raw`Set the scores beside size (the market-share formula). Larkhill: <m>312{,}000 \div 2{,}400{,}000 = 13\%</m>. Mossgiel: <m>960{,}000 \div 2{,}400{,}000 = 40\%</m>. Halvorsen: <m>216{,}000 \div 2{,}400{,}000 = 9\%</m>. The firm with the best score has a third of the leader’s share.`,
        String.raw`Ask whose weights these are. They come from Larkhill’s own clients, the people who already chose it. The 6 lost prospects all put price first. Suppose, for illustration, that they weight price 0.40, reliability 0.30, plant quality 0.20 and design advice 0.10: Larkhill <m>0.3 \times 4 + 0.2 \times 5 + 0.4 \times 2 + 0.1 \times 5 = 3.5</m>, Mossgiel <m>1.2 + 0.6 + 1.6 + 0.2 = 3.6</m>, Halvorsen <m>0.6 + 0.6 + 2.0 + 0.1 = 3.3</m>. Mossgiel now edges ahead, though a gap of 0.1 on judgement ratings is too small to mean much: the two are effectively level.`,
        'Draw the conclusion the evidence supports, and no more. Larkhill is strongest on what its current clients value most (reliability and quality) and weakest on price. With price-led buyers it is roughly level with Mossgiel. Its small share is more likely to reflect its size, its one van and its thin staffing than a weak offer.',
      ],
      answer: 'Weighted by its clients’ priorities, Larkhill scores 4.0 against Mossgiel’s 3.5 and Halvorsen’s 2.8, but it holds only 13% of the market against Mossgiel’s 40%. With the illustrative weights for the prospects it lost, Mossgiel scores 3.6 against Larkhill’s 3.5: effectively level.',
      interpretation: 'The scorecard didn’t settle the question; it showed what the answer depends on. Larkhill wins with buyers who weight reliability and quality, and is level with Mossgiel with buyers who weight price. Which buyers to pursue is a strategic choice, the subject of the competitive-advantage lesson. The ratings themselves were made partly by Larkhill’s owner, so a fair next step is to ask clients and lost prospects to rate the firms directly.' },
  ],

  demo: [
    { widget: 'sa-scorecard', intro: 'Larkhill’s scorecard from the applied example, with the importance of each factor on a slider. Start from the weights given by its current clients (4, 3, 2, 1), then raise the importance of price step by step and watch the ranking change. The sliders are relative: the widget divides each by their total, so 4, 3, 2, 1 gives the same result as 8, 6, 4, 2. Find the smallest change that puts Mossgiel ahead.' },
  ],

  mistakes: [
    { title: '“Opportunities are things we could do.”', html: 'An opportunity is a condition outside the business, such as a change in what customers want or a gap a rival has left. “Launch an app” or “enter a new city” are actions, and belong among the options that come after the SWOT. Listing actions as opportunities skips the analysis and smuggles in a decision.' },
    { title: '“A strength is anything we are proud of.”', html: 'A strength must be something the business does better than its rivals, in a way customers value, and there must be evidence for it. A feature every competitor also has is not a strength, and an owner’s belief that nobody has checked is a hypothesis.' },
    { title: '“A long SWOT is a thorough SWOT.”', html: 'Hill and Westbrook found SWOTs made of long lists (over 40 factors on average) of general, unprioritised, unverified points that nobody used later in planning. Keep a few items per box, give each its evidence, rank them, and make sure each one leads to an objective, an option or a research question.' },
    { title: '“PESTEL factors are threats.”', html: 'PESTEL lists forces; it doesn’t judge them. A new packaging rule may hurt one firm and help another that already complies. Decide whether a factor is an opportunity or a threat only in relation to a particular business and its objectives.' },
    { title: '“Our clients say price doesn’t matter.”', html: 'If only current clients were asked, the answer describes the people who already accepted your price. Those who chose a cheaper rival are missing from the sample, which is survivorship bias. Lost bids and lost clients are the evidence that corrects it.' },
    { title: '“Our competitors are the firms that sell what we sell.”', html: 'Customers also compare you with substitutes (a different way of meeting the same need) and with doing the job themselves. Ask lost prospects what they chose instead; the answer is often not a look-alike firm.' },
  ],

  application: [
    { case: 'Pellham Dairy, a fictional regional dairy, supplies milk, yoghurt and butter to supermarkets and independent shops. Each autumn its marketing manager writes the situation analysis that opens the next year’s marketing plan. Her approach shows how a professional keeps the tools short, evidenced and pointed at decisions.' },
    { p: '<b>She starts with the evidence, not the grid.</b> She pulls the year’s sales by customer and product, the list of shops that stopped stocking Pellham and the reasons they gave, the results of a small shopper survey, the main competitors’ prices from store visits, and notes from her sales team. She dates the pack: the analysis describes October, and she will revisit it if anything large changes.' },
    { p: '<b>She scans the macroenvironment and ranks it.</b> Her team lists about twenty PESTEL factors in an hour. She scores each for impact and likelihood over the coming year, from 1 to 5, and keeps the top five for discussion.' },
    { table: {
      caption: 'Pellham Dairy’s five highest-priority PESTEL factors (fictional scores)',
      head: ['Factor', 'PESTEL', 'Impact', 'Likelihood', 'Priority'],
      align: ['l', 'l', 'r', 'r', 'r'],
      rows: [
        ['A proposed rule requiring recyclable caps and labels from 2028', 'Legal, environmental', '4', '4', '16'],
        ['Rising feed and energy costs pushing up the price farmers are paid', 'Economic', '5', '3', '15'],
        ['More younger shoppers buying plant-based drinks (Pellham’s own survey)', 'Social', '3', '4', '12'],
        ['Cheaper sensors for tracking milk temperature in transit', 'Technological', '2', '5', '10'],
        ['A possible change in funding for milk in schools', 'Political', '3', '2', '6'],
      ],
      note: 'Priority = impact × likelihood. The scores are the team’s judgements, recorded so they can be challenged.',
    } },
    { p: '<b>She profiles three competitors, not thirty.</b> For the national brand, a supermarket’s own-label milk and a rival regional dairy she records price, range, where they are stocked and what buyers say about them, with a column for what she doesn’t know. Lost listings tell her the most: two independent shops switched to the rival dairy because it delivers six days a week, against Pellham’s three.' },
    { p: '<b>Her SWOT fits on one page.</b> Each box has at most four items, each with its source: “strength: the best-known local dairy brand among surveyed shoppers (shopper survey)”; “weakness: three deliveries a week, against the rival’s six (two lost listings)”; “threat: recyclable-packaging rule (draft regulation, priority 16)”. She then writes one or two options for each TOWS pairing. One ST option, for example, is to switch to recyclable caps before the rule arrives and tell shoppers so, using the strong local brand to turn a threat into a reason to choose Pellham.' },
    { p: '<b>She ends with questions, not conclusions.</b> The last section lists what the analysis can’t yet answer and the research that would: would independents pay more for six deliveries a week? How many plant-based buyers also buy dairy? Those questions, and the prioritised SWOT, are what the objectives and strategy sections of the plan build on. The same discipline applies whether the business is a dairy, a hotel, a software firm or a coffee caterer: few items, each with evidence, each leading somewhere.' },
  ],

  summary: [
    'A situation analysis answers “where are we now?”: it reviews the environment, the competitors and the business itself before objectives and strategy are set.',
    'The microenvironment is the actors a business deals with (customers, competitors, suppliers, intermediaries, publics, the rest of the business); the macroenvironment is the wider forces, checked with PESTEL.',
    'PESTEL factors are neither opportunities nor threats in themselves; prioritise them by impact and likelihood.',
    'Competitor analysis includes substitutes and doing nothing. Market share measures size; a weighted competitive-strength scorecard compares firms on what customers value, and its answer depends on whose weights you use.',
    'In a SWOT, strengths and weaknesses are internal and customer-judged; opportunities and threats are external conditions, not actions. Every item needs evidence and a priority.',
    'SWOT and PESTEL are heuristics with known weaknesses (long, vague, unverified, unused lists). The TOWS matrix turns a SWOT into options; it doesn’t make the decision.',
    'Judge the evidence: research with current customers only suffers from survivorship bias, and small samples move a lot with one answer.',
  ],

  glossary: [
    { term: 'Situation analysis', def: 'A structured review of a business’s current position (its customers, competitors, wider environment and its own strengths and weaknesses) used as the starting point of a marketing plan.' },
    { term: 'Marketing environment', def: 'The actors and forces outside the marketing function that affect its ability to build and keep relationships with customers; divided into the microenvironment and the macroenvironment.' },
    { term: 'Microenvironment', def: 'The actors close to a business that it deals with directly: customers, competitors, suppliers, intermediaries, publics and the rest of the business itself.' },
    { term: 'Macroenvironment', def: 'The wider political, economic, social, technological, environmental and legal forces that shape a whole market and that no single business controls.' },
    { term: 'PESTEL', def: 'A checklist for scanning the macroenvironment: political, economic, social, technological, environmental and legal factors. Variants include PEST, STEEP and STEEPLE.' },
    { term: 'Competitor analysis', def: 'Identifying the firms and other options customers could choose instead, and studying their offers, prices, strengths, weaknesses and likely responses.' },
    { term: 'Substitute', def: 'A product or service that meets the same customer need in a different way, such as a leased office coffee machine instead of a coffee caterer.' },
    { term: 'Market share', def: 'A business’s sales as a percentage of total sales in a defined market over the same period, measured in money or in units.' },
    { term: 'Weighted competitive-strength scorecard', def: 'A comparison of competitors in which each is rated on the factors customers use to choose, each rating is multiplied by the factor’s weight, and the results are added up.' },
    { term: 'SWOT analysis', def: 'A summary of a business’s situation in four lists: internal strengths and weaknesses, and external opportunities and threats.' },
    { term: 'TOWS matrix', def: 'Heinz Weihrich’s (1982) way of turning a SWOT into strategic options by pairing its boxes: strengths with opportunities (SO) or threats (ST), and weaknesses with opportunities (WO) or threats (WT).' },
  ],

  references: [
    { text: 'Gomez Albrecht, M., Green, M. &amp; Hoffman, L. (2023). <i>Principles of Marketing</i>, section 2.2, “The Role of Marketing in the Strategic Planning Process” (SWOT analysis). OpenStax.', url: 'https://openstax.org/books/principles-marketing/pages/2-2-the-role-of-marketing-in-the-strategic-planning-process', checked: '2026-10-23' },
    { text: 'Gomez Albrecht, M., Green, M. &amp; Hoffman, L. (2023). <i>Principles of Marketing</i>, section 2.3, “Purpose and Structure of the Marketing Plan” (the current marketing situation and competitive analysis). OpenStax.', url: 'https://openstax.org/books/principles-marketing/pages/2-3-purpose-and-structure-of-the-marketing-plan', checked: '2026-10-23' },
    { text: 'Bright, D. S., Cortes, A. H. et al. (2019). <i>Principles of Management</i>, sections 8.2, “Using SWOT for Strategic Analysis”, and 8.3, “A Firm’s External Macro Environment: PESTEL”. OpenStax.', url: 'https://openstax.org/books/principles-management/pages/8-3-a-firms-external-macro-environment-pestel', checked: '2026-10-23' },
    { text: 'Hill, T. &amp; Westbrook, R. (1997). SWOT analysis: it’s time for a product recall. <i>Long Range Planning</i>, 30(1), 46–52. The full text was not consulted; the findings are taken from the article’s abstract.', url: 'https://doi.org/10.1016/S0024-6301(96)00095-7', checked: '2026-10-23' },
    { text: 'Weihrich, H. (1982). The TOWS matrix: a tool for situational analysis. <i>Long Range Planning</i>, 15(2), 54–66. Publication details confirmed from the Crossref record.', url: 'https://doi.org/10.1016/0024-6301(82)90120-0', checked: '2026-10-23' },
  ],

  checks: [
    { what: 'Catering clients (case.js)', value: c.clients, shown: 18 },
    { what: 'Events per client per year (case.js)', value: c.eventsPerClientYear, shown: 6 },
    { what: 'Lantern price per head (case.js)', value: c.pricePerHead, shown: 9 },
    { what: 'Catering growth goal % (case.js)', value: GOALS.cateringGrowth * 100, shown: 25 },
    { what: 'Clients interviewed (case.js)', value: CLIENT_INTERVIEWS.interviewed, shown: 12 },
    { what: 'Bids lost to Brewline (case.js)', value: CLIENT_INTERVIEWS.lostBids, shown: 5 },
    { what: 'Brewline price per head (case.js)', value: COMPETITOR.pricePerHead, shown: 7.5 },
    { what: 'Interviews: coffee quality count', value: R['Coffee quality'], shown: 9 },
    { what: 'Interviews: coffee quality share %', value: Math.round(share(R['Coffee quality'])), shown: 75 },
    { what: 'Interviews: reliability count', value: R['Reliability on the day'], shown: 7 },
    { what: 'Interviews: reliability share %', value: Math.round(share(R['Reliability on the day'])), shown: 58 },
    { what: 'Interviews: professionalism count', value: R['Baristas’ professionalism'], shown: 6 },
    { what: 'Interviews: professionalism share %', value: Math.round(share(R['Baristas’ professionalism'])), shown: 50 },
    { what: 'Interviews: flexible menus count', value: R['Flexible menus'], shown: 4 },
    { what: 'Interviews: flexible menus share %', value: Math.round(share(R['Flexible menus'])), shown: 33 },
    { what: 'Interviews: price count', value: R.Price, shown: 2 },
    { what: 'Interviews: price share %', value: Math.round(share(R.Price)), shown: 17 },
    { what: 'Interviews: one client in percentage points', value: 100 / CLIENT_INTERVIEWS.interviewed, shown: 8, tol: 0.5 },
    { what: 'Interviews: total mentions', value: Object.values(R).reduce((a, b) => a + b, 0), shown: 28 },
    { what: 'Larkhill: renewal share %', value: 17 / 20 * 100, shown: 85 },
    { what: 'Larkhill: reliability weight', value: 16 / 40, shown: 0.4 },
    { what: 'Larkhill: quality weight', value: 12 / 40, shown: 0.3 },
    { what: 'Larkhill: price weight', value: 8 / 40, shown: 0.2 },
    { what: 'Larkhill: design weight', value: 4 / 40, shown: 0.1 },
    { what: 'Larkhill: total mentions', value: 16 + 12 + 8 + 4, shown: 40 },
    { what: 'Larkhill: weights sum', value: W1.reduce((a, b) => a + b, 0), shown: 1 },
    { what: 'Scorecard: Larkhill (clients’ weights)', value: score(W1, S.larkhill), shown: 4.0 },
    { what: 'Scorecard: Larkhill terms', value: 0.4 * 4 + 0.3 * 5, shown: 1.6 + 1.5 },
    { what: 'Scorecard: Larkhill terms 3–4', value: 0.2 * 2 + 0.1 * 5, shown: 0.4 + 0.5 },
    { what: 'Scorecard: Mossgiel (clients’ weights)', value: score(W1, S.mossgiel), shown: 3.5 },
    { what: 'Scorecard: Mossgiel terms', value: 0.3 * 3 + 0.2 * 4 + 0.1 * 2, shown: 0.9 + 0.8 + 0.2 },
    { what: 'Scorecard: Halvorsen (clients’ weights)', value: score(W1, S.halvorsen), shown: 2.8 },
    { what: 'Scorecard: Halvorsen terms', value: 0.4 * 2 + 0.3 * 3 + 0.2 * 5 + 0.1 * 1, shown: 0.8 + 0.9 + 1.0 + 0.1 },
    { what: 'Scorecard: Larkhill (lost-bid weights)', value: score(W2, S.larkhill), shown: 3.5 },
    { what: 'Scorecard: Mossgiel (lost-bid weights)', value: score(W2, S.mossgiel), shown: 3.6 },
    { what: 'Scorecard: Mossgiel lost-bid terms', value: 0.3 * 4 + 0.2 * 3 + 0.4 * 4 + 0.1 * 2, shown: 1.2 + 0.6 + 1.6 + 0.2 },
    { what: 'Scorecard: Halvorsen (lost-bid weights)', value: score(W2, S.halvorsen), shown: 3.3 },
    { what: 'Scorecard: Halvorsen lost-bid terms', value: 0.3 * 2 + 0.2 * 3 + 0.4 * 5 + 0.1 * 1, shown: 0.6 + 0.6 + 2.0 + 0.1 },
    { what: 'Larkhill market share %', value: 312000 / 2400000 * 100, shown: 13 },
    { what: 'Mossgiel market share %', value: 960000 / 2400000 * 100, shown: 40 },
    { what: 'Halvorsen market share %', value: 216000 / 2400000 * 100, shown: 9 },
    { what: 'Larkhill share vs leader (about a third)', value: 312000 / 960000, shown: 0.33, tol: 0.01 },
    { what: 'Market size ($ millions)', value: 2400000 / 1e6, shown: 2.4 },
    { what: 'Pellham: recyclable rule priority', value: 4 * 4, shown: 16 },
    { what: 'Pellham: farm price priority', value: 5 * 3, shown: 15 },
    { what: 'Pellham: plant-based priority', value: 3 * 4, shown: 12 },
    { what: 'Pellham: sensors priority', value: 2 * 5, shown: 10 },
    { what: 'Pellham: school milk priority', value: 3 * 2, shown: 6 },
  ],
};
