// Unit 6 — Lone pairs and shape: the seven steps on the Molecule Workbench.
import { h, s, rich, chem } from '../ui/dom';
import { L, t } from '../i18n';
import { UNIT6 } from '../content/unit06';
import { pickWarmup, recordAnswer, confidentToday } from '../model/learner';
import { itemRun, renderItem, formatLabel } from '../ui/questions';
import { explainStep, wrapStep, taskList, extraExample, deeperPanel } from '../ui/steps';
import type { StepCtx, UnitPlayer } from './types';

// ---------- step 1: warm-up ----------
function warmup(body: HTMLElement, enable: () => void, ctx: StepCtx) {
  const items = pickWarmup(undefined, 6);
  body.append(h('p', { class: 'lead' }, rich(UNIT6.lead)), h('p', { class: 'muted' }, t('warmupIntro')));
  body.append(itemRun(items, () => enable(), { showUnit: true, review: true }));
}

// ---------- step 2: puzzle ----------
function puzzle(body: HTMLElement, enable: () => void, ctx: StepCtx) {
  const P = UNIT6.puzzle;
  const table = h('table', { class: 'data-table' },
    h('thead', null, h('tr', null, h('th', null, L({ en: 'Molecule', de: 'Molekül' })), h('th', null, L({ en: 'Bonds', de: 'Bindungen' })), h('th', { style: 'text-align:right' }, L({ en: 'Measured angle', de: 'Gemessener Winkel' })))),
    h('tbody', null, P.rows.map((r) => h('tr', { class: r.f === 'NH3' ? 'mystery' : '' }, h('td', null, chem(r.f)), h('td', null, String(r.bonds)), h('td', { class: 'num' }, L({ en: r.angle, de: r.angle.replace('.', ',') }))))));
  body.append(h('h2', null, L({ en: 'Why isn\'t ammonia flat?', de: 'Warum ist Ammoniak nicht flach?' })), h('p', null, rich(P.lead)),
    h('div', { class: 'data-card' }, table), h('p', { class: 'lead' }, rich(P.clash)));
  body.append(renderItem(P.question, () => { body.append(h('p', { class: 'muted' }, L({ en: 'Next: see it in 3D.', de: 'Als Nächstes: in 3D ansehen.' }))); enable(); }));
}

// ---------- step 3: explore ----------
function explore(body: HTMLElement, enable: () => void, ctx: StepCtx) {
  const E = UNIT6.explore;
  // The fold-out on atom size waits until step 5: it would give away the PCl3 prediction.
  const ui = ctx.workbench({ presets: ['CH4', 'NH3', 'H2O', 'NH4', 'CO2', 'BF3'], start: 'NH3', controls: { builder: true, leavesOut: false } });
  const family = new Set<string>();
  const polar = new Set<string>();
  let builtScored = false;
  const lambdaNote = h('div');
  const rankBox = h('div');
  const tasks = taskList(E.tasks, () => { rankBox.append(renderItem(E.rank, () => enable())); });
  const countSeen = new Set<string>();
  const mark = (id: string) => {
    if (!tasks.mark(id)) return;
    if (id === 'lambda') lambdaNote.replaceChildren(h('p', { class: 'muted small' }, rich(E.lambdaNote)));
    if (id === 'count') lambdaNote.replaceChildren(h('p', { class: 'muted small' }, rich(E.countNote)));
  };
  ui.on('toggle', (what: string, v: boolean) => {
    if (what === 'ignore' && v && ui.wb.current.lonePairs > 0) setTimeout(() => mark('wrong'), 1200);
  });
  ui.on('settled', () => {
    const sp = ui.wb.current;
    if (['CH4', 'NH3', 'H2O'].includes(sp.id)) { family.add(sp.id); if (family.size === 3) mark('family'); }
    if (['CO2', 'BF3'].includes(sp.id)) { countSeen.add(sp.id); if (countSeen.size === 2) mark('count'); }
    if (ui.wb.ignoreLonePairs && sp.lonePairs > 0) mark('wrong');
    if (ui.wb.lambda <= 1.05 && sp.lonePairs > 0) mark('lambda');
    if (ui.wb.showDipole && ['H2O', 'CO2'].includes(sp.id)) { polar.add(sp.id); if (polar.size === 2) mark('polar'); }
    if (sp.id === 'custom' || ui.lastBuilt === sp) {
      if (ui.wb.hasPolarBonds() && !ui.wb.isPolar()) {
        mark('build');
        if (!builtScored) { builtScored = true; recordAnswer({ item: 'u6-build', concepts: ['u6.symmetry'], correct: true, evidence: 'transfer', targets: ['polar-bonds-polar-molecule'] }); }
      }
    }
  });
  body.append(h('h2', null, L({ en: 'The Molecule Workbench', de: 'Die Molekül-Werkbank' })),
    h('p', { class: 'muted' }, rich(E.intro)),
    ui.el,
    h('div', { class: 'panel' }, h('h3', { style: 'margin-bottom:6px' }, L({ en: 'Things to try', de: 'Zum Ausprobieren' })), tasks.el, lambdaNote),
    rankBox);
}

// ---------- step 4: predict ----------
function predict(body: HTMLElement, enable: () => void, ctx: StepCtx) {
  const ui = ctx.workbench({ presets: [], start: 'CH4', compact: true, controls: { wrongModel: false, lambda: false, leavesOut: false } });
  const stage = h('div', { class: 'reveal', hidden: true }, ui.el);
  const revealText = h('div');
  body.append(h('h2', null, t('stepPredict')), h('p', { class: 'muted' }, t('predictIntro')));
  const run = (i: number) => {
    const p = UNIT6.predictions[i];
    if (!p) { enable(); return; }
    const box = h('div', { class: 'stack' });
    body.append(box);
    box.append(renderItem(p.item, (r) => {
      // A missed prediction gets one more worked example before the reveal.
      const extra = r.correct ? null : extraExample(p.extra);
      if (extra) box.append(extra);
      stage.hidden = false;
      ui.load(p.reveal);
      ui.wb.setShowDipole(!!p.dipole);
      const dipoleBox = ui.el.querySelector('input[data-key="dipole"]') as HTMLInputElement | null;
      if (dipoleBox) dipoleBox.checked = !!p.dipole;
      revealText.replaceChildren(h('p', { class: 'muted' }, rich(p.revealText)));
      box.append(stage, revealText);
      const next = h('button', { class: 'btn quiet block', type: 'button' }, i + 1 < UNIT6.predictions.length ? L({ en: 'Next prediction', de: 'Nächste Vorhersage' }) : L({ en: 'Done predicting', de: 'Vorhersagen abgeschlossen' }));
      next.addEventListener('click', () => { next.remove(); run(i + 1); });
      box.append(next);
      (extra ?? stage).scrollIntoView({ behavior: 'smooth', block: extra ? 'start' : 'center' });
    }, { fold: true }));
  };
  run(0);
}

// ---------- step 5: worked examples, draw-on-it, spot the flaw ----------
function examples(body: HTMLElement, enable: () => void, ctx: StepCtx) {
  const ui = ctx.workbench({ presets: [], start: 'H2O', compact: true, controls: { wrongModel: false, lambda: false, leavesOut: true } });
  body.append(h('h2', null, t('stepExamples')), ui.el);
  for (const ex of UNIT6.examples) {
    body.append(h('article', { class: 'panel example' },
      h('h3', null, L(ex.title), ' ', h('span', { class: 'muted small' }, chem(ex.preset === 'NH4' ? 'NH4+' : ex.preset))),
      h('div', { class: 'numbers' }, ex.numbers.map((n) => h('span', null, h('b', null, L({ en: n.v, de: n.v.replace('.', ',') })), L(n.label)))),
      h('p', { style: 'margin:0' }, rich(ex.body)),
      h('p', { class: 'muted', style: 'margin:0' }, rich(ex.soWhat)),
      h('button', { class: 'btn small quiet', type: 'button', onclick: () => { ui.load(ex.preset); ui.el.scrollIntoView({ behavior: 'smooth', block: 'center' }); } }, t('showIn3d'))));
  }
  let answered = 0;
  const tick = () => {
    if (++answered !== 2) return;
    if (confidentToday(UNIT6.predictions.map((p) => p.item.id))) body.append(deeperPanel(UNIT6.deeper));
    enable();
  };
  body.append(h('div', { class: 'panel' }, drawDipole(tick)));
  body.append(h('div', { class: 'panel' }, renderItem(UNIT6.flaw, () => {
    body.append(h('button', { class: 'btn small quiet', type: 'button', onclick: () => { ui.load('CH2O'); ui.el.scrollIntoView({ behavior: 'smooth', block: 'center' }); } }, L({ en: 'Show formaldehyde in 3D', de: 'Formaldehyd in 3D zeigen' })));
    tick();
  })));
}

/** Draw-on-it: rotate an arrow on a water molecule until it points at the negative end. */
function drawDipole(onDone: () => void): HTMLElement {
  const W = 340, H = 300, cx = 170, cy = 150;
  let angle = 30; // degrees, 0 = right, −90 = up
  const svg = s('svg', { class: 'dial', viewBox: `0 0 ${W} ${H}`, role: 'slider', tabindex: 0, 'aria-valuemin': 0, 'aria-valuemax': 359, 'aria-label': L({ en: 'Dipole arrow direction', de: 'Richtung des Dipolpfeils' }) }) as SVGSVGElement;
  svg.appendChild(s('circle', { cx, cy, r: 118, fill: 'none', stroke: '#2e3a69', 'stroke-dasharray': '3 6' }));
  // water: O top, H bottom-left/right, lone pairs above O
  const O = [cx, cy - 22], H1 = [cx - 62, cy + 40], H2 = [cx + 62, cy + 40];
  svg.append(
    s('line', { x1: O[0], y1: O[1], x2: H1[0], y2: H1[1], stroke: '#cfc8b6', 'stroke-width': 6 }),
    s('line', { x1: O[0], y1: O[1], x2: H2[0], y2: H2[1], stroke: '#cfc8b6', 'stroke-width': 6 }),
    s('ellipse', { cx: cx - 22, cy: cy - 70, rx: 14, ry: 24, fill: '#b48cff', opacity: 0.35, transform: `rotate(-25 ${cx - 22} ${cy - 70})` }),
    s('ellipse', { cx: cx + 22, cy: cy - 70, rx: 14, ry: 24, fill: '#b48cff', opacity: 0.35, transform: `rotate(25 ${cx + 22} ${cy - 70})` }),
    s('circle', { cx: O[0], cy: O[1], r: 30, fill: '#d2bfa6' }), s('text', { x: O[0], y: O[1] + 8, 'text-anchor': 'middle', 'font-size': 22, 'font-weight': 700, fill: '#121a33' }, 'O'),
    s('circle', { cx: H1[0], cy: H1[1], r: 20, fill: '#e9e3d3' }), s('text', { x: H1[0], y: H1[1] + 7, 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 700, fill: '#121a33' }, 'H'),
    s('circle', { cx: H2[0], cy: H2[1], r: 20, fill: '#e9e3d3' }), s('text', { x: H2[0], y: H2[1] + 7, 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 700, fill: '#121a33' }, 'H'),
  );
  const arrow = s('g');
  arrow.append(s('line', { x1: -95, y1: 0, x2: 88, y2: 0, stroke: '#5aa9ff', 'stroke-width': 5, 'stroke-linecap': 'round' }),
    s('path', { d: 'M108 0 L84 -12 L84 12 Z', fill: '#5aa9ff' }),
    s('line', { x1: -80, y1: -12, x2: -80, y2: 12, stroke: '#ff6b6b', 'stroke-width': 4, 'stroke-linecap': 'round' }),
    s('circle', { cx: 112, cy: 0, r: 16, fill: 'transparent' }));
  svg.appendChild(arrow);
  const setA = (a: number) => { angle = ((a % 360) + 360) % 360; arrow.setAttribute('transform', `translate(${cx} ${cy}) rotate(${angle})`); svg.setAttribute('aria-valuenow', String(Math.round(angle))); };
  setA(angle);
  let locked = false;
  const fromEvent = (e: PointerEvent) => {
    const r = svg.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * W - cx, y = ((e.clientY - r.top) / r.height) * H - cy;
    setA((Math.atan2(y, x) * 180) / Math.PI);
  };
  let dragging = false;
  svg.addEventListener('pointerdown', (e) => { if (locked) return; dragging = true; svg.setPointerCapture(e.pointerId); fromEvent(e); });
  svg.addEventListener('pointermove', (e) => { if (dragging && !locked) fromEvent(e); });
  svg.addEventListener('pointerup', () => { dragging = false; });
  svg.addEventListener('keydown', (e) => { if (locked) return; if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') setA(angle - 5); if (e.key === 'ArrowRight' || e.key === 'ArrowUp') setA(angle + 5); });
  const fb = h('div');
  const check = h('button', { class: 'btn block', type: 'button' }, t('check'));
  check.addEventListener('click', () => {
    locked = true;
    const diff = Math.abs(((angle - 270 + 540) % 360) - 180); // 270° = straight up
    const correct = diff <= 25;
    check.remove();
    if (!correct) { arrow.setAttribute('opacity', '0.4'); const ghost = arrow.cloneNode(true) as SVGGElement; ghost.setAttribute('transform', `translate(${cx} ${cy}) rotate(270)`); ghost.setAttribute('opacity', '1'); svg.appendChild(ghost); }
    fb.append(h('div', { class: 'feedback' + (correct ? '' : ' miss') }, h('strong', { class: 'verdict' }, correct ? t('correct') : t('wrong')), h('div', null, rich(correct ? UNIT6.draw.right : UNIT6.draw.wrong))));
    recordAnswer({ item: 'u6-draw', concepts: ['u6.symmetry', 'u6.lp-count'], correct, evidence: 'explain' });
    onDone();
  });
  return h('div', { class: 'q' }, formatLabel('draw'), h('p', { class: 'q-prompt' }, rich(UNIT6.draw.prompt)), svg, check, fb);
}

// ---------- step 6: explain back ----------
function explainBack(body: HTMLElement, enable: () => void) {
  explainStep(body, enable, 6, UNIT6.explain);
}

// ---------- step 7: wrap-up ----------
function wrap(body: HTMLElement, enable: () => void) {
  wrapStep(body, enable, 6, UNIT6.terms, UNIT6.readings);
}

export const unit6: UnitPlayer = { n: 6, title: UNIT6.title, steps: [warmup, puzzle, explore, predict, examples, explainBack, wrap] };
