// Data for module 4 (the mole, units 12–16): the Zoom Ladder's samples and equations, and the Lab Bench's solutes.
// Molar masses are never typed in: molarMass() adds up the atomic masses from elements.ts (IUPAC standard atomic
// weights, conventional values), so the ladder, the bench and every unit agree to the last digit.
// N_A is exact by definition since the 2019 SI revision (BIPM, SI Brochure 9th edition, 2019).
import type { Bi } from '../i18n';
import { bySymbol } from './elements';

/** Avogadro constant, particles per mole (exact). */
export const N_A = 6.02214076e23;

/**
 * Atoms per formula: 'H2O' → { H: 2, O: 1 }, 'Ca(OH)2' → { Ca: 1, O: 2, H: 2 }, 'CuSO4·5H2O' → { Cu: 1, S: 1, O: 9, H: 10 }.
 * Brackets nest; '·' (or '.') joins a hydrate, with an optional leading count for the part after it.
 */
export function parseFormula(f: string): Record<string, number> {
  const out: Record<string, number> = {};
  const add = (from: Record<string, number>, k: number) => { for (const [el, n] of Object.entries(from)) out[el] = (out[el] ?? 0) + n * k; };
  for (const part of f.split(/[·.]/)) {
    const m = /^(\d+)(.*)$/.exec(part);
    add(parseGroup(m ? m[2] : part), m ? Number(m[1]) : 1);
  }
  return out;
}

function parseGroup(f: string): Record<string, number> {
  const stack: Record<string, number>[] = [{}];
  let i = 0;
  const count = () => { const m = /^\d+/.exec(f.slice(i)); if (!m) return 1; i += m[0].length; return Number(m[0]); };
  while (i < f.length) {
    const ch = f[i];
    if (ch === '(') { stack.push({}); i++; continue; }
    if (ch === ')') {
      i++;
      const inner = stack.pop()!;
      const k = count();
      const top = stack[stack.length - 1];
      for (const [el, n] of Object.entries(inner)) top[el] = (top[el] ?? 0) + n * k;
      continue;
    }
    const m = /^[A-Z][a-z]?/.exec(f.slice(i));
    if (!m) throw new Error(`Bad formula: ${f}`);
    i += m[0].length;
    if (!bySymbol(m[0])) throw new Error(`Unknown element in ${f}: ${m[0]}`);
    const top = stack[stack.length - 1];
    top[m[0]] = (top[m[0]] ?? 0) + count();
  }
  if (stack.length !== 1) throw new Error(`Unbalanced brackets: ${f}`);
  return stack[0];
}

/** Atomic mass of one element in u (= its molar mass in g/mol), from elements.ts. */
export const atomicMass = (symbol: string) => bySymbol(symbol)!.m;

/** Molar mass in g/mol: the sum of count × atomic mass over the formula. */
export function molarMass(f: string): number {
  return Object.entries(parseFormula(f)).reduce((s, [el, n]) => s + n * atomicMass(el), 0);
}

/** Each element's mass share of the formula (0–1), in the order the formula lists them. */
export function massShares(f: string): { el: string; n: number; mass: number; share: number }[] {
  const M = molarMass(f);
  return Object.entries(parseFormula(f)).map(([el, n]) => ({ el, n, mass: n * atomicMass(el), share: (n * atomicMass(el)) / M }));
}

// ---------- Zoom Ladder samples (units 12, 13; 14 and 15 use the formulas in EQUATIONS) ----------

/**
 * What one particle of the sample is: a single atom (metals, carbon, sulfur), a molecule, or a formula unit of an
 * ionic compound (no molecules: the formula gives the ion ratio). The particle rung draws them that way.
 */
export type ParticleKind = 'atom' | 'molecule' | 'formula-unit';
export interface LadderSample { id: string; formula: string; name: Bi; kind: ParticleKind; }

const S = (id: string, formula: string, en: string, de: string, kind: ParticleKind): LadderSample => ({ id, formula, name: { en, de }, kind });

export const LADDER_SAMPLES: LadderSample[] = [
  // elements made of single atoms
  S('C', 'C', 'Carbon (graphite)', 'Kohlenstoff (Graphit)', 'atom'),
  S('Mg', 'Mg', 'Magnesium', 'Magnesium', 'atom'),
  S('Al', 'Al', 'Aluminium', 'Aluminium', 'atom'),
  S('S', 'S', 'Sulfur', 'Schwefel', 'atom'),
  S('Fe', 'Fe', 'Iron', 'Eisen', 'atom'),
  S('Cu', 'Cu', 'Copper', 'Kupfer', 'atom'),
  S('Ag', 'Ag', 'Silver', 'Silber', 'atom'),
  S('Au', 'Au', 'Gold', 'Gold', 'atom'),
  S('Pb', 'Pb', 'Lead', 'Blei', 'atom'),
  // elements made of molecules
  S('H2', 'H2', 'Hydrogen', 'Wasserstoff', 'molecule'),
  S('N2', 'N2', 'Nitrogen', 'Stickstoff', 'molecule'),
  S('O2', 'O2', 'Oxygen', 'Sauerstoff', 'molecule'),
  S('Cl2', 'Cl2', 'Chlorine', 'Chlor', 'molecule'),
  // molecular compounds
  S('H2O', 'H2O', 'Water', 'Wasser', 'molecule'),
  S('CO2', 'CO2', 'Carbon dioxide', 'Kohlenstoffdioxid', 'molecule'),
  S('CO', 'CO', 'Carbon monoxide', 'Kohlenstoffmonoxid', 'molecule'),
  S('CH4', 'CH4', 'Methane', 'Methan', 'molecule'),
  S('C2H4', 'C2H4', 'Ethene', 'Ethen', 'molecule'),
  S('NH3', 'NH3', 'Ammonia', 'Ammoniak', 'molecule'),
  S('C2H5OH', 'C2H5OH', 'Ethanol', 'Ethanol', 'molecule'),
  S('C6H12O6', 'C6H12O6', 'Glucose', 'Glucose', 'molecule'),
  S('C12H22O11', 'C12H22O11', 'Sucrose (table sugar)', 'Saccharose (Haushaltszucker)', 'molecule'),
  // ionic compounds: formula units
  S('NaCl', 'NaCl', 'Sodium chloride (table salt)', 'Natriumchlorid (Kochsalz)', 'formula-unit'),
  S('MgO', 'MgO', 'Magnesium oxide', 'Magnesiumoxid', 'formula-unit'),
  S('CaCO3', 'CaCO3', 'Calcium carbonate (chalk, limestone)', 'Calciumcarbonat (Kalk)', 'formula-unit'),
  S('Ca(OH)2', 'Ca(OH)2', 'Calcium hydroxide (slaked lime)', 'Calciumhydroxid (Löschkalk)', 'formula-unit'),
  S('Mg(OH)2', 'Mg(OH)2', 'Magnesium hydroxide (milk of magnesia)', 'Magnesiumhydroxid (Magnesiamilch)', 'formula-unit'),
  S('FeO', 'FeO', 'Iron(II) oxide (wüstite)', 'Eisen(II)-oxid (Wüstit)', 'formula-unit'),
  S('Fe2O3', 'Fe2O3', 'Iron(III) oxide (haematite)', 'Eisen(III)-oxid (Hämatit)', 'formula-unit'),
  S('Fe3O4', 'Fe3O4', 'Iron(II,III) oxide (magnetite)', 'Eisen(II,III)-oxid (Magnetit)', 'formula-unit'),
  S('FeS2', 'FeS2', 'Iron disulfide (pyrite)', 'Eisendisulfid (Pyrit)', 'formula-unit'),
  S('Al2O3', 'Al2O3', 'Aluminium oxide', 'Aluminiumoxid', 'formula-unit'),
  S('CuSO4-5H2O', 'CuSO4·5H2O', 'Copper(II) sulfate pentahydrate', 'Kupfer(II)-sulfat-Pentahydrat', 'formula-unit'),
];
export const ladderSample = (id: string) => LADDER_SAMPLES.find((x) => x.id === id);

// ---------- Equations (units 14, 15) ----------

export interface Species { f: string; c: number; }
export interface Equation {
  id: string;
  name: Bi;
  /** Balanced with the smallest whole-number coefficients. */
  reactants: Species[];
  products: Species[];
  /**
   * The tempting wrong fix for unit 14: changing a subscript instead of a coefficient. Changing species `i` on `side`
   * to `alt` makes the atom count work but is a different substance, `altName`.
   */
  trap?: { side: 'r' | 'p'; i: number; alt: string; altName: Bi };
}

const E = (id: string, en: string, de: string, reactants: Species[], products: Species[], trap?: Equation['trap']): Equation =>
  ({ id, name: { en, de }, reactants, products, trap });
const sp = (c: number, f: string): Species => ({ f, c });

export const EQUATIONS: Equation[] = [
  E('h2o', 'Hydrogen burns to water', 'Wasserstoff verbrennt zu Wasser', [sp(2, 'H2'), sp(1, 'O2')], [sp(2, 'H2O')],
    { side: 'p', i: 0, alt: 'H2O2', altName: { en: 'hydrogen peroxide', de: 'Wasserstoffperoxid' } }),
  E('mgo', 'Magnesium burns', 'Magnesium verbrennt', [sp(2, 'Mg'), sp(1, 'O2')], [sp(2, 'MgO')],
    { side: 'p', i: 0, alt: 'MgO2', altName: { en: 'magnesium peroxide', de: 'Magnesiumperoxid' } }),
  E('nacl', 'Sodium and chlorine make salt', 'Natrium und Chlor bilden Kochsalz', [sp(2, 'Na'), sp(1, 'Cl2')], [sp(2, 'NaCl')]),
  E('ch4', 'Methane (natural gas) burns', 'Methan (Erdgas) verbrennt', [sp(1, 'CH4'), sp(2, 'O2')], [sp(1, 'CO2'), sp(2, 'H2O')]),
  E('nh3', 'Ammonia synthesis (Haber–Bosch)', 'Ammoniaksynthese (Haber-Bosch)', [sp(1, 'N2'), sp(3, 'H2')], [sp(2, 'NH3')]),
  E('c3h8', 'Propane burns', 'Propan verbrennt', [sp(1, 'C3H8'), sp(5, 'O2')], [sp(3, 'CO2'), sp(4, 'H2O')]),
  E('c2h6', 'Ethane burns', 'Ethan verbrennt', [sp(2, 'C2H6'), sp(7, 'O2')], [sp(4, 'CO2'), sp(6, 'H2O')]),
  E('al2o3', 'Aluminium burns', 'Aluminium verbrennt', [sp(4, 'Al'), sp(3, 'O2')], [sp(2, 'Al2O3')]),
  E('fe2o3', 'Iron from its ore (blast furnace)', 'Eisen aus Erz (Hochofen)', [sp(1, 'Fe2O3'), sp(3, 'CO')], [sp(2, 'Fe'), sp(3, 'CO2')]),
  E('caco3', 'Burning limestone', 'Kalkbrennen', [sp(1, 'CaCO3')], [sp(1, 'CaO'), sp(1, 'CO2')]),
  E('photo', 'Photosynthesis (overall)', 'Fotosynthese (Gesamtgleichung)', [sp(6, 'CO2'), sp(6, 'H2O')], [sp(1, 'C6H12O6'), sp(6, 'O2')]),
  E('glucose', 'Glucose burns (respiration, overall)', 'Glucose wird veratmet (Gesamtgleichung)', [sp(1, 'C6H12O6'), sp(6, 'O2')], [sp(6, 'CO2'), sp(6, 'H2O')]),
  E('zn', 'Zinc dissolves in hydrochloric acid', 'Zink löst sich in Salzsäure', [sp(1, 'Zn'), sp(2, 'HCl')], [sp(1, 'ZnCl2'), sp(1, 'H2')]),
];
export const equation = (id: string) => EQUATIONS.find((x) => x.id === id);

/** Atoms of each element on one side for the given coefficients (in species order). */
export function sideCount(species: Species[], coeffs: number[]): Record<string, number> {
  const out: Record<string, number> = {};
  species.forEach((s, k) => { for (const [el, n] of Object.entries(parseFormula(s.f))) out[el] = (out[el] ?? 0) + n * (coeffs[k] ?? 0); });
  return out;
}

// ---------- Lab Bench solutes (unit 16) ----------

/**
 * `particles`: dissolved particles per formula unit (NaCl → Na⁺ + Cl⁻ = 2; glucose stays whole = 1). `tint`: the
 * solution's real colour (CSS hex) or null for colourless; the bench shades it by concentration as a model picture.
 */
export interface Solute { id: string; formula: string; name: Bi; particles: number; ions?: [string, string]; tint: string | null; }
export const SOLUTES: Solute[] = [
  { id: 'NaCl', formula: 'NaCl', name: { en: 'Sodium chloride', de: 'Natriumchlorid' }, particles: 2, ions: ['Na+', 'Cl-'], tint: null },
  { id: 'C6H12O6', formula: 'C6H12O6', name: { en: 'Glucose', de: 'Glucose' }, particles: 1, tint: null },
  { id: 'CuSO4-5H2O', formula: 'CuSO4·5H2O', name: { en: 'Copper(II) sulfate pentahydrate', de: 'Kupfer(II)-sulfat-Pentahydrat' }, particles: 2, ions: ['Cu2+', 'SO42-'], tint: '#2f8fd8' },
  { id: 'KMnO4', formula: 'KMnO4', name: { en: 'Potassium permanganate', de: 'Kaliumpermanganat' }, particles: 2, ions: ['K+', 'MnO4-'], tint: '#8e2a8e' },
];
export const solute = (id: string) => SOLUTES.find((x) => x.id === id);

/** Volumetric glassware on the bench (mL): flasks to make up to the mark, bulb pipettes to measure a portion. */
export const FLASKS = [50, 100, 250, 500, 1000];
export const PIPETTES = [1, 2, 5, 10, 20, 25, 50];
