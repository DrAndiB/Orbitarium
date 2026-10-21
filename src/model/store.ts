import type { Memory } from './fsrs';
import type { Lang, Hint } from '../i18n';

export type Level = 0 | 1 | 2 | 3 | 4; // unseen, seen, can predict, can explain, can transfer
export interface ConceptState extends Memory { level: Level; firstSeen: string; }
export interface MisState { status: 'spotted' | 'challenged' | 'resolved'; since: string; correctDays: string[]; }
export interface Attempt { at: string; item: string; correct: boolean; partial?: boolean; conf?: number; concepts: string[]; }
export interface Session { date: string; kind: 'unit' | 'rekindle' | 'diagnostic'; unit?: number; }
export interface Takeaway { unit: number; date: string; text: string; tightened?: string; }
export interface UnitProgress { status: 'not-started' | 'in-progress' | 'done' | 'next' | 'review'; step?: number; completedAt?: string; secondPass?: boolean; lastScore?: number; }
/** One review answer: what the memory model forecast (t days since last review, stability s) and what happened. */
export interface MemPoint { t: number; s: number; ok: 0 | 1; }
export interface Settings {
  lang: Lang; hint: Hint;
  weeklyTarget: number; nudgeDays: number[]; nudgeTime: string; gapDays: number;
}
export interface CalibBin { n: number; right: number; }

export interface State {
  version: 1;
  onboarded: boolean;
  learner: string;
  settings: Settings;
  concepts: Record<string, ConceptState>;
  misconceptions: Record<string, MisState>;
  attempts: Attempt[];
  calib: Record<string, CalibBin>; // keys '50','60','70','80','90'
  sessions: Session[];
  takeaways: Takeaway[];
  units: Record<string, UnitProgress>;
  elements: string[];
  history: string[]; // free-text notes carried from imports ("How I learn best" etc.)
  memScale?: number;   // personal correction of the memory model, fitted from review answers (1 = default)
  memLog?: MemPoint[]; // recent review answers used for that fit
}

const KEY = 'orbitarium.v1';

export function defaultState(): State {
  return {
    version: 1, onboarded: false, learner: '',
    settings: { lang: 'en', hint: 'other', weeklyTarget: 3, nudgeDays: [0, 2, 4], nudgeTime: '20:30', gapDays: 5 },
    concepts: {}, misconceptions: {}, attempts: [], calib: {}, sessions: [], takeaways: [], units: {}, elements: [], history: [],
  };
}

let state: State = load();
const subs = new Set<() => void>();

function load(): State {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...defaultState(), ...JSON.parse(raw) };
  } catch { /* storage unavailable: run in memory */ }
  return defaultState();
}

export function getState(): State { return state; }
export function save() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* ignore */ }
  subs.forEach((f) => f());
}
export function replaceState(next: State) { state = next; save(); }
export function onSave(f: () => void) { subs.add(f); return () => subs.delete(f); }

/** Today's date as yyyy-mm-dd in local time. `?today=2026-11-02` overrides it for testing. */
export function today(): string {
  const o = new URLSearchParams(location.search).get('today');
  if (o && /^\d{4}-\d{2}-\d{2}$/.test(o)) return o;
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
