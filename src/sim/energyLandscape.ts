// The Energy Landscape (units 17, 18, 20; later 23): energy drawn as height. Each state of a reaction (reactants,
// products, separated atoms, the elements, an intermediate) is a flat terrace at its energy, seen from the side next
// to a vertical axis in kJ/mol; vertical arrows between terraces carry the energy taken in (up, +, blue) or released
// (down, −, red), always with a signed number. Gibbs mode draws bars on a zero floor instead (ΔH, −T·ΔS, ΔG).
// The screen component (energyLandscapeUI.ts) does the chemistry and hands this stage an EnergyView; the stage draws
// it and animates the change from the previous one (new terraces fade in, arrows grow, atoms fly from one terrace to
// the next, the axis rescales smoothly). The energy range of a view always fills the same height (HEIGHT), so the axis
// rescales per reaction; the screen component says so.
// Unit 23 adds an activation-energy path: a further list in EnergyView (a hump: a curve from one level over a peak to
// the next, with Ea as an arrow from the start level to the peak) built in setView() and placed in tick() like the
// arrows; a catalyst is a second, lower hump between the same two levels.
import * as THREE from 'three';
import { Stage3D } from './stage';
import { h } from '../ui/dom';
import { num } from '../i18n';

export type Tone = 'react' | 'prod' | 'atoms' | 'elements' | 'mid' | 'floor';
export type TagSide = 'above' | 'below' | 'left' | 'right' | 'none';

export interface Atom3 { el: string; p: [number, number, number]; }
/** A ball-and-stick molecule in its own frame: atoms and bonds [i, j, order]. */
export interface Mol3 { atoms: Atom3[]; bonds: [number, number, number][]; }

/** A terrace at energy E (kJ/mol) from x0 to x1 (scene units, the diagram spans −3.05 to 3.05). */
export interface Level {
  key: string;
  E: number;
  x0: number;
  x1: number;
  z?: number;
  depth?: number;
  tone: Tone;
  /** Tag lines: the first is drawn bold (the formulas), the others small. */
  lines: string[];
  tag: TagSide;
  tagX?: number;
  mols?: Mol3[];
  /** Key of the level whose atoms fly into this one when it appears. */
  from?: string;
  /** Molecules faded: their atoms have moved on to the next state. */
  dim?: boolean;
}
/** A vertical arrow from E0 to E1 at x: up = energy taken in (+, blue), down = released (−, red). */
export interface Arrow { key: string; x: number; E0: number; E1: number; main?: boolean; lines: string[]; tag: 'left' | 'right' | 'low' | 'high'; cls?: string; }
/** A dashed horizontal line at E (a level carried across, or the measured value). */
export interface Guide { key: string; x0: number; x1: number; E: number; measured?: boolean; }
/** A bar from E0 to E1 (Gibbs mode); `main` is the result (ΔG). */
export interface Bar { key: string; x: number; w: number; E0: number; E1: number; main?: boolean; lines: string[]; }
/** A free tag at a point (e.g. "ΔH = ?"). */
export interface Mark { key: string; x: number; E: number; lines: string[]; side: TagSide; cls?: string; }
export interface EnergyView {
  levels: Level[];
  arrows: Arrow[];
  guides: Guide[];
  bars: Bar[];
  marks: Mark[];
  /** The energy range drawn over the full height (kJ/mol) and the axis step. */
  lo: number;
  hi: number;
  step: number;
  /** One sentence for screen readers. */
  summary: string;
}

const HEIGHT = 5;
const AXIS_X = -3.4;
const FRONT = 0.68;
/** The part of the scene that must stay in view (axis numbers to the left, the right lane's tags to the right). */
const SPAN = { x0: -4.5, x1: 3.85, y0: -0.1, y1: HEIGHT + 0.15 };
const UP = 0x5aa9ff, DOWN = 0xff6b6b, CHALK = 0xece6d6;
const TONE: Record<Tone, number> = { react: 0x8a94b8, prod: 0xc9c0a6, atoms: 0x56618f, elements: 0x8fa58c, mid: 0x6f7a9f, floor: 0x3a4677 };
const ATOM_COLOR: Record<string, number> = { H: 0xe9e3d3, C: 0x5d6479, N: 0x93a6c9, O: 0xd2bfa6, F: 0xb2d6bf, Cl: 0x9fc79a };
const ATOM_R: Record<string, number> = { H: 0.085, C: 0.13, N: 0.125, O: 0.12, F: 0.115, Cl: 0.155 };
const atomR = (el: string) => ATOM_R[el] ?? 0.13;

// ---------- molecule shapes (schematic: ideal directions, lengths from the drawn radii) ----------

type Spec = [string, number, [number, number, number], number][];
const O3: [number, number, number] = [0, 0, 0];
const X3: [number, number, number] = [1, 0, 0];
const SHAPES: Record<string, Spec> = {
  H2: [['H', -1, O3, 0], ['H', 0, X3, 1]],
  Cl2: [['Cl', -1, O3, 0], ['Cl', 0, X3, 1]],
  F2: [['F', -1, O3, 0], ['F', 0, X3, 1]],
  O2: [['O', -1, O3, 0], ['O', 0, X3, 2]],
  N2: [['N', -1, O3, 0], ['N', 0, X3, 3]],
  HCl: [['H', -1, O3, 0], ['Cl', 0, X3, 1]],
  HF: [['H', -1, O3, 0], ['F', 0, X3, 1]],
  CO: [['C', -1, O3, 0], ['O', 0, X3, 3]],
  CO2: [['C', -1, O3, 0], ['O', 0, X3, 2], ['O', 0, [-1, 0, 0], 2]],
  H2O: [['O', -1, O3, 0], ['H', 0, [0.79, -0.61, 0], 1], ['H', 0, [-0.79, -0.61, 0], 1]],
  NH3: [['N', -1, O3, 0], ['H', 0, [0.94, -0.33, 0], 1], ['H', 0, [-0.47, -0.33, 0.82], 1], ['H', 0, [-0.47, -0.33, -0.82], 1]],
  CH4: [['C', -1, O3, 0], ['H', 0, [0, 1, 0], 1], ['H', 0, [0.94, -0.33, 0], 1], ['H', 0, [-0.47, -0.33, 0.82], 1], ['H', 0, [-0.47, -0.33, -0.82], 1]],
  C2H4: [['C', -1, O3, 0], ['C', 0, X3, 2], ['H', 0, [-0.5, 0.87, 0], 1], ['H', 0, [-0.5, -0.87, 0], 1], ['H', 1, [0.5, 0.87, 0], 1], ['H', 1, [0.5, -0.87, 0], 1]],
  C2H6: [['C', -1, O3, 0], ['C', 0, X3, 1], ['H', 0, [-0.33, 0.94, 0], 1], ['H', 0, [-0.33, -0.47, 0.82], 1], ['H', 0, [-0.33, -0.47, -0.82], 1],
    ['H', 1, [0.33, -0.94, 0], 1], ['H', 1, [0.33, 0.47, 0.82], 1], ['H', 1, [0.33, 0.47, -0.82], 1]],
};
/** True when the stage can draw this formula as a molecule. */
export const hasMolecule = (f: string) => !!SHAPES[f];
/** The molecule for a formula (centred on its atoms), or null. */
export function molecule(f: string): Mol3 | null {
  const spec = SHAPES[f];
  if (!spec) return null;
  const atoms: Atom3[] = [], bonds: [number, number, number][] = [];
  const v = new THREE.Vector3();
  spec.forEach(([el, parent, d, order], i) => {
    if (parent < 0) { atoms.push({ el, p: [0, 0, 0] }); return; }
    const pa = atoms[parent];
    const len = (atomR(el) + atomR(pa.el)) * 1.25 + 0.06;
    v.set(...d).normalize().multiplyScalar(len);
    atoms.push({ el, p: [pa.p[0] + v.x, pa.p[1] + v.y, pa.p[2] + v.z] });
    bonds.push([parent, i, order]);
  });
  const c = [0, 0, 0];
  for (const a of atoms) for (let k = 0; k < 3; k++) c[k] += a.p[k] / atoms.length;
  for (const a of atoms) for (let k = 0; k < 3; k++) a.p[k] -= c[k];
  return { atoms, bonds };
}
/** A single, separated atom. */
export const loneAtom = (el: string): Mol3 => ({ atoms: [{ el, p: [0, 0, 0] }], bonds: [] });

// ---------- the stage ----------

interface AtomObj { mesh: THREE.Mesh; home: THREE.Vector3; start: THREE.Vector3 | null; el: string; }
interface LevelObj {
  spec: Level; sig: string; group: THREE.Group; slabMat: THREE.MeshStandardMaterial; edgeMat: THREE.LineBasicMaterial;
  atomMats: Map<string, THREE.MeshStandardMaterial>; stickMat: THREE.MeshStandardMaterial;
  mols: { g: THREE.Group; base: number }[]; atoms: AtomObj[]; top: number;
  appear: number; flight: number; dimNow: number; tag: Tag | null;
}
interface ArrowObj { spec: Arrow; group: THREE.Group; shaft: THREE.Mesh; head: THREE.Mesh; mat: THREE.MeshStandardMaterial; grow: number; e0: number; e1: number; tag: Tag; }
interface BarObj { spec: Bar; mesh: THREE.Mesh; mat: THREE.MeshStandardMaterial; edge: THREE.LineSegments | null; e0: number; e1: number; appear: number; tag: Tag; }
interface GuideObj { spec: Guide; line: THREE.Line; }
interface Tag { el: HTMLElement; side: TagSide; text: string; tf: string; op: string; }

const arrowSide = (s: Arrow['tag']): TagSide => (s === 'low' ? 'below' : s === 'high' ? 'above' : s);
const ease = (t: number) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t));

export class EnergyLandscapeStage extends Stage3D {
  private overlay: HTMLElement;
  private layer = new THREE.Group();
  private axis = new THREE.Group();
  private levels: LevelObj[] = [];
  private arrows: ArrowObj[] = [];
  private bars: BarObj[] = [];
  private guides: GuideObj[] = [];
  private marks: { spec: Mark; tag: Tag }[] = [];
  private ticks: { v: number; mesh: THREE.Mesh; tag: Tag }[] = [];
  private unitTag: Tag;
  private lo = 0; private hi = 1;
  private loTo = 0; private hiTo = 1;
  private stepNow = 0;
  private sphere = new THREE.SphereGeometry(1, 18, 14);
  private cyl = new THREE.CylinderGeometry(1, 1, 1, 14);
  private cone = new THREE.ConeGeometry(1, 1, 18);
  private box = new THREE.BoxGeometry(1, 1, 1);
  private boxEdges = new THREE.EdgesGeometry(new THREE.BoxGeometry(1, 1, 1));
  private axisMat = new THREE.MeshBasicMaterial({ color: 0x9aa3bf });
  private v = new THREE.Vector3();
  private lastW = 0; private lastH = 0;
  private time = 0;
  private bob: boolean;

  constructor(host: HTMLElement, private compact = false) {
    super(host, { distance: 24, fov: 22, autoRotate: false, minDistance: 1, maxDistance: 400 });
    this.bob = !this.reducedMotion;
    this.controls.enableZoom = false;
    this.controls.rotateSpeed = 0.5;
    this.controls.minAzimuthAngle = -0.5; this.controls.maxAzimuthAngle = 0.5;
    this.controls.minPolarAngle = Math.PI / 2 - 0.5; this.controls.maxPolarAngle = Math.PI / 2 + 0.06;
    this.overlay = h('div', { class: 'nrg-tags', 'aria-hidden': 'true' });
    host.append(this.overlay);
    this.root.add(this.layer, this.axis);
    // the axis: a line with an arrowhead (energy grows upwards) and its unit
    const line = new THREE.Mesh(this.cyl, this.axisMat);
    line.scale.set(0.014, HEIGHT + 0.2, 0.014); line.position.set(AXIS_X, (HEIGHT + 0.2) / 2 - 0.1, 0);
    const tip = new THREE.Mesh(this.cone, this.axisMat);
    tip.scale.set(0.07, 0.2, 0.07); tip.position.set(AXIS_X, HEIGHT + 0.2, 0);
    this.axis.add(line, tip);
    this.unitTag = this.makeTag('left', 'axis unit', ['kJ/mol']);
    this.fit();
  }

  /** Draw a view; `animate` false jumps straight to it (reveals). */
  setView(view: EnergyView, animate = true) {
    const fast = !animate;
    // range and axis
    this.loTo = view.lo; this.hiTo = view.hi;
    if (fast || this.hi - this.lo <= 0 || this.levels.length + this.bars.length === 0) { this.lo = view.lo; this.hi = view.hi; }
    if (view.step !== this.stepNow || this.ticks.length === 0 || !this.ticksCover(view.lo, view.hi)) this.buildTicks(view.lo, view.hi, view.step);

    // levels: keep the ones with the same key and shape, add the new ones
    const old = new Map(this.levels.map((l) => [l.spec.key, l]));
    const next: LevelObj[] = [];
    for (const spec of view.levels) {
      const sig = this.levelSig(spec);
      const prev = old.get(spec.key);
      if (prev && prev.sig === sig) {
        prev.spec = spec;
        this.setTagText(prev.tag, spec.lines);
        next.push(prev); old.delete(spec.key);
      } else {
        const obj = this.buildLevel(spec, sig);
        if (fast) { obj.appear = 1; obj.dimNow = spec.dim ? 1 : 0; }
        next.push(obj);
      }
    }
    // atoms fly in from their source level (looked up before the old levels are removed)
    if (!fast) for (const obj of next) if (obj.appear === 0 && obj.spec.from) this.startFlight(obj, [...next, ...old.values()].find((l) => l.spec.key === obj.spec.from && l !== obj));
    for (const o of old.values()) this.dropLevel(o);
    this.levels = next;

    // arrows: same key keeps its object (values glide), new ones grow
    const oldA = new Map(this.arrows.map((a) => [a.spec.key, a]));
    this.arrows = view.arrows.map((spec) => {
      const prev = oldA.get(spec.key);
      if (prev && prev.spec.main === spec.main) {
        oldA.delete(spec.key);
        prev.spec = spec; this.setTagText(prev.tag, spec.lines); prev.tag.side = arrowSide(spec.tag); prev.tag.el.className = this.tagClass(arrowSide(spec.tag), this.arrowCls(spec));
        if (fast) { prev.e0 = spec.E0; prev.e1 = spec.E1; prev.grow = 1; }
        this.paintArrow(prev);
        return prev;
      }
      const a = this.buildArrow(spec);
      if (fast) a.grow = 1;
      return a;
    });
    for (const a of oldA.values()) this.dropArrow(a);

    // bars (Gibbs mode): values glide when the temperature changes
    const oldB = new Map(this.bars.map((b) => [b.spec.key, b]));
    this.bars = view.bars.map((spec) => {
      const prev = oldB.get(spec.key);
      if (prev) { oldB.delete(spec.key); prev.spec = spec; this.setTagText(prev.tag, spec.lines); if (fast) { prev.e0 = spec.E0; prev.e1 = spec.E1; } return prev; }
      const b = this.buildBar(spec);
      if (fast) b.appear = 1;
      return b;
    });
    for (const b of oldB.values()) this.dropBar(b);

    // guides and marks are cheap: rebuilt each time
    for (const g of this.guides) { this.layer.remove(g.line); g.line.geometry.dispose(); (g.line.material as THREE.Material).dispose(); }
    this.guides = view.guides.map((spec) => this.buildGuide(spec));
    for (const m of this.marks) m.tag.el.remove();
    this.marks = view.marks.map((spec) => ({ spec, tag: this.makeTag(spec.side, spec.cls ?? 'mark', spec.lines) }));

    this.setLabel(view.summary);
    this.place(0);
  }

  // ---------- building ----------

  private levelSig(s: Level) {
    return [s.x0, s.x1, s.z ?? 0, s.depth ?? 0, s.tone, s.tag, s.tagX ?? '', s.mols ? s.mols.map((m) => m.atoms.map((a) => a.el).join('')).join('|') : ''].join(';');
  }

  private buildLevel(spec: Level, sig: string): LevelObj {
    const group = new THREE.Group();
    const w = spec.x1 - spec.x0, d = spec.depth ?? 1.2, z = spec.z ?? 0, cx = (spec.x0 + spec.x1) / 2;
    const slabMat = new THREE.MeshStandardMaterial({ color: TONE[spec.tone], roughness: 0.8, metalness: 0.05, transparent: true, opacity: 0 });
    const slab = new THREE.Mesh(this.box, slabMat);
    slab.scale.set(w, 0.07, d); slab.position.set(cx, -0.035, z);
    const edgeMat = new THREE.LineBasicMaterial({ color: CHALK, transparent: true, opacity: 0 });
    const edge = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(spec.x0, 0.002, z + d / 2), new THREE.Vector3(spec.x1, 0.002, z + d / 2)]), edgeMat);
    group.add(slab, edge);
    const atomMats = new Map<string, THREE.MeshStandardMaterial>();
    const stickMat = new THREE.MeshStandardMaterial({ color: 0xb9b3a4, roughness: 0.5, transparent: true, opacity: 0 });
    const mols: LevelObj['mols'] = [], atoms: AtomObj[] = [];
    let top = 0.12;
    const list = spec.mols ?? [];
    if (list.length) {
      const usable = Math.max(0.4, w - 0.5), per = usable / list.length;
      const rows = per < 0.55 ? 2 : 1;
      const step = rows === 2 ? usable / Math.ceil(list.length / 2) : per;
      list.forEach((m, i) => {
        const g = new THREE.Group();
        const col = rows === 2 ? Math.floor(i / 2) : i, row = rows === 2 ? (i % 2 ? 1 : -1) : 0;
        let minY = 0, maxY = 0;
        for (const a of m.atoms) { minY = Math.min(minY, a.p[1] - atomR(a.el)); maxY = Math.max(maxY, a.p[1] + atomR(a.el)); }
        const lift = 0.04 - minY;
        g.position.set(cx - usable / 2 + step * (col + 0.5) + (rows === 2 && row > 0 ? step * 0.25 : 0), lift, z + row * 0.26);
        top = Math.max(top, lift + maxY);
        const base = (i * 1.3) % (Math.PI * 2) * 0.2;
        g.rotation.y = base;
        for (const a of m.atoms) {
          let mat = atomMats.get(a.el);
          if (!mat) { mat = new THREE.MeshStandardMaterial({ color: ATOM_COLOR[a.el] ?? 0xb8b2a6, roughness: 0.45, metalness: 0.05, transparent: true, opacity: 0 }); atomMats.set(a.el, mat); }
          const mesh = new THREE.Mesh(this.sphere, mat);
          const r = atomR(a.el);
          mesh.scale.set(r, r, r);
          mesh.position.set(...a.p);
          g.add(mesh);
          atoms.push({ mesh, home: mesh.position.clone(), start: null, el: a.el });
        }
        for (const [i0, i1, order] of m.bonds) this.addSticks(g, m.atoms[i0].p, m.atoms[i1].p, order, stickMat);
        group.add(g);
        mols.push({ g, base });
      });
    }
    this.layer.add(group);
    const tag = spec.tag === 'none' ? null : this.makeTag(spec.tag, 'level ' + spec.tone, spec.lines);
    return { spec, sig, group, slabMat, edgeMat, atomMats, stickMat, mols, atoms, top, appear: 0, flight: -1, dimNow: 0, tag };
  }

  private addSticks(g: THREE.Group, a: [number, number, number], b: [number, number, number], order: number, mat: THREE.Material) {
    const pa = new THREE.Vector3(...a), pb = new THREE.Vector3(...b);
    const dir = pb.clone().sub(pa), len = dir.length();
    dir.normalize();
    const perp = new THREE.Vector3().crossVectors(dir, Math.abs(dir.z) > 0.9 ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(0, 0, 1)).normalize();
    perp.cross(dir).normalize();
    const offs = order === 1 ? [0] : order === 2 ? [-0.042, 0.042] : [-0.06, 0, 0.06];
    const r = order === 1 ? 0.026 : 0.018;
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
    for (const o of offs) {
      const s = new THREE.Mesh(this.cyl, mat);
      s.scale.set(r, len, r);
      s.quaternion.copy(q);
      s.position.copy(pa).add(pb).multiplyScalar(0.5).addScaledVector(perp, o);
      g.add(s);
    }
  }

  /** Each atom of the new level starts where an atom of the same element sits in the source level. */
  private startFlight(obj: LevelObj, src: LevelObj | undefined) {
    if (!src || !obj.atoms.length || !src.atoms.length) return;
    this.layer.updateMatrixWorld(true);
    const pools = new Map<string, THREE.Vector3[]>();
    for (const a of src.atoms) {
      const p = a.mesh.getWorldPosition(new THREE.Vector3());
      if (!pools.has(a.el)) pools.set(a.el, []);
      pools.get(a.el)!.push(p);
    }
    // place the new level first, so world → local works
    obj.group.position.y = this.y(obj.spec.E);
    obj.group.updateMatrixWorld(true);
    for (const a of obj.atoms) {
      const p = pools.get(a.el)?.shift();
      if (p) a.start = (a.mesh.parent as THREE.Object3D).worldToLocal(p);
    }
    obj.flight = 0;
  }

  private buildArrow(spec: Arrow): ArrowObj {
    const mat = new THREE.MeshStandardMaterial({ color: UP, emissive: UP, emissiveIntensity: 0.3, roughness: 0.5, transparent: true });
    const shaft = new THREE.Mesh(this.cyl, mat), head = new THREE.Mesh(this.cone, mat);
    const group = new THREE.Group();
    group.add(shaft, head);
    group.position.set(spec.x, 0, FRONT);
    this.layer.add(group);
    const a: ArrowObj = { spec, group, shaft, head, mat, grow: 0, e0: spec.E0, e1: spec.E1, tag: this.makeTag(arrowSide(spec.tag), this.arrowCls(spec), spec.lines) };
    this.paintArrow(a);
    return a;
  }
  private arrowCls(a: Arrow) { return `arrow ${a.main ? 'main' : ''} ${a.cls ?? ''}`; }
  private paintArrow(a: ArrowObj) {
    const c = a.spec.E1 >= a.spec.E0 ? UP : DOWN;
    a.mat.color.setHex(c); a.mat.emissive.setHex(c);
    a.mat.emissiveIntensity = a.spec.main ? 0.45 : 0.25;
    a.tag.el.classList.toggle('up', a.spec.E1 > a.spec.E0);
    a.tag.el.classList.toggle('down', a.spec.E1 < a.spec.E0);
  }

  private buildBar(spec: Bar): BarObj {
    const mat = new THREE.MeshStandardMaterial({ color: UP, emissive: UP, emissiveIntensity: 0.2, roughness: 0.6, transparent: true, opacity: 0 });
    const mesh = new THREE.Mesh(this.box, mat);
    let edge: THREE.LineSegments | null = null;
    if (spec.main) { edge = new THREE.LineSegments(this.boxEdges, new THREE.LineBasicMaterial({ color: CHALK, transparent: true, opacity: 0 })); this.layer.add(edge); }
    this.layer.add(mesh);
    return { spec, mesh, mat, edge, e0: spec.E0, e1: spec.E1, appear: 0, tag: this.makeTag('above', spec.main ? 'barval main' : 'barval', spec.lines) };
  }

  private buildGuide(spec: Guide): GuideObj {
    const geo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(spec.x0, 0, FRONT - 0.02), new THREE.Vector3(spec.x1, 0, FRONT - 0.02)]);
    const line = new THREE.Line(geo, new THREE.LineDashedMaterial({ color: spec.measured ? 0xffc15e : 0x9aa3bf, dashSize: 0.09, gapSize: 0.07, transparent: true, opacity: spec.measured ? 1 : 0.75 }));
    line.computeLineDistances();
    this.layer.add(line);
    return { spec, line };
  }

  private ticksCover(lo: number, hi: number) {
    const vs = this.ticks.map((t) => t.v);
    return vs.length > 0 && Math.min(...vs) <= lo + this.stepNow && Math.max(...vs) >= hi - this.stepNow;
  }
  private buildTicks(lo: number, hi: number, step: number) {
    for (const t of this.ticks) { this.axis.remove(t.mesh); t.tag.el.remove(); }
    this.ticks = [];
    this.stepNow = step;
    if (!(step > 0)) return;
    for (let v = Math.ceil(lo / step - 1e-9) * step; v <= hi + 1e-9; v += step) {
      const val = Math.abs(v) < step * 1e-6 ? 0 : v;
      const mesh = new THREE.Mesh(this.box, this.axisMat);
      mesh.scale.set(val === 0 ? 0.26 : 0.16, 0.014, 0.014);
      this.axis.add(mesh);
      this.ticks.push({ v: val, mesh, tag: this.makeTag('left', val === 0 ? 'axis zero' : 'axis', [this.tickText(val, step)]) });
    }
  }
  private tickText(v: number, step: number) {
    const t = num(Math.abs(v), step < 1 ? 1 : 0);
    return v > 0 ? '+' + t : v < 0 ? '−' + t : '0';
  }

  // ---------- tags ----------

  private tagClass(side: TagSide, cls: string) { return `nrg-tag ${side} ${cls}`.trim(); }
  private makeTag(side: TagSide, cls: string, lines: string[]): Tag {
    const el = h('div', { class: this.tagClass(side, cls) });
    const tag: Tag = { el, side, text: '', tf: '', op: '' };
    this.setTagText(tag, lines);
    this.overlay.append(el);
    return tag;
  }
  private setTagText(tag: Tag | null, lines: string[]) {
    if (!tag) return;
    const text = lines.join('\n');
    if (text === tag.text) return;
    tag.text = text;
    tag.el.replaceChildren(...lines.filter((l) => l).map((l, i) => h(i ? 'span' : 'strong', null, l)));
  }
  private moveTag(tag: Tag | null, x: number, y: number, z: number, opacity: number) {
    if (!tag) return;
    this.v.set(x, y, z).project(this.camera);
    const W = this.host.clientWidth, H = this.host.clientHeight;
    const px = Math.round(((this.v.x + 1) / 2) * W), py = Math.round(((1 - this.v.y) / 2) * H);
    const tr = tag.side === 'above' ? 'translate(-50%,calc(-100% - 5px))' : tag.side === 'below' ? 'translate(-50%,5px)'
      : tag.side === 'left' ? 'translate(calc(-100% - 7px),-50%)' : 'translate(7px,-50%)';
    const tf = `translate(${px}px,${py}px) ${tr}`;
    if (tf !== tag.tf) { tag.tf = tf; tag.el.style.transform = tf; }
    const op = opacity >= 0.99 ? '' : opacity.toFixed(2);
    if (op !== tag.op) { tag.op = op; tag.el.style.opacity = op; }
  }

  // ---------- removal ----------

  private dropLevel(o: LevelObj) {
    this.layer.remove(o.group);
    o.slabMat.dispose(); o.edgeMat.dispose(); o.stickMat.dispose();
    o.atomMats.forEach((m) => m.dispose());
    o.group.traverse((x) => { if (x instanceof THREE.Line) x.geometry.dispose(); });
    o.tag?.el.remove();
  }
  private dropArrow(a: ArrowObj) { this.layer.remove(a.group); a.mat.dispose(); a.tag.el.remove(); }
  private dropBar(b: BarObj) {
    this.layer.remove(b.mesh); b.mat.dispose(); b.tag.el.remove();
    if (b.edge) { this.layer.remove(b.edge); (b.edge.material as THREE.Material).dispose(); }
  }

  // ---------- every frame ----------

  private y(E: number) { const span = this.hi - this.lo || 1; return ((E - this.lo) / span) * HEIGHT; }

  protected tick(dt: number, t: number) {
    this.time = t;
    if (this.host.clientWidth !== this.lastW || this.host.clientHeight !== this.lastH) this.fit();
    this.place(dt);
  }

  private place(dt: number) {
    const rm = this.reducedMotion;
    const k = 1 - Math.exp(-dt * (rm ? 30 : 7));
    this.lo += (this.loTo - this.lo) * k; this.hi += (this.hiTo - this.hi) * k;
    if (Math.abs(this.loTo - this.lo) < 1e-6 * (Math.abs(this.hiTo) + 1)) this.lo = this.loTo;
    if (Math.abs(this.hiTo - this.hi) < 1e-6 * (Math.abs(this.hiTo) + 1)) this.hi = this.hiTo;

    for (const tk of this.ticks) {
      const y = this.y(tk.v), inside = y >= -0.05 && y <= HEIGHT + 0.05;
      tk.mesh.position.set(AXIS_X, y, 0);
      tk.mesh.visible = inside;
      // the unit sits beside the arrowhead: a number right below it gives way
      this.moveTag(tk.tag, AXIS_X - 0.05, y, 0, inside && y < HEIGHT - 0.32 ? 1 : 0);
    }
    this.moveTag(this.unitTag, AXIS_X - 0.03, HEIGHT + 0.1, 0, 1);

    const tAppear = rm ? 0.15 : 0.5, tFly = rm ? 0.4 : 1.3, tGrow = rm ? 0.2 : 0.75;
    for (const o of this.levels) {
      o.appear = Math.min(1, o.appear + dt / tAppear);
      o.dimNow += ((o.spec.dim ? 1 : 0) - o.dimNow) * (1 - Math.exp(-dt * 4));
      const a = ease(o.appear);
      const y = this.y(o.spec.E);
      o.group.position.y = y;
      const base = o.spec.tone === 'atoms' ? 0.6 : o.spec.tone === 'floor' ? 0.4 : o.spec.tone === 'elements' ? 0.75 : 0.95;
      o.slabMat.opacity = a * base;
      o.edgeMat.opacity = a * 0.7;
      let molOp = a * (1 - 0.72 * o.dimNow), stickOp = molOp;
      if (o.flight >= 0) {
        o.flight = Math.min(1, o.flight + dt / tFly);
        const p = ease(o.flight);
        for (const at of o.atoms) {
          if (at.start) at.mesh.position.lerpVectors(at.start, at.home, p).y += Math.sin(Math.PI * p) * 0.25;
        }
        molOp = 1; stickOp = ease((o.flight - 0.7) / 0.3);
        if (o.flight >= 1) { for (const at of o.atoms) { at.mesh.position.copy(at.home); at.start = null; } o.flight = -1; }
      }
      o.atomMats.forEach((m) => { m.opacity = molOp; m.depthWrite = molOp > 0.9; });
      o.stickMat.opacity = stickOp;
      if (this.bob) o.mols.forEach((m, i) => { m.g.rotation.y = m.base + 0.35 * Math.sin(this.time * 0.45 + i * 1.7); });
      const d = o.spec.depth ?? 1.2, z = o.spec.z ?? 0;
      const tx = o.spec.tagX ?? (o.spec.x0 + o.spec.x1) / 2;
      if (o.tag) this.moveTag(o.tag, tx, y + (o.spec.tag === 'above' ? o.top + 0.04 : o.spec.tag === 'below' ? -0.08 : 0.05), z + d / 2, a);
    }

    for (const ar of this.arrows) {
      ar.grow = Math.min(1, ar.grow + dt / tGrow);
      ar.e0 += (ar.spec.E0 - ar.e0) * k; ar.e1 += (ar.spec.E1 - ar.e1) * k;
      const y0 = this.y(ar.e0), yFull = this.y(ar.e1);
      const g = ease(ar.grow), y1 = y0 + (yFull - y0) * g;
      const len = Math.abs(y1 - y0), dir = y1 >= y0 ? 1 : -1;
      const main = !!ar.spec.main;
      const r = main ? 0.055 : 0.036, hr = main ? 0.15 : 0.11, hl = Math.min(main ? 0.3 : 0.24, len * 0.6);
      ar.group.visible = len > 0.004;
      ar.group.position.x = ar.spec.x;
      ar.shaft.scale.set(r, Math.max(0.001, len - hl), r);
      ar.shaft.position.y = y0 + (dir * (len - hl)) / 2;
      ar.head.scale.set(hr, Math.max(0.001, hl), hr);
      ar.head.position.y = y1 - (dir * hl) / 2;
      ar.head.rotation.z = dir > 0 ? 0 : Math.PI;
      const mid = (y0 + yFull) / 2, lowY = Math.min(y0, yFull), highY = Math.max(y0, yFull);
      const s = ar.spec.tag;
      const ty = s === 'low' ? lowY - 0.08 : s === 'high' ? highY + 0.08 : mid;
      const tx = s === 'left' ? ar.spec.x - 0.1 : s === 'right' ? ar.spec.x + 0.1 : ar.spec.x;
      ar.tag.side = arrowSide(s);
      this.moveTag(ar.tag, tx, ty, FRONT, ease((ar.grow - 0.5) / 0.5));
    }

    for (const b of this.bars) {
      b.appear = Math.min(1, b.appear + dt / tAppear);
      b.e0 += (b.spec.E0 - b.e0) * k; b.e1 += (b.spec.E1 - b.e1) * k;
      const y0 = this.y(b.e0), y1 = this.y(b.e1), hgt = Math.max(0.004, Math.abs(y1 - y0));
      const c = b.spec.E1 >= b.spec.E0 ? UP : DOWN;
      b.mat.color.setHex(c); b.mat.emissive.setHex(c);
      b.mat.emissiveIntensity = b.spec.main ? 0.35 : 0.15;
      b.mat.opacity = ease(b.appear) * (b.spec.main ? 0.95 : 0.8);
      const depth = b.spec.main ? 0.9 : 0.7;
      b.mesh.scale.set(b.spec.w, hgt, depth);
      b.mesh.position.set(b.spec.x, (y0 + y1) / 2, 0);
      if (b.edge) { b.edge.scale.copy(b.mesh.scale); b.edge.position.copy(b.mesh.position); (b.edge.material as THREE.LineBasicMaterial).opacity = ease(b.appear) * 0.9; }
      const up = b.spec.E1 >= b.spec.E0;
      b.tag.side = up ? 'above' : 'below';
      b.tag.el.classList.toggle('above', up); b.tag.el.classList.toggle('below', !up);
      b.tag.el.classList.toggle('up', b.spec.E1 > b.spec.E0); b.tag.el.classList.toggle('down', b.spec.E1 < b.spec.E0);
      this.moveTag(b.tag, b.spec.x, up ? Math.max(y0, y1) + 0.06 : Math.min(y0, y1) - 0.06, depth / 2, ease(b.appear));
    }

    for (const g of this.guides) g.line.position.y = this.y(g.spec.E);
    for (const m of this.marks) this.moveTag(m.tag, m.spec.x, this.y(m.spec.E), FRONT, 1);
  }

  /** Fit the diagram into the stage below the heading and above the axis note, keeping the user's view angle. */
  private fit() {
    const W = this.host.clientWidth || 300, H = this.host.clientHeight || 300;
    this.lastW = W; this.lastH = H;
    const pad = this.compact ? { t: 64, b: 46, l: 2, r: 2 } : { t: 76, b: 62, l: 2, r: 2 };
    const bw = SPAN.x1 - SPAN.x0, bh = SPAN.y1 - SPAN.y0;
    const s = Math.max(bw / Math.max(60, W - pad.l - pad.r), bh / Math.max(60, H - pad.t - pad.b));
    const d = (H * s) / (2 * Math.tan(THREE.MathUtils.degToRad(this.camera.fov / 2)));
    const cx = (SPAN.x0 + SPAN.x1) / 2 - (pad.l + (W - pad.l - pad.r) / 2 - W / 2) * s;
    const cy = (SPAN.y0 + SPAN.y1) / 2 + (pad.t + (H - pad.t - pad.b) / 2 - H / 2) * s;
    const off = this.camera.position.clone().sub(this.controls.target);
    if (off.lengthSq() < 1e-6 || this.levels.length + this.bars.length === 0) off.set(0, Math.sin(0.13), Math.cos(0.13));
    off.normalize().multiplyScalar(d);
    this.controls.target.set(cx, cy, 0);
    this.camera.position.copy(this.controls.target).add(off);
    this.camera.near = Math.max(0.1, d - 20); this.camera.far = d + 40;
    this.camera.updateProjectionMatrix();
    this.controls.update();
  }

  dispose() {
    this.overlay.remove();
    this.sphere.dispose(); this.cyl.dispose(); this.cone.dispose(); this.box.dispose(); this.boxEdges.dispose(); this.axisMat.dispose();
    for (const o of this.levels) this.dropLevel(o);
    for (const a of this.arrows) this.dropArrow(a);
    for (const b of this.bars) this.dropBar(b);
    super.dispose();
  }
}
