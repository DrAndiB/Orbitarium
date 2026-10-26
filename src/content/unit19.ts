// Unit 19 — Entropy, in the Particle Box (spreading view).
// Numbers with dH() and dS() in thermo.ts (OpenStax Chemistry 2e, Appendix G; ice: section 10.3):
// ice-melt +6.01 kJ/mol, +22.0 J/(mol·K) (6010 ÷ 273.15 = 22.0, so at 0 °C the two balance); water-boil (25 °C data)
// +44.0 kJ/mol, +118.8 J/(mol·K), S° H₂O(l) 70.0 → H₂O(g) 188.8; nh3 −91.8 kJ/mol, ΔS = 2 × 192.8 − (191.6 + 3 × 130.7)
// = −198.1; h2o2 −196.1 kJ/mol, ΔS = 2 × 70.0 + 205.2 − 2 × 109.6 = +126.0; h2-burn-l −571.7 kJ/mol, ΔS = 2 × 70.0 −
// (2 × 130.7 + 205.2) = −326.6 (near misses: +326.6; one H₂O −396.6; one H₂ −195.9; neither factor −265.9).
// Surroundings: 91 800 ÷ 298.15 = 307.9 J/(mol·K) for the ammonia synthesis; freezing at −10 °C: 6010 ÷ 263.15 = 22.8,
// total 22.8 − 22.0 = +0.8 J/(mol·K) (ΔH and ΔS of melting taken as constant below 0 °C: a model, said in the text).
// Counting: 2⁴ = 16, C(4, 2) = 6; 2¹⁰ = 1024, C(10, 5) = 252; 2¹⁰⁰ = 1.27 · 10³⁰; at ten counts a second,
// 1.27 · 10³⁰ ÷ 10 s ÷ 3.156 · 10⁷ s/year = 4.0 · 10²¹ years.
// Sources fetched for values not in the data files:
// - Ammonium nitrate dissolving (instant cold packs): ΔH_soln = +25.7 kJ/mol. LibreTexts, Introductory Chemistry (CK-12),
//   17.13 "Heat of Solution" (chem.libretexts.org/Bookshelves/Introductory_Chemistry/Introductory_Chemistry_(CK-12)/
//   17:_Thermochemistry/17.13:_Heat_of_Solution).
// - Four particles in two boxes, 2⁴ = 16 microstates, 6 with two in each box: OpenStax Chemistry 2e, section 16.2.
import type { Bi } from '../i18n';
import type { ChoiceItem, FlawItem, EstimateItem } from './items';
import type { Idea } from './unit06';
import type { UnitContent } from './unitTypes';

const b = (en: string, de: string): Bi => ({ en, de });
const src = (r: RegExp) => `(?:${r.source})`;
const any = (...rs: RegExp[]) => new RegExp(rs.map(src).join('|'));
const together = (a: RegExp, c: RegExp, gap = 60) => new RegExp(`${src(a)}.{0,${gap}}${src(c)}|${src(c)}.{0,${gap}}${src(a)}`);

// ---------- explain-back patterns ----------
// Idea 1, some processes run by themselves although they take in energy.
const RUN_EN = /(by (it|them)sel(f|ves)|on (its|their) own|spontaneous\w*|happen\w*|\bruns?\b|running|\boccur\w*|go(es)? ahead|feasible)/;
const TAKEIN_EN = /(takes? in|taking in|taken in|absorb\w*|endotherm\w*|needs? (energy|heat)|costs? (energy|heat)|positive (δh|dh|delta h|enthalpy)|(δh|dh|delta h) (is )?(> ?0|positive)|from (the|their|its) surroundings|cools?\b|cooling|gets? cold\w*)/;
const RUN_DE = /(von selbst|freiwillig\w*|spontan\w*|selbstständig|selbständig|ablauf\w*|läuft|laufen|passier\w*|geschieh\w*|geschehen)/;
const TAKEIN_DE = /(endotherm\w*|aufnehm\w*|aufnimm\w*|aufgenommen|nimmt .{0,25}\bauf\b|(energie|wärme) (braucht|brauchen|benötigt|benötigen|kostet|kosten)|(braucht|brauchen|benötigt|benötigen|kostet|kosten) .{0,15}(energie|wärme)|(δh|dh) (ist )?(> ?0|positiv)|positiv\w* (δh|dh|reaktionsenthalpie)|aus der umgebung|kühlt|abkühl\w*|kalt\w*)/;
// "Ice melts by itself, even though it absorbs energy": the comma splits the clause, so the concessive half counts alone.
const CONCESSIVE_EN = new RegExp(`\\b(even though|although|though|despite|in spite of)\\b.{0,40}${src(TAKEIN_EN)}`);
const CONCESSIVE_DE = new RegExp(`(obwohl|obgleich|auch wenn|trotz)\\b.{0,40}${src(TAKEIN_DE)}`);
// The main misconception: only processes that give out energy run by themselves.
const SPONT_EXO = {
  en: /^(?!.*\bnot (only|just)\b).*(\bonly (exotherm\w*|processes that (release|give out|give off)|reactions that (release|give out|give off))|endotherm\w*.{0,40}(can't|cannot|can not|never|won't|don't|do not|doesn't|does not) .{0,20}(run|happen|occur|go)|(must|has to|have to|need to|needs to) (secretly )?(release|give out|give off) (energy|heat)|secretly (releas\w*|giv\w*))/,
  de: /^(?!.*nicht nur).*(nur exotherm\w*|nur (vorgänge|reaktionen),? (die|bei denen) .{0,30}(abgeben|frei)|endotherm\w*.{0,40}(nicht|nie|kein\w*) .{0,25}(ablauf\w*|laufen|läuft|von selbst|freiwillig)|(muss|müssen) .{0,20}(energie|wärme) (abgeben|freisetzen)|heimlich .{0,25}(ab|frei))/,
};

// Idea 2, entropy is a measure of the number of ways particles and their energy can be arranged.
const ENTROPY_EN = /(entrop\w*|δs|\bds\b|delta s)/;
const WAYS_EN = /(ways?\b|arrangement\w*|arrang\w*|possibilit\w*|microstate\w*|configuration\w*|combination\w*|permutation\w*|number of states|how many states)/;
const ENTROPY_DE = /(entropie\w*|δs|\bds\b)/;
const WAYS_DE = /(möglichkeit\w*|anordnung\w*|mikrozust\w*|zustände|kombination\w*|verteilungen|wie viele arten|zahl der arten)/;
const BOLTZMANN = /\bs ?= ?k\b.{0,6}ln/;
const MESSINESS = {
  en: /^(?!.*(\bnot\b|n't|\bno\b|\bnever\b|rather than|instead of)).*entrop\w*.{0,30}\b(visible|untidy|messy|messiness|mess|how messy)\b/,
  de: /^(?!.*(nicht|kein|statt)).*entropie.{0,30}(sichtbar\w*|unaufgeräumt\w*|durcheinander im aussehen|chaos im aussehen|wie unordentlich)/,
};

// Idea 3, spreading happens because spread-out arrangements vastly outnumber the rest.
const SPREAD_EN = /(spread\w*|mix\w*|evenly|half and half|50 ?: ?50|50 ?\/ ?50|dispers\w*|distribut\w*|fill\w* the (whole )?(box|room|space|container))/;
const LIKELY_EN = /(more (ways|arrangements|possibilities|microstates|combinations|likely|probable)|far more|vastly more|many more|much more likely|outnumber\w*|most (ways|arrangements|likely|probable)|probab\w*|by chance|random\w*|unlikely|improbable|likel\w*|odds)/;
const SPREAD_DE = /(verteil\w*|misch\w*|ausbreit\w*|breit\w* sich .{0,10}aus|gleichmäßig|halb und halb|50 ?: ?50|füll\w* .{0,15}(box|raum|behälter))/;
const LIKELY_DE = /(mehr (möglichkeit|anordnung|mikrozust|kombination)\w*|überzahl|weit mehr|viel mehr|wahrscheinlich\w*|zufall\w*|zufällig\w*|unwahrscheinlich\w*|die meisten (möglichkeit|anordnung)\w*)/;
const WANT_SPACE = {
  en: /^(?!.*(\bnot\b|n't|\bno\b|\bnever\b|without|rather than|instead of|nothing)).*(\b(want\w*|wish\w*|like\w*|tr(y|ies|ying) to get|seek\w*|prefer\w*|desire\w*) (more |the |extra |their |some |enough )?(own )?(room|space)\b|\b(to get|to have|to find) (more |extra |their own )?(room|space)\b)/,
  de: /^(?!.*(nicht|kein|ohne|statt|nichts)).*((wollen|will|möchten|möchte|suchen|sucht|streben|strebt|versuchen|versucht)\w* .{0,25}(platz|raum)|(platz|raum) (haben )?(wollen|will|möchten|möchte)|um (mehr |genug )?(platz|raum) zu (haben|bekommen|gewinnen))/,
};

// Idea 4, gas > liquid > solid.
const STATEPAIR_EN = /(\bgas(es)?\b.{0,25}\b(liquids?|solids?)\b|\b(liquids?|solids?)\b.{0,25}\bgas(es)?\b|\bsolids?\b.{0,20}\bliquids?\b|\bliquids?\b.{0,20}\bsolids?\b|\bmelt\w*|\bboil\w*|evaporat\w*|vapou?ri[sz]\w*|sublim\w*)/;
const HIGHER_EN = /((higher|more|greater|larger|bigger|most|highest|largest|rises?|rising|increas\w*|goes up|jumps?)\b.{0,20}\b(entrop\w*|ways|freedom|arrangements)|(entrop\w*|ways|freedom)\b.{0,25}\b(higher|more|greater|larger|bigger|most|highest|largest|rises?|rising|increas\w*|goes up|jumps?)\b)/;
// "A gas has more entropy than a liquid", "S(gas) > S(liquid) > S(solid)", "gases have the highest entropy".
const ORDER_EN = /s ?\(g\)\s?>\s?s ?\(l\)\s?>\s?s ?\(s\)|gas\w*\)?\s?>\s?(s\s?\()?liquid\w*\)?\s?>\s?(s\s?\()?solid|solid\w*\)?\s?<\s?(s\s?\()?liquid\w*\)?\s?<\s?(s\s?\()?gas/;
const COMPARE_EN = /\b(gas(es)?|vapou?r|liquids?)\b.{0,30}\b(more|higher|greater|larger|bigger)\b.{0,15}(entrop\w*|ways|freedom).{0,25}\bthan\b.{0,15}\b(liquids?|solids?|ice|crystals?)\b|\b(gas(es)?|vapou?r)\b.{0,25}\b(highest|most|largest|greatest)\b.{0,5}\b(entrop\w*|ways|freedom)|\b(highest|most|largest|greatest)\b.{0,5}\b(entrop\w*|ways)\b.{0,25}\b(gas(es)?|vapou?r)\b/;
const LOWER_EN = /((lower\w*|decreas\w*|falls?|drops?|less|smaller)\b.{0,15}\bentrop\w*|entrop\w*.{0,20}\b(lower\w*|decreas\w*|falls?|drops?|goes down)\b)/;
const ORDER_DE = /s ?\(g\)\s?>\s?s ?\(l\)\s?>\s?s ?\(s\)|gas\w*\)?\s?>\s?(s\s?\()?(flüssig\w*|fl\.?)\)?\s?>\s?(s\s?\()?fest|fest\w*\)?\s?<\s?(s\s?\()?(flüssig\w*|fl\.?)\)?\s?<\s?(s\s?\()?gas/;
const COMPARE_DE = /(gas\w*|dampf\w*|flüssigkeit\w*).{0,30}(mehr|höhere|größere)\w* (entropie|möglichkeit\w*|bewegungsfreiheit).{0,25}als .{0,15}(flüssig\w*|fest\w*|eis|kristall\w*)|(am (größten|höchsten)|höchste\w*|größte\w*).{0,25}entropie.{0,20}(im |in |beim )?(gas|dampf)|entropie.{0,25}(im |in |beim )?(gas|dampf)\w*.{0,15}am (größten|höchsten)|(gas|dampf)\w*.{0,25}(die )?(höchste|größte) entropie/;
const STATEPAIR_DE = /(gas\w*.{0,25}(flüssig|fest)\w*|(flüssig|fest)\w*.{0,25}gas\w*|fest\w*.{0,20}flüssig\w*|flüssig\w*.{0,20}fest\w*|schmelz\w*|schmilzt|sied\w*|verdampf\w*|verdunst\w*|sublim\w*)/;
const HIGHER_DE = /(nimmt (die |der )?entropie\w* .{0,10}zu|(höher\w*|größer\w*|mehr|steigt|steigen|zunimmt|nimmt .{0,12}zu|am größten|am höchsten).{0,20}(entropie|möglichkeit\w*|bewegungsfreiheit)|(entropie|möglichkeit\w*|bewegungsfreiheit)\w*.{0,25}(höher|größer|mehr|steigt|steigen|zunimmt|nimmt .{0,12}zu|am größten|am höchsten))/;
const LOWER_DE = /(nimmt (die |der )?entropie\w* .{0,10}ab|(niedriger\w*|kleiner\w*|weniger|sinkt|sinken|abnimmt|nimmt .{0,12}ab).{0,15}entropie|entropie.{0,20}(niedriger|kleiner|sinkt|sinken|abnimmt|nimmt .{0,12}ab))/;

// Idea 5, more moles of gas in the products: ΔS usually positive (fewer: negative).
const GASMORE_EN = /(more (moles? of |molecules of |particles of )?gas\w*|(number|amount|moles?) of gas\w* (increases|rises|goes up|grows)|gas(eous)? (moles|molecules|particles) (increase|rise|go up)|(make|makes|making|made|form|forms|forming|formed|produce\w*|give|gives|giving|release\w*) (off |out )?(a |more |some |extra )?gas\b|(a )?gas (forms|is formed|is made|is produced|appears|is released|is given off)|δn ?\(?gas\)? ?> ?0)/;
const FEWERGAS_EN = /((fewer|less) (moles? of |molecules of |particles of )?gas\w*|(number|amount|moles?) of gas\w* (decreases|falls|drops|goes down)|gas(eous)? (moles|molecules|particles) (decrease|fall|drop)|δn ?\(?gas\)? ?< ?0)/;
const S_UP_EN = together(ENTROPY_EN, /(positive|> ?0|increas\w*|rises?|goes up|higher|bigger|larger|greater)/, 25);
const S_DOWN_EN = together(ENTROPY_EN, /(negative|< ?0|decreas\w*|falls?|drops?|goes down|lower|smaller)/, 25);
const GASMORE_DE = /(mehr (mol |teilchen |moleküle )?gas\w*|zunahme (der |an )?gas\w*|(gasteilchen|gasmolekül\w*|stoffmenge (an |der )?gas\w*|gasmenge)\w* (nimmt|nehmen) .{0,10}zu|(gasteilchen|gasmolekül\w*|gasmenge) .{0,15}(steigt|zunimmt)|ein gas (entsteht|bildet sich|wird frei)|gas entsteh\w*|entsteh\w* .{0,15}gas\w*|bildet .{0,15}gas\w*|δn ?\(?gas\)? ?> ?0)/;
const FEWERGAS_DE = /(weniger (mol |teilchen |moleküle )?gas\w*|abnahme (der |an )?gas\w*|(gasteilchen|gasmolekül\w*|gasmenge)\w* (nimmt|nehmen) .{0,10}ab|δn ?\(?gas\)? ?< ?0)/;
const S_UP_DE = any(together(ENTROPY_DE, /(positiv\w*|> ?0|steigt|steigen|zunimmt|nimmt .{0,12}zu|größer|höher|erhöht)/, 25), /nimmt (die |der )?entropie\w* .{0,10}zu/);
const S_DOWN_DE = any(together(ENTROPY_DE, /(negativ\w*|< ?0|sinkt|sinken|abnimmt|nimmt .{0,12}ab|kleiner|niedriger)/, 25), /nimmt (die |der )?entropie\w* .{0,10}ab/);

export const UNIT19: UnitContent = {
  n: 19,
  title: b('Entropy', 'Entropie'),
  lead: b('Why some changes run by themselves although they take in energy: entropy, the number of ways particles and their energy can be arranged, and how to tell when it goes up.',
    'Warum manche Vorgänge von selbst ablaufen, obwohl sie Energie aufnehmen: die Entropie, ein Maß für die Zahl der Möglichkeiten, Teilchen und ihre Energie anzuordnen, und woran man erkennt, wann sie steigt.'),

  puzzle: {
    title: b('Cold, and still it happens', 'Kalt, und trotzdem läuft es ab'),
    lead: b('Squeeze an instant cold pack and a bag of water inside bursts: ammonium nitrate dissolves, and within seconds the pack is icy. An ice cube left on the table melts and cools what is around it. Unit 17 showed what a positive ΔH means: energy taken in from the surroundings.',
      'Drückst du eine Sofort-Kältekompresse, platzt innen ein Beutel mit Wasser: Ammoniumnitrat löst sich, und in Sekunden ist die Kompresse eiskalt. Ein Eiswürfel auf dem Tisch schmilzt und kühlt seine Umgebung. Einheit 17 hat gezeigt, was ein positives ΔH bedeutet: Energie, die aus der Umgebung aufgenommen wird.'),
    data: {
      caption: b('Energy taken in (+) or given out (−) per mole, and what happens in a room at 20 °C. The value for ice is measured at 0 °C.',
        'Aufgenommene (+) oder abgegebene (−) Energie pro Mol und was in einem Raum bei 20 °C passiert. Der Wert für Eis ist bei 0 °C gemessen.'),
      head: [b('Change', 'Vorgang'), b('ΔH in kJ/mol', 'ΔH in kJ/mol'), b('Runs by itself at 20 °C?', 'Läuft bei 20 °C von selbst ab?')],
      rows: [
        { cells: [b('Ice melts: H₂O(s) → H₂O(l)', 'Eis schmilzt: H₂O(s) → H₂O(l)'), '+6.01', b('yes', 'ja')] },
        { cells: [b('Ammonium nitrate dissolves in water (cold pack)', 'Ammoniumnitrat löst sich in Wasser (Kältekompresse)'), '+25.7', b('yes', 'ja')] },
        { cells: [b('Water freezes: H₂O(l) → H₂O(s)', 'Wasser gefriert: H₂O(l) → H₂O(s)'), '−6.01', b('no', 'nein')] },
      ],
      numeric: [1],
    },
    clash: b('Melting and dissolving both take in energy: on an energy diagram they go uphill. Yet both run by themselves, while freezing, which gives out energy, does not happen in a warm room. Why do they run?',
      'Schmelzen und Lösen nehmen beide Energie auf: Im Energiediagramm geht es bergauf. Trotzdem laufen beide von selbst ab, während Gefrieren, bei dem Energie abgegeben wird, in einem warmen Raum nicht passiert. Warum laufen sie ab?'),
    question: {
      id: 'u19-puzzle', unit: 19, kind: 'choice', format: 'predict', withConfidence: true, evidence: 'predict',
      concepts: ['u19.not-energy', 'u19.probable'], targets: ['spontaneous-exothermic', 'particles-want-space'],
      prompt: b('Your best guess:', 'Deine beste Vermutung:'),
      options: [
        { text: b('They secretly give out energy somewhere, or they could not run', 'Sie geben heimlich irgendwo Energie ab, sonst könnten sie nicht ablaufen'), mis: 'spontaneous-exothermic' },
        { text: b('The particles want more room, so they push out of the crystal', 'Die Teilchen wollen mehr Platz, also drängen sie aus dem Kristall'), mis: 'particles-want-space' },
        { text: b('The warm room supplies the energy, and that alone makes them run', 'Der warme Raum liefert die Energie, und das allein lässt sie ablaufen') },
        { text: b('Spread-out particles and energy have vastly more ways to be arranged', 'Verteilte Teilchen und Energie haben weit mehr Anordnungsmöglichkeiten'), correct: true },
      ],
      explain: b('Both take in energy (+6.01 and +25.7 kJ/mol): nothing is given out in secret. The warm room does supply that energy, but it does not explain the direction: the same room could take up the energy given out by freezing water, yet water does not freeze at 20 °C. They run because once the crystal breaks up, the particles and their energy can be arranged in vastly more ways; particles do not want anything, and the Particle Box shows how far the numbers outweigh everything else.',
        'Beide nehmen Energie auf (+6,01 und +25,7 kJ/mol): Heimlich abgegeben wird nichts. Der warme Raum liefert diese Energie zwar, aber das erklärt nicht die Richtung: Derselbe Raum könnte auch die Energie aufnehmen, die gefrierendes Wasser abgibt, und doch gefriert Wasser bei 20 °C nicht. Sie laufen ab, weil sich Teilchen und Energie anordnen lassen, sobald der Kristall zerfällt, auf weit mehr Arten als vorher; Teilchen wollen nichts, und die Teilchenbox zeigt, wie weit diese Zahlen alles andere übertreffen.'),
    } as ChoiceItem,
    after: b('Next: in the Particle Box, remove a partition and count how the particles spread.', 'Als Nächstes: Entferne in der Teilchenbox eine Trennwand und zähle, wie sich die Teilchen verteilen.'),
  },

  explore: {
    title: b('The Particle Box: spreading out', 'Die Teilchenbox: Ausbreitung'),
    intro: b('Each sphere is one argon atom in a box with a partition in the middle. Remove it and the atoms fly at random, bouncing off the walls and each other; nothing pulls them to the right. The readout counts ten times a second how many are on the left, and “Ways to arrange” counts the arrangements: each atom is either left or right, and every single arrangement is equally likely. [[entropy|Entropy]] S measures such ways, for where the particles are and for how their energy is shared out, in J/(mol·K): joules per kelvin for each mole. A process that can run by itself is called [[spontaneous]]; that says nothing about how fast it runs.',
      'Jede Kugel ist ein Argonatom in einer Box mit einer Trennwand in der Mitte. Entfernst du sie, fliegen die Atome zufällig umher und prallen von den Wänden und voneinander ab; nichts zieht sie nach rechts. Die Anzeige zählt zehnmal pro Sekunde, wie viele links sind, und „Anordnungsmöglichkeiten“ (Fachwort: Mikrozustände) gibt die Zahl der Anordnungen an: Jedes Atom ist entweder links oder rechts, und jede einzelne Anordnung ist gleich wahrscheinlich. Die [[entropy|Entropie]] S ist ein Maß für solche Möglichkeiten, für die Orte der Teilchen und für die Verteilung ihrer Energie, in J/(mol·K): Joule pro Kelvin und Mol. Einen Vorgang, der von selbst ablaufen kann, nennt man [[spontaneous|freiwillig]] (oder spontan); über die Geschwindigkeit sagt das nichts.'),
    tasks: [
      { id: 'open', key: true, text: b('Choose 10 particles and remove the partition. Where do the atoms go, and how does the count change?', 'Wähle die Teilchenzahl 10 und entferne die Trennwand. Wohin gehen die Atome, und wie ändert sich die Zählung?') },
      { id: 'back', key: true, text: b('Choose 4 particles, remove the partition and wait until all four are back on the left by chance.', 'Wähle 4 Teilchen, entferne die Trennwand und warte, bis zufällig alle vier wieder links sind.') },
      { id: 'many', key: true, text: b('Now 100 particles: remove the partition. How far from half and half does the count ever get?', 'Jetzt 100 Teilchen: Entferne die Trennwand. Wie weit entfernt sich die Zählung jemals von halb und halb?') },
      { id: 'ways', text: b('With 10 particles, open “Ways to arrange”. How many arrangements put five on each side, and how many put all ten on the left?', 'Öffne bei 10 Teilchen „Anordnungsmöglichkeiten“. Wie viele Anordnungen haben fünf auf jeder Seite, und wie viele alle zehn links?') },
      { id: 'mix', text: b('Switch on “Two gases” and remove the partition. Do argon and neon ever unmix?', 'Schalte „Zwei Gase“ ein und entferne die Trennwand. Entmischen sich Argon und Neon jemals wieder?') },
      { id: 'melt', challenge: true, text: b('Pick water, cool it below 0 °C until it freezes, then warm it to room temperature. Melting takes in energy: what makes it happen anyway?', 'Wähle Wasser, kühle es unter 0 °C, bis es gefriert, und erwärme es dann auf Raumtemperatur. Schmelzen nimmt Energie auf: Was lässt es trotzdem ablaufen?') },
    ],
    notes: {
      open: b('The atoms spread through the whole box and the count wobbles around 5 : 5. Nothing pushes them: each atom moves at random, and far more arrangements have about half on each side than all on one side.',
        'Die Atome verteilen sich in der ganzen Box, und die Zählung schwankt um 5 : 5. Nichts schiebt sie: Jedes Atom bewegt sich zufällig, und es gibt weit mehr Anordnungen mit etwa der Hälfte auf jeder Seite als mit allen auf einer Seite.'),
      back: b('With four atoms it happens again and again. Each atom is on the left about half the time, so all four on the left at once is like four coins all landing heads: unusual, but not rare.',
        'Bei vier Atomen passiert es immer wieder. Jedes Atom ist etwa die Hälfte der Zeit links, also ist „alle vier gleichzeitig links“ wie vier Münzen, die alle Kopf zeigen: ungewöhnlich, aber nicht selten.'),
      many: b('With 100 atoms the count stays close to 50 : 50, and all 100 on the left never comes back: the chance at a given moment is 1 in 1.27 · 10³⁰. Counting ten times a second, you would wait about 4 · 10²¹ years for it.',
        'Bei 100 Atomen bleibt die Zählung nah an 50 : 50, und „alle 100 links“ kommt nie wieder: Die Wahrscheinlichkeit in einem Moment ist 1 zu 1,27 · 10³⁰. Bei zehn Zählungen pro Sekunde müsstest du etwa 4 · 10²¹ Jahre darauf warten.'),
      ways: b('For 10 atoms: 2¹⁰ = 1024 arrangements in all; 252 put five on each side, only 1 puts all ten on the left. Every single arrangement is equally likely; half and half wins because it has by far the most arrangements.',
        'Bei 10 Atomen: insgesamt 2¹⁰ = 1024 Anordnungen; 252 haben fünf auf jeder Seite, nur 1 hat alle zehn links. Jede einzelne Anordnung ist gleich wahrscheinlich; halb und halb gewinnt, weil es bei Weitem die meisten Anordnungen hat.'),
      mix: b('The two gases mix and stay mixed. Unmixing is not forbidden, just as all atoms back on the left is not, but it is so improbable that you will not see it. Mixing raises the entropy, and so does dissolving: the ions of a cold pack spread through the water.',
        'Die beiden Gase mischen sich und bleiben gemischt. Entmischen ist nicht verboten, genauso wenig wie „alle Atome wieder links“, aber so unwahrscheinlich, dass du es nicht sehen wirst. Mischen erhöht die Entropie, und Lösen auch: Die Ionen einer Kältekompresse verteilen sich im Wasser.'),
      melt: b('Ice takes in 6.01 kJ/mol to melt, yet at room temperature it melts by itself: in the liquid, the molecules can be placed, and can share out their energy, in far more ways than in the crystal (ΔS = +22.0 J/(mol·K)). Unit 20 weighs the energy against the ways: below 0 °C, freezing wins.',
        'Eis nimmt beim Schmelzen 6,01 kJ/mol auf und schmilzt bei Raumtemperatur trotzdem von selbst: In der Flüssigkeit lassen sich die Moleküle auf weit mehr Arten anordnen und ihre Energie verteilen als im Kristall (ΔS = +22,0 J/(mol·K)). Einheit 20 wägt die Energie gegen die Möglichkeiten ab: Unter 0 °C gewinnt das Gefrieren.'),
    },
    check: {
      id: 'u19-check', unit: 19, kind: 'choice', format: 'why', withConfidence: true, evidence: 'explain',
      concepts: ['u19.probable', 'u19.ways'], targets: ['particles-want-space', 'spontaneous-exothermic'],
      prompt: b('With 100 atoms and the partition removed, the count stays close to 50 : 50 and never returns to all 100 on the left. Why?',
        'Bei 100 Atomen ohne Trennwand bleibt die Zählung nah an 50 : 50 und kehrt nie zu „alle 100 links“ zurück. Warum?'),
      options: [
        { text: b('Each atom seeks out the emptier side of the box', 'Jedes Atom sucht sich die leerere Seite der Box'), mis: 'particles-want-space' },
        { text: b('Spreading out gives out energy, so the spread state is lower', 'Beim Ausbreiten wird Energie frei, also liegt der verteilte Zustand tiefer'), mis: 'spontaneous-exothermic' },
        { text: b('Far more arrangements are close to half and half than far from it', 'Weit mehr Anordnungen liegen nah an halb und halb als weit davon entfernt'), correct: true },
        { text: b('The atoms collide until they are evenly spaced, then stay put', 'Die Atome stoßen zusammen, bis sie gleichmäßig verteilt sind, und bleiben dann stehen') },
      ],
      explain: b('The atoms move at random, nothing sends them to the right, and spreading out does not change their energy. Of the 2¹⁰⁰ arrangements, an enormous number lie close to 50 : 50 and exactly one has all 100 on the left, so near half and half is what you almost always see.',
        'Die Atome bewegen sich zufällig, nichts schickt sie nach rechts, und beim Ausbreiten ändert sich ihre Energie nicht. Von den 2¹⁰⁰ Anordnungen liegt eine riesige Zahl nah an 50 : 50 und genau eine hat alle 100 links, also siehst du fast immer etwa halb und halb.'),
    } as ChoiceItem,
  },

  predictions: [
    {
      item: {
        id: 'u19-peroxide', unit: 19, kind: 'choice', format: 'predict', withConfidence: true, evidence: 'transfer',
        concepts: ['u19.gas-moles', 'u19.states'], targets: ['entropy-messiness'],
        prompt: b('Hydrogen peroxide slowly decomposes: 2 H₂O₂(l) → 2 H₂O(l) + O₂(g). What is the sign of ΔS for this reaction?',
          'Wasserstoffperoxid zerfällt langsam: 2 H₂O₂(l) → 2 H₂O(l) + O₂(g). Welches Vorzeichen hat ΔS für diese Reaktion?'),
        options: [
          { text: b('Negative: the products are smaller, simpler molecules, so tidier', 'Negativ: Die Produkte sind kleinere, einfachere Moleküle, also ordentlicher'), mis: 'entropy-messiness' },
          { text: b('About zero: the reaction starts and ends with liquids', 'Etwa null: Die Reaktion beginnt und endet mit Flüssigkeiten') },
          { text: b('Positive: a gas forms, with far more ways to place its molecules', 'Positiv: Ein Gas entsteht, mit weit mehr Möglichkeiten, seine Moleküle anzuordnen'), correct: true },
          { text: b('Negative: the reaction gives out energy, so less of everything is left', 'Negativ: Die Reaktion gibt Energie ab, also bleibt von allem weniger übrig') },
        ],
        explain: b('ΔS is positive, +126.0 J/(mol·K): a mole of oxygen gas forms from liquid, and gas molecules can be placed and can share out their energy in far more ways. Smaller molecules are not "tidier", and ΔH (−196.1 kJ/mol) is a separate question from ΔS.',
          'ΔS ist positiv, +126,0 J/(mol·K): Aus Flüssigkeit entsteht ein Mol Sauerstoffgas, und Gasmoleküle lassen sich auf weit mehr Arten anordnen und ihre Energie verteilen. Kleinere Moleküle sind nicht „ordentlicher“, und ΔH (−196,1 kJ/mol) ist eine andere Frage als ΔS.'),
      } as ChoiceItem,
      show: { engine: 'box', sub: 'H2O', temp: 20, compare: 'Ar' },
      revealText: b('ΔS = 2 × 70.0 + 205.2 − 2 × 109.6 = +126.0 J/(mol·K), from the standard entropies S°. The oxygen that forms is a gas, and its molecules move through the whole space instead of staying in a liquid: far more ways. The picture shows liquid water beside a gas at 20 °C; argon stands in for the oxygen.',
        'ΔS = 2 · 70,0 + 205,2 − 2 · 109,6 = +126,0 J/(mol·K), aus den Standardentropien S°. Der entstehende Sauerstoff ist ein Gas, und seine Moleküle bewegen sich durch den ganzen Raum, statt in einer Flüssigkeit zu bleiben: weit mehr Möglichkeiten. Das Bild zeigt flüssiges Wasser neben einem Gas bei 20 °C; Argon steht für den Sauerstoff.'),
      extra: {
        title: b('Look for the gas', 'Such das Gas'),
        steps: [
          b('Left side: only liquid, 2 H₂O₂(l). Right side: liquid water and one mole of oxygen gas, O₂(g).', 'Linke Seite: nur Flüssigkeit, 2 H₂O₂(l). Rechte Seite: flüssiges Wasser und ein Mol Sauerstoffgas, O₂(g).'),
          b('A gas has far more ways to place and move its molecules than a liquid: S° of O₂(g) is 205.2 J/(mol·K), of liquid water 70.0.', 'Ein Gas hat weit mehr Möglichkeiten, seine Moleküle anzuordnen und zu bewegen, als eine Flüssigkeit: S° von O₂(g) ist 205,2 J/(mol·K), von flüssigem Wasser 70,0.'),
          b('Moles of gas: 0 before, 1 after. More gas in the products means ΔS > 0.', 'Mol Gas: vorher 0, nachher 1. Mehr Gas in den Produkten bedeutet ΔS > 0.'),
          b('Answer: ΔS is positive (+126.0 J/(mol·K)), because a gas forms from a liquid.', 'Antwort: ΔS ist positiv (+126,0 J/(mol·K)), weil aus einer Flüssigkeit ein Gas entsteht.'),
        ],
      },
    },
    {
      item: {
        id: 'u19-four', unit: 19, kind: 'choice', format: 'predict', withConfidence: true, evidence: 'predict',
        concepts: ['u19.ways', 'u19.probable'], targets: ['particles-want-space'],
        prompt: b('Six particles, A to F, move at random in a box with two halves. Each can be left or right: 64 arrangements in all, each equally likely. How many of them have three particles on each side, and what is the chance that all six are on the left at a given moment?',
          'Sechs Teilchen, A bis F, bewegen sich zufällig in einer Box mit zwei Hälften. Jedes kann links oder rechts sein: insgesamt 64 Anordnungen, jede gleich wahrscheinlich. Wie viele davon haben drei Teilchen auf jeder Seite, und wie groß ist die Wahrscheinlichkeit, dass in einem Moment alle sechs links sind?'),
        options: [
          { text: b('1 arrangement; all six on the left: 1 in 7', '1 Anordnung; alle sechs links: 1 zu 7') },
          { text: b('20 arrangements; all six on the left: 1 in 64', '20 Anordnungen; alle sechs links: 1 zu 64'), correct: true },
          { text: b('6 arrangements; all six on the left: 1 in 6', '6 Anordnungen; alle sechs links: 1 zu 6') },
          { text: b('20 arrangements; all six on the left: never, each needs its room', '20 Anordnungen; alle sechs links: nie, jedes braucht seinen Platz'), mis: 'particles-want-space' },
        ],
        explain: b('Twenty of the 64 have three on each side: choose which three are on the left, 6 × 5 × 4 ÷ (3 × 2 × 1) = 20. All six on the left is a single arrangement, so 1 in 64; it does happen, only rarely, as the box showed for four particles. "1 in 7" counts the seven splits (6, 5, 4, 3, 2, 1 or 0 on the left), but those are not equally likely.',
          'Zwanzig der 64 haben drei auf jeder Seite: Wähle, welche drei links sind, 6 · 5 · 4 : (3 · 2 · 1) = 20. Alle sechs links ist eine einzige Anordnung, also 1 zu 64; das kommt vor, nur selten, wie die Box bei vier Teilchen gezeigt hat. „1 zu 7“ zählt die sieben Aufteilungen (6, 5, 4, 3, 2, 1 oder 0 links), aber die sind nicht gleich wahrscheinlich.'),
      } as ChoiceItem,
      show: { engine: 'box', sub: 'Ar', spread: { n: 10, open: true } },
      revealText: b('Twenty, and 1 in 64. Three on each side is twenty times as likely as all six on the left, and the gap grows fast with more particles: for 100, all on the left has a chance of 1 in 1.27 · 10³⁰. The picture shows ten argon atoms spreading once the partition is gone.',
        'Zwanzig, und 1 zu 64. Drei auf jeder Seite ist zwanzigmal so wahrscheinlich wie alle sechs links, und der Abstand wächst mit mehr Teilchen schnell: Bei 100 Teilchen ist die Wahrscheinlichkeit für alle links 1 zu 1,27 · 10³⁰. Das Bild zeigt zehn Argonatome, die sich ohne Trennwand verteilen.'),
      extra: {
        title: b('Count them with letters', 'Zähl mit Buchstaben'),
        steps: [
          b('Each particle is left or right: 2 × 2 × 2 × 2 × 2 × 2 = 64 arrangements.', 'Jedes Teilchen ist links oder rechts: 2 · 2 · 2 · 2 · 2 · 2 = 64 Anordnungen.'),
          b('All six on the left: only ABCDEF on the left, 1 arrangement, so a chance of 1 in 64.', 'Alle sechs links: nur ABCDEF links, 1 Anordnung, also eine Wahrscheinlichkeit von 1 zu 64.'),
          b('Three on each side: choose the three on the left. 6 choices for the first, 5 for the second, 4 for the third, divided by 3 × 2 × 1 because the order does not matter: 20.', 'Drei auf jeder Seite: Wähle die drei, die links sind. 6 Möglichkeiten für das erste, 5 für das zweite, 4 für das dritte, geteilt durch 3 · 2 · 1, weil die Reihenfolge egal ist: 20.'),
          b('Answer: 20 of the 64 arrangements have three on each side; the chance that all six are on the left at a given moment is 1 in 64.', 'Antwort: 20 der 64 Anordnungen haben drei auf jeder Seite; die Wahrscheinlichkeit, dass in einem Moment alle sechs links sind, ist 1 zu 64.'),
        ],
      },
    },
  ],

  examples: [
    {
      title: b('Water evaporates', 'Wasser verdampft'), tag: 'H2O',
      show: { engine: 'box', sub: 'H2O', temp: 100 },
      numbers: [
        { v: '70.0 J/(mol·K)', label: b('standard entropy S° of liquid water at 25 °C', 'Standardentropie S° von flüssigem Wasser bei 25 °C') },
        { v: '188.8 J/(mol·K)', label: b('standard entropy S° of water vapour at 25 °C', 'Standardentropie S° von Wasserdampf bei 25 °C') },
        { v: '+118.8 J/(mol·K)', label: b('ΔS when one mole of water evaporates', 'ΔS, wenn ein Mol Wasser verdampft') },
      ],
      body: b('The standard entropy S° is measured at 25 °C and 1 bar, in joules per kelvin for each mole. In the vapour the molecules move freely through the whole space instead of jostling in a liquid, so there are far more ways to place them and share out their energy: S more than doubles. The rule for any substance: S(gas) > S(liquid) > S(solid).',
        'Die Standardentropie S° wird bei 25 °C und 1 bar gemessen, in Joule pro Kelvin und Mol. Im Dampf bewegen sich die Moleküle frei durch den ganzen Raum, statt sich in einer Flüssigkeit zu drängen, also gibt es weit mehr Möglichkeiten, sie anzuordnen und ihre Energie zu verteilen: S wird mehr als doppelt so groß. Die Regel für jeden Stoff: S(Gas) > S(Flüssigkeit) > S(Feststoff).'),
      soWhat: b('Evaporating takes in 44.0 kJ/mol, which is why sweat cools your skin. The rise in entropy is why water evaporates at all, far below its boiling point; spread thinly through the air, the vapour has even more ways than the table value counts.',
        'Verdampfen nimmt 44,0 kJ/mol auf, deshalb kühlt Schweiß deine Haut. Der Anstieg der Entropie ist der Grund, warum Wasser weit unter seiner Siedetemperatur überhaupt verdunstet; dünn in der Luft verteilt hat der Dampf sogar noch mehr Möglichkeiten, als der Tabellenwert angibt.'),
    },
    {
      title: b('Making ammonia', 'Ammoniak herstellen'), tag: 'NH3',
      show: { engine: 'box', sub: 'NH3', temp: 25 },
      numbers: [
        { v: '4 mol', label: b('of gas before: N₂ + 3 H₂', 'Gas vorher: N₂ + 3 H₂') },
        { v: '2 mol', label: b('of gas after: 2 NH₃', 'Gas nachher: 2 NH₃') },
        { v: '−198.1 J/(mol·K)', label: b('ΔS for N₂ + 3 H₂ → 2 NH₃', 'ΔS für N₂ + 3 H₂ → 2 NH₃') },
      ],
      body: b('Four moles of gas molecules become two. Fewer gas particles have fewer ways to be placed and to share out their energy, so the entropy falls: ΔS = 2 × 192.8 − (191.6 + 3 × 130.7) = −198.1 J/(mol·K). The rule of thumb: count the moles of gas on each side; more gas in the products usually means ΔS > 0, less gas means ΔS < 0.',
        'Aus vier Mol Gasmolekülen werden zwei. Weniger Gasteilchen haben weniger Möglichkeiten, sich anzuordnen und ihre Energie zu verteilen, also sinkt die Entropie: ΔS = 2 · 192,8 − (191,6 + 3 · 130,7) = −198,1 J/(mol·K). Die Faustregel: Vergleiche die Stoffmenge an Gas auf beiden Seiten; mehr Gas in den Produkten bedeutet meist ΔS > 0, weniger Gas ΔS < 0.'),
      soWhat: b('The reaction can still run by itself at room temperature: it gives out 91.8 kJ/mol, and that heat raises the entropy of the surroundings by about 91 800 ÷ 298 = 308 J/(mol·K), more than the gases lose. Unit 20 turns this sum into ΔG.',
        'Die Reaktion kann bei Raumtemperatur trotzdem von selbst ablaufen: Sie gibt 91,8 kJ/mol ab, und diese Wärme erhöht die Entropie der Umgebung um etwa 91 800 : 298 = 308 J/(mol·K), mehr als die Gase verlieren. Einheit 20 macht aus dieser Rechnung ΔG.'),
    },
    {
      title: b('Where the model breaks: “entropy is disorder”', 'Wo das Modell an Grenzen stößt: „Entropie ist Unordnung“'), tag: 'S',
      show: { engine: 'box', sub: 'H2O', temp: -10 },
      numbers: [
        { v: '−22.0 J/(mol·K)', label: b('for one mole of water as it freezes into ordered ice', 'für ein Mol Wasser, das zu geordnetem Eis gefriert') },
        { v: '+22.8 J/(mol·K)', label: b('for the surroundings at −10 °C: 6010 J ÷ 263 K', 'für die Umgebung bei −10 °C: 6010 J : 263 K') },
        { v: '+0.8 J/(mol·K)', label: b('in all: the total rises, so freezing runs by itself', 'insgesamt: Die Summe steigt, also läuft das Gefrieren von selbst ab') },
      ],
      body: b('Entropy counts ways, not visible mess. A shuffled pack of cards or an untidy room has no measurably higher thermodynamic entropy than a tidy one: moving a few large objects does not change how the energy of about 10²³ particles can be shared out. Water freezing at −10 °C turns into ordered ice and still runs by itself, because the 6.01 kJ/mol it gives off raises the entropy of the surroundings by slightly more than the water loses (taking ΔH and ΔS as constant below 0 °C: a model).',
        'Entropie erfasst Möglichkeiten, nicht sichtbares Durcheinander. Ein gemischtes Kartenspiel oder ein unaufgeräumtes Zimmer hat keine messbar höhere Entropie als ein ordentliches: Ein paar große Gegenstände zu verschieben ändert nichts daran, wie sich die Energie von etwa 10²³ Teilchen verteilen lässt. Wasser, das bei −10 °C zu geordnetem Eis gefriert, läuft trotzdem von selbst ab, weil die abgegebenen 6,01 kJ/mol die Entropie der Umgebung etwas stärker erhöhen, als die des Wassers sinkt (ΔH und ΔS unter 0 °C als konstant angenommen: ein Modell).'),
      soWhat: b('Many books call entropy a measure of disorder. In an exam you may write that, but add “the number of ways the particles and their energy can be arranged”: disorder you can see says nothing about energy, and it cannot explain why water freezes by itself below 0 °C.',
        'Viele Bücher nennen die Entropie ein „Maß der Unordnung“. In der Klausur darfst du das schreiben, aber ergänze „die Zahl der Möglichkeiten, die Teilchen und ihre Energie anzuordnen“: Sichtbare Unordnung sagt nichts über die Energie und erklärt nicht, warum Wasser unter 0 °C von selbst gefriert.'),
    },
  ],

  flaw: {
    id: 'u19-flaw', unit: 19, kind: 'flaw', format: 'flaw', evidence: 'transfer', concepts: ['u19.probable'], targets: ['particles-want-space'],
    prompt: b('Where does this reasoning first go wrong?', 'Wo geht diese Überlegung zum ersten Mal schief?'),
    lines: [
      b('A perfume bottle is opened in one corner of a closed room. Soon the scent is about the same everywhere in the room.', 'In einer Ecke eines geschlossenen Raums wird eine Parfümflasche geöffnet. Bald riecht es überall im Raum etwa gleich stark.'),
      b('However long you wait, the scent never gathers back in that corner by itself.', 'Wie lange man auch wartet, der Duft sammelt sich nie von selbst wieder in dieser Ecke.'),
      b('So the perfume molecules must push each other apart, or seek out the emptier parts of the room.', 'Also müssen sich die Parfümmoleküle gegenseitig wegdrücken oder die leereren Teile des Raums aufsuchen.'),
    ],
    flaw: 2,
    near: [{ step: 1, note: b('This one is true in practice: gathering back is not forbidden, only so improbable that it never happens. Ask what that tells you about why the scent spread.', 'Dieser Schritt stimmt in der Praxis: Zurückkehren ist nicht verboten, nur so unwahrscheinlich, dass es nie passiert. Frag dich, was das darüber sagt, warum sich der Duft verteilt hat.') }],
    explain: b('Step 3 is the first wrong step. Steps 1 and 2 are what you observe, and both are true. Step 3 is wrong: nothing pushes the molecules towards empty space; each moves at random, and arrangements spread through the whole room vastly outnumber those gathered in one corner, so spreading is overwhelmingly likely and gathering back never happens in practice.',
      'Schritt 3 ist der erste falsche Schritt. Die Schritte 1 und 2 beschreiben, was man beobachtet, und beide stimmen. Schritt 3 ist falsch: Nichts drückt die Moleküle in leeren Raum; jedes bewegt sich zufällig, und Anordnungen, die über den ganzen Raum verteilt sind, sind gegenüber denen in einer Ecke weit in der Überzahl. Deshalb ist Ausbreiten überwältigend wahrscheinlich, und Zurückkehren passiert praktisch nie.'),
  } as FlawItem,

  deeper: {
    id: 'u19-deeper', unit: 19, kind: 'estimate', format: 'estimate', evidence: 'transfer', concepts: ['u19.gas-moles', 'u19.states'],
    prompt: b('Hydrogen burns to liquid water: 2 H₂(g) + O₂(g) → 2 H₂O(l). Standard entropies S° in J/(mol·K): H₂(g) 130.7, O₂(g) 205.2, H₂O(l) 70.0. Find ΔS for the reaction as written.',
      'Wasserstoff verbrennt zu flüssigem Wasser: 2 H₂(g) + O₂(g) → 2 H₂O(l). Standardentropien S° in J/(mol·K): H₂(g) 130,7, O₂(g) 205,2, H₂O(l) 70,0. Bestimme ΔS für die Reaktion, wie sie dasteht.'),
    min: -800, max: 800, step: 1, answer: -327, tolerance: 3, suffix: ' J/(mol·K)',
    near: [
      { value: 327, tol: 3, note: b('The size is right, the sign is not: ΔS = products − reactants, and three moles of gas turn into a liquid.', 'Der Betrag stimmt, das Vorzeichen nicht: ΔS = Produkte − Edukte, und aus drei Mol Gas wird eine Flüssigkeit.') },
      { value: -397, tol: 3, note: b('Two moles of water form: count 2 × 70.0.', 'Es entstehen zwei Mol Wasser: Rechne mit 2 · 70,0.') },
      { value: -196, tol: 3, note: b('Two moles of hydrogen react: count 2 × 130.7.', 'Es reagieren zwei Mol Wasserstoff: Rechne mit 2 · 130,7.') },
      { value: -266, tol: 3, note: b('Use the numbers in front of the formulas: 2 H₂ and 2 H₂O.', 'Nimm die Zahlen vor den Formeln mit: 2 H₂ und 2 H₂O.') },
    ],
    explain: b('ΔS = S°(products) − S°(reactants) = 2 × 70.0 − (2 × 130.7 + 205.2) = 140.0 − 466.6 = −326.6 J/(mol·K). Three moles of gas become a liquid, so the entropy of the reacting substances falls steeply. Hydrogen still burns by itself once lit: the 571.7 kJ/mol it gives out raises the entropy of the surroundings far more (unit 20).',
      'ΔS = S°(Produkte) − S°(Edukte) = 2 · 70,0 − (2 · 130,7 + 205,2) = 140,0 − 466,6 = −326,6 J/(mol·K). Aus drei Mol Gas wird eine Flüssigkeit, also sinkt die Entropie der reagierenden Stoffe stark. Wasserstoff verbrennt trotzdem von selbst, wenn er einmal entzündet ist: Die abgegebenen 571,7 kJ/mol erhöhen die Entropie der Umgebung viel stärker (Einheit 20).'),
  } as EstimateItem,

  explain: {
    prompt: b('In your own words: why can melting ice or a cold pack run by itself although it takes in energy, what does entropy measure, and when does it go up?',
      'In eigenen Worten: Warum kann schmelzendes Eis oder eine Kältekompresse von selbst ablaufen, obwohl dabei Energie aufgenommen wird, was misst die Entropie, und wann steigt sie?'),
    ideas: [
      { id: 'endo', concept: 'u19.not-energy', idea: b('Some processes run by themselves although they take in energy', 'Manche Vorgänge laufen von selbst ab, obwohl sie Energie aufnehmen'), contra: SPONT_EXO,
        en: any(together(RUN_EN, TAKEIN_EN, 60), CONCESSIVE_EN), de: any(together(RUN_DE, TAKEIN_DE, 60), CONCESSIVE_DE) },
      { id: 'ways', concept: 'u19.ways', idea: b('Entropy measures the number of ways the particles and their energy can be arranged', 'Die Entropie ist ein Maß für die Zahl der Möglichkeiten, die Teilchen und ihre Energie anzuordnen'), contra: MESSINESS,
        en: any(together(ENTROPY_EN, WAYS_EN, 60), BOLTZMANN), de: any(together(ENTROPY_DE, WAYS_DE, 60), BOLTZMANN) },
      { id: 'probable', concept: 'u19.probable', idea: b('Particles spread out because spread-out arrangements vastly outnumber the rest', 'Teilchen verteilen sich, weil verteilte Anordnungen weit in der Überzahl sind'), contra: WANT_SPACE,
        en: any(together(SPREAD_EN, LIKELY_EN, 80), /\b(all|every)\b.{0,30}\b(on|in) (one side|one half|the left|one corner)\b.{0,40}(unlikely|improbable|rare|one arrangement|tiny chance|almost never|practically never|1 in)/),
        de: any(together(SPREAD_DE, LIKELY_DE, 80), /(alle|sämtliche)\b.{0,30}(links|auf einer seite|in einer hälfte|in einer ecke).{0,40}(unwahrscheinlich|selten|eine anordnung|praktisch nie|fast nie|1 zu)/) },
      { id: 'states', concept: 'u19.states', idea: b('Entropy rises from solid to liquid to gas, with freedom of movement', 'Die Entropie steigt von fest über flüssig zu gasförmig, mit der Bewegungsfreiheit'),
        en: any(ORDER_EN, COMPARE_EN, together(STATEPAIR_EN, HIGHER_EN, 50),
          together(/(freedom|free to move|move\w* (more )?freely|move around)/, /(entrop\w*|\bways\b|arrangements)/, 50), together(/(freez\w*|condens\w*)/, LOWER_EN, 40)),
        de: any(ORDER_DE, COMPARE_DE, together(STATEPAIR_DE, HIGHER_DE, 50),
          together(/(bewegungsfreiheit|frei beweg\w*|freier beweg\w*|beweg\w* sich (freier|frei))/, /(entropie|möglichkeit\w*)/, 50), together(/(gefrier\w*|erstarr\w*|kondens\w*)/, LOWER_DE, 40)) },
      { id: 'gas', concept: 'u19.gas-moles', idea: b('More moles of gas in the products: ΔS is usually positive', 'Mehr Mol Gas in den Produkten: ΔS ist meist positiv'),
        en: any(together(GASMORE_EN, S_UP_EN, 60), together(FEWERGAS_EN, S_DOWN_EN, 60)),
        de: any(together(GASMORE_DE, S_UP_DE, 60), together(FEWERGAS_DE, S_DOWN_DE, 60)) },
    ] as Idea[],
    tightened: b('Some processes run by themselves although they take in energy, such as ice melting at room temperature or a cold pack dissolving. Entropy measures the number of ways the particles and their energy can be arranged. Particles spread out and gases mix because spread-out arrangements vastly outnumber the others, not because particles want room. So entropy rises from solid to liquid to gas, and a reaction that makes more moles of gas usually has a positive ΔS.',
      'Manche Vorgänge laufen von selbst ab, obwohl sie Energie aufnehmen, zum Beispiel schmelzendes Eis bei Raumtemperatur oder eine Kältekompresse. Die Entropie ist ein Maß für die Zahl der Möglichkeiten, die Teilchen und ihre Energie anzuordnen. Teilchen verteilen sich und Gase mischen sich, weil verteilte Anordnungen weit in der Überzahl sind, nicht weil die Teilchen Platz wollen. Deshalb steigt die Entropie von fest über flüssig zu gasförmig, und bei Reaktionen, bei denen mehr Mol Gas entstehen, ist ΔS meist positiv.'),
  },

  terms: ['entropy', 'spontaneous', 'endothermic', 'exothermic'],

  readings: [
    {
      lang: 'en', kind: 'quick',
      title: b('Entropy', 'Entropy'), source: 'LibreTexts, Introductory Chemistry (CK-12), section 20.1',
      url: 'https://chem.libretexts.org/Bookshelves/Introductory_Chemistry/Introductory_Chemistry_(CK-12)/20%3A_Entropy_and_Free_Energy/20.01%3A_Entropy',
      lookFor: [
        b('Its example N₂ + 3 H₂ → 2 NH₃: four molecules become two. Which way does it say the entropy goes? Compare with −198.1 J/(mol·K) in the second example.', ''),
        b('What reason does it give for dissolving raising the entropy? Compare with the cold pack in the puzzle.', ''),
        b('It explains entropy with a messy room. After the third example, what would you add so the explanation is about particles and their energy?', ''),
      ],
    },
    {
      lang: 'en', kind: 'deeper',
      title: b('Entropy', 'Entropy'), source: 'OpenStax Chemistry 2e, section 16.2',
      url: 'https://openstax.org/books/chemistry-2e/pages/16-2-entropy',
      lookFor: [
        b('Its four particles in two boxes: how many microstates, and how many put two in each box? Compare with your answer in prediction 2.', ''),
        b('It writes S = k ln W. What does W count? Compare with the “Ways to arrange” panel.', ''),
        b('Its rule S(gas) > S(liquid) > S(solid): check it with water, 70.0 against 188.8 J/(mol·K).', ''),
      ],
    },
    {
      lang: 'de', kind: 'deeper',
      title: b('Entropie', 'Entropie'), source: 'Studyflix, Physik für Schüler',
      url: 'https://studyflix.de/physik-schueler/entropie-529',
      lookFor: [
        b('', 'Was misst die Entropie laut der Seite, wenn nicht das „Durcheinander im Aussehen“? Vergleiche mit dem dritten Beispiel (Kartenspiel, gefrierendes Wasser).'),
        b('', 'Zwei Gase und eine Trennwand: Was passiert laut der Seite, wenn die Trennwand entfernt wird? Vergleiche mit Argon und Neon in der Teilchenbox.'),
        b('', 'Ihre Rechnung für N₂O₄ → 2 NO₂ ergibt ΔS° = +175,8 J/(mol·K). Passt das Vorzeichen zur Regel „mehr Mol Gas in den Produkten“?'),
      ],
    },
  ],

  misconceptions: [
    { id: 'spontaneous-exothermic', name: b('Only processes that release energy run by themselves', 'Nur exotherme Vorgänge laufen von selbst ab') },
    { id: 'entropy-messiness', name: b('Entropy is visible messiness', 'Entropie ist sichtbare Unordnung') },
    { id: 'particles-want-space', name: b('Particles spread because they want room', 'Teilchen verteilen sich, weil sie Platz wollen') },
  ],

  glossary: {
    entropy: {
      en: 'entropy', de: 'Entropie', unit: 19,
      def: { en: 'S, a measure of the number of ways the particles of a substance and their energy can be arranged, in J/(mol·K). It rises from solid to liquid to gas, and when substances mix or dissolve. Many books call it a measure of disorder.',
        de: 'S, ein Maß für die Zahl der Möglichkeiten, die Teilchen eines Stoffes und ihre Energie anzuordnen, in J/(mol·K). Sie steigt von fest über flüssig zu gasförmig und beim Mischen und Lösen. Viele Bücher nennen sie ein Maß der Unordnung.' },
    },
    spontaneous: {
      en: 'spontaneous', de: 'freiwillig (spontan)', unit: 19,
      def: { en: 'Able to run by itself, without being driven from outside. It says nothing about speed: a spontaneous reaction can be extremely slow.',
        de: 'Kann von selbst ablaufen, ohne von außen angetrieben zu werden. Über die Geschwindigkeit sagt es nichts: Eine freiwillig ablaufende Reaktion kann extrem langsam sein.' },
      falseFriend: { en: 'In everyday language “spontan” means sudden; German textbooks prefer “freiwillig” (“läuft freiwillig ab”).', de: 'Im Alltag bedeutet „spontaneous“ wie „spontan“ plötzlich; in der Chemie bedeutet es nur „kann von selbst ablaufen“.' },
    },
  },
};
