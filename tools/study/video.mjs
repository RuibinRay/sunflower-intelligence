// video.mjs — the lesson video's storyboard, built from the lesson itself so the video covers everything the lesson
// teaches, in the page's order: the opening, every paragraph, display equation, table and figure of "The idea", "In
// depth" and "In practice", every formula card symbol by symbol, every worked example step by step, each interactive,
// each common mistake and every summary point.
//
// The storyboard holds narration and timing only. What appears on the video's stage is a clone of the lesson's own
// element on the page (each scene names it with a CSS selector), so the video never drifts from the lesson text and
// adds a few kilobytes, not a second copy of the lesson. A lesson may add an authored script, <slug>.video.js, whose
// chapters are inserted before, or replace, generated ones (see AUTHORING.md, "Lesson videos").
//
// Output: assets/data/study/video/<course>/<slug>.json, read by assets/js/study/video.js.
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { DATA, slugify } from './lib.mjs';

/** The timing rule, shared with the player: narration at 2.6 words a second, a short breath after each segment. */
export const PACE = { wps: 2.6, pad: 0.45, minSeg: 2.2, hold: 4 };
const segSeconds = (say) => { const w = countWords(say); return w ? Math.max(PACE.minSeg, w / PACE.wps) + PACE.pad : PACE.hold; };
export const countWords = (s) => (String(s || '').match(/[\p{L}\p{N}][\p{L}\p{N}’'.,-]*/gu) || []).length;

// ---------------------------------------------------------------- TeX to readable text (captions)
const GREEK = { alpha: 'α', beta: 'β', gamma: 'γ', delta: 'δ', epsilon: 'ε', varepsilon: 'ε', theta: 'θ', kappa: 'κ', lambda: 'λ', mu: 'μ', nu: 'ν', pi: 'π', rho: 'ρ', sigma: 'σ', tau: 'τ', phi: 'φ', varphi: 'φ', chi: 'χ', psi: 'ψ', omega: 'ω', Gamma: 'Γ', Delta: 'Δ', Theta: 'Θ', Lambda: 'Λ', Pi: 'Π', Sigma: 'Σ', Phi: 'Φ', Psi: 'Ψ', Omega: 'Ω' };
const BIN = { times: '×', div: '÷', cdot: '·', pm: '±', le: '≤', leq: '≤', ge: '≥', geq: '≥', ne: '≠', neq: '≠', approx: '≈', equiv: '≡', Longleftrightarrow: '⇔', Leftrightarrow: '⇔', iff: '⇔', Rightarrow: '⇒', Longrightarrow: '⇒', to: '→', rightarrow: '→', leftarrow: '←', gt: '>', lt: '<', in: '∈', propto: '∝' };
const WORD = { sum: 'Σ', prod: 'Π', infty: '∞', partial: '∂', ldots: '…', dots: '…', cdots: '…', ln: 'ln ', log: 'log ', exp: 'exp ', max: 'max ', min: 'min ', lim: 'lim ', sqrt: '√', degree: '°', prime: '′', quad: ' ', qquad: ' ', percent: '%' };
const IGNORE = new Set(['left', 'right', 'big', 'Big', 'bigg', 'Bigg', 'bigl', 'bigr', 'Bigl', 'Bigr', 'displaystyle', 'textstyle', 'limits', 'nolimits', 'mathop', 'boldsymbol', 'phantom', 'hphantom', 'vphantom', 'underbrace', 'overbrace', 'color']);
const TEXT = new Set(['text', 'mathrm', 'textrm', 'textit', 'textbf', 'mathbf', 'mathit', 'operatorname', 'mbox', 'mathsf', 'textsf', 'mathbb', 'mathcal']);
const SUP = { 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹', '+': '⁺', '−': '⁻', '-': '⁻', '(': '⁽', ')': '⁾', n: 'ⁿ', i: 'ⁱ', t: 'ᵗ', '=': '⁼' };
const SUB = { 0: '₀', 1: '₁', 2: '₂', 3: '₃', 4: '₄', 5: '₅', 6: '₆', 7: '₇', 8: '₈', 9: '₉', '+': '₊', '−': '₋', '-': '₋', '(': '₍', ')': '₎', a: 'ₐ', e: 'ₑ', o: 'ₒ', x: 'ₓ', h: 'ₕ', k: 'ₖ', l: 'ₗ', m: 'ₘ', n: 'ₙ', p: 'ₚ', s: 'ₛ', t: 'ₜ', i: 'ᵢ', j: 'ⱼ', r: 'ᵣ', u: 'ᵤ', v: 'ᵥ', '=': '₌' };
const OPS = new Set(['=', '+', '<', '>', ...Object.values(BIN)]);

function group(s, i) {
  while (s[i] === ' ') i++;
  if (s[i] !== '{') { // a single token
    if (s[i] === '\\') { const m = /^\\([a-zA-Z]+|.)/.exec(s.slice(i)); return [m[0], i + m[0].length]; }
    return [s[i] ?? '', i + 1];
  }
  let depth = 0, j = i;
  for (; j < s.length; j++) {
    if (s[j] === '\\') { j++; continue; }
    if (s[j] === '{') depth++;
    else if (s[j] === '}' && --depth === 0) break;
  }
  return [s.slice(i + 1, j), j + 1];
}
const textOf = (g) => g.replace(/\\([$%&#_{}])/g, '$1').replace(/\\[,;: ]/g, ' ').replace(/\{,\}/g, ',').replace(/[{}]/g, '');
const POWERS = /[⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻⁽⁾ⁿⁱᵗ⁼]+$/u;
const balanced = (t) => { let d = 0; for (let k = 0; k < t.length; k++) { if (t[k] === '(') d++; else if (t[k] === ')' && --d === 0 && k < t.length - 1) return false; } return d === 0; };
const wrap = (t) => { const base = t.replace(POWERS, ''); return /^[\p{L}\p{N}.,$′₀-₉ₐ-ₜᵢ-ᵥ]+$/u.test(base) || (/^\(.*\)$/.test(base) && balanced(base)) ? t : `(${t})`; };
const script = (t, map, mark) => {
  const flat = t.replace(/\s+/g, '');
  if (flat && [...flat].every((ch) => map[ch])) return [...flat].map((ch) => map[ch]).join('');
  return `${mark}${flat.length === 1 ? flat : `(${t.trim()})`}`;
};

/** Readable text for a TeX expression: "\frac{FV}{(1+r)^n}" → "FV/(1 + r)ⁿ". Used for captions and narration. */
export function texText(src, tight = false) {
  const s = String(src ?? '');
  let out = '';
  const op = (o) => { out += tight ? o : ` ${o} `; };
  for (let i = 0; i < s.length;) {
    const c = s[i];
    if (c === '\\') {
      const m = /^\\([a-zA-Z]+|.)/.exec(s.slice(i));
      const name = m[1]; i += m[0].length;
      if (TEXT.has(name)) { const [g, j] = group(s, i); out += textOf(g); i = j; continue; }
      if (name === 'frac' || name === 'dfrac' || name === 'tfrac') { const [a, j] = group(s, i); const [b, k] = group(s, j); i = k; out += `${wrap(texText(a, true).trim())}/${wrap(texText(b, true).trim())}`; continue; }
      if (name === 'sqrt') { if (s[i] === '[') i = s.indexOf(']', i) + 1; const [g, j] = group(s, i); i = j; out += `√${wrap(texText(g, true).trim())}`; continue; }
      if (name === 'bar' || name === 'overline' || name === 'hat' || name === 'widehat' || name === 'tilde') { const [g, j] = group(s, i); i = j; out += texText(g, true) + (name.includes('hat') ? '̂' : name === 'tilde' ? '̃' : '̄'); continue; }
      if (name === 'color') { const [, j] = group(s, i); i = j; continue; }
      if (IGNORE.has(name)) continue;
      if (name === ',' || name === ';' || name === ':' || name === ' ' || name === '>') { out += ' '; continue; }
      if (name === '!') continue;
      if ('$%&#_{}'.includes(name)) { out += name; continue; }
      if (name === '\\') { out += '; '; continue; }
      if (GREEK[name]) { out += GREEK[name]; continue; }
      if (BIN[name]) { op(BIN[name]); continue; }
      if (WORD[name] !== undefined) { out += WORD[name]; continue; }
      out += name; continue;
    }
    if (c === '{') { const [g, j] = group(s, i); out += g === ',' ? ',' : texText(g, tight); i = j; continue; }
    if (c === '}') { i++; continue; }
    if (c === '^' || c === '_') {
      i++;
      const [g, j] = group(s, i); i = j;
      const t = texText(g, true).trim();
      out += c === '^' ? (t === '′' ? '′' : script(t, SUP, '^')) : script(t, SUB, '_');
      continue;
    }
    if (c === '&') { out += ' '; i++; continue; }
    if (c === '~') { out += ' '; i++; continue; }
    if (c === '-') { const prev = out.trimEnd().slice(-1); if (!prev || prev === '(' || OPS.has(prev)) out += '−'; else op('−'); i++; continue; }
    if (c === '=' || c === '+' || c === '<' || c === '>') { op(c); i++; continue; }
    if (c === ' ') { if (!out.endsWith(' ')) out += ' '; i++; continue; }
    out += c; i++;
  }
  return tight ? out : out.replace(/\s+/g, ' ').replace(/\(\s+/g, '(').replace(/\s+\)/g, ')').replace(/\s+([,.;:])/g, '$1').trim();
}

const ENT = { amp: '&', lt: '<', gt: '>', quot: '"', nbsp: ' ', rsquo: '’', lsquo: '‘', ldquo: '“', rdquo: '”', ndash: '–', mdash: '—', times: '×', minus: '−' };
/** Lesson HTML (with <m>, <M>, <g>, <x>) as plain text, with maths made readable. */
export function plain(html) {
  const xs = [];
  return String(html ?? '')
    .replace(/<x>([\s\S]*?)<\/x>/g, (_, t) => { xs.push(t); return `\u0000${xs.length - 1}\u0000`; })
    .replace(/<M>([\s\S]*?)<\/M>/g, (_, t) => ` ${texText(t)} `)
    .replace(/<m>([\s\S]*?)<\/m>/g, (_, t) => texText(t))
    .replace(/<br\s*\/?>/g, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/&(#\d+|[a-z]+);/g, (m, e) => (e[0] === '#' ? String.fromCodePoint(+e.slice(1)) : ENT[e] ?? m))
    .replace(/\u0000(\d+)\u0000/g, (_, k) => xs[+k])
    .replace(/\s+/g, ' ')
    .replace(/\s+([,.;:!?])/g, '$1')
    .trim();
}
/** The first sentence, shortened to fit the stage. */
export function firstSentence(text, max = 150) {
  const t = String(text || '');
  const m = /^(.+?[.!?])(\s+(?=[A-Z0-9“"‘(])|$)/.exec(t);
  let s = (m ? m[1] : t).trim();
  if (s.length > max) { s = s.slice(0, max); s = `${s.slice(0, Math.max(s.lastIndexOf(' '), max - 20)).replace(/[,;:]$/, '')}…`; }
  return s;
}
const termsOf = (html) => [...String(html || '').matchAll(/<g>([\s\S]*?)<\/g>/g)].map((m) => plain(m[1]));

// ---------------------------------------------------------------- lesson parts to scenes
const PART = { idea: 'The idea', depth: 'In depth', practice: 'In practice' };
const VISUAL = new Set(['math', 'table', 'figure', 'statement', 'journal', 'taccounts']);
const CALLOUT = { key: 'Key idea', note: 'Note', warn: 'Caution', standards: 'Standards' };
const LEVEL = { simple: 'A first example', challenging: 'A harder example', applied: 'Applied: a business decision' };
const kindOf = (b) => Object.keys(b || {}).find((k) => ['p', 'h', 'list', 'ol', 'callout', 'math', 'table', 'journal', 'taccounts', 'statement', 'define', 'case', 'figure', 'quote'].includes(k));

/** What the narrator says while a visual block is on screen. */
function sayVisual(b, kind) {
  if (kind === 'math') return texText(b.math);
  if (kind === 'figure') return plain(b.figure.caption || b.figure.alt);
  if (kind === 'table') return plain(b.table.caption || '');
  if (kind === 'statement') return plain([b.statement.title, b.statement.subtitle].filter(Boolean).join(', '));
  return plain(b[kind]?.caption || '');
}

function partChapters(part, list) {
  const chapters = [];
  let cur = { id: part, title: PART[part], part, scenes: [] };
  const push = () => { if (cur.scenes.length) chapters.push(cur); };
  (list || []).forEach((b, i) => {
    const kind = kindOf(b);
    const sel = `#${part} [data-vb="${i}"]`;
    if (kind === 'h') { push(); cur = { id: `${part}/${slugify(b.h)}`, title: plain(b.h), part, scenes: [] }; return; }
    const last = cur.scenes[cur.scenes.length - 1];
    if (VISUAL.has(kind)) {
      const seg = { say: sayVisual(b, kind), show: sel };
      // a visual joins the paragraph that introduces it, unless that scene already shows two things
      if (last && (last.kind === 'text' || last.kind === 'case') && last.segs.filter((x) => x.show).length < 2) last.segs.push(seg);
      else cur.scenes.push({ kind: 'visual', head: last ? '' : cur.title, segs: [seg] });
      return;
    }
    if (kind === 'p') { const t = plain(b.p); cur.scenes.push({ kind: 'text', head: firstSentence(t), terms: termsOf(b.p), segs: [{ say: t }] }); return; }
    if (kind === 'case') { const t = plain(b.case); cur.scenes.push({ kind: 'case', kicker: 'Fictional case', head: firstSentence(t), segs: [{ say: t }] }); return; }
    if (kind === 'list' || kind === 'ol') {
      cur.scenes.push({ kind: 'list', head: last?.kind === 'text' && /:$/.test(last.segs[0].say) ? firstSentence(last.segs[0].say.split(/(?<=[.!?])\s+/).pop()) : '', segs: b[kind].map((x, k) => ({ say: plain(x), show: `${sel} > li:nth-child(${k + 1})` })) });
      return;
    }
    if (kind === 'define') { cur.scenes.push({ kind: 'list', head: '', terms: b.define.map(([t]) => plain(t)), segs: b.define.map(([t, d], k) => ({ say: `${plain(t)}. ${plain(d)}`, show: `${sel} > div:nth-child(${k + 1})` })) }); return; }
    if (kind === 'callout') { cur.scenes.push({ kind: 'callout', kicker: CALLOUT[b.callout] || 'Note', head: plain(b.title || ''), segs: [{ say: `${b.title ? `${plain(b.title)}. ` : ''}${plain(b.html)}`, show: sel }] }); return; }
    if (kind === 'quote') { cur.scenes.push({ kind: 'quote', segs: [{ say: `${plain(b.quote.text)}${b.quote.cite ? ` (${plain(b.quote.cite)})` : ''}`, show: sel }] }); }
  });
  push();
  return chapters;
}

/**
 * The storyboard of one lesson. `course` is the loaded course, `l` the loaded lesson (with L and X), `authored` the
 * optional <slug>.video.js module's default export.
 */
export function storyboard(course, l, authored = null) {
  const { L, X } = l;
  const head = { kind: 'title', kicker: `${course.code} · ${course.title} · Module ${l.module}`, head: plain(L.title), sub: plain(L.blurb), segs: [{ say: `${plain(L.title)}. ${plain(L.blurb)}` }] };
  const objectives = { kind: 'list', head: 'You will be able to', segs: L.objectives.map((o, k) => ({ say: plain(o), show: `#start .objectives > li:nth-child(${k + 1})` })) };
  const chapters = [{ id: 'opening', title: 'Introduction', part: 'start', scenes: [head, objectives] }];
  chapters.push(...partChapters('idea', L.concept), ...partChapters('depth', L.theory));
  if (L.formulas?.length) {
    chapters.push({
      id: 'formulas', title: 'Formulas', part: 'formulas',
      scenes: L.formulas.map((f) => ({
        kind: 'formula', kicker: 'Formula', head: plain(f.name),
        segs: [
          { say: `${plain(f.name)}: ${texText(f.tex)}.`, show: `#f-${f.id} .math-block` },
          ...(f.where || []).map(([sym, meaning, unit], k) => ({ say: `${texText(sym)}: ${plain(meaning)}${unit ? ` (${unit})` : ''}.`, show: `#f-${f.id} .where > div:nth-child(${k + 1})` })),
          ...(f.assumptions ? [{ say: `It assumes this: ${plain(f.assumptions)}`, show: `#f-${f.id} .assume` }] : []),
          ...(f.note ? [{ say: plain(f.note), show: `#f-${f.id} .note` }] : []),
        ],
      })),
    });
  }
  L.examples.forEach((e, i) => {
    const ex = `#example-${i + 1}`;
    const extra = ['journal', 'table', 'statement'].filter((k) => e[k]).map(() => ({ say: '', show: `${ex} [data-vb]` }));
    chapters.push({
      id: `example-${i + 1}`, title: `Example: ${plain(e.title)}`, part: 'examples',
      scenes: [
        { kind: 'example', kicker: LEVEL[e.level] || 'Worked example', head: plain(e.title), segs: [{ say: plain(e.setup), show: `${ex} .plate-setup` }, ...extra.slice(0, 1)] },
        { kind: 'steps', kicker: 'Step by step', head: plain(e.title), segs: e.steps.map((st, k) => ({ say: `Step ${k + 1}. ${plain(st)}`, show: `${ex} .plate-steps > li:nth-child(${k + 1})` })) },
        { kind: 'answer', kicker: 'The answer', head: plain(e.title), segs: [{ say: plain(e.answer), show: `${ex} .plate-result` }, { say: plain(e.interpretation), show: `${ex} .worked-meaning` }] },
      ],
    });
  });
  if (L.demo?.length) {
    chapters.push({
      id: 'explore', title: 'Explore', part: 'explore',
      scenes: L.demo.map((d) => ({ kind: 'explore', kicker: 'Try it yourself', head: plain(X?.widgets?.[d.widget]?.title || 'An interactive'), segs: [{ say: `${plain(d.intro || '')} Pause the video and try it in the Explore section of this lesson.`.trim() }], cta: { label: 'Open the interactive', href: `#w-${d.widget}` } })),
    });
  }
  chapters.push({
    id: 'mistakes', title: 'Common mistakes', part: 'mistakes',
    scenes: L.mistakes.map((m, k) => ({ kind: 'mistake', kicker: `Common mistake ${k + 1} of ${L.mistakes.length}`, head: plain(m.title), segs: [{ say: `${plain(m.title)}. ${plain(m.html)}`, show: `#mistakes .mistake-list > li:nth-child(${k + 1}) p` }] })),
  });
  chapters.push(...partChapters('practice', L.application));
  chapters.push({
    id: 'summary', title: 'Summary', part: 'summary',
    scenes: [
      { kind: 'list', kicker: 'Summary', head: 'What to remember', segs: L.summary.map((x, k) => ({ say: plain(x), show: `#summary .summary-list > li:nth-child(${k + 1})` })) },
      { kind: 'outro', kicker: 'Now practise', head: 'Work the guided problems, then take the knowledge check.', segs: [{ say: 'That is the whole lesson. Now work the guided problems, with hints when you need them, then try the questions on your own and take the knowledge check. A score of 80 percent completes the lesson.' }], cta: { label: 'Go to guided practice', href: '#guided' } },
    ],
  });
  if (authored) mergeAuthored(chapters, authored, `${course.id}/${l.slug}`);
  const all = chapters.flatMap((c) => c.scenes);
  const seconds = all.reduce((s, sc) => s + sc.segs.reduce((a, g) => a + segSeconds(g.say), 0), 0);
  return { v: 1, lesson: `${course.id}/${l.slug}`, code: course.code, title: plain(L.title), seconds: Math.round(seconds), authored: !!authored, pace: PACE, chapters };
}

function mergeAuthored(chapters, a, where) {
  for (const ch of a.chapters || []) {
    if (!ch.id || !ch.title || !ch.scenes?.length) throw new Error(`${where}.video.js: each chapter needs id, title and scenes`);
    const at = (id) => { const k = chapters.findIndex((c) => c.id === id); if (k < 0) throw new Error(`${where}.video.js: no chapter "${id}" (have ${chapters.map((c) => c.id).join(', ')})`); return k; };
    const item = { ...ch, part: ch.part || 'authored', authored: true };
    if (ch.replace) chapters.splice(at(ch.replace), 1, item);
    else if (ch.before) chapters.splice(at(ch.before), 0, item);
    else chapters.splice(at(ch.after || 'opening') + 1, 0, item);
  }
}

/** Load a lesson's authored script, if it has one. */
export async function authoredFor(courseId, slug) {
  const p = join(DATA, courseId, `${slug}.video.js`);
  return existsSync(p) ? (await import(`${pathToFileURL(p).href}?t=${Date.now()}`)).default : null;
}
