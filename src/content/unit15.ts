// Unit 15 — Limiting reagent and yield, on the Zoom Ladder (reaction mode).
// Molar masses from stoich.ts (molarMass, elements.ts masses): H₂ 2.016, O₂ 31.998 (text: 32.00), H₂O 18.015, N₂ 28.014,
// NH₃ 17.031, CH₄ 16.043, CO₂ 44.009, Mg 24.305, MgO 40.304, Fe₂O₃ 159.687, CO 28.010, Fe 55.845 g/mol.
// Puzzle: Space Shuttle main engine (RS-25) mixture ratio 6.0 : 1, oxygen to hydrogen by mass (NASA, F. H. Jue, "Space
// Shuttle Main Engine – Thirty Years of Innovation", NTRS 20020046693). The equation needs 31.998 / (2 × 2.016) = 7.94 : 1.
// 1 kg H₂ = 496.0 mol, 6 kg O₂ = 187.5 mol, which burns 375 mol H₂ (0.756 kg): 0.244 kg per kg of hydrogen unburned.
// Why fuel-rich: "The Isp optimizes at a fuel rich mixture ratio", which "further lowers the exhaust average molecular
// weight" (NASA, M. L. Meyer, NESC, "Hydrogen Applications for Space Transportation", NTRS 20200003550).
// Prediction 1 (calculated): 10 g H₂ 4.960 mol, 10 g O₂ 0.3125 mol → O₂ limiting, 0.625 mol H₂O = 11.26 g, H₂ used 1.26 g,
// left 8.74 g; traps 20 g (all of both), 89.4 g (H₂ taken as limiting), 5.63 g (one water per O₂).
// Prediction 2 (calculated): 28 g N₂ 0.9995 mol, 3 g H₂ 1.488 mol, ÷3 = 0.496 → H₂ limiting, 0.992 mol NH₃ = 16.9 g,
// N₂ used 13.9 g, left 14.1 g; traps 34.0 g (N₂ limiting), 31 g (all of both), 25.3 g (no 2/3).
// Sandwiches: 28 slices of bread + 11 of cheese → 11 sandwiches + 6 slices of bread left over (OpenStax Chemistry 2e,
// 4.4 Reaction Yields, Figure 4.13).
// Magnesium oxide: example calculation of the RSC class experiment "The change in mass when magnesium burns"
// (edu.rsc.org): 2.39 g Mg, 3.78 g MgO; reasons for low results there: oxide escapes when the lid is lifted, not all the
// magnesium reacts. 2.39 g Mg = 0.0983 mol → theoretical 3.963 g MgO → 95.4 %.
// Haber process (J. Clark, "5.4: The Haber Process", Chemistry LibreTexts, Brevard College LNC 216): "only about 15% of
// the nitrogen and hydrogen converts to ammonia" per pass; "the overall conversion is about 98%" with recycling; feed
// 1 volume N₂ : 3 volumes H₂; an excess is used only when the other reactant is "much more expensive", and an excess
// "wastes reactor space"; ammonia is liquefied, N₂ and H₂ recycled; the reaction is reversible (equilibrium).
// Flaw (calculated): 16 g CH₄ 0.997 mol, 48 g O₂ 1.500 mol; O₂ ÷ 2 = 0.75 → O₂ limiting, 0.75 mol CO₂ = 33.0 g,
// 0.25 mol CH₄ (3.97 g) left over. Deeper (calculated): 1000 kg Fe₂O₃ = 6.262 kmol, 600 kg CO = 21.42 kmol (÷3 = 7.14)
// → ore limiting, Fe = 2 × 6.262 kmol × 55.845 = 699 kg; CO limit would give 798 kg; one Fe per Fe₂O₃ 350 kg.
// ETH Leitprogramm "Stöchiometrie" (U. Wuthier, 3rd edition 2008): excess sulfur so that all copper reacts; yield example
// 6.4 g instead of 8.0 g = 80 %.
import type { Bi } from '../i18n';
import type { ChoiceItem, RankItem, FlawItem, EstimateItem } from './items';
import type { Idea } from './unit06';
import type { UnitContent } from './unitTypes';
import { molarMass } from './stoich';

const b = (en: string, de: string): Bi => ({ en, de });

// ---------- explain-back patterns ----------
// Negation guard for the contra patterns: a clause that denies the misconception must not rule an idea out.
const NOT_EN = '^(?!.*\\b(not|n\'t|never|no|cannot|without|rather than|instead of)\\b)';
const NOT_DE = '^(?!.*\\b(nicht|kein\\w*|nie|niemals|ohne|statt|anstatt)\\b)';

// Misconception (unit 14, reused): the coefficients give the mass ratio.
const COEFF_MASS = {
  en: new RegExp(NOT_EN + '.*((coefficients?|(big|front) numbers?)\\b.{0,30}\\b(are|give|gives|mean|means|show|shows|tell|tells|stand for|stands for|represent|represents|is|equal|equals)\\b.{0,15}\\b(the )?(masses|mass ratio|ratio of (the )?mass\\w*|grams|weights?|mass)\\b|\\b(two|2) (g|grams?) of hydrogen (for|per|to) (one|1|each|every) (g|gram) of oxygen)'),
  de: new RegExp(NOT_DE + '.*((koeff\\w*|stöchiometrische\\w* faktor\\w*|zahl\\w* davor)\\b.{0,30}\\b(sind|geben|gibt|bedeute\\w*|zeig\\w*|steh\\w* für|ist)\\b.{0,15}\\b(die |das )?(massen\\w*|gramm|gewicht\\w*|masse)\\b)'),
};
// Misconception: the reactant with the smaller mass runs out first.
const LESS_MASS = {
  en: new RegExp(NOT_EN + '.*((less|smaller|lower|least|smallest) (mass|weight|grams)\\b.{0,40}\\b(runs? out|limit\\w*|used up|first)|\\b(lighter|lightest)\\b( one| reactant| substance)?.{0,30}\\b(runs? out|is limiting|is the limiting|limits|used up first)|(reactant|substance|one) with (the )?(less|least|smaller|smallest|lower|lowest) (mass|weight|grams)\\b.{0,40}\\b(runs? out|limit\\w*|used up)|(fewer|less) grams\\b.{0,40}\\b(runs? out|limit\\w*))'),
  de: new RegExp(NOT_DE + '.*((weniger|kleiner\\w*|geringer\\w*|niedriger\\w*) (masse|gramm|gewicht)\\b.{0,40}(zuerst|limitier\\w*|aufgebraucht|verbraucht|begrenz\\w*)|(leichter\\w*|leichteste\\w*)( edukt| stoff)?\\b.{0,30}(zuerst|ist limitierend|limitiert|aufgebraucht|verbraucht)|mit (der )?(kleiner\\w*|geringer\\w*|weniger|niedriger\\w*) masse\\b.{0,40}(zuerst|limitier\\w*|aufgebraucht|verbraucht))'),
};

// Idea 3: moles divided by the coefficients, not masses. Negated phrases are listed literally, because the matcher only
// accepts a negation inside a match when the pattern spells it out ("not the masses").
const COMPARE_EN = new RegExp([
  'divid\\w*\\b.{0,50}\\b(by|through) (the |its |their |each )?(coefficients?|numbers? in (the )?front|stoichiometric (coefficients?|factors?)|(big|front) numbers?)',
  '(moles?|mol\\b|amounts?|\\bn)\\s?(÷|/|divided by|over)\\s?(the |its |their )?(coefficients?|stoichiometric)',
  '(÷|divided by) (the |its |their )?coefficients?',
  '(moles?|mol)\\b.{0,4}(÷|/|divided by) ?\\d',
  '(compar|look at|check|work out|use)\\w*\\b.{0,30}\\b(moles?|mol\\b|amounts? in moles|numbers? of (molecules|particles))\\b.{0,50}\\bcoefficients?',
  '(convert|change|turn|work)\\w*\\b.{0,30}\\b(masses?|grams?)\\b.{0,20}\\b(in)?to (moles?|mol\\b)\\b.{0,60}\\b(coefficients?|compar\\w*)',
  '(fewest|smallest|least|lowest)\\b.{0,40}(÷|divided|per coefficient|after dividing|rounds|times the equation|runs of the equation)',
  'not (by )?weigh\\w*|not how much (it|they) weighs?|not by how heavy|not by mass|not by the mass|not by weight|not the mass|not the masses|not the grams|not the weight|not mass|not masses|not grams|not weight|not their mass|not how heavy|not the heaviest|not the lightest|not the lighter|not the heavier|not the one with (the )?(less|least|smaller|smallest) mass',
  '(mass|masses|grams|weight)\\b.{0,30}\\b(does not decide|doesn\'t decide|does not matter|doesn\'t matter|does not tell|doesn\'t tell|is not what (counts|matters)|isn\'t what (counts|matters)|can mislead|is misleading|misleads)',
  '(lighter|lightest|smaller mass|less mass)\\b.{0,40}\\b(not always|not necessarily|isn\'t always|is not always|need not)\\b',
].map((s) => `(${s})`).join('|'));
const COMPARE_DE = new RegExp([
  'durch (den |die |ihren |seinen |jeweiligen |ihre |seine )?(koeff\\w*|stöchiometrisch\\w* faktor\\w*|vorzahl\\w*)\\b.{0,20}(teil|dividier|geteilt)',
  '(teil|dividier)\\w*\\b.{0,50}durch (den |die |ihren |seinen |jeweiligen |ihre |seine )?(koeff\\w*|stöchiometrisch\\w* faktor\\w*|vorzahl\\w*|zahl\\w* (davor|vor der formel))',
  '(stoffmenge\\w*|mol\\b|\\bn)\\s?(÷|/|durch|geteilt durch)\\s?(den |die |ihren |seinen |jeweiligen )?(koeff\\w*|stöchiometrisch\\w* faktor\\w*|vorzahl\\w*)',
  '(÷|geteilt durch) (den |die |ihren |seinen )?koeff\\w*',
  '(?<!\\p{L})durch (den |die |ihren |seinen |jeweiligen |ihre |seine )?(koeff\\w*|stöchiometrisch\\w* faktor\\w*)(?!.{0,30}(ausgegl|ausgleich|einger|einricht))',
  '(mol)\\b.{0,4}(÷|/|durch|geteilt durch) ?\\d',
  'vergleich\\w*\\b.{0,40}(stoffmenge\\w*|mol\\b|teilchenzahl\\w*)\\b.{0,60}(koeff\\w*|faktor\\w*)',
  '(rechn|wandl)\\w*\\b.{0,40}(masse\\w*|gramm)\\b.{0,30}(in |zu )(die )?(stoffmenge\\w*|mol\\b).{0,60}(koeff\\w*|vergleich\\w*)',
  '(kleinste\\w*|geringste\\w*|niedrigste\\w*)\\b.{0,40}(÷|geteilt|durch (den |die )?koeff\\w*|pro koeffizient)',
  'nicht (durch |nach dem )?wieg\\w*|nicht wie schwer|nicht die masse|nicht die massen|nicht nach der masse|nicht nach masse|nicht die gramm|nicht das gewicht|nicht nach dem gewicht|nicht das leichtere|nicht das leichteste|nicht das schwerere|nicht das edukt mit der kleinsten masse',
  '(masse|gewicht|gramm)\\w*\\b.{0,30}(entscheidet nicht|zählt nicht|ist nicht entscheidend|spielt keine rolle|ist egal|täuscht)',
  '(leichter\\w*|kleiner\\w* masse|weniger masse|geringer\\w* masse)\\b.{0,40}(nicht unbedingt|nicht immer|nicht automatisch)',
].map((s) => `(${s})`).join('|'), 'u');

export const UNIT15: UnitContent = {
  n: 15,
  title: b('Limiting reagent and yield', 'Limitierender Stoff und Ausbeute'),
  lead: b('Why one reactant runs out first, how to find it, and why a real reaction gives less than the equation promises.',
    'Warum ein Edukt zuerst aufgebraucht ist, wie du es findest und warum eine echte Reaktion weniger liefert, als die Gleichung verspricht.'),

  puzzle: {
    title: b('Six times more oxygen', 'Sechsmal mehr Sauerstoff'),
    lead: b('The Space Shuttle\'s three main engines burned liquid hydrogen with liquid oxygen: 2 H₂ + O₂ → 2 H₂O. For every kilogram of hydrogen they burned 6 kilograms of oxygen. The table gives the molar masses and the equation\'s coefficients.',
      'Die drei Haupttriebwerke des Space Shuttle verbrannten flüssigen Wasserstoff mit flüssigem Sauerstoff: 2 H₂ + O₂ → 2 H₂O. Auf jedes Kilogramm Wasserstoff kamen 6 Kilogramm Sauerstoff. Die Tabelle zeigt die molaren Massen und die Koeffizienten der Gleichung.'),
    data: {
      caption: b('Space Shuttle main engine (RS-25): NASA gives the mixture ratio as 6.0 : 1, oxygen to hydrogen by mass. Molar masses M from the periodic table.',
        'Haupttriebwerk des Space Shuttle (RS-25): Die NASA gibt das Mischungsverhältnis mit 6,0 : 1 an, Sauerstoff zu Wasserstoff nach Masse. Molare Massen M aus dem Periodensystem.'),
      head: [b('Propellant', 'Treibstoff'), b('M (g/mol)', 'M (g/mol)'), b('Mass fed (kg)', 'Masse (kg)'), b('Coefficient', 'Koeffizient')],
      rows: [
        { cells: [b('hydrogen, {{H2}}', 'Wasserstoff, {{H2}}'), '2.016', '1.0', '2'] },
        { cells: [b('oxygen, {{O2}}', 'Sauerstoff, {{O2}}'), '32.00', '6.0', '1'] },
      ],
      numeric: [1, 2, 3],
    },
    clash: b('Six times more oxygen than hydrogen, by mass: it looks as if the hydrogen must run out first. Yet part of one of the two left the nozzle unburned. Which one ran out first?',
      'Sechsmal mehr Sauerstoff als Wasserstoff, nach Masse: Es sieht so aus, als müsste der Wasserstoff zuerst aufgebraucht sein. Trotzdem verließ ein Teil eines der beiden die Düse unverbrannt. Welches war zuerst aufgebraucht?'),
    question: {
      id: 'u15-puzzle', unit: 15, kind: 'choice', format: 'predict', withConfidence: true, evidence: 'predict',
      concepts: ['u15.limiting', 'u15.compare'], targets: ['less-mass-limiting', 'coefficients-mass-ratio'],
      prompt: b('Your best guess:', 'Deine beste Vermutung:'),
      options: [
        { text: b('Hydrogen: there was six times less of it by mass', 'Wasserstoff: Davon war nach Masse sechsmal weniger da'), mis: 'less-mass-limiting' },
        { text: b('Hydrogen: the equation asks for 2 kg of hydrogen for every 1 kg of oxygen', 'Wasserstoff: Die Gleichung verlangt 2 kg Wasserstoff auf 1 kg Sauerstoff'), mis: 'coefficients-mass-ratio' },
        { text: b('Oxygen: an O₂ molecule has about 16 times the mass of an H₂, so 6 kg is too few molecules', 'Sauerstoff: Ein O₂-Molekül hat etwa die 16-fache Masse eines H₂, also sind 6 kg zu wenige Moleküle'), correct: true },
        { text: b('Neither: at 6 : 1 both burn completely', 'Keines: Bei 6 : 1 verbrennen beide vollständig') },
      ],
      explain: b('Count molecules, not kilograms. 1 kg of hydrogen is 496 mol of H₂ and needs 248 mol of O₂, which is 7.94 kg; 6 kg of oxygen is only 188 mol, so oxygen runs out first and about a quarter of the hydrogen leaves unburned. The engineers chose this on purpose: light, unburned hydrogen in the exhaust leaves the nozzle faster and gives more thrust per kilogram of propellant (NASA).',
        'Zähl Moleküle, nicht Kilogramm. 1 kg Wasserstoff sind 496 mol H₂ und brauchen 248 mol O₂, also 7,94 kg; 6 kg Sauerstoff sind nur 188 mol, deshalb ist der Sauerstoff zuerst aufgebraucht, und etwa ein Viertel des Wasserstoffs verlässt die Düse unverbrannt. Das war Absicht: Leichter, unverbrannter Wasserstoff im Abgas strömt schneller aus der Düse und bringt mehr Schub pro Kilogramm Treibstoff (NASA).'),
    } as ChoiceItem,
    after: b('Next: run reactions yourself and watch which reactant runs out.', 'Als Nächstes: Lass selbst Reaktionen ablaufen und sieh zu, welches Edukt zuerst aufgebraucht ist.'),
  },

  explore: {
    title: b('Running a reaction on the Zoom Ladder', 'Eine Reaktion auf der Zoom-Leiter'),
    intro: b('The ladder now runs a reaction. The equation is balanced and its [[coefficient|coefficients]] are fixed. For each [[reactant]] you set an amount: as molecules on the particles rung, in mol on the moles rung, in grams on the grams rung. Run the reaction: on the particles rung the molecules combine in the ratio of the coefficients until one reactant runs out, and what remains is marked "left over". The readouts name the [[limiting-reactant]], show n ÷ coefficient for each reactant (its amount in moles divided by its coefficient), the leftover, and the product in mol and g: the most the reactants can make, the theoretical yield. The last control takes the mass a real experiment collected and gives the [[percent-yield]].',
      'Die Leiter lässt jetzt eine Reaktion ablaufen. Die Reaktionsgleichung ist ausgeglichen, ihre [[coefficient|Koeffizienten]] stehen fest. Für jedes [[reactant|Edukt]] stellst du eine Menge ein: als Zahl der Moleküle auf der Teilchen-Sprosse, in mol auf der Mol-Sprosse, in Gramm auf der Gramm-Sprosse. Starte die Reaktion: Auf der Teilchen-Sprosse verbinden sich die Moleküle im Verhältnis der Koeffizienten (dem Stoffmengenverhältnis), bis ein Edukt aufgebraucht ist; der Rest ist als „übrig“ markiert. Dieses Edukt nennt man [[limiting-reactant]] (man sagt auch: Es liegt im Unterschuss vor), das andere liegt im [[excess|Überschuss]] vor. Die Anzeigen nennen das limitierende Edukt und zeigen für jedes Edukt n ÷ Koeffizient (seine Stoffmenge geteilt durch seinen Koeffizienten), den Rest und das Produkt in mol und g: die größte mögliche Menge, die theoretische Ausbeute. Der letzte Regler nimmt die Masse, die ein echtes Experiment gewonnen hat, und gibt die [[percent-yield]] an.'),
    tasks: [
      { id: 'exact', key: true, text: b('Run hydrogen burning with nothing left over. What ratio of molecules did you need?', 'Lass Wasserstoff so verbrennen, dass nichts übrig bleibt. Welches Verhältnis der Moleküle hast du gebraucht?') },
      { id: 'leftover', key: true, text: b('Now run it with one reactant left over. Which one stopped the reaction?', 'Lass sie jetzt so ablaufen, dass ein Edukt übrig bleibt. Welches hat die Reaktion gestoppt?') },
      { id: 'heavier', key: true, text: b('Find a mix where the reactant that runs out first is the one with the larger mass.', 'Finde eine Mischung, bei der das Edukt mit der größeren Masse zuerst aufgebraucht ist.') },
      { id: 'grams', text: b('Go to the grams rung, set both reactants in grams and run the reaction.', 'Geh auf die Gramm-Sprosse, stell beide Edukte in Gramm ein und starte die Reaktion.') },
      { id: 'yield', text: b('Enter an actual mass collected and read the percent yield.', 'Gib eine tatsächlich gewonnene Masse ein und lies die Ausbeute in Prozent ab.') },
      { id: 'haber', challenge: true, text: b('Make exactly 2 mol of ammonia with nothing left over.', 'Stell genau 2 mol Ammoniak her, ohne dass etwas übrig bleibt.') },
    ],
    notes: {
      exact: b('Nothing left over: the amounts were in the ratio of the coefficients. For 2 H₂ + O₂ that means twice as many H₂ as O₂, counted in molecules or in moles.',
        'Nichts übrig: Die Mengen standen im Verhältnis der Koeffizienten. Bei 2 H₂ + O₂ bedeutet das doppelt so viele H₂ wie O₂, gezählt in Molekülen oder in Mol.'),
      leftover: b('One reactant ran out and stopped the reaction: the limiting reactant. The other is in excess; its leftover molecules find no partner, and adding more of it makes no more product.',
        'Ein Edukt war aufgebraucht und hat die Reaktion gestoppt: das limitierende Edukt. Das andere liegt im Überschuss vor; seine übrigen Moleküle finden keinen Partner, und mehr davon ergibt nicht mehr Produkt.'),
      heavier: b('The heavier pile ran out first. Mass does not decide which reactant runs out; the count does. n ÷ coefficient says how many times each reactant could run the equation, and the smallest runs out first. In an exam, show both steps: n = m / M for each reactant, then n ÷ coefficient.',
        'Der schwerere Haufen war zuerst aufgebraucht. Nicht die Masse entscheidet, welches Edukt zuerst aufgebraucht ist, sondern die Anzahl. n ÷ Koeffizient sagt, wie oft jedes Edukt die Gleichung durchlaufen könnte; das kleinste Ergebnis ist zuerst aufgebraucht. In der Klausur zeigst du beide Schritte: n = m / M für jedes Edukt, dann n ÷ Koeffizient.'),
      grams: b('On the grams rung the ladder first turns each mass into moles, n = m / M, and only then compares. The coefficients count molecules, never grams.',
        'Auf der Gramm-Sprosse rechnet die Leiter jede Masse zuerst in die Stoffmenge um, n = m / M, und vergleicht erst dann. Die Koeffizienten zählen Moleküle, nie Gramm.'),
      yield: b('Percent yield = actual mass ÷ theoretical yield × 100 %. The theoretical yield is what the limiting reactant can make at most; a real experiment collects less.',
        'Ausbeute in Prozent (auch prozentuale Ausbeute) = tatsächliche Masse ÷ theoretische Ausbeute · 100 %. Die theoretische Ausbeute ist die größte Menge, die das limitierende Edukt ergeben kann; ein echtes Experiment gewinnt weniger.'),
      haber: b('1 mol of N₂ with 3 mol of H₂: the coefficients themselves, read in moles, give 2 mol of ammonia with nothing left over. A real ammonia plant gets only part of this in one pass (worked examples).',
        '1 mol N₂ mit 3 mol H₂: Die Koeffizienten selbst, in Mol gelesen, ergeben 2 mol Ammoniak, und nichts bleibt übrig. Eine echte Ammoniakanlage erreicht in einem Durchgang nur einen Teil davon (Beispiele).'),
    },
    check: {
      id: 'u15-check', unit: 15, kind: 'rank', format: 'rank', evidence: 'predict', concepts: ['u15.limiting', 'u15.compare'],
      prompt: b('2 H₂ + O₂ → 2 H₂O. Rank these mixes by the amount of water they can make, most first.', '2 H₂ + O₂ → 2 H₂O. Ordne die Mischungen nach der Stoffmenge Wasser, die sie ergeben können, die größte zuerst.'),
      order: [b('4 mol H₂ + 2 mol O₂', '4 mol H₂ + 2 mol O₂'), b('3 mol H₂ + 3 mol O₂', '3 mol H₂ + 3 mol O₂'), b('6 mol H₂ + 1 mol O₂', '6 mol H₂ + 1 mol O₂'), b('1 mol H₂ + 6 mol O₂', '1 mol H₂ + 6 mol O₂')],
      explain: b('4 + 2 react exactly: 4 mol of water. 3 + 3: hydrogen limits (3 ÷ 2 = 1.5 against 3 ÷ 1), 3 mol of water. 6 + 1: oxygen limits, 2 mol. 1 + 6: hydrogen limits, 1 mol. The last two have the most material in total and make the least water: what is left over makes nothing.',
        '4 + 2 reagieren genau: 4 mol Wasser. 3 + 3: Wasserstoff limitiert (3 ÷ 2 = 1,5 gegenüber 3 ÷ 1), 3 mol Wasser. 6 + 1: Sauerstoff limitiert, 2 mol. 1 + 6: Wasserstoff limitiert, 1 mol. Die letzten beiden enthalten insgesamt am meisten Stoff und ergeben am wenigsten Wasser: Was übrig bleibt, ergibt nichts.'),
    } as RankItem,
  },

  predictions: [
    {
      item: {
        id: 'u15-water', unit: 15, kind: 'choice', format: 'predict', withConfidence: true, evidence: 'predict',
        concepts: ['u15.compare', 'u15.theoretical'], targets: ['coefficients-mass-ratio'],
        prompt: b('2 H₂ + O₂ → 2 H₂O. You burn 10 g of hydrogen with 10 g of oxygen (H₂ 2.016, O₂ 32.00, H₂O 18.02 g/mol). How much water can form at most?',
          '2 H₂ + O₂ → 2 H₂O. Du verbrennst 10 g Wasserstoff mit 10 g Sauerstoff (H₂ 2,016, O₂ 32,00, H₂O 18,02 g/mol). Wie viel Wasser kann höchstens entstehen?'),
        options: [
          { text: b('About 20 g: all 10 g of each turns into water', 'Etwa 20 g: Je 10 g werden vollständig zu Wasser') },
          { text: b('About 89 g: hydrogen runs out first, the equation needs twice as much of it', 'Etwa 89 g: Der Wasserstoff ist zuerst aufgebraucht, die Gleichung braucht doppelt so viel davon'), mis: 'coefficients-mass-ratio' },
          { text: b('About 5.6 g: oxygen runs out first, and each O₂ makes one H₂O', 'Etwa 5,6 g: Der Sauerstoff ist zuerst aufgebraucht, und jedes O₂ ergibt ein H₂O') },
          { text: b('About 11.3 g: oxygen runs out first, and most of the hydrogen is left over', 'Etwa 11,3 g: Der Sauerstoff ist zuerst aufgebraucht, der meiste Wasserstoff bleibt übrig'), correct: true },
        ],
        explain: b('10 g of oxygen is only 0.313 mol; divided by its coefficient 1 that is far less than hydrogen\'s 4.96 mol ÷ 2. Oxygen limits, and each O₂ makes two H₂O: 0.625 mol of water, 11.26 g.',
          '10 g Sauerstoff sind nur 0,313 mol; geteilt durch den Koeffizienten 1 ist das viel weniger als 4,96 mol ÷ 2 beim Wasserstoff. Der Sauerstoff limitiert, und jedes O₂ ergibt zwei H₂O: 0,625 mol Wasser, 11,26 g.'),
      } as ChoiceItem,
      show: { engine: 'ladder', eq: 'h2o', amounts: [10 / molarMass('H2'), 10 / molarMass('O2')], react: true },
      revealText: b('Calculated: 10 g of hydrogen is 4.96 mol, but 10 g of oxygen is only 0.313 mol, and each O₂ needs just two H₂. So 0.313 mol of O₂ burns 0.625 mol of H₂ (1.26 g) and makes 0.625 mol of water, 11.26 g; 8.74 g of hydrogen is left over. The masses check out: 1.26 g + 10 g = 11.26 g. The picture keeps the ratio with a few molecules, not every one.',
        'Berechnet: 10 g Wasserstoff sind 4,96 mol, 10 g Sauerstoff aber nur 0,313 mol, und jedes O₂ braucht nur zwei H₂. Also verbrennen 0,313 mol O₂ mit 0,625 mol H₂ (1,26 g) zu 0,625 mol Wasser, 11,26 g; 8,74 g Wasserstoff bleiben übrig. Die Massen stimmen: 1,26 g + 10 g = 11,26 g. Das Bild hält das Verhältnis mit wenigen Molekülen ein, nicht mit jedem einzelnen.'),
      extra: {
        title: b('From grams to the limiting reactant, step by step', 'Von Gramm zum limitierenden Edukt, Schritt für Schritt'),
        steps: [
          b('Turn grams into moles, n = m / M: 10 g ÷ 2.016 g/mol = 4.96 mol of H₂; 10 g ÷ 32.00 g/mol = 0.313 mol of O₂.', 'Rechne Gramm in Mol um, n = m / M: 10 g ÷ 2,016 g/mol = 4,96 mol H₂; 10 g ÷ 32,00 g/mol = 0,313 mol O₂.'),
          b('Divide by the coefficients: hydrogen 4.96 ÷ 2 = 2.48, oxygen 0.313 ÷ 1 = 0.313. The smaller number runs out first: oxygen.', 'Teile durch die Koeffizienten: Wasserstoff 4,96 ÷ 2 = 2,48, Sauerstoff 0,313 ÷ 1 = 0,313. Die kleinere Zahl ist zuerst aufgebraucht: der Sauerstoff.'),
          b('Oxygen sets the product: one O₂ makes two H₂O, so 0.313 mol of O₂ makes 0.625 mol of water.', 'Der Sauerstoff legt das Produkt fest: Ein O₂ ergibt zwei H₂O, also ergeben 0,313 mol O₂ 0,625 mol Wasser.'),
          b('Back to grams: 0.625 mol × 18.02 g/mol = 11.26 g. Only 1.26 g of hydrogen reacts; 8.74 g is left over.', 'Zurück zu Gramm: 0,625 mol · 18,02 g/mol = 11,26 g. Nur 1,26 g Wasserstoff reagieren; 8,74 g bleiben übrig.'),
        ],
      },
    },
    {
      item: {
        id: 'u15-ammonia', unit: 15, kind: 'choice', format: 'predict', withConfidence: true, evidence: 'transfer',
        concepts: ['u15.compare', 'u15.limiting', 'u15.theoretical'], targets: ['ratio-ignored-limiting', 'less-mass-limiting'],
        prompt: b('Ammonia synthesis: N₂ + 3 H₂ → 2 NH₃. 28 g of nitrogen meets 3 g of hydrogen (N₂ 28.01, H₂ 2.016, NH₃ 17.03 g/mol). Which runs out first, and how much ammonia can form?',
          'Ammoniaksynthese: N₂ + 3 H₂ → 2 NH₃. 28 g Stickstoff treffen auf 3 g Wasserstoff (N₂ 28,01, H₂ 2,016, NH₃ 17,03 g/mol). Welches Edukt ist zuerst aufgebraucht, und wie viel Ammoniak kann entstehen?'),
        options: [
          { text: b('Nitrogen: 1.00 mol is less than 1.49 mol of hydrogen; 34 g of ammonia', 'Stickstoff: 1,00 mol sind weniger als 1,49 mol Wasserstoff; 34 g Ammoniak'), mis: 'ratio-ignored-limiting' },
          { text: b('Hydrogen: 3 g is far less than 28 g; all 31 g becomes ammonia', 'Wasserstoff: 3 g sind viel weniger als 28 g; alle 31 g werden zu Ammoniak'), mis: 'less-mass-limiting' },
          { text: b('Hydrogen: 1.49 mol ÷ 3 is less than 1.00 mol ÷ 1; 16.9 g of ammonia', 'Wasserstoff: 1,49 mol ÷ 3 ist weniger als 1,00 mol ÷ 1; 16,9 g Ammoniak'), correct: true },
          { text: b('Hydrogen: 1.49 mol of H₂ makes 1.49 mol of ammonia, 25.3 g', 'Wasserstoff: 1,49 mol H₂ ergeben 1,49 mol Ammoniak, 25,3 g') },
        ],
        explain: b('Each N₂ needs three H₂, so compare 1.00 ÷ 1 with 1.49 ÷ 3 = 0.496: hydrogen runs out first. Three H₂ make two NH₃: 0.992 mol of ammonia, 16.9 g, and 14.1 g of nitrogen is left over.',
          'Jedes N₂ braucht drei H₂, also vergleichst du 1,00 ÷ 1 mit 1,49 ÷ 3 = 0,496: Der Wasserstoff ist zuerst aufgebraucht. Drei H₂ ergeben zwei NH₃: 0,992 mol Ammoniak, 16,9 g, und 14,1 g Stickstoff bleiben übrig.'),
      } as ChoiceItem,
      show: { engine: 'ladder', eq: 'nh3', amounts: [28 / molarMass('N2'), 3 / molarMass('H2')], react: true },
      revealText: b('Calculated: 28 g of nitrogen is 1.00 mol and 3 g of hydrogen 1.49 mol, but each N₂ needs three H₂: 1.49 ÷ 3 = 0.496 is less than 1.00 ÷ 1, so hydrogen runs out first. It makes 0.992 mol of ammonia, 16.9 g, and 14.1 g of nitrogen is left over. Here the lighter reactant is limiting, but because of its number of molecules, not because of its mass.',
        'Berechnet: 28 g Stickstoff sind 1,00 mol, 3 g Wasserstoff 1,49 mol, aber jedes N₂ braucht drei H₂: 1,49 ÷ 3 = 0,496 ist weniger als 1,00 ÷ 1, also ist der Wasserstoff zuerst aufgebraucht. Er ergibt 0,992 mol Ammoniak, 16,9 g, und 14,1 g Stickstoff bleiben übrig. Hier limitiert das leichtere Edukt, aber wegen seiner Zahl an Molekülen, nicht wegen seiner Masse.'),
      extra: {
        title: b('Moles, then divide by the coefficients', 'Erst Mol, dann durch die Koeffizienten teilen'),
        steps: [
          b('Turn grams into moles: 28 g ÷ 28.01 g/mol = 1.00 mol of N₂; 3 g ÷ 2.016 g/mol = 1.49 mol of H₂.', 'Rechne Gramm in Mol um: 28 g ÷ 28,01 g/mol = 1,00 mol N₂; 3 g ÷ 2,016 g/mol = 1,49 mol H₂.'),
          b('Divide by the coefficients of N₂ + 3 H₂: nitrogen 1.00 ÷ 1 = 1.00, hydrogen 1.49 ÷ 3 = 0.496. Hydrogen has the smaller number: it runs out first.', 'Teile durch die Koeffizienten von N₂ + 3 H₂: Stickstoff 1,00 ÷ 1 = 1,00, Wasserstoff 1,49 ÷ 3 = 0,496. Der Wasserstoff hat die kleinere Zahl: Er ist zuerst aufgebraucht.'),
          b('Hydrogen sets the product: three H₂ make two NH₃, so 1.49 mol of H₂ makes 1.49 × 2 ÷ 3 = 0.992 mol of ammonia.', 'Der Wasserstoff legt das Produkt fest: Drei H₂ ergeben zwei NH₃, also ergeben 1,49 mol H₂ 1,49 · 2 ÷ 3 = 0,992 mol Ammoniak.'),
          b('Back to grams: 0.992 mol × 17.03 g/mol = 16.9 g. Only 13.9 g of nitrogen reacts; 14.1 g is left over.', 'Zurück zu Gramm: 0,992 mol · 17,03 g/mol = 16,9 g. Nur 13,9 g Stickstoff reagieren; 14,1 g bleiben übrig.'),
        ],
      },
    },
  ],

  examples: [
    {
      title: b('A sandwich recipe', 'Ein Sandwich-Rezept'), tag: 'H2 + O2', show: { engine: 'ladder', eq: 'h2o', amounts: [10, 3], react: true },
      numbers: [{ v: '11', label: b('sandwiches from 28 slices of bread and 11 slices of cheese', 'Sandwiches aus 28 Scheiben Brot und 11 Scheiben Käse') }, { v: '6', label: b('slices of bread left over: the bread is in excess', 'Scheiben Brot übrig: Das Brot liegt im Überschuss vor') }, { v: '4', label: b('H₂ left over from 10 H₂ and 3 O₂', 'H₂ übrig aus 10 H₂ und 3 O₂') }],
      body: b('A sandwich needs 2 slices of bread and 1 slice of cheese. With 28 slices of bread and 11 of cheese, the cheese runs out after 11 sandwiches and 6 slices of bread are left: cheese is the [[limiting-reactant]], bread is in [[excess]]. 2 H₂ + O₂ → 2 H₂O is the same kind of recipe, counted in molecules: 10 H₂ and 3 O₂ make 6 H₂O, and 4 H₂ are left over.',
        'Ein Sandwich braucht 2 Scheiben Brot und 1 Scheibe Käse. Mit 28 Scheiben Brot und 11 Scheiben Käse ist der Käse nach 11 Sandwiches aufgebraucht, und 6 Scheiben Brot bleiben übrig: Der Käse ist das [[limiting-reactant]], das Brot liegt im [[excess|Überschuss]] vor. 2 H₂ + O₂ → 2 H₂O ist dieselbe Art Rezept, gezählt in Molekülen: 10 H₂ und 3 O₂ ergeben 6 H₂O, und 4 H₂ bleiben übrig.'),
      soWhat: b('The recipe counts slices, not grams. An equation counts molecules the same way, and moles are how chemists count them by the heap.',
        'Das Rezept zählt Scheiben, nicht Gramm. Eine Reaktionsgleichung zählt Moleküle genauso, und in Mol zählt man sie haufenweise.'),
    },
    {
      title: b('Burning magnesium: the yield in a school lab', 'Magnesium verbrennt: die Ausbeute im Schullabor'), tag: 'MgO', show: { engine: 'ladder', eq: 'mgo', amounts: [2.39 / molarMass('Mg'), 0.1], react: true, actual: 3.78, rung: 'grams' },
      numbers: [{ v: '3.96 g', label: b('of magnesium oxide at most from 2.39 g of magnesium: the theoretical yield', 'Magnesiumoxid höchstens aus 2,39 g Magnesium: die theoretische Ausbeute') }, { v: '3.78 g', label: b('collected in the Royal Society of Chemistry\'s example', 'gewonnen im Beispiel der Royal Society of Chemistry') }, { v: '95.4 %', label: b('percent yield', 'Ausbeute in Prozent') }],
      body: b('Magnesium burns in air: 2 Mg + O₂ → 2 MgO. Air brings oxygen in excess (the ladder stands it in as 0.10 mol, more than enough), so magnesium is limiting: 2.39 g is 0.0983 mol and makes at most 0.0983 mol of oxide, 3.96 g. The example collects 3.78 g: 3.78 ÷ 3.963 × 100 % = 95.4 %.',
        'Magnesium verbrennt an der Luft: 2 Mg + O₂ → 2 MgO. Die Luft liefert Sauerstoff im Überschuss (die Leiter setzt dafür 0,10 mol ein, mehr als genug), also limitiert das Magnesium: 2,39 g sind 0,0983 mol und ergeben höchstens 0,0983 mol Oxid, 3,96 g. Im Beispiel werden 3,78 g gewonnen: 3,78 ÷ 3,963 · 100 % = 95,4 %.'),
      soWhat: b('Why not 100 %: some white oxide escapes when the lid is lifted, and some magnesium may not burn at all (the RSC lists both). Every real preparation loses a little in such ways.',
        'Warum nicht 100 %: Etwas weißes Oxid entweicht, wenn man den Deckel anhebt, und manches Magnesium verbrennt gar nicht (die RSC nennt beides). Jede echte Herstellung verliert auf solchen Wegen ein wenig.'),
    },
    {
      title: b('Where the model breaks: ammonia stops early', 'Wo das Modell bricht: Ammoniak bleibt auf halbem Weg stehen'), tag: 'NH3', show: { engine: 'ladder', eq: 'nh3', amounts: [1, 3], react: true, actual: 0.15 * 2 * molarMass('NH3') },
      numbers: [{ v: '15 %', label: b('of the nitrogen and hydrogen turned into ammonia in one pass through the reactor', 'des Stickstoffs und Wasserstoffs werden in einem Durchgang durch den Reaktor zu Ammoniak') }, { v: '98 %', label: b('overall, once the unreacted gas is sent round again', 'insgesamt, wenn das nicht umgesetzte Gas erneut durchläuft') }, { v: '1 : 3', label: b('nitrogen to hydrogen fed in: exactly the equation\'s ratio', 'Stickstoff zu Wasserstoff im Zulauf: genau das Verhältnis der Gleichung') }],
      body: b('Some reactions stop before the limiting reactant is used up. Ammonia forms in a reaction that also runs backwards (N₂ + 3 H₂ ⇌ 2 NH₃; the double arrow means both directions), so in one pass through the reactor only about 15 % of the gas turns into ammonia before the forward and back reactions balance out (equilibrium, unit 24). The ladder runs the equation to the end; against its 34.1 g, one pass gives about 5.1 g, a yield of 15 %.',
        'Manche Reaktionen bleiben stehen, bevor das limitierende Edukt aufgebraucht ist. Ammoniak entsteht in einer Reaktion, die auch rückwärts abläuft (N₂ + 3 H₂ ⇌ 2 NH₃; der Doppelpfeil bedeutet: in beide Richtungen), deshalb werden in einem Durchgang durch den Reaktor nur etwa 15 % des Gases zu Ammoniak, bevor Hin- und Rückreaktion sich die Waage halten (Gleichgewicht, Einheit 24). Die Leiter lässt die Gleichung bis zum Ende laufen; gegenüber ihren 34,1 g liefert ein Durchgang etwa 5,1 g, eine Ausbeute von 15 %.'),
      soWhat: b('The plant cools the gas until the ammonia turns liquid and sends the unreacted nitrogen and hydrogen round again: about 98 % overall. So a yield below 100 % is not only spillage, and a yield above 100 % means a wet or impure product, never extra atoms.',
        'Die Anlage kühlt das Gas, bis das Ammoniak flüssig wird, und schickt den nicht umgesetzten Stickstoff und Wasserstoff erneut durch: insgesamt etwa 98 %. Eine Ausbeute unter 100 % ist also nicht nur verschüttetes Produkt, und eine Ausbeute über 100 % bedeutet ein feuchtes oder verunreinigtes Produkt, nie zusätzliche Atome.'),
    },
  ],

  flaw: {
    id: 'u15-flaw', unit: 15, kind: 'flaw', format: 'flaw', evidence: 'transfer', concepts: ['u15.compare', 'u15.limiting'], targets: ['ratio-ignored-limiting'],
    prompt: b('Where does this reasoning first go wrong?', 'Wo geht diese Überlegung zum ersten Mal schief?'),
    lines: [
      b('Methane burns: CH₄ + 2 O₂ → CO₂ + 2 H₂O. 16 g of methane is 1.00 mol; 48 g of oxygen is 1.50 mol.', 'Methan verbrennt: CH₄ + 2 O₂ → CO₂ + 2 H₂O. 16 g Methan sind 1,00 mol, 48 g Sauerstoff 1,50 mol.'),
      b('There are fewer moles of methane than of oxygen, so methane runs out first.', 'Vom Methan sind weniger Mol da als vom Sauerstoff, also ist das Methan zuerst aufgebraucht.'),
      b('One CH₄ molecule can make one CO₂ molecule.', 'Ein CH₄-Molekül kann ein CO₂-Molekül ergeben.'),
      b('So the flame makes 1.00 mol of CO₂, 44 g.', 'Also entstehen 1,00 mol CO₂, 44 g.'),
      b('Oxygen is in excess, so some of the 48 g of oxygen is left over.', 'Der Sauerstoff liegt im Überschuss vor, also bleibt ein Teil der 48 g Sauerstoff übrig.'),
    ],
    flaw: 1,
    alsoFalse: [3, 4],
    near: [{ step: 2, note: b('Step 3 holds: one CH₄ does give one CO₂, as long as there is oxygen for it. The slip comes earlier.', 'Schritt 3 stimmt: Ein CH₄ ergibt durchaus ein CO₂, solange Sauerstoff dafür da ist. Der Fehler liegt früher.') }],
    explain: b('Step 2 is the slip: it compares moles without the coefficients. Each CH₄ needs two O₂, so methane gives 1.00 ÷ 1 = 1.00 and oxygen 1.50 ÷ 2 = 0.75: oxygen runs out first. Step 1 is right, and step 3 is true on its own. Steps 4 and 5 follow from the slip: the flame makes 0.75 mol of CO₂, 33.0 g, and 0.25 mol of methane (4.0 g) is left over, not oxygen.',
      'Schritt 2 ist der Fehler: Er vergleicht Stoffmengen ohne die Koeffizienten. Jedes CH₄ braucht zwei O₂, also ergibt Methan 1,00 ÷ 1 = 1,00 und Sauerstoff 1,50 ÷ 2 = 0,75: Der Sauerstoff ist zuerst aufgebraucht. Schritt 1 stimmt, und Schritt 3 stimmt für sich genommen. Die Schritte 4 und 5 folgen aus dem Fehler: Es entstehen 0,75 mol CO₂, 33,0 g, und 0,25 mol Methan (4,0 g) bleiben übrig, nicht Sauerstoff.'),
  } as FlawItem,

  deeper: {
    id: 'u15-deeper', unit: 15, kind: 'estimate', format: 'estimate', evidence: 'transfer', concepts: ['u15.compare', 'u15.theoretical'], targets: ['less-mass-limiting'],
    prompt: b('Blast furnace: Fe₂O₃ + 3 CO → 2 Fe + 3 CO₂. 1000 kg of iron ore (as Fe₂O₃) meets 600 kg of carbon monoxide. Molar masses: Fe₂O₃ 159.69, CO 28.01, Fe 55.85 g/mol. At most how many kilograms of iron can form?',
      'Hochofen: Fe₂O₃ + 3 CO → 2 Fe + 3 CO₂. 1000 kg Eisenerz (als Fe₂O₃) treffen auf 600 kg Kohlenstoffmonoxid. Molare Massen: Fe₂O₃ 159,69, CO 28,01, Fe 55,85 g/mol. Wie viele Kilogramm Eisen können höchstens entstehen?'),
    min: 0, max: 1200, step: 10, answer: 700, tolerance: 10, suffix: ' kg',
    near: [
      { value: 800, tol: 10, note: b('About 800 kg is what the carbon monoxide could make. It is the lighter reactant, but not the limiting one: it would last for 7.14 kmol of ore, and there are only 6.26 kmol.', 'Etwa 800 kg könnte das Kohlenstoffmonoxid ergeben. Es ist das leichtere Edukt, aber nicht das limitierende: Es reicht für 7,14 kmol Erz, und es sind nur 6,26 kmol da.') },
      { value: 350, tol: 10, note: b('About 350 kg counts one iron atom per Fe₂O₃. Each formula unit holds two, and the equation makes 2 Fe.', 'Etwa 350 kg zählt ein Eisenatom pro Fe₂O₃. Jede Formeleinheit enthält zwei, und die Gleichung ergibt 2 Fe.') },
    ],
    explain: b('In kmol (1 kmol = 1000 mol, so kg/kmol = g/mol): ore 1000 ÷ 159.69 = 6.262 kmol, CO 600 ÷ 28.01 = 21.42 kmol. Divided by the coefficients: ore 6.262, CO 21.42 ÷ 3 = 7.14, so the ore runs out first. Iron = 2 × 6.262 kmol × 55.85 kg/kmol ≈ 699 kg; 73.8 kg of CO is left over.',
      'In kmol (1 kmol = 1000 mol, also kg/kmol = g/mol): Erz 1000 ÷ 159,69 = 6,262 kmol, CO 600 ÷ 28,01 = 21,42 kmol. Geteilt durch die Koeffizienten: Erz 6,262, CO 21,42 ÷ 3 = 7,14, also ist das Erz zuerst aufgebraucht. Eisen = 2 · 6,262 kmol · 55,85 kg/kmol ≈ 699 kg; 73,8 kg CO bleiben übrig.'),
  } as EstimateItem,

  explain: {
    prompt: b('In your own words: when two substances react, how do you find out which one runs out first, how much product you can get, and why you usually get less?',
      'In eigenen Worten: Wie findest du heraus, welches von zwei Edukten zuerst aufgebraucht ist, wie viel Produkt du bekommen kannst und warum du meist weniger bekommst?'),
    ideas: [
      { id: 'ratio', concept: 'u15.ratio', idea: b('The balanced equation fixes the ratio in which the reactants are used up, counted in particles or moles', 'Die ausgeglichene Reaktionsgleichung legt das Verhältnis fest, in dem die Edukte verbraucht werden, gezählt in Teilchen oder Mol'), contra: COEFF_MASS,
        en: /((mole|molar|mol|stoichiometric|particle|reacting|fixed|set|certain|same|right|exact) (ratio|proportions?)|(equation|coefficients?|recipe|balanced)\b.{0,60}\b(ratio|proportions?|how many|for every|for each)\b|(ratio|proportions?)\b.{0,50}\b(equation|coefficients?|recipe)|(react|used up|consumed|combine|use)\w*\b.{0,30}\bin (a |the )?(fixed |set |certain |definite )?(ratio|proportion)|(two|three|five|2|3|5) (h[2₂]|o[2₂]|hydrogens?|oxygens?|molecules|mol\b|moles)( molecules)? (for every|for each|per|to (one|1|each|every)))/,
        de: /((stoffmengen|teilchen|mol|stöchiometrisch\w*|fest\w*|bestimmt\w*|gleich\w*|richtig\w*) ?-?verhältnis|(reaktionsgleichung|gleichung|koeff\w*|rezept|stöchiometrische\w* faktor\w*)\b.{0,60}(verhältnis|wie viele|auf (ein|jedes|je)\b|pro\b)|verhältnis\w*\b.{0,50}(gleichung|koeffizient)|(reagier|verbrauch|umgesetzt|umsetz|verbind)\w*\b.{0,30}im (festen |bestimmten |gleichen |richtigen )?verhältnis|(zwei|drei|fünf|2|3|5) (h[2₂]|o[2₂]|wasserstoff\w*|sauerstoff\w*|moleküle|mol)\b.{0,15}(auf (ein|jedes|je)|pro|für (ein|jedes)))/ },
      { id: 'limiting', concept: 'u15.limiting', idea: b('The reactant that runs out first is limiting: it decides how much product forms, and the other is left over', 'Das Edukt, das zuerst aufgebraucht ist, ist limitierend: Es bestimmt, wie viel Produkt entsteht, und das andere bleibt übrig'), contra: LESS_MASS,
        en: /(((runs?|ran|running) out|(is|are|gets?|got) (used up|all used|consumed|finished|gone)|used up|consumed)( first)?\b.{0,80}\b(limit\w*|decides?|determines?|sets?|controls?|caps?|restricts?|how much|amount of product|the product|stops?)|limit\w* (reactant|reagent|reactants|reagents|substance|one|chemical|ingredient|factor)\b.{0,80}\b(runs? out|used up|first|decides?|determines?|sets?|controls?|restricts?|how much|product|stops?)|(runs? out|is used up) first\b.{0,40}\b(decides?|determines?|sets?|stops?)|(the other|the second|the rest)( one| reactant| reagent| substance)?\b.{0,30}\b(left over|leftover|in excess|remains|stays|is left)|(reaction|it) stops (when|once|as soon as)\b.{0,40}\b(runs? out|used up|gone|finished))/,
        de: /((aufgebraucht|verbraucht|zu ende|leer)\b.{0,80}(limitier\w*|bestimm\w*|entscheid\w*|begrenz\w*|wie viel|produktmenge|das produkt|stopp\w*|hört .{0,10}auf)|limitier\w* (edukt|stoff|reaktant|reaktionspartner|ausgangsstoff)\w*\b.{0,80}(aufgebraucht|verbraucht|zuerst|bestimm\w*|entscheid\w*|begrenz\w*|wie viel|produkt)|unterschuss\b.{0,80}(bestimm\w*|entscheid\w*|begrenz\w*|wie viel|produkt|aufgebraucht|verbraucht|zuerst)|(das|der|die) (andere|zweite|übrige)\w*( edukt| stoff| reaktionspartner)?\b.{0,30}(übrig|im überschuss|bleibt)|(reaktion|sie) (hört|stoppt|endet)\w*\b.{0,40}(aufgebraucht|verbraucht|zu ende))/ },
      { id: 'compare', concept: 'u15.compare', idea: b('To find it, turn the masses into moles and divide each by its coefficient; the smallest result runs out first, whatever the masses', 'Man findet es, indem man die Massen in Stoffmengen umrechnet und jede durch ihren Koeffizienten teilt; der kleinste Wert ist zuerst aufgebraucht, egal wie groß die Massen sind'), contra: LESS_MASS,
        en: COMPARE_EN, de: COMPARE_DE },
      { id: 'theoretical', concept: 'u15.theoretical', idea: b('The theoretical yield is the most product the limiting reactant can make', 'Die theoretische Ausbeute ist die größte Produktmenge, die das limitierende Edukt ergeben kann'),
        en: /((limit\w*|smallest|runs? out first)\b.{0,60}\b(sets?|determines?|decides?|gives?|fixes|limits)\b.{0,15}\b(the )?(theoretical|maximum|max\w*) (yield|amount|mass|product)|theoretical (yield|amount|mass|maximum)\b.{0,80}\b(most|max\w*|limit\w*|calculat\w*|work\w* out|equation|could|can|possible|expected|in theory|from the|if everything|if all)|(most|max\w*|largest|greatest|biggest|highest) (possible )?(amount of |mass of |quantity of )?(product|water|ammonia|you can (get|make)|that can form)\b.{0,60}\b(limit\w*|can (make|form|give|produce)|could (make|form|give|produce)|possible|runs? out)|limit\w* (reactant|reagent|one)\b.{0,60}\b(makes?|gives?|forms?|produces?|can make)\b.{0,30}\b(at most|maximum|the most|theoretical|in theory)|(calculat\w*|work\w* out|comput\w*|predict\w*|find\w*)\b.{0,40}\b(product|yield|how much)\b.{0,40}\b(from|using|with|based on|by) (the )?(limit\w*|moles of the limit\w*|reactant that runs out|one that runs out))/,
        de: /((limitier\w*|\blim\b|unterschuss|kleinste\w*)\b.{0,60}(bestimm\w*|legt|gibt|ergibt|begrenz\w*)\b.{0,20}(die )?(theor\w*|maximal\w*) (ausbeute|menge|produktmenge|masse)|theor\w* (ausbeute|menge|masse|produktmenge|maximum)\b.{0,80}(höchst\w*|maxim\w*|größt\w*|meist\w*|limitier\w*|berechn\w*|gleichung|könnte|kann|möglich|erwart\w*|unterschuss|wenn alles)|(höchst\w*|maxim\w*|größtmöglich\w*|größte\w*|meiste\w*) (mögliche\w* )?(produktmenge|menge|masse|produkt)\b.{0,60}(limitier\w*|unterschuss|möglich|entstehen kann|entstehen könnte|bilden kann|ergeben kann|liefern kann|aufgebraucht)|(limitier\w* (edukt|stoff)|unterschuss)\w*\b.{0,60}(maxim\w*|höchstens|theor\w*|größt\w*|höchst\w*)|(berechn\w*|ausrechn\w*|ermittel\w*)\b.{0,40}(aus|mit|über|vom|von dem) (dem |der )?(limitier\w*|unterschuss|edukt im unterschuss|stoffmenge des limitier\w*))/ },
      { id: 'percent', concept: 'u15.percent', idea: b('Percent yield = actual ÷ theoretical × 100 %; real yields stay below 100 % because product is lost or the reaction stops early', 'Ausbeute in Prozent = tatsächliche ÷ theoretische Ausbeute · 100 %; echte Ausbeuten bleiben unter 100 %, weil Produkt verloren geht oder die Reaktion vorher stehen bleibt'),
        en: /((actual|real|measured|collected|obtained|isolated|what you (get|got|collect\w*))( yield| mass| amount)?\b.{0,30}(÷|\/|divided by|over|out of|compared (to|with)|as a percent\w* of|as a fraction of|share of|fraction of)\s?.{0,15}\b(theoretical|maximum|expected|possible|calculated|predicted)|(percent(age)?|%) yield\b.{0,60}\b(actual|real|measured|theoretical|below|under|less than|100)|(below|under|less than|lower than|short of|never reach\w*|never get\w*|rarely reach\w*) (100 ?%|100 percent|a hundred percent|the theoretical|the maximum|the calculated|what the equation)|(yields?|it|they|you)\b.{0,30}\b(below|under|less than|lower than) (100|the theoretical|the maximum)|(lost|loss\w*|spill\w*|side reactions?|stick\w*|escap\w*|equilibrium|stops? (early|before|part))\b.{0,60}\b(yield|less product|lower|below|than (the )?(theoretical|maximum|calculated))|(get|gets|collect\w*|obtain\w*|make|makes|end up with)\b.{0,10}\bless\b.{0,60}\b(lost|loss|spill\w*|stick\w*|escap\w*|side reactions?|stops?|equilibrium|than (the )?(theoretical|equation|calculated|maximum|predicted|expected))|(less|lower|smaller)\b.{0,30}\bthan (the )?(theoretical|calculated|maximum|equation|predicted|expected))/,
        de: /((tatsächlich\w*|wirklich\w*|gemessen\w*|erhalten\w*|isoliert\w*|gewonnen\w*|echte\w*|gewogen\w*)( ausbeute| masse| menge)?\b.{0,30}(÷|\/|geteilt durch|durch|im verhältnis zu|von der|vom|bezogen auf|gegenüber)\s?.{0,15}(theor\w*|maximal\w*|berechnet\w*|möglich\w*|erwartet\w*)|(prozentual\w*|prozent\w*) ausbeute\b.{0,60}(tatsächlich|theoretisch|unter|weniger|100)|ausbeute in (prozent|%).{0,60}(tatsächlich|theoretisch|unter|weniger|100)|(unter|unterhalb|weniger als|kleiner als|niedriger als|nie|selten) (100 ?%|100 prozent|hundert prozent|der theoretischen|die theoretische|dem berechneten)|(ausbeute\w*|sie|man)\b.{0,30}(unter|unterhalb|weniger als|kleiner als|niedriger als) (100|der theoretischen|dem maximum)|(verlust\w*|verlor\w*|verloren|nebenreaktion\w*|haften|hängen|entweich\w*|gleichgewicht\w*|unvollständig\w*)\b.{0,60}(ausbeute|weniger produkt|unter 100|geringer|niedriger|weniger als)|nie die theoretische|nie den theoretischen|nie 100|(bekommt|bekommst|erhält|erhältst|gewinnt|kriegt|kriegst)\w* (man |du )?(meist |immer |oft )?weniger\b.{0,60}(verlor\w*|verlust\w*|haft\w*|hängen|entweich\w*|nebenreaktion\w*|gleichgewicht\w*|als (die |der |es )?(theor\w*|berechnet\w*|gleichung|erwartet\w*))|weniger als (die |der |es )?(berechnet\w*|theor\w*|erwartet\w*|gleichung))/ },
    ] as Idea[],
    tightened: b('The balanced equation fixes the ratio in which the reactants are used up, counted in particles or moles. The reactant that runs out first is the limiting reactant: it decides how much product forms, and the other reactant is left over in excess. To find it, turn each mass into moles (n = m / M) and divide by the coefficient; the smallest result runs out first, which need not be the reactant with the smallest mass. The theoretical yield is the most product the limiting reactant can make; the percent yield is actual yield ÷ theoretical yield × 100 %, and real yields stay below 100 % because some product is lost or the reaction stops early.',
      'Die ausgeglichene Reaktionsgleichung legt das Stoffmengenverhältnis fest, in dem die Edukte verbraucht werden, gezählt in Teilchen oder Mol. Das Edukt, das zuerst aufgebraucht ist, ist das limitierende Edukt (es liegt im Unterschuss vor): Es bestimmt, wie viel Produkt entsteht, und das andere Edukt bleibt im Überschuss übrig. Um es zu finden, rechnest du jede Masse in die Stoffmenge um (n = m / M) und teilst durch den Koeffizienten; der kleinste Wert ist zuerst aufgebraucht, und das muss nicht das Edukt mit der kleinsten Masse sein. Die theoretische Ausbeute ist die größte Produktmenge, die das limitierende Edukt ergeben kann; die Ausbeute in Prozent ist tatsächliche Ausbeute ÷ theoretische Ausbeute · 100 %, und echte Ausbeuten bleiben unter 100 %, weil Produkt verloren geht oder die Reaktion vorher stehen bleibt.'),
  },

  terms: ['limiting-reactant', 'excess', 'percent-yield', 'reactant', 'coefficient', 'mole'],

  readings: [
    {
      lang: 'en', kind: 'quick',
      title: b('Limiting Reactant and Theoretical Yield', 'Limiting Reactant and Theoretical Yield'), source: 'Chemistry LibreTexts (UBC Introductory Chemistry, 3.6)',
      url: 'https://chem.libretexts.org/Courses/University_of_British_Columbia/UBC_Introductory_Chemistry/03%3A_Reactions_and_Stoichiometry/3.06%3A_Limiting_Reactant_and_Theoretical_Yield',
      lookFor: [
        b('Its brownie recipe: 1 box of mix and 2 eggs per batch. With 2 boxes and 12 eggs, which is limiting? Compare it with the sandwiches in this unit.', ''),
        b('Example 2, magnesium with oxygen: 2.40 g of magnesium makes 3.98 g of oxide, and 8.42 g of oxygen is left over. Is the lighter or the heavier reactant limiting there?', ''),
        b('Its two ways to find the limiting reactant: comparing moles with the coefficients, and comparing how much product each reactant could make. Do both match the n ÷ coefficient readout on the ladder?', ''),
      ],
    },
    {
      lang: 'en', kind: 'deeper',
      title: b('Reaction Yields', 'Reaction Yields'), source: 'OpenStax Chemistry 2e, section 4.4',
      url: 'https://openstax.org/books/chemistry-2e/pages/4-4-reaction-yields',
      lookFor: [
        b('Figure 4.13, the sandwiches: 28 slices of bread and 11 of cheese. Which ingredient is in excess, and how much of it is left?', ''),
        b('The Check Your Learning after Example 4.12: 5.00 g of H₂ with 10.0 g of O₂. Which runs out first? Compare it with the 10 g + 10 g prediction.', ''),
        b('Example 4.13, copper from copper sulfate: 0.392 g collected against 0.5072 g possible, a percent yield of 77.3 %. Check the division yourself, then find its reasons why actual yields fall short.', ''),
      ],
    },
    {
      lang: 'de', kind: 'deeper',
      title: b('Stöchiometrie: Ein Leitprogramm für die Chemie', 'Stöchiometrie: Ein Leitprogramm für die Chemie'), source: 'ETH Zürich, EducETH (U. Wuthier)',
      url: 'https://ethz.ch/content/dam/ethz/special-interest/dual/educeth-dam/documents/Unterrichtsmaterialien/chemie/stoechiometrie-leitprogramm/LP_Stochiometrie_2008.pdf',
      lookFor: [
        b('', 'Das Kapitel „Kupfer reagiert mit Schwefel“: Warum wird Schwefel im Überschuss eingesetzt, und was geschieht mit dem Rest? Vergleiche mit dem Edukt, das auf der Zoom-Leiter übrig bleibt.'),
        b('', 'Das Ausbeute-Beispiel: 6,4 g statt 8,0 g. Rechne die 80 % mit der Formel aus dieser Einheit nach.'),
        b('', 'Das Ammoniak-Beispiel in „Von der Reaktionsgleichung zur Massenbilanz“: 10,00 g Wasserstoff mit „hinreichend viel“ Stickstoff. Welches Edukt ist dort limitierend, welches liegt im Überschuss vor?'),
      ],
    },
  ],

  misconceptions: [
    { id: 'less-mass-limiting', name: b('The reactant with the smaller mass runs out first', 'Das Edukt mit der kleineren Masse ist zuerst verbraucht') },
    { id: 'ratio-ignored-limiting', name: b('Comparing moles without the coefficients', 'Stoffmengen ohne Koeffizienten verglichen') },
  ],

  glossary: {
    'limiting-reactant': {
      en: 'limiting reactant', de: 'limitierendes Edukt', unit: 15,
      def: { en: 'The reactant that runs out first in a reaction. It decides how much product can form; the other reactants are left over.', de: 'Das Edukt, das bei einer Reaktion zuerst aufgebraucht ist. Es bestimmt, wie viel Produkt entstehen kann; die anderen Edukte bleiben übrig.' },
      falseFriend: { en: 'Also "limiting reagent". German books say "limitierendes Edukt" or "Edukt im Unterschuss".', de: 'Auch „Edukt im Unterschuss“; englisch „limiting reactant“ oder „limiting reagent“.' },
    },
    excess: {
      en: 'excess', de: 'Überschuss', unit: 15,
      def: { en: 'A reactant is in excess when there is more of it than the limiting reactant can use up; the rest is left over.', de: 'Ein Edukt liegt im Überschuss vor, wenn mehr davon da ist, als mit dem limitierenden Edukt reagieren kann; der Rest bleibt übrig.' },
    },
    'percent-yield': {
      en: 'percent yield', de: 'Ausbeute in Prozent', unit: 15,
      def: { en: 'Actual yield ÷ theoretical yield × 100 %. The theoretical yield is the most product the limiting reactant can make.', de: 'Tatsächliche Ausbeute ÷ theoretische Ausbeute · 100 %. Die theoretische Ausbeute ist die größte Produktmenge, die das limitierende Edukt ergeben kann.' },
      falseFriend: { en: 'Also "percentage yield". German also says "prozentuale Ausbeute", and "Ausbeute" alone often means the percentage.', de: 'Auch „prozentuale Ausbeute“; englisch „percent yield“ oder „percentage yield“.' },
    },
  },
};
