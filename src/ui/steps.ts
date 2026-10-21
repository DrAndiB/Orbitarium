// Shared building blocks for unit steps: explain-back, wrap-up, term pairs.
import { h, rich, toast } from './dom';
import { L, t, dateStr, type Bi } from '../i18n';
import { GLOSSARY } from '../content/glossary';
import { unitByN } from '../content/curriculum';
import { getState, save, today } from '../model/store';
import { recordAnswer, nextReview, conceptState } from '../model/learner';
import { formatLabel, confidenceSlider } from './questions';
import { buzz } from '../platform';
import type { Idea } from '../content/unit06';

export interface Reading { title: Bi; source: string; url: string; lookFor: Bi[]; }

export function explainStep(body: HTMLElement, enable: () => void, unit: number, X: { prompt: Bi; ideas: Idea[]; tightened: Bi }) {
  const st = getState();
  const prev = [...st.takeaways].reverse().find((tk) => tk.unit === unit);
  const ta = h('textarea', { placeholder: t('explainPlaceholder'), 'aria-label': L(X.prompt) }) as HTMLTextAreaElement;
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
        st.takeaways.push({ unit, date: today(), text: text.trim().replace(/\s+/g, ' '), tightened: L(X.tightened) });
        save(); save$.disabled = true; save$.textContent = t('saved'); toast(t('saved'));
      });
      result.append(save$);
    }
    // Ideas named count as "can explain"; the rest are only seen again.
    const concepts = [...new Set(hits.map((x) => x.concept))];
    if (concepts.length) recordAnswer({ item: `u${unit}-explain`, concepts, correct: true, conf: conf.value(), evidence: 'explain' });
    const missed = [...new Set(X.ideas.filter((i) => !hits.includes(i)).map((i) => i.concept))].filter((x) => !concepts.includes(x));
    if (missed.length) recordAnswer({ item: `u${unit}-explain-missed`, concepts: missed, correct: false, partial: true });
    check.textContent = t('tryAgain');
    enable();
  });
  body.append(h('h2', null, t('stepExplain')), formatLabel('explain'), h('p', { class: 'q-prompt' }, rich(X.prompt)), ta, conf.el, check,
    h('div', null, h('h4', null, t('keyIdeas')), ideasList), result);
}

export function wrapStep(body: HTMLElement, enable: () => void, unit: number, terms: string[], R: Reading) {
  body.append(h('h2', null, t('stepWrap')));
  body.append(h('div', { class: 'panel' }, termPairs(terms, () => enable(), unit)));
  body.append(h('div', { class: 'panel reading' }, h('h3', null, t('readTonight')),
    h('p', { style: 'margin:6px 0' }, h('a', { href: R.url, target: '_blank', rel: 'noopener' }, L(R.title)), h('span', { class: 'muted' }, ` · ${R.source}`)),
    h('h4', { style: 'margin-top:10px' }, t('lookFor')),
    h('ol', { style: 'margin:0;padding-left:20px' }, R.lookFor.map((x) => h('li', { style: 'margin-bottom:6px' }, rich(x))))));
  const st = getState();
  const rows = unitByN(unit).concepts.filter((c) => st.concepts[c.id]).map((c) => {
    const cs = conceptState(c.id)!;
    const lvlWord = [L({ en: 'unseen', de: 'neu' }), L({ en: 'seen', de: 'gesehen' }), L({ en: 'can predict', de: 'kann vorhersagen' }), L({ en: 'can explain', de: 'kann erklären' }), L({ en: 'can transfer', de: 'kann übertragen' })][cs.level];
    const nr = nextReview(c.id);
    return h('li', null, h('span', null, rich(c.name)), h('span', { class: 'up' }, `${lvlWord} · ${t('nextReview', { d: nr ? dateStr(nr) : '–' })}`));
  });
  body.append(h('div', { class: 'panel' }, h('h3', null, t('summary')), h('ul', { class: 'summary-list' }, rows)));
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
  return h('div', { class: 'q' }, formatLabel('terms'), h('p', { class: 'q-prompt' }, t('termPairs')), h('p', { class: 'muted small' }, t('termPairsHelp')), h('div', { class: 'pairs' }, left, right), status);
}
