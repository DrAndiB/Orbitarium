// The Molecule Workbench as a screen component: 3D view, readouts and controls.
import { Workbench, PRESETS, buildSpec, buildProblem, type MoleculeSpec, type Ligand } from './workbench';
import { h, chem, rich, termChip, clear } from '../ui/dom';
import { L, num, getLang, type Bi } from '../i18n';
import { buzz } from '../platform';
import { touchElements } from '../model/learner';

export interface WorkbenchUIOptions {
  presets?: string[];
  start?: string;
  controls?: { lonePairs?: boolean; dipole?: boolean; wrongModel?: boolean; lambda?: boolean; builder?: boolean; leavesOut?: boolean };
  compact?: boolean;
}

const SHAPE_TERM: Record<string, string> = {
  '1,0': 'linear', '2,0': 'linear', '3,0': 'trigonal-planar', '4,0': 'tetrahedral',
  '2,1': 'bent', '3,1': 'trigonal-pyramidal', '2,2': 'bent', '1,1': 'linear', '1,2': 'linear', '1,3': 'linear',
};

export function shapeTerm(bonds: number, lone: number): string { return SHAPE_TERM[`${bonds},${lone}`] ?? 'tetrahedral'; }

export class WorkbenchUI {
  readonly el: HTMLElement;
  readonly wb: Workbench;
  private readout: HTMLElement;
  private shapeEl: HTMLElement;
  private listeners = new Map<string, Set<(...a: any[]) => void>>();
  private lambdaLabel?: HTMLElement;
  private presetRow?: HTMLElement;
  lastBuilt?: MoleculeSpec;

  constructor(opts: WorkbenchUIOptions = {}) {
    const c = { lonePairs: true, dipole: true, wrongModel: true, lambda: true, builder: false, leavesOut: true, ...opts.controls };
    const stage = h('div', { class: 'wb-stage' + (opts.compact ? ' compact' : '') });
    this.shapeEl = h('div', { class: 'wb-shape' });
    this.readout = h('div', { class: 'wb-readout', 'aria-live': 'polite' });
    stage.append(h('div', { class: 'wb-hud' }, this.shapeEl, this.readout));
    this.el = h('div', { class: 'workbench' }, stage);
    this.wb = new Workbench(stage, !!opts.compact);

    const presets = opts.presets ?? ['CH4', 'NH3', 'H2O'];
    if (presets.length > 1) {
      this.presetRow = h('div', { class: 'chip-row', role: 'group', 'aria-label': getLang() === 'de' ? 'Moleküle' : 'Molecules' },
        presets.map((id) => h('button', { class: 'chip', type: 'button', 'data-id': id, onclick: () => this.load(id) }, chem(PRESETS[id].formula))));
      this.el.appendChild(this.presetRow);
    }

    const toggles = h('div', { class: 'wb-toggles' });
    if (c.lonePairs) toggles.appendChild(this.toggle({ en: 'Show lone pairs', de: 'Freie Paare zeigen' }, true, (v) => this.wb.setShowLonePairs(v), 'lonepairs'));
    if (c.dipole) toggles.appendChild(this.toggle({ en: 'Show polarity', de: 'Polarität zeigen' }, false, (v) => this.wb.setShowDipole(v), 'dipole'));
    if (c.wrongModel) toggles.appendChild(this.toggle({ en: 'Wrong model: lone pairs take no space', de: 'Falsches Modell: freie Paare brauchen keinen Platz' }, false, (v) => this.wb.setIgnoreLonePairs(v), 'ignore', true));
    if (toggles.childElementCount) this.el.appendChild(toggles);

    if (c.lambda) {
      this.lambdaLabel = h('span', { class: 'wb-lambda-val' });
      const input = h('input', { type: 'range', min: '1', max: '2', step: '0.05', value: String(this.wb.lambda), 'aria-label': getLang() === 'de' ? 'Schub der freien Paare' : 'Lone-pair push' }) as HTMLInputElement;
      input.addEventListener('input', () => { this.wb.setLambda(+input.value); this.updateLambda(); this.emit('lambda', +input.value); });
      this.el.appendChild(h('div', { class: 'wb-equation' },
        h('label', { class: 'wb-eq-head' }, h('span', null, L({ en: 'Lone-pair push', de: 'Schub der freien Paare' })), this.lambdaLabel),
        input,
        h('p', { class: 'wb-eq' }, 'E = Σ w', h('sub', null, 'ij'), ' / r', h('sup', null, '2'), h('sub', null, 'ij'), '   ·   w = λ² (', L({ en: 'lone–lone', de: 'frei–frei' }), '), λ (', L({ en: 'lone–bond', de: 'frei–Bindung' }), '), 1 (', L({ en: 'bond–bond', de: 'Bindung–Bindung' }), ')'),
      ));
      this.updateLambda();
    }

    if (c.builder) this.el.appendChild(this.builder());

    if (c.leavesOut) this.el.appendChild(h('details', { class: 'wb-leaves-out' },
      h('summary', null, L({ en: 'What this model leaves out', de: 'Was dieses Modell weglässt' })),
      h('p', null, rich({
        en: 'Electron pairs are treated as points on a sphere that push each other with an energy of w / r²; the exponent is a modelling choice, and λ ≈ 1.25 is fitted so that ammonia and water come out right. Real atoms also differ in size. Around a bigger central atom such as P or S, the bonding pairs sit further out and push each other less, so the lone pairs squeeze them more: {{PCl3}} measures 100° and {{H2S}} 92°, smaller than the model predicts. Double bonds push a little harder here (× 1.12) to stand in for their larger electron cloud.',
        de: 'Elektronenpaare werden als Punkte auf einer Kugel behandelt, die sich mit der Energie w / r² abstoßen; der Exponent ist eine Modellwahl, und λ ≈ 1,25 ist so angepasst, dass Ammoniak und Wasser stimmen. Echte Atome sind außerdem verschieden groß. Um ein größeres Zentralatom wie P oder S sitzen die Bindungspaare weiter außen und drücken einander weniger, also stauchen die freien Paare sie stärker: {{PCl3}} misst 100° und {{H2S}} 92°, weniger als das Modell vorhersagt. Doppelbindungen drücken hier etwas stärker (× 1,12), stellvertretend für ihre größere Elektronenwolke.',
      })),
    ));

    this.wb.on('moving', () => this.updateReadout(false));
    this.wb.on('settled', () => { this.updateReadout(true); buzz('light'); this.emit('settled', this.wb.angles()); });
    this.wb.on('loaded', (s: MoleculeSpec) => { this.updateShape(); this.markPreset(s.id); touchElements([s.center, ...s.ligands.map((l) => l.el)]); this.emit('loaded', s); });
    this.wb.on('toggle', (what: string, v: boolean) => { this.updateShape(); this.emit('toggle', what, v); });
    this.load(opts.start ?? presets[0]);
  }

  on(evt: string, f: (...a: any[]) => void) { if (!this.listeners.has(evt)) this.listeners.set(evt, new Set()); this.listeners.get(evt)!.add(f); }
  private emit(evt: string, ...a: unknown[]) { this.listeners.get(evt)?.forEach((f) => f(...a)); }

  load(id: string | MoleculeSpec) { this.wb.load(id); this.updateShape(); }

  private markPreset(id: string) {
    this.presetRow?.querySelectorAll('.chip').forEach((b) => b.setAttribute('aria-pressed', String((b as HTMLElement).dataset.id === id)));
  }

  private toggle(label: Bi, initial: boolean, onChange: (v: boolean) => void, key: string, warn = false): HTMLElement {
    const input = h('input', { type: 'checkbox', checked: initial, 'data-key': key }) as HTMLInputElement;
    input.addEventListener('change', () => onChange(input.checked));
    return h('label', { class: 'switch' + (warn ? ' warn' : '') }, input, h('span', { class: 'switch-track', 'aria-hidden': 'true' }), h('span', null, L(label)));
  }

  private updateLambda() { if (this.lambdaLabel) this.lambdaLabel.textContent = `λ = ${num(this.wb.lambda, 2)}`; }

  private updateShape() {
    const s = this.wb.current;
    clear(this.shapeEl);
    const lp = this.wb.ignoreLonePairs ? 0 : s.lonePairs;
    const term = termChip(shapeTerm(s.ligands.length, lp));
    this.shapeEl.append(h('span', { class: 'wb-formula' }, chem(s.formula)), ' ', term);
    this.el.querySelector('canvas')?.setAttribute('aria-label', `${s.formula}, ${term.querySelector('.term-main')?.textContent ?? ''}. ` + L({ en: 'Drag to rotate.', de: 'Zum Drehen ziehen.' }));
    if (this.wb.ignoreLonePairs && s.lonePairs) this.shapeEl.append(h('span', { class: 'wb-flag' }, L({ en: 'model ignores lone pairs', de: 'Modell ignoriert freie Paare' })));
  }

  private updateReadout(settled: boolean) {
    clear(this.readout);
    const angles = this.wb.angles();
    for (const a of angles) this.readout.appendChild(h('div', { class: 'wb-angle' }, h('span', null, a.label), h('strong', null, `${num(a.deg)}°`)));
    const s = this.wb.current;
    if (settled && s.measured && angles.length === 1) {
      const diff = Math.abs(angles[0].deg - s.measured);
      this.readout.appendChild(h('div', { class: 'wb-measured' + (diff > 4 ? ' off' : '') }, L({ en: 'measured', de: 'gemessen' }), ' ', h('strong', null, `${num(s.measured, Number.isInteger(s.measured) ? 0 : 1)}°`)));
    }
    if (settled && this.wb.showDipole) {
      this.readout.appendChild(h('div', { class: 'wb-polar' }, this.wb.isPolar()
        ? L({ en: 'polar molecule', de: 'polares Molekül' })
        : this.wb.hasPolarBonds() ? L({ en: 'nonpolar: pulls cancel', de: 'unpolar: Züge heben sich auf' }) : L({ en: 'nonpolar: bonds barely polar', de: 'unpolar: Bindungen kaum polar' })));
      this.readout.appendChild(h('div', { class: 'wb-legend' }, h('i', { class: 'neg' }), 'δ−  ', h('i', { class: 'pos' }), 'δ+  ', h('span', { class: 'muted' }, L({ en: 'arrow points to δ−', de: 'Pfeil zeigt zu δ−' }))));
    }
  }

  // ---------- builder ----------
  private builder(): HTMLElement {
    const centers = ['C', 'N', 'O', 'B', 'P', 'S'];
    const partnerKinds: (Ligand | null)[] = [null, { el: 'H', order: 1 }, { el: 'F', order: 1 }, { el: 'Cl', order: 1 }, { el: 'O', order: 2 }];
    let center = 'C';
    const slots: (Ligand | null)[] = [{ el: 'H', order: 1 }, { el: 'H', order: 1 }, { el: 'H', order: 1 }, { el: 'H', order: 1 }];
    const status = h('p', { class: 'wb-build-status', 'aria-live': 'polite' });
    const centerRow = h('div', { class: 'chip-row' });
    const slotRow = h('div', { class: 'wb-slots' });
    const ligText = (l: Ligand | null) => (l ? (l.order === 2 ? '=' + l.el : l.el) : '–');
    const render = () => {
      clear(centerRow); clear(slotRow);
      for (const c of centers) centerRow.appendChild(h('button', { class: 'chip', type: 'button', 'aria-pressed': String(c === center), onclick: () => { center = c; render(); } }, c));
      slots.forEach((l, i) => slotRow.appendChild(h('button', {
        class: 'slot', type: 'button', 'aria-label': (getLang() === 'de' ? 'Partner ' : 'Partner ') + (i + 1) + ': ' + ligText(l),
        onclick: () => { const k = partnerKinds.findIndex((p) => (p?.el ?? null) === (l?.el ?? null) && (p?.order ?? 0) === (l?.order ?? 0)); slots[i] = partnerKinds[(k + 1) % partnerKinds.length]; render(); },
      }, ligText(l))));
      const ligs = slots.filter(Boolean) as Ligand[];
      const sp = buildSpec(center, ligs);
      clear(status);
      if (!ligs.length) status.append(L({ en: 'Add at least one partner.', de: 'Füge mindestens einen Partner hinzu.' }));
      else if (!sp) {
        const why = buildProblem(center, ligs);
        status.append(why === 'directions'
          ? L({ en: `That needs more than four directions around ${center}. Such molecules exist (SF₄, PCl₅), but this workbench stops at four.`, de: `Das bräuchte mehr als vier Richtungen um ${center}. Solche Moleküle gibt es (SF₄, PCl₅), aber diese Werkbank hört bei vier auf.` })
          : why === 'short'
            ? L({ en: `${center} does not have enough outer electrons for all these bonds. Try fewer or single-bonded partners.`, de: `${center} hat nicht genug Außenelektronen für all diese Bindungen. Probiere weniger oder einfach gebundene Partner.` })
            : L({ en: `With these partners one of ${center}'s outer electrons would be left unpaired. Add or remove one partner.`, de: `Mit diesen Partnern bliebe ein Außenelektron von ${center} ungepaart. Füge einen Partner hinzu oder nimm einen weg.` }));
      }
      else {
        status.append(chem(sp.formula), ' · ', L({ en: `${sp.lonePairs} lone pair${sp.lonePairs === 1 ? '' : 's'} on ${center}`, de: `${sp.lonePairs} freie${sp.lonePairs === 1 ? 's Paar' : ' Paare'} an ${center}` }));
        this.lastBuilt = sp;
        this.load(sp);
        this.emit('built', sp);
      }
    };
    render();
    return h('div', { class: 'wb-builder' },
      h('h4', null, L({ en: 'Build your own', de: 'Selbst bauen' })),
      h('p', { class: 'muted small' }, L({ en: 'Pick a central atom, then tap each partner slot to cycle through H, F, Cl and a double-bonded O. The central atom\'s outer electrons that are not used in bonds pair up as lone pairs.', de: 'Wähle ein Zentralatom und tippe dann auf die Partnerfelder, um H, F, Cl und ein doppelt gebundenes O durchzugehen. Die Außenelektronen des Zentralatoms, die nicht in Bindungen stecken, bilden freie Paare.' })),
      h('div', { class: 'wb-build-label' }, L({ en: 'Central atom', de: 'Zentralatom' })), centerRow,
      h('div', { class: 'wb-build-label' }, L({ en: 'Partners', de: 'Bindungspartner' })), slotRow,
      status);
  }

  dispose() { this.wb.dispose(); }
}
