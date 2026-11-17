// project.js — F08 applied project: Lantern's hedging policy. Hollis Avery, Lantern's 30% investor, asks for a written
// policy before Lantern signs its 2029 contracts. The student measures the exposures, prices a second euro forward,
// designs a coffee hedge that mixes Kilnworth's fixed price and its cap, stress-tests 2029 EBITDA and debt-service cover,
// and writes the policy. Every figure is computed below from case.js and checked by `verify`.
import { COFFEE as K, EURO as E, CAP, capPerKg, DERIVED as D, ebitda2029, DEBT_SERVICE_2029 as DS } from './case.js?v=39';
import { fxForward } from '../../../core/derivatives.js?v=39';
import { widgets as WH } from './why-firms-hedge.ex.js?v=39';
import { widgets as NA } from './pricing-by-no-arbitrage.ex.js?v=39';
import { widgets as OP } from './options-payoffs.ex.js?v=39';

const GRINDERS = { amount: 24_000, due: '30 June 2029', T: 0.75 };
const euroTotal = E.amount + GRINDERS.amount, perCent = euroTotal * 0.01;
const stress = 54, unhedged = ebitda2029(stress, 0), dscrUnhedged = unhedged / DS;
const F9 = fxForward({ spot: E.spot, rDomestic: E.rUsd, rForeign: E.rEur, T: GRINDERS.T });
const quote9 = Math.round((F9 + E.bankSpread) * 1e4) / 1e4, cost9 = quote9 * GRINDERS.amount;
const FIXED = 0.75, kgFixed = K.kgRoasted * FIXED, kgCapped = K.kgRoasted - kgFixed;
const policyBill = (p) => kgFixed * K.forwardPerKg + kgCapped * capPerKg(p);
const billStress = policyBill(stress), billLow = policyBill(30);
const ebitdaPolicy = D.ebitda2029 - (billStress - D.coffeeCost), dscrPolicy = ebitdaPolicy / DS;
const capFee = kgCapped * CAP.fee;
const n = (x) => Math.round(x).toLocaleString('en-US');
const r2 = (x) => x.toFixed(2);

export default {
  title: 'Lantern’s hedging policy',
  brief: [
    { p: `It is October 2028. Hollis Avery, who owns 30% of Lantern, has asked Ana for a written hedging policy before Lantern signs its 2029 contracts. He wants to know what Lantern is exposed to, how each exposure will be handled and what risk will be left. Since booking the forward for the espresso machines, Ana has also ordered two grinders from ${E.maker}, €${n(GRINDERS.amount)} due on ${GRINDERS.due}, so Lantern now owes euros on two dates.` },
    { p: 'You are working as Ana’s analyst. Measure the exposures, price the hedges on offer, design the coffee hedge, test it in a bad year for coffee, and write the policy. All figures are fictional; the method is the one a treasurer would use.' },
  ],
  deliverables: [
    'The size of Lantern’s euro and coffee exposures, and 2029 debt-service cover if coffee rose to $54 a kg with no hedge.',
    'A fair price for a nine-month euro forward for the grinders, and the dollar cost at Coastline’s quote.',
    'Lantern’s 2029 coffee bill under a policy of fixing 75% of its coffee and capping the rest.',
    '2029 EBITDA and debt-service cover under that policy in the $54 stress.',
    'A one-page hedging policy for Hollis.',
  ],
  stages: [
    {
      id: 'exposures', title: 'Measure the exposures',
      html: 'Start with the size of each risk. The coffee explorer shows 2029 EBITDA at any list price; leave the hedge at zero for now.',
      tool: { kind: 'widget', widget: WH['wh-coffee'] },
      items: [
        { id: 'f08-pj-1', type: 'num', kind: 'numerical',
          prompt: `Lantern owes €${n(E.amount)} on ${E.due} and €${n(GRINDERS.amount)} on ${GRINDERS.due}. By how many dollars does the total cost rise for each one-cent rise in the euro, if nothing is hedged?`,
          answer: perCent, check: () => (E.amount + GRINDERS.amount) * 0.01, unit: '$', places: 0, tol: 1,
          solution: `€${n(euroTotal)} × $0.01 = $${n(perCent)} for each cent.` },
        { id: 'f08-pj-2', type: 'num', kind: 'numerical',
          prompt: `Coastline watches debt-service cover (EBITDA ÷ debt service of $${n(DS)} in 2029). If Kilnworth’s list price rose to $${stress} a kg and nothing were hedged, what would 2029 cover be? Give two decimals.`,
          answer: Math.round(dscrUnhedged * 100) / 100, check: () => (D.ebitda2029 - K.kgRoasted * (stress - K.spotPerKg)) / DS, unit: '×', places: 2, tol: 0.006,
          solution: `EBITDA ${n(D.ebitda2029)} − 2,400 × (54 − 36) = ${n(unhedged)}; cover ${n(unhedged)} ÷ ${n(DS)} = ${r2(dscrUnhedged)}, down from ${r2(D.ebitda2029 / DS)}.` },
        { id: 'f08-pj-3', type: 'classify', kind: 'conceptual',
          prompt: 'Which instrument suits each of Lantern’s exposures best?',
          items: ['€38,000 due on 31 March 2029', 'Most of 2029’s coffee', 'The rest of 2029’s coffee, where Ana wants to keep the benefit of a fall', 'The fixed-rate Coastline term loan'],
          categories: ['A currency forward from Coastline', 'Kilnworth’s fixed price', 'Kilnworth’s price cap', 'No hedge needed'],
          answer: [0, 1, 2, 3],
          solution: 'Forwards fit known amounts on known dates; the cap keeps some upside on the coffee; the term loan’s rate is already fixed.' },
      ],
    },
    {
      id: 'euro', title: 'Price the second euro forward',
      html: 'The parity explorer gives the fair forward rate for any period. Set nine months for the grinders.',
      tool: { kind: 'widget', widget: NA['na-fx'] },
      items: [
        { id: 'f08-pj-4', type: 'num', kind: 'numerical',
          prompt: `Spot is $${E.spot.toFixed(4)}, the dollar rate ${(E.rUsd * 100).toFixed(1)}% and the euro rate ${(E.rEur * 100).toFixed(1)}% (annual). What is the fair nine-month forward rate ($ a euro, 4 decimals)?`,
          answer: Math.round(F9 * 1e4) / 1e4, check: () => fxForward({ spot: E.spot, rDomestic: E.rUsd, rForeign: E.rEur, T: 0.75 }), unit: '$', places: 4, tol: 0.0001,
          solution: `1.0800 × 1.045<sup>0.75</sup> ÷ 1.025<sup>0.75</sup> = $${F9.toFixed(4)}.` },
        { id: 'f08-pj-5', type: 'num', kind: 'numerical',
          prompt: `Coastline adds its usual 0.0015 to the fair rate and rounds its quote to four decimals. What will the grinders cost in dollars at Coastline’s quote?`,
          answer: Math.round(cost9 * 100) / 100, check: () => Math.round((F9 + 0.0015) * 1e4) / 1e4 * GRINDERS.amount, unit: '$', places: 2, tol: 0.01,
          solution: `Quote ${quote9.toFixed(4)}; 24,000 × ${quote9.toFixed(4)} = $${cost9.toFixed(2)}.` },
      ],
    },
    {
      id: 'coffee', title: 'Design the coffee hedge',
      html: `Ana proposes to fix 75% of 2029’s coffee (${n(kgFixed)} kg) at $${K.forwardPerKg.toFixed(2)} and to cap the other ${n(kgCapped)} kg at $${CAP.strike.toFixed(2)} for $${CAP.fee.toFixed(2)} a kg. The explorer shows the all-fixed and all-capped bills for comparison.`,
      tool: { kind: 'widget', widget: OP['op-cap'] },
      items: [
        { id: 'f08-pj-6', type: 'num', kind: 'numerical',
          prompt: `Under Ana’s policy, what is the 2029 coffee bill if Kilnworth’s list price rises to $${stress} a kg?`,
          answer: Math.round(billStress), check: () => 1800 * 37.5 + 600 * (Math.min(54, 40) + 1.2), unit: '$', places: 0, tol: 1,
          solution: `1,800 × 37.50 + 600 × (40.00 + 1.20) = 67,500 + 24,720 = $${n(billStress)}.` },
        { id: 'f08-pj-7', type: 'num', kind: 'numerical',
          prompt: 'And if the list price falls to $30.00 a kg?',
          answer: Math.round(billLow), check: () => 1800 * 37.5 + 600 * (30 + 1.2), unit: '$', places: 0, tol: 1,
          solution: `67,500 + 600 × 31.20 = $${n(billLow)}, against $${n(D.coffeeAtForward)} if everything were fixed.` },
      ],
    },
    {
      id: 'stress', title: 'Test the policy in a bad year',
      html: 'Hollis’s question is what the policy leaves Lantern in a bad year for coffee. Use the $54 stress again.',
      items: [
        { id: 'f08-pj-8', type: 'num', kind: 'numerical',
          prompt: `With the policy in place and coffee at $${stress} a kg, what is 2029 debt-service cover? Give two decimals.`,
          answer: Math.round(dscrPolicy * 100) / 100, check: () => (D.ebitda2029 - (billStress - D.coffeeCost)) / DS, unit: '×', places: 2, tol: 0.006,
          solution: `EBITDA ${n(D.ebitda2029)} − (${n(billStress)} − ${n(D.coffeeCost)}) = ${n(ebitdaPolicy)}; cover ${n(ebitdaPolicy)} ÷ ${n(DS)} = ${r2(dscrPolicy)}, against ${r2(dscrUnhedged)} unhedged.` },
        { id: 'f08-pj-9', type: 'mc', kind: 'applied',
          prompt: 'Which risk does Ana’s policy leave with Lantern?',
          options: ['That Kilnworth cannot deliver at the agreed prices', 'Any rise in the euro before 31 March 2029', 'A rise in the price of the 75% it fixes', 'Interest on the fixed-rate term loan'],
          answer: 0,
          feedback: { 1: 'The euro bills are covered by forwards.', 2: 'The fixed price removes that risk.', 3: 'The term loan’s rate is fixed already.' },
          solution: 'Both coffee hedges are contracts with Kilnworth: if it failed, Lantern would be back in the market at whatever price prevailed. The policy should name that counterparty risk and how it will be watched.' },
      ],
    },
    {
      id: 'policy', title: 'Write the policy',
      html: 'Write the policy Hollis asked for. Lead with what is hedged and why, then the instruments and limits, then what remains and how it is reported.',
      items: [
        { id: 'f08-pj-10', type: 'short', kind: 'applied',
          prompt: 'Write Lantern’s hedging policy for 2029 (200–300 words).',
          rubric: [
            'States the purpose: to protect debt-service cover and the business plan, not to make money from prices.',
            'Lists each exposure with its size (coffee $2,400 a $1 a kg; €62,000 on two dates) and how it is hedged.',
            'Sets limits: the share of each exposure hedged, the instruments allowed, the counterparties, and that no hedge may exceed the exposure.',
            'Shows the effect: debt-service cover in the $54 stress with and without the policy, and the cost of the cap’s fee.',
            'Names what remains (Kilnworth’s counterparty risk, coffee needs beyond 2029) and how hedges will be reported to Hollis.',
          ],
          model: `<b>Purpose.</b> Lantern hedges to protect its 2029 debt-service cover and its plan, not to profit from price moves. <b>Coffee.</b> Each $1 a kg on Kilnworth’s price moves EBITDA by $2,400. Lantern fixes 75% of 2029’s coffee (${n(kgFixed)} kg) at $37.50 and caps the other ${n(kgCapped)} kg at $40.00 for $${n(capFee)} up front. In a stress with coffee at $54, cover would be ${r2(dscrPolicy)} with the policy against ${r2(dscrUnhedged)} without it; if coffee falls to $30, the bill is $${n(billLow)}. <b>Euros.</b> Lantern owes €${n(euroTotal)} ($${n(perCent)} for each cent on the euro). Both bills are bought forward from Coastline: €${n(E.amount)} at $${D.euroBank.toFixed(4)} and €${n(GRINDERS.amount)} at $${quote9.toFixed(4)}, each within 0.2 cents of interest-rate parity. <b>Interest.</b> The Coastline term loan is fixed; the line of credit is to be repaid in 2029; no swap is needed. <b>Limits.</b> Only forwards with Coastline and fixed-price or capped contracts with suppliers; no futures; no hedge larger than a contracted or budgeted need; hedges for 2030 not more than 50% of the forecast need. Ana approves each hedge; Hollis is told of any above $20,000. <b>What remains.</b> Kilnworth’s ability to deliver; coffee needs after 2029; quantities above forecast. <b>Reporting.</b> Each quarter Lantern reports its hedges, their value at market prices and the exposure left, alongside the actual-versus-forecast report Coastline receives.` },
      ],
    },
  ],
  rubric: [
    'Each exposure is measured before a hedge is chosen, and the hedge matches the exposure’s quantity and dates.',
    'Forward prices are checked against interest-rate parity before they are accepted.',
    'The coffee policy’s cost and its effect in a stress are both shown, with the stress chosen for its relevance to the lender.',
    'The policy sets limits that stop hedging turning into speculation.',
    'The risks that remain, including counterparty risk, are named, with how they will be reported.',
  ],
  verify() {
    return [
      ['euro exposure a cent', perCent, 620, 1e-9],
      ['unhedged EBITDA at $54', unhedged, 41493.2, 0.05],
      ['unhedged DSCR at $54', dscrUnhedged, 1.69, 0.005],
      ['nine-month forward', F9, 1.0958, 0.00005],
      ['grinders at quote', cost9, 26335.2, 0.05],
      ['policy bill at $54', billStress, 92220, 1e-9],
      ['policy bill at $30', billLow, 86220, 1e-9],
      ['policy EBITDA at $54', ebitdaPolicy, 78873.2, 0.05],
      ['policy DSCR at $54', dscrPolicy, 3.21, 0.005],
      ['cap fee', capFee, 720, 1e-9],
    ];
  },
};
