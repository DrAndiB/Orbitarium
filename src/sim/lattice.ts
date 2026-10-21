// The Lattice Builder engine (unit 4, later unit 7): a rock-salt crystal of the chosen salt, built from ions at
// their measured sizes. It can play the electron transfer, show one ion's neighbours, heat the crystal until
// it melts, and shift a layer until like charges meet.
import * as THREE from 'three';
import { Stage3D } from './stage';
import { IONS, saltById, type Salt } from '../content/ions';
import { bySymbol } from '../content/elements';
import { CHARGE } from './workbench';

const N = 5;                 // 5 × 5 × 5 ions
const PM = 0.0058;           // scene units per pm
const DRAW = 0.78;           // ions drawn at 78 % of their radius, so you can see into the crystal
const NEUTRAL = 0xa9a49a;
const PAIR = 1.9;            // the transfer scene is drawn larger than the crystal

interface IonBody { mesh: THREE.Mesh; home: THREE.Vector3; pos: THREE.Vector3; vel: THREE.Vector3; cation: boolean; i: number; j: number; k: number; }
export type LatticeMode = 'crystal' | 'transfer' | 'shift';

export class LatticeStage extends Stage3D {
  salt: Salt = saltById('NaCl');
  temp = 25;
  mode: LatticeMode = 'crystal';
  selected: IonBody | null = null;
  private crystal = new THREE.Group();
  private extras = new THREE.Group();
  private ions: IonBody[] = [];
  private spacing = 1;
  private t = 0;
  private anim: { kind: 'transfer' | 'shift'; t0: number } | null = null;
  private animDone = false;
  private pair: { metal: THREE.Mesh; non: THREE.Mesh; electrons: THREE.Mesh[]; ml: THREE.Sprite; nl: THREE.Sprite } | null = null;
  private raycaster = new THREE.Raycaster();
  private down: { x: number; y: number } | null = null;

  constructor(host: HTMLElement, compact = false) {
    super(host, { distance: compact ? 18 : 13.5, minDistance: 6, maxDistance: 26 });
    const d = compact ? 18 : 13.5;
    this.camera.position.set(d * 0.5, d * 0.42, d * 0.76);
    this.root.add(this.crystal, this.extras);
    const el = this.renderer.domElement;
    el.addEventListener('pointerdown', (e) => { this.down = { x: e.clientX, y: e.clientY }; });
    el.addEventListener('pointerup', (e) => {
      if (!this.down) return;
      const moved = Math.hypot(e.clientX - this.down.x, e.clientY - this.down.y);
      this.down = null;
      if (moved < 6) this.pick(e);
    });
    this.setSalt('NaCl');
  }

  get molten() { return this.temp >= this.salt.mp; }

  setSalt(id: string) {
    this.salt = saltById(id);
    this.temp = Math.min(this.temp, 25);
    this.mode = 'crystal';
    this.anim = null;
    this.build();
    this.emit('salt', id);
  }

  setTemp(t: number) {
    const was = this.molten;
    this.temp = t;
    if (this.mode !== 'crystal') this.backToCrystal();
    if (this.molten && this.selected) this.select(null);
    if (was !== this.molten) this.emit('phase', this.molten);
    this.emit('heat', t, this.molten);
  }

  // ---------- building ----------

  private build() {
    this.clearGroup(this.crystal);
    this.clearGroup(this.extras);
    this.pair = null;
    this.selected = null;
    this.ions = [];
    const c = IONS[this.salt.cation], a = IONS[this.salt.anion];
    this.spacing = (c.r + a.r) * PM;
    const geoC = new THREE.SphereGeometry(c.r * PM * DRAW, 28, 20);
    const geoA = new THREE.SphereGeometry(a.r * PM * DRAW, 28, 20);
    const off = ((N - 1) / 2) * this.spacing;
    for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) for (let k = 0; k < N; k++) {
      const cation = (i + j + k) % 2 === 0;
      const mat = new THREE.MeshStandardMaterial({ color: cation ? CHARGE.plus : CHARGE.minus, roughness: 0.45, metalness: 0.05, emissive: cation ? CHARGE.plus : CHARGE.minus, emissiveIntensity: 0.08, transparent: true, opacity: 1 });
      const mesh = new THREE.Mesh(cation ? geoC : geoA, mat);
      const home = new THREE.Vector3(i * this.spacing - off, k * this.spacing - off, j * this.spacing - off);
      mesh.position.copy(home);
      mesh.userData.ion = true;
      this.crystal.add(mesh);
      this.ions.push({ mesh, home: home.clone(), pos: home.clone(), vel: new THREE.Vector3(), cation, i, j, k });
    }
    this.crystal.visible = true;
    this.setLabel(`${this.salt.formula} crystal: ${N * N * N} ions, cations blue, anions red`);
    this.emit('built');
  }

  // ---------- neighbours ----------

  private pick(e: PointerEvent) {
    if (this.mode !== 'crystal' || this.molten) return;
    const r = this.renderer.domElement.getBoundingClientRect();
    const v = new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    this.raycaster.setFromCamera(v, this.camera);
    const hit = this.raycaster.intersectObjects(this.crystal.children, false).find((x) => x.object.userData.ion && (x.object as THREE.Mesh).visible);
    const body = hit ? this.ions.find((b) => b.mesh === hit.object) ?? null : null;
    this.select(body === this.selected ? null : body);
  }

  /** Select the ion at the centre of the crystal, the one with a full set of neighbours. */
  selectCentre() {
    if (this.mode !== 'crystal') this.backToCrystal();
    if (this.molten) return;
    const m = (N - 1) / 2;
    this.select(this.ions.find((b) => b.i === m && b.j === m && b.k === m) ?? null);
  }

  /** The ions directly touching one ion: one spacing away, always of the opposite charge. */
  neighbours(b: IonBody): IonBody[] {
    return this.ions.filter((o) => o !== b && Math.abs(o.i - b.i) + Math.abs(o.j - b.j) + Math.abs(o.k - b.k) === 1);
  }

  select(b: IonBody | null) {
    this.selected = b;
    this.clearGroup(this.extras);
    const nb = b ? this.neighbours(b) : [];
    const keep = new Set([b, ...nb]);
    for (const o of this.ions) {
      const mat = o.mesh.material as THREE.MeshStandardMaterial;
      // the chosen ion solid, its neighbours see-through so it stays visible, everything else faint
      mat.opacity = !b || o === b ? 1 : keep.has(o) ? 0.55 : 0.05;
      mat.depthWrite = !b || o === b;
      mat.emissiveIntensity = o === b ? 0.6 : 0.08;
    }
    if (b) {
      for (const o of nb) {
        const geo = new THREE.BufferGeometry().setFromPoints([b.home, o.home]);
        this.extras.add(new THREE.Line(geo, new THREE.LineBasicMaterial({ color: 0xece6d6, transparent: true, opacity: 0.8 })));
      }
      const lab = this.label(`${nb.length}`, 0.5, '#ffffff', 'rgba(20,26,52,0.85)');
      lab.position.copy(b.home).add(new THREE.Vector3(0, this.spacing * 0.75, 0));
      this.extras.add(lab);
      this.emit('neighbours', nb.length, b.cation);
    }
  }

  // ---------- electron transfer ----------

  /** Play the electron transfer: a metal atom and a non-metal atom; one or two electrons move; the sizes change. */
  playTransfer() {
    this.backToCrystal(false);
    this.mode = 'transfer';
    this.crystal.visible = false;
    this.clearGroup(this.extras);
    const c = IONS[this.salt.cation], a = IONS[this.salt.anion];
    const rm = (bySymbol(c.s)?.r ?? 150) * PM * PAIR, rn = (bySymbol(a.s)?.r ?? 100) * PM * PAIR;
    const mk = () => new THREE.Mesh(new THREE.SphereGeometry(1, 36, 24), new THREE.MeshStandardMaterial({ color: NEUTRAL, roughness: 0.5, transparent: true, opacity: 0.92 }));
    const metal = mk(), non = mk();
    metal.scale.setScalar(rm); non.scale.setScalar(rn);
    metal.position.set(-2.6, 0, 0); non.position.set(2.6, 0, 0);
    const electrons: THREE.Mesh[] = [];
    for (let i = 0; i < c.q; i++) {
      const e = new THREE.Mesh(new THREE.SphereGeometry(0.13, 16, 12), new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffc15e, emissiveIntensity: 1.1 }));
      e.renderOrder = 20;
      (e.material as THREE.Material).depthTest = false;
      electrons.push(e);
    }
    const ml = this.label(c.s, 0.55, '#ffffff'), nl = this.label(a.s, 0.55, '#ffffff');
    ml.position.set(-2.6, 2.6, 0); nl.position.set(2.6, 2.6, 0);
    this.extras.add(metal, non, ...electrons, ml, nl);
    this.pair = { metal, non, electrons, ml, nl };
    this.anim = { kind: 'transfer', t0: this.t };
    this.animDone = false;
    this.setLabel(`${c.s} atom gives ${c.q} electron${c.q > 1 ? 's' : ''} to ${a.s}`);
    this.emit('transfer-start', this.salt.id);
  }

  // ---------- shifting a layer ----------

  /** Slide the top layer by one ion: like charges end up on top of each other and the layer is pushed off. */
  playShift() {
    this.backToCrystal(false);
    this.temp = Math.min(this.temp, this.salt.mp - 1);
    this.mode = 'shift';
    this.anim = { kind: 'shift', t0: this.t };
    this.animDone = false;
    this.setLabel(`${this.salt.formula}: top layer shifted by one ion, like charges meet`);
    this.emit('shift-start', this.salt.id);
  }

  backToCrystal(emit = true) {
    const wasOther = this.mode !== 'crystal';
    this.mode = 'crystal';
    this.anim = null;
    this.pair = null;
    this.clearGroup(this.extras);
    this.crystal.visible = true;
    for (const o of this.ions) { o.pos.copy(o.home); o.vel.set(0, 0, 0); o.mesh.position.copy(o.home); o.mesh.rotation.set(0, 0, 0); }
    this.crystal.rotation.set(0, 0, 0);
    if (this.selected) this.select(this.selected);
    if (wasOther && emit) this.emit('crystal');
  }

  // ---------- frame ----------

  protected tick(dt: number) {
    this.t += dt;
    if (this.mode === 'transfer' && this.anim && this.pair) return this.tickTransfer();
    if (this.mode === 'shift' && this.anim) return this.tickShift();
    if (this.mode !== 'crystal') return;
    const mpK = this.salt.mp + 273, TK = this.temp + 273;
    const amp = this.reducedMotion ? 0 : this.spacing * (0.015 + 0.11 * Math.pow(Math.min(1, TK / mpK), 2));
    if (!this.molten) {
      for (const o of this.ions) {
        // a bounded jiggle around the home position, faster when hotter
        const w = 6 + 10 * (TK / mpK);
        o.pos.set(
          o.home.x + amp * Math.sin(w * this.t + o.i * 1.7 + o.k * 0.3),
          o.home.y + amp * Math.sin(w * 1.13 * this.t + o.j * 2.1 + o.i * 0.5),
          o.home.z + amp * Math.sin(w * 0.91 * this.t + o.k * 1.3 + o.j * 0.7));
        o.mesh.position.lerp(o.pos, 0.35);
      }
    } else {
      // Molten: every ion wanders, held loosely together by its neighbours (here: a soft wall).
      const R = this.spacing * N * 0.62, kick = this.spacing * (this.reducedMotion ? 0.4 : 2.6) * Math.sqrt(TK / mpK);
      for (const o of this.ions) {
        o.vel.add(new THREE.Vector3((Math.random() - 0.5) * kick * dt * 6, (Math.random() - 0.5) * kick * dt * 6, (Math.random() - 0.5) * kick * dt * 6));
        o.vel.multiplyScalar(0.94);
        o.pos.addScaledVector(o.vel, dt);
        const d = o.pos.length();
        if (d > R) o.pos.multiplyScalar(R / d);
        o.mesh.position.lerp(o.pos, 0.5);
      }
    }
  }

  private tickTransfer() {
    const p = this.pair!, k = this.t - this.anim!.t0;
    const c = IONS[this.salt.cation], a = IONS[this.salt.anion];
    const rm0 = (bySymbol(c.s)?.r ?? 150) * PM * PAIR, rn0 = (bySymbol(a.s)?.r ?? 100) * PM * PAIR;
    const rm1 = c.r * PM * PAIR, rn1 = a.r * PM * PAIR;
    const T = 3.2;                    // seconds for the hop
    const f = Math.min(1, Math.max(0, (k - 0.6) / T));
    const ease = f < 0.5 ? 2 * f * f : 1 - Math.pow(-2 * f + 2, 2) / 2;
    p.electrons.forEach((e, i) => {
      const start = new THREE.Vector3(-2.6 + rm0 * Math.cos(0.4 + i * 0.6), rm0 * Math.sin(0.4 + i * 0.6), 0);
      const end = new THREE.Vector3(2.6 - rn1 * Math.cos(0.4 + i * 0.6), rn1 * Math.sin(0.4 + i * 0.6), 0);
      e.position.lerpVectors(start, end, ease);
      e.position.y += Math.sin(Math.PI * ease) * (1.1 + i * 0.3);
    });
    p.metal.scale.setScalar(rm0 + (rm1 - rm0) * ease);
    p.non.scale.setScalar(rn0 + (rn1 - rn0) * ease);
    const mix = (from: number, to: number) => new THREE.Color(from).lerp(new THREE.Color(to), ease);
    (p.metal.material as THREE.MeshStandardMaterial).color.copy(mix(NEUTRAL, CHARGE.plus));
    (p.non.material as THREE.MeshStandardMaterial).color.copy(mix(NEUTRAL, CHARGE.minus));
    if (f >= 1 && !this.animDone) {
      this.animDone = true;
      const sup = (q: number) => (Math.abs(q) > 1 ? String(Math.abs(q)) : '') + (q > 0 ? '+' : '−');
      const ml = this.label(c.s + sup(c.q), 0.55, '#ffffff'), nl = this.label(a.s + sup(a.q), 0.55, '#ffffff');
      ml.position.copy(p.ml.position); nl.position.copy(p.nl.position);
      this.extras.remove(p.ml, p.nl);
      this.extras.add(ml, nl);
      p.ml = ml; p.nl = nl;
      this.emit('transfer', this.salt.id);
    }
  }

  private tickShift() {
    const k = this.t - this.anim!.t0;
    const top = this.ions.filter((o) => o.k === N - 1);
    const slide = Math.min(1, k / 1.2);
    const ease = slide < 0.5 ? 2 * slide * slide : 1 - Math.pow(-2 * slide + 2, 2) / 2;
    for (const o of top) o.mesh.position.set(o.home.x + this.spacing * ease, o.home.y, o.home.z);
    if (slide >= 1 && !this.animDone) {
      this.animDone = true;
      // like charges now stacked: mark each repelling pair
      for (const o of top) {
        const below = this.ions.find((b) => b.k === N - 2 && b.i === o.i + 1 && b.j === o.j);
        if (!below) continue;
        const a = o.mesh.position.clone(), b = below.home.clone();
        const geo = new THREE.BufferGeometry().setFromPoints([a, b]);
        this.extras.add(new THREE.Line(geo, new THREE.LineBasicMaterial({ color: 0xffc15e, transparent: true, opacity: 0.9 })));
      }
      this.emit('shift', this.salt.id);
    }
    if (k > 1.9) {
      // the layer is pushed off: it lifts and tilts away
      const u = Math.min(1, (k - 1.9) / 1.4);
      for (const o of top) {
        o.mesh.position.set(o.home.x + this.spacing * (1 + 0.6 * u), o.home.y + this.spacing * 1.4 * u * u, o.home.z);
      }
      this.extras.children.forEach((ch) => { const m = (ch as THREE.Line).material as THREE.LineBasicMaterial; if (m && 'opacity' in m) m.opacity = 0.9 * (1 - u); });
    }
  }
}
