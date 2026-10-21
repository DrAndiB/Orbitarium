// The Charge Field as a screen component: the 3D bond, presets, an atom picker, the Δχ scale with its three
// bands, bond length and energy, and a "what if" electronegativity dial.
import { BondStage, chiOf } from './bond';
import { bondData } from '../content/bonds';
import { h, s, clear } from '../ui/dom';
import { L, num, getLang } from '../i18n';
import { buzz } from '../platform';
import { touchElements } from '../model/learner';
import type { Show } from '../content/unitTypes';

export interface BondPreset { a: string; b: string; order: 1 | 2 | 3; }
export const BOND_PRESETS: BondPreset[] = [
  { a: 'H', b: 'H', order: 1 }, { a: 'Cl', b: 'Cl', order: 1 }, { a: 'F', b: 'F', order: 1 },
  { a: 'H', b: 'Cl', order: 1 }, { a: 'H', b: 'F', order: 1 }, { a: 'C', b: 'H', order: 1 }, { a: 'O', b: 'H', order: 1 }, { a: 'N', b: 'H', order: 1 },
  { a: 'C', b: 'O', order: 1 }, { a: 'C', b: 'O', order: 2 }, { a: 'O', b: 'O', order: 2 }, { a: 'N', b: 'N', order: 3 },
  { a: 'C', b: 'C', order: 1 }, { a: 'C', b: 'C', order: 2 }, { a: 'C', b: 'C', order: 3 }, { a: 'Na', b: 'Cl', order: 1 },
];
const PICK = ['H', 'C', 'N', 'O', 'F', 'Na', 'Cl'];
export const bondName = (a: string, b: string, order: number) => `${a}${order === 1 ? '–' : order === 2 ? '=' : '≡'}${b}`;
const BAND: Record<string, { en: string; de: string }> = {
  nonpolar: { en: 'nonpolar', de: 'unpolar' }, polar: { en: 'polar', de: 'polar' }, ionic: { en: 'ionic', de: 'ionisch' },
};

export interface BondUIOptions {
  start?: BondPreset;
  presets?: BondPreset[];
  compact?: boolean;
  controls?: { presets?: boolean; picker?: boolean; dial?: boolean; scale?: boolean };
}
type Fn = (...a: any[]) => void;

export class BondUI {
  readonly el: HTMLElement;
  readonly stage: BondStage;
  private hud: HTMLElement;
  private presetRow?: HTMLElement;
  private pickA?: HTMLElement;
  private pickB?: HTMLElement;
  private scale?: HTMLElement;
  private facts: HTMLElement;
  private dialIn?: HTMLInputElement;
  private dialOut?: HTMLElement;
  private dialName?: HTMLElement;
  private listeners = new Map<string, Set<Fn>>();

  constructor(opts: BondUIOptions = {}) {
    const c = { presets: true, picker: true, dial: true, scale: true, ...opts.controls };
    const stageEl = h('div', { class: 'wb-stage' + (opts.compact ? ' compact' : '') });
    this.hud = h('div', { class: 'wb-hud bond-hud' });
    stageEl.append(this.hud);
    this.el = h('div', { class: 'workbench bond' }, stageEl);
    this.stage = new BondStage(stageEl, !!opts.compact);

    if (c.presets) {
      this.presetRow = h('div', { class: 'chip-row', role: 'group', 'aria-label': L({ en: 'Bond', de: 'Bindung' }) });
      for (const p of opts.presets ?? BOND_PRESETS) this.presetRow.append(h('button', { class: 'chip', type: 'button', 'data-id': bondName(p.a, p.b, p.order), 'aria-pressed': 'false', onclick: () => this.load(p.a, p.b, p.order) }, bondName(p.a, p.b, p.order)));
      this.el.append(this.presetRow);
    }
    if (c.picker) {
      this.pickA = h('div', { class: 'chip-row' }); this.pickB = h('div', { class: 'chip-row' });
      for (const e of PICK) {
        this.pickA.append(h('button', { class: 'chip small', type: 'button', 'data-el': e, onclick: () => this.load(e, this.stage.b, this.defaultOrder(e, this.stage.b)) }, e));
        this.pickB.append(h('button', { class: 'chip small', type: 'button', 'data-el': e, onclick: () => this.load(this.stage.a, e, this.defaultOrder(this.stage.a, e)) }, e));
      }
      this.el.append(h('details', { class: 'bond-picker' }, h('summary', null, L({ en: 'Pick your own pair of atoms', de: 'Eigenes Atompaar wählen' })),
        h('div', { class: 'wb-build-label' }, L({ en: 'Left atom', de: 'Linkes Atom' })), this.pickA,
        h('div', { class: 'wb-build-label' }, L({ en: 'Right atom', de: 'Rechtes Atom' })), this.pickB));
    }
    if (c.scale) { this.scale = h('div', { class: 'panel dchi-panel' }); this.el.append(this.scale); }
    this.facts = h('div', { class: 'bond-facts' });
    this.el.append(this.facts);
    if (c.dial) this.el.append(this.dialPanel());

    this.stage.on('bond', () => this.refresh());
    const st = opts.start ?? { a: 'H', b: 'Cl', order: 1 };
    this.load(st.a, st.b, st.order);
  }

  on(evt: string, f: Fn) { if (!this.listeners.has(evt)) this.listeners.set(evt, new Set()); this.listeners.get(evt)!.add(f); }
  private emit(evt: string, ...a: unknown[]) { this.listeners.get(evt)?.forEach((f) => f(...a)); }

  private defaultOrder(a: string, b: string): 1 | 2 | 3 {
    if (bondData(a, b, 1)) return 1;
    if (bondData(a, b, 2)) return 2;
    if (bondData(a, b, 3)) return 3;
    return 1;
  }

  load(a: string, b: string, order: 1 | 2 | 3 = 1) {
    this.stage.setBond(a, b, order);
    if (this.dialIn) this.dialIn.value = String(chiOf(b));
    touchElements([a, b]);
    this.refresh();
    buzz('light');
    this.emit('bond', a, b, order, this.stage.dchi, this.stage.band);
  }

  show(sh: Extract<Show, { engine: 'bond' }>) { this.load(sh.a, sh.b, sh.order ?? 1); }

  private refresh() {
    const st = this.stage, name = bondName(st.a, st.b, st.order);
    this.presetRow?.querySelectorAll('.chip').forEach((x) => x.setAttribute('aria-pressed', String((x as HTMLElement).dataset.id === name || (x as HTMLElement).dataset.id === bondName(st.b, st.a, st.order))));
    this.pickA?.querySelectorAll('.chip').forEach((x) => x.setAttribute('aria-pressed', String((x as HTMLElement).dataset.el === st.a)));
    this.pickB?.querySelectorAll('.chip').forEach((x) => x.setAttribute('aria-pressed', String((x as HTMLElement).dataset.el === st.b)));
    const d = Math.abs(st.dchi);
    clear(this.hud);
    this.hud.append(
      h('div', null, h('div', { class: 'wb-formula' }, name), h('div', { class: 'muted small' }, bondData(st.a, st.b, st.order) ? L(bondData(st.a, st.b, st.order)!.name) : L({ en: 'your own pair', de: 'dein eigenes Paar' }))),
      h('div', { class: 'bond-chi' },
        h('div', null, `${L({ en: 'electronegativity', de: 'EN' })} ${st.a} ${num(st.chiA, 2)} · ${st.b} ${num(st.chiBNow, 2)}${st.chiB !== null ? ' *' : ''}`),
        h('div', { class: 'bond-dchi' }, `${L({ en: 'difference', de: 'ΔEN' })} ${num(d, 2)} · ${L(BAND[st.band])}`),
        d >= 0.15 ? h('div', { class: 'bond-delta muted' }, st.band === 'ionic' ? L({ en: '+ and −: the electron has all but moved over', de: '+ und −: das Elektron ist fast ganz hinübergewandert' }) : L({ en: 'δ− slightly negative · δ+ slightly positive', de: 'δ− leicht negativ · δ+ leicht positiv' })) : null));
    this.drawScale(d);
    const len = st.length, data = bondData(st.a, st.b, st.order);
    this.facts.replaceChildren(
      h('div', null, h('span', { class: 'muted small' }, L({ en: 'bond length', de: 'Bindungslänge' })), h('strong', null, `${len.measured ? '' : '≈ '}${len.pm} pm`)),
      h('div', null, h('span', { class: 'muted small' }, L({ en: 'bond energy', de: 'Bindungsenergie' })), h('strong', null, data ? `${num(data.energy, 0)} kJ/mol` : '–')),
      h('div', null, h('span', { class: 'muted small' }, L({ en: 'ionic character', de: 'Ionencharakter' })), h('strong', null, `≈ ${num(st.ionic * 100, 0)} %`)));
    if (this.dialOut) this.dialOut.textContent = L({ en: num(st.chiBNow, 2), de: `EN = ${num(st.chiBNow, 2)}` });
    if (this.dialName) this.dialName.textContent = st.b;
  }

  /** The Δχ scale from 0 to 3.3 with its three bands and a marker for the current bond. */
  private drawScale(d: number) {
    if (!this.scale) return;
    const W = 320, x = (v: number) => 10 + (Math.min(3.3, v) / 3.3) * (W - 20);
    const svg = s('svg', { viewBox: `0 0 ${W} 62`, class: 'dchi-scale', role: 'img', 'aria-label': `${L({ en: 'difference', de: 'ΔEN' })} ${d.toFixed(2)}` });
    const zone = (a: number, b: number, fill: string, label: string) => {
      svg.append(s('rect', { x: x(a), y: 18, width: x(b) - x(a), height: 14, fill, rx: 3 }));
      svg.append(s('text', { x: (x(a) + x(b)) / 2, y: 13, 'text-anchor': 'middle', 'font-size': 11, fill: '#9aa3bf' }, label));
    };
    zone(0, 0.4, '#2e3a69', L(BAND.nonpolar)); zone(0.4, 1.8, '#46507e', L(BAND.polar)); zone(1.8, 3.3, '#6a5f86', L(BAND.ionic));
    for (const t of [0, 0.4, 1.8, 3.3]) svg.append(s('text', { x: x(t), y: 46, 'text-anchor': 'middle', 'font-size': 10, fill: '#6f7aa0' }, num(t, 1)));
    // German textbooks often draw the ionic border at 1.7: mark it, so a learner sees both conventions
    if (getLang() === 'de') { svg.append(s('line', { x1: x(1.7), x2: x(1.7), y1: 16, y2: 34, stroke: '#9aa3bf', 'stroke-width': 1, 'stroke-dasharray': '2 2' })); svg.append(s('text', { x: x(1.7), y: 58, 'text-anchor': 'middle', 'font-size': 9, fill: '#9aa3bf' }, 'Schulbuch 1,7')); }
    svg.append(s('path', { d: `M${x(d)} 34 l-7 12 h14 Z`, fill: '#ffc15e' }));
    svg.append(s('line', { x1: x(d), x2: x(d), y1: 16, y2: 34, stroke: '#ffc15e', 'stroke-width': 2.5 }));
    this.scale.replaceChildren(
      h('div', { class: 'ob-head' }, h('strong', null, L({ en: 'Electronegativity difference (Δχ)', de: 'Elektronegativitätsdifferenz (ΔEN)' })), h('span', { class: 'muted small' }, L({ en: 'the borders are rules of thumb', de: 'die Grenzen sind Faustregeln; viele Schulbücher setzen sie bei 0,5 und 1,7' }))),
      svg);
  }

  private dialPanel(): HTMLElement {
    this.dialOut = h('strong');
    this.dialName = h('span');
    this.dialIn = h('input', { type: 'range', min: '0.5', max: '4.5', step: '0.01', value: '3.16', 'aria-label': L({ en: 'What-if electronegativity of the right atom', de: 'Was-wäre-wenn-EN des rechten Atoms' }) }) as HTMLInputElement;
    this.dialIn.addEventListener('input', () => {
      this.stage.setChiB(+this.dialIn!.value);
      this.refresh();
      this.emit('dial', +this.dialIn!.value, this.stage.dchi, this.stage.band);
    });
    const reset = h('button', { class: 'btn small quiet', type: 'button', onclick: () => { this.stage.setChiB(null); this.dialIn!.value = String(chiOf(this.stage.b)); this.refresh(); } }, L({ en: 'Real value', de: 'Echter Wert' }));
    return h('div', { class: 'wb-equation' },
      h('label', { class: 'wb-eq-head' }, h('span', null, L({ en: 'What if ', de: 'Was, wenn ' }), this.dialName, L({ en: ' pulled harder or weaker?', de: ' stärker oder schwächer zöge?' })), this.dialOut),
      this.dialIn,
      h('details', { class: 'wb-eq-more' }, h('summary', null, L({ en: 'How the cloud is drawn', de: 'Wie die Wolke gezeichnet wird' })),
        h('p', { class: 'wb-eq' }, L({ en: 'Share of the cloud near the stronger-pulling atom ≈ ½ + ½ × ionic character, with Pauling\'s estimate of the ionic character, 1 − e^(−Δχ²/4). A model, not a measurement.', de: 'Anteil der Wolke beim stärker ziehenden Atom ≈ ½ + ½ × Ionencharakter, mit Paulings Schätzung des Ionencharakters, 1 − e^(−ΔEN²/4). Ein Modell, keine Messung.' }))),
      reset);
  }

  dispose() { this.stage.dispose(); }
}
