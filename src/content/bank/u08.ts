import type { Bi } from '../../i18n';
import type { Item } from '../items';

const b = (en: string, de: string): Bi => ({ en, de });

// Unit 8 question bank: three or more variants per concept (predict, why, transfer), every trap option tagged.
// Data: melting and boiling points, electrons and molar masses from substances.ts (CRC Handbook, NIST WebBook).
// Not in substances.ts (CRC Handbook): radon boils at −61.7 °C (86 electrons); nitrogen N₂ at −195.8 °C
// (14 electrons); 2,2-dimethylbutane (C₆H₁₄) at 49.7 °C. Butane: enthalpy of vaporization 22.4 kJ/mol at its boiling
// point (NIST WebBook); C–C bond 345 kJ/mol (bonds.ts). The I–I bond is weaker than Cl–Cl. Gecko adhesion by
// dispersion: OpenStax Chemistry 2e, section 10.1 (Autumn et al.: equal adhesion on polar and nonpolar surfaces).
// Temperature differences are given in degrees (EN) and K (DE); dispersion is "Dispersionskräfte" in German.
export const BANK_U8: Item[] = [
  // ---------- u8.instant-dipole ----------
  { id: 'i8c', unit: 8, kind: 'choice', format: 'predict', withConfidence: true, concepts: ['u8.instant-dipole'], targets: ['nonpolar-no-attraction', 'weight-holds-down'],
    prompt: b('Argon is made of single atoms: no bonds, no charges, no polar ends. Cooled to −186 °C, it still turns into a liquid. What holds the liquid together?', 'Argon besteht aus einzelnen Atomen: keine Bindungen, keine Ladungen, keine polaren Enden. Auf −186 °C abgekühlt, wird es trotzdem flüssig. Was hält die Flüssigkeit zusammen?'),
    options: [
      { text: b('Nothing: the atoms are just too slow to fly apart', 'Nichts: Die Atome sind einfach zu langsam, um auseinanderzufliegen'), mis: 'nonpolar-no-attraction' },
      { text: b('Briefly lopsided electron clouds that pull on their neighbours', 'Kurzzeitig schiefe Elektronenwolken, die an ihren Nachbarn ziehen'), correct: true },
      { text: b('Bonds that form between argon atoms in the cold', 'Bindungen, die sich in der Kälte zwischen Argonatomen bilden') },
      { text: b('The atoms\' weight keeps them at the bottom', 'Das Gewicht der Atome hält sie unten'), mis: 'weight-holds-down' },
    ],
    explain: b('Dispersion: at any instant an argon atom\'s 18 electrons can sit a little unevenly, a temporary dipole that induces one in its neighbour, and the two attract. Slow atoms alone would not stick together; without an attraction there would be no liquid.', 'Dispersionskräfte: In jedem Augenblick können die 18 Elektronen eines Argonatoms etwas ungleich verteilt sein, ein temporärer Dipol, der im Nachbarn einen Dipol induziert, und die beiden ziehen sich an. Langsame Atome allein hielten nicht zusammen; ohne Anziehung gäbe es keine Flüssigkeit.') },
  { id: 'i8d', unit: 8, kind: 'choice', format: 'why', evidence: 'explain', withConfidence: true, concepts: ['u8.instant-dipole'], targets: ['nonpolar-no-attraction'],
    prompt: b('Why does a molecule with a temporary dipole attract its neighbour, even though the neighbour has no charge?', 'Warum zieht ein Molekül mit einem temporären Dipol seinen Nachbarn an, obwohl der Nachbar keine Ladung hat?'),
    options: [
      { text: b('It shares an electron pair with the neighbour for a moment', 'Es teilt sich für einen Moment ein Elektronenpaar mit dem Nachbarn') },
      { text: b('It does not: only molecules with permanent dipoles attract', 'Gar nicht: Nur Moleküle mit festen Dipolen ziehen sich an'), mis: 'nonpolar-no-attraction' },
      { text: b('Its δ− side pushes the neighbour\'s electrons away, so the facing side turns δ+', 'Seine δ−-Seite drückt die Elektronen des Nachbarn weg, also wird dessen zugewandte Seite δ+'), correct: true },
      { text: b('The neighbour is always polar, so the two line up', 'Der Nachbar ist immer polar, also richten sich beide aus') },
    ],
    explain: b('The temporary dipole induces a dipole in the neighbour: its δ− side repels the neighbour\'s electrons and leaves the facing side δ+. Opposite sides face each other, so the two attract. No electrons are shared; that would be a bond.', 'Der temporäre Dipol induziert im Nachbarn einen Dipol: Seine δ−-Seite stößt die Elektronen des Nachbarn ab, dessen zugewandte Seite wird δ+. Entgegengesetzte Seiten stehen sich gegenüber, also ziehen sich die beiden an. Geteilt werden keine Elektronen; das wäre eine Bindung.') },
  { id: 'i8t', unit: 8, kind: 'choice', format: 'predict', evidence: 'transfer', withConfidence: true, concepts: ['u8.instant-dipole'], targets: ['nonpolar-no-attraction', 'boiling-breaks-bonds'],
    prompt: b('Nitrogen (N₂, 14 electrons) is nonpolar. At −196 °C it is a liquid, used in laboratories to freeze samples. What holds liquid nitrogen together?', 'Stickstoff (N₂, 14 Elektronen) ist unpolar. Bei −196 °C ist er flüssig und wird in Laboren zum Einfrieren von Proben verwendet. Was hält flüssigen Stickstoff zusammen?'),
    options: [
      { text: b('Nothing: the cold simply stops the molecules from moving', 'Nichts: Die Kälte hält die Moleküle einfach an'), mis: 'nonpolar-no-attraction' },
      { text: b('The N≡N triple bonds, which link the molecules together', 'Die N≡N-Dreifachbindungen, die die Moleküle miteinander verbinden'), mis: 'boiling-breaks-bonds' },
      { text: b('Permanent δ+ and δ− ends on each N₂ molecule', 'Feste δ+- und δ−-Enden an jedem N₂-Molekül') },
      { text: b('Dispersion: brief dipoles that induce dipoles in their neighbours', 'Dispersionskräfte: kurzlebige Dipole, die in den Nachbarn Dipole induzieren'), correct: true },
    ],
    explain: b('N₂ has only 14 electrons and attracts its neighbours by dispersion alone, which is why it boils as low as −195.8 °C. The N≡N triple bond lies inside each molecule; it is not what holds one molecule to the next.', 'N₂ hat nur 14 Elektronen und zieht seine Nachbarn allein durch Dispersionskräfte an; deshalb siedet er schon bei −195,8 °C. Die N≡N-Dreifachbindung liegt in jedem Molekül; sie hält nicht ein Molekül am nächsten fest.') },

  // ---------- u8.dispersion ----------
  { id: 'i8a', unit: 8, kind: 'rank', format: 'rank', concepts: ['u8.dispersion'], mis: 'dispersion-direction', table: 'category',
    prompt: b('Rank the noble gases by boiling point, highest first.', 'Ordne die Edelgase nach Siedetemperatur, die höchste zuerst.'),
    order: [b('Xe', 'Xe'), b('Ar', 'Ar'), b('Ne', 'Ne'), b('He', 'He')],
    explain: b('More electrons, bigger and more easily pushed clouds, stronger [[dispersion]]: xenon (54 electrons) −108.1 °C, argon (18) −185.8 °C, neon (10) −246.1 °C, helium (2) −268.9 °C.', 'Mehr Elektronen, größere und leichter verschiebbare Wolken, stärkere [[dispersion]]: Xenon (54 Elektronen) −108,1 °C, Argon (18) −185,8 °C, Neon (10) −246,1 °C, Helium (2) −268,9 °C.') },
  { id: 'i8f', unit: 8, kind: 'choice', format: 'predict', withConfidence: true, concepts: ['u8.dispersion'], targets: ['dispersion-direction'],
    prompt: b('Ethane (C₂H₆, 18 electrons) boils at −88.6 °C. Propane (C₃H₈) has 26 electrons. Propane boils at about…', 'Ethan (C₂H₆, 18 Elektronen) siedet bei −88,6 °C. Propan (C₃H₈) hat 26 Elektronen. Propan siedet bei etwa…'),
    options: [
      { text: b('−120 °C', '−120 °C'), mis: 'dispersion-direction' },
      { text: b('−88.6 °C, the same as ethane', '−88,6 °C, wie Ethan') },
      { text: b('−42 °C', '−42 °C'), correct: true },
      { text: b('+60 °C', '+60 °C') },
    ],
    explain: b('−42.1 °C, 46.5 degrees above ethane. More electrons make a bigger cloud and a stronger dispersion force; butane, with 34 electrons, boils higher again, at −0.5 °C.', '−42,1 °C, also 46,5 K über Ethan. Mehr Elektronen bedeuten eine größere Wolke und stärkere Dispersionskräfte; Butan mit 34 Elektronen siedet noch höher, bei −0,5 °C.') },
  { id: 'i8g', unit: 8, kind: 'choice', format: 'why', evidence: 'explain', withConfidence: true, concepts: ['u8.dispersion'], targets: ['weight-holds-down'],
    prompt: b('Down the noble gases the boiling points rise: helium −268.9 °C, neon −246.1 °C, argon −185.8 °C, xenon −108.1 °C. Why?', 'In der Gruppe der Edelgase steigen die Siedetemperaturen nach unten: Helium −268,9 °C, Neon −246,1 °C, Argon −185,8 °C, Xenon −108,1 °C. Warum?'),
    options: [
      { text: b('Heavier atoms are harder to lift into the gas', 'Schwerere Atome lassen sich schwerer ins Gas heben'), mis: 'weight-holds-down' },
      { text: b('Bigger clouds, held loosely at the outside, are pushed lopsided more easily', 'Größere, außen locker gehaltene Wolken lassen sich leichter verschieben'), correct: true },
      { text: b('The heavier noble gases form weak bonds between their atoms', 'Die schwereren Edelgase bilden schwache Bindungen zwischen ihren Atomen') },
      { text: b('The noble gases further down are polar', 'Die Edelgase weiter unten sind polar') },
    ],
    explain: b('Each new shell makes a larger cloud whose outer electrons are held more loosely, so it is more [[polarizability|polarizable]] and attracts more strongly by dispersion. Weight is not the reason: octane, for example, boils higher than the heavier bromine.', 'Jede neue Schale macht die Wolke größer, und ihre äußeren Elektronen werden lockerer gehalten; sie ist leichter [[polarizability|polarisierbar]] und zieht durch Dispersionskräfte stärker an. Am Gewicht liegt es nicht: Octan zum Beispiel siedet höher als das schwerere Brom.') },
  { id: 'i8h', unit: 8, kind: 'choice', format: 'predict', evidence: 'transfer', withConfidence: true, concepts: ['u8.dispersion'], targets: ['dispersion-direction'], table: 'category',
    prompt: b('Radon sits below xenon in group 18 and has 86 electrons. Xenon (54 electrons) boils at −108.1 °C. Radon boils at about…', 'Radon steht in Gruppe 18 (VIII. Hauptgruppe) unter Xenon und hat 86 Elektronen. Xenon (54 Elektronen) siedet bei −108,1 °C. Radon siedet bei etwa…'),
    options: [
      { text: b('−160 °C', '−160 °C'), mis: 'dispersion-direction' },
      { text: b('−108 °C, the same as xenon', '−108 °C, wie Xenon') },
      { text: b('−62 °C', '−62 °C'), correct: true },
      { text: b('+50 °C', '+50 °C') },
    ],
    explain: b('−61.7 °C, about 46 degrees above xenon. 32 more electrons make an even larger cloud that is pushed lopsided more easily.', '−61,7 °C, etwa 46 K über Xenon. 32 Elektronen mehr ergeben eine noch größere Wolke, die sich leichter verschieben lässt.') },

  // ---------- u8.shape ----------
  { id: 'i8b', unit: 8, kind: 'choice', format: 'predict', withConfidence: true, concepts: ['u8.shape'], targets: ['dispersion-direction', 'weight-holds-down'],
    prompt: b('Pentane (a chain) and neopentane (a compact ball) are both C₅H₁₂. Which boils higher?', 'Pentan (eine Kette) und Neopentan (eine kompakte Kugel) sind beide C₅H₁₂. Welches siedet höher?'),
    options: [
      { text: b('Pentane: the chain has more contact with its neighbours', 'Pentan: Die Kette hat mehr Kontakt mit ihren Nachbarn'), correct: true },
      { text: b('Neopentane: compact molecules pack closer together', 'Neopentan: Kompakte Moleküle packen sich dichter'), mis: 'dispersion-direction' },
      { text: b('Neither: same mass, same boiling point', 'Keines: gleiche Masse, gleiche Siedetemperatur'), mis: 'weight-holds-down' },
      { text: b('Neither: same electrons, same boiling point', 'Keines: gleich viele Elektronen, gleiche Siedetemperatur') },
    ],
    explain: b('Pentane boils at 36.1 °C, neopentane at 9.5 °C: same atoms, same mass, same 42 electrons. Dispersion falls off steeply with distance, so it acts mostly where molecules come close, and the chain lies close to its neighbours along its whole length.', 'Pentan siedet bei 36,1 °C, Neopentan bei 9,5 °C: gleiche Atome, gleiche Masse, gleich viele Elektronen (42). Dispersionskräfte nehmen mit dem Abstand sehr schnell ab und wirken vor allem dort, wo sich Moleküle nahekommen, und die Kette liegt auf ganzer Länge dicht an ihren Nachbarn.') },
  { id: 'i8i', unit: 8, kind: 'choice', format: 'why', evidence: 'explain', withConfidence: true, concepts: ['u8.shape'], targets: ['weight-holds-down', 'dispersion-direction', 'boiling-breaks-bonds'],
    prompt: b('Pentane and neopentane have the same formula, C₅H₁₂, and the same 42 electrons. Why does pentane boil about 27 degrees higher (36.1 against 9.5 °C)?', 'Pentan und Neopentan haben dieselbe Formel, C₅H₁₂, und gleich viele Elektronen (42). Warum siedet Pentan etwa 27 K höher (36,1 gegenüber 9,5 °C)?'),
    options: [
      { text: b('Pentane molecules are heavier', 'Pentanmoleküle sind schwerer'), mis: 'weight-holds-down' },
      { text: b('Neopentane\'s compact molecules pack closer, so they attract more', 'Die kompakten Neopentanmoleküle packen sich dichter und ziehen sich stärker an'), mis: 'dispersion-direction' },
      { text: b('Pentane\'s C–C bonds are stronger and take longer to break', 'Die C–C-Bindungen im Pentan sind stärker und brechen später'), mis: 'boiling-breaks-bonds' },
      { text: b('Its chain lies alongside its neighbours, so more of it is in contact', 'Seine Kette liegt an den Nachbarn an, also ist mehr davon in Kontakt'), correct: true },
    ],
    explain: b('Same atoms, same mass, same electrons: only the shape differs. Dispersion acts mostly where molecules come close, and a chain lies close to its neighbours along its whole length while a ball comes close at only a few points. No bond inside either molecule breaks on boiling.', 'Gleiche Atome, gleiche Masse, gleich viele Elektronen: Nur die Form ist anders. Dispersionskräfte wirken vor allem dort, wo sich Moleküle nahekommen, und eine Kette liegt auf ganzer Länge dicht an ihren Nachbarn, eine Kugel nur an wenigen Stellen. Beim Sieden bricht in keinem der beiden Moleküle eine Bindung.') },
  { id: 'i8j', unit: 8, kind: 'choice', format: 'predict', evidence: 'transfer', withConfidence: true, concepts: ['u8.shape'], targets: ['dispersion-direction'],
    prompt: b('Hexane (C₆H₁₄, a straight chain) boils at 68.7 °C. 2,2-Dimethylbutane has the same formula but is compact and branched. It boils at about…', 'Hexan (C₆H₁₄, eine unverzweigte Kette) siedet bei 68,7 °C. 2,2-Dimethylbutan hat dieselbe Formel, ist aber kompakt und verzweigt. Es siedet bei etwa…'),
    options: [
      { text: b('50 °C', '50 °C'), correct: true },
      { text: b('69 °C, the same: same formula', '69 °C, gleich: gleiche Formel') },
      { text: b('90 °C: compact molecules pack closer', '90 °C: Kompakte Moleküle packen sich dichter'), mis: 'dispersion-direction' },
      { text: b('−0.5 °C, like butane', '−0,5 °C, wie Butan') },
    ],
    explain: b('49.7 °C, about 19 degrees below hexane. Same electrons and mass, less contact: the branched molecule is closer to a ball than to a chain.', '49,7 °C, etwa 19 K unter Hexan. Gleich viele Elektronen, gleiche Masse, weniger Kontakt: Das verzweigte Molekül ist eher eine Kugel als eine Kette.') },

  // ---------- u8.boiling ----------
  { id: 'i8k', unit: 8, kind: 'choice', format: 'predict', withConfidence: true, concepts: ['u8.boiling'], targets: ['boiling-breaks-bonds'],
    prompt: b('Liquid bromine (Br₂) boils at 58.8 °C. What is in the brown vapour above it?', 'Flüssiges Brom (Br₂) siedet bei 58,8 °C. Was ist im braunen Dampf darüber?'),
    options: [
      { text: b('Single Br atoms: boiling broke the Br–Br bonds', 'Einzelne Br-Atome: Beim Sieden sind die Br–Br-Bindungen gebrochen'), mis: 'boiling-breaks-bonds' },
      { text: b('Br₂ molecules, the same as in the liquid', 'Br₂-Moleküle, wie in der Flüssigkeit'), correct: true },
      { text: b('Br⁺ and Br⁻ ions', 'Br⁺- und Br⁻-Ionen') },
    ],
    explain: b('Boiling pulls whole Br₂ molecules away from each other. The Br–Br bond inside each molecule is far stronger than the dispersion between molecules, so it stays intact.', 'Beim Sieden trennen sich ganze Br₂-Moleküle voneinander. Die Br–Br-Bindung in jedem Molekül ist viel stärker als die Dispersionskräfte zwischen den Molekülen und bleibt erhalten.') },
  { id: 'i8l', unit: 8, kind: 'choice', format: 'why', evidence: 'explain', withConfidence: true, concepts: ['u8.boiling'], targets: ['boiling-breaks-bonds'],
    prompt: b('Boiling one mole of butane takes about 22 kJ. Breaking one mole of C–C bonds takes about 345 kJ. What does the comparison show?', 'Ein Mol Butan zu verdampfen, kostet etwa 22 kJ. Ein Mol C–C-Bindungen zu spalten, kostet etwa 345 kJ. Was zeigt der Vergleich?'),
    options: [
      { text: b('Boiling breaks a few of the C–C bonds and leaves the rest', 'Beim Sieden brechen einige der C–C-Bindungen, der Rest bleibt'), mis: 'boiling-breaks-bonds' },
      { text: b('The numbers cannot be compared: one is for a liquid, one for a gas', 'Die Zahlen lassen sich nicht vergleichen: Eine gilt für eine Flüssigkeit, eine für ein Gas') },
      { text: b('Boiling only overcomes the weak attraction between molecules', 'Beim Sieden wird nur die schwache Anziehung zwischen den Molekülen überwunden'), correct: true },
      { text: b('Heating makes the C–C bonds weaker until they let go', 'Erhitzen schwächt die C–C-Bindungen, bis sie loslassen'), mis: 'boiling-breaks-bonds' },
    ],
    explain: b('If boiling broke C–C bonds, it would cost hundreds of kJ per mole, not 22. The attraction between butane molecules is more than ten times weaker than a single C–C bond, and the molecules leave the liquid whole.', 'Bräche das Sieden C–C-Bindungen, kostete es Hunderte kJ pro Mol, nicht 22. Die Anziehung zwischen Butanmolekülen ist mehr als zehnmal schwächer als eine einzige C–C-Bindung, und die Moleküle verlassen die Flüssigkeit ganz.') },
  { id: 'i8m', unit: 8, kind: 'choice', format: 'predict', evidence: 'transfer', withConfidence: true, concepts: ['u8.boiling'], targets: ['boiling-breaks-bonds'],
    prompt: b('Iodine crystals warmed gently in a closed flask give off a violet vapour. On the cold lid, crystals form again. What happened to the I–I bonds?', 'Iodkristalle, vorsichtig in einem geschlossenen Kolben erwärmt, geben violetten Dampf ab. Am kalten Deckel bilden sich wieder Kristalle. Was ist mit den I–I-Bindungen passiert?'),
    options: [
      { text: b('They broke in the vapour and formed again on the cold lid', 'Sie sind im Dampf gebrochen und haben sich am kalten Deckel neu gebildet'), mis: 'boiling-breaks-bonds' },
      { text: b('They turned into ionic bonds in the hot vapour', 'Sie sind im heißen Dampf zu Ionenbindungen geworden') },
      { text: b('Nothing: whole I₂ molecules left the crystal and came back', 'Nichts: Ganze I₂-Moleküle haben den Kristall verlassen und sind zurückgekehrt'), correct: true },
    ],
    explain: b('Only the dispersion between I₂ molecules was overcome. The vapour is made of I₂ molecules, and on the cold lid they attract each other again and build new crystals.', 'Überwunden wurden nur die Dispersionskräfte zwischen den I₂-Molekülen; Iod sublimiert. Der Dampf besteht aus I₂-Molekülen, und am kalten Deckel ziehen sie sich wieder an und bauen neue Kristalle.') },

  // ---------- u8.everywhere ----------
  { id: 'i8n', unit: 8, kind: 'choice', format: 'predict', withConfidence: true, concepts: ['u8.everywhere'], targets: ['dispersion-only-nonpolar'],
    prompt: b('Hydrogen chloride (HCl) molecules are polar, with a δ+ end and a δ− end. Which attractions act between them?', 'Chlorwasserstoff-Moleküle (HCl) sind polar, mit einem δ+- und einem δ−-Ende. Welche Anziehungen wirken zwischen ihnen?'),
    options: [
      { text: b('Only dipole–dipole attraction: dispersion is for nonpolar molecules', 'Nur Dipol-Dipol-Anziehung: Dispersionskräfte gibt es nur bei unpolaren Molekülen'), mis: 'dispersion-only-nonpolar' },
      { text: b('Dispersion and dipole–dipole attraction together', 'Dispersionskräfte und Dipol-Dipol-Anziehung zusammen'), correct: true },
      { text: b('Only dispersion: the dipoles cancel out in the liquid', 'Nur Dispersionskräfte: Die Dipole heben sich in der Flüssigkeit auf') },
      { text: b('None: HCl is a gas at room temperature', 'Keine: HCl ist bei Raumtemperatur ein Gas') },
    ],
    explain: b('Every molecule has moving electrons, so dispersion acts between all of them, polar or not. HCl molecules attract by dispersion plus their permanent dipoles (unit 9). Being a gas at 20 °C only means the attraction is too weak to hold them at that temperature.', 'Jedes Molekül hat bewegliche Elektronen, also wirken Dispersionskräfte zwischen allen, ob polar oder nicht. HCl-Moleküle ziehen sich durch Dispersionskräfte und zusätzlich durch ihre festen Dipole an (Einheit 9). Dass HCl bei 20 °C ein Gas ist, bedeutet nur: Die Anziehung reicht bei dieser Temperatur nicht, um sie zusammenzuhalten.') },
  { id: 'i8o', unit: 8, kind: 'choice', format: 'why', evidence: 'explain', withConfidence: true, concepts: ['u8.everywhere'], targets: ['dispersion-only-nonpolar'],
    prompt: b('Why does dispersion act between every pair of molecules, even polar ones?', 'Warum wirken Dispersionskräfte zwischen allen Molekülen, auch zwischen polaren?'),
    options: [
      { text: b('Because all molecules are at least slightly polar', 'Weil alle Moleküle zumindest ein bisschen polar sind') },
      { text: b('It doesn\'t: polar molecules attract only through their permanent dipoles', 'Tut sie nicht: Polare Moleküle ziehen sich nur über ihre festen Dipole an'), mis: 'dispersion-only-nonpolar' },
      { text: b('Every molecule has electrons that move and can be pushed lopsided', 'Jedes Molekül hat Elektronen, die sich bewegen und verschieben lassen'), correct: true },
      { text: b('Because every molecule contains carbon', 'Weil jedes Molekül Kohlenstoff enthält') },
    ],
    explain: b('Dispersion needs nothing but electrons, and every molecule has them. A permanent dipole adds a second attraction on top; it does not switch dispersion off.', 'Dispersionskräfte brauchen nichts als Elektronen, und die hat jedes Molekül. Ein fester Dipol bringt eine zweite Anziehung dazu; die Dispersionskräfte schaltet er nicht ab.') },
  { id: 'i8p', unit: 8, kind: 'choice', format: 'predict', evidence: 'transfer', withConfidence: true, concepts: ['u8.everywhere'], targets: ['dispersion-only-nonpolar', 'nonpolar-no-attraction', 'weight-holds-down'],
    prompt: b('Argon (18 electrons, 39.9 g/mol) boils at −185.8 °C. Hydrogen chloride (18 electrons, 36.5 g/mol, polar) boils at −85.1 °C. Which statement fits?', 'Argon (18 Elektronen, 39,9 g/mol) siedet bei −185,8 °C. Chlorwasserstoff (18 Elektronen, 36,5 g/mol, polar) siedet bei −85,1 °C. Welche Aussage passt?'),
    options: [
      { text: b('Argon atoms attract by dispersion; HCl molecules only through their dipoles', 'Argonatome ziehen sich durch Dispersionskräfte an, HCl-Moleküle nur über ihre Dipole'), mis: 'dispersion-only-nonpolar' },
      { text: b('Argon atoms do not attract each other at all', 'Argonatome ziehen sich überhaupt nicht an'), mis: 'nonpolar-no-attraction' },
      { text: b('Argon boils lower because its atoms are lighter', 'Argon siedet niedriger, weil seine Atome leichter sind'), mis: 'weight-holds-down' },
      { text: b('Argon attracts by dispersion only; HCl by dispersion plus its dipoles', 'Argon zieht nur durch Dispersionskräfte an, HCl durch Dispersionskräfte plus seine Dipole'), correct: true },
    ],
    explain: b('The same number of electrons gives a similar dispersion force in both. HCl\'s permanent dipoles add a further attraction, which puts its boiling point about 100 degrees higher. And argon is even the heavier of the two.', 'Gleich viele Elektronen ergeben bei beiden ähnliche Dispersionskräfte. Die festen Dipole des HCl bringen eine weitere Anziehung dazu, die seine Siedetemperatur etwa 100 K höher legt. Und Argon ist sogar das schwerere der beiden.') },
  { id: 'i8e', unit: 8, kind: 'choice', format: 'predict', evidence: 'transfer', withConfidence: true, concepts: ['u8.everywhere'], targets: ['nonpolar-no-attraction', 'weight-holds-down'],
    prompt: b('A gecko can hang from a clean glass pane by a single toe. Its toes carry hundreds of thousands of tiny hairs that split into even finer tips. There is no glue and no suction. What holds it?', 'Ein Gecko kann an einem einzigen Zeh an einer sauberen Glasscheibe hängen. Seine Zehen tragen Hunderttausende winziger Härchen, die sich in noch feinere Spitzen aufteilen. Es gibt keinen Klebstoff und keinen Saugeffekt. Was hält ihn?'),
    options: [
      { text: b('Nothing attracts: the tips hook into tiny cracks in the glass', 'Keine Anziehung: Die Spitzen haken sich in winzige Risse im Glas'), mis: 'nonpolar-no-attraction' },
      { text: b('Dispersion between the tips and the glass, added up over a huge number of contacts', 'Dispersionskräfte zwischen den Spitzen und dem Glas, aufsummiert über eine riesige Zahl von Kontakten'), correct: true },
      { text: b('Static electricity: the hairs are charged', 'Statische Elektrizität: Die Härchen sind geladen') },
      { text: b('The gecko\'s weight presses its toes onto the glass', 'Das Gewicht des Geckos drückt seine Zehen ans Glas'), mis: 'weight-holds-down' },
    ],
    explain: b('Each tip attracts the glass by dispersion, a tiny force, but an enormous number of tips in close contact add up to enough to hold the animal. Experiments found that geckos cling as well to nonpolar surfaces as to polar ones, just as dispersion predicts.', 'Jede Spitze zieht das Glas durch Dispersionskräfte an, für sich genommen winzig, aber eine riesige Zahl von Spitzen in engem Kontakt ergibt zusammen genug, um das Tier zu halten. Versuche zeigten, dass Geckos an unpolaren Oberflächen genauso gut haften wie an polaren, genau wie es die Dispersionskräfte erwarten lassen.') },

  // ---------- u8.state ----------
  { id: 'i8q', unit: 8, kind: 'choice', format: 'predict', withConfidence: true, concepts: ['u8.state', 'u8.dispersion'],
    prompt: b('At 20 °C, one of these is a liquid. Which? Methane (CH₄, 10 electrons), propane (C₃H₈, 26), octane (C₈H₁₈, 66), neon (Ne, 10).', 'Bei 20 °C ist einer dieser Stoffe flüssig. Welcher? Methan (CH₄, 10 Elektronen), Propan (C₃H₈, 26), Octan (C₈H₁₈, 66), Neon (Ne, 10).'),
    options: [
      { text: b('Methane', 'Methan') },
      { text: b('Propane', 'Propan') },
      { text: b('Octane', 'Octan'), correct: true },
      { text: b('Neon', 'Neon') },
    ],
    explain: b('Octane boils at 125.6 °C, so at 20 °C it is a liquid. Methane (−161.5 °C), propane (−42.1 °C) and neon (−246.1 °C) are gases: fewer electrons, weaker dispersion.', 'Octan siedet bei 125,6 °C und ist bei 20 °C flüssig. Methan (−161,5 °C), Propan (−42,1 °C) und Neon (−246,1 °C) sind Gase: weniger Elektronen, schwächere Dispersionskräfte.') },
  { id: 'i8r', unit: 8, kind: 'choice', format: 'why', evidence: 'explain', withConfidence: true, concepts: ['u8.state'], targets: ['boiling-breaks-bonds', 'weight-holds-down'],
    prompt: b('Iodine (I₂) is a solid at room temperature, chlorine (Cl₂) a gas. Both are two-atom molecules from group 17. Why the difference?', 'Iod (I₂) ist bei Raumtemperatur fest, Chlor (Cl₂) ein Gas. Beide sind zweiatomige Moleküle aus Gruppe 17 (VII. Hauptgruppe). Woher kommt der Unterschied?'),
    options: [
      { text: b('The I–I bond is stronger than the Cl–Cl bond', 'Die I–I-Bindung ist stärker als die Cl–Cl-Bindung'), mis: 'boiling-breaks-bonds' },
      { text: b('I₂ has 106 electrons against 34, so the dispersion between its molecules is much stronger', 'I₂ hat 106 Elektronen gegenüber 34, also sind die Dispersionskräfte zwischen seinen Molekülen viel stärker'), correct: true },
      { text: b('Iodine molecules are heavier, so gravity holds them in place', 'Iodmoleküle sind schwerer, also hält die Schwerkraft sie fest'), mis: 'weight-holds-down' },
      { text: b('Iodine molecules are polar', 'Iodmoleküle sind polar') },
    ],
    explain: b('The state depends on the attraction between molecules, not on the bond inside them; the I–I bond is in fact weaker than Cl–Cl. Iodine\'s much larger electron cloud makes the dispersion strong enough to hold a crystal together at 20 °C.', 'Der Zustand hängt von der Anziehung zwischen den Molekülen ab, nicht von der Bindung in ihnen; die I–I-Bindung ist sogar schwächer als Cl–Cl. Die viel größere Elektronenwolke des Iods macht die Dispersionskräfte stark genug, um bei 20 °C einen Kristall zusammenzuhalten.') },
  { id: 'i8s', unit: 8, kind: 'choice', format: 'predict', evidence: 'transfer', withConfidence: true, concepts: ['u8.state'], targets: ['boiling-breaks-bonds'],
    prompt: b('Butane boils at −0.5 °C. On a winter day at −10 °C, a butane lighter often gives only a weak flame or none. Why?', 'Butan siedet bei −0,5 °C. An einem Wintertag bei −10 °C gibt ein Butanfeuerzeug oft nur eine schwache oder gar keine Flamme. Warum?'),
    options: [
      { text: b('The cold breaks some of butane\'s C–C bonds', 'Die Kälte bricht einige C–C-Bindungen im Butan'), mis: 'boiling-breaks-bonds' },
      { text: b('The butane freezes solid', 'Das Butan gefriert') },
      { text: b('Below its boiling point the butane vapour pushes with less than normal air pressure, so little gas comes out', 'Unter seiner Siedetemperatur drückt der Butandampf schwächer als der normale Luftdruck, also kommt wenig Gas heraus'), correct: true },
      { text: b('Cold air contains no oxygen', 'Kalte Luft enthält keinen Sauerstoff') },
    ],
    explain: b('At −10 °C butane is below its boiling point: the vapour above the liquid pushes with less than normal air pressure, so little gas streams out of the nozzle to feed a flame. It only freezes at −138.3 °C.', 'Bei −10 °C liegt Butan unter seiner Siedetemperatur: Der Dampf über der Flüssigkeit drückt schwächer als der normale Luftdruck, also strömt kaum Gas aus der Düse, um eine Flamme zu speisen. Gefrieren würde es erst bei −138,3 °C.') },
];
