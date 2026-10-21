// Router: hash routes (#/, #/unit/6, #/rekindle, #/lab, #/journal, #/settings, #/welcome).
// The current route is also kept in memory, so navigation still works where the page
// cannot change its own URL (for example inside an embedded preview).
let current = location.hash || '#/';

export function go(hash: string) {
  current = hash;
  let viaHash = false;
  try {
    if (location.hash !== hash) { location.hash = hash; viaHash = location.hash === hash; }
  } catch { /* URL changes not allowed here */ }
  if (!viaHash) window.dispatchEvent(new Event('routechange'));
}

window.addEventListener('hashchange', () => {
  current = location.hash || '#/';
  window.dispatchEvent(new Event('routechange'));
});

export function currentRoute(): { path: string[]; params: URLSearchParams } {
  const raw = current.replace(/^#/, '') || '/';
  const [p, q] = raw.split('?');
  return { path: p.split('/').filter(Boolean), params: new URLSearchParams(q ?? '') };
}
