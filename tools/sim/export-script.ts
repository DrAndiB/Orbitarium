// Export units 0 and 6 as a readable "student script" (questions without answers) plus a
// separate feedback key, in English or German, for persona walkthroughs.
// Usage: npx tsx tools/sim/export-script.ts en|de <outdir>
import { writeFileSync } from 'node:fs';
import { UNIT0 } from '../../src/content/unit00';
import { UNIT6, type Extra, type Reading } from '../../src/content/unit06';
import { itemById, type Item } from '../../src/content/items';
import { GLOSSARY } from '../../src/content/glossary';
import type { Bi } from '../../src/i18n';

const lang = (process.argv[2] ?? 'en') as 'en' | 'de';
const out = process.argv[3] ?? '.';
const SUB = '₀₁₂₃₄₅₆₇₈₉';
const L = (b: Bi | string) => (typeof b === 'string' ? b : b[lang]);
const formula = (f: string) => f.replace(/\d/g, (d) => SUB[+d]).replace(/\+$/, '⁺').replace(/-$/, '⁻');
const plain = (b: Bi | string) => L(b)
  .replace(/\{\{([^}]+)\}\}/g, (_, f) => formula(f))
  .replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, '$2')
  .replace(/\[\[([^\]]+)\]\]/g, (_, id) => (GLOSSARY[id] ? `${L({ en: GLOSSARY[id].en, de: GLOSSARY[id].de })} (${lang === 'en' ? GLOSSARY[id].de : GLOSSARY[id].en})` : id))
  .replace(/_\{([^}]+)\}/g, '_$1').replace(/\*\*([^*]+)\*\*/g, '$1');
const T = (en: string, de: string) => (lang === 'en' ? en : de);
const letters = 'ABCDEFG';

const q: string[] = [];   // student script
const k: string[] = [];   // feedback key

function question(it: Item, label: string) {
  q.push(`\n**[${it.id}] ${label}** ${plain(it.prompt)}`);
  if (it.format === 'why') q.push(T('  (Format: pick the best explanation.)', '  (Format: die beste Erklärung wählen.)'));
  if (it.table) q.push(T(`  (A "Look it up in the table" button opens the full periodic table with the "${it.table}" view.)`, `  (Ein Knopf „Im Periodensystem nachsehen“ öffnet das ganze Periodensystem mit der Ansicht „${it.table}“.)`));
  if (it.kind === 'choice') {
    it.options.forEach((o, i) => q.push(`  ${letters[i]}. ${plain(o.text)}`));
    if (it.withConfidence) q.push(T('  Confidence slider: 50 % (guessing) to 100 % (certain).', '  Sicherheitsregler: 50 % (geraten) bis 100 % (sicher).'));
    const ci = it.options.findIndex((o) => o.correct);
    const traps = it.options.map((o, i) => (o.mis ? letters[i] : '')).filter(Boolean);
    k.push(`- [${it.id}] ${T('Correct', 'Richtig')}: ${letters[ci]}. ${plain(it.explain)}`
      + (traps.length ? ' ' + T(`Options ${traps.join(', ')} are known traps: if chosen, the app adds "This is a known trap: … It goes into your misconception ledger."`, `Optionen ${traps.join(', ')} sind bekannte Fallen: Wer sie wählt, sieht „Das ist eine bekannte Falle: … Sie kommt in deine Liste der Fehlvorstellungen.“`) : '')
      + (it.withConfidence ? ' ' + T('If the answer is wrong at 80 % confidence or more, the app adds: "You were sure about this one. Confident mistakes are the most useful ones to catch: this question will come back."', 'Ist die Antwort bei 80 % Sicherheit oder mehr falsch, ergänzt die App: „Hier warst du dir sicher. Selbstsichere Fehler lohnen sich am meisten: Diese Frage kommt wieder.“') : ''));
  } else if (it.kind === 'rank') {
    const n = it.order.length;
    const perm = n === 3 ? [1, 2, 0] : n === 4 ? [2, 0, 3, 1] : it.order.map((_, i) => (i * 2 + 1) % n);
    q.push(T('  Put in order (drag rows). Starting order shown: ', '  In Reihenfolge bringen (Zeilen ziehen). Angezeigte Startreihenfolge: ') + perm.map((i) => plain(it.order[i])).join(', '));
    k.push(`- [${it.id}] ${T('Correct order', 'Richtige Reihenfolge')}: ${it.order.map(plain).join(' > ')}. ${plain(it.explain)} ${T('Half or more in place counts as partly right.', 'Mindestens die Hälfte richtig zählt als teilweise richtig.')}`);
  } else if (it.kind === 'estimate') {
    q.push(T(`  Slider from ${it.min} to ${it.max}${it.suffix} in steps of ${it.step}.`, `  Regler von ${it.min} bis ${it.max}${it.suffix} in Schritten von ${it.step}.`));
    const close = Math.max(it.tolerance * 3, (it.max - it.min) * 0.06);
    k.push(`- [${it.id}] ${T('Answer', 'Lösung')}: ${it.answer}${it.suffix}. ${T(`Verdict "Spot on." within ±${it.tolerance}, "Close." within ±${close}, otherwise "Far off."`, `Urteil „Genau richtig.“ innerhalb ±${it.tolerance}, „Nah dran.“ innerhalb ±${close}, sonst „Weit daneben.“`)} ${plain(it.explain)}`
      + (it.near ?? []).map((nn) => ' ' + T(`If the answer is within ±${nn.tol} of ${nn.value}, the app first adds: `, `Liegt die Antwort innerhalb ±${nn.tol} von ${nn.value}, ergänzt die App zuerst: `) + plain(nn.note)).join(''));
  } else if (it.kind === 'flaw') {
    it.lines.forEach((l, i) => q.push(`  ${i + 1}. ${plain(l)}`));
    k.push(`- [${it.id}] ${T('First wrong step', 'Erster falscher Schritt')}: ${it.flaw + 1}.`
      + (it.alsoFalse ? ' ' + T(`Choosing step ${it.alsoFalse.map((x) => x + 1).join(', ')} counts as partly right, with the note: "That step is false too, but only because it follows from an earlier slip. The question asks where the reasoning first goes wrong."`, `Schritt ${it.alsoFalse.map((x) => x + 1).join(', ')} zählt als teilweise richtig, mit dem Hinweis: „Dieser Schritt ist auch falsch, aber nur, weil er aus einem früheren Fehler folgt. Gefragt war, wo die Überlegung zuerst schiefgeht.“`) : '')
      + ` ${plain(it.explain)}`);
  }
}
const extra = (id: string, x: Extra) => k.push(`- ${T(`If [${id}] was answered wrong, before the reveal the app shows "One more way to see it"`, `Wenn [${id}] falsch beantwortet wurde, zeigt die App vor der Auflösung „Noch ein Weg, es zu sehen“`)}: **${plain(x.title)}**: ${x.steps.map((st, i) => `${i + 1}. ${plain(st)}`).join(' ')}`);
const tasksOut = (tasks: { text: Bi; key?: boolean; challenge?: boolean }[]) => tasks.forEach((t) => P(`- ${t.key ? T('[KEY] ', '[WICHTIG] ') : t.challenge ? '[BONUS] ' : ''}${plain(t.text)}`));
const readingsOut = (rs: Reading[]) => rs.filter((r) => r.lang === lang).forEach((R) => P(`${T('Read tonight', 'Lesestoff für heute Abend')}${R.kind ? ` (${R.kind === 'quick' ? T('quick read', 'kurz') : T('deeper', 'vertiefend')})` : ''}: ${L(R.title)} (${R.source}). ${T('Things to look for', 'Worauf du achten kannst')}: ${R.lookFor.map(plain).join(' / ')}`));
const H = (s: string) => q.push(`\n## ${s}\n`);
const P = (s: string) => q.push(s);
const MIN = [3, 3, 7, 4, 5, 4, 1];
const left = (step: number) => T(` (header: "about ${MIN.slice(step).reduce((a, b) => a + b, 0)} min left, saved after every step")`, ` (Kopfzeile: „noch etwa ${MIN.slice(step).reduce((a, b) => a + b, 0)} Min., gespeichert nach jedem Schritt“)`);

const explainHow = T('A text box (English or German) and a confidence slider. Then "Next: check it against the key ideas": the key ideas appear as checkboxes, with "Tick each idea your text really states. Be strict with yourself: only what is written, not what you meant." Then "Compare with a tightened version": the app shows how many ideas you ticked, a tightened version, and quiet hints only where your ticks and your text seem to disagree ("I can\'t spot this in your words. Is it really there, or only in your head?" / "Your text may already say this."). If the text reads like a bare list of keywords it asks for full sentences instead. Buttons: "Revise my text" and "Save to journal". Nothing is graded here; "can explain" is earned later, by explanation questions on another day.',
  'Ein Textfeld (Deutsch oder Englisch) und ein Sicherheitsregler. Dann „Weiter: mit den Kernideen abgleichen“: Die Kernideen erscheinen als Kästchen, mit „Hake jede Idee ab, die dein Text wirklich enthält. Sei streng mit dir: nur was dasteht, nicht was du gemeint hast.“ Dann „Mit einer geschärften Fassung vergleichen“: Die App zeigt, wie viele Ideen du abgehakt hast, eine geschärfte Fassung und leise Hinweise nur dort, wo Häkchen und Text nicht zusammenpassen („Das finde ich in deinem Text nicht. Steht es wirklich da oder nur im Kopf?“ / „Dein Text sagt das vielleicht schon.“). Liest sich der Text wie eine Stichwortliste, bittet die App um ganze Sätze. Knöpfe: „Meinen Text überarbeiten“ und „Im Journal speichern“. Hier wird nichts bewertet; „kann erklären“ erreichst du später, mit Erklärungsfragen an einem anderen Tag.');
const wrapHow = T('A summary of each concept: level reached (seen / can predict / can explain / can transfer) and next review date, with the note: "\'Can explain\' and \'can transfer\' are earned on later days, in warm-ups." Then the reading. Term pairs (English ↔ German) appear only if the second language is switched on in settings, and are optional. "Finish unit" returns to the sky map. If less than half of the unit\'s questions were right, a toast says a short second pass (five questions) is waiting for the next session.',
  'Eine Übersicht je Konzept: erreichte Stufe (gesehen / kann vorhersagen / kann erklären / kann übertragen) und nächstes Wiederholungsdatum, mit dem Hinweis: „‚Kann erklären‘ und ‚kann übertragen‘ erreichst du an späteren Tagen, in den Aufwärmrunden.“ Dann der Lesestoff. Begriffspaare (Englisch ↔ Deutsch) erscheinen nur, wenn die zweite Sprache in den Einstellungen an ist, und sind freiwillig. „Einheit abschließen“ führt zur Himmelskarte. War weniger als die Hälfte der Fragen der Einheit richtig, meldet die App, dass eine kurze zweite Runde (fünf Fragen) auf die nächste Sitzung wartet.');

// ---------------- UNIT 0 ----------------
q.push(T('# Orbitarium — student script for units 0 and 6 (revised)\n\nThis is what the app shows, step by step. Simulations are described in words. Answer each question before reading the feedback key.',
  '# Orbitarium – Ablauf für Lernende, Einheiten 0 und 6 (überarbeitet)\n\nSo zeigt es die App, Schritt für Schritt. Simulationen sind in Worten beschrieben. Beantworte jede Frage, bevor du im Feedback-Schlüssel nachsiehst.'));
q.push(`\n# ${T('Unit 0', 'Einheit 0')}: ${L(UNIT0.title)}\n\n${plain(UNIT0.lead)}`);
H(T('Step 1 of 7 · Warm-up', 'Schritt 1 von 7 · Aufwärmen') + left(0));
P(plain(UNIT0.warmupIntro));
P(T('(Feedback here is neutral: a wrong answer shows "Here is the answer." instead of "Not quite.")', '(Das Feedback ist hier neutral: Eine falsche Antwort zeigt „Das ist die Antwort.“ statt „Nicht ganz.“)'));
['u0a', 'u0b', 'u0c'].forEach((id, i) => question(itemById(id)!, T(`Question ${i + 1} of 3.`, `Frage ${i + 1} von 3.`)));
H(T('Step 2 of 7 · Puzzle', 'Schritt 2 von 7 · Rätsel') + left(1));
P(`### ${L(UNIT0.puzzle.title)}\n${plain(UNIT0.puzzle.lead)}`);
P(T('A card titled "Period 4 as Mendeleev saw it in 1871 (modern mass values, in u)": ', 'Eine Karte „Periode 4, wie Mendelejew sie 1871 sah (heutige Massenwerte, in u)“: ') + UNIT0.puzzle.row.map((x, i) => (i === 2 ? T('[ ? highlighted, labelled "gap 2: asked" ]', '[ ? hervorgehoben, beschriftet „Lücke 2: gefragt“ ]') : i === 1 ? T('[ ? labelled "gap 1" ]', '[ ? beschriftet „Lücke 1“ ]') : `${x.s} ${x.m}`)).join(' | '));
P(T('Its column, group 14: ', 'Seine Spalte, Gruppe 14: ') + UNIT0.puzzle.column.map((x, i) => (i === 2 ? T('[ ? "gap 2: asked" ]', '[ ? „Lücke 2: gefragt“ ]') : `${x.s} ${x.m}`)).join(' | '));
P(plain(UNIT0.puzzle.clash));
question(UNIT0.puzzle.item, '');
k.push(`- ${T('After the puzzle the app adds', 'Nach dem Rätsel ergänzt die App')}: ${plain(UNIT0.puzzle.after)}`);
H(T('Step 3 of 7 · Explore the map', 'Schritt 3 von 7 · Die Karte erkunden') + left(2));
P(plain(UNIT0.explore.intro));
P(T('The interactive periodic table: 118 cells coloured by the chosen view (Families, Shells (rows), Outer electrons (columns), Blocks s p d f, Atomic mass, Electronegativity, Atom size, Ionization energy, Typical ion), each with a legend. Tapping an element opens a card: symbol, English and German name, family, period, group, block, shells (e.g. 2 · 8 · 7), typical ion, atomic mass ("isotope average"; for elements without stable isotopes "[mass number of the longest-lived isotope]"), electronegativity, atom size (labelled "radius measured in compounds", or "calculated radius" for noble gases), first ionization energy, state at room temperature, electron configuration, sometimes "Why the symbol is …", and one fun fact. A "3D landscape" button turns values into heights. Search by name, symbol or number. On a phone the whole table fits the width; "Zoom in" enlarges it.',
  'Das interaktive Periodensystem: 118 Felder, gefärbt nach der gewählten Ansicht (Familien, Schalen (Zeilen), Außenelektronen (Spalten), Blöcke s p d f, Atommasse, Elektronegativität, Atomgröße, Ionisierungsenergie, Typisches Ion), jeweils mit Legende. Antippen öffnet eine Karte: Symbol, deutscher und englischer Name, Familie, Periode, Gruppe, Block, Schalen (z. B. 2 · 8 · 7), typisches Ion, Atommasse („Isotopen-Mittelwert“; bei Elementen ohne stabile Isotope „[Massenzahl des langlebigsten Isotops]“), Elektronegativität, Atomgröße („in Verbindungen gemessener Radius“ bzw. „berechneter Radius“ bei Edelgasen), 1. Ionisierungsenergie, Zustand bei Raumtemperatur, Elektronenkonfiguration, manchmal „Warum das Symbol … heißt“ und eine kuriose Tatsache. „3D-Landschaft“ macht Werte zu Höhen. Suche nach Name, Symbol oder Nummer. Auf dem Handy passt das Periodensystem in die Breite; „Vergrößern“ macht es größer.'));
P(T('Things to try. "The ones marked key unlock Continue; the others are there if you are curious." Once all key tasks and at least three in all are ticked, a quick check appears:', 'Zum Ausprobieren. „Die als wichtig markierten schalten ‚Weiter‘ frei, die anderen sind für Neugierige.“ Sobald alle wichtigen und mindestens drei insgesamt abgehakt sind, erscheint ein Kurz-Check:'));
tasksOut(UNIT0.explore.tasks);
k.push(`- ${T('Bonus found (e.g. argon and potassium)', 'Bonus gefunden (z. B. Argon und Kalium)')}: ${plain(UNIT0.explore.orderFound).replace('{a}', 'Ar').replace('{b}', 'K').replace('{za}', '18').replace('{zb}', '19')}`);
question(itemById('u0h')!, T('Quick check.', 'Kurzer Check.'));
H(T('Step 4 of 7 · Predict', 'Schritt 4 von 7 · Vorhersagen') + left(3));
P(T('Commit to an answer before the simulation shows you.', 'Lege dich fest, bevor die Simulation es zeigt.'));
UNIT0.predictions.forEach((p, i) => {
  question(p.item, T(`Prediction ${i + 1}.`, `Vorhersage ${i + 1}.`));
  extra(p.item.id, p.extra);
  k.push(`- ${T('Reveal', 'Auflösung')} [${p.item.id}]: ${T('the table opens with the', 'das Periodensystem öffnet sich mit der Ansicht')} "${p.overlay}" ${T('view and element', 'und Element')} ${p.select}. ${plain(p.revealText)}`);
});
H(T('Step 5 of 7 · Reading a cell', 'Schritt 5 von 7 · Eine Zelle lesen') + left(4));
UNIT0.examples.forEach((ex) => { P(`\n**${L(ex.title)}**`); ex.steps.forEach((s, i) => P(`  ${i + 1}. ${plain(s)}`)); P(`  ${plain(ex.soWhat)}`); });
P(`\n**[${UNIT0.locate.id}] ${T('Find it on the map', 'Auf der Karte finden')}:** ${plain(UNIT0.locate.prompt)} ${T('(Tap one cell, then Check. Views: Families, Shells, Outer electrons.)', '(Ein Feld antippen, dann Prüfen. Ansichten: Familien, Schalen, Außenelektronen.)')}`);
k.push(`- [${UNIT0.locate.id}] ${T('Answer: phosphorus, Z = 15.', 'Lösung: Phosphor, Z = 15.')} ${plain(UNIT0.locate.explain)}`);
question(UNIT0.flaw, T('Spot the flaw.', 'Finde den Fehler.'));
P(T('\nIf both predictions in step 4 were right at 80 % confidence or more, an optional button appears: "Go deeper: one harder question (optional)".', '\nWaren beide Vorhersagen aus Schritt 4 richtig mit mindestens 80 % Sicherheit, erscheint ein freiwilliger Knopf: „Tiefer gehen: eine schwerere Frage (freiwillig)“.'));
question(UNIT0.deeper, T('Go deeper (optional).', 'Tiefer gehen (freiwillig).'));
H(T('Step 6 of 7 · Explain back', 'Schritt 6 von 7 · Erklären') + left(5));
P(plain(UNIT0.explain.prompt));
P(explainHow);
P(T('Key ideas (as checkboxes):', 'Kernideen (als Kästchen):'));
UNIT0.explain.ideas.forEach((i) => P(`  ☐ ${plain(i.idea)}`));
k.push(`- ${T('Tightened version shown after comparing (unit 0)', 'Geschärfte Fassung nach dem Vergleichen (Einheit 0)')}: ${plain(UNIT0.explain.tightened)}`);
H(T('Step 7 of 7 · Wrap-up', 'Schritt 7 von 7 · Abschluss') + left(6));
P(wrapHow);
readingsOut(UNIT0.readings);

// ---------------- UNIT 6 ----------------
q.push(`\n\n# ${T('Unit 6', 'Einheit 6')}: ${L(UNIT6.title)}\n\n${plain(UNIT6.lead)}`);
q.push(T('\n(In between, units 1–5 on atoms and bonding would have been taught: shells, Z_eff, ionization, ionic and covalent bonds, electronegativity.)', '\n(Dazwischen wären die Einheiten 1–5 zu Atomen und Bindungen gelaufen: Schalen, Z_eff, Ionisierung, Ionen- und Atombindung, Elektronegativität.)'));
H(T('Step 1 of 7 · Warm-up', 'Schritt 1 von 7 · Aufwärmen') + left(0));
P(T('"Questions from earlier units, picked because they are starting to fade. The more is fading, the longer the warm-up, up to eight." Here, three of them:', '„Fragen aus früheren Einheiten – ausgewählt, weil sie zu verblassen beginnen. Je mehr verblasst, desto länger das Aufwärmen, höchstens acht.“ Hier drei davon:'));
['i2b', 'i3a', 'i5b'].forEach((id, i) => question(itemById(id)!, T(`Question ${i + 1} (unit ${itemById(id)!.unit}).`, `Frage ${i + 1} (Einheit ${itemById(id)!.unit}).`)));
H(T('Step 2 of 7 · Puzzle', 'Schritt 2 von 7 · Rätsel') + left(1));
P(`### ${T("Why isn't ammonia flat?", 'Warum ist Ammoniak nicht flach?')}\n${plain(UNIT6.puzzle.lead)}`);
P(T('Table: ', 'Tabelle: ') + UNIT6.puzzle.rows.map((r) => `${formula(r.f)} — ${r.bonds} ${T('bonds', 'Bindungen')} — ${r.angle}`).join(' | '));
P(plain(UNIT6.puzzle.clash));
question(UNIT6.puzzle.question, '');
H(T('Step 3 of 7 · Explore: the Molecule Workbench', 'Schritt 3 von 7 · Erkunden: die Molekül-Werkbank') + left(2));
P(plain(UNIT6.explore.intro));
P(T('A rotating 3D molecule. Electron pairs push on each other until they settle; the screen shows the formula, the shape name (e.g. "trigonal pyramidal"), the live bond angle and the measured value. Lone pairs are violet lobes. Buttons load CH₄, NH₃, H₂O, NH₄⁺, CO₂, BF₃. Switches: Show lone pairs; Show polarity (bond halves turn blue at δ− and red at δ+, an arrow shows the net dipole, labelled "arrow points to δ−", or a ring if the pulls cancel); "Wrong model: lone pairs take no space" (NH₃ goes flat to 120°, H₂O straight to 180°, the measured value turns red). A slider "Lone-pair push" λ from 1.0 to 2.0 (default 1.25) with the line E = Σ w/r², w = λ² (lone–lone), λ (lone–bond), 1 (bond–bond). Values at λ = 1.25: CH₄ 109.5°, NH₃ 107.1° (measured 107°), H₂O 105.0° (measured 104.5°). A builder: pick a central atom (C, N, O, B, P, S) and four partner slots cycling H, F, Cl, =O; it starts on CH₄ (four H). "The central atom\'s outer electrons that are not used in bonds pair up as lone pairs." Combinations that need more than four directions say so ("Such molecules exist (SF₄, PCl₅), but this workbench stops at four").',
  'Ein sich drehendes 3D-Molekül. Elektronenpaare drücken aufeinander, bis sie zur Ruhe kommen; angezeigt werden Formel, Gestalt (z. B. „trigonal-pyramidal“), aktueller Winkel und Messwert. Freie Paare sind violette Keulen. Knöpfe laden CH₄, NH₃, H₂O, NH₄⁺, CO₂, BF₃. Schalter: Freie Paare zeigen; Polarität zeigen (Bindungshälften blau bei δ−, rot bei δ+, ein Pfeil zeigt den Gesamtdipol, beschriftet „Pfeil zeigt zu δ−“, oder ein Ring, wenn sich die Züge aufheben); „Falsches Modell: freie Paare brauchen keinen Platz“ (NH₃ wird flach mit 120°, H₂O gerade mit 180°, der Messwert wird rot). Ein Regler „Schub der freien Paare“ λ von 1,0 bis 2,0 (Standard 1,25) mit der Zeile E = Σ w/r², w = λ² (frei–frei), λ (frei–Bindung), 1 (Bindung–Bindung). Werte bei λ = 1,25: CH₄ 109,5°, NH₃ 107,1° (gemessen 107°), H₂O 105,0° (gemessen 104,5°). Ein Baukasten: Zentralatom (C, N, O, B, P, S) und vier Partnerfelder, die H, F, Cl, =O durchschalten; Start ist CH₄ (vier H). „Die Außenelektronen des Zentralatoms, die nicht in Bindungen stecken, bilden freie Paare.“ Kombinationen mit mehr als vier Richtungen werden erklärt („Solche Moleküle gibt es (SF₄, PCl₅), aber diese Werkbank hört bei vier auf“).'));
P(T('Things to try (key tasks unlock the quick check):', 'Zum Ausprobieren (die wichtigen schalten den Kurz-Check frei):'));
tasksOut(UNIT6.explore.tasks);
k.push(`- ${T('Note after the λ task', 'Hinweis nach der λ-Aufgabe')}: ${plain(UNIT6.explore.lambdaNote)}`);
question(UNIT6.explore.rank, T('Quick check.', 'Kurzer Check.'));
H(T('Step 4 of 7 · Predict', 'Schritt 4 von 7 · Vorhersagen') + left(3));
UNIT6.predictions.forEach((p, i) => {
  question(p.item, T(`Prediction ${i + 1}.`, `Vorhersage ${i + 1}.`));
  extra(p.item.id, p.extra);
  k.push(`- ${T('Reveal', 'Auflösung')} [${p.item.id}]: ${T('the workbench loads', 'die Werkbank lädt')} ${formula(p.reveal)}${p.dipole ? T(' with polarity on', ' mit Polarität') : ''}. ${plain(p.revealText)}`);
});
H(T('Step 5 of 7 · Worked examples', 'Schritt 5 von 7 · Beispiele') + left(4));
P(T('(A compact workbench is shown; its fold-out "What this model leaves out" is available here: ', '(Eine kompakte Werkbank wird gezeigt; ihr Ausklapptext „Was dieses Modell weglässt“ ist hier verfügbar: ') + T('Electron pairs are treated as points on a sphere that push each other with an energy of w / r²; the exponent is a modelling choice, and λ ≈ 1.25 is fitted so that ammonia and water come out right. Real atoms also differ in size. Around a bigger central atom such as P or S, the bonding pairs sit further out and push each other less, so the lone pairs squeeze them more: PCl₃ measures 100° and H₂S 92°, smaller than the model predicts. Double bonds push a little harder here (× 1.12).)', 'Elektronenpaare werden als Punkte auf einer Kugel behandelt, die sich mit der Energie w / r² abstoßen; der Exponent ist eine Modellwahl, und λ ≈ 1,25 ist so angepasst, dass Ammoniak und Wasser stimmen. Echte Atome sind außerdem verschieden groß. Um ein größeres Zentralatom wie P oder S sitzen die Bindungspaare weiter außen und drücken einander weniger, also stauchen die freien Paare sie stärker: PCl₃ misst 100° und H₂S 92°, weniger als das Modell vorhersagt. Doppelbindungen drücken hier etwas stärker (× 1,12).)'));
UNIT6.examples.forEach((ex) => { P(`\n**${L(ex.title)}** — ${ex.numbers.map((n) => `${n.v} ${L(n.label)}`).join(', ')}`); P(`  ${plain(ex.body)}`); P(`  ${plain(ex.soWhat)}`); });
P(`\n**[u6-draw] ${T('Draw on it', 'Einzeichnen')}:** ${plain(UNIT6.draw.prompt)} ${T('(A water molecule: O at the top, two H below-left and below-right, two violet lone-pair lobes above O. An arrow can be rotated freely; answer with a direction.)', '(Ein Wassermolekül: O oben, zwei H unten links und unten rechts, zwei violette freie Paare über O. Ein Pfeil lässt sich frei drehen; antworte mit einer Richtung.)')}`);
k.push(`- [u6-draw] ${T('Correct: pointing up (towards O and its lone pairs), within 25°.', 'Richtig: nach oben (zum O und seinen freien Paaren), innerhalb von 25°.')} ${T('Right', 'Richtig')}: ${plain(UNIT6.draw.right)} ${T('Wrong', 'Falsch')}: ${plain(UNIT6.draw.wrong)}`);
question(UNIT6.flaw, T('Spot the flaw.', 'Finde den Fehler.'));
P(T('\nIf both predictions were right at 80 % confidence or more, an optional "Go deeper" question appears:', '\nWaren beide Vorhersagen richtig mit mindestens 80 % Sicherheit, erscheint eine freiwillige Frage „Tiefer gehen“:'));
question(UNIT6.deeper, T('Go deeper (optional).', 'Tiefer gehen (freiwillig).'));
H(T('Step 6 of 7 · Explain back', 'Schritt 6 von 7 · Erklären') + left(5));
P(plain(UNIT6.explain.prompt));
P(explainHow);
UNIT6.explain.ideas.forEach((i) => P(`  ☐ ${plain(i.idea)}`));
k.push(`- ${T('Tightened version shown after comparing (unit 6)', 'Geschärfte Fassung nach dem Vergleichen (Einheit 6)')}: ${plain(UNIT6.explain.tightened)}`);
H(T('Step 7 of 7 · Wrap-up', 'Schritt 7 von 7 · Abschluss') + left(6));
P(wrapHow);
readingsOut(UNIT6.readings);

writeFileSync(`${out}/script-${lang}.md`, q.join('\n') + '\n');
writeFileSync(`${out}/feedback-key-${lang}.md`, `# ${T('Feedback key (what the app shows after each answer)', 'Feedback-Schlüssel (was die App nach jeder Antwort zeigt)')}\n\n` + k.join('\n') + '\n');
console.log('written', `${out}/script-${lang}.md`, q.length, 'lines;', k.length, 'feedback entries');
