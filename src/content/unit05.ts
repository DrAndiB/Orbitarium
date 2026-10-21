// Unit 5 — Covalent bonds and electronegativity, on the Charge Field.
// Data: electronegativities (Pauling) from the elements table; bond lengths and energies from bonds.ts
// (OpenStax Chemistry 2e, Table 7.2); C–F 439 kJ/mol and C≡O 1080 kJ/mol / 113 pm also from OpenStax 2e,
// Tables 7.2 and 7.3. Ionic character: Pauling's estimate 1 − e^(−Δχ²/4) (bonds.ts). Dipole moments (CRC
// Handbook): HCl 1.11 D, HF 1.83 D. Boiling points: HCl −85 °C, Cl₂ −34 °C, HF 20 °C. First ionization
// energies: atoms.ts (Na 496, H 1312, Cl 1251 kJ/mol).
import type { Bi } from '../i18n';
import type { ChoiceItem, RankItem, FlawItem, EstimateItem } from './items';
import type { Idea } from './unit06';
import type { UnitContent } from './unitTypes';

const b = (en: string, de: string): Bi => ({ en, de });

// The unit's main misconception: covalent bonds always share equally. A clause that says so (without a
// qualifier such as "nonpolar", "same atoms", "only" or a negation) rules out the ideas it contradicts.
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
    lead: b('Sodium and hydrogen each have one outer electron, and both combine with chlorine. The results could hardly be more different.',
      'Natrium und Wasserstoff haben je ein Außenelektron, und beide verbinden sich mit Chlor. Die Ergebnisse könnten kaum verschiedener sein.'),
    data: {
      caption: b('Chlorine and three partners', 'Chlor und drei Partner'),
      head: [b('Substance', 'Stoff'), b('Chlorine\'s partner', 'Partner des Chlors'), b('Energy to remove the partner\'s outer electron (kJ/mol)', 'Energie, um das Außenelektron des Partners abzulösen (kJ/mol)'), b('At room temperature', 'Bei Raumtemperatur')],
      rows: [
        { cells: ['{{NaCl}}', b('sodium', 'Natrium'), '496', b('solid, melts at 801 °C', 'fest, schmilzt bei 801 °C')] },
        { cells: ['{{HCl}}', b('hydrogen', 'Wasserstoff'), '1312', b('gas, boils at −85 °C', 'Gas, siedet bei −85 °C')], mystery: true },
        { cells: ['{{Cl2}}', b('chlorine', 'Chlor'), '1251', b('gas, boils at −34 °C', 'Gas, siedet bei −34 °C')] },
      ],
      numeric: [2],
    },
    clash: b('Chlorine takes sodium\'s electron outright: salt is a solid lattice of Na⁺ and Cl⁻ ions. Hydrogen\'s electron it only shares: hydrogen chloride is a gas of small HCl molecules. Both partners brought one electron. What decides how far chlorine gets with it?',
      'Dem Natrium nimmt Chlor das Elektron ganz ab: Kochsalz ist ein festes Gitter aus Na⁺- und Cl⁻-Ionen. Mit dem Wasserstoff teilt es das Elektron nur: Chlorwasserstoff ist ein Gas aus kleinen HCl-Molekülen. Beide Partner brachten ein Elektron mit. Was entscheidet, wie weit Chlor damit kommt?'),
    question: {
      id: 'u5-puzzle', unit: 5, kind: 'choice', format: 'predict', withConfidence: true, evidence: 'predict',
      concepts: ['u5.en', 'u5.sharing'], targets: ['equal-sharing-always'],
      prompt: b('Your best guess:', 'Deine beste Vermutung:'),
      options: [
        { text: b('Hydrogen is a gas, and gases cannot form ions', 'Wasserstoff ist ein Gas, und Gase bilden keine Ionen') },
        { text: b('How tightly the partner holds on to its own electron', 'Wie fest der Partner sein eigenes Elektron hält'), correct: true },
        { text: b('Nothing: both bonds share the pair equally, as covalent bonds do', 'Nichts: Beide teilen das Paar gleichmäßig, wie jede Atombindung'), mis: 'equal-sharing-always' },
        { text: b('Salt is a solid, so its atoms are simply packed closer', 'Salz ist fest, seine Atome liegen einfach dichter') },
      ],
      explain: b('Hydrogen holds its electron far more tightly than sodium: 1312 against 496 kJ/mol to remove it. Chlorine can pull the shared pair towards itself but not tear it away, so H–Cl stays a shared, lopsided pair. How hard an atom pulls on a shared pair has a name, [[electronegativity]] (χ): sodium 0.93, hydrogen 2.20, chlorine 3.16.',
        'Wasserstoff hält sein Elektron viel fester als Natrium: 1312 gegenüber 496 kJ/mol, um es abzulösen. Chlor kann das gemeinsame Paar zu sich ziehen, aber nicht abreißen, also bleibt H–Cl ein geteiltes, schiefes Paar. Wie stark ein Atom an einem gemeinsamen Paar zieht, heißt [[electronegativity]] (χ, in der Schule oft EN): Natrium 0,93, Wasserstoff 2,20, Chlor 3,16.'),
    } as ChoiceItem,
    after: b('Next: watch where the shared pair sits, bond by bond.', 'Als Nächstes: Sieh dir an, wo das gemeinsame Paar sitzt, Bindung für Bindung.'),
  },

  explore: {
    title: b('The Charge Field', 'Das Ladungsfeld'),
    intro: b('Each bond here is two atoms and the electrons they share. The dots are the shared pairs; the haze is a long exposure of where a pair spends its time. The harder an atom pulls, the more the haze leans its way. Red marks the δ− end and blue the δ+ end, the colours of textbook potential maps.',
      'Jede Bindung hier besteht aus zwei Atomen und den Elektronen, die sie teilen. Die Punkte sind die gemeinsamen Paare, der Schleier ist eine Langzeitbelichtung, wo sich ein Paar aufhält. Je stärker ein Atom zieht, desto mehr neigt sich der Schleier zu ihm. Rot markiert das δ−-Ende, Blau das δ+-Ende, wie in den Potentialkarten im Lehrbuch.'),
    tasks: [
      { id: 'equal', key: true, text: b('Load H–H or Cl–Cl. Where does the shared pair sit?', 'Lade H–H oder Cl–Cl. Wo sitzt das gemeinsame Paar?') },
      { id: 'hcl', key: true, text: b('Load H–Cl. Which end turns red, and how far does the haze lean?', 'Lade H–Cl. Welches Ende wird rot, und wie weit neigt sich der Schleier?') },
      { id: 'bands', key: true, text: b('Find one bond in each band: nonpolar, polar and ionic.', 'Finde je eine Bindung in jedem Bereich: unpolar, polar und ionisch.') },
      { id: 'oil', key: true, text: b('Compare C–H, the bond oils are built from, with O–H, the bond in water.', 'Vergleiche C–H, die Bindung, aus der Öle gebaut sind, mit O–H, der Bindung im Wasser.') },
      { id: 'triple', text: b('Load N≡N and compare its length and bond energy with F–F.', 'Lade N≡N und vergleiche Länge und Bindungsenergie mit F–F.') },
      { id: 'dial', challenge: true, text: b('Use the what-if dial to push H–Cl into the ionic band. How far would chlorine\'s pull have to go?', 'Schieb H–Cl mit dem Was-wäre-wenn-Regler in den ionischen Bereich. Wie stark müsste Chlor ziehen?') },
    ],
    notes: {
      equal: b('Same atoms, same pull: Δχ = 0 and the pair sits in the middle. No δ+, no δ−.', 'Gleiche Atome, gleicher Zug: Δχ = 0, und das Paar sitzt in der Mitte. Kein δ+, kein δ−.'),
      hcl: b('Chlorine (3.16) outpulls hydrogen (2.20): Δχ = 0.96. The pair leans towards Cl, which turns δ−, and leaves H δ+. It is still shared: Pauling\'s estimate puts H–Cl at about 21 % ionic.',
        'Chlor (3,16) zieht stärker als Wasserstoff (2,20): Δχ = 0,96. Das Paar rückt zum Cl, das δ− wird, und lässt H δ+ zurück. Geteilt bleibt es trotzdem: Nach Paulings Abschätzung ist H–Cl zu etwa 21 % ionisch.'),
      bands: b('Nonpolar, polar and ionic are stretches of one scale, not three kinds of glue. The borders at 0.4 and 1.8 are rules of thumb; some books use 0.5 and 1.7.',
        'Unpolar, polar und ionisch sind Abschnitte einer einzigen Skala, keine drei Sorten Klebstoff. Die Grenzen bei 0,4 und 1,8 sind Faustregeln; viele deutsche Schulbücher nehmen 0,5 und 1,7.'),
      oil: b('C–H: Δχ 0.35, barely lopsided. O–H: Δχ 1.24, clearly polar. Oils are mostly C–H and C–C bonds; water is O–H. Unit 11 shows how that keeps them apart.',
        'C–H: Δχ 0,35, kaum schief. O–H: Δχ 1,24, deutlich polar. Öle bestehen vor allem aus C–H- und C–C-Bindungen, Wasser aus O–H. Einheit 11 zeigt, warum sie sich deshalb nicht mischen.'),
      triple: b('N≡N: three shared pairs, 110 pm, 946 kJ/mol. F–F: one pair, 142 pm, 160 kJ/mol. F–F is also unusually weak for a single bond, so for a fair series compare C–C, C=C and C≡C: 345, 611 and 837 kJ/mol.',
        'N≡N: drei gemeinsame Paare, 110 pm, 946 kJ/mol. F–F: ein Paar, 142 pm, 160 kJ/mol. F–F ist allerdings auch für eine Einfachbindung ungewöhnlich schwach; fairer ist die Reihe C–C, C=C und C≡C: 345, 611 und 837 kJ/mol.'),
      dial: b('Somewhere past 1.8 the haze stops leaning and settles on chlorine: the pair is handed over and the bond is ionic. Real H–Cl stays at 0.96; the dial is only a what-if.',
        'Irgendwo hinter 1,8 neigt sich der Schleier nicht mehr, er sitzt ganz am Chlor: Das Paar ist abgegeben, die Bindung ionisch. Echtes H–Cl bleibt bei 0,96; der Regler ist nur ein Was-wäre-wenn.'),
    },
    check: {
      id: 'u5-check', unit: 5, kind: 'rank', format: 'rank', evidence: 'predict', concepts: ['u5.en', 'u5.delta-chi'], table: 'chi',
      prompt: b('Quick check: rank these bonds by polarity, most polar first.', 'Kurzer Check: Ordne die Bindungen nach Polarität, die polarste zuerst.'),
      order: [b('O–H', 'O–H'), b('N–H', 'N–H'), b('C–H', 'C–H'), b('H–H', 'H–H')],
      explain: b('Δχ = 1.24, 0.84, 0.35 and 0. Across period 2 the pull grows from carbon to nitrogen to oxygen, so each bond to hydrogen leans further.',
        'Δχ = 1,24; 0,84; 0,35 und 0. In Periode 2 wächst der Zug von Kohlenstoff über Stickstoff zu Sauerstoff, also wird jede Bindung zum Wasserstoff schiefer.'),
    } as RankItem,
  },

  predictions: [
    {
      item: {
        id: 'u5-cf', unit: 5, kind: 'choice', format: 'predict', withConfidence: true, evidence: 'transfer',
        concepts: ['u5.partial-charges', 'u5.delta-chi'], targets: ['polar-means-ions', 'delta-sign-swapped', 'equal-sharing-always'],
        prompt: b('Carbon (χ 2.55) bonds to fluorine (χ 3.98), as in the coating of a non-stick pan. What kind of bond is C–F?', 'Kohlenstoff (χ 2,55) bindet an Fluor (χ 3,98), wie in der Beschichtung einer Antihaftpfanne. Was für eine Bindung ist C–F?'),
        options: [
          { text: b('Ionic: fluorine takes the electron, giving C⁺ and F⁻', 'Ionisch: Fluor nimmt das Elektron, es entstehen C⁺ und F⁻'), mis: 'polar-means-ions' },
          { text: b('Polar covalent: shared, with F δ− and C δ+', 'Polare Atombindung: geteilt, F δ− und C δ+'), correct: true },
          { text: b('Polar covalent: shared, with C δ− and F δ+', 'Polare Atombindung: geteilt, C δ− und F δ+'), mis: 'delta-sign-swapped' },
          { text: b('Nonpolar: two non-metals share equally', 'Unpolar: Zwei Nichtmetalle teilen gleichmäßig'), mis: 'equal-sharing-always' },
        ],
        explain: b('Δχ = 3.98 − 2.55 = 1.43, inside the polar band. The pair is shared, but it leans towards fluorine: F is δ−, C is δ+.',
          'Δχ = 3,98 − 2,55 = 1,43, im polaren Bereich. Das Paar wird geteilt, rückt aber zum Fluor: F ist δ−, C ist δ+.'),
      } as ChoiceItem,
      show: { engine: 'bond', a: 'C', b: 'F' },
      revealText: b('The pair spends most of its time near fluorine. Pauling\'s estimate puts C–F at about 40 % ionic: strongly lopsided, but no ions. It is also one of the strongest single bonds carbon makes (439 kJ/mol, against 415 for C–H).',
        'Das Paar hält sich meist beim Fluor auf. Nach Paulings Abschätzung ist C–F zu etwa 40 % ionisch: stark schief, aber keine Ionen. Außerdem ist es eine der stärksten Einfachbindungen des Kohlenstoffs (439 kJ/mol, gegenüber 415 für C–H).'),
      extra: {
        title: b('Subtract, then look at the sign', 'Abziehen, dann aufs Vorzeichen schauen'),
        steps: [
          b('Look up both pulls: carbon 2.55, fluorine 3.98.', 'Schlag beide Werte nach: Kohlenstoff 2,55, Fluor 3,98.'),
          b('Subtract: Δχ = 3.98 − 2.55 = 1.43.', 'Zieh ab: Δχ = 3,98 − 2,55 = 1,43.'),
          b('1.43 lies between 0.4 and 1.8: the pair is shared, but unevenly. That is a polar bond, not an ionic one.', '1,43 liegt zwischen 0,4 und 1,8: Das Paar wird geteilt, aber ungleich. Das ist eine polare Bindung, keine ionische.'),
          b('The pair leans towards the bigger χ. Fluorine gets the δ−, carbon is left δ+.', 'Das Paar rückt zum größeren χ. Fluor bekommt das δ−, Kohlenstoff bleibt δ+.'),
        ],
      },
    },
    {
      item: {
        id: 'u5-o2', unit: 5, kind: 'choice', format: 'predict', withConfidence: true, evidence: 'transfer',
        concepts: ['u5.bond-count', 'u5.multiple-bonds'], targets: ['bonds-equal-outer-electrons'],
        prompt: b('Oxygen has six outer electrons and needs eight around it. When two oxygen atoms form {{O2}}, how many electron pairs do they share?', 'Sauerstoff hat sechs Außenelektronen und braucht acht um sich. Wie viele Elektronenpaare teilen zwei Sauerstoffatome, wenn sie {{O2}} bilden?'),
        options: [
          { text: b('One', 'Eines') },
          { text: b('Two', 'Zwei'), correct: true },
          { text: b('Three', 'Drei') },
          { text: b('Six, one for each outer electron', 'Sechs, eines pro Außenelektron'), mis: 'bonds-equal-outer-electrons' },
        ],
        explain: b('Each oxygen is two electrons short of eight, and every shared pair adds one to each atom\'s count. Two shared pairs: a [[double-bond]], O=O.',
          'Jedem Sauerstoff fehlen zwei Elektronen zur Acht, und jedes gemeinsame Paar zählt bei jedem Atom eines dazu. Zwei gemeinsame Paare: eine [[double-bond]], O=O.'),
      } as ChoiceItem,
      show: { engine: 'bond', a: 'O', b: 'O', order: 2 },
      revealText: b('Each oxygen now counts eight: its two shared pairs plus two lone pairs. The double bond is shorter and stronger (121 pm, 498 kJ/mol) than an O–O single bond (about 148 pm and 140 kJ/mol, as in peroxides). One thing this picture cannot explain: liquid oxygen is pulled towards a magnet, which takes unpaired electrons. A better model, molecular orbitals, keeps the double bond and finds two unpaired electrons.',
        'Jeder Sauerstoff zählt jetzt acht: seine zwei gemeinsamen Paare plus zwei freie Paare. Die Doppelbindung ist kürzer und stärker (121 pm, 498 kJ/mol) als eine O–O-Einfachbindung (etwa 148 pm und 140 kJ/mol, wie in Peroxiden). Eines erklärt dieses Bild nicht: Flüssiger Sauerstoff wird von einem Magneten angezogen, und dafür braucht es ungepaarte Elektronen. Ein besseres Modell, das Molekülorbital-Modell, behält die Doppelbindung und findet zwei ungepaarte Elektronen.'),
      extra: {
        title: b('Count to eight, one shared pair at a time', 'Bis acht zählen, ein gemeinsames Paar nach dem anderen'),
        steps: [
          b('Each oxygen brings six outer electrons and needs eight around it.', 'Jeder Sauerstoff bringt sechs Außenelektronen mit und braucht acht um sich.'),
          b('Share one pair: each oxygen now counts seven, the pair plus five of its own. Still one short each.', 'Ein Paar teilen: Jeder Sauerstoff zählt jetzt sieben, das Paar plus fünf eigene. Jedem fehlt noch eines.'),
          b('Share a second pair: each counts eight, two shared pairs plus two lone pairs.', 'Ein zweites Paar teilen: Jeder zählt acht, zwei gemeinsame Paare plus zwei freie Paare.'),
          b('Two shared pairs between the same two atoms make a double bond: O=O.', 'Zwei gemeinsame Paare zwischen denselben zwei Atomen ergeben eine Doppelbindung: O=O.'),
        ],
      },
    },
  ],

  examples: [
    {
      title: b('Water\'s O–H bond', 'Die O–H-Bindung im Wasser'), tag: 'O–H', show: { engine: 'bond', a: 'O', b: 'H' },
      numbers: [{ v: '1.24', label: b('Δχ', 'Δχ') }, { v: '32 %', label: b('ionic, Pauling\'s estimate', 'ionisch, nach Pauling') }, { v: '464 kJ/mol', label: b('bond energy', 'Bindungsenergie') }],
      body: b('Oxygen (3.44) pulls the shared pair much harder than hydrogen (2.20). Each O–H bond is polar: oxygen carries δ−, each hydrogen δ+. In a water molecule the two bonds add up to a negative oxygen end and a positive hydrogen end (unit 6).',
        'Sauerstoff (3,44) zieht viel stärker am gemeinsamen Paar als Wasserstoff (2,20). Jede O–H-Bindung ist polar: Sauerstoff trägt δ−, jeder Wasserstoff δ+. Im Wassermolekül ergeben die zwei Bindungen zusammen ein negatives Sauerstoff-Ende und ein positives Wasserstoff-Ende (Einheit 6).'),
      soWhat: b('Water molecules cling to each other by those ends. Oil is mostly C–H and C–C bonds (Δχ 0.35 and 0) and has almost no such ends to offer, so the water molecules stay with each other and the oil ends up in its own layer. Unit 11 has the details.',
        'Wassermoleküle halten sich an diesen Enden aneinander fest. Öl besteht vor allem aus C–H- und C–C-Bindungen (Δχ 0,35 und 0) und hat kaum solche Enden zu bieten, also bleiben die Wassermoleküle unter sich, und das Öl landet in einer eigenen Schicht. Einheit 11 zeigt die Einzelheiten.'),
    },
    {
      title: b('Nitrogen\'s triple bond', 'Die Dreifachbindung des Stickstoffs'), tag: 'N≡N', show: { engine: 'bond', a: 'N', b: 'N', order: 3 },
      numbers: [{ v: '3', label: b('shared pairs', 'gemeinsame Paare') }, { v: '110 pm', label: b('bond length', 'Bindungslänge') }, { v: '946 kJ/mol', label: b('bond energy', 'Bindungsenergie') }],
      body: b('Nitrogen has five outer electrons and is three short of eight, so two nitrogen atoms share three pairs: a triple bond. Three pairs pull the nuclei close and take a lot of energy to break. Carbon shows the same pattern: C–C 345, C=C 611, C≡C 837 kJ/mol.',
        'Stickstoff hat fünf Außenelektronen, ihm fehlen drei zur Acht, also teilen zwei Stickstoffatome drei Paare: eine Dreifachbindung. Drei Paare ziehen die Kerne eng zusammen, und es kostet viel Energie, sie zu trennen. Kohlenstoff zeigt dasselbe Muster: C–C 345, C=C 611, C≡C 837 kJ/mol.'),
      soWhat: b('That bond is why the nitrogen that makes up 78 % of the air hardly reacts. To turn it into ammonia for fertiliser, the Haber–Bosch process needs a catalyst, high pressure and temperatures around 450 °C.',
        'Diese Bindung ist der Grund, warum der Stickstoff, der 78 % der Luft ausmacht, kaum reagiert. Um daraus Ammoniak für Dünger zu machen, braucht das Haber-Bosch-Verfahren einen Katalysator, hohen Druck und Temperaturen um 450 °C.'),
    },
    {
      title: b('Hydrogen fluoride, on the border', 'Fluorwasserstoff, an der Grenze'), tag: 'H–F', show: { engine: 'bond', a: 'H', b: 'F' },
      numbers: [{ v: '1.78', label: b('Δχ', 'Δχ') }, { v: '55 %', label: b('ionic, Pauling\'s estimate', 'ionisch, nach Pauling') }, { v: '41 %', label: b('ionic, from the measured dipole', 'ionisch, aus dem gemessenen Dipol') }],
      body: b('With Δχ = 1.78, hydrogen fluoride sits right at the usual 1.8 border. Pauling\'s formula calls it 55 % ionic; its measured dipole (1.83 D across 92 pm) says about 41 %. Yet HF is made of separate molecules and boils at 20 °C, nothing like a salt.',
        'Mit Δχ = 1,78 liegt Fluorwasserstoff genau an der üblichen Grenze von 1,8. Nach Paulings Formel ist es zu 55 % ionisch, sein gemessener Dipol (1,83 D über 92 pm) ergibt etwa 41 %. Trotzdem besteht HF aus einzelnen Molekülen und siedet bei 20 °C, ganz anders als ein Salz.'),
      soWhat: b('The bands are rules of thumb on a smooth scale, not walls: other books put the ionic border at 1.7 or 2.0. A single number sorts bonds roughly; the substance itself has the last word.',
        'Die Bereiche sind Faustregeln auf einer stufenlosen Skala, keine Mauern: Andere Bücher legen die ionische Grenze bei 1,7 oder 2,0. Eine einzelne Zahl sortiert Bindungen grob; das letzte Wort hat der Stoff selbst.'),
    },
  ],

  flaw: {
    id: 'u5-flaw', unit: 5, kind: 'flaw', format: 'flaw', evidence: 'transfer', concepts: ['u5.partial-charges', 'u5.delta-chi'], targets: ['polar-means-ions'],
    prompt: b('Where does this reasoning first go wrong?', 'Wo geht diese Überlegung zum ersten Mal schief?'),
    lines: [
      b('In H–Cl, chlorine (χ 3.16) pulls harder on the shared pair than hydrogen (χ 2.20).', 'In H–Cl zieht Chlor (χ 3,16) stärker am gemeinsamen Paar als Wasserstoff (χ 2,20).'),
      b('So the shared pair spends more of its time near the chlorine atom.', 'Also hält sich das gemeinsame Paar mehr in der Nähe des Chloratoms auf.'),
      b('That means chlorine has taken hydrogen\'s electron: hydrogen chloride is made of H⁺ and Cl⁻ ions.', 'Das heißt, Chlor hat dem Wasserstoff das Elektron abgenommen: Chlorwasserstoff besteht aus H⁺- und Cl⁻-Ionen.'),
      b('So pure hydrogen chloride gas should conduct electricity, like molten salt.', 'Also müsste reines Chlorwasserstoffgas den Strom leiten, wie geschmolzenes Salz.'),
    ],
    flaw: 2,
    alsoFalse: [3],
    near: [{ step: 1, note: b('Step 2 is true: the pair does lean towards chlorine. The slip comes one step later, where "leans towards" turns into "taken".', 'Schritt 2 stimmt: Das Paar rückt wirklich zum Chlor. Der Fehler kommt einen Schritt später, wo aus „rückt hin“ ein „abgenommen“ wird.') }],
    explain: b('Step 3 is where it goes wrong. Steps 1 and 2 are true: chlorine pulls harder, so the pair leans its way and chlorine becomes δ−. But leaning is not taking: with Δχ = 0.96 the pair is still shared, and the charges are partial, not whole. Step 4 is false too, because it follows from step 3: pure HCl gas does not conduct. (In water, HCl does split into ions, but that is the water\'s doing; unit 26.)',
      'Schritt 3 ist der Fehler. Schritt 1 und 2 stimmen: Chlor zieht stärker, also rückt das Paar zu ihm, und Chlor wird δ−. Aber Hinrücken ist nicht Abnehmen: Bei Δχ = 0,96 wird das Paar noch geteilt, und die Ladungen sind Teilladungen, keine ganzen. Schritt 4 ist auch falsch, weil er aus Schritt 3 folgt: Reines HCl-Gas leitet nicht. (In Wasser zerfällt HCl tatsächlich in Ionen, aber das bewirkt das Wasser; Einheit 26.)'),
  } as FlawItem,

  deeper: {
    id: 'u5-deeper', unit: 5, kind: 'estimate', format: 'estimate', evidence: 'transfer', concepts: ['u5.partial-charges'],
    prompt: b('Go deeper: if hydrogen handed its electron to chlorine completely, H–Cl would have a dipole of 6.1 D (debye): one full charge across 127 pm. The measured dipole is 1.11 D. Estimate how ionic the H–Cl bond is, in percent.',
      'Tiefer gehen: Gäbe Wasserstoff sein Elektron ganz an Chlor ab, hätte H–Cl einen Dipol von 6,1 D (Debye): eine volle Ladung über 127 pm. Gemessen sind 1,11 D. Schätze, zu wie viel Prozent die H–Cl-Bindung ionisch ist.'),
    min: 0, max: 100, step: 1, answer: 18, tolerance: 2, suffix: ' %',
    near: [{ value: 21, tol: 1, note: b('21 % is what Pauling\'s formula gives from Δχ. The dipole method gives a little less; both say the pair is mostly shared.', '21 % liefert Paulings Formel aus Δχ. Die Dipol-Methode ergibt etwas weniger; beide sagen: Das Paar wird überwiegend geteilt.') }],
    explain: b('1.11 ÷ 6.1 ≈ 0.18: about 18 % ionic. The pair is mostly shared and leans towards chlorine. Pauling\'s formula from Δχ gives 21 %; both estimates make H–Cl a polar covalent bond, far from a salt.',
      '1,11 ÷ 6,1 ≈ 0,18: etwa 18 % ionisch. Das Paar wird überwiegend geteilt und rückt zum Chlor. Paulings Formel aus Δχ ergibt 21 %; nach beiden Abschätzungen ist H–Cl eine polare Atombindung, weit weg von einem Salz.'),
  } as EstimateItem,

  explain: {
    prompt: b('In your own words: what holds two atoms together in a covalent bond, and what decides whether the bond is polar?', 'In eigenen Worten: Was hält zwei Atome in einer Atombindung zusammen, und was entscheidet, ob die Bindung polar ist?'),
    ideas: [
      { id: 'share', concept: 'u5.sharing', idea: b('Two atoms share a pair of electrons that both nuclei attract', 'Zwei Atome teilen sich ein Elektronenpaar, das beide Kerne anziehen'),
        en: /(shar(e|es|ed|ing)\b|common (electron )?pair|pair of electrons (between|held|in the middle)|electrons? (are )?held (by|between) both|both (nuclei|atoms) (attract|pull|hold))/,
        de: /(\bteil(en|t|te)\b|geteilt|gemeinsame[ns]? (elektronen)?paar|gemeinsame elektronen|bindende[ns]? (elektronen)?paar|elektronenpaarbindung|beide kerne)/ },
      { id: 'count', concept: 'u5.bond-count', idea: b('Each atom shares as many pairs as it lacks for eight outer electrons (hydrogen: for two)', 'Jedes Atom teilt so viele Paare, wie ihm zum Oktett fehlen (Wasserstoff: zu zwei)'),
        en: /(octet|eight|8 (outer )?electrons|full (outer )?shell|noble[- ]gas|as many (bonds|pairs)|how many (bonds|pairs)|lack(s|ing)?\b|missing|short of|needs? (one|two|three|four|\d) more)/,
        de: /(oktett|\bacht\b|8 (außen)?elektronen|volle (außen)?schale|edelgas|so viele (bindungen|paare)|wie viele (bindungen|paare)|fehl(t|en|ende)\b|braucht noch)/ },
      { id: 'pull', concept: 'u5.en', idea: b('Electronegativity: how hard an atom pulls on the shared pair', 'Elektronegativität: wie stark ein Atom am gemeinsamen Paar zieht'), contra: EQUAL_SHARING,
        en: /(electronegativ|\ben\b|χ|\bchi\b|pull(s|ing)? (harder|more|stronger|on|at|the)|tug|attract(s|ion)? (the )?(shared|bonding|electrons|pair)|grip|greed)/,
        de: /(elektronegativ|\ben\b|χ|zieht|ziehen|anzieh|zerr|stärker an)/ },
      { id: 'delta', concept: 'u5.partial-charges', idea: b('Uneven sharing makes the harder-pulling atom δ− and the other δ+', 'Ungleiches Teilen macht das stärker ziehende Atom δ− und das andere δ+'), contra: EQUAL_SHARING,
        en: /(δ ?[+−-]|δ ?(plus|minus)|delta ?(plus|minus|\+|−|-)|partial(ly)? (charges?|negative|positive)|slightly (negative|positive|charged)|(negative|positive) end|a bit (negative|positive))/,
        de: /(δ ?[+−-]|delta ?(plus|minus)|partialladung|teilladung|teilweise (negativ|positiv|geladen)|leicht (negativ|positiv)|schwach (negativ|positiv)|negative[ns]? ende|positive[ns]? ende)/ },
      { id: 'bands', concept: 'u5.delta-chi', idea: b('The difference Δχ sets the bond type: nonpolar, polar or, beyond about 1.8, ionic', 'Der Unterschied Δχ bestimmt die Bindungsart: unpolar, polar oder, ab etwa 1,8, ionisch'), contra: EQUAL_SHARING,
        en: /(((δχ|δ ?en\b|delta ?chi\b|difference|\bgap\b).{0,60}(polar|ionic|bond|shar|transfer|handed|decid|determin|classif|\bsets?\b))|((polar|ionic|nonpolar|bond type).{0,60}(difference|δχ|delta ?chi))|(bigger|larger|greater|smaller|small|big|large) (the )?(difference|δχ|gap)|(above|over|beyond|past|>) ?(about )?1\.[5-9]\d?.{0,20}ionic)/,
        de: /(((δχ|δ ?en\b|delta ?en\b|unterschied|differenz).{0,60}(polar|ionisch|unpolar|bindung|teil|übertrag|abgegeben|ionen|entscheid|bestimm))|((polar|ionisch|unpolar|bindungsart).{0,60}(unterschied|differenz|δχ|δ ?en\b))|(größer|kleiner|groß|klein)e?[rn]? (der |die )?(unterschied|differenz|δχ|δ ?en\b|en-differenz)|(ab|über|>) ?(etwa )?1[,.][5-9]\d?.{0,20}(ionisch|ionen))/ },
    ] as Idea[],
    tightened: b('In a covalent bond two atoms share a pair of electrons, which both nuclei attract; each atom shares as many pairs as it lacks for eight outer electrons (hydrogen: two). Electronegativity is how hard each atom pulls on a shared pair. If one pulls harder, the pair leans its way: that atom becomes δ−, the other δ+. The difference Δχ sets how far it goes: below about 0.4 nonpolar, up to about 1.8 polar, and beyond that the pair is handed over and the bond is ionic.',
      'In einer Atombindung teilen sich zwei Atome ein Elektronenpaar, das beide Kerne anziehen; jedes Atom teilt so viele Paare, wie ihm Elektronen zum Oktett fehlen (Wasserstoff: zu zwei). Die Elektronegativität sagt, wie stark ein Atom an einem gemeinsamen Paar zieht. Zieht eines stärker, rückt das Paar zu ihm: Es wird δ−, das andere δ+. Der Unterschied Δχ bestimmt, wie weit das geht: unter etwa 0,4 unpolar, bis etwa 1,8 polar, darüber wird das Paar abgegeben, und die Bindung ist ionisch.'),
  },

  terms: ['covalent-bond', 'electronegativity', 'polar-bond', 'partial-charge', 'double-bond', 'bond-energy'],

  readings: [
    {
      lang: 'en', kind: 'quick',
      title: b('Electronegativity', 'Electronegativity'), source: 'chemguide',
      url: 'https://www.chemguide.co.uk/atoms/bonding/electroneg.html',
      lookFor: [
        b('The values it gives fluorine and caesium. Compare them with the app\'s 3.98 and 0.79: the same scale, rounded differently.', ''),
        b('What δ means, and which end of the H–Cl bond gets δ−. Does it match the red end in the Charge Field?', ''),
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
        b('', 'Die Grenzen für unpolar, polar und ionisch. Der Artikel nimmt 0,5 und 1,7, die App 0,4 und 1,8. Was sagt dir das über diese Grenzen?'),
        b('', 'Die Rechnung für HCl (ΔEN = 0,96). Stimmt sie mit dem Wert in der App überein?'),
        b('', 'Wie sich die EN im Periodensystem ändert. Passt das zu Fluor, Chlor, Brom und Iod aus den Aufgaben?'),
      ],
    },
  ],

  misconceptions: [
    { id: 'equal-sharing-always', name: b('Covalent bonds always share electrons equally', 'Atombindungen teilen die Elektronen immer gleichmäßig') },
    { id: 'polar-means-ions', name: b('A polar bond means full charges, as in ions', 'Polare Bindung heißt volle Ladungen wie bei Ionen') },
    { id: 'delta-sign-swapped', name: b('δ− put on the less electronegative atom', 'δ− beim weniger elektronegativen Atom') },
    { id: 'en-bigger-atom', name: b('Bigger atoms with more electrons pull harder on shared electrons', 'Größere Atome mit mehr Elektronen ziehen stärker an gemeinsamen Elektronen') },
    { id: 'bonds-equal-outer-electrons', name: b('An atom forms as many bonds as it has outer electrons', 'Ein Atom bildet so viele Bindungen, wie es Außenelektronen hat') },
    { id: 'double-bond-weaker', name: b('Double bonds are weaker than single bonds', 'Doppelbindungen sind schwächer als Einfachbindungen') },
    { id: 'bond-type-by-rule', name: b('Bond type as a sharp rule (exactly Δχ 1.8, or metal + non-metal = ionic)', 'Bindungsart als starre Regel (genau Δχ 1,8 oder Metall + Nichtmetall = ionisch)') },
  ],

  glossary: {
    'covalent-bond': {
      en: 'covalent bond', de: 'Atombindung', unit: 5,
      def: { en: 'Two atoms held together by a shared pair of electrons that both nuclei attract.', de: 'Zwei Atome, die ein gemeinsames Elektronenpaar zusammenhält, das beide Kerne anziehen.' },
      falseFriend: { en: 'German school books also say "Elektronenpaarbindung" or "kovalente Bindung"; all three mean the same.', de: 'Gleichbedeutend sind Elektronenpaarbindung und kovalente Bindung; englisch „covalent bond“.' },
    },
    'partial-charge': {
      en: 'partial charge', de: 'Partialladung', unit: 5,
      def: { en: 'A fraction of a charge, written δ+ or δ−, on atoms whose shared pair sits closer to one of them.', de: 'Ein Bruchteil einer Ladung, geschrieben δ+ oder δ−, an Atomen, deren gemeinsames Paar näher an einem von ihnen liegt.' },
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
