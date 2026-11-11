const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const activeAnimations = new Set<Animation>();
const ease = 'cubic-bezier(.16,1,.3,1)';

function animate(element: Element, frames: Keyframe[], duration = 360, delay = 0) {
  if (reducedMotion.matches) return;
  const animation = element.animate(frames, { duration, delay, easing: ease, fill: 'backwards' });
  activeAnimations.add(animation);
  animation.finished.then(() => activeAnimations.delete(animation), () => activeAnimations.delete(animation));
}

reducedMotion.addEventListener('change', () => {
  if (reducedMotion.matches) activeAnimations.forEach(animation => animation.cancel());
});

export function enterPage(root: HTMLElement) {
  if (document.body.dataset.page === 'home') return;
  const sections = root.querySelectorAll('.page-heading, .list-controls, .tabs, .create-grid > section, .service-panel, .service-link, .explore-grid > *, .battle-grid > *, .result-panel, .information-content');
  sections.forEach((element, index) => animate(element,
    [{ opacity: 0, translate: '0 12px' }, { opacity: 1, translate: '0 0' }], 420, Math.min(index * 45, 180)));
}

export function observeMotion(root: HTMLElement) {
  const seen = new WeakSet<Element>();
  const observer = new MutationObserver(records => {
    const entering: Element[] = [];
    for (const record of records) for (const node of record.addedNodes) {
      if (!(node instanceof HTMLElement)) continue;
      if (node.matches('.map-card, .feedback, .file-row, .result-stat')) entering.push(node);
      entering.push(...node.querySelectorAll('.map-card, .feedback, .file-row, .result-stat'));
      const meters = [...(node.matches('.meter > i') ? [node] : []), ...node.querySelectorAll<HTMLElement>('.meter > i')];
      meters.forEach(meter => animate(meter, [{ scale: '0 1' }, { scale: '1 1' }], 600));
    }
    entering.forEach((element, index) => {
      if (seen.has(element)) return;
      seen.add(element);
      animate(element, [{ opacity: 0, translate: '0 10px' }, { opacity: 1, translate: '0 0' }], 360, Math.min(index * 35, 140));
    });
  });
  observer.observe(root, { childList: true, subtree: true });
}
