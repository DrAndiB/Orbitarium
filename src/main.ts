import '@fontsource/young-serif/400.css';
import '@fontsource/atkinson-hyperlegible-next/400.css';
import '@fontsource/atkinson-hyperlegible-next/700.css';
import './styles.css';
import { h, s, clear, closeTermCard } from './ui/dom';
import { t, setLang, setHint } from './i18n';
import { getState } from './model/store';
import { currentRoute, go } from './router';
import { leaveScreen } from './ui/lifecycle';
import { renderHome } from './ui/home';
import { renderPlayer, renderRekindle } from './ui/player';
import { renderLab } from './ui/lab';
import { renderJournal } from './ui/journal';
import { renderSettings } from './ui/settings';
import { renderWelcome, renderDiagnostic } from './ui/onboarding';
import { scheduleNudges } from './platform';

const root = document.getElementById('app')!;

const ICONS: Record<string, string> = {
  sky: 'M12 3l1.8 4.6L18.5 9l-4.7 1.4L12 15l-1.8-4.6L5.5 9l4.7-1.4zM19 15l.9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9zM5 15l.7 1.5L7 17l-1.3.6L5 19l-.7-1.4L3 17l1.3-.5z',
  lab: 'M9 3h6M10 3v6l-5 9a2 2 0 001.8 3h10.4a2 2 0 001.8-3l-5-9V3M7.5 15h9',
  journal: 'M5 4h11a3 3 0 013 3v13H8a3 3 0 01-3-3zM5 17a3 3 0 013-3h11M9 8h6',
  settings: 'M4 7h10M18 7h2M4 17h4M12 17h8M14 4v6M8 14v6',
};
function icon(name: string) {
  const svg = s('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 1.8, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'aria-hidden': 'true' });
  svg.appendChild(s('path', { d: ICONS[name] }));
  return svg;
}

function nav(active: string) {
  const item = (id: string, href: string, label: string) =>
    h('a', { href, 'aria-current': active === id ? 'page' : null, onclick: (e: Event) => { e.preventDefault(); go(href); } }, icon(id), h('span', null, label));
  return h('nav', { class: 'nav', 'aria-label': 'Orbitarium' }, h('div', { class: 'nav-inner' },
    item('sky', '#/', t('navSky')), item('lab', '#/lab', t('navLab')), item('journal', '#/journal', t('navJournal')), item('settings', '#/settings', t('navSettings'))));
}

function render() {
  leaveScreen();
  closeTermCard();
  document.querySelectorAll('.unit-sheet, .scrim, body > .nav').forEach((e) => e.remove());
  clear(root);
  const st = getState();
  setLang(st.settings.lang);
  setHint(st.settings.hint);
  const { path, params } = currentRoute();
  if (!st.onboarded && path[0] !== 'welcome') { go('#/welcome'); return; }
  const top = path[0] ?? '';
  switch (top) {
    case 'welcome':
      if (path[1] === 'diagnostic') renderDiagnostic(root); else renderWelcome(root, render);
      return;
    case 'unit': renderPlayer(root, Number(path[1])); return;
    case 'rekindle': renderRekindle(root, params); return;
    case 'lab': renderLab(root); break;
    case 'journal': renderJournal(root); break;
    case 'settings': renderSettings(root, render); break;
    default: renderHome(root, params);
  }
  document.body.appendChild(nav(top || 'sky'));
}

window.addEventListener('routechange', render);
render();
const st = getState();
if (st.onboarded) scheduleNudges(st.settings, st.sessions.at(-1)?.date ?? null, st.settings.lang);
