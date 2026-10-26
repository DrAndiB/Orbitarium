// Thermodynamic data for module 5 (units 17–20): standard enthalpies of formation ΔfH° (kJ/mol), standard Gibbs
// energies of formation ΔfG° (kJ/mol) and standard molar entropies S° (J/(mol·K)) at 298.15 K and 1 bar.
// Source: OpenStax Chemistry 2e, Appendix G (fetched from the LibreTexts copy, 2026-10-26), except calcite:
// OpenStax lists −1220.0 / 110.0, which disagree with the CRC Handbook values used everywhere else
// (ΔfH −1207.6, ΔfG −1129.1, S° 91.7; CRC, as tabulated on chemeurope's standard-enthalpy table).
// Reaction values are never typed in: dH(), dS() and dG() compute them from this table, so engine and text agree.
// Average bond energies for unit 17 come from bonds.ts (OpenStax Table 7.2).
import type { Bi } from '../i18n';
import { BONDS } from './bonds';

export type Phase = 's' | 'l' | 'g' | 'aq';
export interface ThermoEntry { formula: string; phase: Phase; name: Bi; dHf: number; dGf: number; S: number; }

const T = (formula: string, phase: Phase, en: string, de: string, dHf: number, dGf: number, S: number): ThermoEntry =>
  ({ formula, phase, name: { en, de }, dHf, dGf, S });

/** Keyed "formula(phase)", e.g. "H2O(l)"; allotropes add a name: "C(graphite)", "C(diamond)". */
export const THERMO: Record<string, ThermoEntry> = {
  'C(graphite)': T('C', 's', 'graphite', 'Graphit', 0, 0, 5.740),
  'C(diamond)': T('C', 's', 'diamond', 'Diamant', 1.89, 2.90, 2.38),
  'CO(g)': T('CO', 'g', 'carbon monoxide', 'Kohlenstoffmonoxid', -110.52, -137.15, 197.7),
  'CO2(g)': T('CO2', 'g', 'carbon dioxide', 'Kohlenstoffdioxid', -393.51, -394.36, 213.8),
  'CH4(g)': T('CH4', 'g', 'methane', 'Methan', -74.6, -50.5, 186.3),
  'C2H6(g)': T('C2H6', 'g', 'ethane', 'Ethan', -84.0, -32.0, 229.2),
  'C3H8(g)': T('C3H8', 'g', 'propane', 'Propan', -103.8, -23.4, 270.3),
  'C2H4(g)': T('C2H4', 'g', 'ethene', 'Ethen', 52.4, 68.4, 219.3),
  'C2H5OH(l)': T('C2H5OH', 'l', 'ethanol', 'Ethanol', -277.6, -174.8, 160.7),
  'H2(g)': T('H2', 'g', 'hydrogen', 'Wasserstoff', 0, 0, 130.7),
  'H2O(l)': T('H2O', 'l', 'water (liquid)', 'Wasser (flüssig)', -285.83, -237.1, 70.0),
  'H2O(g)': T('H2O', 'g', 'water vapour', 'Wasserdampf', -241.82, -228.59, 188.8),
  'H2O2(l)': T('H2O2', 'l', 'hydrogen peroxide', 'Wasserstoffperoxid', -187.78, -120.35, 109.6),
  'O2(g)': T('O2', 'g', 'oxygen', 'Sauerstoff', 0, 0, 205.2),
  'N2(g)': T('N2', 'g', 'nitrogen', 'Stickstoff', 0, 0, 191.6),
  'NH3(g)': T('NH3', 'g', 'ammonia', 'Ammoniak', -45.9, -16.5, 192.8),
  'NO2(g)': T('NO2', 'g', 'nitrogen dioxide', 'Stickstoffdioxid', 33.2, 51.30, 240.1),
  'N2O4(g)': T('N2O4', 'g', 'dinitrogen tetroxide', 'Distickstofftetroxid', 11.1, 99.8, 304.4),
  'NH4NO3(s)': T('NH4NO3', 's', 'ammonium nitrate', 'Ammoniumnitrat', -365.56, -183.87, 151.08),
  'HCl(g)': T('HCl', 'g', 'hydrogen chloride', 'Chlorwasserstoff', -92.307, -95.299, 186.9),
  'Cl2(g)': T('Cl2', 'g', 'chlorine', 'Chlor', 0, 0, 223.1),
  'NaCl(s)': T('NaCl', 's', 'sodium chloride', 'Natriumchlorid', -411.2, -384.1, 72.1),
  'CaCO3(s)': T('CaCO3', 's', 'calcium carbonate (calcite)', 'Calciumcarbonat (Calcit)', -1207.6, -1129.1, 91.7),
  'CaO(s)': T('CaO', 's', 'calcium oxide (quicklime)', 'Calciumoxid (Branntkalk)', -634.9, -603.3, 38.1),
  'Ca(OH)2(s)': T('Ca(OH)2', 's', 'calcium hydroxide', 'Calciumhydroxid', -985.2, -897.5, 83.4),
  'Fe(s)': T('Fe', 's', 'iron', 'Eisen', 0, 0, 27.3),
  'Fe2O3(s)': T('Fe2O3', 's', 'iron(III) oxide', 'Eisen(III)-oxid', -824.2, -742.2, 87.40),
  'Al(s)': T('Al', 's', 'aluminium', 'Aluminium', 0, 0, 28.3),
  'Al2O3(s)': T('Al2O3', 's', 'aluminium oxide', 'Aluminiumoxid', -1676, -1582, 50.92),
  'SO2(g)': T('SO2', 'g', 'sulfur dioxide', 'Schwefeldioxid', -296.83, -300.1, 248.2),
  'SO3(g)': T('SO3', 'g', 'sulfur trioxide', 'Schwefeltrioxid', -395.72, -371.06, 256.76),
};

export interface Term { sp: string; c: number; }
export interface Reaction {
  id: string;
  name: Bi;
  reactants: Term[];
  products: Term[];
  /**
   * Species of a `fixed` reaction (H2O(s)) need not be in THERMO.
   * For changes of state measured at their own temperature (ice melting at 273.15 K), the table above does not
   * apply: the reaction carries its measured ΔH (kJ/mol) and ΔS (J/(mol·K)) and the source in a comment.
   */
  fixed?: { dH: number; dS: number };
}

const t = (c: number, sp: string): Term => ({ sp, c });
const R = (id: string, en: string, de: string, reactants: Term[], products: Term[], fixed?: Reaction['fixed']): Reaction =>
  ({ id, name: { en, de }, reactants, products, fixed });

export const REACTIONS: Reaction[] = [
  R('h2-burn-l', 'Hydrogen burns (liquid water)', 'Wasserstoff verbrennt (flüssiges Wasser)', [t(2, 'H2(g)'), t(1, 'O2(g)')], [t(2, 'H2O(l)')]),
  R('h2-burn-g', 'Hydrogen burns (water vapour)', 'Wasserstoff verbrennt (Wasserdampf)', [t(2, 'H2(g)'), t(1, 'O2(g)')], [t(2, 'H2O(g)')]),
  R('ch4-burn', 'Methane burns (liquid water)', 'Methan verbrennt (flüssiges Wasser)', [t(1, 'CH4(g)'), t(2, 'O2(g)')], [t(1, 'CO2(g)'), t(2, 'H2O(l)')]),
  R('ch4-burn-g', 'Methane burns (water vapour)', 'Methan verbrennt (Wasserdampf)', [t(1, 'CH4(g)'), t(2, 'O2(g)')], [t(1, 'CO2(g)'), t(2, 'H2O(g)')]),
  R('c3h8-burn', 'Propane burns', 'Propan verbrennt', [t(1, 'C3H8(g)'), t(5, 'O2(g)')], [t(3, 'CO2(g)'), t(4, 'H2O(l)')]),
  R('c2h5oh-burn', 'Ethanol burns', 'Ethanol verbrennt', [t(1, 'C2H5OH(l)'), t(3, 'O2(g)')], [t(2, 'CO2(g)'), t(3, 'H2O(l)')]),
  R('c-co2', 'Carbon burns to carbon dioxide', 'Kohlenstoff verbrennt zu Kohlenstoffdioxid', [t(1, 'C(graphite)'), t(1, 'O2(g)')], [t(1, 'CO2(g)')]),
  R('co-co2', 'Carbon monoxide burns', 'Kohlenstoffmonoxid verbrennt', [t(1, 'CO(g)'), t(0.5, 'O2(g)')], [t(1, 'CO2(g)')]),
  R('co-co2-x2', 'Carbon monoxide burns (whole numbers)', 'Kohlenstoffmonoxid verbrennt (ganze Zahlen)', [t(2, 'CO(g)'), t(1, 'O2(g)')], [t(2, 'CO2(g)')]),
  R('c-co', 'Carbon to carbon monoxide', 'Kohlenstoff zu Kohlenstoffmonoxid', [t(1, 'C(graphite)'), t(0.5, 'O2(g)')], [t(1, 'CO(g)')]),
  R('diamond-burn', 'Diamond burns', 'Diamant verbrennt', [t(1, 'C(diamond)'), t(1, 'O2(g)')], [t(1, 'CO2(g)')]),
  R('diamond-graphite', 'Diamond turns into graphite', 'Diamant wird zu Graphit', [t(1, 'C(diamond)')], [t(1, 'C(graphite)')]),
  R('nh3', 'Ammonia synthesis', 'Ammoniaksynthese', [t(1, 'N2(g)'), t(3, 'H2(g)')], [t(2, 'NH3(g)')]),
  R('hcl', 'Hydrogen and chlorine', 'Wasserstoff und Chlor', [t(1, 'H2(g)'), t(1, 'Cl2(g)')], [t(2, 'HCl(g)')]),
  R('ethene-h2', 'Ethene takes up hydrogen', 'Ethen nimmt Wasserstoff auf', [t(1, 'C2H4(g)'), t(1, 'H2(g)')], [t(1, 'C2H6(g)')]),
  R('caco3', 'Burning limestone', 'Kalkbrennen', [t(1, 'CaCO3(s)')], [t(1, 'CaO(s)'), t(1, 'CO2(g)')]),
  R('lime-slake', 'Slaking lime', 'Kalklöschen', [t(1, 'CaO(s)'), t(1, 'H2O(l)')], [t(1, 'Ca(OH)2(s)')]),
  R('no2-dimer', 'Brown NO₂ pairs up to colourless N₂O₄', 'Braunes NO₂ verbindet sich zu farblosem N₂O₄', [t(2, 'NO2(g)')], [t(1, 'N2O4(g)')]),
  R('so2-so3', 'Sulfur dioxide to sulfur trioxide (contact process)', 'Schwefeldioxid zu Schwefeltrioxid (Kontaktverfahren)', [t(2, 'SO2(g)'), t(1, 'O2(g)')], [t(2, 'SO3(g)')]),
  R('fe-rust', 'Iron oxidises (hand warmers)', 'Eisen oxidiert (Taschenwärmer)', [t(4, 'Fe(s)'), t(3, 'O2(g)')], [t(2, 'Fe2O3(s)')]),
  R('thermite', 'Thermite', 'Thermitreaktion', [t(2, 'Al(s)'), t(1, 'Fe2O3(s)')], [t(1, 'Al2O3(s)'), t(2, 'Fe(s)')]),
  R('h2o2', 'Hydrogen peroxide decomposes', 'Wasserstoffperoxid zerfällt', [t(2, 'H2O2(l)')], [t(2, 'H2O(l)'), t(1, 'O2(g)')]),
  R('water-boil', 'Water evaporates (from 25 °C data)', 'Wasser verdampft (Daten bei 25 °C)', [t(1, 'H2O(l)')], [t(1, 'H2O(g)')]),
  // Ice melting, measured at 0 °C: enthalpy of fusion 6.01 kJ/mol (OpenStax Chemistry 2e, section 10.3);
  // ΔS = 6010 J/mol ÷ 273.15 K = 22.0 J/(mol·K).
  R('ice-melt', 'Ice melts', 'Eis schmilzt', [t(1, 'H2O(s)')], [t(1, 'H2O(l)')], { dH: 6.01, dS: 22.0 }),
  // Water boiling, measured at 100 °C: enthalpy of vaporisation 40.65 kJ/mol (OpenStax Chemistry 2e, section 10.3);
  // ΔS = 40650 ÷ 373.15 = 108.9 J/(mol·K).
  R('water-boil-100', 'Water boils (measured at 100 °C)', 'Wasser siedet (gemessen bei 100 °C)', [t(1, 'H2O(l)')], [t(1, 'H2O(g)')], { dH: 40.65, dS: 108.9 }),
];
export const reaction = (id: string) => REACTIONS.find((r) => r.id === id);

const sum = (terms: Term[], f: (e: ThermoEntry) => number) => terms.reduce((s, x) => s + x.c * f(THERMO[x.sp]), 0);
/** Reaction enthalpy ΔrH° in kJ/mol (products minus reactants of ΔfH°). */
export function dH(id: string): number {
  const r = reaction(id)!;
  return r.fixed ? r.fixed.dH : sum(r.products, (e) => e.dHf) - sum(r.reactants, (e) => e.dHf);
}
/** Reaction entropy ΔrS° in J/(mol·K). */
export function dS(id: string): number {
  const r = reaction(id)!;
  return r.fixed ? r.fixed.dS : sum(r.products, (e) => e.S) - sum(r.reactants, (e) => e.S);
}
/** ΔrG = ΔrH − T·ΔrS in kJ/mol at temperature T (K), treating ΔH and ΔS as constant (a model; say so in text). */
export const dG = (id: string, T: number) => dH(id) - (T * dS(id)) / 1000;
/** Temperature (K) where ΔG changes sign, or null when ΔH and ΔS have opposite signs (never changes). */
export function crossover(id: string): number | null {
  const h = dH(id), s = dS(id);
  if (s === 0 || Math.sign(h) !== Math.sign(s)) return null;
  return (h * 1000) / s;
}

// ---------- unit 17: reactions counted bond by bond (bond keys as in bonds.ts: "H-H", "O=O", "N#N") ----------

export interface BondCount { bond: string; n: number; }
export interface BondReaction { id: string; name: Bi; broken: BondCount[]; formed: BondCount[]; /** REACTIONS id with the measured value, gas phase */ measured?: string; }
const b = (bond: string, n: number): BondCount => ({ bond, n });
export const BOND_REACTIONS: BondReaction[] = [
  { id: 'hcl', name: { en: 'H₂ + Cl₂ → 2 HCl', de: 'H₂ + Cl₂ → 2 HCl' }, broken: [b('H-H', 1), b('Cl-Cl', 1)], formed: [b('H-Cl', 2)], measured: 'hcl' },
  { id: 'h2o', name: { en: '2 H₂ + O₂ → 2 H₂O (gas)', de: '2 H₂ + O₂ → 2 H₂O (gasförmig)' }, broken: [b('H-H', 2), b('O=O', 1)], formed: [b('O-H', 4)], measured: 'h2-burn-g' },
  { id: 'nh3', name: { en: 'N₂ + 3 H₂ → 2 NH₃', de: 'N₂ + 3 H₂ → 2 NH₃' }, broken: [b('N#N', 1), b('H-H', 3)], formed: [b('N-H', 6)], measured: 'nh3' },
  { id: 'ch4', name: { en: 'CH₄ + 2 O₂ → CO₂ + 2 H₂O (gas)', de: 'CH₄ + 2 O₂ → CO₂ + 2 H₂O (gasförmig)' }, broken: [b('C-H', 4), b('O=O', 2)], formed: [b('C=O', 2), b('O-H', 4)], measured: 'ch4-burn-g' },
  { id: 'ethene', name: { en: 'C₂H₄ + H₂ → C₂H₆', de: 'C₂H₄ + H₂ → C₂H₆' }, broken: [b('C=C', 1), b('H-H', 1)], formed: [b('C-C', 1), b('C-H', 2)], measured: 'ethene-h2' },
  { id: 'hf', name: { en: 'H₂ + F₂ → 2 HF', de: 'H₂ + F₂ → 2 HF' }, broken: [b('H-H', 1), b('F-F', 1)], formed: [b('H-F', 2)] },
];
export const bondReaction = (id: string) => BOND_REACTIONS.find((r) => r.id === id);

/** Average bond energy in kJ/mol for a key like "H-H", "O=O", "N#N" (order from the separator), from bonds.ts. */
export function bondEnergy(key: string): number {
  const m = /^([A-Z][a-z]?)([-=#])([A-Z][a-z]?)$/.exec(key);
  if (!m) throw new Error(`Bad bond key: ${key}`);
  const order = m[2] === '-' ? 1 : m[2] === '=' ? 2 : 3;
  const bd = BONDS.find((x) => x.order === order && ((x.a === m[1] && x.b === m[3]) || (x.a === m[3] && x.b === m[1])));
  if (!bd) throw new Error(`No bond energy for ${key}`);
  return bd.energy;
}
/** Energy to break the bonds, energy released making the new ones, and the estimate ΔH = broken − formed (kJ/mol). */
export function bondEstimate(id: string) {
  const r = bondReaction(id)!;
  const tot = (xs: BondCount[]) => xs.reduce((s, x) => s + x.n * bondEnergy(x.bond), 0);
  const broken = tot(r.broken), formed = tot(r.formed);
  return { broken, formed, dH: broken - formed };
}
