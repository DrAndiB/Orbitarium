import { getState, save, today, type Level, type ConceptState } from './store';
import { review, retrievability, intervalDays, addDays, daysBetween, type Grade } from './fsrs';
import { BANK, type Item, type Evidence } from '../content/items';
import { UNITS, conceptUnit } from '../content/curriculum';

const LEVEL: Record<Evidence, Level> = { seen: 1, predict: 2, explain: 3, transfer: 4 };

export interface Answer {
  item: string;
  concepts: string[];
  correct: boolean;
  partial?: boolean;
  conf?: number;          // 0.5–1
  chosenMis?: string;     // misconception revealed by a wrong choice
  targets?: string[];     // misconceptions this item tests
  evidence?: Evidence;
}

function gradeOf(a: Answer): Grade {
  if (!a.correct && !a.partial) return 1;
  if (a.partial) return 2;
  if (a.conf !== undefined && a.conf < 0.65) return 2;
  if (a.conf !== undefined && a.conf >= 0.9) return 4;
  return 3;
}

/** Record one answer: memory model, understanding ladder, misconceptions, calibration. */
export function recordAnswer(a: Answer) {
  const st = getState();
  const now = today();
  const g = gradeOf(a);
  for (const id of a.concepts) {
    const prev = st.concepts[id];
    const mem = review(prev, g, now);
    let level: Level = prev?.level ?? 1;
    if (level < 1) level = 1;
    if (a.correct && a.evidence) {
      const target = LEVEL[a.evidence];
      // Transfer only counts once the concept is at least a week old: mastery is delayed.
      const oldEnough = !prev || a.evidence !== 'transfer' || daysBetween(prev.firstSeen, now) >= 7;
      if (target > level && (oldEnough || target < 4)) level = (oldEnough ? target : Math.min(target, 3)) as Level;
    }
    st.concepts[id] = { ...mem, level, firstSeen: prev?.firstSeen ?? now };
  }
  if (a.chosenMis) {
    const m = st.misconceptions[a.chosenMis];
    st.misconceptions[a.chosenMis] = m && m.status !== 'resolved'
      ? { ...m, correctDays: [] }
      : { status: 'spotted', since: now, correctDays: [] };
  }
  if (a.correct && a.targets) {
    for (const id of a.targets) {
      const m = st.misconceptions[id];
      if (!m || m.status === 'resolved') continue;
      const daysList = m.correctDays.includes(now) ? m.correctDays : [...m.correctDays, now];
      st.misconceptions[id] = { ...m, correctDays: daysList, status: daysList.length >= 3 ? 'resolved' : 'challenged' };
    }
  }
  if (a.conf !== undefined) {
    const bin = String(Math.min(90, Math.floor(a.conf * 10) * 10));
    const cb = st.calib[bin] ?? { n: 0, right: 0 };
    st.calib[bin] = { n: cb.n + 1, right: cb.right + (a.correct ? 1 : 0) };
  }
  st.attempts.push({ at: now, item: a.item, correct: a.correct, partial: a.partial, conf: a.conf, concepts: a.concepts });
  if (st.attempts.length > 600) st.attempts.splice(0, st.attempts.length - 600);
  save();
}

/** Mark concepts as met in a lesson without a graded answer (first exposure). */
export function markSeen(concepts: string[]) {
  const st = getState();
  const now = today();
  for (const id of concepts) if (!st.concepts[id]) st.concepts[id] = { ...review(undefined, 3, now), level: 1, firstSeen: now };
  save();
}

export function recall(id: string): number { return retrievability(getState().concepts[id], today()); }
export function conceptState(id: string): ConceptState | undefined { return getState().concepts[id]; }
export function nextReview(id: string): string | undefined {
  const c = getState().concepts[id];
  return c ? addDays(c.last, intervalDays(c)) : undefined;
}

/** Concepts that have been seen and whose recall has dropped below 90 %. */
export function dueConcepts(): { id: string; r: number }[] {
  const st = getState();
  return Object.keys(st.concepts)
    .map((id) => ({ id, r: recall(id) }))
    .filter((x) => x.r < 0.9)
    .sort((a, b) => a.r - b.r);
}

export function unitMemory(n: number): number | null {
  const unit = UNITS.find((u) => u.n === n);
  if (!unit) return null;
  const seen = unit.concepts.filter((c) => getState().concepts[c.id]);
  if (!seen.length) return null;
  return seen.reduce((s, c) => s + recall(c.id), 0) / seen.length;
}
export function unitLevel(n: number): number {
  const unit = UNITS.find((u) => u.n === n);
  if (!unit) return 0;
  const lv: number[] = unit.concepts.map((c) => getState().concepts[c.id]?.level ?? 0);
  return lv.reduce((a, b) => a + b, 0) / lv.length;
}

/**
 * Pick warm-up items: concepts fading fastest first, at most one item per unit (interleaving),
 * never the unit currently being taught, and not items answered in the last two days.
 */
export function pickWarmup(n = 3, excludeUnit?: number): Item[] {
  const st = getState();
  const now = today();
  const recent = new Set(st.attempts.filter((x) => daysBetween(x.at, now) < 2).map((x) => x.item));
  const scored = BANK
    .filter((it) => it.unit !== excludeUnit && !recent.has(it.id))
    .filter((it) => it.concepts.some((c) => st.concepts[c]))
    .map((it) => ({ it, r: Math.min(...it.concepts.map((c) => (st.concepts[c] ? recall(c) : 1))) + Math.random() * 0.05 }))
    .sort((a, b) => a.r - b.r);
  const out: Item[] = [];
  const units = new Set<number>();
  for (const { it } of scored) {
    if (units.has(it.unit)) continue;
    out.push(it); units.add(it.unit);
    if (out.length === n) break;
  }
  // Not enough history yet: fill with items from units 1–5.
  for (const it of BANK) { if (out.length >= n) break; if (!out.includes(it) && it.unit < 6 && it.unit !== excludeUnit) out.push(it); }
  return out;
}

export function logSession(kind: 'unit' | 'rekindle' | 'diagnostic', unit?: number) {
  const st = getState();
  st.sessions.push({ date: today(), kind, unit });
  save();
}

/** Sessions in the current Monday-based week. */
export function sessionsThisWeek(): number {
  const now = new Date(today() + 'T12:00:00');
  const dow = (now.getDay() + 6) % 7;
  const monday = addDays(today(), -dow);
  const daysSet = new Set(getState().sessions.filter((s) => s.date >= monday && s.kind !== 'diagnostic').map((s) => s.date + (s.unit ?? '') + s.kind));
  return daysSet.size;
}
export function daysSinceLastSession(): number | null {
  const s = getState().sessions;
  if (!s.length) return null;
  return daysBetween(s[s.length - 1].date, today());
}

export function touchElements(symbols: string[]) {
  const st = getState();
  let changed = false;
  for (const e of symbols) if (!st.elements.includes(e)) { st.elements.push(e); changed = true; }
  if (changed) save();
}

export { conceptUnit };

/** Items for a rekindle session: fading concepts first, optionally limited to one unit. */
export function pickRekindle(n = 3, unit?: number): Item[] {
  if (!unit) return pickWarmup(n);
  return BANK.filter((it) => it.unit === unit)
    .map((it) => ({ it, r: Math.min(...it.concepts.map((c) => (getState().concepts[c] ? recall(c) : 1))) }))
    .sort((a, b) => a.r - b.r).slice(0, n).map((x) => x.it);
}
