// Development harness: #/dev/box, #/dev/conduct, #/dev/hbond, #/dev/ladder, #/dev/bench, #/dev/energy mount one engine on its own
// (add ?compact=1; the ladder takes ?mode=equation|reaction, the energy view ?mode=bonds|hess|gibbs, both ?start=<id>).
// The mounted component is window.__dev, so a test can call show(...) and listen to events.
import { h } from './dom';
import { ParticleBoxUI } from '../sim/particleBoxUI';
import { ConductUI } from '../sim/conductUI';
import { HBondUI } from '../sim/hbondUI';
import { ZoomLadderUI } from '../sim/zoomLadderUI';
import { LabBenchUI } from '../sim/labBenchUI';
import { EnergyLandscapeUI } from '../sim/energyLandscapeUI';
import { onLeave } from './lifecycle';

type Mode = 'sample' | 'equation' | 'reaction';
const MAKERS: Record<string, (compact: boolean, p: URLSearchParams) => { el: HTMLElement; dispose: () => void }> = {
  box: (compact) => new ParticleBoxUI({ compact }),
  conduct: (compact) => new ConductUI({ compact }),
  hbond: (compact) => new HBondUI({ compact }),
  ladder: (compact, p) => new ZoomLadderUI({ compact, mode: (p.get('mode') as Mode | null) ?? 'sample', start: p.get('start') ?? undefined }),
  energy: (compact, p) => new EnergyLandscapeUI({ compact, mode: (p.get('mode') as 'bonds' | 'hess' | 'gibbs' | null) ?? 'bonds', start: p.get('start') ?? undefined }),
  bench: (compact, p) => new LabBenchUI({ compact, start: p.get('start') ?? 'CuSO4-5H2O' }),
};

export function renderDev(root: HTMLElement, name: string, params: URLSearchParams) {
  const make = MAKERS[name];
  if (!make) { root.append(h('p', null, `Unknown engine: ${name}`)); return; }
  const ui = make(params.get('compact') === '1', params);
  (window as unknown as { __dev: unknown }).__dev = ui;
  root.append(h('div', { class: 'stack', style: 'padding:12px' }, ui.el));
  onLeave(() => ui.dispose());
}
