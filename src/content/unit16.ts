// Unit 16 — Concentration, on the Lab Bench (balance, volumetric flask, beaker, bulb pipette).
// Numbers: every molar mass, amount and concentration is computed with src/content/stoich.ts (atomic masses from
// elements.ts): NaCl 58.44, glucose C₆H₁₂O₆ 180.16, CuSO₄·5H₂O 249.68 (CuSO₄ 159.60; the water is 36 % of the crystal
// mass), KMnO₄ 158.03, NaOH 40.00, KCl 74.55, CaCl₂ 110.98, sucrose 342.30 g/mol.
// Saline 9 g/L: 0.154 mol/L NaCl, 308 mmol/L ions. Glucose 50 g/L: 0.278 mol/L. 250 mL of 0.100 mol/L CuSO₄·5H₂O:
// 0.0250 mol, 6.24 g. 100 mL of 0.0500 mol/L: 1.25 g (1 L: 12.5 g; with CuSO₄'s 159.60 g/mol: 0.80 g, which gives
// 0.0320 mol/L). 25 mL of 0.40 mol/L made up to 100 mL: 0.10 mol/L; 50 mL of it holds 0.0050 mol. KMnO₄: 1.58 g in
// 100 mL is 0.100 mol/L; 0.0158 g would be needed for 100 mL at 0.00100 mol/L. Third drip (1.8 g NaCl + 40 g glucose
// per litre): 61.6 + 222.0 = 283.6 mmol/L of particles.
// Sources (all fetched):
// - Sodium Chloride 0.9 % w/v Intravenous Infusion BP, SmPC (medicines.org.uk/emc/product/15147): 9.00 g NaCl per
//   1000 mL; Na⁺ 154, Cl⁻ 154 mmol/L; theoretical osmolarity 308 mOsm/L; "same osmolarity as plasma".
// - Glucose 5 % intravenous infusion, SmPC (medicines.org.uk/emc/product/1825): 50.0 g/L glucose, about 278 mOsm/L
//   (= 50 g/L counted as C₆H₁₂O₆, 50 ÷ 180.16), "isosmotic"; "may become extremely hypotonic after administration
//   due to glucose metabolization".
// - Blood (serum) osmolality 275–295 mOsm/kg: MedlinePlus, "Osmolality blood test" (medlineplus.gov/ency/article/003463.htm).
// - Plasma sodium 135–145 mmol/L: DocCheck Flexikon, "Isotone Kochsalzlösung".
// - Measured osmolality of 0.9 % NaCl 281 mOsmol/kg against 308 theoretical: KNAUER application note VPH0064.
// - Glucose 4 % / NaCl 0.18 % infusion: 284 mOsmol/L (Medsafe data sheet, Glucose in Sodium Chloride infusion); the UK
//   SmPC of the same mixture calls it "hypotonic and hyperosmolar, due to the glucose content" (medicines.org.uk/emc/product/1867).
// - WHO/UNICEF reduced-osmolarity ORS: NaCl 2.6, glucose (anhydrous) 13.5, KCl 1.5, trisodium citrate dihydrate 2.9 g/L;
//   glucose 75 mmol/L; total 245 mOsm/L, replacing 311; unscheduled IV therapy reduced by 33 % (rehydrate.org).
// - Red blood cells swell in hypotonic and shrink in hypertonic solutions: OpenStax Biology 2e, 5.2.
// - Balance reading to 0.01 g: an error of up to 0.005 g on 0.0158 g is 32 %, "about a third".
// - 50 mL ethanol + 50 mL water ≈ 96 mL: pta-in-love.de (Volumenkontraktion); about 97 mL with 95 % ethanol: JMU
//   chemistry demos. Dissolving 1 mol NaCl and filling to 1 L: without the flask the volume is "slightly greater than
//   one liter" (LibreTexts, Introductory Chemistry (CK-12) 16.9).
// - Volumetric flasks are calibrated at 20 °C (Klett worksheet "Messkolben"). Water density 0.9982071 g/mL at 20 °C,
//   0.9956502 at 30 °C (OpenStax Chemistry 2e, appendix E): 0.26 % expansion. Molality does not vary with temperature,
//   molar concentration does (OpenStax Chemistry 2e, 11.4).
import type { Bi } from '../i18n';
import type { ChoiceItem, RankItem, FlawItem, EstimateItem } from './items';
import type { Idea } from './unit06';
import type { UnitContent } from './unitTypes';

const b = (en: string, de: string): Bi => ({ en, de });
const together = (a: RegExp, c: RegExp, gap = 60) => `(${a.source}.{0,${gap}}${c.source}|${c.source}.{0,${gap}}${a.source})`;

// ---------- explain-back patterns ----------
// Idea 1, c = n / V: the formula, or a concentration word together with "moles per litre (of solution)".
const CONC_EN = /(concentration|molarity|\bc\b)/;
const PERL_EN = /(\bmol\w*|amount( of substance)?|\bn\b)\b.{0,40}(\bper\b|\/|÷|divided by|in (each|every|one|a|1)) ?(litre|liter|\bl\b|dm3|dm³|(the )?volume|(the )?solution|\bv\b)/;
const CONC_DE = /(konz\w*|molarität|\bc\b)/;
// Moles per litre of water (instead of solution) rules idea 1 out.
const PER_WATER = {
  en: /^(?!.*(\bnot\b|n't|\bno\b|\bnever\b|rather than|instead of)).*(concentration|molarity|\bc\b|\bmol\w*).{0,40}(\bper\b|\/) ?(litre|liter|\bl\b|dm3|volume|millilitre|ml) (of )?(the )?(added )?(water|solvent)\b/,
  de: /^(?!.*(nicht|kein|\bnie\b|statt|anstatt)).*(konz\w*|molarität|\bc\b|\bmol\w*|stoffmenge).{0,40}(\bpro\b|\bje\b|\/) ?(liter|\bl\b|volumen|milliliter|ml) (des |vom )?(zugegebenen )?(wassers?|lösungsmittels?|wasser)\b/,
};
const PERL_DE = /(\bmol\w*|stoffmenge\w*|\bn\b)\b.{0,40}(\bpro\b|\bje\b|\/|÷|geteilt durch|\bdurch\b|in (einem|jedem|einen|1)) ?(liter|\bl\b|dm3|dm³|(das )?volumen|(der )?lösung|\bv\b)/;

// Idea 2, V is the volume of the solution: fill to the mark, or "volume of the (whole) solution".
const FILL_EN = /(fill\w*|top\w* (it )?up|make\w* (it )?up|made up|add\w* (more )?water|bring\w* (it )?up)\b.{0,40}(\bmark\b|\bline\b|\bring\b|graduation|calibration (mark|line)|etched)/;
const VSOL_EN = /((the )?volume|\bv\b)\b.{0,30}\b(whole|total|entire|finished|final|complete) solution|(volume|\bv\b) (is |means |=)?(of )?(the )?solution\b|solution('s)? volume/;
const FILL_DE = /(auffüll\w*|aufgefüllt|füll\w*|wasser (zu|dazu|hinzu)\w*)\b.{0,40}(marke|eichmarke|ringmarke|eichstrich|ringstrich|\bstrich\b)/;
const VSOL_DE = /(volumen|\bv\b)\b.{0,30}\b(gesamte\w*|ganze\w*|fertige\w*|komplette\w*) lösung|(volumen|\bv\b) (ist |bedeutet |=)?(das )?(volumen )?der lösung|lösungsvolumen|(gesamt|end)volumen/;
// The main misconception of idea 2: V is the volume of the water added.
const VOLUME_WATER = {
  en: /^(?!.*(\bnot\b|n't|\bno\b|\bnever\b|rather than|instead of)).*((volume|\bv\b) (is|means|=|stands for) (the )?(volume of (the )?)?(added )?(water|solvent)\b|volume of (the )?water (added|you add))/,
  de: /^(?!.*(nicht|kein|\bnie\b|statt|anstatt)).*((volumen|\bv\b) (ist|bedeutet|=|steht für) (das )?(volumen )?(des |vom )?(zugegebenen |hinzugefügten |zugefügten )?(wassers?|lösungsmittels?)\b|volumen (des|vom) (zugegebenen|hinzugefügten) wasser)/,
};

// Idea 3, dilution keeps the moles: the formula c₁V₁ = c₂V₂, or diluting together with "the moles stay the same".
const DIL_EN = /(dilut\w*|add\w* (more )?water|water is added|more water|only water|just water|make\w* (it )?up to|more (litres|liters|volume|solution|solvent)|(bigger|larger|greater) volume)/;
const SAME_EN = /((moles?|\bmol\b|amount|number of (particles|molecules|ions|moles)|solute|\bn\b)\b.{0,30}(stays?|remains?|the same|unchanged|constant|doesn't change|does not change|don't change|do not change|kept|conserved)|(same|unchanged|constant) (number of |amount of )?(moles|\bmol\b|amount|solute|particles)|keep\w* (the )?(same )?(moles|amount|number of moles|solute)|(spread\w*|shared|distribut\w*) .{0,30}(more|bigger|larger|greater) (volume|space|water|solution|liquid))/;
const DIL_DE = /(verdünn\w*|wasser (zugeben|dazugeben|hinzufügen|zugegeben|dazugegeben|hinzugefügt|dazu)|mit wasser auffüll\w*|mehr wasser|nur wasser|mehr (liter|volumen|lösung)|größere\w* volumen)/;
const SAME_DE = /((stoffmenge|\bmol\b|teilchen(zahl|anzahl)?|anzahl der teilchen|gelöste\w* stoff\w*|\bn\b)\b.{0,30}(bleibt|bleiben|gleich|unverändert|konstant|ändert sich nicht|erhalten)|(gleiche|selbe|dieselbe) (stoffmenge|teilchenzahl|anzahl|menge an gelöstem stoff)|gleich viele? (mol|teilchen)|verteil\w*.{0,30}(größere\w*|mehr) (volumen|wasser|lösung|flüssigkeit))/;

// Idea 4, a portion keeps c: a portion word together with "the same concentration", or "same c, fewer moles".
const PORT_EN = /(portion|aliquot|\bpart\b|sample|pour\w* (off|out|some|away)|poured|smaller (amount|volume)|any amount|some of (it|the solution)|\bhalf\b|\bglass\b|\bcup\b|beaker|\bsip\b|\bdrops?\b|\d+ ?ml)/;
const SAMEC_EN = /(same (concentration|\bc\b|colou?r|strength)|(concentration|\bc\b) (stays|remains|is|is still) (the )?same|(concentration|\bc\b) (stays|remains) (unchanged|constant)|just as concentrated|as concentrated as|equally concentrated|just as strong|as strong as|doesn't change (the |its )?(concentration|\bc\b)|does not change (the |its )?(concentration|\bc\b)|not less concentrated|not any less concentrated|isn't less concentrated|is not less concentrated|not weaker|isn't weaker|is not weaker)/;
const PORT_DE = /(portion|aliquot|\bteil\b|teilmenge|probe|abgegossen\w*|abgieß\w*|abfüll\w*|abgefüllt\w*|abgenommen\w*|entnommen\w*|entnehm\w*|kleinere\w* (menge|volumen)|hälfte|\bglas\b|becherglas|tropfen|schluck|\d+ ?ml)/;
const SAMEC_DE = /(gleiche\w* (konz\w*|farbe|\bc\b)|dieselbe (konz\w*|farbe)|selbe (konz\w*|farbe)|(konz\w*|\bc\b) (bleibt|ist) (gleich|dieselbe|die gleiche|die selbe|unverändert|erhalten|konstant)|(bleibt|ist) (die |ihre |deren )?(konz\w*|\bc\b) (gleich|dieselbe|die gleiche|unverändert|erhalten|konstant)|ändert (sich )?(die |ihre |deren )?(konz\w*|\bc\b) nicht|ändert nichts an (der |ihrer )?(konz\w*|\bc\b)|(konz\w*|\bc\b) ändert sich nicht|genauso konzentriert|ebenso konzentriert|gleich konzentriert|gleich stark|nicht verdünnter|nicht weniger konzentriert|nicht schwächer)/;
const PORTION_WEAKER = {
  en: /^(?!.*(\bnot\b|n't|\bno\b|\bnever\b)).*((smaller|small|less|little) (portion|part|sample|amount|volume|glass|cup)\b.{0,40}(less concentrated|lower concentration|is more dilute|gets more dilute|weaker|lower c\b|smaller concentration)|(portion|part|sample|poured off|poured out)\b.{0,40}(less concentrated|lower concentration|is more dilute|is weaker|lower c\b))/,
  de: /^(?!.*(nicht|kein|\bnie\b)).*((kleinere\w*|weniger|wenig) (portion|teil\b|teilmenge|probe|menge|volumen)\b.{0,40}(weniger konzentriert|geringere\w* konz\w*|kleinere\w* konz\w*|niedrigere\w* konz\w*|ist verdünnter|schwächer)|(portion|probe|\bteil\b|abgegossen\w*)\b.{0,40}(weniger konzentriert|geringere\w* konz\w*|kleinere\w* konz\w*|niedrigere\w* konz\w*|ist verdünnter|schwächer))/,
};

// Idea 5, grams per litre are not particles: heavier molecules → fewer per gram; a salt splits into ions; or it says
// grams per litre do not count particles. "Same number of particles" alone (the result) does not pass.
const HEAVY_EN = /(heavier|higher molar mass|larger molar mass|bigger molar mass|greater molar mass|molar mass (is )?(higher|larger|bigger|greater|three times)|weigh\w* more|(three|3) times (as )?heav\w*|more massive|(three|3) times the (molar )?mass)/;
const FEWER_EN = /((fewer|less) (molecules|particles|of them)|(fewer|less) per gram|(more|many more) (formula units|particles|ions|units) (per gram|in 9 g|of salt))/;
const SPLIT_EN = /((nacl|salt|sodium chloride|each formula unit|every formula unit)\b.{0,50}\b(two|2|double|twice( as many)?) (ions|particles|pieces)|(split\w*|break\w* (up|apart)|fall\w* apart|dissociat\w*|separat\w*|come\w* apart|turn\w* into|gives?)\b.{0,25}\b(ions|na\+|two)|(twice|double) (the|as many) (particles|ions)|count\w* (twice|double)|\bna\+ ?(\+|,|plus) ?cl-)/;
const GNOT_EN = /(grams?( per (litre|liter))?|g\/l|mass( concentration)?)\b.{0,40}(doesn't count|does not count|don't count|do not count|doesn't tell|does not tell|don't tell|do not tell|isn't the same as|is not the same as|aren't the same as|are not the same as|not the same as|is not the number|isn't the number)\b.{0,40}(particles|molecules|ions|how many|number)/;
const COUNT_EN = /((number of|how many) (dissolved )?(particles|molecules|ions)\b.{0,30}(counts?|matters?|decides?)|(what|it'?s the) (counts?|matters?) (is|are) (the )?(number of )?(dissolved )?(particles|molecules|ions)|blood (counts|notices|feels|responds to) (the )?(number of )?(dissolved )?(particles|molecules|ions))/;
const HEAVY_DE = /(schwerer|größere\w* molare\w* masse|höhere\w* molare\w* masse|molare masse (ist )?(größer|höher|dreimal)|(drei|3) ?mal (so )?schwer\w*|mehr masse pro (molekül|teilchen))/;
const FEWER_DE = /((weniger|wenige) (moleküle|teilchen|davon)|(weniger|wenige) pro gramm|mehr (formeleinheiten|teilchen|ionen) pro gramm)/;
const SPLIT_DE = /((nacl|salz|kochsalz|natriumchlorid|jede formeleinheit)\b.{0,50}\b(zwei|2|doppelt so viele) (ionen|teilchen)|(zerfällt|zerfallen|dissoziier\w*|spaltet|spalten|trennt sich|trennen sich|getrennt|aufgespalten|zerlegt|liefert|ergibt|bildet)\b.{0,25}\b(ionen|na\+|zwei)|in (zwei )?ionen (zerfällt|zerfallen|dissoziiert|gespalten|getrennt|auf)|doppelt so viele teilchen|zählt doppelt|zählen doppelt|\bna\+ ?(\+|,) ?cl-)/;
const GNOT_DE = /(gramm\w*|g\/l|masse\w*|massenkonz\w*)\b.{0,40}(sagt nichts über|sagt nicht|sagen nichts über|sagen nicht|zählt nicht|zählen nicht|ist nicht dasselbe|ist nicht das gleiche|sind nicht dasselbe|nicht die (anzahl|zahl)|nicht gleich)\b.{0,40}(teilchen|moleküle|ionen|anzahl|zahl|wie viele)/;
const COUNT_DE = /((anzahl|zahl) (der )?(gelösten )?(teilchen|moleküle|ionen)\b.{0,30}(zählt|entscheidet|ist entscheidend|kommt es an|ist wichtig)|(es kommt auf die|entscheidend ist die|wichtig ist die|es zählt die) (anzahl|zahl|teilchenzahl)|teilchenzahl\b.{0,30}(zählt|entscheidet|ist entscheidend|kommt es an)|blut (zählt|merkt|spürt|reagiert auf) (die )?(anzahl|zahl|teilchen))/;
const GRAMS_COUNT = {
  en: /^(?!.*(\bnot\b|n't|\bno\b|\bnever\b)).*((same|equal) (grams|mass|g\/l)\b.{0,40}(same|equal) (number of )?(particles|molecules)|(more grams|more mass|more g\/l)\b.{0,40}(more particles|stronger)|blood (only )?(notices|counts|feels|cares about|responds to) (the )?(grams|mass|g\/l))/,
  de: /^(?!.*(nicht|kein|\bnie\b)).*((gleiche\w*|selbe|dieselbe) (masse|gramm\w*|g\/l)\b.{0,40}(gleich viele|dieselbe zahl|gleiche zahl|gleiche anzahl) (teilchen|moleküle)|(mehr gramm|mehr masse)\b.{0,40}(mehr teilchen|stärker)|blut (merkt|zählt|spürt) (nur )?(die )?(gramm|masse))/,
};

export const UNIT16: UnitContent = {
  n: 16,
  title: b('Concentration', 'Konzentration'),
  lead: b('How chemists say how much is dissolved, how to make and dilute a solution, and why two very different drips both hold about as many dissolved particles as blood.',
    'Wie man angibt, wie viel gelöst ist, wie man eine Lösung ansetzt und verdünnt, und warum zwei sehr verschiedene Infusionen etwa so viele gelöste Teilchen enthalten wie Blut.'),

  puzzle: {
    title: b('Two drips, one blood', 'Zwei Infusionen, ein Blut'),
    lead: b('In hospital, fluid is often given straight into a vein through a drip. Two of the most common are normal saline (salt water) and a 5 % glucose solution. Both are made to hold about as many dissolved particles as blood plasma: in a much more dilute or more concentrated liquid, red blood cells take in or lose water and swell or shrink.',
      'Im Krankenhaus bekommt man Flüssigkeit oft direkt in die Vene, als Infusion. Zwei der häufigsten sind physiologische Kochsalzlösung (Salzwasser) und eine Glucoselösung mit 5 %. Beide enthalten etwa so viele gelöste Teilchen wie das Blutplasma: In einer viel verdünnteren oder konzentrierteren Lösung nehmen rote Blutkörperchen Wasser auf oder geben es ab, sie schwellen an oder schrumpfen.'),
    data: {
      caption: b('Grams of solute in one litre of each drip (5 % means 5 g per 100 mL), and the molar mass of the solute.',
        'Gramm gelöster Stoff in einem Liter jeder Infusion (5 % bedeutet 5 g pro 100 mL) und die molare Masse des gelösten Stoffs.'),
      head: [b('Drip', 'Infusion'), b('Solute', 'Gelöster Stoff'), b('Grams per litre', 'Gramm pro Liter'), b('Molar mass (g/mol)', 'Molare Masse (g/mol)')],
      rows: [
        { cells: [b('normal saline, 0.9 %', 'physiologische Kochsalzlösung, 0,9 %'), b('sodium chloride, {{NaCl}}', 'Natriumchlorid, {{NaCl}}'), '9', '58.44'] },
        { cells: [b('glucose drip, 5 %', 'Glucoselösung, 5 %'), b('glucose, {{C6H12O6}}', 'Glucose, {{C6H12O6}}'), '50', '180.16'] },
      ],
      numeric: [2, 3],
    },
    clash: b('The glucose drip holds over five times as many grams per litre as saline, yet both hold about as many dissolved particles as blood plasma: about 275–295 millimoles per kilogram of water (1 mmol = 1/1000 mol). How can 9 g and 50 g both be right?',
      'Die Glucoselösung enthält über fünfmal so viele Gramm pro Liter wie die Kochsalzlösung, und trotzdem enthalten beide etwa so viele gelöste Teilchen wie das Blutplasma: etwa 275–295 Millimol pro Kilogramm Wasser (1 mmol = 1/1000 mol). Wie können 9 g und 50 g beide richtig sein?'),
    question: {
      id: 'u16-puzzle', unit: 16, kind: 'choice', format: 'predict', withConfidence: true, evidence: 'predict',
      concepts: ['u16.particles'], targets: ['grams-per-litre-counts'],
      prompt: b('Your best guess:', 'Deine beste Vermutung:'),
      options: [
        { text: b('They cannot both: five times the grams gives far more particles', 'Das geht nicht: Fünfmal so viele Gramm ergeben viel mehr Teilchen'), mis: 'grams-per-litre-counts' },
        { text: b('Glucose molecules are bigger, so each one has more effect', 'Glucosemoleküle sind größer, also wirkt jedes einzelne stärker') },
        { text: b('Glucose particles are heavier, and NaCl splits into ions', 'Glucoseteilchen sind schwerer, und NaCl zerfällt in Ionen'), correct: true },
        { text: b('Glucose dissolves less well, so more grams are needed', 'Glucose löst sich schlechter, also braucht man mehr Gramm') },
      ],
      explain: b('What matters is the number of dissolved particles, not the grams. 9 g of NaCl is 9 ÷ 58.44 = 0.154 mol, two ions each: 308 mmol of particles per litre. 50 g of glucose is 50 ÷ 180.16 = 0.278 mol of whole molecules: 278 mmol per litre. Both are close to blood (measured, saline gives about 281 mmol per kilogram of water; the saline example explains the gap), so neither harms red cells as it drips in: both are iso-osmotic. Saline stays that way in the body (isotonic); cells take up and use the glucose, so a glucose drip ends up giving the body water.',
        'Entscheidend ist die Zahl der gelösten Teilchen, nicht die Masse. 9 g NaCl sind 9 : 58,44 = 0,154 mol, je zwei Ionen: 308 mmol Teilchen pro Liter. 50 g Glucose sind 50 : 180,16 = 0,278 mol ganze Moleküle: 278 mmol pro Liter. Beide liegen nahe am Blut (gemessen ergibt die Kochsalzlösung etwa 281 mmol pro Kilogramm Wasser; das Beispiel zur Kochsalzlösung erklärt den Unterschied), also schadet keine den roten Blutkörperchen beim Einlaufen: Beide sind isoosmotisch. Die Kochsalzlösung bleibt auch im Körper so (isotonisch); die Glucose nehmen die Zellen auf und verbrauchen sie, also liefert eine Glucoseinfusion dem Körper am Ende Wasser.'),
    } as ChoiceItem,
    after: b('Next: make solutions yourself on the Lab Bench and see what a concentration tells you.', 'Als Nächstes: Setz am Labortisch selbst Lösungen an und sieh, was eine Konzentration angibt.'),
  },

  explore: {
    title: b('The Lab Bench', 'Der Labortisch'),
    intro: b('On the bench: a balance with a weighing boat, a [[volumetric-flask]] with a ring mark on its neck, a beaker and a bulb pipette. The readout lists m (mass, g), M (molar mass, g/mol), n (amount, mol), V (volume of the solution) and the [[concentration]] c in mol/L, with β, the mass concentration in g/L, beside it (β is the German symbol; English texts write ρ). UK books write mol/dm³ and g/dm³ (1 dm³ = 1 L); older and US texts write "M" for mol/L. Each dot in the particle circle stands for very many particles: cations blue "+", anions red "−".',
      'Auf dem Labortisch stehen eine Waage mit Wägeschiffchen, ein [[volumetric-flask|Messkolben]] mit Eichmarke am Hals, ein Becherglas und eine Vollpipette. Die Anzeige nennt m (Masse, g), M (molare Masse, g/mol), n (Stoffmenge, mol), V (Volumen der Lösung) und die [[concentration|Stoffmengenkonzentration]] c in mol/L, daneben die Massenkonzentration β in g/L. Ältere Bücher schreiben „M“ (molar) für mol/L. Jeder Punkt im Teilchenkreis steht für sehr viele Teilchen: Kationen blau „+“, Anionen rot „−“.'),
    tasks: [
      { id: 'make', key: true, text: b('Put some copper sulfate (CuSO₄·5H₂O: crystals with five water molecules per formula unit) on the boat, choose a flask and tap "Dissolve and fill to the mark". What do n and c tell you?', 'Gib etwas Kupfersulfat (CuSO₄·5H₂O: Kristalle mit fünf Wassermolekülen pro Formeleinheit) auf das Wägeschiffchen, wähle einen Messkolben und tippe auf „Lösen und bis zur Eichmarke auffüllen“. Was gibt jeder der beiden Werte n und c an?') },
      { id: 'target', key: true, text: b('Make 250 mL of copper sulfate solution with c = 0.100 mol/L. Work out the mass first, then weigh it.', 'Setze 250 mL Kupfersulfatlösung mit c = 0,100 mol/L an. Rechne zuerst die Masse aus, dann wiege sie ab.') },
      { id: 'dilute', key: true, text: b('Dilute a solution you made: pipette a portion into a new flask and fill it to the mark. Compare c before and after.', 'Verdünne eine Lösung, die du angesetzt hast: Pipettiere eine Portion in einen neuen Messkolben und fülle bis zur Marke auf. Vergleiche c vorher und nachher.') },
      { id: 'sample', key: true, text: b('Pour 25 mL of a solution off into a beaker. Compare its colour, c and n with the flask.', 'Gieße 25 mL einer Lösung in ein Becherglas ab. Vergleiche Farbe, c und n mit dem Messkolben.') },
      { id: 'beaker', text: b('Dissolve the solid in a beaker of water instead of filling a flask. Where does the level end?', 'Löse den Feststoff stattdessen in einem Becherglas mit Wasser, ohne Messkolben. Wo endet der Flüssigkeitsstand?') },
    ],
    notes: {
      make: b('n is the amount of copper sulfate in the flask, in moles; c is how many moles there are per litre of solution: c = n / V. Try the same mass in a bigger flask: n stays, c falls.',
        'n ist die Stoffmenge Kupfersulfat im Kolben; c gibt an, wie viel Mol davon auf einen Liter Lösung kommen: c = n / V. Probier dieselbe Masse in einem größeren Kolben: n bleibt, c sinkt.'),
      target: b('You need n = c × V = 0.100 mol/L × 0.250 L = 0.0250 mol. The blue crystals carry five water molecules per formula unit (CuSO₄·5H₂O, water of crystallisation), so M = 249.68 g/mol and m = 0.0250 mol × 249.68 g/mol = 6.24 g. In general: m = c × V × M.',
        'Du brauchst n = c · V = 0,100 mol/L · 0,250 L = 0,0250 mol. Die blauen Kristalle enthalten fünf Wassermoleküle pro Formeleinheit (CuSO₄·5H₂O, Kristallwasser), also ist M = 249,68 g/mol und m = 0,0250 mol · 249,68 g/mol = 6,24 g. Allgemein: m = c · V · M.'),
      dilute: b('The pipette carried n = c₁ × V₁ into the new flask, and the water added no solute, so c₂ = n / V₂. That is the dilution formula: c₁ × V₁ = c₂ × V₂. The colour fades because the same particles are spread through more solution.',
        'Die Pipette hat n = c₁ · V₁ in den neuen Kolben gebracht, und das Wasser bringt keinen gelösten Stoff mit, also ist c₂ = n / V₂. Das ist die Verdünnungsformel: c₁ · V₁ = c₂ · V₂. Die Farbe wird blasser, weil sich dieselben Teilchen auf mehr Lösung verteilen.'),
      sample: b('The beaker shows the same colour and the same c as the flask: it is the same solution. Only n is smaller, in proportion to the volume you poured.',
        'Das Becherglas zeigt dieselbe Farbe und dasselbe c wie der Kolben: Es ist dieselbe Lösung. Nur n ist kleiner, im Verhältnis zum abgegossenen Volumen.'),
      beaker: b('The level ends above the volume of water you chose: the dissolved solid takes up room too. The bench cannot know the exact new volume, so it only says that c is lower than planned. That is why you fill a flask to the mark.',
        'Der Flüssigkeitsstand endet über dem gewählten Wasservolumen: Auch der gelöste Stoff braucht Platz. Der Labortisch kennt das genaue neue Volumen nicht und zeigt nur, dass c kleiner ist als geplant. Deshalb füllt man einen Messkolben bis zur Marke auf.'),
    },
    check: {
      id: 'u16-check', unit: 16, kind: 'rank', format: 'rank', evidence: 'predict', concepts: ['u16.concentration'],
      prompt: b('Rank by concentration c, highest first.', 'Ordne nach der Konzentration c, die höchste zuerst.'),
      order: [b('0.10 mol in 50 mL of solution', '0,10 mol in 50 mL Lösung'), b('0.20 mol in 250 mL of solution', '0,20 mol in 250 mL Lösung'), b('0.50 mol in 1000 mL of solution', '0,50 mol in 1000 mL Lösung'), b('0.010 mol in 100 mL of solution', '0,010 mol in 100 mL Lösung')],
      explain: b('c = n / V with V in litres: 0.10 ÷ 0.050 = 2.0, 0.20 ÷ 0.250 = 0.80, 0.50 ÷ 1.000 = 0.50 and 0.010 ÷ 0.100 = 0.10 mol/L. The one with the most moles is not the most concentrated.',
        'c = n / V mit V in Litern: 0,10 : 0,050 = 2,0; 0,20 : 0,250 = 0,80; 0,50 : 1,000 = 0,50 und 0,010 : 0,100 = 0,10 mol/L. Die Lösung mit der größten Stoffmenge ist nicht die konzentrierteste.'),
    } as RankItem,
  },

  predictions: [
    {
      item: {
        id: 'u16-weigh', unit: 16, kind: 'choice', format: 'predict', withConfidence: true, evidence: 'predict',
        concepts: ['u16.make'],
        prompt: b('The bottle holds the blue crystals, copper(II) sulfate pentahydrate, CuSO₄·5H₂O: 249.68 g/mol. (Without its water, {{CuSO4}} has 159.60 g/mol.) How many grams do you weigh out for 100 mL of solution with c = 0.0500 mol/L?',
          'In der Flasche sind die blauen Kristalle, Kupfer(II)-sulfat-Pentahydrat, CuSO₄·5H₂O: 249,68 g/mol. (Ohne sein Kristallwasser hat {{CuSO4}} 159,60 g/mol.) Wie viel Gramm wiegst du für 100 mL Lösung mit c = 0,0500 mol/L ab?'),
        options: [
          { text: b('12.5 g', '12,5 g') },
          { text: b('1.25 g', '1,25 g'), correct: true },
          { text: b('0.80 g', '0,80 g') },
          { text: b('1248 g', '1248 g') },
        ],
        explain: b('n = c × V = 0.0500 mol/L × 0.100 L = 0.00500 mol, and m = n × M = 0.00500 mol × 249.68 g/mol = 1.25 g. 12.5 g would make a whole litre, 1248 g forgets to turn mL into L, and 0.80 g uses the molar mass without the water, although the crystals are weighed with it.',
          'n = c · V = 0,0500 mol/L · 0,100 L = 0,00500 mol, und m = n · M = 0,00500 mol · 249,68 g/mol = 1,25 g. 12,5 g reichen für einen ganzen Liter, bei 1248 g fehlt die Umrechnung von mL in L, und 0,80 g nimmt die molare Masse ohne Kristallwasser, obwohl man die Kristalle mit Wasser abwiegt.'),
      } as ChoiceItem,
      show: { engine: 'bench', solute: 'CuSO4-5H2O', grams: 1.25, flask: 100, made: true },
      revealText: b('1.25 g, dissolved and made up to 100 mL, gives 0.0500 mol/L (the bench may show 0.0501: 1.25 g is rounded from 1.248). The crystals are weighed together with their water of crystallisation, so their own molar mass is the one to use. With 159.60 g/mol you would weigh only 0.80 g of crystals, and the solution would come out at 0.0320 mol/L.',
        '1,25 g, gelöst und auf 100 mL aufgefüllt, ergeben 0,0500 mol/L (der Labortisch zeigt vielleicht 0,0501: 1,25 g sind von 1,248 g gerundet). Man wiegt die Kristalle mitsamt Kristallwasser ab, also gilt ihre eigene molare Masse. Mit 159,60 g/mol würdest du nur 0,80 g Kristalle abwiegen, und die Lösung hätte nur 0,0320 mol/L.'),
      extra: {
        title: b('From c and V to grams', 'Von c und V zur Masse'),
        steps: [
          b('Turn the volume into litres: 100 mL = 0.100 L.', 'Rechne das Volumen in Liter um: 100 mL = 0,100 L.'),
          b('Moles needed: n = c × V = 0.0500 mol/L × 0.100 L = 0.00500 mol.', 'Benötigte Stoffmenge: n = c · V = 0,0500 mol/L · 0,100 L = 0,00500 mol.'),
          b('Grams: m = n × M. You weigh crystals that include their water, so M = 249.68 g/mol: 0.00500 × 249.68 = 1.25 g.', 'Masse: m = n · M. Du wiegst Kristalle mitsamt Kristallwasser ab, also M = 249,68 g/mol: 0,00500 · 249,68 = 1,25 g.'),
          b('Dissolve them in a little water in the 100 mL flask, then fill to the mark.', 'Löse sie in wenig Wasser im 100-mL-Messkolben, dann fülle bis zur Marke auf.'),
        ],
      },
    },
    {
      item: {
        id: 'u16-portion', unit: 16, kind: 'choice', format: 'predict', withConfidence: true, evidence: 'transfer',
        concepts: ['u16.dilution', 'u16.portion'], targets: ['portion-diluted'],
        prompt: b('A copper sulfate stock solution has c = 0.40 mol/L. You pipette 25 mL of it into a 100 mL volumetric flask and fill to the mark. Then you pour 50 mL of this new solution into a beaker. What is c in the beaker?',
          'Eine Kupfersulfat-Stammlösung hat c = 0,40 mol/L. Du pipettierst 25 mL davon in einen 100-mL-Messkolben und füllst bis zur Marke auf. Dann gießt du 50 mL dieser neuen Lösung in ein Becherglas. Wie groß ist c im Becherglas?'),
        options: [
          { text: b('0.050 mol/L', '0,050 mol/L'), mis: 'portion-diluted' },
          { text: b('0.40 mol/L', '0,40 mol/L') },
          { text: b('0.0050 mol/L', '0,0050 mol/L') },
          { text: b('0.10 mol/L', '0,10 mol/L'), correct: true },
        ],
        explain: b('Making 25 mL up to 100 mL dilutes the solution to a quarter: 0.40 × 25 ÷ 100 = 0.10 mol/L. Pouring half of it off does not change how concentrated it is: the beaker holds half the moles, 0.0050 mol, in half the volume.',
          'Wenn man 25 mL auf 100 mL auffüllt, wird die Lösung auf ein Viertel verdünnt: 0,40 · 25 : 100 = 0,10 mol/L. Das Abgießen der Hälfte ändert nichts daran, wie konzentriert sie ist: Im Becherglas ist die halbe Stoffmenge, 0,0050 mol, in der Hälfte des Volumens.'),
      } as ChoiceItem,
      show: { engine: 'bench', solute: 'CuSO4-5H2O', grams: 9.99, flask: 100, made: true, dilute: { pipette: 25, flask: 100 }, sample: 50 },
      revealText: b('0.10 mol/L. The pipette carries 0.40 mol/L × 0.025 L = 0.010 mol into the new flask, and filled to 100 mL that gives 0.10 mol/L. The 50 mL in the beaker holds 0.0050 mol, half of the moles in half of the volume: the same colour, the same c, fewer moles.',
        '0,10 mol/L. Die Pipette bringt 0,40 mol/L · 0,025 L = 0,010 mol in den neuen Kolben; aufgefüllt auf 100 mL ergibt das 0,10 mol/L. Die 50 mL im Becherglas enthalten 0,0050 mol, die halbe Stoffmenge im halben Volumen: dieselbe Farbe, dasselbe c, weniger Stoffmenge.'),
      extra: {
        title: b('Diluting changes c, pouring does not', 'Verdünnen ändert c, Abgießen nicht'),
        steps: [
          b('Moles carried by the pipette: n = 0.40 mol/L × 0.025 L = 0.010 mol.', 'Stoffmenge in der Pipette: n = 0,40 mol/L · 0,025 L = 0,010 mol.'),
          b('In the new flask: c = 0.010 mol ÷ 0.100 L = 0.10 mol/L. (Shortcut: c₁ × V₁ = c₂ × V₂.)', 'Im neuen Kolben: c = 0,010 mol : 0,100 L = 0,10 mol/L. (Kurz: c₁ · V₁ = c₂ · V₂.)'),
          b('Pouring off 50 mL takes half the moles and half the volume: 0.0050 mol ÷ 0.050 L = 0.10 mol/L.', 'Beim Abgießen von 50 mL gehen die halbe Stoffmenge und das halbe Volumen mit: 0,0050 mol : 0,050 L = 0,10 mol/L.'),
          b('Like a cup of tea poured from the pot: the cup is not weaker than the pot, there is just less of it.', 'Wie eine Tasse Tee aus der Kanne: Die Tasse ist nicht schwächer als die Kanne, es ist nur weniger darin.'),
        ],
      },
    },
  ],

  examples: [
    {
      title: b('Normal saline, counted', 'Physiologische Kochsalzlösung, nachgezählt'), tag: 'NaCl',
      show: { engine: 'bench', solute: 'NaCl', grams: 9, flask: 1000, made: true, zoom: true },
      numbers: [
        { v: '9 g/L', label: b('of salt in normal saline (mass concentration ρ)', 'Salz in physiologischer Kochsalzlösung (Massenkonzentration β)') },
        { v: '0.154 mol/L', label: b('of NaCl (concentration c = n / V)', 'NaCl (Stoffmengenkonzentration c = n / V)') },
        { v: '0.308 mol/L', label: b('of dissolved ions, Na⁺ and Cl⁻ counted separately', 'gelöste Ionen, Na⁺ und Cl⁻ einzeln gezählt') },
      ],
      body: b('c = n / V = (9 g ÷ 58.44 g/mol) ÷ 1 L = 0.154 mol/L: the 154 mmol/L of sodium and of chloride printed on the bag. Each formula unit gives one Na⁺ and one Cl⁻: 308 mmol of dissolved particles per litre. That count treats every ion as free; measured, saline gives about 281 mmol per kilogram of water, because neighbouring ions still attract each other a little.',
        'c = n / V = (9 g : 58,44 g/mol) : 1 L = 0,154 mol/L: die 154 mmol/L Natrium und Chlorid, die auf dem Beutel stehen. Jede Formeleinheit liefert ein Na⁺ und ein Cl⁻: 308 mmol gelöste Teilchen pro Liter. Diese Zählung behandelt jedes Ion als frei; gemessen ergibt die Lösung etwa 281 mmol pro Kilogramm Wasser, weil sich benachbarte Ionen noch ein wenig anziehen.'),
      soWhat: b('The same counting sets the oral rehydration solution that WHO and UNICEF recommend for diarrhoea: 245 mmol of particles per litre. It replaced an older, more concentrated recipe (311 mmol/L).',
        'Nach derselben Zählung ist die orale Rehydratationslösung (Trinklösung gegen Durchfall) zusammengesetzt, die WHO und UNICEF empfehlen: 245 mmol Teilchen pro Liter. Sie hat ein älteres, konzentrierteres Rezept (311 mmol/L) ersetzt.'),
    },
    {
      title: b('A dilution series', 'Eine Verdünnungsreihe'), tag: 'KMnO4',
      show: { engine: 'bench', solute: 'KMnO4', grams: 1.58, flask: 100, made: true, dilute: { pipette: 10, flask: 100 } },
      numbers: [
        { v: '0.100 mol/L', label: b('stock: 1.58 g of potassium permanganate made up to 100 mL', 'Stammlösung: 1,58 g Kaliumpermanganat, auf 100 mL aufgefüllt') },
        { v: '0.0100 mol/L', label: b('after 10 mL of the stock is made up to 100 mL', 'nach dem Auffüllen von 10 mL Stammlösung auf 100 mL') },
        { v: '0.0158 g', label: b('would be needed for 100 mL at 0.00100 mol/L in one step', 'bräuchte man für 100 mL mit 0,00100 mol/L in einem Schritt') },
      ],
      body: b('10 mL of the stock carries 0.100 mol/L × 0.010 L = 0.00100 mol into the new flask; filled to 100 mL, that is 0.0100 mol/L. Nothing is lost, it is only spread through more solution: c₁ × V₁ = c₂ × V₂. A second tenfold step gives 0.00100 mol/L, and the colour on the bench fades with each step (a model picture).',
        '10 mL der Stammlösung bringen 0,100 mol/L · 0,010 L = 0,00100 mol in den neuen Kolben; aufgefüllt auf 100 mL sind das 0,0100 mol/L. Nichts geht verloren, es verteilt sich nur auf mehr Lösung: c₁ · V₁ = c₂ · V₂. Ein zweiter Schritt auf ein Zehntel ergibt 0,00100 mol/L, und die Farbe auf dem Labortisch wird mit jedem Schritt blasser (ein Modellbild).'),
      soWhat: b('Labs make very dilute solutions this way. On a balance that reads to 0.01 g, 0.0158 g could be off by about a third; 1.58 g diluted twice in calibrated glassware is far more accurate.',
        'So setzt man im Labor sehr verdünnte Lösungen an (z. B. Maßlösungen für Titrationen). Auf einer Waage, die auf 0,01 g genau anzeigt, könnten 0,0158 g um ein Drittel danebenliegen; 1,58 g, zweimal mit geeichten Glasgeräten verdünnt, sind viel genauer.'),
    },
    {
      title: b('Where the model breaks: volumes that do not add up', 'Wo das Modell an Grenzen stößt: Volumina, die sich nicht addieren'), tag: 'C2H5OH',
      show: { engine: 'bench', solute: 'NaCl', grams: 5.84, water: 100 },
      numbers: [
        { v: '96 mL', label: b('of mixture from 50 mL of ethanol and 50 mL of water (unit 11)', 'Gemisch aus 50 mL Ethanol und 50 mL Wasser (Einheit 11)') },
        { v: '20 °C', label: b('is the temperature a volumetric flask is calibrated for', 'ist die Temperatur, für die ein Messkolben geeicht ist') },
        { v: '0.26 %', label: b('lower c at 30 °C, because the solution expands', 'kleineres c bei 30 °C, weil sich die Lösung ausdehnt') },
      ],
      body: b('Volumes do not simply add up, which is why you fill to the mark. 50 mL of ethanol and 50 mL of water give only about 96 mL, and a dissolving solid changes the volume by an amount you cannot know in advance; filled to its mark, the flask holds the stated volume of solution whatever happened inside. Even then c depends a little on temperature: flasks are calibrated at 20 °C, and at 30 °C water takes up about 0.26 % more room (density 0.99821 → 0.99565 g/mL), so a dilute solution\'s c falls by about as much.',
        'Volumina addieren sich nicht einfach, deshalb füllt man bis zur Marke auf. 50 mL Ethanol und 50 mL Wasser ergeben nur etwa 96 mL, und ein gelöster Feststoff ändert das Volumen um einen Betrag, den man vorher nicht kennt; bis zur Eichmarke aufgefüllt enthält der Messkolben das angegebene Volumen Lösung, egal was darin passiert ist. Selbst dann hängt c ein wenig von der Temperatur ab: Messkolben sind auf 20 °C geeicht, und bei 30 °C braucht Wasser etwa 0,26 % mehr Platz (Dichte 0,99821 → 0,99565 g/mL); c einer verdünnten Lösung sinkt um etwa so viel.'),
      soWhat: b('The bench shows the beaker case: 5.84 g of salt in 100 mL of water ends above the line. Blood\'s 275–295 is counted per kilogram of water instead, which does not change on warming.',
        'Der Labortisch zeigt den Fall im Becherglas: 5,84 g Salz in 100 mL Wasser enden über der Linie. Die 275–295 des Bluts zählt man stattdessen pro Kilogramm Wasser; das ändert sich beim Erwärmen nicht.'),
    },
  ],

  flaw: {
    id: 'u16-flaw', unit: 16, kind: 'flaw', format: 'flaw', evidence: 'transfer', concepts: ['u16.portion', 'u16.make'], targets: ['portion-diluted'],
    prompt: b('Where does this reasoning first go wrong?', 'Wo geht diese Überlegung zum ersten Mal schief?'),
    lines: [
      b('250 mL of glucose solution with c = 0.200 mol/L needs n = 0.200 mol/L × 0.250 L = 0.0500 mol.', '250 mL Glucoselösung mit c = 0,200 mol/L brauchen n = 0,200 mol/L · 0,250 L = 0,0500 mol.'),
      b('With M = 180.16 g/mol, that is m = 0.0500 mol × 180.16 g/mol = 9.01 g of glucose.', 'Mit M = 180,16 g/mol sind das m = 0,0500 mol · 180,16 g/mol = 9,01 g Glucose.'),
      b('Dissolve it in a little water in a 250 mL volumetric flask, then fill with water up to the ring mark.', 'Man löst sie in wenig Wasser in einem 250-mL-Messkolben und füllt dann mit Wasser bis zur Eichmarke auf.'),
      b('A 50 mL portion poured off holds only a fifth of the glucose, so its concentration is 0.0400 mol/L.', 'Eine abgegossene Portion von 50 mL enthält nur ein Fünftel der Glucose, also ist ihre Konzentration 0,0400 mol/L.'),
    ],
    flaw: 3,
    near: [{ step: 2, note: b('This one is true: filling to the mark makes the whole solution 250 mL, however much water that takes. Look at the last step.', 'Dieser Schritt stimmt: Durch das Auffüllen bis zur Marke ist die ganze Lösung 250 mL, egal wie viel Wasser das braucht. Schau dir den letzten Schritt an.') }],
    explain: b('Step 4 is the first wrong step. Steps 1 and 2 are right: n = c × V = 0.0500 mol, and m = n × M = 9.01 g. Step 3 is right: dissolve first, then fill to the mark, so the solution is exactly 250 mL. Step 4 is wrong: the 50 mL portion holds a fifth of the glucose, 0.0100 mol, but also a fifth of the volume, so c = 0.0100 mol ÷ 0.0500 L = 0.200 mol/L, the same as in the flask.',
      'Schritt 4 ist der erste falsche Schritt. Die Schritte 1 und 2 stimmen: n = c · V = 0,0500 mol und m = n · M = 9,01 g. Schritt 3 stimmt: erst lösen, dann bis zur Marke auffüllen, also ist die Lösung genau 250 mL. Schritt 4 ist falsch: Die Portion von 50 mL enthält ein Fünftel der Glucose, 0,0100 mol, aber auch nur ein Fünftel des Volumens, also c = 0,0100 mol : 0,0500 L = 0,200 mol/L, genauso viel wie im Kolben.'),
  } as FlawItem,

  deeper: {
    id: 'u16-deeper', unit: 16, kind: 'estimate', format: 'estimate', evidence: 'transfer', concepts: ['u16.particles', 'u16.concentration'],
    prompt: b('A third common drip holds 1.8 g of sodium chloride (58.44 g/mol) and 40 g of glucose (180.16 g/mol) in each litre. How many millimoles of dissolved particles does one litre hold?',
      'Eine dritte häufige Infusion enthält in jedem Liter 1,8 g Natriumchlorid (58,44 g/mol) und 40 g Glucose (180,16 g/mol). Wie viele Millimol gelöste Teilchen enthält ein Liter?'),
    min: 0, max: 600, step: 1, answer: 284, tolerance: 8, suffix: ' mmol',
    near: [
      { value: 253, tol: 6, note: b('That counts each NaCl once. In water every formula unit splits into Na⁺ and Cl⁻, two particles.', 'Da ist jedes NaCl nur einmal gezählt. In Wasser zerfällt jede Formeleinheit in Na⁺ und Cl⁻, zwei Teilchen.') },
      { value: 222, tol: 5, note: b('That is the glucose alone. Add the ions from the salt.', 'Das ist nur die Glucose. Zähl die Ionen aus dem Salz dazu.') },
      { value: 62, tol: 4, note: b('That is the salt\'s ions alone. Add the glucose molecules.', 'Das sind nur die Ionen des Salzes. Zähl die Glucosemoleküle dazu.') },
    ],
    explain: b('Salt: 1.8 ÷ 58.44 = 0.0308 mol, two ions each, 61.6 mmol. Glucose: 40 ÷ 180.16 = 0.222 mol = 222 mmol. Together about 284 mmol per litre, which is what one maker states (284 mOsm/L): iso-osmotic like blood in the bag, with only a fifth of saline\'s salt. Data sheets still call it hypotonic in the body, as they do the 5 % glucose drip: cells take up the glucose and use it, and then only the salt keeps counting.',
      'Salz: 1,8 : 58,44 = 0,0308 mol, je zwei Ionen, 61,6 mmol. Glucose: 40 : 180,16 = 0,222 mol = 222 mmol. Zusammen etwa 284 mmol pro Liter, so wie ein Hersteller angibt (284 mOsm/L): im Beutel isoosmotisch zum Blut, mit nur einem Fünftel des Salzes der Kochsalzlösung. Fachinformationen nennen sie im Körper trotzdem hypoton, wie auch die 5-%-Glucoselösung: Die Zellen nehmen die Glucose auf und verbrauchen sie; danach zählt nur noch das Salz.'),
  } as EstimateItem,

  explain: {
    prompt: b('In your own words: what does a concentration in mol/L tell you, how do you make and dilute a solution, what happens when you pour some off, and why can 9 g/L of salt and 50 g/L of glucose hold about the same number of particles?',
      'In eigenen Worten: Was gibt eine Konzentration in mol/L an, wie setzt man eine Lösung an und verdünnt sie, was passiert, wenn man etwas abgießt, und warum können 9 g/L Salz und 50 g/L Glucose etwa gleich viele Teilchen enthalten (beide isoosmotisch zum Blut)?'),
    ideas: [
      { id: 'conc', concept: 'u16.concentration', idea: b('Concentration c = n / V: moles of dissolved substance per litre of solution', 'Stoffmengenkonzentration c = n / V: Mol gelöster Stoff pro Liter Lösung'), contra: PER_WATER,
        en: new RegExp(`(c ?= ?n ?(\\/|÷) ?v\\b|\\bn ?(\\/|÷) ?v\\b|${together(CONC_EN, PERL_EN)}|how many mol\\w* (of \\w+ )?(are |is )?(dissolved )?in (each|every|one|a) (litre|liter))`),
        de: new RegExp(`(c ?= ?n ?(\\/|÷) ?v\\b|\\bn ?(\\/|÷) ?v\\b|${together(CONC_DE, PERL_DE)}|wie viel\\w* mol .{0,30}in (einem|jedem|1) liter)`) },
      { id: 'volume', concept: 'u16.solution-volume', idea: b('V is the volume of the whole solution: dissolve, then fill the volumetric flask to the mark', 'V ist das Volumen der ganzen Lösung: lösen, dann den Messkolben bis zur Eichmarke auffüllen'), contra: VOLUME_WATER,
        en: new RegExp(`(${FILL_EN.source}|${VSOL_EN.source}|(up to|to|until it reaches|reaches|reach) the (ring |calibration |etched |graduation )?(mark|line))`),
        de: new RegExp(`(${FILL_DE.source}|${VSOL_DE.source}|bis (zur|zum|an die) (eich|ring)?(marke|strich))`) },
      { id: 'dilute', concept: 'u16.dilution', idea: b('Diluting adds only water: the moles stay the same, so c₁ × V₁ = c₂ × V₂', 'Beim Verdünnen kommt nur Wasser dazu: Die Stoffmenge bleibt gleich, also c₁ · V₁ = c₂ · V₂'),
        en: new RegExp(`(c[1₁] ?[×x*·]? ?v[1₁] ?= ?c[2₂] ?[×x*·]? ?v[2₂]|m[1₁] ?[×x*·]? ?v[1₁] ?= ?m[2₂] ?[×x*·]? ?v[2₂]|^(?=.*${DIL_EN.source}).*${SAME_EN.source})`),
        de: new RegExp(`(c[1₁] ?[·*x×]? ?v[1₁] ?= ?c[2₂] ?[·*x×]? ?v[2₂]|^(?=.*${DIL_DE.source}).*${SAME_DE.source})`) },
      { id: 'portion', concept: 'u16.portion', idea: b('A portion poured off has the same concentration, just fewer moles', 'Eine abgegossene Portion hat dieselbe Konzentration, nur weniger Stoffmenge'), contra: PORTION_WEAKER,
        en: new RegExp(`(${together(PORT_EN, SAMEC_EN)}|(concentration|\\bc\\b).{0,30}(same|uniform|equal|identical) (everywhere|throughout|in every part|in each part|in all parts)|(fewer|less|smaller) (moles|\\bmol\\b|amount|solute|\\bn\\b)\\b.{0,40}same (concentration|\\bc\\b)|same (concentration|\\bc\\b).{0,40}(fewer|less|smaller) (moles|\\bmol\\b|amount|solute|\\bn\\b))`),
        de: new RegExp(`(${together(PORT_DE, SAMEC_DE)}|(konz\\w*|\\bc\\b) ändert sich (beim|durch das|durch) (abgieß\\w*|abfüll\\w*|entnehm\\w*|entnahme|abgießen) nicht|(konz\\w*|\\bc\\b).{0,30}(überall|in jedem teil|in der ganzen lösung|im ganzen kolben) (gleich|dieselbe|die gleiche)|(weniger|kleinere\\w*) (stoffmenge|\\bmol\\b|teilchen|gelöste\\w* stoff)\\b.{0,40}(gleiche\\w*|dieselbe|selbe) (konz\\w*|\\bc\\b)|(gleiche\\w*|dieselbe|selbe) (konz\\w*|\\bc\\b).{0,40}(weniger|kleinere\\w*) (stoffmenge|\\bmol\\b|teilchen|gelöste\\w* stoff))`) },
      { id: 'particles', concept: 'u16.particles', idea: b('Equal grams per litre can mean very different numbers of particles: heavier molecules give fewer per gram, and a salt splits into ions', 'Gleiche Gramm pro Liter können sehr verschiedene Teilchenzahlen bedeuten: Schwerere Moleküle ergeben weniger pro Gramm, und ein Salz zerfällt in Ionen'), contra: GRAMS_COUNT,
        en: new RegExp(`(${together(HEAVY_EN, FEWER_EN)}|${SPLIT_EN.source}|${GNOT_EN.source}|${COUNT_EN.source})`),
        de: new RegExp(`(${together(HEAVY_DE, FEWER_DE)}|${SPLIT_DE.source}|${GNOT_DE.source}|${COUNT_DE.source})`) },
    ] as Idea[],
    tightened: b('A concentration c = n / V counts the moles of dissolved substance per litre of solution. V is the volume of the whole solution: you dissolve the weighed solid in a little water and then fill the volumetric flask up to the ring mark. When you dilute, you only add water: the moles stay the same, so c₁ × V₁ = c₂ × V₂. A portion poured off has the same concentration as the rest, just fewer moles. Equal grams per litre can mean very different numbers of particles: glucose molecules are about three times heavier than NaCl formula units, and each NaCl splits into two ions, so 9 g/L of salt and 50 g/L of glucose hold about the same number of dissolved particles per litre.',
      'Die Stoffmengenkonzentration c = n / V gibt an, wie viel Mol gelöster Stoff in einem Liter Lösung sind. V ist das Volumen der ganzen Lösung: Man löst den abgewogenen Feststoff in wenig Wasser im Messkolben und füllt dann bis zur Eichmarke auf. Beim Verdünnen kommt nur Wasser dazu, die Stoffmenge bleibt gleich, also gilt c₁ · V₁ = c₂ · V₂. Eine abgegossene Portion hat dieselbe Konzentration wie der Rest, nur eine kleinere Stoffmenge. Gleiche Gramm pro Liter können sehr verschiedene Teilchenzahlen bedeuten: Glucosemoleküle sind etwa dreimal so schwer wie die Formeleinheiten von NaCl, und jedes NaCl zerfällt in zwei Ionen; deshalb enthalten 9 g/L Salz und 50 g/L Glucose etwa gleich viele gelöste Teilchen pro Liter.'),
  },

  terms: ['concentration', 'volumetric-flask', 'dilution', 'mole', 'molar-mass'],

  readings: [
    {
      lang: 'en', kind: 'quick',
      title: b('Preparing Solutions', 'Preparing Solutions'), source: 'LibreTexts, Introductory Chemistry (CK-12), 16.9',
      url: 'https://chem.libretexts.org/Bookshelves/Introductory_Chemistry/Introductory_Chemistry_(CK-12)/16%3A_Solutions/16.09%3A_Preparing_Solutions',
      lookFor: [
        b('Its 1.00 L of 1.00 M NaCl: how many grams does it weigh out? Compare with 58.44 g/mol on the Lab Bench.', ''),
        b('Why does it say not to add the salt to 1 L of water? Compare with the beaker that ends above its line.', ''),
        b('The order of the steps: when does the solid go in, and when is the flask filled to the line?', ''),
      ],
    },
    {
      lang: 'en', kind: 'deeper',
      title: b('Molarity', 'Molarity'), source: 'OpenStax Chemistry 2e, section 3.3',
      url: 'https://openstax.org/books/chemistry-2e/pages/3-3-molarity',
      lookFor: [
        b('Example 3.14, a soft drink: 0.133 mol of sugar in 355 mL. Check its answer with c = n / V.', ''),
        b('Example 3.15, a 10 mL sip of that drink: is the sip less concentrated than the can, or does it just hold fewer moles?', ''),
        b('Its dilution equation C₁V₁ = C₂V₂: which quantity does it say stays the same? Compare with the permanganate series.', ''),
      ],
    },
    {
      lang: 'de', kind: 'quick',
      title: b('Stoffmengenkonzentration', 'Stoffmengenkonzentration'), source: 'Studyflix',
      url: 'https://studyflix.de/chemie/stoffmengenkonzentration-273',
      lookFor: [
        b('', 'Das Beispiel mit 2 mol NaCl in einem Liter: Wie viel Gramm nennt der Artikel, und passt das zu M = 58,44 g/mol?'),
        b('', '„früher Molarität“: Welche Einheit gibt der Artikel für c an, und was bedeutet „2 molar“?'),
        b('', 'Der Artikel spricht nur von „Volumen“. Ist das in seinem 1-Liter-Beispiel das Volumen des Wassers oder der ganzen Lösung? Vergleiche mit dem Messkolben.'),
      ],
    },
  ],

  misconceptions: [
    { id: 'volume-of-water', name: b('V is the volume of water added', 'V ist das Volumen des zugegebenen Wassers') },
    { id: 'portion-diluted', name: b('A smaller portion is less concentrated', 'Eine kleinere Portion ist weniger konzentriert') },
    { id: 'grams-per-litre-counts', name: b('Equal grams per litre means equal particles', 'Gleiche Gramm pro Liter bedeuten gleich viele Teilchen') },
  ],

  glossary: {
    concentration: {
      en: 'concentration', de: 'Stoffmengenkonzentration', unit: 16,
      def: { en: 'How much dissolved substance there is per volume of solution: c = n / V in mol/L. Mass concentration (β in German books, ρ in English ones) gives grams per litre instead.', de: 'Wie viel gelöster Stoff auf ein Volumen Lösung kommt: c = n / V in mol/L. Die Massenkonzentration β gibt stattdessen Gramm pro Liter an.' },
      falseFriend: { en: 'Older books write "molarity" and "M" (molar) for mol/L; British school books often write mol/dm³ (1 dm³ = 1 L).', de: 'Ältere Bücher sagen „Molarität“ und schreiben „M“ (molar) für mol/L; englische Schulbücher schreiben oft mol/dm³ (1 dm³ = 1 L).' },
    },
    'volumetric-flask': {
      en: 'volumetric flask', de: 'Messkolben', unit: 16,
      def: { en: 'A flask with a long, narrow neck and one ring mark: filled to the mark, it holds exactly the stated volume (at 20 °C).', de: 'Ein Kolben mit langem, engem Hals und einer einzigen Ringmarke: Bis zur Marke gefüllt, enthält er genau das angegebene Volumen (bei 20 °C).' },
      falseFriend: { en: 'German calls the mark "Eichmarke" or "Ringmarke".', de: 'Die Marke heißt Eichmarke oder Ringmarke; englisch „volumetric flask“.' },
    },
    dilution: {
      en: 'dilution', de: 'Verdünnung', unit: 16,
      def: { en: 'Adding solvent to a solution: the moles of solute stay the same, the volume grows, so c falls: c₁ × V₁ = c₂ × V₂.', de: 'Zugabe von Lösungsmittel zu einer Lösung: Die Stoffmenge des gelösten Stoffs bleibt gleich, das Volumen wächst, also sinkt c: c₁ · V₁ = c₂ · V₂ (Verdünnungsformel).' },
    },
  },
};
