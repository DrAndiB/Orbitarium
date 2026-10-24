import type { Bi } from '../i18n';
import type { WorkbenchUI, WorkbenchUIOptions } from '../sim/workbenchUI';
import type { TableHandle, TableOptions } from '../ui/ptable';
import type { AtomUI, AtomUIOptions } from '../sim/orbitalsUI';
import type { LatticeUI, LatticeUIOptions } from '../sim/latticeUI';
import type { BondUI, BondUIOptions } from '../sim/bondUI';
import type { ParticleBoxUI, ParticleBoxUIOptions } from '../sim/particleBoxUI';
import type { ConductUI, ConductUIOptions } from '../sim/conductUI';
import type { HBondUI, HBondUIOptions } from '../sim/hbondUI';
import type { ZoomLadderUI, ZoomLadderUIOptions } from '../sim/zoomLadderUI';
import type { LabBenchUI, LabBenchUIOptions } from '../sim/labBenchUI';

/** Helpers a step gets from the player; anything created through them is disposed when the step changes. */
export interface StepCtx {
  unit: number;
  workbench(opts: WorkbenchUIOptions): WorkbenchUI;
  table(opts: TableOptions): TableHandle;
  atom(opts: AtomUIOptions): AtomUI;
  lattice(opts: LatticeUIOptions): LatticeUI;
  bond(opts: BondUIOptions): BondUI;
  box(opts: ParticleBoxUIOptions): ParticleBoxUI;
  conduct(opts: ConductUIOptions): ConductUI;
  hbond(opts: HBondUIOptions): HBondUI;
  ladder(opts: ZoomLadderUIOptions): ZoomLadderUI;
  bench(opts: LabBenchUIOptions): LabBenchUI;
}
export type StepFn = (body: HTMLElement, enable: () => void, ctx: StepCtx) => void;
export interface UnitPlayer { n: number; title: Bi; steps: StepFn[]; }
