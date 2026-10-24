// Unit 13 — Formulas and molar mass, on the Zoom Ladder (sample mode with the formula breakdown).
// Numbers: every molar mass and mass share is what src/content/stoich.ts computes from the elements.ts atomic masses
// (H 1.008, C 12.011, N 14.007, O 15.999, Na 22.99, Mg 24.305, Al 26.982, S 32.06, Cl 35.45, Ca 40.078,
// Fe 55.845 u): H₂O 18.015 (O 88.8 %), CO₂ 44.009 (O 72.7 %), CO 28.010, N₂ 28.014, C₂H₄ 28.054, NH₃ 17.031,
// C₆H₁₂O₆ 180.156 (C 40.00, H 6.71, O 53.28 %; the same shares for C₂H₄O₂ and CH₂O, 30.026), NaCl 58.44
// (Na 39.3 %), Ca(OH)₂ 74.092, Mg(OH)₂ 58.319 (traps 42.320 if the 2 doubles only H, 41.312 if it is ignored,
// 82.624 if it doubles Mg too), FeO 71.844 (Fe 77.7 %), Fe₂O₃ 159.687 (69.9 %), Fe₃O₄ 231.531 (72.4 %), FeS₂ 119.965
// (46.6 %), CH₂ 14.027, NH₄NO₃ 80.043 (N 35.0 %), CO(NH₂)₂ 60.056 (N 46.6 %), (NH₄)₂SO₄ 132.134 (N 21.2 %),
// NH₃ N 82.2 %. 90 g glucose = 0.4996 mol → 5.995 mol H atoms (3.61 × 10²⁴). Water per kilogram of hydrogen:
// 18.015 ÷ 2.016 = 8.94 (calculated). Flaw: 85.6 ÷ 12.01 = 7.13, 14.4 ÷ 1.008 = 14.29, ratio 2.005; 28.054 ÷ 14.027 = 2.
// Sources (fetched): USGS National Minerals Information Center, "Iron Ore Statistics and Information": iron ore
// "almost always consists of iron oxides, the primary forms of which are magnetite (Fe3O4) and hematite (Fe2O3)".
// Handbook of Mineralogy, wüstite (Fe²⁺O): forms at high temperature in a highly reducing environment, found in some
// meteorites and kimberlite pipes; its references treat it as Fe₁₋ₓO (slightly short of iron). MedlinePlus,
// magnesium hydroxide: a laxative and an antacid for heartburn, brand name Milk of Magnesia. Food Standards
// Scotland, "Salt": salt = sodium × 2.5; adults no more than 6 g of salt a day (6 × 0.393 = 2.4 g sodium).
// Regulation (EU) No 1169/2011 (food information to consumers), Annex I point 11: salt = sodium × 2.5.
// Iron share follows O per Fe: FeO 1 : 1, Fe₃O₄ 4 : 3, Fe₂O₃ 3 : 2. Peroxide: Na₂O₂ holds the O₂²⁻ ion.
import type { Bi } from '../i18n';
import type { ChoiceItem, RankItem, FlawItem } from './items';
import type { Idea } from './unit06';
import type { UnitContent } from './unitTypes';

const b = (en: string, de: string): Bi => ({ en, de });

// ---------- explain-back patterns ----------
// Negation guard for the contra patterns: a clause that denies the misconception, or calls it a mistake, must not
// rule an idea out.
const NOT_EN = '^(?!.*\\b(not|n\'t|never|no|cannot|without|rather than|instead of|mistake|wrong|error|trap|false|incorrect)\\b)';
const NOT_DE = '^(?!.*(?<!\\p{L})(nicht|kein\\p{L}*|nie|niemals|ohne|statt|anstatt|fehler|falsch\\p{L}*|falle)(?!\\p{L}))';
// "no molecules" phrasings. A clause such as "salt is a lattice with no separate molecules" must count: the denial is
// taken into the match (spelled out, so the matcher's negation check accepts it), as in unit 4.
const NOMOL_EN = '(isn\'t molecular|aren\'t molecular|not molecular|no molecules|no separate molecules|no individual molecules|no nacl molecules|no salt molecules|no real molecules|no single molecules|not made of molecules|isn\'t made of molecules|not made up of molecules|isn\'t made up of molecules|aren\'t molecules|not molecules|not a molecule|isn\'t a molecule|has no molecules|have no molecules|doesn\'t have molecules|don\'t have molecules|does not have molecules|do not have molecules|there are no molecules|without molecules)';
const NOMOL_DE = '(nicht molekular\\p{L}*|keine molekülverbindung|keine moleküle|keine einzelnen moleküle|keine nacl-moleküle|keine salzmoleküle|keine echten moleküle|kein molekül|nicht aus molekülen|ohne moleküle|gibt es keine moleküle|gibt es keine einzelnen moleküle)';
const UNIT_EN = '(formula units?|(ratio|proportion) of (the )?ions|(\\bions?|na\\+|cl-|sodium and chlorid\\w*)\\b.{0,50}(ratio|1 ?: ?1|one to one|1 to 1)|(ratio|1 ?: ?1|one to one|1 to 1)\\b.{0,50}(\\bions?\\b|na\\+|cl-|sodium|chlorid\\w*)|lattice|grid of ions|ion grid|network of ions|giant (structure|array))';
const UNIT_DE = '(formeleinheit\\p{L}*|ionenverhältnis\\p{L}*|verhältnis\\p{L}* (der|von) ionen|((?<!\\p{L})ionen|na\\+|cl-|natrium\\p{L}*)(?!\\p{L}).{0,50}(verhältnis|1 ?: ?1|eins zu eins|1 zu 1)|(verhältnis|1 ?: ?1|eins zu eins|1 zu 1).{0,50}((?<!\\p{L})ionen|na\\+|cl-|natrium)|ionengitter|(?<!\\p{L})gitter)';

// Misconception: each element's mass counted once, the subscript ignored. ("Each atom counted once" is fine: listing
// H, H, O counts every atom; only "each element once" is the slip.)
const FORMULA_ONCE = {
  en: new RegExp('(' + NOT_EN + '.*(\\b(each|every) (element|symbol|atomic mass|kind of atom)\\S*.{0,30}\\bonce\\b|\\bonce (for|per) (each|every) (element|symbol)|ignor\\w* (the )?(subscripts?|small numbers?|little numbers?|index\\w*|indices|brackets?)))|((subscripts?|small numbers?|little numbers?|index\\w*) (don\'t|doesn\'t|do not|does not) (matter|count))'),
  de: new RegExp('(' + NOT_DE + '.*((?<!\\p{L})(jede[snr]?|alle) (element|atommasse|atomsorte|symbol)\\p{L}*.{0,30}(?<!\\p{L})einmal(?!\\p{L})|(ignorier|übersieh|übersehen|vergess|weglass)\\p{L}* (den |die )?(index|indizes|klammer\\p{L}*|kleinen zahlen)|(index|indizes) (ignorier|übersehen|weglassen|weggelassen|vergessen)\\p{L}*))|((index\\p{L}*|indizes|kleinen zahlen) (sind|ist) (egal|unwichtig))', 'u'),
};
// Misconception: more atoms of an element mean a bigger mass share. A clause that brings in atomic masses or heavier
// atoms is reasoning with mass, so it is left alone.
const ATOMS_SHARE = {
  en: new RegExp(NOT_EN + '(?!.*(heav|atomic mass|mass of (each|one|an?) atom)).*((more|most|extra) (\\w+ )?atoms?\\b.{0,50}(more|bigger|larger|greater|most|biggest|largest|higher) (mass )?(share|fraction|part of the mass|percentage|proportion|of the mass)|(share|fraction|percentage|proportion)\\b.{0,30}(depends?|is set|is decided) (only |just )?(on|by) (the )?(number|count) of atoms(?! (times|×|x|multiplied|and))|(share|fraction|percentage)s? (count|counts) (the )?atoms)'),
  de: new RegExp(NOT_DE + '(?!.*(schwer|atommasse)).*((mehr|meisten|zusätzliche) (\\p{L}+ )?atome\\p{L}*.{0,50}(größer\\p{L}*|höher\\p{L}*|mehr|meisten|größte\\p{L}*) (massen)?anteil|(massen)?anteil\\p{L}*.{0,30}(hängt|hängen) (nur |allein )?von der (anzahl|zahl) der atome ab|(massen)?anteil\\p{L}* (richtet sich|folgt) (nur )?nach der (anzahl|zahl) der atome(?! (mal|·|und)))', 'u'),
};
// Misconception: salts are made of molecules.
const IONIC_MOL = {
  en: new RegExp(NOT_EN + '.*((nacl|salt|sodium chloride|it)( is| are)? (made |made up |built )?of (nacl |salt |sodium chloride )?molecules|\\bnacl molecules?\\b|\\bsalt molecules?\\b|molecules? of (nacl|salt|sodium chloride))'),
  de: new RegExp(NOT_DE + '.*(nacl-?moleküle?\\p{L}*|salzmolekül\\p{L}*|(kochsalz|salz|natriumchlorid) (besteht|bestehen) aus (nacl-?)?molekülen|moleküle\\p{L}* (aus|von) (nacl|kochsalz|natriumchlorid))', 'u'),
};

export const UNIT13: UnitContent = {
  n: 13,
  title: b('Formulas and molar mass', 'Formeln und molare Masse'),
  lead: b('How a formula turns into grams per mole, and why water is almost all oxygen by mass.', 'Wie aus einer Formel Gramm pro Mol werden, und warum Wasser der Masse nach fast ganz aus Sauerstoff besteht.'),

  puzzle: {
    title: b('Which ore holds the most iron?', 'Welches Erz enthält am meisten Eisen?'),
    lead: b('Iron is made from minerals that contain it. Iron ore is almost always an iron oxide, mostly magnetite or haematite; wüstite turns up only in unusual places such as some meteorites, and pyrite is fool\'s gold. The table gives each mineral\'s iron atoms per [[formula-unit]] and its molar mass.',
      'Eisen gewinnt man aus Mineralen, die es enthalten. Eisenerz ist fast immer ein Eisenoxid, meist Magnetit oder Hämatit; Wüstit findet man nur an ungewöhnlichen Orten, etwa in manchen Meteoriten, und Pyrit ist das Katzengold. Die Tabelle nennt für jedes Mineral die Eisenatome pro [[formula-unit]] und die molare Masse.'),
    data: {
      caption: b('Four iron minerals. Molar masses from the average atomic masses (IUPAC standard atomic weights): Fe 55.845, O 15.999, S 32.06 u.',
        'Vier Eisenminerale. Molare Massen aus den mittleren Atommassen: Fe 55,845; O 15,999; S 32,06 u.'),
      head: [b('Mineral', 'Mineral'), b('Formula', 'Formel'), b('Fe atoms per formula unit', 'Fe-Atome pro Formeleinheit'), b('Molar mass (g/mol)', 'Molare Masse (g/mol)')],
      rows: [
        { cells: [b('wüstite', 'Wüstit'), '{{FeO}}', '1', '71.84'] },
        { cells: [b('haematite', 'Hämatit'), '{{Fe2O3}}', '2', '159.69'] },
        { cells: [b('magnetite', 'Magnetit'), '{{Fe3O4}}', '3', '231.53'] },
        { cells: [b('pyrite', 'Pyrit'), '{{FeS2}}', '1', '119.97'] },
      ],
      numeric: [2, 3],
    },
    clash: b('Magnetite has three iron atoms in every formula unit, wüstite and pyrite only one. But each formula unit also contains oxygen or sulfur atoms, and they have mass too. Which mineral holds the most iron per kilogram?',
      'Magnetit enthält drei Eisenatome pro Formeleinheit, Wüstit und Pyrit nur eines. Aber jede Formeleinheit enthält auch Sauerstoff- oder Schwefelatome, und die haben ebenfalls Masse. Welches Mineral enthält pro Kilogramm am meisten Eisen?'),
    question: {
      id: 'u13-puzzle', unit: 13, kind: 'choice', format: 'predict', withConfidence: true, evidence: 'predict',
      concepts: ['u13.mass-fraction', 'u13.formula-count'], targets: ['atoms-count-share'],
      prompt: b('Your best guess:', 'Deine beste Vermutung:'),
      options: [
        { text: b('Magnetite, {{Fe3O4}}: three iron atoms in every formula unit', 'Magnetit, {{Fe3O4}}: drei Eisenatome in jeder Formeleinheit'), mis: 'atoms-count-share' },
        { text: b('Haematite, {{Fe2O3}}: one of the two main ores', 'Hämatit, {{Fe2O3}}: eines der zwei wichtigsten Erze') },
        { text: b('Wüstite, {{FeO}}: the least extra mass for each iron atom', 'Wüstit, {{FeO}}: am wenigsten zusätzliche Masse pro Eisenatom'), correct: true },
        { text: b('Pyrite, {{FeS2}}: sulfur atoms are lighter than oxygen atoms', 'Pyrit, {{FeS2}}: Schwefelatome sind leichter als Sauerstoffatome') },
      ],
      explain: b('Iron per kilogram is iron\'s [[mass-fraction]]: iron atoms × 55.845 ÷ molar mass, so {{FeO}} 55.85 ÷ 71.84 = 77.7 %, {{Fe3O4}} 72.4 %, {{Fe2O3}} 69.9 %, {{FeS2}} 46.6 %. What decides it is the other mass that comes with each iron atom: one O in wüstite, more than one O in magnetite and haematite, and two sulfur atoms in pyrite, each with twice the mass of an O atom.',
        'Eisen pro Kilogramm ist der [[mass-fraction]] des Eisens: Eisenatome · 55,845 : molare Masse, also {{FeO}} 55,85 : 71,84 = 77,7 %, {{Fe3O4}} 72,4 %, {{Fe2O3}} 69,9 %, {{FeS2}} 46,6 %. Entscheidend ist, wie viel Masse außer dem Eisen auf jedes Eisenatom entfällt: ein O beim Wüstit, mehr als ein O bei Magnetit und Hämatit, zwei Schwefelatome beim Pyrit, jedes mit der doppelten Masse eines O-Atoms.'),
    } as ChoiceItem,
    after: b('Next: open the formulas and see where each molar mass and each share comes from.', 'Als Nächstes: Öffne die Formeln und sieh nach, woher jede molare Masse und jeder Anteil kommt.'),
  },

  explore: {
    title: b('The Zoom Ladder: what is in the formula?', 'Die Zoom-Leiter: Was steckt in der Formel?'),
    intro: b('The ladder shows one sample on four rungs, as in unit 12. New is the panel “What\'s in the formula?”: it lists the atoms in one particle, adds up their atomic masses to the [[molar-mass]] M in g/mol and draws each element\'s share of the mass as a bar. A subscript, the small number after a symbol, counts the atom just before it; after a bracket it counts everything in the bracket. (GCSE books give the same numbers without a unit, as A_{r} and M_{r}.) The compare switch puts a second sample beside the first.',
      'Die Leiter zeigt eine Stoffportion auf vier Stufen, wie in Einheit 12. Neu ist das Feld „Was steckt in der Formel?“: Es listet die Atome in einem Teilchen auf, addiert ihre Atommassen zur [[molar-mass|molaren Masse]] M in g/mol und zeigt den Massenanteil w jedes Elements als Balken. Der Index, die kleine Zahl hinter einem Symbol, gibt an, wie viele Atome des Elements direkt davor im Teilchen stecken; hinter einer Klammer gilt er für alles in der Klammer. (Dieselben Zahlen ohne Einheit sind die relative Atommasse und die relative Molekülmasse.) Mit dem Vergleichsschalter stellst du eine zweite Stoffportion daneben.'),
    tasks: [
      { id: 'water', key: true, text: b('Pick water and open “What\'s in the formula?”. Where does 18.015 g/mol come from?', 'Wähle Wasser und öffne „Was steckt in der Formel?“. Woher kommen die 18,015 g/mol?') },
      { id: 'glucose', key: true, text: b('Open the breakdown of glucose. Which element has the most atoms, and which has the largest share of the mass?', 'Öffne die Aufschlüsselung von Glucose. Welches Element hat die meisten Atome, welches den größten Massenanteil?') },
      { id: 'salt', key: true, text: b('Pick table salt and zoom to the particles rung. What does one “particle” of {{NaCl}} look like?', 'Wähle Kochsalz und zoome auf die Stufe „Teilchen“. Wie sieht ein „Teilchen“ {{NaCl}} aus?') },
      { id: 'bracket', key: true, text: b('Open the breakdown of calcium hydroxide, {{Ca(OH)2}}. What does the 2 after the bracket count?', 'Öffne die Aufschlüsselung von Calciumhydroxid, {{Ca(OH)2}}. Wofür gilt die 2 hinter der Klammer?') },
      { id: 'ores', text: b('Open the breakdowns of two iron oxides and compare their iron shares with your puzzle answer.', 'Öffne die Aufschlüsselungen von zwei Eisenoxiden und vergleiche ihre Eisenanteile mit deiner Antwort zum Rätsel.') },
      { id: 'twins', challenge: true, text: b('Find two different substances whose molar masses differ by less than 0.1 g/mol.', 'Finde zwei verschiedene Stoffe, deren molare Massen sich um weniger als 0,1 g/mol unterscheiden.') },
    ],
    notes: {
      water: b('2 × 1.008 + 15.999 = 18.015 g/mol: the subscript 2 counts the H atoms, an O without a number counts once. One molecule has an average mass of 18.015 u, one mole of molecules 18.015 g.',
        '2 · 1,008 + 15,999 = 18,015 g/mol: Der Index 2 gibt die Zahl der H-Atome an, ein O ohne Zahl steht für ein Atom. Ein Molekül hat im Mittel die Masse 18,015 u, ein Mol Moleküle 18,015 g.'),
      glucose: b('6 C, 12 H and 6 O: hydrogen has half the atoms yet only 6.7 % of the mass; oxygen, a quarter of the atoms, makes up 53.3 %.',
        '6 C, 12 H und 6 O: Wasserstoff macht die Hälfte der Atome aus, aber nur 6,7 % der Masse; Sauerstoff, ein Viertel der Atome, macht 53,3 % aus.'),
      salt: b('No molecules: a small piece of the ion lattice, {{Na+}} (blue, +) and {{Cl-}} (red, −) in a 1 : 1 ratio, each ion among six of the other kind (unit 4). 58.44 g/mol is the mass of one mole of formula units.',
        'Keine Moleküle: ein kleines Stück Ionengitter, {{Na+}} (blau, +) und {{Cl-}} (rot, −) im Verhältnis 1 : 1, jedes Ion zwischen sechs Ionen der anderen Sorte (Einheit 4). 58,44 g ist die Masse von 1 mol Formeleinheiten.'),
      bracket: b('The 2 counts everything in the bracket: two {{OH-}} ions for each {{Ca2+}}, so 1 Ca, 2 O and 2 H. 40.078 + 2 × (15.999 + 1.008) = 74.09 g/mol.',
        'Die 2 gilt für alles in der Klammer: zwei {{OH-}}-Ionen pro {{Ca2+}}, also 1 Ca, 2 O und 2 H. 40,078 + 2 · (15,999 + 1,008) = 74,09 g/mol.'),
      ores: b('{{FeO}} 77.7 %, {{Fe3O4}} 72.4 %, {{Fe2O3}} 69.9 %: the order follows the oxygen per iron atom (1, 4/3, 3/2), not the number of iron atoms. Real wüstite is a little short of iron (Fe₁₋ₓO); the bar shows the ideal formula.',
        '{{FeO}} 77,7 %, {{Fe3O4}} 72,4 %, {{Fe2O3}} 69,9 %: Die Reihenfolge richtet sich nach dem Sauerstoff pro Eisenatom (1; 4/3; 3/2), nicht nach der Zahl der Eisenatome. Echter Wüstit enthält etwas weniger Eisen (Fe₁₋ₓO); der Balken zeigt die ideale Formel.'),
      twins: b('Carbon monoxide 28.010, nitrogen 28.014 and ethene 28.054 g/mol: different atoms, almost the same molar mass. Weighing alone cannot tell them apart; the formula decides what is inside.',
        'Kohlenstoffmonoxid 28,010, Stickstoff 28,014 und Ethen 28,054 g/mol: verschiedene Atome, fast dieselbe molare Masse. Durch Wiegen allein lassen sie sich nicht unterscheiden; die Formel sagt, was drinsteckt.'),
    },
    check: {
      id: 'u13-check', unit: 13, kind: 'rank', format: 'rank', evidence: 'predict', concepts: ['u13.mass-fraction'], targets: ['atoms-count-share'],
      prompt: b('Rank by oxygen\'s share of the mass, largest first. Molar masses (rounded): water {{H2O}} 18.02, carbon dioxide {{CO2}} 44.01, carbon monoxide {{CO}} 28.01, glucose {{C6H12O6}} 180.16 g/mol. One O atom: 16.00 u.',
        'Ordne nach dem Massenanteil des Sauerstoffs, den größten zuerst. Molare Massen (gerundet): Wasser {{H2O}} 18,02; Kohlenstoffdioxid {{CO2}} 44,01; Kohlenstoffmonoxid {{CO}} 28,01; Glucose {{C6H12O6}} 180,16 g/mol. Ein O-Atom: 16,00 u.'),
      order: [b('water, {{H2O}}', 'Wasser, {{H2O}}'), b('carbon dioxide, {{CO2}}', 'Kohlenstoffdioxid, {{CO2}}'), b('carbon monoxide, {{CO}}', 'Kohlenstoffmonoxid, {{CO}}'), b('glucose, {{C6H12O6}}', 'Glucose, {{C6H12O6}}')],
      explain: b('16.00 ÷ 18.02 = 88.8 %, 32.00 ÷ 44.01 = 72.7 %, 16.00 ÷ 28.01 = 57.1 %, 96.00 ÷ 180.16 = 53.3 %. Glucose has the most oxygen atoms and the smallest share: for every 16 u of oxygen it has 14 u of carbon and hydrogen, water only 2 u of hydrogen.',
        '16,00 : 18,02 = 88,8 %, 32,00 : 44,01 = 72,7 %, 16,00 : 28,01 = 57,1 %, 96,00 : 180,16 = 53,3 %. Glucose hat die meisten Sauerstoffatome und den kleinsten Anteil: Auf je 16 u Sauerstoff kommen 14 u Kohlenstoff und Wasserstoff, beim Wasser nur 2 u Wasserstoff.'),
    } as RankItem,
  },

  predictions: [
    {
      item: {
        id: 'u13-moh2', unit: 13, kind: 'choice', format: 'predict', withConfidence: true, evidence: 'predict',
        concepts: ['u13.formula-count', 'u13.molar-mass-sum'], targets: ['formula-count-once', 'bracket-part'],
        prompt: b('Milk of magnesia, a remedy for heartburn, is magnesium hydroxide, {{Mg(OH)2}}. Atomic masses: Mg 24.305, O 15.999, H 1.008 u. Its molar mass is…',
          'Magnesiumhydroxid, {{Mg(OH)2}}, ist der Wirkstoff vieler Mittel gegen Sodbrennen (Antazida). Atommassen: Mg 24,305; O 15,999; H 1,008 u. Seine molare Masse beträgt…'),
        options: [
          { text: b('41.31 g/mol', '41,31 g/mol'), mis: 'formula-count-once' },
          { text: b('42.32 g/mol', '42,32 g/mol'), mis: 'bracket-part' },
          { text: b('58.32 g/mol', '58,32 g/mol'), correct: true },
          { text: b('82.62 g/mol', '82,62 g/mol') },
        ],
        explain: b('The 2 after the bracket counts the whole OH group: 24.305 + 2 × 15.999 + 2 × 1.008 = 58.32 g/mol. 42.32 doubles only the H, 41.31 ignores the 2, 82.62 doubles the magnesium too.',
          'Die 2 hinter der Klammer gilt für die ganze OH-Gruppe: 24,305 + 2 · 15,999 + 2 · 1,008 = 58,32 g/mol. 42,32 verdoppelt nur das H, 41,31 übersieht die 2, 82,62 verdoppelt auch das Magnesium.'),
      } as ChoiceItem,
      show: { engine: 'ladder', sub: 'Mg(OH)2', grams: 58.32, breakdown: true },
      revealText: b('58.32 g/mol: each {{Mg2+}} ion comes with two {{OH-}} ions, so O and H both count twice. Written out: 24.305 + 2 × (15.999 + 1.008) = 58.32 g/mol.',
        '58,32 g/mol: Zu jedem {{Mg2+}}-Ion gehören zwei {{OH-}}-Ionen, also kommen O und H je zweimal vor. Ausgeschrieben: 24,305 + 2 · (15,999 + 1,008) = 58,32 g/mol.'),
      extra: {
        title: b('Read the bracket first', 'Erst die Klammer lesen'),
        steps: [
          b('A subscript after a bracket counts everything inside it: (OH)₂ means two OH groups.', 'Ein Index hinter einer Klammer gilt für alles darin: (OH)₂ bedeutet zwei OH-Gruppen.'),
          b('Count each kind of atom: Mg 1, O 2, H 2.', 'Zähle jede Atomsorte: Mg 1, O 2, H 2.'),
          b('Multiply each count by its atomic mass and add: 24.305 + 2 × 15.999 + 2 × 1.008 = 58.32 g/mol.', 'Multipliziere jede Anzahl mit ihrer Atommasse und addiere: 24,305 + 2 · 15,999 + 2 · 1,008 = 58,32 g/mol.'),
          b('Check with the charges: {{Mg2+}} needs two {{OH-}} ions to balance, which is why the 2 is there.', 'Prüfe mit den Ladungen: {{Mg2+}} braucht zwei {{OH-}}-Ionen zum Ausgleich, deshalb steht dort die 2.'),
        ],
      },
    },
    {
      item: {
        id: 'u13-glucose-h', unit: 13, kind: 'choice', format: 'predict', withConfidence: true, evidence: 'transfer',
        concepts: ['u13.mol-of-atoms', 'u13.formula-count'], targets: ['molecules-for-atoms'],
        prompt: b('Glucose, {{C6H12O6}}, has a molar mass of 180.16 g/mol. How many moles of hydrogen atoms are in 90 g of glucose?',
          'Glucose, {{C6H12O6}}, hat die molare Masse 180,16 g/mol. Wie viel Mol Wasserstoffatome stecken in 90 g Glucose?'),
        options: [
          { text: b('about 0.5 mol', 'etwa 0,5 mol'), mis: 'molecules-for-atoms' },
          { text: b('about 3 mol', 'etwa 3 mol') },
          { text: b('about 6 mol', 'etwa 6 mol'), correct: true },
          { text: b('about 12 mol', 'etwa 12 mol') },
        ],
        explain: b('90 g ÷ 180.16 g/mol = 0.50 mol of glucose molecules, each with 12 H atoms: 12 × 0.50 = 6.0 mol of H atoms. 0.5 mol is the amount of molecules, not of H atoms; you get 3 mol if you use the 6 of C or O instead of the 12 of H; 12 mol of H atoms are only in 180 g, which is 1 mol of glucose.',
          '90 g : 180,16 g/mol = 0,50 mol Glucosemoleküle mit je 12 H-Atomen: 12 · 0,50 = 6,0 mol H-Atome. 0,5 mol ist die Stoffmenge der Moleküle, nicht der H-Atome; 3 mol erhältst du, wenn du mit der 6 von C oder O statt der 12 von H rechnest; 12 mol H-Atome stecken erst in 180 g, also in 1 mol Glucose.'),
      } as ChoiceItem,
      show: { engine: 'ladder', sub: 'C6H12O6', grams: 90, breakdown: true, rung: 'moles' },
      revealText: b('90 g of glucose is 0.50 mol of molecules. Each contains 12 H atoms, so the sample holds 6.0 mol of H atoms, about 3.6 × 10²⁴. The balance gives moles of molecules; the formula turns them into moles of each kind of atom.',
        '90 g Glucose sind 0,50 mol Moleküle. Jedes enthält 12 H-Atome, die Stoffportion also 6,0 mol H-Atome, etwa 3,6 · 10²⁴. Die Waage liefert die Stoffmenge der Moleküle; die Formel macht daraus die Stoffmenge jeder Atomsorte.'),
      extra: {
        title: b('From grams to moles of one kind of atom', 'Von Gramm zur Stoffmenge einer Atomsorte'),
        steps: [
          b('Grams to moles of molecules: n = m ÷ M = 90 g ÷ 180.16 g/mol = 0.50 mol.', 'Gramm in Mol Moleküle: n = m : M = 90 g : 180,16 g/mol = 0,50 mol.'),
          b('Read the formula: each glucose molecule has 12 H atoms.', 'Lies die Formel: Jedes Glucosemolekül hat 12 H-Atome.'),
          b('So there are 12 times as many H atoms as molecules: 12 × 0.50 mol = 6.0 mol of H atoms.', 'Es gibt also 12-mal so viele H-Atome wie Moleküle: 12 · 0,50 mol = 6,0 mol H-Atome.'),
          b('The same works for any atom: 6 × 0.50 = 3.0 mol of C atoms and 3.0 mol of O atoms.', 'Genauso für jede Atomsorte: 6 · 0,50 = 3,0 mol C-Atome und 3,0 mol O-Atome.'),
        ],
      },
    },
  ],

  examples: [
    {
      title: b('Water: one atom in three, most of the mass', 'Wasser: ein Atom von dreien, fast die ganze Masse'), tag: 'H2O', show: { engine: 'ladder', sub: 'H2O', grams: 18.015, breakdown: true },
      numbers: [
        { v: '88.8 %', label: b('of water\'s mass is oxygen', 'der Masse des Wassers sind Sauerstoff') },
        { v: '11.2 %', label: b('is hydrogen, though two atoms in three are H', 'sind Wasserstoff, obwohl zwei von drei Atomen H sind') },
        { v: '15.999 u', label: b('for one O atom, against 1.008 u for one H atom', 'für ein O-Atom, gegenüber 1,008 u für ein H-Atom') },
      ],
      body: b('A mass share is about mass, not atoms: number of atoms × atomic mass ÷ molar mass. The two hydrogen atoms add only 2.016 u to the 18.015 u. In an exam write w(O) = 1 × M(O) ÷ M(H₂O) = 15.999 g/mol ÷ 18.015 g/mol = 0.888 = 88.8 %, then an answer sentence.',
        'Ein Massenanteil bezieht sich auf die Masse, nicht auf die Zahl der Atome: Zahl der Atome · Atommasse : molare Masse. Die zwei Wasserstoffatome tragen nur 2,016 u zu den 18,015 u bei. In der Klausur schreibst du w(O) = 1 · M(O) : M(H₂O) = 15,999 g/mol : 18,015 g/mol = 0,888 = 88,8 %, dann einen Antwortsatz.'),
      soWhat: b('Splitting water is one way to make hydrogen fuel: about 9 kg of water for 1 kg of hydrogen (calculated: 18.015 ÷ 2.016 = 8.94).',
        'Wasser zu spalten ist ein Weg zu Wasserstoff als Treibstoff: etwa 9 kg Wasser für 1 kg Wasserstoff (berechnet: 18,015 : 2,016 = 8,94).'),
    },
    {
      title: b('Table salt: a formula without molecules', 'Kochsalz: eine Formel ohne Moleküle'), tag: 'NaCl', show: { engine: 'ladder', sub: 'NaCl', grams: 58.44, rung: 'particles' },
      numbers: [
        { v: '58.44 g', label: b('is the mass of 1 mol of formula units, {{Na+}} with {{Cl-}}', 'ist die Masse von 1 mol Formeleinheiten, {{Na+}} mit {{Cl-}}') },
        { v: '2 mol', label: b('of ions in 1 mol of NaCl: 1 mol {{Na+}} and 1 mol {{Cl-}}', 'Ionen in 1 mol NaCl: 1 mol {{Na+}} und 1 mol {{Cl-}}') },
        { v: '39.3 %', label: b('of the mass is sodium', 'der Masse sind Natrium') },
      ],
      body: b('Salt is a lattice of ions with no separate molecules: every {{Na+}} sits among six {{Cl-}} (unit 4). The formula NaCl gives only their ratio, a [[formula-unit]], not a molecule. So 58.44 g/mol (22.99 + 35.45) is per mole of formula units, which holds 1 mol of each ion.',
        'Salz ist ein Ionengitter ohne einzelne Moleküle: Jedes {{Na+}} sitzt zwischen sechs {{Cl-}} (Einheit 4). Die Formel NaCl gibt nur ihr Zahlenverhältnis an, eine [[formula-unit]], kein Molekül. 58,44 g/mol (22,99 + 35,45) gilt also für Formeleinheiten, und 1 mol davon enthält 1 mol von jeder Ionensorte.'),
      soWhat: b('On food labels sodium is converted into salt by multiplying by 2.5 (EU food information rules; Food Standards Scotland), a rounded 58.44 ÷ 22.99 = 2.54. The 6 g of salt adults should not go over in a day hold about 2.4 g of sodium.',
        'Auf Lebensmitteletiketten wird Natrium in Salz umgerechnet: mal 2,5 (EU-Lebensmittelinformationsverordnung), gerundet aus 58,44 : 22,99 = 2,54. Die 6 g Salz, die Erwachsene pro Tag höchstens essen sollten, enthalten etwa 2,4 g Natrium.'),
    },
    {
      title: b('Three substances, one analysis', 'Drei Stoffe, eine Analyse'), tag: 'CH2O', show: { engine: 'ladder', sub: 'C6H12O6', grams: 180.16, breakdown: true },
      numbers: [
        { v: '40.00 %', label: b('carbon in glucose, acetic acid and formaldehyde alike', 'Kohlenstoff in Glucose, Essigsäure und Formaldehyd gleichermaßen') },
        { v: '1 : 2 : 1', label: b('C : H : O in moles, so the analysis gives {{CH2O}}', 'C : H : O in Mol, die Analyse ergibt also {{CH2O}}') },
        { v: '6', label: b('times {{CH2O}} (30.03 g/mol) makes glucose, 180.16 g/mol', 'mal {{CH2O}} (30,03 g/mol) ergibt Glucose, 180,16 g/mol') },
      ],
      body: b('Mass shares give the ratio of the atoms, not how many sit in one molecule. Glucose ({{C6H12O6}}), the acetic acid in vinegar ({{C2H4O2}}) and formaldehyde ({{CH2O}}) all give C : H : O = 1 : 2 : 1, the [[empirical-formula]] {{CH2O}}. Only the molar mass, measured another way, tells them apart: 180.16 ÷ 30.03 = 6 for glucose, 2 for acetic acid.',
        'Massenanteile geben das Verhältnis der Atome an, nicht wie viele in einem Molekül sitzen. Bei Glucose ({{C6H12O6}}), der Essigsäure im Essig ({{C2H4O2}}) und Formaldehyd ({{CH2O}}) liefert die Analyse jeweils C : H : O = 1 : 2 : 1, also die [[empirical-formula]] {{CH2O}}. Erst die molare Masse, auf anderem Weg gemessen, unterscheidet sie: 180,16 : 30,03 = 6 bei Glucose, 2 bei Essigsäure.'),
      soWhat: b('The formula that gives how many atoms of each kind one molecule actually contains is the molecular formula. Salts have no molecules: their formula gives the smallest whole-number ratio of the ions, each ion written whole (NaCl, {{CaCl2}}, but {{Na2O2}} with the peroxide ion {{O22-}}).',
        'Die Formel, die angibt, wie viele Atome jeder Sorte ein Molekül tatsächlich enthält, ist die Summenformel (auch Molekülformel). Salze haben keine Moleküle: Ihre Formel gibt das kleinste ganzzahlige Verhältnis der Ionen an, jedes Ion ganz geschrieben (NaCl, {{CaCl2}}, aber {{Na2O2}} mit dem Peroxid-Ion {{O22-}}).'),
    },
  ],

  flaw: {
    id: 'u13-flaw', unit: 13, kind: 'flaw', format: 'flaw', evidence: 'transfer', concepts: ['u13.empirical', 'u13.molar-mass-sum'],
    prompt: b('Where does this reasoning first go wrong?', 'Wo geht diese Überlegung zum ersten Mal schief?'),
    lines: [
      b('A gas is 85.6 % carbon and 14.4 % hydrogen by mass, so 100 g of it holds 85.6 g C and 14.4 g H.', 'Ein Gas besteht zu 85,6 % aus Kohlenstoff und zu 14,4 % aus Wasserstoff (Massenanteile); 100 g enthalten also 85,6 g C und 14,4 g H.'),
      b('In moles: 85.6 ÷ 12.01 = 7.13 mol C and 14.4 ÷ 1.008 = 14.3 mol H.', 'In Mol: 85,6 g : 12,01 g/mol = 7,13 mol C und 14,4 g : 1,008 g/mol = 14,3 mol H.'),
      b('Dividing both by 7.13 gives C : H = 1 : 2, so the empirical formula is {{CH2}}.', 'Beides durch 7,13 geteilt ergibt C : H = 1 : 2, die Verhältnisformel ist also {{CH2}}.'),
      b('{{CH2}} adds up to 12.01 + 2 × 1.008 = 14.03 g/mol.', '{{CH2}} ergibt 12,01 + 2 · 1,008 = 14,03 g/mol.'),
      b('The gas\'s measured molar mass is 28.05 g/mol, so each molecule is {{CH2}}: one C atom with two H atoms.', 'Die gemessene molare Masse des Gases ist 28,05 g/mol, also ist jedes Molekül {{CH2}}: ein C-Atom mit zwei H-Atomen.'),
    ],
    flaw: 4,
    near: [{ step: 2, note: b('Step 3 looks like the slip because 14.3 ÷ 7.13 is 2.005, not exactly 2. It holds: measured percentages carry small errors, so a ratio this close to a whole number is rounded.', 'Schritt 3 sieht nach dem Fehler aus, weil 14,3 : 7,13 = 2,005 ist, nicht genau 2. Er stimmt aber: Gemessene Anteile haben kleine Fehler, also rundet man ein Verhältnis, das so nah an einer ganzen Zahl liegt (hier 2,005), auf diese Zahl.') }],
    explain: b('Step 5 is the slip: 28.05 ÷ 14.03 = 2, so each molecule holds two {{CH2}} units, {{C2H4}}, ethene. Steps 1 to 4 are true: percentages become grams, grams ÷ atomic mass become moles, the ratio 2.005 rounds to 2, and {{CH2}} sums to 14.03 g/mol. The empirical formula gives the ratio; the molar mass gives the count.',
      'Schritt 5 ist der Fehler: 28,05 : 14,03 = 2, jedes Molekül enthält also zwei {{CH2}}-Einheiten, {{C2H4}}, Ethen. Die Schritte 1 bis 4 stimmen: Aus den Anteilen werden Gramm, aus Gramm : Atommasse wird Mol, das Verhältnis 2,005 rundet man auf 2, und {{CH2}} ergibt 14,03 g/mol. Die Verhältnisformel gibt das Verhältnis an; die molare Masse liefert die Anzahl.'),
  } as FlawItem,

  deeper: {
    id: 'u13-deeper', unit: 13, kind: 'rank', format: 'rank', evidence: 'transfer', concepts: ['u13.mass-fraction', 'u13.formula-count'], targets: ['atoms-count-share', 'formula-count-once'],
    prompt: b('Rank these nitrogen fertilisers by nitrogen\'s share of their mass, largest first. Molar masses: ammonia {{NH3}} 17.03, urea {{CO(NH2)2}} 60.06, ammonium nitrate {{NH4NO3}} 80.04, ammonium sulfate {{(NH4)2SO4}} 132.13 g/mol. One N atom: 14.01 u.',
      'Ordne diese Stickstoffdünger nach dem Massenanteil des Stickstoffs, den größten zuerst. Molare Massen: Ammoniak {{NH3}} 17,03; Harnstoff {{CO(NH2)2}} 60,06; Ammoniumnitrat {{NH4NO3}} 80,04; Ammoniumsulfat {{(NH4)2SO4}} 132,13 g/mol. Ein N-Atom: 14,01 u.'),
    order: [b('ammonia, {{NH3}}', 'Ammoniak, {{NH3}}'), b('urea, {{CO(NH2)2}}', 'Harnstoff, {{CO(NH2)2}}'), b('ammonium nitrate, {{NH4NO3}}', 'Ammoniumnitrat, {{NH4NO3}}'), b('ammonium sulfate, {{(NH4)2SO4}}', 'Ammoniumsulfat, {{(NH4)2SO4}}')],
    explain: b('Count the N atoms first: 1 in ammonia, 2 in urea (the bracket), 2 in ammonium nitrate (one in each ion) and 2 in ammonium sulfate (the bracket). Then 14.01 ÷ 17.03 = 82 %, 28.02 ÷ 60.06 = 47 %, 28.02 ÷ 80.04 = 35 %, 28.02 ÷ 132.13 = 21 %. Ammonia has the fewest N atoms and the largest share: little other mass comes with its nitrogen.',
      'Zähle zuerst die N-Atome: 1 im Ammoniak, 2 im Harnstoff (die Klammer), 2 im Ammoniumnitrat (eines in jedem Ion) und 2 im Ammoniumsulfat (die Klammer). Dann 14,01 : 17,03 = 82 %, 28,02 : 60,06 = 47 %, 28,02 : 80,04 = 35 %, 28,02 : 132,13 = 21 %. Ammoniak hat die wenigsten N-Atome und den größten Anteil: Mit seinem Stickstoff kommt wenig andere Masse.'),
  } as RankItem,

  explain: {
    prompt: b('In your own words: how do you work out a molar mass from a formula, what does one mole of water or of table salt contain, and why is water mostly oxygen by mass?',
      'In eigenen Worten: Wie berechnest du aus einer Formel die molare Masse, was enthält ein Mol Wasser oder Kochsalz, und warum besteht Wasser der Masse nach hauptsächlich aus Sauerstoff?'),
    ideas: [
      { id: 'subscript', concept: 'u13.formula-count', idea: b('A subscript counts the atom just before it; after a bracket it counts everything in the bracket', 'Ein Index gibt an, wie viele Atome des Elements direkt davor im Teilchen stecken; hinter einer Klammer gilt er für alles in der Klammer'), contra: FORMULA_ONCE,
        en: /((subscripts?|small (numbers?|digits?)|little (numbers?|digits?)|lowered numbers?|index(es)?|indices|numbers? (after|below|behind|next to|under) (the |each |a )?(symbols?|letters?|atoms?|elements?))\b.{0,60}(count\w*|tells?|gives?|says?|means?|shows?|multipl\w*|times|appl(y|ies)|belongs?|refers?|how many|number of)|\b(count\w*|multipl\w*)\b.{0,40}(subscripts?|brackets?|parenthes[ie]s|index|little numbers?|small numbers?)|(brackets?|parenthes[ie]s)\b.{0,60}(everything|all (the )?atoms|whole|both|each atom|inside|group|multipl\w*|times|twice|doubles?)|\bcount\w* (up )?(how many|the (number of )?atoms|each atom|the atoms|every atom)|how many (of each|atoms of each|of every))/,
        de: /((index\p{L}*|indizes|tiefgestellte\p{L}* zahl\p{L}*|kleine\p{L}* zahl\p{L}*|zahl\p{L}* (hinter|unter|nach) (dem|einem|jedem) (symbol|element|atom))(?!\p{L}).{0,60}(zählt|zählen|gibt|sagt|bedeutet|zeigt|multipli\p{L}*|mal(?!\p{L})|gilt|gelten|bezieht|wie viele|anzahl)|(?<!\p{L})(zähl\p{L}*|multipli\p{L}*)(?!\p{L}).{0,40}(index|indizes|klammer)|klammer\p{L}*(?!\p{L}).{0,60}(alles|alle atome|ganze|beide|jedes atom|drin|darin|innen|gruppe|multipli\p{L}*|mal(?!\p{L})|doppelt|zweimal)|(?<!\p{L})zähl\p{L}* (wie viele|die atome|jedes atom|die anzahl)|wie viele (von jedem|atome jedes|von jeder))/u },
      { id: 'sum', concept: 'u13.molar-mass-sum', idea: b('The molar mass is the sum of the atomic masses, each times its count', 'Die molare Masse ist die Summe der Atommassen, jede mal ihre Anzahl'), contra: FORMULA_ONCE,
        en: /(\b(add\w*|sum\w*|total\w*|plus|together)\b.{0,60}(atomic (mass|weight)\w*|atom masses|masses of (the |all the |all |its |each |every )?(atoms|elements)|mass(es)? of each|each atom'?s? mass|the masses|all the atoms|their masses|how heavy|weights? of (the |each |all the |every )?atoms?)|(atomic (mass|weight)\w*|masses of (the )?atoms|atom masses|atom'?s? mass(es)?)\b.{0,60}\b(add\w*|sum\w*|total|plus|together)|(molar|formula|molecular) mass\b.{0,30}\b(is|=|equals)\b.{0,15}(the )?(sum|total)|\d+(\.\d+)? ?(×|x|\*|·) ?\d+(\.\d+)? ?\+|\+ ?\d+(\.\d+)? ?(×|x|\*|·) ?\d+|\d ?(×|x|\*|·) ?m ?\(|\bmultipl\w*\b.{0,30}(mass|weight)\w*.{0,30}\b(by|with|times)\b.{0,15}(subscripts?|little numbers?|small numbers?|counts?|number of atoms|how many)|\bsum over\b)/,
        de: /((?<!\p{L})(addier\p{L}*|summ\p{L}*|zusammengezählt|zusammenzähl\p{L}*|zusammenrechn\p{L}*|plus|gesamt\p{L}*)(?!\p{L}).{0,60}(atommasse\p{L}*|atomare\p{L}* masse\p{L}*|massen (der|aller|jedes|jeder) (atome|elemente)|masse (jedes|aller|der) atom\p{L}*|wie schwer)|(atommasse\p{L}*|massen der (einzelnen )?atome|atomare\p{L}* masse\p{L}*)(?!\p{L}).{0,60}(addier\p{L}*|summ\p{L}*|zusammen\p{L}*|plus)|(molare masse|(?<!\p{L})m(?!\p{L}))\s?(ist|=|ergibt sich (aus|als))\s?(die |der )?(summe|addition)|\d+(,\d+)? ?(×|x|\*|·) ?\d+(,\d+)? ?\+|\+ ?\d+(,\d+)? ?(×|x|\*|·) ?\d+|\d ?(×|x|\*|·) ?m ?\(|(?<!\p{L})(multiplizier|mal nehm|malnehm)\p{L}*.{0,40}(atommasse|masse)\p{L}*.{0,30}(index|indizes|anzahl|kleinen zahl)|(atommasse|masse)\p{L}*.{0,30}mit (dem |der )?(index|anzahl|kleinen zahl)\p{L}* (mal|multipli))/u },
      { id: 'mol-atoms', concept: 'u13.mol-of-atoms', idea: b('One mole of a compound holds its atoms in the formula\'s ratio: 1 mol of water has 2 mol of H atoms', 'Ein Mol einer Verbindung enthält die Atome im Verhältnis der Formel: 1 mol Wasser enthält 2 mol H-Atome'),
        en: /(\b(1|one|a) mol(e)?( of)? (water|h2o|the compound|a compound|glucose|co2|nh3|ammonia|methane|ch4|carbon dioxide|it)\b.{0,60}(\b(2|two|3|three|4|four|6|six|12|twelve) mol(e)?s?\b|twice as many|double|two moles)|\b(2|two|3|three|4|four|6|six|12|twelve) mol(e)?s? (of )?(h|o|c|n|hydrogen|oxygen|carbon|nitrogen)\b|\bmol(e)?s? of (each )?(atoms|element)|(same|the formula'?s?) ratio\b.{0,40}\b(mol\w*|atoms)|\b(mol|moles|amounts?)\b.{0,40}(same ratio|in the ratio|(scale|go|grow)s? with the subscripts?|times the subscript)|n ?\( ?h ?\) ?= ?2 ?(×|x|\*|·)? ?n|\bamounts? of each element\b)/,
        de: /((?<!\p{L})(1|ein\p{L}*) mol (wasser|h2o|der verbindung|einer verbindung|glucose|co2|nh3|ammoniak|methan|ch4|kohlenstoffdioxid)(?!\p{L}).{0,60}((?<!\p{L})(2|zwei|3|drei|4|vier|6|sechs|12|zwölf) mol(?!\p{L})|doppelt so viel\p{L}*|zweimal so viel\p{L}*)|(?<!\p{L})(2|zwei|3|drei|4|vier|6|sechs|12|zwölf) mol (an )?(h|o|c|n|wasserstoff|sauerstoff|kohlenstoff|stickstoff)(?!\p{L})|stoffmenge\p{L}* (der|an|jedes|jeder) (atome|element\p{L}*)|(im )?(selben|gleichen) verhältnis(?!\p{L}).{0,40}(mol|atome|stoffmenge)|(?<!\p{L})(mol|stoffmenge\p{L}*)(?!\p{L}).{0,40}(selben|gleichen) verhältnis|n ?\( ?h ?\) ?= ?2 ?(·|\*|x)? ?n)/u },
      { id: 'formula-unit', concept: 'u13.formula-unit', idea: b('Salts are ion lattices: their formula gives the ratio of the ions, a formula unit, instead of a molecule', 'Salze sind Ionengitter: Ihre Formel gibt das Zahlenverhältnis der Ionen an (Formeleinheit), kein Molekül'), contra: IONIC_MOL,
        en: new RegExp(UNIT_EN + '([^.;]*?' + NOMOL_EN + '[^.;]*)?|' + NOMOL_EN + '[^.;]*'),
        de: new RegExp(UNIT_DE + '([^.;]*?' + NOMOL_DE + '[^.;]*)?|' + NOMOL_DE + '[^.;]*', 'u') },
      { id: 'share', concept: 'u13.mass-fraction', idea: b('An element\'s mass share is its count × atomic mass ÷ molar mass, so a few heavy atoms can outweigh many light ones', 'Der Massenanteil eines Elements ist Anzahl · Atommasse : molare Masse, deshalb können wenige schwere Atome viele leichte überwiegen'), contra: ATOMS_SHARE,
        en: /((\b(mass )?(share|fraction|percent\w*|proportion)\b|%).{0,80}(heav\w*|atomic mass\w*|mass of (the |each |its |one |an? )?(atom|element)s?|divid\w*|÷|\/|over the (molar|total) mass|of the (molar|total) mass|out of (the )?(molar|total))|\bheav\w*.{0,80}(most of the (mass|weight)|more of the (mass|weight)|mostly|bigger share|larger share|most of (its|the) mass|by (mass|weight))|(most of (the|its) (mass|weight)|(mostly|almost all|nearly all|largely|mainly) (oxygen|o)\b|by (mass|weight))\b.{0,80}(heav\w*|atomic mass)|\b(few|one|fewer|single)\b.{0,40}heav\w*.{0,60}(outweigh|more than|beat)|outweigh\w*|(16|sixteen) times (heavier|the mass|as heavy))/,
        de: /(((massenanteil|anteil|prozent)\p{L}*|%|(?<!\p{L})w ?\().{0,80}(schwer\p{L}*|atommasse\p{L}*|masse (der|des|eines|jedes) (atom|element)\p{L}*|geteilt|dividier\p{L}*|÷|\/|\d,\d+ ?: ?\d|(?<!\p{L})m ?\([^)]*\) ?: ?m ?\(|durch (die )?(molare|gesamt)\p{L}* masse|an der (molaren|gesamten) masse)|(?<!\p{L})schwer\p{L}*.{0,80}(großteil der masse|meiste\p{L}* (der )?masse|größte\p{L}* (massen)?anteil|überwieg\p{L}*|hauptsächlich|vor allem)|(großteil der masse|meiste\p{L}* (der )?masse|(hauptsächlich|überwiegend|fast ganz|fast nur|fast komplett|größtenteils|vor allem) (aus )?sauerstoff|der masse nach|massenmäßig).{0,80}(schwer\p{L}*|atommasse)|(?<!\p{L})(wenige\p{L}*|ein\p{L}*|einzige\p{L}*)(?!\p{L}).{0,40}schwer\p{L}*.{0,60}(mehr als|überwieg\p{L}*|schlag\p{L}*)|(16|sechzehn)\s?(mal|·|-mal|fach) (schwerer|so schwer))/u },
    ] as Idea[],
    tightened: b('In a formula a subscript counts the atom just before it, and after a bracket it counts everything in the bracket: H₂O has two H and one O, Ca(OH)₂ has two O and two H. The molar mass is the sum of the atomic masses, each times its count: 2 × 1.008 + 15.999 = 18.015 g/mol. One mole of water therefore holds 2 mol of H atoms and 1 mol of O atoms, the same ratio as the formula. Table salt is an ion lattice with no separate molecules: NaCl gives the 1 : 1 ratio of the ions, a formula unit, and 58.44 g/mol is per mole of formula units. An element\'s mass share is its count × atomic mass divided by the molar mass, so water\'s single oxygen atom, about 16 times heavier than an H atom, makes up 88.8 % of the mass.',
      'In einer Formel gibt ein Index an, wie viele Atome des Elements direkt davor stecken, und hinter einer Klammer gilt er für alles in der Klammer: H₂O hat zwei H und ein O, Ca(OH)₂ hat zwei O und zwei H. Die molare Masse ist die Summe der Atommassen, jede mal ihre Anzahl: 2 · 1,008 + 15,999 = 18,015 g/mol. Ein Mol Wasser enthält deshalb 2 mol H-Atome und 1 mol O-Atome, im selben Verhältnis wie die Formel. Kochsalz ist ein Ionengitter ohne einzelne Moleküle: NaCl gibt das Verhältnis 1 : 1 der Ionen an, eine Formeleinheit, und 58,44 g ist die Masse von 1 mol Formeleinheiten. Der Massenanteil eines Elements ist Anzahl · Atommasse geteilt durch die molare Masse, deshalb macht das eine Sauerstoffatom des Wassers, etwa 16-mal so schwer wie ein H-Atom, 88,8 % der Masse aus.'),
  },

  terms: ['molar-mass', 'formula-unit', 'mass-fraction', 'empirical-formula', 'ionic-lattice'],

  readings: [
    {
      lang: 'en', kind: 'quick',
      title: b('Mass Percent Composition from a Chemical Formula', 'Mass Percent Composition from a Chemical Formula'), source: 'Chemistry LibreTexts, Introductory Chemistry, section 6.7',
      url: 'https://chem.libretexts.org/Bookshelves/Introductory_Chemistry/Introductory_Chemistry_(LibreTexts)/06%3A_Chemical_Composition/6.07%3A_Mass_Percent_Composition_from_a_Chemical_Formula',
      lookFor: [
        b('Its worked example, Cl₂O₇, multiplies 35.45 by 2 and 16.00 by 7. Where do the 2 and the 7 come from? It is the same step as 2 × 1.008 for water.', ''),
        b('Its exercise answer gives barium fluoride, BaF₂, as 78.32 % barium, though barium has one atom to fluorine\'s two. Compare it with oxygen\'s 88.8 % in water.', ''),
        b('It says a pure compound always has the same percent composition. Glucose, acetic acid and formaldehyde share one composition. Do the two statements clash?', ''),
      ],
    },
    {
      lang: 'en', kind: 'deeper',
      title: b('Determining Empirical and Molecular Formulas', 'Determining Empirical and Molecular Formulas'), source: 'OpenStax Chemistry 2e, section 3.2',
      url: 'https://openstax.org/books/chemistry-2e/pages/3-2-determining-empirical-and-molecular-formulas',
      lookFor: [
        b('The flow chart in Figure 3.11: masses, moles, divide by the smallest, whole numbers. Match each box to a step of the spot-the-flaw reasoning.', ''),
        b('A Check Your Learning question asks for the iron share of Fe₂O₃. Is its answer the 69.9 % of the ore puzzle?', ''),
        b('Where it turns CH₂O into C₆H₁₂O₆ with a molecular mass of 180: which two numbers does it divide, and what multiplier does it get?', ''),
      ],
    },
    {
      lang: 'de', kind: 'quick',
      title: b('Molare Masse berechnen', 'Molare Masse berechnen'), source: 'Studyflix',
      url: 'https://studyflix.de/chemie/molare-masse-berechnen-1573',
      lookFor: [
        b('', 'Die Antwort des Artikels zu Klammern: M = M(Ca) + 2 · (M(O) + M(H)) für Ca(OH)₂. Ergibt das die 74,09 g/mol der Zoom-Leiter?'),
        b('', 'Für Salze nimmt der Artikel die Formeleinheit, das kleinste Zahlenverhältnis der Ionen. Was zeigt die Zoom-Leiter für Kochsalz auf der Stufe „Teilchen“?'),
        b('', 'Die Tabelle im Artikel gibt Kochsalz mit 58,4 g/mol an. Aus welchen zwei Atommassen setzt sich die Zahl zusammen, und warum zeigt die Zoom-Leiter 58,44?'),
      ],
    },
  ],

  // ionic-molecules (unit 4) is reused, not redefined. bracket-part: u13-moh2 B, i13a B, i13c; molecules-for-atoms:
  // u13-glucose-h A, i13g A, i13h D, i13i A.
  misconceptions: [
    { id: 'formula-count-once', name: b('Each element\'s mass counted once, ignoring the subscript', 'Jede Atommasse nur einmal gezählt, Index übersehen') },
    { id: 'bracket-part', name: b('A subscript after a bracket applied to only part of the bracket', 'Index hinter der Klammer nur auf einen Teil der Klammer bezogen') },
    { id: 'molecules-for-atoms', name: b('Moles of molecules taken for moles of one kind of atom', 'Stoffmenge der Moleküle mit der Stoffmenge einer Atomsorte verwechselt') },
    { id: 'atoms-count-share', name: b('More atoms of an element in the formula means a bigger mass share', 'Mehr Atome eines Elements in der Formel bedeuten einen größeren Massenanteil') },
  ],

  glossary: {
    'mass-fraction': {
      en: 'mass fraction', de: 'Massenanteil', unit: 13,
      def: { en: 'An element\'s share of a compound\'s mass: number of its atoms × atomic mass ÷ molar mass, often given in %. Symbol w.', de: 'Der Anteil eines Elements an der Masse einer Verbindung: Zahl seiner Atome · Atommasse : molare Masse, oft in %. Formelzeichen w.' },
      falseFriend: { en: 'Also "mass percent" or "percentage by mass"; German books write w(O) = 88,8 %.', de: 'Auf Englisch auch „mass percent“ oder „percentage by mass“.' },
    },
    'empirical-formula': {
      en: 'empirical formula', de: 'Verhältnisformel', unit: 13,
      def: { en: 'The smallest whole-number ratio of the atoms in a compound, such as {{CH2O}} for glucose, {{C6H12O6}}. A salt\'s formula gives the smallest ratio of its ions, each ion written whole ({{Na2O2}}, not NaO).', de: 'Das kleinste ganzzahlige Verhältnis der Atome in einer Verbindung, etwa {{CH2O}} für Glucose, {{C6H12O6}}. Die Formel eines Salzes gibt das kleinste Verhältnis seiner Ionen an, jedes Ion ganz geschrieben ({{Na2O2}}, nicht NaO).' },
      falseFriend: { en: 'German "Summenformel" (also "Molekülformel") is the molecular formula, which counts the atoms of one molecule: C₆H₁₂O₆.', de: 'Die Summenformel (auch Molekülformel) ist auf Englisch die „molecular formula“; „empirical formula“ ist die Verhältnisformel.' },
    },
  },
};
