// The Particle Box (units 8, 9 and 11): molecules of one substance in a see-through box, at a chosen temperature.
// The state on screen always follows the measured melting and boiling points (substances.ts); the motion is a
// model tuned to look right: Lennard-Jones attraction, a Langevin thermostat and weak gravity, so a liquid pools on
// the floor while a gas fills the box. Views overlay flickering electron clouds (dispersion), permanent dipoles
// that turn head to tail, or hydrogen bonds. Unit 11 pours a second substance into the water. Unit 19 adds the
// spreading view: gas particles behind a partition in the left half, counted once the partition is out.
import * as THREE from 'three';
import { Stage3D } from './stage';
import { SUBSTANCES, substance, WATER, type Substance } from '../content/substances';
import { CHARGE } from './workbench';

// ---------------------------------------------------------------------------------------------------------------
// Physics: positions only, no rendering. Reduced units; one scene unit is one length unit.

export type PhaseState = 'solid' | 'liquid' | 'gas';
export const HX = 2.7, HY = 3.1, HZ = 2.7;   // half sizes of the box
const FLOOR = -HY;

let spare: number | null = null;
function gauss(): number {
  if (spare !== null) { const s = spare; spare = null; return s; }
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  v = Math.random();
  const m = Math.sqrt(-2 * Math.log(u));
  spare = m * Math.sin(2 * Math.PI * v);
  return m * Math.cos(2 * Math.PI * v);
}

/** Particle physics for one box. Kinds index the pair tables (σ and ε). */
export class BoxSim {
  n = 0;
  readonly x: Float64Array; readonly y: Float64Array; readonly z: Float64Array;
  readonly vx: Float64Array; readonly vy: Float64Array; readonly vz: Float64Array;
  private fx: Float64Array; private fy: Float64Array; private fz: Float64Array;
  readonly kind: Uint8Array;
  /** target model temperature T* per particle */
  readonly ts: Float64Array;
  /** gravity factor per particle (a stand-in for density) */
  readonly gf: Float64Array;
  /** friction of the thermostat per particle */
  readonly gam: Float64Array;
  /** spring targets and spring constants (0 = free) */
  readonly sx: Float64Array; readonly sy: Float64Array; readonly sz: Float64Array; readonly sk: Float64Array;
  K = 1;
  sig = new Float64Array([0.8]);
  eps = new Float64Array([1]);
  g = 0.35;
  floorEps = 0.9;

  constructor(readonly cap: number) {
    const f = () => new Float64Array(cap);
    this.x = f(); this.y = f(); this.z = f(); this.vx = f(); this.vy = f(); this.vz = f();
    this.fx = f(); this.fy = f(); this.fz = f();
    this.kind = new Uint8Array(cap); this.ts = f(); this.gf = f(); this.gam = f();
    this.sx = f(); this.sy = f(); this.sz = f(); this.sk = f();
  }

  /** σ per kind (pair σ is the mean) and a symmetric ε table. */
  setKinds(sigma: number[], eps: number[][]) {
    const K = sigma.length;
    this.K = K;
    this.sig = new Float64Array(K * K);
    this.eps = new Float64Array(K * K);
    for (let a = 0; a < K; a++) for (let b = 0; b < K; b++) { this.sig[a * K + b] = (sigma[a] + sigma[b]) / 2; this.eps[a * K + b] = eps[a][b]; }
  }

  sigmaOf(k: number) { return this.sig[k * this.K + k]; }

  step(dt: number) {
    const { n, x, y, z, fx, fy, fz, kind, K, sig, eps, sk } = this;
    fx.fill(0, 0, n); fy.fill(0, 0, n); fz.fill(0, 0, n);
    for (let i = 0; i < n; i++) {
      const ki = kind[i] * K, bi = sk[i] > 0;
      const xi = x[i], yi = y[i], zi = z[i];
      for (let j = i + 1; j < n; j++) {
        if (bi && sk[j] > 0) continue;            // two particles held in a lattice ignore each other
        const e = eps[ki + kind[j]];
        if (e <= 0) continue;
        const s = sig[ki + kind[j]];
        const dx = xi - x[j], dy = yi - y[j], dz = zi - z[j];
        const r2 = dx * dx + dy * dy + dz * dz;
        const rc = 2.5 * s;
        if (r2 > rc * rc) continue;
        const s2 = (s * s) / Math.max(r2, 0.25 * s * s);
        const s6 = s2 * s2 * s2;
        let f = (24 * e * s6 * (2 * s6 - 1)) / Math.max(r2, 0.25 * s * s);   // F/r
        if (f > 400) f = 400;
        fx[i] += f * dx; fy[i] += f * dy; fz[i] += f * dz;
        fx[j] -= f * dx; fy[j] -= f * dy; fz[j] -= f * dz;
      }
    }
    const { vx, vy, vz, ts, gf, gam, sx, sy, sz, g, floorEps } = this;
    for (let i = 0; i < n; i++) {
      const s = this.sig[kind[i] * K + kind[i]], hs = s / 2;
      // springs (lattice sites)
      if (sk[i] > 0) { fx[i] -= sk[i] * (x[i] - sx[i]); fy[i] -= sk[i] * (y[i] - sy[i]); fz[i] -= sk[i] * (z[i] - sz[i]); }
      else fy[i] -= g * gf[i];
      // soft walls
      const wx = HX - hs, wy = HY - hs, wz = HZ - hs;
      if (x[i] > wx) fx[i] -= 80 * (x[i] - wx); else if (x[i] < -wx) fx[i] -= 80 * (x[i] + wx);
      if (y[i] > wy) fy[i] -= 80 * (y[i] - wy); else if (y[i] < -wy) fy[i] -= 80 * (y[i] + wy);
      if (z[i] > wz) fz[i] -= 80 * (z[i] - wz); else if (z[i] < -wz) fz[i] -= 80 * (z[i] + wz);
      // a weakly attractive floor lets a liquid spread out into a pool
      if (sk[i] === 0 && floorEps > 0) {
        const hgt = Math.max(0.55 * s, y[i] - FLOOR);
        if (hgt < 2.2 * s) {
          const q = s / hgt;
          fy[i] += floorEps * ((9 * 2) / 15 * Math.pow(q, 9) - 3 * q * q * q) / hgt;
        }
      }
      // Langevin thermostat (unit mass)
      const gm = gam[i];
      const kick = Math.sqrt(2 * gm * ts[i] * dt);
      vx[i] += fx[i] * dt - gm * vx[i] * dt + kick * gauss();
      vy[i] += fy[i] * dt - gm * vy[i] * dt + kick * gauss();
      vz[i] += fz[i] * dt - gm * vz[i] * dt + kick * gauss();
      const v2 = vx[i] * vx[i] + vy[i] * vy[i] + vz[i] * vz[i];
      if (v2 > 64) { const c = 8 / Math.sqrt(v2); vx[i] *= c; vy[i] *= c; vz[i] *= c; }
      x[i] += vx[i] * dt; y[i] += vy[i] * dt; z[i] += vz[i] * dt;
    }
  }
}

// ---------------------------------------------------------------------------------------------------------------
// Real states and the model temperature

/** The nonpolar twin of similar size and shape, for the "switch off the dipole" what-if. */
export const TWIN: Record<string, string> = { CH3COCH3: 'C4H10', CH3CHO: 'C3H8', CH3OCH3: 'C3H8' };

export interface Points { mp: number | null; bp: number | null; sublimes?: number }
export const pointsOf = (s: Substance, off = false): Points => {
  const t = off && TWIN[s.id] ? substance(TWIN[s.id]) : s;
  return { mp: t.mp, bp: t.bp, sublimes: t.sublimes };
};

export function stateAt(p: Points, T: number): PhaseState {
  if (p.bp === null && p.sublimes !== undefined) return T < p.sublimes ? 'solid' : 'gas';
  if (p.bp !== null && T >= p.bp) return 'gas';
  if (p.mp !== null && T < p.mp) return 'solid';
  return 'liquid';
}

/** Model temperature T* for a substance at T °C: solid 0.06–0.36, liquid 0.55–0.85, gas 1.6–3. */
export function modelT(p: Points, T: number): number {
  const st = stateAt(p, T);
  const clamp = (v: number) => Math.max(0, Math.min(1, v));
  if (st === 'solid') {
    const top = p.mp ?? p.sublimes ?? T;
    return 0.06 + 0.3 * clamp((T - (top - 120)) / 120);
  }
  if (st === 'liquid') {
    const bp = p.bp ?? T + 1, mp = p.mp ?? bp - 4;
    return 0.55 + 0.3 * clamp((T - mp) / Math.max(1, bp - mp));
  }
  const bp = p.bp ?? p.sublimes ?? T;
  return 1.6 + 1.4 * clamp((T - bp) / 250);
}

// ---------------------------------------------------------------------------------------------------------------
// How molecules look: beads in the molecule's own frame (+y points to the δ− end).

export interface Bead { p: [number, number, number]; r: number; color: number; q: number; }
const C = { H: 0xe9e3d3, C: 0x8a90a6, N: 0x93a6c9, O: 0xd2bfa6, halogen: 0xb7c99a, noble: 0xc9c3e6, neutral: 0xb9b4c8 };
const HALO_COLOR: Record<string, number> = { F2: 0xb2d6bf, Cl2: 0x9fc79a, Br2: 0xa98377, I2: 0x8c6f9e };

/** Size of one molecule (radius in box units), grows slowly with the electron count. */
export const radiusOf = (s: Substance) => 0.37 + 0.035 * Math.cbrt(s.electrons);
/** The model's particle diameter: a little smaller than the drawing, so neighbours just touch. */
const sigmaOf = (s: Substance) => 2 * radiusOf(s) * 0.85;

export function beadsOf(s: Substance): Bead[] {
  const R = radiusOf(s);
  const halogenEnd = ['HF', 'HCl', 'HBr', 'HI'].includes(s.id);
  switch (s.look) {
    case 'ball':
      return [{ p: [0, 0, 0], r: R, color: s.id.length <= 2 ? C.noble : C.neutral, q: 0 }];
    case 'pair':
      if (s.id === 'CO2') return [
        { p: [0, 0, 0], r: 0.5 * R, color: C.C, q: 0.8 },
        { p: [0, 0.62 * R, 0], r: 0.52 * R, color: C.O, q: -0.7 },
        { p: [0, -0.62 * R, 0], r: 0.52 * R, color: C.O, q: -0.7 },
      ];
      return [-1, 1].map((sg) => ({ p: [0, sg * 0.42 * R, 0] as [number, number, number], r: 0.68 * R, color: HALO_COLOR[s.id] ?? C.halogen, q: 0 }));
    case 'chain': {
      const n = Math.max(2, s.chain ?? 2), rb = 0.4 * R, len = R * (0.9 + 0.2 * n);
      const st = (len - 2 * rb) / (n - 1);
      return Array.from({ length: n }, (_, k) => ({ p: [(k % 2 ? 1 : -1) * 0.14 * R, (k - (n - 1) / 2) * st, 0] as [number, number, number], r: rb, color: C.C, q: 0 }));
    }
    case 'branched': {
      const d = 0.5 * R, t = [[1, 1, 1], [1, -1, -1], [-1, 1, -1], [-1, -1, 1]];
      return [{ p: [0, 0, 0], r: 0.46 * R, color: C.C, q: 0 }, ...t.map((v) => ({ p: v.map((c) => (c * d) / Math.sqrt(3)) as [number, number, number], r: 0.42 * R, color: C.C, q: 0 }))];
    }
    case 'water': {
      const a = (104.5 / 2) * (Math.PI / 180), d = 0.62 * R;
      return [
        { p: [0, 0.08 * R, 0], r: 0.7 * R, color: C.O, q: -0.6 },
        { p: [Math.sin(a) * d, 0.08 * R - Math.cos(a) * d, 0], r: 0.4 * R, color: C.H, q: 0.75 },
        { p: [-Math.sin(a) * d, 0.08 * R - Math.cos(a) * d, 0], r: 0.4 * R, color: C.H, q: 0.75 },
      ];
    }
    case 'polar': {
      const k = Math.min(1, s.dipole / 2.9);
      // H–X: a neutral body, so the δ tint (stronger for a larger dipole) reads clearly
      if (halogenEnd) return [
        { p: [0, 0.16 * R, 0], r: 0.74 * R, color: C.neutral, q: -0.2 - 0.8 * k },
        { p: [0, -0.58 * R, 0], r: 0.36 * R, color: C.H, q: 0.2 + 0.8 * k },
      ];
      if (s.chain && s.donors > 0) {
        // an alcohol: a nonpolar carbon chain with a polar O–H head
        const n = s.chain, rb = 0.42 * R, st = 0.5 * R;
        const chain = Array.from({ length: n }, (_, i) => ({ p: [(i % 2 ? 1 : -1) * 0.12 * R, -0.3 * R - i * st, 0] as [number, number, number], r: rb, color: C.C, q: 0 }));
        return [{ p: [0, 0.32 * R, 0], r: 0.5 * R, color: C.O, q: -0.6 }, { p: [0.36 * R, 0.62 * R, 0], r: 0.28 * R, color: C.H, q: 0.7 }, ...chain];
      }
      return [
        { p: [0, 0.3 * R, 0], r: 0.62 * R, color: /O/.test(s.formula) ? C.O : /N/.test(s.formula) ? C.N : C.neutral, q: -0.3 - 0.6 * k },
        { p: [0, -0.42 * R, 0], r: 0.54 * R, color: C.neutral, q: 0.3 + 0.6 * k },
      ];
    }
    case 'ion':
      return [{ p: [0, 0, 0], r: R, color: C.neutral, q: 0 }];
  }
}

/** The beads' extent along the molecule's axis, used to scale the cloud tint. */
const extentOf = (beads: Bead[]) => Math.max(...beads.map((b) => Math.hypot(...b.p) + b.r));

// ---------------------------------------------------------------------------------------------------------------
// Lattices

/** A compact simple-cubic block of n sites standing on the floor, spacing a. */
function blockSites(n: number, a: number): THREE.Vector3[] {
  const side = Math.max(2, Math.ceil(Math.cbrt(n)));
  let nx = side, nz = side, ny = Math.ceil(n / (nx * nz));
  while (ny * a > 2 * HY - 0.4 && nx * a < 2 * HX - 0.6) { nx++; nz++; ny = Math.ceil(n / (nx * nz)); }
  const out: THREE.Vector3[] = [];
  for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) for (let k = 0; k < nz; k++)
    out.push(new THREE.Vector3((i - (nx - 1) / 2) * a, FLOOR + a * 0.55 + j * a, (k - (nz - 1) / 2) * a));
  return out.slice(0, n);
}

/** Ice: an open tetrahedral network (diamond-like), each molecule with four neighbours. Returns sites and the
 * directions of each molecule's two hydrogens (along two of its four bonds, so every bond carries one H). */
export function iceSites(n: number, d: number, centre = new THREE.Vector3(0, 0, 0), flat = 1.6): { p: THREE.Vector3[]; h: [THREE.Vector3, THREE.Vector3][] } {
  const a = (4 * d) / Math.sqrt(3);
  const fcc = [[0, 0, 0], [0, 0.5, 0.5], [0.5, 0, 0.5], [0.5, 0.5, 0]];
  const v = [new THREE.Vector3(1, 1, 1), new THREE.Vector3(1, -1, -1), new THREE.Vector3(-1, 1, -1), new THREE.Vector3(-1, -1, 1)].map((x) => x.normalize());
  const pts: { p: THREE.Vector3; A: boolean }[] = [];
  const m = 3;
  for (let i = -m; i < m; i++) for (let j = -m; j < m; j++) for (let k = -m; k < m; k++) for (const f of fcc) {
    const base = new THREE.Vector3(i + f[0], j + f[1], k + f[2]).multiplyScalar(a);
    pts.push({ p: base.clone(), A: true });
    pts.push({ p: base.clone().addScalar(a / 4), A: false });
  }
  // the n points nearest to the centre, slightly flattened so the block sits low and wide
  pts.sort((p, q) => p.p.x ** 2 + flat * p.p.y ** 2 + p.p.z ** 2 - (q.p.x ** 2 + flat * q.p.y ** 2 + q.p.z ** 2));
  const chosen = pts.slice(0, n);
  const minY = Math.min(...chosen.map((c) => c.p.y));
  return {
    p: chosen.map((c) => c.p.clone().add(centre).setY(c.p.y - minY + centre.y)),
    h: chosen.map((c) => (c.A ? [v[0].clone(), v[1].clone()] : [v[2].clone().negate(), v[3].clone().negate()]) as [THREE.Vector3, THREE.Vector3]),
  };
}

// ---------------------------------------------------------------------------------------------------------------
// One box: simulation plus drawing

export type MixId = 'C6H14' | 'C2H5OH' | 'CH3OH' | 'CH3COCH3' | 'C4H9OH' | 'C6H13OH' | 'NaCl' | 'ice';
export const MIXES: MixId[] = ['C6H14', 'C2H5OH', 'CH3OH', 'CH3COCH3', 'C4H9OH', 'C6H13OH', 'NaCl', 'ice'];
export type View = 'plain' | 'clouds' | 'dipoles' | 'hbonds';

interface Mol {
  role: 'main' | 'B' | 'cation' | 'anion' | 'ice';
  sub: Substance;
  beads: Bead[];
  first: number;          // first instance index
  ext: number;
  q: THREE.Quaternion;
  axis: THREE.Vector3;    // current axis (+y of the molecule frame in the box)
  cloud: THREE.Vector3;   // fluctuating dipole (clouds view)
  alpha: number;          // how strongly its cloud flickers (more electrons, more)
  mu: number;             // permanent dipole, 0–1
  dissolved: boolean;     // second substance mixed into the water
  hTarget?: [THREE.Vector3, THREE.Vector3];  // ice: hydrogen directions
  hb: number;             // hydrogen bonds drawn this frame
  gf: number;             // gravity factor as a liquid (a stand-in for density)
}

const UP = new THREE.Vector3(0, 1, 0);
const tmpQ = new THREE.Quaternion(), tmpQ2 = new THREE.Quaternion(), tmpV = new THREE.Vector3(), tmpW = new THREE.Vector3(), tmpM = new THREE.Matrix4(), tmpS = new THREE.Vector3();
const MAIN_N = 52, COMPACT_N = 42;
const DOTS = 4;

export interface BoxInfo { id: string; state: PhaseState; mix: MixId | null; dissolved: number; total: number; hbAvg: number | null; }

export class ParticleBox {
  readonly group = new THREE.Group();
  sub: Substance;
  mix: MixId | null = null;
  temp = 20;
  dipoleOff = false;
  state: PhaseState = 'gas';
  private sim: BoxSim;
  private mols: Mol[] = [];
  private mesh: THREE.InstancedMesh | null = null;
  private aCenter!: THREE.InstancedBufferAttribute;
  private aDip!: THREE.InstancedBufferAttribute;
  private aQ!: THREE.InstancedBufferAttribute;
  private mat: THREE.MeshStandardMaterial;
  private uQGain = { value: 0.35 };
  private hbLines: THREE.LineSegments;
  private hbPos: Float32Array;
  private hbDist: Float32Array;
  private hbDots: THREE.InstancedMesh;
  private ionLabels = new THREE.Group();
  private spring = 1;          // 0–1 ramp for freezing
  private releaseAt = 0;       // next NaCl ion to leave the crystal (time)
  private iceBlock: { ids: number[]; offsets: THREE.Vector3[]; height: number } | null = null;
  /** a faint cube around the floating ice, so the piece reads as one block */
  private iceCube: THREE.Group;
  private clock = 0;
  /** seconds of extra gravity after a gas cools into a liquid, so it rains down into a pool */
  private condense = 0;
  private surface = FLOOR + 2;
  private surfaceAge = 0;
  private liquidY = new Float64Array(140);
  private capD = new Int8Array(140);
  private capA = new Int8Array(140);
  private pairI = new Int16Array(4000);
  private pairJ = new Int16Array(4000);
  private pairD = new Float64Array(4000);
  private pairOrder = new Int32Array(4000);
  private baseG = 0.35;
  view: View = 'plain';
  hbAvg: number | null = null;

  constructor(private readonly opts: { compact: boolean; reducedMotion: boolean; label: (t: string, size: number, color: string) => THREE.Sprite }) {
    this.sim = new BoxSim(140);
    this.sub = substance('Ar');
    // the box: edges and a faint floor
    const edges = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(2 * HX, 2 * HY, 2 * HZ)), new THREE.LineBasicMaterial({ color: 0x9aa3bf, transparent: true, opacity: 0.45 }));
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(2 * HX, 2 * HZ), new THREE.MeshBasicMaterial({ color: 0x9aa3bf, transparent: true, opacity: 0.13, side: THREE.DoubleSide, depthWrite: false }));
    floor.rotation.x = -Math.PI / 2; floor.position.y = FLOOR + 0.002;
    this.group.add(edges, floor, this.ionLabels);
    this.mat = this.makeMaterial();
    this.hbPos = new Float32Array(140 * 4 * 3);
    this.hbDist = new Float32Array(140 * 4);
    const hg = new THREE.BufferGeometry();
    hg.setAttribute('position', new THREE.BufferAttribute(this.hbPos, 3));
    hg.setAttribute('lineDistance', new THREE.BufferAttribute(this.hbDist, 1));
    this.hbLines = new THREE.LineSegments(hg, new THREE.LineDashedMaterial({ color: 0xd9c8ff, dashSize: 0.09, gapSize: 0.07, transparent: true, opacity: 0.5 }));
    this.hbLines.frustumCulled = false;
    // lines are one pixel wide on most phones, so each hydrogen bond is also drawn as a row of small dots
    this.hbDots = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 8, 6), new THREE.MeshBasicMaterial({ color: 0xe6dbff }), 140 * 4 * DOTS);
    this.hbDots.frustumCulled = false;
    this.hbDots.count = 0;
    this.group.add(this.hbLines, this.hbDots);
    this.iceCube = new THREE.Group();
    this.iceCube.visible = false;
    this.group.add(this.iceCube);
  }

  private makeMaterial() {
    const m = new THREE.MeshStandardMaterial({ roughness: 0.55, metalness: 0.02 });
    const minus = new THREE.Color(CHARGE.minus), plus = new THREE.Color(CHARGE.plus);
    m.onBeforeCompile = (sh) => {
      sh.uniforms.uMinus = { value: minus };
      sh.uniforms.uPlus = { value: plus };
      sh.uniforms.uQGain = this.uQGain;
      sh.vertexShader = sh.vertexShader
        .replace('#include <common>', '#include <common>\nattribute vec4 aCenter;\nattribute vec4 aDip;\nattribute float aQ;\nvarying vec3 vRel;\nvarying vec4 vDip;\nvarying float vQ;\nvarying float vExt;')
        .replace('#include <project_vertex>', '#include <project_vertex>\nvec4 pbLocal = instanceMatrix * vec4(transformed, 1.0);\nvRel = pbLocal.xyz - aCenter.xyz;\nvExt = aCenter.w;\nvDip = aDip;\nvQ = aQ;');
      sh.fragmentShader = sh.fragmentShader
        .replace('#include <common>', '#include <common>\nuniform vec3 uMinus;\nuniform vec3 uPlus;\nuniform float uQGain;\nvarying vec3 vRel;\nvarying vec4 vDip;\nvarying float vQ;\nvarying float vExt;')
        .replace('#include <color_fragment>', '#include <color_fragment>\nfloat pbSide = clamp(dot(vRel, vDip.xyz) / max(vExt, 0.001), -1.0, 1.0) * vDip.w - vQ * uQGain;\nfloat pbA = clamp(abs(pbSide), 0.0, 1.0) * 0.88;\ndiffuseColor.rgb = mix(diffuseColor.rgb, pbSide > 0.0 ? uMinus : uPlus, pbA);');
    };
    m.customProgramCacheKey = () => 'particle-box';
    return m;
  }

  get points(): Points { return pointsOf(this.sub, this.dipoleOff); }

  /** Load a substance (and optionally a second one poured into water). */
  load(id: string, mix: MixId | null = null) {
    this.sub = substance(id);
    this.mix = id === 'H2O' ? mix : null;
    this.dipoleOff = this.dipoleOff && !!TWIN[id];
    this.build();
  }

  setTemp(T: number) {
    this.temp = T;
    this.applyState(false);
  }

  setDipoleOff(off: boolean) {
    this.dipoleOff = off && !!TWIN[this.sub.id];
    this.applyState(false);
  }

  setView(v: View) {
    this.view = v;
    this.uQGain.value = v === 'dipoles' ? 1.0 : v === 'hbonds' ? 0.6 : 0.35;
    this.hbLines.visible = v === 'hbonds';
    this.hbDots.visible = v === 'hbonds';
    if (v !== 'clouds') for (const m of this.mols) m.cloud.set(0, 0, 0);
  }

  /** What the box holds now. */
  info(): BoxInfo {
    const b = this.mols.filter((m) => m.role === 'B');
    const ions = this.mols.filter((m) => m.role === 'cation' || m.role === 'anion');
    const total = this.mix === 'NaCl' ? ions.length : b.length;
    const dissolved = this.mix === 'NaCl' ? ions.filter((m) => m.dissolved).length : b.filter((m) => m.dissolved).length;
    return { id: this.sub.id, state: this.state, mix: this.mix, dissolved, total, hbAvg: this.hbAvg };
  }

  // ---------- building ----------

  private build() {
    const sim = this.sim;
    if (this.mesh) { this.group.remove(this.mesh); this.mesh.geometry.dispose(); this.mesh = null; }
    for (const l of [...this.ionLabels.children]) { this.ionLabels.remove(l); (l as THREE.Sprite).material.dispose(); }
    this.mols = [];
    this.iceBlock = null;
    for (const c of [...this.iceCube.children]) { this.iceCube.remove(c); (c as THREE.Mesh).geometry.dispose(); ((c as THREE.Mesh).material as THREE.Material).dispose(); }
    this.hbAvg = null;
    const main = this.sub;
    const sMain = sigmaOf(main);
    const N = this.opts.compact ? COMPACT_N : MAIN_N;
    const add = (role: Mol['role'], sub: Substance, kind: number, gfac: number, beads: Bead[]) => {
      const i = sim.n++;
      sim.kind[i] = kind; sim.gf[i] = gfac; sim.sk[i] = 0; sim.gam[i] = 1.5;
      sim.vx[i] = sim.vy[i] = sim.vz[i] = 0;
      const e = sub.electrons;
      this.mols.push({
        role, sub, beads, first: 0, ext: extentOf(beads), q: new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(Math.random(), Math.random(), Math.random()).normalize(), Math.random() * 6.28),
        axis: new THREE.Vector3(0, 1, 0), cloud: new THREE.Vector3(), alpha: Math.min(1.3, 0.25 + Math.pow(e / 54, 0.6)), mu: Math.min(1, sub.dipole / 2.9),
        dissolved: false, hb: 0, gf: gfac,
      });
    };
    sim.n = 0;
    if (!this.mix) {
      sim.setKinds([sMain], [[1]]);
      sim.g = this.baseG = 0.5;
      for (let k = 0; k < N; k++) add('main', main, 0, 1, beadsOf(main));
    } else if (this.mix === 'NaCl') {
      // water, Na⁺, Cl⁻: water attracts the ions strongly once they are free; free ions barely attract each other
      const sNa = 0.62, sCl = 0.86;
      sim.setKinds([sMain, sNa, sCl], [[1, 2.4, 2.4], [2.4, 0.08, 0.08], [2.4, 0.08, 0.08]]);
      sim.g = this.baseG = 0.45;
      const nW = this.opts.compact ? 46 : 58;
      for (let k = 0; k < nW; k++) add('main', main, 0, 1, beadsOf(main));
      const a = (sNa + sCl) / 2 * 1.02;
      for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) for (let k = 0; k < 3; k++) {
        const cat = (i + j + k) % 2 === 0;
        const ion: Substance = { ...main, id: cat ? 'Na+' : 'Cl-', look: 'ion', electrons: cat ? 10 : 18, dipole: 0 };
        add(cat ? 'cation' : 'anion', ion, cat ? 1 : 2, 1.1, [{ p: [0, 0, 0], r: (cat ? sNa : sCl) * 0.5, color: cat ? CHARGE.plus : CHARGE.minus, q: 0 }]);
        const idx = sim.n - 1;
        sim.sx[idx] = (i - 1) * a; sim.sy[idx] = FLOOR + a * 0.6 + j * a; sim.sz[idx] = (k - 1) * a;
        sim.sk[idx] = 50;
        const lab = this.opts.label(cat ? '+' : '−', 0.32, '#ffffff');
        lab.userData.mol = this.mols.length - 1;
        this.ionLabels.add(lab);
      }
      this.releaseAt = this.clock + 1.2;
    } else if (this.mix === 'ice') {
      sim.setKinds([sMain, sMain], [[1, 0.3], [0.3, 0.2]]);
      sim.g = this.baseG = 0.45;
      const nIce = 10, nW = (this.opts.compact ? 60 : 72);
      for (let k = 0; k < nW; k++) add('main', main, 0, 1, beadsOf(main));
      const ice = iceSites(nIce, sMain * 1.25, new THREE.Vector3(0, 0, 0), 4);
      const cy = (Math.min(...ice.p.map((p) => p.y)) + Math.max(...ice.p.map((p) => p.y))) / 2;
      const ids: number[] = [], offsets: THREE.Vector3[] = [];
      ice.p.forEach((p, k) => {
        add('ice', main, 1, 0, beadsOf(main).map((bd) => ({ ...bd, color: bd.q < 0 ? 0xf0e6d8 : 0xffffff })));
        const idx = sim.n - 1;
        this.mols[idx].hTarget = ice.h[k];
        sim.sk[idx] = 60;
        ids.push(idx); offsets.push(new THREE.Vector3(p.x, p.y - cy, p.z));
      });
      this.iceBlock = { ids, offsets, height: Math.max(...ice.p.map((p) => p.y)) - Math.min(...ice.p.map((p) => p.y)) + sMain };
      const span = (f: (p: THREE.Vector3) => number) => Math.max(...ice.p.map(f)) - Math.min(...ice.p.map(f)) + sMain;
      const cubeGeo = new THREE.BoxGeometry(span((p) => p.x), this.iceBlock.height, span((p) => p.z));
      this.iceCube.add(new THREE.Mesh(cubeGeo, new THREE.MeshBasicMaterial({ color: 0xdff0ff, transparent: true, opacity: 0.1, depthWrite: false })),
        new THREE.LineSegments(new THREE.EdgesGeometry(cubeGeo), new THREE.LineBasicMaterial({ color: 0xdff0ff, transparent: true, opacity: 0.55 })));
    } else {
      // water and a second liquid; how many of its molecules dissolve follows the measured solubility
      const B = substance(this.mix);
      const sB = sigmaOf(B);
      sim.setKinds([sMain, sB, sB], [[1, 0.28, 1.0], [0.28, 0.8, 0.5], [1.0, 0.5, 0.5]]);
      sim.g = this.baseG = 0.6;
      const nW = this.opts.compact ? 34 : 40, nB = this.opts.compact ? 26 : 32;
      for (let k = 0; k < nW; k++) add('main', main, 0, 1, beadsOf(main));
      const sol = B.solubility ?? 0;
      // molecules of B per water molecule at saturation: (g B / M_B) / (100 g / M_water)
      const ratio = sol === Infinity ? Infinity : (sol / B.M) / (100 / main.M);
      const nDiss = ratio === Infinity ? nB : Math.min(nB, Math.round(nW * ratio));
      const density = B.density ?? 0.8;
      for (let k = 0; k < nB; k++) {
        const diss = k < nDiss;
        add('B', B, diss ? 2 : 1, diss ? 1 : density * 0.7, beadsOf(B));
        this.mols[sim.n - 1].dissolved = diss;
      }
    }
    // instanced beads
    let count = 0;
    for (const m of this.mols) { m.first = count; count += m.beads.length; }
    const geo = new THREE.SphereGeometry(1, this.opts.compact ? 14 : 18, this.opts.compact ? 10 : 12);
    this.aCenter = new THREE.InstancedBufferAttribute(new Float32Array(count * 4), 4);
    this.aDip = new THREE.InstancedBufferAttribute(new Float32Array(count * 4), 4);
    this.aQ = new THREE.InstancedBufferAttribute(new Float32Array(count), 1);
    this.aCenter.setUsage(THREE.DynamicDrawUsage); this.aDip.setUsage(THREE.DynamicDrawUsage);
    geo.setAttribute('aCenter', this.aCenter); geo.setAttribute('aDip', this.aDip); geo.setAttribute('aQ', this.aQ);
    this.mesh = new THREE.InstancedMesh(geo, this.mat, count);
    this.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.mesh.frustumCulled = false;
    const col = new THREE.Color();
    for (const m of this.mols) m.beads.forEach((b, k) => { this.mesh!.setColorAt(m.first + k, col.setHex(b.color)); this.aQ.setX(m.first + k, b.q); });
    this.aQ.needsUpdate = true;
    this.group.add(this.mesh);
    this.applyState(true);
  }

  // ---------- states ----------

  /** Water's state rules a mixture; a pure box follows its own substance. */
  private stateOf(sub: Substance, T: number) { return stateAt(sub === this.sub ? this.points : pointsOf(sub), T); }

  private applyState(fresh: boolean) {
    const sim = this.sim, T = this.temp;
    const prev = this.state;
    this.state = this.stateOf(this.sub, T);
    if (!fresh && prev === 'gas' && this.state === 'liquid') this.condense = 2.5;
    const tMain = modelT(this.points, T);
    const solidMain = this.state === 'solid';
    // target temperatures
    for (let i = 0; i < sim.n; i++) {
      const m = this.mols[i];
      let ts = tMain;
      // a second liquid on its own, at its own model temperature (scaled to its weaker self-attraction)
      if (m.role === 'B' && !m.dissolved) ts = modelT(pointsOf(m.sub), T) * (sim.eps[sim.kind[i] * sim.K + sim.kind[i]] || 1);
      if (m.role === 'ice') ts = 0.08;
      sim.ts[i] = ts;
      sim.gam[i] = ts > 1.2 ? 0.6 : 1.6;
      // a gas fills the whole box: gravity is almost nothing against its motion
      sim.gf[i] = ts > 1.2 ? 0.12 * m.gf : m.gf;
    }
    // freezing and melting of the main substance
    const mainIdx = this.mols.map((m, i) => (m.role === 'main' ? i : -1)).filter((i) => i >= 0);
    if (this.iceBlock && !fresh && T > 0.5) {
      // the floating block melts: its molecules join the liquid
      for (const i of this.iceBlock.ids) { sim.sk[i] = 0; sim.kind[i] = 0; sim.gf[i] = 1; this.mols[i].gf = 1; this.mols[i].role = 'main'; this.mols[i].hTarget = undefined; }
      this.iceBlock = null;
    }
    if (solidMain) {
      if (fresh || prev !== 'solid') this.freeze(this.mols.map((m, i) => (m.role === 'main' || m.role === 'ice' ? i : -1)).filter((i) => i >= 0), fresh);
    } else {
      for (const i of mainIdx) sim.sk[i] = 0;
      for (const m of this.mols) if (m.role === 'main') m.hTarget = undefined;
      // B molecules that are solid at this temperature (hexanol near −45 °C …) simply stay liquid in the model
      if (fresh) this.scatter();
    }
    // ions: bound until released by the water
    if (this.mix === 'NaCl') for (let i = 0; i < sim.n; i++) {
      const m = this.mols[i];
      if ((m.role === 'cation' || m.role === 'anion') && !m.dissolved) sim.sk[i] = 50;
    }
    if (fresh) for (let k = 0, steps = sim.n > 70 ? 110 : 160; k < steps; k++) this.physics(0.008, true);
  }

  /** Put free molecules where their state would have them: a liquid as a layer on the floor (water and anything
   * dissolved in it first, then a floating liquid on top), a gas anywhere in the box. */
  private scatter() {
    const sim = this.sim;
    const liquid: number[] = [], floating: number[] = [];
    for (let i = 0; i < sim.n; i++) {
      if (sim.sk[i] > 0) { sim.x[i] = sim.sx[i]; sim.y[i] = sim.sy[i]; sim.z[i] = sim.sz[i]; continue; }
      sim.vx[i] = sim.vy[i] = sim.vz[i] = 0;
      const m = this.mols[i];
      const s = sim.sigmaOf(sim.kind[i]);
      if (sim.ts[i] > 1.2) {
        sim.x[i] = (Math.random() * 2 - 1) * (HX - s);
        sim.z[i] = (Math.random() * 2 - 1) * (HZ - s);
        sim.y[i] = FLOOR + s / 2 + Math.random() * (2 * HY - s);
      } else (m.role === 'B' && !m.dissolved ? floating : liquid).push(i);
    }
    for (let k = liquid.length - 1; k > 0; k--) { const r = Math.floor(Math.random() * (k + 1)); [liquid[k], liquid[r]] = [liquid[r], liquid[k]]; }
    const order = [...liquid, ...floating];
    if (order.length) {
      const a = 1.12 * Math.max(...order.map((i) => sim.sigmaOf(sim.kind[i])));
      const nx = Math.max(2, Math.floor((2 * HX - 0.2) / a)), nz = Math.max(2, Math.floor((2 * HZ - 0.2) / a));
      order.forEach((i, k) => {
        const l = Math.floor(k / (nx * nz)), r = k % (nx * nz);
        sim.x[i] = ((r % nx) - (nx - 1) / 2) * a + (Math.random() - 0.5) * 0.06;
        sim.z[i] = (Math.floor(r / nx) - (nz - 1) / 2) * a + (Math.random() - 0.5) * 0.06;
        sim.y[i] = Math.min(HY - 0.4, FLOOR + a * 0.6 + l * a);
      });
    }
    // push overlapping pairs apart before the first steps
    for (let it = 0; it < 15; it++) for (let i = 0; i < sim.n; i++) for (let j = i + 1; j < sim.n; j++) {
      if (sim.sk[i] > 0 && sim.sk[j] > 0) continue;
      const dx = sim.x[i] - sim.x[j], dy = sim.y[i] - sim.y[j], dz = sim.z[i] - sim.z[j];
      const want = 0.95 * sim.sig[sim.kind[i] * sim.K + sim.kind[j]];
      const d2 = dx * dx + dy * dy + dz * dz;
      if (d2 >= want * want) continue;
      const d = Math.sqrt(d2) || 1e-3;
      {
        const p = (want - d) / 2 / d;
        if (sim.sk[i] === 0) { sim.x[i] += dx * p; sim.y[i] = Math.max(FLOOR + 0.3, sim.y[i] + dy * p); sim.z[i] += dz * p; }
        if (sim.sk[j] === 0) { sim.x[j] -= dx * p; sim.y[j] = Math.max(FLOOR + 0.3, sim.y[j] - dy * p); sim.z[j] -= dz * p; }
      }
    }
  }

  /** Bind molecules to lattice sites: the nearest free site each, lowest molecules first. */
  private freeze(ids: number[], fresh: boolean) {
    const sim = this.sim;
    const s = sim.sigmaOf(0);
    let sites: THREE.Vector3[];
    let hdirs: [THREE.Vector3, THREE.Vector3][] | null = null;
    if (this.sub.id === 'H2O') {
      // drawn a little more open than it is (real ice: 9 % less dense than water), so the network stays visible
      const ice = iceSites(ids.length, s * 1.25, new THREE.Vector3(0, FLOOR + s * 0.55, 0));
      sites = ice.p; hdirs = ice.h;
    } else sites = blockSites(ids.length, s * 1.1);
    const free = sites.map((p, k) => ({ p, k, used: false }));
    const order = [...ids].sort((a, b) => sim.y[a] - sim.y[b]);
    for (const i of order) {
      let best = -1, bd = Infinity;
      for (let k = 0; k < free.length; k++) {
        if (free[k].used) continue;
        const d = fresh ? k : (free[k].p.x - sim.x[i]) ** 2 + (free[k].p.y - sim.y[i]) ** 2 + (free[k].p.z - sim.z[i]) ** 2;
        if (d < bd) { bd = d; best = k; }
      }
      if (best < 0) continue;
      free[best].used = true;
      const p = free[best].p;
      sim.sx[i] = p.x; sim.sy[i] = p.y; sim.sz[i] = p.z; sim.sk[i] = 60;
      if (fresh) { sim.x[i] = p.x; sim.y[i] = p.y; sim.z[i] = p.z; }
      const m = this.mols[i];
      m.hTarget = hdirs ? hdirs[free[best].k] : undefined;
      if (!hdirs) m.q.identity();
    }
    this.iceBlock = null;
    this.spring = fresh ? 1 : 0;
  }

  // ---------- time ----------

  private physics(dt: number, quiet = false) {
    const sim = this.sim;
    // freezing: springs ramp up so molecules glide to their sites
    if (this.spring < 1) {
      this.spring = Math.min(1, this.spring + dt * 0.9);
      for (let i = 0; i < sim.n; i++) if (sim.sk[i] > 0 && this.mols[i].role !== 'cation' && this.mols[i].role !== 'anion') sim.sk[i] = 4 + 56 * this.spring;
    }
    // the floating ice block sits with about 92 % of its height below the water surface
    if (this.iceBlock) {
      // the water surface: where the top tenth of the liquid molecules sit
      if (this.surfaceAge-- <= 0) {
        const ys = this.liquidY;
        let k = 0;
        for (let i = 0; i < sim.n; i++) if (sim.sk[i] === 0 && k < ys.length) ys[k++] = sim.y[i];
        const sorted = ys.subarray(0, k).sort();
        // for a layer of liquid the median height is half its depth; robust against molecules stuck to the ice
        this.surface = k ? FLOOR + 2 * (sorted[Math.floor(k * 0.5)] - FLOOR) : FLOOR + 2;
        this.surfaceAge = 20;
      }
      const hgt = this.iceBlock.height;
      const cy = Math.max(FLOOR + hgt / 2 + 0.15, this.surface - WATER.densityIce * hgt + hgt / 2) + (quiet ? 0 : 0.04 * Math.sin(this.clock * 1.3));
      this.iceBlock.ids.forEach((i, k) => {
        const o = this.iceBlock!.offsets[k];
        sim.sx[i] = o.x; sim.sy[i] = cy + o.y; sim.sz[i] = o.z;
        if (quiet) { sim.x[i] = sim.sx[i]; sim.y[i] = sim.sy[i]; sim.z[i] = sim.sz[i]; }
      });
    }
    sim.step(dt);
  }

  /** Advance the model and redraw. Returns events for the stage: ions dissolved since the last frame. */
  tick(dt: number, t: number): boolean {
    this.clock = t;
    if (this.condense > 0) this.condense = Math.max(0, this.condense - dt);
    this.sim.g = this.baseG * (this.condense > 0 ? 5 : 1);
    const sub = this.opts.reducedMotion ? 2 : 3;
    const h = this.opts.reducedMotion ? 0.004 : 0.0065;
    for (let k = 0; k < sub; k++) this.physics(h);
    let changed = false;
    // salt: in liquid water, one surface ion at a time leaves the crystal
    if (this.mix === 'NaCl' && this.state === 'liquid' && t >= this.releaseAt) {
      const sim = this.sim;
      const bound = this.mols.map((m, i) => ({ m, i })).filter(({ m, i }) => (m.role === 'cation' || m.role === 'anion') && !m.dissolved && sim.sk[i] > 0);
      if (bound.length) {
        // the ion with the fewest bound neighbours (a corner or an edge) goes first, higher ones before lower ones
        const score = ({ i }: { i: number }) => {
          let nb = 0;
          for (const o of bound) if (o.i !== i && Math.hypot(sim.sx[o.i] - sim.sx[i], sim.sy[o.i] - sim.sy[i], sim.sz[o.i] - sim.sz[i]) < 0.9) nb++;
          return nb * 10 - sim.sy[i];
        };
        bound.sort((a, b) => score(a) - score(b));
        const { m, i } = bound[0];
        m.dissolved = true; sim.sk[i] = 0;
        changed = true;
      }
      this.releaseAt = t + (this.opts.reducedMotion ? 1.0 : 0.6);
    }
    this.animate(dt);
    return changed;
  }

  private animate(dt: number) {
    if (!this.mesh) return;
    const sim = this.sim;
    const rm = this.opts.reducedMotion;
    const clouds = this.view === 'clouds';
    const n = sim.n;
    // ---- orientation: tumbling, dipole alignment, hydration shells, ice ----
    for (let i = 0; i < n; i++) {
      const m = this.mols[i];
      if (m.role === 'cation' || m.role === 'anion') continue;
      const T = sim.ts[i];
      const bound = sim.sk[i] > 0;
      let target: THREE.Vector3 | null = null;
      let pull = 0;
      if (m.hTarget) {
        // ice: hydrogens along two bonds; the dipole axis points away from them
        target = tmpV.copy(m.hTarget[0]).add(m.hTarget[1]).normalize().negate();
        pull = 6;
      } else if (bound) {
        // a crystal: molecules lie flat, alternating in a herringbone, so each one stays visible
        const odd = (Math.round(sim.sx[i] / 0.5) + Math.round(sim.sy[i] / 0.5) + Math.round(sim.sz[i] / 0.5)) % 2 !== 0;
        target = odd ? tmpV.set(1, 0, 0) : tmpV.set(0, 0, 1); pull = 4;
      } else {
        // hydration: a water next to a free ion turns its O (δ−) to Na⁺ and its H (δ+) to Cl⁻
        if (this.mix === 'NaCl' && m.role === 'main') {
          let best = Infinity;
          for (let j = 0; j < n; j++) {
            const o = this.mols[j];
            if ((o.role !== 'cation' && o.role !== 'anion') || !o.dissolved) continue;
            const d = Math.hypot(sim.x[j] - sim.x[i], sim.y[j] - sim.y[i], sim.z[j] - sim.z[i]);
            if (d < 1.15 && d < best) {
              best = d;
              tmpV.set(sim.x[j] - sim.x[i], sim.y[j] - sim.y[i], sim.z[j] - sim.z[i]).normalize();
              if (o.role === 'anion') tmpV.negate();
              target = tmpV; pull = 7;
            }
          }
        }
        // permanent dipoles line up head to tail; heat scrambles them (alignment ∝ μ² / T)
        if (!target && m.mu > 0.05 && !(this.dipoleOff && m.role === 'main')) {
          tmpW.set(0, 0, 0);
          for (let j = 0; j < n; j++) {
            if (j === i) continue;
            const o = this.mols[j];
            if (o.mu < 0.05) continue;
            const rx = sim.x[i] - sim.x[j], ry = sim.y[i] - sim.y[j], rz = sim.z[i] - sim.z[j];
            const r2 = rx * rx + ry * ry + rz * rz;
            if (r2 > 4) continue;
            const r = Math.sqrt(r2), inv3 = 1 / (r2 * r);
            const dot = (o.axis.x * rx + o.axis.y * ry + o.axis.z * rz) / r;
            // field of a dipole: (3 (p·r̂) r̂ − p) / r³
            tmpW.x += (3 * dot * rx / r - o.axis.x) * inv3 * o.mu;
            tmpW.y += (3 * dot * ry / r - o.axis.y) * inv3 * o.mu;
            tmpW.z += (3 * dot * rz / r - o.axis.z) * inv3 * o.mu;
          }
          // the axis points to the δ− end, the field of a dipole runs from + to −; align against it
          if (tmpW.lengthSq() > 1e-6) { target = tmpV.copy(tmpW).negate().normalize(); pull = Math.min(5, 1.6 * m.mu * m.mu / Math.max(0.3, T)); }
        }
      }
      // random tumbling, faster when hot
      const rot = bound ? 0.25 : (rm ? 0.6 : 1.4) * Math.sqrt(Math.max(0.05, T));
      const ang = rot * Math.sqrt(dt) * gauss();
      tmpQ.setFromAxisAngle(tmpS.set(gauss(), gauss(), gauss()).normalize(), ang);
      m.q.premultiply(tmpQ);
      if (target && pull > 0) {
        m.axis.copy(UP).applyQuaternion(m.q);
        tmpQ.setFromUnitVectors(m.axis, target);
        tmpQ2.identity().slerp(tmpQ, Math.min(1, pull * dt));
        m.q.premultiply(tmpQ2);
      }
      m.q.normalize();
      m.axis.copy(UP).applyQuaternion(m.q);
      // fluctuating electron cloud (dispersion): smooth noise, nudged by the neighbours' clouds (induced dipoles)
      if (clouds) {
        const tau = rm ? 1.4 : 0.35;
        tmpW.set(0, 0, 0);
        for (let j = 0; j < n; j++) {
          if (j === i) continue;
          const o = this.mols[j];
          const rx = sim.x[i] - sim.x[j], ry = sim.y[i] - sim.y[j], rz = sim.z[i] - sim.z[j];
          const r2 = rx * rx + ry * ry + rz * rz;
          if (r2 > 3) continue;
          const r = Math.sqrt(r2), inv3 = 1 / (r2 * r);
          const dot = (o.cloud.x * rx + o.cloud.y * ry + o.cloud.z * rz) / r;
          tmpW.x += (3 * dot * rx / r - o.cloud.x) * inv3;
          tmpW.y += (3 * dot * ry / r - o.cloud.y) * inv3;
          tmpW.z += (3 * dot * rz / r - o.cloud.z) * inv3;
        }
        const k = Math.min(1, dt / tau), amp = 0.9 * m.alpha;
        m.cloud.x += k * (-m.cloud.x - 0.35 * m.alpha * tmpW.x) + Math.sqrt(2 * k) * amp * gauss();
        m.cloud.y += k * (-m.cloud.y - 0.35 * m.alpha * tmpW.y) + Math.sqrt(2 * k) * amp * gauss();
        m.cloud.z += k * (-m.cloud.z - 0.35 * m.alpha * tmpW.z) + Math.sqrt(2 * k) * amp * gauss();
      }
    }
    // ---- hydrogen bonds (drawn between close molecules that can donate and accept) ----
    let segs = 0;
    if (this.view === 'hbonds') segs = this.hbonds();
    // ---- write instances ----
    const mesh = this.mesh;
    for (let i = 0; i < n; i++) {
      const m = this.mols[i];
      const cx = sim.x[i], cy = sim.y[i], cz = sim.z[i];
      let dipX = 0, dipY = 0, dipZ = 0, dipW = 0;
      if (clouds && m.role !== 'cation' && m.role !== 'anion') {
        const l = m.cloud.length();
        if (l > 1e-4) { dipX = m.cloud.x / l; dipY = m.cloud.y / l; dipZ = m.cloud.z / l; dipW = Math.min(0.95, 0.55 * l); }
      }
      m.beads.forEach((b, k) => {
        const idx = m.first + k;
        tmpS.set(b.p[0], b.p[1], b.p[2]).applyQuaternion(m.q);
        tmpM.makeScale(b.r, b.r, b.r).setPosition(cx + tmpS.x, cy + tmpS.y, cz + tmpS.z);
        mesh.setMatrixAt(idx, tmpM);
        this.aCenter.setXYZW(idx, cx, cy, cz, m.ext);
        this.aDip.setXYZW(idx, dipX, dipY, dipZ, dipW);
        // the what-if switches the permanent charges off; clouds view shows only the flicker
        const q = (this.dipoleOff && m.role === 'main') || clouds ? 0 : b.q;
        this.aQ.setX(idx, q);
      });
    }
    mesh.instanceMatrix.needsUpdate = true;
    this.aCenter.needsUpdate = true; this.aDip.needsUpdate = true; this.aQ.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = false;
    // the ice cube follows its block
    this.iceCube.visible = !!this.iceBlock;
    if (this.iceBlock) {
      const ids = this.iceBlock.ids;
      let cx = 0, cy = 0, cz = 0;
      for (const i of ids) { cx += sim.sx[i]; cy += sim.sy[i]; cz += sim.sz[i]; }
      this.iceCube.position.set(cx / ids.length, cy / ids.length, cz / ids.length);
    }
    // ion signs follow their ions
    for (const l of this.ionLabels.children) {
      const i = l.userData.mol as number;
      l.position.set(sim.x[i], sim.y[i] + 0.02, sim.z[i]);
    }
    // h-bond lines
    const g = this.hbLines.geometry as THREE.BufferGeometry;
    g.setDrawRange(0, segs * 2);
    const P = this.hbPos, D = this.hbDist;
    for (let k = 0; k < segs; k++) { const o = k * 6; D[2 * k] = 0; D[2 * k + 1] = Math.hypot(P[o + 3] - P[o], P[o + 4] - P[o + 1], P[o + 5] - P[o + 2]); }
    (g.attributes.position as THREE.BufferAttribute).needsUpdate = true;
    (g.attributes.lineDistance as THREE.BufferAttribute).needsUpdate = true;
    const dotR = this.opts.compact ? 0.06 : 0.05;
    for (let k = 0; k < segs; k++) {
      const o = k * 6;
      for (let d = 0; d < DOTS; d++) {
        const f = (d + 1) / (DOTS + 1);
        tmpM.makeScale(dotR, dotR, dotR).setPosition(P[o] + (P[o + 3] - P[o]) * f, P[o + 1] + (P[o + 4] - P[o + 1]) * f, P[o + 2] + (P[o + 5] - P[o + 2]) * f);
        this.hbDots.setMatrixAt(k * DOTS + d, tmpM);
      }
    }
    this.hbDots.count = segs * DOTS;
    this.hbDots.instanceMatrix.needsUpdate = true;
  }

  /** Pair donors with acceptors among close molecules; fills the line buffer and returns the number of lines. */
  private hbonds(): number {
    const sim = this.sim, n = sim.n;
    // donor and acceptor places left per molecule (ions take part only through hydration)
    const capD = this.capD, capA = this.capA;
    for (let i = 0; i < n; i++) {
      const m = this.mols[i], ion = m.role === 'cation' || m.role === 'anion';
      capD[i] = ion ? 0 : Math.min(2, m.sub.donors); capA[i] = ion ? 0 : Math.min(2, m.sub.acceptors);
    }
    // hotter water keeps fewer hydrogen bonds: the reach shrinks a little towards the boiling point
    const p = pointsOf(this.sub);
    const frac = this.state === 'liquid' && p.mp !== null && p.bp !== null ? Math.max(0, Math.min(1, (this.temp - p.mp) / (p.bp - p.mp))) : this.state === 'gas' ? 1 : 0;
    const reach = 1.42 - 0.2 * frac;
    let np = 0;
    const PI = this.pairI, PJ = this.pairJ, PD = this.pairD;
    for (let i = 0; i < n; i++) {
      if (!capD[i] && !capA[i]) continue;
      for (let j = i + 1; j < n; j++) {
        if (!capD[j] && !capA[j]) continue;
        const s = sim.sig[sim.kind[i] * sim.K + sim.kind[j]] * reach;
        const dx = sim.x[i] - sim.x[j], dy = sim.y[i] - sim.y[j], dz = sim.z[i] - sim.z[j];
        const d2 = dx * dx + dy * dy + dz * dz;
        if (d2 < s * s && np < PD.length) { PI[np] = i; PJ[np] = j; PD[np] = d2; np++; }
      }
    }
    const order = this.pairOrder.subarray(0, np);
    for (let k = 0; k < np; k++) order[k] = k;
    order.sort((a, b) => PD[a] - PD[b]);
    let segs = 0;
    for (const m of this.mols) m.hb = 0;
    const P = this.hbPos;
    for (let k = 0; k < np; k++) {
      const i = PI[order[k]], j = PJ[order[k]];
      // i donates to j, or j to i, whichever is still free
      let don = -1, acc = -1;
      const hi = this.mols[i].hTarget, hj = this.mols[j].hTarget;
      if (hi && hj) {
        // ice: the bond carries the H of whichever molecule points one of its hydrogens along it
        tmpV.set(sim.x[j] - sim.x[i], sim.y[j] - sim.y[i], sim.z[j] - sim.z[i]).normalize();
        if (Math.max(hi[0].dot(tmpV), hi[1].dot(tmpV)) > 0.8) { don = i; acc = j; }
        else if (Math.max(-hj[0].dot(tmpV), -hj[1].dot(tmpV)) > 0.8) { don = j; acc = i; }
      } else if (capD[i] > 0 && capA[j] > 0) { don = i; acc = j; } else if (capD[j] > 0 && capA[i] > 0) { don = j; acc = i; }
      if (don < 0) continue;
      capD[don]--; capA[acc]--;
      this.mols[don].hb++; this.mols[acc].hb++;
      // from the donor's hydrogen nearest the acceptor to the acceptor's centre
      const md = this.mols[don];
      let hx = sim.x[don], hy = sim.y[don], hz = sim.z[don], best = Infinity;
      md.beads.forEach((b) => {
        if (b.q <= 0.3) return;
        tmpS.set(b.p[0], b.p[1], b.p[2]).applyQuaternion(md.q);
        const px = sim.x[don] + tmpS.x, py = sim.y[don] + tmpS.y, pz = sim.z[don] + tmpS.z;
        const d = (px - sim.x[acc]) ** 2 + (py - sim.y[acc]) ** 2 + (pz - sim.z[acc]) ** 2;
        if (d < best) { best = d; hx = px; hy = py; hz = pz; }
      });
      // … to the acceptor's δ− atom (the O of acetone, of an alcohol, of water) nearest that hydrogen
      const ma = this.mols[acc];
      let ax = sim.x[acc], ay = sim.y[acc], az = sim.z[acc], bestA = Infinity;
      ma.beads.forEach((bd) => {
        if (bd.q >= -0.3) return;
        tmpS.set(bd.p[0], bd.p[1], bd.p[2]).applyQuaternion(ma.q);
        const px = sim.x[acc] + tmpS.x, py = sim.y[acc] + tmpS.y, pz = sim.z[acc] + tmpS.z;
        const d = (px - hx) ** 2 + (py - hy) ** 2 + (pz - hz) ** 2;
        if (d < bestA) { bestA = d; ax = px; ay = py; az = pz; }
      });
      const o = segs * 6;
      P[o] = hx; P[o + 1] = hy; P[o + 2] = hz;
      P[o + 3] = ax; P[o + 4] = ay; P[o + 5] = az;
      segs++;
      if (segs * 6 + 6 > P.length) break;
    }
    const capable = this.mols.filter((m) => m.role !== 'cation' && m.role !== 'anion' && m.sub.donors > 0 && m.sub.acceptors > 0);
    this.hbAvg = capable.length ? capable.reduce((s, m) => s + m.hb, 0) / capable.length : null;
    return segs;
  }

  dispose() {
    if (this.mesh) this.mesh.geometry.dispose();
    this.mat.dispose();
    this.hbLines.geometry.dispose();
    (this.hbLines.material as THREE.Material).dispose();
    this.hbDots.geometry.dispose();
    (this.hbDots.material as THREE.Material).dispose();
    for (const l of this.ionLabels.children) (l as THREE.Sprite).material.dispose();
  }
}

// ---------------------------------------------------------------------------------------------------------------
// Spreading view (unit 19): N gas particles start in the left half behind a partition. Remove it and count how
// many are on the left. Plain spheres, no clouds; the particles move like an ideal gas (straight lines, elastic
// bounces off the walls and off each other), faster when hotter: speed ∝ √(T/M).

/** Particle numbers offered in the spreading view. */
export const SPREAD_NS = [4, 10, 40, 100];
/** Van der Waals radii in pm (Bondi 1964), only to draw two noble gases in proportion to each other. */
const VDW: Record<string, number> = { He: 140, Ne: 154, Ar: 188, Kr: 202, Xe: 216 };
/** The gas the spreading view shows for a substance: a noble gas as it is, anything else as argon. */
export const spreadGas = (id: string) => (VDW[id] ? id : 'Ar');
/** The second gas for mixing: neon, or argon when the first one is neon. */
export const secondGas = (id: string) => (spreadGas(id) === 'Ne' ? 'Ar' : 'Ne');
/** Colours of the first and the second gas (never the red and blue of charges). */
export const GAS_COLOR = ['#c9c3e6', '#5fd4c4'];
/** Number of arrangements with k of n particles in the left half, C(n, k), for k = 0 … n. */
export function waysOf(n: number): number[] {
  const out = [1];
  for (let k = 1; k <= n; k++) out.push((out[k - 1] * (n - k + 1)) / k);
  return out;
}

const SPREAD_CAP = 200;              // two gases with 100 particles each
const WALL = 0.035;                  // half thickness of the partition
const HALF_VOL = HX * 2 * HY * 2 * HZ;
const SPREAD_STEP = 1 / 150;
const kelvin = (T: number) => Math.max(5, T + 273.15);

export class SpreadBox {
  readonly group = new THREE.Group();
  gas: Substance = substance('Ar');
  gasB: Substance = substance('Ne');
  n = 10;
  open = false;
  mixed = false;
  temp = 20;
  /** particles of the first and of the second gas in the left half now */
  left = 0;
  leftB = 0;
  /** how often each k (first gas on the left) came up since the partition was removed, counted ten times a second */
  readonly hist = new Float64Array(101);
  samples = 0;
  /** times all n came back to the left at once since the partition was removed */
  allLeft = 0;
  /** seconds the motion stays held after all came back to the left, so it can be seen */
  hold = 0;
  private count = 0;
  private readonly x = new Float64Array(SPREAD_CAP); private readonly y = new Float64Array(SPREAD_CAP); private readonly z = new Float64Array(SPREAD_CAP);
  private readonly vx = new Float64Array(SPREAD_CAP); private readonly vy = new Float64Array(SPREAD_CAP); private readonly vz = new Float64Array(SPREAD_CAP);
  /** 0 first gas, 1 second gas */
  private readonly b = new Uint8Array(SPREAD_CAP);
  private r = 0.4;
  private rB = 0.33;
  private readonly mesh: THREE.InstancedMesh;
  private readonly wall = new THREE.Group();
  private readonly wallFill: THREE.MeshBasicMaterial;
  private readonly wallEdge: THREE.LineBasicMaterial;
  private readonly trace: THREE.LineSegments;
  private readonly traceMat: THREE.LineDashedMaterial;
  /** 0: partition in place, 1: lifted out */
  private lift = 0;
  /** some particle of the first gas has been on the right since the partition was removed */
  private armed = false;
  private acc = 0;
  private sampleAcc = 0;

  constructor(private readonly opts: { compact: boolean; reducedMotion: boolean }) {
    const edges = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(2 * HX, 2 * HY, 2 * HZ)), new THREE.LineBasicMaterial({ color: 0x9aa3bf, transparent: true, opacity: 0.45 }));
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(2 * HX, 2 * HZ), new THREE.MeshBasicMaterial({ color: 0x9aa3bf, transparent: true, opacity: 0.13, side: THREE.DoubleSide, depthWrite: false }));
    floor.rotation.x = -Math.PI / 2; floor.position.y = FLOOR + 0.002;
    // the partition: a pane in the middle (the plane x = 0) with a frame
    this.wallFill = new THREE.MeshBasicMaterial({ color: 0xb8c2e0, transparent: true, opacity: 0.28, side: THREE.DoubleSide, depthWrite: false });
    this.wallEdge = new THREE.LineBasicMaterial({ color: 0xdfe5f5, transparent: true, opacity: 0.85 });
    const pane = new THREE.Mesh(new THREE.PlaneGeometry(2 * HZ, 2 * HY), this.wallFill);
    pane.rotation.y = Math.PI / 2;
    this.wall.add(pane, new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(2 * WALL, 2 * HY, 2 * HZ)), this.wallEdge));
    // where the partition stood, once it is out: a dashed frame marks the middle
    const c = [[-HY, -HZ], [-HY, HZ], [HY, HZ], [HY, -HZ]];
    const pts: number[] = [];
    for (let k = 0; k < 4; k++) { const a = c[k], b = c[(k + 1) % 4]; pts.push(0, a[0], a[1], 0, b[0], b[1]); }
    const tg = new THREE.BufferGeometry();
    tg.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
    this.traceMat = new THREE.LineDashedMaterial({ color: 0xdfe5f5, dashSize: 0.18, gapSize: 0.14, transparent: true, opacity: 0.35 });
    this.trace = new THREE.LineSegments(tg, this.traceMat);
    this.trace.computeLineDistances();
    this.trace.visible = false;
    const seg = opts.compact ? 14 : 16;
    this.mesh = new THREE.InstancedMesh(new THREE.SphereGeometry(1, seg, seg - 4), new THREE.MeshStandardMaterial({ roughness: 0.5, metalness: 0.02 }), SPREAD_CAP);
    this.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.mesh.frustumCulled = false;
    this.mesh.count = 0;
    const col = new THREE.Color(GAS_COLOR[0]);
    for (let i = 0; i < SPREAD_CAP; i++) this.mesh.setColorAt(i, col);
    this.group.add(edges, floor, this.wall, this.trace, this.mesh);
  }

  /** Load n particles of a gas (and as many of a second gas on the right); open: already spread through the box. */
  setup(gasId: string, n: number, mixed: boolean, open: boolean) {
    this.gas = substance(spreadGas(gasId));
    this.gasB = substance(secondGas(gasId));
    this.n = Math.max(1, Math.min(100, Math.round(n)));
    this.mixed = mixed;
    // each sphere one particle; with many particles the spheres are drawn smaller, so the gas stays a gas
    this.r = Math.min(radiusOf(this.gas), Math.cbrt((0.12 * HALF_VOL * 3) / (4 * Math.PI * this.n)));
    this.rB = (this.r * VDW[this.gasB.id]) / VDW[this.gas.id];
    this.count = this.n * (mixed ? 2 : 1);
    const cA = new THREE.Color(GAS_COLOR[0]), cB = new THREE.Color(GAS_COLOR[1]);
    for (let i = 0; i < this.count; i++) { this.b[i] = i < this.n ? 0 : 1; this.mesh.setColorAt(i, this.b[i] ? cB : cA); }
    this.mesh.count = this.count;
    if (this.mesh.instanceColor) this.mesh.instanceColor.needsUpdate = true;
    this.open = open;
    this.lift = open ? 1 : 0;
    this.place(open);
    this.clearCounts();
    this.countLeft();
    this.armed = open && this.left < this.n;
    this.draw();
  }

  /** Remove the partition, or put it back with every particle in its own half again. */
  setOpen(open: boolean) {
    if (open === this.open) return;
    this.open = open;
    if (open) this.lift = this.opts.reducedMotion ? 1 : 0;
    else { this.lift = 0; this.place(false); }
    this.clearCounts();
    this.countLeft();
    this.armed = false;
    this.draw();
  }

  /** Hotter, faster: all speeds scale with √T (in K). */
  setTemp(T: number) {
    const f = Math.sqrt(kelvin(T) / kelvin(this.temp));
    this.temp = T;
    for (let i = 0; i < this.count; i++) { this.vx[i] *= f; this.vy[i] *= f; this.vz[i] *= f; }
  }

  private clearCounts() {
    this.hist.fill(0);
    this.samples = 0; this.allLeft = 0; this.hold = 0; this.sampleAcc = 0; this.acc = 0;
  }

  private countLeft() {
    let a = 0, bl = 0;
    for (let i = 0; i < this.count; i++) if (this.x[i] < 0) { if (this.b[i]) bl++; else a++; }
    this.left = a; this.leftB = bl;
  }

  /** Spread of one velocity component for a gas: √(T/M), scaled so argon at 20 °C crosses half the box in about 2 s. */
  private sigma(M: number) {
    return (this.opts.reducedMotion ? 0.65 : 1.5) * Math.sqrt((kelvin(this.temp) / 293.15) * (39.95 / M));
  }

  /** Random places without overlaps (in the own half, or anywhere when spread) and random velocities. */
  private place(spread: boolean) {
    const { x, y, z, b } = this;
    for (let i = 0; i < this.count; i++) {
      const r = b[i] ? this.rB : this.r;
      const x0 = spread ? -HX + r : b[i] ? WALL + r : -HX + r;
      const x1 = spread ? HX - r : b[i] ? HX - r : -WALL - r;
      for (let tries = 0; tries < 40; tries++) {
        x[i] = x0 + Math.random() * (x1 - x0);
        y[i] = (Math.random() * 2 - 1) * (HY - r);
        z[i] = (Math.random() * 2 - 1) * (HZ - r);
        let ok = true;
        for (let j = 0; j < i && ok; j++) {
          const rr = r + (b[j] ? this.rB : this.r) + 0.02;
          ok = (x[i] - x[j]) ** 2 + (y[i] - y[j]) ** 2 + (z[i] - z[j]) ** 2 >= rr * rr;
        }
        if (ok) break;
      }
    }
    // already spread: at least one particle of the first gas on the right, so the picture shows it
    if (spread) {
      this.countLeft();
      if (this.left === this.n) for (let i = 0; i < this.count; i++) if (!b[i]) { x[i] = -x[i]; break; }
    }
    for (const g of [0, 1]) {
      const M = g ? this.gasB.M : this.gas.M, s = this.sigma(M);
      let sum = 0, m = 0;
      for (let i = 0; i < this.count; i++) {
        if (b[i] !== g) continue;
        this.vx[i] = s * gauss(); this.vy[i] = s * gauss(); this.vz[i] = s * gauss();
        sum += this.vx[i] ** 2 + this.vy[i] ** 2 + this.vz[i] ** 2; m++;
      }
      // a few particles: scale so their mean energy matches the temperature exactly
      const f = m && sum > 0 ? Math.sqrt((3 * s * s * m) / sum) : 1;
      for (let i = 0; i < this.count; i++) if (b[i] === g) { this.vx[i] *= f; this.vy[i] *= f; this.vz[i] *= f; }
    }
  }

  private step(h: number) {
    const { x, y, z, vx, vy, vz, b } = this, n = this.count, closed = !this.open;
    for (let i = 0; i < n; i++) {
      x[i] += vx[i] * h; y[i] += vy[i] * h; z[i] += vz[i] * h;
      const r = b[i] ? this.rB : this.r;
      const ax = HX - r, ay = HY - r, az = HZ - r;
      if (x[i] > ax) { x[i] = 2 * ax - x[i]; vx[i] = -Math.abs(vx[i]); } else if (x[i] < -ax) { x[i] = -2 * ax - x[i]; vx[i] = Math.abs(vx[i]); }
      if (y[i] > ay) { y[i] = 2 * ay - y[i]; vy[i] = -Math.abs(vy[i]); } else if (y[i] < -ay) { y[i] = -2 * ay - y[i]; vy[i] = Math.abs(vy[i]); }
      if (z[i] > az) { z[i] = 2 * az - z[i]; vz[i] = -Math.abs(vz[i]); } else if (z[i] < -az) { z[i] = -2 * az - z[i]; vz[i] = Math.abs(vz[i]); }
      if (closed) {
        const edge = WALL + r;
        if (!b[i] && x[i] > -edge) { x[i] = -edge; vx[i] = -Math.abs(vx[i]); }
        else if (b[i] && x[i] < edge) { x[i] = edge; vx[i] = Math.abs(vx[i]); }
      }
    }
    // elastic collisions between spheres (masses from the molar masses)
    const mA = this.gas.M, mB = this.gasB.M;
    for (let i = 0; i < n; i++) {
      const ri = b[i] ? this.rB : this.r, mi = b[i] ? mB : mA;
      for (let j = i + 1; j < n; j++) {
        const rr = ri + (b[j] ? this.rB : this.r);
        const dx = x[i] - x[j];
        if (dx > rr || dx < -rr) continue;
        const dy = y[i] - y[j], dz = z[i] - z[j];
        const d2 = dx * dx + dy * dy + dz * dz;
        if (d2 >= rr * rr || d2 < 1e-12) continue;
        const d = Math.sqrt(d2), nx = dx / d, ny = dy / d, nz = dz / d;
        const rel = (vx[i] - vx[j]) * nx + (vy[i] - vy[j]) * ny + (vz[i] - vz[j]) * nz;
        if (rel < 0) {
          const mj = b[j] ? mB : mA, ki = (2 * mj * rel) / (mi + mj), kj = (2 * mi * rel) / (mi + mj);
          vx[i] -= ki * nx; vy[i] -= ki * ny; vz[i] -= ki * nz;
          vx[j] += kj * nx; vy[j] += kj * ny; vz[j] += kj * nz;
        }
        const push = (rr - d) / 2;
        x[i] += nx * push; y[i] += ny * push; z[i] += nz * push;
        x[j] -= nx * push; y[j] -= ny * push; z[j] -= nz * push;
      }
    }
  }

  /** Advance and redraw. Returns true when all n particles of the first gas have just come back to the left. */
  tick(dt: number): boolean {
    if (this.open && this.lift < 1) this.lift = Math.min(1, this.lift + dt / 0.6);
    let back = false;
    if (this.hold > 0) this.hold = Math.max(0, this.hold - dt);
    else {
      this.acc = Math.min(this.acc + dt, 3 * SPREAD_STEP);
      while (this.acc >= SPREAD_STEP) { this.step(SPREAD_STEP); this.acc -= SPREAD_STEP; }
      this.countLeft();
      if (this.open) {
        if (this.left < this.n) this.armed = true;
        else if (this.armed) { this.armed = false; this.allLeft++; this.hold = 1.2; back = true; }
        this.sampleAcc += dt;
        while (this.sampleAcc >= 0.1) { this.sampleAcc -= 0.1; this.hist[this.left]++; this.samples++; }
      }
    }
    this.draw();
    return back;
  }

  private draw() {
    for (let i = 0; i < this.count; i++) {
      const r = this.b[i] ? this.rB : this.r;
      tmpM.makeScale(r, r, r).setPosition(this.x[i], this.y[i], this.z[i]);
      this.mesh.setMatrixAt(i, tmpM);
    }
    this.mesh.instanceMatrix.needsUpdate = true;
    const l = this.open ? this.lift : 0;
    this.wall.visible = l < 1;
    this.wall.position.y = l * (2 * HY + 0.3);
    this.wallFill.opacity = 0.28 * (1 - l);
    this.wallEdge.opacity = 0.85 * (1 - l);
    this.trace.visible = this.open;
    this.traceMat.opacity = this.hold > 0 ? 0.95 : 0.35 * l;
  }

  dispose() {
    this.group.traverse((o) => {
      const m = o as THREE.Mesh;
      m.geometry?.dispose?.();
      const mat = m.material as THREE.Material | undefined;
      mat?.dispose?.();
    });
  }
}

// ---------------------------------------------------------------------------------------------------------------
// The stage: one box, or two side by side

export class ParticleBoxStage extends Stage3D {
  readonly boxes: ParticleBox[] = [];
  view: View = 'plain';
  temp = 20;
  private lastHb = 0;
  private lastDiss = 0;
  private compareOn = false;
  /** the spreading view (unit 19), made the first time it is used */
  private sb: SpreadBox | null = null;
  private spreadOn = false;
  private lastSpread = 0;

  constructor(host: HTMLElement, private readonly compact = false) {
    super(host, { distance: compact ? 15 : 13, minDistance: 7, maxDistance: 30, autoRotate: false });
    this.camera.position.set(3.6, 2.4, compact ? 14 : 12.6);
    this.controls.target.set(0, -0.3, 0);
    for (let k = 0; k < 2; k++) {
      const b = new ParticleBox({ compact, reducedMotion: this.reducedMotion, label: (t, s, c) => this.label(t, s, c) });
      this.boxes.push(b);
      this.root.add(b.group);
    }
    this.boxes[1].group.visible = false;
    this.layout();
  }

  get compare() { return this.compareOn; }
  /** The spreading view while it is on, else null. */
  get spread(): SpreadBox | null { return this.spreadOn ? this.sb : null; }

  /** Unit 19: switch box 1 to the spreading view with n particles of a gas (null: back to the ordinary box). */
  setSpread(n: number | null, gasId = 'Ar', o: { open?: boolean; mixed?: boolean } = {}) {
    if (n === null) { this.leaveSpread(); return; }
    if (!this.sb) {
      this.sb = new SpreadBox({ compact: this.compact, reducedMotion: this.reducedMotion });
      this.root.add(this.sb.group);
    }
    if (this.compareOn) { this.compareOn = false; this.layout(); }
    if (!this.spreadOn) this.aimSpread();
    this.spreadOn = true;
    this.boxes[0].group.visible = false;
    this.sb.group.visible = true;
    this.sb.temp = this.temp;
    this.sb.setup(gasId, n, !!o.mixed, !!o.open);
  }

  /** Remove the partition, or put it back (every particle back in its own half). */
  setPartition(open: boolean) { if (this.spreadOn) this.sb!.setOpen(open); }

  /** Two gases: a second gas fills the right half; the partition goes back in. */
  setMixed(on: boolean) { if (this.spreadOn) { const s = this.sb!; s.setup(s.gas.id, s.n, on, false); } }

  private leaveSpread() {
    if (!this.spreadOn) return;
    this.spreadOn = false;
    this.sb!.group.visible = false;
    this.boxes[0].group.visible = true;
    this.aim(!!this.boxes[0].mix);
  }

  /** Left and right read best almost from the front. */
  private aimSpread() {
    const dir = new THREE.Vector3(2.2, 2.4, 12.6).normalize();
    const dist = this.camera.position.distanceTo(this.controls.target);
    this.controls.target.set(0, -0.3, 0);
    this.camera.position.copy(this.controls.target).addScaledVector(dir, dist);
  }

  private layout() {
    const two = this.compareOn;
    this.boxes[0].group.position.x = two ? -(HX + 0.55) : 0;
    this.boxes[1].group.position.x = two ? HX + 0.55 : 0;
    this.boxes[1].group.visible = two;
    const d = two ? (this.compact ? 21 : 18.5) : (this.compact ? 14 : 12.6);
    const dir = this.camera.position.clone().sub(this.controls.target).normalize();
    this.camera.position.copy(this.controls.target).addScaledVector(dir, d);
    this.controls.maxDistance = two ? 36 : 30;
  }

  /** Load a substance into box 1 or 2 (box 2 null: no comparison). */
  load(box: 1 | 2, id: string | null, mix: MixId | null = null) {
    if (this.spreadOn && (box === 1 || id !== null)) this.leaveSpread();
    if (box === 2) {
      this.compareOn = id !== null;
      if (id) { const b = this.boxes[1]; b.temp = this.temp; b.load(id); b.setView(this.view); }
      this.layout();
      if (id) { this.emit('substance', id, 2); this.emit('state', id, this.boxes[1].state, 2); }
      return;
    }
    const b = this.boxes[0];
    if (b.mix && !mix) this.aim(false);
    b.temp = this.temp;
    b.load(id ?? 'Ar', mix);
    b.setView(this.view);
    this.emit('substance', b.sub.id, 1);
    this.emit('state', b.sub.id, b.state, 1);
  }

  /** Layers read best from the side: a lower camera for mixtures. */
  private aim(mix: boolean) {
    const dir = mix ? new THREE.Vector3(0.3, 0.06, 1).normalize() : new THREE.Vector3(3.6, 2.7, 12.6).normalize();
    const dist = this.camera.position.distanceTo(this.controls.target);
    this.controls.target.set(0, mix ? -1.2 : -0.3, 0);
    this.camera.position.copy(this.controls.target).addScaledVector(dir, dist);
  }

  setMix(mix: MixId | null) {
    this.leaveSpread();
    this.aim(!!mix);
    const b = this.boxes[0];
    b.temp = this.temp;
    b.load('H2O', mix);
    b.setView(this.view);
    this.emit('mix', mix);
  }

  setTemp(T: number) {
    // the spreading view: only the speeds change (the hidden box 1 takes the temperature when it comes back)
    if (this.spreadOn) { this.temp = T; this.sb!.setTemp(T); this.emit('temp', T); return; }
    const prevT = this.temp;
    this.temp = T;
    const active = this.compareOn ? this.boxes : [this.boxes[0]];
    active.forEach((b, k) => {
      const before = b.state;
      b.setTemp(T);
      // crossing a melting or boiling point counts even when the slider jumps over the liquid range
      const p = b.points;
      if (p.mp !== null && prevT < p.mp && T >= p.mp) this.emit('melt', b.sub.id);
      if (p.bp !== null && prevT < p.bp && T >= p.bp) this.emit('boil', b.sub.id);
      if (p.mp !== null && prevT >= p.mp && T < p.mp) this.emit('freeze', b.sub.id);
      if (b.state !== before) this.emit('state', b.sub.id, b.state, (k + 1) as 1 | 2);
    });
    this.emit('temp', T);
  }

  setView(v: View) {
    this.view = v;
    for (const b of this.boxes) b.setView(v);
  }

  setDipoleOff(off: boolean) {
    const b = this.boxes[0];
    const before = b.state;
    b.setDipoleOff(off);
    this.emit('dipoleOff', b.sub.id, b.dipoleOff);
    if (b.state !== before) this.emit('state', b.sub.id, b.state, 1);
  }

  protected tick(dt: number, t: number) {
    if (this.spreadOn) {
      if (this.sb!.tick(dt)) this.emit('allLeft', this.sb!.n);
      // the live readout: about eight times a second
      if (t - this.lastSpread > 0.12 || t < this.lastSpread) { this.lastSpread = t; this.emit('spreadFrame'); }
      return;
    }
    const active = this.compareOn ? this.boxes : [this.boxes[0]];
    let dissolvedChanged = false;
    for (const b of active) if (b.tick(dt, t)) dissolvedChanged = true;
    const b = this.boxes[0];
    if (b.mix === 'NaCl' && (dissolvedChanged && t - this.lastDiss > 0.5)) {
      this.lastDiss = t;
      const inf = b.info();
      this.emit('dissolved', inf.total ? inf.dissolved / inf.total : 0);
    }
    if (this.view === 'hbonds' && t - this.lastHb > 1) {
      this.lastHb = t;
      if (b.hbAvg !== null) this.emit('hbonds', b.hbAvg);
    }
    if (Math.floor(t * 2) !== Math.floor((t - dt) * 2)) this.emit('frame');
  }

  dispose() {
    for (const b of this.boxes) b.dispose();
    this.sb?.dispose();
    super.dispose();
  }
}

/** Substances that make sense in the box (all of them; the list is the UI's choice). */
export const BOX_SUBSTANCES = SUBSTANCES.map((s) => s.id);
