import gsap from 'gsap';

const VERT = `
attribute vec2 a_pos;
varying vec2 v_uv;
void main() {
  v_uv = a_pos * 0.5 + 0.5;
  v_uv.y = 1.0 - v_uv.y;
  gl_Position = vec4(a_pos, 0.0, 1.0);
}`;

// Each pixel samples the photo shifted by its depth: near things move more than far ones.
const FRAG = `
precision mediump float;
uniform sampler2D u_image;
uniform sampler2D u_depth;
uniform vec4 u_fit;
uniform vec2 u_offset;
uniform float u_dolly;
varying vec2 v_uv;
void main() {
  vec2 uv = u_fit.xy + v_uv * u_fit.zw;
  vec2 focus = u_fit.xy + 0.5 * u_fit.zw;
  // Dolly: sampling nearer the focus magnifies, and near pixels magnify more, as when a camera moves in.
  // Depth is re-read at the shifted point a few times so edges of near objects don't smear over the background.
  float d = texture2D(u_depth, uv).r - 0.35;
  for (int i = 0; i < 3; i++) {
    d = texture2D(u_depth, uv - u_offset * d - (uv - focus) * u_dolly * d).r - 0.35;
  }
  gl_FragColor = texture2D(u_image, uv - u_offset * d - (uv - focus) * u_dolly * d);
}`;

// Replaces `img` with a WebGL copy that moves by a depth map. Scroll drives it (a shift plus a dolly-in,
// so the depth reads without any pointer); the pointer adds a small extra shift.
// `zoom` and `position` repeat the img's object-fit: cover framing so the swap lines up.
export function initDepth(img, { depth, pointerPx = 12, scrollPx = 36, dolly = 0.08, zoom = 1, position = [0.5, 0.5] }) {
  const host = img.closest('picture').parentElement;
  const canvas = document.createElement('canvas');
  canvas.className = 'depth-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  const gl = canvas.getContext('webgl', { premultipliedAlpha: false });
  if (!gl) return;

  const program = link(gl, VERT, FRAG);
  gl.useProgram(program);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const aPos = gl.getAttribLocation(program, 'a_pos');
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
  const uFit = gl.getUniformLocation(program, 'u_fit');
  const uOffset = gl.getUniformLocation(program, 'u_offset');
  const uDolly = gl.getUniformLocation(program, 'u_dolly');
  gl.uniform1i(gl.getUniformLocation(program, 'u_image'), 0);
  gl.uniform1i(gl.getUniformLocation(program, 'u_depth'), 1);

  const pointer = { x: 0, y: 0 };
  const toX = gsap.quickTo(pointer, 'x', { duration: 1.2, ease: 'power3.out' });
  const toY = gsap.quickTo(pointer, 'y', { duration: 1.2, ease: 'power3.out' });
  let visible = false;
  let ready = false;
  let size = [0, 0];
  let last = '';

  const resize = () => {
    const w = host.clientWidth;
    const h = host.clientHeight;
    const dpr = Math.min(devicePixelRatio, 2);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    gl.viewport(0, 0, canvas.width, canvas.height);
    size = [w, h];

    // object-fit: cover + object-position, expressed as the visible window into the image's 0..1 uv space.
    const iw = img.naturalWidth;
    const ih = img.naturalHeight;
    const s = Math.max(w / iw, h / ih) * zoom;
    const fw = w / (iw * s);
    const fh = h / (ih * s);
    gl.uniform4f(uFit, (1 - fw) * position[0], (1 - fh) * position[1], fw, fh);
    last = '';
  };

  const draw = () => {
    if (!visible || !ready) return;
    const r = host.getBoundingClientRect();
    // 1 while the photo enters from below, 0 when centred, -1 as it leaves at the top.
    const scroll = gsap.utils.clamp(-1, 1, (r.top + r.height / 2 - innerHeight / 2) / innerHeight);
    const ox = (pointer.x * pointerPx) / size[0];
    const oy = (pointer.y * pointerPx * 0.6 + scroll * scrollPx) / size[1];
    const k = ((1 - scroll) / 2) * dolly;
    const key = `${ox.toFixed(5)},${oy.toFixed(5)},${k.toFixed(5)}`;
    if (key === last) return;
    last = key;
    gl.uniform2f(uOffset, ox, oy);
    gl.uniform1f(uDolly, k);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  };

  const load = async () => {
    if (!img.complete || !img.naturalWidth) await img.decode().catch(() => {});
    const depthImg = new Image();
    depthImg.src = depth;
    await depthImg.decode();
    texture(gl, 0, img);
    texture(gl, 1, depthImg);
    host.append(canvas);
    resize();
    ready = true;
    draw();
    gsap.fromTo(canvas, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.8, ease: 'power1.out' });
  };

  // Lazy: textures upload only when the photo first comes near the viewport.
  new IntersectionObserver(
    ([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !ready && !canvas.dataset.loading) {
        canvas.dataset.loading = '1';
        load();
      }
    },
    { rootMargin: '50% 0px' },
  ).observe(host);

  window.addEventListener('pointermove', (e) => {
    if (!visible) return;
    toX((e.clientX / innerWidth) * 2 - 1);
    toY((e.clientY / innerHeight) * 2 - 1);
  });
  window.addEventListener('resize', () => ready && resize());
  gsap.ticker.add(draw);
}

function texture(gl, unit, source) {
  const tex = gl.createTexture();
  gl.activeTexture(gl.TEXTURE0 + unit);
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, source);
}

function link(gl, vs, fs) {
  const program = gl.createProgram();
  [
    [gl.VERTEX_SHADER, vs],
    [gl.FRAGMENT_SHADER, fs],
  ].forEach(([type, src]) => {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, src);
    gl.compileShader(shader);
    gl.attachShader(program, shader);
  });
  gl.linkProgram(program);
  return program;
}
