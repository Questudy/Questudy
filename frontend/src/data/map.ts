// Coordinates and document metadata belong to the map response, not the renderer.
import type { MapArea, MapDefinition, MapNode, NodeKind } from '../types.ts';
export const WORLD = { width: 2400, height: 1800 };
const topics = [
  ['튜플의 이해', '스키마와 인스턴스', '도메인과 속성', '관계의 특징', '키의 역할', '후보키와 기본키', '참조 무결성', '관계대수 기초', '선택과 투영', '관계 모델 정복'],
  ['SELECT의 시작', '조건으로 찾기', '정렬과 중복', '집계 함수', 'GROUP BY', '테이블 연결', '서브쿼리', '뷰와 인덱스', '데이터 수정', 'SQL 탐험 완료'],
  ['프로세스의 이해', '스레드와 동시성', 'CPU 스케줄링', '문맥 교환', '동기화 기초', '세마포어', '교착 상태', '가상 메모리', '페이지 교체', '운영체제 정복'],
  ['네트워크의 시작', '계층 모델', '데이터 전송', 'IP 주소', '라우팅', 'TCP와 UDP', '흐름 제어', 'HTTP의 이해', '보안 통신', '네트워크 정복'],
];
const configurations: Omit<MapArea, 'documentId' | 'nodeIds'>[] = [
  { id: 'database', name: '관계형 데이터의 숲', fileName: 'DB_03.pdf', documentTitle: '데이터베이스 3장', pages: 38, color: '#b6d9b8', dark: '#638b66', light: '#e8f3e3', dx: -1, dy: -1, label: [638, 356] },
  { id: 'sql', name: '쿼리의 황금 들판', fileName: 'SQL_04.pdf', documentTitle: 'SQL 기초와 활용', pages: 24, color: '#e1df9a', dark: '#a5a25b', light: '#f5f4d8', dx: 1, dy: -1, label: [1762, 356] },
  { id: 'os', name: '운영체제의 모래 협곡', fileName: 'OS_02.pdf', documentTitle: '운영체제 핵심 정리', pages: 32, color: '#e8c7a2', dark: '#bd946d', light: '#fbeddc', dx: -1, dy: 1, label: [638, 1495] },
  { id: 'network', name: '네트워크 별빛 언덕', fileName: 'NET_01.pdf', documentTitle: '컴퓨터 네트워크', pages: 28, color: '#d5c4e7', dark: '#a68cbd', light: '#f1e9f8', dx: 1, dy: 1, label: [1762, 1495] },
];
// A directed graph permits branching and merging within a document area only.
const positions = [[225,180], [345,240], [465,220], [345,370], [490,370], [610,315], [610,465], [740,430], [740,590], [570,650], [400,610], [530,770], [740,760]];
const kinds: NodeKind[] = ['gate','battle','battle','battle','gate','battle','battle','battle','gate','battle','battle','battle','battle'];
const links = [[0,1],[1,2],[1,3],[2,4],[3,4],[4,5],[4,6],[5,7],[6,7],[7,8],[8,9],[8,10],[9,11],[10,11],[11,12]];

export function createMap(): MapDefinition {
  const nodes: MapNode[] = [{ id: 'start', kind: 'start', title: '출발의 광장', x: 1200, y: 900, areaId: null, section: null, sequence: null, description: '', concepts: [], monsterCount: 0 }];
  const edges: MapDefinition['edges'] = [];
  const areas = configurations.map((config, areaIndex) => {
    let topic = 0;
    let section = 0;
    positions.forEach(([x, y], i) => {
      if (kinds[i] === 'gate') section++;
      nodes.push({ id: `${config.id}-${i}`, kind: kinds[i], title: kinds[i] === 'gate' ? `${section}번째 난이도 갈림길` : topics[areaIndex][topic++], x: 1200 + config.dx * x, y: 900 + config.dy * y, areaId: config.id, section, sequence: kinds[i] === 'battle' ? topic : null, description: kinds[i] === 'gate' ? '다음 구간의 학습 난이도를 선택하세요. 선택한 난이도는 다음 갈림길까지 유지돼요.' : `${config.documentTitle}에서 배운 내용을 확인하는 작은 도전이에요.`, concepts: kinds[i] === 'battle' ? [topics[areaIndex][topic - 1], '핵심 개념과 적용'] : [], monsterCount: 3 });
    });
    edges.push({ from: 'start', to: `${config.id}-0` });
    links.forEach(([a,b]) => edges.push({ from: `${config.id}-${a}`, to: `${config.id}-${b}` }));
    return { ...config, documentId: `doc-${config.id}`, nodeIds: nodes.filter(n => n.areaId === config.id).map(n => n.id) };
  });
  return { id: 'mock-knowledge-islands', title: '지식의 군도', world: WORLD, areas, nodes, edges, player: { hp: 80, maxHp: 100 }, inventory: { recovery: 2, pass: 3 } };
}
