// minicss.js — a small CSS reader for Style Shop: rules made of tag, .class and #id selectors (with
// descendants and comma groups) and a short list of properties. It works out which declaration wins for each
// element by specificity and order, the way a browser does, so levels can be judged without a browser.
//   parseCss(src) -> { rules, error }     styleTree(tree, rules) -> Map(node -> { prop: value })

const COLORS = new Set(['black', 'white', 'red', 'green', 'blue', 'navy', 'orange', 'gold', 'yellow', 'brown', 'purple', 'teal', 'pink', 'grey', 'gray', 'maroon', 'olive', 'tomato', 'crimson', 'darkgreen', 'darkred', 'ivory', 'beige', 'transparent']);
const color = (v) => COLORS.has(v) || /^#([0-9a-f]{3}|[0-9a-f]{6})$/.test(v);
const length = (v) => v === '0' || /^-?\d+(\.\d+)?(px|rem|em|%)$/.test(v);
const oneOf = (...list) => (v) => list.includes(v);
const each = (test, max) => (v) => { const parts = v.split(' '); return parts.length <= max && parts.every(test); };
export const PROPS = {
  color: [color, 'a colour name such as navy, or a hex code such as #C96F36'],
  'background-color': [color, 'a colour name such as gold, or a hex code'],
  background: [color, 'a colour name such as gold, or a hex code'],
  'font-size': [length, 'a size with a unit, such as 18px'],
  'font-weight': [(v) => ['normal', 'bold'].includes(v) || /^[1-9]00$/.test(v), 'normal, bold, or a number from 100 to 900'],
  'text-align': [oneOf('left', 'center', 'right'), 'left, center or right'],
  'text-decoration': [oneOf('none', 'underline'), 'none or underline'],
  'text-transform': [oneOf('none', 'uppercase', 'lowercase', 'capitalize'), 'none, uppercase, lowercase or capitalize'],
  padding: [each(length, 4), 'one to four sizes, such as 12px or 8px 16px'],
  margin: [each((v) => length(v) || v === 'auto', 4), 'one to four sizes, such as 12px or 0 auto'],
  border: [(v) => { const p = v.split(' '); return p.length === 3 && p.some(length) && p.some(oneOf('solid', 'dashed', 'dotted')) && p.some(color); }, 'a width, a style and a colour, such as 2px solid navy'],
  'border-radius': [length, 'a size such as 8px'],
  width: [(v) => length(v) || v === 'auto', 'a size such as 200px or 50%'],
  display: [oneOf('block', 'inline', 'inline-block', 'flex', 'grid', 'none'), 'block, inline, flex or none'],
  gap: [length, 'a size such as 16px'],
  'justify-content': [oneOf('flex-start', 'center', 'flex-end', 'space-between', 'space-around'), 'flex-start, center, flex-end or space-between'],
};
const INHERITED = new Set(['color', 'font-size', 'font-weight', 'text-align', 'text-transform']);
const MEANT = { colour: 'color', 'text-color': 'color', 'text-colour': 'color', 'font-color': 'color', 'font-colour': 'color', size: 'font-size', 'text-size': 'font-size', bg: 'background-color', 'background-colour': 'background-color', align: 'text-align', bold: 'font-weight', spacing: 'padding or margin' };

function selector(text) {
  const parts = text.trim().split(/\s+/).map((part) => {
    const m = /^([a-z][a-z0-9]*)?((?:[.#][A-Za-z_-][\w-]*)*)$/.exec(part);
    if (!m || !part) return null;
    const bits = m[2].match(/[.#][\w-]+/g) || [];
    return { tag: m[1] || null, id: (bits.find((b) => b[0] === '#') || '').slice(1) || null, classes: bits.filter((b) => b[0] === '.').map((b) => b.slice(1)) };
  });
  if (parts.some((x) => !x)) return null;
  const spec = parts.reduce((s, x) => s + (x.id ? 100 : 0) + x.classes.length * 10 + (x.tag ? 1 : 0), 0);
  return { parts, spec, text: text.trim() };
}

export function parseCss(src) {
  const rules = [];
  const err = (message, hint = '') => ({ rules, error: { message, hint } });
  const text = src.replace(/\/\*[\s\S]*?\*\//g, '');
  let i = 0, order = 0;
  while (i < text.length) {
    const open = text.indexOf('{', i);
    const head = text.slice(i, open < 0 ? text.length : open).trim();
    if (open < 0) { if (!head) break; return err(head.includes(':') ? 'A declaration is sitting outside any rule.' : `The rule for “${head.split('\n')[0]}” has no opening {.`, 'A rule looks like: h1 { color: navy; }'); }
    if (!head) return err('A { has no selector in front of it.', 'Say which elements the rule is for, such as h1 or .hot');
    if (head.includes('}')) return err('There is a } with no { before it.');
    const close = text.indexOf('}', open);
    if (close < 0) return err(`The rule for “${head}” is never closed.`, 'Add } after its last declaration.');
    const body = text.slice(open + 1, close);
    if (body.includes('{')) return err(`The rule for “${head}” is never closed.`, 'Add } before the next rule starts.');
    const sels = head.split(',').map(selector);
    if (sels.some((s) => !s)) {
      const bad = head.split(',').find((s) => !selector(s)).trim();
      return err(`“${bad}” is not a selector this shop understands.`, /^[<]/.test(bad) ? 'Selectors use the tag name without angle brackets: h1, not <h1>.' : 'Use a tag name (p), a class with a dot (.hot), an id with a hash (#top), or two with a space between (nav a).');
    }
    const decls = [];
    const chunks = body.split(';');
    for (let k = 0; k < chunks.length; k++) {
      const chunk = chunks[k].trim();
      if (!chunk) continue;
      const colon = chunk.indexOf(':');
      if (colon < 0 && chunk.includes('=')) return err('CSS uses a colon between a property and its value, not an equals sign.', 'Write color: navy;');
      if (colon < 0) return err(`“${chunk.split('\n')[0]}” is missing its colon.`, 'A declaration is a property, a colon, then a value: color: navy;');
      const prop = chunk.slice(0, colon).trim().toLowerCase();
      const val = chunk.slice(colon + 1).trim().toLowerCase().replace(/\s+/g, ' ');
      if (/\n/.test(chunk.slice(colon + 1).trim()) && val.includes(':')) return err(`The declaration “${prop}” is missing its semicolon.`, 'End every declaration with ;');
      if (prop.includes('=') || val.startsWith('=')) return err('CSS uses a colon between a property and its value, not an equals sign.', 'Write color: navy;');
      if (!PROPS[prop]) return err(`“${prop}” is not a CSS property this shop knows.`, MEANT[prop] ? `The property is ${MEANT[prop]}.` : `Try one of: ${Object.keys(PROPS).slice(0, 8).join(', ')} …`);
      if (!val) return err(`${prop} has no value.`, `It needs ${PROPS[prop][1]}.`);
      if (/^["']|["']$/.test(val)) return err(`The value of ${prop} should not be in quotes.`, `Write ${prop}: ${val.replace(/["']/g, '')};`);
      if (!PROPS[prop][0](val)) return err(`“${val}” is not a value ${prop} accepts.`, /^-?\d+(\.\d+)?$/.test(val) && val !== '0' ? `A size needs a unit: ${val}px` : `It needs ${PROPS[prop][1]}.`);
      decls.push({ prop: prop === 'background' ? 'background-color' : prop, value: val });
    }
    for (const s of sels) rules.push({ sel: s, decls, order: order++ });
    i = close + 1;
  }
  return { rules, error: null };
}

const hit = (part, node) => (!part.tag || part.tag === node.tag) && (!part.id || part.id === node.id) && part.classes.every((c) => (node.cls || []).includes(c));
function matches(sel, node, parents) {
  const parts = sel.parts;
  if (!hit(parts[parts.length - 1], node)) return false;
  let k = parts.length - 2;
  for (let i = parents.length - 1; i >= 0 && k >= 0; i--) if (hit(parts[k], parents[i])) k--;
  return k < 0;
}
/** The winning declarations for every element, plus what it inherits. Returns Map(node -> { own, all }). */
export function styleTree(tree, rules) {
  const out = new Map();
  const visit = (node, parents, inherited) => {
    if (!node.tag) return;
    const best = {};
    for (const r of rules) if (matches(r.sel, node, parents)) for (const d of r.decls) { const cur = best[d.prop]; if (!cur || r.sel.spec > cur.spec || (r.sel.spec === cur.spec && r.order >= cur.order)) best[d.prop] = { value: d.value, spec: r.sel.spec, order: r.order }; }
    const own = Object.fromEntries(Object.entries(best).map(([k, v]) => [k, v.value]));
    const all = { ...inherited, ...own };
    out.set(node, { own, all });
    const pass = Object.fromEntries(Object.entries(all).filter(([k]) => INHERITED.has(k)));
    (node.children || []).forEach((c) => visit(c, [...parents, node], pass));
  };
  tree.forEach((n) => visit(n, [], {}));
  return out;
}
