// Settings: language, term hints, rhythm, and the progress file.
import { h, clear, toast } from './dom';
import { L, t, setLang, setHint, type Lang } from '../i18n';
import { getState, save, replaceState, defaultState, today } from '../model/store';
import { exportProgress, parseProgress, mergeProgress } from '../model/progressFile';
import { saveTextFile, scheduleNudges } from '../platform';
import { go } from '../router';

const DAY_NAMES = { en: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], de: ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'] };

export function renderSettings(root: HTMLElement, rerender: () => void) {
  const st = getState();
  const s = st.settings;
  const resched = () => { const last = st.sessions.at(-1)?.date ?? null; scheduleNudges(s, last, s.lang); };
  root.append(h('div', { class: 'topbar' }, h('h1', null, t('settingsTitle'))));

  // Language
  const langField = h('div', { class: 'field' }, h('span', { class: 'label' }, t('language')),
    h('div', { class: 'seg-choice' }, (['en', 'de'] as Lang[]).map((l) => h('button', {
      class: 'chip', type: 'button', 'aria-pressed': String(s.lang === l), lang: l,
      onclick: () => { s.lang = l; save(); setLang(l); rerender(); },
    }, l === 'en' ? 'English' : 'Deutsch'))));
  const hintField = h('div', { class: 'field' }, h('span', { class: 'label' }, t('termHints')),
    h('div', { class: 'seg-choice' },
      h('button', { class: 'chip', type: 'button', 'aria-pressed': String(s.hint === 'other'), onclick: () => { s.hint = 'other'; save(); setHint('other'); rerender(); } }, s.lang === 'en' ? 'German under English' : 'Englisch unter Deutsch'),
      h('button', { class: 'chip', type: 'button', 'aria-pressed': String(s.hint === 'off'), onclick: () => { s.hint = 'off'; save(); setHint('off'); rerender(); } }, t('hintsOff'))),
    h('p', { class: 'muted small', style: 'margin:0' }, L({ en: 'Tap any underlined term for both names, a definition and the trap between the languages.', de: 'Tippe auf einen unterstrichenen Begriff für beide Namen, eine Definition und die Falle zwischen den Sprachen.' })));

  // Rhythm
  const targetOut = h('output', null, String(s.weeklyTarget));
  const target = h('div', { class: 'field' }, h('span', { class: 'label' }, t('weeklyTarget')),
    h('div', { class: 'stepper' },
      h('button', { type: 'button', 'aria-label': '−', onclick: () => { s.weeklyTarget = Math.max(1, s.weeklyTarget - 1); targetOut.textContent = String(s.weeklyTarget); save(); } }, '−'),
      targetOut,
      h('button', { type: 'button', 'aria-label': '+', onclick: () => { s.weeklyTarget = Math.min(7, s.weeklyTarget + 1); targetOut.textContent = String(s.weeklyTarget); save(); } }, '+')));
  const days = h('div', { class: 'days', role: 'group', 'aria-label': t('nudgeDays') });
  const drawDays = () => {
    clear(days);
    DAY_NAMES[s.lang].forEach((d, i) => days.append(h('button', {
      type: 'button', 'aria-pressed': String(s.nudgeDays.includes(i)),
      onclick: () => { s.nudgeDays = s.nudgeDays.includes(i) ? s.nudgeDays.filter((x) => x !== i) : [...s.nudgeDays, i].sort(); save(); resched(); drawDays(); },
    }, d)));
  };
  drawDays();
  const time = h('input', { type: 'time', value: s.nudgeTime, 'aria-label': t('nudgeTime') }) as HTMLInputElement;
  time.addEventListener('change', () => { if (time.value) { s.nudgeTime = time.value; save(); resched(); } });
  const gapOut = h('output', null, String(s.gapDays));
  const gap = h('div', { class: 'stepper' },
    h('button', { type: 'button', 'aria-label': '−', onclick: () => { s.gapDays = Math.max(2, s.gapDays - 1); gapOut.textContent = String(s.gapDays); save(); resched(); } }, '−'),
    gapOut,
    h('button', { type: 'button', 'aria-label': '+', onclick: () => { s.gapDays = Math.min(21, s.gapDays + 1); gapOut.textContent = String(s.gapDays); save(); resched(); } }, '+'));

  // Progress file
  const fileInput = h('input', { type: 'file', accept: '.md,.markdown,.txt,text/markdown,text/plain', style: 'display:none' }) as HTMLInputElement;
  const paste = h('textarea', { placeholder: t('pasteFile'), 'aria-label': t('pasteFile'), style: 'min-height:90px' }) as HTMLTextAreaElement;
  const doImport = (text: string) => {
    try {
      const parsed = parseProgress(text);
      replaceState(mergeProgress(getState(), parsed.state, false));
      toast(t('imported', { c: parsed.counts.concepts, m: parsed.counts.misconceptions, t: parsed.counts.takeaways }));
      rerender();
    } catch (e) { toast(t('importFailed', { e: (e as Error).message })); }
  };
  fileInput.addEventListener('change', async () => { const f = fileInput.files?.[0]; if (f) doImport(await f.text()); });

  // Export: save or share the file, and also show its text so it can be copied anywhere.
  const exportBox = h('div', { class: 'stack', style: 'gap:8px', hidden: true });
  const doExport = async () => {
    const text = exportProgress(getState());
    try { await saveTextFile(`orbitarium-progress-${today()}.md`, text); } catch { /* download blocked: the text below still works */ }
    const ta = h('textarea', { readonly: true, 'aria-label': t('progressFile'), style: 'min-height:160px;font-size:13px' }, text) as HTMLTextAreaElement;
    const copy = h('button', { class: 'btn quiet block', type: 'button' }, L({ en: 'Copy the file text', de: 'Dateitext kopieren' }));
    copy.addEventListener('click', async () => {
      try { await navigator.clipboard.writeText(text); toast(L({ en: 'Copied', de: 'Kopiert' })); }
      catch { ta.focus(); ta.select(); }
    });
    exportBox.replaceChildren(ta, copy);
    exportBox.hidden = false;
  };
  let eraseArmed = false;
  const erase = h('button', { class: 'link-btn danger', type: 'button' }, t('resetAll'));
  erase.addEventListener('click', () => {
    if (!eraseArmed) { eraseArmed = true; erase.textContent = L({ en: 'Tap again to erase everything on this device', de: 'Nochmal tippen, um alles auf diesem Gerät zu löschen' }); return; }
    replaceState(defaultState()); go('#/welcome');
  });

  root.append(
    h('h3', { style: 'margin-top:8px' }, L({ en: 'Language', de: 'Sprache' })), langField, hintField,
    h('h3', { style: 'margin-top:24px' }, t('rhythm')), target,
    h('div', { class: 'field' }, h('span', { class: 'label' }, t('nudgeDays')), days),
    h('div', { class: 'field' }, h('label', null, t('nudgeTime')), time),
    h('div', { class: 'field' }, h('span', { class: 'label' }, t('gapDays')), gap, h('p', { class: 'muted small', style: 'margin:0' }, t('nudgeNote'))),
    h('h3', { style: 'margin-top:24px' }, t('progressFile')),
    h('p', { class: 'muted small' }, t('progressFileHelp')),
    h('div', { class: 'stack', style: 'gap:10px' },
      h('button', { class: 'btn block', type: 'button', onclick: doExport }, t('exportFile')), exportBox,
      h('button', { class: 'btn ghost block', type: 'button', onclick: () => fileInput.click() }, t('importFile')), fileInput,
      paste,
      h('button', { class: 'btn quiet block', type: 'button', onclick: () => { if (paste.value.trim()) doImport(paste.value); } }, t('importPasted'))),
    h('div', { class: 'field', style: 'border:0;margin-top:20px' }, h('p', { class: 'muted small', style: 'margin:0' }, t('resetConfirm')), erase),
    h('p', { class: 'muted small', style: 'margin-top:12px' }, t('about')),
  );
}
