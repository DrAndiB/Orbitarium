import type { Bi } from '../../i18n';
import type { Item } from '../items';

const b = (en: string, de: string): Bi => ({ en, de });

// Unit 5 question bank: three variants per concept (predict, why, transfer), every trap option tagged.
// Data: electronegativity (Pauling) from the elements table; bond energies and lengths from bonds.ts (OpenStax
// Chemistry 2e, Tables 7.2 and 7.3; C≡O 1080 kJ/mol, 113 pm). AlCl₃ turns to vapour (as Al₂Cl₆) at about 180 °C.
// Notation: English says "electronegativity" / "difference" in words; German uses the school notation EN / ΔEN.
// The octet is a counting rule here ("counts eight"), never a need or a goal of the atom.
export const BANK_U5: Item[] = [
  // ---------- u5.delta-chi ----------
  { id: 'i5a', unit: 5, kind: 'choice', format: 'predict', withConfidence: true, concepts: ['u5.delta-chi'], targets: ['equal-sharing-always', 'polar-means-ions'],
    prompt: b('O–H: [[electronegativity]] 3.44 against 2.20, a difference of 1.24. The bond is…', 'O–H: [[electronegativity]] 3,44 gegen 2,20, also ΔEN = 1,24. Die Bindung ist…'),
    options: [
      { text: b('nonpolar covalent', 'unpolar kovalent'), mis: 'equal-sharing-always' },
      { text: b('polar covalent', 'polar kovalent'), correct: true },
      { text: b('ionic', 'ionisch'), mis: 'polar-means-ions' },
      { text: b('metallic', 'metallisch') },
    ],
    explain: b('1.24 lies between about 0.4 and 1.8: the pair is shared, but unequally. Oxygen is slightly negative (δ−), hydrogen slightly positive (δ+): a [[polar-bond]].', '1,24 liegt zwischen etwa 0,5 und 1,7 (die App: 0,4 und 1,8): Das Paar wird geteilt, aber ungleich. Sauerstoff ist leicht negativ (δ−), Wasserstoff leicht positiv (δ+): eine [[polar-bond]].') },
  { id: 'i5r', unit: 5, kind: 'choice', format: 'why', evidence: 'explain', withConfidence: true, concepts: ['u5.delta-chi'], targets: ['bond-type-by-rule'],
    prompt: b('In HF the electronegativity difference is 1.78, right at the usual 1.8 border, yet HF is made of molecules and boils at 20 °C. What does that say about the bands?', 'In HF beträgt die ΔEN 1,78, genau an der Grenze (Schulbuch 1,7, App 1,8), trotzdem besteht HF aus Molekülen und siedet bei 20 °C. Was sagt das über die Bereiche?'),
    options: [
      { text: b('HF must really be ionic: anything near 1.8 counts as ionic', 'HF muss eigentlich ionisch sein: Alles ab der Grenze ist ionisch'), mis: 'bond-type-by-rule' },
      { text: b('They are rules of thumb: bonds shift gradually from shared to handed over', 'Sie sind Faustregeln: Bindungen gehen allmählich von geteilt zu abgegeben über'), correct: true },
      { text: b('The bands are exact, so the boiling point must be measured wrongly', 'Die Bereiche sind exakt, also ist der Siedepunkt falsch gemessen'), mis: 'bond-type-by-rule' },
      { text: b('The difference does not work for bonds with hydrogen', 'Die ΔEN funktioniert nicht für Bindungen mit Wasserstoff') },
    ],
    explain: b('There is no wall at 1.8: other books use 1.7 or 2.0. HF is a strongly polar molecule (about 41 % ionic from its measured dipole), sitting where "polar" shades into "ionic".', 'Bei der Grenze steht keine Mauer: Die App nimmt 1,8, viele Schulbücher 1,7, andere 2,0. HF ist ein stark polares Molekül (aus dem gemessenen Dipol etwa 41 % ionisch), genau dort, wo „polar“ in „ionisch“ übergeht.') },
  { id: 'i5s', unit: 5, kind: 'choice', format: 'predict', evidence: 'transfer', withConfidence: true, concepts: ['u5.delta-chi'], targets: ['bond-type-by-rule', 'equal-sharing-always'], table: 'chi',
    prompt: b('Aluminium chloride: a metal and a non-metal, electronegativity 1.61 and 3.16. Predict how it behaves.', 'Aluminiumchlorid: ein Metall und ein Nichtmetall, EN 1,61 und 3,16. Sag voraus, wie es sich verhält.'),
    options: [
      { text: b('Ionic: a metal and a non-metal always form a salt lattice', 'Ionisch: Metall und Nichtmetall bilden immer ein Salzgitter'), mis: 'bond-type-by-rule' },
      { text: b('Nonpolar: aluminium and chlorine share the pairs equally', 'Unpolar: Aluminium und Chlor teilen die Paare gleichmäßig'), mis: 'equal-sharing-always' },
      { text: b('Polar covalent (difference 1.55): it turns to vapour near 180 °C', 'Polar kovalent (ΔEN 1,55): Es verdampft schon bei etwa 180 °C'), correct: true },
      { text: b('Metallic: aluminium keeps its free electrons in the solid', 'Metallisch: Aluminium behält im Feststoff seine freien Elektronen') },
    ],
    explain: b('The difference is 1.55, below the ionic band. Solid {{AlCl3}} is no typical salt: it turns to vapour at about 180 °C as {{Al2Cl6}} molecules, while table salt melts only at 801 °C. "Metal plus non-metal means ionic" is a good first guess, not a law.', 'ΔEN = 1,55, unter der Grenze zum Ionischen. Festes {{AlCl3}} ist kein typisches Salz: Es geht schon bei etwa 180 °C als {{Al2Cl6}}-Moleküle in den Dampf über, während Kochsalz erst bei 801 °C schmilzt. „Metall plus Nichtmetall bedeutet ionisch“ ist eine gute erste Vermutung, kein Gesetz.') },
  { id: 'i5t', unit: 5, kind: 'choice', format: 'predict', withConfidence: true, concepts: ['u5.delta-chi'], targets: ['bond-type-by-rule'],
    prompt: b('Two bonds have electronegativity differences of 1.7 and 1.9. How different are they?', 'Zwei Bindungen haben ΔEN = 1,7 und ΔEN = 1,9. Wie verschieden sind sie?'),
    options: [
      { text: b('Completely different: one is covalent, the other ionic', 'Völlig verschieden: Die eine ist kovalent, die andere ionisch'), mis: 'bond-type-by-rule' },
      { text: b('Exactly alike: both count as polar covalent', 'Genau gleich: Beide zählen als polar kovalent') },
      { text: b('Quite similar: the second leans a little further to ionic', 'Recht ähnlich: Die zweite neigt etwas mehr zu ionisch'), correct: true },
      { text: b('Not comparable: the difference says nothing about the bond', 'Nicht vergleichbar: Die ΔEN sagt nichts über die Bindung') },
    ],
    explain: b('Pauling\'s estimate gives about 51 % and 59 % ionic. A step of 0.2 changes a bond a little, wherever it falls; a border such as 1.8 only marks roughly where chemists start calling a bond ionic.', 'Nach Paulings Abschätzung etwa 51 % und 59 % ionisch. Ein Schritt von 0,2 ändert eine Bindung nur ein wenig, wo auch immer er liegt; eine Grenze wie 1,7 oder 1,8 markiert nur ungefähr, ab wann man eine Bindung ionisch nennt.') },

  // ---------- u5.en ----------
  { id: 'i5b', unit: 5, kind: 'rank', format: 'rank', concepts: ['u5.en'], table: 'chi', mis: 'en-bigger-atom', targets: ['en-bigger-atom'],
    prompt: b('Rank the bonds by polarity, most polar first.', 'Ordne die Bindungen nach Polarität, die polarste zuerst.'),
    order: [b('H–F', 'H–F'), b('H–Cl', 'H–Cl'), b('H–Br', 'H–Br'), b('H–H', 'H–H')],
    explain: b('Electronegativity differences of 1.78, 0.96, 0.76 and 0. Electronegativity falls going down group 17, so each bond to hydrogen is a little less lopsided.', 'ΔEN = 1,78; 0,96; 0,76 und 0. Die EN sinkt in Gruppe 17 (VII. Hauptgruppe) nach unten, also wird jede Bindung zum Wasserstoff etwas weniger schief.') },
  { id: 'i5l', unit: 5, kind: 'choice', format: 'predict', withConfidence: true, concepts: ['u5.en'], targets: ['en-bigger-atom'], table: 'chi',
    prompt: b('Fluorine and iodine are both in group 17. Which pulls harder on a shared pair?', 'Fluor und Iod stehen beide in Gruppe 17 (VII. Hauptgruppe). Welches zieht stärker an einem gemeinsamen Paar?'),
    options: [
      { text: b('Iodine: its 53 protons outpull fluorine\'s 9', 'Iod: Seine 53 Protonen ziehen stärker als die 9 des Fluors'), mis: 'en-bigger-atom' },
      { text: b('Fluorine', 'Fluor'), correct: true },
      { text: b('Neither: same group, same pull', 'Keines: gleiche Gruppe, gleich starke Anziehung') },
      { text: b('Iodine: it has more electrons to attract with', 'Iod: Es hat mehr Elektronen, mit denen es anzieht'), mis: 'en-bigger-atom' },
    ],
    explain: b('Fluorine, 3.98 against 2.66. Iodine\'s extra protons are matched by extra inner electrons, and its shared pair sits three shells further out, so the pull on it is weaker.', 'Fluor, EN 3,98 gegen 2,66. Den zusätzlichen Protonen des Iods stehen zusätzliche innere Elektronen gegenüber, und sein gemeinsames Paar sitzt drei Schalen weiter außen, also wird es schwächer angezogen.') },
  { id: 'i5m', unit: 5, kind: 'choice', format: 'why', evidence: 'explain', withConfidence: true, concepts: ['u5.en'], targets: ['en-bigger-atom'], table: 'chi',
    prompt: b('Electronegativity rises from lithium (0.98) to fluorine (3.98) across period 2. Why?', 'Die EN steigt in der 2. Periode von Lithium (0,98) bis Fluor (3,98). Warum?'),
    options: [
      { text: b('The atoms get bigger, with more room for electrons', 'Die Atome werden größer und haben mehr Platz für Elektronen'), mis: 'en-bigger-atom' },
      { text: b('The atoms get heavier, and heavier atoms pull harder', 'Die Atome werden schwerer, und schwere Atome ziehen stärker'), mis: 'en-bigger-atom' },
      { text: b('Elements on the right need electrons more urgently', 'Elemente rechts brauchen Elektronen dringender') },
      { text: b('Each step adds a proton but no shell, so the pull grows', 'Jeder Schritt bringt ein Proton, aber keine Schale, also wächst die Anziehung'), correct: true },
    ],
    explain: b('Same shell, more protons: the effective pull of the nucleus on the outer shell rises from about 1 to 7 (unit 2), and the atoms shrink. A shared pair held closer to a stronger pull is held harder. Fluorine is in fact the smallest atom of the period.', 'Gleiche Schale, mehr Protonen: Die effektive Kernladung, die auf die Außenschale wirkt, steigt von etwa 1 auf 7 (Einheit 2), und die Atome schrumpfen. Ein gemeinsames Paar, das näher an einem stärker anziehenden Kern sitzt, wird fester gehalten. Fluor ist sogar das kleinste Atom der Periode.') },
  { id: 'i5n', unit: 5, kind: 'estimate', format: 'estimate', evidence: 'transfer', concepts: ['u5.en'],
    prompt: b('Electronegativity down group 17: fluorine 3.98, chlorine 3.16, bromine 2.96. Estimate iodine\'s.', 'EN in Gruppe 17 (VII. Hauptgruppe) abwärts: Fluor 3,98, Chlor 3,16, Brom 2,96. Schätze die EN von Iod.'),
    min: 1.5, max: 4.5, step: 0.05, answer: 2.66, tolerance: 0.2, suffix: '',
    near: [{ value: 3.6, tol: 0.6, note: b('That would mean the pull grows down the group. It falls: each step down puts the shared pair one shell further out.', 'Das hieße, die Anziehung wächst die Gruppe hinunter. Sie sinkt aber: Jeder Schritt nach unten setzt das gemeinsame Paar eine Schale weiter nach außen.') }],
    explain: b('2.66. Each step down group 17 adds a shell, so the shared pair sits further from the nucleus, while the extra protons are matched by extra inner electrons. The pull keeps falling, more slowly as it goes.', '2,66. Jeder Schritt in Gruppe 17 nach unten bringt eine Schale dazu, also sitzt das gemeinsame Paar weiter vom Kern entfernt, während den zusätzlichen Protonen zusätzliche innere Elektronen gegenüberstehen. Die EN sinkt weiter, nur langsamer.') },

  // ---------- u5.sharing ----------
  { id: 'i5c', unit: 5, kind: 'choice', format: 'predict', withConfidence: true, concepts: ['u5.sharing', 'u5.bond-count'],
    prompt: b('Each chlorine atom has seven outer electrons. In {{Cl2}} the two atoms share one pair. How many outer electrons does each chlorine now count around itself?', 'Jedes Chloratom hat sieben Außenelektronen. In {{Cl2}} teilen sich die zwei Atome ein Paar. Wie viele Außenelektronen zählt jedes Chlor jetzt um sich?'),
    options: [{ text: b('6', '6') }, { text: b('7', '7') }, { text: b('8', '8'), correct: true }, { text: b('14', '14') }],
    explain: b('Eight: its six unshared outer electrons plus the two in the shared pair. Both atoms count the shared pair, which is how sharing gives each of them an [[octet]].', 'Acht: seine sechs nicht geteilten Außenelektronen plus die zwei im gemeinsamen Paar. Beide Atome zählen das gemeinsame Paar mit, so kommt durch das Teilen jedes auf ein [[octet|Oktett]].') },
  { id: 'i5d', unit: 5, kind: 'choice', format: 'why', evidence: 'explain', withConfidence: true, concepts: ['u5.sharing'],
    prompt: b('What holds the two atoms of {{H2}} together?', 'Was hält die zwei Atome in {{H2}} zusammen?'),
    options: [
      { text: b('The two electrons attract each other', 'Die zwei Elektronen ziehen sich gegenseitig an') },
      { text: b('Both nuclei attract the shared pair between them', 'Beide Kerne ziehen das gemeinsame Paar zwischen sich an'), correct: true },
      { text: b('The two nuclei attract each other', 'Die zwei Kerne ziehen sich gegenseitig an') },
      { text: b('One atom gives its electron to the other', 'Ein Atom gibt sein Elektron an das andere ab') },
    ],
    explain: b('Each nucleus pulls on the pair of electrons between them, so both are tied to the same pair. The two electrons repel each other, and so do the two nuclei; the attraction to the shared pair wins, with the nuclei 74 pm (picometres) apart.', 'Jeder Kern zieht am Elektronenpaar zwischen ihnen, also hängen beide am selben Paar. Die zwei Elektronen stoßen sich ab, die zwei Kerne ebenso; die Anziehung zum gemeinsamen Paar gewinnt, bei 74 pm (Pikometer) Kernabstand.') },
  { id: 'i5e', unit: 5, kind: 'choice', format: 'predict', evidence: 'transfer', withConfidence: true, concepts: ['u5.sharing'],
    prompt: b('Methane, {{CH4}}: carbon shares one pair with each hydrogen. How many electrons sit in the bonds around carbon?', 'Methan, {{CH4}}: Kohlenstoff teilt mit jedem Wasserstoff ein Paar. Wie viele Elektronen sitzen in den Bindungen um den Kohlenstoff?'),
    options: [{ text: b('5', '5') }, { text: b('8', '8'), correct: true }, { text: b('4', '4') }, { text: b('16', '16') }],
    explain: b('Four shared pairs, eight electrons: four from carbon and one from each hydrogen. Carbon counts all eight, each hydrogen counts its own pair, two: both reach a full shell.', 'Vier gemeinsame Paare, acht Elektronen: vier vom Kohlenstoff und je eines von jedem Wasserstoff. Kohlenstoff zählt alle acht, jeder Wasserstoff sein eigenes Paar, also zwei: Beide erreichen eine volle Schale.') },

  // ---------- u5.bond-count ----------
  { id: 'i5f', unit: 5, kind: 'choice', format: 'predict', withConfidence: true, concepts: ['u5.bond-count'], targets: ['bonds-equal-outer-electrons', 'group-number-literal'], table: 'outer',
    prompt: b('Nitrogen sits in group 15. How many bonds does it form with hydrogen?', 'Stickstoff steht in Gruppe 15 (V. Hauptgruppe). Wie viele Bindungen bildet er mit Wasserstoff?'),
    options: [
      { text: b('5, one for each outer electron', '5, eine pro Außenelektron'), mis: 'bonds-equal-outer-electrons' },
      { text: b('1', '1') },
      { text: b('15, as the group number says', '15, wie die Gruppennummer sagt'), mis: 'group-number-literal' },
      { text: b('3', '3'), correct: true },
    ],
    explain: b('Five outer electrons: with three shared pairs nitrogen counts eight, {{NH3}}. Its other two outer electrons stay as a [[lone-pair]].', 'Fünf Außenelektronen: Mit drei gemeinsamen Paaren zählt Stickstoff acht, {{NH3}}. Seine anderen zwei Außenelektronen bleiben ein [[lone-pair]].') },
  { id: 'i5g', unit: 5, kind: 'choice', format: 'why', evidence: 'explain', withConfidence: true, concepts: ['u5.bond-count'], targets: ['bonds-equal-outer-electrons'],
    prompt: b('Oxygen has six outer electrons. Why does it form two bonds, as in water, and not six?', 'Sauerstoff hat sechs Außenelektronen. Warum bildet er zwei Bindungen, wie im Wasser, und nicht sechs?'),
    options: [
      { text: b('Each shared pair adds one to its count, and two bring it to eight', 'Jedes gemeinsame Paar zählt eines dazu, und zwei bringen ihn auf acht'), correct: true },
      { text: b('Every outer electron makes a bond, but four are blocked here', 'Jedes Außenelektron bildet eine Bindung, aber vier sind hier blockiert'), mis: 'bonds-equal-outer-electrons' },
      { text: b('Only two of its electrons are in the outer shell', 'Nur zwei seiner Elektronen sitzen in der Außenschale') },
      { text: b('Oxygen is too small to fit more than two neighbours', 'Sauerstoff ist zu klein für mehr als zwei Nachbarn') },
    ],
    explain: b('Each shared pair adds one electron to oxygen\'s count, so two pairs take it from six to eight, the octet arrangement, which for small atoms like oxygen is usually the lowest-energy way to bond. Its other four outer electrons stay as two lone pairs. The number of bonds counts the electrons missing from eight, not the outer ones.', 'Jedes gemeinsame Paar zählt bei Sauerstoff ein Elektron dazu, also bringen zwei Paare ihn von sechs auf acht, die Oktett-Anordnung, für kleine Atome wie Sauerstoff meist die energieärmste Art zu binden. Seine anderen vier Außenelektronen bleiben zwei freie Paare. Die Zahl der Bindungen zählt die Elektronen, die zur Acht fehlen, nicht die vorhandenen.') },
  { id: 'i5h', unit: 5, kind: 'choice', format: 'predict', evidence: 'transfer', withConfidence: true, concepts: ['u5.bond-count'], targets: ['bonds-equal-outer-electrons', 'group-number-literal'], table: 'outer',
    prompt: b('Sulfur sits below oxygen in group 16. Its compound with hydrogen is…', 'Schwefel steht in Gruppe 16 (VI. Hauptgruppe) unter Sauerstoff. Seine Verbindung mit Wasserstoff ist…'),
    options: [
      { text: b('{{SH}}', '{{SH}}') },
      { text: b('{{H2S}}', '{{H2S}}'), correct: true },
      { text: b('{{SH6}}', '{{SH6}}'), mis: 'bonds-equal-outer-electrons' },
      { text: b('{{SH16}}', '{{SH16}}'), mis: 'group-number-literal' },
    ],
    explain: b('Six outer electrons, like oxygen: two shared pairs bring sulfur to eight, just as in water. {{H2S}}.', 'Sechs Außenelektronen wie beim Sauerstoff: Zwei gemeinsame Paare bringen Schwefel auf acht, genau wie im Wasser. {{H2S}}.') },

  // ---------- u5.multiple-bonds ----------
  { id: 'i5i', unit: 5, kind: 'rank', format: 'rank', concepts: ['u5.multiple-bonds'], mis: 'double-bond-weaker', targets: ['double-bond-weaker'],
    prompt: b('Rank by bond energy, strongest first.', 'Ordne nach Bindungsenergie, die stärkste zuerst.'),
    order: [b('C≡C', 'C≡C'), b('C=C', 'C=C'), b('C–C', 'C–C')],
    explain: b('837, 611 and 345 kJ/mol: each extra shared pair holds the atoms tighter, and closer (120, 134 and 154 pm). Not twice or three times as strong, though: the second and third pairs add less than the first.', '837, 611 und 345 kJ/mol: Jedes weitere gemeinsame Paar hält die Atome fester und enger zusammen (120, 134 und 154 pm). Aber nicht doppelt oder dreifach so fest: Das zweite und dritte Paar bringen weniger als das erste.') },
  { id: 'i5j', unit: 5, kind: 'choice', format: 'why', evidence: 'explain', withConfidence: true, concepts: ['u5.multiple-bonds'], targets: ['double-bond-weaker'],
    prompt: b('Ethene (C=C) reacts far more readily than ethane (C–C). Does that mean the double bond is the weaker one?', 'Ethen (C=C) reagiert viel bereitwilliger als Ethan (C–C). Bedeutet das, die Doppelbindung ist die schwächere?'),
    options: [
      { text: b('Yes: reacting easily means the bond is weak', 'Ja: Wer leicht reagiert, hat eine schwache Bindung'), mis: 'double-bond-weaker' },
      { text: b('Yes: the two shared pairs push the atoms apart', 'Ja: Die zwei gemeinsamen Paare drücken die Atome auseinander'), mis: 'double-bond-weaker' },
      { text: b('No: it is stronger, but its second pair can react on its own', 'Nein: Sie ist stärker, aber ihr zweites Paar kann allein reagieren'), correct: true },
      { text: b('No: single and double bonds are equally strong', 'Nein: Einfach- und Doppelbindungen sind gleich stark') },
    ],
    explain: b('C=C takes 611 kJ/mol to break, C–C 345: the double bond is stronger. But its second pair adds only about 266 kJ/mol and sits more exposed, so a reaction can break that part alone and leave a single bond (unit 43).', 'C=C braucht 611 kJ/mol zum Spalten, C–C 345: Die Doppelbindung ist stärker. Aber ihr zweites Paar bringt nur etwa 266 kJ/mol und liegt offener, also kann eine Reaktion nur diesen Teil lösen und eine Einfachbindung übrig lassen (Einheit 43).') },
  { id: 'i5k', unit: 5, kind: 'choice', format: 'predict', evidence: 'transfer', withConfidence: true, concepts: ['u5.multiple-bonds'], targets: ['double-bond-weaker'],
    prompt: b('A C=O bond (as in carbonyl groups) is 123 pm long and takes 741 kJ/mol to break. Carbon monoxide has a triple bond, C≡O. Predict its bond.', 'Eine C=O-Bindung (wie in Carbonylgruppen) ist 123 pm lang und braucht 741 kJ/mol zum Spalten. Kohlenmonoxid hat eine Dreifachbindung, C≡O. Sag seine Bindung voraus.'),
    options: [
      { text: b('Longer and weaker: three pairs crowd each other', 'Länger und schwächer: Drei Paare bedrängen sich'), mis: 'double-bond-weaker' },
      { text: b('The same: it still joins carbon to oxygen', 'Gleich: Sie verbindet immer noch C und O') },
      { text: b('Longer, but stronger', 'Länger, aber stärker') },
      { text: b('Shorter and stronger', 'Kürzer und stärker'), correct: true },
    ],
    explain: b('113 pm and 1080 kJ/mol: the third shared pair pulls the nuclei closer still and adds strength. C≡O is one of the strongest bonds known.', '113 pm und 1080 kJ/mol: Das dritte gemeinsame Paar zieht die Kerne noch enger zusammen und macht die Bindung stärker. C≡O ist eine der stärksten bekannten Bindungen.') },

  // ---------- u5.partial-charges ----------
  { id: 'i5o', unit: 5, kind: 'choice', format: 'predict', withConfidence: true, concepts: ['u5.partial-charges'], targets: ['delta-sign-swapped', 'equal-sharing-always'],
    prompt: b('In an N–H bond (electronegativity: N 3.04, H 2.20), which atom carries δ−, the slightly negative end?', 'In einer N–H-Bindung (EN: N 3,04, H 2,20): Welches Atom trägt δ−, das leicht negative Ende?'),
    options: [
      { text: b('Hydrogen', 'Wasserstoff'), mis: 'delta-sign-swapped' },
      { text: b('Nitrogen', 'Stickstoff'), correct: true },
      { text: b('Neither: the pair is shared equally', 'Keines: Das Paar wird gleichmäßig geteilt'), mis: 'equal-sharing-always' },
      { text: b('Both, a little each', 'Beide, jeweils ein bisschen') },
    ],
    explain: b('Nitrogen pulls harder, so the shared pair spends more time near it: N is δ−, H is δ+. The difference is 0.84, a polar bond.', 'Stickstoff zieht stärker, also hält sich das gemeinsame Paar mehr bei ihm auf: N ist δ−, H ist δ+. ΔEN = 0,84, eine polare Bindung.') },
  { id: 'i5p', unit: 5, kind: 'choice', format: 'why', evidence: 'explain', withConfidence: true, concepts: ['u5.partial-charges'], targets: ['polar-means-ions'],
    prompt: b('In H–Cl, why is chlorine only δ− (slightly negative), not a full Cl⁻?', 'Warum ist Chlor in H–Cl nur δ− (leicht negativ) und kein volles Cl⁻?'),
    options: [
      { text: b('δ− is just another way of writing a full minus', 'δ− ist nur eine andere Schreibweise für ein volles Minus'), mis: 'polar-means-ions' },
      { text: b('Chlorine takes the electron, then gives half of it back', 'Chlor nimmt das Elektron und gibt die Hälfte zurück') },
      { text: b('The pair is still shared; it just stays nearer to chlorine', 'Das Paar wird weiter geteilt; es bleibt nur näher am Chlor'), correct: true },
      { text: b('Hydrogen has no inner electrons, so it cannot lose charge', 'Wasserstoff hat keine inneren Elektronen und kann keine Ladung abgeben') },
    ],
    explain: b('δ marks a part of a charge. Hydrogen still holds on to the pair, so chlorine gets only a share of the extra negative charge: measured, about a fifth of a full charge.', 'δ steht für einen Teil einer Ladung. Wasserstoff hält das Paar weiter mit fest, also bekommt Chlor nur einen Anteil der zusätzlichen negativen Ladung: gemessen etwa ein Fünftel einer vollen Ladung.') },
  { id: 'i5q', unit: 5, kind: 'choice', format: 'predict', evidence: 'transfer', withConfidence: true, concepts: ['u5.partial-charges'], targets: ['delta-sign-swapped', 'equal-sharing-always', 'polar-means-ions'],
    prompt: b('Water\'s bonds are O–H (electronegativity: O 3.44, H 2.20). Where are the partial charges?', 'Die Bindungen im Wasser sind O–H (EN: O 3,44, H 2,20). Wo sitzen die Partialladungen?'),
    options: [
      { text: b('δ− on oxygen, δ+ on each hydrogen', 'δ− am Sauerstoff, δ+ an jedem Wasserstoff'), correct: true },
      { text: b('δ− on each hydrogen, δ+ on oxygen', 'δ− an jedem Wasserstoff, δ+ am Sauerstoff'), mis: 'delta-sign-swapped' },
      { text: b('None: O and H share the pairs equally', 'Keine: O und H teilen die Paare gleichmäßig'), mis: 'equal-sharing-always' },
      { text: b('A full 2− on oxygen, 1+ on each hydrogen', 'Volle 2− am Sauerstoff, 1+ an jedem Wasserstoff'), mis: 'polar-means-ions' },
    ],
    explain: b('Oxygen pulls harder (difference 1.24), so each O–H pair leans towards oxygen: O is slightly negative (δ−), both hydrogens slightly positive (δ+). Partial charges, not ions: water is made of molecules.', 'Sauerstoff zieht stärker (ΔEN 1,24), also rückt jedes O–H-Paar zum Sauerstoff: O ist leicht negativ (δ−), beide Wasserstoffe leicht positiv (δ+). Teilladungen, keine Ionen: Wasser besteht aus Molekülen.') },
];
