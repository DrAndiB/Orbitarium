// Unit 5 — Covalent bonds and electronegativity, on the Charge Field.
// Data: electronegativities (Pauling) from the elements table; bond lengths and energies from bonds.ts
// (OpenStax Chemistry 2e, Table 7.2); C–F 439 kJ/mol and C≡O 1080 kJ/mol / 113 pm also from OpenStax 2e,
// Tables 7.2 and 7.3. Ionic character: Pauling's estimate 1 − e^(−Δχ²/4) (bonds.ts). Dipole moments (CRC
// Handbook): HCl 1.11 D, HF 1.83 D. Boiling points: HCl −85 °C, Cl₂ −34 °C, HF 20 °C. First ionization
// energies: atoms.ts (Na 496, H 1312, Cl 1251 kJ/mol). Electron affinities (energy released on gaining one
// electron; CRC Handbook): Na 53, H 73, Cl 349 kJ/mol. Pauling electronegativity reflects both holding on (IE)
// and taking on (EA); the puzzle must never suggest that ionization energy alone decides.
// Notation: English text says "electronegativity" and "difference" in words, with χ / Δχ only next to them;
// German text uses the school notation EN / ΔEN and mentions χ once, in the puzzle feedback.
import type { Bi } from '../i18n';
import type { ChoiceItem, RankItem, FlawItem, EstimateItem } from './items';
import type { Idea } from './unit06';
import type { UnitContent } from './unitTypes';

const b = (en: string, de: string): Bi => ({ en, de });

// The unit's main misconception: covalent bonds always share equally. A clause that says so (without a
// qualifier such as "nonpolar", "same atoms", "only" or a negation) rules out the ideas it contradicts.
// Evidence for idea 2 besides an explicit count: an octet term together with a bonding or counting word in the
// same clause ("bilden so viele Elektronenpaarbindungen, dass …", "damit beide die Edelgaskonfiguration
// (Oktett) erreichen"). A bare "octet" / "Edelgaskonfiguration" does not pass, and neither does an ionic bond.
const OCTET_EN = /(octet|noble[- ]gas (configuration|arrangement|shell|structure)|(eight|8) (outer |valence |shared )?electrons|full (outer )?shell|\bto eight\b|reach(es)? eight|counts? eight)/;
const BONDING_EN = /(shar(e|es|ed|ing)\b|(?<!ionic )bonds?\b|pairs?\b|so that|until|in order to|missing)/;
const OCTET_DE = /(oktett|edelgas(konfiguration|schale|zustand|anordnung)|(acht|8) (außen|valenz|bindungs)?elektronen|auf acht\b|bis acht\b)/;
const BONDING_DE = /((?<!ionen)bindung|paar(e|en)?\b|\bteil(en|t)\b|gemeinsam|damit|^um\b|so viele|\bbis\b|fehl)/;
const together = (a: RegExp, c: RegExp) => `(${a.source}.{0,60}${c.source}|${c.source}.{0,60}${a.source})`;

// The misconception "as many bonds as outer electrons" must not count as idea 2.
const BONDS_AS_OUTER = {
  en: /as many (bonds|pairs|shared pairs) as (it has |there are )?(outer|valence) electrons/,
  // (A comma before "wie" ends the clause, so the second half is matched on its own.)
  de: /(so viele (bindungen|paare|elektronenpaare|elektronenpaarbindungen),? wie|^wie) (es|sie|das atom|ein atom|jedes atom) (außen|valenz)elektronen (hat|haben|besitzt)/,
};

const EQUAL_SHARING = {
  en: /^(?!.*(nonpolar|non-polar|same atoms|identical|two hydrogen|two chlorine|h2\b|cl2\b|h–h|cl–cl|n't|\bnot\b|\bnever\b|\brarely\b|\bseldom\b|\bunless\b|\bonly\b)).*\b(always|every|all|covalent bonds?)\b.{0,40}\b(equal(ly)?|even(ly)?|fair(ly)?)\b/,
  de: /^(?!.*(unpolar|gleiche[nr]? atome|identisch|zwei wasserstoff|zwei chlor|h2\b|cl2\b|h–h|cl–cl|nicht|\bnie\b|selten|\bnur\b)).*\b(immer|jede|alle|atombindungen?|elektronenpaarbindungen?|kovalente bindungen?)\b.{0,40}\b(gleich(mäßig)?|fair)\b/,
};

export const UNIT5: UnitContent = {
  n: 5,
  title: b('Covalent bonds and electronegativity', 'Atombindung und Elektronegativität'),
  lead: b('Why two atoms share electrons, and why they rarely share them fairly.', 'Warum zwei Atome Elektronen teilen, und warum sie selten fair teilen.'),

  puzzle: {
    title: b('Taken or shared?', 'Abgegeben oder geteilt?'),
    lead: b('Sodium and hydrogen each have one outer electron, and both combine with chlorine. Chlorine also bonds to a second chlorine atom, giving {{Cl2}}. The results could hardly be more different.',
      'Natrium und Wasserstoff haben je ein Außenelektron, und beide verbinden sich mit Chlor. Und Chlor verbindet sich auch mit einem zweiten Chloratom zu {{Cl2}}. Die Ergebnisse könnten kaum verschiedener sein.'),
    data: {
      caption: b('Chlorine and three partners. "Holds on": the partner\'s first ionization energy, the energy to pull its own outer electron off. "Takes on": its electron affinity, the energy released when it takes one extra electron. Both in kJ/mol, as in unit 3.',
        'Chlor und drei Partner. Ionisierungsenergie: Energie, um dem Partner sein eigenes Außenelektron abzuziehen (wie fest er es hält). Elektronenaffinität: Energie, die frei wird, wenn der Partner ein zusätzliches Elektron aufnimmt. Beides in kJ/mol wie in Einheit 3.'),
      head: [b('Partner', 'Partner'), b('Holds on', 'Ionisierungs\u00adenergie'), b('Takes on', 'Elektronen\u00adaffinität'), b('With chlorine', 'Mit Chlor')],
      rows: [
        { cells: [b('sodium', 'Natrium'), '496', '53', b('{{NaCl}}: solid, melts at 801 °C', '{{NaCl}}: fest, schmilzt bei 801 °C')] },
        { cells: [b('hydrogen', 'Wasserstoff'), '1312', '73', b('{{HCl}}: gas, boils at −85 °C', '{{HCl}}: Gas, siedet bei −85 °C')], mystery: true },
        { cells: [b('chlorine', 'Chlor'), '1251', '349', b('{{Cl2}}: gas, boils at −34 °C', '{{Cl2}}: Gas, siedet bei −34 °C')] },
      ],
      numeric: [1, 2],
    },
    clash: b('Chlorine takes sodium\'s electron outright: salt is a solid lattice of Na⁺ and Cl⁻ ions. With hydrogen it only shares a pair of electrons, unevenly: hydrogen chloride is a gas of small HCl molecules. With a second chlorine atom it shares a pair exactly evenly. Yet hydrogen holds on to its own electron even more tightly than chlorine does (1312 against 1251). What decides whether chlorine takes the electron for good or only shares a pair with its partner?',
      'Dem Natrium nimmt Chlor das Elektron ganz ab: Kochsalz ist ein festes Gitter aus Na⁺- und Cl⁻-Ionen. Mit dem Wasserstoff teilt es sich nur ein Elektronenpaar, und zwar ungleich: Chlorwasserstoff ist ein Gas aus kleinen HCl-Molekülen. Mit einem zweiten Chloratom teilt es ein Paar genau gleichmäßig. Dabei hält Wasserstoff sein eigenes Elektron sogar fester als Chlor (1312 gegenüber 1251). Was entscheidet, ob Chlor das Elektron ganz übernimmt oder sich nur ein Elektronenpaar mit dem Partner teilt?'),
    question: {
      id: 'u5-puzzle', unit: 5, kind: 'choice', format: 'predict', withConfidence: true, evidence: 'predict',
      concepts: ['u5.en', 'u5.sharing'], targets: ['equal-sharing-always'],
      prompt: b('Your best guess:', 'Deine beste Vermutung:'),
      options: [
        { text: b('Hydrogen is a gas, and gases cannot form ions', 'Wasserstoff ist ein Gas, und Gase bilden keine Ionen') },
        { text: b('Only how tightly the partner holds its own electron', 'Nur, wie fest der Partner sein eigenes Elektron hält') },
        { text: b('How hard each atom pulls on a shared pair, compared with chlorine', 'Wie stark jedes Atom an einem gemeinsamen Paar zieht, verglichen mit Chlor'), correct: true },
        { text: b('Nothing: both bonds share the pair equally, as covalent bonds do', 'Nichts: Beide teilen das Paar gleichmäßig, wie jede Atombindung'), mis: 'equal-sharing-always' },
      ],
      explain: b('It is a tug of war over the shared pair. How hard an atom pulls on a shared pair of electrons is called its [[electronegativity]], a number on a scale up to 4 (written χ, the Greek letter chi): sodium 0.93, hydrogen 2.20, chlorine 3.16. It reflects both energy columns of the table: how tightly an atom holds its own electrons and how readily it takes on one more. Hydrogen holds its own electron tightly but takes on an extra one only weakly (73 against chlorine\'s 349), so chlorine still out-pulls it and the pair leans towards chlorine. Sodium is weak at both and loses the electron outright. Two chlorine atoms pull equally: an even share.',
        'Es ist ein Tauziehen um das gemeinsame Paar. Wie stark ein Atom an einem gemeinsamen Elektronenpaar zieht, heißt [[electronegativity]], kurz EN, eine Zahl auf einer Skala bis 4 (international χ, das griechische Chi): Natrium 0,93, Wasserstoff 2,20, Chlor 3,16. Sie spiegelt beide Energie-Spalten der Tabelle: wie fest ein Atom seine eigenen Elektronen hält (Ionisierungsenergie) und wie bereitwillig es ein weiteres aufnimmt (Elektronenaffinität). Wasserstoff hält sein Elektron fest, nimmt aber ein zusätzliches nur schwach auf (73 gegenüber 349 beim Chlor), also zieht Chlor trotzdem stärker, und das Paar rückt zum Chlor. Natrium ist bei beidem schwach und verliert das Elektron ganz. Zwei Chloratome ziehen gleich stark: Sie teilen gleichmäßig.'),
    } as ChoiceItem,
    after: b('Next: watch where the shared pair sits, bond by bond.', 'Als Nächstes: Sieh dir an, wo das gemeinsame Paar sitzt, Bindung für Bindung.'),
  },

  explore: {
    title: b('The Charge Field', 'Das Ladungsfeld'),
    intro: b('Each bond here is two atoms and the electrons they share. The dots are the shared pairs; the haze is a map of where a pair is likely to be found, built up dot by dot. The dots are samples, not snapshots of a path. The harder an atom pulls on the pair (its electronegativity), the more the haze leans its way. That end gets a slightly negative partial charge, written δ− (δ, the Greek letter delta, marks just part of a full charge); the other end becomes slightly positive, δ+. Red marks the δ− end and blue the δ+ end, the colours most textbooks use.',
      'Jede Bindung hier besteht aus zwei Atomen und den Elektronen, die sie teilen. Die Punkte sind die gemeinsamen Elektronenpaare; der Schleier ist eine Karte, wo das Elektronenpaar wahrscheinlich anzutreffen ist, Punkt für Punkt aufgebaut. Die Punkte sind Stichproben, keine Momentaufnahmen einer Bahn. Je stärker ein Atom am Paar zieht (seine Elektronegativität, EN), desto mehr neigt sich der Schleier zu ihm. Dieses Ende erhält eine negative Partialladung (Teilladung), geschrieben δ− (δ, das griechische Delta: nur ein Teil einer vollen Elementarladung); das andere Ende erhält eine positive Partialladung, δ+. Rot markiert das δ−-Ende, Blau das δ+-Ende, wie in den meisten Lehrbüchern.'),
    tasks: [
      { id: 'equal', key: true, text: b('Load H–H or Cl–Cl. Where does the shared pair sit?', 'Lade H–H oder Cl–Cl. Wo sitzt das gemeinsame Paar?') },
      { id: 'hcl', key: true, text: b('Load H–Cl. Which end turns red, and how far does the haze lean?', 'Lade H–Cl. Welches Ende wird rot, und wie weit neigt sich der Schleier?') },
      { id: 'bands', key: true, text: b('Find one bond in each band: nonpolar, polar and ionic.', 'Finde je eine Bindung in jedem Bereich: unpolar, polar und ionisch.') },
      { id: 'oil', key: true, text: b('Compare C–H, the bond oils are built from, with O–H, the bond in water.', 'Vergleiche C–H, die Bindung, aus der Öle gebaut sind, mit O–H, der Bindung im Wasser.') },
      { id: 'triple', text: b('Load N≡N and compare its length and bond energy with F–F.', 'Lade N≡N und vergleiche Länge und Bindungsenergie mit F–F.') },
      { id: 'dial', challenge: true, text: b('Use the what-if dial to push H–Cl into the ionic band. How hard would chlorine have to pull?', 'Schieb H–Cl mit dem Was-wäre-wenn-Regler in den ionischen Bereich. Wie stark müsste Chlor ziehen?') },
    ],
    notes: {
      equal: b('Same atoms, same pull: the difference is 0 and the pair sits in the middle. Neither end is δ+ or δ−.', 'Gleiche Atome, gleich starke Anziehung: ΔEN = 0, und das Paar sitzt in der Mitte. Kein Ende ist δ+ oder δ−.'),
      hcl: b('Chlorine (3.16) pulls harder than hydrogen (2.20): the difference is 0.96. The pair leans towards Cl, which turns slightly negative (δ−), and leaves H slightly positive (δ+). It is still shared: by Pauling\'s estimate, H–Cl is only about 21 % of the way to an ionic bond.',
        'Chlor (3,16) zieht stärker als Wasserstoff (2,20): ΔEN = 0,96. Das Paar rückt zum Cl, das eine negative Partialladung erhält (δ−); H erhält eine positive (δ+). Geteilt bleibt es trotzdem: Nach Paulings Abschätzung ist H–Cl nur zu etwa 21 % ionisch.'),
      bands: b('Nonpolar, polar and ionic are stretches of one scale for how a pair is shared. What the substance becomes, a lattice of ions or separate molecules, can still differ sharply (unit 4). The app puts the borders at 0.4 and 1.8; many German textbooks use 0.5 and 1.7. Both are rules of thumb.',
        'Unpolar, polar und ionisch sind Abschnitte einer einzigen Skala dafür, wie ein Paar geteilt wird. Was daraus wird, ein Ionengitter oder einzelne Moleküle, kann sich trotzdem deutlich unterscheiden (Einheit 4). Die App setzt die Grenzen bei 0,4 und 1,8; viele deutsche Schulbücher nehmen 0,5 und 1,7 (auf der Skala als „Schulbuch 1,7“ markiert). Beides sind Faustregeln.'),
      oil: b('C–H: a difference of 0.35, barely lopsided. O–H: 1.24, clearly polar. Oils are mostly C–H and C–C bonds; water is O–H. Unit 11 shows how that keeps them apart.',
        'C–H: ΔEN 0,35, kaum polar. O–H: ΔEN 1,24, deutlich polar. Öle bestehen vor allem aus C–H- und C–C-Bindungen, Wasser aus O–H. Einheit 11 zeigt, warum sie sich deshalb nicht mischen.'),
      triple: b('N≡N: three shared pairs, 110 pm (picometres, trillionths of a metre) and 946 kJ/mol. F–F: one pair, 142 pm, 160 kJ/mol. F–F is unusually weak even for a single bond, so for a fair series compare C–C, C=C and C≡C: 345, 611 and 837 kJ/mol.',
        'N≡N: drei gemeinsame Paare, 110 pm (Pikometer, billionstel Meter) und 946 kJ/mol. F–F: ein Paar, 142 pm, 160 kJ/mol. F–F ist allerdings selbst für eine Einfachbindung ungewöhnlich schwach; fairer ist die Reihe C–C, C=C und C≡C: 345, 611 und 837 kJ/mol.'),
      dial: b('Past about 1.8 the pair spends most of its time on chlorine, and chemists usually call such a bond ionic. The haze keeps leaning gradually: the border is a convention, not a wall. To get there, chlorine would have to pull harder than fluorine, the strongest puller of all. Real H–Cl stays at 0.96; the dial is only a what-if.',
        'Ab etwa 1,7–1,8 hält sich das Paar überwiegend beim Chlor auf, und man nennt die Bindung meist ionisch. Der Schleier neigt sich dabei stufenlos weiter: Die Grenze ist eine Vereinbarung, keine Mauer. Dafür müsste Chlor etwa so stark ziehen wie Fluor, das am stärksten ziehende Element, oder noch stärker. Echtes H–Cl bleibt bei 0,96; der Regler ist nur ein Was-wäre-wenn.'),
    },
    check: {
      id: 'u5-check', unit: 5, kind: 'rank', format: 'rank', evidence: 'predict', concepts: ['u5.en', 'u5.delta-chi'], table: 'chi',
      prompt: b('Rank these bonds by polarity, most polar first.', 'Ordne die Bindungen nach Polarität, die polarste zuerst.'),
      order: [b('O–H', 'O–H'), b('N–H', 'N–H'), b('C–H', 'C–H'), b('H–H', 'H–H')],
      explain: b('Electronegativity differences of 1.24, 0.84, 0.35 and 0. Across period 2 electronegativity rises from carbon to nitrogen to oxygen, so each bond to hydrogen is more polar.',
        'ΔEN = 1,24; 0,84; 0,35 und 0. In der 2. Periode steigt die EN von Kohlenstoff über Stickstoff zu Sauerstoff, also wird jede Bindung zum Wasserstoff polarer.'),
    } as RankItem,
  },

  predictions: [
    {
      item: {
        id: 'u5-cf', unit: 5, kind: 'choice', format: 'predict', withConfidence: true, evidence: 'transfer',
        concepts: ['u5.partial-charges', 'u5.delta-chi'], targets: ['polar-means-ions', 'delta-sign-swapped', 'equal-sharing-always'],
        prompt: b('Carbon (electronegativity 2.55) bonds to fluorine (3.98), as in the coating of a non-stick pan. What kind of bond is C–F?', 'Kohlenstoff (EN 2,55) bindet an Fluor (EN 3,98), wie in der Beschichtung einer Antihaftpfanne. Was für eine Bindung ist C–F?'),
        options: [
          { text: b('Ionic: fluorine takes the electron, giving C⁺ and F⁻', 'Ionisch: Fluor nimmt das Elektron, es entstehen C⁺ und F⁻'), mis: 'polar-means-ions' },
          { text: b('Polar covalent: shared, with F δ− and C δ+', 'Polare Atombindung: geteilt, F δ− und C δ+'), correct: true },
          { text: b('Polar covalent: shared, with C δ− and F δ+', 'Polare Atombindung: geteilt, C δ− und F δ+'), mis: 'delta-sign-swapped' },
          { text: b('Nonpolar: two non-metals share equally', 'Unpolar: Zwei Nichtmetalle teilen gleichmäßig'), mis: 'equal-sharing-always' },
        ],
        explain: b('The difference is 3.98 − 2.55 = 1.43, inside the polar band. The pair is shared, but it leans towards fluorine: F is slightly negative (δ−), C slightly positive (δ+).',
          'ΔEN = 3,98 − 2,55 = 1,43, im polaren Bereich (auch nach der Schulbuchgrenze 1,7). Das Paar wird geteilt, rückt aber zum Fluor: F ist leicht negativ (δ−), C leicht positiv (δ+).'),
      } as ChoiceItem,
      show: { engine: 'bond', a: 'C', b: 'F' },
      revealText: b('The pair spends most of its time near fluorine. By Pauling\'s estimate C–F is about 40 % of the way to ionic: strongly lopsided, but still shared, so there are no ions. It is also one of the strongest single bonds carbon makes: about 440–490 kJ/mol depending on the molecule (the Charge Field shows a table average, 439), against about 415 for C–H. That is part of why the coating survives a hot pan.',
        'Das Paar hält sich meist beim Fluor auf. Nach Paulings Abschätzung ist C–F zu etwa 40 % ionisch: stark polar, aber noch geteilt, also keine Ionen. Außerdem ist es eine der stärksten Einfachbindungen des Kohlenstoffs: je nach Molekül etwa 440–490 kJ/mol (das Ladungsfeld zeigt einen Tabellenmittelwert, 439), gegenüber etwa 415 für C–H. Auch deshalb übersteht die Beschichtung eine heiße Pfanne.'),
      extra: {
        title: b('Subtract, then look at who pulls harder', 'Abziehen, dann schauen, wer stärker zieht'),
        steps: [
          b('Look up how hard each atom pulls (its electronegativity): carbon 2.55, fluorine 3.98.', 'Schlag nach, wie stark jedes Atom zieht (seine EN): Kohlenstoff 2,55, Fluor 3,98.'),
          b('Subtract: 3.98 − 2.55 = 1.43.', 'Zieh ab: ΔEN = 3,98 − 2,55 = 1,43.'),
          b('1.43 lies between 0.4 and 1.8: the pair is shared, but unevenly. That is a polar bond, not an ionic one.', '1,43 liegt zwischen 0,5 und 1,7 (die App: 0,4 und 1,8): Das Paar wird geteilt, aber ungleich. Das ist eine polare Bindung, keine ionische.'),
          b('The pair leans towards the atom that pulls harder. Fluorine gets the slightly negative end, δ−; carbon is left slightly positive, δ+.', 'Das Paar rückt zum Atom, das stärker zieht. Fluor erhält die negative Partialladung, δ−, Kohlenstoff die positive, δ+.'),
        ],
      },
    },
    {
      item: {
        id: 'u5-o2', unit: 5, kind: 'choice', format: 'predict', withConfidence: true, evidence: 'transfer',
        concepts: ['u5.bond-count', 'u5.multiple-bonds'], targets: ['bonds-equal-outer-electrons'],
        prompt: b('Oxygen has six outer electrons. Atoms like oxygen usually bond so that each counts eight outer electrons around itself, an octet (the octet rule). In {{O2}}, how many electron pairs do the two atoms share?', 'Sauerstoff hat sechs Außenelektronen. Atome wie Sauerstoff binden meist so, dass jedes Atom acht Außenelektronen hat, ein Elektronenoktett (Oktettregel). Wie viele Elektronenpaare teilen die zwei Atome in {{O2}}?'),
        options: [
          { text: b('One', 'Eines') },
          { text: b('Two', 'Zwei'), correct: true },
          { text: b('Three', 'Drei') },
          { text: b('Six, one for each outer electron', 'Sechs, eines pro Außenelektron'), mis: 'bonds-equal-outer-electrons' },
        ],
        explain: b('A shared pair holds one electron from each atom, so it adds just one to each atom\'s count: two shared pairs take each oxygen from six to eight. That is a [[double-bond]], O=O.',
          'Ein gemeinsames Paar enthält je ein Elektron von jedem Atom, es zählt also bei jedem Atom nur eines dazu: Zwei gemeinsame Paare bringen jedes Sauerstoffatom von sechs auf acht Außenelektronen. Das ist eine [[double-bond]], O=O.'),
      } as ChoiceItem,
      show: { engine: 'bond', a: 'O', b: 'O', order: 2 },
      revealText: b('Each oxygen now counts eight: its two shared pairs plus two lone pairs. For small atoms like oxygen this octet is usually the lowest-energy way to bond, which is why the octet rule works. The double bond is shorter and stronger (121 pm, 498 kJ/mol) than an O–O single bond (about 148 pm and 140 kJ/mol, as in peroxides). One thing this simple picture cannot explain: liquid oxygen is pulled towards a magnet. A more detailed model (beyond this course) keeps the double bond and explains the magnetism too.',
        'Jedes Sauerstoffatom hat jetzt acht Außenelektronen: zwei gemeinsame Paare plus zwei freie Elektronenpaare. Für kleine Atome wie Sauerstoff ist dieses Elektronenoktett meist die energieärmste Art zu binden; deshalb funktioniert die Oktettregel. Die Doppelbindung ist kürzer und stärker (121 pm, 498 kJ/mol) als eine O–O-Einfachbindung (etwa 148 pm und 140 kJ/mol, wie in Peroxiden). Eines erklärt dieses einfache Bild nicht: Flüssiger Sauerstoff wird von einem Magneten angezogen. Ein genaueres Modell (über diesen Kurs hinaus) behält die Doppelbindung und erklärt auch den Magnetismus.'),
      extra: {
        title: b('Count to eight, one shared pair at a time', 'Bis acht zählen, ein gemeinsames Paar nach dem anderen'),
        steps: [
          b('Each oxygen brings six outer electrons. The octet rule: share pairs until each atom counts eight around it.', 'Jedes Sauerstoffatom bringt sechs Außenelektronen mit. Die Oktettregel: Gemeinsame Paare bilden, bis jedes Atom acht Außenelektronen hat.'),
          b('Share one pair: one of its two electrons was the oxygen\'s own already, so each oxygen now counts seven, not yet eight.', 'Ein Paar teilen: Eines der zwei Elektronen gehörte dem Sauerstoff schon, also kommt jedes Sauerstoffatom jetzt auf sieben, noch nicht auf acht.'),
          b('Share a second pair: each counts eight, two shared pairs plus two lone pairs.', 'Ein zweites Paar teilen: Jedes kommt auf acht, zwei gemeinsame Paare plus zwei freie Elektronenpaare.'),
          b('Two shared pairs between the same two atoms make a double bond: O=O.', 'Zwei gemeinsame Paare zwischen denselben zwei Atomen ergeben eine Doppelbindung: O=O.'),
        ],
      },
    },
  ],

  examples: [
    {
      title: b('Water\'s O–H bond', 'Die O–H-Bindung im Wasser'), tag: 'O–H', show: { engine: 'bond', a: 'O', b: 'H' },
      numbers: [{ v: '1.24', label: b('electronegativity difference', 'EN-Differenz (ΔEN)') }, { v: '32 %', label: b('ionic character (Pauling\'s estimate)', 'Ionencharakter (nach Pauling)') }, { v: '464 kJ/mol', label: b('to break one mole of O–H bonds', 'zum Spalten von einem Mol O–H-Bindungen') }],
      body: b('Oxygen (3.44) pulls the shared pair much harder than hydrogen (2.20). Each O–H bond is polar: oxygen carries δ−, each hydrogen δ+. In a water molecule the two bonds add up to a negative oxygen end and a positive hydrogen end (unit 6).',
        'Sauerstoff (EN 3,44) zieht viel stärker am gemeinsamen Paar als Wasserstoff (EN 2,20). Jede O–H-Bindung ist polar: Sauerstoff trägt δ−, jeder Wasserstoff δ+. Im Wassermolekül ergeben die zwei Bindungen zusammen ein negatives Sauerstoff-Ende und ein positives Wasserstoff-Ende (Einheit 6).'),
      soWhat: b('Water molecules cling to each other by those ends. Oil is mostly C–H and C–C bonds (differences of 0.35 and 0) and has almost no such ends to offer, so the water molecules stay with each other and the oil ends up in its own layer. Unit 11 has the details.',
        'Wassermoleküle halten sich an diesen Enden aneinander fest. Öl besteht vor allem aus C–H- und C–C-Bindungen (ΔEN 0,35 und 0) und hat kaum solche Enden zu bieten, also bleiben die Wassermoleküle unter sich, und das Öl landet in einer eigenen Schicht. Einheit 11 zeigt die Einzelheiten.'),
    },
    {
      title: b('Nitrogen\'s triple bond', 'Die Dreifachbindung des Stickstoffs'), tag: 'N≡N', show: { engine: 'bond', a: 'N', b: 'N', order: 3 },
      numbers: [{ v: '3', label: b('shared pairs', 'gemeinsame Paare') }, { v: '110 pm', label: b('between the nuclei', 'Kernabstand') }, { v: '946 kJ/mol', label: b('to break one mole of N≡N bonds', 'zum Spalten von einem Mol N≡N-Bindungen') }],
      body: b('Nitrogen has five outer electrons. Sharing three pairs lets each nitrogen atom count eight, an octet, the arrangement that is usually lowest in energy for small atoms: a triple bond. Three pairs pull the nuclei close and take a lot of energy to break. Carbon shows the same pattern: C–C 345, C=C 611, C≡C 837 kJ/mol.',
        'Stickstoff hat fünf Außenelektronen. Mit drei gemeinsamen Paaren hat jedes Stickstoffatom acht Außenelektronen, ein Elektronenoktett (Oktettregel), für kleine Atome meist die energieärmste Anordnung: eine Dreifachbindung. Drei Paare ziehen die Kerne eng zusammen, und es kostet viel Energie, sie zu trennen. Kohlenstoff zeigt dasselbe Muster: C–C 345, C=C 611, C≡C 837 kJ/mol.'),
      soWhat: b('That bond is why the nitrogen that makes up 78 % of the air hardly reacts. To turn it into ammonia for fertiliser, the Haber–Bosch process needs a catalyst, high pressure and temperatures around 450 °C.',
        'Diese Bindung ist der Grund, warum der Stickstoff, der 78 % der Luft ausmacht, kaum reagiert. Um daraus Ammoniak für Dünger zu machen, braucht das Haber-Bosch-Verfahren einen Katalysator, hohen Druck und Temperaturen um 450 °C.'),
    },
    {
      title: b('Hydrogen fluoride, on the border', 'Fluorwasserstoff, an der Grenze'), tag: 'H–F', show: { engine: 'bond', a: 'H', b: 'F' },
      numbers: [{ v: '1.78', label: b('electronegativity difference', 'EN-Differenz (ΔEN)') }, { v: '55 %', label: b('ionic by Pauling\'s formula', 'ionisch nach Paulings Formel') }, { v: '41 %', label: b('ionic from measurement', 'ionisch nach Messung') }],
      body: b('The borders between bond types are rules of thumb, and hydrogen fluoride sits right on one. Its difference, 1.78, is just under the app\'s 1.8 border. Pauling\'s formula calls it 55 % ionic; measuring its dipole moment (how strongly the ends are charged, times their distance) gives about 41 %. Yet HF is made of separate molecules and boils at 20 °C, nothing like a salt.',
        'Die Grenzen zwischen den Bindungsarten sind Faustregeln, und Fluorwasserstoff sitzt genau auf einer. Seine ΔEN von 1,78 liegt in der App knapp unter der Grenze 1,8 und gilt dort als polar; nach der Schulbuchregel „ab 1,7 ionisch“ wäre H–F schon eine Ionenbindung. Nach Paulings Formel ist es zu 55 % ionisch; misst man sein Dipolmoment (Ladung der Enden mal Abstand), ergeben sich etwa 41 %. Trotzdem besteht HF aus einzelnen Molekülen und siedet bei 20 °C, ganz anders als ein Salz.'),
      soWhat: b('Other books put the ionic border at 1.7 or 2.0. In an exam, use the border your course uses and add that it is a rule of thumb: HF is the classic case of a very polar molecule right at the border.',
        'Andere Bücher legen die ionische Grenze bei 1,7 oder 2,0. In der Klausur nimmst du die Grenze aus deinem Unterricht; bei H–F lohnt sich der Satz „nach der Faustregel ionisch, tatsächlich ein stark polares Molekül“.'),
    },
  ],

  flaw: {
    id: 'u5-flaw', unit: 5, kind: 'flaw', format: 'flaw', evidence: 'transfer', concepts: ['u5.partial-charges', 'u5.delta-chi'], targets: ['polar-means-ions'],
    prompt: b('Where does this reasoning first go wrong?', 'Wo geht diese Überlegung zum ersten Mal schief?'),
    lines: [
      b('In H–Cl, chlorine (electronegativity 3.16) pulls harder on the shared pair than hydrogen (2.20).', 'In H–Cl zieht Chlor (EN 3,16) stärker am gemeinsamen Paar als Wasserstoff (EN 2,20).'),
      b('So the shared pair spends more of its time near the chlorine atom.', 'Also hält sich das gemeinsame Paar mehr in der Nähe des Chloratoms auf.'),
      b('That leaves the chlorine end slightly negative (δ−) and the hydrogen end slightly positive (δ+).', 'Dadurch wird das Chlor-Ende leicht negativ (δ−) und das Wasserstoff-Ende leicht positiv (δ+).'),
      b('So hydrogen chloride is made of H⁺ and Cl⁻ ions, just as salt is made of Na⁺ and Cl⁻.', 'Also besteht Chlorwasserstoff aus H⁺- und Cl⁻-Ionen, so wie Kochsalz aus Na⁺ und Cl⁻.'),
    ],
    flaw: 3,
    near: [{ step: 2, note: b('Step 3 is true: the ends really are charged, but only slightly. The slip is the last step, which turns "slightly charged" into "ions".', 'Schritt 3 stimmt: Die Enden sind wirklich geladen, aber nur ein bisschen. Der Fehler steckt im letzten Schritt, der aus „leicht geladen“ „Ionen“ macht.') }],
    explain: b('Only step 4 is wrong. Step 1 is true: chlorine pulls harder. Step 2 is true: the pair leans its way. Step 3 is true: the ends become slightly negative and slightly positive. But slightly charged is not ions: with a difference of 0.96 the pair is still shared, HCl is a gas of molecules, and pure HCl does not conduct electricity. (Dissolved in water, HCl does form ions; that is the water\'s doing, as unit 26 shows.)',
      'Nur Schritt 4 ist falsch. Schritt 1 stimmt: Chlor zieht stärker. Schritt 2 stimmt: Das Paar rückt zu ihm. Schritt 3 stimmt: Die Enden werden leicht negativ und leicht positiv. Aber leicht geladen ist nicht dasselbe wie Ionen: Bei ΔEN = 0,96 wird das Paar noch geteilt, HCl ist ein Gas aus Molekülen, und reines HCl leitet keinen Strom. (In Wasser gelöst bildet HCl tatsächlich Ionen; das bewirkt das Wasser, wie Einheit 26 zeigt.)'),
  } as FlawItem,

  deeper: {
    id: 'u5-deeper', unit: 5, kind: 'estimate', format: 'estimate', evidence: 'transfer', concepts: ['u5.partial-charges'],
    prompt: b('If hydrogen handed its electron to chlorine completely, H–Cl would have a dipole moment of 6.1 D (debye, the unit of dipole moment: the charge on each end times the distance between them): one full charge across 127 pm. The measured dipole moment is 1.11 D. Estimate how ionic the H–Cl bond is, in percent.',
      'Gäbe Wasserstoff sein Elektron ganz an Chlor ab, hätte H–Cl ein Dipolmoment von 6,1 D (Debye, die Einheit des Dipolmoments: Ladung an jedem Ende mal Abstand dazwischen): eine volle Ladung über 127 pm. Gemessen sind 1,11 D. Schätze, zu wie viel Prozent die H–Cl-Bindung ionisch ist.'),
    min: 0, max: 100, step: 1, answer: 18, tolerance: 2, suffix: ' %',
    near: [{ value: 21, tol: 1, note: b('21 % is what Pauling\'s formula gives from the electronegativity difference. The dipole-moment method gives a little less; both say the pair is mostly shared.', '21 % liefert Paulings Formel aus der ΔEN. Die Rechnung über das Dipolmoment ergibt etwas weniger; beide sagen: Das Paar wird überwiegend geteilt.') }],
    explain: b('1.11 ÷ 6.1 ≈ 0.18: about 18 % ionic. The pair is mostly shared and leans towards chlorine. Pauling\'s formula gives 21 %; both estimates make H–Cl a polar covalent bond, far from a salt.',
      '1,11 ÷ 6,1 ≈ 0,18: etwa 18 % ionisch. Das Paar wird überwiegend geteilt und rückt zum Chlor. Paulings Formel ergibt 21 %; nach beiden Abschätzungen ist H–Cl eine polare Atombindung, weit weg von einem Salz.'),
  } as EstimateItem,

  explain: {
    prompt: b('In your own words: what holds two atoms together in a covalent bond, and what decides whether the bond is polar?', 'In eigenen Worten: Was hält zwei Atome in einer Atombindung zusammen, und was entscheidet, ob die Bindung polar ist?'),
    ideas: [
      { id: 'share', concept: 'u5.sharing', idea: b('Two atoms share a pair of electrons that both nuclei attract', 'Zwei Atome teilen sich ein Elektronenpaar, das beide Kerne anziehen'),
        // The distinguishing part: both atoms (nuclei) hold on to the same pair. "They share a pair" alone does not pass.
        en: /(\bboth (of them|of the nuclei|of the atoms|the nuclei|the atoms|nuclei|atoms?|ends|sides)?.{0,15}\b(pull|attract|hold|hang|tug|grab|grip|cling|drawn)|attracted (by|to) both|(pull|attract|hold)(s|ed)? by both|held by both|(shared )?(pair|electrons?) (holds?|keeps?|binds?|glues?) (the |both |two )*atoms together|nuclei (both )?(attract|pull on|hold|are attracted)|each nucleus (attracts|pulls|holds))/,
        de: /(beide (kerne|atome|atomkerne)\b.{0,40}(zieh|anzieh|halt|hält|festhalt|hängen)|von beiden (kernen|atomkernen|atomen) (angezogen|festgehalten|gehalten)|(paar|elektronen(paar)?) (hält|halten|bindet|verbindet) (die |beide |zwei )*atome|jeder kern (zieht|hält))/ },
      { id: 'count', concept: 'u5.bond-count', idea: b('Each atom shares enough pairs to count eight outer electrons, the octet rule (hydrogen: two)', 'Jedes Atom bildet so viele gemeinsame Elektronenpaare, dass es acht Außenelektronen hat, nach der Oktettregel (Wasserstoff: zwei)'),
        // The distinguishing part: the number of shared pairs follows the missing electrons, or the octet is tied to
        // the bonding in the same clause. "Has an octet" alone does not pass.
        contra: BONDS_AS_OUTER,
        en: new RegExp(`(as many (shared )?(electron )?(pairs|bonds) as|enough (shared )?(pairs|bonds)|how many (shared )?(pairs|bonds)|number of (shared )?(pairs|bonds)|one (shared )?(pair|bond) for (each|every) (missing )?electron|(shares?|forms?|makes?|needs?) (one|two|three|four|\\d) (shared )?(pairs?|bonds?)|(shares?|forms?) (two|three|four|\\d)\\b|(pairs?|bonds?)\\b.{0,40}(missing|lacks?|short of)|(missing|lacks?|short of)\\b.{0,40}(pairs?|bonds?)|${together(OCTET_EN, BONDING_EN)})`),
        de: new RegExp(`(so viele (gemeinsame )?(elektronen)?(paar)?(paare|bindungen)|genug (gemeinsame )?(elektronen)?(paar)?(paare|bindungen)|wie viele (gemeinsame )?(elektronen)?(paar)?(paare|bindungen)|(an)?zahl der (elektronen)?(paar)?(bindungen|paare)|(teilt|bildet|braucht|teilen|bilden|brauchen|geht|gehen) (ein|eine|zwei|drei|vier|\\d) (gemeinsame )?(elektronen)?(paar)?(paare?|bindungen?)|(bindungen|paare)\\b.{0,40}(fehl|braucht)|(fehl\\w*|braucht)\\b.{0,40}(bindungen|paare)|${together(OCTET_DE, BONDING_DE)})`) },
      { id: 'pull', concept: 'u5.en', idea: b('Electronegativity: how hard an atom pulls on the shared pair', 'Elektronegativität: wie stark ein Atom am gemeinsamen Paar zieht'), contra: EQUAL_SHARING,
        en: /(electronegativ|\ben\b|χ|\bchi\b|pull(s|ing)? (harder|more|stronger|on|at|the)|tug|attract(s|ion)? (the )?(shared|bonding|electrons|pair)|grip|greed)/,
        de: /(elektronegativ|\ben\b|χ|zieht|ziehen|anzieh|zerr|stärker an)/ },
      { id: 'delta', concept: 'u5.partial-charges', idea: b('Uneven sharing makes the harder-pulling atom slightly negative (δ−) and the other slightly positive (δ+)', 'Ungleiches Teilen macht das stärker ziehende Atom leicht negativ (δ−) und das andere leicht positiv (δ+)'), contra: EQUAL_SHARING,
        en: /(δ ?[-+]|δ ?(plus|minus)|delta ?(plus|minus|\+|-)|partial(ly)? (charges?|negative|positive)|slightly (negative|positive|charged)|(negative|positive) end|a (bit|little) (negative|positive))/,
        de: /(δ ?[-+]|delta ?(plus|minus)|partialladung|teilladung|teilweise (negativ|positiv|geladen)|leicht (negativ|positiv)|schwach (negativ|positiv)|ein bisschen (negativ|positiv)|negative[ns]? ende|positive[ns]? ende)/ },
      { id: 'bands', concept: 'u5.delta-chi', idea: b('The difference in electronegativity is a good guide to the bond type: nonpolar, polar or, beyond about 1.8, ionic', 'Der Unterschied ΔEN ist ein guter Anhaltspunkt für die Bindungsart: unpolar, polar oder, ab etwa 1,7–1,8, ionisch'), contra: EQUAL_SHARING,
        en: /(((δχ|δ ?en\b|delta ?chi\b|difference|\bgap\b).{0,60}(polar|ionic|bond|shar|transfer|handed|decid|determin|classif|\bsets?\b))|((polar|ionic|nonpolar|bond type).{0,60}(difference|δχ|delta ?chi))|(bigger|larger|greater|smaller|small|big|large) (the )?(difference|δχ|gap)|(above|over|beyond|past|>) ?(about )?1\.[5-9]\d?.{0,20}ionic)/,
        de: /(((δχ|δ ?en\b|delta ?en\b|unterschied|differenz).{0,60}(polar|ionisch|unpolar|bindung|teil|übertrag|abgegeben|ionen|entscheid|bestimm))|((polar|ionisch|unpolar|bindungsart).{0,60}(unterschied|differenz|δχ|δ ?en\b))|(größer|kleiner|groß|klein)e?[rn]? (der |die )?(unterschied|differenz|δχ|δ ?en\b|en-differenz)|(ab|über|>) ?(einer? |einem )?(δ ?en |en-differenz )?(von )?(etwa )?1[,.][5-9]\d?.{0,20}(ionisch|ionen))/ },
    ] as Idea[],
    tightened: b('In a covalent bond two atoms share a pair of electrons, and both nuclei attract that pair, which holds them together. Each atom shares enough pairs to count eight outer electrons, an octet (hydrogen: two): the octet rule, since that arrangement is usually lowest in energy. How hard an atom pulls on a shared pair is its electronegativity. If one pulls harder, the pair leans its way: that end gets a slightly negative partial charge (δ−) and the other a slightly positive one (δ+). The difference in electronegativity is a good guide to the bond type: a tiny difference (below about 0.4) gives a nonpolar bond, a medium one a polar bond, and beyond about 1.8 the pair sits mostly on one atom, so the bond is usually called ionic. The borders are rules of thumb.',
      'In einer Atombindung teilen sich zwei Atome ein Elektronenpaar, und beide Kerne ziehen dieses Paar an; das hält sie zusammen. Jedes Atom bildet so viele gemeinsame Elektronenpaare, dass es acht Außenelektronen hat (Wasserstoff: zwei): Das ist die Oktettregel, denn diese Anordnung ist meist am energieärmsten. Wie stark ein Atom an einem gemeinsamen Paar zieht, gibt seine Elektronegativität (EN) an. Zieht eines stärker, rückt das Paar zu ihm: Dieses Ende erhält eine negative Partialladung (δ−), das andere eine positive (δ+). Der Unterschied ΔEN ist ein guter Anhaltspunkt für die Bindungsart: unter etwa 0,4–0,5 unpolar, darüber polar, und ab etwa 1,7–1,8 sitzt das Paar überwiegend an einem Atom, sodass man die Bindung meist ionisch nennt. Die Grenzen sind Faustregeln.'),
  },

  terms: ['covalent-bond', 'electronegativity', 'polar-bond', 'partial-charge', 'double-bond', 'bond-energy'],

  readings: [
    {
      lang: 'en', kind: 'quick',
      title: b('Electronegativity', 'Electronegativity'), source: 'chemguide',
      url: 'https://www.chemguide.co.uk/atoms/bonding/electroneg.html',
      lookFor: [
        b('The values it gives fluorine and caesium, 4.0 and 0.7. These are Pauling\'s original values; the app uses the revised ones, 3.98 and 0.79. The same scale, newer data.', ''),
        b('Which end of the H–Cl bond gets the δ− (the slightly negative end). Does it match the red end in the Charge Field?', ''),
        b('What it says about the border between covalent and ionic bonds. Compare it with hydrogen fluoride in this unit.', ''),
      ],
    },
    {
      lang: 'en', kind: 'deeper',
      title: b('Covalent Bonding', 'Covalent Bonding'), source: 'OpenStax Chemistry 2e, section 7.2',
      url: 'https://openstax.org/books/chemistry-2e/pages/7-2-covalent-bonding',
      lookFor: [
        b('Its table of electronegativity differences. Which bands does it give, and does it call them laws or a guide?', ''),
        b('The difference it gives for HF (1.9). Why is it not the app\'s 1.78? Look at the values it uses for H and F.', ''),
        b('The energy it gives for breaking the H–H bond. Find the same number in the Charge Field.', ''),
      ],
    },
    {
      lang: 'de', kind: 'quick',
      title: b('Elektronegativität', 'Elektronegativität'), source: 'Studyflix',
      url: 'https://studyflix.de/chemie-schueler/elektronegativitat-1569',
      lookFor: [
        b('', 'Die Grenzen für unpolar, polar und ionisch. Der Artikel nimmt 0,5 und 1,7, die App 0,4 und 1,8. Welche Grenze gilt in deinem Unterricht, und was bedeutet das für H–F (ΔEN 1,78)?'),
        b('', 'Die Rechnung für HCl (ΔEN = 0,96). Stimmt sie mit dem Wert in der App überein?'),
        b('', 'Wie sich die EN im Periodensystem ändert. Passt das zu Fluor, Chlor, Brom und Iod aus den Aufgaben?'),
      ],
    },
  ],

  misconceptions: [
    { id: 'equal-sharing-always', name: b('Covalent bonds always share electrons equally', 'Atombindungen teilen die Elektronen immer gleichmäßig') },
    { id: 'polar-means-ions', name: b('A polar bond means full charges, as in ions', 'Polare Bindung bedeutet volle Ladungen wie bei Ionen') },
    { id: 'delta-sign-swapped', name: b('δ− put on the atom that pulls less', 'δ− beim Atom, das schwächer zieht') },
    { id: 'en-bigger-atom', name: b('Bigger atoms with more electrons pull harder on shared electrons', 'Größere Atome mit mehr Elektronen ziehen stärker an gemeinsamen Elektronen') },
    { id: 'bonds-equal-outer-electrons', name: b('An atom forms as many bonds as it has outer electrons', 'Ein Atom bildet so viele Bindungen, wie es Außenelektronen hat') },
    { id: 'double-bond-weaker', name: b('Double bonds are weaker than single bonds', 'Doppelbindungen sind schwächer als Einfachbindungen') },
    { id: 'bond-type-by-rule', name: b('Bond type as a sharp rule (one exact border, or metal + non-metal = ionic)', 'Bindungsart als starre Regel (eine exakte Grenze, oder Metall + Nichtmetall = ionisch)') },
  ],

  glossary: {
    'covalent-bond': {
      en: 'covalent bond', de: 'Atombindung', unit: 5,
      def: { en: 'Two atoms held together by a shared pair of electrons that both nuclei attract.', de: 'Zwei Atome, die ein gemeinsames Elektronenpaar zusammenhält, das beide Kerne anziehen.' },
      falseFriend: { en: 'German school books also say "Elektronenpaarbindung" or "kovalente Bindung"; all three mean the same.', de: 'Gleichbedeutend sind Elektronenpaarbindung und kovalente Bindung; englisch „covalent bond“.' },
    },
    'partial-charge': {
      en: 'partial charge', de: 'Partialladung', unit: 5,
      def: { en: 'A small part of a charge, written δ+ (slightly positive) or δ− (slightly negative), on atoms whose shared pair sits closer to one of them.', de: 'Ein kleiner Teil einer Ladung, geschrieben δ+ (leicht positiv) oder δ− (leicht negativ), an Atomen, deren gemeinsames Paar näher an einem von ihnen liegt.' },
      falseFriend: { en: 'German also says "Teilladung". δ is the small Greek delta.', de: 'Auch „Teilladung“. δ ist das kleine griechische Delta.' },
    },
    'double-bond': {
      en: 'double bond', de: 'Doppelbindung', unit: 5,
      def: { en: 'Two shared electron pairs between the same two atoms, as in O=O. A triple bond has three, as in N≡N.', de: 'Zwei gemeinsame Elektronenpaare zwischen denselben zwei Atomen, wie in O=O. Eine Dreifachbindung hat drei, wie in N≡N.' },
    },
    'bond-energy': {
      en: 'bond energy', de: 'Bindungsenergie', unit: 5,
      def: { en: 'The energy needed to break a bond, in kJ per mole of bonds. Tables give averages over many molecules.', de: 'Die Energie, die nötig ist, um eine Bindung zu spalten, in kJ pro Mol Bindungen. Tabellen geben Mittelwerte über viele Moleküle an.' },
    },
  },
};
