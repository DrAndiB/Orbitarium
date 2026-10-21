// Question renderers. Each one records its own answer in the learner model and
// calls onDone once the learner has committed.
import { h, rich, clear } from './dom';
import { L, t, num, type Bi } from '../i18n';
import { recordAnswer } from '../model/learner';
import { MISCONCEPTIONS } from '../content/curriculum';
import type { Item, ChoiceItem, RankItem, EstimateItem, FlawItem, Format } from '../content/items';
import { buzz } from '../platform';
import { openTable, createTable, tableIcon } from './ptable';
import { byZ, outerElectrons } from '../content/elements';
import type { OverlayId } from '../content/elements';

/** "Look it up" link: questions point to the periodic table instead of expecting memorised data. */
export function tableLink(overlay: OverlayId = 'category'): HTMLElement {
  return h('button', { class: 'btn small quiet table-chip', type: 'button', onclick: () => openTable({ overlay }) },
    tableIcon(), L({ en: 'Look it up in the table', de: 'Im Periodensystem nachsehen' }));
}

/** Locate question: tap the right element on the table. */
export function locateQuestion(o: { id: string; prompt: Bi; answer: number[]; overlay?: OverlayId; explain: Bi; concepts: string[] }, onDone: Done): HTMLElement {
  let chosen = 0;
  const check = h('button', { class: 'btn block', type: 'button', disabled: true }, t('check'));
  const picked = h('p', { class: 'muted small' }, L({ en: 'Nothing selected yet.', de: 'Noch nichts ausgewählt.' }));
  const table = createTable({ pick: true, overlay: o.overlay ?? 'category', overlays: ['category', 'shells', 'outer'], onSelect: (z) => {
    chosen = z; check.disabled = false;
    picked.textContent = L({ en: `Selected: ${byZ(z).en} (${byZ(z).s})`, de: `Ausgewählt: ${byZ(z).de} (${byZ(z).s})` });
  } });
  const fb = h('div');
  check.addEventListener('click', () => {
    const correct = o.answer.includes(chosen);
    check.remove();
    table.select(o.answer[0]);
    if (!correct) {
      // Say what the tapped cell actually has, so the miss is informative.
      const e = byZ(chosen), out = outerElectrons(e), n = e.sh.length;
      const outs = out === null ? '' : L({ en: `, ${out} outer electron${out === 1 ? '' : 's'}`, de: `, ${out} Außenelektron${out === 1 ? '' : 'en'}` });
      fb.appendChild(h('p', { class: 'muted small' }, L({ en: `You picked ${e.en.toLowerCase()}: ${n} shell${n === 1 ? '' : 's'}${outs}.`, de: `Du hast ${e.de} gewählt: ${n} Schale${n === 1 ? '' : 'n'}${outs}.` })));
    }
    fb.appendChild(feedback(correct ? 'right' : 'miss', o.explain));
    recordAnswer({ item: o.id, concepts: o.concepts, correct, evidence: 'explain' });
    buzz(correct ? 'light' : 'medium');
    onDone({ correct });
  });
  return h('div', { class: 'q' }, formatLabel('locate'), h('p', { class: 'q-prompt' }, rich(o.prompt)), table.el, picked, check, fb);
}

export interface Result { correct: boolean; partial?: boolean; conf?: number; }
type Done = (r: Result) => void;
/** showUnit: label the unit; review: a warm-up or rekindle answer; neutral: unscored first-contact questions. */
export interface ItemOpts { showUnit?: boolean; review?: boolean; neutral?: boolean; fold?: boolean; }
/** fold: on a miss, fold the explanation away (an extra worked example follows instead). */

const FORMAT: Record<Format, Bi> = {
  predict: { en: 'Predict and commit', de: 'Vorhersagen und festlegen' },
  why: { en: 'Pick the best explanation', de: 'Die beste Erklärung wählen' },
  rank: { en: 'Rank it', de: 'Ordnen' },
  estimate: { en: 'Estimate', de: 'Schätzen' },
  odd: { en: 'Odd one out', de: 'Was passt nicht?' },
  flaw: { en: 'Spot the flaw', de: 'Finde den Fehler' },
  build: { en: 'Build to spec', de: 'Nach Vorgabe bauen' },
  draw: { en: 'Draw on it', de: 'Einzeichnen' },
  explain: { en: 'Explain back', de: 'Zurückerklären' },
  terms: { en: 'Term pairs', de: 'Begriffspaare' },
  locate: { en: 'Find it on the map', de: 'Auf der Karte finden' },
};
export const formatLabel = (f: Format, unit?: number) =>
  h('div', { class: 'q-format' }, L(FORMAT[f]) + (unit !== undefined ? ` · ${L({ en: 'unit', de: 'Einheit' })} ${unit}` : ''));

export function renderItem(item: Item, onDone: Done, opts: ItemOpts = {}): HTMLElement {
  switch (item.kind) {
    case 'choice': return renderChoice(item, onDone, opts);
    case 'rank': return renderRank(item, onDone, opts);
    case 'estimate': return renderEstimate(item, onDone, opts);
    case 'flaw': return renderFlaw(item, onDone, opts);
  }
}

interface FbOpts { mis?: string; sure?: boolean; neutral?: boolean; verdict?: string; notes?: Bi[]; fold?: boolean }
function feedback(kind: 'right' | 'miss' | 'part', explain: Bi, o: FbOpts = {}): HTMLElement {
  const verdict = o.verdict ?? (o.neutral && kind !== 'right' ? L({ en: 'Here is the answer.', de: 'Das ist die Antwort.' }) : kind === 'right' ? t('correct') : kind === 'part' ? t('partly') : t('wrong'));
  const m = o.mis ? MISCONCEPTIONS.find((x) => x.id === o.mis) : undefined;
  return h('div', { class: 'feedback' + (o.neutral ? ' neutral' : kind === 'miss' ? ' miss' : kind === 'part' ? ' part' : ''), role: 'status' },
    h('strong', { class: 'verdict' }, verdict),
    ...(o.notes ?? []).map((n) => h('div', { class: 'fb-note' }, rich(n))),
    o.fold && kind !== 'right' ? h('details', { class: 'fb-fold' }, h('summary', null, L({ en: 'The short explanation', de: 'Die kurze Erklärung' })), h('div', null, rich(explain))) : h('div', null, rich(explain)),
    o.sure && kind === 'miss' ? h('div', { class: 'sure-note' }, L({ en: 'You were sure about this one. Confident mistakes are the most useful ones to catch: this question will come back.', de: 'Hier warst du dir sicher. Selbstsichere Fehler lohnen sich am meisten: Diese Frage kommt wieder.' })) : null,
    m ? h('div', { class: 'mis-note' }, L({ en: 'A common trap: ', de: 'Eine häufige Falle: ' }), L(m.name), L({ en: '. Lots of people fall into it. The app will bring it back on another day until it sticks.', de: '. Da tappen viele hinein. Die App bringt sie an einem anderen Tag wieder, bis es sitzt.' })) : null,
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

function renderChoice(item: ChoiceItem, onDone: Done, opts: ItemOpts): HTMLElement {
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
    item.table ? tableLink(item.table) : null,
    h('div', { class: 'options', role: 'group' }, opts$),
    conf?.el, check, fb);
  check.addEventListener('click', () => {
    const o = item.options[chosen];
    const correct = !!o.correct;
    const c = conf?.value();
    opts$.forEach((b, j) => { (b as HTMLButtonElement).disabled = true; if (item.options[j].correct) b.classList.add('right'); else if (j === chosen) b.classList.add('wrong'); });
    check.remove(); conf?.el.remove();
    fb.appendChild(feedback(correct ? 'right' : 'miss', item.explain, { mis: correct ? undefined : o.mis, sure: (c ?? 0) >= 0.8, neutral: opts.neutral, fold: opts.fold }));
    recordAnswer({ item: item.id, concepts: item.concepts, correct, conf: c, chosenMis: correct ? undefined : o.mis, targets: item.targets, evidence: item.evidence ?? (item.format === 'why' ? 'explain' : 'predict'), review: opts.review });
    buzz(correct ? 'light' : 'medium');
    onDone({ correct, conf: c });
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

function renderRank(item: RankItem, onDone: Done, opts: ItemOpts): HTMLElement {
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
    fb.appendChild(feedback(correct ? 'right' : partial ? 'part' : 'miss', item.explain, { mis: reversed ? item.mis : undefined, neutral: opts.neutral }));
    recordAnswer({ item: item.id, concepts: item.concepts, correct, partial, chosenMis: reversed ? item.mis : undefined, targets: item.targets, evidence: item.evidence ?? 'predict', review: opts.review });
    buzz(correct ? 'light' : 'medium');
    onDone({ correct, partial });
  });
  return h('div', { class: 'q' }, formatLabel(item.format, opts.showUnit ? item.unit : undefined), h('p', { class: 'q-prompt' }, rich(item.prompt)),
    item.table ? tableLink(item.table) : null,
    h('p', { class: 'muted small' }, L({ en: 'Drag the rows, or use the arrows.', de: 'Zieh die Zeilen oder nutze die Pfeile.' })), list, check, fb);
}

function renderEstimate(item: EstimateItem, onDone: Done, opts: ItemOpts): HTMLElement {
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
    // "close" is at least one slider step away, so an integer answer that is off by one counts as close
    const partial = !correct && err <= Math.max(item.tolerance * 3, (item.max - item.min) * 0.06, item.step) + 1e-9;
    input.disabled = true; check.remove();
    // Estimates are graded by distance: spot on, close or far off. A value near another meaningful number gets a note.
    const verdict = correct ? L({ en: 'Spot on.', de: 'Genau richtig.' }) : partial ? L({ en: 'Close.', de: 'Nah dran.' }) : L({ en: 'Far off.', de: 'Weit daneben.' });
    const notes = (item.near ?? []).filter((n) => !correct && Math.abs(v - n.value) <= n.tol).map((n) => n.note);
    fb.appendChild(feedback(correct ? 'right' : partial ? 'part' : 'miss', item.explain, { verdict: opts.neutral && !correct ? undefined : verdict, notes, neutral: opts.neutral }));
    recordAnswer({ item: item.id, concepts: item.concepts, correct, partial, targets: item.targets, evidence: item.evidence ?? 'predict', review: opts.review });
    onDone({ correct, partial });
  });
  return h('div', { class: 'q' }, formatLabel(item.format, opts.showUnit ? item.unit : undefined), h('p', { class: 'q-prompt' }, rich(item.prompt)), item.table ? tableLink(item.table) : null, out, input, check, fb);
}

function renderFlaw(item: FlawItem, onDone: Done, opts: ItemOpts): HTMLElement {
  let chosen = -1;
  const check = h('button', { class: 'btn block', type: 'button', disabled: true }, t('check'));
  const lines = item.lines.map((ln, i) => h('button', {
    class: 'option', type: 'button', 'aria-pressed': 'false',
    onclick: () => { chosen = i; lines.forEach((b, j) => b.setAttribute('aria-pressed', String(i === j))); check.disabled = false; },
  }, rich(ln, { terms: false })));
  const fb = h('div');
  check.addEventListener('click', () => {
    const correct = chosen === item.flaw;
    // Picking a later step that is false only because it follows from the slip earns partial credit.
    const near = item.near?.find((x) => x.step === chosen);
    const partial = !correct && (!!item.alsoFalse?.includes(chosen) || !!near);
    lines.forEach((b, j) => { (b as HTMLButtonElement).disabled = true; if (j === item.flaw) b.classList.add('right'); else if (j === chosen) b.classList.add(partial ? 'part' : 'wrong'); });
    check.remove();
    const notes = near ? [near.note] : partial ? [{ en: 'That step is false too, but only because it follows from an earlier slip. The question asks where the reasoning first goes wrong.', de: 'Dieser Schritt ist auch falsch, aber nur, weil er aus einem früheren Fehler folgt. Gefragt war, wo die Überlegung zuerst schiefgeht.' }] : [];
    fb.appendChild(feedback(correct ? 'right' : partial ? 'part' : 'miss', item.explain, { notes, neutral: opts.neutral }));
    recordAnswer({ item: item.id, concepts: item.concepts, correct, partial, chosenMis: correct || partial ? undefined : item.targets?.[0], targets: item.targets, evidence: item.evidence ?? 'transfer', review: opts.review });
    onDone({ correct, partial });
  });
  return h('div', { class: 'q' }, formatLabel(item.format, opts.showUnit ? item.unit : undefined), h('p', { class: 'q-prompt' }, rich(item.prompt)),
    h('ol', { class: 'flaw-lines' }, lines.map((l) => h('li', null, l))), check, fb);
}

/** A run of items shown one after another, e.g. a warm-up. */
export function itemRun(items: Item[], onFinished: (results: Result[]) => void, opts: ItemOpts = {}): HTMLElement {
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
