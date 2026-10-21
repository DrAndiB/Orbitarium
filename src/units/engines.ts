// Engine wiring for units 1–5: which engine each unit uses, and which engine events tick which explore task.
import type { UnitEngine, Engine } from './generic';
import type { Show } from '../content/unitTypes';
import type { AtomUI } from '../sim/orbitalsUI';
import type { LatticeUI } from '../sim/latticeUI';
import type { BondUI } from '../sim/bondUI';

const atomEngine = (ui: AtomUI): Engine => ({ el: ui.el, show: (s: Show) => { if (s.engine === 'atom') ui.show(s); } });
const latticeEngine = (ui: LatticeUI): Engine => ({ el: ui.el, show: (s: Show) => { if (s.engine === 'lattice') ui.show(s); } });
const bondEngine = (ui: BondUI): Engine => ({ el: ui.el, show: (s: Show) => { if (s.engine === 'bond') ui.show(s); } });
const atomShows = (shows: Show[]) => shows.filter((s): s is Extract<Show, { engine: 'atom' }> => s.engine === 'atom');

// ---------- unit 1: shells and orbitals ----------
export const ENGINE_U1: UnitEngine = {
  explore(ctx, mark) {
    const ui = ctx.atom({ start: 1, maxZ: 36, controls: { view: true, stepper: true, boxes: true, spectrum: true } });
    const jumps = new Set<string>();
    const stepped = new Set<number>();
    ui.on('jump', (a: number, b: number) => {
      jumps.add(`${a}-${b}`);
      if (jumps.has('3-2') && jumps.has('4-2')) mark('jump');
      if (a === 2 && b === 1) mark('uv');
    });
    ui.on('element', (Z: number, newest: string | null) => {
      // "fill": every element from beryllium to neon reached with the Next button, one electron at a time
      if (newest) stepped.add(Z);
      if ([4, 5, 6, 7, 8, 9, 10].every((z) => stepped.has(z))) mark('fill');
      if (Z === 19) mark('k');
      if (Z === 24 || Z === 29) mark('cr');
    });
    ui.on('highlight', (id: string | null) => { if (id && id.endsWith('p')) mark('cloud'); });
    return atomEngine(ui);
  },
  compact(ctx, shows) {
    const a = atomShows(shows);
    const ui = ctx.atom({ start: a[0]?.z ?? 1, maxZ: 36, compact: true, controls: { view: true, stepper: false, boxes: true, spectrum: a.some((s) => s.jump) } });
    return atomEngine(ui);
  },
};

// ---------- unit 2: Z_eff and size ----------
export const U2_IONS = ['11+1', '19+1', '12+2', '13+3', '9-1', '8-2', '17-1'];
export const ENGINE_U2: UnitEngine = {
  explore(ctx, mark) {
    const ui = ctx.atom({ start: 11, maxZ: 36, view: 'shells', ions: U2_IONS, controls: { view: false, stepper: true, boxes: false, shielding: true, size: true } });
    const seen = new Set<number>();
    const ions = new Set<string>();
    ui.on('element', (Z: number) => {
      seen.add(Z);
      if (seen.has(11) && seen.has(17)) mark('row');
      if (seen.has(3) && seen.has(11) && seen.has(19)) mark('group');
    });
    ui.on('shielding', (f: number) => { if (f <= 0.2 && ui.stage.Z > 2) mark('shield'); });
    ui.on('ion', (Z: number, q: number) => {
      ions.add(`${Z}${q > 0 ? '+' : '-'}${Math.abs(q)}`);
      if (ions.has('11+1') && ions.has('17-1')) mark('ions');
      if (['8-2', '9-1', '11+1', '12+2'].every((k) => ions.has(k))) mark('iso');
    });
    return atomEngine(ui);
  },
  compact(ctx, shows) {
    const a = atomShows(shows);
    const ui = ctx.atom({ start: a[0]?.z ?? 11, maxZ: 36, compact: true, view: 'shells', controls: { view: false, stepper: false, boxes: false, size: true } });
    return atomEngine(ui);
  },
};

// ---------- unit 3: ionization and ion charges ----------
export const ENGINE_U3: UnitEngine = {
  explore(ctx, mark) {
    const ui = ctx.atom({ start: 11, maxZ: 20, view: 'shells', controls: { view: true, stepper: true, boxes: true, ionize: true } });
    const firstPulled = new Set<number>();
    ui.on('pulled', (n: number) => {
      const Z = ui.stage.Z;
      if (n >= 1) firstPulled.add(Z);
      if (Z === 11 && n >= 2) mark('na');
      if (Z === 12 && n >= 3) mark('mg');
      if (Z === 13 && n >= 4) mark('al');
      if (firstPulled.has(11) && firstPulled.has(18)) mark('row');
      if (Z === 20 && n >= 2) mark('ca');
    });
    return atomEngine(ui);
  },
  compact(ctx, shows) {
    const a = atomShows(shows);
    const ui = ctx.atom({ start: a[0]?.z ?? 11, maxZ: 20, compact: true, view: 'shells', controls: { view: false, stepper: false, boxes: true, ionize: a.some((s) => s.pull) } });
    return atomEngine(ui);
  },
};

// ---------- unit 4: ionic bonding ----------
export const ENGINE_U4: UnitEngine = {
  explore(ctx, mark) {
    // No "shift a layer" here: what a hammer blow does is predicted first, then shown (step 4).
    const ui = ctx.lattice({ start: 'NaCl', controls: { shift: false } });
    const loaded = new Set<string>(['NaCl']);
    ui.on('salt', (id: string) => {
      loaded.add(id);
      if (loaded.has('NaCl') && loaded.has('MgO')) mark('compare');
      if (loaded.has('NaF') && loaded.has('NaI')) mark('size');
      if (loaded.size >= 8) mark('all');
    });
    ui.on('transfer-start', () => mark('transfer'));
    ui.on('neighbours', () => mark('neighbours'));
    ui.on('heat', (_t: number, molten: boolean) => { if (molten && ui.stage.salt.id === 'NaCl') mark('heat'); });
    ui.on('shift-start', () => mark('shift'));
    return latticeEngine(ui);
  },
  compact(ctx, shows) {
    const first = shows.find((s) => s.engine === 'lattice') as Extract<Show, { engine: 'lattice' }> | undefined;
    const ui = ctx.lattice({ start: first?.salt ?? 'NaCl', compact: true });
    return latticeEngine(ui);
  },
};

// ---------- unit 5: covalent bonds and electronegativity ----------
export const ENGINE_U5: UnitEngine = {
  explore(ctx, mark) {
    const ui = ctx.bond({ start: { a: 'C', b: 'C', order: 1 } });
    const bands = new Set<string>();
    const pairs = new Set<string>();
    const key = (a: string, b: string, o: number) => [a, b].sort().join('') + o;
    ui.on('bond', (a: string, b: string, order: number, _d: number, band: string) => {
      pairs.add(key(a, b, order));
      bands.add(band);
      if (pairs.has(key('H', 'H', 1)) || pairs.has(key('Cl', 'Cl', 1))) mark('equal');
      if (pairs.has(key('H', 'Cl', 1))) mark('hcl');
      if (bands.has('nonpolar') && bands.has('polar') && bands.has('ionic')) mark('bands');
      if (pairs.has(key('C', 'H', 1)) && pairs.has(key('H', 'O', 1))) mark('oil');
      if (pairs.has(key('N', 'N', 3)) && pairs.has(key('F', 'F', 1))) mark('triple');
    });
    ui.on('dial', (_v: number, _d: number, band: string) => {
      const s = ui.stage;
      if (band === 'ionic' && key(s.a, s.b, s.order) === key('H', 'Cl', 1)) mark('dial');
    });
    return bondEngine(ui);
  },
  compact(ctx, shows) {
    const first = shows.find((s) => s.engine === 'bond') as Extract<Show, { engine: 'bond' }> | undefined;
    const ui = ctx.bond({ start: first ? { a: first.a, b: first.b, order: first.order ?? 1 } : undefined, compact: true, controls: { presets: false, picker: false, dial: false, scale: true } });
    return bondEngine(ui);
  },
};
