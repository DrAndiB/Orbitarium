// First launch: start fresh with a short diagnostic, load the chat-lesson history, or import a file.
import { h, s, clear, toast } from './dom';
import { L, t, setLang, setHint, getLang, type Lang } from '../i18n';
import { getState, save, replaceState, today } from '../model/store';
import { parseProgress, mergeProgress } from '../model/progressFile';
import { SEED_PROGRESS } from '../model/seed';
import { DIAGNOSTIC, itemById, type Item } from '../content/items';
import { itemRun } from './questions';
import { logSession } from '../model/learner';
import { go } from '../router';

function orbitMark(): SVGElement {
  const svg = s('svg', { class: 'ob-orbit', viewBox: '0 0 120 120', 'aria-hidden': 'true' });
  svg.append(
    s('ellipse', { cx: 60, cy: 60, rx: 52, ry: 20, fill: 'none', stroke: '#2e3a69', 'stroke-width': 1.2, transform: 'rotate(-28 60 60)' }),
    s('ellipse', { cx: 60, cy: 60, rx: 52, ry: 20, fill: 'none', stroke: '#2e3a69', 'stroke-width': 1.2, transform: 'rotate(32 60 60)' }),
    s('circle', { cx: 60, cy: 60, r: 13, fill: '#d2bfa6' }),
    s('ellipse', { cx: 60, cy: 33, rx: 8, ry: 14, fill: '#b48cff', opacity: 0.45 }),
    s('circle', { cx: 101, cy: 39, r: 3.5, fill: '#5aa9ff' }),
    s('circle', { cx: 24, cy: 84, r: 3.5, fill: '#5aa9ff' }),
    s('circle', { cx: 92, cy: 93, r: 2.2, fill: '#ffc15e' }),
  );
  return svg;
}

export function renderWelcome(root: HTMLElement, rerender: () => void) {
  const langRow = h('div', { class: 'seg-choice' }, (['en', 'de'] as Lang[]).map((l) => h('button', {
    class: 'chip', type: 'button', 'aria-pressed': String(getLang() === l),
    onclick: () => { getState().settings.lang = l; save(); setLang(l); rerender(); },
  }, l === 'en' ? 'English' : 'Deutsch')));
  const hintOn = getState().settings.hint === 'other';
  const hintRow = h('label', { class: 'switch ob-hint' },
    h('input', { type: 'checkbox', checked: hintOn, onchange: (e: Event) => { const on = (e.target as HTMLInputElement).checked; getState().settings.hint = on ? 'other' : 'off'; save(); setHint(on ? 'other' : 'off'); } }),
    h('span', { class: 'switch-track', 'aria-hidden': 'true' }),
    h('span', null, getLang() === 'en' ? 'Also show the German names of terms' : 'Auch die englischen Namen der Begriffe zeigen'));
  const fileInput = h('input', { type: 'file', accept: '.md,.markdown,.txt,text/markdown,text/plain', style: 'display:none' }) as HTMLInputElement;
  fileInput.addEventListener('change', async () => {
    const f = fileInput.files?.[0];
    if (!f) return;
    try { const p = parseProgress(await f.text()); finishImport(p.state); }
    catch (e) { toast(t('importFailed', { e: (e as Error).message })); }
  });
  root.append(h('main', { class: 'ob' },
    orbitMark(),
    h('h1', null, t('obTitle')),
    h('p', { class: 'lead' }, t('obLead')),
    langRow,
    hintRow,
    h('div', { class: 'ob-choices' },
      SEED_PROGRESS ? h('button', { class: 'ob-choice primary', type: 'button', onclick: () => finishImport(parseProgress(SEED_PROGRESS).state) }, h('strong', null, t('obSeed')), h('span', null, t('obSeedSub'))) : null,
      h('button', { class: 'ob-choice', type: 'button', onclick: () => go('#/welcome/diagnostic') }, h('strong', null, t('obFresh')), h('span', null, t('obFreshSub'))),
      h('button', { class: 'ob-choice', type: 'button', onclick: () => fileInput.click() }, h('strong', null, t('obImport')), h('span', null, t('obImportSub'))),
      fileInput)));
}

function finishImport(incoming: ReturnType<typeof parseProgress>['state']) {
  const cur = getState();
  // Keep the language picked on this screen.
  const lang = cur.settings.lang, hint = cur.settings.hint;
  const next = mergeProgress(cur, incoming, true);
  next.settings.lang = lang;
  next.settings.hint = hint;
  replaceState(next);
  setLang(next.settings.lang);
  setHint(next.settings.hint);
  go('#/');
}

export function renderDiagnostic(root: HTMLElement) {
  const items = DIAGNOSTIC.map(itemById).filter(Boolean) as Item[];
  root.append(h('div', { class: 'topbar' }, h('h1', null, t('diagTitle'))),
    h('p', { class: 'muted' }, L({ en: 'Seven questions from units 0 to 8. Answer honestly and use the confidence slider: a confident wrong answer tells the app more than a guess.', de: 'Sieben Fragen aus den Einheiten 0 bis 8. Antworte ehrlich und nutze den Sicherheitsregler: Eine selbstsichere falsche Antwort verrät der App mehr als ein Rateversuch.' })));
  const box = h('div');
  root.append(box);
  box.append(itemRun(items, (results) => {
    const st = getState();
    const covered = new Set<number>();
    items.forEach((it, i) => { if (results[i]?.correct) covered.add(it.unit); });
    for (const u of covered) st.units[u] = { status: 'done', completedAt: today() };
    // Next unit: the first playable or lowest unit not yet covered.
    const nextUnit = [0, 1, 2, 3, 4, 5, 6].find((u) => !covered.has(u)) ?? 6;
    st.units[nextUnit] = { status: 'next' };
    st.onboarded = true;
    save();
    logSession('diagnostic');
    clear(box);
    box.append(h('div', { class: 'panel' }, h('p', null, t('diagDone')),
      h('button', { class: 'btn block', type: 'button', onclick: () => go('#/') }, L({ en: 'Show me the sky', de: 'Zeig mir den Himmel' }))));
  }, { showUnit: true }));
}
