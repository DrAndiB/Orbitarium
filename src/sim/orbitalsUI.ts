// The Orbital Viewer as a screen component: 3D atom, readouts, element stepper, orbital boxes,
// and optional panels for shielding (unit 2), ionization (unit 3) and hydrogen's light (unit 1).
import { AtomStage, SUB_COLOR, IONIC_RADIUS, type AtomView } from './orbitals';
import { FILL_ORDER, cliffAfter, groundConfig, ionize, addElectrons, configText, shellCounts, boxes, electronCount, IONIZATION, hLevel, hWavelength, wavelengthColor, type Config } from '../content/atoms';
import type { Show } from '../content/unitTypes';
import { byZ } from '../content/elements';
import { h, s, clear } from '../ui/dom';
import { L, num, getLang } from '../i18n';
import { buzz } from '../platform';
import { touchElements } from '../model/learner';

export interface AtomUIOptions {
  start?: number;
  maxZ?: number;
  compact?: boolean;
  view?: AtomView;
  /** ions offered as chips, as 'Z±q' keys like '11+1' or '8-2' (unit 2) */
  ions?: string[];
  controls?: { view?: boolean; stepper?: boolean; boxes?: boolean; shielding?: boolean; ionize?: boolean; spectrum?: boolean; size?: boolean };
}

type Fn = (...a: any[]) => void;
const hex = (n: number) => '#' + n.toString(16).padStart(6, '0');

export class AtomUI {
  readonly el: HTMLElement;
  readonly stage: AtomStage;
  private hud: HTMLElement;
  private boxPanel?: HTMLElement;
  private zRange?: HTMLInputElement;
  private iePanel?: HTMLElement;
  private shieldOut?: HTMLElement;
  private listeners = new Map<string, Set<Fn>>();
  private ionRow?: HTMLElement;
  private jumpFn?: (a: number, b: number) => void;
  /** electrons pulled off so far (unit 3), with the energy each one cost */
  pulled: number[] = [];

  constructor(opts: AtomUIOptions = {}) {

    const c = { view: true, stepper: true, boxes: true, shielding: false, ionize: false, spectrum: false, size: false, ...opts.controls };
    const stageEl = h('div', { class: 'wb-stage' + (opts.compact ? ' compact' : '') });
    this.hud = h('div', { class: 'wb-hud atom-hud' });
    stageEl.append(this.hud);
    this.el = h('div', { class: 'workbench atom-viewer' }, stageEl);
    this.stage = new AtomStage(stageEl, !!opts.compact);
    this.stage.sizeMode = !!c.size;
    if (opts.view) this.stage.view = opts.view;
    this.stage.on('view', () => this.syncViewChips());

    if (c.view) {
      const row = h('div', { class: 'chip-row', role: 'group', 'aria-label': L({ en: 'Picture', de: 'Darstellung' }) });
      const mk = (v: AtomView, label: { en: string; de: string }) => h('button', { class: 'chip', type: 'button', 'data-view': v, 'aria-pressed': String(this.stage.view === v), onclick: () => { this.stage.setView(v); row.querySelectorAll('.chip').forEach((b) => b.setAttribute('aria-pressed', String((b as HTMLElement).dataset.view === v))); this.emit('view', v); } }, L(label));
      row.append(mk('shells', { en: 'Shells (Bohr picture)', de: 'Schalen (Bohr-Bild)' }), mk('clouds', { en: 'Orbital clouds', de: 'Orbitalwolken' }));
      this.el.append(row);
    }
    if (c.stepper) {
      const max = opts.maxZ ?? 36;
      this.zRange = h('input', { type: 'range', min: '1', max: String(max), step: '1', value: String(opts.start ?? 11), 'aria-label': L({ en: 'Atomic number', de: 'Ordnungszahl' }) }) as HTMLInputElement;
      this.zRange.addEventListener('input', () => this.setElement(+this.zRange!.value));
      const prev = h('button', { class: 'btn small quiet', type: 'button', onclick: () => this.setElement(Math.max(1, this.stage.Z - 1)) }, L({ en: '◀ previous element', de: '◀ voriges Element' }));
      const next = h('button', { class: 'btn small', type: 'button', onclick: () => this.setElement(Math.min(max, this.stage.Z + 1), true) }, L({ en: 'Next: + 1 proton, + 1 electron ▶', de: 'Weiter: + 1 Proton, + 1 Elektron ▶' }));
      this.el.append(h('div', { class: 'atom-stepper' }, h('label', { class: 'muted small' }, L({ en: 'Element', de: 'Element' })), this.zRange), h('div', { class: 'atom-buttons' }, prev, next));
    }
    if (opts.ions?.length) {
      this.ionRow = h('div', { class: 'chip-row wrap', role: 'group', 'aria-label': L({ en: 'Make an ion', de: 'Ein Ion bilden' }) });
      for (const key of opts.ions) {
        const [z, q] = parseIon(key);
        this.ionRow.append(h('button', { class: 'chip small', type: 'button', 'data-ion': key, 'aria-pressed': 'false', onclick: () => {
          const on = this.stage.Z === z && this.charge() === q;
          if (on) this.setElement(z); else this.setIon(z, q);
        } }, ionText(z, q)));
      }
      this.el.append(h('div', { class: 'wb-build-label' }, L({ en: 'Make an ion (tap again for the atom)', de: 'Ein Ion bilden (nochmal tippen für das Atom)' })), this.ionRow);
    }
    if (c.boxes) { this.boxPanel = h('div', { class: 'panel orbital-boxes', 'aria-live': 'polite' }); this.el.append(this.boxPanel); }
    if (c.shielding) this.el.append(this.shieldingPanel());
    if (c.ionize) { this.iePanel = h('div', { class: 'panel ie-panel' }); this.el.append(this.iePanel); }
    if (c.spectrum) this.el.append(this.spectrumPanel());
    this.setElement(opts.start ?? 11);
  }

  on(evt: string, f: Fn) { if (!this.listeners.has(evt)) this.listeners.set(evt, new Set()); this.listeners.get(evt)!.add(f); }
  private emit(evt: string, ...a: unknown[]) { this.listeners.get(evt)?.forEach((f) => f(...a)); }

  /** Show element Z as a neutral atom. `stepped` marks the newest electron when walking up one element. */
  setElement(Z: number, stepped = false) {
    const prev = this.stage.Z;
    const cfg = groundConfig(Z);
    let newest: string | null = null;
    if (stepped && Z === prev + 1) {
      const before = groundConfig(prev);
      for (const sub of FILL_ORDER) if ((cfg.get(sub.id) ?? 0) > (before.get(sub.id) ?? 0)) { newest = sub.id; break; }
    }
    this.pulled = [];
    this.stage.setAtom(Z, cfg, newest);
    if (this.zRange) this.zRange.value = String(Z);
    touchElements([byZ(Z).s]);
    this.refresh();
    buzz('light');
    this.emit('element', Z, newest);
  }

  /** Show a given configuration (e.g. an ion) for element Z. */
  setConfig(Z: number, cfg: Config) { this.stage.setAtom(Z, cfg); this.refresh(); }

  /** Charge of what is shown now: protons minus electrons. */
  charge(): number { return this.stage.Z - electronCount(this.stage.config); }

  /** Show element Z as an ion with charge q (+2: two electrons removed, −1: one added). */
  setIon(Z: number, q: number) {
    if (this.stage.Z !== Z) this.setElement(Z);
    this.pulled = [];
    const cfg = q > 0 ? ionize(groundConfig(Z), q) : q < 0 ? addElectrons(groundConfig(Z), -q) : groundConfig(Z);
    this.stage.setAtom(Z, cfg);
    this.refresh();
    buzz('light');
    this.emit('ion', Z, q);
  }

  /** Show what a reveal or worked example asks for. */
  show(sh: Extract<Show, { engine: 'atom' }>) {
    if (sh.size !== undefined) this.stage.setSizeMode(sh.size);
    this.setElement(sh.z);
    if (sh.charge) this.setIon(sh.z, sh.charge);
    if (sh.view) { this.stage.setView(sh.view); this.syncViewChips(); }
    if (sh.highlight) { if (this.stage.view !== 'clouds') this.stage.setView('clouds'); this.stage.setHighlight(sh.highlight); this.drawBoxes(); this.syncViewChips(); }
    for (let i = 0; i < (sh.pull ?? 0); i++) this.pullOne();
    if (sh.jump && this.jumpFn) this.jumpFn(sh.jump[0], sh.jump[1]);
  }

  private refresh() {
    const Z = this.stage.Z, e = byZ(Z), cfg = this.stage.config;
    const charge = Z - electronCount(cfg);
    const chargeText = charge === 0 ? '' : charge > 0 ? `${charge > 1 ? charge : ''}+` : `${-charge > 1 ? -charge : ''}−`;
    clear(this.hud);
    this.hud.append(
      h('div', { class: 'atom-id' }, h('span', { class: 'atom-sym' }, e.s, chargeText ? h('sup', null, chargeText) : null), h('span', { class: 'atom-name' }, `${getLang() === 'de' ? e.de : e.en} · Z = ${Z}`)),
      h('div', { class: 'atom-cfg' }, configText(cfg) || '–'),
      h('div', { class: 'atom-shells' }, `${L({ en: 'shells', de: 'Schalen' })} ${shellCounts(cfg).join(' · ')}`));
    if (this.stage.sizeMode) this.hud.append(h('div', { class: 'atom-size' }, this.sizeText(Z, charge)));
    this.ionRow?.querySelectorAll('.chip').forEach((b) => b.setAttribute('aria-pressed', String((b as HTMLElement).dataset.ion === `${Z}${charge >= 0 ? '+' : '-'}${Math.abs(charge)}` && charge !== 0)));
    if (this.shieldOut) this.shieldOut.replaceChildren('Z', h('sub', null, 'eff'), ` ≈ ${num(this.stage.zeffOuter(), 1)}`);
    this.drawBoxes();
    this.drawIE();
  }

  // ---------- orbital box diagram ----------
  private drawBoxes() {
    if (!this.boxPanel) return;
    const cfg = this.stage.config;
    const lastIdx = Math.max(...FILL_ORDER.map((sub, i) => ((cfg.get(sub.id) ?? 0) > 0 ? i : -1)));
    const shown = FILL_ORDER.slice(0, Math.min(FILL_ORDER.length, lastIdx + 2));
    const rows = [...shown].reverse().map((sub) => {
      const k = cfg.get(sub.id) ?? 0;
      const bx = boxes(sub, k);
      const isNew = this.stage.newest === sub.id;
      const row = h('button', { class: 'ob-row' + (k ? '' : ' empty') + (this.stage.highlight === sub.id ? ' on' : ''), type: 'button', style: `--sub:${hex(SUB_COLOR[sub.l])}`, 'aria-label': `${sub.id}: ${k} ${L({ en: 'electrons', de: 'Elektronen' })}`,
        onclick: () => { const on = this.stage.highlight === sub.id ? null : sub.id; if (this.stage.view !== 'clouds') this.stage.view = 'clouds'; this.stage.setHighlight(on); this.drawBoxes(); this.syncViewChips(); this.emit('highlight', on); } },
        h('span', { class: 'ob-label' }, sub.id),
        h('span', { class: 'ob-boxes' }, bx.map((o, i) => h('span', { class: 'ob-box' + (isNew && i === (k - 1) % bx.length ? ' new' : '') }, o === 2 ? '↑↓' : o === 1 ? '↑' : ''))),
        h('span', { class: 'ob-count' }, k ? `${k}/${sub.cap}` : ''));
      return row;
    });
    this.boxPanel.replaceChildren(
      h('div', { class: 'ob-head' }, h('strong', null, L({ en: 'Orbital boxes', de: 'Orbitalkästchen' })), h('span', { class: 'muted small' }, L({ en: 'lowest energy at the bottom · tap a row to see its cloud', de: 'niedrigste Energie unten · Zeile antippen zeigt ihre Wolke' }))),
      ...rows);
  }
  private sizeText(Z: number, q: number): string {
    const r = q === 0 ? byZ(Z).r : IONIC_RADIUS[`${Z}${q > 0 ? '+' : '-'}${Math.abs(q)}`];
    if (r === null || r === undefined) return L({ en: 'size not measured', de: 'Größe nicht gemessen' });
    return q === 0 ? L({ en: `radius ${r} pm`, de: `Radius ${r} pm` }) : L({ en: `ion radius ${r} pm`, de: `Ionenradius ${r} pm` });
  }
  private syncViewChips() { this.el.querySelectorAll('[data-view]').forEach((b) => b.setAttribute('aria-pressed', String((b as HTMLElement).dataset.view === this.stage.view))); }

  // ---------- shielding (unit 2) ----------
  private shieldingPanel(): HTMLElement {
    this.shieldOut = h('strong', { class: 'shield-out' });
    const input = h('input', { type: 'range', min: '0', max: '100', step: '5', value: '100', 'aria-label': L({ en: 'How well the inner electrons shield', de: 'Wie gut die inneren Elektronen abschirmen' }) }) as HTMLInputElement;
    const pct = h('span', { class: 'muted' }, '100 %');
    input.addEventListener('input', () => { this.stage.setShielding(+input.value / 100); pct.textContent = `${input.value} %`; this.refresh(); this.emit('shielding', +input.value / 100); });
    return h('div', { class: 'wb-equation' },
      h('label', { class: 'wb-eq-head' }, h('span', null, L({ en: 'How well the inner electrons shield', de: 'Wie gut die inneren Elektronen abschirmen' })), pct),
      input,
      h('p', { class: 'wb-eq' }, 'Z', h('sub', null, 'eff'), ' ≈ Z − ', L({ en: 'shielding × inner electrons', de: 'Abschirmung × innere Elektronen' }), ' · ', this.shieldOut));
  }

  // ---------- ionization (unit 3) ----------
  private drawIE() {
    if (!this.iePanel) return;
    const Z = this.stage.Z;
    const ies = IONIZATION[Z] ?? [];
    const pull = h('button', { class: 'btn small', type: 'button', disabled: this.pulled.length >= ies.length || this.pulled.length >= Z }, L({ en: 'Pull off the outermost electron', de: 'Das äußerste Elektron abziehen' }));
    pull.addEventListener('click', () => this.pullOne());
    const reset = h('button', { class: 'btn small quiet', type: 'button', disabled: !this.pulled.length }, L({ en: 'Put them all back', de: 'Alle zurücksetzen' }));
    reset.addEventListener('click', () => this.setElement(Z));
    // bar chart of the energies paid so far
    const W = 320, H = 150, max = Math.max(...ies.slice(0, Math.max(1, this.pulled.length)), 1);
    const svg = s('svg', { viewBox: `0 -20 ${W} ${H + 50}`, class: 'ie-chart', role: 'img', 'aria-label': L({ en: 'Energy for each electron pulled off', de: 'Energie für jedes abgezogene Elektron' }) });
    const bw = W / Math.max(6, ies.length);
    // only the biggest jump in the whole series is the cliff (aluminium 578 → 1817 is a jump, but not the cliff)
    const cliff = cliffAfter(Z);
    this.pulled.forEach((v, i) => {
      const bh = Math.max(2, (v / max) * H);
      const jump = i === cliff;
      svg.appendChild(s('rect', { x: i * bw + 6, y: H - bh, width: bw - 12, height: bh, rx: 4, fill: jump ? '#ff6b6b' : '#ffc15e' }));
      svg.appendChild(s('text', { x: i * bw + bw / 2, y: H - bh - 6, 'text-anchor': 'middle', 'font-size': 12, fill: '#ece6d6' }, num(v, 0)));
      svg.appendChild(s('text', { x: i * bw + bw / 2, y: H + 18, 'text-anchor': 'middle', 'font-size': 12, fill: '#9aa3bf' }, `${i + 1}.`));
    });
    if (!ies.length) svg.appendChild(s('text', { x: W / 2, y: H / 2, 'text-anchor': 'middle', 'font-size': 13, fill: '#9aa3bf' }, L({ en: 'Energy data for elements 1–20', de: 'Energiedaten für die Elemente 1–20' })));
    const total = this.pulled.reduce((a, b) => a + b, 0);
    this.iePanel.replaceChildren(
      h('div', { class: 'ob-head' }, h('strong', null, L({ en: 'Pulling electrons off', de: 'Elektronen abziehen' })), h('span', { class: 'muted small' }, L({ en: 'kJ/mol for each electron, one after another', de: 'kJ/mol für jedes Elektron, eines nach dem anderen' }))),
      svg,
      h('p', { class: 'muted small', style: 'margin:4px 0 8px' }, this.pulled.length ? L({ en: `${this.pulled.length} pulled off, ${num(total, 0)} kJ/mol in all.`, de: `${this.pulled.length} abgezogen, insgesamt ${num(total, 0)} kJ/mol.` }) : L({ en: 'Nothing pulled off yet.', de: 'Noch nichts abgezogen.' })),
      h('div', { class: 'atom-buttons' }, pull, reset));
  }

  pullOne() {
    const Z = this.stage.Z, ies = IONIZATION[Z] ?? [];
    if (this.pulled.length >= ies.length) return;
    const v = ies[this.pulled.length];
    this.pulled.push(v);
    const cfg = ionize(groundConfig(Z), this.pulled.length);
    this.stage.setAtom(Z, cfg);
    this.refresh();
    buzz(this.pulled.length > 1 && v / this.pulled[this.pulled.length - 2] > 2.5 ? 'heavy' : 'light');
    this.emit('pulled', this.pulled.length, v);
  }

  // ---------- hydrogen's light (unit 1) ----------
  private spectrumPanel(): HTMLElement {
    const W = 320, H = 230;
    // Broken axis: n = 1 sits far below, so the upper levels get the room they need to be told apart.
    const y = (n: number) => (n === 1 ? 214 : 20 + (150 - 20) * (hLevel(n) - hLevel(7)) / (hLevel(2) - hLevel(7)) * (n === 2 ? 1 : 1));
    const svg = s('svg', { viewBox: `0 0 ${W} ${H}`, class: 'level-ladder', role: 'img', 'aria-label': L({ en: 'Energy levels of hydrogen', de: 'Energieniveaus von Wasserstoff' }) });
    for (let n = 1; n <= 6; n++) {
      svg.appendChild(s('line', { x1: 40, x2: 200, y1: y(n), y2: y(n), stroke: '#4a5a8f', 'stroke-width': n === 2 ? 2 : 1.2 }));
      if (n <= 4) {
        svg.appendChild(s('text', { x: 34, y: y(n) + 4, 'text-anchor': 'end', 'font-size': 12, fill: '#9aa3bf' }, `n=${n}`));
        svg.appendChild(s('text', { x: 206, y: y(n) + 4, 'font-size': 11, fill: '#6f7aa0' }, `${num(hLevel(n), 2)} eV`));
      }
    }
    svg.appendChild(s('text', { x: 34, y: y(6) - 4, 'text-anchor': 'end', 'font-size': 11, fill: '#6f7aa0' }, '5, 6 …'));
    svg.appendChild(s('path', { d: `M112 172 l16 -6 M112 180 l16 -6`, stroke: '#6f7aa0', 'stroke-width': 1.2 }));
    svg.appendChild(s('text', { x: 206, y: 178, 'font-size': 10, fill: '#6f7aa0' }, L({ en: 'axis broken', de: 'Achse unterbrochen' })));
    const arrowG = s('g');
    svg.appendChild(arrowG);
    const strip = s('svg', { viewBox: '0 0 320 40', class: 'spectrum-strip', role: 'img', 'aria-label': L({ en: 'Lines seen so far', de: 'Bisher gesehene Linien' }) });
    strip.appendChild(s('rect', { x: 0, y: 0, width: 320, height: 28, rx: 6, fill: '#0b0f1f' }));
    for (const t of [400, 500, 600, 700]) strip.appendChild(s('text', { x: ((t - 380) / 370) * 320, y: 39, 'text-anchor': 'middle', 'font-size': 9, fill: '#6f7aa0' }, `${t} nm`));
    const out = h('p', { class: 'muted small', 'aria-live': 'polite', style: 'margin:6px 0' }, L({ en: 'Tap a jump to let the electron fall and see what comes out.', de: 'Tippe einen Sprung an, um das Elektron fallen zu lassen und zu sehen, was herauskommt.' }));
    const jump = this.jumpFn = (a: number, b: number) => {
      const nm = hWavelength(a, b), col = wavelengthColor(nm);
      clear(arrowG);
      arrowG.appendChild(s('line', { x1: 120, x2: 120, y1: y(a), y2: y(b) - 4, stroke: col ?? '#9aa3bf', 'stroke-width': 3, 'stroke-dasharray': col ? '' : '4 3' }));
      arrowG.appendChild(s('path', { d: `M114 ${y(b) - 10} L120 ${y(b) - 1} L126 ${y(b) - 10} Z`, fill: col ?? '#9aa3bf' }));
      arrowG.appendChild(s('circle', { cx: 150, cy: (y(a) + y(b)) / 2, r: 7, fill: col ?? 'none', stroke: col ?? '#9aa3bf', 'stroke-dasharray': col ? '' : '2 2' }));
      if (col) strip.appendChild(s('rect', { x: ((nm - 380) / 370) * 320 - 1.5, y: 2, width: 3, height: 24, fill: col }));
      const kind = col ? L({ en: 'visible light', de: 'sichtbares Licht' }) : nm < 380 ? L({ en: 'ultraviolet, invisible to the eye', de: 'ultraviolett, für das Auge unsichtbar' }) : L({ en: 'infrared, invisible to the eye', de: 'infrarot, für das Auge unsichtbar' });
      out.textContent = L({ en: `n=${a} → n=${b}: ${num(hLevel(a) - hLevel(b), 2)} eV, ${num(nm, 0)} nm, ${kind}.`, de: `n=${a} → n=${b}: ${num(hLevel(a) - hLevel(b), 2)} eV, ${num(nm, 0)} nm, ${kind}.` });
      buzz('light');
      this.emit('jump', a, b, nm);
    };
    const btns = h('div', { class: 'chip-row wrap' },
      ...[3, 4, 5, 6].map((a) => h('button', { class: 'chip', type: 'button', onclick: () => jump(a, 2) }, `${a} → 2`)),
      h('button', { class: 'chip', type: 'button', onclick: () => jump(2, 1) }, '2 → 1'),
      h('button', { class: 'chip', type: 'button', onclick: () => jump(4, 3) }, '4 → 3'));
    return h('div', { class: 'panel spectrum-panel' },
      h('div', { class: 'ob-head' }, h('strong', null, L({ en: 'Hydrogen\'s energy levels', de: 'Die Energieniveaus von Wasserstoff' })), h('span', { class: 'muted small' }, L({ en: 'an electron can only sit on these rungs', de: 'ein Elektron kann nur auf diesen Sprossen sitzen' }))),
      svg, btns, out, strip);
  }

  dispose() { this.stage.dispose(); }
}

/** '11+1' → [11, 1], '8-2' → [8, −2] */
export function parseIon(key: string): [number, number] {
  const m = /^(\d+)([+-])(\d+)$/.exec(key)!;
  return [+m[1], (m[2] === '+' ? 1 : -1) * +m[3]];
}
/** Na⁺, Mg²⁺, O²⁻ … */
export function ionText(z: number, q: number): string {
  const sup: Record<string, string> = { '2': '²', '3': '³' };
  return byZ(z).s + (Math.abs(q) > 1 ? sup[String(Math.abs(q))] ?? String(Math.abs(q)) : '') + (q > 0 ? '⁺' : '⁻');
}
