// Unit 14 — Balancing equations, on the Zoom Ladder (equation mode).
// Numbers: every molar mass, atom count and mass sum comes from src/content/stoich.ts (molarMass, sideCount; atomic
// masses from elements.ts): Na 22.99, Al 26.982, O 15.999, Cl₂ 70.90, NaCl 58.44, CH₄ 16.043, O₂ 31.998, CO₂ 44.009,
// H₂O 18.015 g/mol. Checked: CH₄ + 2 O₂ → CO₂ + 2 H₂O has 80.04 g on each side per mol of methane; 2 C₂H₆ + 7 O₂ →
// 4 CO₂ + 6 H₂O has 14 O on each side; 4 Al + 3 O₂ → 2 Al₂O₃; 2 Na + Cl₂ → 2 NaCl: 45.98 g + 70.90 g = 116.88 g;
// 6 CO₂ + 6 H₂O → C₆H₁₂O₆ + 6 O₂ (18 O each side) and 6 CO₂ + 12 H₂O → C₆H₁₂O₆ + 6 O₂ + 6 H₂O (24 O each side);
// 2 C₈H₁₈ + 25 O₂ → 16 CO₂ + 18 H₂O (50 O each side). Magnesium: 0.243 g (0.0100 mol) gives 0.403 g MgO (calculated).
// Measured values and history (all fetched):
// - Iron wool, about 4 g, on a see-saw balance gains mass when heated in air (RSC, "The combustion of iron wool",
//   edu.rsc.org/experiments/the-combustion-of-iron-wool/717.article); magnesium gains mass in a crucible (RSC lesson
//   "How does burning magnesium affect its mass", 11–14).
// - A candle lost 0.161 g per minute, measured by school students at 990 m altitude (M. P. Jansen, "A study of the
//   rate of a candle burning", Chem 13 News, February 2019, University of Waterloo).
// - Lavoisier, tin heated with air in a sealed vessel (memoir for 1774): tin 8 onces (≈ 244.7 g), air 15⅓ grains
//   (≈ 0.814 g); the solids gained 3.12 grains (≈ 0.166 g) and the air lost the same (C. Giunta, "Lavoisier tin
//   calcination", web.lemoyne.edu/GIUNTA/classicalcs/lavoisier.html; 1 grain = 0.0531 g). Boyle (lead, hiss on opening)
//   and Lomonosov/Lavoisier (weighing before opening): Lernhelfer, "Erhaltung der Masse". The mass equivalent of a
//   reaction's energy (2 Al + 1.5 O₂: about 1.8 · 10⁻⁸ g on 102 g) is too small to weigh: same Lernhelfer article.
// - Photosynthesis: Ruben and Kamen, 1941, ¹⁸O tracer: the O₂ comes from the water; the fuller equation with 12 H₂O
//   (Life: The Science of Biology, 11th ed., section 10.4, Macmillan).
import type { Bi } from '../i18n';
import type { ChoiceItem, RankItem, FlawItem, EstimateItem } from './items';
import type { Idea } from './unit06';
import type { UnitContent } from './unitTypes';

const b = (en: string, de: string): Bi => ({ en, de });

// ---------- explain-back patterns ----------
// Each idea is a list of core phrases plus the rest of the clause (TAIL). The gaps inside a core never cross a
// negation, so "the coefficients don't give the number of molecules" matches nothing; a negation after the core is
// part of the match and only passes when it is one of the idea's own phrases ("…, not the masses"), listed in a
// branch that never matches on its own (as in unit 7). A negation before the core rules the clause out.
const NEG_EN = "(?:\\bnot\\b|n't|\\bno\\b|\\bnever\\b|\\bneither\\b|\\bnothing\\b|\\bcannot\\b)";
const NEG_DE = '(?:(?<!\\p{L})(?:nicht|nichts|kein\\p{L}*|nie|niemals|weder)(?!\\p{L}))';
const gE = (n: number) => `(?:(?!${NEG_EN}).){0,${n}}`;
const gD = (n: number) => `(?:(?!${NEG_DE}).){0,${n}}`;
const W = '(?<!\\p{L})'; // a German word start (\b does not see one before an umlaut)
const bank = (...phrases: string[]) => `(?!)(?:${phrases.flatMap((p) => [p, p + ',']).join('|')})`;
const TAIL = '[^.;]*';
const rx = (core: string[], own: string) => new RegExp(`(?:${core.join('|')})${TAIL}|${own}`, 'u');
// Contra patterns hold only in a clause without a negation (or a correction such as "instead of").
const GUARD_EN = "^(?!.*(\\bnot\\b|n't|\\bnever\\b|\\bno\\b|\\bneither\\b|\\bnor\\b|\\bnothing\\b|\\bwithout\\b|cannot|rather than|instead of))";
const GUARD_DE = '^(?!.*(?<!\\p{L})(nicht|nichts|kein\\p{L}*|nie|niemals|weder|ohne|statt|anstatt|sondern)(?!\\p{L}))';
const contra = (enCore: string[], deCore: string[], enExtra = '', deExtra = '') => ({
  en: new RegExp(`${GUARD_EN}${enExtra}.*(?:${enCore.join('|')})`, 'u'),
  de: new RegExp(`${GUARD_DE}${deExtra}.*(?:${deCore.join('|')})`, 'u'),
});

const O2 = 'o[2₂]';

// Idea 1, conservation: atoms are only rearranged, each element counts the same on both sides.
const ATOMS = {
  en: rx([
    `(atoms?|particles?)\\b${gE(40)}(rearrang|regroup|reshuffl|recombin|reorgani[sz]|re-arrang|swap|switch partner|change partner|trade partner|shuffl|re-sort|moved around|put together differently|joined (up )?differently|reused)\\w*`,
    `atoms?\\b${gE(40)}(are conserved|is conserved|stay the same|remain the same|stay|remain|just move|only move)\\b`,
    `(same|equal) (number|numbers|amount|count) of (each )?(kind of |type of |sort of )?(atoms?|elements?)`,
    `(each|every|all) (element|kind of atom|type of atom|sort of atom|atom|elements|atoms)\\b${gE(50)}\\b(same|equal|match\\w*|balanc\\w*|identical)`,
    `(atoms?|elements?)\\b${gE(40)}(both sides|each side|either side|left and right|before and after)\\b${gE(30)}(same|equal|match)`,
    `(same|equal)${gE(30)}(atoms?|elements?)${gE(30)}(both sides|each side|either side|left and right|before and after)`,
    `atoms in${gE(10)}(=|equals?|same as)${gE(10)}atoms out`,
    `(count|number) of (each )?(atoms?|elements?)${gE(30)}(same|equal|match)`,
    `conservation of (atoms|matter)`,
    `(atoms?|matter)\\b.{0,20}(not|never|neither) (be )?(created|made|destroyed|lost|formed)`,
    `(atoms?|matter)\\b.{0,20}(can't|cannot|can not) be (created|destroyed|made|lost)`,
    `(atoms?|matter)\\b.{0,20}(aren't|isn't|are not|is not) (created|destroyed|lost|made)`,
    `(no atoms?|nothing|no new atoms?) (is |are |gets? )?(created|made|destroyed|lost|disappears?|vanish\\w*|appears?)`,
    `atoms?\\b.{0,20}(don't|do not|doesn't|does not|never) (disappear|vanish|get lost|appear)`,
  ], bank('not created', 'not made', 'not destroyed', 'not lost', 'not formed', 'not be', 'never created', 'never made', 'never destroyed', 'never lost', 'never be',
    'neither created', 'neither made', 'cannot be', "can't be", "aren't created", "aren't destroyed", "aren't lost", "aren't made", "isn't created", "isn't destroyed", "isn't lost",
    "don't disappear", "don't vanish", "don't get", "don't appear", "doesn't disappear", 'not disappear', 'not vanish', 'not appear', 'never disappear', 'never vanish', 'no atoms', 'no atom',
    'no new', 'nothing is', 'nothing gets', 'nothing disappears', 'nothing vanishes', 'nothing appears', 'nothing new')),
  de: rx([
    `${W}(atome?|atomen|teilchen)${gD(40)}(umgeordnet|umgruppiert|umgebaut|neu (an)?geordnet|neu kombiniert|neu verbunden|anders (an)?geordnet|anders verbunden|ordnen sich (neu|um)|tauschen (ihre |die )?partner|wechseln (ihre |die )?partner|nur umgeordnet|neu zusammengesetzt|umsortiert|umverteilt)`,
    `${W}(atome?|atomen)${gD(40)}(bleiben erhalten|bleibt erhalten|bleiben gleich|bleiben dieselben|bleiben bestehen)`,
    `(gleich viele|gleiche anzahl|dieselbe anzahl|selbe anzahl|gleiche zahl) (an |von )?(atome|atomen|elementen|atomsorte|atomart)`,
    `${W}(jedes|jede|jeder|alle) (element|atomart|atomsorte|atom|elemente|atomsorten|atomarten)\\p{L}*${gD(50)}(gleich|übereinstimm|identisch|ausgeglichen)`,
    `${W}(atome?|elemente?|atomsorte\\p{L}*|atomart\\p{L}*)${gD(40)}(beiden seiten|jeder seite|links und rechts|vorher und nachher)${gD(30)}(gleich|übereinstimm)`,
    `${W}gleich (viele )?${gD(30)}(atome|elemente)${gD(30)}(beiden seiten|links und rechts|jeder seite)`,
    `(atomanzahl|atomzahl|anzahl der atome)${gD(30)}gleich`,
    `erhaltung der (atome|materie)|atomerhaltung`,
    `${W}(atome?|materie)\\p{L}*.{0,30}(weder|nicht|nie) (erzeugt|vernichtet|zerstört|geschaffen|verloren|neu)`,
    `${W}(keine|kein) (neuen |neue )?(atome|atom)(?!\\p{L}).{0,30}(entsteh|verschwind|verloren|vernicht|erzeugt|neu|dazu|hinzu|weg)`,
    `${W}nichts (geht verloren|verschwindet|entsteht neu|wird vernichtet|wird erzeugt)`,
  ], bank('nicht erzeugt', 'nicht vernichtet', 'nicht zerstört', 'nicht neu', 'nicht verloren', 'nicht geschaffen', 'nicht gebildet', 'nicht verschwinden', 'nicht weg',
    'nie erzeugt', 'nie vernichtet', 'nie verloren', 'nie neu', 'weder erzeugt', 'weder neu', 'weder geschaffen', 'weder vernichtet', 'keine atome', 'kein atom', 'keine neuen', 'keine neue',
    'nichts geht', 'nichts verschwindet', 'nichts entsteht', 'nichts wird')),
};
const ATOMS_MADE = contra(
  [`\\b(atoms?|matter)\\b.{0,20}\\b(are|is|get|gets|got|were|was|can be|will be|become)\\s+(created|destroyed|annihilated|made(?! (into|up|of))|lost|used up|turned into (energy|heat|light))`],
  [`${W}(atome?|materie)\\p{L}*.{0,25}${W}(werden|wird|sind|ist|gehen|geht)\\s.{0,15}(erzeugt|vernichtet|zerstört|verloren|verbraucht|in energie umgewandelt|zu energie)`],
);

// Idea 2, coefficients: balance with the numbers in front; a changed subscript is a different substance.
const COEFF = {
  en: rx([
    `(change|changing|changes|adjust\\w*|put|putting|puts|write|writing|add|adding|use|using|place|placing|alter\\w*|vary|varying|balance\\w*|fix\\w*|multiply\\w*|set|setting)\\b${gE(30)}\\b(coefficients?|(big|large|front) numbers?|numbers? (in front|before)|numbers? at the front|stoichiometric (coefficients?|factors?))`,
    `(coefficients?|(big|large) numbers?)\\b${gE(40)}(in front|before|at the front|ahead of)`,
    `coefficients?${gE(30)}\\b(change|changes|changed|adjust\\w*|balance\\w*|multipl\\w*|go in front)`,
    `(subscripts?|small numbers?|little numbers?|lower numbers?|tiny numbers?|indices|index|indexes|numbers? (inside|within|in) the formula)\\b${gE(60)}\\b(different|another|other|new) (substance|compound|chemical|molecule|thing|stuff|material|formula|product)`,
    `(different|another|other) (substance|compound|chemical|molecule)\\b${gE(40)}(subscript|small number|little number|index|indices)`,
    `(would|will|could) (make|give|be|become|create|turn (it )?into|mean) (a |an )?(different|another|other) (substance|compound|chemical|molecule)`,
    `(h₂o₂|h2o2|mgo2|mgo₂|\\bo3\\b|o₃)\\b.{0,15}\\b(is|would be|means|=)\\s?(hydrogen peroxide|magnesium peroxide|ozone|a different|another)`,
    `(never|not|don't|do not|cannot|can't|mustn't|must not|should not|shouldn't) (change|alter|touch|edit|mess with|modify) (the )?(subscripts?|small numbers?|little numbers?|lower numbers?|indices|index|indexes|formulas?|numbers? (inside|in) the formula)`,
    `(keep|leave|keeping|leaving) (the )?(formulas?|subscripts?|small numbers?|indices) (as (they are|it is)|alone|unchanged|the same|fixed|intact)`,
    `(subscripts?|small numbers?|indices|formulas?) (stay|stays|remain|remains|are|is) (fixed|the same|unchanged|untouched)`,
  ], bank('never change', 'not change', "don't change", 'do not', "can't change", 'cannot change', 'never alter', 'not alter', "don't alter", 'never touch', 'not touch',
    "don't touch", 'never edit', "don't edit", 'never the', 'not the', 'not subscripts', 'not allowed', "isn't allowed", "aren't allowed", 'never by', 'not by', 'not with', 'never with',
    "don't mess", 'never mess', 'not modify', "don't modify", 'never modify')),
  de: rx([
    `${W}(änder\\p{L}*|veränder\\p{L}*|anpass\\p{L}*|setz\\p{L}*|schreib\\p{L}*|stell\\p{L}*|ergänz\\p{L}*|multiplizier\\p{L}*|ausgleich\\p{L}*|einricht\\p{L}*|gleich\\p{L}* .{0,10}aus|richt\\p{L}* .{0,10}ein)${gD(40)}(koeff\\p{L}*|stöch\\p{L}* faktor\\p{L}*|stöchiometriezahl\\p{L}*|vorzahl\\p{L}*|zahlen? davor|zahlen? vor (den|die|der|dem) (formel|teilchen|stoff)\\p{L}*|große\\p{L}* zahl\\p{L}*)`,
    `${W}(koeff\\p{L}*|stöch\\p{L}* faktor\\p{L}*|vorzahl\\p{L}*|große\\p{L}* zahl\\p{L}*)${gD(40)}(davor|vor (die|den|der|das|dem|jede\\p{L}*) |vorne|änder\\p{L}*|anpass\\p{L}*|ausgleich\\p{L}*|einricht\\p{L}*|multiplizier\\p{L}*)`,
    `${W}(index|indizes|indices|indexe|kleine\\p{L}* zahl\\p{L}*|tiefgestellte\\p{L}* zahl\\p{L}*|zahlen? in der formel)${gD(60)}${W}(andere\\p{L}*|neue\\p{L}*) (stoff|verbindung|substanz|molekül|formel|teilchen)`,
    `${W}(andere[nrs]?|neue[nrs]?) (stoff|verbindung|substanz)\\p{L}*${gD(40)}(index|indizes|kleine\\p{L}* zahl)`,
    `${W}(würde|wäre|ergäbe|ergibt|entstünde|macht|machte|hätte)\\p{L}*${gD(25)}(ein |einen |eine )?andere[nrs]? (stoff|verbindung|substanz|molekül)`,
    `(h2o2|h₂o₂|mgo2|mgo₂)\\p{L}*.{0,20}${W}(wäre|ist|bedeutet|ergibt|ergäbe)\\s?(wasserstoffperoxid|magnesiumperoxid|ein anderer|eine andere)`,
    `${W}(nie|nicht|niemals)\\s.{0,15}(index|indizes|kleine\\p{L}* zahl\\p{L}*|tiefgestellte\\p{L}* zahl\\p{L}*|formel\\p{L}*).{0,20}(änder|veränder|anfass|antast)\\p{L}*`,
    `${W}(index|indizes|kleine\\p{L}* zahl\\p{L}*|formel\\p{L}*).{0,25}${W}(nie|nicht|niemals) (änder|veränder|anfass|antast)\\p{L}*`,
    `${W}(index|indizes|formel\\p{L}*) (bleib\\p{L}*|sind|ist|steh\\p{L}*) (fest|gleich|unverändert|tabu)`,
  ], bank('nie ändern', 'nicht ändern', 'nicht verändern', 'nie verändern', 'nicht anfassen', 'nie anfassen', 'nicht antasten', 'nie antasten', 'nie die', 'nicht die', 'nicht den',
    'nicht an', 'nicht über', 'nicht mit', 'nie über', 'nie mit', 'nie an', 'nicht erlaubt', 'nicht verändert', 'nicht geändert', 'keine indizes', 'keinen index', 'kein index',
    'niemals ändern', 'niemals die')),
};
// Misconception: balance by changing a subscript (unless the clause says why that is wrong).
const BY_SUBSCRIPT = contra(
  [`\\b(change|changing|adjust\\w*|alter\\w*|add|adding|increase\\w*|raise|raising|edit\\w*|modify\\w*)\\b.{0,20}\\b(the )?(subscripts?|small numbers?|little numbers?|indices|index|indexes)\\b`,
    `\\b(write|make|turn|change)\\w*\\b.{0,25}(h₂o₂|h2o2|\\bo3\\b|o₃|mgo2|mgo₂)`],
  [`${W}(änder|veränder|anpass|erhöh|setz)\\p{L}*.{0,25}(die |den |einen )?${W}(index|indizes|kleine\\p{L}* zahl\\p{L}*|tiefgestellte\\p{L}* zahl\\p{L}*)`,
    `${W}(index|indizes|kleine\\p{L}* zahl\\p{L}*).{0,25}${W}(änder|veränder|anpass|erhöh)\\p{L}*`],
  "(?!.*(would|wrong|different|another|peroxide|ozone|allowed|forbidden|must not|mustn't|identity|new (substance|compound|molecule)|subscripts? (changes|alters|makes|gives|turns|creates)))",
  '(?!.*(?<!\\p{L})(würde|wäre|ergäbe|ergibt|falsch|andere\\p{L}*|neue\\p{L}*|stoff|identität|peroxid|ozon|verboten|erlaubt|darf)(?!\\p{L}))',
);

// Idea 1 is also ruled out by balancing through a subscript: the atoms then add up only because the substance changed.
const either = (x: RegExp, y: RegExp) => new RegExp(`(?:${x.source})|(?:${y.source})`, 'u');
const ATOMS_CONTRA = { en: either(ATOMS_MADE.en, BY_SUBSCRIPT.en), de: either(ATOMS_MADE.de, BY_SUBSCRIPT.de) };

// Idea 3, ratio: the coefficients count particles and moles; masses follow from the molar masses.
const RATIO = {
  en: rx([
    `coefficients?\\b.{0,25}(\\bnot\\b|n't)\\s+(\\w+\\s+){0,2}(masses|mass|grams?|weights?)\\b`,
    `(coefficients?|(big|large|front) numbers?|numbers? in front|stoichiometric (coefficients?|factors?))\\b${gE(15)}\\b(count|counts|give|gives|show|shows|tell|tells|mean|means|stand|stands|represent|represents|are|is|say|says|describe|describes|indicate|indicates|refer|refers|equal|equals|number|numbers)\\b${gE(40)}\\b(molecules?|particles?|moles?|mol|formula units?)\\b`,
    // Exam shorthand: "coefficients = particles / mol"; "n = m/M" and "masses via M".
    `(coefficients?|(big|large|front) numbers?|numbers? in front|stoichiometric (coefficients?|factors?))\\s?=\\s?${gE(25)}\\b(molecules?|particles?|moles?|mol|formula units?|amounts?|ratios?)\\b`,
    `(?<!\\p{L})(n ?= ?m ?\\/ ?m|m ?= ?n ?(·|\\*|×|x)? ?m)(?!\\p{L})`,
    `(masses?|grams?)\\b${gE(20)}\\b(via|from|using|through) (the )?m(?![\\p{L}(])`,
    `(ratio|proportion)s? (of|between|in) (the )?(molecules|particles|moles|amounts|numbers of (molecules|particles))`,
    `(mole|molar|particle|molecule|amount) ratio`,
    `\\b(\\d|two|three|four|one) (molecules?|particles?|moles?|mol)\\b${gE(40)}\\b(\\d|one|two|three|a|each|every|per) (molecules?|particles?|moles?|mol)\\b`,
    `(masses?|grams?)\\b${gE(40)}(from|follow|follows|come from|comes from|depend on|depends on|via|using|with|through|need) (the )?molar mass`,
    `molar mass\\w*\\b${gE(40)}(masses|grams|mass ratio|convert)`,
  ], bank('not masses', 'not mass', 'not the', 'not grams', 'not gram', 'not weights', 'not weight', 'not by', 'not of', 'not in', 'not a', "aren't masses", "aren't mass", "aren't the",
    "aren't grams", "isn't the", "isn't mass", "don't give", "don't tell", "don't show", "don't mean", "don't stand", "don't count", "doesn't give", "doesn't mean", 'not how', 'not about',
    'no masses', 'no mass', 'never masses', 'never mass', 'never grams', 'not directly')),
  de: rx([
    `${W}(koeff\\p{L}*|stöch\\p{L}* faktor\\p{L}*).{0,25}${W}(nicht|kein\\p{L}*)\\s+(\\S+\\s+){0,2}(massen|masse|gramm|gewicht\\p{L}*|massenverhältnis\\p{L}*)`,
    `${W}(koeff\\p{L}*|stöch\\p{L}* faktor\\p{L}*|vorzahl\\p{L}*|zahlen? davor|stöchiometriezahl\\p{L}*)${gD(15)}${W}(zählen|zählt|geben|gibt|zeigen|zeigt|bedeuten|bedeutet|stehen für|steht für|sind|ist|sagen|sagt|beschreiben|beschreibt|nennen|nennt|entsprechen|entspricht|geben an|gibt an)${gD(40)}${W}(moleküle|molekül|teilchen|stoffmenge\\p{L}*|mol|formeleinheit\\p{L}*|teilchenzahl\\p{L}*|anzahl der (teilchen|moleküle|formeleinheiten))`,
    `${W}(koeff\\p{L}*|stöch\\p{L}* faktor\\p{L}*|vorzahl\\p{L}*|stöchiometriezahl\\p{L}*)\\s?=\\s?${gD(25)}${W}(moleküle|molekül|teilchen\\p{L}*|stoffmenge\\p{L}*|mol|formeleinheit\\p{L}*|anzahl|verhältnis\\p{L}*)`,
    `(?<!\\p{L})(n ?= ?m ?\\/ ?m|m ?= ?n ?(·|\\*|×|x)? ?m)(?!\\p{L})`,
    `${W}(masse|massen|gramm)${gD(20)}${W}(über|via|aus|durch) (die |der )?m(?![\\p{L}(])`,
    `(stoffmengenverhältnis|teilchenverhältnis|anzahlverhältnis|teilchenzahlverhältnis|molverhältnis|verhältnis der (teilchen|moleküle|stoffmengen|teilchenzahlen))`,
    `${W}(\\d|zwei|drei|vier|ein|eins) (moleküle?|teilchen|mol)(?!\\p{L})${gD(40)}${W}(\\d|ein|eins|einem|zwei|drei|je|pro|auf) (molekül|teilchen|mol)`,
    `${W}(masse|massen|gramm)${gD(40)}${W}(über|aus|mit|durch|erst über|ergeben sich|folgen)\\s.{0,15}molare\\p{L}* masse`,
    `${W}molare\\p{L}* masse\\p{L}*${gD(40)}(massen|gramm|umrechn)`,
  ], bank('nicht die', 'nicht der', 'nicht massen', 'nicht masse', 'nicht gramm', 'nicht das', 'nicht in', 'nicht über', 'nicht als', 'nicht gewichte', 'keine massen', 'keine masse',
    'keine gramm', 'kein massenverhältnis', 'keine gewichte', 'nicht direkt', 'nicht um', 'kein gramm')),
};
// Misconception: the coefficients are a mass ratio.
const MASS_RATIO = contra(
  [`\\bcoefficients?\\b.{0,30}\\b(are|give|gives|mean|means|show|shows|tell|tells|stand for|stands for|represent|represents|is|equal|equals)\\b.{0,15}\\b(the )?(masses|mass ratio|ratio of (the )?mass\\w*|grams|weights?|mass)\\b`,
    `\\b(2|two) ?(g|grams?)\\b.{0,20}(hydrogen|h2|h₂).{0,30}\\b(1|one) ?(g|gram)\\b`, `mass ratio (of |is )?(2 ?: ?1|2 to 1)`,
    `\\bcoefficients?\\s?=\\s?(the )?(masses|mass ratio|grams|weights?|mass)\\b`],
  [`${W}koeff\\p{L}*.{0,30}${W}(sind|geben|gibt|bedeuten|bedeutet|zeigen|zeigt|stehen für|steht für|ist|entsprechen|entspricht)\\s.{0,15}(die |das )?(massen|massenverhältnis\\p{L}*|gramm|gewicht\\p{L}*|masse)(?!\\p{L})`,
    `${W}koeff\\p{L}*\\s?=\\s?(die |das )?(massen|massenverhältnis\\p{L}*|gramm|gewicht\\p{L}*|masse)(?!\\p{L})`,
    `massenverhältnis (von |ist )?(2 ?: ?1|2 zu 1)`],
);

// Idea 4, mass: the total stays the same; magnesium gains the oxygen, a candle's gases escape.
const MASS = {
  en: rx([
    `(total |overall |whole |combined )?mass\\b${gE(20)}\\b(stays|remains|is|keeps|will be|stay|remain)\\b${gE(10)}(the same|constant|conserved|unchanged|equal|preserved)`,
    `mass\\b${gE(10)}(is |gets )?(conserved|preserved)`,
    `conservation of mass|mass conservation|law of conservation`,
    `\\bm(ass)? ?\\(?(before|reactants)\\)? ?= ?m(ass)? ?\\(?(after|products)\\b`,
    `(same|equal) (total )?(mass|weight)\\b${gE(40)}(before and after|both sides|each side|start and end|left and right)`,
    `heavier(?! than)\\b${gE(80)}(oxygen|\\b${O2}|\\bair\\b|oxide)`,
    `(oxygen|\\b${O2}|\\bair\\b|oxide)\\b${gE(80)}heavier(?! than)`,
    `(gain\\w*|add\\w*|pick\\w* up|take\\w* up|takes on|put\\w* on|grow\\w*)\\b${gE(20)}(mass|weight)\\b${gE(60)}(oxygen|\\b${O2}|\\bair\\b|oxide)`,
    `(oxygen|\\b${O2}|\\bair\\b)\\b${gE(60)}(adds?|added|brings?|gives?)\\b${gE(20)}(mass|weight)`,
    `(mass|weight)\\b${gE(20)}(goes up|went up|increases|increased|rises|grows|is gained)\\b${gE(60)}(oxygen|\\b${O2}|\\bair\\b|oxide)`,
    `(gases?|co[2₂]|carbon dioxide|water vapou?r|steam|smoke|vapou?rs?|the products?|fumes)\\b${gE(50)}(escape\\w*|leave\\w*|go (off|away|up|into the air)|goes (off|away|up)|float\\w* (off|away)|rise\\w*|drift\\w*|fly (off|away)|flies (off|away)|into the air|blow\\w* away)`,
    `lighter\\b${gE(60)}(gas|gases|escape\\w*|leav\\w*|smoke|vapou?r|into the air)`,
    `(sealed|closed|airtight|shut) (flask|vessel|container|jar|bottle|system|box|tube)\\b${gE(60)}(same|unchanged|constant|equal|conserved)`,
    `(mass|weight)\\b.{0,25}(doesn't|does not|didn't|did not|won't|will not|never|not) (change|go down|go up|disappear|vanish|get lost|decrease)`,
    `(no|none of the) mass\\b.{0,20}(is |gets |was )?(lost|destroyed|created|disappears)`,
  ], bank("doesn't change", 'not change', 'never change', 'never changes', "won't change", 'not go', 'not lost', 'not destroyed', 'not created', 'never lost', 'never destroyed', 'no mass',
    'nothing is', 'not disappear', "doesn't disappear", "doesn't go", "isn't lost", "isn't destroyed", "can't be", 'cannot be', 'not decrease', "doesn't decrease", 'not vanish')),
  de: rx([
    `${W}(gesamtmasse|masse|gesamtgewicht|gewicht)${gD(25)}${W}(bleib\\p{L}*|ist|wird)${gD(10)}(gleich|erhalten|konstant|unverändert|dieselbe|die gleiche)`,
    `(erhaltung der masse|massenerhaltung\\p{L}*|masseerhaltung\\p{L}*|erhaltungssatz)`,
    `${W}m(asse)? ?\\(?(vorher|edukte|der edukte)\\)? ?= ?m(asse)? ?\\(?(nachher|produkte|der produkte)(?!\\p{L})`,
    `${W}(gleiche|dieselbe|selbe) (gesamt)?(masse|gewicht)\\p{L}*${gD(40)}(vorher und nachher|beiden seiten|links und rechts|vor und nach)`,
    `${W}schwerer(?! als)${gD(80)}(sauerstoff|${W}${O2}|luft|oxid)`,
    `(sauerstoff|${W}${O2}|${W}luft|oxid)\\p{L}*${gD(80)}schwerer(?! als)`,
    `${W}(nimmt|nehmen|bindet|binden|gewinnt|gewinnen|kommt|kommen)${gD(40)}(masse|gewicht)\\p{L}*${gD(60)}(sauerstoff|${W}${O2}|luft|oxid)`,
    `(sauerstoff|${W}luft)\\p{L}*${gD(60)}(masse|gewicht)\\p{L}*.{0,15}(dazu|hinzu|zu)(?!\\p{L})`,
    `${W}(masse|gewicht)\\p{L}*${gD(20)}(nimmt zu|nimmt um|steigt|wird größer|erhöht sich|wächst)${gD(60)}(sauerstoff|${W}${O2}|${W}luft|oxid)`,
    `${W}(gase?|co[2₂]|kohlenstoffdioxid|kohlendioxid|wasserdampf|dampf|rauch|produkte|abgase)${gD(50)}(entweich\\p{L}*|steig\\p{L}* (auf|weg|in die luft)|verflieg\\p{L}*|geh\\p{L}* (weg|in die luft)|in die luft|zieh\\p{L}* ab|weg)`,
    `${W}leichter${gD(60)}(gas|gase|entweich\\p{L}*|rauch|dampf|in die luft)`,
    `${W}(geschlossen\\p{L}*|verschlossen\\p{L}*|zugeschmolzen\\p{L}*|luftdicht\\p{L}*) (gefäß|kolben|system|behälter|glas|flasche|rohr)\\p{L}*${gD(60)}(gleich|konstant|erhalten|unverändert)`,
    `${W}(masse|gewicht)\\p{L}*.{0,25}(ändert sich nicht|nicht verändert|nicht geändert|geht nicht verloren|nimmt nicht ab|wird nicht weniger|verschwindet nicht)`,
  ], bank('nicht verloren', 'nicht vernichtet', 'nicht weniger', 'nicht geändert', 'nicht verändert', 'nicht ändern', 'nicht beim', 'nicht bei', 'nicht durch', 'nicht ab',
    'keine masse', 'kein gramm', 'nichts geht', 'nichts verschwindet', 'nicht zerstört', 'nicht weg', 'nicht verschwunden', 'nicht kleiner', 'nicht leichter')),
};
// Misconception: burning destroys matter (or turns it into light and heat).
const MASS_LOST = contra(
  [`\\b(burn\\w*|fire|flames?|combustion)\\b.{0,50}\\b(destroy\\w*|annihilat\\w*)\\b`,
    `\\b(matter|atoms?)\\b.{0,20}\\b(is|are|gets?|was|were|becomes?)\\s+(destroyed|annihilated|used up|lost|burnt up|burned up|turned into (energy|heat|light)|converted (in)?to (energy|heat|light))`,
    `\\b(mass|wax|wood|fuel)\\b.{0,20}\\b(is|are|gets?|was|were|becomes?)\\s+(destroyed|annihilated|turned into (energy|heat|light)|converted (in)?to (energy|heat|light))`,
    `\\b(turns?|changes?|converts?)\\b.{0,20}\\b(matter|mass|wax|wood|atoms)\\b.{0,10}\\b(in)?to (energy|heat|light)`],
  [`${W}(verbrenn\\p{L}*|feuer|flamme\\p{L}*|brennen)${gD(50)}(vernicht\\p{L}*|zerstör\\p{L}*)`,
    `${W}(materie|atome?|masse|wachs|holz)\\p{L}*.{0,25}${W}(wird|werden|ist|sind|wurde|wurden)\\s.{0,15}(vernichtet|zerstört|in energie (um)?gewandelt|zu energie|zu wärme|zu licht)`,
    `${W}(materie|atome?)\\p{L}*.{0,20}${W}(geht|gehen) .{0,10}verloren`,
    `${W}(wandelt|verwandelt)\\p{L}* .{0,25}(materie|masse|wachs|holz|atome) .{0,10}(in|zu) (energie|wärme|licht)`],
);

// Idea 5, method: the most complex substance first, single elements last, double away a half.
const METHOD = {
  en: rx([
    `(start|begin|starting|beginning|first)\\w*\\b${gE(20)}\\b(with|by|from|on)\\b${gE(15)}(the )?(most complex|most complicated|biggest|largest|hardest|most difficult|complex|complicated|big|longest|most atoms)`,
    `(most complex|most complicated|biggest|largest|hardest) (substance|molecule|formula|compound|one|species|thing|reactant)`,
    `(\\b${O2}|oxygen|elements?|single elements?|lone elements?|free elements?|pure elements?|elements on (their|its) own|hydrogen|\\bh[2₂])\\b${gE(50)}\\b(last|finally|for the end)\\b`,
    `\\b(last|finally)\\b${gE(30)}(\\b${O2}|oxygen|the element|elements|single elements?)`,
    `(leave|save|keep|do|balance|leaving|saving)\\w*\\b${gE(30)}\\b(for last|till the end|until the end|for the end|last)\\b`,
    `(double|doubling|doubled|multiply\\w*|times (2|two))\\b${gE(60)}(half|halves|fraction\\w*|½|1\\/2|3\\.5|3½|whole numbers?|0\\.5)`,
    `(half|halves|fraction\\w*|½|1\\/2|3\\.5|3½|0\\.5)${gE(60)}(double|doubling|multiply\\w*|times (2|two)|whole numbers?)`,
    `(one element at a time|element by element|element after element|one atom type at a time|by inspection|trial and error)`,
    `(smallest|lowest) whole(-| )numbers?`,
    `(common multiple|lowest common|least common)`,
  ], bank('not a', 'never a', "can't have", 'cannot have', 'not allowed', 'no half', 'no halves', 'no fractions', 'never half', 'not half')),
  de: rx([
    `${W}(anfang\\p{L}*|beginn\\p{L}*|start\\p{L}*|zuerst|erst|als erstes|zunächst|fang\\p{L}*|fäng\\p{L}*)${gD(30)}(dem |der |den )?${W}(kompliziertest\\p{L}*|komplexest\\p{L}*|größt\\p{L}*|schwierigst\\p{L}*|längst\\p{L}*|kompliziert\\p{L}*|komplex\\p{L}*)`,
    `${W}(kompliziertest\\p{L}*|komplexest\\p{L}*|größt\\p{L}*|schwierigst\\p{L}*) (stoff|molekül|formel|verbindung|teilchen|edukt|produkt)`,
    `(${W}${O2}|sauerstoff|${W}element\\p{L}*|elementare\\p{L}* stoff\\p{L}*|reine\\p{L}* element\\p{L}*|wasserstoff|${W}h[2₂])${gD(50)}(zuletzt|zum schluss|am ende|als letzte\\p{L}*|am schluss|zum ende)`,
    `${W}(zuletzt|zum schluss|als letzte\\p{L}*|am schluss)${gD(30)}(${W}${O2}|sauerstoff|element\\p{L}*)`,
    `${W}(verdoppel\\p{L}*|mal (2|zwei)|mit (2|zwei) (multiplizier|malnehm)\\p{L}*|multiplizier\\p{L}* .{0,20}(2|zwei)|alles doppelt|doppelt)${gD(60)}(${W}halb\\p{L}*|${W}bruch|${W}brüche|½|1\\/2|3,5|0,5|3½|ganze\\p{L}* zahl\\p{L}*)`,
    `(${W}halb\\p{L}*|${W}bruch|${W}brüche|½|1\\/2|3,5|0,5|3½)${gD(60)}(verdoppel\\p{L}*|mal (2|zwei)|multiplizier\\p{L}*|ganze\\p{L}* zahl\\p{L}*|doppelt)`,
    `(element für element|atomsorte für atomsorte|eine atomsorte nach der anderen|ein element nach dem anderen|atomart für atomart)`,
    `${W}(kleinst\\p{L}*|niedrigst\\p{L}*) ganz\\p{L}* zahl\\p{L}*`,
    `kleinste\\p{L}* gemeinsame\\p{L}* vielfache\\p{L}*|${W}kgv(?!\\p{L})`,
  ], bank('keine halben', 'keine brüche', 'kein bruch', 'keine halbe', 'nicht halb', 'nicht erlaubt', 'kein halbes')),
};

export const UNIT14: UnitContent = {
  n: 14,
  title: b('Balancing equations', 'Reaktionsgleichungen ausgleichen'),
  lead: b('Why burning steel wool gets heavier, and how to make both sides of an equation count the same atoms.', 'Warum verbrennende Stahlwolle schwerer wird und wie beide Seiten einer Reaktionsgleichung dieselben Atome enthalten.'),

  puzzle: {
    title: b('Heavier, lighter, or the same?', 'Schwerer, leichter oder gleich?'),
    lead: b('Four substances were burnt or heated in air and weighed. Some came out heavier, one lighter. One was sealed in a vessel with some air and weighed together with the vessel.',
      'Vier Stoffe wurden an der Luft verbrannt oder erhitzt und gewogen. Manche wurden schwerer, einer leichter. Einer wurde zusammen mit etwas Luft in ein Gefäß eingeschlossen und samt Gefäß gewogen.'),
    data: {
      caption: b('Iron wool, the candle and the tin were measured; the magnesium values are calculated for complete burning.',
        'Eisenwolle, Kerze und Zinn wurden gemessen; die Werte für Magnesium sind für vollständiges Verbrennen berechnet.'),
      head: [b('What burns', 'Was brennt'), b('How', 'Wie'), b('Mass before → after', 'Masse vorher → nachher')],
      rows: [
        { cells: [b('Magnesium ribbon', 'Magnesiumband'), b('in an open crucible', 'im offenen Tiegel'), b('0.243 g → 0.403 g (calculated)', '0,243 g → 0,403 g (berechnet)')] },
        { cells: [b('Iron wool (steel wool), about 4 g', 'Eisenwolle (Stahlwolle), etwa 4 g'), b('on a see-saw balance in air', 'an einer Balkenwaage an der Luft'), b('heavier: its end of the balance drops', 'schwerer: Ihre Seite der Waage sinkt')] },
        { cells: [b('Candle', 'Kerze'), b('in open air, on a balance', 'an der Luft, auf einer Waage'), b('about 0.16 g lighter each minute', 'pro Minute etwa 0,16 g leichter')] },
        { cells: [b('Tin, 245 g, with 0.81 g of air', 'Zinn, 245 g, mit 0,81 g Luft'), b('heated in a sealed vessel (Lavoisier, 1774)', 'in einem verschlossenen Gefäß erhitzt (Lavoisier, 1774)'), b('total: no change', 'gesamt: keine Änderung')] },
      ],
    },
    clash: b('Magnesium and iron come out of the fire heavier, a candle gets lighter, and in Lavoisier\'s sealed vessel the total did not change at all. So does burning make matter, destroy it, or neither?',
      'Magnesium und Eisen kommen schwerer aus dem Feuer, eine Kerze wird leichter, und in Lavoisiers verschlossenem Gefäß änderte sich die Gesamtmasse gar nicht. Erzeugt Verbrennen also Materie, vernichtet es sie, oder keins von beidem?'),
    question: {
      id: 'u14-puzzle', unit: 14, kind: 'choice', format: 'predict', withConfidence: true, evidence: 'predict',
      concepts: ['u14.mass', 'u14.conservation'], targets: ['mass-lost-burning'],
      prompt: b('Your best guess:', 'Deine beste Vermutung:'),
      options: [
        { text: b('Burning destroys matter; the metals only seem heavier because soot sticks to them', 'Verbrennen vernichtet Materie; die Metalle wirken nur schwerer, weil Ruß an ihnen haftet'), mis: 'mass-lost-burning' },
        { text: b('Each substance has its own rule: some gain mass in a fire, others lose it', 'Jeder Stoff hat seine eigene Regel: Manche nehmen im Feuer an Masse zu, andere ab') },
        { text: b('Neither: the metals bind oxygen from the air, a candle gives off gases', 'Keins von beidem: Metalle binden Sauerstoff aus der Luft, eine Kerze gibt Gase ab'), correct: true },
        { text: b('Heat has mass: the metals soak it up, the candle gives its heat away', 'Wärme hat Masse: Die Metalle saugen sie auf, die Kerze gibt ihre Wärme ab') },
      ],
      explain: b('Atoms are only rearranged, so mass is neither made nor destroyed: the [[conservation-of-mass]]. The metals bind oxygen from the air into a solid oxide that stays on the balance; the candle\'s wax becomes carbon dioxide and water vapour, which drift away. In the sealed vessel the tin gained 0.166 g and the air inside lost 0.166 g.',
        'Atome werden nur umgeordnet, Masse wird also weder erzeugt noch vernichtet: das Gesetz von der [[conservation-of-mass]]. Die Metalle binden Sauerstoff aus der Luft zu einem festen Oxid, das auf der Waage bleibt; das Wachs der Kerze wird zu Kohlenstoffdioxid und Wasserdampf, die davonziehen. Im verschlossenen Gefäß nahm das Zinn um 0,166 g zu, die Luft darin um 0,166 g ab.'),
    } as ChoiceItem,
    after: b('Next: count the atoms of a few reactions on both sides of the arrow.', 'Als Nächstes: Zähl die Atome einiger Reaktionen auf beiden Seiten des Pfeils.'),
  },

  explore: {
    title: b('Balancing on the Zoom Ladder', 'Ausgleichen auf der Zoom-Leiter'),
    intro: b('Balancing an equation means making both sides hold the same atoms. Each equation shows its [[reactant|reactants]], the starting substances, left of the arrow and its products right of it. In front of each formula sits a stepper for its [[coefficient]]: how many particles of that substance take part (1 to 9). The tally counts every element left | right, with ✓ or ≠. The Particles rung shows the molecules, the Grams rung the mass of each side. The small numbers inside a formula, the subscripts, stay fixed: "change a subscript instead" shows what goes wrong if you break that rule.',
      'Eine Reaktionsgleichung ausgleichen (im Unterricht auch „einrichten“) bedeutet: dafür sorgen, dass beide Seiten dieselben Atome enthalten. Links vom Pfeil stehen die [[reactant|Edukte]], die Ausgangsstoffe, rechts die Produkte. Vor jeder Formel sitzt ein Regler für ihren [[coefficient|Koeffizienten]] (auch stöchiometrischer Faktor): wie viele Teilchen dieses Stoffs beteiligt sind (1 bis 9). Die Bilanz zählt jedes Element links | rechts, mit ✓ oder ≠. Die Stufe „Teilchen“ zeigt die Moleküle, die Stufe „Gramm“ die Masse jeder Seite. Die kleinen Zahlen in einer Formel, die Indizes, bleiben fest: „Stattdessen einen Index ändern“ zeigt, was schiefgeht, wenn man diese Regel bricht.'),
    tasks: [
      { id: 'water', key: true, text: b('Balance hydrogen burning, H₂ + O₂ → H₂O, using only the coefficients.', 'Gleiche die Verbrennung von Wasserstoff aus, H₂ + O₂ → H₂O, nur mit den Koeffizienten.') },
      { id: 'methane', key: true, text: b('Balance methane burning. Which element do you fix first, and which last?', 'Gleiche die Verbrennung von Methan aus. Welches Element bringst du zuerst in Ordnung, welches zuletzt?') },
      { id: 'subscript', key: true, text: b('Try changing a subscript instead. The tally now works: why is it still not allowed?', 'Ändere stattdessen einen Index. Die Bilanz stimmt jetzt: Warum ist das trotzdem nicht erlaubt?') },
      { id: 'ammonia', text: b('Balance the ammonia synthesis, N₂ + H₂ → NH₃.', 'Gleiche die Ammoniaksynthese aus, N₂ + H₂ → NH₃.') },
      { id: 'grams', text: b('Balance any equation, then go to the Grams rung. Compare the mass of the two sides.', 'Gleiche irgendeine Reaktionsgleichung aus und geh dann auf die Stufe „Gramm“. Vergleiche die Masse beider Seiten.') },
      { id: 'ethane', challenge: true, text: b('Balance ethane burning with the smallest whole numbers (the steppers take whole numbers only).', 'Gleiche die Verbrennung von Ethan mit den kleinsten ganzen Zahlen aus (die Regler kennen nur ganze Zahlen).') },
    ],
    notes: {
      water: b('2 H₂ + O₂ → 2 H₂O: 4 H and 2 O on each side. The 2 in front doubles the whole water molecule; the small 2 inside is part of water\'s formula and stays.',
        '2 H₂ + O₂ → 2 H₂O: 4 H und 2 O auf jeder Seite. Die 2 davor verdoppelt das ganze Wassermolekül; die kleine 2 in der Formel gehört zum Wasser und bleibt.'),
      methane: b('CH₄ + 2 O₂ → CO₂ + 2 H₂O. Carbon and hydrogen first: each sits in just one substance per side. Oxygen, present as the element O₂, comes last, because changing O₂ moves no other element.',
        'CH₄ + 2 O₂ → CO₂ + 2 H₂O. Kohlenstoff und Wasserstoff zuerst: Jedes sitzt pro Seite in nur einem Stoff. Sauerstoff, der elementar als O₂ vorliegt, kommt zuletzt, weil ein geänderter Koeffizient vor O₂ kein anderes Element verschiebt.'),
      subscript: b('The count works, but the formula now names a different substance: H₂O₂ is hydrogen peroxide, a bleach, and MgO₂ is magnesium peroxide. The subscripts say what a substance is; only the coefficients may change.',
        'Die Bilanz stimmt, aber die Formel bezeichnet jetzt einen anderen Stoff: H₂O₂ ist Wasserstoffperoxid, ein Bleichmittel, und MgO₂ ist Magnesiumperoxid. Die Indizes legen fest, welcher Stoff es ist; ändern darf man nur die Koeffizienten.'),
      ammonia: b('N₂ + 3 H₂ → 2 NH₃. Nitrogen and hydrogen gas are made of two-atom molecules, so they enter as N₂ and H₂. The same holds for oxygen and the halogens: O₂, F₂, Cl₂, Br₂, I₂.',
        'N₂ + 3 H₂ → 2 NH₃. Stickstoff und Wasserstoff bestehen als Gase aus zweiatomigen Molekülen, deshalb stehen sie als N₂ und H₂ in der Gleichung. Dasselbe gilt für Sauerstoff und die Halogene: O₂, F₂, Cl₂, Br₂, I₂.'),
      grams: b('Once every element balances, both sides have the same mass: the same atoms, so the same total. While the equation is unbalanced the totals differ.',
        'Sobald jedes Element ausgeglichen ist, haben beide Seiten dieselbe Masse: dieselben Atome, also dieselbe Summe. Solange die Gleichung nicht ausgeglichen ist, unterscheiden sich die Summen.'),
      ethane: b('2 C₂H₆ + 7 O₂ → 4 CO₂ + 6 H₂O. One ethane molecule would need 3½ O₂; half a molecule cannot react, so every coefficient doubles.',
        '2 C₂H₆ + 7 O₂ → 4 CO₂ + 6 H₂O. Ein Ethanmolekül bräuchte 3½ O₂; ein halbes Molekül kann nicht reagieren, also verdoppeln sich alle Koeffizienten.'),
    },
    check: {
      id: 'u14-check', unit: 14, kind: 'rank', format: 'rank', evidence: 'predict', concepts: ['u14.coefficients', 'u14.conservation'],
      prompt: b('Rank by the number of oxygen atoms, most first.', 'Ordne nach der Zahl der Sauerstoffatome, die meisten zuerst.'),
      order: [b('3 {{O2}}', '3 {{O2}}'), b('2 {{CO2}}', '2 {{CO2}}'), b('{{O3}} (ozone)', '{{O3}} (Ozon)'), b('2 {{H2O}}', '2 {{H2O}}')],
      explain: b('A coefficient multiplies everything in the formula behind it: 3 O₂ has 3 × 2 = 6 oxygen atoms, 2 CO₂ has 4, one O₃ molecule 3 and 2 H₂O only 2. O₃ is ozone, a different gas from O₂: a subscript changes the substance, a coefficient only how many.',
        'Ein Koeffizient multipliziert alles in der Formel dahinter: 3 O₂ hat 3 · 2 = 6 Sauerstoffatome, 2 CO₂ hat 4, ein O₃-Molekül 3 und 2 H₂O nur 2. O₃ ist Ozon, ein anderes Gas als O₂: Ein Index ändert den Stoff, ein Koeffizient nur die Anzahl.'),
    } as RankItem,
  },

  predictions: [
    {
      item: {
        id: 'u14-al', unit: 14, kind: 'choice', format: 'predict', withConfidence: true, evidence: 'transfer',
        concepts: ['u14.method', 'u14.coefficients', 'u14.diatomic'], targets: ['balance-by-subscript'],
        prompt: b('Aluminium powder burns in oxygen to aluminium oxide: Al + O₂ → {{Al2O3}}, not yet balanced. With the smallest whole-number coefficients, which number stands in front of {{O2}}?',
          'Aluminiumpulver verbrennt in Sauerstoff zu Aluminiumoxid: Al + O₂ → {{Al2O3}}, noch nicht ausgeglichen. Welche Zahl steht mit den kleinsten ganzzahligen Koeffizienten vor {{O2}}?'),
        options: [
          { text: b('1, if the oxygen is written as {{O3}} instead', '1, wenn man den Sauerstoff stattdessen als {{O3}} schreibt'), mis: 'balance-by-subscript' },
          { text: b('2: one oxygen molecule for each aluminium atom', '2: ein Sauerstoffmolekül für jedes Aluminiumatom') },
          { text: b('3: three {{O2}} for two {{Al2O3}}', '3: drei {{O2}} auf zwei {{Al2O3}}'), correct: true },
          { text: b('6: one {{O2}} for each oxygen atom in the product', '6: ein {{O2}} für jedes Sauerstoffatom im Produkt') },
        ],
        explain: b('O₂ brings oxygen in pairs, Al₂O₃ takes it in threes; the smallest number both reach, their lowest common multiple, is 6: 3 O₂ and 2 Al₂O₃, which hold 4 Al. O₃ would make the count work but is ozone, a different gas, and 6 O₂ would bring 12 oxygen atoms, not 6.',
          'O₂ bringt Sauerstoff paarweise, Al₂O₃ braucht ihn in Dreiergruppen; das kleinste gemeinsame Vielfache (kgV) von 2 und 3 ist 6: 3 O₂ und 2 Al₂O₃, die 4 Al enthalten. O₃ ließe die Bilanz stimmen, ist aber Ozon, ein anderes Gas, und 6 O₂ brächten 12 Sauerstoffatome statt 6.'),
      } as ChoiceItem,
      show: { engine: 'ladder', eq: 'al2o3', coeffs: [4, 3, 2] },
      revealText: b('4 Al + 3 O₂ → 2 Al₂O₃: 4 aluminium and 6 oxygen atoms on each side. Oxygen comes in pairs (O₂) but goes out in threes (Al₂O₃), so both sides meet at 6 oxygen atoms; two Al₂O₃ then need 4 Al. The picture shows 4 atoms, 3 molecules and 2 formula units: the same atoms, regrouped.',
        '4 Al + 3 O₂ → 2 Al₂O₃: 4 Aluminium- und 6 Sauerstoffatome auf jeder Seite. Sauerstoff kommt paarweise (O₂), geht aber in Dreiergruppen hinaus (Al₂O₃), also treffen sich beide Seiten bei 6 Sauerstoffatomen; zwei Al₂O₃ brauchen dann 4 Al. Das Bild zeigt 4 Atome, 3 Moleküle und 2 Formeleinheiten: dieselben Atome, neu gruppiert.'),
      extra: {
        title: b('Find a number both sides can reach', 'Eine Zahl finden, die beide Seiten erreichen'),
        steps: [
          b('Start with the most complex substance, Al₂O₃. It holds 3 oxygen atoms, while O₂ brings them in pairs.', 'Fang mit dem kompliziertesten Stoff an, Al₂O₃. Er enthält 3 Sauerstoffatome, O₂ bringt sie aber paarweise.'),
          b('The smallest number that 2 and 3 both go into (the lowest common multiple) is 6: 3 O₂ on the left, 2 Al₂O₃ on the right.', 'Das kleinste gemeinsame Vielfache (kgV) von 2 und 3 ist 6: 3 O₂ links, 2 Al₂O₃ rechts.'),
          b('Two Al₂O₃ hold 4 aluminium atoms, so write 4 Al on the left.', 'Zwei Al₂O₃ enthalten 4 Aluminiumatome, also schreibst du links 4 Al.'),
          b('Check: 4 Al and 6 O on each side. Writing O₃ instead would balance the count but name ozone, a different gas.', 'Probe: 4 Al und 6 O auf jeder Seite. O₃ zu schreiben, ließe die Bilanz stimmen, wäre aber Ozon, ein anderes Gas.'),
        ],
      },
    },
    {
      item: {
        id: 'u14-salt', unit: 14, kind: 'choice', format: 'predict', withConfidence: true, evidence: 'predict',
        concepts: ['u14.ratio', 'u14.mass'], targets: ['coefficients-mass-ratio'],
        prompt: b('Sodium burns in chlorine gas to table salt: 2 Na + Cl₂ → 2 NaCl. Molar masses: Na 22.99 g/mol, {{Cl2}} 70.90 g/mol. How many grams of chlorine react with 46.0 g of sodium?',
          'Natrium verbrennt in Chlorgas zu Kochsalz: 2 Na + Cl₂ → 2 NaCl. Molare Massen: Na 22,99 g/mol, {{Cl2}} 70,90 g/mol. Wie viel Gramm Chlor reagieren mit 46,0 g Natrium?'),
        options: [
          { text: b('23.0 g: half the mass, as 2 Na to 1 Cl₂', '23,0 g: die halbe Masse, wie 2 Na zu 1 Cl₂'), mis: 'coefficients-mass-ratio' },
          { text: b('35.5 g: one Cl atom per two Na atoms', '35,5 g: ein Cl-Atom auf zwei Na-Atome') },
          { text: b('46.0 g: the same mass of each element', '46,0 g: von jedem Element dieselbe Masse') },
          { text: b('70.9 g: about 1.5 times the sodium', '70,9 g: etwa das 1,5-Fache des Natriums'), correct: true },
        ],
        explain: b('The coefficients count particles and moles: 46.0 g of sodium is 2.00 mol, and 2 mol of Na react with 1 mol of Cl₂, which has a mass of 70.9 g. Reading 2 : 1 as grams gives 23 g, far too little chlorine.',
          'Die Koeffizienten geben das Verhältnis der Teilchenzahlen bzw. Stoffmengen an: 46,0 g Natrium sind 2,00 mol, und 2 mol Na reagieren mit 1 mol Cl₂, das eine Masse von 70,9 g hat. Liest man 2 : 1 als Gramm, kommt man auf 23 g, viel zu wenig Chlor.'),
      } as ChoiceItem,
      show: { engine: 'ladder', eq: 'nacl', coeffs: [2, 1, 2], rung: 'grams' },
      revealText: b('70.9 g of chlorine, and 116.9 g of salt forms: the masses on both sides add up to the same total. 2 Na + Cl₂ → 2 NaCl counts particles, 2 sodium atoms for each Cl₂ molecule, so 2 mol for 1 mol. A mole of Cl₂ has about three times the mass of a mole of sodium atoms (its [[molar-mass]] is 70.90 against 22.99 g/mol), so the masses come out nothing like 2 : 1.',
        '70,9 g Chlor, und es entstehen 116,9 g Salz: Beide Seiten haben dieselbe Gesamtmasse. 2 Na + Cl₂ → 2 NaCl gibt Teilchenzahlen an, 2 Natriumatome auf ein Cl₂-Molekül, also 2 mol auf 1 mol. Ein Mol Cl₂ hat etwa die dreifache Masse eines Mols Natriumatome (seine [[molar-mass]] beträgt 70,90 gegenüber 22,99 g/mol), deshalb sind die Massen weit entfernt von 2 : 1.'),
      extra: {
        title: b('From grams to moles and back', 'Von Gramm zu Mol und zurück'),
        steps: [
          b('The coefficients count particles: 2 sodium atoms react with 1 Cl₂ molecule, so 2 mol react with 1 mol.', 'Die Koeffizienten geben Teilchenzahlen an: 2 Natriumatome reagieren mit 1 Cl₂-Molekül, also 2 mol mit 1 mol.'),
          b('n(Na) = m ÷ M = 46.0 g ÷ 22.99 g/mol = 2.00 mol.', 'n(Na) = m : M = 46,0 g : 22,99 g/mol = 2,00 mol.'),
          b('So it needs 1 mol of Cl₂, and 1 mol of Cl₂ has a mass of 70.9 g.', 'Es braucht also 1 mol Cl₂, und 1 mol Cl₂ hat eine Masse von 70,9 g.'),
          b('In an exam: n(Na) : n(Cl₂) = 2 : 1, m(Cl₂) = 1.00 mol · 70.90 g/mol = 70.9 g. Answer: 70.9 g of chlorine react with 46.0 g of sodium.', 'In der Klausur: n(Na) : n(Cl₂) = 2 : 1, m(Cl₂) = 1,00 mol · 70,90 g/mol = 70,9 g. Antwortsatz: Mit 46,0 g Natrium reagieren 70,9 g Chlor.'),
        ],
      },
    },
  ],

  examples: [
    {
      title: b('Methane on a gas stove, atom by atom', 'Methan am Gasherd, Atom für Atom'), tag: 'CH4', show: { engine: 'ladder', eq: 'ch4', coeffs: [1, 2, 1, 2] },
      numbers: [{ v: '4', label: b('H atoms on each side: 4 in CH₄, 2 × 2 in 2 H₂O', 'H-Atome auf jeder Seite: 4 in CH₄, 2 · 2 in 2 H₂O') }, { v: '4', label: b('O atoms on each side: 2 × 2 in 2 O₂; 2 in CO₂ plus 2 in 2 H₂O', 'O-Atome auf jeder Seite: 2 · 2 in 2 O₂; 2 in CO₂ und 2 in 2 H₂O') }, { v: '80.04 g', label: b('mass of each side for 1 mol of methane', 'Masse jeder Seite für 1 mol Methan') }],
      body: b('Start with the most complex substance, methane: its one C ends up in one CO₂, its four H need two H₂O. The right side now holds 2 + 2 = 4 oxygen atoms, so the left needs 2 O₂; oxygen, present as the element O₂, comes last. In an exam, write the atom tally under the equation: left 1 C, 4 H, 4 O | right 1 C, 4 H, 4 O.',
        'Fang mit dem kompliziertesten Stoff an, Methan: Sein eines C landet in einem CO₂, seine vier H brauchen zwei H₂O. Rechts stehen jetzt 2 + 2 = 4 Sauerstoffatome, also braucht die linke Seite 2 O₂; Sauerstoff, der elementar als O₂ vorliegt, kommt zuletzt. In der Klausur schreibst du die Atombilanz unter die Gleichung: links 1 C, 4 H, 4 O | rechts 1 C, 4 H, 4 O.'),
      soWhat: b('With too little air, some carbon ends up as carbon monoxide, a poisonous gas: that is why gas heaters need ventilation.',
        'Bei zu wenig Luft endet ein Teil des Kohlenstoffs als Kohlenstoffmonoxid, ein giftiges Gas: Deshalb brauchen Gasthermen eine Belüftung.'),
    },
    {
      title: b('Ethane: half a molecule is not allowed', 'Ethan: kein halbes Molekül'), tag: 'C2H6', show: { engine: 'ladder', eq: 'c2h6', coeffs: [2, 7, 4, 6] },
      numbers: [{ v: '3.5', label: b('O₂ molecules one ethane molecule would need', 'O₂-Moleküle, die ein Ethanmolekül bräuchte') }, { v: '7', label: b('O₂ after doubling: 2 C₂H₆ + 7 O₂ → 4 CO₂ + 6 H₂O', 'O₂ nach dem Verdoppeln: 2 C₂H₆ + 7 O₂ → 4 CO₂ + 6 H₂O') }, { v: '14', label: b('O atoms on each side', 'O-Atome auf jeder Seite') }],
      body: b('Carbon first: 2 C go to 2 CO₂; hydrogen next: 6 H go to 3 H₂O. That makes 4 + 3 = 7 oxygen atoms on the right, but O₂ brings them in pairs, so one ethane would need 3½ O₂. Half a molecule cannot react, so double every coefficient.',
        'Zuerst Kohlenstoff: 2 C ergeben 2 CO₂; dann Wasserstoff: 6 H ergeben 3 H₂O. Rechts stehen damit 4 + 3 = 7 Sauerstoffatome, O₂ bringt sie aber paarweise, ein Ethanmolekül bräuchte also 3½ O₂. Ein halbes Molekül kann nicht reagieren, also verdoppelst du alle Koeffizienten.'),
      soWhat: b('A ½ is allowed when the equation refers to 1 mol of one substance, as with energy values later (unit 17); in most exam answers write the smallest whole numbers.',
        'Ein ½ ist erlaubt, wenn man die Gleichung auf 1 mol eines Stoffs bezieht, wie später bei Energieangaben (Einheit 17); in den meisten Klausuren schreibst du die kleinsten ganzen Zahlen.'),
    },
    {
      title: b('Photosynthesis: the count is right, the path is missing', 'Fotosynthese: Die Bilanz stimmt, der Weg fehlt'), tag: 'C6H12O6', show: { engine: 'ladder', eq: 'photo', coeffs: [6, 6, 1, 6] },
      numbers: [{ v: '18', label: b('O atoms on each side of 6 CO₂ + 6 H₂O → C₆H₁₂O₆ + 6 O₂', 'O-Atome auf jeder Seite von 6 CO₂ + 6 H₂O → C₆H₁₂O₆ + 6 O₂') }, { v: '1941', label: b('the year a heavy oxygen isotope showed that the O₂ comes from the water', 'das Jahr, in dem ein schweres Sauerstoffisotop zeigte, dass das O₂ aus dem Wasser stammt') }, { v: '12', label: b('water molecules per glucose in the fuller equation; 6 come back out', 'Wassermoleküle pro Glucose in der ausführlicheren Gleichung; 6 kommen wieder heraus') }],
      body: b('A balanced equation counts atoms; it does not say which atom went where. Photosynthesis balances with 6 C, 12 H and 18 O on each side, but cannot tell whether the O₂ that plants release comes from the carbon dioxide or the water. In 1941 Ruben and Kamen marked the oxygen with the heavy [[isotope]] ¹⁸O: the oxygen of the water turned up in the O₂.',
        'Eine ausgeglichene Gleichung bilanziert Atome; sie sagt nicht, welches Atom wohin gegangen ist. Die Fotosynthese ist mit 6 C, 12 H und 18 O auf jeder Seite ausgeglichen, verrät aber nicht, ob das O₂, das Pflanzen abgeben, aus dem Kohlenstoffdioxid oder aus dem Wasser stammt. 1941 markierten Ruben und Kamen den Sauerstoff mit dem schweren [[isotope]] ¹⁸O: Der Sauerstoff des Wassers tauchte im O₂ auf.'),
      soWhat: b('Biology books therefore also write 6 CO₂ + 12 H₂O → C₆H₁₂O₆ + 6 O₂ + 6 H₂O (24 O on each side); cancel six water from both sides and you get the usual equation. An equation is a bookkeeping rule, not a mechanism.',
        'Biologiebücher schreiben deshalb auch 6 CO₂ + 12 H₂O → C₆H₁₂O₆ + 6 O₂ + 6 H₂O (24 O auf jeder Seite); kürzt man auf beiden Seiten sechs Wasser, erhält man die übliche Gleichung. Eine Reaktionsgleichung ist eine Bilanz, kein Reaktionsweg.'),
    },
  ],

  flaw: {
    id: 'u14-flaw', unit: 14, kind: 'flaw', format: 'flaw', evidence: 'transfer', concepts: ['u14.mass', 'u14.conservation'], targets: ['mass-lost-burning'],
    prompt: b('Where does this reasoning first go wrong?', 'Wo geht diese Überlegung zum ersten Mal schief?'),
    lines: [
      b('As a log burns, most of the wood is turned into the light and heat of the fire.', 'Wenn ein Holzscheit brennt, wird der größte Teil des Holzes zu Licht und Wärme des Feuers.'),
      b('What is left, a small heap of ash, weighs far less than the log did.', 'Was übrig bleibt, ein kleines Häufchen Asche, ist viel leichter als das Holzscheit.'),
      b('So burning destroys matter, and the mass of the wood is lost for good.', 'Also vernichtet Verbrennen Materie, und die Masse des Holzes ist für immer verloren.'),
    ],
    flaw: 0,
    alsoFalse: [2],
    near: [{ step: 1, note: b('Step 2 is true: the ash really is light. Ask where the rest of the wood went.', 'Schritt 2 stimmt: Die Asche ist wirklich leicht. Frag dich, wo der Rest des Holzes geblieben ist.') }],
    explain: b('Step 1 is the slip, even though it sounds like everyday sense: with oxygen from the air the wood\'s atoms form carbon dioxide and water vapour, which rise with the smoke; the energy comes from new bonds that are stronger than the old ones (unit 17). Step 2 is true, because the gases have left. Step 3 follows from step 1: weigh the log, the oxygen it used and all the gases, and the total stays the same.',
      'Schritt 1 ist der Fehler, auch wenn er nach Alltagswissen klingt: Mit Sauerstoff aus der Luft bilden die Atome des Holzes Kohlenstoffdioxid und Wasserdampf, die mit dem Rauch aufsteigen; die Energie stammt daher, dass die neuen Bindungen stärker sind als die alten (Einheit 17). Schritt 2 stimmt, weil die Gase entwichen sind. Schritt 3 folgt aus Schritt 1: Wiegt man das Holz, den verbrauchten Sauerstoff und alle Gase, bleibt die Summe gleich.'),
  } as FlawItem,

  deeper: {
    id: 'u14-deeper', unit: 14, kind: 'estimate', format: 'estimate', evidence: 'transfer', concepts: ['u14.method', 'u14.diatomic'],
    prompt: b('Petrol is a mixture of hydrocarbons; octane, {{C8H18}}, is the usual stand-in. Balance C₈H₁₈ + O₂ → CO₂ + H₂O with the smallest whole-number coefficients. What is the coefficient of {{O2}}?',
      'Benzin ist ein Gemisch aus Kohlenwasserstoffen; Octan, {{C8H18}}, steht meist stellvertretend dafür. Gleiche C₈H₁₈ + O₂ → CO₂ + H₂O mit den kleinsten ganzzahligen Koeffizienten aus. Welcher Koeffizient steht vor {{O2}}?'),
    min: 1, max: 60, step: 0.5, answer: 25, tolerance: 0, suffix: '',
    near: [
      { value: 12.5, tol: 0, note: b('12.5 balances one octane molecule, but half an O₂ cannot react: double every coefficient.', '12,5 gleicht ein Octanmolekül aus, aber ein halbes O₂ kann nicht reagieren: Verdopple alle Koeffizienten.') },
      { value: 50, tol: 0, note: b('50 is the number of oxygen atoms needed; each O₂ brings two of them.', '50 ist die Zahl der nötigen Sauerstoffatome; jedes O₂ bringt zwei davon mit.') },
      { value: 17, tol: 0, note: b('17 counts product molecules (8 CO₂ + 9 H₂O). Count oxygen atoms instead: 16 + 9.', '17 zählt Produktmoleküle (8 CO₂ + 9 H₂O). Zähl stattdessen Sauerstoffatome: 16 + 9.') },
    ],
    explain: b('One octane gives 8 CO₂ and 9 H₂O: 16 + 9 = 25 oxygen atoms, so 12½ O₂. Double everything: 2 C₈H₁₈ + 25 O₂ → 16 CO₂ + 18 H₂O, with 16 C, 36 H and 50 O on each side.',
      'Ein Octan ergibt 8 CO₂ und 9 H₂O: 16 + 9 = 25 Sauerstoffatome, also 12½ O₂. Alles verdoppeln: 2 C₈H₁₈ + 25 O₂ → 16 CO₂ + 18 H₂O, mit 16 C, 36 H und 50 O auf jeder Seite.'),
  } as EstimateItem,

  explain: {
    prompt: b('In your own words: what does a balanced equation say, how do you balance one, and why does magnesium get heavier when it burns?',
      'In eigenen Worten: Was sagt eine ausgeglichene Reaktionsgleichung aus, wie gleichst du eine aus, und warum wird Magnesium beim Verbrennen schwerer?'),
    ideas: [
      { id: 'atoms', concept: 'u14.conservation', idea: b('In a reaction the atoms are only rearranged: each element counts the same on both sides', 'Bei einer Reaktion werden die Atome nur umgeordnet: Jedes Element kommt auf beiden Seiten gleich oft vor'), contra: ATOMS_CONTRA, ...ATOMS },
      { id: 'coeff', concept: 'u14.coefficients', idea: b('Balance with coefficients in front of the formulas; changing a subscript would make a different substance', 'Man gleicht mit Koeffizienten vor den Formeln aus; ein geänderter Index ergäbe einen anderen Stoff'), contra: BY_SUBSCRIPT, ...COEFF },
      { id: 'ratio', concept: 'u14.ratio', idea: b('The coefficients count particles and moles; the masses follow from the molar masses', 'Die Koeffizienten geben das Verhältnis der Teilchenzahlen bzw. Stoffmengen an; die Massen ergeben sich erst über die molaren Massen'), contra: MASS_RATIO, ...RATIO },
      { id: 'mass', concept: 'u14.mass', idea: b('The total mass stays the same: burning magnesium gets heavier by the oxygen it takes from the air', 'Die Gesamtmasse bleibt gleich: Brennendes Magnesium wird um den Sauerstoff aus der Luft schwerer'), contra: MASS_LOST, ...MASS },
      { id: 'method', concept: 'u14.method', idea: b('Start with the most complex substance, balance elements such as O₂ last, and double everything to clear a ½', 'Mit dem kompliziertesten Stoff anfangen, Elemente wie O₂ zuletzt ausgleichen und alles verdoppeln, um ein ½ zu beseitigen'), ...METHOD },
    ] as Idea[],
    tightened: b('In a reaction the atoms are only rearranged, so each element counts the same on both sides and the total mass stays the same: burning magnesium gets heavier by the oxygen it takes from the air, while a candle gets lighter because its products escape as gases. Balance with coefficients in front of the formulas, never with the subscripts: changing H₂O to H₂O₂ would make a different substance, hydrogen peroxide. Start with the most complex substance and leave elements that stand alone, such as O₂, for last; if a ½ is left over, double every coefficient. The coefficients count particles and moles, not grams: 2 H₂ + O₂ → 2 H₂O means 2 molecules of hydrogen for 1 molecule of oxygen, and the masses follow from the molar masses.',
      'Bei einer Reaktion werden die Atome nur umgeordnet, deshalb kommt jedes Element auf beiden Seiten gleich oft vor, und die Gesamtmasse bleibt erhalten: Brennendes Magnesium wird um den Sauerstoff aus der Luft schwerer, eine Kerze wird leichter, weil ihre Produkte als Gase entweichen. Man gleicht mit Koeffizienten vor den Formeln aus, nie mit den Indizes: Wer H₂O zu H₂O₂ ändert, macht daraus einen anderen Stoff, Wasserstoffperoxid. Man beginnt mit dem kompliziertesten Stoff und gleicht Elemente wie O₂ zuletzt aus; bleibt ein ½ übrig, verdoppelt man alle Koeffizienten. Die Koeffizienten geben das Verhältnis der Teilchenzahlen bzw. Stoffmengen an, nicht der Massen: 2 H₂ + O₂ → 2 H₂O bedeutet 2 Wasserstoffmoleküle auf 1 Sauerstoffmolekül, und die Massen ergeben sich erst über die molaren Massen.'),
  },

  terms: ['reactant', 'coefficient', 'conservation-of-mass', 'mole', 'molar-mass'],

  readings: [
    {
      lang: 'en', kind: 'quick',
      title: b('How to Write Balanced Chemical Equations', 'How to Write Balanced Chemical Equations'), source: 'Chemistry LibreTexts, Introductory Chemistry 7.4',
      url: 'https://chem.libretexts.org/Bookshelves/Introductory_Chemistry/Introductory_Chemistry_(LibreTexts)/07%3A_Chemical_Reactions/7.04%3A_How_to_Write_Balanced_Chemical_Equations',
      lookFor: [
        b('Its warning about H₂O and H₂O₂. It is the same rule as the subscript button on the ladder.', ''),
        b('Its five steps: does it also start with the most complex substance? Compare with methane in the first worked example.', ''),
        b('Its isooctane example, C₈H₁₈, reaches 25/2 O₂ before doubling. Which worked example in this unit ran into the same half?', ''),
      ],
    },
    {
      lang: 'en', kind: 'deeper',
      title: b('Writing and Balancing Chemical Equations', 'Writing and Balancing Chemical Equations'), source: 'OpenStax Chemistry 2e, section 4.1',
      url: 'https://openstax.org/books/chemistry-2e/pages/4-1-writing-and-balancing-chemical-equations',
      lookFor: [
        b('Figure 4.3: mixtures of molecules before and after a reaction. Do the molecule counts keep the ratio of the coefficients, as on the Particles rung?', ''),
        b('It reads methane\'s coefficients, 1 : 2 : 1 : 2, as molecules, dozens or moles. Why is that not a ratio of grams? Compare with the sodium and chlorine prediction.', ''),
        b('Its ethane example with 7/2 O₂, and 3 N₂ + 9 H₂ → 6 NH₃ divided down to N₂ + 3 H₂ → 2 NH₃. Why do exams ask for the smallest whole numbers?', ''),
      ],
    },
    {
      lang: 'de', kind: 'deeper',
      title: b('Erhaltung der Masse', 'Erhaltung der Masse'), source: 'Lernhelfer, Schülerlexikon Chemie',
      url: 'https://www.lernhelfer.de/schuelerlexikon/chemie/artikel/erhaltung-der-masse',
      lookFor: [
        b('', 'Boyle erhitzte Blei in einem geschlossenen Gefäß, hörte beim Öffnen ein Zischen und fand mehr Masse. Was strömte da hinein, und warum wogen Lomonossow und Lavoisier vor dem Öffnen?'),
        b('', 'Das Rechenbeispiel 2 Al + 1,5 O₂ → Al₂O₃: Verdopple es. Stimmt es mit deiner Gleichung aus der ersten Vorhersage überein?'),
        b('', 'Die Energie dieser Reaktion entspricht nach E = m · c² nur etwa 1,8 · 10⁻⁸ g. Warum gilt die Massenerhaltung trotzdem als exakt, und was bedeutet das für das brennende Holzscheit in dieser Einheit?'),
      ],
    },
  ],

  misconceptions: [
    { id: 'balance-by-subscript', name: b('Balancing by changing subscripts', 'Ausgleichen durch Ändern der Indizes') },
    { id: 'coefficients-mass-ratio', name: b('Coefficients give mass ratios', 'Koeffizienten geben Massenverhältnisse an') },
    { id: 'mass-lost-burning', name: b('Burning destroys matter, so mass is lost', 'Verbrennen vernichtet Materie, deshalb geht Masse verloren') },
  ],

  glossary: {
    reactant: {
      en: 'reactant', de: 'Edukt', unit: 14,
      def: { en: 'A starting substance of a reaction, written to the left of the arrow; the substances on the right are the products.', de: 'Ein Ausgangsstoff einer Reaktion, links vom Pfeil; die Stoffe rechts sind die Produkte.' },
      falseFriend: { en: 'German says "Edukt", also "Ausgangsstoff"; English "educt" is rare.', de: 'Auch „Ausgangsstoff“; englisch „reactant“.' },
    },
    coefficient: {
      en: 'coefficient', de: 'Koeffizient', unit: 14,
      def: { en: 'The number in front of a formula in an equation: how many particles (or moles) of that substance take part. 2 H₂O means two water molecules.', de: 'Die Zahl vor einer Formel in einer Reaktionsgleichung: wie viele Teilchen (oder Mol) dieses Stoffs beteiligt sind. 2 H₂O bedeutet zwei Wassermoleküle.' },
      falseFriend: { en: 'German books also say "stöchiometrischer Faktor". The small number inside a formula is the subscript, German "Index".', de: 'Auch „stöchiometrischer Faktor“ oder „Stöchiometriezahl“. Die kleine Zahl in der Formel ist der Index (englisch „subscript“).' },
    },
    'conservation-of-mass': {
      en: 'conservation of mass', de: 'Erhaltung der Masse', unit: 14,
      def: { en: 'In a chemical reaction the total mass of everything taking part stays the same, because the atoms are only rearranged.', de: 'Bei einer chemischen Reaktion bleibt die Gesamtmasse aller beteiligten Stoffe gleich, weil die Atome nur umgeordnet werden.' },
      falseFriend: { en: 'German: "Gesetz von der Erhaltung der Masse", also "Massenerhaltungssatz".', de: 'Auch „Massenerhaltungssatz“; englisch „law of conservation of mass“.' },
    },
  },
};
