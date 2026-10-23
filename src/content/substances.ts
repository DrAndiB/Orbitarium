// Molecular substances for the Particle Box (units 8, 9, 11) and the hydrogen-bond units (10, 11).
// Melting and boiling points in °C at 1 atm, molar masses in g/mol, dipole moments in debye (D):
// CRC Handbook of Chemistry and Physics and the NIST Chemistry WebBook. Electrons = total electron count of one
// molecule (what dispersion depends on). donors = H atoms on N, O or F; acceptors = lone pairs on N, O or F.
// mp null: no melting point at 1 atm (helium stays liquid). bp null with sublimes: goes straight to gas (CO₂).
import type { Bi } from '../i18n';

/** How the Particle Box draws one molecule. */
export type Look = 'ball' | 'pair' | 'chain' | 'branched' | 'polar' | 'water' | 'ion';

export interface Substance {
  id: string;
  formula: string;
  name: Bi;
  M: number;
  electrons: number;
  mp: number | null;
  bp: number | null;
  /** °C, for substances that go straight from solid to gas at 1 atm */
  sublimes?: number;
  dipole: number;
  donors: number;
  acceptors: number;
  look: Look;
  /** carbon atoms in a chain (alkanes, alcohols) */
  chain?: number;
  /** liquid density near room temperature (g/cm³), where it is used */
  density?: number;
  /** solubility in water at about 20 °C, g per 100 g water; Infinity = mixes in any ratio */
  solubility?: number;
}

const s = (id: string, formula: string, en: string, de: string, M: number, electrons: number, mp: number | null, bp: number | null, dipole: number, donors: number, acceptors: number, look: Look, extra: Partial<Substance> = {}): Substance =>
  ({ id, formula, name: { en, de }, M, electrons, mp, bp, dipole, donors, acceptors, look, ...extra });

export const SUBSTANCES: Substance[] = [
  // noble gases: single atoms, dispersion only
  s('He', 'He', 'helium', 'Helium', 4.00, 2, null, -268.9, 0, 0, 0, 'ball'),
  s('Ne', 'Ne', 'neon', 'Neon', 20.18, 10, -248.6, -246.1, 0, 0, 0, 'ball'),
  s('Ar', 'Ar', 'argon', 'Argon', 39.95, 18, -189.3, -185.8, 0, 0, 0, 'ball'),
  s('Kr', 'Kr', 'krypton', 'Krypton', 83.80, 36, -157.4, -153.4, 0, 0, 0, 'ball'),
  s('Xe', 'Xe', 'xenon', 'Xenon', 131.29, 54, -111.8, -108.1, 0, 0, 0, 'ball'),
  // halogens: two-atom molecules, dispersion only
  s('F2', 'F2', 'fluorine', 'Fluor', 38.00, 18, -219.7, -188.1, 0, 0, 0, 'pair'),
  s('Cl2', 'Cl2', 'chlorine', 'Chlor', 70.90, 34, -101.5, -34.0, 0, 0, 0, 'pair'),
  s('Br2', 'Br2', 'bromine', 'Brom', 159.81, 70, -7.2, 58.8, 0, 0, 0, 'pair'),
  s('I2', 'I2', 'iodine', 'Iod', 253.81, 106, 113.7, 184.3, 0, 0, 0, 'pair'),
  // alkanes: chains of carbon with hydrogen, nearly nonpolar
  s('CH4', 'CH4', 'methane', 'Methan', 16.04, 10, -182.5, -161.5, 0, 0, 0, 'ball'),
  s('C2H6', 'C2H6', 'ethane', 'Ethan', 30.07, 18, -182.8, -88.6, 0, 0, 0, 'chain', { chain: 2 }),
  s('C3H8', 'C3H8', 'propane', 'Propan', 44.10, 26, -187.7, -42.1, 0.08, 0, 0, 'chain', { chain: 3 }),
  s('C4H10', 'C4H10', 'butane', 'Butan', 58.12, 34, -138.3, -0.5, 0, 0, 0, 'chain', { chain: 4 }),
  s('C5H12', 'C5H12', 'pentane', 'Pentan', 72.15, 42, -129.7, 36.1, 0, 0, 0, 'chain', { chain: 5, density: 0.626 }),
  s('neoC5H12', 'C(CH3)4', 'neopentane', 'Neopentan', 72.15, 42, -16.6, 9.5, 0, 0, 0, 'branched', { chain: 5 }),
  s('C6H14', 'C6H14', 'hexane', 'Hexan', 86.18, 50, -95.3, 68.7, 0, 0, 0, 'chain', { chain: 6, density: 0.655, solubility: 0.001 }),
  s('C8H18', 'C8H18', 'octane', 'Octan', 114.23, 66, -56.8, 125.6, 0, 0, 0, 'chain', { chain: 8, density: 0.703 }),
  // small polar molecules
  s('CO2', 'CO2', 'carbon dioxide', 'Kohlenstoffdioxid', 44.01, 22, null, null, 0, 0, 0, 'pair', { sublimes: -78.5 }),
  s('HCl', 'HCl', 'hydrogen chloride', 'Chlorwasserstoff', 36.46, 18, -114.2, -85.1, 1.11, 0, 0, 'polar'),
  s('HBr', 'HBr', 'hydrogen bromide', 'Bromwasserstoff', 80.91, 36, -86.9, -66.8, 0.83, 0, 0, 'polar'),
  s('HI', 'HI', 'hydrogen iodide', 'Iodwasserstoff', 127.91, 54, -50.8, -35.4, 0.45, 0, 0, 'polar'),
  s('CH3CHO', 'CH3CHO', 'acetaldehyde (ethanal)', 'Acetaldehyd (Ethanal)', 44.05, 24, -123.4, 20.2, 2.75, 0, 2, 'polar'),
  s('CH3COCH3', 'CH3COCH3', 'acetone (propanone)', 'Aceton (Propanon)', 58.08, 32, -94.7, 56.1, 2.88, 0, 2, 'polar', { density: 0.784, solubility: Infinity }),
  s('CH3OCH3', 'CH3OCH3', 'dimethyl ether', 'Dimethylether', 46.07, 26, -141.5, -24.8, 1.30, 0, 2, 'polar'),
  // hydrogen-bonding molecules
  s('H2O', 'H2O', 'water', 'Wasser', 18.02, 10, 0, 100, 1.85, 2, 2, 'water', { density: 0.998 }),
  s('HF', 'HF', 'hydrogen fluoride', 'Fluorwasserstoff', 20.01, 10, -83.6, 19.5, 1.83, 1, 3, 'polar'),
  s('NH3', 'NH3', 'ammonia', 'Ammoniak', 17.03, 10, -77.7, -33.3, 1.47, 3, 1, 'polar'),
  s('CH3OH', 'CH3OH', 'methanol', 'Methanol', 32.04, 18, -97.6, 64.7, 1.70, 1, 2, 'polar', { chain: 1, density: 0.792, solubility: Infinity }),
  s('C2H5OH', 'C2H5OH', 'ethanol', 'Ethanol', 46.07, 26, -114.1, 78.4, 1.69, 1, 2, 'polar', { chain: 2, density: 0.789, solubility: Infinity }),
  s('C3H7OH', 'C3H7OH', '1-propanol', '1-Propanol', 60.10, 34, -126.2, 97.2, 1.68, 1, 2, 'polar', { chain: 3, solubility: Infinity }),
  s('C4H9OH', 'C4H9OH', '1-butanol', '1-Butanol', 74.12, 42, -89.8, 117.7, 1.66, 1, 2, 'polar', { chain: 4, density: 0.810, solubility: 7.7 }),
  s('C6H13OH', 'C6H13OH', '1-hexanol', '1-Hexanol', 102.17, 58, -44.6, 157.0, 1.65, 1, 2, 'polar', { chain: 6, solubility: 0.59 }),
  // hydrides of groups 14–17, for the boiling-point graph (unit 10)
  s('SiH4', 'SiH4', 'silane', 'Silan', 32.12, 18, -185, -111.9, 0, 0, 0, 'ball'),
  s('GeH4', 'GeH4', 'germane', 'German', 76.67, 36, -165, -88.5, 0, 0, 0, 'ball'),
  s('SnH4', 'SnH4', 'stannane', 'Stannan', 122.74, 54, -146, -52, 0, 0, 0, 'ball'),
  s('PH3', 'PH3', 'phosphine', 'Phosphan', 34.00, 18, -132.8, -87.7, 0.58, 0, 0, 'polar'),
  s('AsH3', 'AsH3', 'arsine', 'Arsan', 77.95, 36, -116.9, -62.5, 0.20, 0, 0, 'polar'),
  s('SbH3', 'SbH3', 'stibine', 'Stiban', 124.78, 54, -88, -17, 0.12, 0, 0, 'polar'),
  s('H2S', 'H2S', 'hydrogen sulfide', 'Schwefelwasserstoff', 34.08, 18, -85.5, -60.3, 0.97, 0, 0, 'polar'),
  s('H2Se', 'H2Se', 'hydrogen selenide', 'Selenwasserstoff', 80.98, 36, -65.7, -41.3, 0.62, 0, 0, 'polar'),
  s('H2Te', 'H2Te', 'hydrogen telluride', 'Tellurwasserstoff', 129.62, 54, -49, -2.2, 0.20, 0, 0, 'polar'),
];
export const substance = (id: string) => SUBSTANCES.find((x) => x.id === id)!;

/** Boiling-point groups for the hydride graph: period 2 first. */
export const HYDRIDE_ROWS: { group: number; ids: string[] }[] = [
  { group: 14, ids: ['CH4', 'SiH4', 'GeH4', 'SnH4'] },
  { group: 15, ids: ['NH3', 'PH3', 'AsH3', 'SbH3'] },
  { group: 16, ids: ['H2O', 'H2S', 'H2Se', 'H2Te'] },
  { group: 17, ids: ['HF', 'HCl', 'HBr', 'HI'] },
];

/** Water and ice (unit 11). Densities in g/cm³ at 0 °C. A hydrogen bond in water is about 20 kJ/mol; the O–H bond inside the molecule 464 kJ/mol (bonds.ts). */
export const WATER = { densityIce: 0.917, densityLiquid0: 0.9998, densityLiquid4: 1.0000, hBondEnergy: 20, maxHBonds: 4 };

/**
 * Electrical conductivity for the conduction view (unit 7), in S/m at about 25 °C unless noted. Copper and
 * ultrapure water: CRC Handbook; 1 mol/L NaCl solution: from its molar conductivity (about 86 S·cm²/mol);
 * molten NaCl near 850 °C: about 3.6 S/cm (Janz, molten-salt data); solid NaCl at room temperature: far below
 * 10⁻¹⁰ S/m. Sugar solution: practically that of the pure water it is made with.
 */
export const CONDUCTIVITY: Record<string, { value: number; carriers: 'electrons' | 'ions' | 'none'; name: Bi }> = {
  Cu: { value: 5.96e7, carriers: 'electrons', name: { en: 'copper', de: 'Kupfer' } },
  NaCl: { value: 1e-12, carriers: 'none', name: { en: 'solid sodium chloride', de: 'festes Natriumchlorid' } },
  'NaCl-melt': { value: 360, carriers: 'ions', name: { en: 'molten sodium chloride', de: 'geschmolzenes Natriumchlorid' } },
  'NaCl-aq': { value: 8.6, carriers: 'ions', name: { en: 'salt water (1 mol/L)', de: 'Salzlösung (1 mol/L)' } },
  'sugar-aq': { value: 6e-6, carriers: 'none', name: { en: 'sugar water', de: 'Zuckerlösung' } },
  water: { value: 5.5e-6, carriers: 'none', name: { en: 'pure water', de: 'reines Wasser' } },
};
