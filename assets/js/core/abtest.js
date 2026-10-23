// abtest.js — comparing two conversion rates, and planning how many visitors a test needs.
import { normCdf, normQuantile } from './stats.js?v=10';

/**
 * Two-proportion z-test (pooled standard error for the test, unpooled for the interval).
 * a = control, b = variant: { n, conv }.
 */
export function compareRates(a, b, { conf = 0.95 } = {}) {
  if (![a.n, a.conv, b.n, b.conv].every(Number.isFinite)) return { error: 'Fill in visitors and conversions for both versions.' };
  if (a.n <= 0 || b.n <= 0) return { error: 'Each version needs at least one visitor.' };
  if (a.conv < 0 || b.conv < 0 || a.conv > a.n || b.conv > b.n) return { error: 'Conversions have to be between zero and the number of visitors.' };
  const pa = a.conv / a.n, pb = b.conv / b.n, diff = pb - pa;
  const pool = (a.conv + b.conv) / (a.n + b.n);
  const sePool = Math.sqrt(pool * (1 - pool) * (1 / a.n + 1 / b.n));
  const z = sePool > 0 ? diff / sePool : 0;
  const p = sePool > 0 ? 2 * (1 - normCdf(Math.abs(z))) : 1;
  const se = Math.sqrt((pa * (1 - pa)) / a.n + (pb * (1 - pb)) / b.n);
  const zc = normQuantile(1 - (1 - conf) / 2);
  const small = [a.conv, a.n - a.conv, b.conv, b.n - b.conv].some((v) => v < 10);
  return { pa, pb, diff, lift: pa > 0 ? diff / pa : NaN, z, p, low: diff - zc * se, high: diff + zc * se, liftLow: pa > 0 ? (diff - zc * se) / pa : NaN, liftHigh: pa > 0 ? (diff + zc * se) / pa : NaN, small };
}

/**
 * Visitors needed in each version to detect a change from rate p1 to p2 with a two-sided test
 * (normal approximation, Fleiss without continuity correction).
 */
export function sampleSize(p1, p2, { alpha = 0.05, power = 0.8 } = {}) {
  if (!(p1 > 0 && p1 < 1 && p2 > 0 && p2 < 1) || p1 === p2) return NaN;
  const za = normQuantile(1 - alpha / 2), zb = normQuantile(power), pbar = (p1 + p2) / 2;
  const num = za * Math.sqrt(2 * pbar * (1 - pbar)) + zb * Math.sqrt(p1 * (1 - p1) + p2 * (1 - p2));
  return Math.ceil((num * num) / ((p2 - p1) ** 2));
}

/** Power of the two-sided test at n visitors per version (same approximation as sampleSize). */
export function power(p1, p2, n, { alpha = 0.05 } = {}) {
  const za = normQuantile(1 - alpha / 2), pbar = (p1 + p2) / 2;
  const s0 = Math.sqrt(2 * pbar * (1 - pbar) / n), s1 = Math.sqrt((p1 * (1 - p1) + p2 * (1 - p2)) / n), d = Math.abs(p2 - p1);
  return normCdf((d - za * s0) / s1) + normCdf((-d - za * s0) / s1);
}
