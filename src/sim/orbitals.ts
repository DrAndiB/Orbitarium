// The Orbital Viewer engine: one atom, shown as shells (the Bohr picture) or as orbital clouds,
// electron by electron. Units 1–3 use it for filling, shielding and ionization.
import * as THREE from 'three';
import { Stage3D } from './stage';
import { groundConfig, subById, outerShell, zeff, shellCounts, boxes, type Config } from '../content/atoms';
import { byZ } from '../content/elements';

export type AtomView = 'shells' | 'clouds';
export const SUB_COLOR: Record<number, number> = { 0: 0xffc15e, 1: 0x76cfc4, 2: 0x8ea9dc, 3: 0xd8c3a2 };
const FIXED_R = [0.9, 1.65, 2.4, 3.1, 3.7];
/** Measured ionic radii (pm, Shannon, six-fold coordination) for the ions the units use. */
export const IONIC_RADIUS: Record<string, number> = {
  '3+1': 76, '11+1': 102, '19+1': 138, '12+2': 72, '20+2': 100, '13+3': 54, '8-2': 140, '9-1': 133, '16-2': 184, '17-1': 181, '35-1': 196, '53-1': 220,
};

export class AtomStage extends Stage3D {
  Z = 11;
  config: Config = groundConfig(11);
  view: AtomView = 'shells';
  /** Unit 2: how well inner electrons shield (1 = the usual simple model). */
  shielding = 1;
  /** Unit 2: draw the outer shell at the measured atom size, inner shells in proportion. */
  sizeMode = false;
  highlight: string | null = null;
  newest: string | null = null;
  private atom = new THREE.Group();
  private electronGroups: { g: THREE.Group; speed: number }[] = [];

  constructor(host: HTMLElement, compact = false) {
    super(host, { distance: compact ? 10.5 : 9.5, minDistance: 4, maxDistance: 18 });
    const d = compact ? 10.5 : 9.5;
    this.camera.position.set(0.4, d * 0.5, d * 0.87);   // looking down at about 30°, so the shells read as rings
    this.root.add(this.atom);
    this.build();
  }

  setAtom(Z: number, config?: Config, newest: string | null = null) {
    this.Z = Z;
    this.config = config ?? groundConfig(Z);
    this.newest = newest;
    this.build();
  }
  setView(v: AtomView) { this.view = v; this.build(); this.emit('view', v); }
  setShielding(f: number) { this.shielding = f; this.build(); }
  setSizeMode(on: boolean) { this.sizeMode = on; this.build(); }
  setHighlight(id: string | null) { this.highlight = id; this.build(); }

  /** Effective nuclear charge on the outer shell with the current shielding. */
  zeffOuter(): number { return zeff(this.Z, this.config, this.shielding); }

  /** Radius in scene units for shell n. */
  shellRadius(n: number): number {
    if (!this.sizeMode) return FIXED_R[n - 1] ?? 4;
    // Size mode: the outer shell at the measured size of the atom or ion (scaled by how the pull changes with
    // shielding); inner shells at fixed fractions of it, so they stay visible (not to scale).
    const outer = outerShell(this.config);
    const charge = this.Z - [...this.config.values()].reduce((a, b) => a + b, 0);
    const ionR = charge !== 0 ? IONIC_RADIUS[`${this.Z}${charge > 0 ? '+' : '-'}${Math.abs(charge)}`] : undefined;
    const measured = (ionR ?? byZ(this.Z).r ?? 120) / 100;  // pm → scene units (1 unit ≈ 100 pm)
    const zDefault = zeff(this.Z, this.config, 1), zNow = this.zeffOuter();
    const rOuter = Math.min(5.2, Math.max(0.5, measured * 1.6 * (zDefault / Math.max(0.5, zNow))));
    if (n >= outer) return rOuter;
    return rOuter * [1, 0.55, 0.32, 0.18, 0.1][outer - n];
  }

  /** Whether the size of the current atom or ion is measured (true) or only modelled. */
  sizeKnown(): boolean {
    const charge = this.Z - [...this.config.values()].reduce((a, b) => a + b, 0);
    return charge === 0 ? byZ(this.Z).r !== null : !!IONIC_RADIUS[`${this.Z}${charge > 0 ? '+' : '-'}${Math.abs(charge)}`];
  }

  private build() {
    this.clearGroup(this.atom);
    this.electronGroups = [];
    const charge = this.Z - [...this.config.values()].reduce((a, b) => a + b, 0);
    // nucleus
    const nuc = new THREE.Mesh(new THREE.SphereGeometry(0.26, 32, 24), new THREE.MeshStandardMaterial({ color: 0xff8a7a, emissive: 0x401010, roughness: 0.4 }));
    this.atom.add(nuc);
    const lab = this.label(`${this.Z}+`, 0.32, '#ffffff');
    lab.position.set(0, 0.5, 0);
    this.atom.add(lab);
    if (this.view === 'shells') this.buildShells(); else this.buildClouds();
    const e = byZ(this.Z);
    this.setLabel(`${e.en}, ${charge === 0 ? 'neutral atom' : charge > 0 ? `${charge}+ ion` : `${-charge}− ion`}, shells ${shellCounts(this.config).join(', ')}`);
    this.emit('built');
  }

  private buildShells() {
    const counts = shellCounts(this.config);
    counts.forEach((k, i) => {
      if (!k) return;
      const n = i + 1, R = this.shellRadius(n);
      const ring = new THREE.Mesh(new THREE.TorusGeometry(R, 0.012, 8, 128), new THREE.MeshBasicMaterial({ color: 0x4a5a8f, transparent: true, opacity: 0.8 }));
      ring.rotation.x = Math.PI / 2;
      this.atom.add(ring);
      const g = new THREE.Group();
      // newest electron glows
      const newestShell = this.newest ? subById(this.newest).n : 0;
      for (let j = 0; j < k; j++) {
        const a = (j / k) * Math.PI * 2;
        const hot = newestShell === n && j === k - 1;
        const dot = new THREE.Mesh(new THREE.SphereGeometry(hot ? 0.12 : 0.085, 16, 12), new THREE.MeshStandardMaterial({ color: hot ? 0xffffff : 0x5aa9ff, emissive: hot ? 0xffc15e : 0x123a6a, emissiveIntensity: hot ? 1.2 : 0.8 }));
        dot.position.set(R * Math.cos(a), 0, R * Math.sin(a));
        g.add(dot);
      }
      this.atom.add(g);
      this.electronGroups.push({ g, speed: this.reducedMotion ? 0 : 0.9 / Math.pow(n, 1.2) });
      // labels fan out around the front of the rings so they don't sit on top of each other
      const sl = this.label(`n = ${n}: ${k}`, 0.24, '#9aa3bf');
      const th = Math.PI * (0.12 + 0.13 * (n - 1));
      sl.position.set((R + 0.15) * Math.cos(th), 0.18, (R + 0.15) * Math.sin(th));
      this.atom.add(sl);
    });
  }

  /** Orbitals drawn as translucent lobes (the textbook shapes): s a sphere, p two lobes on an axis, d four-leaf clovers. */
  private buildClouds() {
    const outer = outerShell(this.config);
    for (const [id, e] of this.config) {
      if (!e) continue;
      const s = subById(id);
      const R = this.shellRadius(s.n);
      const occ = boxes(s, e);
      // Without a highlight, the core is drawn faint and the outer (valence) subshells strong.
      const valence = s.n === outer || (s.l === 2 && s.n === outer - 1 && e < s.cap);
      const dim = this.highlight ? this.highlight !== id : !valence;
      const isNew = this.newest === id;
      occ.forEach((o, m) => {
        if (!o) return;
        const opacity = (dim ? 0.06 : (o === 2 ? 0.42 : 0.24) + (isNew ? 0.2 : 0)) * (s.l === 0 ? 0.45 : 1);
        const mat = new THREE.MeshStandardMaterial({ color: SUB_COLOR[s.l], transparent: true, opacity, depthWrite: false, roughness: 0.6, emissive: SUB_COLOR[s.l], emissiveIntensity: isNew ? 0.35 : 0.12 });
        const g = orbitalShape(s.l, m, R, mat);
        this.atom.add(g);
      });
    }
  }

  protected tick(dt: number) {
    for (const { g, speed } of this.electronGroups) g.rotation.y += dt * speed;
  }
}

/** One orbital as lobes around the nucleus. Radius R is the shell's size. */
function orbitalShape(l: number, m: number, R: number, mat: THREE.Material): THREE.Group {
  const g = new THREE.Group();
  const lobe = (dir: THREE.Vector3, len: number, wid: number, off: number) => {
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(1, 28, 20), mat);
    mesh.scale.set(wid, len, wid);
    mesh.position.copy(dir.clone().normalize().multiplyScalar(off));
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
    g.add(mesh);
  };
  if (l === 0) {
    const sph = new THREE.Mesh(new THREE.SphereGeometry(R * 0.95, 36, 24), mat);
    g.add(sph);
    return g;
  }
  const X = new THREE.Vector3(1, 0, 0), Y = new THREE.Vector3(0, 1, 0), Z = new THREE.Vector3(0, 0, 1);
  if (l === 1) {
    const axis = [X, Y, Z][m % 3];
    lobe(axis, R * 0.52, R * 0.3, R * 0.55);
    lobe(axis.clone().negate(), R * 0.52, R * 0.3, R * 0.55);
    return g;
  }
  // d orbitals
  const len = R * 0.42, wid = R * 0.2, off = R * 0.5;
  const diag = (a: THREE.Vector3, b: THREE.Vector3) => [a.clone().add(b), a.clone().sub(b), a.clone().negate().add(b), a.clone().negate().sub(b)];
  switch (m % 5) {
    case 0: diag(X, Y).forEach((d) => lobe(d, len, wid, off)); break;           // dxy
    case 1: diag(X, Z).forEach((d) => lobe(d, len, wid, off)); break;           // dxz
    case 2: diag(Y, Z).forEach((d) => lobe(d, len, wid, off)); break;           // dyz
    case 3: [X, X.clone().negate(), Y, Y.clone().negate()].forEach((d) => lobe(d, len, wid, off)); break; // dx²−y²
    default: {                                                                  // dz²: two lobes and a ring
      lobe(Z, len * 1.1, wid, off); lobe(Z.clone().negate(), len * 1.1, wid, off);
      const ring = new THREE.Mesh(new THREE.TorusGeometry(R * 0.36, R * 0.1, 12, 40), mat);
      g.add(ring);
    }
  }
  return g;
}
