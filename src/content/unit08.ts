// Unit 8 — Dispersion, on the Particle Box.
// Data: melting and boiling points, electron counts and molar masses from substances.ts (CRC Handbook, NIST
// Chemistry WebBook). Heptane boils at 98.4 °C (CRC Handbook). Enthalpy of vaporization of butane at its boiling
// point: 22.4 kJ/mol (NIST Chemistry WebBook, Majer and Svoboda 1985). C–C bond energy 345 kJ/mol: bonds.ts
// (OpenStax Chemistry 2e, Table 7.2). The I–I bond is weaker than Cl–Cl (bonds.ts gives Cl–Cl 243 kJ/mol).
// Notation: English says "dispersion" (also London or van der Waals forces); German says Dispersionskräfte and names
// the school terms Van-der-Waals-Kräfte and London-Kräfte once, with what to write in an exam.
import type { Bi } from '../i18n';
import type { ChoiceItem, RankItem, FlawItem, EstimateItem } from './items';
import type { Idea } from './unit06';
import type { UnitContent } from './unitTypes';

const b = (en: string, de: string): Bi => ({ en, de });

// Clauses that state a misconception rule out the ideas they contradict. Each starts with a guard against negation,
// because a contra pattern is tested without the matcher's negation check.
const NO_NEG_EN = '^(?!.*(\\bnot\\b|n\'t|\\bno\\b|\\bnever\\b|\\bwithout\\b|\\bmyth\\b|\\bwrong\\b))';
const NO_NEG_DE = '^(?!.*(\\bnicht\\b|\\bkein\\w*|\\bnie\\b|\\bohne\\b|\\bfalsch\\b))';
// "Boiling breaks the bonds (inside the molecules)."
const BOIL_BREAKS = {
  en: new RegExp(`${NO_NEG_EN}.*(boil\\w*|evaporat\\w*|vapori\\w*).{0,40}\\b(break|breaks|broken|breaking|split|splits)\\b.{0,30}\\bbonds?\\b`),
  de: new RegExp(`${NO_NEG_DE}.*(sied\\w*|verdampf\\w*).{0,50}(bindung\\w*).{0,30}(gespalten|getrennt|gebrochen|aufgebrochen|brechen|spalten)`),
};
// "Nonpolar molecules do not attract (each other)."
const NONPOLAR_NONE = {
  en: /(nonpolar|non-polar) (molecules?|atoms?|particles?) (don't|do not|cannot|can't|never) (attract|pull|stick|hold)/,
  de: /unpolare (moleküle|atome|teilchen) (ziehen sich|können sich) (nicht|gar nicht|überhaupt nicht) an/,
};
// "Heavy molecules are harder to lift / weight holds them down."
const WEIGHT = {
  en: /(gravity|too heavy to (fly|escape|lift|leave|rise)|harder to lift|weigh(s|t)? (them|it) down|heavier (molecules|ones)? (are|is) harder to (lift|move up))/,
  de: /(schwerkraft|zu schwer,? um (wegzufliegen|aufzusteigen|zu entweichen)|schwerer (anzuheben|hochzuheben)|gewicht (hält|zieht) (sie|es) (unten|nach unten))/,
};

export const UNIT8: UnitContent = {
  n: 8,
  title: b('Dispersion', 'Dispersionskräfte'),
  lead: b('What holds molecules without any charge together, and why bigger and longer ones hold on harder.', 'Was Moleküle ohne jede Ladung zusammenhält, und warum größere und längere fester zusammenhalten.'),

  puzzle: {
    title: b('Gas, gas, liquid, solid', 'Gas, Gas, Flüssigkeit, Feststoff'),
    lead: b('Fluorine, chlorine, bromine and iodine all form two-atom molecules, X₂. The two atoms are identical, so the shared pair sits exactly in the middle: no δ+ end, no δ− end (unit 5). At room temperature they are a gas, a gas, a liquid and a solid.',
      'Fluor, Chlor, Brom und Iod bilden alle zweiatomige Moleküle, X₂. Die zwei Atome sind gleich, also sitzt das gemeinsame Elektronenpaar genau in der Mitte: kein δ+-Ende, kein δ−-Ende (Einheit 5). Bei Raumtemperatur sind sie ein Gas, ein Gas, eine Flüssigkeit und ein Feststoff.'),
    data: {
      caption: b('The halogens of group 17. Melting and boiling points in °C at normal air pressure.', 'Die Halogene der Gruppe 17 (VII. Hauptgruppe). Schmelz- und Siedetemperaturen in °C bei normalem Luftdruck.'),
      head: [b('Molecule', 'Molekül'), b('Electrons per molecule', 'Elektronen pro Molekül'), b('Melts at', 'Schmilzt bei'), b('Boils at', 'Siedet bei'), b('At 20 °C', 'Bei 20 °C')],
      rows: [
        { cells: ['{{F2}}', '18', '−219.7', '−188.1', b('gas', 'Gas')] },
        { cells: ['{{Cl2}}', '34', '−101.5', '−34.0', b('gas', 'Gas')] },
        { cells: ['{{Br2}}', '70', '−7.2', '58.8', b('liquid', 'flüssig')], mystery: true },
        { cells: ['{{I2}}', '106', '113.7', '184.3', b('solid', 'fest')] },
      ],
      numeric: [1, 2, 3],
    },
    clash: b('A liquid or a solid only holds together if its particles attract each other. But these molecules have no charged ends at all, and the larger ones hold together far better than the small ones. What pulls bromine molecules together, and more strongly than chlorine\'s?',
      'Eine Flüssigkeit oder ein Feststoff hält nur zusammen, wenn sich die Teilchen gegenseitig anziehen. Diese Moleküle haben aber gar keine geladenen Enden, und die größeren halten viel besser zusammen als die kleinen. Was zieht Brommoleküle zueinander, und stärker als die des Chlors?'),
    question: {
      id: 'u8-puzzle', unit: 8, kind: 'choice', format: 'predict', withConfidence: true, evidence: 'predict',
      concepts: ['u8.instant-dipole', 'u8.dispersion'], targets: ['nonpolar-no-attraction', 'weight-holds-down'],
      prompt: b('Your best guess:', 'Deine beste Vermutung:'),
      options: [
        { text: b('Nothing: molecules without charged ends cannot attract each other', 'Nichts: Moleküle ohne geladene Enden können sich nicht anziehen'), mis: 'nonpolar-no-attraction' },
        { text: b('Brief, shifting charges in the electron clouds; bigger clouds pull harder', 'Kurzlebige, wechselnde Ladungen in den Elektronenwolken; größere Wolken ziehen stärker'), correct: true },
        { text: b('Bromine molecules join into long chains through extra bonds', 'Brommoleküle verbinden sich über zusätzliche Bindungen zu langen Ketten') },
        { text: b('Their weight: heavy molecules are too heavy to fly off', 'Ihr Gewicht: Schwere Moleküle sind zu schwer, um wegzufliegen'), mis: 'weight-holds-down' },
      ],
      explain: b('The electrons in a molecule are always moving. At any instant the cloud can be a little lopsided, one side slightly negative (δ−), the other slightly positive (δ+): a temporary dipole. That pushes on the electrons of the next molecule, which turns lopsided too, and the two attract. Bigger electron clouds are pushed around more easily, so the attraction grows from F₂ (18 electrons) to I₂ (106). This is the [[dispersion]] force. Weight alone holds nothing together; the attraction does.',
        'Die Elektronen in einem Molekül bewegen sich ständig. In jedem Augenblick kann die Wolke etwas schief sein, eine Seite leicht negativ (δ−), die andere leicht positiv (δ+): ein kurzlebiger (temporärer) Dipol. Er drückt auf die Elektronen des nächsten Moleküls, das dadurch ebenfalls schief wird, und die beiden ziehen sich an. Größere Elektronenwolken lassen sich leichter verschieben, also wächst die Anziehung von F₂ (18 Elektronen) bis I₂ (106). Das ist die [[dispersion]]. Das Gewicht allein hält nichts zusammen; das tut die Anziehung.'),
    } as ChoiceItem,
    after: b('Next: watch the electron clouds flicker, then heat and cool real substances.', 'Als Nächstes: Sieh zu, wie die Elektronenwolken flackern, dann erhitze und kühle echte Stoffe.'),
  },

  explore: {
    title: b('The Particle Box', 'Die Teilchenbox'),
    intro: b('Each ball, dumbbell or chain is one molecule (for the noble gases, one atom), and none of them carries a charge. The slider sets the temperature; whether the box shows a solid, a liquid or a gas follows the measured melting and boiling points. The electron-cloud view shows what the electrons do: red marks where a particle is slightly negative for an instant (δ−, δ being the Greek letter delta, "a small part of a charge"), blue where it is slightly positive (δ+). The flicker is a model of something far too fast to see; the temperatures are measured.',
      'Jede Kugel, Hantel oder Kette ist ein Molekül (bei den Edelgasen ein Atom), und keines davon trägt eine Ladung. Der Regler stellt die Temperatur ein; ob die Box einen Feststoff, eine Flüssigkeit oder ein Gas zeigt, folgt den gemessenen Schmelz- und Siedetemperaturen. Die Ansicht „Elektronenwolken“ zeigt, was die Elektronen tun: Rot markiert, wo ein Teilchen für einen Augenblick leicht negativ ist (δ−, δ ist das griechische Delta, „ein Teil einer Ladung“), Blau, wo es leicht positiv ist (δ+). Das Flackern ist ein Modell für etwas viel zu Schnelles, um es zu sehen; die Temperaturen sind gemessen.'),
    tasks: [
      { id: 'clouds', key: true, text: b('Switch on the electron-cloud view and watch one molecule flicker. What does the molecule next to it do?', 'Schalte die Ansicht „Elektronenwolken“ ein und beobachte ein Molekül beim Flackern. Was macht das Molekül daneben?') },
      { id: 'noble', key: true, text: b('Put argon and xenon side by side and cool them slowly. Which one turns liquid first?', 'Stell Argon und Xenon nebeneinander und kühle sie langsam ab. Welches wird zuerst flüssig?') },
      { id: 'boil', key: true, text: b('Heat a liquid past its boiling point. What do the molecules do, and what happens to the atoms inside each molecule?', 'Erhitze eine Flüssigkeit über ihre Siedetemperatur. Was machen die Moleküle, und was passiert mit den Atomen in jedem Molekül?') },
      { id: 'shape', key: true, text: b('Compare pentane, a chain, with neopentane, a compact ball, at about 20 °C. Both are C₅H₁₂.', 'Vergleiche Pentan, eine Kette, mit Neopentan, einer kompakten Kugel, bei etwa 20 °C. Beide sind C₅H₁₂.') },
      { id: 'halogens', text: b('Load fluorine, chlorine, bromine and iodine one after the other at 20 °C.', 'Lade Fluor, Chlor, Brom und Iod nacheinander bei 20 °C.') },
      { id: 'alkanes', challenge: true, text: b('Find the first chain of the alkane family (methane, ethane, propane, …) that is a liquid at room temperature, between 15 and 30 °C.', 'Finde die erste Kette der Alkane (Methan, Ethan, Propan, …), die bei Raumtemperatur flüssig ist, zwischen 15 und 30 °C.') },
    ],
    notes: {
      clouds: b('When one molecule turns lopsided for an instant (a temporary dipole), its δ− side pushes the neighbour\'s electrons away, so the neighbour\'s facing side turns δ+: an [[induced-dipole]]. Opposite sides face each other, so the two attract. This is the dispersion force, also called the London force or van der Waals force.',
        'Wird ein Molekül für einen Augenblick schief (ein temporärer Dipol), drückt seine δ−-Seite die Elektronen des Nachbarn weg, und dessen zugewandte Seite wird δ+: ein [[induced-dipole]]. Entgegengesetzte Seiten stehen sich gegenüber, also ziehen sich die beiden an. Das ist die Dispersionskraft. Viele Schulbücher sagen Van-der-Waals-Kräfte (manche meinen damit alle Kräfte zwischen Molekülen) oder London-Kräfte. In der Klausur nimmst du den Begriff aus deinem Unterricht und erklärst ihn mit dem temporären und dem induzierten Dipol.'),
      noble: b('Xenon, with 54 electrons, turns liquid at −108.1 °C; argon, with 18, only at −185.8 °C. Single atoms, no bonds between them and no permanent charges: dispersion is all that holds these liquids together, and the bigger cloud holds on harder.',
        'Xenon mit 54 Elektronen wird bei −108,1 °C flüssig, Argon mit 18 erst bei −185,8 °C. Einzelne Atome, keine Bindungen zwischen ihnen und keine festen Ladungen: Nur die Dispersion hält diese Flüssigkeiten zusammen, und die größere Wolke hält fester.'),
      boil: b('Above the boiling point the molecules fly apart from each other, but the atoms inside each molecule stay together. Boiling overcomes the weak attraction between molecules, not the bonds inside them.',
        'Oberhalb der Siedetemperatur fliegen die Moleküle auseinander, die Atome in jedem Molekül bleiben aber zusammen. Beim Sieden wird die schwache Anziehung zwischen den Molekülen überwunden, nicht die Bindungen in ihnen.'),
      shape: b('Pentane boils at 36.1 °C, neopentane at 9.5 °C, with exactly the same atoms. The chain lies alongside its neighbours over its whole length; the compact ball touches them at only a few points, and dispersion acts only where molecules touch.',
        'Pentan siedet bei 36,1 °C, Neopentan bei 9,5 °C, mit genau denselben Atomen. Die Kette liegt auf ganzer Länge an ihren Nachbarn an; die kompakte Kugel berührt sie nur an wenigen Stellen, und Dispersion wirkt nur dort, wo sich Moleküle berühren.'),
      halogens: b('Gas, gas, liquid, solid: the more electrons per molecule (18, 34, 70, 106), the stronger the dispersion and the higher the melting and boiling points.',
        'Gas, Gas, Flüssigkeit, Feststoff: Je mehr Elektronen pro Molekül (18, 34, 70, 106), desto stärker die Dispersion und desto höher die Schmelz- und Siedetemperaturen.'),
      alkanes: b('Butane (34 electrons) boils at −0.5 °C, so it is a gas at room temperature. Pentane (42 electrons) boils at 36.1 °C: the first liquid. Each extra CH₂ group adds 8 electrons and a little more length.',
        'Butan (34 Elektronen) siedet bei −0,5 °C und ist bei Raumtemperatur ein Gas. Pentan (42 Elektronen) siedet bei 36,1 °C: die erste Flüssigkeit. Jede weitere CH₂-Gruppe bringt 8 Elektronen und etwas mehr Länge.'),
    },
    check: {
      id: 'u8-check', unit: 8, kind: 'rank', format: 'rank', evidence: 'predict', concepts: ['u8.dispersion', 'u8.shape'], mis: 'dispersion-direction',
      prompt: b('Rank by boiling point, highest first: octane (C₈H₁₈, a chain), pentane (C₅H₁₂, a chain), neopentane (C₅H₁₂, a compact ball), propane (C₃H₈).',
        'Ordne nach Siedetemperatur, die höchste zuerst: Octan (C₈H₁₈, eine Kette), Pentan (C₅H₁₂, eine Kette), Neopentan (C₅H₁₂, eine kompakte Kugel), Propan (C₃H₈).'),
      order: [b('octane', 'Octan'), b('pentane', 'Pentan'), b('neopentane', 'Neopentan'), b('propane', 'Propan')],
      explain: b('125.6, 36.1, 9.5 and −42.1 °C. More electrons raise the boiling point (octane 66, the two C₅H₁₂ 42, propane 26), and among molecules with the same electrons the chain beats the ball.',
        '125,6; 36,1; 9,5 und −42,1 °C. Mehr Elektronen erhöhen die Siedetemperatur (Octan 66, die beiden C₅H₁₂ je 42, Propan 26), und bei gleich vielen Elektronen gewinnt die Kette gegenüber der Kugel.'),
    } as RankItem,
  },

  predictions: [
    {
      item: {
        id: 'u8-kr', unit: 8, kind: 'choice', format: 'predict', withConfidence: true, evidence: 'predict',
        concepts: ['u8.dispersion'], targets: ['dispersion-direction', 'nonpolar-no-attraction'],
        prompt: b('Krypton has 36 electrons, between argon (18 electrons, boils at −185.8 °C) and xenon (54 electrons, boils at −108.1 °C). Where does krypton boil?',
          'Krypton hat 36 Elektronen, zwischen Argon (18 Elektronen, siedet bei −185,8 °C) und Xenon (54 Elektronen, siedet bei −108,1 °C). Wo siedet Krypton?'),
        options: [
          { text: b('At about −200 °C, below argon', 'Bei etwa −200 °C, unter Argon'), mis: 'dispersion-direction' },
          { text: b('At about −153 °C, between argon and xenon', 'Bei etwa −153 °C, zwischen Argon und Xenon'), correct: true },
          { text: b('At about −108 °C, the same as xenon', 'Bei etwa −108 °C, wie Xenon') },
          { text: b('Never: noble-gas atoms do not attract, so they cannot turn liquid', 'Gar nicht: Edelgasatome ziehen sich nicht an, also werden sie nie flüssig'), mis: 'nonpolar-no-attraction' },
        ],
        explain: b('Krypton boils at −153.4 °C. Its 36 electrons make a cloud bigger than argon\'s and smaller than xenon\'s, so the dispersion force, and with it the boiling point, falls in between.',
          'Krypton siedet bei −153,4 °C. Seine 36 Elektronen bilden eine Wolke, die größer ist als die des Argons und kleiner als die des Xenons; also liegt die Dispersion und mit ihr die Siedetemperatur dazwischen.'),
      } as ChoiceItem,
      show: { engine: 'box', sub: 'Kr', compare: 'Ar', temp: -155 },
      revealText: b('At −155 °C krypton is already a liquid while argon is still a gas: krypton boils at −153.4 °C, argon at −185.8 °C. Down the noble gases each new shell makes a bigger cloud that is pushed lopsided more easily: neon −246.1 °C, argon −185.8 °C, krypton −153.4 °C, xenon −108.1 °C.',
        'Bei −155 °C ist Krypton schon flüssig, Argon noch ein Gas: Krypton siedet bei −153,4 °C, Argon bei −185,8 °C. In der Gruppe der Edelgase macht jede neue Schale die Wolke größer und leichter verschiebbar: Neon −246,1 °C, Argon −185,8 °C, Krypton −153,4 °C, Xenon −108,1 °C.'),
      extra: {
        title: b('Place krypton between its neighbours', 'Krypton zwischen seine Nachbarn setzen'),
        steps: [
          b('Line up what you know: argon, 18 electrons, boils at −186 °C; xenon, 54 electrons, boils at −108 °C.', 'Ordne, was du weißt: Argon, 18 Elektronen, siedet bei −186 °C; Xenon, 54 Elektronen, siedet bei −108 °C.'),
          b('More electrons make a bigger cloud, a stronger dispersion force and a higher boiling point.', 'Mehr Elektronen bedeuten eine größere Wolke, eine stärkere Dispersion und eine höhere Siedetemperatur.'),
          b('Krypton\'s 36 electrons lie between 18 and 54, so its boiling point should lie between −186 °C and −108 °C.', 'Kryptons 36 Elektronen liegen zwischen 18 und 54, also sollte seine Siedetemperatur zwischen −186 °C und −108 °C liegen.'),
          b('Measured: −153 °C.', 'Gemessen: −153 °C.'),
        ],
      },
    },
    {
      item: {
        id: 'u8-octane', unit: 8, kind: 'choice', format: 'predict', withConfidence: true, evidence: 'transfer',
        concepts: ['u8.shape', 'u8.dispersion'], targets: ['weight-holds-down'],
        prompt: b('Octane (C₈H₁₈), one of the substances in petrol, has 66 electrons per molecule and weighs 114 g/mol. Bromine (Br₂) has 70 electrons and weighs 160 g/mol; it boils at 58.8 °C. Which boils higher?',
          'Octan (C₈H₁₈), einer der Stoffe im Benzin, hat 66 Elektronen pro Molekül und eine molare Masse von 114 g/mol. Brom (Br₂) hat 70 Elektronen und 160 g/mol; es siedet bei 58,8 °C. Welcher Stoff siedet höher?'),
        options: [
          { text: b('Bromine: its heavier molecules are harder to lift into the gas', 'Brom: Seine schwereren Moleküle lassen sich schwerer ins Gas heben'), mis: 'weight-holds-down' },
          { text: b('Bromine: it has more electrons per molecule', 'Brom: Es hat mehr Elektronen pro Molekül') },
          { text: b('Octane: its long chain touches its neighbours along its whole length', 'Octan: Seine lange Kette berührt die Nachbarn auf ganzer Länge'), correct: true },
          { text: b('Neither: almost the same electrons, about the same boiling point', 'Keiner: Fast gleich viele Elektronen, etwa gleiche Siedetemperatur') },
        ],
        explain: b('Octane boils at 125.6 °C, bromine at 58.8 °C. Their electron counts are close, but octane is a chain of 26 atoms that lies alongside its neighbours, while Br₂ is a small dumbbell with little surface. Weight is not what counts: bromine is the heavier one and boils lower.',
          'Octan siedet bei 125,6 °C, Brom bei 58,8 °C. Die Elektronenzahlen sind ähnlich, aber Octan ist eine Kette aus 26 Atomen, die an ihren Nachbarn anliegt, während Br₂ eine kleine Hantel mit wenig Oberfläche ist. Auf das Gewicht kommt es nicht an: Brom ist schwerer und siedet trotzdem niedriger.'),
      } as ChoiceItem,
      show: { engine: 'box', sub: 'C8H18', compare: 'Br2', temp: 80 },
      revealText: b('At 80 °C bromine is already a gas and octane is still a liquid: octane boils about 67 °C higher. Electron count is a good guide when the molecules have similar shapes. A long chain offers far more contact, and contact is where dispersion acts.',
        'Bei 80 °C ist Brom schon gasförmig und Octan noch flüssig: Octan siedet etwa 67 °C höher. Die Elektronenzahl ist ein guter Anhaltspunkt, wenn die Moleküle ähnlich geformt sind. Eine lange Kette bietet viel mehr Kontakt, und Dispersion wirkt dort, wo sich Moleküle berühren.'),
      extra: {
        title: b('Electrons first, then shape', 'Erst die Elektronen, dann die Form'),
        steps: [
          b('Check the electrons: 66 against 70, almost the same. Electron count alone does not settle it.', 'Prüfe die Elektronen: 66 gegenüber 70, fast gleich. Die Elektronenzahl allein entscheidet hier nicht.'),
          b('Check the shape: octane is a chain of eight carbon atoms with hydrogen atoms all along it; Br₂ is just two atoms.', 'Prüfe die Form: Octan ist eine Kette aus acht Kohlenstoffatomen mit Wasserstoffatomen auf ganzer Länge; Br₂ besteht nur aus zwei Atomen.'),
          b('Dispersion acts where molecules touch. A long chain lies alongside its neighbours and touches them far more.', 'Dispersion wirkt dort, wo sich Moleküle berühren. Eine lange Kette liegt an ihren Nachbarn an und berührt sie viel stärker.'),
          b('So octane boils higher: 125.6 °C against 58.8 °C. The heavier bromine boils lower, so weight is not what counts.', 'Also siedet Octan höher: 125,6 °C gegenüber 58,8 °C. Das schwerere Brom siedet niedriger; auf das Gewicht kommt es also nicht an.'),
        ],
      },
    },
  ],

  examples: [
    {
      title: b('Butane in a lighter', 'Butan im Feuerzeug'), tag: 'C4H10', show: { engine: 'box', sub: 'C4H10', temp: -20 },
      numbers: [{ v: '−0.5 °C', label: b('boiling point of butane', 'Siedetemperatur von Butan') }, { v: '22 kJ/mol', label: b('to boil butane', 'zum Verdampfen von Butan') }, { v: '345 kJ/mol', label: b('to break C–C bonds', 'zum Spalten von C–C-Bindungen') }],
      body: b('A lighter holds butane as a liquid under pressure; press the button and it boils into a gas, even at room temperature. Boiling one mole of butane (a fixed, very large number of molecules, unit 12) takes about 22 kJ, kilojoules of energy. Breaking one mole of its C–C bonds would take 345 kJ, and boiling breaks none of them: it only pulls whole molecules apart.',
        'Ein Feuerzeug enthält Butan unter Druck als Flüssigkeit; drückst du den Knopf, siedet es zu einem Gas, sogar bei Raumtemperatur. Ein Mol Butan (eine feste, sehr große Zahl von Molekülen, Einheit 12) zu verdampfen, kostet etwa 22 kJ (Kilojoule). Ein Mol seiner C–C-Bindungen zu spalten, würde 345 kJ kosten, und beim Sieden wird keine davon gespalten: Es trennt nur ganze Moleküle voneinander.'),
      soWhat: b('The flame is different: burning does break the C–C and C–H bonds, as butane reacts with oxygen. That is why the flame gives out far more energy than boiling took.',
        'Die Flamme ist etwas anderes: Beim Verbrennen werden die C–C- und C–H-Bindungen tatsächlich gespalten, denn Butan reagiert mit Sauerstoff. Deshalb gibt die Flamme viel mehr Energie ab, als das Sieden gekostet hat.'),
    },
    {
      title: b('Iodine, a solid made of molecules', 'Iod, ein Feststoff aus Molekülen'), tag: 'I2', show: { engine: 'box', sub: 'I2', temp: 20, view: 'clouds' },
      numbers: [{ v: '106', label: b('electrons per I₂ molecule', 'Elektronen pro I₂-Molekül') }, { v: '113.7 °C', label: b('melting point', 'Schmelztemperatur') }, { v: '184.3 °C', label: b('boiling point', 'Siedetemperatur') }],
      body: b('Iodine is made of I₂ molecules, just as chlorine is made of Cl₂. But each I₂ carries 106 electrons, against 34 for Cl₂: a large, loosely held cloud that is easily pushed lopsided. The dispersion between I₂ molecules is strong enough to hold them in a crystal at room temperature.',
        'Iod besteht aus I₂-Molekülen, so wie Chlor aus Cl₂. Aber jedes I₂ trägt 106 Elektronen, Cl₂ nur 34: eine große, locker gebundene Wolke, die sich leicht verschieben lässt. Die Dispersion zwischen den I₂-Molekülen ist stark genug, sie bei Raumtemperatur in einem Kristall zu halten.'),
      soWhat: b('Warm a few iodine crystals gently and a violet vapour rises; on cold glass it forms crystals again. Whole I₂ molecules leave and come back, and the I–I bond inside each one, weaker even than chlorine\'s, survives the trip.',
        'Erwärmt man ein paar Iodkristalle vorsichtig, steigt violetter Dampf auf; an kaltem Glas bilden sich wieder Kristalle. Ganze I₂-Moleküle verlassen den Kristall und kehren zurück, und die I–I-Bindung in jedem Molekül, sogar schwächer als die im Chlor, übersteht das.'),
    },
    {
      title: b('Same electrons, different boiling points', 'Gleich viele Elektronen, verschiedene Siedetemperaturen'), tag: 'CH4', show: { engine: 'box', sub: 'CH4', compare: 'Ne', temp: -170 },
      numbers: [{ v: '10', label: b('electrons in each', 'Elektronen in jedem der beiden') }, { v: '−161.5 °C', label: b('boiling point of methane', 'Siedetemperatur von Methan') }, { v: '−246.1 °C', label: b('boiling point of neon', 'Siedetemperatur von Neon') }],
      body: b('Counting electrons is a good first guide, but not the whole story. Neon and methane both have 10 electrons, yet methane boils about 85 °C higher. Neon\'s electrons are held tightly by one nucleus with charge +10; methane\'s are spread over five atoms, easier to push lopsided, and the molecule is bigger, with more surface.',
        'Elektronen zählen ist ein guter erster Anhaltspunkt, aber nicht die ganze Geschichte. Neon und Methan haben beide 10 Elektronen, trotzdem siedet Methan etwa 85 °C höher. Neons Elektronen hält ein einziger Kern mit der Ladung +10 fest; die des Methans verteilen sich über fünf Atome, lassen sich leichter verschieben, und das Molekül ist größer, mit mehr Oberfläche.'),
      soWhat: b('How easily a cloud is pushed lopsided is called its [[polarizability]]. "More electrons, stronger dispersion" is safe when you compare similar particles, such as the atoms of one group or a series of chains.',
        'Wie leicht sich eine Wolke verschieben lässt, heißt [[polarizability]]. In der Klausur ist „mehr Elektronen, stärkere Van-der-Waals-Kräfte“ sicher, wenn du ähnliche Teilchen vergleichst, etwa die Atome einer Gruppe oder eine Reihe von Alkanen.'),
    },
  ],

  flaw: {
    id: 'u8-flaw', unit: 8, kind: 'flaw', format: 'flaw', evidence: 'transfer', concepts: ['u8.boiling'], targets: ['boiling-breaks-bonds'],
    prompt: b('Where does this reasoning first go wrong?', 'Wo geht diese Überlegung zum ersten Mal schief?'),
    lines: [
      b('Liquid bromine is made of Br₂ molecules: two bromine atoms that share a pair of electrons.', 'Flüssiges Brom besteht aus Br₂-Molekülen: zwei Bromatome, die sich ein Elektronenpaar teilen.'),
      b('Br₂ is nonpolar, so its molecules attract each other only by dispersion.', 'Br₂ ist unpolar, also ziehen sich seine Moleküle nur durch Dispersion an.'),
      b('Heating gives the molecules more energy, and at 58.8 °C they break free of each other: bromine boils.', 'Erhitzen gibt den Molekülen mehr Energie, und bei 58,8 °C lösen sie sich voneinander: Brom siedet.'),
      b('So when bromine boils, the Br–Br bonds break, and the vapour is made of single bromine atoms.', 'Beim Sieden brechen also die Br–Br-Bindungen, und der Dampf besteht aus einzelnen Bromatomen.'),
      b('Turning the vapour back into a liquid therefore means joining the atoms into pairs again.', 'Den Dampf wieder zu verflüssigen, bedeutet deshalb, die Atome wieder zu Paaren zu verbinden.'),
    ],
    flaw: 3,
    alsoFalse: [4],
    near: [{ step: 2, note: b('Step 3 is true: the molecules do break free, but of each other. Step 4 mixes up which attraction is overcome.', 'Schritt 3 stimmt: Die Moleküle lösen sich, aber voneinander. Schritt 4 verwechselt, welche Anziehung überwunden wird.') }],
    explain: b('Step 4 is the first wrong step. Step 1 is true: bromine is made of Br₂ molecules. Step 2 is true: they attract by dispersion only. Step 3 is true: at 58.8 °C they break free of each other. But boiling overcomes the attraction between the molecules, not the bond inside each one: the brown vapour is still Br₂. Step 5 only follows from step 4: the molecules stay whole, so condensing just brings them back together.',
      'Schritt 4 ist der erste falsche Schritt. Schritt 1 stimmt: Brom besteht aus Br₂-Molekülen. Schritt 2 stimmt: Sie ziehen sich nur durch Dispersion an. Schritt 3 stimmt: Bei 58,8 °C lösen sie sich voneinander. Beim Sieden wird aber die Anziehung zwischen den Molekülen überwunden, nicht die Bindung in jedem Molekül: Der braune Dampf besteht weiter aus Br₂. Schritt 5 folgt nur aus Schritt 4: Die Moleküle bleiben ganz, also bringt das Kondensieren sie nur wieder zusammen.'),
  } as FlawItem,

  deeper: {
    id: 'u8-deeper', unit: 8, kind: 'estimate', format: 'estimate', evidence: 'transfer', concepts: ['u8.dispersion', 'u8.state'],
    prompt: b('In the straight-chain alkanes each extra CH₂ group adds 8 electrons and a little length. Hexane (C₆H₁₄) boils at 68.7 °C and octane (C₈H₁₈) at 125.6 °C. Heptane (C₇H₁₆) sits between them. Estimate its boiling point.',
      'Bei den unverzweigten Alkanen bringt jede weitere CH₂-Gruppe 8 Elektronen und etwas Länge. Hexan (C₆H₁₄) siedet bei 68,7 °C, Octan (C₈H₁₈) bei 125,6 °C. Heptan (C₇H₁₆) liegt dazwischen. Schätze seine Siedetemperatur.'),
    min: 0, max: 160, step: 1, answer: 98, tolerance: 4, suffix: ' °C',
    near: [
      { value: 126, tol: 3, note: b('That is octane, which has one CH₂ group more than heptane.', 'Das ist Octan, das eine CH₂-Gruppe mehr hat als Heptan.') },
      { value: 69, tol: 3, note: b('That is hexane, which has one CH₂ group less than heptane.', 'Das ist Hexan, das eine CH₂-Gruppe weniger hat als Heptan.') },
    ],
    explain: b('Heptane boils at 98.4 °C. Halfway between 68.7 and 125.6 is about 97 °C, very close. Here each CH₂ group raises the boiling point by roughly 30 °C, a little less with every step as the chains get longer.',
      'Heptan siedet bei 98,4 °C. Die Mitte zwischen 68,7 und 125,6 liegt bei etwa 97 °C, sehr nah dran. Hier hebt jede CH₂-Gruppe die Siedetemperatur um rund 30 °C, mit jedem Schritt etwas weniger, je länger die Ketten werden.'),
  } as EstimateItem,

  explain: {
    prompt: b('In your own words: what holds nonpolar molecules such as bromine together in a liquid, and what makes that attraction stronger or weaker?', 'In eigenen Worten: Was hält unpolare Moleküle wie Brom in einer Flüssigkeit zusammen, und was macht diese Anziehung stärker oder schwächer?'),
    ideas: [
      { id: 'flicker', concept: 'u8.instant-dipole', idea: b('Moving electrons make a molecule briefly lopsided (a temporary dipole), which makes its neighbour lopsided too, so they attract', 'Die bewegten Elektronen machen ein Molekül kurz schief (ein temporärer Dipol), das macht den Nachbarn ebenfalls schief, und die beiden ziehen sich an'),
        contra: NONPOLAR_NONE,
        // The mechanism: a temporary, flickering or induced dipole, or electrons shifting to one side for a moment.
        // The bare names "dispersion", "London" or "van der Waals" do not pass.
        en: /((temporar|momentar|instantaneous|brief|short-lived|fleeting|flicker|fluctuat|transient|spontaneous|random)\w*.{0,30}(dipole|lopsided|uneven|imbalance|charged|charges?|δ|delta)|induc\w*.{0,20}(dipole|lopsided|charge)|(dipole|lopsided|uneven).{0,40}(induc|neighbou?r|next (one|molecule)|the other molecule)|electrons?.{0,40}(move|shift|slosh|bunch|gather|pile up|end up).{0,40}(one (side|end)|lopsided|uneven|for a moment|briefly|at any (instant|moment)|δ)|(one (side|end)|part) (is|becomes|turns|gets) (slightly |briefly |for a moment |a bit |a little )*(negative|positive|δ)|neighbou?r\w*( \w+){0,4} (also |too )?(lopsided|polari[sz]ed|becomes a dipole))/,
        de: /((temporär|kurzlebig|kurzzeitig|spontan|momentan|flackernd|schwankend|zufällig|vorübergehend)\w*.{0,30}(dipol|schief|ungleich|ladung|δ|delta)|(induziert|influenziert)\w*.{0,20}(dipol|ladung)|dipol.{0,40}(induz|influenz|nachbar|nächste)|elektronen.{0,40}(verschieb|bewegen|sammeln|häufen|ballen).{0,40}(einer seite|einem ende|schief|ungleich|kurz|augenblick|δ)|(eine seite|ein ende|ein teil) (ist|wird) (kurz |kurzzeitig |für einen (augenblick|moment) |leicht |etwas |ein bisschen )*(negativ|positiv|δ)|(seite|ende)\S*( \S+){0,3} (kurz|kurzzeitig|für einen (augenblick|moment)|leicht|etwas|ein bisschen) (\S+ )?(negativ|positiv)|nachbar\S*( \S+){0,4} (auch |ebenfalls )?(schief|polarisiert|zum dipol))/ },
      { id: 'size', concept: 'u8.dispersion', idea: b('More electrons, a bigger cloud: stronger dispersion', 'Mehr Elektronen, eine größere Wolke: stärkere Dispersion'),
        contra: WEIGHT,
        en: /((more|lots of|many|number of|bigger|larger) (\w+ )?(electrons?|electron clouds?|clouds?).{0,60}(strong|more attract|attract\w* more|pull\w* (more|harder)|grow|increas|higher|bigger|larger|raise)|(strong|grow|increas|rise|rises)\w*.{0,50}(more|number of|bigger|larger) (\w+ )?(electrons?|clouds?)|polari[sz]ab|the (more|bigger|larger) (the )?(electrons?|clouds?|molecules?|atoms?)\b.{0,40}the (strong|higher|more)|(more|bigger) (electrons?|clouds?|molecules?).{0,20}(→|->|=)\s*(strong|higher)|^(the )?(more|bigger|larger) (\w+ )?(electrons?|electron clouds?|clouds?)$)/,
        de: /((mehr|viele|vielen|größere?n?|anzahl der|zahl der) (\w+ )?(elektronen|elektronenwolken?|elektronenhüllen?|wolken?|hüllen?).{0,60}(stärker|mehr anzieh|größer|höher|steig|wächst|nimmt zu)|(stärker|größer|höher|wächst|steigt|nimmt zu)\w*.{0,50}(mehr|größere?n?|anzahl der|zahl der) (\w+ )?(elektronen|wolken?|hüllen?)|polarisierbar|je (mehr|größer)\w* .{0,40}desto (stärker|höher|größer)|(mehr|größere?) (elektronen|wolken?|moleküle).{0,20}(→|->|=)\s*(stärker|höher))/ },
      { id: 'shape', concept: 'u8.shape', idea: b('Long molecules touch their neighbours more than compact ones, so they attract more', 'Lange Moleküle berühren ihre Nachbarn stärker als kompakte, also ziehen sie sich stärker an'),
        en: /((long|longer|chains?|stretched|elongated|straight|unbranched|flat)\w*.{0,60}(touch|contact|surface|area|lie along|lie alongside|line up|closer|more attract|attract\w* more|stick)|(contact|touching) (area|surface|points?)|(more|bigger|larger|greater) (contact|surface|area)|(surface|area).{0,40}(more|bigger|larger|greater|strong)|(compact|branched|ball|balls|spher\w*|round)\w*.{0,60}(less|fewer|smaller|weaker|lower|only a few|touch))/,
        de: /((lang|länger|kette|ketten|gestreckt|unverzweigt|flach)\w*.{0,60}(berühr|kontakt|oberfläche|fläche|anlieg|liegen an|näher|stärker an)|(kontakt|berührungs)fläche|(mehr|größere?) (kontakt|oberfläche|berührung)|oberfläche.{0,40}(mehr|größer|stärker)|(kompakt|verzweigt|kugel|kugelig|rund)\w*.{0,60}(weniger|kleiner|schwächer|niedriger|nur an wenigen|berühr))/ },
      { id: 'boil', concept: 'u8.state', idea: b('The stronger the attraction, the higher the boiling point: gas, liquid or solid at room temperature', 'Je stärker die Anziehung, desto höher die Siedetemperatur: gasförmig, flüssig oder fest bei Raumtemperatur'),
        en: /((strong|more|tight)\w*.{0,60}(higher|raises?|raising) (the )?(boiling|melting)|(higher|raise\w*) (the )?(boiling|melting) (point|temperature).{0,60}(strong|attract|energy|forces?|dispersion|hold)|(more energy|harder).{0,40}(separate|pull\w* (\w+ ){0,2}apart|to boil|to evaporate|to melt)|energy.{0,60}higher (the )?(boiling|melting)|(higher|more) (temperature|heat|energy) (is needed )?to (boil|melt|separate|evaporate|pull)|(liquid|solid|gas)\w* because .{0,60}(strong|weak|attract|forces?|dispersion)|strong\w*.{0,50}high(er)? (boiling|melting) (point|temperature)|(boils?|melts?) (at a )?higher.{0,60}(strong|attract|forces?|dispersion|hold)|(liquid|solid) at room temperature.{0,60}(strong|attract|forces?|dispersion|hold)|(strong|attract|forces?|dispersion).{0,60}(liquid|solid) at room temperature)/,
        de: /((stärker|mehr|fester)\w*.{0,60}(höher|steigt|steigen)\w*.{0,20}(siede|schmelz)|(siede|schmelz)(punkt|temperatur)\w*.{0,30}(höher|steigt).{0,60}(stärker|anzieh|kräfte|energie|dispersion|zusammen)|(mehr energie|schwerer).{0,40}(trennen|auseinander|sieden|verdampf|schmelz)|höhere (temperatur|energie|wärme).{0,30}(sieden|schmelzen|verdampfen|trennen)|stark\w*.{0,50}(hohe|höhere)[nr]? (siede|schmelz)(punkt|temperatur)|höhere[nr]? (siede|schmelz)(punkt|temperatur).{0,40}(stärker|anzieh|wechselwirk|kräfte|dispersion)|(siedet|schmilzt) (erst )?(bei )?höher.{0,60}(stärker|anzieh|kräfte|dispersion)|(stärker|anzieh|kräfte|dispersion).{0,60}(flüssig|fest) bei raumtemperatur|(flüssig|fest) bei raumtemperatur.{0,60}(stärker|anzieh|kräfte|dispersion))/ },
      { id: 'whole', concept: 'u8.boiling', idea: b('Boiling separates whole molecules; the bonds inside them stay intact', 'Beim Sieden trennen sich ganze Moleküle; die Bindungen in ihnen bleiben erhalten'),
        contra: BOIL_BREAKS,
        // Negations inside these alternatives are written out literally, so the matcher accepts them.
        en: /((boil|evaporat|vapori)\w*.{0,40}(separat|pull\w* (them )?apart|moves? apart|fly apart|whole molecules|molecules (apart|from each other|leave|escape)|between (the )?molecules)|(bonds?|atoms?) (inside|within|in) (the |each |a )?(molecules?|them).{0,30}(stay|remain|intact|unbroken|not broken|survive|together)|(does not break|doesn't break|don't break|do not break|never break)s? (the |any |their )?(covalent |chemical |internal )?bonds?|(no bonds|no covalent bonds|no chemical bonds|none of the bonds) (are |get |is )?(broken|break)|(intact|unbroken|whole) molecules)/,
        de: /((sied|verdampf)\w*.{0,40}(trenn|auseinander|ganze moleküle|moleküle voneinander|zwischen (den )?molekülen)|(bindungen|atombindungen|elektronenpaarbindungen|atome) (in|innerhalb) (den |der |des |einem |jedem )?(molekül\w*|ihnen).{0,30}(bleib|intakt|erhalten|nicht gespalten|nicht getrennt|nicht gebrochen|zusammen)|(keine atombindungen|keine bindungen|keine elektronenpaarbindungen|keine kovalenten bindungen) (gespalten|getrennt|gebrochen|aufgebrochen)|bindung\w* (werden |wird )?(dabei )?(nicht gespalten|nicht gebrochen|nicht aufgebrochen)|ganze moleküle)/ },
    ] as Idea[],
    tightened: b('Electrons are always moving, so at any instant a molecule can be slightly lopsided, a temporary dipole that makes the neighbouring molecule lopsided too, and the two attract. This is the dispersion force, also called the London or van der Waals force. It is stronger when there are more electrons, because a bigger cloud is pushed lopsided more easily, and long molecules attract more than compact ones because they touch their neighbours over more surface. The stronger the attraction, the more energy it takes to pull the molecules apart, so the higher the boiling point: fluorine and chlorine are gases at room temperature, bromine a liquid and iodine a solid. Boiling separates whole molecules from each other; the bonds inside them stay intact.',
      'Elektronen bewegen sich ständig, also kann ein Molekül in jedem Augenblick leicht schief sein, ein temporärer Dipol, der das Nachbarmolekül ebenfalls schief macht, und die beiden ziehen sich an. Das ist die Dispersionskraft, in vielen Schulbüchern Van-der-Waals- oder London-Kraft. Sie ist stärker, wenn mehr Elektronen da sind, weil sich eine größere Wolke leichter verschieben lässt, und lange Moleküle ziehen sich stärker an als kompakte, weil sie ihre Nachbarn über mehr Oberfläche berühren. Je stärker die Anziehung, desto mehr Energie braucht es, die Moleküle zu trennen, und desto höher ist die Siedetemperatur: Fluor und Chlor sind bei Raumtemperatur Gase, Brom ist flüssig und Iod fest. Beim Sieden trennen sich ganze Moleküle voneinander; die Bindungen in ihnen bleiben erhalten.'),
  },

  terms: ['dispersion', 'induced-dipole', 'polarizability', 'intermolecular-force', 'boiling-point'],

  readings: [
    {
      lang: 'en', kind: 'quick',
      title: b('Intermolecular bonding: van der Waals forces', 'Intermolecular bonding: van der Waals forces'), source: 'chemguide',
      url: 'https://www.chemguide.co.uk/atoms/bonding/vdw.html',
      lookFor: [
        b('Its list of noble-gas boiling points, from helium to radon. Do they rise the way the Particle Box showed? (It rounds krypton to −152 °C; the app uses −153.4 °C.)', ''),
        b('Why it says butane boils higher than its compact twin, 2-methylpropane. Is it the same reason as pentane against neopentane?', ''),
        b('How it describes an induced dipole. Does it match what the neighbour did in the electron-cloud view?', ''),
      ],
    },
    {
      lang: 'en', kind: 'deeper',
      title: b('Intermolecular Forces', 'Intermolecular Forces'), source: 'OpenStax Chemistry 2e, section 10.1',
      url: 'https://openstax.org/books/chemistry-2e/pages/10-1-intermolecular-forces',
      lookFor: [
        b('Table 10.1 gives the halogens\' melting and boiling points in kelvin (K: add 273 to the °C value). Convert bromine\'s 332 K and compare it with the 58.8 °C in this unit.', ''),
        b('Its three pentane isomers boil at 36 °C, 27 °C and 9.5 °C. Which shape goes with which number?', ''),
        b('The box on geckos: which experiment showed that they hold on by dispersion, not by suction or glue?', ''),
      ],
    },
    {
      lang: 'de', kind: 'quick',
      title: b('Van-der-Waals-Kräfte', 'Van-der-Waals-Kräfte'), source: 'Studyflix',
      url: 'https://studyflix.de/chemie-schueler/van-der-waals-krafte-1561',
      lookFor: [
        b('', 'Die drei Arten von Van-der-Waals-Kräften, die der Artikel aufzählt. Welche davon nennt diese Einheit Dispersion?'),
        b('', 'Was der Artikel über die Kettenlänge der Alkane sagt. Passt das zu Pentan, Hexan und Octan in der Teilchenbox?'),
        b('', 'Ob der Artikel sagt, dass Dispersion zwischen allen Teilchen wirkt, auch zwischen polaren. Was sagt diese Einheit dazu?'),
      ],
    },
  ],

  misconceptions: [
    { id: 'nonpolar-no-attraction', name: b('Nonpolar molecules do not attract each other', 'Unpolare Moleküle ziehen sich nicht an') },
    { id: 'boiling-breaks-bonds', name: b('Boiling breaks the bonds inside the molecules', 'Beim Sieden brechen die Bindungen in den Molekülen') },
    { id: 'weight-holds-down', name: b('Heavy molecules boil higher because they are harder to lift (weight, not attraction)', 'Schwere Moleküle sieden höher, weil sie schwerer anzuheben sind (Gewicht statt Anziehung)') },
    { id: 'dispersion-only-nonpolar', name: b('Dispersion acts only between nonpolar molecules', 'Dispersion wirkt nur zwischen unpolaren Molekülen') },
  ],

  glossary: {
    'induced-dipole': {
      en: 'induced dipole', de: 'induzierter Dipol', unit: 8,
      def: { en: 'A dipole created in a particle when a lopsided or charged neighbour pushes or pulls on its electrons.', de: 'Ein Dipol, der in einem Teilchen entsteht, wenn ein schiefer oder geladener Nachbar dessen Elektronen verschiebt.' },
      falseFriend: { en: 'Some German books say "influenzierter Dipol".', de: 'Manche Bücher sagen „influenzierter Dipol“; englisch „induced dipole“.' },
    },
    polarizability: {
      en: 'polarizability', de: 'Polarisierbarkeit', unit: 8,
      def: { en: 'How easily an electron cloud is pushed lopsided. Large, loosely held clouds are easy to polarize and attract more strongly by dispersion.', de: 'Wie leicht sich eine Elektronenwolke verschieben lässt. Große, locker gebundene Wolken sind leicht polarisierbar und ziehen sich durch Dispersion stärker an.' },
    },
    'intermolecular-force': {
      en: 'intermolecular force', de: 'zwischenmolekulare Kraft', unit: 8,
      def: { en: 'An attraction between separate molecules (or atoms), such as dispersion, dipole–dipole forces and hydrogen bonds. Far weaker than the bonds inside molecules.', de: 'Eine Anziehung zwischen einzelnen Molekülen (oder Atomen), etwa Dispersion, Dipol-Dipol-Kräfte und Wasserstoffbrücken. Viel schwächer als die Bindungen in den Molekülen.' },
      falseFriend: { en: 'German also says "zwischenmolekulare Wechselwirkungen"; some German books call them all "Van-der-Waals-Kräfte".', de: 'Auch „zwischenmolekulare Wechselwirkungen“; manche Schulbücher fassen alle unter „Van-der-Waals-Kräfte“ zusammen.' },
    },
    'boiling-point': {
      en: 'boiling point', de: 'Siedetemperatur', unit: 8,
      def: { en: 'The temperature at which a liquid boils at normal air pressure: its particles break free of each other throughout the liquid.', de: 'Die Temperatur, bei der eine Flüssigkeit bei normalem Luftdruck siedet: Ihre Teilchen lösen sich überall in der Flüssigkeit voneinander.' },
      falseFriend: { en: 'German says "Siedetemperatur" or "Siedepunkt"; both are fine.', de: 'Gleichbedeutend: Siedepunkt; englisch „boiling point“.' },
    },
  },
};
