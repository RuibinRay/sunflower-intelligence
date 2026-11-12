// case.js — the B06 Regression Analysis story: Lantern Coffee Co. in 2027. B05 left Ana with correlations; B06 fits
// lines and models to the same cafés' daily log (B05's data, re-exported here with the columns regression needs),
// adds the loyalty-app members who joined in October 2027 for logistic regression, and, for the project, her catering
// quotes for events in 2027. Every name and number is invented for teaching; tools/study/b05-data.py and
// tools/study/b06-data.py generate the data with relationships planted (their headers list them), so every method can
// be checked against what is known to be true.
//
// Agrees with other courses (checked in IDENTITIES): the café log is B05's (F03's cafés, opened 1 March 2027, $236,000
// of sales); each October member row is one of the log's daily sign-ups; the project's quotes use B03's January 2027
// quote sheet, and the won events' invoices total F03's $85,880 of 2027 catering invoiced on 30-day terms (the law
// firm's contract events and the two January events prepaid in 2026 are not in the quotes).
import { CAFE_COLUMNS, CAFE_ROWS, CLEAN_ROWS, SLIP, column as b05column, DERIVED as B05 } from '../b05/case.js?v=31';
import { QUOTE_COLUMNS, QUOTES, PRICE_TEST_START, MEMBER_COLUMNS, MEMBERS } from './data.js?v=31';
import { FACTS as F03 } from '../f03/case.js?v=31';
import { QUOTE } from '../b03/case.js?v=31';
import * as R from '../../../core/regression.js?v=31';

export { CAFE_COLUMNS, CAFE_ROWS, CLEAN_ROWS, SLIP, MEMBER_COLUMNS, MEMBERS };
/** The project's data (lessons, exercises and module tests must not use these). */
export { QUOTE_COLUMNS, QUOTES, PRICE_TEST_START };

const WEEKEND = ['Sat', 'Sun'];
/** A column of the café log (B05's), optionally for one café and from the raw log. Besides B05's columns and derived
 *  columns (iced_share, avg_ticket, peak_load, day), B06 adds: weekend (1 on Saturdays and Sundays), millbrook (1 for
 *  Millbrook's rows), festival01 (1 on a festival day), month (3–12), log_footfall and log_sales (natural logs), and
 *  build_up (the new cafés' build-up over their first four months, as the generator plants it: min(day − 1, 120) ÷ 120,
 *  0 on 1 March rising to 1 from 29 June). */
export function column(name, opts = {}) {
  const extra = {
    weekend: () => b05column('weekday', opts).map((d) => (WEEKEND.includes(d) ? 1 : 0)),
    millbrook: () => b05column('cafe', opts).map((c) => (c === 'Millbrook' ? 1 : 0)),
    festival01: () => b05column('festival', opts).map((f) => (f ? 1 : 0)),
    month: () => b05column('date', opts).map((d) => +d.slice(5, 7)),
    log_footfall: () => b05column('footfall', opts).map(Math.log),
    log_sales: () => b05column('sales', opts).map(Math.log),
    build_up: () => b05column('day', opts).map((d) => Math.min(d - 1, 120) / 120),
  }[name];
  return extra ? extra() : b05column(name, opts);
}

const mAt = (n) => MEMBER_COLUMNS.indexOf(n);
/** A column of the October 2027 loyalty joiners, optionally for one café. Derived: weekend (joined on a Saturday or
 *  Sunday), millbrook (joined at Millbrook). */
export function member(name, { cafe = null } = {}) {
  const rows = MEMBERS.filter((r) => !cafe || r[mAt('cafe')] === cafe);
  if (name === 'weekend') return rows.map((r) => (new Date(`${r[mAt('joined')]}T12:00:00Z`).getUTCDay() % 6 === 0 ? 1 : 0));
  if (name === 'millbrook') return rows.map((r) => (r[mAt('cafe')] === 'Millbrook' ? 1 : 0));
  if (mAt(name) < 0) throw new Error(`b06 case: no member column ${name}`);
  return rows.map((r) => r[mAt(name)]);
}

const qAt = (n) => QUOTE_COLUMNS.indexOf(n);
/** A column of the project's quotes. Derived: lead (days from quote to event), high_rate (1 if quoted at $7.00),
 *  in_test (1 if sent on or after the price test began). */
export function quote(name) {
  if (name === 'lead') return QUOTES.map((r) => Math.round((Date.parse(r[qAt('event')]) - Date.parse(r[qAt('sent')])) / 864e5));
  if (name === 'high_rate') return QUOTES.map((r) => (r[qAt('rate')] === 7 ? 1 : 0));
  if (name === 'in_test') return QUOTES.map((r) => (r[qAt('sent')] >= PRICE_TEST_START ? 1 : 0));
  if (qAt(name) < 0) throw new Error(`b06 case: no quote column ${name}`);
  return QUOTES.map((r) => r[qAt(name)]);
}
/** B03's quote sheet as it stands from January 2027, at a given price per guest: $30 an hour for the first three hours of
 *  service, then $30 an hour for each barista (one per 40 guests or part of 40) beyond the third (B03, what-if
 *  analysis), plus setup, the price per guest and the pastry platter, with the $300 minimum, day by day. */
export const baristas = (guests) => Math.ceil(guests / 40);
export const quoted = (guests, hours, pastries, days, rate) => Math.max(QUOTE.minimum, days * (QUOTE.setup + rate * guests
  + QUOTE.perHour * Math.min(hours, 3) + QUOTE.perHour * baristas(guests) * Math.max(hours - 3, 0) + (pastries ? QUOTE.platter : 0)));

// ---------------------------------------------------------------- headline figures shared by the lessons
const H = { cafe: 'Harbourside' }, M = { cafe: 'Millbrook' };
export const DERIVED = {
  rows: CLEAN_ROWS.length,
  // the chain B05 stopped at: sales on transactions, café by café
  salesOnTransH: R.fit(column('sales', H), { Transactions: column('transactions', H) }),
  salesOnTransM: R.fit(column('sales', M), { Transactions: column('transactions', M) }),
  // footfall on the weather and the calendar, both cafés, with the café × weekend interaction
  footfallModel: R.fit(column('footfall'), { 'High (°F)': column('high_f'), 'Rain (in)': column('rain_in'), Millbrook: column('millbrook'),
    Weekend: column('weekend'), 'Millbrook × Weekend': R.interaction(column('millbrook'), column('weekend')), Festival: column('festival01') }),
  // the loyalty joiners
  members: MEMBERS.length, returned: member('returned').reduce((s, v) => s + v, 0),
  returnModel: R.logistic(member('returned'), { Near: member('near'), Notifications: member('notifications'), 'First ticket ($)': member('first_ticket'),
    Millbrook: member('millbrook'), Weekend: member('weekend') }),
};

const at = (n) => CAFE_COLUMNS.indexOf(n);
const octJoins = (cafe) => { const rows = CLEAN_ROWS.filter((r) => r[at('cafe')] === cafe); let n = 0; rows.forEach((r, i) => { if (r[at('date')].startsWith('2027-10')) n += r[at('loyalty_members')] - rows[i - 1][at('loyalty_members')]; }); return n; };
const wonInvoices = QUOTES.filter((r) => r[qAt('won')] === 1).map((r) => r[qAt('invoice')]);
export const IDENTITIES = [
  ['the café log is B05’s (612 rows, $236,000 of sales)', CLEAN_ROWS.length === 612 && Math.round(B05.salesTotal * 100) === F03.cafes.sales * 100],
  ['October members: Harbourside’s joins in the log', member('cafe', H).length === octJoins('Harbourside')],
  ['October members: Millbrook’s joins in the log', member('cafe', M).length === octJoins('Millbrook')],
  ['every member joined in October 2027', MEMBERS.every((r) => r[mAt('joined')].startsWith('2027-10'))],
  ['won events’ invoices total F03’s $85,880 of 2027 catering invoiced', Math.round(wonInvoices.reduce((s, v) => s + v, 0) * 100) === F03.catering.invoiced * 100],
  ['every quote follows B03’s quote sheet at its price per guest', QUOTES.every((r) => Math.abs(quoted(r[qAt('guests')], r[qAt('hours')], r[qAt('pastries')], r[qAt('days')], r[qAt('rate')]) - r[qAt('quoted')]) < 0.005)],
  ['B03’s sheet charges $6.50 a guest; the test’s other price is $7.00', QUOTE.perGuest === 6.5 && QUOTES.every((r) => r[qAt('rate')] === 6.5 || (r[qAt('rate')] === 7 && r[qAt('sent')] >= PRICE_TEST_START))],
  ['every invoice is within $150 of its quote, as B03’s 2026 events are, except the gala dinner', QUOTES.every((r) => r[qAt('invoice')] === null || r[qAt('guests')] >= 200 || Math.abs(r[qAt('invoice')] - r[qAt('quoted')]) <= 150)],
  ['only won quotes have an invoice', QUOTES.every((r) => (r[qAt('won')] === 1) === (r[qAt('invoice')] !== null))],
  ['every event falls in 2027, after its quote', QUOTES.every((r) => r[qAt('event')].startsWith('2027') && r[qAt('event')] > r[qAt('sent')])],
];
