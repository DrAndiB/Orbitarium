// Development harness: #/dev/box, #/dev/conduct, #/dev/hbond mount one engine on its own (add ?compact=1).
// The mounted component is window.__dev, so a test can call show(...) and listen to events.
import { h } from './dom';
import { ParticleBoxUI } from '../sim/particleBoxUI';
import { ConductUI } from '../sim/conductUI';
import { HBondUI } from '../sim/hbondUI';
import { onLeave } from './lifecycle';

const MAKERS: Record<string, (compact: boolean) => { el: HTMLElement; dispose: () => void }> = {
  box: (compact) => new ParticleBoxUI({ compact }),
  conduct: (compact) => new ConductUI({ compact }),
  hbond: (compact) => new HBondUI({ compact }),
};

export function renderDev(root: HTMLElement, name: string, params: URLSearchParams) {
  const make = MAKERS[name];
  if (!make) { root.append(h('p', null, `Unknown engine: ${name}`)); return; }
  const ui = make(params.get('compact') === '1');
  (window as unknown as { __dev: unknown }).__dev = ui;
  root.append(h('div', { class: 'stack', style: 'padding:12px' }, ui.el));
  onLeave(() => ui.dispose());
}
