// promotion-mix.js — M02 · The promotion mix and integrated marketing communications. Content only; exercises are in promotion-mix.ex.js.
// Lantern figures come from ./market.js (fictional). Costs in the worked budgets are hypothetical and labelled as such.
// The simulator results quoted in the trade-promotion note are recomputed with the engine (mixsim.js) in `checks`.
import { simulate, DEFAULT_PLAN, C } from '../../../core/mixsim.js?v=13';

const SIM = (() => {
  const base = simulate(DEFAULT_PLAN), none = simulate({ ...DEFAULT_PLAN, promotion: { ...DEFAULT_PLAN.promotion, trade: 0 } });
  return { base: base.year, none: none.year, promoted: base.byChannel.reduce((a, c) => a + c.promotedUnits, 0) };
})();

export default {
  slug: 'promotion-mix',
  title: 'The promotion mix and integrated marketing communications',
  blurb: 'Promotion is how a business gets its offer noticed, understood and tried. Learn what each promotion tool does well and badly, when to push through the channel or pull through demand, how to make the messages work as one, and how to build a budget from objectives instead of guessing.',
  status: 'draft',
  objectives: [
    'Describe marketing communication as a process and explain where messages fail.',
    'Compare advertising, sales promotion, personal selling, public relations and direct and digital marketing by reach, cost per contact, persuasiveness and control.',
    'Distinguish push and pull strategies and classify promotion activities as one or the other.',
    'Evaluate response-hierarchy models such as AIDA and explain their limits.',
    'Calculate promotion budgets with the affordable, percentage-of-sales, competitive-parity and objective-and-task methods, and compare them.',
    'Plan an integrated launch campaign that is consistent with the product, price and channels.',
  ],
  prerequisites: [
    { lesson: 'm02/distribution-channels', why: 'Push promotion works through the channel, and the trade margins and listing fees from that lesson decide how much support each channel needs.' },
    { lesson: 'm02/marketing-mix', why: 'Promotion has to communicate the positioning and value proposition set out there.' },
  ],
  case: 'lantern',

  concept: [
    { case: 'Lantern’s can is listed, priced and on its way to the shelves. One number in the market file shows the problem that remains: only 12% of Harbour City’s cold-brew buyers have heard of Lantern, from its catering work and cafés. The other 88% will walk past a can they don’t recognise, next to Daily Grind, which 75% of them know, and Summit Brew, which 60% know. Shoppers have to notice the can, understand why a single-origin cold brew at $3.49 is worth more than a $2.29 one, and try it. Lantern’s first plan sets aside $120,000 for that: $50,000 for social and search ads, $40,000 for in-store sampling and displays, $20,000 for trade promotions and $10,000 for PR and events. This lesson is about how a split like that should be decided.' },
    { p: 'Promotion is the communication element of the <g>marketing mix</g>: everything a business does to inform, persuade and remind the people whose decisions matter to it. For Lantern those people are not only shoppers. Supermarket and grocery buyers decide whether the can gets a shelf, journalists decide whether its launch is news, and café customers decide whether to recommend it. Each audience needs a different kind of communication.' },
    { h: 'Communication as a process' },
    { p: 'A message doesn’t travel from a company into a customer’s mind intact. A simple model, used in most marketing textbooks, breaks communication into parts. The <b>sender</b> (Lantern) has an idea to get across. <b>Encoding</b> turns the idea into words, images and sounds: a six-second video of coffee steeping overnight. The encoded <b>message</b> travels through a <b>medium</b>, such as a social feed, a shelf display or a salesperson. The <b>receiver</b> (a shopper) <b>decodes</b> it, giving it meaning from their own experience. <b>Feedback</b> tells the sender what happened: a click, a purchase, a question, a complaint. And <b>noise</b> is anything that interferes along the way: the thirty other drinks in the fridge, a scrolling thumb, a rival’s louder offer.' },
    { figure: {
      svg: '<svg viewBox="0 0 640 205" xmlns="http://www.w3.org/2000/svg" font-size="12"><defs><marker id="pm-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs><g fill="none" stroke="var(--rule-strong)" stroke-width="1.5"><rect x="5" y="70" width="100" height="44" rx="4"/><rect x="130" y="70" width="100" height="44" rx="4"/><rect x="255" y="70" width="130" height="44" rx="4"/><rect x="410" y="70" width="100" height="44" rx="4"/><rect x="535" y="70" width="100" height="44" rx="4"/></g><g fill="currentColor" text-anchor="middle"><text x="55" y="96">Sender</text><text x="180" y="96">Encoding</text><text x="320" y="89">Message</text><text x="320" y="104">through a medium</text><text x="460" y="96">Decoding</text><text x="585" y="96">Receiver</text><text x="320" y="22">Noise: clutter, distraction,</text><text x="320" y="37">competing messages</text><text x="320" y="196">Feedback: purchases, clicks, questions, complaints</text></g><g stroke="currentColor" stroke-width="1.5" fill="none"><line x1="105" y1="92" x2="128" y2="92" marker-end="url(#pm-arrow)"/><line x1="230" y1="92" x2="253" y2="92" marker-end="url(#pm-arrow)"/><line x1="385" y1="92" x2="408" y2="92" marker-end="url(#pm-arrow)"/><line x1="510" y1="92" x2="533" y2="92" marker-end="url(#pm-arrow)"/><path d="M585 114V170H55V116" marker-end="url(#pm-arrow)"/><line x1="320" y1="44" x2="320" y2="68" stroke-dasharray="4 3" marker-end="url(#pm-arrow)"/></g></svg>',
      caption: 'The communication process. The marketer controls the sender, the encoding, the message and the choice of medium; the receiver’s decoding, the feedback and the noise are largely outside its control.',
      alt: 'Five boxes in a row joined by arrows from left to right: sender, encoding, message through a medium, decoding, receiver. A dashed arrow labelled noise, meaning clutter, distraction and competing messages, points down into the message box. A feedback line runs from the receiver back along the bottom to the sender, labelled purchases, clicks, questions and complaints.',
    } },
    { p: 'The model is simple, but it explains why so much promotion fails. Lantern means “worth paying more for”; a shopper may decode “fancy” or “overpriced”. The fix is to encode in the receiver’s terms, test how messages are understood, choose media where the target audience is paying attention, repeat the message, and watch the feedback.' },
    { h: 'The five tools of the promotion mix' },
    { p: 'The <g>promotion mix</g> is the combination of communication tools a business uses. Many textbooks list five; some, including OpenStax, treat direct marketing and digital marketing separately and list six.' },
    { define: [
      ['<g>Advertising</g>', 'Paid, non-personal communication from an identified sponsor through mass or digital media: television, radio, outdoor posters, print, online video and social and search ads.'],
      ['<g>Sales promotion</g>', 'Short-term incentives to buy or sell now. <i>Consumer</i> promotions target shoppers: coupons, free samples, temporary price cuts, multi-buy offers, contests. <i>Trade</i> promotions target intermediaries: allowances that fund retailers’ price cuts, payments for displays, extra margin for featuring the product.'],
      ['<g>Personal selling</g>', 'Person-to-person communication aimed at making a sale and building a relationship, face to face or by phone or video call.'],
      ['<g>Public relations</g>', 'Building good relationships with the company’s publics, including media, communities and investors, and earning favourable coverage: press releases, launch events, sponsorships, interviews.'],
      ['<g>Direct and digital marketing</g>', 'Communication with carefully targeted individuals that invites a direct response: email, direct mail, messaging, the company’s website and app, and targeted online ads. Online and social media blur the line with advertising, which is why many textbooks group them together.'],
    ] },
    { p: 'The tools differ along two dimensions that pull against each other: how many people a tool reaches for each dollar, and how persuasive each contact is. A salesperson spending an hour with a supermarket buyer reaches one person at a high cost, but can tailor every argument, answer objections and close the deal. A social ad reaches thousands for the same money, but each person sees it for a second and can scroll past. Public relations can be cheap and credible, because a journalist’s word is trusted more than an ad, but the company can’t control whether or how the story runs.' },
    { table: {
      caption: 'The promotion tools compared',
      head: ['Tool', 'Does well', 'Does badly', 'Cost per person reached', 'Persuasion per contact'],
      rows: [
        ['Advertising', 'Reaches many people quickly; repeats a message; builds awareness and image', 'One-way; easy to ignore; large total cost; effect hard to isolate', 'Low', 'Low'],
        ['Sales promotion', 'Prompts action now: trial, switching, stocking up; wins retailer support', 'Short-lived; frequent deals teach buyers to wait and can cheapen a premium image; costs margin', 'Moderate', 'High, briefly'],
        ['Personal selling', 'Two-way and tailored; handles objections; essential in B2B and for winning listings', 'Very expensive per contact; slow; depends on the salesperson', 'Very high', 'Very high'],
        ['Public relations', 'Credible third-party coverage; low media cost; builds reputation', 'Little control over timing or content; slow; hard to repeat', 'Low', 'Moderate'],
        ['Direct and digital marketing', 'Targeted and personal; invites a response; easy to test and change', 'Needs data and permission; privacy concerns; clutter; easily over-credited', 'Low to moderate', 'Moderate'],
      ],
      note: 'The ratings are typical, not fixed: a viral social video can be very persuasive, and a badly targeted sales call can persuade nobody.',
    } },
    { h: 'Push and pull' },
    { p: 'A product like Lantern’s has to travel through the channel from the previous lesson, and promotion can help it along from either end. A <g>push strategy</g> directs promotion at the channel: personal selling to distributors and store buyers, and trade promotions that give them reasons to stock, display and sell the product. The producer pushes the product to the next level, which pushes it on. A <g>pull strategy</g> directs promotion at final customers, through advertising, consumer promotions, PR and digital marketing, to create demand that draws the product through the channel: shoppers ask for it, so stores stock it.' },
    { p: 'For Lantern, the push is the sales manager’s meetings with supermarket and natural-grocer buyers, the $20,000 of trade promotions that fund temporary price cuts in store, and the displays and sampling days offered as part of the deal that wins the listing. The pull is the $50,000 of social and search ads, the PR launch and emails to Lantern’s café customers. In-store sampling sits on the boundary: Lantern negotiates it with retailers as part of its support package, so this course counts it with the push, but it acts on shoppers at the shelf, which is why some textbooks call sampling a consumer (pull) promotion. What matters is being clear about whom each activity is meant to move.' },
    { callout: 'key', title: 'Push and pull are partners, not rivals', html: 'A new brand needs push to get onto the shelf and pull to get off it. Without push, the advertising sends shoppers to stores that don’t stock the can; without pull, the retailer stocks a can nobody picks up, and drops it at the next review. Brands with strong pull also gain channel power, because retailers need them.' },
  ],

  theory: [
    { h: 'Response hierarchies: AIDA and its relatives' },
    { p: 'Why would a $50,000 ad campaign lead to sales? The oldest answer is a ladder of mental steps. <g>AIDA</g> says a buyer moves from <b>attention</b> (noticing the product) to <b>interest</b> (wanting to know more) to <b>desire</b> (wanting it) to <b>action</b> (buying). The formula is usually credited to the American advertising pioneer E. St. Elmo Lewis around 1898, on the strength of the psychologist Edward K. Strong’s account in 1925; a 2024 historical study by Akinori Iwamoto argues that there is no evidence Lewis devised it then, and that early sales writers shaped the formula. AIDA is best described as a long-standing model whose exact origin is uncertain.' },
    { p: 'Later models stretched the ladder. Robert Lavidge and Gary Steiner (1961) proposed six steps: awareness, knowledge, liking, preference, conviction and purchase, grouped into thinking, feeling and doing. Models of this family are called <g>hierarchy-of-effects models</g>. They are useful in two ways. They remind a planner that most people aren’t ready to buy the first time they hear of a product, and they let a campaign set a different objective for each stage, measured in a different way: awareness by surveys, interest by visits or sign-ups, action by sales.' },
    { table: {
      caption: 'Using the AIDA stages to plan Lantern’s launch',
      head: ['Stage', 'Lantern’s objective', 'Tools that fit', 'How it could be measured'],
      rows: [
        ['Attention', 'Make the 88% who don’t know Lantern notice it', 'Social and search ads, PR, the can on display', 'Awareness surveys; ad reach'],
        ['Interest', 'Explain single-origin, steeped 20 hours', 'Short videos, food-media coverage, the online shop', 'Visits, video views, shop sign-ups'],
        ['Desire', 'Make it seem worth $3.49', 'Tasting, reviews, recommendations', 'Purchase intent in surveys'],
        ['Action', 'Get the first purchase, then the second', 'Sampling at the shelf, trade promotions, availability', 'Trial and repeat purchases'],
      ],
    } },
    { p: 'The models also have limits, and a careful planner treats them as checklists, not laws. Vakratsas and Ambler (1999) reviewed more than 250 studies of how advertising works and concluded that there is little support for a fixed temporal sequence of effects. Real buying often skips or reverses steps. A canned drink is a low-involvement, low-price purchase: a shopper may grab Lantern because it is chilled and next to the till, and decide whether she likes it only after tasting it. For such products experience forms the preference, which is why sampling matters so much. The ladders also stop at the first purchase, while a brand like Lantern lives on the second and the tenth, and they treat each person as moving alone when many decisions are shaped by friends, reviews and what is on the shelf.' },
    { callout: 'warn', title: 'Frameworks are simplifications', html: 'AIDA, push and pull and integrated marketing communications are ways of organising decisions, not descriptions of how every buyer behaves. Use them to ask better questions (Which stage is our bottleneck? Who is this activity meant to move?), then check the answers against evidence from your own market.' },
    { h: 'Integrated marketing communications' },
    { p: '<g>Integrated marketing communications</g> (IMC) means planning all the promotion tools together so that they deliver one clear, consistent message about the brand. Each tool is used for the job it does best, the timing is coordinated, and every touchpoint, from the can and the shelf display to the ads, the salesperson’s pitch and the café menu, tells the same story about the same <g>positioning</g>.' },
    { p: 'For Lantern, integration means that the claim “single-origin cold brew, steeped 20 hours” appears on the can, in the ads, in the sampling script and in the press kit; that ads run near the stores that stock the can, in the weeks when sampling teams are there; and that trade promotions are rare enough not to teach shoppers that a $3.49 can is really a $2.79 one.' },
    { p: 'IMC is easier to agree with than to achieve. Different tools are often run by different teams or agencies, each with its own budget and its own measure of success, so each optimises its own piece. Retailers run their own promotions, and a supermarket flyer may present Lantern as a bargain while Lantern’s ads present it as a treat. Short-term sales targets favour price promotions that undercut a premium message. Measurement credits each channel separately, which the next lesson shows can mislead. And integration is not uniformity: the same idea has to be adapted to a six-second video, a shelf tag and a conversation with a buyer, and every adaptation is a chance for the message to drift.' },
    { h: 'Setting the promotion budget' },
    { p: 'There is no formula that gives the right promotion budget, because the response of sales to promotion is uncertain and varies from market to market. Companies use four main methods, often in combination.' },
    { table: {
      caption: 'Four ways to set a promotion budget',
      head: ['Method', 'How the budget is set', 'Strength', 'Weakness'],
      rows: [
        ['<g>Affordable method</g>', 'Whatever is left after other costs and the profit target', 'Protects cash; simple', 'Ignores what promotion could achieve; swings with profits; starves launches, which need spending before sales arrive'],
        ['<g>Percentage-of-sales method</g>', 'A fixed percentage of past or forecast sales', 'Simple; ties spending to the size of the business; easy to compare across years', 'Reverses cause and effect (sales decide promotion, not the other way round); no past sales at launch; cuts spending when sales fall, which may be when it is most needed'],
        ['<g>Competitive-parity method</g>', 'Match competitors’ spending, or their spending relative to sales', 'Avoids being badly outspent; gives a market reference point', 'Assumes rivals know best and share your objectives; estimates of rivals’ spending are rough'],
        ['<g>Objective-and-task method</g>', 'Set objectives, list the tasks needed to reach them, and cost each task', 'Links money to results; makes trade-offs explicit; can be tested afterwards', 'Needs estimates of how much effort produces how much result; more work; can be padded'],
      ],
    } },
    { p: 'The objective-and-task method is the one textbooks recommend and, by OpenStax’s account, one of the least used, because it demands the most thinking. Its real strength is that it turns the budget into a list of jobs with prices. If the total is too high, the company can see which objective it is giving up when it cuts a task, instead of trimming every line by the same percentage. In practice planners often build the budget by objective and task, then check it against what the business can afford and what rivals spend.' },
    { callout: 'note', title: 'What the simulator says about the $20,000 of trade promotion', html: 'In the Marketing Mix Simulator, with everything else at the first plan, cutting trade promotion from $20,000 to $0 raises Lantern’s profit after overhead from about $122,956 to $133,234. The deals add about 6,233 cans, but Lantern pays 20% of the price on all of the roughly 28,653 promoted cans, most of which shoppers would have bought anyway, so the extra gross profit (about $9,721) falls well short of the $20,000. The model’s trade money buys only temporary price cuts: it gives no value to the shelf position, features and retailer goodwill that a new brand’s promotion windows are often negotiated to win, and because the model has no repeat purchase, a shopper who first tries Lantern on a deal is worth one can. Whether those are worth about $10,000 a year is a judgement the model can’t make. Treat the trade budget as part of the price of winning and keeping the listings, keep it as small as the retailers will accept, and check whether the deals bring buyers back at the full price.' },
  ],

  formulas: [
    { id: 'pct-of-sales-budget', name: 'Percentage-of-sales budget',
      tex: String.raw`B = s \times R`,
      where: [
        [String.raw`B`, 'Promotion budget for the period', '$'],
        [String.raw`s`, 'Chosen percentage of sales, as a decimal', ''],
        [String.raw`R`, 'Sales revenue: last period’s actual or this period’s forecast', '$'],
      ],
      assumptions: 'The percentage is a policy choice, often taken from the company’s history or industry habit; it is not derived from what promotion achieves.' },
    { id: 'competitive-parity-budget', name: 'Competitive-parity budget (average of rivals)',
      tex: String.raw`B = \dfrac{1}{n}\sum_{i=1}^{n} B_i`,
      where: [
        [String.raw`B_i`, 'Estimated promotion spending of rival i', '$'],
        [String.raw`n`, 'Number of rivals used as the benchmark', ''],
      ],
      note: 'A variant matches rivals’ spending as a percentage of their sales instead of in dollars.' },
    { id: 'objective-task-budget', name: 'Objective-and-task budget',
      tex: String.raw`B = \sum_{k} q_k \times c_k`,
      where: [
        [String.raw`B`, 'Promotion budget for the period', '$'],
        [String.raw`q_k`, 'Quantity of task k needed to reach the objectives (demo days, thousands of impressions, events…)', 'units'],
        [String.raw`c_k`, 'Cost per unit of task k', '$ per unit'],
      ],
      assumptions: 'The quantities rest on estimates of how much activity is needed to reach each objective; those estimates should be checked against results.' },
  ],

  examples: [
    { level: 'simple', title: 'Three quick budgets for a hotel', fictional: true,
      setup: 'Harborview Hotel, a fictional 80-room city hotel, forecasts $3,600,000 of revenue next year. Its owners usually spend 4% of revenue on promotion. Estimates put three rival hotels’ promotion spending at $120,000, $180,000 and $150,000. After its other costs and the owners’ profit target, the hotel could afford $100,000. What budget does each method give?',
      steps: [
        'Percentage of sales: <m>0.04 \\times 3{,}600{,}000 = 144{,}000</m>.',
        'Competitive parity, matching the rivals’ average: <m>(120{,}000 + 180{,}000 + 150{,}000) \\div 3 = 150{,}000</m>.',
        'Affordable: $100,000, by definition what is left after other costs and the profit target.',
        'Compare: the methods give a range from $100,000 to $150,000. None of them says what the money is meant to achieve, such as how many more rooms to sell to which guests.',
      ],
      answer: 'Percentage of sales gives $144,000, competitive parity $150,000 and the affordable method $100,000.',
      interpretation: 'Each number is easy to calculate and easy to defend in a meeting, and that is their appeal. But each is set by something other than the hotel’s objectives: last year’s habit, the rivals’ choices or the cash left over. The objective-and-task method starts from the other end.' },
    { level: 'challenging', title: 'An objective-and-task budget for Lantern’s launch', fictional: true,
      setup: 'Build Lantern’s first-year promotion budget from objectives and tasks. All costs are hypothetical quotes. Lantern’s hypothetical sales forecast is 250,000 cans at an average net price of $2.40. Compare the result with a budget of 15% of forecast sales, and show what a cut to that level would mean.',
      steps: [
        'Set objectives that can be checked: (1) raise awareness among Harbour City’s cold-brew buyers from 12% to 30% by the end of the year; (2) give 40,000 shoppers a taste in stores in the first two quarters; (3) win features in the stocking supermarkets in the launch months; (4) earn local food-media coverage at launch.',
        'Cost the tasks. Awareness: a media agency quotes $8 per thousand ad impressions, and plans 6,250,000 geo-targeted impressions: <m>6{,}250{,}000 \\div 1{,}000 \\times 8 = 50{,}000</m>. Trial: 160 demonstration days at $225 a day (staff, kit and product), each serving about 250 tastings, <m>160 \\times 225 = 36{,}000</m> for <m>160 \\times 250 = 40{,}000</m> tastings, plus displays in 20 stores at $200 each, <m>4{,}000</m>: $40,000 in all. Features: four promotion windows at $5,000 each, <m>20{,}000</m>. Coverage: a launch event at $6,000 and a freelance PR adviser for four months at $1,000 a month, <m>10{,}000</m>.',
        'Add the tasks: <m>50{,}000 + 40{,}000 + 20{,}000 + 10{,}000 = 120{,}000</m>, which is the split in Lantern’s first plan.',
        'Cross-check with percentage of sales: forecast revenue is <m>250{,}000 \\times 2.40 = 600{,}000</m>, and 15% of that is <m>90{,}000</m>, so the task budget is $30,000 higher.',
        'If the budget must be $90,000, cut tasks and name what is lost. For example: 4,375,000 impressions instead of 6,250,000 (−$15,000, a lower awareness target); 120 demonstration days instead of 160 (−$9,000, 30,000 tastings instead of 40,000); three promotion windows instead of four (−$5,000); three months of PR support instead of four (−$1,000). The cuts total $30,000.',
      ],
      answer: 'The objective-and-task budget is $120,000 (digital $50,000, sampling and displays $40,000, trade $20,000, PR $10,000), $30,000 more than 15% of forecast sales.',
      interpretation: 'The objective-and-task budget doesn’t prove $120,000 is right; it shows what $120,000 is supposed to buy. That makes the decision a choice between objectives (a lower awareness target or fewer tastings) instead of an argument about percentages, and it gives Lantern targets it can measure the spending against, which is the subject of the next lesson.' },
    { level: 'applied', title: 'Outlining Lantern’s integrated launch campaign', fictional: true,
      setup: 'Lantern launches the single-origin can at $3.49 in supermarkets, natural grocers and its own cafés and online shop, with the $120,000 budget above. Outline a campaign that is consistent with the product, the price and the channels, and show where push and pull each come in.',
      steps: [
        'One positioning, one message: a single-origin cold brew, steeped 20 hours, that tastes like a café coffee, priced between Arcadia ($2.89) and Summit Brew ($3.79). Every piece of the campaign carries the same claim and the same look as the can.',
        'Push before launch: the sales manager presents the can to supermarket and natural-grocer buyers with the support package, the four promotion windows, the displays and the sampling days, because a buyer lists a new brand only if it comes with reasons to expect it to sell.',
        'Pull at launch: geo-targeted social and search ads around the stocking stores, telling people where to find the can; a launch event for local food media; an email to café and online-shop customers, the 12% who already know Lantern.',
        'Trial at the shelf: sampling days in the stocking stores in the same weeks the ads run, so that awareness meets the product where it can be bought. Lantern’s cans are shelf-stable, so sampling teams can carry stock without refrigerated vans.',
        'Protect the price: trade promotions only in the four agreed windows and no deeper than about 20% off, so that a $3.49 can doesn’t become a $2.79 can in shoppers’ minds; no promotions in the online shop that undercut the stores.',
        'Plan the feedback: awareness surveys at the start and end of the year, tastings and sales per store per week, and a comparison of stores with and without sampling, so each task can be judged against its objective.',
      ],
      answer: 'A push phase to win and support the listings, a pull phase to build awareness where the can is sold, sampling to turn awareness into trial, limited price promotion to protect the positioning, and measurement built in from the start, all carrying one message.',
      interpretation: 'Integration here isn’t about identical ads. It is about the pieces fitting: ads point to where the can is stocked, sampling happens where the ads run, the trade deals don’t contradict the premium story and every tool has a measurable job. A plan that spent the same $120,000 on ads in neighbourhoods without stockists, or on deep monthly discounts, would cost the same and achieve far less.' },
  ],

  demo: [
    { widget: 'pm-mixsim', intro: 'Product, price and channels are fixed at Lantern’s first plan; only the promotion budget is open. Move money between ads, sampling, trade promotions and PR. Watch awareness, units and contribution, and notice that the cheapest way to add units is not always the cheapest way to add contribution. Then set trade promotions to $0 and compare the result with the note at the end of In depth.' },
    { widget: 'pm-budget', intro: 'Compare the four budgeting methods for Lantern’s launch. Change the sales forecast, the percentage, the rival’s spending and what the owners can afford, then build the objective-and-task budget line by line.' },
  ],

  mistakes: [
    { title: '“Promotion means advertising.”', html: 'Advertising is one of five tools. For a new packaged product, personal selling and trade promotion often matter most at first, because without them the product never reaches the shelf the advertising points to. Ask which audience must act first, and choose the tool that moves that audience.' },
    { title: '“If people see the ad enough times, they will buy.”', html: 'Hierarchy models describe a tidy ladder, but evidence reviewed by Vakratsas and Ambler (1999) gives little support to a fixed sequence of effects. For low-involvement products, trial often comes before liking, so getting the product into people’s hands (sampling, availability) can matter more than repeating the message.' },
    { title: '“Sales promotions build the brand.”', html: 'A temporary price cut or coupon prompts action now, but it is a short-term incentive. Run too often, it teaches shoppers to wait for the deal and to see the discounted price as the real one, which undercuts a premium positioning. Use price promotions sparingly and for a clear purpose, such as trial at launch.' },
    { title: '“Setting promotion at a percentage of sales is prudent.”', html: 'It feels cautious, but it gets the cause and effect backwards: promotion is supposed to drive sales, not follow them. A new product has no past sales to take a percentage of, and the method cuts spending exactly when sales fall. Use it as a cross-check on an objective-and-task budget, not as the method.' },
    { title: '“Integrated means the same ad everywhere.”', html: 'Integration means one positioning and a consistent message, adapted to what each tool and medium does best. A shelf tag, a six-second video and a sales presentation can’t say the same words, but they should all say the same thing about the brand.' },
    { title: '“Push and pull are alternative strategies; pick one.”', html: 'Most launches need both. Push gets the product stocked and supported; pull gets shoppers asking for it. The balance shifts by industry and over time, but a new brand that relies on only one tends to fail at the other end of the channel.' },
  ],

  application: [
    { p: 'A brand manager turns these ideas into three working documents. The first is a creative brief for the agency: who the audience is, the one thing the campaign must make them think, the evidence that supports it, and what every piece must include. Lantern’s brief would name category buyers who drink café coffee but haven’t tried ready-to-drink cold brew, the single proposition “café-quality single-origin, in a can”, and the 20-hour steep as the proof. The second is a media and activity plan that puts each task in a calendar, so that ads, sampling and stock arrive in the same weeks. The third is the trade plan agreed with each retailer: promotion windows, displays and how Lantern will support the product in store.' },
    { p: 'The budget meeting is where the objective-and-task method earns its keep. When Lantern’s finance adviser asks for a $30,000 cut, the brand manager can show which objective each cut gives up and propose the least damaging one, for example fewer impressions in the off-peak first quarter, rather than trimming every line equally. When the year’s results come in, the same task list says what to measure.' },
    { p: 'The right mix depends heavily on the business. A company selling battery-storage systems to factories and offices relies mainly on personal selling, supported by technical content and trade shows, because each sale is large, complex and made by a group of people. A university recruiting students mixes open days (events), search and social ads, and the credibility of rankings and press coverage, because applicants compare carefully over months. An airline uses fare sales and emails to fill seats that would otherwise fly empty, and advertising to keep its brand in mind for the next trip. An online clothing retailer leans on targeted digital ads and email, where each response can be tracked, and must watch that its frequent discount codes don’t become the price customers expect. In every case the same questions decide the mix: whom do we need to move, from which stage, through which part of the channel, and at what cost per contact.' },
  ],

  summary: [
    'Marketing communication passes through sender, encoding, message and medium, decoding and receiver, with feedback and noise; messages fail when they are decoded differently from what was meant or drowned out by noise.',
    'The promotion mix has five tools: advertising, sales promotion (consumer and trade), personal selling, public relations, and direct and digital marketing. Reach per dollar and persuasion per contact trade off against each other.',
    'Push promotion works on the channel (personal selling to buyers, trade promotions, displays); pull promotion works on final customers (advertising, consumer promotions, PR, digital). New brands need both.',
    'AIDA and other hierarchy-of-effects models help set stage-by-stage objectives, but evidence doesn’t support a fixed sequence; for low-involvement products trial often comes before liking.',
    'Integrated marketing communications plans the tools together around one positioning and consistent messages; it is hard because teams, partners and short-term incentives pull in different directions.',
    'Budgets can be set by the affordable, percentage-of-sales, competitive-parity or objective-and-task methods; objective-and-task links money to results and makes trade-offs visible.',
    'Lantern’s $120,000 first-year plan can be built task by task: $50,000 digital, $40,000 sampling and displays, $20,000 trade, $10,000 PR, which is $30,000 more than 15% of a hypothetical $600,000 forecast.',
  ],

  glossary: [
    { term: 'Promotion mix', def: 'The combination of communication tools (advertising, sales promotion, personal selling, public relations, and direct and digital marketing) a business uses to communicate with its audiences.' },
    { term: 'Advertising', def: 'Paid, non-personal communication from an identified sponsor through mass or digital media.' },
    { term: 'Sales promotion', def: 'Short-term incentives to encourage buying or selling now, aimed at consumers (coupons, samples, price cuts) or at the trade (allowances, display payments).' },
    { term: 'Trade promotion', def: 'A sales promotion aimed at intermediaries, such as funding for a retailer’s temporary price cut or a payment for a display.' },
    { term: 'Personal selling', def: 'Person-to-person communication by a salesperson aimed at making sales and building customer relationships.' },
    { term: 'Public relations', def: 'Building good relationships with a company’s publics and earning favourable coverage, for example through press releases, events and sponsorships.' },
    { term: 'Direct and digital marketing', def: 'Communication with targeted individuals that invites a direct response, through email, direct mail, websites, apps and targeted online ads.' },
    { term: 'Push strategy', def: 'Directing promotion at channel members, through personal selling and trade promotions, so that they stock, support and sell the product.' },
    { term: 'Pull strategy', def: 'Directing promotion at final customers to create demand that draws the product through the channel.' },
    { term: 'AIDA', def: 'A response-hierarchy model in which a buyer moves through attention, interest, desire and action. Usually credited to E. St. Elmo Lewis around 1898, though the attribution is disputed.' },
    { term: 'Hierarchy-of-effects model', def: 'Any model that describes buying as a sequence of mental stages, such as awareness, knowledge, liking, preference, conviction and purchase.' },
    { term: 'Integrated marketing communications', def: 'Planning and coordinating all promotion tools so that they deliver one clear, consistent message about the brand. Abbreviated IMC.' },
    { term: 'Affordable method', def: 'Setting the promotion budget at whatever the business has left after its other costs and profit target.' },
    { term: 'Percentage-of-sales method', def: 'Setting the promotion budget as a fixed percentage of past or forecast sales.' },
    { term: 'Competitive-parity method', def: 'Setting the promotion budget to match competitors’ spending, in dollars or relative to sales.' },
    { term: 'Objective-and-task method', def: 'Setting the promotion budget by defining specific objectives, listing the tasks needed to achieve them and adding up the cost of those tasks.' },
  ],

  references: [
    { text: 'Gomez Albrecht, M., Green, M. &amp; Hoffman, L. (2023). <i>Principles of Marketing</i>, sections 13.1, “The Promotion Mix and Its Elements”, and 13.2, “The Communication Process”. OpenStax.', url: 'https://openstax.org/books/principles-marketing/pages/13-1-the-promotion-mix-and-its-elements', checked: '2026-10-22' },
    { text: 'Gomez Albrecht, M., Green, M. &amp; Hoffman, L. (2023). <i>Principles of Marketing</i>, sections 13.3, “Integrated Marketing Communications”, and 13.4, “Steps in the IMC Planning Process” (budgeting methods). OpenStax.', url: 'https://openstax.org/books/principles-marketing/pages/13-4-steps-in-the-imc-planning-process', checked: '2026-10-22' },
    { text: 'Gomez Albrecht, M., Green, M. &amp; Hoffman, L. (2023). <i>Principles of Marketing</i>, section 15.6, “Main Types of Sales Promotion” (consumer-oriented pull and trade-oriented push promotions). OpenStax.', url: 'https://openstax.org/books/principles-marketing/pages/15-6-main-types-of-sales-promotion', checked: '2026-10-22' },
    { text: 'Lavidge, R. J. &amp; Steiner, G. A. (1961). A model for predictive measurements of advertising effectiveness. <i>Journal of Marketing</i>, 25(6), 59–62.', url: 'https://journals.sagepub.com/doi/10.1177/002224296102500611', checked: '2026-10-22' },
    { text: 'Vakratsas, D. &amp; Ambler, T. (1999). How advertising works: what do we really know? <i>Journal of Marketing</i>, 63(1), 26–43.', url: 'https://journals.sagepub.com/doi/10.1177/002224299906300103', checked: '2026-10-22' },
    { text: 'Iwamoto, A. (2024). The origin of AIDA: who invented and formulated the AIDA model? (in Japanese, with an English abstract). <i>Japan Marketing History Review</i>, 3(2), 150–166.', url: 'https://www.jstage.jst.go.jp/article/jmhr/3/2/3_150/_article/-char/en', checked: '2026-10-22' },
  ],

  checks: [
    { what: 'Share who don’t know Lantern', value: 100 - 12, shown: 88 },
    { what: 'First plan promotion total', value: 50000 + 40000 + 20000 + 10000, shown: 120000 },
    // simple example
    { what: 'Hotel percentage-of-sales budget', value: 0.04 * 3600000, shown: 144000 },
    { what: 'Hotel competitive-parity budget', value: (120000 + 180000 + 150000) / 3, shown: 150000 },
    // challenging example
    { what: 'Digital task cost', value: 6250000 / 1000 * 8, shown: 50000 },
    { what: 'Demonstration days cost', value: 160 * 225, shown: 36000 },
    { what: 'Tastings from 160 days', value: 160 * 250, shown: 40000 },
    { what: 'Display cost', value: 20 * 200, shown: 4000 },
    { what: 'Sampling and displays total', value: 160 * 225 + 20 * 200, shown: 40000 },
    { what: 'Trade promotion windows', value: 4 * 5000, shown: 20000 },
    { what: 'PR tasks', value: 6000 + 4 * 1000, shown: 10000 },
    { what: 'Objective-and-task total', value: 6250000 / 1000 * 8 + (160 * 225 + 20 * 200) + 4 * 5000 + (6000 + 4 * 1000), shown: 120000 },
    { what: 'Forecast revenue', value: 250000 * 2.40, shown: 600000 },
    { what: 'Percentage-of-sales budget at 15%', value: 0.15 * 250000 * 2.40, shown: 90000 },
    { what: 'Gap between methods', value: 120000 - 0.15 * 250000 * 2.40, shown: 30000 },
    { what: 'Cut digital cost', value: 4375000 / 1000 * 8, shown: 35000 },
    { what: 'Digital cut', value: 50000 - 4375000 / 1000 * 8, shown: 15000 },
    { what: 'Sampling cut (40 days)', value: (160 - 120) * 225, shown: 9000 },
    { what: 'Tastings after cut', value: 120 * 250, shown: 30000 },
    { what: 'Trade cut', value: 5000, shown: 5000 },
    { what: 'Cuts total', value: 15000 + 9000 + 5000 + 1000, shown: 30000 },
    { what: 'Budget after cuts', value: 35000 + (120 * 225 + 4000) + 3 * 5000 + (6000 + 3 * 1000), shown: 90000 },
    // simulator note on trade promotion
    { what: 'Simulator: default profit after overhead', value: Math.round(SIM.base.profit), shown: 122956, tol: 0.5 },
    { what: 'Simulator: profit with no trade promotion', value: Math.round(SIM.none.profit), shown: 133234, tol: 0.5 },
    { what: 'Simulator: cans added by trade promotion', value: Math.round(SIM.base.units - SIM.none.units), shown: 6233, tol: 0.5 },
    { what: 'Simulator: promoted cans', value: Math.round(SIM.promoted), shown: 28653, tol: 0.5 },
    { what: 'Simulator: extra gross profit from trade promotion', value: Math.round(SIM.base.grossProfit - SIM.none.grossProfit), shown: 9721, tol: 0.5 },
    { what: 'Simulator: profit given up by trade promotion (thousands)', value: (SIM.none.profit - SIM.base.profit) / 1000, shown: 10, tol: 0.5 },
    { what: 'Simulator: trade depth (%)', value: C.trade.depth * 100, shown: 20 },
    { what: 'Simulator: most promoted cans would have sold anyway', value: (SIM.promoted - (SIM.base.units - SIM.none.units)) / SIM.promoted > 0.5 ? 1 : 0, shown: 1 },
    // market facts used
    { what: 'Daily Grind awareness %', value: 0.75 * 100, shown: 75 },
    { what: 'Summit awareness %', value: 0.60 * 100, shown: 60 },
  ],
};
