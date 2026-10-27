// marketing-objectives.js — M01 · Marketing objectives. Content only; exercises are in marketing-objectives.ex.js.
// Lantern facts come from ./case.js (fictional); `checks` recompute them from that file. The workshop goal in the
// applied example and every other business are fictional, invented for this lesson. Lantern's 2027 catering numbers are
// left to the course project.
import { BUSINESS, GOALS, DERIVED } from './case.js?v=22';

const c = BUSINESS.catering;
const w = BUSINESS.workshops;
const places2026 = w.held * w.avgParticipants;                    // 168 places, March–December 2026
// Harrowby Payroll (fictional), the challenging example; the widget's defaults reproduce it.
const calder = { n0: 400, fee: 3000, r: 0.85, g: 0.15, p: 0.04, prop: 0.30, win: 0.25 };
const calderTarget = calder.n0 * calder.fee * (1 + calder.g);
const calderFee = calder.fee * (1 + calder.p);
const calderReq = calderTarget / calderFee;                        // 442.31
const calderNew = Math.ceil(calderReq - calder.n0 * calder.r);     // 103
// Lantern workshops (fictional 2027 goal and funnel rates, for the applied example)
const wsGoal = 30000, repeatPlaces = 40, bookRate = 0.5, enquiryRate = 0.04;
const wsPlaces = wsGoal / w.pricePerPerson;                        // 240
const wsNewPlaces = wsPlaces - repeatPlaces;                       // 200

const stage = (y, wd, color, name, measure) => `<rect x="${175 - wd / 2}" y="${y}" width="${wd}" height="40" rx="6" style="fill:none;stroke:var(--series-${color});stroke-width:2"/>`
  + `<text x="175" y="${y + 25}" text-anchor="middle" font-weight="700" fill="currentColor">${name}</text>`
  + `<text x="345" y="${y + 25}" font-size="13" fill="currentColor">${measure}</text>`;
const FUNNEL = '<svg viewBox="0 0 640 300" xmlns="http://www.w3.org/2000/svg" font-family="inherit" font-size="14"><defs><marker id="obj-ar" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>'
  + stage(14, 300, 1, 'Awareness', 'share of target buyers who know the name')
  + stage(68, 255, 2, 'Consideration', 'enquiries, visits, requests for proposals')
  + stage(122, 210, 3, 'Conversion', 'share of enquiries or proposals won')
  + stage(176, 165, 1, 'Retention', 'share of customers still buying a year later')
  + stage(230, 120, 2, 'Advocacy', 'referrals, reviews, recommendations')
  + '<path d="M115 250 L12 250 L12 34 L22 34" style="fill:none;stroke:currentColor;stroke-width:1.5;stroke-dasharray:6 4" marker-end="url(#obj-ar)"/>'
  + '<text x="36" y="292" font-size="12" fill="var(--ink-3)">advocates bring new prospects to the top of the funnel</text>'
  + '</svg>';

export default {
  slug: 'marketing-objectives',
  title: 'Marketing objectives',
  blurb: 'A business goal says where the business wants to be; a marketing objective says which customers must do what, by when, to get it there. Learn to turn a goal into SMART objectives across the funnel, and to work out how many new customers a growth target really needs once you allow for the customers you lose.',
  status: 'reviewed',
  objectives: [
    'Distinguish business goals, marketing objectives, strategies and tactics, and explain how each one serves the one above it.',
    'Write SMART marketing objectives and test objectives against the five criteria.',
    'Set objectives for each stage of the marketing funnel, from awareness to advocacy, with a measure for each.',
    'Calculate how many new customers a revenue target needs, given retention and revenue per customer.',
    'Calculate the leads or enquiries needed to win a number of customers, from the funnel’s conversion rates.',
    'Evaluate whether a set of objectives is consistent, achievable and protected against gaming.',
  ],
  prerequisites: [
    { lesson: 'm01/customer-value', why: 'Retention and what a customer is worth drive how many new customers a growth target needs.' },
    { lesson: 'm01/situation-analysis', why: 'Objectives are set from the situation analysis: where a business stands decides what it can achieve.' },
    { lesson: 'b01/business-questions', why: 'B01 defined SMART objectives; this lesson applies them to marketing.' },
    { lesson: 'b01/kpis', why: 'Objectives are tracked with KPIs; leading and lagging indicators, guardrail metrics and Goodhart’s law come from that lesson.' },
  ],
  case: 'lantern',

  concept: [
    { case: `Ana Lim’s goal for 2027 is simple to say: catering revenue ${GOALS.cateringGrowth * 100}% higher than at its current pace of ${c.clients} clients booking about ${c.eventsPerClientYear} events a year at about $${c.revenuePerEvent} an event. It is also impossible to act on as it stands. It doesn’t say whether the extra revenue should come from new clients, from more events with existing clients or from higher prices, and it ignores the fact that not every client stays: on Ana’s estimate, about ${c.retention * 100}% of Lantern’s catering clients carry on from one year to the next. Turning the goal into something the business can act on, and check, is the job of marketing objectives. This lesson teaches the method on other businesses; the course project applies it to Lantern’s catering.` },

    { h: 'Goals, objectives, strategies and tactics' },
    { p: 'Four words are used loosely in business, and it helps to fix their meaning before setting any targets. This course uses them as follows.' },
    { define: [
      ['Business goal', 'What the business as a whole wants to achieve, usually in money or size: more revenue, more profit, a larger share of a market. Ana’s 25% is a <g>business goal</g>.'],
      ['Marketing objective', 'What customers must do, how much and by when, for the goal to be met: how many customers to win or keep, how many must know the business, how often they should buy. A <g>marketing objective</g> names a customer behaviour, a measure, a level and a date.'],
      ['Marketing strategy', 'How the business will reach its objectives: which customers it will serve and how it will compete for them. A <g>marketing strategy</g> is a choice, such as “win small accountancy firms by offering the fastest payroll set-up in the region”.'],
      ['Tactics', 'The specific actions that carry the strategy out: this month’s price offer, a tasting for a prospect, an advertisement. Most tactics are marketing-mix decisions, the subject of M02.'],
    ] },
    { p: 'Each level serves the one above it, and each is judged by it. A tactic is good if it moves an objective; an objective is good if meeting it delivers the goal. Sources use the words differently. OpenStax’s <i>Principles of Marketing</i> treats goals as broad aims over three to five years and objectives as shorter-term steps of a year or less; other sources use the two words the other way round, or interchangeably. The labels matter less than keeping the four levels apart.' },

    { h: 'Where growth can come from' },
    { p: 'A revenue goal can be split into the customer behaviours that produce it, using a <g>driver tree</g> like the ones in B01:' },
    { math: String.raw`\text{Revenue} = \text{Customers} \times \text{Purchases per customer} \times \text{Average spend per purchase}` },
    { p: 'and the customers at the end of a period are those kept plus those newly won. So there are four ways to grow revenue: win new customers, keep more of the existing ones, sell to each customer more often, or raise what each purchase is worth through price or a richer mix. For Lantern’s catering the same tree reads clients × events per client × revenue per event. Choosing which branches to push is the first marketing decision, because each one leads to different objectives and different work. OpenStax describes the wider set of growth routes (selling more of existing products to existing markets, new products, new markets, or both new); course M10 covers them as the Ansoff matrix.' },

    { h: 'SMART marketing objectives' },
    { p: 'B01 introduced the <g>SMART objective</g>: specific, measurable, achievable, relevant and time-bound. In marketing it means naming which customers, which behaviour and which measure, the level to reach from a stated starting point, and the date or period. Compare two versions of an objective for a fictional dental clinic:' },
    { list: [
      '<b>Vague:</b> “Attract more patients next year.”',
      '<b>SMART:</b> “Raise new-patient registrations from 40 to 55 a month by June 2027, measured from the booking system, while keeping the share of patients who return within 12 months at 80% or more.”',
    ] },
    { p: 'The second version can be checked by anyone with the booking data, says by when, and builds in a second measure so that the first can’t be met by recruiting patients who never come back. The letters themselves vary between sources: OpenStax’s <i>Principles of Marketing</i> expands them as specific, measurable, attainable, realistic (or relevant) and time-bound in section 2.1, and as specific, measurable, actionable, realistic and time-bound in section 2.3. The questions behind the letters are what count.' },
    { callout: 'key', title: 'The anatomy of a marketing objective', html: 'Who (which customers) · does what (the behaviour) · measured how (the measure and its source) · from what to what (the starting point and the level) · by when (the date or period). If any part is missing, the objective can’t be checked.' },
  ],

  theory: [
    { h: 'Objectives across the funnel' },
    { p: 'Customers rarely go from never having heard of a business to buying from it in one step. The <g>marketing funnel</g> is a simple model of the stages they pass through, and marketers set objectives for each. It narrows because at each stage some people drop out.' },
    { figure: {
      svg: FUNNEL,
      caption: 'The marketing funnel, with an example measure for each stage. The dashed loop is a reminder that satisfied customers bring in new ones, so the funnel is not a one-way street.',
      alt: 'Five horizontal bars stacked from top to bottom, each narrower than the one above, forming a funnel. From the top: Awareness, measured by the share of target buyers who know the business’s name; Consideration, measured by enquiries, visits and requests for proposals; Conversion, measured by the share of enquiries or proposals won; Retention, measured by the share of customers still buying a year later; and Advocacy, measured by referrals, reviews and recommendations. A dashed arrow runs from the Advocacy bar back up the left side to the Awareness bar, labelled “advocates bring new prospects to the top of the funnel”.',
    } },
    { table: {
      caption: 'Example objectives at each stage for Harrowby Payroll, a fictional payroll service for small firms',
      head: ['Stage', 'The question', 'An example objective'],
      rows: [
        ['Awareness', 'Do the right buyers know we exist?', '35% of finance managers at firms with 10–50 staff in the region recognise the Harrowby name by December, in a survey'],
        ['Consideration', 'Do they think of us when they need the service?', '1,374 qualified leads and 412 proposals sent during the year'],
        ['Conversion', 'Do they choose us?', 'At least 25% of proposals won, each quarter'],
        ['Retention', 'Do they stay?', 'At least 85% of the clients on 1 January still clients on 31 December'],
        ['Advocacy', 'Do they recommend us?', '1 new client in 10 coming through a referral from an existing client'],
      ],
    } },
    { p: 'In a business market like Harrowby’s the middle of the funnel is usually described in sales terms: leads, qualified leads, proposals and wins. The figures in the table are not arbitrary; the challenging example works out where they come from. The funnel is a planning simplification, not a description of how everyone buys: the consumer-decisions lesson showed that real journeys loop back and skip stages. M02’s promotion lesson meets its older relatives, the hierarchy-of-effects models such as AIDA.' },
    { p: 'The funnel also sorts measures by timing. Revenue and wins are <g>lagging indicators</g>: they report outcomes after the fact. Awareness, enquiries and proposals are <g>leading indicators</g>: they move first and warn early if the year is going off course. A good set of objectives includes both, each tracked as a <g>key performance indicator</g> with an owner.' },

    { h: 'From a revenue goal to a customer target' },
    { p: 'The most important number in many marketing plans is the number of new customers the business must win. Working it out needs four inputs: the revenue target, the revenue each customer brings in a year, the customers at the start of the year, and the <g>retention rate</g> from the customer-value lesson: the share of customers at the start of a period who are still customers at its end. Its complement, 1 minus the retention rate, is the <g>churn rate</g>.' },
    { ol: [
      String.raw`Required customers: divide the revenue target by the revenue per customer, <m>N_{\text{req}} = R_{\text{target}} \div v</m>.`,
      String.raw`Customers kept: multiply the starting customers by the retention rate, <m>r \times N_0</m>.`,
      String.raw`New customers needed: the difference, <m>N_{\text{new}} = N_{\text{req}} - r N_0</m>. Round up only at this last step: a business can’t win part of a customer, and rounding earlier can add a customer that isn’t needed.`,
    ] },
    { p: String.raw`When revenue per customer doesn’t change, the revenue goal is a customer goal: growth of <m>g</m> needs <m>N_0(1+g)</m> customers, and the formula simplifies to <m>N_{\text{new}} = N_0(1 + g - r)</m>. That form shows the trap. A business with 200 customers and 80% retention loses <m>200 \times 0.20 = 40</m> customers a year. To grow by 10% it must win <m>200 \times (1 + 0.10 - 0.80) = 60</m> new customers, of which 40 merely replace the ones it lost. Every percentage point of retention it adds saves 2 new customers (1% of 200).` },
    { p: 'Three assumptions sit behind the formula; state them whenever you use it. First, every customer brings in the same revenue, the average; if new customers buy less than established ones, more are needed. Second, customers join or leave at the start of the year, so each counts for a full year. Third, the retention rate holds, even though the plans meant to deliver the goal, a price rise for example, may change it.' },
    { p: String.raw`The second assumption matters more than it looks. Suppose a business whose clients are each worth $3,000 a year needs $60,000 more revenue this year from new clients. If they all signed on 1 January it would need <m>60{,}000 \div 3{,}000 = 20</m>. If they sign evenly through the year, each pays for about half the year, $1,500 on average, so it needs about <m>60{,}000 \div 1{,}500 = 40</m>. Either define the target as the number of customers (or the revenue rate) at the end of the year, or allow for timing; never mix the two.` },

    { h: 'From new customers to the top of the funnel' },
    { p: String.raw`Once the number of new customers is known, the funnel’s conversion rates say how much activity it takes. If a share <m>c_1</m> of leads receive a proposal and a share <m>c_2</m> of proposals are won, then each lead becomes a customer with probability <m>c_1 c_2</m>, and the leads needed are <m>N_{\text{new}} \div (c_1 c_2)</m>. The rates multiply: 30% of leads reaching a proposal and 25% of proposals won means <m>0.30 \times 0.25 = 0.075</m>, or 7.5% of leads becoming clients, not 55% and not 25%. The same arithmetic works with any number of stages.` },
    { p: 'Multiply the new customers by the <g>customer acquisition cost</g> and you have the budget the objective implies, which the customer-value lesson taught you to compare with what a customer is worth. The funnel turns a revenue goal into a weekly workload. It also shows the choice every plan faces: the business can put more in at the top (more leads, which usually costs more promotion) or lose fewer on the way down (better conversion, which usually means a better offer or better selling). The application section below shows a university making exactly that choice.' },

    { h: 'Setting the level' },
    { p: 'Targets are set in two directions, and good planning does both. <b>Top-down</b>, the target is derived from the goal, as above. <b>Bottom-up</b>, it is built from what the business has actually achieved: last year’s leads, win rate and retention, and what specific changes could plausibly improve them. If the two disagree, the gap is the most useful number in the plan. Either the plan names what will close it (a new offer, more salespeople, a higher budget) or the goal should be revised before the year starts, not after.' },
    { p: 'Two more checks make a target achievable. Compare it with the business’s own history and with what similar businesses manage; a win rate that has never been above 20% won’t reach 40% because a plan says so. And check capacity: growing catering by a quarter is pointless if there aren’t enough baristas to serve the extra events.' },

    { h: 'Objectives that work together' },
    { p: 'Objectives interact. A plan to raise prices by 10%, double the number of new customers won and cut the promotion budget by a third sets three objectives that pull against each other: the price rise and the smaller budget both make winning customers harder. Check every pair of objectives, as M02 checks every pair of marketing-mix decisions, and keep the set small: three to five objectives that a team can remember will be pursued; fifteen will be ignored.' },
    { p: 'Objectives also change behaviour, not always as intended. <g>Goodhart’s law</g>, met in B01, warns that a measure stops tracking what it was meant to track once people are rewarded for moving it. Reward a sales team for new clients alone and it may win them with discounts that destroy the margin, or sign clients who leave after three months. The remedy is a <g>guardrail metric</g>: a second measure that must not get worse, such as the average price won or the share of new clients still buying after a year. Finally, prefer objectives that track profit to ones that track revenue when the two can diverge: a customer won at a loss adds to revenue and subtracts from profit.' },
    { callout: 'warn', title: 'A target is not a forecast', html: 'A forecast says what is likely to happen; a target says what the business intends to make happen. Plans go wrong when a hopeful target is treated as a forecast, for example when stock, staff or cash are planned around it. Keep both numbers, and plan resources around the forecast, with the target as the stretch.' },
  ],

  formulas: [
    { id: 'obj-required-customers', name: 'Customers needed for a revenue target',
      tex: String.raw`N_{\text{req}} = \dfrac{R_{\text{target}}}{v}`,
      where: [
        [String.raw`N_{\text{req}}`, 'Customers the business must have during the period', 'customers'],
        [String.raw`R_{\text{target}}`, 'Revenue target for the period', '$ per year'],
        ['v', 'Average revenue per customer over the period', '$ per customer per year'],
      ],
      assumptions: 'Every customer brings in the average revenue and is a customer for the whole period.',
      note: 'If prices change, use next period’s revenue per customer, not this period’s.' },
    { id: 'obj-new-customers', name: 'New customers needed, allowing for retention',
      tex: String.raw`N_{\text{new}} = N_{\text{req}} - r\,N_0 \qquad \text{and, if } v \text{ is unchanged,} \qquad N_{\text{new}} = N_0\,(1 + g - r)`,
      where: [
        [String.raw`N_{\text{new}}`, 'New customers the business must win during the period', 'customers'],
        [String.raw`N_{\text{req}}`, 'Customers needed for the revenue target', 'customers'],
        [String.raw`N_0`, 'Customers at the start of the period', 'customers'],
        ['r', 'Retention rate: share of starting customers still customers at the end of the period', 'decimal (0.85 = 85%)'],
        ['g', 'Growth target for revenue (or for customers, when revenue per customer is unchanged)', 'decimal (0.15 = 15%)'],
        ['v', 'Average revenue per customer per period', '$ per customer'],
      ],
      assumptions: 'Customers join and leave at the start of the period; new customers stay until its end; the retention rate is not changed by the plan itself.',
      note: 'Round up only at the end. The term N₀(1 − r) inside the result is the number of customers needed just to replace those lost.' },
    { id: 'obj-funnel-volume', name: 'Top-of-funnel volume needed',
      tex: String.raw`V = \dfrac{N_{\text{new}}}{c_1 \times c_2 \times \cdots \times c_k}`,
      where: [
        ['V', 'Leads, enquiries or visits needed at the top of the funnel', 'leads'],
        [String.raw`N_{\text{new}}`, 'New customers needed', 'customers'],
        [String.raw`c_i`, 'Conversion rate from each stage to the next, for stages 1 to k', 'decimal'],
      ],
      assumptions: 'The conversion rates are stable and don’t fall as volume rises (in practice, extra leads are often of lower quality), and leads convert within the period. In business markets a lead can take months to become a client, so leads that arrive late in the year count towards next year’s wins, and this year’s target needs leads earlier than an even monthly spread suggests.',
      note: 'Round up. Multiply the rates; never add or average them.' },
  ],

  examples: [
    { level: 'simple', title: 'How many new members does a gym need?', fictional: true,
      setup: 'Ironbridge Fitness has 1,200 members at the start of the year. In past years about 70% of the members on 1 January were still members on 31 December. The owner wants 10% more members at the end of the year than at the start, at the same monthly fee. How many new members must the gym recruit (counting only those still members at the year end)?',
      steps: [
        String.raw`Members needed at the year end: <m>1{,}200 \times 1.10 = 1{,}320</m>.`,
        String.raw`Members kept: <m>1{,}200 \times 0.70 = 840</m>.`,
        String.raw`New members needed: <m>1{,}320 - 840 = 480</m>. Check with the short form: <m>1{,}200 \times (1 + 0.10 - 0.70) = 1{,}200 \times 0.40 = 480</m>.`,
        String.raw`Split the 480: <m>1{,}200 \times 0.30 = 360</m> replace members who leave, and only <m>480 - 360 = 120</m> are growth.`,
      ],
      answer: '480 new members, of whom 360 replace members who leave and 120 are growth.',
      interpretation: String.raw`Three-quarters of the recruiting effort (<m>360 \div 480 = 75\%</m>) goes into standing still. If the gym could raise retention to 75%, it would need <m>1{,}200 \times 0.35 = 420</m>, 60 fewer. That is why a growth plan for a business with high churn should usually include a retention objective, not just a recruitment target.` },

    { level: 'challenging', title: 'From a revenue goal to a lead target', fictional: true,
      setup: 'Harrowby Payroll runs payroll for small firms. It has 400 client firms, each paying $3,000 a year, so revenue is $1,200,000. The board wants revenue 15% higher next year. Harrowby will raise its fee by 4% for all clients, and expects to keep 85% of them. In its sales funnel 30% of qualified leads receive a proposal and 25% of proposals are won. Assume, as the formula does, that clients join or leave at the start of the year. How many new clients, proposals and leads does the goal need? What happens if the fee rise pushes retention down to 82%?',
      steps: [
        String.raw`Revenue target: <m>1{,}200{,}000 \times 1.15 = 1{,}380{,}000</m> dollars. Revenue per client next year: <m>3{,}000 \times 1.04 = 3{,}120</m> dollars.`,
        String.raw`Clients needed: <m>1{,}380{,}000 \div 3{,}120 \approx 442.3</m>. Clients kept: <m>400 \times 0.85 = 340</m>.`,
        String.raw`New clients: <m>442.3 - 340 = 102.3</m>, rounded up at the end to 103. Without the fee rise Harrowby would need <m>1{,}380{,}000 \div 3{,}000 - 340 = 460 - 340 = 120</m>, so the price rise does the work of 17 new clients.`,
        String.raw`Through the funnel. The client target is a whole number, 103, and the funnel is worked back from it (working from the unrounded 102.3 would give 1,365 leads, a difference too small to matter). Proposals <m>103 \div 0.25 = 412</m>; leads <m>412 \div 0.30 \approx 1{,}373.3</m>, rounded up to 1,374. Equivalently, each lead has a <m>0.30 \times 0.25 = 0.075</m> chance of becoming a client, and <m>103 \div 0.075 \approx 1{,}373.3</m>.`,
        String.raw`Test the interaction. If the fee rise cuts retention to 82%, Harrowby keeps <m>400 \times 0.82 = 328</m> clients and needs <m>442.3 - 328 = 114.3</m>, so 115 new clients and <m>115 \div 0.075 \approx 1{,}533.3</m>, or 1,534 leads: 160 more leads for a three-point fall in retention.`,
      ],
      answer: '103 new clients, 412 proposals and 1,374 qualified leads. If retention falls to 82%, the need rises to 115 new clients and 1,534 leads.',
      interpretation: 'The price rise and the retention objective interact: the price rise saves 17 new clients only if clients don’t leave because of it. A sound plan therefore sets a retention objective alongside the acquisition target, and watches retention closely after the fee rise. The leads figure, about 115 a month on average, is what turns the goal into a workload the sales team can plan for, provided leads convert within the year. In business markets a lead can take months to become a client, so leads that arrive late in the year count towards next year’s wins, and this year’s target needs leads earlier than an even monthly spread suggests.' },

    { level: 'applied', title: 'Objectives for Lantern’s workshops', fictional: true,
      setup: `Lantern’s barista-training workshops are separate from its catering. From March to December 2026 Lantern held ${w.held} workshops with an average of ${w.avgParticipants} participants at $${w.pricePerPerson} a person. For this example, suppose Ana sets a business goal of $30,000 of workshop revenue in 2027, at the same price and class size, and that her records show (both figures invented for this example) that about half of all enquiries turn into a booking and that 4% of visits to the workshop pages produce an enquiry. She also plans an advanced class that she expects past participants to book 40 places on. Set the 2027 workshop objectives.`,
      steps: [
        String.raw`Translate the goal into places and workshops: <m>30{,}000 \div 125 = 240</m> places, or <m>240 \div 12 = 20</m> workshops.`,
        String.raw`Compare like with like. 2026 had ${places2026} places (<m>14 \times 12</m>), but over ten months. A full year at that pace is <m>168 \times 12 \div 10 = 201.6</m> places. The goal is <m>240 \div 201.6 - 1 \approx 19\%</m> above 2026’s pace, not <m>240 \div 168 - 1 \approx 43\%</m> above its total.`,
        String.raw`Allow for returning customers. If past participants take 40 places in the advanced class, <m>240 - 40 = 200</m> places must come from new participants.`,
        String.raw`Work back up the funnel: <m>200 \div 0.5 = 400</m> enquiries, and <m>400 \div 0.04 = 10{,}000</m> visits to the workshop pages, about <m>10{,}000 \div 12 \approx 833</m> a month.`,
        'Write the objectives, one for each lever, each with a measure and a date. Consideration: 10,000 visits to the workshop pages in 2027, tracked monthly against about 830. Conversion: at least 50% of enquiries booking a place, each quarter. Retention: 40 places on the advanced class booked by past participants by 31 December 2027. Add a guardrail: average participant rating of at least 4.5 out of 5, so that places aren’t filled by discounting or by cramming classes.',
      ],
      answer: '240 places in 20 workshops: 40 from past participants and 200 from new ones, which need about 400 enquiries and 10,000 visits to the workshop pages. The objectives cover visits, the enquiry-to-booking rate and repeat bookings, with a rating guardrail.',
      interpretation: 'Two habits did most of the work: comparing equal periods (the goal is a 19% step, not 43%) and splitting the goal into levers, each with its own objective. If the first quarter shows 600 visits a month instead of about 830, Ana will know by April, from a leading indicator, rather than in December from the revenue.' },
  ],

  demo: [
    { widget: 'obj-growth', intro: 'The calculation from the challenging example, with every input on a slider; the defaults are Harrowby Payroll’s. First lower the retention rate a few points and watch the new clients and leads rise. Then set the fee change to 0 and see how much work the price rise was doing. Finally lower the win rate and notice how quickly the leads needed grow.' },
  ],

  mistakes: [
    { title: '“Our revenue target is our marketing objective.”', html: 'Revenue is a business goal. It becomes actionable only when it is turned into customer behaviours: how many customers to win and keep, how often they buy, at what price. Without that step nobody knows what marketing is meant to do.' },
    { title: '“To grow 10% we need 10% more customers.”', html: 'Only if nobody leaves. With 80% retention, a business must first replace the 20% it loses, so 10% growth needs new customers equal to 30% of the starting base: three times as many. Always subtract the customers kept, not the customers you started with.' },
    { title: '“The funnel rates add up.”', html: 'Conversion rates multiply. If 30% of leads get a proposal and 25% of proposals are won, 7.5% of leads become clients. Adding (55%) or using only the last rate (25%) understates the leads needed several times over.' },
    { title: '“Comparing this year with last year is always fair.”', html: 'Only for equal periods. Lantern’s workshops ran for ten months in 2026; comparing a twelve-month target with a ten-month total makes the target look 43% higher when it is 19% above the pace. Annualise, or compare the same months.' },
    { title: '“Hit the number, whatever it takes.”', html: 'A single target invites gaming, as Goodhart’s law predicts: discounts that win clients who leave, classes filled at prices that lose money. Pair each acquisition target with a guardrail on price, margin or retention.' },
    { title: '“More objectives give more control.”', html: 'Long lists of objectives conflict with each other and are quietly ignored. Three to five, consistent with each other and each with an owner, steer a business better than fifteen.' },
  ],

  application: [
    { case: 'Penhallow University, a fictional university, runs an online master’s degree for working professionals. Last year 150 fee-paying students enrolled. The university’s goal for next year is 20% more, 180 enrolments, and its admissions marketing director has to turn that goal into objectives and a budget.' },
    { p: String.raw`She starts from the funnel, using last year’s rates from the admissions system: 25% of enquiries become applications, 60% of applications receive an offer, 50% of offers are accepted, and 80% of those who accept actually enrol (the rest, in admissions jargon, “melt” away over the summer). Multiplying the rates, each enquiry has a <m>0.25 \times 0.60 \times 0.50 \times 0.80 = 0.06</m> chance of becoming a student.` },
    { p: String.raw`Top-down, 180 enrolments need <m>180 \div 0.06 = 3{,}000</m> enquiries. Last year’s 150 came from about <m>150 \div 0.06 = 2{,}500</m>. One route is therefore 500 more enquiries, 20% more, which her agency prices at roughly 20% more advertising.` },
    { p: String.raw`The second route works lower in the funnel. Accepted offers are the weak stage: half of the people the university wants to admit go elsewhere. If faster decisions, a scholarship deadline and calls from current students lifted acceptance from 50% to 60%, each enquiry’s chance would become <m>0.25 \times 0.60 \times 0.60 \times 0.80 = 0.072</m>, and <m>180 \div 0.072 = 2{,}500</m> enquiries, last year’s number, would be enough.` },
    { p: String.raw`She proposes a mix, because neither route is certain: an enquiry objective of 2,750 (10% more than last year), an acceptance objective of 55% of offers, and a melt objective of no more than 20%. With those rates, <m>2{,}750 \times 0.25 \times 0.60 \times 0.55 \times 0.80 = 181.5</m> enrolments, just over the goal. Each objective has an owner: marketing for enquiries, admissions for acceptance, student services for melt.` },
    { p: 'She also sets a guardrail. The easiest way to hit 180 would be to make more offers to weaker applicants, which would raise the offer rate and lower completion rates a year later. So the offer rate is fixed by academic standards, not by marketing, and the share of students who complete their first year is tracked alongside enrolments. The same pattern applies in any business with a funnel, from a software firm to a coffee caterer: derive the volume from the goal, find the weakest stage, set an objective for each lever with an owner, and protect the measure that the targets could damage.' },
  ],

  summary: [
    'A business goal (more revenue, profit or share) becomes actionable only when translated into marketing objectives: what customers must do, how much and by when.',
    'Goals, objectives, strategies and tactics form a chain; each level is judged by whether it delivers the one above.',
    'Revenue grows through new customers, retention, purchase frequency or spend per purchase; the choice decides which objectives to set.',
    'A SMART marketing objective names the customers, the behaviour, the measure, the starting point and level, and the date.',
    'New customers needed = customers required − customers kept; with unchanged revenue per customer, N₀(1 + g − r). Round up only at the end, and state the timing assumption.',
    'Funnel conversion rates multiply: the volume needed at the top is the new customers divided by the product of the rates.',
    'Good objectives are few, consistent with each other, checked top-down and bottom-up, and protected by guardrail metrics against gaming.',
  ],

  glossary: [
    { term: 'Business goal', def: 'What a business as a whole aims to achieve, usually in money or size, such as more revenue, more profit or a larger market share.' },
    { term: 'Marketing objective', def: 'A statement of what customers must do, how much and by when, for a business goal to be met, such as the number of customers to win or keep, with a measure, a level and a date.' },
    { term: 'Marketing strategy', def: 'How a business intends to reach its marketing objectives: which customers it will serve and how it will compete for them.' },
    { term: 'Marketing funnel', def: 'A model of the stages customers pass through, from awareness through consideration and conversion to retention and advocacy, with fewer people at each stage.' },
    { term: 'Win rate', def: 'The share of proposals, quotes or bids that turn into sales.' },
  ],

  references: [
    { text: 'Gomez Albrecht, M., Green, M. &amp; Hoffman, L. (2023). <i>Principles of Marketing</i>, section 2.1, “Developing a Strategic Plan” (goals and objectives; SMART). OpenStax.', url: 'https://openstax.org/books/principles-marketing/pages/2-1-developing-a-strategic-plan', checked: '2026-10-23' },
    { text: 'Gomez Albrecht, M., Green, M. &amp; Hoffman, L. (2023). <i>Principles of Marketing</i>, section 2.2, “The Role of Marketing in the Strategic Planning Process” (growth strategies). OpenStax.', url: 'https://openstax.org/books/principles-marketing/pages/2-2-the-role-of-marketing-in-the-strategic-planning-process', checked: '2026-10-23' },
    { text: 'Gomez Albrecht, M., Green, M. &amp; Hoffman, L. (2023). <i>Principles of Marketing</i>, section 2.3, “Purpose and Structure of the Marketing Plan” (SMART marketing objectives). OpenStax.', url: 'https://openstax.org/books/principles-marketing/pages/2-3-purpose-and-structure-of-the-marketing-plan', checked: '2026-10-23' },
    { text: 'Gomez Albrecht, M., Green, M. &amp; Hoffman, L. (2023). <i>Principles of Marketing</i>, section 2.4, “Marketing Plan Progress Using Metrics” (metrics, KPIs, retention and the marketing funnel). OpenStax.', url: 'https://openstax.org/books/principles-marketing/pages/2-4-marketing-plan-progress-using-metrics', checked: '2026-10-23' },
  ],

  checks: [
    { what: 'Growth goal % (case.js)', value: GOALS.cateringGrowth * 100, shown: 25 },
    { what: 'Catering clients (case.js)', value: c.clients, shown: 18 },
    { what: 'Events per client (case.js)', value: c.eventsPerClientYear, shown: 6 },
    { what: 'Revenue per event (case.js)', value: c.revenuePerEvent, shown: 820 },
    { what: 'Catering retention % (case.js)', value: c.retention * 100, shown: 61 },
    { what: 'Trap: customers lost', value: 200 * (1 - 0.8), shown: 40 },
    { what: 'Trap: new customers for 10% growth', value: 200 * (1 + 0.10 - 0.80), shown: 60 },
    { what: 'Trap: customers saved per point of retention', value: 200 * 0.01, shown: 2 },
    { what: 'Timing: clients if all join on 1 January', value: 60000 / 3000, shown: 20 },
    { what: 'Timing: half-year revenue per client', value: 3000 / 2, shown: 1500 },
    { what: 'Timing: clients if joining evenly', value: 60000 / 1500, shown: 40 },
    { what: 'Funnel: combined rate', value: 0.30 * 0.25, shown: 0.075 },
    { what: 'Funnel: added rates (the mistake) %', value: 30 + 25, shown: 55 },
    { what: 'Harrowby table: leads', value: Math.ceil(calderNew / (calder.prop * calder.win)), shown: 1374 },
    { what: 'Harrowby table: proposals', value: calderNew / calder.win, shown: 412 },
    { what: 'Ironbridge: members needed', value: 1200 * 1.10, shown: 1320 },
    { what: 'Ironbridge: members kept', value: 1200 * 0.70, shown: 840 },
    { what: 'Ironbridge: new members', value: 1200 * 1.10 - 1200 * 0.70, shown: 480 },
    { what: 'Ironbridge: short form', value: 1200 * (1 + 0.10 - 0.70), shown: 480 },
    { what: 'Ironbridge: 0.40 factor', value: 1 + 0.10 - 0.70, shown: 0.4 },
    { what: 'Ironbridge: replacements', value: 1200 * 0.30, shown: 360 },
    { what: 'Ironbridge: growth', value: 480 - 360, shown: 120 },
    { what: 'Ironbridge: share standing still %', value: 360 / 480 * 100, shown: 75 },
    { what: 'Ironbridge: new members at 75% retention', value: 1200 * (1 + 0.10 - 0.75), shown: 420 },
    { what: 'Ironbridge: saving at 75% retention', value: 480 - 1200 * 0.35, shown: 60 },
    { what: 'Harrowby: revenue now', value: calder.n0 * calder.fee, shown: 1200000 },
    { what: 'Harrowby: revenue target', value: calderTarget, shown: 1380000 },
    { what: 'Harrowby: fee next year', value: calderFee, shown: 3120 },
    { what: 'Harrowby: clients needed', value: calderReq, shown: 442.3, tol: 0.05 },
    { what: 'Harrowby: clients kept', value: calder.n0 * calder.r, shown: 340 },
    { what: 'Harrowby: new clients unrounded', value: calderReq - 340, shown: 102.3, tol: 0.05 },
    { what: 'Harrowby: new clients', value: calderNew, shown: 103 },
    { what: 'Harrowby: clients needed without fee rise', value: calderTarget / calder.fee, shown: 460 },
    { what: 'Harrowby: new without fee rise', value: calderTarget / calder.fee - 340, shown: 120 },
    { what: 'Harrowby: clients saved by fee rise', value: (calderTarget / calder.fee - 340) - calderNew, shown: 17 },
    { what: 'Harrowby: proposals', value: calderNew / 0.25, shown: 412 },
    { what: 'Harrowby: leads unrounded', value: 412 / 0.30, shown: 1373.3, tol: 0.05 },
    { what: 'Harrowby: leads', value: Math.ceil(calderNew / 0.075), shown: 1374 },
    { what: 'Harrowby: leads from unrounded new clients', value: Math.ceil((calderReq - 340) / 0.075), shown: 1365 },
    { what: 'Harrowby: kept at 82%', value: 400 * 0.82, shown: 328 },
    { what: 'Harrowby: new at 82% unrounded', value: calderReq - 328, shown: 114.3, tol: 0.05 },
    { what: 'Harrowby: new at 82%', value: Math.ceil(calderReq - 328), shown: 115 },
    { what: 'Harrowby: leads at 82% unrounded', value: 115 / 0.075, shown: 1533.3, tol: 0.05 },
    { what: 'Harrowby: leads at 82%', value: Math.ceil(115 / 0.075), shown: 1534 },
    { what: 'Harrowby: extra leads', value: 1534 - 1374, shown: 160 },
    { what: 'Harrowby: leads per month', value: 1374 / 12, shown: 115, tol: 1 },
    { what: 'Workshops held (case.js)', value: w.held, shown: 14 },
    { what: 'Workshop participants (case.js)', value: w.avgParticipants, shown: 12 },
    { what: 'Workshop price (case.js)', value: w.pricePerPerson, shown: 125 },
    { what: 'Workshops: 2026 revenue (case.js)', value: DERIVED.workshopRevenue, shown: 21000 },
    { what: 'Workshops: places needed', value: wsPlaces, shown: 240 },
    { what: 'Workshops: workshops needed', value: wsPlaces / w.avgParticipants, shown: 20 },
    { what: 'Workshops: 2026 places', value: places2026, shown: 168 },
    { what: 'Workshops: annualised places', value: places2026 * 12 / 10, shown: 201.6 },
    { what: 'Workshops: growth vs pace %', value: (wsPlaces / (places2026 * 12 / 10) - 1) * 100, shown: 19, tol: 0.5 },
    { what: 'Workshops: growth vs 2026 total %', value: (wsPlaces / places2026 - 1) * 100, shown: 43, tol: 0.5 },
    { what: 'Workshops: new places', value: wsNewPlaces, shown: 200 },
    { what: 'Workshops: enquiries', value: wsNewPlaces / bookRate, shown: 400 },
    { what: 'Workshops: visits', value: wsNewPlaces / bookRate / enquiryRate, shown: 10000 },
    { what: 'Workshops: visits per month', value: 10000 / 12, shown: 833, tol: 0.5 },
    { what: 'Workshops: monthly visits rounded', value: 10000 / 12, shown: 830, tol: 5 },
    { what: 'Workshops: repeat places', value: repeatPlaces, shown: 40 },
    { what: 'Penhallow: last year', value: 150, shown: 150 },
    { what: 'Penhallow: target', value: 150 * 1.2, shown: 180 },
    { what: 'Penhallow: chance per enquiry', value: 0.25 * 0.60 * 0.50 * 0.80, shown: 0.06 },
    { what: 'Penhallow: enquiries needed', value: 180 / 0.06, shown: 3000 },
    { what: 'Penhallow: last year’s enquiries', value: 150 / 0.06, shown: 2500 },
    { what: 'Penhallow: extra enquiries', value: 3000 - 2500, shown: 500 },
    { what: 'Penhallow: chance at 60% acceptance', value: 0.25 * 0.60 * 0.60 * 0.80, shown: 0.072 },
    { what: 'Penhallow: enquiries at 60% acceptance', value: 180 / 0.072, shown: 2500 },
    { what: 'Penhallow: mixed plan enrolments', value: 2750 * 0.25 * 0.60 * 0.55 * 0.80, shown: 181.5 },
    { what: 'Penhallow: enquiry objective vs last year %', value: (2750 / 2500 - 1) * 100, shown: 10 },
  ],
};
