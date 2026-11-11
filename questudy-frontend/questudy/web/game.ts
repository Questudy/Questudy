import type { StudyMap, Question, Run, MapGraph, MapNode } from './types.js';
import { sampleQuestions } from './questions.js';

export const ICONS = ['book','compass','flag','flame','puzzle','star','heart','trophy'];
export const DIFFICULTIES = ['하','중','상'];

export function makeMap({ title, questions, fileName = '', icon = 'book', tone = 0, demo = false }: { title: string; questions: Question[]; fileName?: string; icon?: string; tone?: number; demo?: boolean }): StudyMap {
  const now = Date.now();
  return {
    id: crypto.randomUUID(), title, questions, fileName, icon, tone, demo,
    created: now, updated: now, elapsed: 0, status: 'active', favorite: false,
    ...freshRun()
  };
}

export function freshRun(): Run {
  return {
    cleared: [], seen: ['start'], position: 'start', difficulty: {},
    hp: 5, potion: 1, pass: 1, attempts: {}, review: [], battle: null
  };
}

export function mapGraph(map: StudyMap): MapGraph {
  const groups = Math.max(5, Math.ceil(map.questions.length / 3));
  const size = Math.floor(map.questions.length / groups);
  let offset = 0;
  const battles = Array.from({ length: groups }, (_, i) => {
    const length = size + Number(i < map.questions.length % groups);
    const questions = map.questions.slice(offset, offset + length);
    offset += length;
    return { id: `b${i}`, label: `전투 ${i + 1}`, questions, type: 'battle' as const };
  });
  const nodes: MapNode[] = [{ id: 'start', label: '시작', x: 50, y: 88, type: 'start' }];
  const edges: string[][] = [];
  let parents = ['start'];
  for (let stage = 0; stage < 3; stage++) {
    const top = 71 - stage * 24;
    const camp = `c${stage}`;
    const section = battles.slice(Math.floor(stage * groups / 3), Math.floor((stage + 1) * groups / 3));
    nodes.push({ id: camp, label: `난이도 ${stage + 1}`, x: 50, y: top + 5, type: 'camp', stage });
    edges.push(...parents.map(parent => [parent, camp]));
    section.forEach((node, index) => {
      const x = section.length === 1 ? 25 + (stage % 2) * 50 : 15 + (70 * index / (section.length - 1));
      nodes.push({ ...node, stage, x, y: top - 6 - index % 2 * 3 });
      edges.push([camp, node.id]);
    });
    parents = section.map(node => node.id);
  }
  nodes.push({ id: 'finish', label: '도착', x: 50, y: 5, type: 'finish' });
  edges.push(...parents.map(parent => [parent, 'finish']));
  return { nodes, edges, battles };
}

export function adjacent(graph: MapGraph, id: string) {
  return graph.edges.filter(edge => edge.includes(id)).map(([a, b]) => a === id ? b : a);
}

export function completion(map: StudyMap) {
  const { battles } = mapGraph(map);
  return Math.round(100 * map.cleared.length / battles.length);
}

export function visibleNodes(map: StudyMap, graph: MapGraph) {
  const unlocked = new Set(['start', ...map.seen, ...map.cleared, ...adjacent(graph, map.position)]);
  map.cleared.forEach(id => adjacent(graph, id).forEach(neighbor => unlocked.add(neighbor)));
  return unlocked;
}

export function canVisit(map: StudyMap, graph: MapGraph, node: MapNode) {
  if (!adjacent(graph, map.position).includes(node.id) || map.status !== 'active') return false;
  if (node.type === 'finish') return completion(map) === 100;
  if (node.type === 'battle' && map.difficulty[node.stage] == null) return false;
  return node.type !== 'camp' || node.stage === 0 || graph.nodes
    .filter(item => item.type === 'battle' && item.stage === node.stage - 1)
    .every(item => map.cleared.includes(item.id));
}

export function travel(map: StudyMap, node: MapNode) {
  map.position = node.id;
  if (!map.seen.includes(node.id)) map.seen.push(node.id);
}

export function record(map: StudyMap, q: Question, answer: string | null) {
  const previous = map.attempts[q.id];
  map.attempts[q.id] = { firstCorrect: previous?.firstCorrect ?? (answer === q.answer), lastAnswer: answer };
  if (answer !== q.answer && !map.review.includes(q.id)) map.review.push(q.id);
}

export function seedMaps(): StudyMap[] {
  const titles = ['토익 RC 실전','한국사 능력검정','미적분 개념 정리','심리학 입문','데이터베이스 3장','인체해부학 기초','마케팅 원론','행정법 핵심 정리'];
  const icons = ['book','compass','flag','flame','book','puzzle','star','book'];
  return titles.map((title, i) => {
    const map = makeMap({ title, icon: icons[i], tone: i, questions: sampleQuestions(), demo: true });
    map.id = `demo-${i + 1}`;
    map.updated -= i * 60000;
    const { battles } = mapGraph(map);
    const done = [4,2,7,3,5,1,7,1][i];
    map.cleared = battles.slice(0, done).map(n => n.id);
    map.difficulty = { 0: 1, 1: 1, 2: 1 };
    map.seen.push('c0', ...map.cleared);
    map.cleared.forEach(id => battles.find(n => n.id === id).questions.forEach(q => record(map, q, q.id % 6 ? q.answer : q.options.find(option => option !== q.answer))));
    if ([2, 6].includes(i)) map.status = 'complete';
    if (i === 3) map.status = 'archived';
    map.elapsed = done * 93000;
    return map;
  });
}

