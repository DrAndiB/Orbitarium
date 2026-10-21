// The Lattice Builder as a screen component: crystal, salt chips, actions, temperature, and the
// "charges ÷ distance" gauge that compares the simple model with measured lattice energies.
import { LatticeStage } from './lattice';
import { SALTS, IONS, saltById, coulombIndex, type Salt } from '../content/ions';
import { h, clear, chem } from '../ui/dom';
import { L, num } from '../i18n';
import { buzz } from '../platform';
import { touchElements } from '../model/learner';
import type { Show } from '../content/unitTypes';

export interface LatticeUIOptions {
  salts?: string[];
  start?: string;
  compact?: boolean;
  controls?: { transfer?: boolean; centre?: boolean; heat?: boolean; shift?: boolean; gauge?: boolean };
}
type Fn = (...a: any[]) => void;
const ionLabel = (id: string) => { const x = IONS[id]; return x.s + (Math.abs(x.q) > 1 ? Math.abs(x.q) : '') + (x.q > 0 ? '+' : '-'); };

export class LatticeUI {
  readonly el: HTMLElement;
  readonly stage: LatticeStage;
  private hud: HTMLElement;
  private chips: HTMLElement;
  private tempIn?: HTMLInputElement;
  private tempOut?: HTMLElement;
  private mpMark?: HTMLElement;
  private gauge?: HTMLElement;
  private actions: HTMLElement;
  private backBtn: HTMLButtonElement;
  /** the last two salts loaded, oldest first: the gauge compares them */
  history: string[] = [];
  private listeners = new Map<string, Set<Fn>>();

  constructor(opts: LatticeUIOptions = {}) {
    const c = { transfer: true, centre: true, heat: true, shift: true, gauge: true, ...opts.controls };
    const stageEl = h('div', { class: 'wb-stage' + (opts.compact ? ' compact' : '') });
    this.hud = h('div', { class: 'wb-hud lattice-hud' });
    stageEl.append(this.hud);
    this.el = h('div', { class: 'workbench lattice' }, stageEl);
    this.stage = new LatticeStage(stageEl, !!opts.compact);

    const ids = opts.salts ?? SALTS.map((s) => s.id);
    this.chips = h('div', { class: 'chip-row', role: 'group', 'aria-label': L({ en: 'Salt', de: 'Salz' }) });
    if (ids.length > 1) {
      for (const id of ids) this.chips.append(h('button', { class: 'chip', type: 'button', 'data-id': id, 'aria-pressed': 'false', onclick: () => this.load(id) }, chem(saltById(id).formula)));
      this.el.append(this.chips);
    }

    this.actions = h('div', { class: 'atom-buttons wrap' });
    if (c.transfer) this.actions.append(h('button', { class: 'btn small', type: 'button', onclick: () => { this.stage.playTransfer(); this.refresh(); buzz('light'); } }, L({ en: 'Make the ions', de: 'Ionen bilden' })));
    if (c.centre) this.actions.append(h('button', { class: 'btn small quiet', type: 'button', onclick: () => { this.stage.selectCentre(); this.refresh(); } }, L({ en: 'Show the centre ion', de: 'Das mittlere Ion zeigen' })));
    if (c.shift) this.actions.append(h('button', { class: 'btn small quiet', type: 'button', onclick: () => { this.setTemp(Math.min(this.stage.temp, 25)); this.stage.playShift(); this.refresh(); buzz('medium'); } }, L({ en: 'Shift a layer', de: 'Eine Schicht verschieben' })));
    this.backBtn = h('button', { class: 'btn small quiet', type: 'button', hidden: true, onclick: () => { this.stage.backToCrystal(); this.refresh(); } }, L({ en: 'Back to the crystal', de: 'Zurück zum Kristall' })) as HTMLButtonElement;
    this.actions.append(this.backBtn);
    if (this.actions.children.length > 1) this.el.append(this.actions);
    this.el.append(h('p', { class: 'muted small', style: 'margin:0' }, L({ en: 'Tap an ion to see which ions touch it. Ions are drawn a little smaller than they are, so you can see inside.', de: 'Tippe ein Ion an, um zu sehen, welche Ionen es berühren. Die Ionen sind etwas kleiner gezeichnet, als sie sind, damit man hineinsehen kann.' })));

    if (c.heat) this.el.append(this.heatPanel());
    if (c.gauge) { this.gauge = h('div', { class: 'panel gauge' }); this.el.append(this.gauge); }

    for (const evt of ['transfer-start', 'shift-start', 'transfer', 'neighbours', 'heat', 'phase', 'shift', 'crystal']) this.stage.on(evt, (...a: unknown[]) => { this.refresh(); this.emit(evt, ...a); });
    this.load(opts.start ?? ids[0]);
  }

  on(evt: string, f: Fn) { if (!this.listeners.has(evt)) this.listeners.set(evt, new Set()); this.listeners.get(evt)!.add(f); }
  private emit(evt: string, ...a: unknown[]) { this.listeners.get(evt)?.forEach((f) => f(...a)); }

  load(id: string) {
    this.stage.setSalt(id);
    this.history = [...this.history.filter((x) => x !== id), id].slice(-2);
    this.chips.querySelectorAll('.chip').forEach((b) => b.setAttribute('aria-pressed', String((b as HTMLElement).dataset.id === id)));
    if (this.tempIn) { this.tempIn.value = String(this.stage.temp); }
    const s = saltById(id);
    touchElements([IONS[s.cation].s, IONS[s.anion].s]);
    this.refresh();
    buzz('light');
    this.emit('salt', id);
  }

  /** Show what a reveal or worked example asks for. */
  show(sh: Extract<Show, { engine: 'lattice' }>) {
    if (sh.compare) { this.load(sh.compare); }
    this.load(sh.salt);
    if (sh.mode === 'transfer') this.stage.playTransfer();
    if (sh.mode === 'shift') this.stage.playShift();
    if (sh.mode === 'neighbours') this.stage.selectCentre();
    if (sh.mode === 'heat' || sh.temp !== undefined) this.setTemp(sh.temp ?? this.stage.salt.mp + 50);
    this.refresh();
  }

  setTemp(t: number) {
    this.stage.setTemp(t);
    if (this.tempIn) this.tempIn.value = String(t);
    this.refresh();
  }

  private heatPanel(): HTMLElement {
    this.tempOut = h('strong', { class: 'temp-out' });
    this.tempIn = h('input', { type: 'range', min: '0', max: '3000', step: '10', value: '25', 'aria-label': L({ en: 'Temperature in °C', de: 'Temperatur in °C' }) }) as HTMLInputElement;
    this.tempIn.addEventListener('input', () => { this.stage.setTemp(+this.tempIn!.value); this.refresh(); });
    this.mpMark = h('span', { class: 'mp-mark', 'aria-hidden': 'true' });
    return h('div', { class: 'wb-equation heat' },
      h('label', { class: 'wb-eq-head' }, h('span', null, L({ en: 'Temperature', de: 'Temperatur' })), this.tempOut),
      h('div', { class: 'range-wrap' }, this.tempIn, this.mpMark));
  }

  private refresh() {
    const st = this.stage, s = st.salt;
    clear(this.hud);
    const state = st.mode === 'transfer'
      ? L({ en: `${IONS[s.cation].s} gives ${IONS[s.cation].q === 1 ? 'one electron' : 'two electrons'} to ${IONS[s.anion].s}`, de: `${IONS[s.cation].s} gibt ${IONS[s.cation].q === 1 ? 'ein Elektron' : 'zwei Elektronen'} an ${IONS[s.anion].s} ab` })
      : st.mode === 'shift' ? L({ en: 'like charges side by side: they push apart', de: 'gleiche Ladungen nebeneinander: Sie stoßen sich ab' })
      : st.molten ? L({ en: 'molten: ions free to move', de: 'geschmolzen: Ionen frei beweglich' })
      : L({ en: 'solid: every ion held in place', de: 'fest: jedes Ion an seinem Platz' });
    this.hud.append(
      h('div', null, h('div', { class: 'wb-formula' }, chem(s.formula)), h('div', { class: 'muted small' }, L(s.name))),
      h('div', { class: 'lattice-legend' },
        h('div', null, h('i', { class: 'pos' }), chem(ionLabel(s.cation))), h('div', null, h('i', { class: 'neg' }), chem(ionLabel(s.anion))),
        h('div', { class: 'lattice-state' + (st.molten && st.mode === 'crystal' ? ' hot' : '') }, state)));
    this.backBtn.hidden = st.mode === 'crystal' && !st.selected;
    if (this.tempOut && this.tempIn) {
      this.tempOut.textContent = `${num(st.temp, 0)} °C`;
      this.tempIn.value = String(st.temp);
      const pct = Math.min(100, (s.mp / 3000) * 100);
      this.mpMark!.style.left = `calc(${pct}% )`;
      this.mpMark!.textContent = L({ en: `melts at ${num(s.mp, 0)} °C`, de: `Schmelzpunkt ${num(s.mp, 0)} °C` });
    }
    this.drawGauge();
  }

  private drawGauge() {
    if (!this.gauge) return;
    const salts: Salt[] = this.history.map(saltById);
    const idx = salts.map(coulombIndex), lat = salts.map((x) => x.lattice);
    const maxI = Math.max(...idx), maxL = Math.max(...lat);
    const bar = (v: number, max: number, cls: string) => h('span', { class: 'gbar ' + cls }, h('i', { style: `width:${Math.max(4, (v / max) * 100)}%` }));
    const col = (s: Salt, i: number) => {
      const c = IONS[s.cation], a = IONS[s.anion];
      return h('div', { class: 'gcol' + (s.id === this.stage.salt.id ? ' now' : '') },
        h('div', { class: 'gname' }, chem(s.formula)),
        h('div', { class: 'grow' }, h('span', { class: 'glab' }, L({ en: 'charges', de: 'Ladungen' })), h('span', null, `${c.q} × ${Math.abs(a.q)} = ${c.q * Math.abs(a.q)}`)),
        h('div', { class: 'grow' }, h('span', { class: 'glab' }, L({ en: 'distance', de: 'Abstand' })), h('span', null, `${c.r} + ${a.r} = ${c.r + a.r} pm`)),
        h('div', { class: 'grow' }, h('span', { class: 'glab' }, L({ en: 'model: charges ÷ distance', de: 'Modell: Ladungen ÷ Abstand' })), h('span', null, `${num(idx[i], 2)} × NaCl`)), bar(idx[i], maxI, 'model'),
        h('div', { class: 'grow' }, h('span', { class: 'glab' }, L({ en: 'measured lattice energy', de: 'gemessene Gitterenergie' })), h('span', null, `${num(s.lattice, 0)} kJ/mol`)), bar(lat[i], maxL, 'measured'),
        h('div', { class: 'grow' }, h('span', { class: 'glab' }, L({ en: 'melting point', de: 'Schmelzpunkt' })), h('span', null, `${num(s.mp, 0)} °C`)));
    };
    this.gauge.replaceChildren(
      h('div', { class: 'ob-head' }, h('strong', null, L({ en: 'How strongly the ions hold on', de: 'Wie stark die Ionen zusammenhalten' })),
        h('span', { class: 'muted small' }, salts.length > 1 ? L({ en: 'the last two salts you loaded', de: 'die letzten zwei geladenen Salze' }) : L({ en: 'load a second salt to compare', de: 'lade ein zweites Salz zum Vergleich' }))),
      h('p', { class: 'muted small', style: 'margin:0 0 8px' }, L({ en: 'In plain words: bigger charges and smaller ions hold on harder. The model multiplies the charges and divides by the distance between the ion centres.', de: 'In Worten: Größere Ladungen und kleinere Ionen halten stärker zusammen. Das Modell multipliziert die Ladungen und teilt durch den Abstand der Ionenmittelpunkte.' })),
      h('div', { class: 'gcols' }, ...salts.map(col)));
  }

  dispose() { this.stage.dispose(); }
}
