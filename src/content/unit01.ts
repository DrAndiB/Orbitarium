// Unit 1 — Shells and orbitals: hydrogen's ladder of energies, then atoms built electron by electron.
// Data: hydrogen wavelengths from the app's model (atoms.ts: 13.6 eV/n², hc = 1239.84 eV·nm) and measured
// Balmer lines (656.3, 486.1, 434.0, 410.2 nm, in air); sodium D lines 589.0 and 589.6 nm; configurations from
// atoms.ts groundConfig (Cr and Cu exceptions included). Helium: seen in sunlight 1868, found on Earth 1895.
import type { Bi } from '../i18n';
import type { ChoiceItem, RankItem, EstimateItem, FlawItem } from './items';
import type { Idea, Reading, ExploreTask } from './unit06';
import type { UnitContent } from './unitTypes';

const b = (en: string, de: string): Bi => ({ en, de });

export const UNIT1: UnitContent = {
  n: 1,
  title: b('Shells and orbitals', 'Schalen und Orbitale'),
  lead: b('Why a neon sign glows red-orange, why shells hold 2, 8 and 18 electrons, and where electron number 19 goes.',
    'Warum eine Neonröhre rotorange leuchtet, warum Schalen 2, 8 und 18 Elektronen fassen und wohin Elektron Nummer 19 kommt.'),

  puzzle: {
    title: b('Why only four colours?', 'Warum nur vier Farben?'),
    lead: b('Run electricity through a tube of hydrogen gas and it glows pink-violet. Send that light through a prism and you do not get a rainbow. You get four thin lines, always in the same places. Their wavelengths are given in nanometres (nm), millionths of a millimetre.',
      'Schick Strom durch eine Röhre mit Wasserstoffgas, und sie leuchtet rosaviolett. Schickst du dieses Licht durch ein Prisma, entsteht kein Regenbogen, sondern vier dünne Linien, immer an denselben Stellen. Ihre Wellenlängen stehen in Nanometern (nm), Millionstel Millimetern.'),
    data: {
      caption: b('Hydrogen\'s visible light through a prism: four lines, nothing in between (measured, rounded)', 'Das sichtbare Licht von Wasserstoff durch ein Prisma: vier Linien, nichts dazwischen (gemessen, gerundet)'),
      head: [b('Colour', 'Farbe'), b('Wavelength (nm)', 'Wellenlänge (nm)')],
      rows: [
        { cells: [b('red', 'rot'), '656'] },
        { cells: [b('blue-green', 'blaugrün'), '486'] },
        { cells: [b('blue-violet', 'blauviolett'), '434'] },
        { cells: [b('violet', 'violett'), '410'] },
      ],
      numeric: [1],
    },
    clash: b('The atoms in the hot gas are knocked about at all sorts of speeds. If their electrons could hold any amount of energy, the gas would glow in every colour, like the glowing wire of an old light bulb. Instead, every hydrogen atom, in any lab, gives off these same four bright visible lines (a few fainter ones crowd in at the violet edge). What does that say about the electron inside?',
      'Die Atome im heißen Gas werden mit allen möglichen Geschwindigkeiten herumgestoßen. Könnten ihre Elektronen jede beliebige Energiemenge aufnehmen, würde das Gas in allen Farben leuchten, wie der glühende Draht einer alten Glühbirne. Stattdessen gibt jedes Wasserstoffatom, in jedem Labor, dieselben vier hellen sichtbaren Linien ab (am violetten Rand drängen sich noch ein paar schwächere). Was sagt das über das Elektron darin?'),
    question: {
      id: 'u1-puzzle', unit: 1, kind: 'choice', format: 'predict', withConfidence: true, evidence: 'predict',
      concepts: ['u1.levels-light'], targets: ['any-energy'],
      prompt: b('Your best guess:', 'Deine beste Vermutung:'),
      options: [
        { text: b('It can only hold certain amounts of energy, so it can only drop by certain amounts', 'Es kann nur bestimmte Energiemengen haben, also nur um bestimmte Beträge fallen'), correct: true },
        { text: b('It loses energy gradually as it spirals in towards the nucleus', 'Es verliert nach und nach Energie, während es spiralförmig zum Kern stürzt'), mis: 'any-energy' },
        { text: b('The glass of the tube lets only four colours through', 'Das Glas der Röhre lässt nur vier Farben durch') },
        { text: b('Hydrogen atoms come in four sizes, one for each colour', 'Wasserstoffatome gibt es in vier Größen, eine pro Farbe') },
      ],
      explain: b('Its electron can only sit on certain [[energy-level|energy levels]], like the rungs of a ladder. When it drops from a higher rung to a lower one, the difference leaves as one packet of light, a photon, and each possible drop has its own exact colour. The four bright visible lines are the four drops that end on rung 2.',
        'Sein Elektron kann nur auf bestimmten [[energy-level|Energieniveaus]] sitzen, wie auf den Sprossen einer Leiter. Fällt es von einer höheren Sprosse auf eine tiefere, verlässt der Unterschied das Atom als ein Photon (ein Lichtteilchen), und jeder mögliche Sprung hat seine eigene, genaue Farbe. Die vier hellen sichtbaren Linien sind die vier Sprünge, die auf Sprosse 2 enden.'),
    } as ChoiceItem,
    after: b('Next: make those drops yourself, then build atoms one electron at a time.',
      'Als Nächstes: Lass das Elektron diese Sprünge selbst machen und baue dann Atome Elektron für Elektron auf.'),
  },

  explore: {
    title: b('The Orbital Viewer', 'Der Orbital-Betrachter'),
    intro: b('Start with hydrogen\'s ladder of energy levels, then build atoms one electron at a time: each new electron takes the lowest free place. Energies on the ladder are in eV (electronvolts), a tiny energy unit made for single atoms. The boxes show how each shell splits into subshells, s, p, d and f; a line like 1s² 2s² 2p⁶ lists them, and the small raised number counts the electrons in each. You can switch between two pictures of the same atom: shells, Bohr\'s simpler model from 1913, and orbital clouds, the regions where an electron is likely to be found.',
      'Beginne mit der Energieleiter von Wasserstoff und baue dann Atome Elektron für Elektron auf: Jedes neue Elektron nimmt den niedrigsten freien Platz. Die Energien auf der Leiter stehen in eV (Elektronenvolt), einer winzigen Energieeinheit für einzelne Atome. Die Kästchen zeigen, wie sich jede Schale in Unterschalen teilt, s, p, d und f; eine Angabe wie 1s² 2s² 2p⁶ zählt sie auf, und die kleine hochgestellte Zahl gibt die Elektronen darin an. Du kannst zwischen zwei Bildern desselben Atoms wechseln: den Schalen, dem einfacheren Bohr\'schen Atommodell von 1913, und den Orbitalwolken, den Bereichen, in denen sich ein Elektron wahrscheinlich aufhält.'),
    tasks: [
      { id: 'jump', key: true, text: b('On hydrogen\'s ladder, let the electron drop from n = 3 to n = 2, then from n = 4 to n = 2. Which is the bigger drop, and what colour is its light?', 'Lass auf der Leiter von Wasserstoff das Elektron von n = 3 auf n = 2 springen, dann von n = 4 auf n = 2. Welcher Sprung ist größer, und welche Farbe hat sein Licht?') },
      { id: 'fill', key: true, text: b('Step from lithium to neon, one element at a time, and watch shell 2 fill.', 'Geh von Lithium bis Neon, ein Element nach dem anderen, und sieh zu, wie sich Schale 2 füllt.') },
      { id: 'cloud', key: true, text: b('Switch to the cloud picture and tap a p row in the boxes. What shape does a p orbital have?', 'Schalte auf die Wolken und tippe in den Kästchen eine p-Zeile an. Welche Form hat ein p-Orbital?') },
      { id: 'k', key: true, text: b('Keep going to potassium (Z = 19). Which subshell does its newest electron go into?', 'Geh weiter bis Kalium (Z = 19). In welche Unterschale kommt sein neuestes Elektron?') },
      { id: 'uv', text: b('Let the electron drop from n = 2 to n = 1. Why does the spectrum strip stay dark?', 'Lass das Elektron von n = 2 auf n = 1 springen. Warum bleibt der Spektralstreifen dunkel?') },
      { id: 'cr', challenge: true, text: b('Between potassium (19) and zinc (30), find an element whose boxes break the filling pattern.', 'Finde zwischen Kalium (19) und Zink (30) ein Element, dessen Kästchen aus der Reihe tanzen.') },
    ] as ExploreTask[],
    notes: {
      jump: b('4 → 2 is the bigger drop. Its light is blue-green, 486 nm; 3 → 2 gives red, 656 nm.',
        '4 → 2 ist der größere Sprung. Sein Licht ist blaugrün, 486 nm; 3 → 2 gibt Rot, 656 nm.'),
      fill: b('Shell 2 holds eight: two in 2s and six in 2p. At neon both are full, and period 2 of the periodic table ends.',
        'Schale 2 fasst acht: zwei in 2s und sechs in 2p. Bei Neon sind beide voll, und die 2. Periode endet.'),
      cloud: b('A p orbital has two lobes on opposite sides of the nucleus, and each p subshell has three of them, at right angles. The cloud shows where the electron is likely to be found, not a route it travels.',
        'Ein p-Orbital hat zwei Keulen auf gegenüberliegenden Seiten des Kerns, und jede p-Unterschale hat drei davon, im rechten Winkel zueinander. Die Wolke zeigt, wo das Elektron wahrscheinlich anzutreffen ist, keinen Weg, den es zurücklegt.'),
      k: b('4s, not 3d. For potassium, 4s is lower in energy than 3d, so shell 4 starts while shell 3 still has ten empty places.',
        '4s, nicht 3d. Bei Kalium liegt 4s energetisch tiefer als 3d, also beginnt Schale 4, während Schale 3 noch zehn freie Plätze hat.'),
      uv: b('2 → 1 is a big drop, 10.2 eV, and its light is ultraviolet, 122 nm: invisible to the eye. Every drop gives one exact colour, but not every colour is one we can see.',
        '2 → 1 ist ein großer Sprung, 10,2 eV, und sein Licht ist ultraviolett, 122 nm: unsichtbar fürs Auge. Jeder Sprung gibt eine genaue Farbe, aber nicht jede können wir sehen.'),
      cr: b('Chromium is [Ar] 3d⁵ 4s¹ and copper [Ar] 3d¹⁰ 4s¹, not 3d⁴ 4s² and 3d⁹ 4s². For these atoms 4s and 3d are so close in energy that moving one 4s electron into 3d comes out lower; for chromium it leaves six electrons unpaired, with parallel spins. The rule of thumb about half-full and full sets works here but not everywhere: the measured configuration is what counts.',
        'Chrom ist [Ar] 3d⁵ 4s¹ und Kupfer [Ar] 3d¹⁰ 4s¹, nicht 3d⁴ 4s² und 3d⁹ 4s². Bei diesen Atomen liegen 4s und 3d so nah beieinander, dass es energetisch günstiger ist, ein 4s-Elektron nach 3d zu verschieben; bei Chrom bleiben so sechs Elektronen ungepaart, mit parallelen Spins. Die Faustregel von halb oder ganz gefüllten Sätzen passt hier, aber nicht überall: Es zählt die gemessene Konfiguration.'),
    },
    check: {
      id: 'u1-check', unit: 1, kind: 'rank', format: 'rank', evidence: 'predict', concepts: ['u1.filling-order'], targets: ['fill-by-shell'],
      prompt: b('Order these subshells by when they fill, first one first.', 'Ordne diese Unterschalen danach, wann sie sich füllen, die erste zuerst.'),
      order: [b('3p', '3p'), b('4s', '4s'), b('3d', '3d'), b('4p', '4p')],
      explain: b('3p → 4s → 3d → 4p. Argon completes 3p. Then potassium and calcium fill 4s, because for them 4s is lower in energy than 3d. Scandium to zinc fill 3d, and gallium starts 4p.',
        '3p → 4s → 3d → 4p. Argon vervollständigt 3p. Dann füllen Kalium und Calcium 4s, weil 4s bei ihnen energetisch tiefer liegt als 3d. Scandium bis Zink füllen 3d, und Gallium beginnt 4p.'),
    } as RankItem,
  },

  predictions: [
    {
      item: {
        id: 'u1-rb', unit: 1, kind: 'choice', format: 'predict', withConfidence: true, evidence: 'transfer',
        concepts: ['u1.filling-order'], targets: ['fill-by-shell'],
        prompt: b('Krypton (Z = 36) ends period 4 with shells 2, 8, 18, 8. Shell 4 still has room for 4d and 4f electrons. Where does rubidium\'s 37th electron go?',
          'Krypton (Z = 36) beendet die 4. Periode mit den Schalen 2, 8, 18, 8. Schale 4 hat noch Platz für 4d- und 4f-Elektronen. Wohin kommt das 37. Elektron von Rubidium?'),
        options: [
          { text: b('Into 4d: shell 4 has to fill up first', 'In 4d: Schale 4 muss sich zuerst füllen'), mis: 'fill-by-shell' },
          { text: b('Into 5s: it starts a new shell, as potassium did', 'In 5s: Es beginnt eine neue Schale, wie bei Kalium'), correct: true },
          { text: b('Into 4f, the first empty subshell in shell 4', 'In 4f, die erste leere Unterschale in Schale 4'), mis: 'fill-by-shell' },
          { text: b('Into 4p, which still has room for one more', 'In 4p, das noch Platz für eines hat') },
        ],
        explain: b('5s. After krypton, 5s is lower in energy than 4d, just as 4s was lower than 3d for potassium. So rubidium starts a new shell with one outer electron, like every member of group 1. 4p is already full in krypton.',
          '5s. Nach Krypton liegt 5s energetisch tiefer als 4d, so wie bei Kalium 4s tiefer lag als 3d. Rubidium beginnt also eine neue Schale mit einem Außenelektron, wie jedes Element der Gruppe 1 (I. Hauptgruppe). 4p ist bei Krypton schon voll.'),
      } as ChoiceItem,
      show: { engine: 'atom', z: 37, view: 'shells' },
      revealText: b('Rubidium is 2, 8, 18, 8, 1: one electron alone in shell 5, which makes it an alkali metal like potassium. Shell 4 keeps its empty 4d places for now; they fill later, from yttrium (39) to cadmium (48), and 4f only from the lanthanides on.',
        'Rubidium ist 2, 8, 18, 8, 1: ein einzelnes Elektron in Schale 5, das macht es zum Alkalimetall wie Kalium. Schale 4 behält ihre freien 4d-Plätze vorerst; sie füllen sich später, von Yttrium (39) bis Cadmium (48), und 4f erst ab den Lanthanoiden.'),
      extra: {
        title: b('Follow the potassium pattern', 'Folge dem Muster von Kalium'),
        steps: [
          b('Periods end with a full p subshell: argon with 3p⁶, krypton with 4p⁶.', 'Perioden enden mit einer vollen p-Unterschale: Argon mit 3p⁶, Krypton mit 4p⁶.'),
          b('After argon, the lowest free place was 4s, not 3d. Potassium started a new shell with one electron.', 'Nach Argon war der niedrigste freie Platz 4s, nicht 3d. Kalium begann eine neue Schale mit einem Elektron.'),
          b('After krypton the same thing happens one shell up: 5s is lower in energy than 4d.', 'Nach Krypton passiert dasselbe eine Schale höher: 5s liegt energetisch tiefer als 4d.'),
          b('So rubidium\'s 37th electron goes into 5s. One electron in a new shell: group 1, like lithium, sodium and potassium.', 'Also kommt das 37. Elektron von Rubidium in 5s. Ein Elektron in einer neuen Schale: Gruppe 1, wie Lithium, Natrium und Kalium.'),
        ],
      },
    },
    {
      item: {
        id: 'u1-lamp', unit: 1, kind: 'choice', format: 'predict', withConfidence: true, evidence: 'transfer',
        concepts: ['u1.levels-light'], targets: ['bigger-jump-redder', 'any-energy'],
        prompt: b('Low-pressure sodium street lamps glow yellow-orange at 589 nm. Hydrogen\'s 3 → 2 drop gives red light at 656 nm. The electron drop that makes sodium\'s light is…',
          'Natriumdampf-Niederdrucklampen in Straßenlaternen leuchten gelborange bei 589 nm. Der Sprung 3 → 2 von Wasserstoff gibt rotes Licht bei 656 nm. Der Elektronensprung, der das Licht von Natrium erzeugt, ist…'),
        options: [
          { text: b('bigger: shorter waves carry more energy per photon', 'größer: Kürzere Wellen tragen mehr Energie pro Photon'), correct: true },
          { text: b('smaller: the redder the light, the bigger the drop', 'kleiner: Je röter das Licht, desto größer der Sprung'), mis: 'bigger-jump-redder' },
          { text: b('the same: all visible light carries the same energy', 'gleich groß: Alles sichtbare Licht trägt gleich viel Energie') },
          { text: b('any size: the lamp\'s electrons can drop by any amount', 'beliebig groß: Die Elektronen der Lampe können beliebig weit fallen'), mis: 'any-energy' },
        ],
        explain: b('Bigger. Energy and wavelength run opposite ways: a photon of 589 nm light carries 2.1 eV, a photon of 656 nm light only 1.9 eV.',
          'Größer. Energie und Wellenlänge laufen gegenläufig: Ein Photon mit 589 nm trägt 2,1 eV, eines mit 656 nm nur 1,9 eV.'),
      } as ChoiceItem,
      show: { engine: 'atom', z: 1, jump: [3, 2] },
      revealText: b('589 nm is shorter than 656 nm, so each photon carries more energy: 2.1 eV against 1.9 eV. Sodium\'s yellow comes from its outer electron dropping from 3p to 3s. Every sodium flame and every low-pressure sodium lamp shows the same two lines, at 589.0 and 589.6 nm.',
        '589 nm ist kürzer als 656 nm, also trägt jedes Photon mehr Energie: 2,1 eV gegen 1,9 eV. Das Gelb von Natrium entsteht, wenn sein Außenelektron von 3p auf 3s fällt. Jede Natriumflamme und jede Natriumdampf-Niederdrucklampe zeigt dieselben zwei Linien, bei 589,0 und 589,6 nm.'),
      extra: {
        title: b('Shorter waves, more energy per photon', 'Kürzere Wellen, energiereichere Photonen'),
        steps: [
          b('Light comes in tiny packets called photons. The shorter the wavelength, the more energy each photon carries.', 'Licht besteht aus Photonen, winzigen Energiepaketen. Je kürzer die Wellenlänge, desto mehr Energie trägt jedes Photon.'),
          b('On hydrogen\'s ladder, 4 → 2 is a bigger drop than 3 → 2, and its light is blue-green at 486 nm instead of red at 656 nm.', 'Auf der Leiter von Wasserstoff ist 4 → 2 ein größerer Sprung als 3 → 2, und sein Licht ist blaugrün bei 486 nm statt rot bei 656 nm.'),
          b('Sodium\'s 589 nm is shorter than 656 nm, so each photon carries more: 2.1 eV against 1.9 eV.', 'Die 589 nm von Natrium sind kürzer als 656 nm, also trägt jedes Photon mehr: 2,1 eV gegen 1,9 eV.'),
          b('So sodium\'s drop is bigger than hydrogen\'s 3 → 2, though smaller than its 4 → 2, which gives 2.55 eV.', 'Der Sprung bei Natrium ist also größer als 3 → 2 bei Wasserstoff, aber kleiner als dessen 4 → 2 mit 2,55 eV.'),
        ],
      },
    },
  ],

  examples: [
    {
      title: b('Oxygen', 'Sauerstoff'), tag: 'O',
      show: { engine: 'atom', z: 8, view: 'clouds', highlight: '2p' },
      numbers: [{ v: '8', label: b('electrons', 'Elektronen') }, { v: '1s² 2s² 2p⁴', label: b('electron configuration', 'Elektronenkonfiguration') }, { v: '2', label: b('unpaired electrons', 'ungepaarte Elektronen') }],
      body: b('Two electrons fill 1s, two fill 2s, and the last four go into the three 2p orbitals. Electrons repel each other, so they take empty orbitals first: three go in one per orbital, and only the fourth pairs up. That leaves two electrons unpaired.',
        'Zwei Elektronen füllen 1s, zwei füllen 2s, und die letzten vier kommen in die drei 2p-Orbitale. Elektronen stoßen sich ab, also besetzen sie zuerst leere Orbitale: Drei kommen einzeln hinein, erst das vierte bildet ein Paar. So bleiben zwei Elektronen ungepaart.'),
      soWhat: b('Each unpaired electron can pair up with an electron from another atom, so oxygen forms two bonds, as in water, {{H2O}}. Unit 5 builds on this.',
        'Jedes ungepaarte Elektron kann sich mit einem Elektron eines anderen Atoms paaren, also bildet Sauerstoff zwei Bindungen, wie in Wasser, {{H2O}}. Einheit 5 baut darauf auf.'),
    },
    {
      title: b('Potassium', 'Kalium'), tag: 'K',
      show: { engine: 'atom', z: 19, view: 'shells' },
      numbers: [{ v: '19', label: b('electrons', 'Elektronen') }, { v: '2 · 8 · 8 · 1', label: b('electrons per shell', 'Elektronen pro Schale') }, { v: '10', label: b('empty places left in shell 3', 'freie Plätze in Schale 3') }],
      body: b('After argon\'s 2, 8, 8 the next place by energy is 4s, not 3d. So potassium\'s 19th electron opens shell 4 while shell 3 still has room for ten more. Those ten 3d places fill later, from scandium (21) to zinc (30). Once 3d holds electrons it drops below 4s, so ions like Fe²⁺ lose their 4s electrons first: [Ar] 3d⁶.',
        'Nach den 2, 8, 8 von Argon ist der nächste Platz nach Energie 4s, nicht 3d. Das 19. Elektron von Kalium eröffnet also Schale 4, während Schale 3 noch Platz für zehn weitere hat. Diese zehn 3d-Plätze füllen sich später, von Scandium (21) bis Zink (30). Sobald 3d Elektronen enthält, sinkt es unter 4s; deshalb geben Ionen wie Fe²⁺ zuerst ihre 4s-Elektronen ab: [Ar] 3d⁶.'),
      soWhat: b('One electron alone in a new shell is the same pattern as lithium and sodium. That is why potassium sits in group 1 and reacts with water like sodium, only more violently.',
        'Ein einzelnes Elektron in einer neuen Schale ist dasselbe Muster wie bei Lithium und Natrium. Deshalb steht Kalium in Gruppe 1 und reagiert mit Wasser wie Natrium, nur heftiger.'),
    },
    {
      title: b('Hydrogen, and where Bohr\'s model reaches its limits', 'Wasserstoff – und wo das Bohr\'sche Atommodell an seine Grenzen stößt'), tag: 'H',
      show: { engine: 'atom', z: 1, jump: [3, 2] },
      numbers: [{ v: '656 nm', label: b('from Bohr\'s model (3 → 2)', 'nach dem Bohr\'schen Modell (3 → 2)') }, { v: '656.3 nm', label: b('measured', 'gemessen') }, { v: '1868', label: b('helium found in sunlight', 'Helium im Sonnenlicht entdeckt') }],
      body: b('A model can be right for one atom and wrong for the next; Bohr\'s is the famous case. His 1913 model puts the electron on circular orbits with fixed energies. For hydrogen it predicts every line almost exactly. With two electrons pushing on each other, as in helium, its numbers go wrong, and it cannot explain why shells split into s, p and d. Orbitals replaced the circles; the ladder of fixed energies stayed.',
        'Ein Modell kann für ein Atom stimmen und beim nächsten scheitern; das Bohr\'sche Atommodell ist das berühmte Beispiel. Es setzt das Elektron auf Kreisbahnen mit festen Energien. Für Wasserstoff sagt es jede Linie fast genau voraus. Mit zwei Elektronen, die sich gegenseitig abstoßen, wie bei Helium, stimmen seine Zahlen nicht mehr, und es kann nicht erklären, warum Schalen sich in s, p und d aufteilen. Die Orbitale haben die Kreise ersetzt; die Leiter fester Energien ist geblieben.'),
      soWhat: b('Every element has its own ladder, so its own set of lines, like a fingerprint. Helium was found in sunlight in 1868, 27 years before anyone found it on Earth. Neon\'s fingerprint is mostly red and orange lines: the glow of a real neon sign.',
        'Jedes Element hat seine eigene Leiter, also seinen eigenen Satz Linien, wie einen Fingerabdruck. Helium wurde 1868 im Sonnenlicht entdeckt, 27 Jahre bevor man es auf der Erde fand. Der Fingerabdruck von Neon besteht vor allem aus roten und orangen Linien: das Leuchten einer echten Neonröhre.'),
    },
  ],

  flaw: {
    id: 'u1-flaw', unit: 1, kind: 'flaw', format: 'flaw', evidence: 'transfer', concepts: ['u1.orbit-vs-orbital'], targets: ['bohr-orbits'],
    prompt: b('Where does this reasoning first go wrong?', 'Wo geht diese Überlegung zum ersten Mal schief?'),
    lines: [
      b('A hydrogen atom\'s electron is in the 1s orbital, which is drawn as a sphere around the nucleus.', 'Das Elektron eines Wasserstoffatoms ist im 1s-Orbital, das als Kugel um den Kern gezeichnet wird.'),
      b('So the electron travels along the surface of that sphere, always at the same distance from the nucleus.', 'Also läuft das Elektron auf der Oberfläche dieser Kugel um den Kern, immer im selben Abstand.'),
      b('So the atom has a sharp outer edge, exactly where the sphere is drawn.', 'Also hat das Atom einen scharfen Rand, genau dort, wo die Kugel gezeichnet ist.'),
      b('With a fast enough camera, you could follow the electron\'s path around the nucleus.', 'Mit einer schnellen Kamera könnte man der Bahn des Elektrons um den Kern folgen.'),
    ],
    flaw: 1,
    alsoFalse: [2, 3],
    near: [{ step: 0, note: b('Step 1 is true: the sphere is a fair picture. It marks the region where the electron is found most of the time, often drawn to hold 90 % of it. The slip comes next, when that boundary is read as a track.', 'Schritt 1 stimmt: Die Kugel ist ein brauchbares Bild. Sie markiert den Bereich, in dem sich das Elektron meistens aufhält, oft so gezeichnet, dass sie 90 % davon umfasst. Der Fehler kommt danach, wenn diese Grenze als Bahn gelesen wird.') }],
    explain: b('Step 2 is where it goes wrong. Step 1 is true: the 1s cloud is drawn as a sphere. But the cloud shows where the electron is likely to be found, at many different distances from the nucleus; its surface is not a track. Steps 3 and 4 are false too, because they follow from step 2: the cloud thins out without a sharp edge, and an electron in an atom has no path a camera could follow. In an exam you may still draw the shell model: its rings stand for energy levels. Only the idea that electrons run along them like tracks is wrong.',
      'Schritt 2 ist der Fehler. Schritt 1 stimmt: Die 1s-Wolke wird als Kugel gezeichnet. Aber die Wolke zeigt, wo sich das Elektron wahrscheinlich aufhält, in vielen verschiedenen Abständen vom Kern; ihre Oberfläche ist keine Bahn. Schritt 3 und 4 sind auch falsch, weil sie aus Schritt 2 folgen: Die Wolke wird nach außen dünner, ohne scharfen Rand, und ein Elektron im Atom hat keine Bahn, der eine Kamera folgen könnte. In der Klausur darfst du das Schalenmodell weiter verwenden: Seine Ringe stehen für Energieniveaus. Falsch ist nur die Vorstellung, dass die Elektronen auf ihnen wie auf Bahnen laufen.'),
  } as FlawItem,

  deeper: {
    id: 'u1-deeper', unit: 1, kind: 'estimate', format: 'estimate', evidence: 'transfer', concepts: ['u1.config', 'u1.filling-order'],
    prompt: b('Iron has 26 electrons. Fill the subshells in order (1s, 2s, 2p, 3s, 3p, 4s, 3d). Then put the 3d electrons into the five 3d boxes one per box before any of them pairs up. How many boxes end up holding just one electron?',
      'Eisen hat 26 Elektronen. Fülle die Unterschalen der Reihe nach (1s, 2s, 2p, 3s, 3p, 4s, 3d). Verteile dann die 3d-Elektronen auf die fünf 3d-Kästchen, erst eines pro Kästchen, bevor sich Paare bilden. Wie viele Kästchen sind am Ende nur einfach besetzt?'),
    min: 0, max: 10, step: 1, answer: 4, tolerance: 0, suffix: '',
    near: [
      { value: 6, tol: 0, note: b('Six is the number of 3d electrons. Five go in one per box; the sixth has to pair up, so four boxes keep a single electron.', 'Sechs ist die Zahl der 3d-Elektronen. Fünf kommen einzeln in die Kästchen, das sechste muss sich paaren, also bleiben vier Kästchen einfach besetzt.') },
      { value: 0, tol: 0, note: b('The inner subshells and 4s² are all paired, but 3d⁶ is not: five boxes for six electrons.', 'Die inneren Unterschalen und 4s² sind alle gepaart, 3d⁶ aber nicht: fünf Kästchen für sechs Elektronen.') },
    ],
    explain: b('Four. Iron is [Ar] 3d⁶ 4s²: 18 electrons up to argon, 2 in 4s, 6 in 3d. Five of the six 3d electrons take a box each, the sixth pairs up with one of them, so four boxes hold one unpaired electron each. Check it in the viewer at Z = 26.',
      'Vier. Eisen ist [Ar] 3d⁶ 4s²: 18 Elektronen bis Argon, 2 in 4s, 6 in 3d. Fünf der sechs 3d-Elektronen bekommen je ein Kästchen, das sechste paart sich mit einem davon, also bleiben vier Kästchen mit je einem ungepaarten Elektron. Prüf es im Betrachter bei Z = 26.'),
  } as EstimateItem,

  explain: {
    prompt: b('In your own words: how are the electrons in an atom arranged, and why does each element glow in its own colours?',
      'In eigenen Worten: Wie sind die Elektronen in einem Atom angeordnet, und warum leuchtet jedes Element in seinen eigenen Farben?'),
    ideas: [
      { id: 'levels', concept: 'u1.levels-light', idea: b('Electrons have only certain energies; a drop between them gives off light of one exact colour', 'Elektronen haben nur bestimmte Energien; ein Sprung dazwischen gibt Licht einer genauen Farbe ab'),
        en: /((certain|fixed|specific|particular|definite|allowed|discrete|quanti[sz]ed|set) (amounts? of )?(energ|level|rung|step|value))|energy levels?|levels? of energy|\brungs?\b|ladder|(jump|drop|fall|fell|move|go)(s|es|ing)? (down|back|from|between|to a lower).{0,60}(light|colou?r|photon|line)|(light|colou?r|photon|lines?).{0,50}(jump|drop|fall|fell)/,
        de: /((bestimmte|feste|erlaubte|diskrete|nur gewisse|festgelegte) (energie|niveau|stufe|werte))|energieniveau|energiestufe|\bniveaus?\b|sprosse|leiter|(sprung|sprünge|springt|springen|fällt|fallen|zurückfällt).{0,50}(licht|farbe|photon|linie)|(licht|farbe|photon|linie).{0,50}(sprung|sprünge|springt|springen|fällt|fallen)/,
        contra: { en: /^(?!.*\b(not|never|no|isn't|can't|cannot|don't|doesn't|thought|school|used to|but|instead|actually|really)\b).*(\bany (amount of )?energy\b|\bevery (amount of )?energy\b(?!\s*levels?))/, de: /^(?!.*\b(nicht|nie|kein\w*|dachte|schule|hieß|aber|sondern|eigentlich|wirklichkeit)\b).*\b(jede|beliebige) (menge )?energie\b/ } },
      { id: 'shells', concept: 'u1.shells', idea: b('Shells hold 2, 8, 18 electrons: up to 2n² in shell n', 'Schalen fassen 2, 8, 18 Elektronen: bis zu 2n² in Schale n'),
        en: /2 ?n ?(²|\^ ?2|squared)|\b2\b, ?\b8\b,? ?(and |then )?\b18\b|\b(first|1st|inner(most)?|second|2nd|next|third|3rd) (one|shell|layer|level|ring)\b.{0,25}\b(holds?|has|have|takes?|fits?|gets?|can hold|can take|room for)\b.{0,12}\b(2|two|8|eight|18|eighteen)\b|(shells?|layers?|rings?).{0,60}\b(holds?|holding|fits?|takes?|room for|capacity|up to|max|maximum|can hold|can take)\b|\b(holds?|fits?|takes?)\b.{0,30}\b(2|8|18|32)\b.{0,20}(electrons|in (each|the|a|every) shell)|\b(2|8|18|32)\b (electrons? )?(in|on|per|for|fit in|fit into) (the |each |every |a )?(first |second |third |next |inner |outer )?(shells?|layers?|rings?)\b/,
        de: /2 ?n ?(²|\^ ?2|quadrat)|\b2\b, ?\b8\b,? ?(und |dann )?\b18\b|\b(erste|zweite|dritte|nächste|innerste)n? schale\b.{0,25}\b(hat|fasst|nimmt|bekommt|kann|bietet)\b.{0,15}\b(2|zwei|8|acht|18|achtzehn)\b|(schale|schalen).{0,60}(fass|passen|platz|maximal|höchstens|bis zu|aufnehmen)|\b(2|8|18|32)\b elektronen (in|auf|pro|passen in) (die |der |jede[rn]? )?(erste[n]? |zweite[n]? |dritte[n]? |nächste[n]? )?schale/,
        contra: { en: /^(?!.*\b(not|never|no|isn't|can't|cannot|don't|doesn't|thought|school|used to|but|instead|actually|really)\b).*(\b(every|each|all) (outer |other |later )?shells?\b.{0,30}\b(8|eight)\b|\bshells? (always|each) (hold|holds|take|takes|fit) (8|eight)\b)/, de: /^(?!.*\b(nicht|nie|kein\w*|dachte|schule|hieß|aber|sondern|eigentlich|wirklichkeit)\b).*(\b(jede|alle) (weitere[n]? |äußere[n]? )?schalen?\b.{0,30}\b(8|acht)\b|\bschalen? (fasst|fassen|hat|haben) (immer|jeweils) (8|acht)\b)/ } },
      { id: 'subshells', concept: 'u1.subshells', idea: b('Shells split into subshells, s, p, d and f, holding 2, 6, 10 and 14', 'Schalen teilen sich in Unterschalen, s, p, d und f, mit 2, 6, 10 und 14 Plätzen'),
        en: /sub-?shells?|sub-?levels?|\bs\b,? ?(and )?\bp\b|\bp\b,? ?(and )?\bd\b|\b[spdf](-| )orbitals?\b|\b(2|two),? ?(6|six),? ?(and )?(10|ten)\b|smaller (groups|parts|sets)/,
        de: /unterschalen?|unterniveaus?|\bs\b-?,? ?(und )?\bp\b|\bp\b-?,? ?(und )?\bd\b|\b[spdf]-orbital|\b(2|zwei),? ?(6|sechs),? ?(und )?(10|zehn)\b/ },
      { id: 'cloud', concept: 'u1.orbit-vs-orbital', idea: b('An orbital is a cloud of where the electron is likely to be, not a path', 'Ein Orbital ist eine Wolke des wahrscheinlichen Aufenthalts, keine Bahn'),
        en: /cloud|fuzz|blur|smear|probab|likel(y|ihood)|chance|regions?|area where|space where|where (it|they|the electrons?) (is|are|can be|might be|could be)|not a path|not paths|not a track|not an orbit|not orbits|not circles|not in circles|no path|no fixed path|no exact path|no track|don't orbit|do not orbit|don't circle|do not circle/,
        de: /wolke|wahrscheinlich|aufenthalt|verschwommen|bereich|raum, in dem|wo (es|sie|das elektron|die elektronen) (ist|sind|sich)|keine bahn|keine bahnen|keine kreisbahn|keine feste bahn|nicht auf bahnen|nicht auf kreisbahnen|kreisen nicht|nicht im kreis/ },
      { id: 'filling', concept: 'u1.filling-order', idea: b('Electrons fill the lowest energy first, so 4s fills before 3d', 'Elektronen besetzen zuerst die niedrigste Energie, also 4s vor 3d'),
        en: /(lowest|lower|least|smallest) (free )?(energy|place|level|spot|rung)|fill.{0,40}(lowest|bottom|order of energy|energy order|by energy)|4s.{0,25}(before|first|then|ahead of|earlier).{0,15}3d|3d.{0,25}after.{0,15}4s|aufbau|madelung|(bottom|lowest) (up|first)|from the bottom/,
        de: /(niedrigste|tiefste|geringste|niedrigere?|tiefere?|energieärmste)[nr]? (freie[nr]? )?(energie|platz|niveau|stufe|sprosse|orbital)|energieärmste|energetisch (tiefste|niedrigste|günstigste)|4s.{0,25}(vor|zuerst|dann|früher).{0,15}3d|3d.{0,25}nach.{0,15}4s|aufbauprinzip|von unten/,
        contra: { en: /^(?!.*\b(not|never|no|isn't|can't|cannot|don't|doesn't|thought|school|used to|but|instead|actually|really)\b).*(3d.{0,15}\b(before|first)\b.{0,10}4s|\b(each|every) shell (fills|is filled|gets filled) (completely|fully|up)|\bshells? (fill|are filled) (completely |fully )?(one after (the )?another|in order))/, de: /^(?!.*\b(nicht|nie|kein\w*|dachte|schule|hieß|aber|sondern|eigentlich|wirklichkeit)\b).*(3d.{0,15}\b(vor|zuerst)\b.{0,10}4s|\b(jede|eine) schale (wird|ist) (erst |zuerst )?(ganz|vollständig|komplett))/ } },
    ] as Idea[],
    tightened: b('Electrons in an atom can only have certain energies, like the rungs of a ladder. When one drops to a lower rung it gives off light of one exact colour, and a bigger drop gives bluer light, so every element glows with its own set of colours. The energy levels form shells that hold up to 2n² electrons (2, 8, 18), and each shell is made of subshells, s, p, d and f, holding 2, 6, 10 and 14. An orbital is not a path: it is a cloud showing where an electron is likely to be found. Electrons fill the lowest free energy first, which is why 4s fills before 3d.',
      'Elektronen in einem Atom können nur bestimmte Energien haben, wie die Sprossen einer Leiter. Fällt ein Elektron auf eine tiefere Sprosse, sendet es Licht einer genauen Farbe aus, und ein größerer Sprung gibt blaueres Licht; deshalb leuchtet jedes Element in seinen eigenen Farben. Die Energieniveaus bilden Schalen, die bis zu 2n² Elektronen fassen (2, 8, 18), und jede Schale besteht aus Unterschalen, s, p, d und f, mit 2, 6, 10 und 14 Plätzen. Ein Orbital ist keine Bahn, sondern eine Wolke: Sie zeigt den Bereich, in dem sich ein Elektron wahrscheinlich aufhält. Elektronen besetzen zuerst die niedrigste freie Energie; deshalb füllt sich 4s vor 3d.'),
  },

  terms: ['shell', 'subshell', 'orbital', 'energy-level', 'electron-configuration'],

  readings: [
    {
      lang: 'en', kind: 'quick',
      title: b('The Bohr Model: Atoms with Orbits', 'The Bohr Model: Atoms with Orbits'), source: 'LibreTexts, Introductory Chemistry',
      url: 'https://chem.libretexts.org/Bookshelves/Introductory_Chemistry/Introductory_Chemistry_(LibreTexts)/09%3A_Electrons_in_Atoms_and_the_Periodic_Table/9.04%3A_The_Bohr_Model_-_Atoms_with_Orbits',
      lookFor: [
        b('How many lines it says hydrogen\'s spectrum has. Compare them with the four wavelengths in the puzzle.', ''),
        b('Find where it says electrons orbit the nucleus. Which picture is that, and what replaced it in this unit?', ''),
        b('What it says Bohr\'s model could not do. Match it with the helium example in this unit.', ''),
      ],
    },
    {
      lang: 'en', kind: 'deeper',
      title: b('Quantum-Mechanical Orbitals and Electron Configurations', 'Quantum-Mechanical Orbitals and Electron Configurations'), source: 'LibreTexts, Introductory Chemistry',
      url: 'https://chem.libretexts.org/Bookshelves/Introductory_Chemistry/Introductory_Chemistry_(LibreTexts)/09%3A_Electrons_in_Atoms_and_the_Periodic_Table/9.06%3A_Quantum-Mechanical_Orbitals_and_Electron_Configurations',
      lookFor: [
        b('Its table of how many electrons each subshell holds. Do the totals per shell match 2n²: 2, 8, 18, 32?', ''),
        b('The sentence on why 4s fills before 3d. Is it the reason the viewer gave for potassium?', ''),
        b('Its orbital diagrams for boron to oxygen. Does oxygen end up with two unpaired electrons, as in the worked example?', ''),
      ],
    },
    {
      lang: 'de', kind: 'deeper',
      title: b('Spektralanalyse', 'Spektralanalyse'), source: 'Lernhelfer Schülerlexikon',
      url: 'https://www.lernhelfer.de/schuelerlexikon/physik/artikel/spektralanalyse',
      lookFor: [
        b('', 'Die Werte für Natrium in der Tabelle. Vergleiche sie mit den 589 nm aus der Vorhersage zur Straßenlampe.'),
        b('', 'Was der Artikel über Helium und die Sonne schreibt. Passt es zum Beispiel mit Wasserstoff in dieser Einheit?'),
        b('', 'Warum ein Element nur bestimmte Linien aussendet, erklärt der Artikel nicht. Erkläre es dir selbst mit der Energieleiter.'),
      ],
    },
  ] as Reading[],

  misconceptions: [
    { id: 'any-energy', name: b('An electron in an atom can have any energy', 'Ein Elektron im Atom kann jede beliebige Energie haben') },
    { id: 'bigger-jump-redder', name: b('A bigger energy drop gives redder light', 'Ein größerer Energiesprung gibt röteres Licht') },
    { id: 'every-shell-eight', name: b('Every shell holds eight electrons', 'Jede Schale fasst acht Elektronen') },
    { id: 'fill-by-shell', name: b('Each shell fills completely before the next one starts', 'Jede Schale füllt sich ganz, bevor die nächste beginnt') },
  ],

  glossary: {
    subshell: {
      en: 'subshell', de: 'Unterschale', unit: 1,
      def: { en: 'A set of orbitals of one kind within a shell: s (1 orbital, 2 electrons), p (3, 6), d (5, 10), f (7, 14).', de: 'Ein Satz Orbitale einer Sorte innerhalb einer Schale: s (1 Orbital, 2 Elektronen), p (3, 6), d (5, 10), f (7, 14).' },
    },
    'energy-level': {
      en: 'energy level', de: 'Energieniveau', unit: 1,
      def: { en: 'One of the fixed energies an electron in an atom can have. A drop to a lower level gives off light of one exact colour.', de: 'Eine der festen Energien, die ein Elektron im Atom haben kann. Ein Sprung auf ein tieferes Niveau gibt Licht einer genauen Farbe ab.' },
    },
    'electron-configuration': {
      en: 'electron configuration', de: 'Elektronenkonfiguration', unit: 1,
      def: { en: 'Which subshells an atom\'s electrons occupy, with how many in each: sodium is 1s² 2s² 2p⁶ 3s¹.', de: 'Welche Unterschalen die Elektronen eines Atoms besetzen, und wie viele jeweils: Natrium ist 1s² 2s² 2p⁶ 3s¹.' },
    },
  },
};
