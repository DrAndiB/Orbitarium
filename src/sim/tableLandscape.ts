// Periodic Table engine, 3D view: every element is a column whose height is the overlay value,
// so trends become a landscape — electronegativity rises to the top right, atom size falls.
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { ELEMENTS, overlayColor, type Overlay } from '../content/elements';

type Listener = (z: number) => void;

export class TableLandscape {
  readonly el: HTMLElement;
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(38, 1, 0.1, 200);
  private controls: OrbitControls;
  private boxes: THREE.Mesh[] = [];
  private targetH: number[] = [];
  private currentH: number[] = [];
  private label?: THREE.Sprite;
  private selected = 0;
  private raf = 0;
  private disposed = false;
  private ro: ResizeObserver;
  private onPick?: Listener;
  private reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  constructor(host: HTMLElement, onPick?: Listener) {
    this.el = host;
    this.onPick = onPick;
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.domElement.className = 'pt3d-canvas';
    this.renderer.domElement.setAttribute('role', 'img');
    host.appendChild(this.renderer.domElement);
    // The table lies on the floor (x = group, z = row); values grow upwards along y.
    this.camera.position.set(0, 13, 17);
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.target.set(0, 0.5, 0.6);
    this.controls.enableDamping = true;
    this.controls.enablePan = false;
    this.controls.minDistance = 10;
    this.controls.maxDistance = 40;
    this.controls.maxPolarAngle = Math.PI * 0.48;
    this.scene.add(new THREE.HemisphereLight(0xc9d8ff, 0x1a2240, 1.7));
    const key = new THREE.DirectionalLight(0xffffff, 2.0); key.position.set(-6, 14, 8); this.scene.add(key);
    const geo = new THREE.BoxGeometry(0.86, 1, 0.86);
    geo.translate(0, 0.5, 0); // grow upwards from the floor
    for (const e of ELEMENTS) {
      const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: 0x2e3a69, roughness: 0.55, metalness: 0.05 }));
      const [x, z] = this.pos(e.x, e.y);
      m.position.set(x, 0, z);
      m.scale.y = 0.12;
      m.userData.z = e.z;
      this.scene.add(m);
      this.boxes.push(m);
      this.targetH.push(0.12);
      this.currentH.push(0.12);
    }
    this.bindPicking();
    this.ro = new ResizeObserver(() => this.resize());
    this.ro.observe(host);
    this.resize();
    this.loop();
  }

  private pos(x: number, y: number): [number, number] {
    const row = y >= 9 ? y - 0.6 : y;   // f-block rows just in front of row 7
    return [x - 9.5, row - 5];
  }

  setOverlay(o: Overlay, met?: Set<string>) {
    ELEMENTS.forEach((e, i) => {
      const { color, t } = overlayColor(o, e, met);
      const mat = this.boxes[i].material as THREE.MeshStandardMaterial;
      mat.color.set(color ?? '#2a3358');
      mat.opacity = color ? 1 : 0.6;
      mat.transparent = !color;
      // Numeric overlays become heights; family-style overlays stay low so the colours read.
      this.targetH[i] = o.kind === 'num' || o.kind === 'div' || o.id === 'shells' || o.id === 'outer'
        ? (color ? 0.25 + t * 5.5 : 0.08)
        : (color ? 0.35 : 0.08);
    });
    if (this.reduced) { this.currentH = [...this.targetH]; this.applyHeights(); }
  }

  select(z: number) {
    this.selected = z;
    this.boxes.forEach((b) => ((b.material as THREE.MeshStandardMaterial).emissive.set(b.userData.z === z ? 0x6b4a10 : 0x000000)));
    if (this.label) { this.scene.remove(this.label); this.label.material.map?.dispose(); this.label.material.dispose(); this.label = undefined; }
    if (!z) return;
    const e = ELEMENTS[z - 1];
    const c = document.createElement('canvas');
    c.width = 128; c.height = 128;
    const ctx = c.getContext('2d')!;
    ctx.font = '600 64px "Atkinson Hyperlegible Next", system-ui, sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.lineWidth = 8; ctx.strokeStyle = 'rgba(18,26,51,0.9)'; ctx.strokeText(e.s, 64, 66);
    ctx.fillStyle = '#ffe2a8'; ctx.fillText(e.s, 64, 66);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    this.label = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, depthTest: false, transparent: true }));
    this.label.scale.set(1.3, 1.3, 1);
    this.label.renderOrder = 10;
    this.scene.add(this.label);
  }

  private applyHeights() {
    this.boxes.forEach((b, i) => { b.scale.y = this.currentH[i]; });
    if (this.label && this.selected) {
      const b = this.boxes[this.selected - 1];
      this.label.position.set(b.position.x, this.currentH[this.selected - 1] + 0.9, b.position.z);
    }
  }

  private bindPicking() {
    const ray = new THREE.Raycaster();
    let down: { x: number; y: number } | null = null;
    const canvas = this.renderer.domElement;
    canvas.addEventListener('pointerdown', (e) => { down = { x: e.clientX, y: e.clientY }; });
    canvas.addEventListener('pointerup', (e) => {
      if (!down || Math.hypot(e.clientX - down.x, e.clientY - down.y) > 6) { down = null; return; }
      down = null;
      const r = canvas.getBoundingClientRect();
      ray.setFromCamera(new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1), this.camera);
      const hit = ray.intersectObjects(this.boxes, false)[0];
      if (hit) { const z = hit.object.userData.z as number; this.select(z); this.onPick?.(z); }
    });
  }

  private loop = () => {
    if (this.disposed) return;
    this.raf = requestAnimationFrame(this.loop);
    let moving = false;
    for (let i = 0; i < this.boxes.length; i++) {
      const d = this.targetH[i] - this.currentH[i];
      if (Math.abs(d) > 0.002) { this.currentH[i] += d * 0.12; moving = true; }
    }
    if (moving || this.label) this.applyHeights();
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  };

  private resize() {
    const w = this.el.clientWidth || 300, h = this.el.clientHeight || 300;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    // Pull the camera back on narrow screens so all 18 columns fit.
    const dist = w / h < 1 ? 30 : 24;
    const dir = this.camera.position.clone().sub(this.controls.target).normalize();
    this.camera.position.copy(this.controls.target.clone().add(dir.multiplyScalar(dist)));
    this.camera.updateProjectionMatrix();
  }

  dispose() {
    this.disposed = true;
    cancelAnimationFrame(this.raf);
    this.ro.disconnect();
    this.controls.dispose();
    this.boxes.forEach((b) => (b.material as THREE.Material).dispose());
    this.boxes[0]?.geometry.dispose();
    this.label?.material.map?.dispose();
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }
}
