// Unit 18 — Hess's law, in the Energy Landscape (hess mode).
// Numbers with dH() in thermo.ts (ΔfH from OpenStax Chemistry 2e, Appendix G; calcite CRC), kJ/mol:
// c-co2 −393.51; co-co2 −282.99 (×2: co-co2-x2 −566.0); c-co −110.52 (−393.5 + 283.0 = −110.5; added: −676.5);
// diamond-burn −395.40, diamond-graphite −1.89; caco3 +179.19 (−634.9 − 393.5 = −1028.4; −1028.4 + 1207.6 = +179.2);
// nh3 −91.8; lime-slake −64.47 (−634.9 − 285.8 = −920.7; −985.2 + 920.7 = −64.5; all added −1905.9; water left out
// −350.3); ethene-h2 −136.40 (ΔfH C2H4 +52.4, C2H6 −84.0); thermite −851.8 (−1676 + 824.2); ch4-burn-g −802.55,
// ch4-burn −890.57, water-boil +44.01 (−802.6 + 2 × −44.0 = −890.6); so2-so3 −197.78 (2 × −395.7 = −791.4;
// 2 × −296.8 = −593.6; −791.4 + 593.6 = −197.8; with 498 for O₂: −95.6 and −695.8).
// Combustion enthalpies computed from the same ΔfH table (products CO₂(g) and H₂O(l)): ethene 2(−393.51) + 2(−285.83)
// − 52.4 = −1411.1; ethane 2(−393.51) + 3(−285.83) + 84.0 = −1560.5; hydrogen −285.8. Route: −1411.1 − 285.8 + 1560.5
// = −136.4 (all added −3257.4; hydrogen left out +149.4). Ethanol (deeper): c2h5oh-burn −1366.91; 2(−393.5) + 3(−285.8)
// = −1644.4; −1644.4 + 1366.9 = −277.5 against the table's −277.6 (rounding).
// Born–Haber cycle for NaCl, used to FIND the lattice energy, not to check it: the 787 kJ/mol in ions.ts is itself a
// Born–Haber value (Purdue), so a match with it would prove nothing. Inputs: measured ΔfH(NaCl) −411.2 (thermo.ts,
// OpenStax Appendix G); first ionisation energy of Na 495.8 (atoms.ts, 496); Cl atoms ½ × 243 = 121.5 (bonds.ts, 122);
// electron affinity of Cl 349 kJ per mole of atoms (unit03.ts, CRC 348.6); atomisation of Na +107 (LibreTexts, Ursinus
// CHEM322, "6.4.02 Born Haber Cycles", fetched 2026-10-26: Na +107, Na IE +496, Cl +122, EA −349, lattice −787, ΔfH −411;
// "It is impossible to measure the enthalpy change", "lattice enthalpies always have to be calculated"). The four known
// steps: 107 + 122 + 496 − 349 = +376; lattice (formation) = −411.2 − 376 = −787.2, which rounds to the unit 4 value 787.
// Other sources (fetched): "the combustion of carbon often produces both carbon monoxide and carbon dioxide" (Science
// Ready, "Hess's Law", scienceready.com.au/pages/hess-law); thermite rail welding, molten metal separated at about
// 2400 °C (IRFCA, "Thermit (Aluminothermic) Welding Method for Rail Joints", irfca.org/docs/thermit-welding.html; the
// reaction gives liquid iron, steel only with the alloying additives in the welding portion);
// condensing boilers condense the flue-gas vapour and get "around 11 % more thermal energy" from natural gas (Vaillant,
// "Non-condensing vs condensing technology"); 890.6 / 802.6 = 1.110 from thermo.ts agrees: the most there is to gain.
import type { Bi } from '../i18n';
import type { ChoiceItem, FlawItem, EstimateItem } from './items';
import type { Idea } from './unit06';
import type { UnitContent } from './unitTypes';

const b = (en: string, de: string): Bi => ({ en, de });
const src = (r: RegExp) => `(?:${r.source})`;
const any = (...rs: RegExp[]) => new RegExp(rs.map(src).join('|'));
const together = (a: RegExp, c: RegExp, gap = 60) => new RegExp(`${src(a)}.{0,${gap}}${src(c)}|${src(c)}.{0,${gap}}${src(a)}`);
/** A pattern that only matches a clause without a negation (and without the given extra stop words). */
const unless = (stop: string, r: RegExp) => new RegExp(`^(?!.*(${stop})).*${src(r)}`);

// ---------- explain-back patterns (text is lowercased: Δ → δ, Σ → σ, − → -) ----------
// Idea 1, path: ΔH depends only on the start and the end.
const PATH_EN = any(
  // Clauses split at "and", so "the start and the end" arrives as "… only on the start" + "the end …".
  /\b(depend\w*|rel(y|ies|ying) on|determined by)\b.{0,30}\b(only|just|solely|purely)\b.{0,30}\b(start\w*|beginning|initial|reactants|first|where it (starts|begins))\b/,
  /\b(only|just|solely)\b.{0,10}\b(depend\w*|determined)\b.{0,30}\b(start\w*|beginning|initial|reactants)\b/,
  /\b(only|just|solely)\b.{0,15}\b(start\w*|beginning|initial|reactants)\b.{0,40}\b(matter|count|decide|determine)\w*/,
  /\b(end|final|finish)( states?| points?)? (matters?|counts?|decides?)\b/,
  /\b(independent of|regardless of|irrespective of|whatever|whichever|no matter|doesn't matter|does not matter)\b.{0,25}\b(route|path|way|steps|intermediate\w*|how)\b/,
  /\b(path|route)[- ]independen\w*/,
  /\bstate (function|variable|quantit\w*)\b/,
  /\b(any|every|each|all|both|different|either|whichever|whatever) (routes?|paths?|ways?)\b.{0,50}\b(same|equal|identical)\b/,
  /\b(same|equal|identical)\b.{0,40}\b(whichever|whatever|any|every|each|either|both|all) (routes?|paths?|ways?)\b/,
  /\b(steps|routes?|paths?)\b.{0,30}\badd\w* up to the same\b/,
  /\b(however|whichever way|whatever way|no matter how) (you|it|we) (get there|go|get from)\b/,
  /\bhowever (you|it|we) (get|go|goes|gets)\b.{0,50}\b(same|equal)\b|\b(same|equal)\b.{0,40}\bhowever (you|it|we) (get|go|goes|gets)\b/,
  /\b(does not depend on|doesn't depend on|do not depend on|don't depend on) (the )?(route|path|way|steps)\b/,
  // Plain wording: "it only matters where you start and where you end up, not how you get there".
  /\b(only|just)\b.{0,12}\b(matters?|counts?)\b.{0,30}\b(start\w*|begin\w*|beginning|initial|reactants|what you (start|begin) with)\b/,
  /\b(all that|what|the only thing that) (matters?|counts?)\b.{0,25}\b(start\w*|begin\w*|beginning|initial|reactants|end\w*|final|finish\w*)\b/,
  /\b(depend\w*|determined|decided|set|fixed)( on| by)? (just |only )?where (you|it|things?|the reaction) (start\w*|begin\w*)\b/,
  /\bwhere (you|it|things?|the reaction) (start\w*|begin\w*)\b.{0,30}\bwhere (you|it|things?|the reaction) (end\w*|finish\w*|stop\w*|arrive\w*|get to)\b/,
  /\bnot how (you|it|we|the reaction) (get|gets|got|go|goes|reach\w*|arrive\w*)\b/,
  /\b(doesn't matter|does not matter|doesn't make a difference|does not make a difference|never mind) (how|which way|what way)\b/,
  /\b(route|path|way|how you get there)\b.{0,20}\b(doesn't change|does not change|doesn't affect|does not affect|makes no difference to|make no difference to|has no effect on|have no effect on|has no influence on)\b.{0,25}\b(answer|result|total|value|δh|dh|enthalpy|energy|outcome|sum|heat)\b/,
  /\b(route|path|way|how you get there)\b.{0,20}\b(doesn't matter|does not matter|isn't important|is not important|is irrelevant|are irrelevant)\b/,
);
const PATH_DE = any(
  /(hängt|hängen|abhängig|bestimmt)\b.{0,40}\b(nur|lediglich|allein|ausschließlich)\b.{0,40}(anfang\w*|start\w*|ausgang\w*|edukt\w*|beginn\w*)/,
  /^(nur|lediglich|allein|ausschließlich) (der |die |das |vom |von )?(anfang\w*|start\w*|ausgang\w*)/,
  /(end\w*zustand\w*|endpunkt\w*|\bende) (zählt|zählen|entscheid\w*|bestimm\w*|ist entscheidend|sind entscheidend)/,
  /(unabhängig vo[mn]|egal,? (auf )?welche\w*|gleichgültig,? (auf )?welche\w*|ganz gleich,? (auf )?welche\w*).{0,25}(weg\w*|route|reaktionsweg\w*|zwischenschritt\w*|teilschritt\w*|schritte?\b)/,
  /(wegunabhängig\w*|zustandsgröße\w*|zustandsfunktion\w*)/,
  /(jede\w*|alle\w*|beide\w*|verschiedene\w*|unterschiedliche\w*) (wege?|routen?|reaktionswege?)\b.{0,50}(gleich\w*|dasselbe|derselbe|denselben|demselben|identisch\w*)/,
  /(gleich\w*|dasselbe|derselbe|denselben|identisch\w*)\b.{0,40}(egal|jede\w*|alle\w*|beide\w*) (wege?|routen?|reaktionswege?)/,
  /(hängt nicht vom (reaktions)?weg|hängt nicht von dem (reaktions)?weg|nicht vom (reaktions)?weg abhängig|nicht vom weg ab)/,
  // Plain wording: "es kommt nur darauf an, wo man anfängt und wo man ankommt; egal, wie man dahin kommt".
  /\bwo (man|es|die reaktion) (anfängt|startet|beginnt|losgeht)\b/,
  /kommt (es )?(nur|allein|lediglich|ausschließlich) auf (den |die |das )?(anfang\w*|start\w*|ausgang\w*)/,
  /(zählt|zählen|entscheidet|entscheiden|ist entscheidend|sind entscheidend) (nur|allein|lediglich|ausschließlich) (der |die |das |den )?(anfang\w*|start\w*|ausgang\w*)/,
  /nur darauf an,? (wo|womit|was)\b.{0,30}(anfängt|anfang|startet|start|beginnt|losgeht|hat)/,
  /(egal|gleichgültig|unwichtig),? (wie|auf welchem weg|welchen weg) (man|es|die reaktion) (dahin|dorthin|zum ziel|ans ziel|hin|ankommt|gelangt)/,
  /(weg|route|zwischenschritt\w*|umweg\w*)\b.{0,25}(spielt|spielen) keine rolle/,
  /(weg|route|zwischenschritt\w*|umweg\w*)\b.{0,25}(ist|sind) (egal|unwichtig|gleichgültig|irrelevant|nicht wichtig)/,
  /(weg|route)\b.{0,15}(ändert|verändert|beeinflusst) (nichts am ergebnis|nichts am wert|das ergebnis nicht|den wert nicht)/,
);
const PATH_DEPENDENT = {
  en: unless(String.raw`\bnot\b|n't|\bno\b|\bnever\b|\bonly\b|\bjust\b|independen|regardless|whatever|whichever|matter`,
    /\b(δh|dh|delta h|enthalp\w*|energy|heat|it|the value|the answer|the result)\b.{0,30}\b(depends?|varies|changes|differs)\b.{0,15}\bon (the |which )?(route|path|way|steps|how)\b|\b(different|other|longer|shorter) (routes?|paths?|ways?)\b.{0,30}\b(gives?|leads? to|means?)\b.{0,15}\b(different|other|more|less)\b/),
  de: unless(String.raw`nicht|kein|\bnur\b|lediglich|unabhängig|egal|gleichgültig`,
    /(hängt|hängen|abhängig)\b.{0,30}(vom|von dem|von der) (reaktions)?(weg|route|zwischenschritt\w*)|(ander\w*|verschieden\w*|unterschiedlich\w*|länger\w*|kürzer\w*) (wege?|routen?|reaktionswege?)\b.{0,30}(ander\w*|verschieden\w*|unterschiedlich\w*|mehr|weniger)/),
};

// Idea 2, reverse: turning a step round flips the sign of its ΔH.
const REV_EN = /(revers\w*|backwards?|turn\w* (it |them |the \w+ |a \w+ )?(round|around)|flip\w* (the |a |it )?(step|reaction|equation|card)?|opposite direction|other direction|other way( round| around)?|run\w* (it |the \w+ )?(backwards|in reverse)|in reverse|the opposite way|the wrong way round|swap\w* (the )?(reactants|sides)|switch\w* (the )?(reactants|sides)|invert\w*|undo\w*)/;
const SIGN_EN = /(sign\w*( of (its |the )?(δh|dh|delta h|enthalpy( change)?|value))? (flips?|changes?|switch\w*|swaps?|revers\w*|turns?|is (flipped|changed|reversed|swapped|switched)|becomes (the )?opposite)|(chang|flipp?|switch|swapp?|revers)(e|es|ed|ing|s)? (the |its )?sign|opposite sign|other sign|(the )?minus (becomes|turns into|turns to|changes to|changes into|goes to) (a |the )?plus|(the )?plus (becomes|turns into|turns to|changes to|changes into|goes to) (a |the )?minus|negative (becomes|turns into|turns to|changes to) positive|positive (becomes|turns into|turns to|changes to) negative|- becomes \+|\+ becomes -|from - to \+|from \+ to -|from negative to positive|from positive to negative|multipl\w* (it |δh )?by -1|times -1|= ?- ?δh|= ?- ?dh|[×x*·] ?\(?-1|exothermic becomes endothermic|endothermic becomes exothermic|(same|equal) (size|value|number|amount|magnitude)\b.{0,25}\b(opposite|other|different) sign|takes? in (exactly |just )?(what|the same|as much|the energy) (it |the reaction |the forward \w+ )?(gave|gives|released|releases)( out)?)/;
// "Reverse a step and the sign of its ΔH flips" is split at "and" by the matcher, so the sign clause may stand alone.
const SIGN_ONLY_EN = /(\bsigns?( of (its |the )?(δh|dh|delta h|enthalpy( change)?|value|number))? (flips?|changes?|switch\w*|swaps?|revers\w*|turns?|is (flipped|changed|reversed|swapped|switched))\b|\b(chang|flipp?|switch|swapp?|revers)(e|es|ed|ing|s)? (the |its )?sign\b|\bopposite sign\b)/;
const SIGN_ONLY_DE = /(vorzeichen\w*( von δh| des δh| der reaktionsenthalpie| seines δh| ihres δh)? (wechsel\w*|änder\w*|dreh\w*|kehr\w*|vertausch\w*|umgekehrt|wird umgedreht)|(wechsel\w*|änder\w*|dreht|kehrt|vertauscht|umgedreht)\b.{0,25}vorzeichen|vorzeichenwechsel|vorzeichenumkehr|umgekehrte\w* vorzeichen|entgegengesetzte\w* vorzeichen)/;
const REV_DE = /(umkehr\w*|umgekehrt\w*|umgedreht\w*|umdreh\w*|rückwärts|rückreaktion\w*|gegenrichtung|gegenreaktion\w*|andere\w* richtung|kehrt? .{0,30}\bum\b|dreht? .{0,30}\bum\b|kehren .{0,30}\bum\b|drehen .{0,30}\bum\b)/;
const SIGN_DE = /(vorzeichen\w*( von δh| des δh| der reaktionsenthalpie)? (wechsel\w*|änder\w*|dreh\w*|kehr\w*|vertausch\w*|umgekehrt|wird umgedreht)|(wechsel\w*|änder\w*|dreht|kehrt|vertauscht|umgedreht)\b.{0,25}vorzeichen|vorzeichenwechsel|vorzeichenumkehr|anderes vorzeichen|umgekehrte\w* vorzeichen|entgegengesetzte\w* vorzeichen|aus minus wird plus|aus plus wird minus|aus - wird \+|aus \+ wird -|aus negativ wird positiv|aus positiv wird negativ|aus exotherm wird endotherm|aus endotherm wird exotherm|(plus|minus|positiv|negativ) wird (zu )?(minus|plus|negativ|positiv)|wird aus (minus|plus|negativ|positiv) (plus|minus|positiv|negativ)|mal ?\(?-1|[·*×] ?\(?-1|gleiche\w* betrag\b.{0,30}(ander\w*|umgekehrt\w*|entgegengesetzt\w*) vorzeichen)/;
const REVERSE_KEEPS = {
  en: unless(String.raw`\bnot\b|n't|\bno\b|\bnever\b|opposite|flips|chang|switch|swap`,
    /(revers\w*|backwards|turn\w* (it |them |the \w+ )?(round|around)|flipped (step|reaction|card))\b.{0,40}\b(keeps? (the |its )?(same )?sign|same sign|sign (stays|remains|is kept|is the same)|(stays|remains) (negative|positive|the same))/),
  de: unless(String.raw`nicht|kein|wechsel|änder|entgegengesetzt|vertausch`,
    /(umkehr\w*|umgekehrt\w*|umgedreht\w*|rückwärts|rückreaktion\w*)\b.{0,40}(behält|gleiche\w* vorzeichen|selbe\w* vorzeichen|vorzeichen bleibt|bleibt .{0,15}(vorzeichen|negativ|positiv|gleich))/),
};

// Idea 3, formation: elements in their standard state count zero.
const ELEM_EN = /\b(elements?|o[2₂]|h[2₂]|n[2₂]|cl[2₂]|graphite|oxygen gas)\b/;
const ZERO_EN = /(\bzero\b|(?<![\d.,])0(?![\d.,]?\d)|no enthalpy of formation|no formation enthalpy|no δfh|no δhf|no δ_fh|nothing)/;
const ELEM_DE = /(element\w*|o[2₂]|h[2₂]|n[2₂]|cl[2₂]|graphit\w*)/;
const ZERO_DE = /(\bnull\w*|(?<![\d.,])0(?![\d.,]?\d)|keine bildungsenthalpie|keine standardbildungsenthalpie|nicht mitgerechnet|nicht mitgezählt|zählen nicht mit|nichts)/;
const ELEMENTS_NONZERO = {
  en: unless(String.raw`\bnot\b|n't|\bno\b|\bnever\b|zero|(?<![\d.,])0(?![\d.,]?\d)`,
    /\b(elements?|o[2₂]|oxygen|h[2₂]|hydrogen)\b.{0,30}\b(has|have|needs?|must|count|counts|gets?|carr(y|ies))\b.{0,25}(enthalp\w* of formation|formation enthalp\w*|δfh|δhf|δ_fh|value|bond energy|bond enthalpy|498)/),
  de: unless(String.raw`nicht|kein|null|(?<![\d.,])0(?![\d.,]?\d)`,
    /(element\w*|o[2₂]|sauerstoff|wasserstoff)\b.{0,30}(haben|hat|braucht|brauchen|muss|müssen|zählt|zählen|bekommt|bekommen)\b.{0,30}(bildungsenthalpie\w*|wert\b|werte\b|bindungsenergie\w*|bindungsenthalpie\w*|mitgerechnet|mitrechnen|498)/),
};

// Idea 4, products minus reactants.
const MINUS = String.raw`(\s-\s?|\s?-\s|\)-|-σ|-\(|\bminus\b|\babzüglich\b)`;
const PR_EN = any(
  new RegExp(`\\bproducts?\\b.{0,30}${MINUS}.{0,45}\\breactants?\\b`),
  /\bsubtract\w* .{0,40}\breactants?\b.{0,30}\bfrom .{0,30}\bproducts?\b/,
  /\b(take|takes|taking)( away)? .{0,30}\breactants?\b.{0,20}\b(from|away from|off) .{0,30}\bproducts?\b/,
  /\bproducts?\b.{0,40}\b(take away|takes away|less|subtract\w*)\b.{0,40}\breactants?\b/,
  // Plain wording: "take the formation energy of what you make and take away that of what you started with".
  /\b(subtract\w*|take|takes|taking|deduct\w*|minus|less)( away| off)?\b.{0,40}\b(reactants?|starting (materials?|substances?|stuff|chemicals?)|what (you|we) (started|start|began|begin) with|what goes in|what you put in|what you had)\b/,
  /\b(products?|what (you|we) (make|get|end up with)|what comes out|the end|the final)\b.{0,40}\b(minus|take away|takes away|subtract\w*)\b.{0,40}\b(reactants?|start\w*|initial|what (you|we) (started|start|began|begin) with)\b/,
);
const PR_DE = any(
  new RegExp(`produkt\\w*.{0,30}${MINUS}.{0,45}(edukt\\w*|ausgangsstoff\\w*)`),
  /(edukt\w*|ausgangsstoff\w*).{0,40}(von|vom) .{0,40}produkt\w*.{0,30}(abzieh\w*|abgezogen|subtrahier\w*)/,
  /zieh\w* .{0,40}(edukt\w*|ausgangsstoff\w*).{0,40}(von|vom) .{0,40}produkt\w*.{0,20}\bab\b/,
  /(von|vom) .{0,20}produkt\w* .{0,20}zieh\w* .{0,30}(edukt\w*|ausgangsstoff\w*).{0,10}\bab\b/,
  /subtrahier\w* .{0,40}(edukt\w*|ausgangsstoff\w*).{0,30}(von|vom) .{0,30}produkt\w*/,
  /produkt\w*.{0,40}(abzüglich|weniger) .{0,40}(edukt\w*|ausgangsstoff\w*)/,
  // Plain wording: "man zieht die Werte der Ausgangsstoffe ab".
  /zieh\w* .{0,40}(edukt\w*|ausgangsstoff\w*|was man (am anfang|vorher|zu beginn|am start) (hat|hatte|einsetzt)).{0,25}\bab\b/,
  /(was (entsteht|herauskommt|rauskommt|man (herstellt|erhält|bekommt))|endstoff\w*).{0,40}(minus|abzüglich|weniger) .{0,40}(edukt\w*|ausgangsstoff\w*|was (man )?(am anfang|vorher|zu beginn|eingesetzt))/,
);

// Idea 5, unmeasurable: a cycle gives values nobody can measure directly.
const UNM_EN = /(cannot be measured|can't be measured|can not be measured|cannot measure|can't measure|could not measure|couldn't measure|not be measured|not measure|not directly measur\w*|not measurable|not possible to measure|cannot be determined|can't be determined|cannot directly|can't directly|impossible to measure|impossible to run|impossible to do|impossible to make|can't do in a lab|can't do in the lab|can't be done in a lab|can't be done in the lab|can't be done directly|can't do directly|can't run|can't be run|can't be tested|can't test|can't be found directly|couldn't do|hard to measure|difficult to measure|nobody can measure|no one can measure|unmeasurable|measur\w* indirectly|indirect\w*)/;
const CALC_EN = /(calculat\w*|work\w* out|find\w*|found|useful|\bused?\b|\buses\b|needs?\b|needed|helps?\b|helpful|\blets\b|allows?\b|good for|handy|for (reactions|values|steps|things|cases)|\bgets?\b|obtain\w*|deduc\w*|\bvia\b|\bfrom\b|\busing\b|\buse\b|hess|cycles?|routes?|other reactions|steps|add\w* up|combin\w*|born[- ]haber|lattice|carbon monoxide|\bco\b)/;
const UNM_DE = /(nicht direkt messen|nicht direkt messbar|nicht direkt gemessen|nicht direkt bestimm\w*|nicht direkt ermittel\w*|nicht messbar|nicht messen|nicht gemessen|nicht bestimmbar|nicht sauber|nicht durchführ\w*|unmöglich|umweg\w*|nur indirekt|nicht im labor|schwer (zu )?messen|schwer messbar|kaum messbar|unmessbar|indirekt\w*)/;
const CALC_DE = /(berechn\w*|ermittel\w*|bestimm\w*|brauch\w*|nützlich|hilft|verwend\w*|nutzt|benutz\w*|für reaktionen|dafür|errechn\w*|\büber\b|mithilfe|mit hilfe|hess|kreisprozess\w*|kreislauf\w*|umweg\w*|andere\w* reaktion\w*|teilschritt\w*|schritte\b|zusammensetz\w*|addier\w*|born-haber|gitterenergie|kohlenstoffmonoxid|\bco\b)/;

export const UNIT18: UnitContent = {
  n: 18,
  title: b('Hess\'s law', 'Der Satz von Hess'),
  lead: b('Why a reaction\'s ΔH depends only on where it starts and ends, how adding up steps gives values nobody can measure, and how enthalpies of formation make that quick.',
    'Warum das ΔH einer Reaktion nur von Anfang und Ende abhängt, wie man durch Addieren von Teilschritten Werte erhält, die niemand messen kann, und wie Standardbildungsenthalpien das abkürzen.'),

  puzzle: {
    title: b('The reaction nobody can run cleanly', 'Die Reaktion, die sich nicht sauber durchführen lässt'),
    lead: b('Carbon monoxide, CO, forms when carbon burns in too little oxygen. But carbon never burns to pure CO: some always burns on to carbon dioxide, so a calorimeter (the insulated vessel that measures a reaction\'s heat) measures a mixture of two reactions. Carbon and carbon monoxide can each be burned cleanly to CO₂ in plenty of oxygen, and those two values (their enthalpies of combustion, Δ_{c}H) are known.',
      'Kohlenstoffmonoxid, CO, entsteht, wenn Kohlenstoff bei Sauerstoffmangel verbrennt. Rein zu CO verbrennt Kohlenstoff aber nie: Ein Teil verbrennt immer weiter zu Kohlenstoffdioxid, also misst ein Kalorimeter (das isolierte Gefäß, das die Wärme einer Reaktion misst) ein Gemisch aus zwei Reaktionen. Kohlenstoff und Kohlenstoffmonoxid lassen sich dagegen mit viel Sauerstoff jeweils sauber zu CO₂ verbrennen, und diese beiden Werte (ihre molaren Verbrennungsenthalpien Δ_{c}H) sind bekannt.'),
    data: {
      caption: b('Enthalpy changes at 25 °C (carbon as graphite) in kJ per mole of the reaction as written; a minus sign means energy given out (OpenStax Chemistry 2e, Appendix G).',
        'Reaktionsenthalpien bei 25 °C (Kohlenstoff als Graphit) in kJ pro Mol, bezogen auf die Reaktionsgleichung, wie sie dasteht; ein Minuszeichen bedeutet abgegebene Energie (OpenStax Chemistry 2e, Anhang G).'),
      head: [b('Reaction', 'Reaktion'), b('Measurable?', 'Messbar?'), b('ΔH in kJ/mol', 'ΔH in kJ/mol')],
      rows: [
        { cells: ['C + O₂ → CO₂', b('yes', 'ja'), '−393.5'] },
        { cells: ['CO + ½ O₂ → CO₂', b('yes', 'ja'), '−283.0'] },
        { cells: ['C + ½ O₂ → CO', b('no: gives a CO/CO₂ mixture', 'nein: liefert ein CO/CO₂-Gemisch'), '?'], mystery: true },
      ],
      numeric: [2],
    },
    clash: b('Both measured reactions end with the same product, CO₂. One starts at carbon, the other halfway, at carbon monoxide. What is ΔH for C + ½ O₂ → CO?',
      'Beide gemessenen Reaktionen haben dasselbe Produkt, CO₂. Die eine startet beim Kohlenstoff, die andere auf halbem Weg, beim Kohlenstoffmonoxid. Wie groß ist ΔH für C + ½ O₂ → CO?'),
    question: {
      id: 'u18-puzzle', unit: 18, kind: 'choice', format: 'predict', withConfidence: true, evidence: 'predict',
      concepts: ['u18.path', 'u18.unmeasurable'], targets: ['reverse-keeps-sign', 'path-dependent'],
      prompt: b('Your best guess:', 'Deine beste Vermutung:'),
      options: [
        { text: b('−676.5 kJ/mol', '−676,5 kJ/mol'), mis: 'reverse-keeps-sign' },
        { text: b('−110.5 kJ/mol', '−110,5 kJ/mol'), correct: true },
        { text: b('+110.5 kJ/mol', '+110,5 kJ/mol') },
        { text: b('Unknown without measuring it directly', 'Ohne direkte Messung nicht herauszufinden'), mis: 'path-dependent' },
      ],
      explain: b('From carbon to CO₂, 393.5 kJ are given out by either route. Via CO, x is given out first and then 283.0, so x + (−283.0) = −393.5 and x = −393.5 + 283.0 = −110.5 kJ/mol. Adding both values (−676.5) runs the second reaction the wrong way: from CO₂ back to CO its sign flips to +283.0.',
        'Von Kohlenstoff zu CO₂ werden auf beiden Wegen 393,5 kJ abgegeben. Über CO wird zuerst x abgegeben und dann 283,0, also x + (−283,0) = −393,5 und x = −393,5 + 283,0 = −110,5 kJ/mol. Wer beide Werte addiert (−676,5), lässt die zweite Reaktion in die falsche Richtung laufen: Von CO₂ zurück zu CO wechselt ihr Vorzeichen zu +283,0.'),
    } as ChoiceItem,
    after: b('Next: build this route in the Energy Landscape and watch both ways end at the same level.', 'Als Nächstes: Baue diesen Weg in der Energielandschaft und sieh, wie beide Wege auf derselben Höhe enden.'),
  },

  explore: {
    title: b('Routes in the Energy Landscape', 'Wege in der Energielandschaft'),
    intro: b('The target reaction\'s ΔH starts as "?". Tap step cards to put them on a route. A card can be reversed (its equation turns round and the sign of ΔH flips) or scaled ×2 or ×½ (ΔH scales too). When every substance outside the target cancels, the route is complete and the cycle shows both ways. This is [[hess-law|Hess\'s law]]: enthalpy is a state function, so ΔH depends only on the start and the end. "Via the elements" puts the elements at 0 and each compound at its [[enthalpy-of-formation|enthalpy of formation]] Δ_{f}H° (values at 25 °C, which the app treats as the same at other temperatures: a model).',
      'Das ΔH der Zielreaktion steht zuerst auf „?“. Tippe Schrittkarten an, um sie auf einen Weg zu legen. Eine Karte lässt sich umkehren (die Gleichung dreht sich um, das Vorzeichen von ΔH wechselt) oder mit ×2 bzw. ×½ skalieren (ΔH ändert sich mit). Kürzt sich jeder Stoff heraus, der nicht in der Zielreaktion vorkommt, ist der Weg vollständig, und der Energiekreisprozess (kurz Kreisprozess) zeigt beide Wege. Das ist der [[hess-law|Satz von Hess]]: Die Enthalpie ist eine Zustandsgröße, hängt also nur vom Zustand ab, nicht vom Weg dorthin; deshalb hängt ΔH nur von Anfang und Ende ab. „Über die Elemente“ setzt die Elemente auf 0 und jede Verbindung auf ihre [[enthalpy-of-formation|Standardbildungsenthalpie]] Δ_{f}H° (Werte bei 25 °C; die App nimmt sie bei anderen Temperaturen als gleich an: ein Modell).'),
    tasks: [
      { id: 'co', key: true, text: b('Build a route for C + ½ O₂ → CO from the burning reactions. Which card has to be reversed?', 'Baue einen Weg für C + ½ O₂ → CO aus den Verbrennungsreaktionen. Welche Karte musst du umkehren?') },
      { id: 'flip', key: true, text: b('Reverse a step card. What happens to its equation and to the sign of ΔH?', 'Kehre eine Schrittkarte um. Was passiert mit ihrer Gleichung und mit dem Vorzeichen von ΔH?') },
      { id: 'elements', key: true, text: b('Open "Via the elements" for any reaction. Where do the elements sit, and where do the reactants and the products land?', 'Öffne „Über die Elemente“ für eine beliebige Reaktion. Wo liegen die Elemente, und wo landen Edukte und Produkte?') },
      { id: 'diamond', text: b('Build a route for diamond → graphite.', 'Baue einen Weg für Diamant → Graphit.') },
      { id: 'limestone', text: b('Open burning limestone, CaCO₃ → CaO + CO₂, via the elements.', 'Öffne das Kalkbrennen, CaCO₃ → CaO + CO₂, über die Elemente.') },
      { id: 'double', challenge: true, text: b('Build carbon monoxide a second way, with the whole-number card 2 CO + O₂ → 2 CO₂ instead of CO + ½ O₂ → CO₂. What must you do to that card so the route adds up?',
        'Baue Kohlenstoffmonoxid auf einem zweiten Weg, mit der Karte in ganzen Zahlen 2 CO + O₂ → 2 CO₂ statt CO + ½ O₂ → CO₂. Was musst du mit dieser Karte machen, damit der Weg aufgeht?') },
    ],
    notes: {
      co: b('C + O₂ → CO₂ (−393.5), then CO₂ → CO + ½ O₂ (reversed: +283.0). ΔH = −393.5 + 283.0 = −110.5 kJ/mol: forming CO from carbon gives out 110.5 kJ per mole, so it is exothermic.',
        'C + O₂ → CO₂ (−393,5), dann CO₂ → CO + ½ O₂ (umgekehrt: +283,0). ΔH = −393,5 + 283,0 = −110,5 kJ/mol: Bei der Bildung von CO aus Kohlenstoff werden 110,5 kJ pro Mol frei, die Reaktion ist also exotherm.'),
      flip: b('Backwards, a reaction takes in exactly what it gave out forwards: CO + ½ O₂ → CO₂ gives out 283.0 kJ, so CO₂ → CO + ½ O₂ takes in 283.0 kJ, ΔH = +283.0 kJ/mol.',
        'Rückwärts nimmt eine Reaktion genau das auf, was sie vorwärts abgegeben hat: CO + ½ O₂ → CO₂ gibt 283,0 kJ ab, also nimmt CO₂ → CO + ½ O₂ 283,0 kJ auf, ΔH = +283,0 kJ/mol.'),
      elements: b('Elements in their standard state (graphite, O₂, H₂, calcium metal) sit at 0 by definition. Each compound sits at its enthalpy of formation, and Δ_{r}H = sum of Δ_{f}H of the products − sum of Δ_{f}H of the reactants.',
        'Elemente in ihrem Standardzustand (Graphit, O₂, H₂, metallisches Calcium) liegen per Definition bei 0. Jede Verbindung liegt bei ihrer Standardbildungsenthalpie, und Δ_{r}H = Summe der Δ_{f}H der Produkte − Summe der Δ_{f}H der Edukte.'),
      diamond: b('Diamond burns: −395.4; graphite burns: −393.5. Diamond → CO₂ → graphite: −395.4 + 393.5 = −1.9 kJ/mol. Diamond sits 1.9 kJ/mol above graphite; unit 20 asks why it does not simply turn into graphite.',
        'Diamant verbrennt: −395,4; Graphit verbrennt: −393,5. Diamant → CO₂ → Graphit: −395,4 + 393,5 = −1,9 kJ/mol. Diamant liegt 1,9 kJ/mol über Graphit; Einheit 20 klärt, warum er trotzdem nicht einfach zu Graphit wird.'),
      limestone: b('Products: −634.9 + (−393.5) = −1028.4 kJ; reactant: −1207.6 kJ (calcite, CRC Handbook; other tables differ by under 1 kJ). Δ_{r}H = −1028.4 − (−1207.6) = +179.2 kJ/mol: endothermic, so a lime kiln has to be heated strongly.',
        'Produkte: −634,9 + (−393,5) = −1028,4 kJ; Edukt: −1207,6 kJ (Calcit, CRC Handbook; andere Tabellen weichen um weniger als 1 kJ ab). Δ_{r}H = −1028,4 − (−1207,6) = +179,2 kJ/mol: endotherm, deshalb muss ein Kalkofen stark beheizt werden.'),
      double: b('Reversed and halved: 2 CO₂ → 2 CO + O₂ takes in 566.0 kJ, and half of that is +283.0, the same as the other card reversed. Scaling a step scales its ΔH, because ΔH belongs to the equation as written.',
        'Umgekehrt und halbiert: 2 CO₂ → 2 CO + O₂ nimmt 566,0 kJ auf, die Hälfte davon ist +283,0, genauso viel wie die andere Karte umgekehrt. Skaliert man einen Schritt, skaliert sein ΔH mit, denn ΔH gilt für die Gleichung, wie sie dasteht.'),
    },
    check: {
      id: 'u18-check', unit: 18, kind: 'choice', format: 'predict', withConfidence: true, evidence: 'predict',
      concepts: ['u18.reverse', 'u18.scale'], targets: ['reverse-keeps-sign'],
      prompt: b('Making ammonia: N₂ + 3 H₂ → 2 NH₃, ΔH = −91.8 kJ/mol. What is ΔH for 2 NH₃ → N₂ + 3 H₂?', 'Ammoniaksynthese: N₂ + 3 H₂ → 2 NH₃, ΔH = −91,8 kJ/mol. Wie groß ist ΔH für 2 NH₃ → N₂ + 3 H₂?'),
      options: [
        { text: b('−91.8 kJ/mol', '−91,8 kJ/mol'), mis: 'reverse-keeps-sign' },
        { text: b('+45.9 kJ/mol', '+45,9 kJ/mol') },
        { text: b('+91.8 kJ/mol', '+91,8 kJ/mol'), correct: true },
        { text: b('−183.6 kJ/mol', '−183,6 kJ/mol') },
      ],
      explain: b('The equation is reversed, so the sign flips and the size stays: +91.8 kJ/mol. +45.9 would be right for one mole of NH₃ (the equation halved), and −91.8 keeps the old sign.',
        'Die Gleichung ist umgekehrt, also wechselt das Vorzeichen, und der Betrag bleibt: +91,8 kJ/mol. +45,9 wäre richtig für ein Mol NH₃ (die Gleichung halbiert), und −91,8 behält das alte Vorzeichen.'),
    } as ChoiceItem,
  },

  predictions: [
    {
      item: {
        id: 'u18-ethene', unit: 18, kind: 'choice', format: 'predict', withConfidence: true, evidence: 'transfer',
        concepts: ['u18.path', 'u18.reverse'], targets: ['reverse-keeps-sign'],
        prompt: b('Ethene takes up hydrogen: C₂H₄ + H₂ → C₂H₆. The three substances burn completely (to CO₂ and liquid water), with enthalpies of combustion Δ_{c}H of ethene −1411.1, hydrogen −285.8 and ethane −1560.5 kJ/mol. What is ΔH for the reaction?',
          'Ethen nimmt Wasserstoff auf: C₂H₄ + H₂ → C₂H₆. Die drei Stoffe verbrennen vollständig (zu CO₂ und flüssigem Wasser); ihre molaren Verbrennungsenthalpien Δ_{c}H sind für Ethen −1411,1, für Wasserstoff −285,8 und für Ethan −1560,5 kJ/mol. Wie groß ist ΔH für die Reaktion?'),
        options: [
          { text: b('+136.4 kJ/mol', '+136,4 kJ/mol') },
          { text: b('−3257.4 kJ/mol', '−3257,4 kJ/mol'), mis: 'reverse-keeps-sign' },
          { text: b('−136.4 kJ/mol', '−136,4 kJ/mol'), correct: true },
          { text: b('+149.4 kJ/mol', '+149,4 kJ/mol') },
        ],
        explain: b('Route: burn ethene and hydrogen (−1411.1 − 285.8 = −1696.9 kJ), then run the burning of ethane backwards so that ethane comes out (+1560.5). ΔH = −1696.9 + 1560.5 = −136.4 kJ/mol. −3257.4 keeps the sign of the reversed step, +136.4 has every sign the wrong way round, and +149.4 leaves out the hydrogen.',
          'Weg: Ethen und Wasserstoff verbrennen (−1411,1 − 285,8 = −1696,9 kJ), dann die Verbrennung von Ethan rückwärts laufen lassen, sodass Ethan herauskommt (+1560,5). ΔH = −1696,9 + 1560,5 = −136,4 kJ/mol. −3257,4 behält das Vorzeichen des umgekehrten Schritts, bei +136,4 sind alle Vorzeichen vertauscht, und +149,4 lässt den Wasserstoff weg.'),
      } as ChoiceItem,
      show: { engine: 'energy', reaction: 'ethene-h2', mode: 'hess', route: 'elements' },
      revealText: b('−136.4 kJ/mol. The diagram takes a third route, via the elements: ethene sits at +52.4, ethane at −84.0, so ΔH = −84.0 − 52.4 = −136.4 kJ/mol again. However you get from ethene and hydrogen to ethane, ΔH is the same.',
        '−136,4 kJ/mol. Das Diagramm nimmt einen dritten Weg, über die Elemente: Ethen liegt bei +52,4, Ethan bei −84,0, also ΔH = −84,0 − 52,4 = −136,4 kJ/mol, wieder derselbe Wert. Auf welchem Weg man auch von Ethen und Wasserstoff zu Ethan kommt: ΔH ist gleich.'),
      extra: {
        title: b('Burn, then un-burn', 'Verbrennen, dann rückwärts'),
        steps: [
          b('Plan the route: burn ethene and hydrogen, then run the burning of ethane backwards, so that ethane comes out at the end.', 'Plane den Weg: Ethen und Wasserstoff verbrennen, dann die Verbrennung von Ethan rückwärts laufen lassen, damit am Ende Ethan herauskommt.'),
          b('The two burning steps, forwards: −1411.1 + (−285.8) = −1696.9 kJ.', 'Die beiden Verbrennungen, vorwärts: −1411,1 + (−285,8) = −1696,9 kJ.'),
          b('The burning of ethane, reversed: the sign flips, +1560.5 kJ. CO₂, water and O₂ cancel.', 'Die Verbrennung von Ethan, umgekehrt: Das Vorzeichen wechselt, +1560,5 kJ. CO₂, Wasser und O₂ kürzen sich heraus.'),
          b('Answer: ΔH = −1696.9 + 1560.5 = −136.4 kJ/mol; adding hydrogen to ethene is exothermic.', 'Antwort: ΔH = −1696,9 + 1560,5 = −136,4 kJ/mol; die Anlagerung von Wasserstoff an Ethen ist exotherm.'),
        ],
      },
    },
    {
      item: {
        id: 'u18-lime', unit: 18, kind: 'choice', format: 'predict', withConfidence: true, evidence: 'predict',
        concepts: ['u18.products-reactants', 'u18.formation'], targets: ['reactants-added'],
        prompt: b('For lime mortar, quicklime is slaked with water: CaO + H₂O → Ca(OH)₂. Standard enthalpies of formation (kJ/mol): CaO −634.9, H₂O(l) −285.8, Ca(OH)₂ −985.2. What is ΔH?',
          'Für Kalkmörtel wird Branntkalk mit Wasser gelöscht: CaO + H₂O → Ca(OH)₂. Standardbildungsenthalpien (kJ/mol): CaO −634,9, H₂O(l) −285,8, Ca(OH)₂ −985,2. Wie groß ist ΔH?'),
        options: [
          { text: b('+64.5 kJ/mol', '+64,5 kJ/mol') },
          { text: b('−64.5 kJ/mol', '−64,5 kJ/mol'), correct: true },
          { text: b('−1905.9 kJ/mol', '−1905,9 kJ/mol'), mis: 'reactants-added' },
          { text: b('−350.3 kJ/mol', '−350,3 kJ/mol') },
        ],
        explain: b('Δ_{r}H = products − reactants = −985.2 − (−634.9 − 285.8) = −985.2 + 920.7 = −64.5 kJ/mol. +64.5 subtracts the wrong way round, −1905.9 adds the reactants instead of subtracting them, and −350.3 leaves out the water.',
          'Δ_{r}H = Produkte − Edukte = −985,2 − (−634,9 − 285,8) = −985,2 + 920,7 = −64,5 kJ/mol. +64,5 subtrahiert in der falschen Reihenfolge, −1905,9 addiert die Edukte, statt sie abzuziehen, und −350,3 lässt das Wasser weg.'),
      } as ChoiceItem,
      show: { engine: 'energy', reaction: 'lime-slake', mode: 'hess', route: 'elements' },
      revealText: b('−64.5 kJ/mol: slaking lime is exothermic, and the wet lime gets hot. In the diagram the elements sit at 0, the reactants at −634.9 + (−285.8) = −920.7 and the product at −985.2, another 64.5 kJ/mol lower.',
        '−64,5 kJ/mol: Kalklöschen ist exotherm, der nasse Kalk wird heiß. Im Diagramm liegen die Elemente bei 0, die Edukte bei −634,9 + (−285,8) = −920,7 und das Produkt bei −985,2, noch einmal 64,5 kJ/mol tiefer.'),
      extra: {
        title: b('Products minus reactants', 'Produkte minus Edukte'),
        steps: [
          b('The elements sit at 0. Each compound sits at its enthalpy of formation: CaO −634.9, H₂O −285.8, Ca(OH)₂ −985.2.', 'Die Elemente liegen bei 0. Jede Verbindung liegt bei ihrer Standardbildungsenthalpie: CaO −634,9, H₂O −285,8, Ca(OH)₂ −985,2.'),
          b('Reactants together: −634.9 + (−285.8) = −920.7 kJ.', 'Edukte zusammen: −634,9 + (−285,8) = −920,7 kJ.'),
          b('Products: −985.2 kJ. Δ_{r}H = products − reactants.', 'Produkte: −985,2 kJ. Δ_{r}H = Produkte − Edukte.'),
          b('Answer: Δ_{r}H = −985.2 − (−920.7) = −64.5 kJ/mol; slaking lime is exothermic.', 'Antwort: Δ_{r}H = −985,2 − (−920,7) = −64,5 kJ/mol; Kalklöschen ist exotherm.'),
        ],
      },
    },
  ],

  examples: [
    {
      title: b('Thermite via the elements', 'Thermit über die Elemente'), tag: 'Al',
      show: { engine: 'energy', reaction: 'thermite', mode: 'hess', route: 'elements' },
      numbers: [
        { v: '−824.2 kJ/mol', label: b('enthalpy of formation of iron(III) oxide, Fe₂O₃', 'Standardbildungsenthalpie von Eisen(III)-oxid, Fe₂O₃') },
        { v: '−1676 kJ/mol', label: b('enthalpy of formation of aluminium oxide, Al₂O₃', 'Standardbildungsenthalpie von Aluminiumoxid, Al₂O₃') },
        { v: '−851.8 kJ/mol', label: b('for 2 Al + Fe₂O₃ → Al₂O₃ + 2 Fe', 'für 2 Al + Fe₂O₃ → Al₂O₃ + 2 Fe') },
      ],
      body: b('In 2 Al + Fe₂O₃ → Al₂O₃ + 2 Fe, aluminium and iron are elements with an enthalpy of formation of zero, so only the two oxides matter. Δ_{r}H = −1676 − (−824.2) = −851.8 kJ/mol. Aluminium oxide sits much further below its elements than iron oxide does, and that gap is what the reaction gives out.',
        'Bei 2 Al + Fe₂O₃ → Al₂O₃ + 2 Fe sind Aluminium und Eisen Elemente mit der Standardbildungsenthalpie null, also kommt es nur auf die beiden Oxide an. Δ_{r}H = −1676 − (−824,2) = −851,8 kJ/mol. Aluminiumoxid liegt viel weiter unter seinen Elementen als Eisenoxid, und genau diesen Unterschied gibt die Reaktion ab.'),
      soWhat: b('Rail welders use thermite: the molten steel it gives (the iron from the reaction plus alloying additions in the charge), at about 2400 °C, fills the gap between two rail ends and joins them as it sets.',
        'Beim Schweißen von Eisenbahnschienen nutzt man die Thermitreaktion: Der flüssige Stahl, der dabei mit etwa 2400 °C entsteht (Eisen aus der Reaktion und Legierungszusätze der Füllung), füllt die Lücke zwischen zwei Schienenenden und verbindet sie beim Erstarren.'),
    },
    {
      title: b('Methane: vapour or liquid water', 'Methan: Wasserdampf oder flüssiges Wasser'), tag: 'CH4',
      show: { engine: 'energy', reaction: 'ch4-burn', mode: 'hess', route: 'steps', steps: ['ch4-burn-g', '-2*water-boil'] },
      numbers: [
        { v: '−802.6 kJ/mol', label: b('burning methane to water vapour', 'Verbrennung von Methan zu Wasserdampf') },
        { v: '−88.0 kJ', label: b('as 2 mol of water vapour condense (2 × −44.0)', 'beim Kondensieren von 2 mol Wasserdampf (2 · (−44,0))') },
        { v: '−890.6 kJ/mol', label: b('burning methane to liquid water', 'Verbrennung von Methan zu flüssigem Wasser') },
      ],
      body: b('Burning methane to water vapour and then letting the vapour condense has the same start and the same end as burning it straight to liquid water, so both routes have the same ΔH: −802.6 + 2 × (−44.0) = −890.6 kJ/mol. Condensing is evaporating reversed, so its ΔH is −44.0 per mole of water, and it comes in twice because 2 H₂O form.',
        'Verbrennt man Methan zu Wasserdampf und lässt den Dampf dann kondensieren, führt das vom selben Anfang zum selben Ende wie die Verbrennung direkt zu flüssigem Wasser, also haben beide Wege dasselbe ΔH: −802,6 + 2 · (−44,0) = −890,6 kJ/mol. Kondensieren ist Verdampfen rückwärts, deshalb ist sein ΔH −44,0 pro Mol Wasser, und es kommt zweimal vor, weil 2 H₂O entstehen.'),
      soWhat: b('Condensing gas boilers cool their exhaust until the water vapour condenses and use that extra heat: 890.6 / 802.6 ≈ 1.11, so up to about 11 % more, the figure boiler makers give for natural gas (a real boiler recovers part of it).',
        'Gas-Brennwertkessel kühlen ihr Abgas, bis der Wasserdampf kondensiert, und nutzen diese zusätzliche Wärme: 890,6 : 802,6 ≈ 1,11, also bis zu etwa 11 % mehr (ein echter Kessel nutzt davon einen Teil). Diesen Unterschied zwischen Brennwert und Heizwert geben Kesselhersteller für Erdgas an.'),
    },
    {
      title: b('The step nobody can measure: salt', 'Der Schritt, den niemand messen kann: Kochsalz'), tag: 'NaCl',
      show: { engine: 'lattice', salt: 'NaCl', mode: 'transfer' },
      numbers: [
        { v: '−411.2 kJ/mol', label: b('measured enthalpy of formation of NaCl from its elements', 'gemessene Standardbildungsenthalpie von NaCl aus den Elementen') },
        { v: '+376 kJ', label: b('for the four known steps: 107 + 122 + 496 − 349', 'für die vier bekannten Schritte: 107 + 122 + 496 − 349') },
        { v: '−787 kJ', label: b('is left for the gaseous ions to form the crystal: the lattice energy (787 kJ/mol in unit 4)', 'bleiben für die Bildung des Kristalls aus den gasförmigen Ionen übrig: die Gitterenergie (787 kJ/mol in Einheit 4)') },
      ],
      body: b('No experiment turns a crystal straight into gaseous ions, so the [[lattice-energy|lattice energy]] of salt cannot be measured, but a Born–Haber cycle finds it. The measured enthalpy of formation of NaCl is the sum of five steps: making gaseous atoms (+107 for Na, +122 for Cl), removing sodium\'s outer electron (+496), adding an electron to each chlorine atom (−349 per mole of atoms), and letting the gaseous ions form the crystal. The first four are known and come to +376 kJ, so the fifth is what is left: −411.2 − 376 = −787.2, about −787 kJ/mol.',
        'Kein Experiment verwandelt einen Kristall direkt in gasförmige Ionen, deshalb lässt sich die [[lattice-energy|Gitterenergie]] von Kochsalz nicht messen, aber ein Born-Haber-Kreisprozess liefert sie. Die gemessene Standardbildungsenthalpie von NaCl ist die Summe von fünf Schritten: gasförmige Atome erzeugen (+107 für Na, +122 für Cl), das Außenelektron des Natriums abtrennen (+496), an jedes Chloratom ein Elektron anlagern (−349 pro Mol Atome) und die gasförmigen Ionen zum Kristall zusammenfügen. Die ersten vier sind bekannt und ergeben +376 kJ, also bleibt für den fünften übrig: −411,2 − 376 = −787,2, etwa −787 kJ/mol.'),
      soWhat: b('In an exam, write every step with its sign and solve for the one that is left. The 787 kJ/mol in unit 4 comes from a cycle like this one, so the cycle finds it rather than checks it; books give it as −787 for forming the lattice or +787 for pulling it apart.',
        'Schreib in der Klausur jeden Schritt mit Vorzeichen auf und löse nach dem Schritt auf, der übrig bleibt. Die 787 kJ/mol aus Einheit 4 stammen aus einem solchen Kreisprozess, er liefert sie also, statt sie zu prüfen; Bücher geben sie als −787 für die Bildung des Gitters oder als +787 für sein Zerlegen an.'),
    },
  ],

  flaw: {
    id: 'u18-flaw', unit: 18, kind: 'flaw', format: 'flaw', evidence: 'transfer', concepts: ['u18.formation', 'u18.products-reactants'], targets: ['elements-nonzero'],
    prompt: b('Where does this reasoning first go wrong?', 'Wo geht diese Überlegung zum ersten Mal schief?'),
    lines: [
      b('For 2 SO₂ + O₂ → 2 SO₃, the table gives Δ_{f}H°(SO₂) = −296.8 and Δ_{f}H°(SO₃) = −395.7 kJ/mol.', 'Für 2 SO₂ + O₂ → 2 SO₃ gibt die Tabelle Δ_{f}H°(SO₂) = −296,8 und Δ_{f}H°(SO₃) = −395,7 kJ/mol an.'),
      b('Δ_{r}H = sum of Δ_{f}H of the products − sum of Δ_{f}H of the reactants.', 'Δ_{r}H = Summe der Δ_{f}H der Produkte − Summe der Δ_{f}H der Edukte.'),
      b('Products: 2 × (−395.7) = −791.4 kJ.', 'Produkte: 2 · (−395,7) = −791,4 kJ.'),
      b('Reactants: 2 × (−296.8) = −593.6, plus 498 for O₂, the energy of its O=O bond: −95.6 kJ.', 'Edukte: 2 · (−296,8) = −593,6, dazu 498 für O₂, die Energie seiner O=O-Bindung: −95,6 kJ.'),
      b('So Δ_{r}H = −791.4 − (−95.6) = −695.8 kJ/mol.', 'Also Δ_{r}H = −791,4 − (−95,6) = −695,8 kJ/mol.'),
    ],
    flaw: 3,
    alsoFalse: [4],
    near: [{ step: 1, note: b('This one is true: with enthalpies of formation it is products minus reactants. Look at what each reactant is worth.', 'Dieser Schritt stimmt: Mit Standardbildungsenthalpien rechnet man Produkte minus Edukte. Schau dir an, welchen Wert jedes Edukt hat.') }],
    explain: b('Step 4 is the first wrong step; steps 1 to 3 are right. O₂ is an element in its standard state, so its enthalpy of formation is 0, not its bond energy, and the reactants come to −593.6 kJ. Step 5 only follows from the slip: the right value is Δ_{r}H = −791.4 − (−593.6) = −197.8 kJ/mol.',
      'Schritt 4 ist der erste falsche Schritt; die Schritte 1 bis 3 stimmen. O₂ ist ein Element im Standardzustand, seine Standardbildungsenthalpie ist also 0, nicht seine Bindungsenthalpie, und die Edukte ergeben −593,6 kJ. Schritt 5 folgt nur aus dem Fehler: Richtig ist Δ_{r}H = −791,4 − (−593,6) = −197,8 kJ/mol.'),
  } as FlawItem,

  deeper: {
    id: 'u18-deeper', unit: 18, kind: 'estimate', format: 'estimate', evidence: 'transfer', concepts: ['u18.unmeasurable', 'u18.products-reactants'],
    prompt: b('Ethanol cannot be made directly from carbon, hydrogen and oxygen, but it burns cleanly: C₂H₅OH(l) + 3 O₂ → 2 CO₂ + 3 H₂O(l), ΔH = −1366.9 kJ/mol. Standard enthalpies of formation: CO₂ −393.5, H₂O(l) −285.8 kJ/mol. Find the standard enthalpy of formation of ethanol.',
      'Ethanol lässt sich nicht direkt aus Kohlenstoff, Wasserstoff und Sauerstoff herstellen, verbrennt aber sauber: C₂H₅OH(l) + 3 O₂ → 2 CO₂ + 3 H₂O(l), ΔH = −1366,9 kJ/mol. Standardbildungsenthalpien: CO₂ −393,5, H₂O(l) −285,8 kJ/mol. Bestimme die Standardbildungsenthalpie von Ethanol.'),
    min: -1000, max: 1000, step: 1, answer: -278, tolerance: 3, suffix: ' kJ/mol',
    near: [
      { value: 278, tol: 3, note: b('The size is right, the sign is not: burning ethanol gives out less than burning the carbon and hydrogen in it would, so ethanol sits below its elements.', 'Der Betrag stimmt, das Vorzeichen nicht: Beim Verbrennen von Ethanol wird weniger frei, als die Verbrennung des enthaltenen Kohlenstoffs und Wasserstoffs liefern würde, also liegt Ethanol unter seinen Elementen.') },
      { value: 688, tol: 3, note: b('Count every molecule: 2 CO₂ and 3 H₂O form, so the value for CO₂ comes in twice and the one for water three times.', 'Beachte jedes Molekül: Es entstehen 2 CO₂ und 3 H₂O, also geht der Wert für CO₂ zweimal und der für Wasser dreimal ein.') },
      { value: -1644, tol: 3, note: b('That is the products alone. The burning step tells you how far ethanol sits above them: 1366.9 kJ.', 'Das sind nur die Produkte. Der Verbrennungsschritt sagt dir, wie weit Ethanol darüber liegt: 1366,9 kJ.') },
    ],
    explain: b('Δ_{r}H = products − reactants, and O₂ counts zero: −1366.9 = 2 × (−393.5) + 3 × (−285.8) − Δ_{f}H(ethanol) = −1644.4 − Δ_{f}H(ethanol). So Δ_{f}H(ethanol) = −1644.4 + 1366.9 = −277.5 kJ/mol (table value −277.6). Enthalpies of formation of many organic compounds are found this way, from their combustion.',
      'Δ_{r}H = Produkte − Edukte, und O₂ hat den Wert null: −1366,9 = 2 · (−393,5) + 3 · (−285,8) − Δ_{f}H(Ethanol) = −1644,4 − Δ_{f}H(Ethanol). Also ist Δ_{f}H(Ethanol) = −1644,4 + 1366,9 = −277,5 kJ/mol (Tabellenwert −277,6). Die Standardbildungsenthalpien vieler organischer Verbindungen bestimmt man so, aus ihrer Verbrennung.'),
  } as EstimateItem,

  explain: {
    prompt: b('In your own words: why can you add up the ΔH of steps, what happens to ΔH when you reverse a step, how do you get Δ_{r}H from enthalpies of formation, and what is Hess\'s law good for?',
      'In eigenen Worten: Warum darf man die ΔH-Werte von Teilschritten addieren, was passiert mit ΔH, wenn man einen Schritt umkehrt, wie berechnet man Δ_{r}H aus Standardbildungsenthalpien, und wofür braucht man den Satz von Hess?'),
    ideas: [
      { id: 'path', concept: 'u18.path', idea: b('ΔH depends only on the start and the end, whatever the route', 'ΔH hängt nur von Anfang und Ende ab, egal auf welchem Weg'), contra: PATH_DEPENDENT,
        en: PATH_EN, de: PATH_DE },
      { id: 'reverse', concept: 'u18.reverse', idea: b('Reverse a step and the sign of its ΔH flips', 'Kehrt man einen Schritt um, wechselt das Vorzeichen seines ΔH'), contra: REVERSE_KEEPS,
        en: any(together(REV_EN, SIGN_EN), SIGN_ONLY_EN), de: any(together(REV_DE, SIGN_DE), SIGN_ONLY_DE) },
      { id: 'zero', concept: 'u18.formation', idea: b('Elements in their standard state have an enthalpy of formation of zero', 'Elemente im Standardzustand haben die Standardbildungsenthalpie null'), contra: ELEMENTS_NONZERO,
        en: together(ELEM_EN, ZERO_EN, 60), de: together(ELEM_DE, ZERO_DE, 60) },
      { id: 'formation', concept: 'u18.products-reactants', idea: b('Δ_{r}H = sum of Δ_{f}H of the products − sum of Δ_{f}H of the reactants', 'Δ_{r}H = Summe der Δ_{f}H der Produkte − Summe der Δ_{f}H der Edukte'),
        en: PR_EN, de: PR_DE },
      { id: 'cycle', concept: 'u18.unmeasurable', idea: b('A cycle gives ΔH values that are impossible to measure directly', 'Ein Kreisprozess liefert ΔH-Werte, die man nur auf Umwegen bestimmen kann'),
        en: together(UNM_EN, CALC_EN), de: together(UNM_DE, CALC_DE) },
    ] as Idea[],
    tightened: b('ΔH depends only on the start and the end of a reaction, not on the route, so steps that lead from the same reactants to the same products add up to the same ΔH. If you reverse a step, the sign of its ΔH flips (and doubling a step doubles its ΔH). Elements in their standard state count zero, so the reaction enthalpy is the sum of the enthalpies of formation of the products minus the sum for the reactants. That is how a cycle gives values that cannot be measured directly, such as ΔH for carbon to carbon monoxide or the lattice energy of salt.',
      'ΔH hängt nur von Anfang und Ende einer Reaktion ab, nicht vom Weg (ΔH ist eine Zustandsgröße), deshalb ergeben Teilschritte von denselben Edukten zu denselben Produkten zusammen dasselbe ΔH. Kehrt man einen Schritt um, wechselt das Vorzeichen seines ΔH (verdoppelt man ihn, verdoppelt sich ΔH). Elemente im Standardzustand haben die Standardbildungsenthalpie null, deshalb ist die Reaktionsenthalpie die Summe der Bildungsenthalpien der Produkte minus die Summe der Bildungsenthalpien der Edukte. So liefert ein Kreisprozess Werte, die man nicht direkt messen kann, etwa ΔH für Kohlenstoff zu Kohlenstoffmonoxid oder die Gitterenergie von Kochsalz.'),
  },

  terms: ['hess-law', 'enthalpy-of-formation', 'enthalpy', 'exothermic', 'lattice-energy'],

  readings: [
    {
      lang: 'en', kind: 'quick',
      title: b('Hess\'s Law', 'Hess\'s Law'), source: 'Introductory Chemistry (Lumen Learning, SUNY)',
      url: 'https://courses.lumenlearning.com/suny-introductorychemistry/chapter/hesss-law-2/',
      lookFor: [
        b('Its carbon monoxide example is written for 2 CO: what total do its two steps give, and how does that compare with −110.5 kJ/mol for one mole?', ''),
        b('Its two rules, for reversing and for multiplying an equation: match each with a button on the step cards.', ''),
        b('In Example 10, which step is turned round, and what happens to its −174.5 kJ?', ''),
      ],
    },
    {
      lang: 'en', kind: 'deeper',
      title: b('Hess\'s Law and enthalpy change calculations', 'Hess\'s Law and enthalpy change calculations'), source: 'chemguide (Jim Clark)',
      url: 'https://www.chemguide.co.uk/physical/energetics/sums.html',
      lookFor: [
        b('Its statement of Hess\'s law: compare it with "ΔH depends only on the start and the end".', ''),
        b('The benzene example finds an enthalpy of formation from three combustion values (−3267, −394, −286), as you can for ethanol. Which of the three is used with its sign flipped?', ''),
        b('Its ethene + HCl example uses enthalpies of formation: does it subtract the reactants from the products? It uses +52.2 for ethene, where this unit uses +52.4.', ''),
      ],
    },
    {
      lang: 'de', kind: 'quick',
      title: b('Satz von Hess', 'Satz von Hess'), source: 'Studyflix',
      url: 'https://studyflix.de/chemie/satz-von-hess-5299',
      lookFor: [
        b('', 'Das Beispiel Graphit: Die Teilschritte −111 und −282 kJ/mol ergeben −393 kJ/mol. Vergleiche mit −110,5 und −283,0 in dieser Einheit.'),
        b('', 'Was passiert laut dem Artikel mit der Reaktionsenthalpie, wenn man eine Teilreaktion umkehrt? Prüfe es an der Ammoniaksynthese (−91,8 kJ/mol).'),
        b('', 'Wie erklärt der Artikel die Standardbildungsenthalpie, und für welche Stoffmenge gilt sie?'),
      ],
    },
  ],

  misconceptions: [
    { id: 'reverse-keeps-sign', name: b('A reversed step keeps the sign of its ΔH', 'Ein umgekehrter Schritt behält das Vorzeichen') },
    { id: 'path-dependent', name: b('ΔH depends on the route taken', 'ΔH hängt vom Reaktionsweg ab') },
    { id: 'reactants-added', name: b('Reactants are added to the products instead of subtracted', 'Edukte werden zu den Produkten addiert statt abgezogen') },
    { id: 'elements-nonzero', name: b('Elements such as O₂ have an enthalpy of formation that must be counted', 'Elemente wie O₂ haben eine Bildungsenthalpie, die man mitrechnen muss') },
  ],

  glossary: {
    'hess-law': {
      en: 'Hess\'s law', de: 'Satz von Hess', unit: 18,
      def: { en: 'The ΔH of a reaction depends only on where it starts and ends, not on the route: if steps add up to the reaction, their ΔH values add up to its ΔH. It holds because enthalpy is a state function.', de: 'Die Reaktionsenthalpie hängt nur vom Anfangs- und Endzustand ab, nicht vom Weg: Ergeben Teilschritte zusammen die Reaktion, ergeben ihre ΔH-Werte zusammen ihr ΔH. Das gilt, weil die Enthalpie eine Zustandsgröße ist.' },
      falseFriend: { en: 'German books also say "Hess\'scher Wärmesatz"; a state function is a "Zustandsgröße".', de: 'Englische Bücher sagen „Hess\'s law“; eine Zustandsgröße ist dort eine „state function“.' },
    },
    'enthalpy-of-formation': {
      en: 'standard enthalpy of formation', de: 'Standardbildungsenthalpie', unit: 18,
      def: { en: 'Δ_{f}H°, the ΔH for making one mole of a compound from its elements in their standard states (25 °C, 1 bar). Elements in their standard state, such as O₂(g) or carbon as graphite, have the value zero.', de: 'Δ_{f}H°, die Reaktionsenthalpie für die Bildung von einem Mol einer Verbindung aus den Elementen in ihrem Standardzustand (25 °C, 1 bar). Elemente im Standardzustand, etwa O₂(g) oder Kohlenstoff als Graphit, haben den Wert null.' },
    },
  },
};
