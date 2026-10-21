// Bond data for the Charge Field (unit 5). Energies: OpenStax Chemistry 2e, Table 7.2 (kJ/mol, average bond
// energies). Lengths in pm: typical values (CRC Handbook); C=O from OpenStax Table 7.3. Na–Cl is the gas-phase
// NaCl molecule, which exists only in hot vapour; solid salt is a lattice (unit 4).
import type { Bi } from '../i18n';

export interface BondData { a: string; b: string; order: 1 | 2 | 3; length: number; energy: number; name: Bi; where?: Bi; }

export const BONDS: BondData[] = [
  { a: 'H', b: 'H', order: 1, length: 74, energy: 436, name: { en: 'hydrogen, H₂', de: 'Wasserstoff, H₂' } },
  { a: 'Cl', b: 'Cl', order: 1, length: 199, energy: 243, name: { en: 'chlorine, Cl₂', de: 'Chlor, Cl₂' } },
  { a: 'F', b: 'F', order: 1, length: 142, energy: 160, name: { en: 'fluorine, F₂', de: 'Fluor, F₂' } },
  { a: 'O', b: 'O', order: 2, length: 121, energy: 498, name: { en: 'oxygen, O₂', de: 'Sauerstoff, O₂' } },
  { a: 'N', b: 'N', order: 3, length: 110, energy: 946, name: { en: 'nitrogen, N₂', de: 'Stickstoff, N₂' } },
  { a: 'H', b: 'Cl', order: 1, length: 127, energy: 432, name: { en: 'hydrogen chloride, HCl', de: 'Chlorwasserstoff, HCl' } },
  { a: 'H', b: 'F', order: 1, length: 92, energy: 569, name: { en: 'hydrogen fluoride, HF', de: 'Fluorwasserstoff, HF' } },
  { a: 'C', b: 'H', order: 1, length: 109, energy: 415, name: { en: 'C–H, as in methane and oils', de: 'C–H, wie in Methan und Ölen' } },
  { a: 'O', b: 'H', order: 1, length: 96, energy: 464, name: { en: 'O–H, as in water', de: 'O–H, wie in Wasser' } },
  { a: 'N', b: 'H', order: 1, length: 101, energy: 390, name: { en: 'N–H, as in ammonia', de: 'N–H, wie in Ammoniak' } },
  { a: 'C', b: 'O', order: 1, length: 143, energy: 350, name: { en: 'C–O, as in alcohols', de: 'C–O, wie in Alkoholen' } },
  { a: 'C', b: 'O', order: 2, length: 123, energy: 741, name: { en: 'C=O, as in carbonyl groups', de: 'C=O, wie in Carbonylgruppen' } },
  { a: 'C', b: 'F', order: 1, length: 135, energy: 439, name: { en: 'C–F, as in non-stick coatings', de: 'C–F, wie in Antihaftbeschichtungen' } },
  { a: 'C', b: 'Cl', order: 1, length: 177, energy: 330, name: { en: 'C–Cl, as in dichloromethane', de: 'C–Cl, wie in Dichlormethan' } },
  { a: 'C', b: 'C', order: 1, length: 154, energy: 345, name: { en: 'C–C, as in ethane', de: 'C–C, wie in Ethan' } },
  { a: 'C', b: 'C', order: 2, length: 134, energy: 611, name: { en: 'C=C, as in ethene', de: 'C=C, wie in Ethen' } },
  { a: 'C', b: 'C', order: 3, length: 120, energy: 837, name: { en: 'C≡C, as in ethyne', de: 'C≡C, wie in Ethin' } },
  { a: 'Na', b: 'Cl', order: 1, length: 236, energy: 412, name: { en: 'Na–Cl, a single NaCl unit in hot vapour', de: 'Na–Cl, eine einzelne NaCl-Einheit im heißen Dampf' } },
];

/** A bond's data in either direction, or undefined. */
export const bondData = (a: string, b: string, order = 1) =>
  BONDS.find((x) => x.order === order && ((x.a === a && x.b === b) || (x.a === b && x.b === a)));

/** Pauling's estimate of ionic character from the electronegativity difference: 1 − e^(−Δχ²/4). A model, not a measurement. */
export const ionicCharacter = (dchi: number) => 1 - Math.exp(-(dchi * dchi) / 4);
/** The usual school bands: below 0.4 nonpolar, 0.4–1.8 polar, above 1.8 ionic. Rules of thumb, not sharp borders. */
export const band = (dchi: number): 'nonpolar' | 'polar' | 'ionic' => (Math.abs(dchi) < 0.4 ? 'nonpolar' : Math.abs(dchi) <= 1.8 ? 'polar' : 'ionic');
