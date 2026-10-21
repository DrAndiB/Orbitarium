// Free lab: each engine becomes a sandbox once its units are done.
import { h } from './dom';
import { L, t } from '../i18n';
import { getState } from '../model/store';
import { WorkbenchUI } from '../sim/workbenchUI';
import { onLeave } from './lifecycle';
import { go } from '../router';

const COMING: { name: string; units: string; phase: number }[] = [
  { name: 'Orbital Viewer', units: '1–3', phase: 1 },
  { name: 'Charge Field', units: '5', phase: 1 },
  { name: 'Lattice Builder', units: '4, 7', phase: 1 },
  { name: 'Particle Box', units: '8, 9, 11, …', phase: 1 },
  { name: 'Energy Landscape', units: '17, 18, 20, 23', phase: 2 },
  { name: 'Zoom Ladder', units: '12–15, 31', phase: 2 },
  { name: 'Lab Bench', units: '16, 27, …', phase: 2 },
];

export function renderLab(root: HTMLElement) {
  root.append(h('div', { class: 'topbar' }, h('h1', null, t('labTitle'))));
  root.append(h('div', { class: 'panel', style: 'margin-bottom:16px' }, h('h3', null, L({ en: 'Periodic Table', de: 'Periodensystem' })),
    h('p', { class: 'muted small' }, L({ en: 'Overlays, element cards and the 3D landscape, always open.', de: 'Ansichten, Elementkarten und die 3D-Landschaft, immer verfügbar.' })),
    h('button', { class: 'btn quiet block', type: 'button', onclick: () => go('#/table') }, L({ en: 'Open the table', de: 'Periodensystem öffnen' }))));
  const done = getState().units[6]?.status === 'done';
  if (!done) {
    root.append(h('div', { class: 'panel' }, h('h3', null, 'Molecule Workbench'), h('p', { class: 'muted' }, t('labLocked')),
      h('button', { class: 'btn block', type: 'button', onclick: () => go('#/unit/6') }, t('startUnit', { n: 6 }))));
  } else {
    const ui = new WorkbenchUI({ presets: ['CH4', 'NH3', 'H2O', 'NH4', 'CO2', 'HCN', 'BF3', 'CH2O', 'SO2', 'H2S', 'PCl3', 'CCl4', 'CHCl3', 'CH2Cl2'], start: 'NH3', controls: { builder: true } });
    onLeave(() => ui.dispose());
    root.append(h('h2', { style: 'margin:6px 0 10px' }, 'Molecule Workbench'), ui.el);
  }
  root.append(h('h3', { style: 'margin:26px 0 10px' }, L({ en: 'Engines still to come', de: 'Engines, die noch kommen' })),
    h('ul', { class: 'concept-list' }, COMING.map((c) => h('li', null, h('span', null, c.name, h('span', { class: 'muted small' }, ` · ${L({ en: 'units', de: 'Einheiten' })} ${c.units}`)), h('span', null, L({ en: `phase ${c.phase}`, de: `Phase ${c.phase}` }))))));
}
