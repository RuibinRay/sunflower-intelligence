// lib.mjs — shared by tools/study-check.mjs (the content checker) and tools/study.mjs (the page generator).
// Loads the curriculum and lesson files, renders lesson blocks to HTML, typesets TeX with KaTeX, and collects
// problems as it goes so the checker can report them all at once.
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';
import katex from 'katex';

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
export const DATA = join(ROOT, 'assets/js/data/study');
const imp = (p) => import(pathToFileURL(p).href + (process.env.STUDY_FRESH ? `?t=${Date.now()}` : ''));

export const catalog = await imp(join(DATA, 'catalog.js'));
export const BUILT = catalog.COURSES.filter((c) => c.modules);

/** Course chart of accounts (F01) by account name, or null for courses without one. */
const charts = {};
/** A chart of accounts as { name: account }, cached; chartSync reads the cache for charts loaded already. */
export const chartSync = (key) => charts[key] ?? null;
export async function chartFor(course) {
  if (course in charts) return charts[course];
  const p = course.includes('/') ? join(DATA, `${course}.js`) : join(DATA, course, 'case.js');   // 'f01' or a file such as 'f01/brightwater'
  if (!existsSync(p)) return (charts[course] = null);
  const m = await imp(p);
  charts[course] = m.CHART ? Object.fromEntries(m.CHART.map((a) => [a.name, a])) : null;
  return charts[course];
}
export async function caseFor(course) {
  const p = join(DATA, course, 'case.js');
  return existsSync(p) ? imp(p) : null;
}

export function lessonsOf(course) {
  const c = catalog.COURSE[course];
  return c?.modules ? c.modules.flatMap((m) => m.lessons.map((slug, i) => ({ course, slug, module: m.n, moduleTitle: m.title, index: i }))) : [];
}
export function lessonPath(course, slug) { return join(DATA, course, `${slug}.js`); }
export function exPath(course, slug) { return join(DATA, course, `${slug}.ex.js`); }
export async function loadLesson(course, slug) {
  const p = lessonPath(course, slug);
  return existsSync(p) ? (await imp(p)).default : null;
}
export async function loadEx(course, slug) {
  const p = exPath(course, slug);
  return existsSync(p) ? imp(p) : null;
}
export async function loadModuleFile(course, name) {
  const p = join(DATA, course, `${name}.js`);
  return existsSync(p) ? imp(p) : null;
}

// ---------------------------------------------------------------- small formatting helpers
export const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
export const strip = (s) => String(s ?? '').replace(/<x>([\s\S]*?)<\/x>/g, (_, t) => t.replace(/</g, '‹').replace(/>/g, '›')).replace(/<m>[\s\S]*?<\/m>/g, ' x ').replace(/<M>[\s\S]*?<\/M>/g, ' x ').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
export const words = (s) => (strip(s).match(/[A-Za-z0-9][\w’'-]*/g) || []).length;
/** Glossary key: lower case, singular ("Liabilities" and "liability" match). */
export const glossKey = (t) => { let k = strip(t).toLowerCase().replace(/[’']/g, ''); if (/ies$/.test(k)) k = k.replace(/ies$/, 'y'); else if (/[^s]s$/.test(k)) k = k.slice(0, -1); return k; };
export const slugify = (s) => strip(s).toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const grp = (n, d) => {
  const t = Math.abs(n).toFixed(d);
  const [i, f] = t.split('.');
  return i.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + (f ? `.${f}` : '');
};
const placesOf = (n) => (Math.abs(n - Math.round(n)) < 1e-9 ? 0 : 2);
/** 12000 → "12,000"; 12.5 → "12.50". */
export const amount = (n) => grp(n, placesOf(n));
/** Dollars with parentheses for negatives: −610 → "($610)". */
export const dollars = (n, sign = true) => (n < 0 ? `(${sign ? '$' : ''}${amount(-n)})` : `${sign ? '$' : ''}${amount(n)}`);
export const sum = (a) => a.reduce((s, v) => s + v, 0);
const near = (a, b, tol = 0.005) => Math.abs(a - b) <= tol + 1e-9;
const dateText = (iso) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || '');
  if (!m) return esc(iso || '');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${+m[3]} ${months[+m[2] - 1]}`;
};
export { dateText };

// ---------------------------------------------------------------- maths and inline HTML
export function tex(src, display = false) {
  return katex.renderToString(String(src), { displayMode: display, throwOnError: true, output: 'htmlAndMathml', strict: 'ignore', trust: false });
}

const ALLOWED = new Set(['b', 'strong', 'i', 'em', 'sub', 'sup', 'br', 'code', 'abbr', 'a', 'm', 'M', 'g', 'span', 'x']);
const ALLOWED_EX = new Set(['b', 'strong', 'i', 'em', 'sub', 'sup', 'br', 'code', 'abbr', 'a', 'x']);   // <x>: an Excel formula, shown as typed (B03)

/**
 * Check a string's tags against the allow-list. `where` names the field for error messages.
 * Returns the problems found (strings).
 */
export function tagProblems(html, where, { exercise = false } = {}) {
  const out = [];
  const s = String(html ?? '').replace(/<x>[\s\S]*?<\/x>/g, '<x></x>');   // a formula's < > & are text, not tags
  const allowed = exercise ? ALLOWED_EX : ALLOWED;
  for (const m of s.matchAll(/<\/?([a-zA-Z][a-zA-Z0-9]*)([^>]*)>/g)) {
    const tag = m[1];
    if (!allowed.has(tag)) { out.push(`${where}: tag <${tag}> is not allowed${exercise && /^(m|M|g)$/.test(tag) ? ' in exercises (no TeX or glossary links there: use plain text)' : ''}`); continue; }
    const attrs = m[2].trim();
    if (attrs && !m[0].startsWith('</')) {
      for (const a of attrs.matchAll(/([a-zA-Z-]+)\s*=/g)) if (!['href', 'title', 'class'].includes(a[1].toLowerCase())) out.push(`${where}: attribute ${a[1]} on <${tag}> is not allowed`);
      if (/\bon\w+\s*=|javascript:/i.test(attrs)) out.push(`${where}: script in attributes is not allowed`);
    }
  }
  if (/\*\*[^*]+\*\*|(^|\s)_[^_]+_(\s|$)/.test(s)) out.push(`${where}: looks like Markdown; use <b> or <i>`);
  // straight quotes in prose (outside tags and TeX) — warn-level, reported by the caller
  return out;
}

/**
 * Render an inline HTML string: TeX in <m>/<M>, glossary links in <g>. `ctx` collects errors and the glossary
 * terms used, and supplies `glossaryHref`.
 */
export function inline(html, ctx = {}, where = '') {
  let s = String(html ?? '').replace(/<x>([\s\S]*?)<\/x>/g, (_, t) => `<code class="xl">${esc(t)}</code>`);
  s = s.replace(/<M>([\s\S]*?)<\/M>/g, (_, t) => {
    try { return `<span class="math-display">${tex(t, true)}</span>`; } catch (e) { (ctx.errors ||= []).push(`${where}: TeX error in <M>${t}</M>: ${e.message}`); return esc(t); }
  });
  s = s.replace(/<m>([\s\S]*?)<\/m>/g, (_, t) => {
    try { return tex(t, false); } catch (e) { (ctx.errors ||= []).push(`${where}: TeX error in <m>${t}</m>: ${e.message}`); return esc(t); }
  });
  s = s.replace(/<g>([\s\S]*?)<\/g>/g, (_, t) => {
    (ctx.terms ||= []).push({ term: strip(t), where });
    return ctx.glossaryHref ? `<a class="g-term" href="${ctx.glossaryHref}#g-${slugify(glossKey(t))}">${t}</a>` : t;
  });
  return s;
}

// ---------------------------------------------------------------- blocks
const CALLOUT = { key: 'Key idea', note: 'Note', warn: 'Caution', standards: 'Standards' };
const ICON = {
  key: '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 2.5l2.2 4.6 5 .7-3.6 3.5.9 5-4.5-2.4-4.5 2.4.9-5L2.8 7.8l5-.7z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>',
  note: '<svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="8" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M10 9v5M10 6.2v.3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
  warn: '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 2.8 18 16.6H2z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M10 8v4.2M10 14.4v.3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
  standards: '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 3.5h9l3 3v10H4z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M7 9h6M7 12h6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
};

function journalHTML(j, ctx, where) {
  const chart = ctx.chart;
  const rows = [];
  (j.entries || []).forEach((e, ei) => {
    const lines = e.lines || [];
    const dr = sum(lines.map((l) => l.dr || 0)), cr = sum(lines.map((l) => l.cr || 0));
    if (!near(dr, cr)) (ctx.errors ||= []).push(`${where} entry ${ei + 1}: debits ${dr} ≠ credits ${cr}`);
    lines.forEach((l, li) => {
      if ((l.dr == null) === (l.cr == null)) (ctx.errors ||= []).push(`${where} entry ${ei + 1} line ${li + 1}: give exactly one of dr or cr`);
      if (chart && !chart[l.acct]) (ctx.errors ||= []).push(`${where} entry ${ei + 1}: account "${l.acct}" is not in the course chart of accounts`);
      if ((l.dr ?? l.cr) <= 0) (ctx.errors ||= []).push(`${where} entry ${ei + 1}: amounts must be positive`);
    });
    const ordered = [...lines.filter((l) => l.dr != null), ...lines.filter((l) => l.cr != null)];
    ordered.forEach((l, k) => rows.push(`<tr${k === 0 ? ' class="j-first"' : ''}><td class="j-date">${k === 0 ? dateText(e.date) : ''}</td><td class="${l.cr != null ? 'j-cr' : 'j-dr'}">${esc(l.acct)}</td><td class="is-num">${l.dr != null ? amount(l.dr) : ''}</td><td class="is-num">${l.cr != null ? amount(l.cr) : ''}</td></tr>`));
    if (e.memo) rows.push(`<tr class="j-memo"><td></td><td colspan="3">${inline(e.memo, ctx, where)}</td></tr>`);
  });
  return `<div class="table-scroll"><table class="data-table journal">${j.caption ? `<caption>${inline(j.caption, ctx, where)}</caption>` : ''}<thead><tr><th scope="col">Date</th><th scope="col">Account</th><th scope="col" class="is-num">Debit ($)</th><th scope="col" class="is-num">Credit ($)</th></tr></thead><tbody>${rows.join('')}</tbody></table></div>`;
}

function normalSide(name, chart) {
  const t = chart?.[name]?.type;
  if (!t) return null;
  return ['asset', 'expense', 'dividends'].includes(t) ? 'dr' : 'cr';
}
function taccountsHTML(t, ctx, where) {
  const accts = (t.accounts || []).map((a) => {
    const dr = a.dr || [], cr = a.cr || [];
    const n = Math.max(dr.length, cr.length);
    const td = sum(dr.map((x) => x[1])), tc = sum(cr.map((x) => x[1]));
    const side = normalSide(a.name, ctx.chart) || (td >= tc ? 'dr' : 'cr');
    const bal = side === 'dr' ? td - tc : tc - td;
    if (ctx.chart && !ctx.chart[a.name]) (ctx.errors ||= []).push(`${where}: T-account "${a.name}" is not in the course chart of accounts`);
    const cell = (x) => (x ? `<span class="t-ref">${inline(x[0], ctx, where)}</span> <span class="num">${amount(x[1])}</span>` : '');
    const body = Array.from({ length: n }, (_, i) => `<tr><td>${cell(dr[i])}</td><td>${cell(cr[i])}</td></tr>`).join('');
    const balRow = `<tr class="t-bal"><td>${side === 'dr' ? `<span class="t-ref">Bal.</span> <span class="num">${dollars(bal)}</span>` : ''}</td><td>${side === 'cr' ? `<span class="t-ref">Bal.</span> <span class="num">${dollars(bal)}</span>` : ''}</td></tr>`;
    return `<table class="t-account"><caption>${esc(a.name)}</caption><thead><tr><th scope="col">Debit</th><th scope="col">Credit</th></tr></thead><tbody>${body}${balRow}</tbody></table>`;
  }).join('');
  return `<figure class="t-accounts">${accts}${t.caption ? `<figcaption>${inline(t.caption, ctx, where)}</figcaption>` : ''}</figure>`;
}

function statementHTML(st, ctx, where) {
  const sec = (st.sections || []).map((s, si) => {
    const rows = (s.rows || []).map((r, ri) => `<tr><th scope="row">${inline(r[0], ctx, where)}</th><td class="is-num">${ri === 0 ? dollars(r[1]) : dollars(r[1], false)}</td></tr>`).join('');
    if (s.total) {
      const tot = sum((s.rows || []).map((r) => r[1]));
      if (!near(tot, s.total[1], 0.5)) (ctx.errors ||= []).push(`${where} section ${si + 1} (${strip(s.head || '')}): rows add to ${tot}, total says ${s.total[1]}`);
    }
    return `${s.head ? `<tr class="st-head"><th scope="rowgroup" colspan="2">${inline(s.head, ctx, where)}</th></tr>` : ''}${rows}${s.total ? `<tr class="st-total"><th scope="row">${inline(s.total[0], ctx, where)}</th><td class="is-num">${dollars(s.total[1])}</td></tr>` : ''}`;
  }).join('');
  const grand = st.grand ? `<tr class="st-grand"><th scope="row">${inline(st.grand[0], ctx, where)}</th><td class="is-num">${dollars(st.grand[1])}</td></tr>` : '';
  return `<figure class="statement"><figcaption><strong>${inline(st.title || '', ctx, where)}</strong>${st.subtitle ? `<span>${inline(st.subtitle, ctx, where)}</span>` : ''}</figcaption><div class="table-scroll"><table class="data-table st-table"><tbody>${sec}${grand}</tbody></table></div>${st.note ? `<p class="note">${inline(st.note, ctx, where)}</p>` : ''}</figure>`;
}

function tableHTML(t, ctx, where) {
  const align = t.align || [];
  const cls = (i) => (align[i] === 'r' ? ' class="is-num"' : align[i] === 'c' ? ' class="is-center"' : '');
  const head = t.head ? `<thead><tr>${t.head.map((c, i) => `<th scope="col"${cls(i)}>${inline(c, ctx, where)}</th>`).join('')}</tr></thead>` : '';
  const body = (t.rows || []).map((r) => `<tr>${r.map((c, i) => (i === 0 && t.rowHeads !== false ? `<th scope="row"${cls(i)}>${inline(c, ctx, where)}</th>` : `<td${cls(i)}>${inline(c, ctx, where)}</td>`)).join('')}</tr>`).join('');
  const foot = t.foot ? `<tfoot>${t.foot.map((r) => `<tr>${r.map((c, i) => (i === 0 ? `<th scope="row"${cls(i)}>${inline(c, ctx, where)}</th>` : `<td${cls(i)}>${inline(c, ctx, where)}</td>`)).join('')}</tr>`).join('')}</tfoot>` : '';
  if (t.head) (t.rows || []).forEach((r, i) => { if (r.length !== t.head.length) (ctx.errors ||= []).push(`${where}: row ${i + 1} has ${r.length} cells, header has ${t.head.length}`); });
  return `<div class="table-scroll"><table class="data-table study-table">${t.caption ? `<caption>${inline(t.caption, ctx, where)}</caption>` : ''}${head}<tbody>${body}</tbody>${foot}</table></div>${t.note ? `<p class="note">${inline(t.note, ctx, where)}</p>` : ''}`;
}

function figureHTML(f, ctx, where) {
  const svg = String(f.svg || '');
  if (!/^\s*<svg[\s>]/.test(svg)) (ctx.errors ||= []).push(`${where}: figure.svg must be an inline <svg> element`);
  if (/<script|\son\w+\s*=|<image|<foreignObject|href\s*=\s*["']https?:/i.test(svg)) (ctx.errors ||= []).push(`${where}: figure.svg may not contain scripts, event handlers, images or external links`);
  if (!f.alt || words(f.alt) < 8) (ctx.errors ||= []).push(`${where}: figure needs an alt text that fully describes it (8+ words)`);
  const clean = svg.replace(/<svg\b/, '<svg aria-hidden="true" focusable="false"');
  return `<figure class="study-figure"><div class="svg-wrap" role="img" aria-label="${esc(strip(f.alt))}">${clean}</div>${f.caption ? `<figcaption>${inline(f.caption, ctx, where)}</figcaption>` : ''}</figure>`;
}

/** Render a list of blocks. `ctx`: { chart, errors, terms, glossaryHref }. */
export function blocks(list, ctx = {}, where = 'blocks') {
  if (!Array.isArray(list)) { (ctx.errors ||= []).push(`${where}: expected an array of blocks`); return ''; }
  return list.map((b, i) => {
    const w = `${where}[${i}]`;
    const keys = Object.keys(b || {});
    const kind = keys.find((k) => ['p', 'h', 'list', 'ol', 'callout', 'math', 'table', 'journal', 'taccounts', 'statement', 'define', 'case', 'figure', 'quote'].includes(k));
    if (!kind) { (ctx.errors ||= []).push(`${w}: unknown block ${JSON.stringify(keys)}`); return ''; }
    for (const p of tagProblems(JSON.stringify(b[kind] ?? ''), w).filter((x) => !x.includes('Markdown'))) if (kind !== 'figure' && kind !== 'math') (ctx.errors ||= []).push(p);
    switch (kind) {
      case 'p': return `<p>${inline(b.p, ctx, w)}</p>`;
      case 'h': return `<h3>${inline(b.h, ctx, w)}</h3>`;
      case 'list': return `<ul class="prose-list">${b.list.map((x) => `<li>${inline(x, ctx, w)}</li>`).join('')}</ul>`;
      case 'ol': return `<ol class="prose-list">${b.ol.map((x) => `<li>${inline(x, ctx, w)}</li>`).join('')}</ol>`;
      case 'callout': {
        const k = CALLOUT[b.callout] ? b.callout : 'note';
        if (!CALLOUT[b.callout]) (ctx.errors ||= []).push(`${w}: callout kind must be key, note, warn or standards`);
        return `<aside class="callout callout--${k}" aria-label="${CALLOUT[k]}">${ICON[k]}<div><p class="callout-title"><span class="visually-hidden">${CALLOUT[k]}: </span>${inline(b.title || CALLOUT[k], ctx, w)}</p><p>${inline(b.html, ctx, w)}</p></div></aside>`;
      }
      case 'math': {
        try { return `<div class="math-block">${tex(b.math, true)}</div>`; } catch (e) { (ctx.errors ||= []).push(`${w}: TeX error: ${e.message}`); return ''; }
      }
      case 'table': return tableHTML(b.table, ctx, w);
      case 'journal': return journalHTML(b.journal, ctx, w);
      case 'taccounts': return taccountsHTML(b.taccounts, ctx, w);
      case 'statement': return statementHTML(b.statement, ctx, w);
      case 'define': return `<dl class="define">${b.define.map(([t, d]) => `<div><dt>${inline(t, ctx, w)}</dt><dd>${inline(d, ctx, w)}</dd></div>`).join('')}</dl>`;
      case 'case': return `<div class="case-block"><p class="case-tag">Fictional case</p><p>${inline(b.case, ctx, w)}</p></div>`;
      case 'figure': return figureHTML(b.figure, ctx, w);
      case 'quote': return `<blockquote class="study-quote"><p>${inline(b.quote.text, ctx, w)}</p>${b.quote.cite ? `<cite>${inline(b.quote.cite, ctx, w)}</cite>` : ''}</blockquote>`;
      default: return '';
    }
  }).join('\n');
}

/** Words of running prose in a list of blocks (paragraphs, lists, callouts, cases, definitions, quotes). */
export function blockWords(list) {
  return sum((list || []).map((b) => {
    if (b.p) return words(b.p);
    if (b.list) return sum(b.list.map(words));
    if (b.ol) return sum(b.ol.map(words));
    if (b.callout) return words(b.html) + words(b.title || '');
    if (b.case) return words(b.case);
    if (b.define) return sum(b.define.map(([t, d]) => words(t) + words(d)));
    if (b.quote) return words(b.quote.text);
    if (b.h) return words(b.h);
    return 0;
  }));
}

/** Every string inside an object (for tag and typography checks). Spreadsheet data is not prose: formulas (strings
 *  starting with =) and the contents of `sheet`, `records` and `cells` (B03) are skipped. */
const DATA_KEYS = new Set(['sheet', 'records', 'cells']);
export function* strings(obj, path = '') {
  if (typeof obj === 'string') { if (!obj.startsWith('=')) yield [path, obj]; return; }
  if (Array.isArray(obj)) { for (let i = 0; i < obj.length; i++) yield* strings(obj[i], `${path}[${i}]`); return; }
  if (obj && typeof obj === 'object') for (const [k, v] of Object.entries(obj)) if (typeof v !== 'function' && !DATA_KEYS.has(k)) yield* strings(v, path ? `${path}.${k}` : k);
}
