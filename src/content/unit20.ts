// Unit 20 — Free energy, in the Energy Landscape (gibbs mode).
// Numbers: dH(), dS(), dG() and crossover() in thermo.ts (OpenStax Chemistry 2e, Appendix G; calcite from the CRC
// Handbook; ice and water at their own temperatures: OpenStax section 10.3). ΔG = ΔH − T·ΔS/1000 (kJ/mol).
// - caco3 +179.19 / +160.2; ΔG(298) = +131.4; crossover 1118.5 K → 1119 K (845 °C).
// - ice-melt +6.01 / +22.0 (ΔS = 6010 ÷ 273.15, so 273 K is the relation read backwards); ΔG(263) = +0.22,
//   ΔG(283) = −0.22, ΔG(298) = −0.55.
// - no2-dimer −55.3 / −175.8; crossover 314.6 K → 315 K (41 °C); ΔG(273) = −7.3, ΔG(373) = +10.3.
// - h2o2 −196.1 / +126.0: no crossover; reversed +196.1 / −126.0: never.
// - nh3 −91.8 / −198.1; crossover 463.4 K (190 °C); ΔG(298) = −32.8; ΔG(723) = +51.4.
// - water-boil (25 °C data) +44.0 / +118.8 → 370.5 K; water-boil-100 +40.65 / +108.9 → 373.3 K.
// - diamond-graphite −1.89 / +3.36; ΔG(298) = −2.9.
// - so2-so3 −197.8 / −188.1; crossover 1051.6 K → 1052 K (778 °C).
// Sources fetched for values not in the data files (2026-10-26):
// - Lime kilns: "During the kiln operations the limestone reaches temperatures as high as 900 °C" (EMEP/EEA emission
//   inventory guidebook 2009, chapter 2.A.2 Lime production, eea.europa.eu).
// - Haber process: "a high temperature of 450 °C and a high pressure of 200 atmospheres", iron catalyst, ammonia
//   cooled and removed, unreacted gases recycled (Study Mind, GCSE notes "Haber Process", studymind.co.uk).
// - NO₂/N₂O₄ tube: cooling favours N₂O₄, "a yellowish colored gas mixture"; at room temperature and above "normally
//   brown" (Rutgers chemistry lecture demonstration 1033, chem.rutgers.edu).
// - Diamond → graphite: negative ΔG, "does not occur noticeably because it has a very high activation energy"
//   (Chemistry Student, IB notes "Interpreting ΔG and temperature effects", chemistrystudent.com).
import type { Bi } from '../i18n';
import type { ChoiceItem, FlawItem, EstimateItem } from './items';
import type { Idea } from './unit06';
import type { UnitContent } from './unitTypes';

const b = (en: string, de: string): Bi => ({ en, de });
const src = (r: RegExp | string) => `(?:${typeof r === 'string' ? r : r.source})`;
const any = (...rs: (RegExp | string)[]) => new RegExp(rs.map(src).join('|'));
// Two parts within a gap that holds no negation ("ΔG is negative does not mean it can run" must not count).
const gapNoNeg = (n: number) => String.raw`(?:(?!\bnot\b|n't|\bnicht\b|\bkein|\bnever\b|\bnie\b|cannot).){0,` + n + '}';
const together = (a: RegExp | string, c: RegExp | string, gap = 60) => new RegExp(`${src(a)}${gapNoNeg(gap)}${src(c)}|${src(c)}${gapNoNeg(gap)}${src(a)}`);

// ---------- explain-back patterns (text arrives lowercased: Δ → δ, − → -) ----------
const DG = String.raw`(?:δ ?(?:_?\{?r\}?)? ?g(?![a-zäöüß])|\bdg\b|\bdelta[ -]?g\b)`;
const DH = String.raw`(?:δ ?(?:_?\{?r\}?)? ?h(?![a-zäöüß])|\bdh\b|\bdelta[ -]?h\b)`;
const DS = String.raw`(?:δ ?(?:_?\{?r\}?)? ?s(?![a-zäöüß])|\bds\b|\bdelta[ -]?s\b)`;
const G_EN = String.raw`(?:${DG}|gibbs\w*|free energy|free enthalpy)`;
const G_DE = String.raw`(?:${DG}|freie\w* enthalpie|gibbs\w*)`;
const MINUS = String.raw`\s?(?:[-–]|minus)\s?`;
const TIMES = String.raw`\s?[·*×x⋅]?\s?`;
const FORMULA = new RegExp(`${DG}\\s?=\\s?${DH}${MINUS}t${TIMES}${DS}|\\bg\\s?=\\s?h${MINUS}t${TIMES}s\\b`);

// Idea 1, ΔG combines energy and entropy.
const GIBBS_EN = any(FORMULA,
  `${G_EN}.{0,40}(?:combin|balanc|weigh|account|depend|includ|bring|link|join|put|use|made|add|mix|sum|merg|unit)\\w*.{0,40}(?:${DH}|${DS}|enthalp\\w*|entrop\\w*|energy|heat|disorder|spreading)`,
  /(balance|trade-?off|competition|tug[ -]of[ -]war|contest|battle) (between|of) .{0,25}(enthalp|energy|heat|entrop)/,
  `(?:enthalp\\w*|energy|heat|${DH})(?: change)? (?:against|versus|vs|minus|plus|together with|combined with|and) (?:the )?(?:temperature times |t times )?(?:the )?(?:entrop\\w*|${DS}|t${TIMES}${DS}|spreading|disorder)`);
const GIBBS_DE = any(FORMULA,
  `${G_DE}.{0,40}(?:verbind|verknüpf|kombinier|berücksichtig|vereint|vereinigt|fasst|setzt sich|beinhaltet|enthält|hängt|abhängig|ergibt sich|bilanz|komm|steck|wäg|zusammen)\\w*.{0,40}(?:${DH}|${DS}|enthalpie\\w*|entropie\\w*|energie\\w*|wärme|unordnung)`,
  /(bilanz|zusammenspiel|wettstreit|wettkampf|konkurrenz|kräftemessen|abwägung) (aus|zwischen|von) .{0,25}(enthalpie|energie|wärme|entropie)/,
  `(?:enthalpie\\w*|energie|wärme|${DH}) (?:gegen|gegenüber|minus|mit|zusammen mit) (?:der )?(?:temperatur mal |t mal )?(?:entropie\\w*|${DS}|t${TIMES}${DS})`);
// Unit 19's misconception, contradicted: only exothermic changes run by themselves.
const ONLY_EXO = {
  en: /^(?!.*(\bnot\b|n't|\bno\b|\bnever\b|entrop|δ ?s|\bds\b|every temperature|all temperatures|any temperature)).*\b(only|just)\b .{0,20}(exotherm\w*|(reactions?|processes|changes) that (release|give out|give off)).{0,40}(run|happen|go\b|spontan|by (it|them)sel|on (its|their) own|feasible|possible)/,
  de: /^(?!.*(nicht|kein|\bnie\b|entropie|δ ?s|\bds\b|jeder temperatur|allen temperaturen)).*(\bnur\b|bloß|ausschließlich) .{0,20}(exotherm\w*|(reaktionen|vorgänge|prozesse),? die (energie|wärme) (abgeben|freisetzen)).{0,40}(laufen|ablauf|freiwillig|spontan|von selbst|möglich)/,
};

// Idea 2, the sign: ΔG < 0 means the reaction can run by itself (exergonic).
const NEGG_EN = `(?:${G_EN}\\s?(?:is |becomes |turns |gets |goes |being |value is )?(?:< ?0|negative|below zero|less than zero|smaller than zero|under zero|minus)|negative ${G_EN})`;
const POSG_EN = `(?:${G_EN}\\s?(?:is |becomes |turns |gets )?(?:> ?0|positive|above zero|greater than zero|more than zero)|positive ${G_EN})`;
const RUN_EN = String.raw`(?:spontaneous\w*|(?:run|happen|go|proceed|occur|react)\w* (?:by (?:it|them)sel\w*|on (?:its|their) own|without (?:help|a push|outside help|energy input))|can (?:run|happen|go|proceed|occur|react)|feasible|exergonic|favou?r\w*|will happen|goes ahead|possible)`;
const NEGG_DE = `(?:${G_DE}\\s?(?:ist |wird |kleiner |unter )?(?:< ?0|negativ\\w*|kleiner (?:als )?(?:null|0)|unter null)|negative\\w* ${G_DE})`;
const POSG_DE = `(?:${G_DE}\\s?(?:ist |wird )?(?:> ?0|positiv\\w*|größer (?:als )?(?:null|0)|über null)|positive\\w* ${G_DE})`;
const RUN_DE = String.raw`(?:freiwillig\w*|spontan\w*|von selbst|von allein\w*|selbstständig\w*|selbständig\w*|exergon\w*|läuft .{0,25}\bab\b|ablaufen|ablaufend|abläuft|läuft|möglich|begünstigt|kann .{0,20}(?:ablaufen|stattfinden|passieren|reagieren))`;
const SIGN_EN = any(together(NEGG_EN, RUN_EN, 50), /exergonic\w*.{0,30}(< ?0|negative)/, /(< ?0|negative).{0,30}exergonic/);
const SIGN_DE = any(together(NEGG_DE, RUN_DE, 50), /exergon\w*.{0,30}(< ?0|negativ)/, /(< ?0|negativ\w*).{0,30}exergon/);
const SIGN_CONTRA = {
  en: new RegExp(`^(?!.*(\\bnot\\b|n't|\\bno\\b|\\bnever\\b|cannot|revers|backward|opposite|other direction)).*(?:${POSG_EN}.{0,40}(?:spontaneous|runs? by (?:it|them)sel|can run|exergonic|feasible)|${NEGG_EN}.{0,40}(?:endergonic|non-?spontaneous))`),
  de: new RegExp(`^(?!.*(nicht|kein|\\bnie\\b|rück|umgekehrt|gegenrichtung)).*(?:${POSG_DE}.{0,40}(?:freiwillig|spontan|von selbst|exergon)|${NEGG_DE}.{0,40}(?:endergon|unfreiwillig))`),
};

// Idea 3, temperature weights the entropy term and can flip the sign of ΔG.
const TEMP_EN = String.raw`(?:temperature\w*|\btemp\b|\bt\b|heat\w*|hotter|colder|cool\w*|warm\w*|\bhot\b|\bcold\b)`;
const FLIP_EN = String.raw`(?:flip\w*|switch\w*|chang\w* (?:the )?sign|sign (?:can )?chang\w*|chang\w* (?:from )?(?:negative|positive)|turn\w* (?:it |δ ?g |dg )?(?:negative|positive|around)|revers\w* (?:the )?sign|decid\w*|matters?|makes? (?:a |the |all the )?difference|can change|changes? whether|tips?|tipp\w*|affects? whether|determines?|controls?)`;
const WEIGHT_EN = any(
  `t${TIMES}${DS}.{0,30}(?:grows?|bigger|larger|greater|increases?|rises?|wins?|outweigh\\w*|dominat\\w*|matters? more|counts? more)`,
  /entrop\w*.{0,30}(grows?|bigger|larger|greater|more important|wins?|outweigh\w*|dominat\w*|matters? more|counts? more|weighs? more|takes? over|stronger)/,
  `(?:weigh\\w*|multipl\\w*|scales?) .{0,20}(?:entrop\\w*|${DS})`,
  /(dominat\w*|outweigh\w*|wins?|takes? over) .{0,10}(the )?entrop\w*/);
const TEMP_IDEA_EN = any(together(TEMP_EN, FLIP_EN, 70), together(TEMP_EN, WEIGHT_EN, 40), /depends? on (the )?temperature/);
const TEMP_DE = String.raw`(?:temperatur\w*|\btemp\b|\bt\b|erhitz\w*|erwärm\w*|heiß\w*|heiss\w*|kalt\w*|kälte\w*|kälter|kühl\w*|abkühl\w*|wärmer)`;
const FLIP_DE = String.raw`(?:vorzeichen.{0,25}(?:umkehr\w*|ändern|ändert|wechsel\w*|umdreh\w*|kipp\w*|umschlag\w*|umspring\w*)|(?:kehrt|ändert|wechselt|kippt|dreht) .{0,25}vorzeichen|umkehr\w*|entscheid\w*|bestimm\w*|ausschlag\w*|umschlag\w*|umkipp\w*|kipp\w*|beeinfluss\w*)`;
const WEIGHT_DE = any(
  `t${TIMES}${DS}.{0,30}(?:wächst|größer|steigt|nimmt zu|überwieg\\w*|gewinnt|dominier\\w*|wichtiger|stärker)`,
  /entropie\w*.{0,30}(wächst|größer|wichtiger|überwieg\w*|gewinnt|dominier\w*|stärker|mehr gewicht|ins gewicht|setzt sich durch|\bmehr\b)/,
  `(?:gewicht\\w*|multiplizier\\w*|verstärk\\w*) .{0,20}(?:entropie\\w*|${DS})`,
  /(überwieg\w*|gewinnt|dominier\w*|wächst|wichtiger|stärker) .{0,10}(der |die )?entropie\w*/);
const TEMP_IDEA_DE = any(together(TEMP_DE, FLIP_DE, 70), together(TEMP_DE, WEIGHT_DE, 40), /hängt .{0,30}temperatur\w* ab/, /temperaturabhängig/);
// The misconception: whether a reaction can run does not depend on temperature.
const T_IRRELEVANT = {
  en: /^(?!.*(δ ?h|\bdh\b|enthalp|δ ?s\b|\bds\b|entrop|exotherm|endotherm)).*((whether|if) .{0,40}(runs?|happens?|spontan\w*|can run|feasible).{0,30}(independent of|(doesn't|does not|don't|do not) depend on|has nothing to do with) (the )?temperature|temperature (doesn't|does not|never) (matter|change whether|decide|affect whether|influence whether)|temperature (only|just) (changes|affects|sets) (the )?(speed|rate|how fast))/,
  de: /^(?!.*(δ ?h|\bdh\b|enthalpie|δ ?s\b|\bds\b|entropie|exotherm|endotherm)).*(\bob\b .{0,40}(abläuft|ablaufen|freiwillig|spontan).{0,30}(hängt )?nicht von der temperatur|unabhängig von der temperatur|temperatur (spielt )?keine rolle|temperatur (ändert|beeinflusst|bestimmt) nur (die )?(geschwindigkeit|schnelligkeit))/,
};

// Idea 4, the crossover: ΔG = 0 at T = ΔH / ΔS.
const DIV_EN = String.raw`\s?(?:\/|÷|:|divided by|over)\s?`;
const DIV_DE = String.raw`\s?(?:\/|÷|:|geteilt durch|dividiert durch|durch)\s?`;
const SWITCH_EN = String.raw`(?:temperatur\w*|\bt\b|switch\w*|crossover|flip\w*|border|boundary|turning point|tipping point|changes? sign|sign changes?)`;
const SWITCH_DE = String.raw`(?:temperatur\w*|\bt\b|wechsel\w*|umschlag\w*|grenze\w*|grenztemperatur|umkehr\w*|vorzeichen\w*|kipp\w*)`;
const ZERO_EN = `${G_EN}\\s?(?:=|is|equals|becomes|is exactly|hits|reaches)? ?(?:0|zero)\\b`;
const ZERO_DE = `${G_DE}\\s?(?:=|ist|wird|gleich|genau)? ?(?:0|null)\\b`;
const CROSS_EN = any(
  `${DH}${DIV_EN}${DS}`,
  `divid\\w* ${DH}.{0,10}by ${DS}`,
  /(divid\w*|split) (the )?(enthalpy|energy)( change)? by (the )?entropy/,
  /(enthalpy|energy)( change)? divided by (the )?entropy/,
  together(ZERO_EN, SWITCH_EN, 40),
  `(?:at which|where|when) .{0,10}${ZERO_EN}`);
const CROSS_DE = any(
  `${DH}${DIV_DE}${DS}`,
  /(enthalpie\w*|energie\w*) (geteilt |dividiert )?durch (die )?entropie/,
  together(ZERO_DE, SWITCH_DE, 40),
  `(?:bei (?:der|dem|welcher)|wo|wenn) .{0,15}${ZERO_DE}`);

// Idea 5, ΔG says whether, not how fast.
// Negations are written out word for word: the matcher accepts a negation inside a match only when the pattern's
// source contains it literally (ideas.ts).
const NEG_EN = "nothing about|nothing to do|doesn't say|doesn't tell|doesn't mean|doesn't show|doesn't give|doesn't predict|doesn't necessarily|does not say|does not tell|does not mean|does not show|does not give|does not predict|does not necessarily|can't tell|can't say|cannot tell|cannot say|not how|not about|not the|not necessarily|no information|no info|isn't about|isn't the|isn't fast|isn't quick|is not fast|is not quick|not fast|not quick|not speed|not rate";
const NEG_DE = 'nichts über|nichts darüber|nichts zur|nichts zu|nicht wie|nicht, wie|nicht die|nicht über|nicht an|nicht aus|nicht schnell|nicht sofort|nicht unbedingt|nicht automatisch|nicht zwingend|nicht zwangsläufig|nicht gleich|nicht, dass|nicht dass|keine aussage|keine auskunft|keine information|keine informationen';
const RATE_EN = String.raw`(?:fast|quick\w*|speed\w*|rate|how long|slow\w*|time|rapid\w*|immediate\w*|at once|right away|kinetic\w*)`;
const NOTRATE_EN = any(
  `(?:${G_EN}|spontan\\w*|exergonic|can run|runs? by (?:it|them)sel\\w*|feasib\\w*|the sign)\\b.{0,60}(?:${NEG_EN}).{0,40}${RATE_EN}`,
  /\bnot how (fast|quick\w*|long|soon)/, /\b(not the speed|not the rate|not speed|not rate)\b/,
  /\bwhether\b.{0,40}(not how|not when|not the speed|not the rate|not speed|not rate)/,
  `(?:${G_EN}|spontan\\w*|exergonic|can run)\\b.{0,50}(?:can|may|might|could) (?:still |also )?(?:be|run|go|happen) (?:very |extremely |incredibly |really |far too |too )?(?:slow\\w*|sluggish\\w*)`,
  /(spontaneous|by itself|exergonic) (doesn't mean|does not mean|doesn't necessarily mean|isn't the same as|is not the same as|isn't fast|is not fast|isn't quick|is not quick|isn't immediate|is not immediate)/,
  /diamond\w*.{0,60}(slow\w*|takes? (forever|ages)|barely|never notice)/,
  /\b(reaction|it|change|process)s? (can|may|might|could) (still |also )?(be|run|go|happen) (very |extremely |incredibly |really |far too |too )?(slow\w*|sluggish)/,
  `${G_EN}.{0,20}(?:< ?0|negative).{0,40}\\bbut\\b.{0,30}(?:slow\\w*|takes? (?:forever|ages)|doesn't happen|doesn't react|doesn't run|does not happen|does not react|does not run)`,
  /(rate|speed|how fast)\b.{0,40}\b(separate|different|another) (question|thing|matter)/,
  /(spontan\w*|exergon\w*|by itself|δ ?g ?< ?0)\s?(≠|!=|=\/=|is not equal to|unequal to)\s?(fast|quick\w*|rapid\w*)/);
const RATE_DE = String.raw`(?:schnell\w*|geschwindigkeit\w*|tempo|wie lange|langsam\w*|dauer\w*|zeit\w*|rasch\w*|sofort|kinetik\w*)`;
const NOTRATE_DE = any(
  `(?:${G_DE}|spontan\\w*|freiwillig\\w*|exergon\\w*|von selbst)\\b.{0,60}(?:${NEG_DE}).{0,40}${RATE_DE}`,
  /nicht wie (schnell|rasch|lange|bald)|nicht, wie (schnell|rasch|lange|bald)/,
  /nicht die (geschwindigkeit|reaktionsgeschwindigkeit)|nicht über die (geschwindigkeit|reaktionsgeschwindigkeit)/,
  /\bob\b.{0,40}(nicht wie schnell|nicht, wie schnell|nicht wann|nicht die geschwindigkeit)/,
  `(?:${G_DE}|spontan\\w*|freiwillig\\w*|exergon\\w*)\\b.{0,50}(?:kann|können|könnte) .{0,25}(?:sehr |extrem |unmerklich |unendlich )?langsam`,
  /(spontan|freiwillig)\w* (heißt|bedeutet|ist) (nicht schnell|nicht sofort|nicht unbedingt schnell|nicht automatisch schnell|nicht gleich schnell|nicht dasselbe wie schnell)/,
  /diamant\w*.{0,60}(langsam|dauert ewig|unmerklich|nie bemerk)/,
  /(reaktion|sie|vorgang|prozess)\w* (kann|können|könnte|könnten) (trotzdem |dennoch |aber |auch )?(sehr |extrem |unmerklich |unendlich )?langsam/,
  `${G_DE}.{0,20}(?:< ?0|negativ\\w*).{0,40}(?:aber|trotzdem|dennoch).{0,30}(?:langsam\\w*|unmerklich|dauert)`,
  /(geschwindigkeit|wie schnell)\b.{0,40}(andere|eigene|getrennte) (frage|sache)/,
  /(spontan\w*|freiwillig\w*|exergon\w*|δ ?g ?< ?0)\s?(≠|!=|=\/=|ungleich)\s?(schnell\w*|rasch\w*)/);
// The misconception: a negative ΔG means a fast reaction.
const DG_FAST = {
  en: new RegExp(`^(?!.*(\\bnot\\b|n't|\\bno\\b|\\bnever\\b|nothing|whether|≠|!=|=\\/=|unequal)).*(?:(?:${NEGG_EN}|exergonic|spontaneous)\\b.{0,40}\\b(?:fast|quick\\w*|rapid\\w*|immediate\\w*|at once|right away|instantly)\\b|more negative.{0,30}(?:faster|quicker))`),
  de: new RegExp(`^(?!.*(nicht|kein|\\bnie\\b|nichts|\\bob\\b|≠|!=|=\\/=|ungleich)).*(?:(?:${NEGG_DE}|exergon\\w*|spontan\\w*|freiwillig\\w*).{0,40}(?:schnell\\w*|rasch\\w*|sofort|zügig|augenblicklich)|negativer.{0,30}schneller)`),
};

export const UNIT20: UnitContent = {
  n: 20,
  title: b('Free energy', 'Freie Enthalpie'),
  lead: b('How energy and entropy together decide whether a reaction can run by itself, why temperature can tip the balance, and what ΔG does not tell you.',
    'Wie Energie und Entropie zusammen entscheiden, ob eine Reaktion freiwillig ablaufen kann, warum die Temperatur den Ausschlag geben kann und was ΔG nicht angibt.'),

  puzzle: {
    title: b('How hot must a lime kiln be?', 'Wie heiß muss ein Kalkofen sein?'),
    lead: b('Quicklime, calcium oxide, is made by heating limestone, calcium carbonate, in a kiln: CaCO₃ → CaO + CO₂. At room temperature limestone stays limestone: whole cliffs and buildings are made of it. In a lime kiln the stone reaches about 900 °C.',
      'Branntkalk, Calciumoxid, entsteht, wenn man Kalkstein, Calciumcarbonat, in einem Kalkofen erhitzt: CaCO₃ → CaO + CO₂. Bei Raumtemperatur bleibt Kalkstein Kalkstein: Ganze Felsen und Gebäude bestehen daraus. Im Kalkofen erreicht der Stein etwa 900 °C.'),
    data: {
      caption: b('Burning limestone, per mole: measured at 25 °C and 1 bar. A plus sign means energy taken in or entropy gained. Kiln temperature: European Environment Agency.',
        'Kalkbrennen, pro Mol: gemessen bei 25 °C und 1 bar. Ein Pluszeichen bedeutet aufgenommene Energie oder gewonnene Entropie. Ofentemperatur: Europäische Umweltagentur.'),
      head: [b('Quantity', 'Größe'), b('Value', 'Wert')],
      rows: [
        { cells: [b('ΔH, energy taken in', 'ΔH, aufgenommene Energie'), '+179.2 kJ/mol'] },
        { cells: [b('ΔS, entropy change (a gas forms)', 'ΔS, Entropieänderung (ein Gas entsteht)'), '+160.2 J/(mol·K)'] },
        { cells: [b('temperature of the stone in a lime kiln', 'Temperatur des Steins im Kalkofen'), b('about 900 °C', 'etwa 900 °C')] },
      ],
      numeric: [1],
    },
    clash: b('The reaction takes in energy, so energy alone says it should not run by itself. But a gas forms and the entropy rises, which pushes the other way (unit 19). Above which temperature can limestone decompose by itself?',
      'Die Reaktion nimmt Energie auf, nach der Energie allein sollte sie also nicht freiwillig ablaufen. Aber es entsteht ein Gas, und die Entropie steigt, das wirkt in die andere Richtung (Einheit 19). Oberhalb welcher Temperatur kann Kalkstein freiwillig zerfallen?'),
    question: {
      id: 'u20-puzzle', unit: 20, kind: 'choice', format: 'predict', withConfidence: true, evidence: 'predict',
      concepts: ['u20.crossover', 'u20.temperature'], targets: ['units-j-kj', 'spontaneous-exothermic', 't-irrelevant'],
      prompt: b('Your best guess:', 'Deine beste Vermutung:'),
      options: [
        { text: b('Above about 1 K: at almost any temperature', 'Oberhalb von etwa 1 K: bei fast jeder Temperatur'), mis: 'units-j-kj' },
        { text: b('Never: it takes in energy, so it always needs a push', 'Nie: Sie nimmt Energie auf, braucht also immer einen Anstoß'), mis: 'spontaneous-exothermic' },
        { text: b('Above about 845 °C (1119 K)', 'Oberhalb von etwa 845 °C (1119 K)'), correct: true },
        { text: b('At room temperature too, if you wait long enough', 'Auch bei Raumtemperatur, wenn man lange genug wartet'), mis: 't-irrelevant' },
      ],
      explain: b('The entropy term grows with temperature and must outweigh the 179.2 kJ/mol taken in: T = 179.2 kJ/mol ÷ 0.1602 kJ/(mol·K) = 1119 K, 845 °C. Using 160.2 without turning J into kJ gives 1.1 K, a thousand times too low. Below 1119 K no amount of waiting helps; kilns run a little above it (this is for CO₂ at 1 bar: where the CO₂ is swept away, decomposition starts lower, units 24–25).',
        'Der Entropieterm wächst mit der Temperatur und muss die aufgenommenen 179,2 kJ/mol übertreffen: T = 179,2 kJ/mol : 0,1602 kJ/(mol·K) = 1119 K, also 845 °C. Wer 160,2 einsetzt, ohne J in kJ umzurechnen, erhält 1,1 K, tausendmal zu wenig. Unterhalb von 1119 K hilft kein Warten; Kalköfen arbeiten etwas darüber (das gilt für CO₂ bei 1 bar: Wird das CO₂ abgeführt, beginnt der Zerfall schon tiefer, Einheiten 24–25).'),
    } as ChoiceItem,
    after: b('Next: set the temperature yourself in the Energy Landscape and watch the sign of ΔG.', 'Als Nächstes: Stell die Temperatur in der Energielandschaft selbst ein und beobachte das Vorzeichen von ΔG.'),
  },

  explore: {
    title: b('The Energy Landscape: ΔH against T·ΔS', 'Die Energielandschaft: ΔH gegenüber T·ΔS'),
    intro: b('Three bars: ΔH, the energy change (unit 17); −T·ΔS, the entropy change (unit 19) times the temperature in kelvin (K = °C + 273); and their sum ΔG, the change in [[gibbs-energy|Gibbs energy]]: ΔG = ΔH − T·ΔS. ΔG < 0: the reaction can run by itself ([[exergonic]], "[[spontaneous]]"); ΔG > 0: it cannot (endergonic). ΔS is given in J/(mol·K) and ΔH in kJ/mol, so divide ΔS by 1000 before you combine them. ΔH and ΔS are treated as constant with temperature and every gas is at 1 bar: a model.',
      'Drei Balken: ΔH, die Enthalpieänderung (Einheit 17); −T·ΔS, die Entropieänderung (Einheit 19) mal die Temperatur in Kelvin (T in K = Temperatur in °C + 273); und ihre Summe ΔG, die Änderung der [[gibbs-energy|freien Enthalpie]] G (auch Gibbs-Energie). Das ist die Gibbs-Helmholtz-Gleichung: ΔG = ΔH − T·ΔS. ΔG < 0: Die Reaktion kann freiwillig ablaufen ([[exergonic|exergonisch]], [[spontaneous|spontan]]); ΔG > 0: Sie kann es nicht (endergonisch). ΔS wird in J/(mol·K) angegeben, ΔH in kJ/mol: Teile ΔS also durch 1000, bevor du rechnest. ΔH und ΔS werden als temperaturunabhängig angenommen, alle Gase bei 1 bar: ein Modell.'),
    tasks: [
      { id: 'ice', key: true, text: b('Start with ice melting. Slide the temperature across 0 °C (273 K) and watch the ΔG bar.', 'Beginne mit schmelzendem Eis. Schieb die Temperatur über 0 °C (273 K) und beobachte den ΔG-Balken.') },
      { id: 'lime', key: true, text: b('Pick burning limestone. Find the temperature above which it can decompose by itself.', 'Wähle das Kalkbrennen. Finde die Temperatur, oberhalb der Kalkstein freiwillig zerfallen kann.') },
      { id: 'always', key: true, text: b('Find a reaction whose ΔG stays negative wherever you put the slider.', 'Finde eine Reaktion, deren ΔG negativ bleibt, wo auch immer der Regler steht.') },
      { id: 'cold', text: b('Find a reaction that can run by itself only when it is cold enough.', 'Finde eine Reaktion, die nur dann freiwillig ablaufen kann, wenn es kalt genug ist.') },
      { id: 'reverse', text: b('Reverse a reaction. What happens to the signs of ΔH, ΔS and ΔG?', 'Kehre eine Reaktion um. Was passiert mit den Vorzeichen von ΔH, ΔS und ΔG?') },
      { id: 'never', challenge: true, text: b('Find a reaction that cannot run by itself at any temperature. None of the four does as written.', 'Finde eine Reaktion, die bei keiner Temperatur freiwillig ablaufen kann. Keine der vier tut das so, wie sie dasteht.') },
    ],
    notes: {
      ice: b('ΔG = 0 at 273 K: ice and water sit side by side. Below it ΔG > 0 and ice stays solid; above it the −T·ΔS bar outgrows ΔH, ΔG < 0, and ice melts by itself.',
        'ΔG = 0 bei 273 K: Eis und Wasser liegen nebeneinander vor. Darunter ist ΔG > 0, und Eis bleibt fest; darüber wird der −T·ΔS-Balken länger als ΔH, ΔG < 0, und Eis schmilzt freiwillig.'),
      lime: b('ΔG = 0 at 1119 K (845 °C). Written out as in an exam: ΔS = 160.2 J/(mol·K) = 0.1602 kJ/(mol·K); T = ΔH ÷ ΔS = 179.2 ÷ 0.1602 = 1119 K. Answer: above about 845 °C limestone can decompose by itself, because there T·ΔS outweighs ΔH.',
        'ΔG = 0 bei 1119 K (845 °C). So schreibst du es in der Klausur: ΔS = 160,2 J/(mol·K) = 0,1602 kJ/(mol·K); T = ΔH : ΔS = 179,2 : 0,1602 = 1119 K. Antwort: Oberhalb von etwa 845 °C kann Kalkstein freiwillig zerfallen, weil dort T·ΔS größer ist als ΔH.'),
      always: b('Hydrogen peroxide: ΔH < 0 and ΔS > 0, so both bars point down and ΔG < 0 at every temperature.',
        'Wasserstoffperoxid: ΔH < 0 und ΔS > 0, also zeigen beide Balken nach unten, und ΔG < 0 bei jeder Temperatur.'),
      cold: b('ΔH < 0 and ΔS < 0: here −T·ΔS points up and grows as you heat, so ΔG < 0 only below the crossover.',
        'ΔH < 0 und ΔS < 0: Hier zeigt −T·ΔS nach oben und wächst beim Erhitzen, also ist ΔG < 0 nur unterhalb des Vorzeichenwechsels.'),
      reverse: b('Reversing flips the signs of ΔH, ΔS and so of ΔG. At any one temperature, if one direction can run by itself, the other cannot; the crossover temperature stays the same.',
        'Umkehren dreht die Vorzeichen von ΔH, ΔS und damit von ΔG um. Bei jeder Temperatur gilt: Kann die eine Richtung freiwillig ablaufen, kann es die andere nicht; die Temperatur des Vorzeichenwechsels bleibt gleich.'),
      never: b('Hydrogen peroxide reversed: water and oxygen forming H₂O₂, ΔH = +196.1 kJ/mol, ΔS = −126.0 J/(mol·K). Both bars point up: ΔG > 0 at every temperature. It happens only when another process drives it.',
        'Umgekehrtes Wasserstoffperoxid: Wasser und Sauerstoff bilden H₂O₂, ΔH = +196,1 kJ/mol, ΔS = −126,0 J/(mol·K). Beide Balken zeigen nach oben: ΔG > 0 bei jeder Temperatur. Es geschieht nur, wenn ein anderer Vorgang es antreibt.'),
    },
    check: {
      id: 'u20-check', unit: 20, kind: 'choice', format: 'predict', withConfidence: true, evidence: 'predict',
      concepts: ['u20.four-cases', 'u20.temperature'], targets: ['spontaneous-exothermic', 't-irrelevant'],
      prompt: b('A reaction takes in energy (ΔH > 0) and its entropy rises (ΔS > 0). When can it run by itself?', 'Eine Reaktion nimmt Energie auf (ΔH > 0), und ihre Entropie steigt (ΔS > 0). Wann kann sie freiwillig ablaufen?'),
      options: [
        { text: b('Never: taking in energy, it always needs a push', 'Nie: Da sie Energie aufnimmt, braucht sie immer einen Anstoß'), mis: 'spontaneous-exothermic' },
        { text: b('Only below a certain temperature', 'Nur unterhalb einer bestimmten Temperatur') },
        { text: b('Only above the temperature where T·ΔS outweighs ΔH', 'Nur oberhalb der Temperatur, bei der T·ΔS größer wird als ΔH'), correct: true },
        { text: b('At every temperature, if you wait long enough', 'Bei jeder Temperatur, wenn man lange genug wartet'), mis: 't-irrelevant' },
      ],
      explain: b('ΔH > 0 pushes ΔG up; −T·ΔS pulls it down, more strongly the hotter it is. Above T = ΔH ÷ ΔS the entropy term wins: ice above 273 K, limestone above 1119 K.',
        'ΔH > 0 drückt ΔG nach oben; −T·ΔS zieht es nach unten, umso stärker, je heißer es ist. Oberhalb von T = ΔH : ΔS gewinnt der Entropieterm: Eis oberhalb von 273 K, Kalkstein oberhalb von 1119 K.'),
    } as ChoiceItem,
  },

  predictions: [
    {
      item: {
        id: 'u20-no2', unit: 20, kind: 'choice', format: 'predict', withConfidence: true, evidence: 'transfer',
        concepts: ['u20.temperature', 'u20.sign'], targets: ['t-irrelevant', 'negative-dg-fast'],
        prompt: b('Brown nitrogen dioxide pairs up into colourless dinitrogen tetroxide: 2 NO₂ → N₂O₄, ΔH = −55.3 kJ/mol, ΔS = −175.8 J/(mol·K). A sealed tube of the gas is put in ice water (0 °C), then in boiling water (100 °C). What does ΔG predict for the colour at each temperature?',
          'Braunes Stickstoffdioxid verbindet sich zu farblosem Distickstofftetroxid: 2 NO₂ → N₂O₄, ΔH = −55,3 kJ/mol, ΔS = −175,8 J/(mol·K). Ein verschlossenes Röhrchen mit dem Gas kommt in Eiswasser (0 °C), dann in siedendes Wasser (100 °C). Was sagt ΔG für die Farbe bei jeder Temperatur voraus?'),
        options: [
          { text: b('Paler at 0 °C (N₂O₄ favoured), darker brown at 100 °C (NO₂ favoured)', 'Blasser bei 0 °C (N₂O₄ begünstigt), dunkler braun bei 100 °C (NO₂ begünstigt)'), correct: true },
          { text: b('Darker brown at 0 °C, paler at 100 °C: heat drives the pairing', 'Dunkler braun bei 0 °C, blasser bei 100 °C: Wärme treibt die Verbindung an') },
          { text: b('Pale at both: it gives out energy, so temperature does not matter', 'Blass bei beiden: Sie gibt Energie ab, also spielt die Temperatur keine Rolle'), mis: 't-irrelevant' },
          { text: b('The same at both: ΔG only sets how fast the gas pairs up', 'Gleich bei beiden: ΔG legt nur fest, wie schnell sich das Gas verbindet'), mis: 'negative-dg-fast' },
        ],
        explain: b('At 273 K: ΔG = −55.3 + 273 × 0.1758 = −7.3 kJ/mol, so the pairing is favoured and the gas turns paler. At 373 K: ΔG = −55.3 + 373 × 0.1758 = +10.3 kJ/mol, so the reverse is favoured and the gas turns dark brown. The switch is at 55.3 ÷ 0.1758 = 315 K (41 °C).',
          'Bei 273 K: ΔG = −55,3 + 273 · 0,1758 = −7,3 kJ/mol, die Verbindung ist begünstigt, und das Gas wird blasser. Bei 373 K: ΔG = −55,3 + 373 · 0,1758 = +10,3 kJ/mol, die Rückreaktion ist begünstigt, und das Gas wird dunkelbraun. Der Wechsel liegt bei 55,3 : 0,1758 = 315 K (41 °C).'),
      } as ChoiceItem,
      show: { engine: 'energy', reaction: 'no2-dimer', mode: 'gibbs', temp: 273 },
      revealText: b('At 0 °C ΔG = −7.3 kJ/mol and the tube turns pale yellow; at 100 °C ΔG = +10.3 kJ/mol and it turns dark brown. ΔS < 0 here, so the −T·ΔS bar points up and outgrows ΔH above 315 K (41 °C). The tube always holds a mixture of both gases; ΔG says which one it holds more of, and units 24–25 show how much.',
        'Bei 0 °C ist ΔG = −7,3 kJ/mol, und das Röhrchen wird blassgelb; bei 100 °C ist ΔG = +10,3 kJ/mol, und es wird dunkelbraun. Hier ist ΔS < 0, also zeigt der −T·ΔS-Balken nach oben und wird oberhalb von 315 K (41 °C) länger als ΔH. Im Röhrchen ist immer ein Gemisch beider Gase; ΔG gibt an, welches überwiegt, und die Einheiten 24–25 zeigen, wie stark.'),
      extra: {
        title: b('ΔG at two temperatures', 'ΔG bei zwei Temperaturen'),
        steps: [
          b('Turn ΔS into kJ: −175.8 J/(mol·K) = −0.1758 kJ/(mol·K).', 'ΔS in kJ umrechnen: −175,8 J/(mol·K) = −0,1758 kJ/(mol·K).'),
          b('At 0 °C, T = 273 K: ΔG = −55.3 − 273 × (−0.1758) = −55.3 + 48.0 = −7.3 kJ/mol.', 'Bei 0 °C, T = 273 K: ΔG = −55,3 − 273 · (−0,1758) = −55,3 + 48,0 = −7,3 kJ/mol.'),
          b('At 100 °C, T = 373 K: ΔG = −55.3 + 373 × 0.1758 = −55.3 + 65.6 = +10.3 kJ/mol.', 'Bei 100 °C, T = 373 K: ΔG = −55,3 + 373 · 0,1758 = −55,3 + 65,6 = +10,3 kJ/mol.'),
          b('Answer: at 0 °C ΔG < 0, so colourless N₂O₄ is favoured and the tube looks paler; at 100 °C ΔG > 0, so brown NO₂ is favoured and the tube looks darker.', 'Antwort: Bei 0 °C ist ΔG < 0, also ist farbloses N₂O₄ begünstigt, und das Röhrchen wirkt blasser; bei 100 °C ist ΔG > 0, also ist braunes NO₂ begünstigt, und das Röhrchen wirkt dunkler.'),
        ],
      },
    },
    {
      item: {
        id: 'u20-haber', unit: 20, kind: 'choice', format: 'predict', withConfidence: true, evidence: 'predict',
        concepts: ['u20.not-rate', 'u20.crossover'], targets: ['negative-dg-fast', 't-irrelevant'],
        prompt: b('Ammonia synthesis: N₂ + 3 H₂ → 2 NH₃, ΔH = −91.8 kJ/mol, ΔS = −198.1 J/(mol·K). Above 463 K (190 °C) ΔG turns positive. Yet the Haber process runs at about 450 °C. Why so hot?',
          'Ammoniaksynthese: N₂ + 3 H₂ → 2 NH₃, ΔH = −91,8 kJ/mol, ΔS = −198,1 J/(mol·K). Oberhalb von 463 K (190 °C) wird ΔG positiv. Trotzdem läuft das Haber-Bosch-Verfahren bei etwa 450 °C. Warum so heiß?'),
        options: [
          { text: b('At 450 °C ΔG is more negative, so more ammonia forms', 'Bei 450 °C ist ΔG negativer, also entsteht mehr Ammoniak') },
          { text: b('Below 190 °C ΔG < 0, so ammonia forms fast there anyway', 'Unter 190 °C ist ΔG < 0, dort entsteht Ammoniak also ohnehin schnell'), mis: 'negative-dg-fast' },
          { text: b('Temperature changes only the speed, never whether it can run', 'Die Temperatur ändert nur die Geschwindigkeit, nie, ob sie ablaufen kann'), mis: 't-irrelevant' },
          { text: b('When cool it can run but is far too slow; heat buys speed', 'Kühl kann sie ablaufen, ist aber viel zu langsam; Wärme beschleunigt sie'), correct: true },
        ],
        explain: b('ΔG < 0 below 190 °C says ammonia can form, not how fast: in the cool it forms far too slowly to be useful, even over a catalyst. At 450 °C it is fast enough, but there ΔG = +51.4 kJ/mol at 1 bar, so the plant works at about 200 atmospheres and removes the ammonia as it forms.',
          'ΔG < 0 unter 190 °C gibt an, dass Ammoniak entstehen kann, nicht wie schnell: In der Kälte entsteht es selbst am Katalysator viel zu langsam. Bei 450 °C geht es schnell genug, dort ist aber ΔG = +51,4 kJ/mol bei 1 bar, also arbeitet die Anlage bei etwa 200 bar und entfernt das Ammoniak, sobald es entsteht.'),
      } as ChoiceItem,
      show: { engine: 'energy', reaction: 'nh3', mode: 'gibbs', temp: 723 },
      revealText: b('ΔG says whether a reaction can run, not how fast. Below 190 °C ammonia can form but far too slowly, so the plant runs at about 450 °C over an iron catalyst (unit 23), where ΔG = +51.4 kJ/mol for gases at 1 bar. A pressure of about 200 atmospheres and removing the ammonia as it forms still give a useful yield (units 24–25).',
        'ΔG gibt an, ob eine Reaktion ablaufen kann, nicht wie schnell. Unter 190 °C kann Ammoniak entstehen, aber viel zu langsam, also läuft die Anlage bei etwa 450 °C an einem Eisenkatalysator (Einheit 23), wo ΔG = +51,4 kJ/mol für Gase bei 1 bar ist. Ein Druck von etwa 200 bar und das laufende Entfernen des Ammoniaks ergeben trotzdem eine brauchbare Ausbeute (Einheiten 24–25).'),
      extra: {
        title: b('Can run, but how fast?', 'Kann ablaufen, aber wie schnell?'),
        steps: [
          b('Below 463 K (190 °C) ΔG < 0: ammonia can form by itself.', 'Unter 463 K (190 °C) ist ΔG < 0: Ammoniak kann freiwillig entstehen.'),
          b('"Can" says nothing about speed: the N≡N triple bond (946 kJ/mol, unit 17) must be broken, and in the cool that happens far too slowly.', '„Kann“ sagt nichts über die Geschwindigkeit: Die N≡N-Dreifachbindung (946 kJ/mol, Einheit 17) muss gespalten werden, und in der Kälte geschieht das viel zu langsam.'),
          b('Hotter is faster, but at 723 K (450 °C): ΔG = −91.8 + 723 × 0.1981 = +51.4 kJ/mol for gases at 1 bar.', 'Heißer ist schneller, aber bei 723 K (450 °C) gilt: ΔG = −91,8 + 723 · 0,1981 = +51,4 kJ/mol für Gase bei 1 bar.'),
          b('Answer: the plant runs at about 450 °C because the reaction is fast enough there, and uses a high pressure (about 200 atmospheres) so that ammonia still forms.', 'Antwort: Die Anlage läuft bei etwa 450 °C, weil die Reaktion dort schnell genug ist, und arbeitet mit hohem Druck (etwa 200 bar), damit trotzdem Ammoniak entsteht.'),
        ],
      },
    },
  ],

  examples: [
    {
      title: b('Ice at 0 °C', 'Eis bei 0 °C'), tag: 'H2O',
      show: { engine: 'energy', reaction: 'ice-melt', mode: 'gibbs', temp: 273 },
      numbers: [
        { v: '+6.01 kJ/mol', label: b('ΔH, taken in to melt one mole of ice', 'ΔH, aufgenommen beim Schmelzen von einem Mol Eis') },
        { v: '+22.0 J/(mol·K)', label: b('ΔS, the entropy gained on melting', 'ΔS, die beim Schmelzen gewonnene Entropie') },
        { v: '273 K', label: b('where ΔG = 0: 6.01 ÷ 0.0220, that is 0 °C', 'dort ist ΔG = 0: 6,01 : 0,0220, also 0 °C') },
      ],
      body: b('Turn ΔS into kJ first: 22.0 J/(mol·K) = 0.0220 kJ/(mol·K), so ΔG = 0 at T = 6.01 ÷ 0.0220 = 273 K. Below it ΔG > 0 and ice stays solid; above it ΔG < 0 and ice melts by itself. Read backwards, this is how the 22.0 is measured: the heat of melting divided by the melting temperature.',
        'Rechne ΔS zuerst in kJ um: 22,0 J/(mol·K) = 0,0220 kJ/(mol·K), also ist ΔG = 0 bei T = 6,01 : 0,0220 = 273 K. Darunter ist ΔG > 0, und Eis bleibt fest; darüber ist ΔG < 0, und Eis schmilzt freiwillig. Rückwärts gelesen misst man so die 22,0: Schmelzwärme geteilt durch Schmelztemperatur.'),
      soWhat: b('A drink with ice cubes stays near 0 °C while ice is left: only there can ice and water sit side by side, and the heat flowing in goes into melting rather than warming.',
        'Ein Getränk mit Eiswürfeln bleibt nahe 0 °C, solange noch Eis da ist: Nur dort können Eis und Wasser nebeneinander bestehen, und die zufließende Wärme geht ins Schmelzen statt ins Erwärmen.'),
    },
    {
      title: b('Diamonds last', 'Diamanten halten'), tag: 'C',
      show: { engine: 'energy', reaction: 'diamond-graphite', mode: 'gibbs', temp: 298 },
      numbers: [
        { v: '−1.89 kJ/mol', label: b('ΔH for diamond turning into graphite', 'ΔH für den Übergang von Diamant zu Graphit') },
        { v: '+3.36 J/(mol·K)', label: b('ΔS: graphite has the higher entropy', 'ΔS: Graphit hat die höhere Entropie') },
        { v: '−2.9 kJ/mol', label: b('ΔG at 25 °C', 'ΔG bei 25 °C') },
      ],
      body: b('ΔH < 0 and ΔS > 0, so ΔG < 0 at every temperature (at 1 bar); at 25 °C ΔG = −1.89 − 298 × 0.00336 = −2.9 kJ/mol. Yet a diamond on a ring does not turn into pencil lead: its carbon atoms would first have to break strong bonds, and at room temperature that is far too slow to notice. ΔG says whether a change can run by itself, not how fast.',
        'ΔH < 0 und ΔS > 0, also ist ΔG < 0 bei jeder Temperatur (bei 1 bar); bei 25 °C ist ΔG = −1,89 − 298 · 0,00336 = −2,9 kJ/mol. Trotzdem wird ein Diamant am Ring nicht zu Bleistiftmine: Seine Kohlenstoffatome müssten erst starke Bindungen spalten, und bei Raumtemperatur geschieht das unmerklich langsam. ΔG gibt an, ob ein Vorgang freiwillig ablaufen kann, nicht wie schnell: „Spontan“ bedeutet in der Chemie „freiwillig“, nicht „schnell“.'),
      soWhat: b('Paper and wood are the same: burning them in air has ΔG < 0, yet they sit on a shelf for years until a flame starts them. Unit 21 shows the barrier that keeps them waiting.',
        'Mit Papier und Holz ist es genauso: Ihre Verbrennung an der Luft hat ΔG < 0, trotzdem liegen sie jahrelang im Regal, bis eine Flamme sie entzündet. Einheit 21 zeigt die Hürde, die sie warten lässt.'),
    },
    {
      title: b('Where the model breaks: boiling water', 'Wo das Modell an Grenzen stößt: siedendes Wasser'), tag: 'H2O(g)',
      show: { engine: 'energy', reaction: 'water-boil', mode: 'gibbs', temp: 373 },
      numbers: [
        { v: '370 K', label: b('boiling point predicted from 25 °C data (44.0 ÷ 0.1188)', 'Siedetemperatur, vorhergesagt aus Daten bei 25 °C (44,0 : 0,1188)') },
        { v: '373 K', label: b('boiling point measured (100 °C)', 'Siedetemperatur, gemessen (100 °C)') },
        { v: '40.65 kJ/mol', label: b('ΔH of boiling measured at 100 °C, against 44.0 at 25 °C', 'ΔH beim Sieden, gemessen bei 100 °C, gegenüber 44,0 bei 25 °C') },
      ],
      body: b('A formula is only as good as the numbers you put into it. With ΔH = 44.0 kJ/mol and ΔS = 118.8 J/(mol·K), both measured at 25 °C, ΔG = 0 at 44.0 ÷ 0.1188 = 370 K, 3 K below water\'s real boiling point. ΔH and ΔS themselves change with temperature: measured at 100 °C they are 40.65 kJ/mol and 108.9 J/(mol·K), which give 373 K.',
        'Eine Formel ist nur so gut wie die Zahlen, die man einsetzt. Mit ΔH = 44,0 kJ/mol und ΔS = 118,8 J/(mol·K), beide bei 25 °C gemessen, ist ΔG = 0 bei 44,0 : 0,1188 = 370 K, 3 K unter der echten Siedetemperatur von Wasser. ΔH und ΔS hängen selbst von der Temperatur ab: Bei 100 °C gemessen betragen sie 40,65 kJ/mol und 108,9 J/(mol·K), und damit ergeben sich 373 K.'),
      soWhat: b('In an exam, treat ΔH and ΔS as constant unless told otherwise, and add that the result is an estimate; the further from 25 °C, the larger the error can be.',
        'In der Klausur nimmst du ΔH und ΔS als konstant an, wenn nichts anderes angegeben ist, und schreibst dazu, dass das Ergebnis eine Näherung ist; je weiter von 25 °C entfernt, desto größer kann der Fehler werden.'),
    },
  ],

  flaw: {
    id: 'u20-flaw', unit: 20, kind: 'flaw', format: 'flaw', evidence: 'transfer', concepts: ['u20.gibbs', 'u20.crossover'], targets: ['units-j-kj'],
    prompt: b('Where does this reasoning first go wrong?', 'Wo geht diese Überlegung zum ersten Mal schief?'),
    lines: [
      b('For N₂ + 3 H₂ → 2 NH₃ at 298 K: ΔG = ΔH − T·ΔS = −91.8 − 298 × (−198.1) = +58 942 kJ/mol.', 'Für N₂ + 3 H₂ → 2 NH₃ bei 298 K: ΔG = ΔH − T·ΔS = −91,8 − 298 · (−198,1) = +58 942 kJ/mol.'),
      b('ΔG is positive, so at 25 °C ammonia cannot form by itself.', 'ΔG ist positiv, also kann Ammoniak bei 25 °C nicht freiwillig entstehen.'),
      b('ΔS is negative, so heating makes −T·ΔS larger and ΔG rise.', 'ΔS ist negativ, also wird −T·ΔS beim Erhitzen größer, und ΔG steigt.'),
      b('So ammonia cannot form by itself at any temperature.', 'Also kann Ammoniak bei keiner Temperatur freiwillig entstehen.'),
    ],
    flaw: 0,
    alsoFalse: [1, 3],
    near: [{ step: 2, note: b('This one is true: with ΔS < 0, −T·ΔS is positive and grows with T. Look at the units in step 1.', 'Dieser Schritt stimmt: Mit ΔS < 0 ist −T·ΔS positiv und wächst mit T. Schau dir die Einheiten in Schritt 1 an.') }],
    explain: b('Step 1 is the first wrong step: ΔS is in J/(mol·K) and must become −0.1981 kJ/(mol·K), so ΔG = −91.8 + 59.0 = −32.8 kJ/mol. Step 2 is then false: ammonia can form by itself at 25 °C. Step 3 is true: heating makes ΔG rise. Step 4 is false: ΔG < 0 at every temperature below 91.8 ÷ 0.1981 = 463 K.',
      'Schritt 1 ist der erste falsche Schritt: ΔS steht in J/(mol·K) und muss zu −0,1981 kJ/(mol·K) werden, also ΔG = −91,8 + 59,0 = −32,8 kJ/mol. Damit ist Schritt 2 falsch: Ammoniak kann bei 25 °C freiwillig entstehen. Schritt 3 stimmt: Beim Erhitzen steigt ΔG. Schritt 4 ist falsch: ΔG < 0 bei jeder Temperatur unter 91,8 : 0,1981 = 463 K.'),
  } as FlawItem,

  deeper: {
    id: 'u20-deeper', unit: 20, kind: 'estimate', format: 'estimate', evidence: 'transfer', concepts: ['u20.crossover', 'u20.four-cases'], targets: ['units-j-kj'],
    prompt: b('Sulfur trioxide, for making sulfuric acid, comes from sulfur dioxide: 2 SO₂ + O₂ → 2 SO₃, ΔH = −197.8 kJ/mol, ΔS = −188.1 J/(mol·K). Above which temperature can this reaction no longer run by itself (gases at 1 bar)? Answer in kelvin.',
      'Schwefeltrioxid für die Herstellung von Schwefelsäure entsteht aus Schwefeldioxid: 2 SO₂ + O₂ → 2 SO₃, ΔH = −197,8 kJ/mol, ΔS = −188,1 J/(mol·K). Oberhalb welcher Temperatur kann diese Reaktion nicht mehr freiwillig ablaufen (Gase bei 1 bar)? Antworte in Kelvin.'),
    min: 0, max: 3000, step: 1, answer: 1052, tolerance: 15, suffix: ' K',
    near: [
      { value: 1, tol: 1, note: b('J and kJ are mixed: turn −188.1 J/(mol·K) into −0.1881 kJ/(mol·K) before dividing.', 'J und kJ sind vermischt: Rechne −188,1 J/(mol·K) in −0,1881 kJ/(mol·K) um, bevor du teilst.') },
      { value: 778, tol: 10, note: b('That is the temperature in °C. The answer asks for kelvin: add 273.', 'Das ist die Temperatur in °C. Gefragt ist Kelvin: Addiere 273.') },
    ],
    explain: b('ΔH < 0 and ΔS < 0: it runs only while T·ΔS stays smaller in size than ΔH. ΔG = 0 at T = 197.8 ÷ 0.1881 = 1052 K (778 °C); above it ΔG > 0.',
      'ΔH < 0 und ΔS < 0: Die Reaktion läuft nur, solange T·ΔS dem Betrag nach kleiner bleibt als ΔH. ΔG = 0 bei T = 197,8 : 0,1881 = 1052 K (778 °C); darüber ist ΔG > 0.'),
  } as EstimateItem,

  explain: {
    prompt: b('In your own words: what does ΔG combine, what does its sign tell you, how can temperature change the answer, at which temperature does it switch, and what does ΔG not tell you?',
      'In eigenen Worten: Was verbindet ΔG, was gibt sein Vorzeichen an, wie kann die Temperatur das Ergebnis ändern, bei welcher Temperatur kippt es, und was gibt ΔG nicht an?'),
    ideas: [
      { id: 'gibbs', concept: 'u20.gibbs', idea: b('ΔG = ΔH − T·ΔS combines the energy change and the entropy change', 'ΔG = ΔH − T·ΔS verbindet Enthalpie- und Entropieänderung'), contra: ONLY_EXO,
        en: GIBBS_EN, de: GIBBS_DE },
      { id: 'sign', concept: 'u20.sign', idea: b('ΔG < 0: the reaction can run by itself (exergonic)', 'ΔG < 0: Die Reaktion kann freiwillig ablaufen (exergonisch)'), contra: { en: any(SIGN_CONTRA.en, DG_FAST.en), de: any(SIGN_CONTRA.de, DG_FAST.de) },
        en: SIGN_EN, de: SIGN_DE },
      { id: 'temperature', concept: 'u20.temperature', idea: b('Temperature weights the entropy term, so it can flip the sign of ΔG', 'Die Temperatur gewichtet den Entropieterm und kann so das Vorzeichen von ΔG umkehren'), contra: T_IRRELEVANT,
        en: TEMP_IDEA_EN, de: TEMP_IDEA_DE },
      { id: 'crossover', concept: 'u20.crossover', idea: b('The switch comes where ΔG = 0, at T = ΔH ÷ ΔS', 'Der Wechsel liegt bei ΔG = 0, also bei T = ΔH : ΔS'),
        en: CROSS_EN, de: CROSS_DE },
      { id: 'rate', concept: 'u20.not-rate', idea: b('ΔG says whether a reaction can run, not how fast', 'ΔG gibt an, ob eine Reaktion ablaufen kann, nicht wie schnell'), contra: DG_FAST,
        en: NOTRATE_EN, de: NOTRATE_DE },
    ] as Idea[],
    tightened: b('ΔG = ΔH − T·ΔS combines the energy change ΔH with the entropy change ΔS. When ΔG is negative, the reaction can run by itself: it is exergonic. Temperature weights the entropy term, so heating or cooling can flip the sign of ΔG; the switch comes where ΔG = 0, at T = ΔH ÷ ΔS with ΔS in kJ, 1119 K for limestone. ΔG says whether a reaction can run, not how fast: diamond turning into graphite has ΔG < 0 but is far too slow to notice.',
      'ΔG = ΔH − T·ΔS verbindet die Enthalpieänderung ΔH mit der Entropieänderung ΔS. Ist ΔG negativ, kann die Reaktion freiwillig ablaufen: Sie ist exergonisch. Die Temperatur gewichtet den Entropieterm, deshalb kann Erhitzen oder Abkühlen das Vorzeichen von ΔG umkehren; der Wechsel liegt dort, wo ΔG = 0 ist, bei T = ΔH : ΔS mit ΔS in kJ, beim Kalkbrennen 1119 K. ΔG gibt an, ob eine Reaktion ablaufen kann, nicht wie schnell: Beim Übergang von Diamant zu Graphit ist ΔG negativ, aber er verläuft unmerklich langsam.'),
  },

  terms: ['gibbs-energy', 'exergonic', 'spontaneous', 'entropy', 'enthalpy'],

  readings: [
    {
      lang: 'en', kind: 'quick',
      title: b('Interpreting ΔG and temperature effects', 'Interpreting ΔG and temperature effects'), source: 'Chemistry Student, IB Chemistry notes',
      url: 'https://chemistrystudent.com/ib-dp/r1.4-entropy-and-spontaneity-ahl/interpreting-g-and-temperature-effects-hl-1-4-3.html',
      lookFor: [
        b('Its worked example turns +100 J K⁻¹ mol⁻¹ into kJ before dividing. What temperature does it get, and what would skipping that step have given?', ''),
        b('Its table of four cases: which row is burning limestone (+179.2 kJ/mol, +160.2 J/(mol·K)), and which is hydrogen peroxide decomposing?', ''),
        b('Why, according to the page, does diamond not turn into graphite although ΔG is negative? Compare with the −2.9 kJ/mol in the diamond example.', ''),
      ],
    },
    {
      lang: 'en', kind: 'deeper',
      title: b('Free Energy', 'Free Energy'), source: 'OpenStax Chemistry 2e, section 16.4',
      url: 'https://openstax.org/books/chemistry-2e/pages/16-4-free-energy',
      lookFor: [
        b('Example 16.7 uses the same 44.01 kJ and 118.8 J/K for water evaporating as the boiling-water example here. What ΔG does it get at 298 K, and with which sign?', ''),
        b('Its four numbered cases: which one describes NO₂ pairing up (ΔH < 0, ΔS < 0), and what does it say happens at high temperature?', ''),
        b('Example 16.10, 2 C + O₂ → 2 CO: why is it spontaneous at all temperatures? Which cell of the 2 × 2 card is that?', ''),
      ],
    },
    {
      lang: 'de', kind: 'deeper',
      title: b('Gibbs-Energie: Gibbs-Helmholtz-Gleichung', 'Gibbs-Energie: Gibbs-Helmholtz-Gleichung'), source: 'evulpo, Chemie (Sekundarstufe II)',
      url: 'https://evulpo.com/de/ch/dashboard/lesson/ch-de-c-sek-05chemicalreaction-02energetics-04gibbsenergy',
      lookFor: [
        b('', 'Natrium und Wasser bei −40 °C (233 K): In welcher Einheit setzt die Seite ΔS ein, und welches ΔG erhält sie? Vergleiche mit der Umrechnung von J in kJ in dieser Einheit.'),
        b('', 'Die vier Fälle: Welcher passt zum Kalkbrennen (ΔH = +179,2 kJ/mol, ΔS = +160,2 J/(mol·K)), und was sagt die Seite über die nötige Temperatur?'),
        b('', 'Was vernachlässigt die Seite bei ΔH und ΔS? Vergleiche mit dem Beispiel zum siedenden Wasser (370 K gegenüber 373 K).'),
      ],
    },
  ],

  misconceptions: [
    { id: 'negative-dg-fast', name: b('ΔG < 0 means the reaction is fast', 'Ein negatives ΔG bedeutet eine schnelle Reaktion') },
    { id: 'units-j-kj', name: b('J and kJ mixed in ΔH − T·ΔS', 'J und kJ in ΔH − T·ΔS vermischt') },
    { id: 't-irrelevant', name: b('Whether a reaction can run does not depend on temperature', 'Ob eine Reaktion ablaufen kann, hängt nicht von der Temperatur ab') },
  ],

  glossary: {
    'gibbs-energy': {
      en: 'Gibbs energy (free energy)', de: 'freie Enthalpie (Gibbs-Energie)', unit: 20,
      def: { en: 'G. Its change ΔG = ΔH − T·ΔS combines a reaction\'s energy change and entropy change at constant temperature and pressure, in kJ/mol. ΔG < 0: the reaction can run by itself; ΔG says nothing about how fast.',
        de: 'G. Ihre Änderung ΔG = ΔH − T·ΔS (Gibbs-Helmholtz-Gleichung) verbindet Enthalpie- und Entropieänderung einer Reaktion bei konstanter Temperatur und konstantem Druck, in kJ/mol. ΔG < 0: Die Reaktion kann freiwillig ablaufen; über die Geschwindigkeit sagt ΔG nichts.' },
      falseFriend: { en: 'German books say "freie Enthalpie" and write Δ_{r}G; "Gibbs-Energie" is the same quantity.', de: 'Englische Bücher sagen „Gibbs energy“ oder „free energy“.' },
    },
    exergonic: {
      en: 'exergonic', de: 'exergonisch', unit: 20,
      def: { en: 'With ΔG < 0: the reaction can run by itself at that temperature. The opposite, ΔG > 0, is endergonic. Not the same as exothermic, which is about ΔH alone.',
        de: 'Mit ΔG < 0: Die Reaktion kann bei dieser Temperatur freiwillig ablaufen. Das Gegenteil, ΔG > 0, nennt man endergonisch. Nicht dasselbe wie exotherm, das nur ΔH betrifft.' },
    },
  },
};
