// market-orientation.js — M01 · Market orientation: putting customers at the centre. Content only; exercises are in
// market-orientation.ex.js. Lantern facts come from ./case.js (fictional); `checks` recompute them. The lesson reads
// Lantern's interviews as listening; it does not build Lantern's SWOT or choose its strategy (the course project does).
import { BUSINESS, CLIENT_INTERVIEWS as I, COMPETITOR } from './case.js?v=19';

const R = I.reasons;
const N = I.interviewed;
const mentions = Object.values(R).reduce((a, b) => a + b, 0);
const clv = (m, r, d) => m / (1 + d - r);
const ST = { clients: 120, m: 6000, r: 0.80, d: 0.10, leavers: 20, slow: 11, price: 6, moved: 3, cost: 90000 };
const stChurnCut = 0.5 * (ST.slow / ST.leavers) * (1 - ST.r);
const stR2 = ST.r + stChurnCut;
const stM2 = ST.m - ST.cost / ST.clients;

const CYCLE = '<svg viewBox="0 0 640 300" xmlns="http://www.w3.org/2000/svg" font-family="inherit" font-size="13"><defs><marker id="mo-ar" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>'
  + '<text x="320" y="22" text-anchor="middle" font-size="12" fill="currentColor">Kohli and Jaworski (1990): market orientation as three activities</text>'
  + [['1. Generate', 'intelligence about', 'customers’ needs now', 'and later, competitors', 'and wider change'], ['2. Disseminate it', 'across the business:', 'sales, service,', 'operations, finance', ''], ['3. Respond', 'change what is', 'offered and how', 'it is delivered', '']]
    .map((lines, i) => { const x = 16 + i * 216; return `<rect x="${x}" y="36" width="176" height="100" rx="6" style="fill:none;stroke:var(--series-${i + 1});stroke-width:2"/>` + lines.map((t, j) => (t ? `<text x="${x + 88}" y="${60 + j * 17}" text-anchor="middle"${j === 0 ? ' font-weight="700"' : ' font-size="11.5"'} fill="currentColor">${t}</text>` : '')).join(''); }).join('')
  + [0, 1].map((i) => { const x = 192 + i * 216; return `<line x1="${x + 2}" y1="86" x2="${x + 38}" y2="86" style="stroke:currentColor;stroke-width:1.5" marker-end="url(#mo-ar)"/>`; }).join('')
  + '<path d="M536 136V162H104V140" style="fill:none;stroke:currentColor;stroke-width:1.5;stroke-dasharray:6 4" marker-end="url(#mo-ar)"/>'
  + '<text x="320" y="182" text-anchor="middle" font-size="12" fill="currentColor">then listen again: did the response work?</text>'
  + '<rect x="16" y="198" width="608" height="88" rx="6" style="fill:none;stroke:var(--rule-strong);stroke-width:1.5"/>'
  + '<text x="320" y="224" text-anchor="middle" font-weight="700" fill="currentColor">Narver and Slater (1990): three behaviours and two decision criteria</text>'
  + '<text x="320" y="250" text-anchor="middle" fill="currentColor">Customer orientation · Competitor orientation · Inter-functional coordination</text>'
  + '<text x="320" y="272" text-anchor="middle" font-size="12" fill="currentColor">guided by a long-term focus and by profitability</text>'
  + '</svg>';

export default {
  slug: 'market-orientation',
  title: 'Market orientation: putting customers at the centre',
  blurb: 'Businesses differ in what they start from: what they can make, how good the product is, how hard they sell, or what customers need. Learn the five classic orientations and their limits, what a market orientation requires in practice (intelligence about customers and competitors, shared across the business and acted on), how to read what customers tell you, and why ethics and society belong in the picture.',
  status: 'reviewed',
  objectives: [
    'Distinguish the production, product, selling, marketing and societal marketing concepts by what each starts from and what it risks.',
    'Explain market orientation as behaviour, using Kohli and Jaworski’s three activities and Narver and Slater’s three components.',
    'Compare customer-centric and product-centric organisations and the measures each relies on.',
    'Calculate the share of respondents giving each reason in customer research, and interpret what such figures can and cannot show.',
    'Evaluate a marketing decision for its effects on society, using the AMA’s ethical norms and the rules on environmental claims.',
  ],
  prerequisites: [
    { lesson: 'm01/what-is-marketing', why: 'Marketing myopia and the marketing process are the starting points here.' },
    { lesson: 'm01/customer-value', why: 'Market orientation exists to create customer value; the challenging example uses retention and lifetime value.' },
    { lesson: 'b01/data-collection', why: 'Interviews are a way of collecting data: who was asked, and who wasn’t, decides what the answers can show.' },
  ],
  case: 'lantern',

  concept: [
    { case: 'In November 2026 Ana interviewed 12 of Lantern’s 18 catering clients and asked why they had chosen Lantern. Each could give several reasons. Coffee quality came up 9 times, reliability on the day 7, the baristas’ professionalism 6, flexible menus 4 and price 2. She also went through the bids she had lost in 2026: 5, all to Brewline Catering on price. Brewline is a larger caterer with self-serve urns and pod machines and no baristas, and it charges $7.50 a head against Lantern’s $9.00.' },
    { p: 'Ana’s interviews are an act of listening, and listening is where this lesson starts. Every business decides what to make and how to sell it from some starting point. It may start from what its equipment does well, from what its engineers are proud of, from what it needs to sell this month, or from what customers need. That starting point is the business’s orientation, and it shapes almost everything the business does.' },

    { h: 'Five orientations' },
    { p: 'Marketing textbooks describe five classic orientations, often called concepts. Each is a belief about what makes a business succeed. Here is each one as it might sound at Lantern.' },
    { list: [
      '<b>The <g>production concept</g></b> holds that customers want offers that are available and cheap, so the business should make as much as it can as efficiently as possible. At Lantern: “Serve as many cups per barista-hour as we can; clients will take what is cheap and on time.”',
      '<b>The <g>product concept</g></b> holds that customers want the best quality, performance and features, so the business should keep improving the product. At Lantern: “Perfect the espresso; good coffee sells itself.” Pushed too far, it leads to what Levitt called marketing myopia.',
      '<b>The <g>selling concept</g></b> holds that customers won’t buy enough unless they are persuaded, so the business should sell and promote hard what it has already decided to make. At Lantern: “Phone every office in the district with a discount until someone books.”',
      '<b>The <g>marketing concept</g></b> holds that a business reaches its goals by finding out what target customers need and want and satisfying them better than competitors do. At Lantern: “Find out what makes an office event go well for the people who book it, and build the service around that.”',
      '<b>The <g>societal marketing concept</g></b> holds that the business should satisfy customers in ways that also protect the long-term interests of society and the environment. At Lantern: “Do all of that, and be fair to our baristas, honest in our claims and careful with waste.”',
    ] },
    { p: 'Each orientation describes something a business needs. Lantern must be efficient, its coffee must be good and someone must ask for the business. The trouble starts when one of them becomes the whole view. A caterer that only cuts costs, only perfects the espresso or only pushes discounts will sooner or later offer something its customers don’t want enough. The marketing concept puts customers’ needs first and makes the other three serve them; the societal marketing concept adds the people outside the exchange who are affected by it.' },

    { h: 'From a philosophy to a practice' },
    { p: 'The marketing concept is a belief, and beliefs are easy to hold and hard to act on. In 1990 two pairs of researchers, publishing in the <i>Journal of Marketing</i>, set out what acting on it looks like. Ajay Kohli and Bernard Jaworski described <g>market orientation</g> as three organisation-wide activities: generating <g>market intelligence</g> about customers’ current and future needs and the forces that shape them, disseminating that intelligence across the departments of the business, and responding to it.' },
    { p: 'John Narver and Stanley Slater treated market orientation as part of a business’s culture, which shows in three behavioural components and is guided by two decision criteria. The components are <g>customer orientation</g>, understanding target customers well enough to keep creating value for them; <g>competitor orientation</g>, understanding what current and potential competitors can and will do; and <g>inter-functional coordination</g>, using the whole business, not just a marketing department, to create value for customers. The criteria are a long-term focus and profitability: market orientation is not giving customers whatever they ask for at any price.' },
    { figure: {
      svg: CYCLE,
      caption: 'Two descriptions of market orientation from 1990. Kohli and Jaworski describe the activities: generate intelligence, share it, act on it, and listen again. Narver and Slater describe the behaviours and the criteria that guide them.',
      alt: 'Three boxes in a row joined by arrows. Box 1: Generate intelligence about customers’ needs now and later, competitors and wider change. Box 2: Disseminate it across the business: sales, service, operations, finance. Box 3: Respond: change what is offered and how it is delivered. A dashed arrow runs from box 3 back to box 1 with the note “then listen again: did the response work?”. The row is headed “Kohli and Jaworski (1990): market orientation as three activities”. Below, a separate panel reads “Narver and Slater (1990): three behaviours and two decision criteria”, listing customer orientation, competitor orientation and inter-functional coordination, guided by a long-term focus and by profitability.',
    } },
    { p: 'At Lantern the three activities are small but real. Ana’s interviews, the event feedback forms her clients’ staff fill in and her record of lost bids are intelligence generation. Telling the baristas what clients said about their professionalism, and telling whoever plans the rota that 7 of the 12 clients named reliability, is dissemination. Changing something as a result, and checking afterwards whether it worked, is responsiveness. A business can be poor at any one of the three: it can collect feedback forms that nobody reads, hold meetings where nothing is decided, or change things without asking whether the change helped.' },

    { h: 'Listening to customers' },
    { p: 'Customer research is the most direct way of generating intelligence, and it has to be read carefully. When customers can give several reasons, the useful measure is the share of respondents who gave each one, and those shares need not add up to 100%. Equally important is who was asked. Ana spoke to clients who had chosen Lantern; the organisations that chose Brewline were not in the room. The applied example below works through what her interviews can and cannot show, and M04 Market Research teaches how to design research that answers the question you actually have.' },
  ],

  theory: [
    { h: 'The five concepts compared' },
    { table: {
      caption: 'Five orientations: where each starts and what it risks',
      head: ['Concept', 'Starts from', 'Belief about customers', 'Typical means', 'Main risk'],
      rows: [
        ['Production', 'The factory or the service operation', 'They want what is available and affordable', 'Efficiency, volume, wide distribution', 'Offers that are cheap but not wanted once supply is plentiful'],
        ['Product', 'The product', 'They want the best quality, performance and features', 'Continual product improvement', 'Myopia: perfecting something customers are leaving'],
        ['Selling', 'What the business has already made', 'They won’t buy enough unless persuaded', 'Heavy selling and promotion', 'Sales that don’t satisfy, and customers who don’t return'],
        ['Marketing', 'Target customers’ needs and wants', 'They choose the offer that serves them best', 'Research, a coordinated offer, satisfaction', 'Following today’s customers too closely; ignoring effects on others'],
        ['Societal marketing', 'Customers’ needs and society’s long-term interests', 'They and others are affected by what is sold', 'As marketing, plus attention to health, fairness and the environment', 'Hard to measure; real trade-offs between groups'],
      ],
    } },
    { p: 'OpenStax presents the concepts as a sequence of eras: a production concept from just after the Civil War (1861–1865) until the 1920s, a product concept from the 1920s to the 1950s, then a selling concept, then the marketing concept, which it describes as the idea that an organisation will achieve its goals when it satisfies the needs and wants of the consumer, and finally the societal marketing concept.' },
    { p: 'Historians have challenged that tidy sequence. Ronald Fullerton (1988), studying Britain, Germany and the United States, argued that the “Production Era” is a myth, and that, like the sales and marketing eras, the idea hides how extensive and sophisticated marketing was long before the twentieth century. The safer reading is that the five concepts are attitudes that coexist, often inside one firm: the operations manager thinks in production terms, the engineers in product terms and the sales team in selling terms. The marketing concept is the claim that customers’ needs should coordinate them all.' },

    { h: 'Two descriptions of market orientation' },
    { p: 'Kohli and Jaworski built their account from the marketing literature and 62 field interviews with managers, because, as they noted, little had been written about how the marketing concept is actually put into practice. Three features of their definition matter. Intelligence covers future needs as well as current ones, and the forces that shape needs, such as regulation, technology and competitors, not only what customers say. It is organisation-wide: a salesperson who hears a complaint and tells nobody has generated intelligence the business never uses. And responsiveness means action: the intelligence has to change what the business offers or how it delivers it.' },
    { p: 'Narver and Slater describe the same idea as a culture and the behaviour it produces; reviews often contrast this cultural view with Kohli and Jaworski’s view of market orientation as a set of activities. Customer orientation and competitor orientation are what the business pays attention to; inter-functional coordination is how the whole business turns that attention into value for customers. In a study of 140 business units, including both commodity and non-commodity businesses, they reported a substantial positive effect of market orientation on profitability in both kinds of business. It is still one study of business units at one point in time, so it shows an association; whether market orientation caused the extra profit, or profitable units could afford to be more market-oriented, needs other evidence, as B01’s lesson on interpreting results explains.' },
    { callout: 'key', title: 'Market-oriented is not the same as customer-led', html: 'A market-oriented business listens to customers, watches competitors and coordinates its functions, and then decides with a long-term focus on profitability. That can mean saying no: losing 5 bids on price doesn’t by itself oblige Lantern to match Brewline’s price. Doing whatever the most recent customer asks is not market orientation; it is giving up on judgement.' },

    { h: 'Customer-centric and product-centric organisations' },
    { p: 'A related distinction is between organisations built around products and organisations built around customers. Neither is wrong everywhere, but they ask different questions and measure different things.' },
    { table: {
      caption: 'Product-centric and customer-centric organisations compared',
      head: ['', 'Product-centric', 'Customer-centric'],
      rows: [
        ['Basic question', 'How do we sell more of this product?', 'What does this customer need, and which of our offers meet it?'],
        ['Organised around', 'Product lines and their managers', 'Customer groups and the people who serve them'],
        ['Key measures', 'Units sold, product margin, market share', 'Retention, satisfaction, customer lifetime value'],
        ['Selling approach', 'Push the product to as many buyers as possible', 'Build the relationship; sometimes recommend something cheaper'],
        ['Risk', 'Myopia: missing substitutes and changing needs', 'Serving each customer at a cost the business can’t sustain'],
      ],
    } },
    { p: 'The measures matter most. A business that rewards staff for units sold this quarter will behave in a product-centric way whatever its mission statement says; one that tracks retention and lifetime value, as the previous lesson did, gives people a reason to keep customers satisfied. Lantern is small enough that Ana is every function at once, which makes coordination easy and makes it easy, too, to measure only what is in front of her: this week’s bookings.' },

    { h: 'The limits of listening' },
    { list: [
      '<b>Customers describe today’s problems, not tomorrow’s solutions.</b> Kohli and Jaworski stress future needs for this reason. Lantern’s clients can say what goes wrong at events; they are less likely to invent a new kind of service.',
      '<b>Current customers are not the market.</b> People who chose you are the people your offer already suits. Their reasons understate whatever drove others away, which is why lost bids and non-customers are part of the intelligence.',
      '<b>Customers are not the only ones affected.</b> Employees, suppliers, neighbours and the environment are affected by what is sold and how. Craig Smith, Minette Drumwright and Mary Gentile (2010) named a single-minded focus on customers, to the exclusion of other stakeholders, as one source of what they called “the new marketing myopia”.',
      '<b>Listening is not deciding.</b> Research tells a business what customers value; strategy decides which customers to serve and how to compete. Module 3 of this course turns to those decisions.',
    ] },

    { h: 'Society, ethics and sustainability' },
    { p: 'The societal marketing concept asks marketers to weigh the long-term interests of society alongside customers’ wants. In practice that means questions such as: is this product safe and is its risk explained? Are the claims true? Is the price fair to vulnerable buyers? Who bears the waste?' },
    { p: 'The AMA’s Statement of Ethics frames the answers as three norms, do no harm, foster and maintain integrity, and embrace ethical values, and five values: honesty, responsibility, equity, transparency and citizenship. Equity, in its terms, includes recognising the needs of vulnerable market segments.' },
    { p: 'Sustainability claims are where ethics most often meets the law. A claim that a product is better for the environment, made without evidence or so vaguely that it can’t be checked, is called <g>greenwashing</g>.' },
    { p: 'In the United States the Federal Trade Commission’s Green Guides, first issued in 1992 and last revised in 2012, explain how the law against deceptive advertising applies to environmental claims. They advise marketers not to make unqualified general claims such as “eco-friendly”, because such claims are hard to interpret and it is highly unlikely that a marketer could substantiate every reasonable reading of them. Claims should instead be limited to a specific benefit, stated clearly and prominently, and backed by competent and reliable evidence. Other countries have their own rules.' },
    { case: 'Lantern’s cups are certified compostable in industrial composting facilities. A cup printed “100% eco-friendly” would be exactly the unqualified general claim the Green Guides advise against. Even a plain “compostable” would need qualifying if Harbour City has no industrial composting facility: the Guides ask marketers to qualify compostable claims when such facilities are not available to a substantial majority of the communities where the item is sold. A specific, honest claim (what the cups are certified for, and how clients should dispose of them where they are used) is far less likely to mislead, and more convincing. This detail is invented for the lesson.' },
  ],

  formulas: [
    { id: 'm01-share-citing', name: 'Share of respondents giving a reason, and reasons per respondent',
      tex: String.raw`s_k = \frac{n_k}{N} \times 100 \qquad \bar{r} = \frac{\sum_k n_k}{N}`,
      where: [
        [String.raw`s_k`, 'Share of respondents who gave reason k', '%'],
        [String.raw`n_k`, 'Number of respondents who gave reason k', 'respondents'],
        [String.raw`N`, 'Number of respondents', 'respondents'],
        [String.raw`\bar{r}`, 'Average number of reasons each respondent gave', 'reasons per respondent'],
      ],
      assumptions: 'Each respondent is counted at most once for each reason. When respondents can give several reasons, the shares add up to more than 100%; they add up to exactly 100% only when each gives one main reason.',
      note: 'A share describes the people asked, not the whole market. Who was asked (current customers, lost prospects, non-customers) decides what the shares can show. M04 Market Research covers sampling and question design.' },
  ],

  examples: [
    { level: 'simple', title: 'Which orientation is speaking?', fictional: true,
      setup: 'Five fictional businesses explain their plans. Which orientation does each reflect? (a) A furniture factory: “Our new line halves the cost of each chair; we will ship them to every discount store that will take them.” (b) A phone maker: “Our engineers have added a fourth camera; people will want it because it is the most advanced phone available.” (c) A holiday-apartment seller: “We have 400 unsold weeks; offer a free dinner to anyone who sits through a two-hour presentation.” (d) A language school: “Learners told us they drop out when work gets busy, so we built 20-minute lessons they can book on the day.” (e) A brewery: “Drinkers want more flavour; we will offer it with clear labels on alcohol content, add a low-alcohol range and fund local bottle recycling.”',
      steps: [
        'Ask what each plan starts from: the operation, the product, the stock that must be sold, customers’ needs, or customers’ needs and society’s interests.',
        '(a) starts from the factory’s efficiency and assumes cheap, available chairs will sell: the production concept.',
        '(b) starts from the engineers’ achievement and assumes the most advanced product wins, without asking whether buyers want a fourth camera: the product concept.',
        '(c) starts from stock that must be sold and relies on persuasion: the selling concept.',
        '(d) starts from what learners said about why they drop out and designs the service around it: the marketing concept. (e) does that and also attends to drinkers’ health and the environment: the societal marketing concept.',
      ],
      answer: '(a) production; (b) product; (c) selling; (d) marketing; (e) societal marketing.',
      interpretation: 'The giveaway is the first thing each plan mentions: cost, a feature, unsold stock, or what customers said. Only (d) and (e) began by listening. Notice that (e) is not charity: it serves its customers, and it chooses ways of doing so that it can defend to everyone else.' },

    { level: 'challenging', title: 'Is a faster response worth it? Listening to clients who left', fictional: true,
      setup: 'Stonebridge Energy Services (fictional) maintains battery-storage systems for 120 commercial clients on annual contracts. Each client brings a margin of $6,000 a year, 80% of clients renew each year, and the firm discounts at 10% a year. Last year 24 clients left, and the service manager, Elena, interviewed 20 of them. Asked for their main reason, 11 said slow response to faults, 6 said price and 3 had moved or closed. She proposes a 24-hour response guarantee, which would need extra technicians costing $90,000 a year. If the guarantee kept half of the clients who leave over slow response, would it pay? Use the previous lesson’s lifetime-value formula.',
      steps: [
        'Turn the interviews into shares. Of the 20 leavers interviewed, 11 ÷ 20 = 55% gave slow response as their main reason, 6 ÷ 20 = 30% price and 3 ÷ 20 = 15% a move or closure. Each gave one main reason, so the shares add to 100%. The 24 leavers are 120 × 20%, the 20% who don’t renew.',
        'Translate the hoped-for effect into retention, and say it is an assumption. If the guarantee kept half of those who leave over slow response, churn would fall by 0.5 × 55% × 20% = 5.5 percentage points, so retention would rise from 80% to 85.5%.',
        'Spread the cost over the clients: $90,000 ÷ 120 = $750 a client a year, so the margin falls from $6,000 to $5,250.',
        String.raw`Compare lifetime values. Today: <m>6{,}000 \div (1 + 0.10 - 0.80) = 20{,}000</m> dollars. With the guarantee: <m>5{,}250 \div (1 + 0.10 - 0.855) = 5{,}250 \div 0.245 \approx 21{,}428.57</m> dollars, about $1,428.57 more per client, or about $171,429 across 120 clients.`,
        String.raw`Find the break-even. The guarantee pays only if <m>5{,}250 \div (1.10 - r) \geq 20{,}000</m>, that is if <m>r \geq 1.10 - 0.2625 = 0.8375</m>. Retention must rise by at least 3.75 points, about 68% of the 5.5 points Elena hopes for.`,
      ],
      answer: 'On these assumptions the guarantee raises a client’s lifetime value from $20,000 to about $21,429. It pays for itself only if retention rises to at least 83.75%, so it depends on most of the hoped-for improvement actually happening.',
      interpretation: 'This is market orientation in miniature. Intelligence came from asking the clients who left, a group most firms never hear from. Acting on it needs the whole business: operations must hire and schedule technicians, finance must fund them, and sales must promise the guarantee only where it can be kept. Because the result hinges on one uncertain assumption, the sensible response is a pilot: offer the guarantee in one region for a year and compare its renewals with the rest.' },

    { level: 'applied', title: 'What Lantern’s interviews can and cannot show', fictional: true,
      setup: 'Ana wants to use her November interviews to decide what to protect as Lantern grows. She interviewed 12 of her 18 catering clients, who gave several reasons each: coffee quality 9, reliability on the day 7, the baristas’ professionalism 6, flexible menus 4, price 2. Separately, she lost 5 bids in 2026, all to Brewline on price. Work out the shares, then say what the interviews show, what they can’t show, and what a market-oriented next step would be.',
      table: {
        caption: 'Reasons Lantern’s clients gave for choosing it (12 clients interviewed; several reasons each)',
        head: ['Reason', 'Clients naming it', 'Share of clients interviewed'],
        align: ['l', 'r', 'r'],
        rows: [
          ['Coffee quality', '9', '75%'],
          ['Reliability on the day', '7', '58%'],
          ['Baristas’ professionalism', '6', '50%'],
          ['Flexible menus', '4', '33%'],
          ['Price', '2', '17%'],
        ],
        foot: [['All reasons', '28', '233%']],
      },
      steps: [
        'Work out the shares with the formula above: 9 ÷ 12 = 75%, 7 ÷ 12 ≈ 58%, 6 ÷ 12 = 50%, 4 ÷ 12 ≈ 33% and 2 ÷ 12 ≈ 17%, rounded to whole percentages.',
        'Explain why they add to 233%. The clients gave 28 reasons between them, 28 ÷ 12 ≈ 2.33 each. Each share is a share of clients, not of reasons, so the shares can’t be added to make 100%.',
        'State what the interviews show. Among clients who chose Lantern, quality and reliability are the most common reasons and price the least: three in four named quality and fewer than one in five named price. These are the things current clients value, and so the things that would put them at risk if they slipped.',
        'State what they can’t show. Only clients who chose Lantern were asked, two-thirds of them (12 of 18). The 5 organisations that chose Brewline, and the many offices that never considered either, weren’t asked, so the interviews understate how much price matters in the market as a whole. Twelve interviews also give only a rough picture.',
        'Plan the market-oriented next step. Disseminate: share the findings with the baristas, whose professionalism half the clients named. Generate more intelligence: ask the 5 lost prospects what Brewline offered and what would have changed their minds, and ask the 6 clients not interviewed. Only then respond, and check afterwards whether the response worked.',
      ],
      answer: 'Quality (75% of the clients interviewed) and reliability (58%) were the reasons given most often, and price (17%) the least. That is strong evidence about why current clients stay, and weak evidence about the market as a whole, because lost prospects and non-clients weren’t asked.',
      interpretation: 'The interviews are good intelligence, but only one of the three activities. They become market orientation when the findings reach the people who deliver the service and the gaps (the lost bids, the non-clients) are filled with more listening. What Lantern should then do about Brewline is a strategic choice that this course returns to in module 3.' },
  ],

  demo: [
    { widget: 'mo-reasons', intro: 'Ana’s interview results as a chart. Each bar counts the clients who named a reason, out of 12; read each bar as a share of clients, not as a slice of a whole. Ask yourself which reasons describe benefits Lantern controls, and which group of buyers is missing from the chart altogether.' },
    { widget: 'mo-respond', intro: 'The Stonebridge decision with every assumption on a slider. Start from the challenging example, then lower the retention the guarantee achieves until it stops paying, and see how the break-even moves when the guarantee costs more or the clients are worth more. Responding to intelligence is a decision with numbers, not a reflex.' },
  ],

  mistakes: [
    { title: '“Market-oriented means doing whatever customers ask.”', html: 'Market orientation means generating intelligence about customers and competitors, sharing it and responding, with a long-term focus on profitability. Sometimes the right response is to explain, or to decline: a caterer doesn’t have to match a rival’s price because some prospects asked for it.' },
    { title: '“Market orientation is the marketing department’s job.”', html: 'Kohli and Jaworski describe organisation-wide activities, and Narver and Slater make inter-functional coordination one of the three components. Intelligence that the marketing team collects and nobody else acts on changes nothing.' },
    { title: '“Business moved neatly from a production era to a sales era to a marketing era.”', html: 'That sequence is a teaching simplification. Fullerton (1988) argued that sophisticated marketing existed long before the twentieth century, and today the five orientations coexist, often inside one firm. Use the concepts to diagnose attitudes, not to date them.' },
    { title: '“If our customers are happy, we understand our market.”', html: 'Current customers are the people your offer already suits. Lost prospects, former customers and non-customers hold the intelligence your customers can’t give you, such as why Brewline won the 5 bids Lantern lost.' },
    { title: '“Shares of respondents should add up to 100%.”', html: 'Only when each respondent gives exactly one answer. When several reasons are allowed, as in Lantern’s interviews, each share is a share of respondents and the total can be well over 100% (233% there).' },
    { title: '“If it is legal, it is ethical, and green claims are just marketing.”', html: 'The AMA’s norms (do no harm, foster integrity, embrace ethical values) ask more than the law does. And green claims are regulated: the FTC’s Green Guides advise against unqualified claims such as “eco-friendly” and require evidence for specific ones.' },
  ],

  application: [
    { case: 'Oakhurst Clothing, a fictional online clothing brand, has a problem it first noticed in its accounts rather than its marketing: 30% of the items it sells come back. Returns cost it shipping both ways, and many returned items can’t be sold again at full price.' },
    { p: 'Its customer insight manager starts by generating intelligence. Instead of treating returns as a cost of doing business, she reads them as customers telling Oakhurst something. In one quarter the return form gives a main reason for 2,000 returns: 52% (1,040 items) don’t fit, 18% (360) look different from the photographs, and 30% (600) are other reasons, such as a change of mind or a late delivery. Because each return has one main reason, these shares add to 100%.' },
    { p: 'Dissemination is the hard part, because the causes sit in three different departments. Sizes are set by the design team, photographs by the studio, and fit advice by customer service. She brings the three together with the figures and with a sample of customers’ comments. Each sees something different: the designers learn that the same size is cut differently in different ranges; the studio learns that every item is photographed on one model; customer service learns that its fit advice is rarely asked for because customers can’t find it.' },
    { p: 'The response is coordinated: one sizing standard across ranges, photographs on models of several sizes, and a fit guide built from garment measurements and from what earlier buyers said about fit. Two quarters later, returns on new orders are down from 30% to 26%, a fall of 4 percentage points, or about 13% of the returns rate. She reports it with care: other things changed in those two quarters too, so she compares ranges that adopted the new standard first with those that adopted it later.' },
    { p: 'The societal side follows. Fewer returns mean fewer journeys and less waste, and the marketing team wants to call the next range “eco-friendly”. The manager points to the Green Guides. Instead, the range is labelled with what Oakhurst can prove, such as the share of recycled fibre by weight in each garment, backed by its suppliers’ certificates. The claim is narrower, true and checkable, which is also what makes it persuasive.' },
  ],

  summary: [
    'Five classic orientations: production (make it cheap and available), product (make it better), selling (push what is made), marketing (start from target customers’ needs) and societal marketing (serve customers in ways that also protect society).',
    'The orientations coexist rather than following each other in neat eras; Fullerton (1988) called the “Production Era” a myth.',
    'Market orientation turns the marketing concept into practice: generate intelligence, disseminate it across the business and respond (Kohli and Jaworski, 1990); customer orientation, competitor orientation and inter-functional coordination, with a long-term focus on profitability (Narver and Slater, 1990).',
    'Customer-centric organisations are organised and measured around customers (retention, satisfaction, lifetime value); product-centric ones around products (units, product margin).',
    'Read customer research by asking who was asked. With several reasons per respondent, shares of respondents add to more than 100%; current customers understate what drove others away.',
    'Ethics and sustainability belong in marketing decisions: the AMA’s norms and values set the standard, and environmental claims must be specific and substantiated (the FTC’s Green Guides).',
  ],

  glossary: [
    { term: 'Production concept', def: 'The belief that customers want offers that are available and affordable, so a business should concentrate on making as much as it can as efficiently as possible.' },
    { term: 'Product concept', def: 'The belief that customers want the best quality, performance and features, so a business should concentrate on continually improving its product.' },
    { term: 'Selling concept', def: 'The belief that customers won’t buy enough unless persuaded, so a business should sell and promote hard what it has already decided to make.' },
    { term: 'Marketing concept', def: 'The belief that a business reaches its goals by finding out what target customers need and want and satisfying them better than competitors do.' },
    { term: 'Societal marketing concept', def: 'The belief that a business should satisfy customers in ways that also protect the long-term interests of society and the environment.' },
    { term: 'Market orientation', def: 'The marketing concept put into practice: organisation-wide generation of intelligence about customers’ current and future needs, its dissemination across departments and responsiveness to it (Kohli and Jaworski, 1990); described by Narver and Slater (1990) as customer orientation, competitor orientation and inter-functional coordination.' },
    { term: 'Market intelligence', def: 'Information about customers’ current and future needs and the forces that shape them, including competitors, technology and regulation, gathered for decisions.' },
    { term: 'Customer orientation', def: 'Understanding target customers well enough to keep creating value for them; one of Narver and Slater’s three components of market orientation.' },
    { term: 'Competitor orientation', def: 'Understanding what current and potential competitors can and are likely to do; one of Narver and Slater’s three components of market orientation.' },
    { term: 'Inter-functional coordination', def: 'Using the whole business, not just a marketing department, to create value for customers; one of Narver and Slater’s three components of market orientation.' },
    { term: 'Customer-centric', def: 'Describes an organisation built and measured around customers and their needs (for example by retention and lifetime value) rather than around its products.' },
    { term: 'Greenwashing', def: 'Making environmental claims about a product or business that are vague, exaggerated or unsupported by evidence.' },
  ],

  references: [
    { text: 'Gomez Albrecht, M., Green, M. &amp; Hoffman, L. (2023). <i>Principles of Marketing</i>, section 1.4 “Evolution of the Marketing Concept”. OpenStax.', url: 'https://openstax.org/books/principles-marketing/pages/1-4-evolution-of-the-marketing-concept', checked: '2026-10-23' },
    { text: 'Fullerton, R. A. (1988). How modern is modern marketing? Marketing’s evolution and the myth of the “production era”. <i>Journal of Marketing</i>, 52(1), 108–125. The abstract was consulted.', url: 'https://doi.org/10.1177/002224298805200109', checked: '2026-10-23' },
    { text: 'Kohli, A. K. &amp; Jaworski, B. J. (1990). Market orientation: the construct, research propositions, and managerial implications. <i>Journal of Marketing</i>, 54(2), 1–18. The abstract was consulted; the three activities were confirmed from Tomášková, E. (2007), “The current models of market orientation”, <i>European Research Studies</i>, 11, special issue 3–4.', url: 'https://doi.org/10.1177/002224299005400201', checked: '2026-10-23' },
    { text: 'Narver, J. C. &amp; Slater, S. F. (1990). The effect of a market orientation on business profitability. <i>Journal of Marketing</i>, 54(4), 20–35. The original was not consulted. The abstract was read in the Portuguese translation, “Efeito da orientação para o mercado sobre a lucratividade da empresa”, <i>Revista de Administração de Empresas</i> (RAE-Clássicos), 2006, 46(2); the components and decision criteria were confirmed from Tomášková (2007).', url: 'https://scielo.br/j/rae/a/vYSGStjtt5S76Xmn7drtynN/abstract/?lang=en', checked: '2026-10-23' },
    { text: 'Smith, N. C., Drumwright, M. E. &amp; Gentile, M. C. (2010). The new marketing myopia. <i>Journal of Public Policy &amp; Marketing</i>, 29(1), 4–11. The abstract was consulted.', url: 'https://research.birmingham.ac.uk/en/publications/the-new-marketing-myopia/', checked: '2026-10-23' },
    { text: 'American Marketing Association. “AMA Statement of Ethics”: ethical norms and values for marketers.', url: 'https://www.ama.org/ama-statement-of-ethics/', checked: '2026-10-23' },
    { text: 'Federal Trade Commission. Guides for the Use of Environmental Marketing Claims (the “Green Guides”), 16 CFR Part 260, especially § 260.2 (substantiation), § 260.4 (general environmental benefit claims) and § 260.7 (compostable claims). First issued in 1992, last revised in 2012, and under review when consulted.', url: 'https://www.ecfr.gov/current/title-16/chapter-I/subchapter-B/part-260', checked: '2026-10-23' },
  ],

  checks: [
    { what: 'Clients interviewed (case.js)', value: N, shown: 12 },
    { what: 'Catering clients (case.js)', value: BUSINESS.catering.clients, shown: 18 },
    { what: 'Coffee quality (case.js)', value: R['Coffee quality'], shown: 9 },
    { what: 'Reliability (case.js)', value: R['Reliability on the day'], shown: 7 },
    { what: 'Professionalism (case.js)', value: R['Baristas’ professionalism'], shown: 6 },
    { what: 'Flexible menus (case.js)', value: R['Flexible menus'], shown: 4 },
    { what: 'Price (case.js)', value: R.Price, shown: 2 },
    { what: 'Lost bids (case.js)', value: I.lostBids, shown: 5 },
    { what: 'Brewline price per head (case.js)', value: COMPETITOR.pricePerHead, shown: 7.5 },
    { what: 'Lantern price per head (case.js)', value: BUSINESS.catering.pricePerHead, shown: 9 },
    { what: 'Share: quality (%)', value: R['Coffee quality'] / N * 100, shown: 75 },
    { what: 'Share: reliability (%)', value: R['Reliability on the day'] / N * 100, shown: 58, tol: 0.5 },
    { what: 'Share: professionalism (%)', value: R['Baristas’ professionalism'] / N * 100, shown: 50 },
    { what: 'Share: menus (%)', value: R['Flexible menus'] / N * 100, shown: 33, tol: 0.5 },
    { what: 'Share: price (%)', value: R.Price / N * 100, shown: 17, tol: 0.5 },
    { what: 'All mentions', value: mentions, shown: 28 },
    { what: 'All shares (%)', value: mentions / N * 100, shown: 233, tol: 0.5 },
    { what: 'Reasons per client', value: mentions / N, shown: 2.33 },
    { what: 'Share of clients interviewed', value: N / BUSINESS.catering.clients, shown: 2 / 3 },
    { what: 'Clients not interviewed', value: BUSINESS.catering.clients - N, shown: 6 },
    { what: 'Half named professionalism', value: R['Baristas’ professionalism'] / N, shown: 0.5 },
    { what: 'Three in four named quality', value: R['Coffee quality'] / N, shown: 0.75 },
    { what: 'Fewer than one in five named price', value: R.Price / N < 0.2 ? 1 : 0, shown: 1 },
    { what: 'Stonebridge: leavers', value: ST.clients * (1 - ST.r), shown: 24 },
    { what: 'Stonebridge: slow-response share (%)', value: ST.slow / ST.leavers * 100, shown: 55 },
    { what: 'Stonebridge: price share (%)', value: ST.price / ST.leavers * 100, shown: 30 },
    { what: 'Stonebridge: moved share (%)', value: ST.moved / ST.leavers * 100, shown: 15 },
    { what: 'Stonebridge: shares add to 100', value: (ST.slow + ST.price + ST.moved) / ST.leavers * 100, shown: 100 },
    { what: 'Stonebridge: churn cut (points)', value: stChurnCut * 100, shown: 5.5 },
    { what: 'Stonebridge: retention after (%)', value: stR2 * 100, shown: 85.5 },
    { what: 'Stonebridge: cost per client', value: ST.cost / ST.clients, shown: 750 },
    { what: 'Stonebridge: margin after', value: stM2, shown: 5250 },
    { what: 'Stonebridge: CLV today', value: clv(ST.m, ST.r, ST.d), shown: 20000 },
    { what: 'Stonebridge: denominator after', value: 1 + ST.d - stR2, shown: 0.245 },
    { what: 'Stonebridge: CLV after', value: clv(stM2, stR2, ST.d), shown: 21428.57 },
    { what: 'Stonebridge: CLV after (rounded)', value: clv(stM2, stR2, ST.d), shown: 21429, tol: 0.5 },
    { what: 'Stonebridge: gain per client', value: clv(stM2, stR2, ST.d) - clv(ST.m, ST.r, ST.d), shown: 1428.57 },
    { what: 'Stonebridge: gain across clients', value: ST.clients * (clv(stM2, stR2, ST.d) - clv(ST.m, ST.r, ST.d)), shown: 171429, tol: 0.5 },
    { what: 'Stonebridge: margin ÷ CLV today', value: stM2 / clv(ST.m, ST.r, ST.d), shown: 0.2625 },
    { what: 'Stonebridge: break-even retention', value: 1 + ST.d - stM2 / clv(ST.m, ST.r, ST.d), shown: 0.8375 },
    { what: 'Stonebridge: break-even retention (%)', value: (1 + ST.d - stM2 / clv(ST.m, ST.r, ST.d)) * 100, shown: 83.75 },
    { what: 'Stonebridge: points needed', value: (1 + ST.d - stM2 / clv(ST.m, ST.r, ST.d) - ST.r) * 100, shown: 3.75 },
    { what: 'Stonebridge: share of hoped-for rise needed (%)', value: (1 + ST.d - stM2 / clv(ST.m, ST.r, ST.d) - ST.r) / stChurnCut * 100, shown: 68, tol: 0.5 },
    { what: 'Oakhurst: fit returns', value: 0.52 * 2000, shown: 1040 },
    { what: 'Oakhurst: photo returns', value: 0.18 * 2000, shown: 360 },
    { what: 'Oakhurst: other returns', value: 0.30 * 2000, shown: 600 },
    { what: 'Oakhurst: shares add to 100', value: 52 + 18 + 30, shown: 100 },
    { what: 'Oakhurst: fall in points', value: 30 - 26, shown: 4 },
    { what: 'Oakhurst: relative fall (%)', value: (30 - 26) / 30 * 100, shown: 13, tol: 0.5 },
  ],
};
