// Unit 12 — Counting by weighing, on the Zoom Ladder (sample mode with compare).
// Numbers: every molar mass, amount and count is computed with src/content/stoich.ts (atomic masses from elements.ts,
// N_A = 6.02214076 × 10²³ mol⁻¹): Al 26.982, Cu 63.546, Au 196.967, Mg 24.305, Pb 207.21, Fe 55.845, Ag 107.868,
// C 12.011, H₂ 2.016, H₂O 18.015 g/mol. 100 g: Al 3.71 mol (2.23 × 10²⁴ atoms), Cu 1.57 mol (9.48 × 10²³),
// Au 0.508 mol (3.06 × 10²³); Au/Al 7.30. 0.5 mol Mg 12.15 g, Pb 103.6 g (ratio 8.53). 1 kg Fe 17.9 mol
// (1.08 × 10²⁵), 1 kg Al 37.1 mol (2.23 × 10²⁵), ratio 2.07. 5 g Au 0.0254 mol, 1.53 × 10²² atoms. 10 g: H₂ 4.96 mol
// (2.99 × 10²⁴), C 0.833 mol (5.01 × 10²³), H₂O 0.555 mol (3.34 × 10²³), Au 0.0508 mol (3.06 × 10²²). 20 g Cu
// 0.315 mol (1.90 × 10²³), 20 g Ag 0.185 mol (1.12 × 10²³). 1 u = 1/N_A g ≈ 1.66 × 10⁻²⁴ g.
// Densities (RSC Periodic Table, periodic-table.rsc.org, fetched): Al 2.698 (given as 2698 kg/m³), Cu 8.96, Au 19.3,
// Mg 1.74, Fe 7.87, Pb 11.3 g/cm³. Block volumes 100 g ÷ density: Al 37.1, Cu 11.2, Au 5.18 cm³ (edges 3.33, 2.24,
// 1.73 cm). Atoms per cm³ = density ÷ M × N_A: Cu 8.49, Al 6.02, Au 5.90, Mg 4.31, Pb 3.28 (× 10²²).
// The mole: BIPM (bipm.org, SI base unit mole): "One mole contains exactly 6.022 140 76 × 10²³ elementary entities";
// in force since 20 May 2019 (RSC Analytical Methods background paper, 2019, c9ay90028d); before, the number of atoms
// in 0.012 kg of carbon-12 (NIST, nist.gov/si-redefinition/mole). The molar mass of carbon-12 is now measured, with a
// relative uncertainty of 4.5 × 10⁻¹⁰ (same RSC paper), so "1 u ↔ 1 g/mol" holds to better than a billionth.
// Water 0.9982 g/cm³ at 20 °C (CRC Handbook, as in unit 11): 18.015 g is about 18 mL.
// Heavy water D₂O: 20.0276 g/mol (NIST WebBook); 18 g is 0.899 mol. Chlorine (CIAAW, ciaaw.org/chlorine.htm):
// Cl-35 34.9688527 u, amount fraction 0.755–0.761; Cl-37 36.9659026 u, 0.239–0.245; standard atomic weight interval
// [35.446, 35.457]; 35.45 is the conventional value in elements.ts. Age of the universe 13.77 billion years (NASA,
// WMAP overview); counting 6.0 × 10²³ at one per second takes 1.9 × 10¹⁶ years, 1.4 million times that.
// "Loschmidt-Zahl" as an old German name for N_A: chemie.de lexikon (Avogadro-Konstante), Lernhelfer
// (Loschmidtsche Zahl); strictly, the Loschmidt constant is particles per cubic metre of an ideal gas.
import type { Bi } from '../i18n';
import type { ChoiceItem, RankItem, FlawItem } from './items';
import type { Idea } from './unit06';
import type { UnitContent } from './unitTypes';

const b = (en: string, de: string): Bi => ({ en, de });

// ---------- explain-back patterns ----------
// Negation guard for the contra patterns: a clause that denies the misconception must not rule an idea out.
const NOT_EN = '^(?!.*\\b(not|n\'t|never|no|cannot|without|rather than|instead of)\\b)';
const NOT_DE = '^(?!.*\\b(nicht|kein\\w*|nie|niemals|ohne|statt|anstatt)\\b)';
// "Up to 60 characters with no negation in between", so "a balance cannot count atoms" does not pass as weighing-to-count.
const GAP = '(?:(?!\\b(?:not|cannot|can\'t|never|no|nicht|kein\\w*|nie)\\b).){0,60}';

// Misconception: equal masses hold equal numbers of atoms.
const EQUAL_MASS = {
  en: new RegExp(NOT_EN + '.*((same|equal) (mass|masses|weight|weights|grams?)\\b.{0,40}(same|equal) (number|numbers|count|amount|atoms|particles|moles)|100 ?g is 100 ?g|weighs? the same\\b.{0,40}(same|equal) (number|count|amount)|(mass|weight) (alone )?(decides|tells you|gives) (the )?(number|count)( of atoms)? (directly|alone)|(\\b\\d+ ?(g|grams?|kg)\\b|(same|equal) (mass|masses|weight|weights))(?:(?!\\bmol).){0,50}\\b(same|equal) (number|count) of (atoms|particles))'),
  de: new RegExp(NOT_DE + '.*((gleiche\\w*|dieselbe) (masse|massen|gewicht|gramm)\\b.{0,40}(gleich viele|gleiche\\w* (anzahl|teilchenzahl|stoffmenge))|100 ?g (sind|ist) 100 ?g|gleich schwer\\w*\\b.{0,40}gleich viele|(\\b\\d+ ?(g|gramm|kg)\\b|gleiche\\w* (masse|massen|gewicht))(?:(?!\\bmol).){0,50}gleich viele (atome|teilchen))'),
};
// Misconception: the mole is a mass (1 mol = 1 g or 12 g of anything).
const MOLE_IS_MASS = {
  en: new RegExp(NOT_EN + '.*(\\b(a|one|1|every|each) (moles?|mol)\\b (is|=|equals|means|weighs|has a mass of) (always |just |simply |exactly )?(a mass|a weight|(1|12|one|twelve) ?(g|grams?)\\b(?! (of|for) )(?!.{0,15}\\b(carbon|c-12|carbon-12)\\b))|\\b(moles?|mol)\\b (is|are) (a |the )?(unit of )?(mass|weight)\\b|(moles?|mol) of (anything|everything) (is|weighs|has a mass of) (1|12|one|twelve) ?(g|grams?)\\b|\\b(a|one|1|each|every) (mole|mol) of \\w+\\b.{0,40}\\b(more|fewer|less) (atoms|particles|molecules))'),
  de: new RegExp(NOT_DE + '.*(\\b(ein|1|jedes) mol\\b (ist|sind|=|entspricht|wiegt|hat eine masse von) (immer |genau |einfach )?(eine masse|ein gewicht|(1|12|ein|zwölf) ?(g|gramm)\\b(?!.{0,15}\\b(kohlenstoff|c-12|kohlenstoff-12)\\b))|\\bmol\\b (ist|sind) (eine |die )?(masseneinheit|masse\\b|gewicht)|mol (von )?(allem|jedem stoff) (ist|sind|wiegt) (1|12|ein|zwölf) ?(g|gramm)\\b|\\b(ein|1|einem|jedes) mol \\w+\\b.{0,40}\\b(mehr|weniger) (atome|teilchen|moleküle))'),
};

export const UNIT12: UnitContent = {
  n: 12,
  title: b('Counting by weighing', 'Zählen durch Wiegen'),
  lead: b('How a balance can count atoms far too small to see, and what chemists mean by a mole.', 'Wie eine Waage Atome zählen kann, die viel zu klein zum Sehen sind, und was Chemiker mit einem Mol meinen.'),

  puzzle: {
    title: b('Three blocks, one mass', 'Drei Blöcke, eine Masse'),
    lead: b('An aluminium, a copper and a gold block lie side by side, each exactly 100 g. Gold is so dense that its block is a cube only 1.7 cm on a side; the aluminium block is 3.3 cm. Nobody can count the atoms in them one by one: there are far too many.',
      'Ein Aluminium-, ein Kupfer- und ein Goldblock liegen nebeneinander, jeder genau 100 g schwer. Gold hat eine so große Dichte, dass sein Block ein Würfel von nur 1,7 cm Kantenlänge ist; der Aluminiumblock misst 3,3 cm. Niemand kann die Atome darin einzeln zählen: Es sind viel zu viele.'),
    data: {
      caption: b('Three blocks of 100 g each. Atomic mass: the average mass of one atom, in u (the atomic mass unit; 1 u is about 1.66 × 10⁻²⁴ g). Density: the grams in each cubic centimetre (g/cm³). Volume: 100 g ÷ density.',
        'Drei Blöcke mit je 100 g. Atommasse: die mittlere Masse eines Atoms in u (atomare Masseneinheit; 1 u ist etwa 1,66 · 10⁻²⁴ g). Dichte: die Gramm in jedem Kubikzentimeter (g/cm³). Volumen: 100 g ÷ Dichte.'),
      head: [b('Metal', 'Metall'), b('Atomic mass (u)', 'Atommasse (u)'), b('Density (g/cm³)', 'Dichte (g/cm³)'), b('Volume of 100 g (cm³)', 'Volumen von 100 g (cm³)')],
      rows: [
        { cells: [b('aluminium, Al', 'Aluminium, Al'), '26.982', '2.70', '37.1'] },
        { cells: [b('copper, Cu', 'Kupfer, Cu'), '63.546', '8.96', '11.2'] },
        { cells: [b('gold, Au', 'Gold, Au'), '196.967', '19.3', '5.18'] },
      ],
      numeric: [1, 2, 3],
    },
    clash: b('The gold block is the smallest and the densest: it crams the most grams into every cubic centimetre. Yet all three put the same 100 g on the balance. Which block holds the most atoms?',
      'Der Goldblock ist der kleinste und hat die größte Dichte: Er bringt die meisten Gramm in jedem Kubikzentimeter unter. Trotzdem zeigen alle drei auf der Waage dieselben 100 g. Welcher Block enthält die meisten Atome?'),
    question: {
      id: 'u12-puzzle', unit: 12, kind: 'choice', format: 'predict', withConfidence: true, evidence: 'predict',
      concepts: ['u12.equal-moles', 'u12.weigh-to-count'], targets: ['equal-mass-equal-count'],
      prompt: b('Your best guess:', 'Deine beste Vermutung:'),
      options: [
        { text: b('All three the same: 100 g is 100 g', 'Alle drei gleich viele: 100 g sind 100 g'), mis: 'equal-mass-equal-count' },
        { text: b('Gold: its block is the densest, so its atoms must be packed in tightest', 'Gold: Sein Block hat die größte Dichte, also müssen seine Atome am dichtesten gepackt sein') },
        { text: b('Aluminium: its atoms have the least mass, so it takes the most of them to make 100 g', 'Aluminium: Seine Atome haben die kleinste Masse, also braucht es am meisten davon für 100 g'), correct: true },
        { text: b('No way to tell without counting the atoms one by one', 'Ohne die Atome einzeln zu zählen, lässt sich das nicht sagen') },
      ],
      explain: b('Equal masses do not hold equal numbers. A gold atom has 7.3 times the mass of an aluminium atom (196.967 u against 26.982 u), so 100 g of aluminium needs 7.3 times as many atoms: about 2.2 × 10²⁴ against 3.1 × 10²³. Gold is dense because each atom is heavy, not because more atoms fit in: a cubic centimetre of gold holds about as many atoms as one of aluminium.',
        'Gleiche Massen enthalten nicht gleich viele Atome. Ein Goldatom hat die 7,3-fache Masse eines Aluminiumatoms (196,967 u gegenüber 26,982 u), also braucht es für 100 g Aluminium 7,3-mal so viele Atome: etwa 2,2 · 10²⁴ gegenüber 3,1 · 10²³. Gold hat eine große Dichte, weil jedes Atom schwer ist, nicht weil mehr Atome hineinpassen: Ein Kubikzentimeter Gold enthält etwa so viele Atome wie einer aus Aluminium.'),
    } as ChoiceItem,
    after: b('Next: put one sample on a balance and zoom from grams down to single atoms.', 'Als Nächstes: Leg eine Stoffportion auf die Waage und zoome von Gramm bis zu einzelnen Atomen.'),
  },

  explore: {
    title: b('The Zoom Ladder', 'Die Zoom-Leiter'),
    intro: b('One sample, four rungs: its mass on a balance (grams), its [[mole|amount]] in moles, the number of particles in it (count), and the particles themselves. Tap a rung to zoom; all four always describe the same sample. Two rules link them: n = m / M (amount = mass ÷ [[molar-mass]], in g/mol, grams per mole) and N = n × N_{A} (count = amount × the [[avogadro]], 6.022 × 10²³ per mole). Change the mass with the + and − buttons, the sample with the chips, and put a second sample beside it with the compare switch, at the same mass or the same amount.',
      'Eine Stoffportion, vier Sprossen: ihre Masse auf der Waage (Gramm), ihre [[mole]] n in Mol, die Zahl ihrer Teilchen (Teilchenzahl N) und die Teilchen selbst. Tippe auf eine Sprosse, um hinzuzoomen; alle vier beschreiben immer dieselbe Portion. Zwei Gleichungen verbinden sie: n = m / M (Stoffmenge = Masse ÷ [[molar-mass]] in g/mol, Gramm pro Mol) und N = n · N_{A} (Teilchenzahl = Stoffmenge · [[avogadro]], 6,022 · 10²³ pro Mol). Ältere Bücher nennen N_{A} auch Loschmidt-Zahl; heute heißt die Größe Avogadro-Konstante. Mit den Plus- und Minus-Knöpfen änderst du die Masse, mit den Chips die Stoffportion, und mit dem Vergleichsschalter stellst du eine zweite daneben, mit gleicher Masse oder gleicher Stoffmenge.'),
    tasks: [
      { id: 'zoom', key: true, text: b('Zoom through all four rungs for the carbon on the balance. What changes from rung to rung, and what stays the same?', 'Zoome für den Kohlenstoff auf der Waage durch alle vier Sprossen. Was ändert sich von Sprosse zu Sprosse, und was bleibt gleich?') },
      { id: 'onemol', key: true, text: b('Put exactly 1 mol of carbon on the balance. How many grams is that?', 'Leg genau 1 mol Kohlenstoff auf die Waage. Wie viel Gramm sind das?') },
      { id: 'same-mass', key: true, text: b('Compare carbon with gold at the same mass. Which pan holds more atoms, and about how many times more?', 'Vergleiche Kohlenstoff mit Gold bei gleicher Masse. Welche Waagschale enthält mehr Atome, und etwa wie viel mehr?') },
      { id: 'same-moles', text: b('Switch the comparison to the same amount in moles. Which pan is heavier now?', 'Stell den Vergleich auf gleiche Stoffmenge um. Welche Waagschale ist jetzt schwerer?') },
      { id: 'water', text: b('Weigh out 1 mol of water. How many molecules is that?', 'Wiege 1 mol Wasser ab. Wie viele Moleküle sind das?') },
      { id: 'light', challenge: true, text: b('Find a sample of at most 10 g that holds more than 10²⁴ particles.', 'Finde eine Stoffportion von höchstens 10 g, die mehr als 10²⁴ Teilchen enthält.') },
    ],
    notes: {
      zoom: b('Each rung describes the same sample at a different scale: the mass you weigh, the amount in moles, the number of particles and what one particle is. Change one and all four change together.',
        'Jede Sprosse beschreibt dieselbe Portion in einem anderen Maßstab: die Masse, die du wiegst, die Stoffmenge in Mol, die Zahl der Teilchen und was ein Teilchen ist. Änderst du eine, ändern sich alle vier mit.'),
      onemol: b('1 mol of carbon is 12.011 g: the same number as carbon\'s atomic mass, 12.011 u, now in grams. That is what molar mass means. Until 2019 the mole was defined as the number of atoms in 12 g of carbon-12; since then it has been defined by the count itself: exactly 6.02214076 × 10²³ particles.',
        '1 mol Kohlenstoff sind 12,011 g: derselbe Zahlenwert wie die Atommasse des Kohlenstoffs, 12,011 u, jetzt in Gramm. Das bedeutet molare Masse. Bis 2019 war das Mol als die Zahl der Atome in 12 g Kohlenstoff-12 definiert; seitdem ist es über die Anzahl selbst definiert: genau 6,02214076 · 10²³ Teilchen.'),
      'same-mass': b('Equal masses, unequal counts: the pan with the lighter atoms holds more of them. For carbon and gold the factor is 16.4, the ratio of their atomic masses (196.967 u ÷ 12.011 u).',
        'Gleiche Massen, verschieden viele Teilchen: Die Waagschale mit den leichteren Atomen enthält mehr davon. Bei Kohlenstoff und Gold ist der Faktor 16,4, das Verhältnis der Atommassen (196,967 u ÷ 12,011 u).'),
      'same-moles': b('Equal amounts, equal counts: both pans hold the same number of particles, and the pan with the heavier particles is the heavier one.',
        'Gleiche Stoffmengen, gleich viele Teilchen: Beide Waagschalen enthalten gleich viele Teilchen, und die mit den schwereren Teilchen ist die schwerere.'),
      water: b('1 mol of water is 18.015 g, about 18 mL, and holds 6.022 × 10²³ molecules. Here the particle is a molecule, not an atom: each one is made of three atoms.',
        '1 mol Wasser sind 18,015 g, etwa 18 mL, und enthält 6,022 · 10²³ Moleküle. Das Teilchen ist hier ein Molekül, kein Atom: Jedes besteht aus drei Atomen.'),
      light: b('Only hydrogen manages it. H₂ has a molar mass of just 2.016 g/mol, so 10 g is 4.96 mol, about 3.0 × 10²⁴ molecules. Carbon, the next lightest here, gives only 5.0 × 10²³ atoms for 10 g.',
        'Das schafft nur Wasserstoff. H₂ hat eine molare Masse von nur 2,016 g/mol, also sind 10 g 4,96 mol, etwa 3,0 · 10²⁴ Moleküle. Kohlenstoff, hier der nächstleichte, bringt es bei 10 g nur auf 5,0 · 10²³ Atome.'),
    },
    check: {
      id: 'u12-check', unit: 12, kind: 'rank', format: 'rank', evidence: 'predict', concepts: ['u12.equal-moles', 'u12.n-m-M'],
      prompt: b('Rank these 10 g samples by the number of particles in them, most first. Molar masses: carbon 12.011, water {{H2O}} 18.015, copper 63.546, gold 196.967 g/mol.',
        'Ordne diese Portionen von je 10 g nach der Zahl ihrer Teilchen, die meisten zuerst. Molare Massen: Kohlenstoff 12,011, Wasser {{H2O}} 18,015, Kupfer 63,546, Gold 196,967 g/mol.'),
      order: [b('10 g of carbon, C', '10 g Kohlenstoff, C'), b('10 g of water, {{H2O}}', '10 g Wasser, {{H2O}}'), b('10 g of copper, Cu', '10 g Kupfer, Cu'), b('10 g of gold, Au', '10 g Gold, Au')],
      explain: b('Same mass, so the lighter the particle, the more of them: 10 g is 0.833 mol of carbon (5.0 × 10²³ atoms), 0.555 mol of water (3.3 × 10²³ molecules), 0.157 mol of copper (9.5 × 10²² atoms) and 0.0508 mol of gold (3.1 × 10²² atoms).',
        'Gleiche Masse, also gilt: Je leichter das Teilchen, desto mehr davon. 10 g sind 0,833 mol Kohlenstoff (5,0 · 10²³ Atome), 0,555 mol Wasser (3,3 · 10²³ Moleküle), 0,157 mol Kupfer (9,5 · 10²² Atome) und 0,0508 mol Gold (3,1 · 10²² Atome).'),
    } as RankItem,
  },

  predictions: [
    {
      item: {
        id: 'u12-pans', unit: 12, kind: 'choice', format: 'predict', withConfidence: true, evidence: 'predict',
        concepts: ['u12.equal-moles', 'u12.mole'], targets: ['mole-is-mass'],
        prompt: b('Two pans of a balance: 0.5 mol of magnesium (24.305 u) on one, 0.5 mol of lead (207.21 u) on the other. Which pan is heavier, and about how many times?',
          'Zwei Waagschalen: auf der einen 0,5 mol Magnesium (24,305 u), auf der anderen 0,5 mol Blei (207,21 u). Welche Schale ist schwerer, und etwa wie viel mal?'),
        options: [
          { text: b('Neither: 0.5 mol is 0.5 mol, the same mass on both pans', 'Keine: 0,5 mol sind 0,5 mol, auf beiden Schalen dieselbe Masse'), mis: 'mole-is-mass' },
          { text: b('Lead, about 7 times: it has 82 protons against magnesium\'s 12', 'Blei, etwa 7-mal: Es hat 82 Protonen gegenüber den 12 des Magnesiums') },
          { text: b('Lead, about 8.5 times: the same number of atoms, each 8.5 times heavier', 'Blei, etwa 8,5-mal: gleich viele Atome, jedes 8,5-mal so schwer'), correct: true },
          { text: b('No way to tell without counting the atoms on each pan', 'Ohne die Atome auf jeder Schale zu zählen, lässt sich das nicht sagen') },
        ],
        explain: b('0.5 mol is the same count on both pans, 3.01 × 10²³ atoms. Each lead atom has 207.21 ÷ 24.305 = 8.5 times the mass of a magnesium atom, so the lead pan is 8.5 times heavier. Protons alone leave out the neutrons, which carry half or more of an atom\'s mass.',
          '0,5 mol sind auf beiden Schalen dieselbe Anzahl, 3,01 · 10²³ Atome. Jedes Bleiatom hat die 207,21 ÷ 24,305 = 8,5-fache Masse eines Magnesiumatoms, also ist die Bleischale 8,5-mal so schwer. Die Protonen allein lassen die Neutronen weg, die die Hälfte oder mehr der Masse eines Atoms tragen.'),
      } as ChoiceItem,
      show: { engine: 'ladder', sub: 'Mg', mol: 0.5, compare: 'Pb', by: 'moles', rung: 'grams' },
      revealText: b('0.5 mol of magnesium is 12.15 g, 0.5 mol of lead 103.6 g: the lead pan is about 8.5 times heavier. Both pans hold the same number of atoms, 3.01 × 10²³, because a mole is a count. The same count of heavier atoms simply has more mass.',
        '0,5 mol Magnesium sind 12,15 g, 0,5 mol Blei 103,6 g: Die Bleischale ist etwa 8,5-mal so schwer. Beide Schalen enthalten gleich viele Atome, 3,01 · 10²³, denn ein Mol ist eine Anzahl. Dieselbe Anzahl schwererer Atome hat einfach mehr Masse.'),
      extra: {
        title: b('A mole is a number, like a dozen', 'Ein Mol ist eine Anzahl, wie ein Dutzend'),
        steps: [
          b('A mole is a number of particles, as a dozen is twelve: 0.5 mol of anything is 3.01 × 10²³ particles.', 'Ein Mol ist eine Anzahl von Teilchen, so wie ein Dutzend zwölf sind: 0,5 mol von irgendetwas sind 3,01 · 10²³ Teilchen.'),
          b('So both pans hold the same number of atoms. Only the mass of each atom differs.', 'Beide Schalen enthalten also gleich viele Atome. Nur die Masse jedes Atoms ist verschieden.'),
          b('Mass = amount × molar mass: magnesium 0.5 × 24.305 g = 12.15 g, lead 0.5 × 207.21 g = 103.6 g.', 'Masse = Stoffmenge · molare Masse: Magnesium 0,5 · 24,305 g = 12,15 g, Blei 0,5 · 207,21 g = 103,6 g.'),
          b('103.6 ÷ 12.15 ≈ 8.5: the same ratio as the atomic masses, 207.21 ÷ 24.305.', '103,6 ÷ 12,15 ≈ 8,5: dasselbe Verhältnis wie das der Atommassen, 207,21 ÷ 24,305.'),
        ],
      },
    },
    {
      item: {
        id: 'u12-foil', unit: 12, kind: 'choice', format: 'predict', withConfidence: true, evidence: 'transfer',
        concepts: ['u12.equal-moles', 'u12.n-m-M'], targets: ['equal-mass-equal-count'],
        prompt: b('A builder has 1 kg of iron nails (55.845 u, density 7.87 g/cm³), a cook 1 kg of aluminium foil (26.982 u, 2.70 g/cm³). How many times as many atoms are in the foil?',
          'Ein Handwerker hat 1 kg Eisennägel (55,845 u, Dichte 7,87 g/cm³), eine Köchin 1 kg Aluminiumfolie (26,982 u, 2,70 g/cm³). Wie viel mal so viele Atome stecken in der Folie?'),
        options: [
          { text: b('The same number: 1 kg is 1 kg', 'Gleich viele: 1 kg ist 1 kg'), mis: 'equal-mass-equal-count' },
          { text: b('About 2 times as many: each iron atom has about twice the mass', 'Etwa doppelt so viele: Jedes Eisenatom hat etwa die doppelte Masse'), correct: true },
          { text: b('About 3 times as many: iron is about 3 times denser', 'Etwa dreimal so viele: Eisen hat etwa die dreifache Dichte') },
          { text: b('Half as many: heavier atoms mean the nails hold more of them', 'Halb so viele: Schwerere Atome bedeuten, dass die Nägel mehr davon enthalten') },
        ],
        explain: b('Same mass, so the count goes by the mass of one atom: 55.845 ÷ 26.982 = 2.07 times as many aluminium atoms. Density says how much space a kilogram takes, not how many atoms are in it.',
          'Gleiche Masse, also richtet sich die Anzahl nach der Masse eines Atoms: 55,845 ÷ 26,982 = 2,07-mal so viele Aluminiumatome. Die Dichte sagt, wie viel Platz ein Kilogramm braucht, nicht, wie viele Atome darin sind.'),
      } as ChoiceItem,
      show: { engine: 'ladder', sub: 'Fe', grams: 1000, compare: 'Al', by: 'mass', rung: 'count' },
      revealText: b('1 kg of iron is 17.9 mol, 1.08 × 10²⁵ atoms; 1 kg of aluminium is 37.1 mol, 2.23 × 10²⁵ atoms: 2.07 times as many. Each iron atom (55.845 u) has 2.07 times the mass of an aluminium atom (26.982 u), so the same kilogram needs only half as many of them. Density does not enter.',
        '1 kg Eisen sind 17,9 mol, 1,08 · 10²⁵ Atome; 1 kg Aluminium sind 37,1 mol, 2,23 · 10²⁵ Atome: 2,07-mal so viele. Jedes Eisenatom (55,845 u) hat die 2,07-fache Masse eines Aluminiumatoms (26,982 u), also braucht dasselbe Kilogramm nur halb so viele davon. Die Dichte spielt keine Rolle.'),
      extra: {
        title: b('From kilograms to atoms, step by step', 'Von Kilogramm zu Atomen, Schritt für Schritt'),
        steps: [
          b('Equal masses, different atoms: the lighter the atom, the more of them it takes to make 1 kg.', 'Gleiche Massen, verschiedene Atome: Je leichter das Atom, desto mehr davon braucht es für 1 kg.'),
          b('Iron: n = m / M = 1000 g ÷ 55.845 g/mol = 17.9 mol.', 'Eisen: n = m / M = 1000 g ÷ 55,845 g/mol = 17,9 mol.'),
          b('Aluminium: 1000 g ÷ 26.982 g/mol = 37.1 mol.', 'Aluminium: 1000 g ÷ 26,982 g/mol = 37,1 mol.'),
          b('37.1 ÷ 17.9 ≈ 2.07: the foil holds about twice as many atoms. Shortcut: divide the atomic masses, 55.845 ÷ 26.982.', '37,1 ÷ 17,9 ≈ 2,07: Die Folie enthält etwa doppelt so viele Atome. Abkürzung: die Atommassen teilen, 55,845 ÷ 26,982.'),
        ],
      },
    },
  ],

  examples: [
    {
      title: b('A mouthful of water is a mole', 'Ein Schluck Wasser ist ein Mol'), tag: 'H2O', show: { engine: 'ladder', sub: 'H2O', grams: 18.015, rung: 'count' },
      numbers: [{ v: '18.015 g/mol', label: b('molar mass of water (2 × 1.008 + 15.999)', 'molare Masse von Wasser (2 · 1,008 + 15,999)') }, { v: '1 mol', label: b('in 18.015 g, about 18 mL', 'in 18,015 g, etwa 18 mL') }, { v: '6.022 × 10²³', label: b('water molecules in it', 'Wassermoleküle darin') }],
      body: b('Water\'s molar mass is the masses of its three atoms added up: 2 × 1.008 + 15.999 = 18.015 g/mol (unit 13 does such sums in detail). So 18.015 g of water, about one mouthful, is 1 mol: 6.022 × 10²³ molecules. Counting them at one per second would take about 1.9 × 10¹⁶ years, over a million times the age of the universe (13.8 billion years).',
        'Die molare Masse von Wasser ist die Summe der Massen seiner drei Atome: 2 · 1,008 + 15,999 = 18,015 g/mol (Einheit 13 rechnet solche Summen genauer). 18,015 g Wasser, etwa ein Schluck, sind also 1 mol: 6,022 · 10²³ Moleküle. Sie im Sekundentakt zu zählen, würde etwa 1,9 · 10¹⁶ Jahre dauern, mehr als das Millionenfache des Alters des Universums (13,8 Milliarden Jahre).'),
      soWhat: b('That is why chemists weigh instead of counting: a balance turns 18 g into 6.022 × 10²³ molecules in a second. Lab recipes are written in moles and weighed out in grams.',
        'Deshalb wiegen Chemiker, statt zu zählen: Eine Waage macht aus 18 g in einer Sekunde 6,022 · 10²³ Moleküle. Laborvorschriften rechnen in Mol und werden in Gramm abgewogen.'),
    },
    {
      title: b('A gold ring in atoms', 'Ein Goldring in Atomen'), tag: 'Au', show: { engine: 'ladder', sub: 'Au', grams: 5, rung: 'moles' },
      numbers: [{ v: '5 g', label: b('a ring of pure gold', 'ein Ring aus reinem Gold') }, { v: '0.0254 mol', label: b('gold in it (5 g ÷ 196.967 g/mol)', 'Gold darin (5 g ÷ 196,967 g/mol)') }, { v: '1.53 × 10²²', label: b('gold atoms in the ring', 'Goldatome im Ring') }],
      body: b('n = m / M: 5 g ÷ 196.967 g/mol = 0.0254 mol, about a fortieth of a mole. Times N_{A} that is 0.0254 × 6.022 × 10²³ = 1.53 × 10²² atoms. A small amount in moles is still an enormous number.',
        'n = m / M: 5 g ÷ 196,967 g/mol = 0,0254 mol, etwa ein Vierzigstel Mol. Mal N_{A} sind das 0,0254 · 6,022 · 10²³ = 1,53 · 10²² Atome. Eine kleine Stoffmenge ist immer noch eine riesige Anzahl.'),
      soWhat: b('Jewellers price gold by the gram, chemists count it in moles: the same ring is 5 g, 0.0254 mol or 1.53 × 10²² atoms, three rungs of one ladder.',
        'Juweliere rechnen Gold in Gramm, Chemiker zählen es in Mol: Derselbe Ring ist 5 g, 0,0254 mol oder 1,53 · 10²² Atome, drei Sprossen einer Leiter.'),
    },
    {
      title: b('Where weighing miscounts: isotopes', 'Wo Wiegen falsch zählt: Isotope'), tag: 'D2O', show: { engine: 'ladder', sub: 'H2O', grams: 18, rung: 'moles' },
      numbers: [{ v: '35.45 u', label: b('atomic mass of chlorine: an average, no single atom has it', 'Atommasse von Chlor: ein Mittelwert, kein einzelnes Atom hat sie') }, { v: '20.03 g/mol', label: b('molar mass of heavy water, D₂O (water: 18.015)', 'molare Masse von schwerem Wasser, D₂O (Wasser: 18,015)') }, { v: '0.899 mol', label: b('in 18 g of heavy water, not 1', 'in 18 g schwerem Wasser, nicht 1') }],
      body: b('Weighing counts right only when the sample has the usual mix of [[isotope|isotopes]]. Chlorine\'s 35.45 u is an average of about 76 % chlorine-35 (34.97 u) and 24 % chlorine-37 (36.97 u); it works because every ordinary sample has that mix. Heavy water, D₂O, has deuterium, hydrogen with an extra neutron, in place of ordinary hydrogen: 20.03 g/mol, so 18 g of it is only 0.899 mol, about 10 % fewer molecules than the 0.999 mol of ordinary water the ladder shows.',
        'Wiegen zählt nur richtig, wenn die Portion die übliche Mischung der [[isotope|Isotope]] hat. Die 35,45 u von Chlor sind ein Mittelwert aus etwa 76 % Chlor-35 (34,97 u) und 24 % Chlor-37 (36,97 u); das klappt, weil jede gewöhnliche Portion diese Mischung hat. Schweres Wasser, D₂O, enthält statt gewöhnlichem Wasserstoff Deuterium, Wasserstoff mit einem zusätzlichen Neutron: 20,03 g/mol, also sind 18 g davon nur 0,899 mol, etwa 10 % weniger Moleküle als die 0,999 mol gewöhnliches Wasser, die die Leiter zeigt.'),
      soWhat: b('Isotope mixes vary a little in nature, so IUPAC gives chlorine\'s atomic weight as a range, 35.446 to 35.457; 35.45 is the agreed value for ordinary samples. A lab working with isotope-enriched material must use that material\'s own molar mass.',
        'Die Isotopenmischung schwankt in der Natur ein wenig, deshalb gibt die IUPAC die Atommasse von Chlor als Bereich an, 35,446 bis 35,457; 35,45 ist der vereinbarte Wert für gewöhnliche Proben. Ein Labor, das mit isotopenangereichertem Material arbeitet, muss dessen eigene molare Masse verwenden.'),
    },
  ],

  flaw: {
    id: 'u12-flaw', unit: 12, kind: 'flaw', format: 'flaw', evidence: 'transfer', concepts: ['u12.equal-moles', 'u12.n-m-M'], targets: ['equal-mass-equal-count'],
    prompt: b('Where does this reasoning first go wrong?', 'Wo geht diese Überlegung zum ersten Mal schief?'),
    lines: [
      b('Copper\'s atomic mass is 63.546 u, so its molar mass is 63.546 g/mol.', 'Die Atommasse von Kupfer ist 63,546 u, also ist seine molare Masse 63,546 g/mol.'),
      b('So 20 g of copper is 20 ÷ 63.546 = 0.315 mol.', '20 g Kupfer sind also 20 ÷ 63,546 = 0,315 mol.'),
      b('20 g of silver is also 0.315 mol, since the two masses are equal.', '20 g Silber sind ebenfalls 0,315 mol, weil die beiden Massen gleich sind.'),
      b('So both pieces hold the same number of atoms: 0.315 × 6.022 × 10²³ = 1.90 × 10²³.', 'Also enthalten beide Stücke gleich viele Atome: 0,315 · 6,022 · 10²³ = 1,90 · 10²³.'),
    ],
    flaw: 2,
    alsoFalse: [3],
    near: [{ step: 0, note: b('Step 1 looks like a unit mix-up, u turned into g/mol, but it holds: an element\'s molar mass in g/mol has the same number as its atomic mass in u. That is what lets a balance count atoms.', 'Schritt 1 sieht nach einer Verwechslung der Einheiten aus, u wird zu g/mol, stimmt aber: Die molare Masse eines Elements in g/mol hat denselben Zahlenwert wie seine Atommasse in u. Genau deshalb kann eine Waage Atome zählen.') }],
    explain: b('Step 3 is the slip: silver\'s molar mass is 107.868 g/mol, so 20 g of silver is 20 ÷ 107.868 = 0.185 mol. Steps 1 and 2 are true: the molar mass in g/mol has the same number as the atomic mass in u, and n = m / M. Step 4 follows from the slip: the copper holds 1.90 × 10²³ atoms, the silver only 1.12 × 10²³, because each silver atom has more mass.',
      'Schritt 3 ist der Fehler: Die molare Masse von Silber ist 107,868 g/mol, also sind 20 g Silber 20 ÷ 107,868 = 0,185 mol. Die Schritte 1 und 2 stimmen: Die molare Masse in g/mol hat denselben Zahlenwert wie die Atommasse in u, und n = m / M. Schritt 4 folgt aus dem Fehler: Das Kupfer enthält 1,90 · 10²³ Atome, das Silber nur 1,12 · 10²³, weil jedes Silberatom mehr Masse hat.'),
  } as FlawItem,

  deeper: {
    id: 'u12-deeper', unit: 12, kind: 'rank', format: 'rank', evidence: 'transfer', concepts: ['u12.n-m-M', 'u12.equal-moles'],
    prompt: b('Rank these metals by the number of atoms in one cubic centimetre, most first. Copper: 8.96 g/cm³, 63.546 u. Gold: 19.3 g/cm³, 196.967 u. Magnesium: 1.74 g/cm³, 24.305 u. Lead: 11.3 g/cm³, 207.21 u.',
      'Ordne diese Metalle nach der Zahl der Atome in einem Kubikzentimeter, die meisten zuerst. Kupfer: 8,96 g/cm³, 63,546 u. Gold: 19,3 g/cm³, 196,967 u. Magnesium: 1,74 g/cm³, 24,305 u. Blei: 11,3 g/cm³, 207,21 u.'),
    order: [b('copper', 'Kupfer'), b('gold', 'Gold'), b('magnesium', 'Magnesium'), b('lead', 'Blei')],
    explain: b('Turn the grams in one cm³ into moles: copper 8.96 ÷ 63.546 = 0.141 mol (8.5 × 10²² atoms), gold 0.098 mol (5.9 × 10²²), magnesium 0.072 mol (4.3 × 10²²), lead 0.055 mol (3.3 × 10²²). Density and atomic mass pull in opposite directions: gold and lead are dense because their atoms are heavy, not because more of them fit in, and lead, the second densest, has the fewest.',
      'Rechne die Gramm in einem cm³ in Mol um: Kupfer 8,96 ÷ 63,546 = 0,141 mol (8,5 · 10²² Atome), Gold 0,098 mol (5,9 · 10²²), Magnesium 0,072 mol (4,3 · 10²²), Blei 0,055 mol (3,3 · 10²²). Dichte und Atommasse wirken gegeneinander: Gold und Blei haben eine große Dichte, weil ihre Atome schwer sind, nicht weil mehr davon hineinpassen, und Blei, das mit der zweitgrößten Dichte, hat die wenigsten.'),
  } as RankItem,

  explain: {
    prompt: b('In your own words: how can a balance count atoms, and why do 100 g of aluminium and 100 g of gold hold different numbers of atoms?',
      'In eigenen Worten: Wie kann eine Waage Atome zählen, und warum enthalten 100 g Aluminium und 100 g Gold verschieden viele Atome?'),
    ideas: [
      { id: 'weigh', concept: 'u12.weigh-to-count', idea: b('Atoms are far too small and too many to count one by one, but identical particles can be counted by weighing', 'Atome sind viel zu klein und zu zahlreich, um sie einzeln zu zählen, aber gleiche Teilchen kann man durch Wiegen zählen'), contra: EQUAL_MASS,
        // Weighing and counting in one clause (either order), total mass ÷ mass of one, or "can't count … so weigh".
        en: new RegExp(`((weigh\\w*|balance|scales?)\\b${GAP}(count\\w*|number of (atoms|particles|molecules|screws|items)|how many)|(count\\w*|number of (atoms|particles|molecules)|how many (atoms|particles|molecules|there are))\\b${GAP}(weigh\\w*|balance|scales?|by (their )?mass|from (the |their )?mass)|mass\\b.{0,30}(divided by|÷|\\/|over) ?.{0,30}mass of (one|a single|each) (atom|particle|molecule|screw)|(can't count|cannot count|can not count|not count them|impossible to count)\\b.{0,60}(so|instead|but|therefore|which is why|that is why|that's why)\\b.{0,30}(weigh\\w*|balance|mass))`),
        de: new RegExp(`((wieg\\w*|wäg\\w*|waage|abwieg\\w*|abwäg\\w*)\\b${GAP}(zähl\\w*|anzahl|teilchenzahl|wie viele)|(zähl\\w*|anzahl|teilchenzahl|wie viele (atome|teilchen|moleküle))\\b${GAP}(wieg\\w*|wäg\\w*|waage|über die masse|aus der masse|mit der masse)|masse\\b.{0,30}(geteilt durch|durch|÷|\\/) ?.{0,30}masse (eines|eines einzelnen|jedes) (atoms|teilchens|moleküls)|(nicht einzeln zählen|nicht zählen|unmöglich zu zählen|nicht abzählen)\\b.{0,60}(deshalb|daher|also|stattdessen|sondern|aber|darum)\\b.{0,30}(wieg\\w*|wäg\\w*|waage|masse))`) },
      { id: 'mole', concept: 'u12.mole', idea: b('A mole is a count of particles, 6.022 × 10²³ (the Avogadro constant), like a dozen but far bigger', 'Ein Mol ist eine Anzahl von Teilchen, 6,022 · 10²³ (Avogadro-Konstante), wie ein Dutzend, nur viel größer'), contra: MOLE_IS_MASS,
        en: /(\b(moles?|mol)\b.{0,30}\b(is|are|means|=|equals|contains?|has|holds?|stands for)\b.{0,30}(number|count|amount of (particles|atoms)|6[.,]0\d*|avogadro|particles|atoms|molecules|entities)|6([.,]\d+)? ?(x|×|\*|·)? ?10 ?(\^|\*\*)? ?23|6([.,]\d+)?e\+?23|(like|as with|similar to|just as|just like) a dozen|dozen\b.{0,40}\b(moles?|mol)\b|\b(moles?|mol)\b.{0,40}dozen|counting unit|unit (for|of) counting|avogadro\w*\b.{0,40}(particles|atoms|molecules|per mole|in (a|one) mole))/,
        de: /(\bmol\b.{0,30}\b(ist|sind|bedeutet|=|entspricht|enthält|hat|umfasst|steht für)\b.{0,30}(anzahl|zahl|teilchenzahl|stückzahl|6[.,]0\d*|avogadro|teilchen|atome|moleküle)|stoffmenge\b.{0,40}(anzahl|teilchenzahl|zahl der teilchen|zählt)|6([.,]\d+)? ?(x|×|\*|·)? ?10 ?(\^|\*\*)? ?23|6([.,]\d+)?e\+?23|(wie|ähnlich wie) (ein |das )?dutzend|dutzend\b.{0,40}\bmol\b|\bmol\b.{0,40}dutzend|zähleinheit|avogadro\w*.{0,40}(teilchen|atome|moleküle|pro mol|in (einem|1) mol))/ },
      { id: 'molar', concept: 'u12.molar-mass', idea: b('An element\'s molar mass in g/mol has the same number as its atomic mass in u: 1 mol of carbon is 12.011 g', 'Die molare Masse eines Elements in g/mol hat denselben Zahlenwert wie seine Atommasse in u: 1 mol Kohlenstoff sind 12,011 g'),
        en: /((molar mass|g ?\/ ?mol|grams? per mole?)\b.{0,60}(same (number|value|figure|digits)|numerically|equal to (the |its )?(atomic|relative)|as the atomic mass|matches (the |its )?atomic)|(atomic mass|relative atomic mass|\bamu\b|daltons?|\bu\b)\b.{0,60}(in grams|g ?\/ ?mol|grams per mole?|molar mass|(becomes|turns into|is|gives|=) (the mass of )?(1|one) (mole|mol)\b)|(same (number|value|figure)|numerically (equal|the same))\b.{0,60}(\bu\b|atomic mass|g ?\/ ?mol|grams)|(1|one) (mole|mol) of (carbon|c)\b.{0,25}12([.,]\d+)? ?(g|grams?)\b|(mass|number) (from|in|on) the (periodic )?table\b.{0,40}(grams|g ?\/ ?mol|one mole|1 mol))/,
        de: /((molare\w* masse|g ?\/ ?mol|gramm pro mol)\b.{0,60}(gleiche[nr]? (zahl|zahlenwert|wert)|denselben (zahlenwert|wert)|zahlenmäßig|zahlenwert|gleich der atommasse|wie die atommasse|entspricht der atommasse)|(atommasse|relative atommasse|atomare masseneinheit|\bu\b)\b.{0,60}(in gramm|g ?\/ ?mol|gramm pro mol|molare\w* masse|(ist|sind|ergibt|entspricht|=) (die masse von )?(1|einem|ein) mol\b)|(gleiche[nr]? (zahl|zahlenwert|wert)|denselben zahlenwert|zahlenmäßig gleich)\b.{0,60}(\bu\b|atommasse|g ?\/ ?mol|gramm)|1 mol (kohlenstoff|c)\b.{0,25}12([.,]\d+)? ?(g|gramm)\b|(masse|zahl|wert) (aus dem|im) periodensystem\b.{0,40}(gramm|g ?\/ ?mol|ein mol|1 mol))/ },
      { id: 'nmM', concept: 'u12.n-m-M', idea: b('The amount in moles is n = m / M; times N_{A} it gives the number of particles', 'Die Stoffmenge ist n = m / M; mal N_{A} ergibt sie die Teilchenzahl'),
        en: /(\bn ?= ?m ?(\/|÷|:|over|divided by) ?m\b|(mass|grams?|\bm\b)\b.{0,10}(divided by|÷|\/|over) ?(the |its )?(molar mass|\bm\b|g ?\/ ?mol|atomic mass|mass of (one|1|a) mole?)|divid\w* (the )?(mass|grams?|it|that)\b.{0,15}\bby (the |its )?(molar|atomic) mass|(moles?|amount|\bn\b)\b.{0,20}(=|equals|is) ?(the )?(mass|grams?|\bm\b) (divided by|÷|\/|over)|(\bn\b|moles?|amount( in moles)?) (times|×|x|\*|·|multiplied by) (the )?(avogadro|n_?a\b|6[.,]0)|\bn ?(×|x|\*|·) ?n_?a\b)/,
        de: /(\bn ?= ?m ?(\/|÷|:|durch|geteilt durch) ?m\b|(masse|gramm|\bm\b)\b.{0,10}(geteilt durch|durch|÷|\/) ?(die |seine |ihre )?(molare\w* masse|\bm\b|g ?\/ ?mol|atommasse|masse (von )?(einem|1) mol)|(stoffmenge|\bn\b)\b.{0,20}(=|ist|gleich|entspricht) ?(die )?(masse|gramm|\bm\b) (geteilt durch|durch|÷|\/)|(\bn\b|stoffmenge) (mal|×|x|\*|·|multipliziert mit) (der |die )?(avogadro|n_?a\b|6[.,]0)|\bn ?(×|x|\*|·) ?n_?a\b)/ },
      { id: 'equal', concept: 'u12.equal-moles', idea: b('Equal masses of different elements hold different numbers of atoms (lighter atoms, more of them); only equal amounts in moles hold equal numbers', 'Gleiche Massen verschiedener Elemente enthalten verschieden viele Atome (leichtere Atome, mehr davon); nur gleiche Stoffmengen enthalten gleich viele Teilchen'), contra: EQUAL_MASS,
        en: /((lighter|less massive|smaller mass|lower (atomic |molar )?mass|less mass)\b.{0,60}(more (of them|atoms|particles|molecules)|the most (atoms|particles)|(a )?(greater|bigger|higher|larger) number)|(heavier|more massive|bigger mass|higher (atomic |molar )?mass|more mass)\b.{0,60}(fewer|less atoms|(a )?(smaller|lower) number)|(more|fewer|most) (atoms|particles)\b.{0,60}(lighter|heavier|less mass|more mass|lower atomic|higher atomic|atomic mass)|(same|equal) (mass|masses|weight|weights|number of grams|grams)\b.{0,60}(different|not the same|unequal|more|fewer|differ\w*) (numbers?|counts?|amounts?|atoms|particles|moles)|(different|unequal) (numbers?|counts?|amounts?) of (atoms|particles)\b.{0,60}(same|equal) (mass|masses|weight)|(same|equal) (amounts?|number of moles|moles|mol)\b.{0,60}(same|equal) (number|count|numbers)|(same|equal) (amounts?|number of moles|moles)\b.{0,60}(different|not the same|unequal) (mass|masses|weights?)|alumini?um atoms\b.{0,40}lighter|gold atoms\b.{0,40}heavier)/,
        de: /((leichter\w*|geringere\w* (atom)?masse|kleinere\w* (atom)?masse|weniger masse)\b.{0,60}(mehr (atome|teilchen|davon|moleküle)|die meisten (atome|teilchen)|größere\w* (anzahl|zahl|teilchenzahl)|höhere\w* (anzahl|teilchenzahl))|(schwerer\w*|größere\w* (atom)?masse|höhere\w* (atom)?masse|mehr masse)\b.{0,60}(weniger|kleinere\w* (anzahl|zahl|teilchenzahl))|(mehr|weniger|die meisten) (atome|teilchen)\b.{0,60}(leichter|schwerer|atommasse|weniger masse)|(gleiche\w*|dieselbe\w*|gleich große\w*) (masse|massen|gramm|gewicht)\b.{0,60}(unterschiedlich\w*|verschieden\w*|nicht gleich viele|mehr|weniger|ungleich\w*) (viele )?(anzahl|teilchenzahl|atome|teilchen|stoffmenge\w*)|(gleiche\w*|dieselbe) (stoffmenge\w*|molzahl|anzahl mol)\b.{0,60}(gleich viele|gleiche\w* (anzahl|teilchenzahl))|(gleiche\w*|dieselbe) stoffmenge\w*.{0,60}(unterschiedlich\w*|verschieden\w*) (masse|massen|schwer)|aluminiumatome\b.{0,40}leichter|goldatome\b.{0,40}schwerer)/ },
    ] as Idea[],
    tightened: b('Atoms are far too small and too many to count one by one, but identical particles can be counted by weighing: the mass of the sample divided by the mass of one particle gives their number. A mole is a count, 6.022 × 10²³ particles (the Avogadro constant), like a dozen but far bigger. An element\'s molar mass in g/mol has the same number as its atomic mass in u, so 1 mol of carbon is 12.011 g. The amount is n = m / M, and the number of particles is N = n × N_{A}. Equal masses of different elements hold different numbers of atoms: aluminium atoms are lighter than gold atoms, so 100 g of aluminium holds 7.3 times as many; only equal amounts in moles hold the same number of particles.',
      'Atome sind viel zu klein und zu zahlreich, um sie einzeln zu zählen, aber gleiche Teilchen kann man durch Wiegen zählen: Die Masse der Portion geteilt durch die Masse eines Teilchens ergibt ihre Anzahl. Ein Mol ist eine Anzahl, 6,022 · 10²³ Teilchen (Avogadro-Konstante), wie ein Dutzend, nur viel größer. Die molare Masse eines Elements in g/mol hat denselben Zahlenwert wie seine Atommasse in u, 1 mol Kohlenstoff sind also 12,011 g. Die Stoffmenge ist n = m / M, die Teilchenzahl N = n · N_{A}. Gleiche Massen verschiedener Elemente enthalten verschieden viele Atome: Aluminiumatome sind leichter als Goldatome, deshalb enthalten 100 g Aluminium 7,3-mal so viele; nur gleiche Stoffmengen enthalten gleich viele Teilchen.'),
  },

  terms: ['mole', 'avogadro', 'molar-mass', 'atomic-mass', 'isotope'],

  readings: [
    {
      lang: 'en', kind: 'quick',
      title: b('Counting Atoms by the Gram', 'Counting Atoms by the Gram'), source: 'Chemistry LibreTexts, Introductory Chemistry 6.3',
      url: 'https://chem.libretexts.org/Bookshelves/Introductory_Chemistry/Introductory_Chemistry_(LibreTexts)/06:_Chemical_Composition/6.03:_Counting_Atoms_by_the_Gram',
      lookFor: [
        b('Its dozen and gross: why is a mole just a much bigger counting unit of the same kind?', ''),
        b('Its exercise with 100.0 g of aluminium. Does its answer, 3.706 mol, match the aluminium block from the puzzle?', ''),
        b('Its flowchart between mass and moles: when does it use g/mol and when mol/g? Compare it with n = m / M on the ladder.', ''),
      ],
    },
    {
      lang: 'en', kind: 'deeper',
      title: b('Formula Mass and the Mole Concept', 'Formula Mass and the Mole Concept'), source: 'OpenStax Chemistry 2e, section 3.1',
      url: 'https://openstax.org/books/chemistry-2e/pages/3-1-formula-mass-and-the-mole-concept',
      lookFor: [
        b('Figure 3.5, one mole of several elements side by side: do its 12.0 g of carbon, 63.5 g of copper and 207 g of lead match the ladder?', ''),
        b('Example 3.5: 5.00 g of copper wire holds 4.74 × 10²² atoms. Check it with n = m / M and N = n × N_A.', ''),
        b('Figure 3.7, a water drop of about 0.03 g: work out its molecules the same way (about 10²¹). Why does the book still call that a small fraction of a mole?', ''),
      ],
    },
    {
      lang: 'de', kind: 'quick',
      title: b('Avogadro-Konstante', 'Avogadro-Konstante'), source: 'Studyflix',
      url: 'https://studyflix.de/chemie/avogadro-konstante-1667',
      lookFor: [
        b('', 'Sein Beispiel mit 18 g Wasser: Wie viele Moleküle gibt es an, und passt das zum Wasser auf der Leiter?'),
        b('', 'Die Formeln n = m / M und N = n · N_A: Welche Größe hat dort welche Einheit?'),
        b('', 'Der Ölfleckversuch: Wie bestimmte man N_A, ohne Teilchen einzeln zu zählen, und welcher Wert kam ungefähr heraus?'),
      ],
    },
  ],

  misconceptions: [
    { id: 'equal-mass-equal-count', name: b('Equal masses hold equal numbers of atoms', 'Gleiche Massen enthalten gleich viele Atome') },
    { id: 'mole-is-mass', name: b('The mole is a mass (1 mol = 1 g or 12 g)', 'Das Mol ist eine Masse (1 mol = 1 g oder 12 g)') },
  ],

  glossary: {
    avogadro: {
      en: 'Avogadro constant', de: 'Avogadro-Konstante', unit: 12,
      def: { en: 'The number of particles in one mole: N_{A} = 6.022 × 10²³ per mole. Since 2019 it is exactly 6.02214076 × 10²³, and this number defines the mole.', de: 'Die Zahl der Teilchen in einem Mol: N_{A} = 6,022 · 10²³ pro Mol. Seit 2019 ist sie genau 6,02214076 · 10²³, und diese Zahl definiert das Mol.' },
      falseFriend: { en: 'Older German books also say "Loschmidt-Zahl"; strictly, the Loschmidt constant is a different number (particles per cubic metre of gas).', de: 'Ältere Bücher sagen auch „Loschmidt-Zahl“; streng genommen ist die Loschmidt-Konstante eine andere Größe (Teilchen pro Kubikmeter Gas).' },
    },
    'molar-mass': {
      en: 'molar mass', de: 'molare Masse', unit: 12,
      def: { en: 'The mass of one mole of a substance, M, in g/mol (grams per mole). For an element it has the same number as the atomic mass in u: carbon 12.011 g/mol.', de: 'Die Masse von einem Mol eines Stoffes, M, in g/mol (Gramm pro Mol). Bei einem Element hat sie denselben Zahlenwert wie die Atommasse in u: Kohlenstoff 12,011 g/mol.' },
      falseFriend: { en: 'German books also say "Molmasse". A molar mass is a property, not a weight: "carbon has a molar mass of 12.011 g/mol".', de: 'Auch „Molmasse“. Man sagt: „Kohlenstoff hat eine molare Masse von 12,011 g/mol.“' },
    },
  },
};
