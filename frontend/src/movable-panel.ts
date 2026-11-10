export function makePanelMovable(panel: HTMLElement, handle: HTMLButtonElement, frame: HTMLElement) {
  let position: { x: number; y: number } | null = null;
  let drag: { id: number; x: number; y: number; origin: { x: number; y: number }; moved?: boolean } | null = null;
  function currentPosition() {
    const card = panel.getBoundingClientRect(), bounds = frame.getBoundingClientRect();
    return { x: card.left-bounds.left-frame.clientLeft, y: card.top-bounds.top-frame.clientTop };
  }
  function place(x: number, y: number) {
    const margin = 12;
    position = {
      x: Math.max(margin, Math.min(frame.clientWidth-panel.offsetWidth-margin, x)),
      y: Math.max(margin, Math.min(frame.clientHeight-panel.offsetHeight-margin, y)),
    };
    Object.assign(panel.style, { left: `${position.x}px`, top: `${position.y}px`, right: 'auto', bottom: 'auto' });
  }
  handle.addEventListener('pointerdown', event => {
    if (event.button !== 0 || drag) return;
    event.preventDefault();
    handle.focus({ preventScroll: true });
    drag = { id: event.pointerId, x: event.clientX, y: event.clientY, origin: currentPosition() };
    handle.setPointerCapture(event.pointerId);
    panel.classList.add('is-moving');
  });
  handle.addEventListener('pointermove', event => {
    if (!drag || event.pointerId !== drag.id) return;
    const dx = event.clientX-drag.x, dy = event.clientY-drag.y;
    if (Math.hypot(dx, dy) < 3 && !drag.moved) return;
    drag.moved = true;
    place(drag.origin.x+dx, drag.origin.y+dy);
  });
  function release(event: PointerEvent) {
    if (!drag || event.pointerId !== drag.id) return;
    drag = null;
    panel.classList.remove('is-moving');
    if (handle.hasPointerCapture(event.pointerId)) handle.releasePointerCapture(event.pointerId);
  }
  handle.addEventListener('pointerup', release);
  handle.addEventListener('pointercancel', release);
  handle.addEventListener('lostpointercapture', release);
  handle.addEventListener('keydown', event => {
    const directions: Record<string, [number, number]> = { ArrowLeft: [-1,0], ArrowRight: [1,0], ArrowUp: [0,-1], ArrowDown: [0,1] };
    const direction = directions[event.key];
    if (!direction || drag) return;
    event.preventDefault();
    const origin = currentPosition(), step = event.shiftKey ? 40 : 12;
    place(origin.x+direction[0]*step, origin.y+direction[1]*step);
  });
  // Keep a manually placed card reachable when the frame or card changes size.
  const observer = new ResizeObserver(() => { if (position) place(position.x, position.y); });
  observer.observe(frame);
  observer.observe(panel);
}
