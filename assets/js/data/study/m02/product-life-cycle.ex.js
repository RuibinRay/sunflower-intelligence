// product-life-cycle.ex.js — M02 · The product life cycle: widgets, practice and the knowledge check.
// Answer keys live here, not in the page's HTML. The seasonal indexes are Harbour City's (m02/market.js: 0.85, 1.05,
// 1.25, 0.85); the sales series are hypothetical. Every number is recomputed by `check` (see ../AUTHORING.md).

const SEASON = [0.85, 1.05, 1.25, 0.85];
const series = (avgs) => avgs.flatMap((a) => SEASON.map((s) => Math.round(a * s)));

export const widgets = {
  'plc-explorer': {
    type: 'plc',
    stages: ['introduction', 'growth', 'maturity', 'decline'],
  },
  'plc-seasons': {
    type: 'chart', kind: 'line',
    title: 'Seasonal swings are not life-cycle stages (hypothetical brand)',
    x: { label: 'Quarter (1–4 = year 1, 5–8 = year 2, 9–12 = year 3)', values: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] },
    series: [
      { name: 'Actual sales (cans)', values: series([100000, 130000, 150000]) },
      { name: 'Seasonally adjusted sales (cans)', values: [100000, 100000, 100000, 100000, 130000, 130000, 130000, 130000, 150000, 150000, 150000, 150000] },
    ],
    y: { label: 'Cans per quarter' },
    note: 'Actual sales fall by 32% from every third quarter to the fourth, yet adjusted sales never fall: the brand grows 30% in year 2 and about 15% in year 3. Its growth is slowing, which is worth watching, but nothing here shows decline.',
  },
};

const STAGES = ['Introduction', 'Growth', 'Maturity', 'Decline'];

export const guided = [
  {
    id: 'm02-plc-g1', type: 'classify', kind: 'conceptual',
    prompt: 'Which life-cycle stage does each description most likely show?',
    items: [
      'Sales grow slowly; most shoppers have never heard of the product; the firm is losing money on it',
      'Sales are rising fast and three new competitors launched copies this year',
      'Sales have been flat for six years; brands compete mostly with price promotions',
      'Sales have fallen for four years as buyers move to a newer technology',
    ],
    categories: STAGES,
    answer: [0, 1, 2, 3],
    hints: ['Look at two signals in each description: the direction and speed of sales, and what competitors are doing.', 'Fast growth attracts copies; flat sales with price competition is the typical mature market.'],
    feedback: {
      1: 'Rapid sales growth plus new entrants copying the product is the classic growth stage.',
      2: 'Flat sales and competition on price mean most buyers already buy: maturity.',
    },
    solution: 'Low awareness and losses: introduction. Rapid growth and new entrants: growth. Flat sales and price competition: maturity. Falling sales as buyers switch to a new technology: decline.',
  },
  {
    id: 'm02-plc-g2', type: 'steps', kind: 'numerical',
    prompt: 'A hypothetical market for reusable coffee cups in a city sold 40,000, 58,000, 75,000 and 81,000 cups in four consecutive years.',
    solution: 'Growth: (58,000 − 40,000) ÷ 40,000 = 45.0%; (75,000 − 58,000) ÷ 58,000 = 29.3%; (81,000 − 75,000) ÷ 75,000 = 8.0%. Sales are still rising, but the growth rate is falling fast: the market looks to be leaving the growth stage and approaching maturity.',
    steps: [
      { id: 'm02-plc-g2-s1', type: 'num', prompt: 'What was the growth rate from year 1 to year 2?',
        answer: 45, check: () => (58000 - 40000) / 40000 * 100, tol: 0.1, unit: '%', places: 1,
        hints: ['Growth = (this year − last year) ÷ last year × 100.', '18,000 ÷ 40,000.'],
        wrong: [{ value: 31, say: 'You divided by the new year’s sales (18,000 ÷ 58,000). Divide by the earlier year.' }] },
      { id: 'm02-plc-g2-s2', type: 'num', prompt: 'What was the growth rate from year 3 to year 4?',
        answer: 8, check: () => (81000 - 75000) / 75000 * 100, tol: 0.1, unit: '%', places: 1,
        hints: ['Use years 3 and 4 only.', '6,000 ÷ 75,000.'],
        wrong: [{ value: 102.5, say: 'That is the growth over all three years, from 40,000 to 81,000. The question asks about the last year only.' }] },
      { id: 'm02-plc-g2-s3', type: 'mc', prompt: 'Growth went from 45% to about 29% to 8%. What does that suggest?',
        options: ['The market is moving from growth towards maturity.', 'The market is in decline, because growth is falling.', 'The market is in its introduction stage.'],
        answer: 0,
        hints: ['Are sales themselves falling, or only the growth rate?'],
        feedback: { 1: 'Sales are still rising. A falling growth rate is slowing growth, not decline; decline means sales themselves fall.', 2: 'Growth of 45% from a base of 40,000 cups is well past a slow introduction.' } },
    ],
  },
  {
    id: 'm02-plc-g3', type: 'mc', kind: 'applied',
    prompt: 'A brand of plant-based yoghurt (fictional) is in the growth stage: sales are up 40% a year and two rivals have just launched. Which set of decisions best fits its stage?',
    options: [
      'Add flavours and pack sizes, widen distribution, and shift advertising from “try it” to “choose us”.',
      'Cut advertising to the minimum and keep only the most profitable stores, to harvest profit while sales are high.',
      'Keep one basic version in a few shops and spend mainly on free samples, so that more people try the yoghurt.',
      'Cut the price below cost to drive the two new rivals out of the market before they build a following.',
    ],
    answer: 0,
    hints: ['In growth, the objective is to win share while the market itself is expanding.', 'Which option invests in product, place and promotion to capture the growth?'],
    feedback: {
      1: 'That is a decline-stage harvest. Cutting support in a growing market hands the growth to the new rivals.',
      2: 'That fits the introduction stage. In growth, the product needs more versions and wider availability to keep up with demand and competitors.',
      3: 'Pricing below cost is expensive, may be illegal in some markets and doesn’t build a lasting advantage; growth-stage prices typically hold or ease as costs fall.',
    },
    why: 'Growth calls for investment to capture share: more versions, wider distribution and promotion that builds preference for the brand.',
    solution: 'In the growth stage the market is expanding and competitors are arriving, so the brand invests: more versions (product), wider distribution (place) and a promotion message that moves from awareness to preference. Harvesting belongs to decline and a single basic version to introduction.',
  },
  {
    id: 'm02-plc-g4', type: 'steps', kind: 'numerical',
    prompt: 'A hypothetical cold-brew brand in Harbour City sold 150,000 cans in the third quarter and 102,000 in the fourth quarter of this year. In the fourth quarter of last year it sold 90,000. Harbour City’s seasonal indexes are 1.25 for the third quarter and 0.85 for the fourth.',
    solution: 'Quarter on quarter: (102,000 − 150,000) ÷ 150,000 = −32%. Year on year: (102,000 − 90,000) ÷ 90,000 = +13.3%. Seasonally adjusted: 150,000 ÷ 1.25 = 120,000 and 102,000 ÷ 0.85 = 120,000, so underlying sales were flat between the quarters and up on last year: no sign of decline.',
    steps: [
      { id: 'm02-plc-g4-s1', type: 'num', prompt: 'By what percentage did sales change from the third quarter to the fourth? (Use a minus sign for a fall.)',
        answer: -32, check: () => (102000 - 150000) / 150000 * 100, tol: 0.1, unit: '%', places: 1,
        hints: ['(fourth − third) ÷ third × 100.'],
        wrong: [{ value: 32, say: 'Sales fell, so the change is negative: −32%.' }] },
      { id: 'm02-plc-g4-s2', type: 'num', prompt: 'By what percentage did fourth-quarter sales change compared with the same quarter last year?',
        answer: 13.3, check: () => (102000 - 90000) / 90000 * 100, tol: 0.1, unit: '%', places: 1,
        hints: ['Compare 102,000 with 90,000.', '12,000 ÷ 90,000 × 100.'] },
      { id: 'm02-plc-g4-s3', type: 'num', prompt: 'What are the fourth quarter’s seasonally adjusted sales?',
        answer: 120000, check: () => 102000 / 0.85, tol: 1, unit: 'cans', places: 0,
        hints: ['Divide actual sales by the quarter’s seasonal index.', '102,000 ÷ 0.85.'],
        wrong: [{ value: 86700, say: 'You multiplied by the index. To remove the season, divide: 102,000 ÷ 0.85.' }] },
    ],
  },
];

export const independent = [
  {
    id: 'm02-plc-i1', type: 'order', kind: 'conceptual',
    prompt: 'Put these events in a product category’s history in the order the classic life cycle predicts.',
    items: [
      'The first brand launches; few buyers have heard of the category and the firm loses money',
      'Sales accelerate and rivals enter with copies',
      'Growth slows; weaker brands leave and the rest compete harder for share',
      'Sales are flat for years and brands compete on price and promotions',
      'Sales fall as buyers switch to a newer kind of product',
    ],
    solution: 'Introduction (first launch, losses), growth (acceleration, entry), the shake-out at the end of growth (slowing growth, exits), maturity (flat sales, price competition) and decline (switching to a substitute). Real categories may skip or repeat stages.',
  },
  {
    id: 'm02-plc-i2', type: 'classify', kind: 'conceptual',
    prompt: 'Classify each pattern as a style, a fashion or a fad.',
    items: [
      'Casual clothing at work, common for decades and still going in and out of favour',
      'A novelty toy that sells millions in one summer and is unsellable a year later',
      'Wide-leg trousers, gradually popular over three seasons, then slowly replaced',
      'Iced coffee as a way of drinking coffee',
    ],
    categories: ['Style', 'Fashion', 'Fad'],
    answer: [0, 2, 1, 0],
    feedback: {
      1: 'Explosive sales followed by collapse within a year, with no lasting need: a fad.',
      3: 'Iced coffee is a basic mode of expression for drinking coffee that has lasted a long time and comes and goes in popularity: a style. A particular iced drink could be a fashion or a fad within it.',
    },
    solution: 'Styles: casual workwear and iced coffee (basic, lasting modes of expression). Fashion: wide-leg trousers (a currently popular style that rises and declines slowly). Fad: the novelty toy (rapid rise, rapid collapse).',
  },
  {
    id: 'm02-plc-i3', type: 'mc', kind: 'applied',
    prompt: 'A smartphone maker (fictional) launches a new flagship model every September. Last year’s model is still selling steadily in July. What is the most sensible life-cycle decision for last year’s model?',
    options: [
      'Plan its run-down: cut its price at the new launch, limit stock and set a date to stop production.',
      'Increase its advertising budget, because steady sales in July show the model is in its maturity stage.',
      'Withdraw it immediately, because every product eventually declines and an old model only ties up stock.',
      'Change nothing, because the life cycle will decide what happens to it and falling sales will say when to stop selling.',
    ],
    answer: 0,
    feedback: {
      1: 'The company itself is about to replace the model. Heavy advertising for an outgoing model competes with its own successor.',
      2: 'Withdrawing it before the successor is ready loses sales for nothing. The timing is the company’s choice.',
      3: 'Here the life cycle is a plan set by the launch calendar, not something that happens to the product. Doing nothing leaves unsold stock when the new model arrives.',
    },
    solution: 'In categories with planned succession the model’s cycle is set by the company. The decisions are about timing: price the outgoing model to clear stock after the launch, match production to remaining demand and plan support for existing owners.',
  },
  {
    id: 'm02-plc-i4', type: 'classify', kind: 'applied',
    prompt: 'A fifty-year-old breakfast-cereal brand (fictional) has flat sales. Classify each idea for extending its life.',
    items: [
      'Promote the cereal as an afternoon snack, not only a breakfast',
      'Launch a lower-sugar recipe',
      'Sell a small single-serve pack in convenience stores',
      'Enter a neighbouring country where the brand is unknown',
      'Redesign the box and the cereal’s shape',
    ],
    categories: ['Modify the market', 'Modify the product', 'Modify the marketing mix'],
    answer: [0, 1, 2, 0, 1],
    feedback: {
      0: 'A new occasion for the same product finds new usage: modifying the market.',
      2: 'A new pack size in a new channel changes place and price points: modifying the mix (it is also a line extension).',
      3: 'New regions mean new users: modifying the market.',
    },
    solution: 'Modify the market: the snack occasion and the new country (new uses and new users). Modify the product: the lower-sugar recipe and the redesign. Modify the mix: the single-serve pack in convenience stores (new channel and price point).',
  },
  {
    id: 'm02-plc-i5', type: 'num', kind: 'numerical',
    prompt: 'A hypothetical brand sells 63,750 cans in the first quarter of a year in Harbour City, where the first-quarter seasonal index is 0.85. What are its seasonally adjusted sales for that quarter?',
    answer: 75000, check: () => 63750 / 0.85, tol: 1, unit: 'cans', places: 0,
    wrong: [{ value: 54188, say: 'You multiplied by the index. Divide to remove the seasonal effect: 63,750 ÷ 0.85.' }],
    solution: 'Seasonally adjusted sales = actual ÷ seasonal index = 63,750 ÷ 0.85 = 75,000 cans: what the quarter would have sold in an average season.',
  },
  {
    id: 'm02-plc-i6', type: 'mc', kind: 'conceptual',
    prompt: 'Which statement best captures Dhalla and Yuspeh’s (1976) criticism of the product life cycle?',
    options: [
      'The stages often don’t hold and the model has little validity for brands, so it shouldn’t dictate decisions.',
      'The life cycle has five stages, not four, because product development should be counted as a stage of its own.',
      'Executives knew the concept but rarely used it, so it should be exploited much more aggressively as a planning tool.',
      'The life cycle applies well to individual brands but not to product categories, whose sales are too stable to show stages.',
    ],
    answer: 0,
    feedback: {
      1: 'Counting development as a stage is a detail of drawing the curve, not their criticism.',
      2: 'That is closer to Levitt’s 1965 argument, which tried to make the concept a practical tool.',
      3: 'They argued the opposite: the model has least validity for brands.',
    },
    solution: 'Dhalla and Yuspeh argued that many products don’t develop through the traditional stages, that the variations are too unpredictable for one model, and that it has little validity for brand life cycles; decisions based on it, such as abandoning a brand believed to be declining, could be costly errors.',
  },
];

export const check = [
  {
    id: 'm02-plc-k1', type: 'mc', kind: 'conceptual',
    prompt: 'Which description best fits the maturity stage?',
    options: [
      'Sales growth has slowed or stopped, competition is intense and share gains come mostly from rivals.',
      'Sales are rising fast, new competitors are entering and the product is reaching more buyers each year.',
      'Few people know the product yet, distribution is still patchy and the firm is still losing money on it.',
      'Sales are falling because buyers are switching to a substitute, and some rivals are leaving.',
    ],
    answer: 0,
    feedback: {
      1: 'That is the growth stage.',
      2: 'That is the introduction stage.',
      3: 'That is the decline stage.',
    },
    solution: 'In maturity most potential buyers already buy, so sales flatten, competition intensifies, prices and margins come under pressure and share gains come from competitors. It is usually the longest stage.',
  },
  {
    id: 'm02-plc-k2', type: 'num', kind: 'numerical',
    prompt: 'A hypothetical category sold 4.4 million cans last year and 4.7 million this year. What was its year-on-year growth rate? (Give a percentage to one decimal place.)',
    answer: 6.8, check: () => (4.7 - 4.4) / 4.4 * 100, tol: 0.06, unit: '%', places: 1,
    wrong: [
      { value: 6.4, say: 'You divided by this year’s sales. Growth is measured against the earlier year: 0.3 ÷ 4.4.' },
      { value: 0.3, say: 'That is the change in millions of cans. Divide by last year’s 4.4 million and multiply by 100.' },
    ],
    solution: 'Growth = (4.7 − 4.4) ÷ 4.4 × 100 = 0.3 ÷ 4.4 × 100 ≈ 6.8%.',
  },
  {
    id: 'm02-plc-k3', type: 'classify', kind: 'applied',
    prompt: 'Classify each situation by the life-cycle stage it most likely shows.',
    items: [
      'A battery-storage technology that only a handful of pioneering factories have installed; its maker is still loss-making',
      'Film cameras for consumers, years after phones replaced them for most people',
      'Bottled water in a market where sales have barely changed for a decade',
      'An electric scooter-sharing service doubling its riders every year as rivals rush in',
    ],
    categories: STAGES,
    answer: [0, 3, 2, 1],
    feedback: {
      1: 'Buyers have moved to a substitute (phones): decline.',
      2: 'Flat sales over a long period: maturity.',
      3: 'Rapid growth with rivals entering: growth.',
    },
    solution: 'Introduction: the new battery technology (few adopters, losses). Growth: the scooter service (rapid growth, entry). Maturity: bottled water (flat for a decade). Decline: consumer film cameras (replaced by a substitute).',
  },
  {
    id: 'm02-plc-k4', type: 'mc', kind: 'applied',
    prompt: 'A clothing brand (fictional) sees one jacket style sell out in three weeks after a video goes viral. The buyer must decide how much to order for next season. What is the soundest approach?',
    options: [
      'Treat it as a possible fad: check for repeat buyers and spreading demand, and commit stock in stages.',
      'Order three times this season’s stock, because selling out in three weeks shows the growth stage has begun.',
      'Stop selling the jacket, because viral products always decline as quickly as they rose.',
      'Cut the price to sell even more jackets while the demand from the video lasts.',
    ],
    answer: 0,
    feedback: {
      1: 'Fast early growth fits a fad as well as a lasting fashion. Committing heavily before seeing repeat demand risks a warehouse of unsold jackets.',
      2: 'Not every viral product collapses; some become lasting fashions. Withdrawing it throws away demand that may continue.',
      3: 'It is selling out at the current price; cutting it gives away margin without answering the real question, whether demand will last.',
    },
    solution: 'Rapid early sales can’t tell a fad from a fashion. The buyer looks for evidence (repeat purchase, wider adoption) and commits stock in stages, limiting the loss if the trend collapses while keeping the upside if it lasts.',
  },
  {
    id: 'm02-plc-k5', type: 'mc', kind: 'applied',
    prompt: 'Harbour City’s ready-to-drink coffee category appears to be maturing. Which statement about Lantern Cold Brew’s launch is correct?',
    options: [
      'The brand starts in its own introduction stage, so its objectives are awareness and trial, but in a mature category most of its sales must be won from established brands.',
      'Because the category is mature, Lantern Cold Brew is in maturity from launch day and should focus on defending share.',
      'A mature category can’t accept a new brand, so the launch should be cancelled.',
      'The category’s stage doesn’t matter to a new brand.',
    ],
    answer: 0,
    feedback: {
      1: 'Categories and brands have different cycles. A brand with 12% awareness and no listings has no share to defend.',
      2: 'New brands enter mature categories regularly; they need a reason for shoppers to switch, not a growing market.',
      3: 'It matters a great deal: it decides whether the brand’s sales can come from new category buyers or must come from rivals.',
    },
    solution: 'The brand’s stage (introduction) sets its objectives: awareness, trial and listings. The category’s stage (maturity) tells Lantern where sales will come from (switchers from Summit, Arcadia and Daily Grind) and how rivals may respond.',
  },
  {
    id: 'm02-plc-k6', type: 'multi', kind: 'conceptual',
    prompt: 'Which of these are ways to extend the life of a mature product? Select all that apply.',
    options: [
      'Finding new uses or occasions for it',
      'Improving its quality or adding features',
      'Selling it in a new channel or pack size',
      'Cutting all its support so that it earns cash until it dies',
      'Taking it into new regions or to new kinds of user',
    ],
    answer: [0, 1, 2, 4],
    feedback: {
      3: 'Cutting support is harvesting, a decline-stage choice. It shortens the life cycle rather than extending it, and can make the decline it assumes.',
    },
    solution: 'Life extension works by modifying the market (new uses, new users, new regions), the product (quality, features, style) or the marketing mix (new channels, pack sizes, prices or campaigns). Harvesting is the opposite choice.',
  },
];
