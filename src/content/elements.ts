// Element model for the periodic table: data + names + facts, overlays and helpers.
import { ELEMENT_DATA, type ElementData, type Category } from './elementData';
import { ELEMENT_TEXT } from './elementText';
import type { Bi } from '../i18n';

export interface Element extends ElementData {
  de: string;
  fact: Bi;
  origin?: Bi;
  predicted: boolean;   // superheavy elements: properties are predictions
}

// Corrections on top of the generated data (reviewed against the sources):
// He and Ne carried van der Waals radii among bonded ones; use the calculated radii like the other noble gases.
// Francium's first ionization energy is 393 kJ/mol (4.07 eV), slightly above caesium's.
// IUPAC spells caesium with "ae".
const FIX: Record<number, Partial<ElementData>> = { 2: { r: 31 }, 10: { r: 38 }, 87: { ie: 393 }, 55: { en: 'Caesium' } };

/** Radii that are calculated (Clementi) rather than measured in compounds: the noble gases and astatine. */
export const CALCULATED_RADIUS = new Set<number>([2, 10, 18, 36, 54, 85, 86]);
/** Elements without stable isotopes: the table shows the mass number of the longest-lived isotope, not an average. */
export const NO_STANDARD_MASS = new Set<number>([43, 61, 84, 85, 86, 87, 88, 89, ...Array.from({ length: 26 }, (_, i) => 93 + i)]);

export const ELEMENTS: Element[] = ELEMENT_DATA.map((d0) => {
  const d = { ...d0, ...FIX[d0.z] };
  const tx = ELEMENT_TEXT[d.z];
  return { ...d, de: tx?.de ?? d.en, fact: tx?.fact ?? { en: '', de: '' }, origin: tx?.origin, predicted: d.z > 103 };
});
export const byZ = (z: number) => ELEMENTS[z - 1];
export const bySymbol = (s: string) => ELEMENTS.find((e) => e.s.toLowerCase() === s.toLowerCase());

/** The core set from unit 0: worth knowing by heart (H to Ca, plus the heavier halogens and noble gases). */
export const CORE = new Set<number>([...Array.from({ length: 20 }, (_, i) => i + 1), 35, 36, 53, 54]);

export function search(q: string): Element[] {
  const s = q.trim().toLowerCase();
  if (!s) return [];
  if (/^\d+$/.test(s)) { const e = byZ(+s); return e ? [e] : []; }
  const exact = ELEMENTS.filter((e) => e.s.toLowerCase() === s);
  const prefix = ELEMENTS.filter((e) => !exact.includes(e) && (e.en.toLowerCase().startsWith(s) || e.de.toLowerCase().startsWith(s)));
  const inner = ELEMENTS.filter((e) => !exact.includes(e) && !prefix.includes(e) && (e.en.toLowerCase().includes(s) || e.de.toLowerCase().includes(s)));
  return [...exact, ...prefix, ...inner].slice(0, 8);
}

/** Outer (valence) electrons for main-group elements; null for d- and f-block. */
export function outerElectrons(e: Element): number | null {
  if (e.z === 2) return 2;
  if (e.b === 's') return e.g;
  if (e.b === 'p') return e.g - 10;
  return null;
}

const SUP: Record<string, string> = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '+': '⁺', '-': '⁻' };
export const sup = (s: string) => s.split('').map((c) => SUP[c] ?? c).join('');
/** "[Ne] 3s2 3p5" -> "[Ne] 3s² 3p⁵" */
export const prettyConfig = (cfg: string) => cfg.replace(/(\d[spdf])(\d+)/g, (_, o, n) => o + sup(n));

const ion = (sym: string, q: number) => sym + (Math.abs(q) === 1 ? '' : sup(String(Math.abs(q)))) + (q > 0 ? '⁺' : '⁻');

/** Typical ion charge(s). Numbers are charges; strings explain why there is no simple ion. */
const SPECIAL: Record<string, number[] | 'covalent' | 'none'> = {
  H: [1, -1], B: 'covalent', C: 'covalent', Si: 'covalent', Ge: 'covalent', Sn: [2, 4], Pb: [2, 4], Sb: [3], Bi: [3], Po: [2, 4],
  Cr: [3], Mn: [2], Fe: [2, 3], Co: [2], Ni: [2], Cu: [1, 2], Zn: [2], Sc: [3], Ti: [4], Ag: [1], Cd: [2], Au: [1, 3], Hg: [1, 2], Pt: [2, 4], Pd: [2],
  Ce: [3, 4], Eu: [2, 3], Th: [4], U: [4, 6], Tl: [1, 3], Ga: [3], In: [3], Al: [3],
};
export function typicalIons(e: Element): { charges: number[]; note?: 'covalent' | 'none' | 'varies' } {
  const sp = SPECIAL[e.s];
  if (sp === 'covalent' || sp === 'none') return { charges: [], note: sp };
  if (sp) return { charges: sp };
  if (e.c === 'noble') return { charges: [], note: 'none' };
  if (e.c === 'lanthanide' || (e.c === 'actinide' && e.z <= 103 && e.z !== 90 && e.z !== 92)) return { charges: [3] };
  if (e.b === 's') return { charges: [e.g] };
  if (e.b === 'p' && !e.predicted) {
    const out = e.g - 10;
    if (out >= 5) return { charges: [out - 8] };
    if (out === 3) return { charges: [3] };
  }
  return { charges: [], note: 'varies' };
}
export const ionText = (e: Element) => typicalIons(e).charges.map((q) => ion(e.s, q)).join(', ');

// ---------- overlays ----------
export type OverlayId = 'category' | 'shells' | 'outer' | 'block' | 'mass' | 'chi' | 'radius' | 'ie' | 'ion' | 'met';
export interface Overlay {
  id: OverlayId;
  name: Bi;
  kind: 'cat' | 'num' | 'div' | 'mask';
  unit?: string;
  value?: (e: Element) => number | null;
  digits?: number;
  hue?: string;           // sequential scale end colour
}

export const CAT_COLOR: Record<Category, string> = {
  alkali: '#e58a6f', alkaline: '#e9b062', transition: '#8ea9dc', post: '#9fc9a8', metalloid: '#c8b673',
  nonmetal: '#76cfc4', noble: '#e3a2cf', lanthanide: '#d8c3a2', actinide: '#c79c88', unknown: '#7d86a6',
};
export const CAT_NAME: Record<Category, Bi> = {
  alkali: { en: 'Alkali metals', de: 'Alkalimetalle' },
  alkaline: { en: 'Alkaline earth metals', de: 'Erdalkalimetalle' },
  transition: { en: 'Transition metals', de: 'Übergangsmetalle' },
  post: { en: 'Other metals', de: 'Andere Metalle' },
  metalloid: { en: 'Metalloids', de: 'Halbmetalle' },
  nonmetal: { en: 'Nonmetals', de: 'Nichtmetalle' },
  noble: { en: 'Noble gases', de: 'Edelgase' },
  lanthanide: { en: 'Lanthanides', de: 'Lanthanoide' },
  actinide: { en: 'Actinides', de: 'Actinoide' },
  unknown: { en: 'Unknown', de: 'Unbekannt' },
};
export const BLOCK_COLOR: Record<string, string> = { s: '#e58a6f', p: '#76cfc4', d: '#8ea9dc', f: '#d8c3a2' };
export const ROW_COLOR = ['#5aa9ff', '#76cfc4', '#9fc9a8', '#e9b062', '#e58a6f', '#e3a2cf', '#b48cff'];

export const OVERLAYS: Overlay[] = [
  { id: 'category', name: { en: 'Families', de: 'Familien' }, kind: 'cat' },
  { id: 'shells', name: { en: 'Shells (rows)', de: 'Schalen (Zeilen)' }, kind: 'cat', value: (e) => e.sh.length },
  { id: 'outer', name: { en: 'Outer electrons (columns)', de: 'Außenelektronen (Spalten)' }, kind: 'cat', value: outerElectrons },
  { id: 'block', name: { en: 'Blocks s p d f', de: 'Blöcke s p d f' }, kind: 'cat' },
  { id: 'mass', name: { en: 'Atomic mass', de: 'Atommasse' }, kind: 'num', unit: 'u', value: (e) => e.m, digits: 1, hue: '#ece6d6' },
  { id: 'chi', name: { en: 'Electronegativity', de: 'Elektronegativität' }, kind: 'num', value: (e) => e.chi, digits: 2, hue: '#5aa9ff' },
  { id: 'radius', name: { en: 'Atom size', de: 'Atomgröße' }, kind: 'num', unit: 'pm', value: (e) => e.r, digits: 0, hue: '#b48cff' },
  { id: 'ie', name: { en: 'Ionization energy', de: 'Ionisierungsenergie' }, kind: 'num', unit: 'kJ/mol', value: (e) => e.ie, digits: 0, hue: '#ffc15e' },
  { id: 'ion', name: { en: 'Typical ion', de: 'Typisches Ion' }, kind: 'div', value: (e) => { const c = typicalIons(e).charges; return c.length === 1 ? c[0] : null; } },
  { id: 'met', name: { en: 'Met in lessons', de: 'Schon begegnet' }, kind: 'mask' },
];
export const overlayById = (id: OverlayId) => OVERLAYS.find((o) => o.id === id)!;

function mix(a: string, b: string, t: number): string {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  return '#' + pa.map((v, i) => Math.round(v + (pb[i] - v) * t).toString(16).padStart(2, '0')).join('');
}
const LOW = '#222d55';

/** Range of an overlay over all elements with a value. */
export function overlayRange(o: Overlay): [number, number] {
  const vals = ELEMENTS.map((e) => o.value?.(e)).filter((v): v is number => typeof v === 'number');
  return [Math.min(...vals), Math.max(...vals)];
}

/** Fill colour and 0–1 strength of an element under an overlay; null colour = no value. */
export function overlayColor(o: Overlay, e: Element, met?: Set<string>): { color: string | null; t: number } {
  switch (o.id) {
    case 'category': return { color: CAT_COLOR[e.c], t: 0.5 };
    case 'block': return { color: BLOCK_COLOR[e.b], t: 0.5 };
    case 'shells': return { color: ROW_COLOR[e.sh.length - 1] ?? '#7d86a6', t: e.sh.length / 7 };
    case 'outer': { const v = outerElectrons(e); return v === null ? { color: null, t: 0 } : { color: mix(LOW, '#76cfc4', 0.25 + 0.75 * (v / 8)), t: v / 8 }; }
    case 'met': return met?.has(e.s) ? { color: '#ffc15e', t: 1 } : { color: null, t: 0 };
    case 'ion': {
      const v = o.value!(e);
      if (v === null || v === undefined) return { color: null, t: 0 };
      if (v === 0) return { color: '#7d86a6', t: 0 };
      return { color: mix(LOW, v > 0 ? '#5aa9ff' : '#ff6b6b', 0.35 + 0.65 * Math.min(1, Math.abs(v) / 3)), t: Math.min(1, Math.abs(v) / 3) };
    }
    default: {
      const v = o.value!(e);
      if (v === null || v === undefined) return { color: null, t: 0 };
      const [lo, hi] = overlayRange(o);
      const t = (v - lo) / (hi - lo || 1);
      return { color: mix(LOW, o.hue!, 0.18 + 0.82 * t), t };
    }
  }
}
export { mix };
