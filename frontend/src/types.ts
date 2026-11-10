export type Difficulty = 'easy' | 'normal' | 'hard';
export type NodeKind = 'start' | 'gate' | 'battle';

export interface MapNode {
  id: string;
  kind: NodeKind;
  title: string;
  x: number;
  y: number;
  areaId: string | null;
  section: number | null;
  sequence: number | null;
  description: string;
  concepts: string[];
  monsterCount: number;
}

export interface MapArea {
  id: string;
  name: string;
  documentId: string;
  fileName: string;
  documentTitle: string;
  pages: number;
  color: string;
  dark: string;
  light: string;
  dx: number;
  dy: number;
  label: [number, number];
  nodeIds: string[];
}

export interface MapDefinition {
  id: string;
  title: string;
  world: { width: number; height: number };
  areas: MapArea[];
  nodes: MapNode[];
  edges: { from: string; to: string }[];
  player: { hp: number; maxHp: number };
  inventory: { recovery: number; pass: number };
}

export interface MapSnapshot extends MapDefinition {
  session: {
    currentNodeId: string;
    completed: string[];
    discovered: string[];
    reachable: string[];
    difficulties: Partial<Record<string, Difficulty>>;
    status: 'active' | 'ended';
  };
  progress: { completed: number; total: number };
}

export interface MapService {
  getMap(): Promise<MapSnapshot>;
  moveTo(id: string): Promise<MapSnapshot>;
  chooseDifficulty(id: string, difficulty: Difficulty): Promise<MapSnapshot>;
  completeBattle(id: string): Promise<MapSnapshot>;
  endPreview(): Promise<MapSnapshot>;
}

export interface CameraState {
  x: number;
  y: number;
  zoom: number;
  width: number;
  height: number;
}
