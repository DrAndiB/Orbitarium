import { getState, save, today, type Level, type ConceptState, type MemPoint, type Attempt } from './store';
import { review, retrievability, intervalDays, addDays, daysBetween, FACTOR, type Grade } from './fsrs';
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
  review?: boolean;       // answered in a warm-up, rekindle or second pass (feeds the personal memory fit)
}

function gradeOf(a: Answer): Grade {
  if (!a.correct && !a.partial) return 1;
  if (a.partial) return 2;
  if (a.conf !== undefined && a.conf < 0.65) return 2;
  if (a.conf !== undefined && a.conf >= 0.9) return 4;
  return 3;
}

/** A right answer given at 55 % confidence or less is most likely a guess: it counts for memory, not for mastery. */
export const likelyGuess = (a: { correct: boolean; conf?: number }) => a.correct && a.conf !== undefined && a.conf <= 0.55;

/** Days between the first and last of a set of ISO dates. */
const span = (days: string[]) => (days.length < 2 ? 0 : daysBetween([...days].sort()[0], [...days].sort().at(-1)!));

/** Record one answer: memory model, understanding ladder, misconceptions, calibration. */
export function recordAnswer(a: Answer) {
  const st = getState();
  const now = today();
  const g = gradeOf(a);
  const guess = likelyGuess(a);
  let logged = false;
  for (const id of a.concepts) {
    const prev = st.concepts[id];
    if (a.review && prev) {
      const t = daysBetween(prev.last, now);
      if (t >= 1) { (st.memLog ??= []).push({ t, s: prev.s, ok: a.correct && !a.partial ? 1 : 0 }); logged = true; }
    }
    const mem = review(prev, g, now);
    let level: Level = prev?.level ?? 1;
    if (level < 1) level = 1;
    if (a.correct && a.evidence && !guess) {
      let target = LEVEL[a.evidence];
      const age = prev ? daysBetween(prev.firstSeen, now) : 0;
      // Mastery is delayed: transfer counts a week after first contact, explaining from the next day on.
      // Earlier, a right answer still shows the learner can predict.
      if (target === 4 && age < 7) target = 2;
      if (target === 3 && age < 1) target = 2;
      if (target > level) level = target;
    }
    st.concepts[id] = { ...mem, level, firstSeen: prev?.firstSeen ?? now };
  }
  if (logged) {
    st.memLog = st.memLog!.slice(-300);
    st.memScale = fitScale(st.memLog);
  }
  if (a.chosenMis) {
    const m = st.misconceptions[a.chosenMis];
    st.misconceptions[a.chosenMis] = m && m.status !== 'resolved'
      ? { ...m, correctDays: [] }
      : { status: 'spotted', since: now, correctDays: [] };
  }
  if (a.correct && !a.partial && !guess && a.targets) {
    for (const id of a.targets) {
      const m = st.misconceptions[id];
      if (!m || m.status === 'resolved') continue;
      const daysList = m.correctDays.includes(now) ? m.correctDays : [...m.correctDays, now];
      // Resolved after right answers on at least two days that are three or more days apart.
      st.misconceptions[id] = { ...m, correctDays: daysList, status: daysList.length >= 2 && span(daysList) >= 3 ? 'resolved' : 'challenged' };
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

/**
 * Personal memory scale: the stability multiplier that makes the model's forecasts match this learner's
 * review results, shrunk towards 1 while there is little evidence. Below 1 = forgets faster than the default.
 */
export function fitScale(log: MemPoint[]): number {
  const pts = log.filter((p) => p.t >= 1);
  if (pts.length < 8) return 1;
  const actual = pts.reduce((s, p) => s + p.ok, 0);
  const pred = (m: number) => pts.reduce((s, p) => s + Math.pow(1 + (FACTOR * p.t) / (m * p.s), -0.5), 0);
  let lo = 0.2, hi = 3, m: number;
  if (pred(lo) >= actual) m = lo;
  else if (pred(hi) <= actual) m = hi;
  else {
    for (let i = 0; i < 40; i++) { const mid = Math.sqrt(lo * hi); if (pred(mid) < actual) lo = mid; else hi = mid; }
    m = Math.sqrt(lo * hi);
  }
  const w = pts.length / (pts.length + 30);
  return Math.exp(w * Math.log(m));
}

/** Mark concepts as met in a lesson without a graded answer (first exposure). */
export function markSeen(concepts: string[]) {
  const st = getState();
  const now = today();
  for (const id of concepts) if (!st.concepts[id]) st.concepts[id] = { ...review(undefined, 3, now), level: 1, firstSeen: now };
  save();
}

/** The concept's memory with the personal scale applied. */
function scaled(c: ConceptState): ConceptState {
  const m = getState().memScale ?? 1;
  return m === 1 ? c : { ...c, s: c.s * m };
}
export function recall(id: string): number { const c = getState().concepts[id]; return c ? retrievability(scaled(c), today()) : 0; }
export function conceptState(id: string): ConceptState | undefined { return getState().concepts[id]; }
export function nextReview(id: string): string | undefined {
  const c = getState().concepts[id];
  return c ? addDays(c.last, intervalDays(scaled(c))) : undefined;
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

const hasItems = (concept: string) => BANK.some((it) => it.concepts.includes(concept));

/** Warm-up length: three questions, plus one for every six fading concepts, at most eight. */
export function warmupSize(excludeUnit?: number): number {
  const due = dueConcepts().filter((d) => conceptUnit(d.id) !== excludeUnit && hasItems(d.id)).length;
  return Math.min(8, 3 + Math.floor(due / 6));
}

/**
 * Pick review questions concept-first: one slot for an open misconception, then the most-faded concepts,
 * each with the question variant seen longest ago. Never the unit being taught, never an item answered in
 * the last two days, and at most half of the questions from one unit.
 */
export function pickReview(o: { size?: number; exclude?: number; unit?: number } = {}): Item[] {
  const st = getState();
  const now = today();
  const last = new Map<string, string>();
  for (const a of st.attempts) last.set(a.item, a.at);
  const recent = (id: string) => { const d = last.get(id); return !!d && daysBetween(d, now) < 2; };
  const inScope = (it: Item) => it.unit !== o.exclude && (o.unit === undefined || it.unit === o.unit);
  const size = o.size ?? warmupSize(o.exclude);
  const cap = o.unit !== undefined ? size : Math.max(2, Math.ceil(size / 2));
  const out: Item[] = [];
  const perUnit = new Map<number, number>();
  const take = (it: Item) => { out.push(it); perUnit.set(it.unit, (perUnit.get(it.unit) ?? 0) + 1); };
  const fresh = (cands: Item[]) => cands
    .filter((it) => inScope(it) && !recent(it.id) && !out.includes(it) && (perUnit.get(it.unit) ?? 0) < cap)
    .sort((a, b) => (last.get(a.id) ?? '0000').localeCompare(last.get(b.id) ?? '0000') || a.concepts.length - b.concepts.length);

  // 1. One slot for an open misconception, so traps get revisited until they are resolved.
  const open = Object.entries(st.misconceptions).filter(([, m]) => m.status !== 'resolved').sort(([, a], [, b]) => a.since.localeCompare(b.since));
  for (const [mis] of open) {
    const c = fresh(BANK.filter((it) => it.targets?.includes(mis) && it.concepts.some((cc) => st.concepts[cc])));
    if (c.length) { take(c[0]); break; }
  }
  // 2. The most-faded concepts, one question each.
  const concepts = Object.keys(st.concepts)
    .filter((id) => conceptUnit(id) !== o.exclude && (o.unit === undefined || conceptUnit(id) === o.unit))
    .map((id) => ({ id, r: recall(id) + Math.random() * 0.02 }))
    .sort((a, b) => a.r - b.r);
  for (const c of concepts) {
    if (out.length >= size) break;
    if (out.some((it) => it.concepts.includes(c.id))) continue;
    const cands = fresh(BANK.filter((it) => it.concepts.includes(c.id)));
    const best = cands.find((it) => it.concepts.every((cc) => st.concepts[cc])) ?? cands[0];
    if (best) take(best);
  }
  // 3. Not enough history yet: fill from the early units.
  for (const it of BANK) {
    if (out.length >= Math.min(size, 3)) break;
    if (!out.includes(it) && it.unit < 6 && inScope(it) && !recent(it.id)) out.push(it);
  }
  return out;
}

export function pickWarmup(n?: number, excludeUnit?: number): Item[] { return pickReview({ size: n, exclude: excludeUnit }); }
/** Items for a rekindle session: fading concepts first, optionally limited to one unit (five questions then). */
export function pickRekindle(n?: number, unit?: number): Item[] { return pickReview({ size: n ?? (unit !== undefined ? 5 : undefined), unit }); }

// ---------- sessions, unit results, second passes ----------

export function logSession(kind: 'unit' | 'rekindle' | 'diagnostic', unit?: number) {
  const st = getState();
  st.sessions.push({ date: today(), kind, unit });
  save();
}

const NOT_SCORED = /-(explain|explain-missed|terms|order|build|deeper)$/;
/** Share of the unit's own questions answered right today (partly right counts half); null if none. */
export function unitScoreToday(n: number): number | null {
  const now = today();
  const first = new Map<string, Attempt>();
  for (const a of getState().attempts) {
    if (a.at === now && a.item.startsWith(`u${n}-`) && !NOT_SCORED.test(a.item) && !first.has(a.item)) first.set(a.item, a);
  }
  if (!first.size) return null;
  return [...first.values()].reduce((s, a) => s + (a.correct ? 1 : a.partial ? 0.5 : 0), 0) / first.size;
}

/** Finish a unit: mark it done, point to the next one, and queue a second pass when under half landed. */
export function finishUnit(n: number): { score: number | null; secondPass: boolean } {
  const st = getState();
  const score = unitScoreToday(n);
  const prev = st.units[n];
  const secondPass = score !== null && score < 0.5;
  st.units[n] = { status: 'done', completedAt: prev?.status === 'done' && prev.completedAt ? prev.completedAt : today(), step: 0, secondPass: secondPass || undefined, lastScore: score ?? undefined };
  if (!Object.values(st.units).some((p) => p.status === 'next')) {
    const nextUnit = UNITS.find((u) => u.n > n && st.units[u.n]?.status !== 'done');
    if (nextUnit && (!st.units[nextUnit.n] || st.units[nextUnit.n].status === 'not-started')) st.units[nextUnit.n] = { status: 'next' };
  }
  logSession('unit', n);
  return { score, secondPass };
}

/** The unit waiting for a second pass, if any. */
export function secondPassDue(): number | undefined {
  const e = Object.entries(getState().units).find(([, p]) => p.secondPass);
  return e ? Number(e[0]) : undefined;
}
export function finishSecondPass(n: number) {
  const p = getState().units[n];
  if (p) delete p.secondPass;
  logSession('rekindle', n);
}

/** True when every listed item was answered right today with at least 80 % confidence: unlocks "go deeper". */
export function confidentToday(ids: string[]): boolean {
  const now = today();
  const xs = getState().attempts.filter((a) => a.at === now && ids.includes(a.item));
  return xs.length >= ids.length && xs.every((a) => a.correct && (a.conf ?? 0) >= 0.8);
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
