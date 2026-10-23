// effective-annual-rates.js — F04 · Effective annual rates. Content only; exercises are in effective-annual-rates.ex.js.
// Uses BREWER (the $24,000 cold-brew system: Coastline's 7.2% APR monthly loan and the supplier's 24 × $1,050 plan)
// and COASTLINE_NOTE.marketRateMarch2027 (8% compounded quarterly) from case.js. The vendor plan's implied rate is
// left to the annuities lesson. Every other business and figure is fictional and labelled. ANA_PLAN is not used.
import { BREWER as B, COASTLINE_NOTE as N } from './case.js';

const ear = (apr, m) => (1 + apr / m) ** m - 1;
const rB = B.loan.apr / 100;                    // 0.072
const rQ = N.marketRateMarch2027 / 100;         // 0.08

export default {
  slug: 'effective-annual-rates',
  title: 'Effective annual rates',
  blurb: 'A rate of 7.2% a year can cost 7.2%, 7.40% or 7.47% a year depending on how often interest is compounded. Learn to tell nominal, periodic and effective rates apart, to convert any rate to any compounding frequency (continuous compounding included), to read a US annual percentage yield, and to compare offers quoted in different ways.',
  status: 'draft',
  objectives: [
    'Distinguish a nominal annual rate (APR), a periodic rate and an effective annual rate (EAR), and convert each into the others.',
    'Calculate the effective annual rate for any compounding frequency, including continuous compounding.',
    'Convert a rate quoted with one compounding frequency into the equivalent rate with another.',
    'Calculate an annual percentage yield (APY) as US banks disclose it under the Truth in Savings rules, and explain what it includes.',
    'Compare loan, deposit and trade-credit offers quoted on different bases, and choose the best one.',
  ],
  prerequisites: [
    { lesson: 'f04/simple-and-compound-interest', why: 'You need compound growth, FV = PV(1 + r)ⁿ, roots and logarithms.' },
    { lesson: 'f00/interest-and-inflation', why: 'It introduced compounding frequency, APR, EAR and APY. This lesson keeps its definitions and goes further.' },
  ],
  case: 'lantern',

  concept: [
    { case: 'Lantern needs $24,000 for its cold-brew system, and Ana has three numbers in front of her. Coastline Bank will lend the money at “7.2% APR”, compounded monthly and repaid over 48 months. The supplier will take 24 monthly payments of $1,050 at “0% interest”. And Coastline’s loan officer mentions that a loan like Lantern’s existing note would cost 8% a year compounded quarterly in today’s market. A rate compounded monthly, a rate compounded quarterly and a plan with no rate at all: before Ana can compare them she needs them in the same units. This lesson builds that common unit, the effective annual rate, and uses it on the first two. The instalment plan must wait for annuities, because its cost is hidden in the payments rather than stated as a rate.' },

    { h: 'Three rates for one loan' },
    { p: 'Every compound interest rate can be described in three ways. Take Coastline’s 7.2% compounded monthly:' },
    { define: [
      ['Nominal annual rate', 'The quoted figure, 7.2% a year. It is the periodic rate multiplied by the number of periods in a year, and it ignores compounding. An <g>APR</g> in its simple sense is a nominal annual rate.'],
      ['Periodic rate', String.raw`The rate actually charged each period: <m>7.2\% \div 12 = 0.6\%</m> a month. This is the rate that goes into every calculation.`],
      ['Effective annual rate', String.raw`The rate that, compounded once a year, gives the same growth as the periodic rate compounded every period: <m>1.006^{12} - 1 \approx 7.44\%</m>. It is what a balance really grows by in a year.`],
    ] },
    { p: String.raw`F00 introduced the <g>effective annual rate</g> (EAR); here it becomes the working tool. If Lantern borrowed $24,000 and repaid nothing for a year, it would owe <m>24{,}000 \times 1.006^{12} \approx 25{,}786.18</m> dollars, interest of $1,786.18. The APR suggests <m>24{,}000 \times 0.072 = 1{,}728</m> dollars. The extra $58.18 is interest charged on interest during the year. A real loan is repaid month by month, so the balance falls and the dollar interest is smaller, but the rate charged each month, and so the EAR, is the same.` },

    { h: 'The compounding frequency matters, but less and less' },
    { p: 'The more often a given nominal rate is compounded, the higher its EAR, because interest starts earning interest sooner. The table uses 12% a year, which makes the periodic rates easy to read.' },
    { table: {
      caption: 'A nominal 12% a year at different compounding frequencies',
      head: ['Compounding', 'Periods a year (m)', 'Periodic rate', 'EAR'],
      align: ['l', 'r', 'r', 'r'],
      rows: [
        ['Annual', '1', '12%', '12.0000%'],
        ['Semi-annual', '2', '6%', '12.3600%'],
        ['Quarterly', '4', '3%', '12.5509%'],
        ['Monthly', '12', '1%', '12.6825%'],
        ['Weekly', '52', '0.2308%', '12.7341%'],
        ['Daily', '365', '0.0329%', '12.7475%'],
        ['Continuous', '—', '—', '12.7497%'],
      ],
      note: 'EAR = (1 + 0.12 ÷ m)^m − 1; continuous: e^0.12 − 1. Rates rounded to four decimal places.',
    } },
    { p: 'Moving from annual to semi-annual compounding adds 0.36 of a percentage point. Moving from monthly to daily adds only 0.065 of a point, and from daily to continuous about 0.002. As compounding becomes more frequent the EAR does not grow without limit: it approaches a ceiling, and that ceiling is continuous compounding.' },

    { h: 'Continuous compounding' },
    { p: String.raw`Imagine compounding every hour, every second, every instant. The EAR of a nominal rate compounded this way is <m>e^{\text{APR}} - 1</m>, where <m>e \approx 2.718282</m> is the mathematical constant you met as the base of natural logarithms in the last lesson. At 12% the limit is <m>e^{0.12} - 1 \approx 12.7497\%</m>; at Coastline’s 7.2% it is <m>e^{0.072} - 1 \approx 7.4655\%</m>, barely above the 7.4424% of monthly compounding. <g>Continuous compounding</g> is widely used in financial theory and models, because exponentials and logarithms make the algebra tidy.` },
    { callout: 'key', title: 'Quote, calculate, compare', html: 'The nominal rate (APR) is what lenders quote. The periodic rate is what you calculate with. The effective annual rate is what you compare. Most wrong answers in interest problems come from using one of the three where another belongs.' },
  ],

  theory: [
    { h: 'From any one rate to the others' },
    { p: String.raw`With <m>m</m> compounding periods a year, the periodic rate is <m>r = \text{APR} \div m</m> and the EAR follows by compounding it <m>m</m> times. Going backwards, take the <m>m</m>th root of <m>1 + \text{EAR}</m> to find the periodic rate, then multiply by <m>m</m>:` },
    { math: String.raw`\text{EAR} = \left(1 + \frac{\text{APR}}{m}\right)^{m} - 1 \qquad\Longleftrightarrow\qquad \text{APR} = m\left[(1 + \text{EAR})^{1/m} - 1\right]` },
    { p: String.raw`What nominal rate compounded monthly gives an EAR of exactly 8%? The monthly rate is <m>1.08^{1/12} - 1 \approx 0.643403\%</m>, so the APR is <m>12 \times 0.643403\% \approx 7.7208\%</m>. It is not <m>8\% \div 12</m>: a monthly rate of 0.6667% compounds to about 8.30% a year, more than intended.` },
    { p: String.raw`Over several years, either route gives the same future value: <m>\text{FV} = \text{PV}(1 + \text{APR}/m)^{mt} = \text{PV}(1 + \text{EAR})^{t}</m>, where <m>t</m> is the time in years. For example, $24,000 for 18 months at 7.2% compounded monthly is <m>24{,}000 \times 1.006^{18} \approx 26{,}728.52</m> dollars, and <m>24{,}000 \times 1.074424^{1.5}</m> gives the same $26,728.52.` },

    { h: 'Equivalent rates at another frequency' },
    { p: String.raw`Two rates are <g>equivalent rates</g> when they give the same growth over a year, and so have the same EAR. To turn a rate quoted with <m>m_1</m> periods a year into one with <m>m_2</m>, set the two growth factors equal:` },
    { math: String.raw`\left(1 + \frac{\text{APR}_1}{m_1}\right)^{m_1} = \left(1 + \frac{\text{APR}_2}{m_2}\right)^{m_2} \quad\Longrightarrow\quad \text{APR}_2 = m_2\left[\left(1 + \frac{\text{APR}_1}{m_1}\right)^{m_1/m_2} - 1\right]` },
    { p: String.raw`Lantern’s case gives an example. A loan like its note would cost 8% a year compounded quarterly in March 2027: a quarterly rate of 2% and an EAR of <m>1.02^4 - 1 \approx 8.2432\%</m>. The equivalent monthly rate is <m>1.02^{1/3} - 1 \approx 0.662271\%</m>, a nominal 7.9473% a year compounded monthly. On the same monthly basis, then, the market rate for such a loan is about 0.75 of a percentage point above the 7.2% Coastline offers on the brewer.` },
    { p: String.raw`The same idea gives a rate for a period of any length. A period of <m>d</m> days is <m>d/365</m> of a year, so the rate for it that matches an EAR is <m>(1 + \text{EAR})^{d/365} - 1</m>; turning a rate for <m>d</m> days into an EAR raises <m>1 + r</m> to the power <m>365/d</m>. The applied example uses this to price an early-payment discount.` },

    { h: 'Continuous compounding in formulas' },
    { p: String.raw`Why does the limit involve <m>e</m>? The number <m>e</m> is defined as the value that <m>(1 + 1/m)^m</m> approaches as <m>m</m> grows: 2 when <m>m = 1</m>, 2.593742 when <m>m = 10</m>, 2.704814 at 100, 2.716924 at 1,000 and 2.718146 at 10,000. A nominal rate APR compounded <m>m</m> times a year behaves the same way, its growth factor over a year approaching <m>e^{\text{APR}}</m>. Over <m>t</m> years:` },
    { math: String.raw`\text{FV} = \text{PV}\,e^{\text{APR}\,t}, \qquad \text{EAR} = e^{\text{APR}} - 1, \qquad \text{APR} = \ln(1 + \text{EAR})` },
    { p: String.raw`The last form converts an effective rate into its continuously compounded equivalent: an EAR of 6% is a continuously compounded rate of <m>\ln 1.06 \approx 5.8269\%</m>. Continuously compounded rates have a convenient property: rates for successive periods add, because <m>e^{a} \times e^{b} = e^{a + b}</m>.` },

    { h: 'The annual percentage yield on US deposits' },
    { p: 'In the United States, deposit rates are disclosed in a standard way under the Truth in Savings Act, implemented by Regulation DD (12 CFR part 1030). The regulation defines the <g>annual percentage yield</g> as a percentage rate reflecting the total interest paid on an account, based on the interest rate and the frequency of compounding for a 365-day period (366 days in a leap year). It defines the <i>interest rate</i> as the annual rate paid on an account, not reflecting compounding. In this course’s words, a deposit’s interest rate is its nominal annual rate and its APY is an effective annual rate.' },
    { p: 'Appendix A to the regulation gives the general formula, in which Interest is the total interest earned on the Principal over the term and Days in term is the actual number of days:' },
    { math: String.raw`\text{APY} = 100\left[\left(1 + \frac{\text{Interest}}{\text{Principal}}\right)^{365/\text{Days in term}} - 1\right]` },
    { p: String.raw`For an account with no fixed term, the regulation treats the term as 365 days, so the APY is simply a year’s interest as a percentage of the principal. Two of the appendix’s examples show the formula at work. An account paying $61.68 on $1,000 over a 365-day year has an APY of 6.17%, which is what 6% compounded monthly pays: <m>1{,}000 \times (1.005^{12} - 1) \approx 61.68</m>. A six-month certificate of deposit paying $30.37 on $1,000 over 182 days has an APY of <m>100 \times (1.03037^{365/182} - 1) \approx 6.18\%</m>. The formula compounds the six-month return over a whole year, so the APY of a short deposit can be compared directly with that of a longer one.` },
    { p: String.raw`The same formula handles terms longer than a year by taking a root instead of a power. Suppose a fictional two-year certificate of deposit, a term of 730 days, pays $832 of interest on $10,000 at maturity. Its APY is <m>100 \times (1.0832^{365/730} - 1) = 100 \times (\sqrt{1.0832} - 1) \approx 4.08\%</m>, not <m>8.32\% \div 2 = 4.16\%</m>. Halving the two-year return would ignore the interest earned in the second year on the first year’s interest, and so overstate the yearly rate.` },
    { callout: 'standards', title: 'APY is not a loan APR', html: 'The APY is a US deposit disclosure. On the loan side, US lenders disclose an APR under Regulation Z, and it is not an EAR. As F00’s lesson on interest and inflation explained, a credit card’s APR is its periodic rate times the number of periods in a year, while the APR on a closed-end loan such as a mortgage or car loan also reflects certain fees. The lesson on loan amortisation returns to fees and the APR of a closed-end loan. Other countries use other labels, such as AER (annual equivalent rate) for savings in the UK; always check which kind of rate a figure is.' },

    { h: 'Comparing offers quoted differently' },
    { p: 'A reliable procedure for any comparison of rates:' },
    { ol: [
      'For each offer, find the rate per period and the number of periods a year, or note that the rate is continuously compounded.',
      'Convert each to an effective annual rate.',
      'Compare: the lowest EAR is the cheapest loan; the highest is the best deposit.',
      'Check what the rate leaves out: fees, the timing of payments, penalties for early repayment or withdrawal, and whether the rate is fixed or can change.',
    ] },
    { p: String.raw`Some offers state no rate at all. The supplier’s plan for Lantern’s brewer charges “0% interest” but asks for 24 payments of $1,050, <m>24 \times 1{,}050 = 25{,}200</m> dollars in all, against a cash price of $24,000. Its true rate is hidden in the payments, and finding it needs the annuity formulas of module 3. An early-payment discount on an invoice, the applied example below, is a simpler case of the same idea: a price difference that is really an interest rate.` },
  ],

  formulas: [
    { id: 'ear-periodic', name: 'Periodic rate from a nominal annual rate',
      tex: String.raw`r = \frac{\text{APR}}{m}`,
      where: [
        [String.raw`r`, 'Interest rate per compounding period, as a decimal', 'per period'],
        [String.raw`\text{APR}`, 'Nominal annual rate: the quoted yearly rate, ignoring compounding', 'per year'],
        [String.raw`m`, 'Compounding periods per year (1, 2, 4, 12, 52, 365)', ''],
      ],
      note: 'The periodic rate is the one to use in every calculation.' },
    { id: 'ear-ear', name: 'Effective annual rate',
      tex: String.raw`\text{EAR} = \left(1 + \frac{\text{APR}}{m}\right)^{m} - 1`,
      where: [
        [String.raw`\text{EAR}`, 'Effective annual rate: the equivalent rate compounded once a year', 'per year'],
        [String.raw`\text{APR}`, 'Nominal annual rate', 'per year'],
        [String.raw`m`, 'Compounding periods per year', ''],
      ],
      assumptions: 'The rate stays the same for the year; no fees.',
      note: 'Compare rates only as EARs. A US deposit APY is an EAR; a US loan APR is not.' },
    { id: 'ear-back', name: 'Nominal rate from an effective annual rate',
      tex: String.raw`\text{APR} = m\left[(1 + \text{EAR})^{1/m} - 1\right]`,
      where: [
        [String.raw`\text{APR}`, 'Nominal annual rate compounded m times a year', 'per year'],
        [String.raw`\text{EAR}`, 'Effective annual rate', 'per year'],
        [String.raw`m`, 'Compounding periods per year', ''],
      ],
      note: 'The bracket is the periodic rate. Dividing the EAR by m instead overstates the result.' },
    { id: 'ear-equiv', name: 'Equivalent rate at another compounding frequency',
      tex: String.raw`\text{APR}_2 = m_2\left[\left(1 + \frac{\text{APR}_1}{m_1}\right)^{m_1/m_2} - 1\right]`,
      where: [
        [String.raw`\text{APR}_1`, 'The quoted nominal annual rate', 'per year'],
        [String.raw`m_1`, 'Compounding periods per year of the quoted rate', ''],
        [String.raw`\text{APR}_2`, 'The equivalent nominal annual rate', 'per year'],
        [String.raw`m_2`, 'Compounding periods per year wanted', ''],
      ],
      note: 'Equivalent rates have the same EAR.' },
    { id: 'ear-continuous', name: 'Continuous compounding',
      tex: String.raw`\text{FV} = \text{PV}\,e^{\text{APR}\,t}, \qquad \text{EAR} = e^{\text{APR}} - 1`,
      where: [
        [String.raw`\text{FV}`, 'Future value after t years', '$'],
        [String.raw`\text{PV}`, 'Amount today', '$'],
        [String.raw`\text{APR}`, 'Nominal annual rate, compounded continuously', 'per year'],
        [String.raw`t`, 'Time', 'years'],
        [String.raw`e`, 'The constant 2.718282…, base of natural logarithms', ''],
        [String.raw`\text{EAR}`, 'Effective annual rate', 'per year'],
      ],
      note: 'Inverse: APR = ln(1 + EAR). The ceiling that ever more frequent compounding approaches.' },
    { id: 'ear-apy', name: 'Annual percentage yield (Regulation DD, Appendix A)',
      tex: String.raw`\text{APY} = 100\left[\left(1 + \frac{\text{Interest}}{\text{Principal}}\right)^{365/\text{Days in term}} - 1\right]`,
      where: [
        [String.raw`\text{APY}`, 'Annual percentage yield', '%'],
        [String.raw`\text{Interest}`, 'Total interest earned on the principal over the term', '$'],
        [String.raw`\text{Principal}`, 'Amount assumed deposited at the start', '$'],
        [String.raw`\text{Days in term}`, 'Actual number of days in the term (365 for an account with no fixed term)', 'days'],
      ],
      assumptions: 'US deposit accounts; banks may use 366 days in a leap year.',
      note: 'An effective annual rate: the term’s return compounded over a 365-day year.' },
  ],

  examples: [
    { level: 'simple', title: 'The true yearly cost of a store account', fictional: true,
      setup: 'A fictional furniture retailer’s store account charges 1.75% a month on any unpaid balance. What are its nominal annual rate (APR) and its effective annual rate? If a customer left a $2,000 balance unpaid for a year, how much would they owe?',
      steps: [
        String.raw`Identify the periodic rate and frequency: 1.75% a month, <m>m = 12</m>.`,
        String.raw`Nominal annual rate: <m>12 \times 1.75\% = 21\%</m>. This is the figure an APR would show.`,
        String.raw`Effective annual rate: <m>1.0175^{12} - 1 \approx 23.14\%</m>.`,
        String.raw`Balance after a year: <m>2{,}000 \times 1.0175^{12} \approx 2{,}462.88</m> dollars, against <m>2{,}000 \times 1.21 = 2{,}420</m> that the APR suggests.`,
      ],
      answer: 'An APR of 21% and an EAR of about 23.14%. A $2,000 balance left for a year grows to about $2,462.88.',
      interpretation: 'At high rates the gap between the nominal and effective rate is large: more than two percentage points here. A customer comparing this account with a loan quoted on another basis should compare 23.14%, not 21%.' },
    { level: 'challenging', title: 'Four quotes, four conventions', fictional: true,
      setup: 'A fictional catering company needs to borrow $50,000 for one year, repaying everything at the end. It has four quotes: (A) 6.9% a year compounded daily (365 days); (B) 7.0% compounded quarterly; (C) 7.15% compounded annually; (D) 6.95% compounded continuously. Rank them from cheapest to dearest, and find what the cheapest saves over the dearest.',
      steps: [
        String.raw`(A) <m>\text{EAR} = (1 + 0.069 \div 365)^{365} - 1 \approx 7.1429\%</m>.`,
        String.raw`(B) <m>\text{EAR} = (1 + 0.07 \div 4)^{4} - 1 = 1.0175^4 - 1 \approx 7.1859\%</m>.`,
        String.raw`(C) Annual compounding: the EAR is the quoted 7.15%. (D) Continuous: <m>e^{0.0695} - 1 \approx 7.1972\%</m>.`,
        'Rank by EAR: A (7.1429%), C (7.15%), B (7.1859%), D (7.1972%). The lowest quote, A, is cheapest; the second-lowest quote, D, is dearest.',
        String.raw`In dollars: interest is <m>50{,}000 \times 0.071429 \approx 3{,}571.46</m> for A and <m>50{,}000 \times 0.071972 \approx 3{,}598.60</m> for D, a difference of about $27.14.`,
      ],
      answer: 'Cheapest to dearest: A (EAR 7.1429%), C (7.15%), B (7.1859%), D (7.1972%). A saves about $27.14 of interest over D on $50,000 for a year.',
      interpretation: 'The order of the quoted rates (6.9, 6.95, 7.0, 7.15) is not the order of the costs. Converting to EARs is the only reliable comparison. The differences here are small because the quotes are close; fees, which none of these rates includes, could easily outweigh them, so the company should ask for any arrangement fee before choosing.' },
    { level: 'applied', title: 'Should Lantern take the early-payment discount?', fictional: true,
      setup: 'Suppose Lantern’s bean supplier now invoices on terms of “2/10, net 30”: Lantern may deduct 2% if it pays within 10 days; otherwise the full amount is due in 30 days. A $3,000 invoice arrives. Lantern can pay $2,940 on day 10 or $3,000 on day 30. What annual rate does skipping the discount amount to, and should Lantern take the discount? Coastline’s rate for the brewer loan, 7.2% compounded monthly, is a guide to what Lantern pays to borrow.',
      steps: [
        'Frame it as a loan: by not paying on day 10, Lantern keeps $2,940 for 20 more days and pays $60 more for it.',
        String.raw`Rate for the 20 days: <m>60 \div 2{,}940 \approx 2.0408\%</m>. Note the base is $2,940, the amount Lantern keeps, not $3,000.`,
        String.raw`Periods of 20 days in a year: <m>365 \div 20 = 18.25</m>. Nominal annual rate: <m>2.0408\% \times 18.25 \approx 37.24\%</m>.`,
        String.raw`Effective annual rate: <m>1.020408^{18.25} - 1 \approx 44.59\%</m>.`,
        String.raw`Compare with what borrowing costs: Coastline’s 7.2% compounded monthly is an EAR of about 7.44%. Paying late is roughly six times as expensive as bank credit.`,
      ],
      answer: 'Skipping the discount costs the equivalent of about 44.59% a year (37.24% as a nominal rate). Lantern should pay on day 10 and take the $60 discount, even if it had to borrow at a rate near Coastline’s to do so.',
      interpretation: 'Trade credit with a discount looks free but is often the most expensive money a small business uses. The calculation assumes Lantern pays on day 30 if it skips the discount; paying later still would lower the rate but damage its standing with the supplier. The same conversion, a rate for some days raised to the power 365 ÷ days, prices any short-term fee.' },
  ],

  demo: [
    { widget: 'ear-explorer', intro: 'Start at Coastline’s 7.2% compounded monthly. Change the number of compounding periods a year and watch the EAR, then raise the nominal rate towards 36% and see how much faster the gap between APR and EAR widens. The bars show the same rate at every common frequency, ending with continuous compounding.' },
    { widget: 'ear-convert', intro: 'Convert the March 2027 market rate, 8% compounded quarterly, to its monthly equivalent. Then try converting a monthly rate to an annual one and back: equivalent rates always share the same EAR.' },
    { widget: 'ear-discount', intro: 'Price any early-payment discount. Start with Lantern’s 2/10, net 30, then lengthen the time to pay in full and see how quickly the annual cost falls, and compare it with your own borrowing rate.' },
  ],

  mistakes: [
    { title: 'Comparing nominal rates with different compounding', html: 'In the challenging example the quotes ranked 6.9%, 6.95%, 7.0% and 7.15%, but the costs ranked A, C, B, D. Convert every rate to an EAR before comparing.' },
    { title: 'Dividing an effective rate by 12', html: 'If an investment must earn 9% a year effective, its monthly rate is 1.09^(1/12) − 1 ≈ 0.7207%, not 9% ÷ 12 = 0.75%. A monthly 0.75% compounds to about 9.38% a year. Divide only a nominal rate by m.' },
    { title: 'Using the APR as a year’s growth', html: 'At 7.2% compounded monthly, $24,000 left for a year grows by $1,786.18, not 24,000 × 0.072 = $1,728. The APR ignores the interest on interest within the year.' },
    { title: 'Overrating compounding frequency', html: 'Going from monthly to daily compounding at 7.2% raises the EAR only from 7.4424% to 7.4648%. A difference in the quoted rate, or a fee, usually matters far more than the frequency.' },
    { title: 'Treating every published rate as an EAR', html: 'A US deposit APY is an effective rate. A credit card APR is a nominal rate, and the APR on a mortgage or car loan also reflects certain fees. Check which kind of rate a number is before converting or comparing it.' },
    { title: 'Ignoring a discount because it is “only 2%”', html: 'Two per cent for 20 days is about 44.6% a year, effective. Small percentages over short periods become large annual rates; always annualise before deciding.' },
  ],

  application: [
    { p: 'Rate conversion is everyday work wherever money is borrowed, lent or valued.' },
    { p: '<b>Setting a deposit rate.</b> The product manager of a fictional credit union wants a savings account to show an APY of 4.50% and to credit interest monthly. Working backwards, the monthly rate must be 1.045^(1/12) − 1, so the account’s interest rate is 12 times that, about 4.4098% a year. Both figures go into the disclosure: the interest rate, which ignores compounding, and the APY, which includes it.' },
    { p: '<b>Building a monthly model.</b> An analyst valuing a fictional chain of gyms forecasts its cash flows month by month, but the investors’ required return is stated as 9% a year, an effective rate. She converts it to 1.09^(1/12) − 1 ≈ 0.7207% a month. Using 9% ÷ 12 = 0.75% would discount every cash flow at what amounts to about 9.38% a year and undervalue the business, a mistake that is easy to make and hard to spot in a large spreadsheet.' },
    { p: '<b>Choosing a loan.</b> The finance manager of a fictional battery-storage installer receives equipment-loan quotes compounded monthly, quarterly and semi-annually from three lenders. She converts each to an EAR, then asks each lender for its arrangement fees and early-repayment terms, because the cheapest rate is not always the cheapest loan. The lesson on loan amortisation shows how fees change a loan’s APR.' },
    { case: 'For Lantern the first comparison is done: Coastline’s 7.2% compounded monthly is an EAR of about 7.44%, cheaper than the 8% compounded quarterly (about 8.24% effective) that a loan like the note would cost today, and paying the bean supplier early is worth far more than either. What Ana still cannot tell is whether 48 payments to Coastline cost more or less than the supplier’s 24 payments of $1,050. That needs the value of a stream of payments, which module 2 begins and module 3’s lesson on annuities completes.' },
  ],

  summary: [
    'A compound rate has three descriptions: the nominal annual rate (APR) that is quoted, the periodic rate (APR ÷ m) used in calculations, and the effective annual rate (EAR) used for comparison.',
    'EAR = (1 + APR ÷ m)^m − 1; going backwards, APR = m[(1 + EAR)^(1/m) − 1]. Coastline’s 7.2% compounded monthly is an EAR of about 7.44%.',
    'More frequent compounding raises the EAR with diminishing effect, towards the continuous limit e^APR − 1. Continuously, FV = PV × e^(APR × t) and APR = ln(1 + EAR).',
    'Equivalent rates share an EAR: 8% compounded quarterly is equivalent to about 7.9473% compounded monthly.',
    'A US deposit APY, defined by Regulation DD, is an effective annual rate: 100[(1 + Interest ÷ Principal)^(365 ÷ Days in term) − 1]. Loan APRs are not EARs.',
    'Compare offers by converting each to an EAR, then check fees, payment timing and penalties.',
    'Short-term price differences are interest rates in disguise: 2/10, net 30 costs about 44.59% a year if the discount is skipped.',
  ],

  glossary: [
    { term: 'Nominal annual rate', def: 'A yearly interest rate quoted without compounding: the periodic rate multiplied by the number of periods in a year. An APR in its simple sense is a nominal annual rate.' },
    { term: 'Periodic rate', def: 'The interest rate charged or paid for one compounding period: the nominal annual rate divided by the number of periods in a year.' },
    { term: 'Equivalent rates', def: 'Rates quoted with different compounding frequencies that produce the same growth over a year, and so have the same effective annual rate.' },
    { term: 'Continuous compounding', def: 'The limit of compounding ever more often. A nominal rate compounded continuously grows an amount by the factor e^(rate × years), an effective annual rate of e^rate − 1.' },
    { term: 'Early-payment discount', def: 'A reduction in an invoice for paying before a stated date, written for example 2/10, net 30: 2% off if paid within 10 days, otherwise the full amount within 30. Also called a cash discount.' },
  ],

  references: [
    { text: 'Dahlquist, J. &amp; Knight, R. (2022). <i>Principles of Finance</i>, section 8.4, “Stated versus Effective Rates”. OpenStax.', url: 'https://openstax.org/books/principles-finance/pages/8-4-stated-versus-effective-rates', checked: '2026-10-23' },
    { text: 'Kirk, D. (2023). <i>Contemporary Mathematics</i>, section 6.4, “Compound Interest” (compounding frequency and effective annual yield). OpenStax.', url: 'https://openstax.org/books/contemporary-mathematics/pages/6-4-compound-interest', checked: '2026-10-23' },
    { text: 'Consumer Financial Protection Bureau. <i>Regulation DD (Truth in Savings), 12 CFR part 1030, Appendix A: Annual Percentage Yield Calculation</i>.', url: 'https://www.consumerfinance.gov/rules-policy/regulations/1030/a/', checked: '2026-10-23' },
    { text: 'Federal Deposit Insurance Corporation. <i>Consumer Compliance Examination Manual</i>, chapter VI-3, “Truth in Savings” (Regulation DD). Last updated May 2023.', url: 'https://www.fdic.gov/consumer-compliance-examination-manual/vi-3-truth-savings', checked: '2026-10-23' },
  ],

  checks: [
    // case facts
    { what: 'Brewer price (case)', value: B.price, shown: 24000 },
    { what: 'Brewer loan APR (case, %)', value: B.loan.apr, shown: 7.2 },
    { what: 'Brewer loan months (case)', value: B.loan.months, shown: 48 },
    { what: 'Vendor instalment (case)', value: B.vendor.instalment, shown: 1050 },
    { what: 'Vendor months (case)', value: B.vendor.months, shown: 24 },
    { what: 'Market rate for the note (case, %)', value: N.marketRateMarch2027, shown: 8 },
    { what: 'Vendor total payments', value: B.vendor.instalment * B.vendor.months, shown: 25200 },
    // three rates
    { what: 'Monthly rate (%)', value: B.loan.apr / 12, shown: 0.6 },
    { what: 'Brewer loan EAR (%, 2 dp)', value: ear(rB, 12) * 100, shown: 7.44 },
    { what: 'Brewer loan EAR (%, 4 dp)', value: ear(rB, 12) * 100, shown: 7.4424, tol: 0.00005 },
    { what: '$24,000 after a year at 0.6% a month', value: 24000 * 1.006 ** 12, shown: 25786.18 },
    { what: 'Interest for the year', value: 24000 * 1.006 ** 12 - 24000, shown: 1786.18 },
    { what: 'APR-based interest', value: 24000 * rB, shown: 1728 },
    { what: 'Interest on interest', value: 24000 * 1.006 ** 12 - 24000 - 24000 * rB, shown: 58.18 },
    // blurb
    { what: 'Blurb: 7.2% annual', value: ear(rB, 1) * 100, shown: 7.2 },
    { what: 'Blurb: 7.2% quarterly EAR', value: ear(rB, 4) * 100, shown: 7.40 },
    { what: 'Blurb: 7.2% continuous EAR', value: (Math.exp(rB) - 1) * 100, shown: 7.47 },
    // 12% table
    { what: '12% annual EAR', value: ear(0.12, 1) * 100, shown: 12 },
    { what: '12% semi periodic', value: 12 / 2, shown: 6 },
    { what: '12% semi EAR', value: ear(0.12, 2) * 100, shown: 12.36, tol: 0.00005 },
    { what: '12% quarterly periodic', value: 12 / 4, shown: 3 },
    { what: '12% quarterly EAR', value: ear(0.12, 4) * 100, shown: 12.5509, tol: 0.00005 },
    { what: '12% monthly periodic', value: 12 / 12, shown: 1 },
    { what: '12% monthly EAR', value: ear(0.12, 12) * 100, shown: 12.6825, tol: 0.00005 },
    { what: '12% weekly periodic', value: 12 / 52, shown: 0.2308, tol: 0.00005 },
    { what: '12% weekly EAR', value: ear(0.12, 52) * 100, shown: 12.7341, tol: 0.00005 },
    { what: '12% daily periodic', value: 12 / 365, shown: 0.0329, tol: 0.00005 },
    { what: '12% daily EAR', value: ear(0.12, 365) * 100, shown: 12.7475, tol: 0.00005 },
    { what: '12% continuous EAR', value: (Math.exp(0.12) - 1) * 100, shown: 12.7497, tol: 0.00005 },
    { what: 'Annual to semi-annual adds (points)', value: (ear(0.12, 2) - 0.12) * 100, shown: 0.36 },
    { what: 'Monthly to daily adds (points)', value: (ear(0.12, 365) - ear(0.12, 12)) * 100, shown: 0.065, tol: 0.0005 },
    { what: 'Daily to continuous adds (points)', value: (Math.exp(0.12) - 1 - ear(0.12, 365)) * 100, shown: 0.002, tol: 0.0005 },
    // continuous
    { what: 'e', value: Math.E, shown: 2.718282, tol: 0.0000005 },
    { what: '7.2% continuous EAR (4 dp)', value: (Math.exp(rB) - 1) * 100, shown: 7.4655, tol: 0.00005 },
    // from one rate to others
    { what: 'Monthly rate for EAR 8% (%)', value: (1.08 ** (1 / 12) - 1) * 100, shown: 0.643403, tol: 0.0000005 },
    { what: 'APR for EAR 8% monthly (%)', value: 12 * (1.08 ** (1 / 12) - 1) * 100, shown: 7.7208, tol: 0.00005 },
    { what: '8% ÷ 12 (%)', value: 8 / 12, shown: 0.6667, tol: 0.00005 },
    { what: '0.6667% a month compounds to (%)', value: ((1 + 0.08 / 12) ** 12 - 1) * 100, shown: 8.30 },
    { what: '1.006^18', value: 1.006 ** 18, shown: 1.113688, tol: 0.0000005 },
    { what: '$24,000 for 18 months', value: 24000 * 1.006 ** 18, shown: 26728.52 },
    { what: '$24,000 × 1.074424^1.5', value: 24000 * 1.074424 ** 1.5, shown: 26728.52, tol: 0.01 },
    // equivalent rates
    { what: 'Quarterly rate at 8% (%)', value: 8 / 4, shown: 2 },
    { what: '8% quarterly EAR (%)', value: ear(rQ, 4) * 100, shown: 8.2432, tol: 0.00005 },
    { what: '8% quarterly EAR (%, 2 dp)', value: ear(rQ, 4) * 100, shown: 8.24 },
    { what: 'Equivalent monthly rate (%)', value: ((1 + rQ / 4) ** (4 / 12) - 1) * 100, shown: 0.662271, tol: 0.0000005 },
    { what: 'Equivalent monthly APR (%)', value: 12 * ((1 + rQ / 4) ** (4 / 12) - 1) * 100, shown: 7.9473, tol: 0.00005 },
    { what: 'Gap to the brewer rate (points)', value: 12 * ((1 + rQ / 4) ** (4 / 12) - 1) * 100 - B.loan.apr, shown: 0.75, tol: 0.005 },
    // e limit
    { what: '(1 + 1/1)^1', value: 2, shown: 2 },
    { what: '(1 + 1/10)^10', value: 1.1 ** 10, shown: 2.593742, tol: 0.0000005 },
    { what: '(1 + 1/100)^100', value: 1.01 ** 100, shown: 2.704814, tol: 0.0000005 },
    { what: '(1 + 1/1000)^1000', value: 1.001 ** 1000, shown: 2.716924, tol: 0.0000005 },
    { what: '(1 + 1/10000)^10000', value: 1.0001 ** 10000, shown: 2.718146, tol: 0.0000005 },
    { what: 'ln 1.06 (%)', value: Math.log(1.06) * 100, shown: 5.8269, tol: 0.00005 },
    // APY
    { what: 'APY example: $61.68 is 6% monthly', value: 1000 * (1.005 ** 12 - 1), shown: 61.68 },
    { what: 'APY example: NOW account APY (%)', value: 61.68 / 1000 * 100, shown: 6.17 },
    { what: 'APY example: six-month CD (%)', value: 100 * ((1 + 30.37 / 1000) ** (365 / 182) - 1), shown: 6.18 },
    { what: 'Two-year CD: return over the term (%)', value: 832 / 10000 * 100, shown: 8.32 },
    { what: 'Two-year CD: APY (%)', value: 100 * ((1 + 832 / 10000) ** (365 / 730) - 1), shown: 4.08 },
    { what: 'Two-year CD: square-root route (%)', value: 100 * (Math.sqrt(1.0832) - 1), shown: 4.08 },
    { what: 'Two-year CD: halving (%)', value: 8.32 / 2, shown: 4.16 },
    // simple example
    { what: 'Store account APR (%)', value: 12 * 1.75, shown: 21 },
    { what: 'Store account EAR (%)', value: (1.0175 ** 12 - 1) * 100, shown: 23.14 },
    { what: 'Store balance after a year', value: 2000 * 1.0175 ** 12, shown: 2462.88 },
    { what: 'APR-based balance', value: 2000 * 1.21, shown: 2420 },
    { what: 'Gap more than two points', value: (1.0175 ** 12 - 1) * 100 - 21, shown: 2.14 },
    // challenging example
    { what: 'A: 6.9% daily EAR (%)', value: ear(0.069, 365) * 100, shown: 7.1429, tol: 0.00005 },
    { what: 'B: 7.0% quarterly EAR (%)', value: ear(0.07, 4) * 100, shown: 7.1859, tol: 0.00005 },
    { what: 'B: quarterly factor', value: 1 + 0.07 / 4, shown: 1.0175 },
    { what: 'C: 7.15% annual EAR (%)', value: ear(0.0715, 1) * 100, shown: 7.15 },
    { what: 'D: 6.95% continuous EAR (%)', value: (Math.exp(0.0695) - 1) * 100, shown: 7.1972, tol: 0.00005 },
    { what: 'A interest', value: 50000 * ear(0.069, 365), shown: 3571.46, tol: 0.01 },
    { what: 'D interest', value: 50000 * (Math.exp(0.0695) - 1), shown: 3598.60, tol: 0.01 },
    { what: 'A saves over D', value: 50000 * (Math.exp(0.0695) - 1) - 50000 * ear(0.069, 365), shown: 27.14 },
    // applied example
    { what: 'Discounted payment', value: 3000 * 0.98, shown: 2940 },
    { what: 'Discount', value: 3000 * 0.02, shown: 60 },
    { what: 'Extra days', value: 30 - 10, shown: 20 },
    { what: '20-day rate (%)', value: 60 / 2940 * 100, shown: 2.0408, tol: 0.00005 },
    { what: 'Periods a year', value: 365 / 20, shown: 18.25 },
    { what: 'Nominal annual cost (%)', value: 60 / 2940 * 18.25 * 100, shown: 37.24 },
    { what: 'Effective annual cost (%)', value: ((1 + 60 / 2940) ** (365 / 20) - 1) * 100, shown: 44.59 },
    { what: 'Effective annual cost, about (%)', value: ((1 + 60 / 2940) ** (365 / 20) - 1) * 100, shown: 44.6, tol: 0.05 },
    { what: 'About six times bank credit', value: ((1 + 60 / 2940) ** (365 / 20) - 1) / ear(rB, 12), shown: 6, tol: 0.05 },
    // mistakes
    { what: '9% effective monthly rate (%)', value: (1.09 ** (1 / 12) - 1) * 100, shown: 0.7207, tol: 0.00005 },
    { what: '9% ÷ 12 (%)', value: 9 / 12, shown: 0.75 },
    { what: '0.75% monthly compounds to (%)', value: (1.0075 ** 12 - 1) * 100, shown: 9.38 },
    { what: '7.2% daily EAR (%)', value: ear(rB, 365) * 100, shown: 7.4648, tol: 0.00005 },
    // application
    { what: 'Credit union interest rate for APY 4.5% (%)', value: 12 * (1.045 ** (1 / 12) - 1) * 100, shown: 4.4098, tol: 0.00005 },
  ],
};
