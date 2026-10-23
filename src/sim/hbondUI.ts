// The hydrogen-bond view as a screen component (unit 10): a molecule with its donors and acceptors, a partner
// docked along the best hydrogen bond (or the reason there is none), swapping roles, and water with four neighbours.
import { HBondStage, HB_MOLECULES, molecule, singleScene, pairScene, clusterScene, hasCH, hHost, countsText, noBondReason, bondSentence, cap, nameOf, NOTE_CL_S, NOTE_CH, type El, type Scene } from './hbond';
import { h, chem, clear } from '../ui/dom';
import { L, type Bi } from '../i18n';
import { buzz } from '../platform';
import type { Show } from '../content/unitTypes';
import './hbond.css';

export interface HBondUIOptions {
  start?: string;
  molecules?: string[];
  partners?: string[];
  compact?: boolean;
  controls?: { partner?: boolean; swap?: boolean; cluster?: boolean };
}
type Fn = (...a: any[]) => void;

export class HBondUI {
  readonly el: HTMLElement;
  readonly stage: HBondStage;
  private hud: HTMLElement;
  private info: HTMLElement;
  private facts: HTMLElement;
  private molRow?: HTMLElement;
  private partnerRow?: HTMLElement;
  private swapBtn?: HTMLButtonElement;
  private clusterBtn?: HTMLButtonElement;
  private listeners = new Map<string, Set<Fn>>();
  a = 'H2O';
  b: string | null = null;
  swapped = false;
  cluster = false;
  private sc: Scene = singleScene('H2O');

  constructor(opts: HBondUIOptions = {}) {
    const c = { partner: true, swap: true, cluster: true, ...opts.controls };
    const compact = !!opts.compact;
    const stageEl = h('div', { class: 'wb-stage' + (compact ? ' compact' : '') });
    this.hud = h('div', { class: 'wb-hud hb-hud' });
    stageEl.append(this.hud);
    this.el = h('div', { class: 'workbench hbond' + (compact ? ' compact' : '') }, stageEl);
    this.stage = new HBondStage(stageEl, compact);
    this.info = h('div', { class: 'hb-info', 'aria-live': 'polite' });
    this.facts = h('div', { class: 'bond-facts hb-facts' });

    const mols = (opts.molecules ?? HB_MOLECULES).filter((id) => HB_MOLECULES.includes(id));
    const partners = (opts.partners ?? mols).filter((id) => HB_MOLECULES.includes(id));
    if (!compact) {
      this.molRow = h('div', { class: 'chip-row', role: 'group', 'aria-label': L({ en: 'Molecule', de: 'Molekül' }) });
      for (const id of mols) this.molRow.append(h('button', { class: 'chip', type: 'button', 'data-id': id, 'aria-pressed': 'false', onclick: () => this.setA(id) }, chem(molecule(id).formula)));
      this.el.append(h('div', { class: 'wb-build-label' }, L({ en: 'Molecule', de: 'Molekül' })), this.molRow);
      if (c.partner) {
        this.partnerRow = h('div', { class: 'chip-row', role: 'group', 'aria-label': L({ en: 'Partner', de: 'Partner' }) });
        this.partnerRow.append(h('button', { class: 'chip', type: 'button', 'data-id': '', 'aria-pressed': 'true', onclick: () => this.setB(null) }, L({ en: 'none', de: 'keiner' })));
        for (const id of partners) this.partnerRow.append(h('button', { class: 'chip', type: 'button', 'data-id': id, 'aria-pressed': 'false', onclick: () => this.setB(id) }, chem(molecule(id).formula)));
        this.el.append(h('div', { class: 'wb-build-label' }, L({ en: 'Partner molecule', de: 'Partnermolekül' })), this.partnerRow);
      }
      const btns = h('div', { class: 'atom-buttons' });
      if (c.swap) { this.swapBtn = h('button', { class: 'btn small quiet', type: 'button', onclick: () => this.swap() }, L({ en: 'Swap roles', de: 'Rollen tauschen' })) as HTMLButtonElement; btns.append(this.swapBtn); }
      if (c.cluster) { this.clusterBtn = h('button', { class: 'btn small quiet', type: 'button', onclick: () => this.showCluster() }, L({ en: 'Water with four neighbours', de: 'Wasser mit vier Nachbarn' })) as HTMLButtonElement; btns.append(this.clusterBtn); }
      if (btns.children.length) this.el.append(btns);
    }
    this.el.append(this.info, this.facts, this.legend());
    this.stage.labels = {
      hb: L({ en: 'hydrogen bond, about 190 pm', de: 'Wasserstoffbrücke, etwa 190 pm' }),
      cov: (x: El) => L({ en: `${x}–H bond, ${x === 'O' ? 96 : x === 'N' ? 101 : 92} pm`, de: `${x}–H-Bindung, ${x === 'O' ? 96 : x === 'N' ? 101 : 92} pm` }),
    };
    const start = opts.start && HB_MOLECULES.includes(opts.start) ? opts.start : 'H2O';
    this.a = start;
    this.render(false);
  }

  on(evt: string, f: Fn) { if (!this.listeners.has(evt)) this.listeners.set(evt, new Set()); this.listeners.get(evt)!.add(f); return () => this.listeners.get(evt)!.delete(f); }
  private emit(evt: string, ...a: unknown[]) { this.listeners.get(evt)?.forEach((f) => f(...a)); }

  setA(id: string) {
    this.a = id; this.cluster = false; this.swapped = false;
    this.render();
    this.emit('molecule', id);
    if (this.b) this.emitPartner();
  }
  setB(id: string | null) {
    this.b = id; this.cluster = false; this.swapped = false;
    this.render();
    this.emitPartner();
  }
  swap() {
    const p = this.sc.pair;
    if (!p || p.possible.length < 2) return;
    this.swapped = !this.swapped;
    this.render();
    this.emit('swap', this.sc.pair?.shown ?? null);
  }
  showCluster() {
    this.a = 'H2O'; this.b = null; this.swapped = false; this.cluster = true;
    this.render();
    this.emit('cluster');
  }
  private emitPartner() {
    const p = this.sc.pair;
    this.emit('partner', this.a, this.b, !!(p && p.shown), p?.shown ?? null);
  }

  show(s: Extract<Show, { engine: 'hbond' }>) {
    if (s.cluster) { this.a = 'H2O'; this.b = null; this.swapped = false; this.cluster = true; }
    else { this.a = HB_MOLECULES.includes(s.a) ? s.a : 'H2O'; this.b = s.b && HB_MOLECULES.includes(s.b) ? s.b : null; this.swapped = !!s.swap; this.cluster = false; }
    this.render(false);
  }

  private render(haptic = true) {
    this.sc = this.cluster ? clusterScene() : this.b ? pairScene(this.a, this.b, this.swapped) : singleScene(this.a);
    this.stage.draw(this.sc);
    if (haptic) buzz('light');
    this.refresh();
  }

  private refresh() {
    const A = molecule(this.a), B = this.b ? molecule(this.b) : null;
    this.molRow?.querySelectorAll('.chip').forEach((x) => x.setAttribute('aria-pressed', String(!this.cluster && (x as HTMLElement).dataset.id === this.a)));
    this.partnerRow?.querySelectorAll('.chip').forEach((x) => x.setAttribute('aria-pressed', String((x as HTMLElement).dataset.id === (this.cluster ? '__' : this.b ?? ''))));
    this.clusterBtn?.setAttribute('aria-pressed', String(this.cluster));
    const p = this.sc.pair;
    if (this.swapBtn) this.swapBtn.disabled = !(p && p.possible.length > 1);

    clear(this.hud);
    const formula = this.cluster ? h('span', null, chem('H2O'), ' × 5') : B ? h('span', null, chem(A.formula), ' + ', chem(B.formula)) : chem(A.formula);
    const sub = this.cluster ? L({ en: 'one water molecule and four neighbours', de: 'ein Wassermolekül und vier Nachbarn' }) : B ? `${cap(nameOf(A))} + ${nameOf(B)}` : cap(nameOf(A));
    this.hud.append(h('div', null, h('div', { class: 'wb-formula' }, formula), h('div', { class: 'muted small' }, sub)));

    const lines: HTMLElement[] = [];
    if (this.cluster) {
      lines.push(h('p', { class: 'hb-status ok' }, L({ en: 'Water with four neighbours: it donates two hydrogen bonds and accepts two. Every molecule in ice has this pattern.', de: 'Wasser mit vier Nachbarn: Es ist zweimal Donor und zweimal Akzeptor. Im Eis hat jedes Molekül dieses Muster.' })));
      lines.push(h('p', { class: 'hb-counts' }, countsText(A)));
    } else {
      lines.push(h('p', { class: 'hb-counts' }, B && B.id !== A.id ? h('span', null, h('b', null, chem(A.formula)), ' ', countsText(A), h('br'), h('b', null, chem(B.formula)), ' ', countsText(B)) : countsText(A)));
      if (B && p) {
        if (p.shown) lines.push(h('p', { class: 'hb-status ok' }, bondSentence(A, B, p.shown, p.possible.length > 1)));
        else lines.push(h('p', { class: 'hb-status none' }, noBondReason(A, B)));
      }
      const mols = B ? [A, B] : [A];
      if (mols.some((m) => !m.lps.length && (hHost(m) === 'Cl' || hHost(m) === 'S'))) lines.push(h('p', { class: 'muted small hb-note' }, L(NOTE_CL_S)));
      if (mols.some(hasCH) && !(B && p?.shown)) lines.push(h('p', { class: 'muted small hb-note' }, L(NOTE_CH)));
    }
    this.info.replaceChildren(...lines);

    // facts: the two distances when a hydrogen bond is shown
    const hb = this.sc.hbonds[0];
    if (hb) {
      const x = hb.donor.mol.atoms[hb.x].el, y = hb.acceptor.mol.atoms[hb.y].el;
      const cov = x === 'O' ? 96 : x === 'N' ? 101 : 92, len = y === 'F' ? 180 : 190;
      this.facts.hidden = false;
      this.facts.replaceChildren(
        h('div', null, h('span', { class: 'muted small' }, L({ en: `${x}–H bond`, de: `${x}–H-Bindung` })), h('strong', null, `${cov} pm`)),
        h('div', null, h('span', { class: 'muted small' }, L({ en: 'hydrogen bond H···' + y, de: 'Wasserstoffbrücke H···' + y })), h('strong', null, `≈ ${len} pm`)),
        h('div', null, h('span', { class: 'muted small' }, L({ en: this.cluster ? 'hydrogen bonds per molecule' : 'X–H···Y angle', de: this.cluster ? 'Brücken pro Molekül' : 'Winkel X–H···Y' })), h('strong', null, this.cluster ? '4' : '≈ 180°')));
    } else { this.facts.hidden = true; this.facts.replaceChildren(); }

    const label = this.cluster ? 'water with four hydrogen-bonded neighbours'
      : B ? `${A.name.en} and ${B.name.en}: ${p?.shown ? 'hydrogen bond' : 'no hydrogen bond'}` : `${A.name.en}: ${countsText(A)}`;
    this.stage.setLabel(label);
  }

  private legend(): HTMLElement {
    const item = (cls: string, text: Bi) => h('span', { class: 'hb-key' }, h('i', { class: cls, 'aria-hidden': 'true' }), L(text));
    return h('div', { class: 'hb-legend' },
      item('donor', { en: 'blue halo: donor H (δ+)', de: 'blauer Ring: Donor-H (δ+)' }),
      item('lp', { en: 'purple lobe: lone pair (acceptor)', de: 'lila Keule: freies Elektronenpaar (Akzeptor)' }),
      item('dash', { en: 'dashes: hydrogen bond', de: 'Striche: Wasserstoffbrücke' }));
  }

  dispose() { this.listeners.clear(); this.stage.dispose(); }
}
