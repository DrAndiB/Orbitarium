// Unit 4 — Ionic bonding, on the Lattice Builder.
// Data: ionic radii, lattice energies and melting points from src/content/ions.ts (Shannon radii; lattice energies
// from the Purdue general chemistry tables, CaO from Wikipedia's experimental table); atom radii from elements.ts.
// Charges ÷ distance ratios are computed from those radii: NaCl 1/283, MgO 4/212, CaO 4/240, LiF 1/209, NaF 1/235,
// NaI 1/322, KCl 1/319 (pm). Iron's melting point (1538 °C) from elements.ts.
import type { Bi } from '../i18n';
import type { ChoiceItem, RankItem, FlawItem, EstimateItem } from './items';
import type { UnitContent } from './unitTypes';
import type { Idea, ExploreTask, Reading } from './unit06';

const b = (en: string, de: string): Bi => ({ en, de });

export const UNIT4: UnitContent = {
  n: 4,
  title: b('Ionic bonding', 'Ionenbindung'),
  lead: b('Why salt melts only at 801 °C, shatters under a hammer, and why the road de-icer calcium chloride is {{CaCl2}}, not CaCl.',
    'Warum Salz erst bei 801 °C schmilzt, unter dem Hammer zerspringt und warum das Auftausalz Calciumchlorid {{CaCl2}} heißt und nicht CaCl.'),

  puzzle: {
    title: b('Light, yet hard to melt', 'Leicht und trotzdem schwer zu schmelzen'),
    lead: b('Table salt and magnesium oxide are built the same way: a metal ion and a non-metal ion, packed in the same cubic pattern.',
      'Kochsalz und Magnesiumoxid sind gleich gebaut: ein Metall-Ion und ein Nichtmetall-Ion, in derselben würfelförmigen Anordnung gepackt.'),
    data: {
      caption: b('Two salts with the same structure (mass per formula unit, in u; 1 u is about the mass of one proton)', 'Zwei Salze mit gleicher Struktur (Masse pro Formeleinheit, in u; 1 u ist etwa die Masse eines Protons)'),
      head: [b('Salt', 'Salz'), b('Ions', 'Ionen'), b('Mass', 'Masse'), b('Melting point', 'Schmelzpunkt')],
      rows: [
        { cells: ['{{NaCl}}', '{{Na+}} {{Cl-}}', b('58.4', '58,4'), '801 °C'] },
        { cells: ['{{MgO}}', '{{Mg2+}} {{O2-}}', b('40.3', '40,3'), '2852 °C'], mystery: true },
      ],
      numeric: [2, 3],
    },
    clash: b('Magnesium oxide is the lighter of the two, and its ions are, if anything, smaller. Yet it melts more than 2000 °C higher. What holds it together so much more strongly?',
      'Magnesiumoxid ist das leichtere der beiden, und seine Ionen sind eher kleiner. Trotzdem schmilzt es über 2000 °C höher. Was hält es so viel stärker zusammen?'),
    question: {
      id: 'u4-puzzle', unit: 4, kind: 'choice', format: 'predict', withConfidence: true, evidence: 'predict',
      concepts: ['u4.coulomb'], targets: ['bigger-heavier-stronger', 'ionic-molecules', 'ionic-is-sharing'],
      prompt: b('Your best guess:', 'Deine beste Vermutung:'),
      options: [
        { text: b('Magnesium and oxygen share their electrons, and shared bonds are stronger', 'Magnesium und Sauerstoff teilen sich ihre Elektronen, und geteilte Bindungen sind stärker'), mis: 'ionic-is-sharing' },
        { text: b('Its ions carry twice the charge, so every pull between them is about four times as strong', 'Seine Ionen tragen die doppelte Ladung, also ist jede Anziehung zwischen ihnen etwa viermal so stark'), correct: true },
        { text: b('Each MgO pair forms a separate molecule with an extra-strong bond', 'Jedes MgO-Paar bildet ein eigenes Molekül mit einer besonders starken Bindung'), mis: 'ionic-molecules' },
        { text: b('Heavier particles always need more heat to break free', 'Schwerere Teilchen brauchen immer mehr Wärme, um sich zu lösen'), mis: 'bigger-heavier-stronger' },
      ],
      explain: b('{{Mg2+}} and {{O2-}} carry two charges each: 2 × 2 = 4, against 1 × 1 = 1 for {{Na+}} and {{Cl-}}. Their centres also sit closer, 212 pm against 283 pm (pm: picometres, trillionths of a metre). Mass plays no part: magnesium oxide is the lighter salt.',
        '{{Mg2+}} und {{O2-}} tragen je zwei Ladungen: 2 × 2 = 4, gegenüber 1 × 1 = 1 bei {{Na+}} und {{Cl-}}. Außerdem sitzen ihre Mittelpunkte näher beieinander, 212 pm statt 283 pm (pm: Pikometer, Billionstel Meter). Die Masse spielt keine Rolle: Magnesiumoxid ist das leichtere Salz.'),
    } as ChoiceItem,
    after: b('Next: build the lattice and weigh both effects, charge and distance.', 'Als Nächstes: das Gitter bauen und beide Einflüsse abwägen, Ladung und Abstand.'),
  },

  explore: {
    title: b('The Lattice Builder', 'Der Gitterbaukasten'),
    intro: b('Each ion pulls on every ion of the opposite charge and pushes on every ion of the same charge. Nothing else holds the crystal together. Positive ions are blue, negative ions red, drawn at their measured sizes.',
      'Jedes Ion zieht an jedem Ion der Gegenladung und drückt jedes Ion gleicher Ladung weg. Sonst hält nichts den Kristall zusammen. Positive Ionen sind blau, negative rot, in ihrer gemessenen Größe gezeichnet.'),
    tasks: [
      { id: 'transfer', key: true, text: b('Tap “Make the ions” and watch the electron move. Which atom shrinks, which one grows?', 'Tippe auf „Ionen bilden“ und sieh dem Elektron zu. Welches Atom schrumpft, welches wächst?') },
      { id: 'neighbours', key: true, text: b('Tap one ion in the middle of the crystal. How many neighbours does it have, and what charge do they carry?', 'Tippe ein Ion in der Mitte des Kristalls an. Wie viele Nachbarn hat es, und welche Ladung tragen sie?') },
      { id: 'compare', key: true, text: b('Load {{NaCl}}, then {{MgO}}, and compare them on the gauge.', 'Lade {{NaCl}}, dann {{MgO}}, und vergleiche beide an der Anzeige.') },
      { id: 'heat', key: true, text: b('Heat {{NaCl}} past its melting point. What can the ions do now, and why does that let molten salt carry an electric current?', 'Erhitze {{NaCl}} über seinen Schmelzpunkt. Was können die Ionen jetzt, und warum kann geschmolzenes Salz deshalb Strom leiten?') },
      { id: 'size', key: true, text: b('Load {{NaF}} and {{NaI}}. Same charges, different ion sizes: what changes on the gauge?', 'Lade {{NaF}} und {{NaI}}. Gleiche Ladungen, verschieden große Ionen: Was ändert sich an der Anzeige?') },
      { id: 'all', challenge: true, text: b('Load all eight salts. Which holds together most strongly, and does the melting point always follow the gauge?', 'Lade alle acht Salze. Welches hält am stärksten zusammen, und folgt der Schmelzpunkt immer der Anzeige?') },
    ] as ExploreTask[],
    notes: {
      transfer: b('Sodium loses its whole third shell and shrinks from 180 to 102 pm; chlorine gains an electron and grows from 100 to 181 pm. In {{MgO}} two electrons move.',
        'Natrium verliert seine ganze dritte Schale und schrumpft von 180 auf 102 pm; Chlor nimmt ein Elektron auf und wächst von 100 auf 181 pm. Bei {{MgO}} wandern zwei Elektronen.'),
      neighbours: b('Six, all of the opposite charge: above, below, left, right, in front and behind. Each of those has six neighbours of its own. No ion has a partner of its own: {{NaCl}} only tells you the ratio, one to one.',
        'Sechs, alle mit Gegenladung: oben, unten, links, rechts, vorne und hinten. Jeder davon hat wieder sechs Nachbarn. Kein Ion hat einen eigenen Partner: {{NaCl}} gibt nur das Verhältnis an, eins zu eins.'),
      compare: b('The charges multiply to 4 instead of 1, and the ions sit closer, 212 pm instead of 283 pm. The lattice energy is the energy it takes to pull the crystal completely apart into separate ions, given in kJ/mol like the ionization energies of unit 3: 3791 for {{MgO}} against 787 for {{NaCl}}.',
        'Die Ladungen ergeben multipliziert 4 statt 1, und die Ionen sitzen näher, 212 pm statt 283 pm. Die Gitterenergie ist die Energie, die man braucht, um den Kristall vollständig in einzelne Ionen zu zerlegen, angegeben in kJ/mol wie die Ionisierungsenergien in Einheit 3: 3791 bei {{MgO}} gegenüber 787 bei {{NaCl}}.'),
      heat: b('Above 801 °C the lattice falls apart and the ions slide past each other. Ions that move can carry a current: molten salt conducts, solid salt does not.',
        'Über 801 °C bricht das Gitter zusammen, und die Ionen gleiten aneinander vorbei. Bewegliche Ionen können Strom transportieren: Geschmolzenes Salz leitet, festes nicht.'),
      size: b('Same charges, but iodide is much bigger: iodine sits three periods below fluorine, so its ion has three more shells. The centres sit 322 pm apart instead of 235 pm, the lattice energy drops from 923 to 704 kJ/mol and the melting point from 993 to 661 °C. Rule of thumb: one shell fewer, smaller ion, closer centres, stronger hold.',
        'Gleiche Ladungen, aber Iodid ist viel größer: Iod steht drei Perioden unter Fluor, sein Ion hat also drei Schalen mehr. Die Mittelpunkte liegen 322 pm statt 235 pm auseinander, die Gitterenergie sinkt von 923 auf 704 kJ/mol und der Schmelzpunkt von 993 auf 661 °C. Faustregel: eine Schale weniger, kleineres Ion, näher beieinander, stärkerer Zusammenhalt.'),
      all: b('{{MgO}} holds together most strongly, at 3791 kJ/mol. The melting points mostly follow the gauge, but not always: {{LiF}} holds on more strongly than {{NaF}} (1036 against 923 kJ/mol), yet melts 148 °C lower. One of the worked examples comes back to lithium fluoride.',
        'Am stärksten hält {{MgO}} zusammen, mit 3791 kJ/mol. Die Schmelzpunkte folgen der Anzeige meistens, aber nicht immer: {{LiF}} hält stärker zusammen als {{NaF}} (1036 gegenüber 923 kJ/mol), schmilzt aber 148 °C tiefer. Eines der Rechenbeispiele kommt auf Lithiumfluorid zurück.'),
    },
    check: {
      id: 'u4-check', unit: 4, kind: 'rank', format: 'rank', evidence: 'predict', concepts: ['u4.coulomb'], targets: ['bigger-heavier-stronger'], mis: 'bigger-heavier-stronger',
      prompt: b('Quick check: rank by how strongly the lattice holds together, strongest first. (Fluorine sits one period above chlorine, potassium one period below sodium.)', 'Kurzer Check: Ordne danach, wie stark das Gitter zusammenhält, das stärkste zuerst. (Fluor steht eine Periode über Chlor, Kalium eine Periode unter Natrium.)'),
      order: [b('{{MgO}}', '{{MgO}}'), b('{{NaF}}', '{{NaF}}'), b('{{NaCl}}', '{{NaCl}}'), b('{{KCl}}', '{{KCl}}')],
      explain: b('Charges first: the 2+ and 2− ions of {{MgO}} put it far ahead, at 3791 kJ/mol. Then size: fluoride has one shell fewer than chloride, so it is smaller and sits closer to sodium ({{NaF}}, 923 kJ/mol). Potassium has one shell more than sodium, so in {{KCl}} the ions sit furthest apart (715 kJ/mol). {{NaCl}} lies in between, at 787 kJ/mol.',
        'Erst die Ladungen: Die Ionen mit 2+ und 2− bringen {{MgO}} weit nach vorn, 3791 kJ/mol. Dann die Größe: Fluorid hat eine Schale weniger als Chlorid, ist also kleiner und sitzt näher am Natrium ({{NaF}}, 923 kJ/mol). Kalium hat eine Schale mehr als Natrium, also sitzen die Ionen in {{KCl}} am weitesten auseinander (715 kJ/mol). {{NaCl}} liegt dazwischen, bei 787 kJ/mol.'),
    } as RankItem,
  },

  predictions: [
    {
      item: {
        id: 'u4-cao', unit: 4, kind: 'choice', format: 'predict', withConfidence: true, evidence: 'transfer',
        concepts: ['u4.coulomb'], targets: ['bigger-heavier-stronger'],
        prompt: b('Calcium oxide, {{CaO}}, has the same charges as magnesium oxide: 2+ and 2−. Calcium sits one period below magnesium. Which salt holds together more strongly?',
          'Calciumoxid, {{CaO}}, hat dieselben Ladungen wie Magnesiumoxid: 2+ und 2−. Calcium steht eine Periode unter Magnesium. Welches Salz hält stärker zusammen?'),
        options: [
          { text: b('{{CaO}}, because calcium is the heavier metal', '{{CaO}}, weil Calcium das schwerere Metall ist'), mis: 'bigger-heavier-stronger' },
          { text: b('Both the same, because the charges are the same', 'Beide gleich, weil die Ladungen gleich sind') },
          { text: b('{{MgO}}, because its smaller ions sit closer together', '{{MgO}}, weil seine kleineren Ionen näher beieinandersitzen'), correct: true },
          { text: b('{{CaO}}, because a bigger ion has more charge to spread around', '{{CaO}}, weil ein größeres Ion mehr Ladung zu verteilen hat'), mis: 'bigger-heavier-stronger' },
        ],
        explain: b('The charges are equal, so distance decides. {{Ca2+}} has one more shell than {{Mg2+}} (100 against 72 pm), so the centres sit 240 pm apart instead of 212 pm, and the pull is weaker.',
          'Die Ladungen sind gleich, also entscheidet der Abstand. {{Ca2+}} hat eine Schale mehr als {{Mg2+}} (100 gegenüber 72 pm), also liegen die Mittelpunkte 240 pm statt 212 pm auseinander, und die Anziehung ist schwächer.'),
      } as ChoiceItem,
      show: { engine: 'lattice', salt: 'CaO', compare: 'MgO' },
      revealText: b('{{MgO}} melts at 2852 °C, {{CaO}} at 2613 °C; their lattice energies are 3791 and 3414 kJ/mol. With equal charges, charges ÷ distance predicts about 13 % more pull for {{MgO}}, and its measured lattice energy is 11 % higher: the simple model gets this one nearly right.',
        '{{MgO}} schmilzt bei 2852 °C, {{CaO}} bei 2613 °C; ihre Gitterenergien betragen 3791 und 3414 kJ/mol. Bei gleichen Ladungen sagt Ladung ÷ Abstand für {{MgO}} etwa 13 % mehr Anziehung voraus, und seine gemessene Gitterenergie ist 11 % höher: Hier liegt das einfache Modell fast genau richtig.'),
      extra: {
        title: b('Same charges, different distance', 'Gleiche Ladungen, anderer Abstand'),
        steps: [
          b('Both salts have 2+ and 2− ions, so the charges multiply to 4 in each.', 'Beide Salze haben Ionen mit 2+ und 2−, die Ladungen ergeben also in beiden multipliziert 4.'),
          b('The difference is size. Calcium has one more shell than magnesium, so {{Ca2+}} is bigger: 100 pm against 72 pm.', 'Der Unterschied ist die Größe. Calcium hat eine Schale mehr als Magnesium, also ist {{Ca2+}} größer: 100 pm gegenüber 72 pm.'),
          b('Bigger ions keep their centres further apart: 240 pm in {{CaO}}, 212 pm in {{MgO}}.', 'Größere Ionen halten ihre Mittelpunkte weiter auseinander: 240 pm in {{CaO}}, 212 pm in {{MgO}}.'),
          b('Same charges, longer distance, weaker pull. Mass does not enter: {{MgO}} holds together more strongly.', 'Gleiche Ladungen, größerer Abstand, schwächere Anziehung. Die Masse spielt keine Rolle: {{MgO}} hält stärker zusammen.'),
        ],
      },
    },
    {
      item: {
        id: 'u4-mgo', unit: 4, kind: 'choice', format: 'predict', withConfidence: true, evidence: 'transfer',
        concepts: ['u4.brittle'], targets: ['brittle-means-weak'],
        prompt: b('Magnesium oxide holds together almost five times as strongly as table salt. Hit a crystal of it hard with a hammer. What happens?',
          'Magnesiumoxid hält fast fünfmal so stark zusammen wie Kochsalz. Schlag kräftig mit dem Hammer auf einen Kristall davon. Was passiert?'),
        options: [
          { text: b('It bends: its bonds are too strong to break', 'Er verbiegt sich: Seine Bindungen sind zu stark, um zu brechen'), mis: 'brittle-means-weak' },
          { text: b('It dents like a metal, because magnesium is a metal', 'Er bekommt eine Delle wie ein Metall, weil Magnesium ein Metall ist') },
          { text: b('It shatters too: a shifted layer still puts like charges side by side', 'Er zerspringt ebenfalls: Eine verschobene Schicht bringt auch hier gleiche Ladungen nebeneinander'), correct: true },
        ],
        explain: b('Strong and brittle are different things. A blow that shifts one layer by one ion puts {{Mg2+}} beside {{Mg2+}} and {{O2-}} beside {{O2-}}. Those pushes are as strong as the pulls were, so the layers spring apart.',
          'Stark und spröde sind verschiedene Dinge. Ein Schlag, der eine Schicht um ein Ion verschiebt, bringt {{Mg2+}} neben {{Mg2+}} und {{O2-}} neben {{O2-}}. Diese Abstoßung ist so stark wie vorher die Anziehung, also springen die Schichten auseinander.'),
      } as ChoiceItem,
      show: { engine: 'lattice', salt: 'MgO', mode: 'shift' },
      revealText: b('Magnesium oxide is a ceramic: hard, heat-proof and brittle. Its lattice energy is 3791 kJ/mol, nearly five times that of {{NaCl}}, but after a shift the repulsion between like charges is just as strong as the attraction was, so it splits along a flat plane like salt.',
        'Magnesiumoxid ist eine Keramik: hart, hitzebeständig und spröde. Seine Gitterenergie beträgt 3791 kJ/mol, fast das Fünffache von {{NaCl}}, aber nach einer Verschiebung ist die Abstoßung gleicher Ladungen genauso stark wie vorher die Anziehung, also spaltet es sich wie Salz entlang einer glatten Ebene.'),
      extra: {
        title: b('Hard is not the same as tough', 'Hart ist nicht dasselbe wie zäh'),
        steps: [
          b('Hard means hard to scratch, squash or melt. Brittle means it breaks instead of bending. A crystal can be both.', 'Hart bedeutet: schwer zu ritzen, zu zerdrücken oder zu schmelzen. Spröde bedeutet: Er bricht, statt sich zu biegen. Ein Kristall kann beides sein.'),
          b('In every crystal built like salt, positive and negative ions take turns in every direction.', 'In jedem Kristall, der wie Salz gebaut ist, wechseln sich positive und negative Ionen in jeder Richtung ab.'),
          b('Push one layer along by one ion and each ion lands beside ions of its own charge: 2+ beside 2+, 2− beside 2−.', 'Schiebt man eine Schicht um ein Ion weiter, landet jedes Ion neben Ionen gleicher Ladung: 2+ neben 2+, 2− neben 2−.'),
          b('Like charges repel, just as strongly as opposite charges attracted. The layers fly apart: {{MgO}} shatters like table salt.', 'Gleiche Ladungen stoßen sich ab, genauso stark, wie sich die Gegenladungen vorher anzogen. Die Schichten fliegen auseinander: {{MgO}} zerspringt wie Kochsalz.'),
        ],
      },
    },
  ],

  examples: [
    {
      title: b('Sodium chloride', 'Natriumchlorid'), tag: 'NaCl', show: { engine: 'lattice', salt: 'NaCl', mode: 'neighbours' },
      numbers: [{ v: '6', label: b('neighbours for every ion', 'Nachbarn für jedes Ion') }, { v: '283 pm', label: b('between the centres of Na⁺ and Cl⁻', 'zwischen den Mittelpunkten von Na⁺ und Cl⁻') }, { v: '801 °C', label: b('melting point', 'Schmelzpunkt') }],
      body: b('Sodium hands its one outer electron to chlorine: {{Na+}} has the electron arrangement of neon, {{Cl-}} that of argon. In the crystal every {{Na+}} sits among six {{Cl-}} and every {{Cl-}} among six {{Na+}}. No ion has a partner of its own; the formula {{NaCl}} only gives the ratio, one to one.',
        'Natrium gibt sein einziges Außenelektron an Chlor ab: {{Na+}} hat die Elektronenanordnung von Neon, {{Cl-}} die von Argon. Im Kristall sitzt jedes {{Na+}} zwischen sechs {{Cl-}} und jedes {{Cl-}} zwischen sechs {{Na+}}. Kein Ion hat einen eigenen Partner; die Formel {{NaCl}} gibt nur das Verhältnis an, eins zu eins.'),
      soWhat: b('That cubic stacking is why salt grains are tiny cubes: look at a few under a magnifying glass. The crystal grows, and splits, along the faces of the cube.',
        'Diese würfelförmige Packung ist der Grund, warum Salzkörner kleine Würfel sind: Sieh dir ein paar unter der Lupe an. Der Kristall wächst und spaltet sich entlang der Würfelflächen.'),
    },
    {
      title: b('Magnesium oxide', 'Magnesiumoxid'), tag: 'MgO', show: { engine: 'lattice', salt: 'MgO', compare: 'NaCl' },
      numbers: [{ v: '2+ and 2−', label: b('charges on the two ions', 'Ladungen der beiden Ionen') }, { v: '212 pm', label: b('between the centres of Mg²⁺ and O²⁻', 'zwischen den Mittelpunkten von Mg²⁺ und O²⁻') }, { v: '3791 kJ/mol', label: b('lattice energy', 'Gitterenergie') }],
      body: b('Magnesium gives both outer electrons to oxygen. The charges multiply to 4 instead of 1, and the smaller ions sit closer. Together, charges ÷ distance predicts a hold about 5.3 times as strong as in {{NaCl}}; the measured lattice energy is 4.8 times as large. The simple estimate is close but a little high, because it treats ions as points and ignores how they push back when they get very close.',
        'Magnesium gibt beide Außenelektronen an Sauerstoff ab. Die Ladungen ergeben multipliziert 4 statt 1, und die kleineren Ionen sitzen näher. Zusammen sagt Ladung ÷ Abstand einen etwa 5,3-mal so starken Zusammenhalt wie bei {{NaCl}} voraus; die gemessene Gitterenergie ist 4,8-mal so groß. Die einfache Schätzung liegt nah dran, aber etwas zu hoch, weil sie Ionen als Punkte behandelt und übersieht, wie sie sich aus großer Nähe wegdrücken.'),
      soWhat: b('Magnesium oxide bricks line furnaces and kilns: they stay solid up to 2852 °C, far above the 1538 °C at which iron melts.',
        'Ziegel aus Magnesiumoxid kleiden Öfen aus: Sie bleiben bis 2852 °C fest, weit über den 1538 °C, bei denen Eisen schmilzt.'),
    },
    {
      title: b('Lithium fluoride: where the simple picture stops', 'Lithiumfluorid: wo das einfache Bild an seine Grenzen stößt'), tag: 'LiF', show: { engine: 'lattice', salt: 'LiF', compare: 'NaCl' },
      numbers: [{ v: '209 pm', label: b('between the centres of Li⁺ and F⁻', 'zwischen den Mittelpunkten von Li⁺ und F⁻') }, { v: '1036 kJ/mol', label: b('lattice energy', 'Gitterenergie') }, { v: '845 °C', label: b('melting point', 'Schmelzpunkt') }],
      body: b('A stronger lattice usually means a higher melting point, but not always, and lithium fluoride shows it. Its ions sit closer than in any other salt here, and its lattice energy is about a third higher than that of {{NaCl}} (1036 against 787 kJ/mol). Yet it melts only 44 °C higher, and 148 °C lower than {{NaF}}. Lattice energy is what it takes to pull every ion fully apart into a gas; melting only lets the ions slide past each other, and how easily that happens depends on more than the attraction.',
        'Ein stärkeres Gitter bedeutet meist einen höheren Schmelzpunkt, aber nicht immer, und Lithiumfluorid zeigt das. Seine Ionen sitzen näher beieinander als in jedem anderen Salz hier, und seine Gitterenergie ist etwa ein Drittel höher als die von {{NaCl}} (1036 gegenüber 787 kJ/mol). Trotzdem schmilzt es nur 44 °C höher, und 148 °C tiefer als {{NaF}}. Die Gitterenergie ist das, was man braucht, um alle Ionen vollständig zu einem Gas zu trennen; beim Schmelzen gleiten die Ionen nur aneinander vorbei, und wie leicht das geht, hängt von mehr ab als von der Anziehung.'),
      soWhat: b('So charges ÷ distance compares lattice strength well, while melting points follow it only roughly. Lithium fluoride has its own use: its crystals let through ultraviolet light that glass blocks, so they serve as windows in UV instruments.',
        'Ladung ÷ Abstand vergleicht also die Gitterstärke gut, Schmelzpunkte folgen ihr nur grob. Lithiumfluorid hat seinen eigenen Nutzen: Seine Kristalle lassen ultraviolettes Licht durch, das Glas schluckt, deshalb dienen sie als Fenster in UV-Messgeräten.'),
    },
  ],

  flaw: {
    id: 'u4-flaw', unit: 4, kind: 'flaw', format: 'flaw', evidence: 'transfer', concepts: ['u4.lattice'], targets: ['ionic-molecules'],
    prompt: b('Where does this reasoning first go wrong?', 'Wo geht diese Überlegung zum ersten Mal schief?'),
    lines: [
      b('When sodium burns in chlorine, each sodium atom hands its outer electron to a chlorine atom.', 'Wenn Natrium in Chlor verbrennt, gibt jedes Natriumatom sein Außenelektron an ein Chloratom ab.'),
      b('Each {{Na+}} then stays paired with the one {{Cl-}} that took its electron: an NaCl molecule.', 'Danach bleibt jedes {{Na+}} mit dem einen {{Cl-}} verbunden, das sein Elektron bekommen hat: ein NaCl-Molekül.'),
      b('Table salt is a heap of these NaCl molecules.', 'Kochsalz ist ein Haufen solcher NaCl-Moleküle.'),
      b('The formula {{NaCl}} counts one sodium for every chlorine.', 'Die Formel {{NaCl}} zählt ein Natrium auf jedes Chlor.'),
      b('Melting salt means pulling these molecules away from each other.', 'Salz zu schmelzen bedeutet, diese Moleküle voneinander zu trennen.'),
    ],
    flaw: 1,
    alsoFalse: [2, 4],
    near: [{ step: 3, note: b('Step 4 is true: the formula does count one sodium for every chlorine. But that ratio is all it says; it does not mean that one sodium and one chlorine belong together. The slip comes earlier, in step 2.', 'Schritt 4 stimmt: Die Formel zählt wirklich ein Natrium auf jedes Chlor. Mehr sagt das Verhältnis aber nicht; es bedeutet nicht, dass ein Natrium und ein Chlor zusammengehören. Der Fehler kommt früher, in Schritt 2.') }],
    explain: b('Step 2 is where it goes wrong. Step 1 is true. But once the ions exist, it no longer matters which chlorine took which electron: an ion\'s charge pulls in every direction, so each {{Na+}} gathers six {{Cl-}} around it and each {{Cl-}} six {{Na+}}, one giant lattice with no pairs. Steps 3 and 5 are false too, but only because they follow from step 2: there are no molecules to heap up or pull apart; melting loosens the whole lattice so that the ions can slide past each other. Step 4 is true: the formula gives the ratio, one to one, not a pair that belongs together.',
      'Schritt 2 ist der Fehler. Schritt 1 stimmt. Aber sobald die Ionen da sind, spielt es keine Rolle mehr, welches Chlor welches Elektron bekommen hat: Die Ladung eines Ions zieht in alle Richtungen, also sammelt jedes {{Na+}} sechs {{Cl-}} um sich und jedes {{Cl-}} sechs {{Na+}}, ein einziges Ionengitter ohne Paare. Schritt 3 und 5 sind auch falsch, aber nur, weil sie aus Schritt 2 folgen: Es gibt keine Moleküle, die man anhäufen oder trennen könnte; beim Schmelzen lockert sich das ganze Gitter, sodass die Ionen aneinander vorbeigleiten können. Schritt 4 stimmt: Die Formel gibt das Verhältnis an, eins zu eins, kein Paar, das zusammengehört.'),
  } as FlawItem,

  deeper: {
    id: 'u4-deeper', unit: 4, kind: 'estimate', format: 'estimate', evidence: 'transfer', concepts: ['u4.coulomb'],
    prompt: b('Go deeper: estimate how many times as strongly calcium oxide holds together as sodium chloride, using charges ÷ distance. {{CaO}}: {{Ca2+}} and {{O2-}}, centres 240 pm apart. {{NaCl}}: {{Na+}} and {{Cl-}}, 283 pm apart.',
      'Tiefer gehen: Schätze mit Ladung ÷ Abstand, wie viel stärker Calciumoxid zusammenhält als Natriumchlorid. {{CaO}}: {{Ca2+}} und {{O2-}}, Mittelpunkte 240 pm auseinander. {{NaCl}}: {{Na+}} und {{Cl-}}, 283 pm auseinander.'),
    min: 1, max: 8, step: 0.1, answer: 4.7, tolerance: 0.25, suffix: '×',
    near: [{ value: 4, tol: 0.25, note: b('That is the charges alone. The ions in {{CaO}} also sit closer, 240 against 283 pm, which adds a little more.', 'Das sind nur die Ladungen. Die Ionen in {{CaO}} sitzen außerdem näher, 240 gegenüber 283 pm, das legt noch etwas drauf.') }],
    explain: b('(2 × 2) ÷ 240 against (1 × 1) ÷ 283, so 4 × 283 ÷ 240 ≈ 4.7. The measured lattice energies are 3414 and 787 kJ/mol, a ratio of 4.3: the estimate lands close, but a little high, as it did for {{MgO}}.',
      '(2 × 2) ÷ 240 gegenüber (1 × 1) ÷ 283, also 4 × 283 ÷ 240 ≈ 4,7. Die gemessenen Gitterenergien betragen 3414 und 787 kJ/mol, ein Verhältnis von 4,3: Die Schätzung liegt nah dran, aber etwas zu hoch, wie schon bei {{MgO}}.'),
  } as EstimateItem,

  explain: {
    prompt: b('In your own words: what holds a salt crystal together, and what follows from that?', 'In eigenen Worten: Was hält einen Salzkristall zusammen, und was folgt daraus?'),
    ideas: [
      { id: 'transfer', concept: 'u4.transfer', idea: b('The metal hands electrons to the non-metal, making positive and negative ions', 'Das Metall gibt Elektronen an das Nichtmetall ab; es entstehen positive und negative Ionen'),
        contra: { en: /(?<!not |n't |never |no )(share|shares|sharing|shared) (an |the |their |its |one |two )?(outer )?electrons?/, de: /(?<!nicht |kein |keine )(teilen|teilt|geteilt)\w* (sich )?(ein |das |die |ihre |seine )?(außen)?elektron/ },
        en: /(give|gives|giving|gave|hand|hands|handing|lose|loses|losing|lost|transfer|transfers|pass|passes|donat|move|moves|jump|jumps|steal|steals|take|takes|grab|grabs)\w*.{0,40}(electrons?|\be-)|electrons?.{0,40}(transfer|move|moves|jump|jumps|goes|go over|pass|given|handed|taken|stolen)|(form|forms|make|makes|become|becomes|turn|turns|get|gets)\b.{0,30}(ions?\b|cations?|anions?)|positive (and|&) negative ions?|cation|anion|\bna\+|\bcl-|\bmg2\+|\bo2-/,
        de: /(gibt|geben|abgeb|abgab|übertrag|überg|wander|spring|nimmt|nehmen|aufgenommen|klau|abgib)\w*.{0,40}(elektron|\be-)|elektron\w*.{0,40}(übertrag|über|abgegeben|aufgenommen|wander|spring)|(bilden|bildet|entstehen|entsteht|werden|wird)\b.{0,30}ion|kation|anion|positive (und|&) negative ionen|\bna\+|\bcl-|\bmg2\+|\bo2-/ },
      { id: 'lattice', concept: 'u4.lattice', idea: b('Every ion is surrounded by ions of the opposite charge in a giant lattice, with no separate molecules', 'Jedes Ion ist im Ionengitter von Ionen der Gegenladung umgeben; einzelne Moleküle gibt es nicht'),
        contra: { en: /(?<!not |n't |never |no )(made|consists?|built) (up )?of (nacl |sodium chloride |salt )?molecules|(?<!no |not |n't )\b(nacl|salt) molecules? (is|are|form|stick|hold|stay)|(stays?|stay|is|are) (paired|bonded) (with|to) (one|a single|its own) /, de: /(?<!nicht |keine?n? )(besteht|bestehen|aufgebaut) aus (nacl-?|natriumchlorid-?|salz)?molekülen|(?<!keine |nicht )\bnacl-?moleküle? (sind|bilden|halten|bleiben)/ },
        // A clause may state the lattice and deny molecules in one go ("stacked …, so there aren't really salt molecules"):
        // the optional tail takes the denial into the match, spelled out so the negation check accepts it.
        en: /(lattice|grid|crystal|network|giant|surround\w*|neighbou?r\w*|all directions|every direction|all around|on all sides|around (it|them|each)|chess ?board|checker ?board|cube pattern|3d pattern|stack\w*|coordination)([^.;]*?(aren't really|aren't any|aren't separate|aren't individual|aren't salt|aren't nacl|aren't molecules|are no|isn't really|isn't a|isn't made|not made|not molecules|not really|not little|not pairs|not just|no salt|no nacl|no separate|no individual|no discrete|no single|no molecules|no pairs|no little)\b[^.;]*)?|(aren't really|aren't any|aren't separate|aren't individual|aren't salt|aren't nacl|aren't molecules|are no|isn't made|not made|not molecules|no salt|no nacl|no separate|no individual|no discrete|no molecules|no pairs)[^.;]*?\b(molecules?|pairs?)?/,
        de: /(gitter|kristall|umgeben|nachbar|alle richtungen|allen seiten|rundherum|würfelmuster|koordination)([^.;]*?(keine moleküle|keine einzelnen|keine nacl-moleküle|keine naclmoleküle|keine salzmoleküle|keine paare|kein molekül|nicht aus molekülen|nicht als moleküle)[^.;]*)?|keine moleküle|keine einzelnen moleküle|keine nacl-moleküle|keine salzmoleküle|keine paare|kein molekül|nicht aus molekülen/ },
      { id: 'coulomb', concept: 'u4.coulomb', idea: b('The attraction is stronger for bigger charges and for smaller ions that sit closer', 'Die Anziehung ist stärker bei größeren Ladungen und bei kleineren Ionen, die näher beieinandersitzen'),
        contra: { en: /(?<!not |n't )(bigger|larger|heavier) (ions?|atoms?|particles?) (attract|hold|bond|pull|stick|melt)s? (more|harder|stronger|tighter|higher)|heavier (salts?|substances?|ions?|particles?) (melts?|need|have)\b.{0,20}(higher|more)/, de: /(?<!nicht )(größere|schwerere) (ionen|atome|teilchen) (ziehen|halten|binden|schmelzen)\w* (sich )?(stärker|fester|höher)/ },
        en: /(charges?|2\+|2-|double|twice)\b.{0,50}(strong|strength|attract|pull|harder|tighter|melt|higher|hold)|(strong|stronger|attract|attraction|pull|pulls|force|energy).{0,50}(charges?|closer|smaller|distance|close together|size)|(holds?|holding|hold on|harder|stronger|tighter|more strongly|more tightly)\b.{0,50}\b(charges?|double|twice|2\+|smaller|closer|distance|size)|(smaller|closer|distance|nearer|size)\b.{0,50}(strong|attract|pull|harder|higher|tighter|hold)|q ?[x×*·] ?q|q1 ?q2|q₁ ?q₂|q₊ ?q₋|coulomb|(energy|strength) (scales|is proportional|depends)|the (bigger|larger|higher|greater) the charges?|(more|bigger|larger|higher) charges?|the (smaller|shorter|closer) the (ions?|distance)/,
        de: /(ladung|2\+|2-|doppelt).{0,50}(stärker|stark|anzieh|zieht|höher|hoch|hohe|groß|schmelz|smp|hält|fester)|(stärker|anzieh|zieht|zug|kraft|energie|hält|halten|fester)\w*.{0,50}(ladung|näher|kleiner|abstand|größe|doppelt)|(kleiner|näher|abstand|größe)\w*.{0,50}(stärker|anzieh|zieht|höher|fester|hält)|coulomb|q1 ?q2|q₁ ?q₂|(größer|höher|mehr)\w*.{0,10}ladung|kleiner\w*.{0,10}(abstand|ion)|näher beieinander/ },
      { id: 'properties', concept: 'u4.properties', idea: b('So salts melt only at high temperatures, and conduct only when molten or dissolved, when the ions can move', 'Deshalb schmelzen Salze erst bei hohen Temperaturen und leiten nur geschmolzen oder gelöst, wenn die Ionen beweglich sind'),
        en: /(high|higher|hard|lots? of (energy|heat)|much (energy|heat)|very hot|801|2852|hundreds of degrees).{0,40}(melt|boil|energy|heat|temperature)|melt\w*.{0,40}(high|hot|hard|lot)|conduct|electric|current|ions?.{0,20}(can |are free to |are able to |start to )?move|molten|dissolved|free to move|mobile ions?/,
        de: /(hoh|hoch|viel energie|sehr heiß|801|2852).{0,40}(schmelz|schmilz|smp|schmp|siede|energie|temperatur)|(schmelz|schmilz)\w*.{0,40}(hoh|hoch|heiß|schwer|viel)|leit|strom|ionen.{0,20}beweg|bewegliche ionen|geschmolzen|gelöst|schmelze/ },
      { id: 'brittle', concept: 'u4.brittle', idea: b('A shifted layer puts like charges side by side, so the crystal shatters instead of bending', 'Eine verschobene Schicht bringt gleiche Ladungen nebeneinander, deshalb zerspringt der Kristall, statt sich zu biegen'),
        contra: { en: /(bonds?|forces?|attraction) (are|is) (too )?weak|(brittle|shatter|shatters|cracks?|breaks?)\w*.{0,30}because.{0,30}weak/, de: /(bindungen?|kräfte|anziehung) (sind|ist) (zu )?schwach|(bindungen?|kräfte|anziehung) (zu )?schwach (sind|ist)|(spröde|zerspring|bricht)\w*.{0,30}weil.{0,30}schwach/ },
        // The mechanism, not the result word: "brittle" or "spröde" alone does not count.
        en: /(shift|slide|slip|move|push|knock|hammer|hit)\w*.{0,60}\b(same|like|similar) charges?|\b(same|like|similar) charges?.{0,40}(repel|push|meet|next to|side by side|line up|face|contact|together|touch|beside)|(plus|pluses|\+|positive|positives) (are |is |end up |ends up |sit |sits |land |lands |come |comes )?(next to|beside|meets?|against|on top of|facing|touching|side by side with) (other )?(plus|pluses|\+|positive|positives)|(minus|minuses|negative|negatives) (are |is |end up |sit |sits |land |come )?(next to|beside|meets?|against|on top of|facing|touching) (other )?(minus|minuses|negative|negatives)|(pluses|positives|minuses|negatives) (are |sit )?(side by side|together)/,
        de: /(verschieb|versetz|rutsch|schlag|hammer)\w*.{0,60}gleich(e|en|namig)\w* ladung|gleich(e|en|namig)\w* ladung\w*.{0,40}(abstoß|stoßen|treffen|nebeneinander|gegenüber|aufeinander)|(treffen|stoßen|liegen|sitzen)\w*.{0,30}gleich\w* ladung|(plus|\+) (neben|an|auf|trifft) (plus|\+)|(minus|-) (neben|an|auf|trifft) (minus|-)|(plus|minus|positive\w*|negative\w*) (liegen |sitzen |stehen )?nebeneinander/ },
    ] as Idea[],
    tightened: b('The metal hands its outer electrons to the non-metal, so the crystal is made of positive and negative ions. Each ion pulls on all the ions around it, so they stack into a giant lattice in which every ion is surrounded by ions of the opposite charge; there are no separate molecules. The pull is stronger for bigger charges and for smaller ions that sit closer, which is why salts melt only at high temperatures, and they conduct only once molten or dissolved, when the ions can move. Push one layer along by one ion and like charges meet, so the crystal shatters instead of bending.',
      'Das Metall gibt seine Außenelektronen an das Nichtmetall ab, deshalb besteht der Kristall aus positiven und negativen Ionen. Jedes Ion zieht an allen Ionen um sich herum, also stapeln sie sich zu einem Riesengitter, in dem jedes Ion von Ionen der Gegenladung umgeben ist; einzelne Moleküle gibt es nicht. Der Zug ist stärker bei größeren Ladungen und bei kleineren Ionen, die näher beieinandersitzen. Deshalb schmelzen Salze erst bei hohen Temperaturen, und sie leiten erst geschmolzen oder gelöst, wenn die Ionen sich bewegen können. Schiebt man eine Schicht um ein Ion weiter, treffen gleiche Ladungen aufeinander, und der Kristall zerspringt, statt sich zu verbiegen.'),
  },

  terms: ['ionic-bond', 'ionic-lattice', 'lattice-energy', 'formula-unit', 'octet'],

  readings: [
    {
      lang: 'en', kind: 'quick',
      title: b('Physical Properties of Ionic Compounds', 'Physical Properties of Ionic Compounds'), source: 'CK-12, via LibreTexts',
      url: 'https://chem.libretexts.org/Bookshelves/Introductory_Chemistry/Introductory_Chemistry_(CK-12)/08%3A_Ionic_and_Metallic_Bonding/8.09%3A_Physical_Properties_of_Ionic_Compounds',
      lookFor: [
        b('The melting point it gives for sodium chloride. Compare it with the 801 °C on the gauge.', ''),
        b('Its picture of a shifted layer. Which charges end up side by side, and does it match what the Lattice Builder showed?', ''),
        b('When it says ionic compounds conduct. Why not as a solid, if the ions are there all along?', ''),
      ],
    },
    {
      lang: 'en', kind: 'deeper',
      title: b('Lattice Energy', 'Lattice Energy'), source: 'Purdue University, General Chemistry Topic Review',
      url: 'https://chemed.chem.purdue.edu/genchem/topicreview/bp/ch7/lattice.php',
      lookFor: [
        b('Its value for sodium chloride, and the entry for {{Mg2+}} with {{O2-}} in its table. Do they match the gauge?', ''),
        b('The sodium salts from fluoride to iodide: 923, 787, 747 and 704 kJ/mol. Which property of the ions explains the trend?', ''),
        b('Its Coulomb\'s law. The page states it for the force, which falls with the square of the distance; the gauge uses energy, which falls with the distance itself. Do both say that closer ions hold on harder?', ''),
      ],
    },
    {
      lang: 'de', kind: 'quick',
      title: b('Ionenbindung', 'Ionenbindung'), source: 'Lernhelfer Schülerlexikon',
      url: 'https://www.lernhelfer.de/schuelerlexikon/chemie/artikel/ionenbindung',
      lookFor: [
        b('', 'Die Gleichungen Na → Na⁺ + e⁻ und Cl + e⁻ → Cl⁻. Vergleiche sie mit dem Elektronenübergang im Gitterbaukasten.'),
        b('', 'Den Satz, die Ionenbindung sei „ungerichtet“. Was bedeutet das für die sechs Nachbarn, die du gezählt hast?'),
        b('', 'Die Stelle, an der Atome einen günstigen Zustand „anstreben“. Atome streben nichts an: Was bezahlt in Wirklichkeit die Energie, um {{Na+}} zu bilden? (Tipp: die Gitterenergie, 787 kJ/mol bei {{NaCl}}.)'),
      ],
    },
  ] as Reading[],

  misconceptions: [
    { id: 'ionic-molecules', name: b('Salt is made of separate NaCl molecules', 'Salz besteht aus einzelnen NaCl-Molekülen') },
    { id: 'ionic-is-sharing', name: b('In a salt, the atoms share electrons', 'In einem Salz teilen sich die Atome Elektronen') },
    { id: 'bigger-heavier-stronger', name: b('Bigger or heavier ions hold together more strongly', 'Größere oder schwerere Ionen halten stärker zusammen') },
    { id: 'formula-one-to-one', name: b('Every ionic formula pairs one positive with one negative ion', 'Jede Ionenformel paart ein positives mit einem negativen Ion') },
    { id: 'ions-need-melting', name: b('Salt contains ions only once it melts or dissolves', 'Salz enthält erst Ionen, wenn es schmilzt oder sich löst') },
    { id: 'brittle-means-weak', name: b('Salt shatters because its bonds are weak', 'Salz zerspringt, weil seine Bindungen schwach sind') },
  ],

  glossary: {
    'ionic-bond': {
      en: 'ionic bond', de: 'Ionenbindung', unit: 4,
      def: { en: 'The attraction between positive and negative ions. It pulls in every direction, so it builds lattices, not molecules.', de: 'Die Anziehung zwischen positiven und negativen Ionen. Sie wirkt in alle Richtungen und baut deshalb Gitter auf, keine Moleküle.' },
    },
    'ionic-lattice': {
      en: 'ionic lattice', de: 'Ionengitter', unit: 4,
      def: { en: 'A giant, regular stack of positive and negative ions, each surrounded by ions of the opposite charge.', de: 'Eine riesige, regelmäßige Packung aus positiven und negativen Ionen, jedes umgeben von Ionen der Gegenladung.' },
      falseFriend: { en: 'German also says "Ionenkristall" for the crystal itself; "Ionengitter" is its arrangement.', de: '„Ionenkristall“ ist der Kristall selbst, „Ionengitter“ seine Anordnung.' },
    },
    'lattice-energy': {
      en: 'lattice energy', de: 'Gitterenergie', unit: 4,
      def: { en: 'The energy released when separate gaseous ions come together into one mole of solid lattice; the same amount is needed to pull it fully apart.', de: 'Die Energie, die frei wird, wenn sich getrennte, gasförmige Ionen zu einem Mol festem Gitter zusammenlagern; genauso viel braucht man, um es vollständig zu zerlegen.' },
      falseFriend: { en: 'Also called lattice enthalpy; some books give it as a negative number, the energy released.', de: 'Auch Gitterenthalpie genannt; manche Bücher geben sie als negative Zahl an, als frei werdende Energie.' },
    },
    'formula-unit': {
      en: 'formula unit', de: 'Formeleinheit', unit: 4,
      def: { en: 'The smallest whole-number ratio of ions in a salt, such as one {{Ca2+}} to two {{Cl-}} in {{CaCl2}}. A ratio, not a molecule.', de: 'Das kleinste ganzzahlige Verhältnis der Ionen in einem Salz, etwa ein {{Ca2+}} auf zwei {{Cl-}} in {{CaCl2}}. Ein Verhältnis, kein Molekül.' },
    },
  },
};
