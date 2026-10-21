// Unit 6 — Lone pairs and shape. The phase 0 vertical slice: every step of the unit loop.
import type { Bi } from '../i18n';
import type { ChoiceItem, RankItem, FlawItem } from './items';

const b = (en: string, de: string): Bi => ({ en, de });

export interface ExploreTask { id: string; text: Bi; challenge?: boolean; key?: boolean; }
/** A short extra worked example, shown when the prediction was missed. */
export interface Extra { title: Bi; steps: Bi[]; }
export interface Prediction { item: ChoiceItem; reveal: string; dipole?: boolean; revealText: Bi; extra: Extra; }
export interface Reading { title: Bi; source: string; url: string; lookFor: Bi[]; lang: 'en' | 'de'; kind?: 'quick' | 'deeper'; }
export interface Example { preset: string; title: Bi; numbers: { v: string; label: Bi }[]; body: Bi; soWhat: Bi; }
export interface Idea {
  id: string; idea: Bi; concept: string; en: RegExp; de: RegExp;
  /** A statement that contradicts the idea; if the text makes it, the idea is not counted as stated. */
  contra?: { en: RegExp; de: RegExp };
}

export const UNIT6 = {
  n: 6,
  title: b('Lone pairs and shape', 'Freie Elektronenpaare und Molekülgestalt'),
  lead: b('Why ammonia is a pyramid, water is bent and carbon dioxide a straight line.', 'Warum Ammoniak eine Pyramide ist, Wasser gewinkelt und Kohlenstoffdioxid gerade.'),

  puzzle: {
    lead: b('Methane, ammonia and water each have eight outer electrons around the central atom. Only their number of bonds differs.',
      'Methan, Ammoniak und Wasser haben jeweils acht Außenelektronen um das Zentralatom. Nur die Zahl ihrer Bindungen unterscheidet sich.'),
    rows: [
      { f: 'CH4', bonds: 4, angle: '109.5°' },
      { f: 'NH3', bonds: 3, angle: '107°' },
      { f: 'H2O', bonds: 2, angle: '104.5°' },
    ],
    clash: b('Three bonds that only had each other to avoid would spread flat, 120° apart. Ammonia\'s are pressed down into a pyramid at 107°. What is pushing them?',
      'Drei Bindungen, die nur einander ausweichen müssten, lägen flach in einer Ebene, 120° auseinander. Die von Ammoniak sind zu einer Pyramide mit 107° heruntergedrückt. Was drückt sie?'),
    question: {
      id: 'u6-puzzle', unit: 6, kind: 'choice', format: 'predict', withConfidence: true, evidence: 'predict',
      concepts: ['u6.lp-count'], targets: ['lone-pairs-ignored', 'always-tetrahedral'],
      prompt: b('Your best guess:', 'Deine beste Vermutung:'),
      options: [
        { text: b('The three H atoms attract each other', 'Die drei H-Atome ziehen sich gegenseitig an'), mis: 'lone-pairs-ignored' },
        { text: b('Something invisible occupies a fourth corner', 'Etwas Unsichtbares besetzt eine vierte Ecke'), correct: true },
        { text: b('Nitrogen is too small to fit 120°', 'Stickstoff ist zu klein für 120°') },
        { text: b('Bonds always meet at 109.5°', 'Bindungen treffen sich immer bei 109,5°'), mis: 'always-tetrahedral' },
      ],
      explain: b('Nitrogen has five outer electrons. Three go into bonds; the other two stay home as a [[lone-pair]]. It takes a corner just as a bond does — there is simply no atom at the end of it.',
        'Stickstoff hat fünf Außenelektronen. Drei gehen in Bindungen, die anderen zwei bleiben als [[lone-pair]] zu Hause. Es besetzt eine Ecke wie eine Bindung – nur sitzt an seinem Ende kein Atom.'),
    } as ChoiceItem,
  },

  explore: {
    intro: b('Every bond and every lone pair around the central atom pushes on every other. Nothing here is drawn by hand: the shape is wherever the pushing settles. Chemists call this the VSEPR model, valence-shell electron-pair repulsion.',
      'Jede Bindung und jedes freie Paar um das Zentralatom drückt auf alle anderen. Nichts hier ist von Hand gezeichnet: Die Gestalt ist dort, wo das Drücken zur Ruhe kommt. Das ist das Elektronenpaarabstoßungsmodell (EPA-Modell), international VSEPR.'),
    tasks: [
      { id: 'family', key: true, text: b('Load {{CH4}}, {{NH3}} and {{H2O}} and watch the angle shrink as bonds turn into lone pairs.', 'Lade {{CH4}}, {{NH3}} und {{H2O}} und sieh zu, wie der Winkel schrumpft, wenn Bindungen zu freien Paaren werden.') },
      { id: 'wrong', key: true, text: b('Switch on the wrong model for {{NH3}} or {{H2O}} and compare its angle with the measured one.', 'Schalte für {{NH3}} oder {{H2O}} das falsche Modell ein und vergleiche den Winkel mit dem gemessenen.') },
      { id: 'count', key: true, text: b('Load {{CO2}}, then {{BF3}}. How many directions does the central atom have, and how many electron pairs?', 'Lade {{CO2}}, dann {{BF3}}. Wie viele Richtungen hat das Zentralatom, und wie viele Elektronenpaare?') },
      { id: 'polar', key: true, text: b('Turn on polarity for {{H2O}} and {{CO2}}. Which one has a net pull?', 'Schalte die Polarität für {{H2O}} und {{CO2}} ein. Welches hat einen Gesamtdipol?') },
      { id: 'lambda', text: b('Drag the lone-pair push down to 1.0. Where do the bonds settle?', 'Zieh den Schub der freien Paare auf 1,0. Wo kommen die Bindungen zur Ruhe?') },
      { id: 'build', challenge: true, text: b('Build a molecule that has polar bonds but no overall dipole.', 'Baue ein Molekül mit polaren Bindungen, aber ohne Gesamtdipol.') },
    ] as ExploreTask[],
    countNote: b('{{CO2}}: four electron pairs around carbon, but only two directions, because each double bond counts once. {{BF3}}: three pairs, three directions, and no lone pair.', '{{CO2}}: vier Elektronenpaare um den Kohlenstoff, aber nur zwei Richtungen, weil jede Doppelbindung einmal zählt. {{BF3}}: drei Paare, drei Richtungen und kein freies Paar.'),
    lambdaNote: b('At 1.0 a lone pair pushes exactly like a bond, and every molecule with four directions lands on 109.5°. The real angles need λ ≈ 1.25: lone pairs sit closer to their atom and spread wider. That 1.25 is a number fitted so that ammonia and water come out right, not a measured constant.',
      'Bei 1,0 drückt ein freies Paar genau wie eine Bindung, und jedes Molekül mit vier Richtungen landet bei 109,5°. Die echten Winkel brauchen λ ≈ 1,25: Freie Paare sitzen näher am Atom und breiten sich weiter aus. Die 1,25 ist ein angepasster Wert, damit Ammoniak und Wasser stimmen, keine gemessene Konstante.'),
    rank: {
      id: 'u6-rank', unit: 6, kind: 'rank', format: 'rank', evidence: 'predict', concepts: ['u6.lp-squeeze'], targets: ['lone-pairs-ignored'],
      prompt: b('Quick check: rank by H–X–H angle, largest first.', 'Kurzer Check: Ordne nach H–X–H-Winkel, den größten zuerst.'),
      order: [b('{{CH4}}', '{{CH4}}'), b('{{NH3}}', '{{NH3}}'), b('{{H2O}}', '{{H2O}}')],
      explain: b('109.5°, 107°, 104.5°: each extra lone pair squeezes the bonds a little more.', '109,5°, 107°, 104,5°: Jedes weitere freie Paar staucht die Bindungen etwas mehr.'),
    } as RankItem,
  },

  predictions: [
    {
      item: {
        id: 'u6-pcl3', unit: 6, kind: 'choice', format: 'predict', withConfidence: true, evidence: 'transfer',
        concepts: ['u6.lp-count', 'u6.shape-from-atoms'], targets: ['lone-pairs-ignored', 'molecular-vs-electron-geometry'],
        prompt: b('{{PCl3}}: phosphorus has five outer electrons and forms three P–Cl bonds. What shape is the molecule?', '{{PCl3}}: Phosphor hat fünf Außenelektronen und bildet drei P–Cl-Bindungen. Welche Gestalt hat das Molekül?'),
        options: [
          { text: b('[[trigonal-planar|Trigonal planar]]', '[[trigonal-planar|Trigonal-planar]]'), mis: 'lone-pairs-ignored' },
          { text: b('[[trigonal-pyramidal|Trigonal pyramidal]]', '[[trigonal-pyramidal|Trigonal-pyramidal]]'), correct: true },
          { text: b('[[tetrahedral|Tetrahedral]]', '[[tetrahedral|Tetraedrisch]]'), mis: 'molecular-vs-electron-geometry' },
          { text: b('T-shaped', 'T-förmig') },
        ],
        explain: b('Five outer electrons, three bonds, one lone pair: four directions, but only three atoms to name the shape by. A pyramid, like ammonia.',
          'Fünf Außenelektronen, drei Bindungen, ein freies Paar: vier Richtungen, aber nur drei Atome, nach denen die Gestalt benannt wird. Eine Pyramide wie Ammoniak.'),
      } as ChoiceItem,
      reveal: 'PCl3',
      revealText: b('The model gives about 107°, as for ammonia; {{PCl3}} measures 100°. Phosphorus is bigger than nitrogen, so its bonding pairs sit further out from the centre and push each other less, and the lone pair squeezes them more. The model ignores atom size, which is why it still says 107°.',
        'Das Modell liefert etwa 107°, wie bei Ammoniak; gemessen sind bei {{PCl3}} 100°. Phosphor ist größer als Stickstoff, seine Bindungspaare sitzen weiter vom Zentrum entfernt und drücken einander weniger, also staucht das freie Paar sie stärker. Das Modell kennt keine Atomgrößen und bleibt deshalb bei 107°.'),
      extra: {
        title: b('Count it like ammonia', 'Zähl es wie bei Ammoniak'),
        steps: [
          b('Phosphorus is in group 15: five outer electrons, just like nitrogen.', 'Phosphor steht in Gruppe 15: fünf Außenelektronen, genau wie Stickstoff.'),
          b('Three of them go into the three P–Cl bonds. The other two stay as one lone pair.', 'Drei davon stecken in den drei P–Cl-Bindungen. Die anderen zwei bleiben als ein freies Paar.'),
          b('Three bonds plus one lone pair make four directions, pointing to the corners of a tetrahedron.', 'Drei Bindungen plus ein freies Paar ergeben vier Richtungen, in die Ecken eines Tetraeders.'),
          b('The name follows the atoms only: P on top, three Cl below. A trigonal pyramid.', 'Der Name folgt nur den Atomen: P oben, drei Cl darunter. Eine trigonale Pyramide.'),
        ],
      },
    },
    {
      item: {
        id: 'u6-ch2cl2', unit: 6, kind: 'choice', format: 'predict', withConfidence: true, evidence: 'transfer',
        concepts: ['u6.symmetry'], targets: ['symmetric-means-nonpolar'],
        prompt: b('{{CCl4}} is nonpolar. Swap two Cl atoms for H to make {{CH2Cl2}}. Polar or not?', '{{CCl4}} ist unpolar. Tausche zwei Cl-Atome gegen H und du erhältst {{CH2Cl2}}. Polar oder nicht?'),
        options: [
          { text: b('Nonpolar: it is still tetrahedral, so the pulls cancel', 'Unpolar: Es ist immer noch tetraedrisch, also heben sich die Bindungsdipole auf'), mis: 'symmetric-means-nonpolar' },
          { text: b('Polar: the four pulls are no longer equal, so they no longer cancel', 'Polar: Die vier Bindungsdipole sind nicht mehr gleich und heben sich nicht mehr auf'), correct: true },
          { text: b('Polar, because it can now form hydrogen bonds', 'Polar, weil es jetzt Wasserstoffbrücken bilden kann'), mis: 'hbond-donor-acceptor' },
        ],
        explain: b('Symmetry only cancels pulls when they are equal. Two strong C–Cl tugs and two weak C–H tugs leave a net [[dipole]] towards the chlorine side.',
          'Symmetrie hebt Bindungsdipole nur auf, wenn sie gleich sind. Zwei starke C–Cl-Bindungsdipole und zwei schwache C–H-Bindungsdipole hinterlassen ein [[dipole]] zur Chlorseite.'),
      } as ChoiceItem,
      reveal: 'CH2Cl2',
      dipole: true,
      revealText: b('Dichloromethane measures 1.6 D. It is a small, moderately polar molecule that mixes with a wide range of substances, which is why it was long sold as paint stripper.',
        'Dichlormethan misst 1,6 D. Es ist ein kleines, mäßig polares Molekül, das sich mit sehr vielen Stoffen mischt – deshalb wurde es lange als Abbeizmittel verkauft.'),
      extra: {
        title: b('Think of it as a tug of war', 'Stell es dir als Tauziehen vor'),
        steps: [
          b('Each bond pulls its electrons towards the more electronegative atom. A C–Cl bond pulls towards Cl, clearly (difference 0.6). A C–H bond pulls only weakly, and the other way: towards carbon (difference 0.35).', 'Jede Bindung zieht ihre Elektronen zum elektronegativeren Atom. Eine C–Cl-Bindung zieht deutlich zum Cl (Unterschied 0,6). Eine C–H-Bindung zieht nur schwach, und andersherum: zum Kohlenstoff (Unterschied 0,35).'),
          b('In {{CCl4}} four equal pulls point to the four corners of a tetrahedron. They balance: no net pull.', 'In {{CCl4}} zeigen vier gleiche Bindungsdipole in die vier Ecken eines Tetraeders. Sie gleichen sich aus: kein Gesamtdipol.'),
          b('In {{CH2Cl2}} the two C–Cl pulls point out towards the chlorines. The two weak C–H pulls point from the hydrogens into carbon, roughly the same way. Nothing balances them.', 'In {{CH2Cl2}} zeigen die zwei C–Cl-Bindungsdipole hinaus zu den Chloratomen. Die zwei schwachen C–H-Bindungsdipole zeigen von den Wasserstoffen zum Kohlenstoff, ungefähr in dieselbe Richtung. Nichts gleicht sie aus.'),
          b('The shape is still a tetrahedron, but the chlorine side ends up negative and the hydrogen side positive: the molecule is polar.', 'Die Gestalt ist immer noch ein Tetraeder, aber die Chlorseite wird negativ und die Wasserstoffseite positiv: Das Molekül ist polar.'),
        ],
      },
    },
  ] as Prediction[],

  examples: [
    {
      preset: 'H2O',
      title: b('Water', 'Wasser'),
      numbers: [{ v: '104.5°', label: b('H–O–H', 'H–O–H') }, { v: '2', label: b('lone pairs', 'freie Paare') }, { v: '1.85 D', label: b('dipole', 'Dipol') }],
      body: b('Two bonds and two lone pairs make four directions. Two lone pairs squeeze harder than one, so the angle closes to 104.5°, below ammonia\'s 107°. The bent shape leaves oxygen\'s side negative and the hydrogen side positive.',
        'Zwei Bindungen und zwei freie Paare ergeben vier Richtungen. Zwei freie Paare stauchen stärker als eines, der Winkel schließt sich auf 104,5°, unter die 107° von Ammoniak. Die gewinkelte Form lässt die Sauerstoffseite negativ und die Wasserstoffseite positiv.'),
      soWhat: b('That lopsided charge is why water dissolves salt: oxygen ends crowd around Na⁺, hydrogen ends around Cl⁻.',
        'Diese ungleiche Ladung ist der Grund, warum Wasser Salz löst: Die Sauerstoffenden umringen Na⁺, die Wasserstoffenden Cl⁻.'),
    },
    {
      preset: 'NH3',
      title: b('Ammonia', 'Ammoniak'),
      numbers: [{ v: '107°', label: b('H–N–H', 'H–N–H') }, { v: '1', label: b('lone pair', 'freies Paar') }, { v: '−33 °C', label: b('boils', 'Siedepunkt') }],
      body: b('Three bonds and one lone pair: a low pyramid with the lone pair on top, fully exposed.',
        'Drei Bindungen und ein freies Paar: eine flache Pyramide, das freie Paar oben, völlig frei zugänglich.'),
      soWhat: b('That exposed pair catches a passing H⁺: {{NH3}} + H⁺ → {{NH4+}}, a perfect tetrahedron. This is what makes ammonia a base; unit 26 picks it up again.',
        'Dieses freie Paar fängt ein vorbeikommendes H⁺: {{NH3}} + H⁺ → {{NH4+}}, ein perfekter Tetraeder. Das macht Ammoniak zur Base; Einheit 26 greift es wieder auf.'),
    },
    {
      preset: 'CO2',
      title: b('Carbon dioxide', 'Kohlenstoffdioxid'),
      numbers: [{ v: '180°', label: b('O=C=O', 'O=C=O') }, { v: '0', label: b('lone pairs on C', 'freie Paare an C') }, { v: '0 D', label: b('dipole', 'Dipol') }],
      body: b('Two double bonds, two directions: a straight line. Each C=O bond is polar, but the two pulls are equal and opposite.',
        'Zwei Doppelbindungen, zwei Richtungen: eine Gerade. Jede C=O-Bindung ist polar, aber die beiden Bindungsdipole sind gleich groß und entgegengesetzt.'),
      soWhat: b('With no net dipole, CO₂ molecules lack the dipole pull and the hydrogen bonds that hold water together, so they hold on to each other only weakly: dry ice turns straight to gas at −78.5 °C. Water, at less than half the mass, stays liquid up to 100 °C, thanks to its dipole and above all to hydrogen bonds (unit 11).',
        'Ohne Gesamtdipol fehlen CO₂ die Dipol-Dipol-Kräfte und die Wasserstoffbrücken, die Wasser zusammenhalten, also halten die Moleküle nur schwach zusammen: Trockeneis wird bei −78,5 °C direkt zu Gas. Wasser bleibt mit weniger als der halben Masse bis 100 °C flüssig, dank seines Dipols und vor allem dank Wasserstoffbrücken (Einheit 11).'),
    },
  ] as Example[],

  draw: {
    prompt: b('Point the arrow at the negative end of water\'s [[dipole]]. Drag around the circle.', 'Richte den Pfeil auf das negative Ende des [[dipole|Dipolmoments]] von Wasser. Zieh ihn um den Kreis.'),
    right: b('Yes: from the hydrogen side (δ+) towards oxygen and its lone pairs (δ−), along the line that splits the H–O–H angle.',
      'Genau: von der Wasserstoffseite (δ+) zum Sauerstoff und seinen freien Paaren (δ−), entlang der Linie, die den H–O–H-Winkel halbiert.'),
    wrong: b('Not quite. The electrons gather around oxygen and its two lone pairs, so the negative end is up there; the hydrogens are left slightly positive. (If you pointed at the hydrogens on purpose: physics books draw the dipole vector from − to +. Chemists draw the arrow towards δ−, and this app follows the chemists.)',
      'Nicht ganz. Die Elektronen sammeln sich um den Sauerstoff und seine zwei freien Paare, dort ist das negative Ende; die Wasserstoffe bleiben leicht positiv. (Falls du bewusst auf die Wasserstoffe gezeigt hast: In der Physik zeigt der Dipolvektor von − nach +. In der Chemie zeigt der Pfeil zu δ−, und diese App folgt der Chemie.)'),
  },

  flaw: {
    id: 'u6-flaw', unit: 6, kind: 'flaw', format: 'flaw', evidence: 'transfer', concepts: ['u6.multiple-bond'], targets: ['bond-type-sets-geometry'],
    prompt: b('Where does this reasoning first go wrong?', 'Wo geht diese Überlegung zum ersten Mal schief?'),
    lines: [
      b('Formaldehyde, {{CH2O}}: carbon forms two single bonds to H and one double bond to O.', 'Formaldehyd, {{CH2O}}: Kohlenstoff bildet zwei Einfachbindungen zu H und eine Doppelbindung zu O.'),
      b('A double bond holds two electron pairs, so carbon is surrounded by four electron pairs.', 'Eine Doppelbindung enthält zwei Elektronenpaare, also ist Kohlenstoff von vier Elektronenpaaren umgeben.'),
      b('Four electron pairs point in four directions, to the corners of a tetrahedron.', 'Vier Elektronenpaare zeigen in vier Richtungen, in die Ecken eines Tetraeders.'),
      b('So formaldehyde is tetrahedral, with angles near 109.5°.', 'Also ist Formaldehyd tetraedrisch, mit Winkeln um 109,5°.'),
    ],
    flaw: 2,
    alsoFalse: [3],
    near: [{ step: 1, note: b('You are pointing at the right idea, the double bond. But step 2 is true as written: carbon does have four electron pairs around it. The slip comes one step later, when those pairs are counted as four directions.', 'Du zeigst auf die richtige Idee, die Doppelbindung. Aber Schritt 2 stimmt so, wie er dasteht: Kohlenstoff hat wirklich vier Elektronenpaare um sich. Der Fehler kommt einen Schritt später, wenn diese Paare als vier Richtungen gezählt werden.') }],
    explain: b('Step 3 is where it goes wrong. Step 2 is true: carbon does have four electron pairs around it. But both pairs of the double bond join the same two atoms, so they point the same way and count as one direction. Carbon has three directions: trigonal planar, near 120° (measured H–C–H 116°). Step 4 is false too, but only because it follows from step 3.',
      'Schritt 3 ist der Fehler. Schritt 2 stimmt: Kohlenstoff ist wirklich von vier Elektronenpaaren umgeben. Aber beide Paare der Doppelbindung verbinden dieselben zwei Atome, zeigen also in dieselbe Richtung und zählen als eine. Kohlenstoff hat drei Richtungen: trigonal-planar, etwa 120° (gemessen H–C–H 116°). Schritt 4 ist auch falsch, aber nur, weil er aus Schritt 3 folgt.'),
  } as FlawItem,

  explain: {
    prompt: b('In your own words: what decides the shape of a molecule?', 'In eigenen Worten: Was bestimmt die Form eines Moleküls?'),
    ideas: [
      { id: 'repel', concept: 'u6.pairs-repel', idea: b('The directions (bonds and lone pairs) push each other as far apart as possible', 'Die Richtungen (Bindungen und freie Paare) stoßen sich so weit wie möglich voneinander ab'),
        en: /(repel|repuls|push|spread|far apart|get away|avoid each other|away from each other|as far as)/, de: /(abstoß|stoßen|stößt|drück|verteil|weit (weg|auseinander|voneinander)|ausweich|abstand|vsepr|epa)/ },
      { id: 'lp', concept: 'u6.lp-count', idea: b('Lone pairs take up directions too, like bonds', 'Freie Paare besetzen auch Richtungen, wie Bindungen'), contra: { en: /(shape|geometry)\b.{0,30}\bdepends? (only |just )?on (the )?(number of |how many )(atoms|bonds|bonded|partners)/, de: /(form|gestalt|geometrie).{0,30}hängt.{0,25}(anzahl|zahl) der (atome|bindungen|bindungspartner)/ },
        en: /((lone|free|non-?bonding|unshared|unbonded|not bonded|aren't bonded) ?(electron )?pairs?)|pairs? (that|which) (are|is) not (bonded|in a bond)|nonbonding domain/, de: /((frei|nichtbindend|einsam)\w* ?(elektronen)?paar)|freie[nrs]? ep\b|\beps?\b/ },
      { id: 'count', concept: 'u6.multiple-bond', idea: b('Count directions: one per bonded atom, single or double bond alike, plus one per lone pair', 'Richtungen zählen: eine pro gebundenem Atom, ob Einfach- oder Doppelbindung, plus eine pro freiem Paar'),
        en: /((count|number|how many|add up).{0,40}(direction|domain|group|pairs? around))|(double|triple) bonds?.{0,40}(one|once|single|same)|steric number|domains?/, de: /((zähl|zahl|anzahl|wie viele).{0,40}(richtung|ecke|paar|domäne))|(doppel|dreifach)bindung.{0,40}(eine|einmal|einfach|gleich)/ },
      { id: 'atoms', concept: 'u6.shape-from-atoms', idea: b('The shape is named from the atoms only; the lone pairs are invisible in the name', 'Die Gestalt wird nur nach den Atomen benannt; die freien Paare sieht man im Namen nicht'), contra: { en: /(shape|geometry)\b.{0,30}\bdepends? (only |just )?on (the )?(number of |how many )(atoms|bonds|bonded|partners)/, de: /(form|gestalt|geometrie).{0,30}hängt.{0,25}(anzahl|zahl) der (atome|bindungen|bindungspartner)/ },
        en: /((shape|geometry|name)\b.{0,50}\b(atoms?|nuclei|nuclear|ignor|invisible|only|visible|see))|((ignor|invisible|can't see|cannot see|don't see|not visible|not counted).{0,40}(lone|pair))/,
        de: /((form|gestalt|geometrie|name).{0,50}(atom|ignorier|unsichtbar|nur|sichtbar|sieht))|((ignorier|unsichtbar|nicht sehen|sieht man nicht|zählt nicht).{0,40}paar)/ },
      { id: 'squeeze', concept: 'u6.lp-squeeze', idea: b('Lone pairs push harder and squeeze the bond angles', 'Freie Paare drücken stärker und stauchen die Bindungswinkel'),
        en: /(squeez|squash|compress|shrink|push(es)? (harder|more)|repel(s|led)? (harder|more|stronger)|stronger|smaller|narrow|tighter|closer together|more room|more space|less than 109|below 109|clos(e|es|ing)( up)? the angles?|angles? clos|angular space|lp ?[-–] ?bp ?>|lp ?> ?bp)/, de: /(stauch|stärker|kleiner|enger|schrumpf|zusammendrück|drücken mehr|stoßen (sich )?(stärker|mehr) ab|verkleiner|mehr platz|mehr raum|unter 109)/ },
    ] as Idea[],
    tightened: b('Count the directions around the central atom: one for each bonded atom, whether the bond is single or double, plus one for each lone pair. They all spread as far apart as possible, and lone pairs push a little harder, squeezing the angles between the bonds. The shape is named from the atoms alone, so lone pairs are invisible in the name but not in the angles.',
      'Zähl die Richtungen um das Zentralatom: eine für jedes gebundene Atom, egal ob Einfach- oder Doppelbindung, plus eine für jedes freie Paar. Alle verteilen sich so weit wie möglich, und freie Paare drücken etwas stärker und stauchen die Winkel zwischen den Bindungen. Die Gestalt wird nur nach den Atomen benannt: Im Namen sind freie Paare unsichtbar, in den Winkeln nicht.'),
  },

  terms: ['lone-pair', 'bond-angle', 'tetrahedral', 'trigonal-pyramidal', 'bent'],

  readings: [
    {
      lang: 'en', kind: 'quick',
      title: b('Nature up close: Water molecules', 'Nature up close: Water molecules'), source: 'CBS News',
      url: 'https://www.cbsnews.com/news/nature-up-close-water-molecules/',
      lookFor: [
        b('The angle it gives for water. Compare it with the 104.5° in your workbench, and say what squeezed it down from 109.5°.', ''),
        b('Where the partial charges sit. Match them with the δ+ and δ− ends in the polarity view.', ''),
        b('Why ice floats. That is a preview of unit 11: the bent shape lets hydrogen bonds build an open lattice.', ''),
      ],
    },
    {
      lang: 'en', kind: 'deeper',
      title: b('Lesson explainer: VSEPR', 'Lesson explainer: VSEPR'), source: 'Nagwa',
      url: 'https://www.nagwa.com/en/explainers/152107871340/',
      lookFor: [
        b('The angles it gives for ammonia and water. Compare them with your workbench.', ''),
        b('How it explains why a lone pair pushes harder than a bonding pair. Which workbench slider stands for that?', ''),
        b('Its rule for double bonds. Does it agree with the formaldehyde question you just did?', ''),
      ],
    },
    {
      lang: 'de', kind: 'deeper',
      title: b('Raumstruktur von Molekülen mit dem Elektronenpaarabstoßungsmodell', 'Raumstruktur von Molekülen mit dem Elektronenpaarabstoßungsmodell'), source: 'Lernhelfer Schülerlexikon',
      url: 'https://www.lernhelfer.de/schuelerlexikon/chemie-abitur/artikel/bestimmung-der-raumstruktur-von-molekuelen-mit-dem',
      lookFor: [
        b('', 'Den Winkel für Wasser und was ihn von 109,5° heruntergedrückt hat. Vergleiche mit deiner Werkbank.'),
        b('', 'Wie der Artikel Doppelbindungen zählt. Passt das zur Formaldehyd-Frage?'),
        b('', 'Den Satz, der Platzbedarf hänge nicht von der Atomgröße ab. Stimmt das? Denk an {{PCl3}} und {{H2S}} aus dem Ausklapptext.'),
      ],
    },
  ] as Reading[],

  deeper: {
    id: 'u6-deeper', unit: 6, kind: 'rank', format: 'rank', evidence: 'transfer', concepts: ['u6.lp-squeeze'],
    prompt: b('Go deeper: rank by bond angle, largest first. H–N–H in {{NH3}}, H–O–H in {{H2O}}, H–P–H in {{PH3}}, H–S–H in {{H2S}}.', 'Tiefer gehen: Ordne nach Bindungswinkel, den größten zuerst. H–N–H in {{NH3}}, H–O–H in {{H2O}}, H–P–H in {{PH3}}, H–S–H in {{H2S}}.'),
    order: [b('{{NH3}}', '{{NH3}}'), b('{{H2O}}', '{{H2O}}'), b('{{PH3}}', '{{PH3}}'), b('{{H2S}}', '{{H2S}}')],
    explain: b('107°, 104.5°, 93.5°, 92°. Within a period the lone pairs decide: one squeezes less than two. But going down a group matters more: around the bigger P and S atoms the bonding pairs sit further out and push each other much less, so the angles fall towards 90°. Chemists also explain it by P and S bonding through almost pure p orbitals, which sit 90° apart. The workbench ignores atom size, so it cannot show this.',
      '107°, 104,5°, 93,5°, 92°. Innerhalb einer Periode entscheiden die freien Paare: eines staucht weniger als zwei. Wichtiger ist aber der Schritt eine Periode tiefer: Um die größeren Atome P und S sitzen die Bindungspaare weiter außen und drücken einander viel weniger, also fallen die Winkel Richtung 90°. Chemiker erklären es auch damit, dass P und S fast reine p-Orbitale zum Binden nutzen, die 90° auseinanderliegen. Die Werkbank kennt keine Atomgrößen und kann das nicht zeigen.'),
  } as RankItem,
};
