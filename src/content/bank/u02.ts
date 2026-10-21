import type { Bi } from '../../i18n';
import type { Item } from '../items';

const b = (en: string, de: string): Bi => ({ en, de });

// Unit 2 question bank: three variants per concept (predict, why, transfer), every trap option tagged.
// Radii: the app's own data. Atoms: empirical radii from bonded atoms (elements.ts); ions: Shannon ionic radii,
// six-fold coordination (orbitals.ts IONIC_RADIUS). Atom and ion radii come from different measurements, so the
// size jumps between an atom and its ion look larger than a like-for-like comparison would; the direction is real.
// Slater values: 1s same shell 0.30, other same-shell 0.35, shell n−1 0.85, deeper 1.00.
export const BANK_U2: Item[] = [
  // ---------- u2.zeff ----------
  { id: 'i2b', unit: 2, kind: 'choice', format: 'predict', withConfidence: true, concepts: ['u2.zeff'], targets: ['full-charge-felt'],
    prompt: b('Chlorine has Z = 17 and 10 inner electrons. The [[zeff]] felt by its outer electrons is roughly…', 'Chlor hat Z = 17 und 10 innere Elektronen. Die [[zeff]], die seine Außenelektronen spüren, beträgt etwa…'),
    options: [{ text: b('1', '1') }, { text: b('7', '7'), correct: true }, { text: b('17', '17'), mis: 'full-charge-felt' }, { text: b('10', '10') }],
    explain: b('In the simple model the 10 inner electrons shield fully: 17 − 10 = 7. The other outer electrons shield a little too, so careful estimates (Slater\'s rules) give about 6.', 'Im einfachen Modell schirmen die 10 inneren Elektronen vollständig ab: 17 − 10 = 7. Die anderen Außenelektronen schirmen auch ein wenig ab, genauere Abschätzungen (Slater-Regeln) ergeben etwa 6.') },
  { id: 'i2c', unit: 2, kind: 'choice', format: 'why', evidence: 'explain', withConfidence: true, concepts: ['u2.zeff', 'u2.shielding'], targets: ['full-charge-felt'],
    prompt: b('Sodium\'s nucleus has 11 protons, yet its outer electron feels a net pull of only about 1. Why?', 'Der Kern von Natrium hat 11 Protonen, trotzdem spürt sein Außenelektron nur einen Nettozug von etwa 1. Warum?'),
    options: [
      { text: b('Ten inner electrons sit between it and the nucleus and cancel most of the pull', 'Zehn innere Elektronen sitzen zwischen ihm und dem Kern und heben den Großteil des Zugs auf'), correct: true },
      { text: b('It doesn\'t: every electron feels the pull of all 11 protons equally', 'Stimmt nicht: Jedes Elektron spürt den Zug aller 11 Protonen gleich stark'), mis: 'full-charge-felt' },
      { text: b('Each proton holds on to exactly one electron, and only one is left over', 'Jedes Proton hält genau ein Elektron fest, und nur eines bleibt übrig') },
      { text: b('The outer electron is too far away to feel more than one proton', 'Das Außenelektron ist zu weit weg, um mehr als ein Proton zu spüren') },
    ],
    explain: b('The 10 electrons in shells 1 and 2 sit mostly between the nucleus and the outer electron, so they cancel most of the pull: 11 − 10 = 1. Slater\'s more careful count gives 2.2, still far below 11.', 'Die 10 Elektronen in den Schalen 1 und 2 sitzen meist zwischen Kern und Außenelektron und heben den Großteil des Zugs auf: 11 − 10 = 1. Slaters genauere Rechnung ergibt 2,2, immer noch weit unter 11.') },
  { id: 'i2d', unit: 2, kind: 'choice', format: 'predict', evidence: 'transfer', withConfidence: true, concepts: ['u2.zeff', 'u2.ions-size'], targets: ['full-charge-felt'],
    prompt: b('{{Mg2+}} has 12 protons and 10 electrons, in shells 2 and 8. In the simple model, what net pull do its outermost electrons (shell 2) feel?', '{{Mg2+}} hat 12 Protonen und 10 Elektronen in den Schalen 2 und 8. Welchen Nettozug spüren seine äußersten Elektronen (Schale 2) im einfachen Modell?'),
    options: [
      { text: b('2, as in a magnesium atom', '2, wie im Magnesiumatom') },
      { text: b('8', '8') },
      { text: b('10', '10'), correct: true },
      { text: b('12', '12'), mis: 'full-charge-felt' },
    ],
    explain: b('The outermost electrons are now in shell 2, and only the two shell-1 electrons sit inside them: 12 − 2 = 10. In the atom, the outer shell was shell 3 with 10 electrons inside it, 12 − 10 = 2. That strong pull is why {{Mg2+}} is so small: 72 pm.', 'Die äußersten Elektronen sitzen jetzt in Schale 2, und nur die zwei Elektronen aus Schale 1 liegen innen: 12 − 2 = 10. Im Atom war Schale 3 die äußere, mit 10 Elektronen darunter: 12 − 10 = 2. Dieser starke Zug macht {{Mg2+}} so klein: 72 pm.') },

  // ---------- u2.shielding ----------
  { id: 'i2e', unit: 2, kind: 'choice', format: 'predict', withConfidence: true, concepts: ['u2.shielding'], targets: ['full-charge-felt'],
    prompt: b('Imagine chlorine\'s 10 inner electrons stopped shielding. Its outer electrons would…', 'Stell dir vor, die 10 inneren Elektronen von Chlor würden nicht mehr abschirmen. Seine Außenelektronen würden…'),
    options: [
      { text: b('feel all 17 protons and be pulled much closer in', 'alle 17 Protonen spüren und viel näher herangezogen'), correct: true },
      { text: b('drift further out, no longer held by the inner electrons', 'weiter nach außen driften, weil die inneren Elektronen sie nicht mehr halten') },
      { text: b('stay where they are: the nucleus has not changed', 'bleiben, wo sie sind: Der Kern hat sich ja nicht verändert'), mis: 'full-charge-felt' },
    ],
    explain: b('Shielding is what keeps the pull down to about 7. Without it the outer electrons would feel the whole +17 and the atom would shrink sharply. Inner electrons never hold the outer ones; they only take away part of the nucleus\'s pull.', 'Die Abschirmung hält den Zug bei etwa 7. Ohne sie spürten die Außenelektronen die vollen +17, und das Atom würde stark schrumpfen. Innere Elektronen halten die äußeren nicht fest; sie nehmen dem Kern nur einen Teil seines Zugs.') },
  { id: 'i2f', unit: 2, kind: 'choice', format: 'why', evidence: 'explain', withConfidence: true, concepts: ['u2.shielding'],
    prompt: b('In Slater\'s refined count, an inner electron shields almost fully (0.85 to 1.00), but another electron in the same shell only 0.35. Why the difference?', 'In Slaters genauerer Rechnung schirmt ein inneres Elektron fast vollständig ab (0,85 bis 1,00), ein anderes Elektron derselben Schale aber nur 0,35. Woher kommt der Unterschied?'),
    options: [
      { text: b('Inner electrons are mostly between the nucleus and the outer shell; same-shell electrons are as often beside or beyond', 'Innere Elektronen sind meist zwischen Kern und Außenschale; Elektronen derselben Schale sind genauso oft daneben oder dahinter'), correct: true },
      { text: b('Inner electrons carry a bigger negative charge than outer electrons do', 'Innere Elektronen tragen eine größere negative Ladung als äußere') },
      { text: b('Electrons in the same shell attract each other and so shield less', 'Elektronen derselben Schale ziehen sich an und schirmen deshalb weniger ab') },
      { text: b('Inner electrons are heavier, so they block more of the nucleus', 'Innere Elektronen sind schwerer und verdecken deshalb mehr vom Kern') },
    ],
    explain: b('Every electron has the same charge. What matters is where it spends its time: an inner electron is nearly always between the nucleus and the outer electron, so it cancels almost one proton\'s pull. A neighbour in the same shell is only sometimes in between.', 'Jedes Elektron hat dieselbe Ladung. Es kommt darauf an, wo es sich aufhält: Ein inneres Elektron ist fast immer zwischen Kern und Außenelektron und hebt fast den Zug eines Protons auf. Ein Nachbar in derselben Schale ist nur manchmal dazwischen.') },
  { id: 'i2g', unit: 2, kind: 'choice', format: 'predict', evidence: 'transfer', withConfidence: true, concepts: ['u2.shielding', 'u2.zeff'], targets: ['full-charge-felt'],
    prompt: b('Helium has two electrons, both in shell 1, so neither is an inner electron. Each shields the other only partly. Each electron feels a pull of…', 'Helium hat zwei Elektronen, beide in Schale 1, keines ist also ein inneres Elektron. Jedes schirmt das andere nur teilweise ab. Jedes Elektron spürt einen Zug von…'),
    options: [
      { text: b('exactly 2: electrons in the same shell do not shield at all', 'genau 2: Elektronen derselben Schale schirmen gar nicht ab'), mis: 'full-charge-felt' },
      { text: b('between 1 and 2, about 1.7', 'zwischen 1 und 2, etwa 1,7'), correct: true },
      { text: b('exactly 1: the other electron cancels one proton', 'genau 1: Das andere Elektron hebt ein Proton auf') },
      { text: b('0: two electrons cancel two protons', '0: Zwei Elektronen heben zwei Protonen auf') },
    ],
    explain: b('Slater gives 2 − 0.30 = 1.70. More than hydrogen\'s 1, so helium holds its electrons harder: removing one costs 2372 kJ/mol, against 1312 for hydrogen.', 'Slater ergibt 2 − 0,30 = 1,70. Mehr als die 1 beim Wasserstoff, also hält Helium seine Elektronen fester: Eines abzulösen kostet 2372 kJ/mol, beim Wasserstoff 1312.') },

  // ---------- u2.radius-trend ----------
  { id: 'i2a', unit: 2, kind: 'rank', format: 'rank', concepts: ['u2.radius-trend', 'u2.zeff'], table: 'category', mis: 'more-electrons-bigger', targets: ['more-electrons-bigger'],
    prompt: b('Rank by atomic radius, largest first.', 'Ordne nach Atomradius, den größten zuerst.'),
    order: [b('Na', 'Na'), b('Mg', 'Mg'), b('Si', 'Si'), b('Cl', 'Cl')],
    explain: b('180, 150, 110, 100 pm. Same shell, rising Z_{eff} (1, 2, 4, 7): each step pulls the outer electrons closer.', '180, 150, 110, 100 pm. Gleiche Schale, steigendes Z_{eff} (1, 2, 4, 7): Jeder Schritt zieht die Außenelektronen näher heran.') },
  { id: 'i2h', unit: 2, kind: 'choice', format: 'predict', withConfidence: true, concepts: ['u2.radius-trend'], targets: ['more-electrons-bigger'],
    prompt: b('Lithium, carbon and fluorine all have two shells. Which atom is the biggest?', 'Lithium, Kohlenstoff und Fluor haben alle zwei Schalen. Welches Atom ist am größten?'),
    options: [
      { text: b('Fluorine: it has the most electrons to fit in', 'Fluor: Es muss die meisten Elektronen unterbringen'), mis: 'more-electrons-bigger' },
      { text: b('Lithium: the weakest pull on its outer shell', 'Lithium: der schwächste Zug auf seine Außenschale'), correct: true },
      { text: b('Carbon: it sits in the middle of the row', 'Kohlenstoff: Es steht in der Mitte der Zeile') },
      { text: b('All the same: two shells each', 'Alle gleich: je zwei Schalen') },
    ],
    explain: b('Lithium 145 pm, carbon 70, fluorine 50. Across the row the inner electrons stay at 2 while the protons go from 3 to 9, so the net pull rises from 1 to 7 and the same shell is drawn in.', 'Lithium 145 pm, Kohlenstoff 70, Fluor 50. Entlang der Zeile bleiben es 2 innere Elektronen, während die Protonen von 3 auf 9 steigen. Der Nettozug wächst von 1 auf 7 und zieht dieselbe Schale enger.') },
  { id: 'i2i', unit: 2, kind: 'choice', format: 'why', evidence: 'explain', withConfidence: true, concepts: ['u2.radius-trend', 'u2.zeff'], targets: ['more-electrons-bigger'],
    prompt: b('From sodium to chlorine the atoms gain six electrons, yet shrink from 180 to 100 pm. Why?', 'Von Natrium bis Chlor kommen sechs Elektronen dazu, trotzdem schrumpfen die Atome von 180 auf 100 pm. Warum?'),
    options: [
      { text: b('The new electrons fill gaps and pack the shell tighter', 'Die neuen Elektronen füllen Lücken und packen die Schale dichter') },
      { text: b('Each step adds a proton but no new shell, so the pull on the same shell grows', 'Jeder Schritt bringt ein Proton, aber keine neue Schale, also wächst der Zug auf dieselbe Schale'), correct: true },
      { text: b('The heavier nucleus squeezes the shells around it', 'Der schwerere Kern drückt die Schalen um sich zusammen') },
      { text: b('More electrons attract each other more strongly', 'Mehr Elektronen ziehen sich gegenseitig stärker an') },
    ],
    explain: b('Electrons repel each other, so extra electrons on their own would make an atom bigger. But each step also adds a proton, while the inner electrons stay at 10: the net pull rises from 1 to 7, and that wins.', 'Elektronen stoßen sich ab, zusätzliche Elektronen allein würden ein Atom also vergrößern. Aber jeder Schritt bringt auch ein Proton, während es 10 innere Elektronen bleiben: Der Nettozug steigt von 1 auf 7, und das gewinnt.') },
  { id: 'i2j', unit: 2, kind: 'choice', format: 'predict', evidence: 'transfer', withConfidence: true, concepts: ['u2.radius-trend', 'u2.zeff'], targets: ['more-electrons-bigger'],
    prompt: b('Gallium (Z = 31) and bromine (Z = 35) both have four shells and 28 inner electrons. Which atom is bigger?', 'Gallium (Z = 31) und Brom (Z = 35) haben beide vier Schalen und 28 innere Elektronen. Welches Atom ist größer?'),
    options: [
      { text: b('Bromine: four more electrons need more room', 'Brom: Vier Elektronen mehr brauchen mehr Platz'), mis: 'more-electrons-bigger' },
      { text: b('About the same: same shells, same inner electrons', 'Etwa gleich: gleiche Schalen, gleiche inneren Elektronen') },
      { text: b('Gallium: its outer shell feels a pull of 3, bromine\'s of 7', 'Gallium: Seine Außenschale spürt einen Zug von 3, die von Brom von 7'), correct: true },
    ],
    explain: b('31 − 28 = 3 against 35 − 28 = 7. Gallium measures 130 pm, bromine 115. The rule from period 3 holds in period 4 too.', '31 − 28 = 3 gegen 35 − 28 = 7. Gallium misst 130 pm, Brom 115. Die Regel aus Periode 3 gilt auch in Periode 4.') },

  // ---------- u2.distance ----------
  { id: 'i2k', unit: 2, kind: 'rank', format: 'rank', concepts: ['u2.distance', 'u2.radius-trend'], mis: 'full-charge-felt', targets: ['full-charge-felt'],
    prompt: b('Group 1: rank by atomic radius, largest first.', 'Gruppe 1: Ordne nach Atomradius, den größten zuerst.'),
    order: [b('Rb', 'Rb'), b('K', 'K'), b('Na', 'Na'), b('Li', 'Li')],
    explain: b('235, 220, 180, 145 pm. Each row down adds a shell further out. The extra protons are cancelled by the same number of extra inner electrons, so the net pull stays about 1, and distance decides.', '235, 220, 180, 145 pm. Jede Zeile nach unten bringt eine Schale weiter außen dazu. Die zusätzlichen Protonen werden von ebenso vielen zusätzlichen inneren Elektronen aufgehoben, der Nettozug bleibt bei etwa 1, und der Abstand entscheidet.') },
  { id: 'i2l', unit: 2, kind: 'choice', format: 'why', evidence: 'explain', withConfidence: true, concepts: ['u2.distance'], targets: ['shielding-down-group'],
    prompt: b('From sodium to potassium the nucleus gains 8 protons and the atom gains 8 inner electrons. Why is potassium bigger?', 'Von Natrium zu Kalium bekommt der Kern 8 Protonen dazu und das Atom 8 innere Elektronen. Warum ist Kalium größer?'),
    options: [
      { text: b('The 8 new inner electrons shield more than the 8 new protons pull', 'Die 8 neuen inneren Elektronen schirmen mehr ab, als die 8 neuen Protonen ziehen'), mis: 'shielding-down-group' },
      { text: b('The 8 new protons push the shells outwards', 'Die 8 neuen Protonen drücken die Schalen nach außen') },
      { text: b('The two cancel, so the pull stays about the same, and the outer electron is in a new shell further out', 'Beides hebt sich auf, der Zug bleibt etwa gleich, und das Außenelektron sitzt in einer neuen Schale weiter außen'), correct: true },
      { text: b('A heavier nucleus pulls more weakly on its electrons', 'Ein schwererer Kern zieht schwächer an seinen Elektronen') },
    ],
    explain: b('19 − 18 = 1, the same as 11 − 10 = 1. With the same net pull, the electron in shell 4 sits further out than one in shell 3: 220 pm against 180.', '19 − 18 = 1, genau wie 11 − 10 = 1. Bei gleichem Nettozug sitzt ein Elektron in Schale 4 weiter außen als eines in Schale 3: 220 pm gegen 180.') },
  { id: 'i2m', unit: 2, kind: 'choice', format: 'predict', evidence: 'transfer', withConfidence: true, concepts: ['u2.distance'], targets: ['shielding-down-group'],
    prompt: b('Fluorine (50 pm) and iodine (140 pm) both feel a net pull of about 7 in the simple model. What makes iodine almost three times as wide?', 'Fluor (50 pm) und Iod (140 pm) spüren im einfachen Modell beide einen Nettozug von etwa 7. Was macht Iod fast dreimal so breit?'),
    options: [
      { text: b('Its outer electrons are in shell 5, three shells further out than fluorine\'s', 'Seine Außenelektronen sitzen in Schale 5, drei Schalen weiter außen als die von Fluor'), correct: true },
      { text: b('Its 46 inner electrons shield the outer ones far better', 'Seine 46 inneren Elektronen schirmen die äußeren viel besser ab'), mis: 'shielding-down-group' },
      { text: b('Its 53 protons push the electron cloud outwards', 'Seine 53 Protonen drücken die Elektronenwolke nach außen') },
      { text: b('It has more outer electrons than fluorine', 'Es hat mehr Außenelektronen als Fluor') },
    ],
    explain: b('Both are in group 17 with seven outer electrons, and 53 − 46 = 7 just as 9 − 2 = 7. The difference is distance: shell 5 against shell 2.', 'Beide stehen in Gruppe 17 mit sieben Außenelektronen, und 53 − 46 = 7, genau wie 9 − 2 = 7. Der Unterschied ist der Abstand: Schale 5 gegen Schale 2.') },

  // ---------- u2.ions-size ----------
  { id: 'i2n', unit: 2, kind: 'choice', format: 'predict', withConfidence: true, concepts: ['u2.ions-size'], targets: ['ion-same-size'],
    prompt: b('A chlorine atom gains one electron and becomes {{Cl-}}. Its size…', 'Ein Chloratom nimmt ein Elektron auf und wird zu {{Cl-}}. Seine Größe…'),
    options: [
      { text: b('stays about the same: one electron hardly takes up room', 'bleibt etwa gleich: Ein Elektron braucht kaum Platz'), mis: 'ion-same-size' },
      { text: b('shrinks: the extra electron is pulled in tight', 'schrumpft: Das zusätzliche Elektron wird eng herangezogen') },
      { text: b('grows: 18 electrons, still only 17 protons', 'wächst: 18 Elektronen, aber weiter nur 17 Protonen'), correct: true },
    ],
    explain: b('{{Cl-}} measures 181 pm, the atom 100. With one electron more than protons, the electrons push each other apart and the pull per electron drops. The atom\'s value comes from bonds and the ion\'s from crystals, so the jump looks bigger than it is, but the direction is real.', '{{Cl-}} misst 181 pm, das Atom 100. Mit einem Elektron mehr als Protonen stoßen sich die Elektronen stärker ab, und der Zug pro Elektron sinkt. Der Atomwert stammt aus Bindungen, der Ionenwert aus Kristallen, deshalb wirkt der Sprung größer, als er ist; die Richtung stimmt aber.') },
  { id: 'i2o', unit: 2, kind: 'choice', format: 'why', evidence: 'explain', withConfidence: true, concepts: ['u2.ions-size'], targets: ['ion-same-size'],
    prompt: b('A sodium atom is 180 pm across, the {{Na+}} ion only 102 pm. Why such a big drop for one electron?', 'Ein Natriumatom misst 180 pm, das {{Na+}}-Ion nur 102 pm. Warum so viel weniger für ein einziges Elektron?'),
    options: [
      { text: b('It should only drop by about a tenth, since one of 11 electrons is gone', 'Es dürfte nur um etwa ein Zehntel schrumpfen, weil eines von 11 Elektronen fehlt'), mis: 'ion-same-size' },
      { text: b('It lost its only shell-3 electron, so its outermost electrons are now in shell 2', 'Es hat sein einziges Elektron in Schale 3 verloren, die äußersten Elektronen sitzen jetzt in Schale 2'), correct: true },
      { text: b('Losing an electron makes the nucleus itself smaller', 'Durch den Verlust eines Elektrons wird der Kern selbst kleiner') },
      { text: b('The ion is positive, and positive charges take up less space', 'Das Ion ist positiv, und positive Ladungen brauchen weniger Platz') },
    ],
    explain: b('Sodium\'s one outer electron was its whole third shell. Without it, the outermost electrons are in shell 2, much closer in, and 11 protons now pull on 10 electrons.', 'Das eine Außenelektron von Natrium war seine ganze dritte Schale. Ohne es sitzen die äußersten Elektronen in Schale 2, viel weiter innen, und 11 Protonen ziehen jetzt an 10 Elektronen.') },
  { id: 'i2p', unit: 2, kind: 'choice', format: 'predict', evidence: 'transfer', withConfidence: true, concepts: ['u2.ions-size'], targets: ['ion-same-size'],
    prompt: b('In table salt, which ion is bigger, {{Na+}} or {{Cl-}}? As atoms, sodium is the bigger one: 180 against 100 pm.', 'Welches Ion ist im Kochsalz größer, {{Na+}} oder {{Cl-}}? Als Atome ist Natrium das größere: 180 gegen 100 pm.'),
    options: [
      { text: b('{{Na+}}: sodium atoms are bigger, and the ion keeps that', '{{Na+}}: Natriumatome sind größer, und das Ion behält das'), mis: 'ion-same-size' },
      { text: b('{{Cl-}}: sodium lost a shell, chlorine gained an electron', '{{Cl-}}: Natrium hat eine Schale verloren, Chlor ein Elektron dazubekommen'), correct: true },
      { text: b('{{Na+}}: it has more protons, and protons take up room', '{{Na+}}: Es hat mehr Protonen, und Protonen brauchen Platz') },
      { text: b('About the same: only one electron moved', 'Etwa gleich: Nur ein Elektron hat den Platz gewechselt'), mis: 'ion-same-size' },
    ],
    explain: b('{{Na+}} 102 pm, {{Cl-}} 181 pm. The order of the atoms flips in the ions: sodium loses its whole outer shell, chlorine\'s shell swells with one extra electron.', '{{Na+}} 102 pm, {{Cl-}} 181 pm. Die Reihenfolge der Atome kehrt sich bei den Ionen um: Natrium verliert seine ganze äußere Schale, die Schale von Chlor schwillt mit einem zusätzlichen Elektron an.') },

  // ---------- u2.isoelectronic ----------
  { id: 'i2q', unit: 2, kind: 'rank', format: 'rank', concepts: ['u2.isoelectronic'], targets: ['isoelectronic-same-size'],
    prompt: b('These ions all have 10 electrons, in shells 2 and 8. Rank them by size, largest first.', 'Diese Ionen haben alle 10 Elektronen, in den Schalen 2 und 8. Ordne sie nach Größe, das größte zuerst.'),
    order: [b('{{O2-}}', '{{O2-}}'), b('{{F-}}', '{{F-}}'), b('{{Na+}}', '{{Na+}}'), b('{{Mg2+}}', '{{Mg2+}}')],
    explain: b('140, 133, 102, 72 pm. Same electrons, rising number of protons: 8, 9, 11, 12. Each extra proton pulls the same 10 electrons in tighter.', '140, 133, 102, 72 pm. Gleiche Elektronen, steigende Protonenzahl: 8, 9, 11, 12. Jedes zusätzliche Proton zieht dieselben 10 Elektronen enger heran.') },
  { id: 'i2r', unit: 2, kind: 'choice', format: 'why', evidence: 'explain', withConfidence: true, concepts: ['u2.isoelectronic'], targets: ['isoelectronic-same-size'],
    prompt: b('{{Na+}} and {{F-}} have exactly the same electrons, in shells 2 and 8. Why is fluoride bigger (133 against 102 pm)?', '{{Na+}} und {{F-}} haben genau dieselben Elektronen, in den Schalen 2 und 8. Warum ist Fluorid größer (133 gegen 102 pm)?'),
    options: [
      { text: b('Fluoride\'s 9 protons hold the 10 electrons less tightly than sodium\'s 11', 'Die 9 Protonen des Fluorids halten die 10 Elektronen weniger fest als die 11 von Natrium'), correct: true },
      { text: b('It shouldn\'t be: same electrons means same size, so it is a measuring error', 'Das dürfte nicht sein: gleiche Elektronen heißt gleiche Größe, also ein Messfehler'), mis: 'isoelectronic-same-size' },
      { text: b('Fluoride has one more shell than the sodium ion', 'Fluorid hat eine Schale mehr als das Natrium-Ion') },
      { text: b('Fluorine is more electronegative, so it spreads its electrons out', 'Fluor ist elektronegativer und verteilt seine Elektronen deshalb weiter') },
    ],
    explain: b('With the electrons identical, the nucleus decides. Fluoride has one electron more than protons, the sodium ion one proton more than electrons, so the sodium ion is pulled in tighter.', 'Wenn die Elektronen gleich sind, entscheidet der Kern. Fluorid hat ein Elektron mehr als Protonen, das Natrium-Ion ein Proton mehr als Elektronen, also wird es enger zusammengezogen.') },
  { id: 'i2s', unit: 2, kind: 'choice', format: 'predict', evidence: 'transfer', withConfidence: true, concepts: ['u2.isoelectronic', 'u2.ions-size'], targets: ['isoelectronic-same-size'],
    prompt: b('{{S2-}}, {{Cl-}}, {{K+}} and {{Ca2+}} all have 18 electrons, in shells 2, 8 and 8. Which is the smallest?', '{{S2-}}, {{Cl-}}, {{K+}} und {{Ca2+}} haben alle 18 Elektronen, in den Schalen 2, 8 und 8. Welches ist am kleinsten?'),
    options: [
      { text: b('{{S2-}}', '{{S2-}}') },
      { text: b('{{K+}}', '{{K+}}') },
      { text: b('{{Ca2+}}', '{{Ca2+}}'), correct: true },
      { text: b('All the same: 18 electrons each', 'Alle gleich: je 18 Elektronen'), mis: 'isoelectronic-same-size' },
    ],
    explain: b('{{Ca2+}} has 20 protons for its 18 electrons, the strongest pull of the four: 100 pm. Then {{K+}} 138, {{Cl-}} 181 and {{S2-}} 184 pm.', '{{Ca2+}} hat 20 Protonen für seine 18 Elektronen, den stärksten Zug der vier: 100 pm. Dann {{K+}} 138, {{Cl-}} 181 und {{S2-}} 184 pm.') },
];
