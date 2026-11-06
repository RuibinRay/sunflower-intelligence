// inline.js — renders authored text with a tiny whitelist of inline tags (<b>, <i>, <sub>, <sup>, <code>, <br>) into
// DOM nodes, so the studio never sets innerHTML. Anything else is shown as text.
const ALLOWED = new Set(['b', 'i', 'sub', 'sup', 'code', 'br', 'em', 'strong']);
export function inline(text) {
  const frag = document.createDocumentFragment();
  const stack = [frag];
  const re = /<(\/?)([a-z]+)\s*\/?>/gi;
  let last = 0, m;
  const s = String(text ?? '');
  while ((m = re.exec(s))) {
    if (m.index > last) stack[stack.length - 1].append(s.slice(last, m.index));
    const tag = m[2].toLowerCase();
    if (!ALLOWED.has(tag)) stack[stack.length - 1].append(m[0]);
    else if (tag === 'br') stack[stack.length - 1].append(document.createElement('br'));
    else if (m[1]) { if (stack.length > 1) stack.pop(); }
    else { const el = document.createElement(tag); stack[stack.length - 1].append(el); stack.push(el); }
    last = re.lastIndex;
  }
  if (last < s.length) stack[stack.length - 1].append(s.slice(last));
  return frag;
}
/** A <p> (or any tag) holding inline-marked text. */
export function pi(text, attrs = {}, tag = 'p') {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) if (v != null && v !== false) { if (k === 'class') el.className = v; else el.setAttribute(k, v); }
  el.append(inline(text));
  return el;
}
