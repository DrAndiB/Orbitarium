// Free lab: each engine becomes a sandbox once one of its units is done. One engine is open at a time.
import { h, clear } from './dom';
import { L, t } from '../i18n';
import { getState } from '../model/store';
import { WorkbenchUI } from '../sim/workbenchUI';
import { AtomUI } from '../sim/orbitalsUI';
import { LatticeUI } from '../sim/latticeUI';
import { BondUI } from '../sim/bondUI';
import { U2_IONS } from '../units/engines';
import { onLeave } from './lifecycle';
import { go } from '../router';

interface LabEngine { name: { en: string; de: string }; units: number[]; open: () => { el: HTMLElement; dispose: () => void }; }

const ENGINES: LabEngine[] = [
  { name: { en: 'Orbital Viewer', de: 'Orbital-Betrachter' }, units: [1, 2, 3], open: () => new AtomUI({ start: 11, maxZ: 36, ions: U2_IONS, controls: { view: true, stepper: true, boxes: true, shielding: true, ionize: true, spectrum: true } }) },
  { name: { en: 'Lattice Builder', de: 'Gitterbaukasten' }, units: [4], open: () => new LatticeUI({ start: 'NaCl' }) },
  { name: { en: 'Charge Field', de: 'Ladungsfeld' }, units: [5], open: () => new BondUI({ start: { a: 'H', b: 'Cl', order: 1 } }) },
  { name: { en: 'Molecule Workbench', de: 'Molekül-Werkbank' }, units: [6], open: () => new WorkbenchUI({ presets: ['CH4', 'NH3', 'H2O', 'NH4', 'CO2', 'HCN', 'BF3', 'CH2O', 'SO2', 'H2S', 'PCl3', 'CCl4', 'CHCl3', 'CH2Cl2'], start: 'NH3', controls: { builder: true } }) },
];

const COMING: { name: string; units: string; phase: number }[] = [
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
  const st = getState();
  const stage = h('div', { class: 'stack' });
  let current: { dispose: () => void } | null = null;
  onLeave(() => current?.dispose());
  for (const e of ENGINES) {
    const unlocked = e.units.some((n) => st.units[n]?.status === 'done');
    const first = e.units.find((n) => st.units[n]?.status !== 'done') ?? e.units[0];
    root.append(h('div', { class: 'panel', style: 'margin-bottom:12px' },
      h('h3', null, L(e.name), h('span', { class: 'muted small' }, ` · ${e.units.length > 1 ? L({ en: 'units', de: 'Einheiten' }) : L({ en: 'unit', de: 'Einheit' })} ${e.units.join(', ')}`)),
      unlocked
        ? h('button', { class: 'btn quiet block', type: 'button', onclick: () => {
          current?.dispose(); clear(stage);
          const ui = e.open(); current = ui;
          stage.append(h('h2', { style: 'margin:6px 0 10px' }, L(e.name)), ui.el);
          stage.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } }, L({ en: 'Open', de: 'Öffnen' }))
        : h('div', null, h('p', { class: 'muted small' }, t('labLocked')), h('button', { class: 'btn block', type: 'button', onclick: () => go(`#/unit/${first}`) }, t('startUnit', { n: first })))));
  }
  root.append(stage);
  root.append(h('h3', { style: 'margin:26px 0 10px' }, L({ en: 'Engines still to come', de: 'Engines, die noch kommen' })),
    h('ul', { class: 'concept-list' }, COMING.map((c) => h('li', null, h('span', null, c.name, h('span', { class: 'muted small' }, ` · ${L({ en: 'units', de: 'Einheiten' })} ${c.units}`)), h('span', null, L({ en: `phase ${c.phase}`, de: `Phase ${c.phase}` }))))));
}
