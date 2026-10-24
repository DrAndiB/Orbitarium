import type { Bi } from '../../i18n';
import type { Item } from '../items';

const b = (en: string, de: string): Bi => ({ en, de });

// Unit 14 question bank: three or more variants per concept (predict, why, transfer), every trap option tagged.
// Every molar mass and atom count is from src/content/stoich.ts (molarMass, sideCount): H₂ 2.016, O₂ 32.00 (31.998),
// C₃H₈ 44.10, CaCO₃ 100.09, CaO 56.08, CO₂ 44.01 g/mol; O₂ has 15.87 times the molar mass of H₂, so 1 g of H₂ burns
// with 7.94 g of O₂ and 4 g with 31.7 g. Checked equations: C₃H₈ + 5 O₂ → 3 CO₂ + 4 H₂O; 2 C₄H₁₀ + 13 O₂ → 8 CO₂ +
// 10 H₂O; C₂H₅OH + 3 O₂ → 2 CO₂ + 3 H₂O; N₂ + 3 H₂ → 2 NH₃; Zn + 2 HCl → ZnCl₂ + H₂; Fe₂O₃ + 3 CO → 2 Fe + 3 CO₂;
// 2 K + Br₂ → 2 KBr; 2 Ca + O₂ → 2 CaO (CaO₂, calcium peroxide, is a different compound). Lavoisier's sealed tin:
// see unit14.ts.
export const BANK_U14: Item[] = [
  // ---------- u14.conservation ----------
  { id: 'i14a', unit: 14, kind: 'choice', format: 'predict', withConfidence: true, concepts: ['u14.conservation'],
    prompt: b('Propane, the gas in camping stoves, burns: {{C3H8}} + 5 {{O2}} → 3 {{CO2}} + 4 {{H2O}}. How many oxygen atoms are on each side?', 'Propan, das Gas in Campingkochern, verbrennt: {{C3H8}} + 5 {{O2}} → 3 {{CO2}} + 4 {{H2O}}. Wie viele Sauerstoffatome stehen auf jeder Seite?'),
    options: [
      { text: b('5', '5') },
      { text: b('7', '7') },
      { text: b('10', '10'), correct: true },
      { text: b('14', '14') },
    ],
    explain: b('Left: 5 O₂ is 5 × 2 = 10 oxygen atoms. Right: 3 CO₂ hold 6 and 4 H₂O hold 4, together 10. Each coefficient multiplies the whole formula behind it.', 'Links: 5 O₂ sind 5 · 2 = 10 Sauerstoffatome. Rechts: 3 CO₂ enthalten 6 und 4 H₂O enthalten 4, zusammen 10. Jeder Koeffizient multipliziert die ganze Formel dahinter.') },
  { id: 'i14b', unit: 14, kind: 'choice', format: 'why', evidence: 'explain', withConfidence: true, concepts: ['u14.conservation'],
    prompt: b('Why must every element count the same on both sides of an equation?', 'Warum muss jedes Element auf beiden Seiten einer Reaktionsgleichung gleich oft vorkommen?'),
    options: [
      { text: b('A reaction only rearranges atoms into new substances; none are made or destroyed', 'Eine Reaktion ordnet Atome nur zu neuen Stoffen um; keines wird erzeugt oder vernichtet'), correct: true },
      { text: b('The number of molecules has to stay the same in a reaction', 'Die Zahl der Moleküle muss bei einer Reaktion gleich bleiben') },
      { text: b('The arrow works like an equals sign, so both sides must look alike', 'Der Pfeil wirkt wie ein Gleichheitszeichen, deshalb müssen beide Seiten gleich aussehen') },
      { text: b('Chemists agreed on it to make equations easier to read', 'Chemiker haben es vereinbart, damit Gleichungen leichter zu lesen sind') },
    ],
    explain: b('Atoms change partners in a reaction, but each atom keeps being the same element. The number of molecules can change: in 2 H₂ + O₂ → 2 H₂O, three molecules become two, yet 4 H and 2 O stay 4 H and 2 O.', 'Bei einer Reaktion wechseln Atome ihre Partner, aber jedes Atom bleibt dasselbe Element. Die Zahl der Moleküle darf sich ändern: Bei 2 H₂ + O₂ → 2 H₂O werden aus drei Molekülen zwei, doch 4 H und 2 O bleiben 4 H und 2 O.') },
  { id: 'i14c', unit: 14, kind: 'choice', format: 'predict', evidence: 'transfer', withConfidence: true, concepts: ['u14.conservation'],
    prompt: b('A piece of zinc dissolves in hydrochloric acid and is gone: Zn + 2 HCl → {{ZnCl2}} + {{H2}}. Where are the zinc atoms now?', 'Ein Stück Zink löst sich in Salzsäure und ist verschwunden: Zn + 2 HCl → {{ZnCl2}} + {{H2}}. Wo sind die Zinkatome jetzt?'),
    options: [
      { text: b('They turned into the hydrogen gas that bubbles off', 'Sie wurden zu dem Wasserstoffgas, das aufsteigt') },
      { text: b('The acid destroyed them; only the chlorine is left', 'Die Säure hat sie vernichtet; übrig ist nur das Chlor') },
      { text: b('They escaped as heat, since the flask gets warm', 'Sie sind als Wärme entwichen, denn der Kolben wird warm') },
      { text: b('In the zinc chloride, dissolved in the liquid', 'Im Zinkchlorid, gelöst in der Flüssigkeit'), correct: true },
    ],
    explain: b('One Zn on the left, one Zn in ZnCl₂ on the right. Zinc chloride is a salt that dissolves (as Zn²⁺ and Cl⁻ ions, unit 11), so the zinc is out of sight but still there; the bubbles are the hydrogen from the acid. A reaction never turns one element into another.', 'Ein Zn links, ein Zn im ZnCl₂ rechts. Zinkchlorid ist ein Salz, das sich löst (als Zn²⁺- und Cl⁻-Ionen, Einheit 11), also ist das Zink nicht mehr zu sehen, aber noch da; die Bläschen sind der Wasserstoff aus der Säure. Eine Reaktion macht nie aus einem Element ein anderes.') },
  { id: 'i14d', unit: 14, kind: 'choice', format: 'odd', evidence: 'transfer', concepts: ['u14.conservation', 'u14.method'],
    prompt: b('Three of these equations are balanced. Which one is not?', 'Drei dieser Gleichungen sind ausgeglichen. Welche nicht?'),
    options: [
      { text: b('{{CaCO3}} → CaO + {{CO2}}', '{{CaCO3}} → CaO + {{CO2}}') },
      { text: b('{{Fe2O3}} + 3 CO → 2 Fe + 3 {{CO2}}', '{{Fe2O3}} + 3 CO → 2 Fe + 3 {{CO2}}') },
      { text: b('{{C3H8}} + 5 {{O2}} → 3 {{CO2}} + 3 {{H2O}}', '{{C3H8}} + 5 {{O2}} → 3 {{CO2}} + 3 {{H2O}}'), correct: true },
      { text: b('Zn + 2 HCl → {{ZnCl2}} + {{H2}}', 'Zn + 2 HCl → {{ZnCl2}} + {{H2}}') },
    ],
    explain: b('The propane equation has 8 H on the left but only 6 on the right, and 10 O against 9; it needs 4 H₂O. In the blast-furnace equation, Fe₂O₃ + 3 CO → 2 Fe + 3 CO₂, every element matches: 2 Fe, 3 C, 6 O.', 'Die Propangleichung hat links 8 H, rechts nur 6, und 10 O gegenüber 9; sie braucht 4 H₂O. In der Hochofengleichung, Fe₂O₃ + 3 CO → 2 Fe + 3 CO₂, stimmt jedes Element: 2 Fe, 3 C, 6 O.') },

  // ---------- u14.coefficients ----------
  { id: 'i14e', unit: 14, kind: 'choice', format: 'predict', withConfidence: true, concepts: ['u14.coefficients'], targets: ['balance-by-subscript'],
    prompt: b('Hydrogen and chlorine react to hydrogen chloride, HCl: {{H2}} + {{Cl2}} → HCl. Which is the balanced equation?', 'Wasserstoff und Chlor reagieren zu Chlorwasserstoff, HCl: {{H2}} + {{Cl2}} → HCl. Welche ist die ausgeglichene Gleichung?'),
    options: [
      { text: b('{{H2}} + {{Cl2}} → {{H2Cl2}}', '{{H2}} + {{Cl2}} → {{H2Cl2}}'), mis: 'balance-by-subscript' },
      { text: b('{{H2}} + {{Cl2}} → 2 HCl', '{{H2}} + {{Cl2}} → 2 HCl'), correct: true },
      { text: b('H + Cl → HCl', 'H + Cl → HCl') },
      { text: b('2 {{H2}} + {{Cl2}} → 2 HCl', '2 {{H2}} + {{Cl2}} → 2 HCl') },
    ],
    explain: b('A 2 in front of HCl gives 2 H and 2 Cl on each side. H₂Cl₂ balances the count too, but it is not hydrogen chloride; H + Cl ignores that both gases are made of two-atom molecules; and 2 H₂ brings 4 H for only 2.', 'Eine 2 vor HCl ergibt 2 H und 2 Cl auf jeder Seite. H₂Cl₂ lässt die Bilanz auch stimmen, ist aber kein Chlorwasserstoff; H + Cl übersieht, dass beide Gase aus zweiatomigen Molekülen bestehen; und 2 H₂ bringt 4 H statt 2.') },
  { id: 'i14f', unit: 14, kind: 'choice', format: 'why', evidence: 'explain', withConfidence: true, concepts: ['u14.coefficients'], targets: ['balance-by-subscript'],
    prompt: b('Why may you not balance {{H2}} + {{O2}} → {{H2O}} by writing {{H2O2}} on the right?', 'Warum darfst du {{H2}} + {{O2}} → {{H2O}} nicht ausgleichen, indem du rechts {{H2O2}} schreibst?'),
    options: [
      { text: b('You may: the atoms balance, and coefficients are only the quicker way', 'Doch, das darfst du: Die Atome stimmen, und Koeffizienten sind nur der schnellere Weg'), mis: 'balance-by-subscript' },
      { text: b('H₂O₂ would have more mass than the hydrogen and oxygen it comes from', 'H₂O₂ hätte mehr Masse als der Wasserstoff und der Sauerstoff, aus denen es entsteht') },
      { text: b('H₂O₂ is hydrogen peroxide: the subscripts say which substance it is', 'H₂O₂ ist Wasserstoffperoxid: Die Indizes legen fest, welcher Stoff es ist'), correct: true },
      { text: b('Subscripts may only be changed on the left side of the arrow', 'Indizes darf man nur links vom Pfeil ändern') },
    ],
    explain: b('Burning hydrogen gives water, H₂O. H₂O₂, hydrogen peroxide, is a different substance, a bleach. Only the coefficients may change: 2 H₂ + O₂ → 2 H₂O. In an exam, balancing by a subscript costs the mark even when the atoms add up.', 'Brennender Wasserstoff ergibt Wasser, H₂O. H₂O₂, Wasserstoffperoxid, ist ein anderer Stoff, ein Bleichmittel. Ändern darf man nur die Koeffizienten: 2 H₂ + O₂ → 2 H₂O. In einer Klausur kostet Ausgleichen über einen Index den Punkt, auch wenn die Atome stimmen.') },
  { id: 'i14g', unit: 14, kind: 'choice', format: 'predict', evidence: 'transfer', withConfidence: true, concepts: ['u14.coefficients', 'u14.diatomic'], targets: ['balance-by-subscript'],
    prompt: b('Calcium burns in oxygen to calcium oxide, CaO. A student balances Ca + {{O2}} → CaO by writing {{CaO2}}. What do you tell them?', 'Calcium verbrennt in Sauerstoff zu Calciumoxid, CaO. Jemand gleicht Ca + {{O2}} → CaO aus, indem er {{CaO2}} schreibt. Was sagst du?'),
    options: [
      { text: b('Fine: the atoms now balance, and that is all an equation needs', 'Passt: Die Atome stimmen jetzt, mehr braucht eine Gleichung nicht'), mis: 'balance-by-subscript' },
      { text: b('Wrong: write single O atoms instead, Ca + O → CaO', 'Falsch: Schreib stattdessen einzelne O-Atome, Ca + O → CaO') },
      { text: b('Wrong: write Ca₂ + O₂ → Ca₂O₂ so that both sides match', 'Falsch: Schreib Ca₂ + O₂ → Ca₂O₂, damit beide Seiten passen'), mis: 'balance-by-subscript' },
      { text: b('Wrong: CaO₂ is calcium peroxide; write 2 Ca + O₂ → 2 CaO', 'Falsch: CaO₂ ist Calciumperoxid; schreib 2 Ca + O₂ → 2 CaO'), correct: true },
    ],
    explain: b('CaO₂ exists, but it is calcium peroxide, not the oxide that forms. Oxygen gas is O₂, so it stays O₂; a coefficient of 2 in front of CaO and of Ca gives 2 Ca and 2 O on each side. Ca₂ and Ca₂O₂ change subscripts too.', 'CaO₂ gibt es, aber es ist Calciumperoxid, nicht das Oxid, das entsteht. Sauerstoffgas ist O₂, also bleibt es O₂; ein Koeffizient 2 vor CaO und vor Ca ergibt 2 Ca und 2 O auf jeder Seite. Ca₂ und Ca₂O₂ ändern ebenfalls Indizes.') },

  // ---------- u14.ratio ----------
  { id: 'i14h', unit: 14, kind: 'choice', format: 'predict', withConfidence: true, concepts: ['u14.ratio'],
    prompt: b('Ammonia synthesis: {{N2}} + 3 {{H2}} → 2 {{NH3}}. How many moles of ammonia can 3 mol of hydrogen give at most?', 'Ammoniaksynthese: {{N2}} + 3 {{H2}} → 2 {{NH3}}. Wie viel Mol Ammoniak können 3 mol Wasserstoff höchstens ergeben?'),
    options: [
      { text: b('1 mol', '1 mol') },
      { text: b('2 mol', '2 mol'), correct: true },
      { text: b('3 mol', '3 mol') },
      { text: b('6 mol', '6 mol') },
    ],
    explain: b('The coefficients are a ratio of particles and so of moles: 3 H₂ give 2 NH₃, so 3 mol of H₂ give 2 mol of NH₃ (with 1 mol of N₂). Check: 6 mol H atoms end up in 2 mol NH₃, 3 each.', 'Die Koeffizienten sind ein Verhältnis von Teilchen und damit von Stoffmengen: 3 H₂ ergeben 2 NH₃, also ergeben 3 mol H₂ 2 mol NH₃ (mit 1 mol N₂). Probe: 6 mol H-Atome landen in 2 mol NH₃, je 3.') },
  { id: 'i14i', unit: 14, kind: 'choice', format: 'why', evidence: 'explain', withConfidence: true, concepts: ['u14.ratio'], targets: ['coefficients-mass-ratio'],
    prompt: b('2 {{H2}} + {{O2}} → 2 {{H2O}}. Why does 1 g of hydrogen not burn with 0.5 g of oxygen?', '2 {{H2}} + {{O2}} → 2 {{H2O}}. Warum verbrennt 1 g Wasserstoff nicht mit 0,5 g Sauerstoff?'),
    options: [
      { text: b('It does: 2 : 1 says two parts of hydrogen to one part of oxygen', 'Doch: 2 : 1 bedeutet zwei Teile Wasserstoff auf einen Teil Sauerstoff'), mis: 'coefficients-mass-ratio' },
      { text: b('Part of the oxygen is always lost as heat, so more is needed', 'Ein Teil des Sauerstoffs geht immer als Wärme verloren, deshalb braucht man mehr') },
      { text: b('2 : 1 counts molecules, and an O₂ molecule has about 16 times the mass of an H₂ molecule', '2 : 1 gibt Teilchenzahlen an, und ein O₂-Molekül hat etwa die 16-fache Masse eines H₂-Moleküls'), correct: true },
      { text: b('Gases have no fixed mass, so the grams cannot be worked out', 'Gase haben keine feste Masse, deshalb lassen sich die Gramm nicht berechnen') },
    ],
    explain: b('Two H₂ molecules react with one O₂ molecule. O₂ has a molar mass of 32.00 g/mol, H₂ of 2.016 g/mol, about 16 times less, so 1 g of hydrogen (0.496 mol) needs about 7.9 g of oxygen, not 0.5 g.', 'Zwei H₂-Moleküle reagieren mit einem O₂-Molekül. O₂ hat eine molare Masse von 32,00 g/mol, H₂ von 2,016 g/mol, etwa 16-mal weniger, also braucht 1 g Wasserstoff (0,496 mol) etwa 7,9 g Sauerstoff, nicht 0,5 g.') },
  { id: 'i14j', unit: 14, kind: 'choice', format: 'predict', evidence: 'transfer', withConfidence: true, concepts: ['u14.ratio', 'u14.mass'], targets: ['coefficients-mass-ratio'],
    prompt: b('Propane burns: {{C3H8}} + 5 {{O2}} → 3 {{CO2}} + 4 {{H2O}}. Molar masses: {{C3H8}} 44.10 g/mol, {{O2}} 32.00 g/mol. How much oxygen does 44.10 g of propane use?', 'Propan verbrennt: {{C3H8}} + 5 {{O2}} → 3 {{CO2}} + 4 {{H2O}}. Molare Massen: {{C3H8}} 44,10 g/mol, {{O2}} 32,00 g/mol. Wie viel Sauerstoff verbraucht 44,10 g Propan?'),
    options: [
      { text: b('220.5 g: five times the mass of the propane', '220,5 g: die fünffache Masse des Propans'), mis: 'coefficients-mass-ratio' },
      { text: b('32.00 g: one mole of oxygen', '32,00 g: ein Mol Sauerstoff') },
      { text: b('160.0 g: five moles of oxygen', '160,0 g: fünf Mol Sauerstoff'), correct: true },
      { text: b('44.10 g: equal masses react', '44,10 g: Es reagieren gleiche Massen') },
    ],
    explain: b('44.10 g of propane is 1 mol, and the equation says 1 mol of propane reacts with 5 mol of O₂: 5 × 32.00 g = 160.0 g. Reading 1 : 5 as grams gives 220.5 g, too much, because an O₂ molecule is lighter than a propane molecule.', '44,10 g Propan sind 1 mol, und die Gleichung sagt: 1 mol Propan reagiert mit 5 mol O₂, also 5 · 32,00 g = 160,0 g. Liest man 1 : 5 als Gramm, kommt man auf 220,5 g, zu viel, weil ein O₂-Molekül leichter ist als ein Propanmolekül.') },
  { id: 'i14k', unit: 14, kind: 'estimate', format: 'estimate', concepts: ['u14.ratio'], targets: ['coefficients-mass-ratio'],
    prompt: b('2 {{H2}} + {{O2}} → 2 {{H2O}}. Molar masses: {{H2}} 2.016 g/mol, {{O2}} 32.00 g/mol. With how many grams of oxygen does 4 g of hydrogen burn?', '2 {{H2}} + {{O2}} → 2 {{H2O}}. Molare Massen: {{H2}} 2,016 g/mol, {{O2}} 32,00 g/mol. Mit wie viel Gramm Sauerstoff verbrennt 4 g Wasserstoff?'),
    min: 0, max: 80, step: 0.5, answer: 32, tolerance: 0.5, suffix: ' g',
    near: [
      { value: 2, tol: 0.5, note: b('2 g reads the coefficients 2 : 1 as grams. They count molecules: first turn the 4 g into moles.', '2 g liest die Koeffizienten 2 : 1 als Gramm. Sie geben Teilchenzahlen an: Rechne die 4 g zuerst in Mol um.') },
      { value: 64, tol: 0.5, note: b('64 g would be one O₂ for every H₂. The equation needs one O₂ for every two H₂.', '64 g wäre ein O₂ auf jedes H₂. Die Gleichung braucht ein O₂ auf zwei H₂.') },
    ],
    explain: b('4 g ÷ 2.016 g/mol = 1.98 mol of H₂. Half as many moles of O₂: 0.99 mol × 32.00 g/mol = 31.7 g, about 32 g. Water then forms with 4 + 31.7 = 35.7 g.', 'n(H₂) = 4 g : 2,016 g/mol = 1,98 mol. Halb so viel Mol O₂: 0,99 mol · 32,00 g/mol = 31,7 g, etwa 32 g. Es entstehen dann 4 + 31,7 = 35,7 g Wasser.') },

  // ---------- u14.mass ----------
  { id: 'i14l', unit: 14, kind: 'choice', format: 'predict', withConfidence: true, concepts: ['u14.mass'], targets: ['mass-lost-burning'],
    prompt: b('Limestone is heated strongly in an open dish: {{CaCO3}} → CaO + {{CO2}}. You start with 100.1 g of {{CaCO3}} (1 mol). What does the balance show at the end?', 'Kalk wird in einer offenen Schale stark erhitzt: {{CaCO3}} → CaO + {{CO2}}. Du beginnst mit 100,1 g {{CaCO3}} (1 mol). Was zeigt die Waage am Ende?'),
    options: [
      { text: b('100.1 g: mass is always the same before and after', '100,1 g: Die Masse ist vorher und nachher immer gleich') },
      { text: b('56.1 g: the 44.0 g of carbon dioxide left as a gas', '56,1 g: Die 44,0 g Kohlenstoffdioxid sind als Gas entwichen'), correct: true },
      { text: b('Less than 56.1 g: the fierce heat destroys some of the matter', 'Weniger als 56,1 g: Die starke Hitze vernichtet einen Teil der Materie'), mis: 'mass-lost-burning' },
      { text: b('More than 100.1 g: like a metal, it takes up oxygen from the air', 'Mehr als 100,1 g: Wie ein Metall nimmt es Sauerstoff aus der Luft auf') },
    ],
    explain: b('1 mol of CaCO₃ gives 1 mol of CaO (56.1 g) and 1 mol of CO₂ (44.0 g): 56.1 + 44.0 = 100.1 g, so nothing is lost. The total stays the same only if you count the gas too; in an open dish the CO₂ drifts away, so the balance shows 56.1 g.', '1 mol CaCO₃ ergibt 1 mol CaO (56,1 g) und 1 mol CO₂ (44,0 g): 56,1 + 44,0 = 100,1 g, es geht also nichts verloren. Die Summe bleibt nur gleich, wenn man das Gas mitzählt; in einer offenen Schale zieht das CO₂ ab, also zeigt die Waage 56,1 g.') },
  { id: 'i14m', unit: 14, kind: 'choice', format: 'why', evidence: 'explain', withConfidence: true, concepts: ['u14.mass'], targets: ['mass-lost-burning'],
    prompt: b('A burning candle on a balance gets lighter minute by minute. Why?', 'Eine brennende Kerze auf einer Waage wird Minute für Minute leichter. Warum?'),
    options: [
      { text: b('The flame destroys the wax, turning its matter into light and heat', 'Die Flamme vernichtet das Wachs und macht aus seiner Materie Licht und Wärme'), mis: 'mass-lost-burning' },
      { text: b('Wax and oxygen from the air form carbon dioxide and water vapour, which drift off the balance', 'Wachs und Sauerstoff aus der Luft bilden Kohlenstoffdioxid und Wasserdampf, die von der Waage wegziehen'), correct: true },
      { text: b('Hot wax weighs less than cold wax', 'Heißes Wachs wiegt weniger als kaltes') },
      { text: b('The air pushing up around the flame lifts the candle a little', 'Die Luft, die um die Flamme aufsteigt, hebt die Kerze ein wenig an') },
    ],
    explain: b('Burning rearranges the atoms of wax and oxygen into CO₂ and H₂O, both gases at the flame. They leave, so the balance loses their mass. Catch the gases and add the oxygen used, and the total stays the same.', 'Beim Verbrennen werden die Atome von Wachs und Sauerstoff zu CO₂ und H₂O umgeordnet, an der Flamme beides Gase. Sie ziehen ab, also verliert die Waage ihre Masse. Fängt man die Gase auf und rechnet den verbrauchten Sauerstoff mit, bleibt die Summe gleich.') },
  { id: 'i14n', unit: 14, kind: 'choice', format: 'predict', evidence: 'transfer', withConfidence: true, concepts: ['u14.mass', 'u14.conservation'], targets: ['mass-lost-burning'],
    prompt: b('Steel wool is sealed in a flask full of oxygen, placed on a balance and lit with an electric spark. It glows and turns to iron oxide. What does the balance show?', 'Stahlwolle wird in einem Kolben voller Sauerstoff verschlossen, auf eine Waage gestellt und mit einem elektrischen Funken gezündet. Sie glüht und wird zu Eisenoxid. Was zeigt die Waage?'),
    options: [
      { text: b('More: steel wool always gets heavier when it burns', 'Mehr: Stahlwolle wird beim Verbrennen immer schwerer') },
      { text: b('Less: the glowing destroys some of the iron', 'Weniger: Das Glühen vernichtet einen Teil des Eisens'), mis: 'mass-lost-burning' },
      { text: b('Less: the oxygen gas is used up', 'Weniger: Das Sauerstoffgas wird verbraucht') },
      { text: b('The same: the oxide gains exactly what the gas loses', 'Gleich viel: Das Oxid gewinnt genau, was das Gas verliert'), correct: true },
    ],
    explain: b('Inside the sealed flask the oxygen moves from the gas into the solid oxide, but nothing gets in or out. Lavoisier found the same with tin in 1774: the solid gained 0.166 g and the air inside lost 0.166 g. In open air the wool gets heavier because fresh oxygen keeps coming in from outside.', 'Im verschlossenen Kolben wandert der Sauerstoff aus dem Gas in das feste Oxid, aber nichts kommt hinein oder hinaus. Lavoisier fand 1774 dasselbe mit Zinn: Der Feststoff nahm um 0,166 g zu, die Luft darin um 0,166 g ab. An offener Luft wird die Wolle schwerer, weil von außen neuer Sauerstoff nachkommt.') },

  // ---------- u14.method ----------
  { id: 'i14o', unit: 14, kind: 'choice', format: 'predict', withConfidence: true, concepts: ['u14.method'],
    prompt: b('You balance propane burning, {{C3H8}} + {{O2}} → {{CO2}} + {{H2O}}, with the method from this unit. Which coefficient do you set last?', 'Du gleichst die Verbrennung von Propan aus, {{C3H8}} + {{O2}} → {{CO2}} + {{H2O}}, mit dem Vorgehen aus dieser Einheit. Welchen Koeffizienten setzt du zuletzt?'),
    options: [
      { text: b('The one in front of {{C3H8}}', 'Den vor {{C3H8}}') },
      { text: b('The one in front of {{CO2}}', 'Den vor {{CO2}}') },
      { text: b('The one in front of {{H2O}}', 'Den vor {{H2O}}') },
      { text: b('The one in front of {{O2}}', 'Den vor {{O2}}'), correct: true },
    ],
    explain: b('Start with propane, the most complex substance: 3 C give 3 CO₂, 8 H give 4 H₂O. Only then count the oxygen on the right, 6 + 4 = 10, and set 5 O₂. O₂ is pure oxygen, so it comes last.', 'Fang mit Propan an, dem kompliziertesten Stoff: 3 C ergeben 3 CO₂, 8 H ergeben 4 H₂O. Erst dann zählst du den Sauerstoff rechts, 6 + 4 = 10, und setzt 5 O₂. O₂ ist reiner Sauerstoff, deshalb kommt er zuletzt.') },
  { id: 'i14p', unit: 14, kind: 'choice', format: 'why', evidence: 'explain', withConfidence: true, concepts: ['u14.method'],
    prompt: b('Why do you balance {{O2}} last when a fuel burns?', 'Warum gleichst du beim Verbrennen eines Brennstoffs {{O2}} zuletzt aus?'),
    options: [
      { text: b('O₂ holds only oxygen, so changing its coefficient upsets no other element', 'O₂ enthält nur Sauerstoff, ein geänderter Koeffizient davor bringt also kein anderes Element durcheinander'), correct: true },
      { text: b('O₂ always ends up with the biggest coefficient', 'O₂ bekommt immer den größten Koeffizienten') },
      { text: b('Oxygen atoms are the heaviest, so they matter most', 'Sauerstoffatome sind am schwersten, deshalb zählen sie am meisten') },
      { text: b('Oxygen reacts last in the flame, after the carbon and hydrogen', 'Sauerstoff reagiert in der Flamme zuletzt, nach Kohlenstoff und Wasserstoff') },
    ],
    explain: b('Carbon and hydrogen each sit in one substance per side, so they fix CO₂ and H₂O first. Oxygen then appears in two products, and only O₂ is left to change: a substance made of one element moves nothing else. The order is a method for the bookkeeping, not the order in which the flame reacts.', 'Kohlenstoff und Wasserstoff sitzen pro Seite in je einem Stoff, sie legen also zuerst CO₂ und H₂O fest. Sauerstoff steckt dann in zwei Produkten, und zu ändern bleibt nur O₂: Ein Stoff aus nur einem Element verschiebt nichts anderes. Die Reihenfolge ist ein Vorgehen für die Bilanz, nicht die Reihenfolge, in der die Flamme reagiert.') },
  { id: 'i14q', unit: 14, kind: 'choice', format: 'predict', evidence: 'transfer', withConfidence: true, concepts: ['u14.method'],
    prompt: b('Butane, the gas in lighters, burns: {{C4H10}} + {{O2}} → {{CO2}} + {{H2O}}. Which coefficients, in this order, use the smallest whole numbers?', 'Butan, das Gas in Feuerzeugen, verbrennt: {{C4H10}} + {{O2}} → {{CO2}} + {{H2O}}. Welche Koeffizienten, in dieser Reihenfolge, sind die kleinsten ganzen Zahlen?'),
    options: [
      { text: b('1, 6.5, 4, 5', '1; 6,5; 4; 5') },
      { text: b('2, 13, 8, 10', '2; 13; 8; 10'), correct: true },
      { text: b('1, 13, 4, 5', '1; 13; 4; 5') },
      { text: b('2, 9, 8, 10', '2; 9; 8; 10') },
    ],
    explain: b('One butane gives 4 CO₂ and 5 H₂O: 8 + 5 = 13 oxygen atoms, so 6½ O₂. Double everything to clear the half: 2 C₄H₁₀ + 13 O₂ → 8 CO₂ + 10 H₂O, with 26 O on each side. 13 O₂ with one butane would bring 26 O for only 13.', 'Ein Butan ergibt 4 CO₂ und 5 H₂O: 8 + 5 = 13 Sauerstoffatome, also 6½ O₂. Alles verdoppeln, um das Halbe loszuwerden: 2 C₄H₁₀ + 13 O₂ → 8 CO₂ + 10 H₂O, mit 26 O auf jeder Seite. 13 O₂ mit nur einem Butan brächten 26 O statt 13.') },
  { id: 'i14r', unit: 14, kind: 'estimate', format: 'estimate', evidence: 'transfer', concepts: ['u14.method', 'u14.conservation'],
    prompt: b('Ethanol burns in a spirit burner: {{C2H5OH}} + {{O2}} → 2 {{CO2}} + 3 {{H2O}}. Ethanol brings one oxygen atom of its own. What coefficient goes in front of {{O2}}?', 'Ethanol verbrennt in einem Spirituskocher: {{C2H5OH}} + {{O2}} → 2 {{CO2}} + 3 {{H2O}}. Ethanol bringt selbst ein Sauerstoffatom mit. Welcher Koeffizient gehört vor {{O2}}?'),
    min: 0, max: 10, step: 0.5, answer: 3, tolerance: 0, suffix: '',
    near: [{ value: 3.5, tol: 0, note: b('3.5 counts all 7 oxygen atoms on the right as coming from O₂. One of them is already in the ethanol.', '3,5 rechnet alle 7 Sauerstoffatome rechts dem O₂ zu. Eines davon steckt schon im Ethanol.') }],
    explain: b('Right: 2 CO₂ hold 4 O and 3 H₂O hold 3, together 7. The ethanol brings 1, so O₂ must bring 6: 3 O₂. C₂H₅OH + 3 O₂ → 2 CO₂ + 3 H₂O has 2 C, 6 H and 7 O on each side.', 'Rechts: 2 CO₂ enthalten 4 O und 3 H₂O enthalten 3, zusammen 7. Das Ethanol bringt 1 mit, also muss O₂ 6 liefern: 3 O₂. C₂H₅OH + 3 O₂ → 2 CO₂ + 3 H₂O hat 2 C, 6 H und 7 O auf jeder Seite.') },

  // ---------- u14.diatomic ----------
  { id: 'i14s', unit: 14, kind: 'choice', format: 'predict', withConfidence: true, concepts: ['u14.diatomic'],
    prompt: b('Which list holds only elements that are written as two-atom molecules in equations?', 'Welche Liste enthält nur Elemente, die man in Reaktionsgleichungen als zweiatomige Moleküle schreibt?'),
    options: [
      { text: b('hydrogen, nitrogen, oxygen, chlorine', 'Wasserstoff, Stickstoff, Sauerstoff, Chlor'), correct: true },
      { text: b('helium, neon, argon', 'Helium, Neon, Argon') },
      { text: b('sodium, magnesium, iron', 'Natrium, Magnesium, Eisen') },
      { text: b('carbon, oxygen, sulfur', 'Kohlenstoff, Sauerstoff, Schwefel') },
    ],
    explain: b('H₂, N₂, O₂ and Cl₂ (and the other halogens F₂, Br₂, I₂) are made of two-atom molecules. Noble gases are single atoms; metals, carbon and sulfur are written by their symbol alone (Na, Mg, Fe, C, S).', 'H₂, N₂, O₂ und Cl₂ (und die übrigen Halogene F₂, Br₂, I₂) bestehen aus zweiatomigen Molekülen. Edelgase sind einzelne Atome; Metalle, Kohlenstoff und Schwefel schreibt man nur mit ihrem Symbol (Na, Mg, Fe, C, S).') },
  { id: 'i14t', unit: 14, kind: 'choice', format: 'why', evidence: 'explain', withConfidence: true, concepts: ['u14.diatomic'],
    prompt: b('Why is hydrogen gas written as {{H2}} in an equation, not as H?', 'Warum schreibt man Wasserstoffgas in einer Reaktionsgleichung als {{H2}} und nicht als H?'),
    options: [
      { text: b('H₂ means two moles of hydrogen', 'H₂ bedeutet zwei Mol Wasserstoff') },
      { text: b('Writing H₂ makes equations easier to balance', 'Mit H₂ lassen sich Gleichungen leichter ausgleichen') },
      { text: b('A single H symbol is too small to read', 'Ein einzelnes H ist zu klein zum Lesen') },
      { text: b('The gas is made of H₂ molecules: two atoms joined by a shared pair', 'Das Gas besteht aus H₂-Molekülen: zwei Atome, verbunden durch ein gemeinsames Elektronenpaar'), correct: true },
    ],
    explain: b('An equation names the particles that really react. Two H atoms share a pair of electrons (unit 5), and hydrogen gas consists of these H₂ molecules. The 2 is a subscript and counts atoms in one molecule; two moles would be written 2 H₂ in front.', 'Eine Reaktionsgleichung nennt die Teilchen, die wirklich reagieren. Zwei H-Atome teilen sich ein Elektronenpaar (Einheit 5), und Wasserstoffgas besteht aus diesen H₂-Molekülen. Die 2 ist ein Index und gibt die Zahl der Atome in einem Molekül an; zwei Mol schreibt man als Koeffizient davor.') },
  { id: 'i14u', unit: 14, kind: 'choice', format: 'predict', evidence: 'transfer', withConfidence: true, concepts: ['u14.diatomic', 'u14.coefficients'], targets: ['balance-by-subscript'],
    prompt: b('Potassium reacts with bromine, a red-brown liquid made of {{Br2}} molecules, to potassium bromide, KBr. Which equation is right?', 'Kalium reagiert mit Brom, einer rotbraunen Flüssigkeit aus {{Br2}}-Molekülen, zu Kaliumbromid, KBr. Welche Gleichung stimmt?'),
    options: [
      { text: b('K + Br → KBr', 'K + Br → KBr') },
      { text: b('K + {{Br2}} → {{KBr2}}', 'K + {{Br2}} → {{KBr2}}'), mis: 'balance-by-subscript' },
      { text: b('{{K2}} + {{Br2}} → 2 KBr', '{{K2}} + {{Br2}} → 2 KBr') },
      { text: b('2 K + {{Br2}} → 2 KBr', '2 K + {{Br2}} → 2 KBr'), correct: true },
    ],
    explain: b('Bromine is a halogen and enters as Br₂; potassium is a metal and is written K. Each Br₂ gives two KBr, so two K are needed. KBr₂ does not exist (K forms K⁺, bromine Br⁻, unit 3), and K₂ is not how potassium occurs.', 'Brom ist ein Halogen und steht als Br₂ in der Gleichung; Kalium ist ein Metall und wird K geschrieben. Jedes Br₂ ergibt zwei KBr, also braucht man zwei K. KBr₂ gibt es nicht (K bildet K⁺, Brom Br⁻, Einheit 3), und als K₂ kommt Kalium nicht vor.') },
];
