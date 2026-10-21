// Unit 0 — The periodic table as a map: the seven steps on the Periodic Table engine.
import { h, rich } from '../ui/dom';
import { L, t, num, type Bi } from '../i18n';
import { UNIT0 } from '../content/unit00';
import { itemById, type Item } from '../content/items';
import { byZ, CAT_COLOR, NO_STANDARD_MASS, type OverlayId } from '../content/elements';
import { getState } from '../model/store';
import { pickWarmup, recordAnswer, confidentToday } from '../model/learner';
import { itemRun, renderItem, locateQuestion } from '../ui/questions';
import { explainStep, wrapStep, taskList, extraExample, deeperPanel } from '../ui/steps';
import type { StepCtx, UnitPlayer } from './types';

// ---------- step 1: what you already know ----------
function warmup(body: HTMLElement, enable: () => void) {
  const st = getState();
  const firstTime = !st.attempts.some((a) => a.item.startsWith('u0'));
  // First visit: three unscored questions to see where the learner starts. Later visits: a normal review.
  const items = firstTime ? (['u0a', 'u0b', 'u0c'].map(itemById).filter(Boolean) as Item[]) : pickWarmup(undefined, 0);
  body.append(h('p', { class: 'lead' }, rich(UNIT0.lead)), h('p', { class: 'muted' }, firstTime ? rich(UNIT0.warmupIntro) : t('warmupIntro')));
  body.append(itemRun(items, () => enable(), firstTime ? { neutral: true } : { showUnit: true, review: true }));
}

// ---------- step 2: Mendeleev's gap ----------
function puzzle(body: HTMLElement, enable: () => void) {
  const P = UNIT0.puzzle;
  const tile = (s: string, m: number | null, label?: string) => h('div', null,
    h('div', { class: 'gap-tile' + (m === null ? ' missing' : '') }, h('span', { class: 'sym' }, s), h('span', { class: 'm' }, m === null ? '?' : num(m, 1))),
    label ? h('span', { class: 'gap-label' }, label) : null);
  const target = (label: string) => h('div', null, h('div', { class: 'gap-tile target' }, h('span', { class: 'sym' }, '?'), h('span', { class: 'm' }, '?')), h('span', { class: 'gap-label' }, label));
  const gap1 = L({ en: 'gap 1', de: 'Lücke 1' }), gap2 = L({ en: 'gap 2: asked', de: 'Lücke 2: gefragt' });
  body.append(h('h2', null, L(P.title)), h('p', null, rich(P.lead)),
    h('div', { class: 'data-card gap-card' },
      h('p', { class: 'muted small', style: 'margin:0 0 8px' }, L({ en: 'Period 4 in today\'s layout, as far as it was known in 1871 (modern mass values, in u)', de: 'Periode 4 im heutigen Aufbau, so weit sie 1871 bekannt war (heutige Massenwerte, in u)' })),
      h('div', { class: 'gap-row' }, P.row.map((x, i) => (i === 2 ? target(gap2) : i === 1 ? tile(x.s, x.m, gap1) : tile(x.s, x.m)))),
      h('p', { class: 'muted small', style: 'margin:12px 0 8px' }, L({ en: 'Its column in today\'s table, group 14', de: 'Seine Spalte im heutigen Periodensystem, Gruppe 14' })),
      h('div', { class: 'gap-row col' }, P.column.map((x, i) => (i === 2 ? target(gap2) : tile(x.s, x.m))))),
    h('p', { class: 'lead' }, rich(P.clash)));
  body.append(renderItem(P.item, () => { body.append(h('p', { class: 'muted' }, rich(P.after))); enable(); }));
}

// ---------- step 3: explore the map ----------
function explore(body: HTMLElement, enable: () => void, ctx: StepCtx) {
  const E = UNIT0.explore;
  const note = h('div');
  const checkBox = h('div');
  let last = 0;
  const tasks = taskList(E.tasks, () => {
    const it = itemById('u0h');
    if (it) checkBox.append(renderItem(it, () => enable()));
  });
  const fill = (b: Bi, v: Record<string, string>) => L(b).replace(/\{(\w+)\}/g, (_, k) => v[k] ?? '');
  const onSelect = (z: number, overlay: OverlayId) => {
    const e = byZ(z);
    if (overlay === 'shells' && e.p === 4 && e.y < 9) tasks.mark('rows');
    if (overlay === 'outer' && e.g === 17) tasks.mark('columns');
    if (overlay === 'block' && e.b === 'd') tasks.mark('blocks');
    if (overlay === 'chi' && e.s === 'F') tasks.mark('chi');
    if (e.s === 'K') tasks.mark('k');
    // The mass-order challenge: neighbours by atomic number where the first is heavier. Synthetic elements
    // carry mass numbers, not averages, so they do not count.
    if (overlay === 'mass' && last && Math.abs(last - z) === 1 && !NO_STANDARD_MASS.has(z) && !NO_STANDARD_MASS.has(last)) {
      const [a, b] = last < z ? [byZ(last), e] : [e, byZ(last)];
      if (a.m > b.m && tasks.mark('order')) {
        const name = (x: typeof a) => L({ en: x.en, de: x.de });
        note.replaceChildren(h('p', { class: 'muted small' }, fill(E.orderFound, { a: name(a), b: name(b), za: String(a.z), zb: String(b.z) })));
        recordAnswer({ item: 'u0-order', concepts: ['u0.families'], correct: true, evidence: 'transfer', targets: ['order-by-mass'] });
      }
    }
    last = z;
  };
  const table = ctx.table({ allow3d: true, overlay: 'category', onSelect });
  body.append(h('h2', null, L({ en: 'The map', de: 'Die Karte' })), h('p', { class: 'muted' }, rich(E.intro)),
    h('div', { class: 'panel' }, h('h3', { style: 'margin-bottom:6px' }, L({ en: 'Things to try', de: 'Zum Ausprobieren' })), tasks.el, note),
    table.el, checkBox);
}

// ---------- step 4: predict ----------
function predict(body: HTMLElement, enable: () => void, ctx: StepCtx) {
  body.append(h('h2', null, t('stepPredict')), h('p', { class: 'muted' }, t('predictIntro')));
  const run = (i: number) => {
    const p = UNIT0.predictions[i];
    if (!p) { enable(); return; }
    const box = h('div', { class: 'stack' });
    body.append(box);
    box.append(renderItem(p.item, (r) => {
      // A missed prediction gets one more worked example before the reveal.
      if (!r.correct) box.append(extraExample(p.extra));
      const table = ctx.table({ overlay: p.overlay, selected: p.select, overlays: ['category', p.overlay] });
      box.append(table.el, h('p', { class: 'muted' }, rich(p.revealText)));
      const next = h('button', { class: 'btn quiet block', type: 'button' }, i + 1 < UNIT0.predictions.length ? L({ en: 'Next prediction', de: 'Nächste Vorhersage' }) : L({ en: 'Done predicting', de: 'Vorhersagen abgeschlossen' }));
      next.addEventListener('click', () => { next.remove(); run(i + 1); });
      box.append(next);
      (r.correct ? table.el : box.lastElementChild ?? table.el).scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, { fold: true }));
  };
  run(0);
}

// ---------- step 5: reading a cell, find it on the map, spot the flaw ----------
function examples(body: HTMLElement, enable: () => void, ctx: StepCtx) {
  body.append(h('h2', null, L({ en: 'Reading a cell', de: 'Eine Zelle lesen' })),
    h('p', { class: 'muted' }, L({ en: 'Three cells, read step by step. Each one tells you more than you might expect.', de: 'Drei Zellen, Schritt für Schritt gelesen. Jede verrät mehr, als man denkt.' })));
  const table = ctx.table({ overlay: 'shells', selected: 17, overlays: ['category', 'shells', 'outer', 'block', 'mass'] });
  for (const ex of UNIT0.examples) {
    const e = byZ(ex.z);
    body.append(h('article', { class: 'panel example' },
      h('div', { class: 'cell-example' },
        h('div', { class: 'pt-tile', style: `--tile:${CAT_COLOR[e.c]}` }, h('span', { class: 'zn' }, String(e.z)), h('span', { class: 'sym' }, e.s), h('span', { class: 'm' }, num(e.m, 2))),
        h('h3', null, L(ex.title))),
      h('ol', { class: 'cell-steps' }, ex.steps.map((s: Bi) => h('li', null, rich(s)))),
      h('p', { class: 'muted', style: 'margin:0' }, rich(ex.soWhat)),
      h('button', { class: 'btn small quiet', type: 'button', onclick: () => { table.setOverlay(ex.overlay); table.select(ex.z); table.el.scrollIntoView({ behavior: 'smooth', block: 'center' }); } }, L({ en: 'Show on the map', de: 'Auf der Karte zeigen' }))));
  }
  body.append(table.el);
  let answered = 0;
  const tick = () => {
    if (++answered !== 2) return;
    if (confidentToday(UNIT0.predictions.map((p) => p.item.id))) body.append(deeperPanel(UNIT0.deeper));
    enable();
  };
  body.append(h('div', { class: 'panel' }, locateQuestion(UNIT0.locate, tick)));
  body.append(h('div', { class: 'panel' }, renderItem(UNIT0.flaw, tick)));
}

function explainBack(body: HTMLElement, enable: () => void) { explainStep(body, enable, 0, UNIT0.explain); }
function wrap(body: HTMLElement, enable: () => void) { wrapStep(body, enable, 0, UNIT0.terms, UNIT0.readings); }

export const unit0: UnitPlayer = { n: 0, title: UNIT0.title, steps: [warmup, puzzle, explore, predict, examples, explainBack, wrap] };
