import { createMap } from '../data/map.ts';
import type { Difficulty, MapService, MapSnapshot } from '../types.ts';

/**
 * Map service boundary. The UI only consumes snapshots returned here.
 * Future HTTP adapter: getMap(id), moveTo(id), chooseDifficulty(id, value),
 * completeBattle(id). Endpoint names/paths must be agreed with Backend first.
 * Reachability, discovery and progress are mock server responsibilities here.
 * Nothing is saved to localStorage or presented as a real saved game.
 */
export function createMockMapService({ delay = 160 } = {}): MapService {
  const map = createMap();
  const completed = new Set(['start']);
  const discovered = new Set(['start', ...map.edges.filter(e => e.from === 'start').map(e => e.to)]);
  const difficulties: Partial<Record<string, Difficulty>> = {};
  let currentNodeId = 'start';
  let status: MapSnapshot['session']['status'] = 'active';
  const wait = async () => { if (delay) await new Promise(resolve => setTimeout(resolve, delay)); };
  const find = (id: string) => {
    const node = map.nodes.find(n => n.id === id);
    if (!node) throw new Error('존재하지 않는 노드예요.');
    return node;
  };
  function snapshot(): MapSnapshot {
    // A reachable node has a path through cleared nodes back to the plaza.
    const reachable = map.nodes.filter(n => discovered.has(n.id) && (completed.has(n.id) || map.edges.some(e => e.to === n.id && completed.has(e.from)))).map(n => n.id);
    return structuredClone({ ...map, session: { currentNodeId, completed: [...completed], discovered: [...discovered], reachable, difficulties, status }, progress: { completed: map.nodes.filter(n => n.kind === 'battle' && completed.has(n.id)).length, total: map.nodes.filter(n => n.kind === 'battle').length } });
  }
  function assertActive() { if (status !== 'active') throw new Error('이 미리보기는 종료되었어요. 새로고침하면 다시 시작할 수 있어요.'); }
  function assertReachable(id: string) { if (!snapshot().session.reachable.includes(id)) throw new Error('먼저 연결된 앞 노드를 클리어해 주세요.'); }
  function finish(id: string) {
    completed.add(id);
    map.edges.filter(e => e.from === id).forEach(e => discovered.add(e.to));
    currentNodeId = id;
  }
  return {
    async getMap() { await wait(); return snapshot(); },
    async moveTo(id) { await wait(); assertActive(); find(id); assertReachable(id); currentNodeId = id; return snapshot(); },
    async chooseDifficulty(id, difficulty) {
      await wait(); assertActive(); const node = find(id); assertReachable(id);
      if (node.kind !== 'gate' || !['easy', 'normal', 'hard'].includes(difficulty)) throw new Error('올바른 난이도를 선택해 주세요.');
      const key = `${node.areaId}:${node.section}`;
      if (difficulties[key]) throw new Error('이미 선택한 구간의 난이도는 바꿀 수 없어요.');
      difficulties[key] = difficulty; finish(id); return snapshot();
    },
    async completeBattle(id) {
      await wait(); assertActive(); const node = find(id); assertReachable(id);
      if (node.kind !== 'battle' || completed.has(id)) throw new Error('진행할 수 없는 전투예요.');
      if (!difficulties[`${node.areaId}:${node.section}`]) throw new Error('먼저 이 구간의 난이도를 선택해 주세요.');
      finish(id); return snapshot();
    },
    async endPreview() { await wait(); assertActive(); status = 'ended'; return snapshot(); },
  };
}

export const mapService = createMockMapService();
