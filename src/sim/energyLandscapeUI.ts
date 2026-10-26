// The Energy Landscape as a screen component (units 17, 18, 20; later 23). Three modes on one stage:
// - bonds (unit 17): reactants at 0; "Break the bonds" lifts them to the separated atoms (+ the bonds broken),
//   "Make the new bonds" drops them to the products (− the bonds formed); the estimate ΔH = broken − formed is written
//   out, and the measured value (thermo.ts, gas phase) can be shown beside it.
// - hess (unit 18): the target's ΔH starts unknown; step reactions from a tray are added to a route, reversed and
//   scaled; a species tally says when the route adds up to the target, and the cycle is drawn. "Via the elements"
//   draws the elements at 0 and ΔrH = ΣΔfH(products) − ΣΔfH(reactants).
// - gibbs (unit 20): bars for ΔH, −T·ΔS and their sum ΔG at temperature T, a temperature slider with the crossover
//   marked, "Reverse the reaction", and the four sign cases.
// All numbers come from src/content/thermo.ts (ΔfH, S°, reactions, bond counts) and bonds.ts (bond energies).
import './energyLandscape.css';
import { EnergyLandscapeStage, molecule, loneAtom, type EnergyView, type Level, type Arrow, type Guide, type Bar, type Mark, type Mol3 } from './energyLandscape';
import { THERMO, REACTIONS, BOND_REACTIONS, reaction, bondReaction, bondEstimate, bondEnergy, dH, dS, crossover, type Reaction, type Term } from '../content/thermo';
import { parseFormula } from '../content/stoich';
import type { Show } from '../content/unitTypes';
import { h, chem, chemText } from '../ui/dom';
import { L, num, getLang } from '../i18n';
import { buzz } from '../platform';

export interface EnergyLandscapeUIOptions {
  /** 'bonds' (unit 17), 'hess' (unit 18) or 'gibbs' (unit 20). */
  mode?: 'bonds' | 'hess' | 'gibbs';
  /** First reaction: a BOND_REACTIONS id in bonds mode, a REACTIONS id otherwise. */
  start?: string;
  /** Reaction chips offered (same id kind as start). */
  reactions?: string[];
  /** Hess mode: the step reactions offered for building a route to the target (REACTIONS ids). */
  steps?: string[];
  compact?: boolean;
  /** Default: all on (not shown in compact mode, except what show() needs). */
  controls?: { measured?: boolean; elements?: boolean; temp?: boolean };
}
type Fn = (...a: any[]) => void;
type Mode = 'bonds' | 'hess' | 'gibbs';
type EnergyShow = Extract<Show, { engine: 'energy' }>;
type BStage = 'start' | 'broken' | 'formed' | 'both';
/** A step on the Hess route: a REACTIONS id, reversed or not, times a factor. */
interface Entry { id: string; rev: boolean; f: number; }
type Vec = Map<string, number>;

const HESS_REACTIONS = ['c-co', 'diamond-graphite', 'h2-burn-g', 'ch4-burn-g'];
const HESS_STEPS: Record<string, string[]> = {
  'c-co': ['c-co2', 'co-co2'], 'diamond-graphite': ['diamond-burn', 'c-co2'],
  'h2-burn-g': ['h2-burn-l', 'water-boil'], 'ch4-burn-g': ['ch4-burn', 'water-boil'],
};
const GIBBS_REACTIONS = ['caco3', 'nh3', 'no2-dimer', 'h2o2', 'ice-melt', 'water-boil', 'thermite'];
/** Smallest and largest factor a step can be scaled to (×½ and ×2 buttons). */
const F_MIN = 0.25, F_MAX = 4;

// ---------- formatting ----------

const MINUS = '−';
const tr = (en: string, de: string) => L({ en, de });
const times = () => (getLang() === 'de' ? '·' : '×');
const digitsFor = (x: number) => (Math.abs(x) < 10 && Math.abs(x) >= 0.005 ? 2 : 1);
/** A signed energy: +179.2, −110.5, −1.89 (decimals: `d`, or one, two below 10). */
function kj(x: number, d = digitsFor(x)): string {
  if (Number(Math.abs(x).toFixed(d)) === 0) return '0';
  return (x > 0 ? '+' : MINUS) + num(Math.abs(x), d);
}
/** A value in brackets with its sign, for written-out sums: (−91.8). */
const par = (x: number, d?: number) => `(${kj(x, d)})`;
/** Terms of a sum written out: −393.5 + 283.0 (one number of decimals for all). */
function sumText(xs: number[], d: number): string {
  return xs.map((x, i) => {
    const v = num(Math.abs(x), d);
    return i === 0 ? (x < 0 ? MINUS + v : v) : x < 0 ? ` ${MINUS} ${v}` : ` + ${v}`;
  }).join('');
}
const celsius = (T: number) => Math.round(T - 273.15);
const tempText = (T: number) => `${num(Math.round(T), 0)} K (${celsius(T) < 0 ? MINUS : ''}${num(Math.abs(celsius(T)), 0)} °C)`;
const circled = (k: number) => String.fromCharCode(0x2460 + Math.min(19, k - 1));
function niceStep(span: number, target = 4): number {
  if (!(span > 0)) return 0;
  const raw = span / target, p = 10 ** Math.floor(Math.log10(raw)), m = raw / p;
  return (m < 1.5 ? 1 : m < 3.5 ? 2 : m < 7.5 ? 5 : 10) * p;
}
/** Coefficient text: '', '2 ', '½ ', '³⁄₂ '. */
function coef(c: number): string {
  const a = Math.abs(c);
  if (Math.abs(a - 1) < 1e-9) return '';
  if (Math.abs(a - Math.round(a)) < 1e-9) return `${Math.round(a)} `;
  const SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹';
  for (const q of [2, 4]) {
    const n = Math.round(a * q);
    if (Math.abs(a * q - n) < 1e-9) {
      if (q === 2 && n === 1) return '½ ';
      if (q === 4 && n === 1) return '¼ ';
      if (q === 4 && n === 3) return '¾ ';
      return String(n).split('').map((x) => SUP[+x]).join('') + '⁄' + (q === 2 ? '₂' : '₄') + ' ';
    }
  }
  return `${num(a, 2)} `;
}
const fmtFactor = (f: number) => coef(f).trim() || '1';

// ---------- species ----------

/** Formulas the table holds in more than one form (H₂O liquid and gas, graphite and diamond): those show their form. */
const MULTI = (() => {
  const n = new Map<string, number>();
  for (const e of Object.values(THERMO)) n.set(e.formula, (n.get(e.formula) ?? 0) + 1);
  return new Set([...n].filter(([, k]) => k > 1).map(([f]) => f));
})();
function spParts(sp: string): { f: string; tail: string } {
  const m = /^(.+?)\(([^()]+)\)$/.exec(sp);
  const e = THERMO[sp];
  const f = e?.formula ?? (m ? m[1] : sp);
  if (e && !MULTI.has(e.formula)) return { f, tail: '' };
  if (!m) return { f, tail: '' };
  const phase = /^(s|l|g|aq)$/.test(m[2]);
  return { f, tail: phase ? `(${m[2]})` : `(${e ? L(e.name) : m[2]})` };
}
const spText = (sp: string, c = 1) => { const p = spParts(sp); return `${coef(c)}${chemText(p.f)}${p.tail}`; };
function spHtml(sp: string, c = 1): HTMLElement {
  const p = spParts(sp);
  return h('span', { class: 'nrg-sp' }, coef(c), chem(p.f), p.tail ? h('small', null, p.tail) : null);
}
const joinPlus = (parts: HTMLElement[]) => parts.flatMap((p, i) => (i ? [' + ', p] : [p]));

function vecOf(terms: Term[], k = 1, into: Vec = new Map()): Vec { for (const t of terms) into.set(t.sp, (into.get(t.sp) ?? 0) + k * t.c); return into; }
function addInto(a: Vec, b: Vec, k = 1): Vec { b.forEach((v, s) => a.set(s, (a.get(s) ?? 0) + k * v)); return a; }
function clean(v: Vec): Vec { for (const [s, x] of [...v]) if (Math.abs(x) < 1e-9) v.delete(s); return v; }
const netOf = (r: Reaction, k = 1) => clean(vecOf(r.products, k, vecOf(r.reactants, -k)));
function sameVec(a: Vec, b: Vec) {
  for (const [s, x] of a) if (Math.abs(x - (b.get(s) ?? 0)) > 1e-9) return false;
  for (const [s, x] of b) if (Math.abs(x - (a.get(s) ?? 0)) > 1e-9) return false;
  return true;
}
const sideText = (v: Vec) => [...v].filter(([, c]) => c > 1e-9).map(([s, c]) => spText(s, c)).join(' + ') || '–';
/** The elements as plain symbols: Ca + C + ³⁄₂ O₂. */
const elemText = (v: Vec) => [...v].map(([s, c]) => `${coef(c)}${chemText(spParts(s).f)}`).join(' + ');
const sideHtml = (v: Vec) => joinPlus([...v].filter(([, c]) => c > 1e-9).map(([s, c]) => spHtml(s, c)));
/** "left → right" from a net vector (negative = left). */
function netHtml(v: Vec): HTMLElement {
  const l = new Map([...v].filter(([, c]) => c < 0).map(([s, c]) => [s, -c] as [string, number]));
  const r = new Map([...v].filter(([, c]) => c > 0));
  if (!l.size && !r.size) return h('span', null, tr('nothing: everything cancels', 'nichts: alles hebt sich auf'));
  return h('span', { class: 'nrg-eqn' }, sideHtml(l), ' → ', sideHtml(r));
}
function eqHtml(r: Reaction, k = 1): HTMLElement {
  const a = Math.abs(k), left = k >= 0 ? r.reactants : r.products, right = k >= 0 ? r.products : r.reactants;
  return h('span', { class: 'nrg-eqn' }, joinPlus(left.map((t) => spHtml(t.sp, t.c * a))), ' → ', joinPlus(right.map((t) => spHtml(t.sp, t.c * a))));
}

const entryKey = (e: Entry) => `${e.rev ? '-' : ''}${e.f !== 1 ? `${e.f}*` : ''}${e.id}`;
function parseEntry(k: string): Entry | null {
  const m = /^(-)?(?:(\d+(?:\.\d+)?|½)\*)?(-)?(.+)$/.exec(k.trim());
  if (!m || !reaction(m[4])) return null;
  return { id: m[4], rev: !!m[1] !== !!m[3], f: m[2] ? (m[2] === '½' ? 0.5 : +m[2]) : 1 };
}
const entrySign = (e: Entry) => (e.rev ? -1 : 1) * e.f;
const entryDH = (e: Entry) => entrySign(e) * dH(e.id);

/** The elements in their standard states for a list of species, e.g. CaCO₃ → Ca + C + ³⁄₂ O₂. */
const DIATOMIC = new Set(['H', 'N', 'O', 'F', 'Cl', 'Br', 'I']);
function elementsOf(terms: Term[]): Vec {
  const out: Vec = new Map();
  for (const t of terms) {
    const f = THERMO[t.sp]?.formula;
    if (!f) continue;
    for (const [el, n] of Object.entries(parseFormula(f))) {
      const sp = DIATOMIC.has(el) ? `${el}2(g)` : el === 'C' ? 'C(graphite)' : `${el}(s)`;
      out.set(sp, (out.get(sp) ?? 0) + (t.c * n) / (DIATOMIC.has(el) ? 2 : 1));
    }
  }
  return out;
}
const sumHf = (terms: Term[]) => terms.reduce((s, t) => s + t.c * THERMO[t.sp].dHf, 0);

// ---------- bonds-mode species (from the reaction's equation in thermo.ts) ----------

const fromSub = (s: string) => s.replace(/[₀-₉]/g, (c) => String(c.charCodeAt(0) - 0x2080));
function bondSides(id: string): { l: [number, string][]; r: [number, string][] } {
  const eq = bondReaction(id)!.name.en.replace(/\s*\([^)]*\)/g, '');
  const side = (s: string) => s.split('+').map((x) => x.trim()).filter(Boolean).map((x) => {
    const m = /^(\d+)?\s*(.+)$/.exec(x)!;
    return [m[1] ? +m[1] : 1, fromSub(m[2])] as [number, string];
  });
  const [l, r] = eq.split('→');
  return { l: side(l), r: side(r) };
}
const molsOf = (side: [number, string][]): Mol3[] => side.flatMap(([n, f]) => { const m = molecule(f); return m ? Array.from({ length: n }, () => molecule(f)!) : []; });
function atomsOf(side: [number, string][]): { mols: Mol3[]; text: string } {
  const count = new Map<string, number>();
  for (const [n, f] of side) for (const [el, k] of Object.entries(parseFormula(f))) count.set(el, (count.get(el) ?? 0) + n * k);
  return { mols: [...count].flatMap(([el, n]) => Array.from({ length: n }, () => loneAtom(el))), text: [...count].map(([el, n]) => `${n > 1 ? n + ' ' : ''}${el}`).join(' + ') };
}
const bondName = (key: string) => key.replace('-', '–').replace('#', '≡');
const sideStr = (side: [number, string][]) => side.map(([n, f]) => `${n > 1 ? n + ' ' : ''}${chemText(f)}`).join(' + ');

/** Temperature range of the slider (K): the crossover inside it when there is one within reach, else 200–2000 K. */
function tRange(id: string): [number, number] {
  const tc = crossover(id);
  if (tc === null || tc > 4000) return [200, 2000];
  const lo = Math.min(200, Math.floor((tc * 0.5) / 50) * 50);
  const hi = tc < 700 ? Math.ceil((tc * 2.2) / 100) * 100 : Math.max(2000, Math.ceil((tc * 1.5) / 100) * 100);
  return [lo, hi];
}

const EXO = () => tr('exothermic', 'exotherm');
const ENDO = () => tr('endothermic', 'endotherm');
const heatWord = (x: number) => (x < 0 ? EXO() : x > 0 ? ENDO() : '');

export class EnergyLandscapeUI {
  readonly el: HTMLElement;
  readonly stage: EnergyLandscapeStage;
  private handlers: Record<string, Fn[]> = {};
  private hud: HTMLElement;
  private foot: HTMLElement;
  private chips: HTMLElement | null = null;
  private body: HTMLElement;
  private compact: boolean;
  private c: { measured: boolean; elements: boolean; temp: boolean };
  private mode: Mode;
  private id = '';
  // bonds
  private bstage: BStage = 'start';
  private measuredOn = false;
  private bookEl: HTMLElement | null = null;
  private bBtns: { brk: HTMLButtonElement; make: HTMLButtonElement; again: HTMLButtonElement; meas: HTMLButtonElement | null } | null = null;
  // hess
  private route: Entry[] = [];
  private hview: 'route' | 'elements' | 'direct' = 'route';
  // gibbs
  private T = 298;
  private reversed = false;
  private side = 0;
  private g: { verdict: HTMLElement; calc: HTMLElement; tLabel: HTMLElement | null; slider: HTMLInputElement | null; zones: HTMLElement | null; cross: HTMLElement; cases: HTMLElement; rev: HTMLButtonElement | null } | null = null;

  constructor(public opts: EnergyLandscapeUIOptions = {}) {
    this.compact = !!opts.compact;
    this.c = { measured: true, elements: true, temp: true, ...opts.controls };
    const stageEl = h('div', { class: 'wb-stage nrg-stage' + (this.compact ? ' compact' : '') });
    this.hud = h('div', { class: 'wb-hud nrg-hud' });
    this.foot = h('div', { class: 'nrg-foot' });
    stageEl.append(this.hud, this.foot);
    this.el = h('div', { class: 'workbench nrg' + (this.compact ? ' compact' : '') }, stageEl);
    this.stage = new EnergyLandscapeStage(stageEl, this.compact);
    if (!this.compact) { this.chips = h('div', { class: 'chip-row', role: 'group', 'aria-label': tr('Reaction', 'Reaktion') }); this.el.append(this.chips); }
    this.body = h('div', { class: 'nrg-body' });
    this.el.append(this.body);
    this.mode = opts.mode ?? (opts.start && !bondReaction(opts.start) && reaction(opts.start) ? 'gibbs' : 'bonds');
    this.load(this.validId(opts.start) ?? this.chipIds()[0], false);
  }

  on(evt: string, f: Fn) { (this.handlers[evt] ??= []).push(f); }
  protected emit(evt: string, ...a: unknown[]) { for (const f of this.handlers[evt] ?? []) f(...a); }

  // ---------- reactions ----------

  private validId(id: string | undefined, mode = this.mode): string | null {
    if (!id) return null;
    return mode === 'bonds' ? (bondReaction(id) ? id : null) : reaction(id) ? id : null;
  }
  private chipIds(): string[] {
    const given = (this.opts.reactions ?? []).filter((id) => this.validId(id));
    if (given.length) return given;
    return this.mode === 'bonds' ? BOND_REACTIONS.map((r) => r.id) : this.mode === 'hess' ? HESS_REACTIONS : GIBBS_REACTIONS;
  }
  private chipName(id: string) {
    return this.mode === 'bonds' ? L(bondReaction(id)!.name) : L(reaction(id)!.name);
  }
  private stepIds(): string[] {
    const ids = this.opts.steps ?? HESS_STEPS[this.id] ?? (() => {
      // no list given: every reaction that shares a species with the target
      const t = reaction(this.id)!, sp = new Set([...t.reactants, ...t.products].map((x) => x.sp));
      return REACTIONS.filter((r) => r.id !== this.id && !r.fixed && [...r.reactants, ...r.products].some((x) => sp.has(x.sp))).slice(0, 4).map((r) => r.id);
    })();
    return ids.filter((id) => reaction(id));
  }

  private load(id: string, animate = true) {
    this.id = id;
    this.bstage = 'start';
    this.measuredOn = false;
    this.route = [];
    this.hview = 'route';
    this.reversed = false;
    const [lo, hi] = this.mode === 'gibbs' ? tRange(id) : [0, 0];
    if (this.mode === 'gibbs') this.T = Math.min(hi, Math.max(lo, 298));
    this.renderChips();
    this.build();
    this.refresh(animate);
    this.emit('reaction', id);
  }

  private renderChips() {
    if (!this.chips) return;
    const ids = this.chipIds();
    if (!ids.includes(this.id)) ids.unshift(this.id);
    this.chips.replaceChildren(...ids.map((id) => h('button', {
      class: 'chip', type: 'button', 'data-id': id, 'aria-pressed': String(id === this.id),
      onclick: () => { if (id !== this.id) { buzz('light'); this.load(id); } },
    }, this.chipName(id))));
  }

  // ---------- show (reveals and worked examples) ----------

  show(s: EnergyShow) {
    const mode: Mode = s.mode ?? (bondReaction(s.reaction) ? 'bonds' : 'gibbs');
    if (!this.validId(s.reaction, mode)) return;
    this.mode = mode;
    this.id = s.reaction;
    this.measuredOn = false;
    this.reversed = false;
    this.bstage = mode === 'bonds' ? s.stage ?? 'both' : 'start';
    this.route = mode === 'hess' ? (s.steps ?? []).map(parseEntry).filter((e): e is Entry => !!e) : [];
    this.hview = s.route === 'elements' ? 'elements' : s.route === 'steps' || (s.route === undefined && this.route.length) ? 'route' : 'direct';
    if (mode === 'gibbs') this.T = s.temp ?? 298;
    this.renderChips();
    this.build();
    this.refresh(false);
    this.emit('reaction', this.id);
  }

  // ---------- building the panels below the stage ----------

  private build() {
    this.body.replaceChildren();
    this.bookEl = null; this.bBtns = null; this.g = null;
    if (this.mode === 'bonds') this.buildBonds();
    else if (this.mode === 'gibbs') this.buildGibbs();
  }

  private refresh(animate = true) {
    const view = this.mode === 'bonds' ? this.bondsView() : this.mode === 'hess' ? this.hessView() : this.gibbsView();
    this.stage.setView(view, animate);
    this.foot.textContent = view.step > 0 ? tr(`Axis scaled to this reaction: one step = ${num(view.step, view.step < 1 ? 1 : 0)} kJ/mol`, `Achse auf diese Reaktion skaliert: ein Teilstrich = ${num(view.step, view.step < 1 ? 1 : 0)} kJ/mol`) : '';
    if (this.mode === 'bonds') this.refreshBonds();
    else if (this.mode === 'hess') this.renderHess();
    else this.refreshGibbs();
  }

  private head(title: Node, sub: string) {
    this.hud.replaceChildren(h('div', { class: 'nrg-head' }, h('div', { class: 'wb-formula nrg-title' }, title), h('div', { class: 'muted small' }, sub)));
  }

  // ---------- bonds mode ----------

  private measuredValue(): number | null {
    const m = bondReaction(this.id)?.measured;
    return m ? dH(m) : null;
  }

  private bondsView(): EnergyView {
    const id = this.id, est = bondEstimate(id), sides = bondSides(id), st = this.bstage;
    const meas = this.measuredValue();
    const B = est.broken, F = est.formed, dh = est.dH;
    const hasA = st !== 'start', hasP = st === 'formed' || st === 'both';
    const levels: Level[] = [], arrows: Arrow[] = [], guides: Guide[] = [];
    const R: Level = { key: `R:${id}`, E: 0, x0: -3.05, x1: -0.95, tone: 'react', lines: [sideStr(sides.l), tr('reactants', 'Ausgangsstoffe')], tag: 'below', tagX: -2.25, mols: molsOf(sides.l), dim: hasA };
    levels.push(R);
    const at = atomsOf(sides.l);
    if (hasA) levels.push({ key: `A:${id}`, E: B, x0: -3.05, x1: 3.05, z: -0.1, tone: 'atoms', lines: [at.text, tr('separated atoms', 'getrennte Atome')], tag: 'below', tagX: 0, mols: at.mols, from: R.key, dim: hasP });
    if (hasP) levels.push({ key: `P:${id}`, E: dh, x0: 0.95, x1: 3.05, tone: 'prod', lines: [sideStr(sides.r), tr('products', 'Produkte')], tag: 'below', tagX: 2.25, mols: molsOf(sides.r), from: `A:${id}` });
    if (st === 'broken' || st === 'both') arrows.push({ key: `up:${id}`, x: -1.0, E0: 0, E1: B, lines: [kj(B, 0), tr('bonds broken', 'Bindungen gespalten')], tag: 'left' });
    if (hasP) arrows.push({ key: `down:${id}`, x: 1.0, E0: B, E1: dh, lines: [kj(-F, 0), tr('bonds formed', 'Bindungen geknüpft')], tag: 'right' });
    if (st === 'both') {
      const showMeas = this.measuredOn && meas !== null;
      const lines = [`ΔH ≈ ${kj(dh, 0)}`, heatWord(dh)];
      if (showMeas) lines.push(`${tr('measured', 'gemessen')} ${kj(meas!)}`);
      arrows.push({ key: `dh:${id}`, x: 0, E0: 0, E1: dh, main: true, lines, tag: dh <= 0 ? 'low' : 'high', cls: showMeas ? 'meas' : '' });
      guides.push({ key: 'g0', x0: -0.95, x1: 0, E: 0 }, { key: 'g1', x0: 0, x1: 0.95, E: dh });
      if (showMeas) guides.push({ key: 'meas', x0: -0.6, x1: 3.05, E: meas!, measured: true });
    }
    const lo = Math.min(0, dh, meas ?? 0), hi = B, span = hi - lo;
    const summary = levels.map((l) => `${l.lines[1]}: ${l.lines[0]}, ${kj(l.E, 0)} kJ/mol`).join('; ') + (st === 'both' ? `. ΔH ≈ ${kj(dh, 0)} kJ/mol, ${heatWord(dh)}.` : '.');
    return { levels, arrows, guides, bars: [], marks: [], lo: lo - 0.08 * span, hi, step: niceStep(span), summary };
  }

  private buildBonds() {
    if (!this.compact) {
      const brk = h('button', { class: 'btn small', type: 'button', onclick: () => this.breakBonds() }, tr('Break the bonds', 'Bindungen spalten')) as HTMLButtonElement;
      const make = h('button', { class: 'btn small', type: 'button', onclick: () => this.makeBonds() }, tr('Make the new bonds', 'Neue Bindungen knüpfen')) as HTMLButtonElement;
      const again = h('button', { class: 'btn small quiet', type: 'button', onclick: () => { this.bstage = 'start'; buzz('light'); this.refresh(); } }, tr('Start again', 'Von vorn')) as HTMLButtonElement;
      let meas: HTMLButtonElement | null = null;
      if (this.c.measured) meas = h('button', { class: 'chip small', type: 'button', 'aria-pressed': 'false', onclick: () => this.toggleMeasured() }, tr('Measured', 'Messwert')) as HTMLButtonElement;
      this.bBtns = { brk, make, again, meas };
      this.body.append(h('div', { class: 'nrg-acts' }, brk, make, again));
      if (meas) this.body.append(h('div', { class: 'chip-row wrap' }, meas));
    }
    this.bookEl = h('div', { class: 'panel nrg-book' });
    this.body.append(this.bookEl);
  }

  private breakBonds() {
    if (this.bstage !== 'start') return;
    this.bstage = 'broken';
    buzz('light');
    this.refresh();
    this.emit('broken', this.id, bondEstimate(this.id).broken);
  }
  private makeBonds() {
    if (this.bstage !== 'broken') return;
    this.bstage = 'both';
    buzz('medium');
    this.refresh();
    const est = bondEstimate(this.id);
    this.emit('formed', this.id, est.formed, est.dH);
    this.emitMeasured();
  }
  private toggleMeasured() {
    if (this.measuredValue() === null) return;
    this.measuredOn = !this.measuredOn;
    buzz('light');
    this.refresh();
    this.emitMeasured();
  }
  private emitMeasured() {
    const m = this.measuredValue();
    if (this.measuredOn && m !== null && this.bstage === 'both') this.emit('measured', this.id, bondEstimate(this.id).dH, m);
  }

  private refreshBonds() {
    const br = bondReaction(this.id)!, est = bondEstimate(this.id), st = this.bstage, meas = this.measuredValue();
    const m = /^(.*?)\s*\(([^)]*)\)\s*$/.exec(L(br.name));
    this.head(document.createTextNode(m ? m[1] : L(br.name)), m ? `${m[2]} · ${tr('bond energies: an estimate', 'Bindungsenergien: eine Schätzung')}` : tr('Bond energies: an estimate', 'Bindungsenergien: eine Schätzung'));
    if (this.bBtns) {
      this.bBtns.brk.disabled = st !== 'start';
      this.bBtns.make.disabled = st !== 'broken';
      this.bBtns.again.disabled = st === 'start';
      if (this.bBtns.meas) {
        this.bBtns.meas.disabled = meas === null;
        this.bBtns.meas.setAttribute('aria-pressed', String(this.measuredOn));
      }
    }
    if (!this.bookEl) return;
    const x = times();
    const rows = (list: { bond: string; n: number }[]) => list.map((b) => {
      const e = bondEnergy(b.bond);
      return h('tr', null, h('td', null, `${b.n} ${x} ${bondName(b.bond)}`), h('td', null, num(e, 0)), h('td', null, num(b.n * e, 0)));
    });
    const table = (cls: string, title: string, list: { bond: string; n: number }[], total: number) => h('div', { class: `nrg-sec ${cls}` },
      h('div', { class: 'nrg-sec-head' }, title),
      h('table', { class: 'nrg-table' },
        h('thead', null, h('tr', null, h('th', null, tr('bonds', 'Bindungen')), h('th', null, tr('each', 'je')), h('th', null, tr('total', 'zusammen')))),
        h('tbody', null, rows(list)),
        h('tfoot', null, h('tr', null, h('td', { colspan: '2' }, tr('sum', 'Summe')), h('td', null, `${kj(total, 0)} kJ/mol`)))));
    const parts: (Node | null)[] = [];
    if (st === 'start') parts.push(h('p', { class: 'nrg-hint' }, tr('Start: the reactants at 0 kJ/mol. First break all their bonds.', 'Start: die Ausgangsstoffe bei 0 kJ/mol. Spalte zuerst alle ihre Bindungen.')));
    if (st === 'broken' || st === 'both') parts.push(table('up', tr('↑ Bonds broken: energy taken in (+)', '↑ Gespaltene Bindungen: Energie wird aufgenommen (+)'), br.broken, est.broken));
    if (st === 'formed' || st === 'both') parts.push(table('down', tr('↓ Bonds formed: energy released (−)', '↓ Geknüpfte Bindungen: Energie wird abgegeben (−)'), br.formed, -est.formed));
    if (st === 'broken') parts.push(h('p', { class: 'nrg-hint' }, tr('Now make the bonds of the products.', 'Knüpfe jetzt die Bindungen der Produkte.')));
    if (st === 'both') {
      parts.push(h('div', { class: 'nrg-result ' + (est.dH < 0 ? 'down' : 'up') },
        h('div', null, tr('ΔH ≈ broken − formed', 'ΔH ≈ gespalten − geknüpft')),
        h('strong', null, `= ${num(est.broken, 0)} ${MINUS} ${num(est.formed, 0)} = ${kj(est.dH, 0)} kJ/mol`),
        h('div', { class: 'nrg-word' }, est.dH < 0 ? tr('exothermic: energy is released', 'exotherm: Energie wird abgegeben') : tr('endothermic: energy is taken in', 'endotherm: Energie wird aufgenommen'))));
      if (this.measuredOn && meas !== null) {
        const diff = Math.abs(est.dH - meas);
        parts.push(h('div', { class: 'nrg-measured' },
          h('div', null, tr('Measured (gas phase): ', 'Gemessen (Gasphase): '), h('strong', null, `${kj(meas)} kJ/mol`)),
          h('div', { class: 'muted small' }, tr(`Estimate ${kj(est.dH, 0)} · difference ${num(diff, 1)} kJ/mol`, `Schätzung ${kj(est.dH, 0)} · Differenz ${num(diff, 1)} kJ/mol`))));
      }
      if (this.measuredOn && meas === null) parts.push(h('p', { class: 'muted small' }, tr('No measured value for this reaction in the table.', 'Für diese Reaktion steht kein Messwert in der Tabelle.')));
    }
    if (this.bBtns?.meas && meas === null) parts.push(h('p', { class: 'muted small nrg-note' }, tr('No measured value for this reaction in the table.', 'Für diese Reaktion steht kein Messwert in der Tabelle.')));
    parts.push(h('p', { class: 'muted small nrg-note' }, tr('Average bond energies (OpenStax, Table 7.2) are averages over many molecules: a model, so ΔH is an estimate.', 'Mittlere Bindungsenergien (OpenStax, Tabelle 7.2) sind Mittelwerte über viele Moleküle: ein Modell, ΔH ist daher eine Schätzung.')));
    this.bookEl.replaceChildren(...parts.filter((p): p is Node => !!p));
  }

  // ---------- hess mode ----------

  private routeInfo() {
    const t = reaction(this.id)!;
    const states: Vec[] = [vecOf(t.reactants)];
    const E: number[] = [0];
    for (const e of this.route) {
      states.push(addInto(new Map(states[states.length - 1]), netOf(reaction(e.id)!), entrySign(e)));
      E.push(E[E.length - 1] + entryDH(e));
    }
    const net = clean(this.route.reduce((a, e) => addInto(a, netOf(reaction(e.id)!), entrySign(e)), new Map() as Vec));
    const complete = this.route.length > 0 && sameVec(net, netOf(t));
    // species that would go below zero on the way are carried along on every level (spectators)
    const extra: Vec = new Map();
    for (const s of states) for (const [sp, x] of s) if (x < -1e-9) extra.set(sp, Math.max(extra.get(sp) ?? 0, -x));
    // listed with the species that take part first and the carried-along ones last: CO + ½ O₂
    const shown = states.map((s) => {
      const v = clean(addInto(new Map(s), extra));
      return new Map([...[...v].filter(([sp]) => !extra.has(sp)), ...[...v].filter(([sp]) => extra.has(sp))]);
    });
    return { states: shown, E, net, complete, sum: E[E.length - 1], terms: this.route.map(entryDH) };
  }

  private hessView(): EnergyView {
    const id = this.id, t = reaction(id)!, dT = dH(id);
    const levels: Level[] = [], arrows: Arrow[] = [], guides: Guide[] = [], marks: Mark[] = [];
    let lo = 0, hi = 0, summary = '', elTop = false, elBottom = false;
    const word = (x: number) => heatWord(x);
    if (this.hview === 'elements' && this.elementsOk()) {
      const sR = sumHf(t.reactants), sP = sumHf(t.products), el = elementsOf(t.reactants);
      // the elements' tag goes where nothing else is: above them when they are highest, below when lowest,
      // else above them on the side whose level lies below 0
      const top = Math.max(0, sR, sP) <= 1e-9, bottom = Math.min(0, sR, sP) >= -1e-9;
      elTop = top || !bottom; elBottom = bottom && !top;
      levels.push({ key: `El:${id}`, E: 0, x0: -3.05, x1: 3.05, z: -0.45, depth: 0.55, tone: 'elements', lines: [elemText(el), tr('the elements: 0 by definition', 'die Elemente: per Definition 0')], tag: elBottom ? 'below' : 'above', tagX: top || bottom ? 0 : sR < sP ? -2.0 : 2.0 });
      levels.push({ key: `R:${id}:el`, E: sR, x0: -3.05, x1: -0.95, z: 0.2, depth: 0.9, tone: 'react', lines: [sideText(vecOf(t.reactants)), tr('reactants', 'Ausgangsstoffe')], tag: 'below', tagX: -2.25 });
      levels.push({ key: `P:${id}:el`, E: sP, x0: 0.95, x1: 3.05, z: 0.2, depth: 0.9, tone: 'prod', lines: [sideText(vecOf(t.products)), tr('products', 'Produkte')], tag: 'below', tagX: 2.25 });
      if (Math.abs(sR) > 1e-9) arrows.push({ key: 'fR', x: -1.15, E0: 0, E1: sR, lines: ['ΣΔfH', kj(sR)], tag: 'left' });
      if (Math.abs(sP) > 1e-9) arrows.push({ key: 'fP', x: 1.15, E0: 0, E1: sP, lines: ['ΣΔfH', kj(sP)], tag: 'right' });
      arrows.push({ key: 'dT', x: 0, E0: sR, E1: sP, main: true, lines: [`ΔrH = ${kj(dT)}`, word(dT)], tag: dT <= 0 ? 'low' : 'high' });
      guides.push({ key: 'gR', x0: -0.95, x1: 0, E: sR }, { key: 'gP', x0: 0, x1: 0.95, E: sP });
      lo = Math.min(0, sR, sP); hi = Math.max(0, sR, sP);
      summary = tr(`Elements at 0; reactants at ${kj(sR)}, products at ${kj(sP)} kJ/mol; ΔrH = ${kj(dT)} kJ/mol.`, `Elemente bei 0; Ausgangsstoffe bei ${kj(sR)}, Produkte bei ${kj(sP)} kJ/mol; ΔrH = ${kj(dT)} kJ/mol.`);
    } else if (this.hview === 'direct') {
      levels.push({ key: `R:${id}:d`, E: 0, x0: -3.05, x1: -0.95, tone: 'react', lines: [sideText(vecOf(t.reactants)), tr('reactants', 'Ausgangsstoffe')], tag: 'below', tagX: -2.25 });
      levels.push({ key: `P:${id}:d`, E: dT, x0: 0.95, x1: 3.05, tone: 'prod', lines: [sideText(vecOf(t.products)), tr('products', 'Produkte')], tag: 'below', tagX: 2.25 });
      arrows.push({ key: 'dT', x: 0, E0: 0, E1: dT, main: true, lines: [`ΔH = ${kj(dT)}`, word(dT)], tag: dT <= 0 ? 'low' : 'high' });
      guides.push({ key: 'gR', x0: -0.95, x1: 0, E: 0 }, { key: 'gP', x0: 0, x1: 0.95, E: dT });
      lo = Math.min(0, dT); hi = Math.max(0, dT);
      summary = tr(`Reactants at 0, products at ${kj(dT)} kJ/mol: ΔH = ${kj(dT)} kJ/mol, ${word(dT)}.`, `Ausgangsstoffe bei 0, Produkte bei ${kj(dT)} kJ/mol: ΔH = ${kj(dT)} kJ/mol, ${word(dT)}.`);
    } else {
      const info = this.routeInfo();
      const X0 = -3.05, X1 = 2.0, lane = 2.6;
      // repeated steps in a row (e.g. two "-water-boil") share one arrow in the drawing: ②+③
      const ends: number[] = [0], names: string[] = [''];
      this.route.forEach((e, i) => {
        if (i > 0 && entryKey(e) === entryKey(this.route[i - 1])) { ends[ends.length - 1] = i + 1; names[names.length - 1] += '+' + circled(i + 1); }
        else { ends.push(i + 1); names.push(circled(i + 1)); }
      });
      const n = ends.length;
      const colW = (X1 - X0) / n, gap = Math.min(0.5, colW * 0.3);
      ends.forEach((si, k) => {
        const s = info.states[si], last = k === n - 1, done = last && info.complete;
        const role = k === 0 ? tr('reactants', 'Ausgangsstoffe') : done ? tr('products', 'Produkte') : tr(`after ${names[k]}`, `nach ${names[k]}`);
        levels.push({
          key: `S${k}:${id}:${[...s].map(([sp, c]) => sp + c).join(',')}`, E: info.E[si],
          x0: X0 + k * colW + (k > 0 ? gap / 2 : 0), x1: X0 + (k + 1) * colW - (last ? 0 : gap / 2),
          tone: k === 0 ? 'react' : done ? 'prod' : 'mid', tag: n >= 4 && k % 2 === 1 ? 'above' : 'below',
          lines: this.compact ? [sideText(s)] : [sideText(s), role],
        });
        if (k > 0) {
          const x = X0 + k * colW, from = ends[k - 1], d = info.E[si] - info.E[from];
          arrows.push({ key: `st${k}`, x, E0: info.E[from], E1: info.E[si], lines: [`${names[k]} ${kj(d)}`], tag: 'right' });
          guides.push({ key: `ga${k}`, x0: x - gap / 2, x1: x, E: info.E[from] }, { key: `gb${k}`, x0: x, x1: x + gap / 2, E: info.E[si] });
        }
      });
      if (info.complete) {
        arrows.push({ key: 'dT', x: lane, E0: 0, E1: info.sum, main: true, lines: [`ΔH = ${kj(info.sum)}`, word(info.sum)], tag: info.sum <= 0 ? 'high' : 'low' });
        guides.push({ key: 'gEnd', x0: X1, x1: lane, E: info.sum });
      } else marks.push({ key: 'q', x: lane, E: 0, lines: ['ΔH = ?'], side: 'above', cls: 'mark unknown' });
      guides.push({ key: 'g0', x0: levels[0].x1, x1: lane, E: 0 });
      lo = Math.min(...info.E); hi = Math.max(...info.E);
      summary = info.states.map((s, k) => `${sideText(s)}: ${kj(info.E[k])} kJ/mol`).join('; ') + (info.complete ? tr(`. The route adds up to the target: ΔH = ${kj(info.sum)} kJ/mol.`, `. Der Weg ergibt die Zielreaktion: ΔH = ${kj(info.sum)} kJ/mol.`) : tr('. The target ΔH is still unknown.', '. Das ΔH der Zielreaktion ist noch unbekannt.'));
    }
    let span = hi - lo, step = niceStep(span);
    if (span < 1e-9) { lo = -1; hi = 1; span = 2; step = 0; }
    return { levels, arrows, guides, bars: [], marks, lo: lo - (elBottom ? 0.32 : 0.14) * span, hi: hi + (elTop ? 0.32 : 0.14) * span, step, summary };
  }

  private elementsOk() {
    const t = reaction(this.id)!;
    return !t.fixed && [...t.reactants, ...t.products].every((x) => THERMO[x.sp]);
  }

  private routeChanged(addedKey?: string) {
    buzz('light');
    this.refresh();
    if (addedKey) this.emit('step', addedKey);
    const info = this.routeInfo();
    this.emit('route', this.id, this.route.map(entryKey), info.complete, Number(info.sum.toFixed(6)));
  }

  private renderHess() {
    const id = this.id, t = reaction(id)!, info = this.routeInfo();
    const known = this.hview !== 'route' || info.complete;
    this.head(eqHtml(t), known ? `ΔH = ${kj(dH(id))} kJ/mol · ${heatWord(dH(id))}` : tr("ΔH = ? · Hess's law", 'ΔH = ? · Satz von Hess'));
    const out: Node[] = [];
    const ro = this.compact;

    if (this.hview !== 'elements' && (this.route.length || !ro)) {
      // the route
      const list = h('ol', { class: 'nrg-route' });
      this.route.forEach((e, i) => {
        const r = reaction(e.id)!, d = entryDH(e), s = entrySign(e);
        const how = e.rev || e.f !== 1 ? `${e.rev ? MINUS : ''}${e.f !== 1 ? fmtFactor(e.f) + ` ${times()} ` : ''}${par(dH(e.id))}` : '';
        const acts = ro ? null : h('div', { class: 'nrg-step-acts' },
          h('button', { class: 'btn small quiet', type: 'button', 'aria-pressed': String(e.rev), onclick: () => { e.rev = !e.rev; this.emit('flip', e.id, e.rev); this.routeChanged(entryKey(e)); } }, tr('⇄ reverse', '⇄ umkehren')),
          h('button', { class: 'btn small quiet', type: 'button', 'aria-label': tr('half', 'halbieren'), disabled: e.f <= F_MIN, onclick: () => { e.f = Math.max(F_MIN, e.f / 2); this.routeChanged(entryKey(e)); } }, `${times()}½`),
          h('button', { class: 'btn small quiet', type: 'button', 'aria-label': tr('double', 'verdoppeln'), disabled: e.f >= F_MAX, onclick: () => { e.f = Math.min(F_MAX, e.f * 2); this.routeChanged(entryKey(e)); } }, `${times()}2`),
          h('button', { class: 'btn small quiet', type: 'button', 'aria-label': tr('Remove', 'Entfernen'), onclick: () => { this.route.splice(i, 1); this.routeChanged(); } }, '✕'));
        list.append(h('li', { class: 'nrg-step' },
          h('span', { class: 'nrg-num' }, circled(i + 1)),
          h('div', { class: 'nrg-step-main' }, eqHtml(r, s),
            h('div', { class: 'nrg-step-dh' }, h('strong', { class: d < 0 ? 'down' : 'up' }, `ΔH = ${kj(d)} kJ/mol`), how ? h('span', { class: 'muted small' }, ` = ${how}`) : null)),
          acts));
      });
      const sec = h('div', { class: 'panel nrg-routebox' }, h('div', { class: 'nrg-sec-head' }, tr('Your route', 'Dein Weg')));
      if (this.route.length) {
        const d = info.terms.some((x) => digitsFor(x) === 2) || digitsFor(info.sum) === 2 ? 2 : 1;
        sec.append(list,
          h('div', { class: 'nrg-net' }, h('span', { class: 'muted small' }, tr('The route adds up to: ', 'Der Weg ergibt zusammen: ')), netHtml(info.net)),
          h('div', { class: 'nrg-sum' }, `ΔH = ${sumText(info.terms, d)} = ${kj(info.sum, d)} kJ/mol`),
          h('div', { class: 'nrg-status ' + (info.complete ? 'ok' : 'no') }, info.complete
            ? tr(`✓ Same as the target. Hess's law: ΔH(target) = ${kj(info.sum, d)} kJ/mol`, `✓ Gleich der Zielreaktion. Satz von Hess: ΔH(Ziel) = ${kj(info.sum, d)} kJ/mol`)
            : tr('✗ Not the target yet: species that do not cancel are left over or missing.', '✗ Noch nicht die Zielreaktion: Stoffe, die sich nicht aufheben, bleiben übrig oder fehlen.')));
      } else sec.append(h('p', { class: 'nrg-hint' }, tr('Tap a step reaction below to start a route from the reactants.', 'Tippe unten auf eine Teilreaktion, um einen Weg von den Ausgangsstoffen aus zu beginnen.')));
      if (!ro && this.route.length) sec.append(h('button', { class: 'btn small quiet', type: 'button', onclick: () => { this.route = []; this.routeChanged(); } }, tr('Clear the route', 'Weg leeren')));
      out.push(sec);
    }

    if (!ro && this.hview !== 'elements') {
      const used = new Set(this.route.map((e) => e.id));
      const tray = h('div', { class: 'nrg-tray' });
      for (const sid of this.stepIds()) {
        const r = reaction(sid)!;
        tray.append(h('button', {
          class: 'nrg-card', type: 'button', 'aria-pressed': String(used.has(sid)), disabled: used.has(sid),
          onclick: () => { const e: Entry = { id: sid, rev: false, f: 1 }; this.route.push(e); this.routeChanged(entryKey(e)); },
        }, eqHtml(r), h('span', { class: 'nrg-card-dh ' + (dH(sid) < 0 ? 'down' : 'up') }, `ΔH = ${kj(dH(sid))} kJ/mol`), used.has(sid) ? h('span', { class: 'muted small' }, tr('on the route', 'im Weg')) : null));
      }
      out.push(h('div', { class: 'nrg-trayhead' }, h('div', { class: 'nrg-sec-head' }, tr('Step reactions: tap to add', 'Teilreaktionen: zum Hinzufügen antippen'))), tray);
    }

    if (!ro && this.c.elements && this.elementsOk()) {
      out.push(h('div', { class: 'chip-row wrap' }, h('button', {
        class: 'chip small', type: 'button', 'aria-pressed': String(this.hview === 'elements'),
        onclick: () => { this.hview = this.hview === 'elements' ? 'route' : 'elements'; buzz('light'); this.refresh(); if (this.hview === 'elements') this.emit('elements', this.id); },
      }, tr('Via the elements (ΔfH)', 'Über die Elemente (ΔfH)'))));
    }
    if (this.hview === 'elements' && this.elementsOk()) out.push(this.elementsPanel());
    if (this.hview === 'direct') out.push(h('p', { class: 'muted small nrg-note' }, tr('ΔH from the table of enthalpies of formation (OpenStax, Appendix G).', 'ΔH aus der Tabelle der Bildungsenthalpien (OpenStax, Anhang G).')));
    this.body.replaceChildren(...out);
  }

  private elementsPanel(): HTMLElement {
    const t = reaction(this.id)!, sR = sumHf(t.reactants), sP = sumHf(t.products), dT = sP - sR;
    const d = [sR, sP, dT, ...[...t.reactants, ...t.products].map((x) => THERMO[x.sp].dHf)].some((x) => x !== 0 && digitsFor(x) === 2) ? 2 : 1;
    const side = (terms: Term[]) => terms.map((x) => `${coef(x.c)}${x.c !== 1 ? times() + ' ' : ''}${par(THERMO[x.sp].dHf, d)}`).join(' + ');
    const rows = [...t.reactants, ...t.products].map((x) => h('tr', null, h('td', null, spHtml(x.sp)), h('td', null, THERMO[x.sp].dHf === 0 ? tr('0 (element)', '0 (Element)') : kj(THERMO[x.sp].dHf, d))));
    return h('div', { class: 'panel nrg-elems' },
      h('div', { class: 'nrg-sec-head' }, tr('Enthalpies of formation ΔfH (kJ/mol)', 'Bildungsenthalpien ΔfH (kJ/mol)')),
      h('table', { class: 'nrg-table' }, h('tbody', null, rows)),
      h('div', { class: 'nrg-line' }, `ΣΔfH(${tr('products', 'Produkte')}) = ${side(t.products)} = ${kj(sP, d)}`),
      h('div', { class: 'nrg-line' }, `ΣΔfH(${tr('reactants', 'Ausgangsstoffe')}) = ${side(t.reactants)} = ${kj(sR, d)}`),
      h('div', { class: 'nrg-result ' + (dT < 0 ? 'down' : 'up') },
        h('div', null, tr('ΔrH = ΣΔfH(products) − ΣΔfH(reactants)', 'ΔrH = ΣΔfH(Produkte) − ΣΔfH(Ausgangsstoffe)')),
        h('strong', null, `= ${par(sP, d)} ${MINUS} ${par(sR, d)} = ${kj(dT, d)} kJ/mol`),
        h('div', { class: 'nrg-word' }, heatWord(dT))),
      h('p', { class: 'muted small nrg-note' }, tr('Elements in their standard state have ΔfH = 0 by definition. Data: OpenStax, Appendix G.', 'Elemente im Standardzustand haben per Definition ΔfH = 0. Daten: OpenStax, Anhang G.')));
  }

  // ---------- gibbs mode ----------

  private gv(T = this.T) {
    const sg = this.reversed ? -1 : 1, hh = sg * dH(this.id), s = sg * dS(this.id), ts = (-T * s) / 1000;
    return { h: hh, s, ts, g: hh + ts };
  }

  private gibbsView(): EnergyView {
    const v = this.gv(), [tLo, tHi] = tRange(this.id), a = this.gv(tLo), b = this.gv(tHi);
    const lo = Math.min(0, v.h, a.g, b.g), hi = Math.max(0, v.h, a.g, b.g), span = hi - lo || 1;
    const levels: Level[] = [{ key: 'floor', E: 0, x0: -3.05, x1: 3.05, depth: 1.3, tone: 'floor', lines: [], tag: 'none' }];
    const bars: Bar[] = [
      { key: 'bH', x: -2.0, w: 1.15, E0: 0, E1: v.h, lines: ['ΔH', kj(v.h)] },
      { key: 'bS', x: 0, w: 1.15, E0: v.h, E1: v.g, lines: ['−T·ΔS', kj(v.ts)] },
      { key: 'bG', x: 2.0, w: 1.15, E0: 0, E1: v.g, main: true, lines: ['ΔG', kj(v.g)] },
    ];
    const guides: Guide[] = [{ key: 'c1', x0: -1.43, x1: -0.57, E: v.h }, { key: 'c2', x0: 0.57, x1: 1.43, E: v.g }];
    const summary = `T = ${tempText(this.T)}: ΔH = ${kj(v.h)}, −T·ΔS = ${kj(v.ts)}, ΔG = ${kj(v.g)} kJ/mol. ${this.verdictText(v.g)}`;
    return { levels, arrows: [], guides, bars, marks: [], lo: lo - 0.22 * span, hi: hi + 0.22 * span, step: niceStep(span), summary };
  }

  private verdictText(g: number) {
    if (Math.abs(g) < 0.05) return tr('ΔG ≈ 0: right on the border', 'ΔG ≈ 0: genau an der Grenze');
    return g < 0 ? tr('ΔG < 0: can run by itself (exergonic)', 'ΔG < 0: kann von selbst ablaufen (exergonisch)') : tr('ΔG > 0: cannot run by itself (endergonic)', 'ΔG > 0: kann nicht von selbst ablaufen (endergonisch)');
  }

  private buildGibbs() {
    const verdict = h('div', { class: 'nrg-verdict' }), calc = h('div', { class: 'nrg-calc' }), cross = h('div', { class: 'nrg-cross' }), cases = h('div', { class: 'nrg-cases' });
    let tLabel: HTMLElement | null = null, slider: HTMLInputElement | null = null, zones: HTMLElement | null = null, rev: HTMLButtonElement | null = null;
    const panel = h('div', { class: 'panel nrg-gibbs' }, verdict, calc);
    if (!this.compact && this.c.temp) {
      const [lo, hi] = tRange(this.id);
      tLabel = h('strong');
      slider = h('input', { type: 'range', min: String(lo), max: String(hi), step: '1', value: String(Math.round(this.T)), 'aria-label': tr('Temperature in kelvin', 'Temperatur in Kelvin') }) as HTMLInputElement;
      zones = h('div', { class: 'nrg-zones', 'aria-hidden': 'true' });
      slider.addEventListener('input', () => this.setT(+slider!.value));
      slider.addEventListener('change', () => this.emit('temp', this.id, this.T, this.gv().g));
      panel.append(h('div', { class: 'nrg-temp' }, h('label', { class: 'nrg-temp-head' }, h('span', null, tr('Temperature', 'Temperatur')), tLabel), slider, zones));
    }
    panel.append(cross);
    if (!this.compact) {
      rev = h('button', { class: 'chip small', type: 'button', 'aria-pressed': 'false', onclick: () => {
        this.reversed = !this.reversed; buzz('light'); this.refresh(); this.emit('reverse', this.id, this.reversed);
      } }, tr('⇄ Reverse the reaction', '⇄ Reaktion umkehren')) as HTMLButtonElement;
      panel.append(h('div', { class: 'chip-row wrap' }, rev));
    }
    panel.append(cases, h('p', { class: 'muted small nrg-note' }, tr('ΔH and ΔS treated as constant: a model. Data: OpenStax, Appendix G.', 'ΔH und ΔS als konstant angenommen: ein Modell. Daten: OpenStax, Anhang G.')));
    this.body.append(panel);
    this.g = { verdict, calc, tLabel, slider, zones, cross, cases, rev };
    this.side = 0;
  }

  private setT(T: number) {
    this.T = T;
    const tc = crossover(this.id), [lo, hi] = tRange(this.id);
    if (tc !== null && tc >= lo && tc <= hi) {
      const side = Math.sign(T - tc);
      if (side !== 0 && this.side !== 0 && side !== this.side) this.emit('crossover', this.id, Math.round(tc));
      if (side !== 0) this.side = side;
    }
    this.stage.setView(this.gibbsView());
    this.refreshGibbs();
  }

  private refreshGibbs() {
    const g = this.g, r = reaction(this.id)!;
    if (!g) return;
    const v = this.gv(), T = this.T, tc = crossover(this.id), [lo, hi] = tRange(this.id);
    this.head(eqHtml(r, this.reversed ? -1 : 1), `T = ${tempText(T)}`);
    if (tc !== null && this.side === 0) this.side = Math.sign(T - tc) || 1;
    g.verdict.className = 'nrg-verdict ' + (v.g < 0 ? 'down' : 'up');
    g.verdict.replaceChildren(h('strong', null, this.verdictText(v.g)), h('span', { class: 'muted small' }, tr('says nothing about how fast', 'sagt nichts darüber, wie schnell')));
    const sKJ = v.s / 1000, x = times();
    g.calc.replaceChildren(
      h('div', null, `ΔH = ${kj(v.h)} kJ/mol`),
      h('div', null, `ΔS = ${kj(v.s)} J/(mol·K) = ${kj(sKJ, 4)} kJ/(mol·K)`),
      h('div', { class: 'nrg-line' }, `ΔG = ΔH − T·ΔS = ${par(v.h)} ${MINUS} ${num(Math.round(T), 0)} ${x} ${par(sKJ, 4)} = `, h('strong', null, `${kj(v.g)} kJ/mol`)));
    if (g.tLabel) g.tLabel.textContent = tempText(T);
    if (g.slider && +g.slider.value !== Math.round(T)) g.slider.value = String(Math.round(T));
    // where ΔG < 0 and where ΔG > 0 on the slider, and the crossover mark
    if (g.zones) {
      const pct = (t: number) => `${(((t - lo) / (hi - lo)) * 100).toFixed(2)}%`;
      const at = (t: number) => this.gv(t).g;
      const zone = (from: number, to: number) => {
        const neg = at((from + to) / 2) < 0;
        return h('div', { class: 'nrg-zone ' + (neg ? 'down' : 'up'), style: `left:${pct(from)};width:calc(${pct(to)} - ${pct(from)})` }, neg ? 'ΔG < 0' : 'ΔG > 0');
      };
      const inRange = tc !== null && tc > lo && tc < hi;
      g.zones.replaceChildren(...(inRange ? [zone(lo, tc!), zone(tc!, hi), h('div', { class: 'nrg-tc', style: `left:${pct(tc!)}` })] : [zone(lo, hi)]),
        h('span', { class: 'nrg-end lo' }, `${num(lo, 0)} K`), h('span', { class: 'nrg-end hi' }, `${num(hi, 0)} K`));
    }
    g.cross.replaceChildren(tc === null
      ? h('span', null, tr('No crossover: ΔG has the same sign at every temperature.', 'Kein Vorzeichenwechsel: ΔG hat bei jeder Temperatur dasselbe Vorzeichen.'))
      : tc > 4000
        ? h('span', null, tr(`ΔG = 0 only at about ${num(Math.round(tc), 0)} K: far beyond this scale.`, `ΔG = 0 erst bei etwa ${num(Math.round(tc), 0)} K, weit außerhalb dieses Bereichs.`))
        : h('span', null, h('strong', null, tr(`ΔG = 0 at ${tempText(tc)}`, `ΔG = 0 bei ${tempText(tc)}`)), tr(` (= ΔH : ΔS)`, ` (= ΔH : ΔS)`)));
    if (g.rev) g.rev.setAttribute('aria-pressed', String(this.reversed));
    // the four sign cases
    const hNeg = v.h < 0, sPos = v.s > 0;
    const cell = (hn: boolean, sp: boolean, text: string) => h('div', { class: 'nrg-case' + (hn === hNeg && sp === sPos ? ' on' : ''), 'aria-current': hn === hNeg && sp === sPos ? 'true' : null }, text);
    g.cases.replaceChildren(
      h('div', { class: 'nrg-cases-head' }, tr('Can it run by itself?', 'Läuft sie von selbst ab?')),
      h('div', { class: 'nrg-grid' },
        h('div', null), h('div', { class: 'nrg-gh' }, 'ΔS > 0'), h('div', { class: 'nrg-gh' }, 'ΔS < 0'),
        h('div', { class: 'nrg-gh' }, 'ΔH < 0'), cell(true, true, tr('at every T', 'bei jeder Temperatur')), cell(true, false, tr('only at low T', 'nur bei tiefer Temperatur')),
        h('div', { class: 'nrg-gh' }, 'ΔH > 0'), cell(false, true, tr('only at high T', 'nur bei hoher Temperatur')), cell(false, false, tr('at no T', 'bei keiner Temperatur'))));
  }

  dispose() { this.handlers = {}; this.stage.dispose(); }
}
