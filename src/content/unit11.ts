// Unit 11 — Water's network and solubility, on the Particle Box (water with mixing).
// Data: src/content/substances.ts (solubilities in g per 100 g water at about 20 °C: methanol, ethanol, 1-propanol
// mix in any ratio, 1-butanol 7.7, 1-hexanol 0.59, hexane 0.001; densities: hexane 0.655, water 0.998 g/cm³;
// WATER: ice 0.917, liquid 0.9998 at 0 °C and 1.0000 at 4 °C, one hydrogen bond about 20 kJ/mol, O–H 464 kJ/mol).
// Water at 20 °C: 0.9982 g/cm³ (CRC Handbook). NaCl: lattice energy 787 kJ/mol and melting point 801 °C (ions.ts);
// solubility 36 g per 100 g water at 20 °C and enthalpy of solution +3.9 kJ/mol (CRC Handbook; LibreTexts,
// "Enthalpy Change of Solution"). Calcium carbonate (calcite): about 0.014 g/L = 0.0014 g per 100 g water at 25 °C
// (SaltWiki, calcite); magnesium sulfate: about 35 g per 100 g water at 20 °C (CRC Handbook). Sucrose: about 200 g
// per 100 g water at 20 °C, eight O–H groups (CRC Handbook). Hydration shells: O (δ−) towards Na⁺, H (δ+)
// towards Cl⁻ (OpenStax Biology 2e, 2.2). Salt water (NaCl) stays liquid down to its eutectic, about −21 °C (CRC
// Handbook). Hexane density 0.655 g/cm³ is at 25 °C. The hydrophobic effect at room temperature is mostly entropic
// (OpenStax Chemistry 2e, 11.1; entropy is unit 19).
import type { Bi } from '../i18n';
import type { ChoiceItem, RankItem, FlawItem } from './items';
import type { Idea } from './unit06';
import type { UnitContent } from './unitTypes';

const b = (en: string, de: string): Bi => ({ en, de });
const together = (a: RegExp, c: RegExp) => `(${a.source}.{0,60}${c.source}|${c.source}.{0,60}${a.source})`;

// ---------- explain-back patterns ----------
// Idea 1, the network: a hydrogen-bond word together with what it links (each other, neighbours, four, a network).
const HB_EN = /(hydrogen[- ]?bond\w*|\bh[- ]?bond\w*|hydrogen[- ]bridge\w*|\bh-bridge\w*)/;
const NET_EN = /(network|\bweb\b|lattice|\bfour\b|\b4\b|each other|one another|neighbou?r\w*|\blink\w*|\bjoin\w*|connect\w*|hold\w* (them |the molecules |water )?together|stick\w* together|between (the )?(water )?molecules|other (water )?molecules)/;
const HB_DE = /(wasserstoffbrücke\w*|h-brücke\w*|wasserstoffbrückenbindung\w*|h-brückenbindung\w*)/;
const NET_DE = /(netzwerk|\bnetz\b|gitter|\bvier\b|\b4\b|untereinander|miteinander|gegenseitig|einander|nachbar\w*|verbind\w*|verknüpf\w*|vernetz\w*|zusammen(halt|hält|halten|gehalten)|halten .{0,20}zusammen|zwischen (den )?(wasser)?molekülen|andere[nm]? (wasser)?molekül\w*)/;

// Idea 2, ice: ice (or freezing) together with less dense / open / more space. "Ice floats" alone does not pass.
const ICE_EN = /(\bice\b|frozen|freez\w*|solid water)/;
const LESS_EN = /(less dense|lower density|density (is )?lower|not as dense|lighter than (liquid )?water|more (space|room|volume)|takes? up more|expand\w*|open (\w+ )?(network|structure|lattice|pattern|framework|arrangement)|hexagonal|\bgaps?\b|\bholes\b|empty spaces?|spaced (out|apart)|(held|kept|further|farther) apart)/;
const ICE_DE = /(\beis\b|eiskristall\w*|gefror\w*|gefrier\w*|festes wasser)/;
const LESS_DE = /(geringere\w* dichte|kleinere\w* dichte|niedrigere\w* dichte|weniger dicht|nicht so dicht|dichte .{0,15}(geringer|kleiner|niedriger)|leichter als (flüssiges )?wasser|mehr platz|mehr raum|größere\w* volumen|dehnt sich .{0,10}aus|ausdehn\w*|offene\w* (\w+ )?(netz\w*|struktur|gitter|anordnung)|sechseck\w*|lücken|hohlräume|weitmaschig\w*|weiter auseinander|locker\w*)/;
const ICE_DENSER = {
  en: /\bice (is|gets|becomes) (denser|heavier|more dense)/,
  de: /\beis (ist|wird) (dichter|schwerer)/,
};

// Idea 4, hydration. A clause claiming the salt melts in water, or that it dissolves as NaCl molecules, rules it out.
const MELT_OR_MOLECULES = {
  en: /^(?!.*(\bnot\b|n't|\bno\b|\bnever\b)).*((salt|nacl|the crystal|the lattice)\b.{0,20}\b(melts|melt|is melting|has melted) (in|into|because of) (the )?water|dissolving is (just |simply )?melting|(nacl|salt) molecules)/,
  de: /^(?!.*(nicht|kein|\bnie\b)).*((salz|nacl|der kristall|das gitter)\b.{0,20}\bschmilzt (im|in|durch)( dem)? wasser|lösen ist (nur |einfach )?schmelzen|(nacl|salz|kochsalz)-?molekül)/,
};

// Idea 5, no repulsion. A clause saying oil and water repel (without a negation) rules it out.
const REPEL = {
  en: /^(?!.*(\bnot\b|n't|\bno\b|\bnever\b|\bnothing\b)).*\b(repel\w*|repuls\w*|push\w* (each other |the oil |it |them )?(away|apart))/,
  de: /^(?!.*(nicht|kein|\bnie\b|nichts)).*(stoßen sich .{0,20}\bab\b|stößt .{0,30}\bab\b|abstoß\w*|abgestoßen)/,
};

export const UNIT11: UnitContent = {
  n: 11,
  title: b('Water\'s network and solubility', 'Das Netzwerk des Wassers und Löslichkeit'),
  lead: b('Why ice floats, why oil and water stay apart, and how water takes a salt crystal to pieces.', 'Warum Eis schwimmt, warum Öl und Wasser sich nicht mischen und wie Wasser einen Salzkristall zerlegt.'),

  puzzle: {
    title: b('Same O–H group, different fate', 'Gleiche O–H-Gruppe, anderes Schicksal'),
    lead: b('An alcohol has an O–H group on a carbon atom, the group that forms hydrogen bonds (unit 10); the ones in this table are straight chains with the O–H group at the end. The first three mix with water in any ratio. After that, solubility falls fast.',
      'Ein Alkohol (genauer: ein Alkanol) trägt eine O–H-Gruppe, die Hydroxygruppe, an einem Kohlenstoffatom; sie bildet Wasserstoffbrücken (Einheit 10). In der Tabelle stehen gerade Ketten mit der Hydroxygruppe am Ende. Die ersten drei mischen sich in jedem Verhältnis mit Wasser. Danach nimmt die Löslichkeit stark ab.'),
    data: {
      caption: b('[[solubility|Solubility]]: how many grams dissolve in 100 g of water at about 20 °C. Hexane has the same six carbons as hexanol, but no O–H group.',
        '[[solubility|Löslichkeit]]: wie viel Gramm sich in 100 g Wasser bei etwa 20 °C lösen. Hexan hat dieselben sechs Kohlenstoffatome wie Hexanol, aber keine O–H-Gruppe.'),
      head: [b('Substance', 'Stoff'), b('Carbon atoms', 'C-Atome'), b('O–H groups', 'O–H-Gruppen'), b('Dissolves in 100 g water', 'Löst sich in 100 g Wasser')],
      rows: [
        { cells: [b('methanol, {{CH3OH}}', 'Methanol, {{CH3OH}}'), '1', '1', b('any amount', 'in jeder Menge')] },
        { cells: [b('ethanol, {{C2H5OH}}', 'Ethanol, {{C2H5OH}}'), '2', '1', b('any amount', 'in jeder Menge')] },
        { cells: [b('1-propanol, {{C3H7OH}}', '1-Propanol, {{C3H7OH}}'), '3', '1', b('any amount', 'in jeder Menge')] },
        { cells: [b('1-butanol, {{C4H9OH}}', '1-Butanol, {{C4H9OH}}'), '4', '1', b('7.7 g', '7,7 g')] },
        { cells: [b('1-hexanol, {{C6H13OH}}', '1-Hexanol, {{C6H13OH}}'), '6', '1', b('0.59 g', '0,59 g')], mystery: true },
        { cells: [b('hexane, {{C6H14}}', 'Hexan, {{C6H14}}'), '6', '0', b('0.001 g', '0,001 g')] },
      ],
      numeric: [1, 2],
    },
    clash: b('Every alcohol here carries the same O–H group, and that group bonds well to water. Yet less than 1 g of hexanol dissolves in 100 g of water, under a tenth as much as butanol. If its O–H group can bond to water, what holds hexanol back?',
      'Jeder Alkohol hier trägt dieselbe Hydroxygruppe, und die bindet gut an Wasser. Trotzdem löst sich von Hexanol weniger als 1 g in 100 g Wasser, nicht einmal ein Zehntel der Menge Butanol. Wenn seine Hydroxygruppe an Wasser binden kann, was hält Hexanol dann zurück?'),
    question: {
      id: 'u11-puzzle', unit: 11, kind: 'choice', format: 'predict', withConfidence: true, evidence: 'predict',
      concepts: ['u11.chain', 'u11.like'], targets: ['oil-water-repel'],
      prompt: b('Your best guess:', 'Deine beste Vermutung:'),
      options: [
        { text: b('Its long chain repels the water molecules', 'Seine lange Kette stößt die Wassermoleküle ab'), mis: 'oil-water-repel' },
        { text: b('In a long molecule the O–H group is no longer polar', 'In einem langen Molekül ist die O–H-Gruppe nicht mehr polar') },
        { text: b('Its long chain offers water no hydrogen bonds, only gets in the way', 'Seine lange Kette bietet dem Wasser keine Wasserstoffbrücken, sie stört nur'), correct: true },
        { text: b('Heavier molecules sink to the bottom before they can mix', 'Schwerere Moleküle sinken zu Boden, bevor sie sich mischen können') },
      ],
      explain: b('Water molecules hold on to each other with hydrogen bonds. A molecule mixes in easily when it offers water about as much attraction as water gives up to make room. One O–H group can do that for a short chain, not for a long one: six carbons form no hydrogen bonds, and the water molecules around the chain can keep their own only by lining up in an ordered cage, which costs them freedom. Nothing repels the chain; water simply stays with itself. "Hydrophobic" means "water-fearing" in Greek: in an exam you may use it, with the reason, the hydrogen bonds between the water molecules.',
        'Wassermoleküle halten sich über Wasserstoffbrücken aneinander fest. Ein Molekül mischt sich leicht ein, wenn es dem Wasser etwa so viel Anziehung bietet, wie das Wasser aufgibt, um Platz zu machen. Eine Hydroxygruppe schafft das bei einer kurzen Kette, aber nicht bei einer langen: Sechs Kohlenstoffatome bilden keine Wasserstoffbrücken, und die Wassermoleküle um die Kette können ihre eigenen nur behalten, wenn sie sich zu einem geordneten Käfig aufreihen; das kostet sie Bewegungsfreiheit. Nichts stößt die Kette ab; das Wasser bleibt einfach unter sich. „Hydrophob“ heißt wörtlich „wasserscheu“: In der Klausur darfst du hydrophob oder lipophil schreiben, begründet mit den Wasserstoffbrücken zwischen den Wassermolekülen.'),
    } as ChoiceItem,
    after: b('Next: pour different things into water and watch where they go.', 'Als Nächstes: Gib verschiedene Stoffe in Wasser und sieh zu, wo sie bleiben.'),
  },

  explore: {
    title: b('The Particle Box: water', 'Die Teilchenbox: Wasser'),
    intro: b('The box holds water molecules: an oxygen with a red tint (δ−, slightly negative) and two hydrogens with a blue tint (δ+, slightly positive), as in unit 6. Switch on the hydrogen-bond view to see the dashed links between molecules. Then pour something into the water at room temperature; cool it below 0 °C last. Density is mass per volume, in grams per cubic centimetre (g/cm³): what is less dense floats on top.',
      'In der Box sind Wassermoleküle: ein Sauerstoff mit rotem Schimmer (δ−, leicht negativ) und zwei Wasserstoffe mit blauem Schimmer (δ+, leicht positiv), wie in Einheit 6. Schalte die Ansicht der Wasserstoffbrücken ein, um die gestrichelten Verbindungen zwischen den Molekülen zu sehen. Gib dann bei Raumtemperatur etwas ins Wasser; kühle es erst zum Schluss unter 0 °C ab. Die Dichte ist Masse pro Volumen, in Gramm pro Kubikzentimeter (g/cm³): Was eine geringere Dichte hat, schwimmt oben.'),
    tasks: [
      { id: 'network', key: true, text: b('Switch on the hydrogen-bond view. Watch the dashed links form and break as the molecules move.', 'Schalte die Ansicht der Wasserstoffbrücken ein. Sieh zu, wie die gestrichelten Verbindungen entstehen und reißen, während sich die Moleküle bewegen.') },
      { id: 'oil', key: true, text: b('Pour hexane, a part of petrol, into the water. Where does it end up?', 'Gib Hexan, einen Bestandteil von Benzin, ins Wasser. Wo landet es?') },
      { id: 'salt', key: true, text: b('Add salt. Which end of the water molecules turns towards each ion?', 'Gib Salz dazu. Welches Ende der Wassermoleküle dreht sich zu jedem Ion?') },
      { id: 'ice', key: true, text: b('Cool the water below 0 °C. Compare the density of ice with that of liquid water.', 'Kühle das Wasser unter 0 °C ab. Vergleiche die Dichte von Eis mit der von flüssigem Wasser.') },
      { id: 'ethanol', text: b('Mix ethanol into the water instead. What is different from hexane?', 'Mische stattdessen Ethanol ins Wasser. Was ist anders als bei Hexan?') },
      { id: 'butanol', challenge: true, text: b('Mix in 1-butanol (four carbon atoms). Does it dissolve, separate, or both?', 'Mische 1-Butanol ein (vier Kohlenstoffatome). Löst es sich, trennt es sich ab, oder beides?') },
    ],
    notes: {
      network: b('Each molecule can take part in up to four hydrogen bonds: its two H atoms each bond to a lone pair on a neighbour, and its two lone pairs each hold a neighbour\'s H. Each bond joins two molecules, so where every molecule takes part in four, there are two bonds for every molecule. In the liquid the links break and re-form all the time, each lasting about a trillionth of a second, so a molecule takes part in a little fewer than four.',
        'Jedes Molekül kann an bis zu vier Wasserstoffbrücken beteiligt sein: Seine zwei H-Atome bilden je eine Wasserstoffbrücke zu einem freien Elektronenpaar eines Nachbarn, und seine zwei freien Elektronenpaare halten je ein H eines Nachbarn. Jede Brücke verbindet zwei Moleküle; ist jedes Molekül an vier beteiligt, kommen also zwei Brücken auf jedes Molekül. In der Flüssigkeit reißen die Verbindungen ständig und bilden sich neu, jede hält nur etwa eine billionstel Sekunde; deshalb ist ein Molekül an etwas weniger als vier beteiligt.'),
      ice: b('In ice every molecule holds exactly four neighbours at fixed angles: an open network with gaps. Ice at 0 °C: 0.917 g/cm³; liquid water: 1.000 g/cm³ at 4 °C, 0.998 g/cm³ at 20 °C. The same mass of ice needs about 9 % more room. Warm the water above 0 °C again before you pour anything in: this frozen box takes nothing in. On a gritted road it is different: salt dissolves in the thin film of liquid water on the ice, and salt water stays liquid down to about −21 °C, so the ice melts.',
        'Im Eis hält jedes Molekül genau vier Nachbarn in festen Winkeln: ein offenes Netzwerk mit Lücken. Eis bei 0 °C: 0,917 g/cm³; flüssiges Wasser: 1,000 g/cm³ bei 4 °C, 0,998 g/cm³ bei 20 °C. Dieselbe Masse Eis braucht etwa 9 % mehr Platz. Erwärme das Wasser wieder über 0 °C, bevor du etwas hineingibst: Diese gefrorene Box nimmt nichts auf. Auf einer gestreuten Straße ist es anders: Das Salz löst sich im dünnen Film aus flüssigem Wasser auf dem Eis, und Salzwasser bleibt bis etwa −21 °C flüssig; so taut das Eis.'),
      oil: b('The hexane gathers in a layer on top: it is less dense (0.655 g/cm³ against 0.998 for water). Watch closely: nothing pushes the hexane away. The water molecules simply keep hold of each other, and the hexane is left over.',
        'Das Hexan sammelt sich in einer Schicht oben: Es hat eine geringere Dichte (0,655 g/cm³ gegenüber 0,998 bei Wasser). Schau genau hin: Nichts stößt das Hexan weg. Die Wassermoleküle halten sich einfach aneinander fest, und das Hexan bleibt übrig.'),
      salt: b('The red oxygen ends (δ−) turn towards the blue Na⁺, the blue hydrogen ends (δ+) towards the red Cl⁻. Each ion leaves the crystal wrapped in its own shell of water molecules, a [[hydration]] shell. Nothing melts: the water stays at room temperature.',
        'Die roten Sauerstoff-Enden (δ−) drehen sich zum blauen Na⁺, die blauen Wasserstoff-Enden (δ+) zum roten Cl⁻. Jedes Ion verlässt den Kristall in einer eigenen Hülle aus Wassermolekülen, der Hydrathülle ([[hydration]]). Nichts schmilzt: Das Wasser bleibt bei Raumtemperatur.'),
      ethanol: b('Ethanol spreads evenly through the water. Its O–H group joins water\'s network, and its chain of two carbons is short enough to fit in. Such substances are called [[hydrophilic]].',
        'Ethanol verteilt sich gleichmäßig im Wasser. Seine O–H-Gruppe wird Teil des Netzwerks, und seine Kette aus zwei Kohlenstoffatomen ist kurz genug, um hineinzupassen. Solche Stoffe nennt man [[hydrophilic|hydrophil]].'),
      butanol: b('Both: a little dissolves (7.7 g in 100 g of water), the rest forms a layer on top. Around four carbons the chain starts to win over the O–H group.',
        'Beides: Ein wenig löst sich (7,7 g in 100 g Wasser), der Rest bildet oben eine Schicht. Ab etwa vier Kohlenstoffatomen setzt sich die Kette gegen die Hydroxygruppe durch.'),
    },
    check: {
      id: 'u11-check', unit: 11, kind: 'rank', format: 'rank', evidence: 'predict', concepts: ['u11.ice'], mis: 'ice-denser', targets: ['ice-denser'],
      prompt: b('Rank by density, densest first: liquid water, ice, hexane.', 'Ordne nach Dichte, die größte zuerst: flüssiges Wasser, Eis, Hexan.'),
      order: [b('liquid water', 'flüssiges Wasser'), b('ice', 'Eis'), b('hexane', 'Hexan')],
      explain: b('Water (20 °C) 0.998, ice (0 °C) 0.917, hexane (25 °C) 0.655 g/cm³. So ice floats on water but would sink in hexane, and hexane floats on both.',
        'Wasser (20 °C) 0,998, Eis (0 °C) 0,917, Hexan (25 °C) 0,655 g/cm³. Eis schwimmt also auf Wasser, würde aber in Hexan sinken, und Hexan schwimmt auf beiden.'),
    } as RankItem,
  },

  predictions: [
    {
      item: {
        id: 'u11-acetone', unit: 11, kind: 'choice', format: 'predict', withConfidence: true, evidence: 'transfer',
        concepts: ['u11.like'], targets: ['hbond-donor-acceptor'],
        prompt: b('Acetone (nail-polish remover, {{CH3COCH3}}) has a polar C=O group but no H on oxygen, so acetone molecules cannot form hydrogen bonds with each other (unit 10). Poured into water, acetone…',
          'Aceton (Nagellackentferner, {{CH3COCH3}}) hat eine polare C=O-Gruppe, aber kein H am Sauerstoff; Acetonmoleküle können deshalb untereinander keine Wasserstoffbrücken bilden (Einheit 10). Gießt man Aceton in Wasser, dann…'),
        options: [
          { text: b('forms a separate layer on top, like hexane', 'bildet es oben eine eigene Schicht, wie Hexan'), mis: 'hbond-donor-acceptor' },
          { text: b('mixes with the water in any ratio', 'mischt es sich in jedem Verhältnis mit dem Wasser'), correct: true },
          { text: b('dissolves only a little, like 1-butanol', 'löst es sich nur ein wenig, wie 1-Butanol') },
          { text: b('sinks, because its molecules are heavier', 'sinkt es, weil seine Moleküle schwerer sind') },
        ],
        explain: b('Acetone cannot give a hydrogen bond, but it can take one: its oxygen has two lone pairs, and water\'s H atoms bond to them. With only three carbons, acetone fits into water\'s network.',
          'Aceton kann keine Wasserstoffbrücke spenden, aber eine annehmen: Sein Sauerstoff hat zwei freie Elektronenpaare, und die H-Atome des Wassers binden daran. Mit nur drei Kohlenstoffatomen passt Aceton ins Netzwerk des Wassers.'),
      } as ChoiceItem,
      show: { engine: 'box', sub: 'H2O', mix: 'CH3COCH3', view: 'hbonds' },
      revealText: b('Acetone and water mix in any ratio. The dashed links run from water\'s H atoms to acetone\'s oxygen: water supplies the H, acetone the lone pair. When the new attractions roughly make up for the ones water gives up, the natural tendency of molecules to spread out and mix does the rest.',
        'Aceton und Wasser mischen sich in jedem Verhältnis. Die gestrichelten Verbindungen reichen von den H-Atomen des Wassers zum Sauerstoff des Acetons: Das Wasser liefert das H, das Aceton das freie Elektronenpaar. Wenn die neuen Anziehungen die aufgegebenen etwa ausgleichen, erledigt die natürliche Neigung der Moleküle, sich zu verteilen und zu mischen, den Rest.'),
      extra: {
        title: b('Ask what each partner can offer', 'Frag, was jeder Partner zu bieten hat'),
        steps: [
          b('Water molecules hold on to each other with hydrogen bonds. A new substance mixes in easily only if it offers water something similar.', 'Wassermoleküle halten sich über Wasserstoffbrücken aneinander fest. Ein neuer Stoff mischt sich nur dann leicht ein, wenn er dem Wasser etwas Ähnliches bietet.'),
          b('Acetone has no H on oxygen, so it cannot give a hydrogen bond. But its oxygen has two lone pairs, so it can take one.', 'Aceton hat kein H am Sauerstoff, kann also keine Wasserstoffbrücke spenden. Aber sein Sauerstoff hat zwei freie Elektronenpaare, es kann also eine annehmen.'),
          b('Water\'s H atoms bond to those lone pairs. The water loses little, so acetone slips into the network.', 'Die H-Atome des Wassers binden an diese freien Elektronenpaare. Das Wasser verliert dabei wenig, also schlüpft das Aceton ins Netzwerk.'),
          b('Hexane has neither an H on oxygen nor a lone pair: nothing to offer, so it stays out.', 'Hexan hat weder ein H am Sauerstoff noch ein freies Elektronenpaar: nichts zu bieten, also bleibt es draußen.'),
        ],
      },
    },
    {
      item: {
        id: 'u11-lake', unit: 11, kind: 'choice', format: 'predict', withConfidence: true, evidence: 'transfer',
        concepts: ['u11.ice', 'u11.network'], targets: ['ice-denser'],
        prompt: b('Liquid water has a density of 0.9998 g/cm³ at 0 °C, 1.0000 g/cm³ at 4 °C and 0.9982 g/cm³ at 20 °C. In winter a deep lake freezes over. What temperature is the water at the very bottom?',
          'Flüssiges Wasser hat bei 0 °C eine Dichte von 0,9998 g/cm³, bei 4 °C von 1,0000 g/cm³ und bei 20 °C von 0,9982 g/cm³. Im Winter friert ein tiefer See zu. Welche Temperatur hat das Wasser ganz unten?'),
        options: [
          { text: b('About 0 °C: the coldest water is densest and sinks', 'Etwa 0 °C: Das kälteste Wasser ist am dichtesten und sinkt'), mis: 'ice-denser' },
          { text: b('Below 0 °C: the weight of the water above cools it', 'Unter 0 °C: Das Gewicht des Wassers darüber kühlt es') },
          { text: b('About the same as the air above the ice', 'Etwa so kalt wie die Luft über dem Eis') },
          { text: b('About 4 °C: the densest water sinks to the bottom', 'Etwa 4 °C: Das dichteste Wasser sinkt nach unten'), correct: true },
        ],
        explain: b('Water is densest at 4 °C, so water at 4 °C sinks and fills the bottom. Colder water, near 0 °C, is slightly less dense and stays at the top, where it freezes. The ice (0.917 g/cm³) floats on it.',
          'Wasser ist bei 4 °C am dichtesten, also sinkt 4 °C kaltes Wasser und füllt den Grund. Kälteres Wasser, nahe 0 °C, hat eine etwas geringere Dichte und bleibt oben, wo es gefriert. Das Eis (0,917 g/cm³) schwimmt darauf.'),
      } as ChoiceItem,
      show: { engine: 'box', sub: 'H2O', mix: 'ice', temp: 0 },
      revealText: b('The bottom of a deep lake stays at about 4 °C all winter. One common picture of why: below 4 °C, more and more molecules briefly arrange themselves in open, ice-like patterns, so the water expands a little even before it freezes. The coldest water stays at the top and freezes there; the floating ice then shields the water below from the cold air, which is how fish survive the winter. (The box cannot show a lake\'s layers; it shows the ice floating on water at 0 °C.)',
        'Der Grund eines tiefen Sees bleibt den ganzen Winter bei etwa 4 °C. Ein verbreitetes Bild dafür: Unter 4 °C ordnen sich immer mehr Moleküle kurzzeitig in offenen, eisähnlichen Mustern an; das Wasser dehnt sich deshalb schon vor dem Gefrieren etwas aus. Das kälteste Wasser bleibt oben und gefriert dort; das schwimmende Eis schützt dann das Wasser darunter vor der kalten Luft. So überleben Fische den Winter. Im Unterricht heißt das die Dichteanomalie des Wassers. (Die Box kann keine Schichten eines Sees zeigen; sie zeigt das Eis, das bei 0 °C auf dem Wasser schwimmt.)'),
      extra: {
        title: b('Follow the densest water', 'Folge dem dichtesten Wasser'),
        steps: [
          b('Denser water sinks, less dense water rises. Compare the three numbers: 1.0000 at 4 °C is the largest.', 'Dichteres Wasser sinkt, Wasser mit geringerer Dichte steigt. Vergleiche die drei Zahlen: 1,0000 bei 4 °C ist die größte.'),
          b('So as the lake cools in autumn, water at 4 °C collects at the bottom.', 'Wenn der See im Herbst abkühlt, sammelt sich deshalb 4 °C kaltes Wasser am Grund.'),
          b('Water colder than 4 °C is less dense: it stays on top, cools further and freezes at 0 °C.', 'Wasser, das kälter als 4 °C ist, hat eine geringere Dichte: Es bleibt oben, kühlt weiter ab und gefriert bei 0 °C.'),
          b('The ice (0.917) floats on top. Underneath, the bottom stays at about 4 °C.', 'Das Eis (0,917) schwimmt oben. Darunter bleibt der Grund bei etwa 4 °C.'),
        ],
      },
    },
  ],

  examples: [
    {
      title: b('Water takes salt apart', 'Wasser zerlegt Salz'), tag: 'NaCl', show: { engine: 'box', sub: 'H2O', mix: 'NaCl', temp: 20 },
      numbers: [{ v: '36 g', label: b('of salt dissolve in 100 g of water at 20 °C', 'Salz lösen sich in 100 g Wasser bei 20 °C') }, { v: '801 °C', label: b('melting point of salt, so dissolving is not melting', 'Schmelzpunkt von Salz: Lösen ist kein Schmelzen') }, { v: '+3.9 kJ/mol', label: b('taken in when one mole of salt dissolves (enthalpy of solution)', 'Lösungsenthalpie: so viel wird beim Lösen von einem Mol Salz aufgenommen') }],
      body: b('Water does not melt salt; that would take 801 °C. The δ− oxygen ends of water molecules turn towards Na⁺, the δ+ hydrogen ends towards Cl⁻, and each ion leaves the crystal wrapped in its own [[hydration]] shell. The energy released by these attractions almost exactly makes up for the lattice energy (787 kJ/mol, unit 4): dissolving takes in only 3.9 kJ/mol. The rest comes from the ions\' natural tendency to spread out through the water (entropy, unit 19), which is why salt dissolves even though the water cools a tiny bit.',
        'Wasser schmilzt Salz nicht; dafür bräuchte es 801 °C. Die δ−-Sauerstoff-Enden der Wassermoleküle drehen sich zum Na⁺, die δ+-Wasserstoff-Enden zum Cl⁻, und jedes Ion verlässt den Kristall in seiner eigenen Hydrathülle ([[hydration]]). Die bei der Hydratation frei werdende Energie gleicht die Gitterenergie (787 kJ/mol, Einheit 4) fast genau aus: Beim Lösen werden nur 3,9 kJ/mol aufgenommen. Den Rest erledigt die natürliche Neigung der Ionen, sich im Wasser zu verteilen (Entropie, Einheit 19); deshalb löst sich Salz, obwohl das Wasser dabei ein klein wenig abkühlt.'),
      soWhat: b('Salt water contains no NaCl molecules, only separate, wrapped ions that can move on their own. That is why salt water conducts electricity (unit 7).',
        'Salzwasser enthält keine NaCl-Moleküle, nur einzelne, umhüllte Ionen, die sich unabhängig bewegen können. Deshalb leitet Salzwasser den elektrischen Strom (Einheit 7).'),
    },
    {
      title: b('Oil and water, no repulsion needed', 'Öl und Wasser, ganz ohne Abstoßung'), tag: 'C6H14', show: { engine: 'box', sub: 'H2O', mix: 'C6H14', temp: 20 },
      numbers: [{ v: '0.001 g', label: b('of hexane dissolves in 100 g of water', 'Hexan löst sich in 100 g Wasser') }, { v: '0.655 g/cm³', label: b('density of hexane, so its layer floats', 'Dichte von Hexan, deshalb schwimmt seine Schicht oben') }, { v: '0.998 g/cm³', label: b('density of water at 20 °C, so the water stays below', 'Dichte von Wasser bei 20 °C, deshalb bleibt das Wasser unten') }],
      body: b('Hexane and water molecules do attract each other a little, through dispersion forces (unit 8). But the water molecules next to a hexane molecule can keep their hydrogen bonds only by lining up in an ordered cage around it, and that loss of freedom (entropy, unit 19) makes mixing unfavourable. So the water molecules keep to themselves, and the hexane is left over as its own layer.',
        'Hexan- und Wassermoleküle ziehen sich durchaus ein wenig an, über Dispersionskräfte (Einheit 8). Aber die Wassermoleküle neben einem Hexanmolekül können ihre Wasserstoffbrücken nur behalten, wenn sie sich zu einem geordneten Käfig um es herum aufreihen; dieser Verlust an Bewegungsfreiheit (Entropie, Einheit 19) macht das Mischen ungünstig. Also bleiben die Wassermoleküle unter sich, und das Hexan bleibt als eigene Schicht übrig.'),
      soWhat: b('Soap bridges the two: each soap molecule has a long nonpolar tail that sits in the grease and a charged head that sits in the water, so grease can be rinsed away.',
        'Seife verbindet beide: Jedes Seifenmolekül hat einen langen unpolaren Schwanz, der im Fett steckt, und einen geladenen Kopf, der im Wasser steckt; so lässt sich Fett abspülen. In der Klausur: Seifenmoleküle haben einen hydrophilen Kopf und einen hydrophoben (lipophilen) Schwanz.'),
    },
    {
      title: b('Where the rule of thumb runs out: limestone', 'Wo die Faustregel endet: Kalkstein'), tag: 'CaCO3', show: { engine: 'box', sub: 'H2O', mix: 'NaCl', temp: 20 },
      numbers: [{ v: '36 g', label: b('of table salt dissolve in 100 g of water', 'Kochsalz lösen sich in 100 g Wasser') }, { v: '0.0014 g', label: b('of calcium carbonate (limestone) dissolves', 'Calciumcarbonat (Kalkstein) lösen sich') }, { v: '35 g', label: b('of magnesium sulfate dissolve', 'Magnesiumsulfat lösen sich') }],
      body: b('Salts are made of ions, yet not every salt dissolves. Calcium carbonate\'s ions carry double charges (Ca²⁺ and CO₃²⁻) and hold each other so firmly that water barely gets them apart, while magnesium sulfate, also 2+ and 2−, dissolves readily. Whether a salt dissolves depends on whether hydration makes up for the lattice energy; the two are nearly equal, too close for a simple rule to call. (The box shows table salt for comparison.)',
        'Salze bestehen aus Ionen, und trotzdem löst sich nicht jedes Salz. Die Ionen von Calciumcarbonat sind zweifach geladen (Ca²⁺ und CO₃²⁻) und halten einander so fest, dass Wasser sie kaum trennt, während sich Magnesiumsulfat, ebenfalls 2+ und 2−, gut löst. Ob sich ein Salz löst, hängt davon ab, ob die Hydratationsenergie die Gitterenergie aufwiegt; beide sind fast gleich groß, zu knapp für eine einfache Regel. (Die Box zeigt zum Vergleich Kochsalz.)'),
      soWhat: b('This shapes whole landscapes. Limestone barely dissolves in pure water, but rainwater containing carbon dioxide slowly reacts with it to give dissolved calcium hydrogencarbonate; over thousands of years this carves caves, and where the water gives the carbon dioxide back, limestone is deposited again as stalactites.',
        'Das prägt ganze Landschaften. In reinem Wasser löst sich Kalkstein kaum; mit kohlensäurehaltigem Regenwasser reagiert er aber langsam zu gelöstem Calciumhydrogencarbonat. So entstehen über Jahrtausende Höhlen, und wo das Wasser das Kohlenstoffdioxid wieder abgibt, scheidet sich Kalk als Tropfstein ab.'),
    },
  ],

  flaw: {
    id: 'u11-flaw', unit: 11, kind: 'flaw', format: 'flaw', evidence: 'transfer', concepts: ['u11.no-repulsion'], targets: ['oil-water-repel'],
    prompt: b('Where does this reasoning first go wrong?', 'Wo geht diese Überlegung zum ersten Mal schief?'),
    lines: [
      b('Water molecules are polar and hold on to each other with hydrogen bonds.', 'Wassermoleküle sind polar und halten sich über Wasserstoffbrücken aneinander fest.'),
      b('Oil molecules are nonpolar, so oil and water molecules repel each other.', 'Ölmoleküle sind unpolar, also stoßen sich Öl- und Wassermoleküle ab.'),
      b('So shaken oil and water push each other apart into two layers.', 'Also drücken sich Öl und Wasser nach dem Schütteln gegenseitig auseinander, bis zwei Schichten entstehen.'),
    ],
    flaw: 1,
    alsoFalse: [2],
    near: [{ step: 0, note: b('Step 1 is true, and it is the real reason for the layers: water molecules hold on to each other.', 'Schritt 1 stimmt, und er ist der eigentliche Grund für die Schichten: Wassermoleküle halten sich aneinander fest.') }],
    explain: b('Step 2 is the first wrong step. Step 1 is true: water molecules cling to each other through hydrogen bonds. Step 2 is wrong: oil and water molecules attract each other a little (dispersion); they do not repel. Step 3 is wrong because it builds on step 2: the layers form because water molecules stay together and leave the oil out, not because anything pushes.',
      'Schritt 2 ist der erste falsche Schritt. Schritt 1 stimmt: Wassermoleküle halten sich über Wasserstoffbrücken aneinander fest. Schritt 2 ist falsch: Öl- und Wassermoleküle ziehen sich ein wenig an (Dispersionskräfte); sie stoßen sich nicht ab. Schritt 3 ist falsch, weil er auf Schritt 2 aufbaut: Die Schichten entstehen, weil die Wassermoleküle zusammenbleiben und das Öl ausschließen, nicht weil irgendetwas drückt.'),
  } as FlawItem,

  deeper: {
    id: 'u11-deeper', unit: 11, kind: 'choice', format: 'why', withConfidence: true, evidence: 'transfer', concepts: ['u11.like', 'u11.network'], targets: ['dissolving-is-melting'],
    prompt: b('Pour 50 mL of ethanol into 50 mL of water and stir: you get only about 96 mL of mixture, although nothing escapes and the mass stays the same. Which explanation fits best?',
      'Gießt man 50 mL Ethanol zu 50 mL Wasser und rührt um, erhält man nur etwa 96 mL Gemisch, obwohl nichts entweicht und die Masse gleich bleibt. Welche Erklärung passt am besten?'),
    options: [
      { text: b('Some ethanol evaporates while the two are mixed', 'Ein Teil des Ethanols verdunstet beim Mischen') },
      { text: b('Ethanol and water react to a new, denser substance', 'Ethanol und Wasser reagieren zu einem neuen, dichteren Stoff') },
      { text: b('Ethanol and water molecules hydrogen-bond to each other and pack more closely than in either pure liquid', 'Ethanol- und Wassermoleküle bilden untereinander Wasserstoffbrücken und rücken enger zusammen als in jeder der reinen Flüssigkeiten'), correct: true },
      { text: b('The ethanol melts into the gaps of the water', 'Das Ethanol schmilzt in die Lücken des Wassers hinein'), mis: 'dissolving-is-melting' },
    ],
    explain: b('Each liquid on its own leaves gaps: water\'s open hydrogen-bond network and ethanol\'s bulky chains. Mixed, ethanol\'s O–H group joins water\'s network and the molecules fit into each other\'s gaps, so the same mass takes up less room. Nothing reacts, nothing is lost: the volumes of mixed liquids simply need not add up.',
      'Jede Flüssigkeit für sich lässt Lücken: das offene Netzwerk der Wasserstoffbrücken im Wasser und die sperrigen Ketten des Ethanols. Gemischt wird die Hydroxygruppe des Ethanols Teil des Netzwerks, und die Moleküle füllen gegenseitig ihre Lücken; dieselbe Masse braucht deshalb weniger Platz. Nichts reagiert, nichts geht verloren: Die Volumina gemischter Flüssigkeiten müssen sich einfach nicht addieren.'),
  } as ChoiceItem,

  explain: {
    prompt: b('In your own words: what holds water together, why does ice float, and why does salt dissolve in water while oil does not?', 'In eigenen Worten: Was hält Wasser zusammen, warum schwimmt Eis, und warum löst sich Salz in Wasser, Öl aber nicht?'),
    ideas: [
      { id: 'network', concept: 'u11.network', idea: b('Each water molecule can join four hydrogen bonds (two through its H atoms, two through its lone pairs): water is a network', 'Jedes Wassermolekül kann an vier Wasserstoffbrücken beteiligt sein (zwei über seine H-Atome, zwei über seine freien Elektronenpaare): Wasser ist ein Netzwerk'),
        en: new RegExp(`(${together(HB_EN, NET_EN)}|(four|\\b4) (hydrogen bonds|h-bonds|h bonds|neighbou?rs|partners)|(two|2) (h|hydrogen)( atoms)?.{0,40}(two|2) lone pairs|(two|2) lone pairs.{0,40}(two|2) (h|hydrogen)|(hydrogen|\\bh)( atoms?| ends?)? of one (water )?molecule.{0,50}(oxygen|lone pair|negative end) of (another|the next|a neighbou?r))`),
        de: new RegExp(`(${together(HB_DE, NET_DE)}|(vier|\\b4) (nachbarn|bindungspartner)|(zwei|2) (h-atome|wasserstoffatome).{0,40}(zwei|2) (freie )?(elektronen)?paare|(zwei|2) (freie )?(elektronen)?paare.{0,40}(zwei|2) (h-atome|wasserstoffatome)|(zwei|2) (über|via|durch|mit) (die |den |seine )?(h|h-atome|wasserstoff\\w*)\\b.{0,30}(zwei|2) (über|via|durch|mit) (die |seine )?(freie\\w* )?(ep|elektronenpaar\\w*|paare)|(max\\w*|bis zu|höchstens) (vier|4)\\b.{0,60}(netz\\w*|nachbar\\w*|brücke\\w*))`) },
      { id: 'ice', concept: 'u11.ice', idea: b('In ice the molecules form an open network with gaps, so ice is less dense than liquid water and floats', 'Im Eis bilden die Moleküle ein offenes Netzwerk mit Lücken, deshalb hat Eis eine geringere Dichte als flüssiges Wasser und schwimmt'), contra: ICE_DENSER,
        en: new RegExp(`(${together(ICE_EN, LESS_EN)}|density anomaly|anomal\\w* (of|in) water)`),
        de: new RegExp(`(${together(ICE_DE, LESS_DE)}|dichteanomalie|anomalie des wassers)`) },
      { id: 'like', concept: 'u11.like', idea: b('A substance mixes into water easily when it attracts water about as strongly as water attracts itself: like dissolves like', 'Ein Stoff mischt sich leicht mit Wasser, wenn er Wasser etwa so stark anzieht wie Wasser sich selbst: Ähnliches löst sich in Ähnlichem'),
        en: /(like dissolves (in )?like|similar (substances |molecules |things )?dissolve|\bpolar\b.{0,40}(dissolves?|mix\w*|soluble).{0,40}(polar|water)|non-?polar.{0,40}(dissolves?|mix\w*|soluble).{0,40}(non-?polar|oil|fat|hexane)|(dissolv\w*|mix\w*|soluble).{0,90}(as strong(ly)?|about as|just as|equally strong|comparable|new attractions?|make up for|replac\w*|in return|in exchange|give back|offers? (water )?(something|hydrogen bonds|bonds))|(dissolv\w*|mix\w*|soluble).{0,60}(hydrogen[- ]?bond\w*|h-bond\w*) (with|to) (the )?water|(hydrophilic|water-loving).{0,40}(dissolv\w*|mix\w*|soluble)|dissolves? (other )?(polar|ionic|hydrophilic))/,
        de: /(ähnliches löst sich in ähnlichem|gleiches löst sich in gleichem|similia similibus|(polar|hydrophil)\w*.{0,50}(lös|misch)\w*.{0,50}(polar|wasser|hydrophil)|(unpolar|hydrophob|lipophil)\w*.{0,50}(lös|misch)\w*.{0,50}(unpolar|lipophil|hydrophob|öl|fett|benzin|hexan)|(lös|misch)\w*.{0,90}(genauso stark|ebenso stark|etwa so stark|ähnlich stark|gleich stark|neue anziehung\w*|ersetz\w*|ausgleich\w*|im gegenzug|zurückbind\w*)|(lös|misch)\w*.{0,60}(wasserstoffbrücke\w*|h-brücke\w*) (mit|zum|zu) (dem )?wasser|löst (andere )?(polare|ionische|hydrophile))/ },
      { id: 'hydration', concept: 'u11.hydration', idea: b('Water dissolves a salt by surrounding each ion: δ− oxygen ends towards the cations, δ+ hydrogen ends towards the anions (hydration)', 'Wasser löst ein Salz, indem es jedes Ion umhüllt: δ−-Sauerstoff-Enden zu den Kationen, δ+-Wasserstoff-Enden zu den Anionen (Hydratation)'), contra: MELT_OR_MOLECULES,
        en: /(hydrat(ion|ed)|(surround\w*|wrap\w*|encircl\w*|cluster\w* (a)?round|shells?|cage\w*|crowd\w* (a)?round|enclos\w*|coat\w*).{0,60}(\bions?\b|na\+|cl-|sodium|chloride|cations?|anions?)|(\bions?\b|na\+|cl-|sodium|chloride|cations?|anions?).{0,60}(surrounded|wrapped|encircled|shells?|enclosed|coated)|(oxygen|\bo\b|δ-|delta-|negative) (ends?|sides?|atoms?|poles?).{0,60}(na\+|sodium|cations?|positive ions?)|(hydrogen|\bh\b|δ\+|delta\+|positive) (ends?|sides?|atoms?|poles?).{0,60}(cl-|chloride|anions?|negative ions?)|water (molecules )?(pull|tear|drag|take|lift|carry|pluck)\w* (the )?(ions|na\+|cl-))/,
        de: /(hydrat\w*|(umgeb\w*|umhüll\w*|umring\w*|eingehüllt|einhüll\w*|hülle).{0,60}(\bion\w*|na\+|cl-|natrium|chlorid|kation\w*|anion\w*)|(\bion\w*|na\+|cl-|kation\w*|anion\w*).{0,60}(umgeben|umhüllt|hülle|eingehüllt|umringt)|(sauerstoff|\bo\b|δ-|negative[nrs]? (pol|ende|seite)).{0,60}(na\+|natrium|kation\w*|positive\w* ion\w*)|(wasserstoff|\bh\b|δ\+|positive[nrs]? (pol|ende|seite)).{0,60}(cl-|chlorid|anion\w*|negative\w* ion\w*)|wassermoleküle (ziehen|reißen|lösen|holen|zerren) (die )?(ionen|na\+|cl-))/ },
      { id: 'norepel', concept: 'u11.no-repulsion', idea: b('Oil and water do not repel: water molecules attract each other more strongly than they attract oil, so they keep together and leave the oil out', 'Öl und Wasser stoßen sich nicht ab: Wassermoleküle ziehen sich untereinander stärker an als Öl, bleiben zusammen und lassen das Öl draußen'), contra: REPEL,
        en: /(do not repel|don't repel|doesn't repel|does not repel|not repel|aren't repelled|are not repelled|no repulsion|without (any )?repulsion|not pushed (away|apart)|nothing push\w*|not because (it|they|oil|hexane|the oil)\b.{0,15}repel\w*|(restructur\w*|reorgani[sz]\w*|re-?order\w*|ordered cage|form\w* (a |an )?(ordered )?cage|cage\w* (a)?round).{0,60}(oil|hexane|hydrocarbon|chain|nonpolar|it\b)|(oil|hexane|hydrocarbon|chain|nonpolar)\w*.{0,60}(restructur\w*|reorganis\w*|ordered cage|cage)|(water|water molecules?|they)\b.{0,50}(attract|stick|cling|hold|bond|pull|prefer|bind|stay|keep)\w*.{0,30}(each other|itself|one another|other water( molecules)?|themselves|together).{0,60}(more|stronger|strongly|better|rather|instead|than|leav\w*|left|exclud\w*|squeez\w*|\bout\b)|(oil|hexane|fat|grease|nonpolar|wax)\w*.{0,80}\b(water|water molecules?)\b.{0,50}(each other|itself|one another|themselves|together)|(oil|hexane|fat|grease)( and water)? (don't mix|do not mix|doesn't mix|does not mix|won't mix) because water|(doesn't dissolve in water|does not dissolve in water|don't dissolve in water|do not dissolve in water|doesn't mix with water|does not mix with water|don't mix with water|do not mix with water),? because water( molecules)?.{0,40}(each other|itself|one another|themselves))/,
        de: /(stoßen sich nicht ab|stößt sich nicht ab|stoßen einander nicht ab|keine abstoßung|nicht abgestoßen|ohne abstoßung|nicht durch abstoßung|nicht,? weil .{0,30}(abstoß\w*|stoß\w* .{0,15}\bab\b)|(geordnete\w* käfig|käfig .{0,20}(um|herum)|ordnen sich .{0,40}(um|herum)).{0,60}(öl|hexan|kette|unpolar|kohlenwasserstoff|es\b)?|(wasser\w*|sie)\b.{0,50}(zieh|halt|hält|bind|bleib|kleb|häng)\w*.{0,30}(gegenseitig|untereinander|einander|unter sich|sich selbst|zusammen|aneinander).{0,60}(stärker|mehr|lieber|fester|besser|\bals\b|übrig|heraus|raus|verdräng\w*|ausgeschlossen|draußen|ausschließ\w*)|(öl|fett|hexan|benzin|wachs|unpolar)\w*.{0,90}\bwasser\w*\b.{0,50}(gegenseitig|untereinander|einander|unter sich|sich selbst|zusammen|aneinander)|wasser\w*\b.{0,30}(gegenseitig|untereinander|einander|aneinander)\b.{0,30}(stärker|mehr|lieber|fester)\b.{0,20}(an\b|zieh\w*|halt\w*|hält|bind\w*|fest\w*)|wasser\w*\b.{0,30}\blieber\b.{0,50}(untereinander|miteinander|einander|mit sich selbst|unter sich|aneinander)|(löst sich nicht in wasser|lösen sich nicht in wasser|mischt sich nicht mit wasser|mischen sich nicht mit wasser|mischen sich nicht weil|mischen sich nicht, weil|nicht mischbar, weil|nicht mischbar weil|vermischen sich nicht, weil|vermischen sich nicht weil),? (weil )?(sich )?(die )?wasser\w*.{0,40}(gegenseitig|untereinander|einander|aneinander|unter sich|sich selbst))/ },
    ] as Idea[],
    tightened: b('Each water molecule can take part in four hydrogen bonds, two through its H atoms and two through the lone pairs on its oxygen, so liquid water is a constantly shifting network. In ice every molecule holds exactly four neighbours in an open network with gaps, so ice is less dense than liquid water and floats. A substance mixes into water easily when its molecules attract water about as strongly as water attracts itself; the natural tendency of molecules to spread out then does the rest: small polar and hydrogen-bonding molecules mix in, nonpolar ones and molecules with large nonpolar parts do not (like dissolves like). Salt dissolves because water molecules surround each ion, the δ− oxygen ends towards Na⁺ and the δ+ hydrogen ends towards Cl⁻. Oil and water do not repel each other: water molecules simply attract each other more strongly than they attract oil, so they keep together and leave the oil as a separate layer; next to oil they could keep their hydrogen bonds only in an ordered cage, which costs them freedom.',
      'Jedes Wassermolekül kann an vier Wasserstoffbrücken beteiligt sein, zwei über seine H-Atome und zwei über die freien Elektronenpaare am Sauerstoff; flüssiges Wasser ist deshalb ein ständig umgebautes Netzwerk. Im Eis hält jedes Molekül genau vier Nachbarn in einem offenen Netzwerk mit Lücken, deshalb hat Eis eine geringere Dichte als flüssiges Wasser und schwimmt (Dichteanomalie). Ein Stoff mischt sich leicht mit Wasser, wenn seine Moleküle Wasser etwa so stark anziehen wie Wasser sich selbst; den Rest erledigt die natürliche Neigung der Moleküle, sich zu verteilen: Kleine polare Moleküle und solche mit Wasserstoffbrücken mischen sich mit Wasser, unpolare und solche mit großen unpolaren Teilen nicht („Gleiches löst sich in Gleichem“, auch: „Ähnliches löst sich in Ähnlichem“). Salz löst sich, weil Wassermoleküle jedes Ion umhüllen (Hydrathülle), die δ−-Sauerstoff-Enden zum Na⁺, die δ+-Wasserstoff-Enden zum Cl⁻. Öl und Wasser stoßen sich nicht ab: Wassermoleküle ziehen sich untereinander einfach stärker an als Öl, bleiben zusammen und lassen das Öl als eigene Schicht übrig; neben Öl könnten sie ihre Wasserstoffbrücken nur in einem geordneten Käfig behalten, und das kostet Bewegungsfreiheit.'),
  },

  terms: ['h-bond', 'hydration', 'solubility', 'hydrophilic', 'hydrophobic'],

  readings: [
    {
      lang: 'en', kind: 'quick',
      title: b('Water', 'Water'), source: 'OpenStax Biology 2e, section 2.2',
      url: 'https://openstax.org/books/biology-2e/pages/2-2-water',
      lookFor: [
        b('The "sphere of hydration": which end of a water molecule faces Na⁺, and which faces Cl⁻? Compare it with the salt in the Particle Box.', ''),
        b('Its reason why ice floats: what happens to the molecules when water freezes? Compare it with ice at 0.917 g/cm³.', ''),
        b('The words hydrophilic and hydrophobic. Does the page say water repels oil, or that oil does not interact well with water?', ''),
      ],
    },
    {
      lang: 'en', kind: 'deeper',
      title: b('The Dissolution Process', 'The Dissolution Process'), source: 'OpenStax Chemistry 2e, section 11.1',
      url: 'https://openstax.org/books/chemistry-2e/pages/11-1-the-dissolution-process',
      lookFor: [
        b('Its step-by-step view of dissolving: which attractions must be broken, and which form? Apply it to hexane and to ethanol in water.', ''),
        b('Calcium carbonate: what reason does it give for this salt barely dissolving? Compare it with the limestone example.', ''),
        b('Methanol and ethanol, or pentane and hexane: why do they mix with almost no energy change?', ''),
      ],
    },
    {
      lang: 'de', kind: 'quick',
      title: b('Anomalie des Wassers', 'Anomalie des Wassers'), source: 'Lernhelfer Schülerlexikon',
      url: 'https://www.lernhelfer.de/schuelerlexikon/biologie-abitur/artikel/anomalie-des-wassers',
      lookFor: [
        b('', 'Die Dichte von Eis: Der Artikel nennt etwa 0,92 g/cm³, die App 0,917 g/cm³. Passt das zusammen?'),
        b('', 'Bei welcher Temperatur ist Wasser am dichtesten, und wo bleibt deshalb im Winter das 4 °C kalte Wasser? Vergleiche mit der Vorhersage zum See.'),
        b('', 'Die sechseckigen Hohlräume im Eis: Wie kommen sie zustande? In der Teilchenbox hält im Eis jedes Molekül vier Nachbarn.'),
      ],
    },
  ],

  misconceptions: [
    { id: 'oil-water-repel', name: b('Oil and water repel each other', 'Öl und Wasser stoßen sich ab') },
    { id: 'ice-denser', name: b('Water gets denser all the way to freezing, so ice should sink', 'Wasser wird bis zum Gefrieren immer dichter, also müsste Eis sinken') },
    { id: 'dissolving-is-melting', name: b('Dissolving is melting', 'Lösen ist Schmelzen') },
    { id: 'salt-molecules-in-water', name: b('Dissolved salt is NaCl molecules', 'Gelöstes Salz besteht aus NaCl-Molekülen') },
    { id: 'oh-group-decides', name: b('An O–H group alone makes a molecule dissolve in water, whatever the chain', 'Eine O–H-Gruppe allein macht ein Molekül wasserlöslich, egal wie lang die Kette ist') },
  ],

  glossary: {
    hydration: {
      en: 'hydration', de: 'Hydratation', unit: 11,
      def: { en: 'Water molecules gathering around a dissolved ion, each turned with its oppositely charged end towards it: a hydration shell.', de: 'Wassermoleküle lagern sich um ein gelöstes Ion, jedes mit dem entgegengesetzt geladenen Ende zu ihm hin: eine Hydrathülle.' },
      falseFriend: { en: 'German calls the shell itself "Hydrathülle". Not the same as hydrogenation (adding hydrogen).', de: 'Englisch „hydration shell“. Nicht verwechseln mit Hydrierung (Anlagerung von Wasserstoff).' },
    },
    solubility: {
      en: 'solubility', de: 'Löslichkeit', unit: 11,
      def: { en: 'How much of a substance dissolves in a given amount of solvent at a given temperature, for example grams per 100 g of water at 20 °C.', de: 'Wie viel von einem Stoff sich in einer bestimmten Menge Lösungsmittel bei einer bestimmten Temperatur löst, zum Beispiel Gramm pro 100 g Wasser bei 20 °C.' },
    },
    hydrophilic: {
      en: 'hydrophilic', de: 'hydrophil', unit: 11,
      def: { en: '"Water-loving": polar or charged, so it mixes with or dissolves in water, like ethanol, sugar or salt.', de: '„Wasserliebend“: polar oder geladen, mischt oder löst sich also in Wasser, wie Ethanol, Zucker oder Salz.' },
    },
    hydrophobic: {
      en: 'hydrophobic', de: 'hydrophob', unit: 11,
      def: { en: '"Water-avoiding": nonpolar, so water molecules keep to themselves and leave it out, like oil, fat or hexane. Nothing repels it; water simply attracts itself more.', de: '„Wassermeidend“: unpolar, also bleiben die Wassermoleküle unter sich und lassen den Stoff draußen, wie Öl, Fett oder Hexan. Nichts stößt ihn ab; Wasser zieht sich einfach stärker selbst an.' },
      falseFriend: { en: 'German school books often say "lipophil" (fat-loving) for the same substances.', de: 'Oft auch „lipophil“ (fettliebend) genannt.' },
    },
  },
};
