// A unit player built from UnitContent: the same seven steps as units 0 and 6, with the engine supplied by
// the unit. Each unit file (u01.ts … u05.ts) says which engine to use and how engine events tick its tasks.
import { h, rich, chem } from '../ui/dom';
import { L, t, type Bi } from '../i18n';
import type { UnitContent, Show, DataTable } from '../content/unitTypes';
import { pickWarmup, confidentToday } from '../model/learner';
import { itemRun, renderItem } from '../ui/questions';
import { explainStep, wrapStep, taskList, extraExample, deeperPanel } from '../ui/steps';
import type { StepCtx, UnitPlayer } from './types';

/** An engine as a unit sees it: an element to place, and a way to show a reveal. */
export interface Engine { el: HTMLElement; show(s: Show): void; }

export interface UnitEngine {
  /** The full engine for the explore step. `mark` ticks a task; it returns true the first time. */
  explore(ctx: StepCtx, mark: (id: string) => boolean): Engine;
  /** A compact engine for reveals and worked examples. `shows` lists everything it will be asked to show. */
  compact(ctx: StepCtx, shows: Show[]): Engine;
}

const decimal = (v: string) => L({ en: v, de: v.replace(/(\d)\.(\d)/g, '$1,$2') });
const cell = (c: string | Bi, numeric: boolean) => (typeof c === 'string' ? (numeric ? decimal(c) : rich(c)) : rich(c));

function dataTable(d: DataTable): HTMLElement {
  const num = new Set(d.numeric ?? []);
  return h('div', { class: 'data-card' },
    d.caption ? h('p', { class: 'muted small', style: 'margin:0 0 8px' }, rich(d.caption)) : null,
    h('table', { class: 'data-table' },
      h('thead', null, h('tr', null, d.head.map((x, i) => h('th', num.has(i) ? { style: 'text-align:right' } : null, rich(x))))),
      h('tbody', null, d.rows.map((r) => h('tr', { class: r.mystery ? 'mystery' : '' }, r.cells.map((c, i) => h('td', num.has(i) ? { class: 'num' } : null, cell(c, num.has(i)))))))));
}

export function makeUnit(U: UnitContent, engine: UnitEngine): UnitPlayer {
  // ---------- 1. warm-up ----------
  const warmup = (body: HTMLElement, enable: () => void) => {
    const items = pickWarmup(undefined, U.n);
    body.append(h('p', { class: 'lead' }, rich(U.lead)));
    if (!items.length) {
      body.append(h('p', { class: 'muted' }, L({ en: 'Nothing to review yet: this is where your review questions will appear once you have done other units.', de: 'Noch nichts zu wiederholen: Hier erscheinen deine Wiederholungsfragen, sobald du andere Einheiten gemacht hast.' })));
      enable();
      return;
    }
    body.append(h('p', { class: 'muted' }, t('warmupIntro')));
    body.append(itemRun(items, () => enable(), { showUnit: true, review: true }));
  };

  // ---------- 2. puzzle ----------
  const puzzle = (body: HTMLElement, enable: () => void) => {
    const P = U.puzzle;
    body.append(h('h2', null, rich(P.title)), h('p', null, rich(P.lead)), dataTable(P.data), h('p', { class: 'lead' }, rich(P.clash)));
    body.append(renderItem(P.question, () => { body.append(h('p', { class: 'muted' }, rich(P.after))); enable(); }));
  };

  // ---------- 3. explore ----------
  const explore = (body: HTMLElement, enable: () => void, ctx: StepCtx) => {
    const E = U.explore;
    const note = h('div');
    const checkBox = h('div');
    const tasks = taskList(E.tasks, () => { checkBox.append(renderItem(E.check, () => enable())); });
    const mark = (id: string) => {
      if (!tasks.mark(id)) return false;
      const n = E.notes?.[id];
      if (n) note.replaceChildren(h('p', { class: 'muted small' }, rich(n)));
      return true;
    };
    const eng = engine.explore(ctx, mark);
    body.append(h('h2', null, rich(E.title)), h('p', { class: 'muted' }, rich(E.intro)), eng.el,
      h('div', { class: 'panel' }, h('h3', { style: 'margin-bottom:6px' }, L({ en: 'Things to try', de: 'Zum Ausprobieren' })), tasks.el, note),
      checkBox);
  };

  // ---------- 4. predict ----------
  const predict = (body: HTMLElement, enable: () => void, ctx: StepCtx) => {
    const eng = engine.compact(ctx, U.predictions.map((p) => p.show));
    const stage = h('div', { class: 'reveal', hidden: true }, eng.el);
    const revealText = h('div');
    body.append(h('h2', null, t('stepPredict')), h('p', { class: 'muted' }, t('predictIntro')));
    const run = (i: number) => {
      const p = U.predictions[i];
      if (!p) { enable(); return; }
      const box = h('div', { class: 'stack' });
      body.append(box);
      box.append(renderItem(p.item, (r) => {
        // A missed prediction gets one more worked example before the reveal.
        const extra = r.correct ? null : extraExample(p.extra);
        if (extra) box.append(extra);
        stage.hidden = false;
        box.append(stage, revealText);
        eng.show(p.show);
        revealText.replaceChildren(h('p', { class: 'muted' }, rich(p.revealText)));
        const next = h('button', { class: 'btn quiet block', type: 'button' }, i + 1 < U.predictions.length ? L({ en: 'Next prediction', de: 'Nächste Vorhersage' }) : L({ en: 'Done predicting', de: 'Vorhersagen abgeschlossen' }));
        next.addEventListener('click', () => { next.remove(); run(i + 1); });
        box.append(next);
        (extra ?? stage).scrollIntoView({ behavior: 'smooth', block: extra ? 'start' : 'center' });
      }, { fold: true }));
    };
    run(0);
  };

  // ---------- 5. worked examples, spot the flaw ----------
  const examples = (body: HTMLElement, enable: () => void, ctx: StepCtx) => {
    const eng = engine.compact(ctx, U.examples.map((x) => x.show));
    body.append(h('h2', null, t('stepExamples')), eng.el);
    eng.show(U.examples[0].show);
    for (const ex of U.examples) {
      body.append(h('article', { class: 'panel example' },
        h('h3', null, rich(ex.title), ' ', h('span', { class: 'muted small' }, chem(ex.tag))),
        h('div', { class: 'numbers' }, ex.numbers.map((n) => h('span', null, h('b', null, decimal(n.v)), rich(n.label)))),
        h('p', { style: 'margin:0' }, rich(ex.body)),
        h('p', { class: 'muted', style: 'margin:0' }, rich(ex.soWhat)),
        h('button', { class: 'btn small quiet', type: 'button', onclick: () => { eng.show(ex.show); eng.el.scrollIntoView({ behavior: 'smooth', block: 'center' }); } }, t('showIn3d'))));
    }
    body.append(h('div', { class: 'panel' }, renderItem(U.flaw, () => {
      if (confidentToday(U.predictions.map((p) => p.item.id))) body.append(deeperPanel(U.deeper));
      enable();
    })));
  };

  const explainBack = (body: HTMLElement, enable: () => void) => explainStep(body, enable, U.n, U.explain);
  const wrap = (body: HTMLElement, enable: () => void) => wrapStep(body, enable, U.n, U.terms, U.readings);

  return { n: U.n, title: U.title, steps: [warmup, puzzle, explore, predict, examples, explainBack, wrap] };
}
