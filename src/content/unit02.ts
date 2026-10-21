// Unit 2 — Z_eff and size: why atoms are the size they are, and why ions shrink or swell.
// Data: atomic radii are the app's empirical radii from bonded atoms (elements.ts); ionic radii are Shannon values,
// six-fold coordination (IONIC_RADIUS in sim/orbitals.ts). Metallic radii of Cu, Ag, Au (128, 144, 144 pm):
// CRC Handbook. Slater's rules for the refined Z_eff values. The simple-model Z_eff is the engine's: Z minus inner electrons.
import type { Bi } from '../i18n';
import type { ChoiceItem, RankItem, EstimateItem, FlawItem } from './items';
import type { Idea } from './unit06';
import type { UnitContent } from './unitTypes';

const b = (en: string, de: string): Bi => ({ en, de });

export const UNIT2: UnitContent = {
  n: 2,
  title: b('Z_{eff} and size', 'Z_{eff} und Atomgröße'),
  lead: b('Why a sodium atom is almost twice as wide as a chlorine atom, and why atoms shrink or swell when they become ions.',
    'Warum ein Natriumatom fast doppelt so breit ist wie ein Chloratom und warum Atome schrumpfen oder anschwellen, wenn sie zu Ionen werden.'),

  puzzle: {
    title: b('More electrons, smaller atom?', 'Mehr Elektronen, kleineres Atom?'),
    lead: b('Sodium and chlorine sit at the two ends of period 3. Both have three shells. Chlorine has six more protons and six more electrons.',
      'Natrium und Chlor stehen an den beiden Enden der Periode 3. Beide haben drei Schalen. Chlor hat sechs Protonen und sechs Elektronen mehr.'),
    data: {
      caption: b('Period 3, both ends. Radii from the distance between bonded atoms, in pm (1 pm = a millionth of a millionth of a metre).',
        'Periode 3, beide Enden. Radien aus dem Abstand gebundener Atome, in pm (1 pm = ein Millionstel eines Millionstel Meters).'),
      head: [b('Atom', 'Atom'), b('Electrons', 'Elektronen'), b('Shells', 'Schalen'), b('Radius', 'Radius')],
      rows: [
        { cells: [b('Sodium, Na', 'Natrium, Na'), '11', '2 · 8 · 1', '180 pm'] },
        { cells: [b('Chlorine, Cl', 'Chlor, Cl'), '17', '2 · 8 · 7', '100 pm'], mystery: true },
      ],
      numeric: [1, 3],
    },
    clash: b('Chlorine has six more electrons than sodium, all in the same three shells, yet it is only a little over half as wide. Adding electrons made the atom smaller. What is pulling chlorine in?',
      'Chlor hat sechs Elektronen mehr als Natrium, alle in denselben drei Schalen, und ist trotzdem nur gut halb so breit. Mehr Elektronen, kleineres Atom. Was zieht Chlor zusammen?'),
    question: {
      id: 'u2-puzzle', unit: 2, kind: 'choice', format: 'predict', withConfidence: true, evidence: 'predict',
      concepts: ['u2.radius-trend', 'u2.zeff'], targets: ['more-electrons-bigger'],
      prompt: b('Your best guess:', 'Deine beste Vermutung:'),
      options: [
        { text: b('Its extra electrons fill gaps and pack the shells tighter', 'Seine zusätzlichen Elektronen füllen Lücken und packen die Schalen dichter') },
        { text: b('Its six extra protons pull the same three shells in harder', 'Seine sechs zusätzlichen Protonen ziehen dieselben drei Schalen stärker heran'), correct: true },
        { text: b('It is heavier, and the extra mass squeezes the atom', 'Es ist schwerer, und die zusätzliche Masse drückt das Atom zusammen') },
        { text: b('More electrons must mean a bigger atom, so the two radii are not comparable', 'Mehr Elektronen müssen ein größeres Atom ergeben, also sind die Radien nicht vergleichbar'), mis: 'more-electrons-bigger' },
      ],
      explain: b('Both atoms have the same 10 inner electrons, in shells 1 and 2. They cancel the pull of 10 protons, so the outer shell feels a net pull of about 11 − 10 = 1 in sodium and 17 − 10 = 7 in chlorine. Seven times the pull draws the same shell in. Both radii are measured the same way, so the difference is real.',
        'Beide Atome haben dieselben 10 inneren Elektronen in den Schalen 1 und 2. Sie heben den Zug von 10 Protonen auf, also spürt die äußere Schale bei Natrium einen Nettozug von etwa 11 − 10 = 1, bei Chlor von 17 − 10 = 7. Der siebenfache Zug zieht dieselbe Schale enger. Beide Radien sind gleich gemessen, der Unterschied ist echt.'),
    } as ChoiceItem,
    after: b('Next: switch the shielding off and on, and watch what holds an atom at its size.',
      'Als Nächstes: Schalte die Abschirmung aus und an und sieh zu, was ein Atom in seiner Größe hält.'),
  },

  explore: {
    title: b('Atoms at their measured size', 'Atome in gemessener Größe'),
    intro: b('Here the outer shell is drawn at the atom\'s measured size; the inner shells sit inside it, not to scale. The readout shows the net pull on the outer electrons, the [[zeff]]: Z_{eff} ≈ Z − inner electrons, the protons minus the electrons that sit between them and the outer shell. The slider sets how well those inner electrons [[shielding|shield]].',
      'Hier wird die äußere Schale in der gemessenen Größe des Atoms gezeichnet; die inneren Schalen liegen darin, nicht maßstabsgetreu. Die Anzeige zeigt den Nettozug auf die Außenelektronen, die [[zeff]]: Z_{eff} ≈ Z − innere Elektronen, die Protonen minus die Elektronen, die zwischen ihnen und der äußeren Schale sitzen. Mit dem Regler stellst du ein, wie gut diese inneren Elektronen [[shielding|abschirmen]].'),
    tasks: [
      { id: 'row', key: true, text: b('Visit sodium, then chlorine. Same three shells: what happens to Z_{eff} and to the size?', 'Besuche Natrium, dann Chlor. Dieselben drei Schalen: Was passiert mit Z_{eff} und mit der Größe?') },
      { id: 'shield', key: true, text: b('Pick an atom with inner electrons and slide the shielding down to 20 % or less. What does the atom do?', 'Wähle ein Atom mit inneren Elektronen und schieb die Abschirmung auf 20 % oder weniger. Was macht das Atom?') },
      { id: 'group', key: true, text: b('Visit lithium, sodium and potassium. Z_{eff} stays at 1, yet the atoms grow. What changes instead?', 'Besuche Lithium, Natrium und Kalium. Z_{eff} bleibt bei 1, und trotzdem wachsen die Atome. Was ändert sich stattdessen?') },
      { id: 'ions', key: true, text: b('Tap {{Na+}} and {{Cl-}}. Which ion shrinks and which one swells, compared with its atom?', 'Tippe auf {{Na+}} und {{Cl-}}. Welches Ion schrumpft und welches schwillt an, verglichen mit seinem Atom?') },
      { id: 'iso', challenge: true, text: b('{{O2-}}, {{F-}}, {{Na+}} and {{Mg2+}} all have 10 electrons. Line them up by size. What decides the order?', '{{O2-}}, {{F-}}, {{Na+}} und {{Mg2+}} haben alle 10 Elektronen. Bring sie in eine Reihe nach Größe. Was entscheidet die Reihenfolge?') },
    ],
    notes: {
      row: b('Sodium: Z_{eff} ≈ 11 − 10 = 1, 180 pm. Chlorine: 17 − 10 = 7, 100 pm. Same shell, seven times the pull.',
        'Natrium: Z_{eff} ≈ 11 − 10 = 1, 180 pm. Chlor: 17 − 10 = 7, 100 pm. Gleiche Schale, siebenfacher Zug.'),
      shield: b('Without shielding the outer electrons would feel every proton, and the atom would collapse inwards. Real atoms sit close to the 100 % end: inner electrons shield almost fully, and the other outer electrons a little.',
        'Ohne Abschirmung spürten die Außenelektronen jedes Proton, und das Atom fiele nach innen zusammen. Echte Atome liegen nahe am 100-%-Ende: Innere Elektronen schirmen fast vollständig ab, die anderen Außenelektronen ein wenig.'),
      group: b('Z_{eff} stays at 1 all the way down group 1: each new row adds 8 protons and 8 inner electrons, and they cancel. What grows is the distance: the outer electron moves into a new shell, further out.',
        'Z_{eff} bleibt in der ganzen Gruppe 1 bei 1: Jede neue Zeile bringt 8 Protonen und 8 innere Elektronen, und die heben sich auf. Was wächst, ist der Abstand: Das Außenelektron rückt in eine neue Schale, weiter außen.'),
      ions: b('{{Na+}} has lost its only shell-3 electron, so its outermost electrons are in shell 2: 102 pm instead of 180. {{Cl-}} has 18 electrons for 17 protons; they push each other apart and the ion swells to 181 pm. Atom sizes come from bonds and ion sizes from salt crystals, so the two are not measured quite alike, but the direction is real.',
        '{{Na+}} hat sein einziges Elektron in Schale 3 verloren, die äußersten Elektronen sitzen in Schale 2: 102 pm statt 180. {{Cl-}} hat 18 Elektronen für 17 Protonen; sie stoßen sich ab, und das Ion schwillt auf 181 pm an. Atomgrößen stammen aus Bindungen, Ionengrößen aus Salzkristallen, ganz gleich gemessen sind sie also nicht, aber die Richtung stimmt.'),
      iso: b('Same 10 electrons, 8 to 12 protons: {{O2-}} 140, {{F-}} 133, {{Na+}} 102, {{Mg2+}} 72 pm. More protons, tighter pull, smaller ion. Chemists call such a set [[isoelectronic]].',
        'Gleiche 10 Elektronen, 8 bis 12 Protonen: {{O2-}} 140, {{F-}} 133, {{Na+}} 102, {{Mg2+}} 72 pm. Mehr Protonen, stärkerer Zug, kleineres Ion. So eine Reihe heißt [[isoelectronic|isoelektronisch]].'),
    },
    check: {
      id: 'u2-check', unit: 2, kind: 'rank', format: 'rank', evidence: 'predict', concepts: ['u2.radius-trend', 'u2.distance'],
      prompt: b('Quick check: rank by atomic radius, largest first.', 'Kurzer Check: Ordne nach Atomradius, den größten zuerst.'),
      order: [b('{{K}}', '{{K}}'), b('{{Na}}', '{{Na}}'), b('{{Mg}}', '{{Mg}}'), b('{{Cl}}', '{{Cl}}')],
      explain: b('220, 180, 150, 100 pm. Potassium has a shell more than the others. Within period 3, the pull grows from sodium to chlorine and the shell is drawn in.',
        '220, 180, 150, 100 pm. Kalium hat eine Schale mehr als die anderen. Innerhalb der Periode 3 wächst der Zug von Natrium bis Chlor, und die Schale wird enger.'),
    } as RankItem,
  },

  predictions: [
    {
      item: {
        id: 'u2-br', unit: 2, kind: 'choice', format: 'predict', withConfidence: true, evidence: 'transfer',
        concepts: ['u2.distance', 'u2.radius-trend'], targets: ['shielding-down-group', 'full-charge-felt'],
        prompt: b('Bromine sits right below chlorine in group 17. In the simple model both feel a net pull of about 7 on their outer electrons (chlorine 17 − 10, bromine 35 − 28). Which atom is bigger?',
          'Brom steht in Gruppe 17 direkt unter Chlor. Im einfachen Modell spüren die Außenelektronen beider einen Nettozug von etwa 7 (Chlor 17 − 10, Brom 35 − 28). Welches Atom ist größer?'),
        options: [
          { text: b('Bromine: its 18 extra inner electrons shield the outer ones better', 'Brom: Seine 18 zusätzlichen inneren Elektronen schirmen die äußeren besser ab'), mis: 'shielding-down-group' },
          { text: b('Chlorine: bromine\'s 35 protons pull its shells in harder', 'Chlor: Die 35 Protonen von Brom ziehen seine Schalen stärker heran'), mis: 'full-charge-felt' },
          { text: b('Bromine: its outer electrons sit in shell 4, one shell further out', 'Brom: Seine Außenelektronen sitzen in Schale 4, eine Schale weiter außen'), correct: true },
          { text: b('Neither: the same pull of 7 gives the same size', 'Keines: Der gleiche Zug von 7 ergibt die gleiche Größe') },
        ],
        explain: b('The 18 extra protons and the 18 extra inner electrons cancel, so the net pull stays about 7. What changes is distance: bromine\'s outer electrons are in shell 4, one shell further out than chlorine\'s.',
          'Die 18 zusätzlichen Protonen und die 18 zusätzlichen inneren Elektronen heben sich auf, der Nettozug bleibt bei etwa 7. Was sich ändert, ist der Abstand: Die Außenelektronen von Brom sitzen in Schale 4, eine Schale weiter außen als die von Chlor.'),
      } as ChoiceItem,
      show: { engine: 'atom', z: 35, size: true },
      revealText: b('Bromine measures 115 pm, chlorine 100. Bigger, as the extra shell predicts, but by less than you might expect: ten of bromine\'s new inner electrons are 3d electrons, which shield less than fully, so its real pull is a little stronger than 7. Down group 1, from sodium to potassium, no d electrons come in between, and the jump is bigger: 180 to 220 pm.',
        'Brom misst 115 pm, Chlor 100. Größer, wie die zusätzliche Schale vorhersagt, aber weniger als erwartet: Zehn der neuen inneren Elektronen von Brom sind 3d-Elektronen, die nicht ganz vollständig abschirmen, also ist sein echter Zug etwas stärker als 7. In Gruppe 1 kommen zwischen Natrium und Kalium keine d-Elektronen dazu, und der Sprung ist größer: 180 auf 220 pm.'),
      extra: {
        title: b('Count what cancels', 'Zähl, was sich aufhebt'),
        steps: [
          b('Chlorine: 17 protons, 10 inner electrons. Net pull on the outer shell: about 17 − 10 = 7.', 'Chlor: 17 Protonen, 10 innere Elektronen. Nettozug auf die äußere Schale: etwa 17 − 10 = 7.'),
          b('Bromine: 35 protons, 28 inner electrons. Net pull: about 35 − 28 = 7. The 18 extra protons and 18 extra inner electrons cancel.', 'Brom: 35 Protonen, 28 innere Elektronen. Nettozug: etwa 35 − 28 = 7. Die 18 zusätzlichen Protonen und 18 zusätzlichen inneren Elektronen heben sich auf.'),
          b('Same pull, but bromine\'s outer electrons are in shell 4, chlorine\'s in shell 3.', 'Gleicher Zug, aber die Außenelektronen von Brom sitzen in Schale 4, die von Chlor in Schale 3.'),
          b('Same pull from further away means a bigger atom: 115 pm against 100.', 'Gleicher Zug aus größerer Entfernung heißt größeres Atom: 115 pm gegen 100.'),
        ],
      },
    },
    {
      item: {
        id: 'u2-kcl', unit: 2, kind: 'choice', format: 'predict', withConfidence: true, evidence: 'transfer',
        concepts: ['u2.isoelectronic', 'u2.ions-size'], targets: ['ion-same-size', 'isoelectronic-same-size'],
        prompt: b('A potassium ion, {{K+}}, and a chloride ion, {{Cl-}}, have exactly the same electrons: 18, in shells 2, 8 and 8. As atoms, potassium is more than twice as wide as chlorine (220 against 100 pm). Which ion is bigger?',
          'Ein Kalium-Ion, {{K+}}, und ein Chlorid-Ion, {{Cl-}}, haben genau dieselben Elektronen: 18, in den Schalen 2, 8 und 8. Als Atome ist Kalium mehr als doppelt so breit wie Chlor (220 gegen 100 pm). Welches Ion ist größer?'),
        options: [
          { text: b('{{K+}}: potassium atoms are much bigger, and the ion keeps that', '{{K+}}: Kaliumatome sind viel größer, und das Ion behält das'), mis: 'ion-same-size' },
          { text: b('Both the same: same electrons in the same shells', 'Beide gleich: gleiche Elektronen in denselben Schalen'), mis: 'isoelectronic-same-size' },
          { text: b('{{Cl-}}: 17 protons hold the 18 electrons less tightly than 19 do', '{{Cl-}}: 17 Protonen halten die 18 Elektronen weniger fest als 19'), correct: true },
          { text: b('{{K+}}: its positive charge spreads its electrons out', '{{K+}}: Seine positive Ladung verteilt die Elektronen weiter') },
        ],
        explain: b('Same 18 electrons in the same shells, so only the nucleus differs: 19 protons in {{K+}} pull them in harder than 17 in {{Cl-}}. Potassium lost its whole fourth shell; chlorine gained an electron in its third.',
          'Dieselben 18 Elektronen in denselben Schalen, also unterscheidet sich nur der Kern: 19 Protonen in {{K+}} ziehen sie stärker heran als 17 in {{Cl-}}. Kalium hat seine ganze vierte Schale verloren, Chlor ein Elektron in seiner dritten dazubekommen.'),
      } as ChoiceItem,
      show: { engine: 'atom', z: 17, charge: -1, size: true },
      revealText: b('Chloride measures 181 pm, the potassium ion 138. Potassium went from the biggest atom in sight to the smaller ion: it lost its whole fourth shell, and its 19 protons then pull the remaining 18 electrons in harder than chlorine\'s 17 can. You will meet the two side by side in potassium chloride crystals in unit 4.',
        'Chlorid misst 181 pm, das Kalium-Ion 138. Kalium wird vom größten Atom weit und breit zum kleineren Ion: Es hat seine ganze vierte Schale verloren, und seine 19 Protonen ziehen die übrigen 18 Elektronen stärker heran, als die 17 von Chlor es können. In Einheit 4 triffst du die beiden nebeneinander in Kaliumchlorid-Kristallen.'),
      extra: {
        title: b('Same electrons, different pull', 'Gleiche Elektronen, anderer Zug'),
        steps: [
          b('{{K+}}: potassium (2, 8, 8, 1) loses its one electron in shell 4. Left: 18 electrons, 2, 8, 8, held by 19 protons.', '{{K+}}: Kalium (2, 8, 8, 1) gibt sein eines Elektron aus Schale 4 ab. Übrig: 18 Elektronen, 2, 8, 8, gehalten von 19 Protonen.'),
          b('{{Cl-}}: chlorine (2, 8, 7) gains one electron. Now 18 electrons, 2, 8, 8, held by 17 protons.', '{{Cl-}}: Chlor (2, 8, 7) nimmt ein Elektron auf. Jetzt 18 Elektronen, 2, 8, 8, gehalten von 17 Protonen.'),
          b('Same electrons in the same shells: the only difference is the pull. 19 protons pull harder than 17.', 'Gleiche Elektronen in denselben Schalen: Der einzige Unterschied ist der Zug. 19 Protonen ziehen stärker als 17.'),
          b('So {{K+}} is the smaller one: 138 pm against 181.', 'Also ist {{K+}} das kleinere: 138 pm gegen 181.'),
        ],
      },
    },
  ],

  examples: [
    {
      title: b('Sodium to chlorine', 'Von Natrium zu Chlor'),
      tag: 'Na · Cl',
      show: { engine: 'atom', z: 11, size: true },
      numbers: [{ v: '180 pm', label: b('sodium', 'Natrium') }, { v: '100 pm', label: b('chlorine', 'Chlor') }, { v: '1 → 7', label: b('net pull, Z_{eff}', 'Nettozug, Z_{eff}') }],
      body: b('Across a period each step adds one proton and one electron, and the electron joins the same outer shell. The inner electrons stay at 10, so the net pull rises from about 1 to about 7, and the shell is drawn in.',
        'Entlang einer Periode bringt jeder Schritt ein Proton und ein Elektron, und das Elektron kommt in dieselbe äußere Schale. Es bleiben 10 innere Elektronen, also steigt der Nettozug von etwa 1 auf etwa 7, und die Schale wird enger.'),
      soWhat: b('The same pull decides how tightly an atom holds its outer electrons: removing sodium\'s first one costs 496 kJ/mol, chlorine\'s 1251. Unit 3 builds on this.',
        'Derselbe Zug entscheidet, wie fest ein Atom seine Außenelektronen hält: Das erste von Natrium abzulösen kostet 496 kJ/mol, das von Chlor 1251. Einheit 3 baut darauf auf.'),
    },
    {
      title: b('Same electrons, more protons', 'Gleiche Elektronen, mehr Protonen'),
      tag: 'O²⁻ · Na⁺ · Mg²⁺',
      show: { engine: 'atom', z: 12, charge: 2, size: true },
      numbers: [{ v: '140 pm', label: b('oxide, O²⁻', 'Oxid, O²⁻') }, { v: '102 pm', label: b('sodium ion, Na⁺', 'Natrium-Ion, Na⁺') }, { v: '72 pm', label: b('magnesium ion, Mg²⁺', 'Magnesium-Ion, Mg²⁺') }],
      body: b('These ions all have 10 electrons in shells 2 and 8, the arrangement of neon. Only the nucleus differs: 8 protons in oxide, 11 in the sodium ion, 12 in the magnesium ion. Each extra proton pulls the same electrons tighter, and the size falls by half.',
        'Diese Ionen haben alle 10 Elektronen in den Schalen 2 und 8, die Anordnung von Neon. Nur der Kern unterscheidet sich: 8 Protonen im Oxid, 11 im Natrium-Ion, 12 im Magnesium-Ion. Jedes zusätzliche Proton zieht dieselben Elektronen enger, und die Größe halbiert sich.'),
      soWhat: b('In magnesium oxide a small, doubly charged {{Mg2+}} sits right against {{O2-}}. Small ions with big charges hold on hard: magnesium oxide melts at 2852 °C, which is why it lines furnaces. Unit 4 shows why.',
        'Im Magnesiumoxid sitzt ein kleines, doppelt geladenes {{Mg2+}} direkt an {{O2-}}. Kleine Ionen mit großer Ladung halten fest zusammen: Magnesiumoxid schmilzt bei 2852 °C, deshalb kleidet man Öfen damit aus. Einheit 4 zeigt, warum.'),
    },
    {
      title: b('Gold breaks the pattern', 'Gold bricht das Muster'),
      tag: 'Cu · Ag · Au',
      show: { engine: 'atom', z: 29, size: true },
      numbers: [{ v: '135 pm', label: b('copper', 'Kupfer') }, { v: '160 pm', label: b('silver', 'Silber') }, { v: '135 pm', label: b('gold', 'Gold') }],
      body: b('Down group 11 each row should be bigger. Silver is, but gold, a whole shell further out, comes out no bigger than silver (measured in the metals, both are 144 pm). Between silver\'s row and gold\'s, the lanthanides fill the 4f subshell with 14 electrons, and f electrons shield poorly. On top of that, near gold\'s 79 protons the 6s electron moves so fast that relativity shrinks its orbital.',
        'In Gruppe 11 sollte jede Zeile größer sein. Silber ist es, aber Gold, eine ganze Schale weiter außen, ist nicht größer als Silber (in den Metallen gemessen sind beide 144 pm). Zwischen der Zeile von Silber und der von Gold füllen die Lanthanoide die 4f-Unterschale mit 14 Elektronen, und f-Elektronen schirmen schlecht ab. Dazu kommt: Nahe den 79 Protonen von Gold bewegt sich das 6s-Elektron so schnell, dass die Relativitätstheorie sein Orbital schrumpfen lässt.'),
      soWhat: b('The simple count, Z minus inner electrons, assumes every inner electron shields fully. The f electrons are where that breaks. The same relativistic shrinking gives gold its colour; the gold card in the table explains how.',
        'Die einfache Rechnung, Z minus innere Elektronen, nimmt an, dass jedes innere Elektron vollständig abschirmt. Bei den f-Elektronen bricht das. Dasselbe relativistische Schrumpfen gibt Gold seine Farbe; die Gold-Karte im Periodensystem erklärt, wie.'),
    },
  ],

  flaw: {
    id: 'u2-flaw', unit: 2, kind: 'flaw', format: 'flaw', evidence: 'transfer', concepts: ['u2.distance', 'u2.shielding'], targets: ['shielding-down-group'],
    prompt: b('Where does this reasoning first go wrong?', 'Wo geht diese Überlegung zum ersten Mal schief?'),
    lines: [
      b('Sodium has 11 protons and 10 inner electrons; potassium has 19 protons and 18 inner electrons.', 'Natrium hat 11 Protonen und 10 innere Elektronen, Kalium 19 Protonen und 18 innere Elektronen.'),
      b('So potassium has 8 more protons pulling and 8 more inner electrons shielding.', 'Kalium hat also 8 Protonen mehr, die ziehen, und 8 innere Elektronen mehr, die abschirmen.'),
      b('The 8 extra inner electrons shield more than the 8 extra protons pull, so potassium\'s outer electron feels a weaker net pull.', 'Die 8 zusätzlichen inneren Elektronen schirmen mehr ab, als die 8 zusätzlichen Protonen ziehen, also spürt das Außenelektron von Kalium einen schwächeren Nettozug.'),
      b('That weaker pull is why potassium is bigger than sodium.', 'Dieser schwächere Zug ist der Grund, warum Kalium größer ist als Natrium.'),
    ],
    flaw: 2,
    alsoFalse: [3],
    near: [{ step: 1, note: b('Step 2 is true: the 8 new inner electrons do shield. The slip comes next, when step 3 says they shield more than the 8 new protons pull. In the simple model they cancel exactly: 19 − 18 = 1, the same as 11 − 10.', 'Schritt 2 stimmt: Die 8 neuen inneren Elektronen schirmen wirklich ab. Der Fehler kommt danach, wenn Schritt 3 behauptet, sie schirmten mehr ab, als die 8 neuen Protonen ziehen. Im einfachen Modell heben sie sich genau auf: 19 − 18 = 1, genau wie 11 − 10.') }],
    explain: b('Step 3 is where it goes wrong. Steps 1 and 2 are true, but 8 more protons and 8 more inner electrons cancel: the net pull is 11 − 10 = 1 for sodium and 19 − 18 = 1 for potassium. Potassium is bigger because its outer electron sits in shell 4, further out. Step 4 gives a true fact with the wrong reason, because it follows from step 3.',
      'Schritt 3 ist der Fehler. Schritt 1 und 2 stimmen, aber 8 Protonen mehr und 8 innere Elektronen mehr heben sich auf: Der Nettozug ist 11 − 10 = 1 bei Natrium und 19 − 18 = 1 bei Kalium. Kalium ist größer, weil sein Außenelektron in Schale 4 sitzt, weiter außen. Schritt 4 nennt eine wahre Tatsache mit falscher Begründung, weil er aus Schritt 3 folgt.'),
  } as FlawItem,

  deeper: {
    id: 'u2-deeper', unit: 2, kind: 'estimate', format: 'estimate', evidence: 'transfer', concepts: ['u2.zeff', 'u2.shielding'],
    prompt: b('Go deeper: Slater\'s rules refine "Z minus inner electrons". For an outer electron, each other electron in the same shell shields 0.35, each electron one shell below 0.85, each electron deeper down 1.00. Work out Z_{eff} for chlorine\'s outer electrons (Z = 17, shells 2, 8, 7).',
      'Tiefer gehen: Die Slater-Regeln verfeinern „Z minus innere Elektronen“. Für ein Außenelektron schirmt jedes andere Elektron derselben Schale 0,35 ab, jedes Elektron eine Schale tiefer 0,85, jedes noch tiefere 1,00. Berechne Z_{eff} für die Außenelektronen von Chlor (Z = 17, Schalen 2, 8, 7).'),
    min: 0, max: 12, step: 0.05, answer: 6.1, tolerance: 0.1, suffix: '',
    near: [
      { value: 7, tol: 0.1, note: b('That is the simple model, 17 − 10. Slater also counts the six other outer electrons (6 × 0.35) and lets the eight shell-2 electrons shield 0.85 each instead of 1.', 'Das ist das einfache Modell, 17 − 10. Slater zählt auch die sechs anderen Außenelektronen (6 × 0,35) und lässt die acht Elektronen der Schale 2 je 0,85 statt 1 abschirmen.') },
      { value: 4.9, tol: 0.1, note: b('You counted all ten inner electrons at 1.00. The eight in shell 2 sit just one shell below the outer electrons and shield 0.85 each.', 'Du hast alle zehn inneren Elektronen mit 1,00 gezählt. Die acht in Schale 2 liegen nur eine Schale unter den Außenelektronen und schirmen je 0,85 ab.') },
      { value: 5.75, tol: 0.1, note: b('Count the other outer electrons: six, not seven. The electron you are looking at does not shield itself.', 'Zähl die anderen Außenelektronen: sechs, nicht sieben. Das betrachtete Elektron schirmt sich nicht selbst ab.') },
    ],
    explain: b('17 − (6 × 0.35 + 8 × 0.85 + 2 × 1.00) = 17 − 10.9 = 6.1. For sodium\'s outer electron the same rules give 11 − (8 × 0.85 + 2 × 1.00) = 2.2. Both refined values sit between the simple ones, but the gap stays: chlorine\'s outer electrons feel almost three times the pull.',
      '17 − (6 × 0,35 + 8 × 0,85 + 2 × 1,00) = 17 − 10,9 = 6,1. Für das Außenelektron von Natrium ergeben dieselben Regeln 11 − (8 × 0,85 + 2 × 1,00) = 2,2. Beide verfeinerten Werte liegen zwischen den einfachen, aber der Abstand bleibt: Die Außenelektronen von Chlor spüren fast den dreifachen Zug.'),
  } as EstimateItem,

  explain: {
    prompt: b('In your own words: what decides how big an atom or an ion is?', 'In eigenen Worten: Was bestimmt, wie groß ein Atom oder ein Ion ist?'),
    ideas: [
      { id: 'zeff', concept: 'u2.zeff', idea: b('The outer electrons feel a net pull: the protons minus the inner electrons that shield them', 'Die Außenelektronen spüren einen Nettozug: die Protonen minus die inneren Elektronen, die sie abschirmen'),
        contra: { en: /\b(outer|outermost|valence) electrons? (feel|feels|get|gets|see|sees) (the )?(full|whole|entire|total) (nuclear )?(charge|pull|attraction)/, de: /(außen|äußer)\w* elektron\w* (spür|merk|seh)\w* (die )?(volle|ganze|gesamte) (kernladung|anziehung|ladung|zug)/ },
        en: /(shield|screen|block|cancel|z.?eff|effective|net (pull|charge|attraction|force)|minus the inner|protons? minus|(get|gets|stand|stands|are|is|sit|sits) in the way|(only|just) (feel|feels|get|gets|see|sees) (a |some |)part of the (pull|charge|attraction)|inner electrons?.{0,50}(between|in the way|reduce|weaken|cancel|take away|less))/,
        de: /(abschirm|schirm|effektiv|z.?eff|netto|abzüglich|minus (der |die )?inner|protonen minus|im weg|(nur|bloß) (einen )?teil (der|des) (anziehung|ladung|kernladung|zugs?)|inner\w* elektronen.{0,50}(dazwischen|schwäch|verringer|heb|weniger|nehm))/ },
      { id: 'across', concept: 'u2.radius-trend', idea: b('Across a period the protons increase but the shell stays the same, so the pull grows and the atom shrinks', 'In einer Periode steigen die Protonen, die Schale bleibt gleich, also wächst der Zug und das Atom schrumpft'),
        en: /((across|along|left to right|through) (a |the )?(row|period).{0,90}(small|shrink|contract|pull|tight|closer|drawn in|in))|((more|extra|additional|each new) protons?.{0,70}(same shell|same layer|pull\w* (harder|more|stronger|in|closer)|closer|tighter|smaller|shrink))|((row|period).{0,60}(smaller|shrink|get small))/,
        de: /((entlang|innerhalb|in|quer durch) (einer |der )?(periode|zeile).{0,90}(klein|schrumpf|zieh|enger|näher|zug))|((mehr|zusätzlich\w*|jedes neue) protonen?.{0,70}(gleiche\w* schale|zieh\w* (stärker|mehr|enger)|näher|enger|klein|schrumpf))|((periode|zeile).{0,60}(kleiner|schrumpf))/ },
      { id: 'down', concept: 'u2.distance', idea: b('Down a group each row adds a shell further out, while the pull stays about the same, so the atom grows', 'In der Gruppe nach unten kommt mit jeder Zeile eine Schale weiter außen dazu, der Zug bleibt etwa gleich, also wächst das Atom'),
        contra: { en: /^(?!.*(cancel|balance|same|offset|equal)).*((more|extra|stronger|better|increased) shielding.*(bigger|larger|grow)|(bigger|larger|grow).*(more|extra|stronger|better|increased) shielding|shield\w* (more|better) than)/, de: /^(?!.*(aufheb|heben sich|gleich|ausgleich)).*((mehr|stärker\w*|besser\w*|zusätzlich\w*) abschirmung.*(größer|wächst|wachsen)|(größer|wächst|wachsen).*(mehr|stärker\w*|besser\w*|zusätzlich\w*) abschirmung|(stärker|besser|mehr) ab(schirm|geschirmt)\w* als)/ },
        en: /((down|lower|further down|below|next row).{0,70}(new|extra|another|more|additional|outer|bigger) (shell|layer|level|orbit))|((new|extra|another|more|additional|an added) (shell|layer|level).{0,70}(further|farther|out|bigger|larger|grow|distance|away))|(further|farther) (out|away|from the nucleus)|distance/,
        de: /((nach unten|tiefer|weiter unten|nächste\w* zeile).{0,70}(neue|zusätzliche|weitere|mehr|äußere) schale)|((neue|zusätzliche|weitere|eine weitere|noch eine) schale.{0,70}(weiter|außen|größer|abstand|entfernt|wächst))|weiter (außen|weg|entfernt)|abstand|entfernung/ },
      { id: 'ions', concept: 'u2.ions-size', idea: b('Losing electrons makes an ion smaller than its atom, gaining electrons makes it bigger', 'Elektronen abgeben macht ein Ion kleiner als sein Atom, Elektronen aufnehmen macht es größer'),
        contra: { en: /\b(ions?|cations?|anions?) (are|is|stay|stays|remain|remains) (about |roughly )?(the same size|as big as|as large as)/, de: /(ion|ionen|kation\w*|anion\w*) (sind|ist|bleib\w*) (etwa |ungefähr )?(gleich groß|genauso groß|so groß wie)/ },
        en: /((los|lose|loses|losing|lost|remov|giv|give|gives|giving|gave).{0,70}(smaller|shrink|less room))|((gain|gains|gaining|gained|add|adds|adding|extra electron|takes? (on|up)).{0,70}(bigger|larger|swell|grow|expand|more room))|((positive|cation)s?.{0,50}(smaller|shrink))|((negative|anion)s?.{0,50}(bigger|larger|swell|grow))/,
        de: /((abgeb|abgib|abgegeben|gibt .{0,30}ab|verlier|verlust|verloren|entfern).{0,70}(klein|schrumpf))|((aufnehm|aufnimm|aufgenommen|nimmt .{0,30}auf|dazu|zusätzlich\w* elektron|gewinn).{0,70}(größ|wächst|wachsen|schwill|bläh|dehn))|((positiv|kation)\w*.{0,50}(klein|schrumpf))|((negativ|anion)\w*.{0,50}(größ|wächst|wachsen|schwill))/ },
      { id: 'iso', concept: 'u2.isoelectronic', idea: b('With the same electrons, more protons make a smaller ion', 'Bei gleichen Elektronen machen mehr Protonen ein Ion kleiner'),
        contra: { en: /(same|equal|identical) (number of )?electrons?.{0,30}(same|equal|identical) size/, de: /gleich\w* (viele |anzahl |zahl )?(an )?elektronen.{0,30}gleich groß/ },
        en: /((same|equal|identical) (number of |set of )?electrons?.{0,90}(more protons?|higher (nuclear )?charge|bigger nucleus|stronger pull|pull\w* (harder|tighter)|smaller))|((more protons?|higher nuclear charge|bigger nuclear charge).{0,70}same (number of )?electrons?)|((with|has|have|having) (the )?(more|most) protons?.{0,40}(small|tight))|(more protons?.{0,30}smaller (ion|particle))|isoelectronic/,
        de: /((gleich\w* (viele |anzahl |zahl )?(an )?elektronen?).{0,90}(mehr protonen|höher\w* kernladung|größer\w* kernladung|stärker|enger|klein))|((mehr protonen|höher\w* kernladung).{0,70}gleich\w* (viele )?elektronen)|((mit|hat|haben) (den )?(mehr|meisten) protonen.{0,40}(klein|eng))|(gleich\w* elektronenzahl.{0,90}(mehr protonen|klein))|(mehr protonen.{0,30}klein\w* (ion|teilchen))|isoelektronisch/ },
    ] as Idea[],
    tightened: b('The outer electrons feel the protons minus the inner electrons that shield them, a net pull called Z_{eff}. Across a period each step adds a proton but no new shell, so the pull grows and the atom shrinks; down a group each row adds a shell further out while the pull stays about the same, so the atom grows. Losing electrons makes an ion smaller than its atom and gaining them makes it bigger, and among ions with the same electrons, more protons mean a smaller ion.',
      'Die Außenelektronen spüren die Protonen minus die inneren Elektronen, die sie abschirmen: einen Nettozug namens Z_{eff}. In einer Periode bringt jeder Schritt ein Proton, aber keine neue Schale, also wächst der Zug und das Atom schrumpft; in einer Gruppe kommt mit jeder Zeile eine Schale weiter außen dazu, während der Zug etwa gleich bleibt, also wächst das Atom. Elektronen abgeben macht ein Ion kleiner als sein Atom, Elektronen aufnehmen macht es größer, und bei Ionen mit gleichen Elektronen heißen mehr Protonen ein kleineres Ion.'),
  },

  terms: ['zeff', 'shielding', 'atomic-radius', 'ionic-radius', 'isoelectronic'],

  readings: [
    {
      lang: 'en', kind: 'quick',
      title: b('Variation in covalent radii', 'Variation in covalent radii'), source: 'University of Calgary, Chemistry Textbook',
      url: 'https://chem-textbook.ucalgary.ca/variation-in-covalent-radii/',
      lookFor: [
        b('The halogen table: chlorine 99 pm, bromine 114 pm. Compare them with the 100 and 115 pm in the app and with your bromine prediction.', ''),
        b('The reason it gives for the trend down a group. Is it distance or shielding?', ''),
        b('How it explains the trend across a period with the effective nuclear charge. Match it with the Z_{eff} readout you watched from sodium to chlorine.', ''),
      ],
    },
    {
      lang: 'en', kind: 'deeper',
      title: b('Atomic and ionic radius', 'Atomic and ionic radius'), source: 'Chemguide',
      url: 'https://www.chemguide.co.uk/atoms/properties/atradius.html',
      lookFor: [
        b('The three kinds of radius (metallic, covalent, van der Waals). Which kind are the radii in this app closest to?', ''),
        b('Its ionic radii: Na⁺ 0.102 nm, Mg²⁺ 0.072 nm, Cl⁻ 0.181 nm. These are the same values as in the app, written in nanometres.', ''),
        b('Why the author doubts the usual explanation for Cl⁻ being so much bigger than a chlorine atom. Compare it with the note in the app that atom and ion sizes are not measured quite alike.', ''),
      ],
    },
    {
      lang: 'de', kind: 'quick',
      title: b('Atomradius', 'Atomradius'), source: 'chemie.de Lexikon',
      url: 'https://www.chemie.de/lexikon/Atomradius.html',
      lookFor: [
        b('', 'Die Tabelle der Radien: Natrium 186 pm, Chlor 99 pm, Kalium 231 pm. Die App zeigt 180, 100 und 220 pm. Warum können sich die Werte je nach Messart um ein paar pm unterscheiden?'),
        b('', 'Die vier Arten von Radius (Ionen-, Kovalenz-, Metall-, Van-der-Waals-Radius). Welche passt zu den Ionen, die du in der App angetippt hast?'),
        b('', 'Der Satz zum Trend in Periode und Gruppe. Der Artikel nennt den Trend, aber keinen Grund: Schreib in einem Satz dazu, warum.'),
      ],
    },
  ],

  misconceptions: [
    { id: 'more-electrons-bigger', name: b('More electrons always make a bigger atom', 'Mehr Elektronen machen ein Atom immer größer') },
    { id: 'full-charge-felt', name: b('Outer electrons feel the full nuclear charge', 'Außenelektronen spüren die volle Kernladung') },
    { id: 'shielding-down-group', name: b('Atoms grow down a group because of extra shielding', 'Atome wachsen in der Gruppe nach unten wegen zusätzlicher Abschirmung') },
    { id: 'ion-same-size', name: b('An ion is about the same size as its atom', 'Ein Ion ist etwa so groß wie sein Atom') },
    { id: 'isoelectronic-same-size', name: b('Same number of electrons means the same size', 'Gleich viele Elektronen heißt gleich groß') },
  ],

  glossary: {
    shielding: {
      en: 'shielding', de: 'Abschirmung', unit: 2,
      def: { en: 'Inner electrons sit between the nucleus and the outer electrons and cancel part of its pull.', de: 'Innere Elektronen sitzen zwischen dem Kern und den Außenelektronen und heben einen Teil seiner Anziehung auf.' },
      falseFriend: { en: 'Also called "screening" in English.', de: 'Im Englischen auch „screening“.' },
    },
    'atomic-radius': {
      en: 'atomic radius', de: 'Atomradius', unit: 2,
      def: { en: 'The size of an atom, worked out from the distances between the nuclei of bonded atoms. Atoms have no sharp edge, so the value depends on how it is measured.', de: 'Die Größe eines Atoms, ermittelt aus den Abständen der Kerne gebundener Atome. Atome haben keinen scharfen Rand, der Wert hängt also von der Messart ab.' },
    },
    'ionic-radius': {
      en: 'ionic radius', de: 'Ionenradius', unit: 2,
      def: { en: 'The size of an ion, worked out from the distances between ions in crystals.', de: 'Die Größe eines Ions, ermittelt aus den Abständen der Ionen in Kristallen.' },
    },
    isoelectronic: {
      en: 'isoelectronic', de: 'isoelektronisch', unit: 2,
      def: { en: 'Having the same number of electrons, like O²⁻, F⁻, Na⁺ and Mg²⁺ (10 each). Among them, more protons means a smaller particle.', de: 'Mit gleich vielen Elektronen, wie O²⁻, F⁻, Na⁺ und Mg²⁺ (je 10). Unter ihnen heißen mehr Protonen ein kleineres Teilchen.' },
    },
  },
};
