import { GLOSSARY } from '../content/glossary';
import { L, getLang, getHint, other, t, type Bi } from '../i18n';

type Child = Node | string | null | undefined | false | Child[];
type Attrs = Record<string, unknown> & { class?: string; style?: string };

/** Tiny element builder: h('button', { class: 'x', onclick }, 'Label') */
export function h<K extends keyof HTMLElementTagNameMap>(tag: K, attrs: Attrs | null = null, ...children: Child[]): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  if (attrs) {
    for (const [k, v] of Object.entries(attrs)) {
      if (v === undefined || v === null || v === false) continue;
      if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v as EventListener);
      else if (k === 'class') el.className = String(v);
      else if (k === 'style') el.setAttribute('style', String(v));
      else if (k in el && typeof v !== 'string') (el as any)[k] = v;
      else el.setAttribute(k, v === true ? '' : String(v));
    }
  }
  append(el, children);
  return el;
}
function append(el: Node, children: Child[]) {
  for (const c of children) {
    if (c === null || c === undefined || c === false) continue;
    if (Array.isArray(c)) append(el, c);
    else el.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
  }
}
export function clear(el: Element) { while (el.firstChild) el.removeChild(el.firstChild); }

/** Svg element builder. */
export function s(tag: string, attrs: Record<string, string | number> = {}, ...children: (Node | string)[]): SVGElement {
  const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, String(v));
  for (const c of children) el.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
  return el;
}

/**
 * Split a formula into its body and its charge. The digit before the sign belongs to the charge when the body is
 * a single element ("Mg2+" is Mg²⁺, "O2-" is O²⁻) or already ends in a digit ("SO42-" is SO₄²⁻); otherwise it is a
 * subscript ("NH4+" is NH₄⁺).
 */
function splitCharge(formula: string): [string, string] {
  const m = /^(.*?)(\d?)([+\-−])$/.exec(formula);
  if (!m) return [formula, ''];
  const [, body, d, sign] = m;
  const sg = sign === '+' ? '+' : '−';
  if (d && (/^[A-Z][a-z]?$/.test(body) || /\d$/.test(body))) return [body, d + sg];
  return [body + d, sg];
}

/** Chemical formula: "H2O" -> H₂O with real <sub>, "NH4+" -> NH₄⁺, "Mg2+" -> Mg²⁺. */
export function chem(formula: string): HTMLElement {
  const span = h('span', { class: 'chem' });
  const [body, charge] = splitCharge(formula);
  const re = /(\d+)|([^\d]+)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(body))) {
    if (m[1]) span.appendChild(h('sub', null, m[1]));
    else span.appendChild(document.createTextNode(m[2]));
  }
  if (charge) span.appendChild(h('sup', null, charge));
  return span;
}

/** Plain-text version of a formula with unicode sub- and superscripts (for canvas labels). */
export function chemText(formula: string): string {
  const sub = '₀₁₂₃₄₅₆₇₈₉', sup: Record<string, string> = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '+': '⁺', '−': '⁻' };
  const [body, charge] = splitCharge(formula);
  return body.replace(/\d/g, (d) => sub[+d]) + charge.split('').map((c) => sup[c] ?? c).join('');
}

/**
 * Rich content: supports
 *   {{H2O}}            chemical formula
 *   [[lone-pair]]      glossary term chip (current language)
 *   [[lone-pair|pairs]] chip with custom display text
 *   **bold**
 */
export function rich(text: Bi | string, opts: { terms?: boolean } = {}): DocumentFragment {
  const str = L(text);
  const termsAsChips = opts.terms !== false;
  const frag = document.createDocumentFragment();
  const re = /\{\{([^}]+)\}\}|\[\[([^\]|]+)(?:\|([^\]]+))?\]\]|\*\*([^*]+)\*\*|_\{([^}]+)\}/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(str))) {
    if (m.index > last) frag.appendChild(document.createTextNode(str.slice(last, m.index)));
    if (m[1]) frag.appendChild(chem(m[1]));
    else if (m[2]) frag.appendChild(termsAsChips ? termChip(m[2], m[3]) : document.createTextNode(m[3] ?? (GLOSSARY[m[2]] ? L({ en: GLOSSARY[m[2]].en, de: GLOSSARY[m[2]].de }) : m[2])));
    else if (m[4]) frag.appendChild(h('strong', null, m[4]));
    else if (m[5]) frag.appendChild(h('sub', null, m[5]));
    last = m.index + m[0].length;
  }
  if (last < str.length) frag.appendChild(document.createTextNode(str.slice(last)));
  return frag;
}

export function termChip(id: string, display?: string): HTMLElement {
  const term = GLOSSARY[id];
  if (!term) return h('span', null, display ?? id);
  const pair = { en: term.en, de: term.de };
  const shown = display ?? L(pair);
  const hintOn = getHint() === 'other';
  const btn = h('button', { class: 'term' + (hintOn ? ' with-hint' : ''), type: 'button', 'aria-label': `${shown} — ${other(pair)}` },
    h('span', { class: 'term-main' }, shown),
    hintOn ? h('span', { class: 'term-hint', 'aria-hidden': 'true' }, other(pair)) : null,
  );
  btn.addEventListener('click', (e) => { e.stopPropagation(); openTermCard(id, btn); });
  return btn;
}

let openCard: HTMLElement | null = null;
function openTermCard(id: string, anchor: HTMLElement) {
  closeTermCard();
  const term = GLOSSARY[id];
  const card = h('div', { class: 'term-card', role: 'dialog', 'aria-label': L({ en: term.en, de: term.de }) },
    h('div', { class: 'term-card-names' },
      h('span', { lang: 'en' }, term.en), h('span', { class: 'term-card-sep', 'aria-hidden': 'true' }, '⇄'), h('span', { lang: 'de' }, term.de)),
    h('p', null, rich(term.def)),
    term.falseFriend ? h('p', { class: 'term-card-ff' }, rich(term.falseFriend)) : null,
    h('p', { class: 'term-card-unit' }, getLang() === 'de' ? `Eingeführt in Einheit ${term.unit}` : `Introduced in unit ${term.unit}`),
    h('button', { class: 'btn ghost small', type: 'button', onclick: closeTermCard }, t('close')),
  );
  document.body.appendChild(card);
  const r = anchor.getBoundingClientRect();
  const w = Math.min(320, window.innerWidth - 32);
  card.style.width = w + 'px';
  card.style.left = Math.max(16, Math.min(window.innerWidth - w - 16, r.left + r.width / 2 - w / 2)) + 'px';
  const below = r.bottom + 8;
  card.style.top = (below + 200 < window.innerHeight ? below : Math.max(16, r.top - 8 - card.offsetHeight)) + window.scrollY + 'px';
  openCard = card;
  setTimeout(() => document.addEventListener('click', outside), 0);
  (card.querySelector('button') as HTMLElement)?.focus({ preventScroll: true });
}
function outside(e: Event) { if (openCard && !openCard.contains(e.target as Node)) closeTermCard(); }
export function closeTermCard() {
  if (openCard) { openCard.remove(); openCard = null; document.removeEventListener('click', outside); }
}

/** Small status line that announces results to screen readers. */
export function toast(msg: string) {
  const el = h('div', { class: 'toast', role: 'status' }, msg);
  document.body.appendChild(el);
  requestAnimationFrame(() => el.classList.add('show'));
  setTimeout(() => { el.classList.remove('show'); setTimeout(() => el.remove(), 400); }, 2600);
}

/** Strip content markup for plain-text uses such as aria-labels. */
export function plain(text: Bi | string): string {
  return L(text).replace(/\{\{([^}]+)\}\}/g, '$1').replace(/\[\[[^\]|]+\|([^\]]+)\]\]/g, '$1')
    .replace(/\[\[([^\]]+)\]\]/g, (_, id) => (GLOSSARY[id] ? L({ en: GLOSSARY[id].en, de: GLOSSARY[id].de }) : id))
    .replace(/\*\*([^*]+)\*\*/g, '$1').replace(/_\{([^}]+)\}/g, '$1');
}
