import type { Bi } from '../i18n';
import type { WorkbenchUI, WorkbenchUIOptions } from '../sim/workbenchUI';
import type { TableHandle, TableOptions } from '../ui/ptable';

/** Helpers a step gets from the player; anything created through them is disposed when the step changes. */
export interface StepCtx {
  unit: number;
  workbench(opts: WorkbenchUIOptions): WorkbenchUI;
  table(opts: TableOptions): TableHandle;
}
export type StepFn = (body: HTMLElement, enable: () => void, ctx: StepCtx) => void;
export interface UnitPlayer { n: number; title: Bi; steps: StepFn[]; }
