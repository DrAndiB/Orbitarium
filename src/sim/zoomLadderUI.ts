// The Zoom Ladder as a screen component (units 12–15): the 3D ladder, the strip of four rung buttons that carry each
// rung's live value, and the controls of the three modes: sample (mass steppers, compare, formula breakdown),
// equation (coefficient steppers, element tally, the subscript trap) and reaction (amounts, React, yield).
import './zoomLadder.css';
import { ZoomLadderStage, RUNGS, sci, gram, mols, molar, times, formulaText, kindOf, ionRatio, hasTrueShape, atomCss, KIND_WORD, type LadderScene, type Item } from './zoomLadder';
import { N_A, molarMass, massShares, parseFormula, sideCount, ladderSample, equation, EQUATIONS, type Equation } from '../content/stoich';
import type { Rung, Show } from '../content/unitTypes';
import { h, chem, clear } from '../ui/dom';
import { L, num, numTrim, type Bi } from '../i18n';
import { buzz } from '../platform';
import { touchElements } from '../model/learner';

export interface ZoomLadderUIOptions {
  /** 'sample' (units 12, 13; default), 'equation' (unit 14) or 'reaction' (unit 15). */
  mode?: 'sample' | 'equation' | 'reaction';
  /** First sample id (LADDER_SAMPLES) in sample mode, or first equation id (EQUATIONS) in the other modes. */
  start?: string;
  /** Sample chips offered (sample mode). Default: a short list chosen by the engine. */
  samples?: string[];
  /** Equation chips offered (equation and reaction modes). */
  equations?: string[];
  /** Grams on the balance at start (sample mode). */
  grams?: number;
  compact?: boolean;
  controls?: { compare?: boolean; breakdown?: boolean; trap?: boolean; yield?: boolean };
}
type Fn = (...a: any[]) => void;
type Mode = NonNullable<ZoomLadderUIOptions['mode']>;
type By = 'particles' | 'mol' | 'g';

const DEFAULT_SAMPLES = ['C', 'Mg', 'Al', 'Fe', 'Cu', 'Au', 'Pb', 'H2', 'H2O', 'CO2', 'C6H12O6', 'NaCl'];
const DEFAULT_EQS: Record<'equation' | 'reaction', string[]> = { equation: ['h2o', 'mgo', 'ch4', 'nh3', 'c2h6'], reaction: ['h2o', 'nh3', 'mgo', 'ch4'] };
const RUNG_NAME: Record<Rung, Bi> = { grams: { en: 'Grams', de: 'Gramm' }, moles: { en: 'Moles', de: 'Mol' }, count: { en: 'Count', de: 'Anzahl' }, particles: { en: 'Particles', de: 'Teilchen' } };
const RUNG_SHOWS: Record<Rung, Bi> = {
  grams: { en: 'on the balance', de: 'auf der Waage' },
  moles: { en: 'in 1 mol portions', de: 'in Portionen zu 1 mol' },
  count: { en: 'the number of particles', de: 'die Teilchenzahl' },
  particles: { en: 'the particles themselves', de: 'die Teilchen selbst' },
};
const PARTICLES: Bi = { en: 'particles', de: 'Teilchen' };
const MAX_G = 1000, MAX_MOL = 100, MAX_RX_MOL = 50, MAX_PIC = 12;
const TOL = 0.01;   // reaction in mol or g: a leftover under 1 % of that reactant counts as nothing left over

const THREE_clamp = (x: number, a: number, b: number) => Math.min(b, Math.max(a, x));
const round = (x: number, d: number) => Math.round(x * 10 ** d) / 10 ** d;
const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a);
const nameOf = (f: string): Bi | null => ladderSample(f)?.name ?? null;
/** A formula in HTML with real subscripts; a hydrate keeps its leading count: CuSO₄·5H₂O. */
function fchem(f: string): HTMLElement {
  const [first, ...rest] = f.split('·');
  const span = h('span', { class: 'chem' }, chem(first));
  for (const p of rest) { const m = /^(\d+)(.*)$/.exec(p); span.append('·', m ? m[1] : '', chem(m ? m[2] : p)); }
  return span;
}
const formulaOf = (id: string) => ladderSample(id)?.formula ?? id;
const getTimes100 = () => `${times()} 100 %`;
const NA = () => h('span', null, 'N', h('sub', null, 'A'));
/** "6,022 × 10²³ mol⁻¹" */
const naText = () => `${num(6.022, 3)} ${times()} 10²³ mol⁻¹`;

interface Result {
  by: By; amounts: number[]; limiting: number; leftover: number[]; product: number[];
  /** the picture: particles per reactant and the number of groups that react */
  pic: number[]; events: number; exact: boolean;
}

export class ZoomLadderUI {
  readonly el: HTMLElement;
  readonly stage: ZoomLadderStage;
  mode: Mode;
  rung: Rung;
  private compact: boolean;
  private c: Required<NonNullable<ZoomLadderUIOptions['controls']>>;
  private listeners = new Map<string, Set<Fn>>();
  private hud: HTMLElement;
  private strip: HTMLElement;
  private calc: HTMLElement;
  private ctrl: HTMLElement;
  private info: HTMLElement;
  private settle = 0;
  private yieldTimer = 0;
  private ctrlMode: Mode | null = null;
  // sample mode
  s1: string;
  s2: string | null = null;
  by: 'mass' | 'moles' = 'mass';
  g1: number;
  unit: 'g' | 'mol' = 'g';
  breakdown = false;
  private samples: string[];
  // equation mode
  eqId: string;
  coeffs: number[] = [];
  trap = false;
  private saved: number[] = [];
  // reaction mode
  rxBy: By = 'particles';
  inputs: number[] = [];
  result: Result | null = null;
  actual: number | null = null;
  private eqs: string[];

  constructor(public opts: ZoomLadderUIOptions = {}) {
    this.compact = !!opts.compact;
    this.mode = opts.mode ?? 'sample';
    // no controls given (free lab, dev harness): all on; otherwise only those the unit lists
    const all = !opts.controls;
    this.c = { compare: all, breakdown: all, trap: all, yield: all, ...opts.controls };
    this.samples = (opts.samples ?? DEFAULT_SAMPLES).filter((id) => ladderSample(id));
    this.eqs = (opts.equations ?? DEFAULT_EQS[this.mode === 'reaction' ? 'reaction' : 'equation']).filter((id) => equation(id));
    const start = opts.start;
    this.s1 = this.mode === 'sample' && start && ladderSample(start) ? start : this.samples[0] ?? 'C';
    this.g1 = opts.grams ?? round(molarMass(formulaOf(this.s1)), 2);
    this.eqId = this.mode !== 'sample' && start && equation(start) ? start : this.eqs[0] ?? 'h2o';
    this.rung = this.mode === 'sample' ? 'grams' : 'particles';

    const stageEl = h('div', { class: 'wb-stage zl-stage' + (this.compact ? ' compact' : '') });
    this.hud = h('div', { class: 'wb-hud zl-hud' });
    stageEl.append(this.hud);
    this.strip = h('div', { class: 'zl-rungs' + (this.compact ? ' ro' : ''), role: this.compact ? 'list' : 'group', 'aria-label': L({ en: 'Zoom level', de: 'Zoomstufe' }) });
    this.calc = h('div', { class: 'zl-calc', 'aria-live': 'polite' });
    this.ctrl = h('div', { class: 'zl-ctrl' });
    this.info = h('div', { class: 'zl-info' });
    this.el = h('div', { class: 'workbench zl' + (this.compact ? ' compact' : '') }, stageEl, this.strip, this.calc, this.ctrl, this.info);
    this.stage = new ZoomLadderStage(stageEl, this.compact);
    this.stage.on('reacted', () => this.refresh());
    this.setupMode();
    if (this.mode === 'sample') this.rebuild(); else this.setEquation(this.eqId, true);
  }

  on(evt: string, f: Fn) { if (!this.listeners.has(evt)) this.listeners.set(evt, new Set()); this.listeners.get(evt)!.add(f); return () => this.listeners.get(evt)!.delete(f); }
  private emit(evt: string, ...a: unknown[]) { this.listeners.get(evt)?.forEach((f) => f(...a)); }

  // ---------- derived values ----------

  private get f1() { return formulaOf(this.s1); }
  private get M1() { return molarMass(this.f1); }
  private get n1() { return this.g1 / this.M1; }
  private get f2() { return this.s2 ? formulaOf(this.s2) : null; }
  /** Sample 2 holds the same mass, or the same amount, as sample 1. */
  private get g2() { return this.f2 ? (this.by === 'mass' ? this.g1 : this.n1 * molarMass(this.f2)) : 0; }
  private get eq(): Equation { return equation(this.eqId) ?? EQUATIONS[0]; }
  /** Species of the equation in order (reactants then products), with the subscript trap applied. */
  private species(): { f: string; side: 'r' | 'p'; i: number; c: number }[] {
    const e = this.eq, t = this.trap ? e.trap : undefined;
    return [
      ...e.reactants.map((s, i) => ({ f: t && t.side === 'r' && t.i === i ? t.alt : s.f, side: 'r' as const, i, c: s.c })),
      ...e.products.map((s, i) => ({ f: t && t.side === 'p' && t.i === i ? t.alt : s.f, side: 'p' as const, i, c: s.c })),
    ];
  }
  private tally() {
    const sp = this.species(), nr = this.eq.reactants.length;
    const left = sideCount(sp.slice(0, nr).map((s) => ({ f: s.f, c: 1 })), this.coeffs.slice(0, nr));
    const right = sideCount(sp.slice(nr).map((s) => ({ f: s.f, c: 1 })), this.coeffs.slice(nr));
    const els = [...new Set([...Object.keys(left), ...Object.keys(right)])];
    const rows = els.map((el) => ({ el, l: left[el] ?? 0, r: right[el] ?? 0 }));
    return { rows, ok: rows.every((x) => x.l === x.r) };
  }

  // ---------- controls ----------

  private chipRow(label: Bi, ids: string[], content: (id: string) => Node | string, pick: (id: string | null) => void, none?: Bi): HTMLElement {
    const row = h('div', { class: 'chip-row', role: 'group', 'aria-label': L(label) },
      none ? h('button', { class: 'chip small', type: 'button', 'data-id': '', 'aria-pressed': 'true', onclick: () => pick(null) }, L(none)) : null,
      ...ids.map((id) => h('button', { class: 'chip small', type: 'button', 'data-id': id, 'aria-pressed': 'false', title: L(nameOf(formulaOf(id)) ?? equation(id)?.name ?? { en: id, de: id }), onclick: () => pick(id) }, content(id))));
    return h('div', { class: 'zl-chiprow' }, h('div', { class: 'zl-row-label' }, L(label)), row);
  }

  private stepper(steps: number[], fmt: (x: number) => string, go: (d: number) => void, label: Bi): HTMLElement {
    return h('div', { class: 'zl-steps', role: 'group', 'aria-label': L(label) },
      ...steps.map((d) => h('button', { class: 'zl-step' + (d < 0 ? ' minus' : ' plus'), type: 'button', 'data-step': String(d), onclick: () => go(d) }, (d < 0 ? '−' : '+') + fmt(Math.abs(d)))));
  }

  /** Build the controls for the current mode (once per mode; refresh() fills in the values). */
  private setupMode() {
    if (this.compact || this.ctrlMode === this.mode) return;
    this.ctrlMode = this.mode;
    clear(this.ctrl);
    if (this.mode === 'sample') {
      if (this.samples.length > 1) this.ctrl.append(this.chipRow({ en: 'Sample', de: 'Stoffportion' }, this.samples, (id) => fchem(formulaOf(id)), (id) => id && this.setSample(1, id)));
      const unitSw = h('div', { class: 'zl-seg', role: 'group', 'aria-label': L({ en: 'Set the amount in', de: 'Menge einstellen in' }) },
        h('button', { type: 'button', 'data-unit': 'g', onclick: () => this.setUnit('g') }, L({ en: 'grams', de: 'Gramm' })),
        h('button', { type: 'button', 'data-unit': 'mol', onclick: () => this.setUnit('mol') }, 'mol'));
      this.ctrl.append(h('div', { class: 'wb-equation zl-mass' },
        h('div', { class: 'wb-eq-head' }, h('span', { class: 'zl-mass-label' }), unitSw),
        h('div', { class: 'zl-mass-steps' })));
      if (this.c.compare && this.samples.length > 1) {
        this.ctrl.append(this.chipRow({ en: 'Compare with', de: 'Vergleichen mit' }, this.samples, (id) => fchem(formulaOf(id)), (id) => this.setSample(2, id), { en: 'none', de: 'keine' }));
        this.ctrl.append(h('div', { class: 'zl-seg zl-by', role: 'group', 'aria-label': L({ en: 'Second sample', de: 'Zweite Stoffportion' }) },
          h('button', { type: 'button', 'data-by': 'mass', onclick: () => this.setBy('mass') }, L({ en: 'same mass', de: 'gleiche Masse' })),
          h('button', { type: 'button', 'data-by': 'moles', onclick: () => this.setBy('moles') }, L({ en: 'same amount (mol)', de: 'gleiche Stoffmenge (mol)' }))));
      }
      if (this.c.breakdown) this.ctrl.append(h('button', { class: 'btn small quiet zl-bd-btn', type: 'button', 'aria-expanded': 'false', onclick: () => this.setBreakdown(!this.breakdown) }, L({ en: 'What’s in the formula?', de: 'Was steckt in der Formel?' })));
      return;
    }
    if (this.eqs.length > 1) this.ctrl.append(this.chipRow({ en: 'Reaction', de: 'Reaktion' }, this.eqs, (id) => L(equation(id)!.name), (id) => id && this.setEquation(id)));
    this.ctrl.append(h('div', { class: 'zl-eqline', role: 'group', 'aria-label': L({ en: 'Equation', de: 'Reaktionsgleichung' }) }));
    if (this.mode === 'equation') {
      this.ctrl.append(h('div', { class: 'zl-tally', 'aria-live': 'polite' }));
      if (this.c.trap) this.ctrl.append(h('button', { class: 'btn small quiet zl-trap-btn', type: 'button', 'aria-pressed': 'false', onclick: () => this.setTrap(!this.trap) }));
      return;
    }
    this.ctrl.append(
      h('div', { class: 'zl-amounts' }),
      h('button', { class: 'btn small zl-react', type: 'button', onclick: () => this.react() }, L({ en: 'React', de: 'Reagieren lassen' })));
  }

  // ---------- actions: sample mode ----------

  setSample(which: 1 | 2, id: string | null, quiet = false) {
    if (which === 1 && id) {
      const keepMol = this.unit === 'mol' ? this.n1 : null;
      this.s1 = id;
      if (keepMol !== null) this.g1 = keepMol * this.M1;
    } else if (which === 2) this.s2 = id && id !== '' ? id : null;
    if (!quiet) {
      if (id) touchElements(Object.keys(parseFormula(formulaOf(id))));
      buzz('light');
    }
    this.rebuild();
    if (quiet) return;
    if (id) this.emit('sample', id, which);
    if (which === 1) { this.emitMass(); if (this.breakdown) this.emit('breakdown', this.s1, this.M1); }
    if (this.c.compare && (which === 2 || this.s2)) this.emit('compare', this.s1, this.s2, this.by);
  }

  setBy(by: 'mass' | 'moles') {
    if (this.by === by) return;
    this.by = by;
    buzz('light');
    this.rebuild();
    if (this.s2) this.emit('compare', this.s1, this.s2, this.by);
  }

  /** Switch the steppers between grams and mol; in mol the amount snaps to two decimals (0.999 mol → 1.00 mol). */
  setUnit(u: 'g' | 'mol') {
    if (this.unit === u) return;
    this.unit = u;
    if (u === 'mol' && this.n1 >= 0.01) {
      const was = this.g1;
      this.g1 = round(this.n1, 2) * this.M1;
      if (Math.abs(was - this.g1) > 1e-9) { this.rebuild(); this.emitMass(); return; }
    }
    this.refresh();
  }

  private step(d: number) {
    if (this.unit === 'g') this.g1 = THREE_clamp(round(this.g1 + d, 2), 0.1, MAX_G);
    else this.g1 = THREE_clamp(round(this.n1 + d, 3), 0.01, MAX_MOL) * this.M1;
    buzz('light');
    this.rebuild();
    clearTimeout(this.settle);
    this.settle = window.setTimeout(() => this.emitMass(), 400);
  }

  private emitMass() { clearTimeout(this.settle); this.emit('mass', this.s1, this.g1, this.n1, this.n1 * N_A); }

  setBreakdown(on: boolean) {
    this.breakdown = on;
    this.refresh();
    if (on) { buzz('light'); this.emit('breakdown', this.s1, this.M1); }
  }

  // ---------- actions: equation mode ----------

  setEquation(id: string, quiet = false) {
    if (!equation(id)) return;
    this.eqId = id;
    const e = this.eq;
    this.coeffs = [...e.reactants, ...e.products].map(() => 1);
    this.trap = false;
    this.result = null;
    this.actual = null;
    if (this.mode === 'reaction') { this.rxBy = this.rungUnit() ?? 'particles'; this.inputs = this.defaultInputs(); }
    if (!quiet) { touchElements(Object.keys(sideCount([...e.reactants, ...e.products], this.coeffs))); buzz('light'); }
    this.rebuild();
    if (!quiet) this.emit('equation', id);
  }

  setCoeff(k: number, d: number) {
    if (this.trap) return;
    const c = Math.max(1, Math.min(9, (this.coeffs[k] ?? 1) + d));
    if (c === this.coeffs[k]) return;
    this.coeffs[k] = c;
    buzz('light');
    this.rebuild();
    const ok = this.tally().ok;
    this.emit('coeffs', this.eqId, [...this.coeffs], ok);
    if (ok) this.emit('balanced', this.eqId, [...this.coeffs], this.coeffs.reduce(gcd) === 1);
  }

  /** The smallest coefficients (1–9) that balance the species as they stand (used for the subscript trap). */
  private solve(): number[] {
    const sp = this.species(), n = sp.length, nr = this.eq.reactants.length;
    const c = sp.map(() => 1);
    const ok = () => {
      const l = sideCount(sp.slice(0, nr).map((s) => ({ f: s.f, c: 1 })), c.slice(0, nr)), r = sideCount(sp.slice(nr).map((s) => ({ f: s.f, c: 1 })), c.slice(nr));
      return [...new Set([...Object.keys(l), ...Object.keys(r)])].every((el) => l[el] === r[el]);
    };
    const rec = (i: number): boolean => { if (i === n) return ok(); for (let v = 1; v <= 9; v++) { c[i] = v; if (rec(i + 1)) return true; } return false; };
    return rec(0) ? c : sp.map(() => 1);
  }

  setTrap(on: boolean, quiet = false) {
    const t = this.eq.trap;
    if (!t || on === this.trap) return;
    if (on) { this.saved = [...this.coeffs]; this.trap = true; this.coeffs = this.solve(); }
    else { this.trap = false; this.coeffs = this.saved.length ? this.saved : this.coeffs.map(() => 1); }
    if (!quiet) buzz('medium');
    this.rebuild();
    if (quiet) return;
    if (on) { this.emit('subscript', this.eqId, t.alt); return; }
    const ok = this.tally().ok;
    this.emit('coeffs', this.eqId, [...this.coeffs], ok);
    if (ok) this.emit('balanced', this.eqId, [...this.coeffs], this.coeffs.reduce(gcd) === 1);
  }

  // ---------- actions: reaction mode ----------

  /** The amount unit of a rung: molecules at the particles rung, mol at the moles and count rungs, g at the grams rung. */
  private rungUnit(r: Rung = this.rung): By { return r === 'particles' ? 'particles' : r === 'grams' ? 'g' : 'mol'; }
  /** Start amounts: three times the first coefficient, twice the others (so something is left over). */
  private defaultInputs(): number[] { return this.eq.reactants.map((s, i) => (s.c * (i === 0 ? 3 : 2)) / (this.rxBy === 'particles' ? N_A : 1)); }
  private get Ms() { return this.eq.reactants.map((s) => molarMass(s.f)); }

  /** Change reactant k by d in the current rung's unit (molecules, mol or g). */
  setAmount(k: number, d: number) {
    const unit = this.rungUnit();
    if (unit !== this.rxBy) {
      // a new unit: the picture's molecule counts, or the start amounts in mol
      this.inputs = unit === 'particles' ? this.picture(this.inputs).pic.map((x) => x / N_A) : this.rxBy === 'particles' ? this.eq.reactants.map((s, i) => s.c * (i === 0 ? 3 : 2)) : this.inputs;
      this.rxBy = unit;
    }
    const a = [...this.inputs];
    if (unit === 'particles') a[k] = THREE_clamp(Math.round(a[k] * N_A) + d, 0, MAX_PIC) / N_A;
    else if (unit === 'mol') a[k] = THREE_clamp(round(a[k] + d, 3), 0, MAX_RX_MOL);
    else { const M = this.Ms[k]; a[k] = THREE_clamp(round(a[k] * M + d, 2), 0, MAX_RX_MOL * M) / M; }
    this.inputs = a;
    this.result = null;
    this.actual = null;
    buzz('light');
    this.rebuild();
  }

  /** Groups combine by the coefficients until a reactant runs out. Particles: whole groups only. */
  private analyse(amounts: number[], by: By) {
    const c = this.eq.reactants.map((s) => s.c), d = this.eq.products.map((s) => s.c);
    const units = amounts.map((a) => (by === 'particles' ? Math.round(a * N_A) : a));
    const per = units.map((u, i) => u / c[i]);
    const ext0 = Math.min(...per);
    const ext = by === 'particles' ? Math.floor(ext0 + 1e-9) : ext0;
    const lim = per.indexOf(ext0);
    const left = units.map((u, i) => u - c[i] * ext);
    const nothing = left.every((x, i) => (by === 'particles' ? x === 0 : x <= TOL * Math.max(units[i], 1e-12)));
    const k = by === 'particles' ? 1 / N_A : 1;
    return { limiting: nothing ? -1 : lim, leftover: left.map((x) => x * k), product: d.map((x) => x * ext * k), ext, per };
  }

  /**
   * The particle picture for amounts given in mol or g: small whole numbers (at most 12 per reactant) in about the
   * same ratio, with the same reactant running out. `exact` is false when the real ratio is too large to draw.
   */
  private picture(amounts: number[]): { pic: number[]; events: number; exact: boolean } {
    const c = this.eq.reactants.map((s) => s.c);
    if (this.rxBy === 'particles') {
      const pic = amounts.map((a) => Math.round(a * N_A));
      return { pic, events: Math.floor(Math.min(...pic.map((p, i) => p / c[i])) + 1e-9), exact: true };
    }
    const mx = Math.max(...amounts);
    if (mx <= 0) return { pic: amounts.map(() => 0), events: 0, exact: true };
    const real = this.analyse(amounts, 'mol');
    if (real.limiting < 0) {
      const k = Math.max(1, Math.floor(6 / Math.max(...c)));
      return { pic: c.map((x) => x * k), events: k, exact: true };
    }
    const lim = real.limiting;
    if (amounts[lim] <= 0) return { pic: amounts.map((a) => (a > 0 ? Math.max(1, Math.min(MAX_PIC, Math.round((a / mx) * 6))) : 0)), events: 0, exact: true };
    let best: { pic: number[]; events: number; err: number } | null = null;
    for (let E = 1; c[lim] * E <= MAX_PIC; E++) {
      const pic = amounts.map((a, i) => {
        if (i === lim) return c[lim] * E;
        const want = Math.round((a / amounts[lim]) * c[lim] * E);
        const min = c[i] * E + (real.leftover[i] > TOL * a ? 1 : 0);
        return Math.min(MAX_PIC, Math.max(min, want));
      });
      if (pic.some((p, i) => i !== lim && p < c[i] * E)) continue;
      const err = Math.max(...pic.map((p, i) => Math.abs(p / pic[lim] / (amounts[i] / amounts[lim]) - 1)));
      if (!best || err < best.err - 0.02 || (Math.abs(err - best.err) <= 0.02 && E < best.events)) best = { pic, events: E, err };
    }
    if (!best) return { pic: c.map(() => 1), events: 0, exact: false };
    return { pic: best.pic, events: best.events, exact: best.err <= 0.15 };
  }

  private animateNext = false;

  /** React: run the reaction until one reactant runs out, at the particles rung. */
  react(quiet = false) {
    const a = this.inputs;
    if (a.every((x) => x <= 0)) return;
    const an = this.analyse(a, this.rxBy);
    this.result = { by: this.rxBy, amounts: [...a], limiting: an.limiting, leftover: an.leftover, product: an.product, ...this.picture(a) };
    const theo = this.theoretical();
    this.actual = this.c.yield && theo > 0 ? round(theo, 1) : null;
    this.animateNext = true;
    if (!quiet) buzz('medium');
    const moved = this.rung !== 'particles';
    this.rung = 'particles';
    this.rebuild();
    if (moved && !quiet) this.emit('rung', 'particles');
    if (!quiet) this.emit('react', this.eqId, [...a], an.limiting, [...an.leftover], [...an.product], this.rxBy);
  }

  /** Theoretical yield of the first product in grams. */
  private theoretical() { return this.result ? this.result.product[0] * molarMass(this.eq.products[0].f) : 0; }

  setActual(d: number) {
    const theo = this.theoretical();
    if (!this.result || theo <= 0) return;
    this.actual = THREE_clamp(round((this.actual ?? 0) + d, 2), 0, round(theo * 1.5, 1));
    buzz('light');
    this.refresh();
    clearTimeout(this.yieldTimer);
    this.yieldTimer = window.setTimeout(() => this.emit('yield', this.eqId, this.actual, (this.actual! / theo) * 100), 400);
  }

  // ---------- rungs ----------

  setRung(r: Rung, quiet = false) {
    this.rung = r;
    this.stage.goTo(r);
    this.refresh();
    if (!quiet) { buzz('light'); this.emit('rung', r); }
  }

  // ---------- the scene for the stage ----------

  private picCount(f: string): number {
    const k = kindOf(f);
    if (k === 'atom') return 12;
    if (k === 'formula-unit') return 4;
    const atoms = Object.values(parseFormula(f)).reduce((s, x) => s + x, 0);
    return atoms <= 3 ? 8 : atoms <= 8 ? 6 : 3;
  }

  private particleTag(f: string, n?: number): string {
    const ions = ionRatio(f);
    if (ions && n === undefined) return L({ en: `formula unit ${ions}`, de: `Formeleinheit ${ions}` });
    const k = kindOf(f), word = KIND_WORD[k][n === 1 ? 'one' : 'many'];
    const ft = formulaText(f);
    return n === undefined ? L({ en: `${ft} ${word.en}`, de: `${ft}-${word.de}` }) : `${n} ${ft}`;
  }

  private scene(): LadderScene {
    if (this.mode === 'sample') {
      const f1 = this.f1, f2 = this.f2;
      const N1 = this.n1 * N_A, N2 = f2 ? (this.g2 / molarMass(f2)) * N_A : 0;
      const it = (f: string, amount: number): Item => ({ f, amount, tag: formulaText(f) });
      const sides = (a: number, b: number) => (f2 ? [[it(f1, a)], [it(f2, b)]] : [[it(f1, a)]]);
      let pics: Item[][];
      if (!f2) pics = [[{ f: f1, amount: this.picCount(f1), tag: this.particleTag(f1) }]];
      else {
        const base = Math.min(this.picCount(f1), this.picCount(f2), 8);
        const [p1, p2] = N1 >= N2 ? [base, Math.max(1, Math.round((base * N2) / N1))] : [Math.max(1, Math.round((base * N1) / N2)), base];
        pics = [[{ f: f1, amount: p1, tag: this.particleTag(f1, p1) }], [{ f: f2, amount: p2, tag: this.particleTag(f2, p2) }]];
      }
      return {
        arrow: false,
        grams: { sides: sides(this.g1, this.g2) },
        moles: { sides: sides(this.n1, f2 ? this.g2 / molarMass(f2) : 0) },
        count: { pins: [{ label: `${formulaText(f1)}  ${sci(N1)}`, N: N1 }, ...(f2 ? [{ label: `${formulaText(f2)}  ${sci(N2)}`, N: N2 }] : [])] },
        particles: { sides: pics },
      };
    }
    const sp = this.species(), nr = this.eq.reactants.length;
    if (this.mode === 'equation') {
      const items = (k: number[], amount: (s: (typeof sp)[number], c: number) => number): Item[] => k.map((i) => ({ f: sp[i].f, amount: amount(sp[i], this.coeffs[i]), tag: `${this.coeffs[i]} ${formulaText(sp[i].f)}` }));
      const R = sp.slice(0, nr).map((_, i) => i), P = sp.slice(nr).map((_, i) => i + nr);
      return {
        arrow: true,
        grams: { sides: [items(R, (s, c) => c * molarMass(s.f)), items(P, (s, c) => c * molarMass(s.f))], beam: true },
        moles: { sides: [items(R, (_s, c) => c), items(P, (_s, c) => c)] },
        count: { pins: sp.map((s, i) => ({ label: `${this.coeffs[i]} ${formulaText(s.f)}`, N: this.coeffs[i] * N_A })) },
        particles: { sides: [items(R, (_s, c) => c), items(P, (_s, c) => c)] },
      };
    }
    // reaction
    const e = this.eq, res = this.result, a = res ? res.amounts : this.inputs;
    const pic = res ? { pic: res.pic, events: res.events } : this.picture(a);
    const rIt = (unit: By): Item[] => e.reactants.map((s, i) => ({ f: s.f, amount: unit === 'g' ? a[i] * molarMass(s.f) : unit === 'mol' ? a[i] : pic.pic[i], tag: formulaText(s.f) }));
    const pIt = (unit: By): Item[] => {
      const out: Item[] = e.products.map((s, j) => ({ f: s.f, amount: !res ? 0 : unit === 'g' ? res.product[j] * molarMass(s.f) : unit === 'mol' ? res.product[j] : pic.events * s.c, tag: formulaText(s.f) }));
      if (res && unit !== 'particles') e.reactants.forEach((s, i) => {
        if (res.leftover[i] > 1e-12 * Math.max(1, a[i])) out.push({ f: s.f, amount: unit === 'g' ? res.leftover[i] * molarMass(s.f) : res.leftover[i], tag: L({ en: `${formulaText(s.f)} left over`, de: `${formulaText(s.f)} übrig` }) });
      });
      return out;
    };
    const animate = this.animateNext;
    this.animateNext = false;
    return {
      arrow: true,
      grams: { sides: [rIt('g'), pIt('g')] },
      moles: { sides: [rIt('mol'), pIt('mol')] },
      count: { pins: [...e.reactants.map((s, i) => ({ label: `${formulaText(s.f)}  ${sci(a[i] * N_A)}`, N: a[i] * N_A })), ...(res ? e.products.map((s, j) => ({ label: `${formulaText(s.f)}  ${sci(res.product[j] * N_A)}`, N: res.product[j] * N_A })) : [])] },
      particles: { sides: [rIt('particles'), pIt('particles')], react: res ? { events: pic.events, coeffs: e.reactants.map((s) => s.c), productCoeffs: e.products.map((s) => s.c), animate } : null },
    };
  }

  /** Rebuild the 3D scene and the panels. */
  private rebuild() {
    if (this.stage.rung !== this.rung) this.stage.goTo(this.rung);
    this.stage.setScene(this.scene());
    this.refresh();
  }

  // ---------- panels ----------

  private refresh() {
    this.drawHud();
    this.drawStrip();
    this.drawCalc();
    if (!this.compact) this.drawControls();
    this.drawInfo();
    this.stage.setLabel(`${L(RUNG_NAME[this.rung])}: ${L(RUNG_SHOWS[this.rung])}`);
  }

  private drawHud() {
    const e = this.mode !== 'sample' ? this.eq : null;
    let right: HTMLElement | null = null;
    if (this.mode === 'equation') {
      const ok = this.tally().ok;
      right = h('div', { class: 'zl-flag ' + (this.trap ? 'warn' : ok ? 'ok' : 'off') }, this.trap ? L({ en: '≠ not allowed', de: '≠ nicht erlaubt' }) : ok ? L({ en: '✓ balanced', de: '✓ ausgeglichen' }) : L({ en: '≠ not balanced', de: '≠ nicht ausgeglichen' }));
    } else if (this.mode === 'reaction' && this.result && !this.stage.animating) {
      const r = this.result;
      right = h('div', { class: 'zl-flag ' + (r.limiting < 0 ? 'ok' : 'warn') }, r.limiting < 0 ? L({ en: 'nothing left over', de: 'nichts übrig' }) : h('span', null, fchem(e!.reactants[r.limiting].f), L({ en: ' ran out', de: ' ist verbraucht' })));
    }
    this.hud.replaceChildren(
      h('div', { class: 'zl-where' },
        h('div', { class: 'zl-where-rung' }, L(RUNG_NAME[this.rung])),
        h('div', { class: 'zl-where-what' }, L(RUNG_SHOWS[this.rung])),
        this.mode === 'sample' ? h('div', { class: 'zl-where-sub muted' }, L(nameOf(this.f1) ?? { en: this.f1, de: this.f1 }), this.f2 ? h('span', null, L({ en: ' and ', de: ' und ' }), L(nameOf(this.f2) ?? { en: this.f2, de: this.f2 })) : null)
          : h('div', { class: 'zl-where-sub muted' }, L(e!.name))),
      ...(right ? [right] : []));
  }

  /** The live value of one rung (two lines when a second sample is open). */
  private rungValue(r: Rung): (string | HTMLElement)[] {
    if (this.mode === 'sample') {
      const one = (f: string, g: number) => {
        const n = g / molarMass(f), k = kindOf(f);
        if (r === 'grams') return gram(g);
        if (r === 'moles') return mols(n);
        if (r === 'count') return `${sci(n * N_A)} ${L(KIND_WORD[k].many)}`;
        return k === 'formula-unit' ? L({ en: `${formulaText(f)} formula unit`, de: `${formulaText(f)}-Formel\u00adeinheit` }) : this.particleTag(f);
      };
      return [one(this.f1, this.g1), ...(this.f2 ? [h('span', { class: 'two' }, one(this.f2, this.g2))] : [])];
    }
    const e = this.eq, sp = this.species(), nr = e.reactants.length;
    if (this.mode === 'equation') {
      const c = this.coeffs, join = (a: number[]) => a.join(' + ');
      const gl = sp.slice(0, nr).reduce((s, x, i) => s + c[i] * molarMass(x.f), 0), gr = sp.slice(nr).reduce((s, x, i) => s + c[i + nr] * molarMass(x.f), 0);
      if (r === 'grams') return [`${num(gl, 2)} → ${num(gr, 2)} g`];
      if (r === 'moles') return [`${join(c.slice(0, nr))} → ${join(c.slice(nr))} mol`];
      if (r === 'count') return [h('span', null, `${join(c.slice(0, nr))} → ${join(c.slice(nr))} `, `${times()} `, NA())];
      return [`${join(c.slice(0, nr))} → ${join(c.slice(nr))} ${L(PARTICLES)}`];
    }
    const res = this.result, a = res ? res.amounts : this.inputs;
    if (r === 'grams') return [gram(a.reduce((s, x, i) => s + x * molarMass(e.reactants[i].f), 0))];
    if (r === 'moles') return [a.map((x) => (x > 0 && x < 0.001 ? sci(x) : numTrim(x, 3))).join(' + ') + ' mol'];
    if (r === 'count') return [`${sci(a.reduce((s, x) => s + x, 0) * N_A)} ${L({ en: 'molecules', de: 'Moleküle' })}`];
    const pic = res ? res.pic : this.picture(a).pic;
    return [`${pic.join(' + ')} ${L(PARTICLES)}`];
  }

  private drawStrip() {
    this.strip.replaceChildren(...RUNGS.map((r, i) => {
      const inner = [h('span', { class: 'zl-rung-name' }, h('i', { 'aria-hidden': 'true' }, String(i + 1)), L(RUNG_NAME[r])), h('span', { class: 'zl-rung-val' }, ...this.rungValue(r))];
      return this.compact
        ? h('div', { class: 'zl-rung' + (r === this.rung ? ' on' : ''), role: 'listitem', 'aria-current': r === this.rung ? 'true' : null }, ...inner)
        : h('button', { class: 'zl-rung' + (r === this.rung ? ' on' : ''), type: 'button', 'data-rung': r, 'aria-pressed': String(r === this.rung), onclick: () => this.setRung(r) }, ...inner);
    }));
  }

  /** The rung's relation written out with the numbers: n = m / M, N = n × N_A, … */
  private drawCalc() {
    const x = times(), r = this.rung, rows: (Node | string)[][] = [];
    if (this.mode === 'sample') {
      for (const [f, g] of [[this.f1, this.g1], ...(this.f2 ? [[this.f2, this.g2]] : [])] as [string, number][]) {
        const M = molarMass(f), n = g / M, k = kindOf(f);
        const tag = this.f2 ? [fchem(f), ': '] : [];
        if (r === 'grams') rows.push([...tag, h('i', null, 'm'), ` = ${gram(g)}`, h('span', { class: 'muted' }, `   M = ${molar(M)}`)]);
        else if (r === 'moles') rows.push([...tag, h('i', null, 'n'), ' = ', h('i', null, 'm'), ' / ', h('i', null, 'M'), ` = ${gram(g)} ÷ ${molar(M)} = `, h('strong', null, mols(n))]);
        else if (r === 'count') rows.push([...tag, h('i', null, 'N'), ' = ', h('i', null, 'n'), ` ${x} `, NA(), ` = ${mols(n)} ${x} ${naText()} = `, h('strong', null, `${sci(n * N_A)} ${L(KIND_WORD[k].many)}`)]);
        else rows.push([...tag, this.particleLine(f)]);
      }
      if (r === 'count') rows.push([h('span', { class: 'muted' }, L({ en: `The ruler climbs in powers of ten; each band is ${x} 1000, like the cube of 10 ${x} 10 ${x} 10 dots. 1 mol sits 23 powers of ten up.`, de: `Das Lineal steigt in Zehnerpotenzen; jedes Band ist ${x} 1000, wie der Würfel aus 10 ${x} 10 ${x} 10 Punkten. 1 mol liegt 23 Zehnerpotenzen höher.` }))]);
      if (r === 'particles' && this.f2) rows.push([h('span', { class: 'muted' }, L({ en: 'The two groups keep the ratio of the counts, not every particle.', de: 'Die beiden Gruppen zeigen das Verhältnis der Teilchenzahlen, nicht jedes Teilchen.' }))]);
    } else if (this.mode === 'equation') {
      const sp = this.species(), nr = this.eq.reactants.length, c = this.coeffs;
      const sum = (a: number, b: number) => sp.slice(a, b).map((s, i) => `${c[a + i]} ${x} ${numTrim(molarMass(s.f), 3)}`).join(' + ');
      const tot = (a: number, b: number) => sp.slice(a, b).reduce((s, q, i) => s + c[a + i] * molarMass(q.f), 0);
      if (r === 'grams') {
        rows.push([L({ en: 'left: ', de: 'links: ' }), `${sum(0, nr)} = `, h('strong', null, gram(tot(0, nr)))]);
        rows.push([L({ en: 'right: ', de: 'rechts: ' }), `${sum(nr, sp.length)} = `, h('strong', null, gram(tot(nr, sp.length)))]);
        rows.push([h('span', { class: 'muted' }, this.tally().ok && !this.trap ? L({ en: 'Balanced: the same atoms on both sides, so the same mass.', de: 'Ausgeglichen: auf beiden Seiten dieselben Atome, also dieselbe Masse.' }) : L({ en: 'One mole of each particle, in grams: equal once every element balances.', de: 'Je ein Mol jedes Teilchens, in Gramm: gleich, sobald jedes Element ausgeglichen ist.' }))]);
      } else if (r === 'moles' || r === 'count') {
        const unit = r === 'moles' ? 'mol ' : `${x} ${naText().replace(' mol⁻¹', '')} `;
        rows.push([sp.map((s, i) => `${c[i]} ${unit}${formulaText(s.f)}`).slice(0, nr).join(' + ') + ' → ' + sp.slice(nr).map((s, i) => `${c[nr + i]} ${unit}${formulaText(s.f)}`).join(' + ')]);
        rows.push([h('span', { class: 'muted' }, L({ en: 'The coefficients count particles: in mol, or in single molecules, the ratio is the same.', de: 'Die Koeffizienten zählen Teilchen: in Mol oder in einzelnen Molekülen, das Verhältnis bleibt gleich.' }))]);
      } else rows.push([h('span', { class: 'muted' }, L({ en: 'Each coefficient sets how many particles of that kind take part. Count the atoms of each element on both sides.', de: 'Jeder Koeffizient gibt an, wie viele Teilchen dieser Art beteiligt sind. Zähle die Atome jedes Elements auf beiden Seiten.' }))]);
    } else {
      const e = this.eq, a = this.result ? this.result.amounts : this.inputs;
      if (r === 'grams' || r === 'moles' || r === 'count') {
        e.reactants.forEach((s, i) => {
          const M = molarMass(s.f), n = a[i];
          rows.push([fchem(s.f), ': ', h('i', null, 'n'), ' = ', h('i', null, 'm'), ' / ', h('i', null, 'M'), ` = ${gram(n * M)} ÷ ${molar(M)} = `, h('strong', null, mols(n))]);
        });
      } else if (this.rxBy !== 'particles') {
        const exact = this.result ? this.result.exact : this.picture(a).exact;
        rows.push([h('span', { class: 'muted' }, exact
          ? L({ en: 'The picture keeps the ratio, not every molecule.', de: 'Das Bild zeigt das Verhältnis, nicht jedes Molekül.' })
          : L({ en: 'The picture keeps which reactant runs out; the real ratio is too large to draw.', de: 'Das Bild zeigt, welches Edukt zuerst verbraucht ist; das echte Verhältnis ist zu groß zum Zeichnen.' }))]);
      }
      else rows.push([h('span', { class: 'muted' }, L({ en: `Groups combine as the equation says: ${e.reactants.map((s) => `${s.c} ${formulaText(s.f)}`).join(' + ')} → ${e.products.map((s) => `${s.c} ${formulaText(s.f)}`).join(' + ')}.`, de: `Gruppen reagieren so, wie es die Gleichung angibt: ${e.reactants.map((s) => `${s.c} ${formulaText(s.f)}`).join(' + ')} → ${e.products.map((s) => `${s.c} ${formulaText(s.f)}`).join(' + ')}.` }))]);
    }
    this.calc.replaceChildren(...rows.map((cells) => h('div', { class: 'zl-calc-row' }, ...cells)));
  }

  /** What one particle of f is, in words. */
  private particleLine(f: string): HTMLElement {
    const k = kindOf(f), ions = ionRatio(f);
    if (k === 'formula-unit') return h('span', null, L({ en: `No molecules: ions in a lattice. One formula unit ${ions ?? formulaText(f)}. Schematic.`, de: `Keine Moleküle: Ionen in einem Gitter. Eine Formeleinheit ${ions ?? formulaText(f)}. Schematisch.` }));
    if (k === 'atom') return h('span', null, L({ en: `Single ${formulaText(f)} atoms, packed side by side.`, de: `Einzelne ${formulaText(f)}-Atome, dicht an dicht.` }));
    const atoms = Object.entries(parseFormula(f)).map(([el, n]) => `${n} ${el}`).join(' + ');
    return h('span', null, L({ en: `One ${formulaText(f)} molecule: ${atoms}. `, de: `Ein ${formulaText(f)}-Molekül: ${atoms}. ` }),
      h('span', { class: 'muted' }, hasTrueShape(f) ? L({ en: 'Shape as measured, sizes schematic.', de: 'Form wie gemessen, Größen schematisch.' }) : L({ en: 'Schematic cluster, not the real shape.', de: 'Schematisches Knäuel, nicht die echte Form.' })));
  }

  private pressed(sel: string, attr: string, val: string) {
    this.ctrl.querySelectorAll(sel).forEach((b) => b.setAttribute('aria-pressed', String((b as HTMLElement).getAttribute(attr) === val)));
  }

  private drawControls() {
    if (this.mode === 'sample') {
      this.pressed('[aria-label="' + L({ en: 'Sample', de: 'Stoffportion' }) + '"] .chip', 'data-id', this.s1);
      this.pressed('[aria-label="' + L({ en: 'Compare with', de: 'Vergleichen mit' }) + '"] .chip', 'data-id', this.s2 ?? '');
      this.pressed('.zl-mass [data-unit]', 'data-unit', this.unit);
      this.pressed('.zl-by [data-by]', 'data-by', this.by);
      const by = this.ctrl.querySelector('.zl-by') as HTMLElement | null;
      if (by) by.hidden = !this.s2;
      const label = this.ctrl.querySelector('.zl-mass-label')!;
      label.replaceChildren(h('span', { class: 'muted' }, L({ en: 'On the balance', de: 'Auf der Waage' })), ' ', h('strong', null, this.unit === 'g' ? gram(this.g1) : mols(this.n1)));
      const steps = this.unit === 'g' ? [-100, -10, -1, -0.1, 0.1, 1, 10, 100] : [-1, -0.1, -0.01, 0.01, 0.1, 1];
      const fmt = this.unit === 'g' ? (x: number) => numTrim(x, 1) : (x: number) => numTrim(x, 2);
      const box = this.ctrl.querySelector('.zl-mass-steps')!;
      box.replaceChildren(this.stepper(steps, fmt, (d) => this.step(d), this.unit === 'g' ? { en: 'Change the mass in g', de: 'Masse in g ändern' } : { en: 'Change the amount in mol', de: 'Stoffmenge in mol ändern' }),
        h('div', { class: 'zl-unit-note muted' }, this.unit === 'g' ? L({ en: 'steps in grams', de: 'Schritte in Gramm' }) : L({ en: 'steps in mol', de: 'Schritte in mol' })));
      box.querySelectorAll<HTMLButtonElement>('.zl-step').forEach((b) => {
        const d = +b.dataset.step!;
        b.disabled = this.unit === 'g' ? (d < 0 ? this.g1 <= 0.1 + 1e-9 : this.g1 >= MAX_G - 1e-9) : (d < 0 ? this.n1 <= 0.01 + 1e-9 : this.n1 >= MAX_MOL - 1e-9);
      });
      const bd = this.ctrl.querySelector('.zl-bd-btn');
      bd?.setAttribute('aria-expanded', String(this.breakdown));
      return;
    }
    this.pressed('[aria-label="' + L({ en: 'Reaction', de: 'Reaktion' }) + '"] .chip', 'data-id', this.eqId);
    const line = this.ctrl.querySelector('.zl-eqline')!;
    line.replaceChildren(...this.equationLine(this.mode === 'equation' && !this.trap));
    if (this.mode === 'equation') {
      this.ctrl.querySelector('.zl-tally')!.replaceChildren(this.tallyTable());
      const tb = this.ctrl.querySelector('.zl-trap-btn') as HTMLButtonElement | null;
      if (tb) {
        tb.hidden = !this.eq.trap;
        tb.setAttribute('aria-pressed', String(this.trap));
        tb.textContent = this.trap ? L({ en: 'Undo: change the subscript back', de: 'Rückgängig: Index zurücksetzen' }) : L({ en: 'Change a subscript instead', de: 'Stattdessen einen Index ändern' });
      }
      return;
    }
    const unit = this.rungUnit(), e = this.eq;
    const a = this.inputs, pic = this.picture(a).pic;
    const box = this.ctrl.querySelector('.zl-amounts')!;
    const steps = unit === 'particles' ? [-1, 1] : unit === 'mol' ? [-1, -0.1, 0.1, 1] : [-10, -1, 1, 10];
    box.replaceChildren(
      h('div', { class: 'zl-row-label' }, unit === 'particles' ? L({ en: 'Molecules of each reactant (0–12)', de: 'Moleküle je Edukt (0–12)' }) : unit === 'mol' ? L({ en: 'Amount of each reactant in mol', de: 'Stoffmenge je Edukt in mol' }) : L({ en: 'Mass of each reactant in g', de: 'Masse je Edukt in g' })),
      ...e.reactants.map((s, i) => {
        const val = unit === 'particles' ? (this.rxBy === 'particles' ? String(Math.round(a[i] * N_A)) : `${pic[i]}*`) : unit === 'mol' ? mols(a[i]) : gram(a[i] * molarMass(s.f));
        return h('div', { class: 'zl-amount' }, h('span', { class: 'zl-amount-name' }, fchem(s.f)), h('strong', { class: 'zl-amount-val' }, val),
          this.stepper(steps, (x) => (unit === 'particles' ? '1' : numTrim(x, 1)), (d) => this.setAmount(i, d), { en: `Change ${s.f}`, de: `${s.f} ändern` }));
      }),
      unit === 'particles' && this.rxBy !== 'particles' ? h('div', { class: 'muted small' }, L({ en: '* the picture of the amounts you set in mol or g; a step here switches to molecules', de: '* Bild der Mengen in mol oder g; ein Schritt hier stellt auf Moleküle um' })) : '');
  }

  /** The equation as a line of species, each with its coefficient (a stepper in equation mode). */
  private equationLine(steppers: boolean): Node[] {
    const sp = this.species(), nr = this.eq.reactants.length, out: Node[] = [];
    const t = this.trap ? this.eq.trap : undefined;
    sp.forEach((s, k) => {
      if (k === nr) out.push(h('span', { class: 'zl-arrow', 'aria-label': L({ en: 'react to', de: 'reagieren zu' }) }, '→'));
      else if (k > 0) out.push(h('span', { class: 'zl-plus' }, '+'));
      const swapped = !!t && ((t.side === 'r' && k === t.i) || (t.side === 'p' && k === nr + t.i));
      const c = this.mode === 'equation' ? this.coeffs[k] : s.c;
      const coef = steppers
        ? h('span', { class: 'zl-coef' },
          h('button', { type: 'button', class: 'zl-cbtn', 'aria-label': L({ en: `fewer ${s.f}`, de: `weniger ${s.f}` }), disabled: c <= 1, onclick: () => this.setCoeff(k, -1) }, '−'),
          h('strong', { class: 'zl-cval' }, String(c)),
          h('button', { type: 'button', class: 'zl-cbtn', 'aria-label': L({ en: `more ${s.f}`, de: `mehr ${s.f}` }), disabled: c >= 9, onclick: () => this.setCoeff(k, 1) }, '+'))
        : h('strong', { class: 'zl-cval fixed' }, c === 1 && this.mode === 'reaction' ? '' : String(c));
      if (!steppers && this.mode === 'equation' && c === 1) coef.textContent = '1';
      out.push(h('span', { class: 'zl-species' + (swapped ? ' swapped' : '') }, coef, fchem(s.f)));
    });
    return out;
  }

  private tallyTable(): HTMLElement {
    const { rows } = this.tally();
    return h('table', { class: 'zl-tally-t' },
      h('thead', null, h('tr', null, h('th', null, L({ en: 'element', de: 'Element' })), h('th', null, L({ en: 'left', de: 'links' })), h('th', null, ''), h('th', null, L({ en: 'right', de: 'rechts' })))),
      h('tbody', null, ...rows.map((x) => h('tr', { class: x.l === x.r ? 'ok' : 'off' },
        h('td', null, x.el), h('td', null, String(x.l)), h('td', { class: 'zl-mark' }, x.l === x.r ? '✓' : '≠'), h('td', null, String(x.r))))));
  }

  private drawInfo() {
    clear(this.info);
    if (this.mode === 'sample') {
      if (this.breakdown) this.info.append(this.breakdownPanel(this.f1));
      if (this.f2 && !this.compact) {
        const N1 = this.n1 * N_A, N2 = (this.g2 / molarMass(this.f2)) * N_A, M1 = this.M1, M2 = molarMass(this.f2);
        const text = this.by === 'mass'
          ? L({ en: `Same mass, ${gram(this.g1)} each. The ${formulaText(M1 < M2 ? this.f1 : this.f2)} particles are lighter, so that sample holds ${num(Math.max(N1, N2) / Math.min(N1, N2), 2)} times as many.`, de: `Gleiche Masse, je ${gram(this.g1)}. Die ${formulaText(M1 < M2 ? this.f1 : this.f2)}-Teilchen sind leichter, also enthält diese Portion ${num(Math.max(N1, N2) / Math.min(N1, N2), 2)}-mal so viele.` })
          : L({ en: `Same amount, ${mols(this.n1)} each: the same number of particles. The ${formulaText(M1 > M2 ? this.f1 : this.f2)} sample is ${num(Math.max(M1, M2) / Math.min(M1, M2), 2)} times as heavy.`, de: `Gleiche Stoffmenge, je ${mols(this.n1)}: gleich viele Teilchen. Die ${formulaText(M1 > M2 ? this.f1 : this.f2)}-Portion ist ${num(Math.max(M1, M2) / Math.min(M1, M2), 2)}-mal so schwer.` });
        this.info.append(h('p', { class: 'zl-band' }, text));
      }
      return;
    }
    if (this.compact) this.info.append(h('div', { class: 'zl-eqline ro' }, ...this.equationLine(false)));
    if (this.mode === 'equation') {
      if (this.trap && this.eq.trap) {
        const t = this.eq.trap, orig = t.side === 'r' ? this.eq.reactants[t.i].f : this.eq.products[t.i].f;
        this.info.append(h('p', { class: 'zl-band warn', role: 'status' },
          h('strong', null, L({ en: 'Not allowed. ', de: 'Nicht erlaubt. ' })),
          L({ en: 'The count works now, but ', de: 'Die Atomzahlen stimmen jetzt, aber ' }), fchem(t.alt),
          L({ en: ` is ${L(t.altName)}, a different substance from `, de: ` ist ${L(t.altName)}, ein anderer Stoff als ` }), fchem(orig),
          L({ en: '. A subscript says what the substance is; balance with the coefficients in front.', de: '. Der Index legt fest, um welchen Stoff es geht; ausgleichen darfst du nur mit den Koeffizienten davor.' })));
      } else if (this.compact) this.info.append(this.tallyTable());
      return;
    }
    this.info.append(this.reactionPanel());
  }

  private breakdownPanel(f: string): HTMLElement {
    const sh = massShares(f), M = molarMass(f), x = times();
    const ions = ionRatio(f);
    return h('div', { class: 'panel zl-bd' },
      h('div', { class: 'ob-head' }, h('strong', null, L({ en: 'What’s in the formula?', de: 'Was steckt in der Formel?' }), ' ', fchem(f)),
        h('span', { class: 'muted small' }, ions ? L({ en: `per formula unit (${ions})`, de: `pro Formeleinheit (${ions})` }) : L({ en: `per ${KIND_WORD[kindOf(f)].one.en}`, de: `pro ${KIND_WORD[kindOf(f)].one.de}` }))),
      h('div', { class: 'zl-bd-atoms' }, ...sh.map((s) => h('span', { class: 'zl-bd-atom' }, h('i', { style: `background:${atomCss(s.el)}`, 'aria-hidden': 'true' }), `${s.el} ${x} ${s.n}`))),
      h('div', { class: 'zl-bd-sum' }, h('i', null, 'M'), ' = ', sh.map((s) => (s.n > 1 ? `${s.n} ${x} ${numTrim(s.mass / s.n, 3)}` : numTrim(s.mass, 3))).join(' + '), ' = ', h('strong', null, molar(M))),
      h('div', { class: 'zl-bd-bars' }, ...sh.map((s) => h('div', { class: 'zl-bd-row' },
        h('span', { class: 'zl-bd-el' }, s.el),
        h('span', { class: 'gbar' }, h('i', { style: `width:${Math.max(1.5, s.share * 100)}%;background:${atomCss(s.el)}` })),
        h('span', { class: 'zl-bd-pct' }, `${num(s.share * 100, 1)} %`)))),
      h('p', { class: 'muted small', style: 'margin:6px 0 0' }, L({ en: 'Mass share of each element: its atoms’ mass divided by the molar mass.', de: 'Massenanteil jedes Elements: die Masse seiner Atome geteilt durch die molare Masse.' })));
  }

  private reactionPanel(): HTMLElement {
    const e = this.eq, r = this.result, wrap = h('div', { class: 'zl-rx' });
    if (!r) {
      wrap.append(h('p', { class: 'muted small', style: 'margin:0' }, L({ en: 'Set the amounts, then press React.', de: 'Stelle die Mengen ein und tippe auf „Reagieren lassen“.' })));
      return wrap;
    }
    if (this.stage.animating) {
      wrap.append(h('p', { class: 'muted small', style: 'margin:0' }, L({ en: 'Reacting …', de: 'Reaktion läuft …' })));
      return wrap;
    }
    const unitOf = (n: number) => { const k = Math.round(n * N_A); return r.by === 'particles' ? `${k} ${L(k === 1 ? { en: 'molecule', de: 'Molekül' } : { en: 'molecules', de: 'Moleküle' })}` : mols(n); };
    wrap.append(
      h('p', { class: 'zl-band ' + (r.limiting < 0 ? 'ok' : 'warn'), role: 'status' }, r.limiting < 0
        ? L({ en: 'Nothing left over: the amounts were in the ratio of the coefficients.', de: 'Nichts übrig: Die Mengen standen im Verhältnis der Koeffizienten.' })
        : h('span', null, h('strong', null, fchem(e.reactants[r.limiting].f), L({ en: ' runs out first', de: ' ist zuerst verbraucht' })), L({ en: ` (the limiting reactant).`, de: ` (das limitierende Edukt).` }))),
      h('table', { class: 'zl-rx-t' },
        h('thead', null, h('tr', null, h('th', null, ''), h('th', null, h('i', null, 'n')), h('th', null, h('i', null, 'n'), ' ÷ ', L({ en: 'coeff.', de: 'Koeff.' })), h('th', null, L({ en: 'left over', de: 'übrig' })))),
        h('tbody', null, ...e.reactants.map((s, i) => h('tr', { class: i === r.limiting ? 'lim' : '' },
          h('td', null, fchem(s.f)), h('td', null, unitOf(r.amounts[i])), h('td', null, `${r.by === 'particles' ? numTrim(r.amounts[i] * N_A / s.c, 2) : numTrim(r.amounts[i] / s.c, 3)}`),
          h('td', null, r.leftover[i] > 0 && i !== r.limiting ? unitOf(r.leftover[i]) : '–'))))),
      h('div', { class: 'zl-rx-prod' }, ...e.products.map((s, j) => h('div', null,
        L({ en: 'Product ', de: 'Produkt ' }), fchem(s.f), ': ', h('strong', null, r.by === 'particles' ? unitOf(r.product[j]) : mols(r.product[j])),
        r.by === 'particles' ? null : ` = ${gram(r.product[j] * molarMass(s.f))}`,
        j === 0 && r.by !== 'particles' ? h('span', { class: 'muted' }, L({ en: ' (theoretical yield)', de: ' (theoretische Ausbeute)' })) : null))));
    if (this.c.yield && r.by !== 'particles' && !this.compact) wrap.append(this.yieldPanel());
    else if (this.actual !== null && r.by !== 'particles') wrap.append(this.yieldLine());
    if (r.by === 'particles' && this.c.yield && !this.compact) wrap.append(h('p', { class: 'muted small', style: 'margin:0' }, L({ en: 'For the yield, set the amounts in mol or g (Moles or Grams rung) and react.', de: 'Für die Ausbeute stelle die Mengen in mol oder g ein (Stufe Mol oder Gramm) und lass reagieren.' })));
    return wrap;
  }

  private yieldLine(): HTMLElement {
    const theo = this.theoretical(), pct = theo > 0 ? ((this.actual ?? 0) / theo) * 100 : 0;
    return h('div', { class: 'zl-yield-line' },
      L({ en: 'Percent yield = actual ÷ theoretical × 100 % = ', de: 'Ausbeute in Prozent = tatsächlich ÷ theoretisch · 100 % = ' }),
      `${gram(this.actual ?? 0)} ÷ ${gram(theo)} ${getTimes100()} = `, h('strong', null, `${num(pct, 1)} %`),
      pct > 100.05 ? h('span', { class: 'zl-yield-warn' }, L({ en: ' More than 100 %: the product is still wet or impure.', de: ' Über 100 %: Das Produkt ist noch feucht oder verunreinigt.' })) : null);
  }

  private yieldPanel(): HTMLElement {
    const f = this.eq.products[0].f;
    return h('div', { class: 'wb-equation zl-yield' },
      h('div', { class: 'wb-eq-head' }, h('span', null, L({ en: 'Actual mass collected', de: 'Tatsächlich gewonnene Masse' }), ' ', fchem(f)), h('strong', null, gram(this.actual ?? 0))),
      this.stepper([-10, -1, -0.1, 0.1, 1, 10], (x) => numTrim(x, 1), (d) => this.setActual(d), { en: 'Change the actual mass', de: 'Tatsächliche Masse ändern' }),
      this.yieldLine());
  }

  // ---------- show ----------

  /** Show what a reveal or worked example asks for (idempotent; switches modes as needed). */
  show(s: Extract<Show, { engine: 'ladder' }>) {
    this.stage.finishAnimation();
    if (s.sub && ladderSample(s.sub)) {
      this.mode = 'sample';
      this.setupMode();
      this.s1 = s.sub;
      const M = molarMass(formulaOf(s.sub));
      this.g1 = s.grams !== undefined ? THREE_clamp(s.grams, 0.001, MAX_G * 10) : s.mol !== undefined ? s.mol * M : M;
      this.unit = s.mol !== undefined && s.grams === undefined ? 'mol' : 'g';
      this.s2 = s.compare && ladderSample(s.compare) ? s.compare : null;
      this.by = s.by ?? 'mass';
      this.breakdown = !!s.breakdown;
      this.rung = s.rung ?? 'grams';
      this.rebuild();
      return;
    }
    if (!s.eq || !equation(s.eq)) return;
    this.mode = s.amounts ? 'reaction' : 'equation';
    this.setupMode();
    this.eqId = s.eq;
    const e = this.eq, n = e.reactants.length + e.products.length;
    this.trap = false;
    this.result = null;
    this.actual = null;
    this.rung = s.rung ?? 'particles';
    if (this.mode === 'equation') {
      this.coeffs = Array.from({ length: n }, (_, i) => THREE_clamp(Math.round(s.coeffs?.[i] ?? 1), 1, 9));
      if (s.trap && e.trap) { this.saved = [...this.coeffs]; this.trap = true; this.coeffs = this.solve(); }
      this.rebuild();
      return;
    }
    this.coeffs = Array.from({ length: n }, () => 1);
    this.rxBy = 'mol';
    this.inputs = e.reactants.map((_, i) => Math.max(0, s.amounts![i] ?? 0));
    if (s.react || s.actual !== undefined) {
      const an = this.analyse(this.inputs, 'mol');
      this.result = { by: 'mol', amounts: [...this.inputs], limiting: an.limiting, leftover: an.leftover, product: an.product, ...this.picture(this.inputs) };
      this.actual = s.actual ?? null;
      // the reaction plays where it can be seen; on another rung (a yield reveal on grams) it shows the end state
      this.animateNext = this.rung === 'particles';
    }
    this.rebuild();
  }

  dispose() {
    clearTimeout(this.settle);
    clearTimeout(this.yieldTimer);
    this.listeners.clear();
    this.stage.dispose();
  }
}
