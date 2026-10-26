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
// - Limestone, measured: the CO₂ equilibrium pressure over CaCO₃ reaches atmospheric pressure at 898 °C ("the
//   equilibrium pressure must exceed total atmospheric pressure of 101 kPa, which happens at 898 °C", with a table of
//   equilibrium pressures; Wikipedia, "Calcium carbonate", section on thermal decomposition). Cross-check: the fit
//   Peq(atm) ≈ 4.083·10⁷·exp(−20474/T) of Valverde, Sanchez-Jimenez and Perez-Maqueda, "Limestone calcination nearby
//   equilibrium" (idus.us.es), solved for 1 atm, gives 1168 K (895 °C). So the 845 °C (1119 K) from ΔH/ΔS at 25 °C is a
//   model value and the text says so; the unit quotes "about 900 °C" for the measured value.
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
  `(?:enthalp\\w*|energy|heat|${DH})(?: change)? (?:against|versus|vs|minus|plus|together with|combined with|and) (?:the )?(?:temperature times |t times )?(?:the )?(?:entrop\\w*|${DS}|t${TIMES}${DS}|spreading|disorder)`,
  `(?:subtract|take away|take off|deduct|minus)\\w* (?:the |off the )?(?:temperature times|t times|t${TIMES}${DS}|${DS} times)`);
const GIBBS_DE = any(FORMULA,
  `${G_DE}.{0,40}(?:verbind|verknüpf|kombinier|berücksichtig|vereint|vereinigt|fasst|setzt sich|beinhaltet|enthält|hängt|abhängig|ergibt sich|bilanz|komm|steck|wäg|zusammen)\\w*.{0,40}(?:${DH}|${DS}|enthalpie\\w*|entropie\\w*|energie\\w*|wärme|unordnung)`,
  /(bilanz|zusammenspiel|wettstreit|wettkampf|konkurrenz|kräftemessen|abwägung) (aus|zwischen|von) .{0,25}(enthalpie|energie|wärme|entropie)/,
  `(?:enthalpie|energie|wärme)[\\wäöüß]*(?: ${DH})? (?:gegen|gegenüber|minus|mit|zusammen mit) (?:der )?(?:temperatur mal |t mal )?(?:entropie\\w*|${DS}|t${TIMES}${DS})|${DH} (?:gegen|gegenüber|minus|mit|zusammen mit) (?:der )?(?:temperatur mal |t mal )?(?:entropie\\w*|${DS}|t${TIMES}${DS})`,
  // "zieht Temperatur mal Entropieänderung ab" (the "und" before it ends the clause)
  `(?:zieh\\w*|ziehst|subtrahier\\w*|abzüglich|vermindert um) (?:man |du |dann )?(?:die |den )?(?:temperatur|t) mal`,
  `(?:enthalpie|energie|wärme)[\\wäöüß]*,? .{0,20}(?:abzüglich|abgezogen|subtrahier\\w*|vermindert um)`);
// Unit 19's misconception, contradicted: only exothermic changes run by themselves.
const ONLY_EXO = {
  en: /^(?!.*(\bnot\b|n't|\bno\b|\bnever\b|entrop|δ ?s|\bds\b|every temperature|all temperatures|any temperature)).*\b(only|just)\b .{0,20}(exotherm\w*|(reactions?|processes|changes) that (release|give out|give off)).{0,40}(run|happen|go\b|spontan|by (it|them)sel|on (its|their) own|feasible|possible)/,
  de: /^(?!.*(nicht|kein|\bnie\b|entropie|δ ?s|\bds\b|jeder temperatur|allen temperaturen)).*(\bnur\b|bloß|ausschließlich) .{0,20}(exotherm\w*|(reaktionen|vorgänge|prozesse),? die (energie|wärme) (abgeben|freisetzen)).{0,40}(laufen|ablauf|freiwillig|spontan|von selbst|möglich)/,
};

// Idea 2, the sign: ΔG < 0 means the reaction can run by itself (exergonic).
// Plain words for "ΔG": "the answer", "the result", "the sum" ("the" or "your" is required, so "the energy change" is not taken for it).
const ANS_EN = String.raw`(?:the|your) (?:answer|result|sum|total|outcome|calculation)`;
const NEGG_EN = `(?:${G_EN}\\s?(?:is |becomes |turns |gets |goes |being |value is |comes out |comes out as )?(?:< ?0|negative|below zero|less than zero|smaller than zero|under zero|minus)|negative ${G_EN}|${ANS_EN} (?:is |comes out |comes out as |turns out |ends up |being |gets )?(?:a )?(?:negative|minus|below zero|less than zero|under zero)|(?:you get|it gives|gives|getting) (?:a )?(?:negative|minus)(?: number| value| answer| result)?)`;
const POSG_EN = `(?:${G_EN}\\s?(?:is |becomes |turns |gets )?(?:> ?0|positive|above zero|greater than zero|more than zero)|positive ${G_EN}|${ANS_EN} (?:is |comes out |turns out |ends up )?(?:a )?(?:positive|plus|above zero|greater than zero))`;
// "non-spontaneous", "unfavourable", "infeasible" must not read as their opposites.
const RUN_EN = String.raw`(?:(?<!non[- ]?)(?<!un)spontaneous\w*|(?:run|happen|go|proceed|occur|react|work)\w* (?:by (?:it|them)sel\w*|on (?:its|their) own|without (?:help|a push|outside help|energy input))|can (?:run|happen|go|proceed|occur|react|work)|(?<!in)feasible|(?<!non[- ]?)exergonic|(?<!un)favou?r\w*|will happen|goes ahead|(?<!im)possible|viable|allowed|no (?:push|help|energy input) (?:is )?(?:needed|required)|(?:doesn't|does not|won't|will not) need (?:a push|help|energy|anything)|(?:\bit|\bthey) can\s*$)`;
const ANS_DE = String.raw`(?:(?:das|dein|dieses) (?:ergebnis|resultat)|(?:die|deine|diese) summe)`;
const NEGG_DE = `(?:${G_DE}\\s?(?:ist |wird |kleiner |unter )?(?:< ?0|negativ\\w*|kleiner (?:als )?(?:null|0)|unter null)|negative\\w* ${G_DE}|${ANS_DE} (?:ist |wird |kommt .{0,12}heraus |ergibt )?(?:ein )?(?:negativ\\w*|kleiner (?:als )?(?:null|0)|unter null)|(?:ergibt sich|kommt|erhältst du|bekommst du|erhält man) (?:ein |etwas )?(?:negativ\\w*|minus))`;
const POSG_DE = `(?:${G_DE}\\s?(?:ist |wird )?(?:> ?0|positiv\\w*|größer (?:als )?(?:null|0)|über null)|positive\\w* ${G_DE}|${ANS_DE} (?:ist |wird |kommt .{0,12}heraus )?(?:ein )?(?:positiv\\w*|größer (?:als )?(?:null|0)|über null))`;
// "unfreiwillig", "unmöglich", "nonspontan" must not read as their opposites.
const RUN_DE = String.raw`(?:(?<!un)freiwillig\w*|(?<!non[- ]?)(?<!un)spontan\w*|von selbst|von allein\w*|selbstständig\w*|selbständig\w*|(?<!non[- ]?)exergon\w*|läuft .{0,25}\bab\b|ablaufen|ablaufend|abläuft|läuft|(?<!un)möglich|(?<!un)begünstigt|kann .{0,20}(?:ablaufen|stattfinden|passieren|reagieren|laufen)|ohne (?:anstoß|hilfe|energiezufuhr|zusatz\w*))`;
// One sentence that states both cases ("If ΔG < 0 it is spontaneous, if ΔG > 0 it is not"): the negation belongs to the
// second half, so the match runs up to it (positive case second) or includes it word for word (positive case first;
// the matcher accepts a negation inside a match only when the pattern's source contains it literally).
const two = (...parts: string[]) => parts.join('.{0,40}');
const NEGPAIR_EN = ['not', 'cannot', "can't", "won't", "isn't", "doesn't", 'never']
  .flatMap((n) => ['spontaneous', 'run', 'happen', 'go', 'proceed', 'occur', 'react', 'work', 'feasible', 'possible', 'exergonic', 'favoured', 'favourable', 'by', 'on', 'allowed', 'viable', 'be'].map((w) => `${n} ${w}`)).join('|');
const NEGPAIR_DE = ['nicht', 'nie'].flatMap((n) => ['freiwillig', 'spontan', 'ab', 'von', 'möglich', 'ablaufen', 'selbstständig', 'selbständig'].map((w) => `${n} ${w}`)).join('|');
// "when it is positive it can't": the second half may say "it" for ΔG.
const POSG2_EN = `(?:${POSG_EN}|\\b(?:it|that) (?:is |becomes )?(?:> ?0|positive|plus|above zero))`;
const POSG2_DE = `(?:${POSG_DE}|\\b(?:es|das|er) (?:ist |wird )?(?:> ?0|positiv\\w*|über null))`;
const SIGN_EN = any(
  two(NEGG_EN, RUN_EN, POSG2_EN) + String.raw`.{0,40}(?:not|never|can't|cannot|won't|isn't|doesn't)\b`,
  two(POSG2_EN, `(?:${NEGPAIR_EN})`, NEGG_EN, RUN_EN),
  together(NEGG_EN, RUN_EN, 50), /exergonic\w*.{0,30}(< ?0|negative)/, /(< ?0|negative).{0,30}exergonic/);
const SIGN_DE = any(
  two(NEGG_DE, RUN_DE, POSG2_DE) + String.raw`.{0,40}(?:nicht|nie)\b`,
  two(POSG2_DE, `(?:${NEGPAIR_DE})`, NEGG_DE, RUN_DE),
  together(NEGG_DE, RUN_DE, 50), /exergon\w*.{0,30}(< ?0|negativ)/, /(< ?0|negativ\w*).{0,30}exergon/);

const SIGN_CONTRA = {
  en: new RegExp(`^(?!.*(\\bnot\\b|n't|\\bno\\b|\\bnever\\b|cannot|revers|backward|opposite|other direction)).*(?:${POSG_EN}.{0,40}(?:(?<!non[- ]?)(?<!un)spontaneous|runs? by (?:it|them)sel|can run|(?<!non[- ]?)exergonic|(?<!in)feasible)|${NEGG_EN}.{0,40}(?:endergonic|non-?spontaneous))`),
  de: new RegExp(`^(?!.*(nicht|kein|\\bnie\\b|rück|umgekehrt|gegenrichtung)).*(?:${POSG_DE}.{0,40}(?:(?<!un)freiwillig|(?<!non[- ]?)(?<!un)spontan|von selbst|exergon)|${NEGG_DE}.{0,40}(?:endergon|unfreiwillig))`),
};

// Idea 3, temperature weights the entropy term and can flip the sign of ΔG.
const TEMP_EN = String.raw`(?:temperature\w*|\btemp\b|\bt\b|heat\w*|hotter|colder|cool\w*|warm\w*|\bhot\b|\bcold\b)`;
const FLIP_EN = String.raw`(?:flip\w*|switch\w*|chang\w* (?:the )?sign|sign (?:can )?chang\w*|chang\w* (?:from )?(?:negative|positive)|turn\w* (?:it |δ ?g |dg )?(?:negative|positive|around)|revers\w* (?:the )?sign|decid\w*|matters?|makes? (?:a |the |all the )?difference|can change|changes? whether|tips?|tipp\w*|affects? whether|determines?|controls?)`;
const WEIGHT_EN = any(
  `t${TIMES}${DS}.{0,30}(?:grows?|bigger|larger|greater|increases?|rises?|wins?|outweigh\\w*|dominat\\w*|matters? more|counts? more)`,
  /entrop\w*.{0,30}(grows?|bigger|larger|greater|more important|wins?|outweigh\w*|dominat\w*|matters? more|counts? more|weighs? more|takes? over|stronger)/,
  `(?:weigh\\w*|multipl\\w*|scales?) .{0,20}(?:entrop\\w*|${DS})`,
  /(dominat\w*|outweigh\w*|wins?|takes? over) .{0,10}(the )?entrop\w*/,
  `how (?:much|strongly|strong|heavily|big) .{0,25}(?:entrop\\w*|t${TIMES}${DS}).{0,15}(?:counts?|matters?|weighs?)`);
const TEMP_IDEA_EN = any(together(TEMP_EN, FLIP_EN, 70), together(TEMP_EN, WEIGHT_EN, 40), /depends? on (the )?temperature/);
const TEMP_DE = String.raw`(?:temperatur\w*|\btemp\b|\bt\b|erhitz\w*|erwärm\w*|heiß\w*|heiss\w*|kalt\w*|kälte\w*|kälter|kühl\w*|abkühl\w*|wärmer)`;
const FLIP_DE = String.raw`(?:vorzeichen.{0,25}(?:umkehr\w*|ändern|ändert|wechsel\w*|umdreh\w*|kipp\w*|umschlag\w*|umspring\w*)|(?:kehrt|ändert|wechselt|kippt|dreht) .{0,25}vorzeichen|umkehr\w*|entscheid\w*|bestimm\w*|ausschlag\w*|umschlag\w*|umkipp\w*|kipp\w*|beeinfluss\w*)`;
const WEIGHT_DE = any(
  `t${TIMES}${DS}.{0,30}(?:wächst|größer|steigt|nimmt zu|überwieg\\w*|gewinnt|dominier\\w*|wichtiger|stärker)`,
  /entropie\w*.{0,30}(wächst|größer|wichtiger|überwieg\w*|gewinnt|dominier\w*|stärker|mehr gewicht|ins gewicht|setzt sich durch|\bmehr\b|zählt|zählen)/,
  `(?:gewicht\\w*|multiplizier\\w*|verstärk\\w*) .{0,20}(?:entropie\\w*|${DS})`,
  /(überwieg\w*|gewinnt|dominier\w*|wächst|wichtiger|stärker) .{0,10}(der |die )?entropie\w*/,
  `wie (?:stark|sehr|viel) .{0,25}(?:entropie\\w*|t${TIMES}${DS}).{0,15}(?:zählt|zählen|ins gewicht|gewicht)`);
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
  `(?:${G_EN}|spontan\\w*|exergonic|can run|runs? by (?:it|them)sel\\w*|feasib\\w*|the sign|\\bit\\b|\\bthis\\b|\\bthat\\b|the (?:answer|result|sum))\\b.{0,60}(?:${NEG_EN}).{0,40}${RATE_EN}`,
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
  `(?:${G_DE}|spontan\\w*|freiwillig\\w*|exergon\\w*|von selbst|\\bes\\b|\\bdas\\b|\\bdies\\b|das vorzeichen|das ergebnis)\\b.{0,60}(?:${NEG_DE}).{0,40}${RATE_DE}`,
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
    lead: b('Quicklime, calcium oxide, is made by heating limestone, calcium carbonate, in a kiln: CaCO₃ → CaO + CO₂. At room temperature limestone stays limestone: whole cliffs and buildings are made of it.',
      'Branntkalk, Calciumoxid, entsteht, wenn man Kalkstein, Calciumcarbonat, in einem Kalkofen erhitzt: CaCO₃ → CaO + CO₂. Bei Raumtemperatur bleibt Kalkstein Kalkstein: Ganze Felsen und Gebäude bestehen daraus.'),
    data: {
      caption: b('Burning limestone, per mole: measured at 25 °C and 1 bar. A plus sign means energy taken in or entropy gained.',
        'Kalkbrennen, pro Mol: gemessen bei 25 °C und 1 bar. Ein Pluszeichen bedeutet aufgenommene Energie oder gewonnene Entropie.'),
      head: [b('Quantity', 'Größe'), b('Value', 'Wert')],
      rows: [
        { cells: [b('ΔH, energy taken in', 'ΔH, aufgenommene Energie'), '+179.2 kJ/mol'] },
        { cells: [b('ΔS, entropy change (a gas forms)', 'ΔS, Entropieänderung (ein Gas entsteht)'), '+160.2 J/(mol·K)'] },
      ],
      numeric: [1],
    },
    clash: b('The reaction takes in energy, so energy alone says it should not run by itself. But a gas forms and the entropy rises, which pushes the other way (unit 19). Take ΔH and ΔS as fixed at these values, with CO₂ at 1 bar: above which temperature can limestone decompose by itself?',
      'Die Reaktion nimmt Energie auf, nach der Energie allein sollte sie also nicht freiwillig ablaufen. Aber es entsteht ein Gas, und die Entropie steigt, das wirkt in die andere Richtung (Einheit 19). Nimm ΔH und ΔS bei diesen Werten als konstant an, CO₂ bei 1 bar: Oberhalb welcher Temperatur kann Kalkstein freiwillig zerfallen?'),
    question: {
      id: 'u20-puzzle', unit: 20, kind: 'choice', format: 'predict', withConfidence: true, evidence: 'predict',
      concepts: ['u20.crossover', 'u20.temperature'], targets: ['units-j-kj', 'spontaneous-exothermic', 't-irrelevant'],
      prompt: b('Your best guess:', 'Deine beste Vermutung:'),
      options: [
        { text: b('Above about 1 K (−272 °C): the entropy term wins at almost any temperature', 'Oberhalb von etwa 1 K (−272 °C): Der Entropieterm überwiegt bei fast jeder Temperatur'), mis: 'units-j-kj' },
        { text: b('Never: ΔH = +179.2 kJ/mol is positive, so it always needs a push', 'Nie: ΔH = +179,2 kJ/mol ist positiv, also braucht sie immer einen Anstoß'), mis: 'spontaneous-exothermic' },
        { text: b('Above about 845 °C (1119 K): there the entropy term outweighs ΔH', 'Oberhalb von etwa 845 °C (1119 K): Dort ist der Entropieterm größer als ΔH'), correct: true },
        { text: b('At 25 °C (298 K) too: temperature sets only the speed, so wait', 'Auch bei 25 °C (298 K): Die Temperatur bestimmt nur die Geschwindigkeit'), mis: 't-irrelevant' },
      ],
      explain: b('The entropy term grows with temperature and must outweigh the 179.2 kJ/mol taken in: T = 179.2 kJ/mol ÷ 0.1602 kJ/(mol·K) = 1119 K, 845 °C. Using 160.2 without turning J into kJ gives 1.1 K, a thousand times too low. This is a model value, because ΔH and ΔS are assumed constant (equal to their 25 °C values): measured, the CO₂ pressure over limestone reaches 1 bar at about 900 °C, and lime kilns bring the stone to about 900 °C (European Environment Agency). Below that, limestone does not decompose by itself at 1 bar of CO₂, however long you wait; where the CO₂ is swept away, it starts lower (units 24–25).',
        'Der Entropieterm wächst mit der Temperatur und muss die aufgenommenen 179,2 kJ/mol übertreffen: T = 179,2 kJ/mol : 0,1602 kJ/(mol·K) = 1119 K, also 845 °C. Wer 160,2 einsetzt, ohne J in kJ umzurechnen, erhält 1,1 K, tausendmal zu wenig. Das ist ein Modellwert, weil ΔH und ΔS als konstant (gleich den Werten bei 25 °C) angenommen werden: Gemessen erreicht der CO₂-Druck über Kalkstein 1 bar bei etwa 900 °C, und im Kalkofen wird der Stein auf etwa 900 °C gebracht (Europäische Umweltagentur). Darunter zerfällt Kalkstein bei 1 bar CO₂ nicht freiwillig, egal wie lange man wartet; wird das CO₂ abgeführt, beginnt der Zerfall tiefer (Einheiten 24–25).'),
    } as ChoiceItem,
    after: b('Next: set the temperature yourself in the Energy Landscape and watch the sign of ΔG.', 'Als Nächstes: Stell die Temperatur in der Energielandschaft selbst ein und beobachte das Vorzeichen von ΔG.'),
  },

  explore: {
    title: b('The Energy Landscape, ΔH against T·ΔS', 'Energielandschaft, ΔH und T·ΔS im Vergleich'),
    intro: b('Three bars: ΔH, the energy change (unit 17); −T·ΔS, the entropy change (unit 19) times the temperature in kelvin (K = °C + 273), with a minus sign; and their sum ΔG, the change in [[gibbs-energy|Gibbs energy]]: ΔG = ΔH − T·ΔS. Where it comes from: the entropy of the surroundings changes by ΔS_{surroundings} = −ΔH ÷ T (unit 19), so the total entropy changes by ΔS_{total} = ΔS − ΔH ÷ T = −ΔG ÷ T. By the second law a change can run by itself when the total entropy rises, that is, when ΔG < 0 ([[exergonic]], "[[spontaneous]]"). ΔG > 0 (endergonic): it does not run by itself under these conditions, and at equilibrium the reactants are favoured (K < 1; ΔG° = −R·T·ln K, where ° means every gas at 1 bar, units 24–25). ΔS is given in J/(mol·K) and ΔH in kJ/mol, so divide ΔS by 1000 before you combine them. ΔH and ΔS are treated as constant with temperature and every gas is at 1 bar: a model.',
      'Drei Balken: ΔH, die Enthalpieänderung (Einheit 17); −T·ΔS, die Entropieänderung (Einheit 19) mal die Temperatur in Kelvin (T in K = Temperatur in °C + 273), mit negativem Vorzeichen; und ihre Summe ΔG, die Änderung der [[gibbs-energy|freien Enthalpie]] G (auch Gibbs-Energie). Das ist die Gibbs-Gleichung ΔG = ΔH − T·ΔS (in der Schule oft „Gibbs-Helmholtz-Gleichung“ genannt). Woher sie kommt: Die Entropie der Umgebung ändert sich um ΔS_{Umgebung} = −ΔH : T (Einheit 19); die Gesamtentropie ändert sich also um ΔS_{ges} = ΔS − ΔH : T = −ΔG : T. Nach dem Zweiten Hauptsatz kann ein Vorgang freiwillig ablaufen, wenn die Gesamtentropie steigt, also wenn ΔG < 0 ([[exergonic|exergonisch]], [[spontaneous|spontan]]). Ist ΔG > 0 (endergonisch), läuft er unter diesen Bedingungen nicht freiwillig ab, und im Gleichgewicht sind die Edukte begünstigt (K < 1; ΔG° = −R·T·ln K, wobei ° bedeutet: jedes Gas bei 1 bar, Einheiten 24–25). ΔS wird in J/(mol·K) angegeben, ΔH in kJ/mol: Teile ΔS also durch 1000, bevor du rechnest. ΔH und ΔS werden als temperaturunabhängig angenommen, alle Gase bei 1 bar: ein Modell.'),
    tasks: [
      { id: 'ice', key: true, text: b('Start with ice melting. Slide the temperature across 0 °C (273 K) and watch the ΔG bar.', 'Beginne mit schmelzendem Eis. Schieb die Temperatur über 0 °C (273 K) und beobachte den ΔG-Balken.') },
      { id: 'lime', key: true, text: b('Pick burning limestone. Find the temperature above which it can decompose by itself.', 'Wähle das Kalkbrennen. Finde die Temperatur, oberhalb der Kalkstein freiwillig zerfallen kann.') },
      { id: 'always', key: true, text: b('Find a reaction whose ΔG stays negative wherever you put the slider.', 'Finde eine Reaktion, deren ΔG negativ bleibt, egal, wo der Regler steht.') },
      { id: 'cold', text: b('Find a reaction that can run by itself only when it is cold enough.', 'Finde eine Reaktion, die nur dann freiwillig ablaufen kann, wenn es kalt genug ist.') },
      { id: 'reverse', text: b('Reverse a reaction. What happens to the signs of ΔH, ΔS and ΔG?', 'Kehre eine Reaktion um. Was passiert mit den Vorzeichen von ΔH, ΔS und ΔG?') },
      { id: 'never', challenge: true, text: b('Find a reaction that cannot run by itself at any temperature. None of the four does as written.', 'Finde eine Reaktion, die bei keiner Temperatur freiwillig ablaufen kann. Keine der vier tut das so, wie sie dasteht.') },
    ],
    notes: {
      ice: b('ΔG = 0 at 273 K: ice and water sit side by side. Below it ΔG > 0 and ice stays solid; above it the −T·ΔS bar outgrows ΔH, ΔG < 0, and ice melts by itself.',
        'ΔG = 0 bei 273 K: Eis und Wasser liegen nebeneinander vor. Darunter ist ΔG > 0, und Eis bleibt fest; darüber wird der −T·ΔS-Balken länger als ΔH, ΔG < 0, und Eis schmilzt freiwillig.'),
      lime: b('ΔG = 0 at 1119 K (845 °C). Written out as in an A-level, IB or Abitur exam: ΔS = 160.2 J/(mol·K) = 0.1602 kJ/(mol·K); T = ΔH ÷ ΔS = 179.2 ÷ 0.1602 = 1119 K. Answer: above about 845 °C limestone can decompose by itself, because there T·ΔS outweighs ΔH. This is a model value: ΔH and ΔS are held at their 25 °C values.',
        'ΔG = 0 bei 1119 K (845 °C). So schreibst du es in der Klausur: ΔS = 160,2 J/(mol·K) = 0,1602 kJ/(mol·K); T = ΔH : ΔS = 179,2 : 0,1602 = 1119 K. Antwort: Oberhalb von etwa 845 °C kann Kalkstein freiwillig zerfallen, weil dort T·ΔS größer ist als ΔH. Das ist ein Modellwert: ΔH und ΔS werden bei ihren 25-°C-Werten festgehalten.'),
      always: b('Hydrogen peroxide: ΔH < 0 and ΔS > 0, so both bars point down and ΔG < 0 at every temperature.',
        'Wasserstoffperoxid: ΔH < 0 und ΔS > 0, also zeigen beide Balken nach unten, und ΔG < 0 bei jeder Temperatur.'),
      cold: b('ΔH < 0 and ΔS < 0: here −T·ΔS points up and grows as you heat, so ΔG < 0 only below the crossover.',
        'ΔH < 0 und ΔS < 0: Hier zeigt −T·ΔS nach oben und wächst beim Erhitzen, also ist ΔG < 0 nur unterhalb des Vorzeichenwechsels.'),
      reverse: b('Reversing flips the signs of ΔH, ΔS and so of ΔG. At any one temperature, if one direction can run by itself, the other cannot; the crossover temperature stays the same.',
        'Umkehren dreht die Vorzeichen von ΔH, ΔS und damit von ΔG um. Bei jeder Temperatur gilt: Kann die eine Richtung freiwillig ablaufen, kann es die andere nicht; die Temperatur des Vorzeichenwechsels bleibt gleich.'),
      never: b('The reverse of the H₂O₂ decomposition: water and oxygen forming H₂O₂, ΔH = +196.1 kJ/mol, ΔS = −126.0 J/(mol·K). Both bars point up: ΔG > 0 at every temperature. It happens only when another process drives it.',
        'Die Umkehrung der H₂O₂-Zersetzung: Wasser und Sauerstoff bilden H₂O₂, ΔH = +196,1 kJ/mol, ΔS = −126,0 J/(mol·K). Beide Balken zeigen nach oben: ΔG > 0 bei jeder Temperatur. Es geschieht nur, wenn ein anderer Vorgang es antreibt.'),
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
      explain: b('ΔH > 0 pushes ΔG up; −T·ΔS pulls it down, more strongly the hotter it is. Above T = ΔH ÷ ΔS the entropy term wins: ice above 273 K, limestone above about 1119 K (a model value).',
        'ΔH > 0 drückt ΔG nach oben; −T·ΔS zieht es nach unten, umso stärker, je heißer es ist. Oberhalb von T = ΔH : ΔS gewinnt der Entropieterm: Eis oberhalb von 273 K, Kalkstein oberhalb von etwa 1119 K (ein Modellwert).'),
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
      revealText: b('At 0 °C ΔG = −7.3 kJ/mol and the tube turns paler (light brown); at 100 °C ΔG = +10.3 kJ/mol and it turns dark brown. ΔS < 0 here, so the −T·ΔS bar points up and outgrows ΔH above 315 K (41 °C). ΔG says which side is favoured; how much of each gas the tube holds also depends on the pressure (units 24–25).',
        'Bei 0 °C ist ΔG = −7,3 kJ/mol, und das Röhrchen wird blasser (hellbraun); bei 100 °C ist ΔG = +10,3 kJ/mol, und es wird dunkelbraun. Hier ist ΔS < 0, also zeigt der −T·ΔS-Balken nach oben und wird oberhalb von 315 K (41 °C) länger als ΔH. ΔG gibt an, welche Seite begünstigt ist; wie viel von jedem Gas im Röhrchen ist, hängt auch vom Druck ab (Einheiten 24–25).'),
      extra: {
        title: b('ΔG at two temperatures', 'ΔG bei zwei Temperaturen'),
        steps: [
          b('Convert ΔS to kJ/(mol·K): −175.8 J/(mol·K) = −0.1758 kJ/(mol·K).', 'ΔS in kJ/(mol·K) umrechnen: −175,8 J/(mol·K) = −0,1758 kJ/(mol·K).'),
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
        explain: b('ΔG < 0 below 190 °C says ammonia can form, not how fast: in the cool it forms far too slowly to be useful, even over a catalyst. At 450 °C it is fast enough, but there ΔG = +51.4 kJ/mol at 1 bar, so at equilibrium little ammonia is left. High pressure (about 200 atmospheres) shifts the equilibrium towards fewer gas particles (4 → 2, Le Chatelier), and the plant cools the gas after each pass to condense out the ammonia and sends the rest round again.',
          'ΔG < 0 unter 190 °C gibt an, dass Ammoniak entstehen kann, nicht wie schnell: In der Kälte entsteht es selbst am Katalysator viel zu langsam. Bei 450 °C geht es schnell genug, dort ist aber ΔG = +51,4 kJ/mol bei 1 bar, im Gleichgewicht liegt dann also wenig NH₃ vor. Hoher Druck (etwa 200 bar) verschiebt das Gleichgewicht zur Seite mit weniger Gasteilchen (4 → 2, Prinzip von Le Chatelier), und die Anlage kühlt das Gas nach jedem Durchgang ab, damit das Ammoniak kondensiert, und führt den Rest im Kreislauf zurück.'),
      } as ChoiceItem,
      show: { engine: 'energy', reaction: 'nh3', mode: 'gibbs', temp: 723 },
      revealText: b('ΔG says whether a reaction can run, not how fast. Below 190 °C ammonia can form but far too slowly, so the plant runs at about 450 °C over an iron catalyst (unit 23), where ΔG = +51.4 kJ/mol for gases at 1 bar. A pressure of about 200 atmospheres, and cooling the gas after each pass to condense out the ammonia and recycle the rest, still give a useful yield (units 24–25).',
        'ΔG gibt an, ob eine Reaktion ablaufen kann, nicht wie schnell. Unter 190 °C kann Ammoniak entstehen, aber viel zu langsam, also läuft die Anlage bei etwa 450 °C an einem Eisenkatalysator (Einheit 23), wo ΔG = +51,4 kJ/mol für Gase bei 1 bar ist. Ein Druck von etwa 200 bar und das Abkühlen des Gases nach jedem Durchgang, damit das Ammoniak kondensiert und der Rest im Kreislauf zurückläuft, ergeben trotzdem eine brauchbare Ausbeute (Einheiten 24–25).'),
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
      body: b('Convert ΔS to kJ/(mol·K) first: 22.0 J/(mol·K) = 0.0220 kJ/(mol·K), so ΔG = 0 at T = 6.01 ÷ 0.0220 = 273 K. Below it ΔG > 0 and ice stays solid; above it ΔG < 0 and ice melts by itself.',
        'Rechne ΔS zuerst in kJ/(mol·K) um: 22,0 J/(mol·K) = 0,0220 kJ/(mol·K), also ist ΔG = 0 bei T = 6,01 : 0,0220 = 273 K. Darunter ist ΔG > 0, und Eis bleibt fest; darüber ist ΔG < 0, und Eis schmilzt freiwillig.'),
      soWhat: b('A drink with ice cubes stays near 0 °C while ice is left: only there can ice and water sit side by side, and the heat flowing in goes into melting rather than warming.',
        'Ein Getränk mit Eiswürfeln bleibt nahe 0 °C, solange noch Eis da ist: Nur dort können Eis und Wasser nebeneinander bestehen, und die zufließende Wärme geht ins Schmelzen statt ins Erwärmen.'),
    },
    {
      title: b('Diamond lasts although ΔG < 0', 'Diamant: beständig, obwohl ΔG < 0'), tag: 'C',
      show: { engine: 'energy', reaction: 'diamond-graphite', mode: 'gibbs', temp: 298 },
      numbers: [
        { v: '−1.89 kJ/mol', label: b('ΔH for diamond turning into graphite', 'ΔH für den Übergang von Diamant zu Graphit') },
        { v: '+3.36 J/(mol·K)', label: b('ΔS: graphite has the higher entropy', 'ΔS: Graphit hat die höhere Entropie') },
        { v: '−2.9 kJ/mol', label: b('ΔG at 25 °C', 'ΔG bei 25 °C') },
      ],
      body: b('ΔH < 0 and ΔS > 0, so ΔG < 0 at every temperature (at 1 bar); at 25 °C ΔG = −1.89 − 298 × 0.00336 = −2.9 kJ/mol. Yet a diamond on a ring does not turn into pencil lead: its carbon atoms would first have to break strong bonds, and at room temperature that is far too slow to notice. ΔG says whether a change can run by itself, not how fast.',
        'ΔH < 0 und ΔS > 0, also ist ΔG < 0 bei jeder Temperatur (bei 1 bar); bei 25 °C ist ΔG = −1,89 − 298 · 0,00336 = −2,9 kJ/mol. Trotzdem wird ein Diamant am Ring nicht zu Bleistiftmine: Seine Kohlenstoffatome müssten erst starke Bindungen spalten, und bei Raumtemperatur geschieht das unmerklich langsam. ΔG gibt an, ob ein Vorgang ablaufen kann, nicht wie schnell: „Spontan“ bedeutet in der Chemie „freiwillig“, nicht „schnell“.'),
      soWhat: b('Paper and wood are the same: burning them in air has ΔG < 0, yet they sit on a shelf for years until a flame starts them. Unit 21 explains this barrier, the activation energy.',
        'Mit Papier und Holz ist es genauso: Ihre Verbrennung an der Luft hat ΔG < 0, trotzdem liegen sie jahrelang im Regal, bis eine Flamme sie entzündet. Einheit 21 erklärt diese Hürde, die Aktivierungsenergie.'),
    },
    {
      title: b('Where the model breaks: boiling water', 'Wo das Modell an Grenzen stößt: siedendes Wasser'), tag: 'H2O(g)',
      show: { engine: 'energy', reaction: 'water-boil', mode: 'gibbs', temp: 373 },
      numbers: [
        { v: '370 K', label: b('boiling point predicted from 25 °C data (44.0 ÷ 0.1188)', 'Siedetemperatur, vorhergesagt aus Daten bei 25 °C (44,0 : 0,1188)') },
        { v: '373 K', label: b('boiling point measured (100 °C)', 'Siedetemperatur, gemessen (100 °C)') },
        { v: '40.65 kJ/mol', label: b('ΔH of boiling measured at 100 °C (44.0 at 25 °C)', 'ΔH beim Sieden, bei 100 °C gemessen (bei 25 °C: 44,0)') },
      ],
      body: b('A formula is only as good as the numbers you put in, and ΔH and ΔS themselves change with temperature. Water: the 25 °C values give ΔG = 0 at 370 K, 3 K below the real boiling point; the values measured at 100 °C give 373 K. Limestone is the same: 845 °C from 25 °C data, about 900 °C measured.',
        'Eine Formel ist nur so gut wie die Zahlen, die man einsetzt, und ΔH und ΔS hängen selbst von der Temperatur ab. Wasser: Mit den Werten bei 25 °C ist ΔG = 0 bei 370 K, 3 K unter der echten Siedetemperatur; mit den bei 100 °C gemessenen Werten ergeben sich 373 K. Beim Kalkstein ist es genauso: 845 °C aus den 25-°C-Daten, gemessen etwa 900 °C.'),
      soWhat: b('In an A-level, IB or Abitur exam, treat ΔH and ΔS as constant unless told otherwise, and add that the result is an estimate; the further from 25 °C, the larger the error can be.',
        'In der Klausur nimmst du ΔH und ΔS als konstant an, wenn nichts anderes angegeben ist, und schreibst dazu, dass das Ergebnis eine Näherung ist; je weiter von 25 °C entfernt, desto größer kann der Fehler werden.'),
    },
  ],

  flaw: {
    id: 'u20-flaw', unit: 20, kind: 'flaw', format: 'flaw', evidence: 'transfer', concepts: ['u20.gibbs', 'u20.crossover'],
    prompt: b('Where does this reasoning first go wrong?', 'Wo geht diese Überlegung zum ersten Mal schief?'),
    lines: [
      b('For N₂ + 3 H₂ → 2 NH₃ (ΔH = −91.8 kJ/mol, ΔS = −0.1981 kJ/(mol·K)) at 300 °C: ΔG = ΔH − T·ΔS = −91.8 − 300 × (−0.1981) = −32.4 kJ/mol.', 'Für N₂ + 3 H₂ → 2 NH₃ (ΔH = −91,8 kJ/mol, ΔS = −0,1981 kJ/(mol·K)) bei 300 °C: ΔG = ΔH − T·ΔS = −91,8 − 300 · (−0,1981) = −32,4 kJ/mol.'),
      b('ΔG is negative, so at 300 °C ammonia can form by itself.', 'ΔG ist negativ, also kann Ammoniak bei 300 °C freiwillig entstehen.'),
      b('ΔS is negative, so heating makes −T·ΔS larger and ΔG rise.', 'ΔS ist negativ, also wird −T·ΔS beim Erhitzen größer, und ΔG steigt.'),
      b('So ammonia can form by itself even at 450 °C, where ΔG = −91.8 + 450 × 0.1981 = −2.7 kJ/mol.', 'Also kann Ammoniak sogar bei 450 °C freiwillig entstehen, wo ΔG = −91,8 + 450 · 0,1981 = −2,7 kJ/mol ist.'),
    ],
    flaw: 0,
    alsoFalse: [1, 3],
    near: [{ step: 2, note: b('This one is true: with ΔS < 0, −T·ΔS is positive and grows with T. Look at the temperature in step 1.', 'Dieser Schritt stimmt: Mit ΔS < 0 ist −T·ΔS positiv und wächst mit T. Schau dir die Temperatur in Schritt 1 an.') }],
    explain: b('Step 1 is the first wrong step: T must be in kelvin, and 300 °C = 573 K, so ΔG = −91.8 + 573 × 0.1981 = +21.7 kJ/mol. Step 2 is then false: at 300 °C ammonia cannot form by itself (at 1 bar). Step 3 is true: heating makes ΔG rise until it reaches zero at 463 K (190 °C). Step 4 repeats the slip with 450 instead of 723 K and is false: at 450 °C ΔG = +51.4 kJ/mol.',
      'Schritt 1 ist der erste falsche Schritt: T muss in Kelvin eingesetzt werden, und 300 °C sind 573 K, also ΔG = −91,8 + 573 · 0,1981 = +21,7 kJ/mol. Damit ist Schritt 2 falsch: Bei 300 °C kann Ammoniak nicht freiwillig entstehen (bei 1 bar). Schritt 3 stimmt: Beim Erhitzen steigt ΔG und erreicht bei 463 K (190 °C) den Wert null. Schritt 4 wiederholt den Fehler mit 450 statt 723 K und ist falsch: Bei 450 °C ist ΔG = +51,4 kJ/mol.'),
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
      { id: 'temperature', concept: 'u20.temperature', idea: b('Temperature sets how much the entropy term counts, so it can flip the sign of ΔG', 'Die Temperatur bestimmt, wie stark der Entropieterm zählt, und kann so das Vorzeichen von ΔG umkehren'), contra: T_IRRELEVANT,
        en: TEMP_IDEA_EN, de: TEMP_IDEA_DE },
      { id: 'crossover', concept: 'u20.crossover', idea: b('The switch comes where ΔG = 0, at T = ΔH ÷ ΔS (ΔS in kJ/(mol·K))', 'Der Wechsel liegt bei ΔG = 0, also bei T = ΔH : ΔS (ΔS in kJ/(mol·K))'),
        en: CROSS_EN, de: CROSS_DE },
      { id: 'rate', concept: 'u20.not-rate', idea: b('ΔG says whether a reaction can run, not how fast', 'ΔG gibt an, ob eine Reaktion ablaufen kann, nicht wie schnell'), contra: DG_FAST,
        en: NOTRATE_EN, de: NOTRATE_DE },
    ] as Idea[],
    tightened: b('ΔG = ΔH − T·ΔS combines the energy change ΔH with the entropy change ΔS. When ΔG is negative, the reaction can run by itself: it is exergonic. Temperature sets how much the entropy term counts, so heating or cooling can flip the sign of ΔG; the switch comes where ΔG = 0, at T = ΔH ÷ ΔS with ΔS in kJ/(mol·K), 1119 K for limestone on this model. ΔG says whether a reaction can run, not how fast: diamond turning into graphite has ΔG < 0 but is far too slow to notice.',
      'ΔG = ΔH − T·ΔS verbindet die Enthalpieänderung ΔH mit der Entropieänderung ΔS. Ist ΔG negativ, kann die Reaktion freiwillig ablaufen: Sie ist exergonisch. Die Temperatur bestimmt, wie stark der Entropieterm zählt, deshalb kann Erhitzen oder Abkühlen das Vorzeichen von ΔG umkehren; der Wechsel liegt dort, wo ΔG = 0 ist, bei T = ΔH : ΔS mit ΔS in kJ/(mol·K), beim Kalkbrennen nach dem Modell 1119 K. ΔG gibt an, ob eine Reaktion ablaufen kann, nicht wie schnell: Beim Übergang von Diamant zu Graphit ist ΔG negativ, aber er verläuft unmerklich langsam.'),
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
      title: b('Free Energy (optional: the textbook version)', 'Free Energy (optional: the textbook version)'), source: 'OpenStax Chemistry 2e, section 16.4',
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
        b('', 'Was vernachlässigt die Seite bei ΔH und ΔS? Vergleiche mit dem Beispiel zum siedenden Wasser (370 K und 373 K).'),
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
        de: 'G. Ihre Änderung ΔG = ΔH − T·ΔS (Gibbs-Gleichung) verbindet Enthalpie- und Entropieänderung einer Reaktion bei konstanter Temperatur und konstantem Druck, in kJ/mol. ΔG < 0: Die Reaktion kann freiwillig ablaufen; über die Geschwindigkeit sagt ΔG nichts.' },
      falseFriend: { en: 'German books say "freie Enthalpie" and write Δ_{r}G; "Gibbs-Energie" is the same quantity.', de: 'Englische Bücher sagen „Gibbs energy“ oder „free energy“.' },
    },
    exergonic: {
      en: 'exergonic', de: 'exergonisch', unit: 20,
      def: { en: 'With ΔG < 0: the reaction can run by itself at that temperature. The opposite, ΔG > 0, is endergonic. Not the same as exothermic, which is about ΔH alone.',
        de: 'Mit ΔG < 0: Die Reaktion kann bei dieser Temperatur freiwillig ablaufen. Das Gegenteil, ΔG > 0, nennt man endergonisch. Nicht dasselbe wie exotherm, das nur ΔH betrifft.' },
    },
  },
};
