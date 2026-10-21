// The progress file: one readable Markdown document that holds everything the app knows.
// It is both the backup format and the way progress moves between the app and chat lessons.

import { defaultState, today, type State, type ConceptState, type Level, type MisState, type UnitProgress } from './store';
import { UNITS, MISCONCEPTIONS, allConcepts } from '../content/curriculum';

const LEVEL_WORD: Record<number, string> = { 0: 'unseen', 1: 'seen', 2: 'can predict', 3: 'can explain', 4: 'can transfer' };
const WORD_LEVEL: Record<string, Level> = { unseen: 0, seen: 1, 'can predict': 2, 'can explain': 3, 'can transfer': 4 };
const STATUS_WORD: Record<string, string> = { done: 'covered', 'in-progress': 'in progress', next: 'next', review: 'review due', 'not-started': 'not started' };
const WORD_STATUS: Record<string, UnitProgress['status']> = { covered: 'done', 'in progress': 'in-progress', next: 'next', 'review due': 'review', 'not started': 'not-started' };
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function exportProgress(st: State): string {
  const name = st.learner || 'learner';
  const out: string[] = [];
  out.push('---', 'format: orbitarium-progress v1', `learner: ${name}`, `as_of: ${today()}`,
    `content_language: ${st.settings.lang}`, `term_hints: ${st.settings.hint === 'off' ? 'off' : st.settings.lang === 'en' ? 'de' : 'en'}`,
    `weekly_target: ${st.settings.weeklyTarget}`, `nudge_days: ${st.settings.nudgeDays.map((d) => DAYS[d]).join(', ')}`,
    `nudge_time: ${st.settings.nudgeTime}`, `gap_alert_days: ${st.settings.gapDays}`,
    ...(st.memScale && Math.abs(st.memScale - 1) > 0.005 ? [`memory_scale: ${st.memScale.toFixed(2)}`] : []), '---', '',
    `# Progress — ${name}`, '');

  out.push('## Units');
  for (const u of UNITS) {
    const p = st.units[u.n];
    if (!p || p.status === 'not-started') continue;
    out.push(`- ${u.n} ${u.name.en.replace(/_\{([^}]+)\}/g, '$1')}: ${STATUS_WORD[p.status]}${p.completedAt ? ' ' + p.completedAt : ''}${p.secondPass ? ' · second pass due' : ''}`);
  }
  const started = UNITS.filter((u) => st.units[u.n] && st.units[u.n].status !== 'not-started').map((u) => u.n);
  const rest = UNITS.filter((u) => !started.includes(u.n)).map((u) => u.n);
  if (rest.length) out.push(`- ${compactRange(rest)}: not started`);
  out.push('');

  out.push('## Concepts', '| Concept | Memory (days) | Difficulty | Last reviewed | Understanding |', '| --- | --- | --- | --- | --- |');
  const names = new Map(allConcepts().map((c) => [c.id, c.name.en.replace(/_\{([^}]+)\}/g, '$1')]));
  for (const [id, c] of Object.entries(st.concepts).sort(([a], [b]) => a.localeCompare(b, 'en', { numeric: true }))) {
    out.push(`| ${id} — ${names.get(id) ?? ''} | ${c.s.toFixed(1)} | ${c.d.toFixed(1)} | ${c.last} | ${LEVEL_WORD[c.level]} |`);
  }
  out.push('');

  out.push('## Misconceptions');
  for (const [id, m] of Object.entries(st.misconceptions)) {
    const name = MISCONCEPTIONS.find((x) => x.id === id)?.name.en ?? id;
    out.push(`- [${m.status}] ${id} — ${name} (since ${m.since}${m.correctDays.length ? '; right on ' + m.correctDays.join(', ') : ''})`);
  }
  if (!Object.keys(st.misconceptions).length) out.push('- none recorded');
  out.push('');

  out.push('## Takeaways');
  for (const tk of st.takeaways) {
    out.push(`- Unit ${tk.unit} (${tk.date}), yours: ${tk.text.replace(/\s+/g, ' ')}`);
    if (tk.tightened) out.push(`  tightened: ${tk.tightened.replace(/\s+/g, ' ')}`);
  }
  if (!st.takeaways.length) out.push('- none yet');
  out.push('');

  const bins = Object.entries(st.calib);
  if (bins.length) {
    out.push('## Calibration', '| Confidence | Answers | Right |', '| --- | --- | --- |');
    for (const [k, v] of bins.sort()) out.push(`| ${k}–${+k + 9} % | ${v.n} | ${v.right} |`);
    out.push('');
  }

  if (st.sessions.length) {
    out.push('## Sessions');
    for (const s of st.sessions.slice(-60)) out.push(`- ${s.date} ${s.kind}${s.unit ? ' ' + s.unit : ''}`);
    out.push('');
  }
  if (st.elements.length) out.push('## Elements met', st.elements.join(' '), '');
  if (st.history.length) out.push('## How I learn best', ...st.history, '');
  return out.join('\n');
}

function compactRange(ns: number[]): string {
  const parts: string[] = [];
  let i = 0;
  while (i < ns.length) {
    let j = i;
    while (j + 1 < ns.length && ns[j + 1] === ns[j] + 1) j++;
    parts.push(i === j ? `${ns[i]}` : `${ns[i]}–${ns[j]}`);
    i = j + 1;
  }
  return parts.join(', ');
}

export interface ParsedProgress { state: State; counts: { concepts: number; misconceptions: number; takeaways: number }; }

/** Parse a progress file. Throws with a readable message if the file is not one. */
export function parseProgress(text: string): ParsedProgress {
  const fm = /^---\n([\s\S]*?)\n---/.exec(text.replace(/\r\n/g, '\n').trimStart());
  if (!fm || !/format:\s*(orbitarium|valence)-progress/.test(fm[1])) throw new Error('missing the "format: orbitarium-progress" header');
  const st = defaultState();
  const meta: Record<string, string> = {};
  for (const line of fm[1].split('\n')) { const m = /^(\w+):\s*(.*)$/.exec(line.trim()); if (m) meta[m[1]] = m[2]; }
  st.learner = meta.learner ?? '';
  if (meta.content_language === 'de' || meta.content_language === 'en') st.settings.lang = meta.content_language;
  if (meta.term_hints) st.settings.hint = meta.term_hints === 'off' ? 'off' : 'other';
  if (meta.weekly_target) st.settings.weeklyTarget = Math.max(1, Math.min(7, +meta.weekly_target || 3));
  if (meta.nudge_days) st.settings.nudgeDays = meta.nudge_days.split(',').map((d) => DAYS.indexOf(d.trim())).filter((d) => d >= 0);
  if (meta.nudge_time && /^\d{1,2}:\d{2}$/.test(meta.nudge_time)) st.settings.nudgeTime = meta.nudge_time.padStart(5, '0');
  if (meta.gap_alert_days) st.settings.gapDays = Math.max(2, Math.min(21, +meta.gap_alert_days || 5));
  if (meta.memory_scale && +meta.memory_scale > 0) st.memScale = Math.max(0.2, Math.min(3, +meta.memory_scale));

  const sections = new Map<string, string[]>();
  let cur = '';
  for (const line of text.replace(/\r\n/g, '\n').slice(fm[0].length).split('\n')) {
    const hm = /^##\s+(.+)$/.exec(line);
    if (hm) { cur = hm[1].trim().toLowerCase(); sections.set(cur, []); continue; }
    if (cur) sections.get(cur)!.push(line);
  }

  for (const line of sections.get('units') ?? []) {
    const m = /^-\s+([\d,\s–-]+?)\s*(?:[^:\d][^:]*)?:\s*(covered|in progress|next|review due|not started)(?:\s+(\d{4}-\d{2}-\d{2}))?/i.exec(line.trim());
    if (!m) continue;
    for (const n of expandRange(m[1])) {
      const status = WORD_STATUS[m[2].toLowerCase()];
      if (status !== 'not-started') st.units[n] = { status, completedAt: m[3], secondPass: /second pass due/i.test(line) || undefined };
    }
  }
  let concepts = 0;
  for (const line of sections.get('concepts') ?? []) {
    const cells = line.split('|').map((x) => x.trim());
    if (cells.length < 6) continue;
    const id = cells[1].split(/\s+—\s+|\s+-\s+/)[0].trim();
    if (!/^u\d+\.[\w-]+$/.test(id)) continue;
    const s = parseFloat(cells[2].replace(',', '.')), d = parseFloat(cells[3].replace(',', '.'));
    const last = cells[4];
    if (!(s > 0) || !/^\d{4}-\d{2}-\d{2}$/.test(last)) continue;
    const level = WORD_LEVEL[cells[5].toLowerCase()] ?? 1;
    st.concepts[id] = { s, d: d > 0 ? d : 5, last, reps: 1, lapses: 0, level, firstSeen: last } as ConceptState;
    concepts++;
  }
  let misconceptions = 0;
  for (const line of sections.get('misconceptions') ?? []) {
    const m = /^-\s+\[(spotted|challenged|resolved)\]\s+([\w-]+)(?:.*?\(since (\d{4}-\d{2}-\d{2})(?:; right on ([\d,\s-]+))?\))?/.exec(line.trim());
    if (!m) continue;
    const correctDays = m[4] ? m[4].split(',').map((x) => x.trim()).filter(Boolean) : [];
    st.misconceptions[m[2]] = { status: m[1] as MisState['status'], since: m[3] ?? today(), correctDays };
    misconceptions++;
  }
  const tk = sections.get('takeaways') ?? [];
  for (let i = 0; i < tk.length; i++) {
    const m = /^-\s+Unit\s+(\d+)\s+\((\d{4}-\d{2}-\d{2})\)(?:,\s*yours)?:\s*(.+)$/.exec(tk[i].trim());
    if (!m) continue;
    const next = /^\s*tightened:\s*(.+)$/.exec(tk[i + 1] ?? '');
    st.takeaways.push({ unit: +m[1], date: m[2], text: m[3].trim(), tightened: next ? next[1].trim() : undefined });
  }
  for (const line of sections.get('calibration') ?? []) {
    const m = /^\|\s*(\d+)\D[^|]*\|\s*(\d+)\s*\|\s*(\d+)\s*\|/.exec(line.trim());
    if (m) st.calib[m[1]] = { n: +m[2], right: +m[3] };
  }
  for (const line of sections.get('sessions') ?? []) {
    const m = /^-\s+(\d{4}-\d{2}-\d{2})\s+(unit|rekindle|diagnostic)(?:\s+(?:unit\s+)?(\d+))?/.exec(line.trim());
    if (m) st.sessions.push({ date: m[1], kind: m[2] as 'unit', unit: m[3] ? +m[3] : undefined });
  }
  const el = (sections.get('elements met') ?? []).join(' ').trim();
  if (el) st.elements = el.split(/\s+/).filter((x) => /^[A-Z][a-z]?$/.test(x));
  st.history = (sections.get('how i learn best') ?? []).map((x) => x.trim()).filter(Boolean);
  st.onboarded = true;
  return { state: st, counts: { concepts, misconceptions, takeaways: st.takeaways.length } };
}

function expandRange(s: string): number[] {
  const out: number[] = [];
  for (const part of s.split(',')) {
    const m = /(\d+)\s*[–-]\s*(\d+)/.exec(part);
    if (m) for (let i = +m[1]; i <= +m[2]; i++) out.push(i);
    else if (/\d+/.test(part)) out.push(+part.trim());
  }
  return out;
}

/** Merge an imported file into the current state, keeping the more recent evidence per concept. */
export function mergeProgress(cur: State, inc: State, takeSettings: boolean): State {
  const next: State = JSON.parse(JSON.stringify(cur));
  if (takeSettings || !cur.onboarded) { next.settings = { ...inc.settings }; next.learner = inc.learner || cur.learner; }
  if (inc.memScale && (!next.memLog || next.memLog.length < 8)) next.memScale = inc.memScale;
  for (const [id, c] of Object.entries(inc.concepts)) {
    const mine = next.concepts[id];
    if (!mine || c.last > mine.last) next.concepts[id] = { ...c, firstSeen: mine?.firstSeen && mine.firstSeen < c.firstSeen ? mine.firstSeen : c.firstSeen, level: Math.max(c.level, mine?.level ?? 0) as Level };
  }
  for (const [id, m] of Object.entries(inc.misconceptions)) {
    const mine = next.misconceptions[id];
    if (!mine || m.since >= mine.since) next.misconceptions[id] = m;
  }
  const key = (t: { unit: number; date: string; text: string }) => `${t.unit}|${t.date}|${t.text}`;
  const have = new Set(next.takeaways.map(key));
  for (const t of inc.takeaways) if (!have.has(key(t))) next.takeaways.push(t);
  next.takeaways.sort((a, b) => a.date.localeCompare(b.date));
  for (const [k, v] of Object.entries(inc.calib)) {
    const mine = next.calib[k];
    if (!mine || v.n > mine.n) next.calib[k] = v;
  }
  const sk = (s: { date: string; kind: string; unit?: number }) => `${s.date}|${s.kind}|${s.unit ?? ''}`;
  const haveS = new Set(next.sessions.map(sk));
  for (const s of inc.sessions) if (!haveS.has(sk(s))) next.sessions.push(s);
  next.sessions.sort((a, b) => a.date.localeCompare(b.date));
  for (const [n, p] of Object.entries(inc.units)) {
    const mine = next.units[n];
    if (!mine || mine.status === 'not-started' || (mine.status !== 'done' && p.status === 'done')) next.units[n] = p;
  }
  for (const e of inc.elements) if (!next.elements.includes(e)) next.elements.push(e);
  for (const hline of inc.history) if (!next.history.includes(hline)) next.history.push(hline);
  next.onboarded = true;
  return next;
}
