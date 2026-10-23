// Unit 9 — Dipole–dipole forces, in the Particle Box.
// Data: boiling and melting points, electron counts, molar masses and dipole moments from substances.ts (CRC
// Handbook, NIST Chemistry WebBook). Electronegativities (Pauling) from the elements table: H 2.20, C 2.55,
// O 3.44, Cl 3.16, Br 2.96, I 2.66. Bond energies from bonds.ts (OpenStax Chemistry 2e, Table 7.2): C=O 741,
// H–Cl 432 kJ/mol. Enthalpies of vaporization at the boiling point (NIST Chemistry WebBook): acetone 29.1 kJ/mol
// (Majer and Svoboda 1985), HCl 16.2 kJ/mol (Giauque and Wiebe 1928); OpenStax 2e, section 10.1, gives "about 17"
// and "about 430 kJ" for HCl. Dichloromethane 1.6 D: unit 6. Dimethyl ether is a spray-can propellant.
// Isobutane (2-methylpropane), acetone's closer shape twin, boils at −11.7 °C (CRC Handbook). CO₂ has no dipole but a
// quadrupole moment, so "mainly" (not "only") dispersion holds it together. German temperature differences in K.
// The Particle Box's "switch off the dipole" is a model estimate (the nonpolar twin of similar size and shape) and
// is always called that.
// Notation: English writes "dipole moment" with D (debye); German uses Dipolmoment, Partialladung, EN, and names
// the school terms Dipol-Dipol-Kräfte / Dipol-Dipol-Wechselwirkungen (some books file them under
// Van-der-Waals-Kräfte).
import type { Bi } from '../i18n';
import type { ChoiceItem, RankItem, FlawItem, EstimateItem } from './items';
import type { Idea } from './unit06';
import type { UnitContent } from './unitTypes';

const b = (en: string, de: string): Bi => ({ en, de });

// Main misconceptions. A clause that states one (without a negation or a size qualifier) rules out the ideas it
// contradicts.
const DIPOLE_ALWAYS_WINS = {
  en: /^(?!.*(n't|\bnot\b|\bnever\b|\bno\b|similar|same size|same mass|comparable)).*(polar (molecules?|substances?|ones?|compounds?)\b.{0,30}\b(always|every time)\b.{0,30}(boil|higher|stronger|win)|(bigger|larger|stronger|higher) dipole.{0,40}\b(always|every time)\b|\balways\b.{0,30}(bigger|larger|stronger|higher) dipole)/,
  de: /^(?!.*(nicht|\bnie\b|kein\w*|ähnlich|gleich\w* größe|gleich\w* masse)).*(polare (moleküle|stoffe|verbindungen)?.{0,30}\bimmer\b.{0,30}(sied|höher|stärker|gewinn)|(größere\w*|stärkere\w*|höhere\w*) dipol\w*.{0,40}\bimmer\b|\bimmer\b.{0,30}(größere\w*|stärkere\w*|höhere\w*) dipol)/,
};
const BOILING_BREAKS_BONDS = {
  en: /^(?!.*(n't|\bnot\b|\bnever\b|\bno\b|\bwithout\b|intact|whole)).*(boil|evaporat|vapori[sz])\w*.{0,40}(break|breaks|breaking|broken|split|splits|splitting)\b.{0,25}\bbonds?\b/,
  de: /^(?!.*(nicht|\bnie\b|kein\w*|\bohne\b|intakt|ganz\w*)).*((sied|verdampf|verdunst)\w*.{0,40}(brech\w*|bricht|gebrochen|spalt\w*|gespalten|aufgebrochen|zerbrech\w*)\b.{0,25}bindung|(sied|verdampf|verdunst)\w*.{0,40}bindung\w* (brechen|gespalten|aufgebrochen|getrennt|zerbrechen))/,
};
const POLAR_BONDS_POLAR_MOLECULE = {
  en: /^(?!.*(n't|\bnot\b|\bnever\b|\bno\b|cancel)).*((co2|carbon dioxide)\b.{0,30}\b(is|are) polar|polar bonds?.{0,30}\b(always|means?|make|makes)\b (a )?polar molecule)/,
  de: /^(?!.*(nicht|\bnie\b|kein\w*|heben sich|aufheb)).*((co2|kohlenstoffdioxid)\b.{0,30}\b(ist|sind) polar|polare bindungen?.{0,30}\b(immer|bedeute\w*|ergeben|ergibt|macht|machen)\b (ein )?polares molekül)/,
};

// Idea 2 ("cancel") is often stated with negations ("no net dipole", "kein Gesamtdipol, also keine
// Dipol-Dipol-Kräfte"). The matcher accepts a negation inside a match only when the pattern spells it out, so the
// usual negated phrasings are written out literally, including a comma that may follow them.
const NONE_EN = ['no net dipole', 'no overall dipole', 'no permanent dipole', 'no dipole', 'no lasting ends'];
const NONE_DE = ['keinen gesamtdipol', 'kein gesamtdipol', 'keinen dipol', 'kein dipol', 'kein dipolmoment', 'keine dauerhaften enden', 'nicht polar'];
// "…, so (it has) no dipole–dipole forces" / "…, also (gibt es) keine Dipol-Dipol-Kräfte"
const THEN_NONE_EN = `(,? (so|and so|therefore|which means|meaning) (it has |there are |there is |it feels |they feel )?(no|none)( dipole-dipole| dipole–dipole)?\\w*)?`;
const THEN_NONE_DE = `(,? (also|und|deshalb|daher|somit) (auch )?(hat es |gibt es |wirken |haben sie )?(keine|keinerlei)( dipol-dipol-\\S+)?)?`;
const anyOf = (xs: string[], tail: string) => '(' + xs.map((x) => `${x},?`).join('|') + ')' + tail;
// "…cancel out, so it has nothing to stick with"
const CANCEL_EN = `cancel\\w*( out| each other out| each other)?(,? (so|and so|which means) (it has |there is |there are |there's |they have |it feels )?(nothing to( stick| attract| line up)?|no dipole|no net|no overall|no permanent|none))?`;
const CANCEL_DE = `(heben|gleichen) sich.{0,30}(auf|aus)${THEN_NONE_DE}`;
const POLARISH_EN = '(polar|dipole|δ|charged ends?|charged sides?|(plus|minus|positive|negative)( and (a )?(plus|minus|positive|negative))? ends?|lopsided)';

export const UNIT9: UnitContent = {
  n: 9,
  title: b('Dipole–dipole forces', 'Dipol-Dipol-Kräfte'),
  lead: b('Why a polar molecule clings to its neighbours harder than a nonpolar one of the same size, and when that matters.', 'Warum ein polares Molekül fester an seinen Nachbarn hängt als ein unpolares gleicher Größe, und wann das ins Gewicht fällt.'),

  puzzle: {
    title: b('Gas or liquid?', 'Gas oder Flüssigkeit?'),
    lead: b('Butane is the fuel in a pocket lighter, a gas once it escapes; acetone is the liquid in nail-polish remover. Their molecules weigh the same, and acetone even has two electrons fewer. In unit 8, more electrons meant a higher boiling point.',
      'Butan ist der Brennstoff im Feuerzeug, ein Gas, sobald es austritt; Aceton ist die Flüssigkeit im Nagellackentferner. Ihre Moleküle wiegen gleich viel, und Aceton hat sogar zwei Elektronen weniger. In Einheit 8 bedeuteten mehr Elektronen einen höheren Siedepunkt.'),
    data: {
      caption: b('Boiling points at normal air pressure. Molar mass: what one mole of molecules weighs, in grams. Electrons: all the electrons in one molecule.', 'Siedepunkte bei normalem Luftdruck. Molare Masse: was ein Mol der Moleküle wiegt, in Gramm. Elektronen: alle Elektronen eines Moleküls.'),
      head: [b('Substance', 'Stoff'), b('Molar mass (g/mol)', 'Molare Masse (g/mol)'), b('Electrons', 'Elektronen'), b('Boils at (°C)', 'Siedet bei (°C)')],
      rows: [
        { cells: [b('butane, {{C4H10}}', 'Butan, {{C4H10}}'), '58.1', '34', '−0.5'] },
        { cells: [b('pentane, {{C5H12}}', 'Pentan, {{C5H12}}'), '72.2', '42', '36'] },
        { cells: [b('acetone, {{CH3COCH3}}', 'Aceton, {{CH3COCH3}}'), '58.1', '32', '56'], mystery: true },
      ],
      numeric: [1, 2, 3],
    },
    clash: b('Acetone has fewer electrons than both, yet it boils 57 degrees above butane and even 20 above pentane, which has ten electrons more. At room temperature butane is a gas and acetone a liquid. What holds acetone molecules together so much harder?',
      'Aceton hat weniger Elektronen als beide und siedet trotzdem 57 K höher als Butan und sogar 20 K höher als Pentan, das zehn Elektronen mehr hat (Temperaturunterschiede gibt man in Kelvin an: 1 K entspricht 1 °C Unterschied). Bei Raumtemperatur ist Butan ein Gas und Aceton eine Flüssigkeit. Was hält Aceton-Moleküle so viel fester zusammen?'),
    question: {
      id: 'u9-puzzle', unit: 9, kind: 'choice', format: 'predict', withConfidence: true, evidence: 'predict',
      concepts: ['u9.dipole', 'u9.fair-compare'], targets: ['hbond-donor-acceptor', 'boiling-breaks-bonds', 'dispersion-direction'],
      prompt: b('Your best guess:', 'Deine beste Vermutung:'),
      options: [
        { text: b('Acetone molecules form hydrogen bonds with one another, like water', 'Aceton-Moleküle bilden untereinander Wasserstoffbrücken, wie Wasser'), mis: 'hbond-donor-acceptor' },
        { text: b('Acetone is polar: the negative end of one attracts the positive end of the next', 'Aceton ist polar: Das negative Ende des einen Moleküls zieht das positive Ende des nächsten an'), correct: true },
        { text: b('Boiling acetone must break its strong C=O double bonds first', 'Beim Sieden muss erst die starke C=O-Doppelbindung des Acetons brechen'), mis: 'boiling-breaks-bonds' },
        { text: b('Acetone molecules are more compact, so they pack closer together', 'Aceton-Moleküle sind kompakter und liegen deshalb dichter beieinander'), mis: 'dispersion-direction' },
      ],
      explain: b('Acetone\'s C=O group is polar (oxygen, electronegativity 3.44, pulls harder than carbon, 2.55), and nothing in the molecule cancels it: acetone has a permanent [[dipole]] of 2.88 D (D, the debye, is the unit of dipole moment). Neighbours turn so that the slightly negative (δ−) oxygen end of one sits next to the slightly positive (δ+) end of the next: a [[dipole-dipole]], on top of the dispersion both substances have. Butane has no such ends. Acetone has no H on its oxygen, so no hydrogen bonds (unit 10), and boiling separates whole molecules without breaking the C=O bond.',
        'Die C=O-Gruppe im Aceton ist polar (Sauerstoff, EN 3,44, zieht stärker als Kohlenstoff, EN 2,55), und nichts im Molekül hebt das auf: Aceton hat ein dauerhaftes [[dipole]] von 2,88 D (D, das Debye, ist die Einheit des Dipolmoments). Nachbarn drehen sich so, dass das leicht negative (δ−) Sauerstoff-Ende des einen neben dem leicht positiven (δ+) Ende des nächsten liegt: eine [[dipole-dipole]], zusätzlich zu den Dispersionskräften (in vielen Schulbüchern: Van-der-Waals-Kräfte), die beide Stoffe haben. Butan hat keine solchen Enden. Aceton hat kein H am Sauerstoff, also keine Wasserstoffbrücken (Einheit 10), und beim Sieden trennen sich ganze Moleküle, ohne dass die C=O-Bindung bricht.'),
    } as ChoiceItem,
    after: b('Next: switch on the dipoles and watch the molecules line up.', 'Als Nächstes: Schalte die Dipole ein und sieh zu, wie sich die Moleküle ausrichten.'),
  },

  explore: {
    title: b('The Particle Box', 'Die Teilchenbox'),
    intro: b('Each box holds one substance. The slider sets the temperature, and what you see, solid, liquid or gas, matches the real substance at that temperature. In the dipole view, polar molecules show their permanent ends: red for δ− (slightly negative), blue for δ+ (slightly positive), as in unit 5.',
      'Jede Box enthält einen Stoff. Der Regler stellt die Temperatur ein, und was du siehst, fest, flüssig oder gasförmig, entspricht dem echten Stoff bei dieser Temperatur. In der Dipol-Ansicht zeigen polare Moleküle ihre dauerhaften Enden: Rot für δ− (negative Partialladung), Blau für δ+ (positive Partialladung), wie in Einheit 5.'),
    tasks: [
      { id: 'dipoles', key: true, text: b('Choose acetone and switch on the "Dipoles" view. Which ends settle next to each other?', 'Wähle Aceton und schalte die Ansicht „Dipole“ ein. Welche Enden liegen schließlich nebeneinander?') },
      { id: 'pair', key: true, text: b('Put butane and acetone side by side at 20 °C. Which one is a liquid?', 'Stell Butan und Aceton bei 20 °C nebeneinander. Welcher Stoff ist flüssig?') },
      { id: 'whatif', key: true, text: b('Switch off acetone\'s dipole. What happens to its boiling point?', 'Schalte den Dipol des Acetons ab. Wie ändert sich seine Siedetemperatur?') },
      { id: 'co2', key: true, text: b('Choose carbon dioxide with the "Dipoles" view on. Its bonds are polar: where is its dipole?', 'Wähle Kohlenstoffdioxid mit der Ansicht „Dipole“. Seine Bindungen sind polar: Wo ist sein Dipol?') },
      { id: 'hx', text: b('Compare HCl and HI. Which has the bigger dipole, and which boils higher?', 'Vergleiche HCl und HI. Welches hat den größeren Dipol, und welches siedet höher?') },
      { id: 'scramble', challenge: true, text: b('Heat acetone above 50 °C with the dipole view on. What happens to the line-up?', 'Erhitze Aceton mit eingeschalteter Dipol-Ansicht über 50 °C. Was passiert mit der Ausrichtung?') },
    ],
    notes: {
      dipoles: b('The red δ− oxygen end of one molecule settles next to the blue δ+ end of a neighbour. These ends are always there, unlike the flickering ones of unit 8: a permanent dipole. The attraction between such ends is called a dipole–dipole force. Books differ on the name "van der Waals forces": many use it for all attractions between neutral molecules, dispersion and dipole–dipole alike; some use it for dispersion alone (unit 8). Check what your course means.',
        'Das rote δ−-Sauerstoff-Ende des einen Moleküls legt sich neben das blaue δ+-Ende eines Nachbarn. Diese Enden sind immer da, anders als die flackernden aus Einheit 8: ein permanenter Dipol. Die Anziehung zwischen solchen Enden heißt Dipol-Dipol-Kraft oder Dipol-Dipol-Wechselwirkung. Der Begriff „Van-der-Waals-Kräfte“ wird unterschiedlich verwendet: In manchen Büchern ist er der Sammelbegriff für alle Kräfte zwischen ungeladenen Molekülen, also Dispersions- und Dipol-Dipol-Kräfte, in anderen bezeichnet er nur die Dispersionskräfte (Einheit 8). In der Klausur nimmst du den Begriff aus deinem Buch und nennst die Ursache: permanente Dipole.'),
      pair: b('At 20 °C butane is a gas and acetone a liquid. Same mass, and acetone even has two electrons fewer: the extra hold comes from its dipole.',
        'Bei 20 °C ist Butan gasförmig und Aceton flüssig. Gleiche Masse, und Aceton hat sogar zwei Elektronen weniger: Der zusätzliche Halt kommt von seinem Dipol.'),
      whatif: b('Without its dipole, acetone would behave roughly like butane, a nonpolar molecule with almost the same number of electrons: a gas at room temperature, boiling near 0 °C. This is a model estimate, not a measurement; isobutane, closer to acetone in shape, boils at −12 °C.',
        'Ohne Dipol verhielte sich Aceton etwa wie Butan, ein unpolares Molekül mit fast gleich vielen Elektronen: gasförmig bei Raumtemperatur, Siedetemperatur um 0 °C. Das ist eine Modellabschätzung, keine Messung; Isobutan, das dem Aceton in der Gestalt näher kommt, siedet bei −12 °C.'),
      co2: b('Each C=O bond is polar, but the two point in opposite directions and cancel (unit 6). No lasting ends, nothing to line up: mainly dispersion holds CO₂ molecules together, so dry ice sublimes at −78.5 °C: it turns straight to gas.',
        'Jede C=O-Bindung ist polar, aber die beiden zeigen in entgegengesetzte Richtungen und heben sich auf (Einheit 6). Keine dauerhaften Enden, nichts zum Ausrichten: Vor allem Dispersionskräfte halten CO₂-Moleküle zusammen, deshalb sublimiert Trockeneis bei −78,5 °C: Es wird direkt gasförmig.'),
      hx: b('HCl has the bigger dipole (1.11 D against 0.45 D), yet HI boils 50 degrees higher (−35 °C against −85 °C). HI has three times as many electrons, and the extra dispersion counts for more than the lost dipole.',
        'HCl hat den größeren Dipol (1,11 D gegenüber 0,45 D), trotzdem siedet HI 50 K höher (−35 °C gegenüber −85 °C). HI hat dreimal so viele Elektronen, und die stärkeren Dispersionskräfte zählen mehr als der kleinere Dipol.'),
      scramble: b('Heat makes the molecules tumble faster, and the line-up, δ− next to δ+, fades. On average the dipoles pull less the hotter it gets, because they spend less time lined up.',
        'Wärme lässt die Moleküle schneller taumeln, und die Ausrichtung δ− neben δ+ geht verloren. Im Mittel ziehen die Dipole umso schwächer, je heißer es ist, weil sie seltener ausgerichtet sind.'),
    },
    check: {
      id: 'u9-check', unit: 9, kind: 'rank', format: 'rank', evidence: 'predict', concepts: ['u9.fair-compare', 'u9.polar-needed'],
      prompt: b('Rank by the temperature at which each turns to gas at normal pressure, highest first.', 'Ordne danach, bei welcher Temperatur jeder Stoff bei Normaldruck gasförmig wird, die höchste zuerst.'),
      order: [b('acetone (polar, 32 electrons)', 'Aceton (polar, 32 Elektronen)'), b('butane (nonpolar, 34 electrons)', 'Butan (unpolar, 34 Elektronen)'), b('{{CO2}} (polar bonds that cancel, 22 electrons)', '{{CO2}} (polare Bindungen, die sich aufheben, 22 Elektronen)')],
      explain: b('Acetone 56 °C, butane −0.5 °C, CO₂ −78.5 °C (dry ice sublimes: it turns straight to gas). Acetone adds a dipole to its dispersion; butane has only dispersion, from more electrons than CO₂; CO₂\'s bond dipoles cancel.',
        'Aceton 56 °C, Butan −0,5 °C, CO₂ −78,5 °C (Trockeneis sublimiert: Es wird direkt gasförmig). Aceton hat zu den Dispersionskräften noch einen Dipol; Butan hat nur Dispersionskräfte, aber mit mehr Elektronen als CO₂; bei CO₂ heben sich die Bindungsdipole auf.'),
    } as RankItem,
  },

  predictions: [
    {
      item: {
        id: 'u9-dme', unit: 9, kind: 'choice', format: 'predict', withConfidence: true, evidence: 'transfer',
        concepts: ['u9.fair-compare', 'u9.dipole'], targets: ['one-force-only', 'hbond-donor-acceptor'],
        prompt: b('Dimethyl ether, {{CH3OCH3}}, and propane, {{C3H8}}, both have 26 electrons and about the same size. Dimethyl ether is polar (1.30 D); propane is practically not. Propane boils at −42 °C. Dimethyl ether boils at about…',
          'Dimethylether, {{CH3OCH3}}, und Propan, {{C3H8}}, haben beide 26 Elektronen und etwa dieselbe Größe. Dimethylether ist polar (1,30 D), Propan praktisch nicht. Propan siedet bei −42 °C. Dimethylether siedet bei etwa…'),
        options: [
          { text: b('−42 °C as well: same electrons, same attraction', 'Ebenfalls −42 °C: gleiche Elektronen, gleiche Anziehung'), mis: 'one-force-only' },
          { text: b('−25 °C: a little higher, thanks to its dipole', '−25 °C: etwas höher, dank seines Dipols'), correct: true },
          { text: b('+78 °C, like ethanol, which has the same atoms (C₂H₆O)', '+78 °C, wie Ethanol, das dieselben Atome hat (C₂H₆O)'), mis: 'hbond-donor-acceptor' },
          { text: b('−60 °C: lower, because the polar ends repel', '−60 °C: tiefer, weil sich die polaren Enden abstoßen') },
        ],
        explain: b('Same electrons, so about the same dispersion; the dipole adds a pull on top, and the molecules turn so that opposite ends meet. A modest dipole gives a modest lift.',
          'Gleiche Elektronenzahl, also etwa gleich starke Dispersionskräfte; der Dipol bringt eine zusätzliche Anziehung, und die Moleküle drehen sich so, dass sich entgegengesetzte Enden treffen. Ein mäßiger Dipol bringt einen mäßigen Vorsprung.'),
      } as ChoiceItem,
      show: { engine: 'box', sub: 'CH3OCH3', compare: 'C3H8', temp: -35, view: 'dipoles' },
      revealText: b('Dimethyl ether boils at −25 °C, 17 degrees above propane. Its bent C–O–C carries a dipole of 1.30 D, and the dipole–dipole pull comes on top of the dispersion both share. At −35 °C it is still a liquid while propane is a gas. It stays far below ethanol\'s 78 °C, though: dimethyl ether has no H on oxygen, so it cannot form the hydrogen bonds of unit 10.',
        'Dimethylether siedet bei −25 °C, 17 K über Propan. Sein gewinkeltes C–O–C hat ein Dipolmoment von 1,30 D, und die Dipol-Dipol-Anziehung kommt zu den Dispersionskräften hinzu, die beide haben. Bei −35 °C ist er noch flüssig, Propan schon gasförmig. Weit unter den 78 °C von Ethanol bleibt er trotzdem: Dimethylether hat kein H am Sauerstoff und kann keine Wasserstoffbrücken bilden (Einheit 10).'),
      extra: {
        title: b('Same electrons, then add the dipole', 'Gleiche Elektronen, dann den Dipol dazu'),
        steps: [
          b('Both molecules have 26 electrons and a similar size, so their dispersion is about the same.', 'Beide Moleküle haben 26 Elektronen und eine ähnliche Größe, also etwa gleich starke Dispersionskräfte.'),
          b('Dimethyl ether is polar: the oxygen end is δ−, the two CH₃ ends δ+. Propane has practically no such ends.', 'Dimethylether ist polar: Das Sauerstoff-Ende ist δ−, die beiden CH₃-Enden sind δ+. Propan hat praktisch keine solchen Enden.'),
          b('So dimethyl ether molecules get an extra pull: δ− of one next to δ+ of the next. That is a dipole–dipole force, on top of dispersion.', 'Also bekommen Dimethylether-Moleküle eine zusätzliche Anziehung: δ− des einen neben δ+ des nächsten. Das ist eine Dipol-Dipol-Kraft, zusätzlich zu den Dispersionskräften.'),
          b('More pull means more heat is needed to separate the molecules: a higher boiling point. A modest dipole (1.30 D) gives a modest lift: −25 °C instead of −42 °C.', 'Mehr Anziehung bedeutet: Man braucht mehr Wärme, um die Moleküle zu trennen, also einen höheren Siedepunkt. Ein mäßiger Dipol (1,30 D) bringt einen mäßigen Vorsprung: −25 °C statt −42 °C.'),
        ],
      },
    },
    {
      item: {
        id: 'u9-hexane', unit: 9, kind: 'choice', format: 'predict', withConfidence: true, evidence: 'transfer',
        concepts: ['u9.dispersion-wins', 'u9.add-up'], targets: ['dipole-always-wins'],
        prompt: b('Acetone has a strong dipole (2.88 D) and 32 electrons; it boils at 56 °C. Hexane, {{C6H14}}, has no dipole but 50 electrons along a chain. Which boils higher?',
          'Aceton hat einen starken Dipol (2,88 D) und 32 Elektronen; es siedet bei 56 °C. Hexan, {{C6H14}}, hat keinen Dipol, aber 50 Elektronen entlang einer Kette. Welcher Stoff siedet höher?'),
        options: [
          { text: b('Acetone: a strong dipole beats no dipole', 'Aceton: Ein starker Dipol schlägt keinen Dipol'), mis: 'dipole-always-wins' },
          { text: b('Hexane: its many electrons give it more dispersion than acetone has in all', 'Hexan: Seine vielen Elektronen ergeben mehr Anziehung durch Dispersionskräfte, als Aceton insgesamt hat'), correct: true },
          { text: b('Neither: the dipole and the extra electrons cancel out exactly', 'Keiner: Dipol und zusätzliche Elektronen gleichen sich genau aus') },
        ],
        explain: b('Hexane, at 69 °C. Every molecule feels dispersion, and hexane\'s 50 electrons on a long chain give it a lot. Acetone\'s dipole adds a strong extra pull, but on top of less dispersion. The total decides. The textbook order "dispersion < dipole–dipole < hydrogen bonds" holds when you compare molecules of similar size; when one molecule has many more electrons, its dispersion can win overall. In an exam, name both forces and weigh them.',
          'Hexan, mit 69 °C. Jedes Molekül spürt Dispersionskräfte, und die 50 Elektronen des Hexans entlang einer langen Kette machen sie stark. Der Dipol des Acetons bringt eine starke zusätzliche Anziehung, aber Aceton hat insgesamt deutlich schwächere Dispersionskräfte. Entscheidend ist die Summe. Die Reihenfolge aus dem Schulbuch, Van-der-Waals-Kräfte < Dipol-Dipol-Kräfte < Wasserstoffbrücken, gilt beim Vergleich ähnlich großer Moleküle. Hat ein Molekül viel mehr Elektronen, können seine Dispersionskräfte insgesamt überwiegen. In der Klausur nennst du beide Kräfte und wägst sie gegeneinander ab.'),
      } as ChoiceItem,
      show: { engine: 'box', sub: 'CH3COCH3', compare: 'C6H14', temp: 62, view: 'dipoles' },
      revealText: b('Hexane boils at 69 °C, 13 degrees above acetone: at 62 °C acetone is already a gas while hexane is still liquid. Dispersion and dipole–dipole forces add up, and here the 18 extra electrons outweigh the dipole. A dipole is a bonus, not a trump card: the rule "dipole–dipole beats dispersion" only holds for molecules of similar size.',
        'Hexan siedet bei 69 °C, 13 K über Aceton: Bei 62 °C ist Aceton schon gasförmig, Hexan noch flüssig. Dispersions- und Dipol-Dipol-Kräfte addieren sich, und hier wiegen die 18 zusätzlichen Elektronen mehr als der Dipol. Ein Dipol ist ein Bonus, kein Trumpf: Die Regel „Dipol-Dipol-Kräfte sind stärker als Van-der-Waals-Kräfte“ gilt nur für Moleküle ähnlicher Größe.'),
      extra: {
        title: b('List the forces, then add them up', 'Erst die Kräfte aufzählen, dann zusammenzählen'),
        steps: [
          b('List what each molecule feels. Acetone: dispersion plus dipole–dipole forces. Hexane: dispersion only.', 'Zähl auf, was jedes Molekül spürt. Aceton: Dispersionskräfte plus Dipol-Dipol-Kräfte. Hexan: nur Dispersionskräfte.'),
          b('Dispersion grows with the number of electrons and with contact (unit 8): hexane has 50 electrons on a long chain, acetone 32 on a compact molecule.', 'Dispersionskräfte wachsen mit der Zahl der Elektronen und mit der Kontaktfläche (Einheit 8): Hexan hat 50 Elektronen auf einer langen Kette, Aceton 32 auf einem kompakten Molekül.'),
          b('Acetone\'s dipole adds a real extra pull, but here it does not make up for 18 fewer electrons.', 'Der Dipol des Acetons bringt eine echte zusätzliche Anziehung, macht aber hier 18 Elektronen weniger nicht wett.'),
          b('The total pull decides: hexane 69 °C, acetone 56 °C.', 'Die gesamte Anziehung entscheidet: Hexan 69 °C, Aceton 56 °C.'),
        ],
      },
    },
  ],

  examples: [
    {
      title: b('Carbon dioxide: polar bonds, no dipole', 'Kohlenstoffdioxid: polare Bindungen, kein Dipol'), tag: 'CO2',
      show: { engine: 'box', sub: 'CO2', compare: 'CH3CHO', temp: 0, view: 'dipoles' },
      numbers: [
        { v: '0 D', label: b('dipole moment of {{CO2}}: its two bond dipoles cancel', 'Dipolmoment von {{CO2}}: Seine zwei Bindungsdipole heben sich auf') },
        { v: '2.75 D', label: b('dipole moment of acetaldehyde, {{CH3CHO}}, also 44 g/mol', 'Dipolmoment von Acetaldehyd, {{CH3CHO}}, ebenfalls 44 g/mol') },
        { v: '−78.5 °C', label: b('sublimation point of dry ice: it turns straight to gas', 'Sublimationstemperatur von Trockeneis: Es wird direkt gasförmig') },
      ],
      body: b('Both molecules weigh 44 g/mol and both contain a polar C=O bond. In CO₂ the two C=O dipoles point in opposite directions and cancel (unit 6), so there are no lasting ends and mainly dispersion holds the molecules together. Acetaldehyde\'s single C=O is not cancelled: at 0 °C it is a liquid, and it boils only at about room temperature, 20 °C.',
        'Beide Moleküle wiegen 44 g/mol, und beide enthalten eine polare C=O-Bindung. Bei CO₂ zeigen die zwei C=O-Dipole in entgegengesetzte Richtungen und heben sich auf (Einheit 6): keine dauerhaften Enden, vor allem Dispersionskräfte halten die Moleküle zusammen. Beim Acetaldehyd wird die eine C=O-Bindung durch nichts ausgeglichen: Bei 0 °C ist er flüssig und siedet erst etwa bei Raumtemperatur, 20 °C.'),
      soWhat: b('Dry ice, solid CO₂, keeps food frozen during transport without leaving a puddle: at −78.5 °C it sublimes, turning straight into gas.',
        'Trockeneis, festes CO₂, kühlt Lebensmittel beim Transport, ohne eine Pfütze zu hinterlassen: Bei −78,5 °C sublimiert es, wird also direkt gasförmig.'),
    },
    {
      title: b('HCl and HI: the one with the smaller dipole boils higher', 'HCl und HI: Das Molekül mit dem kleineren Dipol siedet höher'), tag: 'HI',
      show: { engine: 'box', sub: 'HCl', compare: 'HI', temp: -45, view: 'dipoles' },
      numbers: [
        { v: '1.11 D', label: b('dipole moment of {{HCl}}, which boils at −85 °C', 'Dipolmoment von {{HCl}}, Siedepunkt −85 °C') },
        { v: '0.45 D', label: b('dipole moment of {{HI}}, which boils at −35 °C', 'Dipolmoment von {{HI}}, Siedepunkt −35 °C') },
        { v: '54', label: b('electrons in HI, against 18 in HCl', 'Elektronen in HI, gegenüber 18 in HCl') },
      ],
      body: b('Iodine pulls on the shared pair only a little harder than hydrogen (2.66 against 2.20), so HI\'s dipole is less than half of HCl\'s. But HI has three times as many electrons, and dispersion grows with them. The forces add up, and the extra dispersion outweighs the smaller dipole: at −45 °C HI is a liquid and HCl long since a gas.',
        'Iod zieht nur wenig stärker am gemeinsamen Paar als Wasserstoff (EN 2,66 gegenüber 2,20), also ist der Dipol von HI weniger als halb so groß wie der von HCl. Aber HI hat dreimal so viele Elektronen, und mit ihnen wachsen die Dispersionskräfte. Die Kräfte addieren sich, und die stärkeren Dispersionskräfte wiegen den kleineren Dipol mehr als auf: Bei −45 °C ist HI flüssig und HCl längst gasförmig.'),
      soWhat: b('Even in HCl, most of the attraction between molecules is dispersion; the dipole adds a smaller share. Dipoles show their effect most clearly when you compare molecules of similar size: only then does the textbook order "dispersion < dipole–dipole" hold.',
        'Selbst bei HCl stammt der größte Teil der Anziehung zwischen den Molekülen von Dispersionskräften; der Dipol trägt einen kleineren Anteil bei. Am deutlichsten zeigt sich ein Dipol, wenn man Moleküle ähnlicher Größe vergleicht: Nur dann gilt die Reihenfolge „Van-der-Waals-Kräfte < Dipol-Dipol-Kräfte“ aus dem Schulbuch.'),
    },
    {
      title: b('Ethanol and dimethyl ether: where the dipole picture is not enough', 'Ethanol und Dimethylether: wo das Dipolmodell nicht ausreicht'), tag: 'C2H5OH',
      show: { engine: 'box', sub: 'C2H5OH', compare: 'CH3OCH3', temp: 20, view: 'dipoles' },
      numbers: [
        { v: '1.69 D', label: b('dipole moment of ethanol, {{C2H5OH}}', 'Dipolmoment von Ethanol, {{C2H5OH}}') },
        { v: '1.30 D', label: b('dipole moment of dimethyl ether: same atoms, C₂H₆O', 'Dipolmoment von Dimethylether: dieselben Atome, C₂H₆O') },
        { v: '78 °C', label: b('boiling point of ethanol; dimethyl ether boils at −25 °C', 'Siedepunkt von Ethanol; Dimethylether siedet bei −25 °C') },
      ],
      body: b('Two molecules can have the same atoms and similar dipoles and still boil 103 degrees apart. Ethanol and dimethyl ether share the formula C₂H₆O and 26 electrons, and their dipoles differ only a little. Ethanol has an H on its oxygen that forms a hydrogen bond with a lone pair on a neighbour\'s oxygen, far stronger than an ordinary dipole pull.',
        'Zwei Moleküle können dieselben Atome und ähnliche Dipole haben, und ihre Siedetemperaturen unterscheiden sich trotzdem um 103 K. Ethanol und Dimethylether haben dieselbe Formel, C₂H₆O, und je 26 Elektronen, und ihre Dipole unterscheiden sich nur wenig. Ethanol hat aber ein H am Sauerstoff, das mit einem freien Elektronenpaar am Sauerstoff eines Nachbarn eine Wasserstoffbrücke bildet, viel stärker als eine gewöhnliche Dipol-Anziehung.'),
      soWhat: b('That is why ethanol, the alcohol in drinks, is a liquid you can pour, while dimethyl ether is a gas used as a spray-can propellant. Unit 10 shows which molecules can form hydrogen bonds.',
        'Deshalb ist Ethanol, der Alkohol in Getränken, eine Flüssigkeit, die man ausgießen kann, während Dimethylether ein Gas ist, das als Treibgas in Spraydosen dient. Einheit 10 zeigt, welche Moleküle Wasserstoffbrücken bilden können.'),
    },
  ],

  flaw: {
    id: 'u9-flaw', unit: 9, kind: 'flaw', format: 'flaw', evidence: 'transfer', concepts: ['u9.scale'], targets: ['boiling-breaks-bonds'],
    prompt: b('Where does this reasoning first go wrong?', 'Wo geht diese Überlegung zum ersten Mal schief?'),
    lines: [
      b('When acetone boils, the heat goes into breaking bonds inside its molecules, such as the C=O bond.', 'Wenn Aceton siedet, steckt die Wärme im Aufbrechen von Bindungen in seinen Molekülen, etwa der C=O-Bindung.'),
      b('Breaking one mole of C=O bonds takes about 740 kJ (kilojoules).', 'Ein Mol C=O-Bindungen zu spalten, kostet etwa 740 kJ (Kilojoule).'),
      b('So boiling one mole of acetone must take at least 740 kJ.', 'Also muss das Verdampfen von einem Mol Aceton mindestens 740 kJ kosten.'),
      b('And the vapour above boiling acetone is made of fragments of broken molecules.', 'Und der Dampf über siedendem Aceton besteht aus Bruchstücken zerbrochener Moleküle.'),
    ],
    flaw: 0,
    alsoFalse: [2, 3],
    near: [{ step: 1, note: b('Step 2 is true as written: a C=O bond really takes about 740 kJ/mol to break. The slip is earlier: boiling never breaks it.', 'Schritt 2 stimmt, so wie er dasteht: Eine C=O-Bindung zu spalten, kostet wirklich etwa 740 kJ/mol. Der Fehler liegt davor: Beim Sieden bricht sie gar nicht.') }],
    explain: b('Step 1 is where it goes wrong. Boiling separates whole acetone molecules from each other; the bonds inside them stay intact. Step 2 is true: a C=O bond takes about 740 kJ/mol to break (table average 741), but that energy is never spent. Evaporating a mole of acetone takes only about 29 kJ, some 25 times less. Steps 3 and 4 are false because they follow from step 1: the vapour is acetone molecules, which condense back into the same liquid.',
      'Schritt 1 ist der Fehler. Beim Sieden trennen sich ganze Aceton-Moleküle voneinander; die Bindungen in ihnen bleiben intakt. Schritt 2 stimmt: Eine C=O-Bindung zu spalten, kostet etwa 740 kJ/mol (Tabellenmittelwert 741), aber diese Energie wird nie aufgewendet. Ein Mol Aceton zu verdampfen, kostet nur etwa 29 kJ, rund 25-mal weniger. Schritte 3 und 4 sind falsch, weil sie aus Schritt 1 folgen: Der Dampf besteht aus Aceton-Molekülen, die wieder zur selben Flüssigkeit kondensieren.'),
  } as FlawItem,

  deeper: {
    id: 'u9-deeper', unit: 9, kind: 'estimate', format: 'estimate', evidence: 'transfer', concepts: ['u9.dispersion-wins', 'u9.add-up'],
    prompt: b('Three hydrogen halides. {{HCl}}: 18 electrons, dipole moment 1.11 D, boils at −85 °C. {{HI}}: 54 electrons, 0.45 D, boils at −35 °C. Hydrogen bromide, {{HBr}}: 36 electrons, 0.83 D. Estimate the boiling point of HBr.',
      'Drei Halogenwasserstoffe. {{HCl}}: 18 Elektronen, Dipolmoment 1,11 D, siedet bei −85 °C. {{HI}}: 54 Elektronen, 0,45 D, siedet bei −35 °C. Bromwasserstoff, {{HBr}}: 36 Elektronen, 0,83 D. Schätze die Siedetemperatur von HBr.'),
    min: -120, max: 0, step: 1, answer: -67, tolerance: 8, suffix: ' °C',
    near: [
      { value: -97, tol: 11, note: b('Below HCl would mean the shrinking dipole decides. It does not: HI boils higher than HCl, so the growing dispersion wins.', 'Unter HCl hieße: Das schrumpfende Dipolmoment entscheidet. Tut es nicht: HI siedet höher als HCl, also gewinnen die wachsenden Dispersionskräfte.') },
      { value: -22, tol: 12, note: b('Above HI would need more pull than HI has, but HBr has fewer electrons than HI, so less dispersion, and only a slightly bigger dipole.', 'Über HI bräuchte HBr mehr Anziehung als HI, hat aber weniger Elektronen, also schwächere Dispersionskräfte, und einen nur wenig größeren Dipol.') },
    ],
    explain: b('−67 °C. Two effects pull in opposite directions: from HCl to HI the electrons triple, so dispersion grows, while the dipole shrinks. HI boils higher, so the growing dispersion wins; HBr, halfway in electrons, lands between the two, a little below the midpoint of about −60 °C.',
      '−67 °C. Zwei Effekte wirken gegeneinander: Von HCl zu HI verdreifacht sich die Elektronenzahl, die Dispersionskräfte wachsen, und das Dipolmoment sinkt. HI siedet höher, also gewinnen die wachsenden Dispersionskräfte; HBr liegt mit der halben Elektronenzunahme dazwischen, etwas unter der Mitte von etwa −60 °C.'),
  } as EstimateItem,

  explain: {
    prompt: b('In your own words: what are dipole–dipole forces, which molecules have them, and how much do they matter?', 'In eigenen Worten: Was sind Dipol-Dipol-Kräfte, welche Moleküle haben sie, und wie viel machen sie aus?'),
    ideas: [
      { id: 'ends', concept: 'u9.dipole', idea: b('Polar molecules have permanent δ+ and δ− ends, and neighbours attract end to end, δ− next to δ+', 'Polare Moleküle haben dauerhafte δ+- und δ−-Enden, und Nachbarn ziehen sich an den entgegengesetzten Enden an, δ− neben δ+'),
        // The distinguishing part: the ends (or the dipoles) of neighbouring molecules attract or line up. The bare term
        // "dipole–dipole forces" does not pass.
        en: /((^|[\s(])[-+] ?(ends?|sides?|poles?)\b.{0,60}(attract|pull|draw|stick|cling|hold|line(s|d)? up|lining up|face|facing|next to|towards?|sits?)|(δ ?[-+]|delta ?(plus|minus)|positive|negative|plus|minus|opposite|partial(ly)? charged|charged)\s?(ends?|sides?|poles?|charges?)?.{0,50}(attract|pull|draw|stick|cling|hold|line(s|d)? up|lining up|face|facing|next to|towards?)|(dipoles?|polar molecules?)\b.{0,40}(attract|pull|stick|cling|line(s|d)? up|lining up|align|face|turn)|(line(s|d)? up|lining up|align(s|ed)?|turn(s|ed)?) .{0,30}(head[- ]to[- ]tail|end[- ]to[- ]end|δ|plus|minus|positive|negative|opposite)|head[- ]to[- ]tail|end[- ]to[- ]end|permanent dipoles?.{0,60}(attract|pull|force|interact))/,
        de: /((^|[\s(])[-+] ?-?(ende|enden|seite|seiten|pol|pole)\b.{0,60}(zieh|anzieh|angezogen|richt|neben|gegenüber|zueinander|halt|hält)|(δ ?[-+]|delta ?(plus|minus)|positiv\w*|negativ\w*|plus|minus|entgegengesetzt\w*|gegensätzlich\w*|teilgeladen\w*|partialgeladen\w*)\s?(-?enden?|seiten?|pole?|ladung\w*|teilladung\w*|partialladung\w*)?.{0,50}(zieh|anzieh|angezogen|halt|hält|richt|gegenüber|zueinander|neben)|(dipole?|dipolmolekül\w*|polare moleküle)\b.{0,40}(zieh|anzieh|angezogen|richt|halt|hält|lagern|ordnen|dreh)|(ausgerichtet|richten sich|ordnen sich|drehen sich).{0,40}(δ|plus|minus|positiv|negativ|entgegengesetzt)|kopf an schwanz|ende an ende|permanent\w* dipol\w*.{0,60}(zieh|anzieh|wechselwirk|kräfte|kraft))/ },
      { id: 'cancel', concept: 'u9.polar-needed', idea: b('Only a molecule with an overall dipole has them; if the bond dipoles cancel, as in CO₂, there are none', 'Nur ein Molekül mit Gesamtdipol hat sie; heben sich die Bindungsdipole auf wie bei CO₂, gibt es keine'),
        contra: POLAR_BONDS_POLAR_MOLECULE,
        // Negated phrasings belong to this idea, so they are spelled out literally (see NONE_EN / NONE_DE).
        en: new RegExp(`(only (a |the )?(polar|molecules? (with|that have|that has) an? (net |overall |permanent )?dipole)|(must|has to|have to) be polar|needs? (a |an )?(net |overall |permanent )?dipole|(co2|carbon dioxide).{0,60}(${CANCEL_EN}|nonpolar${THEN_NONE_EN}|non-polar${THEN_NONE_EN}|zero dipole|0 d\\b|${anyOf(NONE_EN, THEN_NONE_EN)})|(bond )?dipoles?.{0,30}${CANCEL_EN}|${CANCEL_EN}.{0,40}(dipole|out|each other)|(symmetric|symmetrical)\\w*.{0,40}(no dipole|no net|no overall|zero|${CANCEL_EN}|nonpolar|non-polar)|${anyOf(NONE_EN, THEN_NONE_EN)}|no dipole-dipole|no dipole–dipole|zero dipole)`),
        de: new RegExp(`(nur (ein |die )?(polare\\w*|moleküle? mit (einem )?(gesamt)?dipol)|(muss|müssen) polar|(co2|kohlenstoffdioxid).{0,60}(${CANCEL_DE}|unpolar${THEN_NONE_DE}|null|0 d\\b|${anyOf(NONE_DE, THEN_NONE_DE)})|(bindungs)?dipole?.{0,30}(heben sich|aufheben|gleichen sich|ausgleichen)${THEN_NONE_DE}|${CANCEL_DE}|symmetrisch\\w*.{0,40}(kein gesamtdipol|keinen gesamtdipol|kein dipol|keinen dipol|null|unpolar|auf)|${anyOf(NONE_DE, THEN_NONE_DE)}|keine dipol-dipol-kräfte|keine dipol-dipol-wechselwirkungen|keine dipol-dipol-kraft)`) },
      { id: 'fair', concept: 'u9.fair-compare', idea: b('Between molecules of similar size, the polar one boils higher', 'Bei Molekülen ähnlicher Größe siedet das polare höher'),
        contra: DIPOLE_ALWAYS_WINS,
        en: new RegExp(`(${POLARISH_EN}.{0,60}(boil(s|ing)? (higher|later|at a higher)|higher boiling|rais(e|es|ed|ing) the boiling|more (energy|heat) to (boil|separate|evaporate)|harder to (boil|separate|evaporate|pull apart)|stick (together )?(more|harder|better)|hold (on )?(together )?(more|harder|tighter)|extra (pull|attraction|hold)|stronger attraction|attract (each other )?(more|harder|more strongly))|(boil(s|ing)? (higher|later)|higher boiling point).{0,60}${POLARISH_EN}|(same|similar|equal|comparable) (size|mass|weight|molar mass|number of electrons|electrons).{0,60}${POLARISH_EN}|(same|similar|equal|comparable) (size|mass|weight|molar mass|number of electrons|electrons).{0,60}(boils? higher|higher (boiling|bp\\b)|stronger than (the )?(dispersion|london|van der waals|vdw))|${POLARISH_EN}.{0,60}(same|similar|equal|comparable) (size|mass|weight|molar mass|number of electrons|electrons))`),
        de: /((polar|dipol|δ|plus- und minus-ende|geladene\w* enden).{0,60}(sied\w* (höher|später|erst bei höher)|höhere\w* siede|siedepunkt (steigt|erhöht|höher|liegt höher)|erhöh\w* (den )?siede|mehr energie|mehr wärme|schwerer (zu )?(trennen|verdampfen)|stärker zusammen|fester zusammen|zusätzlich\w* (anziehung|kraft|kräfte|halt)|stärker\w* anzieh|ziehen sich (stärker|mehr) an)|(sied\w* höher|höhere\w* siede\w*).{0,60}(polar|dipol|δ)|(gleich\w*|ähnlich\w*|vergleichbar\w*) (größe|masse|molare\w* masse|molekülmasse|molekülgröße|teilchenmasse|elektronenzahl|anzahl (an |der |von )?elektronen).{0,60}(polar|dipol)|(gleich\w*|ähnlich\w*|vergleichbar\w*) (größe|masse|molare\w* masse|molekülmasse|molekülgröße|elektronenzahl)\b.{0,60}(höhere\w* (sdt|sdp|siede\w*)|sied\w* (das polare |es |sie )?höher|stärker als (die )?(vdw|van-der-waals|van der waals|dispersion)\w*)|(polar|dipol).{0,60}(gleich\w*|ähnlich\w*|vergleichbar\w*) (größe|masse|molare\w* masse|molekülmasse|molekülgröße|elektronenzahl))/ },
      { id: 'disp', concept: 'u9.dispersion-wins', idea: b('Dispersion acts as well and the forces add up, so many more electrons can outweigh a dipole', 'Dispersionskräfte wirken zusätzlich, und die Kräfte addieren sich; viel mehr Elektronen können einen Dipol übertreffen'),
        contra: DIPOLE_ALWAYS_WINS,
        en: /((dispersion|london|van der waals|vdw|induced|temporary|instantaneous|flickering)\w*.{0,60}(also|as well|too|on top|add|plus|outweigh|beat|win|stronger|bigger|larger|more (important|than)|dominat|exceed|matter more)|(also|as well|too|on top|add\w*|plus)\b.{0,40}(dispersion|london|van der waals|vdw)|(more|many more|lots of|extra|three times as many) electrons.{0,60}(outweigh|beat|win|stronger|more than|matter more|higher|despite|even though|although|smaller dipole|weaker dipole)|(outweigh|beat|win|overcome|more important than|matter more than).{0,40}(dipole|polar)|(\bhi\b|hexane|octane).{0,60}(higher|above).{0,40}(hcl|acetone)|(forces|attractions?) add( up)?|add up)/,
        de: /((dispersion|london|van-der-waals|van der waals|vdw|induziert\w*|kurzlebig\w*|temporär\w*|flacker\w*)\w*.{0,60}(auch|ebenfalls|zusätzlich|dazu|addier|plus|überwieg|übertreff|gewinn|stärker|größer|wichtiger|dominier|überleg|mehr ausmach)|(auch|ebenfalls|zusätzlich|außerdem)\b.{0,40}(dispersion|london|van-der-waals|van der waals|vdw)|(mehr|viel mehr|viele|vielen|zusätzliche\w*|dreimal so viele\w*) elektronen.{0,60}(überwieg|übertreff|gewinn|stärker|wichtiger|höher|trotz|obwohl|kleinere\w* dipol|schwächere\w* dipol|wett|mehr ausmach)|(überwieg|übertreff|wichtiger als|gewinn\w* gegen|wiegt.{0,20}auf).{0,40}(dipol|polar)|(\bhi\b|hexan|octan).{0,60}(höher|über).{0,40}(hcl|aceton)|(kräfte|anziehungen) (addier|summier)|addieren sich|summieren sich)/ },
      { id: 'scale', concept: 'u9.scale', idea: b('Forces between molecules are far weaker than the bonds inside them: boiling separates whole molecules', 'Kräfte zwischen Molekülen sind viel schwächer als die Bindungen in ihnen: Beim Sieden trennen sich ganze Moleküle'),
        contra: BOILING_BREAKS_BONDS,
        // Negated phrasings belong to this idea and are spelled out literally ("doesn't break", "nicht gespalten").
        en: /((far |much |a lot )?weaker than (the |a |any )?(covalent |chemical |real |actual )?bonds?.{0,60}(doesn't break|does not break|don't break|do not break|never breaks?|breaks no|no bonds)|(intermolecular forces|imfs?|forces between (the )?molecules|attractions? between (the )?molecules).{0,40}(overcome|overcoming)|only (the )?(intermolecular|forces between|attractions? between)|(far |much |a lot )?weaker than (the |a |any )?(covalent |chemical |real |actual )?bonds?|bonds? (inside|within|in) (the |a )?molecules?.{0,40}(stay|remain|intact|unbroken|much stronger|far stronger|untouched)|(stay|stays|remain|remains) intact|whole molecules|(molecules?|they) (stay|stays|remain|remains) (whole|intact|the same)|separat\w* (the )?(whole )?molecules|between (the )?molecules,? not (inside|within)|doesn't break|does not break|don't break|do not break|never breaks?|no bonds|breaks no bonds|(tens|few|some) (of )?kj.{0,40}hundreds|hundreds.{0,40}(tens|few) (of )?kj|(25|twenty[- ]five|\d\d) times (less|weaker|smaller|stronger))/,
        de: /((viel |weit |deutlich |sehr )?schwächer als (die |eine )?(atom|elektronenpaar|kovalente\w* |chemische\w* )?bindung\w*.{0,60}(keine bindungen|keine bindung bricht|nicht gespalten|nicht gebrochen|nicht aufgebrochen|nicht getrennt)|zwischenmolekular\w* (kräfte|anziehung\w*|wechselwirkung\w*).{0,40}überwund\w*|nur (die )?zwischenmolekular\w*|(viel |weit |deutlich |sehr )?schwächer als (die |eine )?(atom|elektronenpaar|kovalente\w* |chemische\w* )?bindung\w*|bindungen (in|innerhalb) (den |der |des )?molekül\w*.{0,40}(bleiben|erhalten|intakt|viel stärker|unverändert)|(bleiben|bleibt) (ganz|intakt|erhalten|unversehrt)|ganze moleküle|moleküle (bleiben|bleibt) (ganz|intakt|erhalten)|zwischen (den )?molekülen,? nicht (in|innerhalb)|nicht gespalten|nicht getrennt|nicht gebrochen|nicht aufgebrochen|nie gespalten|keine bindungen|keine bindung bricht|nicht die bindungen|(\d\d|zwanzig|fünfundzwanzig)-?mal (weniger|schwächer|kleiner|stärker))/ },
    ] as Idea[],
    tightened: b('Polar molecules have permanent δ+ and δ− ends, and neighbouring molecules attract end to end, δ− next to δ+: dipole–dipole forces. Only a molecule with an overall dipole has them; in CO₂ the two bond dipoles cancel, so it has none. Between molecules of similar size the polar one therefore boils higher, as acetone (56 °C) does against butane (−0.5 °C). Dispersion acts as well and the forces add up, so a molecule with many more electrons can outweigh a dipole: HI boils above HCl. All these forces between molecules are far weaker than the bonds inside them: boiling separates whole molecules and breaks no bonds.',
      'Polare Moleküle haben dauerhafte δ+- und δ−-Enden, und benachbarte Moleküle ziehen sich an den entgegengesetzten Enden an, δ− neben δ+: Dipol-Dipol-Kräfte. Nur ein Molekül mit Gesamtdipol hat sie; bei CO₂ heben sich die beiden Bindungsdipole auf, also hat es keine. Bei Molekülen ähnlicher Größe siedet deshalb das polare höher, so wie Aceton (56 °C) gegenüber Butan (−0,5 °C). Dispersionskräfte wirken zusätzlich, und die Kräfte addieren sich; ein Molekül mit viel mehr Elektronen kann deshalb einen Dipol übertreffen: HI siedet höher als HCl. Alle diese Kräfte zwischen Molekülen sind viel schwächer als die Bindungen in ihnen: Beim Sieden trennen sich ganze Moleküle, keine Bindung bricht.'),
  },

  terms: ['dipole-dipole', 'dipole', 'partial-charge', 'dispersion', 'h-bond'],

  readings: [
    {
      lang: 'en', kind: 'quick',
      title: b('Intermolecular bonding: van der Waals forces', 'Intermolecular bonding: van der Waals forces'), source: 'chemguide',
      url: 'https://www.chemguide.co.uk/atoms/bonding/vdw.html',
      lookFor: [
        b('The same page as in unit 8; this time read the dipole–dipole part. Its sentence that dipole–dipole forces are not an alternative to dispersion but come in addition: which answer in the hexane question does that explain?', ''),
        b('The comparison of ethane with fluoromethane: same electrons, similar size. How much higher does the polar one boil, and how does that compare with acetone\'s 57-degree lead over butane?', ''),
        b('Its note on what different syllabuses call "van der Waals forces". Which term does your course use?', ''),
      ],
    },
    {
      lang: 'en', kind: 'deeper',
      title: b('Intermolecular Forces', 'Intermolecular Forces'), source: 'OpenStax Chemistry 2e, section 10.1',
      url: 'https://openstax.org/books/chemistry-2e/pages/10-1-intermolecular-forces',
      lookFor: [
        b('The same section as in unit 8; this time the dipole–dipole part. Example 10.3 with propane, dimethyl ether and ethanol: which force does it credit for each step up? Compare it with this unit\'s prediction and third example.', ''),
        b('What it says about HCl, HBr and HI: which effect does it say dominates? Check it against the HI example.', ''),
        b('The energy to vaporize one mole of HCl against the energy to break its H–Cl bonds. How many times larger is the second?', ''),
      ],
    },
    {
      lang: 'de', kind: 'quick',
      title: b('Dipol-Dipol-Wechselwirkung', 'Dipol-Dipol-Wechselwirkung'), source: 'Studyflix',
      url: 'https://studyflix.de/chemie-schueler/dipol-dipol-wechselwirkung-2391',
      lookFor: [
        b('', 'Die Regel, dass ab einer ΔEN von 0,4 ein Dipol entsteht. Warum reicht eine polare Bindung allein nicht? Denk an CO₂.'),
        b('', 'Wie der Artikel Dipol-Dipol-Kräfte zu den Van-der-Waals-Kräften zählt. Welchen Begriff verwendet dein Schulbuch?'),
        b('', 'Was der Artikel über die Stärke im Vergleich zu Atom- und Ionenbindungen sagt. Passt das zu HCl: etwa 16 kJ/mol zum Verdampfen gegenüber 432 kJ/mol für die H–Cl-Bindung?'),
      ],
    },
  ],

  misconceptions: [
    { id: 'dipole-always-wins', name: b('A bigger dipole always means a higher boiling point', 'Ein größerer Dipol bedeutet immer einen höheren Siedepunkt') },
    { id: 'one-force-only', name: b('Molecules feel only one kind of force (polar ones only dipole forces)', 'Moleküle spüren nur eine Art von Kraft (polare nur Dipol-Dipol-Kräfte)') },
    { id: 'boiling-breaks-bonds', name: b('Boiling breaks the bonds inside molecules', 'Beim Sieden brechen die Bindungen in den Molekülen') },
  ],

  glossary: {
    'dipole-dipole': {
      en: 'dipole–dipole force', de: 'Dipol-Dipol-Kraft', unit: 9,
      def: { en: 'The attraction between polar molecules: the δ− end of one pulls on the δ+ end of the next. It adds to dispersion and is far weaker than a covalent bond.', de: 'Die Anziehung zwischen polaren Molekülen: Das δ−-Ende des einen zieht das δ+-Ende des nächsten an. Sie kommt zu den Dispersionskräften hinzu und ist viel schwächer als eine Atombindung.' },
      falseFriend: { en: 'German says "Dipol-Dipol-Kräfte" or "Dipol-Dipol-Wechselwirkungen"; books that use "van der Waals forces" as the umbrella term count them among those.', de: 'Auch „Dipol-Dipol-Wechselwirkung“; Bücher, die „Van-der-Waals-Kräfte“ als Sammelbegriff verwenden, zählen sie dazu; englisch „dipole–dipole force“.' },
    },
  },
};
