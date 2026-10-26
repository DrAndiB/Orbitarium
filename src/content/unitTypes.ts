// The shape of a unit's content, shared by units 1–5 (and later units). Content is pure data:
// the player in src/units/ turns it into the seven steps and wires the engine.
import type { Bi } from '../i18n';
import type { ChoiceItem, RankItem, EstimateItem, FlawItem, Item } from './items';
import type { Idea, Extra, Reading, ExploreTask } from './unit06';
import type { Term } from './glossary';

/**
 * What the engine shows for a prediction reveal or a worked example. One shape per engine.
 * - atom (Orbital Viewer): element z, optionally as an ion (charge +2 = two electrons removed, −1 = one added),
 *   in the shells or clouds picture, with one subshell highlighted, n electrons pulled off one by one (unit 3),
 *   a hydrogen jump played (unit 1), or drawn at measured size (unit 2).
 * - lattice (Lattice Builder): one salt from SALTS (src/content/ions.ts); `compare` loads a second salt into the
 *   gauge; `mode` plays the electron transfer, shifts a layer, heats to `temp` °C or highlights one ion's neighbours.
 * - bond (Charge Field): a bond between atoms a and b with bond order 1–3.
 * - conduct (Lattice Builder, conduction view): one material between two electrodes; `on` connects the battery,
 *   `reversed` swaps the poles. Materials and conductivities: CONDUCTIVITY in src/content/substances.ts.
 * - box (Particle Box): substance `sub` (SUBSTANCES) at `temp` °C; `compare` puts a second box beside it at the
 *   same temperature; `view` overlays electron clouds (flickering dipoles), permanent dipoles or hydrogen bonds;
 *   `dipoleOff` is the what-if that removes a polar molecule's dipole; `mix` pours a second substance into the
 *   same box (unit 11: water with hexane, ethanol, 1-butanol, or 'NaCl' crystals).
 * - hbond (Molecule Workbench, hydrogen-bond view): molecule a alone, or a with partner b joined by the best
 *   hydrogen bond (`swap` gives the other direction where both work); `cluster` shows water with four neighbours.
 * - ladder (Zoom Ladder, units 12–15): one sample seen on four rungs, grams → moles → count → particles. Samples,
 *   equations and molar masses: src/content/stoich.ts. Three uses, chosen by which fields are set:
 *   - sample (units 12, 13): `sub` (LADDER_SAMPLES id) with `grams` or `mol`; `compare` puts a second sample beside
 *     it with the same mass (`by: 'mass'`, default) or the same amount (`by: 'moles'`); `breakdown` opens the formula
 *     breakdown (atoms per particle, the molar-mass sum and each element's mass share).
 *   - equation (unit 14): `eq` (EQUATIONS id) with `coeffs` (one per species, reactants then products; missing =
 *     all 1); `trap` shows the subscript-change "fix" instead, labelled as a different substance.
 *   - reaction (unit 15): `eq` with `amounts` in mol, one per reactant; `react` runs it until one reactant runs out;
 *     `actual` (grams of the first product) adds the percent yield.
 *   `rung` sets the zoom level shown (default 'grams' for sample, 'particles' for equation and reaction).
 * - energy (Energy Landscape, units 17, 18, 20): one reaction (REACTIONS or BOND_REACTIONS ids, src/content/thermo.ts)
 *   as energy levels. `mode` 'bonds' (unit 17): reactants, the separated atoms high above, products; `stage` shows the
 *   bonds broken, the bonds formed, or both. 'hess' (unit 18): the reaction with its route via `steps` (REACTIONS ids, a
 *   leading "-" reverses one, a "2*" prefix doubles it) or via the elements (`route: 'elements'`). 'gibbs' (unit 20):
 *   ΔH, −T·ΔS and ΔG as bars at temperature `temp` (K), with the crossover temperature marked.
 * - bench (Lab Bench, unit 16): `solute` (SOLUTES id); `grams` weighed into a `flask` (mL) and, with `made`, filled to
 *   the mark; `water` instead dissolves the grams in that many mL of water in a beaker (not to a mark);
 *   `dilute` pipettes `pipette` mL of the made solution into a new flask of `flask` mL and fills to the mark;
 *   `sample` pours that many mL off into a beaker; `zoom` opens the particle inset.
 * - box `spread` (Particle Box, unit 19): `n` particles start in the left half behind a partition; `open` removes it;
 *   `mixed` starts a second gas in the right half (mixing).
 */
export type ConductMaterial = 'Cu' | 'NaCl' | 'NaCl-melt' | 'NaCl-aq' | 'sugar-aq' | 'water';
export type Rung = 'grams' | 'moles' | 'count' | 'particles';
export type Show =
  | { engine: 'atom'; z: number; charge?: number; view?: 'shells' | 'clouds'; highlight?: string; pull?: number; jump?: [number, number]; size?: boolean }
  | { engine: 'lattice'; salt: string; compare?: string; mode?: 'transfer' | 'shift' | 'heat' | 'neighbours'; temp?: number }
  | { engine: 'bond'; a: string; b: string; order?: 1 | 2 | 3 }
  | { engine: 'conduct'; material: ConductMaterial; on?: boolean; reversed?: boolean }
  | { engine: 'box'; sub: string; temp?: number; compare?: string; view?: 'plain' | 'clouds' | 'dipoles' | 'hbonds'; dipoleOff?: boolean; mix?: string;
      spread?: { n: number; open?: boolean; mixed?: boolean } }
  | { engine: 'hbond'; a: string; b?: string; swap?: boolean; cluster?: boolean }
  | { engine: 'ladder'; sub?: string; grams?: number; mol?: number; compare?: string; by?: 'mass' | 'moles'; breakdown?: boolean;
      eq?: string; coeffs?: number[]; trap?: boolean; amounts?: number[]; react?: boolean; actual?: number; rung?: Rung }
  | { engine: 'bench'; solute: string; grams?: number; flask?: number; made?: boolean; water?: number;
      dilute?: { pipette: number; flask: number }; sample?: number; zoom?: boolean }
  | { engine: 'energy'; reaction: string; mode?: 'bonds' | 'hess' | 'gibbs'; stage?: 'broken' | 'formed' | 'both';
      steps?: string[]; route?: 'direct' | 'steps' | 'elements'; temp?: number };

/** A small data table for the puzzle. Cells are plain strings (formulas in {{…}} allowed) or bilingual text. */
export interface DataTable {
  caption?: Bi;
  head: Bi[];
  rows: { cells: (string | Bi)[]; mystery?: boolean }[];
  /** Columns (0-based) to right-align as numbers. Decimal points become commas in German. */
  numeric?: number[];
}

export interface Prediction2 { item: ChoiceItem; show: Show; revealText: Bi; extra: Extra; }
export interface Example2 { title: Bi; tag: string; show: Show; numbers: { v: string; label: Bi }[]; body: Bi; soWhat: Bi; }

export interface UnitContent {
  n: number;
  title: Bi;
  /** One line under the warm-up: what the unit will explain. */
  lead: Bi;
  puzzle: {
    title: Bi;
    lead: Bi;
    data: DataTable;
    /** The clash: why the data is surprising, ending in the question. */
    clash: Bi;
    question: ChoiceItem;
    /** One line after answering, pointing to the explore step. */
    after: Bi;
  };
  explore: {
    title: Bi;
    intro: Bi;
    tasks: ExploreTask[];
    /** Short notes shown when a task is ticked, keyed by task id. */
    notes?: Record<string, Bi>;
    /** A quick check that appears once the key tasks are done. */
    check: ChoiceItem | RankItem | EstimateItem;
  };
  predictions: Prediction2[];
  examples: Example2[];
  flaw: FlawItem;
  /** Optional harder item, offered after confident correct predictions. Prefer one that makes the learner produce something. */
  deeper: Item;
  explain: { prompt: Bi; ideas: Idea[]; tightened: Bi };
  /** Glossary ids for the optional term pairs in the wrap-up. */
  terms: string[];
  readings: Reading[];
  /** Misconceptions this unit introduces; merged into MISCONCEPTIONS. */
  misconceptions: { id: string; name: Bi }[];
  /** Glossary terms this unit introduces; merged into GLOSSARY. */
  glossary: Record<string, Term>;
}
