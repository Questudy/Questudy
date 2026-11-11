import type { Question, MaterialPage } from './types.js';
const BANK = [
  ['기본 키에 대한 설명으로 옳은 것은?', '레코드를 고유하게 식별한다', '중복 값을 허용한다', '항상 두 개의 열로 구성한다', '테이블당 반드시 세 개가 필요하다'],
  ['외래 키를 사용하는 주된 이유는?', '관련 테이블의 행을 참조하기 위해', '텍스트를 압축하기 위해', '모든 열을 삭제하기 위해', '정렬 순서를 기억하기 위해'],
  ['SQL에서 조건을 만족하는 행만 조회하려면?', 'WHERE', 'ORDER BY', 'FROM', 'AS'],
  ['GROUP BY로 묶인 그룹에 조건을 적용하는 절은?', 'HAVING', 'WHERE', 'SELECT', 'LIMIT'],
  ['INNER JOIN의 결과에 포함되는 행은?', '양쪽에서 연결 조건을 만족하는 행', '왼쪽 테이블의 모든 행', '오른쪽 테이블의 모든 행', '어느 쪽에도 일치하지 않는 행'],
  ['COUNT(*)가 세는 것은?', '결과에 포함된 전체 행 수', '중복이 없는 열 이름 수', 'NULL이 있는 열 수', '사용자 계정 수'],
  ['LEFT JOIN으로 보존되는 행은?', '왼쪽 테이블의 모든 행', '오른쪽 테이블의 모든 행', '일치하지 않는 오른쪽 행만', 'NULL이 없는 행만'],
  ['SQL에서 조회 결과의 순서를 정하려면?', 'ORDER BY', 'DISTINCT', 'UPDATE', 'GROUP BY'],
  ['트랜잭션의 작업을 확정하는 명령은?', 'COMMIT', 'ROLLBACK', 'SELECT', 'DROP'],
  ['트랜잭션의 원자성이 뜻하는 것은?', '작업이 모두 적용되거나 모두 취소된다', '모든 작업이 즉시 공개된다', '항상 한 행만 변경한다', '어떤 작업도 취소할 수 없다'],
  ['ER 모델에서 부서와 프로젝트가 1:N이면 가능한 경우는?', '한 부서가 여러 프로젝트를 관리한다', '한 프로젝트를 여러 부서가 반드시 관리한다', '부서는 한 프로젝트만 관리한다', '두 개체는 서로 연결될 수 없다'],
  ['약한 개체의 부분 키는 어느 범위에서 개체를 구별하는가?', '같은 소유자에 속한 개체들 사이', '데이터베이스의 모든 테이블', '모든 소유자를 합한 전체', '어떤 범위에서도 구별하지 못한다'],
  ['릴레이션에서 튜플이 가리키는 것은?', '행', '열', '테이블 이름', '조건문'],
  ['DISTINCT의 역할은?', '결과의 중복 행을 제거한다', '새 열을 추가한다', '결과를 내림차순으로 정렬한다', '테이블을 삭제한다'],
  ['카티션 프로덕트의 행 수는 어떻게 구하는가?', '두 입력의 행 수를 곱한다', '두 입력의 행 수를 더한다', '두 입력 중 더 큰 행 수를 택한다', '두 입력 중 더 작은 행 수를 택한다'],
  ['NULL 여부를 확인하는 조건식은?', 'IS NULL', '= NULL', 'LIKE NULL', 'BETWEEN NULL'],
  ['SELECT에서 열에 별칭을 붙이는 키워드는?', 'AS', 'IN', 'ON', 'OR'],
  ['기존 행의 열 값을 바꾸는 명령은?', 'UPDATE', 'INSERT', 'SELECT', 'CREATE'],
  ['표준 SQL에서 행을 추가하는 명령은?', 'INSERT', 'UPDATE', 'ALTER', 'TRUNCATE'],
  ['데이터베이스를 정규화하는 주요 목적은?', '중복을 줄이고 갱신 이상을 줄인다', '모든 테이블을 하나로 합친다', '모든 데이터 타입을 문자로 바꾼다', '외래 키를 전부 제거한다']
];

export function shuffle<T>(values: T[]): T[] {
  const output = [...values];
  for (let i = output.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [output[i], output[j]] = [output[j], output[i]];
  }
  return output;
}

export function sampleQuestions(): Question[] {
  return BANK.map(([prompt, answer, ...others], index): Question => ({
    id: index, prompt, answer, options: shuffle([answer, ...others]), page: null
  }));
}

export function pageRange(input: string, limit: number, validateOnly = false): number[] {
  if (!input.trim()) return [];
  const numbers = new Set<number>();
  for (const part of input.split(',')) {
    const match = part.trim().match(/^(\d+)\s*(?:[-~–]\s*(\d+))?$/);
    if (!match) throw new Error('쪽수는 1-5, 8처럼 입력해 주세요.');
    const start = Number(match[1]);
    const end = Number(match[2] ?? match[1]);
    if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start < 1 || end > limit || end < start) {
      throw new Error(`1~${limit}쪽 범위 안에서 오름차순으로 입력해 주세요.`);
    }
    if (!validateOnly) for (let page = start; page <= end; page++) numbers.add(page);
  }
  return [...numbers];
}

export function materialType(file: File) {
  const extension = file.name.split('.').pop()?.toLowerCase();
  if (['pdf', 'txt', 'md', 'csv'].includes(extension)) return extension;
  return file.type === 'application/pdf' ? 'pdf' : null;
}

function selectedRange(value: string, limit: number, field: string) {
  try { return pageRange(value, limit); }
  catch (error) { throw Object.assign(error instanceof Error ? error : new Error(String(error)), { field }); }
}

export async function readMaterial(file: File, included = '', excluded = ''): Promise<MaterialPage[]> {
  const type = materialType(file);
  if (!type) throw new Error('PDF, TXT, MD, CSV 파일을 선택해 주세요.');
  if (type === 'pdf') return readPdf(file, included, excluded);
  const bytes = await file.arrayBuffer();
  let text;
  try {
    text = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  } catch {
    text = new TextDecoder('euc-kr').decode(bytes);
  }
  if (!text.trim()) throw new Error('자료에 텍스트가 없어요. 내용이 있는 파일을 선택해 주세요.');
  const parts = text.split('\f');
  const include = new Set(selectedRange(included, parts.length, 'included'));
  const exclude = new Set(selectedRange(excluded, parts.length, 'excluded'));
  const pages = parts.map((text, index) => ({ page: index + 1, text }))
    .filter(({ page }) => (!include.size || include.has(page)) && !exclude.has(page));
  if (!pages.length) throw new Error('출제할 쪽을 한 쪽 이상 남겨 주세요.');
  return pages;
}

export async function readPdf(file: File, included: string, excluded: string): Promise<MaterialPage[]> {
  const pdfjs = await import('../vendor/pdf.min.mjs');
  pdfjs.GlobalWorkerOptions.workerSrc = new URL('../vendor/pdf.worker.min.mjs', import.meta.url).href;
  const loading = pdfjs.getDocument({
    data: await file.arrayBuffer(),
    cMapUrl: new URL('../vendor/cmaps/', import.meta.url).href,
    cMapPacked: true,
    standardFontDataUrl: new URL('../vendor/standard_fonts/', import.meta.url).href,
    isEvalSupported: false
  });
  try {
    const pdf = await loading.promise;
    const include = new Set(selectedRange(included, pdf.numPages, 'included'));
    const exclude = new Set(selectedRange(excluded, pdf.numPages, 'excluded'));
    const pages: MaterialPage[] = [];
    for (let page = 1; page <= pdf.numPages; page++) {
      if ((include.size && !include.has(page)) || exclude.has(page)) continue;
      const source = await pdf.getPage(page);
      const { items } = await source.getTextContent();
      pages.push({ page, text: items.map(item => item.str ? item.str + (item.hasEOL ? '\n' : ' ') : '').join('') });
      source.cleanup();
    }
    if (!pages.length) throw new Error('출제할 쪽을 한 쪽 이상 남겨 주세요.');
    return pages;
  } finally {
    await loading.destroy();
  }
}

const WORD = /[\p{L}][\p{L}\p{N}_-]{1,24}/gu;
const STOP = new Set('그리고 그러나 따라서 또는 대한 위해 있는 없는 하는 된다 수업 강의 page this that from with there these those which about their have only when they will into must also such were used each than then what your'.split(' '));

export function questionsFromPages(pages: MaterialPage[], count: number): Question[] {
  const lines = pages.flatMap(({ page, text, source }) => {
    const parts = text.split(/\n+|(?<=[.!?。])\s+/).map(line => line.replace(/\s+/g, ' ').trim());
    return parts.filter(line => line.length >= 16).map(line => ({ page, source, line: line.slice(0, 360) }));
  });
  const terms = (line: string) => [...line.matchAll(WORD)].filter(word => !STOP.has(word[0].toLowerCase()));
  const pool = [...new Set(lines.flatMap(({ line }) => terms(line).map(match => match[0])))];
  const used = new Set();
  const questions: Question[] = [];
  for (const { line, page, source } of shuffle(lines)) {
    for (const match of shuffle(terms(line))) {
      const answer = match[0];
      const key = answer.toLowerCase();
      if (used.has(key) || line.toLowerCase().split(key).length !== 2) continue;
      const candidates = pool.filter(term => {
        const normalized = term.toLowerCase();
        return normalized !== key && !normalized.includes(key) && !key.includes(normalized) && !line.toLowerCase().includes(normalized);
      });
      const distractors = [...new Map(shuffle(candidates).map(term => [term.toLowerCase(), term])).values()].slice(0, 3);
      if (distractors.length < 3) continue;
      const blank = line.slice(0, match.index) + '________' + line.slice(match.index + answer.length);
      questions.push({ id: questions.length, prompt: blank, answer, options: shuffle([answer, ...distractors]), page, excerpt: line, source });
      used.add(key);
      if (questions.length === count) return questions;
    }
  }
  throw new Error(`선택한 쪽에서 ${count}문제를 만들 만큼 텍스트를 찾지 못했어요. 텍스트가 충분한 자료를 올리거나 출제 범위를 넓혀 주세요.`);
}
