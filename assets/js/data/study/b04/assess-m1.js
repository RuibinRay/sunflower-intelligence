// assess-m1.js — B04 module 1 test: Describing data and chance (describing-distributions, probability,
// discrete-distributions). New questions on new businesses, not copies of lesson exercises. No hints; solutions are
// shown when the student reviews the test. Sunnyfold Gym, Glenholt Hotel, Mossgate Clinic, Fairway Contact Centre and
// all their numbers are fictional. Formula items are marked by their results; every num item's `check` recomputes its
// answer.
import { binomPmf, binomSf, poissonSf, normCdf } from '../../../core/inference.js?v=20';

const sum = (a) => a.reduce((s, x) => s + x, 0);
const mean = (a) => sum(a) / a.length;
const sdS = (a) => { const m = mean(a); return Math.sqrt(sum(a.map((x) => (x - m) ** 2)) / (a.length - 1)); };
const col = (letter, from, values) => Object.fromEntries(values.map((v, i) => [`${letter}${from + i}`, v]));
const f = (v, d = 3) => v.toFixed(d);

// Sunnyfold Gym: visits last month by 30 members chosen at random
const VISITS = [2, 4, 5, 3, 8, 12, 6, 1, 0, 7, 9, 4, 3, 22, 5, 6, 2, 10, 4, 15, 3, 7, 5, 1, 11, 6, 4, 2, 18, 5];
const vm = mean(VISITS), vs = sdS(VISITS);
const within2 = VISITS.filter((v) => Math.abs(v - vm) <= 2 * vs).length, within1 = VISITS.filter((v) => Math.abs(v - vm) <= vs).length;
// Fairway Contact Centre: 1,000 contacts by channel and whether resolved first time
const FC = { phone: [420, 180], chat: [260, 140] };
const notResolved = FC.phone[1] + FC.chat[1];

export const items = [
  // ---------------------------------------------------------------- describing-distributions
  {
    id: 'b04-m1-1', lesson: 'describing-distributions', type: 'formula', kind: 'numerical',
    prompt: 'Sunnyfold Gym (fictional) recorded last month’s visits for 30 members in B2:B31; E1 holds their mean and E2 their sample standard deviation. In E4, calculate the share of the 30 members whose visits lie within two standard deviations of the mean, as a check of the empirical rule.',
    sheet: { cells: { A1: 'Member', B1: 'Visits', D1: 'Mean', E1: '=AVERAGE(B2:B31)', D2: 'SD (sample)', E2: '=STDEV.S(B2:B31)', D4: 'Share within 2 SD', ...col('A', 2, VISITS.map((_, i) => `M${String(i + 1).padStart(2, '0')}`)), ...col('B', 2, VISITS) } },
    cell: 'E4', answer: '=COUNTIFS(B2:B31,">="&E1-2*E2,B2:B31,"<="&E1+2*E2)/COUNT(B2:B31)',
    alt: ['=COUNTIFS(B2:B31,">="&(E1-2*E2),B2:B31,"<="&(E1+2*E2))/30', '=(COUNTIF(B2:B31,"<="&E1+2*E2)-COUNTIF(B2:B31,"<"&E1-2*E2))/COUNT(B2:B31)'],
    view: 'A1:E31', maxHeight: '20rem', formats: { E1: '0.00', E2: '0.00', E4: '0.0%' }, widths: { D: 17 },
    wrong: [
      { formula: '=COUNTIFS(B2:B31,">="&E1-E2,B2:B31,"<="&E1+E2)/COUNT(B2:B31)', say: 'Those limits are one standard deviation from the mean. For two, use E1-2*E2 and E1+2*E2.' },
      { formula: '=COUNTIFS(B2:B31,">="&E1-2*E2,B2:B31,"<="&E1+2*E2)', say: 'That is the number of members, not the share. Divide by COUNT(B2:B31).' },
      { formula: '=COUNTIFS(B2:B31,">=E1-2*E2",B2:B31,"<=E1+2*E2")/COUNT(B2:B31)', say: 'Inside quotes, E1-2*E2 is text, not a calculation. Join the operator to the calculated limit: <x>">="&E1-2*E2</x>.' },
    ],
    solution: `<x>=COUNTIFS(B2:B31,">="&E1-2*E2,B2:B31,"<="&E1+2*E2)/COUNT(B2:B31)</x>. The mean is ${f(vm, 2)} visits and the SD ${f(vs, 2)}, so the limits are ${vm - 2 * vs < 0 ? '−' : ''}${f(Math.abs(vm - 2 * vs), 2)} and ${f(vm + 2 * vs, 2)}: ${within2} of 30 members (${(within2 / 30 * 100).toFixed(1)}%) lie inside. With 30 members, the empirical rule’s 95% would be 28.5, so the two-SD share is close to it and doesn’t reveal the shape. The right skew shows elsewhere: the lower limit is negative, two members came 18 and 22 times, and ${(within1 / 30 * 100).toFixed(1)}% lie within one SD against the rule’s 68%. Chebyshev’s minimum of 75% within two SDs holds, as it must.`,
  },
  {
    id: 'b04-m1-2', lesson: 'describing-distributions', type: 'num', kind: 'applied',
    prompt: 'Glenholt Hotel (fictional) had nightly room revenue with mean $8,400 and standard deviation $1,900 over the 365 nights of last year. Its distribution is unknown. At least how many nights must have had revenue between $5,550 and $11,250? Give a whole number of nights.',
    answer: 203, check: () => Math.ceil(365 * (1 - 1 / ((11250 - 8400) / 1900) ** 2)), unit: 'nights', places: 0, tol: 0.5,
    wrong: [
      { value: Math.round(365 * (2 * normCdf(1.5) - 1)), say: 'About 86.6% would lie within 1.5 SDs of a normal distribution, but the shape is unknown. Only Chebyshev’s inequality is guaranteed: 1 − 1/1.5².' },
      { value: Math.round(365 * (1 - 1 / 1.5)), say: 'Chebyshev’s bound squares k: 1 − 1/1.5² ≈ 0.556, not 1 − 1/1.5.' },
      { value: Math.floor(365 * (1 - 1 / 1.5 ** 2)), say: '365 × 0.556 = 202.8, and a number of nights that is at least 202.8 must be at least 203: round up, not down.' },
    ],
    solution: 'The limits are $8,400 ± $2,850, and $2,850 ÷ $1,900 = 1.5 standard deviations. By Chebyshev’s inequality at least 1 − 1/1.5² = 1 − 0.444 = 0.556 of the nights lie within them: 0.556 × 365 = 202.8, so at least 203 nights. Without knowing the shape, nothing stronger can be said.',
  },
  {
    id: 'b04-m1-3', lesson: 'describing-distributions', type: 'num', kind: 'numerical',
    prompt: 'Mossgate Clinic’s medicine fridge (fictional) logs its temperature every hour. Over a month the readings had a mean of 4.6 °C and a standard deviation of 0.8 °C. A new monitor reports in degrees Fahrenheit, F = 32 + 1.8 × C. What is the standard deviation of the month’s readings in °F? Give two decimal places.',
    answer: 1.44, check: () => Math.abs(1.8) * 0.8, unit: '°F', places: 2, tol: 0.005,
    wrong: [
      { value: 33.44, say: 'Adding 32 shifts every reading, and the mean, by the same amount, so it doesn’t change the spread. Only the multiplier 1.8 does.' },
      { value: 0.8, say: 'A degree Fahrenheit is smaller than a degree Celsius, so the same spread is 1.8 times as many degrees: s_F = 1.8 × s_C.' },
      { value: Number((1.8 ** 2 * 0.8).toFixed(2)), say: 'Squaring the multiplier is right for the variance, not for the standard deviation: s_F = |1.8| × 0.8.' },
    ],
    solution: 'With y = 32 + 1.8x, the standard deviation is |1.8| × 0.8 = 1.44 °F; the 32 moves the mean (to 32 + 1.8 × 4.6 = 40.28 °F) but not the spread. The variance becomes 1.8² × 0.64 ≈ 2.07. A coefficient of variation would change with the switch (0.8 ÷ 4.6 against 1.44 ÷ 40.28), a sign that it means nothing on scales without a true zero.',
  },
  {
    id: 'b04-m1-4', lesson: 'describing-distributions', type: 'mc', kind: 'conceptual',
    prompt: 'Sunnyfold’s North branch members average 12 visits a month with a standard deviation of 3; its South branch members average 20 with a standard deviation of 4. Which statement is right?',
    options: [
      'South has the larger SD but the smaller spread for its mean: a CV of 20% against North’s 25%.',
      'South is more variable in every sense, because its standard deviation is the larger of the two.',
      'The two branches’ spreads can’t be compared at all, because their mean visits are different.',
      'North is more consistent than South, because its standard deviation is smaller by one visit.',
    ],
    answer: 0,
    feedback: {
      1: 'In visits, yes; relative to how often members come, no. The CV compares spread relative to the mean.',
      2: 'They can: the coefficient of variation divides each SD by its own mean.',
      3: 'North’s SD is smaller in visits, but relative to its mean of 12 its spread is larger: 25% against 20%.',
    },
    solution: 'CV = SD ÷ mean: North 3 ÷ 12 = 25%, South 4 ÷ 20 = 20%. South varies more in absolute visits, but less relative to its mean. Visits are counts with a true zero, so the CV is meaningful here.',
  },
  // ---------------------------------------------------------------- probability
  {
    id: 'b04-m1-5', lesson: 'probability', type: 'formula', kind: 'applied',
    prompt: 'At Mossgate Clinic each booked patient misses an appointment with the probability in B1, independently of the others, and B2 patients are booked into a session. In B4, calculate the probability that at least one of them misses the appointment.',
    sheet: { cells: { A1: 'P(a patient misses)', B1: 0.1, A2: 'Patients booked', B2: 12, A4: 'P(at least one miss)' }, vary: { B1: [0.05, 0.12, 0.08], B2: [10, 15, 8] } },
    cell: 'B4', answer: '=1-(1-B1)^B2',
    alt: ['=1-BINOM.DIST(0,B2,B1,FALSE)', '=1-POWER(1-B1,B2)'],
    view: 'A1:B4', formats: { B1: '0.00', B4: '0.0000' }, widths: { A: 22 },
    wrong: [
      { formula: '=B1*B2', say: 'Adding the twelve probabilities counts sessions with two or more misses several times, and can exceed 1. Use the complement: 1 − P(nobody misses).' },
      { formula: '=(1-B1)^B2', say: 'That is the probability that nobody misses. At least one miss is its complement: 1 − (1 − B1)^B2.' },
      { formula: '=1-B1^B2', say: 'B1^B2 is the probability that everyone misses. The complement of “at least one misses” is “nobody misses”, (1 − B1)^B2.' },
    ],
    solution: `<x>=1-(1-B1)^B2</x>. Each patient attends with probability 1 − 0.1 = 0.9; by independence all 12 attend with probability 0.9¹² ≈ ${f(0.9 ** 12, 4)}, so at least one misses with probability ${f(1 - 0.9 ** 12, 4)}. Small risks per patient add up to a gap in almost three sessions out of four, which is why Mossgate overbooks (item 10).`,
  },
  {
    id: 'b04-m1-6', lesson: 'probability', type: 'num', kind: 'numerical',
    prompt: `Fairway Contact Centre (fictional) handled 1,000 contacts last week: phone ${FC.phone[0]} resolved first time and ${FC.phone[1]} not; chat ${FC.chat[0]} resolved and ${FC.chat[1]} not. A contact that was not resolved first time is picked at random. What is the probability it came by chat? Give three decimal places.`,
    answer: Number(f(FC.chat[1] / notResolved)), check: () => FC.chat[1] / (FC.phone[1] + FC.chat[1]), unit: '', places: 3, tol: 0.0005,
    wrong: [
      { value: Number(f(FC.chat[1] / sum(FC.chat))), say: 'That is P(not resolved | chat): 140 ÷ 400. Here the condition is “not resolved”, so divide by the 320 unresolved contacts.' },
      { value: Number(f(FC.chat[1] / 1000)), say: 'That is the joint probability P(chat and not resolved). Condition on the unresolved contacts by dividing by their total.' },
      { value: Number(f(sum(FC.chat) / 1000)), say: 'That is P(chat) for all contacts. Knowing the contact wasn’t resolved changes the probability.' },
    ],
    solution: `P(chat | not resolved) = ${FC.chat[1]} ÷ (${FC.phone[1]} + ${FC.chat[1]}) = ${FC.chat[1]} ÷ ${notResolved} ≈ ${f(FC.chat[1] / notResolved)}. Chat is ${f(sum(FC.chat) / 1000, 2)} of all contacts but ${f(FC.chat[1] / notResolved, 2)} of the unresolved ones.`,
  },
  {
    id: 'b04-m1-7', lesson: 'probability', type: 'num', kind: 'applied',
    prompt: 'Fairway’s speech-analytics tool flags calls that may be complaints so that a supervisor can call the customer back. 5% of calls are complaints and the tool flags 90% of them. Supervisors want at least 70% of flagged calls to be real complaints. At most what share of the other calls may the tool flag (its false-positive rate)? Give a percentage to one decimal place.',
    answer: Number((100 * 0.05 * 0.9 * (1 - 0.7) / (0.7 * 0.95)).toFixed(1)), check: () => 100 * 0.045 * 0.3 / (0.7 * 0.95), unit: '%', places: 1, tol: 0.05,
    wrong: [
      { value: Number((100 * 0.045 * 0.3 / 0.7).toFixed(1)), say: 'The false-positive rate applies only to the 95% of calls that aren’t complaints: the false alarms are 0.95 × f, not f.' },
      { value: Number((100 * 0.9 * 0.3 / 0.7).toFixed(1)), say: 'That uses the share of complaints flagged (0.9) without the base rate. Flagged complaints are 0.05 × 0.9 = 0.045 of all calls.' },
      { value: 30, say: '30% is the share of flags that may be false, not the rate at which other calls are flagged. Solve 0.045 ÷ (0.045 + 0.95f) = 0.7 for f.' },
    ],
    solution: `Write f for the false-positive rate. Flagged complaints are 0.05 × 0.9 = 0.045 of all calls and false alarms 0.95f, so P(complaint | flag) = 0.045 ÷ (0.045 + 0.95f). For this to be at least 0.7: 0.045 ≥ 0.7 × 0.045 + 0.7 × 0.95f, so 0.0135 ≥ 0.665f and f ≤ ${(0.0135 / 0.665).toFixed(4)}, about ${(100 * 0.0135 / 0.665).toFixed(1)}%. Because complaints are rare (5%), the tool must flag no more than about one ordinary call in fifty; at 6% only ${(100 * 0.045 / (0.045 + 0.057)).toFixed(0)}% of flags would be complaints.`,
  },
  {
    id: 'b04-m1-8', lesson: 'probability', type: 'mc', kind: 'conceptual',
    prompt: 'For two events, P(A) = 0.3, P(B) = 0.5 and P(A and B) = 0.15. Which description is right?',
    options: [
      'A and B are independent events, not mutually exclusive.',
      'A and B are mutually exclusive, and not independent.',
      'A and B are both independent and mutually exclusive.',
      'A and B are neither independent events nor mutually exclusive.',
    ],
    answer: 0,
    feedback: {
      1: 'Mutually exclusive events have P(A and B) = 0, but here it is 0.15.',
      2: 'Events with positive probabilities can’t be both: if A rules B out, knowing A changes B’s probability to 0.',
      3: 'Check the product: P(A) × P(B) = 0.3 × 0.5 = 0.15, which equals P(A and B).',
    },
    solution: 'P(A) × P(B) = 0.15 = P(A and B), so A and B are independent (equivalently, P(A | B) = 0.15 ÷ 0.5 = 0.3 = P(A)). They can happen together (P(A and B) > 0), so they are not mutually exclusive.',
  },
  // ---------------------------------------------------------------- discrete-distributions
  {
    id: 'b04-m1-9', lesson: 'discrete-distributions', type: 'formula', kind: 'numerical',
    prompt: 'Calls reach Fairway’s helpline as a Poisson process with the mean per minute in B1. In B4, calculate the probability that more than B2 calls arrive in a minute, the most the day’s staff can answer at once.',
    sheet: { cells: { A1: 'Calls a minute (mean)', B1: 4.2, A2: 'Calls the staff can answer', B2: 6, A4: 'P(more than B2 calls)' }, vary: { B2: [5, 7, 8] } },
    cell: 'B4', answer: '=1-POISSON.DIST(B2,B1,TRUE)',
    alt: ['=1-POISSON.DIST(B2,B1,1)'],
    view: 'A1:B4', formats: { B4: '0.0000' }, widths: { A: 26 },
    wrong: [
      { formula: '=1-POISSON.DIST(B2-1,B1,TRUE)', say: 'That is P(at least B2 calls), which includes exactly B2. “More than B2” is 1 − P(X ≤ B2).' },
      { formula: '=POISSON.DIST(B2,B1,FALSE)', say: 'That is P(exactly B2 calls). More than B2 means B2 + 1 calls or more: 1 − POISSON.DIST(B2,B1,TRUE).' },
      { formula: '=1-POISSON.DIST(B2,B1,FALSE)', say: 'FALSE gives the probability of exactly B2. Subtract the cumulative probability, with TRUE.' },
    ],
    solution: `<x>=1-POISSON.DIST(B2,B1,TRUE)</x> = 1 − P(X ≤ 6) ≈ ${f(poissonSf(6, 4.2), 4)} with a mean of 4.2. About one minute in ${Math.round(1 / poissonSf(6, 4.2))} brings more calls than the staff can answer at once, if the rate is really constant.`,
  },
  {
    id: 'b04-m1-10', lesson: 'discrete-distributions', type: 'formula', kind: 'applied',
    prompt: 'Mossgate books B1 patients into a session with B3 slots, because each patient turns up with the probability in B2, independently. In B5, calculate the probability that more patients turn up than there are slots.',
    sheet: { cells: { A1: 'Patients booked', B1: 22, A2: 'P(a patient turns up)', B2: 0.9, A3: 'Slots', B3: 20, A5: 'P(more than B3 turn up)' }, fixed: ['B1'], vary: { B2: [0.85, 0.8, 0.95], B3: [19, 21, 18] } },
    cell: 'B5', answer: '=1-BINOM.DIST(B3,B1,B2,TRUE)',
    alt: ['=BINOM.DIST.RANGE(B1,B2,B3+1,B1)', '=1-BINOM.DIST(B3,B1,B2,1)'],
    view: 'A1:B5', formats: { B2: '0.00', B5: '0.0000' }, widths: { A: 24 },
    wrong: [
      { formula: '=1-BINOM.DIST(B3-1,B1,B2,TRUE)', say: 'That is P(at least B3 turn up), which includes a session that exactly fills every slot. Too many means B3 + 1 or more: 1 − BINOM.DIST(B3,B1,B2,TRUE).' },
      { formula: '=1-BINOM.DIST(B3,B1,1-B2,TRUE)', say: 'B2 is already the probability of turning up, the “success” being counted. Don’t use 1 − B2.' },
      { formula: '=BINOM.DIST(B3,B1,B2,FALSE)', say: 'That is the probability that exactly B3 turn up. The question asks for more than B3.' },
    ],
    solution: `The number who turn up is binomial with n = 22 and p = 0.9. <x>=1-BINOM.DIST(B3,B1,B2,TRUE)</x> = P(X ≥ 21) = P(21) + P(22) ≈ ${f(binomPmf(21, 22, 0.9), 4)} + ${f(binomPmf(22, 22, 0.9), 4)} = ${f(binomSf(20, 22, 0.9), 4)}. Overbooking by two leaves about one session in three with more patients than slots.`,
  },
  {
    id: 'b04-m1-11', lesson: 'discrete-distributions', type: 'num', kind: 'numerical',
    prompt: 'At 6 pm Glenholt has one room left. Listing it on a last-minute site sells it for $90 with probability 0.6 (otherwise it stays empty). Holding it for a walk-in guest sells it for $150 with probability 0.3 (otherwise it stays empty). By how much does the better option’s expected revenue exceed the other’s? Give whole dollars.',
    answer: 9, check: () => Math.abs(0.6 * 90 - 0.3 * 150), unit: '$', places: 0, tol: 0.5,
    wrong: [
      { value: 60, say: 'That compares the prices as if each sale were certain. Weight each price by its probability: 0.6 × $90 against 0.3 × $150.' },
      { value: 54, say: 'That is the expected revenue from listing the room. The question asks how much more it is than holding the room ($45).' },
      { value: 45, say: 'That is the expected revenue from holding the room. Compare it with listing: 0.6 × $90 = $54.' },
    ],
    solution: 'E(list) = 0.6 × $90 + 0.4 × $0 = $54; E(hold) = 0.3 × $150 + 0.7 × $0 = $45. Listing has the higher expected revenue, by $9. Listing is also less risky: it earns something 60% of the time against 30%.',
  },
  {
    id: 'b04-m1-12', lesson: 'discrete-distributions', type: 'mc', kind: 'conceptual',
    prompt: 'Over 300 five-minute intervals, check-ins at Sunnyfold Gym’s front desk had a mean of 4.2 and a variance of 9.8. What does that suggest about a Poisson model with λ = 4.2 check-ins per interval?',
    options: [
      'Check-ins are overdispersed: busy and quiet spells are more frequent than it predicts.',
      'The model fits well, because a Poisson’s variance is usually about twice its mean.',
      'The model should use λ = 9.8, the variance, since that is the larger of the two values.',
      'The model is fine, because the mean is above 4, the minimum a Poisson needs to be used.',
    ],
    answer: 0,
    feedback: {
      1: 'A Poisson’s variance equals its mean. 9.8 against 4.2 is a sign the rate isn’t constant or check-ins aren’t independent.',
      2: 'λ is the mean number of events. Swapping in the variance doesn’t fix a model whose mean and variance should be equal.',
      3: 'The Poisson has no minimum mean; the issue is that the variance is far above the mean.',
    },
    solution: 'For a Poisson count the variance equals the mean. A variance of 9.8 against a mean of 4.2 is overdispersion: check-ins bunch, for example before each class starts and when friends arrive together, so the model would understate how often the desk is overwhelmed. Staffing should be planned from the observed busy intervals, or from a model with a varying rate.',
  },
];
