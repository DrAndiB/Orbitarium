import type { Bi } from '../i18n';

export interface Concept { id: string; name: Bi; }
export interface UnitInfo {
  n: number;
  module: number;
  name: Bi;
  engine: string;
  phase: number;          // build phase that delivers the unit
  concepts: Concept[];
  playable?: boolean;
}
export interface ModuleInfo { n: number; name: Bi; }

export const MODULES: ModuleInfo[] = [
  { n: 0, name: { en: 'The map', de: 'Die Karte' } },
  { n: 1, name: { en: 'Atoms', de: 'Atome' } },
  { n: 2, name: { en: 'Bonding', de: 'Bindung' } },
  { n: 3, name: { en: 'Intermolecular forces', de: 'Zwischenmolekulare Kräfte' } },
  { n: 4, name: { en: 'The mole', de: 'Das Mol' } },
  { n: 5, name: { en: 'Thermodynamics', de: 'Thermodynamik' } },
  { n: 6, name: { en: 'Kinetics and equilibrium', de: 'Kinetik und Gleichgewicht' } },
  { n: 7, name: { en: 'Acids and bases', de: 'Säuren und Basen' } },
  { n: 8, name: { en: 'Redox and electrochemistry', de: 'Redox und Elektrochemie' } },
  { n: 9, name: { en: 'Organic structures', de: 'Organische Strukturen' } },
  { n: 10, name: { en: 'Organic reactions', de: 'Organische Reaktionen' } },
];

const c = (id: string, en: string, de: string): Concept => ({ id, name: { en, de } });
const u = (n: number, module: number, en: string, de: string, engine: string, phase: number, concepts: Concept[] = []): UnitInfo =>
  ({ n, module, name: { en, de }, engine, phase, concepts: concepts.length ? concepts : [c(`u${n}.core`, en, de)] });

export const UNITS: UnitInfo[] = [
  u(0, 0, 'The periodic table as a map', 'Das Periodensystem als Karte', 'Periodic Table', 0, [
    c('u0.rows-shells', 'A row is a shell', 'Eine Zeile ist eine Schale'),
    c('u0.columns-outer', 'A main-group column counts outer electrons', 'Eine Hauptgruppen-Spalte zählt Außenelektronen'),
    c('u0.families', 'A column is a family that behaves alike', 'Eine Spalte ist eine Familie mit ähnlichem Verhalten'),
    c('u0.blocks', 'Blocks show which orbitals are filling', 'Blöcke zeigen, welche Orbitale sich füllen'),
    c('u0.core-elements', 'The core elements and where they sit', 'Die Kernelemente und wo sie stehen'),
    c('u0.mass-average', 'Atomic mass is an isotope average', 'Die Atommasse ist ein Isotopen-Mittelwert'),
  ]),
  u(1, 1, 'Shells and orbitals', 'Schalen und Orbitale', 'Orbital Viewer', 1, [
    c('u1.levels-light', 'Electrons have only certain energies; a jump down gives light of one colour', 'Elektronen haben nur bestimmte Energien; ein Sprung nach unten gibt Licht einer Farbe'),
    c('u1.shells', 'Shell n holds up to 2n² electrons', 'Schale n fasst bis zu 2n² Elektronen'),
    c('u1.subshells', 's, p, d, f hold 2, 6, 10, 14; shell n has n kinds', 's, p, d, f fassen 2, 6, 10, 14; Schale n hat n Sorten'),
    c('u1.orbit-vs-orbital', 'Orbitals are clouds, not paths', 'Orbitale sind Wolken, keine Bahnen'),
    c('u1.filling-order', 'Lowest energy fills first: 4s before 3d', 'Die niedrigste Energie wird zuerst besetzt: 4s vor 3d'),
    c('u1.config', 'Reading and writing an electron configuration', 'Elektronenkonfigurationen lesen und schreiben'),
  ]),
  u(2, 1, 'Z_{eff} and size', 'Z_{eff} und Atomgröße', 'Orbital Viewer', 1, [
    c('u2.zeff', 'Z_{eff} ≈ Z − inner electrons: the net pull on the outer electrons', 'Z_{eff} ≈ Z − innere Elektronen: der Nettozug auf die Außenelektronen'),
    c('u2.shielding', 'Inner electrons shield the outer ones from the nucleus', 'Innere Elektronen schirmen die äußeren vom Kern ab'),
    c('u2.radius-trend', 'Radius shrinks across a period, grows down a group', 'Radius sinkt in der Periode, wächst in der Gruppe'),
    c('u2.distance', 'Down a group, distance wins: the net pull stays about the same', 'In der Gruppe nach unten gewinnt der Abstand: der Nettozug bleibt etwa gleich'),
    c('u2.ions-size', 'Positive ions are smaller than their atoms, negative ions bigger', 'Positive Ionen sind kleiner als ihre Atome, negative größer'),
    c('u2.isoelectronic', 'Same number of electrons, more protons: smaller', 'Gleich viele Elektronen, mehr Protonen: kleiner'),
  ]),
  u(3, 1, 'Ionization and ion charges', 'Ionisierung und Ionenladungen', 'Orbital Viewer', 1, [
    c('u3.ie-definition', 'Ionization energy: the energy to pull off the outermost electron', 'Ionisierungsenergie: die Energie, um das äußerste Elektron abzuziehen'),
    c('u3.ie-trend', 'First ionization energy rises across a period, falls down a group', 'Die erste Ionisierungsenergie steigt in der Periode und fällt in der Gruppe'),
    c('u3.ie-cliff', 'The ionization cliff reveals the outer electrons', 'Der Sprung der Ionisierungsenergie zeigt die Außenelektronen'),
    c('u3.ion-charges', 'Ion charges from the group', 'Ionenladungen aus der Gruppe'),
    c('u3.noble-config', 'Ions often share a noble gas\'s electron arrangement, not its identity', 'Ionen teilen oft die Elektronenanordnung eines Edelgases, nicht seine Identität'),
    c('u3.gain-vs-lose', 'Metals lose electrons, non-metals gain them', 'Metalle geben Elektronen ab, Nichtmetalle nehmen sie auf'),
  ]),
  u(4, 2, 'Ionic bonding', 'Ionenbindung', 'Lattice Builder', 1, [
    c('u4.transfer', 'Electron transfer turns atoms into ions', 'Elektronenübergang macht aus Atomen Ionen'),
    c('u4.lattice', 'An ionic solid is a giant lattice, not molecules', 'Ein Ionenkristall ist ein Riesengitter, keine Moleküle'),
    c('u4.coulomb', 'Lattice strength grows with the charges and shrinks with distance', 'Die Gitterstärke wächst mit den Ladungen und sinkt mit dem Abstand'),
    c('u4.formula-ratio', 'Charges balance: the formula is the ion ratio', 'Ladungen gleichen sich aus: Die Formel ist das Ionenverhältnis'),
    c('u4.properties', 'High melting points; conducts only when molten or dissolved', 'Hohe Schmelzpunkte; leitet nur geschmolzen oder gelöst'),
    c('u4.brittle', 'A shifted layer puts like charges side by side: brittle', 'Eine verschobene Schicht bringt gleiche Ladungen nebeneinander: spröde'),
  ]),
  u(5, 2, 'Covalent bonds and electronegativity', 'Atombindung und Elektronegativität', 'Charge Field', 1, [
    c('u5.sharing', 'A covalent bond is a shared electron pair', 'Eine Atombindung ist ein gemeinsames Elektronenpaar'),
    c('u5.bond-count', 'Each shared pair adds one to an atom\'s count; small atoms usually bond until they count eight', 'Jedes gemeinsame Paar zählt für beide Atome; kleine Atome binden meist, bis sie acht zählen'),
    c('u5.multiple-bonds', 'Double and triple bonds are shorter and stronger', 'Doppel- und Dreifachbindungen sind kürzer und stärker'),
    c('u5.en', 'Electronegativity pulls shared electrons', 'Elektronegativität zieht gemeinsame Elektronen'),
    c('u5.partial-charges', 'Unequal sharing leaves partial charges, δ+ and δ−', 'Ungleiches Teilen hinterlässt Teilladungen, δ+ und δ−'),
    c('u5.delta-chi', 'Δχ bands: nonpolar, polar, ionic', 'Δχ-Bereiche: unpolar, polar, ionisch'),
  ]),
  u(6, 2, 'Lone pairs and shape', 'Freie Elektronenpaare und Molekülgestalt', 'Molecule Workbench', 0, [
    c('u6.pairs-repel', 'Electron pairs spread as far apart as possible', 'Elektronenpaare verteilen sich so weit wie möglich'),
    c('u6.lp-count', 'Lone pairs take up directions too', 'Freie Paare besetzen auch Richtungen'),
    c('u6.shape-from-atoms', 'The shape is named from the atoms only', 'Die Gestalt wird nur nach den Atomen benannt'),
    c('u6.lp-squeeze', 'Lone pairs squeeze bond angles', 'Freie Paare stauchen Bindungswinkel'),
    c('u6.multiple-bond', 'A double or triple bond counts as one direction', 'Doppel- und Dreifachbindung zählen als eine Richtung'),
    c('u6.symmetry', 'Symmetric shapes cancel bond dipoles', 'Symmetrische Gestalten heben Bindungsdipole auf'),
  ]),
  u(7, 2, 'Who carries the charge', 'Wer trägt die Ladung', 'Lattice Builder', 1, [
    c('u7.carriers', 'Conduction needs mobile charge carriers', 'Leitfähigkeit braucht bewegliche Ladungsträger'),
  ]),
  u(8, 3, 'Dispersion', 'Dispersionskräfte', 'Particle Box', 1, [
    c('u8.dispersion', 'More electrons, more contact, stronger dispersion', 'Mehr Elektronen, mehr Kontakt, stärkere Dispersion'),
  ]),
  u(9, 3, 'Dipole–dipole', 'Dipol-Dipol-Kräfte', 'Particle Box', 1, [
    c('u9.dipole', 'Permanent dipoles attract end to end', 'Permanente Dipole ziehen sich an den Enden an'),
  ]),
  u(10, 3, 'Hydrogen-bond donors and acceptors', 'Wasserstoffbrücken: Donor und Akzeptor', 'Molecule Workbench', 1, [
    c('u10.donor-acceptor', 'Donor: H on N, O, F; acceptor: a lone pair on N, O, F', 'Donor: H an N, O, F; Akzeptor: freies Paar an N, O, F'),
  ]),
  u(11, 3, "Water's network and solubility", 'Das Netzwerk des Wassers und Löslichkeit', 'Particle Box', 1),
  u(12, 4, 'Counting by weighing', 'Zählen durch Wiegen', 'Zoom Ladder', 2),
  u(13, 4, 'Formulas and molar mass', 'Formeln und molare Masse', 'Zoom Ladder', 2),
  u(14, 4, 'Balancing equations', 'Reaktionsgleichungen ausgleichen', 'Zoom Ladder', 2),
  u(15, 4, 'Limiting reagent and yield', 'Limitierender Stoff und Ausbeute', 'Zoom Ladder', 2),
  u(16, 4, 'Concentration', 'Konzentration', 'Lab Bench', 2),
  u(17, 5, 'Bond energy and enthalpy', 'Bindungsenergie und Enthalpie', 'Energy Landscape', 2),
  u(18, 5, "Hess's law", 'Satz von Hess', 'Energy Landscape', 2),
  u(19, 5, 'Entropy', 'Entropie', 'Particle Box', 2),
  u(20, 5, 'Free energy', 'Freie Enthalpie', 'Energy Landscape', 2),
  u(21, 6, 'Collisions and activation energy', 'Stöße und Aktivierungsenergie', 'Particle Box', 2),
  u(22, 6, 'Rate and temperature', 'Geschwindigkeit und Temperatur', 'Particle Box', 2),
  u(23, 6, 'Catalysts', 'Katalysatoren', 'Energy Landscape', 2),
  u(24, 6, 'Dynamic equilibrium', 'Dynamisches Gleichgewicht', 'Particle Box', 2),
  u(25, 6, 'Le Chatelier', 'Le Chatelier', 'Particle Box', 2),
  u(26, 7, 'Proton transfer', 'Protonenübertragung', 'Molecule Workbench', 3),
  u(27, 7, 'pH and the log scale', 'pH und die Logarithmusskala', 'Lab Bench', 3),
  u(28, 7, 'Strong vs weak acids', 'Starke und schwache Säuren', 'Particle Box', 3),
  u(29, 7, 'Buffers', 'Puffer', 'Lab Bench', 3),
  u(30, 7, 'Titration', 'Titration', 'Lab Bench', 3),
  u(31, 8, 'Oxidation states', 'Oxidationszahlen', 'Zoom Ladder', 3),
  u(32, 8, 'Galvanic cells', 'Galvanische Zellen', 'Lab Bench', 3),
  u(33, 8, 'Electrolysis', 'Elektrolyse', 'Lab Bench', 3),
  u(34, 8, 'Batteries and corrosion', 'Batterien und Korrosion', 'Lab Bench', 3),
  u(35, 9, 'Carbon skeletons and naming', 'Kohlenstoffgerüste und Benennung', 'Molecule Workbench', 3),
  u(36, 9, 'Functional groups', 'Funktionelle Gruppen', 'Molecule Workbench', 3),
  u(37, 9, 'Isomers', 'Isomere', 'Molecule Workbench', 3),
  u(38, 9, 'Chirality', 'Chiralität', 'Molecule Workbench', 3),
  u(39, 9, 'Benzene and aromatic rings', 'Benzol und aromatische Ringe', 'Molecule Workbench', 3),
  u(40, 10, 'Reaction types', 'Reaktionstypen', 'Molecule Workbench', 3),
  u(41, 10, 'Electron-flow arrows', 'Elektronenfluss-Pfeile', 'Molecule Workbench', 3),
  u(42, 10, 'Substitution', 'Substitution', 'Molecule Workbench', 3),
  u(43, 10, 'Addition to double bonds', 'Addition an Doppelbindungen', 'Molecule Workbench', 3),
  u(44, 10, 'Esters and condensation', 'Ester und Kondensation', 'Molecule Workbench', 3),
  u(45, 10, 'Polymers and biomolecules', 'Polymere und Biomoleküle', 'Molecule Workbench', 3),
];
for (const n of [0, 1, 2, 3, 4, 5, 6]) unitByNumber(n).playable = true;
function unitByNumber(n: number) { return UNITS.find((x) => x.n === n)!; }

export const unitByN = (n: number) => UNITS.find((x) => x.n === n)!;
export const moduleByN = (n: number) => MODULES.find((m) => m.n === n)!;
export const PLAYABLE = () => UNITS.filter((u) => u.playable).map((u) => u.n);
export const allConcepts = () => UNITS.flatMap((x) => x.concepts.map((cc) => ({ ...cc, unit: x.n })));
export const conceptUnit = (id: string) => Number(id.split('.')[0].slice(1));

export interface Misconception { id: string; name: Bi; unit: number; }
export const MISCONCEPTIONS: Misconception[] = [
  { id: 'mass-is-one-atom', unit: 0, name: { en: 'Atomic mass describes a single atom', de: 'Die Atommasse beschreibt ein einzelnes Atom' } },
  { id: 'order-by-mass', unit: 0, name: { en: 'The table is ordered by mass', de: 'Das Periodensystem ist nach Masse geordnet' } },
  { id: 'rows-columns-swapped', unit: 0, name: { en: 'Rows and columns swapped (a row counts outer electrons)', de: 'Zeilen und Spalten vertauscht (eine Zeile zählt Außenelektronen)' } },
  { id: 'group-number-literal', unit: 0, name: { en: 'Groups 13–18: the group number taken as the outer-electron count', de: 'Gruppen 13–18: Gruppennummer als Zahl der Außenelektronen genommen' } },
  { id: 'bohr-orbits', unit: 1, name: { en: 'Bohr orbits vs quantum orbitals', de: 'Bohr-Bahnen statt Orbitalen' } },
  { id: 'd-in-shell-2', unit: 1, name: { en: 'd orbitals in shell 2', de: 'd-Orbitale in Schale 2' } },
  { id: 'kbr-charges', unit: 3, name: { en: 'KBr ion charges (K²⁺)', de: 'Ionenladungen in KBr (K²⁺)' } },
  { id: 'molecular-vs-electron-geometry', unit: 6, name: { en: 'Molecular vs electron geometry', de: 'Molekülgestalt vs. Elektronenpaar-Anordnung' } },
  { id: 'lone-pairs-ignored', unit: 6, name: { en: 'Lone pairs take no space', de: 'Freie Paare brauchen keinen Platz' } },
  { id: 'bond-type-sets-geometry', unit: 6, name: { en: 'Counting electron pairs instead of directions', de: 'Elektronenpaare statt Richtungen gezählt' } },
  { id: 'always-tetrahedral', unit: 6, name: { en: 'Bonds always meet at 109.5°', de: 'Bindungen treffen sich immer bei 109,5°' } },
  { id: 'polar-bonds-polar-molecule', unit: 6, name: { en: 'Polar bonds always make a polar molecule', de: 'Polare Bindungen ergeben immer ein polares Molekül' } },
  { id: 'symmetric-means-nonpolar', unit: 6, name: { en: 'A symmetric-looking shape always cancels the pulls', de: 'Eine symmetrisch wirkende Gestalt hebt die Züge immer auf' } },
  { id: 'polarity-conduction', unit: 7, name: { en: 'Polarity as the cause of conduction', de: 'Polarität als Ursache der Leitfähigkeit' } },
  { id: 'dispersion-direction', unit: 8, name: { en: 'Direction of the dispersion trend', de: 'Richtung des Dispersionstrends' } },
  { id: 'hbond-donor-acceptor', unit: 10, name: { en: 'H-bond donor vs acceptor', de: 'H-Brücken: Donor vs. Akzeptor' } },
];
