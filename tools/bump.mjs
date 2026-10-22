#!/usr/bin/env node
// bump.mjs — raise the ?v= cache-buster on every stylesheet, script and module import.
// GitHub Pages caches files for 10 minutes; run this after any CSS or JS change:  node tools/bump.mjs
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const files = [];
(function walk(dir) {
  for (const name of readdirSync(dir)) {
    if (name.startsWith('.') || name === 'node_modules' || name === 'tools' || name === 'tests') continue;
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p);
    else if (['.html', '.js', '.css'].includes(extname(p))) files.push(p);
  }
})(ROOT);
let current = 0;
for (const f of files) for (const m of readFileSync(f, 'utf8').matchAll(/\?v=(\d+)/g)) current = Math.max(current, +m[1]);
const next = current + 1;
let changed = 0;
for (const f of files) {
  const src = readFileSync(f, 'utf8');
  const out = src.replace(/\?v=\d+/g, `?v=${next}`);
  if (out !== src) { writeFileSync(f, out); changed++; }
}
console.log(`cache-buster ${current} -> ${next} in ${changed} files`);
