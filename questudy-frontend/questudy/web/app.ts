import type { StudyMap, Question } from './types.js';
import { guidePage, privacyPage } from './information.js';
import { aboutPage, contactPage, contactSuccessPage, submitContact } from './contact.js';
import { enterPage, observeMotion } from './motion.js';
import { questionsFromPages, readMaterial, materialType, sampleQuestions, pageRange } from './questions.js';
import { DIFFICULTIES, makeMap, freshRun, mapGraph, completion, visibleNodes, canVisit, travel, record, seedMaps } from './game.js';

const app = document.querySelector<HTMLElement>('#app');
const dialog = document.querySelector<HTMLDialogElement>('#dialog');
observeMotion(app);
observeMotion(dialog);
let contactSubmitted = false;
let contactDraft = { email: '', message: '' };
const storageKey = 'questudy.maps.v1';
const tabs = [['all','전체'],['active','진행 중'],['finished','완료'],['favorite','즐겨찾기']];
const sortOptions = [['recent','최근 플레이순'],['new','최근 생성순'],['title','이름순'],['progress','진행률순']];
const icons: Record<string, string> = { book:'책', compass:'나침반', flag:'깃발', flame:'불꽃', puzzle:'퍼즐', star:'별', heart:'하트', trophy:'트로피' };
const statusLabels = { active:'진행 중', complete:'완료', archived:'아카이브' };
let maps: StudyMap[] = loadMaps();
let filter = 'all';
let order = 'recent';
let search = '';
let draft: { title: string; count: string; included: string; excluded: string; files: File[]; advanced: boolean } = { title:'', count:'', included:'', excluded:'', files:[], advanced:false };
let dialogLocked = false;
let toastTimer: ReturnType<typeof setTimeout>;
let clockStart: number | null = null;
let clockMap: StudyMap | null = null;
let page = 'home';
let current: StudyMap | null = null;
let fileError = '';
let rangeErrors: Record<string, string> = {};
const resultPreview = seedMaps()[2];
Object.assign(resultPreview, { id:'result-preview', title:'데이터베이스 3장', icon:'book', preview:true, celebrated:true });

function loadMaps(): StudyMap[] {
  try {
    const stored = localStorage.getItem(storageKey);
    if (stored) return JSON.parse(stored);
  } catch { /* Open the demo if browser storage is unavailable. */ }
  return seedMaps();
}

function save(map?: StudyMap) {
  if (map) map.updated = Date.now();
  try {
    localStorage.setItem(storageKey, JSON.stringify(maps));
  } catch {
    notify('브라우저 저장 공간을 사용할 수 없어요. 이번 탭에서만 진행 기록을 유지합니다.');
  }
}

function notify(message: string) {
  const notice = document.querySelector<HTMLElement>('#notice');
  notice.textContent = message;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { notice.textContent = ''; }, 4200);
}

const escape = (value: unknown) => String(value ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[c]);
const icon = (name: string, extra = '') => name === 'trophy'
  ? `<span class="paper-icon trophy-icon ${extra}" aria-hidden="true"><img class="trophy-sheet" src="./assets/trophy.png" alt=""></span>`
  : `<img class="paper-icon ${extra}" src="./assets/${name}.png" alt="">`;
const button = (label: string, action: string, variant = '', data = '', extra = '') => `<button class="paper-button ${variant} ${extra}" type="button" data-action="${action}" ${data}>${label}</button>`;
const link = (label: string, target: string, variant = '', extra = '') => `<a class="paper-button ${variant} ${extra}" href="#${target}">${label}</a>`;
const heading = (title: string, subtitle: string) => `<div class="page-heading"><h1>${title}</h1><p>${subtitle}</p></div>`;
const meter = (percent: number, label = '진행률') => `<div class="meter" role="progressbar" aria-label="${label}" aria-valuenow="${percent}" aria-valuemin="0" aria-valuemax="100"><i style="width:${percent}%"></i></div>`;
const route = (name: string, id?: string) => { location.hash = id ? `${name}/${id}` : name; };
const dateLabel = (date: number) => new Intl.DateTimeFormat('ko-KR', { year:'numeric',month:'2-digit',day:'2-digit' }).format(date);
const duration = (ms: number) => ms < 60000 ? `${Math.floor(ms / 1000)}초` : `${Math.floor(ms / 60000)}분`;
const svg = (name: string, classes = '') => `<img class="${classes}" src="./assets/${name}.svg" alt="">`;
const mapColors = [
  { tone:2, name:'노랑', color:'#f3d99a' }, { tone:6, name:'민트', color:'#bbd7bd' },
  { tone:3, name:'분홍', color:'#e8bed0' }, { tone:1, name:'라벤더', color:'#cbbfe9' },
  { tone:0, name:'하늘', color:'#add4e5' }, { tone:8, name:'살구', color:'#f2c2a8' }
];
const customizeIcons = ['book','compass','flag','flame','heart','puzzle','star','trophy'];
let pendingStyle: { id: string; icon: string; tone: number } | null = null;

function stopClock() {
  if (!clockMap || clockStart == null) return;
  clockMap.elapsed += Date.now() - clockStart;
  const map = clockMap;
  clockStart = null;
  clockMap = null;
  save(map);
}

function syncClock() {
  if (clockMap === current && !document.hidden && current?.status === 'active' && ['explore','battle'].includes(page)) return;
  stopClock();
  if (!document.hidden && ['explore','battle'].includes(page) && current?.status === 'active') {
    clockMap = current;
    clockStart = Date.now();
  }
}

function closeDialog() {
  dialogLocked = false;
  if (dialog.open) dialog.close();
}

function showDialog(title: string, contents: string, { locked = false, wide = false, kind = '' } = {}) {
  dialogLocked = locked;
  dialog.className = [wide ? 'wide' : '', kind].filter(Boolean).join(' ');
  dialog.innerHTML = `<section class="dialog-paper">
    ${svg(kind === 'archive-dialog' ? 'archive-tape' : 'dialog-tape','dialog-tape')}
    ${locked || kind === 'archive-dialog' ? '' : `<button class="dialog-close icon-button" data-action="close" aria-label="닫기">${svg('close')}</button>`}
    <h2 id="dialog-title">${title}</h2>${contents}
  </section>`;
  if (!dialog.open) dialog.showModal();
  else dialog.querySelector<HTMLElement>('input, button')?.focus();
}

dialog.addEventListener('cancel', event => {
  if (dialogLocked) event.preventDefault();
});
dialog.addEventListener('click', event => {
  if (event.target === dialog && !dialogLocked) closeDialog();
});

let homeVisit = 0;
let previewHomeMotion = false;

function shouldPlayHomeIntro(): boolean {
  return !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function renderHome() {
  const preview = previewHomeMotion;
  previewHomeMotion = false;
  const intro = preview || shouldPlayHomeIntro();
  homeVisit++;
  app.innerHTML = `<section class="hero${intro ? ' hero-intro' : ''}${preview ? ' motion-preview' : ''}" aria-label="Questudy">
    <div class="hero-art">
      ${svg('hero-plane','hero-plane')}
      <img class="wordmark" src="./assets/${intro ? 'wordmark-intro' : 'wordmark'}.svg${intro ? '?visit=' + homeVisit : ''}" alt="Questudy">
    </div>
    <div class="hero-actions">${link('새로운 지도 만들기','create')}${link('내 지도 목록','maps','yellow')}</div>
    <div class="hero-replay"><button type="button" class="quiet" data-action="replay-home">인트로 다시 보기 ↻</button></div>
  </section>`;
}

function matches(map: StudyMap, key: string) {
  if (key === 'all') return true;
  if (key === 'favorite') return map.favorite;
  if (key === 'finished') return map.status === 'complete';
  return map.status === key;
}

function renderMaps() {
  app.innerHTML = `<section class="map-list">
    <div class="list-title">${heading('내 지도','진행 중인 지도를 바로 이어서 학습하세요.')}${link('+ 새 지도','create')}</div>
    <div class="list-controls">
      <input id="search" type="search" aria-label="지도 이름 검색" placeholder="지도 이름 검색" value="${escape(search)}">
      <div class="sort-control">
        <button id="order" class="sort-trigger" type="button" data-action="toggle-sort" aria-label="지도 정렬" aria-haspopup="menu" aria-expanded="false" aria-controls="sort-menu"><span>${sortOptions.find(([key]) => key === order)[1]}</span><i aria-hidden="true"></i></button>
        <div id="sort-menu" class="sort-menu" role="menu" aria-label="정렬 기준" hidden>${sortOptions.map(([key,label]) => `<button type="button" role="menuitemradio" aria-checked="${order === key}" tabindex="-1" data-action="sort" data-value="${key}">${label}</button>`).join('')}</div>
      </div>
    </div>
    <div class="tabs" aria-label="지도 필터"></div>
    <div id="map-grid" class="map-grid"></div>
  </section>`;
  renderCards();
}

function closeSort(restoreFocus = false) {
  const trigger = app.querySelector<HTMLElement>('#order');
  const menu = app.querySelector<HTMLElement>('#sort-menu');
  if (!menu) return;
  menu.hidden = true;
  trigger.setAttribute('aria-expanded','false');
  if (restoreFocus) trigger.focus();
}

function openSort(focus: 'selected' | 'first' | 'last' = 'selected') {
  const menu = app.querySelector<HTMLElement>('#sort-menu');
  if (!menu) return;
  menu.hidden = false;
  app.querySelector('#order').setAttribute('aria-expanded','true');
  const items = [...menu.querySelectorAll<HTMLButtonElement>('button')];
  (focus === 'first' ? items[0] : focus === 'last' ? items.at(-1) : menu.querySelector<HTMLButtonElement>('[aria-checked="true"]'))?.focus();
}

document.addEventListener('keydown', event => {
  const target = event.target as HTMLElement;
  if (!target.closest('.sort-control')) return;
  const menu = app.querySelector<HTMLElement>('#sort-menu');
  if (target.id === 'order' && ['ArrowDown','ArrowUp'].includes(event.key)) {
    event.preventDefault(); openSort(event.key === 'ArrowUp' ? 'last' : 'first'); return;
  }
  if (!menu || menu.hidden) return;
  if (event.key === 'Escape') { event.preventDefault(); closeSort(true); }
  if (event.key === 'Tab') closeSort();
  if (['ArrowDown','ArrowUp','Home','End'].includes(event.key)) {
    event.preventDefault();
    const items = [...menu.querySelectorAll<HTMLButtonElement>('button')];
    const index = items.indexOf(target as HTMLButtonElement);
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? items.length - 1 : (index + (event.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length;
    items[next].focus();
  }
});
document.addEventListener('focusin', event => {
  if (!(event.target as Element).closest('.sort-control')) closeSort();
});

function renderCards() {
  const grid = document.querySelector<HTMLElement>('#map-grid');
  if (!grid) return;
  const listedMaps = maps.filter(map => map.status !== 'archived');
  app.querySelector<HTMLElement>('.tabs').innerHTML = tabs.map(([key, label]) => `<button class="tab ${key === filter ? 'selected' : ''}" aria-pressed="${key === filter}" data-action="tab" data-value="${key}">${label} ${listedMaps.filter(map => matches(map,key)).length}</button>`).join('');
  const sorts: Record<string, (a: StudyMap, b: StudyMap) => number> = {
    recent: (a,b) => b.updated - a.updated,
    new: (a,b) => b.created - a.created,
    title: (a,b) => a.title.localeCompare(b.title,'ko'),
    progress: (a,b) => completion(b) - completion(a)
  };
  const shown = listedMaps.filter(map => matches(map,filter) && map.title.toLocaleLowerCase().includes(search.trim().toLocaleLowerCase())).sort(sorts[order]);
  grid.innerHTML = shown.length ? shown.map(map => {
    const percent = completion(map);
    const started = map.started ?? (map.elapsed > 0 || map.seen.some(id => id !== 'start') || map.cleared.length > 0 || Boolean(map.battle));
    const data = `data-id="${map.id}"`;
    return `<article class="map-card tone-${map.tone % 9}">
      <div class="card-tools">
        <button class="icon-button favorite" aria-label="${escape(map.title)} 즐겨찾기" aria-pressed="${map.favorite}" data-action="favorite" ${data}><img src="./assets/${map.favorite ? 'favorite-filled' : 'favorite-outline'}.svg?v=4" alt=""></button>
        <button class="icon-button card-menu" aria-label="${escape(map.title)} 설정" data-action="manage" ${data}>${svg('more')}</button>
      </div>
      ${icon(map.icon,'card-icon')}
      <h2>${escape(map.title)}</h2>
      <div class="card-status"><span>${statusLabels[map.status]}</span><b>${percent}%</b></div>
      ${meter(percent)}
      ${link(map.status === 'active' ? started ? '이어하기 →' : '시작하기 →' : '복습하기 →',`${map.status === 'active' ? 'explore' : 'result'}/${map.id}`,'','card-play')}
    </article>`;
  }).join('') : renderEmptyMaps();
}

function renderEmptyMaps() {
  const searching = Boolean(search.trim());
  const favorite = filter === 'favorite';
  const empty = !maps.some(map => map.status !== 'archived');
  const asset = searching ? 'empty-search.png' : favorite ? 'empty-favorite.svg' : 'empty-map.svg';
  const title = searching ? '검색 결과가 없어요' : favorite ? '즐겨찾기한 지도가 없어요' : empty ? '아직 만든 지도가 없어요' : '이곳에 표시할 지도가 없어요';
  const description = searching ? '검색어를 바꾸거나 검색을 초기화해 보세요.' : favorite ? '지도 카드의 별을 누르면 이곳에서 바로 찾을 수 있어요.' : empty ? 'PDF를 올려 첫 학습 지도를 만들어 보세요.' : '전체 지도에서 다른 학습 지도를 확인해 보세요.';
  return `<div class="empty paper-panel"><img class="empty-icon" src="./assets/${asset}" alt=""><h2>${title}</h2><p>${description}</p>${searching ? button('검색 초기화','clear-search') : empty ? link('첫 지도 만들기','create') : button('전체 지도 보기','show-all')}</div>`;
}

function fileRow() {
  return draft.files.map((file,index) => `<div class="file-row">${svg('file-book')}<div><b>${escape(file.name)}</b></div><button class="icon-button" data-action="remove-file" data-value="${index}" type="button" aria-label="${escape(file.name)} 제거">${svg('close')}</button></div>`).join('');
}

function renderCreate() {
  app.innerHTML = `<div class="create-page">${heading('지도 만들기','학습 자료를 올리고, 나만의 학습 지도를 만들어 보세요.')}
    <form class="create-grid" id="create-form" novalidate>
      <section class="paper-panel upload-panel">
        ${svg('tape-top','tape-bottom')}
        <h2>학습 자료 업로드</h2>
        <label class="dropzone" id="dropzone">
          <input type="file" id="pdf" multiple accept="application/pdf,text/plain,text/markdown,text/csv,.pdf,.txt,.md,.csv" aria-label="학습 자료 선택">
          ${svg('upload-book')}<span>자료 파일을 끌어다 놓거나</span><span>클릭해서 선택하세요</span>
        </label>
        <p id="file-error" class="field-error" hidden></p>
        <p class="upload-count" id="upload-count">${draft.files.length} / 10개 · 여러 자료를 함께 추가할 수 있어요.</p><div id="file-row">${fileRow()}</div>
      </section>
      <section class="paper-panel settings-panel">
        ${svg('tape-bottom','tape-top')}
        <h2>지도 설정</h2>
        <div id="required-notice" class="required-notice" role="alert" hidden><b>필수 항목을 확인해 주세요</b><p>표시된 항목을 채운 뒤 지도를 만들 수 있어요.</p></div>
        <label class="field">지도 제목<input name="title" required maxlength="60" placeholder="예: 데이터베이스 3장" value="${escape(draft.title)}"><span id="title-error" class="field-error" hidden></span></label>
        <label class="field">문제 수<input name="count" type="number" required min="10" max="50" placeholder="최소 10문제" value="${escape(draft.count)}"><span id="count-error" class="field-error" hidden></span></label>
        <details ${draft.advanced ? 'open' : ''}>
          <summary><span>고급 설정 (선택)</span><svg class="settings-chevron" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></summary>
          <div class="advanced">
            <p class="advanced-hint">비워 두면 전체 자료에서 문제를 만들어요. 쪽수 설정은 각 자료에 적용돼요.</p>
            <label class="field">출제할 쪽수<input name="included" placeholder="예: 1-5, 8" value="${escape(draft.included)}"><span id="included-error" class="field-error" hidden></span></label>
            <label class="field">제외할 쪽수<input name="excluded" placeholder="예: 3, 10-12" value="${escape(draft.excluded)}"><span id="excluded-error" class="field-error" hidden></span></label>
          </div>
        </details>
        <button class="paper-button full" type="submit">지도 생성</button>
        <button type="button" class="quiet demo-link" data-action="new-demo">자료 없이 예시 지도 만들기 →</button>
      </section>
    </form></div>`;
  const zone = document.querySelector<HTMLElement>('#dropzone');
  if (fileError) validateCreate();
  zone.addEventListener('dragover', event => {
    event.preventDefault();
    zone.classList.add('dragging');
  });
  zone.addEventListener('dragleave', () => zone.classList.remove('dragging'));
  zone.addEventListener('drop', event => {
    event.preventDefault();
    zone.classList.remove('dragging');
    selectFiles([...event.dataTransfer.files]);
  });
  app.querySelector<HTMLDetailsElement>('details').addEventListener('toggle', event => { draft.advanced = (event.target as HTMLDetailsElement).open; });
}

function updateFiles() {
  document.querySelector<HTMLElement>('#file-row').innerHTML = fileRow();
  document.querySelector<HTMLElement>('#upload-count').textContent = `${draft.files.length} / 10개 · 여러 자료를 함께 추가할 수 있어요.`;
}

function selectFiles(files: File[]) {
  if (!files.length) return;
  const key = (file: File) => `${file.name}/${file.size}/${file.lastModified}`;
  const added = files.filter((file,index) => !draft.files.some(item => key(item) === key(file)) && files.findIndex(item => key(item) === key(file)) === index);
  const invalid = added.find(file => !materialType(file) || file.size > 50 * 1024 * 1024);
  fileError = draft.files.length + added.length > 10 ? '자료는 최대 10개까지 추가할 수 있어요.' : invalid ? `${invalid.name}: ${!materialType(invalid) ? 'PDF, TXT, MD, CSV 파일을 선택해 주세요.' : '50MB 이하의 자료를 선택해 주세요.'}` : '';
  document.querySelector<HTMLInputElement>('#pdf').value = '';
  if (fileError) { validateCreate(); return; }
  draft.files.push(...added);
  rangeErrors = {};
  if (!draft.title.trim() && draft.files.length) {
    draft.title = draft.files[0].name.replace(/\.[^.]+$/,'').slice(0,60);
    app.querySelector<HTMLInputElement>('[name="title"]').value = draft.title;
  }
  updateFiles();
  if (app.querySelector<HTMLElement>('#required-notice:not([hidden])')) validateCreate();
}

function validateCreate() {
  const form = app.querySelector<HTMLFormElement>('#create-form');
  if (!form) return false;
  const count = Number(draft.count);
  const errors: Record<string, string> = {
    file: fileError || (draft.files.length ? '' : '학습에 사용할 자료를 선택해 주세요.'),
    title: draft.title.trim() ? '' : '지도 제목을 입력해 주세요.',
    count: Number.isInteger(count) && count >= 10 && count <= 50 ? '' : '문제 수는 10~50 사이의 정수로 입력해 주세요.'
  };
  for (const name of ['included','excluded']) {
    try { pageRange(draft[name as 'included' | 'excluded'], Number.MAX_SAFE_INTEGER, true); errors[name] = rangeErrors[name] || ''; }
    catch (error) { errors[name] = error.message; }
  }
  if (errors.included || errors.excluded) form.querySelector<HTMLDetailsElement>('details').open = true;
  for (const [name, message] of Object.entries(errors)) {
    const error = form.querySelector<HTMLElement>(`#${name}-error`);
    error.textContent = message;
    error.hidden = !message;
    const input = name === 'file' ? form.querySelector<HTMLInputElement>('#pdf') : form.elements.namedItem(name) as HTMLElement;
    input.setAttribute('aria-invalid', String(Boolean(message)));
    input.setAttribute('aria-describedby', `${name}-error`);
  }
  form.querySelector<HTMLElement>('.dropzone').classList.toggle('invalid', Boolean(errors.file));
  const valid = !Object.values(errors).some(Boolean);
  const notice = form.querySelector<HTMLElement>('#required-notice');
  notice.hidden = valid;
  notice.querySelector<HTMLElement>('b').textContent = errors.included || errors.excluded ? '쪽수를 확인해 주세요' : fileError ? '파일을 확인해 주세요' : '필수 항목을 확인해 주세요';
  return valid;
}

function createMap(title: string, questions: Question[], fileName: string, demo = false) {
  const map = makeMap({ title, questions, fileName, demo, tone: maps.length % 8 });
  maps.unshift(map);
  save(map);
  draft = { title:'', count:'', included:'', excluded:'', files:[], advanced:false };
  showDialog('학습 지도가 준비됐어요', `<p>${escape(map.title)} · ${questions.length}문제</p><p>내 지도에 저장되었습니다.</p>
    <div class="dialog-actions">${link('탐험 시작하기',`explore/${map.id}`,'','full')}</div>`, { wide:true });
}

async function generate() {
  if (dialogLocked || !validateCreate()) return;
  const title = draft.title.trim();
  showDialog('학습 지도를 만들고 있어요', '<p><b>자료를 읽고 문제를 준비하고 있어요.</b></p><div class="loading" aria-label="생성 중"></div><p class="muted">완성되면 바로 탐험을 시작할 수 있어요.</p>', { locked:true, wide:true, kind:'generation-status' });
  try {
    const files = [...draft.files];
    const pages: import('./types.js').MaterialPage[] = [];
    for (const file of files) {
      try {
        const material = await readMaterial(file, draft.included, draft.excluded);
        pages.push(...material.map(page => ({ ...page, source: file.name })));
      } catch (error) {
        error.message = `${file.name}: ${error.message}`;
        throw error;
      }
    }
    const questions = questionsFromPages(pages, Number(draft.count));
    createMap(title, questions, files.map(file => file.name).join(', '));
    renderCreate();
  } catch (error) {
    if (error.field) {
      rangeErrors[error.field] = error.message;
      closeDialog(); validateCreate();
      app.querySelector<HTMLElement>(`[name="${error.field}"]`).focus();
      return;
    }
    const message = error.name === 'PasswordException' ? '암호로 보호된 PDF예요. 잠금을 해제한 파일을 올려 주세요.' :
      error.name === 'InvalidPDFException' ? 'PDF를 읽을 수 없어요. 파일이 정상적으로 열리는지 확인해 주세요.' : error.message;
    showDialog('지도를 만들지 못했어요', `<p>${escape(message)}</p><p>업로드한 자료와 설정은 유지되어 있어요.</p><div class="dialog-actions split-actions">${button('다시 생성','retry-generate')}${button('자료·설정 확인','close','yellow')}</div>`, { wide:true });
  }
}

function manage(map: StudyMap, view = 'manage') {
  const data = `data-id="${map.id}"`;
  if (view === 'rename') {
    showDialog('지도 이름 변경', `<p>문제와 학습 기록은 유지됩니다.</p><form id="rename-form" novalidate ${data}><label class="field">지도 이름<input name="newTitle" required maxlength="60" placeholder="새 지도 이름을 입력하세요" aria-describedby="rename-error" value="${escape(map.title)}"><span id="rename-error" class="field-error" hidden>지도 이름을 입력해 주세요.</span></label><div class="dialog-actions edit-actions">${button('취소','manage','yellow',data)}<button class="paper-button" type="submit">변경 저장</button></div></form>`, { wide:true });
  } else if (view === 'icons') {
    pendingStyle = { id:map.id, icon:map.icon, tone:[4,7].includes(map.tone) ? 2 : map.tone === 5 ? 0 : map.tone };
    renderCustomize(map);
  } else if (view === 'delete') {
    showDialog('지도를 삭제할까요?', `<p>${escape(map.title)}의 문제와 학습 기록이 삭제됩니다.</p><p><b>삭제한 지도는 복구할 수 없어요.</b></p><div class="dialog-actions delete-actions">${button('취소','manage','yellow',data)}${button('지도 삭제','delete','danger',data)}</div>`, { wide:true, kind:'delete-dialog' });
  } else {
    showDialog(escape(map.title), `<p>지도 정보와 진행 상황을 확인하고 관리하세요.</p>
      <div class="detail-strip"><p>${statusLabels[map.status]} · ${completion(map)}% 완료</p><p>학습 자료　 ${escape(map.fileName || '예시 자료')}</p><p>출제 범위　 ${map.questions.length}문제</p><p>최근 학습　 ${dateLabel(map.updated)}</p></div>
      <div class="dialog-actions manage-actions">${button('이름 변경','rename','yellow',data)}${button('지도 꾸미기','icons','yellow',data)}${button('삭제하기','delete-confirm','danger',data)}</div>`);
  }
}

function renderCustomize(map: StudyMap) {
  const data = `data-id="${map.id}"`;
  showDialog('지도 꾸미기', `<p>아이콘과 색상을 골라 나만의 지도를 꾸며 보세요.</p>
    <div class="icon-grid customize-icons" role="group" aria-label="지도 아이콘">${customizeIcons.map(name => `<button class="${pendingStyle.icon === name ? 'selected' : ''}" aria-label="${icons[name]}" aria-pressed="${pendingStyle.icon === name}" data-action="set-icon" ${data} data-value="${name}">${icon(name)}</button>`).join('')}</div>
    <p class="color-label">지도 색상</p><div class="color-options" role="group" aria-label="지도 색상">${mapColors.map(color => `<button class="color-option ${color.tone === pendingStyle.tone ? 'selected' : ''}" style="--swatch:${color.color}" aria-label="${color.name}" aria-pressed="${color.tone === pendingStyle.tone}" data-action="set-tone" ${data} data-value="${color.tone}"></button>`).join('')}</div>
    <div class="customize-preview tone-${pendingStyle.tone}">${icon(pendingStyle.icon)}<div><b>${escape(map.title)}</b><p>선택한 아이콘과 색상으로 목록에 표시돼요.</p></div></div>
    <div class="dialog-actions edit-actions">${button('취소','manage','yellow',data)}${button('변경 저장','save-style','',data)}</div>`, { wide:true });
}

function hearts(map: StudyMap) {
  return `<span class="hearts" aria-label="체력 ${map.hp}/5">${'♥'.repeat(map.hp)}<i>${'♥'.repeat(5 - map.hp)}</i></span>`;
}

function renderExplore(map: StudyMap) {
  if (!map.started) {
    map.started = true;
    save(map);
  }
  const graph = mapGraph(map);
  const visible = visibleNodes(map,graph);
  const coords = Object.fromEntries(graph.nodes.map(node => [node.id,node]));
  const segments = graph.edges.filter(([a,b]) => visible.has(a) && visible.has(b)).map(([a,b]) =>
    `<line x1="${coords[a].x}" y1="${coords[a].y}" x2="${coords[b].x}" y2="${coords[b].y}" class="${map.cleared.includes(a) || map.cleared.includes(b) ? 'traveled' : ''}"/>`).join('');
  const nodeButtons = graph.nodes.filter(node => visible.has(node.id)).map(node => {
    const here = node.id === map.position;
    const done = map.cleared.includes(node.id);
    const available = canVisit(map,graph,node);
    const marker = here ? '●' : done ? '✓' : node.type === 'camp' ? '◆' : node.type === 'finish' ? '★' : node.type === 'start' ? '⌂' : '✦';
    const tag = here && node.type === 'camp' ? 'data-action="camp" data-value="' + node.stage + '"' : 'data-action="node" data-value="' + node.id + '"';
    const level = node.type === 'battle' && map.difficulty[node.stage] != null ? ` · ${DIFFICULTIES[map.difficulty[node.stage]]}` : '';
    const state = here ? '현재 위치' : done ? '완료' : available ? '이동 가능' : '잠김';
    return `<button class="node ${node.type} ${here ? 'here' : ''} ${done ? 'done' : ''} ${available ? 'available' : ''}" style="--x:${node.x}%;--y:${node.y}%" ${tag} aria-label="${node.label}${level} · ${state}" ${available || (here && node.type === 'camp') ? '' : 'disabled'}><span>${marker}</span><small>${node.label}${level}</small></button>`;
  }).join('');
  const position = coords[map.position];
  app.innerHTML = `<div class="explore-title">${heading(escape(map.title),'이어진 노드를 눌러 다음 구역으로 이동하세요.')}${button('탐험 종료','archive-confirm','yellow')}</div>
    <div class="explore-grid">
      <section class="trail" aria-label="학습 지도">
        <svg class="paths" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">${segments}</svg>
        ${nodeButtons}
      </section>
      <aside class="paper-panel field-notes">
        <h2>탐험 기록</h2>${map.demo ? '<span class="badge">예시 지도 · DB 문제</span>' : ''}
        <dl><div><dt>현재 위치</dt><dd>${position.label}</dd></div><div><dt>진행률</dt><dd>${completion(map)}%</dd></div></dl>
        ${meter(completion(map))}
        <dl><div><dt>체력</dt><dd>${hearts(map)}</dd></div><div><dt>회복 물약</dt><dd>${map.potion}개</dd></div><div><dt>PASS</dt><dd>${map.pass}개</dd></div></dl>
        <div class="legend"><span><i class="legend-current"></i>현재 위치</span><span><i class="legend-ready"></i>이동 가능</span><span><i class="legend-done"></i>완료</span></div>
        ${map.battle ? button('진행 중인 전투 이어하기','resume-battle','','','full') : ''}
        ${position.type === 'camp' ? button('난이도 선택','camp','yellow',`data-value="${position.stage}"`,'full') : ''}
        ${link('← 내 지도','maps','yellow','full')}
      </aside>
    </div>`;
}

function camp(map: StudyMap, stage: number) {
  showDialog('난이도를 선택하세요', `<p>다음 구역에서 만날 문제의 선택지 수와 피격 피해가 달라져요.</p>
    <div class="difficulty-options">
      ${['선택지 3개 · 오답 피해 1','선택지 최대 4개 · 오답 피해 1','선택지 최대 4개 · 오답 피해 2'].map((hint,i) =>
        `<button class="${map.difficulty[stage] === i ? 'selected' : ''}" data-action="set-difficulty" data-value="${i}" data-stage="${stage}"><strong>${DIFFICULTIES[i]}</strong><small>${hint}</small></button>`).join('')}
    </div>`);
}

function visit(map: StudyMap, id: string) {
  const graph = mapGraph(map);
  const node = graph.nodes.find(item => item.id === id);
  if (!node || !canVisit(map,graph,node)) return;
  if (map.battle) return route('battle',map.id);
  if (node.type === 'battle' && !map.cleared.includes(id)) {
    map.battle = { node: id, turn: 0, feedback: null, from: map.position };
    travel(map,node);
    save(map);
    route('battle',map.id);
    return;
  }
  travel(map,node);
  save(map);
  renderExplore(map);
  if (node.type === 'camp' && map.difficulty[node.stage] == null) camp(map,node.stage);
}

function battleOptions(question: Question, level: number) {
  if (level !== 0) return question.options;
  const distractor = question.options.findIndex(option => option !== question.answer);
  return question.options.filter((_, index) => index !== distractor);
}

function renderBattle(map: StudyMap) {
  const battle = map.battle;
  const node = mapGraph(map).nodes.find(item => item.id === battle.node);
  const question = node.questions[battle.turn];
  const feedback = battle.feedback;
  const level = map.difficulty[node.stage] ?? 1;
  const options = battleOptions(question,level);
  app.innerHTML = `<div class="explore-title">${heading(`${escape(map.title)} · ${node.label}`, '정답을 맞혀 몬스터를 물리치세요.')}${link('← 탐험 지도',`explore/${map.id}`,'yellow')}</div>
    <div class="battle-grid">
      <section class="paper-panel arena">
        <div class="arena-top"><span class="badge">난이도 ${DIFFICULTIES[level]}</span>${hearts(map)}</div>
        <div class="monsters">${node.questions.map((_, i) => `<div class="monster ${i < battle.turn || (i === battle.turn && feedback?.advance) ? 'defeated' : ''} ${i === battle.turn ? 'target' : ''}"><div class="monster-paper monster-${i % 3}"><i></i><i></i><b></b></div><span>몬스터 ${i + 1}</span></div>`).join('')}</div>
        <div class="battle-items">${button(`회복 물약 ×${map.potion}`,'use-potion','yellow',`${!map.potion || map.hp === 5 || feedback ? 'disabled' : ''}`)}${button(`PASS ×${map.pass}`,'use-pass','yellow',`${!map.pass || feedback ? 'disabled' : ''}`)}</div>
      </section>
      <section class="paper-panel question-panel">
        <div class="question-meta"><b>문제 ${battle.turn + 1} / ${node.questions.length}</b>${question.page ? `<span>${escape(question.source || '자료')} ${question.page}쪽</span>` : '<span>예시 문제</span>'}</div>
        <h2>${question.excerpt ? '빈칸에 들어갈 말을 고르세요.' : escape(question.prompt)}</h2>
        ${question.excerpt ? `<blockquote>${escape(question.prompt)}</blockquote>` : ''}
        <div class="choices">${options.map((answer,i) => `<button class="choice ${feedback?.advance && answer === question.answer ? 'correct' : feedback?.answer === answer && !feedback.advance ? 'incorrect' : ''}" data-action="answer" data-value="${i}" ${feedback ? 'disabled' : ''}><b>${i + 1}</b><span>${escape(answer)}</span></button>`).join('')}</div>
        ${feedback ? `<div class="feedback ${feedback.advance ? 'good' : 'bad'}" role="status"><p>${feedback.pass ? 'PASS로 이 문제를 건너뛰었어요.' : feedback.advance ? '정답이에요! 몬스터를 물리쳤어요.' : `오답이에요. 하트가 ${feedback.damage}개 줄었어요.`}</p>${button(map.hp === 0 ? '도전 결과 보기' : feedback.advance ? '계속하기 →' : '다시 풀기','advance')}</div>` : ''}
      </section>
    </div>`;
}

function answer(map: StudyMap, index: number, pass = false) {
  const battle = map.battle;
  if (!battle || battle.feedback || (pass && !map.pass)) return;
  const node = mapGraph(map).nodes.find(item => item.id === battle.node);
  const q = node.questions[battle.turn];
  const level = map.difficulty[node.stage] ?? 1;
  const options = battleOptions(q,level);
  const picked = pass ? null : options[index];
  if (!pass && picked == null) return;
  if (pass) map.pass--;
  const advance = pass || picked === q.answer;
  const damage = advance ? 0 : level === 2 ? 2 : 1;
  map.hp = Math.max(0,map.hp - damage);
  record(map,q,picked);
  battle.feedback = { answer: picked, advance, pass, damage };
  save(map);
  renderBattle(map);
  app.querySelector<HTMLElement>('[data-action="advance"]').focus();
}

function rewardDialog() {
  showDialog('전투에서 승리했어요!', `<p>다음 탐험에 사용할 보상 하나를 선택하세요.</p><div class="difficulty-options">
    <button data-action="reward" data-value="hp">${icon('heart')}<strong>하트 +2</strong><small>즉시 체력 회복</small></button>
    <button data-action="reward" data-value="potion">${icon('puzzle')}<strong>물약 +1</strong><small>전투 중 체력 회복</small></button>
    <button data-action="reward" data-value="pass">${icon('star')}<strong>PASS +1</strong><small>문제 하나 건너뛰기</small></button>
  </div>`, { locked:true });
}

function advanceBattle(map: StudyMap) {
  const battle = map.battle;
  if (map.hp === 0) {
    map.position = battle.from;
    map.hp = 5;
    map.battle = null;
    save(map);
    route('explore',map.id);
    notify('하트를 모두 사용했어요. 지도에서 같은 전투에 다시 도전할 수 있어요.');
    return;
  }
  if (battle.feedback.advance) {
    const node = mapGraph(map).nodes.find(item => item.id === battle.node);
    if (battle.turn + 1 === node.questions.length) {
      rewardDialog();
      return;
    }
    battle.turn++;
  }
  battle.feedback = null;
  save(map);
  renderBattle(map);
  app.querySelector<HTMLElement>('.choice').focus();
}

function giveReward(map: StudyMap, item: string) {
  if (!map.battle) return;
  if (item === 'hp') map.hp = Math.min(5,map.hp + 2);
  else if (item === 'potion' || item === 'pass') map[item]++;
  map.cleared.push(map.battle.node);
  map.battle = null;
  if (completion(map) === 100) {
    stopClock();
    map.status = 'complete';
    map.position = 'finish';
  }
  save(map);
  closeDialog();
  route(map.status === 'complete' ? 'result' : 'explore',map.id);
}

function renderResult(map: StudyMap) {
  const percent = completion(map);
  const correct = Object.values(map.attempts).filter(item => item.firstCorrect).length;
  const reviews = map.review.map(id => map.questions.find(q => q.id === id)).filter(Boolean);
  const stat = (asset: string, name: string, value: string | number, index: number) => `<div class="result-stat stat-${index}">${icon(asset)}<div><strong>${value}</strong><small>${name}</small></div></div>`;
  app.innerHTML = `${heading(percent === 100 ? '탐험이 완료되었어요!' : '탐험 기록을 저장했어요!', '탐험이 완료되었어요. 틀린 문제를 다시 풀어 보세요.')}
    ${map.preview ? '<p class="preview-notice" role="status">탐험 결과 미리보기 · 예시 학습 기록입니다.</p>' : ''}
    <section class="paper-panel result-panel">
      <div class="result-map">${icon(map.icon)}<div><h2>${escape(map.title)}</h2><small>${dateLabel(map.created)} · ${map.questions.length}문제${map.demo ? ' · 예시 지도' : ''}</small></div></div>
      <div class="result-stats">${stat(percent === 100 ? 'trophy' : 'compass','완료율',percent + '%',1)}${stat('puzzle','첫 시도 정답 수',correct + ' / ' + map.questions.length,2)}${stat('clock','소요 시간',duration(map.elapsed),3)}</div>
      <h2 class="review-title">다시 볼 문제 <b>${reviews.length}개</b></h2>
      ${reviews.length ? `<ol class="reviews">${reviews.map(q => `<li><span class="review-question">${escape(q.prompt)}</span><small>${q.page ? q.page + '쪽' : ''}</small>${button('다시 풀기','review','yellow',`data-value="${q.id}"`,'compact')}</li>`).join('')}</ol>` : '<p class="muted">다시 볼 문제가 아직 없어요.</p>'}
      <div class="result-actions">${button('↻ 다시 탐험하기',map.preview ? 'preview-restart' : 'restart-confirm')}${link('내 지도 목록','maps','yellow')}</div>
    </section>`;
  if (percent === 100 && !map.celebrated) {
    app.insertAdjacentHTML('beforeend', `<div class="confetti" aria-hidden="true">${Array.from({length:22},(_,i)=>`<i style="--left:${i*4.7}%;--delay:${i%7 * 0.09}s;--hue:${i*39 % 360}"></i>`).join('')}</div>`);
    map.celebrated = true;
    save();
  }
}

function review(map: StudyMap, id: number, picked?: number) {
  const q = map.questions.find(item => item.id === id);
  if (!q) return;
  const answered = picked !== undefined;
  showDialog('문제 다시 풀기', `
    <p><b>${q.excerpt ? '빈칸에 들어갈 말을 고르세요.' : escape(q.prompt)}</b></p>
    ${q.excerpt ? `<blockquote>${escape(q.prompt)}</blockquote>` : ''}
    <div class="choices">${q.options.map((option,index) => `<button class="choice ${answered && option === q.answer ? 'correct' : answered && index === picked ? 'incorrect' : ''}" data-action="review-answer" data-id="${id}" data-value="${index}" ${answered ? 'disabled' : ''}><b>${index + 1}</b><span>${escape(option)}</span></button>`).join('')}</div>
    ${answered ? `<div class="feedback ${q.options[picked] === q.answer ? 'good' : 'bad'}" role="status"><p>${q.options[picked] === q.answer ? '정답이에요!' : '정답은 ' + escape(q.answer) + '입니다.'}</p>${q.excerpt ? `<p class="source-note">자료 ${q.page}쪽 · ${escape(q.excerpt)}</p>` : ''}</div>` : ''}`, { wide:true });
}

function renderRoute() {
  closeDialog();
  const [view,id] = location.hash.slice(1).split('/');
  page = view === 'result-preview' ? 'result' : ['home','maps','create','explore','battle','result','guide','privacy','about','contact','contact-success'].includes(view) ? view : 'home';
  if (page === 'contact-success' && !contactSubmitted) return route('contact');
  current = view === 'result-preview' ? resultPreview : maps.find(map => map.id === id) || null;
  if (['explore','battle','result'].includes(page) && !current) return route('maps');
  if (page === 'battle' && !current.battle) return route('explore',id);
  if (['explore','battle'].includes(page) && current.status !== 'active') return route('result',id);
  if (page === 'result' && current.status === 'active') return route('explore',id);
  syncClock();
  document.body.dataset.page = page;
  document.querySelector<HTMLElement>('#decor').innerHTML = ['home','about','contact','contact-success'].includes(page) ? '' : svg('bg-plane','back-plane') + svg('bookmark','back-bookmark');
  document.querySelectorAll<HTMLAnchorElement>('nav a').forEach(a => {
    const active = a.hash === '#' + (['explore','battle','result'].includes(page) ? 'maps' : page);
    if (active) a.setAttribute('aria-current','page');
    else a.removeAttribute('aria-current');
  });
  const render: Record<string, (map: StudyMap) => void> = { home:renderHome, maps:renderMaps, create:renderCreate, explore:renderExplore, battle:renderBattle, result:renderResult, guide:() => { app.innerHTML = guidePage(); }, privacy:() => { app.innerHTML = privacyPage(); }, about:() => { app.innerHTML = aboutPage(); }, contact:() => {
    app.innerHTML = contactPage();
    app.querySelector<HTMLInputElement>('[name="email"]').value = contactDraft.email;
    app.querySelector<HTMLTextAreaElement>('[name="message"]').value = contactDraft.message;
  }, 'contact-success':() => { app.innerHTML = contactSuccessPage(); } };
  render[page](current);
  enterPage(app);
  const titles: Record<string, string> = { guide:'이용안내', privacy:'개인정보처리방침', about:'서비스 소개', contact:'문의하기', 'contact-success':'문의 접수 완료' };
  document.title = `${titles[page] || '퀘스터디'} · Questudy`;
  document.querySelectorAll<HTMLAnchorElement>('.site-footer a').forEach(a => {
    if (a.hash === `#${page === 'contact-success' ? 'contact' : page}`) a.setAttribute('aria-current','page');
    else a.removeAttribute('aria-current');
  });
  const pageTitle = app.querySelector<HTMLElement>('h1');
  if (pageTitle) { pageTitle.tabIndex = -1; pageTitle.focus({ preventScroll:true }); }
  window.scrollTo(0,0);
}

document.addEventListener('input', event => {
  const field = event.target as HTMLInputElement;
  if (field.closest('#contact-form')) {
    const form = field.closest('form');
    contactDraft = { email:(form.elements.namedItem('email') as HTMLInputElement).value, message:(form.elements.namedItem('message') as HTMLTextAreaElement).value };
    field.setCustomValidity('');
    form.querySelector<HTMLElement>('#contact-error').hidden = true;
  }
  if (field.name === 'newTitle') {
    field.setAttribute('aria-invalid', String(!field.value.trim()));
    dialog.querySelector<HTMLElement>('#rename-error').hidden = Boolean(field.value.trim());
  }
  if (field.id === 'search') {
    search = field.value;
    renderCards();
  }
  if (field.closest('#create-form') && ['title','count','included','excluded'].includes(field.name)) {
    delete rangeErrors[field.name];
    draft[field.name as 'title' | 'count' | 'included' | 'excluded'] = field.value;
    if (app.querySelector<HTMLElement>('#required-notice:not([hidden])')) validateCreate();
  }
});

document.addEventListener('change', event => {
  const field = event.target as HTMLInputElement;
  if (field.id === 'pdf') selectFiles([...field.files]);
});

document.addEventListener('submit', event => {
  const form = event.target as HTMLFormElement;
  if (form.id === 'contact-form') {
    event.preventDefault();
    if (form.getAttribute('aria-busy') === 'true') return;
    void submitContact(form).then(success => {
      if (!success) return;
      contactSubmitted = true;
      contactDraft = { email:'', message:'' };
      if (page === 'contact') route('contact-success');
      else notify('문의가 접수됐어요.');
    });
  }
  if (form.id === 'create-form') {
    event.preventDefault();
    void generate();
  }
  if (form.id === 'rename-form') {
    event.preventDefault();
    const map = maps.find(item => item.id === form.dataset.id);
    const name = (form.elements.namedItem('newTitle') as HTMLInputElement).value.trim();
    if (!map) return;
    if (!name) {
      (form.elements.namedItem('newTitle') as HTMLInputElement).setAttribute('aria-invalid','true');
      form.querySelector<HTMLElement>('#rename-error').hidden = false;
      (form.elements.namedItem('newTitle') as HTMLInputElement).focus();
      return;
    }
    map.title = name;
    save();
    closeDialog();
    renderCards();
  }
});

document.addEventListener('click', event => {
  if (!(event.target as Element).closest('.sort-control')) closeSort();
  const target = (event.target as Element).closest<HTMLElement>('[data-action]');
  if (!target) return;
  const { action,id,value,stage } = target.dataset;
  const map = maps.find(item => item.id === id) || current;
  switch (action) {
    case 'replay-home':
      previewHomeMotion = true;
      renderHome();
      app.querySelector<HTMLButtonElement>('[data-action="replay-home"]').focus({ preventScroll:true });
      break;
    case 'toggle-sort':
      if (app.querySelector<HTMLElement>('#sort-menu').hidden) openSort();
      else closeSort();
      break;
    case 'sort':
      if (!sortOptions.some(([key]) => key === value)) break;
      order = value;
      app.querySelector<HTMLElement>('#order span').textContent = sortOptions.find(([key]) => key === order)[1];
      app.querySelectorAll<HTMLElement>('#sort-menu button').forEach(item => item.setAttribute('aria-checked', String(item.dataset.value === order)));
      closeSort(true); renderCards();
      break;
    case 'copy-contact':
      void navigator.clipboard.writeText(`${contactDraft.email ? '답변받을 이메일: ' + contactDraft.email + '\n\n' : ''}${contactDraft.message}`).then(() => notify('문의 내용을 복사했어요.'), () => notify('복사하지 못했어요. 문의 내용을 직접 선택해 복사해 주세요.'));
      break;
    case 'clear-search':
      search = ''; renderMaps(); app.querySelector<HTMLElement>('#search').focus(); break;
    case 'show-all':
      search = ''; filter = 'all'; renderMaps(); app.querySelector<HTMLElement>('.tab.selected').focus(); break;
    case 'preview-restart':
      createMap('데이터베이스 예시 지도',sampleQuestions(),'',true); break;
    case 'close': closeDialog(); break;
    case 'tab':
      filter = value; renderCards(); app.querySelector<HTMLElement>('.tab.selected').focus(); break;
    case 'favorite':
      map.favorite = !map.favorite; save(); renderCards();
      (app.querySelector<HTMLElement>(`.favorite[data-id="${id}"]`) || app.querySelector<HTMLElement>('.tab.selected'))?.focus();
      break;
    case 'manage': case 'rename': case 'icons': case 'delete-confirm':
      manage(map,action === 'delete-confirm' ? 'delete' : action); break;
    case 'set-icon':
      if (pendingStyle?.id !== map.id) break;
      pendingStyle.icon = value; renderCustomize(map);
      dialog.querySelector<HTMLElement>(`[data-action="set-icon"][data-value="${value}"]`)?.focus(); break;
    case 'set-tone':
      if (pendingStyle?.id !== map.id || !mapColors.some(color => color.tone === Number(value))) break;
      pendingStyle.tone = Number(value); renderCustomize(map);
      dialog.querySelector<HTMLElement>(`[data-action="set-tone"][data-value="${value}"]`)?.focus(); break;
    case 'save-style':
      if (pendingStyle?.id !== map.id) break;
      map.icon = pendingStyle.icon; map.tone = pendingStyle.tone;
      pendingStyle = null; save(); closeDialog(); renderCards(); break;
    case 'retry-generate':
      closeDialog(); void generate(); break;
    case 'delete':
      maps = maps.filter(item => item.id !== map.id); save(); closeDialog(); renderCards(); notify('지도를 삭제했어요.'); break;
    case 'remove-file':
      fileError = '';
      draft.files.splice(Number(value),1); updateFiles();
      if (app.querySelector<HTMLElement>('#required-notice:not([hidden])')) validateCreate(); break;
    case 'new-demo':
      createMap('데이터베이스 예시 지도',sampleQuestions(),'',
        true); renderCreate(); break;
    case 'node': visit(map,value); break;
    case 'camp': camp(map,Number(value)); break;
    case 'set-difficulty':
      map.difficulty[stage] = Number(value); save(map); closeDialog(); renderExplore(map); break;
    case 'resume-battle': route('battle',map.id); break;
    case 'answer': answer(map,Number(value)); break;
    case 'use-pass': answer(map,0,true); break;
    case 'use-potion':
      if (!map.battle.feedback && map.potion && map.hp < 5) {
        map.potion--; map.hp = Math.min(5,map.hp + 2); save(map); renderBattle(map); notify('하트를 회복했어요.');
      }
      break;
    case 'advance': advanceBattle(map); break;
    case 'reward': giveReward(map,value); break;
    case 'archive-confirm':
      showDialog('탐험을 여기서 마칠까요?', `<p>현재 완료율 ${completion(map)}%와 풀이 기록을 저장합니다.</p><p class="archive-note">종료한 지도는 내 지도에서 복습할 수 있어요.</p><div class="dialog-actions archive-actions">${button('계속 탐험','close','yellow')}${button('탐험 종료','archive','danger')}</div>`, { wide:true, kind:'archive-dialog' }); break;
    case 'archive':
      stopClock(); map.status = 'archived'; map.battle = null; save(map); route('result',map.id); break;
    case 'review': review(map,Number(value)); break;
    case 'review-answer': review(current,Number(id),Number(value)); break;
    case 'restart-confirm':
      showDialog('다시 탐험할까요?', `<p>이 지도의 문제를 처음부터 풀어요. 현재 진행률과 풀이 기록은 초기화됩니다.</p><div class="dialog-actions">${button('취소','close','yellow')}${button('다시 탐험하기','restart')}</div>`); break;
    case 'restart':
      Object.assign(map,freshRun(),{status:'active',elapsed:0,celebrated:false}); save(map); route('explore',map.id); break;
    case 'guide':
      route('guide'); break;
    case 'privacy':
      route('privacy'); break;
  }
});

window.addEventListener('hashchange',renderRoute);
window.addEventListener('pagehide',stopClock);
document.addEventListener('visibilitychange',syncClock);
renderRoute();
