import type { Bi } from '../../i18n';
import type { Item } from '../items';

const b = (en: string, de: string): Bi => ({ en, de });

// Unit 11 question bank: three variants per concept (predict, why, transfer), every trap option tagged.
// Data: src/content/substances.ts (solubilities in g per 100 g water at about 20 °C: methanol, ethanol mix in any
// ratio, 1-butanol 7.7, 1-hexanol 0.59, hexane 0.001; boiling points H₂O 100 °C, H₂S −60 °C; WATER: ice 0.917,
// liquid 0.9998 at 0 °C and 1.0000 at 4 °C). Seawater about 1.025 g/cm³; sucrose: about 200 g per 100 g water at
// 20 °C, melts (and decomposes) at about 186 °C; NaCl melts at 801 °C (ions.ts) (CRC Handbook).
// Hydration shells: O (δ−) towards cations, H (δ+) towards anions (OpenStax Biology 2e, 2.2). Salt water (NaCl)
// stays liquid down to its eutectic, about −21 °C (CRC Handbook). The hydrophobic effect at room temperature is
// mostly entropic: water around a nonpolar molecule keeps its hydrogen bonds by forming an ordered cage. NaCl dissolving takes
// in +3.9 kJ/mol (CRC Handbook); its ions spreading out (entropy) outweighs that.
export const BANK_U11: Item[] = [
  // ---------- u11.network ----------
  { id: 'i11a', unit: 11, kind: 'choice', format: 'predict', withConfidence: true, concepts: ['u11.network'], targets: ['hbond-donor-acceptor'],
    prompt: b('A water molecule has two H atoms and two lone pairs on its oxygen. In how many [[h-bond|hydrogen bonds]] can one water molecule take part at most?', 'Ein Wassermolekül hat zwei H-Atome und zwei freie Elektronenpaare am Sauerstoff. An wie vielen [[h-bond|Wasserstoffbrücken]] kann ein Wassermolekül höchstens beteiligt sein?'),
    options: [
      { text: b('Two, one for each H atom', 'Zwei, eine pro H-Atom'), mis: 'hbond-donor-acceptor' },
      { text: b('Three', 'Drei') },
      { text: b('Four: two through its H atoms, two through its lone pairs', 'Vier: zwei über seine H-Atome, zwei über seine freien Elektronenpaare'), correct: true },
      { text: b('Six', 'Sechs') },
    ],
    explain: b('Each H atom can bond to a lone pair on a neighbour, and each of its own two lone pairs can hold a neighbour\'s H: 2 + 2 = 4. In ice every molecule takes part in all four; since each bond joins two molecules, that makes two bonds for every molecule.', 'Jedes H-Atom kann eine Wasserstoffbrücke zu einem freien Elektronenpaar eines Nachbarn bilden, und jedes seiner zwei eigenen freien Elektronenpaare kann ein H eines Nachbarn halten: 2 + 2 = 4. Im Eis ist jedes Molekül an allen vier beteiligt; da jede Brücke zwei Moleküle verbindet, kommen zwei Brücken auf jedes Molekül.') },
  { id: 'i11b', unit: 11, kind: 'choice', format: 'why', evidence: 'explain', withConfidence: true, concepts: ['u11.network'],
    prompt: b('Water (18 g/mol) boils at 100 °C. Hydrogen sulfide, {{H2S}} (34 g/mol), boils at −60 °C, although its molecules are heavier. Which explanation fits best?', 'Wasser (18 g/mol) siedet bei 100 °C. Schwefelwasserstoff, {{H2S}} (34 g/mol), siedet bei −60 °C, obwohl seine Moleküle schwerer sind. Welche Erklärung passt am besten?'),
    options: [
      { text: b('Boiling breaks the O–H bonds in water, which are stronger than S–H bonds', 'Beim Sieden brechen die O–H-Bindungen im Wasser, und die sind stärker als S–H-Bindungen') },
      { text: b('Heavier molecules always boil at lower temperatures', 'Schwerere Moleküle sieden immer bei tieferen Temperaturen') },
      { text: b('Hydrogen bonds link water molecules into a network that must be pulled apart to boil', 'Wasserstoffbrücken verknüpfen die Wassermoleküle zu einem Netzwerk, das beim Sieden auseinandergerissen werden muss'), correct: true },
      { text: b('Water molecules are smaller, so they pack more tightly', 'Wassermoleküle sind kleiner und liegen deshalb dichter') },
    ],
    explain: b('Boiling separates whole molecules; the O–H bonds inside them stay intact. Water\'s hydrogen-bond network holds its molecules together far more strongly than the weak attractions between {{H2S}} molecules, which form hardly any hydrogen bonds.', 'Beim Sieden trennen sich ganze Moleküle; die O–H-Bindungen in ihnen bleiben erhalten. Das Netzwerk aus Wasserstoffbrücken hält die Wassermoleküle viel fester zusammen als die schwachen Anziehungen zwischen {{H2S}}-Molekülen, die kaum Wasserstoffbrücken bilden.') },
  { id: 'i11c', unit: 11, kind: 'choice', format: 'predict', evidence: 'transfer', withConfidence: true, concepts: ['u11.network'], targets: ['oil-water-repel'],
    prompt: b('A steel paper clip, laid down gently, can rest on the surface of water, and some insects walk on ponds. What makes the water surface so tough?', 'Eine Büroklammer aus Stahl, vorsichtig aufgelegt, kann auf der Wasseroberfläche liegen bleiben, und manche Insekten laufen über Teiche. Was macht die Wasseroberfläche so fest?'),
    options: [
      { text: b('The steel repels the water, so the clip cannot sink in', 'Der Stahl stößt das Wasser ab, also kann die Klammer nicht einsinken'), mis: 'oil-water-repel' },
      { text: b('Hydrogen bonds pull the surface molecules towards their neighbours, like a stretched skin', 'Wasserstoffbrücken ziehen die Moleküle an der Oberfläche zu ihren Nachbarn, wie eine gespannte Haut'), correct: true },
      { text: b('Air pressure pushes the clip upwards', 'Der Luftdruck drückt die Klammer nach oben') },
      { text: b('A thin layer of ice forms on top of the water', 'Auf dem Wasser bildet sich eine dünne Eisschicht') },
    ],
    explain: b('A molecule at the surface has neighbours only beside and below it, and its hydrogen bonds pull it inwards. The surface behaves like a stretched skin (surface tension) that can carry a light object.', 'Ein Molekül an der Oberfläche hat nur neben und unter sich Nachbarn, und seine Wasserstoffbrücken ziehen es nach innen. Die Oberfläche verhält sich wie eine gespannte Haut (Oberflächenspannung), die einen leichten Gegenstand tragen kann.') },

  // ---------- u11.ice ----------
  { id: 'i11d', unit: 11, kind: 'choice', format: 'predict', withConfidence: true, concepts: ['u11.ice'], targets: ['ice-denser'],
    prompt: b('Ice has a density of 0.917 g/cm³, liquid water about 1.000 g/cm³. How much of a floating ice cube lies below the surface?', 'Eis hat eine Dichte von 0,917 g/cm³, flüssiges Wasser etwa 1,000 g/cm³. Wie viel eines schwimmenden Eiswürfels liegt unter der Oberfläche?'),
    options: [
      { text: b('About 8 %', 'Etwa 8 %') },
      { text: b('About half', 'Etwa die Hälfte') },
      { text: b('None: ice is denser and sinks', 'Nichts: Eis ist dichter und sinkt'), mis: 'ice-denser' },
      { text: b('About 92 %', 'Etwa 92 %'), correct: true },
    ],
    explain: b('A floating object sinks until it pushes aside its own mass of water. Ice needs 0.917 of its volume under water: about 92 %. In seawater (about 1.025 g/cm³) it is about 89 %, which is why only the tip of an iceberg shows.', 'Ein schwimmender Körper sinkt so weit ein, bis er seine eigene Masse an Wasser verdrängt. Eis braucht dafür 0,917 seines Volumens unter Wasser: etwa 92 %. In Meerwasser (etwa 1,025 g/cm³) sind es etwa 89 %; deshalb sieht man nur die Spitze eines Eisbergs.') },
  { id: 'i11e', unit: 11, kind: 'choice', format: 'why', evidence: 'explain', withConfidence: true, concepts: ['u11.ice'],
    prompt: b('Most substances are denser as solids than as liquids. Why is water the exception?', 'Die meisten Stoffe haben im festen Zustand eine größere Dichte als im flüssigen. Warum ist Wasser die Ausnahme?'),
    options: [
      { text: b('Ice is full of trapped air bubbles', 'Eis ist voller eingeschlossener Luftbläschen') },
      { text: b('In ice each molecule holds four neighbours at fixed angles, an open network with gaps', 'Im Eis hält jedes Molekül vier Nachbarn in festen Winkeln, ein offenes Netzwerk mit Lücken'), correct: true },
      { text: b('Cold water molecules are bigger than warm ones', 'Kalte Wassermoleküle sind größer als warme') },
      { text: b('Freezing breaks some O–H bonds, so the atoms spread apart', 'Beim Gefrieren brechen einige O–H-Bindungen, und die Atome rücken auseinander') },
    ],
    explain: b('Hydrogen bonds hold each molecule at fixed angles to four neighbours. That rigid, open arrangement leaves gaps; in the liquid, molecules can slip into some of them, so the liquid is denser. Clear ice without any bubbles floats too.', 'Wasserstoffbrücken halten jedes Molekül in festen Winkeln zu vier Nachbarn. Diese starre, offene Anordnung lässt Lücken; in der Flüssigkeit können Moleküle in einige davon rutschen, deshalb ist die Flüssigkeit dichter. Auch klares Eis ganz ohne Bläschen schwimmt.') },
  { id: 'i11f', unit: 11, kind: 'rank', format: 'rank', evidence: 'transfer', concepts: ['u11.ice'], mis: 'ice-denser', targets: ['ice-denser'],
    prompt: b('Rank by density, densest first: water at 0 °C, ice at 0 °C, water at 4 °C.', 'Ordne nach Dichte, die größte zuerst: Wasser bei 0 °C, Eis bei 0 °C, Wasser bei 4 °C.'),
    order: [b('water at 4 °C', 'Wasser bei 4 °C'), b('water at 0 °C', 'Wasser bei 0 °C'), b('ice at 0 °C', 'Eis bei 0 °C')],
    explain: b('1.0000, 0.9998 and 0.917 g/cm³. Water is densest at 4 °C and expands slightly as it cools further; one common picture is that more and more molecules briefly form open, ice-like patterns. Ice, the fully open network, is far less dense than any liquid water.', '1,0000; 0,9998 und 0,917 g/cm³. Wasser ist bei 4 °C am dichtesten und dehnt sich beim weiteren Abkühlen leicht aus; ein verbreitetes Bild dafür: Immer mehr Moleküle ordnen sich kurzzeitig in offenen, eisähnlichen Mustern an. Eis, das vollständig offene Netzwerk, hat eine viel geringere Dichte als jedes flüssige Wasser.') },

  // ---------- u11.like ----------
  { id: 'i11g', unit: 11, kind: 'choice', format: 'predict', withConfidence: true, concepts: ['u11.like'], targets: ['oh-group-decides'],
    prompt: b('Which of these mixes with water in any ratio?', 'Welcher dieser Stoffe mischt sich in jedem Verhältnis mit Wasser?'),
    options: [
      { text: b('Hexane, {{C6H14}}', 'Hexan, {{C6H14}}') },
      { text: b('Methanol, {{CH3OH}}', 'Methanol, {{CH3OH}}'), correct: true },
      { text: b('1-hexanol, {{C6H13OH}}: it has an O–H group', '1-Hexanol, {{C6H13OH}}: Es hat eine O–H-Gruppe'), mis: 'oh-group-decides' },
      { text: b('Octane, {{C8H18}}', 'Octan, {{C8H18}}') },
    ],
    explain: b('Methanol is almost all O–H group: like water, it is both donor and acceptor of hydrogen bonds, with only one carbon in the way. Hexanol has the same O–H group but a six-carbon chain and dissolves only 0.59 g in 100 g of water. Hexane and octane have no O–H at all.', 'Methanol ist fast nur O–H-Gruppe: Es ist wie Wasser Donor und Akzeptor von Wasserstoffbrücken, mit nur einem Kohlenstoffatom im Weg. Hexanol hat dieselbe O–H-Gruppe, aber eine Kette aus sechs Kohlenstoffatomen, und nur 0,59 g lösen sich in 100 g Wasser. Hexan und Octan haben gar keine O–H-Gruppe.') },
  { id: 'i11h', unit: 11, kind: 'choice', format: 'why', evidence: 'explain', withConfidence: true, concepts: ['u11.like'], targets: ['oil-water-repel'],
    prompt: b('Hexane and water molecules do attract each other a little, through dispersion. Why does hexane still not dissolve in water?', 'Hexan- und Wassermoleküle ziehen sich durchaus ein wenig an, über Dispersionskräfte. Warum löst sich Hexan trotzdem nicht in Wasser?'),
    options: [
      { text: b('Hexane repels water because it is nonpolar', 'Hexan stößt Wasser ab, weil es unpolar ist'), mis: 'oil-water-repel' },
      { text: b('Hexane is less dense, so it floats instead of dissolving', 'Hexan hat eine geringere Dichte, also schwimmt es, statt sich zu lösen') },
      { text: b('Hexane molecules are too large to fit between water molecules', 'Hexanmoleküle sind zu groß, um zwischen Wassermoleküle zu passen') },
      { text: b('Water next to hexane could keep its hydrogen bonds only in an ordered cage, and hexane offers too little in return', 'Wasser neben Hexan könnte seine Wasserstoffbrücken nur in einem geordneten Käfig behalten, und Hexan bietet zu wenig dafür'), correct: true },
    ],
    explain: b('Hexane offers water only weak dispersion forces. To keep their hydrogen bonds, the water molecules next to a hexane molecule would have to line up in an ordered cage around it, and that loss of freedom (entropy, unit 19) makes mixing unfavourable. So the water molecules stay with each other. The low density only decides that the hexane layer ends up on top.', 'Hexan bietet dem Wasser nur schwache Dispersionskräfte. Um ihre Wasserstoffbrücken zu behalten, müssten sich die Wassermoleküle neben einem Hexanmolekül zu einem geordneten Käfig aufreihen; dieser Verlust an Bewegungsfreiheit (Entropie, Einheit 19) macht das Mischen ungünstig. Also bleiben die Wassermoleküle unter sich. Die geringe Dichte entscheidet nur, dass die Hexanschicht oben landet.') },
  { id: 'i11i', unit: 11, kind: 'choice', format: 'predict', evidence: 'transfer', withConfidence: true, concepts: ['u11.like'],
    prompt: b('Iodine, {{I2}}, is made of nonpolar molecules. A few iodine crystals are shaken in a tube with water and hexane, which form two layers. Where does most of the iodine end up?', 'Iod, {{I2}}, besteht aus unpolaren Molekülen. Ein paar Iodkristalle werden in einem Reagenzglas mit Wasser und Hexan geschüttelt, die zwei Schichten bilden. Wo landet das meiste Iod?'),
    options: [
      { text: b('In the water layer below', 'In der Wasserschicht unten') },
      { text: b('In the hexane layer on top', 'In der Hexanschicht oben'), correct: true },
      { text: b('Shared evenly between the layers', 'Gleichmäßig auf beide Schichten verteilt') },
      { text: b('Nowhere: it stays as crystals at the bottom', 'Nirgends: Es bleibt als Kristalle am Boden') },
    ],
    explain: b('Iodine and hexane are both nonpolar and attract each other by dispersion about as well as they attract their own kind: like dissolves like. The hexane layer turns violet, while the water stays pale.', 'Iod und Hexan sind beide unpolar und ziehen einander über Dispersionskräfte etwa so gut an wie ihresgleichen: Ähnliches löst sich in Ähnlichem. Die Hexanschicht färbt sich violett, das Wasser bleibt blass.') },
  { id: 'i11m', unit: 11, kind: 'choice', format: 'why', evidence: 'explain', withConfidence: true, concepts: ['u11.like'], targets: ['dissolving-is-melting'],
    prompt: b('A spoonful of sugar disappears in hot tea. What happens to it?', 'Ein Löffel Zucker verschwindet in heißem Tee. Was passiert mit ihm?'),
    options: [
      { text: b('It melts in the heat of the tea', 'Er schmilzt in der Hitze des Tees'), mis: 'dissolving-is-melting' },
      { text: b('It reacts with the water to form a new substance', 'Er reagiert mit dem Wasser zu einem neuen Stoff') },
      { text: b('Water molecules bond to its O–H groups and carry the molecules off one by one', 'Wassermoleküle binden an seine O–H-Gruppen und tragen die Moleküle einzeln davon'), correct: true },
      { text: b('It breaks down into separate carbon, hydrogen and oxygen atoms', 'Er zerfällt in einzelne Kohlenstoff-, Wasserstoff- und Sauerstoffatome') },
    ],
    explain: b('Sugar melts only at about 186 °C, far above the tea. It dissolves: its many O–H groups form hydrogen bonds with water, and whole sugar molecules leave the crystal, still intact. Heat only speeds this up.', 'Zucker schmilzt erst bei etwa 186 °C, weit über der Temperatur des Tees. Er löst sich: Seine vielen O–H-Gruppen bilden Wasserstoffbrücken mit dem Wasser, und ganze Zuckermoleküle verlassen den Kristall, unverändert. Wärme beschleunigt das nur.') },

  // ---------- u11.hydration ----------
  { id: 'i11j', unit: 11, kind: 'choice', format: 'predict', withConfidence: true, concepts: ['u11.hydration'],
    prompt: b('A potassium ion, {{K+}}, dissolves in water. Which part of the surrounding water molecules faces it?', 'Ein Kalium-Ion, {{K+}}, löst sich in Wasser. Welcher Teil der umgebenden Wassermoleküle zeigt zu ihm?'),
    options: [
      { text: b('The oxygen atoms, the δ− end', 'Die Sauerstoffatome, das δ−-Ende'), correct: true },
      { text: b('The hydrogen atoms, the δ+ end', 'Die Wasserstoffatome, das δ+-Ende') },
      { text: b('Half of each, at random', 'Zufällig mal das eine, mal das andere') },
      { text: b('Neither: water molecules ignore ions', 'Keiner: Wassermoleküle beachten Ionen nicht') },
    ],
    explain: b('Opposite charges attract: the slightly negative oxygen end (δ−) turns towards the positive ion. Around a negative ion such as {{Cl-}}, the water molecules turn their δ+ hydrogen ends inwards instead. Together they form a [[hydration]] shell.', 'Entgegengesetzte Ladungen ziehen sich an: Das leicht negative Sauerstoff-Ende (δ−) dreht sich zum positiven Ion. Um ein negatives Ion wie {{Cl-}} drehen die Wassermoleküle stattdessen ihre δ+-Wasserstoff-Enden nach innen. Zusammen bilden sie eine Hydrathülle ([[hydration]]).') },
  { id: 'i11k', unit: 11, kind: 'choice', format: 'why', evidence: 'explain', withConfidence: true, concepts: ['u11.hydration'], targets: ['dissolving-is-melting', 'salt-molecules-in-water'],
    prompt: b('Table salt melts only at 801 °C, yet it dissolves in water at room temperature. Why?', 'Kochsalz schmilzt erst bei 801 °C, löst sich aber bei Raumtemperatur in Wasser. Warum?'),
    options: [
      { text: b('The water warms the crystal until it melts', 'Das Wasser erwärmt den Kristall, bis er schmilzt'), mis: 'dissolving-is-melting' },
      { text: b('Water splits the salt into NaCl molecules, small enough to dissolve', 'Wasser zerlegt das Salz in NaCl-Moleküle, die klein genug zum Lösen sind'), mis: 'salt-molecules-in-water' },
      { text: b('Water molecules surround each ion; that nearly pays for the lattice, and spreading out does the rest', 'Wassermoleküle umhüllen jedes Ion; das gleicht die Gitterenergie fast aus, die Verteilung erledigt den Rest'), correct: true },
      { text: b('Salt is polar, so it reacts with the water', 'Salz ist polar, also reagiert es mit dem Wasser') },
    ],
    explain: b('Dissolving is not melting: the ions leave the crystal one by one, each wrapped in water molecules turned the right way. The energy from these attractions almost exactly makes up for the lattice energy (787 kJ/mol); the remaining 3.9 kJ/mol is taken as heat from the water, and the ions\' tendency to spread out (entropy, unit 19) outweighs it. There are no NaCl molecules at any point.', 'Lösen ist kein Schmelzen: Die Ionen verlassen den Kristall einzeln, jedes umhüllt von richtig ausgerichteten Wassermolekülen. Die Energie aus diesen Anziehungen gleicht die Gitterenergie (787 kJ/mol) fast genau aus; die fehlenden 3,9 kJ/mol kommen als Wärme aus dem Wasser, und die Neigung der Ionen, sich zu verteilen (Entropie, Einheit 19), überwiegt sie. NaCl-Moleküle entstehen dabei zu keinem Zeitpunkt.') },
  { id: 'i11l', unit: 11, kind: 'choice', format: 'predict', withConfidence: true, concepts: ['u11.hydration'], targets: ['salt-molecules-in-water', 'dissolving-is-melting'],
    prompt: b('Besides water molecules, what does a glass of clear salt water contain?', 'Was enthält ein Glas klare Kochsalzlösung außer Wassermolekülen?'),
    options: [
      { text: b('NaCl molecules spread out between the water molecules', 'NaCl-Moleküle, verteilt zwischen den Wassermolekülen'), mis: 'salt-molecules-in-water' },
      { text: b('Molten salt mixed in with the water', 'Geschmolzenes Salz, mit dem Wasser vermischt'), mis: 'dissolving-is-melting' },
      { text: b('Tiny salt crystals too small to see', 'Winzige Salzkristalle, zu klein zum Sehen') },
      { text: b('Na⁺ and Cl⁻ ions, each wrapped in water molecules', 'Na⁺- und Cl⁻-Ionen, jedes von Wassermolekülen umhüllt'), correct: true },
    ],
    explain: b('Salt was never made of molecules: it is a lattice of ions (unit 4). In water the ions separate and move about on their own, each inside its [[hydration]] shell.', 'Salz bestand nie aus Molekülen: Es ist ein Ionengitter (Einheit 4). Im Wasser trennen sich die Ionen und bewegen sich einzeln, jedes in seiner Hydrathülle ([[hydration]]).') },
  { id: 'i11t', unit: 11, kind: 'choice', format: 'predict', evidence: 'transfer', withConfidence: true, concepts: ['u11.hydration'], targets: ['salt-molecules-in-water'],
    prompt: b('Salt water conducts electricity, sugar water does not (unit 7), though both are clear solutions. What does that tell you about dissolved salt?', 'Salzlösung leitet den elektrischen Strom, Zuckerlösung nicht (Einheit 7), obwohl beide klar sind. Was sagt das über gelöstes Salz?'),
    options: [
      { text: b('It is present as separate ions that can move', 'Es liegt als einzelne, bewegliche Ionen vor'), correct: true },
      { text: b('It is present as NaCl molecules, which carry the charge', 'Es liegt als NaCl-Moleküle vor, die die Ladung tragen'), mis: 'salt-molecules-in-water' },
      { text: b('It gives off free electrons into the water', 'Es gibt freie Elektronen ins Wasser ab') },
      { text: b('Sugar blocks the current, salt does not', 'Zucker blockiert den Strom, Salz nicht') },
    ],
    explain: b('A current needs charged particles that can move. Dissolved sugar stays as whole, neutral molecules; dissolved salt is Na⁺ and Cl⁻ ions, each in its hydration shell, free to drift towards the poles.', 'Strom braucht bewegliche geladene Teilchen. Gelöster Zucker bleibt als ganze, neutrale Moleküle; gelöstes Salz besteht aus Na⁺- und Cl⁻-Ionen, die jeweils von einer Hydrathülle umgeben sind und frei zu den Polen wandern können.') },

  { id: 'i11u', unit: 11, kind: 'choice', format: 'predict', evidence: 'transfer', withConfidence: true, concepts: ['u11.hydration'], targets: ['dissolving-is-melting'],
    prompt: b('A road is iced over at −5 °C, and salt is spread on it. Why does the ice melt?', 'Eine Straße ist bei −5 °C vereist, und es wird Salz gestreut. Warum taut das Eis?'),
    options: [
      { text: b('The salt melts and its heat melts the ice', 'Das Salz schmilzt, und seine Wärme taut das Eis'), mis: 'dissolving-is-melting' },
      { text: b('Salt dissolves in the thin film of water on the ice, and salt water stays liquid well below 0 °C', 'Salz löst sich im dünnen Wasserfilm auf dem Eis, und Salzwasser bleibt weit unter 0 °C flüssig'), correct: true },
      { text: b('The salt grains scratch the ice to pieces', 'Die Salzkörner zerkratzen das Eis') },
      { text: b('Salt reacts with the ice and gives off heat', 'Salz reagiert mit dem Eis und gibt Wärme ab') },
    ],
    explain: b('Even at −5 °C there is a very thin film of liquid water on ice. Salt dissolves in it as hydrated ions, and the ions get in the way of water molecules locking into the ice network, so salt water freezes only at a lower temperature, down to about −21 °C. More ice melts into the brine. Nothing melts the salt, which would take 801 °C.', 'Auch bei −5 °C liegt auf Eis ein sehr dünner Film aus flüssigem Wasser. Darin löst sich das Salz als hydratisierte Ionen, und die Ionen stören die Wassermoleküle dabei, sich ins Eisgitter einzufügen; Salzwasser gefriert deshalb erst bei tieferer Temperatur, bis hinunter zu etwa −21 °C. Weiteres Eis taut in die Salzlösung. Das Salz selbst schmilzt nicht, dafür bräuchte es 801 °C.') },

  // ---------- u11.chain ----------
  { id: 'i11n', unit: 11, kind: 'rank', format: 'rank', concepts: ['u11.chain'], mis: 'oh-group-decides', targets: ['oh-group-decides'],
    prompt: b('Rank by how well they dissolve in water, best first: 1-hexanol, ethanol, hexane, 1-butanol.', 'Ordne danach, wie gut sie sich in Wasser lösen, das beste zuerst: 1-Hexanol, Ethanol, Hexan, 1-Butanol.'),
    order: [b('ethanol', 'Ethanol'), b('1-butanol', '1-Butanol'), b('1-hexanol', '1-Hexanol'), b('hexane', 'Hexan')],
    explain: b('Ethanol mixes in any ratio; 1-butanol 7.7 g, 1-hexanol 0.59 g and hexane 0.001 g in 100 g of water. All three alcohols have one O–H group: the longer the nonpolar chain, the less dissolves.', 'Ethanol mischt sich in jedem Verhältnis; von 1-Butanol lösen sich 7,7 g, von 1-Hexanol 0,59 g und von Hexan 0,001 g in 100 g Wasser. Alle drei Alkohole haben eine O–H-Gruppe: Je länger die unpolare Kette, desto weniger löst sich.') },
  { id: 'i11o', unit: 11, kind: 'choice', format: 'why', evidence: 'explain', withConfidence: true, concepts: ['u11.chain'], targets: ['oh-group-decides', 'oil-water-repel'],
    prompt: b('Ethanol mixes with water in any ratio, but only 0.59 g of 1-hexanol dissolves in 100 g of water. Both have one O–H group. Why the difference?', 'Ethanol mischt sich in jedem Verhältnis mit Wasser, von 1-Hexanol lösen sich aber nur 0,59 g in 100 g Wasser. Beide haben eine O–H-Gruppe. Woher kommt der Unterschied?'),
    options: [
      { text: b('The chain makes no difference; hexanol just dissolves more slowly', 'Die Kette spielt keine Rolle; Hexanol löst sich nur langsamer'), mis: 'oh-group-decides' },
      { text: b('Hexanol\'s long tail repels the water molecules', 'Der lange Schwanz des Hexanols stößt die Wassermoleküle ab'), mis: 'oil-water-repel' },
      { text: b('Its six-carbon chain takes up room in water\'s network but forms no hydrogen bonds', 'Seine Kette aus sechs Kohlenstoffatomen braucht Platz im Netzwerk des Wassers, bildet aber keine Wasserstoffbrücken'), correct: true },
      { text: b('In hexanol the O–H group is no longer polar', 'Im Hexanol ist die O–H-Gruppe nicht mehr polar') },
    ],
    explain: b('One O–H group gives water enough back for a short chain, not for a long one. Around six carbons, water can keep its hydrogen bonds only by lining up in an ordered cage, and the chain offers only weak dispersion forces in return, so water keeps to itself. Nothing repels the chain.', 'Eine Hydroxygruppe gibt dem Wasser genug zurück für eine kurze Kette, aber nicht für eine lange. Um sechs Kohlenstoffatome herum kann das Wasser seine Wasserstoffbrücken nur behalten, wenn es sich zu einem geordneten Käfig aufreiht, und die Kette bietet dafür nur schwache Dispersionskräfte; also bleibt das Wasser unter sich. Nichts stößt die Kette ab.') },
  { id: 'i11p', unit: 11, kind: 'choice', format: 'predict', evidence: 'transfer', withConfidence: true, concepts: ['u11.chain'], targets: ['dissolving-is-melting'],
    prompt: b('Table sugar (sucrose, {{C12H22O11}}) has twelve carbon atoms, twice as many as hexanol, but eight O–H groups. How well does it dissolve in water?', 'Haushaltszucker (Saccharose, {{C12H22O11}}) hat zwölf Kohlenstoffatome, doppelt so viele wie Hexanol, aber acht O–H-Gruppen. Wie gut löst er sich in Wasser?'),
    options: [
      { text: b('Barely, like hexanol: its carbon skeleton is even bigger', 'Kaum, wie Hexanol: Sein Kohlenstoffgerüst ist sogar größer') },
      { text: b('Only in hot water, where it melts', 'Nur in heißem Wasser, wo er schmilzt'), mis: 'dissolving-is-melting' },
      { text: b('Not at all: such large molecules cannot dissolve', 'Gar nicht: So große Moleküle können sich nicht lösen') },
      { text: b('Very well: about 200 g in 100 g of water', 'Sehr gut: etwa 200 g in 100 g Wasser'), correct: true },
    ],
    explain: b('Eight O–H groups spread over the molecule give water plenty of hydrogen bonds in return, so the carbon skeleton does not hold it back. What counts is the balance: how much of the molecule can bond to water, not its size.', 'Acht O–H-Gruppen, über das ganze Molekül verteilt, geben dem Wasser reichlich Wasserstoffbrücken zurück; das Kohlenstoffgerüst hält den Zucker deshalb nicht zurück. Es kommt auf das Verhältnis an: wie viel vom Molekül an Wasser binden kann, nicht auf seine Größe.') },

  // ---------- u11.no-repulsion ----------
  { id: 'i11q', unit: 11, kind: 'choice', format: 'predict', withConfidence: true, concepts: ['u11.no-repulsion'], targets: ['oil-water-repel', 'hbond-donor-acceptor'],
    prompt: b('Do hexane and water molecules attract each other at all?', 'Ziehen sich Hexan- und Wassermoleküle überhaupt an?'),
    options: [
      { text: b('No, they repel each other', 'Nein, sie stoßen sich ab'), mis: 'oil-water-repel' },
      { text: b('Yes, a little, through dispersion', 'Ja, ein wenig, über Dispersionskräfte'), correct: true },
      { text: b('Yes, through hydrogen bonds', 'Ja, über Wasserstoffbrücken'), mis: 'hbond-donor-acceptor' },
      { text: b('No, they do not interact at all', 'Nein, sie wirken überhaupt nicht aufeinander') },
    ],
    explain: b('Dispersion acts between all molecules (unit 8), so hexane and water do attract a little. Hydrogen bonds are out: hexane has no H on N, O or F and no lone pairs. Water simply attracts itself far more strongly.', 'Dispersionskräfte wirken zwischen allen Molekülen (Einheit 8), also ziehen sich Hexan und Wasser ein wenig an. Wasserstoffbrücken scheiden aus: Hexan hat kein H an N, O oder F und keine freien Elektronenpaare. Wasser zieht sich einfach viel stärker selbst an.') },
  { id: 'i11r', unit: 11, kind: 'choice', format: 'why', evidence: 'explain', withConfidence: true, concepts: ['u11.no-repulsion'], targets: ['oil-water-repel', 'hbond-donor-acceptor'],
    prompt: b('Oil droplets stirred into water slowly join up again into one layer. Why?', 'Öltröpfchen, die man in Wasser verrührt, vereinigen sich langsam wieder zu einer Schicht. Warum?'),
    options: [
      { text: b('Water pushes the oil away because oil is nonpolar', 'Wasser drückt das Öl weg, weil Öl unpolar ist'), mis: 'oil-water-repel' },
      { text: b('Oil molecules form strong hydrogen bonds with each other', 'Ölmoleküle bilden untereinander starke Wasserstoffbrücken'), mis: 'hbond-donor-acceptor' },
      { text: b('Water molecules hold on to each other and close up, leaving the oil gathered in one place', 'Wassermoleküle halten sich aneinander fest und rücken zusammen, sodass das Öl an einer Stelle übrig bleibt'), correct: true },
      { text: b('Gravity pulls the droplets towards each other', 'Die Schwerkraft zieht die Tröpfchen zueinander') },
    ],
    explain: b('Every droplet surface is a place where water has lost hydrogen bonds. As droplets merge, there is less surface, and water gets more of its hydrogen bonds back. Nothing pushes; the oil ends up on top only because it is less dense.', 'Jede Tröpfchenoberfläche ist eine Stelle, an der das Wasser Wasserstoffbrücken verloren hat. Wenn Tröpfchen verschmelzen, gibt es weniger Oberfläche, und das Wasser bekommt mehr seiner Wasserstoffbrücken zurück. Nichts drückt; oben landet das Öl nur, weil es eine geringere Dichte hat.') },
  { id: 'i11s', unit: 11, kind: 'choice', format: 'predict', evidence: 'transfer', withConfidence: true, concepts: ['u11.no-repulsion'], targets: ['oil-water-repel'],
    prompt: b('On a freshly waxed car, rain forms round beads instead of a thin film. Why?', 'Auf einem frisch gewachsten Auto bildet Regen runde Perlen statt eines dünnen Films. Warum?'),
    options: [
      { text: b('Water attracts itself more than the nonpolar wax, so each drop pulls into a ball', 'Wasser zieht sich stärker selbst an als das unpolare Wachs, also zieht sich jeder Tropfen zu einer Kugel zusammen'), correct: true },
      { text: b('The wax repels the water', 'Das Wachs stößt das Wasser ab'), mis: 'oil-water-repel' },
      { text: b('The wax is electrically charged and pushes the water away', 'Das Wachs ist elektrisch geladen und drückt das Wasser weg') },
      { text: b('The drops freeze into balls on the cold wax', 'Die Tropfen gefrieren auf dem kalten Wachs zu Kugeln') },
    ],
    explain: b('Wax, like oil, is nonpolar and offers water only weak dispersion. Spreading out would cost water hydrogen bonds, so each drop pulls together into a bead with as little contact as possible. On clean glass, which water can hydrogen-bond to, it spreads into a film instead.', 'Wachs ist wie Öl unpolar und bietet dem Wasser nur schwache Dispersionskräfte. Sich auszubreiten würde das Wasser Wasserstoffbrücken kosten, also zieht sich jeder Tropfen zu einer Perle mit möglichst wenig Kontakt zusammen. Auf sauberem Glas, an das Wasser Wasserstoffbrücken bilden kann, breitet es sich dagegen als Film aus.') },
];
