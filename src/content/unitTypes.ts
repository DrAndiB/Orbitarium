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
 */
export type Show =
  | { engine: 'atom'; z: number; charge?: number; view?: 'shells' | 'clouds'; highlight?: string; pull?: number; jump?: [number, number]; size?: boolean }
  | { engine: 'lattice'; salt: string; compare?: string; mode?: 'transfer' | 'shift' | 'heat' | 'neighbours'; temp?: number }
  | { engine: 'bond'; a: string; b: string; order?: 1 | 2 | 3 };

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
