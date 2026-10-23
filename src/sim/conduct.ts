// The conduction view (unit 7, Lattice Builder family): one material between two electrode plates, wired to a
// battery and a lamp. With the battery connected, whatever charged particles can move drift towards the plate of
// opposite charge: electrons in a metal, ions in a melt or a solution. Solid salt, sugar water and pure water have
// none that can move, so nothing drifts and the lamp stays off.
import * as THREE from 'three';
import { Stage3D } from './stage';
import { CHARGE } from './workbench';
import { CONDUCTIVITY } from '../content/substances';
import type { ConductMaterial } from '../content/unitTypes';

const X = 3.0;                     // plates at x = ±X
const SLAB = { x: 2.62, y: 1.75, z: 1.2 };
const ELECTRON = 0xff8f8f;
const CORE = 0x5aa9ff;
const WATER = 0x8fa3c8;
const SUGAR = 0xbdb6a6;

type Kind = 'core' | 'electron' | 'cation' | 'anion' | 'water' | 'sugar';
interface Pool { kind: Kind; mesh: THREE.InstancedMesh; n: number; pos: Float32Array; vel: Float32Array; home: Float32Array; }

/** How bright the lamp glows, 0–1, from the conductivity on a log scale. */
export function lampLevel(sigma: number): number {
  return Math.max(0, Math.min(1, (Math.log10(sigma) + 2) / 9.8));
}

export class ConductStage extends Stage3D {
  material: ConductMaterial = 'Cu';
  power = false;
  reversed = false;
  private matter = new THREE.Group();
  private circuit = new THREE.Group();
  private arrows = new THREE.Group();
  private pools: Pool[] = [];
  private onSince = 0;
  private reported = false;
  private lamp!: THREE.Mesh;
  private glow!: THREE.Sprite;
  private wireMat = new THREE.LineBasicMaterial({ color: 0x6d7699, transparent: true, opacity: 0.9 });
  private poleLabels: THREE.Sprite[] = [];
  private batteryGroup = new THREE.Group();
  private dummy = new THREE.Object3D();
  private t = 0;

  constructor(host: HTMLElement, compact = false) {
    super(host, { distance: compact ? 12 : 12, autoRotate: false, minDistance: 7, maxDistance: 22 });
    const d = compact ? 11.9 : 12.2;
    this.camera.position.set(0.9, compact ? 1.4 : 2.1, d);
    this.controls.target.set(0, compact ? 0.3 : 0.55, 0);
    this.root.add(this.matter, this.circuit, this.arrows);
    this.buildCircuit();
    this.setMaterial('Cu');
  }

  get sigma() { return CONDUCTIVITY[this.material].value; }
  get carriers() { return CONDUCTIVITY[this.material].carriers; }
  /** The battery is on and something can move. */
  get flowing() { return this.power && this.carriers !== 'none'; }

  setMaterial(m: ConductMaterial) {
    this.material = m;
    this.onSince = performance.now(); this.reported = false;
    this.build();
    this.updateCircuit();
    this.emit('material', m);
  }

  setPower(on: boolean) {
    if (on === this.power) return;
    this.power = on;
    this.onSince = performance.now(); this.reported = false;
    this.updateCircuit();
    this.emit('power', on, this.material);
  }

  setReversed(r: boolean) {
    if (r === this.reversed) return;
    this.reversed = r;
    this.onSince = performance.now(); this.reported = false;
    this.updateCircuit();
    this.emit('reverse', r, this.material);
  }

  /** x of the negative plate: −X normally, +X with the poles swapped. */
  private get minusX() { return this.reversed ? X : -X; }

  // ---------- circuit: plates, wires, battery, lamp ----------

  private buildCircuit() {
    const plateMat = new THREE.MeshStandardMaterial({ color: 0xa4abc0, metalness: 0.55, roughness: 0.35 });
    for (const sx of [-1, 1]) {
      const plate = new THREE.Mesh(new THREE.BoxGeometry(0.12, 2 * SLAB.y + 0.5, 2 * SLAB.z + 0.5), plateMat);
      plate.position.set(sx * X, 0, 0);
      this.circuit.add(plate);
    }
    // wires: up from each plate, across the top, through the battery (left) and the lamp (right)
    const top = SLAB.y + 1.45;
    const pts = [
      [-X, SLAB.y + 0.25, -X, top], [-X, top, -1.75, top], [-1.25, top, 0.95, top], [1.75, top, X, top], [X, top, X, SLAB.y + 0.25],
    ];
    for (const [x1, y1, x2, y2] of pts) {
      const g = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(x1, y1, 0), new THREE.Vector3(x2, y2, 0)]);
      this.circuit.add(new THREE.Line(g, this.wireMat));
    }
    // battery symbol: a long and a short plate, rebuilt when the poles swap
    this.batteryGroup.position.set(-1.5, top, 0);
    this.circuit.add(this.batteryGroup);
    // lamp
    this.lamp = new THREE.Mesh(new THREE.SphereGeometry(0.42, 28, 20), new THREE.MeshStandardMaterial({ color: 0x55524b, emissive: 0xffc15e, emissiveIntensity: 0, roughness: 0.55, transparent: true, opacity: 0.95 }));
    this.lamp.position.set(1.35, top, 0);
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.3, 18), new THREE.MeshStandardMaterial({ color: 0x6d7699, metalness: 0.5, roughness: 0.4 }));
    base.rotation.z = Math.PI / 2; base.position.set(0.98, top, 0);
    const c = document.createElement('canvas'); c.width = c.height = 64;
    const g = c.getContext('2d')!;
    const grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    grd.addColorStop(0, 'rgba(255,214,140,1)'); grd.addColorStop(0.4, 'rgba(255,193,94,0.45)'); grd.addColorStop(1, 'rgba(255,193,94,0)');
    g.fillStyle = grd; g.fillRect(0, 0, 64, 64);
    const tex = new THREE.CanvasTexture(c);
    this.glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 }));
    this.glow.position.copy(this.lamp.position);
    this.circuit.add(this.lamp, base, this.glow);
  }

  private updateCircuit() {
    // pole badges on the plates
    for (const sp of this.poleLabels) { this.circuit.remove(sp); sp.material.dispose(); }
    this.poleLabels = [];
    // Neutral badges: on batteries and meters red usually marks +, while this app paints negative charge red.
    const minus = this.label('−', 0.9, '#ffffff', 'rgba(70,78,104,0.95)');
    const plus = this.label('+', 0.9, '#ffffff', 'rgba(70,78,104,0.95)');
    minus.position.set(this.minusX, -SLAB.y - 0.75, SLAB.z + 0.3);
    plus.position.set(-this.minusX, -SLAB.y - 0.75, SLAB.z + 0.3);
    this.circuit.add(minus, plus);
    this.poleLabels.push(minus, plus);
    // battery: the long plate is the + terminal; it faces the side of the + plate
    this.clearGroup(this.batteryGroup);
    const mk = (h: number, w: number, x: number) => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.5), new THREE.MeshStandardMaterial({ color: this.power ? 0xece6d6 : 0x7a819c, roughness: 0.5 }));
      m.position.set(x, 0, 0); return m;
    };
    const plusRight = !this.reversed;   // + plate on the right unless swapped
    this.batteryGroup.add(mk(0.95, 0.08, plusRight ? 0.22 : -0.22), mk(0.5, 0.14, plusRight ? -0.22 : 0.22));
    if (!this.power) {
      // an open switch: one short tilted segment above the gap
      const sw = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.05, 0.05), new THREE.MeshStandardMaterial({ color: 0x9aa3bf }));
      sw.position.set(0.68, 0.18, 0); sw.rotation.z = 0.55;
      this.batteryGroup.add(sw);
    }
    this.wireMat.color.set(this.flowing ? 0xffc15e : 0x6d7699);
    this.wireMat.opacity = this.flowing ? 0.95 : 0.8;
    this.buildArrows();
    this.setLabel(this.describe());
  }

  private describe() {
    const m = CONDUCTIVITY[this.material].name.en;
    if (!this.power) return `${m} between two plates, battery off`;
    if (this.carriers === 'electrons') return `${m}: electrons drift towards the + plate, the lamp is bright`;
    if (this.carriers === 'ions') return `${m}: sodium ions drift to the − plate, chloride ions to the + plate, the lamp glows`;
    return `${m}: nothing drifts, practically no current`;
  }

  /** Big labelled arrows under the slab that say at a glance which way each kind of carrier drifts. */
  private buildArrows() {
    this.clearGroup(this.arrows);
    if (!this.flowing) return;
    const toPlus = this.reversed ? -1 : 1;     // direction (sign of x) towards the + plate
    const arrow = (dir: number, color: number, css: string, text: string, y: number) => {
      const g = new THREE.Group();
      const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.95 });
      const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.6, 12), mat);
      shaft.rotation.z = Math.PI / 2;
      const head = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.42, 16), mat);
      head.rotation.z = -Math.PI / 2; head.position.x = 1.0;
      g.add(shaft, head);
      g.scale.x = dir;
      g.position.set(0.25 * dir, y, SLAB.z);
      const lab = this.label(text, 0.52, css);
      lab.position.set(-1.1 * dir, y, SLAB.z);
      this.arrows.add(g, lab);
    };
    const y = -SLAB.y - 0.45;
    if (this.carriers === 'electrons') arrow(toPlus, ELECTRON, '#ff9f9f', 'e⁻', y);
    else { arrow(-toPlus, CHARGE.plus, '#8cc4ff', 'Na⁺', y); arrow(toPlus, CHARGE.minus, '#ff9f9f', 'Cl⁻', y - 0.6); }
  }

  // ---------- matter ----------

  private pool(kind: Kind, n: number, geo: THREE.BufferGeometry, color: number, opacity = 1): Pool {
    const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.45, metalness: 0.05, emissive: color, emissiveIntensity: kind === 'electron' ? 0.55 : 0.08, transparent: opacity < 1, opacity, depthWrite: opacity >= 1 });
    const mesh = new THREE.InstancedMesh(geo, mat, n);
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.matter.add(mesh);
    const p: Pool = { kind, mesh, n, pos: new Float32Array(n * 3), vel: new Float32Array(n * 3), home: new Float32Array(n * 3) };
    this.pools.push(p);
    return p;
  }

  private rnd(a: number) { return (Math.random() * 2 - 1) * a; }

  private scatter(p: Pool) {
    for (let i = 0; i < p.n; i++) {
      p.pos[i * 3] = this.rnd(SLAB.x); p.pos[i * 3 + 1] = this.rnd(SLAB.y); p.pos[i * 3 + 2] = this.rnd(SLAB.z);
    }
  }

  private build() {
    this.clearGroup(this.matter);
    this.pools = [];
    const sph = (r: number, w = 14, hgt = 10) => new THREE.SphereGeometry(r, w, hgt);
    const m = this.material;
    if (m === 'Cu') {
      // copper's atom cores on a face-centred cubic grid, with the shared electrons moving among them
      const s = 0.62, nx = 9, ny = 6, nz = 4;
      const homes: number[] = [];
      for (let i = 0; i < nx; i++) for (let j = 0; j < ny; j++) for (let k = 0; k < nz; k++) {
        if ((i + j + k) % 2) continue;
        homes.push((i - (nx - 1) / 2) * s, (j - (ny - 1) / 2) * s, (k - (nz - 1) / 2) * s);
      }
      const cores = this.pool('core', homes.length / 3, sph(0.2, 20, 14), CORE);
      cores.home.set(homes); cores.pos.set(homes);
      const el = this.pool('electron', 130, sph(0.065, 10, 8), ELECTRON);
      this.scatter(el);
      for (let i = 0; i < el.n; i++) this.kick(el, i, 2.4);
    } else if (m === 'NaCl') {
      const s = 0.56, nx = 9, ny = 7, nz = 5;
      const hc: number[] = [], ha: number[] = [];
      for (let i = 0; i < nx; i++) for (let j = 0; j < ny; j++) for (let k = 0; k < nz; k++) {
        const v = [(i - (nx - 1) / 2) * s, (j - (ny - 1) / 2) * s, (k - (nz - 1) / 2) * s];
        ((i + j + k) % 2 ? ha : hc).push(...v);
      }
      const c = this.pool('cation', hc.length / 3, sph(0.13), CHARGE.plus), a = this.pool('anion', ha.length / 3, sph(0.23, 18, 12), CHARGE.minus);
      c.home.set(hc); c.pos.set(hc); a.home.set(ha); a.pos.set(ha);
    } else if (m === 'NaCl-melt') {
      const c = this.pool('cation', 60, sph(0.13), CHARGE.plus), a = this.pool('anion', 60, sph(0.23, 18, 12), CHARGE.minus);
      this.scatter(c); this.scatter(a);
      this.vessel();
    } else {
      // solutions and pure water: many faint water molecules, plus whatever is dissolved
      const water = this.pool('water', m === 'water' ? 240 : 200, sph(0.085, 10, 8), WATER, 0.32);
      this.scatter(water);
      if (m === 'NaCl-aq') {
        const c = this.pool('cation', 18, sph(0.13), CHARGE.plus), a = this.pool('anion', 18, sph(0.23, 18, 12), CHARGE.minus);
        this.scatter(c); this.scatter(a);
      }
      if (m === 'sugar-aq') {
        // a sugar molecule as a small ring of six grey balls (no charge)
        const ring = new THREE.BufferGeometry();
        const parts: THREE.BufferGeometry[] = [];
        for (let i = 0; i < 6; i++) { const g = sph(0.075, 10, 8); g.translate(0.15 * Math.cos(i * Math.PI / 3), 0.15 * Math.sin(i * Math.PI / 3), 0); parts.push(g); }
        const merged = mergeGeometries(parts);
        ring.copy(merged); merged.dispose(); parts.forEach((g) => g.dispose());
        const sugar = this.pool('sugar', 16, ring, SUGAR);
        this.scatter(sugar);
      }
      this.vessel();
    }
    for (const p of this.pools) this.write(p);
  }

  /** A faint outline of the container for liquids. */
  private vessel() {
    const g = new THREE.EdgesGeometry(new THREE.BoxGeometry(2 * X - 0.2, 2 * SLAB.y + 0.4, 2 * SLAB.z + 0.4));
    const l = new THREE.LineSegments(g, new THREE.LineBasicMaterial({ color: 0x7c88b3, transparent: true, opacity: 0.35 }));
    this.matter.add(l);
  }

  private kick(p: Pool, i: number, speed: number) {
    const u = Math.random() * 2 - 1, phi = Math.random() * Math.PI * 2, r = Math.sqrt(1 - u * u);
    p.vel[i * 3] = speed * r * Math.cos(phi); p.vel[i * 3 + 1] = speed * r * Math.sin(phi); p.vel[i * 3 + 2] = speed * u;
  }

  private write(p: Pool) {
    const d = this.dummy;
    for (let i = 0; i < p.n; i++) {
      d.position.set(p.pos[i * 3], p.pos[i * 3 + 1], p.pos[i * 3 + 2]);
      if (p.kind === 'sugar') d.rotation.set(i * 0.7 + this.t * 0.3, i * 1.3 + this.t * 0.2, 0); else d.rotation.set(0, 0, 0);
      d.updateMatrix();
      p.mesh.setMatrixAt(i, d.matrix);
    }
    p.mesh.instanceMatrix.needsUpdate = true;
  }

  // ---------- frame ----------

  protected tick(dt: number) {
    this.t += dt;
    const slow = this.reducedMotion ? 0.35 : 1;
    const toPlus = this.reversed ? -1 : 1;
    for (const p of this.pools) {
      if (p.kind === 'core' || (this.material === 'NaCl' && (p.kind === 'cation' || p.kind === 'anion'))) this.vibrate(p, p.kind === 'core' ? 0.035 : 0.045);
      else if (p.kind === 'electron') this.electrons(p, dt * slow, this.power ? toPlus * 1.15 : 0);
      else {
        // ions, water and sugar wander; with the battery on, ions also drift towards the plate of opposite charge
        const drift = !this.power ? 0 : p.kind === 'cation' ? -toPlus * 0.85 : p.kind === 'anion' ? toPlus * 0.85 : 0;
        const jiggle = p.kind === 'water' ? 1.6 : p.kind === 'sugar' ? 0.7 : 1.1;
        this.wander(p, dt * slow, jiggle, drift);
      }
      this.write(p);
    }
    // lamp
    const lvl = this.flowing ? lampLevel(this.sigma) : 0;
    const mat = this.lamp.material as THREE.MeshStandardMaterial;
    mat.emissiveIntensity += (lvl * 2.6 - mat.emissiveIntensity) * Math.min(1, dt * 8);
    mat.color.setHex(lvl > 0 ? 0xfff2cf : 0x55524b);
    const gm = this.glow.material as THREE.SpriteMaterial;
    gm.opacity += (Math.min(1, lvl * 1.4) - gm.opacity) * Math.min(1, dt * 8);
    this.glow.scale.setScalar(0.6 + 3.2 * lvl);
    // events after two seconds with the battery on
    if (this.power && !this.reported && performance.now() - this.onSince > 2000) {
      {
        this.reported = true;
        this.emit(this.carriers === 'none' ? 'noCurrent' : 'drift', this.material);
      }
    }
  }

  private vibrate(p: Pool, amp0: number) {
    const amp = this.reducedMotion ? amp0 * 0.3 : amp0;
    for (let i = 0; i < p.n; i++) {
      const o = i * 3;
      p.pos[o] = p.home[o] + amp * Math.sin(9 * this.t + i * 1.7);
      p.pos[o + 1] = p.home[o + 1] + amp * Math.sin(10.3 * this.t + i * 2.3);
      p.pos[o + 2] = p.home[o + 2] + amp * Math.sin(8.1 * this.t + i * 0.9);
    }
  }

  /** Electrons: fast, random, often scattered; with the battery on a steady drift is added. They leave at one plate and re-enter at the other, as in a closed circuit. */
  private electrons(p: Pool, dt: number, drift: number) {
    for (let i = 0; i < p.n; i++) {
      if (Math.random() < dt * 7) this.kick(p, i, 2.4);
      const o = i * 3;
      p.pos[o] += (p.vel[o] + drift) * dt; p.pos[o + 1] += p.vel[o + 1] * dt; p.pos[o + 2] += p.vel[o + 2] * dt;
      if (p.pos[o] > SLAB.x) p.pos[o] -= 2 * SLAB.x; else if (p.pos[o] < -SLAB.x) p.pos[o] += 2 * SLAB.x;
      this.reflect(p, o + 1, SLAB.y); this.reflect(p, o + 2, SLAB.z);
    }
  }

  private wander(p: Pool, dt: number, jiggle: number, drift: number) {
    for (let i = 0; i < p.n; i++) {
      const o = i * 3;
      for (let k = 0; k < 3; k++) {
        p.vel[o + k] += this.rnd(jiggle * 9) * dt;
        p.vel[o + k] *= 1 - Math.min(0.9, 2.2 * dt);
      }
      p.pos[o] += (p.vel[o] + drift) * dt; p.pos[o + 1] += p.vel[o + 1] * dt; p.pos[o + 2] += p.vel[o + 2] * dt;
      if (drift !== 0 && Math.abs(p.pos[o]) > SLAB.x) {
        // reached its plate: give it back at a random place, so the drift keeps going (and, in a still picture,
        // each kind of ion gathers towards the plate it moves to)
        p.pos[o] = this.rnd(SLAB.x);
        p.pos[o + 1] = this.rnd(SLAB.y); p.pos[o + 2] = this.rnd(SLAB.z);
      } else this.reflect(p, o, SLAB.x);
      this.reflect(p, o + 1, SLAB.y); this.reflect(p, o + 2, SLAB.z);
    }
  }

  private reflect(p: Pool, idx: number, lim: number) {
    if (p.pos[idx] > lim) { p.pos[idx] = 2 * lim - p.pos[idx]; p.vel[idx] = -Math.abs(p.vel[idx]); }
    else if (p.pos[idx] < -lim) { p.pos[idx] = -2 * lim - p.pos[idx]; p.vel[idx] = Math.abs(p.vel[idx]); }
  }

  dispose() {
    this.wireMat.dispose();
    super.dispose();
  }
}

/** Merge non-indexed or indexed sphere geometries into one (positions and normals only). */
function mergeGeometries(parts: THREE.BufferGeometry[]): THREE.BufferGeometry {
  const pos: number[] = [], nor: number[] = [];
  for (const g0 of parts) {
    const g = g0.index ? g0.toNonIndexed() : g0;
    pos.push(...(g.getAttribute('position').array as Float32Array));
    nor.push(...(g.getAttribute('normal').array as Float32Array));
    if (g !== g0) g.dispose();
  }
  const out = new THREE.BufferGeometry();
  out.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  out.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
  return out;
}
