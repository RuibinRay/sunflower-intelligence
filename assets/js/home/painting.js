// painting.js — the living painting.
// Paint drifts along its own brushstrokes (flow map), a slow raking light crosses the impasto (height map),
// flower heads sway in the air, a chosen doorway flower glows and swells a little, and a click dives
// into it. Nothing follows the pointer. One fragment shader; a lighter variant drops the light for slow GPUs.

const VERT = `
attribute vec2 aPos;
varying vec2 vUv;
void main() { vUv = aPos * 0.5 + 0.5; gl_Position = vec4(aPos, 0.0, 1.0); }`;

const frag = (lite, nDoors) => `
precision highp float;
varying vec2 vUv;
uniform sampler2D uPaint;
uniform sampler2D uFlow;
uniform sampler2D uHeight;
uniform vec2 uImg;
uniform vec4 uView;
uniform float uTime;
uniform float uFlowAmp;
uniform float uFlowRate;
uniform float uSway;
uniform vec3 uLight;
uniform vec4 uHeads[18];
uniform vec4 uDoors[${nDoors}];
uniform float uAnyHover;
uniform vec4 uPortal;
uniform vec2 uHeightTexel;
uniform float uWake;

vec2 rot(vec2 v, float a) { float c = cos(a), s = sin(a); return vec2(c * v.x - s * v.y, s * v.x + c * v.y); }

void main() {
  vec2 p = vec2(uView.x + vUv.x * uView.z, uView.y + (1.0 - vUv.y) * uView.w);

  // the dive: the camera falls into the chosen flower, turning like a seed spiral
  if (uPortal.z > 0.0) {
    float e = uPortal.z;
    vec2 d = p - uPortal.xy;
    p = uPortal.xy + rot(d, 1.4 * e * e) / (1.0 + 16.0 * e * e * e);
  }

  vec2 disp = vec2(0.0);
  for (int i = 0; i < 18; i++) {
    vec4 h = uHeads[i];
    vec2 d = p - h.xy;
    float q = length(d) / h.z;
    if (q < 1.4) {
      float fall = 1.0 - smoothstep(0.5, 1.35, q);
      float a = uSway * sin(uTime * 0.55 + h.w) * fall;
      disp += rot(d, -a) - d;
    }
  }

  float headMask = 0.0, glow = 0.0, halo = 0.0;
  for (int k = 0; k < ${nDoors}; k++) {
    vec4 dr = uDoors[k];
    vec2 d = p - dr.xy;
    float q = length(d) / dr.z;
    if (q < 1.7) {
      float hov = dr.w;
      float fall = 1.0 - smoothstep(0.6, 1.6, q);
      float inner = 1.0 - min(q * q, 1.0);
      disp += d / (1.0 + 0.06 * hov * inner * fall) - d;
      headMask = max(headMask, hov * (1.0 - smoothstep(0.95, 1.4, q)));
      glow += hov * (1.0 - smoothstep(0.0, 0.6, q));
      halo += (hov + uWake * 0.6) * smoothstep(1.5, 1.08, q) * smoothstep(0.84, 1.04, q);
    }
  }
  p += disp;
  vec2 uv = p / uImg;

  // paint drifting along its brushstrokes (two offset phases, cross-faded so the drift never jumps)
  vec3 f = texture2D(uFlow, uv).rgb;
  vec2 o = (f.rg * 2.0 - 1.0) * f.b * uFlowAmp / uImg;
  float t = uTime * uFlowRate + 0.5 + 0.5 * sin(p.x * 0.011 + 1.7 * sin(p.y * 0.009));
  float ph0 = fract(t), ph1 = fract(t + 0.5);
  vec3 c0 = texture2D(uPaint, uv - o * (ph0 - 0.5), -0.6).rgb;
  vec3 c1 = texture2D(uPaint, uv - o * (ph1 - 0.5), -0.6).rgb;
  vec3 col = mix(c0, c1, abs(2.0 * ph0 - 1.0));

  ${lite ? '' : `
  // raking light on the impasto: only the ridges change, flat paint keeps its colour
  float hl = texture2D(uHeight, uv - vec2(uHeightTexel.x, 0.0)).r;
  float hr = texture2D(uHeight, uv + vec2(uHeightTexel.x, 0.0)).r;
  float hu = texture2D(uHeight, uv - vec2(0.0, uHeightTexel.y)).r;
  float hd = texture2D(uHeight, uv + vec2(0.0, uHeightTexel.y)).r;
  vec3 N = normalize(vec3(hl - hr, hu - hd, 0.55));
  vec2 lp = uLight.xy - p;
  vec3 L = normalize(vec3(lp / uImg.x, 0.2));
  float diff = dot(N, L) - L.z;
  vec3 H = normalize(L + vec3(0.0, 0.0, 1.0));
  float spec = pow(clamp(dot(N, H), 0.0, 1.0), 30.0);
  float pool = exp(-dot(lp, lp) / (2.0 * 560.0 * 560.0));
  col *= 1.0 + uLight.z * diff * 0.5;
  col += uLight.z * (spec * 0.1 * (0.3 + 0.7 * pool) * vec3(1.0, 0.94, 0.78) + pool * 0.055 * vec3(1.0, 0.85, 0.48));
  `}

  col += glow * 0.2 * vec3(1.0, 0.82, 0.36);
  col += halo * vec3(0.16, 0.11, 0.0);
  float dimAmt = uAnyHover * (1.0 - headMask);
  float lum = dot(col, vec3(0.299, 0.587, 0.114));
  col = mix(col, vec3(lum), 0.2 * dimAmt) * (1.0 - 0.1 * dimAmt);
  gl_FragColor = vec4(col, 1.0);
}`;

function compile(gl, type, src) {
  const sh = gl.createShader(type);
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) { const log = gl.getShaderInfoLog(sh); gl.deleteShader(sh); throw new Error(log); }
  return sh;
}

async function loadImage(url) {
  const img = new Image();
  img.decoding = 'async';
  img.src = url;
  await img.decode();
  return img;
}

export class LivingPainting {
  constructor(canvas, meta) {
    this.canvas = canvas;
    this.meta = meta;
    this.tier = 'full';
    this.dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    this.view = [0, 0, meta.width, meta.height];
    this.heads = meta.flowers.map((f, i) => [f.x, f.y, f.r * 1.02, (i * 2.399) % (Math.PI * 2)]);
    this.doors = meta.doorways.map((id) => meta.flowers.find((f) => f.id === id));
    this.hover = new Float32Array(meta.doorways.length);
    this.light = [meta.width * 0.3, meta.height * 0.2, 0];
    this.portal = [0, 0, 0, 0];
    this.time = 0;
    this.anyHover = 0;
    this.wake = 0;
    this.flowAmp = 4.5;
    this.flowRate = 0.12;
    this.sway = 0.022;
    this.lost = false;
  }

  async init({ paint, flow, height, allowSoftware = false }) {
    const opts = { antialias: false, alpha: false, depth: false, stencil: false, premultipliedAlpha: false, preserveDrawingBuffer: false, powerPreference: 'high-performance' };
    const gl = this.canvas.getContext('webgl2', opts) || this.canvas.getContext('webgl', opts);
    if (!gl) throw new Error('WebGL unavailable');
    this.gl = gl;
    this.isGL2 = typeof WebGL2RenderingContext !== 'undefined' && gl instanceof WebGL2RenderingContext;
    // software renderers (SwiftShader, llvmpipe) work, but cost the CPU dearly: they get the light tier
    try {
      const dbg = gl.getExtension('WEBGL_debug_renderer_info');
      this.renderer = dbg ? String(gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL)) : '';
    } catch { this.renderer = ''; }
    this.software = /swiftshader|llvmpipe|software|basic render/i.test(this.renderer);
    if (this.software && !allowSoftware) { this.release(); throw new Error(`software renderer (${this.renderer})`); }
    if (this.software) this.tier = 'lite';
    this.canvas.addEventListener('webglcontextlost', (e) => { e.preventDefault(); this.lost = true; });
    this.canvas.addEventListener('webglcontextrestored', () => { this.lost = false; this.setup(this.images); });
    this.images = await Promise.all([loadImage(paint), loadImage(flow), loadImage(height)]);
    this.setup(this.images);
    return this;
  }

  setup([paintImg, flowImg, heightImg]) {
    const gl = this.gl;
    this.programs = {};
    for (const tier of ['full', 'lite']) {
      const prog = gl.createProgram();
      gl.attachShader(prog, compile(gl, gl.VERTEX_SHADER, VERT));
      gl.attachShader(prog, compile(gl, gl.FRAGMENT_SHADER, frag(tier === 'lite', this.doors.length)));
      gl.bindAttribLocation(prog, 0, 'aPos');
      gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
      const u = {};
      const n = gl.getProgramParameter(prog, gl.ACTIVE_UNIFORMS);
      for (let i = 0; i < n; i++) { const info = gl.getActiveUniform(prog, i); const name = info.name.replace(/\[0\]$/, ''); u[name] = gl.getUniformLocation(prog, info.name); }
      this.programs[tier] = { prog, u };
    }
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    const tex = (img, unit, mip) => {
      const t = gl.createTexture();
      gl.activeTexture(gl.TEXTURE0 + unit);
      gl.bindTexture(gl.TEXTURE_2D, t);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      const canMip = mip && this.isGL2;
      if (canMip) gl.generateMipmap(gl.TEXTURE_2D);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, canMip ? gl.LINEAR_MIPMAP_LINEAR : gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      return t;
    };
    tex(paintImg, 0, true);
    tex(flowImg, 1, false);
    tex(heightImg, 2, false);
    this.heightTexel = [1 / heightImg.naturalWidth, 1 / heightImg.naturalHeight];
  }

  resize() {
    const { canvas } = this;
    // never draw more pixels than the painting has, and stay under ~2.6 MP a frame
    let k = this.dpr * (this.tier === 'lite' ? 0.75 : 1);
    const cw = canvas.clientWidth, ch = canvas.clientHeight;
    const maxK = Math.sqrt(2.6e6 / Math.max(1, cw * ch));
    k = Math.min(k, maxK, (this.meta.width / this.view[2]) * 1.05);
    const w = Math.max(1, Math.round(cw * k)), h = Math.max(1, Math.round(ch * k));
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
  }

  setView(x, y, w, h) { this.view = [x, y, w, h]; }

  /** Hand the GPU context back before leaving (software GL can take seconds to tear it down otherwise). */
  release() {
    if (!this.gl || this.lost) return;
    this.loseExt = this.loseExt || this.gl.getExtension('WEBGL_lose_context');
    this.loseExt?.loseContext();
  }
  restore() { if (this.lost) this.loseExt?.restoreContext(); }

  render() {
    if (this.lost || !this.programs) return;
    const gl = this.gl;
    this.resize();
    const { prog, u } = this.programs[this.tier];
    gl.useProgram(prog);
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    gl.uniform1i(u.uPaint, 0); gl.uniform1i(u.uFlow, 1); gl.uniform1i(u.uHeight, 2);
    gl.uniform2f(u.uImg, this.meta.width, this.meta.height);
    gl.uniform4f(u.uView, ...this.view);
    gl.uniform1f(u.uTime, this.time);
    gl.uniform1f(u.uFlowAmp, this.flowAmp);
    gl.uniform1f(u.uFlowRate, this.flowRate);
    gl.uniform1f(u.uSway, this.sway);
    if (u.uLight) gl.uniform3f(u.uLight, ...this.light);
    if (u.uHeightTexel) gl.uniform2f(u.uHeightTexel, ...this.heightTexel);
    gl.uniform4fv(u.uHeads, this.heads.flat());
    const doors = [];
    this.doors.forEach((d, k) => doors.push(d.x, d.y, d.r, this.hover[k]));
    gl.uniform4fv(u.uDoors, doors);
    gl.uniform1f(u.uAnyHover, this.anyHover);
    gl.uniform4f(u.uPortal, ...this.portal);
    gl.uniform1f(u.uWake, this.wake);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }
}
