export function createCamera(viewport, world, onChange) {
  const state = { x: 1200, y: 900, zoom: 1, width: 1, height: 1 };
  let pointer = null;
  let moved = false;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  function update() {
    state.zoom = clamp(state.zoom, .28, 1.65);
    const halfW = state.width / state.zoom / 2, halfH = state.height / state.zoom / 2;
    state.x = halfW >= 1200 ? 1200 : clamp(state.x, halfW - 90, 2400 - halfW + 90);
    state.y = halfH >= 900 ? 900 : clamp(state.y, halfH - 90, 1800 - halfH + 90);
    world.setAttribute('transform', `translate(${state.width/2-state.x*state.zoom} ${state.height/2-state.y*state.zoom}) scale(${state.zoom})`);
    onChange({ ...state });
  }
  const observer = new ResizeObserver(([entry]) => { state.width = entry.contentRect.width; state.height = entry.contentRect.height; update(); });
  observer.observe(viewport);
  viewport.addEventListener('pointerdown', e => {
    if (e.button !== 0) return;
    pointer = { id: e.pointerId, x: e.clientX, y: e.clientY, startX: e.clientX, startY: e.clientY };
    moved = false;
  });
  viewport.addEventListener('pointermove', e => {
    if (!pointer || e.pointerId !== pointer.id) return;
    const dx = e.clientX-pointer.x, dy = e.clientY-pointer.y;
    if (Math.hypot(e.clientX-pointer.startX, e.clientY-pointer.startY) > 5) {
      moved = true;
      viewport.setPointerCapture(e.pointerId);
      viewport.classList.add('is-dragging');
    }
    if (moved) { state.x -= dx/state.zoom; state.y -= dy/state.zoom; update(); }
    pointer.x = e.clientX; pointer.y = e.clientY;
  });
  const release = () => { pointer = null; viewport.classList.remove('is-dragging'); };
  viewport.addEventListener('pointerup', release);
  viewport.addEventListener('pointercancel', release);
  viewport.addEventListener('lostpointercapture', release);
  // A drag that starts on a node must not become a selection on pointerup.
  viewport.addEventListener('click', e => { if (moved) { e.preventDefault(); e.stopImmediatePropagation(); moved = false; } }, true);
  function zoom(factor, point) {
    const next = clamp(state.zoom*factor,.28,1.65);
    if (point) {
      const rect = viewport.getBoundingClientRect();
      const dx = point.x-rect.left-state.width/2, dy = point.y-rect.top-state.height/2;
      state.x += dx/state.zoom-dx/next; state.y += dy/state.zoom-dy/next;
    }
    state.zoom = next; update();
  }
  viewport.addEventListener('wheel', e => { e.preventDefault(); zoom(Math.exp(-e.deltaY*.0014), {x:e.clientX,y:e.clientY}); }, {passive:false});
  viewport.addEventListener('keydown', e => {
    if (e.target !== viewport) return;
    const step = 85/state.zoom;
    if (e.key === 'ArrowLeft') state.x-=step;
    else if (e.key === 'ArrowRight') state.x+=step;
    else if (e.key === 'ArrowUp') state.y-=step;
    else if (e.key === 'ArrowDown') state.y+=step;
    else if (e.key === '+' || e.key === '=') zoom(1.2);
    else if (e.key === '-') zoom(1/1.2);
    else return;
    e.preventDefault(); update();
  });
  return { state, zoom, moveTo(x,y) { state.x=x; state.y=y; update(); }, fit() { state.zoom=Math.min(state.width/2460,state.height/1860); state.x=1200;state.y=900;update(); }, update };
}
