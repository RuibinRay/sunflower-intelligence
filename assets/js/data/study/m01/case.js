// case.js — the M01 Marketing Fundamentals story: Lantern Coffee Co.'s marketing at the end of its first year
// (November–December 2026), as Ana Lim plans 2027. One source of truth for the facts every M01 lesson, exercise,
// assessment and the project use. Every name, figure and research finding here is invented for teaching.
//
// Agrees with earlier courses: Lantern opened on 1 March 2026 (F01) as a coffee caterer for offices and events and a
// barista-training workshop business, with an online shop for beans (B01, B02). Harbor Tech and Meridian Partners
// are catering clients from its first month (F01, transactions m6 and m8). M02 later plans Lantern Cold Brew, a canned
// drink for shops in Harbour City; M01 comes first and does not use M02's market figures.

/** Lantern's three lines of business in its first ten months (March–December 2026). `retention` is Ana's estimate of the
 *  share of catering clients who stay from one year to the next (Lantern is too young to have measured it). */
export const BUSINESS = {
  catering: { clients: 18, eventsPerClientYear: 6, revenuePerEvent: 820, pricePerHead: 9.0, contributionMargin: 0.45, retention: 0.61,
              salespeople: 1 },                               // Ana is the only person who sells to corporate clients
  workshops: { held: 14, avgParticipants: 12, pricePerPerson: 125 },
  online: { customers: 1_500 },                                   // about 1,500 customers by December (B01)
};

/** Interviews with 12 catering clients in November 2026: how many named each reason for choosing Lantern (several each). */
export const CLIENT_INTERVIEWS = {
  interviewed: 12,
  reasons: { 'Coffee quality': 9, 'Reliability on the day': 7, 'Baristas’ professionalism': 6, 'Flexible menus': 4, 'Price': 2 },
  lostBids: 5,                                                    // bids lost in 2026, all to Brewline Catering on price
};

/** The main catering competitor (fictional). */
export const COMPETITOR = { name: 'Brewline Catering', pricePerHead: 7.5, note: 'a larger caterer with self-serve urns and pod machines; no baristas' };

/** How Harbor Tech, a 300-person software firm, buys catering (the people are fictional). */
export const HARBOR_TECH = {
  employees: 300,
  people: [
    { name: 'Hana Hallett', role: 'office manager', part: 'finds suppliers, books events and signs orders up to $2,000' },
    { name: 'Tom Okoye', role: 'finance director', part: 'approves any supplier contract over $2,000 and sets the budget' },
    { name: 'Lena Brooks', role: 'head of people', part: 'asked for better coffee at staff events after an engagement survey' },
    { name: 'the staff', role: 'about 300 employees', part: 'drink the coffee and fill in the event feedback form' },
    { name: 'Marco Diaz', role: 'reception lead', part: 'decides which sales calls and samples reach Hana' },
  ],
};

/** What Ana knows about 2027 in her district (fictional). */
export const OUTLOOK_2027 = {
  newOfficeDesks: 1_200,                                      // two new office buildings open in Lantern's district
  brewlineSecondVan: true,                                    // Brewline adds a second van to serve the district
  staffExperienceClients: 'several',                          // clients besides Harbor Tech acting on staff engagement surveys
};

/** Ana's goal for 2027. */
export const GOALS = { cateringGrowth: 0.25, costToWinClient: 600 };

// ---------------------------------------------------------------- derived (recomputed by the checker)
const c = BUSINESS.catering;
const cateringRevenue = c.clients * c.eventsPerClientYear * c.revenuePerEvent;                  // 88,560 a year at the current pace
const annualMarginPerClient = c.eventsPerClientYear * c.revenuePerEvent * c.contributionMargin; // 2,214
export const DERIVED = {
  cateringRevenue,
  annualRevenuePerClient: c.eventsPerClientYear * c.revenuePerEvent,                            // 4,920
  annualMarginPerClient,
  revenuePerHeadGap: (c.pricePerHead / COMPETITOR.pricePerHead - 1) * 100,                      // Lantern 20% dearer per head
  workshopRevenue: BUSINESS.workshops.held * BUSINESS.workshops.avgParticipants * BUSINESS.workshops.pricePerPerson,   // 21,000
  cateringTarget: cateringRevenue * (1 + GOALS.cateringGrowth),                                 // 110,700
};
