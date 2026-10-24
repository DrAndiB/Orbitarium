// PLACEHOLDER for the Lab Bench (unit 16; later 27, 29, 30, 32–34). The engine helper replaces this file and adds
// labBench.ts (+ .css), keeping the exported names, the options below and the event names in docs/process/batch-12-16.md.
import type { Show } from '../content/unitTypes';
import { h } from '../ui/dom';

export interface LabBenchUIOptions {
  /** Solute chips offered (SOLUTES ids). Default: all. */
  solutes?: string[];
  /** First solute. */
  start?: string;
  compact?: boolean;
  controls?: { dilute?: boolean; sample?: boolean; beaker?: boolean; zoom?: boolean };
}
type Fn = (...a: any[]) => void;

export class LabBenchUI {
  readonly el: HTMLElement;
  private handlers: Record<string, Fn[]> = {};
  constructor(public opts: LabBenchUIOptions = {}) {
    this.el = h('div', { class: 'panel' }, 'Lab Bench (placeholder)');
  }
  on(evt: string, f: Fn) { (this.handlers[evt] ??= []).push(f); }
  protected emit(evt: string, ...a: unknown[]) { for (const f of this.handlers[evt] ?? []) f(...a); }
  show(_s: Extract<Show, { engine: 'bench' }>) { /* placeholder */ }
  dispose() { this.handlers = {}; }
}
