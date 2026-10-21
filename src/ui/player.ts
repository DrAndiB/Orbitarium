// The unit player: one unit, seven steps, the same 20-minute loop every time.
// Unit content and step logic live in src/units/; this file is the shell around them.
import { h, s, clear, rich, toast } from './dom';
import { L, t, num, type Bi } from '../i18n';
import { unitByN, allConcepts } from '../content/curriculum';
import { getState, save, today } from '../model/store';
import { markSeen, logSession, recall, pickRekindle, daysSinceLastSession, finishUnit, finishSecondPass } from '../model/learner';
import { itemRun } from './questions';
import { WorkbenchUI } from '../sim/workbenchUI';
import { AtomUI } from '../sim/orbitalsUI';
import { LatticeUI } from '../sim/latticeUI';
import { BondUI } from '../sim/bondUI';
import { createTable, openTable, tableIcon } from './ptable';
import { go } from '../router';
import { onLeave } from './lifecycle';
import { scheduleNudges } from '../platform';
import { unit0 } from '../units/u00';
import { unit6 } from '../units/u06';
import { unit1 } from '../units/u01';
import { unit2 } from '../units/u02';
import { unit3 } from '../units/u03';
import { unit4 } from '../units/u04';
import { unit5 } from '../units/u05';
import type { StepCtx, UnitPlayer } from '../units/types';

const PLAYERS: Record<number, UnitPlayer> = { 0: unit0, 1: unit1, 2: unit2, 3: unit3, 4: unit4, 5: unit5, 6: unit6 };
const STEPS = ['stepWarmup', 'stepPuzzle', 'stepExplore', 'stepPredict', 'stepExamples', 'stepExplain', 'stepWrap'];
/** Typical minutes per step, for the "minutes left" line. Exploring varies most. */
const MINUTES = [3, 3, 7, 4, 5, 4, 1];

const closeIcon = () => {
  const svg = s('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2, 'stroke-linecap': 'round' });
  svg.appendChild(s('path', { d: 'M6 6l12 12M18 6L6 18' }));
  return svg;
};

function header(unit: number, step: number, title: Bi): HTMLElement {
  const dots = h('div', { class: 'steps', 'aria-hidden': 'true' });
  STEPS.forEach((_, i) => {
    if (i) dots.appendChild(h('span', { class: 'seg' + (i <= step ? ' done' : '') }));
    dots.appendChild(h('span', { class: 'dot' + (i < step ? ' done' : i === step ? ' now' : '') }));
  });
  return h('header', null,
    h('div', { class: 'topbar' },
      h('div', { style: 'min-width:0' }, h('div', { class: 'muted small' }, `${L({ en: 'Unit', de: 'Einheit' })} ${unit}`), h('div', { class: 'title' }, rich(title))),
      h('div', { class: 'topbar-actions' },
        h('button', { class: 'icon-btn', type: 'button', 'aria-label': L({ en: 'Open the periodic table', de: 'Periodensystem öffnen' }), onclick: () => openTable() }, tableIcon()),
        h('button', { class: 'icon-btn', type: 'button', 'aria-label': L({ en: 'Leave the unit (progress is kept)', de: 'Einheit verlassen (Fortschritt bleibt)' }), onclick: () => go('#/') }, closeIcon()))),
    dots,
    h('p', { class: 'step-name' }, h('strong', null, t(STEPS[step])), ` · ${L({ en: 'step', de: 'Schritt' })} ${step + 1} ${L({ en: 'of', de: 'von' })} 7`,
      h('span', { class: 'time-left' }, ` · ${L({ en: `about ${MINUTES.slice(step).reduce((a, b) => a + b, 0)} min left, saved after every step`, de: `noch etwa ${MINUTES.slice(step).reduce((a, b) => a + b, 0)} Min., gespeichert nach jedem Schritt` })}`)));
}

export function renderPlayer(root: HTMLElement, unit: number) {
  const player = PLAYERS[unit];
  if (!player) { root.append(h('p', null, t('notBuilt', { p: unitByN(unit)?.phase ?? 1 }))); return; }
  const st = getState();
  const prog = st.units[unit] ?? { status: 'not-started' };
  st.units[unit] = prog.status === 'done' ? { ...prog, step: prog.step ?? 0 } : { ...prog, status: 'in-progress', step: prog.step ?? 0 };
  if (st.units[unit].step === undefined || st.units[unit].step! >= STEPS.length) st.units[unit].step = 0;
  save();
  markSeen(unitByN(unit).concepts.map((c) => c.id));
  document.body.classList.add('player');
  onLeave(() => { document.body.classList.remove('player'); cleanup(); });
  showStep(root, player, st.units[unit].step!);
}

function setStep(unit: number, n: number) { const st = getState(); st.units[unit] = { ...st.units[unit], step: n }; save(); }

// Workbenches and tables created by a step are disposed when the step changes.
let disposers: (() => void)[] = [];
function cleanup() { disposers.forEach((f) => f()); disposers = []; }

function showStep(root: HTMLElement, player: UnitPlayer, step: number) {
  cleanup();
  clear(root);
  setStep(player.n, step);
  window.scrollTo({ top: 0 });
  root.append(header(player.n, step, player.title));
  const body = h('div', { class: 'stack' });
  root.append(body);
  const cta = h('button', { class: 'btn block', type: 'button' }, step === STEPS.length - 1 ? t('finish') : t('continue'));
  const ctaWrap = h('div', { class: 'sticky-cta', hidden: true }, cta);
  const enable = () => { ctaWrap.hidden = false; };
  cta.addEventListener('click', () => { if (step === STEPS.length - 1) finish(player.n); else showStep(root, player, step + 1); });
  const ctx: StepCtx = {
    unit: player.n,
    workbench: (opts) => { const ui = new WorkbenchUI(opts); disposers.push(() => ui.dispose()); return ui; },
    table: (opts) => { const tb = createTable(opts); disposers.push(() => tb.dispose()); return tb; },
    atom: (opts) => { const ui = new AtomUI(opts); disposers.push(() => ui.dispose()); return ui; },
    lattice: (opts) => { const ui = new LatticeUI(opts); disposers.push(() => ui.dispose()); return ui; },
    bond: (opts) => { const ui = new BondUI(opts); disposers.push(() => ui.dispose()); return ui; },
  };
  player.steps[step](body, enable, ctx);
  root.append(ctaWrap);
}

function finish(unit: number) {
  const st = getState();
  const { secondPass } = finishUnit(unit);
  if (secondPass) toast(L({ en: 'Not everything landed this time. A short second pass is waiting for your next session.', de: 'Diesmal ist nicht alles angekommen. Eine kurze zweite Runde wartet auf deine nächste Sitzung.' }));
  scheduleNudges(st.settings, today(), st.settings.lang);
  cleanup();
  go('#/?lit=' + unit);
}

// ---------- rekindle: a short session on fading concepts, or a second pass on one unit ----------
export function renderRekindle(root: HTMLElement, params: URLSearchParams) {
  const unitParam = params.get('unit');
  const unit = unitParam !== null && unitParam !== '' ? Number(unitParam) : undefined;
  const second = params.get('second') === '1' && unit !== undefined;
  const items = pickRekindle(undefined, unit);
  const before = new Map(items.flatMap((i) => i.concepts).map((c) => [c, recall(c)]));
  root.append(h('div', { class: 'topbar' }, h('div', { class: 'title' }, second ? L({ en: `Second pass: unit ${unit}`, de: `Zweite Runde: Einheit ${unit}` }) : L({ en: 'Rekindle', de: 'Auffrischen' })),
    h('button', { class: 'icon-btn', type: 'button', 'aria-label': t('close'), onclick: () => go('#/') }, closeIcon())));
  root.append(h('p', { class: 'muted' }, second
    ? L({ en: `${items.length} questions on unit ${unit}, the parts that did not land last time. New variants, not the same questions again.`, de: `${items.length} Fragen zu Einheit ${unit}, zu dem, was letztes Mal nicht angekommen ist. Neue Varianten, nicht dieselben Fragen noch einmal.` })
    : L({ en: `${items.length} questions on the concepts that are fading fastest. Each answer resets the memory clock.`, de: `${items.length} Fragen zu den Konzepten, die am schnellsten verblassen. Jede Antwort stellt die Erinnerungsuhr neu.` })));
  if (!items.length) { root.append(h('p', null, t('dueNone'))); if (second) finishSecondPass(unit!); return; }
  root.append(itemRun(items, () => {
    const gapBefore = daysSinceLastSession();
    if (second) finishSecondPass(unit!); else logSession('rekindle');
    scheduleNudges(getState().settings, today(), getState().settings.lang);
    const names = new Map(allConcepts().map((c) => [c.id, c.name]));
    const rows = [...before.entries()].map(([c, r0]) => h('li', null, h('span', null, rich(names.get(c) ?? c)), h('span', { class: 'up' }, `${Math.round(r0 * 100)} % → ${Math.round(recall(c) * 100)} %`)));
    root.append(h('div', { class: 'panel' }, h('h3', null, t('summary')), h('ul', { class: 'summary-list' }, rows),
      gapBefore !== null && gapBefore > 0 ? h('p', { class: 'muted small', style: 'margin-top:10px' }, L({ en: `Memory today, before and after. ${num(gapBefore, 0)} days since your previous session.`, de: `Erinnerung heute, vorher und nachher. ${num(gapBefore, 0)} Tage seit deiner letzten Sitzung.` })) : null),
      h('button', { class: 'btn block', type: 'button', style: 'margin-top:14px', onclick: () => go('#/') }, L({ en: 'Back to the sky', de: 'Zurück zum Himmel' })));
  }, { showUnit: true, review: true }));
}
