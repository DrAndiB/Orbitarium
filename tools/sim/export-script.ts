// Export units 0 and 6 as a readable "student script" (questions without answers) plus a
// separate feedback key, in English or German, for persona walkthroughs.
// Usage: npx tsx tools/sim/export-script.ts en|de <outdir>
import { writeFileSync } from 'node:fs';
import { UNIT0 } from '../../src/content/unit00';
import { UNIT6 } from '../../src/content/unit06';
import { BANK, itemById, type Item } from '../../src/content/items';
import { GLOSSARY } from '../../src/content/glossary';
import type { Bi } from '../../src/i18n';

const lang = (process.argv[2] ?? 'en') as 'en' | 'de';
const out = process.argv[3] ?? '.';
const L = (b: Bi | string) => (typeof b === 'string' ? b : b[lang]);
const plain = (b: Bi | string) => L(b)
  .replace(/\{\{([^}]+)\}\}/g, (_, f) => f.replace(/(\d+)/g, (d: string) => '₀₁₂₃₄₅₆₇₈₉'.split('').filter((_, i) => String(i) === d).join('') || d).replace(/\d/g, (d: string) => '₀₁₂₃₄₅₆₇₈₉'[+d]))
  .replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, '$2')
  .replace(/\[\[([^\]]+)\]\]/g, (_, id) => (GLOSSARY[id] ? `${L({ en: GLOSSARY[id].en, de: GLOSSARY[id].de })} (${lang === 'en' ? GLOSSARY[id].de : GLOSSARY[id].en})` : id))
  .replace(/_\{([^}]+)\}/g, '_$1').replace(/\*\*([^*]+)\*\*/g, '$1');
const T = (en: string, de: string) => (lang === 'en' ? en : de);
const letters = 'ABCDEFG';

const q: string[] = [];   // student script
const k: string[] = [];   // feedback key

function question(it: Item, label: string) {
  q.push(`\n**[${it.id}] ${label}** ${plain(it.prompt)}`);
  if (it.table) q.push(T(`(A "Look it up in the table" button is shown: the full periodic table with the "${it.table}" view is available.)`, `(Ein Knopf „Im Periodensystem nachsehen“ ist da: das ganze Periodensystem mit der Ansicht „${it.table}“ ist verfügbar.)`));
  if (it.kind === 'choice') {
    it.options.forEach((o, i) => q.push(`  ${letters[i]}. ${plain(o.text)}`));
    if (it.withConfidence) q.push(T('  Confidence slider: 50 % (guessing) to 100 % (certain).', '  Sicherheitsregler: 50 % (geraten) bis 100 % (sicher).'));
    const ci = it.options.findIndex((o) => o.correct);
    k.push(`- [${it.id}] ${T('Correct', 'Richtig')}: ${letters[ci]}. ${plain(it.explain)}${it.options.some((o) => o.mis) ? ' ' + T('Wrong options that reveal a known trap', 'Falsche Optionen mit bekannter Falle') + ': ' + it.options.map((o, i) => (o.mis ? letters[i] : '')).filter(Boolean).join(', ') + T(' (the app adds: "This is a known trap … It goes into your misconception ledger.")', ' (die App ergänzt: „Das ist eine bekannte Falle … Sie kommt in deine Liste der Fehlvorstellungen.“)') : ''}`);
  } else if (it.kind === 'rank') {
    const shuffled = it.order.map((o, i) => ({ o, i })).sort((a, b) => ((a.i * 7 + 3) % it.order.length) - ((b.i * 7 + 3) % it.order.length));
    q.push(T('  Put in order (drag rows). Items shown: ', '  In Reihenfolge bringen (Zeilen ziehen). Angezeigt: ') + shuffled.map((x) => plain(x.o)).join(', '));
    k.push(`- [${it.id}] ${T('Correct order', 'Richtige Reihenfolge')}: ${it.order.map(plain).join(' > ')}. ${plain(it.explain)} ${T('Half or more in place counts as partly right.', 'Mindestens die Hälfte richtig zählt als teilweise richtig.')}`);
  } else if (it.kind === 'estimate') {
    q.push(T(`  Slider from ${it.min} to ${it.max}${it.suffix} in steps of ${it.step}.`, `  Regler von ${it.min} bis ${it.max}${it.suffix} in Schritten von ${it.step}.`));
    k.push(`- [${it.id}] ${T('Answer', 'Lösung')}: ${it.answer}${it.suffix} (${T('counts as right within', 'richtig innerhalb')} ±${it.tolerance}). ${plain(it.explain)}`);
  } else if (it.kind === 'flaw') {
    it.lines.forEach((l, i) => q.push(`  ${i + 1}. ${plain(l)}`));
    k.push(`- [${it.id}] ${T('Flawed step', 'Fehlerhafter Schritt')}: ${it.flaw + 1}. ${plain(it.explain)}`);
  }
}
const H = (s: string) => q.push(`\n## ${s}\n`);
const P = (s: string) => q.push(s);

// ---------------- UNIT 0 ----------------
q.push(T('# Orbitarium — student script for units 0 and 6\n\nThis is what the app shows, step by step. Simulations are described in words. Answer each question before reading the feedback key.',
  '# Orbitarium – Ablauf für Lernende, Einheiten 0 und 6\n\nSo zeigt es die App, Schritt für Schritt. Simulationen sind in Worten beschrieben. Beantworte jede Frage, bevor du im Feedback-Schlüssel nachsiehst.'));
q.push(`\n# ${T('Unit 0', 'Einheit 0')}: ${L(UNIT0.title)}\n\n${plain(UNIT0.lead)}`);
H(T('Step 1 of 7 · Warm-up (what you already know)', 'Schritt 1 von 7 · Aufwärmen (was du schon weißt)'));
P(plain(UNIT0.warmupIntro));
['u0a', 'u0b', 'u0c'].forEach((id, i) => question(itemById(id)!, T(`Question ${i + 1} of 3.`, `Frage ${i + 1} von 3.`)));
H(T('Step 2 of 7 · Puzzle', 'Schritt 2 von 7 · Rätsel'));
P(`### ${L(UNIT0.puzzle.title)}\n${plain(UNIT0.puzzle.lead)}`);
P(T('A card shows period 4 as known in 1871 (atomic mass in u): ', 'Eine Karte zeigt Periode 4, Stand 1871 (Atommasse in u): ') + UNIT0.puzzle.row.map((x, i) => (i === 2 ? '[ ? highlighted ]' : `${x.s} ${x.m ?? '?'}`)).join(' | '));
P(T('Its column, group 14: ', 'Seine Spalte, Gruppe 14: ') + UNIT0.puzzle.column.map((x, i) => (i === 2 ? '[ ? highlighted ]' : `${x.s} ${x.m ?? '?'}`)).join(' | '));
P(plain(UNIT0.puzzle.clash));
question(UNIT0.puzzle.item, '');
k.push(`- ${T('After the puzzle the app adds', 'Nach dem Rätsel ergänzt die App')}: ${plain(UNIT0.puzzle.after)}`);
H(T('Step 3 of 7 · Explore the map', 'Schritt 3 von 7 · Die Karte erkunden'));
P(plain(UNIT0.explore.intro));
P(T(`The interactive periodic table: 118 cells coloured by the chosen view. Views: Families, Shells (rows), Outer electrons (columns), Blocks s p d f, Atomic mass, Electronegativity, Atom size, Ionization energy, Typical ion. Each view colours the cells and prints the value in each cell when zoomed; a legend explains the view. Tapping an element opens a card: big symbol, English and German name, family, period, group, block, shells (e.g. 2 · 8 · 7), typical ion, atomic mass ("isotope average"), electronegativity, atom size, 1st ionization energy, state at room temperature with melting/boiling point, electron configuration, for some elements "Why the symbol is …" (e.g. K from Kalium), and one fun fact. A "3D landscape" button turns the table into columns whose height is the value. Search by name, symbol or number. On a phone the whole table fits the width with small cells (symbols only); "Zoom in" makes it scroll sideways with bigger cells.`,
  `Das interaktive Periodensystem: 118 Felder, gefärbt nach der gewählten Ansicht. Ansichten: Familien, Schalen (Zeilen), Außenelektronen (Spalten), Blöcke s p d f, Atommasse, Elektronegativität, Atomgröße, Ionisierungsenergie, Typisches Ion. Jede Ansicht färbt die Felder und zeigt im vergrößerten Modus den Wert; eine Legende erklärt die Ansicht. Antippen öffnet eine Karte: großes Symbol, deutscher und englischer Name, Familie, Periode, Gruppe, Block, Schalen (z. B. 2 · 8 · 7), typisches Ion, Atommasse („Isotopen-Mittelwert“), Elektronegativität, Atomgröße, 1. Ionisierungsenergie, Zustand bei Raumtemperatur mit Schmelz-/Siedepunkt, Elektronenkonfiguration, bei manchen Elementen „Warum das Symbol … heißt“ (z. B. K von Kalium) und eine kuriose Tatsache. „3D-Landschaft“ macht aus dem Periodensystem Säulen, deren Höhe der Wert ist. Suche nach Name, Symbol oder Nummer. Auf dem Handy passt das ganze Periodensystem in die Breite mit kleinen Feldern (nur Symbole); „Vergrößern“ macht es seitlich scrollbar mit größeren Feldern.`));
P(T('Things to try (the checklist ticks itself; after three ticks a quick check question appears and Continue unlocks):', 'Zum Ausprobieren (die Liste hakt sich selbst ab; nach drei Haken erscheint eine Kontrollfrage und „Weiter“ wird frei):'));
UNIT0.explore.tasks.forEach((t) => P(`- ${plain(t.text)}`));
k.push(`- ${T('Explore challenge, when found', 'Erkunden-Herausforderung, wenn gefunden')}: ${plain(UNIT0.explore.orderFound)}`);
question(itemById('u0h')!, T('Quick check.', 'Kurzer Check.'));
H(T('Step 4 of 7 · Predict', 'Schritt 4 von 7 · Vorhersagen'));
P(T('Commit to an answer before the simulation shows you.', 'Lege dich fest, bevor die Simulation es zeigt.'));
UNIT0.predictions.forEach((p, i) => { question(p.item, T(`Prediction ${i + 1}.`, `Vorhersage ${i + 1}.`)); k.push(`- ${T('Reveal', 'Auflösung')} [${p.item.id}]: ${T('the table opens with the', 'das Periodensystem öffnet sich mit der Ansicht')} "${p.overlay}" ${T('view and element', 'und Element')} ${p.select} ${T('selected', 'ausgewählt')}. ${plain(p.revealText)}`); });
H(T('Step 5 of 7 · Reading a cell', 'Schritt 5 von 7 · Eine Zelle lesen'));
UNIT0.examples.forEach((ex) => { P(`\n**${L(ex.title)}**`); ex.steps.forEach((s, i) => P(`  ${i + 1}. ${plain(s)}`)); P(`  ${plain(ex.soWhat)}`); });
P(`\n**[${UNIT0.locate.id}] ${T('Find it on the map', 'Auf der Karte finden')}:** ${plain(UNIT0.locate.prompt)} ${T('(Tap one cell on the table, then Check. The table can show Families, Shells or Outer electrons.)', '(Ein Feld antippen, dann Prüfen. Das Periodensystem kann Familien, Schalen oder Außenelektronen zeigen.)')}`);
k.push(`- [${UNIT0.locate.id}] ${T('Answer: phosphorus, Z = 15.', 'Lösung: Phosphor, Z = 15.')} ${plain(UNIT0.locate.explain)}`);
question(UNIT0.flaw, T('Spot the flaw.', 'Finde den Fehler.'));
H(T('Step 6 of 7 · Explain back', 'Schritt 6 von 7 · Erklären'));
P(`${plain(UNIT0.explain.prompt)}\n${T('A text box (English or German), a confidence slider, then "Check my explanation". The app then marks which of these key ideas your text covered (filled circle = found), shows a tightened version, and offers "Save to journal". You can revise and check again.', 'Ein Textfeld (Deutsch oder Englisch), ein Sicherheitsregler, dann „Erklärung prüfen“. Die App markiert, welche Kernideen dein Text enthält (gefüllter Kreis = gefunden), zeigt eine geschärfte Fassung und bietet „Im Journal speichern“ an. Du kannst überarbeiten und erneut prüfen.')}`);
P(T('Key ideas list shown under the box (all open circles before you check):', 'Liste der Kernideen unter dem Feld (vor dem Prüfen alle offen):'));
UNIT0.explain.ideas.forEach((i) => P(`  ○ ${plain(i.idea)}`));
k.push(`- ${T('Tightened version shown after checking (unit 0)', 'Geschärfte Fassung nach dem Prüfen (Einheit 0)')}: ${plain(UNIT0.explain.tightened)}`);
H(T('Step 7 of 7 · Wrap-up', 'Schritt 7 von 7 · Abschluss'));
P(T('Term pairs: tap an English term, then its German partner: ', 'Begriffspaare: Tippe einen englischen Begriff, dann seinen deutschen Partner: ') + UNIT0.terms.map((id) => GLOSSARY[id].en).join(', ') + ' ↔ ' + [...UNIT0.terms].reverse().map((id) => GLOSSARY[id].de).join(', '));
P(`${T('Read tonight', 'Lesestoff für heute Abend')}: ${L(UNIT0.reading.title)} (${UNIT0.reading.source}). ${T('Three things to look for', 'Drei Dinge, auf die du achten kannst')}: ${UNIT0.reading.lookFor.map(plain).join(' / ')}`);
P(T('Then a summary of each concept: level reached (seen / can predict / can explain / can transfer) and next review date. "Finish unit" returns to the sky map, where the unit\'s star lights up.', 'Dann eine Übersicht je Konzept: erreichte Stufe (gesehen / kann vorhersagen / kann erklären / kann übertragen) und nächstes Wiederholungsdatum. „Einheit abschließen“ führt zurück zur Himmelskarte, wo der Stern der Einheit aufleuchtet.'));

// ---------------- UNIT 6 ----------------
q.push(`\n\n# ${T('Unit 6', 'Einheit 6')}: ${L(UNIT6.title)}\n\n${plain(UNIT6.lead)}`);
q.push(T('\n(In between, units 1–5 on atoms and bonding would have been taught: shells, Z_eff, ionization, ionic and covalent bonds, electronegativity.)', '\n(Dazwischen wären die Einheiten 1–5 zu Atomen und Bindungen gelaufen: Schalen, Z_eff, Ionisierung, Ionen- und Atombindung, Elektronegativität.)'));
H(T('Step 1 of 7 · Warm-up', 'Schritt 1 von 7 · Aufwärmen'));
P(T('Three questions from earlier units, picked because they are starting to fade.', 'Drei Fragen aus früheren Einheiten – ausgewählt, weil sie zu verblassen beginnen.'));
['i2b', 'i3a', 'i5b'].forEach((id, i) => question(itemById(id)!, T(`Question ${i + 1} of 3 (unit ${itemById(id)!.unit}).`, `Frage ${i + 1} von 3 (Einheit ${itemById(id)!.unit}).`)));
H(T('Step 2 of 7 · Puzzle', 'Schritt 2 von 7 · Rätsel'));
P(`### ${T("Why isn't ammonia flat?", 'Warum ist Ammoniak nicht flach?')}\n${plain(UNIT6.puzzle.lead)}`);
P(T('Table: ', 'Tabelle: ') + UNIT6.puzzle.rows.map((r) => `${r.f.replace(/(\d)/g, (d) => '₀₁₂₃₄₅₆₇₈₉'[+d])} — ${r.bonds} ${T('bonds', 'Bindungen')} — ${r.angle}`).join(' | '));
P(plain(UNIT6.puzzle.clash));
question(UNIT6.puzzle.question, '');
H(T('Step 3 of 7 · Explore: the Molecule Workbench', 'Schritt 3 von 7 · Erkunden: die Molekül-Werkbank'));
P(T(`A rotating 3D molecule. Electron pairs push on each other until they settle; the screen shows the formula, the shape name (e.g. "trigonal pyramidal"), the live bond angle and the measured value. Lone pairs are violet lobes with two dots. Buttons load CH₄, NH₃, H₂O, NH₄⁺, CO₂, BF₃. Switches: Show lone pairs; Show polarity (bond halves turn blue at the δ− end and red at the δ+ end, and an arrow shows the net dipole, or a ring if the pulls cancel); "Wrong model: lone pairs take no space" (NH₃ goes flat to 120°, H₂O straight to 180°, and the measured value turns red). A slider "lone-pair push" λ from 1.0 to 2.0 (default 1.25) with the formula E = Σ w/r², w = λ² (lone–lone), λ (lone–bond), 1 (bond–bond): at λ = 1.0 every four-pair molecule gives 109.5°. Simulated values at λ = 1.25: CH₄ 109.5°, NH₃ 107.1° (measured 107°), H₂O 105.0° (measured 104.5°), BF₃ 120°, CO₂ 180°. A builder lets you pick a central atom (C, N, O, B, P, S) and four partner slots cycling H, F, Cl, =O; the lone pairs follow from the octet. A fold-out "What this model leaves out" explains that atom size is ignored (PCl₃ measures 100°, H₂S 92°).`,
  `Ein sich drehendes 3D-Molekül. Elektronenpaare drücken aufeinander, bis sie zur Ruhe kommen; angezeigt werden Formel, Name der Gestalt (z. B. „trigonal-pyramidal“), der aktuelle Bindungswinkel und der gemessene Wert. Freie Paare sind violette Keulen mit zwei Punkten. Knöpfe laden CH₄, NH₃, H₂O, NH₄⁺, CO₂, BF₃. Schalter: Freie Paare zeigen; Polarität zeigen (Bindungshälften werden am δ−-Ende blau, am δ+-Ende rot, ein Pfeil zeigt den Gesamtdipol oder ein Ring, wenn sich die Züge aufheben); „Falsches Modell: freie Paare brauchen keinen Platz“ (NH₃ wird flach mit 120°, H₂O gerade mit 180°, der Messwert wird rot). Ein Regler „Schub der freien Paare“ λ von 1,0 bis 2,0 (Standard 1,25) mit der Formel E = Σ w/r², w = λ² (frei–frei), λ (frei–Bindung), 1 (Bindung–Bindung): Bei λ = 1,0 ergibt jedes Molekül mit vier Paaren 109,5°. Simulierte Werte bei λ = 1,25: CH₄ 109,5°, NH₃ 107,1° (gemessen 107°), H₂O 105,0° (gemessen 104,5°), BF₃ 120°, CO₂ 180°. Ein Baukasten erlaubt ein Zentralatom (C, N, O, B, P, S) und vier Partnerfelder, die H, F, Cl, =O durchschalten; die freien Paare folgen aus dem Oktett. Ein Ausklapptext „Was dieses Modell weglässt“ erklärt, dass die Atomgröße fehlt (PCl₃ misst 100°, H₂S 92°).`));
P(T('Things to try (auto-ticking; after three, a quick check appears):', 'Zum Ausprobieren (hakt sich selbst ab; nach drei erscheint ein Kurz-Check):'));
UNIT6.explore.tasks.forEach((t) => P(`- ${plain(t.text)}`));
k.push(`- ${T('Note after the λ task', 'Hinweis nach der λ-Aufgabe')}: ${plain(UNIT6.explore.lambdaNote)}`);
question(UNIT6.explore.rank, T('Quick check.', 'Kurzer Check.'));
H(T('Step 4 of 7 · Predict', 'Schritt 4 von 7 · Vorhersagen'));
UNIT6.predictions.forEach((p, i) => { question(p.item, T(`Prediction ${i + 1}.`, `Vorhersage ${i + 1}.`)); k.push(`- ${T('Reveal', 'Auflösung')} [${p.item.id}]: ${T('the workbench loads', 'die Werkbank lädt')} ${p.reveal}${p.dipole ? T(' with polarity on', ' mit Polarität') : ''}. ${plain(p.revealText)}`); });
H(T('Step 5 of 7 · Worked examples', 'Schritt 5 von 7 · Beispiele'));
UNIT6.examples.forEach((ex) => { P(`\n**${L(ex.title)}** — ${ex.numbers.map((n) => `${n.v} ${L(n.label)}`).join(', ')}`); P(`  ${plain(ex.body)}`); P(`  ${plain(ex.soWhat)}`); });
P(`\n**[u6-draw] ${T('Draw on it', 'Einzeichnen')}:** ${plain(UNIT6.draw.prompt)} ${T('(A water molecule drawn with O at the top, two H below-left and below-right, two violet lone-pair lobes above O. An arrow can be rotated freely; answer with a direction, e.g. "up", "down-left", in degrees or words.)', '(Ein Wassermolekül: O oben, zwei H unten links und unten rechts, zwei violette freie Paare über O. Ein Pfeil lässt sich frei drehen; antworte mit einer Richtung, z. B. „nach oben“, „nach unten links“, in Grad oder Worten.)')}`);
k.push(`- [u6-draw] ${T('Correct: pointing up (towards O and its lone pairs), within 25°.', 'Richtig: nach oben (zum O und seinen freien Paaren), innerhalb von 25°.')} ${T('Right', 'Richtig')}: ${plain(UNIT6.draw.right)} ${T('Wrong', 'Falsch')}: ${plain(UNIT6.draw.wrong)}`);
question(UNIT6.flaw, T('Spot the flaw.', 'Finde den Fehler.'));
H(T('Step 6 of 7 · Explain back', 'Schritt 6 von 7 · Erklären'));
P(plain(UNIT6.explain.prompt));
UNIT6.explain.ideas.forEach((i) => P(`  ○ ${plain(i.idea)}`));
k.push(`- ${T('Tightened version shown after checking (unit 6)', 'Geschärfte Fassung nach dem Prüfen (Einheit 6)')}: ${plain(UNIT6.explain.tightened)}`);
H(T('Step 7 of 7 · Wrap-up', 'Schritt 7 von 7 · Abschluss'));
P(T('Term pairs: ', 'Begriffspaare: ') + UNIT6.terms.map((id) => `${GLOSSARY[id].en} ↔ ${GLOSSARY[id].de}`).join('; ') + T(' (shuffled in the app)', ' (in der App gemischt)'));
P(`${T('Read tonight', 'Lesestoff für heute Abend')}: ${L(UNIT6.reading.title)} (${UNIT6.reading.source}). ${UNIT6.reading.lookFor.map(plain).join(' / ')}`);

writeFileSync(`${out}/script-${lang}.md`, q.join('\n') + '\n');
writeFileSync(`${out}/feedback-key-${lang}.md`, `# ${T('Feedback key (what the app shows after each answer)', 'Feedback-Schlüssel (was die App nach jeder Antwort zeigt)')}\n\n` + k.join('\n') + '\n');
console.log('written', `${out}/script-${lang}.md`, q.length, 'lines;', k.length, 'feedback entries;', BANK.length, 'items in bank');
