// Unit 3 — Ionization and ion charges, on the Orbital Viewer with the ionization panel.
// Data: successive ionization energies from IONIZATION in atoms.ts (kJ/mol, rounded to whole numbers in text);
// chlorine's electron affinity 349 kJ/mol (CRC Handbook, 348.6); melting points from ions.ts.
import type { Bi } from '../i18n';
import type { UnitContent } from './unitTypes';
import type { Idea } from './unit06';

const b = (en: string, de: string): Bi => ({ en, de });

export const UNIT3: UnitContent = {
  n: 3,
  title: b('Ionization and ion charges', 'Ionisierung und Ionenladungen'),
  lead: b('Why sodium is always {{Na+}}, magnesium {{Mg2+}} and chlorine {{Cl-}}, read from what it costs to pull electrons off.',
    'Warum Natrium immer {{Na+}} ist, Magnesium {{Mg2+}} und Chlor {{Cl-}}: abgelesen an dem, was das Abziehen von Elektronen kostet.'),

  puzzle: {
    title: b('Why does sodium stop at one?', 'Warum hört Natrium bei einem auf?'),
    lead: b('Pulling electrons off an atom one at a time costs energy. For sodium, the second electron costs about nine times as much as the first. The table gives the measured prices in kJ/mol, kilojoules per mole: the energy for a fixed, very large batch of atoms.',
      'Elektronen einzeln von einem Atom abzuziehen kostet Energie. Bei Natrium kostet das zweite Elektron etwa neunmal so viel wie das erste. Die Tabelle zeigt die gemessenen Preise in kJ/mol, Kilojoule pro Mol: die Energie für eine feste, sehr große Menge Atome.'),
    data: {
      caption: b('Energy to pull off each electron in turn, in kJ/mol (single atoms in a gas)', 'Energie für jedes Elektron nacheinander, in kJ/mol (einzelne Atome im Gas)'),
      head: [b('Element', 'Element'), b('1st', '1.'), b('2nd', '2.'), b('3rd', '3.'), b('Ion in compounds', 'Ion in Verbindungen')],
      rows: [
        { cells: [b('Sodium', 'Natrium'), '496', '4562', '6910', '{{Na+}}'] },
        { cells: [b('Magnesium', 'Magnesium'), '738', '1451', '7733', '{{Mg2+}}'] },
      ],
      numeric: [1, 2, 3],
    },
    clash: b('For magnesium the second electron costs only twice the first; its big jump comes one electron later, at the third. Each element stops exactly where its jump is: sodium at {{Na+}}, magnesium at {{Mg2+}}. What makes the price jump?',
      'Bei Magnesium kostet das zweite Elektron nur doppelt so viel wie das erste; sein großer Sprung kommt ein Elektron später, beim dritten. Jedes Element hört genau dort auf, wo sein Sprung liegt: Natrium bei {{Na+}}, Magnesium bei {{Mg2+}}. Was lässt den Preis springen?'),
    question: {
      id: 'u3-puzzle', unit: 3, kind: 'choice', format: 'predict', withConfidence: true, evidence: 'predict',
      concepts: ['u3.ie-cliff'], targets: ['ionization-releases-energy'],
      prompt: b('Your best guess:', 'Deine beste Vermutung:'),
      options: [
        { text: b('The atom is after a full shell, so the electrons it does not need come off by themselves', 'Das Atom ist auf eine volle Schale aus, also lösen sich die überzähligen Elektronen von selbst'), mis: 'ionization-releases-energy' },
        { text: b('Each electron taken makes the atom bigger, so the next one is harder to reach', 'Jedes abgezogene Elektron macht das Atom größer, also ist das nächste schwerer zu erreichen') },
        { text: b('The next electron would have to come from a full inner shell, much closer to the nucleus', 'Das nächste Elektron müsste aus einer vollen inneren Schale kommen, viel näher am Kern'), correct: true },
        { text: b('Electrons come in pairs, and breaking up a pair always costs extra', 'Elektronen kommen paarweise, und ein Paar zu trennen kostet immer extra') },
      ],
      explain: b('Sodium\'s electrons sit 2 · 8 · 1. The first comes from shell 3, far out and shielded by ten inner electrons. The second would come from the full shell 2, close to the nucleus and shielded by only two: 4562 kJ/mol. Magnesium (2 · 8 · 2) has two electrons in shell 3, so its jump comes after the second. In an exam you may still write "{{Na+}} has a noble-gas configuration"; that is true. The reason it forms is the energy balance (unit 4), not a wish of the atom.',
        'Die Elektronen von Natrium sitzen 2 · 8 · 1. Das erste kommt aus Schale 3, weit außen und von zehn inneren Elektronen abgeschirmt. Das zweite käme aus der vollen Schale 2, nah am Kern und nur von zweien abgeschirmt: 4562 kJ/mol. Magnesium (2 · 8 · 2) hat zwei Elektronen in Schale 3, also kommt sein Sprung nach dem zweiten. In der Klausur darfst du weiter schreiben: „{{Na+}} hat Edelgaskonfiguration“; das stimmt. Der Grund, warum es entsteht, ist aber die Energiebilanz (Einheit 4), nicht ein Wunsch des Atoms.'),
    },
    after: b('Next: pull the electrons off yourself and watch where the price jumps.', 'Als Nächstes: Zieh die Elektronen selbst ab und sieh, wo der Preis springt.'),
  },

  explore: {
    title: b('Pulling electrons off', 'Elektronen abziehen'),
    intro: b('The [[ionization]] is the energy needed to pull the outermost electron off a single atom. Each tap on the button below removes one electron and adds a bar for what it cost, in kJ/mol. The biggest jump is drawn red: that is the cliff.',
      'Die [[ionization]] ist die Energie, die man braucht, um das äußerste Elektron von einem einzelnen Atom abzuziehen. Jedes Antippen des Knopfs unten entfernt ein Elektron und fügt einen Balken für seinen Preis hinzu, in kJ/mol. Der größte Sprung ist rot markiert: Dort liegt die Grenze zum Rumpf.'),
    tasks: [
      { id: 'na', key: true, text: b('Pull two electrons off sodium. Which shell did the second one come from?', 'Zieh zwei Elektronen von Natrium ab. Aus welcher Schale kam das zweite?') },
      { id: 'mg', key: true, text: b('Switch to magnesium and pull off three. Where is the cliff now?', 'Wechsle zu Magnesium und zieh drei ab. Wo liegt der Sprung jetzt?') },
      { id: 'al', key: true, text: b('Pull four off aluminium. How many electrons come off before the cliff?', 'Zieh vier von Aluminium ab. Wie viele Elektronen lösen sich vor dem Sprung?') },
      { id: 'row', text: b('Pull the first electron off sodium, then off argon. Which atom holds on harder, and why?', 'Zieh das erste Elektron von Natrium ab, dann von Argon. Welches Atom hält fester, und warum?') },
      { id: 'ca', challenge: true, text: b('Strip calcium down to {{Ca2+}} and compare its orbital boxes with argon\'s. Same arrangement, same atom?', 'Zieh Calcium bis {{Ca2+}} ab und vergleiche seine Orbitalkästchen mit denen von Argon. Gleiche Anordnung, gleiches Atom?') },
    ],
    notes: {
      na: b('Sodium: 496, then 4562 kJ/mol, about nine times more. The second electron would come out of the full second shell, close to the nucleus.', 'Natrium: 496, dann 4562 kJ/mol, etwa neunmal so viel. Das zweite Elektron käme aus der vollen zweiten Schale, nah am Kern.'),
      mg: b('Magnesium: 738, 1451, then 7733. Two electrons in the outer shell, so the cliff comes after two: {{Mg2+}}.', 'Magnesium: 738, 1451, dann 7733. Zwei Elektronen in der Außenschale, also kommt der Sprung nach zweien: {{Mg2+}}.'),
      al: b('Aluminium: 578, 1817, 2745, then 11 577. Three outer electrons, cliff after three: {{Al3+}}.', 'Aluminium: 578, 1817, 2745, dann 11 577. Drei Außenelektronen, Sprung nach dreien: {{Al3+}}.'),
      row: b('Same outer shell, but argon has 18 protons against sodium\'s 11, so its outer electrons feel a much stronger net pull (unit 2): 1521 against 496 kJ/mol.', 'Gleiche Außenschale, aber Argon hat 18 Protonen gegen 11 bei Natrium, also spüren seine Außenelektronen eine viel stärkere Anziehung durch den Kern, eine höhere effektive Kernladung (Einheit 2): 1521 gegen 496 kJ/mol.'),
      ca: b('{{Ca2+}} has argon\'s arrangement, 2 · 8 · 8, but 20 protons instead of 18. It is a calcium ion with a 2+ charge, not argon.', '{{Ca2+}} hat die Anordnung von Argon, 2 · 8 · 8, aber 20 Protonen statt 18. Es ist ein Calcium-Ion mit der Ladung 2+, kein Argon.'),
    },
    check: {
      id: 'u3-check', unit: 3, kind: 'choice', format: 'predict', withConfidence: true, evidence: 'predict',
      concepts: ['u3.ie-trend'], targets: ['ie-falls-across'],
      prompt: b('Chlorine has 17 electrons, sodium 11, and both have their outer electrons in shell 3. Whose outer electron takes more energy to pull off?',
        'Chlor hat 17 Elektronen, Natrium 11, und bei beiden sitzen die Außenelektronen in Schale 3. Wessen Außenelektron kostet mehr Energie?'),
      options: [
        { text: b('Chlorine\'s: same shell, but 17 protons pull on it', 'Das von Chlor: gleiche Schale, aber 17 Protonen ziehen daran'), correct: true },
        { text: b('Sodium\'s: chlorine has more electrons, so it can spare one', 'Das von Natrium: Chlor hat mehr Elektronen, also kann es eins entbehren'), mis: 'ie-falls-across' },
        { text: b('About the same: both electrons sit in shell 3', 'Etwa gleich viel: Beide Elektronen sitzen in Schale 3') },
      ],
      explain: b('Chlorine needs 1251 kJ/mol, sodium 496. Across a row the outer shell stays the same while the protons add up, so the pull on the outer electrons grows: about 7 against 1 in the simple count of unit 2. That count gives the direction, not the factor: the energy rises about 2.5-fold, and Slater\'s refined values are 6.1 against 2.2.',
        'Chlor braucht 1251 kJ/mol, Natrium 496. Entlang einer Periode bleibt die Außenschale gleich, während die Protonen zunehmen, also wächst die Anziehung durch den Kern: Die effektive Kernladung beträgt in der einfachen Zählung aus Einheit 2 etwa 7 gegen 1. Diese Zählung zeigt die Richtung, nicht den Faktor: Die Energie steigt etwa auf das 2,5-Fache, und die genaueren Slater-Werte sind 6,1 gegen 2,2.'),
    },
  },

  predictions: [
    {
      item: {
        id: 'u3-sulfur', unit: 3, kind: 'choice', format: 'predict', withConfidence: true, evidence: 'transfer',
        concepts: ['u3.gain-vs-lose', 'u3.ion-charges'], targets: ['gain-lose-swapped'],
        prompt: b('Sulfur sits in group 16: shells 2 · 8 · 6. When it reacts with sodium, what does sulfur most likely do?', 'Schwefel steht in Gruppe 16 (VI. Hauptgruppe): Schalen 2 · 8 · 6. Was macht Schwefel am ehesten, wenn er mit Natrium reagiert?'),
        options: [
          { text: b('Lose its six outer electrons and become {{S6+}}', 'Seine sechs Außenelektronen abgeben und {{S6+}} werden'), mis: 'gain-lose-swapped' },
          { text: b('Gain two electrons and become {{S2-}}', 'Zwei Elektronen aufnehmen und {{S2-}} werden'), correct: true },
          { text: b('Lose its two unpaired electrons and become {{S2+}}', 'Seine zwei ungepaarten Elektronen abgeben und {{S2+}} werden') },
          { text: b('Keep all its electrons, so no ions form', 'Alle Elektronen behalten, also entstehen keine Ionen') },
        ],
        explain: b('Gaining two electrons from sodium costs far less than losing six, so sulfur ends up as {{S2-}}, with argon\'s arrangement 2 · 8 · 8. Losing six would cost about 26 700 kJ/mol.',
          'Zwei Elektronen von Natrium aufzunehmen kostet weit weniger, als sechs abzugeben, also wird Schwefel zu {{S2-}}, mit der Anordnung von Argon, 2 · 8 · 8. Sechs abzugeben würde etwa 26 700 kJ/mol kosten.'),
      },
      show: { engine: 'atom', z: 16, charge: -2 },
      revealText: b('Sulfur becomes {{S2-}}, the ion in sodium sulfide, {{Na2S}}. Pulling all six outer electrons off would cost about 26 700 kJ/mol; nothing in a reaction pays that back. Adding the first electron gives off a little energy; the second costs some, because {{S-}} already pushes it away, and the attraction between the ions in the solid pays for it (unit 4).',
        'Schwefel wird zu {{S2-}}, dem Ion in Natriumsulfid, {{Na2S}}. Alle sechs Außenelektronen abzuziehen würde etwa 26 700 kJ/mol kosten; das zahlt keine Reaktion zurück. Das erste aufgenommene Elektron setzt etwas Energie frei; das zweite kostet welche, weil {{S-}} es schon abstößt, und die Anziehung zwischen den Ionen im Feststoff bezahlt das (Einheit 4).'),
      extra: {
        title: b('Two in or six out?', 'Zwei rein oder sechs raus?'),
        steps: [
          b('Sulfur has six outer electrons: 2 · 8 · 6. Eight would close the shell, as in argon.', 'Schwefel hat sechs Außenelektronen: 2 · 8 · 6. Acht würden die Schale schließen, wie bei Argon.'),
          b('Way one: pull all six off. One after another, they cost 1000, 2252, 3357, 4556, 7004 and 8496 kJ/mol, about 26 700 in all.', 'Weg eins: alle sechs abziehen. Die sechs Elektronen kosten nacheinander 1000, 2252, 3357, 4556, 7004 und 8496 kJ/mol, zusammen etwa 26 700.'),
          b('Way two: add two. That costs far less, and the pull between the ions in the solid pays it back many times over.', 'Weg zwei: zwei dazunehmen. Das kostet weit weniger, und die Anziehung zwischen den Ionen im Feststoff zahlt es vielfach zurück.'),
          b('So non-metals on the right gain electrons ({{S2-}}, {{O2-}}, {{Cl-}}), and metals on the left lose their few outer ones ({{Na+}}, {{Mg2+}}).', 'Also nehmen Nichtmetalle rechts Elektronen auf ({{S2-}}, {{O2-}}, {{Cl-}}), und Metalle links geben ihre wenigen äußeren ab ({{Na+}}, {{Mg2+}}).'),
        ],
      },
    },
    {
      item: {
        id: 'u3-kplus', unit: 3, kind: 'choice', format: 'predict', withConfidence: true, evidence: 'transfer',
        concepts: ['u3.noble-config', 'u3.ie-definition'], targets: ['ion-is-noble-gas', 'ionization-releases-energy'],
        prompt: b('{{K+}} and argon both have the arrangement 2 · 8 · 8. Pulling an electron off argon costs 1521 kJ/mol. Pulling one more off {{K+}} costs…', '{{K+}} und Argon haben beide die Anordnung 2 · 8 · 8. Ein Elektron von Argon abzuziehen kostet 1521 kJ/mol. Ein weiteres von {{K+}} abzuziehen kostet…'),
        options: [
          { text: b('about the same, since the arrangement is the same', 'etwa gleich viel, da die Anordnung gleich ist'), mis: 'ion-is-noble-gas' },
          { text: b('more, since 19 protons pull on the same 18 electrons', 'mehr, da 19 Protonen an denselben 18 Elektronen ziehen'), correct: true },
          { text: b('less, since {{K+}} has already lost an electron', 'weniger, da {{K+}} schon ein Elektron verloren hat') },
          { text: b('nothing, since a full shell gives the electron away', 'nichts, da eine volle Schale das Elektron von selbst hergibt'), mis: 'ionization-releases-energy' },
        ],
        explain: b('The same 18 electrons, but potassium\'s nucleus has one more proton pulling on them, and the ion is already positive. So the next electron costs more than argon\'s.',
          'Dieselben 18 Elektronen, aber der Kern von Kalium hat ein Proton mehr, das an ihnen zieht, und das Ion ist schon positiv. Also kostet das nächste Elektron mehr als bei Argon.'),
      },
      show: { engine: 'atom', z: 19, pull: 2 },
      revealText: b('3052 kJ/mol, twice argon\'s 1521. Same arrangement, 2 · 8 · 8, but potassium\'s nucleus has 19 protons where argon\'s has 18. That is why {{K+}} is a potassium ion, not argon: it keeps its nucleus, its charge and its chemistry.',
        '3052 kJ/mol, doppelt so viel wie die 1521 von Argon. Gleiche Anordnung, 2 · 8 · 8, aber der Kern von Kalium hat 19 Protonen, der von Argon 18. Deshalb ist {{K+}} ein Kalium-Ion und kein Argon: Es behält seinen Kern, seine Ladung und seine Chemie.'),
      extra: {
        title: b('Same electrons, different nucleus', 'Gleiche Elektronen, anderer Kern'),
        steps: [
          b('Argon: 18 protons, 18 electrons, 2 · 8 · 8. Taking one electron costs 1521 kJ/mol.', 'Argon: 18 Protonen, 18 Elektronen, 2 · 8 · 8. Ein Elektron abzuziehen kostet 1521 kJ/mol.'),
          b('{{K+}}: 19 protons, 18 electrons, also 2 · 8 · 8. One extra proton pulls on the same 18 electrons.', '{{K+}}: 19 Protonen, 18 Elektronen, ebenfalls 2 · 8 · 8. Ein zusätzliches Proton zieht an denselben 18 Elektronen.'),
          b('A stronger pull on the same electrons means a higher price: 3052 kJ/mol for the next one.', 'Eine stärkere Anziehung derselben Elektronen bedeutet einen höheren Preis: 3052 kJ/mol für das nächste.'),
          b('Same arrangement, different element. That is what [[noble-gas-config]] means: the electron arrangement, not the identity.', 'Gleiche Anordnung, anderes Element. Genau das meint [[noble-gas-config]]: die Anordnung der Elektronen, nicht die Identität.'),
        ],
      },
    },
  ],

  examples: [
    {
      title: b('Magnesium', 'Magnesium'), tag: 'Mg',
      show: { engine: 'atom', z: 12, pull: 3 },
      numbers: [{ v: '738', label: b('kJ/mol for the 1st electron', 'kJ/mol für das 1. Elektron') }, { v: '1451', label: b('kJ/mol for the 2nd electron', 'kJ/mol für das 2. Elektron') }, { v: '7733', label: b('kJ/mol for the 3rd electron', 'kJ/mol für das 3. Elektron') }],
      body: b('Two outer electrons in shell 3 come off at 738 and 1451 kJ/mol. The third would come from the full shell 2, close to the nucleus and barely shielded: 7733, more than five times the second. So magnesium forms {{Mg2+}}, never {{Mg3+}}.',
        'Zwei Außenelektronen in Schale 3 lösen sich bei 738 und 1451 kJ/mol. Das dritte käme aus der vollen Schale 2, nah am Kern und kaum abgeschirmt: 7733, mehr als das Fünffache des zweiten. Also bildet Magnesium {{Mg2+}}, nie {{Mg3+}}.'),
      soWhat: b('Two electrons, a double charge: in magnesium oxide both ions are doubly charged, which is why it melts at 2852 °C against 801 °C for table salt (unit 4).',
        'Zwei Elektronen, eine doppelte Ladung: In Magnesiumoxid sind beide Ionen zweifach geladen, deshalb schmilzt es bei 2852 °C, Kochsalz bei 801 °C (Einheit 4).'),
    },
    {
      title: b('Chlorine', 'Chlor'), tag: 'Cl',
      show: { engine: 'atom', z: 17, charge: -1 },
      numbers: [{ v: '1251', label: b('kJ/mol to remove one electron', 'kJ/mol, um ein Elektron abzuziehen') }, { v: '349', label: b('kJ/mol given off when it gains one', 'kJ/mol werden frei, wenn es eines aufnimmt') }, { v: '2 · 8 · 8', label: b('electrons per shell in Cl⁻, as in argon', 'Elektronen pro Schale in Cl⁻, wie bei Argon') }],
      body: b('Chlorine holds its outer electrons tightly: removing one costs 1251 kJ/mol, and the first six alone add up to over 28 000. Adding one electron instead gives off 349 kJ/mol, its [[electron-affinity]], and {{Cl-}} ends up with argon\'s arrangement, 2 · 8 · 8.',
        'Chlor hält seine Außenelektronen fest: Eines abzuziehen kostet 1251 kJ/mol, die ersten sechs zusammen schon über 28 000. Nimmt es dagegen ein Elektron auf, werden 349 kJ/mol frei, seine [[electron-affinity]], und {{Cl-}} hat die Anordnung von Argon, 2 · 8 · 8.'),
      soWhat: b('That is why chlorine turns up as chloride, {{Cl-}}: in table salt, in seawater and in the hydrochloric acid in your stomach.',
        'Deshalb begegnet dir Chlor als Chlorid, {{Cl-}}: im Kochsalz, im Meerwasser und in der Salzsäure in deinem Magen.'),
    },
    {
      title: b('Boron: where the rule stops', 'Bor: wo die Regel aufhört'), tag: 'B',
      show: { engine: 'atom', z: 5, pull: 4 },
      numbers: [{ v: '3', label: b('electrons before the cliff', 'Elektronen vor dem Sprung') }, { v: '6887', label: b('kJ/mol for the first three', 'kJ/mol für die ersten drei') }, { v: '5139', label: b('kJ/mol for aluminium\'s three', 'kJ/mol für die drei von Aluminium') }],
      body: b('Rules of thumb have exceptions, and boron is one: its cliff says three electrons, but boron never forms {{B3+}} ions. Removing the first three costs 6887 kJ/mol, and an ion that small with a triple charge would pull its neighbours\' electrons straight back, so boron shares electrons instead (unit 5). Aluminium, one period down, pays 5139 and does form {{Al3+}} in many solids.',
        'Faustregeln haben Ausnahmen, und Bor ist eine: Sein Sprung sagt drei Elektronen, aber Bor bildet nie {{B3+}}-Ionen. Die ersten drei Elektronen abzuziehen kostet 6887 kJ/mol, und ein so kleines Ion mit dreifacher Ladung würde die Elektronen seiner Nachbarn gleich wieder an sich ziehen, also teilt Bor stattdessen Elektronen (Einheit 5). Aluminium, eine Periode tiefer, zahlt 5139 und bildet in vielen Feststoffen {{Al3+}}.'),
      soWhat: b('The cliff counts the electrons outside the core. Whether an ion really forms depends on what pays for it, and that is unit 4.',
        'Der Sprung zählt die Elektronen außerhalb des Rumpfs. Ob wirklich ein Ion entsteht, hängt davon ab, was es bezahlt, und das ist Einheit 4.'),
    },
  ],

  flaw: {
    id: 'u3-flaw', unit: 3, kind: 'flaw', format: 'flaw', evidence: 'transfer', concepts: ['u3.ie-definition'], targets: ['ionization-releases-energy'],
    prompt: b('Where does this reasoning first go wrong?', 'Wo geht diese Überlegung zum ersten Mal schief?'),
    lines: [
      b('Sodium has one electron in its outer shell: 2 · 8 · 1.', 'Natrium hat ein Elektron in seiner Außenschale: 2 · 8 · 1.'),
      b('Removing it leaves {{Na+}} with the arrangement 2 · 8, like neon.', 'Wird es entfernt, hat {{Na+}} die Anordnung 2 · 8, wie Neon.'),
      b('Every atom is after that full-shell arrangement, so losing the electron gives off energy and happens by itself.', 'Jedes Atom ist auf diese Anordnung mit voller Schale aus, also setzt die Abgabe des Elektrons Energie frei und geschieht von selbst.'),
    ],
    flaw: 2,
    near: [{ step: 1, note: b('Step 2 is true as written: {{Na+}} does have neon\'s arrangement, 2 · 8. It is still sodium, but the step does not claim otherwise. The slip comes one step later, in the claim about energy.', 'Schritt 2 stimmt so, wie er dasteht: {{Na+}} hat wirklich die Anordnung von Neon, 2 · 8. Es bleibt Natrium, aber das bestreitet der Schritt auch nicht. Der Fehler kommt einen Schritt später, bei der Aussage über die Energie.') }],
    explain: b('Step 3 is the only wrong step. Step 1 is true: sodium is 2 · 8 · 1. Step 2 is true: {{Na+}} has neon\'s arrangement. But removing an electron always costs energy, 496 kJ/mol for sodium, so it never happens by itself. {{Na+}} ions form in reactions because something else pays the 496 back, such as the attraction between the ions in a salt (unit 4).',
      'Schritt 3 ist der einzige Fehler. Schritt 1 stimmt: Natrium ist 2 · 8 · 1. Schritt 2 stimmt: {{Na+}} hat die Anordnung von Neon. Aber ein Elektron abzuziehen kostet immer Energie, bei Natrium 496 kJ/mol, also geschieht es nie von selbst. {{Na+}}-Ionen entstehen in Reaktionen, weil etwas anderes die 496 zurückzahlt, etwa die Anziehung zwischen den Ionen in einem Salz (Einheit 4).'),
  },

  deeper: {
    id: 'u3-deeper', unit: 3, kind: 'rank', format: 'rank', evidence: 'transfer', concepts: ['u3.ie-trend'],
    prompt: b('Beryllium 2s², boron 2s² 2p¹, nitrogen 2s² 2p³, oxygen 2s² 2p⁴. Rank them by first ionization energy, highest first. Across a row the trend rises, but a new subshell, or a first shared box, makes an electron easier to remove.',
      'Beryllium 2s², Bor 2s² 2p¹, Stickstoff 2s² 2p³, Sauerstoff 2s² 2p⁴. Ordne nach erster Ionisierungsenergie, die höchste zuerst. Entlang einer Periode steigt der Trend, aber eine neue Unterschale oder ein erstes doppelt besetztes Kästchen macht ein Elektron leichter abziehbar.'),
    order: [b('nitrogen', 'Stickstoff'), b('oxygen', 'Sauerstoff'), b('beryllium', 'Beryllium'), b('boron', 'Bor')],
    explain: b('1402, 1314, 900, 801 kJ/mol. Nitrogen and oxygen sit further along the row, so both beat beryllium and boron. But oxygen\'s fourth 2p electron shares a box with another, and the two repel, so oxygen dips below nitrogen. Boron\'s electron is the first in 2p, slightly higher in energy and partly shielded by the 2s pair, so boron dips below beryllium.',
      '1402, 1314, 900, 801 kJ/mol. Stickstoff und Sauerstoff stehen weiter rechts in der Periode, also liegen beide über Beryllium und Bor. Aber das vierte 2p-Elektron von Sauerstoff teilt sich ein Kästchen mit einem anderen, und die beiden stoßen sich ab, also fällt Sauerstoff unter Stickstoff. Das Elektron von Bor ist das erste in 2p, energetisch etwas höher und vom 2s-Paar teilweise abgeschirmt, also fällt Bor unter Beryllium.'),
  },

  explain: {
    prompt: b('In your own words: what decides the charge of the ion an element forms?', 'In eigenen Worten: Was entscheidet über die Ladung des Ions, das ein Element bildet?'),
    ideas: [
      { id: 'cost', concept: 'u3.ie-definition', idea: b('Pulling an electron off always costs energy, and each further one costs more', 'Ein Elektron abzuziehen kostet immer Energie, und jedes weitere kostet mehr'),
        contra: {
          en: /((losing|removing|giving (up|away)|loses?|removes?|gives? (up|away)) (an |the |its |one |their |that )?(outer |extra |spare )?electrons?(?:(?!\bnot\b|n't|never|\bno\b).){0,20}\b(releases?|gives? off|gives? out|frees?) (energy|heat))|(electrons? (comes?|come) off (by (itself|themselves)|on (its|their) own))/,
          de: /(abgabe|abgeben|abzugeben|verlier\w*|entfern\w*|abspalt\w*)(?:(?!nicht|kein).){0,40}(setzt(?:(?!nicht|kein).){0,25}frei|wird (\w+ )?energie frei|von (allein|selbst))/,
        },
        en: /(cost|price|takes? (some |more |a lot of )?energy|needs? (some |more )?energy|energy (is )?(needed|required|input|put in)|requires? (more )?energy|ioni[sz]ation energ|\bies?\b|\bkj\b)/,
        de: /(kost|preis|energie (nötig|aufwand|benötig|zuführ|aufbring)|braucht (\w+ )?energie|energieaufwand|ionisierungsenergie|\bie\b|\bkj\b)/ },
      { id: 'cliff', concept: 'u3.ie-cliff', idea: b('The cost jumps once the next electron would come from a full inner shell: the cliff', 'Der Preis springt, sobald das nächste Elektron aus einer vollen inneren Schale käme: der Sprung'),
        en: /(jump|cliff|leap|shoots? up|sharp(ly)? (rise|increase|jump)|huge (rise|increase|jump)|big (rise|increase|jump)|much (more|higher|harder|bigger)|inner shell|full shell (below|underneath|beneath|inside)|shell (below|underneath|beneath)|\bcore\b)/,
        de: /(sprung|springt|steil|riesig|schießt|viel (mehr|höher|teurer|größer)|innere[nrs]? schale|rumpf|darunterliegende|volle schale darunter|abgeschlossene schale)/ },
      { id: 'charge', concept: 'u3.ion-charges', idea: b('The charge equals the electrons lost or gained: {{Na+}}, {{Mg2+}}, {{Cl-}}', 'Die Ladung entspricht den abgegebenen oder aufgenommenen Elektronen: {{Na+}}, {{Mg2+}}, {{Cl-}}'),
        // Charges are matched in ASCII (the matcher turns "Mg²⁺" into "mg2+"). Evidence: the word charge tied to
        // electrons lost or gained, "plus one because it lost one", or a give/take step ending in an ion formula.
        en: /((group|column|outer electrons?|valence electrons?).{0,60}(charge|positive|negative|plus|minus|\d ?[+-]))|((charge|\bions?\b).{0,60}(group|column|outer electrons?|valence|lost|lose|gained|gain|removed|added|given (up|away)|taken|took))|(electrons? (before|lost|removed|given|gained|taken|added).{0,50}(group|charge))|(\b(\d|one|two|three) ?(\+|-|plus|minus|positive|negative)?.{0,3}charges?\b)|(charges? (of|is|equals?) (\d|one|two|three|the (number|group)))|((that|as|so) many (positive |negative )?charges?)|(charges?.{0,20}(per|for each|for every) electron)|((plus|minus|positive|negative) (one|two|three|\d)?\b.{0,40}\b(lost|loses?|losing|gave|gives?|given|took|takes?|taken|gained|gains?|removed)\b)|(\b(lost|loses?|gave|gives?|took|takes?|gained|gains?) (\w+ ){0,3}(one|two|three|\d) (\w+ )?electrons?.{0,30}(plus|minus|positive|negative|charge|\b[a-z]{1,2}\d?[+-]))|(\b(lost|loses?|gives?|gave|takes?|took|gains?|gained) (\w+ ){0,2}(one|two|three|\d)( electrons?)? ?(->|=>|→|=|,|:) ?[a-z]{1,2}\d?[+-])|(\b(becomes?|became|forms?|formed|turns? into|ends? up as) (an? |the )?[a-z]{1,2}\d?[+-](?![a-z]))/,
        de: /((gruppe|hauptgruppe|spalte|außenelektron|valenzelektron).{0,60}(ladung|positiv|negativ|plus|minus|\d ?[+-]))|((ladung|\bionen?\b).{0,60}(gruppe|spalte|außenelektron|valenz|abgegeben|aufgenommen|abgibt|aufnimmt|verloren|verliert))|((\d|ein|zwei|drei)\w* ?(fach )?(positiv|negativ)\w* geladen)|((\d|ein|zwei|drei)\w*fach\w* ladung)|((genauso|so) viele (positive |negative )?ladung)|(ladung\w*.{0,20}pro (\w+ )?elektron)|(ladung.{0,30}(so groß wie|gleich|entspricht|zählt).{0,30}(anzahl|zahl))|((anzahl|zahl) der (abgegebenen|aufgenommenen))|((plus|minus|positiv|negativ) ?(eins|zwei|drei|\d)?.{0,40}(abgegeben|aufgenommen|abgibt|aufnimmt|verloren|verliert|gibt \w+ ab|nimmt \w+ auf))|((gibt|geben|nimmt|nehmen|verliert) (\d|ein|eins|zwei|drei)\w* (elektron\w* )?(ab|auf)? ?(->|=>|→|=|,|:) ?[a-z]{1,2}\d?[+-])|(\b(wird|werden|entsteht|entstehen|bildet|bilden) (zu(m)? )?(einem )?[a-z]{1,2}\d?[+-](?![a-z]))/ },
      { id: 'noble', concept: 'u3.noble-config', idea: b('The ion usually ends up with a noble gas\'s electron arrangement, but stays the same element', 'Das Ion hat danach meist die Elektronenanordnung eines Edelgases, bleibt aber dasselbe Element'),
        contra: {
          en: /(?<!not |n't |never )(becomes?|turns? into|is now|changes? into|turned into) (a |an |the )?(noble gas|neon|argon)\b/,
          de: /(?<!nicht |kein )(wird|werden) (zu(m)? )?(einem )?(edelgas|neon|argon)\b|(?<!nicht )(ist|sind) (jetzt|dann|nun|danach) (ein )?(edelgas|neon|argon)\b/,
        },
        // Only the distinguishing part counts: same element, own nucleus or protons, not the noble gas itself.
        en: /((still|stays?|remains?|keeps?|is still|it's still|its still) (the same element|an? \w+ ion|sodium|potassium|chlorine|magnesium|calcium|oxygen|sulfur|fluorine|aluminium|aluminum|its (own )?(nucleus|protons|identity|element))( because (the |its )?(nucleus|protons|number of protons) (doesn't change|does not change|don't change|do not change|never changes|stays the same|stay the same))?)|((nucleus|protons|number of protons) (doesn't change|does not change|don't change|do not change|never changes))|((same|own|original) (element|nucleus|nuclear charge|number of protons|protons|identity))|((keeps?|keeping) (its|their) (own )?(nucleus|nuclei|nuclear charge|protons|identity|element))|(not neon|not argon|not a noble gas|not the noble gas|isn't neon|isn't argon|isn't a noble gas|doesn't become|does not become|doesn't turn|does not turn|never becomes|never turns)|((more|different|extra|other) (number of )?protons)|((nucleus|protons|proton number) (stays?|decides?|stay the same|is the same|are the same|defines?|determines?))/,
        de: /((bleibt|bleiben|ist (immer )?noch|behält|behalten) (aber )?(\w+ ){0,2}(element|natrium|kalium|chlor|magnesium|calcium|sauerstoff|schwefel|fluor|aluminium|kern|protonen|identität)(,? weil (sich )?(der kern|die protonenzahl|die protonen|die zahl der protonen) (sich )?(nicht ändert|nicht ändern|gleich bleibt|gleich bleiben))?)|((kern|protonenzahl|protonen) (sich )?(nicht ändert|nicht ändern|ändert sich nicht|ändern sich nicht))|((gleiche|selbe|dasselbe|derselbe|eigene[nmrs]?|ursprüngliche[nmrs]?) (element|kern|protonenzahl|protonen|identität))|(kein edelgas|kein neon|kein argon|nicht zum edelgas|nicht zu neon|nicht zu argon|nicht zu einem edelgas)|((mehr|andere|zusätzliche) protonen)|((kern|protonenzahl|protonen) (bleibt|bleiben|entscheidet|bestimmt|legt))/ },
      { id: 'side', concept: 'u3.gain-vs-lose', idea: b('Metals on the left lose electrons; non-metals on the right gain them', 'Metalle links geben Elektronen ab, Nichtmetalle rechts nehmen welche auf'),
        contra: {
          en: /((?<!non-?|non )\bmetals?\b(?:(?!\bnot\b|n't|never).){0,30}\b(gain|gains|take|takes|accept|accepts) (\w+ )?electrons?)|(non-?metals?(?:(?!\bnot\b|n't|never).){0,30}\b(lose|loses|give|gives) (\w+ )?(away |up )?electrons?)/,
          de: /((?<!nicht)metall\w* (nehmen|nimmt) (\w+ ){0,2}elektronen? auf)|(nichtmetall\w* (geben|gibt) (\w+ ){0,2}elektronen? ab)/,
        },
        en: /((?<!non-?|non )\bmetals?\b.{0,50}\b(lose|loses|losing|give|gives|giving|donat\w*|positive|cations?))|(non-?metals?.{0,50}\b(gain|gains|gaining|take|takes|taking|accept\w*|pick up|negative|anions?|high (ies?|ioni[sz]ation)))|(\bleft\b.{0,40}\b(lose|give|positive))|(\bright\b.{0,40}\b(gain|take|negative))/,
        de: /((?<!nicht)metall\w*.{0,50}(abgeb|gibt|geben|abzugeben|positiv|kation))|(nichtmetall\w*.{0,50}(aufnehm|nimmt|nehmen|aufzunehmen|negativ|anion))|(links.{0,40}(abgeb|gibt|geben|positiv))|(rechts.{0,40}(aufnehm|nimmt|nehmen|negativ))/ },
    ] as Idea[],
    tightened: b('Pulling an electron off an atom always costs energy, and each further electron costs more. The price jumps once the next electron would have to come from a full inner shell; that cliff shows how many electrons a metal on the left gives up, and its ion carries that many positive charges: {{Na+}}, {{Mg2+}}, {{Al3+}}. Non-metals on the right gain one or two electrons instead, because that costs far less than losing six or seven, and become negative ions such as {{Cl-}} and {{O2-}}. Either way the ion usually ends up with a noble gas\'s electron arrangement, but it keeps its own nucleus: {{Na+}} is sodium, not neon.',
      'Ein Elektron von einem Atom abzuziehen kostet immer Energie, und jedes weitere kostet mehr. Der Preis springt, sobald das nächste Elektron aus einer vollen inneren Schale kommen müsste; dieser Sprung zeigt, wie viele Elektronen ein Metall links abgibt, und sein Ion trägt genauso viele positive Ladungen: {{Na+}}, {{Mg2+}}, {{Al3+}}. Nichtmetalle rechts nehmen stattdessen ein oder zwei Elektronen auf, weil das weit weniger kostet, als sechs oder sieben abzugeben, und werden zu negativen Ionen wie {{Cl-}} und {{O2-}}. In beiden Fällen hat das Ion danach meist die Elektronenanordnung eines Edelgases, behält aber seinen eigenen Kern: {{Na+}} ist Natrium, kein Neon.'),
  },

  terms: ['ionization', 'cation', 'anion', 'noble-gas-config', 'electron-affinity'],

  readings: [
    {
      lang: 'en', kind: 'quick',
      title: b('Ionization energy and electron affinity', 'Ionization energy and electron affinity'), source: 'Purdue University, General Chemistry topic review',
      url: 'https://chemed.chem.purdue.edu/genchem/topicreview/bp/ch7/ie_ea.php',
      lookFor: [
        b('The "almost 10 times" for sodium\'s second electron. Check it against your two bars: 496 and 4562 kJ/mol.', ''),
        b('Why it says you should not look for {{Al4+}}. Which red bar told you the same?', ''),
        b('Chlorine\'s electron affinity: the page gives 328.8 kJ/mol, current data tables 349. Either way it is less than sodium\'s 496, so what pays the difference when salt forms? (Unit 4.)', ''),
      ],
    },
    {
      lang: 'en', kind: 'deeper',
      title: b('Ionisation energy', 'Ionisation energy'), source: 'chemguide',
      url: 'https://www.chemguide.co.uk/atoms/properties/ies.html',
      lookFor: [
        b('Its argument for why sodium\'s value is lower than lithium\'s: what cancels out, and what is "the only factor left"?', ''),
        b('Its numbers for beryllium to boron and magnesium to aluminium. Do they match the dips in your go-deeper ranking and the viewer\'s 738 and 578?', ''),
        b('Why it says oxygen\'s electron is easier to remove than nitrogen\'s. Which box diagram from unit 1 shows the pair it means?', ''),
      ],
    },
    {
      lang: 'de', kind: 'quick',
      title: b('Ionisierungsenergie', 'Ionisierungsenergie'), source: 'Studyflix',
      url: 'https://studyflix.de/chemie/ionisierungsenergie-1841',
      lookFor: [
        b('', 'Den Wert für Natrium in eV (Elektronenvolt, eine Energieeinheit für ein einzelnes Atom). Mal 96,485 gerechnet: Passt das zu den 496 kJ/mol im Orbital-Betrachter?'),
        b('', 'Die zwei Ausnahmen in Gruppe 2 und Gruppe 15 (der Artikel sagt II. und V. Hauptgruppe). Findest du sie in deiner Tiefer-gehen-Rangfolge (Be, B, N, O) wieder?'),
        b('', 'Wie der Artikel das Sinken innerhalb einer Gruppe erklärt: mit mehr Elektronen dazwischen. Was fehlt, wenn du an die zusätzlichen Protonen denkst? (Einheit 2: Den Ausschlag gibt der Abstand.)'),
      ],
    },
  ],

  misconceptions: [
    { id: 'ionization-releases-energy', name: b('Losing an electron to reach a full shell gives off energy', 'Ein Elektron abzugeben, um eine volle Schale zu erreichen, setzt Energie frei') },
    { id: 'ion-is-noble-gas', name: b('An ion with a noble gas\'s arrangement becomes that noble gas', 'Ein Ion mit Edelgaskonfiguration wird zu diesem Edelgas') },
    { id: 'ie-falls-across', name: b('Ionization energy falls across a period because atoms have more electrons to spare', 'Die Ionisierungsenergie sinkt in der Periode, weil die Atome mehr Elektronen übrig haben') },
    { id: 'gain-lose-swapped', name: b('Losing and gaining swapped: metals lose electrons, non-metals gain them', 'Abgeben und Aufnehmen verwechselt: Metalle geben ab, Nichtmetalle nehmen auf') },
  ],

  glossary: {
    cation: {
      en: 'cation', de: 'Kation', unit: 3,
      def: { en: 'A positive ion: an atom that has lost one or more electrons, such as {{Na+}} or {{Mg2+}}.', de: 'Ein positives Ion: ein Atom, das ein oder mehrere Elektronen abgegeben hat, etwa {{Na+}} oder {{Mg2+}}.' },
    },
    anion: {
      en: 'anion', de: 'Anion', unit: 3,
      def: { en: 'A negative ion: an atom that has gained one or more electrons, such as {{Cl-}} or {{O2-}}.', de: 'Ein negatives Ion: ein Atom, das ein oder mehrere Elektronen aufgenommen hat, etwa {{Cl-}} oder {{O2-}}.' },
    },
    'noble-gas-config': {
      en: 'noble-gas configuration', de: 'Edelgaskonfiguration', unit: 3,
      def: { en: 'The electron arrangement of a noble gas, such as 2 · 8 · 8 for argon. Ions such as {{K+}} and {{Cl-}} share it but stay potassium and chlorine.', de: 'Die Elektronenanordnung eines Edelgases, etwa 2 · 8 · 8 bei Argon. Ionen wie {{K+}} und {{Cl-}} teilen sie, bleiben aber Kalium und Chlor.' },
    },
    'electron-affinity': {
      en: 'electron affinity', de: 'Elektronenaffinität', unit: 3,
      def: { en: 'The energy given off when a single atom gains one electron: 349 kJ/mol for chlorine.', de: 'Die Energie, die frei wird, wenn ein einzelnes Atom ein Elektron aufnimmt: 349 kJ/mol bei Chlor.' },
      falseFriend: { en: 'Books differ on the sign: some write −349 kJ/mol (energy given off), others +349.', de: 'Bücher unterscheiden sich beim Vorzeichen: Manche schreiben −349 kJ/mol (Energie wird frei), andere +349.' },
    },
  },
};
