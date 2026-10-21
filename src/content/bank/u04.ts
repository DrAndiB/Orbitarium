import type { Bi } from '../../i18n';
import type { Item } from '../items';

const b = (en: string, de: string): Bi => ({ en, de });

// Unit 4 question bank: three variants per concept (predict, why, transfer), every trap option tagged.
// Data: ionic radii, lattice energies and melting points from src/content/ions.ts; χ from elements.ts.
// KBr melting point 734 °C (CRC Handbook). Fluorite (CaF₂) coordination 8 : 4 (standard crystal structure).
export const BANK_U4: Item[] = [
  // ---- u4.coulomb ----
  { id: 'i4a', unit: 4, kind: 'estimate', format: 'estimate', concepts: ['u4.coulomb'],
    prompt: b('MgO melts at 2852 °C, NaCl at 801 °C. Counting charges only (charge × charge, q₁ × q₂), how many times stronger is the attraction in MgO?', 'MgO schmilzt bei 2852 °C, NaCl bei 801 °C. Nur die Ladungen betrachtet (Ladung × Ladung, q₁ × q₂): Wie viel stärker ist die Anziehung in MgO?'),
    min: 1, max: 9, step: 1, answer: 4, tolerance: 0, suffix: '×',
    explain: b('2 × 2 = 4 against 1 × 1 = 1. The ions in MgO also sit closer (212 pm against 283 pm), which adds more: charges ÷ distance gives about 5.3 times, and the measured lattice energies differ by 4.8 times (3791 against 787 kJ/mol).', '2 × 2 = 4 gegenüber 1 × 1 = 1. Die Ionen in MgO sitzen außerdem näher (212 pm statt 283 pm), das legt noch etwas drauf: Ladung ÷ Abstand ergibt etwa das 5,3-Fache, die gemessenen Gitterenergien unterscheiden sich um das 4,8-Fache (3791 gegenüber 787 kJ/mol).') },
  { id: 'i4i', unit: 4, kind: 'choice', format: 'why', evidence: 'explain', withConfidence: true, concepts: ['u4.coulomb'], targets: ['bigger-heavier-stronger'],
    prompt: b('Sodium fluoride melts at 993 °C, sodium iodide at 661 °C. Both contain {{Na+}} and a 1− ion. Why the difference?', 'Natriumfluorid schmilzt bei 993 °C, Natriumiodid bei 661 °C. Beide enthalten {{Na+}} und ein 1−-Ion. Woher kommt der Unterschied?'),
    options: [
      { text: b('Fluoride carries a larger charge than iodide', 'Fluorid trägt eine größere Ladung als Iodid') },
      { text: b('Fluorine is lighter, and lighter particles always pack more tightly', 'Fluor ist leichter, und leichtere Teilchen packen sich immer dichter'), mis: 'bigger-heavier-stronger' },
      { text: b('Fluoride is smaller, so its centre sits closer to sodium and the pull is stronger', 'Fluorid ist kleiner, also sitzt sein Mittelpunkt näher am Natrium, und die Anziehung ist stärker'), correct: true },
      { text: b('Iodide is so big that it hides its charge completely', 'Iodid ist so groß, dass es seine Ladung ganz verbirgt') },
    ],
    explain: b('Both are 1− ions, so distance decides: 235 pm in NaF against 322 pm in NaI, so fluoride, with three shells fewer than iodide, is held about 1.4 times as strongly. The lattice energies are 923 and 704 kJ/mol.', 'Beide sind 1−-Ionen, also entscheidet der Abstand: 235 pm in NaF gegenüber 322 pm in NaI; Fluorid, mit drei Schalen weniger als Iodid, wird also etwa 1,4-mal so stark angezogen. Die Gitterenergien betragen 923 und 704 kJ/mol.') },
  { id: 'i4j', unit: 4, kind: 'rank', format: 'rank', evidence: 'transfer', concepts: ['u4.coulomb'], targets: ['bigger-heavier-stronger'], mis: 'bigger-heavier-stronger',
    prompt: b('Rank by lattice energy, highest first. Ion sizes: Ca²⁺ 100, O²⁻ 140, Li⁺ 76, F⁻ 133, Na⁺ 102, K⁺ 138, Cl⁻ 181 pm.', 'Ordne nach Gitterenergie, die höchste zuerst. Ionengrößen: Ca²⁺ 100, O²⁻ 140, Li⁺ 76, F⁻ 133, Na⁺ 102, K⁺ 138, Cl⁻ 181 pm.'),
    order: [b('{{CaO}}', '{{CaO}}'), b('{{LiF}}', '{{LiF}}'), b('{{NaCl}}', '{{NaCl}}'), b('{{KCl}}', '{{KCl}}')],
    explain: b('Charges first: the 2+ and 2− ions put CaO far ahead, at 3414 kJ/mol. Then distance: LiF 209 pm (1036), NaCl 283 pm (787), KCl 319 pm (715).', 'Erst die Ladungen: Die Ionen mit 2+ und 2− bringen CaO weit nach vorn, 3414 kJ/mol. Dann der Abstand: LiF 209 pm (1036), NaCl 283 pm (787), KCl 319 pm (715).') },

  // ---- u4.transfer ----
  { id: 'i4b', unit: 4, kind: 'choice', format: 'odd', concepts: ['u4.transfer', 'u5.delta-chi'], table: 'category',
    prompt: b('Odd one out?', 'Was passt nicht dazu?'),
    options: [{ text: b('{{NaCl}}', '{{NaCl}}') }, { text: b('{{MgO}}', '{{MgO}}') }, { text: b('{{KBr}}', '{{KBr}}') }, { text: b('{{CCl4}}', '{{CCl4}}'), correct: true }],
    explain: b('CCl₄ is covalent: the electronegativity difference between C and Cl is only about 0.6. The other three are ionic lattices of a metal and a non-metal.', 'CCl₄ ist kovalent: Der Elektronegativitätsunterschied zwischen C und Cl beträgt nur etwa 0,6. Die anderen drei sind Ionengitter aus Metall und Nichtmetall.') },
  { id: 'i4c', unit: 4, kind: 'choice', format: 'predict', withConfidence: true, concepts: ['u4.transfer', 'u4.formula-ratio'], targets: ['ionic-is-sharing'], table: 'outer',
    prompt: b('Magnesium (group 2) reacts with chlorine (group 17). What happens to the electrons?', 'Magnesium (Gruppe 2, II. Hauptgruppe) reagiert mit Chlor (Gruppe 17, VII. Hauptgruppe). Was passiert mit den Elektronen?'),
    options: [
      { text: b('Magnesium and chlorine share a pair of electrons', 'Magnesium und Chlor teilen sich ein Elektronenpaar'), mis: 'ionic-is-sharing' },
      { text: b('Each chlorine atom hands one electron to magnesium', 'Jedes Chloratom gibt ein Elektron an Magnesium ab') },
      { text: b('Each magnesium atom hands one electron to each of two chlorine atoms', 'Jedes Magnesiumatom gibt je ein Elektron an zwei Chloratome ab'), correct: true },
      { text: b('Each magnesium atom hands both electrons to a single chlorine atom', 'Jedes Magnesiumatom gibt beide Elektronen an ein einziges Chloratom ab') },
    ],
    explain: b('Magnesium has two outer electrons, chlorine seven. Each chlorine takes one, so one magnesium supplies two chlorines: {{Mg2+}} and two {{Cl-}}, {{MgCl2}}.', 'Magnesium hat zwei Außenelektronen, Chlor sieben. Jedes Chlor nimmt eines auf, also versorgt ein Magnesium zwei Chloratome: {{Mg2+}} und zwei {{Cl-}}, {{MgCl2}}.') },
  { id: 'i4d', unit: 4, kind: 'choice', format: 'why', evidence: 'explain', withConfidence: true, concepts: ['u4.transfer'], targets: ['ionic-is-sharing'], table: 'chi',
    prompt: b('Sodium and chlorine form ions, but two chlorine atoms share a pair of electrons instead. Why the difference?', 'Natrium und Chlor bilden Ionen, zwei Chloratome dagegen teilen sich ein Elektronenpaar. Woher kommt der Unterschied?'),
    options: [
      { text: b('Chlorine pulls on electrons far harder than sodium does, so the pair ends up on chlorine; two chlorines pull equally', 'Chlor zieht viel stärker an Elektronen als Natrium, also landet das Paar beim Chlor; zwei Chloratome ziehen gleich stark'), correct: true },
      { text: b('Sodium and chlorine share too, only with a longer bond', 'Natrium und Chlor teilen auch, nur mit einer längeren Bindung'), mis: 'ionic-is-sharing' },
      { text: b('Sodium wants a full shell, and chlorine is happy to help', 'Natrium will eine volle Schale, und Chlor hilft gern') },
      { text: b('Two chlorine atoms form ions as well, but the charges cancel', 'Zwei Chloratome bilden auch Ionen, aber die Ladungen heben sich auf') },
    ],
    explain: b('Electronegativity 3.16 against 0.93: the electrons end up almost entirely on chlorine; in the crystal the particles are best described as {{Na+}} and {{Cl-}}. Between two chlorine atoms the pull is equal, so they share. Atoms do not want anything; the difference in pull decides (unit 5 measures it). In an exam you may still write that {{Na+}} and {{Cl-}} have noble-gas configurations; the reason they form is the energy balance, not a wish of the atom.', 'Elektronegativität 3,16 gegenüber 0,93: Die Elektronen landen fast ganz beim Chlor; im Kristall beschreibt man die Teilchen am besten als {{Na+}} und {{Cl-}}. Zwischen zwei Chloratomen ist der Zug gleich, also teilen sie. Atome wollen nichts; der Unterschied in der Anziehung entscheidet (Einheit 5 misst ihn). In der Klausur darfst du trotzdem schreiben, dass {{Na+}} und {{Cl-}} Edelgaskonfiguration haben; der Grund, warum sie entstehen, ist die Energiebilanz, nicht ein Wunsch des Atoms.') },
  { id: 'i4e', unit: 4, kind: 'choice', format: 'predict', evidence: 'transfer', withConfidence: true, concepts: ['u4.transfer'], targets: ['ionic-is-sharing'], table: 'outer',
    prompt: b('Lithium burns in oxygen. Which ions does the product contain?', 'Lithium verbrennt in Sauerstoff. Welche Ionen enthält das Produkt?'),
    options: [
      { text: b('{{Li2+}} and {{O2-}}', '{{Li2+}} und {{O2-}}') },
      { text: b('{{Li+}} and {{O2-}}', '{{Li+}} und {{O2-}}'), correct: true },
      { text: b('{{Li-}} and {{O2+}}', '{{Li-}} und {{O2+}}') },
      { text: b('No ions: lithium and oxygen share electrons', 'Keine Ionen: Lithium und Sauerstoff teilen sich Elektronen'), mis: 'ionic-is-sharing' },
    ],
    explain: b('Lithium (group 1) gives up its one outer electron and becomes {{Li+}}, with helium\'s arrangement. Oxygen (group 16) takes two and becomes {{O2-}}, with neon\'s. Two {{Li+}} balance one {{O2-}}: {{Li2O}}.', 'Lithium (Gruppe 1, I. Hauptgruppe) gibt sein einziges Außenelektron ab und wird zu {{Li+}}, mit der Anordnung von Helium. Sauerstoff (Gruppe 16, VI. Hauptgruppe) nimmt zwei auf und wird zu {{O2-}}, mit der von Neon. Zwei {{Li+}} gleichen ein {{O2-}} aus: {{Li2O}}.') },

  // ---- u4.lattice ----
  { id: 'i4f', unit: 4, kind: 'choice', format: 'predict', withConfidence: true, concepts: ['u4.lattice'], targets: ['ionic-molecules'],
    prompt: b('In a crystal of sodium chloride, how many chloride ions sit right next to each sodium ion?', 'Wie viele Chlorid-Ionen sitzen in einem Natriumchlorid-Kristall direkt neben jedem Natrium-Ion?'),
    options: [
      { text: b('1, its partner in the NaCl pair', '1, sein Partner im NaCl-Paar'), mis: 'ionic-molecules' },
      { text: b('2, one on each side', '2, auf jeder Seite eines') },
      { text: b('8, at the corners of a cube', '8, an den Ecken eines Würfels') },
      { text: b('6, above, below and on four sides', '6, oben, unten und an vier Seiten'), correct: true },
    ],
    explain: b('Six: above, below, left, right, in front and behind. Each chloride has six sodium neighbours too, so the one-to-one ratio holds without any pairs.', 'Sechs: oben, unten, links, rechts, vorne und hinten. Jedes Chlorid hat ebenfalls sechs Natrium-Nachbarn, also stimmt das Verhältnis eins zu eins, ganz ohne Paare.') },
  { id: 'i4g', unit: 4, kind: 'choice', format: 'why', evidence: 'explain', withConfidence: true, concepts: ['u4.lattice'], targets: ['ionic-molecules'],
    prompt: b('Why does sodium chloride form one giant lattice rather than separate NaCl molecules?', 'Warum bildet Natriumchlorid ein einziges Ionengitter statt einzelner NaCl-Moleküle?'),
    options: [
      { text: b('Each {{Na+}} is bonded to one {{Cl-}}, and the pairs stick together', 'Jedes {{Na+}} ist an ein {{Cl-}} gebunden, und die Paare kleben aneinander'), mis: 'ionic-molecules' },
      { text: b('An ion\'s charge pulls in every direction, so it gathers neighbours on all sides', 'Die Ladung eines Ions zieht in alle Richtungen, also sammelt es Nachbarn auf allen Seiten'), correct: true },
      { text: b('The ions are too heavy to stay in small molecules', 'Die Ionen sind zu schwer, um in kleinen Molekülen zu bleiben') },
      { text: b('Water from the air links the pairs into a crystal', 'Wasser aus der Luft verbindet die Paare zu einem Kristall') },
    ],
    explain: b('A covalent bond is a shared pair between two particular atoms. An ion\'s charge has no direction: it attracts every opposite ion nearby, so ions keep adding on all sides until the material runs out.', 'Eine Atombindung ist ein gemeinsames Paar zwischen zwei bestimmten Atomen. Die Ladung eines Ions hat keine Richtung: Sie zieht jedes Gegenion in der Nähe an, also lagern sich Ionen auf allen Seiten an, bis das Material aufgebraucht ist.') },
  { id: 'i4h', unit: 4, kind: 'choice', format: 'predict', evidence: 'transfer', withConfidence: true, concepts: ['u4.lattice', 'u4.formula-ratio'], targets: ['ionic-molecules'],
    prompt: b('Calcium fluoride, {{CaF2}}, crystallises differently from table salt. Which statement must still be true of it?', 'Calciumfluorid, {{CaF2}}, kristallisiert anders als Kochsalz. Welche Aussage muss trotzdem zutreffen?'),
    options: [
      { text: b('Each {{Ca2+}} is bonded to exactly two {{F-}} in a small {{CaF2}} molecule', 'Jedes {{Ca2+}} ist in einem kleinen {{CaF2}}-Molekül an genau zwei {{F-}} gebunden'), mis: 'ionic-molecules' },
      { text: b('Each ion has exactly six neighbours, as in table salt', 'Jedes Ion hat genau sechs Nachbarn, wie im Kochsalz') },
      { text: b('Ions of the same charge sit side by side to keep it balanced', 'Ionen gleicher Ladung sitzen nebeneinander, damit es ausgeglichen bleibt') },
      { text: b('Each ion is surrounded by ions of the opposite charge, with twice as many {{F-}} as {{Ca2+}} overall', 'Jedes Ion ist von Ionen der Gegenladung umgeben, mit insgesamt doppelt so vielen {{F-}} wie {{Ca2+}}'), correct: true },
    ],
    explain: b('In calcium fluoride each {{Ca2+}} has eight {{F-}} around it and each {{F-}} four {{Ca2+}}. The numbers differ from salt, but the rules are the same: opposite charges as neighbours, the overall ratio set by the charges, no molecules.', 'In Calciumfluorid hat jedes {{Ca2+}} acht {{F-}} um sich und jedes {{F-}} vier {{Ca2+}}. Die Zahlen unterscheiden sich vom Salz, die Regeln sind dieselben: Gegenladungen als Nachbarn, das Gesamtverhältnis durch die Ladungen festgelegt, keine Moleküle.') },

  // ---- u4.formula-ratio ----
  { id: 'i4k', unit: 4, kind: 'choice', format: 'predict', withConfidence: true, concepts: ['u4.formula-ratio'], targets: ['formula-one-to-one'],
    prompt: b('Aluminium forms {{Al3+}}, oxygen forms {{O2-}}. The formula of aluminium oxide is…', 'Aluminium bildet {{Al3+}}, Sauerstoff {{O2-}}. Die Formel von Aluminiumoxid lautet…'),
    options: [
      { text: b('{{AlO}}', '{{AlO}}'), mis: 'formula-one-to-one' },
      { text: b('{{Al3O2}}', '{{Al3O2}}') },
      { text: b('{{Al2O3}}', '{{Al2O3}}'), correct: true },
      { text: b('{{AlO3}}', '{{AlO3}}') },
    ],
    explain: b('The charges must cancel. Two {{Al3+}} give 6+, three {{O2-}} give 6−: {{Al2O3}}. {{Al3O2}} would carry 9+ against 4−.', 'Die Ladungen müssen sich aufheben. Zwei {{Al3+}} ergeben 6+, drei {{O2-}} ergeben 6−: {{Al2O3}}. {{Al3O2}} hätte 9+ gegen 4−.') },
  { id: 'i4l', unit: 4, kind: 'choice', format: 'why', evidence: 'explain', withConfidence: true, concepts: ['u4.formula-ratio'], targets: ['formula-one-to-one', 'ionic-molecules'],
    prompt: b('Why is calcium chloride {{CaCl2}} and not CaCl?', 'Warum heißt Calciumchlorid {{CaCl2}} und nicht CaCl?'),
    options: [
      { text: b('Chlorine always comes in pairs, as in {{Cl2}} gas', 'Chlor kommt immer paarweise vor, wie im Gas {{Cl2}}') },
      { text: b('A crystal must be neutral overall: one {{Ca2+}} needs two {{Cl-}} to balance it', 'Ein Kristall muss insgesamt neutral sein: Ein {{Ca2+}} braucht zwei {{Cl-}} zum Ausgleich'), correct: true },
      { text: b('Each calcium atom can bond to exactly two chlorine atoms in a molecule', 'Jedes Calciumatom kann in einem Molekül genau zwei Chloratome binden'), mis: 'ionic-molecules' },
      { text: b('Formulas are always one to one; the 2 is the number of shells', 'Formeln sind immer eins zu eins; die 2 ist die Zahl der Schalen'), mis: 'formula-one-to-one' },
    ],
    explain: b('Calcium (group 2) loses two electrons; each chlorine takes one. One {{Ca2+}} and two {{Cl-}} add up to zero charge. The 2 does not come from {{Cl2}} gas: in the crystal the chlorines are separate {{Cl-}} ions.', 'Calcium (Gruppe 2, II. Hauptgruppe) gibt zwei Elektronen ab, jedes Chlor nimmt eines auf. Ein {{Ca2+}} und zwei {{Cl-}} ergeben zusammen die Ladung null. Die 2 stammt nicht vom Gas {{Cl2}}: Im Kristall sind die Chloratome einzelne {{Cl-}}-Ionen.') },
  { id: 'i4m', unit: 4, kind: 'choice', format: 'predict', evidence: 'transfer', withConfidence: true, concepts: ['u4.formula-ratio'], targets: ['formula-one-to-one', 'ionic-molecules'],
    prompt: b('Road crews spread calcium chloride when it is too cold for ordinary salt. It contains {{Ca2+}} and {{Cl-}}. How many ions does one formula unit release when it dissolves?', 'Der Winterdienst streut Calciumchlorid, wenn es für normales Salz zu kalt ist. Es enthält {{Ca2+}} und {{Cl-}}. Wie viele Ionen setzt eine Formeleinheit beim Lösen frei?'),
    options: [
      { text: b('1, the whole {{CaCl2}} unit stays together', '1, die ganze {{CaCl2}}-Einheit bleibt zusammen'), mis: 'ionic-molecules' },
      { text: b('2, one positive and one negative', '2, ein positives und ein negatives'), mis: 'formula-one-to-one' },
      { text: b('3, one {{Ca2+}} and two {{Cl-}}', '3, ein {{Ca2+}} und zwei {{Cl-}}'), correct: true },
      { text: b('4, two of each', '4, je zwei') },
    ],
    explain: b('One {{Ca2+}} and two {{Cl-}}: three ions, against two from NaCl. More dissolved particles lower the freezing point further, and calcium chloride also gives off heat as it dissolves; both help on icy roads.', 'Ein {{Ca2+}} und zwei {{Cl-}}: drei Ionen, gegenüber zwei bei NaCl. Mehr gelöste Teilchen senken den Gefrierpunkt stärker, und Calciumchlorid gibt beim Lösen außerdem Wärme ab; beides hilft auf vereisten Straßen.') },

  // ---- u4.properties ----
  { id: 'i4n', unit: 4, kind: 'choice', format: 'predict', withConfidence: true, concepts: ['u4.properties'], targets: ['ions-need-melting'],
    prompt: b('Solid salt, molten salt, salt water and pure water: which conduct electricity well?', 'Festes Salz, geschmolzenes Salz, Salzwasser und reines Wasser: Welche leiten gut Strom?'),
    options: [
      { text: b('Solid salt and molten salt', 'Festes und geschmolzenes Salz') },
      { text: b('Molten salt and salt water', 'Geschmolzenes Salz und Salzwasser'), correct: true },
      { text: b('Only salt water: salt contains ions only once it dissolves', 'Nur Salzwasser: Salz enthält erst Ionen, wenn es sich löst'), mis: 'ions-need-melting' },
      { text: b('All four: salt and water are both made of charges', 'Alle vier: Salz und Wasser bestehen beide aus Ladungen') },
    ],
    explain: b('A current needs charges that can move. In molten salt and in salt water the ions are free to move; in solid salt they are locked in the lattice, and pure water contains almost no ions.', 'Strom braucht Ladungen, die sich bewegen können. In geschmolzenem Salz und in Salzwasser sind die Ionen beweglich; im festen Salz sitzen sie fest im Gitter, und reines Wasser enthält fast keine Ionen.') },
  { id: 'i4o', unit: 4, kind: 'choice', format: 'why', evidence: 'explain', withConfidence: true, concepts: ['u4.properties'], targets: ['ions-need-melting', 'ionic-is-sharing'],
    prompt: b('Why does solid salt not conduct electricity, although it is made of ions?', 'Warum leitet festes Salz keinen Strom, obwohl es aus Ionen besteht?'),
    options: [
      { text: b('The ions only form once the salt melts or dissolves', 'Die Ionen entstehen erst, wenn das Salz schmilzt oder sich löst'), mis: 'ions-need-melting' },
      { text: b('Its electrons are shared, so none are free', 'Seine Elektronen sind geteilt, also ist keines frei'), mis: 'ionic-is-sharing' },
      { text: b('The charges cancel, so there is nothing to carry a current', 'Die Ladungen heben sich auf, also gibt es nichts, was Strom tragen könnte') },
      { text: b('Its ions are locked in place in the lattice and cannot move', 'Seine Ionen sitzen fest im Gitter und können sich nicht bewegen'), correct: true },
    ],
    explain: b('The ions are there all along: the lattice is made of them. A current needs charged particles that move. Melting or dissolving frees the ions; the charges still add up to zero overall, yet the liquid conducts.', 'Die Ionen sind von Anfang an da: Das Gitter besteht aus ihnen. Strom braucht geladene Teilchen, die sich bewegen. Schmelzen oder Lösen macht die Ionen beweglich; die Ladungen ergeben insgesamt weiterhin null, und trotzdem leitet die Flüssigkeit.') },
  { id: 'i4p', unit: 4, kind: 'choice', format: 'predict', evidence: 'transfer', withConfidence: true, concepts: ['u4.properties'], targets: ['ions-need-melting'],
    prompt: b('Potassium bromide, {{KBr}}, melts at 734 °C. You heat it to 800 °C and dip two electrodes into it. What happens?', 'Kaliumbromid, {{KBr}}, schmilzt bei 734 °C. Du erhitzt es auf 800 °C und tauchst zwei Elektroden hinein. Was passiert?'),
    options: [
      { text: b('No current: ions only form when the salt dissolves in water', 'Kein Strom: Ionen entstehen erst, wenn sich das Salz in Wasser löst'), mis: 'ions-need-melting' },
      { text: b('A current flows: the ions in the melt can move', 'Strom fließt: Die Ionen in der Schmelze sind beweglich'), correct: true },
      { text: b('No current: salts never conduct', 'Kein Strom: Salze leiten nie') },
      { text: b('A current flows, carried by electrons running through the crystal', 'Strom fließt, getragen von Elektronen, die durch den Kristall laufen') },
    ],
    explain: b('At 800 °C the potassium bromide is liquid, so its {{K+}} and {{Br-}} ions are free to move and carry the current. Industry uses this: aluminium and sodium are made by passing a current through molten ionic compounds.', 'Bei 800 °C ist das Kaliumbromid flüssig, seine {{K+}}- und {{Br-}}-Ionen sind also beweglich und tragen den Strom. Die Industrie nutzt das: Aluminium und Natrium werden gewonnen, indem man Strom durch geschmolzene Ionenverbindungen leitet.') },

  // ---- u4.brittle ----
  { id: 'i4q', unit: 4, kind: 'choice', format: 'predict', withConfidence: true, concepts: ['u4.brittle'], targets: ['brittle-means-weak'],
    prompt: b('You press a knife edge onto a clear salt crystal, parallel to one of its faces, and tap the knife. What happens?', 'Du setzt eine Messerklinge parallel zu einer Fläche auf einen klaren Salzkristall und klopfst darauf. Was passiert?'),
    options: [
      { text: b('It bends and stays bent', 'Er verbiegt sich und bleibt verbogen') },
      { text: b('It crumbles to powder, because its bonds are weak', 'Er zerfällt zu Pulver, weil seine Bindungen schwach sind'), mis: 'brittle-means-weak' },
      { text: b('It splits cleanly along a flat face', 'Er spaltet sich glatt entlang einer ebenen Fläche'), correct: true },
      { text: b('It dents like soft metal', 'Er bekommt eine Delle wie weiches Metall') },
    ],
    explain: b('Salt cleaves along the planes of its cubic lattice. The blow shifts one layer against the next, like charges meet, and the layers spring apart along a flat plane.', 'Salz spaltet entlang der Ebenen seines würfelförmigen Gitters. Der Schlag verschiebt eine Schicht gegen die nächste, gleiche Ladungen treffen aufeinander, und die Schichten springen entlang einer glatten Ebene auseinander.') },
  { id: 'i4r', unit: 4, kind: 'choice', format: 'why', evidence: 'explain', withConfidence: true, concepts: ['u4.brittle'], targets: ['brittle-means-weak'],
    prompt: b('Salt needs 801 °C to melt, so its ions hold together strongly. Why does it still shatter under a hammer?', 'Salz braucht 801 °C zum Schmelzen, seine Ionen halten also stark zusammen. Warum zerspringt es trotzdem unter dem Hammer?'),
    options: [
      { text: b('A shifted layer puts like charges side by side, and they repel', 'Eine verschobene Schicht bringt gleiche Ladungen nebeneinander, und die stoßen sich ab'), correct: true },
      { text: b('Its bonds are weak, so they snap easily', 'Seine Bindungen sind schwach, also reißen sie leicht'), mis: 'brittle-means-weak' },
      { text: b('The blow pushes the electrons back to the sodium atoms', 'Der Schlag schiebt die Elektronen zurück zu den Natriumatomen') },
      { text: b('The hammer heats the salt past its melting point', 'Der Hammer erhitzt das Salz über seinen Schmelzpunkt') },
    ],
    explain: b('Strength and brittleness are different things. The pulls are strong, but a shift by one ion turns every pull into a push: {{Na+}} meets {{Na+}}, {{Cl-}} meets {{Cl-}}, and the layers spring apart.', 'Stärke und Sprödigkeit sind verschiedene Dinge. Die Anziehung ist stark, aber eine Verschiebung um ein Ion macht aus jeder Anziehung eine Abstoßung: {{Na+}} trifft {{Na+}}, {{Cl-}} trifft {{Cl-}}, und die Schichten springen auseinander.') },
  { id: 'i4s', unit: 4, kind: 'choice', format: 'predict', evidence: 'transfer', withConfidence: true, concepts: ['u4.brittle'], targets: ['brittle-means-weak'],
    prompt: b('A copper bar bends; a salt crystal shatters. In a metal, positive ions sit in a sea of electrons shared by all of them. Why does shifting a layer not break the copper?', 'Ein Kupferstab verbiegt sich, ein Salzkristall zerspringt. In einem Metall sitzen positive Ionen in einem Meer von Elektronen, die alle gemeinsam nutzen. Warum bricht das Kupfer nicht, wenn sich eine Schicht verschiebt?'),
    options: [
      { text: b('Copper\'s bonds are weaker, so they give way gently instead of snapping', 'Die Bindungen im Kupfer sind schwächer, also geben sie sanft nach, statt zu reißen'), mis: 'brittle-means-weak' },
      { text: b('Copper ions are bigger, so like charges never come close', 'Kupfer-Ionen sind größer, also kommen sich gleiche Ladungen nie nahe') },
      { text: b('After the shift the ions meet new neighbours, and the shared electrons still hold them all', 'Nach der Verschiebung treffen die Ionen neue Nachbarn, und die gemeinsamen Elektronen halten sie weiter zusammen'), correct: true },
      { text: b('Copper contains no charges at all', 'Kupfer enthält überhaupt keine Ladungen') },
    ],
    explain: b('A metal has no negative ions to line up wrongly: every layer is positive ions in the same sea of electrons. After a shift the picture looks just as before, so the metal bends. Copper is not weak: it melts at 1085 °C, higher than salt.', 'Ein Metall hat keine negativen Ionen, die sich falsch aufreihen könnten: Jede Schicht besteht aus positiven Ionen im selben Elektronenmeer. Nach einer Verschiebung sieht alles aus wie vorher, also verbiegt sich das Metall. Kupfer ist nicht schwach: Es schmilzt bei 1085 °C, höher als Salz.') },
];
