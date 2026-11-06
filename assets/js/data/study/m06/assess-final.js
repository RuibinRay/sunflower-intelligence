// assess-final.js — M06 final assessment: 24 questions across all four modules and all seven of the course’s outcomes,
// two or three per lesson (five for module 1, five for module 2, seven for module 3 and seven for module 4). 70% passes.
// Outcomes (main one per item): 1 the customer table and settings fn-1, fn-2, fn-3; 2 RFM scores and segments fn-4,
// fn-5, fn-6, fn-7 (and fn-1); 3 cohorts and mix fn-8, fn-9, fn-10 (and fn-2); 4 retention, survival and the sBG
// fn-11, fn-12, fn-13, fn-14, fn-17; 5 churn prediction fn-15, fn-16 (and fn-6); 6 lifetime value, CAC and payback
// fn-18, fn-19, fn-20, fn-21, fn-22; 7 loyalty and retention strategy fn-23, fn-24.
// Mixed conceptual, numerical and applied items. Four are formula items on worksheets of member data sliced from case.js,
// two of them steps items: frequency and recency built from a visit log as of a date in J1 (fn-1: eight members’ 30
// visits, the dates fixed and J1 varied on the marking copies); a segment’s lift in its return in November–December
// (fn-6: 40 members scored on 31 October, the 0/1 column fixed and the segment named in F1 varied); a two-month
// retention rate with the right denominator (fn-11: 40 members who joined in August–October, the dates fixed and the
// period start in H1 varied); the discounted margin per joiner of the April cohort’s first eight months (fn-19: the
// months fixed, the discount rate varied). Typed results fail on the copies.
// Items that combine lessons: frequency and recency from visits as of a date, then an R score from cut points (fn-1:
// customer-metrics, rfm-scoring); visits to date against visits at the same age since joining (fn-2: customer-metrics,
// cohort-analysis); lapse rules and recency in a noncontractual setting (fn-3: customer-metrics,
// retention-and-churn-rates); the R = 5 share against the share seen in 30 days as a tracker (fn-5: rfm-scoring,
// customer-metrics); a segment’s lift against the base (fn-6: rfm-segments, predicting-churn); a segment name checked
// against later behaviour and tested with a holdout before the budget follows it (fn-7: rfm-segments,
// loyalty-and-retention-strategy); the base’s share active falling while same-age cohorts hold steady (fn-8:
// cohort-analysis, customer-metrics); a retention rate with the right denominator, then turned into a
// monthly churn (fn-11: retention-and-churn-rates, cohort-analysis); expected lifetime from the first year’s churn when
// customers differ (fn-12: retention-and-churn-rates, survival-analysis); censoring and a Kaplan–Meier step (fn-13:
// survival-analysis, retention-and-churn-rates); constant retention against the sBG fitted to early years (fn-14:
// survival-analysis, retention-and-churn-rates); a recency score’s lift and why it isn’t an uplift estimate (fn-15:
// predicting-churn, loyalty-and-retention-strategy); near and far members
// under three lapse rules (fn-17: survival-analysis, retention-and-churn-rates); a customer’s value, then payback against
// an acquisition cost (fn-18: customer-lifetime-value, acquisition-cost-and-payback); historical cohort value discounted
// (fn-19: customer-lifetime-value, cohort-analysis); average retention against the sBG’s value (fn-20:
// customer-lifetime-value, survival-analysis); two channels by payback and value-to-cost (fn-21:
// acquisition-cost-and-payback, customer-lifetime-value); paid against blended CAC (fn-22: acquisition-cost-and-payback);
// a randomised win-back test with an interval, then its value per customer offered (fn-23:
// loyalty-and-retention-strategy, customer-lifetime-value); what a stamp-card finding does and doesn’t show (fn-24:
// loyalty-and-retention-strategy). Single-lesson items: fn-4 (NTILE against quantile cut points with ties), fn-9 (October’s
// month 1 restandardised to the earlier café mix, a steps item), fn-10, fn-16 (AUC from pairs), fn-22, fn-24.
// The members and their visits come from case.js; claims about the data’s shape throw below if the data stop supporting
// them, and each matches how tools/study/m06-data.py made the data (near multiplies the visit rate, not the drop-out
// chance; drop-out is never observed). Fader and Hardie’s (2007) Regular customers are as the brief and the survival
// lesson give them. Every other business, person and number is fictional; none is a subscription like the project’s,
// and nothing uses the project’s data or question. No hints; solutions are shown on review. Every num item’s `check`
// recomputes its answer, and every formula item is marked by its results on the sheet and on changed copies.
import { MEMBER_LIST, VISIT_LIST, members, joinMap, lapseData, churnTable, CALIBRATION_END } from './case.js?v=27';
import * as CU from '../../../core/customer.js?v=27';
import { propTest2 } from '../../../core/inference.js?v=27';
import { roc } from '../../../core/classify.js?v=27';
import { isoToSerial } from '../../../core/sheet.js?v=27';
import { FACTS as F03 } from '../f03/case.js?v=27';

const fx = (v, d = 2) => `${v < 0 ? '−' : ''}${Math.abs(v).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d })}`;
const money = (v) => `${v < 0 ? '−' : ''}$${fx(Math.abs(v), 2)}`;
const pc = (v, d = 1) => `${fx(v * 100, d)}%`;
const int = (v) => Math.round(v).toLocaleString('en-US');
const rnd = (x, p) => Math.round(x * 10 ** p) / 10 ** p;
const sum = (a) => a.reduce((s, v) => s + v, 0);
const mean = (a) => sum(a) / a.length;
const col = (letter, from, values) => Object.fromEntries(values.map((v, i) => [`${letter}${from + i}`, v]));
const p3 = (p) => (p < 0.001 ? 'below 0.001' : fx(p, 3));
const claim = (ok, what) => { if (!ok) throw new Error(`assess-final: the data no longer support “${what}”`); };
const { dayNum } = CU;
const MON = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const ML = MEMBER_LIST;
const VIS = new Map(); for (const v of VISIT_LIST) (VIS.get(v.id) || VIS.set(v.id, []).get(v.id)).push(v);
const ALL = members();                                                   // the customer table on 31 December 2027
const OCT31 = CALIBRATION_END;

// ---------------------------------------------------------------- module 1
// fn-1: eight members who joined in May–September, every visit to 31 December; J1 the as-of date
const F1IDS = ['A0497', 'A0584', 'A0642', 'A0726', 'A0801', 'A0881', 'A0956', 'A1032'];
const F1LOG = VISITS_OF(F1IDS);
function VISITS_OF(ids) { return VISIT_LIST.filter((v) => ids.includes(v.id)); }
const f1L = F1LOG.length + 1;
const f1Cells = {
  A1: 'member', B1: 'date', C1: 'amount ($)',
  ...col('A', 2, F1LOG.map((v) => v.id)), ...col('B', 2, F1LOG.map((v) => isoToSerial(v.date))), ...col('C', 2, F1LOG.map((v) => v.amount)),
  E1: 'member', ...col('E', 2, F1IDS), F1: 'frequency', G1: 'recency (days)', I1: 'as of', J1: isoToSerial('2027-10-31'),
};
const f1Sheet = { cells: f1Cells, fixed: [`B2:B${f1L}`], vary: { J1: [isoToSerial('2027-09-30'), isoToSerial('2027-11-30')] } };
const f1At = (id, asOf) => { const v = F1LOG.filter((x) => x.id === id && x.day <= asOf); return { f: v.length, r: asOf - Math.max(...v.map((x) => x.day)) }; };
const R_CUTS = CU.cutPoints(members({ asOf: OCT31 }).map((c) => c.recency));   // Lantern’s recency cut points on 31 October
const F1WHO = 'A0726';
const f1Who = f1At(F1WHO, OCT31);
const f1R = CU.score([f1Who.r], { method: 'cuts', cuts: R_CUTS, higherIsBetter: false })[0];
const f1NoWindow = dayNum('2027-10-31') - Math.max(...F1LOG.filter((x) => x.id === F1WHO).map((x) => x.day));
claim(F1IDS.every((id) => ML.find((m) => m.id === id).joinedIso <= '2027-09-30') && F1LOG.some((v) => v.day > OCT31 && v.id === F1WHO), 'the fn-1 members joined by 30 September and A0726 visited after 31 October');
const f1Members = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight'][F1IDS.length];

// fn-2: visits to date against visits in the first 30 days, March and November joiners
const joinedIn = (mo) => ML.filter((m) => m.joinedIso.startsWith(mo));
const visitsTo = (m) => ALL.find((c) => c.id === m.id).frequency;
const first30 = (m) => VIS.get(m.id).filter((v) => v.day <= m.joined + 29).length;
const MAR = joinedIn('2027-03'), NOV = joinedIn('2027-11');
const F2 = { marTo: mean(MAR.map(visitsTo)), novTo: mean(NOV.map(visitsTo)), mar30: mean(MAR.map(first30)), nov30: mean(NOV.map(first30)) };
const millShare = (g) => g.filter((m) => m.cafe === 'Millbrook').length / g.length;
claim(F2.marTo > F2.novTo && F2.nov30 > F2.mar30 && millShare(NOV) > millShare(MAR), 'November joiners trail on visits to date but lead in their first 30 days, and were more often Millbrook members');

// fn-3: lapse rules on 31 December
const lapsedShare = (L) => ALL.filter((c) => c.recency > L).length / ALL.length;
const F3 = { s30: lapsedShare(30), s90: lapsedShare(90) };

// fn-4 Thorneyholt Books (fictional): ten customers’ orders, in customer-ID order; NTILE against quantile cut points
const TH = [1, 2, 1, 1, 8, 1, 3, 1, 5, 1];
const thNt = CU.score(TH, { k: 5, method: 'ntile' }), thQ = CU.score(TH, { k: 5, method: 'quantile' });
const thOnes = TH.filter((v) => v === 1).length;
const WORDS = ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
const thAbove = TH.filter((v, i) => v === 1 && thNt[i] > 1).length;
const thQAbove = TH.filter((v, i) => v === 1 && thQ[i] > 1).length;
const thSpread = [...new Set(TH.map((v, i) => (v === 1 ? thNt[i] : null)).filter((x) => x != null))].sort();

// fn-5: the R = 5 share against the share who visited within 30 days, 31 October and 31 December
const atDate = (asOf) => { const m = members({ asOf }); const s = CU.rfm(m); return { n: m.length, r5: s.filter((c) => c.R === 5).length / m.length, in30: m.filter((c) => c.recency <= 30).length / m.length }; };
const F5o = atDate(OCT31), F5d = atDate(dayNum('2027-12-31'));
claim(Math.abs(F5o.r5 - 0.2) < 0.02 && Math.abs(F5d.r5 - 0.2) < 0.02 && F5d.in30 < F5o.in30 - 0.03, 'R = 5 stays near 20% while the share seen within 30 days falls');

// ---------------------------------------------------------------- module 2
const OC = CU.rfm(churnTable(), { k: 5, method: 'quantile' });           // scored on 31 October, back in Nov–Dec
const BASE = mean(OC.map((c) => c.back));
const segRate = (name) => { const g = OC.filter((c) => c.segment === name); return { n: g.length, back: sum(g.map((c) => c.back)), rate: mean(g.map((c) => c.back)), rec: mean(g.map((c) => c.recency)), f: mean(g.map((c) => c.frequency)) }; };
// fn-6: forty scored members (every 41st from the 13th)
const S6 = OC.filter((_, i) => i % 41 === 12).slice(0, 40), s6L = S6.length + 1;
const s6Cells = { A1: 'member', B1: 'segment', C1: 'back Nov–Dec', ...col('A', 2, S6.map((c) => c.id)), ...col('B', 2, S6.map((c) => c.segment)), ...col('C', 2, S6.map((c) => c.back)),
  E1: 'segment', F1: 'Champions', E2: 'lift' };
const s6Lift = (name) => mean(S6.filter((c) => c.segment === name).map((c) => c.back)) / mean(S6.map((c) => c.back));
const S6VARY = ['Lost', 'About to sleep', 'Potential loyalists'];
claim(S6VARY.every((n) => S6.filter((c) => c.segment === n).length >= 2) && S6.filter((c) => c.segment === 'Champions').length >= 4, 'the fn-6 sample holds each varied segment');
const s6Champ = S6.filter((c) => c.segment === 'Champions');
// fn-7: Can’t lose them and At risk, and what came back with nothing sent
const CLT = segRate('Can’t lose them'), ATR = segRate('At risk'), CHM = segRate('Champions');
const meanSpend = (name) => mean(OC.filter((c) => c.segment === name).map((c) => c.monetary));
claim(CLT.back === 0 && ATR.rate < 0.05 && CLT.f > 2 * ATR.f && meanSpend('Can’t lose them') > 2 * meanSpend('At risk'), 'Can’t lose them were frequent, big spenders and none came back; At risk came back at under 5%');

// fn-8: the base’s share active in each calendar month against cohorts’ month 1
const T = CU.cohortTable(joinMap(), VISIT_LIST);
const calShare = (mo) => { const s = dayNum(`2027-${String(mo).padStart(2, '0')}-01`); const e = mo === 12 ? dayNum('2027-12-31') : dayNum(`2027-${String(mo + 1).padStart(2, '0')}-01`) - 1;
  const base = ML.filter((m) => m.joined < s); return { n: base.length, a: base.filter((m) => VIS.get(m.id).some((v) => v.day >= s && v.day <= e)).length }; };
const CAL = { apr: calShare(4), jul: calShare(7), dec: calShare(12) };
const m1Early = T.cohorts.slice(0, 7).map((_, i) => T.retention[i][1]);           // March – September cohorts, month 1
claim(T.cohorts.every((c) => c.size > 200) && Math.max(...m1Early) - Math.min(...m1Early) < 0.05 && CAL.dec.a / CAL.dec.n < CAL.apr.a / CAL.apr.n - 0.2, 'same-age month 1 holds steady while the base’s share active falls');

// fn-9: October’s month 1 against March–September, by café
const EARLY = ['2027-03', '2027-04', '2027-05', '2027-06', '2027-07', '2027-08', '2027-09'];
const m1Of = (cafe, months) => { const g = ML.filter((m) => m.cafe === cafe && months.includes(m.joinedIso.slice(0, 7)));
  const a = g.filter((m) => VIS.get(m.id).some((v) => CU.monthOf(v.day) === CU.monthOf(m.joined) + 1)).length; return { n: g.length, a, r: a / g.length }; };
const OCT = { H: m1Of('Harbourside', ['2027-10']), M: m1Of('Millbrook', ['2027-10']) }, ERL = { H: m1Of('Harbourside', EARLY), M: m1Of('Millbrook', EARLY) };
const wH = ERL.H.n / (ERL.H.n + ERL.M.n), wHoct = OCT.H.n / (OCT.H.n + OCT.M.n);
const octActual = (OCT.H.a + OCT.M.a) / (OCT.H.n + OCT.M.n), earlyActual = (ERL.H.a + ERL.M.a) / (ERL.H.n + ERL.M.n);
const octStd = wH * OCT.H.r + (1 - wH) * OCT.M.r;
claim(Math.abs(octStd - octActual) < 0.01 && octActual < earlyActual - 0.05, 'October’s weak month 1 is not a café-mix effect');

// fn-10 Corrowby Climbing Centre (fictional): cohorts’ share active, left-aligned
const CC = { cohorts: ['January', 'February', 'March', 'April', 'May'], rows: [[100, 58, 47, 30, 38], [100, 55, 34, 41], [100, 41, 44], [100, 57], [100]] };

// ---------------------------------------------------------------- module 3
// fn-11: forty members who joined in August–October (every 20th from the 4th)
const inMonth = (id, mo) => VIS.get(id).some((v) => v.date.startsWith(mo));
const nIn = (id, mo) => VIS.get(id).filter((v) => v.date.startsWith(mo)).length;
const S11 = ML.filter((m) => m.joinedIso >= '2027-08-01' && m.joinedIso <= '2027-10-31').filter((_, i) => i % 20 === 3).slice(0, 40), s11L = S11.length + 1;
const s11Cells = { A1: 'member', B1: 'joined', C1: 'visits in October', D1: 'visits in December',
  ...col('A', 2, S11.map((m) => m.id)), ...col('B', 2, S11.map((m) => isoToSerial(m.joinedIso))), ...col('C', 2, S11.map((m) => nIn(m.id, '2027-10'))), ...col('D', 2, S11.map((m) => nIn(m.id, '2027-12'))),
  G1: 'period starts', H1: isoToSerial('2027-10-01'), G2: 'retention Oct → Dec' };
const ret = (set, start) => { const d = set.filter((m) => m.joinedIso < start && inMonth(m.id, '2027-10')); return { n: d.length, k: d.filter((m) => inMonth(m.id, '2027-12')).length }; };
const r11 = ret(S11, '2027-10-01'), r11all = ret(S11, '2028-01-01');
const s11OctJoin = S11.filter((m) => m.joinedIso >= '2027-10-01').length;
const R11ALL = ret(ML, '2027-10-01'), R11W = ret(ML, '2027-11-01');
const r2m = R11ALL.k / R11ALL.n, mChurn = 1 - Math.sqrt(r2m);
claim(s11OctJoin >= 5 && r11.n >= 8, 'the fn-11 sample has October joiners and enough members to retain');

// fn-12 Brimscombe Software (fictional): an sBG with α = 2, β = 8
const BS = { a: 2, b: 8 };
const bsFirst = BS.a / (BS.a + BS.b);
const bsLife = (() => { let s = 0; for (let t = 0; t < 400000; t++) s += CU.sbgS(BS.a, BS.b, t); return s; })();
const bsClosed = (BS.a + BS.b - 1) / (BS.a - 1);

// fn-13: twelve members’ lifetimes under a 60-day lapse rule
const LT60 = CU.lapseTimes(lapseData(), 60);
const P13 = ['A0766', 'A0007', 'A0189', 'A0399', 'A0589', 'A0990', 'A2023', 'A1197', 'A2111', 'A1585', 'A1928', 'A1409'].map((id) => { const i = LT60.ids.indexOf(id); return { id, t: LT60.times[i], e: LT60.events[i] }; });
const km13 = CU.kaplanMeier(P13.map((x) => x.t), P13.map((x) => x.e));
const AT13 = 60, s13 = km13.at(AT13);
const ev13 = P13.filter((x) => x.e);
const s13drop = ev13.filter((x) => x.t > AT13).length / ev13.length;
const s13asLapsed = P13.filter((x) => x.t > AT13).length / P13.length;
const s13survive = P13.filter((x) => x.t > AT13 || !x.e).length / P13.length;
claim(P13.some((x) => !x.e && x.t < Math.max(...ev13.map((y) => y.t))) && km13.steps.length >= 5, 'fn-13 has a member censored before a later lapse');

// fn-14 Fader and Hardie (2007), Regular customers: constant retention and the sBG fitted to years 0–4
const REG = [100, 63.1, 46.8, 38.2, 32.6, 28.9, 26.2, 24.1, 22.3, 20.7, 19.4, 18.3, 17.3];
const FIT = 4, regAlive = REG.slice(0, FIT + 1).map((x) => Math.round(x * 10));
const regFit = CU.sbgFit([{ alive: regAlive }]);
const regR = (() => { let lost = 0, exp = 0; for (let t = 1; t <= FIT; t++) { lost += regAlive[t - 1] - regAlive[t]; exp += regAlive[t - 1]; } return 1 - lost / exp; })();
const reg12 = { sbg: CU.sbgS(regFit.alpha, regFit.beta, 12), cons: regR ** 12, act: REG[12] / 100 };

// fn-15: the churn table ranked by recency
const CT = churnTable();
const LIFT = CU.liftTable(CT.map((c) => c.lapsed), CT.map((c) => c.recency), 10);
const top2 = LIFT.rows[1];
const maxLift = 1 / LIFT.base;

// fn-16: ten members of the churn table, recency on 31 October and whether they lapsed
const P16 = ['back', 'lapsed'].flatMap((k) => CT.filter((c) => (k === 'lapsed' ? c.lapsed : c.back)).filter((_, i) => i % 137 === 3).slice(0, 5)).sort((a, b) => (a.id < b.id ? -1 : 1));
const auc16 = roc(P16.map((c) => c.lapsed), P16.map((c) => c.recency)).auc;
const pairs16 = (() => { const L = P16.filter((c) => c.lapsed), B = P16.filter((c) => !c.lapsed); let w = 0; for (const a of L) for (const b of B) w += a.recency > b.recency ? 1 : a.recency === b.recency ? 0.5 : 0; return { w, n: L.length * B.length }; })();
claim(auc16 > 0.6 && auc16 < 1 && P16.length === 10, 'fn-16’s ten members have a score that ranks most but not all pairs');

// fn-17: near and far members under 30-, 60- and 90-day lapse rules
const LD = lapseData(), NEAR = new Map(ML.map((m) => [m.id, m.near]));
const nearTest = (L) => { const lt = CU.lapseTimes(LD, L), g = lt.ids.map((id) => NEAR.get(id)), lr = CU.logRank(lt.times, lt.events, g);
  const km = (v) => CU.kaplanMeier(lt.times.filter((_, i) => g[i] === v), lt.events.filter((_, i) => g[i] === v)); return { L, p: lr.p, near: km(1).median, far: km(0).median, events: sum(lt.events) }; };
const N17 = [30, 60, 90].map(nearTest);
claim(N17[0].p < 0.001 && N17[0].near > N17[0].far && N17[1].p > 0.5 && N17[2].p > 0.2 && Math.min(N17[1].events, N17[2].events) > 1100, 'near members lapse later only under the 30-day rule, and the longer rules have over 1,100 lapses');

// ---------------------------------------------------------------- module 4
// fn-18 Cogwell Cycle Care (fictional): a monthly servicing plan
const CY = { m: 9, r: 0.95, d: 0.008, cac: 60 };
const cyV = CU.clvConstant({ m: CY.m, r: CY.r, d: CY.d, timing: 'start' }).value;
const cyPay = CU.payback({ cac: CY.cac, m: CY.m, r: CY.r, d: CY.d });
const cySimple = CU.simplePayback(CY.cac, CY.m);
const cyPayNoDisc = CU.payback({ cac: CY.cac, m: CY.m, r: CY.r, d: 0 });
// fn-19: the April cohort’s revenue per joiner, months 0–7 (April – November)
const MARI = T.cohorts.findIndex((c) => c.label === '2027-04');
const marRev = T.revenue[MARI].slice(0, 8).map((v) => rnd(v / T.cohorts[MARI].size, 2));
const MR = rnd(1 - F03.cafes.cogsShare - F03.cafeCardFees / F03.cafes.sales, 2), DM = 0.01;   // the cafés’ margin rate (F03), as customer-lifetime-value uses
const marPV = (d) => sum(marRev.map((v, k) => (v * MR) / (1 + d) ** k));
const marUndisc = sum(marRev) * MR;
// fn-20 Ravenstow Insurance Brokers (fictional): customers differ (sBG α = 1, β = 3)
const RV = { m: 200, a: 1, b: 3, d: 0.1 };
const rvR1 = CU.sbgRetention(RV.a, RV.b, 1);
const rvConst = CU.clvConstant({ m: RV.m, r: rvR1, d: RV.d, timing: 'start' }).value;
const rvSbg = RV.m * CU.sbgDEL(RV.a, RV.b, RV.d);
// fn-21 Aldersey Pottery Studio (fictional): two acquisition channels, a monthly class pass
const AP = { d: 0.01, ch: [{ name: 'Social ads', m: 22, r: 0.8, cac: 60 }, { name: 'Partner referrals', m: 22, r: 0.93, cac: 130 }] };
const apV = AP.ch.map((c) => CU.clvConstant({ m: c.m, r: c.r, d: AP.d, timing: 'start' }).value);
const apPay = AP.ch.map((c) => CU.payback({ cac: c.cac, m: c.m, r: c.r, d: AP.d }));
const apRatio = apV.map((v, i) => v / AP.ch[i].cac);
claim(apPay[0] < apPay[1] && apRatio[1] > apRatio[0], 'social pays back sooner, referrals have the higher value-to-cost ratio');
// fn-22 Wetherlam Outdoor (fictional): paid and blended CAC
const WO = { spend: 9000, paid: 300, organic: 450 };
// fn-23 Cragwell Bike Hire (fictional): a randomised win-back test
const CB = { nT: 800, xT: 136, nC: 800, xC: 96, cost: 4, value: 35 };
const cbT = propTest2(CB.xT, CB.nT, CB.xC, CB.nC);
const cbNet = (u) => u * CB.value - (CB.xT / CB.nT) * CB.cost;     // per customer offered: extra returners' value − every redemption
claim(cbT.low > 0 && cbNet(cbT.low) < 0 && cbNet(cbT.diff) > 0, 'fn-23’s point estimate pays and its lower limit doesn’t');

export const items = [
  // ================================================================ Module 1: customer data and RFM
  {
    id: 'm06-fn-1', lesson: 'customer-metrics', type: 'steps', kind: 'applied',
    prompt: `Columns A to C hold every visit to 31 December 2027 by ${f1Members} Lantern members who joined between May and September (member, date, amount). J1 holds the date Ana wants the customer table as of. E2:E9 list the members.`,
    steps: [
      {
        id: 'm06-fn-1-s1', type: 'formula', kind: 'numerical',
        prompt: 'In F2, use COUNTIFS to calculate the first member’s frequency as of the date in J1 (visits on or before it, the join included), so that the formula fills down to F9.',
        sheet: f1Sheet, cell: 'F2', fill: 'F2:F9', view: `A1:J${f1L}`, maxHeight: '20rem',
        formats: { B: 'date', C: '$#,##0.00', J1: 'date' }, widths: { A: 8, B: 12, C: 10, E: 8, F: 10, G: 13, I: 6, J: 12 },
        answer: `=COUNTIFS($A$2:$A$${f1L},E2,$B$2:$B$${f1L},"<="&$J$1)`,
        alt: [`=COUNTIFS(A$2:A$${f1L},E2,B$2:B$${f1L},"<="&J$1)`],
        require: ['COUNTIFS'],
        wrong: [
          { formula: `=COUNTIF($A$2:$A$${f1L},E2)`, say: 'That counts every visit in the log, including those after the as-of date. A customer table as of a date can only use what was known by then: add the condition B ≤ J1.' },
          { formula: `=COUNTIFS(A2:A${f1L},E2,B2:B${f1L},"<="&J1)`, say: 'Without $ signs the log’s range and J1 slide down as the formula fills, so lower rows miss visits. Anchor them.' },
        ],
        solution: `<x>=COUNTIFS($A$2:$A$${f1L},E2,$B$2:$B$${f1L},"<="&$J$1)</x>, filled down. As of 31 October these members’ frequencies are ${F1IDS.map((id) => f1At(id, OCT31).f).join(', ')}; counting the whole log would add the visits after 31 October.`,
      },
      {
        id: 'm06-fn-1-s2', type: 'formula', kind: 'numerical',
        prompt: 'In G2, use MAXIFS to calculate the first member’s recency in days as of the date in J1, so that the formula fills down to G9.',
        sheet: f1Sheet, cell: 'G2', fill: 'G2:G9', view: `A1:J${f1L}`, maxHeight: '20rem',
        formats: { B: 'date', C: '$#,##0.00', J1: 'date' }, widths: { A: 8, B: 12, C: 10, E: 8, F: 10, G: 13, I: 6, J: 12 },
        answer: `=$J$1-MAXIFS($B$2:$B$${f1L},$A$2:$A$${f1L},E2,$B$2:$B$${f1L},"<="&$J$1)`,
        alt: [`=J$1-MAXIFS(B$2:B$${f1L},A$2:A$${f1L},E2,B$2:B$${f1L},"<="&J$1)`, `=DAYS($J$1,MAXIFS($B$2:$B$${f1L},$A$2:$A$${f1L},E2,$B$2:$B$${f1L},"<="&$J$1))`],
        require: ['MAXIFS'],
        wrong: [
          { formula: `=$J$1-MAXIFS($B$2:$B$${f1L},$A$2:$A$${f1L},E2)`, say: 'That takes the member’s last visit in the whole log, which can fall after J1 and give a negative recency. Restrict MAXIFS to visits on or before J1.' },
          { formula: `=$J$1-MINIFS($B$2:$B$${f1L},$A$2:$A$${f1L},E2,$B$2:$B$${f1L},"<="&$J$1)`, say: 'MINIFS finds the first visit, so this is tenure. Recency is measured from the last visit: MAXIFS.' },
        ],
        solution: `<x>=$J$1-MAXIFS($B$2:$B$${f1L},$A$2:$A$${f1L},E2,$B$2:$B$${f1L},"<="&$J$1)</x>, filled down. As of 31 October the recencies are ${F1IDS.map((id) => f1At(id, OCT31).r).join(', ')} days.`,
      },
      {
        id: 'm06-fn-1-s3', type: 'num', kind: 'numerical',
        prompt: `Lantern’s recency cut points for all members on 31 October 2027 are ${R_CUTS.map((c) => fx(c, 0)).join(', ')} days (quintiles; a value on a cut point goes in the more recent group). With J1 at 31 October, what R score does ${F1WHO} get?`,
        answer: f1R,
        check: () => 5 - R_CUTS.filter((c) => c < f1At('A0726', dayNum('2027-10-31')).r).length,
        unit: '', places: 0, tol: 0,
        wrong: [
          { value: 5, say: `${F1WHO} visited in December, but on 31 October that visit hadn’t happened. Measured from the last visit on or before 31 October, the recency is ${f1Who.r} days.` },
          { value: 6 - f1R, say: 'Recency is reversed: the shortest absences score 5. Count the cut points the recency exceeds and subtract from 5.' },
          { value: f1R + 1, say: `${f1Who.r} days is above the ${fx(R_CUTS[2], 0)}-day cut point, so it is in the fourth group from the most recent.` },
        ],
        solution: `${F1WHO}’s last visit on or before 31 October gives a recency of ${f1Who.r} days, above the cut points ${R_CUTS.slice(0, 3).map((c) => fx(c, 0)).join(', ')} and below ${fx(R_CUTS[3], 0)}: R = 5 − 3 = ${f1R}. Using the whole log would take the December visit and give ${fx(f1NoWindow, 0)} days, a negative recency: the as-of date has to apply to every column of the table.`,
      },
    ],
    solution: 'Every column of a customer table is measured as of one date: count and date the visits on or before it, and score recency against cut points computed on the same date.',
  },
  {
    id: 'm06-fn-2', lesson: 'customer-metrics', type: 'mc', kind: 'applied',
    prompt: `On 31 December 2027 Lantern’s ${MAR.length} March joiners had made ${fx(F2.marTo, 2)} visits each on average and the ${NOV.length} November joiners ${fx(F2.novTo, 2)}. The Millbrook manager says November’s sign-ups were “half as engaged”. What should Ana reply?`,
    options: [
      `The comparison mixes ten months of visits with one or two; in their first 30 days November’s joiners made ${fx(F2.nov30, 2)} visits each against March’s ${fx(F2.mar30, 2)}`,
      'He is right: frequency is the count of visits in the window, and both groups were measured over the same window ending on 31 December 2027',
      `Compare medians instead, since frequency is skewed and the means of ${fx(F2.marTo, 1)} and ${fx(F2.novTo, 1)} are pulled up by the heaviest visitors`,
      'He is right only about Harbourside, where November’s joiners made a smaller share of the cohort, so the figures need splitting by café first',
    ],
    answer: 0,
    feedback: {
      1: 'The window ends on the same date, but it starts when each member joined: a March joiner has had about ten months to visit, a November joiner one or two. Visits to date grow with tenure.',
      2: 'Skew matters, but a median of visits to date still compares members of very different tenure. Compare at the same age.',
      3: 'The café mix can matter, but the larger problem is tenure, and at the same age the November joiners lead.',
    },
    solution: `Frequency counts visits from joining to the as-of date, so it grows with tenure: March joiners had about ten months, November joiners at most two. At the same age (the first 30 days since joining, the join included) November’s joiners made ${fx(F2.nov30, 2)} visits each and March’s ${fx(F2.mar30, 2)}. Compare members at the same age (visits per week of tenure, or a cohort table), and remember that November’s joiners were more often Millbrook members, whose rates are higher.`,
  },
  {
    id: 'm06-fn-3', lesson: 'customer-metrics', type: 'multi', kind: 'conceptual',
    prompt: 'Lantern’s app members are a noncontractual setting. Which statements about its customer table on 31 December 2027 are true? Select all that apply.',
    options: [
      'A member whose recency is 150 days may still be a customer',
      `The share of members counted as lapsed depends on the rule chosen: ${pc(F3.s30)} with a 30-day rule, ${pc(F3.s90)} with a 90-day rule`,
      'A member who visited on 31 December has a recency of 0 days',
      'Members who have stopped coming can be counted exactly, because the app records the day a member leaves',
      'A member who joined on 31 December has a tenure of 1 day, since the join day itself counts',
    ],
    answer: [0, 1, 2],
    feedback: {
      3: 'Nobody tells Lantern they have stopped; the app only records visits. Departure has to be inferred from silence, which is why a lapse rule is needed.',
      4: 'Tenure is the as-of date minus the first visit: 0 for a member who joined that day, just as recency is 0 for a visit that day.',
    },
    solution: `In a noncontractual setting a long silence suggests, but doesn’t prove, that a member has gone: a lapse rule turns silence into a definition, and the share lapsed moves with the rule (${pc(F3.s30)} at 30 days, ${pc(F3.s90)} at 90). Recency and tenure are both measured to the as-of date, so a visit or a join on that day gives 0.`,
  },
  {
    id: 'm06-fn-4', lesson: 'rfm-scoring', type: 'num', kind: 'numerical',
    prompt: `Thorneyholt Books (fictional) has ten customers. In customer-ID order they placed ${TH.join(', ')} orders last year. Its database scores frequency 1–5 with NTILE (five equal-sized groups), sorting by orders and breaking ties by customer ID. How many of the ${WORDS[thOnes]} customers with one order get a score above F = 1?`,
    answer: thAbove,
    check: () => { const ones = TH.filter((v) => v === 1).length; return Math.max(0, ones - TH.length / 5); },
    unit: 'customers', places: 0, tol: 0,
    wrong: [
      { value: thQAbove, say: 'That is what quantile cut points do: every tied value is on the same side of each cut, so all the one-order customers share F = 1. NTILE deals customers into groups of fixed size instead.' },
      { value: thOnes, say: 'F1 holds two customers under NTILE (10 ÷ 5), so two of the one-order customers do stay at F = 1.' },
    ],
    solution: `NTILE makes groups of 10 ÷ 5 = 2. Sorted by orders, the ${WORDS[thOnes]} one-order customers fill F1, F2 and F3 (scores ${thSpread.join(', ')}) in customer-ID order, so ${thAbove} of them score above 1 although they bought exactly as often as the two who score 1. Quantile cut points would give all ${WORDS[thOnes]} F = 1. With heavy ties, equal-sized groups split identical customers by an arbitrary tie-breaker; say which method you use.`,
  },
  {
    id: 'm06-fn-5', lesson: 'rfm-scoring', type: 'mc', kind: 'applied',
    prompt: `Ana wants a monthly measure of whether members are keeping up their visits. She notices that ${pc(F5o.r5)} of members scored R = 5 on 31 October and ${pc(F5d.r5)} on 31 December, and concludes that engagement held steady. Over the same two dates, the share of members who had visited within the last 30 days went from ${pc(F5o.in30)} to ${pc(F5d.in30)}. Which is the better tracker, and why?`,
    options: [
      'The share seen within 30 days: quintile scores put about a fifth of the base in R = 5 on any date, whatever members do',
      'The R = 5 share, because it adjusts for the new members who joined in November and December and so compares like with like',
      'Neither: both figures fell between the two dates, so either one would tell the same story about the members',
      'The R = 5 share, since quintile cut points are fixed on the first date and then applied to the second one',
    ],
    answer: 0,
    feedback: {
      1: 'Scoring against the base on each date doesn’t adjust for anything: it re-cuts the base into fifths. A real fall in recent visits moves the cut points, not the share in R = 5.',
      2: `The R = 5 share barely moved (${pc(F5o.r5)} to ${pc(F5d.r5)}) while the share seen within 30 days fell by ${fx((F5o.in30 - F5d.in30) * 100, 1)} points: they tell different stories.`,
      3: 'Quintile cut points are recomputed on each date: on 31 December Lantern’s recency cut points are not 31 October’s.',
    },
    solution: `RFM scores are relative to the base and the date: quintile scoring puts roughly 20% in each recency score every time (${pc(F5o.r5)} and ${pc(F5d.r5)} here, ties aside), so the R = 5 share can’t show a change in behaviour. A fixed threshold in days can: the share seen within 30 days fell from ${pc(F5o.in30)} to ${pc(F5d.in30)}. (Part of that is the base getting older, which a cohort view would separate.)`,
  },

  // ================================================================ Module 2: segments and cohorts
  {
    id: 'm06-fn-6', lesson: 'rfm-segments', type: 'formula', kind: 'numerical',
    prompt: `The sheet holds ${S6.length} Lantern members scored on 31 October 2027 (every 41st of the ${int(OC.length)}), with their segment and 1 in column C if they visited in November–December. In F2, calculate the lift of the segment named in F1: its return rate divided by the return rate of all the members on the sheet.`,
    sheet: { cells: s6Cells, fixed: [`C2:C${s6L}`], vary: { F1: S6VARY } }, cell: 'F2', view: `A1:F${s6L}`, maxHeight: '20rem',
    formats: { F2: '0.00' }, widths: { A: 8, B: 18, C: 12, E: 9, F: 18 },
    answer: `=AVERAGEIFS(C2:C${s6L},B2:B${s6L},F1)/AVERAGE(C2:C${s6L})`,
    alt: [`=(SUMIFS(C2:C${s6L},B2:B${s6L},F1)/COUNTIF(B2:B${s6L},F1))/(SUM(C2:C${s6L})/COUNT(C2:C${s6L}))`, `=COUNTIFS(B2:B${s6L},F1,C2:C${s6L},1)/COUNTIF(B2:B${s6L},F1)/AVERAGE(C2:C${s6L})`],
    wrong: [
      { formula: `=AVERAGEIFS(C2:C${s6L},B2:B${s6L},F1)`, say: 'That is the segment’s return rate. Lift divides it by the base rate, the share of all members on the sheet who came back.' },
      { formula: `=SUMIFS(C2:C${s6L},B2:B${s6L},F1)/SUM(C2:C${s6L})`, say: 'That is the segment’s share of all returners, which depends on how big the segment is. Lift compares rates: segment rate ÷ overall rate.' },
      { formula: `=AVERAGE(C2:C${s6L})/AVERAGEIFS(C2:C${s6L},B2:B${s6L},F1)`, say: 'Upside down: the segment’s rate goes on top.' },
    ],
    solution: `<x>=AVERAGEIFS(C2:C${s6L},B2:B${s6L},F1)/AVERAGE(C2:C${s6L})</x>. On the sheet ${s6Champ.filter((c) => c.back).length} of ${s6Champ.length} Champions came back against ${pc(mean(S6.map((c) => c.back)))} of all ${S6.length}: lift ${fx(s6Lift('Champions'), 2)}. Across all ${int(OC.length)} members, Champions came back at ${pc(segRate('Champions').rate)} against ${pc(BASE)}. Checking segments against later behaviour like this treats the grid as a churn score; it shows which members would come back without a message, not which ones a message would change.`,
  },
  {
    id: 'm06-fn-7', lesson: 'rfm-segments', type: 'mc', kind: 'applied',
    prompt: `Ana plans the first quarter’s messages from the 31 October scores. The naming convention says to win back the ${CLT.n} members in Can’t lose them (${fx(CLT.f, 1)} visits and ${money(meanSpend('Can’t lose them'))} spent each, on average) “with the best offer”. In November–December, with nothing sent, ${CLT.back} of them came back, and ${ATR.back} of the ${ATR.n} At risk members (${pc(ATR.rate)}). What should she do?`,
    options: [
      'Treat the name as a hypothesis: test the offer on a random half of the segment, with the other half held out',
      `Give them the best offer, as the convention says: at ${money(meanSpend('Can’t lose them'))} each they were among the most valuable members the cafés had`,
      `Drop them for good: none of the ${CLT.n} came back, which shows that no offer of any kind could ever bring these members back`,
      `Move the budget to At risk, since ${ATR.back} of its members came back and so they are the members more likely to respond to an offer`,
    ],
    answer: 0,
    feedback: {
      1: 'Past spend is history. Frequent members silent for over two months are probably gone, and none came back unprompted; a costly offer to all of them is a bet the data don’t support yet.',
      2: 'Nothing was sent, so the data show what members did without an offer, not what an offer would do. Only a test can show that.',
      3: 'A few returns with nothing sent say nothing about who responds to an offer; the At risk members who came back would have come anyway.',
    },
    solution: `Segment names come from a convention written for typical businesses. On Lantern’s data, Can’t lose them were former regulars (${fx(CLT.f, 1)} visits on average) who had been silent ${fx(CLT.rec, 0)} days on average, and none came back in November–December (At risk: ${pc(ATR.rate)}; Champions: ${pc(CHM.rate)}). A randomised holdout within the segment shows whether the offer brings any back, at the cost of a small test rather than the whole budget.`,
  },
  {
    id: 'm06-fn-8', lesson: 'cohort-analysis', type: 'mc', kind: 'applied',
    prompt: `Of the members who had joined before each month, ${pc(CAL.apr.a / CAL.apr.n)} visited in April 2027, ${pc(CAL.jul.a / CAL.jul.n)} in July and ${pc(CAL.dec.a / CAL.dec.n)} in December. In the cohort table, the March to September cohorts’ share active in month 1 ranges only from ${pc(Math.min(...m1Early))} to ${pc(Math.max(...m1Early))}. What explains the falling monthly figure?`,
    options: [
      'The base got older: each month more of it is members many months past joining, and every cohort’s share active falls with age',
      'Newer members are less engaged than the early ones, so each cohort that joins pulls the overall share of members active down a little further',
      'Seasonality: members visit less in the winter months than in the summer, and that alone explains the whole of the fall',
      'Lantern stopped recruiting members in the autumn, so far fewer new members were joining to keep up the share active each month',
    ],
    answer: 0,
    feedback: {
      1: 'The cohort table says otherwise: at the same age, month 1, the March to September cohorts are within a few points of each other. Newer members are not worse.',
      2: 'Seasons can move a month’s figure, but April’s base was all March joiners in their month 1, while December’s base is mostly members many months on; that age mix alone pulls the share down.',
      3: 'Members kept joining (over 200 a month, as B05’s log shows), and new joiners are the most active part of the base, which slows the fall rather than causing it.',
    },
    solution: `A cohort’s share active falls month by month after joining (the pooled curve runs ${pc(T.pooled[1].rate)} in month 1 to ${pc(T.pooled[6].rate)} in month 6). A calendar month’s figure averages members of every age, and as the base ages the old, quieter cohorts outweigh the new ones. Reading the cohort table down a column (the same month since joining) shows that cohort quality held steady: the change is in the mix of ages, not in members’ behaviour.`,
  },
  {
    id: 'm06-fn-9', lesson: 'cohort-analysis', type: 'steps', kind: 'numerical',
    prompt: `In month 1, ${pc(OCT.H.r)} of the ${OCT.H.n} October joiners at Harbourside were active and ${pc(OCT.M.r)} of the ${OCT.M.n} at Millbrook. Of the March to September joiners, ${pc(wH)} were Harbourside members, and ${pc(earlyActual)} of them were active in month 1.`,
    steps: [
      {
        id: 'm06-fn-9-s1', type: 'num', kind: 'numerical',
        prompt: 'If October’s joiners had had the earlier cohorts’ café mix, with each café’s October rate unchanged, what share of them would have been active in month 1? Give a percentage to two decimal places.',
        answer: rnd(octStd * 100, 2),
        check: () => (wH * OCT.H.a / OCT.H.n + (1 - wH) * OCT.M.a / OCT.M.n) * 100,
        unit: '%', places: 2, tol: 0.01,
        wrong: [
          { value: rnd(octActual * 100, 2), say: 'That is October’s own rate, with October’s own mix. Reweight the two cafés’ October rates by the earlier cohorts’ mix.' },
          { value: rnd(((OCT.H.r + OCT.M.r) / 2) * 100, 2), say: 'That weights the two cafés equally. Use the earlier cohorts’ mix: about a third Harbourside and two thirds Millbrook.' },
          { value: rnd(earlyActual * 100, 2), say: 'That is the earlier cohorts’ own month 1, their rates as well as their mix. Keep October’s rates and change only the mix.' },
        ],
        solution: `Standardised rate = ${fx(wH, 4)} × ${pc(OCT.H.r, 2)} + ${fx(1 - wH, 4)} × ${pc(OCT.M.r, 2)} = ${pc(octStd, 2)}.`,
      },
      {
        id: 'm06-fn-9-s2', type: 'mc', kind: 'conceptual',
        prompt: 'Does the change in café mix explain October’s weak month 1?',
        options: [
          'No: at the earlier mix October’s rate barely moves, and both cafés’ October joiners trail their earlier cohorts',
          'Yes: Harbourside members are less active in month 1, and October drew a larger share of them than the earlier cohorts did',
          'Yes: once the mix is fixed the rate rises back to the earlier cohorts’ level, so the cohort is no worse than the others',
          'It can’t be told without a two-proportion test of each café’s October rate against its earlier one, so there is no answer yet',
        ],
        answer: 0,
        feedback: {
          1: `October’s mix (${pc(wHoct)} Harbourside) was close to the earlier ${pc(wH)}, and reweighting moves the rate by less than a point.`,
          2: `The reweighted rate stays near ${pc(octStd)}, far below the earlier ${pc(earlyActual)}.`,
          3: 'Standardisation answers the mix question directly; a test would ask a different one, whether each café’s fall is beyond chance.',
        },
        solution: `Reweighting gives ${pc(octStd, 2)} against October’s actual ${pc(octActual, 2)} and ${pc(earlyActual)} for March to September. The mix explains almost none of the dip. That rules out the café mix, not other causes (the November season, who joined, or chance).`,
      },
    ],
    solution: `Mix-standardised month 1 ${pc(octStd, 2)} against ${pc(octActual, 2)} actual: the café mix doesn’t explain October’s weak start.`,
  },
  {
    id: 'm06-fn-10', lesson: 'cohort-analysis', type: 'mc', kind: 'applied',
    prompt: 'Corrowby Climbing Centre (fictional) opened in January. Its left-aligned cohort table shows the share of each joining month’s members who climbed in each month since joining (%). What does the pattern most likely show?',
    data: { table: { head: ['Cohort', 'Month 0', 'Month 1', 'Month 2', 'Month 3', 'Month 4'], align: ['l', 'r', 'r', 'r', 'r', 'r'], rows: CC.cohorts.map((c, i) => [c, ...[0, 1, 2, 3, 4].map((k) => (CC.rows[i][k] == null ? '' : CC.rows[i][k]))]) } },
    options: [
      'Something in April lowered every cohort’s activity: the low cells all fall in that calendar month, on a diagonal',
      'The March cohort was of lower quality than the others, since its month-1 share is well below the January and February cohorts',
      'Members lose interest around month 2 or 3, so the centre should send a reminder to every cohort at that age',
      'The May cohort is the strongest of the five, since it has no low months anywhere in its row so far',
    ],
    answer: 0,
    feedback: {
      1: 'March’s month 1 is April, and its month 2 (May) recovers to 44%, above its month 1: the weak cell is the calendar month, not the cohort.',
      2: 'A dip at the same age would sit in one column. Here the low cells move one column left with each later cohort: January’s month 3, February’s month 2, March’s month 1, all April.',
      3: 'May has only month 0, which is 100% by definition: there is nothing yet to judge.',
    },
    solution: 'In a left-aligned table a calendar month runs along a diagonal (cohort row + months since joining = that month). January’s month 3 (30%), February’s month 2 (34%) and March’s month 1 (41%) are all April, and each cohort recovers the month after: a calendar effect (a closure, a holiday, a competitor’s opening), not a weaker cohort or an age effect.',
  },

  // ================================================================ Module 3: retention and churn
  {
    id: 'm06-fn-11', lesson: 'retention-and-churn-rates', type: 'steps', kind: 'numerical',
    prompt: `The sheet lists ${S11.length} Lantern members who joined in August–October 2027 (every 20th), with each one’s join date and number of visits in October and in December. Ana treats a member who visited in October as a customer at the start of the period and counts them as kept if they visited in December. H1 holds the date the period starts.`,
    steps: [
      {
        id: 'm06-fn-11-s1', type: 'formula', kind: 'numerical',
        prompt: 'In H2, calculate the retention rate from October to December: of the members who were customers at the start of the period (who joined before H1 and visited in October), the share who visited in December.',
        sheet: { cells: s11Cells, fixed: [`B2:B${s11L}`], vary: { H1: [isoToSerial('2027-09-15'), isoToSerial('2027-10-15')] } }, cell: 'H2', view: `A1:H${s11L}`, maxHeight: '20rem',
        formats: { B: 'date', H1: 'date', H2: '0.0%' }, widths: { A: 8, B: 12, C: 9, D: 10, G: 18, H: 12 },
        answer: `=COUNTIFS(B2:B${s11L},"<"&H1,C2:C${s11L},">0",D2:D${s11L},">0")/COUNTIFS(B2:B${s11L},"<"&H1,C2:C${s11L},">0")`,
        alt: [`=SUMPRODUCT((B2:B${s11L}<H1)*(C2:C${s11L}>0)*(D2:D${s11L}>0))/SUMPRODUCT((B2:B${s11L}<H1)*(C2:C${s11L}>0))`, `=COUNTIFS(B2:B${s11L},"<"&H1,C2:C${s11L},">=1",D2:D${s11L},">=1")/COUNTIFS(B2:B${s11L},"<"&H1,C2:C${s11L},">=1")`],
        wrong: [
          { formula: `=COUNTIFS(C2:C${s11L},">0",D2:D${s11L},">0")/COUNTIF(C2:C${s11L},">0")`, say: 'That counts October’s joiners as customers at the start. They were active in October because they joined then; a period’s retention excludes customers won during the period.' },
          { formula: `=COUNTIFS(B2:B${s11L},"<"&H1,C2:C${s11L},">0",D2:D${s11L},">0")/COUNTIF(B2:B${s11L},"<"&H1)`, say: 'That divides by everyone who had joined, including members already silent in October, who weren’t customers at the start under Ana’s rule.' },
          { formula: `=COUNTIFS(B2:B${s11L},"<"&H1,D2:D${s11L},">0")/COUNTIFS(B2:B${s11L},"<"&H1,C2:C${s11L},">0")`, say: 'The top counts December visitors who were silent in October too, so it isn’t a subset of the bottom. Kept members must be in both months.' },
        ],
        solution: `<x>=COUNTIFS(B2:B${s11L},"<"&H1,C2:C${s11L},">0",D2:D${s11L},">0")/COUNTIFS(B2:B${s11L},"<"&H1,C2:C${s11L},">0")</x>. On the sheet ${r11.k} of the ${r11.n} members who joined before 1 October and visited in October came back in December (${pc(r11.k / r11.n)}); with the ${s11OctJoin} October joiners left in, it would be ${r11all.k} of ${r11all.n} (${pc(r11all.k / r11all.n)}).`,
      },
      {
        id: 'm06-fn-11-s2', type: 'num', kind: 'numerical',
        prompt: `Over all members, ${int(R11ALL.k)} of the ${int(R11ALL.n)} who joined before 1 October and visited in October visited in December: two months’ retention of ${pc(r2m)}. If the monthly rate were constant, what monthly churn rate would give that? Give a percentage to one decimal place.`,
        answer: rnd(mChurn * 100, 1),
        check: () => (1 - Math.sqrt(R11ALL.k / R11ALL.n)) * 100,
        unit: '%', places: 1, tol: 0.1,
        wrong: [
          { value: rnd(((1 - r2m) / 2) * 100, 1), say: 'Halving the two-month churn ignores compounding: the second month’s churn applies only to those kept in the first. Solve (1 − c)² = r.' },
          { value: rnd((1 - r2m) * 100, 1), say: 'That is the churn over the whole two-month period, not per month.' },
        ],
        solution: `(1 − c)² = ${fx(r2m, 3)}, so 1 − c = √${fx(r2m, 3)} = ${fx(Math.sqrt(r2m), 3)} and c = ${pc(mChurn)} a month. It is only a convenient summary: in a noncontractual setting members skip months and come back, and churn isn’t constant: it falls with tenure, as the members who stay are the more loyal ones.`,
      },
    ],
    solution: 'A period’s retention rate starts from the customers who were there at the start, leaving out those won during it; a rate over several months becomes a monthly one by taking the root, not by dividing.',
  },
  {
    id: 'm06-fn-12', lesson: 'retention-and-churn-rates', type: 'mc', kind: 'conceptual',
    prompt: `Brimscombe Software (fictional) sells yearly licences. ${pc(bsFirst, 0)} of a new cohort leave at the first renewal, so the finance team plans on an expected lifetime of 1 ÷ ${fx(bsFirst, 1)} = ${fx(1 / bsFirst, 0)} years. Customers differ: a shifted-beta-geometric model with α = ${BS.a} and β = ${BS.b} fits the renewals well. What does that model imply for the expected lifetime of a new customer, counting the first year?`,
    options: [
      `It is longer, about ${fx(bsClosed, 0)} years: the first year removes the least loyal, so later renewal rates rise above 80%`,
      `It is shorter than ${fx(1 / bsFirst, 0)} years, because the customers who leave early drag the average lifetime of the whole cohort down`,
      `It is the same ${fx(1 / bsFirst, 0)} years, since the model’s mean churn probability α ÷ (α + β) is 20%, just as observed`,
      'It can’t be worked out from the model, since an expected lifetime needs the renewal rates of every customer',
    ],
    answer: 0,
    feedback: {
      1: 'The early leavers are already counted in the 20% first-year churn. What 1 ÷ churn misses is that the survivors renew at higher rates than 80%.',
      2: `The mean churn probability is 20%, but expected lifetime averages 1 ÷ θ over customers, and that average is larger than 1 ÷ 0.2: a few very loyal customers stay for decades.`,
      3: 'The model describes the spread of churn probabilities, which is enough: expected lifetime is the sum of its survival curve, S(0) + S(1) + S(2) + …',
    },
    solution: `Under the sBG each customer has a fixed churn probability θ drawn from a beta(${BS.a}, ${BS.b}) distribution. Expected lifetime is S(0) + S(1) + … = (α + β − 1) ÷ (α − 1) = ${fx(bsLife, 1)} years, against 1 ÷ 0.2 = 5 under constant churn. Retention rises with tenure, (β + t − 1) ÷ (α + β + t − 1): 80% at the first renewal, ${pc(CU.sbgRetention(BS.a, BS.b, 5), 0)} at the fifth. Projecting the first year’s churn forward undervalues long-lived customers.`,
  },
  {
    id: 'm06-fn-13', lesson: 'survival-analysis', type: 'steps', kind: 'numerical',
    prompt: `Under a 60-day lapse rule on 31 December 2027, twelve app members’ lifetimes are below: days from joining to the visit after which they lapsed, or, for members who haven’t lapsed, days to their last visit (still active, censored).`,
    data: { table: { head: ['Member', 'Days', 'Status'], align: ['l', 'r', 'l'], rows: P13.map((x) => [x.id, x.t, x.e ? 'lapsed' : 'still active']) } },
    steps: [
      {
        id: 'm06-fn-13-s1', type: 'num', kind: 'numerical',
        prompt: `What is the Kaplan–Meier estimate of the probability that a member has not lapsed by day ${AT13}? Give three decimal places.`,
        answer: rnd(s13, 3),
        check: () => { let S = 1, n = 12; const t = P13.map((x) => x.t), e = P13.map((x) => x.e); const ord = [...t.keys()].sort((a, b) => t[a] - t[b]); for (const i of ord) { if (t[i] > 60) break; if (e[i]) S *= 1 - 1 / n; n -= 1; } return S; },
        unit: '', places: 3, tol: 0.001,
        wrong: [
          { value: rnd(s13drop, 3), say: 'That keeps only the lapsed members. Leaving out the members still active drops the ones who have lasted, so it understates survival.' },
          { value: rnd(s13asLapsed, 3), say: 'That counts the members still active as if they had lapsed at their last visit. They were known to be active then, so they count as at risk up to that day and then leave the count.' },
          { value: rnd(s13survive, 3), say: `That counts every member still active as surviving past day ${AT13}, even one seen for only ${Math.min(...P13.filter((x) => !x.e).map((x) => x.t))} days. Nobody knows yet whether they will reach day ${AT13}.` },
        ],
        solution: `Step through the lapse times: ${km13.steps.filter((s) => s.t <= AT13).map((s) => `day ${s.t}, ${s.atRisk} at risk, × ${s.atRisk - s.events}/${s.atRisk}`).join('; ')}. The member censored at day ${P13.find((x) => !x.e).t} leaves the count before day ${km13.steps.find((s) => s.t > P13.find((x) => !x.e).t).t}. S(${AT13}) = ${fx(s13, 3)}.`,
      },
      {
        id: 'm06-fn-13-s2', type: 'mc', kind: 'conceptual',
        prompt: 'Why does the product-limit method keep the still-active members in the count up to their last visit instead of leaving them out?',
        options: [
          'They are known not to have lapsed by that day, so they belong among those at risk until then; dropping them biases survival down',
          'They will lapse sooner or later, so counting them up to their last visit spreads their lapse across the period they were observed',
          'It makes the estimate match the share of all members who had lapsed by the end of the data, which is the quantity that is wanted',
          'It gives a curve that is always above the one from the lapsed members alone, which makes up for the members the data miss entirely',
        ],
        answer: 0,
        feedback: {
          1: 'The method doesn’t assume they will lapse, or spread anything: it uses only what is known, that they survived to their last visit.',
          2: 'The share lapsed by the end of the data mixes members observed for very different lengths of time. Kaplan–Meier estimates survival at each time from those still observed then.',
          3: 'The curve is higher than the lapsed-only one because it is right to count the survivors, not to make up for anything; and it assumes censoring is unrelated to lapsing.',
        },
        solution: 'A censored member contributes what is known: survival up to the last observation. Each step multiplies by the share of those at risk who didn’t lapse, and censored members leave the risk set after their last time. That is valid if censoring is unrelated to the chance of lapsing (here it comes from the data ending, and from members joining late).',
      },
    ],
    solution: `Kaplan–Meier gives S(${AT13}) = ${fx(s13, 3)}; leaving out or mis-counting the still-active members gives ${fx(s13drop, 3)}, ${fx(s13asLapsed, 3)} or ${fx(s13survive, 3)}.`,
  },
  {
    id: 'm06-fn-14', lesson: 'survival-analysis', type: 'mc', kind: 'conceptual',
    prompt: `Fader and Hardie’s (2007) Regular customers: ${REG.slice(0, FIT + 1).map((x) => fx(x, 1)).join('%, ')}% of a cohort were still customers after 0 to ${FIT} years. Fitted to those five points, constant retention gives ${pc(regR)} a year and the sBG gives α = ${fx(regFit.alpha, 3)}, β = ${fx(regFit.beta, 3)}. For year 12 they project ${pc(reg12.cons)} and ${pc(reg12.sbg)} still customers. The data show ${pc(reg12.act)}. What explains the difference?`,
    options: [
      'Customers differ; the least loyal leave first, so the survivors’ renewal rate rises, which the sBG allows and constant retention can’t',
      'The sBG has two parameters and constant retention one, so the sBG fits any curve more closely, whatever the customers are like',
      'Customers grow more loyal the longer they stay, as each renewal makes them less likely to leave, which the sBG builds in',
      'Constant retention was fitted to too few years; refitted to the first twelve it would project year 12 just as well as the sBG',
    ],
    answer: 0,
    feedback: {
      1: 'Two parameters help, but the sBG got year 12 right from years 0–4 because its shape matches how heterogeneous customers drop out, not because it is more flexible in general.',
      2: 'In the sBG each customer’s churn probability is fixed for life. Retention rises in aggregate because the high-churn customers have gone, not because anyone changes.',
      3: 'Fitting to all twelve years would describe them, but it couldn’t forecast them in advance; and any constant rate still bends the wrong way, too high early and too low late.',
    },
    solution: `Constant retention projects ${pc(regR)}¹² = ${pc(reg12.cons)}; the sBG, S(12) = B(α, β + 12) ÷ B(α, β), projects ${pc(reg12.sbg)}, close to the ${pc(reg12.act)} observed. Under the sBG the retention rate (β + t − 1) ÷ (α + β + t − 1) rises from ${pc(CU.sbgRetention(regFit.alpha, regFit.beta, 1))} in year 1 to ${pc(CU.sbgRetention(regFit.alpha, regFit.beta, 12))} in year 12, because the customers with high churn probabilities leave first.`,
  },
  {
    id: 'm06-fn-15', lesson: 'predicting-churn', type: 'steps', kind: 'applied',
    prompt: `Ana ranks the ${int(CT.length)} members who joined by 31 August by their recency on 31 October 2027 (longest silence first) and cuts them into tenths. ${int(LIFT.positives)} of them (${pc(LIFT.base)}) lapsed in November–December. The first two tenths, ${LIFT.rows[0].n + top2.n} members, contained ${LIFT.rows[0].positives + top2.positives} of the lapsers.`,
    steps: [
      {
        id: 'm06-fn-15-s1', type: 'num', kind: 'numerical',
        prompt: 'What is the cumulative lift of the top two tenths? Give two decimal places.',
        answer: rnd(top2.cumLift, 2),
        check: () => ((LIFT.rows[0].positives + LIFT.rows[1].positives) / (LIFT.rows[0].n + LIFT.rows[1].n)) / LIFT.base,
        unit: '', places: 2, tol: 0.01,
        wrong: [
          { value: rnd(top2.captured * 100, 2), say: 'That is the share of all lapsers captured (the gains curve), as a percentage. Lift divides the group’s lapse rate by the base rate.' },
          { value: rnd(((LIFT.rows[0].positives + top2.positives) / (LIFT.rows[0].n + top2.n)) * 100, 2), say: `That is the group’s lapse rate as a percentage. Divide it by the base rate of ${pc(LIFT.base)}.` },
        ],
        solution: `The group’s lapse rate is ${LIFT.rows[0].positives + top2.positives} ÷ ${LIFT.rows[0].n + top2.n} = ${pc((LIFT.rows[0].positives + top2.positives) / (LIFT.rows[0].n + top2.n))}; ÷ ${pc(LIFT.base)} = ${fx(top2.cumLift, 2)}. With two thirds lapsing, no group can have a lift above 1 ÷ ${fx(LIFT.base, 3)} = ${fx(maxLift, 2)}, so this score is close to the ceiling.`,
      },
      {
        id: 'm06-fn-15-s2', type: 'mc', kind: 'applied',
        prompt: 'Ana proposes spending the win-back budget on the top two tenths, “because that is where the lapsers are”. What is the main weakness?',
        options: [
          'The score finds the members likeliest to lapse, not those an offer would change; many of them are probably gone for good',
          'The lift is too low to act on, since a useful churn score should have a lift of at least 2 in its top groups',
          'Recency leaks the outcome, because it is measured on the same members whose November–December visits are being predicted',
          'The top two tenths are too small a group to be worth contacting, so the budget should go to the whole base at once',
        ],
        answer: 0,
        feedback: {
          1: `A lift of 2 is impossible here: with ${pc(LIFT.base, 0)} lapsing the ceiling is 1 ÷ ${fx(LIFT.base, 3)} = ${fx(maxLift, 2)}, and this score is near it.`,
          2: 'Recency on 31 October uses only visits before the holdout, so it doesn’t leak. It is a fair predictor; the problem is what prediction can’t tell you.',
          3: 'Size isn’t the issue: the question is whether contacting any group changes what its members do, and the score doesn’t say.',
        },
        solution: 'A churn score ranks who will lapse; an offer pays only where it changes the outcome (uplift). Members silent for months are the likeliest to lapse, and many have probably stopped for good, so an offer may change little there; members nearer the middle may respond more. Only a randomised test with a holdout in each band shows where the offer works.',
      },
    ],
    solution: `Cumulative lift ${fx(top2.cumLift, 2)} (ceiling ${fx(maxLift, 2)}). High lift ranks lapsers well but doesn’t show where an offer would change anyone’s behaviour.`,
  },
  {
    id: 'm06-fn-16', lesson: 'predicting-churn', type: 'num', kind: 'numerical',
    prompt: `Ten members of the churn table, with their recency on 31 October 2027 (the score: longer silence = more likely to lapse) and whether they lapsed in November–December. What is the score’s AUC on these ten: the share of (lapser, non-lapser) pairs in which the lapser has the higher score, ties counting a half? Give three decimal places.`,
    data: { table: { head: ['Member', 'Days since last visit', 'Lapsed'], align: ['l', 'r', 'l'], rows: P16.map((c) => [c.id, c.recency, c.lapsed ? 'yes' : 'no']) } },
    answer: rnd(auc16, 3),
    check: () => pairs16.w / pairs16.n,
    unit: '', places: 3, tol: 0.001,
    wrong: [
      { value: rnd(P16.filter((c) => (c.recency > 60) === !!c.lapsed).length / P16.length, 3), say: 'That is the accuracy of a 60-day cut-off. AUC uses no cut-off: it compares every lapser with every non-lapser.' },
      { value: rnd(1 - auc16, 3), say: 'That counts the pairs the score gets wrong. AUC is the share it gets right, the lapser scoring higher.' },
    ],
    solution: `There are 5 × 5 = 25 pairs. In ${pairs16.w} of them the lapser had been silent longer, so AUC = ${pairs16.w} ÷ 25 = ${fx(auc16, 3)}. AUC measures ranking, not calibration or profit; on all ${int(CT.length)} members recency’s AUC is ${fx(roc(CT.map((c) => c.lapsed), CT.map((c) => c.recency)).auc, 3)}.`,
  },
  {
    id: 'm06-fn-17', lesson: 'survival-analysis', type: 'mc', kind: 'conceptual',
    prompt: `Ana compares members who live or work within a mile (near) with the rest by Kaplan–Meier and the log-rank test, under three lapse rules. Median lifetimes, near against far: ${N17.map((x) => `${x.L}-day rule ${x.near} against ${x.far} days (p ${x.p < 0.001 ? 'below 0.001' : `= ${p3(x.p)}`})`).join('; ')}. What is the soundest reading?`,
    options: [
      'Near members visit more often, so they take longer to have a 30-day gap; with longer rules near and far members lapse at much the same pace',
      'Near members stay longer, as the 30-day test shows clearly; the 60- and 90-day rules have too few lapses to detect the difference',
      'The 90-day rule is the right one, because it is the longest, so near members actually leave sooner than the members who live further away',
      'Living near Lantern makes members stay longer, so the cafés should recruit members from nearby streets to cut churn',
    ],
    answer: 0,
    feedback: {
      1: `The longer rules still have over ${int(Math.floor(Math.min(N17[1].events, N17[2].events) / 100) * 100)} lapses each; they show no difference (p = ${p3(N17[1].p)} and ${p3(N17[2].p)}).`,
      2: 'Longer isn’t automatically right, and the 90-day medians don’t differ significantly. The point is that the short rule confuses gaps between visits with leaving.',
      3: 'Near is a circumstance, not something assigned, so any difference is an association; and here the difference vanishes once the rule is long enough to tell a gap from a departure.',
    },
    solution: `A lapse rule turns silence into “lapsed”. Near members visit more often (their visit rates are higher), so under a 30-day rule they take longer to have a gap long enough to count as lapsed (most members of both groups still lapse under it). Under 60- and 90-day rules the difference disappears (p = ${p3(N17[1].p)} and ${p3(N17[2].p)}): being near goes with how often members come, not with staying longer, and the data give no sign that near members last longer once gaps are told apart from departures. Report results under more than one lapse rule, and treat any group difference as an association.`,
  },

  // ================================================================ Module 4: customer value and strategy
  {
    id: 'm06-fn-18', lesson: 'customer-lifetime-value', type: 'steps', kind: 'numerical',
    prompt: `Cogwell Cycle Care (fictional) sells a monthly bike-servicing plan. Each plan brings a margin of $${CY.m} at the start of every month it runs, the first month now; ${pc(CY.r, 0)} of plans continue each month; the firm discounts at ${pc(CY.d, 1)} a month. Winning a customer costs $${CY.cac}.`,
    steps: [
      {
        id: 'm06-fn-18-s1', type: 'num', kind: 'numerical',
        prompt: 'What is a new customer’s lifetime value under constant retention? Give dollars to the cent.',
        answer: rnd(cyV, 2),
        check: () => 9 * 1.008 / (1.008 - 0.95),
        unit: '$', places: 2, tol: 0.01,
        wrong: [
          { value: rnd(CY.m / (1 - CY.r), 2), say: 'That ignores discounting: $9 × 20 months. Each later margin is worth less today.' },
          { value: rnd(CU.clvConstant({ m: CY.m, r: CY.r, d: CY.d, timing: 'end' }).value, 2), say: 'That leaves out the first month’s margin, which arrives now. It values a customer just after the first payment.' },
        ],
        solution: `CLV = m(1 + d) ÷ (1 + d − r) = 9 × 1.008 ÷ ${fx(1 + CY.d - CY.r, 3)} = ${money(cyV)}.`,
      },
      {
        id: 'm06-fn-18-s2', type: 'num', kind: 'numerical',
        prompt: `In which month does a new customer’s expected discounted margin first cover the $${CY.cac} acquisition cost?`,
        answer: cyPay,
        check: () => { let s = 0; for (let t = 0; t < 600; t++) { s += 9 * 0.95 ** t / 1.008 ** t; if (s >= 60) return t + 1; } return Infinity; },
        unit: 'month', places: 0, tol: 0,
        wrong: [
          { value: Math.ceil(cySimple), say: `$60 ÷ $9 = ${fx(cySimple, 1)} months, covered in month ${Math.ceil(cySimple)}, assumes every customer stays and money now is worth the same as later. With 5% leaving each month and discounting, the expected margin builds more slowly.` },
          { value: cyPayNoDisc, say: 'That allows for customers leaving but not for discounting. Discount each month’s expected margin by 1.008 per month.' },
        ],
        solution: `Month t (from 1) adds 9 × 0.95^(t−1) ÷ 1.008^(t−1); the running total first reaches $${CY.cac} in month ${cyPay}, against a simple payback of ${fx(cySimple, 1)} months (${cyPayNoDisc} with retention but no discounting). The value-to-cost ratio is ${money(cyV)} ÷ $${CY.cac} = ${fx(cyV / CY.cac, 2)}.`,
      },
    ],
    solution: `CLV ${money(cyV)}; payback in month ${cyPay}; value ÷ cost ${fx(cyV / CY.cac, 2)}. Both rest on a constant 95% and a margin, not revenue, and are forecasts.`,
  },
  {
    id: 'm06-fn-19', lesson: 'customer-lifetime-value', type: 'formula', kind: 'numerical',
    prompt: `Column B holds Lantern’s April 2027 cohort’s spend per joiner in each month since joining (month 0 is April, month 7 November), from the cohort revenue table. H1 holds the cafés’ margin rate and H2 a monthly discount rate. In H3, calculate in one formula the value at joining of the margin these eight months brought per joiner: each month’s margin discounted back to month 0.`,
    sheet: { cells: { A1: 'month since joining', B1: 'spend per joiner ($)', ...col('A', 2, marRev.map((_, k) => k)), ...col('B', 2, marRev), G1: 'margin rate', H1: MR, G2: 'discount rate a month', H2: DM, G3: 'value at joining ($)' }, fixed: ['A2:A9', 'H1'], vary: { H2: [0.005, 0.018] } },
    cell: 'H3', view: 'A1:H9', formats: { B: '$#,##0.00', H1: '0%', H2: '0.0%', H3: '$#,##0.00' }, widths: { A: 10, B: 11, G: 20, H: 11 },
    answer: '=SUMPRODUCT(B2:B9*H1/(1+H2)^A2:A9)',
    alt: ['=H1*SUMPRODUCT(B2:B9/(1+H2)^A2:A9)', '=SUMPRODUCT(B2:B9,H1/(1+H2)^A2:A9)', '=H1*SUMPRODUCT(B2:B9,1/(1+H2)^A2:A9)'],
    wrong: [
      { formula: '=SUM(B2:B9)*H1', say: 'That is the undiscounted margin. Money in month 7 is worth less at joining: divide each month by (1 + H2) to the power of its month.' },
      { formula: '=SUMPRODUCT(B2:B9*H1/(1+H2)^(A2:A9+1))', say: 'Month 0’s spend is at joining, so it isn’t discounted: the power is the month since joining itself.' },
      { formula: '=SUMPRODUCT(B2:B9/(1+H2)^A2:A9)', say: 'That discounts spend, not margin. Multiply by the margin rate in H1.' },
    ],
    solution: `<x>=SUMPRODUCT(B2:B9*H1/(1+H2)^A2:A9)</x> = ${money(marPV(DM))} per joiner (${money(marUndisc)} undiscounted). This is historical value over eight months, not a lifetime value: a forecast would add the months still to come, and it describes the cohort, not any one member.`,
  },
  {
    id: 'm06-fn-20', lesson: 'customer-lifetime-value', type: 'mc', kind: 'conceptual',
    prompt: `Ravenstow Insurance Brokers (fictional) earns $${RV.m} of margin a year per client, at the start of each year, and discounts at ${pc(RV.d, 0)}. ${pc(rvR1, 0)} of new clients renew after the first year. Valued with constant ${pc(rvR1, 0)} retention, a new client is worth ${money(rvConst)}. Clients differ, and an sBG with α = ${RV.a} and β = ${RV.b} fits the firm’s renewals (first-year retention ${pc(rvR1, 0)}). Under that model a new client is worth ${money(rvSbg)}. Why is the second figure higher?`,
    options: [
      'Clients who renew are the more loyal ones, so later retention rises above 75% and adds margins that constant retention leaves out',
      'The sBG discounts later years less heavily than the constant-retention formula does, so each year’s margin counts for more',
      'The sBG counts the first year’s margin twice, once when the client joins and once again at the first renewal',
      'Constant retention assumes every client leaves after four years, while the sBG lets the cohort go on renewing indefinitely',
    ],
    answer: 0,
    feedback: {
      1: 'Both use the same 10% discount rate; the difference is the retention path.',
      2: 'Both count the first margin once, at the start; the sBG’s higher value comes from the renewals.',
      3: 'Constant retention also runs forever, with 75% of the remaining clients renewing every year; it is the rate that differs, not the horizon.',
    },
    solution: `With the same first-year retention, the sBG’s retention rises with tenure, (β + t − 1) ÷ (α + β + t − 1): ${pc(CU.sbgRetention(RV.a, RV.b, 1), 0)}, then ${pc(CU.sbgRetention(RV.a, RV.b, 2), 0)}, ${pc(CU.sbgRetention(RV.a, RV.b, 3), 0)} …, because the clients most likely to leave go first. One average rate understates the long-lived clients, so a business whose customers differ is worth more than an average retention rate suggests: ${money(rvSbg)} against ${money(rvConst)}.`,
  },
  {
    id: 'm06-fn-21', lesson: 'acquisition-cost-and-payback', type: 'mc', kind: 'applied',
    prompt: `Aldersey Pottery Studio (fictional) sells a monthly class pass bringing $${AP.ch[0].m} of margin at the start of each month. Customers won by ${AP.ch[0].name.toLowerCase()} cost $${AP.ch[0].cac} each and ${pc(AP.ch[0].r, 0)} stay each month; those from ${AP.ch[1].name.toLowerCase()} cost $${AP.ch[1].cac} and ${pc(AP.ch[1].r, 0)} stay. It discounts at 1% a month. Which statement is right?`,
    options: [
      `Social ads pay back sooner (month ${apPay[0]} against ${apPay[1]}), but referrals have the higher value-to-cost ratio (${fx(apRatio[1], 2)} against ${fx(apRatio[0], 2)})`,
      `Social ads are better on both counts, since they cost less than half as much per customer and the customers bring the same margin a month`,
      `Referrals are better on both counts, since their customers stay longer and so pay back the higher acquisition cost sooner as well`,
      `The two are equal, since each channel’s customers bring $${AP.ch[0].m} a month and payback depends only on the margin and the acquisition cost`,
    ],
    answer: 0,
    feedback: {
      1: `Cheaper customers pay back sooner, but they leave faster: lifetime value ${money(apV[0])} against ${money(apV[1])}, so referrals return more per dollar.`,
      2: `Staying longer raises lifetime value, but a $${AP.ch[1].cac} cost still takes longer to cover than $${AP.ch[0].cac}.`,
      3: 'Simple payback depends only on margin and cost; with retention and discounting, how long customers stay matters too.',
    },
    solution: `Lifetime values: 22 × 1.01 ÷ (1.01 − 0.80) = ${money(apV[0])} and 22 × 1.01 ÷ (1.01 − 0.93) = ${money(apV[1])}. Ratios ${fx(apRatio[0], 2)} and ${fx(apRatio[1], 2)}; payback months ${apPay[0]} and ${apPay[1]}. Which matters more depends on cash: a studio that can wait should prefer referrals; one short of cash may need the faster payback.`,
  },
  {
    id: 'm06-fn-22', lesson: 'acquisition-cost-and-payback', type: 'mc', kind: 'applied',
    prompt: `Wetherlam Outdoor (fictional) spent $${WO.spend.toLocaleString('en-US')} on online ads last quarter. ${WO.paid} new customers came through the ads and ${WO.organic} found the shop by themselves, as they do every quarter. The marketing lead reports a CAC of $${fx(WO.spend / (WO.paid + WO.organic), 0)} and wants to double the ad budget, since a customer is worth $25. What should the analyst say?`,
    options: [
      `The ads cost $${fx(WO.spend / WO.paid, 0)} per customer they won; the $${fx(WO.spend / (WO.paid + WO.organic), 0)} blended figure credits them with customers who came anyway`,
      `The blended $${fx(WO.spend / (WO.paid + WO.organic), 0)} is right because every new customer counts, so doubling the budget should double the profit`,
      `Divide by the ${WO.organic} organic customers instead, since they are the shop’s natural rate of growth, giving $${fx(WO.spend / WO.organic, 0)}`,
      'CAC can’t be judged without the value-to-cost ratio reaching 3, the standard that every business is held to',
    ],
    answer: 0,
    feedback: {
      1: `Doubling the budget won’t double the ${WO.organic} customers who come without ads. Spend should be compared with the customers it adds: $${fx(WO.spend / WO.paid, 0)} each, above the $25 value.`,
      2: 'The organic customers aren’t what the spend bought; dividing by them answers no useful question.',
      3: 'The 3:1 figure is a rule of thumb from practice, not a standard; and the first problem is the CAC itself.',
    },
    solution: `Blended CAC = $${WO.spend.toLocaleString('en-US')} ÷ ${WO.paid + WO.organic} = $${fx(WO.spend / (WO.paid + WO.organic), 2)}; paid CAC = $${WO.spend.toLocaleString('en-US')} ÷ ${WO.paid} = $${fx(WO.spend / WO.paid, 2)}. For a budget decision, compare the spend with the customers it adds, and even “came through the ads” relies on attribution: some would have found the shop anyway, which only a holdout (ads off in some areas or weeks) would show.`,
  },
  {
    id: 'm06-fn-23', lesson: 'loyalty-and-retention-strategy', type: 'steps', kind: 'applied',
    prompt: `Cragwell Bike Hire (fictional) emailed a $${CB.cost} voucher to ${CB.nT} lapsed customers chosen at random and held out ${CB.nC}. Within two months ${CB.xT} of those emailed (all using the voucher) and ${CB.xC} of the holdout hired again. A customer won back is worth $${CB.value} of margin.`,
    steps: [
      {
        id: 'm06-fn-23-s1', type: 'num', kind: 'numerical',
        prompt: 'Calculate the lower limit of the 95% confidence interval for the difference in return rates (emailed minus holdout), with the unpooled standard error and z = 1.96. Give percentage points to one decimal place.',
        answer: rnd(cbT.low * 100, 1),
        check: () => { const a = 136 / 800, b = 96 / 800; return (a - b - 1.959964 * Math.sqrt(a * (1 - a) / 800 + b * (1 - b) / 800)) * 100; },
        unit: 'points', places: 1, tol: 0.1,
        wrong: [
          { value: rnd(cbT.diff * 100, 1), say: 'That is the point estimate of the uplift. The lower limit subtracts 1.96 standard errors.' },
        ],
        solution: `Rates ${pc(cbT.p1)} and ${pc(cbT.p2)}; difference ${fx(cbT.diff * 100, 1)} points; SE = √(p₁(1 − p₁)/n₁ + p₂(1 − p₂)/n₂) = ${fx(cbT.se * 100, 2)} points; lower limit ${fx(cbT.low * 100, 1)} points (upper ${fx(cbT.high * 100, 1)}).`,
      },
      {
        id: 'm06-fn-23-s2', type: 'mc', kind: 'applied',
        prompt: 'Should Cragwell send the voucher to all its lapsed customers?',
        options: [
          `Not yet: it gains ${money(cbNet(cbT.diff))} per customer at the estimated uplift but loses ${money(-cbNet(cbT.low))} at the lower limit`,
          `Yes: ${CB.xT} customers came back after the email, worth $${int(CB.xT * CB.value)}, far more than the $${CB.xT * CB.cost} the vouchers cost`,
          'No: the interval doesn’t include zero, but a difference this small is not of practical significance for a business',
          'No: only a two-proportion z test can say whether to send it, and the confidence interval is no help with the decision',
        ],
        answer: 0,
        feedback: {
          1: `Most of the ${CB.xT} would have hired anyway (the holdout’s rate implies about ${int(CB.nT * cbT.p2)}). Only the uplift was won, while every returner used a voucher.`,
          2: 'Practical significance is the point, but it is judged in money: at the point estimate the voucher pays.',
          3: 'The test and the interval carry the same evidence; the interval is more useful here because it can be turned into money at each end.',
        },
        solution: `Per customer emailed: uplift × $${CB.value} − (return rate × $${CB.cost}). At the point estimate (${fx(cbT.diff * 100, 1)} points): ${money(cbNet(cbT.diff))}; at the lower limit (${fx(cbT.low * 100, 1)} points): ${money(cbNet(cbT.low))}. The break-even uplift is ${fx((cbT.p1 * CB.cost / CB.value) * 100, 1)} points, inside the interval. A larger test, or a cheaper voucher, would settle it.`,
      },
    ],
    solution: `The randomised holdout gives the uplift (${fx(cbT.diff * 100, 1)} points, 95% CI ${fx(cbT.low * 100, 1)} to ${fx(cbT.high * 100, 1)}); valuing both ends against the cost of every voucher shows the decision is close.`,
  },
  {
    id: 'm06-fn-24', lesson: 'loyalty-and-retention-strategy', type: 'mc', kind: 'conceptual',
    prompt: 'The owner of a fictional sandwich bar with a ten-stamp card notices that customers with eight or nine stamps come back sooner than customers with two or three. She concludes that the card is making her customers more loyal overall. How does the research discussed in the course bear on this?',
    options: [
      'Kivetz, Urminsky and Zheng found purchases speed up as a reward nears, but that shows timing within the card, not more loyalty overall',
      'It confirms her view: Kivetz, Urminsky and Zheng showed that stamp cards double the number of visits customers make in a year',
      'Sharp and Sharp found that loyalty programmes create large excess loyalty, so her card is very likely to be working as she thinks',
      'Double jeopardy shows that small businesses gain the most from loyalty cards, because their customers are the least loyal to start with',
    ],
    answer: 0,
    feedback: {
      1: 'Kivetz, Urminsky and Zheng (2006) found purchases speeding up as the reward approached (about 20% from the first interval to the last), not a doubling of visits in a year.',
      2: 'Sharp and Sharp (1997) found only weak, inconsistent excess loyalty in a large programme.',
      3: 'Double jeopardy says small brands have fewer buyers who also buy less often; a loyalty scheme pushes against that pattern rather than benefiting from it.',
    },
    solution: 'The goal-gradient effect explains her observation: customers near the reward speed up. That is a change in timing among card holders, who chose to collect stamps, near the reward. Whether the card adds visits overall needs a comparison she doesn’t have, ideally a randomised one (cards offered in some weeks or to some customers and not others). The broader evidence (Dowling and Uncles 1997; Sharp and Sharp 1997) is that typical programmes add little loyalty.',
  },
];
