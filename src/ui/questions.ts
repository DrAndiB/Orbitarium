// Question renderers. Each one records its own answer in the learner model and
// calls onDone once the learner has committed.
import { h, rich, clear } from './dom';
import { L, t, num, type Bi } from '../i18n';
import { recordAnswer } from '../model/learner';
import { MISCONCEPTIONS } from '../content/curriculum';
import type { Item, ChoiceItem, RankItem, EstimateItem, FlawItem, Format } from '../content/items';
import { buzz } from '../platform';

export interface Result { correct: boolean; partial?: boolean; }
type Done = (r: Result) => void;

const FORMAT: Record<Format, Bi> = {
  predict: { en: 'Predict and commit', de: 'Vorhersagen und festlegen' },
  rank: { en: 'Rank it', de: 'Ordnen' },
  estimate: { en: 'Estimate', de: 'Schätzen' },
  odd: { en: 'Odd one out', de: 'Was passt nicht?' },
  flaw: { en: 'Spot the flaw', de: 'Finde den Fehler' },
  build: { en: 'Build to spec', de: 'Nach Vorgabe bauen' },
  draw: { en: 'Draw on it', de: 'Einzeichnen' },
  explain: { en: 'Explain back', de: 'Zurückerklären' },
  terms: { en: 'Term pairs', de: 'Begriffspaare' },
};
export const formatLabel = (f: Format, unit?: number) =>
  h('div', { class: 'q-format' }, L(FORMAT[f]) + (unit ? ` · ${L({ en: 'unit', de: 'Einheit' })} ${unit}` : ''));

export function renderItem(item: Item, onDone: Done, opts: { showUnit?: boolean } = {}): HTMLElement {
  switch (item.kind) {
    case 'choice': return renderChoice(item, onDone, opts);
    case 'rank': return renderRank(item, onDone, opts);
    case 'estimate': return renderEstimate(item, onDone, opts);
    case 'flaw': return renderFlaw(item, onDone, opts);
  }
}

function feedback(kind: 'right' | 'miss' | 'part', explain: Bi, mis?: string): HTMLElement {
  const verdict = kind === 'right' ? t('correct') : kind === 'part' ? t('partly') : t('wrong');
  const m = mis ? MISCONCEPTIONS.find((x) => x.id === mis) : undefined;
  return h('div', { class: 'feedback' + (kind === 'miss' ? ' miss' : kind === 'part' ? ' part' : ''), role: 'status' },
    h('strong', { class: 'verdict' }, verdict),
    h('div', null, rich(explain)),
    m ? h('div', { class: 'mis-note' }, L({ en: 'This is a known trap: ', de: 'Das ist eine bekannte Falle: ' }), L(m.name), L({ en: '. It goes into your misconception ledger.', de: '. Sie kommt in deine Liste der Fehlvorstellungen.' })) : null,
  );
}

export function confidenceSlider(): { el: HTMLElement; value: () => number } {
  const input = h('input', { type: 'range', min: '50', max: '100', step: '5', value: '70', 'aria-label': t('confidence') }) as HTMLInputElement;
  const out = h('output', null, '70 %');
  input.addEventListener('input', () => { out.textContent = `${input.value} %`; });
  const el = h('div', { class: 'confidence' },
    h('label', null, t('confidence'), ' ', out), input,
    h('div', { class: 'ends', 'aria-hidden': 'true' }, h('span', null, t('guessing')), h('span', null, t('certain'))));
  return { el, value: () => +input.value / 100 };
}

function renderChoice(item: ChoiceItem, onDone: Done, opts: { showUnit?: boolean }): HTMLElement {
  let chosen = -1;
  const conf = item.withConfidence ? confidenceSlider() : null;
  const check = h('button', { class: 'btn block', type: 'button', disabled: true }, t('check'));
  const opts$ = item.options.map((o, i) => h('button', {
    class: 'option', type: 'button', 'aria-pressed': 'false',
    onclick: () => { chosen = i; opts$.forEach((b, j) => b.setAttribute('aria-pressed', String(i === j))); check.disabled = false; },
  }, rich(o.text, { terms: false })));
  const fb = h('div');
  const wrap = h('div', { class: 'q' },
    formatLabel(item.format, opts.showUnit ? item.unit : undefined),
    h('p', { class: 'q-prompt' }, rich(item.prompt)),
    h('div', { class: 'options', role: 'group' }, opts$),
    conf?.el, check, fb);
  check.addEventListener('click', () => {
    const o = item.options[chosen];
    const correct = !!o.correct;
    const c = conf?.value();
    opts$.forEach((b, j) => { (b as HTMLButtonElement).disabled = true; if (item.options[j].correct) b.classList.add('right'); else if (j === chosen) b.classList.add('wrong'); });
    check.remove(); conf?.el.remove();
    fb.appendChild(feedback(correct ? 'right' : 'miss', item.explain, correct ? undefined : o.mis));
    recordAnswer({ item: item.id, concepts: item.concepts, correct, conf: c, chosenMis: correct ? undefined : o.mis, targets: item.targets, evidence: item.evidence ?? 'predict' });
    buzz(correct ? 'light' : 'medium');
    onDone({ correct });
  });
  return wrap;
}

function shuffled<T>(arr: T[]): T[] {
  for (let tries = 0; tries < 20; tries++) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    if (a.some((x, i) => x !== arr[i])) return a;
  }
  return arr.slice().reverse();
}

function renderRank(item: RankItem, onDone: Done, opts: { showUnit?: boolean }): HTMLElement {
  const correctOrder = item.order.map((_, i) => i);
  let order = shuffled(correctOrder);
  const list = h('ol', { class: 'rank-list' });
  let locked = false;
  const draw = () => {
    clear(list);
    order.forEach((idx, pos) => {
      const li = h('li', { class: 'rank-item', 'data-idx': String(idx) },
        h('span', { class: 'pos' }, String(pos + 1)),
        h('span', { class: 'lbl' }, rich(item.order[idx], { terms: false })),
        h('button', { type: 'button', 'aria-label': L({ en: 'Move up', de: 'Nach oben' }), disabled: locked || pos === 0, onclick: () => move(pos, pos - 1) }, '↑'),
        h('button', { type: 'button', 'aria-label': L({ en: 'Move down', de: 'Nach unten' }), disabled: locked || pos === order.length - 1, onclick: () => move(pos, pos + 1) }, '↓'),
      );
      if (!locked) enableDrag(li, pos);
      list.appendChild(li);
    });
  };
  const move = (from: number, to: number) => { if (to < 0 || to >= order.length) return; const a = order.slice(); const [x] = a.splice(from, 1); a.splice(to, 0, x); order = a; draw(); buzz('light'); };
  const enableDrag = (li: HTMLElement, pos: number) => {
    let startY = 0, dy = 0, h0 = 0, dragging = false;
    li.addEventListener('pointerdown', (e) => {
      if ((e.target as HTMLElement).tagName === 'BUTTON') return;
      dragging = true; startY = e.clientY; h0 = li.offsetHeight + 8; li.setPointerCapture(e.pointerId); li.classList.add('dragging');
    });
    li.addEventListener('pointermove', (e) => { if (!dragging) return; dy = e.clientY - startY; li.style.transform = `translateY(${dy}px)`; });
    const end = () => {
      if (!dragging) return; dragging = false; li.classList.remove('dragging'); li.style.transform = '';
      const steps = Math.round(dy / h0); dy = 0;
      if (steps) move(pos, Math.max(0, Math.min(order.length - 1, pos + steps)));
    };
    li.addEventListener('pointerup', end); li.addEventListener('pointercancel', end);
  };
  draw();
  const fb = h('div');
  const check = h('button', { class: 'btn block', type: 'button' }, t('check'));
  check.addEventListener('click', () => {
    locked = true;
    const right = order.filter((idx, pos) => idx === pos).length;
    const correct = right === order.length;
    const reversed = order.every((idx, pos) => idx === order.length - 1 - pos);
    const partial = !correct && right >= Math.ceil(order.length / 2);
    draw();
    list.querySelectorAll('.rank-item').forEach((li, pos) => li.classList.add(order[pos] === pos ? 'right' : 'wrong'));
    check.remove();
    fb.appendChild(feedback(correct ? 'right' : partial ? 'part' : 'miss', item.explain, reversed ? item.mis : undefined));
    recordAnswer({ item: item.id, concepts: item.concepts, correct, partial, chosenMis: reversed ? item.mis : undefined, targets: item.targets, evidence: item.evidence ?? 'predict' });
    buzz(correct ? 'light' : 'medium');
    onDone({ correct, partial });
  });
  return h('div', { class: 'q' }, formatLabel(item.format, opts.showUnit ? item.unit : undefined), h('p', { class: 'q-prompt' }, rich(item.prompt)),
    h('p', { class: 'muted small' }, L({ en: 'Drag the rows, or use the arrows.', de: 'Zieh die Zeilen oder nutze die Pfeile.' })), list, check, fb);
}

function renderEstimate(item: EstimateItem, onDone: Done, opts: { showUnit?: boolean }): HTMLElement {
  const mid = Math.round(((item.min + item.max) / 2) / item.step) * item.step;
  const input = h('input', { type: 'range', min: String(item.min), max: String(item.max), step: String(item.step), value: String(mid), 'aria-label': L(item.prompt) }) as HTMLInputElement;
  const digits = item.step < 1 ? 1 : 0;
  const out = h('output', { class: 'estimate-out' }, num(mid, digits) + item.suffix);
  input.addEventListener('input', () => { out.textContent = num(+input.value, digits) + item.suffix; });
  const fb = h('div');
  const check = h('button', { class: 'btn block', type: 'button' }, t('check'));
  check.addEventListener('click', () => {
    const v = +input.value;
    const err = Math.abs(v - item.answer);
    const correct = err <= item.tolerance + 1e-9;
    const partial = !correct && err <= Math.max(item.tolerance * 3, (item.max - item.min) * 0.06);
    input.disabled = true; check.remove();
    fb.appendChild(feedback(correct ? 'right' : partial ? 'part' : 'miss', item.explain));
    recordAnswer({ item: item.id, concepts: item.concepts, correct, partial, targets: item.targets, evidence: item.evidence ?? 'predict' });
    onDone({ correct, partial });
  });
  return h('div', { class: 'q' }, formatLabel(item.format, opts.showUnit ? item.unit : undefined), h('p', { class: 'q-prompt' }, rich(item.prompt)), out, input, check, fb);
}

function renderFlaw(item: FlawItem, onDone: Done, opts: { showUnit?: boolean }): HTMLElement {
  let chosen = -1;
  const check = h('button', { class: 'btn block', type: 'button', disabled: true }, t('check'));
  const lines = item.lines.map((ln, i) => h('button', {
    class: 'option', type: 'button', 'aria-pressed': 'false',
    onclick: () => { chosen = i; lines.forEach((b, j) => b.setAttribute('aria-pressed', String(i === j))); check.disabled = false; },
  }, rich(ln, { terms: false })));
  const fb = h('div');
  check.addEventListener('click', () => {
    const correct = chosen === item.flaw;
    lines.forEach((b, j) => { (b as HTMLButtonElement).disabled = true; if (j === item.flaw) b.classList.add('right'); else if (j === chosen) b.classList.add('wrong'); });
    check.remove();
    fb.appendChild(feedback(correct ? 'right' : 'miss', item.explain));
    recordAnswer({ item: item.id, concepts: item.concepts, correct, chosenMis: correct ? undefined : item.targets?.[0], targets: item.targets, evidence: item.evidence ?? 'transfer' });
    onDone({ correct });
  });
  return h('div', { class: 'q' }, formatLabel(item.format, opts.showUnit ? item.unit : undefined), h('p', { class: 'q-prompt' }, rich(item.prompt)),
    h('ol', { class: 'flaw-lines' }, lines.map((l) => h('li', null, l))), check, fb);
}

/** A run of items shown one after another, e.g. a warm-up. */
export function itemRun(items: Item[], onFinished: (results: Result[]) => void, opts: { showUnit?: boolean } = {}): HTMLElement {
  const box = h('div', { class: 'stack' });
  const results: Result[] = [];
  const counter = h('p', { class: 'muted small' });
  const show = (i: number) => {
    clear(box);
    if (i >= items.length) { onFinished(results); return; }
    counter.textContent = L({ en: `Question ${i + 1} of ${items.length}`, de: `Frage ${i + 1} von ${items.length}` });
    box.appendChild(counter);
    const next = h('button', { class: 'btn block', type: 'button' }, i + 1 < items.length ? L({ en: 'Next question', de: 'Nächste Frage' }) : t('continue'));
    box.appendChild(renderItem(items[i], (r) => { results.push(r); box.appendChild(next); next.focus({ preventScroll: true }); }, opts));
    next.addEventListener('click', () => { show(i + 1); box.scrollIntoView({ behavior: 'smooth', block: 'start' }); });
  };
  show(0);
  return box;
}
