// PLACEHOLDER for the Energy Landscape (units 17, 18, 20; later 23). The engine helper replaces this file and adds
// energyLandscape.ts (+ .css), keeping the exported names, the options below and the events in docs/process/batch-17-20.md.
import type { Show } from '../content/unitTypes';
import { h } from '../ui/dom';

export interface EnergyLandscapeUIOptions {
  /** 'bonds' (unit 17), 'hess' (unit 18) or 'gibbs' (unit 20). */
  mode?: 'bonds' | 'hess' | 'gibbs';
  /** First reaction: a BOND_REACTIONS id in bonds mode, a REACTIONS id otherwise. */
  start?: string;
  /** Reaction chips offered (same id kind as start). */
  reactions?: string[];
  /** Hess mode: the step reactions offered for building a route to the target (REACTIONS ids). */
  steps?: string[];
  compact?: boolean;
  controls?: { measured?: boolean; elements?: boolean; temp?: boolean };
}
type Fn = (...a: any[]) => void;

export class EnergyLandscapeUI {
  readonly el: HTMLElement;
  private handlers: Record<string, Fn[]> = {};
  constructor(public opts: EnergyLandscapeUIOptions = {}) {
    this.el = h('div', { class: 'panel' }, 'Energy Landscape (placeholder)');
  }
  on(evt: string, f: Fn) { (this.handlers[evt] ??= []).push(f); }
  protected emit(evt: string, ...a: unknown[]) { for (const f of this.handlers[evt] ?? []) f(...a); }
  show(_s: Extract<Show, { engine: 'energy' }>) { /* placeholder */ }
  dispose() { this.handlers = {}; }
}
