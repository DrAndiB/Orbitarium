// The unit player: one unit, seven steps, the same 20-minute loop every time.
import { h, s, clear, rich, chem, toast } from './dom';
import { L, t, dateStr, num, type Bi } from '../i18n';
import { UNIT6 } from '../content/unit06';
import { GLOSSARY } from '../content/glossary';
import { unitByN, allConcepts } from '../content/curriculum';
import { getState, save, today } from '../model/store';
import { pickWarmup, recordAnswer, markSeen, logSession, recall, nextReview, conceptState, pickRekindle, daysSinceLastSession } from '../model/learner';
import { itemRun, renderItem, formatLabel, confidenceSlider } from './questions';
import { WorkbenchUI } from '../sim/workbenchUI';
import { go } from '../router';
import { onLeave } from './lifecycle';
import { buzz, scheduleNudges } from '../platform';

const STEPS = ['stepWarmup', 'stepPuzzle', 'stepExplore', 'stepPredict', 'stepExamples', 'stepExplain', 'stepWrap'];

const closeIcon = () => {
  const svg = s('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2, 'stroke-linecap': 'round' });
  svg.appendChild(s('path', { d: 'M6 6l12 12M18 6L6 18' }));
  return svg;
};

function header(step: number, title: Bi): HTMLElement {
  const dots = h('div', { class: 'steps', 'aria-hidden': 'true' });
  STEPS.forEach((_, i) => {
    if (i) dots.appendChild(h('span', { class: 'seg' + (i <= step ? ' done' : '') }));
    dots.appendChild(h('span', { class: 'dot' + (i < step ? ' done' : i === step ? ' now' : '') }));
  });
  return h('header', null,
    h('div', { class: 'topbar' },
      h('div', null, h('div', { class: 'muted small' }, `${L({ en: 'Unit', de: 'Einheit' })} 6`), h('div', { class: 'title' }, L(title))),
      h('button', { class: 'icon-btn', type: 'button', 'aria-label': L({ en: 'Leave the unit (progress is kept)', de: 'Einheit verlassen (Fortschritt bleibt)' }), onclick: () => go('#/') }, closeIcon())),
    dots,
    h('p', { class: 'step-name' }, h('strong', null, t(STEPS[step])), ` · ${L({ en: 'step', de: 'Schritt' })} ${step + 1} ${L({ en: 'of', de: 'von' })} 7`));
}

export function renderPlayer(root: HTMLElement, unit: number) {
  if (unit !== 6) { root.append(h('p', null, t('notBuilt', { p: unitByN(unit)?.phase ?? 1 }))); return; }
  const st = getState();
  const prog = st.units[6] ?? { status: 'not-started' };
  if (prog.status !== 'done') st.units[6] = { ...prog, status: 'in-progress', step: prog.step ?? 0 };
  else st.units[6] = { ...prog, step: prog.step ?? 0 };
  if (st.units[6].step === undefined || st.units[6].step! >= STEPS.length) st.units[6].step = 0;
  save();
  markSeen(unitByN(6).concepts.map((c) => c.id));
  document.body.classList.add('player');
  onLeave(() => { document.body.classList.remove('player'); cleanup(); });
  showStep(root, st.units[6].step!);
}

function setStep(n: number) { const st = getState(); st.units[6] = { ...st.units[6], step: n }; save(); }

function showStep(root: HTMLElement, step: number) {
  cleanup();
  clear(root);
  setStep(step);
  window.scrollTo({ top: 0 });
  root.append(header(step, UNIT6.title));
  const body = h('div', { class: 'stack' });
  root.append(body);
  const cta = h('button', { class: 'btn block', type: 'button' }, step === STEPS.length - 1 ? t('finish') : t('continue'));
  const ctaWrap = h('div', { class: 'sticky-cta', hidden: true }, cta);
  const enable = () => { ctaWrap.hidden = false; };
  cta.addEventListener('click', () => { if (step === STEPS.length - 1) finish(); else showStep(root, step + 1); });
  [warmup, puzzle, explore, predict, examples, explainBack, wrap][step](body, enable);
  root.append(ctaWrap);
}

// Workbenches created by a step are disposed when the step changes.
let disposers: (() => void)[] = [];
function cleanup() { disposers.forEach((f) => f()); disposers = []; }
function workbench(opts: ConstructorParameters<typeof WorkbenchUI>[0]) {
  const ui = new WorkbenchUI(opts);
  disposers.push(() => ui.dispose());
  return ui;
}

// ---------- step 1: warm-up ----------
function warmup(body: HTMLElement, enable: () => void) {
  const items = pickWarmup(3, 6);
  body.append(h('p', { class: 'lead' }, rich(UNIT6.lead)), h('p', { class: 'muted' }, t('warmupIntro')));
  body.append(itemRun(items, () => enable(), { showUnit: true }));
}

// ---------- step 2: puzzle ----------
function puzzle(body: HTMLElement, enable: () => void) {
  const P = UNIT6.puzzle;
  const table = h('table', { class: 'data-table' },
    h('thead', null, h('tr', null, h('th', null, L({ en: 'Molecule', de: 'Molekül' })), h('th', null, L({ en: 'Bonds', de: 'Bindungen' })), h('th', { style: 'text-align:right' }, L({ en: 'Measured angle', de: 'Gemessener Winkel' })))),
    h('tbody', null, P.rows.map((r) => h('tr', { class: r.f === 'NH3' ? 'mystery' : '' }, h('td', null, chem(r.f)), h('td', null, String(r.bonds)), h('td', { class: 'num' }, L({ en: r.angle, de: r.angle.replace('.', ',') }))))));
  body.append(h('h2', null, L({ en: 'Why isn\'t ammonia flat?', de: 'Warum ist Ammoniak nicht flach?' })), h('p', null, rich(P.lead)),
    h('div', { class: 'data-card' }, table), h('p', { class: 'lead' }, rich(P.clash)));
  body.append(renderItem(P.question, () => { body.append(h('p', { class: 'muted' }, L({ en: 'Next: see it in 3D.', de: 'Als Nächstes: in 3D ansehen.' }))); enable(); }));
}

// ---------- step 3: explore ----------
function explore(body: HTMLElement, enable: () => void) {
  const E = UNIT6.explore;
  const ui = workbench({ presets: ['CH4', 'NH3', 'H2O', 'NH4', 'CO2', 'BF3'], start: 'NH3', controls: { builder: true } });
  const done = new Set<string>();
  const family = new Set<string>();
  const polar = new Set<string>();
  let builtScored = false;
  const taskEls = new Map<string, HTMLElement>();
  const list = h('ul', { class: 'tasks' }, E.tasks.map((tk) => {
    const li = h('li', null, h('span', { class: 'tick', 'aria-hidden': 'true' }, '✓'), h('span', null, rich(tk.text)));
    taskEls.set(tk.id, li);
    return li;
  }));
  const lambdaNote = h('div');
  const rankBox = h('div');
  const mark = (id: string) => {
    if (done.has(id)) return;
    done.add(id);
    taskEls.get(id)!.classList.add('done');
    taskEls.get(id)!.setAttribute('aria-label', L({ en: 'done', de: 'erledigt' }));
    buzz('light');
    if (id === 'lambda') lambdaNote.replaceChildren(h('p', { class: 'muted small' }, rich(E.lambdaNote)));
    if ([...done].filter((d) => d !== 'build').length + (done.has('build') ? 1 : 0) >= 3 && !rankBox.childElementCount) {
      rankBox.append(renderItem(E.rank, () => enable()));
    }
  };
  ui.on('toggle', (what: string, v: boolean) => {
    if (what === 'ignore' && v && ui.wb.current.lonePairs > 0) setTimeout(() => mark('wrong'), 1200);
  });
  ui.on('settled', () => {
    const sp = ui.wb.current;
    if (['CH4', 'NH3', 'H2O'].includes(sp.id)) { family.add(sp.id); if (family.size === 3) mark('family'); }
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
    h('p', { class: 'muted' }, L({ en: 'Every pair of electrons pushes on every other. Nothing here is drawn by hand: the shape is wherever the pushing settles.', de: 'Jedes Elektronenpaar drückt auf jedes andere. Nichts hier ist von Hand gezeichnet: Die Gestalt ist dort, wo das Drücken zur Ruhe kommt.' })),
    ui.el,
    h('div', { class: 'panel' }, h('h3', { style: 'margin-bottom:6px' }, L({ en: 'Things to try', de: 'Zum Ausprobieren' })), h('p', { class: 'muted small' }, t('exploreIntro')), list, lambdaNote),
    rankBox);
}

// ---------- step 4: predict ----------
function predict(body: HTMLElement, enable: () => void) {
  const ui = workbench({ presets: [], start: 'CH4', compact: true, controls: { wrongModel: false, lambda: false, leavesOut: false } });
  const stage = h('div', { class: 'reveal', hidden: true }, ui.el);
  const revealText = h('div');
  body.append(h('h2', null, t('stepPredict')), h('p', { class: 'muted' }, t('predictIntro')));
  const run = (i: number) => {
    const p = UNIT6.predictions[i];
    if (!p) { enable(); return; }
    const box = h('div', { class: 'stack' });
    body.append(box);
    box.append(renderItem(p.item, () => {
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
      stage.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }));
  };
  run(0);
}

// ---------- step 5: worked examples, draw-on-it, spot the flaw ----------
function examples(body: HTMLElement, enable: () => void) {
  const ui = workbench({ presets: [], start: 'H2O', compact: true, controls: { wrongModel: false, lambda: false, leavesOut: false } });
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
  const tick = () => { if (++answered === 2) enable(); };
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
  const X = UNIT6.explain;
  const st = getState();
  const prev = [...st.takeaways].reverse().find((tk) => tk.unit === 6);
  const ta = h('textarea', { placeholder: t('explainPlaceholder'), 'aria-label': t('explainPrompt') }) as HTMLTextAreaElement;
  const ideasList = h('ul', { class: 'ideas', 'aria-live': 'polite' }, X.ideas.map((i) => h('li', { 'data-id': i.id }, rich(i.idea))));
  const result = h('div', { class: 'stack' });
  const conf = confidenceSlider();
  const check = h('button', { class: 'btn block', type: 'button', disabled: true }, t('explainCheck'));
  ta.addEventListener('input', () => { check.disabled = ta.value.trim().length < 20; });
  let tries = 0;
  check.addEventListener('click', () => {
    tries++;
    const text = ta.value;
    const hits = X.ideas.filter((i) => i.en.test(text) || i.de.test(text));
    ideasList.querySelectorAll('li').forEach((li) => li.classList.toggle('hit', hits.some((x) => x.id === (li as HTMLElement).dataset.id)));
    const good = hits.length >= 3;
    result.replaceChildren(
      h('div', { class: 'feedback' + (good ? '' : ' part') }, h('strong', { class: 'verdict' }, good
        ? L({ en: `You covered ${hits.length} of ${X.ideas.length} key ideas.`, de: `Du hast ${hits.length} von ${X.ideas.length} Kernideen getroffen.` })
        : L({ en: `${hits.length} of ${X.ideas.length} key ideas so far. The open circles show what is missing.`, de: `Bisher ${hits.length} von ${X.ideas.length} Kernideen. Die offenen Kreise zeigen, was fehlt.` }))),
      h('h3', null, t('tightened')), h('blockquote', { class: 'quote' }, rich(X.tightened)),
    );
    if (prev) result.append(h('div', null, h('h4', null, `${t('yourLast')} (${dateStr(prev.date)})`), h('blockquote', { class: 'quote', style: 'border-color:var(--fog)' }, prev.text)));
    if (tries === 1 || good) {
      const save$ = h('button', { class: 'btn quiet block', type: 'button' }, t('saveTakeaway'));
      save$.addEventListener('click', () => {
        st.takeaways.push({ unit: 6, date: today(), text: text.trim().replace(/\s+/g, ' '), tightened: L(X.tightened) });
        save(); save$.disabled = true; save$.textContent = t('saved'); toast(t('saved'));
      });
      result.append(save$);
    }
    // Ideas named count as "can explain"; the rest are only seen again.
    const c = conf.value();
    const concepts = [...new Set(hits.map((x) => x.concept))];
    if (concepts.length) recordAnswer({ item: 'u6-explain', concepts, correct: true, conf: c, evidence: 'explain' });
    const missed = [...new Set(X.ideas.filter((i) => !hits.includes(i)).map((i) => i.concept))].filter((x) => !concepts.includes(x));
    if (missed.length) recordAnswer({ item: 'u6-explain-missed', concepts: missed, correct: false, partial: true });
    check.textContent = t('tryAgain');
    enable();
  });
  body.append(h('h2', null, t('stepExplain')), formatLabel('explain'), h('p', { class: 'q-prompt' }, t('explainPrompt')), ta, conf.el, check,
    h('div', null, h('h4', null, t('keyIdeas')), ideasList), result);
}

// ---------- step 7: wrap-up ----------
function wrap(body: HTMLElement, enable: () => void) {
  body.append(h('h2', null, t('stepWrap')));
  body.append(h('div', { class: 'panel' }, termPairs(UNIT6.terms, () => enable())));
  const R = UNIT6.reading;
  body.append(h('div', { class: 'panel reading' }, h('h3', null, t('readTonight')),
    h('p', { style: 'margin:6px 0' }, h('a', { href: R.url, target: '_blank', rel: 'noopener' }, L(R.title)), h('span', { class: 'muted' }, ` · ${R.source}`)),
    h('h4', { style: 'margin-top:10px' }, t('lookFor')),
    h('ol', { style: 'margin:0;padding-left:20px' }, R.lookFor.map((x) => h('li', { style: 'margin-bottom:6px' }, rich(x))))));
  const st = getState();
  const rows = unitByN(6).concepts.filter((c) => st.concepts[c.id]).map((c) => {
    const cs = conceptState(c.id)!;
    const lvlWord = [L({ en: 'unseen', de: 'neu' }), L({ en: 'seen', de: 'gesehen' }), L({ en: 'can predict', de: 'kann vorhersagen' }), L({ en: 'can explain', de: 'kann erklären' }), L({ en: 'can transfer', de: 'kann übertragen' })][cs.level];
    const nr = nextReview(c.id);
    return h('li', null, h('span', null, rich(c.name)), h('span', { class: 'up' }, `${lvlWord} · ${t('nextReview', { d: nr ? dateStr(nr) : '–' })}`));
  });
  body.append(h('div', { class: 'panel' }, h('h3', null, t('summary')), h('ul', { class: 'summary-list' }, rows)));
}

function termPairs(ids: string[], onDone: () => void): HTMLElement {
  const order = [...ids].sort(() => Math.random() - 0.5);
  let picked: string | null = null;
  let matched = 0, misses = 0;
  const left = h('div', { class: 'col' }), right = h('div', { class: 'col' });
  const btnsL = new Map<string, HTMLButtonElement>();
  for (const id of ids) {
    const b = h('button', { class: 'pair-btn', type: 'button', lang: 'en', 'aria-pressed': 'false' }, GLOSSARY[id].en) as HTMLButtonElement;
    b.addEventListener('click', () => { if (b.classList.contains('matched')) return; picked = id; btnsL.forEach((x, k) => x.setAttribute('aria-pressed', String(k === id))); });
    btnsL.set(id, b); left.append(b);
  }
  const status = h('p', { class: 'muted small', 'aria-live': 'polite' });
  for (const id of order) {
    const b = h('button', { class: 'pair-btn', type: 'button', lang: 'de' }, GLOSSARY[id].de) as HTMLButtonElement;
    b.addEventListener('click', () => {
      if (!picked || b.classList.contains('matched')) return;
      if (picked === id) {
        b.classList.add('matched'); btnsL.get(id)!.classList.add('matched'); btnsL.get(id)!.setAttribute('aria-pressed', 'false');
        b.disabled = true; btnsL.get(id)!.disabled = true; picked = null; matched++; buzz('light');
        if (matched === ids.length) {
          status.textContent = misses ? L({ en: `All matched, ${misses} slip${misses === 1 ? '' : 's'} on the way.`, de: `Alle zugeordnet, ${misses} Fehlgriff${misses === 1 ? '' : 'e'} unterwegs.` }) : L({ en: 'All matched, no slips.', de: 'Alle zugeordnet, ohne Fehlgriff.' });
          recordAnswer({ item: 'u6-terms', concepts: [], correct: misses === 0, partial: misses > 0 });
          onDone();
        }
      } else { misses++; b.classList.add('shake'); setTimeout(() => b.classList.remove('shake'), 350); buzz('medium'); }
    });
    right.append(b);
  }
  return h('div', { class: 'q' }, formatLabel('terms'), h('p', { class: 'q-prompt' }, t('termPairs')), h('p', { class: 'muted small' }, t('termPairsHelp')), h('div', { class: 'pairs' }, left, right), status);
}

function finish() {
  const st = getState();
  st.units[6] = { status: 'done', completedAt: st.units[6]?.completedAt && st.units[6].status === 'done' ? st.units[6].completedAt : today(), step: 0 };
  if (!st.units[7] || st.units[7].status === 'not-started') st.units[7] = { status: 'next' };
  save();
  logSession('unit', 6);
  scheduleNudges(st.settings, today(), st.settings.lang);
  cleanup();
  go('#/?lit=6');
}

// ---------- rekindle: a three-question session on fading concepts ----------
export function renderRekindle(root: HTMLElement, params: URLSearchParams) {
  const unit = Number(params.get('unit') || 0) || undefined;
  const items = pickRekindle(3, unit);
  const before = new Map(items.flatMap((i) => i.concepts).map((c) => [c, recall(c)]));
  root.append(h('div', { class: 'topbar' }, h('div', { class: 'title' }, L({ en: 'Rekindle', de: 'Auffrischen' })),
    h('button', { class: 'icon-btn', type: 'button', 'aria-label': t('close'), onclick: () => go('#/') }, closeIcon())));
  root.append(h('p', { class: 'muted' }, L({ en: 'Three questions on the concepts that are fading fastest. Each answer resets the memory clock.', de: 'Drei Fragen zu den Konzepten, die am schnellsten verblassen. Jede Antwort stellt die Erinnerungsuhr neu.' })));
  if (!items.length) { root.append(h('p', null, t('dueNone'))); return; }
  root.append(itemRun(items, () => {
    const gapBefore = daysSinceLastSession();
    logSession('rekindle');
    scheduleNudges(getState().settings, today(), getState().settings.lang);
    const names = new Map(allConcepts().map((c) => [c.id, c.name]));
    const rows = [...before.entries()].map(([c, r0]) => h('li', null, h('span', null, rich(names.get(c) ?? c)), h('span', { class: 'up' }, `${Math.round(r0 * 100)} % → ${Math.round(recall(c) * 100)} %`)));
    root.append(h('div', { class: 'panel' }, h('h3', null, t('summary')), h('ul', { class: 'summary-list' }, rows),
      gapBefore !== null && gapBefore > 0 ? h('p', { class: 'muted small', style: 'margin-top:10px' }, L({ en: `Memory today, before and after. ${num(gapBefore, 0)} days since your previous session.`, de: `Erinnerung heute, vorher und nachher. ${num(gapBefore, 0)} Tage seit deiner letzten Sitzung.` })) : null),
      h('button', { class: 'btn block', type: 'button', style: 'margin-top:14px', onclick: () => go('#/') }, L({ en: 'Back to the sky', de: 'Zurück zum Himmel' })));
  }, { showUnit: true }));
}
