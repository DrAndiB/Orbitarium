// The Particle Box as a screen component: the 3D box (or two), substance chips, a second box to compare,
// views (electron clouds, dipoles, hydrogen bonds), the dipole what-if, mixing into water, the temperature
// slider with melting- and boiling-point marks, and a facts panel with the measured data.
import './particleBox.css';
import { ParticleBoxStage, TWIN, MIXES, stateAt, pointsOf, type MixId, type View, type PhaseState } from './particleBox';
import { substance, WATER, type Substance } from '../content/substances';
import { h, chem, clear } from '../ui/dom';
import { L, num, type Bi } from '../i18n';
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
  controls?: { compare?: boolean; views?: ('clouds' | 'dipoles' | 'hbonds')[]; whatIf?: boolean; temp?: boolean };
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

  constructor(opts: ParticleBoxUIOptions = {}) {
    this.compact = !!opts.compact;
    const c = { compare: true, views: ['clouds', 'dipoles', 'hbonds'] as View[], whatIf: true, temp: true, ...opts.controls };
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

    for (const evt of ['substance', 'temp', 'state', 'boil', 'melt', 'freeze', 'dipoleOff', 'mix', 'dissolved', 'hbonds']) this.stage.on(evt, (...a: unknown[]) => { this.emit(evt, ...a); });
    this.stage.on('frame', () => this.refreshDynamic());

    this.stage.temp = opts.temp ?? 20;
    this.load(1, opts.start ?? subs[0] ?? 'Ar', true);
    if (opts.compare) this.load(2, opts.compare, true);
    this.setTemp(this.stage.temp, true);
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
    return h('div', { class: 'wb-equation heat pbox-heat' },
      h('label', { class: 'wb-eq-head' }, h('span', null, L({ en: 'Temperature', de: 'Temperatur' })), this.tempOut),
      h('div', { class: 'pbox-range' }, this.tempIn, this.marks),
      h('div', { class: 'pbox-markkey muted small' },
        h('span', null, h('i', { class: 'bp' }), L({ en: 'boiling point', de: 'Siedepunkt' })),
        h('span', null, h('i', { class: 'mp' }), L({ en: 'melting point', de: 'Schmelzpunkt' }))));
  }

  /** Slider range: from the lowest melting point − 40 to the highest boiling point + 60 (mixing: −20 to 110). */
  private range(): [number, number] {
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
    this.fitRange();
    this.stage.setTemp(T);
    if (this.tempIn) this.tempIn.value = String(T);
    this.refresh();
  }

  // ---------- readouts ----------

  private stateOf(box: 0 | 1): PhaseState { return this.stage.boxes[box].state; }

  private refresh() {
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
      p.bp !== null ? row({ en: 'boiling point', de: 'Siedepunkt' }, deg(p.bp)) : p.sublimes !== undefined ? row({ en: 'turns to gas at', de: 'wird gasförmig bei' }, deg(p.sublimes)) : '',
      p.mp !== null ? row({ en: 'melting point', de: 'Schmelzpunkt' }, deg(p.mp)) : s.id === 'He' ? row({ en: 'melting point', de: 'Schmelzpunkt' }, L({ en: 'none at normal pressure', de: 'keiner bei Normaldruck' })) : '',
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
    const b = this.stage.boxes[0];
    const inf = b.info();
    const parts: (string | Node)[] = [];
    if (inf.mix === 'NaCl') parts.push(L({ en: `Ions dissolved: ${inf.dissolved} of ${inf.total}.`, de: `Gelöste Ionen: ${inf.dissolved} von ${inf.total}.` }) + (b.state === 'solid' ? ' ' + L({ en: 'Below 0 °C the water is ice: nothing dissolves.', de: 'Unter 0 °C ist das Wasser Eis: Nichts löst sich.' }) : ''));
    if ((b.sub.id === 'H2O' && b.state === 'solid') || inf.mix === 'ice') parts.push(L({ en: 'Ice is drawn a little more open than it is, so the network stays visible: real ice is about 9 % less dense than liquid water.', de: 'Eis ist hier etwas offener gezeichnet, als es ist, damit das Netzwerk sichtbar bleibt: Echtes Eis ist etwa 9 % weniger dicht als flüssiges Wasser.' }));
    if (inf.mix && inf.mix !== 'ice' && inf.mix !== 'NaCl') parts.push(L({ en: `Mixed into the water: ${inf.dissolved} of ${inf.total} molecules (model).`, de: `Im Wasser verteilt: ${inf.dissolved} von ${inf.total} Molekülen (Modell).` }));
    const st = this.stage;
    if (st.view === 'dipoles') {
      const subs = [b.sub, ...(st.compare ? [st.boxes[1].sub] : [])];
      if (subs.some((x) => x.id === 'CO2')) parts.push(L({ en: 'CO₂: polar bonds, but no dipole. The two δ− ends point in opposite directions and cancel.', de: 'CO₂: polare Bindungen, aber kein Dipol. Die beiden δ−-Enden zeigen in entgegengesetzte Richtungen und heben sich auf.' }));
      if (subs.some((x) => x.dipole < 0.1 && x.id !== 'CO2')) parts.push(L({ en: 'Molecules without a dipole show no ends.', de: 'Moleküle ohne Dipol zeigen keine Enden.' }));
    }
    if (this.stage.view === 'hbonds') {
      if (b.sub.id === 'H2O' && b.state === 'solid') parts.push(L({ en: 'In ice every molecule has four hydrogen bonds; at the edges of this small piece, fewer.', de: 'Im Eis hat jedes Molekül vier Wasserstoffbrücken; am Rand dieses kleinen Stücks weniger.' }));
      else if (inf.hbAvg !== null) parts.push(L({ en: `Hydrogen bonds per molecule: about ${num(inf.hbAvg, 1)} (in this model).`, de: `Wasserstoffbrücken pro Molekül: etwa ${num(inf.hbAvg, 1)} (in diesem Modell).` }));
      else {
        const subs = [b.sub, ...(b.mix && b.mix !== 'ice' && b.mix !== 'NaCl' ? [substance(b.mix)] : []), ...(st.compare ? [st.boxes[1].sub] : [])];
        if (!subs.some((x) => x.donors > 0)) parts.push(L({ en: 'No hydrogen bonds: none of these molecules has an H on N, O or F.', de: 'Keine Wasserstoffbrücken: Keines dieser Moleküle hat ein H an N, O oder F.' }));
      }
    }
    this.dyn.replaceChildren(...parts.map((p) => h('div', null, p)));
  }

  dispose() { this.stage.dispose(); this.listeners.clear(); }
}
