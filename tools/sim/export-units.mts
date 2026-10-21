// Export units built from UnitContent (1–5) as a student script plus a feedback key, for persona walkthroughs.
// Usage: npx tsx tools/sim/export-units.mts en|de <outdir> 1,2,3
import { writeFileSync } from 'node:fs';
import { GLOSSARY } from '../../src/content/glossary';
import { MISCONCEPTIONS } from '../../src/content/curriculum';
import type { Item } from '../../src/content/items';
import type { UnitContent, Show, DataTable } from '../../src/content/unitTypes';
import type { Extra, Reading } from '../../src/content/unit06';
import type { Bi } from '../../src/i18n';

const lang = (process.argv[2] ?? 'en') as 'en' | 'de';
const out = process.argv[3] ?? '.';
const units = (process.argv[4] ?? '1,2,3,4,5').split(',').map(Number);
const contents: UnitContent[] = [];
for (const n of units) contents.push((await import(`../../src/content/unit0${n}.ts`))[`UNIT${n}`]);
for (const U of contents) for (const m of U.misconceptions) if (!MISCONCEPTIONS.some((x) => x.id === m.id)) MISCONCEPTIONS.push({ ...m, unit: U.n });
for (const U of contents) Object.assign(GLOSSARY, U.glossary);

const SUB = '₀₁₂₃₄₅₆₇₈₉', SUP: Record<string, string> = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '+': '⁺', '-': '⁻' };
const L = (b: Bi | string) => (typeof b === 'string' ? b : b[lang]);
const formula = (f: string) => {
  const m = /^(.*?)(\d?)([+-])$/.exec(f);
  let body = f, charge = '';
  if (m) { const [, b, d, sg] = m; if (d && (/^[A-Z][a-z]?$/.test(b) || /\d$/.test(b))) { body = b; charge = d + sg; } else { body = b + d; charge = sg; } }
  return body.replace(/\d/g, (d) => SUB[+d]) + charge.split('').map((c) => SUP[c] ?? c).join('');
};
const plain = (b: Bi | string) => L(b)
  .replace(/\{\{([^}]+)\}\}/g, (_, f) => formula(f))
  .replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, '$2')
  .replace(/\[\[([^\]]+)\]\]/g, (_, id) => (GLOSSARY[id] ? L({ en: GLOSSARY[id].en, de: GLOSSARY[id].de }) : id))
  .replace(/_\{([^}]+)\}/g, '_$1').replace(/\*\*([^*]+)\*\*/g, '$1');
const T = (en: string, de: string) => (lang === 'en' ? en : de);
const letters = 'ABCDEFG';
const q: string[] = [];
const k: string[] = [];
const H = (s: string) => q.push(`\n## ${s}\n`);
const P = (s: string) => q.push(s);
const MIN = [3, 3, 7, 4, 5, 4, 1];
const left = (step: number) => T(` (header: "about ${MIN.slice(step).reduce((a, b) => a + b, 0)} min left, saved after every step")`, ` (Kopfzeile: „noch etwa ${MIN.slice(step).reduce((a, b) => a + b, 0)} Min., gespeichert nach jedem Schritt“)`);
const misName = (id: string) => { const m = MISCONCEPTIONS.find((x) => x.id === id); return m ? L(m.name) : id; };

function question(it: Item, label: string) {
  q.push(`\n**[${it.id}] ${label}** ${plain(it.prompt)}`);
  if (it.format === 'why') q.push(T('  (Format: pick the best explanation.)', '  (Format: die beste Erklärung wählen.)'));
  if (it.table) q.push(T(`  (A "Look it up in the table" button opens the periodic table with the "${it.table}" view.)`, `  (Ein Knopf „Im Periodensystem nachsehen“ öffnet das Periodensystem mit der passenden Ansicht.)`));
  if (it.kind === 'choice') {
    it.options.forEach((o, i) => q.push(`  ${letters[i]}. ${plain(o.text)}`));
    if (it.withConfidence) q.push(T('  Confidence slider "How sure are you?": 50 % (guessing) to 100 % (certain).', '  Regler „Wie sicher bist du?“: 50 % (geraten) bis 100 % (sicher).'));
    const ci = it.options.findIndex((o) => o.correct);
    const traps = it.options.map((o, i) => (o.mis ? `${letters[i]} (${misName(o.mis)})` : '')).filter(Boolean);
    k.push(`- [${it.id}] ${T('Correct', 'Richtig')}: ${letters[ci]}. ${plain(it.explain)}`
      + (traps.length ? ' ' + T(`Trap options: ${traps.join('; ')}. If one is chosen, the app adds "A common trap: <name>. The app will bring it back on another day until it sticks."`, `Fallen: ${traps.join('; ')}. Wer eine wählt, sieht „Eine häufige Falle: <Name>. Die App bringt sie an einem anderen Tag wieder, bis es sitzt.“`) : ''));
  } else if (it.kind === 'rank') {
    const n = it.order.length;
    const perm = n === 3 ? [1, 2, 0] : n === 4 ? [2, 0, 3, 1] : it.order.map((_, i) => (i * 2 + 1) % n);
    q.push(T('  Put in order (drag rows). Starting order shown: ', '  In Reihenfolge bringen (Zeilen ziehen). Startreihenfolge: ') + perm.map((i) => plain(it.order[i])).join(', '));
    k.push(`- [${it.id}] ${T('Correct order', 'Richtige Reihenfolge')}: ${it.order.map(plain).join(' > ')}. ${plain(it.explain)}`);
  } else if (it.kind === 'estimate') {
    q.push(T(`  Slider from ${it.min} to ${it.max}${it.suffix} in steps of ${it.step}.`, `  Regler von ${it.min} bis ${it.max}${it.suffix} in Schritten von ${it.step}.`));
    const close = +Math.max(it.tolerance * 3, (it.max - it.min) * 0.06, it.step).toFixed(2);
    k.push(`- [${it.id}] ${T('Answer', 'Lösung')}: ${it.answer}${it.suffix}. ${T(`"Spot on." within ±${it.tolerance}, "Close." within ±${close}, otherwise "Far off."`, `„Genau richtig.“ innerhalb ±${it.tolerance}, „Nah dran.“ innerhalb ±${close}, sonst „Weit daneben.“`)} ${plain(it.explain)}`
      + (it.near ?? []).map((nn) => ' ' + T(`Near ${nn.value} (±${nn.tol}) the app adds: `, `Nahe ${nn.value} (±${nn.tol}) ergänzt die App: `) + plain(nn.note)).join(''));
  } else if (it.kind === 'flaw') {
    it.lines.forEach((l, i) => q.push(`  ${i + 1}. ${plain(l)}`));
    k.push(`- [${it.id}] ${T('First wrong step', 'Erster falscher Schritt')}: ${it.flaw + 1}.`
      + (it.alsoFalse ? ' ' + T(`Step ${it.alsoFalse.map((x) => x + 1).join(', ')} counts as partly right (false only because it follows from the slip).`, `Schritt ${it.alsoFalse.map((x) => x + 1).join(', ')} zählt als teilweise richtig (nur falsch, weil er aus dem Fehler folgt).`) : '')
      + (it.near ?? []).map((nn) => ' ' + T(`Step ${nn.step + 1} gets the note: `, `Schritt ${nn.step + 1} bekommt den Hinweis: `) + plain(nn.note)).join('')
      + ` ${plain(it.explain)}`);
  }
}
const extra = (id: string, x: Extra) => k.push(`- ${T(`If [${id}] was answered wrong, before the reveal: "One more way to see it"`, `Wenn [${id}] falsch war, vor der Auflösung: „Noch ein Weg, es zu sehen“`)}: **${plain(x.title)}**: ${x.steps.map((st, i) => `${i + 1}. ${plain(st)}`).join(' ')}`);
const readingsOut = (rs: Reading[]) => rs.filter((r) => r.lang === lang).forEach((R) => P(`${T('Read tonight', 'Lesestoff')}${R.kind ? ` (${R.kind === 'quick' ? T('quick read', 'kurz') : T('deeper', 'vertiefend')})` : ''}: ${L(R.title)} (${R.source}, ${R.url}). ${T('Things to look for', 'Worauf du achten kannst')}: ${R.lookFor.map(plain).join(' / ')}`));
const table = (d: DataTable) => {
  const row = (cells: (string | Bi)[]) => '| ' + cells.map((c) => plain(c)).join(' | ') + ' |';
  if (d.caption) P(plain(d.caption));
  P(row(d.head)); P('|' + d.head.map(() => '---').join('|') + '|');
  d.rows.forEach((r) => P(row(r.cells) + (r.mystery ? T(' ← highlighted', ' ← hervorgehoben') : '')));
};
const showText = (s: Show) => {
  if (s.engine === 'atom') return T(`the Orbital Viewer shows ${s.charge ? 'an ion of ' : ''}element ${s.z}${s.charge ? ` with charge ${s.charge > 0 ? '+' : ''}${s.charge}` : ''}${s.view ? `, ${s.view} picture` : ''}${s.highlight ? `, ${s.highlight} highlighted` : ''}${s.pull ? `, ${s.pull} electrons pulled off with their energies as bars` : ''}${s.jump ? `, the ${s.jump[0]}→${s.jump[1]} jump played` : ''}${s.size ? ', drawn at measured size with its radius in pm' : ''}`,
    `der Orbital-Betrachter zeigt ${s.charge ? 'ein Ion von ' : ''}Element ${s.z}${s.charge ? ` mit Ladung ${s.charge > 0 ? '+' : ''}${s.charge}` : ''}${s.view ? `, Darstellung ${s.view === 'clouds' ? 'Orbitalwolken' : 'Schalen'}` : ''}${s.highlight ? `, ${s.highlight} hervorgehoben` : ''}${s.pull ? `, ${s.pull} Elektronen abgezogen, ihre Energien als Balken` : ''}${s.jump ? `, der Sprung ${s.jump[0]}→${s.jump[1]}` : ''}${s.size ? ', in gemessener Größe mit Radius in pm' : ''}`);
  if (s.engine === 'lattice') return T(`the Lattice Builder loads ${formula(s.salt)}${s.compare ? ` and compares it with ${formula(s.compare)} in the gauge` : ''}${s.mode ? ` (${s.mode})` : ''}${s.temp !== undefined ? ` at ${s.temp} °C` : ''}`, `der Gitterbaukasten lädt ${formula(s.salt)}${s.compare ? ` und vergleicht mit ${formula(s.compare)}` : ''}${s.mode ? ` (${({ transfer: 'Ionen bilden', shift: 'Schicht verschieben', heat: 'erhitzen', neighbours: 'Nachbarn zeigen' } as Record<string, string>)[s.mode]})` : ''}${s.temp !== undefined ? ` bei ${s.temp} °C` : ''}`);
  return T(`the Charge Field shows the ${s.a}${s.order === 2 ? '=' : s.order === 3 ? '≡' : '–'}${s.b} bond`, `das Ladungsfeld zeigt die Bindung ${s.a}${s.order === 2 ? '=' : s.order === 3 ? '≡' : '–'}${s.b}`);
};

const ENGINE: Record<number, Bi> = {
  1: { en: 'The Orbital Viewer: one atom in 3D, nucleus labelled with its charge (e.g. "11+"). Two pictures: "Shells (Bohr picture)" with rings and electron dots labelled "n = 1: 2", and "Orbital clouds" with translucent lobes (s spheres, p dumbbells, d clovers; inner shells faint). A slider for the element (Z = 1–36) and buttons "◀ previous element" and "Next: + 1 proton, + 1 electron ▶" (the newest electron glows). The HUD shows symbol, name, Z, the configuration (e.g. 1s² 2s² 2p⁶ 3s¹) and "shells 2 · 8 · 1". An orbital box diagram (lowest energy at the bottom, arrows ↑↓, "2/6" counts; tapping a row highlights that subshell\'s cloud). A panel "Hydrogen\'s energy levels": a ladder n = 1…6 with energies in eV (axis broken below n = 2), buttons for the jumps 3→2, 4→2, 5→2, 6→2, 2→1, 4→3; each jump draws an arrow in the colour of the light and prints e.g. "n=3 → n=2: 1.89 eV, 656 nm, visible light", and adds a line to a spectrum strip (400–700 nm). Ultraviolet and infrared jumps are drawn dashed and called invisible.', de: 'Der Orbital-Betrachter: ein Atom in 3D, der Kern mit seiner Ladung beschriftet (z. B. „11+“). Zwei Darstellungen: „Schalen (Bohr-Bild)“ mit Ringen und Elektronenpunkten, beschriftet „n = 1: 2“, und „Orbitalwolken“ mit durchscheinenden Keulen (s Kugeln, p Hanteln, d Kleeblätter; innere Schalen blass). Ein Regler für das Element (Z = 1–36) und Knöpfe „◀ voriges Element“ und „Weiter: + 1 Proton, + 1 Elektron ▶“ (das neueste Elektron leuchtet). Oben stehen Symbol, Name, Z, die Konfiguration (z. B. 1s² 2s² 2p⁶ 3s¹) und „Schalen 2 · 8 · 1“. Ein Kästchendiagramm (niedrigste Energie unten, Pfeile ↑↓, Zähler „2/6“; Antippen einer Zeile hebt die Wolke dieser Unterschale hervor). Ein Feld „Die Energieniveaus von Wasserstoff“: eine Leiter n = 1…6 mit Energien in eV (Achse unter n = 2 unterbrochen), Knöpfe für die Sprünge 3→2, 4→2, 5→2, 6→2, 2→1, 4→3; jeder Sprung zeichnet einen Pfeil in der Farbe des Lichts und meldet z. B. „n=3 → n=2: 1,89 eV, 656 nm, sichtbares Licht“ und setzt eine Linie in einen Spektralstreifen (400–700 nm). Ultraviolette und infrarote Sprünge sind gestrichelt und als unsichtbar bezeichnet.' },
  2: { en: 'The Orbital Viewer in size mode: the shells picture drawn at the measured size (outer shell at the measured radius, inner shells in proportion), with a readout "radius 180 pm" (or "ion radius 102 pm"). An element slider (Z = 1–36) with "◀ previous element" / "Next ▶". A row "Make an ion (tap again for the atom)": Na⁺, K⁺, Mg²⁺, Al³⁺, F⁻, O²⁻, Cl⁻. A slider "How well the inner electrons shield" from 0 to 100 % with the line "Z_eff ≈ Z − shielding × inner electrons · Z_eff ≈ 1.0"; lowering it makes the atom shrink as the outer electrons feel more of the nucleus.', de: 'Der Orbital-Betrachter in Größenansicht: das Schalenbild in gemessener Größe (Außenschale beim gemessenen Radius, innere Schalen im Verhältnis), mit der Anzeige „Radius 180 pm“ (oder „Ionenradius 102 pm“). Ein Elementregler (Z = 1–36) mit „◀ voriges Element“ / „Weiter ▶“. Eine Zeile „Ein Ion bilden (nochmal tippen für das Atom)“: Na⁺, K⁺, Mg²⁺, Al³⁺, F⁻, O²⁻, Cl⁻. Ein Regler „Wie gut die inneren Elektronen abschirmen“ von 0 bis 100 % mit der Zeile „Z_eff ≈ Z − Abschirmung × innere Elektronen · Z_eff ≈ 1,0“; senkt man ihn, schrumpft das Atom, weil die Außenelektronen mehr vom Kern spüren.' },
  3: { en: 'The Orbital Viewer with an ionization panel: one atom (Z = 1–20) as shells or clouds, the orbital boxes, and "Pull off the outermost electron". Each pull removes one electron (the HUD shows the ion, e.g. Mg²⁺, and its configuration) and adds a bar with the energy it cost in kJ/mol; only the biggest jump in the series (the cliff) is drawn red. "3 pulled off, 9,921 kJ/mol in all." "Put them all back" resets.', de: 'Der Orbital-Betrachter mit einem Ionisierungsfeld: ein Atom (Z = 1–20) als Schalen oder Wolken, die Orbitalkästchen und „Das äußerste Elektron abziehen“. Jeder Zug entfernt ein Elektron (oben steht das Ion, z. B. Mg²⁺, und seine Konfiguration) und fügt einen Balken mit der Energie in kJ/mol hinzu; nur der größte Sprung der Reihe (der Absturz) wird rot. „3 abgezogen, insgesamt 9.921 kJ/mol.“ „Alle zurücksetzen“ setzt zurück.' },
  4: { en: 'The Lattice Builder: a rotating 5 × 5 × 5 rock-salt crystal, cations blue, anions red, ions drawn a little smaller than their measured size so you can see in. Chips: NaCl, KCl, NaF, NaBr, NaI, LiF, MgO, CaO. "Make the ions": a neutral metal atom and a non-metal atom; one (or two) glowing electrons hop across; the metal shrinks and turns blue, the non-metal grows and turns red; labels change to Na⁺ and Cl⁻. "Show the centre ion" (or tapping any ion): the ion and the ions touching it stay, everything else fades, with a count (6 inside the crystal, fewer on the surface). A temperature slider 0–3000 °C with a mark "melts 801 °C": the ions jiggle more as it heats; above the melting point the crystal falls apart and the ions wander ("molten: ions free to move"). "Shift a layer": the top layer slides by one ion, yellow lines mark like charges now on top of each other, and the layer lifts off ("like charges side by side: they push apart"). A gauge "How strongly the ions hold on" compares the last two salts: charges (e.g. 2 × 2 = 4), distance (r₊ + r₋ in pm), "model: charges ÷ distance" relative to NaCl with a bar, measured lattice energy (kJ/mol) with a bar, and melting point.', de: 'Der Gitterbaukasten: ein sich drehender Kochsalzkristall aus 5 × 5 × 5 Ionen, Kationen blau, Anionen rot, etwas kleiner gezeichnet als gemessen, damit man hineinsieht. Chips: NaCl, KCl, NaF, NaBr, NaI, LiF, MgO, CaO. „Ionen bilden“: ein neutrales Metallatom und ein Nichtmetallatom; ein (oder zwei) leuchtende Elektronen springen hinüber; das Metall schrumpft und wird blau, das Nichtmetall wächst und wird rot; die Beschriftung wird zu Na⁺ und Cl⁻. „Das mittlere Ion zeigen“ (oder ein Ion antippen): Das Ion und seine direkten Nachbarn bleiben, der Rest verblasst, mit einer Zahl (6 im Inneren, weniger an der Oberfläche). Ein Temperaturregler 0–3000 °C mit Marke „schmilzt 801 °C“: Die Ionen zittern stärker; über dem Schmelzpunkt zerfällt das Gitter und die Ionen wandern („geschmolzen: Ionen frei beweglich“). „Eine Schicht verschieben“: Die oberste Schicht rutscht um ein Ion, gelbe Linien markieren gleiche Ladungen übereinander, und die Schicht hebt ab („gleiche Ladungen nebeneinander: Sie stoßen sich ab“). Eine Anzeige „Wie stark die Ionen zusammenhalten“ vergleicht die letzten zwei Salze: Ladungen (z. B. 2 × 2 = 4), Abstand (r₊ + r₋ in pm), „Modell: Ladungen ÷ Abstand“ relativ zu NaCl mit Balken, gemessene Gitterenergie (kJ/mol) mit Balken, Schmelzpunkt.' },
  5: { en: 'The Charge Field: two atoms in 3D joined by one to three sticks (one per shared pair), with a cloud of faint dots that builds up like a long-exposure photo of where the shared pair spends its time, and a few bright dots for the pair right now. The cloud leans towards the atom that pulls harder; that atom gets a red halo and "δ−", the other a blue halo and "δ+" (for Δχ above 1.8 the labels are "+" and "−"). Readout: the bond (e.g. H–Cl, "hydrogen chloride, HCl"), "χ H 2.20 · χ Cl 3.16", "Δχ 0.96 · polar". Chips: H–H, Cl–Cl, F–F, H–Cl, H–F, C–H, H–O, H–N, C–O, C=O, O=O, N≡N, C–C, C=C, C≡C, Na–Cl, and "Pick your own pair of atoms" (H, C, N, O, F, Na, Cl). A scale "Electronegativity difference, Δχ" from 0 to 3.3 with bands nonpolar (to 0.4), polar (to 1.8), ionic, and the note "the borders are rules of thumb". Three boxes: bond length (pm; "≈" if estimated), bond energy (kJ/mol), ionic character "≈ 21 %". A "What if Cl pulled harder or weaker?" slider (electronegativity 0.5–4.5) with the formula note "Cloud share ≈ ½ ± ½ × ionic character, with Pauling\'s estimate 1 − e^(−Δχ²/4). A model, not a measurement." and a "Real value" button.', de: 'Das Ladungsfeld: zwei Atome in 3D, verbunden durch ein bis drei Stäbe (einer pro gemeinsamem Paar), mit einer Wolke aus blassen Punkten, die sich wie eine Langzeitbelichtung aufbaut: wo sich das gemeinsame Paar aufhält. Ein paar helle Punkte zeigen das Paar im Moment. Die Wolke neigt sich zum Atom, das stärker zieht; es bekommt einen roten Schein und „δ−“, das andere einen blauen und „δ+“ (über Δχ 1,8 heißen die Beschriftungen „+“ und „−“). Anzeige: die Bindung (z. B. H–Cl, „Chlorwasserstoff, HCl“), „χ H 2,20 · χ Cl 3,16“, „Δχ 0,96 · polar“. Chips: H–H, Cl–Cl, F–F, H–Cl, H–F, C–H, H–O, H–N, C–O, C=O, O=O, N≡N, C–C, C=C, C≡C, Na–Cl, dazu „Eigenes Atompaar wählen“ (H, C, N, O, F, Na, Cl). Eine Skala „Elektronegativitätsdifferenz, Δχ“ von 0 bis 3,3 mit den Bereichen unpolar (bis 0,4), polar (bis 1,8), ionisch, und dem Hinweis „die Grenzen sind Faustregeln“. Drei Kästen: Bindungslänge (pm; „≈“ wenn geschätzt), Bindungsenergie (kJ/mol), Ionencharakter „≈ 21 %“. Ein Regler „Was, wenn Cl stärker oder schwächer zöge?“ (EN 0,5–4,5) mit dem Hinweis „Anteil der Wolke ≈ ½ ± ½ × Ionencharakter, nach Paulings Schätzung 1 − e^(−Δχ²/4). Ein Modell, keine Messung.“ und einem Knopf „Echter Wert“.' },
};

const explainHow = T('A text box and a confidence slider; then the key ideas as checkboxes ("Tick each idea your text really states"); then "Compare with a tightened version": quiet hints only where ticks and text seem to disagree, a "Revise my text" button, a "Show a tightened version" button and "Save to journal". Nothing is graded.', 'Ein Textfeld und ein Sicherheitsregler; dann die Kernideen als Kästchen („Hake jede Idee ab, die dein Text wirklich enthält“); dann „Mit einer geschärften Fassung vergleichen“: leise Hinweise nur, wo Häkchen und Text nicht zusammenpassen, ein Knopf „Meinen Text überarbeiten“, „Eine geschärfte Fassung zeigen“ und „Im Journal speichern“. Nichts wird bewertet.');

q.push(T(`# Orbitarium — student script for units ${units.join(', ')}\n\nWhat the app shows, step by step. Simulations are described in words. Answer each question before reading the feedback key.`, `# Orbitarium – Ablauf für Lernende, Einheiten ${units.join(', ')}\n\nSo zeigt es die App, Schritt für Schritt. Simulationen sind in Worten beschrieben. Beantworte jede Frage, bevor du im Feedback-Schlüssel nachsiehst.`));
for (const U of contents) {
  q.push(`\n\n# ${T('Unit', 'Einheit')} ${U.n}: ${L(U.title)}\n\n${plain(U.lead)}`);
  k.push(`\n## ${T('Unit', 'Einheit')} ${U.n}`);
  H(T('Step 1 of 7 · Warm-up', 'Schritt 1 von 7 · Aufwärmen') + left(0));
  P(T('Review questions from earlier units (three to eight, picked from what is fading). Not part of this script.', 'Wiederholungsfragen aus früheren Einheiten (drei bis acht, ausgewählt nach dem, was verblasst). Nicht Teil dieses Ablaufs.'));
  H(T('Step 2 of 7 · Puzzle', 'Schritt 2 von 7 · Rätsel') + left(1));
  P(`### ${L(U.puzzle.title)}\n${plain(U.puzzle.lead)}`);
  table(U.puzzle.data);
  P(plain(U.puzzle.clash));
  question(U.puzzle.question, '');
  k.push(`- ${T('After the puzzle', 'Nach dem Rätsel')}: ${plain(U.puzzle.after)}`);
  H(`${T('Step 3 of 7 · Explore', 'Schritt 3 von 7 · Erkunden')}: ${L(U.explore.title)}${left(2)}`);
  P(plain(U.explore.intro));
  P(L(ENGINE[U.n]));
  P(T('Things to try. "The ones marked key unlock Continue; the others are there if you are curious. The list ticks itself as you go." Once all key tasks (and at least three) are ticked, a quick check appears.', 'Zum Ausprobieren. „Die als wichtig markierten schalten ‚Weiter‘ frei, die anderen sind für Neugierige. Die Liste hakt sich von selbst ab.“ Sobald alle wichtigen (und mindestens drei) abgehakt sind, erscheint ein Kurz-Check.'));
  U.explore.tasks.forEach((t) => P(`- ${t.key ? T('[KEY] ', '[WICHTIG] ') : t.challenge ? '[BONUS] ' : ''}${plain(t.text)}`));
  for (const [id, n] of Object.entries(U.explore.notes ?? {})) k.push(`- ${T(`Note when task "${id}" is ticked`, `Hinweis, wenn Aufgabe „${id}“ abgehakt ist`)}: ${plain(n)}`);
  question(U.explore.check, T('Quick check.', 'Kurzer Check.'));
  H(T('Step 4 of 7 · Predict', 'Schritt 4 von 7 · Vorhersagen') + left(3));
  P(T('Commit to an answer before the simulation shows you.', 'Lege dich fest, bevor die Simulation es zeigt.'));
  U.predictions.forEach((p, i) => {
    question(p.item, T(`Prediction ${i + 1}.`, `Vorhersage ${i + 1}.`));
    extra(p.item.id, p.extra);
    k.push(`- ${T('Reveal', 'Auflösung')} [${p.item.id}]: ${showText(p.show)}. ${plain(p.revealText)}`);
  });
  H(T('Step 5 of 7 · Worked examples', 'Schritt 5 von 7 · Beispiele') + left(4));
  P(T('A compact engine sits above three example cards, each with a "Show in 3D" button.', 'Über drei Beispielkarten sitzt eine kompakte Simulation; jede Karte hat einen Knopf „In 3D zeigen“.'));
  U.examples.forEach((ex) => { P(`\n**${L(ex.title)}** (${formula(ex.tag)}) — ${ex.numbers.map((n) => `${lang === 'de' ? n.v.replace(/(\d)\.(\d)/g, '$1,$2') : n.v} ${L(n.label)}`).join(', ')}`); P(`  ${plain(ex.body)}`); P(`  ${plain(ex.soWhat)}`); P(`  (${T('Show in 3D', 'In 3D zeigen')}: ${showText(ex.show)})`); });
  question(U.flaw, T('Spot the flaw.', 'Finde den Fehler.'));
  P(T('\nIf both predictions were right at 80 % confidence or more, an optional "Go deeper" question appears:', '\nWaren beide Vorhersagen richtig mit mindestens 80 % Sicherheit, erscheint eine freiwillige Frage „Tiefer gehen“:'));
  question(U.deeper, T('Go deeper (optional).', 'Tiefer gehen (freiwillig).'));
  H(T('Step 6 of 7 · Explain back', 'Schritt 6 von 7 · Erklären') + left(5));
  P(plain(U.explain.prompt));
  P(explainHow);
  U.explain.ideas.forEach((i) => P(`  ☐ ${plain(i.idea)}`));
  k.push(`- ${T('Tightened version', 'Geschärfte Fassung')}: ${plain(U.explain.tightened)}`);
  H(T('Step 7 of 7 · Wrap-up', 'Schritt 7 von 7 · Abschluss') + left(6));
  P(T('A summary of each concept with level and next review date; then the reading. Term pairs only if the second language is on.', 'Eine Übersicht je Konzept mit Stufe und nächstem Wiederholungsdatum; dann der Lesestoff. Begriffspaare nur, wenn die zweite Sprache an ist.'));
  readingsOut(U.readings);
}
const tag = units.join('');
writeFileSync(`${out}/script-u${tag}-${lang}.md`, q.join('\n') + '\n');
writeFileSync(`${out}/feedback-key-u${tag}-${lang}.md`, `# ${T('Feedback key', 'Feedback-Schlüssel')}\n` + k.join('\n') + '\n');
console.log('written', `${out}/script-u${tag}-${lang}.md`, q.length, 'lines;', k.length, 'feedback entries');
