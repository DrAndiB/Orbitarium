import type { Bi } from '../../i18n';
import type { Item } from '../items';

const b = (en: string, de: string): Bi => ({ en, de });

// Unit 9 question bank: three variants per concept (predict, why, transfer), every trap option tagged.
// Data: substances.ts (boiling points, electrons, dipole moments; CRC Handbook, NIST WebBook); electronegativities
// from the elements table; bond energies from bonds.ts (H–Cl 432, O–H 464, C=O 741 kJ/mol). Enthalpies of
// vaporization at the boiling point (NIST WebBook): HCl 16.2, acetone 29.1 kJ/mol. Dichloromethane 1.6 D (unit 6).
// Notation: German uses EN, Partialladung, Dipolmoment and "Dipol-Dipol-Kräfte".
export const BANK_U9: Item[] = [
  // ---------- u9.dipole ----------
  { id: 'i9b', unit: 9, kind: 'choice', format: 'predict', withConfidence: true, concepts: ['u9.dipole'],
    prompt: b('In liquid hydrogen chloride, H is δ+ and Cl is δ−. How do neighbouring {{HCl}} molecules tend to sit?', 'In flüssigem Chlorwasserstoff ist H δ+ und Cl δ−. Wie liegen benachbarte {{HCl}}-Moleküle bevorzugt?'),
    options: [
      { text: b('H of one next to H of the next', 'H des einen neben H des nächsten') },
      { text: b('H of one next to Cl of the next', 'H des einen neben Cl des nächsten'), correct: true },
      { text: b('Cl of one next to Cl of the next', 'Cl des einen neben Cl des nächsten') },
      { text: b('Any way at all: the ends make no difference', 'Ganz beliebig: Die Enden spielen keine Rolle') },
    ],
    explain: b('Opposite partial charges attract: the δ+ hydrogen end of one molecule settles next to the δ− chlorine end of a neighbour. Heat keeps jostling them, so the line-up is a preference, not a fixed pattern.', 'Entgegengesetzte Partialladungen ziehen sich an: Das δ+-Wasserstoff-Ende des einen Moleküls legt sich neben das δ−-Chlor-Ende eines Nachbarn. Die Wärmebewegung bringt sie immer wieder durcheinander; die Ausrichtung ist eine Vorliebe, kein festes Muster.') },
  { id: 'i9c', unit: 9, kind: 'choice', format: 'why', evidence: 'explain', withConfidence: true, concepts: ['u9.dipole'], targets: ['hbond-donor-acceptor', 'boiling-breaks-bonds'],
    prompt: b('Acetone and butane have the same molar mass (58 g/mol), but acetone molecules hold on to each other more strongly. Why?', 'Aceton und Butan haben dieselbe molare Masse (58 g/mol), aber Aceton-Moleküle halten stärker zusammen. Warum?'),
    options: [
      { text: b('Acetone molecules form hydrogen bonds with each other', 'Aceton-Moleküle bilden untereinander Wasserstoffbrücken'), mis: 'hbond-donor-acceptor' },
      { text: b('Their C=O bonds link neighbouring molecules together', 'Ihre C=O-Bindungen verknüpfen benachbarte Moleküle'), mis: 'boiling-breaks-bonds' },
      { text: b('Acetone\'s permanent δ− and δ+ ends attract those of its neighbours', 'Die dauerhaften δ−- und δ+-Enden des Acetons ziehen die der Nachbarn an'), correct: true },
      { text: b('Acetone has more electrons, so stronger dispersion', 'Aceton hat mehr Elektronen, also stärkere Dispersionskräfte') },
    ],
    explain: b('Acetone\'s C=O makes it polar (2.88 D), and neighbours attract end to end on top of their dispersion. It has no H on oxygen, so no hydrogen bonds among its own molecules, and the C=O bond stays inside each molecule. Acetone even has two electrons fewer than butane (32 against 34).', 'Durch das C=O ist Aceton polar (2,88 D), und Nachbarn ziehen sich an den Enden an, zusätzlich zu den Dispersionskräften. Ein H am Sauerstoff hat es nicht, also keine Wasserstoffbrücken untereinander, und die C=O-Bindung bleibt innerhalb des Moleküls. Aceton hat sogar zwei Elektronen weniger als Butan (32 gegenüber 34).') },
  { id: 'i9d', unit: 9, kind: 'choice', format: 'predict', evidence: 'transfer', withConfidence: true, concepts: ['u9.dipole'],
    prompt: b('Two polar molecules drift towards each other with their δ+ ends facing. What happens next, most likely?', 'Zwei polare Moleküle treiben aufeinander zu, die δ+-Enden einander zugewandt. Was passiert dann am wahrscheinlichsten?'),
    options: [
      { text: b('They push apart a little and turn until δ+ faces δ−', 'Sie stoßen sich etwas ab und drehen sich, bis δ+ zu δ− zeigt'), correct: true },
      { text: b('They attract just as strongly as δ+ next to δ−', 'Sie ziehen sich genauso stark an wie δ+ neben δ−') },
      { text: b('They form a covalent bond between the two δ+ atoms', 'Sie bilden eine Atombindung zwischen den zwei δ+-Atomen') },
      { text: b('Nothing: partial charges have no effect on neighbours', 'Nichts: Partialladungen wirken nicht auf Nachbarn') },
    ],
    explain: b('Like partial charges repel and opposite ones attract. The molecules turn until a δ+ end sits next to a δ− end; that arrangement is lower in energy, and it is the one that dominates in a liquid.', 'Gleiche Partialladungen stoßen sich ab, entgegengesetzte ziehen sich an. Die Moleküle drehen sich, bis ein δ+-Ende neben einem δ−-Ende liegt; diese Anordnung ist energieärmer und überwiegt in einer Flüssigkeit.') },

  // ---------- u9.polar-needed ----------
  { id: 'i9e', unit: 9, kind: 'choice', format: 'predict', withConfidence: true, concepts: ['u9.polar-needed'], targets: ['polar-bonds-polar-molecule'],
    prompt: b('Which of these molecules attract each other through dipole–dipole forces?', 'Welche dieser Moleküle ziehen sich durch Dipol-Dipol-Kräfte an?'),
    options: [
      { text: b('{{CO2}}: its C=O bonds are polar', '{{CO2}}: Seine C=O-Bindungen sind polar'), mis: 'polar-bonds-polar-molecule' },
      { text: b('{{CH4}}, methane', '{{CH4}}, Methan') },
      { text: b('{{HCl}}, hydrogen chloride', '{{HCl}}, Chlorwasserstoff'), correct: true },
      { text: b('{{F2}}, fluorine', '{{F2}}, Fluor') },
    ],
    explain: b('Only HCl has an overall dipole (1.11 D). CO₂\'s two polar bonds point in opposite directions and cancel; CH₄ is symmetric with barely polar bonds; F₂ shares its pair equally.', 'Nur HCl hat einen Gesamtdipol (1,11 D). Die zwei polaren Bindungen von CO₂ zeigen in entgegengesetzte Richtungen und heben sich auf; CH₄ ist symmetrisch mit kaum polaren Bindungen; F₂ teilt sein Paar gleichmäßig.') },
  { id: 'i9f', unit: 9, kind: 'choice', format: 'why', evidence: 'explain', withConfidence: true, concepts: ['u9.polar-needed'], targets: ['polar-bonds-polar-molecule'],
    prompt: b('CO₂ has two polar C=O bonds, yet there are no dipole–dipole forces between its molecules. Why?', 'CO₂ hat zwei polare C=O-Bindungen, trotzdem wirken zwischen seinen Molekülen keine Dipol-Dipol-Kräfte. Warum?'),
    options: [
      { text: b('There are some; dispersion just hides them', 'Es gibt welche; die Dispersionskräfte verdecken sie nur'), mis: 'polar-bonds-polar-molecule' },
      { text: b('Its two bond dipoles point in opposite directions and cancel', 'Seine zwei Bindungsdipole zeigen in entgegengesetzte Richtungen und heben sich auf'), correct: true },
      { text: b('Carbon and oxygen pull equally hard on the shared pairs', 'Kohlenstoff und Sauerstoff ziehen gleich stark an den gemeinsamen Paaren') },
      { text: b('Gases never have forces between their molecules', 'Gase haben nie Kräfte zwischen ihren Molekülen') },
    ],
    explain: b('Each C=O bond is polar (3.44 against 2.55), but the molecule is straight, so the two pulls cancel and CO₂ has no ends that stay δ+ or δ−. Mainly dispersion is left: dry ice turns straight to gas at −78.5 °C.', 'Jede C=O-Bindung ist polar (EN 3,44 gegenüber 2,55), aber das Molekül ist linear, also heben sich die beiden Bindungsdipole auf, und CO₂ hat keine dauerhaften δ+- oder δ−-Enden. Übrig bleiben vor allem Dispersionskräfte: Trockeneis sublimiert bei −78,5 °C, wird also direkt gasförmig.') },
  { id: 'i9g', unit: 9, kind: 'choice', format: 'predict', evidence: 'transfer', withConfidence: true, concepts: ['u9.polar-needed'], targets: ['polar-bonds-polar-molecule'],
    prompt: b('Tetrachloromethane, {{CCl4}}, is a tetrahedron with four polar C–Cl bonds. Dichloromethane, {{CH2Cl2}}, has two C–Cl and two C–H bonds and a dipole of 1.6 D (unit 6). Which has dipole–dipole forces between its molecules?', 'Tetrachlormethan, {{CCl4}}, ist ein Tetraeder mit vier polaren C–Cl-Bindungen. Dichlormethan, {{CH2Cl2}}, hat zwei C–Cl- und zwei C–H-Bindungen und ein Dipolmoment von 1,6 D (Einheit 6). Welcher Stoff hat Dipol-Dipol-Kräfte zwischen seinen Molekülen?'),
    options: [
      { text: b('Both: each has polar C–Cl bonds', 'Beide: Jeder hat polare C–Cl-Bindungen'), mis: 'polar-bonds-polar-molecule' },
      { text: b('Only {{CCl4}}: it has more polar bonds', 'Nur {{CCl4}}: Es hat mehr polare Bindungen'), mis: 'polar-bonds-polar-molecule' },
      { text: b('Only {{CH2Cl2}}: its bond dipoles do not cancel', 'Nur {{CH2Cl2}}: Seine Bindungsdipole heben sich nicht auf'), correct: true },
      { text: b('Neither: molecules with carbon are never polar', 'Keiner: Moleküle mit Kohlenstoff sind nie polar') },
    ],
    explain: b('In CCl₄ four equal pulls point to the corners of a tetrahedron and cancel: no dipole, only dispersion. In CH₂Cl₂ they are unequal, so the molecule keeps a δ− chlorine side and a δ+ hydrogen side, and its neighbours attract end to end.', 'In CCl₄ zeigen vier gleiche Bindungsdipole in die Ecken eines Tetraeders und heben sich auf: kein Dipol, nur Dispersionskräfte. In CH₂Cl₂ sind sie ungleich, also behält das Molekül eine δ−-Chlorseite und eine δ+-Wasserstoffseite, und seine Nachbarn ziehen sich an den Enden an.') },
  { id: 'i9u', unit: 9, kind: 'choice', format: 'odd', concepts: ['u9.polar-needed'], targets: ['polar-bonds-polar-molecule'],
    prompt: b('Odd one out: which has no dipole–dipole forces between its molecules?', 'Welcher fällt aus der Reihe: Bei welchem wirken zwischen den Molekülen keine Dipol-Dipol-Kräfte?'),
    options: [
      { text: b('{{HCl}}', '{{HCl}}') },
      { text: b('acetone, {{CH3COCH3}}', 'Aceton, {{CH3COCH3}}') },
      { text: b('{{CO2}}', '{{CO2}}'), correct: true },
      { text: b('acetaldehyde, {{CH3CHO}}', 'Acetaldehyd, {{CH3CHO}}') },
    ],
    explain: b('CO₂: its two bond dipoles cancel. HCl (1.11 D), acetone (2.88 D) and acetaldehyde (2.75 D) are polar molecules, so they have dipole–dipole forces as well as dispersion.', 'CO₂: Seine zwei Bindungsdipole heben sich auf. HCl (1,11 D), Aceton (2,88 D) und Acetaldehyd (2,75 D) sind polare Moleküle und haben deshalb Dipol-Dipol-Kräfte zusätzlich zu den Dispersionskräften.') },

  // ---------- u9.fair-compare ----------
  { id: 'i9a', unit: 9, kind: 'choice', format: 'why', evidence: 'explain', withConfidence: true, concepts: ['u9.fair-compare'], targets: ['hbond-donor-acceptor', 'boiling-breaks-bonds'],
    prompt: b('Propane and acetaldehyde have the same molar mass, 44 g/mol. Propane boils at −42 °C, acetaldehyde at 20 °C. Mainly because of…', 'Propan und Acetaldehyd haben dieselbe molare Masse (44 g/mol). Propan siedet bei −42 °C, Acetaldehyd bei 20 °C. Vor allem wegen…'),
    options: [
      { text: b('dipole–dipole attraction between acetaldehyde molecules', 'Dipol-Dipol-Anziehung zwischen Acetaldehyd-Molekülen'), correct: true },
      { text: b('hydrogen bonds between acetaldehyde molecules', 'Wasserstoffbrücken zwischen Acetaldehyd-Molekülen'), mis: 'hbond-donor-acceptor' },
      { text: b('stronger dispersion in acetaldehyde', 'stärkerer Dispersionskräfte beim Acetaldehyd') },
      { text: b('the C=O bond, which has to break when it boils', 'der C=O-Bindung, die beim Sieden brechen muss'), mis: 'boiling-breaks-bonds' },
    ],
    explain: b('Same molar mass and similar electrons (24 against 26), so similar dispersion. Acetaldehyde\'s C=O makes it polar (2.75 D), and that adds a dipole–dipole pull. It has no H on oxygen, so it cannot donate a [[h-bond]], and boiling leaves its C=O intact.', 'Gleiche molare Masse und ähnlich viele Elektronen (24 gegenüber 26), also ähnliche Dispersionskräfte. Durch das C=O ist Acetaldehyd polar (2,75 D), und das bringt eine Dipol-Dipol-Anziehung dazu. Ein H am Sauerstoff hat er nicht, kann also keine [[h-bond]] bilden, und beim Sieden bleibt sein C=O intakt.') },
  { id: 'i9i', unit: 9, kind: 'choice', format: 'predict', withConfidence: true, concepts: ['u9.fair-compare'], targets: ['one-force-only'],
    prompt: b('Butane and acetone both have a molar mass of 58 g/mol; butane has 34 electrons, acetone 32 and a dipole of 2.88 D. At room temperature, 20 °C…', 'Butan und Aceton haben beide eine molare Masse von 58 g/mol; Butan hat 34 Elektronen, Aceton 32 und ein Dipolmoment von 2,88 D. Bei Raumtemperatur, 20 °C, …'),
    options: [
      { text: b('both are gases', 'sind beide gasförmig') },
      { text: b('both are liquids', 'sind beide flüssig') },
      { text: b('butane is a gas, acetone a liquid', 'ist Butan gasförmig, Aceton flüssig'), correct: true },
      { text: b('butane is a liquid, acetone a gas: it has more electrons', 'ist Butan flüssig, Aceton gasförmig: Es hat mehr Elektronen'), mis: 'one-force-only' },
    ],
    explain: b('Butane boils at −0.5 °C, acetone at 56 °C. Their dispersion is similar; acetone\'s dipole adds a pull on top, which keeps it liquid at room temperature.', 'Butan siedet bei −0,5 °C, Aceton bei 56 °C. Ihre Dispersionskräfte sind ähnlich stark; der Dipol des Acetons bringt eine zusätzliche Anziehung, die es bei Raumtemperatur flüssig hält.') },
  { id: 'i9j', unit: 9, kind: 'rank', format: 'rank', evidence: 'transfer', concepts: ['u9.fair-compare'],
    prompt: b('Three molecules of similar size: propane (26 electrons, 0.08 D), dimethyl ether (26 electrons, 1.30 D), acetaldehyde (24 electrons, 2.75 D). None has an H on oxygen. Rank by boiling point, highest first.', 'Drei Moleküle ähnlicher Größe: Propan (26 Elektronen, 0,08 D), Dimethylether (26 Elektronen, 1,30 D), Acetaldehyd (24 Elektronen, 2,75 D). Keines hat ein H am Sauerstoff. Ordne nach Siedetemperatur, die höchste zuerst.'),
    order: [b('acetaldehyde', 'Acetaldehyd'), b('dimethyl ether', 'Dimethylether'), b('propane', 'Propan')],
    explain: b('20 °C, −25 °C, −42 °C. With dispersion about equal, the bigger the dipole, the higher the boiling point: a fair comparison lets the dipole show.', '20 °C, −25 °C, −42 °C. Bei etwa gleich starken Dispersionskräften gilt: je größer der Dipol, desto höher die Siedetemperatur. Ein fairer Vergleich lässt den Dipol sichtbar werden.') },

  // ---------- u9.dispersion-wins ----------
  { id: 'i9k', unit: 9, kind: 'choice', format: 'predict', withConfidence: true, concepts: ['u9.dispersion-wins'], targets: ['dipole-always-wins'],
    prompt: b('{{HCl}}: dipole 1.11 D, 18 electrons. {{HI}}: dipole 0.45 D, 54 electrons. Which boils higher?', '{{HCl}}: Dipolmoment 1,11 D, 18 Elektronen. {{HI}}: Dipolmoment 0,45 D, 54 Elektronen. Welches siedet höher?'),
    options: [
      { text: b('HCl: the bigger dipole wins', 'HCl: Der größere Dipol gewinnt'), mis: 'dipole-always-wins' },
      { text: b('HI: its many more electrons give much more dispersion', 'HI: Seine viel zahlreicheren Elektronen ergeben viel stärkere Dispersionskräfte'), correct: true },
      { text: b('Both the same: the two effects cancel', 'Beide gleich: Die zwei Effekte heben sich auf') },
    ],
    explain: b('HI boils at −35 °C, HCl at −85 °C. The forces add up, and tripling the electrons adds far more dispersion than the smaller dipole takes away.', 'HI siedet bei −35 °C, HCl bei −85 °C. Die Kräfte addieren sich, und dreimal so viele Elektronen verstärken die Dispersionskräfte weit mehr, als der kleinere Dipol wegnimmt.') },
  { id: 'i9l', unit: 9, kind: 'choice', format: 'why', evidence: 'explain', withConfidence: true, concepts: ['u9.dispersion-wins'], targets: ['hbond-donor-acceptor', 'boiling-breaks-bonds'],
    prompt: b('HI\'s dipole is less than half of HCl\'s, yet HI boils 50 degrees higher. Why?', 'Der Dipol von HI ist weniger als halb so groß wie der von HCl, trotzdem siedet HI 50 K höher. Warum?'),
    options: [
      { text: b('HI forms hydrogen bonds; HCl does not', 'HI bildet Wasserstoffbrücken, HCl nicht'), mis: 'hbond-donor-acceptor' },
      { text: b('Its H–I bond is weaker and must break as it boils', 'Seine H–I-Bindung ist schwächer und muss beim Sieden brechen'), mis: 'boiling-breaks-bonds' },
      { text: b('Three times the electrons give HI far more dispersion', 'Dreimal so viele Elektronen geben HI weit stärkere Dispersionskräfte'), correct: true },
      { text: b('Its smaller dipole lets the molecules pack closer', 'Sein kleinerer Dipol lässt die Moleküle dichter liegen') },
    ],
    explain: b('Dispersion grows with the number of electrons: 54 in HI against 18 in HCl. That gain outweighs the smaller dipole. Neither molecule has an H on N, O or F, so neither forms hydrogen bonds, and boiling leaves both bonds intact.', 'Dispersionskräfte wachsen mit der Zahl der Elektronen: 54 in HI gegenüber 18 in HCl. Dieser Zuwachs wiegt den kleineren Dipol mehr als auf. Keines der Moleküle hat ein H an N, O oder F, also bildet keines Wasserstoffbrücken, und beim Sieden bleiben beide Bindungen intakt.') },
  { id: 'i9m', unit: 9, kind: 'choice', format: 'predict', evidence: 'transfer', withConfidence: true, concepts: ['u9.dispersion-wins'], targets: ['dipole-always-wins'],
    prompt: b('Acetone: dipole 2.88 D, 32 electrons, boils at 56 °C. Octane, {{C8H18}}, from petrol: no dipole, 66 electrons along a chain. Octane boils…', 'Aceton: Dipolmoment 2,88 D, 32 Elektronen, siedet bei 56 °C. Octan, {{C8H18}}, aus Benzin: kein Dipol, 66 Elektronen entlang einer Kette. Octan siedet…'),
    options: [
      { text: b('lower than acetone: it has no dipole to hold it', 'tiefer als Aceton: Es hat keinen Dipol, der es hält'), mis: 'dipole-always-wins' },
      { text: b('at about the same temperature', 'bei etwa derselben Temperatur') },
      { text: b('much higher, at about 126 °C', 'viel höher, bei etwa 126 °C'), correct: true },
    ],
    explain: b('Octane boils at 126 °C, 70 degrees above acetone. Its 66 electrons on a long chain give it far more dispersion than acetone has, dipole included.', 'Octan siedet bei 126 °C, 70 K über Aceton. Seine 66 Elektronen entlang einer langen Kette ergeben weit stärkere Dispersionskräfte als die gesamte Anziehung im Aceton, Dipol eingeschlossen.') },
  { id: 'i9v', unit: 9, kind: 'rank', format: 'rank', concepts: ['u9.dispersion-wins'], mis: 'dipole-always-wins', targets: ['dipole-always-wins'],
    prompt: b('Rank by boiling point, highest first. Dipoles: HCl 1.11 D, HBr 0.83 D, HI 0.45 D.', 'Ordne nach Siedetemperatur, die höchste zuerst. Dipolmomente: HCl 1,11 D, HBr 0,83 D, HI 0,45 D.'),
    order: [b('{{HI}}', '{{HI}}'), b('{{HBr}}', '{{HBr}}'), b('{{HCl}}', '{{HCl}}')],
    explain: b('−35 °C, −67 °C, −85 °C: the reverse of the dipoles. Down group 17 the electrons rise from 18 to 36 to 54, and the growing dispersion outweighs the shrinking dipole.', '−35 °C, −67 °C, −85 °C: genau umgekehrt wie die Dipole. In Gruppe 17 (VII. Hauptgruppe) steigt die Elektronenzahl von 18 über 36 auf 54, und die wachsenden Dispersionskräfte wiegen den schrumpfenden Dipol mehr als auf.') },

  // ---------- u9.scale ----------
  { id: 'i9n', unit: 9, kind: 'choice', format: 'predict', withConfidence: true, concepts: ['u9.scale'], targets: ['boiling-breaks-bonds', 'polar-means-ions'],
    prompt: b('Liquid hydrogen chloride boils at −85 °C. What is in the gas that forms?', 'Flüssiger Chlorwasserstoff siedet bei −85 °C. Was befindet sich im entstehenden Gas?'),
    options: [
      { text: b('separate H and Cl atoms', 'einzelne H- und Cl-Atome'), mis: 'boiling-breaks-bonds' },
      { text: b('whole {{HCl}} molecules', 'ganze {{HCl}}-Moleküle'), correct: true },
      { text: b('H⁺ and Cl⁻ ions', 'H⁺- und Cl⁻-Ionen'), mis: 'polar-means-ions' },
      { text: b('{{H2}} and {{Cl2}} molecules', '{{H2}}- und {{Cl2}}-Moleküle'), mis: 'boiling-breaks-bonds' },
    ],
    explain: b('Boiling only pulls whole molecules away from each other. Evaporating a mole of HCl takes about 16 kJ; breaking its H–Cl bonds would take 432 kJ.', 'Beim Sieden lösen sich nur ganze Moleküle voneinander. Ein Mol HCl zu verdampfen, kostet etwa 16 kJ; seine H–Cl-Bindungen zu spalten, kostete 432 kJ.') },
  { id: 'i9o', unit: 9, kind: 'choice', format: 'why', evidence: 'explain', withConfidence: true, concepts: ['u9.scale'], targets: ['boiling-breaks-bonds'],
    prompt: b('Evaporating one mole of liquid HCl takes about 16 kJ. Breaking one mole of H–Cl bonds takes 432 kJ. Why so different?', 'Ein Mol flüssiges HCl zu verdampfen, kostet etwa 16 kJ. Ein Mol H–Cl-Bindungen zu spalten, kostet 432 kJ. Warum so verschieden?'),
    options: [
      { text: b('Boiling breaks only a few of the H–Cl bonds', 'Beim Sieden bricht nur ein kleiner Teil der H–Cl-Bindungen'), mis: 'boiling-breaks-bonds' },
      { text: b('Boiling separates molecules; the forces between them are far weaker than bonds', 'Sieden trennt Moleküle; die Kräfte zwischen ihnen sind viel schwächer als Bindungen'), correct: true },
      { text: b('Heat breaks bonds far more easily than a reaction does', 'Wärme spaltet Bindungen viel leichter als eine Reaktion'), mis: 'boiling-breaks-bonds' },
      { text: b('The 432 kJ is for gas-phase HCl, the 16 kJ for the liquid', 'Die 432 kJ gelten für gasförmiges HCl, die 16 kJ für flüssiges') },
    ],
    explain: b('The two numbers measure different things. 16 kJ overcomes the attractions between molecules (dispersion plus dipole–dipole); 432 kJ would split each molecule into atoms. Forces between molecules are more than 25 times weaker.', 'Die zwei Zahlen messen Verschiedenes. 16 kJ überwinden die Anziehungen zwischen den Molekülen (Dispersions- plus Dipol-Dipol-Kräfte); 432 kJ würden jedes Molekül in Atome spalten. Kräfte zwischen Molekülen sind mehr als 25-mal schwächer.') },
  { id: 'i9p', unit: 9, kind: 'choice', format: 'predict', evidence: 'transfer', withConfidence: true, concepts: ['u9.scale'], targets: ['boiling-breaks-bonds'],
    prompt: b('Water boils in a pan at 100 °C. Its O–H bonds would take 464 kJ/mol to break. The bubbles rising from the bottom are…', 'Wasser kocht im Topf bei 100 °C. Seine O–H-Bindungen zu spalten, kostete 464 kJ/mol. Die Blasen, die vom Boden aufsteigen, sind…'),
    options: [
      { text: b('hydrogen and oxygen gas', 'Wasserstoff und Sauerstoff'), mis: 'boiling-breaks-bonds' },
      { text: b('air that was dissolved in the water', 'Luft, die im Wasser gelöst war') },
      { text: b('water vapour: whole water molecules', 'Wasserdampf: ganze Wassermoleküle'), correct: true },
    ],
    explain: b('Boiling separates whole water molecules from each other; the O–H bonds inside them stay intact. (A few small bubbles early on are dissolved air, but the rolling boil is steam.)', 'Beim Sieden lösen sich ganze Wassermoleküle voneinander; die O–H-Bindungen in ihnen bleiben intakt. (Ein paar kleine Bläschen zu Beginn sind gelöste Luft, aber die großen Blasen beim Kochen sind Wasserdampf.)') },

  // ---------- u9.add-up ----------
  { id: 'i9r', unit: 9, kind: 'choice', format: 'predict', withConfidence: true, concepts: ['u9.add-up'], targets: ['one-force-only'],
    prompt: b('Which forces act between acetone molecules in the liquid?', 'Welche Kräfte wirken zwischen Aceton-Molekülen in der Flüssigkeit?'),
    options: [
      { text: b('Only dipole–dipole forces: acetone is polar', 'Nur Dipol-Dipol-Kräfte: Aceton ist polar'), mis: 'one-force-only' },
      { text: b('Only dispersion: dipoles cancel out in a liquid', 'Nur Dispersionskräfte: In einer Flüssigkeit heben sich Dipole auf'), mis: 'one-force-only' },
      { text: b('Dispersion and dipole–dipole forces, adding up', 'Dispersions- und Dipol-Dipol-Kräfte, die sich addieren'), correct: true },
      { text: b('Covalent bonds between neighbouring molecules', 'Atombindungen zwischen benachbarten Molekülen') },
    ],
    explain: b('Every molecule has electrons, so every molecule feels dispersion. A polar molecule like acetone feels dipole–dipole forces on top. The two add up to the total pull that its boiling point reflects.', 'Jedes Molekül hat Elektronen, also spürt jedes Molekül Dispersionskräfte. Ein polares Molekül wie Aceton spürt zusätzlich Dipol-Dipol-Kräfte. Beide addieren sich zur gesamten Anziehung, die seine Siedetemperatur widerspiegelt.') },
  { id: 'i9s', unit: 9, kind: 'choice', format: 'why', evidence: 'explain', withConfidence: true, concepts: ['u9.add-up'], targets: ['one-force-only'],
    prompt: b('Acetone has a strong permanent dipole. Why does it still have dispersion forces as well?', 'Aceton hat einen starken permanenten Dipol. Warum hat es trotzdem auch Dispersionskräfte?'),
    options: [
      { text: b('It doesn\'t: polar molecules have dipole forces instead', 'Hat es nicht: Polare Moleküle haben stattdessen Dipol-Kräfte'), mis: 'one-force-only' },
      { text: b('Its electron clouds still flicker, as in every molecule', 'Seine Elektronenwolken flackern trotzdem, wie in jedem Molekül'), correct: true },
      { text: b('Dispersion appears only once it starts to boil', 'Dispersionskräfte treten erst auf, wenn es zu sieden beginnt') },
      { text: b('Its dipole switches off at room temperature', 'Sein Dipol schaltet sich bei Raumtemperatur ab') },
    ],
    explain: b('Dispersion comes from moving electrons, which every molecule has (unit 8). A permanent dipole is extra, not a replacement: in acetone both act at once.', 'Dispersionskräfte kommen von bewegten Elektronen, und die hat jedes Molekül (Einheit 8). Ein permanenter Dipol kommt dazu, er ersetzt nichts: Im Aceton wirkt beides zugleich.') },
  { id: 'i9t', unit: 9, kind: 'choice', format: 'predict', evidence: 'transfer', withConfidence: true, concepts: ['u9.add-up'], targets: ['one-force-only', 'hbond-donor-acceptor'],
    prompt: b('Hydrogen bromide, {{HBr}}, is polar (0.83 D) and has 36 electrons. Which forces hold liquid HBr together?', 'Bromwasserstoff, {{HBr}}, ist polar (0,83 D) und hat 36 Elektronen. Welche Kräfte halten flüssiges HBr zusammen?'),
    options: [
      { text: b('Dipole–dipole forces only', 'Nur Dipol-Dipol-Kräfte'), mis: 'one-force-only' },
      { text: b('Dispersion and dipole–dipole forces', 'Dispersions- und Dipol-Dipol-Kräfte'), correct: true },
      { text: b('Hydrogen bonds, because it has H on a halogen', 'Wasserstoffbrücken, weil H an einem Halogen sitzt'), mis: 'hbond-donor-acceptor' },
      { text: b('Dispersion only: its dipole is too small to count', 'Nur Dispersionskräfte: Sein Dipol ist zu klein, um mitzuzählen'), mis: 'one-force-only' },
    ],
    explain: b('Both act and add up: dispersion from its 36 electrons, and a smaller dipole–dipole share. Hydrogen bonds in the school sense need an H on N, O or F; between HBr molecules the acceptor would be bromine, a large atom whose lone pairs are spread out, so at most very weak ones form (unit 10).', 'Beides wirkt und addiert sich: Dispersionskräfte aus seinen 36 Elektronen und ein kleinerer Anteil Dipol-Dipol-Kräfte. Wasserstoffbrücken im Sinne des Schulbuchs brauchen ein H an N, O oder F; zwischen HBr-Molekülen wäre Brom der Akzeptor, ein großes Atom mit weit verteilten freien Elektronenpaaren, deshalb entstehen höchstens sehr schwache (Einheit 10).') },
];
