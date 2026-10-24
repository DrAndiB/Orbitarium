// The Lab Bench (unit 16; later pH, buffers, titration and cells): glassware on a lab bench, drawn with its real inner
// volume (one scene unit is 4 cm, so a cubic unit holds 64 mL). Unit 16's pieces: a balance with a weighing boat,
// volumetric flasks with a ring mark, beakers and a bulb pipette. The screen component (labBenchUI.ts) does the
// chemistry; this stage draws a BenchView and animates the change from the previous one. Later instruments (pH meter,
// burette, electrodes) are further pieces in the same row: add them to BenchView, build them in render() and list
// them in pieces().
import * as THREE from 'three';
import { Stage3D } from './stage';
import { L, num, numTrim } from '../i18n';
import { h } from '../ui/dom';

const ML_PER_U3 = 64;
const ELEV = 0.2;                       // camera elevation, rad
const GAP = 0.6;                        // space between pieces on the bench
const TABLE = 160;                      // samples in a vessel's volume table
const WATER = new THREE.Color(0xa9c4ef);
const MARK = 0xffc15e;
/** Beaker sizes on the shelf (mL); a beaker is filled to at most 80 % of its size. */
const BEAKERS = [50, 100, 150, 250, 400, 600, 1000, 2000];
const TMP = new THREE.Color();
const TMP2 = new THREE.Color();

/** What the bench shows. Volumes in mL, concentrations in mol/L; `gen` changes when a vessel is filled anew. */
export interface BenchView {
  tint: string | null;
  /** Solid on the weighing boat now (0 once it has been dissolved). */
  grams: number;
  a: { kind: 'flask'; flask: number; left: number; c: number; gen: number } | { kind: 'beaker'; water: number; c: number; gen: number } | null;
  b: { flask: number; left: number; c: number; c1: number; pipette: number; gen: number } | null;
  p: { mL: number; c: number; gen: number } | null;
}
export type BenchAnim = 'make' | 'beaker' | 'dilute' | 'pour' | null;

/** Model shading, 0–1: deeper with concentration on a log scale (10⁻⁴ to about 0,4 mol/L), so a dilution series shows. */
export function shade(c: number): number {
  return c > 0 ? Math.min(1, Math.max(0.08, (Math.log10(c) + 4) / 3.6)) : 0;
}
/** The solution's colour into `out`; returns its opacity. Colourless solutes look like water at every c. */
function paint(tint: string | null, c: number, out: THREE.Color): number {
  if (!tint || c <= 0) { out.copy(WATER); return 0.34; }
  const s = shade(c);
  out.copy(WATER).lerp(TMP2.set(tint), Math.min(1, 0.25 + s));
  return 0.36 + 0.5 * s;
}
export const beakerFor = (content: number) => BEAKERS.find((b) => content <= 0.8 * b) ?? BEAKERS[BEAKERS.length - 1];

const v2 = (x: number, y: number) => new THREE.Vector2(x, y);

/** Inner volume against height for a lathe profile (axis point first, then the wall from the bottom up). */
class VolumeTable {
  ys = new Float32Array(TABLE + 1);
  rs = new Float32Array(TABLE + 1);
  vs = new Float32Array(TABLE + 1);
  constructor(inner: THREE.Vector2[]) {
    const side = inner.slice(1);
    const y0 = side[0].y, y1 = side[side.length - 1].y;
    let seg = 0;
    for (let j = 0; j <= TABLE; j++) {
      const y = y0 + ((y1 - y0) * j) / TABLE;
      while (seg < side.length - 2 && side[seg + 1].y < y) seg++;
      const a = side[seg], b = side[seg + 1];
      const r = b.y > a.y ? a.x + ((b.x - a.x) * (y - a.y)) / (b.y - a.y) : Math.max(a.x, b.x);
      this.ys[j] = y; this.rs[j] = r;
      if (j) this.vs[j] = this.vs[j - 1] + Math.PI * ((this.rs[j - 1] ** 2 + r * r) / 2) * (y - this.ys[j - 1]) * ML_PER_U3;
    }
  }
  private at(arr: Float32Array, j: number, f: number) { return arr[j - 1] + f * (arr[j] - arr[j - 1]); }
  heightFor(mL: number): number {
    if (mL <= 0) return this.ys[0];
    for (let j = 1; j <= TABLE; j++) if (this.vs[j] >= mL) return this.at(this.ys, j, (mL - this.vs[j - 1]) / (this.vs[j] - this.vs[j - 1] || 1));
    return this.ys[TABLE];
  }
  volumeAt(y: number): number {
    for (let j = 1; j <= TABLE; j++) if (this.ys[j] >= y) return this.at(this.vs, j, (y - this.ys[j - 1]) / (this.ys[j] - this.ys[j - 1] || 1));
    return this.vs[TABLE];
  }
  radiusAt(y: number): number {
    for (let j = 1; j <= TABLE; j++) if (this.ys[j] >= y) return this.at(this.rs, j, (y - this.ys[j - 1]) / (this.ys[j] - this.ys[j - 1] || 1));
    return this.rs[TABLE];
  }
}

/** A glass vessel standing on the bench (y = 0) with a liquid that fills it to a volume. */
class Vessel {
  readonly group = new THREE.Group();
  level = 0;
  readonly maxR: number;
  readonly top: number;
  /** Flasks: height and outer radius of the neck at the ring mark. Beakers: height of the graduation line. */
  markY = 0; neckR = 0; gradY = 0;
  readonly table: VolumeTable;
  private plane = new THREE.Plane(new THREE.Vector3(0, -1, 0), 0);
  private liqMat: THREE.MeshStandardMaterial;
  private surfMat: THREE.MeshStandardMaterial;
  private liquid: THREE.Mesh;
  private surface: THREE.Mesh;
  private owned: { geometry: THREE.BufferGeometry; material: THREE.Material | THREE.Material[] }[] = [];

  constructor(outer: THREE.Vector2[], inner: THREE.Vector2[], glass: THREE.Material, blob: THREE.Mesh) {
    // no fan at the axis (it shades as a starburst through the glass): open bottoms, the shadow shows through
    const glassMesh = new THREE.Mesh(new THREE.LatheGeometry(outer[0].x === 0 ? outer.slice(1) : outer, 48), glass);
    glassMesh.renderOrder = 3;
    this.liqMat = new THREE.MeshStandardMaterial({ color: WATER, transparent: true, opacity: 0.3, roughness: 0.3, metalness: 0, side: THREE.DoubleSide, depthWrite: false, clippingPlanes: [this.plane] });
    this.surfMat = new THREE.MeshStandardMaterial({ color: WATER, transparent: true, opacity: 0.4, roughness: 0.2, metalness: 0, side: THREE.DoubleSide, depthWrite: false });
    this.liquid = new THREE.Mesh(new THREE.LatheGeometry(inner.slice(1), 48), this.liqMat);
    this.liquid.renderOrder = 1;
    this.surface = new THREE.Mesh(new THREE.CircleGeometry(1, 48), this.surfMat);
    this.surface.rotation.x = -Math.PI / 2;
    this.surface.renderOrder = 2;
    this.maxR = Math.max(...outer.map((p) => p.x));
    this.top = Math.max(...outer.map((p) => p.y));
    blob.scale.setScalar(this.maxR * 1.45);
    this.group.add(blob, this.liquid, this.surface, glassMesh);
    this.owned.push({ geometry: glassMesh.geometry, material: [] }, { geometry: this.liquid.geometry, material: this.liqMat }, { geometry: this.surface.geometry, material: this.surfMat });
    this.table = new VolumeTable(inner);
    this.setLevel(0);
  }

  /** Add a mesh that belongs to this vessel (disposed with it). */
  own(m: THREE.Mesh) { this.group.add(m); this.owned.push({ geometry: m.geometry, material: m.material }); }

  setLevel(mL: number) {
    this.level = mL;
    const y = this.table.heightFor(mL);
    this.plane.constant = this.group.position.y + y;
    this.surface.position.y = y;
    const r = this.table.radiusAt(y);
    this.surface.scale.set(r, r, 1);
    this.liquid.visible = this.surface.visible = mL > 0.02;
  }

  setColor(col: THREE.Color, opacity: number) {
    this.liqMat.color.copy(col); this.liqMat.emissive.copy(col).multiplyScalar(0.18); this.liqMat.opacity = opacity;
    this.surfMat.color.copy(col); this.surfMat.emissive.copy(col).multiplyScalar(0.3); this.surfMat.opacity = Math.min(0.95, opacity + 0.2);
  }

  dispose() {
    this.group.removeFromParent();
    for (const o of this.owned) { o.geometry.dispose(); (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.dispose()); }
  }
}

// ---------- glassware shapes ----------

/** Volumetric flask at scale 1 (about 250 mL): flat-bottomed round bulb, long narrow neck, ring mark on the neck. */
const F = { R: 1, yc: 0.92, rn: 0.17, top: 4.2, mark: 3.1, wall: 0.03, lip: 0.035 };
function flaskPts(inset: number, s: number): THREE.Vector2[] {
  const R = F.R - inset, rn = F.rn - inset, yb = inset;
  const pts = [v2(0, yb)];
  pts.push(v2(Math.sqrt(Math.max(0, R * R - (F.yc - yb) ** 2)), yb));
  const a0 = Math.asin((yb - F.yc) / R), a1 = Math.acos(rn / R);
  for (let k = 1; k <= 26; k++) { const a = a0 + ((a1 - a0) * k) / 26; pts.push(v2(R * Math.cos(a), F.yc + R * Math.sin(a))); }
  if (inset) pts.push(v2(rn, F.top - 0.02));
  else pts.push(v2(rn, F.top - 0.05), v2(rn + F.lip, F.top - 0.02), v2(rn + F.lip, F.top));
  return pts.map((p) => p.multiplyScalar(s));
}
let flaskV1 = 0;
/** Scale that gives a flask exactly `mL` of inner volume up to its ring mark. */
function flaskScale(mL: number): number {
  if (!flaskV1) flaskV1 = new VolumeTable(flaskPts(F.wall, 1)).volumeAt(F.mark);
  return Math.cbrt(mL / flaskV1);
}

/** Beaker of a given size (mL at 85 % of its height); height 1,3 × diameter. */
function beakerPts(cap: number, inset: number): THREE.Vector2[] {
  const r = Math.cbrt(cap / (Math.PI * 0.85 * 2.6 * ML_PER_U3)), ht = 2.6 * r, w = 0.035;
  return inset ? [v2(0, w), v2(r, w), v2(r, ht)] : [v2(0, 0), v2(r + w, 0), v2(r + w, ht), v2(r + w + 0.05, ht + 0.03)];
}

/** Bulb pipette, standing (tip at y = 0): thin stem, a bulb holding about its volume, a ring mark on the upper stem. */
function pipettePts(mL: number) {
  const rb = Math.cbrt((3 * mL) / (4 * Math.PI * 1.8 * ML_PER_U3)), a = 1.8 * rb, rs = 0.045;
  const yb = 1.0 + a, len = yb + a + 1.3;
  const pts = [v2(0.012, 0), v2(rs, 0.12), v2(rs, 1.0)];
  const t0 = Math.asin(Math.min(1, rs / rb));
  for (let k = 0; k <= 20; k++) { const t = t0 + ((Math.PI - 2 * t0) * k) / 20; pts.push(v2(rb * Math.sin(t), yb - a * Math.cos(t))); }
  pts.push(v2(rs, yb + a + 0.02), v2(rs, len));
  return { pts, rb, a, len, markY: yb + a + 0.6, yb };
}

interface Tween { t0: number; dur: number; f: (k: number) => void; }
const ease = (k: number) => k * k * (3 - 2 * k);
/** An HTML label pinned to a point of a piece; `side` says which way it extends from that point. */
interface Tag { el: HTMLElement; obj: THREE.Object3D; x: number; y: number; z: number; side: 'up' | 'right' | 'down'; }
interface Piece { obj: THREE.Object3D; r: number; top: number; body: (y: number) => number; }

export class LabBenchStage extends Stage3D {
  private glass = new THREE.MeshStandardMaterial({ color: 0xd6e4ff, transparent: true, opacity: 0.17, roughness: 0.06, metalness: 0, side: THREE.DoubleSide, depthWrite: false, emissive: 0x2b3a66, emissiveIntensity: 0.35 });
  private markMat = new THREE.MeshBasicMaterial({ color: MARK });
  private blobGeo = new THREE.CircleGeometry(1, 32);
  private blobMat: THREE.MeshBasicMaterial;
  private balance = new THREE.Group();
  private heap!: THREE.Mesh;
  private heapMat = new THREE.MeshStandardMaterial({ color: 0xeeeae0, roughness: 0.85, metalness: 0.05 });
  private lcd!: { canvas: HTMLCanvasElement; tex: THREE.CanvasTexture };
  private A: Vessel | null = null;
  private B: Vessel | null = null;
  private P: Vessel | null = null;
  private keys = { a: '', b: '', p: '', pip: '' };
  private pip: { group: THREE.Group; liquid: THREE.Mesh; mat: THREE.MeshStandardMaterial; len: number; rb: number; geos: THREE.BufferGeometry[] } | null = null;
  private overlay: HTMLElement;
  private tags: Tag[] = [];
  private tagsDirty = true;
  private lastCam = new THREE.Vector3();
  private lastTgt = new THREE.Vector3();
  private v = new THREE.Vector3();
  private tweens: Tween[] = [];
  private time = 0;
  private heapG = 0;
  private layoutKey = '';
  private framedAspect = 0;
  private needsFit: false | 'cut' | 'fly' = 'cut';
  private wpp = 0.02;
  private fly: { k: number; p0: THREE.Vector3; t0: THREE.Vector3 } | null = null;
  private camTo = new THREE.Vector3();
  private tgtTo = new THREE.Vector3();
  private col = new THREE.Color();

  constructor(host: HTMLElement, compact = false) {
    super(host, { distance: 14, fov: 30, autoRotate: false, minDistance: 4, maxDistance: 40 });
    this.renderer.localClippingEnabled = true;
    this.controls.minAzimuthAngle = -0.8; this.controls.maxAzimuthAngle = 0.8;
    this.controls.minPolarAngle = 0.8; this.controls.maxPolarAngle = Math.PI / 2 - 0.04;
    if (compact) this.controls.enableZoom = false;
    this.overlay = h('div', { class: 'bench-tags', 'aria-hidden': 'true' });
    host.append(this.overlay);
    // soft round shadow under each piece
    const c = document.createElement('canvas'); c.width = c.height = 64;
    const g = c.getContext('2d')!;
    const grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    grd.addColorStop(0, 'rgba(0,0,0,0.55)'); grd.addColorStop(0.6, 'rgba(0,0,0,0.25)'); grd.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = grd; g.fillRect(0, 0, 64, 64);
    this.blobMat = new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthWrite: false });
    const bench = new THREE.Mesh(new THREE.BoxGeometry(60, 0.3, 9), new THREE.MeshStandardMaterial({ color: 0x29325a, roughness: 0.9, metalness: 0 }));
    bench.position.set(0, -0.15, 0.8);
    this.root.add(bench, this.balance);
    this.buildBalance();
  }

  private blob() { const m = new THREE.Mesh(this.blobGeo, this.blobMat); m.rotation.x = -Math.PI / 2; m.position.y = 0.004; return m; }

  // ---------- balance with weighing boat ----------

  private buildBalance() {
    const body = new THREE.MeshStandardMaterial({ color: 0x4a5482, roughness: 0.55, metalness: 0.15 });
    const base = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.5, 1.7), body);
    base.position.y = 0.25;
    const pan = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 0.05, 40), new THREE.MeshStandardMaterial({ color: 0xb8bfd6, roughness: 0.3, metalness: 0.7 }));
    pan.position.y = 0.525;
    const boatMat = new THREE.MeshStandardMaterial({ color: 0xd9dce6, roughness: 0.6, side: THREE.DoubleSide });
    const boat = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.42, 0.15, 4, 1, true), boatMat);
    boat.rotation.y = Math.PI / 4; boat.position.y = 0.625;
    const floor = new THREE.Mesh(new THREE.CircleGeometry(0.42, 4), boatMat);
    floor.rotation.set(-Math.PI / 2, 0, Math.PI / 4); floor.position.y = 0.552;
    const cone = new THREE.ConeGeometry(1, 1, 28); cone.translate(0, 0.5, 0);
    this.heap = new THREE.Mesh(cone, this.heapMat);
    this.heap.position.y = 0.556;
    // digital readout on the front face
    const canvas = document.createElement('canvas'); canvas.width = 320; canvas.height = 80;
    const tex = new THREE.CanvasTexture(canvas); tex.colorSpace = THREE.SRGBColorSpace;
    this.lcd = { canvas, tex };
    const screen = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 0.4), new THREE.MeshBasicMaterial({ map: tex }));
    screen.position.set(0, 0.25, 0.852);
    const blob = this.blob(); blob.scale.setScalar(1.8);
    this.balance.add(blob, base, pan, boat, floor, this.heap, screen);
    this.setHeap(0); this.drawLCD(0);
  }

  private setHeap(g: number) {
    const r = g > 0 ? Math.min(0.5, 0.11 * Math.cbrt(g) + 0.03) : 0;
    this.heap.visible = r > 0;
    this.heap.scale.set(Math.max(r, 1e-3), Math.max(0.75 * r, 1e-3), Math.max(r, 1e-3));
  }

  private drawLCD(g: number) {
    const ctx = this.lcd.canvas.getContext('2d')!;
    ctx.fillStyle = '#0c1326'; ctx.fillRect(0, 0, 320, 80);
    ctx.fillStyle = '#bff3cf'; ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
    ctx.font = '600 54px "Atkinson Hyperlegible Next", system-ui, sans-serif';
    ctx.fillText(`${num(g, 2)} g`, 306, 43);
    this.lcd.tex.needsUpdate = true;
  }

  // ---------- glassware ----------

  private newFlask(mL: number): Vessel {
    const s = flaskScale(mL);
    const v = new Vessel(flaskPts(0, s), flaskPts(F.wall, s), this.glass, this.blob());
    v.markY = v.table.heightFor(mL); v.neckR = (F.rn + F.lip) * s;
    const ring = new THREE.Mesh(new THREE.TorusGeometry(F.rn * s + 0.01, 0.045, 8, 40), this.markMat.clone());
    ring.rotation.x = Math.PI / 2; ring.position.y = v.markY; ring.renderOrder = 4;
    v.own(ring);
    return v;
  }

  private newBeaker(cap: number, grad?: number): Vessel {
    const v = new Vessel(beakerPts(cap, 0), beakerPts(cap, 1), this.glass, this.blob());
    if (grad) {
      v.gradY = v.table.heightFor(grad);
      const line = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.035, 0.02), new THREE.MeshBasicMaterial({ color: 0xece6d6 }));
      line.position.set(0, v.gradY, v.maxR - 0.02); line.renderOrder = 4;
      v.own(line);
    }
    return v;
  }

  private newPipette(mL: number) {
    const p = pipettePts(mL);
    const geo = new THREE.LatheGeometry(p.pts, 28);
    const glassMesh = new THREE.Mesh(geo, this.glass); glassMesh.renderOrder = 3;
    const ringGeo = new THREE.TorusGeometry(0.06, 0.022, 6, 24);
    const ring = new THREE.Mesh(ringGeo, this.markMat); ring.rotation.x = Math.PI / 2; ring.position.y = p.markY;
    const liqGeo = new THREE.SphereGeometry(p.rb * 0.9, 24, 16);
    const mat = new THREE.MeshStandardMaterial({ color: WATER, transparent: true, opacity: 0.6, roughness: 0.3, depthWrite: false });
    const liquid = new THREE.Mesh(liqGeo, mat); liquid.scale.y = 1.8; liquid.position.y = p.yb; liquid.visible = false; liquid.renderOrder = 1;
    const inner = new THREE.Group(); inner.add(liquid, glassMesh, ring);
    inner.rotation.z = Math.PI / 2;          // lying on the bench, tip towards −x
    inner.position.x = p.len / 2;
    const group = new THREE.Group(); group.add(inner);
    return { group, liquid, mat, len: p.len, rb: p.rb, geos: [geo, ringGeo, liqGeo] };
  }

  private dropPipette() {
    if (!this.pip) return;
    this.pip.group.removeFromParent();
    this.pip.geos.forEach((g) => g.dispose()); this.pip.mat.dispose();
    this.pip = null;
  }

  // ---------- tweens, camera, tags ----------

  private tween(delay: number, dur: number, f: (k: number) => void) { this.tweens.push({ t0: this.time + delay, dur, f }); }
  private flush() { for (const tw of this.tweens) tw.f(1); this.tweens.length = 0; }

  protected tick(dt: number) {
    this.time += dt;
    if (this.framedAspect && Math.abs(this.camera.aspect - this.framedAspect) > 0.01) this.needsFit = 'cut';
    if (this.needsFit) this.fit();
    const moving = this.tweens.length > 0 || !!this.fly;
    for (let i = this.tweens.length - 1; i >= 0; i--) {
      const tw = this.tweens[i];
      if (this.time < tw.t0) continue;
      const k = Math.min(1, (this.time - tw.t0) / tw.dur);
      tw.f(ease(k));
      if (k >= 1) this.tweens.splice(i, 1);
    }
    if (this.fly) {
      this.fly.k = Math.min(1, this.fly.k + dt / 0.8);
      const k = ease(this.fly.k);
      this.camera.position.lerpVectors(this.fly.p0, this.camTo, k);
      this.controls.target.lerpVectors(this.fly.t0, this.tgtTo, k);
      if (this.fly.k >= 1) this.fly = null;
    }
    if (moving) this.tagsDirty = true;
    this.placeTags();
  }

  /** Move the HTML tags to their projected points (only when something moved). */
  private placeTags() {
    if (!this.tagsDirty && this.lastCam.equals(this.camera.position) && this.lastTgt.equals(this.controls.target)) return;
    this.tagsDirty = false;
    this.lastCam.copy(this.camera.position); this.lastTgt.copy(this.controls.target);
    this.camera.updateMatrixWorld();
    const W = this.host.clientWidth, H = this.host.clientHeight;
    for (const t of this.tags) {
      this.v.set(t.obj.position.x + t.x, t.obj.position.y + t.y, t.obj.position.z + t.z).project(this.camera);
      const x = Math.round(((this.v.x + 1) / 2) * W), y = Math.round(((1 - this.v.y) / 2) * H);
      const tr = t.side === 'up' ? 'translate(-50%,-100%)' : t.side === 'down' ? 'translate(-50%,0)' : 'translate(0,-50%)';
      t.el.style.transform = `translate(${x}px,${y}px) ${tr}`;
    }
  }

  private dropTags() { for (const t of this.tags) t.el.remove(); this.tags = []; this.tagsDirty = true; }
  private tag(obj: THREE.Object3D, x: number, y: number, z: number, side: Tag['side'], cls: string, ...lines: string[]): HTMLElement {
    const el = h('div', { class: `bench-tag ${side} ${cls}` }, ...lines.filter((s) => s).map((s) => h('span', null, s)));
    this.overlay.append(el);
    this.tags.push({ el, obj, x, y, z, side });
    this.tagsDirty = true;
    return el;
  }

  /** The pieces in their bench order: half-width, height and outer radius at a height. */
  private pieces(): Piece[] {
    const out: Piece[] = [{ obj: this.balance, r: 1.15, top: 1.0, body: (y) => (y <= 0.7 ? 1.1 : 0) }];
    for (const v of [this.A, this.B, this.P]) if (v) out.push({ obj: v.group, r: v.maxR, top: v.top, body: (y) => (y <= v.top ? v.table.radiusAt(Math.max(0.05, y)) + 0.05 : 0) });
    return out;
  }

  /** How far a piece and its tags reach to one side at height y (world units), given the world size of a pixel. */
  private reach(p: Piece, y: number, wpp: number, right: boolean): number {
    let r = p.body(y);
    for (const t of this.tags) {
      if (t.obj !== p.obj || t.side === 'down') continue;
      const w = t.el.offsetWidth * wpp, hh = t.el.offsetHeight * wpp;
      if (t.side === 'up') { const y0 = t.y + 4 * wpp; if (y >= y0 && y <= y0 + hh) r = Math.max(r, w / 2); }
      else if (right && Math.abs(y - t.y) <= hh / 2) r = Math.max(r, t.x + w);
    }
    return r;
  }

  /** Place the pieces left to right so that neither glass nor tags overlap; returns each piece's x. */
  private layoutAt(ps: Piece[], wpp: number): number[] {
    const xs = [0];
    const yTop = Math.max(...ps.map((p) => p.top)) + 50 * wpp;
    for (let i = 1; i < ps.length; i++) {
      const a = ps[i - 1], b = ps[i];
      let tags = 0, glass = 0;
      for (let k = 0; k <= 48; k++) {
        const y = (yTop * k) / 48;
        tags = Math.max(tags, this.reach(a, y, wpp, true) + this.reach(b, y, wpp, false));
        glass = Math.max(glass, a.body(y) + b.body(y));
      }
      xs.push(xs[i - 1] + Math.max(tags + 8 * wpp, glass + GAP, a.r + b.r + 0.25));
    }
    const mid = (xs[0] - ps[0].r + xs[xs.length - 1] + ps[ps.length - 1].r) / 2;
    return xs.map((x) => x - mid);
  }

  /** Camera that fits the pieces and their tags at these positions; returns the new world size of a pixel. */
  private frameAt(ps: Piece[], xs: number[], wpp: number): number {
    const W = this.host.clientWidth, H = this.host.clientHeight;
    let x0 = Infinity, x1 = -Infinity, y1 = 0;
    ps.forEach((p, i) => {
      let l = p.r, r = p.r;
      for (const t of this.tags) {
        if (t.obj !== p.obj || t.side === 'down') continue;
        const w = t.el.offsetWidth * wpp;
        if (t.side === 'up') { l = Math.max(l, w / 2); r = Math.max(r, w / 2); y1 = Math.max(y1, t.y + (8 + t.el.offsetHeight) * wpp); }
        else r = Math.max(r, t.x + w);
      }
      x0 = Math.min(x0, xs[i] - l); x1 = Math.max(x1, xs[i] + r); y1 = Math.max(y1, p.top);
    });
    const y0 = this.pip ? -0.3 - 26 * wpp : -0.15;
    const w = x1 - x0 + 12 * wpp, hgt = y1 - y0 + 8 * wpp;
    const t = Math.tan(THREE.MathUtils.degToRad(this.camera.fov / 2));
    const d = Math.max(hgt / (2 * t), w / (2 * t * (W / H))) / Math.cos(ELEV) + 0.4;
    const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
    this.tgtTo.set(cx, cy, 0);
    this.camTo.set(cx, cy + d * Math.sin(ELEV), d * Math.cos(ELEV));
    this.controls.minDistance = d * 0.55; this.controls.maxDistance = d * 1.4;
    return (2 * d * t) / H;
  }

  /** Lay the pieces out and frame them, once the stage has a size (tags are measured in pixels). */
  private fit() {
    const W = this.host.clientWidth, H = this.host.clientHeight;
    if (!W || !H || (this.tags.length && !this.tags[0].el.offsetWidth)) return;
    const cut = this.needsFit === 'cut' || this.reducedMotion || !this.framedAspect;
    this.needsFit = false;
    this.framedAspect = this.camera.aspect;
    const ps = this.pieces();
    let wpp = this.wpp, xs: number[] = [];
    for (let i = 0; i < 4; i++) { xs = this.layoutAt(ps, wpp); wpp = this.frameAt(ps, xs, wpp); }
    this.wpp = wpp;
    ps.forEach((p, i) => {
      const from = p.obj.position.x, to = xs[i];
      if (cut || p.obj.userData.fresh || Math.abs(from - to) < 1e-3) p.obj.position.x = to;
      else this.tween(0, 0.6, (k) => { p.obj.position.x = from + (to - from) * k; this.placePipette(); });
      p.obj.userData.fresh = false;
    });
    this.placePipette();
    if (cut) { this.fly = null; this.camera.position.copy(this.camTo); this.controls.target.copy(this.tgtTo); }
    else this.fly = { k: 0, p0: this.camera.position.clone(), t0: this.controls.target.clone() };
    this.tagsDirty = true;
  }

  /** The pipette lies on the bench in front of flask 1 and 2, its tip at flask 2. */
  private placePipette() {
    if (!this.pip || !this.B) return;
    const front = Math.max(this.A?.maxR ?? 1, this.B.maxR) + 0.45;
    this.pip.group.position.set(this.B.group.position.x - this.pip.len / 2, this.pip.rb + 0.01, front);
  }

  // ---------- draw a view ----------

  render(v: BenchView, anim: BenchAnim, cut = false) {
    this.flush();
    const still = cut || this.reducedMotion || !anim;
    // solid on the boat and the balance readout
    if (v.tint) this.heapMat.color.set(v.tint).multiplyScalar(0.85); else this.heapMat.color.set(0xeeeae0);
    const prevG = this.heapG; this.heapG = v.grams;
    this.drawLCD(v.grams);
    if (!still && prevG > 0 && v.grams === 0) this.tween(0, 0.5, (k) => this.setHeap(prevG * (1 - k))); else this.setHeap(v.grams);

    // vessels: rebuild those whose size or filling changed
    const ka = v.a ? (v.a.kind === 'flask' ? `f${v.a.flask}` : `b${v.a.water}`) + ':' + v.a.gen : '';
    const kb = v.b ? `f${v.b.flask}:${v.b.gen}` : '';
    const capP = v.p ? beakerFor(v.p.mL) : 0;
    const kp = v.p ? `b${capP}:${v.p.gen}` : '';
    const kpip = v.b ? `${v.b.pipette}:${v.b.gen}` : '';
    const fresh = { a: false, b: false, p: false };
    if (ka !== this.keys.a) { this.A?.dispose(); this.A = null; if (v.a) { this.A = v.a.kind === 'flask' ? this.newFlask(v.a.flask) : this.newBeaker(beakerFor(v.a.water * 1.1), v.a.water); this.root.add(this.A.group); fresh.a = true; } }
    if (kb !== this.keys.b) { this.B?.dispose(); this.B = null; if (v.b) { this.B = this.newFlask(v.b.flask); this.root.add(this.B.group); fresh.b = true; } }
    if (kp !== this.keys.p) { this.P?.dispose(); this.P = null; if (v.p) { this.P = this.newBeaker(capP); this.root.add(this.P.group); fresh.p = true; } }
    if (kpip !== this.keys.pip) { this.dropPipette(); if (v.b) { this.pip = this.newPipette(v.b.pipette); this.root.add(this.pip.group); } }
    this.keys = { a: ka, b: kb, p: kp, pip: kpip };
    for (const ves of [this.A, this.B, this.P]) if (ves && (ves === this.A ? fresh.a : ves === this.B ? fresh.b : fresh.p)) ves.group.userData.fresh = true;
    this.placePipette();

    // levels and colours
    const level = (ves: Vessel, to: number, from: number, delay: number, dur: number) => {
      if (still || Math.abs(to - from) < 0.01) { ves.setLevel(to); return; }
      ves.setLevel(from);
      this.tween(delay, dur, (k) => ves.setLevel(from + (to - from) * k));
    };
    let fillEndA = 0, fillEndB = 0;
    if (this.A && v.a) {
      this.A.setColor(this.col, paint(v.tint, v.a.c, this.col));
      // the beaker case: the level ends visibly above the water's graduation line; the picture gives no exact volume
      const to = v.a.kind === 'flask' ? v.a.left : this.A.table.volumeAt(this.A.gradY + Math.max(0.1, 0.05 * this.A.gradY));
      const filling = (anim === 'make' && v.a.kind === 'flask') || (anim === 'beaker' && v.a.kind === 'beaker');
      if (fresh.a && !filling) this.A.setLevel(to);
      else level(this.A, to, fresh.a ? 0 : this.A.level, filling ? 0.3 : 0.2, filling ? 1.6 : 0.6);
      if (filling && !still) fillEndA = 1.9;
    }
    if (this.B && v.b) {
      const b = v.b, B = this.B;
      const op2 = paint(v.tint, b.c, this.col);
      if (anim === 'dilute' && fresh.b && !still) {
        // the pipetted portion runs in (colour of flask 1), then water up to the mark: the colour fades
        const c1 = new THREE.Color(), c2 = this.col.clone();
        const op1 = paint(v.tint, b.c1, c1);
        B.setColor(c1, op1); B.setLevel(0);
        this.tween(0.6, 0.7, (k) => B.setLevel(b.pipette * k));
        this.tween(1.5, 1.4, (k) => { B.setLevel(b.pipette + (b.flask - b.pipette) * k); TMP.copy(c1).lerp(c2, k); B.setColor(TMP, op1 + (op2 - op1) * k); });
        fillEndB = 2.9;
        if (this.pip) {
          const pl = this.pip.liquid, pm = this.pip.mat;
          pm.color.copy(c1); pm.opacity = Math.min(0.9, op1 + 0.2); pl.visible = true;
          this.tween(1.25, 0.01, (k) => { if (k >= 1) pl.visible = false; });
        }
      } else {
        B.setColor(this.col, op2);
        if (fresh.b) B.setLevel(b.left); else level(B, b.left, B.level, 0.2, 0.6);
      }
    }
    if (this.P && v.p) {
      this.P.setColor(this.col, paint(v.tint, v.p.c, this.col));
      if (anim === 'pour' && fresh.p) level(this.P, v.p.mL, 0, 0.25, 0.7); else this.P.setLevel(v.p.mL);
    }

    // tags: a name above each piece, the ring mark beside each flask
    this.dropTags();
    this.tag(this.balance, 0, 1.0, 0, 'up', '', L({ en: 'Balance', de: 'Waage' }));
    if (this.A && v.a) {
      if (v.a.kind === 'flask') {
        this.tag(this.A.group, 0, this.A.top, 0, 'up', '', L({ en: 'Flask 1', de: 'Kolben 1' }), `${numTrim(v.a.flask)} mL`);
        this.markTag(this.A, v.a.left >= v.a.flask - 0.01, fillEndA, v.a.left <= 0);
      } else {
        this.tag(this.A.group, 0, this.A.top, 0, 'up', '', L({ en: 'Beaker', de: 'Becherglas' }), `> ${numTrim(v.a.water)} mL`);
        this.tag(this.A.group, this.A.maxR + 0.05, this.A.gradY, 0, 'right', 'grad', `◂ ${numTrim(v.a.water)} mL ${L({ en: 'water', de: 'Wasser' })}`);
      }
    }
    if (this.B && v.b) {
      this.tag(this.B.group, 0, this.B.top, 0, 'up', '', L({ en: 'Flask 2', de: 'Kolben 2' }), `${numTrim(v.b.flask)} mL`);
      this.markTag(this.B, v.b.left >= v.b.flask - 0.01, fillEndB);
    }
    if (this.P && v.p) this.tag(this.P.group, 0, this.P.top, 0, 'up', '', L({ en: 'Portion', de: 'Portion' }), `${numTrim(v.p.mL)} mL`);
    if (this.pip && v.b) this.tag(this.pip.group, 0, -this.pip.rb, 0, 'down', 'small', L({ en: `bulb pipette ${numTrim(v.b.pipette)} mL`, de: `Vollpipette ${numTrim(v.b.pipette)} mL` }));
    const layoutKey = [ka, kb, kp, ...this.tags.map((t) => t.el.textContent)].join('|');
    if (layoutKey !== this.layoutKey || !this.framedAspect) { this.layoutKey = layoutKey; this.needsFit = still || !this.framedAspect ? 'cut' : 'fly'; }
    this.setLabel(this.describe(v));
  }

  /** "◂ mark ✓" beside a flask's ring mark; it appears once the flask has filled. */
  private markTag(ves: Vessel, on: boolean, showAfter: number, empty = false) {
    const el = this.tag(ves.group, ves.neckR + 0.04, ves.markY, 0, 'right', 'mark' + (on ? ' on' : ''),
      L({ en: '◂ mark', de: '◂ Eichmarke' }) + (on ? ' ✓' : ''), on || empty ? '' : L({ en: 'level below', de: 'Stand darunter' }));
    if (showAfter > 0) { el.style.visibility = 'hidden'; this.tween(showAfter, 0.01, (k) => { if (k >= 1) el.style.visibility = ''; }); }
  }

  private describe(v: BenchView): string {
    const parts = [L({ en: `Balance reading ${num(v.grams, 2)} g`, de: `Waage zeigt ${num(v.grams, 2)} g` })];
    if (v.a?.kind === 'flask') parts.push(L({ en: `flask 1, ${numTrim(v.a.flask)} mL`, de: `Kolben 1, ${numTrim(v.a.flask)} mL` }) + (v.a.left >= v.a.flask - 0.01 ? L({ en: ', filled to the mark', de: ', bis zur Eichmarke gefüllt' }) : L({ en: ', level below the mark', de: ', Stand unter der Eichmarke' })));
    if (v.a?.kind === 'beaker') parts.push(L({ en: `beaker with more than ${numTrim(v.a.water)} mL of solution`, de: `Becherglas mit mehr als ${numTrim(v.a.water)} mL Lösung` }));
    if (v.b) parts.push(L({ en: `flask 2, ${numTrim(v.b.flask)} mL`, de: `Kolben 2, ${numTrim(v.b.flask)} mL` }) + (v.b.left >= v.b.flask - 0.01 ? L({ en: ', filled to the mark', de: ', bis zur Eichmarke gefüllt' }) : L({ en: ', level below the mark', de: ', Stand unter der Eichmarke' })));
    if (v.p) parts.push(L({ en: `a ${numTrim(v.p.mL)} mL portion in a beaker`, de: `eine Portion von ${numTrim(v.p.mL)} mL im Becherglas` }));
    return parts.join('; ');
  }

  dispose() {
    this.tweens.length = 0;
    this.A?.dispose(); this.B?.dispose(); this.P?.dispose(); this.dropPipette();
    this.dropTags(); this.overlay.remove();
    this.glass.dispose(); this.markMat.dispose(); this.blobGeo.dispose(); this.blobMat.map?.dispose(); this.blobMat.dispose();
    this.heapMat.dispose(); this.lcd.tex.dispose();
    super.dispose();
  }
}
