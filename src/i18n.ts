// Language handling: every user-facing string exists in English and German.
export type Lang = 'en' | 'de';
export type Hint = 'off' | 'other';
export type Bi = { en: string; de: string };

let lang: Lang = 'en';
let hint: Hint = 'other';
const listeners = new Set<() => void>();

export function getLang(): Lang { return lang; }
export function getHint(): Hint { return hint; }
export function setLang(l: Lang) { lang = l; document.documentElement.lang = l; listeners.forEach((f) => f()); }
export function setHint(h: Hint) { hint = h; listeners.forEach((f) => f()); }
export function onLangChange(f: () => void) { listeners.add(f); return () => listeners.delete(f); }

/** Pick the current language from a bilingual pair. */
export function L(b: Bi | string): string { return typeof b === 'string' ? b : b[lang]; }
/** The other language (used for term hints). */
export function other(b: Bi): string { return lang === 'en' ? b.de : b.en; }

/** Number formatting follows the language: 104.5 vs 104,5. */
export function num(n: number, digits = 1): string {
  return n.toLocaleString(lang === 'de' ? 'de-DE' : 'en-GB', { minimumFractionDigits: digits, maximumFractionDigits: digits });
}
export function dateStr(iso: string): string {
  const d = new Date(iso + (iso.length === 10 ? 'T12:00:00' : ''));
  return d.toLocaleDateString(lang === 'de' ? 'de-DE' : 'en-GB', { day: 'numeric', month: 'short' });
}

// Interface strings. Content (units, items, glossary) carries its own pairs.
const UI: Record<string, Bi> = {
  appName: { en: 'Orbitarium', de: 'Orbitarium' },
  navSky: { en: 'Sky', de: 'Himmel' },
  navTable: { en: 'Table', de: 'Tabelle' },
  navLab: { en: 'Lab', de: 'Labor' },
  navJournal: { en: 'Journal', de: 'Journal' },
  navSettings: { en: 'Settings', de: 'Einstellungen' },
  continue: { en: 'Continue', de: 'Weiter' },
  check: { en: 'Check', de: 'Prüfen' },
  back: { en: 'Back', de: 'Zurück' },
  finish: { en: 'Finish unit', de: 'Einheit abschließen' },
  close: { en: 'Close', de: 'Schließen' },
  confidence: { en: 'How sure are you?', de: 'Wie sicher bist du?' },
  guessing: { en: 'guessing', de: 'geraten' },
  certain: { en: 'certain', de: 'sicher' },
  correct: { en: 'Right.', de: 'Richtig.' },
  wrong: { en: 'Not quite.', de: 'Nicht ganz.' },
  partly: { en: 'Partly right.', de: 'Teilweise richtig.' },
  // Home
  homeGreetingMorning: { en: 'Good morning', de: 'Guten Morgen' },
  homeGreetingDay: { en: 'Hello', de: 'Hallo' },
  homeGreetingEvening: { en: 'Good evening', de: 'Guten Abend' },
  dueLine: { en: '{n} concepts are fading and due for review.', de: '{n} Konzepte verblassen und sind fällig.' },
  dueNone: { en: 'Nothing is fading right now.', de: 'Gerade verblasst nichts.' },
  startUnit: { en: 'Start unit {n}', de: 'Einheit {n} starten' },
  resumeUnit: { en: 'Resume unit {n}', de: 'Einheit {n} fortsetzen' },
  replayUnit: { en: 'Replay unit {n}', de: 'Einheit {n} wiederholen' },
  rekindle: { en: 'Rekindle 3 fading concepts', de: '3 verblassende Konzepte auffrischen' },
  rhythmTitle: { en: 'This week', de: 'Diese Woche' },
  rhythmLine: { en: '{n} of {t} sessions', de: '{n} von {t} Sitzungen' },
  gapAlert: { en: 'It has been {d} days since your last session. A short warm-up keeps things from fading.', de: 'Deine letzte Sitzung ist {d} Tage her. Ein kurzes Aufwärmen hält das Wissen frisch.' },
  skyHelp: { en: 'Each star is a unit. Brightness shows how well you remember it today; size shows how deeply you understand it.', de: 'Jeder Stern ist eine Einheit. Die Helligkeit zeigt, wie gut du dich heute erinnerst, die Größe, wie tief du sie verstehst.' },
  notBuilt: { en: 'This unit arrives in phase {p}.', de: 'Diese Einheit kommt in Phase {p}.' },
  playable: { en: 'Playable now', de: 'Jetzt spielbar' },
  covered: { en: 'Covered', de: 'Behandelt' },
  next: { en: 'Next', de: 'Als Nächstes' },
  review: { en: 'Review due', de: 'Wiederholung fällig' },
  notStarted: { en: 'Not started', de: 'Nicht begonnen' },
  memoryNow: { en: 'Memory today', de: 'Erinnerung heute' },
  understanding: { en: 'Understanding', de: 'Verständnis' },
  // Steps
  stepWarmup: { en: 'Warm-up', de: 'Aufwärmen' },
  stepPuzzle: { en: 'Puzzle', de: 'Rätsel' },
  stepExplore: { en: 'Explore', de: 'Erkunden' },
  stepPredict: { en: 'Predict', de: 'Vorhersagen' },
  stepExamples: { en: 'Worked examples', de: 'Beispiele' },
  stepExplain: { en: 'Explain back', de: 'Erklären' },
  stepWrap: { en: 'Wrap-up', de: 'Abschluss' },
  warmupIntro: { en: 'Three questions from earlier units, picked because they are starting to fade.', de: 'Drei Fragen aus früheren Einheiten – ausgewählt, weil sie zu verblassen beginnen.' },
  exploreIntro: { en: 'Work through at least three of these. The checklist ticks itself as you go.', de: 'Bearbeite mindestens drei davon. Die Liste hakt sich von selbst ab.' },
  predictIntro: { en: 'Commit to an answer before the simulation shows you.', de: 'Lege dich fest, bevor die Simulation es zeigt.' },
  showIn3d: { en: 'Show in 3D', de: 'In 3D zeigen' },
  explainPrompt: { en: 'In your own words: what decides the shape of a molecule?', de: 'In eigenen Worten: Was bestimmt die Form eines Moleküls?' },
  explainPlaceholder: { en: 'Write two or three sentences, in English or German.', de: 'Zwei oder drei Sätze, auf Deutsch oder Englisch.' },
  explainCheck: { en: 'Check my explanation', de: 'Erklärung prüfen' },
  keyIdeas: { en: 'Key ideas', de: 'Kernideen' },
  tightened: { en: 'A tightened version', de: 'Eine geschärfte Fassung' },
  yourLast: { en: 'Your takeaway last time', de: 'Deine letzte Kernaussage' },
  saveTakeaway: { en: 'Save to journal', de: 'Im Journal speichern' },
  saved: { en: 'Saved to journal', de: 'Im Journal gespeichert' },
  tryAgain: { en: 'Revise and check again', de: 'Überarbeiten und erneut prüfen' },
  readTonight: { en: 'Read tonight', de: 'Lesestoff für heute Abend' },
  lookFor: { en: 'Three things to look for', de: 'Drei Dinge, auf die du achten kannst' },
  termPairs: { en: 'Match the terms', de: 'Begriffe zuordnen' },
  termPairsHelp: { en: 'Tap an English term, then its German partner.', de: 'Tippe einen englischen Begriff an, dann seinen deutschen Partner.' },
  summary: { en: 'What changed', de: 'Was sich verändert hat' },
  nextReview: { en: 'next review {d}', de: 'nächste Wiederholung {d}' },
  // Lab
  labTitle: { en: 'Free lab', de: 'Freies Labor' },
  labLocked: { en: 'The Molecule Workbench opens as a sandbox once unit 6 is done. The periodic table is always open under Table.', de: 'Die Molekül-Werkbank wird zur Spielwiese, sobald Einheit 6 abgeschlossen ist. Das Periodensystem ist unter Tabelle immer offen.' },
  build: { en: 'Build your own', de: 'Selbst bauen' },
  centralAtom: { en: 'Central atom', de: 'Zentralatom' },
  partners: { en: 'Partners', de: 'Bindungspartner' },
  // Journal
  journalTitle: { en: 'Journal', de: 'Journal' },
  tabTakeaways: { en: 'Takeaways', de: 'Kernaussagen' },
  tabMisconceptions: { en: 'Misconceptions', de: 'Fehlvorstellungen' },
  tabCalibration: { en: 'Calibration', de: 'Kalibrierung' },
  tabElements: { en: 'Elements', de: 'Elemente' },
  tabEquations: { en: 'Equations', de: 'Gleichungen' },
  noTakeaways: { en: 'Your takeaway sentences collect here, one per unit.', de: 'Hier sammeln sich deine Kernaussagen, eine pro Einheit.' },
  calibHelp: { en: 'Each dot compares how sure you were with how often you were right. On the line means well calibrated; below it means overconfident.', de: 'Jeder Punkt vergleicht, wie sicher du warst, mit deiner Trefferquote. Auf der Linie heißt gut kalibriert, darunter heißt zu selbstsicher.' },
  calibEmpty: { en: 'Answer a few questions with a confidence rating to see your calibration.', de: 'Beantworte ein paar Fragen mit Sicherheitsangabe, um deine Kalibrierung zu sehen.' },
  elementsHelp: { en: 'Elements light up once you have worked with them in a lesson or a simulation.', de: 'Elemente leuchten auf, sobald du in einer Lektion oder Simulation mit ihnen gearbeitet hast.' },
  spotted: { en: 'spotted', de: 'bemerkt' },
  challenged: { en: 'challenged', de: 'bearbeitet' },
  resolved: { en: 'resolved', de: 'gelöst' },
  // Settings
  settingsTitle: { en: 'Settings', de: 'Einstellungen' },
  language: { en: 'App language', de: 'App-Sprache' },
  termHints: { en: 'Term hints', de: 'Begriffshinweise' },
  hintsOff: { en: 'Off', de: 'Aus' },
  hintsOn: { en: 'Show the other language under each term', de: 'Die andere Sprache unter jedem Begriff zeigen' },
  rhythm: { en: 'Rhythm', de: 'Rhythmus' },
  weeklyTarget: { en: 'Sessions per week', de: 'Sitzungen pro Woche' },
  nudgeDays: { en: 'Nudge on these days', de: 'Erinnerung an diesen Tagen' },
  nudgeTime: { en: 'Nudge time', de: 'Uhrzeit der Erinnerung' },
  gapDays: { en: 'Gap alert after (days)', de: 'Lückenwarnung nach (Tagen)' },
  nudgeNote: { en: 'Nudges are delivered by the Android app; the browser preview only stores the settings.', de: 'Erinnerungen verschickt die Android-App; die Browser-Vorschau speichert nur die Einstellungen.' },
  progressFile: { en: 'Progress file', de: 'Fortschrittsdatei' },
  progressFileHelp: { en: 'One readable Markdown file holds everything the app knows about your progress. Export it as a backup, or import one to continue elsewhere.', de: 'Eine lesbare Markdown-Datei enthält alles, was die App über deinen Fortschritt weiß. Exportiere sie als Sicherung oder importiere eine, um woanders weiterzumachen.' },
  exportFile: { en: 'Export progress file', de: 'Fortschrittsdatei exportieren' },
  importFile: { en: 'Import progress file', de: 'Fortschrittsdatei importieren' },
  pasteFile: { en: 'Or paste the file text here', de: 'Oder den Dateitext hier einfügen' },
  importPasted: { en: 'Import pasted text', de: 'Eingefügten Text importieren' },
  imported: { en: 'Imported: {c} concepts updated, {m} misconceptions, {t} takeaways.', de: 'Importiert: {c} Konzepte aktualisiert, {m} Fehlvorstellungen, {t} Kernaussagen.' },
  importFailed: { en: 'That file could not be read: {e}', de: 'Die Datei konnte nicht gelesen werden: {e}' },
  resetAll: { en: 'Erase all progress', de: 'Gesamten Fortschritt löschen' },
  resetConfirm: { en: 'Erasing removes all progress on this device. Export a progress file first if you want to keep it.', de: 'Löschen entfernt den gesamten Fortschritt auf diesem Gerät. Exportiere vorher eine Fortschrittsdatei, wenn du ihn behalten willst.' },
  about: { en: 'Orbitarium 0.2 · units 0 and 6 are playable, units 1–45 are on the map. Element data compiled from Wikipedia via Periodic-Table-JSON.', de: 'Orbitarium 0.2 · Die Einheiten 0 und 6 sind spielbar, 1–45 stehen auf der Karte. Elementdaten aus Wikipedia über Periodic-Table-JSON.' },
  // Onboarding
  obTitle: { en: 'A planetarium for atoms', de: 'Ein Planetarium für Atome' },
  obLead: { en: 'A map of the elements and forty-five short units, each built around something you can turn, heat or pull apart. Start fresh, or bring the progress you already have.', de: 'Eine Karte der Elemente und fünfundvierzig kurze Einheiten, jede um etwas gebaut, das du drehen, erhitzen oder auseinanderziehen kannst. Fang neu an oder bring deinen bisherigen Fortschritt mit.' },
  obSeed: { en: 'Load my chat-lesson history', de: 'Meinen Stand aus den Chat-Lektionen laden' },
  obSeedSub: { en: 'Units 1–6 covered up to 23 Sep, weak spots queued', de: 'Einheiten 1–6 bis 23. Sep. behandelt, Schwachstellen vorgemerkt' },
  obFresh: { en: 'Start fresh', de: 'Neu beginnen' },
  obFreshSub: { en: 'A seven-question diagnostic places you on the map', de: 'Eine Diagnose mit sieben Fragen setzt dich auf die Karte' },
  obImport: { en: 'Import a progress file', de: 'Fortschrittsdatei importieren' },
  obImportSub: { en: 'Continue from a file you exported', de: 'Mit einer exportierten Datei weitermachen' },
  diagTitle: { en: 'Where are you starting from?', de: 'Wo stehst du gerade?' },
  diagDone: { en: 'Placed on the map. Units you answered well start as covered.', de: 'Auf die Karte gesetzt. Einheiten, die du gut beantwortet hast, gelten als behandelt.' },
};

export function t(key: string, vars: Record<string, string | number> = {}): string {
  const entry = UI[key];
  let s = entry ? entry[lang] : key;
  for (const [k, v] of Object.entries(vars)) s = s.replace(`{${k}}`, String(v));
  return s;
}
