// Engine wiring for units 1–5 and 7–11: which engine each unit uses, and which engine events tick which explore task.
import type { UnitEngine, Engine } from './generic';
import type { Show } from '../content/unitTypes';
import type { AtomUI } from '../sim/orbitalsUI';
import type { LatticeUI } from '../sim/latticeUI';
import type { BondUI } from '../sim/bondUI';
import type { ParticleBoxUI } from '../sim/particleBoxUI';
import type { ConductUI } from '../sim/conductUI';
import type { HBondUI } from '../sim/hbondUI';

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

// ---------- units 7–11: shared helpers ----------

const boxEngine = (ui: ParticleBoxUI): Engine => ({ el: ui.el, show: (s: Show) => { if (s.engine === 'box') ui.show(s); } });
const conductEngine = (ui: ConductUI): Engine => ({ el: ui.el, show: (s: Show) => { if (s.engine === 'conduct') ui.show(s); } });
const hbondEngine = (ui: HBondUI): Engine => ({ el: ui.el, show: (s: Show) => { if (s.engine === 'hbond') ui.show(s); } });
const firstShow = <E extends Show['engine']>(shows: Show[], e: E) => shows.find((s) => s.engine === e) as Extract<Show, { engine: E }> | undefined;

/** Tracks what a Particle Box currently shows: the substance in each box, the temperature and the views that are on. */
function boxTracker(ui: ParticleBoxUI, start: string, temp = 20) {
  const st = { box: { 1: start, 2: null as string | null } as Record<1 | 2, string | null>, temp, views: new Set<string>(), loaded: new Set<string>([start]), mix: null as string | null };
  ui.on('substance', (id: string, box: 1 | 2) => { st.box[box] = id; if (id) st.loaded.add(id); });
  ui.on('temp', (t: number) => { st.temp = t; });
  ui.on('view', (v: string, on: boolean) => { if (on) st.views.add(v); else st.views.delete(v); });
  ui.on('mix', (m: string | null) => { st.mix = m; });
  const shown = () => [st.box[1], st.box[2]].filter((x): x is string => !!x);
  const pair = (a: string, b: string) => { const s = shown(); return s.includes(a) && s.includes(b); };
  return { st, shown, pair };
}

// ---------- unit 7: who carries the charge ----------
export const ENGINE_U7: UnitEngine = {
  explore(ctx, mark) {
    const ui = ctx.conduct({ start: 'Cu' });
    let powered = false;
    let material = 'Cu';
    const TASK: Record<string, string> = { Cu: 'metal', NaCl: 'solid', 'NaCl-melt': 'melt', 'NaCl-aq': 'solution', 'sugar-aq': 'sugar' };
    let meltSeen = false;
    // 'solution' asks for a comparison with the melt, so it ticks only once the melt has been connected too.
    const check = () => {
      if (!powered || !TASK[material]) return;
      if (material === 'NaCl-melt') meltSeen = true;
      if (material === 'NaCl-aq' && !meltSeen) return;
      mark(TASK[material]);
    };
    ui.on('material', (id: string) => { material = id; check(); });
    ui.on('power', (on: boolean, id: string) => { powered = on; material = id; check(); });
    ui.on('reverse', (_r: boolean, id: string) => { if (powered && (id === 'NaCl-melt' || id === 'NaCl-aq')) mark('reverse'); });
    return conductEngine(ui);
  },
  compact(ctx, shows) {
    const first = firstShow(shows, 'conduct');
    return conductEngine(ctx.conduct({ start: first?.material ?? 'Cu', compact: true }));
  },
};

// ---------- unit 8: dispersion ----------
export const U8_SUBS = ['He', 'Ne', 'Ar', 'Kr', 'Xe', 'F2', 'Cl2', 'Br2', 'I2', 'CH4', 'C2H6', 'C3H8', 'C4H10', 'C5H12', 'neoC5H12', 'C6H14', 'C8H18'];
const NOBLE = ['He', 'Ne', 'Ar', 'Kr', 'Xe'];
export const ENGINE_U8: UnitEngine = {
  explore(ctx, mark) {
    const ui = ctx.box({ start: 'Ar', subs: U8_SUBS, temp: 20, controls: { compare: true, views: ['clouds'], temp: true } });
    const t = boxTracker(ui, 'Ar');
    const roomAlkanes = new Set<string>();
    const check = () => {
      const s = t.shown();
      if (t.st.views.has('clouds')) mark('clouds');
      if (s.length === 2 && s[0] !== s[1] && s.every((x) => NOBLE.includes(x))) mark('noble');
      if (t.pair('C5H12', 'neoC5H12') && t.st.temp >= 10 && t.st.temp <= 30) mark('shape');
      if (['F2', 'Cl2', 'Br2', 'I2'].every((x) => t.st.loaded.has(x))) mark('halogens');
      if (t.st.temp >= 15 && t.st.temp <= 30) for (const x of s) if (x === 'C4H10' || x === 'C5H12') roomAlkanes.add(x);
      if (roomAlkanes.has('C4H10') && roomAlkanes.has('C5H12')) mark('alkanes');
    };
    for (const e of ['substance', 'temp', 'view']) ui.on(e, () => queueMicrotask(check));
    ui.on('boil', () => mark('boil'));
    return boxEngine(ui);
  },
  compact(ctx, shows) {
    const first = firstShow(shows, 'box');
    return boxEngine(ctx.box({ start: first?.sub ?? 'Ar', temp: first?.temp ?? 20, compact: true }));
  },
};

// ---------- unit 9: dipole–dipole ----------
export const U9_SUBS = ['C3H8', 'CH3CHO', 'C4H10', 'CH3COCH3', 'CH3OCH3', 'CO2', 'HCl', 'HBr', 'HI', 'F2', 'Ar'];
export const ENGINE_U9: UnitEngine = {
  explore(ctx, mark) {
    const ui = ctx.box({ start: 'CH3COCH3', subs: U9_SUBS, temp: 20, controls: { compare: true, views: ['dipoles', 'clouds'], whatIf: true, temp: true } });
    const t = boxTracker(ui, 'CH3COCH3');
    const check = () => {
      const s = t.shown();
      const dip = t.st.views.has('dipoles');
      if (dip && s.includes('CH3COCH3')) mark('dipoles');
      if (t.pair('C4H10', 'CH3COCH3') && t.st.temp >= 10 && t.st.temp <= 30) mark('pair');
      if (dip && s.includes('CO2')) mark('co2');
      if (t.pair('HCl', 'HI')) mark('hx');
      if (dip && s.includes('CH3COCH3') && t.st.temp > 50) mark('scramble');
    };
    for (const e of ['substance', 'temp', 'view']) ui.on(e, () => queueMicrotask(check));
    ui.on('dipoleOff', (id: string, off: boolean) => { if (off && id === 'CH3COCH3') mark('whatif'); });
    return boxEngine(ui);
  },
  compact(ctx, shows) {
    const first = firstShow(shows, 'box');
    return boxEngine(ctx.box({ start: first?.sub ?? 'CH3COCH3', temp: first?.temp ?? 20, compact: true }));
  },
};

// ---------- unit 10: hydrogen-bond donors and acceptors ----------
export const ENGINE_U10: UnitEngine = {
  explore(ctx, mark) {
    const ui = ctx.hbond({ start: 'NH3', controls: { partner: true, swap: true, cluster: true } });
    const is = (a: string, b: string | null, x: string, y: string) => (a === x && b === y) || (a === y && b === x);
    ui.on('molecule', (id: string) => { if (id === 'H2O') mark('water'); });
    ui.on('partner', (a: string, b: string | null, bonded: boolean) => {
      if (a === 'H2O' && !b) mark('water');
      if (a === 'H2O' && b === 'H2O' && bonded) mark('pair');
      if (is(a, b, 'CH4', 'H2O')) mark('methane');
      if (is(a, b, 'CH3OCH3', 'H2O') && bonded) mark('ether');
      if (a === 'CH3OCH3' && b === 'CH3OCH3') mark('ether-self');
    });
    ui.on('cluster', () => mark('cluster'));
    return hbondEngine(ui);
  },
  compact(ctx, shows) {
    const first = firstShow(shows, 'hbond');
    return hbondEngine(ctx.hbond({ start: first?.a ?? 'H2O', compact: true }));
  },
};

// ---------- unit 11: water's network and solubility ----------
export const U11_MIXES = ['C6H14', 'C2H5OH', 'C4H9OH', 'NaCl', 'ice'];
export const ENGINE_U11: UnitEngine = {
  explore(ctx, mark) {
    const ui = ctx.box({ start: 'H2O', subs: ['H2O'], temp: 20, mixes: U11_MIXES, controls: { compare: false, views: ['hbonds'], temp: true } });
    ui.on('view', (v: string, on: boolean) => { if (on && v === 'hbonds') mark('network'); });
    ui.on('freeze', (id: string) => { if (id === 'H2O') mark('ice'); });
    ui.on('state', (id: string, state: string) => { if (id === 'H2O' && state === 'solid') mark('ice'); });
    ui.on('mix', (m: string | null) => { if (m === 'C6H14') mark('oil'); if (m === 'C2H5OH') mark('ethanol'); if (m === 'C4H9OH') mark('butanol'); });
    ui.on('dissolved', (f: number) => { if (f >= 0.5) mark('salt'); });
    return boxEngine(ui);
  },
  compact(ctx, shows) {
    const first = firstShow(shows, 'box');
    return boxEngine(ctx.box({ start: first?.sub ?? 'H2O', temp: first?.temp ?? 20, compact: true, mixes: U11_MIXES }));
  },
};
