// Journal: takeaways, misconception ledger, calibration, elements met, equation notebook.
import { h, s, clear } from './dom';
import { L, t, dateStr, num } from '../i18n';
import { getState } from '../model/store';
import { MISCONCEPTIONS } from '../content/curriculum';
import { go } from '../router';

type Tab = 'takeaways' | 'misconceptions' | 'calibration' | 'elements' | 'equations';
let current: Tab = 'takeaways';

export function renderJournal(root: HTMLElement) {
  root.append(h('div', { class: 'topbar' }, h('h1', null, t('journalTitle'))));
  const tabs: [Tab, string][] = [['takeaways', t('tabTakeaways')], ['misconceptions', t('tabMisconceptions')], ['calibration', t('tabCalibration')], ['elements', t('tabElements')], ['equations', t('tabEquations')]];
  const bar = h('div', { class: 'segmented', role: 'tablist' });
  const panel = h('div', { role: 'tabpanel' });
  const draw = () => {
    clear(bar);
    for (const [id, label] of tabs) bar.append(h('button', { type: 'button', role: 'tab', 'aria-selected': String(current === id), onclick: () => { current = id; draw(); } }, label));
    clear(panel);
    ({ takeaways, misconceptions, calibration, elements, equations })[current](panel);
  };
  draw();
  root.append(bar, panel);
}

function takeaways(p: HTMLElement) {
  const list = [...getState().takeaways].reverse();
  if (!list.length) { p.append(h('p', { class: 'muted' }, t('noTakeaways'))); return; }
  for (const tk of list) p.append(h('article', { class: 'takeaway' },
    h('div', { class: 'meta' }, `${L({ en: 'Unit', de: 'Einheit' })} ${tk.unit} · ${dateStr(tk.date)}`),
    h('p', { style: 'margin:0' }, tk.text),
    tk.tightened ? h('blockquote', { class: 'quote' }, tk.tightened) : null));
}

function misconceptions(p: HTMLElement) {
  const st = getState();
  const rank = { spotted: 0, challenged: 1, resolved: 2 };
  const rows = Object.entries(st.misconceptions).sort(([, a], [, b]) => rank[a.status] - rank[b.status]);
  p.append(h('p', { class: 'muted small' }, L({ en: 'A trap counts as resolved after you avoid it on three separate days.', de: 'Eine Falle gilt als gelöst, wenn du sie an drei verschiedenen Tagen vermeidest.' })));
  if (!rows.length) { p.append(h('p', { class: 'muted' }, L({ en: 'No traps recorded yet.', de: 'Noch keine Fallen verzeichnet.' }))); return; }
  for (const [id, m] of rows) {
    const info = MISCONCEPTIONS.find((x) => x.id === id);
    p.append(h('div', { class: 'mis-row' },
      h('div', null, h('div', null, info ? L(info.name) : id),
        h('div', { class: 'unit' }, `${L({ en: 'Unit', de: 'Einheit' })} ${info?.unit ?? '?'} · ${L({ en: 'since', de: 'seit' })} ${dateStr(m.since)} · ${m.correctDays.length}/3 ${L({ en: 'days right', de: 'Tage richtig' })}`)),
      h('span', { class: 'status-pill ' + m.status }, t(m.status))));
  }
}

function calibration(p: HTMLElement) {
  const bins = Object.entries(getState().calib).filter(([, v]) => v.n > 0);
  if (!bins.length) { p.append(h('p', { class: 'muted' }, t('calibEmpty'))); return; }
  const W = 320, H = 260, x0 = 44, y0 = 16, w = 256, hgt = 200;
  const X = (c: number) => x0 + ((c - 0.5) / 0.5) * w;
  const Y = (a: number) => y0 + hgt - a * hgt;
  const svg = s('svg', { viewBox: `0 0 ${W} ${H}`, class: 'pt', role: 'img', 'aria-label': L({ en: 'Calibration chart', de: 'Kalibrierungsdiagramm' }) });
  for (const a of [0, 0.25, 0.5, 0.75, 1]) {
    svg.append(s('line', { x1: x0, x2: x0 + w, y1: Y(a), y2: Y(a), stroke: '#222d55' }), s('text', { x: x0 - 8, y: Y(a) + 4, 'text-anchor': 'end', fill: '#9aa3bf', 'font-size': 11 }, `${a * 100} %`));
  }
  for (const c of [0.5, 0.6, 0.7, 0.8, 0.9, 1]) svg.append(s('text', { x: X(c), y: y0 + hgt + 18, 'text-anchor': 'middle', fill: '#9aa3bf', 'font-size': 11 }, `${c * 100}`));
  svg.append(s('line', { x1: X(0.5), y1: Y(0.5), x2: X(1), y2: Y(1), stroke: '#c9c3b3', 'stroke-dasharray': '4 4' }));
  svg.append(s('text', { x: x0 + w / 2, y: H - 2, 'text-anchor': 'middle', fill: '#9aa3bf', 'font-size': 11 }, L({ en: 'how sure you were (%)', de: 'wie sicher du warst (%)' })));
  for (const [k, v] of bins) {
    const c = (+k + 5) / 100, a = v.right / v.n;
    svg.append(s('circle', { cx: X(c), cy: Y(a), r: 4 + Math.min(10, Math.sqrt(v.n) * 2), fill: '#ffc15e', opacity: 0.85 }));
  }
  p.append(h('p', { class: 'muted small' }, t('calibHelp')), svg,
    h('ul', { class: 'summary-list', style: 'margin-top:12px' }, bins.sort().map(([k, v]) => h('li', null, h('span', null, `${k}–${+k + 9} %`), h('span', null, L({ en: `right ${v.right} of ${v.n}`, de: `${v.right} von ${v.n} richtig` }))))));
}

const SYMBOLS = 'H He Li Be B C N O F Ne Na Mg Al Si P S Cl Ar K Ca Sc Ti V Cr Mn Fe Co Ni Cu Zn Ga Ge As Se Br Kr Rb Sr Y Zr Nb Mo Tc Ru Rh Pd Ag Cd In Sn Sb Te I Xe Cs Ba La Ce Pr Nd Pm Sm Eu Gd Tb Dy Ho Er Tm Yb Lu Hf Ta W Re Os Ir Pt Au Hg Tl Pb Bi Po At Rn Fr Ra Ac Th Pa U Np Pu Am Cm Bk Cf Es Fm Md No Lr Rf Db Sg Bh Hs Mt Ds Rg Cn Nh Fl Mc Lv Ts Og'.split(' ');
function place(z: number): [number, number] {
  if (z === 1) return [0, 0]; if (z === 2) return [17, 0];
  if (z <= 4) return [z - 3, 1]; if (z <= 10) return [z + 7, 1];
  if (z <= 12) return [z - 11, 2]; if (z <= 18) return [z - 1, 2];
  if (z <= 36) return [z - 19, 3]; if (z <= 54) return [z - 37, 4];
  if (z <= 56) return [z - 55, 5]; if (z <= 71) return [z - 57 + 2, 8]; if (z <= 86) return [z - 72 + 3, 5];
  if (z <= 88) return [z - 87, 6]; if (z <= 103) return [z - 89 + 2, 9]; return [z - 104 + 3, 6];
}
function elements(p: HTMLElement) {
  const lit = new Set(getState().elements);
  const c = 21, W = 18 * c + 4, H = 10 * c + 14;
  const svg = s('svg', { viewBox: `0 0 ${W} ${H}`, class: 'pt', role: 'img', 'aria-label': L({ en: `${lit.size} elements met`, de: `${lit.size} Elemente kennengelernt` }) });
  SYMBOLS.forEach((sym, i) => {
    const [x, y] = place(i + 1);
    const g = s('g', { class: 'cell' + (lit.has(sym) ? ' lit' : '') });
    const yy = y >= 8 ? y * c + 10 : y * c;
    g.append(s('rect', { x: x * c + 2, y: yy + 2, width: c - 2, height: c - 2, rx: 3 }), s('text', { x: x * c + 2 + (c - 2) / 2, y: yy + 2 + (c - 2) / 2 + 4, 'text-anchor': 'middle' }, sym));
    svg.append(g);
  });
  p.append(h('p', { class: 'muted small' }, t('elementsHelp')), svg,
    h('p', { class: 'muted small', style: 'margin-top:10px' }, L({ en: `${lit.size} of 118 so far.`, de: `Bisher ${lit.size} von 118.` })));
}

function slider(min: number, max: number, step: number, value: number, label: string, on: (v: number) => void) {
  const i = h('input', { type: 'range', min: String(min), max: String(max), step: String(step), value: String(value), 'aria-label': label }) as HTMLInputElement;
  i.addEventListener('input', () => on(+i.value));
  return i;
}

const lab = (name: string, input: HTMLElement) => h('label', { class: 'eq-slider' }, h('span', null, name), input);

function equations(p: HTMLElement) {
  // 1. Shell capacity
  const capOut = h('span', { class: 'result' });
  const capLbl = h('span');
  const cap = (n: number) => { capLbl.textContent = `n = ${n}`; capOut.textContent = String(2 * n * n); };
  // 2. Z_eff
  const zOut = h('span', { class: 'result' }), zLbl = h('span');
  const zeff = (z: number) => { const core = z <= 2 ? 0 : z <= 10 ? 2 : 10; zLbl.textContent = `${SYMBOLS[z - 1]}: Z = ${z}, S = ${core}`; zOut.textContent = String(z - core); };
  // 3. Coulomb
  let q1 = 1, q2 = 1, r = 1;
  const cOut = h('span', { class: 'result' }), cLbl = h('span');
  const coul = () => { cLbl.textContent = `q₁ = ${q1}, q₂ = ${q2}, r = ${num(r, 2)}`; cOut.textContent = `${num((q1 * q2) / r, 2)} ×`; };
  // 4. Δχ
  let a = 3.44, b = 2.2;
  const dOut = h('span', { class: 'result' }), dLbl = h('span');
  const dchi = () => {
    const d = Math.abs(a - b);
    const kind = d < 0.4 ? L({ en: 'nonpolar', de: 'unpolar' }) : d <= 1.8 ? L({ en: 'polar', de: 'polar' }) : L({ en: 'ionic', de: 'ionisch' });
    dLbl.textContent = `χ = ${num(a, 2)} / ${num(b, 2)} · ${kind}`; dOut.textContent = num(d, 2);
  };
  cap(3); zeff(17); coul(); dchi();
  const card = (formula: Node | string, note: string, ...rows: Node[]) => h('div', { class: 'eq-card' }, h('div', { class: 'formula' }, formula), h('p', { class: 'muted small', style: 'margin:0' }, note), ...rows);
  p.append(
    card('2n²', L({ en: 'Electrons a shell can hold (unit 1)', de: 'Elektronen, die eine Schale fasst (Einheit 1)' }),
      h('div', { class: 'live' }, capLbl, capOut), slider(1, 4, 1, 3, 'n', cap)),
    card(h('span', null, 'Z', h('sub', null, 'eff'), ' ≈ Z − S'), L({ en: 'Pull felt by an outer electron (unit 2)', de: 'Anziehung, die ein Außenelektron spürt (Einheit 2)' }),
      h('div', { class: 'live' }, zLbl, zOut), slider(1, 18, 1, 17, 'Z', zeff)),
    card(h('span', null, 'E ∝ q', h('sub', null, '1'), 'q', h('sub', null, '2'), ' / r'), L({ en: 'Ionic attraction relative to NaCl (unit 4)', de: 'Ionische Anziehung relativ zu NaCl (Einheit 4)' }),
      h('div', { class: 'live' }, cLbl, cOut),
      lab('q₁', slider(1, 3, 1, 1, 'q1', (v) => { q1 = v; coul(); })), lab('q₂', slider(1, 3, 1, 1, 'q2', (v) => { q2 = v; coul(); })), lab('r', slider(0.8, 2, 0.05, 1, 'r', (v) => { r = v; coul(); }))),
    card(h('span', null, 'Δχ = |χ', h('sub', null, 'A'), ' − χ', h('sub', null, 'B'), '|'), L({ en: 'Bond type from electronegativity (unit 5)', de: 'Bindungsart aus der Elektronegativität (Einheit 5)' }),
      h('div', { class: 'live' }, dLbl, dOut),
      lab('χ A', slider(0.7, 4, 0.01, a, 'χA', (v) => { a = v; dchi(); })), lab('χ B', slider(0.7, 4, 0.01, b, 'χB', (v) => { b = v; dchi(); }))),
    card(h('span', null, 'E = Σ w', h('sub', null, 'ij'), ' / r', h('sup', null, '2'), h('sub', null, 'ij')), L({ en: 'Electron-pair repulsion; λ ≈ 1.25 gives NH₃ its 107° (unit 6)', de: 'Elektronenpaarabstoßung; λ ≈ 1,25 ergibt die 107° von NH₃ (Einheit 6)' }),
      h('button', { class: 'btn small quiet', type: 'button', onclick: () => go('#/lab') }, L({ en: 'Try it in the lab', de: 'Im Labor ausprobieren' }))),
  );
}
