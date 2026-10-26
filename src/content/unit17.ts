// Unit 17 — Bond energy and enthalpy, in the Energy Landscape (bonds mode).
// Numbers: bond energies from bonds.ts (OpenStax Chemistry 2e, Table 7.2): H–H 436, Cl–Cl 243, F–F 160, O=O 498,
// N≡N 946, H–Cl 432, H–F 569, C–H 415, O–H 464, N–H 390, C=O 741, C–C 345, C=C 611, C–Cl 330 kJ/mol.
// Bond estimates with bondEstimate() in thermo.ts (kJ/mol, broken / formed / ΔH): hcl 679 / 864 / −185; h2o 1370 / 1856 /
// −486; nh3 2254 / 2340 / −86; ethene 1047 / 1175 / −128; ch4 2656 / 3338 / −682; hf 596 / 1138 / −542.
// Measured ΔH with dH() in thermo.ts (OpenStax Appendix G): hcl −184.6; h2-burn-g −483.6; h2-burn-l −571.7 (2 × 44.0 =
// 88.0 more, water-boil +44.0); nh3 −91.8; ethene-h2 −136.4; ch4-burn-g −802.6 (802.55); ch4-burn −890.6; fe-rust
// −1648.4 per 4 mol Fe = −412.1 per mol Fe; Fe 55.845 g/mol (stoich.ts) → 7.4 kJ per gram of iron.
// Sources fetched for values not in the data files:
// - C=O in carbon dioxide +805 kJ/mol; "1662/4 = +415.5" for the C–H bonds of methane; "don't expect calculations
//   using mean bond enthalpies to give very reliable answers": LibreTexts, Physical and Theoretical Chemistry,
//   Supplemental Modules, "Bond Enthalpies" (chem.libretexts.org/…/Enthalpy/Bond_Enthalpies). With 805:
//   2656 − (2 × 805 + 4 × 464) = −810 kJ/mol.
// - HF(g) ΔfH −273.3 kJ/mol (OpenStax Chemistry 2e, Appendix G, LibreTexts copy): 2 HF −546.6 kJ/mol.
// - CH₃Cl(g) ΔfH −81.9 kJ/mol (same table): CH₄ + Cl₂ → CH₃Cl + HCl measured −81.9 − 92.3 + 74.6 = −99.6 kJ/mol;
//   bond estimate 415 + 243 − (330 + 432) = −104 kJ/mol.
// - Ethene + chlorine (deeper): 611 + 243 − (345 + 2 × 330) = −151 kJ/mol (bonds.ts only).
import type { Bi } from '../i18n';
import type { ChoiceItem, FlawItem, EstimateItem } from './items';
import type { Idea } from './unit06';
import type { UnitContent } from './unitTypes';

const b = (en: string, de: string): Bi => ({ en, de });
const src = (r: RegExp) => `(?:${r.source})`;
const any = (...rs: RegExp[]) => new RegExp(rs.map(src).join('|'));
const together = (a: RegExp, c: RegExp, gap = 60) => new RegExp(`${src(a)}.{0,${gap}}${src(c)}|${src(c)}.{0,${gap}}${src(a)}`);
// Tempered gap: up to n characters that do not contain any of the stop words.
const gapWithout = (stop: string, n: number) => `(?:(?!${stop}).){0,${n}}`;

// ---------- explain-back patterns ----------
// Idea 1, breaking costs, making releases.
const BREAK_EN = /(break\w*|broken|broke|split\w*|pull\w* (the |them |it )?(atoms )?apart|separat\w*)/;
const COST_EN = /(costs?\b|needs?\b|needed|requires?|required|takes? (in |up )?(some |more )?(energy|heat)|takes? in|taken in|absorb\w*|put (energy |heat )?in|uses? (up )?energy|endotherm\w*|has to be (added|supplied|put in)|must be (added|supplied|put in))/;
const MAKE_EN = /\b(mak(e|es|ing)|made|form(s|ed|ing)?|creat\w*|build\w*|join\w*|new bonds)\b/;
const RELEASE_EN = /(releas\w*|gives? (out|off)|giv\w* (out|off)|given (out|off)|set free|frees?\b|emit\w*|lets? out|exotherm\w*|comes? out|out to the surroundings)/;
const BREAK_DE = /(spalt\w*|gespalten\w*|aufbrech\w*|aufgebrochen\w*|brech\w*|gebrochen\w*|trenn\w*|getrennt\w*)/;
const COST_DE = /(kostet|kosten|erfordert|erfordern|benötigt|benötigen|braucht|brauchen|aufnehm\w*|aufgenommen|nimmt .{0,20}auf\b|zuführ\w*|zugeführt|aufwend\w*|aufgewendet|aufbring\w*|aufgebracht|endotherm\w*|energieaufwand|reinstecken|hineinstecken)/;
const MAKE_DE = /(knüpf\w*|geknüpft\w*|\bbild(et|en|ung|ung von)\b|gebildet\w*|entsteh\w*|entstanden\w*|neue\w* bindung\w*|ausbild\w*)/;
const RELEASE_DE = /(\bfrei\b|freigesetzt|freisetz\w*|setzt .{0,25}\bfrei\b|abgegeben|abgabe|gibt .{0,25}\bab\b|abgeben|exotherm\w*|an die umgebung)/;
// The main misconception: breaking releases energy (or, mirrored, making costs it).
const STOP_EN = 'cost|need|take|absorb|requir|mak|form|creat|new bond|stronger|more|than|so ';
const STOP_DE = 'kost|erford|benötig|brauch|aufn|zuf|aufw|knüpf|gebild|bildet|entsteh|neue|stärker|mehr|als |sodass';
const BREAKING_RELEASES = {
  en: new RegExp(`^(?!.*(\\bnot\\b|n't|\\bno\\b|\\bnever\\b|instead of|rather than)).*(${src(BREAK_EN)}${gapWithout(STOP_EN, 30)}${src(RELEASE_EN)}|${src(RELEASE_EN)}${gapWithout(STOP_EN, 30)}\\b(break\\w*|broken|split\\w*)|\\b(mak(e|es|ing)|form(s|ing)?)\\b${gapWithout('releas|give|break|split|stronger', 30)}(costs?\\b|needs? energy|takes? (in )?energy|absorb\\w*))`),
  de: new RegExp(`^(?!.*(nicht|kein|\\bnie\\b|statt|anstatt)).*(${src(BREAK_DE)}${gapWithout(STOP_DE, 30)}${src(RELEASE_DE)}|${src(RELEASE_DE)}${gapWithout(STOP_DE, 30)}(spalt\\w*|gespalten\\w*|aufgebrochen\\w*|brech\\w*)|(knüpf\\w*|geknüpft\\w*)${gapWithout('frei|abgeb|gibt|spalt|stärker', 30)}(kostet|kosten|braucht|benötigt|erfordert|nimmt .{0,15}auf\\b))`),
};

// Idea 2, the new bonds are stronger: more energy is released than taken in.
const STRONGER_EN = any(
  /\b(new|formed|forming|made|product\w*|co[2₂]|carbon dioxide|water|hcl|h-cl)\b.{0,40}\b(stronger|more stable|stabler)\b/,
  /\bstronger bonds? (are |get |being )?(form\w*|made|creat\w*)/,
  /\bweaker bonds? (are |get )?(broken|break\w*)/,
  /\b(more|greater|larger|bigger) (energy |heat )?(is )?(released|given out|given off|comes? out|let out|out)\b.{0,50}\bthan\b/,
  /\b(releas\w*|gives? out|give\w* out|gives? off) more( energy| heat)? than/,
  /\b(released|given out|comes? out|out)\b.{0,40}\b(bigger|larger|greater|more) than\b.{0,40}\b(needed|taken in|absorbed|goes in|put in|in|break\w*|broken|costs?)\b/,
  /\b(bond energ\w*|bond enthalp\w*) (of|in) the (products|new bonds|bonds formed)\b.{0,30}\b(bigger|larger|higher|greater)\b/,
);
const STRONGER_DE = any(
  /(neu\w*|geknüpft\w*|gebildet\w*|entstehend\w*|entstanden\w*|produkt\w*|co[2₂]|kohlenstoffdioxid|wassers?\b|hcl)\b.{0,40}\b(stärker|fester|stabiler)\b/,
  /stärkere\w* bindung\w* (werden |wird )?(geknüpft|gebildet|entsteh\w*|entstanden)/,
  /schwächere\w* bindung\w* (werden |wird )?(gespalten|aufgebrochen|getrennt)/,
  /(mehr|größere\w*) energie\b.{0,40}(\bfrei\b|freigesetzt|abgegeben|gibt .{0,20}\bab\b)/,
  /(freigesetzt\w*|abgegeben\w*|frei werdend\w*)\b.{0,40}(größer|mehr) als/,
  /(bindungsenthalpie\w*|bindungsenergie\w*) der (produkte|neuen bindungen|geknüpften)\b.{0,30}(größer|höher)/,
);

// Idea 3, the sign: exothermic ΔH < 0 (energy to the surroundings), endothermic ΔH > 0.
const NEG_EN = /(negative|< ?0|below zero|less than zero|minus sign|is minus)/;
const POS_EN = /(positive|> ?0|above zero|greater than zero|more than zero|plus sign|is plus)/;
const OUT_EN = /(releas\w*|gives? (out|off)|given (out|off)|giving (out|off)|to the surroundings|into the surroundings|warms?\b|heats? (up )?(the )?surroundings|loses?|lost|goes out|flows? out)/;
const IN_EN = /(takes? in|taken in|absorb\w*|from the surroundings|cools?\b|gains?\b)/;
const NEG_DE = /(negativ\w*|< ?0|kleiner (als )?(null|0)\b|unter null|minuszeichen|ist minus)/;
const POS_DE = /(positiv\w*|> ?0|größer (als )?(null|0)\b|über null|pluszeichen)/;
const OUT_DE = /(\bfrei\b|freigesetzt|abgegeben|abgabe|gibt .{0,20}\bab\b|an die umgebung|umgebung (wird )?(erwärmt|wärmer)|wärme ab|verliert)/;
const IN_DE = /(aufgenommen|nimmt .{0,20}\bauf\b|aufnahme|aus der umgebung|umgebung (kühlt|wird kälter|abgekühlt)|zugeführt)/;
const DH_SIGN = {
  en: new RegExp(`^(?!.*(\\bnot\\b|n't|\\bno\\b|\\bnever\\b)).*(${src(/(negative|< ?0|below zero|less than zero)/)}${gapWithout('exotherm|positive|> ?0|releas|gives? (out|off)|surroundings warm', 30)}(takes? in|taken in|absorb\\w*|endotherm\\w*|needs? energy|gains? energy)|exotherm\\w*${gapWithout('endotherm|negative|< ?0', 15)}(positive|> ?0)|endotherm\\w*${gapWithout('exotherm|positive|> ?0', 15)}(negative|< ?0))`),
  de: new RegExp(`^(?!.*(nicht|kein|\\bnie\\b)).*(${src(/(negativ\w*|< ?0|kleiner (als )?null)/)}${gapWithout('exotherm|positiv|> ?0|frei|abgeb|gibt', 30)}(aufgenommen|aufnimmt|aufnehmen|nimmt .{0,15}auf\\b|endotherm\\w*|benötigt)|exotherm\\w*${gapWithout('endotherm|negativ|< ?0', 15)}(positiv|> ?0)|endotherm\\w*${gapWithout('exotherm|positiv|> ?0', 15)}(negativ|< ?0))`),
};

// Idea 4, the estimate: ΔH ≈ bonds broken − bonds formed ("=" shorthand, words or a subtraction).
const MINUS = String.raw`(\s-\s?|\s?-\s|\)-|-σ|-\(|\bminus\b|\babzüglich\b)`;
const BROKEN_EN = /(broken|break\w*|split|taken in|absorbed|energy in|put in)/;
const FORMED_EN = /(formed|forming|form\b|made|making|make|created|new bonds|released|given out|energy out|\bout\b)/;
const BROKEN_DE = /(gespalten\w*|spalt\w*|aufgebrochen\w*|aufgewendet\w*|aufgenommen\w*|getrennt\w*|rein\b)/;
const FORMED_DE = /(geknüpft\w*|knüpf\w*|gebildet\w*|bild\w*|entstanden\w*|entsteh\w*|freigesetzt\w*|\bfrei\b|abgegeben\w*|neue\w* bindung\w*|raus\b)/;
const ESTIMATE_EN = any(
  new RegExp(`${src(BROKEN_EN)}.{0,20}${MINUS}.{0,30}${src(FORMED_EN)}`),
  /\bsubtract\w* .{0,40}\b(formed|made|making|forming|new bonds|released)\b.{0,30}\bfrom .{0,30}\b(broken|break\w*|taken in)/,
  /\b(subtract\w*|take away|takes? away|deduct\w*)( the)?( energy| total| sum)?( of| for| from)?( the)? (bonds? )?(formed|made|you make|that form|new bonds|forming|making)\b/,
);
const ESTIMATE_DE = any(
  new RegExp(`${src(BROKEN_DE)}.{0,20}${MINUS}.{0,30}${src(FORMED_DE)}`),
  /zieh\w* .{0,40}(geknüpft|gebildet|neu)\w*.{0,30}\bab\b/,
  /(geknüpft|gebildet)\w*\b.{0,30}(abzieh\w*|abgezogen|subtrahier\w*)/,
  /subtrahier\w* .{0,40}(geknüpft|gebildet|neu)/,
);
const FORMED_MINUS_BROKEN = {
  en: new RegExp(`^(?!.*(\\bnot\\b|n't|\\bno\\b|\\bnever\\b)).*(\\b(formed|made|forming|making|released)\\b.{0,20}${MINUS}.{0,30}\\b(broken|breaking|taken in)\\b|\\bsubtract\\w* .{0,40}\\b(broken|breaking)\\b.{0,30}\\bfrom .{0,30}\\b(formed|made|forming|making)\\b)`),
  de: new RegExp(`^(?!.*(nicht|kein|\\bnie\\b)).*((geknüpft|gebildet|knüpf|freigesetzt)\\w*.{0,20}${MINUS}.{0,30}(gespalten|spalt|aufgenommen|aufgewendet)\\w*)`),
};

// Idea 5, average bond energies: estimates, not measurements.
const AVG_EN = /(average\w*|\bmean\b|typical|averaged)/;
const ROUGH_EN = /(estimat\w*|approx\w*|rough\w*|not exact|not exactly|not quite|isn't exact|close but|only close|differ\w*|off by|\bgap\b|doesn't match|does not match|don't match|deviat\w*|inaccura\w*|less accurate|\berror\b|a bit off|slightly off|\boff\b)/;
const MANY_EN = /(many|different|lots of|various|all sorts of|other) (molecules|compounds|substances)/;
const AVG_DE = /(mittel\w*|mittler\w*|durchschnitt\w*|gemittelt\w*)/;
const ROUGH_DE = /(schätz\w*|näherung\w*|ungefähr|ungenau\w*|abweich\w*|weich\w* .{0,30}\bab\b|nicht genau|nicht ganz genau|nicht exakt|stimmt nicht überein|stimmt nicht ganz überein|stimmen nicht überein|stimmen nicht ganz überein|nur grob|\bgrob\b|unterschied\w*|differenz)/;
const MANY_DE = /(viele\w*|verschiedene\w*|unterschiedliche\w*|andere\w*) (moleküle\w*|verbindungen|stoffe\w*)/;
const AVERAGE_EN = any(
  together(AVG_EN, ROUGH_EN, 60),
  together(AVG_EN, MANY_EN, 40),
  /\bc=o\b.{0,30}\bco[2₂]\b.{0,30}\bstronger\b/,
  /\bbonds? (in|of) (co[2₂]|carbon dioxide)\b.{0,30}\bstronger\b/,
  /\b(same|a|one) (kind of )?bond\b.{0,40}\b(different|differs|varies|vary)\b.{0,30}\b(molecule|compound)/,
);
const AVERAGE_DE = any(
  together(AVG_DE, ROUGH_DE, 60),
  together(AVG_DE, MANY_DE, 40),
  /\bc=o\b.{0,30}\bco[2₂]\b.{0,30}stärker/,
  /bindung\w* (in|im) (co[2₂]|kohlenstoffdioxid)\b.{0,30}stärker/,
  /(gleiche|selbe|dieselbe) bindung\b.{0,40}(unterschiedlich|verschieden|anders)\w*.{0,30}(molekül|verbindung)/,
);

export const UNIT17: UnitContent = {
  n: 17,
  title: b('Bond energy and enthalpy', 'Bindungsenergie und Enthalpie'),
  lead: b('Where the energy of a reaction comes from: the bonds broken and the bonds made, what the sign of ΔH says, and how far a table of bond energies gets you.',
    'Woher die Energie einer Reaktion kommt: gespaltene und geknüpfte Bindungen, was das Vorzeichen von ΔH angibt und wie weit man mit einer Tabelle von Bindungsenthalpien kommt.'),

  puzzle: {
    title: b('Where does a flame get its energy?', 'Woher hat eine Flamme ihre Energie?'),
    lead: b('A gas cooker burns methane, the main part of natural gas. Burning breaks every bond in the methane and oxygen molecules and makes new bonds in carbon dioxide and water. Chemists have measured how much energy it takes to break each kind of bond.',
      'Ein Gasherd verbrennt Methan, den Hauptbestandteil von Erdgas. Bei der Verbrennung werden alle Bindungen in den Methan- und Sauerstoffmolekülen gespalten und neue Bindungen in Kohlenstoffdioxid und Wasser geknüpft. Wie viel Energie man braucht, um jede Art von Bindung zu spalten, ist gemessen.'),
    data: {
      caption: b('Average bond energies (energy needed to break one mole of each bond) and the measured energy change for burning one mole of methane; a minus sign means energy given out.',
        'Mittlere Bindungsenthalpien (Energie, die man braucht, um ein Mol der jeweiligen Bindung zu spalten) und die gemessene Energieänderung beim Verbrennen von einem Mol Methan; ein Minuszeichen bedeutet abgegebene Energie.'),
      head: [b('Bond or reaction', 'Bindung oder Reaktion'), b('Where', 'Wo'), b('kJ/mol', 'kJ/mol')],
      rows: [
        { cells: ['C–H', b('methane, CH₄ (4 per molecule)', 'Methan, CH₄ (4 pro Molekül)'), '415'] },
        { cells: ['O=O', b('oxygen, O₂', 'Sauerstoff, O₂'), '498'] },
        { cells: ['C=O', b('carbon dioxide, CO₂ (2 per molecule)', 'Kohlenstoffdioxid, CO₂ (2 pro Molekül)'), '741'] },
        { cells: ['O–H', b('water, H₂O (2 per molecule)', 'Wasser, H₂O (2 pro Molekül)'), '464'] },
        { cells: [b('burning methane (measured)', 'Verbrennung von Methan (gemessen)'), b('CH₄ + 2 O₂ → CO₂ + 2 H₂O (liquid)', 'CH₄ + 2 O₂ → CO₂ + 2 H₂O (flüssig)'), '−890.6'] },
      ],
      numeric: [2],
    },
    clash: b('Every bond energy in the list is energy you must put in, and burning breaks all the bonds in methane and oxygen. Yet the flame gives out 890 kJ for every mole of methane (16 g). Where does the flame\'s energy come from?',
      'Jede Bindungsenthalpie in der Liste ist Energie, die man hineinstecken muss, und bei der Verbrennung werden alle Bindungen in Methan und Sauerstoff gespalten. Trotzdem gibt die Flamme für jedes Mol Methan (16 g) 890 kJ ab. Woher kommt die Energie der Flamme?'),
    question: {
      id: 'u17-puzzle', unit: 17, kind: 'choice', format: 'predict', withConfidence: true, evidence: 'predict',
      concepts: ['u17.balance', 'u17.break-make'], targets: ['breaking-releases'],
      prompt: b('Your best guess:', 'Deine beste Vermutung:'),
      options: [
        { text: b('From breaking the bonds in methane and oxygen', 'Aus dem Spalten der Bindungen in Methan und Sauerstoff'), mis: 'breaking-releases' },
        { text: b('From the match: the flame passes its heat along', 'Vom Streichholz: Die Flamme gibt dessen Wärme weiter') },
        { text: b('From making the bonds in CO₂ and water, which are stronger', 'Aus dem Knüpfen der Bindungen in CO₂ und Wasser, die stärker sind'), correct: true },
        { text: b('Burning creates new energy that was not there before', 'Beim Verbrennen entsteht Energie, die vorher nicht da war') },
      ],
      explain: b('Breaking the bonds of CH₄ and 2 O₂ takes in about 4 × 415 + 2 × 498 = 2656 kJ. Making the bonds of CO₂ and 2 H₂O gives out more, about 2 × 741 + 4 × 464 = 3338 kJ: the new bonds are stronger, and the difference warms the surroundings. The match only gives the first push that breaks some bonds (unit 21); energy is never created. The measured value is larger than this table estimate: prediction 2 and the third example show why.',
        'Das Spalten der Bindungen von CH₄ und 2 O₂ kostet etwa 4 · 415 + 2 · 498 = 2656 kJ. Beim Knüpfen der Bindungen von CO₂ und 2 H₂O wird mehr frei, etwa 2 · 741 + 4 · 464 = 3338 kJ: Die neuen Bindungen sind stärker, und die Differenz erwärmt die Umgebung. Das Streichholz gibt nur den ersten Anstoß, der einige Bindungen spaltet (Einheit 21); Energie entsteht nie aus nichts. Der Messwert ist größer als diese Schätzung aus der Tabelle: Vorhersage 2 und das dritte Beispiel zeigen, warum.'),
    } as ChoiceItem,
    after: b('Next: break and make the bonds yourself in the Energy Landscape and watch where the energy goes.', 'Als Nächstes: Spalte und knüpfe die Bindungen selbst in der Energielandschaft und sieh, wohin die Energie geht.'),
  },

  explore: {
    title: b('The Energy Landscape', 'Die Energielandschaft'),
    intro: b('Here energy is height. The reactants start at 0. "Break the bonds" lifts them to the separated atoms: up means energy taken in (+), and the list gives each bond\'s [[bond-energy]]. "Make the new bonds" drops the atoms to the products: down means energy given out (−). What is left is the reaction\'s [[enthalpy]] change ΔH, in kJ per mole of the reaction as written (for H₂ + Cl₂ → 2 HCl: when 1 mol of H₂ reacts). The system is the reacting substances, the surroundings are everything else; "Measured" adds the value from experiments (gases at 25 °C, which the app treats as the same at other temperatures: a model).',
      'Hier ist Energie Höhe. Die Edukte starten bei 0. „Bindungen spalten“ hebt sie zu den getrennten Atomen: Nach oben bedeutet aufgenommene Energie (+), und die Liste gibt die [[bond-energy|Bindungsenthalpie]] jeder Bindung an (Bücher sagen „Bindungsenergie“ oder „Bindungsenthalpie“; in der Schule meinen beide denselben Wert). „Neue Bindungen knüpfen“ senkt die Atome zu den Produkten: Nach unten bedeutet abgegebene Energie (−). Was übrig bleibt, ist die Reaktionsenthalpie Δ_{r}H (die Änderung der [[enthalpy|Enthalpie]] H), in kJ pro Mol Formelumsatz (bei H₂ + Cl₂ → 2 HCl: wenn 1 mol H₂ reagiert). Das System sind die reagierenden Stoffe, die Umgebung ist alles andere; „Messwert“ zeigt den Wert aus Experimenten (Gase bei 25 °C; die App nimmt ihn bei anderen Temperaturen als gleich an: ein Modell).'),
    tasks: [
      { id: 'break', key: true, text: b('Pick a reaction and break its bonds. Which way do the atoms go, and what does the number beside the arrow tell you?', 'Wähle eine Reaktion und spalte ihre Bindungen. In welche Richtung gehen die Atome, und was gibt die Zahl am Pfeil an?') },
      { id: 'make', key: true, text: b('Now make the new bonds and read ΔH. Is more energy given out than was taken in?', 'Knüpfe jetzt die neuen Bindungen und lies ΔH ab. Wird mehr Energie abgegeben als aufgenommen?') },
      { id: 'compare', key: true, text: b('Show the measured value for two different reactions. How close is the estimate?', 'Lass dir für zwei verschiedene Reaktionen den Messwert zeigen. Wie nah liegt die Schätzung daran?') },
      { id: 'water', text: b('Burn hydrogen: 2 H₂ + O₂ → 2 H₂O (water vapour).', 'Verbrenne Wasserstoff: 2 H₂ + O₂ → 2 H₂O (Wasserdampf).') },
      { id: 'ammonia', text: b('Make ammonia from nitrogen and hydrogen.', 'Stelle Ammoniak aus Stickstoff und Wasserstoff her.') },
      { id: 'highest', challenge: true, text: b('Which reaction lifts its separated atoms highest above the reactants? Find it.', 'Bei welcher Reaktion liegen die getrennten Atome am höchsten über den Edukten? Finde sie.') },
    ],
    notes: {
      break: b('Up means energy taken in: each bond costs its bond energy, and nothing is given out yet. For H₂ + Cl₂: 436 + 243 = 679 kJ.',
        'Nach oben bedeutet aufgenommene Energie: Jede Bindung kostet ihre Bindungsenthalpie, abgegeben wird noch nichts. Bei H₂ + Cl₂: 436 + 243 = 679 kJ.'),
      make: b('Down means energy given out. ΔH ≈ bonds broken − bonds formed. Written out as in an exam, for H₂ + Cl₂: broken 436 + 243 = 679 kJ; formed 2 × 432 = 864 kJ; ΔH ≈ 679 − 864 = −185 kJ/mol. Answer: the reaction is exothermic, because forming the two H–Cl bonds gives out more energy than breaking H–H and Cl–Cl takes in.',
        'Nach unten bedeutet abgegebene Energie. ΔH ≈ gespaltene Bindungen − geknüpfte Bindungen. So schreibst du es in der Klausur, für H₂ + Cl₂: gespalten 436 + 243 = 679 kJ; geknüpft 2 · 432 = 864 kJ; ΔH ≈ 679 − 864 = −185 kJ/mol. Antwort: Die Reaktion ist exotherm, weil beim Knüpfen der beiden H–Cl-Bindungen mehr Energie frei wird, als das Spalten von H–H und Cl–Cl kostet.'),
      compare: b('Close, but not equal: for H₂ + Cl₂ almost exact (−185 against −184.6), for ethene and hydrogen 8 kJ off (−128 against −136.4). Table values are averages; the third example shows where that matters.',
        'Nah dran, aber nicht gleich: bei H₂ + Cl₂ fast genau (−185 gegenüber −184,6), bei Ethen und Wasserstoff 8 kJ daneben (−128 gegenüber −136,4). Tabellenwerte sind Mittelwerte; das dritte Beispiel zeigt, wo das eine Rolle spielt.'),
      water: b('1370 kJ in, 1856 kJ out: ΔH ≈ −486 kJ/mol. Measured for water vapour: −483.6.',
        '1370 kJ hinein, 1856 kJ heraus: ΔH ≈ −486 kJ/mol. Gemessen für Wasserdampf: −483,6.'),
      ammonia: b('2254 kJ in, 2340 kJ out: ΔH ≈ −86 kJ/mol (measured −91.8), only slightly exothermic. Most of the cost is the N≡N triple bond.',
        '2254 kJ hinein, 2340 kJ heraus: ΔH ≈ −86 kJ/mol (gemessen −91,8), nur schwach exotherm. Den größten Teil der Kosten macht die N≡N-Dreifachbindung aus.'),
      highest: b('Ammonia: 2254 kJ, and the N≡N triple bond alone costs 946. This very strong bond is one reason why the nitrogen in air reacts so reluctantly.',
        'Ammoniak: 2254 kJ, und die N≡N-Dreifachbindung allein kostet 946. Diese sehr starke Bindung ist ein Grund, warum der Stickstoff der Luft so schwer reagiert.'),
    },
    check: {
      id: 'u17-check', unit: 17, kind: 'choice', format: 'predict', withConfidence: true, evidence: 'predict',
      concepts: ['u17.sign', 'u17.diagram'], targets: ['dh-sign'],
      prompt: b('In the diagram for H₂ + Cl₂, the products end below the reactants. What does that tell you?', 'Im Diagramm für H₂ + Cl₂ enden die Produkte unterhalb der Edukte. Was sagt dir das?'),
      options: [
        { text: b('ΔH is negative, so the reaction took in energy', 'ΔH ist negativ, also hat die Reaktion Energie aufgenommen'), mis: 'dh-sign' },
        { text: b('ΔH is negative: energy went to the surroundings', 'ΔH ist negativ: Energie ging an die Umgebung'), correct: true },
        { text: b('ΔH is positive: the products hold less energy', 'ΔH ist positiv: Die Produkte enthalten weniger Energie') },
        { text: b('The bonds in the products are weaker', 'Die Bindungen in den Produkten sind schwächer') },
      ],
      explain: b('Lower means the system ended with less energy: the rest went to the surroundings, so ΔH = −185 kJ/mol and the reaction is exothermic. The products sit lower because their bonds are stronger, not weaker.',
        'Tiefer bedeutet, dass das System am Ende weniger Energie hat: Der Rest ging an die Umgebung, also ist ΔH = −185 kJ/mol und die Reaktion exotherm. Die Produkte liegen tiefer, weil ihre Bindungen stärker sind, nicht schwächer.'),
    } as ChoiceItem,
  },

  predictions: [
    {
      item: {
        id: 'u17-hf', unit: 17, kind: 'choice', format: 'predict', withConfidence: true, evidence: 'transfer',
        concepts: ['u17.estimate', 'u17.balance'], targets: ['breaking-releases'],
        prompt: b('Hydrogen and fluorine react: H₂ + F₂ → 2 HF. Average bond energies: H–H 436, F–F 160, H–F 569 kJ/mol. Estimate ΔH.',
          'Wasserstoff und Fluor reagieren: H₂ + F₂ → 2 HF. Mittlere Bindungsenthalpien: H–H 436, F–F 160, H–F 569 kJ/mol. Schätze ΔH ab.'),
        options: [
          { text: b('+542 kJ/mol', '+542 kJ/mol'), mis: 'breaking-releases' },
          { text: b('−160 kJ/mol', '−160 kJ/mol') },
          { text: b('+27 kJ/mol', '+27 kJ/mol') },
          { text: b('−542 kJ/mol', '−542 kJ/mol'), correct: true },
        ],
        explain: b('Breaking H–H and F–F takes in 436 + 160 = 596 kJ; forming two H–F bonds gives out 2 × 569 = 1138 kJ. ΔH ≈ 596 − 1138 = −542 kJ/mol. +542 has the sign the wrong way round, +27 forms only one H–F bond, and −160 counts only the F–F bond.',
          'Das Spalten von H–H und F–F kostet 436 + 160 = 596 kJ; beim Knüpfen von zwei H–F-Bindungen werden 2 · 569 = 1138 kJ frei. ΔH ≈ 596 − 1138 = −542 kJ/mol. Bei +542 ist das Vorzeichen vertauscht, +27 knüpft nur eine H–F-Bindung, und −160 berücksichtigt nur die F–F-Bindung.'),
      } as ChoiceItem,
      show: { engine: 'energy', reaction: 'hf', mode: 'bonds', stage: 'both' },
      revealText: b('About −542 kJ/mol; the measured value, from the enthalpy of formation of HF, is −546.6. The F–F bond is unusually weak and the H–F bond very strong, so far more is given out than taken in: hydrogen and fluorine react explosively.',
        'Etwa −542 kJ/mol; der Messwert, aus der Bildungsenthalpie von HF, ist −546,6. Die F–F-Bindung ist ungewöhnlich schwach und die H–F-Bindung sehr stark, also wird viel mehr abgegeben als aufgenommen: Wasserstoff und Fluor reagieren explosionsartig.'),
      extra: {
        title: b('Bonds in, bonds out', 'Bindungen hinein, Bindungen heraus'),
        steps: [
          b('Bonds broken: one H–H (436) and one F–F (160): 596 kJ taken in.', 'Gespaltene Bindungen: eine H–H (436) und eine F–F (160): 596 kJ aufgenommen.'),
          b('Bonds formed: two H–F, because 2 HF form: 2 × 569 = 1138 kJ given out.', 'Geknüpfte Bindungen: zwei H–F, weil 2 HF entstehen: 2 · 569 = 1138 kJ abgegeben.'),
          b('ΔH ≈ broken − formed = 596 − 1138 = −542 kJ/mol.', 'ΔH ≈ gespalten − geknüpft = 596 − 1138 = −542 kJ/mol.'),
          b('Answer: ΔH ≈ −542 kJ/mol; the reaction is exothermic because the two H–F bonds formed are stronger than the H–H and F–F bonds broken.', 'Antwort: ΔH ≈ −542 kJ/mol; die Reaktion ist exotherm, weil die beiden geknüpften H–F-Bindungen stärker sind als die gespaltenen H–H- und F–F-Bindungen.'),
        ],
      },
    },
    {
      item: {
        id: 'u17-liquid', unit: 17, kind: 'choice', format: 'predict', withConfidence: true, evidence: 'predict',
        concepts: ['u17.break-make', 'u17.diagram'], targets: ['breaking-releases'],
        prompt: b('Hydrogen burns: 2 H₂ + O₂ → 2 H₂O. Once the water ends up as vapour, once as liquid water (both at 25 °C). Which gives out more energy, and why?',
          'Wasserstoff verbrennt: 2 H₂ + O₂ → 2 H₂O. Einmal entsteht Wasserdampf, einmal flüssiges Wasser (beide bei 25 °C). Wobei wird mehr Energie abgegeben, und warum?'),
        options: [
          { text: b('Vapour: the hot gas carries more of the energy away', 'Wasserdampf: Das heiße Gas nimmt mehr von der Energie mit') },
          { text: b('Liquid: attractions form as the vapour condenses, giving out more', 'Flüssig: Beim Kondensieren entstehen Anziehungen, dabei wird mehr frei'), correct: true },
          { text: b('Both the same: the same bonds break and form in each', 'Beide gleich: Es werden jeweils dieselben Bindungen gespalten und geknüpft') },
          { text: b('Vapour: pulling the molecules into a liquid costs energy', 'Wasserdampf: Die Moleküle zur Flüssigkeit zusammenzubringen kostet Energie'), mis: 'breaking-releases' },
        ],
        explain: b('Liquid water: −571.7 kJ/mol against −483.6 for vapour. The same covalent bonds break and form, but then the water molecules attract each other into a liquid, and forming those attractions gives out energy too, 44.0 kJ per mole of water. Pulling molecules together never costs energy; pulling them apart (boiling) does.',
          'Flüssiges Wasser: −571,7 kJ/mol gegenüber −483,6 für Wasserdampf. Es werden dieselben Atombindungen gespalten und geknüpft, aber danach ziehen sich die Wassermoleküle zu einer Flüssigkeit zusammen, und beim Entstehen dieser Anziehungen wird ebenfalls Energie frei, 44,0 kJ pro Mol Wasser. Moleküle zusammenzubringen kostet nie Energie; sie zu trennen (Sieden) schon.'),
      } as ChoiceItem,
      show: { engine: 'energy', reaction: 'h2-burn-l', mode: 'hess', route: 'steps', steps: ['h2-burn-g', '-water-boil', '-water-boil'] },
      revealText: b('Liquid water: −571.7 kJ/mol. The diagram shows two routes: burning to vapour drops 483.6 kJ, then each of the 2 mol of vapour condenses and drops another 44.0 kJ, as hydrogen bonds form between the molecules (unit 10). Bond-energy tables only describe gases, so the bond picture gives the vapour value.',
        'Flüssiges Wasser: −571,7 kJ/mol. Das Diagramm zeigt zwei Wege: Die Verbrennung zu Wasserdampf führt 483,6 kJ nach unten, dann kondensiert jedes der 2 mol Wasserdampf und gibt weitere 44,0 kJ ab, weil sich Wasserstoffbrücken zwischen den Molekülen ausbilden (Einheit 10). Tabellen von Bindungsenthalpien beschreiben nur Gase, also liefert das Bindungsbild den Wert für Wasserdampf.'),
      extra: {
        title: b('Two steps down to liquid water', 'Zwei Stufen hinab zum flüssigen Wasser'),
        steps: [
          b('Burning to vapour: 2 H₂ + O₂ → 2 H₂O (gas) gives out about 484 kJ.', 'Verbrennung zu Wasserdampf: 2 H₂ + O₂ → 2 H₂O (gasförmig) gibt etwa 484 kJ ab.'),
          b('Condensing: each mole of vapour that turns liquid gives out 44 kJ (boiling it off again would cost the same 44 kJ).', 'Kondensieren: Jedes Mol Wasserdampf, das flüssig wird, gibt 44 kJ ab (es wieder zu verdampfen, kostet dieselben 44 kJ).'),
          b('Two moles condense: 2 × 44 = 88 kJ more.', 'Zwei Mol kondensieren: 2 · 44 = 88 kJ mehr.'),
          b('Answer: about 484 + 88 = 572 kJ in all (measured −571.7 kJ/mol), so burning to liquid water gives out more than burning to vapour (−483.6 kJ/mol).', 'Antwort: insgesamt etwa 484 + 88 = 572 kJ (gemessen −571,7 kJ/mol), also wird bei der Verbrennung zu flüssigem Wasser mehr abgegeben als zu Wasserdampf (−483,6 kJ/mol).'),
        ],
      },
    },
  ],

  examples: [
    {
      title: b('Hydrogen meets chlorine', 'Wasserstoff trifft Chlor'), tag: 'H–Cl',
      show: { engine: 'energy', reaction: 'hcl', mode: 'bonds', stage: 'both' },
      numbers: [
        { v: '679 kJ', label: b('taken in to break one H–H and one Cl–Cl (436 + 243)', 'aufgenommen, um eine H–H und eine Cl–Cl zu spalten (436 + 243)') },
        { v: '864 kJ', label: b('given out forming two H–Cl bonds (2 × 432)', 'abgegeben beim Knüpfen von zwei H–Cl-Bindungen (2 · 432)') },
        { v: '−185 kJ/mol', label: b('estimated ΔH, against −184.6 measured', 'geschätztes ΔH, gegenüber −184,6 gemessen') },
      ],
      body: b('Breaking takes in 679 kJ and forming the two H–Cl bonds gives out 864 kJ, so ΔH ≈ 679 − 864 = −185 kJ/mol: exothermic. The measured value is −184.6. The match is this good because all three bonds belong to two-atom molecules, so their table values were measured on exactly these molecules, not averaged over many.',
        'Das Spalten kostet 679 kJ, beim Knüpfen der beiden H–Cl-Bindungen werden 864 kJ frei, also ΔH ≈ 679 − 864 = −185 kJ/mol: exotherm. Der Messwert ist −184,6. Die Übereinstimmung ist so gut, weil alle drei Bindungen zu zweiatomigen Molekülen gehören: Ihre Tabellenwerte sind genau an diesen Molekülen gemessen, nicht über viele gemittelt.'),
      soWhat: b('A mixture of hydrogen and chlorine can explode when sunlight or a flash falls on it: light splits the first Cl₂ molecules, and the energy given out keeps the reaction going.',
        'Ein Gemisch aus Wasserstoff und Chlor (Chlorknallgas) kann explodieren, wenn Sonnenlicht oder ein Blitzlicht darauf fällt: Licht spaltet die ersten Cl₂-Moleküle, und die abgegebene Energie hält die Reaktion in Gang.'),
    },
    {
      title: b('A hand warmer', 'Ein Taschenwärmer'), tag: 'Fe',
      show: { engine: 'energy', reaction: 'fe-rust', mode: 'hess', route: 'direct' },
      numbers: [
        { v: '−1648.4 kJ', label: b('for 4 Fe + 3 O₂ → 2 Fe₂O₃ (one mole of this reaction)', 'für 4 Fe + 3 O₂ → 2 Fe₂O₃ (ein Mol Formelumsatz)') },
        { v: '−412 kJ', label: b('per mole of iron (55.85 g)', 'pro Mol Eisen (55,85 g)') },
        { v: '7.4 kJ', label: b('given out per gram of iron', 'abgegeben pro Gramm Eisen') },
      ],
      body: b('A disposable hand warmer holds iron powder that rusts quickly once air gets in. Energy flows from the system, iron and oxygen, to the surroundings, your hands: ΔH is negative, the reaction is [[exothermic]], and on the diagram the products sit far below the reactants. No bond table helps here, because iron and iron oxide are lattices, not molecules; the value is measured (taking the product as Fe₂O₃, a simplification of real rust).',
        'Ein Einweg-Taschenwärmer enthält Eisenpulver, das schnell rostet, sobald Luft hineinkommt. Energie fließt vom System, Eisen und Sauerstoff, an die Umgebung, deine Hände: ΔH ist negativ, die Reaktion ist [[exothermic|exotherm]], und im Energiediagramm liegen die Produkte weit unter den Edukten. Eine Tabelle von Bindungsenthalpien hilft hier nicht, denn Eisen und Eisenoxid sind Gitter, keine Moleküle; der Wert ist gemessen (mit Fe₂O₃ als Produkt, eine Vereinfachung des echten Rosts).'),
      soWhat: b('Instant cold packs work the other way round: dissolving ammonium nitrate takes in energy from the surroundings, so ΔH > 0 and the process is [[endothermic]]. Unit 19 explains why it still runs by itself.',
        'Kältekompressen funktionieren umgekehrt: Das Lösen von Ammoniumnitrat nimmt Energie aus der Umgebung auf, also ist ΔH > 0 und der Vorgang [[endothermic|endotherm]]. Einheit 19 erklärt, warum er trotzdem von selbst abläuft.'),
    },
    {
      title: b('Where the model breaks: methane', 'Wo das Modell an Grenzen stößt: Methan'), tag: 'CH4',
      show: { engine: 'energy', reaction: 'ch4', mode: 'bonds', stage: 'both' },
      numbers: [
        { v: '−682 kJ/mol', label: b('estimated with average bond energies', 'geschätzt mit mittleren Bindungsenthalpien') },
        { v: '−802.6 kJ/mol', label: b('measured, with water vapour as product', 'gemessen, mit Wasserdampf als Produkt') },
        { v: '805 kJ/mol', label: b('for each C=O bond in CO₂, against the average 741', 'für jede C=O-Bindung in CO₂, gegenüber dem Mittelwert 741') },
      ],
      body: b('A table of average bond energies gives an estimate, not a measurement. Its C=O value, 741 kJ/mol, is an average over many molecules, but each C=O bond in carbon dioxide takes about 805 kJ/mol to break; with that value the estimate becomes −810 kJ/mol, close to the measured −802.6. Bond energies also describe gases only: with liquid water as product the measured value is −890.6.',
        'Eine Tabelle mittlerer Bindungsenthalpien liefert eine Schätzung, keinen Messwert. Ihr C=O-Wert, 741 kJ/mol, ist ein Mittelwert über viele Moleküle, aber jede C=O-Bindung in Kohlenstoffdioxid braucht etwa 805 kJ/mol zum Spalten; mit diesem Wert wird die Schätzung −810 kJ/mol, nah am gemessenen −802,6. Außerdem beschreiben Bindungsenthalpien nur Gase: Mit flüssigem Wasser als Produkt ist der Messwert −890,6.'),
      soWhat: b('In an exam you may still be asked to estimate ΔH from average bond energies: do it, and add that the result is approximate because table values are averages.',
        'In der Klausur sollst du ΔH trotzdem oft aus mittleren Bindungsenthalpien abschätzen: Tu das, und schreib dazu, dass das Ergebnis nur ein Näherungswert ist, weil die Tabellenwerte Mittelwerte sind.'),
    },
  ],

  flaw: {
    id: 'u17-flaw', unit: 17, kind: 'flaw', format: 'flaw', evidence: 'transfer', concepts: ['u17.break-make', 'u17.estimate'], targets: ['breaking-releases'],
    prompt: b('Where does this reasoning first go wrong?', 'Wo geht diese Überlegung zum ersten Mal schief?'),
    lines: [
      b('In CH₄ + Cl₂ → CH₃Cl + HCl, one C–H bond and the Cl–Cl bond break: 415 + 243 = 658 kJ taken in.', 'Bei CH₄ + Cl₂ → CH₃Cl + HCl werden eine C–H-Bindung und die Cl–Cl-Bindung gespalten: 415 + 243 = 658 kJ aufgenommen.'),
      b('One C–Cl and one H–Cl bond form, and making them takes in energy too: 330 + 432 = 762 kJ.', 'Eine C–Cl- und eine H–Cl-Bindung werden geknüpft, und auch das nimmt Energie auf: 330 + 432 = 762 kJ.'),
      b('So ΔH ≈ 658 + 762 = +1420 kJ/mol.', 'Also ΔH ≈ 658 + 762 = +1420 kJ/mol.'),
      b('A positive ΔH means energy is taken in from the surroundings, so the reaction is strongly endothermic.', 'Ein positives ΔH bedeutet, dass Energie aus der Umgebung aufgenommen wird, also ist die Reaktion stark endotherm.'),
    ],
    flaw: 1,
    alsoFalse: [2, 3],
    near: [{ step: 0, note: b('This one is true: breaking bonds always costs energy. Look at what happens when the new bonds form.', 'Dieser Schritt stimmt: Bindungen zu spalten kostet immer Energie. Schau dir an, was beim Knüpfen der neuen Bindungen passiert.') }],
    explain: b('Step 2 is the first wrong step. Step 1 is right: breaking C–H and Cl–Cl takes in 658 kJ. Step 2 is wrong: forming bonds gives out energy, 762 kJ. So step 3 should read ΔH ≈ 658 − 762 = −104 kJ/mol, and the rule in step 4 is right but now gives the opposite answer: ΔH < 0, exothermic (measured −99.6 kJ/mol).',
      'Schritt 2 ist der erste falsche Schritt. Schritt 1 stimmt: Das Spalten von C–H und Cl–Cl kostet 658 kJ. Schritt 2 ist falsch: Beim Knüpfen von Bindungen wird Energie frei, 762 kJ. Schritt 3 müsste also ΔH ≈ 658 − 762 = −104 kJ/mol lauten, und die Regel in Schritt 4 stimmt, liefert dann aber das Gegenteil: ΔH < 0, exotherm (gemessen −99,6 kJ/mol).'),
  } as FlawItem,

  deeper: {
    id: 'u17-deeper', unit: 17, kind: 'estimate', format: 'estimate', evidence: 'transfer', concepts: ['u17.estimate', 'u17.balance'], targets: ['breaking-releases'],
    prompt: b('Ethene reacts with chlorine: CH₂=CH₂ + Cl–Cl → CH₂Cl–CH₂Cl. Average bond energies (kJ/mol): C=C 611, C–C 345, C–H 415, Cl–Cl 243, C–Cl 330. Estimate ΔH.',
      'Ethen reagiert mit Chlor: CH₂=CH₂ + Cl–Cl → CH₂Cl–CH₂Cl. Mittlere Bindungsenthalpien (kJ/mol): C=C 611, C–C 345, C–H 415, Cl–Cl 243, C–Cl 330. Schätze ΔH ab.'),
    min: -500, max: 500, step: 1, answer: -151, tolerance: 6, suffix: ' kJ/mol',
    near: [
      { value: 151, tol: 6, note: b('The size is right, the sign is not: more energy is given out forming the new bonds than taken in breaking the old ones, so ΔH is negative.', 'Der Betrag stimmt, das Vorzeichen nicht: Beim Knüpfen wird mehr Energie frei, als das Spalten kostet, also ist ΔH negativ.') },
      { value: 194, tol: 6, note: b('The double bond does not just vanish: it becomes a C–C single bond, and forming that gives out 345.', 'Die Doppelbindung verschwindet nicht einfach: Aus ihr wird eine C–C-Einfachbindung, und beim Knüpfen werden 345 frei.') },
      { value: 179, tol: 6, note: b('Each carbon atom gets one chlorine atom: two C–Cl bonds form.', 'Jedes Kohlenstoffatom bekommt ein Chloratom: Es werden zwei C–Cl-Bindungen geknüpft.') },
      { value: -417, tol: 6, note: b('The C=C double bond changes too: it breaks (611) and a C–C single bond forms (345).', 'Auch die C=C-Doppelbindung ändert sich: Sie wird gespalten (611), und eine C–C-Einfachbindung wird geknüpft (345).') },
    ],
    explain: b('Only some bonds change: C=C becomes C–C, Cl–Cl breaks and two C–Cl bonds form; the four C–H bonds stay as they are. Broken: 611 + 243 = 854 kJ; formed: 345 + 2 × 330 = 1005 kJ. ΔH ≈ 854 − 1005 = −151 kJ/mol: exothermic.',
      'Nur einige Bindungen ändern sich: Aus C=C wird C–C, Cl–Cl wird gespalten, und zwei C–Cl-Bindungen werden geknüpft; die vier C–H-Bindungen bleiben, wie sie sind. Gespalten: 611 + 243 = 854 kJ; geknüpft: 345 + 2 · 330 = 1005 kJ. ΔH ≈ 854 − 1005 = −151 kJ/mol: exotherm.'),
  } as EstimateItem,

  explain: {
    prompt: b('In your own words: where does the energy of a reaction come from, how do you estimate ΔH from bond energies, what does its sign tell you, and why is the estimate only approximate?',
      'In eigenen Worten: Woher kommt die Energie einer Reaktion, wie schätzt man ΔH aus Bindungsenthalpien ab, was gibt das Vorzeichen an, und warum ist die Schätzung nur ein Näherungswert?'),
    ideas: [
      { id: 'cost', concept: 'u17.break-make', idea: b('Breaking bonds costs energy; making bonds releases it', 'Bindungen zu spalten kostet Energie; beim Knüpfen von Bindungen wird Energie frei'), contra: BREAKING_RELEASES,
        en: any(together(BREAK_EN, COST_EN), together(MAKE_EN, RELEASE_EN)),
        de: any(together(BREAK_DE, COST_DE), together(MAKE_DE, RELEASE_DE)) },
      { id: 'stronger', concept: 'u17.balance', idea: b('A reaction gives out energy when the new bonds are stronger than the old ones', 'Eine Reaktion gibt Energie ab, wenn die neuen Bindungen stärker sind als die alten'), contra: BREAKING_RELEASES,
        en: STRONGER_EN, de: STRONGER_DE },
      { id: 'sign', concept: 'u17.sign', idea: b('Exothermic: ΔH < 0, energy goes to the surroundings; endothermic: ΔH > 0', 'Exotherm: ΔH < 0, Energie geht an die Umgebung; endotherm: ΔH > 0'), contra: DH_SIGN,
        en: any(together(/exotherm\w*/, NEG_EN, 40), together(/endotherm\w*/, POS_EN, 40), together(NEG_EN, OUT_EN, 40), together(POS_EN, IN_EN, 40)),
        de: any(together(/exotherm\w*/, NEG_DE, 40), together(/endotherm\w*/, POS_DE, 40), together(NEG_DE, OUT_DE, 40), together(POS_DE, IN_DE, 40)) },
      { id: 'estimate', concept: 'u17.estimate', idea: b('ΔH ≈ energy of the bonds broken − energy of the bonds formed', 'ΔH ≈ Energie der gespaltenen Bindungen − Energie der geknüpften Bindungen'), contra: FORMED_MINUS_BROKEN,
        en: ESTIMATE_EN, de: ESTIMATE_DE },
      { id: 'average', concept: 'u17.average', idea: b('Table values are averages over many molecules, so estimates differ from measured values', 'Tabellenwerte sind Mittelwerte über viele Moleküle, deshalb weichen Schätzwerte von Messwerten ab'),
        en: AVERAGE_EN, de: AVERAGE_DE },
    ] as Idea[],
    tightened: b('Breaking bonds always costs energy, and making bonds gives it out. A reaction gives out energy when the bonds it forms are stronger than the bonds it breaks, so more energy is given out than taken in. Then ΔH is negative and the reaction is exothermic: energy goes to the surroundings; when ΔH is positive, the reaction is endothermic. You estimate ΔH ≈ energy of the bonds broken − energy of the bonds formed, but table values are averages over many molecules, so the estimate differs from the measured value, by about 120 kJ/mol for burning methane.',
      'Bindungen zu spalten kostet immer Energie, beim Knüpfen von Bindungen wird Energie frei. Eine Reaktion gibt Energie ab, wenn die neu geknüpften Bindungen stärker sind als die gespaltenen, sodass mehr Energie frei wird als aufgenommen. Dann ist ΔH negativ, die Reaktion ist exotherm: Energie geht an die Umgebung; ist ΔH positiv, ist die Reaktion endotherm. Man schätzt ΔH ≈ Energie der gespaltenen Bindungen − Energie der geknüpften Bindungen ab, aber die Tabellenwerte sind Mittelwerte über viele Moleküle, deshalb weicht die Schätzung vom Messwert ab, bei der Verbrennung von Methan um etwa 120 kJ/mol.'),
  },

  terms: ['enthalpy', 'exothermic', 'endothermic', 'bond-energy'],

  readings: [
    {
      lang: 'en', kind: 'quick',
      title: b('Chemical Bond Energies', 'Chemical Bond Energies'), source: 'Study Mind, GCSE Chemistry notes',
      url: 'https://studymind.co.uk/notes/chemical-bond-energies/',
      lookFor: [
        b('Its rule for the overall energy change: which total comes first, the bonds broken or the bonds formed? Compare with ΔH ≈ broken − formed.', ''),
        b('Its ammonia example uses N≡N 941 and N–H 391, where the Energy Landscape uses 946 and 390. What answer does it get, and how close is that to the −86 kJ/mol you found?', ''),
        b('What sign does it give an exothermic reaction? Check it against H₂ + Cl₂ (−185 kJ/mol).', ''),
      ],
    },
    {
      lang: 'en', kind: 'deeper',
      title: b('Strengths of Ionic and Covalent Bonds', 'Strengths of Ionic and Covalent Bonds'), source: 'OpenStax Chemistry 2e, section 7.5',
      url: 'https://openstax.org/books/chemistry-2e/pages/7-5-strengths-of-ionic-and-covalent-bonds',
      lookFor: [
        b('Its H₂ + Cl₂ calculation: does it also get −185 kJ, and which measured value does it compare it with?', ''),
        b('Example 7.9, methanol from CO and H₂: how far apart are the bond-energy estimate and the value from enthalpies of formation? Compare with the methane example.', ''),
        b('What does it say the 415 kJ/mol for C–H is: the energy of any one bond, or an average?', ''),
      ],
    },
    {
      lang: 'de', kind: 'deeper',
      title: b('Bindungsenergie (Bindungsdissoziationsenergie)', 'Bindungsenergie (Bindungsdissoziationsenergie)'), source: 'u-helmich.de, Chemie-Lexikon',
      url: 'https://u-helmich.de/che/lexikon/B/Bindungsenergie.html',
      lookFor: [
        b('', 'Das Beispiel Ethan + Chlor: 655 kJ/mol für die gespaltenen und 770 kJ/mol für die geknüpften Bindungen. Welches Vorzeichen bekommt ΔH, und passt das zu „gespalten − geknüpft“?'),
        b('', 'Welche anderen Namen nennt die Seite für die Bindungsenergie? Vergleiche mit „Bindungsenthalpie“ in dieser Einheit.'),
        b('', 'Was macht laut der Seite eine Bindung stärker? Prüfe es an N≡N (946 kJ/mol) gegenüber H–H (436 kJ/mol).'),
      ],
    },
  ],

  misconceptions: [
    { id: 'breaking-releases', name: b('Breaking bonds releases energy', 'Beim Spalten von Bindungen wird Energie frei') },
    { id: 'dh-sign', name: b('A negative ΔH means the reaction takes in energy', 'Ein negatives ΔH bedeutet, dass die Reaktion Energie aufnimmt') },
  ],

  glossary: {
    enthalpy: {
      en: 'enthalpy', de: 'Enthalpie', unit: 17,
      def: { en: 'H, the energy measure chemists use for reactions at constant pressure. Its change ΔH is the energy a reaction exchanges with the surroundings as heat, in kJ per mole of the reaction as written: negative when energy goes out.', de: 'H, das Energiemaß für Reaktionen bei konstantem Druck. Ihre Änderung, die Reaktionsenthalpie Δ_{r}H, ist die Energie, die eine Reaktion als Wärme mit der Umgebung austauscht, in kJ pro Mol Formelumsatz: negativ, wenn Energie abgegeben wird.' },
      falseFriend: { en: 'German books write Δ_{r}H (Reaktionsenthalpie) and say "pro Mol Formelumsatz" for "per mole of the reaction as written".', de: 'Englische Bücher schreiben meist nur ΔH („enthalpy change“).' },
    },
    exothermic: {
      en: 'exothermic', de: 'exotherm', unit: 17,
      def: { en: 'Giving out energy as heat to the surroundings: ΔH < 0. On an energy diagram the products sit below the reactants.', de: 'Gibt Energie als Wärme an die Umgebung ab: ΔH < 0. Im Energiediagramm liegen die Produkte unter den Edukten.' },
    },
    endothermic: {
      en: 'endothermic', de: 'endotherm', unit: 17,
      def: { en: 'Taking in energy as heat from the surroundings: ΔH > 0. On an energy diagram the products sit above the reactants.', de: 'Nimmt Energie als Wärme aus der Umgebung auf: ΔH > 0. Im Energiediagramm liegen die Produkte über den Edukten.' },
    },
  },
};
