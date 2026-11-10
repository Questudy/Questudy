export const defs = `
<filter id="paper-wobble"><feTurbulence baseFrequency=".035" numOctaves="3" result="noise" seed="12"/><feDisplacementMap in="SourceGraphic" in2="noise" scale="1.8"/></filter>
<filter id="fog-soft"><feGaussianBlur stdDeviation="16"/></filter>
<filter id="island-shadow" x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="0" dy="9" stdDeviation="0" flood-color="#c0c4aa" flood-opacity=".35"/></filter>
<pattern id="water" width="150" height="100" patternUnits="userSpaceOnUse"><path d="M20 60q8-8 16 0t16 0t16 0" stroke="#b4cec0" stroke-width="1.5" fill="none" opacity=".65"/></pattern>
<symbol id="tree" viewBox="0 0 50 70"><ellipse cx="25" cy="63" rx="17" ry="5" fill="#809f7b" opacity=".23"/><path d="M23 42h5v20h-5" fill="#a08762"/><path d="m25 4 17 30h-8l12 17H5l12-17H9Z" fill="#62aa88" stroke="#407e67" stroke-width="1.4"/><path d="m25 4 0 47H5l12-17H9Z" fill="#7dbb94"/><path d="M25 9v38" stroke="#46886d" stroke-width="1"/></symbol>
<symbol id="round-tree" viewBox="0 0 60 76"><ellipse cx="30" cy="68" rx="19" ry="5" fill="#809f7b" opacity=".25"/><path d="M27 29h5v39h-5" fill="#a88961"/><path d="m12 17 15-9 20 8 6 24-18 13-24-9Z" fill="#7cbd8c" stroke="#5b9d79" stroke-width="1.5"/><path d="m25 10 1 40 9 3 18-13-6-24-12-5Z" fill="#63aa83"/><circle cx="20" cy="28" r="3" fill="#f5da88"/><circle cx="41" cy="34" r="3" fill="#ef9da0"/></symbol>
<symbol id="books" viewBox="0 0 65 40"><path d="M6 12h43v8H6z" fill="#f0c65e" stroke="#99794c"/><path d="M13 21h43v8H13z" fill="#79b9b6" stroke="#668b81"/><path d="M6 30h43v6H6z" fill="#e78d70" stroke="#a66d57"/><path d="M9 15h37M16 24h36M9 33h37" stroke="#fff9db" stroke-width="2"/></symbol>
<symbol id="flower" viewBox="0 0 35 55"><path d="M18 20v30M18 36 9 30" stroke="#75a375" stroke-width="2"/><path d="M18 10c-10-13-15 5-6 7-13 5 1 16 6 7 4 11 18-1 7-7 10-6-5-17-7-7Z" fill="#e7a7b7"/><circle cx="18" cy="17" r="4" fill="#f7d973"/></symbol>
<symbol id="star" viewBox="0 0 45 45"><path d="m23 2 6 13 15 2-11 11 3 15-13-8-14 8 3-15L1 17l16-2Z" fill="#f5dc7b" stroke="#c0a764" stroke-width="1.2"/></symbol>
<symbol id="rock" viewBox="0 0 55 40"><path d="m5 30 6-17 11 2 8-10 16 10 6 19Z" fill="#d0c7b1" stroke="#aba28c"/><path d="m11 13 12 15 7-23 7 22 15 7" stroke="#b4ab95" fill="none"/></symbol>
<radialGradient id="castle-ground-shadow"><stop offset="0" stop-color="#776b48" stop-opacity=".28"/><stop offset="1" stop-color="#776b48" stop-opacity="0"/></radialGradient>
<symbol id="castle-shape" viewBox="0 0 100 94">
  <ellipse cx="50" cy="85" rx="47" ry="9" fill="url(#castle-ground-shadow)"/>
  <g stroke="var(--castle-line, #948052)" stroke-width=".9" stroke-linejoin="round">
    <!-- The reference has two roofed side towers and a flat crenellated keep. -->
    <path d="M6 76 49 65 94 76 50 89Z" fill="var(--castle-base-top, #fff0b4)"/>
    <path d="m6 76 44 13 44-13v5L50 94 6 81Z" fill="var(--castle-base-side, #d8b34f)"/>
    <path d="m50 89 44-13v5L50 94Z" fill="var(--castle-base-dark, #cda449)"/>
    <path d="M49 33V3" fill="none" stroke="var(--castle-pole, #796d48)" stroke-width="1.2"/>
    <path d="m49 3 25 6-25 6Z" fill="var(--castle-flag, #e96e61)" stroke="var(--castle-roof-line, #986554)" stroke-width=".8"/>
    <path d="m52 5 6 2-6 2Z" fill="#fff5cf" stroke="none"/>
    <path d="M28 34h7v6h7v-6h8v6h7v-6h8v6h7v-6h3v43H28Z" fill="var(--castle-wall, #f8df93)"/>
    <path d="M32 43h38v34H32Z" fill="var(--castle-front, #ffedb1)" stroke="none"/>
    <path d="M69 43h6v34h-6Z" fill="var(--castle-wall-shade, #dcb66b)" stroke="none"/>
    <path d="M28 42h47M35 34v6m7-6v6m8-6v6m7-6v6m8-6v6" fill="none"/>
    <path d="M32 44v30" fill="none" stroke="var(--castle-highlight, #fff7cf)" stroke-width="1.5"/>
    <path d="M11 45h19v31l-19-2Z" fill="var(--castle-tower, #ffecac)"/>
    <path d="M24 45h6v31l-6-1Z" fill="var(--castle-tower-shade, #e9ca7a)" stroke="none"/>
    <path d="M71 45h18v29l-18 2Z" fill="var(--castle-tower, #ffecac)"/>
    <path d="M83 45h6v29l-6 .7Z" fill="var(--castle-tower-shade, #e9ca7a)" stroke="none"/>
    <path d="m7 46 13-25 14 25Z" fill="var(--castle-roof, #e88a81)" stroke="var(--castle-roof-line, #986554)"/>
    <path d="m20 21 1 25h13Z" fill="var(--castle-roof-shade, #ce6b67)" stroke="var(--castle-roof-line, #986554)" stroke-width=".7"/>
    <path d="m66 46 14-25 13 25Z" fill="var(--castle-roof, #e88a81)" stroke="var(--castle-roof-line, #986554)"/>
    <path d="m80 21 1 25h12Z" fill="var(--castle-roof-shade, #ce6b67)" stroke="var(--castle-roof-line, #986554)" stroke-width=".7"/>
    <path d="M15.5 60v-5a2 2 0 0 1 4 0v5ZM77 60v-5a2 2 0 0 1 4 0v5Z" fill="var(--castle-window, #a38448)" stroke="none"/>
    <path d="M41 77V64a9 9 0 0 1 18 0v13Z" fill="var(--castle-door-frame, #b49351)" stroke="var(--castle-door-line, #8d713e)"/>
    <path d="M44 77V64a6 6 0 0 1 12 0v13Z" fill="var(--castle-door, #886635)" stroke="var(--castle-door-line, #8d713e)" stroke-width=".6"/>
    <path d="M50 58v19" fill="none" stroke="var(--castle-door-line, #6f542f)" stroke-width=".8"/>
    <path d="M10 77 50 88l40-11" fill="none" stroke="var(--castle-highlight, #fff8d8)" stroke-width="1.3"/>
  </g>
</symbol>
<symbol id="castle" viewBox="0 0 100 94"><use href="#castle-shape" width="100" height="94"/></symbol>
<symbol id="green-castle" viewBox="0 0 100 94"><use href="#castle-shape" width="100" height="94" style="--castle-line:#60876d;--castle-base-top:#b4e3bb;--castle-base-side:#76b68d;--castle-base-dark:#5a9e78;--castle-pole:#52715a;--castle-flag:#3b7755;--castle-roof-line:#54816d;--castle-wall:#a0d6b2;--castle-front:#b9e4c3;--castle-wall-shade:#75b894;--castle-highlight:#e5f4d5;--castle-tower:#c0e7ca;--castle-tower-shade:#92cba5;--castle-roof:#79bba3;--castle-roof-shade:#59a188;--castle-window:#5e8e72;--castle-door-frame:#7ba88a;--castle-door-line:#54785c;--castle-door:#617d5c"/></symbol>
<symbol id="gate" viewBox="0 0 100 94"><ellipse cx="50" cy="85" rx="30" ry="6" fill="#897f5b" opacity=".16"/><path d="M47 15h7v68h-7" fill="#aa8c5e" stroke="#816e4c"/><path d="m22 22 50 0 10 9-10 9H22Z" fill="#9cd5bb" stroke="#719e83"/><path d="M29 44h49v16H29l-10-8Z" fill="#f6df88" stroke="#baa464"/><path d="M23 64h48l10 8-10 8H23Z" fill="#d0b6de" stroke="#aa8ab7"/><path d="M42 28h19M40 50h20M40 71h18" stroke="#7f805f" stroke-width="2" stroke-dasharray="2 5"/><circle cx="50" cy="14" r="4" fill="#fff4cb" stroke="#8d9270"/></symbol>
<symbol id="tent" viewBox="0 0 120 100"><ellipse cx="60" cy="87" rx="49" ry="9" fill="#c3a65d" opacity=".25"/><path d="m11 80 45-15 51 15-47 13Z" fill="#e5b85a" stroke="#a88b53"/><path d="m56 25 34 52-65 0Z" fill="#f6e197" stroke="#9c8251" stroke-width="1.5"/><path d="m56 25 6 52H25Z" fill="#fff8d2"/><path d="m56 25 6 52h28Z" fill="#94b896"/><path d="m56 46-12 31h23Z" fill="#786a4d"/><path d="M56 26V5m0 0 25 7-25 9Z" fill="#e99d73" stroke="#967751"/><path d="m14 81 45 7 48-8M60 89v4" fill="none" stroke="#fff8dd" stroke-width="3"/></symbol>
<symbol id="cloud" viewBox="0 0 240 150"><path d="M35 128C-3 123-9 77 22 64c-3-35 35-55 62-34 20-32 66-27 79 6 32-12 65 14 58 43 28 23 13 59-17 59H42Z" fill="#c8d7df" stroke="#b5c8d3" stroke-width="1.5"/><path d="M34 119C1 115-5 75 25 61c-1-31 35-48 60-29 20-29 61-24 75 6 29-12 62 13 56 40 25 20 12 51-15 51H42Z" fill="#edf3f6" stroke="#ccdbe4" stroke-width="1.5"/><path d="M33 110C5 105 0 71 28 58c-1-29 33-45 57-27 19-28 59-23 72 5 27-11 59 12 53 38 24 18 12 47-14 47H40Z" fill="#fffefd" stroke="#d8e1e6" stroke-width="1.2"/><path d="M57 101q24 9 50-1m39 5q24 9 40-3" fill="none" stroke="#cadbe4" stroke-width="1" stroke-dasharray="3 5"/></symbol>
<mask id="fog-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="2400" height="1800"><rect id="fog-base" width="2400" height="1800" fill="white"/><g id="fog-holes" fill="black" filter="url(#fog-soft)"></g></mask>`;

const islandPath = 'M175 105 C155 75 225 42 298 73 C370 34 439 64 477 111 C536 68 643 98 663 160 C740 134 849 178 855 253 C914 296 892 362 852 396 C911 456 899 537 849 562 C905 641 871 766 815 815 C749 871 644 835 615 810 C556 849 452 843 425 781 C345 822 279 786 269 719 C198 735 157 667 187 603 C145 547 172 484 216 460 C151 404 174 348 203 318 C141 276 121 207 175 175 C147 148 154 125 175 105Z';
export function renderLandscape(map) {
  let land = '<rect width="2400" height="1800" fill="#edf0df"/><rect width="2400" height="1800" fill="url(#water)"/>';
  map.areas.forEach(a => {
    land += `<g transform="translate(1200 900) scale(${a.dx} ${a.dy})"><path d="${islandPath}" fill="none" stroke="#faf9ec" stroke-width="45"/><path d="${islandPath}" fill="${a.light}" stroke="${a.dark}" stroke-width="5" filter="url(#island-shadow)"/><path d="${islandPath}" fill="none" stroke="${a.color}" stroke-width="17" opacity=".6"/></g>`;
  });
  land += '<ellipse cx="1200" cy="919" rx="176" ry="142" fill="#baae7c" opacity=".25"/><ellipse cx="1200" cy="900" rx="176" ry="142" fill="#f6e0a0" stroke="#c5a45f" stroke-width="5"/><ellipse cx="1200" cy="889" rx="164" ry="133" fill="#fff4ce"/><ellipse cx="1200" cy="889" rx="145" ry="115" fill="none" stroke="#ddbc73" stroke-width="1.5" stroke-dasharray="6 6"/>';
  return land;
}
export function renderPaths(map, mini = false) {
  return map.edges.map(edge => {
    const from = map.nodes.find(n => n.id === edge.from), to = map.nodes.find(n => n.id === edge.to);
    const area = map.areas.find(a => a.id === to.areaId);
    const done = map.session.completed.includes(from.id) && from.id !== 'start';
    const visible = map.session.discovered.includes(to.id);
    if (!visible && !mini) return '';
    if (!visible) return '';
    const bend = (from.x + to.x) / 2;
    const d = `M${from.x} ${from.y} C${bend} ${from.y},${bend} ${to.y},${to.x} ${to.y}`;
    if (mini) return `<path d="${d}" stroke="${done ? '#78b794' : '#d0b77d'}" stroke-width="9" fill="none"/>`;
    return `<g><path d="${d}" fill="none" stroke="${done ? '#7dab85' : area.dark}" stroke-width="18" opacity=".55"/><path d="${d}" fill="none" stroke="${done ? '#a5d6ac' : '#ead7a1'}" stroke-width="13"/><path d="${d}" fill="none" stroke="#fff9df" stroke-width="2" stroke-dasharray="5 7"/></g>`;
  }).join('');
}
export function renderDecorations(map) {
  let result = '';
  const places = [[310,170,'tree'],[420,320,'books'],[260,390,'round-tree'],[565,245,'flower'],[700,350,'tree'],[490,520,'rock'],[670,680,'books'],[320,560,'tree'],[810,640,'star'],[580,710,'round-tree'],[290,290,'flower'],[800,250,'tree'],[800,780,'star']];
  map.areas.forEach(a => {
    places.forEach(([x,y,kind]) => {
      const wx = 1200 + a.dx*x, wy = 900 + a.dy*y;
      result += `<use href="#${kind}" x="${wx-22}" y="${wy-45}" width="44" height="58"/>`;
    });
    result += `<g transform="translate(${a.label[0]} ${a.label[1]})"><rect x="-148" y="-17" width="296" height="34" rx="5" fill="${a.light}" stroke="${a.dark}" stroke-width="1"/><text text-anchor="middle" y="5" font-size="15" font-weight="750" fill="${a.dark}">${a.name}</text></g>`;
  });
  return result + '<use href="#books" x="1055" y="965" width="40" height="30"/><use href="#tree" x="1295" y="936" width="42" height="58"/><use href="#flower" x="1285" y="795" width="29" height="43"/><g transform="translate(1370 640)"><path d="m-18 12 36 0-9 9h-18Z" fill="#e5bc64" stroke="#aa9665"/><path d="M0 7V-23l-13 30Zm4 0V-18l12 25Z" fill="#fff9e4" stroke="#aa9665"/></g><g transform="translate(963 1146)"><path d="M-14 0q14-13 28 0-14 13-28 0m28 0 10-8v16Z" fill="#e7a083" stroke="#c48270"/></g>';
}
export function renderClouds() {
  // Seeded scatter keeps the same cloudscape as exploration reveals the map.
  let seed = 7619;
  const random = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  const clouds = [];
  for (let attempt = 0; clouds.length < 280 && attempt < 6000; attempt++) {
    const x = -180 + random() * 2760;
    const y = -140 + random() * 2080;
    // A minimum distance avoids random clumps without introducing rows.
    if (clouds.some(cloud => (cloud.x-x)**2 + (cloud.y-y)**2 < 115**2)) continue;
    clouds.push({ x, y, width: 260 + random()*125, height: 165 + random()*85,
      angle: random()*24-12, flip: random()<.5 ? -1 : 1 });
  }
  clouds.sort((a,b) => a.y-b.y);
  // Wrap edge puffs into neighboring tiles so the cloudscape continues past
  // the map bounds without a visible seam at any viewport aspect ratio.
  const puffs = clouds.flatMap(cloud => [-2760, 0, 2760].flatMap(dx => [-2080, 0, 2080].map(dy => {
    const x = cloud.x + dx, y = cloud.y + dy;
    if (x < -430 || x > 2830 || y < -390 || y > 2190) return '';
    return `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${cloud.angle.toFixed(1)}) scale(${cloud.flip} 1)"><use href="#cloud" x="${(-cloud.width/2).toFixed(1)}" y="${(-cloud.height/2).toFixed(1)}" width="${cloud.width.toFixed(1)}" height="${cloud.height.toFixed(1)}"/></g>`;
  }))).join('');
  // The underlay also conceals undiscovered terrain between cloud puffs.
  return `<defs><pattern id="fog-pattern" x="-180" y="-140" width="2760" height="2080" patternUnits="userSpaceOnUse" viewBox="-180 -140 2760 2080"><rect x="-180" y="-140" width="2760" height="2080" fill="#f1f5f3"/>${puffs}</pattern></defs><rect id="fog-surface" width="2400" height="1800" fill="url(#fog-pattern)" mask="url(#fog-mask)"/>`;
}
// Each stroke travels up the left side, across the top, then down the right:
// clockwise in SVG's downward-positive coordinate system.
export const selectionRing = '<g class="pencil-ring" aria-hidden="true" fill="none" stroke="#dc5c4e" stroke-linecap="round" filter="url(#paper-wobble)"><path pathLength="1" d="M-45 5C-51-39-20-64 18-57 54-50 61-17 48 13 35 46-11 51-36 30-47 20-49 10-47-2" stroke-width="2.6"/><path pathLength="1" d="M-40 25C-68-14-32-66 12-61 54-59 66-11 46 20 30 43-11 51-37 30" stroke-width="1.2" opacity=".65"/><path pathLength="1" d="M-43-12C-37-47-7-61 22-54 50-46 59-12 45 15" stroke-width=".8" opacity=".75"/></g>';
