// Atomic structure data and rules for units 1–3: subshells, filling order, configurations, shielding,
// successive ionization energies and the hydrogen spectrum. Pure data and functions, no DOM.

export interface Subshell { id: string; n: number; l: 0 | 1 | 2 | 3; cap: number; }
const L = 'spdf';
const sub = (n: number, l: 0 | 1 | 2 | 3): Subshell => ({ id: `${n}${L[l]}`, n, l, cap: 2 * (2 * l + 1) });

/** Filling order (aufbau, Madelung rule) as far as krypton and a little beyond. */
export const FILL_ORDER: Subshell[] = [sub(1, 0), sub(2, 0), sub(2, 1), sub(3, 0), sub(3, 1), sub(4, 0), sub(3, 2), sub(4, 1), sub(5, 0), sub(4, 2), sub(5, 1)];
export const subById = (id: string) => FILL_ORDER.find((s) => s.id === id)!;

export type Config = Map<string, number>; // subshell id → electrons

/** Ground-state configuration of a neutral atom (Z ≤ 54), with the two famous exceptions chromium and copper. */
export function groundConfig(Z: number): Config {
  const c: Config = new Map();
  let left = Z;
  for (const s of FILL_ORDER) {
    if (left <= 0) break;
    const k = Math.min(s.cap, left);
    c.set(s.id, k);
    left -= k;
  }
  if (Z === 24 || Z === 29 || Z === 42 || Z === 47) {
    // Cr, Cu (and Mo, Ag): one s electron moves into d for a half-full or full d subshell.
    const s = Z < 40 ? '4s' : '5s', d = Z < 40 ? '3d' : '4d';
    c.set(s, 1); c.set(d, (c.get(d) ?? 0) + 1);
  }
  return c;
}

/** Remove electrons to make a positive ion: highest shell first, then highest subshell (4s goes before 3d). */
export function ionize(c: Config, k: number): Config {
  const out = new Map(c);
  for (let i = 0; i < k; i++) {
    const occ = [...out.entries()].filter(([, e]) => e > 0).map(([id]) => subById(id))
      .sort((a, b) => b.n - a.n || b.l - a.l);
    if (!occ.length) break;
    const s = occ[0];
    const left = (out.get(s.id) ?? 0) - 1;
    if (left > 0) out.set(s.id, left); else out.delete(s.id);
  }
  return out;
}

/** Add electrons to make a negative ion: into the next free place in filling order. */
export function addElectrons(c: Config, k: number): Config {
  const out = new Map(c);
  for (let i = 0; i < k; i++) {
    const s = FILL_ORDER.find((x) => (out.get(x.id) ?? 0) < x.cap);
    if (!s) break;
    out.set(s.id, (out.get(s.id) ?? 0) + 1);
  }
  return out;
}

export const electronCount = (c: Config) => [...c.values()].reduce((a, b) => a + b, 0);

/** Electrons per shell, e.g. [2, 8, 7]. */
export function shellCounts(c: Config): number[] {
  const out: number[] = [];
  for (const [id, e] of c) { const n = subById(id).n; out[n - 1] = (out[n - 1] ?? 0) + e; }
  return Array.from({ length: out.length }, (_, i) => out[i] ?? 0);
}

/** Configuration text in filling order, e.g. 1s² 2s² 2p⁶ 3s¹. */
export function configText(c: Config): string {
  const sup = '⁰¹²³⁴⁵⁶⁷⁸⁹';
  const toSup = (k: number) => String(k).split('').map((d) => sup[+d]).join('');
  return [...c.entries()].filter(([, e]) => e > 0)
    .sort(([a], [b]) => { const A = subById(a), B = subById(b); return A.n - B.n || A.l - B.l; })
    .map(([id, e]) => id + toSup(e)).join(' ');
}

/** Orbital boxes for a subshell: each entry is 0, 1 (↑) or 2 (↑↓), filled one per box first (Hund's rule). */
export function boxes(s: Subshell, electrons: number): number[] {
  const m = 2 * s.l + 1;
  const b = Array(m).fill(0);
  for (let i = 0; i < electrons; i++) b[i % m] += 1;
  return b;
}

export const outerShell = (c: Config) => Math.max(0, ...[...c.entries()].filter(([, e]) => e > 0).map(([id]) => subById(id).n));

/**
 * Effective nuclear charge felt by the outer shell in the simple model: Z minus the inner electrons,
 * scaled by how well they shield (1 = perfectly, the usual simple model; 0 = not at all).
 */
export function zeff(Z: number, c: Config, shielding = 1): number {
  const n = outerShell(c);
  let inner = 0;
  for (const [id, e] of c) if (subById(id).n < n) inner += e;
  return Z - shielding * inner;
}

/** Relative size of the outer shell in the simple model: r ∝ n² / Z_eff. */
export const relRadius = (n: number, z: number) => (n * n) / Math.max(0.3, z);

/** Successive molar ionization energies in kJ/mol, Z = 1–20 (first six where they exist). */
export const IONIZATION: Record<number, number[]> = {
  1: [1312.0], 2: [2372.3, 5250.5], 3: [520.2, 7298.1, 11815.0], 4: [899.5, 1757.1, 14848.7, 21006.6],
  5: [800.6, 2427.1, 3659.7, 25025.8, 32826.7], 6: [1086.5, 2352.6, 4620.5, 6222.7, 37831, 47277.0],
  7: [1402.3, 2856, 4578.1, 7475.0, 9444.9, 53266.6], 8: [1313.9, 3388.3, 5300.5, 7469.2, 10989.5, 13326.5],
  9: [1681.0, 3374.2, 6050.4, 8407.7, 11022.7, 15164.1], 10: [2080.7, 3952.3, 6122, 9371, 12177, 15238.9],
  11: [495.8, 4562, 6910.3, 9543, 13354, 16613], 12: [737.7, 1450.7, 7732.7, 10542.5, 13630, 18020],
  13: [577.5, 1816.7, 2744.8, 11577, 14842, 18379], 14: [786.5, 1577.1, 3231.6, 4355.5, 16091, 19805],
  15: [1011.8, 1907, 2914.1, 4963.6, 6273.9, 21267], 16: [999.6, 2252, 3357, 4556, 7004.3, 8495.8],
  17: [1251.2, 2298, 3822, 5158.6, 6542, 9362], 18: [1520.6, 2665.8, 3931, 5771, 7238, 8781],
  19: [418.8, 3052, 4420, 5877, 7975, 9590], 20: [589.8, 1145.4, 4912.4, 6491, 8153, 10496],
};

/** Index of the biggest jump between successive ionization energies (the cliff), as the number of electrons before it. */
export function cliffAfter(Z: number): number | null {
  const ie = IONIZATION[Z];
  if (!ie || ie.length < 2) return null;
  let best = 0, at = 0;
  for (let i = 1; i < ie.length; i++) { const r = ie[i] / ie[i - 1]; if (r > best) { best = r; at = i; } }
  return at;
}

// ---------- hydrogen: energy levels and light ----------

/** Energy of hydrogen's level n in eV. */
export const hLevel = (n: number) => -13.6 / (n * n);
/** Wavelength in nm of the photon emitted in a jump from level a down to level b. */
export const hWavelength = (a: number, b: number) => 1239.84 / (hLevel(a) - hLevel(b));

/** Approximate display colour for a visible wavelength (380–750 nm); null outside the visible range. */
export function wavelengthColor(nm: number): string | null {
  if (nm < 380 || nm > 750) return null;
  let r = 0, g = 0, b = 0;
  if (nm < 440) { r = (440 - nm) / 60; b = 1; }
  else if (nm < 490) { g = (nm - 440) / 50; b = 1; }
  else if (nm < 510) { g = 1; b = (510 - nm) / 20; }
  else if (nm < 580) { r = (nm - 510) / 70; g = 1; }
  else if (nm < 645) { r = 1; g = (645 - nm) / 65; }
  else r = 1;
  const f = nm < 420 ? 0.3 + 0.7 * (nm - 380) / 40 : nm > 700 ? 0.3 + 0.7 * (750 - nm) / 50 : 1;
  const c = (x: number) => Math.round(255 * Math.pow(x * f, 0.8));
  return `rgb(${c(r)}, ${c(g)}, ${c(b)})`;
}
