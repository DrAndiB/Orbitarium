// Shared 3D stage for the simulation engines: renderer, camera, orbit controls, resize, render loop, labels, disposal.
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export type Listener = (...args: any[]) => void;

export class Stage3D {
  readonly host: HTMLElement;
  protected renderer: THREE.WebGLRenderer;
  protected scene = new THREE.Scene();
  protected camera: THREE.PerspectiveCamera;
  protected controls: OrbitControls;
  protected root = new THREE.Group();
  protected reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  private listeners = new Map<string, Set<Listener>>();
  private raf = 0;
  private ro: ResizeObserver;
  private labelCache = new Map<string, THREE.Texture>();
  protected disposed = false;
  protected clock = new THREE.Clock();

  constructor(host: HTMLElement, opts: { distance?: number; fov?: number; autoRotate?: boolean; minDistance?: number; maxDistance?: number } = {}) {
    this.host = host;
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.domElement.className = 'wb-canvas';
    this.renderer.domElement.setAttribute('role', 'img');
    host.appendChild(this.renderer.domElement);
    this.camera = new THREE.PerspectiveCamera(opts.fov ?? 36, 1, 0.1, 200);
    this.camera.position.set(0.6, 1.2, opts.distance ?? 9);
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.enablePan = false;
    this.controls.minDistance = opts.minDistance ?? 3;
    this.controls.maxDistance = opts.maxDistance ?? 24;
    this.controls.autoRotate = (opts.autoRotate ?? true) && !this.reducedMotion;
    this.controls.autoRotateSpeed = 0.5;
    this.controls.addEventListener('start', () => { this.controls.autoRotate = false; });
    this.scene.add(new THREE.HemisphereLight(0xc9d8ff, 0x1a2240, 1.6));
    const key = new THREE.DirectionalLight(0xffffff, 2.2); key.position.set(3, 5, 4); this.scene.add(key);
    const rim = new THREE.DirectionalLight(0x8fb3ff, 1.1); rim.position.set(-4, -2, -3); this.scene.add(rim);
    this.scene.add(this.root);
    this.ro = new ResizeObserver(() => this.resize());
    this.ro.observe(host);
    this.resize();
    // Start on the next frame, so subclasses have initialised their fields before the first tick.
    this.raf = requestAnimationFrame(this.loop);
  }

  on(evt: string, f: Listener) { if (!this.listeners.has(evt)) this.listeners.set(evt, new Set()); this.listeners.get(evt)!.add(f); return () => this.listeners.get(evt)!.delete(f); }
  protected emit(evt: string, ...args: unknown[]) { this.listeners.get(evt)?.forEach((f) => f(...args)); }

  /** Called every frame with the elapsed time in seconds. */
  protected tick(_dt: number, _t: number) { /* engines override */ }

  private loop = () => {
    if (this.disposed) return;
    this.raf = requestAnimationFrame(this.loop);
    const dt = Math.min(0.05, this.clock.getDelta());
    this.tick(dt, this.clock.elapsedTime);
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  };

  private resize() {
    const w = this.host.clientWidth || 300, h = this.host.clientHeight || 300;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  setLabel(text: string) { this.renderer.domElement.setAttribute('aria-label', text); }

  /** A camera-facing text label. */
  protected label(text: string, size = 0.5, color = '#ece6d6', bg?: string): THREE.Sprite {
    const key = `${text}|${color}|${bg ?? ''}`;
    let tex = this.labelCache.get(key);
    if (!tex) {
      const c = document.createElement('canvas');
      const ctx = c.getContext('2d')!;
      const fs = 64;
      ctx.font = `600 ${fs}px "Atkinson Hyperlegible Next", system-ui, sans-serif`;
      const w = Math.ceil(ctx.measureText(text).width) + 24;
      c.width = w; c.height = fs + 24;
      const g = c.getContext('2d')!;
      if (bg) { g.fillStyle = bg; g.beginPath(); g.roundRect(0, 0, w, fs + 24, 18); g.fill(); }
      g.font = `600 ${fs}px "Atkinson Hyperlegible Next", system-ui, sans-serif`;
      g.fillStyle = color; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.fillText(text, w / 2, (fs + 24) / 2 + 2);
      tex = new THREE.CanvasTexture(c);
      tex.colorSpace = THREE.SRGBColorSpace;
      this.labelCache.set(key, tex);
    }
    const img = tex.image as HTMLCanvasElement;
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, depthTest: false, transparent: true }));
    sp.scale.set(size * (img.width / img.height), size, 1);
    sp.renderOrder = 10;
    return sp;
  }

  /** Remove and dispose everything under a group. */
  protected clearGroup(g: THREE.Object3D) {
    for (const ch of [...g.children]) {
      g.remove(ch);
      ch.traverse((o) => {
        const m = o as THREE.Mesh;
        m.geometry?.dispose?.();
        const mat = m.material as THREE.Material | THREE.Material[] | undefined;
        if (Array.isArray(mat)) mat.forEach((x) => x.dispose()); else mat?.dispose?.();
      });
    }
  }

  dispose() {
    this.disposed = true;
    cancelAnimationFrame(this.raf);
    this.ro.disconnect();
    this.controls.dispose();
    this.clearGroup(this.root);
    this.labelCache.forEach((t) => t.dispose());
    this.renderer.dispose();
    this.renderer.forceContextLoss();
    this.renderer.domElement.remove();
  }
}
