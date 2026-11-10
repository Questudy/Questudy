const paths = {
  book: '<path d="M12 6C8 3 4 4 2 5v14c3-1 7-1 10 2 3-3 7-3 10-2V5c-2-1-6-2-10 1Zm0 0v15M5 8l4 1M15 9l4-1"/>',
  files: '<path d="M8 3h9l4 4v14H8zM17 3v5h4M4 7H2v14h2M11 12h7M11 16h5"/>',
  map: '<path d="m3 5 6-2 6 2 6-2v16l-6 2-6-2-6 2Zm6-2v16M15 5v16"/><path d="m6 10 .5.5M18 13l.5.5"/>',
  atlas: '<path d="m3 5 9-3 9 3v16l-9-3-9 3Zm9-3v16" fill="#fffdf1" stroke="#6e6950"/><circle cx="7.5" cy="9" r="2" fill="#458d71" stroke="none"/><circle cx="16.5" cy="10.5" r="2" fill="#df8061" stroke="none"/>',
  chevron: '<path d="m9 5 7 7-7 7"/>',
  heart: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/>',
  bag: '<path d="M5 8h14l2 13H3ZM8 9V6a4 4 0 0 1 8 0v3M9 14h6"/>',
  plus: '<path d="M12 5v14M5 12h14"/>', minus: '<path d="M5 12h14"/>',
  expand: '<path d="M9 3H3v6m0-6 7 7M15 21h6v-6m0 6-7-7M15 3h6v6M3 15v6h6"/>',
  target: '<circle cx="12" cy="12" r="7"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4"/><circle cx="12" cy="12" r="2"/>',
  compass: '<circle cx="12" cy="12" r="9"/><path d="m16 8-3 5-5 3 3-5Z"/>',
  hand: '<path d="M8 13V6a2 2 0 0 1 4 0v6-8a2 2 0 0 1 4 0v8-5a2 2 0 0 1 4 0v8c0 5-3 7-7 7-3 0-5-2-7-5l-3-4a2 2 0 0 1 3-2l2 2Z"/>',
  panel: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M15 4v16M7 8h4M7 12h4"/>',
  help: '<circle cx="12" cy="12" r="9"/><path d="M9 9a3 3 0 1 1 4 3c-1 .5-1 1-1 2M12 17h.01"/>',
  leaf: '<path d="M20 3C5 1 1 9 6 16s17 0 14-13ZM5 21 16 9"/>',
  close: '<path d="m6 6 12 12M18 6 6 18"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  arrow: '<path d="M4 12h16m-6-6 6 6-6 6"/>',
  flag: '<path d="M5 22V3m0 0c5-5 9 5 15 0v11c-6 5-10-5-15 0"/>',
  lock: '<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V6a4 4 0 0 1 8 0v4M12 14v3"/>',
};
export const icon = (name: string, cls = '') => `<svg class="icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name as keyof typeof paths] || paths.compass}</svg>`;
export function hydrateIcons(root: ParentNode = document) { root.querySelectorAll<HTMLElement>('[data-icon]').forEach(el => { el.innerHTML = icon(el.dataset.icon || 'compass'); }); }
