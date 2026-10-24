// Free lab: each engine becomes a sandbox once one of its units is done. One engine is open at a time.
import { h, clear } from './dom';
import { L, t } from '../i18n';
import { getState } from '../model/store';
import { WorkbenchUI } from '../sim/workbenchUI';
import { AtomUI } from '../sim/orbitalsUI';
import { LatticeUI } from '../sim/latticeUI';
import { BondUI } from '../sim/bondUI';
import { ParticleBoxUI } from '../sim/particleBoxUI';
import { ConductUI } from '../sim/conductUI';
import { HBondUI } from '../sim/hbondUI';
import { ZoomLadderUI } from '../sim/zoomLadderUI';
import { LabBenchUI } from '../sim/labBenchUI';
import { U2_IONS, U8_SUBS, U9_SUBS, U11_MIXES, U12_SAMPLES, U13_SAMPLES, U14_EQS, U15_EQS, U16_SOLUTES } from '../units/engines';
import { onLeave } from './lifecycle';
import { go } from '../router';

interface LabEngine { name: { en: string; de: string }; units: number[]; open: () => { el: HTMLElement; dispose: () => void }; }

const ENGINES: LabEngine[] = [
  { name: { en: 'Orbital Viewer', de: 'Orbital-Betrachter' }, units: [1, 2, 3], open: () => new AtomUI({ start: 11, maxZ: 36, ions: U2_IONS, controls: { view: true, stepper: true, boxes: true, shielding: true, ionize: true, spectrum: true } }) },
  { name: { en: 'Lattice Builder', de: 'Gitterbaukasten' }, units: [4], open: () => new LatticeUI({ start: 'NaCl' }) },
  { name: { en: 'Charge Field', de: 'Ladungsfeld' }, units: [5], open: () => new BondUI({ start: { a: 'H', b: 'Cl', order: 1 } }) },
  { name: { en: 'Molecule Workbench', de: 'Molekül-Werkbank' }, units: [6], open: () => new WorkbenchUI({ presets: ['CH4', 'NH3', 'H2O', 'NH4', 'CO2', 'HCN', 'BF3', 'CH2O', 'SO2', 'H2S', 'PCl3', 'CCl4', 'CHCl3', 'CH2Cl2'], start: 'NH3', controls: { builder: true } }) },
  { name: { en: 'Conductivity tester', de: 'Leitfähigkeitsprüfer' }, units: [7], open: () => new ConductUI({ start: 'Cu' }) },
  { name: { en: 'Particle Box', de: 'Teilchenbox' }, units: [8, 9, 11], open: () => new ParticleBoxUI({ start: 'Br2', subs: [...new Set([...U8_SUBS, ...U9_SUBS, 'H2O', 'HF', 'NH3', 'CH3OH', 'C2H5OH', 'C4H9OH'])], temp: 20, controls: { compare: true, views: ['clouds', 'dipoles', 'hbonds'], whatIf: true, temp: true } }) },
  { name: { en: 'Hydrogen bonds', de: 'Wasserstoffbrücken' }, units: [10], open: () => new HBondUI({ start: 'H2O' }) },
  { name: { en: 'Water and mixing', de: 'Wasser und Mischen' }, units: [11], open: () => new ParticleBoxUI({ start: 'H2O', subs: ['H2O'], temp: 20, mixes: [...U11_MIXES, 'CH3OH', 'CH3COCH3', 'C6H13OH'], controls: { compare: false, views: ['hbonds'], temp: true } }) },
  { name: { en: 'Zoom Ladder: samples', de: 'Zoom-Leiter: Stoffproben' }, units: [12, 13], open: () => new ZoomLadderUI({ mode: 'sample', start: 'H2O', grams: 18, samples: [...new Set([...U12_SAMPLES, ...U13_SAMPLES])], controls: { compare: true, breakdown: true } }) },
  { name: { en: 'Zoom Ladder: equations', de: 'Zoom-Leiter: Reaktionsgleichungen' }, units: [14], open: () => new ZoomLadderUI({ mode: 'equation', start: 'ch4', equations: [...new Set([...U14_EQS, 'c3h8', 'al2o3', 'fe2o3', 'nacl', 'caco3', 'zn', 'photo', 'glucose'])], controls: { trap: true } }) },
  { name: { en: 'Zoom Ladder: reactions', de: 'Zoom-Leiter: Reaktionen' }, units: [15], open: () => new ZoomLadderUI({ mode: 'reaction', start: 'nh3', equations: [...new Set([...U15_EQS, 'c3h8', 'al2o3', 'nacl', 'zn'])], controls: { yield: true } }) },
  { name: { en: 'Lab Bench', de: 'Labortisch' }, units: [16], open: () => new LabBenchUI({ start: 'CuSO4-5H2O', solutes: U16_SOLUTES, controls: { dilute: true, sample: true, beaker: true, zoom: true } }) },
];

const COMING: { name: string; units: string; phase: number }[] = [
  { name: 'Energy Landscape', units: '17, 18, 20, 23', phase: 2 },
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
