import type { Bi } from '../i18n';
import { BANK_U1 } from './bank/u01';
import { BANK_U2 } from './bank/u02';
import { BANK_U3 } from './bank/u03';
import { BANK_U4 } from './bank/u04';
import { BANK_U5 } from './bank/u05';
import { BANK_U7 } from './bank/u07';
import { BANK_U8 } from './bank/u08';
import { BANK_U9 } from './bank/u09';
import { BANK_U10 } from './bank/u10';
import { BANK_U11 } from './bank/u11';

// Question bank. Each item names the concepts it exercises; wrong options can name the
// misconception they reveal. `evidence` says what a correct answer proves on the
// understanding ladder: predict (2), explain (3), transfer (4, only counts after a delay).

export type Evidence = 'seen' | 'predict' | 'explain' | 'transfer';
export type Format = 'predict' | 'why' | 'rank' | 'estimate' | 'odd' | 'flaw' | 'build' | 'draw' | 'explain' | 'terms' | 'locate';

export interface Option { text: Bi; correct?: boolean; mis?: string; }
import type { OverlayId } from './elements';
/** `table`: the question links to the periodic table (optionally with an overlay) instead of expecting memorised data. */
interface Base { id: string; unit: number; concepts: string[]; prompt: Bi; explain: Bi; evidence?: Evidence; format: Format; targets?: string[]; table?: OverlayId; }
export interface ChoiceItem extends Base { kind: 'choice'; options: Option[]; withConfidence?: boolean; }
export interface RankItem extends Base { kind: 'rank'; order: Bi[]; mis?: string; }   // `order` is the correct order
/** `near`: answers close to another meaningful value get a note saying what they match instead. */
export interface EstimateItem extends Base { kind: 'estimate'; min: number; max: number; step: number; answer: number; tolerance: number; suffix: string; near?: { value: number; tol: number; note: Bi }[]; }
/** `flaw` is the first wrong step; `alsoFalse` are later steps that are false only because they follow from it (partly right). */
export interface FlawItem extends Base { kind: 'flaw'; lines: Bi[]; flaw: number; alsoFalse?: number[]; near?: { step: number; note: Bi }[]; }
/** `near`: steps that are not the slip but point at the right idea; they earn partial credit with their own note. */
export type Item = ChoiceItem | RankItem | EstimateItem | FlawItem;

const b = (en: string, de: string): Bi => ({ en, de });

export const BANK: Item[] = [
  // Unit 0 — the map. Core-element recall is the goal here, so these items test it directly.
  { id: 'u0a', unit: 0, kind: 'choice', format: 'predict', withConfidence: true, concepts: ['u0.core-elements'],
    prompt: b('Which element has the symbol K?', 'Welches Element hat das Symbol K?'),
    options: [{ text: b('Potassium (Kalium)', 'Kalium'), correct: true }, { text: b('Krypton', 'Krypton') }, { text: b('Calcium', 'Calcium') }, { text: b('Carbon', 'Kohlenstoff') }],
    explain: b('K is potassium, from its Latin and German name Kalium. Krypton is Kr, calcium Ca, carbon C.', 'K ist Kalium. Krypton ist Kr, Calcium Ca, Kohlenstoff C.') },
  { id: 'u0b', unit: 0, kind: 'choice', format: 'predict', withConfidence: true, concepts: ['u0.core-elements'],
    prompt: b('Which element has 8 protons?', 'Welches Element hat 8 Protonen?'),
    options: [{ text: b('Nitrogen', 'Stickstoff') }, { text: b('Oxygen', 'Sauerstoff'), correct: true }, { text: b('Fluorine', 'Fluor') }, { text: b('Sulfur', 'Schwefel') }],
    explain: b('Atomic number 8 is oxygen. The [[atomic-number]] counts protons and sets the order: N is 7, F is 9, S is 16.', 'Ordnungszahl 8 ist Sauerstoff. Die [[atomic-number]] zählt Protonen und legt die Reihenfolge fest: N ist 7, F ist 9, S ist 16.') },
  { id: 'u0c', unit: 0, kind: 'choice', format: 'predict', withConfidence: true, concepts: ['u0.core-elements', 'u0.rows-shells'],
    prompt: b('Which element sits in period 3, group 17?', 'Welches Element steht in Periode 3, Gruppe 17?'),
    options: [{ text: b('Fluorine', 'Fluor') }, { text: b('Chlorine', 'Chlor'), correct: true }, { text: b('Argon', 'Argon') }, { text: b('Sulfur', 'Schwefel') }],
    explain: b('Chlorine: three shells (2, 8, 7) and seven outer electrons. Fluorine is the [[halogen]] one row up, argon the [[noble-gas]] next door.', 'Chlor: drei Schalen (2, 8, 7) und sieben Außenelektronen. Fluor ist das [[halogen]] eine Zeile darüber, Argon das [[noble-gas]] daneben.') },
  { id: 'u0d', unit: 0, kind: 'choice', format: 'predict', withConfidence: true, concepts: ['u0.rows-shells'], table: 'category',
    prompt: b('Magnesium is in period 3. How many electron shells does a magnesium atom have?', 'Magnesium steht in Periode 3. Wie viele Elektronenschalen hat ein Magnesiumatom?'),
    options: [{ text: b('2', '2') }, { text: b('3', '3'), correct: true }, { text: b('12', '12') }, { text: b('It depends on the isotope', 'Das hängt vom Isotop ab') }],
    explain: b('The [[period]] number is the number of shells: 2, 8, 2 for magnesium.', 'Die Nummer der [[period]] ist die Zahl der Schalen: 2, 8, 2 bei Magnesium.') },
  { id: 'u0e', unit: 0, kind: 'choice', format: 'predict', withConfidence: true, concepts: ['u0.columns-outer'], targets: ['group-number-literal'], table: 'category',
    prompt: b('Nitrogen sits in group 15. How many outer electrons does it have?', 'Stickstoff steht in Gruppe 15. Wie viele Außenelektronen hat er?'),
    options: [{ text: b('3', '3') }, { text: b('5', '5'), correct: true }, { text: b('7', '7') }, { text: b('15', '15'), mis: 'group-number-literal' }],
    explain: b('For groups 13–18, subtract 10: group 15 has 5 outer electrons. Nitrogen needs three more for an octet, so it forms three bonds.', 'Bei den Gruppen 13–18 zieht man 10 ab: Gruppe 15 hat 5 Außenelektronen. Stickstoff fehlen drei zum Oktett, also bildet er drei Bindungen.') },
  { id: 'u0f', unit: 0, kind: 'choice', format: 'odd', concepts: ['u0.families'], table: 'category',
    prompt: b('Which pair belongs to the same family?', 'Welches Paar gehört zur selben Familie?'),
    options: [{ text: b('Fluorine and chlorine', 'Fluor und Chlor'), correct: true }, { text: b('Sodium and magnesium', 'Natrium und Magnesium') }, { text: b('Oxygen and nitrogen', 'Sauerstoff und Stickstoff') }, { text: b('Carbon and calcium', 'Kohlenstoff und Calcium') }],
    explain: b('F and Cl share group 17: seven outer electrons each, both grab one more and form F⁻ and Cl⁻. The other pairs are neighbours in a row, not a column.', 'F und Cl teilen sich Gruppe 17: je sieben Außenelektronen, beide holen sich eins dazu und bilden F⁻ und Cl⁻. Die anderen Paare sind Nachbarn in einer Zeile, nicht in einer Spalte.') },
  { id: 'u0g', unit: 0, kind: 'choice', format: 'why', evidence: 'explain', withConfidence: true, concepts: ['u0.mass-average'], targets: ['mass-is-one-atom'],
    prompt: b('Chlorine\'s atomic mass is 35.45. Why is it not a whole number?', 'Die Atommasse von Chlor ist 35,45. Warum ist sie keine ganze Zahl?'),
    options: [
      { text: b('It is an average over chlorine\'s isotopes', 'Sie ist ein Mittelwert über die Isotope von Chlor'), correct: true },
      { text: b('Each chlorine atom has 18.45 neutrons', 'Jedes Chloratom hat 18,45 Neutronen'), mis: 'mass-is-one-atom' },
      { text: b('Electrons add the extra 0.45', 'Die Elektronen bringen die zusätzlichen 0,45'), mis: 'mass-is-one-atom' },
      { text: b('It is rounded differently in each country', 'Sie wird in jedem Land anders gerundet') },
    ],
    explain: b('About 76 % of chlorine atoms are Cl-35 and 24 % are Cl-37: 0.76 × 35 + 0.24 × 37 ≈ 35.5 (with the exact isotope masses, 34.97 and 36.97 u, you get 35.45). Each single atom has a whole number of neutrons, 18 or 20.', 'Etwa 76 % der Chloratome sind Cl-35, 24 % Cl-37: 0,76 × 35 + 0,24 × 37 ≈ 35,5 (mit den genauen Isotopenmassen, 34,97 und 36,97 u, ergibt sich 35,45). Jedes einzelne Atom hat eine ganze Zahl Neutronen, 18 oder 20.') },
  { id: 'u0h', unit: 0, kind: 'rank', format: 'rank', concepts: ['u0.families', 'u5.en'], table: 'chi',
    prompt: b('Use the table: rank by electronegativity, highest first.', 'Nutze das Periodensystem: Ordne nach Elektronegativität, die höchste zuerst.'),
    order: [b('F', 'F'), b('O', 'O'), b('N', 'N'), b('C', 'C')],
    explain: b('3.98, 3.44, 3.04, 2.55: electronegativity rises along a row towards fluorine. Same shell, but each step adds a proton, so the nucleus pulls harder on shared electrons (unit 2 puts a number on this).', '3,98; 3,44; 3,04; 2,55: Die Elektronegativität steigt entlang einer Zeile zum Fluor hin. Gleiche Schale, aber jeder Schritt bringt ein Proton dazu, also zieht der Kern stärker an gemeinsamen Elektronen (Einheit 2 macht daraus eine Zahl).') },
  { id: 'u0i', unit: 0, kind: 'choice', format: 'predict', withConfidence: true, concepts: ['u0.blocks'], table: 'block',
    prompt: b('Where in the table are d orbitals being filled?', 'Wo im Periodensystem füllen sich d-Orbitale?'),
    options: [{ text: b('Groups 3 to 12, the transition metals', 'Gruppen 3 bis 12, die Übergangsmetalle'), correct: true }, { text: b('Groups 1 and 2', 'Gruppen 1 und 2') }, { text: b('Groups 13 to 18', 'Gruppen 13 bis 18') }, { text: b('Only in the two rows below the table', 'Nur in den zwei Zeilen unter der Tabelle') }],
    explain: b('The d-block is ten columns wide because five d orbitals hold ten electrons. The two rows below are the f-block: seven f orbitals, fourteen electrons.', 'Der d-Block ist zehn Spalten breit, weil fünf d-Orbitale zehn Elektronen fassen. Die zwei Zeilen darunter sind der f-Block: sieben f-Orbitale, vierzehn Elektronen.') },
  { id: 'u0j', unit: 0, kind: 'estimate', format: 'estimate', concepts: ['u0.core-elements'],
    prompt: b('Estimate the atomic mass of carbon, in u.', 'Schätze die Atommasse von Kohlenstoff in u.'),
    min: 1, max: 40, step: 0.5, answer: 12, tolerance: 0.5, suffix: ' u',
    explain: b('12.01 u: six protons and six neutrons in almost every carbon atom. Carbon-12 defines the atomic mass unit.', '12,01 u: sechs Protonen und sechs Neutronen in fast jedem Kohlenstoffatom. Kohlenstoff-12 definiert die atomare Masseeinheit.') },
  { id: 'u0k', unit: 0, kind: 'choice', format: 'predict', withConfidence: true, concepts: ['u0.core-elements', 'u0.families'],
    prompt: b('Which [[noble-gas]] ends period 3?', 'Welches [[noble-gas]] schließt Periode 3 ab?'),
    options: [{ text: b('Neon', 'Neon') }, { text: b('Argon', 'Argon'), correct: true }, { text: b('Krypton', 'Krypton') }, { text: b('Chlorine', 'Chlor') }],
    explain: b('Argon, Z = 18: shells 2, 8, 8. Neon closes period 2, krypton period 4.', 'Argon, Z = 18: Schalen 2, 8, 8. Neon schließt Periode 2 ab, Krypton Periode 4.') },
  { id: 'u0l', unit: 0, kind: 'choice', format: 'why', evidence: 'explain', withConfidence: true, concepts: ['u0.families'], targets: ['order-by-mass'], table: 'mass',
    prompt: b('Argon (39.95 u) comes before potassium (39.10 u), although it is heavier. Why?', 'Argon (39,95 u) steht vor Kalium (39,10 u), obwohl es schwerer ist. Warum?'),
    options: [
      { text: b('The table is ordered by protons, not mass', 'Das Periodensystem ist nach Protonen geordnet, nicht nach Masse'), correct: true },
      { text: b('It is a mistake nobody has fixed', 'Es ist ein Fehler, den niemand behoben hat'), mis: 'order-by-mass' },
      { text: b('Gases always come before metals', 'Gase kommen immer vor Metallen') },
    ],
    explain: b('Argon has 18 protons, potassium 19. Argon just has more neutrons on average. Mendeleev already swapped tellurium and iodine for the same reason, before protons were known.', 'Argon hat 18 Protonen, Kalium 19. Argon hat nur im Mittel mehr Neutronen. Mendelejew vertauschte Tellur und Iod schon aus diesem Grund, bevor man Protonen kannte.') },

  // Unit 0 — explanation and transfer variants
  { id: 'u0m', unit: 0, kind: 'choice', format: 'why', evidence: 'explain', withConfidence: true, concepts: ['u0.rows-shells'], targets: ['rows-columns-swapped'], table: 'shells',
    prompt: b('Why does every element in period 3 have three shells?', 'Warum hat jedes Element der Periode 3 drei Schalen?'),
    options: [
      { text: b('A new row starts each time a new shell begins to fill', 'Jede neue Zeile beginnt, wenn sich eine neue Schale zu füllen beginnt'), correct: true },
      { text: b('The row number counts the outer electrons', 'Die Zeilennummer zählt die Außenelektronen'), mis: 'rows-columns-swapped' },
      { text: b('Period 3 elements have three more protons than period 2', 'Elemente der Periode 3 haben drei Protonen mehr als die der Periode 2') },
      { text: b('Heavier elements always get one more shell', 'Schwerere Elemente bekommen immer eine Schale mehr') },
    ],
    explain: b('A row ends at a noble gas, when a shell\'s s and p part is full; the next element opens a new shell. Sodium starts shell 3 and argon closes it, so every element in between has electrons in three shells.', 'Eine Zeile endet beim Edelgas, wenn der s- und p-Teil einer Schale voll ist; das nächste Element eröffnet eine neue Schale. Natrium beginnt Schale 3, Argon schließt sie ab, also haben alle dazwischen Elektronen in drei Schalen.') },
  { id: 'u0n', unit: 0, kind: 'choice', format: 'predict', evidence: 'transfer', withConfidence: true, concepts: ['u0.rows-shells', 'u0.columns-outer'], table: 'category',
    prompt: b('An element has four shells and forms a 2+ ion, like magnesium. Which is it?', 'Ein Element hat vier Schalen und bildet wie Magnesium ein 2+-Ion. Welches ist es?'),
    options: [
      { text: b('Calcium', 'Calcium'), correct: true },
      { text: b('Magnesium', 'Magnesium') },
      { text: b('Strontium', 'Strontium') },
      { text: b('Selenium', 'Selen') },
    ],
    explain: b('Four shells means period 4; a 2+ ion means two outer electrons to give away, group 2. Period 4, group 2 is calcium: 2, 8, 8, 2. Magnesium has three shells, strontium five, and selenium takes electrons instead.', 'Vier Schalen bedeuten Periode 4; ein 2+-Ion bedeutet zwei abgegebene Außenelektronen, also Gruppe 2. Periode 4, Gruppe 2 ist Calcium: 2, 8, 8, 2. Magnesium hat drei Schalen, Strontium fünf, und Selen nimmt Elektronen auf.') },
  { id: 'u0o', unit: 0, kind: 'choice', format: 'why', evidence: 'explain', withConfidence: true, concepts: ['u0.columns-outer'], targets: ['rows-columns-swapped'], table: 'outer',
    prompt: b('Fluorine and chlorine both form ions with a 1− charge. Why?', 'Fluor und Chlor bilden beide Ionen mit der Ladung 1−. Warum?'),
    options: [
      { text: b('Both have seven outer electrons and take one more to reach eight', 'Beide haben sieben Außenelektronen und nehmen eins auf, um auf acht zu kommen'), correct: true },
      { text: b('Both have seven shells', 'Beide haben sieben Schalen'), mis: 'rows-columns-swapped' },
      { text: b('Both are gases at room temperature', 'Beide sind bei Raumtemperatur Gase') },
      { text: b('Both have 17 protons', 'Beide haben 17 Protonen') },
    ],
    explain: b('Same column, same number of outer electrons: fluorine is 2, 7 and chlorine 2, 8, 7. One more electron completes the octet, so both become 1− ions.', 'Gleiche Spalte, gleich viele Außenelektronen: Fluor ist 2, 7 und Chlor 2, 8, 7. Ein Elektron mehr vervollständigt das Oktett, also werden beide zu 1−-Ionen.') },
  { id: 'u0p', unit: 0, kind: 'choice', format: 'predict', evidence: 'transfer', withConfidence: true, concepts: ['u0.columns-outer'], targets: ['group-number-literal'], table: 'outer',
    prompt: b('Arsenic sits below phosphorus in group 15. With hydrogen, arsenic forms…', 'Arsen steht in Gruppe 15 unter Phosphor. Mit Wasserstoff bildet Arsen…'),
    options: [
      { text: b('{{AsH}}', '{{AsH}}') },
      { text: b('{{AsH2}}', '{{AsH2}}') },
      { text: b('{{AsH3}}', '{{AsH3}}'), correct: true },
      { text: b('{{AsH5}}', '{{AsH5}}'), mis: 'group-number-literal' },
    ],
    explain: b('Group 15: five outer electrons, three short of an octet, so three bonds to hydrogen, like {{NH3}} and {{PH3}}. {{AsH3}} is arsine, a very toxic gas.', 'Gruppe 15: fünf Außenelektronen, drei fehlen zum Oktett, also drei Bindungen zu Wasserstoff, wie bei {{NH3}} und {{PH3}}. {{AsH3}} ist Arsan, ein sehr giftiges Gas.') },
  { id: 'u0q', unit: 0, kind: 'choice', format: 'predict', evidence: 'transfer', withConfidence: true, concepts: ['u0.families'], table: 'category',
    prompt: b('Astatine is the [[halogen]] below iodine. With sodium it should form…', 'Astat ist das [[halogen]] unter Iod. Mit Natrium sollte es … bilden'),
    options: [
      { text: b('{{NaAt}}', '{{NaAt}}'), correct: true },
      { text: b('{{Na2At}}', '{{Na2At}}') },
      { text: b('{{NaAt2}}', '{{NaAt2}}') },
      { text: b('nothing: astatine is a noble gas', 'nichts: Astat ist ein Edelgas') },
    ],
    explain: b('Halogens take one electron and form 1− ions, so with Na⁺ the formula is NaAt, like NaCl and NaI. Astatine is so radioactive that only traces have ever been made, but the family still predicts its salts.', 'Halogene nehmen ein Elektron auf und bilden 1−-Ionen, mit Na⁺ also NaAt, wie NaCl und NaI. Astat ist so radioaktiv, dass immer nur Spuren hergestellt wurden – die Familie sagt seine Salze trotzdem voraus.') },
  { id: 'u0r', unit: 0, kind: 'choice', format: 'why', evidence: 'explain', withConfidence: true, concepts: ['u0.blocks'], table: 'block',
    prompt: b('Why is the d-block ten columns wide?', 'Warum ist der d-Block zehn Spalten breit?'),
    options: [
      { text: b('Five d orbitals hold two electrons each', 'Fünf d-Orbitale fassen je zwei Elektronen'), correct: true },
      { text: b('Each d orbital holds ten electrons', 'Jedes d-Orbital fasst zehn Elektronen') },
      { text: b('There are ten metals in every row', 'In jeder Zeile gibt es zehn Metalle') },
      { text: b('Shell 4 holds ten electrons', 'Schale 4 fasst zehn Elektronen') },
    ],
    explain: b('Each orbital holds two electrons, and each column adds one electron. A d subshell has five orbitals, so ten columns; p has three orbitals, six columns; s has one, two columns.', 'Jedes Orbital fasst zwei Elektronen, und jede Spalte fügt ein Elektron hinzu. Eine d-Unterschale hat fünf Orbitale, also zehn Spalten; p hat drei Orbitale, sechs Spalten; s hat eines, zwei Spalten.') },
  { id: 'u0s', unit: 0, kind: 'choice', format: 'predict', evidence: 'transfer', withConfidence: true, concepts: ['u0.blocks'], table: 'block',
    prompt: b('Gallium (Z = 31) comes right after zinc, the last d-block element of period 4. Gallium\'s newest electron goes into…', 'Gallium (Z = 31) folgt direkt auf Zink, das letzte d-Block-Element der Periode 4. Das neueste Elektron von Gallium landet in…'),
    options: [
      { text: b('4p', '4p'), correct: true },
      { text: b('3d', '3d') },
      { text: b('4s', '4s') },
      { text: b('4d', '4d') },
    ],
    explain: b('After zinc the 3d subshell is full, so gallium starts filling 4p: it is in the p-block, group 13, with three outer electrons (4s² 4p¹).', 'Nach Zink ist die 3d-Unterschale voll, also beginnt Gallium 4p zu füllen: Es steht im p-Block, Gruppe 13, mit drei Außenelektronen (4s² 4p¹).') },
  { id: 'u0t', unit: 0, kind: 'choice', format: 'predict', evidence: 'transfer', withConfidence: true, concepts: ['u0.mass-average'], targets: ['mass-is-one-atom'],
    prompt: b('Copper is about 69 % copper-63 and 31 % copper-65. Its atomic mass is closest to…', 'Kupfer besteht zu etwa 69 % aus Kupfer-63 und zu 31 % aus Kupfer-65. Seine Atommasse liegt am nächsten bei…'),
    options: [
      { text: b('63.0 u', '63,0 u') },
      { text: b('63.6 u', '63,6 u'), correct: true },
      { text: b('64.0 u', '64,0 u'), mis: 'mass-is-one-atom' },
      { text: b('64.4 u', '64,4 u') },
    ],
    explain: b('0.69 × 63 + 0.31 × 65 ≈ 63.6. The average sits closer to 63 because most copper atoms are copper-63; the table shows 63.55. A plain midpoint (64.0) would ignore how common each isotope is.', '0,69 × 63 + 0,31 × 65 ≈ 63,6. Der Mittelwert liegt näher an 63, weil die meisten Kupferatome Kupfer-63 sind; das Periodensystem zeigt 63,55. Die einfache Mitte (64,0) würde ignorieren, wie häufig jedes Isotop ist.') },
  { id: 'u0u', unit: 0, kind: 'choice', format: 'predict', withConfidence: true, concepts: ['u0.mass-average'], targets: ['mass-is-one-atom'],
    prompt: b('Bromine\'s atomic mass is 79.90, and its two natural isotopes are about equally common. They are most likely…', 'Die Atommasse von Brom ist 79,90, und seine zwei natürlichen Isotope sind etwa gleich häufig. Es sind am ehesten…'),
    options: [
      { text: b('bromine-79 and bromine-81', 'Brom-79 und Brom-81'), correct: true },
      { text: b('bromine-80 only', 'nur Brom-80'), mis: 'mass-is-one-atom' },
      { text: b('bromine-79.9 and bromine-80', 'Brom-79,9 und Brom-80'), mis: 'mass-is-one-atom' },
      { text: b('bromine-75 and bromine-85', 'Brom-75 und Brom-85') },
    ],
    explain: b('Two isotopes, roughly half each, average to about 79.9: bromine-79 (51 %) and bromine-81 (49 %). No single bromine atom weighs 79.9 u, and mass numbers are always whole.', 'Zwei Isotope, je etwa zur Hälfte, ergeben im Mittel etwa 79,9: Brom-79 (51 %) und Brom-81 (49 %). Kein einzelnes Bromatom wiegt 79,9 u, und Massenzahlen sind immer ganz.') },
  ...BANK_U1, ...BANK_U2, ...BANK_U3, ...BANK_U4, ...BANK_U5,
  // Unit 6
  { id: 'i6a', unit: 6, kind: 'choice', format: 'predict', withConfidence: true, concepts: ['u6.lp-squeeze', 'u6.lp-count'], targets: ['lone-pairs-ignored', 'molecular-vs-electron-geometry'],
    prompt: b('{{NH3}} has three bonds. Its H–N–H [[bond-angle]] is about…', '{{NH3}} hat drei Bindungen. Sein H–N–H-[[bond-angle]] beträgt etwa…'),
    options: [
      { text: b('120°', '120°'), mis: 'lone-pairs-ignored' },
      { text: b('107°', '107°'), correct: true },
      { text: b('90°', '90°') },
      { text: b('109.5°', '109,5°'), mis: 'molecular-vs-electron-geometry' },
    ],
    explain: b('Four pairs point to tetrahedron corners (109.5°); the [[lone-pair]] pushes harder and squeezes the bonds to 107°.', 'Vier Paare zeigen in Tetraederecken (109,5°); das [[lone-pair]] drückt stärker und staucht die Bindungen auf 107°.') },
  { id: 'i6b', unit: 6, kind: 'choice', format: 'predict', withConfidence: true, concepts: ['u6.multiple-bond'], targets: ['bond-type-sets-geometry', 'lone-pairs-ignored'],
    prompt: b('{{CO2}}: two C=O double bonds, no lone pairs on carbon. Its shape is…', '{{CO2}}: zwei C=O-Doppelbindungen, keine freien Paare am Kohlenstoff. Seine Gestalt ist…'),
    options: [
      { text: b('linear', 'linear'), correct: true },
      { text: b('tetrahedral, because carbon has four bonding pairs', 'tetraedrisch, weil Kohlenstoff vier bindende Paare hat'), mis: 'bond-type-sets-geometry' },
      { text: b('bent, like water', 'gewinkelt wie Wasser'), mis: 'lone-pairs-ignored' },
      { text: b('trigonal planar', 'trigonal-planar') },
    ],
    explain: b('Each double bond points one way, so carbon has two directions: 180°.', 'Jede Doppelbindung zeigt in eine Richtung, Kohlenstoff hat also zwei Richtungen: 180°.') },
  { id: 'i6c', unit: 6, kind: 'choice', format: 'predict', withConfidence: true, concepts: ['u6.symmetry'], targets: ['polar-bonds-polar-molecule'],
    prompt: b('{{CCl4}} has four polar C–Cl bonds. The molecule is…', '{{CCl4}} hat vier polare C–Cl-Bindungen. Das Molekül ist…'),
    options: [
      { text: b('polar, because its bonds are polar', 'polar, weil seine Bindungen polar sind'), mis: 'polar-bonds-polar-molecule' },
      { text: b('nonpolar: four equal pulls to tetrahedron corners cancel', 'unpolar: vier gleiche Bindungsdipole zu den Tetraederecken heben sich auf'), correct: true },
      { text: b('ionic', 'ionisch') },
    ],
    explain: b('Bond dipoles add as vectors. A perfect tetrahedron of equal pulls sums to zero.', 'Bindungsdipole addieren sich als Vektoren. Ein perfekter Tetraeder gleicher Bindungsdipole ergibt null.') },
  { id: 'i6d', unit: 6, kind: 'estimate', format: 'estimate', concepts: ['u6.lp-squeeze'],
    prompt: b('Estimate the H–O–H angle in water.', 'Schätze den H–O–H-Winkel in Wasser.'),
    min: 90, max: 180, step: 0.5, answer: 104.5, tolerance: 3, suffix: '°',
    explain: b('104.5°: two lone pairs squeeze harder than one (ammonia, 107°).', '104,5°: Zwei freie Paare stauchen stärker als eines (Ammoniak, 107°).') },
  // Unit 6 — explanation and transfer variants
  { id: 'i6e', unit: 6, kind: 'choice', format: 'predict', withConfidence: true, concepts: ['u6.pairs-repel'], targets: ['always-tetrahedral'],
    prompt: b('{{BF3}}: three B–F bonds and no lone pairs on boron. The F–B–F angle is…', '{{BF3}}: drei B–F-Bindungen und keine freien Paare am Bor. Der F–B–F-Winkel beträgt…'),
    options: [
      { text: b('90°', '90°') },
      { text: b('109.5°', '109,5°'), mis: 'always-tetrahedral' },
      { text: b('120°', '120°'), correct: true },
      { text: b('180°', '180°') },
    ],
    explain: b('Three directions spread as far apart as they can, in a plane: 120°. Boron brings only three outer electrons, so there is no fourth pair to push the bonds into a pyramid.', 'Drei Richtungen verteilen sich so weit wie möglich, in einer Ebene: 120°. Bor bringt nur drei Außenelektronen mit, also gibt es kein viertes Paar, das die Bindungen zu einer Pyramide drückt.') },
  { id: 'i6f', unit: 6, kind: 'choice', format: 'why', evidence: 'explain', withConfidence: true, concepts: ['u6.pairs-repel'], targets: ['bond-type-sets-geometry'],
    prompt: b('Why do the two C=O bonds in {{CO2}} point in exactly opposite directions?', 'Warum zeigen die beiden C=O-Bindungen in {{CO2}} in genau entgegengesetzte Richtungen?'),
    options: [
      { text: b('Two directions push each other as far apart as possible: 180°', 'Zwei Richtungen drücken sich so weit wie möglich auseinander: 180°'), correct: true },
      { text: b('Double bonds are always straight', 'Doppelbindungen sind immer gerade'), mis: 'bond-type-sets-geometry' },
      { text: b('The two oxygen atoms attract each other', 'Die beiden Sauerstoffatome ziehen sich an') },
      { text: b('Carbon\'s lone pairs push them apart', 'Die freien Paare des Kohlenstoffs drücken sie auseinander') },
    ],
    explain: b('Carbon has two directions, one per double bond, and nothing else around it. Two directions get furthest apart on opposite sides: a straight line. Formaldehyde has a double bond too and is not straight, so it is the count that matters, not the bond type.', 'Kohlenstoff hat zwei Richtungen, eine pro Doppelbindung, und sonst nichts. Zwei Richtungen kommen sich am wenigsten nahe, wenn sie auf entgegengesetzten Seiten liegen: eine Gerade. Formaldehyd hat auch eine Doppelbindung und ist nicht gerade – es kommt auf die Zahl an, nicht auf die Bindungsart.') },
  { id: 'i6g', unit: 6, kind: 'choice', format: 'predict', evidence: 'transfer', withConfidence: true, concepts: ['u6.pairs-repel'], targets: ['always-tetrahedral'],
    prompt: b('Beryllium chloride gas, {{BeCl2}}: beryllium has two outer electrons, both used in the bonds to Cl. Its shape is…', 'Gasförmiges Berylliumchlorid, {{BeCl2}}: Beryllium hat zwei Außenelektronen, beide stecken in den Bindungen zu Cl. Seine Gestalt ist…'),
    options: [
      { text: b('linear', 'linear'), correct: true },
      { text: b('bent, like water', 'gewinkelt wie Wasser') },
      { text: b('tetrahedral', 'tetraedrisch'), mis: 'always-tetrahedral' },
      { text: b('trigonal planar', 'trigonal-planar') },
    ],
    explain: b('Two bonds and no lone pairs: two directions, as far apart as possible, 180°. Water is bent only because of its two lone pairs.', 'Zwei Bindungen, keine freien Paare: zwei Richtungen, so weit wie möglich auseinander, 180°. Wasser ist nur wegen seiner zwei freien Paare gewinkelt.') },
  { id: 'i6h', unit: 6, kind: 'choice', format: 'why', evidence: 'explain', withConfidence: true, concepts: ['u6.lp-count'], targets: ['lone-pairs-ignored'],
    prompt: b('Water has only two bonds, yet its electron pairs point to the four corners of a tetrahedron. Why?', 'Wasser hat nur zwei Bindungen, trotzdem zeigen seine Elektronenpaare in die vier Ecken eines Tetraeders. Warum?'),
    options: [
      { text: b('Oxygen\'s two lone pairs take up directions too', 'Die zwei freien Paare des Sauerstoffs besetzen auch Richtungen'), correct: true },
      { text: b('The two hydrogens repel each other', 'Die beiden Wasserstoffe stoßen sich ab'), mis: 'lone-pairs-ignored' },
      { text: b('Oxygen secretly forms four bonds', 'Sauerstoff bildet heimlich vier Bindungen') },
      { text: b('Water is a liquid, so it bends', 'Wasser ist flüssig und biegt sich deshalb') },
    ],
    explain: b('Oxygen has six outer electrons: two go into the O–H bonds and four stay as two lone pairs. Two bonds plus two lone pairs make four directions.', 'Sauerstoff hat sechs Außenelektronen: zwei gehen in die O–H-Bindungen, vier bleiben als zwei freie Paare. Zwei Bindungen plus zwei freie Paare ergeben vier Richtungen.') },
  { id: 'i6i', unit: 6, kind: 'choice', format: 'predict', evidence: 'transfer', withConfidence: true, concepts: ['u6.lp-count'], targets: ['lone-pairs-ignored', 'molecular-vs-electron-geometry'],
    prompt: b('{{H2S}}: sulfur sits below oxygen in group 16 and forms two S–H bonds. Its shape is…', '{{H2S}}: Schwefel steht in Gruppe 16 unter Sauerstoff und bildet zwei S–H-Bindungen. Seine Gestalt ist…'),
    options: [
      { text: b('linear', 'linear'), mis: 'lone-pairs-ignored' },
      { text: b('bent', 'gewinkelt'), correct: true },
      { text: b('trigonal pyramidal', 'trigonal-pyramidal') },
      { text: b('tetrahedral', 'tetraedrisch'), mis: 'molecular-vs-electron-geometry' },
    ],
    explain: b('Six outer electrons, two bonds, two lone pairs: four directions, two of them atoms. Bent, like water; the measured angle is 92°.', 'Sechs Außenelektronen, zwei Bindungen, zwei freie Paare: vier Richtungen, zwei davon Atome. Gewinkelt wie Wasser; gemessen sind 92°.') },
  { id: 'i6j', unit: 6, kind: 'choice', format: 'predict', withConfidence: true, concepts: ['u6.shape-from-atoms'], targets: ['molecular-vs-electron-geometry', 'lone-pairs-ignored'],
    prompt: b('In {{NH3}} the four electron pairs point to the corners of a tetrahedron. The shape of the molecule is called…', 'In {{NH3}} zeigen die vier Elektronenpaare in die Ecken eines Tetraeders. Die Gestalt des Moleküls heißt…'),
    options: [
      { text: b('tetrahedral', 'tetraedrisch'), mis: 'molecular-vs-electron-geometry' },
      { text: b('trigonal pyramidal', 'trigonal-pyramidal'), correct: true },
      { text: b('trigonal planar', 'trigonal-planar'), mis: 'lone-pairs-ignored' },
      { text: b('bent', 'gewinkelt') },
    ],
    explain: b('The pairs are arranged tetrahedrally, but the name follows the atoms only: N at the top, three H below. That is a trigonal pyramid.', 'Die Paare sind tetraedrisch angeordnet, aber der Name folgt nur den Atomen: N oben, drei H darunter. Das ist eine trigonale Pyramide.') },
  { id: 'i6k', unit: 6, kind: 'choice', format: 'why', evidence: 'explain', withConfidence: true, concepts: ['u6.shape-from-atoms'], targets: ['molecular-vs-electron-geometry'],
    prompt: b('Water\'s electron pairs point to four corners. Why is water called bent, not tetrahedral?', 'Die Elektronenpaare von Wasser zeigen in vier Ecken. Warum heißt Wasser gewinkelt und nicht tetraedrisch?'),
    options: [
      { text: b('The shape is named from where the atoms are; lone pairs don\'t count in the name', 'Die Gestalt wird danach benannt, wo die Atome sind; freie Paare zählen im Namen nicht'), correct: true },
      { text: b('Water has only two electron pairs', 'Wasser hat nur zwei Elektronenpaare'), mis: 'lone-pairs-ignored' },
      { text: b('The lone pairs bend the oxygen atom itself', 'Die freien Paare verbiegen das Sauerstoffatom selbst') },
      { text: b('Small molecules can\'t be tetrahedral', 'Kleine Moleküle können nicht tetraedrisch sein') },
    ],
    explain: b('Two of the four directions end in hydrogen atoms; the other two are lone pairs with no atom at the end. Joining the three atoms gives a bent line, so the name is bent.', 'Zwei der vier Richtungen enden in Wasserstoffatomen, die anderen zwei sind freie Paare ohne Atom am Ende. Verbindet man die drei Atome, ergibt sich eine geknickte Linie, also heißt die Gestalt gewinkelt.') },
  { id: 'i6l', unit: 6, kind: 'choice', format: 'predict', evidence: 'transfer', withConfidence: true, concepts: ['u6.shape-from-atoms', 'u6.lp-count'], targets: ['lone-pairs-ignored', 'molecular-vs-electron-geometry'],
    prompt: b('The hydronium ion, {{H3O+}}: oxygen with three O–H bonds and one lone pair. Its shape is…', 'Das Oxonium-Ion, {{H3O+}}: Sauerstoff mit drei O–H-Bindungen und einem freien Paar. Seine Gestalt ist…'),
    options: [
      { text: b('trigonal planar', 'trigonal-planar'), mis: 'lone-pairs-ignored' },
      { text: b('trigonal pyramidal', 'trigonal-pyramidal'), correct: true },
      { text: b('tetrahedral', 'tetraedrisch'), mis: 'molecular-vs-electron-geometry' },
      { text: b('bent', 'gewinkelt') },
    ],
    explain: b('Count the electrons around oxygen: its own six, plus three from the hydrogens, minus one for the positive charge. Eight electrons, four pairs: three bonds and one lone pair. Four directions, three atoms: a pyramid, like ammonia.', 'Zähl die Elektronen um den Sauerstoff: seine eigenen sechs, drei von den Wasserstoffen, minus eins für die positive Ladung. Acht Elektronen, vier Paare: drei Bindungen und ein freies Paar. Vier Richtungen, drei Atome: eine Pyramide wie Ammoniak.') },
  { id: 'i6m', unit: 6, kind: 'choice', format: 'why', evidence: 'explain', withConfidence: true, concepts: ['u6.lp-squeeze'], targets: ['lone-pairs-ignored'],
    prompt: b('Why is water\'s H–O–H angle (104.5°) smaller than ammonia\'s H–N–H angle (107°)?', 'Warum ist der H–O–H-Winkel von Wasser (104,5°) kleiner als der H–N–H-Winkel von Ammoniak (107°)?'),
    options: [
      { text: b('Water has two lone pairs, and lone pairs push harder than bonds', 'Wasser hat zwei freie Paare, und freie Paare drücken stärker als Bindungen'), correct: true },
      { text: b('Oxygen is heavier than nitrogen', 'Sauerstoff ist schwerer als Stickstoff') },
      { text: b('Water has fewer bonds to keep apart, so they relax inwards', 'Wasser muss weniger Bindungen auseinanderhalten, also rücken sie zusammen'), mis: 'lone-pairs-ignored' },
      { text: b('The hydrogens in water attract each other', 'Die Wasserstoffe im Wasser ziehen sich an') },
    ],
    explain: b('Both molecules have four directions. Ammonia has one lone pair squeezing three bonds; water has two lone pairs squeezing two bonds, so its angle closes further.', 'Beide Moleküle haben vier Richtungen. Bei Ammoniak staucht ein freies Paar drei Bindungen, bei Wasser stauchen zwei freie Paare zwei Bindungen, also schließt sich der Winkel weiter.') },
  { id: 'i6n', unit: 6, kind: 'rank', format: 'rank', evidence: 'transfer', concepts: ['u6.lp-squeeze'], targets: ['lone-pairs-ignored'], mis: 'lone-pairs-ignored',
    prompt: b('Rank by H–N–H angle, largest first.', 'Ordne nach H–N–H-Winkel, den größten zuerst.'),
    order: [b('{{NH4+}}', '{{NH4+}}'), b('{{NH3}}', '{{NH3}}'), b('{{NH2-}}', '{{NH2-}}')],
    explain: b('The same nitrogen with four directions each time, but zero, one and two lone pairs. Each lone pair squeezes the angle a little more: 109.5°, 107°, about 104°.', 'Derselbe Stickstoff mit jeweils vier Richtungen, aber null, einem und zwei freien Paaren. Jedes freie Paar staucht den Winkel etwas mehr: 109,5°, 107°, etwa 104°.') },
  { id: 'i6o', unit: 6, kind: 'choice', format: 'why', evidence: 'explain', withConfidence: true, concepts: ['u6.multiple-bond'], targets: ['bond-type-sets-geometry'],
    prompt: b('Why does a C=O double bond count as only one direction around carbon?', 'Warum zählt eine C=O-Doppelbindung am Kohlenstoff nur als eine Richtung?'),
    options: [
      { text: b('Both of its electron pairs join the same two atoms, so they point the same way', 'Beide Elektronenpaare verbinden dieselben zwei Atome und zeigen deshalb in dieselbe Richtung'), correct: true },
      { text: b('Double bonds are weaker than single bonds', 'Doppelbindungen sind schwächer als Einfachbindungen') },
      { text: b('One of its two pairs is really a lone pair', 'Eines der beiden Paare ist eigentlich ein freies Paar') },
      { text: b('Each pair counts, so it is really two directions', 'Jedes Paar zählt, es sind also eigentlich zwei Richtungen'), mis: 'bond-type-sets-geometry' },
    ],
    explain: b('A direction ends at an atom or at a lone pair. Both pairs of a double bond lead to the same oxygen, so together they take one direction. They do push a little harder than a single bond.', 'Eine Richtung endet an einem Atom oder an einem freien Paar. Beide Paare einer Doppelbindung führen zum selben Sauerstoff, zusammen nehmen sie also eine Richtung ein. Sie drücken allerdings etwas stärker als eine Einfachbindung.') },
  { id: 'i6p', unit: 6, kind: 'choice', format: 'predict', evidence: 'transfer', withConfidence: true, concepts: ['u6.multiple-bond'], targets: ['bond-type-sets-geometry'],
    prompt: b('Hydrogen cyanide, {{HCN}}: carbon has a single bond to H and a triple bond to N, and no lone pairs. Its shape is…', 'Blausäure, {{HCN}}: Kohlenstoff hat eine Einfachbindung zu H, eine Dreifachbindung zu N und keine freien Paare. Seine Gestalt ist…'),
    options: [
      { text: b('linear', 'linear'), correct: true },
      { text: b('tetrahedral, because carbon has four bonding pairs', 'tetraedrisch, weil Kohlenstoff vier bindende Paare hat'), mis: 'bond-type-sets-geometry' },
      { text: b('bent', 'gewinkelt') },
      { text: b('trigonal planar', 'trigonal-planar') },
    ],
    explain: b('Two directions, one to H and one to N, however many pairs the triple bond holds: 180°.', 'Zwei Richtungen, eine zu H und eine zu N, egal wie viele Paare die Dreifachbindung enthält: 180°.') },
  { id: 'i6r', unit: 6, kind: 'choice', format: 'why', evidence: 'explain', withConfidence: true, concepts: ['u6.symmetry'], targets: ['polar-bonds-polar-molecule'],
    prompt: b('{{CO2}} has two polar C=O bonds but no overall [[dipole]]. Why?', '{{CO2}} hat zwei polare C=O-Bindungen, aber kein [[dipole|Gesamtdipolmoment]]. Warum?'),
    options: [
      { text: b('The two pulls are equal and point in opposite directions, so they cancel', 'Die beiden Bindungsdipole sind gleich stark und zeigen in entgegengesetzte Richtungen, also heben sie sich auf'), correct: true },
      { text: b('Carbon and oxygen have the same electronegativity', 'Kohlenstoff und Sauerstoff haben dieselbe Elektronegativität') },
      { text: b('Double bonds are never polar', 'Doppelbindungen sind nie polar') },
      { text: b('Molecules with polar bonds are always polar, so CO₂ must be slightly polar', 'Moleküle mit polaren Bindungen sind immer polar, also muss CO₂ leicht polar sein'), mis: 'polar-bonds-polar-molecule' },
    ],
    explain: b('Each C=O bond pulls towards its oxygen. In a straight line the two equal pulls point opposite ways and add up to zero.', 'Jede C=O-Bindung zieht zu ihrem Sauerstoff. Auf einer Geraden zeigen die zwei gleichen Bindungsdipole in entgegengesetzte Richtungen und ergeben zusammen null.') },
  { id: 'i6s', unit: 6, kind: 'choice', format: 'predict', evidence: 'transfer', withConfidence: true, concepts: ['u6.symmetry'], targets: ['symmetric-means-nonpolar'],
    prompt: b('Chloroform, {{CHCl3}}: carbon with one H and three Cl at the corners of a tetrahedron. Polar or not?', 'Chloroform, {{CHCl3}}: Kohlenstoff mit einem H und drei Cl in den Ecken eines Tetraeders. Polar oder nicht?'),
    options: [
      { text: b('Nonpolar: it is tetrahedral, so the pulls cancel', 'Unpolar: Es ist tetraedrisch, also heben sich die Bindungsdipole auf'), mis: 'symmetric-means-nonpolar' },
      { text: b('Polar: the four pulls are not equal', 'Polar: Die vier Bindungsdipole sind nicht gleich'), correct: true },
      { text: b('Nonpolar: C–H and C–Cl bonds are not polar', 'Unpolar: C–H- und C–Cl-Bindungen sind nicht polar') },
    ],
    explain: b('Three strong C–Cl pulls and one weak C–H pull do not cancel: chloroform measures 1.0 D.', 'Drei starke C–Cl-Bindungsdipole und ein schwacher C–H-Bindungsdipol heben sich nicht auf: Chloroform misst 1,0 D.') },
  { id: 'i6t', unit: 6, kind: 'choice', format: 'predict', withConfidence: true, concepts: ['u6.symmetry'], targets: ['polar-bonds-polar-molecule'],
    prompt: b('{{BF3}} has three polar B–F bonds, 120° apart in a plane. The molecule is…', '{{BF3}} hat drei polare B–F-Bindungen, 120° auseinander in einer Ebene. Das Molekül ist…'),
    options: [
      { text: b('polar, because its bonds are polar', 'polar, weil seine Bindungen polar sind'), mis: 'polar-bonds-polar-molecule' },
      { text: b('nonpolar: three equal pulls 120° apart cancel', 'unpolar: drei gleiche Bindungsdipole im Abstand von 120° heben sich auf'), correct: true },
      { text: b('ionic', 'ionisch') },
    ],
    explain: b('Three equal pulls spread evenly in a plane add up to zero, just like four equal pulls in a tetrahedron. BF₃ has no dipole.', 'Drei gleiche Bindungsdipole, gleichmäßig in einer Ebene verteilt, ergeben null, genau wie vier gleiche Bindungsdipole im Tetraeder. BF₃ hat kein Dipolmoment.') },
  ...BANK_U7, ...BANK_U8, ...BANK_U9, ...BANK_U10, ...BANK_U11,
];

export const itemById = (id: string) => BANK.find((i) => i.id === id);
export const DIAGNOSTIC = ['u0c', 'i1a', 'i2b', 'i3a', 'i5a', 'i6a', 'i8a'];
