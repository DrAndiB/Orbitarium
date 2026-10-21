import type { Bi } from '../i18n';

// Question bank. Each item names the concepts it exercises; wrong options can name the
// misconception they reveal. `evidence` says what a correct answer proves on the
// understanding ladder: predict (2), explain (3), transfer (4, only counts after a delay).

export type Evidence = 'seen' | 'predict' | 'explain' | 'transfer';
export type Format = 'predict' | 'rank' | 'estimate' | 'odd' | 'flaw' | 'build' | 'draw' | 'explain' | 'terms';

export interface Option { text: Bi; correct?: boolean; mis?: string; }
interface Base { id: string; unit: number; concepts: string[]; prompt: Bi; explain: Bi; evidence?: Evidence; format: Format; targets?: string[]; }
export interface ChoiceItem extends Base { kind: 'choice'; options: Option[]; withConfidence?: boolean; }
export interface RankItem extends Base { kind: 'rank'; order: Bi[]; mis?: string; }   // `order` is the correct order
export interface EstimateItem extends Base { kind: 'estimate'; min: number; max: number; step: number; answer: number; tolerance: number; suffix: string; }
export interface FlawItem extends Base { kind: 'flaw'; lines: Bi[]; flaw: number; }
export type Item = ChoiceItem | RankItem | EstimateItem | FlawItem;

const b = (en: string, de: string): Bi => ({ en, de });

export const BANK: Item[] = [
  // Unit 1
  { id: 'i1a', unit: 1, kind: 'choice', format: 'predict', withConfidence: true, concepts: ['u1.subshells'], targets: ['d-in-shell-2'],
    prompt: b('Which subshells exist in shell 2?', 'Welche Unterschalen gibt es in Schale 2?'),
    options: [
      { text: b('2s and 2p', '2s und 2p'), correct: true },
      { text: b('2s, 2p and 2d', '2s, 2p und 2d'), mis: 'd-in-shell-2' },
      { text: b('Only 2s', 'Nur 2s') },
      { text: b('2p and 2d', '2p und 2d'), mis: 'd-in-shell-2' },
    ],
    explain: b('Shell n has n subshells, so shell 2 has s and p. d orbitals first appear in shell 3.', 'Schale n hat n Unterschalen, Schale 2 also s und p. d-Orbitale gibt es erst ab Schale 3.') },
  { id: 'i1b', unit: 1, kind: 'choice', format: 'predict', withConfidence: true, concepts: ['u1.orbit-vs-orbital'], targets: ['bohr-orbits'],
    prompt: b('An electron in a 2p [[orbital]]…', 'Ein Elektron in einem 2p-[[orbital]]…'),
    options: [
      { text: b('travels along a figure-of-eight path', 'bewegt sich auf einer achtförmigen Bahn'), mis: 'bohr-orbits' },
      { text: b('is somewhere in a dumbbell-shaped cloud of probability', 'befindet sich irgendwo in einer hantelförmigen Wahrscheinlichkeitswolke'), correct: true },
      { text: b('circles the nucleus at a fixed radius', 'kreist in festem Abstand um den Kern'), mis: 'bohr-orbits' },
      { text: b('sits still in one of the two lobes', 'sitzt still in einer der beiden Keulen') },
    ],
    explain: b('An orbital is a cloud of where the electron is likely to be, not a track it follows. Bohr\'s circular orbits are the older picture.', 'Ein Orbital ist eine Wolke des wahrscheinlichen Aufenthalts, keine Bahn. Die Kreisbahnen sind das ältere Bohr\'sche Bild.') },
  { id: 'i1c', unit: 1, kind: 'estimate', format: 'estimate', concepts: ['u1.shells'],
    prompt: b('How many electrons fit into shell 3?', 'Wie viele Elektronen passen in Schale 3?'),
    min: 2, max: 32, step: 1, answer: 18, tolerance: 0, suffix: '',
    explain: b('2n² with n = 3 gives 18: 2 in 3s, 6 in 3p, 10 in 3d.', '2n² mit n = 3 ergibt 18: 2 in 3s, 6 in 3p, 10 in 3d.') },
  // Unit 2
  { id: 'i2a', unit: 2, kind: 'rank', format: 'rank', concepts: ['u2.radius-trend', 'u2.zeff'],
    prompt: b('Rank by atomic radius, largest first.', 'Ordne nach Atomradius, den größten zuerst.'),
    order: [b('Na', 'Na'), b('Mg', 'Mg'), b('Si', 'Si'), b('Cl', 'Cl')],
    explain: b('Same shell, rising Z_{eff} (1, 2, 4, 7): each step pulls the outer electrons closer.', 'Gleiche Schale, steigendes Z_{eff} (1, 2, 4, 7): Jeder Schritt zieht die Außenelektronen näher heran.') },
  { id: 'i2b', unit: 2, kind: 'choice', format: 'predict', withConfidence: true, concepts: ['u2.zeff'],
    prompt: b('The [[zeff]] felt by chlorine\'s outer electrons is roughly…', 'Die [[zeff]], die die Außenelektronen von Chlor spüren, beträgt etwa…'),
    options: [{ text: b('1', '1') }, { text: b('7', '7'), correct: true }, { text: b('17', '17') }, { text: b('10', '10') }],
    explain: b('17 protons minus 10 shielding core electrons: Z_{eff} ≈ 7.', '17 Protonen minus 10 abschirmende Rumpfelektronen: Z_{eff} ≈ 7.') },
  // Unit 3
  { id: 'i3a', unit: 3, kind: 'choice', format: 'predict', withConfidence: true, concepts: ['u3.ion-charges'], targets: ['kbr-charges'],
    prompt: b('[[potassium|Potassium]] reacts with bromine. Which ions form?', '[[potassium|Kalium]] reagiert mit Brom. Welche Ionen entstehen?'),
    options: [
      { text: b('K⁺ and Br⁻', 'K⁺ und Br⁻'), correct: true },
      { text: b('K²⁺ and Br²⁻', 'K²⁺ und Br²⁻'), mis: 'kbr-charges' },
      { text: b('K²⁺ and Br⁻', 'K²⁺ und Br⁻'), mis: 'kbr-charges' },
      { text: b('K⁺ and Br²⁻', 'K⁺ und Br²⁻') },
    ],
    explain: b('K is [Ar] 4s¹: one cheap electron, then a full shell. Br needs exactly one to complete its octet.', 'K ist [Ar] 4s¹: ein billiges Elektron, dann eine volle Schale. Br braucht genau eines für sein Oktett.') },
  { id: 'i3b', unit: 3, kind: 'choice', format: 'predict', withConfidence: true, concepts: ['u3.ie-cliff'],
    prompt: b('Magnesium\'s successive [[ionization|ionization energies]]: 738, 1451, 7733, 10 543 kJ/mol. How many electrons does Mg give up easily?', 'Die aufeinanderfolgenden [[ionization|Ionisierungsenergien]] von Magnesium: 738, 1451, 7733, 10 543 kJ/mol. Wie viele Elektronen gibt Mg leicht ab?'),
    options: [{ text: b('1', '1') }, { text: b('2', '2'), correct: true }, { text: b('3', '3') }, { text: b('4', '4') }],
    explain: b('The cliff comes after the second electron (1451 → 7733): the third would break into the full neon core.', 'Der Sprung kommt nach dem zweiten Elektron (1451 → 7733): Das dritte müsste aus dem vollen Neon-Rumpf kommen.') },
  // Unit 4
  { id: 'i4a', unit: 4, kind: 'estimate', format: 'estimate', concepts: ['u4.coulomb'],
    prompt: b('MgO melts at 2852 °C, NaCl at 801 °C. Counting charges only (q₁ × q₂), how many times stronger is the attraction in MgO?', 'MgO schmilzt bei 2852 °C, NaCl bei 801 °C. Nur die Ladungen betrachtet (q₁ × q₂): Wie viel stärker ist die Anziehung in MgO?'),
    min: 1, max: 9, step: 1, answer: 4, tolerance: 0, suffix: '×',
    explain: b('2 × 2 = 4 against 1 × 1 = 1. The slightly shorter distance in MgO adds a little more.', '2 × 2 = 4 gegenüber 1 × 1 = 1. Der etwas kleinere Abstand in MgO legt noch etwas drauf.') },
  { id: 'i4b', unit: 4, kind: 'choice', format: 'odd', concepts: ['u4.transfer', 'u5.delta-chi'],
    prompt: b('Odd one out?', 'Was passt nicht dazu?'),
    options: [{ text: b('{{NaCl}}', '{{NaCl}}') }, { text: b('{{MgO}}', '{{MgO}}') }, { text: b('{{KBr}}', '{{KBr}}') }, { text: b('{{CCl4}}', '{{CCl4}}'), correct: true }],
    explain: b('CCl₄ is covalent (Δχ ≈ 0.6). The other three are ionic lattices of a metal and a non-metal.', 'CCl₄ ist kovalent (Δχ ≈ 0,6). Die anderen drei sind Ionengitter aus Metall und Nichtmetall.') },
  // Unit 5
  { id: 'i5a', unit: 5, kind: 'choice', format: 'predict', withConfidence: true, concepts: ['u5.delta-chi'],
    prompt: b('O–H: [[electronegativity]] 3.4 vs 2.2, so Δχ = 1.2. The bond is…', 'O–H: [[electronegativity]] 3,4 gegen 2,2, also Δχ = 1,2. Die Bindung ist…'),
    options: [{ text: b('nonpolar covalent', 'unpolar kovalent') }, { text: b('polar covalent', 'polar kovalent'), correct: true }, { text: b('ionic', 'ionisch') }, { text: b('metallic', 'metallisch') }],
    explain: b('Between about 0.4 and 1.8 the electrons are shared unequally: a [[polar-bond]].', 'Zwischen etwa 0,4 und 1,8 werden die Elektronen ungleich geteilt: eine [[polar-bond]].') },
  { id: 'i5b', unit: 5, kind: 'rank', format: 'rank', concepts: ['u5.en'],
    prompt: b('Rank the bonds by polarity, most polar first.', 'Ordne die Bindungen nach Polarität, die polarste zuerst.'),
    order: [b('H–F', 'H–F'), b('H–Cl', 'H–Cl'), b('H–Br', 'H–Br'), b('H–H', 'H–H')],
    explain: b('Δχ: 1.8, 1.0, 0.8, 0. Electronegativity falls down group 17.', 'Δχ: 1,8; 1,0; 0,8; 0. Die Elektronegativität sinkt in Gruppe 17 nach unten.') },
  // Unit 6
  { id: 'i6a', unit: 6, kind: 'choice', format: 'predict', withConfidence: true, concepts: ['u6.lp-squeeze', 'u6.lp-count'], targets: ['lone-pairs-ignored'],
    prompt: b('{{NH3}} has three bonds. Its H–N–H [[bond-angle]] is about…', '{{NH3}} hat drei Bindungen. Sein H–N–H-[[bond-angle]] beträgt etwa…'),
    options: [
      { text: b('120°', '120°'), mis: 'lone-pairs-ignored' },
      { text: b('107°', '107°'), correct: true },
      { text: b('90°', '90°') },
      { text: b('109.5°', '109,5°'), mis: 'molecular-vs-electron-geometry' },
    ],
    explain: b('Four pairs point to tetrahedron corners (109.5°); the [[lone-pair]] pushes harder and squeezes the bonds to 107°.', 'Vier Paare zeigen in Tetraederecken (109,5°); das [[lone-pair]] drückt stärker und staucht die Bindungen auf 107°.') },
  { id: 'i6b', unit: 6, kind: 'choice', format: 'predict', withConfidence: true, concepts: ['u6.multiple-bond'], targets: ['bond-type-sets-geometry'],
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
      { text: b('nonpolar: four equal pulls to tetrahedron corners cancel', 'unpolar: vier gleiche Züge zu den Tetraederecken heben sich auf'), correct: true },
      { text: b('ionic', 'ionisch') },
    ],
    explain: b('Bond dipoles add as vectors. A perfect tetrahedron of equal pulls sums to zero.', 'Bindungsdipole addieren sich als Vektoren. Ein perfekter Tetraeder gleicher Züge ergibt null.') },
  { id: 'i6d', unit: 6, kind: 'estimate', format: 'estimate', concepts: ['u6.lp-squeeze'],
    prompt: b('Estimate the H–O–H angle in water.', 'Schätze den H–O–H-Winkel in Wasser.'),
    min: 90, max: 180, step: 0.5, answer: 104.5, tolerance: 3, suffix: '°',
    explain: b('104.5°: two lone pairs squeeze harder than one (ammonia, 107°).', '104,5°: Zwei freie Paare stauchen stärker als eines (Ammoniak, 107°).') },
  // Unit 8
  { id: 'i8a', unit: 8, kind: 'rank', format: 'rank', concepts: ['u8.dispersion'], mis: 'dispersion-direction',
    prompt: b('Rank the noble gases by boiling point, highest first.', 'Ordne die Edelgase nach Siedepunkt, den höchsten zuerst.'),
    order: [b('Xe', 'Xe'), b('Ar', 'Ar'), b('Ne', 'Ne'), b('He', 'He')],
    explain: b('More electrons, bigger and softer clouds, stronger [[dispersion]]: Xe 165 K, Ar 87 K, Ne 27 K, He 4 K.', 'Mehr Elektronen, größere, weichere Wolken, stärkere [[dispersion]]: Xe 165 K, Ar 87 K, Ne 27 K, He 4 K.') },
  { id: 'i8b', unit: 8, kind: 'choice', format: 'predict', withConfidence: true, concepts: ['u8.dispersion'], targets: ['dispersion-direction'],
    prompt: b('Pentane and neopentane are both C₅H₁₂. Which boils higher?', 'Pentan und Neopentan sind beide C₅H₁₂. Welches siedet höher?'),
    options: [
      { text: b('Pentane: the chain has more contact area', 'Pentan: die Kette hat mehr Kontaktfläche'), correct: true },
      { text: b('Neopentane: it is more compact', 'Neopentan: es ist kompakter'), mis: 'dispersion-direction' },
      { text: b('Neither: same electrons, same boiling point', 'Keines: gleiche Elektronen, gleicher Siedepunkt') },
    ],
    explain: b('Pentane 36 °C, neopentane 9.5 °C. Dispersion only acts where molecules touch.', 'Pentan 36 °C, Neopentan 9,5 °C. Dispersion wirkt nur, wo sich Moleküle berühren.') },
  // Unit 9
  { id: 'i9a', unit: 9, kind: 'choice', format: 'predict', withConfidence: true, concepts: ['u9.dipole'], targets: ['hbond-donor-acceptor'],
    prompt: b('Propane and acetaldehyde both weigh 44 g/mol. Propane boils at −42 °C, acetaldehyde at 20 °C. Mainly because of…', 'Propan und Acetaldehyd wiegen beide 44 g/mol. Propan siedet bei −42 °C, Acetaldehyd bei 20 °C. Vor allem wegen…'),
    options: [
      { text: b('dipole–dipole attraction', 'Dipol-Dipol-Anziehung'), correct: true },
      { text: b('hydrogen bonds between acetaldehyde molecules', 'Wasserstoffbrücken zwischen Acetaldehyd-Molekülen'), mis: 'hbond-donor-acceptor' },
      { text: b('stronger dispersion', 'stärkerer Dispersion') },
    ],
    explain: b('Acetaldehyde has a polar C=O but no H on oxygen, so it cannot donate a [[h-bond]].', 'Acetaldehyd hat ein polares C=O, aber kein H am Sauerstoff, kann also keine [[h-bond]] spenden.') },
  // Unit 10
  { id: 'i10a', unit: 10, kind: 'choice', format: 'predict', withConfidence: true, concepts: ['u10.donor-acceptor'], targets: ['hbond-donor-acceptor'],
    prompt: b('Dimethyl ether, CH₃–O–CH₃, meets water. In a [[h-bond]], dimethyl ether can be…', 'Dimethylether, CH₃–O–CH₃, trifft auf Wasser. In einer [[h-bond]] kann Dimethylether…'),
    options: [
      { text: b('an acceptor only', 'nur Akzeptor sein'), correct: true },
      { text: b('a donor only', 'nur Donor sein'), mis: 'hbond-donor-acceptor' },
      { text: b('both donor and acceptor', 'Donor und Akzeptor sein'), mis: 'hbond-donor-acceptor' },
      { text: b('neither', 'keines von beiden') },
    ],
    explain: b('Its oxygen has lone pairs to accept with, but no H attached to O to donate.', 'Sein Sauerstoff hat freie Paare zum Annehmen, aber kein H am O zum Spenden.') },
];

export const itemById = (id: string) => BANK.find((i) => i.id === id);
export const DIAGNOSTIC = ['i1a', 'i2b', 'i3a', 'i5a', 'i6a', 'i8a'];
