// Home: the sky. Each unit is a star; brightness is memory today, size is understanding.
import { h, s, clear, rich, plain } from './dom';
import { L, t, dateStr, num } from '../i18n';
import { UNITS, MODULES, unitByN, moduleByN, PLAYABLE } from '../content/curriculum';
import { getState, today } from '../model/store';
import { unitMemory, unitLevel, dueConcepts, sessionsThisWeek, daysSinceLastSession, recall, nextReview, secondPassDue, warmupSize } from '../model/learner';
import { go } from '../router';

// Module anchors on a 400 × 660 sky: the map (unit 0) at the bottom, organic reactions at the top.
const ANCHORS: Record<number, [number, number]> = { 0: [304, 596], 1: [70, 560], 2: [196, 528], 3: [318, 488], 4: [92, 430], 5: [222, 392], 6: [334, 338], 7: [86, 282], 8: [214, 236], 9: [328, 170], 10: [140, 96] };

function unitPositions(): Map<number, [number, number]> {
  const pos = new Map<number, [number, number]>();
  for (const m of MODULES) {
    const units = UNITS.filter((u) => u.module === m.n);
    const [ax, ay] = ANCHORS[m.n];
    if (units.length === 1) { pos.set(units[0].n, [ax, ay]); continue; }
    units.forEach((u, i) => {
      const a = -2.4 + i * 1.1 + (m.n % 2 ? 0 : 0.5);
      const r = 18 + i * 7;
      pos.set(u.n, [ax + r * Math.cos(a), ay + r * Math.sin(a) * 0.8]);
    });
  }
  return pos;
}

function statusOf(n: number) {
  const st = getState();
  const p = st.units[n];
  if (p) return p.status;
  return 'not-started';
}

export function renderHome(root: HTMLElement, params: URLSearchParams) {
  const st = getState();
  const hour = new Date().getHours();
  const greet = hour < 11 ? t('homeGreetingMorning') : hour < 18 ? t('homeGreetingDay') : t('homeGreetingEvening');
  const due = dueConcepts();
  root.append(h('header', { class: 'greeting' },
    h('h1', null, st.learner ? `${greet}, ${st.learner}` : greet),
    h('p', { class: 'muted' }, due.length ? t('dueLine', { n: due.length, k: Math.min(due.length, warmupSize()) }) : t('dueNone'))));

  // ----- the sky -----
  const pos = unitPositions();
  const celebrate = Number(params.get('lit') || 0);
  const svg = s('svg', { class: 'sky', viewBox: '0 0 400 660', role: 'group', 'aria-label': L({ en: 'Map of all units', de: 'Karte aller Einheiten' }) }) as SVGSVGElement;
  const defs = s('defs');
  const grad = s('radialGradient', { id: 'glow' }, s('stop', { offset: '0%', 'stop-color': '#ffc15e', 'stop-opacity': '0.65' }), s('stop', { offset: '100%', 'stop-color': '#ffc15e', 'stop-opacity': '0' }));
  defs.appendChild(grad);
  svg.appendChild(defs);
  // faint background field, deterministic
  let seed = 7;
  const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
  for (let i = 0; i < 70; i++) svg.appendChild(s('circle', { cx: (rnd() * 400).toFixed(1), cy: (rnd() * 660).toFixed(1), r: (0.4 + rnd() * 0.8).toFixed(2), fill: '#9aa3bf', opacity: (0.12 + rnd() * 0.2).toFixed(2) }));
  // path between modules
  for (let m = 0; m < MODULES.length - 1; m++) {
    const last = UNITS.filter((u) => u.module === m).at(-1)!;
    const first = UNITS.find((u) => u.module === m + 1)!;
    const [x1, y1] = pos.get(last.n)!, [x2, y2] = pos.get(first.n)!;
    svg.appendChild(s('line', { x1, y1, x2, y2, stroke: '#2e3a69', 'stroke-width': 1, 'stroke-dasharray': '2 5' }));
  }
  for (const m of MODULES) {
    const units = UNITS.filter((u) => u.module === m.n);
    for (let i = 1; i < units.length; i++) {
      const [x1, y1] = pos.get(units[i - 1].n)!, [x2, y2] = pos.get(units[i].n)!;
      const lit = statusOf(units[i].n) !== 'not-started' && statusOf(units[i - 1].n) !== 'not-started';
      svg.appendChild(s('line', { x1, y1, x2, y2, stroke: lit ? '#c9c3b3' : '#2e3a69', 'stroke-width': lit ? 0.9 : 0.8, opacity: lit ? 0.55 : 1 }));
    }
    const [ax, ay] = ANCHORS[m.n];
    const label = `${m.n} · ${L(m.name)}`;
    const tw = label.length * 6.1;
    const lx = Math.min(394 - tw / 2, Math.max(6 + tw / 2, ax));
    svg.appendChild(s('text', { x: lx.toFixed(1), y: ay + (UNITS.filter((u) => u.module === m.n).length === 1 ? 28 : 46), 'text-anchor': 'middle', fill: '#9aa3bf', 'font-size': 11.5, 'font-family': 'var(--sans)' }, label));
  }
  for (const u of UNITS) {
    const [x, y] = pos.get(u.n)!;
    const status = statusOf(u.n);
    const mem = unitMemory(u.n);
    const lvl = unitLevel(u.n);
    const g = s('g', { class: 'star', tabindex: 0, role: 'button', 'aria-label': `${L({ en: 'Unit', de: 'Einheit' })} ${u.n}: ${plain(u.name)}` });
    if (mem !== null) {
      const glowR = 8 + mem * 16;
      g.appendChild(s('circle', { cx: x, cy: y, r: glowR, fill: 'url(#glow)', opacity: (0.25 + mem * 0.75).toFixed(2), class: u.n === celebrate ? 'celebrate' : '' }));
      const core = 2.4 + lvl * 1.3;
      g.appendChild(s('circle', { cx: x, cy: y, r: core, fill: '#ffe2a8', opacity: (0.35 + mem * 0.65).toFixed(2) }));
    } else {
      g.appendChild(s('circle', { cx: x, cy: y, r: status === 'next' ? 3 : 1.8, fill: '#9aa3bf', opacity: status === 'next' ? 0.9 : 0.45 }));
    }
    if (status === 'next' || (u.playable && status !== 'done')) {
      const ring = s('circle', { cx: x, cy: y, r: 9, fill: 'none', stroke: '#ffc15e', 'stroke-width': 1.2, class: 'pulse' });
      g.appendChild(ring);
    }
    if (u.playable) g.appendChild(s('circle', { cx: x, cy: y, r: 12.5, fill: 'none', stroke: '#b48cff', 'stroke-width': 1, 'stroke-dasharray': '2 3' }));
    g.appendChild(s('circle', { class: 'halo', cx: x, cy: y, r: 14, fill: 'transparent' }));
    g.addEventListener('click', () => openSheet(u.n));
    g.addEventListener('keydown', (e) => { if ((e as KeyboardEvent).key === 'Enter' || (e as KeyboardEvent).key === ' ') { e.preventDefault(); openSheet(u.n); } });
    svg.appendChild(g);
  }
  root.append(h('div', { class: 'sky-wrap' }, svg),
    h('div', { class: 'sky-legend' },
      h('span', null, h('i', { style: 'background:#ffe2a8' }), L({ en: 'bright = remembered', de: 'hell = erinnert' })),
      h('span', null, h('i', { style: 'background:transparent;box-shadow:inset 0 0 0 1.5px #ffc15e' }), L({ en: 'ring = up next', de: 'Ring = als Nächstes' })),
      h('span', null, h('i', { style: 'background:transparent;box-shadow:inset 0 0 0 1px #b48cff' }), L({ en: 'dashed = playable now', de: 'gestrichelt = jetzt spielbar' }))),
    h('p', { class: 'muted small', style: 'margin-top:6px' }, t('skyHelp')));

  // ----- today -----
  const todayBox = h('section', { class: 'today', 'aria-label': L({ en: 'Today', de: 'Heute' }) });
  const gap = daysSinceLastSession();
  if (gap !== null && gap >= st.settings.gapDays) todayBox.appendChild(h('div', { class: 'panel alert' }, h('p', null, t('gapAlert', { d: gap }))));

  // A unit that did not land comes first: a short second pass before anything new.
  const sp = secondPassDue();
  if (sp !== undefined) todayBox.appendChild(h('div', { class: 'panel second-pass' },
    h('div', { class: 'kicker' }, L({ en: 'First, a second pass', de: 'Zuerst eine zweite Runde' })),
    h('p', { style: 'margin:4px 0 10px' }, L({ en: `Less than half of unit ${sp} landed last time. Five short questions on it, about five minutes.`, de: `Von Einheit ${sp} ist letztes Mal weniger als die Hälfte angekommen. Fünf kurze Fragen dazu, etwa fünf Minuten.` })),
    h('button', { class: 'btn block', type: 'button', onclick: () => go(`#/rekindle?unit=${sp}&second=1`) }, L({ en: `Second pass: unit ${sp}`, de: `Zweite Runde: Einheit ${sp}` }))));

  // The recommended playable unit: the first one not done yet; otherwise offer replays.
  const playable = PLAYABLE();
  const pick = playable.find((n) => st.units[n]?.status !== 'done') ?? playable.at(-1)!;
  const blurb: Record<number, { en: string; de: string }> = {
    0: { en: 'About 25 minutes with the interactive periodic table: rows, columns, blocks, and a fun fact for every element. Progress is saved after every step.', de: 'Etwa 25 Minuten mit dem interaktiven Periodensystem: Zeilen, Spalten, Blöcke und eine kuriose Tatsache zu jedem Element. Gespeichert wird nach jedem Schritt.' },
    1: { en: 'About 25 minutes in the Orbital Viewer: shells, orbital clouds and the colours in hydrogen\'s light. Progress is saved after every step.', de: 'Etwa 25 Minuten im Orbital-Betrachter: Schalen, Orbitalwolken und die Farben im Licht des Wasserstoffs. Gespeichert wird nach jedem Schritt.' },
    2: { en: 'About 25 minutes with atoms drawn at their measured size: why they shrink along a row and grow down a column. Progress is saved after every step.', de: 'Etwa 25 Minuten mit Atomen in gemessener Größe: warum sie innerhalb einer Periode schrumpfen und in einer Gruppe nach unten wachsen. Gespeichert wird nach jedem Schritt.' },
    3: { en: 'About 25 minutes pulling electrons off atoms one at a time, to see where ion charges come from. Progress is saved after every step.', de: 'Etwa 25 Minuten, in denen du Atomen Elektronen einzeln abziehst und siehst, woher Ionenladungen kommen. Gespeichert wird nach jedem Schritt.' },
    4: { en: 'About 25 minutes in the Lattice Builder: make salt crystals, melt them and break them. Progress is saved after every step.', de: 'Etwa 25 Minuten im Gitterbaukasten: Salzkristalle bauen, schmelzen und zerbrechen. Gespeichert wird nach jedem Schritt.' },
    5: { en: 'About 25 minutes in the Charge Field: which atom pulls harder on a shared pair of electrons. Progress is saved after every step.', de: 'Etwa 25 Minuten im Ladungsfeld: welches Atom stärker an einem gemeinsamen Elektronenpaar zieht. Gespeichert wird nach jedem Schritt.' },
    6: { en: 'About 25 minutes, built around the Molecule Workbench. Progress is saved after every step.', de: 'Etwa 25 Minuten, gebaut um die Molekül-Werkbank. Gespeichert wird nach jedem Schritt.' },
    7: { en: 'About 25 minutes with a battery and six materials: what actually carries a current through a metal, a salt and a solution. Progress is saved after every step.', de: 'Etwa 25 Minuten mit einer Batterie und sechs Stoffen: was den Strom durch ein Metall, ein Salz und eine Lösung trägt. Gespeichert wird nach jedem Schritt.' },
    8: { en: 'About 25 minutes in the Particle Box: why some molecules with no charge at all still stick together. Progress is saved after every step.', de: 'Etwa 25 Minuten in der Teilchenbox: warum Moleküle ganz ohne Ladung trotzdem zusammenhalten. Gespeichert wird nach jedem Schritt.' },
    9: { en: 'About 25 minutes in the Particle Box: what a permanent dipole adds, and when it does not win. Progress is saved after every step.', de: 'Etwa 25 Minuten in der Teilchenbox: was ein permanenter Dipol beiträgt und wann er nicht gewinnt. Gespeichert wird nach jedem Schritt.' },
    10: { en: 'About 25 minutes joining molecules by hydrogen bonds: who can give, who can take, and why water boils at 100 °C. Progress is saved after every step.', de: 'Etwa 25 Minuten, in denen du Moleküle über Wasserstoffbrücken verbindest: wer Donor und wer Akzeptor sein kann und warum Wasser bei 100 °C siedet. Gespeichert wird nach jedem Schritt.' },
    11: { en: 'About 25 minutes with water: why ice floats, why oil stays separate and how salt disappears. Progress is saved after every step.', de: 'Etwa 25 Minuten mit Wasser: warum Eis schwimmt, warum Öl sich nicht mischt und wie Salz verschwindet. Gespeichert wird nach jedem Schritt.' },
    12: { en: 'About 25 minutes on the Zoom Ladder: how chemists count atoms by weighing them, and what a mole is. Progress is saved after every step.', de: 'Etwa 25 Minuten auf der Zoom-Leiter: wie man Atome durch Wiegen zählt und was ein Mol ist. Gespeichert wird nach jedem Schritt.' },
    13: { en: 'About 25 minutes with formulas: what the small numbers count, molar masses of compounds and which ore holds the most iron. Progress is saved after every step.', de: 'Etwa 25 Minuten mit Formeln: was die kleinen Zahlen zählen, molare Massen von Verbindungen und welches Erz das meiste Eisen enthält. Gespeichert wird nach jedem Schritt.' },
    14: { en: 'About 25 minutes balancing equations atom by atom, and why burning steel wool gets heavier. Progress is saved after every step.', de: 'Etwa 25 Minuten Reaktionsgleichungen ausgleichen, Atom für Atom, und warum verbrennende Stahlwolle schwerer wird. Gespeichert wird nach jedem Schritt.' },
    15: { en: 'About 25 minutes on which reactant runs out first, how much product you can expect and why real yields fall short. Progress is saved after every step.', de: 'Etwa 25 Minuten dazu, welches Edukt zuerst aufgebraucht ist, wie viel Produkt man erwarten kann und warum echte Ausbeuten darunter liegen. Gespeichert wird nach jedem Schritt.' },
    16: { en: 'About 25 minutes at the Lab Bench: making and diluting solutions, and why two very different drips start with as many particles as blood. Progress is saved after every step.', de: 'Etwa 25 Minuten am Labortisch: Lösungen ansetzen und verdünnen, und warum zwei sehr verschiedene Infusionen anfangs gleich viele Teilchen wie Blut enthalten. Gespeichert wird nach jedem Schritt.' },
    17: { en: 'About 25 minutes on the Energy Landscape: why burning releases energy although breaking bonds costs energy. Progress is saved after every step.', de: 'Etwa 25 Minuten in der Energielandschaft: warum Verbrennen Energie freisetzt, obwohl das Spalten von Bindungen Energie kostet. Gespeichert wird nach jedem Schritt.' },
    18: { en: 'About 25 minutes building energy cycles: how to get values nobody can measure directly. Progress is saved after every step.', de: 'Etwa 25 Minuten mit Energiekreisprozessen: wie man Werte bestimmt, die niemand direkt messen kann. Gespeichert wird nach jedem Schritt.' },
    19: { en: 'About 25 minutes in the Particle Box: why ice melts and cold packs work although they take in energy. Progress is saved after every step.', de: 'Etwa 25 Minuten in der Teilchenbox: warum Eis schmilzt und Kältepacks wirken, obwohl sie Energie aufnehmen. Gespeichert wird nach jedem Schritt.' },
    20: { en: 'About 25 minutes on free energy: why limestone must be heated before it breaks down, and what temperature changes. Progress is saved after every step.', de: 'Etwa 25 Minuten zur Freien Enthalpie: warum Kalkstein erst beim Erhitzen zerfällt und was die Temperatur ändert. Gespeichert wird nach jedem Schritt.' },
  };
  const unitLabel = (n: number) => { const p = st.units[n]; return p?.status === 'in-progress' ? t('resumeUnit', { n }) : p?.status === 'done' ? t('replayUnit', { n }) : t('startUnit', { n }); };
  const pu = unitByN(pick);
  todayBox.appendChild(h('div', { class: 'panel next-unit' },
    h('div', null,
      h('div', { class: 'kicker' }, `${L({ en: 'Unit', de: 'Einheit' })} ${pick} · ${L(moduleByN(pu.module).name)} · ${t('playable')}`),
      h('h2', null, rich(pu.name)),
      h('p', { class: 'muted small', style: 'margin:0' }, L(blurb[pick] ?? blurb[6]))),
    h('span'),
    h('button', { class: 'btn block', type: 'button', style: 'grid-column:1/-1', onclick: () => go('#/unit/' + pick) }, unitLabel(pick)),
    playable.length > 1 ? h('details', { class: 'other-units', style: 'grid-column:1/-1' },
      h('summary', null, L({ en: 'Other playable units', de: 'Weitere spielbare Einheiten' })),
      h('div', { class: 'stack', style: 'gap:8px;margin-top:8px' }, playable.filter((n) => n !== pick).map((n) => h('button', { class: 'btn ghost block small', type: 'button', onclick: () => go('#/unit/' + n) }, `${unitLabel(n)}: ${plain(unitByN(n).name)}`)))) : null));

  if (due.length) todayBox.appendChild(h('button', { class: 'btn ghost block', type: 'button', onclick: () => go('#/rekindle') }, t('rekindle', { n: warmupSize() })));

  const n = sessionsThisWeek(), target = st.settings.weeklyTarget;
  const ring = s('svg', { viewBox: '0 0 64 64', width: 64, height: 64, 'aria-hidden': 'true' });
  ring.appendChild(s('circle', { cx: 32, cy: 32, r: 26, fill: 'none', stroke: '#222d55', 'stroke-width': 7 }));
  for (let i = 0; i < target; i++) {
    const a0 = (i / target) * Math.PI * 2 - Math.PI / 2 + 0.08, a1 = ((i + 1) / target) * Math.PI * 2 - Math.PI / 2 - 0.08;
    const p0 = [32 + 26 * Math.cos(a0), 32 + 26 * Math.sin(a0)], p1 = [32 + 26 * Math.cos(a1), 32 + 26 * Math.sin(a1)];
    const large = a1 - a0 > Math.PI ? 1 : 0;
    ring.appendChild(s('path', { d: `M${p0[0]} ${p0[1]} A26 26 0 ${large} 1 ${p1[0]} ${p1[1]}`, fill: 'none', stroke: i < n ? '#ffc15e' : '#2e3a69', 'stroke-width': 7, 'stroke-linecap': 'round' }));
  }
  todayBox.appendChild(h('div', { class: 'panel rhythm' }, ring,
    h('div', null, h('h3', null, t('rhythmTitle')), h('p', { class: 'muted', style: 'margin:0' }, t('rhythmLine', { n, t: target })))));
  root.append(todayBox);
}

function openSheet(n: number) {
  const u = unitByN(n);
  const st = getState();
  const status = st.units[n]?.status ?? 'not-started';
  const mem = unitMemory(n);
  const lvl = unitLevel(n);
  const close = () => { scrim.remove(); sheet.remove(); };
  const scrim = h('div', { class: 'scrim', onclick: close });
  const statusWord = { done: t('covered'), next: t('next'), review: t('review'), 'in-progress': L({ en: 'In progress', de: 'Begonnen' }), 'not-started': t('notStarted') }[status];
  const conceptsSeen = u.concepts.filter((c) => st.concepts[c.id]);
  const sheet = h('div', { class: 'unit-sheet', role: 'dialog', 'aria-label': plain(u.name) },
    h('p', { class: 'muted small', style: 'margin:0 0 4px' }, `${L({ en: 'Unit', de: 'Einheit' })} ${n} · ${L(moduleByN(u.module).name)} · ${statusWord}`),
    h('h2', null, rich(u.name)),
    h('p', { class: 'muted small' }, `${L({ en: 'Engine', de: 'Engine' })}: ${u.engine}`),
    mem !== null ? h('div', null,
      h('div', { class: 'meter' }, h('span', null, t('memoryNow')), h('div', { class: 'bar' }, h('span', { style: `width:${Math.round(mem * 100)}%` })), h('span', null, `${Math.round(mem * 100)} %`)),
      h('div', { class: 'meter' }, h('span', null, t('understanding')), h('div', { class: 'bar u' }, h('span', { style: `width:${Math.round((lvl / 4) * 100)}%` })), h('span', null, `${num(lvl, 1)}/4`))) : null,
    conceptsSeen.length ? h('ul', { class: 'concept-list' }, conceptsSeen.map((c) => {
      const nr = nextReview(c.id);
      return h('li', null, h('span', null, rich(c.name)), h('span', null, `${Math.round(recall(c.id) * 100)} %${nr ? ' · ' + (nr <= today() ? L({ en: 'due', de: 'fällig' }) : dateStr(nr)) : ''}`));
    })) : null,
    u.playable
      ? h('button', { class: 'btn block', type: 'button', onclick: () => { close(); go('#/unit/' + n); } }, status === 'done' ? t('replayUnit', { n }) : status === 'in-progress' ? t('resumeUnit', { n }) : t('startUnit', { n }))
      : h('p', { class: 'muted' }, t('notBuilt', { p: u.phase })),
    conceptsSeen.some((c) => recall(c.id) < 0.9) && !u.playable ? h('button', { class: 'btn ghost block', type: 'button', style: 'margin-top:10px', onclick: () => { close(); go('#/rekindle?unit=' + n); } }, L({ en: 'Rekindle this unit', de: 'Diese Einheit auffrischen' })) : null,
    h('button', { class: 'link-btn', type: 'button', onclick: close, style: 'margin-top:8px' }, t('close')),
  );
  document.body.append(scrim, sheet);
  (sheet.querySelector('button') as HTMLElement)?.focus();
}

export { clear };
