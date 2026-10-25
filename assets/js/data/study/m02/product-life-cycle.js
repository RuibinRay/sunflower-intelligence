// product-life-cycle.js — M02 · The product life cycle. Content only; exercises are in product-life-cycle.ex.js.
// Lantern's market figures come from ./market.js (fictional). The category history and the quarterly sales series are
// hypothetical, invented for this lesson and labelled as such: market.js gives one year's category volume, not a history.
import { CATEGORY, COMPETITORS } from './market.js?v=15';

const hist = [2.1, 2.9, 3.8, 4.4, 4.7, 4.8]; // hypothetical category cans, millions, years 1–6
const g = (i) => (hist[i] / hist[i - 1] - 1) * 100;
const season = CATEGORY.seasonality; // Q1–Q4
const q = (avg, k) => avg * season[k];

export default {
  slug: 'product-life-cycle',
  title: 'The product life cycle',
  blurb: 'Products, like markets, tend to be born, grow, mature and fade, and each stage asks for a different mix. Learn the stages, the decisions that typically fit each one, how to read a product’s stage from data, and why the life cycle is a planning hypothesis rather than a law.',
  status: 'draft',
  objectives: [
    'Describe the four stages of the product life cycle and the typical sales, profit, customers and competition in each.',
    'Choose objectives and 4P decisions that fit a product’s stage, and explain when the typical prescription would not fit.',
    'Distinguish the life cycles of a product category, a product form and a brand, and of styles, fashions and fads.',
    'Calculate year-on-year growth and seasonally adjusted sales, and use them to judge which stage a product is in.',
    'Evaluate ways to extend a mature product’s life, and assess the criticisms of the life-cycle concept.',
  ],
  prerequisites: [
    { lesson: 'm02/product-decisions', why: 'You need product lines, brands, line extensions and the product levels.' },
    { text: 'Percentage change: (new − old) ÷ old.' },
  ],
  case: 'lantern',

  concept: [
    { case: 'Lantern Cold Brew will be a new brand in a category that already exists: about 4.8 million cans a year in Harbour City, three established brands, two of them known to more than half of category buyers. Is the category still growing fast, or has it matured? The answer changes what Lantern should expect and how it should launch. The course’s market file doesn’t say: it gives one year’s volume and its seasonal pattern, not a history. So the category’s stage is an assumption Lantern must check, and this lesson shows how.' },
    { h: 'The idea' },
    { p: 'The <g>product life cycle</g> (PLC) describes the typical pattern of a product’s sales and profits over time, from launch to withdrawal. OpenStax puts it simply: the cycle maps the stages a product goes through, tracking its sales and profitability. The classic picture has four stages after a development period in which there are costs but no sales.' },
    { figure: {
      svg: '<svg viewBox="0 0 560 320" xmlns="http://www.w3.org/2000/svg" font-size="13"><g stroke="var(--rule-strong)" stroke-width="1" stroke-dasharray="4 4"><line x1="160" y1="30" x2="160" y2="270"/><line x1="280" y1="30" x2="280" y2="270"/><line x1="430" y1="30" x2="430" y2="270"/><line x1="60" y1="210" x2="540" y2="210"/></g><g stroke="currentColor" stroke-width="1.5"><line x1="60" y1="30" x2="60" y2="280"/><line x1="60" y1="280" x2="545" y2="280"/></g><path d="M60,208 C110,206 140,195 160,180 C200,150 240,100 280,80 C320,62 360,58 400,62 C450,70 500,110 540,150" fill="none" stroke="var(--series-1)" stroke-width="3"/><path d="M60,235 C100,250 130,240 160,212 C200,170 240,130 290,118 C340,110 380,130 430,160 C470,185 510,200 540,208" fill="none" stroke="var(--series-2)" stroke-width="3" stroke-dasharray="9 5"/><g fill="currentColor" text-anchor="middle"><text x="110" y="24">Introduction</text><text x="220" y="24">Growth</text><text x="355" y="24">Maturity</text><text x="485" y="24">Decline</text><text x="300" y="300">Time</text></g><g fill="currentColor"><text x="404" y="52">Sales</text><text x="300" y="108">Profit</text><text x="14" y="214" fill="var(--ink-3)">$0</text></g></svg>',
      caption: 'The textbook shape of the product life cycle: sales (solid line) and profit (dashed line) over the four stages. Real products often depart from it.',
      alt: 'A line chart with time on the horizontal axis, divided by dashed vertical lines into four stages labelled Introduction, Growth, Maturity and Decline. A solid sales line starts near zero, rises slowly in introduction, steeply in growth, levels off at its peak in maturity and falls in decline. A dashed profit line starts below the zero line in introduction, crosses zero near the end of introduction, peaks late in growth, falls through maturity and approaches zero in decline.',
    } },
    { define: [
      ['<g>Introduction stage</g>', 'The product is new. Few people know it, sales grow slowly, costs per unit are high and profits are usually negative. Buyers are those most willing to try new things, and there are few direct competitors.'],
      ['<g>Growth stage</g>', 'Sales rise quickly as the product catches on. Competitors enter, attracted by the growth. Costs per unit fall with volume, and profits rise, often peaking late in this stage.'],
      ['<g>Maturity stage</g>', 'Sales growth slows and then flattens, because most potential buyers already buy. Competition is intense and growth for one brand mostly comes from another, so prices and margins come under pressure. Usually the longest stage.'],
      ['<g>Decline stage</g>', 'Sales fall, because tastes change, a new technology replaces the product, or competition takes the market. Profits shrink, and firms decide whether to keep, harvest or drop the product.'],
    ] },
    { p: 'Why does the shape tend to look like this? Early on, few people know the product and those who try it are a small, adventurous minority; as more people adopt it and tell others, and as distribution widens, sales accelerate. Eventually most people who want the product are already buying it, so sales flatten: further growth comes only from population growth, more frequent use or taking customers from rivals. Profits follow a different path from sales, because the heavy costs of launching come first and price competition arrives later.' },
    { p: 'The point of the life cycle is not the drawing. It is the question it makes a manager ask: <i>given where this product probably is, what should we be trying to achieve, and which mix decisions fit that objective?</i>' },
  ],

  theory: [
    { h: 'Objectives and typical decisions by stage' },
    { p: 'Each stage has a typical objective, and the four Ps tend to follow from it. The table summarises the usual textbook prescriptions; treat them as starting hypotheses, not rules.' },
    { table: {
      caption: 'Typical objectives and mix decisions at each stage',
      head: ['Stage', 'Objective', 'Product', 'Price', 'Place', 'Promotion'],
      rows: [
        ['Introduction', 'Build awareness and trial', 'One basic version; fix early problems', 'High to recover costs (skimming) or low to win volume fast (penetration)', 'Selective; win the first listings', 'Awareness, sampling, convincing retailers to stock it'],
        ['Growth', 'Grow share while the market grows', 'Improve quality, add features and versions', 'Hold or trim as costs fall and rivals arrive', 'Widen distribution', 'Shift from awareness to preference for the brand'],
        ['Maturity', 'Defend share and profit', 'Differentiate; modify or extend the line', 'Match or beat rivals; promotions', 'Intensify; protect shelf space', 'Remind, give reasons to switch, support the trade'],
        ['Decline', 'Cut costs, harvest or exit', 'Drop weak items', 'Hold for loyal buyers or cut to clear', 'Keep only profitable outlets', 'Reduce to the minimum that keeps loyal buyers'],
      ],
    } },
    { p: 'Two choices in the table deserve a word. In the introduction stage a firm chooses between a high launch price, recovering development costs from the buyers who value the product most, and a low one, aiming to build volume and discourage competitors; lesson 5 covers these strategies, called skimming and penetration. In decline, OpenStax distinguishes <i>harvesting</i> (cutting support to the minimum and collecting the remaining profit) from <i>divesting</i> (selling the product or brand, or withdrawing it).' },
    { p: 'The boundary between growth and maturity deserves particular attention, because it is where many businesses get hurt. While a market grows, a brand can increase its sales without taking anything from rivals, so even weak entrants survive. When growth slows, the same production capacity and the same ambitions meet a market that has stopped expanding. Competitors cut prices and spend more on promotion to keep their volume, margins fall and the weakest brands leave or are bought. This period is often called a shake-out. A firm that planned its capacity, its hiring or its listings on the growth rates of the past is caught out; one that watched the growth rate falling could prepare.' },
    { h: 'Category, form and brand' },
    { p: 'A life cycle can be drawn for different things, and confusing them is the most common error in using the idea. The <b>product category</b> is the broad class: ready-to-drink coffee. A <b>product form</b> is a type within it: canned cold brew, bottled iced latte, nitro coffee in a can. A <b>brand</b> is one company’s offer: Lantern Cold Brew. Categories tend to have long, flat maturity stages that last decades; forms rise and fall within them as tastes and technology change; brands are the most variable, because their sales depend heavily on what their owners and competitors do.' },
    { p: 'This is exactly Lantern’s situation. The brand will be in its introduction stage on launch day whatever the category is doing. Its objectives (awareness, trial, first listings) follow from the brand’s stage. But the category’s stage decides where its sales can come from. In a growing category, a new brand can win many buyers who are new to the category. In a mature one, nearly every can Lantern sells is a can Summit, Arcadia or Daily Grind didn’t sell, and they can be expected to defend their shelf space.' },
    { h: 'Styles, fashions and fads' },
    { p: 'Three special patterns are worth recognising, because they call for very different decisions.' },
    { list: [
      'A <g>style</g> is a basic, distinctive mode of expression: in clothing, formal and casual; in furniture, mid-century or industrial; in coffee, iced or hot. A style can last for generations, going in and out of favour.',
      'A <g>fashion</g> is a style that is currently accepted or popular in a field. Fashions typically grow slowly as early followers adopt them, stay popular for a while and then decline slowly as attention moves on.',
      'A <g>fad</g> is a burst of intense enthusiasm for a product that rises fast and collapses fast, often because it meets no lasting need or the novelty wears off. Fads can be profitable for firms that enter early and leave early, and costly for those that invest late on the assumption that the growth will last.',
    ] },
    { p: 'Before investing in a fast-growing product, the key question is whether the growth reflects a lasting need (a new style or fashion that could mature) or novelty (a fad). The evidence to look for is repeat purchase: fads are bought once by many people; products with a future are bought again.' },
    { h: 'Extending the life cycle' },
    { p: 'A mature product is not condemned to decline. Firms commonly try three kinds of move, and OpenStax gives the first two:' },
    { list: [
      '<b>Modify the market:</b> find new users (a drink positioned for students as well as commuters), new uses or occasions (cold brew as an afternoon drink, not just a morning one) or new regions.',
      '<b>Modify the product:</b> change its quality, features or style (a new recipe, a lower-sugar version, a new can design), which often means a line extension.',
      '<b>Modify the marketing mix:</b> change price, channels or promotion: a new pack size at a new price point, a new channel such as vending or online subscriptions, a new campaign.',
    ] },
    { p: 'Every extension costs money, so the test is the same as for any product decision: will the extra sales and margin pay for it, and does it fit the positioning? A brand that extends its life by cutting price and quality may survive while destroying the reason customers chose it.' },
    { h: 'Criticisms: a hypothesis, not a law' },
    { p: 'The life cycle is one of the most quoted ideas in marketing and one of the most criticised. Theodore Levitt’s 1965 article “Exploit the Product Life Cycle” argued that most senior marketing executives knew the concept but almost none used it strategically, and set out to make it a practical planning tool. Eleven years later Nariman Dhalla and Sonia Yuspeh published “Forget the Product Life Cycle Concept!”, a sharp attack on the whole idea. Their main points, and some that followed from them, are these.' },
    { list: [
      '<b>The shape is not a law.</b> Many products do not move through the stages in the textbook order. Some go straight from introduction to decline; some decline and then revive; some stay in maturity for decades. Dhalla and Yuspeh argued that the variations are too unpredictable for one general model.',
      '<b>Stage lengths can’t be predicted.</b> A stage can last weeks or decades, and you usually know a stage has ended only in hindsight, which makes the model weakest exactly when you need it to decide.',
      '<b>The cycle is partly a result of management decisions.</b> Sales depend on the mix, so the curve is shaped by what the firm does. If managers decide a brand is “in decline” and cut its support, sales fall and the diagnosis appears to come true. Treating the life cycle as destiny can be self-fulfilling, and Dhalla and Yuspeh argued this had led firms to abandon brands that could have been revived.',
      '<b>It works least well for brands.</b> The article’s published summary says the model has little validity for brand life cycles, the level at which most marketing decisions are made.',
    ] },
    { callout: 'key', title: 'How to use it well', html: 'Use the life cycle to ask questions, not to answer them. State the stage you think a product is in as a hypothesis, list the evidence for it (growth rates, repeat purchase, the number of competitors, price trends), choose decisions that fit, and keep checking. Never cut support for a product only because a chart says it should be declining.' },
    { h: 'Reading the stage from data' },
    { p: 'No single number identifies a stage, so analysts combine several kinds of evidence and look for them to agree.' },
    { list: [
      '<b>Growth rates over several years.</b> Rising growth suggests introduction moving into growth; high but falling growth suggests late growth; growth near zero suggests maturity; sustained falls suggest decline.',
      '<b>Who is buying.</b> If most sales come from first-time buyers, the market is still being built; if most come from repeat buyers and from customers switching between brands, it is mature.',
      '<b>Competitors.</b> A rising number of brands suggests growth; brands leaving or merging suggests a shake-out or maturity.',
      '<b>Prices and promotions.</b> Prices that hold while volume grows suggest growth; more frequent price promotions and falling average prices are common signs of maturity.',
    ] },
    { p: 'The first tool is growth over a year. Two traps hide in ordinary sales data. The first is <i>seasonality</i>: Harbour City sells 25% more cans than an average quarter in the third quarter (summer) and 15% fewer in the first and fourth. A fall from the third quarter to the fourth is the season, not decline. Compare each quarter with the same quarter a year earlier, or divide each quarter’s sales by its seasonal index (1.25 for the third quarter, 0.85 for the fourth) to get seasonally adjusted sales. The second trap is one-off events: a lost listing, a competitor’s heavy promotion or a stock-out can move one brand’s sales sharply without any change in the stage of the category.' },
  ],

  formulas: [
    { id: 'yoy-growth', name: 'Year-on-year growth',
      tex: String.raw`g = \dfrac{S_t - S_{t-1}}{S_{t-1}} \times 100`,
      where: [
        [String.raw`g`, 'Growth rate over a year', '%'],
        [String.raw`S_t`, 'Sales in the current year, or in a quarter', 'units or $'],
        [String.raw`S_{t-1}`, 'Sales in the year before, or in the same quarter a year earlier', 'units or $'],
      ],
      assumptions: 'Compare like with like: whole years, or the same quarter in consecutive years, so that seasonal swings cancel out.',
      note: 'A run of falling growth rates (38%, 31%, 16%, 7%, 2%) is the typical signature of a market moving from growth into maturity.' },
    { id: 'seasonal-adjustment', name: 'Seasonally adjusted sales',
      tex: String.raw`S^{\text{adj}}_q = \dfrac{S_q}{s_q}`,
      where: [
        [String.raw`S^{\text{adj}}_q`, 'Sales in quarter q, adjusted to an average quarter', 'units'],
        [String.raw`S_q`, 'Actual sales in quarter q', 'units'],
        [String.raw`s_q`, 'Seasonal index for quarter q: its sales relative to an average quarter (Harbour City: 0.85, 1.05, 1.25, 0.85)', ''],
      ],
      assumptions: 'The seasonal pattern is stable from year to year, and the four indexes sum to 4.',
      note: 'Adjusted quarters can be compared with each other directly; a rise in adjusted sales is real growth, not summer.' },
  ],

  examples: [
    { level: 'simple', title: 'Which stage is the category in?', fictional: true,
      setup: 'Suppose Lantern commissions research and finds that Harbour City’s ready-to-drink coffee category sold 2.1, 2.9, 3.8, 4.4, 4.7 and 4.8 million cans in the last six years (a hypothetical history that ends at the market file’s 4.8 million). Calculate the year-on-year growth rates and judge the category’s stage.',
      steps: [
        'Apply g = (this year − last year) ÷ last year × 100 to each pair of years.',
        'Year 2: (2.9 − 2.1) ÷ 2.1 = 38.1%. Year 3: (3.8 − 2.9) ÷ 2.9 = 31.0%. Year 4: (4.4 − 3.8) ÷ 3.8 = 15.8%.',
        'Year 5: (4.7 − 4.4) ÷ 4.4 = 6.8%. Year 6: (4.8 − 4.7) ÷ 4.7 = 2.1%.',
        'Read the pattern, not one number: volume is still rising, but the growth rate has fallen every year, from 38% to 2%.',
      ],
      answer: 'Growth rates of 38.1%, 31.0%, 15.8%, 6.8% and 2.1%: the category has moved from growth into early maturity.',
      interpretation: 'If the research is right, Lantern is launching a new brand into a maturing category. Its sales will have to come mainly from the three established brands, so it needs a clear reason for shoppers to switch, and it should expect them to defend their shelf space. The judgement rests on the hypothetical data: with a different history the conclusion would change, which is why the stage must be checked rather than assumed.' },
    { level: 'challenging', title: 'Decline, or just winter?', fictional: true,
      setup: 'A brand’s quarterly sales (hypothetical) were 85,000, 105,000, 125,000 and 85,000 cans in year 1, and 110,500, 136,500, 162,500 and 110,500 in year 2. A manager sees fourth-quarter sales in year 2 fall from 162,500 to 110,500 and asks whether the brand has entered decline. Use the Harbour City seasonal indexes (0.85, 1.05, 1.25, 0.85) to answer.',
      steps: [
        'Quarter-on-quarter change, the figure that worried the manager: (110,500 − 162,500) ÷ 162,500 = −32%.',
        'Compare with the same quarter a year earlier: (110,500 − 85,000) ÷ 85,000 = +30%. The fourth quarter is up 30% on the year before.',
        'Seasonally adjust both quarters: 162,500 ÷ 1.25 = 130,000 and 110,500 ÷ 0.85 = 130,000. After adjusting for the season, sales didn’t fall at all between the third and fourth quarters.',
        'Check the whole years: year 1 totals 400,000 cans and year 2 totals 520,000, an increase of 30%.',
      ],
      answer: 'No decline: the 32% fall is the seasonal pattern. Seasonally adjusted sales are flat within year 2, and sales are 30% higher than a year earlier.',
      interpretation: 'Seasonal swings are larger than many real changes in trend, so raw quarter-to-quarter comparisons mislead. Had the manager cut support because of the fourth-quarter “decline”, sales in year 3 might really have fallen, the self-fulfilling error Dhalla and Yuspeh warned against.' },
    { level: 'applied', title: 'Should Lantern still launch into a mature category?', fictional: true,
      setup: 'Ana’s board has seen the research in the simple example: growth has slowed to 2.1% a year. One director argues that a maturing category is the wrong place for a new brand. Lantern’s hypothetical first-year goal is 100,000 cans. Use life-cycle thinking to frame the decision.',
      steps: [
        'Size the goal: 100,000 ÷ 4,800,000 ≈ 2.1% of the category’s cans.',
        'Ask where those cans can come from. If the category grows next year at last year’s rate (4.8 ÷ 4.7, about 2.1%), it adds 4.8 million × (4.8 ÷ 4.7 − 1) ≈ 102,000 cans, roughly Lantern’s whole goal, and the established brands will compete for that growth too. So most of Lantern’s cans must be won from Summit, Arcadia and Daily Grind.',
        'Translate that into objectives for the brand’s introduction stage: awareness (from 12%), trial at the shelf and listings, with a reason to switch that rivals can’t easily copy, the single-origin liquid and the link to Lantern’s cafés.',
        'List what maturity means for the mix: expect rivals to respond with promotions; avoid a price war Lantern can’t win against brands known to 50% to 75% of buyers; compete on difference, not on price.',
      ],
      answer: 'A mature category doesn’t rule out a launch, but it changes the plan: Lantern must take about 2.1% of the category from established brands, so the launch should be built on a clear point of difference and sampling to win trial, not on a low price.',
      interpretation: 'Life-cycle thinking doesn’t answer the board’s question; it frames it. The decision now depends on evidence about switching: would enough Summit and Arcadia buyers try a single-origin can and buy it again? That is a question for market research and a test launch, and the simulator in this course lets you explore it on fictional numbers.' },
  ],

  demo: [
    { widget: 'plc-explorer', intro: 'Drag the boundaries between the stages to see how the textbook curve changes, then select each stage to see its typical objective and 4P decisions. Try making maturity very long and introduction very short. Notice that the decisions for a stage don’t depend on how long it lasts, but your forecasts do: that is why stage lengths matter and why they are so hard to predict.' },
    { widget: 'plc-seasons', intro: 'Quarterly sales of a hypothetical canned-coffee brand over three years, with Harbour City’s seasonal pattern. The first series is actual sales; the second divides each quarter by its seasonal index. Find a quarter where actual sales fall sharply and check what the adjusted series does in the same quarter.' },
  ],

  mistakes: [
    { title: '“Every product follows the S-shaped curve.”', html: 'The textbook shape is a typical pattern, not a law. Many products skip stages, revive after declining or stay mature for decades, and Dhalla and Yuspeh argued that the variations are too unpredictable for one model. Use the curve to generate questions about a product, then check them against its data.' },
    { title: '“Sales fell, so the product is in decline.”', html: 'Look for seasonality and one-off events first. Harbour City’s fourth quarter is always about a third below its third quarter; compare the same quarter year on year, or seasonally adjust, before you diagnose decline.' },
    { title: '“Our brand is in the same stage as the category.”', html: 'Categories, forms and brands have different cycles. Lantern Cold Brew is in introduction even if canned coffee is mature. Set the brand’s objectives by its own stage, and use the category’s stage to judge where its sales must come from.' },
    { title: '“A mature product should be milked and then dropped.”', html: 'Maturity is often the longest and most profitable stage, and mature products can be extended by modifying the market, the product or the mix. Cutting support because a brand is “mature” can cause the decline it predicts.' },
    { title: '“Fast growth means a long future.”', html: 'Fads grow fastest of all and then collapse. Before investing in capacity or long-term contracts, check whether buyers come back: repeat purchase separates a lasting need from novelty.' },
  ],

  application: [
    { p: 'In practice the life cycle shows up in three kinds of decision. The first is <b>planned succession</b>. A smartphone maker designs each model to sell for a limited period before the next one replaces it. The model’s life cycle is not something that happens to it; it is a plan, set by the company’s launch calendar. The product manager’s life-cycle decisions are about timing: when to cut the price of the outgoing model, how many units to build so that little stock is left when the successor arrives, and when to stop supporting it. The category (smartphones) can be mature while every individual model has a short, deliberately managed cycle.' },
    { p: 'The second is <b>renewal of a long-lived brand</b>. Suppose a breakfast-cereal brand (fictional) launched fifty years ago, with flat sales in a mature category. Its managers don’t ask “when will it die?” but “which extension pays?”. They might modify the market (positioning it as a snack, or selling it in a new country), the product (less sugar, a new texture) or the mix (a smaller pack for convenience stores, a subscription online). Each option is costed like any product decision and tested before it is rolled out. Plenty of brands are far older than the textbook curve would suggest, because their owners kept renewing them.' },
    { p: 'The third is <b>judging a fashion item</b>. A clothing brand buying stock for next season has to decide whether a fast-selling item is a fashion that will last a few seasons or a fad that will be gone by next year. Buyers look at evidence such as repeat purchase, how widely the style is being adopted and whether sales come from a narrow group of early followers, and they commit stock in stages rather than all at once, so that a collapse leaves them with little unsold inventory.' },
    { p: 'For Lantern the application is a research plan, not a chart. Before the launch, the marketing team writes down its assumption (“the category is in early maturity”) and the evidence that would confirm or overturn it: several years of category volume, compared year on year; the number of brands entering and leaving; whether shelf prices and promotional activity are rising or falling; and the share of shoppers who buy the category at all. If the evidence shows a category still growing quickly, Lantern can aim for new category buyers and expect rivals to be less aggressive. If it shows maturity, Lantern must win switchers. Either way the brand starts in introduction, and its first-year objectives are awareness and trial.' },
  ],

  summary: [
    'The product life cycle describes a typical pattern of sales and profit over four stages: introduction, growth, maturity and decline.',
    'Each stage has a typical objective (trial, share growth, defence, harvest or exit), and the four Ps follow from it. Treat the prescriptions as hypotheses.',
    'Categories, product forms and brands have different cycles. A new brand like Lantern’s starts in introduction even in a mature category, where its sales must come mostly from rivals.',
    'Styles last, fashions rise and fall slowly, fads rise and collapse quickly. Repeat purchase is the best test of a lasting need.',
    'Mature products can be extended by modifying the market, the product or the mix, if the extension pays and fits the positioning.',
    'Read stages from data with year-on-year growth and seasonally adjusted sales; a seasonal fall is not decline.',
    'The life cycle is a framework, not a law: shapes and stage lengths are unpredictable, and treating it as destiny can be self-fulfilling.',
  ],

  glossary: [
    { term: 'Product life cycle', def: 'The typical pattern of a product’s sales and profits over time, from introduction through growth and maturity to decline.' },
    { term: 'Introduction stage', def: 'The first stage of the life cycle after launch: low awareness, slow sales growth, high costs and usually losses.' },
    { term: 'Growth stage', def: 'The stage in which sales rise quickly, competitors enter and profits rise.' },
    { term: 'Maturity stage', def: 'The stage in which sales growth slows and flattens, competition is intense and one brand’s gains come mainly from others. Usually the longest stage.' },
    { term: 'Decline stage', def: 'The stage in which sales and profits fall, and the firm decides whether to keep, harvest or drop the product.' },
    { term: 'Style', def: 'A basic and distinctive mode of expression, such as casual or formal dress, that can last for generations, going in and out of favour.' },
    { term: 'Fashion', def: 'A style that is currently accepted or popular in a field; fashions typically rise slowly, stay popular for a while and decline slowly.' },
    { term: 'Fad', def: 'A burst of intense enthusiasm for a product that rises quickly and collapses quickly.' },
  ],

  references: [
    { text: 'Gomez Albrecht, M., Green, M. &amp; Hoffman, L. (2023). <i>Principles of Marketing</i>, section 9.3 “The Product Life Cycle”. OpenStax.', url: 'https://openstax.org/books/principles-marketing/pages/9-3-the-product-life-cycle', checked: '2026-10-22' },
    { text: 'Gomez Albrecht, M., Green, M. &amp; Hoffman, L. (2023). <i>Principles of Marketing</i>, section 9.4 “Marketing Strategies at Each Stage of the Product Life Cycle”. OpenStax.', url: 'https://openstax.org/books/principles-marketing/pages/9-4-marketing-strategies-at-each-stage-of-the-product-life-cycle', checked: '2026-10-22' },
    { text: 'Levitt, T. (1965). Exploit the product life cycle. <i>Harvard Business Review</i>, 43(6), 81–94.', url: 'https://hbr.org/1965/11/exploit-the-product-life-cycle', checked: '2026-10-22' },
    { text: 'Dhalla, N. K. &amp; Yuspeh, S. (1976). Forget the product life cycle concept! <i>Harvard Business Review</i>, 54(1), 102–112.', url: 'https://hbr.org/1976/01/forget-the-product-life-cycle-concept', checked: '2026-10-22' },
  ],

  checks: [
    { what: 'Category cans (millions)', value: CATEGORY.cansPerYear / 1e6, shown: 4.8 },
    { what: 'History ends at the market file’s volume', value: hist[5] * 1e6, shown: CATEGORY.cansPerYear },
    { what: 'Brands known to more than half of buyers', value: COMPETITORS.filter((c) => c.awareness > 0.5).length, shown: 2 },
    { what: 'Q3 seasonal index', value: season[2], shown: 1.25 },
    { what: 'Q1 and Q4 seasonal index', value: season[0] + season[3], shown: 0.85 + 0.85 },
    { what: 'Q2 seasonal index', value: season[1], shown: 1.05 },
    { what: 'Seasonal indexes sum to 4', value: season.reduce((a, b) => a + b, 0), shown: 4 },
    { what: 'Growth year 2 (%)', value: g(1), shown: 38.1, tol: 0.05 },
    { what: 'Growth year 3 (%)', value: g(2), shown: 31.0, tol: 0.05 },
    { what: 'Growth year 4 (%)', value: g(3), shown: 15.8, tol: 0.05 },
    { what: 'Growth year 5 (%)', value: g(4), shown: 6.8, tol: 0.05 },
    { what: 'Growth year 6 (%)', value: g(5), shown: 2.1, tol: 0.05 },
    { what: 'Year 1 quarters', value: q(100000, 0) + q(100000, 1) * 10 + q(100000, 2) * 100 + q(100000, 3) * 1000, shown: 85000 + 1050000 + 12500000 + 85000000, tol: 0.01 },
    { what: 'Year 2 quarters', value: q(130000, 0) + q(130000, 1) * 10 + q(130000, 2) * 100 + q(130000, 3) * 1000, shown: 110500 + 1365000 + 16250000 + 110500000, tol: 0.01 },
    { what: 'Q3→Q4 change, year 2 (%)', value: (q(130000, 3) / q(130000, 2) - 1) * 100, shown: -32, tol: 0.01 },
    { what: 'Q4 year on year (%)', value: (q(130000, 3) / q(100000, 3) - 1) * 100, shown: 30, tol: 0.01 },
    { what: 'Adjusted Q3 year 2', value: 162500 / season[2], shown: 130000, tol: 0.01 },
    { what: 'Adjusted Q4 year 2', value: 110500 / season[3], shown: 130000, tol: 0.01 },
    { what: 'Year 1 total', value: 85000 + 105000 + 125000 + 85000, shown: 400000 },
    { what: 'Year 2 total', value: 110500 + 136500 + 162500 + 110500, shown: 520000 },
    { what: 'Year-on-year growth in totals (%)', value: (520000 / 400000 - 1) * 100, shown: 30, tol: 0.01 },
    { what: 'Goal as share of category (%)', value: 100000 / CATEGORY.cansPerYear * 100, shown: 2.1, tol: 0.05 },
    { what: 'Category growth next year at last year’s rate (cans)', value: CATEGORY.cansPerYear * (4.8 / 4.7 - 1), shown: 102000, tol: 200 },
    { what: 'Seasonal Q3 above average (%)', value: (season[2] - 1) * 100, shown: 25, tol: 0.01 },
    { what: 'Seasonal Q1/Q4 below average (%)', value: (1 - season[3]) * 100, shown: 15, tol: 0.01 },
    { what: 'Competitor awareness low/high (%)', value: Math.min(...COMPETITORS.map((c) => c.awareness)) * 100 + Math.max(...COMPETITORS.map((c) => c.awareness)), shown: 50 + 0.75 },
  ],
};
