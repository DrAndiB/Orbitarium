import type { Bi } from '../../i18n';
import type { Item } from '../items';

const b = (en: string, de: string): Bi => ({ en, de });

// Unit 10 question bank: three or more variants per concept (predict, why, transfer), every trap option tagged.
// Data: substances.ts (boiling points, electron counts, donors/acceptors; CRC Handbook, NIST WebBook); bonds.ts
// (O–H 464, H–F 569 kJ/mol); the elements table (Pauling electronegativity; empirical radii N 65, Cl 100 pm);
// WATER.hBondEnergy (about 20 kJ/mol). Counting convention as in unit10.ts: "takes part in" counts bond ends (water up
// to 4), "per molecule (each bond counted once)" divides by two (water 2, HF and NH₃ about 1). Strong hydrogen bonds need
// N, O or F; H on Cl or S forms only weak ones. Not in substances.ts, from the CRC Handbook: hydrazine N₂H₄ boils at
// 113.5 °C, hydrogen peroxide H₂O₂ at 150.2 °C (both 18 electrons). HCl dipole moment 1.11 D (substances.ts).
export const BANK_U10: Item[] = [
  // ---------- u10.donor-acceptor ----------
  { id: 'i10b', unit: 10, kind: 'choice', format: 'predict', withConfidence: true, concepts: ['u10.donor-acceptor'], targets: ['any-h-hbond', 'hbond-donor-acceptor'],
    prompt: b('Which of these molecules is a strong donor in a [[h-bond]], that is, brings an H on N, O or F?', 'Welches dieser Moleküle ist bei einer [[h-bond]] ein starker Donor, bringt also ein H an N, O oder F mit?'),
    options: [
      { text: b('methane, {{CH4}}: four H atoms', 'Methan, {{CH4}}: vier H-Atome'), mis: 'any-h-hbond' },
      { text: b('dimethyl ether, {{CH3OCH3}}: an oxygen with lone pairs', 'Dimethylether, {{CH3OCH3}}: ein Sauerstoff mit freien Paaren'), mis: 'hbond-donor-acceptor' },
      { text: b('methanol, {{CH3OH}}: one H on oxygen', 'Methanol, {{CH3OH}}: ein H am Sauerstoff'), correct: true },
      { text: b('hydrogen chloride, {{HCl}}: one H on chlorine', 'Chlorwasserstoff, {{HCl}}: ein H am Chlor') },
    ],
    explain: b('A strong donor needs an H on N, O or F. Methanol has one, its O–H. Methane\'s and the ether\'s H all sit on carbon; the ether\'s oxygen can only accept. HCl\'s H sits on chlorine, which is much bigger than N, O or F: it forms only very weak hydrogen bonds.',
      'Ein starker Donor braucht ein H an N, O oder F. Methanol hat eines, sein O–H. Die H von Methan und Ether sitzen alle am Kohlenstoff; der Sauerstoff des Ethers kann nur Akzeptor sein. Das H des HCl sitzt am Chlor, das viel größer ist als N, O oder F: Es bildet nur sehr schwache Wasserstoffbrücken.') },
  { id: 'i10c', unit: 10, kind: 'choice', format: 'why', evidence: 'explain', withConfidence: true, concepts: ['u10.donor-acceptor'], targets: ['hbond-is-covalent'],
    prompt: b('In a hydrogen bond between two water molecules, what attracts what?', 'Was zieht bei einer Wasserstoffbrücke zwischen zwei Wassermolekülen was an?'),
    options: [
      { text: b('The two oxygen atoms, which share a pair of electrons', 'Die zwei Sauerstoffatome, die sich ein Elektronenpaar teilen'), mis: 'hbond-is-covalent' },
      { text: b('The δ+ H of one molecule and a lone pair on the O of the other', 'Das δ+-H des einen Moleküls und ein freies Elektronenpaar am O des anderen'), correct: true },
      { text: b('An H of one molecule and an H of the other', 'Ein H des einen Moleküls und ein H des anderen') },
      { text: b('The O and the H inside one molecule: it is the O–H bond', 'Das O und das H in einem Molekül: Es ist die O–H-Bindung'), mis: 'hbond-is-covalent' },
    ],
    explain: b('The H on oxygen is left strongly δ+ (positive), and it is drawn to a lone pair on a neighbour\'s oxygen. The O–H bond inside each molecule is a shared pair; the hydrogen bond is a weaker attraction between molecules.',
      'Das H am Sauerstoff hat eine deutliche positive Partialladung (δ+) und wird von einem freien Elektronenpaar am Sauerstoff eines Nachbarn angezogen. Die O–H-Bindung im Molekül ist ein gemeinsames Paar; die Wasserstoffbrücke ist eine schwächere Anziehung zwischen Molekülen.') },
  { id: 'i10d', unit: 10, kind: 'choice', format: 'predict', evidence: 'transfer', withConfidence: true, concepts: ['u10.donor-acceptor'], targets: ['hbond-donor-acceptor'],
    prompt: b('Hydrazine, H₂N–NH₂, is a rocket fuel. Each nitrogen carries two H and one lone pair. In hydrogen bonds, hydrazine can be…', 'Hydrazin, H₂N–NH₂, ist ein Raketentreibstoff. Jeder Stickstoff trägt zwei H und ein freies Elektronenpaar. Bei Wasserstoffbrücken kann Hydrazin…'),
    options: [
      { text: b('a donor only', 'nur Donor sein'), mis: 'hbond-donor-acceptor' },
      { text: b('an acceptor only', 'nur Akzeptor sein'), mis: 'hbond-donor-acceptor' },
      { text: b('both donor and acceptor', 'Donor und Akzeptor sein'), correct: true },
      { text: b('neither: nitrogen is not electronegative enough', 'keines von beiden: Stickstoff ist nicht elektronegativ genug') },
    ],
    explain: b('Four H on N are donors and two lone pairs on N are acceptors, so hydrazine does both. It boils at 113.5 °C, far above ethane (−88.6 °C), which has the same 18 electrons.',
      'Vier H am N sind Donoren, zwei freie Elektronenpaare am N Akzeptoren, Hydrazin kann also beides. Es siedet bei 113,5 °C, weit über Ethan (−88,6 °C) mit ebenfalls 18 Elektronen.') },

  // ---------- u10.why-nof ----------
  { id: 'i10e', unit: 10, kind: 'rank', format: 'rank', concepts: ['u10.why-nof'], table: 'chi',
    prompt: b('Rank these bonds by how positive (δ+) the hydrogen is, most positive first.', 'Ordne die Bindungen danach, wie positiv (δ+) der Wasserstoff ist, den positivsten zuerst.'),
    order: [b('H–F', 'H–F'), b('O–H', 'O–H'), b('N–H', 'N–H'), b('C–H', 'C–H')],
    explain: b('Electronegativity differences of 1.78, 1.24, 0.84 and 0.35. The harder the partner pulls on the shared pair, the more positive the H is left, and the stronger the hydrogen bond it can make.',
      'ΔEN = 1,78; 1,24; 0,84 und 0,35. Je stärker der Partner am gemeinsamen Paar zieht, desto positiver bleibt das H, und desto stärker ist die Wasserstoffbrücke, die es bilden kann.') },
  { id: 'i10f', unit: 10, kind: 'choice', format: 'why', evidence: 'explain', withConfidence: true, concepts: ['u10.why-nof'], targets: ['polar-means-ions'],
    prompt: b('Why are N, O and F the atoms that make strong hydrogen bonds?', 'Warum sind gerade N, O und F die Atome, die starke Wasserstoffbrücken bilden?'),
    options: [
      { text: b('They have the most electrons, so they attract each other most', 'Sie haben die meisten Elektronen, also ziehen sie sich am stärksten an') },
      { text: b('They are the only atoms with lone pairs', 'Sie sind die einzigen Atome mit freien Elektronenpaaren') },
      { text: b('They pull hard and are small: the H on them is strongly δ+, and their lone pairs are compact', 'Sie ziehen stark und sind klein: Das H an ihnen ist stark δ+, und ihre freien Paare sind kompakt'), correct: true },
      { text: b('They form ions with hydrogen, H⁺ and F⁻', 'Sie bilden mit Wasserstoff Ionen, H⁺ und F⁻'), mis: 'polar-means-ions' },
    ],
    explain: b('High electronegativity leaves the H strongly δ+, and a small atom keeps its lone pair compact, so the H can come close. Chlorine and sulfur have lone pairs too, but on much bigger atoms; their hydrogen bonds are very weak.',
      'Eine hohe EN lässt das H stark δ+ zurück, und ein kleines Atom hält sein freies Paar kompakt, sodass das H nah herankommt. Auch Chlor und Schwefel haben freie Paare, aber an viel größeren Atomen; ihre Wasserstoffbrücken sind sehr schwach.') },
  { id: 'i10g', unit: 10, kind: 'choice', format: 'predict', evidence: 'transfer', withConfidence: true, concepts: ['u10.why-nof'], targets: ['polar-means-ions'], table: 'radius',
    prompt: b('Chlorine pulls on a shared pair a little harder than nitrogen (electronegativity 3.16 against 3.04). Yet liquid ammonia has real hydrogen bonds and liquid HCl only very weak ones. Best reason?', 'Chlor zieht etwas stärker an einem gemeinsamen Paar als Stickstoff (EN 3,16 gegenüber 3,04). Trotzdem hat flüssiges Ammoniak echte Wasserstoffbrücken und flüssiges HCl nur sehr schwache. Der beste Grund?'),
    options: [
      { text: b('Chlorine has no lone pairs', 'Chlor hat keine freien Elektronenpaare') },
      { text: b('Chlorine is far bigger (100 pm against 65): its lone pairs are spread out, so an H cannot get close', 'Chlor ist viel größer (100 pm gegenüber 65): Seine freien Paare sind ausgedehnt, ein H kommt nicht nah heran'), correct: true },
      { text: b('HCl is nonpolar', 'HCl ist unpolar') },
      { text: b('HCl is ionic, so it forms H⁺ and Cl⁻ instead', 'HCl ist ionisch und bildet stattdessen H⁺ und Cl⁻'), mis: 'polar-means-ions' },
    ],
    explain: b('Size matters as well as pull. Chlorine\'s lone pairs sit on an atom with about 1.5 times the radius of nitrogen, so the charge is spread out and an H cannot get close. HCl is polar (1.11 D) and made of molecules, but its hydrogen bonds are very weak.',
      'Neben der Anziehung zählt die Größe. Die freien Paare des Chlors sitzen an einem Atom mit etwa dem 1,5-fachen Radius von Stickstoff, die Ladung ist also verteilt, und ein H kommt nicht nah heran. HCl ist polar (1,11 D) und besteht aus Molekülen, aber seine Wasserstoffbrücken sind sehr schwach.') },

  // ---------- u10.anomaly ----------
  { id: 'i10h', unit: 10, kind: 'choice', format: 'predict', withConfidence: true, concepts: ['u10.anomaly'],
    prompt: b('Going up group 16: H₂Te boils at −2.2 °C, H₂Se at −41.3 °C, H₂S at −60.3 °C. Following that trend, where would water boil without hydrogen bonds?', 'Gruppe 16 (VI. Hauptgruppe) nach oben: H₂Te siedet bei −2,2 °C, H₂Se bei −41,3 °C, H₂S bei −60,3 °C. Wo würde Wasser nach diesem Trend ohne Wasserstoffbrücken sieden?'),
    options: [
      { text: b('Around 100 °C, where it boils', 'Um 100 °C, wo es siedet') },
      { text: b('Around 0 °C', 'Um 0 °C') },
      { text: b('Far below zero, around −80 °C: a gas at room temperature', 'Weit unter null, um −80 °C: bei Raumtemperatur ein Gas'), correct: true },
      { text: b('Above 100 °C: the lightest molecule boils highest', 'Über 100 °C: Das leichteste Molekül siedet am höchsten') },
    ],
    explain: b('Each step up the column lowers the boiling point; one more step from H₂S lands somewhere around −70 to −90 °C. The real 100 °C is the work of hydrogen bonds.',
      'Jeder Schritt in der Spalte nach oben senkt die Siedetemperatur; ein weiterer Schritt von H₂S aus landet irgendwo bei −70 bis −90 °C. Die echten 100 °C sind das Werk der Wasserstoffbrücken.') },
  { id: 'i10i', unit: 10, kind: 'choice', format: 'why', evidence: 'explain', withConfidence: true, concepts: ['u10.anomaly'], targets: ['hbond-is-covalent'],
    prompt: b('HF boils at 19.5 °C, HCl at −85.1 °C, although HCl has more electrons (18 against 10). Why?', 'HF siedet bei 19,5 °C, HCl bei −85,1 °C, obwohl HCl mehr Elektronen hat (18 gegenüber 10). Warum?'),
    options: [
      { text: b('HF molecules hold each other by strong hydrogen bonds; HCl molecules only by very weak ones', 'HF-Moleküle halten über starke Wasserstoffbrücken zusammen, HCl-Moleküle nur über sehr schwache'), correct: true },
      { text: b('The H–F bond is stronger, and boiling has to break it', 'Die H–F-Bindung ist stärker, und beim Sieden muss sie brechen'), mis: 'hbond-is-covalent' },
      { text: b('HF is the heavier molecule', 'HF ist das schwerere Molekül') },
      { text: b('HCl is ionic, and ions boil low', 'HCl ist ionisch, und Ionen sieden niedrig') },
    ],
    explain: b('Fluorine is small and pulls hardest, so HF forms hydrogen bonds; chlorine\'s are very weak. Boiling only separates the molecules: the H–F bond (569 kJ/mol) stays whole either way. HF is also the lighter molecule (20 against 36 g/mol).',
      'Fluor ist klein und zieht am stärksten, also bildet HF Wasserstoffbrücken; die des Chlors sind sehr schwach. Beim Sieden trennen sich nur die Moleküle: Die H–F-Bindung (569 kJ/mol) bleibt in jedem Fall ganz. HF ist außerdem das leichtere Molekül (20 gegenüber 36 g/mol).') },
  { id: 'i10j', unit: 10, kind: 'choice', format: 'odd', evidence: 'transfer', concepts: ['u10.anomaly'],
    prompt: b('Group 15 boiling points: NH₃ −33.3 °C, PH₃ −87.7 °C, AsH₃ −62.5 °C, SbH₃ −17 °C. Which one is out of line with the trend?', 'Siedetemperaturen der Gruppe 15 (V. Hauptgruppe): NH₃ −33,3 °C, PH₃ −87,7 °C, AsH₃ −62,5 °C, SbH₃ −17 °C. Welche passt nicht zum Trend?'),
    options: [
      { text: b('NH₃', 'NH₃'), correct: true },
      { text: b('PH₃', 'PH₃') },
      { text: b('AsH₃', 'AsH₃') },
      { text: b('SbH₃', 'SbH₃') },
    ],
    explain: b('From PH₃ down, the boiling point rises with the electron count, as dispersion predicts. NH₃ has the fewest electrons and should boil lowest, but its N–H and its lone pair form hydrogen bonds, so it boils above PH₃ and AsH₃.',
      'Ab PH₃ steigt die Siedetemperatur nach unten mit der Elektronenzahl, wie die Dispersion es vorhersagt. NH₃ hat die wenigsten Elektronen und müsste am niedrigsten sieden, aber seine N–H und sein freies Elektronenpaar bilden Wasserstoffbrücken, also siedet es über PH₃ und AsH₃.') },
  { id: 'i10k', unit: 10, kind: 'choice', format: 'why', evidence: 'explain', withConfidence: true, concepts: ['u10.anomaly', 'u10.donor-acceptor'], targets: ['any-h-hbond'],
    prompt: b('In group 14, methane (−161.5 °C) boils lowest, right on the trend. Why does it not jump like water?', 'In Gruppe 14 (IV. Hauptgruppe) siedet Methan (−161,5 °C) am niedrigsten, genau im Trend. Warum springt es nicht nach oben wie Wasser?'),
    options: [
      { text: b('Methane forms hydrogen bonds too, but dispersion hides them', 'Methan bildet auch Wasserstoffbrücken, aber die Dispersion überdeckt sie'), mis: 'any-h-hbond' },
      { text: b('C–H is barely polar and carbon has no lone pair: no donor, no acceptor', 'C–H ist kaum polar, und Kohlenstoff hat kein freies Elektronenpaar: kein Donor, kein Akzeptor'), correct: true },
      { text: b('Methane is too light for any attraction between molecules', 'Methan ist zu leicht für jede Anziehung zwischen Molekülen') },
      { text: b('Carbon is too small to hold four hydrogen atoms firmly', 'Kohlenstoff ist zu klein, um vier H-Atome fest zu halten') },
    ],
    explain: b('Carbon (2.55) barely pulls on its H (2.20), so they are hardly δ+, and all four of carbon\'s outer pairs are bonds. With nothing to give and nothing to take, methane only has dispersion, which is weakest for the smallest molecule.',
      'Kohlenstoff (EN 2,55) zieht kaum an seinen H (EN 2,20), sie sind also kaum δ+, und alle vier Elektronenpaare des Kohlenstoffs sind Bindungen. Ohne etwas zu geben oder zu nehmen bleibt Methan nur die Dispersion, und die ist beim kleinsten Molekül am schwächsten.') },

  // ---------- u10.count ----------
  { id: 'i10l', unit: 10, kind: 'choice', format: 'predict', withConfidence: true, concepts: ['u10.count'],
    prompt: b('Fluorine pulls harder than oxygen, so one F–H···F hydrogen bond is stronger than one in water. Which boils higher, HF or water?', 'Fluor zieht stärker als Sauerstoff, also ist eine F–H···F-Brücke stärker als eine im Wasser. Was siedet höher, HF oder Wasser?'),
    options: [
      { text: b('HF: stronger hydrogen bonds always mean a higher boiling point', 'HF: Stärkere Wasserstoffbrücken bedeuten immer eine höhere Siedetemperatur') },
      { text: b('Water: two hydrogen bonds per molecule, HF only one (each bond counted once)', 'Wasser: zwei Wasserstoffbrücken pro Molekül, HF nur eine (jede Brücke einmal gezählt)'), correct: true },
      { text: b('The same: both are polar molecules with 10 electrons', 'Gleich hoch: Beide sind polare Moleküle mit 10 Elektronen') },
      { text: b('HF: its three lone pairs give it the most hydrogen bonds', 'HF: Seine drei freien Paare geben ihm die meisten Wasserstoffbrücken') },
    ],
    explain: b('Water 100 °C, HF 19.5 °C. HF has three lone pairs but only one H to give, so there is about one hydrogen bond per HF molecule (each bond counted once); water\'s two donors and two acceptors give two. Here the number of bonds beats the strength of each.',
      'Wasser 100 °C, HF 19,5 °C. HF hat drei freie Paare, aber nur ein H zu bieten, also kommt auf ein HF-Molekül etwa eine Wasserstoffbrücke (jede Brücke einmal gezählt); die zwei Donoren und zwei Akzeptoren des Wassers ergeben zwei. Hier schlägt die Zahl der Brücken die Stärke jeder einzelnen.') },
  { id: 'i10m', unit: 10, kind: 'choice', format: 'why', evidence: 'explain', withConfidence: true, concepts: ['u10.count'], targets: ['more-h-more-hbonds', 'hbond-is-covalent'],
    prompt: b('Ammonia has three H on nitrogen, water two on oxygen, yet ammonia boils at −33.3 °C and water at 100 °C. Why don\'t ammonia\'s three donors help more?', 'Ammoniak hat drei H am Stickstoff, Wasser zwei am Sauerstoff, trotzdem siedet Ammoniak bei −33,3 °C und Wasser bei 100 °C. Warum helfen die drei Donoren des Ammoniaks nicht mehr?'),
    options: [
      { text: b('More H atoms do give more hydrogen bonds; the boiling point must be measured wrongly', 'Mehr H-Atome ergeben doch mehr Wasserstoffbrücken; die Siedetemperatur muss falsch gemessen sein'), mis: 'more-h-more-hbonds' },
      { text: b('Each hydrogen bond also needs an acceptor, and NH₃ has only one lone pair', 'Jede Wasserstoffbrücke braucht auch einen Akzeptor, und NH₃ hat nur ein freies Elektronenpaar'), correct: true },
      { text: b('The N–H bonds break more easily when ammonia boils', 'Die N–H-Bindungen brechen beim Sieden des Ammoniaks leichter'), mis: 'hbond-is-covalent' },
      { text: b('Nitrogen is not electronegative enough for any hydrogen bonds', 'Stickstoff ist nicht elektronegativ genug für überhaupt eine Wasserstoffbrücke') },
    ],
    explain: b('A hydrogen bond pairs one donor with one acceptor. As a rule of thumb, ammonia\'s single lone pair limits it, so most of its H find no partner; water\'s two and two match up. Nitrogen also pulls less than oxygen, so each N–H···N bond is weaker. Ammonia does form hydrogen bonds, which is why it boils above PH₃ (−87.7 °C).',
      'Eine Wasserstoffbrücke paart einen Donor mit einem Akzeptor. Als Faustregel begrenzt das einzige freie Paar des Ammoniaks, also finden die meisten seiner H keinen Partner; beim Wasser passen zwei und zwei zusammen. Außerdem zieht Stickstoff schwächer als Sauerstoff, jede N–H···N-Brücke ist also schwächer. Ammoniak bildet durchaus Wasserstoffbrücken, deshalb siedet es über PH₃ (−87,7 °C).') },
  { id: 'i10n', unit: 10, kind: 'choice', format: 'predict', evidence: 'transfer', withConfidence: true, concepts: ['u10.count'], targets: ['more-h-more-hbonds', 'hbond-is-covalent'],
    prompt: b('Hydrogen peroxide, H–O–O–H, has two H on oxygen and two lone pairs on each oxygen, and 18 electrons (water: 10). Predict its boiling point compared with water\'s 100 °C.', 'Wasserstoffperoxid, H–O–O–H, hat zwei H am Sauerstoff, zwei freie Elektronenpaare an jedem Sauerstoff und 18 Elektronen (Wasser: 10). Sag seine Siedetemperatur im Vergleich zu den 100 °C des Wassers voraus.'),
    options: [
      { text: b('Exactly 100 °C: the same two H, the same hydrogen bonds', 'Genau 100 °C: dieselben zwei H, dieselben Wasserstoffbrücken'), mis: 'more-h-more-hbonds' },
      { text: b('Higher: as many donors, more acceptors and more electrons', 'Höher: gleich viele Donoren, mehr Akzeptoren und mehr Elektronen'), correct: true },
      { text: b('Lower: its O–H bonds are weaker and break sooner', 'Niedriger: Seine O–H-Bindungen sind schwächer und brechen früher'), mis: 'hbond-is-covalent' },
      { text: b('Far lower: the O–O bond makes it nonpolar', 'Viel niedriger: Die O–O-Bindung macht es unpolar') },
    ],
    explain: b('Hydrogen peroxide boils at 150.2 °C. Its two donors find plenty of acceptors (four lone pairs), and its 18 electrons add more dispersion than water\'s 10.',
      'Wasserstoffperoxid siedet bei 150,2 °C. Seine zwei Donoren finden reichlich Akzeptoren (vier freie Elektronenpaare), und seine 18 Elektronen bringen mehr Dispersion als die 10 des Wassers.') },
  { id: 'i10o', unit: 10, kind: 'estimate', format: 'estimate', evidence: 'transfer', concepts: ['u10.count'],
    prompt: b('In ice every water molecule takes part in four hydrogen bonds: two it donates, two it accepts. Each hydrogen bond joins two molecules. How many hydrogen bonds are there per molecule, counting each bond once?', 'Im Eis ist jedes Wassermolekül an vier Wasserstoffbrücken beteiligt: zwei spendet es, zwei nimmt es an. Jede Brücke verbindet zwei Moleküle. Wie viele Wasserstoffbrücken kommen auf ein Molekül, wenn man jede Brücke einmal zählt?'),
    min: 0, max: 8, step: 0.5, answer: 2, tolerance: 0, suffix: '',
    near: [{ value: 4, tol: 0, note: b('4 counts every bond twice, once from each end. Split each bond between its two molecules.', '4 zählt jede Brücke doppelt, von beiden Enden aus. Teile jede Brücke auf ihre zwei Moleküle auf.') }],
    explain: b('Four bonds touch each molecule, but each bond is shared by two molecules: 4 ÷ 2 = 2 per molecule. Equivalently: each molecule donates two, and every bond has exactly one donor.',
      'Vier Brücken berühren jedes Molekül, aber jede Brücke gehört zwei Molekülen: 4 ÷ 2 = 2 pro Molekül. Anders gesagt: Jedes Molekül spendet zwei, und jede Brücke hat genau einen Donor.') },

  // ---------- u10.acceptor-only ----------
  { id: 'i10a', unit: 10, kind: 'choice', format: 'predict', withConfidence: true, concepts: ['u10.acceptor-only'], targets: ['hbond-donor-acceptor'],
    prompt: b('Dimethyl ether, CH₃–O–CH₃, meets water. In a [[h-bond]], dimethyl ether can be…', 'Dimethylether, CH₃–O–CH₃, trifft auf Wasser. Bei einer [[h-bond]] kann Dimethylether…'),
    options: [
      { text: b('an acceptor only', 'nur Akzeptor sein'), correct: true },
      { text: b('a donor only', 'nur Donor sein'), mis: 'hbond-donor-acceptor' },
      { text: b('both donor and acceptor', 'Donor und Akzeptor sein'), mis: 'hbond-donor-acceptor' },
      { text: b('neither', 'keines von beiden') },
    ],
    explain: b('Its oxygen has two lone pairs to accept with, but none of its six H sits on oxygen, so it cannot donate: water brings the H.', 'Sein Sauerstoff hat zwei freie Elektronenpaare zum Annehmen, aber keines seiner sechs H sitzt am Sauerstoff, er kann also kein Donor sein: Das H liefert das Wassermolekül.') },
  { id: 'i10p', unit: 10, kind: 'choice', format: 'why', evidence: 'explain', withConfidence: true, concepts: ['u10.acceptor-only'], targets: ['any-h-hbond'],
    prompt: b('Acetone mixes with water in any ratio, yet two acetone molecules cannot form a hydrogen bond with each other. How can both be true?', 'Aceton mischt sich in jedem Verhältnis mit Wasser, trotzdem können zwei Acetonmoleküle keine Wasserstoffbrücke miteinander bilden. Wie passt das zusammen?'),
    options: [
      { text: b('Acetone\'s oxygen accepts H from water, but acetone has no H on O to give', 'Der Sauerstoff des Acetons nimmt H vom Wasser an, aber Aceton hat kein H am O zu geben'), correct: true },
      { text: b('Acetone donates its C–H to water\'s oxygen', 'Aceton spendet seine C–H an den Sauerstoff des Wassers'), mis: 'any-h-hbond' },
      { text: b('Acetone reacts with water and forms new covalent bonds', 'Aceton reagiert mit Wasser und bildet neue Atombindungen') },
      { text: b('Acetone is ionic and dissolves like salt', 'Aceton ist ionisch und löst sich wie Salz') },
    ],
    explain: b('Between acetone and water there is a donor (water\'s O–H) and an acceptor (acetone\'s O). Between two acetone molecules there are only acceptors, so they hold together by dipole–dipole forces instead (unit 9).',
      'Zwischen Aceton und Wasser gibt es einen Donor (das O–H des Wassers) und einen Akzeptor (den O des Acetons). Zwischen zwei Acetonmolekülen gibt es nur Akzeptoren, sie halten stattdessen über Dipol-Dipol-Kräfte zusammen (Einheit 9).') },
  { id: 'i10q', unit: 10, kind: 'choice', format: 'predict', evidence: 'transfer', withConfidence: true, concepts: ['u10.acceptor-only'], targets: ['hbond-is-covalent', 'any-h-hbond'],
    prompt: b('Ethanol (78.4 °C) and dimethyl ether (−24.8 °C) have the same atoms, C₂H₆O. Why is the ether\'s boiling point so much lower?', 'Ethanol (78,4 °C) und Dimethylether (−24,8 °C) haben dieselben Atome, C₂H₆O. Warum siedet der Ether so viel niedriger?'),
    options: [
      { text: b('Ethanol\'s O–H bond has to break when it boils', 'Die O–H-Bindung des Ethanols muss beim Sieden brechen'), mis: 'hbond-is-covalent' },
      { text: b('The ether\'s six H on carbon form hydrogen bonds that ethanol lacks', 'Die sechs H am Kohlenstoff des Ethers bilden Wasserstoffbrücken, die dem Ethanol fehlen'), mis: 'any-h-hbond' },
      { text: b('The ether can only accept; ethanol\'s O–H can also donate, so ethanol molecules link up', 'Der Ether kann nur Akzeptor sein; das O–H des Ethanols kann auch spenden, also hängen Ethanolmoleküle aneinander'), correct: true },
      { text: b('Ethanol is the heavier molecule', 'Ethanol ist das schwerere Molekül') },
    ],
    explain: b('Same atoms, same electrons, same mass (46 g/mol). The difference is where one H sits: on oxygen in ethanol (a donor), on carbon in the ether (no donor). Two ether molecules have only acceptors between them.',
      'Gleiche Atome, gleiche Elektronen, gleiche Masse (46 g/mol). Der Unterschied ist, wo ein H sitzt: am Sauerstoff im Ethanol (ein Donor), am Kohlenstoff im Ether (kein Donor). Zwischen zwei Ethermolekülen gibt es nur Akzeptoren.') },

  // ---------- u10.not-covalent ----------
  { id: 'i10r', unit: 10, kind: 'choice', format: 'predict', withConfidence: true, concepts: ['u10.not-covalent'], targets: ['hbond-is-covalent'],
    prompt: b('Water boils at 100 °C. What comes apart?', 'Wasser siedet bei 100 °C. Was löst sich dabei?'),
    options: [
      { text: b('The O–H bonds, giving free H and O atoms', 'Die O–H-Bindungen, es entstehen freie H- und O-Atome'), mis: 'hbond-is-covalent' },
      { text: b('The water molecules split into hydrogen and oxygen gas', 'Die Wassermoleküle zerfallen in Wasserstoff und Sauerstoff'), mis: 'hbond-is-covalent' },
      { text: b('The hydrogen bonds between molecules; each H₂O stays whole', 'Die Wasserstoffbrücken zwischen den Molekülen; jedes H₂O bleibt ganz'), correct: true },
      { text: b('Nothing comes apart; the molecules only get bigger', 'Nichts löst sich; die Moleküle werden nur größer') },
    ],
    explain: b('Steam is still made of H₂O molecules. Boiling pulls the molecules away from each other, which means breaking hydrogen bonds (about 20 kJ/mol each), not O–H bonds (464 kJ/mol).',
      'Wasserdampf besteht weiter aus H₂O-Molekülen. Beim Sieden entfernen sich die Moleküle voneinander, dabei lösen sich Wasserstoffbrücken (je etwa 20 kJ/mol), keine O–H-Bindungen (464 kJ/mol).') },
  { id: 'i10s', unit: 10, kind: 'choice', format: 'why', evidence: 'explain', withConfidence: true, concepts: ['u10.not-covalent'], targets: ['hbond-is-covalent', 'polar-means-ions'],
    prompt: b('A hydrogen bond in water takes about 20 kJ/mol to break, the O–H bond inside the molecule 464 kJ/mol. Why so different?', 'Eine Wasserstoffbrücke im Wasser zu lösen kostet etwa 20 kJ/mol, die O–H-Bindung im Molekül 464 kJ/mol. Warum so verschieden?'),
    options: [
      { text: b('The hydrogen bond is a shared pair too, only a longer one', 'Die Wasserstoffbrücke ist auch ein gemeinsames Paar, nur ein längeres'), mis: 'hbond-is-covalent' },
      { text: b('The hydrogen bond is ionic, between H⁺ and O²⁻', 'Die Wasserstoffbrücke ist ionisch, zwischen H⁺ und O²⁻'), mis: 'polar-means-ions' },
      { text: b('The two numbers describe the same bond at different temperatures', 'Die zwei Zahlen beschreiben dieselbe Bindung bei verschiedenen Temperaturen') },
      { text: b('It is only an attraction between a δ+ H and a lone pair on another molecule, not a shared pair', 'Sie ist nur eine Anziehung zwischen einem δ+-H und einem freien Paar eines anderen Moleküls, kein gemeinsames Paar'), correct: true },
    ],
    explain: b('In the O–H bond both nuclei hold one shared pair. In the hydrogen bond only partial charges attract, across a longer distance (about 190 pm against 96 pm): roughly one twentieth of the energy.',
      'In der O–H-Bindung halten beide Kerne ein gemeinsames Paar. In der Wasserstoffbrücke ziehen sich nur Partialladungen an, über einen größeren Abstand (etwa 190 pm gegenüber 96 pm): ungefähr ein Zwanzigstel der Energie.') },
  { id: 'i10t', unit: 10, kind: 'estimate', format: 'estimate', evidence: 'transfer', concepts: ['u10.not-covalent'],
    prompt: b('One hydrogen bond in water: about 20 kJ/mol. One O–H bond: 464 kJ/mol. About how many hydrogen bonds add up to the energy of one O–H bond? (Divide.)', 'Eine Wasserstoffbrücke im Wasser: etwa 20 kJ/mol. Eine O–H-Bindung: 464 kJ/mol. Etwa wie viele Wasserstoffbrücken ergeben zusammen die Energie einer O–H-Bindung? (Teile.)'),
    min: 1, max: 60, step: 1, answer: 23, tolerance: 3, suffix: '',
    explain: b('464 ÷ 20 ≈ 23. A hydrogen bond is strong for a force between molecules, but it is only about one twentieth of a covalent bond, which is why water boils at 100 °C long before its molecules fall apart.',
      '464 ÷ 20 ≈ 23. Für eine Kraft zwischen Molekülen ist eine Wasserstoffbrücke stark, aber sie hat nur etwa ein Zwanzigstel der Energie einer Atombindung; deshalb siedet Wasser bei 100 °C, lange bevor seine Moleküle zerfallen.') },
];
