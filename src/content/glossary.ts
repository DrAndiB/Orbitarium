import type { Bi } from '../i18n';

export interface Term {
  en: string;
  de: string;
  def: Bi;
  unit: number;           // unit that introduces it
  falseFriend?: Bi;       // a trap between the two languages
}

// Every technical term that appears as a chip in content: [[id]] in a string.
export const GLOSSARY: Record<string, Term> = {
  orbital: {
    en: 'orbital', de: 'Orbital', unit: 1,
    def: { en: 'A region where an electron is likely to be found — a probability cloud, not a path.', de: 'Ein Bereich, in dem ein Elektron wahrscheinlich anzutreffen ist – eine Wahrscheinlichkeitswolke, keine Bahn.' },
    falseFriend: { en: 'German "Orbit" is the Bohr path; "Orbital" is the cloud. English uses "orbit" and "orbital" the same way.', de: '„Orbit“ ist die Bohr’sche Bahn, „Orbital“ die Wolke. Im Englischen ist es genauso: orbit und orbital.' },
  },
  shell: { en: 'shell', de: 'Schale', unit: 1, def: { en: 'All orbitals with the same principal number n; holds up to 2n² electrons.', de: 'Alle Orbitale mit derselben Hauptquantenzahl n; fasst bis zu 2n² Elektronen.' } },
  zeff: { en: 'effective nuclear charge', de: 'effektive Kernladung', unit: 2, def: { en: 'The pull an outer electron actually feels: Z_{eff} ≈ Z − S.', de: 'Die Anziehung, die ein äußeres Elektron tatsächlich spürt: Z_{eff} ≈ Z − S.' } },
  ionization: { en: 'ionization energy', de: 'Ionisierungsenergie', unit: 3, def: { en: 'Energy needed to remove one electron from an atom.', de: 'Energie, die nötig ist, um ein Elektron aus einem Atom zu entfernen.' } },
  potassium: {
    en: 'potassium', de: 'Kalium', unit: 3,
    def: { en: 'Element 19, symbol K — from the Latin "kalium".', de: 'Element 19, Symbol K – vom lateinischen „kalium“.' },
    falseFriend: { en: 'The symbol K only makes sense from the German name Kalium; sodium/Natrium (Na) works the same way.', de: 'Das Symbol K erklärt sich aus „Kalium“; Natrium/sodium (Na) funktioniert genauso.' },
  },
  electronegativity: { en: 'electronegativity', de: 'Elektronegativität', unit: 5, def: { en: 'How strongly an atom pulls shared electrons towards itself (χ).', de: 'Wie stark ein Atom gemeinsame Elektronen zu sich zieht (χ).' } },
  'polar-bond': { en: 'polar bond', de: 'polare Bindung', unit: 5, def: { en: 'A covalent bond where electrons sit closer to one atom: Δχ roughly 0.4 to 1.8.', de: 'Eine Atombindung, bei der die Elektronen näher an einem Atom liegen: Δχ etwa 0,4 bis 1,8.' } },
  'lone-pair': {
    en: 'lone pair', de: 'freies Elektronenpaar', unit: 6,
    def: { en: 'Two outer electrons that belong to one atom and take part in no bond.', de: 'Zwei Außenelektronen, die zu einem Atom gehören und an keiner Bindung beteiligt sind.' },
    falseFriend: { en: 'German says "free" (freies) where English says "lone"; "nichtbindendes Elektronenpaar" is the formal version.', de: 'Wo das Deutsche „frei“ sagt, sagt das Englische „lone“; formal heißt es „nichtbindendes Elektronenpaar“.' },
  },
  'bonding-pair': { en: 'bonding pair', de: 'bindendes Elektronenpaar', unit: 6, def: { en: 'Two electrons shared between two atoms: one covalent bond.', de: 'Zwei Elektronen, die zwei Atome teilen: eine Atombindung.' } },
  'bond-angle': { en: 'bond angle', de: 'Bindungswinkel', unit: 6, def: { en: 'The angle between two bonds that meet at the same central atom.', de: 'Der Winkel zwischen zwei Bindungen, die sich am selben Zentralatom treffen.' } },
  vsepr: {
    en: 'VSEPR model', de: 'VSEPR-Modell', unit: 6,
    def: { en: 'Valence shell electron pair repulsion: electron pairs around an atom push each other as far apart as possible.', de: 'Elektronenpaarabstoßungsmodell: Elektronenpaare um ein Atom stoßen sich so weit wie möglich voneinander ab.' },
    falseFriend: { en: 'German textbooks often call it "Elektronenpaarabstoßungsmodell" or EPA-Modell.', de: 'Deutsche Schulbücher sagen oft „Elektronenpaarabstoßungsmodell“ oder EPA-Modell.' },
  },
  tetrahedral: { en: 'tetrahedral', de: 'tetraedrisch', unit: 6, def: { en: 'Four directions pointing to the corners of a tetrahedron, 109.5° apart.', de: 'Vier Richtungen zu den Ecken eines Tetraeders, 109,5° voneinander entfernt.' } },
  'trigonal-pyramidal': { en: 'trigonal pyramidal', de: 'trigonal-pyramidal', unit: 6, def: { en: 'Three atoms around a centre that sits above them, like a low tripod: {{NH3}}.', de: 'Drei Atome um ein Zentrum, das über ihnen sitzt, wie ein flaches Stativ: {{NH3}}.' } },
  'trigonal-planar': { en: 'trigonal planar', de: 'trigonal-planar', unit: 6, def: { en: 'Three atoms around a centre, all in one plane, 120° apart: {{BF3}}.', de: 'Drei Atome um ein Zentrum, alle in einer Ebene, 120° auseinander: {{BF3}}.' } },
  bent: {
    en: 'bent', de: 'gewinkelt', unit: 6,
    def: { en: 'Two atoms around a centre at an angle below 180°: {{H2O}}.', de: 'Zwei Atome um ein Zentrum mit einem Winkel unter 180°: {{H2O}}.' },
    falseFriend: { en: 'Also called "angular" or "V-shaped" in English; German sometimes says "V-förmig".', de: 'Im Englischen auch „angular“ oder „V-shaped“; im Deutschen manchmal „V-förmig“.' },
  },
  linear: { en: 'linear', de: 'linear', unit: 6, def: { en: 'Atoms on a straight line, 180° apart: {{CO2}}.', de: 'Atome auf einer Geraden, 180° auseinander: {{CO2}}.' } },
  dipole: { en: 'dipole moment', de: 'Dipolmoment', unit: 6, def: { en: 'The net pull of all bond polarities, added as vectors. Zero means the molecule is nonpolar.', de: 'Der Nettozug aller Bindungspolaritäten, als Vektoren addiert. Null bedeutet: das Molekül ist unpolar.' } },
  octet: { en: 'octet rule', de: 'Oktettregel', unit: 4, def: { en: 'Main-group atoms tend to end up with eight outer electrons.', de: 'Hauptgruppenatome streben acht Außenelektronen an.' } },
  dispersion: {
    en: 'dispersion force', de: 'Dispersionskraft', unit: 8,
    def: { en: 'Attraction between temporary dipoles; grows with electron count and contact area.', de: 'Anziehung zwischen kurzlebigen Dipolen; wächst mit Elektronenzahl und Kontaktfläche.' },
    falseFriend: { en: 'German school books often say "Van-der-Waals-Kräfte" or "London-Kräfte" for the same thing.', de: 'Deutsche Schulbücher sagen oft „Van-der-Waals-Kräfte“ oder „London-Kräfte“.' },
  },
  'h-bond': {
    en: 'hydrogen bond', de: 'Wasserstoffbrückenbindung', unit: 10,
    def: { en: 'An H on N, O or F attracted to a lone pair on another N, O or F.', de: 'Ein H an N, O oder F, angezogen von einem freien Elektronenpaar an einem anderen N, O oder F.' },
    falseFriend: { en: 'Not a bond in the covalent sense — German "Brücke" (bridge) describes it better.', de: 'Keine Bindung im Sinne einer Atombindung – „Brücke“ beschreibt es besser.' },
  },
  ka: {
    en: 'acid constant Ka', de: 'Säurekonstante Ks', unit: 28,
    def: { en: 'How far an acid gives up its proton in water.', de: 'Wie weit eine Säure in Wasser ihr Proton abgibt.' },
    falseFriend: { en: 'English writes Ka and pKa; German school books write Ks and pKs.', de: 'Deutsch schreibt Ks und pKs, Englisch Ka und pKa.' },
  },
  mole: {
    en: 'amount of substance', de: 'Stoffmenge', unit: 12,
    def: { en: 'Counted in moles; 1 mol is 6.022 × 10²³ particles.', de: 'Gemessen in Mol; 1 mol sind 6,022 · 10²³ Teilchen.' },
    falseFriend: { en: 'German "Stoffmenge" is the quantity; "Mol" is its unit — English often blurs the two as "moles".', de: '„Stoffmenge“ ist die Größe, „Mol“ ihre Einheit – im Englischen verschwimmt das oft zu „moles“.' },
  },
};
