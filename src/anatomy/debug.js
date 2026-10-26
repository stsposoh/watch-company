import { VIDEO } from './config.js';

// ?debug: video time and frame, scroll progress, station windows in both scroll and video time.
// Hovering the stage shows video-frame coordinates; click logs them for the config.
export function initDebug(state, frame) {
  const { plan, stations } = state;
  const panel = document.createElement('div');
  panel.className = 'debug';
  panel.innerHTML = `<pre></pre>
    <div>scroll, vh</div><div class="debug__bar" data-bar="scroll"></div>
    <div style="margin-top:8px">video, s</div><div class="debug__bar" data-bar="time"></div>`;
  document.body.append(panel);

  const out = panel.querySelector('pre');
  const bars = {
    scroll: { el: panel.querySelector('[data-bar="scroll"]'), max: plan.totalVh },
    time: { el: panel.querySelector('[data-bar="time"]'), max: state.duration },
  };

  Object.entries(bars).forEach(([key, bar]) => {
    bar.spans = stations.map((st) => {
      const span = document.createElement('span');
      const [a, b] = key === 'scroll' ? [st.start, st.end] : st.hold;
      span.style.left = `${(a / bar.max) * 100}%`;
      span.style.width = `${Math.max(0.3, ((b - a) / bar.max) * 100)}%`;
      span.title = st.id;
      bar.el.append(span);
      return span;
    });
    bar.head = document.createElement('b');
    bar.el.append(bar.head);
  });

  const cross = document.createElement('div');
  cross.className = 'debug__cross';
  cross.hidden = true;
  document.body.append(cross);

  const toFrame = (e) => {
    const r = frame.getBoundingClientRect();
    return [
      Math.round(((e.clientX - r.left) / r.width) * VIDEO.width),
      Math.round(((e.clientY - r.top) / r.height) * VIDEO.height),
    ];
  };

  window.addEventListener('pointermove', (e) => {
    const [x, y] = toFrame(e);
    cross.hidden = false;
    cross.style.left = `${e.clientX}px`;
    cross.style.top = `${e.clientY}px`;
    cross.textContent = `${x}, ${y}`;
  });

  window.addEventListener('click', (e) => {
    console.log('[debug] frame px', toFrame(e).join(', '), '@', state.time.toFixed(3), 's');
  });

  const pad = (v, n = 7) => String(v).padStart(n);

  return {
    update() {
      const { st, u, between } = state.current;
      const where = between
        ? `transition ${between.from.id} → ${between.to.id}  v=${between.v.toFixed(2)}`
        : `hold ${st.id}  u=${u.toFixed(2)}`;
      out.textContent = [
        `time   ${pad(state.time.toFixed(3))} s   target ${state.targetTime.toFixed(3)} s`,
        `frame  ${pad(Math.round(state.time * VIDEO.fps))}     of ${Math.round(state.duration * VIDEO.fps)}   ${state.ready ? 'scrubbing' : 'loading'}`,
        `scroll ${pad((state.progressVh / plan.totalVh).toFixed(4))}     ${state.progressVh.toFixed(1)} / ${plan.totalVh} vh`,
        `at     ${where}`,
        `frame  scale ${state.view.s.toFixed(3)}  hold ${state.holdScale.toFixed(3)}  fit ${state.fit.toFixed(2)}`,
      ].join('\n');

      bars.time.max = state.duration;
      bars.scroll.head.style.left = `${(state.progressVh / plan.totalVh) * 100}%`;
      bars.time.head.style.left = `${(state.time / state.duration) * 100}%`;
      Object.values(bars).forEach((bar) => {
        bar.spans.forEach((span, i) => span.classList.toggle('is-active', !between && stations[i] === st));
      });
    },
  };
}
