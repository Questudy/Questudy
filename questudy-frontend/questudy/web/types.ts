export interface Question { id: number; prompt: string; answer: string; options: string[]; page: number | null; excerpt?: string; source?: string }
export interface MaterialPage { page: number; text: string; source?: string }
export interface Feedback { answer: string | null; advance: boolean; pass: boolean; damage: number }
export interface Battle { node: string; turn: number; feedback: Feedback | null; from: string }
export interface Run { cleared: string[]; seen: string[]; position: string; difficulty: Record<string, number>; hp: number; potion: number; pass: number; attempts: Record<string, { firstCorrect: boolean; lastAnswer: string | null }>; review: number[]; battle: Battle | null }
export interface StudyMap extends Run { id: string; title: string; questions: Question[]; fileName: string; icon: string; tone: number; demo: boolean; created: number; updated: number; elapsed: number; status: 'active' | 'complete' | 'archived'; favorite: boolean; preview?: boolean; celebrated?: boolean; started?: boolean }
export interface MapNode { id: string; label: string; x: number; y: number; type: 'start' | 'camp' | 'battle' | 'finish'; stage?: number; questions?: Question[] }
export interface MapGraph { nodes: MapNode[]; edges: string[][]; battles: { id: string; label: string; questions: Question[]; type: string }[] }
