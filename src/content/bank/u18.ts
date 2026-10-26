// Review bank for unit 18 (written by the unit helper; see docs/process/authoring.md).
// Values with dH() and THERMO in thermo.ts (OpenStax Chemistry 2e, Appendix G), kJ/mol: ΔfH SO₂ −296.8, SO₃ −395.7
// (so2-so3 −197.78 for 2 SO₂, −98.9 per mole: −296.8 − 98.9 = −395.7); no2-dimer −55.3; h2-burn-l −571.66 (−285.8 per
// mole H₂); c3h8-burn −2220.05 (half: −1110.0); Fe₂O₃ −824.2; C(diamond) +1.89; diamond-burn −395.4, c-co2 −393.5;
// h2o2: ΔfH H₂O₂(l) −187.8, H₂O(l) −285.8: 2(−285.8) − 2(−187.8) = −196.0 (dH −196.1); all added −947.2; one mole each
// −98.0. Ethane burning: 2(−393.5) + 3(−285.8) + 84.0 = −1560.4 (dH from the table −1560.5); with ethane added −1728.4.
// Lattice energy from a Born–Haber cycle (unit 18 example 3; LibreTexts, Ursinus CHEM322, "Born Haber Cycles", fetched):
// lattice enthalpies cannot be measured directly. CO from carbon gives a CO/CO₂ mixture (Science Ready, "Hess's Law").
import type { Bi } from '../../i18n';
import type { Item } from '../items';

const b = (en: string, de: string): Bi => ({ en, de });

export const BANK_U18: Item[] = [
  // ---------- u18.path ----------
  { id: 'i18a', unit: 18, kind: 'choice', format: 'predict', withConfidence: true, concepts: ['u18.path'], targets: ['path-dependent'],
    prompt: b('Two burners use the same natural gas and oxygen at 25 °C. One burns the gas in one go, the other in two stages (first to CO, then on to CO₂). Both end with CO₂ and liquid water at 25 °C. What about the total ΔH?',
      'Zwei Brenner nutzen dasselbe Erdgas und Sauerstoff bei 25 °C. Der eine verbrennt das Gas auf einmal, der andere in zwei Stufen (erst zu CO, dann weiter zu CO₂). Beide enden mit CO₂ und flüssigem Wasser bei 25 °C. Was gilt für das gesamte ΔH?'),
    options: [
      { text: b('The two-stage burner gives out more, because it has more steps', 'Der Brenner mit zwei Stufen gibt mehr ab, weil er mehr Schritte hat'), mis: 'path-dependent' },
      { text: b('Both give out the same: same start, same end', 'Beide geben gleich viel ab: gleicher Anfang, gleiches Ende'), correct: true },
      { text: b('The one-stage burner gives out more, because it burns faster', 'Der Brenner mit einer Stufe gibt mehr ab, weil er schneller verbrennt') },
      { text: b('They cannot be compared without measuring both routes', 'Ohne beide Wege zu messen, lassen sie sich nicht vergleichen'), mis: 'path-dependent' },
    ],
    explain: b('ΔH depends only on the start and the end. Both burners start with the same gas and oxygen and end with the same products at the same temperature, so the total ΔH is the same; the steps in between only share it out differently.',
      'ΔH hängt nur von Anfang und Ende ab. Beide Brenner beginnen mit demselben Gas und Sauerstoff und enden mit denselben Produkten bei derselben Temperatur, also ist das gesamte ΔH gleich; die Zwischenschritte teilen es nur anders auf.') },
  { id: 'i18b', unit: 18, kind: 'choice', format: 'why', evidence: 'explain', withConfidence: true, concepts: ['u18.path'], targets: ['path-dependent'],
    prompt: b('Why must every route from the same reactants to the same products have the same ΔH?', 'Warum muss jeder Weg von denselben Edukten zu denselben Produkten dasselbe ΔH haben?'),
    options: [
      { text: b('Longer routes lose energy, and chemists correct for that', 'Längere Wege verlieren Energie, und das wird herausgerechnet'), mis: 'path-dependent' },
      { text: b('Every route needs the same number of steps', 'Jeder Weg braucht gleich viele Schritte') },
      { text: b('Enthalpy depends only on the state, so the gap between two states is fixed', 'Die Enthalpie hängt nur vom Zustand ab, also ist der Abstand zwischen zwei Zuständen fest'), correct: true },
      { text: b('All routes have the same bonds breaking in the same order', 'Auf allen Wegen werden dieselben Bindungen in derselben Reihenfolge gespalten') },
    ],
    explain: b('Enthalpy is a state function: each state has its own value, like the height of a place. The difference between start and end is therefore fixed, however many steps lie between, just as the height you climb from a village to a hut does not depend on the path.',
      'Die Enthalpie ist eine Zustandsgröße: Jeder Zustand hat seinen eigenen Wert, wie die Höhe eines Ortes. Der Unterschied zwischen Anfang und Ende ist deshalb fest, egal wie viele Schritte dazwischen liegen, so wie die Höhe, die man von einem Dorf zu einer Hütte aufsteigt, nicht vom Weg abhängt.') },
  { id: 'i18c', unit: 18, kind: 'choice', format: 'predict', evidence: 'transfer', withConfidence: true, concepts: ['u18.path'],
    prompt: b('Sulfur burns to SO₂ (ΔH = −296.8 kJ/mol), and SO₂ goes on to SO₃ (ΔH = −98.9 kJ per mole of SO₂). What is ΔH for S + 1½ O₂ → SO₃ in one go?',
      'Schwefel verbrennt zu SO₂ (ΔH = −296,8 kJ/mol), und SO₂ reagiert weiter zu SO₃ (ΔH = −98,9 kJ pro Mol SO₂). Wie groß ist ΔH für S + 1½ O₂ → SO₃ in einem Schritt?'),
    options: [
      { text: b('−197.9 kJ/mol', '−197,9 kJ/mol') },
      { text: b('−395.7 kJ/mol', '−395,7 kJ/mol'), correct: true },
      { text: b('−98.9 kJ/mol', '−98,9 kJ/mol') },
      { text: b('+395.7 kJ/mol', '+395,7 kJ/mol') },
    ],
    explain: b('The two steps lead from the same start to the same end as the direct reaction, so their ΔH values add up: −296.8 + (−98.9) = −395.7 kJ/mol, the enthalpy of formation of SO₃. −197.9 subtracts instead of adding.',
      'Die beiden Schritte führen vom selben Anfang zum selben Ende wie die direkte Reaktion, also addieren sich ihre ΔH-Werte: −296,8 + (−98,9) = −395,7 kJ/mol, die Standardbildungsenthalpie von SO₃. −197,9 subtrahiert, statt zu addieren.') },

  // ---------- u18.reverse ----------
  { id: 'i18d', unit: 18, kind: 'choice', format: 'predict', withConfidence: true, concepts: ['u18.reverse'], targets: ['reverse-keeps-sign'],
    prompt: b('Brown NO₂ pairs up: 2 NO₂ → N₂O₄, ΔH = −55.3 kJ/mol. What is ΔH when N₂O₄ falls apart into 2 NO₂?', 'Braunes NO₂ verbindet sich: 2 NO₂ → N₂O₄, ΔH = −55,3 kJ/mol. Wie groß ist ΔH, wenn N₂O₄ in 2 NO₂ zerfällt?'),
    options: [
      { text: b('+55.3 kJ/mol', '+55,3 kJ/mol'), correct: true },
      { text: b('−55.3 kJ/mol', '−55,3 kJ/mol'), mis: 'reverse-keeps-sign' },
      { text: b('+27.7 kJ/mol', '+27,7 kJ/mol') },
      { text: b('−110.6 kJ/mol', '−110,6 kJ/mol') },
    ],
    explain: b('The reverse reaction goes from the same products back to the same reactants, so it has the same size of ΔH with the opposite sign: +55.3 kJ/mol. Pulling N₂O₄ apart takes in what forming it gave out.',
      'Die Rückreaktion führt von denselben Produkten zurück zu denselben Edukten, also hat ihr ΔH denselben Betrag mit umgekehrtem Vorzeichen: +55,3 kJ/mol. N₂O₄ zu spalten nimmt auf, was seine Bildung abgegeben hat.') },
  { id: 'i18e', unit: 18, kind: 'choice', format: 'why', evidence: 'explain', withConfidence: true, concepts: ['u18.reverse'], targets: ['reverse-keeps-sign'],
    prompt: b('Why does reversing a reaction flip the sign of ΔH but keep its size?', 'Warum wechselt beim Umkehren einer Reaktion das Vorzeichen von ΔH, während der Betrag gleich bleibt?'),
    options: [
      { text: b('It does not: a reaction gives out energy whichever way it runs', 'Tut es nicht: Eine Reaktion gibt in jeder Richtung Energie ab'), mis: 'reverse-keeps-sign' },
      { text: b('Start and end swap, so the same energy gap is crossed the other way', 'Anfang und Ende tauschen, also wird derselbe Energieabstand in die andere Richtung überwunden'), correct: true },
      { text: b('Reversed reactions are always endothermic, whatever the reaction', 'Rückreaktionen sind immer endotherm, egal um welche Reaktion es geht') },
      { text: b('The bonds are weaker in the reverse direction', 'Die Bindungen sind in der Rückrichtung schwächer') },
    ],
    explain: b('Products and reactants each sit at their own enthalpy. Going back crosses the same gap in the opposite direction: down becomes up, so −283.0 becomes +283.0. A reversed reaction is endothermic only if the forward one was exothermic.',
      'Produkte und Edukte haben jeweils ihre eigene Enthalpie. Der Rückweg überwindet denselben Abstand in die Gegenrichtung: Aus abwärts wird aufwärts, aus −283,0 wird +283,0. Eine Rückreaktion ist nur dann endotherm, wenn die Hinreaktion exotherm war.') },
  { id: 'i18f', unit: 18, kind: 'choice', format: 'predict', evidence: 'transfer', withConfidence: true, concepts: ['u18.reverse'], targets: ['reverse-keeps-sign'],
    prompt: b('Hydrogen burns: 2 H₂ + O₂ → 2 H₂O(l), ΔH = −571.7 kJ/mol. An electrolyser splits water back: 2 H₂O(l) → 2 H₂ + O₂. What is ΔH for the splitting?',
      'Wasserstoff verbrennt: 2 H₂ + O₂ → 2 H₂O(l), ΔH = −571,7 kJ/mol. Ein Elektrolyseur spaltet Wasser zurück: 2 H₂O(l) → 2 H₂ + O₂. Wie groß ist ΔH für die Spaltung?'),
    options: [
      { text: b('−571.7 kJ/mol', '−571,7 kJ/mol'), mis: 'reverse-keeps-sign' },
      { text: b('+285.8 kJ/mol', '+285,8 kJ/mol') },
      { text: b('0, since H₂ and O₂ are elements', '0, weil H₂ und O₂ Elemente sind') },
      { text: b('+571.7 kJ/mol', '+571,7 kJ/mol'), correct: true },
    ],
    explain: b('Splitting water is burning hydrogen reversed, for the same 2 mol: ΔH = +571.7 kJ/mol, energy that has to be put in. +285.8 would be for one mole of water; elements count zero in enthalpies of formation, but water is not an element.',
      'Wasser zu spalten ist die umgekehrte Verbrennung von Wasserstoff, für dieselben 2 mol: ΔH = +571,7 kJ/mol, Energie, die man hineinstecken muss. +285,8 gälte für ein Mol Wasser; Elemente haben die Standardbildungsenthalpie null, aber Wasser ist kein Element.') },

  // ---------- u18.scale ----------
  { id: 'i18g', unit: 18, kind: 'choice', format: 'predict', withConfidence: true, concepts: ['u18.scale'],
    prompt: b('H₂ + ½ O₂ → H₂O(l) has ΔH = −285.8 kJ/mol. What is ΔH for 2 H₂ + O₂ → 2 H₂O(l)?', 'H₂ + ½ O₂ → H₂O(l) hat ΔH = −285,8 kJ/mol. Wie groß ist ΔH für 2 H₂ + O₂ → 2 H₂O(l)?'),
    options: [
      { text: b('−285.8 kJ/mol', '−285,8 kJ/mol') },
      { text: b('−142.9 kJ/mol', '−142,9 kJ/mol') },
      { text: b('−571.7 kJ/mol', '−571,7 kJ/mol'), correct: true },
      { text: b('+571.7 kJ/mol', '+571,7 kJ/mol') },
    ],
    explain: b('Every amount in the equation doubles, so twice as much hydrogen burns and twice the energy is given out: 2 × (−285.8) = −571.7 kJ/mol (from unrounded values). ΔH belongs to the equation as written.',
      'Jede Stoffmenge in der Gleichung verdoppelt sich, also verbrennt doppelt so viel Wasserstoff, und es wird doppelt so viel Energie frei: 2 · (−285,8) = −571,7 kJ/mol (aus ungerundeten Werten). ΔH gilt für die Gleichung, wie sie dasteht.') },
  { id: 'i18h', unit: 18, kind: 'choice', format: 'why', evidence: 'explain', withConfidence: true, concepts: ['u18.scale'],
    prompt: b('Why does ΔH double when you double every coefficient in an equation?', 'Warum verdoppelt sich ΔH, wenn man alle Koeffizienten einer Gleichung verdoppelt?'),
    options: [
      { text: b('Doubling makes each bond twice as strong', 'Durch das Verdoppeln wird jede Bindung doppelt so stark') },
      { text: b('Twice the amount reacts, so twice the energy is exchanged', 'Die doppelte Stoffmenge reagiert, also wird doppelt so viel Energie ausgetauscht'), correct: true },
      { text: b('ΔH is a fixed property of the substances, so it stays the same', 'ΔH ist eine feste Eigenschaft der Stoffe und bleibt deshalb gleich') },
      { text: b('Only the products are doubled, and they give out the energy', 'Nur die Produkte werden verdoppelt, und sie geben die Energie ab') },
    ],
    explain: b('ΔH is given per mole of the reaction as written. Doubling the equation means twice as many moles of every substance react, so twice as many bonds break and form and the energy exchanged doubles; the bonds themselves do not change.',
      'ΔH gilt pro Mol Formelumsatz der Gleichung, wie sie dasteht. Verdoppelt man die Gleichung, reagieren von jedem Stoff doppelt so viele Mol, also werden doppelt so viele Bindungen gespalten und geknüpft, und die ausgetauschte Energie verdoppelt sich; die Bindungen selbst ändern sich nicht.') },
  { id: 'i18i', unit: 18, kind: 'estimate', format: 'estimate', evidence: 'transfer', concepts: ['u18.scale'],
    prompt: b('Propane burns: C₃H₈ + 5 O₂ → 3 CO₂ + 4 H₂O(l), ΔH = −2220 kJ/mol. A camping stove burns 0.5 mol of propane (22 g). How much energy is given out?',
      'Propan verbrennt: C₃H₈ + 5 O₂ → 3 CO₂ + 4 H₂O(l), ΔH = −2220 kJ/mol. Ein Campingkocher verbrennt 0,5 mol Propan (22 g). Wie viel Energie wird abgegeben?'),
    min: 0, max: 5000, step: 10, answer: 1110, tolerance: 10, suffix: ' kJ',
    near: [
      { value: 2220, tol: 10, note: b('That is for one mole of propane. Half a mole reacts, so half the energy is given out.', 'Das gilt für ein Mol Propan. Es reagiert ein halbes Mol, also wird die Hälfte der Energie frei.') },
      { value: 4440, tol: 10, note: b('Halve, do not double: 0.5 mol is half the amount in the equation.', 'Halbieren, nicht verdoppeln: 0,5 mol ist die Hälfte der Stoffmenge in der Gleichung.') },
    ],
    explain: b('Half the amount of the equation reacts, so ΔH halves too: 0.5 × 2220 = 1110 kJ given out.',
      'Es reagiert die Hälfte der Stoffmenge der Gleichung, also halbiert sich auch ΔH: 0,5 · 2220 = 1110 kJ werden frei.') },

  // ---------- u18.formation ----------
  { id: 'i18j', unit: 18, kind: 'choice', format: 'predict', withConfidence: true, concepts: ['u18.formation'], targets: ['elements-nonzero'],
    prompt: b('Iron(III) oxide forms from its elements: 2 Fe + 1½ O₂ → Fe₂O₃, ΔH = −824.2 kJ/mol. What does this number tell you?', 'Eisen(III)-oxid bildet sich aus den Elementen: 2 Fe + 1½ O₂ → Fe₂O₃, ΔH = −824,2 kJ/mol. Was gibt diese Zahl an?'),
    options: [
      { text: b('It must still be corrected for the energy of the O=O bonds in O₂', 'Sie muss noch um die Energie der O=O-Bindungen in O₂ korrigiert werden'), mis: 'elements-nonzero' },
      { text: b('It is the enthalpy of formation of Fe₂O₃; iron and O₂ count zero', 'Sie ist die Standardbildungsenthalpie von Fe₂O₃; Eisen und O₂ haben den Wert null'), correct: true },
      { text: b('It is the energy stored in Fe₂O₃, set free when it burns', 'Sie ist die in Fe₂O₃ gespeicherte Energie, die beim Verbrennen frei wird') },
      { text: b('It is the energy per mole of iron atoms', 'Sie ist die Energie pro Mol Eisenatome') },
    ],
    explain: b('A reaction that makes one mole of a compound from its elements in their standard states has the compound\'s enthalpy of formation as its ΔH. The elements are the zero level, so there is nothing to correct: the O=O bond energy is already inside the measured value. The value is per mole of Fe₂O₃, not per mole of iron.',
      'Eine Reaktion, die ein Mol einer Verbindung aus den Elementen im Standardzustand bildet, hat als ΔH die Standardbildungsenthalpie der Verbindung. Die Elemente sind der Nullpunkt, also gibt es nichts zu korrigieren: Die O=O-Bindungsenthalpie steckt schon im Messwert. Der Wert gilt pro Mol Fe₂O₃, nicht pro Mol Eisen.') },
  { id: 'i18k', unit: 18, kind: 'choice', format: 'why', evidence: 'explain', withConfidence: true, concepts: ['u18.formation'], targets: ['elements-nonzero'],
    prompt: b('Why do elements in their standard state have an enthalpy of formation of zero?', 'Warum haben Elemente im Standardzustand die Standardbildungsenthalpie null?'),
    options: [
      { text: b('Elements hold no energy at all', 'Elemente enthalten überhaupt keine Energie') },
      { text: b('Elements cannot react, so their enthalpy never changes', 'Elemente können nicht reagieren, also ändert sich ihre Enthalpie nie') },
      { text: b('O₂ really has the value of its bond energy, but tables leave it out', 'O₂ hat eigentlich den Wert seiner Bindungsenthalpie, aber Tabellen lassen ihn weg'), mis: 'elements-nonzero' },
      { text: b('Only differences can be measured, so the elements are chosen as the zero level', 'Messen kann man nur Unterschiede, also wählt man die Elemente als Nullpunkt'), correct: true },
    ],
    explain: b('Enthalpy has no absolute zero; only changes can be measured. Chemists choose the elements in their standard state as the zero level, as maps choose sea level for heights. Making an element from itself changes nothing, so its value is exactly zero, not a number left out.',
      'Die Enthalpie hat keinen absoluten Nullpunkt; messen kann man nur Änderungen. Als Nullpunkt wählt man die Elemente im Standardzustand, so wie Landkarten den Meeresspiegel für Höhen wählen. Ein Element aus sich selbst zu bilden, ändert nichts, also ist sein Wert genau null und nicht nur weggelassen.') },
  { id: 'i18l', unit: 18, kind: 'choice', format: 'predict', evidence: 'transfer', withConfidence: true, concepts: ['u18.formation'], targets: ['elements-nonzero'],
    prompt: b('Diamond is pure carbon, yet its enthalpy of formation is +1.9 kJ/mol, not zero. Why?', 'Diamant ist reiner Kohlenstoff, trotzdem ist seine Standardbildungsenthalpie +1,9 kJ/mol und nicht null. Warum?'),
    options: [
      { text: b('Every element has a value; graphite\'s is just very small', 'Jedes Element hat einen Wert; der von Graphit ist nur sehr klein'), mis: 'elements-nonzero' },
      { text: b('The standard state of carbon is graphite, and diamond sits above it', 'Der Standardzustand von Kohlenstoff ist Graphit, und Diamant liegt darüber'), correct: true },
      { text: b('Diamonds always contain some impurities', 'Diamanten enthalten immer etwas Verunreinigungen') },
      { text: b('Diamond is harder, and hardness costs energy', 'Diamant ist härter, und Härte kostet Energie') },
    ],
    explain: b('Zero belongs to each element in its standard state, the form that is most stable at 25 °C and 1 bar: for carbon that is graphite. Diamond is another form of the same element and lies 1.9 kJ/mol higher, as the two combustion values show (−395.4 against −393.5).',
      'Null gilt für jedes Element in seinem Standardzustand, der bei 25 °C und 1 bar stabilsten Form: Bei Kohlenstoff ist das Graphit. Diamant ist eine andere Form desselben Elements und liegt 1,9 kJ/mol höher, wie die beiden Verbrennungswerte zeigen (−395,4 gegenüber −393,5).') },

  // ---------- u18.products-reactants ----------
  { id: 'i18m', unit: 18, kind: 'choice', format: 'predict', withConfidence: true, concepts: ['u18.products-reactants'], targets: ['reverse-keeps-sign'],
    prompt: b('Hydrogen peroxide decomposes: 2 H₂O₂(l) → 2 H₂O(l) + O₂. Standard enthalpies of formation: H₂O₂(l) −187.8, H₂O(l) −285.8 kJ/mol. What is ΔH?',
      'Wasserstoffperoxid zerfällt: 2 H₂O₂(l) → 2 H₂O(l) + O₂. Standardbildungsenthalpien: H₂O₂(l) −187,8, H₂O(l) −285,8 kJ/mol. Wie groß ist ΔH?'),
    options: [
      { text: b('+196.0 kJ/mol', '+196,0 kJ/mol') },
      { text: b('−947.2 kJ/mol', '−947,2 kJ/mol'), mis: 'reverse-keeps-sign' },
      { text: b('−196.0 kJ/mol', '−196,0 kJ/mol'), correct: true },
      { text: b('−98.0 kJ/mol', '−98,0 kJ/mol') },
    ],
    explain: b('Δ_{r}H = products − reactants = 2 × (−285.8) + 0 − 2 × (−187.8) = −571.6 + 375.6 = −196.0 kJ/mol; O₂ counts zero. −947.2 adds the reactants instead of subtracting them, −98.0 forgets the factor 2, and +196.0 subtracts the wrong way round.',
      'Δ_{r}H = Produkte − Edukte = 2 · (−285,8) + 0 − 2 · (−187,8) = −571,6 + 375,6 = −196,0 kJ/mol; O₂ hat den Wert null. −947,2 addiert die Edukte, statt sie abzuziehen, −98,0 vergisst den Faktor 2, und +196,0 subtrahiert in der falschen Reihenfolge.') },
  { id: 'i18n', unit: 18, kind: 'choice', format: 'why', evidence: 'explain', withConfidence: true, concepts: ['u18.products-reactants'],
    prompt: b('Why does Δ_{r}H = sum of Δ_{f}H of the products − sum of Δ_{f}H of the reactants work?', 'Warum gilt Δ_{r}H = Summe der Δ_{f}H der Produkte − Summe der Δ_{f}H der Edukte?'),
    options: [
      { text: b('Products always hold less energy than reactants', 'Produkte enthalten immer weniger Energie als Edukte') },
      { text: b('It is a rule of thumb that only works for combustion', 'Es ist eine Faustregel, die nur bei Verbrennungen funktioniert') },
      { text: b('It is a route via the elements: take the reactants apart, then build the products', 'Es ist ein Weg über die Elemente: Edukte zerlegen, dann Produkte aufbauen'), correct: true },
      { text: b('The elements are formed in the reaction and have to be added twice', 'Die Elemente entstehen bei der Reaktion und müssen doppelt addiert werden') },
    ],
    explain: b('Imagine taking the reactants apart into their elements: that is their formation reversed, so their Δ_{f}H values count with the opposite sign. Then build the products from the same elements: their Δ_{f}H values count as they are. By Hess\'s law this route has the same ΔH as the reaction.',
      'Stell dir vor, die Edukte werden in ihre Elemente zerlegt: Das ist ihre Bildung rückwärts, also gehen ihre Δ_{f}H-Werte mit umgekehrtem Vorzeichen ein. Dann werden aus denselben Elementen die Produkte gebildet: Ihre Δ_{f}H-Werte gehen unverändert ein. Nach dem Satz von Hess hat dieser Weg dasselbe ΔH wie die Reaktion.') },
  { id: 'i18o', unit: 18, kind: 'estimate', format: 'estimate', evidence: 'transfer', concepts: ['u18.products-reactants'],
    prompt: b('Ethane burns: C₂H₆ + 3½ O₂ → 2 CO₂ + 3 H₂O(l). Standard enthalpies of formation (kJ/mol): C₂H₆ −84.0, CO₂ −393.5, H₂O(l) −285.8. Find ΔH.',
      'Ethan verbrennt: C₂H₆ + 3½ O₂ → 2 CO₂ + 3 H₂O(l). Standardbildungsenthalpien (kJ/mol): C₂H₆ −84,0, CO₂ −393,5, H₂O(l) −285,8. Bestimme ΔH.'),
    min: -2500, max: 2500, step: 1, answer: -1560, tolerance: 4, suffix: ' kJ/mol',
    near: [
      { value: 1560, tol: 4, note: b('The size is right, the sign is not: it is products minus reactants, and burning gives out energy.', 'Der Betrag stimmt, das Vorzeichen nicht: Es heißt Produkte minus Edukte, und eine Verbrennung gibt Energie ab.') },
      { value: -1728, tol: 4, note: b('Ethane is a reactant: subtract its value instead of adding it.', 'Ethan ist ein Edukt: Zieh seinen Wert ab, statt ihn zu addieren.') },
    ],
    explain: b('Products: 2 × (−393.5) + 3 × (−285.8) = −1644.4; reactants: −84.0 (O₂ counts zero). Δ_{r}H = −1644.4 − (−84.0) = −1560.4 kJ/mol (from unrounded values −1560.5).',
      'Produkte: 2 · (−393,5) + 3 · (−285,8) = −1644,4; Edukte: −84,0 (O₂ hat den Wert null). Δ_{r}H = −1644,4 − (−84,0) = −1560,4 kJ/mol (aus ungerundeten Werten −1560,5).') },

  // ---------- u18.unmeasurable ----------
  { id: 'i18p', unit: 18, kind: 'choice', format: 'predict', withConfidence: true, concepts: ['u18.unmeasurable'],
    prompt: b('Which of these values comes from a Hess cycle rather than from a direct measurement?', 'Welcher dieser Werte stammt aus einem Kreisprozess und nicht aus einer direkten Messung?'),
    options: [
      { text: b('ΔH for burning methane', 'ΔH für die Verbrennung von Methan') },
      { text: b('The lattice energy of sodium chloride', 'Die Gitterenergie von Natriumchlorid'), correct: true },
      { text: b('The boiling point of water', 'Die Siedetemperatur von Wasser') },
      { text: b('ΔH for slaking lime with water', 'ΔH für das Löschen von Kalk mit Wasser') },
    ],
    explain: b('No experiment turns a salt crystal straight into gaseous ions, so its lattice energy comes from a Born–Haber cycle, a Hess cycle through atoms and ions. Burning methane and slaking lime run cleanly in a calorimeter, and a boiling point is read off a thermometer.',
      'Kein Experiment verwandelt einen Salzkristall direkt in gasförmige Ionen, deshalb stammt seine Gitterenergie aus einem Born-Haber-Kreisprozess, einem Kreisprozess über Atome und Ionen. Die Verbrennung von Methan und das Kalklöschen laufen sauber im Kalorimeter ab, und eine Siedetemperatur liest man am Thermometer ab.') },
  { id: 'i18q', unit: 18, kind: 'choice', format: 'why', evidence: 'explain', withConfidence: true, concepts: ['u18.unmeasurable'], targets: ['path-dependent'],
    prompt: b('Why can nobody measure ΔH for C + ½ O₂ → CO directly in a calorimeter?', 'Warum kann niemand ΔH für C + ½ O₂ → CO direkt im Kalorimeter messen?'),
    options: [
      { text: b('Burning carbon always gives a mixture of CO and CO₂', 'Beim Verbrennen von Kohlenstoff entsteht immer ein Gemisch aus CO und CO₂'), correct: true },
      { text: b('The value depends on how the carbon is burned, so it has no fixed value', 'Der Wert hängt davon ab, wie man den Kohlenstoff verbrennt, er hat also keinen festen Wert'), mis: 'path-dependent' },
      { text: b('The reaction gives out no heat that could be measured', 'Die Reaktion gibt keine messbare Wärme ab') },
      { text: b('Carbon monoxide is poisonous, so the experiment is not allowed', 'Kohlenstoffmonoxid ist giftig, deshalb ist das Experiment verboten') },
    ],
    explain: b('Some CO always burns on to CO₂, so the heat measured belongs to two reactions at once. The value itself is fixed (−110.5 kJ/mol); a Hess cycle through the two clean combustions finds it.',
      'Ein Teil des CO verbrennt immer weiter zu CO₂, also gehört die gemessene Wärme zu zwei Reaktionen gleichzeitig. Der Wert selbst ist fest (−110,5 kJ/mol); ein Kreisprozess über die beiden sauberen Verbrennungen liefert ihn.') },
  { id: 'i18r', unit: 18, kind: 'choice', format: 'predict', evidence: 'transfer', withConfidence: true, concepts: ['u18.unmeasurable', 'u18.reverse'], targets: ['reverse-keeps-sign', 'path-dependent'],
    prompt: b('Graphite does not turn into diamond under everyday conditions, so ΔH for C(graphite) → C(diamond) cannot be measured directly. Both burn completely: graphite −393.5, diamond −395.4 kJ/mol. What is ΔH?',
      'Graphit wird unter Alltagsbedingungen nicht zu Diamant, deshalb lässt sich ΔH für C(Graphit) → C(Diamant) nicht direkt messen. Beide verbrennen vollständig: Graphit −393,5, Diamant −395,4 kJ/mol. Wie groß ist ΔH?'),
    options: [
      { text: b('+1.9 kJ/mol', '+1,9 kJ/mol'), correct: true },
      { text: b('−788.9 kJ/mol', '−788,9 kJ/mol'), mis: 'reverse-keeps-sign' },
      { text: b('Unknown until someone makes diamond from graphite', 'Unbekannt, bis jemand Diamant aus Graphit herstellt'), mis: 'path-dependent' },
      { text: b('−1.9 kJ/mol', '−1,9 kJ/mol') },
    ],
    explain: b('Route: burn graphite (−393.5), then run the burning of diamond backwards (+395.4): ΔH = −393.5 + 395.4 = +1.9 kJ/mol. −788.9 keeps the sign of the reversed step, and −1.9 is the reaction the other way round, diamond → graphite.',
      'Weg: Graphit verbrennen (−393,5), dann die Verbrennung von Diamant rückwärts (+395,4): ΔH = −393,5 + 395,4 = +1,9 kJ/mol. −788,9 behält das Vorzeichen des umgekehrten Schritts, und −1,9 ist die Reaktion in Gegenrichtung, Diamant → Graphit.') },
];
