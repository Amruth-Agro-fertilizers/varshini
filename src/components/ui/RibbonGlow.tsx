'use client';

import { useEffect, useMemo, useRef } from 'react';

/**
 * Ribbon Glow — a drifting field of light, rendered on its own WebGL2 canvas.
 *
 * Supplied as a Framer component and adapted rather than rewritten: the shaders
 * and the field maths are untouched. What changed is everything around them.
 *
 *  - The original forced a 1200x800 minimum on its root, which inside a card
 *    would simply blow the card out to that size. It fills its parent now.
 *  - It stops when it cannot be seen. This is an eighty-four iteration loop per
 *    pixel running beside a full three.js scene, and paying for it while it is
 *    scrolled off is the sort of cost nothing on screen accounts for.
 *  - It honours prefers-reduced-motion by drawing one frame and holding it, so
 *    the artwork is still there without the drift.
 *  - Props are read through a ref that an effect keeps current, rather than by
 *    writing to a ref during render, which React's compiler will not allow.
 */

const MAX_DPR = 2;
const NAME = 'RibbonGlow';

const LAYERS = 84;
const TWIST = 1.25;
const DRAG = 0.18;

const VERT_SRC = `#version 300 es
const vec2 P[3] = vec2[3](vec2(-1.0, -1.0), vec2(3.0, -1.0), vec2(-1.0, 3.0));
void main() { gl_Position = vec4(P[gl_VertexID], 0.0, 1.0); }
`;

const FIELD_SRC = `#version 300 es
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform vec3 uC1;
uniform vec3 uC2;
uniform float uSize;
uniform float uAngle;
uniform vec2 uMouse;
uniform float uOn;
uniform float uReach;
uniform vec2 uVel;
out vec4 o;

const float LAYERS = ${LAYERS.toFixed(1)};
const float TWIST = ${TWIST.toFixed(3)};
const float DRAG = ${DRAG.toFixed(3)};
const float GAIN = 0.62;
const vec2 CENTRE = vec2(-0.62, 0.24);
const float TILT = 0.6;
const float ZOOM = 1.05;
const float THETA = 2.13;
const float SHEAR = 0.963;
const float SHRINK = 0.953;
const vec2 WARP_FREQ = vec2(0.42, 2.4);
const vec2 WARP_AMP = vec2(0.13, 0.027);
const vec2 ASPECT = vec2(2.1, 0.17);
const float OFFSET = 0.36;
const float GLOW = 0.0021;
const float SOFT = 0.0019;
const float FALLOFF = 0.37;
const float PHASE = 12.0;
const float CYCLE = 0.16;
const float HUE_TRAVEL = 2.0;

mat2 rot(float a) { float c = cos(a), s = sin(a); return mat2(c, s, -s, c); }

void main() {
  vec2 R = uRes;
  vec2 pos = (gl_FragCoord.xy - 0.5 * R) / R.y;

  vec2 d = pos - uMouse;
  float w = uOn * exp(-dot(d, d) / (uReach * uReach));
  if (w > 1e-4) pos = uMouse + rot(w * TWIST) * d * (1.0 - 0.3 * min(w, 1.0)) - uVel * min(w, 1.0) * DRAG;

  pos = rot(uAngle) * pos / uSize;
  float t = uTime * 0.49 + PHASE;
  float breath = (-sin(uTime * 0.735) + sin(uTime * 0.49 + 1.0)) * 0.25 + 0.5;
  vec2 u = rot(TILT) * ((pos - CENTRE) * (ZOOM - breath * 0.085));
  mat2 fold = mat2(cos(THETA), sin(THETA), -SHEAR, cos(THETA));

  vec3 col = vec3(0.0);
  for (float i = 1.0; i <= LAYERS; i += 1.0) {
    u.x -= sin(u.y * WARP_FREQ.x + t + i * 0.007) * WARP_AMP.x;
    u.y -= sin(u.x * WARP_FREQ.y - t + i * 0.02) * WARP_AMP.y;
    u = fold * u * SHRINK;
    vec2 q = (u - vec2(OFFSET + breath * 0.1, 0.0)) * ASPECT;
    float g = GLOW / (dot(q, q) + SOFT) * (0.25 + breath * 0.4);
    float r = length(u);
    float k = sin(i * CYCLE + t * 1.2 + r * HUE_TRAVEL) * 0.5 + 0.5;
    col += g * mix(uC1, uC2, k) * (0.62 + 0.5 * k) * exp2(-r * FALLOFF);
  }
  vec3 x = max(col * GAIN, 0.0);
  col = (x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14);
  col = pow(clamp(col, 0.0, 1.0), vec3(0.85, 0.92, 0.98));
  col *= 1.0 - smoothstep(0.5, 1.6, length(pos)) * 0.07;
  o = vec4(col, 1.0);
}
`;

const FINISH_SRC = `#version 300 es
precision highp float;
uniform sampler2D uField;
uniform vec2 uRes;
uniform float uTime;
uniform vec3 uBg;
uniform float uPaper;
out vec4 o;

float ign(vec2 p, float f) { p += 5.588238 * mod(f, 64.0); return fract(52.9829189 * fract(0.06711056 * p.x + 0.00583715 * p.y)); }

void main() {
  vec2 frag = gl_FragCoord.xy;
  vec3 L = max(texture(uField, frag / uRes).rgb, 0.0);

  vec3 dark = uBg + L * (1.0 - uBg);
  float strength = clamp(max(L.r, max(L.g, L.b)), 0.0, 1.0);
  vec3 paper = uBg * (1.0 - strength) + L * 0.96;
  vec3 col = mix(dark, paper, uPaper);
  col += (ign(frag, floor(uTime * 24.0)) - 0.5) / 255.0;
  o = vec4(clamp(col, 0.0, 1.0), 1.0);
}
`;

type RGB = [number, number, number];

const colorCache = new Map<string, RGB | null>();

function parseColor(input: string | undefined): RGB | null {
  if (!input) return null;
  const key = String(input);
  if (colorCache.has(key)) return colorCache.get(key) ?? null;
  const s = key.trim();
  let out: RGB | null = null;
  if (s.charAt(0) === '#') {
    let h = s.slice(1);
    if (h.length === 3 || h.length === 4) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    if (h.length >= 6) {
      const r = parseInt(h.slice(0, 2), 16);
      const g = parseInt(h.slice(2, 4), 16);
      const b = parseInt(h.slice(4, 6), 16);
      if (Number.isFinite(r) && Number.isFinite(g) && Number.isFinite(b)) {
        out = [r / 255, g / 255, b / 255];
      }
    }
  }
  colorCache.set(key, out);
  return out;
}

function color(input: string | undefined, fallback: string): RGB {
  return parseColor(input) ?? (parseColor(fallback) as RGB);
}

const clampN = (v: number, lo: number, hi: number) => (v < lo ? lo : v > hi ? hi : v);

function link(gl: WebGL2RenderingContext, frag: string, label: string): WebGLProgram | null {
  const shader = (type: number, src: string) => {
    const sh = gl.createShader(type);
    if (!sh) return null;
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
      console.error(`${NAME} ${label} shader:`, gl.getShaderInfoLog(sh));
      gl.deleteShader(sh);
      return null;
    }
    return sh;
  };
  const vs = shader(gl.VERTEX_SHADER, VERT_SRC);
  const fs = shader(gl.FRAGMENT_SHADER, frag);
  if (!vs || !fs) return null;
  const prog = gl.createProgram();
  if (!prog) return null;
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  gl.deleteShader(vs);
  gl.deleteShader(fs);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    console.error(`${NAME} ${label} link:`, gl.getProgramInfoLog(prog));
    gl.deleteProgram(prog);
    return null;
  }
  return prog;
}

function locations(gl: WebGL2RenderingContext, prog: WebGLProgram, names: string[]) {
  const out: Record<string, WebGLUniformLocation | null> = {};
  for (const n of names) out[n] = gl.getUniformLocation(prog, n);
  return out;
}

function fieldTarget(gl: WebGL2RenderingContext) {
  const fbo = gl.createFramebuffer();
  let tex: WebGLTexture | null = null;
  let w = 0;
  let h = 0;
  let half = !!gl.getExtension('EXT_color_buffer_float');
  return {
    fbo,
    texture: () => tex,
    width: () => w,
    height: () => h,
    resize(nw: number, nh: number) {
      if (nw === w && nh === h && tex) return;
      for (let attempt = 0; attempt < 2; attempt++) {
        if (tex) gl.deleteTexture(tex);
        tex = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texImage2D(
          gl.TEXTURE_2D, 0, half ? gl.RGBA16F : gl.RGBA8, nw, nh, 0, gl.RGBA,
          half ? gl.HALF_FLOAT : gl.UNSIGNED_BYTE, null,
        );
        gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
        const ok = gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        if (ok || !half) break;
        half = false;
      }
      w = nw;
      h = nh;
    },
    dispose() {
      if (tex) gl.deleteTexture(tex);
      gl.deleteFramebuffer(fbo);
    },
  };
}

function trackPointer(root: HTMLElement) {
  const p = { tx: 0, ty: 0, inside: false };
  const read = (e: PointerEvent) => {
    const r = root.getBoundingClientRect();
    p.tx = (e.clientX - r.left) * (root.offsetWidth / (r.width || 1));
    p.ty = (e.clientY - r.top) * (root.offsetHeight / (r.height || 1));
    p.inside =
      e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
  };
  const out = (e: PointerEvent) => {
    if (!e.relatedTarget) p.inside = false;
  };
  window.addEventListener('pointermove', read, { passive: true });
  window.addEventListener('pointerdown', read, { passive: true });
  document.addEventListener('pointerout', out);
  return {
    p,
    dispose() {
      window.removeEventListener('pointermove', read);
      window.removeEventListener('pointerdown', read);
      document.removeEventListener('pointerout', out);
    },
  };
}

const DEFAULTS = { background: '#0B0A10', color1: '#2FD3F2', color2: '#7B61FF' };

type Props = {
  className?: string;
  style?: React.CSSProperties;
  background?: string;
  color1?: string;
  color2?: string;
  speed?: number;
  size?: number;
  angle?: number;
  hover?: number;
  reach?: number;
  /**
   * 0 to 1, sampled every frame — how far through its beat the artwork is.
   *
   * A getter rather than a value so the scroll can drive it without putting a
   * React render between the wheel and the pixels; this is the same reason the
   * three.js scene reads its scroll from a module singleton.
   */
  progress?: () => number;
};

export default function RibbonGlow({
  className = '',
  style,
  background = DEFAULTS.background,
  color1 = DEFAULTS.color1,
  color2 = DEFAULTS.color2,
  speed = 50,
  size = 100,
  angle = -180,
  hover = 100,
  reach = 240,
  progress,
}: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const settings = useMemo(
    () => ({
      background,
      color1,
      color2,
      speed: clampN(speed, 0, 100) / 50,
      size: clampN(size, 50, 200) / 100,
      angle: (clampN(angle, -180, 180) * Math.PI) / 180,
      hover: clampN(hover, 0, 200) / 100,
      reach: clampN(reach, 10, 800),
    }),
    [background, color1, color2, speed, size, angle, hover, reach],
  );

  const settingsRef = useRef(settings);
  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  const progressRef = useRef(progress);
  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const root = rootRef.current;
    if (!canvas || !root) return;

    const gl = canvas.getContext('webgl2', {
      antialias: false,
      alpha: false,
      depth: false,
      stencil: false,
    });
    if (!gl) {
      console.error(`${NAME}: WebGL2 unavailable`);
      return;
    }

    const field = link(gl, FIELD_SRC, 'field');
    const finish = link(gl, FINISH_SRC, 'finish');
    if (!field || !finish) return;

    const uf = locations(gl, field, [
      'uRes', 'uTime', 'uC1', 'uC2', 'uSize', 'uAngle', 'uMouse', 'uOn', 'uReach', 'uVel',
    ]);
    const un = locations(gl, finish, ['uField', 'uRes', 'uTime', 'uBg', 'uPaper']);
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    const target = fieldTarget(gl);
    const pointer = trackPointer(root);
    const ptr = pointer.p;

    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let mx = 0, my = 0, vx = 0, vy = 0, on = 0;
    let raf = 0;
    let last = -1;
    let clock = 0;
    let visible = false;
    let drawn = false;

    // Scroll state: where the beat is, and how hard it is being moved.
    let beat = 0;
    let surge = 0;

    const draw = (dt: number) => {
      const v = settingsRef.current;

      /*
       * Scroll drives the artwork, not just the card it sits in.
       *
       * Three things come off it. The field sweeps round, so the ribbons are
       * visibly at a different attitude by the end of the beat than the start.
       * It closes in slightly, which reads as the light coming toward the
       * reader. And the rate of scrolling feeds a surge that both runs the
       * clock faster and twists the field about its centre — so moving the
       * wheel pushes the light, and stopping lets it settle. Position alone
       * would animate on scroll; the surge is what makes it respond to it.
       */
      const read = progressRef.current;
      const next = read ? clampN(read(), 0, 1) : 0;
      const rate = dt > 0 ? Math.abs(next - beat) / dt : 0;
      beat = next;
      surge += (clampN(rate * 2.6, 0, 1) - surge) * (1 - Math.exp(-dt * (rate > surge ? 14 : 3.5)));

      clock = (clock + dt * (v.speed + surge * 5.5)) % 3600;

      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      const cw = canvas.clientWidth || 1;
      const ch = canvas.clientHeight || 1;
      const bw = Math.max(1, Math.round(cw * dpr));
      const bh = Math.max(1, Math.round(ch * dpr));
      if (canvas.width !== bw || canvas.height !== bh) {
        canvas.width = bw;
        canvas.height = bh;
      }
      target.resize(Math.max(1, Math.round(bw / 2)), Math.max(1, Math.round(bh / 2)));

      const present = ptr.inside ? 1 : 0;
      if (present && on < 0.02) {
        mx = ptr.tx;
        my = ptr.ty;
      }
      on += (present - on) * (1 - Math.exp(-dt * 5));
      const k = 1 - Math.exp(-dt * 16);
      const nx = mx + (ptr.tx - mx) * k;
      const ny = my + (ptr.ty - my) * k;
      if (dt > 0) {
        const kv = 1 - Math.exp(-dt * 8);
        vx += ((nx - mx) / dt - vx) * kv;
        vy += ((ny - my) / dt - vy) * kv;
      }
      mx = nx;
      my = ny;
      const vLen = Math.hypot(vx, vy) / ch;
      const vCap = vLen > 3 ? 3 / vLen : 1;

      const c1 = color(v.color1, DEFAULTS.color1);
      const c2 = color(v.color2, DEFAULTS.color2);
      const bg = color(v.background, DEFAULTS.background);
      const bgLum = 0.2126 * bg[0] + 0.7152 * bg[1] + 0.0722 * bg[2];

      gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo);
      gl.viewport(0, 0, target.width(), target.height());
      gl.useProgram(field);
      gl.uniform2f(uf.uRes, target.width(), target.height());
      gl.uniform1f(uf.uTime, clock);
      gl.uniform3f(uf.uC1, c1[0], c1[1], c1[2]);
      gl.uniform3f(uf.uC2, c2[0], c2[1], c2[2]);
      gl.uniform1f(uf.uSize, v.size * (1 - beat * 0.24));
      gl.uniform1f(uf.uAngle, v.angle + beat * 1.15);

      // The pointer still wins where there is one; the scroll takes the field
      // over otherwise, twisting it about the centre rather than the cursor.
      const pointerOn = on * v.hover;
      const scrollOn = surge * 0.9;
      const led = scrollOn > pointerOn;
      gl.uniform2f(
        uf.uMouse,
        led ? 0 : (mx - cw / 2) / ch,
        led ? 0 : (ch / 2 - my) / ch,
      );
      gl.uniform1f(uf.uOn, Math.max(pointerOn, scrollOn));
      gl.uniform1f(uf.uReach, (led ? Math.max(v.reach, 420) : v.reach) / ch);
      gl.uniform2f(
        uf.uVel,
        led ? 0 : (vx / ch) * vCap,
        led ? surge * 1.6 : (-vy / ch) * vCap,
      );
      gl.drawArrays(gl.TRIANGLES, 0, 3);

      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, bw, bh);
      gl.useProgram(finish);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, target.texture());
      gl.uniform1i(un.uField, 0);
      gl.uniform2f(un.uRes, bw, bh);
      gl.uniform1f(un.uTime, clock);
      gl.uniform3f(un.uBg, bg[0], bg[1], bg[2]);
      gl.uniform1f(un.uPaper, clampN((bgLum - 0.35) / 0.3, 0, 1));
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      drawn = true;
    };

    const render = (now: number) => {
      raf = requestAnimationFrame(render);
      const dt = last < 0 ? 0 : clampN((now - last) / 1000, 0, 0.05);
      last = now;
      draw(dt);
    };

    // Runs only while on screen. One frame is drawn either way, so a card that
    // has not been scrolled to yet is never blank when it arrives.
    const observer = new IntersectionObserver(
      ([entry]) => {
        const next = entry.isIntersecting;
        if (next === visible) return;
        visible = next;
        if (visible && !still) {
          last = -1;
          raf = requestAnimationFrame(render);
        } else {
          cancelAnimationFrame(raf);
          raf = 0;
          if (!drawn) draw(0);
        }
      },
      { rootMargin: '120px' },
    );
    observer.observe(root);
    if (still) draw(0);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(raf);
      pointer.dispose();
      target.dispose();
      gl.deleteVertexArray(vao);
      gl.deleteProgram(field);
      gl.deleteProgram(finish);
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className={className}
      /*
       * Position comes last so a caller can place this wherever it needs to
       * go. It defaults to relative because the canvas inside is absolute and
       * needs something to resolve against — but an inline default silently
       * beats any positioning class handed in, which collapsed the root to no
       * height and left the canvas sized zero by zero.
       */
      style={{ overflow: 'hidden', background, position: 'relative', ...style }}
    >
      <canvas
        ref={canvasRef}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }}
      />
    </div>
  );
}
