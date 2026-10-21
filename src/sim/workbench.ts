// Molecule Workbench — the 3D engine behind units 6, 10, 26 and 35–45.
// Electron domains (bonds and lone pairs) are points on a sphere that repel each other;
// the shape is whatever arrangement they relax into. Nothing is hard-coded per molecule.

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export interface Ligand { el: string; order: 1 | 2 | 3; }
export interface MoleculeSpec {
  id: string;
  formula: string;
  center: string;
  ligands: Ligand[];
  lonePairs: number;
  charge?: number;
  measured?: number;   // measured bond angle in degrees, where one angle describes the molecule
}

const VALENCE: Record<string, number> = { B: 3, C: 4, N: 5, O: 6, P: 5, S: 6 };
export const CHI: Record<string, number> = { H: 2.2, B: 2.04, C: 2.55, N: 3.04, O: 3.44, F: 3.98, P: 2.19, S: 2.58, Cl: 3.16, Br: 2.96 };
const RADIUS: Record<string, number> = { H: 0.3, B: 0.46, C: 0.5, N: 0.48, O: 0.46, F: 0.42, P: 0.58, S: 0.58, Cl: 0.56, Br: 0.6 };
// Atoms are quiet, neutral bodies; colour is reserved for chemistry meaning (charge, lone pairs, energy).
const ATOM_COLOR: Record<string, number> = { H: 0xe9e3d3, B: 0xc9a9a3, C: 0x5d6479, N: 0x93a6c9, O: 0xd2bfa6, F: 0xb2d6bf, P: 0xc79f72, S: 0xd8c879, Cl: 0x9fc79a, Br: 0xa98377 };

export const COLORS = { electron: 0x5aa9ff, positive: 0xff6b6b, lonePair: 0xb48cff, energy: 0xffc15e, chalk: 0xece6d6 };

function spec(id: string, formula: string, center: string, ligs: [string, 1 | 2 | 3][], charge = 0, measured?: number): MoleculeSpec {
  const ligands = ligs.map(([el, order]) => ({ el, order }));
  return { id, formula, center, ligands, lonePairs: lonePairsFor(center, ligands, charge)!, charge, measured };
}
export function lonePairsFor(center: string, ligands: Ligand[], charge = 0): number | null {
  const v = VALENCE[center];
  if (v === undefined) return null;
  const free = v - ligands.reduce((s, l) => s + l.order, 0) - charge;
  if (free < 0 || free % 2 !== 0) return null;
  return free / 2;
}

export const PRESETS: Record<string, MoleculeSpec> = {
  CH4: spec('CH4', 'CH4', 'C', [['H', 1], ['H', 1], ['H', 1], ['H', 1]], 0, 109.5),
  NH3: spec('NH3', 'NH3', 'N', [['H', 1], ['H', 1], ['H', 1]], 0, 107),
  H2O: spec('H2O', 'H2O', 'O', [['H', 1], ['H', 1]], 0, 104.5),
  NH4: spec('NH4', 'NH4+', 'N', [['H', 1], ['H', 1], ['H', 1], ['H', 1]], 1, 109.5),
  CO2: spec('CO2', 'CO2', 'C', [['O', 2], ['O', 2]], 0, 180),
  HCN: spec('HCN', 'HCN', 'C', [['H', 1], ['N', 3]], 0, 180),
  BF3: spec('BF3', 'BF3', 'B', [['F', 1], ['F', 1], ['F', 1]], 0, 120),
  CH2O: spec('CH2O', 'CH2O', 'C', [['H', 1], ['H', 1], ['O', 2]]),
  SO2: spec('SO2', 'SO2', 'S', [['O', 2], ['O', 2]], 0, 119.5),
  PCl3: spec('PCl3', 'PCl3', 'P', [['Cl', 1], ['Cl', 1], ['Cl', 1]], 0, 100.3),
  H2S: spec('H2S', 'H2S', 'S', [['H', 1], ['H', 1]], 0, 92.1),
  CCl4: spec('CCl4', 'CCl4', 'C', [['Cl', 1], ['Cl', 1], ['Cl', 1], ['Cl', 1]], 0, 109.5),
  CHCl3: spec('CHCl3', 'CHCl3', 'C', [['H', 1], ['Cl', 1], ['Cl', 1], ['Cl', 1]]),
  CH2Cl2: spec('CH2Cl2', 'CH2Cl2', 'C', [['H', 1], ['H', 1], ['Cl', 1], ['Cl', 1]]),
};

export function buildSpec(center: string, ligands: Ligand[]): MoleculeSpec | null {
  const lp = lonePairsFor(center, ligands, 0);
  if (lp === null || ligands.length === 0 || ligands.length + lp > 4) return null;
  const counts = new Map<string, number>();
  for (const l of ligands) counts.set(l.el, (counts.get(l.el) ?? 0) + 1);
  const formula = center + [...counts.entries()].sort(([a], [b]) => (a === 'H' ? -1 : b === 'H' ? 1 : a.localeCompare(b))).map(([e, n]) => e + (n > 1 ? n : '')).join('');
  const known = Object.values(PRESETS).find((p) => p.formula === formula && p.center === center);
  return known ?? { id: 'custom', formula, center, ligands, lonePairs: lp };
}

type Domain = { kind: 'bond' | 'lone'; order: number; p: THREE.Vector3; lig?: Ligand };
type Listener = (...args: any[]) => void;

export interface AngleReading { label: string; deg: number; }

export class Workbench {
  readonly el: HTMLElement;
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera: THREE.PerspectiveCamera;
  private controls: OrbitControls;
  private group = new THREE.Group();
  private domains: Domain[] = [];
  private spec: MoleculeSpec = PRESETS.NH3;
  private listeners = new Map<string, Set<Listener>>();
  private raf = 0;
  private settled = false;
  private frames = 0;
  private ro: ResizeObserver;
  private disposed = false;
  private labelCache = new Map<string, THREE.Texture>();
  private reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  lambda = 1.25;            // how much harder a lone pair pushes than a bonding pair
  showLonePairs = true;
  ignoreLonePairs = false;  // the "wrong model": lone pairs take no space
  showDipole = false;

  constructor(host: HTMLElement, compact = false) {
    this.el = host;
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.domElement.className = 'wb-canvas';
    this.renderer.domElement.setAttribute('role', 'img');
    host.appendChild(this.renderer.domElement);
    this.camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
    this.camera.position.set(0.4, 0.9, compact ? 8.4 : 6.9);
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.enablePan = false;
    this.controls.minDistance = 3.5;
    this.controls.maxDistance = 11;
    this.controls.autoRotate = !this.reducedMotion;
    this.controls.autoRotateSpeed = 0.6;
    this.controls.addEventListener('start', () => { this.controls.autoRotate = false; });

    this.scene.add(new THREE.HemisphereLight(0xc9d8ff, 0x1a2240, 1.6));
    const key = new THREE.DirectionalLight(0xffffff, 2.2); key.position.set(3, 5, 4); this.scene.add(key);
    const rim = new THREE.DirectionalLight(0x8fb3ff, 1.1); rim.position.set(-4, -2, -3); this.scene.add(rim);
    this.scene.add(this.group);

    this.ro = new ResizeObserver(() => this.resize());
    this.ro.observe(host);
    this.resize();
    this.load(this.spec);
    this.loop();
  }

  on(evt: string, f: Listener) { if (!this.listeners.has(evt)) this.listeners.set(evt, new Set()); this.listeners.get(evt)!.add(f); return () => this.listeners.get(evt)!.delete(f); }
  private emit(evt: string, ...args: unknown[]) { this.listeners.get(evt)?.forEach((f) => f(...args)); }

  get current(): MoleculeSpec { return this.spec; }

  load(s: MoleculeSpec | string) {
    this.spec = typeof s === 'string' ? PRESETS[s] : s;
    const sp = this.spec;
    const n = sp.ligands.length + sp.lonePairs;
    // Start "flat": lone pairs near the top, bonds spread around the equator. The pairs then push into place.
    this.domains = [];
    let li = 0;
    for (let i = 0; i < sp.lonePairs; i++) {
      const a = (i / Math.max(1, sp.lonePairs)) * Math.PI * 2 + 0.3;
      this.domains.push({ kind: 'lone', order: 1, p: new THREE.Vector3(0.35 * Math.cos(a), 0.94, 0.35 * Math.sin(a)).normalize() });
    }
    for (const lig of sp.ligands) {
      const a = (li++ / sp.ligands.length) * Math.PI * 2 + 0.15;
      // Small alternating tilt breaks the symmetry so the pairs never get stuck in a flat square.
      const tilt = (li % 2 ? 1 : -1) * (sp.lonePairs ? 0.06 : 0.22) - 0.04;
      this.domains.push({ kind: 'bond', order: lig.order, lig, p: new THREE.Vector3(Math.cos(a), tilt, Math.sin(a)).normalize() });
    }
    if (n === 1) this.domains[0].p.set(1, 0, 0);
    this.settled = false;
    this.frames = 0;
    if (this.reducedMotion) for (let i = 0; i < 1200; i++) this.relax(0.02);
    this.rebuild();
    this.emit('loaded', sp);
  }

  setLambda(x: number) { this.lambda = x; this.settled = false; this.frames = 15; }
  setIgnoreLonePairs(b: boolean) {
    this.ignoreLonePairs = b;
    if (!b) this.spreadLonePairs();
    this.settled = false; this.frames = 0; this.rebuild(); this.emit('toggle', 'ignore', b);
  }

  /** Give lone pairs distinct starting points again (after the wrong model parked them together). */
  private spreadLonePairs() {
    const lps = this.domains.filter((d) => d.kind === 'lone');
    if (!lps.length) return;
    const avg = new THREE.Vector3();
    this.domains.filter((d) => d.kind === 'bond').forEach((d) => avg.add(d.p));
    const away = avg.lengthSq() > 1e-6 ? avg.negate().normalize() : new THREE.Vector3(0, 1, 0);
    const side = new THREE.Vector3(1, 0, 0).cross(away);
    if (side.lengthSq() < 1e-6) side.set(0, 0, 1);
    side.normalize();
    lps.forEach((d, i) => {
      const a = (i / lps.length) * Math.PI * 2;
      const off = side.clone().applyAxisAngle(away, a).multiplyScalar(lps.length > 1 ? 0.45 : 0);
      d.p.copy(away).add(off).normalize();
    });
  }
  setShowLonePairs(b: boolean) { this.showLonePairs = b; this.rebuild(); this.emit('toggle', 'lonepairs', b); }
  setShowDipole(b: boolean) { this.showDipole = b; this.rebuild(); this.emit('toggle', 'dipole', b); }

  /** Pairwise weight: a lone pair pushes λ times as hard as a single bond; multiple bonds slightly more. */
  private weight(d: Domain): number {
    if (d.kind === 'lone') return this.lambda;
    return d.order === 1 ? 1 : d.order === 2 ? 1.12 : 1.2;
  }

  private relax(step: number): number {
    const act = this.domains.filter((d) => !(this.ignoreLonePairs && d.kind === 'lone'));
    if (act.length < 2) return 0;
    const forces = act.map(() => new THREE.Vector3());
    const diff = new THREE.Vector3();
    for (let i = 0; i < act.length; i++) {
      for (let j = i + 1; j < act.length; j++) {
        diff.subVectors(act[i].p, act[j].p);
        if (diff.lengthSq() < 1e-8) diff.set(0.01 * (i - j), 0.013, -0.007);
        const r = Math.max(diff.length(), 1e-3);
        const f = (2 * this.weight(act[i]) * this.weight(act[j])) / (r * r * r); // from E = Σ w/r²
        diff.multiplyScalar(f / r);
        forces[i].add(diff);
        forces[j].sub(diff);
      }
    }
    let maxMove = 0;
    act.forEach((d, i) => {
      const f = forces[i];
      f.addScaledVector(d.p, -f.dot(d.p)); // keep only the tangential part
      const move = f.multiplyScalar(step);
      if (move.length() > 0.08) move.setLength(0.08);
      d.p.add(move).normalize();
      maxMove = Math.max(maxMove, move.length());
    });
    // In the wrong model the ignored lone pairs just ride along opposite the bonds' average.
    if (this.ignoreLonePairs) {
      const avg = new THREE.Vector3();
      act.forEach((d) => avg.add(d.p));
      const away = avg.lengthSq() > 1e-6 ? avg.clone().negate().normalize() : new THREE.Vector3(0, 1, 0);
      const side = new THREE.Vector3(0, 0, 1).cross(away);
      if (side.lengthSq() < 1e-6) side.set(1, 0, 0);
      side.normalize();
      const lps = this.domains.filter((d) => d.kind === 'lone');
      lps.forEach((d, k) => {
        const target = away.clone().addScaledVector(side, lps.length > 1 ? (k ? 0.35 : -0.35) : 0).normalize();
        d.p.lerp(target, 0.2).normalize();
      });
    }
    return maxMove;
  }

  private loop = () => {
    if (this.disposed) return;
    this.raf = requestAnimationFrame(this.loop);
    if (!this.settled) {
      let m = 0;
      for (let i = 0; i < 10; i++) m = this.relax(0.025);
      this.frames++;
      this.updatePositions();
      if (m < 6e-6 && this.frames > 30) {
        this.settled = true;
        this.updatePositions(true);
        this.emit('settled', this.angles());
      } else this.emit('moving');
    }
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  };

  private resize() {
    const w = this.el.clientWidth || 300, h = this.el.clientHeight || 300;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  // ---------- geometry ----------
  private centerRadius() { return RADIUS[this.spec.center] ?? 0.5; }
  private bondLength(lig: Ligand) { return 1.25 + this.centerRadius() * 0.6 + (RADIUS[lig.el] ?? 0.4) * 0.7; }

  private meshes: { atoms: THREE.Mesh[]; lone: THREE.Group[]; bonds: THREE.Group[]; labels: THREE.Sprite[]; dipole?: THREE.Group } = { atoms: [], lone: [], bonds: [], labels: [] };

  private rebuild() {
    for (const child of [...this.group.children]) this.disposeObject(child);
    this.group.clear();
    this.meshes = { atoms: [], lone: [], bonds: [], labels: [] };
    const sp = this.spec;
    const center = this.atomMesh(sp.center, 1);
    this.group.add(center);
    const cl = this.label(sp.center + (sp.charge ? '+' : ''), 0.55);
    cl.position.set(0, 0, 0);
    cl.renderOrder = 10;
    this.group.add(cl);
    this.meshes.labels.push(cl);
    for (const d of this.domains) {
      if (d.kind === 'bond' && d.lig) {
        const atom = this.atomMesh(d.lig.el, 0.92);
        this.group.add(atom);
        this.meshes.atoms.push(atom);
        const bond = new THREE.Group();
        this.group.add(bond);
        this.meshes.bonds.push(bond);
        const lab = this.label(d.lig.el, 0.42);
        lab.renderOrder = 10;
        this.group.add(lab);
        this.meshes.labels.push(lab);
      } else {
        const lobe = this.lonePairMesh();
        lobe.visible = this.showLonePairs;
        this.group.add(lobe);
        this.meshes.lone.push(lobe);
      }
    }
    if (this.showDipole) {
      this.meshes.dipole = new THREE.Group();
      this.group.add(this.meshes.dipole);
    }
    this.updatePositions(true);
  }

  private updatePositions(full = false) {
    let ai = 0, li = 0, bi = 0, lab = 1;
    for (const d of this.domains) {
      if (d.kind === 'bond' && d.lig) {
        const L = this.bondLength(d.lig);
        const pos = d.p.clone().multiplyScalar(L);
        this.meshes.atoms[ai++].position.copy(pos);
        this.meshes.labels[lab++].position.copy(d.p.clone().multiplyScalar(L));
        const g = this.meshes.bonds[bi++];
        if (full || g.children.length === 0) this.bondMeshes(g, d);
        this.orientBond(g, d, L);
      } else {
        const g = this.meshes.lone[li++];
        g.position.copy(d.p.clone().multiplyScalar(this.centerRadius() + 0.38));
        g.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.p);
        const faded = this.ignoreLonePairs;
        g.traverse((o) => { const m = (o as THREE.Mesh).material as THREE.MeshStandardMaterial | undefined; if (m && 'opacity' in m) m.opacity = faded ? (o.userData.dot ? 0.25 : 0.08) : (o.userData.dot ? 0.95 : 0.38); });
      }
    }
    if (this.meshes.dipole && (full || !this.settled)) this.dipoleMesh(this.meshes.dipole);
  }

  private atomMesh(el: string, scale: number): THREE.Mesh {
    const r = (RADIUS[el] ?? 0.45) * scale;
    const m = new THREE.Mesh(new THREE.SphereGeometry(r, 40, 28), new THREE.MeshStandardMaterial({ color: ATOM_COLOR[el] ?? 0xcccccc, roughness: 0.5, metalness: 0.05 }));
    m.userData.el = el;
    return m;
  }

  private lonePairMesh(): THREE.Group {
    const g = new THREE.Group();
    const lobe = new THREE.Mesh(
      new THREE.SphereGeometry(0.3, 32, 24),
      new THREE.MeshStandardMaterial({ color: COLORS.lonePair, emissive: COLORS.lonePair, emissiveIntensity: 0.35, transparent: true, opacity: 0.38, depthWrite: false, roughness: 0.3 }),
    );
    lobe.scale.set(1, 1.7, 1);
    g.add(lobe);
    for (const x of [-0.09, 0.09]) {
      const dot = new THREE.Mesh(new THREE.SphereGeometry(0.055, 16, 12), new THREE.MeshStandardMaterial({ color: 0xe6dcff, emissive: COLORS.lonePair, emissiveIntensity: 0.9, transparent: true, opacity: 0.95 }));
      dot.position.set(x, 0.12, 0);
      dot.userData.dot = true;
      g.add(dot);
    }
    return g;
  }

  private bondMeshes(g: THREE.Group, d: Domain) {
    for (const c of [...g.children]) this.disposeObject(c);
    g.clear();
    const lig = d.lig!;
    const offsets = lig.order === 1 ? [0] : lig.order === 2 ? [-0.075, 0.075] : [-0.11, 0, 0.11];
    const radius = lig.order === 1 ? 0.075 : 0.05;
    const dchi = (CHI[lig.el] ?? 2.5) - (CHI[this.spec.center] ?? 2.5);
    const polarView = this.showDipole && Math.abs(dchi) >= 0.15;
    const strength = Math.min(1, Math.abs(dchi) / 1.4);
    const base = new THREE.Color(0xcfc8b6);
    // Half-bonds: the end near the more electronegative atom turns blue (δ−), the other red (δ+).
    const nearCenter = polarView ? base.clone().lerp(new THREE.Color(dchi > 0 ? COLORS.positive : COLORS.electron), 0.25 + 0.6 * strength) : base;
    const nearLig = polarView ? base.clone().lerp(new THREE.Color(dchi > 0 ? COLORS.electron : COLORS.positive), 0.25 + 0.6 * strength) : base;
    for (const off of offsets) {
      for (const [half, col] of [[0, nearCenter], [1, nearLig]] as const) {
        const cyl = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, 0.5, 16), new THREE.MeshStandardMaterial({ color: col, roughness: 0.45 }));
        cyl.userData.half = half;
        cyl.userData.off = off;
        g.add(cyl);
      }
    }
  }

  private orientBond(g: THREE.Group, d: Domain, L: number) {
    const start = this.centerRadius() * 0.7;
    const end = L - (RADIUS[d.lig?.el ?? 'H'] ?? 0.3) * 0.5;
    const len = Math.max(0.1, end - start);
    g.position.set(0, 0, 0);
    g.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.p);
    // A perpendicular for parallel double/triple bonds, kept roughly facing the camera.
    for (const c of g.children) {
      const half = c.userData.half as number;
      c.scale.set(1, (len / 2) / 0.5, 1);
      c.position.set(c.userData.off as number, start + len / 4 + half * (len / 2), 0);
    }
  }

  private dipoleVector(): THREE.Vector3 {
    const v = new THREE.Vector3();
    const chiC = CHI[this.spec.center] ?? 2.5;
    for (const d of this.domains) {
      if (d.kind === 'bond' && d.lig) v.addScaledVector(d.p, (CHI[d.lig.el] ?? 2.5) - chiC);
      else if (!this.ignoreLonePairs) v.addScaledVector(d.p, 0.6);
    }
    return v;
  }

  private dipoleMesh(g: THREE.Group) {
    for (const c of [...g.children]) this.disposeObject(c);
    g.clear();
    const v = this.dipoleVector();
    const mag = v.length();
    if (mag < 0.25) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.75, 0.02, 8, 64), new THREE.MeshBasicMaterial({ color: COLORS.chalk, transparent: true, opacity: 0.55 }));
      ring.rotation.x = Math.PI / 2;
      g.add(ring);
      return;
    }
    const dir = v.clone().normalize();
    const len = 1.2 + Math.min(1.6, mag * 1.1);
    const mat = new THREE.MeshStandardMaterial({ color: COLORS.electron, emissive: COLORS.electron, emissiveIntensity: 0.6, depthTest: false, transparent: true, opacity: 0.92 });
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, len, 12), mat);
    shaft.position.y = 0;
    const head = new THREE.Mesh(new THREE.ConeGeometry(0.13, 0.32, 20), mat);
    head.position.y = len / 2 + 0.16;
    const cross = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.34, 10), new THREE.MeshStandardMaterial({ color: COLORS.positive, emissive: COLORS.positive, emissiveIntensity: 0.5, depthTest: false, transparent: true }));
    cross.rotation.z = Math.PI / 2;
    cross.position.y = -len / 2 + 0.18;
    const arrow = new THREE.Group();
    arrow.add(shaft, head, cross);
    arrow.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
    arrow.traverse((o) => { o.renderOrder = 20; });
    g.add(arrow);
  }

  private label(text: string, size: number): THREE.Sprite {
    let tex = this.labelCache.get(text);
    if (!tex) {
      const c = document.createElement('canvas');
      c.width = c.height = 128;
      const ctx = c.getContext('2d')!;
      ctx.font = '600 64px "Atkinson Hyperlegible Next", system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.lineWidth = 7;
      ctx.strokeStyle = 'rgba(18,26,51,0.85)';
      ctx.strokeText(text, 64, 68);
      ctx.fillStyle = '#f4efe2';
      ctx.fillText(text, 64, 68);
      tex = new THREE.CanvasTexture(c);
      tex.colorSpace = THREE.SRGBColorSpace;
      this.labelCache.set(text, tex);
    }
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, depthTest: false, transparent: true }));
    sp.scale.set(size, size, 1);
    return sp;
  }

  private disposeObject(o: THREE.Object3D) {
    o.traverse((x) => {
      const m = x as THREE.Mesh;
      m.geometry?.dispose?.();
      const mat = m.material as THREE.Material | THREE.Material[] | undefined;
      if (Array.isArray(mat)) mat.forEach((mm) => mm.dispose()); else mat?.dispose?.();
    });
  }

  // ---------- readings ----------
  angles(): AngleReading[] {
    const bonds = this.domains.filter((d) => d.kind === 'bond' && d.lig);
    const groups = new Map<string, number[]>();
    for (let i = 0; i < bonds.length; i++) for (let j = i + 1; j < bonds.length; j++) {
      const a = bonds[i].lig!.el, b = bonds[j].lig!.el;
      const key = [a, b].sort((x, y) => (x === 'H' ? -1 : y === 'H' ? 1 : x.localeCompare(y))).join('|');
      const deg = THREE.MathUtils.radToDeg(bonds[i].p.angleTo(bonds[j].p));
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(deg);
    }
    return [...groups.entries()].map(([key, arr]) => {
      const [a, b] = key.split('|');
      return { label: `${a}–${this.spec.center}–${b}`, deg: arr.reduce((s, x) => s + x, 0) / arr.length };
    });
  }
  dipoleMagnitude(): number { return this.dipoleVector().length(); }
  isPolar(): boolean { return this.dipoleMagnitude() >= 0.25; }
  hasPolarBonds(): boolean {
    const c = CHI[this.spec.center] ?? 2.5;
    return this.spec.ligands.some((l) => Math.abs((CHI[l.el] ?? 2.5) - c) >= 0.4);
  }
  isSettled() { return this.settled; }
  snapshot(): string { return this.renderer.domElement.toDataURL('image/png'); }

  dispose() {
    this.disposed = true;
    cancelAnimationFrame(this.raf);
    this.ro.disconnect();
    this.controls.dispose();
    for (const child of [...this.group.children]) this.disposeObject(child);
    this.labelCache.forEach((t) => t.dispose());
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }
}
