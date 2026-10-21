// Shared building blocks for unit steps: explore checklist, extra worked example, explain-back, wrap-up, term pairs.
import { h, rich, toast } from './dom';
import { L, t, dateStr, getLang, getHint, type Bi } from '../i18n';
import { GLOSSARY } from '../content/glossary';
import { unitByN } from '../content/curriculum';
import { getState, save, today } from '../model/store';
import { recordAnswer, nextReview, conceptState } from '../model/learner';
import { formatLabel, confidenceSlider, renderItem } from './questions';
import { buzz } from '../platform';
import type { Idea, Extra, Reading } from '../content/unit06';
import { ideaHints, looksLikeKeywordList } from '../content/ideas';
import type { Item } from '../content/items';

// ---------- explore checklist ----------

export interface Task { id: string; text: Bi; challenge?: boolean; key?: boolean; }

/**
 * The "things to try" list. Key tasks carry a badge and must be done; Continue unlocks once every key task
 * and at least three tasks in all are ticked. Bonus tasks never block.
 */
export function taskList(tasks: Task[], onReady: () => void): { el: HTMLElement; mark: (id: string) => boolean; has: (id: string) => boolean } {
  const done = new Set<string>();
  const els = new Map<string, HTMLElement>();
  let ready = false;
  const list = h('ul', { class: 'tasks' }, tasks.map((tk) => {
    const li = h('li', null, h('span', { class: 'tick', 'aria-hidden': 'true' }, '✓'),
      h('span', null,
        tk.key ? h('span', { class: 'key-badge' }, L({ en: 'key', de: 'wichtig' })) : tk.challenge ? h('span', { class: 'bonus-badge' }, L({ en: 'bonus', de: 'Bonus' })) : null,
        rich(tk.text)));
    els.set(tk.id, li);
    return li;
  }));
  const keys = tasks.filter((x) => x.key).map((x) => x.id);
  const mark = (id: string) => {
    if (done.has(id) || !els.has(id)) return false;
    done.add(id);
    els.get(id)!.classList.add('done');
    els.get(id)!.setAttribute('aria-label', L({ en: 'done', de: 'erledigt' }));
    buzz('light');
    if (!ready && keys.every((k) => done.has(k)) && done.size >= Math.min(3, tasks.length)) { ready = true; onReady(); }
    return true;
  };
  const intro = h('p', { class: 'muted small' }, keys.length
    ? L({ en: 'The ones marked key unlock Continue; the others are there if you are curious. The list ticks itself as you go.', de: 'Die als wichtig markierten schalten „Weiter“ frei, die anderen sind für Neugierige. Die Liste hakt sich von selbst ab.' })
    : t('exploreIntro'));
  return { el: h('div', null, intro, list), mark, has: (id) => done.has(id) };
}

// ---------- extra worked example after a missed prediction ----------

export function extraExample(x: Extra): HTMLElement {
  return h('article', { class: 'panel extra' },
    h('div', { class: 'q-format' }, L({ en: 'One more way to see it', de: 'Noch ein Weg, es zu sehen' })),
    h('h3', null, L(x.title)),
    h('ol', null, x.steps.map((st) => h('li', null, rich(st)))));
}

/** Optional stretch question for learners who answered the predictions right and confidently. */
export function deeperPanel(item: Item): HTMLElement {
  const box = h('div', { class: 'panel' });
  const open = h('button', { class: 'btn ghost block', type: 'button' }, L({ en: 'Go deeper: one harder question (optional)', de: 'Tiefer gehen: eine schwerere Frage (freiwillig)' }));
  open.addEventListener('click', () => { open.remove(); box.append(renderItem(item, () => undefined)); });
  box.append(open);
  return box;
}

// ---------- explain-back as a self-check ----------

export function explainStep(body: HTMLElement, enable: () => void, unit: number, X: { prompt: Bi; ideas: Idea[]; tightened: Bi }) {
  const st = getState();
  const prev = [...st.takeaways].reverse().find((tk) => tk.unit === unit);
  const ta = h('textarea', { placeholder: t('explainPlaceholder'), 'aria-label': L(X.prompt) }) as HTMLTextAreaElement;
  const conf = confidenceSlider();
  const next = h('button', { class: 'btn block', type: 'button', disabled: true }, L({ en: 'Next: check it against the key ideas', de: 'Weiter: mit den Kernideen abgleichen' }));
  ta.addEventListener('input', () => { next.disabled = ta.value.trim().length < 20; });
  const checkBox = h('div', { class: 'stack' });
  const result = h('div', { class: 'stack' });
  const ticks = new Map<string, HTMLInputElement>();
  let recorded = false;

  const compare = () => {
    const text = ta.value;
    const salad = looksLikeKeywordList(text);
    const hints = salad ? new Set<string>() : ideaHints(text, X.ideas);
    // Hints only where the learner's ticks and the text seem to disagree.
    checkBox.querySelectorAll('.hint').forEach((n) => n.remove());
    for (const idea of X.ideas) {
      const ticked = ticks.get(idea.id)!.checked, seen = hints.has(idea.id);
      const li = checkBox.querySelector(`li[data-id="${idea.id}"]`)!;
      if (ticked && !seen) li.append(h('span', { class: 'hint' }, L({ en: 'I can\'t spot this in your words. Is it really there, or only in your head?', de: 'Das finde ich in deinem Text nicht. Steht es wirklich da oder nur im Kopf?' })));
      if (!ticked && seen) li.append(h('span', { class: 'hint' }, L({ en: 'Your text may already say this.', de: 'Dein Text sagt das vielleicht schon.' })));
    }
    const tickedIdeas = X.ideas.filter((i) => ticks.get(i.id)!.checked);
    result.replaceChildren(
      salad ? h('div', { class: 'feedback part' }, h('strong', { class: 'verdict' }, L({ en: 'This reads like a list of keywords.', de: 'Das liest sich wie eine Liste von Stichwörtern.' })),
        h('div', null, L({ en: 'Try it in full sentences: saying how the ideas connect is what makes them stick.', de: 'Versuch es in ganzen Sätzen: Erst wer sagt, wie die Ideen zusammenhängen, behält sie.' }))) : '',
      h('div', { class: 'feedback' + (tickedIdeas.length >= 3 ? '' : ' part') }, h('strong', { class: 'verdict' },
        L({ en: `You ticked ${tickedIdeas.length} of ${X.ideas.length} key ideas.`, de: `Du hast ${tickedIdeas.length} von ${X.ideas.length} Kernideen abgehakt.` })),
        h('div', null, L({ en: 'Now compare with a tightened version. If something is missing, revise your text: the version you save is the one you will see again.', de: 'Vergleiche jetzt mit einer geschärften Fassung. Fehlt etwas, überarbeite deinen Text: Die gespeicherte Fassung ist die, die du wiedersiehst.' }))),
      h('h3', null, t('tightened')), h('blockquote', { class: 'quote' }, rich(X.tightened)),
    );
    if (prev) result.append(h('div', null, h('h4', null, `${t('yourLast')} (${dateStr(prev.date)})`), h('blockquote', { class: 'quote', style: 'border-color:var(--fog)' }, prev.text)));
    const revise = h('button', { class: 'btn ghost block', type: 'button' }, t('tryAgain'));
    revise.addEventListener('click', () => { ta.focus(); ta.scrollIntoView({ behavior: 'smooth', block: 'center' }); });
    const save$ = h('button', { class: 'btn quiet block', type: 'button' }, t('saveTakeaway'));
    save$.addEventListener('click', () => {
      st.takeaways.push({ unit, date: today(), text: ta.value.trim().replace(/\s+/g, ' '), tightened: L(X.tightened) });
      save(); save$.disabled = true; save$.textContent = t('saved'); toast(t('saved'));
    });
    result.append(revise, save$);
    // The self-check feeds memory only. "Can explain" is earned later, by explanation questions on another day.
    if (!recorded) {
      recorded = true;
      const covered = [...new Set(tickedIdeas.map((x) => x.concept))];
      if (covered.length) recordAnswer({ item: `u${unit}-explain`, concepts: covered, correct: true, conf: conf.value(), evidence: 'seen' });
      const missed = [...new Set(X.ideas.filter((i) => !tickedIdeas.includes(i)).map((i) => i.concept))].filter((x) => !covered.includes(x));
      if (missed.length) recordAnswer({ item: `u${unit}-explain-missed`, concepts: missed, correct: false, partial: true });
    }
    enable();
  };

  next.addEventListener('click', () => {
    next.remove(); conf.el.remove();
    const cmp = h('button', { class: 'btn block', type: 'button' }, L({ en: 'Compare with a tightened version', de: 'Mit einer geschärften Fassung vergleichen' }));
    cmp.addEventListener('click', () => { compare(); cmp.textContent = L({ en: 'Compare again', de: 'Erneut vergleichen' }); });
    checkBox.replaceChildren(
      h('h4', null, L({ en: 'Tick each idea your text really states', de: 'Hake jede Idee ab, die dein Text wirklich enthält' })),
      h('p', { class: 'muted small', style: 'margin:0' }, L({ en: 'Be strict with yourself: only what is written, not what you meant.', de: 'Sei streng mit dir: nur was dasteht, nicht was du gemeint hast.' })),
      h('ul', { class: 'selfcheck' }, X.ideas.map((i) => {
        const cb = h('input', { type: 'checkbox', 'aria-label': L(i.idea) }) as HTMLInputElement;
        ticks.set(i.id, cb);
        return h('li', { 'data-id': i.id }, cb, h('span', null, rich(i.idea)));
      })),
      cmp);
  });
  body.append(h('h2', null, t('stepExplain')), formatLabel('explain'), h('p', { class: 'q-prompt' }, rich(X.prompt)), ta, conf.el, next, checkBox, result);
}

// ---------- wrap-up ----------

export function wrapStep(body: HTMLElement, enable: () => void, unit: number, terms: string[], readings: Reading[]) {
  body.append(h('h2', null, t('stepWrap')));
  const st = getState();
  const rows = unitByN(unit).concepts.filter((c) => st.concepts[c.id]).map((c) => {
    const cs = conceptState(c.id)!;
    const lvlWord = [L({ en: 'unseen', de: 'neu' }), L({ en: 'seen', de: 'gesehen' }), L({ en: 'can predict', de: 'kann vorhersagen' }), L({ en: 'can explain', de: 'kann erklären' }), L({ en: 'can transfer', de: 'kann übertragen' })][cs.level];
    const nr = nextReview(c.id);
    return h('li', null, h('span', null, rich(c.name)), h('span', { class: 'up' }, `${lvlWord} · ${t('nextReview', { d: nr ? dateStr(nr) : '–' })}`));
  });
  body.append(h('div', { class: 'panel' }, h('h3', null, t('summary')), h('ul', { class: 'summary-list' }, rows),
    h('p', { class: 'muted small', style: 'margin:10px 0 0' }, L({ en: '"Can explain" and "can transfer" are earned on later days, in warm-ups: understanding that lasts a day is not yet understanding.', de: '„Kann erklären“ und „kann übertragen“ erreichst du an späteren Tagen, in den Aufwärmrunden: Verständnis, das nur einen Tag hält, ist noch keins.' }))));
  const lang = getLang();
  const mine = readings.filter((r) => r.lang === lang);
  if (mine.length) {
    body.append(h('div', { class: 'panel reading' }, h('h3', null, t('readTonight')),
      ...mine.map((R) => h('div', { style: 'margin-top:8px' },
        h('p', { style: 'margin:6px 0' }, R.kind ? h('span', { class: 'muted small' }, (R.kind === 'quick' ? L({ en: 'Quick read', de: 'Kurz' }) : L({ en: 'Deeper', de: 'Vertiefend' })) + ' · ') : null,
          h('a', { href: R.url, target: '_blank', rel: 'noopener' }, L(R.title)), h('span', { class: 'muted' }, ` · ${R.source}`)),
        h('h4', { style: 'margin-top:8px' }, t('lookFor')),
        h('ol', { style: 'margin:0;padding-left:20px' }, R.lookFor.map((x) => h('li', { style: 'margin-bottom:6px' }, rich(x))))))));
  }
  // Term pairs only for learners who use both languages; they never block finishing.
  if (getHint() === 'other') body.append(h('div', { class: 'panel' }, termPairs(terms, () => undefined, unit)));
  enable();
}

export function termPairs(ids: string[], onDone: () => void, unit: number): HTMLElement {
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
          recordAnswer({ item: `u${unit}-terms`, concepts: [], correct: misses === 0, partial: misses > 0 });
          onDone();
        }
      } else { misses++; b.classList.add('shake'); setTimeout(() => b.classList.remove('shake'), 350); buzz('medium'); }
    });
    right.append(b);
  }
  return h('div', { class: 'q' }, formatLabel('terms'), h('p', { class: 'q-prompt' }, t('termPairs')), h('p', { class: 'muted small' }, L({ en: 'Optional. ', de: 'Freiwillig. ' }) + t('termPairsHelp')), h('div', { class: 'pairs' }, left, right), status);
}
