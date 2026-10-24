// The Lab Bench as a screen component (unit 16): weigh a solute onto the boat, make it up to the mark in a volumetric
// flask (or, as the tempting shortcut, dissolve it in a measured volume of water in a beaker), dilute a portion with a
// bulb pipette into a second flask, pour off a portion, and look at the particles. A readout table puts m, M, n, V, c
// and β of every vessel side by side, with c = n / V written out. Later units add instruments (pH meter, burette,
// electrodes) as further pieces on the same bench (see labBench.ts) and further controls here.
import './labBench.css';
import { LabBenchStage, type BenchView, type BenchAnim } from './labBench';
import { SOLUTES, FLASKS, PIPETTES, molarMass, parseFormula, solute as soluteById, type Solute } from '../content/stoich';
import type { Show } from '../content/unitTypes';
import { h, chem, s as svg } from '../ui/dom';
import { L, num, numTrim } from '../i18n';
import { buzz } from '../platform';
import { touchElements } from '../model/learner';

export interface LabBenchUIOptions {
  /** Solute chips offered (SOLUTES ids). Default: all. */
  solutes?: string[];
  /** First solute. */
  start?: string;
  compact?: boolean;
  controls?: { dilute?: boolean; sample?: boolean; beaker?: boolean; zoom?: boolean };
}
type Fn = (...a: any[]) => void;
type Bench = Extract<Show, { engine: 'bench' }>;

const STEPS = [-10, -1, -0.1, -0.01, 0.01, 0.1, 1, 10];
const WATERS = [100, 250, 500, 1000];
const POURS = [10, 25, 50];
/** The balance's capacity in this model (g). */
const MAX_G = 100;
/** Particle inset: formula units drawn per mol/L, and at most this many dots. */
const DOTS_PER_MOL_L = 100;
const MAX_DOTS = 60;

/** A number to `n` significant figures in the current language: 0,02499; 0,1000; 24,97. */
function sig(x: number, n = 4): string {
  if (!x || !isFinite(x)) return num(0, 0);
  const d = Math.max(0, n - 1 - Math.floor(Math.log10(Math.abs(x))));
  return num(x, Math.min(d, 9));
}
const grams = (m: number) => (m >= 0.995 || m === 0 ? num(m, 2) : sig(m, 3));
const litres = (mL: number) => num(mL / 1000, mL < 10 ? 4 : 3);
/** "CuSO4·5H2O" with the count after the dot as a normal digit: CuSO₄·5H₂O. */
function chemF(f: string): Node[] {
  return f.split('·').flatMap((part, i) => {
    const m = /^(\d+)(.*)$/.exec(part);
    return [i ? '·' : '', m ? m[1] : '', chem(m ? m[2] : part)].filter((x) => x !== '') as Node[];
  });
}

/** Fixed, evenly spread dot positions in the inset circle (the same picture for the same c). */
const DOTS: [number, number][] = (() => {
  let seed = 20261024;
  const rnd = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
  const R = 50, out: [number, number][] = [];
  let d = 10.5;
  for (let tries = 0; out.length < MAX_DOTS && tries < 40000; tries++) {
    if (tries % 5000 === 4999) d *= 0.93;
    const x = (rnd() * 2 - 1) * R, y = (rnd() * 2 - 1) * R;
    if (x * x + y * y > R * R) continue;
    if (out.every(([a, b]) => (a - x) ** 2 + (b - y) ** 2 >= d * d)) out.push([x, y]);
  }
  return out;
})();

/** The solution in flask 1 (or the beaker), the diluted one in flask 2, and a poured-off portion. */
type Sol1 = { kind: 'flask'; grams: number; flask: number; c: number; left: number } | { kind: 'beaker'; grams: number; water: number; cMax: number };
interface Sol2 { pipette: number; flask: number; c1: number; c: number; left: number; }
interface Portion { mL: number; c: number; from: 1 | 2; }
/** One column of the readout table. */
interface Col { head: string; sub: string; m: number; n: number; V: number; c: number; bound: boolean; planned: boolean; on: boolean; }

export class LabBenchUI {
  readonly el: HTMLElement;
  readonly stage: LabBenchStage;
  private sol: Solute;
  private M = 0;
  private boat = 0;
  private flaskSel = 250;
  private pipSel = 20;
  private flask2Sel = 100;
  private s1: Sol1 | null = null;
  private s2: Sol2 | null = null;
  private por: Portion | null = null;
  private gen = { a: 0, b: 0, p: 0 };
  private zoomOn = false;
  private compact: boolean;
  private ids: string[];
  private c: { dilute: boolean; sample: boolean; beaker: boolean; zoom: boolean };
  private listeners = new Map<string, Set<Fn>>();
  private weighTimer = 0;
  private lastWeighed = -1;
  // DOM
  private head: HTMLElement;
  private note: HTMLElement;
  private readout: HTMLElement;
  private zoomBox: HTMLElement;
  private soluteRow?: HTMLElement;
  private boatOut?: HTMLElement;
  private stepBtns: HTMLButtonElement[] = [];
  private flaskRow?: HTMLElement;
  private makeBtn?: HTMLButtonElement;
  private waterBtns: HTMLButtonElement[] = [];
  private makeNote?: HTMLElement;
  private pipRow?: HTMLElement;
  private flask2Row?: HTMLElement;
  private diluteBtn?: HTMLButtonElement;
  private diluteNote?: HTMLElement;
  private pourLabel?: HTMLElement;
  private pourBtns: HTMLButtonElement[] = [];
  private zoomBtn?: HTMLButtonElement;

  constructor(public opts: LabBenchUIOptions = {}) {
    this.compact = !!opts.compact;
    this.c = { dilute: true, sample: true, beaker: true, zoom: true, ...opts.controls };
    this.ids = (opts.solutes ?? SOLUTES.map((s) => s.id)).filter((id) => soluteById(id));
    if (!this.ids.length) this.ids = SOLUTES.map((s) => s.id);
    this.sol = soluteById(opts.start && soluteById(opts.start) ? opts.start : this.ids[0])!;
    this.M = molarMass(this.sol.formula);

    const stageEl = h('div', { class: 'wb-stage bench-stage' + (this.compact ? ' compact' : '') });
    this.head = h('div', { class: 'bench-head' });
    this.note = h('p', { class: 'muted small bench-note' });
    this.readout = h('div', { class: 'panel bench-read' + (this.compact ? ' compact' : '') });
    this.zoomBox = h('div', { class: 'bench-zoom', hidden: true });
    this.el = h('div', { class: 'workbench bench' + (this.compact ? ' compact' : '') }, this.head, stageEl, this.note);
    this.stage = new LabBenchStage(stageEl, this.compact);

    if (this.compact) this.el.append(this.zoomBox, this.readout);
    else this.buildControls();
    this.render(null, true);
  }

  on(evt: string, f: Fn) { if (!this.listeners.has(evt)) this.listeners.set(evt, new Set()); this.listeners.get(evt)!.add(f); return () => this.listeners.get(evt)!.delete(f); }
  private emit(evt: string, ...a: unknown[]) { this.listeners.get(evt)?.forEach((f) => f(...a)); }

  // ---------- controls ----------

  private buildControls() {
    const label = (en: string, de: string) => h('div', { class: 'bench-label' }, L({ en, de }));
    if (this.ids.length > 1) {
      this.soluteRow = h('div', { class: 'chip-row wrap', role: 'group', 'aria-label': L({ en: 'Solute', de: 'Gelöster Stoff' }) },
        ...this.ids.map((id) => h('button', { class: 'chip small', type: 'button', 'data-id': id, 'aria-pressed': 'false', onclick: () => this.setSolute(id) }, chemF(soluteById(id)!.formula))));
      this.el.append(this.soluteRow);
    }
    // 1. weigh
    this.boatOut = h('output', { class: 'bench-boat-val' });
    const steps = h('div', { class: 'bench-steps' });
    for (const d of STEPS) {
      const txt = (d > 0 ? '+' : '−') + numTrim(Math.abs(d), 2);
      const b = h('button', { class: 'btn small quiet', type: 'button', 'aria-label': `${txt} g`, onclick: () => this.step(d) }, txt) as HTMLButtonElement;
      this.stepBtns.push(b); steps.append(b);
    }
    this.el.append(h('div', { class: 'panel bench-weigh' },
      h('div', { class: 'bench-boat' }, h('span', { class: 'muted small' }, L({ en: 'On the weighing boat', de: 'Im Wägeschiffchen' })), this.boatOut),
      steps));
    // 2. make up to the mark (or the beaker shortcut)
    this.flaskRow = h('div', { class: 'chip-row wrap', role: 'group', 'aria-label': L({ en: 'Volumetric flask', de: 'Messkolben' }) },
      ...FLASKS.map((f) => h('button', { class: 'chip small', type: 'button', 'data-ml': String(f), 'aria-pressed': 'false', onclick: () => this.chooseFlask(f) }, `${numTrim(f)} mL`)));
    this.makeBtn = h('button', { class: 'btn small block', type: 'button', onclick: () => this.make() }, L({ en: 'Dissolve and fill to the mark', de: 'Lösen und bis zur Eichmarke auffüllen' })) as HTMLButtonElement;
    this.makeNote = h('p', { class: 'muted small bench-why' });
    const make = h('div', { class: 'bench-group' }, label('Volumetric flask', 'Messkolben'), this.flaskRow, this.makeBtn);
    if (this.c.beaker) {
      const row = h('div', { class: 'bench-acts' });
      for (const w of WATERS) {
        const b = h('button', { class: 'btn small quiet', type: 'button', onclick: () => this.dissolveIn(w) }, `${numTrim(w)} mL`) as HTMLButtonElement;
        this.waterBtns.push(b); row.append(b);
      }
      make.append(label('Dissolve in water instead (beaker)', 'Stattdessen in Wasser lösen (Becherglas)'), row);
    }
    make.append(this.makeNote);
    this.el.append(make);
    // readings and particles sit right under the making step
    this.el.append(this.readout, this.zoomBox);
    if (this.c.dilute) {
      this.pipRow = h('div', { class: 'chip-row wrap', role: 'group', 'aria-label': L({ en: 'Bulb pipette', de: 'Vollpipette' }) },
        ...PIPETTES.map((p) => h('button', { class: 'chip small', type: 'button', 'data-ml': String(p), 'aria-pressed': 'false', onclick: () => { this.pipSel = p; this.refresh(); } }, `${numTrim(p)} mL`)));
      this.flask2Row = h('div', { class: 'chip-row wrap', role: 'group', 'aria-label': L({ en: 'New flask', de: 'Neuer Messkolben' }) },
        ...FLASKS.map((f) => h('button', { class: 'chip small', type: 'button', 'data-ml': String(f), 'aria-pressed': 'false', onclick: () => this.chooseFlask2(f) }, `${numTrim(f)} mL`)));
      this.diluteBtn = h('button', { class: 'btn small block', type: 'button', onclick: () => this.dilute() }, L({ en: 'Pipette into the new flask and fill to the mark', de: 'In den neuen Kolben pipettieren und bis zur Eichmarke auffüllen' })) as HTMLButtonElement;
      this.diluteNote = h('p', { class: 'muted small bench-why' });
      this.el.append(h('div', { class: 'bench-group' },
        h('div', { class: 'bench-title' }, L({ en: 'Dilute flask 1', de: 'Kolben 1 verdünnen' })),
        label('Bulb pipette', 'Vollpipette'), this.pipRow, label('into a new volumetric flask', 'in einen neuen Messkolben'), this.flask2Row, this.diluteBtn, this.diluteNote));
    }
    if (this.c.sample) {
      this.pourLabel = h('div', { class: 'bench-label' });
      const row = h('div', { class: 'bench-acts' });
      for (const mL of POURS) {
        const b = h('button', { class: 'btn small quiet', type: 'button', onclick: () => this.pour(mL) }, `${numTrim(mL)} mL`) as HTMLButtonElement;
        this.pourBtns.push(b); row.append(b);
      }
      this.el.append(h('div', { class: 'bench-group' }, h('div', { class: 'bench-title' }, L({ en: 'Pour off a portion', de: 'Eine Portion abgießen' })), this.pourLabel, row));
    }
  }

  // ---------- actions ----------

  private setSolute(id: string) {
    if (id === this.sol.id) return;
    this.load(id);
    buzz('light');
    this.render(null, true);
    this.emit('solute', id);
  }

  /** A fresh bench with this solute: empty boat, empty flask. */
  private load(id: string) {
    const s = soluteById(id) ?? this.sol;
    this.sol = s;
    this.M = molarMass(s.formula);
    this.boat = 0; this.lastWeighed = -1;
    this.s1 = this.s2 = this.por = null;
    clearTimeout(this.weighTimer); this.weighTimer = 0;
    if (!this.compact) touchElements(Object.keys(parseFormula(s.formula)));
  }

  private step(d: number) {
    const g = Math.round(Math.min(MAX_G, Math.max(0, this.boat + d)) * 100) / 100;
    if (g === this.boat) return;
    this.boat = g;
    buzz('light');
    this.render(null);
    clearTimeout(this.weighTimer);
    this.weighTimer = window.setTimeout(() => this.settle(), 700);
  }

  /** Report the mass on the boat once it has stopped changing. */
  private settle() {
    clearTimeout(this.weighTimer); this.weighTimer = 0;
    if (this.boat === this.lastWeighed) return;
    this.lastWeighed = this.boat;
    this.emit('weighed', this.sol.id, this.boat);
  }

  private chooseFlask(mL: number) {
    if (mL === this.flaskSel && !this.s1) return;
    this.flaskSel = mL;
    // a new flask means a new preparation: the glassware is emptied and rinsed
    this.s1 = this.s2 = this.por = null;
    buzz('light');
    this.render(null);
    this.emit('flask', mL);
  }

  private chooseFlask2(mL: number) {
    this.flask2Sel = mL;
    if (this.pipSel >= mL) this.pipSel = [...PIPETTES].reverse().find((p) => p < mL) ?? PIPETTES[0];
    this.refresh();
  }

  private make() {
    if (this.boat <= 0) return;
    this.settle();
    const g = this.boat, V = this.flaskSel, c = g / this.M / (V / 1000);
    this.s1 = { kind: 'flask', grams: g, flask: V, c, left: V };
    this.s2 = this.por = null;
    this.boat = 0; this.lastWeighed = 0;
    this.gen.a++;
    buzz('medium');
    this.render('make');
    this.emit('made', this.sol.id, g, V, c);
  }

  private dissolveIn(water: number) {
    if (this.boat <= 0) return;
    this.settle();
    const g = this.boat;
    this.s1 = { kind: 'beaker', grams: g, water, cMax: g / this.M / (water / 1000) };
    this.s2 = this.por = null;
    this.boat = 0; this.lastWeighed = 0;
    this.gen.a++;
    buzz('medium');
    this.render('beaker');
    this.emit('beaker', this.sol.id, g, water);
  }

  /** Why diluting is not possible now, or null. */
  private cannotDilute(): string | null {
    const s1 = this.s1;
    if (!s1) return L({ en: 'Make a solution in flask 1 first.', de: 'Stell zuerst eine Lösung in Kolben 1 her.' });
    if (s1.kind === 'beaker') return L({ en: 'In the beaker c is not known exactly: make the solution in a volumetric flask to dilute it.', de: 'Im Becherglas ist c nicht genau bekannt: Stell die Lösung im Messkolben her, um sie zu verdünnen.' });
    if (this.pipSel > s1.left) return L({ en: `Only ${numTrim(s1.left)} mL are left in flask 1: take a smaller pipette or make a new solution.`, de: `In Kolben 1 sind nur noch ${numTrim(s1.left)} mL: Nimm eine kleinere Pipette oder stell eine neue Lösung her.` });
    return null;
  }

  private dilute() {
    if (this.cannotDilute() || this.s1?.kind !== 'flask') return;
    const s1 = this.s1, p = this.pipSel, f = this.flask2Sel;
    if (p >= f) return;
    const c2 = (s1.c * p) / f;
    s1.left = Math.round((s1.left - p) * 100) / 100;
    this.s2 = { pipette: p, flask: f, c1: s1.c, c: c2, left: f };
    if (this.por?.from === 2) this.por = null;
    this.gen.b++;
    buzz('medium');
    this.render('dilute');
    this.emit('diluted', this.sol.id, s1.c, p, f, c2);
  }

  /** Where a portion is poured from: flask 2 once there is one, otherwise flask 1. */
  private pourSource(): { from: 1 | 2; c: number; left: number } | null {
    if (this.s2) return { from: 2, c: this.s2.c, left: this.s2.left };
    if (this.s1?.kind === 'flask') return { from: 1, c: this.s1.c, left: this.s1.left };
    return null;
  }

  private pour(mL: number) {
    const src = this.pourSource();
    if (!src || mL > src.left) return;
    if (src.from === 2) this.s2!.left -= mL; else if (this.s1?.kind === 'flask') this.s1.left -= mL;
    this.por = { mL, c: src.c, from: src.from };
    this.gen.p++;
    buzz('light');
    this.render('pour');
    this.emit('sample', this.sol.id, mL, src.c, (src.c * mL) / 1000);
  }

  private toggleZoom() {
    this.zoomOn = !this.zoomOn;
    buzz('light');
    this.refresh();
    this.emit('zoom', this.zoomOn);
  }

  /** Show what a reveal or worked example asks for (rebuilt from scratch each time). */
  show(sh: Bench) {
    this.load(sh.solute);
    this.boat = Math.max(0, Math.min(MAX_G, sh.grams ?? 0));
    if (sh.flask && FLASKS.includes(sh.flask)) this.flaskSel = sh.flask;
    let anim: BenchAnim = null;
    const g = this.boat;
    if (sh.water && g > 0) {
      this.s1 = { kind: 'beaker', grams: g, water: sh.water, cMax: g / this.M / (sh.water / 1000) };
      this.boat = 0; anim = 'beaker';
    } else if ((sh.made || sh.dilute || sh.sample) && g > 0) {
      const V = this.flaskSel;
      this.s1 = { kind: 'flask', grams: g, flask: V, c: g / this.M / (V / 1000), left: V };
      this.boat = 0; anim = 'make';
    }
    this.lastWeighed = this.boat;
    if (sh.dilute && this.s1?.kind === 'flask' && sh.dilute.pipette < sh.dilute.flask && sh.dilute.pipette <= this.s1.left) {
      const s1 = this.s1, { pipette: p, flask: f } = sh.dilute;
      s1.left -= p;
      this.s2 = { pipette: p, flask: f, c1: s1.c, c: (s1.c * p) / f, left: f };
      this.pipSel = p; this.flask2Sel = f;
      anim = 'dilute';
    }
    if (sh.sample) {
      const src = this.pourSource();
      if (src && sh.sample <= src.left) {
        if (src.from === 2) this.s2!.left -= sh.sample; else if (this.s1?.kind === 'flask') this.s1.left -= sh.sample;
        this.por = { mL: sh.sample, c: src.c, from: src.from };
        anim = 'pour';
      }
    }
    this.zoomOn = !!sh.zoom;
    this.gen.a++; this.gen.b++; this.gen.p++;
    this.render(anim);
  }

  // ---------- drawing ----------

  private view(): BenchView {
    const s1 = this.s1, s2 = this.s2, p = this.por;
    return {
      tint: this.sol.tint,
      grams: this.boat,
      a: !s1 ? { kind: 'flask', flask: this.flaskSel, left: 0, c: 0, gen: this.gen.a }
        : s1.kind === 'flask' ? { kind: 'flask', flask: s1.flask, left: s1.left, c: s1.c, gen: this.gen.a }
        : { kind: 'beaker', water: s1.water, c: s1.cMax, gen: this.gen.a },
      b: s2 ? { flask: s2.flask, left: s2.left, c: s2.c, c1: s2.c1, pipette: s2.pipette, gen: this.gen.b } : null,
      p: p ? { mL: p.mL, c: p.c, gen: this.gen.p } : null,
    };
  }

  private render(anim: BenchAnim, cut = false) {
    this.stage.render(this.view(), anim, cut);
    this.refresh();
  }

  private refresh() {
    const s = this.sol;
    this.head.replaceChildren(
      h('div', { class: 'bench-name' }, h('span', { class: 'wb-formula' }, ...chemF(s.formula)), h('span', { class: 'muted small' }, L(s.name))),
      h('div', { class: 'bench-mm' }, h('span', { class: 'muted small' }, L({ en: 'molar mass', de: 'molare Masse' })), h('strong', null, `M = ${numTrim(this.M, 2)} g/mol`)));
    this.note.replaceChildren(s.tint
      ? L({ en: 'Colour: a model picture, shaded by concentration (darker = more concentrated).', de: 'Farbe: ein Modellbild, je nach Konzentration abgestuft (dunkler = konzentrierter).' })
      : L({ en: `${L(s.name)} solution is colourless.`, de: `${L(s.name)}-Lösung ist farblos.` }));
    this.drawReadout();
    this.drawZoom();
    if (this.compact) return;
    this.soluteRow?.querySelectorAll('.chip').forEach((b) => b.setAttribute('aria-pressed', String((b as HTMLElement).dataset.id === s.id)));
    if (this.boatOut) this.boatOut.textContent = `${num(this.boat, 2)} g`;
    this.stepBtns.forEach((b, i) => { const d = STEPS[i]; b.disabled = d < 0 ? this.boat <= 0 : this.boat >= MAX_G; });
    this.flaskRow?.querySelectorAll('.chip').forEach((b) => b.setAttribute('aria-pressed', String(Number((b as HTMLElement).dataset.ml) === this.flaskSel)));
    const empty = this.boat <= 0;
    if (this.makeBtn) this.makeBtn.disabled = empty;
    this.waterBtns.forEach((b) => { b.disabled = empty; });
    if (this.makeNote) this.makeNote.textContent = empty
      ? (this.s1 ? L({ en: 'To make another solution, weigh the solid again.', de: 'Für eine weitere Lösung wieg den Feststoff erneut ab.' })
        : L({ en: 'Put some solid on the weighing boat first.', de: 'Gib zuerst etwas Feststoff ins Wägeschiffchen.' }))
      : L({ en: `The flask is filled up to the ring mark: then the solution, not the water, has a volume of ${numTrim(this.flaskSel)} mL.`, de: `Der Kolben wird bis zur Eichmarke aufgefüllt: Dann hat die Lösung, nicht das Wasser, ein Volumen von ${numTrim(this.flaskSel)} mL.` });
    if (this.pipRow) {
      const left = this.s1?.kind === 'flask' ? this.s1.left : 0;
      this.pipRow.querySelectorAll('.chip').forEach((b) => {
        const p = Number((b as HTMLElement).dataset.ml);
        b.setAttribute('aria-pressed', String(p === this.pipSel));
        (b as HTMLButtonElement).disabled = p >= this.flask2Sel || (this.s1?.kind === 'flask' && p > left);
      });
      this.flask2Row!.querySelectorAll('.chip').forEach((b) => b.setAttribute('aria-pressed', String(Number((b as HTMLElement).dataset.ml) === this.flask2Sel)));
      const why = this.cannotDilute();
      this.diluteBtn!.disabled = !!why;
      this.diluteNote!.textContent = why ?? L({ en: `${numTrim(this.pipSel)} mL of flask 1 into ${numTrim(this.flask2Sel)} mL: the particles stay, the volume grows.`, de: `${numTrim(this.pipSel)} mL aus Kolben 1 auf ${numTrim(this.flask2Sel)} mL: Die Teilchen bleiben, das Volumen wächst.` });
    }
    if (this.pourLabel) {
      const src = this.pourSource();
      this.pourLabel.textContent = !src
        ? L({ en: 'Make a solution in a volumetric flask first.', de: 'Stell zuerst eine Lösung im Messkolben her.' })
        : L({ en: `From flask ${src.from} into a beaker (${numTrim(src.left)} mL left):`, de: `Aus Kolben ${src.from} in ein Becherglas (noch ${numTrim(src.left)} mL):` });
      this.pourBtns.forEach((b, i) => { b.disabled = !src || POURS[i] > src.left; });
    }
  }

  /** The columns of the readout: plan or flask 1 (or the beaker), flask 2, the portion. */
  private columns(): Col[] {
    const M = this.M, s1 = this.s1, cols: Col[] = [];
    if (!s1) {
      const n = this.boat / M, V = this.flaskSel;
      cols.push({ head: L({ en: 'Plan', de: 'Geplant' }), sub: L({ en: 'if dissolved and filled to the mark', de: 'wenn gelöst und bis zur Eichmarke aufgefüllt' }), m: this.boat, n, V, c: n / (V / 1000), bound: false, planned: true, on: false });
    } else if (s1.kind === 'flask') {
      const n = (s1.c * s1.left) / 1000;
      const on = s1.left >= s1.flask - 0.01;
      cols.push({ head: L({ en: 'Flask 1', de: 'Kolben 1' }), sub: on ? L({ en: 'filled to the mark ✓', de: 'bis zur Eichmarke ✓' }) : L({ en: `${numTrim(s1.left)} of ${numTrim(s1.flask)} mL left`, de: `noch ${numTrim(s1.left)} von ${numTrim(s1.flask)} mL` }), m: n * M, n, V: s1.left, c: s1.c, bound: false, planned: false, on });
    } else {
      const n = s1.grams / M;
      cols.push({ head: L({ en: 'Beaker', de: 'Becherglas' }), sub: L({ en: `more than ${numTrim(s1.water)} mL of solution, so c is lower than planned`, de: `mehr als ${numTrim(s1.water)} mL Lösung, also ist c kleiner als geplant` }), m: s1.grams, n, V: s1.water, c: s1.cMax, bound: true, planned: false, on: false });
    }
    if (this.s2) {
      const s2 = this.s2, n = (s2.c * s2.left) / 1000, on = s2.left >= s2.flask - 0.01;
      cols.push({ head: L({ en: 'Flask 2', de: 'Kolben 2' }), sub: on ? L({ en: 'diluted, to the mark ✓', de: 'verdünnt, bis zur Eichmarke ✓' }) : L({ en: `${numTrim(s2.left)} of ${numTrim(s2.flask)} mL left`, de: `noch ${numTrim(s2.left)} von ${numTrim(s2.flask)} mL` }), m: n * M, n, V: s2.left, c: s2.c, bound: false, planned: false, on });
    }
    if (this.por) {
      const p = this.por, n = (p.c * p.mL) / 1000;
      cols.push({ head: L({ en: 'Portion', de: 'Portion' }), sub: L({ en: `poured off from flask ${p.from}`, de: `aus Kolben ${p.from} abgegossen` }), m: n * M, n, V: p.mL, c: p.c, bound: false, planned: false, on: false });
    }
    return cols;
  }

  private drawReadout() {
    const cols = this.columns(), M = this.M;
    const lt = (col: Col) => (col.bound ? '< ' : ''), gt = (col: Col) => (col.bound ? '> ' : '');
    const small = cols.some((c) => c.c > 0 && c.c < 0.1);
    const rows: [string, string, (c: Col) => string, string?][] = [
      ['m', 'g', (c) => grams(c.m)],
      ['M', 'g/mol', () => numTrim(M, 2)],
      ['n', 'mol', (c) => sig(c.n), 'n'],
      ['V', 'mL', (c) => gt(c) + numTrim(c.V, 2)],
      ['V', 'L', (c) => gt(c) + litres(c.V)],
      ['c', 'mol/L', (c) => lt(c) + sig(c.c), 'c'],
      ...(small ? [['c', 'mmol/L', (c: Col) => lt(c) + sig(c.c * 1000)] as [string, string, (c: Col) => string]] : []),
      ['β', 'g/L', (c) => lt(c) + sig(c.c * M)],
    ];
    const table = h('table', { class: 'bench-table' },
      h('thead', null, h('tr', null, h('th', null), ...cols.map((c) => h('th', { class: c.planned ? 'planned' : '' }, h('span', null, c.head), h('small', { class: c.on ? 'on' : '' }, c.sub))))),
      h('tbody', null, ...rows.map(([sym, unit, f, cls]) => h('tr', { class: cls ?? '' },
        h('th', { scope: 'row' }, h('i', null, sym), ` (${unit})`),
        ...cols.map((c) => h('td', { class: c.planned ? 'planned' : '' }, f(c)))))));

    // the working, written out with the numbers
    const eqs: HTMLElement[] = [];
    const line = (...parts: (string | Node)[]) => eqs.push(h('p', null, ...parts));
    const s1 = this.s1;
    const g = !s1 ? this.boat : s1.grams, n1 = g / M;
    if (!s1 || s1.kind === 'flask') {
      const V = !s1 ? this.flaskSel : s1.flask;
      line(h('i', null, 'n'), ` = m / M = ${grams(g)} g / ${numTrim(M, 2)} g/mol = ${sig(n1)} mol`);
      line(h('i', null, 'c'), ` = n / V = ${sig(n1)} mol / ${num(V / 1000, 4)} L = `, h('strong', null, `${sig(n1 / (V / 1000))} mol/L`));
    } else {
      line(h('i', null, 'n'), ` = m / M = ${grams(g)} g / ${numTrim(M, 2)} g/mol = ${sig(n1)} mol`);
      line(L({ en: `V is more than ${numTrim(s1.water)} mL (water plus the dissolved solid), so `, de: `V ist größer als ${numTrim(s1.water)} mL (Wasser plus gelöster Feststoff), also ` }),
        h('i', null, 'c'), ` < ${sig(n1)} mol / ${num(s1.water / 1000, 4)} L = `, h('strong', null, `${sig(s1.cMax)} mol/L`));
    }
    if (this.s2) {
      const s2 = this.s2;
      line(h('i', null, 'c'), h('sub', null, '2'), ' = ', h('i', null, 'c'), h('sub', null, '1'), ' · ', h('i', null, 'V'), h('sub', null, '1'), ' / ', h('i', null, 'V'), h('sub', null, '2'),
        ` = ${sig(s2.c1)} mol/L · ${numTrim(s2.pipette)} mL / ${numTrim(s2.flask)} mL = `, h('strong', null, `${sig(s2.c)} mol/L`),
        h('span', { class: 'muted' }, L({ en: ' (from c₁ · V₁ = c₂ · V₂: n stays the same)', de: ' (aus c₁ · V₁ = c₂ · V₂: n bleibt gleich)' })));
    }
    if (this.por) {
      const p = this.por;
      line(L({ en: 'Portion: ', de: 'Portion: ' }), h('i', null, 'n'), ` = c · V = ${sig(p.c)} mol/L · ${litres(p.mL)} L = ${sig((p.c * p.mL) / 1000)} mol`,
        h('span', { class: 'muted' }, L({ en: ': c stays the same, n is smaller.', de: ': c bleibt gleich, n ist kleiner.' })));
    }
    const headRow = h('div', { class: 'ob-head' }, h('strong', null, L({ en: 'In each vessel', de: 'In jedem Gefäß' })));
    if (!this.compact && this.c.zoom) {
      this.zoomBtn = h('button', { class: 'btn small quiet', type: 'button', 'aria-pressed': String(this.zoomOn), onclick: () => this.toggleZoom() },
        this.zoomOn ? L({ en: 'Hide the particles', de: 'Teilchen ausblenden' }) : L({ en: 'Zoom in on the particles', de: 'Teilchen zeigen' })) as HTMLButtonElement;
      headRow.append(this.zoomBtn);
    }
    this.readout.replaceChildren(headRow, h('div', { class: 'bench-scroll' }, table), h('div', { class: 'bench-eqs' }, ...eqs));
    if (!this.compact) this.readout.append(h('p', { class: 'muted small bench-key' }, L({ en: 'm mass, M molar mass, n amount of substance, V volume of the solution, c concentration, β mass concentration', de: 'm Masse, M molare Masse, n Stoffmenge, V Volumen der Lösung, c Stoffmengenkonzentration, β Massenkonzentration' })));
  }

  /** The particle inset: one circle per vessel, dots in proportion to c. */
  private drawZoom() {
    this.zoomBox.hidden = !this.zoomOn;
    if (!this.zoomOn) { this.zoomBox.replaceChildren(); return; }
    const s = this.sol, k = s.particles, ion = !!s.ions;
    let capped = false, under = false;
    const circle = (col: Col) => {
      const want = Math.round(col.c * DOTS_PER_MOL_L), units = Math.min(want, Math.floor(MAX_DOTS / k));
      if (want > units) capped = true;
      if (col.c > 0 && want === 0) under = true;
      const g = svg('svg', { viewBox: '-60 -60 120 120', class: 'bench-dots', role: 'img', 'aria-label': `${col.head}: ${units * k}` });
      g.append(svg('circle', { r: 58, class: 'bench-dots-ring' }));
      for (let i = 0; i < units * k && i < DOTS.length; i++) {
        const [x, y] = DOTS[i], kind = !ion ? 'mol' : i % 2 ? 'an' : 'cat';
        const dot = svg('g', { class: 'dot ' + kind, transform: `translate(${x.toFixed(1)} ${y.toFixed(1)})` }, svg('circle', { r: kind === 'an' ? 4.8 : 4.2 }));
        if (kind !== 'mol') dot.append(svg('path', { d: kind === 'cat' ? 'M-2.4 0H2.4M0 -2.4V2.4' : 'M-2.4 0H2.4' }));
        g.append(dot);
      }
      return h('figure', null, g, h('figcaption', null, col.head + (col.bound ? L({ en: ' (at most)', de: ' (höchstens)' }) : '')));
    };
    const figs = this.columns().map(circle);
    const key = h('div', { class: 'bench-dot-key' }, ...(ion && s.ions
      ? [h('span', null, h('i', { class: 'cat' }, '+'), chem(s.ions[0])), h('span', null, h('i', { class: 'an' }, '−'), chem(s.ions[1]))]
      : [h('span', null, h('i', { class: 'mol' }), L({ en: 'glucose molecule (no charge)', de: 'Glucosemolekül (ohne Ladung)' }))]));
    this.zoomBox.replaceChildren(
      h('div', { class: 'bench-figs' }, ...figs), key,
      h('p', { class: 'muted small' }, L({ en: 'Each dot stands for very many particles. Model picture: the number of dots is in proportion to c.', de: 'Jeder Punkt steht für sehr viele Teilchen. Modellbild: Die Zahl der Punkte ist proportional zu c.' }),
        ion ? L({ en: ` Each formula unit gives ${k} ions.`, de: ` Jede Formeleinheit ergibt ${k} Ionen.` }) : '',
        capped ? L({ en: ' Capped at 60 dots: the real solution is even more crowded.', de: ' Höchstens 60 Punkte: Die echte Lösung ist noch dichter.' }) : '',
        under ? L({ en: ' Fewer than one dot: too dilute for this picture.', de: ' Weniger als ein Punkt: zu verdünnt für dieses Bild.' }) : ''));
  }

  dispose() {
    clearTimeout(this.weighTimer);
    this.listeners.clear();
    this.stage.dispose();
  }
}
