// Unit 0 — The periodic table as a map. Every later unit reads data off this map.
import type { Bi } from '../i18n';
import type { ChoiceItem, EstimateItem, FlawItem } from './items';
import type { Idea } from './unit06';
import type { OverlayId } from './elements';

const b = (en: string, de: string): Bi => ({ en, de });

export interface ExploreTask0 { id: string; text: Bi; challenge?: boolean; }
export interface Prediction0 { item: ChoiceItem; overlay: OverlayId; select: number; revealText: Bi; }
export interface CellExample { z: number; title: Bi; steps: Bi[]; soWhat: Bi; overlay: OverlayId; }

export const UNIT0 = {
  n: 0,
  title: b('The periodic table as a map', 'Das Periodensystem als Karte'),
  lead: b('Every number you will need later sits on one map. Learn to read it, and you never have to memorise most of it.',
    'Jede Zahl, die du später brauchst, steht auf einer Karte. Wer sie lesen kann, muss das meiste davon nie auswendig lernen.'),
  warmupIntro: b('Three quick questions to see what you already know about the table. Guessing is fine.',
    'Drei kurze Fragen, um zu sehen, was du schon über das Periodensystem weißt. Raten ist erlaubt.'),

  puzzle: {
    title: b('A hole in the map', 'Ein Loch in der Karte'),
    lead: b('In 1871 Mendeleev\'s table had gaps. He was so sure of the pattern that he described an element nobody had ever seen.',
      '1871 hatte Mendelejews Tabelle Lücken. Er war sich des Musters so sicher, dass er ein Element beschrieb, das noch niemand gesehen hatte.'),
    // the neighbours of the gap below silicon, as known in 1871 (masses in u)
    row: [{ s: 'Zn', m: 65.4 }, { s: '?', m: null }, { s: '?', m: null }, { s: 'As', m: 74.9 }, { s: 'Se', m: 79.0 }],
    column: [{ s: 'C', m: 12.0 }, { s: 'Si', m: 28.1 }, { s: '?', m: null }, { s: 'Sn', m: 118.7 }],
    clash: b('Two places in the row were still empty, and the second one sat right below silicon. From its neighbours, what should that missing element weigh?',
      'Zwei Plätze in der Zeile waren noch leer, und der zweite lag direkt unter Silicium. Was sollte das fehlende Element nach seinen Nachbarn wiegen?'),
    item: {
      id: 'u0-gap', unit: 0, kind: 'estimate', format: 'estimate', evidence: 'predict', concepts: ['u0.families', 'u0.rows-shells'],
      prompt: b('Estimate the atomic mass of the element below silicon.', 'Schätze die Atommasse des Elements unter Silicium.'),
      min: 50, max: 100, step: 0.5, answer: 72.6, tolerance: 2.5, suffix: ' u',
      explain: b('Along the row, zinc (65.4) to arsenic (74.9) is three steps of about 3.2 u, giving about 71.7 for the second gap. Down the column, the average of silicon and tin is 73.4. Mendeleev predicted 72; germanium, found in 1886, weighs 72.6.',
        'Entlang der Zeile sind es von Zink (65,4) bis Arsen (74,9) drei Schritte zu je etwa 3,2 u, also rund 71,7 für die zweite Lücke. Die Spalte hinunter liegt der Mittelwert aus Silicium und Zinn bei 73,4. Mendelejew sagte 72 voraus; Germanium, 1886 gefunden, wiegt 72,6.'),
    } as EstimateItem,
    after: b('The first gap became gallium (69.7), found in 1875. A map good enough to predict what has not been found yet is a map worth learning to read.',
      'Die erste Lücke wurde Gallium (69,7), gefunden 1875. Eine Karte, die vorhersagt, was noch niemand gefunden hat, lohnt es sich lesen zu lernen.'),
  },

  explore: {
    intro: b('Switch what the colours show, tap elements and read their cards. The 3D landscape turns each number into a height.',
      'Wechsle, was die Farben zeigen, tippe Elemente an und lies ihre Karten. Die 3D-Landschaft macht aus jeder Zahl eine Höhe.'),
    tasks: [
      { id: 'rows', text: b('Choose "Shells (rows)" and tap an element in row 4. How many shells does it have?', 'Wähle „Schalen (Zeilen)“ und tippe ein Element in Zeile 4 an. Wie viele Schalen hat es?') },
      { id: 'columns', text: b('Choose "Outer electrons (columns)" and tap a member of group 17.', 'Wähle „Außenelektronen (Spalten)“ und tippe ein Element der Gruppe 17 an.') },
      { id: 'blocks', text: b('Choose "Blocks" and tap any element where d orbitals are filling.', 'Wähle „Blöcke“ und tippe ein Element an, bei dem sich d-Orbitale füllen.') },
      { id: 'chi', text: b('Choose "Electronegativity" and find the element that pulls hardest on electrons.', 'Wähle „Elektronegativität“ und finde das Element, das am stärksten an Elektronen zieht.') },
      { id: 'k', text: b('Tap K and find out why potassium\'s symbol is K.', 'Tippe K an und finde heraus, warum Kalium das Symbol K hat.') },
      { id: 'order', challenge: true, text: b('Challenge: with "Atomic mass" on, find two neighbours where the heavier one comes first. Tap one, then the other.', 'Herausforderung: Finde mit „Atommasse“ zwei Nachbarn, bei denen das schwerere zuerst kommt. Tippe erst das eine, dann das andere an.') },
    ] as ExploreTask0[],
    orderFound: b('Found one. The table is ordered by protons, not by mass: argon has 18 protons, potassium 19, even though argon atoms are heavier on average.',
      'Gefunden. Das Periodensystem ist nach Protonen geordnet, nicht nach Masse: Argon hat 18 Protonen, Kalium 19, obwohl Argonatome im Mittel schwerer sind.'),
  },

  predictions: [
    {
      item: {
        id: 'u0-rb', unit: 0, kind: 'choice', format: 'predict', withConfidence: true, evidence: 'transfer', concepts: ['u0.families', 'u0.rows-shells'],
        prompt: b('Rubidium sits right below potassium, one row further down. Potassium needs 419 kJ/mol to lose its outer electron. Rubidium needs…', 'Rubidium steht direkt unter Kalium, eine Zeile tiefer. Kalium braucht 419 kJ/mol, um sein Außenelektron abzugeben. Rubidium braucht…'),
        options: [
          { text: b('more, because it is heavier', 'mehr, weil es schwerer ist') },
          { text: b('less, because its outer electron sits one shell further out', 'weniger, weil sein Außenelektron eine Schale weiter außen sitzt'), correct: true },
          { text: b('the same, because both are in group 1', 'gleich viel, weil beide in Gruppe 1 stehen') },
        ],
        explain: b('403 kJ/mol. One more shell puts the outer electron further from the nucleus, behind more inner electrons, so it comes off more easily.',
          '403 kJ/mol. Eine Schale mehr setzt das Außenelektron weiter vom Kern weg, hinter mehr innere Elektronen – es löst sich leichter.'),
      } as ChoiceItem,
      overlay: 'ie', select: 37,
      revealText: b('With the ionization overlay on, group 1 runs downhill from hydrogen to francium. Rows explain it: each step down adds a shell.',
        'Mit der Ionisierungsansicht fällt Gruppe 1 von Wasserstoff bis Francium ab. Die Zeilen erklären es: Jeder Schritt nach unten bringt eine Schale dazu.'),
    },
    {
      item: {
        id: 'u0-se', unit: 0, kind: 'choice', format: 'predict', withConfidence: true, evidence: 'transfer', concepts: ['u0.columns-outer', 'u0.families'],
        prompt: b('Selenium sits below oxygen and sulfur in group 16. Water is {{H2O}} and hydrogen sulfide {{H2S}}. With hydrogen, selenium forms…', 'Selen steht in Gruppe 16 unter Sauerstoff und Schwefel. Wasser ist {{H2O}}, Schwefelwasserstoff {{H2S}}. Mit Wasserstoff bildet Selen…'),
        options: [
          { text: b('{{HSe}}', '{{HSe}}') },
          { text: b('{{H2Se}}', '{{H2Se}}'), correct: true },
          { text: b('{{H3Se}}', '{{H3Se}}') },
          { text: b('{{SeH4}}', '{{SeH4}}') },
        ],
        explain: b('Group 16 means six outer electrons, two short of an octet, so two bonds: {{H2Se}}. A family shares its formulas.',
          'Gruppe 16 heißt sechs Außenelektronen, zwei fehlen zum Oktett, also zwei Bindungen: {{H2Se}}. Eine Familie teilt ihre Formeln.'),
      } as ChoiceItem,
      overlay: 'outer', select: 34,
      revealText: b('Every element in the column shows 6 outer electrons. Hydrogen selenide really exists: a foul-smelling and very toxic gas.',
        'Jedes Element der Spalte zeigt 6 Außenelektronen. Selenwasserstoff gibt es wirklich: ein übel riechendes, sehr giftiges Gas.'),
    },
  ] as Prediction0[],

  examples: [
    {
      z: 17, overlay: 'shells', title: b('Chlorine', 'Chlor'),
      steps: [
        b('Atomic number 17: 17 protons, and 17 electrons in the neutral atom.', 'Ordnungszahl 17: 17 Protonen und im neutralen Atom 17 Elektronen.'),
        b('Period 3: three shells, filled 2, 8, 7.', 'Periode 3: drei Schalen, gefüllt mit 2, 8, 7.'),
        b('Group 17: seven outer electrons, one short of an octet, so it gains one and becomes Cl⁻.', 'Gruppe 17: sieben Außenelektronen, eins fehlt zum Oktett – es nimmt eins auf und wird zu Cl⁻.'),
        b('Atomic mass 35.45: about 76 % chlorine-35 and 24 % chlorine-37, so 0.76 × 35 + 0.24 × 37 ≈ 35.5.', 'Atommasse 35,45: etwa 76 % Chlor-35 und 24 % Chlor-37, also 0,76 × 35 + 0,24 × 37 ≈ 35,5.'),
      ],
      soWhat: b('One cell gives you the ion charge you needed for NaCl in unit 4, without memorising it.', 'Eine Zelle liefert dir die Ionenladung, die du in Einheit 4 für NaCl brauchtest – ohne Auswendiglernen.'),
    },
    {
      z: 11, overlay: 'outer', title: b('Sodium', 'Natrium'),
      steps: [
        b('Period 3, group 1: shells 2, 8, 1.', 'Periode 3, Gruppe 1: Schalen 2, 8, 1.'),
        b('One outer electron, given up cheaply (496 kJ/mol), so sodium forms Na⁺.', 'Ein Außenelektron, das es leicht abgibt (496 kJ/mol) – Natrium bildet Na⁺.'),
        b('Symbol Na from the Latin natrium, which is also its German name.', 'Das Symbol Na kommt vom lateinischen natrium, dem deutschen Namen.'),
      ],
      soWhat: b('Same column, same story: lithium, potassium and rubidium all form 1+ ions.', 'Gleiche Spalte, gleiche Geschichte: Lithium, Kalium und Rubidium bilden alle 1+-Ionen.'),
    },
    {
      z: 26, overlay: 'block', title: b('Iron', 'Eisen'),
      steps: [
        b('Period 4, but in the d-block: its newest electrons go into 3d orbitals.', 'Periode 4, aber im d-Block: Seine neuesten Elektronen landen in 3d-Orbitalen.'),
        b('Group 8 does not mean eight outer electrons here. Counting only works for the main groups.', 'Gruppe 8 heißt hier nicht acht Außenelektronen. Das Zählen klappt nur bei den Hauptgruppen.'),
        b('Iron forms two common ions, Fe²⁺ and Fe³⁺: rust is mostly iron(III) oxide.', 'Eisen bildet zwei häufige Ionen, Fe²⁺ und Fe³⁺: Rost ist größtenteils Eisen(III)-oxid.'),
      ],
      soWhat: b('This is where the simple map ends. Transition metals need the card, not the column.', 'Hier endet die einfache Karte. Bei Übergangsmetallen hilft die Karte des Elements, nicht die Spalte.'),
    },
  ] as CellExample[],

  locate: {
    id: 'u0-locate', concepts: ['u0.rows-shells', 'u0.columns-outer'],
    prompt: b('Tap the element with three shells and five outer electrons.', 'Tippe das Element mit drei Schalen und fünf Außenelektronen an.'),
    answer: [15],
    explain: b('Phosphorus: period 3 gives three shells, group 15 gives five outer electrons (2, 8, 5). It sits right below nitrogen.',
      'Phosphor: Periode 3 heißt drei Schalen, Gruppe 15 heißt fünf Außenelektronen (2, 8, 5). Er steht direkt unter Stickstoff.'),
  },

  flaw: {
    id: 'u0-flaw', unit: 0, kind: 'flaw', format: 'flaw', evidence: 'transfer', concepts: ['u0.mass-average'], targets: ['mass-is-one-atom'],
    prompt: b('One step in this reasoning is wrong. Which one?', 'Ein Schritt in dieser Überlegung ist falsch. Welcher?'),
    lines: [
      b('Chlorine\'s cell shows atomic number 17 and atomic mass 35.45.', 'Die Zelle von Chlor zeigt Ordnungszahl 17 und Atommasse 35,45.'),
      b('The atomic number counts protons, so every chlorine atom has 17 protons.', 'Die Ordnungszahl zählt Protonen, also hat jedes Chloratom 17 Protonen.'),
      b('Protons and neutrons each weigh about 1 u, so every chlorine atom has 35.45 − 17 = 18.45 neutrons.', 'Protonen und Neutronen wiegen je etwa 1 u, also hat jedes Chloratom 35,45 − 17 = 18,45 Neutronen.'),
      b('With seven outer electrons, chlorine gains one electron and forms Cl⁻.', 'Mit sieben Außenelektronen nimmt Chlor ein Elektron auf und bildet Cl⁻.'),
    ],
    flaw: 2,
    explain: b('Step 3. 35.45 is an average over isotopes: each single atom has a whole number of neutrons, 18 (chlorine-35) or 20 (chlorine-37).',
      'Schritt 3. 35,45 ist ein Mittelwert über Isotope: Jedes einzelne Atom hat eine ganze Zahl Neutronen, 18 (Chlor-35) oder 20 (Chlor-37).'),
  } as FlawItem,

  explain: {
    prompt: b('In your own words: what does an element\'s position in the table tell you?', 'In eigenen Worten: Was verrät dir die Position eines Elements im Periodensystem?'),
    ideas: [
      { id: 'order', concept: 'u0.core-elements', idea: b('The order is by atomic number, one proton at a time', 'Die Reihenfolge folgt der Ordnungszahl, ein Proton nach dem anderen'),
        en: /(atomic number|proton|\bz\b)/i, de: /(ordnungszahl|proton|kernladung)/i },
      { id: 'rows', concept: 'u0.rows-shells', idea: b('The row (period) gives the number of shells', 'Die Zeile (Periode) gibt die Zahl der Schalen an'),
        en: /((row|period)s?\b.{0,60}\bshell)|(shell.{0,60}\b(row|period))/i, de: /((zeile|periode).{0,60}schale)|(schale.{0,60}(zeile|periode))/i },
      { id: 'columns', concept: 'u0.columns-outer', idea: b('The column (group) gives the number of outer electrons', 'Die Spalte (Gruppe) gibt die Zahl der Außenelektronen an'),
        en: /((column|group).{0,60}(outer|valence|outermost))|((outer|valence).{0,60}(column|group))/i, de: /((spalte|gruppe).{0,60}(außen|aussen|valenz))|((außen|aussen|valenz).{0,60}(spalte|gruppe))/i },
      { id: 'family', concept: 'u0.families', idea: b('Elements in one column behave alike', 'Elemente einer Spalte verhalten sich ähnlich'),
        en: /(similar|alike|same).{0,40}(chemi|behav|propert|react|bond|ion)|famil/i, de: /(ähnlich|gleich).{0,40}(chemi|verhalt|eigenschaft|reagier|bind|ion)|famili/i },
      { id: 'blocks', concept: 'u0.blocks', idea: b('Blocks and trends: which orbitals fill, and how properties change across the map', 'Blöcke und Trends: welche Orbitale sich füllen und wie sich Eigenschaften über die Karte ändern'),
        en: /(block|orbital|trend|electronegativ|metal|radius|size|ioni[sz]ation)/i, de: /(block|orbital|trend|elektronegativ|metall|radius|größe|ionisier)/i },
    ] as Idea[],
    tightened: b('Elements are lined up by atomic number, one proton at a time. The row tells you how many shells an atom has; in the main groups, the column tells you how many outer electrons it has, which is why a column behaves like a family. The blocks show which orbitals are filling, and properties such as electronegativity and atom size change steadily across the map.',
      'Die Elemente sind nach Ordnungszahl aufgereiht, ein Proton nach dem anderen. Die Zeile sagt, wie viele Schalen ein Atom hat; in den Hauptgruppen sagt die Spalte, wie viele Außenelektronen es hat – deshalb verhält sich eine Spalte wie eine Familie. Die Blöcke zeigen, welche Orbitale sich füllen, und Eigenschaften wie Elektronegativität und Atomgröße ändern sich gleichmäßig über die Karte.'),
  },

  terms: ['period', 'group', 'atomic-number', 'atomic-mass', 'noble-gas', 'alkali-metal'],

  reading: {
    title: b('Dmitri Ivanovitch Mendeleeff', 'Dmitri Iwanowitsch Mendelejew (englisch)'),
    source: 'Purdue University, ChemEd',
    url: 'https://chemed.chem.purdue.edu/genchem/history/mendeleeff.html',
    lookFor: [
      b('The table comparing his "eka-silicon" with germanium. How close was your estimate from the puzzle?', 'Die Tabelle, die sein „Eka-Silicium“ mit Germanium vergleicht. Wie nah war deine Schätzung aus dem Rätsel?'),
      b('Where he put tellurium before iodine against the masses. Find both in your table with the atomic mass view on.', 'Wo er Tellur entgegen den Massen vor Iod setzte. Finde beide in deinem Periodensystem mit der Atommassen-Ansicht.'),
      b('Which other gaps he named with "eka-". Look up gallium and scandium on the map and read their cards.', 'Welche anderen Lücken er mit „Eka-“ benannte. Schlag Gallium und Scandium auf der Karte nach und lies ihre Karten.'),
    ],
  },
};
