// Unit 10 — Hydrogen-bond donors and acceptors, on the hydrogen-bond view (Molecule Workbench family).
// Data: boiling points, electron counts, molar masses, dipole moments, donors and acceptors from substances.ts
// (CRC Handbook, NIST WebBook), including HYDRIDE_ROWS for the puzzle table and WATER (a hydrogen bond in water is
// about 20 kJ/mol). Bond energies from bonds.ts: O–H 464, N–H 390, H–F 569, C–H 415 kJ/mol; O–H 96 pm.
// Electronegativities (Pauling) and empirical radii from the elements table: H 2.20, C 2.55, N 3.04 (65 pm),
// O 3.44 (60 pm), F 3.98 (50 pm), S 2.58 (100 pm), Cl 3.16 (100 pm). H···O distance in a hydrogen bond about
// 180–200 pm (the view draws about 190 pm). Extrapolating H₂Te −2.2, H₂Se −41.3, H₂S −60.3 °C gives water roughly
// −70 to −90 °C; the text says "around −80 °C" and calls it a trend estimate.
// Counting convention used throughout (and in unit 11): every hydrogen bond needs one donor (H on N, O or F) and one
// acceptor (a lone pair on N, O or F). "Takes part in" counts bond ends: a water molecule takes part in up to four
// (two through its H, two through its lone pairs). "Per molecule (each bond counted once)" divides by two, because
// each bond joins two molecules: water 2, HF and NH₃ about 1 as a rule of thumb (the scarcer of donors and acceptors
// limits them). The two phrasings are never mixed in one sentence. Strong hydrogen bonds need N, O or F. Cl and S are
// large, so their lone pairs accept only weakly (liquid HCl, Cl–H···Cl, has only weak hydrogen bonds), and an H on S
// gives only weak ones; HCl's H does bond to water's oxygen (HCl···OH₂ about 16 kJ/mol against 13 for the water dimer,
// gas phase), and in water HCl hands its proton over (unit 26). The school rule and the hydrogen-bond view count N, O
// and F only. Temperature differences are given in K.
// H₂O₂ boils at 150.2 °C (CRC Handbook), used in the go-deeper rank.
import type { Bi } from '../i18n';
import type { ChoiceItem, RankItem, FlawItem } from './items';
import type { Idea } from './unit06';
import type { UnitContent } from './unitTypes';

const b = (en: string, de: string): Bi => ({ en, de });

// ---------- explain-back patterns ----------
// Negation guard for the contra patterns: a clause that denies the misconception must not rule an idea out.
const NOT_EN = '^(?!.*\\b(not|n\'t|never|no|cannot|without|rather than|instead of)\\b)';
const NOT_DE = '^(?!.*\\b(nicht|kein\\w*|nie|niemals|ohne|statt|anstatt)\\b)';

// Misconception: a hydrogen bond is the covalent O–H bond, broken when water boils.
const HBOND_COVALENT = {
  en: new RegExp(NOT_EN + '.*((boil\\w*|evaporat\\w*|vapou?ri[sz]\\w*).{0,50}(break|split|separat)\\w* (the |its |their )?(o–h|o-h|n–h|n-h|h–f|h-f|covalent|bonds? (inside|within))|(boil\\w*|evaporat\\w*).{0,50}(o–h|o-h|n–h|n-h|covalent)( bonds?)? (break|split|are broken|get broken|come apart)|(hydrogen bonds?|h-bonds?) (is|are) (an? |the )?(covalent|shared pair|o–h|o-h))'),
  de: new RegExp(NOT_DE + '.*((sied\\w*|verdampf\\w*).{0,50}(brech|spalt|trenn|zerfall)\\w* (die |ihre )?(o–h|o-h|n–h|h–f|atombindung|kovalent|bindungen im)|(sied\\w*|verdampf\\w*).{0,50}(o–h|o-h|n–h|atombindung\\w*|kovalente).{0,30}(gebrochen|gespalten|getrennt|aufgebrochen)|(wasserstoffbrücke\\w*|h-brücke\\w*) (ist|sind) (eine |die )?(atombindung|kovalente|elektronenpaarbindung|o–h))'),
};
// Misconception: any H can hydrogen-bond, including H on carbon.
const ANY_H = {
  en: new RegExp(NOT_EN + '.*((c–h|c-h|ch4|methane|carbon\'?s? h\\w*)\\b.{0,40}(form|make|donat|give)\\w*.{0,20}(hydrogen bond|h-bond)|\\bany (h|hydrogen)( atoms?)? can)'),
  de: new RegExp(NOT_DE + '.*((c–h|c-h|ch4|methan)\\b.{0,40}(bild|geb|spend|donier)\\w*.{0,20}(wasserstoffbrücke|h-brücke)|\\bjedes h(-atom)? kann)'),
};
// Misconception: more H atoms, more hydrogen bonds.
const MORE_H = {
  en: new RegExp(NOT_EN + '.*(more|most|three|3) (h|hydrogens?|h atoms|hydrogen atoms|donors)\\b.{0,40}(more|most|stronger|higher) (hydrogen bonds|h-bonds|boil)'),
  de: new RegExp(NOT_DE + '.*(mehr|meisten|drei|3) (h|h-atome|wasserstoff\\w*|donoren)\\b.{0,40}(mehr|meisten|stärker\\w*|höher\\w*) (wasserstoffbrücken|h-brücken|sied)'),
};

export const UNIT10: UnitContent = {
  n: 10,
  title: b('Hydrogen-bond donors and acceptors', 'Wasserstoffbrücken: Donor und Akzeptor'),
  lead: b('Why water boils at 100 °C instead of far below zero, and which molecules can join in.', 'Warum Wasser bei 100 °C siedet statt weit unter null, und welche Moleküle mitmachen können.'),

  puzzle: {
    title: b('Water breaks ranks', 'Wasser tanzt aus der Reihe'),
    lead: b('Each column holds the compounds of hydrogen with one group: CH₄ to SnH₄, NH₃ to SbH₃, H₂O to H₂Te, HF to HI. Going down a column the molecules have more electrons and usually boil higher, as unit 8 showed for dispersion. Look at the top row, period 2.',
      'Jede Spalte enthält die Wasserstoffverbindungen einer Gruppe: CH₄ bis SnH₄, NH₃ bis SbH₃, H₂O bis H₂Te, HF bis HI. In einer Spalte nach unten haben die Moleküle mehr Elektronen und sieden meist höher, wie Einheit 8 für die Dispersionskräfte gezeigt hat. Sieh dir die oberste Zeile der Tabelle an, die 2. Periode.'),
    data: {
      caption: b('Boiling points in °C of the hydrogen compounds of groups 14 to 17. Each row is one period; each column one group. The two question marks, NH₃ and HF, stay hidden for now.',
        'Siedetemperaturen in °C der Wasserstoffverbindungen der Gruppen 14 bis 17 (IV. bis VII. Hauptgruppe). Jede Zeile ist eine Periode, jede Spalte eine Gruppe. Die zwei Fragezeichen, NH₃ und HF, bleiben vorerst verdeckt.'),
      head: [b('Period', 'Periode'), b('14: XH₄', '14: XH₄'), b('15: XH₃', '15: XH₃'), b('16: H₂X', '16: H₂X'), b('17: HX', '17: HX')],
      rows: [
        { cells: [b('2: C, N, O, F', '2: C, N, O, F'), '−161.5', '?', '100', '?'], mystery: true },
        { cells: [b('3: Si, P, S, Cl', '3: Si, P, S, Cl'), '−111.9', '−87.7', '−60.3', '−85.1'] },
        { cells: [b('4: Ge, As, Se, Br', '4: Ge, As, Se, Br'), '−88.5', '−62.5', '−41.3', '−66.8'] },
        { cells: [b('5: Sn, Sb, Te, I', '5: Sn, Sb, Te, I'), '−52', '−17', '−2.2', '−35.4'] },
      ],
      numeric: [1, 2, 3, 4],
    },
    clash: b('Group 14 follows the rule all the way: methane boils lowest. Group 16 does not. By the trend of H₂S, H₂Se and H₂Te, water would boil somewhere around −80 °C and be a gas at room temperature; it boils at 100 °C. The two hidden ones, NH₃ and HF, break ranks too, as you will see. What makes these molecules hold on to each other so much harder?',
      'Gruppe 14 folgt dem Trend bis in die 2. Periode: Methan siedet am niedrigsten. Gruppe 16 nicht. Nach dem Trend von H₂S, H₂Se und H₂Te müsste Wasser irgendwo um −80 °C sieden und bei Raumtemperatur ein Gas sein; es siedet bei 100 °C. Die zwei verdeckten, NH₃ und HF, tanzen ebenfalls aus der Reihe, wie du noch siehst. Warum halten diese Moleküle so viel stärker zusammen?'),
    question: {
      id: 'u10-puzzle', unit: 10, kind: 'choice', format: 'predict', withConfidence: true, evidence: 'predict',
      concepts: ['u10.anomaly', 'u10.donor-acceptor'], targets: ['hbond-is-covalent'],
      prompt: b('Your best guess:', 'Deine beste Vermutung:'),
      options: [
        { text: b('Their molecules are the lightest, and lighter molecules boil higher', 'Ihre Moleküle sind die leichtesten, und leichtere Moleküle sieden höher') },
        { text: b('Their O–H, F–H and N–H bonds are very strong, and boiling has to break them', 'Ihre O–H-, F–H- und N–H-Bindungen sind sehr stark, und beim Sieden müssen sie brechen'), mis: 'hbond-is-covalent' },
        { text: b('An H on a small, strongly electronegative atom is attracted to a lone pair on the next molecule', 'Ein H an einem kleinen, stark elektronegativen Atom wird von einem freien Elektronenpaar des Nachbarmoleküls angezogen'), correct: true },
        { text: b('Only these three are polar; the heavier ones in each column are not', 'Nur diese drei sind polar; die schwereren in jeder Spalte nicht') },
      ],
      explain: b('In H₂O, HF and NH₃ the H sits on O, F or N, which pull on the shared pair so hard that the H is left strongly δ+ (positive, as in unit 5). It is attracted to a lone pair on the O, F or N of a neighbouring molecule: a [[h-bond]]. Boiling has to pull these attractions apart, while the bonds inside each molecule stay whole. H₂S is polar too (0.97 D; D, the debye, is the unit of the dipole moment), but sulfur is bigger and pulls less: its hydrogen bonds are very weak.',
        'In H₂O, HF und NH₃ sitzt das H an O, F oder N, die so stark am gemeinsamen Elektronenpaar ziehen, dass das H eine deutlich positive Partialladung erhält (δ+, wie in Einheit 5). Es wird von einem freien Elektronenpaar am O, F oder N eines Nachbarmoleküls angezogen: eine [[h-bond]]. Beim Sieden müssen diese Anziehungen gelöst werden; die Bindungen in jedem Molekül bleiben ganz. Auch H₂S ist polar (0,97 D; D steht für Debye, die Einheit des Dipolmoments), aber Schwefel ist größer und zieht schwächer: Seine Wasserstoffbrücken sind sehr schwach.'),
    } as ChoiceItem,
    after: b('Next: see which atoms bring the H and which take it.', 'Als Nächstes: Sieh dir an, welche Atome das H mitbringen und welche es aufnehmen.'),
  },

  explore: {
    title: b('The hydrogen-bond view', 'Die Wasserstoffbrücken-Ansicht'),
    intro: b('Each molecule appears with its atoms, bonds and lone pairs. A blue halo marks an H on N, O or F: it is strongly δ+, and it is what a molecule brings to a hydrogen bond, so it is called a hydrogen-bond donor. A purple lobe on N, O or F is a lone pair that attracts such an H from another molecule: a hydrogen-bond acceptor. Pick a partner and the view joins the two molecules by the best hydrogen bond it finds, drawn as a dashed line, or says why there is none. Strong hydrogen bonds need N, O or F, so the view counts only those. Chlorine and sulfur are large atoms: their lone pairs accept only weakly, and an H on sulfur gives only weak hydrogen bonds. Lengths are in pm (picometres, trillionths of a metre).',
      'Jedes Molekül erscheint mit seinen Atomen, Bindungen und freien Elektronenpaaren. Ein blauer Ring markiert ein H an N, O oder F: Es trägt eine deutliche positive Partialladung (δ+), und dieses H bringt das Molekül in eine Wasserstoffbrücke ein; man nennt es Donor. Eine lila Keule an N, O oder F ist ein freies Elektronenpaar, das ein solches H eines anderen Moleküls anzieht: ein Akzeptor. Nicht verwechseln mit dem Protonendonator bei Säuren: Hier bleibt das H an seinem Molekül. Wähle einen Partner, und die Ansicht verbindet beide Moleküle über die beste Wasserstoffbrücke, die sie findet, als gestrichelte Linie, oder sagt, warum es keine gibt. Starke Wasserstoffbrücken brauchen N, O oder F, deshalb zählt die Ansicht nur diese. Chlor und Schwefel sind große Atome: Ihre freien Elektronenpaare sind nur schwache Akzeptoren, und ein H am Schwefel bildet nur schwache Wasserstoffbrücken. Längen sind in pm angegeben (Pikometer, billionstel Meter).'),
    tasks: [
      { id: 'water', key: true, text: b('Pick water. How many donors and how many acceptors does one molecule have?', 'Wähle Wasser aus. Wie viele Donoren und wie viele Akzeptoren hat ein Molekül?') },
      { id: 'pair', key: true, text: b('Join two water molecules. How long is the hydrogen bond compared with the O–H bond?', 'Verbinde zwei Wassermoleküle. Wie lang ist die Wasserstoffbrücke im Vergleich zur O–H-Bindung?') },
      { id: 'methane', key: true, text: b('Try methane with water. Why does no hydrogen bond form?', 'Probier Methan mit Wasser. Warum entsteht keine Wasserstoffbrücke?') },
      { id: 'ether', key: true, text: b('Join dimethyl ether with water. Which molecule brings the H?', 'Verbinde Dimethylether mit Wasser. Welches Molekül bringt das H mit?') },
      { id: 'ether-self', text: b('Now pair dimethyl ether with dimethyl ether.', 'Kombiniere jetzt Dimethylether mit Dimethylether.') },
      { id: 'cluster', challenge: true, text: b('Build water with four neighbours. How many of the four hydrogen bonds does the middle molecule donate, and how many does it accept?', 'Baue Wasser mit vier Nachbarn. Bei wie vielen der vier Wasserstoffbrücken ist das mittlere Molekül Donor, bei wie vielen Akzeptor?') },
    ],
    notes: {
      water: b('Two donors: the two H on oxygen. Two acceptors: the two lone pairs on oxygen. An H on carbon never gets a halo.', 'Zwei Donoren: die zwei H am Sauerstoff. Zwei Akzeptoren: die zwei freien Elektronenpaare am Sauerstoff. Ein H am Kohlenstoff bekommt nie einen Ring.'),
      pair: b('The hydrogen bond is about 190 pm long, twice the 96 pm of the O–H bond: a longer, much weaker attraction, here between two molecules. Exams call it a hydrogen bond; make clear that it is not a covalent bond. In large molecules such as proteins, a hydrogen bond can also join two parts of the same molecule.',
        'Die Wasserstoffbrücke ist etwa 190 pm lang, doppelt so lang wie die O–H-Bindung mit 96 pm: eine längere, viel schwächere Anziehung, hier zwischen zwei Molekülen. In der Klausur schreibst du „Wasserstoffbrücke“ oder „Wasserstoffbrückenbindung“, beides ist üblich; wichtig ist, dass sie keine Atombindung ist. In großen Molekülen wie Proteinen kann eine Wasserstoffbrücke auch zwei Teile desselben Moleküls verbinden.'),
      methane: b('Methane\'s four H sit on carbon. Carbon (electronegativity 2.55) barely pulls on them, so they are hardly δ+, and carbon has no lone pair to accept with. Water\'s H would point at nothing.',
        'Die vier H des Methans sitzen am Kohlenstoff. Kohlenstoff (EN 2,55) zieht kaum an ihnen, also sind sie kaum δ+, und Kohlenstoff hat kein freies Elektronenpaar als Akzeptor. Das H des Wassers fände kein Ziel.'),
      ether: b('The ether\'s oxygen has two lone pairs, so it can accept. All six of its H sit on carbon, so it cannot donate: water brings the H.',
        'Der Sauerstoff des Ethers hat zwei freie Elektronenpaare, er kann also Akzeptor sein. Alle sechs H sitzen am Kohlenstoff, er kann also kein Donor sein: Das H liefert das Wassermolekül.'),
      'ether-self': b('Lone pairs on both sides, but no donor anywhere. Two ether molecules hold together only by weaker forces (dispersion and dipole–dipole, units 8 and 9): dimethyl ether boils at −24.8 °C.',
        'Freie Elektronenpaare auf beiden Seiten, aber nirgends ein Donor. Zwei Ethermoleküle halten nur über schwächere Kräfte zusammen (Dispersionskräfte und Dipol-Dipol-Kräfte, Einheiten 8 und 9): Dimethylether siedet bei −24,8 °C.'),
      cluster: b('The middle molecule donates two hydrogen bonds (from its two H) and accepts two (on its two lone pairs): it takes part in four, pointing to the corners of a tetrahedron, as in ice. Each bond joins two molecules, so in ice there are two whole bonds per molecule. Unit 11 builds the whole network.',
        'Das mittlere Molekül ist zweimal Donor (über seine zwei H) und zweimal Akzeptor (an seinen zwei freien Elektronenpaaren): Es ist an vier beteiligt, in die Ecken eines Tetraeders gerichtet, wie im Eis. Jede Brücke verbindet zwei Moleküle, im Eis kommen also zwei ganze Brücken auf ein Molekül. In Einheit 11 geht es um das ganze Netzwerk.'),
    },
    check: {
      id: 'u10-check', unit: 10, kind: 'rank', format: 'rank', evidence: 'predict', concepts: ['u10.donor-acceptor'],
      prompt: b('Rank by the number of donors in one molecule (H on N, O or F), most first.', 'Ordne nach der Zahl der Donoren in einem Molekül (H an N, O oder F), die meisten zuerst.'),
      order: [b('ammonia, {{NH3}}', 'Ammoniak, {{NH3}}'), b('water, {{H2O}}', 'Wasser, {{H2O}}'), b('methanol, {{CH3OH}}', 'Methanol, {{CH3OH}}'), b('dimethyl ether, {{CH3OCH3}}', 'Dimethylether, {{CH3OCH3}}')],
      explain: b('Count only H on N, O or F: ammonia\'s three N–H, water\'s two O–H, methanol\'s single O–H (its three C–H do not count) and none for dimethyl ether, whose six H all sit on carbon.',
        'Es zählen nur H an N, O oder F: die drei N–H des Ammoniaks, die zwei O–H des Wassers, das eine O–H des Methanols (seine drei C–H zählen nicht) und keines beim Dimethylether, dessen sechs H alle am Kohlenstoff sitzen.'),
    } as RankItem,
  },

  predictions: [
    {
      item: {
        id: 'u10-nh3', unit: 10, kind: 'choice', format: 'predict', withConfidence: true, evidence: 'predict',
        concepts: ['u10.count'], targets: ['more-h-more-hbonds'],
        prompt: b('Ammonia, {{NH3}}, has three H on nitrogen and one lone pair. Water, {{H2O}}, has two H on oxygen and two lone pairs. Both have 10 electrons. Which boils higher?',
          'Ammoniak, {{NH3}}, hat drei H am Stickstoff und ein freies Elektronenpaar. Wasser, {{H2O}}, hat zwei H am Sauerstoff und zwei freie Elektronenpaare. Beide haben 10 Elektronen. Welches siedet höher?'),
        options: [
          { text: b('Ammonia: three donors make more hydrogen bonds than two', 'Ammoniak: Drei Donoren bilden mehr Wasserstoffbrücken als zwei'), mis: 'more-h-more-hbonds' },
          { text: b('Water: every hydrogen bond needs a donor and an acceptor, and water has two of each', 'Wasser: Jede Wasserstoffbrücke braucht einen Donor und einen Akzeptor, und Wasser hat von beiden zwei'), correct: true },
          { text: b('Neither: same number of electrons, same boiling point', 'Keines: gleiche Elektronenzahl, gleiche Siedetemperatur') },
          { text: b('Ammonia: nitrogen holds its H more loosely, so they are freer to bond', 'Ammoniak: Stickstoff hält seine H lockerer, also können sie freier binden') },
        ],
        explain: b('Each hydrogen bond pairs one donor with one acceptor. Water\'s two H and two lone pairs match up; ammonia has three H but only one lone pair, so as a rule of thumb most of its H find no partner, and N–H···N bonds are weaker as well.',
          'Jede Wasserstoffbrücke paart einen Donor mit einem Akzeptor. Beim Wasser passen zwei H und zwei freie Elektronenpaare zusammen; Ammoniak hat drei H, aber nur ein freies Elektronenpaar, also finden als Faustregel die meisten seiner H keinen Partner, und N–H···N-Brücken sind außerdem schwächer.'),
      } as ChoiceItem,
      show: { engine: 'hbond', a: 'NH3' },
      revealText: b('Water boils at 100 °C, ammonia at −33.3 °C. As a rule of thumb, every hydrogen bond needs one of ammonia\'s lone pairs, and each molecule has only one: about one hydrogen bond per ammonia molecule (each bond counted once), against two per water molecule, whose donors and acceptors match up exactly. Nitrogen also pulls less than oxygen, so each N–H···N bond is weaker than an O–H···O bond.',
        'Wasser siedet bei 100 °C, Ammoniak bei −33,3 °C. Als Faustregel braucht jede Wasserstoffbrücke eines der freien Elektronenpaare des Ammoniaks, und jedes Molekül hat nur eines: Auf ein Ammoniakmolekül kommt etwa eine Wasserstoffbrücke (jede einmal gezählt), auf ein Wassermolekül zwei, weil Donoren und Akzeptoren genau zusammenpassen. Außerdem zieht Stickstoff schwächer als Sauerstoff, deshalb ist jede N–H···N-Brücke schwächer als eine O–H···O-Brücke.'),
      extra: {
        title: b('Count both sides of each hydrogen bond', 'Beide Seiten jeder Wasserstoffbrücke zählen'),
        steps: [
          b('Every hydrogen bond needs two partners: an H on N, O or F (the donor) and a lone pair on N, O or F (the acceptor).', 'Jede Wasserstoffbrücke braucht zwei Partner: ein H an N, O oder F (den Donor) und ein freies Elektronenpaar an N, O oder F (den Akzeptor).'),
          b('Water: two H on O and two lone pairs on O. Each of its H can find a lone pair, and each lone pair an H.', 'Wasser: zwei H am O und zwei freie Elektronenpaare am O. Jedes seiner H findet ein freies Elektronenpaar, jedes freie Elektronenpaar ein H.'),
          b('Ammonia: three H on N but only one lone pair. As a rule of thumb, that one lone pair limits it: in the liquid most of its H find no lone pair to point at.', 'Ammoniak: drei H am N, aber nur ein freies Elektronenpaar. Als Faustregel begrenzt dieses eine freie Elektronenpaar: In der Flüssigkeit finden die meisten seiner H kein freies Elektronenpaar, auf das sie zeigen können.'),
          b('More hydrogen bonds hold a liquid together more firmly: water (100 °C) boils far above ammonia (−33.3 °C).', 'Mehr Wasserstoffbrücken halten eine Flüssigkeit fester zusammen: Wasser (100 °C) siedet weit über Ammoniak (−33,3 °C).'),
        ],
      },
    },
    {
      item: {
        id: 'u10-methanol', unit: 10, kind: 'choice', format: 'predict', withConfidence: true, evidence: 'transfer',
        concepts: ['u10.donor-acceptor', 'u10.not-covalent'], targets: ['hbond-is-covalent'],
        prompt: b('Methanol, {{CH3OH}}, and ethane, {{C2H6}}, both have 18 electrons and almost the same mass (32 and 30 g/mol). Ethane boils at −88.6 °C. Methanol boils…',
          'Methanol, {{CH3OH}}, und Ethan, {{C2H6}}, haben beide 18 Elektronen und fast dieselbe molare Masse (32 und 30 g/mol). Ethan siedet bei −88,6 °C. Methanol siedet…'),
        options: [
          { text: b('at about the same temperature: same electrons, same dispersion', 'bei etwa derselben Temperatur: gleiche Elektronen, gleich starke Dispersionskräfte') },
          { text: b('a little higher, around −50 °C: only its dipole adds attraction', 'etwas höher, um −50 °C: Nur sein Dipol bringt zusätzliche Anziehung') },
          { text: b('far higher, above room temperature: its O–H can donate to a neighbour\'s oxygen', 'viel höher, über Raumtemperatur: Sein O–H kann als Donor eine Wasserstoffbrücke zum Sauerstoff eines Nachbarn bilden'), correct: true },
          { text: b('higher, because boiling has to break methanol\'s strong O–H bond', 'höher, weil beim Sieden die starke O–H-Bindung des Methanols brechen muss'), mis: 'hbond-is-covalent' },
        ],
        explain: b('Methanol has one H on O (a donor) and two lone pairs on O (acceptors), so its molecules link by hydrogen bonds; ethane\'s H all sit on carbon. Boiling separates the molecules; the O–H bonds stay whole.',
          'Methanol hat ein H am O (einen Donor) und zwei freie Elektronenpaare am O (Akzeptoren), also verbinden sich seine Moleküle über Wasserstoffbrücken; die H des Ethans sitzen alle am Kohlenstoff. Beim Sieden trennen sich die Moleküle; die O–H-Bindungen bleiben ganz.'),
      } as ChoiceItem,
      show: { engine: 'hbond', a: 'CH3OH', b: 'CH3OH' },
      revealText: b('Methanol boils at 64.7 °C, about 153 degrees (153 K) above ethane. Its single O–H can donate to a lone pair on a neighbour\'s oxygen, so the molecules link up, and boiling has to pull those links apart. The O–H bonds themselves stay whole: methanol vapour is still made of CH₃OH molecules.',
        'Methanol siedet bei 64,7 °C, etwa 153 K über Ethan. Sein einziges O–H kann als Donor eine Wasserstoffbrücke zu einem freien Elektronenpaar am Sauerstoff eines Nachbarn bilden, also hängen die Moleküle aneinander, und beim Sieden müssen diese Verbindungen gelöst werden. Die O–H-Bindungen selbst bleiben ganz: Methanoldampf besteht weiter aus CH₃OH-Molekülen.'),
      extra: {
        title: b('Same electrons, one extra attraction', 'Gleiche Elektronen, eine zusätzliche Anziehung'),
        steps: [
          b('Ethane and methanol have 18 electrons each, so their dispersion is about the same (unit 8).', 'Ethan und Methanol haben je 18 Elektronen, ihre Dispersionskräfte sind also etwa gleich stark (Einheit 8).'),
          b('Ethane\'s six H all sit on carbon: no donor. Carbon has no lone pair: no acceptor. No hydrogen bonds.', 'Die sechs H des Ethans sitzen alle am Kohlenstoff: kein Donor. Kohlenstoff hat kein freies Elektronenpaar: kein Akzeptor. Keine Wasserstoffbrücken.'),
          b('Methanol\'s H on O is a donor, and the two lone pairs on O are acceptors: neighbours link by hydrogen bonds.', 'Das H am O des Methanols ist ein Donor, die zwei freien Elektronenpaare am O sind Akzeptoren: Nachbarn verbinden sich über Wasserstoffbrücken.'),
          b('Boiling must pull those hydrogen bonds apart, so methanol boils far higher, at 64.7 °C. The O–H bond inside each molecule stays whole.', 'Beim Sieden müssen diese Wasserstoffbrücken gelöst werden, also siedet Methanol viel höher, bei 64,7 °C. Die O–H-Bindung in jedem Molekül bleibt ganz.'),
        ],
      },
    },
  ],

  examples: [
    {
      title: b('Water: every donor finds an acceptor', 'Wasser: Jeder Donor findet einen Akzeptor'), tag: 'H2O', show: { engine: 'hbond', a: 'H2O', cluster: true },
      numbers: [{ v: '2', label: b('donors: the two H on oxygen', 'Donoren: die zwei H am Sauerstoff') }, { v: '4', label: b('hydrogen bonds each molecule takes part in, in ice', 'Wasserstoffbrücken, an denen jedes Molekül im Eis beteiligt ist') }, { v: '2', label: b('whole bonds per molecule in ice (each bond counted once)', 'ganze Brücken pro Molekül im Eis (jede Brücke einmal gezählt)') }],
      body: b('Every donor of a water molecule can find an acceptor on another, and every acceptor a donor. In ice each molecule takes part in four hydrogen bonds, pointing to the corners of a tetrahedron; each bond has two ends, so that makes two whole bonds per molecule. Liquid water keeps much of this network, breaking and re-forming it all the time.',
        'Jeder Donor eines Wassermoleküls findet einen Akzeptor an einem anderen, jeder Akzeptor einen Donor. Im Eis ist jedes Molekül an vier Wasserstoffbrücken beteiligt, in die Ecken eines Tetraeders gerichtet; jede Brücke hat zwei Enden, das ergibt zwei ganze Brücken pro Molekül. Flüssiges Wasser behält viel von diesem Netzwerk, das ständig bricht und sich neu bildet.'),
      soWhat: b('That network lifts water\'s boiling point to 100 °C; by the trend of its group, water would be a gas at room temperature. Unit 11 follows the network into ice and into solutions.',
        'Dieses Netzwerk hebt die Siedetemperatur des Wassers auf 100 °C; nach dem Trend seiner Gruppe wäre Wasser bei Raumtemperatur ein Gas. In Einheit 11 geht es um das Netzwerk im Eis und in Lösungen.'),
    },
    {
      title: b('Acetone: an acceptor only', 'Aceton: nur Akzeptor'), tag: 'CH3COCH3', show: { engine: 'hbond', a: 'CH3COCH3', b: 'H2O' },
      numbers: [{ v: '0', label: b('donors: all six H sit on carbon', 'Donoren: Alle sechs H sitzen am Kohlenstoff') }, { v: '2', label: b('acceptors: the lone pairs on oxygen', 'Akzeptoren: die freien Elektronenpaare am Sauerstoff') }, { v: '56.1 °C', label: b('boiling point of acetone', 'Siedetemperatur von Aceton') }],
      body: b('Acetone\'s oxygen offers two lone pairs, but none of its six H sits on N, O or F. So no hydrogen bond can form between two acetone molecules; they hold together by dipole–dipole forces (unit 9). Water can donate its H to acetone\'s oxygen, so the two mix in any ratio.',
        'Der Sauerstoff des Acetons bietet zwei freie Elektronenpaare, aber keines seiner sechs H sitzt an N, O oder F. Zwischen zwei Acetonmolekülen kann sich also keine Wasserstoffbrücke bilden; sie halten über Dipol-Dipol-Kräfte zusammen (Einheit 9). Wasser kann mit seinem H als Donor eine Wasserstoffbrücke zum Sauerstoff des Acetons bilden, deshalb mischen sich beide in jedem Verhältnis.'),
      soWhat: b('That is why acetone, the solvent in many nail-polish removers, rinses away with water.',
        'Deshalb lässt sich Aceton, das Lösungsmittel in vielen Nagellackentfernern, mit Wasser abspülen.'),
    },
    {
      title: b('Hydrogen fluoride: strongest bond, but only one per molecule', 'Fluorwasserstoff: stärkste Brücke, aber nur eine pro Molekül'), tag: 'HF', show: { engine: 'hbond', a: 'HF', b: 'HF' },
      numbers: [{ v: '3.98', label: b('electronegativity of fluorine, the highest of all', 'EN von Fluor, die höchste überhaupt') }, { v: '1', label: b('donor per HF molecule (water: 2)', 'Donor pro HF-Molekül (Wasser: 2)') }, { v: '19.5 °C', label: b('boiling point of HF (water: 100 °C)', 'Siedetemperatur von HF (Wasser: 100 °C)') }],
      body: b('The atom that pulls hardest does not give the highest boiling point. Fluorine leaves its H more δ+ than oxygen does, so one F–H···F hydrogen bond is stronger than one in water. But each HF molecule has only one H to give: the molecules link in zigzag chains with one hydrogen bond per molecule (each bond counted once), while water has two per molecule.',
        'Das am stärksten ziehende Atom liefert nicht die höchste Siedetemperatur. Fluor macht sein H stärker δ+ als Sauerstoff, also ist eine F–H···F-Brücke stärker als eine im Wasser. Aber jedes HF-Molekül hat nur ein H zu bieten: Die Moleküle verbinden sich zu Zickzack-Ketten mit einer Wasserstoffbrücke pro Molekül (jede Brücke einmal gezählt), beim Wasser sind es zwei pro Molekül.'),
      soWhat: b('Strength per bond and number of bonds both count. HF holds together so well that even its vapour contains small rings of HF molecules.',
        'Es zählen die Stärke jeder Brücke und die Zahl der Brücken. HF hält so gut zusammen, dass selbst sein Dampf noch kleine Ringe aus HF-Molekülen enthält.'),
    },
  ],

  flaw: {
    id: 'u10-flaw', unit: 10, kind: 'flaw', format: 'flaw', evidence: 'transfer', concepts: ['u10.acceptor-only', 'u10.donor-acceptor'], targets: ['any-h-hbond'],
    prompt: b('Where does this reasoning first go wrong?', 'Wo geht diese Überlegung zum ersten Mal schief?'),
    lines: [
      b('Dimethyl ether, CH₃–O–CH₃, has an oxygen atom with two lone pairs.', 'Dimethylether, CH₃–O–CH₃, hat ein Sauerstoffatom mit zwei freien Elektronenpaaren.'),
      b('Those lone pairs can accept a hydrogen bond from a molecule with an H on N, O or F.', 'Diese freien Elektronenpaare können eine Wasserstoffbrücke von einem Molekül mit einem H an N, O oder F annehmen.'),
      b('Its six H atoms can donate hydrogen bonds to the oxygen of a neighbouring ether molecule.', 'Seine sechs H-Atome können als Donoren Wasserstoffbrücken zum Sauerstoff eines benachbarten Ethermoleküls bilden.'),
      b('So dimethyl ether molecules hold on to each other by hydrogen bonds, just as water molecules do.', 'Also halten Dimethylether-Moleküle über Wasserstoffbrücken zusammen, genau wie Wassermoleküle.'),
      b('So dimethyl ether should boil close to ethanol (78.4 °C), which has the same atoms.', 'Also müsste Dimethylether ähnlich hoch sieden wie Ethanol (78,4 °C), das dieselben Atome hat.'),
    ],
    flaw: 2,
    alsoFalse: [3, 4],
    near: [{ step: 1, note: b('Step 2 looks like the slip, but it holds: the lone pairs do accept, as long as the partner brings an H on N, O or F, water for example.', 'Schritt 2 sieht nach dem Fehler aus, stimmt aber: Die freien Elektronenpaare nehmen durchaus an, wenn der Partner ein H an N, O oder F mitbringt, zum Beispiel Wasser.') }],
    explain: b('Step 3 is the slip: all six H sit on carbon, which barely pulls on them, so they are no donors. Steps 1 and 2 are true: the oxygen has two lone pairs that can accept. Steps 4 and 5 follow from the mistake: no hydrogen bond can form between two ether molecules, and dimethyl ether boils at −24.8 °C, about 103 degrees (103 K) below ethanol, whose O–H can donate.',
      'Schritt 3 ist der Fehler: Alle sechs H sitzen am Kohlenstoff, der kaum an ihnen zieht, also sind sie keine Donoren. Die Schritte 1 und 2 stimmen: Der Sauerstoff hat zwei freie Elektronenpaare, die annehmen können. Die Schritte 4 und 5 folgen aus dem Fehler: Zwischen zwei Ethermolekülen kann sich keine Wasserstoffbrücke bilden, und Dimethylether siedet bei −24,8 °C, rund 103 K unter Ethanol, dessen O–H Donor sein kann.'),
  } as FlawItem,

  deeper: {
    id: 'u10-deeper', unit: 10, kind: 'rank', format: 'rank', evidence: 'transfer', concepts: ['u10.count', 'u10.acceptor-only'],
    prompt: b('Rank by boiling point, highest first. Hydrogen peroxide, H–O–O–H: 18 electrons, 2 H on O, 4 lone pairs on O. Water, {{H2O}}: 10 electrons, 2 H on O, 2 lone pairs. Methanol, {{CH3OH}}: 18 electrons, 1 H on O, 2 lone pairs. Dimethyl ether, {{CH3OCH3}}: 26 electrons, no H on O, 2 lone pairs.',
      'Ordne nach Siedetemperatur, die höchste zuerst. Wasserstoffperoxid, H–O–O–H: 18 Elektronen, 2 H am O, 4 freie Elektronenpaare am O. Wasser, {{H2O}}: 10 Elektronen, 2 H am O, 2 freie Elektronenpaare. Methanol, {{CH3OH}}: 18 Elektronen, 1 H am O, 2 freie Elektronenpaare. Dimethylether, {{CH3OCH3}}: 26 Elektronen, kein H am O, 2 freie Elektronenpaare.'),
    order: [b('hydrogen peroxide, H–O–O–H', 'Wasserstoffperoxid, H–O–O–H'), b('water, {{H2O}}', 'Wasser, {{H2O}}'), b('methanol, {{CH3OH}}', 'Methanol, {{CH3OH}}'), b('dimethyl ether, {{CH3OCH3}}', 'Dimethylether, {{CH3OCH3}}')],
    explain: b('Hydrogen peroxide 150.2 °C: two donors with plenty of acceptors, and more electrons than water. Water 100 °C: two hydrogen bonds per molecule. Methanol 64.7 °C: more electrons than water, but with one donor only about one hydrogen bond per molecule, and here the count of hydrogen bonds beats the extra dispersion. Dimethyl ether −24.8 °C: the most electrons, but no donor, so no hydrogen bonds between its molecules at all.',
      'Wasserstoffperoxid 150,2 °C: zwei Donoren mit reichlich Akzeptoren und mehr Elektronen als Wasser. Wasser 100 °C: zwei Wasserstoffbrücken pro Molekül. Methanol 64,7 °C: mehr Elektronen als Wasser, aber mit nur einem Donor etwa eine Wasserstoffbrücke pro Molekül, und hier schlägt die Zahl der Wasserstoffbrücken die zusätzlichen Dispersionskräfte. Dimethylether −24,8 °C: die meisten Elektronen, aber kein Donor, also gar keine Wasserstoffbrücken zwischen seinen Molekülen.'),
  } as RankItem,

  explain: {
    prompt: b('In your own words: when do two molecules form a hydrogen bond, and why does water boil so much higher than its neighbours in the table?',
      'In eigenen Worten: Wann bilden zwei Moleküle eine Wasserstoffbrücke, und warum siedet Wasser so viel höher als seine Nachbarn in der Tabelle?'),
    ideas: [
      { id: 'give-take', concept: 'u10.donor-acceptor', idea: b('A hydrogen bond links an H on N, O or F (the donor) to a lone pair on N, O or F of another molecule (the acceptor)', 'Eine Wasserstoffbrücke verbindet ein H an N, O oder F (Donor) mit einem freien Elektronenpaar an N, O oder F eines anderen Moleküls (Akzeptor)'), contra: ANY_H,
        // Either half of the rule counts (lists such as "N, O or F" and "… and a lone pair" split clauses): an H bound
        // to N/O/F, a lone pair offered to an H, or the donor/acceptor pair named together.
        en: /(\b(h|hydrogens?)( atoms?)? ((that |which )?(sits?|is|are) )?(on|bonded to|attached to|bound to|sitting on|connected to|joined to) (an? |the )?(n|o|f|nitrogen|oxygen|fluorine|electronegative|strongly electronegative|highly electronegative|very electronegative)\b|(pulled|drawn|attracted|attracts?|pulls?) (to|towards|by|on)? ?(an? |the )?lone pairs?|lone pairs? (on|of) (an? |the )?(n|o|f|nitrogen|oxygen|fluorine|another|a neighbou?r|neighbou?ring|electronegative)\b|acceptor\w*.{0,30}lone pairs?|\b(o–h|o-h|n–h|n-h|f–h|f-h|h–f|h-f)\b.{0,60}(lone pair|acceptor|another|neighbou?r|next molecule)|lone pairs?\b.{0,60}(\bh\b|hydrogens?|donor|δ ?\+|positive)|(\bh\b|hydrogens?|δ ?\+|positive).{0,60}lone pairs?|donors?\b.{0,60}acceptors?|acceptors?\b.{0,60}donors?)/,
        de: /((angezogen|gezogen) (von|zu) (einem |dem )?freie\w* (elektronen)?paar|freie\w* (elektronen)?paar\w* (am|an|des|eines) (n|o|f|stickstoff|sauerstoff|fluor|anderen|nachbar\w*|elektronegativ\w*)\b|akzeptor\w*.{0,30}freie\w* (elektronen)?paar|\b(h|wasserstoff)(-?atome?s?)? (an|am|an einem|gebunden an|bindet an|sitzt an|hängt an|hängt am) (einem |einem stark |einem sehr )?(n|o|f|stickstoff|sauerstoff|fluor|elektronegativ\w*|stark elektronegativ\w*)\b|\b(o–h|o-h|n–h|n-h|f–h|f-h|h–f|h-f)\b.{0,60}(freie\w* (elektronen)?paar|akzeptor|anderen|nachbar)|freie\w* (elektronen)?paar\w*.{0,60}(\bh\b|wasserstoff|h-atom|donor|δ ?\+|positiv)|(\bh\b|h-atom\w*|wasserstoff\w*|δ ?\+|positiv\w*).{0,60}freie\w* (elektronen)?paar|donor\w*.{0,60}akzeptor|akzeptor\w*.{0,60}donor|(vom|von dem|von einem) freie\w* (ep|elektronenpaar)\b|freie\w* ep\b.{0,60}(\bh\b|h-atom|wasserstoff|donor|angezogen|zieht)|(\bh\b|h-atom\w*|wasserstoff\w*).{0,80}(freie\w* ep\b|vom freie\w*))/ },
      { id: 'nof', concept: 'u10.why-nof', idea: b('Strong hydrogen bonds need N, O or F: they are electronegative and small enough to make the H strongly δ+ and to offer a compact lone pair', 'Starke Wasserstoffbrücken brauchen N, O oder F: Sie sind elektronegativ und klein genug, um das H stark δ+ zu machen und ein kompaktes freies Elektronenpaar zu bieten'),
        en: /(electronegativ\w*.{0,60}\b(n|o|f|nitrogen|oxygen|fluorine)\b|\b(n|o|f|nitrogen|oxygen|fluorine)\b.{0,60}(electronegativ|pull\w* (very |really )?(hard|strong|the most)|small|tiny|compact)|(these|those|the) (three )?atoms\b.{0,30}pull\w* (on )?(the )?(electrons|shared pair|pairs?)? ?(so |very |really )?(hard|strongly)|(these|those) (three|atoms|elements)\b.{0,40}(small|tiny|compact|electronegativ)|(small|tiny|compact).{0,40}(electronegativ|atoms?\b)|electronegativ\w*.{0,40}(small|tiny|compact)|(larger|bigger|too big|spread out|diffuse).{0,60}\b(cl|hcl|h2s|chlorine|sulfur|sulphur)\b|\b(cl|hcl|h2s|chlorine|sulfur|sulphur)\b.{0,60}(larger|bigger|too big|spread out|diffuse|only weak|weak hydrogen)|electronegativ\w* atoms?\b.{0,40}(\bh\b|hydrogen\w*).{0,20}(strongly |very |highly )?(positive|δ ?\+))/,
        de: /(elektronegativ\w*.{0,60}\b(n|o|f|stickstoff|sauerstoff|fluor)\b|\b(n|o|f|stickstoff|sauerstoff|fluor)\b.{0,60}(elektronegativ|\ben\b|zieh\w* (sehr |besonders )?(stark|am stärksten)|stark zieh|klein|kompakt)|(diese|die) (drei )?atome\b.{0,30}zieh\w* (so |sehr |besonders )?stark|(diese|die) (drei|atome|elemente)\b.{0,40}(klein|kompakt|elektronegativ|hohe \ben\b)|(klein|kompakt).{0,40}(elektronegativ|\ben\b|atome?\b)|(elektronegativ\w*|hohe \ben\b).{0,40}(klein|kompakt)|(größer|zu groß|ausgedehnt|verteilt).{0,60}\b(cl|hcl|h2s|chlor|schwefel)\b|\b(cl|hcl|h2s|chlor|schwefel)\b.{0,60}(größer|zu groß|ausgedehnt|verteilt|nur schwach|schwache wasserstoffbrücke)|elektronegativ\w* atom\w*.{0,40}(\bh\b|h-atom\w*|wasserstoff\w*).{0,20}(stark |sehr |besonders )?(positiv\w*|δ ?\+))/ },
      { id: 'count', concept: 'u10.count', idea: b('Water has two donors and two acceptors, so each molecule can take part in four hydrogen bonds', 'Wasser hat zwei Donoren und zwei Akzeptoren, also kann jedes Molekül an vier Wasserstoffbrücken beteiligt sein'), contra: MORE_H,
        en: /((two|2) (donors?|acceptors?|lone pairs?)|(four|4) (hydrogen bonds|h-bonds|h bonds|neighbou?rs|bonds|partners)|(two|2) of each|each (donor|h|hydrogen)\b.{0,40}(acceptor|lone pair|partner)|(needs?|requires?|takes) (both )?(a |one )?(donor|h|hydrogen)\b.{0,25}(and|plus) (an? |one )?(acceptor|lone pair)|(match(es)? up|pair(s|ed)? up|balanced|match exactly)|(limited|limit\w*) by|(fewer|scarcer|only one|just one) (donors?|acceptors?|lone pairs?)|(more|most) hydrogen bonds per molecule|network)/,
        de: /((zwei|2) (donoren|donor|akzeptoren|akzeptor|freie\w* (elektronen)?paare)|(vier|4) (wasserstoffbrücke\w*|h-brücke\w*|brücken|nachbarn|partner)|von (beiden|jedem) (je )?zwei|jede[rsm]? (donor|h)\b.{0,40}(akzeptor|freie|partner)|(braucht|benötigt) (einen |je einen )?(donor|h)\b.{0,25}(und|plus) (einen |ein )?(akzeptor|freies)|zusammenpass\w*|paaren sich|begrenzt|(weniger|nur ein\w*) (donoren|donor|akzeptoren|akzeptor|freie\w* (elektronen)?paar\w*)|mehr (wasserstoffbrücken|brücken) pro molekül|netzwerk|(nur )?(1|ein\w*) freie\w* (ep|elektronenpaar)\b|(zwei|2|drei|3) freie\w* ep\b)/ },
      { id: 'anomaly', concept: 'u10.anomaly', idea: b('That is why H₂O, HF and NH₃ boil far above the trend of their groups', 'Deshalb sieden H₂O, HF und NH₃ weit über dem Trend ihrer Gruppen'),
        en: /(not about (minus |−|-) ?\d|not around (minus |−|-) ?\d|instead of (about |around )?(minus |−|-) ?\d|rather than (about |around )?(minus |−|-) ?\d|(higher|above|more) than (the )?(trend|expected|predicted)|((boil\w*|boiling (point|temperature)s?|\bbp\b)\b.{0,60}\b(higher|above|far|much|unusually|anomal\w*|instead|than expected|out of line|stands? out|jumps?))|((higher|above the trend|anomal\w*|unusual\w*|out of line|stands? out|break\w* (the )?(rank|trend|pattern)).{0,60}(boil\w*|boiling))|((would|should) (otherwise )?boil.{0,40}(-|−|below|minus|lower))|liquid at room temperature|(far |well |way )?above (the |its |their )?(group )?trend|off the trend)/,
        de: /(nicht bei (etwa |ca )?(minus |−|-) ?\d|nicht etwa (minus |−|-) ?\d|nicht ca (minus |−|-) ?\d|statt (etwa |ca |rund )?(minus |−|-) ?\d|(höher|über|mehr) als (der |dem |den |ihr\w* )?(trend|erwartet)|((sied\w*|\bsdt\b|\bsdp\b|siedepunkt\w*|siedetemperatur\w*)\b.{0,60}\b(höher|über|viel|weit|ungewöhnlich|anomal\w*|statt|als erwartet|aus der reihe|aus dem trend))|((höher|über dem trend|anomal\w*|ungewöhnlich\w*|aus der reihe|tanzt).{0,60}(sied\w*))|((würde|müsste|sollte) .{0,40}sieden)|(bei raumtemperatur flüssig)|(weit |deutlich |viel )?über dem trend|aus dem trend|(anomal\w*|ungewöhnlich\w*) (hohe\w* )?(\bsdt\b|\bsdp\b|siede\w*))/ },
      { id: 'between', concept: 'u10.not-covalent', idea: b('A hydrogen bond is a much weaker attraction than a covalent bond, usually between molecules: boiling separates the molecules and leaves the O–H bonds intact', 'Eine Wasserstoffbrücke ist eine viel schwächere Anziehung als eine Atombindung, meist zwischen Molekülen: Beim Sieden trennen sich die Moleküle, die O–H-Bindungen bleiben'), contra: HBOND_COVALENT,
        en: /((attraction|force|pull|interaction)s? between (the |two |neighbou?ring |separate )?molecules|between (the |two |neighbou?ring )?molecules|intermolecular|(weaker|much weaker|far weaker|not as strong)( \w+)? than (an? |the )?(covalent|o–h|o-h|real|normal|chemical|ordinary|actual)( bonds?)?|(about |only |roughly |around |~ ?)?20 ?kj|not a real bond|not a true bond|not a covalent bond|not an actual bond|((o–h|o-h|covalent) bonds?.{0,40}(stay|remain|intact|unbroken|not broken|survive|whole))|(molecules (stay|remain) (whole|intact))|does not break|doesn't break|do not break|don't break|never breaks?|without breaking|only (the )?(hydrogen bonds|h-bonds|intermolecular forces|forces between (the )?molecules)\b.{0,20}(are )?(broken|overcome|separated|break|loosened)(,? not the (covalent|o–h|o-h) bonds)?|not the (covalent|o–h|o-h) bonds|(molecules|they) (stay|remain)\b.{0,25}(whole|intact))/,
        de: /((anziehung\w*|kräfte|kraft|wechselwirkung\w*) zwischen (den |zwei |benachbarten )?molekül\w*|zwischen (den |zwei |benachbarten )?molekülen|zwischenmolekular\w*|(schwächer|viel schwächer|nicht so stark)\w*( \w+)? als (eine |die )?(atombindung|elektronenpaarbindung|kovalente|o–h|o-h|echte|richtige)|(etwa |nur |rund |ca\. ?)?20 ?kj|keine echte bindung|keine richtige bindung|keine atombindung|((o–h|o-h|atombindung\w*|kovalente\w* bindung\w*).{0,40}(bleib\w*|erhalten|intakt|nicht gespalten|nicht gebrochen|ganz))|moleküle bleiben (ganz|intakt|erhalten)|bricht nicht|brechen nicht|nicht gebrochen|nicht gespalten|nur die (h-brücken|wasserstoffbrücke\w*|zwischenmolekular\w* (kräfte|wechselwirkung\w*)|vdw-kräfte|van-der-waals-kräfte|anziehungskräfte)\b.{0,25}(gelöst|getrennt|überwunden|aufgebrochen|gebrochen)(,? nicht die (kovalenten bindungen|atombindungen|elektronenpaarbindungen|o–h-bindungen|o-h-bindungen))?|nicht die (kovalenten bindungen|atombindungen|elektronenpaarbindungen|o–h-bindungen|o-h-bindungen)|bleiben (die )?moleküle (beim sieden )?(ganz|intakt|erhalten)|moleküle bleiben.{0,30}(ganz|intakt|erhalten)|keine atombindungen gespalten|keine kovalenten bindungen gespalten|keine elektronenpaarbindungen gespalten|keine bindungen gespalten)/ },
    ] as Idea[],
    tightened: b('A hydrogen bond forms when an H atom bonded to N, O or F (the donor) is attracted to a lone pair on an N, O or F atom of another molecule (the acceptor). Strong hydrogen bonds need N, O or F, which are electronegative and small enough to leave the H strongly δ+ and to offer a compact lone pair; larger atoms such as Cl and S accept only weakly. Water has two donors and two acceptors, so each molecule can take part in four hydrogen bonds; that is why water, like HF and NH₃, boils far above the trend of its group. A hydrogen bond is a much weaker attraction than a covalent bond, about 20 kJ/mol against 464 for the O–H bond, so boiling separates the molecules and leaves the O–H bonds intact.',
      'Eine Wasserstoffbrücke entsteht, wenn ein H-Atom an N, O oder F (der Donor) von einem freien Elektronenpaar an einem N-, O- oder F-Atom eines anderen Moleküls (dem Akzeptor) angezogen wird. Starke Wasserstoffbrücken brauchen N, O oder F, die elektronegativ und klein genug sind, um das H stark positiv zu polarisieren und ein kompaktes freies Elektronenpaar zu bieten; größere Atome wie Cl und S sind nur schwache Akzeptoren. Wasser hat zwei Donoren und zwei Akzeptoren, also kann jedes Molekül an vier Wasserstoffbrücken beteiligt sein; deshalb siedet Wasser weit über dem Trend seiner Gruppe, ebenso HF und NH₃. Eine Wasserstoffbrücke ist eine viel schwächere Anziehung als eine Atombindung, etwa 20 kJ/mol gegenüber 464 für die O–H-Bindung, also trennen sich beim Sieden die Moleküle, und die O–H-Bindungen bleiben erhalten.'),
  },

  terms: ['h-bond', 'hb-donor', 'hb-acceptor', 'lone-pair', 'electronegativity', 'partial-charge'],

  readings: [
    {
      lang: 'en', kind: 'quick',
      title: b('Hydrogen Bonding', 'Hydrogen Bonding'), source: 'Chemistry LibreTexts',
      url: 'https://chem.libretexts.org/Bookshelves/Physical_and_Theoretical_Chemistry_Textbook_Maps/Supplemental_Modules_(Physical_and_Theoretical_Chemistry)/Physical_Properties_of_Matter/Atomic_and_Molecular_Properties/Intermolecular_Forces/Hydrogen_Bonding',
      lookFor: [
        b('Its definition: which atom must the H sit on, and what must the other atom have? Compare it with the blue halos and purple lobes in the view.', ''),
        b('Why it says water boils higher than HF although HF is heavier. Does it match your count of donors and acceptors?', ''),
        b('Its claim that H₂O, HF and NH₃ boil higher than the next compound down their groups. Find the same pattern in the puzzle table.', ''),
      ],
    },
    {
      lang: 'en', kind: 'deeper',
      title: b('Intermolecular Forces', 'Intermolecular Forces'), source: 'OpenStax Chemistry 2e, section 10.1',
      url: 'https://openstax.org/books/chemistry-2e/pages/10-1-intermolecular-forces',
      lookFor: [
        b('Figures 10.11 and 10.12, the boiling points of the hydrides of groups 15 to 17. Does period 2 stand out as it did in the puzzle?', ''),
        b('It says hydrogen bonds are about 5 to 10 % as strong as covalent bonds. Water\'s are nearer 4 % (about 20 against 464 kJ/mol): a rule of thumb, not one exact number.', ''),
        b('Its HCl example: about 17 kJ/mol between molecules against about 430 kJ/mol for the H–Cl bond inside. The same pattern as water\'s hydrogen bonds against O–H.', ''),
      ],
    },
    {
      lang: 'de', kind: 'quick',
      title: b('Wasserstoffbrückenbindung', 'Wasserstoffbrückenbindung'), source: 'Studyflix',
      url: 'https://studyflix.de/chemie/wasserstoffbruckenbindung-1668',
      lookFor: [
        b('', 'Woran erkennt der Artikel einen Donor und einen Akzeptor? Vergleiche mit den blauen Ringen und den lila Keulen in der Ansicht.'),
        b('', 'Seine Tabelle der Bindungsstärken setzt Wasser bei 17 bis 63 kJ/mol an. Passt das zu den etwa 20 kJ/mol aus dieser Einheit, und wie klein ist das gegenüber der O–H-Bindung mit 464 kJ/mol?'),
        b('', 'Der Satz, Ketone seien Akzeptoren, aber keine Donoren. Welches Beispiel aus dieser Einheit zeigt genau das?'),
      ],
    },
  ],

  misconceptions: [
    { id: 'any-h-hbond', name: b('Any hydrogen atom can form hydrogen bonds, even one on carbon', 'Jedes H-Atom kann Wasserstoffbrücken bilden, auch eines am Kohlenstoff') },
    { id: 'hbond-is-covalent', name: b('A hydrogen bond is the O–H bond inside the molecule, broken when water boils', 'Eine Wasserstoffbrücke ist die O–H-Bindung im Molekül und bricht beim Sieden') },
    { id: 'more-h-more-hbonds', name: b('More H atoms always mean more hydrogen bonds', 'Mehr H-Atome bedeuten immer mehr Wasserstoffbrücken') },
  ],

  glossary: {
    'hb-donor': {
      en: 'hydrogen-bond donor', de: 'Wasserstoffbrücken-Donor', unit: 10,
      def: { en: 'The H atom bonded to N, O or F that a molecule brings to a hydrogen bond; also the molecule that brings it.', de: 'Das H-Atom an N, O oder F, das ein Molekül in eine Wasserstoffbrücke einbringt; auch das Molekül, das es einbringt.' },
      falseFriend: { en: 'German books also say "H-Donor" or simply "Donor".', de: 'Auch kurz „H-Donor“ oder „Donor“.' },
    },
    'hb-acceptor': {
      en: 'hydrogen-bond acceptor', de: 'Wasserstoffbrücken-Akzeptor', unit: 10,
      def: { en: 'An N, O or F atom with a lone pair that attracts the δ+ H of another molecule.', de: 'Ein N-, O- oder F-Atom mit freiem Elektronenpaar, das das δ+-H eines anderen Moleküls anzieht.' },
      falseFriend: { en: 'German books also say "H-Akzeptor" or simply "Akzeptor".', de: 'Auch kurz „H-Akzeptor“ oder „Akzeptor“.' },
    },
  },
};
