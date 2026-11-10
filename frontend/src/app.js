import { icon, hydrateIcons } from './icons.js';
import { defs, renderLandscape, renderPaths, renderDecorations, renderClouds, selectionRing } from './artwork.js';
import { mapService } from './services/map-service.js';
import { createCamera } from './camera.js';
import { difficultyOptions, renderDifficultyCards } from './difficulty.js';
import { makePanelMovable } from './movable-panel.js';

const $ = selector => document.querySelector(selector);
const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const difficultyNames = { easy: '하', normal: '중', hard: '상' };
let map, selectedId = 'start', panelOpen = true, busy = false, availableCursor = -1, toastTimer;
let previousDiscovery = new Set();
const dialog = $('#dialog');
hydrateIcons();

const camera = createCamera($('#viewport'), $('#world'), state => {
  $('#zoom-label').textContent = `${Math.round(state.zoom*100)}%`;
  // Fit-to-map can expose space beyond the finite world. Extend only the fog
  // to cover that space, keeping nodes, discovery and camera scale unchanged.
  const x = Math.min(0, state.x-state.width/state.zoom/2);
  const y = Math.min(0, state.y-state.height/state.zoom/2);
  const bounds = { x, y,
    width: Math.max(2400, state.x+state.width/state.zoom/2)-x,
    height: Math.max(1800, state.y+state.height/state.zoom/2)-y };
  for (const element of [$('#fog-mask'), $('#fog-base'), $('#fog-surface')]) {
    if (element) for (const [key, value] of Object.entries(bounds)) element.setAttribute(key, value);
  }
  const view = $('#mini-view');
  if (view) {
    view.setAttribute('x', Math.max(0,state.x-state.width/state.zoom/2));
    view.setAttribute('y', Math.max(0,state.y-state.height/state.zoom/2));
    view.setAttribute('width', Math.min(2400,state.width/state.zoom));
    view.setAttribute('height', Math.min(1800,state.height/state.zoom));
  }
});

function toast(message) { clearTimeout(toastTimer); $('#toast').textContent = message; $('#toast').classList.add('visible'); toastTimer = setTimeout(() => $('#toast').classList.remove('visible'), 3600); }
function nodeById(id) { return map.nodes.find(n => n.id === id); }
function areaFor(node) { return map.areas.find(a => a.id === node.areaId); }
function getAvailable() { return map.nodes.filter(n => map.session.reachable.includes(n.id) && !map.session.completed.includes(n.id)); }
function focusPosition(x, y) {
  camera.state.zoom = Math.max(camera.state.zoom, innerWidth < 600 ? .58 : 1);
  camera.moveTo(x, y);
}
function focusNode(node) { focusPosition(node.x, node.y); }
function artFor(node) { return node.kind === 'start' ? 'tent' : node.kind === 'gate' ? 'gate' : map.session.completed.includes(node.id) ? 'green-castle' : 'castle'; }
function art(node, cls='') { return `<svg class="node-art ${cls}" viewBox="0 0 100 94" aria-hidden="true"><use href="#${artFor(node)}"/></svg>`; }

function renderNodes(animateSelection = false) {
  $('#nodes').innerHTML = map.nodes.filter(n => map.session.discovered.includes(n.id)).map(node => {
    const selected = node.id === selectedId, complete = map.session.completed.includes(node.id), area = areaFor(node);
    const description = node.kind === 'start' ? 'START' : node.kind === 'gate' ? `갈림길 ${node.section}` : `스테이지 ${map.areas.indexOf(area)+1}-${node.sequence}`;
    return `<g class="map-node ${selected?'selected':''} ${complete?'is-complete':''}" transform="translate(${node.x} ${node.y})" role="button" tabindex="0" data-node="${node.id}" aria-label="${escape(node.title)}${complete?' (완료)':' (도전 가능)'}" aria-pressed="${selected}">
      <ellipse class="node-hover" cx="0" cy="-5" rx="53" ry="50"/>
      ${selected?selectionRing:''}<use href="#${artFor(node)}" x="-45" y="-57" width="90" height="85"/>
      ${complete && node.kind!=='start'?'<g transform="translate(24 -39)"><circle r="10" fill="#458a68" stroke="#fffcf1" stroke-width="2"/><path d="m-4 0 3 3 5-6" fill="none" stroke="#fff" stroke-width="2"/></g>':''}
      <g class="node-label"><rect x="-66" y="32" width="132" height="39" rx="3" fill="${selected?'#fff0c5':'#fffdf0'}" stroke="${selected?'#d5ad5c':'#d1c8a9'}"/><text class="node-kicker" text-anchor="middle" y="45">${description}</text><text class="node-name" text-anchor="middle" y="60">${escape(node.title)}</text></g>
      ${selected?'<g transform="translate(0 -78)"><rect x="-35" y="-13" width="70" height="23" rx="11" fill="#fff9e8" stroke="#c1ae82"/><circle cx="-20" cy="-2" r="3" fill="#d85e4e"/><text x="7" y="2" text-anchor="middle" font-size="10" font-weight="700" fill="#8b6350">현재 선택</text></g>':''}
    </g>`;
  }).join('');
  if (animateSelection) $('#nodes .pencil-ring')?.classList.add('is-drawing');
}

function renderMinimap() {
  const islands = map.areas.map(a => `<ellipse cx="${1200+a.dx*520}" cy="${900+a.dy*460}" rx="415" ry="375" fill="${a.color}" opacity=".55"/>`).join('');
  const dots = map.nodes.filter(n => map.session.discovered.includes(n.id)).map(n => `<circle cx="${n.x}" cy="${n.y}" r="${n.kind==='start'?24:14}" fill="${n.id===selectedId?'#d76451':map.session.completed.includes(n.id)?'#4f8c63':'#e0bb58'}" stroke="#fff9eb" stroke-width="5"/>`).join('');
  $('#minimap').innerHTML = `<rect width="2400" height="1800" rx="70" fill="#edf0df"/>${islands}<ellipse cx="1200" cy="900" rx="160" ry="130" fill="#ffe9ab"/>${renderPaths(map,true)}${dots}<rect id="mini-view" fill="#fff9d4" fill-opacity=".15" stroke="#d96b59" stroke-width="13" rx="20" pointer-events="none"/>`;
  camera.update();
}

function renderPanel() {
  const node = nodeById(selectedId), area = areaFor(node);
  const complete = map.session.completed.includes(node.id), difficulty = map.session.difficulties[`${node.areaId}:${node.section}`];
  $('#node-panel').hidden = !panelOpen;
  $('#reopen-panel').hidden = panelOpen;
  const sectionCards = area ? [1,2,3].map(section => {
    const level = map.session.difficulties[`${area.id}:${section}`];
    return `<div class="section-card ${level?'chosen':''} ${section===node.section?'current-section':''}"><small>${section}구간</small><strong>${level?difficultyNames[level]:'?'}</strong></div>`;
  }).join('<span class="section-arrow">→</span>') : '';
  $('#node-panel').innerHTML = `<div class="panel-top"><span class="area-badge" style="--area-color:${area?.light||'#f7edcf'};--area-ink:${area?.dark||'#927745'}">${area?escape(area.name):'모험의 시작점'}</span><button id="close-panel" class="icon-button" aria-label="노드 설명 닫기" title="설명 닫기">${icon('close')}</button></div>
    <div class="panel-hero">${art(node)}<div><span class="panel-kicker">${node.kind==='start'?'START HERE':node.kind==='gate'?`갈림길 ${map.areas.indexOf(area)+1}-${node.section}`:`스테이지 ${map.areas.indexOf(area)+1}-${node.sequence}`}</span><h2>${escape(node.title)}</h2><span class="status-badge ${complete?'status-complete':''}">${node.kind==='start'?'여기서 출발해요':complete?'클리어 완료':'도전 가능'}</span></div></div>
    <p class="panel-description">${node.kind==='start'?'작은 배낭 하나와 호기심을 챙겼나요? 네 갈래 길 끝에 새로운 배움이 기다리고 있어요.':escape(node.description)}</p>
    ${node.kind==='start'?`<div class="panel-section-title">어디로 떠나 볼까요?</div><div class="area-list">${map.areas.map((a,i)=>`<button class="area-choice" data-area="${a.id}"><span class="area-number" style="background:${a.light};color:${a.dark}">0${i+1}</span><span><strong>${escape(a.name)}</strong><small>${escape(a.fileName)} · ${a.pages}쪽</small></span>${icon('arrow')}</button>`).join('')}</div><div class="note-box">${icon('compass')}<p>난이도 갈림길에서 시작하세요.<br/>노드를 클리어하면 새로운 길이 열려요.</p></div>`:
    `<div class="panel-section-title">이 영역의 구간별 난이도</div><div class="section-cards">${sectionCards}</div><p class="panel-fine">다음 갈림길에 도착하면 새로운 구간의 난이도를 고를 수 있어요.</p><div class="concept-box"><span>${node.kind==='gate'?'이번 구간에서 배울 내용':'출제 개념'}</span><p>${escape(node.kind==='gate'?area.documentTitle:node.concepts.join(' · '))}</p><small>${escape(area.fileName)}에서 준비한 학습 여정</small></div>${node.kind==='battle'?`<div class="monster-heading">기다리는 몬스터 <b>3마리</b> · 1마리 = 1문제</div><div class="monsters"><div><span class="monster monster-book">▣<i>⌣</i></span><small>개념 지킴이</small></div><div><span class="monster monster-star">✦<i>⌣</i></span><small>별빛 퀴즈</small></div><div><span class="monster monster-bunny">♧<i>⌣</i></span><small>호기심 토끼</small></div></div>`:''}`}
    <button id="node-action" class="button button-primary" ${busy||map.session.status!=='active'?'disabled':''}>${icon(node.kind==='start'?'compass':complete?'check':node.kind==='gate'?'flag':'arrow')}${node.kind==='start'?'첫 번째 길 찾아보기':complete?'현재 위치로 이동':node.kind==='gate'?'난이도 고르기':'전투 미리보기'}</button><div class="panel-bottom-note">${node.kind==='start'?'서두르지 않아도 괜찮아요. 나만의 속도로.':complete?'완료한 노드는 다시 전투하지 않고 지나갈 수 있어요.':difficulty?`현재 구간 난이도 · ${difficultyNames[difficulty]}`:'나에게 맞는 난이도로 모험을 시작해요.'}</div>`;
  $('#close-panel').onclick = () => { panelOpen=false; renderPanel(); };
  $('#node-action').onclick = handleNodeAction;
  document.querySelectorAll('[data-area]').forEach(button => button.onclick = () => selectNode(`${button.dataset.area}-0`,true));
}

function render({ animateSelection = false } = {}) {
  const activeArea = areaFor(nodeById(selectedId));
  const source = activeArea || map.areas[0];
  $('#source-file').innerHTML = `${escape(source.fileName)} <span>· ${source.pages}쪽</span>`;
  $('#map-title').textContent = activeArea ? `${activeArea.documentTitle} 탐험 지도` : `${source.documentTitle} 외 ${map.areas.length-1}개 자료`;
  $('#map-title').title = $('#map-title').textContent;
  $('#source-button').setAttribute('aria-label', `${$('#map-title').textContent}. 학습 자료 전체 보기`);
  $('#hp-value').innerHTML = `${map.player.hp} <span>/ ${map.player.maxHp}</span>`;
  $('#hp-fill').style.width = `${Math.max(0,Math.min(100,map.player.hp/map.player.maxHp*100))}%`;
  $('#recovery-count').textContent = `×${map.inventory.recovery}`;
  $('#pass-count').textContent = `×${map.inventory.pass}`;
  const {completed,total} = map.progress, percent = Math.round(completed/total*100);
  $('#progress-label').textContent = `${completed}/${total} 클리어`;
  $('#progress-percent').textContent = `${percent}%`;
  $('#progress-fill').style.width = `${percent}%`;
  $('#progress-caption').textContent = `남은 전투 ${total-completed}곳`;
  $('#fog-caption').textContent = map.session.discovered.length < map.nodes.length ? '안개 낀 곳 있음' : '모든 길 발견';
  $('#available-count').textContent = getAvailable().length;
  const current=nodeById(map.session.currentNodeId);
  $('#position-label').textContent = `${current.kind==='start'?'중앙':areaFor(current).name} · ${current.title}`;
  $('#paths').innerHTML = renderPaths(map);
  const animateFog = previousDiscovery.size > 0 && !matchMedia('(prefers-reduced-motion: reduce)').matches;
  $('#fog-holes').innerHTML = map.nodes.filter(n=>map.session.discovered.includes(n.id)).map(n=>{
    const radius = n.kind==='start'?258:158;
    return `<circle cx="${n.x}" cy="${n.y}" r="${radius}">${animateFog&&!previousDiscovery.has(n.id)?`<animate attributeName="r" from="25" to="${radius}" dur=".7s" fill="freeze"/>`:''}</circle>`;
  }).join('');
  previousDiscovery = new Set(map.session.discovered);
  renderNodes(animateSelection); renderPanel(); renderMinimap();
}

async function perform(action, message) {
  if (busy) return;
  busy=true;
  $('#node-action')?.setAttribute('disabled','');
  dialog.querySelectorAll('button[data-mutation]').forEach(button=>button.disabled=true);
  try { map=await action(); render(); if(message) toast(message); return true; }
  catch(error) { toast(error.message || '지도를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.'); return false; }
  finally { busy=false; if(map) renderPanel(); dialog.querySelectorAll('button[data-mutation]').forEach(button=>button.disabled=false); }
}

async function selectNode(id, focus=false) {
  if(busy) return;
  if(await perform(()=>mapService.moveTo(id))) {
    selectedId=id;panelOpen=true;render({ animateSelection: true });
    if(focus) focusNode(nodeById(id));
  }
}

function showDialog(title, content, cls='') {
  if(dialog.open) dialog.close();
  dialog.className=cls;
  dialog.innerHTML=`<button class="dialog-close icon-button" aria-label="창 닫기">${icon('close')}</button><div class="dialog-eyebrow">QUESTUDY · EXPLORATION</div><h2 id="dialog-title">${title}</h2>${content}`;
  dialog.querySelector('.dialog-close').onclick=()=>dialog.close();
  dialog.showModal();
}
dialog.addEventListener('click', e => { if(e.target===dialog) { const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom) dialog.close(); } });

function handleNodeAction() {
  const node=nodeById(selectedId);
  if(node.kind==='start') { findNext();return; }
  if(map.session.completed.includes(node.id)) { focusNode(node);return; }
  if(node.kind==='gate') {
    showDialog('이번 영역을 어떤 난이도로 탐험할까요?',`<svg class="difficulty-heading-art" viewBox="0 0 100 94" aria-hidden="true"><use href="#gate"/></svg><p class="difficulty-intro">고른 난이도로 이번 구간의 전투가 이어져요. 다음 갈림길에서 다시 고를 수 있어요.</p><fieldset class="difficulty-options"><legend class="visually-hidden">이번 구간 난이도 선택</legend>${renderDifficultyCards()}</fieldset><p class="difficulty-rule">문제의 사고 수준이 달라지며, 몬스터 수는 같아요.</p><div class="difficulty-actions"><button class="button button-paper" id="cancel-difficulty" data-mutation>← 탐험 지도로 돌아가기</button><p id="difficulty-summary" aria-live="polite">현재 선택한 난이도: <strong>중 · 비교 및 관계 이해</strong></p><button class="button button-primary" id="confirm-difficulty" data-mutation>선택한 난이도로 구간 시작하기 ${icon('arrow')}</button></div>`,'difficulty-dialog');
    dialog.querySelector('.dialog-eyebrow').textContent=`제${map.areas.indexOf(areaFor(node))+1}영역 · ${areaFor(node).name} · ${node.section}구간`;
    const options=dialog.querySelector('.difficulty-options');
    options.addEventListener('change',()=>{
      const selected=difficultyOptions.find(option=>option.id===options.querySelector(':checked').value);
      $('#difficulty-summary strong').textContent=`${selected.level} · ${selected.title}`;
    });
    $('#cancel-difficulty').onclick=()=>dialog.close();
    $('#confirm-difficulty').onclick=async()=>{
      if(busy) return;
      const value=options.querySelector(':checked').value;
      options.disabled=true;
      const success=await perform(()=>mapService.chooseDifficulty(node.id,value),'난이도를 골랐어요. 새로운 길이 열렸습니다!');
      options.disabled=false;
      if(success) dialog.close();
    };
  } else {
    showDialog('새로운 배움이 기다리고 있어요',`<div class="battle-preview">${art(node)}<div><span class="file-badge">${escape(areaFor(node).fileName)}</span><h3>${escape(node.title)}</h3><p>난이도 ${difficultyNames[map.session.difficulties[`${node.areaId}:${node.section}`]]} · 몬스터 3마리</p></div></div><div class="mock-notice"><strong>목 데이터 전투 미리보기</strong><p>실제 문제 풀이와 보상은 백엔드 연결 후 제공됩니다. 아래 버튼은 노드 완료 응답을 가정해 진행도와 구름 해제를 미리 확인합니다. HP와 아이템은 바뀌지 않아요.</p></div><button class="button button-primary" id="complete-battle" data-mutation>${icon('check')}목 전투 완료하고 길 열기</button>`);
    $('#complete-battle').onclick=async()=>{
      if(await perform(()=>mapService.completeBattle(node.id),'클리어! 구름 너머 새로운 길을 발견했어요.')) dialog.close();
    };
  }
}

function findNext() {
  const nodes=getAvailable();
  if(!nodes.length) {toast('모든 전투를 완료했어요. 멋진 탐험이었어요!');return;}
  availableCursor=(availableCursor+1)%nodes.length;
  selectNode(nodes[availableCursor].id,true);
}

function showMaterials() {
  showDialog('이번 모험을 만든 학습 자료',`<p class="dialog-intro">서로 다른 자료가 저마다의 섬이 되었어요.<br/>중앙 광장으로 돌아와 다른 영역을 탐험할 수 있어요.</p><div class="materials-list">${map.areas.map((a,i)=>`<div class="material-item"><span class="material-icon" style="background:${a.light};color:${a.dark}">${icon('files')}</span><div><small>자료 영역 0${i+1} · ${escape(a.name)}</small><h3>${escape(a.documentTitle)}</h3><p>${escape(a.fileName)} <span>· ${a.pages}쪽 · 전투 노드 10개</span></p></div><span class="sample-tag">샘플</span></div>`).join('')}</div><div class="mock-notice"><p>현재 파일명·페이지·지도 구성은 모두 목 데이터이며, 실제 업로드한 PDF가 아닙니다.</p></div>`,'materials-dialog');
}

$('#zoom-in').onclick=()=>camera.zoom(1.2);
$('#zoom-out').onclick=()=>camera.zoom(1/1.2);
$('#fit-map').onclick=()=>{camera.fit();toast('전체 지도를 펼쳤어요. 탐험한 곳은 계속 표시돼요.');};
$('#locate').onclick=()=>focusNode(nodeById(map.session.currentNodeId));
$('#find-node').onclick=findNext;
$('#reopen-panel').onclick=()=>{panelOpen=true;renderPanel();};
$('#source-button').onclick=showMaterials;
$('#nodes').addEventListener('click',e=>{const target=e.target.closest('[data-node]');if(target) selectNode(target.dataset.node);});
$('#nodes').addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){const target=e.target.closest('[data-node]');if(target){e.preventDefault();selectNode(target.dataset.node);}}});
$('#help-button').onclick=()=>showDialog('지도와 친해지는 시간',`<p class="dialog-intro">조금씩 구름을 걷으며 나만의 길을 찾아보세요.</p><div class="help-steps">${[['hand','지도를 자유롭게 움직여요','지도를 누른 채 드래그하세요. 휠이나 + / − 버튼으로 확대하고 축소할 수 있어요.'],['map','작은 지도에서 멀리 떠나요','전체 지도 안쪽을 클릭하거나 드래그하면 그 위치로 화면이 움직여요. 제목 부분을 잡고 드래그하면 전체 지도 박스 자체를 옮길 수 있어요.'],['flag','갈림길에서 난이도를 골라요','중앙 광장에서 자료 영역을 골라 출발해요. 각 갈림길에서 다음 구간의 난이도를 선택하세요.'],['compass','도전하면 새로운 길이 열려요','빨간 색연필 동그라미는 선택한 노드예요. 노드를 완료하면 인접한 길이 나타나고 주변 구름이 걷혀요.'],['target','길을 잃어도 괜찮아요','현재 위치 버튼으로 돌아오거나, 갈 수 있는 곳 찾기로 다음 도전 장소를 찾아보세요. 방향키로도 지도를 옮길 수 있어요.']].map(([name,title,description],i)=>`<div class="help-step"><span>${icon(name)}</span><div><small>0${i+1}</small><h3>${title}</h3><p>${description}</p></div></div>`).join('')}</div>`,'help-dialog');
$('#inventory-button').onclick=()=>showDialog('탐험가의 작은 배낭',`<p class="dialog-intro">이 지도에서 함께할 아이템이에요.</p><div class="inventory-items"><div><span>♡</span><h3>회복 아이템</h3><b>${map.inventory.recovery}개</b><p>전투 중 HP를 회복해요.</p></div><div><span>↗</span><h3>PASS</h3><b>${map.inventory.pass}개</b><p>문제 하나를 건너뛸 수 있어요.</p></div></div><div class="mock-notice"><p>현재 수량은 목 데이터입니다. 실제 아이템 사용과 소모 처리는 전투 API 연결 후 제공됩니다.</p></div>`);
$('#leave-button').onclick=()=>{
  showDialog('잠시 쉬어 갈까요?',`<p class="dialog-intro">실제 저장 API는 아직 연결되지 않았어요. 이 브라우저에서 잠시 쉬었다가 돌아올 수 있지만, 새로고침하거나 창을 닫으면 현재 진행은 사라져요.</p><div class="dialog-actions"><button class="button button-paper" id="keep-exploring">계속 탐험하기</button><button class="button button-primary" id="confirm-leave">잠시 쉬어 가기</button></div>`);
  $('#keep-exploring').onclick=()=>dialog.close();
  $('#confirm-leave').onclick=()=>showPause('잠깐의 쉼, 다음 모험을 위해','오늘도 새로운 배움에 한 걸음 가까워졌어요.');
};
$('#end-button').onclick=()=>{
  showDialog('이번 탐험을 마칠까요?',`<p class="dialog-intro">현재까지 ${map.progress.total}개 전투 중 <strong>${map.progress.completed}개</strong>를 완료했어요.<br/>목 데이터 미리보기이므로 실제 아카이브는 생성되지 않아요.</p><div class="dialog-actions"><button class="button button-paper" id="continue-exploring">더 탐험하기</button><button class="button button-end" id="confirm-end" data-mutation>미리보기 종료</button></div>`);
  $('#continue-exploring').onclick=()=>dialog.close();
  $('#confirm-end').onclick=async()=>{if(await perform(()=>mapService.endPreview())) showPause('작은 배움이 모인 오늘의 모험',`전투 노드 ${map.progress.completed} / ${map.progress.total}개 클리어 · ${Math.round(map.progress.completed/map.progress.total*100)}% 탐험`);};
};
function showPause(title, description) {
  showDialog(title,`<div class="pause-illustration">${art(nodeById('start'))}</div><p class="dialog-intro">${description}</p><p class="dialog-fine">이 미리보기의 진행은 저장되지 않습니다.</p><div class="dialog-actions"><button class="button button-primary" id="restart-preview">처음부터 다시 둘러보기</button></div>`);
  $('#restart-preview').onclick=()=>location.reload();
  if(map.session.status==='active') {
    const continueButton=document.createElement('button'); continueButton.className='button button-paper';continueButton.textContent='지도로 돌아가기';continueButton.onclick=()=>dialog.close();dialog.querySelector('.dialog-actions').prepend(continueButton);
  }
}

// The minimap uses pointer capture: click, long press and continuous drag share
// one coordinate conversion and work for both mouse and touch input.
makePanelMovable($('.minimap-card'), $('.minimap-heading'), $('.map-frame'));
let miniPointer=null;
function moveFromMini(e) {
  const mini=$('#minimap');
  const point=new DOMPoint(e.clientX,e.clientY).matrixTransform(mini.getScreenCTM().inverse());
  const bounds=mini.viewBox.baseVal;
  const x=Math.max(bounds.x,Math.min(bounds.x+bounds.width,point.x));
  const y=Math.max(bounds.y,Math.min(bounds.y+bounds.height,point.y));
  // Zoom in from the overview before panning; otherwise a fully visible axis
  // stays locked at the center and clicks along that axis appear to do nothing.
  focusPosition(x,y);
}
$('#minimap').addEventListener('pointerdown',e=>{if(e.button!==0)return;e.preventDefault();miniPointer=e.pointerId;$('#minimap').setPointerCapture(e.pointerId);moveFromMini(e);});
$('#minimap').addEventListener('pointermove',e=>{if(e.pointerId===miniPointer)moveFromMini(e);});
const releaseMini=()=>{miniPointer=null;};
$('#minimap').addEventListener('pointerup',releaseMini);
$('#minimap').addEventListener('pointercancel',releaseMini);
$('#minimap').addEventListener('lostpointercapture',releaseMini);
$('#minimap').addEventListener('keydown',e=>{const d=130/camera.state.zoom;if(e.key==='ArrowLeft')camera.moveTo(camera.state.x-d,camera.state.y);else if(e.key==='ArrowRight')camera.moveTo(camera.state.x+d,camera.state.y);else if(e.key==='ArrowUp')camera.moveTo(camera.state.x,camera.state.y-d);else if(e.key==='ArrowDown')camera.moveTo(camera.state.x,camera.state.y+d);else return;e.preventDefault();});

async function load() {
  try {
    map=await mapService.getMap();
    $('#map-defs').innerHTML=defs;
    $('#landscape').innerHTML=renderLandscape(map);
    $('#decorations').innerHTML=renderDecorations(map);
    $('#clouds').innerHTML=renderClouds();
    if (innerWidth < 600) camera.state.zoom = .58;
    render();$('#loading').hidden=true;
  } catch {
    $('#loading').innerHTML='<strong>지도를 펼치지 못했어요.</strong><button class="button button-primary" id="retry-load">다시 시도</button>';
    $('#retry-load').onclick=load;
  }
}
load();
