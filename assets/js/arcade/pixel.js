// pixel.js — the arcade's drawing kit: a 5 x 7 bitmap font, hand-drawn sprites, a low-resolution stage that is
// scaled up with hard edges, and a few square-wave sound effects. Nothing here is loaded from a file.

export const PAL = {
  night: '#101B30', midnight: '#192B49', dusk: '#2A426B', sun: '#E8B923', ochre: '#C99216', amber: '#A97A0C', ivory: '#FFF8E8',
  terracotta: '#C96F36', olive: '#68763A', leaf: '#8FA04A', moss: '#3F4D22', hedge: '#2C3A1A', charcoal: '#252A31', brown: '#5B3A12', umber: '#3B240B',
  water: '#3E78B2', foam: '#9CC4E4', red: '#D2553E', pink: '#F2A6A0', sky: '#DCEBFA', grey: '#8A93A3', white: '#FFFFFF',
};

// ---------------------------------------------------------------- font
const G = {
  A: '.XXX. X...X X...X XXXXX X...X X...X X...X', B: 'XXXX. X...X X...X XXXX. X...X X...X XXXX.', C: '.XXX. X...X X.... X.... X.... X...X .XXX.',
  D: 'XXXX. X...X X...X X...X X...X X...X XXXX.', E: 'XXXXX X.... X.... XXXX. X.... X.... XXXXX', F: 'XXXXX X.... X.... XXXX. X.... X.... X....',
  G: '.XXX. X...X X.... X.XXX X...X X...X .XXX.', H: 'X...X X...X X...X XXXXX X...X X...X X...X', I: 'XXXXX ..X.. ..X.. ..X.. ..X.. ..X.. XXXXX',
  J: '..XXX ...X. ...X. ...X. ...X. X..X. .XX..', K: 'X...X X..X. X.X.. XX... X.X.. X..X. X...X', L: 'X.... X.... X.... X.... X.... X.... XXXXX',
  M: 'X...X XX.XX X.X.X X.X.X X...X X...X X...X', N: 'X...X XX..X X.X.X X..XX X...X X...X X...X', O: '.XXX. X...X X...X X...X X...X X...X .XXX.',
  P: 'XXXX. X...X X...X XXXX. X.... X.... X....', Q: '.XXX. X...X X...X X...X X.X.X X..X. .XX.X', R: 'XXXX. X...X X...X XXXX. X.X.. X..X. X...X',
  S: '.XXXX X.... X.... .XXX. ....X ....X XXXX.', T: 'XXXXX ..X.. ..X.. ..X.. ..X.. ..X.. ..X..', U: 'X...X X...X X...X X...X X...X X...X .XXX.',
  V: 'X...X X...X X...X X...X X...X .X.X. ..X..', W: 'X...X X...X X...X X.X.X X.X.X XX.XX X...X', X: 'X...X X...X .X.X. ..X.. .X.X. X...X X...X',
  Y: 'X...X X...X .X.X. ..X.. ..X.. ..X.. ..X..', Z: 'XXXXX ....X ...X. ..X.. .X... X.... XXXXX',
  0: '.XXX. X...X X..XX X.X.X XX..X X...X .XXX.', 1: '..X.. .XX.. ..X.. ..X.. ..X.. ..X.. .XXX.', 2: '.XXX. X...X ....X ...X. ..X.. .X... XXXXX',
  3: 'XXXX. ....X ....X .XXX. ....X ....X XXXX.', 4: '...X. ..XX. .X.X. X..X. XXXXX ...X. ...X.', 5: 'XXXXX X.... XXXX. ....X ....X X...X .XXX.',
  6: '.XXX. X.... X.... XXXX. X...X X...X .XXX.', 7: 'XXXXX ....X ...X. ..X.. ..X.. ..X.. ..X..', 8: '.XXX. X...X X...X .XXX. X...X X...X .XXX.',
  9: '.XXX. X...X X...X .XXXX ....X ....X .XXX.',
  ' ': '..... ..... ..... ..... ..... ..... .....', '.': '..... ..... ..... ..... ..... ..... ..X..', ',': '..... ..... ..... ..... ..... ..X.. .X...',
  '!': '..X.. ..X.. ..X.. ..X.. ..X.. ..... ..X..', '?': '.XXX. X...X ....X ...X. ..X.. ..... ..X..', ':': '..... ..X.. ..... ..... ..X.. ..... .....',
  '-': '..... ..... ..... XXXXX ..... ..... .....', '+': '..... ..X.. ..X.. XXXXX ..X.. ..X.. .....', '/': '....X ....X ...X. ..X.. .X... X.... X....',
  "'": '..X.. ..X.. ..... ..... ..... ..... .....', '(': '...X. ..X.. .X... .X... .X... ..X.. ...X.', ')': '.X... ..X.. ...X. ...X. ...X. ..X.. .X...',
  '%': 'XX..X XX..X ...X. ..X.. .X... X..XX X..XX', '<': '...X. ..X.. .X... X.... .X... ..X.. ...X.', '>': '.X... ..X.. ...X. ....X ...X. ..X.. .X...',
  '=': '..... ..... XXXXX ..... XXXXX ..... .....', '*': '..... X.X.X .XXX. XXXXX .XXX. X.X.X .....', '#': '.X.X. .X.X. XXXXX .X.X. XXXXX .X.X. .X.X.',
  '&': '.XX.. X..X. X..X. .XX.. X.X.X X..X. .XX.X', '_': '..... ..... ..... ..... ..... ..... XXXXX', '♥': '..... .X.X. XXXXX XXXXX .XXX. ..X.. .....',
  '★': '..X.. ..X.. XXXXX .XXX. .XXX. X...X .....', '×': '..... X...X .X.X. ..X.. .X.X. X...X .....', '▶': 'X.... XX... XXX.. XXXX. XXX.. XX... X....',
};
const GLYPH = Object.fromEntries(Object.entries(G).map(([ch, rows]) => [ch, rows.split(' ')]));
export const textWidth = (s, scale = 1) => (String(s).length * 6 - 1) * scale;
/** Draw text in the bitmap font. align: 'left' | 'center' | 'right'. Unknown characters fall back to '?'. */
export function drawText(ctx, str, x, y, { scale = 1, color = PAL.ivory, align = 'left', shadow = null } = {}) {
  const s = String(str).toUpperCase();
  let x0 = Math.round(align === 'center' ? x - textWidth(s, scale) / 2 : align === 'right' ? x - textWidth(s, scale) : x);
  const paint = (ox, oy, col) => {
    ctx.fillStyle = col;
    let cx = x0 + ox;
    for (const ch of s) {
      const g = GLYPH[ch] || GLYPH['?'];
      for (let r = 0; r < 7; r++) for (let c = 0; c < 5; c++) if (g[r][c] === 'X') ctx.fillRect(cx + c * scale, y + oy + r * scale, scale, scale);
      cx += 6 * scale;
    }
  };
  if (shadow) paint(scale, scale, shadow);
  paint(0, 0, color);
}

// ---------------------------------------------------------------- sprites
const SPR = {
  // top view, facing north (rotated for the other three directions)
  bee: { pal: { k: PAL.charcoal, y: PAL.sun, w: PAL.sky }, rows: ['....k..k....', '.....kk.....', '....kkkk....', '.ww.kkkk.ww.', 'wwwwyyyywwww', 'wwwwkkkkwwww', '.wwwyyyywww.', '..w.kkkk.w..', '....yyyy....', '....kkkk....', '.....yy.....', '.....kk.....'] },
  // side view, facing right
  beeSide: { pal: { k: PAL.charcoal, y: PAL.sun, w: PAL.sky, e: PAL.white, l: PAL.umber }, rows: ['....www.ww......', '...wwwwwwww.k.k.', '...wwwwwwww..k..', '....wwwwww..kkk.', '..kkyykkyykkkkkk', '.kkkyykkyykkkekk', 'kkkkyykkyykkkkkk', '.kkkyykkyykkkkk.', '..kkyykkyykkkk..', '...l..l...l.....'] },
  flower: { pal: { y: PAL.sun, o: PAL.ochre, b: PAL.brown, d: PAL.umber }, rows: ['....yyyy....', '..yy.oo.yy..', '.yyyyyyyyyy.', '.yyybbbbyyy.', 'yy.bbdbbb.yy', 'yoybdbbdbyoy', 'yoybbdbbbyoy', 'yy.bbbdbb.yy', '.yyybbbbyyy.', '.yyyyyyyyyy.', '..yy.oo.yy..', '....yyyy....'] },
  picked: { pal: { g: PAL.leaf, m: PAL.moss }, rows: ['............', '............', '............', '....g..g....', '...gmggmg...', '....gmmg....', '...ggmmgg...', '....gmmg....', '...g.gg.g...', '............', '............', '............'] },
  hive: { pal: { o: PAL.ochre, d: PAL.amber, k: PAL.charcoal, y: PAL.sun }, rows: ['....yyyy....', '..oooooooo..', '.oooooooooo.', '.dddddddddd.', 'oooooooooooo', 'yooooooooooo', 'dddddddddddd', 'oooookkooooo', '.oookkkkooo.', '.dddkkkkddd.', '..ookkkkoo..', '....oooo....'] },
  bug: { pal: { r: PAL.red, k: PAL.charcoal, w: PAL.white, d: '#8E2F22' }, rows: ['..k......k....', '...k....k.....', '..rrrrrrrr....', '.rrdrrrrdrr...', 'rrrrrrrrrrrr..', 'rwkrrrrrrkwr..', 'rrrrrrrrrrrr..', 'rrdkkkkkkdrr..', '.rrrrrrrrrr...', '..rrdrrdrr....', '.k..k..k..k...', 'k..k....k..k..'] },
  heart: { pal: { r: PAL.red, p: PAL.pink }, rows: ['.rr.rr.', 'rprrrrr', 'rrrrrrr', '.rrrrr.', '..rrr..', '...r...'] },
  heartOff: { pal: { r: '#3B4660' }, rows: ['.rr.rr.', 'r..r..r', 'r.....r', '.r...r.', '..r.r..', '...r...'] },
  star: { pal: { y: PAL.sun, o: PAL.ochre }, rows: ['...y...', '..yyy..', 'yyyyyyy', '.yyyyy.', '.yyoyy.', 'yy...yy'] },
  starOff: { pal: { y: '#3B4660' }, rows: ['...y...', '..y.y..', 'yyy.yyy', '.y...y.', '.y.y.y.', 'yy...yy'] },
  cup: { pal: { w: PAL.ivory, c: PAL.brown, s: PAL.grey, d: '#D8CBA8' }, rows: ['..s..s....', '...s..s...', '..........', 'wwwwwww...', 'wcccccwww.', 'wcccccw.w.', 'wcccccwww.', 'wdddddw...', '.wwwww....', 'dddddddd..'] },
  tea: { pal: { g: PAL.leaf, G: PAL.moss, b: PAL.brown }, rows: ['......gg..', '....gggg..', '...ggGgg..', '..ggGggg..', '.ggGgggg..', '.gGgggg...', '.ggggg....', '..ggg.....', '.b........', 'b.........'] },
  bake: { pal: { o: PAL.ochre, O: PAL.amber, y: PAL.sun }, rows: ['..........', '..........', '...oyyo...', '..oOoOoo..', '.oOoOoOoo.', 'ooOoOoOooo', 'oo.oooo.oo', 'o........o', '..........', '..........'] },
  mug: { pal: { w: PAL.terracotta, c: PAL.umber, s: PAL.grey, d: '#8E4A22', m: PAL.ivory }, rows: ['..s..s....', '...s..s...', '..........', 'wwwwwww...', 'wcmmmcwww.', 'wcccccw.w.', 'wwwwwwwww.', 'wwwwwww...', '.wwwww....', '..........'] },
  person: { pal: { h: PAL.umber, f: '#E0AC82', k: PAL.charcoal, t: PAL.sun }, rows: ['...hhhh...', '..hhhhhh..', '..hffffh..', '..fkffkf..', '..ffffff..', '...ffff...', '.tttttttt.', 'tttttttttt', 'tttttttttt', 'tt.tttt.tt'] },
  basket: { pal: { o: PAL.ochre, d: PAL.amber, y: PAL.sun }, rows: ['y..............y', 'oy............yo', 'odoooooooooooodo', 'ooddoddoddoddooo', '.oooooooooooooo.', '.oddoddoddoddoo.', '..oooooooooooo..', '...dddddddddd...'] },
};
const cache = new Map();
/** A sprite as a small canvas. `tint` swaps palette colours ({ r: '#…' }); `turn` rotates by quarter turns. */
export function sprite(name, { tint = null, turn = 0, flip = false } = {}) {
  const key = `${name}|${tint ? JSON.stringify(tint) : ''}|${turn}|${flip}`;
  if (cache.has(key)) return cache.get(key);
  const s = SPR[name];
  const w = s.rows[0].length, h = s.rows.length;
  const c = document.createElement('canvas');
  const side = turn % 2 ? [h, w] : [w, h];
  c.width = side[0]; c.height = side[1];
  const ctx = c.getContext('2d');
  const pal = { ...s.pal, ...(tint || {}) };
  ctx.translate(c.width / 2, c.height / 2);
  ctx.rotate((turn * Math.PI) / 2);
  if (flip) ctx.scale(-1, 1);
  ctx.translate(-w / 2, -h / 2);
  s.rows.forEach((row, y) => [...row].forEach((ch, x) => { if (pal[ch]) { ctx.fillStyle = pal[ch]; ctx.fillRect(x, y, 1, 1); } }));
  cache.set(key, c);
  return c;
}
export function drawSprite(ctx, name, x, y, opts = {}) {
  const s = sprite(name, opts);
  const k = opts.scale || 1;
  ctx.drawImage(s, Math.round(x), Math.round(y), s.width * k, s.height * k);
  return s;
}
/** A sprite as a data URL (for <img> in the Tag Builder preview and the hub). */
export function spriteUrl(name, scale = 4, opts = {}) {
  const s = sprite(name, opts);
  const c = document.createElement('canvas');
  c.width = s.width * scale; c.height = s.height * scale;
  const ctx = c.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(s, 0, 0, c.width, c.height);
  return c.toDataURL();
}

// ---------------------------------------------------------------- stage
/** A canvas of w x h game pixels, shown as large as its box allows with hard edges. */
export function stage(canvas, w, h) {
  canvas.width = w; canvas.height = h;
  canvas.style.aspectRatio = `${w} / ${h}`;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  return ctx;
}
/** A cheap repeatable 0..1 value for a tile, so grass and hedges keep their speckles between frames. */
export const hash = (x, y, k = 0) => { let n = (x * 374761393 + y * 668265263 + k * 2147483647) | 0; n = (n ^ (n >>> 13)) * 1274126177; return ((n ^ (n >>> 16)) >>> 0) / 4294967296; };
/** Turn every [data-px] element into bitmap-font lettering; the words stay in the page for screen readers. */
export function pixelHeadings(scope = document) {
  scope.querySelectorAll('[data-px]').forEach((el) => {
    if (el.dataset.pxDone) return;
    const text = el.textContent.trim();
    const scale = +(el.dataset.px || 3);
    const c = document.createElement('canvas');
    c.width = textWidth(text, 1) + 1; c.height = 8;
    c.className = 'px-text';
    c.style.width = `${c.width * scale}px`;
    c.setAttribute('aria-hidden', 'true');
    const ctx = c.getContext('2d');
    drawText(ctx, text, 0, 0, { color: el.dataset.pxShadow || PAL.umber });
    const top = document.createElement('canvas');
    top.width = c.width; top.height = 8;
    drawText(top.getContext('2d'), text, 0, 0, { color: el.dataset.pxColor || PAL.sun });
    ctx.clearRect(0, 0, c.width, 8);
    drawText(ctx, text, 1, 1, { color: el.dataset.pxShadow || PAL.umber });
    ctx.drawImage(top, 0, 0);
    const sr = document.createElement('span');
    sr.className = 'visually-hidden'; sr.textContent = text;
    el.textContent = ''; el.append(c, sr);
    el.dataset.pxDone = '1';
  });
}

// ---------------------------------------------------------------- loop
/** Calls fn(dt seconds, t seconds) every frame until the returned stop() is called. Pauses when the tab is hidden. */
export function loop(fn) {
  let id = 0, last = 0, t = 0, live = true;
  const frame = (now) => {
    if (!live) return;
    const dt = last ? Math.min(0.05, (now - last) / 1000) : 0;
    last = now; t += dt;
    fn(dt, t);
    id = requestAnimationFrame(frame);
  };
  id = requestAnimationFrame(frame);
  return () => { live = false; cancelAnimationFrame(id); };
}
export const calm = () => document.documentElement.classList.contains('motion-paused') || (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);

// ---------------------------------------------------------------- sound
let ac = null, muted = false;
export function setMuted(m) { muted = m; }
const TUNES = {
  step: [[440, 0.03]], turn: [[330, 0.03]], pick: [[660, 0.05], [880, 0.07]], ok: [[523, 0.07], [659, 0.07], [784, 0.12]], bad: [[196, 0.12], [147, 0.18]],
  win: [[523, 0.08], [659, 0.08], [784, 0.08], [1047, 0.2]], hit: [[880, 0.04], [440, 0.06]], tick: [[990, 0.02]], over: [[392, 0.14], [330, 0.14], [262, 0.3]], level: [[659, 0.08], [880, 0.16]],
};
export function sfx(name) {
  if (muted) return;
  try {
    ac = ac || new (window.AudioContext || window.webkitAudioContext)();
    if (ac.state === 'suspended') ac.resume();
    let t = ac.currentTime;
    for (const [f, d] of TUNES[name] || []) {
      const o = ac.createOscillator(), g = ac.createGain();
      o.type = 'square'; o.frequency.value = f;
      g.gain.setValueAtTime(0.045, t); g.gain.exponentialRampToValueAtTime(0.001, t + d);
      o.connect(g).connect(ac.destination); o.start(t); o.stop(t + d);
      t += d * 0.9;
    }
  } catch { /* no sound available: the game is fully playable without it */ }
}
