// FSRS-4.5 memory model (the open-source scheduler used in Anki), default weights.
// Each concept has a stability S (days until recall drops to 90 %) and a difficulty D (1–10).
// Grades: 1 again, 2 hard, 3 good, 4 easy.

const W = [0.4872, 1.4003, 3.7145, 13.8206, 5.1618, 1.2298, 0.8975, 0.031, 1.6474, 0.1367, 1.0461, 2.1072, 0.0793, 0.3246, 1.587, 0.2272, 2.8755];
const DECAY = -0.5;
export const FACTOR = 19 / 81; // makes R(S, S) = 0.9

export type Grade = 1 | 2 | 3 | 4;
export interface Memory { s: number; d: number; last: string; reps: number; lapses: number; }

const clampD = (d: number) => Math.min(10, Math.max(1, d));
const days = (a: string, b: string) => Math.max(0, (Date.parse(b + 'T12:00:00') - Date.parse(a + 'T12:00:00')) / 86_400_000);

/** Probability of recall after t days with stability s. */
export function retrievability(m: Memory | undefined, today: string): number {
  if (!m) return 0;
  const t = days(m.last, today);
  return Math.pow(1 + FACTOR * t / m.s, DECAY);
}

export function initMemory(g: Grade, today: string): Memory {
  return { s: W[g - 1], d: clampD(W[4] - (g - 3) * W[5]), last: today, reps: 1, lapses: g === 1 ? 1 : 0 };
}

export function review(m: Memory | undefined, g: Grade, today: string): Memory {
  if (!m) return initMemory(g, today);
  const r = retrievability(m, today);
  const d0easy = W[4] - (4 - 3) * W[5];
  const d = clampD(W[7] * d0easy + (1 - W[7]) * (m.d - W[6] * (g - 3)));
  let s: number;
  if (g === 1) {
    s = W[11] * Math.pow(m.d, -W[12]) * (Math.pow(m.s + 1, W[13]) - 1) * Math.exp(W[14] * (1 - r));
    s = Math.min(s, m.s);
  } else {
    const hard = g === 2 ? W[15] : 1;
    const easy = g === 4 ? W[16] : 1;
    s = m.s * (Math.exp(W[8]) * (11 - m.d) * Math.pow(m.s, -W[9]) * (Math.exp(W[10] * (1 - r)) - 1) * hard * easy + 1);
  }
  return { s: Math.max(0.1, s), d, last: today, reps: m.reps + 1, lapses: m.lapses + (g === 1 ? 1 : 0) };
}

/** Days from the last review until recall falls to the target retention. */
export function intervalDays(m: Memory, retention = 0.9): number {
  return Math.max(1, Math.round((m.s / FACTOR) * (Math.pow(retention, 1 / DECAY) - 1)));
}

export function addDays(iso: string, n: number): string {
  const d = new Date(iso + 'T12:00:00');
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}
export { days as daysBetween };
