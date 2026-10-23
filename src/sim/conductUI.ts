// The conduction view as a screen component (unit 7): the 3D cell, material chips, the battery switch, swapping the
// poles, heating salt past its melting point, and a log-scale meter of how well each material conducts.
import { ConductStage, lampLevel } from './conduct';
import { CONDUCTIVITY } from '../content/substances';
import type { ConductMaterial, Show } from '../content/unitTypes';
import { h, chem } from '../ui/dom';
import { L, num, getLang } from '../i18n';
import { buzz } from '../platform';
import './conduct.css';

export interface ConductUIOptions {
  start?: ConductMaterial;
  materials?: ConductMaterial[];
  compact?: boolean;
  controls?: { battery?: boolean; swap?: boolean; meter?: boolean };
}
type Fn = (...a: any[]) => void;

const DEFAULT: ConductMaterial[] = ['Cu', 'NaCl', 'NaCl-aq', 'sugar-aq', 'water'];
const CHIP: Record<ConductMaterial, { en: string; de: string }> = {
  Cu: { en: 'Copper', de: 'Kupfer' },
  NaCl: { en: 'Salt (solid)', de: 'Salz (fest)' },
  'NaCl-melt': { en: 'Salt (molten)', de: 'Salz (geschmolzen)' },
  'NaCl-aq': { en: 'Salt water', de: 'Salzwasser' },
  'sugar-aq': { en: 'Sugar water', de: 'Zuckerwasser' },
  water: { en: 'Pure water', de: 'Reines Wasser' },
};
/** What sits between the plates, in a few words. */
const WHAT: Record<ConductMaterial, { en: string; de: string }> = {
  Cu: { en: 'metal: atom cores and shared electrons', de: 'Metall: Atomrümpfe und gemeinsame Elektronen' },
  NaCl: { en: 'solid: every ion held in place', de: 'fest: jedes Ion an seinem Platz' },
  'NaCl-melt': { en: 'molten at over 801 °C: ions free to move', de: 'geschmolzen über 801 °C: Ionen frei beweglich' },
  'NaCl-aq': { en: 'dissolved: ions spread among water molecules', de: 'gelöst: Ionen zwischen Wassermolekülen verteilt' },
  'sugar-aq': { en: 'dissolved: whole sugar molecules, no charge', de: 'gelöst: ganze Zuckermoleküle, ohne Ladung' },
  water: { en: 'water molecules only', de: 'nur Wassermoleküle' },
};
const SUP: Record<string, string> = { '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' };
const sup = (n: number) => String(n).split('').map((c) => SUP[c] ?? c).join('');

/** A conductivity written for people: "about 360 S/m", "about 6 × 10⁷ S/m"; solid salt is below the scale. */
export function sigmaText(m: ConductMaterial): string {
  const v = CONDUCTIVITY[m].value;
  if (v < 1e-10) return L({ en: 'far below 10⁻¹⁰ S/m', de: 'weit unter 10⁻¹⁰ S/m' });
  const about = L({ en: 'about', de: 'etwa' });
  if (v >= 0.01 && v < 1e4) {
    const r = Number(v.toPrecision(2));
    return `${about} ${num(r, r < 10 && r % 1 ? 1 : 0)} S/m`;
  }
  const e = Math.floor(Math.log10(v));
  let mant = Number((v / 10 ** e).toPrecision(2));
  if (mant >= 10) { mant /= 10; }
  const mtxt = mant % 1 ? num(mant, 1) : num(mant, 0);
  return `${about} ${mtxt} ${getLang() === 'de' ? '·' : '×'} 10${sup(e)} S/m`;
}

export class ConductUI {
  readonly el: HTMLElement;
  readonly stage: ConductStage;
  private hud: HTMLElement;
  private status: HTMLElement;
  private chips?: HTMLElement;
  private powerBtn?: HTMLButtonElement;
  private swapBtn?: HTMLButtonElement;
  private heatBtn?: HTMLButtonElement;
  private meter?: HTMLElement;
  private note: HTMLElement;
  private materials: ConductMaterial[];
  private listeners = new Map<string, Set<Fn>>();

  constructor(opts: ConductUIOptions = {}) {
    const c = { battery: true, swap: true, meter: true, ...opts.controls };
    const compact = !!opts.compact;
    this.materials = opts.materials ?? DEFAULT;
    const stageEl = h('div', { class: 'wb-stage conduct-stage' + (compact ? ' compact' : '') });
    // text sits above and below the picture, not on it: the wires, lamp and poles need the whole stage
    this.hud = h('div', { class: 'conduct-head' });
    this.status = h('div', { class: 'conduct-status-row' });
    this.el = h('div', { class: 'workbench conduct' + (compact ? ' compact' : '') }, this.hud, stageEl, this.status);
    this.stage = new ConductStage(stageEl, compact);

    if (!compact && this.materials.length > 1) {
      this.chips = h('div', { class: 'chip-row wrap', role: 'group', 'aria-label': L({ en: 'Material', de: 'Stoff' }) });
      for (const m of this.materials) this.chips.append(h('button', { class: 'chip', type: 'button', 'data-id': m, 'aria-pressed': 'false', onclick: () => this.load(m) }, L(CHIP[m])));
      this.el.append(this.chips);
    }
    if (!compact) {
      const row = h('div', { class: 'atom-buttons wrap' });
      if (c.battery) {
        this.powerBtn = h('button', { class: 'btn small', type: 'button', onclick: () => { this.stage.setPower(!this.stage.power); buzz(this.stage.power ? 'medium' : 'light'); this.refresh(); } }) as HTMLButtonElement;
        row.append(this.powerBtn);
      }
      if (c.swap) {
        this.swapBtn = h('button', { class: 'btn small quiet', type: 'button', onclick: () => { this.stage.setReversed(!this.stage.reversed); buzz('light'); this.refresh(); } }, L({ en: 'Swap the poles', de: 'Pole tauschen' })) as HTMLButtonElement;
        row.append(this.swapBtn);
      }
      this.heatBtn = h('button', { class: 'btn small quiet', type: 'button', onclick: () => this.load(this.stage.material === 'NaCl' ? 'NaCl-melt' : 'NaCl') }) as HTMLButtonElement;
      row.append(this.heatBtn);
      this.el.append(row);
    }
    this.note = h('p', { class: 'muted small conduct-note', style: 'margin:0' });
    this.el.append(this.note);
    if (c.meter) { this.meter = h('div', { class: compact ? 'conduct-meter compact' : 'panel conduct-meter' }); this.el.append(this.meter); }

    for (const evt of ['material', 'power', 'reverse', 'drift', 'noCurrent']) this.stage.on(evt, (...a: unknown[]) => { this.refresh(); this.emit(evt, ...a); });
    this.load(opts.start ?? this.materials[0]);
  }

  on(evt: string, f: Fn) { if (!this.listeners.has(evt)) this.listeners.set(evt, new Set()); this.listeners.get(evt)!.add(f); return () => this.listeners.get(evt)!.delete(f); }
  private emit(evt: string, ...a: unknown[]) { this.listeners.get(evt)?.forEach((f) => f(...a)); }

  load(m: ConductMaterial) {
    if (m !== this.stage.material) this.stage.setMaterial(m);
    buzz('light');
    this.refresh();
  }

  /** Show what a reveal or worked example asks for. */
  show(sh: Extract<Show, { engine: 'conduct' }>) {
    if (sh.material !== this.stage.material) this.stage.setMaterial(sh.material);
    this.stage.setReversed(!!sh.reversed);
    this.stage.setPower(!!sh.on);
    this.refresh();
  }

  private refresh() {
    const st = this.stage, m = st.material, info = CONDUCTIVITY[m];
    const carriers = info.carriers === 'electrons' ? L({ en: 'electrons', de: 'Elektronen' })
      : info.carriers === 'ions' ? L({ en: 'ions', de: 'Ionen' }) : L({ en: 'none that can move', de: 'keine beweglichen' });
    const status = !st.power ? L({ en: 'battery off', de: 'Batterie aus' })
      : info.carriers === 'none' ? L({ en: 'practically no current', de: 'praktisch kein Strom' })
      : lampLevel(info.value) > 0.8 ? L({ en: 'current flows: lamp bright', de: 'Strom fließt: Lampe hell' }) : L({ en: 'current flows: lamp glows', de: 'Strom fließt: Lampe leuchtet' });
    const legend = h('div', { class: 'lattice-legend' });
    const dot = (cls: string, label: Node | string) => h('div', null, h('i', { class: cls }), label);
    if (m === 'Cu') legend.append(dot('pos', L({ en: 'atom cores (+)', de: 'Atomrümpfe (+)' })), dot('el', L({ en: 'electrons (−)', de: 'Elektronen (−)' })));
    else if (m === 'NaCl' || m === 'NaCl-melt' || m === 'NaCl-aq') legend.append(dot('pos', chem('Na+')), dot('neg', chem('Cl-')));
    if (m === 'sugar-aq') legend.append(dot('sugar', L({ en: 'sugar (no charge)', de: 'Zucker (ohne Ladung)' })));
    if (m === 'NaCl-aq' || m === 'sugar-aq' || m === 'water') legend.append(dot('water', L({ en: 'water', de: 'Wasser' })));
    this.hud.replaceChildren(
      h('div', { class: 'conduct-title' }, h('div', { class: 'wb-formula' }, L(info.name)), h('div', { class: 'muted small' }, L(WHAT[m]))),
      legend);
    this.status.replaceChildren(
      h('span', { class: 'conduct-carriers' }, L({ en: 'Charge carriers: ', de: 'Ladungsträger: ' }), h('strong', null, carriers)),
      h('span', { class: 'conduct-status' + (st.flowing ? ' on' : '') }, status));
    this.chips?.querySelectorAll('.chip').forEach((b) => {
      const id = (b as HTMLElement).dataset.id;
      b.setAttribute('aria-pressed', String(id === m || (id === 'NaCl' && m === 'NaCl-melt' && !this.materials.includes('NaCl-melt'))));
    });
    if (this.powerBtn) this.powerBtn.textContent = st.power ? L({ en: 'Disconnect the battery', de: 'Batterie trennen' }) : L({ en: 'Connect the battery', de: 'Batterie anschließen' });
    if (this.heatBtn) {
      this.heatBtn.style.display = m === 'NaCl' || m === 'NaCl-melt' ? '' : 'none';
      this.heatBtn.textContent = m === 'NaCl' ? L({ en: 'Heat past 801 °C', de: 'Über 801 °C erhitzen' }) : L({ en: 'Let it cool below 801 °C', de: 'Unter 801 °C abkühlen lassen' });
    }
    const note = m === 'water' ? L({ en: 'About one water molecule in 555 million is split into H₃O⁺ and OH⁻ ions, too few to light the lamp.', de: 'Etwa eines von 555 Millionen Wassermolekülen ist in H₃O⁺- und OH⁻-Ionen gespalten, zu wenige, um die Lampe leuchten zu lassen.' })
      : !st.power ? L({ en: 'Connect the battery and watch which particles drift, and which way.', de: 'Schließ die Batterie an und beobachte, welche Teilchen wandern und in welche Richtung.' })
      : info.carriers === 'electrons' ? L({ en: 'The electrons drift towards the + plate; the atom cores stay where they are.', de: 'Die Elektronen wandern zur Plusplatte; die Atomrümpfe bleiben an ihrem Platz.' })
      : info.carriers === 'ions' ? L({ en: 'Na⁺ drift to the − plate, Cl⁻ to the + plate: opposite charges attract.', de: 'Na⁺ wandern zur Minusplatte, Cl⁻ zur Plusplatte: Ungleiche Ladungen ziehen sich an.' })
      : m === 'NaCl' ? L({ en: 'The ions only vibrate in place: nothing drifts, so no current flows.', de: 'Die Ionen schwingen nur an ihrem Platz: Nichts wandert, also fließt kein Strom.' })
      : L({ en: 'The sugar molecules have no charge: nothing drifts, so no current flows.', de: 'Die Zuckermoleküle haben keine Ladung: Nichts wandert, also fließt kein Strom.' });
    this.note.textContent = note;
    this.drawMeter();
  }

  private drawMeter() {
    if (!this.meter) return;
    const m = this.stage.material;
    const lo = -8, hi = 8;
    const pct = (v: number) => Math.max(0, Math.min(100, ((Math.log10(v) - lo) / (hi - lo)) * 100));
    const value = h('div', { class: 'conduct-value' }, h('span', { class: 'muted small' }, L({ en: 'conducts ', de: 'Leitfähigkeit ' })), h('strong', null, sigmaText(m)));
    if (this.meter.classList.contains('compact')) { this.meter.replaceChildren(value); return; }
    // one row per material, best conductor first, each with a dot on the same log scale
    const axis = h('div', { class: 'cm-track cm-axis' });
    for (const e of [-8, -4, 0, 4, 8]) axis.append(h('span', { class: 'cm-tick', style: `left:${((e - lo) / (hi - lo)) * 100}%` }, e === 0 ? '1' : `10${sup(e)}`));
    const order: ConductMaterial[] = ['Cu', 'NaCl-melt', 'NaCl-aq', 'water', 'sugar-aq', 'NaCl'];
    const rows = order.map((id) => {
      const v = CONDUCTIVITY[id].value, below = v < 10 ** lo;
      return h('div', { class: 'cm-row' + (id === m ? ' now' : '') },
        h('span', { class: 'cm-name' }, L(CHIP[id])),
        h('span', { class: 'cm-track' }, h('i', { class: 'cm-dot' + (below ? ' below' : ''), style: `left:${pct(v)}%` }, below ? '◂' : '')));
    });
    this.meter.replaceChildren(
      h('div', { class: 'ob-head' }, h('strong', null, L({ en: 'How well it conducts', de: 'Wie gut es leitet' })),
        h('span', { class: 'muted small' }, L({ en: 'siemens per metre (S/m), each step ×10\u202f000', de: 'Siemens pro Meter (S/m), jeder Schritt ×10\u202f000' }))),
      value,
      h('div', { class: 'cm-grid' }, h('div', { class: 'cm-row cm-axis-row' }, h('span', { class: 'cm-name' }), axis), ...rows));
  }

  dispose() { this.listeners.clear(); this.stage.dispose(); }
}
