// The Particle Box as a screen component: the 3D box (or two), substance chips, a second box to compare,
// views (electron clouds, dipoles, hydrogen bonds), the dipole what-if, mixing into water, the temperature
// slider with melting- and boiling-point marks, and a facts panel with the measured data. Unit 19: the spreading
// view (a partition, a live left/right count, a histogram and the ways to arrange N particles in two halves).
import './particleBox.css';
import { ParticleBoxStage, TWIN, MIXES, stateAt, pointsOf, SPREAD_NS, GAS_COLOR, waysOf, type MixId, type View, type PhaseState } from './particleBox';
import { sci, sup } from './zoomLadder';
import { substance, WATER, type Substance } from '../content/substances';
import { h, chem, clear } from '../ui/dom';
import { L, num, getLang, type Bi } from '../i18n';
import { buzz } from '../platform';
import { touchElements } from '../model/learner';
import type { Show } from '../content/unitTypes';

export interface ParticleBoxUIOptions {
  /** substance in box 1 (default: the first chip) */
  start?: string;
  /** substance in box 2 (opens the comparison) */
  compare?: string;
  /** chips for box 1 (and for "compare with") */
  subs?: string[];
  /** starting temperature in °C (default 20) */
  temp?: number;
  compact?: boolean;
  /** unit 11: what can be poured into the water (requires start 'H2O') */
  mixes?: string[];
  /** unit 19: start in the spreading view (with controls.spread the default is { n: 10 }) */
  spread?: { n: number; open?: boolean; mixed?: boolean };
  /** spread (unit 19): the "Spread out" chips and the spreading view's panel; it also makes views and whatIf default to off */
  controls?: { compare?: boolean; views?: ('clouds' | 'dipoles' | 'hbonds')[]; whatIf?: boolean; temp?: boolean; spread?: boolean };
}
type Fn = (...a: any[]) => void;

const DEFAULT_SUBS = ['He', 'Ne', 'Ar', 'Kr', 'Xe', 'F2', 'Cl2', 'Br2', 'I2', 'CH4', 'C2H6', 'C3H8', 'C4H10', 'C5H12', 'neoC5H12', 'C6H14', 'C8H18', 'CO2', 'HCl', 'HI', 'CH3CHO', 'CH3COCH3', 'CH3OCH3', 'H2O', 'CH3OH', 'C2H5OH'];
const STATE: Record<PhaseState, Bi> = { solid: { en: 'solid', de: 'fest' }, liquid: { en: 'liquid', de: 'flüssig' }, gas: { en: 'gas', de: 'gasförmig' } };
const VIEW_NAME: Record<View, Bi> = {
  plain: { en: 'Just the molecules', de: 'Nur die Moleküle' },
  clouds: { en: 'Electron clouds', de: 'Elektronenwolken' },
  dipoles: { en: 'Dipoles', de: 'Dipole' },
  hbonds: { en: 'Hydrogen bonds', de: 'Wasserstoffbrücken' },
};
const MIX_LABEL: Record<MixId, Bi | null> = { C6H14: null, C2H5OH: null, CH3OH: null, CH3COCH3: null, C4H9OH: null, C6H13OH: null, NaCl: null, ice: { en: 'ice', de: 'Eis' } };
const deg = (v: number) => `${num(v, Math.round(v) !== v ? 1 : 0).replace(/^-/, '−')} °C`;
const symbols = (f: string) => [...new Set(f.match(/[A-Z][a-z]?/g) ?? [])];

export class ParticleBoxUI {
  readonly el: HTMLElement;
  readonly stage: ParticleBoxStage;
  private hud: HTMLElement;
  private legend: HTMLElement;
  private facts: HTMLElement;
  private chips1?: HTMLElement;
  private chips2?: HTMLElement;
  private mixRow?: HTMLElement;
  private viewRow?: HTMLElement;
  private whatIf?: HTMLLabelElement;
  private whatIfIn?: HTMLInputElement;
  private tempIn?: HTMLInputElement;
  private tempOut?: HTMLElement;
  private marks?: HTMLElement;
  private dyn: HTMLElement;
  private stageEl: HTMLElement;
  private listeners = new Map<string, Set<Fn>>();
  private readonly compact: boolean;
  private mixOptions: MixId[];
  // ---- spreading view (unit 19) ----
  private heat?: HTMLElement;
  private markKey?: HTMLElement;
  private spreadRow?: HTMLElement;
  private sp?: {
    panel: HTMLElement; btn: HTMLButtonElement; mixIn: HTMLInputElement; mixLabel: HTMLElement; msg: HTMLElement;
    hist: HTMLElement; histBars: HTMLElement[]; histAxis: HTMLElement; histNote: HTMLElement;
    ways: HTMLDetailsElement; waysBody: HTMLElement; wayBars: HTMLElement[]; note: HTMLElement;
  };
  /** the live left/right count in the HUD */
  private split = h('div', { class: 'pbox-tag right pbox-split' });
  private splitNums: HTMLElement[] = [];
  /** the spreading view has been on at least once (until then nothing of it touches the ordinary box) */
  private spreadUsed = false;
  /** n and gas the panel's bars were built for */
  private builtFor = '';
  private lastAllLeft = 0;
  private hitUntil = 0;

  constructor(opts: ParticleBoxUIOptions = {}) {
    this.compact = !!opts.compact;
    const spreadCtl = !!opts.controls?.spread;
    const c = { compare: true, views: (spreadCtl ? [] : ['clouds', 'dipoles', 'hbonds']) as View[], whatIf: !spreadCtl, temp: true, spread: false, ...opts.controls };
    const subs = opts.subs ?? DEFAULT_SUBS;
    this.mixOptions = (opts.mixes ?? (opts.start === 'H2O' ? MIXES : [])).filter((m): m is MixId => (MIXES as string[]).includes(m));

    const stageEl = h('div', { class: 'wb-stage pbox-stage' + (this.compact ? ' compact' : '') });
    this.hud = h('div', { class: 'wb-hud pbox-hud' });
    this.legend = h('div', { class: 'pbox-legend', 'aria-live': 'polite' });
    stageEl.append(this.hud, this.legend);
    this.stageEl = stageEl;
    this.el = h('div', { class: 'workbench pbox' + (this.compact ? ' compact' : '') }, stageEl);
    this.stage = new ParticleBoxStage(stageEl, this.compact);
    this.dyn = h('div', { class: 'pbox-dyn muted small', 'aria-live': 'polite' });

    if (!this.compact) {
      if (subs.length > 1) {
        this.chips1 = this.chipRow(subs, (id) => this.load(1, id), { en: 'Substance', de: 'Stoff' });
        this.el.append(this.chips1);
      }
      if (c.compare && subs.length > 1) {
        this.chips2 = this.chipRow(subs, (id) => this.load(2, id), { en: 'Compare with', de: 'Vergleichen mit' }, true);
        this.el.append(this.chips2);
      }
      if (this.mixOptions.length) {
        this.mixRow = this.mixChips();
        this.el.append(this.mixRow);
      }
      if (c.spread) {
        this.spreadRow = this.spreadChips();
        this.el.append(this.spreadRow);
        this.spreadPanel();
      }
      if (c.views.length) {
        const views: View[] = ['plain', ...c.views];
        this.viewRow = h('div', { class: 'chip-row wrap pbox-views', role: 'group', 'aria-label': L({ en: 'What to show', de: 'Was gezeigt wird' }) },
          ...views.map((v) => h('button', { class: 'chip small', type: 'button', 'data-view': v, 'aria-pressed': String(v === 'plain'), onclick: () => this.setView(v) }, L(VIEW_NAME[v]))));
        this.el.append(this.viewRow);
      }
      if (c.whatIf) {
        this.whatIfIn = h('input', { type: 'checkbox', role: 'switch' }) as HTMLInputElement;
        this.whatIfIn.addEventListener('change', () => { this.stage.setDipoleOff(this.whatIfIn!.checked); buzz('light'); this.refresh(); });
        this.whatIf = h('label', { class: 'switch warn' }, this.whatIfIn, h('span', { class: 'switch-track', 'aria-hidden': 'true' }), h('span', { class: 'pbox-whatif-label' })) as HTMLLabelElement;
        this.el.append(this.whatIf);
      }
      if (c.temp) this.el.append(this.tempPanel());
    }
    this.facts = h('div', { class: this.compact ? 'pbox-facts-line' : 'panel pbox-facts' });
    this.el.append(this.facts);

    for (const evt of ['substance', 'temp', 'state', 'boil', 'melt', 'freeze', 'dipoleOff', 'mix', 'dissolved', 'hbonds', 'allLeft']) this.stage.on(evt, (...a: unknown[]) => { this.emit(evt, ...a); });
    this.stage.on('frame', () => this.refreshDynamic());
    this.stage.on('spreadFrame', () => this.refreshSpread());

    this.stage.temp = opts.temp ?? 20;
    this.load(1, opts.start ?? subs[0] ?? 'Ar', true);
    if (opts.compare) this.load(2, opts.compare, true);
    this.setTemp(this.stage.temp, true);
    const sp = opts.spread ?? (c.spread && !this.compact ? { n: 10 } : undefined);
    if (sp) this.enterSpread(sp.n, sp, opts.temp ?? 20);
  }

  on(evt: string, f: Fn) { if (!this.listeners.has(evt)) this.listeners.set(evt, new Set()); this.listeners.get(evt)!.add(f); return () => this.listeners.get(evt)!.delete(f); }
  private emit(evt: string, ...a: unknown[]) { this.listeners.get(evt)?.forEach((f) => f(...a)); }

  // ---------- controls ----------

  private chipRow(ids: string[], pick: (id: string | null) => void, label: Bi, withNone = false): HTMLElement {
    const row = h('div', { class: 'pbox-chiprow' },
      h('div', { class: 'pbox-row-label' }, L(label)),
      h('div', { class: 'chip-row', role: 'group', 'aria-label': L(label) },
        withNone ? h('button', { class: 'chip small', type: 'button', 'data-id': '', 'aria-pressed': 'true', onclick: () => pick(null) }, L({ en: 'none', de: 'keins' })) : null,
        ...ids.map((id) => h('button', { class: 'chip small', type: 'button', 'data-id': id, 'aria-pressed': 'false', title: L(substance(id).name), onclick: () => pick(id) }, chem(substance(id).formula)))));
    return row;
  }

  private mixChips(): HTMLElement {
    const label = { en: 'Pour into the water', de: 'Ins Wasser geben' };
    return h('div', { class: 'pbox-chiprow' },
      h('div', { class: 'pbox-row-label' }, L(label)),
      h('div', { class: 'chip-row', role: 'group', 'aria-label': L(label) },
        h('button', { class: 'chip small', type: 'button', 'data-mix': '', 'aria-pressed': 'true', onclick: () => this.setMix(null) }, L({ en: 'nothing', de: 'nichts' })),
        ...this.mixOptions.map((m) => h('button', { class: 'chip small', type: 'button', 'data-mix': m, 'aria-pressed': 'false', title: m === 'ice' ? L({ en: 'a piece of ice', de: 'ein Stück Eis' }) : m === 'NaCl' ? L({ en: 'sodium chloride, table salt', de: 'Natriumchlorid, Kochsalz' }) : L(substance(m).name), onclick: () => this.setMix(m) },
          MIX_LABEL[m] ? L(MIX_LABEL[m]!) : chem(m)))));
  }

  private tempPanel(): HTMLElement {
    this.tempOut = h('strong', { class: 'temp-out' });
    this.tempIn = h('input', { type: 'range', min: '-100', max: '100', step: '1', value: '20', 'aria-label': L({ en: 'Temperature in °C', de: 'Temperatur in °C' }) }) as HTMLInputElement;
    this.tempIn.addEventListener('input', () => this.setTemp(+this.tempIn!.value));
    this.marks = h('div', { class: 'pbox-marks', 'aria-hidden': 'true' });
    this.markKey = h('div', { class: 'pbox-markkey muted small' },
      h('span', null, h('i', { class: 'bp' }), L({ en: 'boiling point', de: 'Siedetemperatur' })),
      h('span', null, h('i', { class: 'mp' }), L({ en: 'melting point', de: 'Schmelztemperatur' })));
    this.heat = h('div', { class: 'wb-equation heat pbox-heat' },
      h('label', { class: 'wb-eq-head' }, h('span', null, L({ en: 'Temperature', de: 'Temperatur' })), this.tempOut),
      h('div', { class: 'pbox-range' }, this.tempIn, this.marks),
      this.markKey);
    return this.heat;
  }

  /** Slider range: from the lowest melting point − 40 to the highest boiling point + 60 (mixing: −20 to 110). */
  private range(): [number, number] {
    // the spreading view: the gas stays a gas, from 20 °C above its boiling point (at least −150 °C) to 400 °C
    const sv = this.stage.spread;
    if (sv) return [Math.max(-150, Math.ceil(((sv.gas.bp ?? -200) + 20) / 10) * 10), 400];
    const b = this.stage.boxes;
    if (b[0].mix) return [-20, 110];
    const subs = [b[0].sub, ...(this.stage.compare ? [b[1].sub] : [])];
    const lows = subs.map((s) => (s.mp ?? s.sublimes ?? s.bp ?? 0) - 40);
    const highs = subs.map((s) => (s.bp ?? s.sublimes ?? 0) + 60);
    const lo = Math.max(-273, Math.floor(Math.min(...lows) / 10) * 10), hi = Math.min(400, Math.ceil(Math.max(...highs) / 10) * 10);
    return [lo, hi];
  }

  // ---------- actions ----------

  load(box: 1 | 2, id: string | null, quiet = false) {
    if (box === 1 && id) {
      this.stage.load(1, id);
      if (this.whatIfIn) this.whatIfIn.checked = false;
      this.mixRow?.querySelectorAll('.chip').forEach((b) => b.setAttribute('aria-pressed', String((b as HTMLElement).dataset.mix === '')));
    } else if (box === 2) this.stage.load(2, id);
    const row = box === 1 ? this.chips1 : this.chips2;
    row?.querySelectorAll('.chip').forEach((b) => b.setAttribute('aria-pressed', String((b as HTMLElement).dataset.id === (id ?? ''))));
    if (id && !this.compact) touchElements(symbols(substance(id).formula));
    this.syncSpread();
    this.fitRange();
    if (!quiet) buzz('light');
    this.refresh();
  }

  setMix(mix: MixId | null) {
    const T = mix === 'ice' ? 0 : this.stage.temp;
    this.stage.temp = Math.max(-20, Math.min(110, T));
    this.stage.load(2, null);
    this.stage.setMix(mix);
    this.chips1?.querySelectorAll('.chip').forEach((b) => b.setAttribute('aria-pressed', String((b as HTMLElement).dataset.id === 'H2O')));
    this.chips2?.querySelectorAll('.chip').forEach((b) => b.setAttribute('aria-pressed', String((b as HTMLElement).dataset.id === '')));
    this.mixRow?.querySelectorAll('.chip').forEach((b) => b.setAttribute('aria-pressed', String((b as HTMLElement).dataset.mix === (mix ?? ''))));
    this.syncSpread();
    this.fitRange();
    this.setTemp(this.stage.temp, true);
    buzz('light');
  }

  setView(v: View) {
    const was = this.stage.view;
    if (was === v) return;
    this.stage.setView(v);
    this.viewRow?.querySelectorAll('.chip').forEach((b) => b.setAttribute('aria-pressed', String((b as HTMLElement).dataset.view === v)));
    if (was !== 'plain') this.emit('view', was, false);
    if (v !== 'plain') this.emit('view', v, true);
    this.refresh();
  }

  setTemp(T: number, quiet = false) {
    const [lo, hi] = this.range();
    const t = Math.max(lo, Math.min(hi, Math.round(T)));
    this.stage.setTemp(t);
    if (this.tempIn) this.tempIn.value = String(t);
    if (!quiet) buzz('light');
    this.refresh();
  }

  private fitRange() {
    if (!this.tempIn) return;
    const [lo, hi] = this.range();
    this.tempIn.min = String(lo); this.tempIn.max = String(hi);
    if (this.stage.temp < lo || this.stage.temp > hi) this.stage.setTemp(Math.max(lo, Math.min(hi, this.stage.temp)));
    this.tempIn.value = String(this.stage.temp);
  }

  /** Show what a reveal or worked example asks for. */
  show(sh: Extract<Show, { engine: 'box' }>) {
    if (sh.spread) { this.showSpread(sh, sh.spread); return; }
    const T = sh.temp ?? (sh.mix === 'ice' ? 0 : 20);
    this.stage.temp = T;
    if (sh.mix && (MIXES as string[]).includes(sh.mix)) {
      this.stage.load(2, null);
      this.stage.setMix(sh.mix as MixId);
    } else {
      // the what-if is set before loading, so the box starts in the state it will show
      this.stage.boxes[0].dipoleOff = !!sh.dipoleOff;
      this.stage.load(1, sh.sub);
      this.stage.load(2, sh.compare ?? null);
    }
    this.stage.setDipoleOff(!!sh.dipoleOff);
    if (this.whatIfIn) this.whatIfIn.checked = !!sh.dipoleOff;
    this.stage.setView(sh.view ?? 'plain');
    this.viewRow?.querySelectorAll('.chip').forEach((b) => b.setAttribute('aria-pressed', String((b as HTMLElement).dataset.view === (sh.view ?? 'plain'))));
    const b0 = this.stage.boxes[0];
    this.chips1?.querySelectorAll('.chip').forEach((b) => b.setAttribute('aria-pressed', String((b as HTMLElement).dataset.id === b0.sub.id)));
    this.chips2?.querySelectorAll('.chip').forEach((b) => b.setAttribute('aria-pressed', String((b as HTMLElement).dataset.id === (this.stage.compare ? this.stage.boxes[1].sub.id : ''))));
    this.mixRow?.querySelectorAll('.chip').forEach((b) => b.setAttribute('aria-pressed', String((b as HTMLElement).dataset.mix === (b0.mix ?? ''))));
    this.syncSpread();
    this.fitRange();
    this.stage.setTemp(T);
    if (this.tempIn) this.tempIn.value = String(T);
    this.refresh();
  }

  // ---------- readouts ----------

  private stateOf(box: 0 | 1): PhaseState { return this.stage.boxes[box].state; }

  private refresh() {
    if (this.stage.spread) { this.refreshSpreadView(); return; }
    const st = this.stage, b0 = st.boxes[0], b1 = st.boxes[1];
    const T = st.temp;
    // HUD: formula and state per box
    const tag = (b: typeof b0, k: 0 | 1) => h('div', { class: 'pbox-tag' + (k === 1 ? ' right' : '') },
      h('div', { class: 'wb-formula' }, b.mix ? h('span', null, chem('H2O'), ' + ', b.mix === 'ice' ? L({ en: 'ice', de: 'Eis' }) : chem(b.mix)) : chem(b.sub.formula)),
      h('div', { class: 'pbox-state ' + this.stateOf(k) }, `${L(STATE[this.stateOf(k)])} · ${deg(T)}`));
    this.hud.replaceChildren(tag(b0, 0), st.compare ? tag(b1, 1) : '');
    this.stageEl.classList.toggle('two', st.compare);
    const name = (b: typeof b0, k: 0 | 1) => `${b.mix ? L({ en: 'water with ', de: 'Wasser mit ' }) + (b.mix === 'ice' ? L({ en: 'ice', de: 'Eis' }) : b.mix === 'NaCl' ? L({ en: 'salt', de: 'Salz' }) : L(substance(b.mix).name)) : L(b.sub.name)}, ${L(STATE[this.stateOf(k)])}`;
    this.stage.setLabel(`${L({ en: 'Particle Box', de: 'Teilchenbox' })}: ${name(b0, 0)}${st.compare ? '; ' + name(b1, 1) : ''}, ${deg(T)}`);
    // legend for the view
    const v = st.view;
    this.legend.replaceChildren(
      v === 'clouds' ? h('span', null, h('i', { class: 'neg' }), 'δ− ', h('i', { class: 'pos' }), 'δ+ ', L({ en: 'for an instant: the clouds flicker', de: 'für einen Augenblick: Die Wolken flackern' }))
        : v === 'dipoles' ? h('span', null, h('i', { class: 'neg' }), L({ en: 'δ− end', de: 'Ende mit δ−' }), ' ', h('i', { class: 'pos' }), L({ en: 'δ+ end', de: 'Ende mit δ+' }))
          : v === 'hbonds' ? h('span', null, h('i', { class: 'hb' }), L({ en: 'dashed: hydrogen bond', de: 'gestrichelt: Wasserstoffbrücke' }))
            : '');
    this.legend.hidden = v === 'plain';
    // the what-if switch only for molecules with a nonpolar twin
    if (this.whatIf) {
      const twin = TWIN[b0.sub.id];
      this.whatIf.hidden = !twin || !!b0.mix;
      const lab = this.whatIf.querySelector('.pbox-whatif-label');
      if (lab && twin) lab.textContent = L({ en: `What if ${L(b0.sub.name).split(' (')[0]} had no dipole? (model)`, de: `Was wäre, wenn ${L(b0.sub.name).split(' (')[0]} keinen Dipol hätte? (Modell)` });
    }
    // slider
    if (this.tempOut) this.tempOut.textContent = deg(T);
    if (this.marks && this.tempIn) {
      const lo = +this.tempIn.min, hi = +this.tempIn.max;
      const pct = (x: number) => `${((x - lo) / (hi - lo)) * 100}%`;
      const subs = b0.mix ? [b0.sub] : [b0.sub, ...(st.compare ? [b1.sub] : [])];
      clear(this.marks);
      subs.forEach((s, k) => {
        const p = pointsOf(s, k === 0 && b0.dipoleOff);
        const bp = p.bp ?? p.sublimes;
        if (bp !== null && bp !== undefined && bp >= lo && bp <= hi) this.marks!.append(h('i', { class: 'bp' + (k ? ' two' : ''), style: `left:${pct(bp)}` }));
        if (p.mp !== null && p.mp >= lo && p.mp <= hi) this.marks!.append(h('i', { class: 'mp' + (k ? ' two' : ''), style: `left:${pct(p.mp)}` }));
      });
    }
    // facts
    if (this.compact) {
      const line = (b: typeof b0, k: 0 | 1) => h('div', null, chem(b.mix ? 'H2O' : b.sub.formula), ` · ${L(STATE[this.stateOf(k)])} ${L({ en: 'at', de: 'bei' })} ${deg(T)}`, this.boilText(b.sub, k === 0 && b.dipoleOff) ? ` · ${this.boilText(b.sub, k === 0 && b.dipoleOff)}` : '');
      this.facts.replaceChildren(line(b0, 0), st.compare ? line(b1, 1) : '', this.dyn);
    } else {
      const cols = [this.factCol(b0, 0), ...(st.compare && !b0.mix ? [this.factCol(b1, 1)] : [])];
      this.facts.replaceChildren(h('div', { class: 'pbox-cols' }, ...cols), this.dyn);
    }
    this.refreshDynamic();
  }

  private boilText(s: Substance, off: boolean): string {
    const p = pointsOf(s, off);
    if (p.bp === null && p.sublimes !== undefined) return L({ en: `turns straight to gas at ${deg(p.sublimes)}`, de: `wird bei ${deg(p.sublimes)} direkt gasförmig` });
    if (p.bp === null) return '';
    if (off) return L({ en: `without its dipole: boils at about ${deg(p.bp)} (model estimate)`, de: `ohne Dipol: siedet bei etwa ${deg(p.bp)} (Modellschätzung)` });
    return L({ en: `boils at ${deg(p.bp)}`, de: `siedet bei ${deg(p.bp)}` });
  }

  private factCol(b: ParticleBoxStage['boxes'][number], k: 0 | 1): HTMLElement {
    const s = b.sub, T = this.stage.temp;
    const row = (label: Bi, value: string | Node) => h('div', { class: 'grow' }, h('span', { class: 'glab' }, L(label)), h('span', { class: typeof value === 'string' && /^[−\-\d]/.test(value) ? 'n' : 't' }, value));
    const p = pointsOf(s);
    const out = h('div', { class: 'gcol now' },
      h('div', { class: 'gname' }, chem(s.formula), ' ', h('span', { class: 'muted small' }, L(s.name))),
      row({ en: 'now', de: 'jetzt' }, h('span', { class: 'pbox-state ' + b.state }, `${L(STATE[b.state])}`)),
      p.bp !== null ? row({ en: 'boiling point', de: 'Siedetemperatur' }, deg(p.bp)) : p.sublimes !== undefined ? row({ en: 'turns to gas at', de: 'wird gasförmig bei' }, deg(p.sublimes)) : '',
      p.mp !== null ? row({ en: 'melting point', de: 'Schmelztemperatur' }, deg(p.mp)) : s.id === 'He' ? row({ en: 'melting point', de: 'Schmelztemperatur' }, L({ en: 'none at normal pressure', de: 'keine bei Normaldruck' })) : '',
      row({ en: 'electrons per molecule', de: 'Elektronen pro Molekül' }, String(s.electrons)),
      s.dipole > 0 ? row({ en: 'dipole moment', de: 'Dipolmoment' }, `${num(s.dipole, 2)} D`) : row({ en: 'dipole moment', de: 'Dipolmoment' }, '0'),
      s.donors > 0 || s.acceptors > 0 ? row({ en: 'H-bond donors · acceptors', de: 'H-Brücken: Donoren · Akzeptoren' }, `${s.donors} · ${s.acceptors}`) : '',
      s.id === 'H2O' ? row({ en: 'density', de: 'Dichte' }, b.state === 'solid' ? `${num(WATER.densityIce, 3)} g/cm³ (${L({ en: 'ice', de: 'Eis' })})` : `${num(T <= 4 ? WATER.densityLiquid4 : (s.density ?? 1), 3)} g/cm³`) : '',
    );
    if (k === 0 && b.dipoleOff && TWIN[s.id]) {
      const tw = substance(TWIN[s.id]);
      out.append(h('p', { class: 'pbox-whatif small' }, L({
        en: `Without its dipole: boils at about ${deg(tw.bp!)}, like ${L(tw.name)} (model estimate). Now: ${L(STATE[stateAt(pointsOf(s, true), T)])}.`,
        de: `Ohne Dipol: siedet bei etwa ${deg(tw.bp!)}, wie ${L(tw.name)} (Modellschätzung). Jetzt: ${L(STATE[stateAt(pointsOf(s, true), T)])}.`,
      })));
    }
    if (b.mix && b.mix !== 'ice' && b.mix !== 'NaCl') {
      const B = substance(b.mix);
      const sol = B.solubility ?? 0;
      out.append(row({ en: 'poured in', de: 'dazugegeben' }, h('span', null, chem(B.formula), ' ', L(B.name))));
      out.append(row({ en: 'solubility in water', de: 'Löslichkeit in Wasser' }, sol === Infinity
        ? L({ en: 'mixes in any ratio', de: 'in jedem Verhältnis mischbar' })
        : L({ en: `${num(sol, sol < 0.1 ? 3 : sol < 1 ? 2 : 1)} g per 100 g water`, de: `${num(sol, sol < 0.1 ? 3 : sol < 1 ? 2 : 1)} g pro 100 g Wasser` })));
      if (B.density) out.append(row({ en: `density of ${L(B.name)}`, de: `Dichte von ${L(B.name)}` }, `${num(B.density, 3)} g/cm³`));
    }
    if (b.mix === 'ice') out.append(row({ en: 'density of ice', de: 'Dichte von Eis' }, `${num(WATER.densityIce, 3)} g/cm³`));
    return out;
  }

  /** Lines that change while the model runs: dissolved molecules or ions, hydrogen bonds. */
  private refreshDynamic() {
    if (this.stage.spread) return;
    const b = this.stage.boxes[0];
    const inf = b.info();
    const parts: (string | Node)[] = [];
    if (inf.mix === 'NaCl') parts.push(L({ en: `Ions dissolved: ${inf.dissolved} of ${inf.total}.`, de: `Gelöste Ionen: ${inf.dissolved} von ${inf.total}.` }) + (b.state === 'solid' ? ' ' + L({ en: 'Below 0 °C this pure water has frozen, and in this model nothing dissolves in the ice. On a gritted road, salt dissolves in the thin film of water on the ice, and salt water stays liquid down to about −21 °C.', de: 'Unter 0 °C ist dieses reine Wasser gefroren, und im Modell löst sich im Eis nichts. Auf einer gestreuten Straße löst sich das Salz im dünnen Wasserfilm auf dem Eis, und Salzwasser bleibt bis etwa −21 °C flüssig.' }) : ''));
    if ((b.sub.id === 'H2O' && b.state === 'solid') || inf.mix === 'ice') parts.push(L({ en: 'Ice is drawn a little more open than it is, so the network stays visible: real ice is about 8 % less dense than liquid water (it takes up about 9 % more room).', de: 'Eis ist hier etwas offener gezeichnet, als es ist, damit das Netzwerk sichtbar bleibt: Echtes Eis hat eine um etwa 8 % geringere Dichte als flüssiges Wasser (es braucht etwa 9 % mehr Platz).' }));
    if (inf.mix && inf.mix !== 'ice' && inf.mix !== 'NaCl') parts.push(L({ en: `Mixed into the water: ${inf.dissolved} of ${inf.total} molecules (model).`, de: `Im Wasser verteilt: ${inf.dissolved} von ${inf.total} Molekülen (Modell).` }));
    const st = this.stage;
    if (st.view === 'dipoles') {
      const subs = [b.sub, ...(st.compare ? [st.boxes[1].sub] : [])];
      if (subs.some((x) => x.id === 'CO2')) parts.push(L({ en: 'CO₂: polar bonds, but no dipole. The two δ− ends point in opposite directions and cancel.', de: 'CO₂: polare Bindungen, aber kein Dipol. Die beiden δ−-Enden zeigen in entgegengesetzte Richtungen und heben sich auf.' }));
      if (subs.some((x) => x.dipole < 0.1 && x.id !== 'CO2')) parts.push(L({ en: 'Molecules without a dipole show no ends.', de: 'Moleküle ohne Dipol zeigen keine Enden.' }));
    }
    if (this.stage.view === 'hbonds') {
      if (b.sub.id === 'H2O' && b.state === 'solid') parts.push(L({ en: 'In ice every molecule takes part in four hydrogen bonds (two per molecule if each bond is counted once); at the edges of this small piece, fewer.', de: 'Im Eis ist jedes Molekül an vier Wasserstoffbrücken beteiligt (zwei pro Molekül, wenn man jede Brücke einmal zählt); am Rand dieses kleinen Stücks an weniger.' }));
      else if (inf.hbAvg !== null) parts.push(L({ en: `Each molecule takes part in about ${num(inf.hbAvg, 1)} hydrogen bonds right now (in this model; at most four).`, de: `Jedes Molekül ist gerade an etwa ${num(inf.hbAvg, 1)} Wasserstoffbrücken beteiligt (in diesem Modell; höchstens vier).` }));
      else {
        const subs = [b.sub, ...(b.mix && b.mix !== 'ice' && b.mix !== 'NaCl' ? [substance(b.mix)] : []), ...(st.compare ? [st.boxes[1].sub] : [])];
        if (!subs.some((x) => x.donors > 0)) parts.push(L({ en: 'No hydrogen bonds: none of these molecules has an H on N, O or F.', de: 'Keine Wasserstoffbrücken: Keines dieser Moleküle hat ein H an N, O oder F.' }));
      }
    }
    this.dyn.replaceChildren(...parts.map((p) => h('div', null, p)));
  }

  // ---------- spreading view (unit 19) ----------

  /** Switch to the spreading view with n particles (null: back to the ordinary box). Emits spread(n). */
  setSpread(n: number | null) {
    if (n === null) { if (this.stage.spread) this.load(1, this.stage.boxes[0].sub.id); return; }
    const wasN = this.stage.spread?.n;
    this.enterSpread(n);
    buzz('light');
    this.emit('spread', n);
    if (this.sp?.ways.open && wasN !== n) this.emit('ways', n);
  }

  /** Remove the partition or put it back (all particles to the left). Emits partition(open, n). */
  setPartition(open: boolean) {
    const s = this.stage.spread;
    if (!s || s.open === open) return;
    this.stage.setPartition(open);
    this.lastAllLeft = 0; this.hitUntil = 0;
    buzz('light');
    this.refresh();
    this.emit('partition', open, s.n);
  }

  /** Two gases: a second gas fills the right half, the partition goes back in. Emits mixed(on). */
  setMixed(on: boolean) {
    const s = this.stage.spread;
    if (!s) return;
    this.stage.setMixed(on);
    this.lastAllLeft = 0; this.hitUntil = 0;
    buzz('light');
    this.refresh();
    this.emit('mixed', on);
  }

  private enterSpread(n: number, o: { open?: boolean; mixed?: boolean } = {}, T?: number) {
    const cur = this.stage.spread;
    const temp = T ?? this.stage.temp;
    this.stage.temp = temp;
    this.stage.setSpread(n, cur ? cur.gas.id : this.stage.boxes[0].sub.id, { open: o.open, mixed: o.mixed ?? cur?.mixed ?? false });
    this.spreadUsed = true;
    this.lastAllLeft = 0; this.hitUntil = 0;
    this.spreadPanel();
    this.syncSpread();
    this.fitRange();
    this.setTemp(temp, true);
  }

  private showSpread(sh: Extract<Show, { engine: 'box' }>, sp: { n: number; open?: boolean; mixed?: boolean }) {
    const T = sh.temp ?? 20;
    this.stage.temp = T;
    this.stage.setSpread(sp.n, sh.sub, { open: sp.open, mixed: sp.mixed });
    this.spreadUsed = true;
    this.lastAllLeft = 0; this.hitUntil = 0;
    this.spreadPanel();
    this.syncSpread();
    this.fitRange();
    const [lo, hi] = this.range();
    const t = Math.max(lo, Math.min(hi, T));
    this.stage.setTemp(t);
    if (this.tempIn) this.tempIn.value = String(t);
    this.refresh();
  }

  private spreadChips(): HTMLElement {
    const label = { en: 'Spread out: number of particles', de: 'Ausbreiten: Teilchenzahl' };
    return h('div', { class: 'pbox-chiprow pbox-spreadrow' },
      h('div', { class: 'pbox-row-label' }, L(label)),
      h('div', { class: 'chip-row', role: 'group', 'aria-label': L(label) },
        ...SPREAD_NS.map((n) => h('button', { class: 'chip small', type: 'button', 'data-n': String(n), 'aria-pressed': 'false', onclick: () => this.setSpread(n) }, String(n)))));
  }

  /** The spreading view's panel: made once, hidden while the ordinary box shows. Not in compact mode. */
  private spreadPanel() {
    if (this.sp || this.compact) return;
    const btn = h('button', { class: 'btn small pbox-wallbtn', type: 'button', onclick: () => { const s = this.stage.spread; if (s) this.setPartition(!s.open); } });
    const mixIn = h('input', { type: 'checkbox', role: 'switch' });
    mixIn.addEventListener('change', () => this.setMixed(mixIn.checked));
    const mixLabel = h('span');
    const msg = h('div', { class: 'pbox-msg', 'aria-live': 'polite' });
    const hist = h('div', { class: 'pbox-bars hist', 'aria-hidden': 'true' });
    const histAxis = h('div', { class: 'pbox-axis', 'aria-hidden': 'true' });
    const histNote = h('div', { class: 'muted small' });
    const waysBody = h('div', { class: 'pbox-ways-body' });
    const ways = h('details', { class: 'pbox-ways' }, h('summary', null, L({ en: 'Ways to arrange (microstates)', de: 'Mikrozustände (Anordnungsmöglichkeiten)' })), waysBody);
    ways.addEventListener('toggle', () => { const s = this.stage.spread; if (ways.open && s) this.emit('ways', s.n); });
    const note = h('p', { class: 'muted small pbox-note' });
    const panel = h('div', { class: 'panel pbox-spread' },
      btn,
      h('label', { class: 'switch' }, mixIn, h('span', { class: 'switch-track', 'aria-hidden': 'true' }), mixLabel),
      msg,
      h('div', { class: 'pbox-histwrap' },
        h('div', { class: 'pbox-sub' }, L({ en: 'How often each split came up since the partition was removed', de: 'Wie oft jede Aufteilung vorkam, seit die Trennwand entfernt wurde' })),
        hist, histAxis, histNote),
      ways, note);
    panel.hidden = true;
    const ref: HTMLElement | undefined = this.heat ?? this.facts;
    if (ref && ref.parentNode === this.el) this.el.insertBefore(panel, ref); else this.el.append(panel);
    this.sp = { panel, btn, mixIn, mixLabel, msg, hist, histBars: [], histAxis, histNote, ways, waysBody, wayBars: [], note };
  }

  /** Controls that belong to one view only, shown or hidden as the spreading view comes and goes. */
  private syncSpread() {
    if (!this.spreadUsed) return;
    const s = this.stage.spread, on = !!s;
    this.spreadRow?.querySelectorAll('.chip').forEach((b) => b.setAttribute('aria-pressed', String(!!s && (b as HTMLElement).dataset.n === String(s.n))));
    if (this.sp) this.sp.panel.hidden = !on;
    if (!this.compact) this.facts.hidden = on;
    for (const el of [this.viewRow, this.mixRow, this.chips2, this.markKey]) if (el) el.hidden = on;
    if (on) {
      this.chips1?.querySelectorAll('.chip').forEach((b) => b.setAttribute('aria-pressed', 'false'));
      this.stageEl.classList.remove('two');
      if (this.whatIf) this.whatIf.hidden = true;
    }
  }

  private chanceText(n: number): string {
    const t = sci(Math.pow(2, n));
    return L({ en: `Chance that all ${n} are on the left at a given moment: 1 in ${t}`, de: `Wahrscheinlichkeit, dass in einem Moment alle ${n} links sind: 1 zu ${t}` });
  }

  /** "10 argon atoms" / "10 Argonatome" */
  private atoms(g: Substance, n: number): string {
    return getLang() === 'de' ? `${n} ${L(g.name)}atome` : `${n} ${L(g.name)} atoms`;
  }

  /** Everything that changes only with the state: HUD, legend, labels, the panel's texts and bars. */
  private refreshSpreadView() {
    const s = this.stage.spread!, T = this.stage.temp, A = s.gas, B = s.gasB;
    this.hud.replaceChildren(
      h('div', { class: 'pbox-tag' },
        h('div', { class: 'wb-formula' }, chem(A.formula), s.mixed ? ' + ' : '', s.mixed ? chem(B.formula) : ''),
        h('div', { class: 'pbox-state gas' }, `${L(STATE.gas)} · ${deg(T)}`)),
      this.split);
    // one gas: "left: 7 · right: 3"; two gases: a small table, one row per gas
    const nums = [h('b'), h('b'), h('b'), h('b')];
    this.splitNums = s.mixed ? nums : nums.slice(0, 2);
    const gasCell = (k: 0 | 1) => h('span', { class: 'g' }, h('i', { class: 'dot', style: `background:${GAS_COLOR[k]}` }), chem((k ? B : A).formula));
    this.split.replaceChildren(s.mixed
      ? h('div', { class: 'pbox-split-grid' },
        h('span', null), h('span', { class: 'h' }, L({ en: 'left', de: 'links' })), h('span', { class: 'h' }, L({ en: 'right', de: 'rechts' })),
        gasCell(0), nums[0], nums[1], gasCell(1), nums[2], nums[3])
      : h('div', { class: 'pbox-split-row' }, L({ en: 'left: ', de: 'links: ' }), nums[0], ' · ', L({ en: 'right: ', de: 'rechts: ' }), nums[1]));
    const smaller = smallerAtom(A.id, B.id);
    this.legend.replaceChildren(s.mixed
      ? h('span', null, h('i', { style: `background:${GAS_COLOR[0]}` }), `${L(A.name)} (${A.formula}) `, h('i', { style: `background:${GAS_COLOR[1]}` }),
        L({ en: `${L(B.name)} (${B.formula}), drawn ${smaller ? 'smaller: a smaller' : 'larger: a larger'} atom`, de: `${L(B.name)} (${B.formula}), ${smaller ? 'kleiner gezeichnet: ein kleineres' : 'größer gezeichnet: ein größeres'} Atom` }))
      : '');
    this.legend.hidden = !s.mixed;
    const wall = s.open ? L({ en: 'partition removed', de: 'Trennwand entfernt' }) : L({ en: 'partition in place', de: 'Trennwand eingesetzt' });
    const who = this.atoms(A, s.n) + (s.mixed ? L({ en: ' and ', de: ' und ' }) + this.atoms(B, s.n) : '');
    this.stage.setLabel(`${L({ en: 'Particle Box, spreading view', de: 'Teilchenbox, Ausbreitung' })}: ${who}, ${wall}, ${deg(T)}`);
    if (this.tempOut) this.tempOut.textContent = deg(T);
    if (this.marks) clear(this.marks);
    if (this.compact) this.facts.replaceChildren(h('div', null, `${who} · ${wall}`), h('div', null, this.chanceText(s.n)));
    const p = this.sp;
    if (p) {
      p.btn.textContent = !s.open ? L({ en: 'Remove the partition', de: 'Trennwand entfernen' })
        : s.mixed ? L({ en: 'Put it back (each gas back in its half)', de: 'Trennwand einsetzen (jedes Gas zurück in seine Hälfte)' })
          : L({ en: 'Put it back (all particles to the left)', de: 'Trennwand einsetzen (alle Teilchen nach links)' });
      p.mixIn.checked = s.mixed;
      p.mixLabel.textContent = L({ en: `Two gases: ${L(B.name)} in the right half`, de: `Zwei Gase: ${L(B.name)} in der rechten Hälfte` });
      const key = `${s.n}|${A.id}|${s.mixed}|${getLang()}`;
      if (key !== this.builtFor) { this.builtFor = key; this.buildBars(s); }
      p.note.textContent = s.mixed
        ? L({ en: `Each sphere is one particle (one ${L(A.name)} or ${L(B.name)} atom). A real sample holds about 10²³ particles (unit 12).`, de: `Jede Kugel ist ein Teilchen (ein ${L(A.name)}- oder ${L(B.name)}atom). Eine echte Stoffprobe enthält etwa 10²³ Teilchen (Einheit 12).` })
        : L({ en: `Each sphere is one particle (one ${L(A.name)} atom). A real sample holds about 10²³ particles (unit 12).`, de: `Jede Kugel ist ein Teilchen (ein ${L(A.name)}atom). Eine echte Stoffprobe enthält etwa 10²³ Teilchen (Einheit 12).` });
    }
    this.refreshSpread();
  }

  /** The histogram's and the ways panel's bars for n particles. */
  private buildBars(s: NonNullable<ParticleBoxStage['spread']>) {
    const p = this.sp!, n = s.n;
    const bars = (el: HTMLElement) => { const b = Array.from({ length: n + 1 }, () => h('i')); el.classList.toggle('dense', n > 40); el.replaceChildren(...b); return b; };
    const axis = () => [h('span', null, '0'), h('span', null, s.mixed
      ? L({ en: `k = ${L(s.gas.name)} atoms on the left`, de: `k = ${L(s.gas.name)}atome links` })
      : L({ en: 'k = particles on the left', de: 'k = Teilchen links' })), h('span', null, String(n))];
    p.histBars = bars(p.hist);
    p.histAxis.replaceChildren(...axis());
    const w = waysOf(n), half = Math.floor(n / 2), max = w[half];
    const wb = h('div', { class: 'pbox-bars ways', 'aria-hidden': 'true' });
    p.wayBars = bars(wb);
    w.forEach((v, k) => { p.wayBars[k].style.height = `${(v / max) * 100}%`; });
    const total = sci(Math.pow(2, n));
    p.waysBody.replaceChildren(
      h('div', { class: 'pbox-sub' }, L({ en: `Arrangements with k of the ${n} particles on the left`, de: `Mikrozustände mit k der ${n} Teilchen links` })),
      wb,
      n <= 10 ? h('div', { class: 'pbox-waynums' }, ...w.map((v) => h('span', null, sci(v)))) : '',
      h('div', { class: 'pbox-axis', 'aria-hidden': 'true' }, ...axis()),
      h('ul', { class: 'pbox-waylist small' },
        h('li', null, L({ en: `In all: 2${sup(n)} = ${total} arrangements, each one equally likely.`, de: `Insgesamt: 2${sup(n)} = ${total} Mikrozustände, jeder gleich wahrscheinlich.` })),
        h('li', null, L({ en: `All ${n} on the left: 1 arrangement. Half and half (${half} left, ${n - half} right): ${sci(max)}.`, de: `Alle ${n} links: 1 Anordnungsmöglichkeit. Halb und halb (${half} links, ${n - half} rechts): ${sci(max)}.` })),
        h('li', { class: 'pbox-chance' }, this.chanceText(n) + '.')));
  }

  /** The live parts, about eight times a second: the count, the histogram, the message. */
  private refreshSpread() {
    const s = this.stage.spread;
    if (!s) return;
    const nums = this.splitNums;
    if (nums.length >= 2) { nums[0].textContent = String(s.left); nums[1].textContent = String(s.n - s.left); }
    if (nums.length >= 4) { nums[2].textContent = String(s.leftB); nums[3].textContent = String(s.n - s.leftB); }
    const p = this.sp;
    if (!p) return;
    let max = 0;
    for (let k = 0; k <= s.n; k++) if (s.hist[k] > max) max = s.hist[k];
    p.histBars.forEach((b, k) => { b.style.height = max ? `${(s.hist[k] / max) * 100}%` : '0'; b.classList.toggle('now', s.open && k === s.left); });
    p.wayBars.forEach((b, k) => b.classList.toggle('now', k === s.left));
    const note = s.open
      ? L({ en: `Counted ten times a second: ${num(s.samples, 0)} counts so far.`, de: `Zehnmal pro Sekunde gezählt: bisher ${num(s.samples, 0)} Zählungen.` })
      : L({ en: 'Remove the partition, then the counting starts.', de: 'Entferne die Trennwand, dann beginnt die Zählung.' });
    if (p.histNote.textContent !== note) p.histNote.textContent = note;
    const now = performance.now();
    if (s.allLeft > this.lastAllLeft) this.hitUntil = now + 3000;
    this.lastAllLeft = s.allLeft;
    const hit = now < this.hitUntil;
    const who = s.mixed ? this.atoms(s.gas, s.n) : String(s.n);
    const text = !s.open ? ''
      : hit ? L({ en: `All ${who} are back on the left, by chance. Held for a moment so you can see it.`, de: `Alle ${who} sind zufällig wieder links. Kurz angehalten, damit du es siehst.` })
        : L({ en: `Times all ${who} were back on the left at once: ${s.allLeft}`, de: `So oft waren alle ${who} gleichzeitig wieder links: ${s.allLeft}` });
    p.msg.classList.toggle('hit', hit);
    if (p.msg.textContent !== text) p.msg.textContent = text;
  }

  dispose() { this.stage.dispose(); this.listeners.clear(); }
}

/** Is the second gas the smaller atom? (van der Waals radii: He < Ne < Ar < Kr < Xe) */
const smallerAtom = (a: string, b: string) => ['He', 'Ne', 'Ar', 'Kr', 'Xe'].indexOf(b) < ['He', 'Ne', 'Ar', 'Kr', 'Xe'].indexOf(a);
