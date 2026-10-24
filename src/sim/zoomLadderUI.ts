// PLACEHOLDER for the Zoom Ladder (units 12–15). The engine helper replaces this file and adds zoomLadder.ts (+ .css),
// keeping the exported names, the options below and the event names in docs/process/batch-12-16.md.
import type { Show } from '../content/unitTypes';
import { h } from '../ui/dom';

export interface ZoomLadderUIOptions {
  /** 'sample' (units 12, 13; default), 'equation' (unit 14) or 'reaction' (unit 15). */
  mode?: 'sample' | 'equation' | 'reaction';
  /** First sample id (LADDER_SAMPLES) in sample mode, or first equation id (EQUATIONS) in the other modes. */
  start?: string;
  /** Sample chips offered (sample mode). Default: a short list chosen by the engine. */
  samples?: string[];
  /** Equation chips offered (equation and reaction modes). */
  equations?: string[];
  /** Grams on the balance at start (sample mode). */
  grams?: number;
  compact?: boolean;
  controls?: { compare?: boolean; breakdown?: boolean; trap?: boolean; yield?: boolean };
}
type Fn = (...a: any[]) => void;

export class ZoomLadderUI {
  readonly el: HTMLElement;
  private handlers: Record<string, Fn[]> = {};
  constructor(public opts: ZoomLadderUIOptions = {}) {
    this.el = h('div', { class: 'panel' }, 'Zoom Ladder (placeholder)');
  }
  on(evt: string, f: Fn) { (this.handlers[evt] ??= []).push(f); }
  protected emit(evt: string, ...a: unknown[]) { for (const f of this.handlers[evt] ?? []) f(...a); }
  show(_s: Extract<Show, { engine: 'ladder' }>) { /* placeholder */ }
  dispose() { this.handlers = {}; }
}
