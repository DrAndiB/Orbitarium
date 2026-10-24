// Unit 12 question bank: three or more variants per concept (predict, why, transfer), every trap option tagged.
// Numbers from src/content/stoich.ts (atomic masses from elements.ts, N_A = 6.02214076 × 10²³ mol⁻¹): C 12.011,
// Mg 24.305, Al 26.982, S 32.06, Fe 55.845, Cu 63.546, Ag 107.868, Au 196.967, Pb 207.21, H₂ 2.016, H₂O 18.015,
// sucrose C₁₂H₂₂O₁₁ 342.297 g/mol. Computed: 1 u = 1/N_A g = 1.66 × 10⁻²⁴ g; one C atom 1.99 × 10⁻²³ g; 100 g Al
// 3.71 mol, Fe 1.79 mol, Ag 0.927 mol, Pb 0.483 mol; 2 mol Ag 215.7 g; 1 kg sucrose 2.92 mol; 1.2 × 10²⁴ Fe atoms
// 1.99 mol, 111 g; 10 g Cu 0.157 mol, 10 g Al 0.371 mol (ratio 2.36); 20 g S 0.624 mol, 20 g Cu 0.315 mol (1.98);
// 55.845 g Fe and 32.06 g S each 1 mol. Counting 6.022 × 10²³ at a million per second takes 1.9 × 10¹⁰ years, longer
// than the age of the universe (13.77 billion years, NASA WMAP overview). Screws, hypothetical: 6 g each.
// Isotopes (CIAAW): Cl-35 34.97 u, about 76 %; Cl-37 36.97 u, about 24 %. Heavy water D₂O 20.0276 g/mol (NIST WebBook).
// The mole's definition: BIPM; in force since 20 May 2019 (see unit12.ts).
import type { Bi } from '../../i18n';
import type { Item } from '../items';

const b = (en: string, de: string): Bi => ({ en, de });

export const BANK_U12: Item[] = [
  // ---------- u12.too-many ----------
  { id: 'i12a', unit: 12, kind: 'choice', format: 'predict', withConfidence: true, concepts: ['u12.too-many'],
    prompt: b('A carbon atom has a mass of about 2 × 10⁻²³ g. About how many carbon atoms are in a 1 g lump of charcoal (taken as pure carbon)?', 'Ein Kohlenstoffatom hat eine Masse von etwa 2 · 10⁻²³ g. Etwa wie viele Kohlenstoffatome stecken in einem Stück Holzkohle von 1 g (als reiner Kohlenstoff gerechnet)?'),
    options: [
      { text: b('About a million', 'Etwa eine Million') },
      { text: b('About a billion billion, 10¹⁸', 'Etwa eine Trillion, 10¹⁸') },
      { text: b('About 5 × 10²², fifty thousand billion billion', 'Etwa 5 · 10²², fünfzigtausend Trillionen'), correct: true },
      { text: b('About 12, as in carbon\'s atomic mass', 'Etwa 12, wie in der Atommasse des Kohlenstoffs'), mis: 'mole-is-mass' },
    ],
    targets: ['mole-is-mass'],
    explain: b('1 g ÷ 2 × 10⁻²³ g per atom = 5 × 10²² atoms (more exactly, 1 g ÷ 12.011 g/mol × N_{A} = 5.0 × 10²²). The 12 in carbon\'s atomic mass is the mass of one atom in u, not a number of atoms.',
      '1 g ÷ 2 · 10⁻²³ g pro Atom = 5 · 10²² Atome (genauer: 1 g ÷ 12,011 g/mol · N_{A} = 5,0 · 10²²). Die 12 in der Atommasse des Kohlenstoffs ist die Masse eines Atoms in u, keine Anzahl von Atomen.') },
  { id: 'i12b', unit: 12, kind: 'choice', format: 'why', evidence: 'explain', withConfidence: true, concepts: ['u12.too-many', 'u12.weigh-to-count'],
    prompt: b('Why do chemists measure out atoms by weighing instead of counting them?', 'Warum messen Chemiker Atome durch Wiegen ab, statt sie zu zählen?'),
    options: [
      { text: b('Atoms are far too small to see and far too many to count; a balance counts them all at once through their mass', 'Atome sind viel zu klein zum Sehen und viel zu zahlreich zum Zählen; eine Waage zählt sie alle auf einmal über ihre Masse'), correct: true },
      { text: b('Counting is possible with a microscope, but weighing is more traditional', 'Zählen ginge mit einem Mikroskop, aber Wiegen ist üblicher') },
      { text: b('The mole is a mass, so only weighing gives an amount in moles', 'Das Mol ist eine Masse, deshalb ergibt nur Wiegen eine Stoffmenge in Mol'), mis: 'mole-is-mass' },
      { text: b('All atoms have the same mass, so the mass is the count', 'Alle Atome haben dieselbe Masse, also ist die Masse die Anzahl'), mis: 'equal-mass-equal-count' },
    ],
    targets: ['mole-is-mass', 'equal-mass-equal-count'],
    explain: b('Even a gram holds around 10²² atoms. Because all atoms of one element (with the usual isotope mix) have the same average mass, the total mass divided by the mass of one atom gives the count. The mole is the counting unit that comes out.',
      'Schon ein Gramm enthält rund 10²² Atome. Weil alle Atome eines Elements (bei der üblichen Isotopenmischung) dieselbe mittlere Masse haben, ergibt die Gesamtmasse geteilt durch die Masse eines Atoms die Anzahl. Das Mol ist die Zähleinheit, die dabei herauskommt.') },
  { id: 'i12c', unit: 12, kind: 'choice', format: 'predict', evidence: 'transfer', withConfidence: true, concepts: ['u12.too-many'],
    prompt: b('A very fast machine counts a million atoms every second. How long would it need for 1 mol, 6.022 × 10²³ atoms? (Age of the universe: about 1.4 × 10¹⁰ years.)', 'Eine sehr schnelle Maschine zählt jede Sekunde eine Million Atome. Wie lange bräuchte sie für 1 mol, 6,022 · 10²³ Atome? (Alter des Universums: etwa 1,4 · 10¹⁰ Jahre.)'),
    options: [
      { text: b('About a day', 'Etwa einen Tag') },
      { text: b('About a hundred years', 'Etwa hundert Jahre') },
      { text: b('About 19 billion years, longer than the universe has existed', 'Etwa 19 Milliarden Jahre, länger, als es das Universum gibt'), correct: true },
      { text: b('About 6 seconds, since 6.022 is a small number', 'Etwa 6 Sekunden, denn 6,022 ist eine kleine Zahl') },
    ],
    explain: b('6.022 × 10²³ ÷ 10⁶ per second = 6.0 × 10¹⁷ seconds, and a year has about 3.2 × 10⁷ seconds: 1.9 × 10¹⁰ years. The power of ten, 10²³, is what makes the number huge; a balance does the same "counting" in a second.',
      '6,022 · 10²³ ÷ 10⁶ pro Sekunde = 6,0 · 10¹⁷ Sekunden, und ein Jahr hat etwa 3,2 · 10⁷ Sekunden: 1,9 · 10¹⁰ Jahre. Die Zehnerpotenz 10²³ macht die Zahl riesig; eine Waage erledigt dasselbe „Zählen“ in einer Sekunde.') },

  // ---------- u12.weigh-to-count ----------
  { id: 'i12d', unit: 12, kind: 'choice', format: 'predict', withConfidence: true, concepts: ['u12.weigh-to-count'], targets: ['equal-mass-equal-count'],
    prompt: b('A hardware shop sells screws by weight. Each screw has a mass of 6 g. A bag of them weighs 1500 g. How many screws are in the bag?', 'Ein Baumarkt verkauft Schrauben nach Gewicht. Jede Schraube hat eine Masse von 6 g. Eine Tüte davon wiegt 1500 g. Wie viele Schrauben sind in der Tüte?'),
    options: [
      { text: b('250', '250'), correct: true },
      { text: b('1500, one per gram', '1500, eine pro Gramm'), mis: 'equal-mass-equal-count' },
      { text: b('9000', '9000') },
      { text: b('Impossible to say without counting', 'Ohne Zählen nicht zu sagen') },
    ],
    explain: b('Total mass ÷ mass of one = number: 1500 g ÷ 6 g = 250 screws. Chemists count atoms the same way, only the mass of one atom is tiny, so the number is huge.',
      'Gesamtmasse ÷ Masse eines Stücks = Anzahl: 1500 g ÷ 6 g = 250 Schrauben. Chemiker zählen Atome genauso, nur ist die Masse eines Atoms winzig und die Anzahl deshalb riesig.') },
  { id: 'i12e', unit: 12, kind: 'choice', format: 'why', evidence: 'explain', withConfidence: true, concepts: ['u12.weigh-to-count'], targets: ['equal-mass-equal-count'],
    prompt: b('Counting by weighing works for a bag of identical screws. Why does it fail for a bag of mixed screws and nails?', 'Zählen durch Wiegen klappt bei einer Tüte gleicher Schrauben. Warum klappt es nicht bei einer Tüte mit gemischten Schrauben und Nägeln?'),
    options: [
      { text: b('A mixed bag weighs less', 'Eine gemischte Tüte wiegt weniger') },
      { text: b('The pieces do not all have the same mass, so the total mass no longer gives the number', 'Die Stücke haben nicht alle dieselbe Masse, also ergibt die Gesamtmasse nicht mehr die Anzahl'), correct: true },
      { text: b('It works anyway: the same mass always means the same number of pieces', 'Es klappt trotzdem: Dieselbe Masse bedeutet immer dieselbe Anzahl Stücke'), mis: 'equal-mass-equal-count' },
      { text: b('Balances cannot weigh metal objects accurately', 'Waagen können Metallteile nicht genau wiegen') },
    ],
    explain: b('Dividing the total mass by the mass of one piece only works when every piece has that mass. For an element this holds because every sample has the same mix of isotopes, so the average mass per atom is fixed.',
      'Die Gesamtmasse durch die Masse eines Stücks zu teilen, klappt nur, wenn jedes Stück diese Masse hat. Bei einem Element stimmt das, weil jede Portion dieselbe Isotopenmischung hat; die mittlere Masse pro Atom ist also fest.') },
  { id: 'i12f', unit: 12, kind: 'choice', format: 'predict', evidence: 'transfer', withConfidence: true, concepts: ['u12.weigh-to-count'], targets: ['mass-is-one-atom'],
    prompt: b('Chlorine is about 76 % chlorine-35 (34.97 u) and 24 % chlorine-37 (36.97 u). Why can a chemist still count chlorine atoms by weighing with one value, 35.45 g/mol?', 'Chlor besteht zu etwa 76 % aus Chlor-35 (34,97 u) und zu 24 % aus Chlor-37 (36,97 u). Warum kann man Chloratome trotzdem mit einem Wert, 35,45 g/mol, durch Wiegen zählen?'),
    options: [
      { text: b('Every chlorine atom has a mass of exactly 35.45 u', 'Jedes Chloratom hat genau die Masse 35,45 u'), mis: 'mass-is-one-atom' },
      { text: b('Ordinary samples all have about the same isotope mix, so the average mass per atom is the same in each', 'Gewöhnliche Proben haben alle etwa dieselbe Isotopenmischung, also ist die mittlere Masse pro Atom in jeder gleich'), correct: true },
      { text: b('The isotopes have the same mass, only different numbers of protons', 'Die Isotope haben dieselbe Masse, nur verschieden viele Protonen') },
      { text: b('Chlorine-37 is too rare to matter', 'Chlor-37 ist zu selten, um eine Rolle zu spielen') },
    ],
    explain: b('No single atom has 35.45 u: each is 34.97 or 36.97 u. But in any ordinary sample about three in four are chlorine-35, so the average per atom is always about 35.45 u. A sample with a different mix, such as heavy water instead of water, needs its own molar mass.',
      'Kein einzelnes Atom hat 35,45 u: Jedes hat 34,97 oder 36,97 u. Aber in jeder gewöhnlichen Probe sind etwa drei von vier Atomen Chlor-35, also liegt der Mittelwert pro Atom immer bei etwa 35,45 u. Eine Probe mit anderer Mischung, etwa schweres Wasser statt Wasser, braucht ihre eigene molare Masse.') },

  // ---------- u12.mole ----------
  { id: 'i12g', unit: 12, kind: 'choice', format: 'predict', withConfidence: true, concepts: ['u12.mole'], targets: ['mole-is-mass'],
    prompt: b('How many atoms are in 1 mol of gold, and how many in 1 mol of aluminium?', 'Wie viele Atome sind in 1 mol Gold, und wie viele in 1 mol Aluminium?'),
    options: [
      { text: b('More in the gold: its atoms are heavier, so a mole of it is more', 'Mehr im Gold: Seine Atome sind schwerer, also ist ein Mol davon mehr'), mis: 'mole-is-mass' },
      { text: b('More in the aluminium: lighter atoms, more of them', 'Mehr im Aluminium: leichtere Atome, mehr davon') },
      { text: b('6.022 × 10²³ in each', 'In jedem 6,022 · 10²³'), correct: true },
      { text: b('1 in each: a mole is one atom\'s worth', 'In jedem 1: Ein Mol ist der Gegenwert eines Atoms') },
    ],
    explain: b('A mole is a count, like a dozen: 1 mol of anything is 6.022 × 10²³ particles. The masses differ, 196.967 g of gold against 26.982 g of aluminium, but the number is the same.',
      'Ein Mol ist eine Anzahl, wie ein Dutzend: 1 mol von irgendetwas sind 6,022 · 10²³ Teilchen. Die Massen unterscheiden sich, 196,967 g Gold gegenüber 26,982 g Aluminium, aber die Anzahl ist dieselbe.') },
  { id: 'i12h', unit: 12, kind: 'choice', format: 'why', evidence: 'explain', withConfidence: true, concepts: ['u12.mole'], targets: ['mole-is-mass'],
    prompt: b('Since 2019 the mole has been defined as exactly 6.02214076 × 10²³ particles. Before, it was the number of atoms in 12 g of carbon-12. What did the change make clear?', 'Seit 2019 ist das Mol als genau 6,02214076 · 10²³ Teilchen definiert. Vorher war es die Zahl der Atome in 12 g Kohlenstoff-12. Was hat die Änderung klargestellt?'),
    options: [
      { text: b('That a mole is 12 g of any substance', 'Dass ein Mol 12 g eines beliebigen Stoffes ist'), mis: 'mole-is-mass' },
      { text: b('That a mole is a fixed number of particles, defined without weighing anything', 'Dass ein Mol eine feste Anzahl von Teilchen ist, definiert, ohne etwas zu wiegen'), correct: true },
      { text: b('That carbon atoms got heavier', 'Dass Kohlenstoffatome schwerer geworden sind') },
      { text: b('That the Avogadro constant changes from substance to substance', 'Dass sich die Avogadro-Konstante von Stoff zu Stoff ändert') },
    ],
    explain: b('The old definition tied the count to a mass of carbon; the new one fixes the count itself. The number hardly moved (12 g of carbon-12 still holds 6.022 × 10²³ atoms to better than a billionth), but the mole is now plainly a number, like a dozen.',
      'Die alte Definition knüpfte die Anzahl an eine Masse Kohlenstoff; die neue legt die Anzahl selbst fest. Der Wert hat sich kaum bewegt (12 g Kohlenstoff-12 enthalten weiterhin 6,022 · 10²³ Atome, auf besser als ein Milliardstel), aber das Mol ist jetzt eindeutig eine Anzahl, wie ein Dutzend.') },
  { id: 'i12i', unit: 12, kind: 'choice', format: 'predict', evidence: 'transfer', withConfidence: true, concepts: ['u12.mole', 'u12.n-m-M'], targets: ['mole-is-mass'],
    prompt: b('An iron sample holds 1.2 × 10²⁴ atoms. How many moles of iron is that?', 'Eine Eisenprobe enthält 1,2 · 10²⁴ Atome. Wie viel Mol Eisen sind das?'),
    options: [
      { text: b('About 2 mol', 'Etwa 2 mol'), correct: true },
      { text: b('About 0.5 mol', 'Etwa 0,5 mol') },
      { text: b('About 1.2 mol', 'Etwa 1,2 mol'), mis: 'mole-is-mass' },
      { text: b('About 56 mol, iron\'s molar mass', 'Etwa 56 mol, die molare Masse von Eisen'), mis: 'mole-is-mass' },
    ],
    explain: b('n = N ÷ N_{A} = 1.2 × 10²⁴ ÷ 6.022 × 10²³ ≈ 2.0 mol, whatever the element: a mole counts particles. Only the mass depends on iron: 2.0 mol × 55.845 g/mol ≈ 111 g.',
      'n = N ÷ N_{A} = 1,2 · 10²⁴ ÷ 6,022 · 10²³ ≈ 2,0 mol, egal bei welchem Element: Ein Mol zählt Teilchen. Nur die Masse hängt vom Eisen ab: 2,0 mol · 55,845 g/mol ≈ 111 g.') },

  // ---------- u12.molar-mass ----------
  { id: 'i12j', unit: 12, kind: 'choice', format: 'predict', withConfidence: true, concepts: ['u12.molar-mass'], table: 'mass', targets: ['mole-is-mass'],
    prompt: b('Use the periodic table. What is the mass of 1 mol of sulfur atoms?', 'Nutze das Periodensystem. Welche Masse hat 1 mol Schwefelatome?'),
    options: [
      { text: b('1 g, because it is one mole', '1 g, weil es ein Mol ist'), mis: 'mole-is-mass' },
      { text: b('12 g, like carbon: every mole has the same mass', '12 g, wie bei Kohlenstoff: Jedes Mol hat dieselbe Masse'), mis: 'mole-is-mass' },
      { text: b('16 g: 16 protons', '16 g: 16 Protonen') },
      { text: b('32.06 g: the atomic mass, read in grams', '32,06 g: die Atommasse, in Gramm gelesen'), correct: true },
    ],
    explain: b('Sulfur\'s atomic mass is 32.06 u, so its molar mass is 32.06 g/mol: the same number, now in grams per mole. Its 16 protons give only about half the mass; the neutrons carry the rest.',
      'Die Atommasse von Schwefel ist 32,06 u, also ist seine molare Masse 32,06 g/mol: derselbe Zahlenwert, jetzt in Gramm pro Mol. Seine 16 Protonen bringen nur etwa die Hälfte der Masse; den Rest tragen die Neutronen.') },
  { id: 'i12k', unit: 12, kind: 'choice', format: 'why', evidence: 'explain', withConfidence: true, concepts: ['u12.molar-mass'],
    prompt: b('Carbon\'s atomic mass is 12.011 u and its molar mass is 12.011 g/mol. Why the same number?', 'Die Atommasse von Kohlenstoff ist 12,011 u, seine molare Masse 12,011 g/mol. Warum derselbe Zahlenwert?'),
    options: [
      { text: b('One gram is N_{A} atomic mass units, so N_{A} atoms of x u each have a mass of x g', 'Ein Gramm sind N_{A} atomare Masseneinheiten, also haben N_{A} Atome mit je x u die Masse x g'), correct: true },
      { text: b('u and g are the same unit with different names', 'u und g sind dieselbe Einheit mit verschiedenen Namen'), mis: 'mole-is-mass' },
      { text: b('By chance: for most elements the numbers differ', 'Zufall: Bei den meisten Elementen sind die Zahlen verschieden') },
      { text: b('One carbon atom has a mass of 12.011 g', 'Ein Kohlenstoffatom hat eine Masse von 12,011 g'), mis: 'mass-is-one-atom' },
    ],
    targets: ['mole-is-mass', 'mass-is-one-atom'],
    explain: b('1 u is 1.66 × 10⁻²⁴ g, and 6.022 × 10²³ of them make 1 g. So a mole of atoms of x u each has a mass of x g, for every element. One carbon atom is only 1.99 × 10⁻²³ g.',
      '1 u sind 1,66 · 10⁻²⁴ g, und 6,022 · 10²³ davon ergeben 1 g. Ein Mol Atome mit je x u hat also die Masse x g, bei jedem Element. Ein einzelnes Kohlenstoffatom hat nur 1,99 · 10⁻²³ g.') },
  { id: 'i12l', unit: 12, kind: 'choice', format: 'predict', evidence: 'transfer', withConfidence: true, concepts: ['u12.molar-mass', 'u12.equal-moles'], targets: ['equal-mass-equal-count'],
    prompt: b('A teacher wants the same number of iron and sulfur atoms for a reaction. She weighs 55.845 g of iron. How much sulfur (32.06 u) should she weigh?', 'Eine Lehrerin braucht für eine Reaktion gleich viele Eisen- und Schwefelatome. Sie wiegt 55,845 g Eisen ab. Wie viel Schwefel (32,06 u) soll sie abwiegen?'),
    options: [
      { text: b('55.845 g, the same mass', '55,845 g, dieselbe Masse'), mis: 'equal-mass-equal-count' },
      { text: b('32.06 g: 1 mol of each', '32,06 g: von jedem 1 mol'), correct: true },
      { text: b('16 g, sulfur\'s atomic number', '16 g, die Ordnungszahl von Schwefel') },
      { text: b('97 g, so that the two masses add up to the right amount', '97 g, damit sich die beiden Massen richtig ergänzen') },
    ],
    explain: b('55.845 g of iron is 1 mol of iron atoms. The same number of sulfur atoms is 1 mol of sulfur: 32.06 g. Equal masses would give her about 1.7 times as many sulfur atoms as iron atoms (55.845 ÷ 32.06).',
      '55,845 g Eisen sind 1 mol Eisenatome. Gleich viele Schwefelatome sind 1 mol Schwefel: 32,06 g. Gleiche Massen ergäben etwa 1,7-mal so viele Schwefelatome wie Eisenatome (55,845 ÷ 32,06).') },

  // ---------- u12.n-m-M ----------
  { id: 'i12m', unit: 12, kind: 'estimate', format: 'estimate', concepts: ['u12.n-m-M'],
    prompt: b('How many moles are in 100 g of iron (molar mass 55.845 g/mol)? Use n = m / M.', 'Wie viel Mol sind 100 g Eisen (molare Masse 55,845 g/mol)? Rechne mit n = m / M.'),
    min: 0, max: 6, step: 0.1, answer: 1.8, tolerance: 0.1, suffix: ' mol',
    near: [{ value: 5.6, tol: 0.1, note: b('5.6 multiplies instead of dividing (or divides M by m). Grams ÷ grams per mole leaves moles: 100 ÷ 55.845.', '5,6 multipliziert statt zu teilen (oder teilt M durch m). Gramm ÷ Gramm pro Mol ergibt Mol: 100 ÷ 55,845.') }],
    explain: b('n = m / M = 100 g ÷ 55.845 g/mol = 1.79 mol. The units guide you: g ÷ (g/mol) = mol.', 'n = m / M = 100 g ÷ 55,845 g/mol = 1,79 mol. Die Einheiten zeigen den Weg: g ÷ (g/mol) = mol.') },
  { id: 'i12n', unit: 12, kind: 'choice', format: 'why', evidence: 'explain', withConfidence: true, concepts: ['u12.n-m-M'], targets: ['mole-is-mass'],
    prompt: b('To turn a mass in grams into an amount in moles, you divide by the molar mass. Why divide?', 'Um eine Masse in Gramm in eine Stoffmenge in Mol umzurechnen, teilt man durch die molare Masse. Warum teilen?'),
    options: [
      { text: b('The molar mass is the mass of one mole; dividing asks how many of those portions fit into the sample', 'Die molare Masse ist die Masse von einem Mol; Teilen fragt, wie viele solcher Portionen in die Probe passen'), correct: true },
      { text: b('Because a mole is a mass, and dividing converts grams into that larger mass unit', 'Weil ein Mol eine Masse ist und Teilen Gramm in diese größere Masseneinheit umrechnet'), mis: 'mole-is-mass' },
      { text: b('Dividing and multiplying give the same result here', 'Teilen und Malnehmen ergeben hier dasselbe') },
      { text: b('To remove the mass of the electrons', 'Um die Masse der Elektronen herauszurechnen') },
    ],
    explain: b('Like 1500 g of screws ÷ 6 g per screw = 250 screws: m ÷ (mass per mole) = number of moles. The units check it: g ÷ (g/mol) = mol.',
      'Wie bei 1500 g Schrauben ÷ 6 g pro Schraube = 250 Schrauben: m ÷ (Masse pro Mol) = Zahl der Mol. Die Einheiten bestätigen es: g ÷ (g/mol) = mol.') },
  { id: 'i12o', unit: 12, kind: 'choice', format: 'predict', evidence: 'transfer', withConfidence: true, concepts: ['u12.n-m-M'], targets: ['mole-is-mass'],
    prompt: b('Table sugar, sucrose, has a molar mass of 342.30 g/mol. How many moles of sucrose are in a 1 kg bag?', 'Haushaltszucker, Saccharose, hat eine molare Masse von 342,30 g/mol. Wie viel Mol Saccharose sind in einer 1-kg-Packung?'),
    options: [
      { text: b('1000 mol: one mole per gram', '1000 mol: ein Mol pro Gramm'), mis: 'mole-is-mass' },
      { text: b('About 2.9 mol', 'Etwa 2,9 mol'), correct: true },
      { text: b('About 342 mol', 'Etwa 342 mol') },
      { text: b('About 0.34 mol', 'Etwa 0,34 mol') },
    ],
    explain: b('n = m / M = 1000 g ÷ 342.30 g/mol = 2.92 mol. Big molecules mean few moles per kilogram; it is still 1.76 × 10²⁴ molecules.',
      'n = m / M = 1000 g ÷ 342,30 g/mol = 2,92 mol. Große Moleküle bedeuten wenige Mol pro Kilogramm; es sind trotzdem 1,76 · 10²⁴ Moleküle.') },
  { id: 'i12p', unit: 12, kind: 'estimate', format: 'estimate', evidence: 'transfer', concepts: ['u12.n-m-M', 'u12.molar-mass'],
    prompt: b('A recipe needs 2.0 mol of silver (molar mass 107.868 g/mol). How many grams do you weigh out? Use m = n × M.', 'Eine Vorschrift verlangt 2,0 mol Silber (molare Masse 107,868 g/mol). Wie viel Gramm wiegst du ab? Rechne mit m = n · M.'),
    min: 0, max: 300, step: 1, answer: 216, tolerance: 2, suffix: ' g',
    near: [{ value: 54, tol: 2, note: b('54 g divides instead of multiplying. Two moles weigh more than one: 2.0 × 107.868 g.', '54 g teilt statt zu multiplizieren. Zwei Mol wiegen mehr als eines: 2,0 · 107,868 g.') }],
    explain: b('m = n × M = 2.0 mol × 107.868 g/mol = 215.7 g. Moles times grams per mole leaves grams.', 'm = n · M = 2,0 mol · 107,868 g/mol = 215,7 g. Mol mal Gramm pro Mol ergibt Gramm.') },

  // ---------- u12.equal-moles ----------
  { id: 'i12q', unit: 12, kind: 'choice', format: 'predict', withConfidence: true, concepts: ['u12.equal-moles'], targets: ['equal-mass-equal-count'],
    prompt: b('10 g of copper (63.546 u) and 10 g of aluminium (26.982 u). Which holds more atoms?', '10 g Kupfer (63,546 u) und 10 g Aluminium (26,982 u). Was enthält mehr Atome?'),
    options: [
      { text: b('Both the same: 10 g each', 'Beide gleich viele: je 10 g'), mis: 'equal-mass-equal-count' },
      { text: b('The copper: its atoms are heavier, so 10 g of them is more atoms', 'Das Kupfer: Seine Atome sind schwerer, also sind 10 g davon mehr Atome') },
      { text: b('The aluminium, about 2.4 times as many', 'Das Aluminium, etwa 2,4-mal so viele'), correct: true },
      { text: b('The copper, about 2.4 times as many', 'Das Kupfer, etwa 2,4-mal so viele') },
    ],
    explain: b('Aluminium atoms have less mass, so it takes more of them for 10 g: 10 ÷ 26.982 = 0.371 mol against 10 ÷ 63.546 = 0.157 mol of copper, 2.36 times as many.',
      'Aluminiumatome haben weniger Masse, also braucht es mehr davon für 10 g: 10 ÷ 26,982 = 0,371 mol gegenüber 10 ÷ 63,546 = 0,157 mol Kupfer, 2,36-mal so viele.') },
  { id: 'i12r', unit: 12, kind: 'choice', format: 'why', evidence: 'explain', withConfidence: true, concepts: ['u12.equal-moles'], targets: ['equal-mass-equal-count'],
    prompt: b('1 mol of sulfur is 32.06 g, 1 mol of copper 63.546 g. Why do these unequal masses hold the same number of atoms?', '1 mol Schwefel sind 32,06 g, 1 mol Kupfer 63,546 g. Warum enthalten diese ungleichen Massen gleich viele Atome?'),
    options: [
      { text: b('They don\'t: the heavier sample has more atoms', 'Tun sie nicht: Die schwerere Portion hat mehr Atome'), mis: 'equal-mass-equal-count' },
      { text: b('Each copper atom has about twice the mass of a sulfur atom, so the same number of them weighs about twice as much', 'Jedes Kupferatom hat etwa die doppelte Masse eines Schwefelatoms, also wiegt dieselbe Anzahl etwa doppelt so viel'), correct: true },
      { text: b('Copper atoms are packed more tightly in the metal', 'Kupferatome sind im Metall dichter gepackt') },
      { text: b('Sulfur atoms are bigger, so fewer fit in 32 g', 'Schwefelatome sind größer, also passen weniger in 32 g') },
    ],
    explain: b('A mole is the same count for every element. The mass of a mole follows the mass of one atom: 63.546 ÷ 32.06 ≈ 2, so a mole of copper weighs about twice as much. How tightly the atoms pack, or how big they are, does not change their number.',
      'Ein Mol ist bei jedem Element dieselbe Anzahl. Die Masse eines Mols folgt der Masse eines Atoms: 63,546 ÷ 32,06 ≈ 2, also wiegt ein Mol Kupfer etwa doppelt so viel. Wie dicht die Atome gepackt sind oder wie groß sie sind, ändert ihre Anzahl nicht.') },
  { id: 'i12s', unit: 12, kind: 'rank', format: 'rank', evidence: 'transfer', concepts: ['u12.equal-moles', 'u12.n-m-M'], targets: ['equal-mass-equal-count'], mis: 'equal-mass-equal-count', table: 'mass',
    prompt: b('Four 100 g samples: aluminium, iron, silver, lead. Rank them by the number of atoms, most first. (Use the atomic masses in the periodic table.)', 'Vier Portionen von je 100 g: Aluminium, Eisen, Silber, Blei. Ordne sie nach der Zahl der Atome, die meisten zuerst. (Nutze die Atommassen im Periodensystem.)'),
    order: [b('aluminium (26.982 u)', 'Aluminium (26,982 u)'), b('iron (55.845 u)', 'Eisen (55,845 u)'), b('silver (107.868 u)', 'Silber (107,868 u)'), b('lead (207.21 u)', 'Blei (207,21 u)')],
    explain: b('Same mass, so the lightest atoms come first: 3.71 mol of aluminium, 1.79 mol of iron, 0.927 mol of silver, 0.483 mol of lead. The order is simply the reverse of the atomic masses.',
      'Gleiche Masse, also kommen die leichtesten Atome zuerst: 3,71 mol Aluminium, 1,79 mol Eisen, 0,927 mol Silber, 0,483 mol Blei. Die Reihenfolge ist einfach die Umkehrung der Atommassen.') },
  { id: 'i12t', unit: 12, kind: 'choice', format: 'odd', evidence: 'transfer', concepts: ['u12.equal-moles', 'u12.mole'], targets: ['equal-mass-equal-count'],
    prompt: b('Which sample holds a different number of particles from the other three?', 'Welche Portion enthält eine andere Zahl von Teilchen als die anderen drei?'),
    options: [
      { text: b('1 mol of copper, 63.546 g', '1 mol Kupfer, 63,546 g') },
      { text: b('18.015 g of water, 1 mol', '18,015 g Wasser, 1 mol') },
      { text: b('12.011 g of carbon, 1 mol', '12,011 g Kohlenstoff, 1 mol') },
      { text: b('63.546 g of aluminium', '63,546 g Aluminium'), correct: true },
    ],
    explain: b('Three of them are 1 mol, 6.022 × 10²³ particles each, whatever their masses. 63.546 g of aluminium matches copper\'s mass, not its count: it is 63.546 ÷ 26.982 = 2.36 mol, far more atoms.',
      'Drei davon sind 1 mol, je 6,022 · 10²³ Teilchen, egal wie schwer. 63,546 g Aluminium haben dieselbe Masse wie das Kupfer, aber nicht dieselbe Anzahl: 63,546 ÷ 26,982 = 2,36 mol, viel mehr Atome.') },
];
