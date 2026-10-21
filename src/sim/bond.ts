// The Charge Field engine (unit 5): two atoms and the electron pair(s) they share. A long-exposure cloud shows
// where the shared pair spends its time; it slides towards the more electronegative atom, and the atoms take on
// partial charges (red δ−, blue δ+, as in textbook potential maps).
import * as THREE from 'three';
import { Stage3D } from './stage';
import { bySymbol } from '../content/elements';
import { bondData, ionicCharacter, band } from '../content/bonds';
import { CHARGE } from './workbench';

const PM = 0.018;             // scene units per pm
const POINTS = 2200;
const ATOM_COLOR: Record<string, number> = { H: 0xe9e3d3, C: 0x5d6479, N: 0x93a6c9, O: 0xd2bfa6, F: 0xb2d6bf, Na: 0xb9a7d6, Cl: 0x9fc79a };

export const chiOf = (s: string) => bySymbol(s)?.chi ?? 2.2;

export class BondStage extends Stage3D {
  a = 'H';
  b = 'Cl';
  order: 1 | 2 | 3 = 1;
  /** "what if" electronegativity for atom b, or null for the real value */
  chiB: number | null = null;
  private mol = new THREE.Group();
  private cloud!: THREE.Points;
  private live: THREE.Mesh[] = [];
  private samples: THREE.Vector3[] = [];
  private reveal = 0;
  private hop = 0;

  private baseDist: number;

  constructor(host: HTMLElement, compact = false) {
    super(host, { distance: compact ? 11 : 10, minDistance: 4, maxDistance: 20, autoRotate: true });
    this.baseDist = compact ? 11 : 10;
    this.camera.position.set(0.5, 2.2, this.baseDist);
    this.root.add(this.mol);
    this.build();
  }

  get chiA() { return chiOf(this.a); }
  get chiBNow() { return this.chiB ?? chiOf(this.b); }
  /** Δχ = χ(b) − χ(a): positive when b pulls harder. */
  get dchi() { return this.chiBNow - this.chiA; }
  get band() { return band(this.dchi); }
  /** Pauling's estimate of the ionic character (0–1). */
  get ionic() { return ionicCharacter(Math.abs(this.dchi)); }
  /** Bond length in pm: measured when known, otherwise the sum of the atoms' radii. */
  get length(): { pm: number; measured: boolean } {
    const d = bondData(this.a, this.b, this.order);
    if (d) return { pm: d.length, measured: true };
    const ra = bySymbol(this.a)?.r ?? 70, rb = bySymbol(this.b)?.r ?? 70;
    return { pm: Math.round((ra + rb) * (this.order === 1 ? 1 : this.order === 2 ? 0.87 : 0.78)), measured: false };
  }

  setBond(a: string, b: string, order: 1 | 2 | 3 = 1) {
    this.a = a; this.b = b; this.order = order; this.chiB = null;
    this.build();
    this.emit('bond', a, b, order);
  }
  setChiB(v: number | null) { this.chiB = v; this.build(false); this.emit('dial', v); }

  private build(fresh = true) {
    this.clearGroup(this.mol);
    this.live = [];
    const L = this.length.pm * PM;
    // keep long bonds (Na–Cl) in frame
    if (fresh) this.camera.position.setLength(Math.max(this.baseDist, L * 2.9));
    const xa = -L / 2, xb = L / 2;
    const q = this.ionic * Math.sign(this.dchi);      // + : b is δ−
    // atoms: a solid core with a halo tinted by its partial charge
    const atom = (s: string, x: number, charge: number) => {
      const r = Math.max(0.24, Math.min(0.6, (bySymbol(s)?.r ?? 70) * 0.0028 + 0.17));
      const core = new THREE.Mesh(new THREE.SphereGeometry(r, 32, 24), new THREE.MeshStandardMaterial({ color: ATOM_COLOR[s] ?? 0xcccccc, roughness: 0.5 }));
      core.position.x = x;
      this.mol.add(core);
      const tint = charge > 0 ? CHARGE.plus : CHARGE.minus;
      const halo = new THREE.Mesh(new THREE.SphereGeometry(r * 1.55, 32, 24), new THREE.MeshBasicMaterial({ color: tint, transparent: true, opacity: Math.min(0.5, Math.abs(charge) * 0.7), depthWrite: false }));
      halo.position.x = x;
      if (Math.abs(charge) > 0.04) this.mol.add(halo);
      const lab = this.label(s, 0.42, '#121a33');
      lab.position.set(x, 0, 0);
      this.mol.add(lab);
      const qt = Math.abs(charge) < 0.04 ? '' : this.band === 'ionic' ? (charge > 0 ? '+' : '−') : (charge > 0 ? 'δ+' : 'δ−');
      if (qt) {
        const ql = this.label(qt, 0.42, charge > 0 ? '#8fc4ff' : '#ff9a9a');
        ql.position.set(x, r * 1.55 + 0.42, 0);
        this.mol.add(ql);
      }
    };
    atom(this.a, xa, q);       // a carries +q (δ+ when b pulls harder)
    atom(this.b, xb, -q);
    // sticks: one per shared pair
    const offs = this.order === 1 ? [0] : this.order === 2 ? [-0.11, 0.11] : [-0.16, 0, 0.16];
    for (const o of offs) {
      const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, L, 12), new THREE.MeshStandardMaterial({ color: 0xcfc8b6, roughness: 0.6, transparent: true, opacity: this.band === 'ionic' ? 0.25 : 0.85 }));
      stick.rotation.z = Math.PI / 2;
      stick.position.y = o;
      this.mol.add(stick);
    }
    // the long-exposure cloud: where the shared pair spends its time
    const f = 0.5 + 0.5 * q;                             // share of time near b
    this.samples = [];
    const pos = new Float32Array(POINTS * 3);
    const gauss = () => { let u = 0, v = 0; while (!u) u = Math.random(); v = Math.random(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
    for (let i = 0; i < POINTS; i++) {
      const nearB = Math.random() < f;
      // centred a little inside the bond from each atom; spreads more around a strongly δ− atom
      const cx = nearB ? xb - L * 0.25 * (1 - Math.abs(q)) : xa + L * 0.25 * (1 - Math.abs(q));
      const sAx = 0.15 + L * 0.18, sR = 0.28 + L * 0.05;
      const p = new THREE.Vector3(cx + gauss() * sAx, gauss() * sR, gauss() * sR);
      this.samples.push(p);
      pos.set([p.x, p.y, p.z], i * 3);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    this.cloud = new THREE.Points(geo, new THREE.PointsMaterial({ color: 0xffd98a, size: 0.05, transparent: true, opacity: 0.5, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending }));
    this.reveal = fresh && !this.reducedMotion ? 0 : POINTS;
    geo.setDrawRange(0, this.reveal);
    this.mol.add(this.cloud);
    // the pair(s) right now
    for (let i = 0; i < this.order * 2; i++) {
      const e = new THREE.Mesh(new THREE.SphereGeometry(0.09, 14, 10), new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffc15e, emissiveIntensity: 1.2, depthTest: false, transparent: true }));
      e.renderOrder = 20;
      this.mol.add(e);
      this.live.push(e);
    }
    this.hopNow();
    const name = `${this.a}${this.order === 1 ? '–' : this.order === 2 ? '=' : '≡'}${this.b}`;
    this.setLabel(`${name}: electronegativity difference ${Math.abs(this.dchi).toFixed(2)}, ${this.band}`);
    this.emit('built');
  }

  private hopNow() { for (const e of this.live) e.position.copy(this.samples[Math.floor(Math.random() * this.samples.length)] ?? new THREE.Vector3()); }

  protected tick(dt: number) {
    if (this.reveal < POINTS) {
      this.reveal = Math.min(POINTS, this.reveal + Math.ceil(POINTS * dt / 2.2));
      this.cloud.geometry.setDrawRange(0, this.reveal);
    }
    this.hop += dt;
    if (!this.reducedMotion && this.hop > 0.14) { this.hop = 0; this.hopNow(); }
  }
}
