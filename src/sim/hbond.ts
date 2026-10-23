// The hydrogen-bond view (unit 10, Molecule Workbench family): small molecules with real geometry, their donor H
// atoms (H on N, O or F) and acceptor lone pairs (on N, O or F), and a partner docked along the best hydrogen bond:
// X–H···Y in a straight line, H···Y about 190 pm, the acceptor's lone pair aimed at the H.
// Everything chemical is pure data and pure functions (positions in pm), so it can be tested without a screen;
// HBondStage only draws.
import * as THREE from 'three';
import { Stage3D } from './stage';
import { CHARGE, COLORS } from './workbench';
import { L, getLang, type Bi } from '../i18n';

const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const DEG = Math.PI / 180;

export type El = 'H' | 'C' | 'N' | 'O' | 'F' | 'Cl' | 'S';
/** van der Waals radii (pm), for contact distances and clash checks */
const VDW: Record<El, number> = { H: 120, C: 170, N: 155, O: 152, F: 147, Cl: 175, S: 180 };
/** the Workbench's neutral atom colours (not exported there, same values) */
const ATOM_COLOR: Record<El, number> = { H: 0xe9e3d3, C: 0x5d6479, N: 0x93a6c9, O: 0xd2bfa6, F: 0xb2d6bf, Cl: 0x9fc79a, S: 0xd8c879 };
const DRAW_R: Record<El, number> = { H: 0.2, C: 0.34, N: 0.33, O: 0.32, F: 0.3, Cl: 0.42, S: 0.43 };
export const ACCEPTOR_ATOMS: ReadonlySet<El> = new Set(['N', 'O', 'F']);
/** H···Y distance of a hydrogen bond (pm): about 190 pm to O and N, 180 pm to F */
export const hBondLength = (acceptor: El) => (acceptor === 'F' ? 180 : 190);

export interface Atom { el: El; p: THREE.Vector3; }
export interface LonePair { atom: number; dir: THREE.Vector3; }
export interface Molecule {
  id: string;
  formula: string;
  name: Bi;
  /** German noun for "the … molecule" (used in sentences) */
  molDe: string;
  atoms: Atom[];
  bonds: [number, number, 1 | 2][];
  /** lone pairs on N, O and F only: the acceptors */
  lps: LonePair[];
  /** a local plane normal, for drawing double bonds */
  plane: THREE.Vector3;
}

// ---------- geometry helpers ----------
function perp(v: THREE.Vector3): THREE.Vector3 {
  const a = Math.abs(v.x) < 0.9 ? V(1, 0, 0) : V(0, 1, 0);
  return a.sub(v.clone().multiplyScalar(v.dot(a))).normalize();
}
/** three unit directions at 109.47° from v (a tetrahedral atom bonded along v), turned by `phase` about v */
function tetraDirs(v: THREE.Vector3, phase = 0): THREE.Vector3[] {
  const u = v.clone().normalize(), e1 = perp(u), e2 = u.clone().cross(e1);
  const s = (2 * Math.SQRT2) / 3;
  return [0, 1, 2].map((k) => {
    const a = phase + (k * 2 * Math.PI) / 3;
    return u.clone().multiplyScalar(-1 / 3).add(e1.clone().multiplyScalar(s * Math.cos(a))).add(e2.clone().multiplyScalar(s * Math.sin(a))).normalize();
  });
}
/** directions of the lone pairs (or, for C, the empty faces) of an sp³ atom with the given bond directions */
function sp3Complement(us: THREE.Vector3[], phase = 0): THREE.Vector3[] {
  if (us.length === 1) return tetraDirs(us[0], phase);
  if (us.length === 2) {
    const b = us[0].clone().add(us[1]).multiplyScalar(-1).normalize();
    const n = us[0].clone().cross(us[1]).normalize();
    const t = 54.75 * DEG;
    return [b.clone().multiplyScalar(Math.cos(t)).add(n.clone().multiplyScalar(Math.sin(t))).normalize(), b.clone().multiplyScalar(Math.cos(t)).add(n.clone().multiplyScalar(-Math.sin(t))).normalize()];
  }
  if (us.length === 3) return [us.reduce((s, u) => s.add(u), V()).multiplyScalar(-1).normalize()];
  return us.map((u) => u.clone().multiplyScalar(-1));
}

class Builder {
  atoms: Atom[] = [];
  bonds: [number, number, 1 | 2][] = [];
  add(el: El, p: THREE.Vector3) { this.atoms.push({ el, p }); return this.atoms.length - 1; }
  bond(i: number, j: number, o: 1 | 2 = 1) { this.bonds.push([i, j, o]); }
  /** atom j bonded to i, `len` pm along unit direction d */
  at(i: number, el: El, d: THREE.Vector3, len: number, o: 1 | 2 = 1) { const j = this.add(el, this.atoms[i].p.clone().add(d.clone().normalize().multiplyScalar(len))); this.bond(i, j, o); return j; }
  dirs(i: number) { return this.bonds.filter((b) => b[0] === i || b[1] === i).map((b) => this.atoms[b[0] === i ? b[1] : b[0]].p.clone().sub(this.atoms[i].p).normalize()); }
  /** a methyl group's three H on carbon c (bonded to its parent already), turned to stay clear of the other atoms */
  methyl(c: number) {
    const parentDir = this.dirs(c)[0];
    let best: THREE.Vector3[] = [], score = -1;
    for (let ph = 0; ph < 120; ph += 5) {
      const ds = tetraDirs(parentDir, ph * DEG);
      const ps = ds.map((d) => this.atoms[c].p.clone().add(d.multiplyScalar(109)));
      const m = Math.min(...ps.flatMap((p) => this.atoms.filter((_, k) => k !== c).map((a) => a.p.distanceTo(p))));
      if (m > score) { score = m; best = ds; }
    }
    for (const d of best) this.at(c, 'H', d, 109);
  }
}

function finish(id: string, formula: string, name: Bi, molDe: string, b: Builder, lpsOverride?: LonePair[], plane = V(0, 0, 1)): Molecule {
  // centre on the heavy atoms
  const heavy = b.atoms.filter((a) => a.el !== 'H');
  const c = heavy.reduce((s, a) => s.add(a.p), V()).multiplyScalar(1 / heavy.length);
  for (const a of b.atoms) a.p.sub(c);
  let lps = lpsOverride;
  if (!lps) {
    lps = [];
    b.atoms.forEach((a, i) => {
      if (!ACCEPTOR_ATOMS.has(a.el)) return;
      for (const dir of sp3Complement(b.dirs(i))) lps!.push({ atom: i, dir });
    });
  }
  return { id, formula, name, molDe, atoms: b.atoms, bonds: b.bonds, lps, plane };
}

/** two bonds from an atom at the origin, with angle `ang` between them, in the xy plane, symmetric about −y */
const bent = (ang: number): [THREE.Vector3, THREE.Vector3] => { const t = (ang / 2) * DEG; return [V(Math.sin(t), -Math.cos(t), 0), V(-Math.sin(t), -Math.cos(t), 0)]; };

function water(): Molecule {
  const b = new Builder(); const o = b.add('O', V());
  const [u1, u2] = bent(104.5); b.at(o, 'H', u1, 96); b.at(o, 'H', u2, 96);
  return finish('H2O', 'H2O', { en: 'water', de: 'Wasser' }, 'Wassermolekül', b);
}
function ammonia(): Molecule {
  const b = new Builder(); const n = b.add('N', V());
  // three N–H bonds 68.2° from the axis give H–N–H = 107°
  const a = 68.2 * DEG;
  for (let k = 0; k < 3; k++) { const p = (k * 2 * Math.PI) / 3; b.at(n, 'H', V(Math.sin(a) * Math.cos(p), -Math.cos(a), Math.sin(a) * Math.sin(p)), 101); }
  return finish('NH3', 'NH3', { en: 'ammonia', de: 'Ammoniak' }, 'Ammoniakmolekül', b);
}
function hf(): Molecule {
  const b = new Builder(); const f = b.add('F', V()); b.at(f, 'H', V(0, -1, 0), 92);
  return finish('HF', 'HF', { en: 'hydrogen fluoride', de: 'Fluorwasserstoff' }, 'Fluorwasserstoffmolekül', b);
}
function methane(): Molecule {
  const b = new Builder(); const c = b.add('C', V());
  for (const d of [V(1, 1, 1), V(1, -1, -1), V(-1, 1, -1), V(-1, -1, 1)]) b.at(c, 'H', d, 109);
  return finish('CH4', 'CH4', { en: 'methane', de: 'Methan' }, 'Methanmolekül', b);
}
function methanol(): Molecule {
  const b = new Builder(); const o = b.add('O', V());
  const [uC, uH] = bent(108.5); const c = b.at(o, 'C', uC, 143); b.at(o, 'H', uH, 96); b.methyl(c);
  return finish('CH3OH', 'CH3OH', { en: 'methanol', de: 'Methanol' }, 'Methanolmolekül', b);
}
function ethanol(): Molecule {
  const b = new Builder(); const o = b.add('O', V());
  const [uC, uH] = bent(108.5); const c1 = b.at(o, 'C', uC, 143); const hO = b.at(o, 'H', uH, 96);
  // C2 anti to the O–H (dihedral 180°), then the two H of CH2
  const toO = b.atoms[o].p.clone().sub(b.atoms[c1].p).normalize();
  let best: THREE.Vector3[] = [], score = -1;
  for (let ph = 0; ph < 120; ph += 2) {
    const ds = tetraDirs(toO, ph * DEG);
    const s = b.atoms[c1].p.clone().add(ds[0].clone().multiplyScalar(154)).distanceTo(b.atoms[hO].p);
    if (s > score) { score = s; best = ds; }
  }
  const c2 = b.at(c1, 'C', best[0], 154); b.at(c1, 'H', best[1], 109); b.at(c1, 'H', best[2], 109);
  b.methyl(c2);
  return finish('C2H5OH', 'C2H5OH', { en: 'ethanol', de: 'Ethanol' }, 'Ethanolmolekül', b);
}
function dimethylEther(): Molecule {
  const b = new Builder(); const o = b.add('O', V());
  const [u1, u2] = bent(111.7); const c1 = b.at(o, 'C', u1, 143); const c2 = b.at(o, 'C', u2, 143); b.methyl(c1); b.methyl(c2);
  return finish('CH3OCH3', 'CH3OCH3', { en: 'dimethyl ether', de: 'Dimethylether' }, 'Dimethylethermolekül', b);
}
function acetone(): Molecule {
  // sp² carbon: C=O 123 pm, C–C 152 pm, C–C=O 122°; oxygen's two lone pairs lie in the molecular plane at about 120°
  const b = new Builder(); const c = b.add('C', V());
  const o = b.at(c, 'O', V(0, 1, 0), 123, 2);
  const t = 122 * DEG;
  const m1 = b.at(c, 'C', V(Math.sin(t), Math.cos(t), 0), 152); const m2 = b.at(c, 'C', V(-Math.sin(t), Math.cos(t), 0), 152);
  b.methyl(m1); b.methyl(m2);
  // lone-pair directions: the O→C direction (−y) turned by ±120° in the molecular plane
  const dirs = [120, -120].map((a) => V(Math.sin(a * DEG), -Math.cos(a * DEG), 0));
  return finish('CH3COCH3', 'CH3COCH3', { en: 'acetone', de: 'Aceton' }, 'Acetonmolekül', b, dirs.map((dir) => ({ atom: o, dir })), V(0, 0, 1));
}
function hcl(): Molecule {
  const b = new Builder(); const cl = b.add('Cl', V()); b.at(cl, 'H', V(0, -1, 0), 127);
  return finish('HCl', 'HCl', { en: 'hydrogen chloride', de: 'Chlorwasserstoff' }, 'Chlorwasserstoffmolekül', b);
}
function h2s(): Molecule {
  const b = new Builder(); const s = b.add('S', V());
  const [u1, u2] = bent(92.1); b.at(s, 'H', u1, 134); b.at(s, 'H', u2, 134);
  return finish('H2S', 'H2S', { en: 'hydrogen sulfide', de: 'Schwefelwasserstoff' }, 'Schwefelwasserstoffmolekül', b);
}

const MAKERS: Record<string, () => Molecule> = {
  H2O: water, NH3: ammonia, HF: hf, CH4: methane, CH3OH: methanol, C2H5OH: ethanol, CH3OCH3: dimethylEther, CH3COCH3: acetone, HCl: hcl, H2S: h2s,
};
export const HB_MOLECULES = Object.keys(MAKERS);
const cache = new Map<string, Molecule>();
export function molecule(id: string): Molecule {
  let m = cache.get(id);
  if (!m) { m = MAKERS[id](); cache.set(id, m); }
  return m;
}

// ---------- donors, acceptors ----------
export interface Donor { h: number; x: number; }
export function donors(m: Molecule): Donor[] {
  const out: Donor[] = [];
  for (const [i, j] of m.bonds) {
    const [h, x] = m.atoms[i].el === 'H' ? [i, j] : m.atoms[j].el === 'H' ? [j, i] : [-1, -1];
    if (h >= 0 && ACCEPTOR_ATOMS.has(m.atoms[x].el)) out.push({ h, x });
  }
  return out;
}
export const hasCH = (m: Molecule) => m.bonds.some(([i, j]) => (m.atoms[i].el === 'H' && m.atoms[j].el === 'C') || (m.atoms[j].el === 'H' && m.atoms[i].el === 'C'));
/** the element the molecule's H atoms sit on when none of them is a donor (for the "no hydrogen bond" reasons) */
export const hHost = (m: Molecule): El | null => {
  for (const [i, j] of m.bonds) { if (m.atoms[i].el === 'H') return m.atoms[j].el; if (m.atoms[j].el === 'H') return m.atoms[i].el; }
  return null;
};
/** the acceptor element (N, O or F) of a molecule, if any */
export const acceptorEl = (m: Molecule): El | null => (m.lps.length ? m.atoms[m.lps[0].atom].el : null);
/** the central heavy atom without lone pairs that a donor H would meet (C, Cl or S) */
export const plainHeavy = (m: Molecule): El => m.atoms.find((a) => a.el !== 'H')!.el;

export type Direction = 'a-donates' | 'b-donates';
export function directions(a: Molecule, b: Molecule): Direction[] {
  const out: Direction[] = [];
  if (donors(a).length && b.lps.length) out.push('a-donates');
  if (donors(b).length && a.lps.length) out.push('b-donates');
  return out;
}

// ---------- posing and docking ----------
export interface Posed { mol: Molecule; q: THREE.Quaternion; t: THREE.Vector3; }
export const worldPos = (p: Posed, i: number) => p.mol.atoms[i].p.clone().applyQuaternion(p.q).add(p.t);
export const worldDir = (p: Posed, d: THREE.Vector3) => d.clone().applyQuaternion(p.q);
const identity = (mol: Molecule): Posed => ({ mol, q: new THREE.Quaternion(), t: V() });

export interface HBond { donor: Posed; h: number; x: number; acceptor: Posed; y: number; lp: number; }

/** smallest (distance ÷ sum of van der Waals radii) between the atoms of `p` and of the others, skipping listed pairs */
function clearance(p: Posed, others: Posed[], skip: [Posed, number, Posed, number][] = []): number {
  let m = Infinity;
  for (let i = 0; i < p.mol.atoms.length; i++) {
    const pi = worldPos(p, i);
    for (const o of others) for (let j = 0; j < o.mol.atoms.length; j++) {
      if (skip.some(([A, a, B, bb]) => (A === p && a === i && B === o && bb === j) || (B === p && bb === i && A === o && a === j))) continue;
      const r = pi.distanceTo(worldPos(o, j)) / (VDW[p.mol.atoms[i].el] + VDW[o.mol.atoms[j].el]);
      if (r < m) m = r;
    }
  }
  return m;
}

/**
 * Place `mov` against the already placed molecules so that a hydrogen bond forms with `fixed`.
 * dir 'mov-accepts': fixed's donor H points at a lone pair of mov. 'mov-donates': mov's H points at a lone pair of fixed.
 * Every donor/lone-pair combination and turn about the bond axis is tried; the one with the most room wins.
 */
export function dock(fixed: Posed, mov: Molecule, dir: 'mov-accepts' | 'mov-donates', placed: Posed[], used: Set<string> = new Set()): { posed: Posed; bond: HBond } | null {
  let best: { posed: Posed; bond: HBond; score: number } | null = null;
  const tryPose = (q: THREE.Quaternion, t: V3, bond: (p: Posed) => HBond) => {
    const p: Posed = { mol: mov, q, t };
    const b = bond(p);
    const score = clearance(p, placed, [[b.donor, b.h, b.acceptor, b.y]]);
    if (!best || score > best.score) best = { posed: p, bond: b, score };
  };
  type V3 = THREE.Vector3;
  if (dir === 'mov-accepts') {
    for (const d of donors(fixed.mol)) {
      if (used.has(`h${d.h}`)) continue;
      const h = worldPos(fixed, d.h), x = worldPos(fixed, d.x), e = h.clone().sub(x).normalize();
      mov.lps.forEach((lp, k) => {
        const y = mov.atoms[lp.atom];
        const target = h.clone().add(e.clone().multiplyScalar(hBondLength(y.el)));
        const q1 = new THREE.Quaternion().setFromUnitVectors(lp.dir.clone().normalize(), e.clone().multiplyScalar(-1));
        for (let s = 0; s < 360; s += 15) {
          const q = new THREE.Quaternion().setFromAxisAngle(e, s * DEG).multiply(q1);
          const t = target.clone().sub(y.p.clone().applyQuaternion(q));
          tryPose(q, t, (p) => ({ donor: fixed, h: d.h, x: d.x, acceptor: p, y: lp.atom, lp: k }));
        }
      });
    }
  } else {
    fixed.mol.lps.forEach((lp, k) => {
      if (used.has(`lp${k}`)) return;
      const y = worldPos(fixed, lp.atom), l = worldDir(fixed, lp.dir).normalize();
      for (const d of donors(mov)) {
        const hl = mov.atoms[d.h].p, el = hl.clone().sub(mov.atoms[d.x].p).normalize();
        const target = y.clone().add(l.clone().multiplyScalar(hBondLength(fixed.mol.atoms[lp.atom].el)));
        const q1 = new THREE.Quaternion().setFromUnitVectors(el, l.clone().multiplyScalar(-1));
        for (let s = 0; s < 360; s += 15) {
          const q = new THREE.Quaternion().setFromAxisAngle(l, s * DEG).multiply(q1);
          const t = target.clone().sub(hl.clone().applyQuaternion(q));
          tryPose(q, t, (p) => ({ donor: p, h: d.h, x: d.x, acceptor: fixed, y: lp.atom, lp: k }));
        }
      }
    });
  }
  if (!best) return null;
  const b = best as { posed: Posed; bond: HBond; score: number };
  return { posed: b.posed, bond: b.bond };
}

/** Put `mov` at a plain contact distance beside `fixed` (no hydrogen bond). */
function contact(fixed: Posed, mov: Molecule): Posed {
  // facing lone pairs when both have them (two ethers: lone pair to lone pair, nothing between them)
  if (fixed.mol.lps.length && mov.lps.length) {
    let best: Posed | null = null, score = -1;
    fixed.mol.lps.forEach((lpA) => {
      const y = worldPos(fixed, lpA.atom), l = worldDir(fixed, lpA.dir).normalize();
      for (const lpB of mov.lps) {
        const q1 = new THREE.Quaternion().setFromUnitVectors(lpB.dir.clone().normalize(), l.clone().multiplyScalar(-1));
        for (let s = 0; s < 360; s += 15) {
          const q = new THREE.Quaternion().setFromAxisAngle(l, s * DEG).multiply(q1);
          const target = y.clone().add(l.clone().multiplyScalar(VDW[fixed.mol.atoms[lpA.atom].el] + VDW[mov.atoms[lpB.atom].el] + 10));
          const p: Posed = { mol: mov, q, t: target.sub(mov.atoms[lpB.atom].p.clone().applyQuaternion(q)) };
          const c = clearance(p, [fixed]);
          if (c > score) { score = c; best = p; }
        }
      }
    });
    if (best) return best;
  }
  // otherwise side by side along x, as close as the van der Waals radii allow
  const q = new THREE.Quaternion();
  const maxA = Math.max(...fixed.mol.atoms.map((_, i) => worldPos(fixed, i).x));
  const minB = Math.min(...mov.atoms.map((a) => a.p.x));
  let sx = maxA - minB - 200;
  const p: Posed = { mol: mov, q, t: V(sx, 0, 0) };
  while (clearance(p, [fixed]) < 0.95) { sx += 5; p.t.set(sx, 0, 0); }
  return p;
}

/** A donor's H pointed at a heavy atom without (counted) lone pairs, at contact distance: shows "it would point at carbon". */
function pointAt(donorP: Posed, d: Donor, plain: Molecule, plainIsMoving: boolean, fixed: Posed): Posed {
  const heavyIdx = plain.atoms.findIndex((a) => a.el !== 'H');
  const heavyEl = plain.atoms[heavyIdx].el;
  const faceDirs = sp3Complement(plain.atoms.flatMap((_, i) => (plain.bonds.some((b) => (b[0] === heavyIdx && b[1] === i) || (b[1] === heavyIdx && b[0] === i)) ? [plain.atoms[i].p.clone().sub(plain.atoms[heavyIdx].p).normalize()] : [])));
  const dist = 0.97 * (VDW.H + VDW[heavyEl]);
  let best: Posed | null = null, score = -1;
  if (plainIsMoving) {
    // fixed molecule donates: move the plain molecule so its heavy atom sits on the line X–H, a face towards the H
    const h = worldPos(donorP, d.h), e = h.clone().sub(worldPos(donorP, d.x)).normalize();
    const target = h.clone().add(e.clone().multiplyScalar(dist));
    for (const f of faceDirs) {
      const q1 = new THREE.Quaternion().setFromUnitVectors(f, e.clone().multiplyScalar(-1));
      for (let s = 0; s < 360; s += 15) {
        const q = new THREE.Quaternion().setFromAxisAngle(e, s * DEG).multiply(q1);
        const p: Posed = { mol: plain, q, t: target.clone().sub(plain.atoms[heavyIdx].p.clone().applyQuaternion(q)) };
        const c = clearance(p, [fixed], [[donorP, d.h, p, heavyIdx]]);
        if (c > score) { score = c; best = p; }
      }
    }
  } else {
    // the moving molecule donates: its H points at the fixed molecule's heavy atom
    const y = worldPos(fixed, heavyIdx);
    for (const f0 of faceDirs) {
      const f = worldDir(fixed, f0).normalize();
      const hl = donorP.mol.atoms[d.h].p, el = hl.clone().sub(donorP.mol.atoms[d.x].p).normalize();
      const target = y.clone().add(f.clone().multiplyScalar(dist));
      const q1 = new THREE.Quaternion().setFromUnitVectors(el, f.clone().multiplyScalar(-1));
      for (let s = 0; s < 360; s += 15) {
        const q = new THREE.Quaternion().setFromAxisAngle(f, s * DEG).multiply(q1);
        const p: Posed = { mol: donorP.mol, q, t: target.clone().sub(hl.clone().applyQuaternion(q)) };
        const c = clearance(p, [fixed], [[p, d.h, fixed, heavyIdx]]);
        if (c > score) { score = c; best = p; }
      }
    }
  }
  return best!;
}

export interface Scene {
  posed: Posed[];
  hbonds: HBond[];
  /** for a pair: the possible directions, the one shown, and whether a donor H points at an atom without lone pairs */
  pair?: { possible: Direction[]; shown: Direction | null; pointing: { donor: Posed; h: number; x: number } | null };
  cluster?: boolean;
}

export function singleScene(a: string): Scene { return { posed: [identity(molecule(a))], hbonds: [] }; }

export function pairScene(aId: string, bId: string, swap = false): Scene {
  const a = molecule(aId), b = molecule(bId);
  const A = identity(a);
  const possible = directions(a, b);
  if (possible.length) {
    const shown: Direction = possible.length > 1 && swap ? possible[1] : possible[0];
    const r = dock(A, b, shown === 'a-donates' ? 'mov-accepts' : 'mov-donates', [A])!;
    return { posed: [A, r.posed], hbonds: [r.bond], pair: { possible, shown, pointing: null } };
  }
  // no hydrogen bond. If one molecule has donors, the other has no acceptor atom: show its H pointing at that atom.
  const da = donors(a), db = donors(b);
  if (da.length) {
    const p = pointAt(A, da[0], b, true, A);
    return { posed: [A, p], hbonds: [], pair: { possible, shown: null, pointing: { donor: A, h: da[0].h, x: da[0].x } } };
  }
  if (db.length) {
    const tmp = identity(b);
    const p = pointAt(tmp, db[0], a, false, A);
    return { posed: [A, p], hbonds: [], pair: { possible, shown: null, pointing: { donor: p, h: db[0].h, x: db[0].x } } };
  }
  return { posed: [A, contact(A, b)], hbonds: [], pair: { possible, shown: null, pointing: null } };
}

/** Water with four neighbours: it donates to two and accepts from two, the tetrahedral pattern of ice. */
export function clusterScene(): Scene {
  const w = molecule('H2O');
  const C = identity(w);
  const placed: Posed[] = [C];
  const hbonds: HBond[] = [];
  const used = new Set<string>();
  for (let k = 0; k < 2; k++) {
    const r = dock(C, w, 'mov-accepts', placed, used)!;
    used.add(`h${r.bond.h}`); placed.push(r.posed); hbonds.push(r.bond);
  }
  for (let k = 0; k < 2; k++) {
    const r = dock(C, w, 'mov-donates', placed, used)!;
    used.add(`lp${r.bond.lp}`); placed.push(r.posed); hbonds.push(r.bond);
  }
  return { posed: placed, hbonds, cluster: true };
}

// ---------- words: counts, reasons (pure, so they can be tested without a screen) ----------
const EL_NAME: Record<El, Bi> = {
  H: { en: 'hydrogen', de: 'Wasserstoff' }, C: { en: 'carbon', de: 'Kohlenstoff' }, N: { en: 'nitrogen', de: 'Stickstoff' }, O: { en: 'oxygen', de: 'Sauerstoff' },
  F: { en: 'fluorine', de: 'Fluor' }, Cl: { en: 'chlorine', de: 'Chlor' }, S: { en: 'sulfur', de: 'Schwefel' },
};
export const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
export const nameOf = (m: Molecule) => L(m.name);
const possEn = (m: Molecule) => `${m.name.en}'s`;

/** "Donors: 2 (H on O) · Acceptors: 2 lone pairs on O" */
export function countsText(m: Molecule): string {
  const d = donors(m), a = m.lps.length;
  const dEl = d.length ? m.atoms[d[0].x].el : null, aEl = acceptorEl(m);
  const de = getLang() === 'de';
  const dPart = de ? `Donoren: ${d.length}${dEl ? ` (H an ${dEl})` : ''}` : `Donors: ${d.length}${dEl ? ` (H on ${dEl})` : ''}`;
  const aPart = a ? (de ? `Akzeptoren: ${a} ${a === 1 ? 'freies Elektronenpaar' : 'freie Elektronenpaare'} an ${aEl}` : `Acceptors: ${a} lone ${a === 1 ? 'pair' : 'pairs'} on ${aEl}`) : (de ? 'Akzeptoren: 0' : 'Acceptors: 0');
  return `${dPart} · ${aPart}`;
}

/** One sentence: why two molecules form no hydrogen bond (only called when neither direction works). */
export function noBondReason(a: Molecule, b: Molecule): string {
  const de = getLang() === 'de';
  const da = donors(a).length > 0, db = donors(b).length > 0;
  // Cases the school rule (H on N, O or F, lone pair on N, O or F) leaves out, so the view draws no line but says why.
  const hclDonates = (a.id === 'HCl' && b.lps.length > 0) || (b.id === 'HCl' && a.lps.length > 0);
  if (hclDonates) {
    return de
      ? 'Hier zeigt das H von HCl auf ein freies Elektronenpaar am Sauerstoff: eine echte Wasserstoffbrücke, und in Wasser gibt HCl das Proton sogar ganz ab (H₃O⁺ und Cl⁻, Einheit 26). Die Schulregel zählt nur H an N, O oder F, deshalb zeichnet diese Ansicht sie nicht ein.'
      : "Here HCl's H points at a lone pair on oxygen: a real hydrogen bond, and in water HCl even hands its proton over (H₃O⁺ and Cl⁻, unit 26). The school rule counts only H on N, O or F, so this view does not draw it.";
  }
  const weakEl = (m: Molecule): El | null => { const y = plainHeavy(m); return y === 'Cl' || y === 'S' ? y : null; };
  const h2sDonates = (a.id === 'H2S' && b.lps.length > 0) || (b.id === 'H2S' && a.lps.length > 0);
  const weak = h2sDonates ? 'S' : (da && weakEl(b)) ? weakEl(b) : (db && weakEl(a)) ? weakEl(a) : null;
  if (weak) {
    const asDonor = h2sDonates;
    return de
      ? (asDonor ? 'Nur eine schwache Wasserstoffbrücke: Schwefel ist groß und weniger elektronegativ, das H an S ist kaum positiv.' : `Nur eine schwache Wasserstoffbrücke: Das H zeigt auf ${weak === 'Cl' ? 'Chlor' : 'Schwefel'}, dessen freie Elektronenpaare groß und weit verteilt sind.`) + ' Diese Ansicht zeigt, wie die meisten Schulbücher, nur die starken Wasserstoffbrücken an N, O und F.'
      : (asDonor ? "Only a weak hydrogen bond: sulfur is large and less electronegative, so the H on it is barely positive." : `Only a weak hydrogen bond: the H points at ${weak === 'Cl' ? 'chlorine' : 'sulfur'}, whose lone pairs are large and spread out.`) + ' Like most school books, this view draws only the strong hydrogen bonds on N, O and F.';
  }
  if (da || db) {
    // one has donors; the other has no lone pair on N, O or F, and no donor of its own
    const D = da ? a : b, R = da ? b : a;
    const y = plainHeavy(R);
    if (de) {
      const tail = y === 'C' ? 'das kein freies Elektronenpaar hat' : 'dessen freie Elektronenpaare hier nicht zählen';
      return `Keine Wasserstoffbrücke: ${nameOf(R)} hat kein H an N, O oder F, und ein H-Atom vom ${D.molDe} würde auf das ${y}-Atom zeigen, ${tail}.`;
    }
    const tail = y === 'C' ? 'which has no lone pair' : 'whose lone pairs are not counted here';
    return `No hydrogen bond: ${R.name.en} has no H on N, O or F, and ${possEn(D)} H would point at ${EL_NAME[y].en}, ${tail}.`;
  }
  // nobody has a donor
  const accA = a.lps.length > 0, accB = b.lps.length > 0;
  if (accA && accB) {
    const el = L(EL_NAME[acceptorEl(a)!]);
    if (a.id === b.id) return de
      ? `Keine Wasserstoffbrücke: ${nameOf(a)} hat freie Elektronenpaare am ${el}, aber kein H an N, O oder F: Zwischen zwei ${nameOf(a)}-Molekülen gibt es keinen Donor.`
      : `No hydrogen bond: ${a.name.en} has lone pairs on ${el} but no H on N, O or F, so two ${a.name.en} molecules have no donor between them.`;
    return de
      ? `Keine Wasserstoffbrücke: Beide Moleküle haben freie Elektronenpaare am Sauerstoff, aber keines hat ein H an N, O oder F: Es gibt keinen Donor.`
      : `No hydrogen bond: both molecules have lone pairs on oxygen, but neither has an H on N, O or F: there is no donor.`;
  }
  if (accA || accB) {
    const acc = accA ? a : b;
    return de
      ? `Keine Wasserstoffbrücke: ${nameOf(acc)} hat freie Elektronenpaare am Sauerstoff zum Annehmen, aber keines der Moleküle hat ein H an N, O oder F, das als Donor dienen könnte.`
      : `No hydrogen bond: ${acc.name.en} has lone pairs on oxygen to accept with, but neither molecule has an H on N, O or F to act as a donor.`;
  }
  return de
    ? 'Keine Wasserstoffbrücke: Keines der Moleküle hat ein H an N, O oder F oder ein freies Elektronenpaar an N, O oder F.'
    : 'No hydrogen bond: neither molecule has an H on N, O or F, nor a lone pair on N, O or F.';
}

/** One sentence: who is the donor and who the acceptor. */
export function bondSentence(a: Molecule, b: Molecule, dir: Direction, both: boolean): string {
  const de = getLang() === 'de';
  const D = dir === 'a-donates' ? a : b, A = dir === 'a-donates' ? b : a;
  const dEl = D.atoms[donors(D)[0].x].el, aEl = acceptorEl(A)!;
  let s: string;
  if (a.id === b.id) s = de
    ? `Wasserstoffbrücke: Ein ${D.molDe} ist Donor (H an ${dEl}), das andere Akzeptor (freies Elektronenpaar an ${aEl}).`
    : `Hydrogen bond: one ${D.name.en} molecule is the donor (H on ${dEl}), the other the acceptor (lone pair on ${aEl}).`;
  else s = de
    ? `Wasserstoffbrücke: ${nameOf(D)} ist Donor (H an ${dEl}), ${nameOf(A)} ist Akzeptor (freies Elektronenpaar an ${aEl}).`
    : `Hydrogen bond: ${D.name.en} is the donor (H on ${dEl}), ${A.name.en} the acceptor (lone pair on ${aEl}).`;
  if (both) s += de ? ' Die Rollen lassen sich tauschen.' : ' The two can swap roles.';
  return s;
}

export const NOTE_CL_S: Bi = { en: 'S and Cl are larger atoms, so their lone pairs are spread out (sulfur is also less electronegative): their H-bonds are very weak; this view counts N, O and F only.', de: 'S und Cl sind größere Atome, ihre freien Elektronenpaare sind weiter verteilt (Schwefel ist außerdem weniger elektronegativ): Ihre Wasserstoffbrücken sind sehr schwach; diese Ansicht zählt nur N, O und F.' };
export const NOTE_CH: Bi = { en: 'H on carbon is not a donor: the C–H bond is hardly polar.', de: 'H an Kohlenstoff ist kein Donor: Die C–H-Bindung ist kaum polar.' };


// ---------- the 3D stage ----------
const PM = 0.012;   // scene units per pm
const STICK = 0xcfc8b6;

export class HBondStage extends Stage3D {
  private mol = new THREE.Group();
  private compact: boolean;
  scene3?: Scene;

  constructor(host: HTMLElement, compact = false) {
    super(host, { distance: compact ? 9 : 8, minDistance: 3, maxDistance: 26, autoRotate: true });
    this.compact = compact;
    // an oblique first view: lone pairs out of the molecular plane and the four neighbours of a cluster all show
    this.camera.position.set(0.68, 0.38, 0.63).normalize().multiplyScalar(compact ? 9 : 8);
    this.controls.autoRotateSpeed = compact ? 0.35 : 0.5;
    this.root.add(this.mol);
  }

  /** labels for the two distances of a hydrogen bond, in the current language */
  labels: { hb: string; cov: (x: El) => string } = { hb: 'hydrogen bond, about 190 pm', cov: (x) => `${x}–H bond` };

  draw(sc: Scene) {
    this.scene3 = sc;
    this.clearGroup(this.mol);
    // frame first, so labels can be sized for the distance they will be seen from
    const all: THREE.Vector3[] = sc.posed.flatMap((p) => p.mol.atoms.map((_, i) => worldPos(p, i).multiplyScalar(PM)));
    const box = new THREE.Box3().setFromPoints(all);
    const centre = box.getCenter(V()), radius = Math.max(1.2, box.getSize(V()).length() / 2);
    const dist = radius * (this.compact ? 2.9 : 2.75) + 2;
    const ls = dist * (this.compact ? 0.036 : 0.027);
    const donorHs = new Set<string>();
    for (const p of sc.posed) for (const d of donors(p.mol)) donorHs.add(`${sc.posed.indexOf(p)}:${d.h}`);
    sc.posed.forEach((p, pi) => {
      const m = p.mol;
      const pos = m.atoms.map((_, i) => worldPos(p, i).multiplyScalar(PM));
      // sticks
      for (const [i, j, o] of m.bonds) {
        const a = pos[i], b = pos[j], len = a.distanceTo(b), mid = a.clone().add(b).multiplyScalar(0.5);
        const dir = b.clone().sub(a).normalize();
        const offs = o === 2 ? (() => { const n = worldDir(p, m.plane).normalize(); const side = dir.clone().cross(n).normalize().multiplyScalar(0.075); return [side, side.clone().multiplyScalar(-1)]; })() : [V()];
        for (const off of offs) {
          const st = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, len, 10), new THREE.MeshStandardMaterial({ color: STICK, roughness: 0.6 }));
          st.position.copy(mid).add(off);
          st.quaternion.setFromUnitVectors(V(0, 1, 0), dir);
          this.mol.add(st);
        }
      }
      // atoms
      m.atoms.forEach((at, i) => {
        const r = DRAW_R[at.el];
        const s = new THREE.Mesh(new THREE.SphereGeometry(r, 28, 20), new THREE.MeshStandardMaterial({ color: ATOM_COLOR[at.el], roughness: 0.5 }));
        s.position.copy(pos[i]);
        this.mol.add(s);
        if (donorHs.has(`${pi}:${i}`)) {
          const halo = new THREE.Mesh(new THREE.SphereGeometry(r * 1.9, 24, 16), new THREE.MeshBasicMaterial({ color: CHARGE.plus, transparent: true, opacity: 0.32, depthWrite: false }));
          halo.position.copy(pos[i]);
          this.mol.add(halo);
        }
        if (at.el !== 'H' && at.el !== 'C') {
          const lab = this.label(at.el, Math.min(0.34, r * 1.05), '#121a33');
          lab.position.copy(pos[i]);
          this.mol.add(lab);
        }
      });
      // acceptor lone pairs: purple lobes
      for (const lp of m.lps) {
        const d = worldDir(p, lp.dir).normalize();
        const lobe = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 14), new THREE.MeshStandardMaterial({ color: COLORS.lonePair, emissive: COLORS.lonePair, emissiveIntensity: 0.25, transparent: true, opacity: 0.6, roughness: 0.4, depthWrite: false }));
        lobe.scale.set(0.15, 0.27, 0.15);
        lobe.quaternion.setFromUnitVectors(V(0, 1, 0), d);
        lobe.position.copy(pos[lp.atom]).add(d.clone().multiplyScalar(DRAW_R[m.atoms[lp.atom].el] + 0.22));
        this.mol.add(lobe);
      }
    });
    // hydrogen bonds: dashes from H to the acceptor atom
    sc.hbonds.forEach((hb, k) => {
      const h = worldPos(hb.donor, hb.h).multiplyScalar(PM), y = worldPos(hb.acceptor, hb.y).multiplyScalar(PM);
      const dir = y.clone().sub(h), len = dir.length(); dir.normalize();
      const start = DRAW_R.H, end = len - DRAW_R[hb.acceptor.mol.atoms[hb.y].el];
      const n = 6, seg = (end - start) / (2 * n - 1);
      for (let i = 0; i < n; i++) {
        const a = start + 2 * i * seg;
        const c = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.032, seg, 8), new THREE.MeshBasicMaterial({ color: 0xe6dcff }));
        c.position.copy(h).add(dir.clone().multiplyScalar(a + seg / 2));
        c.quaternion.setFromUnitVectors(V(0, 1, 0), dir);
        this.mol.add(c);
      }
      // distance labels on the first bond of a pair (a cluster stays uncluttered)
      if (k === 0 && !sc.cluster) {
        // put the labels on the side away from the molecules' centre, clear of the atoms
        const mid = h.clone().add(dir.clone().multiplyScalar(len / 2));
        let side = mid.clone().sub(centre); side.sub(dir.clone().multiplyScalar(side.dot(dir)));
        if (side.lengthSq() < 1e-4) side = perp(dir);
        side.normalize().multiplyScalar(ls * 2.4);
        const l1 = this.label(this.labels.hb, ls, '#e6dcff', 'rgba(18,26,51,0.8)');
        l1.position.copy(mid).add(side);
        this.mol.add(l1);
        const x = worldPos(hb.donor, hb.x).multiplyScalar(PM);
        const l2 = this.label(this.labels.cov(hb.donor.mol.atoms[hb.x].el), ls, '#ece6d6', 'rgba(18,26,51,0.8)');
        l2.position.copy(x).add(h).multiplyScalar(0.5).add(side);
        this.mol.add(l2);
      }
    });
    // a little below the middle: the formula sits over the top of the stage
    this.mol.position.copy(centre).multiplyScalar(-1);
    this.mol.position.y -= radius * 0.12;
    const off = this.camera.position.clone().sub(this.controls.target);
    if (off.lengthSq() < 1e-6) off.set(0.1, 0.3, 1);
    this.controls.target.set(0, 0, 0);
    this.camera.position.copy(off.normalize().multiplyScalar(dist));
    this.controls.maxDistance = Math.max(26, dist * 2);
  }
}
