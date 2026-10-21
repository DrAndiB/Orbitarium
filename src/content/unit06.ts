// Unit 6 — Lone pairs and shape. The phase 0 vertical slice: every step of the unit loop.
import type { Bi } from '../i18n';
import type { ChoiceItem, RankItem, FlawItem } from './items';

const b = (en: string, de: string): Bi => ({ en, de });

export interface ExploreTask { id: string; text: Bi; challenge?: boolean; }
export interface Prediction { item: ChoiceItem; reveal: string; dipole?: boolean; revealText: Bi; }
export interface Example { preset: string; title: Bi; numbers: { v: string; label: Bi }[]; body: Bi; soWhat: Bi; }
export interface Idea { id: string; idea: Bi; concept: string; en: RegExp; de: RegExp; }

export const UNIT6 = {
  n: 6,
  title: b('Lone pairs and shape', 'Freie Elektronenpaare und Molekülgestalt'),
  lead: b('Why ammonia is a pyramid, water is bent, and what an invisible corner does to an angle.', 'Warum Ammoniak eine Pyramide ist, Wasser gewinkelt – und was eine unsichtbare Ecke mit einem Winkel macht.'),

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
      concepts: ['u6.lp-count'], targets: ['lone-pairs-ignored'],
      prompt: b('Your best guess:', 'Deine beste Vermutung:'),
      options: [
        { text: b('The three H atoms attract each other', 'Die drei H-Atome ziehen sich gegenseitig an'), mis: 'lone-pairs-ignored' },
        { text: b('Something invisible occupies a fourth corner', 'Etwas Unsichtbares besetzt eine vierte Ecke'), correct: true },
        { text: b('Nitrogen is too small to fit 120°', 'Stickstoff ist zu klein für 120°') },
        { text: b('Bonds always meet at 109.5°', 'Bindungen treffen sich immer bei 109,5°'), mis: 'bond-type-sets-geometry' },
      ],
      explain: b('Nitrogen has five outer electrons. Three go into bonds; the other two stay home as a [[lone-pair]]. It takes a corner just as a bond does — there is simply no atom at the end of it.',
        'Stickstoff hat fünf Außenelektronen. Drei gehen in Bindungen, die anderen zwei bleiben als [[lone-pair]] zu Hause. Es besetzt eine Ecke wie eine Bindung – nur sitzt an seinem Ende kein Atom.'),
    } as ChoiceItem,
  },

  explore: {
    tasks: [
      { id: 'family', text: b('Load {{CH4}}, {{NH3}} and {{H2O}} and watch the angle shrink as bonds turn into lone pairs.', 'Lade {{CH4}}, {{NH3}} und {{H2O}} und sieh zu, wie der Winkel schrumpft, wenn Bindungen zu freien Paaren werden.') },
      { id: 'wrong', text: b('Switch on the wrong model for {{NH3}} or {{H2O}} and compare its angle with the measured one.', 'Schalte für {{NH3}} oder {{H2O}} das falsche Modell ein und vergleiche den Winkel mit dem gemessenen.') },
      { id: 'lambda', text: b('Drag the lone-pair push down to 1.0. Where do the bonds settle?', 'Zieh den Schub der freien Paare auf 1,0. Wo kommen die Bindungen zur Ruhe?') },
      { id: 'polar', text: b('Turn on polarity for {{H2O}} and {{CO2}}. Which one has a net pull?', 'Schalte die Polarität für {{H2O}} und {{CO2}} ein. Welches hat einen Nettozug?') },
      { id: 'build', challenge: true, text: b('Challenge: build a molecule that has polar bonds but no overall dipole.', 'Herausforderung: Baue ein Molekül mit polaren Bindungen, aber ohne Gesamtdipol.') },
    ] as ExploreTask[],
    lambdaNote: b('At 1.0 a lone pair pushes exactly like a bond, and every four-pair molecule lands on 109.5°. The real angles need λ ≈ 1.25: lone pairs sit closer to their atom and spread wider.',
      'Bei 1,0 drückt ein freies Paar genau wie eine Bindung, und jedes Molekül mit vier Paaren landet bei 109,5°. Die echten Winkel brauchen λ ≈ 1,25: Freie Paare sitzen näher am Atom und breiten sich weiter aus.'),
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
        prompt: b('Phosphorus sits right below nitrogen in group 15. {{PCl3}} has three P–Cl bonds. What shape is it?', 'Phosphor steht in Gruppe 15 direkt unter Stickstoff. {{PCl3}} hat drei P–Cl-Bindungen. Welche Gestalt hat es?'),
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
      revealText: b('The model gives about 107°; the measured angle is 100°. Phosphorus is larger than nitrogen, so its bonds are longer and the pairs crowd closer — the same effect as {{H2S}} in September.',
        'Das Modell liefert etwa 107°, gemessen sind 100°. Phosphor ist größer als Stickstoff, seine Bindungen sind länger und die Paare rücken enger zusammen – derselbe Effekt wie bei {{H2S}} im September.'),
    },
    {
      item: {
        id: 'u6-ch2cl2', unit: 6, kind: 'choice', format: 'predict', withConfidence: true, evidence: 'transfer',
        concepts: ['u6.symmetry'], targets: ['polar-bonds-polar-molecule'],
        prompt: b('{{CCl4}} is nonpolar. Swap two Cl atoms for H to make {{CH2Cl2}}. Polar or not?', '{{CCl4}} ist unpolar. Tausche zwei Cl-Atome gegen H und du erhältst {{CH2Cl2}}. Polar oder nicht?'),
        options: [
          { text: b('Nonpolar: it is still tetrahedral, so the pulls cancel', 'Unpolar: Es ist immer noch tetraedrisch, also heben sich die Züge auf') },
          { text: b('Polar: the four pulls are no longer equal, so they no longer cancel', 'Polar: Die vier Züge sind nicht mehr gleich und heben sich nicht mehr auf'), correct: true },
          { text: b('Polar, because it can now form hydrogen bonds', 'Polar, weil es jetzt Wasserstoffbrücken bilden kann'), mis: 'hbond-donor-acceptor' },
        ],
        explain: b('Symmetry only cancels pulls when they are equal. Two strong C–Cl tugs and two weak C–H tugs leave a net [[dipole]] towards the chlorine side.',
          'Symmetrie hebt Züge nur auf, wenn sie gleich sind. Zwei starke C–Cl-Züge und zwei schwache C–H-Züge hinterlassen ein [[dipole]] zur Chlorseite.'),
      } as ChoiceItem,
      reveal: 'CH2Cl2',
      dipole: true,
      revealText: b('Dichloromethane measures 1.6 D. Being polar, it dissolves paint and grease so well that it was long sold as paint stripper.',
        'Dichlormethan misst 1,6 D. Weil es polar ist, löst es Farbe und Fett so gut, dass es lange als Abbeizmittel verkauft wurde.'),
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
        'Zwei Doppelbindungen, zwei Richtungen: eine Gerade. Jede C=O-Bindung ist polar, aber die beiden Züge sind gleich groß und entgegengesetzt.'),
      soWhat: b('With no net dipole, CO₂ molecules barely hold on to each other: dry ice turns straight to gas at −78.5 °C, while water, at less than half the mass, stays liquid up to 100 °C.',
        'Ohne Gesamtdipol halten CO₂-Moleküle kaum zusammen: Trockeneis wird bei −78,5 °C direkt zu Gas, während Wasser mit weniger als der halben Masse bis 100 °C flüssig bleibt.'),
    },
  ] as Example[],

  draw: {
    prompt: b('Point the arrow at the negative end of water\'s [[dipole]]. Drag around the circle.', 'Richte den Pfeil auf das negative Ende des [[dipole]] von Wasser. Zieh ihn um den Kreis.'),
    right: b('Yes: from the hydrogen side (δ+) towards oxygen and its lone pairs (δ−), along the line that splits the H–O–H angle.',
      'Genau: von der Wasserstoffseite (δ+) zum Sauerstoff und seinen freien Paaren (δ−), entlang der Linie, die den H–O–H-Winkel halbiert.'),
    wrong: b('Not quite. The electrons gather around oxygen and its two lone pairs, so the negative end is up there; the hydrogens are left slightly positive.',
      'Nicht ganz. Die Elektronen sammeln sich um den Sauerstoff und seine zwei freien Paare, dort ist das negative Ende; die Wasserstoffe bleiben leicht positiv.'),
  },

  flaw: {
    id: 'u6-flaw', unit: 6, kind: 'flaw', format: 'flaw', evidence: 'transfer', concepts: ['u6.multiple-bond'], targets: ['bond-type-sets-geometry'],
    prompt: b('One step in this worked example is wrong. Which one?', 'Ein Schritt in diesem Beispiel ist falsch. Welcher?'),
    lines: [
      b('Formaldehyde, {{CH2O}}: carbon forms two single bonds to H and one double bond to O.', 'Formaldehyd, {{CH2O}}: Kohlenstoff bildet zwei Einfachbindungen zu H und eine Doppelbindung zu O.'),
      b('A double bond holds two electron pairs, so carbon has four pairs pointing in four directions.', 'Eine Doppelbindung enthält zwei Elektronenpaare, also hat Kohlenstoff vier Paare in vier Richtungen.'),
      b('Four directions point to the corners of a tetrahedron.', 'Vier Richtungen zeigen in die Ecken eines Tetraeders.'),
      b('So formaldehyde is tetrahedral, with angles near 109.5°.', 'Also ist Formaldehyd tetraedrisch, mit Winkeln um 109,5°.'),
    ],
    flaw: 1,
    explain: b('Step 2 is the slip. Both pairs of a double bond point the same way, so they count as one direction. Carbon has three: trigonal planar, near 120° (measured H–C–H 116°). Steps 3 and 4 follow correctly from the wrong count.',
      'Schritt 2 ist der Fehler. Beide Paare einer Doppelbindung zeigen in dieselbe Richtung und zählen als eine. Kohlenstoff hat drei Richtungen: trigonal-planar, etwa 120° (gemessen H–C–H 116°). Die Schritte 3 und 4 folgen korrekt aus der falschen Zählung.'),
  } as FlawItem,

  explain: {
    ideas: [
      { id: 'repel', concept: 'u6.pairs-repel', idea: b('Electron pairs push each other as far apart as possible', 'Elektronenpaare stoßen sich so weit wie möglich voneinander ab'),
        en: /(repel|repuls|push|spread|far apart|avoid each other|away from each other)/i, de: /(abstoß|stoßen|stößt|drück|verteil|weit (weg|auseinander|voneinander)|ausweich|abstand)/i },
      { id: 'lp', concept: 'u6.lp-count', idea: b('Lone pairs take up directions too, like bonds', 'Freie Paare besetzen auch Richtungen, wie Bindungen'),
        en: /(lone|free|non-?bonding|unshared)\s*(electron\s*)?pairs?/i, de: /(frei|nichtbindend)\w*\s*(elektronen)?paar/i },
      { id: 'atoms', concept: 'u6.shape-from-atoms', idea: b('The shape is named from the atoms only; the lone pairs are invisible in the name', 'Die Gestalt wird nur nach den Atomen benannt; die freien Paare sieht man im Namen nicht'),
        en: /((shape|geometry|form)\b.{0,50}\b(atoms?|ignor|invisible|only|visible|see))|((ignor|invisible|can't see|cannot see|don't see).{0,40}(lone|pair))/i,
        de: /((form|gestalt|geometrie).{0,50}(atom|ignorier|unsichtbar|nur|sichtbar|sieht))|((ignorier|unsichtbar|nicht sehen|sieht man nicht).{0,40}paar)/i },
      { id: 'octet', concept: 'u6.lp-count', idea: b('The octet fixes how many pairs there are', 'Das Oktett legt fest, wie viele Paare es gibt'),
        en: /(octet|eight electrons|8 electrons|full shell|noble[- ]gas|shell completeness|complete shell)/i, de: /(oktett|acht elektronen|8 elektronen|volle schale|edelgas|vollständig\w* schale|schalenvollständig)/i },
      { id: 'squeeze', concept: 'u6.lp-squeeze', idea: b('Lone pairs push harder and squeeze the bond angles', 'Freie Paare drücken stärker und stauchen die Bindungswinkel'),
        en: /(squeez|compress|push(es)? (harder|more)|stronger|smaller angle|less than 109|narrow|closes? the angle)/i, de: /(stauch|stärker|kleiner\w* winkel|zusammendrück|drücken mehr|enger|verkleiner)/i },
    ] as Idea[],
    tightened: b('The octet fixes how many electron pairs surround the central atom, bonds and lone pairs alike. All of them spread as far apart as possible, lone pairs pushing a little harder. The shape is named from the atoms alone, so lone pairs are invisible in the name but not in the angles.',
      'Das Oktett legt fest, wie viele Elektronenpaare das Zentralatom umgeben, Bindungen und freie Paare gleichermaßen. Alle verteilen sich so weit wie möglich, die freien Paare drücken etwas stärker. Die Gestalt wird nur nach den Atomen benannt: Im Namen sind freie Paare unsichtbar, in den Winkeln nicht.'),
  },

  terms: ['lone-pair', 'bond-angle', 'tetrahedral', 'trigonal-pyramidal', 'bent'],

  reading: {
    title: b('Nature up close: Water molecules', 'Nature up close: Water molecules (englisch)'),
    source: 'CBS News',
    url: 'https://www.cbsnews.com/news/nature-up-close-water-molecules/',
    lookFor: [
      b('The angle it gives for water. Compare it with the 104.5° in your workbench, and say what squeezed it down from 109.5°.', 'Den Winkel, den der Artikel für Wasser nennt. Vergleiche ihn mit den 104,5° aus deiner Werkbank und sag, was ihn von 109,5° heruntergedrückt hat.'),
      b('Where the partial charges sit. Match them with the blue and red ends in the polarity view.', 'Wo die Teilladungen sitzen. Ordne sie den blauen und roten Enden in der Polaritätsansicht zu.'),
      b('Why ice floats. That is a preview of unit 11: the bent shape lets hydrogen bonds build an open lattice.', 'Warum Eis schwimmt. Das ist ein Vorgeschmack auf Einheit 11: Die gewinkelte Form lässt Wasserstoffbrücken ein offenes Gitter bauen.'),
    ],
  },
};
