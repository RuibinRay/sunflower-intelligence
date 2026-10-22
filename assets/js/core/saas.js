// saas.js — unit economics of a subscription business: what a customer costs to win, what it is worth,
// how long it takes to earn the cost back, how efficiently sales spend turns into revenue, and whether
// existing customers grow or shrink. Pure functions; the marketing room draws them.

/**
 * @param {object} i
 *   arpa      average recurring revenue per customer per month
 *   margin    gross margin, 0–1
 *   churn     share of customers lost per month, 0–1
 *   sm        sales and marketing spend last quarter
 *   newCust   customers won last quarter
 *   netNewArr annual recurring revenue added this quarter, net of losses
 *   startArr  recurring revenue from customers a year ago, then upgrades and downgrades+cancellations since
 */
export function unitEconomics({ arpa, margin, churn, sm, newCust, netNewArr, startArr, upgrades, losses }) {
  const need = { arpa, margin, churn, sm, newCust, netNewArr, startArr, upgrades, losses };
  const missing = Object.entries(need).filter(([, v]) => !Number.isFinite(v)).map(([k]) => k);
  if (missing.length) return { error: 'Fill in every field.', missing };
  if (arpa <= 0) return { error: 'Revenue per customer has to be above zero.' };
  if (margin <= 0 || margin > 1) return { error: 'Gross margin has to be between 0% and 100%.' };
  if (churn <= 0 || churn >= 1) return { error: 'Monthly churn has to be above 0% and below 100%. With no churn at all, lifetime value is unbounded.' };
  if (newCust <= 0) return { error: 'Customers won has to be above zero to work out what one costs.' };
  if (sm < 0 || startArr <= 0 || upgrades < 0 || losses < 0) return { error: 'Spend, revenue, upgrades and losses can’t be negative, and starting revenue has to be above zero.' };

  const marginPerMonth = arpa * margin;                 // gross profit a customer brings each month
  const cac = sm / newCust;
  const ltv = marginPerMonth / churn;                   // Σ m·(1−c)^(t−1) = m / c
  const lifetimeMonths = 1 / churn;
  const paybackSimple = cac / marginPerMonth;           // ignores churn
  // with churn, the cohort's cumulative expected gross profit is m·(1 − (1−c)^t)/c; solve for when it reaches CAC
  const paybackChurn = cac < ltv ? Math.log(1 - (cac * churn) / marginPerMonth) / Math.log(1 - churn) : Infinity;
  const magic = sm > 0 ? netNewArr / sm : NaN;          // annualised net new revenue per dollar of last quarter's spend
  const nrr = (startArr + upgrades - losses) / startArr;
  const grr = Math.max(0, startArr - losses) / startArr;
  return {
    cac, ltv, ratio: ltv / cac, paybackSimple, paybackChurn, lifetimeMonths, magic, nrr, grr, marginPerMonth,
    /** expected cumulative gross profit per customer won, month by month */
    curve(months) { return Array.from({ length: months + 1 }, (_, t) => marginPerMonth * (1 - (1 - churn) ** t) / churn); },
  };
}

/** Rule-of-thumb readings. Thresholds are conventions investors use, not laws. */
export function readUnitEconomics(u) {
  const ratio = u.ratio >= 3 ? 'good' : u.ratio >= 1 ? 'warn' : 'bad';
  const payback = u.paybackSimple <= 12 ? 'good' : u.paybackSimple <= 24 ? 'warn' : 'bad';
  const magic = !Number.isFinite(u.magic) ? 'warn' : u.magic > 0.75 ? 'good' : u.magic >= 0.5 ? 'warn' : 'bad';
  const nrr = u.nrr >= 1 ? 'good' : 'warn';
  let call;
  if (ratio === 'bad' || magic === 'bad') call = { tone: 'bad', head: 'Fix the bucket before pouring more in.', text: 'Customers cost more to win than they return, or sales spend is turning into little new revenue. Work on retention, pricing or onboarding before spending more on acquisition.' };
  else if (ratio === 'good' && magic === 'good' && payback === 'good') call = { tone: 'good', head: 'Room to spend more on growth.', text: 'Each customer returns well over what it costs, the cost comes back within a year, and spend is turning into recurring revenue efficiently. More acquisition spend is likely to pay, as long as these hold as you scale.' };
  else call = { tone: 'warn', head: 'Grow, but carefully.', text: 'The business makes money on its customers, but at least one number is in the middle band. Improve the weakest one before stepping up spend.' };
  return { ratio, payback, magic, nrr, call };
}

export const PRESETS = {
  club: { label: 'Seed club (consumer subscription box)', arpa: 32, margin: 0.45, churn: 0.06, sm: 54000, newCust: 1200, netNewArr: 40000, startArr: 1150000, upgrades: 60000, losses: 600000 },
  saas: { label: 'Shop software (business subscription)', arpa: 420, margin: 0.8, churn: 0.012, sm: 900000, newCust: 150, netNewArr: 630000, startArr: 6000000, upgrades: 900000, losses: 780000 },
};
