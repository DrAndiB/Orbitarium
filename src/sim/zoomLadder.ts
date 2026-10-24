// The Zoom Ladder engine (units 12–15, later 31): one sample read at four scales. The four rungs sit one above the
// other (grams on a balance, moles as 1 mol portions, the count as a cube of dots, the particles themselves) and the
// camera moves down and up the ladder. Formulas and molar masses come from stoich.ts, atom sizes from elements.ts.
import * as THREE from 'three';
import { Stage3D } from './stage';
import { parseFormula, massShares, LADDER_SAMPLES, SOLUTES, type ParticleKind } from '../content/stoich';
import { bySymbol } from '../content/elements';
import { CHARGE } from './workbench';
import { chemText } from '../ui/dom';
import { L, num, numTrim, getLang, type Bi } from '../i18n';
import type { Rung } from '../content/unitTypes';

export const RUNGS: Rung[] = ['grams', 'moles', 'count', 'particles'];
const GAP = 70;              // vertical distance between rungs (scene units): far enough that no other rung shows
const PM = 0.01;             // scene units per pm
type V3 = THREE.Vector3;
const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);

// ---------- formatting (shared with the screen component) ----------

const SUPS: Record<string, string> = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '-': '⁻' };
export const sup = (n: number) => String(n).split('').map((c) => SUPS[c] ?? c).join('');
/** The multiplication sign of scientific notation: "×" in English, "·" in German. */
export const times = () => (getLang() === 'de' ? '·' : '×');
/** Scientific notation: EN "6.02 × 10²³", DE "6,02 · 10²³"; plain digits between 0.01 and 9999. */
export function sci(x: number, digits = 2): string {
  if (!isFinite(x) || x === 0) return '0';
  let e = Math.floor(Math.log10(Math.abs(x)));
  let m = x / Math.pow(10, e);
  if (Math.abs(Number(m.toFixed(digits))) >= 10) { m /= 10; e += 1; }
  if (e >= -2 && e <= 3) return numTrim(x, Math.max(0, digits - e));
  return `${num(m, digits)} ${times()} 10${sup(e)}`;
}
export const gram = (g: number) => (g > 0 && g < 0.01 ? `${sci(g)} g` : `${num(g, g < 100 ? 2 : 1)} g`);
export const mols = (n: number) => (n > 0 && n < 0.001 ? `${sci(n)} mol` : `${num(n, n < 10 ? 3 : n < 100 ? 2 : 1)} mol`);
export const molar = (M: number) => `${numTrim(M, 3)} g/mol`;
/** A formula as plain text with Unicode subscripts; a hydrate keeps its leading count: CuSO₄·5H₂O. */
export function formulaText(f: string): string {
  const [first, ...rest] = f.split('·');
  return [chemText(first), ...rest.map((p) => { const m = /^(\d+)(.*)$/.exec(p); return m ? m[1] + chemText(m[2]) : chemText(p); })].join('·');
}

export const KIND_WORD: Record<ParticleKind, { one: Bi; many: Bi }> = {
  atom: { one: { en: 'atom', de: 'Atom' }, many: { en: 'atoms', de: 'Atome' } },
  molecule: { one: { en: 'molecule', de: 'Molekül' }, many: { en: 'molecules', de: 'Moleküle' } },
  'formula-unit': { one: { en: 'formula unit', de: 'Formeleinheit' }, many: { en: 'formula units', de: 'Formeleinheiten' } },
};

// ---------- what a particle is ----------

/**
 * Ionic compounds: the ions of one formula unit, [ion formula, charge, count]. These are the ion charges of school
 * chemistry (group 1 → 1+, group 2 → 2+, oxide 2−, …); iron's follow from the formula (FeO 2+, Fe₂O₃ 3+, Fe₃O₄ both).
 */
const IONIC: Record<string, { ions: [string, number, number][]; water?: number }> = {
  NaCl: { ions: [['Na', 1, 1], ['Cl', -1, 1]] },
  MgO: { ions: [['Mg', 2, 1], ['O', -2, 1]] },
  CaO: { ions: [['Ca', 2, 1], ['O', -2, 1]] },
  FeO: { ions: [['Fe', 2, 1], ['O', -2, 1]] },
  CaCO3: { ions: [['Ca', 2, 1], ['CO3', -2, 1]] },
  'Ca(OH)2': { ions: [['Ca', 2, 1], ['OH', -1, 2]] },
  Fe2O3: { ions: [['Fe', 3, 2], ['O', -2, 3]] },
  Fe3O4: { ions: [['Fe', 2, 1], ['Fe', 3, 2], ['O', -2, 4]] },
  FeS2: { ions: [['Fe', 2, 1], ['S2', -2, 1]] },
  Al2O3: { ions: [['Al', 3, 2], ['O', -2, 3]] },
  ZnCl2: { ions: [['Zn', 2, 1], ['Cl', -1, 2]] },
  MgO2: { ions: [['Mg', 2, 1], ['O2', -2, 1]] },
  'CuSO4·5H2O': { ions: [['Cu', 2, 1], ['SO4', -2, 1]], water: 5 },
};
export const ionName = (f: string, q: number) => chemText(f + (Math.abs(q) > 1 ? Math.abs(q) : '') + (q > 0 ? '+' : '-'));

/** Ions of a formula unit as text, e.g. "Na⁺ Cl⁻ 1 : 1" or "Ca²⁺ OH⁻ 1 : 2"; null for anything that is not ionic. */
export function ionRatio(f: string): string | null {
  const sp = IONIC[f];
  if (!sp) return null;
  const cat = sp.ions.filter((i) => i[1] > 0), an = sp.ions.filter((i) => i[1] < 0);
  const sum = (xs: [string, number, number][]) => xs.reduce((s, x) => s + x[2], 0);
  return `${sp.ions.map(([x, q]) => ionName(x, q)).join(' ')} ${sum(cat)} : ${sum(an)}` + (sp.water ? ` + ${sp.water} H₂O` : '');
}

export function kindOf(f: string): ParticleKind {
  const s = LADDER_SAMPLES.find((x) => x.formula === f);
  if (s) return s.kind;
  if (IONIC[f]) return 'formula-unit';
  const p = Object.entries(parseFormula(f));
  return p.length === 1 && p[0][1] === 1 ? 'atom' : 'molecule';
}

/** State at room temperature, for the container on the balance (solid heap, liquid in a beaker, gas in a flask). */
const GAS = new Set(['H2', 'N2', 'O2', 'Cl2', 'CO2', 'CO', 'CH4', 'C2H4', 'C2H6', 'C3H8', 'NH3', 'HCl']);
const LIQUID = new Set(['H2O', 'C2H5OH', 'H2O2']);
export type Phase = 's' | 'l' | 'g';
export const phaseOf = (f: string): Phase => (GAS.has(f) ? 'g' : LIQUID.has(f) ? 'l' : 's');

/** Neutral atom colours (as in the Molecule Workbench); metals in muted greys and their own hue. */
const ATOM_COLOR: Record<string, number> = {
  H: 0xe9e3d3, C: 0x5d6479, N: 0x93a6c9, O: 0xd2bfa6, S: 0xd8c879, Cl: 0x9fc79a,
  Na: 0xb7b0c4, Mg: 0xbdb8ae, Al: 0xc4c9cf, Ca: 0xcfc9b8, Fe: 0x9a9088, Cu: 0xc98f62, Zn: 0xa9b0b8, Ag: 0xd9dadc, Au: 0xe0c060, Pb: 0x7f8290,
};
const atomColor = (el: string) => ATOM_COLOR[el] ?? 0xb8b2a6;
/** CSS colour of an atom (for the HTML legend). */
export const atomCss = (el: string) => '#' + atomColor(el).toString(16).padStart(6, '0');
/** The colour of a sample in bulk: the real tint where stoich.ts has one, pale grey for liquids, else its atoms mixed by mass. */
export function sampleColor(f: string): number {
  const sol = SOLUTES.find((s) => s.formula === f);
  if (sol?.tint) return parseInt(sol.tint.slice(1), 16);
  if (phaseOf(f) === 'l') return 0xb4c3cf;
  if (IONIC[f] && !/Fe|Cu/.test(f)) return 0xe4dfd3;
  const c = new THREE.Color(0, 0, 0);
  for (const { el, share } of massShares(f)) c.add(new THREE.Color(atomColor(el)).multiplyScalar(share));
  return c.getHex();
}

// ---------- molecule shapes (schematic: directions are the ideal ones, lengths from the atom radii) ----------

type Spec = [string, number, [number, number, number]][];
const O: [number, number, number] = [0, 0, 0];
const X: [number, number, number] = [1, 0, 0];
const SHAPES: Record<string, Spec> = {
  H2: [['H', -1, O], ['H', 0, X]],
  N2: [['N', -1, O], ['N', 0, X]],
  O2: [['O', -1, O], ['O', 0, X]],
  Cl2: [['Cl', -1, O], ['Cl', 0, X]],
  CO: [['C', -1, O], ['O', 0, X]],
  HCl: [['H', -1, O], ['Cl', 0, X]],
  H2O: [['O', -1, O], ['H', 0, [0.79, -0.61, 0]], ['H', 0, [-0.79, -0.61, 0]]],
  H2O2: [['O', -1, O], ['O', 0, X], ['H', 0, [-0.33, 0.94, 0]], ['H', 1, [0.33, 0, 0.94]]],
  CO2: [['C', -1, O], ['O', 0, X], ['O', 0, [-1, 0, 0]]],
  NH3: [['N', -1, O], ['H', 0, [0.94, -0.33, 0]], ['H', 0, [-0.47, -0.33, 0.82]], ['H', 0, [-0.47, -0.33, -0.82]]],
  CH4: [['C', -1, O], ['H', 0, [0, 1, 0]], ['H', 0, [0.94, -0.33, 0]], ['H', 0, [-0.47, -0.33, 0.82]], ['H', 0, [-0.47, -0.33, -0.82]]],
  C2H4: [['C', -1, O], ['C', 0, X], ['H', 0, [-0.5, 0.87, 0]], ['H', 0, [-0.5, -0.87, 0]], ['H', 1, [0.5, 0.87, 0]], ['H', 1, [0.5, -0.87, 0]]],
  C2H6: [['C', -1, O], ['C', 0, X], ['H', 0, [-0.33, 0.94, 0]], ['H', 0, [-0.33, -0.47, 0.82]], ['H', 0, [-0.33, -0.47, -0.82]],
    ['H', 1, [0.33, -0.94, 0]], ['H', 1, [0.33, 0.47, 0.82]], ['H', 1, [0.33, 0.47, -0.82]]],
};
/** True when the particle rung draws this molecule in its real shape (else a schematic cluster). */
export const hasTrueShape = (f: string) => !!SHAPES[f];
const radiusPm = (el: string) => bySymbol(el)?.r ?? 100;
const drawR = (el: string) => (radiusPm(el) + 30) * 0.5 * PM;
const bondLen = (a: string, b: string) => (radiusPm(a) + radiusPm(b) + 20) * PM;
const golden = (i: number, n: number) => {
  const y = n === 1 ? 0 : 1 - (2 * (i + 0.5)) / n, r = Math.sqrt(Math.max(0, 1 - y * y)), th = i * 2.39996;
  return V(r * Math.cos(th), y, r * Math.sin(th));
};

interface Shape { atoms: { el: string; p: V3 }[]; bonds: [number, number][]; cluster: boolean }
/** Small molecules get their true shape; bigger ones a compact cluster (heavy atoms inside, hydrogens outside). */
function shapeOf(f: string): Shape {
  const spec = SHAPES[f];
  const atoms: Shape['atoms'] = [], bonds: [number, number][] = [];
  if (spec) {
    spec.forEach(([el, parent, d], i) => {
      const p = parent < 0 ? V() : atoms[parent].p.clone().add(V(...d).normalize().multiplyScalar(bondLen(el, atoms[parent].el)));
      atoms.push({ el, p });
      if (parent >= 0) bonds.push([parent, i]);
    });
  } else {
    const heavy: string[] = [], hs: string[] = [];
    for (const [el, n] of Object.entries(parseFormula(f))) for (let k = 0; k < n; k++) (el === 'H' ? hs : heavy).push(el);
    const R = 0.62 * Math.cbrt(heavy.length);
    heavy.forEach((el, i) => atoms.push({ el, p: golden(i, heavy.length).multiplyScalar(heavy.length === 1 ? 0 : R * Math.cbrt((i + 0.5) / heavy.length) * 1.25) }));
    hs.forEach((el, i) => atoms.push({ el, p: golden(i, hs.length).multiplyScalar(R + 0.55) }));
  }
  const c = atoms.reduce((s, a) => s.add(a.p), V()).multiplyScalar(1 / Math.max(1, atoms.length));
  atoms.forEach((a) => a.p.sub(c));
  return { atoms, bonds, cluster: !spec };
}

/** A camera-facing text sprite with its own texture (disposed with its group). */
function makeTag(text: string, size: number, color = '#ece6d6', bg?: string, cache?: Map<string, THREE.CanvasTexture>): THREE.Sprite {
  const key = `${text}|${color}|${bg ?? ''}`;
  const hit = cache?.get(key);
  if (hit) {
    const img = hit.image as HTMLCanvasElement;
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: hit, depthTest: false, transparent: true }));
    sp.scale.set(size * (img.width / img.height), size, 1);
    sp.renderOrder = 12;
    return sp;
  }
  const fs = 64, pad = bg ? 34 : 24;
  const c = document.createElement('canvas');
  const font = `600 ${fs}px "Atkinson Hyperlegible Next", system-ui, sans-serif`;
  const g0 = c.getContext('2d')!;
  g0.font = font;
  const w = Math.ceil(g0.measureText(text).width) + pad;
  c.width = w; c.height = fs + 26;
  const g = c.getContext('2d')!;
  if (bg) { g.fillStyle = bg; g.beginPath(); g.roundRect(0, 0, w, fs + 26, 20); g.fill(); }
  g.font = font; g.fillStyle = color; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText(text, w / 2, (fs + 26) / 2 + 2);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  cache?.set(key, tex);
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, depthTest: false, transparent: true }));
  sp.scale.set(size * (w / c.height), size, 1);
  sp.renderOrder = 12;
  return sp;
}

// ---------- the stage ----------

/** One thing on a rung: a formula and its amount there (grams, mol or a particle count); `tag` is its caption. */
export interface Item { f: string; amount: number; tag?: string }
export interface Pin { label: string; N: number }
/**
 * What the four rungs show. `sides` are drawn side by side (sample compare) or, with `arrow`, stacked with an arrow
 * from the top side (reactants) to the bottom side (products). Particles: amount = number of particles drawn.
 */
export interface LadderScene {
  arrow: boolean;
  grams: { sides: Item[][]; beam?: boolean };
  moles: { sides: Item[][] };
  count: { pins: Pin[] };
  particles: { sides: Item[][]; react?: { events: number; coeffs: number[]; productCoeffs: number[]; animate: boolean } | null };
}
interface Block { obj: THREE.Group; w: number; h: number; parts?: THREE.Object3D[] }
interface Mover { o: THREE.Object3D; from: V3; to: V3 }

const CHALK = 0xece6d6, FOG = 0x9aa3bf, ENERGY = 0xffc15e, GLASS = 0xbfd4ff;
const VIEW = V(0, 0.32, 1).normalize();
const ease = (f: number) => (f < 0.5 ? 2 * f * f : 1 - Math.pow(-2 * f + 2, 2) / 2);

export class ZoomLadderStage extends Stage3D {
  rung: Rung = 'grams';
  private shared = new Set<object>();
  private geo = {
    sphere: this.keep(new THREE.SphereGeometry(1, 22, 16)),
    ico: this.keep(new THREE.IcosahedronGeometry(1, 0)),
    stick: this.keep(new THREE.CylinderGeometry(1, 1, 1, 10)),
    cyl: this.keep(new THREE.CylinderGeometry(1, 1, 1, 36)),
    tube: this.keep(new THREE.CylinderGeometry(1, 1, 1, 36, 1, true)),
    cone: this.keep(new THREE.ConeGeometry(1, 1, 36)),
    box: this.keep(new THREE.BoxGeometry(1, 1, 1)),
    plane: this.keep(new THREE.PlaneGeometry(1, 1)),
  };
  private edgeBase = new THREE.EdgesGeometry(new THREE.BoxGeometry(1, 1, 1)).getAttribute('position').array as Float32Array;
  private mats = new Map<string, THREE.Material>();
  private lineMat = this.keep(new THREE.LineBasicMaterial({ color: CHALK, transparent: true, opacity: 0.55 }));
  private groups: Record<Rung, THREE.Group> = { grams: new THREE.Group(), moles: new THREE.Group(), count: new THREE.Group(), particles: new THREE.Group() };
  private frames = {} as Record<Rung, { c: V3; size: V3 }>;
  private cam: { t0: number; dur: number; fromT: V3; toT: V3; fromP: V3; toP: V3 } | null = null;
  private aspect = 0;
  private t = 0;
  private wobble: { o: THREE.Object3D; base: number; ph: number }[] = [];
  private beam: { beam: THREE.Object3D; pans: THREE.Object3D[]; pivot: V3; arm: number; drop: number; angle: number; target: number } | null = null;
  private anim: { t0: number; step: number; events: { movers: Mover[]; appear: THREE.Object3D[] }[]; done: number; after: THREE.Object3D[] } | null = null;
  private tmpT = V();
  private tmpP = V();
  private first = true;

  constructor(host: HTMLElement, private compact = false) {
    super(host, { distance: 12, autoRotate: false, minDistance: 3, maxDistance: 90 });
    RUNGS.forEach((r, i) => { this.groups[r].position.y = -i * GAP; this.root.add(this.groups[r]); });
  }

  private keep<T extends object>(x: T): T { this.shared.add(x); return x; }

  private mat(color: number, o: { opacity?: number; metal?: number; rough?: number; glow?: number } = {}): THREE.MeshStandardMaterial {
    const op = o.opacity ?? 1;
    const key = `${color}|${op}|${o.metal ?? 0.05}|${o.rough ?? 0.5}|${o.glow ?? 0}`;
    let m = this.mats.get(key) as THREE.MeshStandardMaterial | undefined;
    if (!m) {
      m = new THREE.MeshStandardMaterial({ color, roughness: o.rough ?? 0.5, metalness: o.metal ?? 0.05, emissive: color, emissiveIntensity: o.glow ?? 0, transparent: op < 1, opacity: op, depthWrite: op >= 1 });
      this.mats.set(key, m);
      this.shared.add(m);
    }
    return m;
  }

  private mesh(geo: THREE.BufferGeometry, mat: THREE.Material, sx: number, sy = sx, sz = sx): THREE.Mesh {
    const m = new THREE.Mesh(geo, mat);
    m.scale.set(sx, sy, sz);
    return m;
  }

  /** A text sprite whose texture belongs to the current scene (freed on rebuild). */
  private tag(text: string, size = 0.42, color = '#ece6d6', bg?: string): THREE.Sprite {
    return makeTag(text, size * this.u, color, bg, this.tags);
  }
  /** Text textures, kept across rebuilds (a stepper tap rebuilds the rungs with mostly the same labels). */
  private tags = new Map<string, THREE.CanvasTexture>();

  private clearRung(g: THREE.Object3D) {
    for (const ch of [...g.children]) {
      g.remove(ch);
      ch.traverse((o) => {
        if ((o as THREE.InstancedMesh).isInstancedMesh) (o as THREE.InstancedMesh).dispose();
        const m = o as THREE.Mesh;
        if (!(o instanceof THREE.Sprite) && m.geometry && !this.shared.has(m.geometry)) m.geometry.dispose();
        const mats = (Array.isArray(m.material) ? m.material : m.material ? [m.material] : []) as THREE.Material[];
        for (const x of mats) if (!this.shared.has(x)) x.dispose();
      });
    }
  }

  // ---------- scene ----------

  setScene(sc: LadderScene) {
    const prevAngle = this.beam?.angle ?? null;
    this.anim = null;
    this.beam = null;
    this.wobble = [];
    const build: Record<Rung, () => void> = {
      grams: () => {
        this.beam = null;
        if (sc.grams.beam) this.buildBeam(sc.grams.sides[0] ?? [], sc.grams.sides[1] ?? [], prevAngle);
        else this.layoutSides(this.groups.grams, sc.grams.sides, sc.arrow, (it) => this.balance(it));
      },
      moles: () => { this.layoutSides(this.groups.moles, sc.moles.sides, sc.arrow, (it) => this.boxes(it)); },
      count: () => this.buildCount(sc.count.pins),
      particles: () => { this.wobble = []; this.anim = null; this.buildParticles(sc); },
    };
    for (const r of RUNGS) this.clearRung(this.groups[r]);
    if (this.tags.size > 300) { this.tags.forEach((t) => t.dispose()); this.tags.clear(); }
    for (const r of RUNGS) {
      const g = this.groups[r];
      this.ls = 1;
      build[r]();
      if (r !== 'count') {
        // a rung that holds more is framed from further away: build it again with bigger labels
        const f = this.fitFactor(g);
        if (f > 1.08) { this.clearRung(g); this.ls = f; build[r](); }
      }
      this.ls = 1;
    }
    this.groups.particles.updateMatrixWorld(true);
    this.groups.particles.traverse((o) => {
      if (!(o instanceof THREE.Sprite) || o.userData.ionR === undefined || !o.parent) return;
      const c = o.parent.getWorldPosition(V());
      o.position.copy(o.parent.worldToLocal(c.addScaledVector(VIEW, o.userData.ionR + 0.04)));
    });
    for (const r of RUNGS) {
      const g = this.groups[r];
      g.updateMatrixWorld(true);
      const box = new THREE.Box3().setFromObject(g);
      if (box.isEmpty()) box.set(V(-1, -1, -1).add(g.position), V(1, 1, 1).add(g.position));
      this.frames[r] = { c: box.getCenter(V()), size: box.getSize(V()) };
    }
    this.goTo(this.rung, this.first, 0.4);
    this.first = false;
  }

  /** Camera target and position that frame one rung. */
  private framing(r: Rung, outT: V3, outP: V3) {
    const f = this.frames[r];
    const tanv = Math.tan(THREE.MathUtils.degToRad(this.camera.fov) / 2);
    const m = this.compact ? 1.1 : 1.14;
    const top = this.compact ? 0.25 : 0.2;   // share of the view kept free under the HUD
    const hNeed = (f.size.y * m + 0.3) / (1 - top);
    const d = Math.max(hNeed / 2 / tanv, (f.size.x * m * 0.5) / (tanv * this.camera.aspect)) + f.size.z * 0.5;
    const vis = 2 * tanv * (d - f.size.z * 0.5);
    outT.copy(f.c);
    outT.y += (vis * top) / 2;
    outP.copy(VIEW).multiplyScalar(Math.max(4, d)).add(outT);
  }

  /** Move the camera to a rung: a smooth glide, or a cut under reduced motion. */
  goTo(r: Rung, instant = false, dur = 0.9) {
    this.rung = r;
    if (!this.frames[r]) return;
    const toT = V(), toP = V();
    this.framing(r, toT, toP);
    this.aspect = this.camera.aspect;
    if (instant || this.reducedMotion) {
      this.cam = null;
      this.controls.target.copy(toT);
      this.camera.position.copy(toP);
      return;
    }
    if (this.cam && this.cam.toT.distanceTo(toT) < 1e-3 && this.cam.toP.distanceTo(toP) < 1e-3) return;
    this.cam = { t0: this.t, dur, fromT: this.controls.target.clone(), toT, fromP: this.camera.position.clone(), toP };
  }

  /** Skip a running reaction animation to its end. */
  finishAnimation() { if (this.anim) this.tickAnim(true); }
  get animating() { return !!this.anim; }

  // ---------- layout ----------

  private layoutSides(g: THREE.Group, sides: Item[][], arrow: boolean, make: (it: Item, side: number, i: number) => Block): Block[][] {
    const rows = sides.map((items, s) => {
      const blocks = items.map((it, i) => make(it, s, i));
      const gap = arrow ? 1.1 : 0.7;
      return { blocks, gap, w: blocks.reduce((a, b) => a + b.w, 0) + gap * Math.max(0, blocks.length - 1), h: Math.max(0, ...blocks.map((b) => b.h)) };
    });
    const place = (row: (typeof rows)[number], cx: number, cy: number) => {
      let x = cx - row.w / 2;
      row.blocks.forEach((b, i) => {
        b.obj.position.set(x + b.w / 2, cy, 0);
        g.add(b.obj);
        x += b.w;
        if (i < row.blocks.length - 1) {
          if (arrow) { const p = this.tag('+', 0.6); p.position.set(x + row.gap / 2, cy, 0); g.add(p); }
          x += row.gap;
        }
      });
    };
    if (rows.length > 1 && arrow) {
      const ah = 1.6, total = rows[0].h + ah + rows[1].h;
      place(rows[0], 0, total / 2 - rows[0].h / 2);
      const ya = total / 2 - rows[0].h - ah / 2;
      const shaft = this.mesh(this.geo.stick, this.mat(CHALK, { glow: 0.2 }), 0.06, 0.9, 0.06);
      shaft.position.set(0, ya + 0.2, 0);
      const head = this.mesh(this.geo.cone, this.mat(CHALK, { glow: 0.2 }), 0.22, 0.4, 0.22);
      head.rotation.z = Math.PI;
      head.position.set(0, ya - 0.45, 0);
      g.add(shaft, head);
      place(rows[1], 0, -total / 2 + rows[1].h / 2);
    } else if (rows.length > 1) {
      const gap = 1.4, total = rows[0].w + gap + rows[1].w;
      place(rows[0], -total / 2 + rows[0].w / 2, 0);
      place(rows[1], total / 2 - rows[1].w / 2, 0);
    } else if (rows.length) place(rows[0], 0, 0);
    return rows.map((r) => r.blocks);
  }

  /** Wrap content that spans [bottom, top] in y into a block centred on its own origin. */
  private block(inner: THREE.Object3D, w: number, top: number, bottom: number, parts?: THREE.Object3D[]): Block {
    const obj = new THREE.Group();
    inner.position.y = -(top + bottom) / 2;
    obj.add(inner);
    return { obj, w, h: top - bottom, parts };
  }

  private caption(g: THREE.Object3D, it: Item, y: number, size = 0.4, z = 0): number {
    const text = it.tag ?? formulaText(it.f);
    const sp = this.tag(text, size, '#ece6d6');
    sp.position.set(0, y - sp.scale.y / 2, z);
    g.add(sp);
    return y - sp.scale.y;
  }

  /** How much bigger the labels must be so they stay readable when the camera frames this group. */
  private fitFactor(g: THREE.Group): number {
    g.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(g);
    if (box.isEmpty()) return 1;
    const size = box.getSize(V());
    return THREE.MathUtils.clamp(Math.max(size.y, size.x / Math.max(0.5, this.camera.aspect)) / 5.5, 1, 2.6);
  }

  // ---------- grams rung ----------

  /** The sample in its container: a heap (solid), a beaker (liquid) or a closed flask (gas). r sets the size. */
  private container(f: string, r: number): { obj: THREE.Group; top: number; w: number } {
    const g = new THREE.Group();
    const ph = phaseOf(f), col = sampleColor(f);
    if (ph === 's') {
      const hgt = r * 0.75;
      const heap = this.mesh(this.geo.cone, this.mat(col, { rough: 0.85, metal: /^(Au|Cu|Ag|Fe|Al|Mg|Pb)$/.test(f) ? 0.45 : 0.05 }), r, hgt, r);
      heap.position.y = hgt / 2;
      g.add(heap);
      return { obj: g, top: hgt, w: 2 * r };
    }
    if (ph === 'l') {
      const br = r * 0.8 + 0.18, lh = r * 1.1, bh = lh * 1.3 + 0.2;
      const liquid = this.mesh(this.geo.cyl, this.mat(col, { opacity: 0.85, rough: 0.2 }), br * 0.94, lh, br * 0.94);
      liquid.position.y = lh / 2 + 0.03;
      const glass = this.mesh(this.geo.tube, this.mat(GLASS, { opacity: 0.22, rough: 0.1 }), br, bh, br);
      glass.position.y = bh / 2;
      g.add(liquid, glass);
      return { obj: g, top: bh, w: 2 * br };
    }
    const fr = Math.max(0.45, r * 0.75 + 0.15);
    const bulb = this.mesh(this.geo.sphere, this.mat(GLASS, { opacity: 0.2, rough: 0.1 }), fr);
    bulb.position.y = fr;
    const gas = this.mesh(this.geo.sphere, this.mat(col, { opacity: 0.32, glow: 0.15 }), fr * 0.9);
    gas.position.y = fr;
    const neck = this.mesh(this.geo.cyl, this.mat(GLASS, { opacity: 0.3, rough: 0.1 }), fr * 0.28, fr * 0.6, fr * 0.28);
    neck.position.y = fr * 2.2;
    const stopper = this.mesh(this.geo.cyl, this.mat(0x6b5a4a, { rough: 0.9 }), fr * 0.3, fr * 0.22, fr * 0.3);
    stopper.position.y = fr * 2.55;
    g.add(bulb, gas, neck, stopper);
    return { obj: g, top: fr * 2.66, w: 2 * fr };
  }

  /** A digital lab balance with the sample on its pan and the mass on the display. */
  private balance(it: Item): Block {
    const u = this.u, g = new THREE.Group();
    const r = THREE.MathUtils.clamp(0.42 * Math.cbrt(Math.max(0, it.amount)), 0.22, 1.5);
    const c = it.amount > 1e-6 ? this.container(it.f, r) : { obj: new THREE.Group(), top: 0.1, w: 1.6 };
    const panR = Math.max(1.05, c.w / 2 + 0.15);
    const W = Math.max(panR * 2 + 0.4, 2.6 * u);
    const D = Math.max(1.9, panR * 2 + 0.3);
    const base = this.mesh(this.geo.box, this.mat(0x2b3563, { rough: 0.6 }), W, 0.55, D);
    base.position.y = 0.275;
    const stem = this.mesh(this.geo.cyl, this.mat(0x8a93b3, { metal: 0.6, rough: 0.3 }), 0.12, 0.12, 0.12);
    stem.position.y = 0.6;
    const pan = this.mesh(this.geo.cyl, this.mat(0xc7ccd9, { metal: 0.7, rough: 0.25 }), panR, 0.08, panR);
    pan.position.y = 0.7;
    c.obj.position.y = 0.74;
    const read = this.tag(gram(it.amount), 0.46, '#ffc15e', 'rgba(6,10,26,0.94)');
    read.position.set(0, 0.28, D / 2 + 0.05);
    g.add(base, stem, pan, c.obj, read);
    const bottom = this.caption(g, it, -0.12, 0.42, D / 2);
    return this.block(g, W, 0.74 + c.top, bottom);
  }

  /** Equation mode: a beam balance, reactants on the left pan and products on the right. */
  private buildBeam(left: Item[], right: Item[], prevAngle: number | null) {
    const g = this.groups.grams;
    const mL = left.reduce((s, x) => s + x.amount, 0), mR = right.reduce((s, x) => s + x.amount, 0);
    const maxItem = Math.max(1e-9, ...left.map((x) => x.amount), ...right.map((x) => x.amount));
    const arm = 3.3, postH = 3.4, drop = 2.3;
    const base = this.mesh(this.geo.box, this.mat(0x2b3563, { rough: 0.6 }), 2.4, 0.3, 1.4);
    base.position.y = 0.15;
    const post = this.mesh(this.geo.stick, this.mat(0x8a93b3, { metal: 0.6, rough: 0.3 }), 0.1, postH, 0.1);
    post.position.y = postH / 2;
    const pivot = V(0, postH, 0);
    const beam = new THREE.Group();
    beam.position.copy(pivot);
    beam.add(this.mesh(this.geo.box, this.mat(0xc7ccd9, { metal: 0.6, rough: 0.3 }), arm * 2 + 0.3, 0.12, 0.16));
    const knob = this.mesh(this.geo.sphere, this.mat(ENERGY, { glow: 0.3 }), 0.13);
    knob.position.copy(pivot);
    g.add(base, post, beam, knob);
    const pans = [left, right].map((items, s) => {
      const pg = new THREE.Group();
      for (const x of [-1.05, 1.05]) {
        const str = this.mesh(this.geo.stick, this.mat(FOG), 0.02, drop, 0.02);
        str.position.set(x * 0.75, -drop / 2, 0);
        str.rotation.z = x * 0.32;
        pg.add(str);
      }
      const pan = this.mesh(this.geo.cyl, this.mat(0xc7ccd9, { metal: 0.7, rough: 0.25 }), 1.45, 0.07, 1.45);
      pan.position.y = -drop;
      pg.add(pan);
      items.forEach((it, i) => {
        const c = this.container(it.f, THREE.MathUtils.clamp(0.62 * Math.cbrt(it.amount / maxItem), 0.16, 0.62));
        const x = items.length > 1 ? (i - (items.length - 1) / 2) * 1.3 : 0;
        c.obj.position.set(x, -drop + 0.04, 0);
        pg.add(c.obj);
      });
      let y = -drop - 0.12;
      for (const [text, size, color, bg] of [
        [gram(s === 0 ? mL : mR), 0.46, '#ffc15e', 'rgba(6,10,26,0.94)'],
        [items.map((it) => it.tag ?? formulaText(it.f)).join(' + '), 0.38, '#ece6d6', undefined],
        [L(s === 0 ? { en: 'reactants', de: 'Edukte' } : { en: 'products', de: 'Produkte' }), 0.32, '#9aa3bf', undefined],
      ] as [string, number, string, string | undefined][]) {
        const t = this.tag(text, size, color, bg);
        t.position.set(0, y - t.scale.y / 2, 0.3);
        y -= t.scale.y + 0.04;
        pg.add(t);
      }
      g.add(pg);
      return pg;
    });
    const target = THREE.MathUtils.clamp(((mL - mR) / Math.max(1e-9, mL + mR)) * 1.4, -0.28, 0.28);
    this.beam = { beam, pans, pivot, arm, drop, angle: this.reducedMotion || prevAngle === null ? target : prevAngle, target };
    this.placeBeam();
  }

  private placeBeam() {
    const b = this.beam!;
    b.beam.rotation.z = b.angle;
    const c = Math.cos(b.angle), s = Math.sin(b.angle);
    b.pans[0].position.set(b.pivot.x - b.arm * c, b.pivot.y - b.arm * s, 0);
    b.pans[1].position.set(b.pivot.x + b.arm * c, b.pivot.y + b.arm * s, 0);
  }

  // ---------- moles rung ----------

  /** The sample split into 1 mol portions (boxes of equal size: a mole is a count), the last one part-filled. */
  private boxes(it: Item): Block {
    const u = this.u, g = new THREE.Group();
    const n = Math.max(0, it.amount);
    let p = 1;
    while (n / p > 12) p *= 10;
    const count = Math.max(1, Math.ceil(n / p - 1e-9));
    const cols = Math.min(count, 4), rows = Math.ceil(count / cols);
    const bs = 1, px = bs + 0.3, py = bs + 0.6 * u;
    const col = sampleColor(it.f), gas = phaseOf(it.f) === 'g';
    for (let k = 0; k < count; k++) {
      const c = k % cols, r = Math.floor(k / cols);
      const x = (c - (cols - 1) / 2) * px, y = -r * py;
      const frac = Math.min(1, n / p - k);
      const edges = new THREE.LineSegments(this.edgeGeo(), this.lineMat);
      edges.scale.setScalar(bs);
      edges.position.set(x, y, 0);
      g.add(edges);
      if (frac > 0.002) {
        const fill = this.mesh(this.geo.box, this.mat(col, { opacity: gas ? 0.4 : 0.92, rough: 0.8 }), bs * 0.9, bs * 0.9 * frac, bs * 0.9);
        fill.position.set(x, y - bs * 0.45 + (bs * 0.9 * frac) / 2, 0);
        g.add(fill);
      }
      const amt = Math.min(p, n - k * p);
      const t = this.tag(`${frac >= 0.9995 ? numTrim(p, 0) : amt < 0.001 ? sci(amt) : numTrim(amt, 3)} mol`, 0.3, frac >= 0.9995 ? '#ece6d6' : '#ffc15e');
      t.position.set(x, y - bs / 2 - 0.24 * u, 0);
      g.add(t);
    }
    const bottom = this.caption(g, it, -(rows - 1) * py - bs / 2 - 0.5 * u);
    return this.block(g, cols * px, bs / 2, bottom);
  }

  private edges: THREE.BufferGeometry | null = null;
  private edgeGeo(): THREE.BufferGeometry {
    if (!this.edges) {
      this.edges = new THREE.BufferGeometry();
      this.edges.setAttribute('position', new THREE.BufferAttribute(this.edgeBase, 3));
      this.keep(this.edges);
    }
    return this.edges;
  }

  // ---------- count rung ----------

  /**
   * A ruler of powers of ten, 1 to 10²⁷, in bands of × 1000, beside a cube of 10 × 10 × 10 dots (the first band).
   * Each sample is a pin at its particle count; 1 mol is marked.
   */
  private buildCount(pins: Pin[]) {
    const u = this.u, H = 8, dy = H / 27, rw = 0.45;
    const g = new THREE.Group();
    g.position.y = -H / 2;
    this.groups.count.add(g);
    for (let k = 0; k < 9; k++) {
      const band = this.mesh(this.geo.box, this.mat(k % 2 ? 0x3d4c8a : 0x2a3566, { rough: 0.7 }), rw, 3 * dy, 0.25);
      band.position.set(0, (k * 3 + 1.5) * dy, 0);
      g.add(band);
    }
    for (let e = 0; e <= 27; e += 3) {
      const t = this.tag(e === 0 ? '1' : `10${sup(e)}`, 0.56, '#c9c3b3');
      t.position.set(-rw / 2 - 0.5 * u, e * dy, 0);
      g.add(t);
    }
    // the first band as a cube of 1000 dots
    const pts = new Float32Array(3000);
    const side = 2, step = side / 9;
    let i = 0;
    for (let a = 0; a < 10; a++) for (let b = 0; b < 10; b++) for (let c = 0; c < 10; c++) {
      pts[i++] = a * step - side / 2; pts[i++] = b * step - side / 2; pts[i++] = c * step - side / 2;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pts, 3));
    const cube = new THREE.Points(geo, new THREE.PointsMaterial({ color: CHALK, size: 0.09, sizeAttenuation: true }));
    const cx = -rw / 2 - 1.3 * u - side / 2 - 0.6;
    cube.position.set(cx, 2.6, 0);
    cube.rotation.set(0.35, 0.6, 0);
    g.add(cube);
    const c1 = this.tag(`10 ${times()} 10 ${times()} 10 = 1000`, 0.46);
    c1.position.set(cx, 2.6 - side * 0.95 - 0.3 * u, 0);
    const c2 = this.tag(L({ en: `each band: ${times()} 1000`, de: `jedes Band: ${times()} 1000` }), 0.44, '#9aa3bf');
    c2.position.set(cx, 2.6 - side * 0.95 - 0.85 * u, 0);
    // a bracket from the cube to the first band
    const lg = new THREE.BufferGeometry().setFromPoints([V(cx + side * 0.7, 2.6, 0), V(-rw / 2 - 0.1, 1.5 * dy, 0)]);
    g.add(c1, c2, new THREE.Line(lg, this.lineMat));
    // labels on the right, pushed apart where they would overlap
    const marks = [
      { y: Math.log10(6.02214076e23) * dy, text: L({ en: '1 mol', de: '1 mol' }), color: '#ffc15e', line: ENERGY },
      ...pins.map((p, k) => ({ y: Math.log10(Math.max(1, p.N)) * dy, text: p.label, color: ['#ece6d6', '#7bd389', '#d9c8ff', '#9aa3bf'][k % 4], line: [CHALK, 0x7bd389, 0xd9c8ff, FOG][k % 4] })),
    ];
    const order = marks.map((m, k) => k).sort((a, b) => marks[a].y - marks[b].y);
    const ly = order.map((k) => marks[k].y);
    const sep = 0.66 * u;
    for (let pass = 0; pass < 20; pass++) for (let k = 1; k < ly.length; k++) if (ly[k] - ly[k - 1] < sep) {
      const mid = (ly[k] + ly[k - 1]) / 2;
      ly[k - 1] = mid - sep / 2; ly[k] = mid + sep / 2;
    }
    order.forEach((k, j) => {
      const m = marks[k];
      const tick = this.mesh(this.geo.box, this.mat(m.line, { glow: 0.4 }), rw + 0.3, 0.05, 0.3);
      tick.position.set(0, m.y, 0);
      const x0 = rw / 2 + 0.15, x1 = rw / 2 + 0.75;
      const leader = new THREE.Line(new THREE.BufferGeometry().setFromPoints([V(x0, m.y, 0), V(x1, ly[j], 0)]), new THREE.LineBasicMaterial({ color: m.line }));
      const t = this.tag(m.text, 0.6, m.color);
      const w = t.scale.x;
      t.position.set(x1 + 0.1 + w / 2, ly[j], 0);
      g.add(tick, leader, t);
    });
  }

  // ---------- particles rung ----------

  /** Label scale: bigger in the small compact stage. */
  private get u() { return (this.compact ? 1.25 : 1) * this.ls; }
  /** Label scale for the rung being built (set by setScene from how far away the camera will be). */
  private ls = 1;

  private atomBall(el: string, r = drawR(el)): THREE.Mesh {
    return this.mesh(this.geo.sphere, this.mat(atomColor(el), { metal: /^(Au|Cu|Ag|Fe|Al|Mg|Pb|Zn|Na|Ca)$/.test(el) ? 0.35 : 0.05, rough: 0.45 }), r);
  }

  /** One ion: blue cation or red anion with its charge written on it ("Na⁺", "O²⁻"); polyatomic ions as one sphere. */
  private ion(f: string, q: number): { o: THREE.Group; r: number } {
    const g = new THREE.Group();
    const els = Object.entries(parseFormula(f));
    const atoms = els.reduce((s, x) => s + x[1], 0);
    // schematic ion sizes from the atomic radius: cations about half as big, anions about 80 pm bigger
    const pm = atoms > 1 ? 90 + 20 * atoms : q > 0 ? radiusPm(els[0][0]) * 0.55 : radiusPm(els[0][0]) + 80;
    const r = pm * 0.5 * PM + 0.1;
    g.add(this.mesh(this.geo.sphere, this.mat(q > 0 ? CHARGE.plus : CHARGE.minus, { rough: 0.45, glow: 0.1 }), r));
    const t = this.label(ionName(f, q), 0.3 * this.u, '#ffffff', 'rgba(10,14,32,0.72)');
    t.material.depthTest = true;
    t.userData.ionR = r;
    g.add(t);
    return { o: g, r };
  }

  /** One particle of formula f: an atom, a molecule (ball and stick or schematic cluster) or a formula unit (its ions). */
  private particle(f: string): { o: THREE.Group; r: number } {
    const kind = kindOf(f), g = new THREE.Group();
    if (kind === 'atom') {
      const el = Object.keys(parseFormula(f))[0];
      g.add(this.atomBall(el));
      return { o: g, r: drawR(el) };
    }
    if (kind === 'formula-unit') {
      const sp = IONIC[f] ?? { ions: [] };
      const list: { f: string; q: number }[] = [];
      for (const [x, q, n] of sp.ions) for (let k = 0; k < n; k++) list.push({ f: x, q });
      const made = list.map((x) => this.ion(x.f, x.q));
      const R = list.length === 1 ? 0 : Math.max(...made.map((m) => m.r)) * (list.length === 2 ? 1 : 1.25);
      made.forEach((m, k) => { m.o.position.copy(list.length === 2 ? V(k ? R : -R, 0, 0) : golden(k, list.length).multiplyScalar(R)); g.add(m.o); });
      for (let k = 0; k < (sp.water ?? 0); k++) {
        const w = this.molecule('H2O', 0.7);
        w.o.position.copy(golden(k, sp.water!).multiplyScalar(R + 1.1));
        g.add(w.o);
      }
      return { o: g, r: R + Math.max(0.3, ...made.map((m) => m.r)) + (sp.water ? 1.2 : 0) };
    }
    return this.molecule(f);
  }

  private molecule(f: string, k = 1): { o: THREE.Group; r: number } {
    const g = new THREE.Group(), sh = shapeOf(f);
    let r = 0;
    for (const a of sh.atoms) {
      const m = this.atomBall(a.el, drawR(a.el) * k * (sh.cluster ? 1.12 : 1));
      m.position.copy(a.p).multiplyScalar(k);
      g.add(m);
      r = Math.max(r, a.p.length() * k + drawR(a.el) * k);
    }
    for (const [i, j] of sh.bonds) {
      const a = sh.atoms[i].p.clone().multiplyScalar(k), b = sh.atoms[j].p.clone().multiplyScalar(k);
      const st = this.mesh(this.geo.stick, this.mat(0xb9b3a5, { rough: 0.6 }), 0.07 * k, a.distanceTo(b), 0.07 * k);
      st.position.copy(a).add(b).multiplyScalar(0.5);
      st.quaternion.setFromUnitVectors(V(0, 1, 0), b.clone().sub(a).normalize());
      g.add(st);
    }
    return { o: g, r };
  }

  /** A group of n particles in a small grid, its caption underneath. */
  private group(it: Item, single: boolean, packed: boolean): Block {
    const u = this.u, g = new THREE.Group();
    const n = Math.max(0, Math.round(it.amount));
    const parts: THREE.Object3D[] = [];
    let cell = 1, top = 0.6, bottom = -0.6, w = 1.4;
    if (n > 0) {
      const ps = Array.from({ length: n }, () => this.particle(it.f));
      const r = Math.max(...ps.map((p) => p.r));
      const metal = packed && kindOf(it.f) === 'atom';
      cell = metal ? 2 * r * 1.02 : 2 * r + 0.32;
      const cols = Math.min(n, single ? (n > 9 ? 4 : 3) : n > 4 ? 3 : 2), rows = Math.ceil(n / cols);
      ps.forEach((p, k) => {
        const c = k % cols, rr = Math.floor(k / cols);
        const lastRow = Math.floor((n - 1) / cols) === rr ? n - rr * cols : cols;
        p.o.position.set((c - (lastRow - 1) / 2) * cell, -rr * cell, metal ? (k % 2) * r * 0.25 : 0);
        p.o.rotation.y = (k * 0.9) % 6.28;
        g.add(p.o);
        parts.push(p.o);
        if (!this.reducedMotion && !metal) this.wobble.push({ o: p.o, base: p.o.rotation.y, ph: k * 1.3 });
      });
      top = r; bottom = -(rows - 1) * cell - r; w = cols * cell;
    } else {
      const dash = this.tag('–', 0.5, '#9aa3bf');
      g.add(dash);
    }
    const capTop = bottom - 0.12 * u;
    const end = this.caption(g, it, capTop, 0.44);
    return this.block(g, Math.max(w, 1.2 * u), top, end, parts);
  }

  /** Ionic samples on the particle rung: a small lattice piece with cations and anions alternating (schematic). */
  private latticePiece(it: Item): Block {
    const sp = IONIC[it.f];
    if (!sp || sp.water) return this.group({ ...it, amount: Math.min(2, it.amount) }, true, false);
    const u = this.u, g = new THREE.Group();
    const per = sp.ions.reduce((s, x) => s + x[2], 0);
    const k = Math.max(1, Math.floor(12 / per));
    const cats: { f: string; q: number }[] = [], ans: { f: string; q: number }[] = [];
    for (let m = 0; m < k; m++) for (const [x, q, n] of sp.ions) for (let j = 0; j < n; j++) (q > 0 ? cats : ans).push({ f: x, q });
    const total = cats.length + ans.length;
    const dims = total <= 8 ? [2, 2, 2] : total <= 12 ? [3, 2, 2] : [3, 3, 2];
    const sites: V3[] = [];
    for (let a = 0; a < dims[0]; a++) for (let b = 0; b < dims[1]; b++) for (let c = 0; c < dims[2]; c++) sites.push(V(a, b, c));
    const even = sites.filter((s) => (s.x + s.y + s.z) % 2 === 0), odd = sites.filter((s) => (s.x + s.y + s.z) % 2 === 1);
    const pick = (pool: V3[], m: number) => Array.from({ length: m }, (_, i) => pool[Math.floor((i * pool.length) / m)]);
    const used = new Set<V3>();
    const catSites = pick(even, Math.min(cats.length, even.length));
    catSites.forEach((s) => used.add(s));
    const rest = [...odd, ...even.filter((s) => !used.has(s))];
    const anSites = rest.slice(0, ans.length);
    const ions = [...cats.slice(0, catSites.length).map((x, i) => ({ ...x, s: catSites[i] })), ...ans.slice(0, anSites.length).map((x, i) => ({ ...x, s: anSites[i] }))];
    const made = ions.map((x) => ({ ...this.ion(x.f, x.q), s: x.s, q: x.q }));
    const rC = Math.max(...made.filter((m) => m.q > 0).map((m) => m.r)), rA = Math.max(...made.filter((m) => m.q < 0).map((m) => m.r));
    const d = (rC + rA) * 1.04;
    const off = V((dims[0] - 1) / 2, (dims[1] - 1) / 2, (dims[2] - 1) / 2);
    for (const m of made) { m.o.position.copy(m.s).sub(off).multiplyScalar(d); g.add(m.o); }
    g.rotation.set(0.32, -0.5, 0);
    const holder = new THREE.Group();
    holder.add(g);
    const half = d * 1.35;
    this.caption(holder, it, -half - 0.1 * u, 0.36);
    return this.block(holder, (dims[0] + 0.6) * d, half, -half - 0.5 * u);
  }

  private buildParticles(sc: LadderScene) {
    const p = sc.particles, g = this.groups.particles;
    const single = p.sides.length === 1 && p.sides[0].length === 1;
    const blocks = this.layoutSides(g, p.sides, sc.arrow, (it) => (single && kindOf(it.f) === 'formula-unit' ? this.latticePiece(it) : this.group(it, single, !sc.arrow)));
    if (!p.react || !sc.arrow || blocks.length < 2) return;
    const R = p.react, rb = blocks[0], pb = blocks[1];
    g.updateMatrixWorld(true);
    const centre = pb.reduce((s, b) => s.add(b.obj.getWorldPosition(V())), V()).multiplyScalar(1 / Math.max(1, pb.length));
    const events: { movers: Mover[]; appear: THREE.Object3D[] }[] = [];
    for (let e = 0; e < R.events; e++) {
      const movers: Mover[] = [], appear: THREE.Object3D[] = [];
      rb.forEach((b, i) => {
        for (let k = e * R.coeffs[i]; k < (e + 1) * R.coeffs[i]; k++) {
          const o = b.parts?.[k];
          if (o) movers.push({ o, from: o.position.clone(), to: o.parent!.worldToLocal(centre.clone()) });
        }
      });
      pb.forEach((b, j) => { for (let k = e * R.productCoeffs[j]; k < (e + 1) * R.productCoeffs[j]; k++) { const o = b.parts?.[k]; if (o) appear.push(o); } });
      events.push({ movers, appear });
    }
    // after the run: what is left over, labelled
    const after: THREE.Object3D[] = [];
    rb.forEach((b, i) => {
      const left = (b.parts?.length ?? 0) - R.events * R.coeffs[i];
      if (left <= 0) {
        if (!b.parts?.length) return;
        const t = this.tag(L({ en: 'used up', de: 'aufgebraucht' }), 0.4, '#ece6d6', 'rgba(70,84,140,0.95)');
        t.position.set(b.obj.position.x, b.obj.position.y + b.h / 2 + 0.35 * this.u, 0.5);
        g.add(t);
        after.push(t);
        return;
      }
      const t = this.tag(L({ en: `left over: ${left}`, de: `übrig: ${left}` }), 0.4, '#1b1406', 'rgba(255,193,94,0.95)');
      const top = b.obj.position.y + b.h / 2 + 0.35 * this.u;
      t.position.set(b.obj.position.x, top, 0.5);
      g.add(t);
      after.push(t);
      for (let k = R.events * R.coeffs[i]; k < (b.parts?.length ?? 0); k++) {
        const ring = this.mesh(this.geo.sphere, this.mat(ENERGY, { opacity: 0.13, glow: 0.6 }), 1);
        const o = b.parts![k];
        ring.scale.setScalar(this.radiusOf(o) + 0.05);
        o.add(ring);
        after.push(ring);
      }
    });
    for (const ev of events) for (const o of ev.appear) o.visible = !R.animate;
    if (!R.animate) {
      for (const ev of events) for (const m of ev.movers) m.o.visible = false;
      return;
    }
    for (const o of after) o.visible = false;
    this.anim = { t0: this.t + (this.reducedMotion ? 0.3 : 1.0), step: this.reducedMotion ? 0.35 : 0.8, events, done: 0, after };
  }

  private radiusOf(o: THREE.Object3D): number {
    const b = new THREE.Box3().setFromObject(o);
    return b.getSize(V()).length() / 2 / Math.max(1e-6, o.getWorldScale(V()).x);
  }

  /** Emitted once a reaction animation has played to its end. */
  private tickAnim(force = false) {
    const a = this.anim!;
    const k = force ? a.events.length + 1 : (this.t - a.t0) / a.step;
    a.events.forEach((ev, e) => {
      const f = THREE.MathUtils.clamp(k - e, 0, 1);
      for (const m of ev.movers) {
        if (this.reducedMotion) { m.o.visible = f < 1; continue; }
        m.o.position.lerpVectors(m.from, m.to, ease(Math.min(1, f / 0.8)));
        m.o.visible = f < 1;
        const s = f > 0.8 ? 1 - (f - 0.8) / 0.2 : 1;
        m.o.scale.setScalar(Math.max(0.001, s));
      }
      for (const o of ev.appear) {
        o.visible = f >= 0.8;
        if (!this.reducedMotion) o.scale.setScalar(THREE.MathUtils.clamp((f - 0.8) / 0.2, 0.001, 1));
      }
    });
    if (k >= a.events.length) {
      for (const o of a.after) o.visible = true;
      this.anim = null;
      this.emit('reacted');
    }
  }

  // ---------- frame ----------

  protected tick(dt: number) {
    this.t += dt;
    if (this.cam) {
      const f = Math.min(1, (this.t - this.cam.t0) / this.cam.dur), e = ease(f);
      this.controls.target.lerpVectors(this.cam.fromT, this.cam.toT, e);
      this.camera.position.lerpVectors(this.cam.fromP, this.cam.toP, e);
      if (f >= 1) this.cam = null;
    } else if (Math.abs(this.camera.aspect - this.aspect) > 0.01 && this.frames[this.rung]) {
      // the stage was resized: frame the rung again
      this.framing(this.rung, this.tmpT, this.tmpP);
      this.controls.target.copy(this.tmpT);
      this.camera.position.copy(this.tmpP);
      this.aspect = this.camera.aspect;
    }
    if (this.beam && Math.abs(this.beam.angle - this.beam.target) > 1e-4) {
      this.beam.angle += (this.beam.target - this.beam.angle) * Math.min(1, dt * 3);
      this.placeBeam();
    }
    for (const w of this.wobble) w.o.rotation.y = w.base + 0.35 * Math.sin(this.t * 0.5 + w.ph);
    if (this.anim && this.t >= this.anim.t0) this.tickAnim();
  }

  dispose() {
    for (const r of RUNGS) this.clearRung(this.groups[r]);
    super.dispose();
    for (const x of this.shared) (x as { dispose?: () => void }).dispose?.();
    this.tags.forEach((t) => t.dispose());
    this.tags.clear();
  }
}
