import type { Bi } from '../../i18n';
import type { Item } from '../items';

const b = (en: string, de: string): Bi => ({ en, de });

// Unit 7 question bank: at least three variants per concept (predict, why, transfer), every trap option tagged.
// Data: conductivities from CONDUCTIVITY in substances.ts and the Engineering ToolBox table of conductors
// (copper 5.96 × 10⁷ S/m, deionised water 5.5 × 10⁻⁶ S/m, drinking water 0.0005–0.05 S/m). Melting points from
// elements.ts: Na 97.8 °C, Mg 649.9 °C, Al 660.3 °C, Hg −38.8 °C; NaCl 801 °C (ions.ts). Silicon dioxide (quartz)
// melts at about 1700 °C (CRC Handbook). Solid ion conductors that let lithium ions hop through a ceramic are used
// in solid-state battery research.
export const BANK_U7: Item[] = [
  // ---- u7.carriers ----
  { id: 'i7a', unit: 7, kind: 'choice', format: 'predict', withConfidence: true, concepts: ['u7.carriers'], targets: ['every-solution-conducts', 'polarity-conduction'],
    prompt: b('Copper, molten salt and salt water all conduct electricity. What do all three have in common?', 'Kupfer, geschmolzenes Salz und Salzlösung leiten alle Strom. Was haben alle drei gemeinsam?'),
    options: [
      { text: b('They all contain metal atoms', 'Sie enthalten alle Metallatome') },
      { text: b('They all contain charged particles that can move', 'Sie enthalten alle geladene Teilchen, die sich bewegen können'), correct: true },
      { text: b('They are all liquid or dissolved', 'Sie sind alle flüssig oder gelöst'), mis: 'every-solution-conducts' },
      { text: b('They all contain strongly polar bonds', 'Sie enthalten alle stark polare Bindungen'), mis: 'polarity-conduction' },
    ],
    explain: b('Copper has electrons that are free to move, molten salt and salt water have ions that are free to move. Copper is a solid with no polar bonds at all: what the three share is charge that can travel.', 'Kupfer hat frei bewegliche Elektronen, geschmolzenes Salz und Salzlösung haben frei bewegliche Ionen. Kupfer ist ein Feststoff ganz ohne polare Bindungen: Gemeinsam ist den dreien Ladung, die wandern kann.') },
  { id: 'i7b', unit: 7, kind: 'choice', format: 'why', evidence: 'explain', withConfidence: true, concepts: ['u7.carriers'], targets: ['polarity-conduction', 'every-solution-conducts'],
    prompt: b('Why does a substance need charged particles that can move in order to conduct?', 'Warum braucht ein Stoff geladene Teilchen, die sich bewegen können, um Strom zu leiten?'),
    options: [
      { text: b('Polar molecules turning to face the plates are the current', 'Polare Moleküle, die sich zu den Platten drehen, sind der Strom'), mis: 'polarity-conduction' },
      { text: b('Only liquids can carry charge, and moving particles make a substance liquid', 'Nur Flüssigkeiten können Ladung tragen, und bewegliche Teilchen machen einen Stoff flüssig'), mis: 'every-solution-conducts' },
      { text: b('A current is charge on the move: something charged has to travel towards the other plate', 'Strom ist bewegte Ladung: Etwas Geladenes muss zur anderen Platte wandern'), correct: true },
    ],
    explain: b('An electric current is moving charge. Electrons in a metal and ions in a melt can travel towards the plate of opposite charge. Neutral molecules and ions locked in a lattice cannot, so they carry no current.', 'Elektrischer Strom ist bewegte Ladung. Elektronen im Metall und Ionen in einer Schmelze können zur Platte mit der Gegenladung wandern. Ungeladene Moleküle und Ionen, die im Gitter festsitzen, können das nicht und tragen keinen Strom.') },
  { id: 'i7c', unit: 7, kind: 'choice', format: 'predict', evidence: 'transfer', withConfidence: true, concepts: ['u7.carriers', 'u7.metallic'], targets: ['metal-cores-carry'],
    prompt: b('Mercury is a metal that is liquid at room temperature (it melts at −38.8 °C). Does liquid mercury conduct, and what carries the current?', 'Quecksilber ist ein Metall, das bei Raumtemperatur flüssig ist (es schmilzt bei −38,8 °C). Leitet flüssiges Quecksilber, und was trägt den Strom?'),
    options: [
      { text: b('No: a liquid needs dissolved salt before it can conduct', 'Nein: Eine Flüssigkeit braucht erst gelöstes Salz, um zu leiten') },
      { text: b('Yes: mercury atom cores wander through the liquid and carry it', 'Ja: Die Atomrümpfe des Quecksilbers wandern durch die Flüssigkeit und tragen ihn'), mis: 'metal-cores-carry' },
      { text: b('Yes: free electrons, as in every metal', 'Ja: freie Elektronen, wie in jedem Metall'), correct: true },
      { text: b('No: mercury is a single element, so it has nothing charged in it', 'Nein: Quecksilber ist ein einzelnes Element, also hat es nichts Geladenes in sich') },
    ],
    explain: b('Liquid or solid, a metal keeps its sea of free electrons, and they carry the current. Mercury conducts, which is why it was once used in electrical switches. The cores drift about in the liquid, but the battery moves the electrons along, not the cores.', 'Ob flüssig oder fest: Ein Metall behält sein Elektronengas, und diese freien Elektronen tragen den Strom. Quecksilber leitet; deshalb wurde es früher in elektrischen Schaltern verwendet. Die Atomrümpfe bewegen sich in der Flüssigkeit zwar ungeordnet, aber die Batterie schiebt die Elektronen an, nicht die Atomrümpfe.') },

  // ---- u7.metallic ----
  { id: 'i7d', unit: 7, kind: 'choice', format: 'predict', withConfidence: true, concepts: ['u7.metallic'], targets: ['metal-cores-carry'],
    prompt: b('A lamp is switched on. Which particles move along the copper wire that feeds it?', 'Eine Lampe wird eingeschaltet. Welche Teilchen bewegen sich im Kupferdraht, der sie versorgt?'),
    options: [
      { text: b('The positive copper atom cores', 'Die positiven Atomrümpfe des Kupfers'), mis: 'metal-cores-carry' },
      { text: b('Electrons, while the atom cores stay in place', 'Elektronen, während die Atomrümpfe an ihrem Platz bleiben'), correct: true },
      { text: b('Both: the cores one way, the electrons the other way', 'Beide: die Atomrümpfe in die eine Richtung, die Elektronen in die andere'), mis: 'metal-cores-carry' },
    ],
    explain: b('In a metal only the outer electrons are free. The positive atom cores stay at their places in the lattice and only vibrate. The electrons drift from the negative pole through the wire towards the positive pole.', 'Im Metall sind nur die Außenelektronen frei. Die positiven Atomrümpfe bleiben an ihren Plätzen im Gitter und schwingen nur. Die Elektronen wandern vom Minuspol durch den Draht zum Pluspol.') },
  { id: 'i7e', unit: 7, kind: 'choice', format: 'why', evidence: 'explain', withConfidence: true, concepts: ['u7.metallic', 'u7.salt-solid'], targets: ['metal-cores-carry'],
    prompt: b('Why does a metal conduct as a solid, while solid salt does not?', 'Warum leitet ein Metall als Feststoff, festes Salz aber nicht?'),
    options: [
      { text: b('Metals melt at lower temperatures than salts', 'Metalle schmelzen bei tieferen Temperaturen als Salze') },
      { text: b('In a metal the positive ions can slide through the lattice', 'Im Metall können die positiven Ionen durch das Gitter gleiten'), mis: 'metal-cores-carry' },
      { text: b('Metal atoms are lined up in neat rows, salt ions are not', 'Metallatome stehen in ordentlichen Reihen, Salz-Ionen nicht') },
      { text: b('A metal\'s outer electrons belong to no single atom and roam the whole lattice; in salt every electron belongs to an ion held in place', 'Die Außenelektronen eines Metalls gehören keinem einzelnen Atom und bewegen sich durch das ganze Gitter; im Salz gehört jedes Elektron zu einem Ion, das festsitzt'), correct: true },
    ],
    explain: b('Both are regular lattices. The difference is what can move: in a metal the electron sea flows freely around fixed cores; in salt the electrons are held by the ions, and the ions are held by their neighbours. Many metals melt far above salt: tungsten at over 3400 °C still conducts as a solid.', 'Beides sind regelmäßige Gitter. Der Unterschied ist, was sich bewegen kann: Im Metall fließt das Elektronengas frei um die festen Atomrümpfe; im Salz halten die Ionen ihre Elektronen fest, und die Ionen werden von ihren Nachbarn festgehalten. Viele Metalle schmelzen weit höher als Salz: Wolfram, Schmelzpunkt über 3400 °C, leitet als Feststoff trotzdem.') },
  { id: 'i7f', unit: 7, kind: 'choice', format: 'why', evidence: 'transfer', withConfidence: true, concepts: ['u7.metallic', 'u7.bond-types'], targets: ['brittle-means-weak'],
    prompt: b('Gold can be hammered into leaf thinner than a hair without breaking, while a salt crystal shatters. Why can metals bend?', 'Gold lässt sich zu Blattgold hämmern, dünner als ein Haar, ohne zu brechen, ein Salzkristall dagegen zerspringt. Warum können sich Metalle verformen?'),
    options: [
      { text: b('When layers of cores slide, they stay in the same electron sea, so no like charges are pushed together', 'Wenn Schichten von Atomrümpfen gleiten, bleiben sie im selben Elektronengas, und keine gleichen Ladungen werden aneinandergedrückt'), correct: true },
      { text: b('Salt\'s bonds are weaker than a metal\'s, so salt breaks first', 'Die Bindungen im Salz sind schwächer als im Metall, also bricht Salz zuerst'), mis: 'brittle-means-weak' },
      { text: b('Gold atoms are heavy, and heavy atoms are soft', 'Goldatome sind schwer, und schwere Atome sind weich') },
      { text: b('Metals are made of small molecules that slide past each other', 'Metalle bestehen aus kleinen Molekülen, die aneinander vorbeigleiten') },
    ],
    explain: b('Shift one layer of a metal and every core still sits in the same sea of electrons that holds it, so the bonding survives the shift. In salt a shift puts like charges side by side and the layers repel (unit 4). Salt is not weakly bonded: it melts at 801 °C, gold at 1064 °C.', 'Verschiebt man eine Schicht in einem Metall, sitzt jeder Atomrumpf immer noch im selben Elektronengas, das ihn hält; die Bindung übersteht die Verschiebung. Im Salz bringt eine Verschiebung gleiche Ladungen nebeneinander, und die Schichten stoßen sich ab (Einheit 4). Schwach gebunden ist Salz nicht: Es schmilzt bei 801 °C, Gold bei 1064 °C.') },
  { id: 'i7g', unit: 7, kind: 'choice', format: 'predict', withConfidence: true, concepts: ['u7.metallic'], table: 'outer',
    prompt: b('In the simple model, each sodium atom gives one electron to the electron sea, each magnesium atom two. Sodium melts at 97.8 °C. Magnesium melts…', 'Im einfachen Modell gibt jedes Natriumatom ein Elektron an das Elektronengas ab, jedes Magnesiumatom zwei. Natrium schmilzt bei 97,8 °C. Magnesium schmilzt…'),
    options: [
      { text: b('at about the same temperature: both are metals of period 3', 'bei etwa derselben Temperatur: Beide sind Metalle der 3. Periode') },
      { text: b('lower: more electrons in the sea push the cores apart', 'tiefer: Mehr Elektronen im Elektronengas drücken die Atomrümpfe auseinander') },
      { text: b('much higher: a denser electron sea and doubly charged cores hold together more strongly', 'viel höher: Ein dichteres Elektronengas und doppelt geladene Atomrümpfe halten stärker zusammen'), correct: true },
    ],
    explain: b('Magnesium melts at 649.9 °C. Each core carries 2+ instead of 1+, and twice as many electrons hold the cores together, so the metallic bonding is much stronger. Aluminium, with three outer electrons, melts at 660.3 °C: the trend continues, but less steeply.', 'Magnesium schmilzt bei 649,9 °C. Jeder Atomrumpf trägt 2+ statt 1+, und doppelt so viele Elektronen halten die Atomrümpfe zusammen; die Metallbindung ist deshalb viel stärker. Aluminium mit drei Außenelektronen schmilzt bei 660,3 °C: Der Trend setzt sich fort, aber flacher.') },

  // ---- u7.salt-solid ----
  { id: 'i7h', unit: 7, kind: 'choice', format: 'predict', withConfidence: true, concepts: ['u7.salt-solid'], targets: ['ions-need-melting'],
    prompt: b('Dry salt crystals are packed between two electrodes and the battery is connected. What does the lamp do?', 'Trockene Salzkristalle werden zwischen zwei Elektroden gepackt, und die Batterie wird angeschlossen. Was macht die Lampe?'),
    options: [
      { text: b('It stays off: salt contains no ions until it dissolves', 'Sie bleibt aus: Salz enthält erst Ionen, wenn es sich löst'), mis: 'ions-need-melting' },
      { text: b('It lights: salt is made of ions', 'Sie leuchtet: Salz besteht aus Ionen') },
      { text: b('It stays off: the ions are there, but held in place in the lattice', 'Sie bleibt aus: Die Ionen sind da, sitzen aber fest im Ionengitter'), correct: true },
    ],
    explain: b('Solid salt is made entirely of {{Na+}} and {{Cl-}} ions, but each one is locked among six neighbours of opposite charge. They vibrate in place and cannot travel to a plate, so practically no current flows.', 'Festes Salz besteht ganz aus {{Na+}}- und {{Cl-}}-Ionen, aber jedes sitzt fest zwischen sechs Nachbarn mit Gegenladung. Sie schwingen an ihrem Platz und können nicht zu einer Platte wandern; es fließt praktisch kein Strom.') },
  { id: 'i7i', unit: 7, kind: 'choice', format: 'why', evidence: 'explain', withConfidence: true, concepts: ['u7.salt-solid'], targets: ['ionic-molecules', 'ions-need-melting'],
    prompt: b('Solid sodium chloride is made entirely of charged particles. Why does it not conduct?', 'Festes Natriumchlorid besteht ganz aus geladenen Teilchen. Warum leitet es nicht?'),
    options: [
      { text: b('The charges are hidden inside neutral NaCl molecules', 'Die Ladungen stecken in ungeladenen NaCl-Molekülen'), mis: 'ionic-molecules' },
      { text: b('The ions only form once the salt dissolves or melts', 'Die Ionen entstehen erst, wenn das Salz sich löst oder schmilzt'), mis: 'ions-need-melting' },
      { text: b('Each ion is locked among neighbours of opposite charge and can only vibrate in place', 'Jedes Ion sitzt zwischen Nachbarn mit Gegenladung fest und kann nur an seinem Platz schwingen'), correct: true },
      { text: b('The ions are too heavy for a battery to push', 'Die Ionen sind zu schwer, als dass eine Batterie sie schieben könnte') },
    ],
    explain: b('The ions are there all along, in a lattice with no molecules (unit 4). What is missing is movement: every ion is held by its six neighbours. Melt the salt or dissolve it, and the same ions are free to travel. Weight is not the problem: the same ions carry the current in the melt.', 'Die Ionen sind die ganze Zeit da, in einem Ionengitter ohne Moleküle (Einheit 4). Was fehlt, ist Beweglichkeit: Jedes Ion wird von seinen sechs Nachbarn festgehalten. Schmilzt oder löst man das Salz, können dieselben Ionen wandern. Am Gewicht liegt es nicht: In der Schmelze tragen genau diese Ionen den Strom.') },
  { id: 'i7j', unit: 7, kind: 'choice', format: 'predict', evidence: 'transfer', withConfidence: true, concepts: ['u7.salt-solid', 'u7.carriers'], targets: ['polarity-conduction'],
    prompt: b('Some solid ceramics used in research on solid-state batteries let lithium ions through, although they are solid salts. What must be different about them?', 'Manche festen Keramiken, an denen für Feststoffbatterien geforscht wird, lassen Lithium-Ionen durch, obwohl sie feste Salze sind. Was muss an ihnen anders sein?'),
    options: [
      { text: b('Their lattice has gaps and channels through which one kind of ion can hop', 'Ihr Gitter hat Lücken und Kanäle, durch die eine Ionensorte springen kann'), correct: true },
      { text: b('They contain a sea of free electrons, like a metal', 'Sie enthalten ein Elektronengas aus freien Elektronen wie ein Metall') },
      { text: b('Their ions are more polar, and polar particles conduct', 'Ihre Ionen sind polarer, und polare Teilchen leiten'), mis: 'polarity-conduction' },
    ],
    explain: b('The rule is about movement, not state: charge carriers have to be able to travel. In these special ceramics the small lithium ions find open paths through the lattice and can hop from site to site, while the other ions stay put. In ordinary salt every site is filled, so nothing gets through.', 'Die Regel handelt von Beweglichkeit, nicht vom Aggregatzustand: Ladungsträger müssen wandern können. In diesen besonderen Keramiken finden die kleinen Lithium-Ionen offene Wege durch das Gitter und springen von Platz zu Platz, während die anderen Ionen bleiben. In gewöhnlichem Salz ist jeder Platz besetzt, also kommt nichts durch.') },

  // ---- u7.salt-free ----
  { id: 'i7k', unit: 7, kind: 'choice', format: 'predict', withConfidence: true, concepts: ['u7.salt-free'], targets: ['electrons-through-solution'],
    prompt: b('Molten sodium chloride sits between two electrodes, battery on. Where do the {{Na+}} ions go?', 'Geschmolzenes Natriumchlorid liegt zwischen zwei Elektroden, die Batterie ist angeschlossen. Wohin wandern die {{Na+}}-Ionen?'),
    options: [
      { text: b('To the negative electrode', 'Zur negativen Elektrode'), correct: true },
      { text: b('Nowhere: in a melt only electrons move', 'Nirgendwohin: In einer Schmelze bewegen sich nur Elektronen'), mis: 'electrons-through-solution' },
      { text: b('To the positive electrode', 'Zur positiven Elektrode') },
    ],
    explain: b('Opposite charges attract: positive {{Na+}} ions drift to the negative electrode, negative {{Cl-}} ions to the positive one. The ions themselves carry the charge through the melt; electrons only change hands at the electrodes.', 'Gegensätzliche Ladungen ziehen sich an: Positive {{Na+}}-Ionen wandern zur negativen Elektrode (Minuspol), negative {{Cl-}}-Ionen zur positiven (Pluspol). Die Ionen selbst tragen die Ladung durch die Schmelze; Elektronen wechseln nur an den Elektroden den Besitzer.') },
  { id: 'i7l', unit: 7, kind: 'choice', format: 'why', evidence: 'explain', withConfidence: true, concepts: ['u7.salt-free'], targets: ['electrons-through-solution', 'ionic-molecules', 'ions-need-melting'],
    prompt: b('Why does salt water conduct when solid salt does not?', 'Warum leitet Salzlösung, festes Salz aber nicht?'),
    options: [
      { text: b('Electrons flow through the water from one electrode to the other', 'Elektronen fließen durch das Wasser von einer Elektrode zur anderen'), mis: 'electrons-through-solution' },
      { text: b('In water the ions are no longer held in a lattice and can move to the electrodes', 'Im Wasser sitzen die Ionen nicht mehr im Gitter fest und können zu den Elektroden wandern'), correct: true },
      { text: b('Water turns the salt into NaCl molecules, which carry the charge', 'Wasser verwandelt das Salz in NaCl-Moleküle, die die Ladung tragen'), mis: 'ionic-molecules' },
      { text: b('Salt only forms ions once it is in water', 'Salz bildet erst im Wasser Ionen'), mis: 'ions-need-melting' },
    ],
    explain: b('The ions exist in the solid too. Dissolving frees them from the lattice: each ion is surrounded by water molecules and can drift, {{Na+}} to the negative electrode and {{Cl-}} to the positive one. That moving charge is the current.', 'Die Ionen gibt es auch im Feststoff. Beim Lösen kommen sie aus dem Gitter frei: Jedes Ion ist von Wassermolekülen umgeben und kann wandern, {{Na+}} zur negativen Elektrode und {{Cl-}} zur positiven. Diese bewegte Ladung ist der Strom.') },
  { id: 'i7m', unit: 7, kind: 'choice', format: 'predict', evidence: 'transfer', withConfidence: true, concepts: ['u7.salt-free'], targets: ['electrons-through-solution', 'metal-cores-carry', 'polarity-conduction'],
    prompt: b('A blue solution of copper sulfate, made of {{Cu2+}} and {{SO42-}} ions, conducts well. What carries the current through the solution?', 'Eine blaue Kupfersulfatlösung aus {{Cu2+}}- und {{SO42-}}-Ionen leitet gut. Was trägt den Strom durch die Lösung?'),
    options: [
      { text: b('Electrons, travelling through the water from one electrode to the other', 'Elektronen, die durch das Wasser von einer Elektrode zur anderen wandern'), mis: 'electrons-through-solution' },
      { text: b('Copper atoms, as in a copper wire', 'Kupferatome, wie in einem Kupferdraht'), mis: 'metal-cores-carry' },
      { text: b('Water molecules, turned and pushed by the battery', 'Wassermoleküle, die von der Batterie gedreht und geschoben werden'), mis: 'polarity-conduction' },
      { text: b('{{Cu2+}} ions moving to the negative electrode and {{SO42-}} ions to the positive one', '{{Cu2+}}-Ionen, die zur negativen Elektrode wandern, und {{SO42-}}-Ionen zur positiven'), correct: true },
    ],
    explain: b('It is a solution of a salt, so its ions carry the current, each towards the electrode of opposite charge. A copper wire conducts with electrons; copper sulfate solution conducts with ions. At the negative electrode the {{Cu2+}} ions take electrons and coat it with copper metal, which is how copper plating works.', 'Es ist die Lösung eines Salzes, also tragen seine Ionen den Strom, jedes zur Elektrode mit der Gegenladung. Ein Kupferdraht leitet mit Elektronen, Kupfersulfatlösung mit Ionen. An der negativen Elektrode nehmen die {{Cu2+}}-Ionen Elektronen auf und überziehen sie mit Kupfer; so funktioniert das Verkupfern.') },

  // ---- u7.molecular ----
  { id: 'i7n', unit: 7, kind: 'choice', format: 'predict', withConfidence: true, concepts: ['u7.molecular'], targets: ['polarity-conduction', 'every-solution-conducts'],
    prompt: b('Pure ethanol, the alcohol in drinks, is a polar molecular liquid. Put it between the electrodes. The lamp…', 'Reines Ethanol, der Alkohol in Getränken, ist eine polare Flüssigkeit aus Molekülen. Gib es zwischen die Elektroden. Die Lampe…'),
    options: [
      { text: b('lights: ethanol is polar', 'leuchtet: Ethanol ist polar'), mis: 'polarity-conduction' },
      { text: b('stays dark: its molecules are neutral, with no free charges', 'bleibt aus: Seine Moleküle sind ungeladen, es gibt keine freien Ladungen'), correct: true },
      { text: b('lights: every liquid conducts', 'leuchtet: Jede Flüssigkeit leitet'), mis: 'every-solution-conducts' },
    ],
    explain: b('Ethanol molecules have δ+ and δ− ends, but each molecule is neutral as a whole and stays whole in the liquid. No charge carriers, practically no current.', 'Ethanolmoleküle haben δ+- und δ−-Enden, aber jedes Molekül ist insgesamt ungeladen und bleibt in der Flüssigkeit ganz. Keine Ladungsträger, praktisch kein Strom.') },
  { id: 'i7o', unit: 7, kind: 'choice', format: 'why', evidence: 'explain', withConfidence: true, concepts: ['u7.molecular'], targets: ['polarity-conduction'],
    prompt: b('Sugar water conducts no better than pure water. Why?', 'Zuckerlösung leitet nicht besser als reines Wasser. Warum?'),
    options: [
      { text: b('Sugar dissolves as whole, neutral molecules: no new charges that could move', 'Zucker löst sich als ganze, ungeladene Moleküle: keine neuen Ladungen, die wandern könnten'), correct: true },
      { text: b('Sugar molecules are polar, but they are too big to move', 'Zuckermoleküle sind polar, aber zu groß, um sich zu bewegen'), mis: 'polarity-conduction' },
      { text: b('Sugar does not really dissolve; it only hides between the water molecules', 'Zucker löst sich nicht wirklich; er versteckt sich nur zwischen den Wassermolekülen') },
    ],
    explain: b('Sugar dissolves completely, and its molecules wander freely through the water. But each one is neutral overall: its δ+ and δ− partial charges add up to zero. Moving particles without a net charge carry no current. Size is not the problem: large ions still carry current.', 'Zucker löst sich vollständig, und seine Moleküle bewegen sich frei durch das Wasser. Aber jedes ist insgesamt ungeladen: Seine Partialladungen δ+ und δ− ergeben zusammen null. Bewegte Teilchen ohne Gesamtladung tragen keinen Strom. An der Größe liegt es nicht: Auch große Ionen tragen Strom.') },
  { id: 'i7p', unit: 7, kind: 'choice', format: 'why', evidence: 'transfer', withConfidence: true, concepts: ['u7.molecular', 'u7.carriers'], targets: ['pure-water-conducts', 'polarity-conduction'],
    prompt: b('Pure water conducts about as poorly as sugar water (5.5 × 10⁻⁶ S/m), yet tap water conducts a hundred to ten thousand times better. Why?', 'Reines Wasser leitet etwa so schlecht wie Zuckerlösung (5,5 · 10⁻⁶ S/m), Leitungswasser aber hundert- bis zehntausendmal besser. Warum?'),
    options: [
      { text: b('Tap water contains dissolved minerals, which are ions', 'Leitungswasser enthält gelöste Mineralstoffe, und die sind Ionen'), correct: true },
      { text: b('Water conducts well anyway; tap water just has more of it', 'Wasser leitet ohnehin gut; Leitungswasser hat nur mehr davon'), mis: 'pure-water-conducts' },
      { text: b('Tap-water molecules are more polar than pure-water molecules', 'Moleküle im Leitungswasser sind polarer als die in reinem Wasser'), mis: 'polarity-conduction' },
      { text: b('Pipes add free electrons to the water', 'Die Leitungen geben freie Elektronen an das Wasser ab') },
    ],
    explain: b('Water molecules are the same everywhere. Tap water carries dissolved calcium, magnesium, sodium, chloride and other ions, and those are the charge carriers. Pure water has only a tiny number of {{H3O+}} and {{OH-}} ions.', 'Wassermoleküle sind überall gleich. Leitungswasser enthält gelöste Calcium-, Magnesium-, Natrium-, Chlorid- und andere Ionen, und die sind die Ladungsträger. Reines Wasser hat nur sehr wenige {{H3O+}}- und {{OH-}}-Ionen.') },
  { id: 'i7q', unit: 7, kind: 'choice', format: 'predict', withConfidence: true, concepts: ['u7.molecular'], targets: ['pure-water-conducts', 'electrons-through-solution'],
    prompt: b('Distilled water, with nothing dissolved in it, goes between the electrodes, battery on. What happens?', 'Destilliertes Wasser, in dem nichts gelöst ist, kommt zwischen die Elektroden, die Batterie ist angeschlossen. Was passiert?'),
    options: [
      { text: b('The lamp lights brightly: water is a good conductor', 'Die Lampe leuchtet hell: Wasser ist ein guter Leiter'), mis: 'pure-water-conducts' },
      { text: b('The lamp glows faintly as electrons flow through the water', 'Die Lampe glimmt schwach, weil Elektronen durch das Wasser fließen'), mis: 'electrons-through-solution' },
      { text: b('Practically nothing: pure water has almost no ions', 'Praktisch nichts: Reines Wasser hat fast keine Ionen'), correct: true },
    ],
    explain: b('In pure water only about one {{H3O+}} ion (and one {{OH-}}) exists for every 555 million water molecules. That tiny current is far too small to light a lamp.', 'In reinem Wasser kommt nur etwa ein {{H3O+}}-Ion (und ein {{OH-}}) auf 555 Millionen Wassermoleküle. Dieser winzige Strom reicht bei Weitem nicht für eine Lampe.') },
  { id: 'i7r', unit: 7, kind: 'choice', format: 'why', evidence: 'explain', withConfidence: true, concepts: ['u7.molecular', 'u7.carriers'], targets: ['pure-water-conducts', 'polarity-conduction'],
    prompt: b('A hair dryer falling into a bath is deadly, yet chemists call pure water a poor conductor. How do both fit together?', 'Ein Föhn, der in die Badewanne fällt, ist lebensgefährlich, trotzdem nennen Chemiker reines Wasser einen schlechten Leiter. Wie passt das zusammen?'),
    options: [
      { text: b('They don\'t: water is a good conductor, the chemists mean something else', 'Gar nicht: Wasser ist ein guter Leiter, die Chemiker meinen etwas anderes'), mis: 'pure-water-conducts' },
      { text: b('Bath water is not pure: it carries dissolved salts, which are ions', 'Badewasser ist nicht rein: Es enthält gelöste Salze, und die sind Ionen'), correct: true },
      { text: b('Mains voltage makes the water molecules so polar that they conduct', 'Die Netzspannung macht die Wassermoleküle so polar, dass sie leiten'), mis: 'polarity-conduction' },
    ],
    explain: b('Tap water, soap and the salts from skin put plenty of ions into bath water, and those ions carry the current. Pure water, with almost no ions, conducts about a million times worse than salt water. Mains voltage is also high enough to push a dangerous current even through a poor conductor such as the human body.', 'Leitungswasser, Seife und die Salze von der Haut bringen viele Ionen ins Badewasser, und diese Ionen tragen den Strom. Reines Wasser mit fast keinen Ionen leitet etwa eine Million Mal schlechter als Salzlösung. Außerdem ist die Netzspannung hoch genug, um selbst durch einen schlechten Leiter wie den menschlichen Körper einen gefährlichen Strom zu treiben.') },

  // ---- u7.bond-types ----
  { id: 'i7s', unit: 7, kind: 'choice', format: 'predict', withConfidence: true, concepts: ['u7.bond-types'],
    prompt: b('A grey solid conducts as a solid, bends instead of shattering when hammered, and melts at 660 °C. What kind of bonding holds it together?', 'Ein grauer Feststoff leitet im festen Zustand, verformt sich unter dem Hammer, statt zu zerspringen, und schmilzt bei 660 °C. Welche Bindungsart hält ihn zusammen?'),
    options: [
      { text: b('Ionic: it melts high, so it must be a salt', 'Ionenbindung: Er schmilzt hoch, also muss er ein Salz sein') },
      { text: b('Metallic: cores in a sea of electrons', 'Metallbindung: Atomrümpfe in einem Elektronengas'), correct: true },
      { text: b('Covalent: small molecules', 'Atombindung: kleine Moleküle') },
    ],
    explain: b('Conducting as a solid and bending without breaking are the marks of metallic bonding. It is aluminium, which melts at 660.3 °C. A salt would not conduct until molten and would shatter; small molecules would melt far lower and not conduct at all.', 'Leiten im festen Zustand und Verformen ohne Bruch sind die Kennzeichen der Metallbindung. Es ist Aluminium, Schmelzpunkt 660,3 °C. Ein Salz würde erst geschmolzen leiten und zerspringen; kleine Moleküle würden viel tiefer schmelzen und gar nicht leiten.') },
  { id: 'i7t', unit: 7, kind: 'choice', format: 'why', evidence: 'explain', withConfidence: true, concepts: ['u7.bond-types'],
    prompt: b('Ice melts at 0 °C, salt at 801 °C. Why so different?', 'Eis schmilzt bei 0 °C, Salz bei 801 °C. Warum so verschieden?'),
    options: [
      { text: b('Water molecules are lighter than salt ions', 'Wassermoleküle sind leichter als Salz-Ionen') },
      { text: b('Melting ice breaks the O–H bonds inside the molecules, and those are weak', 'Beim Schmelzen von Eis brechen die O–H-Bindungen in den Molekülen, und die sind schwach') },
      { text: b('Melting ice only loosens the attraction between whole molecules; melting salt has to loosen strong ionic attraction all through the lattice', 'Beim Schmelzen von Eis lockert sich nur die Anziehung zwischen ganzen Molekülen; beim Salz muss sich die starke Anziehung zwischen den Ionen im ganzen Gitter lockern'), correct: true },
    ],
    explain: b('Melted ice is still made of H₂O molecules: the O–H bonds (464 kJ/mol each) stay intact. Only the much weaker attractions between the molecules give way, the subject of units 8 to 11. In salt the attraction between whole charges holds the lattice together, so it takes far more heat.', 'Geschmolzenes Eis besteht immer noch aus H₂O-Molekülen: Die O–H-Bindungen (je 464 kJ/mol) bleiben erhalten. Nur die viel schwächeren Anziehungskräfte zwischen den Molekülen geben nach; um sie geht es in den Einheiten 8 bis 11. Im Salz hält die Anziehung zwischen ganzen Ladungen das Gitter zusammen, also braucht es viel mehr Wärme.') },
  { id: 'i7u', unit: 7, kind: 'choice', format: 'predict', evidence: 'transfer', withConfidence: true, concepts: ['u7.bond-types'], targets: ['polarity-conduction'],
    prompt: b('Quartz (silicon dioxide, the main part of sand) melts at about 1700 °C and barely conducts, even when molten. Which picture fits?', 'Quarz (Siliciumdioxid, der Hauptbestandteil von Sand) schmilzt bei etwa 1700 °C und leitet kaum, selbst geschmolzen. Welches Bild passt?'),
    options: [
      { text: b('A salt: ions in a lattice, which is why it melts so high', 'Ein Salz: Ionen im Gitter, deshalb schmilzt es so hoch') },
      { text: b('A metal: atom cores in a sea of electrons', 'Ein Metall: Atomrümpfe in einem Elektronengas') },
      { text: b('One giant network of atoms joined by covalent bonds in every direction: no ions, no free electrons', 'Ein riesiges Netzwerk aus Atomen, in alle Richtungen durch Atombindungen verknüpft: keine Ionen, keine freien Elektronen'), correct: true },
      { text: b('Polar molecules, whose δ+ and δ− ends carry a little current', 'Polare Moleküle, deren δ+- und δ−-Enden ein wenig Strom tragen'), mis: 'polarity-conduction' },
    ],
    explain: b('Every silicon atom is bonded to four oxygen atoms and every oxygen to two silicon atoms, all by shared pairs, through the whole crystal. Melting has to break covalent bonds, hence the high melting point; and with no ions and no free electrons, even the melt barely conducts. A salt would conduct once molten.', 'Jedes Siliciumatom ist an vier Sauerstoffatome gebunden und jedes Sauerstoffatom an zwei Siliciumatome, alles über gemeinsame Elektronenpaare, durch den ganzen Kristall. Beim Schmelzen müssen Atombindungen brechen, daher der hohe Schmelzpunkt; und ohne Ionen und freie Elektronen leitet selbst die Schmelze kaum. Ein Salz würde geschmolzen leiten.') },
];
