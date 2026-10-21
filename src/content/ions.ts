// Ionic compounds for the Lattice Builder (unit 4): rock-salt structures with measured data.
// Ionic radii: Shannon, six-fold coordination (pm). Lattice energies (kJ/mol): Born–Haber values from the Purdue
// general chemistry tables; CaO from the experimental table in Wikipedia's 'Lattice energy'. Melting points in °C.
import type { Bi } from '../i18n';

export interface Ion { s: string; q: number; r: number; name: Bi; }
export const IONS: Record<string, Ion> = {
  'Li+': { s: 'Li', q: 1, r: 76, name: { en: 'lithium ion', de: 'Lithium-Ion' } },
  'Na+': { s: 'Na', q: 1, r: 102, name: { en: 'sodium ion', de: 'Natrium-Ion' } },
  'K+': { s: 'K', q: 1, r: 138, name: { en: 'potassium ion', de: 'Kalium-Ion' } },
  'Mg2+': { s: 'Mg', q: 2, r: 72, name: { en: 'magnesium ion', de: 'Magnesium-Ion' } },
  'Ca2+': { s: 'Ca', q: 2, r: 100, name: { en: 'calcium ion', de: 'Calcium-Ion' } },
  'F-': { s: 'F', q: -1, r: 133, name: { en: 'fluoride', de: 'Fluorid' } },
  'Cl-': { s: 'Cl', q: -1, r: 181, name: { en: 'chloride', de: 'Chlorid' } },
  'Br-': { s: 'Br', q: -1, r: 196, name: { en: 'bromide', de: 'Bromid' } },
  'I-': { s: 'I', q: -1, r: 220, name: { en: 'iodide', de: 'Iodid' } },
  'O2-': { s: 'O', q: -2, r: 140, name: { en: 'oxide', de: 'Oxid' } },
};

export interface Salt { id: string; formula: string; cation: string; anion: string; lattice: number; mp: number; name: Bi; }
export const SALTS: Salt[] = [
  { id: 'NaCl', formula: 'NaCl', cation: 'Na+', anion: 'Cl-', lattice: 787, mp: 801, name: { en: 'sodium chloride, table salt', de: 'Natriumchlorid, Kochsalz' } },
  { id: 'KCl', formula: 'KCl', cation: 'K+', anion: 'Cl-', lattice: 715, mp: 770, name: { en: 'potassium chloride', de: 'Kaliumchlorid' } },
  { id: 'NaF', formula: 'NaF', cation: 'Na+', anion: 'F-', lattice: 923, mp: 993, name: { en: 'sodium fluoride', de: 'Natriumfluorid' } },
  { id: 'NaBr', formula: 'NaBr', cation: 'Na+', anion: 'Br-', lattice: 747, mp: 747, name: { en: 'sodium bromide', de: 'Natriumbromid' } },
  { id: 'NaI', formula: 'NaI', cation: 'Na+', anion: 'I-', lattice: 704, mp: 661, name: { en: 'sodium iodide', de: 'Natriumiodid' } },
  { id: 'LiF', formula: 'LiF', cation: 'Li+', anion: 'F-', lattice: 1036, mp: 845, name: { en: 'lithium fluoride', de: 'Lithiumfluorid' } },
  { id: 'MgO', formula: 'MgO', cation: 'Mg2+', anion: 'O2-', lattice: 3791, mp: 2852, name: { en: 'magnesium oxide', de: 'Magnesiumoxid' } },
  { id: 'CaO', formula: 'CaO', cation: 'Ca2+', anion: 'O2-', lattice: 3414, mp: 2613, name: { en: 'calcium oxide, quicklime', de: 'Calciumoxid, Branntkalk' } },
];
export const saltById = (id: string) => SALTS.find((x) => x.id === id)!;

/** The simple Coulomb estimate of how strongly a salt holds together: |q₊q₋| / (r₊ + r₋), relative to NaCl. */
export function coulombIndex(s: Salt): number {
  const c = IONS[s.cation], a = IONS[s.anion];
  const v = (x: Salt) => Math.abs(IONS[x.cation].q * IONS[x.anion].q) / (IONS[x.cation].r + IONS[x.anion].r);
  return Math.abs(c.q * a.q) / (c.r + a.r) / v(saltById('NaCl'));
}
