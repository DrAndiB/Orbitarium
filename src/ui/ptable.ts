// The interactive periodic table: overlays, search, element cards, optional 3D landscape.
// Used as its own screen, as a pop-up from any unit step or question, and in the journal.
import { h, s, clear, rich } from './dom';
import { L, num, getLang, type Bi } from '../i18n';
import {
  ELEMENTS, byZ, search, OVERLAYS, overlayById, overlayColor, overlayRange, outerElectrons, ionText, typicalIons,
  prettyConfig, CAT_COLOR, CAT_NAME, BLOCK_COLOR, ROW_COLOR, CORE, CALCULATED_RADIUS, NO_STANDARD_MASS, type Element, type OverlayId,
} from '../content/elements';
import { getState } from '../model/store';
import { touchElements } from '../model/learner';
import { TableLandscape } from '../sim/tableLandscape';
import { buzz } from '../platform';

export interface TableOptions {
  overlay?: OverlayId;
  selected?: number;
  overlays?: OverlayId[];
  allow3d?: boolean;
  start3d?: boolean;
  /** Pick mode: no card, taps only select (used by "find it on the map" questions). */
  pick?: boolean;
  onSelect?: (z: number, overlay: OverlayId) => void;
  onOverlay?: (o: OverlayId) => void;
  onView?: (view: '2d' | '3d') => void;
}
export interface TableHandle { el: HTMLElement; select(z: number): void; setOverlay(o: OverlayId): void; dispose(): void; }

const C = 40;            // cell pitch in svg units
const M = { l: 22, t: 22 };
const FGAP = 14;         // gap above the f-block rows

const cellXY = (e: Element): [number, number] => {
  // Row 8 is empty in the data; the f-block rows (9, 10) sit right under row 7 after a small gap.
  const yy = e.y >= 9 ? (e.y - 2) * C + FGAP : (e.y - 1) * C;
  return [M.l + (e.x - 1) * C, M.t + yy];
};

const word = (bi: Bi) => L(bi);

export function createTable(opts: TableOptions = {}): TableHandle {
  let overlay: OverlayId = opts.overlay ?? 'category';
  let selected = opts.selected ?? 0;
  let view: '2d' | '3d' = opts.start3d && opts.allow3d ? '3d' : '2d';
  let zoomed = false;
  const met = new Set(getState().elements);
  const available = OVERLAYS.filter((o) => (opts.overlays ?? OVERLAYS.map((x) => x.id)).includes(o.id));

  // ----- controls -----
  const chips = h('div', { class: 'chip-row', role: 'group', 'aria-label': L({ en: 'What the colours show', de: 'Was die Farben zeigen' }) });
  const searchIn = h('input', { type: 'search', class: 'pt-search', placeholder: L({ en: 'Find: name, symbol or number', de: 'Suchen: Name, Symbol oder Nummer' }), 'aria-label': L({ en: 'Find an element', de: 'Element suchen' }) }) as HTMLInputElement;
  const results = h('div', { class: 'pt-results', role: 'listbox' });
  const viewBtn = opts.allow3d ? h('button', { class: 'btn small quiet', type: 'button' }) : null;
  const zoomBtn = h('button', { class: 'btn small quiet', type: 'button' });
  const tools = h('div', { class: 'pt-tools' }, searchIn, viewBtn, zoomBtn);

  // ----- 2D grid -----
  const W = M.l + 18 * C + 6, H = M.t + 9 * C + FGAP + 4;
  const svg = s('svg', { class: 'pt-grid', viewBox: `0 0 ${W} ${H}`, role: 'grid', 'aria-label': L({ en: 'Periodic table', de: 'Periodensystem' }) }) as SVGSVGElement;
  const scroll = h('div', { class: 'pt-scroll' }, svg);
  const cells = new Map<number, SVGGElement>();
  for (let g = 1; g <= 18; g++) svg.append(s('text', { x: M.l + (g - 1) * C + C / 2 - 1, y: 15, class: 'pt-axis', 'text-anchor': 'middle' }, String(g)));
  for (let p = 1; p <= 7; p++) svg.append(s('text', { x: 10, y: M.t + (p - 1) * C + C / 2 + 4, class: 'pt-axis', 'text-anchor': 'middle' }, String(p)));
  // placeholders for the f-block in group 3
  svg.append(s('text', { x: M.l + 2 * C + C / 2 - 1, y: M.t + 5 * C + C / 2 + 4, class: 'pt-axis', 'text-anchor': 'middle' }, '57–71'));
  svg.append(s('text', { x: M.l + 2 * C + C / 2 - 1, y: M.t + 6 * C + C / 2 + 4, class: 'pt-axis', 'text-anchor': 'middle' }, '89–103'));
  for (const e of ELEMENTS) {
    const [x, y] = cellXY(e);
    const g = s('g', { class: 'pt-cell' + (e.predicted ? ' pred' : ''), tabindex: -1, role: 'gridcell', 'data-z': e.z, 'aria-label': `${e.z} ${L({ en: e.en, de: e.de })}` }) as SVGGElement;
    g.append(
      s('rect', { x: x + 1, y: y + 1, width: C - 3, height: C - 3, rx: 5, class: 'bg' }),
      s('text', { x: x + 4, y: y + 10, class: 'zn' }, String(e.z)),
      s('text', { x: x + C / 2 - 1, y: y + 24, class: 'sym', 'text-anchor': 'middle' }, e.s),
      s('text', { x: x + C / 2 - 1, y: y + 34.5, class: 'v', 'text-anchor': 'middle' }, ''),
    );
    g.addEventListener('click', () => { pickZ(e.z); });
    cells.set(e.z, g);
    svg.append(g);
  }
  svg.addEventListener('keydown', (ev) => {
    if (!selected) return;
    const e = byZ(selected);
    const k = (ev as KeyboardEvent).key;
    const delta: Record<string, [number, number]> = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
    if (!delta[k]) return;
    ev.preventDefault();
    const [dx, dy] = delta[k];
    const next = ELEMENTS.find((o) => o.x === e.x + dx && o.y === e.y + dy) ?? (dx ? byZ(Math.max(1, Math.min(118, e.z + dx))) : undefined);
    if (next) pickZ(next.z);
  });

  // ----- 3D -----
  const stage3d = h('div', { class: 'pt3d', hidden: true });
  let land: TableLandscape | null = null;

  const legend = h('div', { class: 'pt-legend' });
  const card = h('div', { class: 'pt-card', 'aria-live': 'polite' });
  const el = h('div', { class: 'ptable' + (opts.pick ? ' pick' : '') }, chips, tools, results, scroll, stage3d, legend, opts.pick ? null : card);

  function drawChips() {
    clear(chips);
    for (const o of available) chips.append(h('button', {
      class: 'chip', type: 'button', 'aria-pressed': String(o.id === overlay), onclick: () => setOverlay(o.id, true),
    }, word(o.name)));
  }

  function paint() {
    const o = overlayById(overlay);
    for (const e of ELEMENTS) {
      const g = cells.get(e.z)!;
      const { color } = overlayColor(o, e, met);
      const rect = g.querySelector('.bg') as SVGRectElement;
      rect.setAttribute('fill', color ?? '#1b2346');
      rect.setAttribute('fill-opacity', color ? (o.kind === 'num' || o.kind === 'div' ? '0.95' : '0.42') : '1');
      rect.setAttribute('stroke', color ?? '#2e3a69');
      g.classList.toggle('dim', !color);
      g.classList.toggle('sel', e.z === selected);
      g.setAttribute('aria-selected', String(e.z === selected));
      (g.querySelector('.v') as SVGTextElement).textContent = valueLabel(e);
      const dark = color && (o.kind === 'num' || o.kind === 'div') && overlayColor(o, e).t > 0.55 && o.id !== 'ie';
      g.classList.toggle('ink-dark', !!dark);
    }
    drawLegend();
    land?.setOverlay(o, met);
  }

  function valueLabel(e: Element): string {
    const o = overlayById(overlay);
    if (o.id === 'shells') return String(e.sh.length);
    if (o.id === 'outer') { const v = outerElectrons(e); return v === null ? '' : String(v); }
    if (o.id === 'block') return e.b;
    if (o.id === 'ion') return ionText(e).split(',')[0].replace(e.s, '') || '';
    if (o.kind === 'num') { const v = o.value!(e); return v === null ? '' : num(v, o.id === 'mass' ? (v >= 100 ? 0 : 1) : o.digits ?? 0); }
    return '';
  }

  function drawLegend() {
    clear(legend);
    const o = overlayById(overlay);
    const item = (color: string, label: string) => h('span', { class: 'pt-key' }, h('i', { style: `background:${color}` }), label);
    if (o.id === 'category') {
      for (const c of ['alkali', 'alkaline', 'transition', 'post', 'metalloid', 'nonmetal', 'noble', 'lanthanide', 'actinide'] as const) legend.append(item(CAT_COLOR[c], word(CAT_NAME[c])));
    } else if (o.id === 'block') {
      for (const b of ['s', 'p', 'd', 'f']) legend.append(item(BLOCK_COLOR[b], `${b}-${L({ en: 'block', de: 'Block' })}`));
      legend.append(h('p', { class: 'muted small' }, L({ en: 'Which orbitals are filling as you move along a row.', de: 'Welche Orbitale sich entlang einer Zeile füllen.' })));
    } else if (o.id === 'shells') {
      ROW_COLOR.forEach((c, i) => legend.append(item(c, String(i + 1))));
      legend.append(h('p', { class: 'muted small' }, L({ en: 'Each row adds one shell: period 3 atoms have three shells.', de: 'Jede Zeile bringt eine Schale dazu: Atome der 3. Periode haben drei Schalen.' })));
    } else if (o.id === 'outer') {
      legend.append(h('p', { class: 'muted small' }, L({ en: 'Main groups only: groups 1–2 and 13–18 count outer electrons (group 13 has 3, group 17 has 7). Helium has 2.', de: 'Nur Hauptgruppen: Gruppe 1–2 und 13–18 zählen Außenelektronen (Gruppe 13 hat 3, Gruppe 17 hat 7). Helium hat 2.' })));
    } else if (o.id === 'ion') {
      legend.append(item('#ff6b6b', L({ en: 'positive ion (loses electrons)', de: 'positives Ion (gibt Elektronen ab)' })), item('#5aa9ff', L({ en: 'negative ion (gains electrons)', de: 'negatives Ion (nimmt Elektronen auf)' })), item('#1b2346', L({ en: 'no single typical ion', de: 'kein einzelnes typisches Ion' })));
    } else if (o.id === 'met') {
      legend.append(h('p', { class: 'muted small' }, L({ en: `${met.size} of 118 met so far in lessons and simulations.`, de: `Bisher ${met.size} von 118 in Lektionen und Simulationen begegnet.` })));
    } else {
      const [lo, hi] = overlayRange(o);
      const fmt = (v: number) => num(v, o.id === 'mass' ? (v >= 100 ? 0 : 1) : o.digits ?? 0) + (o.unit ? ` ${o.unit}` : '');
      legend.append(h('div', { class: 'pt-scale' },
        h('span', null, fmt(lo)),
        h('i', { style: `background:linear-gradient(90deg, ${overlayColor(o, ELEMENTS.find((e) => o.value!(e) === lo)!).color}, ${o.hue})` }),
        h('span', null, fmt(hi))));
      if (o.id === 'chi') legend.append(h('p', { class: 'muted small' }, L({ en: 'Pauling scale. Grey cells have no value: noble gases rarely bond.', de: 'Pauling-Skala. Graue Felder haben keinen Wert: Edelgase binden kaum.' })));
      if (o.id === 'mass') legend.append(h('p', { class: 'muted small' }, L({ en: 'Average over the natural isotopes, in atomic mass units (u). One u is about the mass of one proton.', de: 'Mittelwert über die natürlichen Isotope, in atomaren Masseeinheiten (u). Ein u ist etwa die Masse eines Protons.' })));
      if (o.id === 'mass') legend.append(h('p', { class: 'muted small' }, L({ en: 'Technetium, promethium and everything from polonium on (except thorium, protactinium and uranium) have no stable isotopes: their value is the mass number of the longest-lived one.', de: 'Technetium, Promethium und alles ab Polonium (außer Thorium, Protactinium und Uran) haben keine stabilen Isotope: Ihr Wert ist die Massenzahl des langlebigsten.' })));
      if (o.id === 'radius') legend.append(h('p', { class: 'muted small' }, L({ en: 'Empirical radii measured in compounds (Slater). Noble gases and astatine form almost no compounds, so theirs are calculated (Clementi) and run a little small.', de: 'Empirische Radien aus Verbindungen (Slater). Edelgase und Astat bilden kaum Verbindungen, ihre Werte sind berechnet (Clementi) und fallen etwas klein aus.' })));
    }
  }

  function setOverlay(o: OverlayId, user = false) {
    overlay = o;
    drawChips();
    paint();
    if (user) { opts.onOverlay?.(o); buzz('light'); }
  }

  function pickZ(z: number) {
    select(z);
    touchElements([byZ(z).s]);
    met.add(byZ(z).s);
    opts.onSelect?.(z, overlay);
    buzz('light');
  }

  function select(z: number) {
    selected = z;
    paint();
    land?.select(z);
    if (!opts.pick) drawCard();
    const g = cells.get(z);
    if (g && zoomed) {
      const r = (g as unknown as SVGGraphicsElement).getBoundingClientRect(), sr = scroll.getBoundingClientRect();
      if (r.left < sr.left || r.right > sr.right) scroll.scrollBy({ left: r.left - sr.left - sr.width / 2 + r.width / 2, behavior: 'smooth' });
    }
  }

  function drawCard() {
    clear(card);
    if (!selected) {
      card.append(h('p', { class: 'muted' }, L({ en: 'Tap any element for its card: numbers, both names and a fun fact.', de: 'Tippe auf ein Element für seine Karte: Zahlen, beide Namen und eine kuriose Tatsache.' })));
      return;
    }
    const e = byZ(selected);
    const lang = getLang();
    const ions = typicalIons(e);
    const ionLine = ions.charges.length ? ionText(e) : ions.note === 'covalent' ? L({ en: 'shares electrons (covalent)', de: 'teilt Elektronen (kovalent)' }) : ions.note === 'none' ? L({ en: 'none: full outer shell', de: 'keines: volle Außenschale' }) : L({ en: 'several, depends on partner', de: 'mehrere, je nach Partner' });
    const phase = { g: L({ en: 'gas', de: 'gasförmig' }), l: L({ en: 'liquid', de: 'flüssig' }), s: L({ en: 'solid', de: 'fest' }) }[e.ph] ?? '';
    const row = (label: Bi, value: string | Node, note?: string) => h('div', { class: 'pt-row' }, h('span', { class: 'k' }, word(label)), h('span', { class: 'val' }, value), note ? h('span', { class: 'note' }, note) : null);
    const outer = outerElectrons(e);
    card.append(
      h('div', { class: 'pt-head' },
        h('div', { class: 'pt-tile', style: `--tile:${CAT_COLOR[e.c]}` }, h('span', { class: 'zn' }, String(e.z)), h('span', { class: 'sym' }, e.s), h('span', { class: 'm' }, num(e.m, e.m >= 100 ? 0 : 2))),
        h('div', null,
          h('h3', null, lang === 'de' ? e.de : e.en),
          h('p', { class: 'pt-other', lang: lang === 'de' ? 'en' : 'de' }, lang === 'de' ? e.en : e.de),
          h('p', { class: 'muted small', style: 'margin:0' }, `${word(CAT_NAME[e.c])} · ${L({ en: 'period', de: 'Periode' })} ${e.p} · ${L({ en: 'group', de: 'Gruppe' })} ${e.g} · ${e.b}-${L({ en: 'block', de: 'Block' })}`),
          h('div', { class: 'pt-badges' },
            CORE.has(e.z) ? h('span', { class: 'badge core' }, L({ en: 'core element', de: 'Kernelement' })) : null,
            met.has(e.s) ? h('span', { class: 'badge met' }, L({ en: 'met in lessons', de: 'schon begegnet' })) : null,
            e.predicted ? h('span', { class: 'badge pred' }, L({ en: 'properties predicted', de: 'Eigenschaften vorhergesagt' })) : null))),
      h('div', { class: 'pt-rows' },
        row({ en: 'Shells', de: 'Schalen' }, e.sh.join(' · '), outer !== null ? L({ en: `${outer} outer electron${outer === 1 ? '' : 's'}`, de: `${outer} Außenelektron${outer === 1 ? '' : 'en'}` }) : undefined),
        row({ en: 'Typical ion', de: 'Typisches Ion' }, ionLine),
        NO_STANDARD_MASS.has(e.z)
          ? row({ en: 'Atomic mass', de: 'Atommasse' }, `[${Math.round(e.m)}]`, L({ en: 'mass number of the longest-lived isotope (no stable isotopes)', de: 'Massenzahl des langlebigsten Isotops (keine stabilen Isotope)' }))
          : row({ en: 'Atomic mass', de: 'Atommasse' }, `${num(e.m, e.m >= 100 ? 0 : 3)} u`, L({ en: 'isotope average', de: 'Isotopen-Mittelwert' })),
        row({ en: 'Electronegativity', de: 'Elektronegativität' }, e.chi === null ? '–' : num(e.chi, 2)),
        row({ en: 'Atom size', de: 'Atomgröße' }, e.r === null ? '–' : `${e.r} pm`, CALCULATED_RADIUS.has(e.z) ? L({ en: 'calculated radius', de: 'berechneter Radius' }) : L({ en: 'radius measured in compounds', de: 'in Verbindungen gemessener Radius' })),
        row({ en: '1st ionization energy', de: '1. Ionisierungsenergie' }, e.ie === null ? '–' : `${num(e.ie, 0)} kJ/mol`),
        row({ en: 'At room temperature', de: 'Bei Raumtemperatur' }, phase, e.mp !== null ? `${L({ en: 'melts', de: 'schmilzt' })} ${num(e.mp, 0)} °C${e.bp !== null ? ` · ${L({ en: 'boils', de: 'siedet' })} ${num(e.bp, 0)} °C` : ''}` : undefined),
        row({ en: 'Electron configuration', de: 'Elektronenkonfiguration' }, prettyConfig(e.cfg)),
      ),
    );
    if (e.origin) card.append(h('p', { class: 'pt-origin' }, h('strong', null, L({ en: 'Why the symbol is ', de: 'Warum das Symbol ' }) + e.s + L({ en: '. ', de: ' heißt. ' })), rich(e.origin)));
    card.append(
      h('blockquote', { class: 'pt-fact' }, rich(e.fact)),
      h('div', { class: 'pt-nav' },
        e.z > 1 ? h('button', { class: 'btn small quiet', type: 'button', onclick: () => pickZ(e.z - 1) }, `← ${byZ(e.z - 1).s}`) : h('span'),
        e.z < 118 ? h('button', { class: 'btn small quiet', type: 'button', onclick: () => pickZ(e.z + 1) }, `${byZ(e.z + 1).s} →`) : h('span')),
    );
  }

  // search
  searchIn.addEventListener('input', () => {
    clear(results);
    for (const e of search(searchIn.value)) results.append(h('button', {
      class: 'chip', type: 'button', role: 'option',
      onclick: () => { pickZ(e.z); clear(results); searchIn.value = ''; },
    }, `${e.s} · ${L({ en: e.en, de: e.de })}`));
  });
  searchIn.addEventListener('keydown', (ev) => {
    if ((ev as KeyboardEvent).key === 'Enter') { const r = search(searchIn.value)[0]; if (r) { pickZ(r.z); clear(results); searchIn.value = ''; } }
  });

  const updateButtons = () => {
    zoomBtn.textContent = zoomed ? L({ en: 'Fit to screen', de: 'Ganz zeigen' }) : L({ en: 'Zoom in', de: 'Vergrößern' });
    zoomBtn.hidden = view === '3d';
    if (viewBtn) viewBtn.textContent = view === '3d' ? L({ en: 'Flat table', de: 'Flache Tabelle' }) : L({ en: '3D landscape', de: '3D-Landschaft' });
    scroll.classList.toggle('zoomed', zoomed);
    scroll.classList.toggle('fit', !zoomed);
  };
  zoomBtn.addEventListener('click', () => { zoomed = !zoomed; updateButtons(); if (zoomed && selected) select(selected); });
  const setView = (v: '2d' | '3d') => {
    view = v;
    scroll.hidden = v === '3d';
    stage3d.hidden = v === '2d';
    if (v === '3d' && !land) {
      land = new TableLandscape(stage3d, (z) => pickZ(z));
      land.setOverlay(overlayById(overlay), met);
      if (selected) land.select(selected);
    }
    updateButtons();
    opts.onView?.(v);
  };
  viewBtn?.addEventListener('click', () => setView(view === '3d' ? '2d' : '3d'));

  drawChips();
  paint();
  if (!opts.pick) drawCard();
  setView(view);
  if (selected) select(selected);

  return {
    el,
    select,
    setOverlay: (o) => setOverlay(o),
    dispose: () => { land?.dispose(); land = null; },
  };
}

/** Open the table as a full-screen sheet over the current screen (keeps the unit where it was). */
export function openTable(opts: TableOptions = {}) {
  const prevFocus = document.activeElement as HTMLElement | null;
  const table = createTable({ allow3d: true, ...opts });
  const close = () => { table.dispose(); sheet.remove(); document.removeEventListener('keydown', esc); document.body.classList.remove('sheet-open'); prevFocus?.focus?.(); };
  const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
  const sheet = h('div', { class: 'pt-sheet', role: 'dialog', 'aria-modal': 'true', 'aria-label': L({ en: 'Periodic table', de: 'Periodensystem' }) },
    h('div', { class: 'pt-sheet-inner' },
      h('div', { class: 'topbar' }, h('h2', null, L({ en: 'Periodic table', de: 'Periodensystem' })),
        h('button', { class: 'btn small', type: 'button', onclick: close }, L({ en: 'Back to the lesson', de: 'Zurück zur Lektion' }))),
      table.el));
  document.body.append(sheet);
  document.body.classList.add('sheet-open');
  document.addEventListener('keydown', esc);
  (sheet.querySelector('.chip[aria-pressed="true"]') as HTMLElement | null)?.focus();
  return close;
}

/** Small icon of the table, for buttons. */
export function tableIcon(): SVGElement {
  const svg = s('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 1.7, 'stroke-linejoin': 'round', 'aria-hidden': 'true' });
  svg.append(s('path', { d: 'M3 5h4v4H3zM17 5h4v4h-4zM3 9h4v4H3zM7 11h3v2H7zM10 11h4v2h-4zM14 11h3v2h-3zM17 9h4v4h-4zM3 13h18v4H3zM6 19h12' }));
  return svg;
}
