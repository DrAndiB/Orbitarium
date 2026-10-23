// PLACEHOLDER: replaced by the Particle Box engine. Keep the exported names and the el / on / show / dispose surface.
import type { Show } from '../content/unitTypes';
import { h } from '../ui/dom';

export interface ParticleBoxUIOptions { compact?: boolean; [k: string]: unknown }

export class ParticleBoxUI {
  readonly el: HTMLElement;
  private listeners = new Map<string, Set<(...a: any[]) => void>>();
  constructor(_opts: ParticleBoxUIOptions = {}) { this.el = h('div', { class: 'workbench' }, 'Particle Box'); }
  on(evt: string, f: (...a: any[]) => void) { if (!this.listeners.has(evt)) this.listeners.set(evt, new Set()); this.listeners.get(evt)!.add(f); return () => this.listeners.get(evt)!.delete(f); }
  show(_s: Extract<Show, { engine: 'box' }>) { /* placeholder */ }
  dispose() { this.listeners.clear(); }
}
