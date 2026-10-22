// format.js — number formatting shared by every room. en-US conventions; minus sign is U+2212.

const cache = new Map();
const nf = (opts) => { const k = JSON.stringify(opts); if (!cache.has(k)) cache.set(k, new Intl.NumberFormat('en-US', opts)); return cache.get(k); };
const minus = (t) => t.replace(/^-/, '−');

export function num(v, digits = 2) {
  if (!Number.isFinite(v)) return '—';
  return minus(nf({ minimumFractionDigits: digits, maximumFractionDigits: digits }).format(v));
}
/** Significant-ish formatting for statistics of unknown scale. */
export function auto(v, sig = 4) {
  if (!Number.isFinite(v)) return '—';
  const a = Math.abs(v);
  if (a !== 0 && (a < 1e-3 || a >= 1e7)) return minus(v.toExponential(2));
  const d = a >= 1000 ? 0 : a >= 100 ? 1 : a >= 10 ? 2 : a >= 1 ? 3 : Math.min(6, sig);
  return minus(nf({ minimumFractionDigits: 0, maximumFractionDigits: d }).format(v));
}
export function int(v) { return Number.isFinite(v) ? minus(nf({ maximumFractionDigits: 0 }).format(v)) : '—'; }
export function pct(fraction, digits = 1) { return Number.isFinite(fraction) ? minus(nf({ style: 'percent', minimumFractionDigits: digits, maximumFractionDigits: digits }).format(fraction)) : '—'; }
export function money(v, { digits = 0, compact = false, unit = '' } = {}) {
  if (!Number.isFinite(v)) return '—';
  const t = compact ? nf({ notation: 'compact', maximumFractionDigits: 1 }).format(Math.abs(v)) : nf({ minimumFractionDigits: digits, maximumFractionDigits: digits }).format(Math.abs(v));
  return `${v < 0 ? '−' : ''}$${t}${unit}`;
}
export function compact(v) { return Number.isFinite(v) ? minus(nf({ notation: 'compact', maximumFractionDigits: 1 }).format(v)) : '—'; }
export function signed(v, digits = 2) { if (!Number.isFinite(v)) return '—'; const t = num(Math.abs(v), digits); return v > 0 ? `+${t}` : v < 0 ? `−${t}` : t; }
export function pValue(p) {
  if (!Number.isFinite(p)) return '—';
  if (p < 0.001) return '< 0.001';
  return p < 0.01 ? p.toFixed(3) : p.toFixed(2);
}
export function tick(v, step) {
  if (!Number.isFinite(v)) return '';
  const a = Math.abs(v);
  if (a >= 1e4) return compact(v);
  const d = step >= 1 || step === 0 ? 0 : Math.min(4, Math.ceil(-Math.log10(step)));
  return minus(nf({ minimumFractionDigits: d, maximumFractionDigits: d }).format(v));
}
export function date(ms) { return Number.isFinite(ms) ? new Date(ms).toISOString().slice(0, 10) : '—'; }
