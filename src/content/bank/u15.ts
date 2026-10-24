import type { Bi } from '../../i18n';
import type { Item } from '../items';

const b = (en: string, de: string): Bi => ({ en, de });

// Unit 15 question bank: three variants per concept (predict, why, transfer), every trap option tagged.
// Molar masses from stoich.ts (elements.ts masses), calculated amounts checked with molarMass(): O₂ 32.00, H₂ 2.016,
// CH₄ 16.04, CO₂ 44.01, N₂ 28.01, NH₃ 17.03, Mg 24.31, MgO 40.30, Fe₂O₃ 159.69, Al 26.98, Fe 55.85, C₃H₈ 44.10,
// CaCO₃ 100.09, CaO 56.08 g/mol.
// i15c: 8 g CH₄ 0.499 mol, 24 g O₂ 0.750 mol (÷2 = 0.375) → O₂ limiting, 0.375 mol CO₂ = 16.5 g.
// i15f: 100 g Fe₂O₃ 0.626 mol, 100 g Al 3.71 mol (÷2 = 1.85) → Fe₂O₃ limiting at equal masses, Fe 69.9 g,
// Al used 33.8 g, left 66.2 g. i15h: 4 g Mg 0.165 mol (÷2 = 0.082), 4 g O₂ 0.125 mol → Mg limiting, MgO 6.63 g,
// O₂ left 1.37 g. i15j: 44 g C₃H₈ 0.998 mol, 128 g O₂ 4.00 mol (÷5 = 0.800) → O₂ limiting, CO₂ 3 × 0.800 = 2.40 mol,
// 105.6 g; propane alone would give 131.7 g. i15m: 1000 kg CaCO₃ → 560.3 kg CaO; 504 kg is 90.0 %.
// i15o: 0.48 g Mg → 0.796 g MgO; 0.70 g is 87.9 %. Yield 6.4 g instead of 8.0 g = 80 % (ETH Leitprogramm
// "Stöchiometrie", U. Wuthier, 2008). Haber process: about 15 % per pass, about 98 % overall with recycling; an excess is
// used when the other reactant is much more expensive, and it costs reactor space (J. Clark, "5.4: The Haber Process",
// Chemistry LibreTexts). Copper with sulfur in excess "damit sicher alles Kupfer wegreagieren kann", the leftover sulfur
// burned off as SO₂ (ETH Leitprogramm, chapter "Kupfer reagiert mit Schwefel"). Space Shuttle main engine 6.0 : 1
// oxygen to hydrogen by mass, fuel-rich on purpose (NASA, NTRS 20020046693 and 20200003550).
export const BANK_U15: Item[] = [
  // ---------- u15.ratio ----------
  { id: 'i15a', unit: 15, kind: 'choice', format: 'predict', withConfidence: true, concepts: ['u15.ratio'], targets: ['coefficients-mass-ratio'],
    prompt: b('CH₄ + 2 O₂ → CO₂ + 2 H₂O. How much oxygen burns exactly 3 mol of methane, with nothing left over?', 'CH₄ + 2 O₂ → CO₂ + 2 H₂O. Wie viel Sauerstoff verbrennt genau 3 mol Methan, ohne dass etwas übrig bleibt?'),
    options: [
      { text: b('3 mol', '3 mol') },
      { text: b('6 mol', '6 mol'), correct: true },
      { text: b('1.5 mol', '1,5 mol') },
      { text: b('twice the mass of the methane, in grams', 'die doppelte Masse des Methans, in Gramm'), mis: 'coefficients-mass-ratio' },
    ],
    explain: b('Each CH₄ needs two O₂, so 3 mol of methane needs 6 mol of oxygen (192 g). The coefficients count molecules and moles; twice the mass would be only 96 g of oxygen.',
      'Jedes CH₄ braucht zwei O₂, also brauchen 3 mol Methan 6 mol Sauerstoff (192 g). Die Koeffizienten zählen Moleküle und Mol; die doppelte Masse wären nur 96 g Sauerstoff.') },
  { id: 'i15b', unit: 15, kind: 'choice', format: 'why', evidence: 'explain', withConfidence: true, concepts: ['u15.ratio'], targets: ['coefficients-mass-ratio'],
    prompt: b('2 H₂ + O₂ → 2 H₂O. Why do 4 g of hydrogen burn with 32 g of oxygen, not with 2 g?', '2 H₂ + O₂ → 2 H₂O. Warum verbrennen 4 g Wasserstoff mit 32 g Sauerstoff und nicht mit 2 g?'),
    options: [
      { text: b('The 2 : 1 is the mass ratio, so 4 g of hydrogen needs 2 g of oxygen', 'Das 2 : 1 ist das Massenverhältnis, also brauchen 4 g Wasserstoff 2 g Sauerstoff'), mis: 'coefficients-mass-ratio' },
      { text: b('Oxygen is a gas and must always be added in excess', 'Sauerstoff ist ein Gas und muss immer im Überschuss zugegeben werden') },
      { text: b('Part of the oxygen does not take part in the reaction', 'Ein Teil des Sauerstoffs nimmt an der Reaktion nicht teil') },
      { text: b('The 2 : 1 is a ratio of molecules; an O₂ molecule has about 16 times the mass of an H₂', 'Das 2 : 1 ist ein Verhältnis von Molekülen; ein O₂-Molekül hat etwa die 16-fache Masse eines H₂'), correct: true },
    ],
    explain: b('4 g of hydrogen is 2 mol of H₂, which needs 1 mol of O₂: 32 g. The coefficients count particles; masses follow from the molar masses (2.016 and 32.00 g/mol).',
      '4 g Wasserstoff sind 2 mol H₂, und die brauchen 1 mol O₂: 32 g. Die Koeffizienten zählen Teilchen; die Massen folgen aus den molaren Massen (2,016 und 32,00 g/mol).') },
  { id: 'i15c', unit: 15, kind: 'choice', format: 'predict', evidence: 'transfer', withConfidence: true, concepts: ['u15.ratio', 'u15.compare'], targets: ['ratio-ignored-limiting', 'coefficients-mass-ratio'],
    prompt: b('A camping stove burns 8 g of methane in 24 g of oxygen: CH₄ + 2 O₂ → CO₂ + 2 H₂O (CH₄ 16.04, O₂ 32.00, CO₂ 44.01 g/mol). How much carbon dioxide forms at most?', 'Ein Campingkocher verbrennt 8 g Methan mit 24 g Sauerstoff: CH₄ + 2 O₂ → CO₂ + 2 H₂O (CH₄ 16,04, O₂ 32,00, CO₂ 44,01 g/mol). Wie viel Kohlenstoffdioxid entsteht höchstens?'),
    options: [
      { text: b('22.0 g: 0.50 mol of methane gives 0.50 mol of CO₂', '22,0 g: 0,50 mol Methan ergeben 0,50 mol CO₂'), mis: 'ratio-ignored-limiting' },
      { text: b('16.5 g: 0.75 mol of O₂ burns only 0.375 mol of methane', '16,5 g: 0,75 mol O₂ verbrennen nur 0,375 mol Methan'), correct: true },
      { text: b('33.0 g: 0.75 mol of O₂ gives 0.75 mol of CO₂', '33,0 g: 0,75 mol O₂ ergeben 0,75 mol CO₂') },
      { text: b('32 g: all the methane and oxygen together', '32 g: das ganze Methan und der Sauerstoff zusammen'), mis: 'coefficients-mass-ratio' },
    ],
    explain: b('Methane 0.499 mol ÷ 1, oxygen 0.750 mol ÷ 2 = 0.375: oxygen runs out first. It burns 0.375 mol of methane to 0.375 mol of CO₂, 16.5 g; 2.0 g of methane is left over.',
      'Methan 0,499 mol ÷ 1, Sauerstoff 0,750 mol ÷ 2 = 0,375: Der Sauerstoff ist zuerst aufgebraucht. Er verbrennt 0,375 mol Methan zu 0,375 mol CO₂, 16,5 g; 2,0 g Methan bleiben übrig.') },

  // ---------- u15.limiting ----------
  { id: 'i15d', unit: 15, kind: 'choice', format: 'predict', withConfidence: true, concepts: ['u15.limiting'],
    prompt: b('N₂ + 3 H₂ → 2 NH₃. You start with 2 mol of N₂ and 3 mol of H₂. What happens if you add another 2 mol of N₂?', 'N₂ + 3 H₂ → 2 NH₃. Du beginnst mit 2 mol N₂ und 3 mol H₂. Was passiert, wenn du weitere 2 mol N₂ zugibst?'),
    options: [
      { text: b('Twice as much ammonia forms', 'Es entsteht doppelt so viel Ammoniak') },
      { text: b('A little more ammonia forms', 'Es entsteht etwas mehr Ammoniak') },
      { text: b('No more ammonia forms: hydrogen was already limiting', 'Es entsteht nicht mehr Ammoniak: Der Wasserstoff war schon limitierend'), correct: true },
      { text: b('Less ammonia forms: the nitrogen gets in the way', 'Es entsteht weniger Ammoniak: Der Stickstoff stört') },
    ],
    explain: b('3 mol of H₂ ÷ 3 = 1, against 2 mol of N₂ ÷ 1 = 2: hydrogen runs out first and makes 2 mol of NH₃. Extra nitrogen only adds to the leftover; only more hydrogen would raise the yield.',
      '3 mol H₂ ÷ 3 = 1 gegenüber 2 mol N₂ ÷ 1 = 2: Der Wasserstoff ist zuerst aufgebraucht und ergibt 2 mol NH₃. Mehr Stickstoff vergrößert nur den Rest; nur mehr Wasserstoff würde die Ausbeute erhöhen.') },
  { id: 'i15e', unit: 15, kind: 'choice', format: 'why', evidence: 'explain', withConfidence: true, concepts: ['u15.limiting'], targets: ['less-mass-limiting'],
    prompt: b('Why does the limiting reactant, and not the one in excess, decide how much product forms?', 'Warum bestimmt das limitierende Edukt und nicht das im Überschuss, wie viel Produkt entsteht?'),
    options: [
      { text: b('It is always the one with the smallest mass, so it sets the scale', 'Es ist immer das mit der kleinsten Masse, deshalb gibt es den Maßstab vor'), mis: 'less-mass-limiting' },
      { text: b('The excess reactant slows the reaction down until it stops', 'Das Edukt im Überschuss bremst die Reaktion, bis sie stoppt') },
      { text: b('The limiting reactant reacts faster than the other one', 'Das limitierende Edukt reagiert schneller als das andere') },
      { text: b('Once it is used up, the leftover molecules of the other have nothing to react with', 'Sobald es aufgebraucht ist, finden die übrigen Moleküle des anderen keinen Reaktionspartner mehr'), correct: true },
    ],
    explain: b('Every product molecule needs reactants in the equation\'s ratio. When the limiting reactant runs out, no further set can be made, however much of the other is left. Which one runs out depends on the count of molecules, not on mass.',
      'Jedes Produktmolekül braucht Edukte im Verhältnis der Gleichung. Ist das limitierende Edukt aufgebraucht, lässt sich kein weiterer Satz bilden, egal wie viel vom anderen übrig ist. Welches zuerst aufgebraucht ist, hängt von der Zahl der Moleküle ab, nicht von der Masse.') },
  { id: 'i15f', unit: 15, kind: 'choice', format: 'predict', evidence: 'transfer', withConfidence: true, concepts: ['u15.limiting', 'u15.compare'], targets: ['less-mass-limiting', 'coefficients-mass-ratio'],
    prompt: b('Thermite welds rails: Fe₂O₃ + 2 Al → 2 Fe + Al₂O₃. You mix 100 g of iron oxide with 100 g of aluminium (Fe₂O₃ 159.69, Al 26.98 g/mol). Which runs out first?', 'Mit Thermit schweißt man Schienen: Fe₂O₃ + 2 Al → 2 Fe + Al₂O₃. Du mischst 100 g Eisenoxid mit 100 g Aluminium (Fe₂O₃ 159,69, Al 26,98 g/mol). Welches Edukt ist zuerst aufgebraucht?'),
    options: [
      { text: b('Neither: equal masses react completely', 'Keines: Gleiche Massen reagieren vollständig') },
      { text: b('Aluminium: the equation needs twice as much of it', 'Aluminium: Die Gleichung braucht doppelt so viel davon'), mis: 'coefficients-mass-ratio' },
      { text: b('Iron oxide: 0.626 mol, against 3.71 mol ÷ 2 = 1.85 for aluminium', 'Eisenoxid: 0,626 mol gegenüber 3,71 mol ÷ 2 = 1,85 beim Aluminium'), correct: true },
      { text: b('Aluminium: it is the lighter metal', 'Aluminium: Es ist das leichtere Metall'), mis: 'less-mass-limiting' },
    ],
    explain: b('Equal masses, very different counts: a formula unit of Fe₂O₃ has about six times the mass of an Al atom. The iron oxide runs out first and gives 69.9 g of iron; 66.2 g of aluminium is left over.',
      'Gleiche Massen, sehr verschiedene Anzahlen: Eine Formeleinheit Fe₂O₃ hat etwa die sechsfache Masse eines Al-Atoms. Das Eisenoxid ist zuerst aufgebraucht und ergibt 69,9 g Eisen; 66,2 g Aluminium bleiben übrig.') },

  // ---------- u15.compare ----------
  { id: 'i15g', unit: 15, kind: 'rank', format: 'rank', concepts: ['u15.compare'], targets: ['ratio-ignored-limiting'], mis: 'ratio-ignored-limiting',
    prompt: b('N₂ + 3 H₂ → 2 NH₃, with 2 mol of N₂ and 5 mol of H₂. Put the steps for finding the limiting reactant in order.', 'N₂ + 3 H₂ → 2 NH₃, mit 2 mol N₂ und 5 mol H₂. Bring die Schritte zum Finden des limitierenden Edukts in die richtige Reihenfolge.'),
    order: [
      b('Have both amounts in moles: 2 mol N₂, 5 mol H₂', 'Beide Mengen in Mol angeben: 2 mol N₂, 5 mol H₂'),
      b('Divide each by its coefficient: N₂ 2 ÷ 1 = 2, H₂ 5 ÷ 3 = 1.67', 'Jede durch ihren Koeffizienten teilen: N₂ 2 ÷ 1 = 2, H₂ 5 ÷ 3 = 1,67'),
      b('The smaller result runs out first: hydrogen', 'Der kleinere Wert ist zuerst aufgebraucht: Wasserstoff'),
      b('Hydrogen sets the product: 5 × 2 ÷ 3 = 3.33 mol NH₃', 'Der Wasserstoff legt das Produkt fest: 5 · 2 ÷ 3 = 3,33 mol NH₃'),
    ],
    explain: b('Moles first, then the coefficients, then the smallest result, then the product from the limiting reactant. Comparing 2 mol with 5 mol directly would point at nitrogen, the wrong one.',
      'Erst die Stoffmengen, dann die Koeffizienten, dann der kleinste Wert, dann das Produkt aus dem limitierenden Edukt. Ein direkter Vergleich von 2 mol mit 5 mol würde auf den Stickstoff zeigen, das falsche Edukt.') },
  { id: 'i15h', unit: 15, kind: 'choice', format: 'why', evidence: 'explain', withConfidence: true, concepts: ['u15.compare'], targets: ['less-mass-limiting', 'ratio-ignored-limiting'],
    prompt: b('Why must you divide each amount by its coefficient before comparing, instead of comparing the masses or the moles directly?', 'Warum musst du jede Stoffmenge durch ihren Koeffizienten teilen, bevor du vergleichst, statt die Massen oder Stoffmengen direkt zu vergleichen?'),
    options: [
      { text: b('n ÷ coefficient counts how many times each reactant could run the equation once', 'n ÷ Koeffizient zählt, wie oft jedes Edukt die Gleichung einmal durchlaufen könnte'), correct: true },
      { text: b('It turns the moles back into grams, which is what really counts', 'Damit werden die Mol wieder in Gramm umgerechnet, und auf die kommt es an'), mis: 'less-mass-limiting' },
      { text: b('It does not matter: the reactant with fewer moles always runs out first', 'Das ist egal: Das Edukt mit weniger Mol ist immer zuerst aufgebraucht'), mis: 'ratio-ignored-limiting' },
      { text: b('It corrects for the reactants being at different temperatures', 'Damit gleicht man aus, dass die Edukte verschieden warm sind') },
    ],
    explain: b('A coefficient of 3 means each run of the equation uses three molecules. Dividing by it turns each amount into "runs of the equation it could supply", and the reactant with the fewest runs ends the reaction.',
      'Ein Koeffizient 3 bedeutet: Jeder Durchlauf der Gleichung verbraucht drei Moleküle. Teilt man durch ihn, wird jede Stoffmenge zur Zahl der Durchläufe, die sie liefern könnte, und das Edukt mit den wenigsten Durchläufen beendet die Reaktion.') },
  { id: 'i15i', unit: 15, kind: 'choice', format: 'predict', evidence: 'transfer', withConfidence: true, concepts: ['u15.compare', 'u15.limiting'], targets: ['less-mass-limiting', 'ratio-ignored-limiting'],
    prompt: b('2 Mg + O₂ → 2 MgO. 4 g of magnesium burns in a jar with 4 g of oxygen (Mg 24.31, O₂ 32.00 g/mol). Which runs out first?', '2 Mg + O₂ → 2 MgO. 4 g Magnesium verbrennen in einem Glas mit 4 g Sauerstoff (Mg 24,31, O₂ 32,00 g/mol). Welches Edukt ist zuerst aufgebraucht?'),
    options: [
      { text: b('Oxygen: 0.125 mol is less than 0.165 mol of magnesium', 'Sauerstoff: 0,125 mol sind weniger als 0,165 mol Magnesium'), mis: 'ratio-ignored-limiting' },
      { text: b('Magnesium: 0.165 mol ÷ 2 = 0.082 is less than 0.125 mol ÷ 1 for oxygen', 'Magnesium: 0,165 mol ÷ 2 = 0,082 sind weniger als 0,125 mol ÷ 1 beim Sauerstoff'), correct: true },
      { text: b('Neither: equal masses burn completely', 'Keines: Gleiche Massen verbrennen vollständig'), mis: 'less-mass-limiting' },
      { text: b('Oxygen: it is a gas and escapes', 'Sauerstoff: Er ist ein Gas und entweicht') },
    ],
    explain: b('Two Mg for each O₂: magnesium gives 0.165 ÷ 2 = 0.082, oxygen 0.125 ÷ 1. Magnesium runs out first, making 6.63 g of MgO, and 1.37 g of oxygen is left over. Comparing the moles without the coefficients points the wrong way.',
      'Zwei Mg auf jedes O₂: Magnesium ergibt 0,165 ÷ 2 = 0,082, Sauerstoff 0,125 ÷ 1. Das Magnesium ist zuerst aufgebraucht und ergibt 6,63 g MgO, und 1,37 g Sauerstoff bleiben übrig. Ein Vergleich der Stoffmengen ohne Koeffizienten zeigt in die falsche Richtung.') },

  // ---------- u15.theoretical ----------
  { id: 'i15j', unit: 15, kind: 'choice', format: 'predict', withConfidence: true, concepts: ['u15.theoretical', 'u15.compare'], targets: ['ratio-ignored-limiting'],
    prompt: b('Propane burns: C₃H₈ + 5 O₂ → 3 CO₂ + 4 H₂O. 44 g of propane (1.00 mol) meets 128 g of oxygen (4.00 mol). What is the theoretical yield of CO₂ (44.01 g/mol)?', 'Propan verbrennt: C₃H₈ + 5 O₂ → 3 CO₂ + 4 H₂O. 44 g Propan (1,00 mol) treffen auf 128 g Sauerstoff (4,00 mol). Wie groß ist die theoretische Ausbeute an CO₂ (44,01 g/mol)?'),
    options: [
      { text: b('132 g: 1.00 mol of propane gives 3 mol of CO₂', '132 g: 1,00 mol Propan ergibt 3 mol CO₂'), mis: 'ratio-ignored-limiting' },
      { text: b('106 g: oxygen limits, 4.00 ÷ 5 = 0.80, and that gives 2.40 mol of CO₂', '106 g: Der Sauerstoff limitiert, 4,00 ÷ 5 = 0,80, und das ergibt 2,40 mol CO₂'), correct: true },
      { text: b('35 g: oxygen limits, so 0.80 mol of CO₂ forms', '35 g: Der Sauerstoff limitiert, also entstehen 0,80 mol CO₂') },
      { text: b('172 g: all the propane and oxygen together', '172 g: das ganze Propan und der Sauerstoff zusammen') },
    ],
    explain: b('Propane 1.00 ÷ 1, oxygen 4.00 ÷ 5 = 0.80: oxygen runs out first. 0.80 runs of the equation make 3 × 0.80 = 2.40 mol of CO₂, 105.6 g, the most this mix can give.',
      'Propan 1,00 ÷ 1, Sauerstoff 4,00 ÷ 5 = 0,80: Der Sauerstoff ist zuerst aufgebraucht. 0,80 Durchläufe der Gleichung ergeben 3 · 0,80 = 2,40 mol CO₂, 105,6 g, das Höchste, was diese Mischung liefern kann.') },
  { id: 'i15k', unit: 15, kind: 'choice', format: 'why', evidence: 'explain', withConfidence: true, concepts: ['u15.theoretical'], targets: ['ratio-ignored-limiting'],
    prompt: b('Why is the theoretical yield worked out from the limiting reactant and not from the reactant in excess?', 'Warum berechnet man die theoretische Ausbeute aus dem limitierenden Edukt und nicht aus dem Edukt im Überschuss?'),
    options: [
      { text: b('The excess reactant does not take part in the reaction at all', 'Das Edukt im Überschuss nimmt gar nicht an der Reaktion teil') },
      { text: b('Any reactant gives the same answer, so it does not matter', 'Jedes Edukt ergibt dieselbe Antwort, es ist also egal'), mis: 'ratio-ignored-limiting' },
      { text: b('The limiting reactant is always given in grams', 'Das limitierende Edukt ist immer in Gramm angegeben') },
      { text: b('The excess reactant could make more product than the limiting one allows', 'Das Edukt im Überschuss könnte mehr Produkt ergeben, als das limitierende zulässt'), correct: true },
    ],
    explain: b('Worked out from each reactant, you get two different amounts of product; only the smaller one can actually form, because then the limiting reactant is gone. Part of the excess reactant does react; the rest is left over.',
      'Rechnet man von jedem Edukt aus, kommen zwei verschiedene Produktmengen heraus; nur die kleinere kann wirklich entstehen, denn dann ist das limitierende Edukt verbraucht. Ein Teil des Edukts im Überschuss reagiert durchaus; der Rest bleibt übrig.') },
  { id: 'i15l', unit: 15, kind: 'estimate', format: 'estimate', evidence: 'transfer', concepts: ['u15.theoretical'],
    prompt: b('A lime kiln heats limestone: CaCO₃ → CaO + CO₂ (CaCO₃ 100.09, CaO 56.08 g/mol). Estimate the theoretical yield of quicklime, CaO, from 1000 kg of pure limestone. (Moles of CaCO₃ = moles of CaO.)', 'Ein Kalkofen brennt Kalkstein: CaCO₃ → CaO + CO₂ (CaCO₃ 100,09, CaO 56,08 g/mol). Schätze die theoretische Ausbeute an Branntkalk, CaO, aus 1000 kg reinem Kalkstein. (Stoffmenge CaCO₃ = Stoffmenge CaO.)'),
    min: 0, max: 1200, step: 10, answer: 560, tolerance: 10, suffix: ' kg',
    near: [{ value: 1000, tol: 10, note: b('1000 kg would mean no mass leaves. The CO₂ escapes as a gas: 440 kg of the 1000 kg.', '1000 kg würde bedeuten, dass keine Masse entweicht. Das CO₂ entweicht als Gas: 440 kg der 1000 kg.') }],
    explain: b('1000 kg ÷ 100.09 kg/kmol = 9.99 kmol of CaCO₃ gives 9.99 kmol of CaO × 56.08 = 560 kg. The other 440 kg leaves the kiln as carbon dioxide.',
      '1000 kg ÷ 100,09 kg/kmol = 9,99 kmol CaCO₃ ergeben 9,99 kmol CaO · 56,08 = 560 kg. Die übrigen 440 kg verlassen den Ofen als Kohlenstoffdioxid.') },

  // ---------- u15.percent ----------
  { id: 'i15m', unit: 15, kind: 'choice', format: 'predict', withConfidence: true, concepts: ['u15.percent'],
    prompt: b('A class experiment could make 8.0 g of product at most. The class collects 6.4 g. What is the percent yield?', 'Ein Schulversuch könnte höchstens 8,0 g Produkt ergeben. Die Klasse gewinnt 6,4 g. Wie groß ist die Ausbeute in Prozent?'),
    options: [
      { text: b('125 %', '125 %') },
      { text: b('20 %', '20 %') },
      { text: b('64 %', '64 %') },
      { text: b('80 %', '80 %'), correct: true },
    ],
    explain: b('Percent yield = actual ÷ theoretical × 100 % = 6.4 ÷ 8.0 × 100 % = 80 %. Dividing the other way round (125 %) would claim more product than the reactants can make.',
      'Ausbeute in Prozent = tatsächliche ÷ theoretische Menge · 100 % = 6,4 ÷ 8,0 · 100 % = 80 %. Andersherum geteilt (125 %) würde mehr Produkt behaupten, als die Edukte ergeben können.') },
  { id: 'i15n', unit: 15, kind: 'choice', format: 'why', evidence: 'explain', withConfidence: true, concepts: ['u15.percent'],
    prompt: b('A student reports a percent yield of 112 % for a salt she dried on a filter paper. What is the most likely reason?', 'Eine Schülerin gibt für ein Salz, das sie auf einem Filterpapier getrocknet hat, eine Ausbeute von 112 % an. Was ist der wahrscheinlichste Grund?'),
    options: [
      { text: b('The reaction made extra atoms', 'Die Reaktion hat zusätzliche Atome erzeugt') },
      { text: b('The product was still wet or impure when it was weighed', 'Das Produkt war beim Wiegen noch feucht oder verunreinigt'), correct: true },
      { text: b('She used the reactant in excess', 'Sie hat das Edukt im Überschuss eingesetzt') },
      { text: b('Yields above 100 % are normal for salts', 'Ausbeuten über 100 % sind bei Salzen normal') },
    ],
    explain: b('Atoms are not created, so a clean, dry product can never exceed the theoretical yield. Water or other substances weighed along with it make it look heavier. An excess of one reactant changes nothing: the yield is worked out from the limiting one.',
      'Atome entstehen nicht neu, also kann ein sauberes, trockenes Produkt die theoretische Ausbeute nie übersteigen. Wasser oder andere Stoffe, die mitgewogen werden, lassen es schwerer erscheinen. Ein Überschuss eines Edukts ändert nichts: Die Ausbeute wird aus dem limitierenden berechnet.') },
  { id: 'i15o', unit: 15, kind: 'estimate', format: 'estimate', evidence: 'transfer', concepts: ['u15.percent', 'u15.theoretical'],
    prompt: b('0.48 g of magnesium ribbon is burned in a crucible: 2 Mg + O₂ → 2 MgO (Mg 24.31, MgO 40.30 g/mol). 0.70 g of white oxide is collected. Work out the theoretical yield, then estimate the percent yield.', '0,48 g Magnesiumband werden in einem Tiegel verbrannt: 2 Mg + O₂ → 2 MgO (Mg 24,31, MgO 40,30 g/mol). Man gewinnt 0,70 g weißes Oxid. Berechne die theoretische Ausbeute und schätze dann die Ausbeute in Prozent.'),
    min: 0, max: 160, step: 1, answer: 88, tolerance: 2, suffix: ' %',
    near: [{ value: 146, tol: 2, note: b('About 146 % compares the oxide with the magnesium. Compare it with the oxide that 0.48 g of magnesium could make, 0.796 g.', 'Etwa 146 % vergleicht das Oxid mit dem Magnesium. Vergleiche es mit dem Oxid, das 0,48 g Magnesium ergeben könnten: 0,796 g.') }],
    explain: b('0.48 g ÷ 24.31 g/mol = 0.0197 mol of Mg gives 0.0197 mol of MgO × 40.30 = 0.796 g, the theoretical yield. 0.70 ÷ 0.796 × 100 % ≈ 88 %: some oxide escaped as smoke, or some magnesium did not burn.',
      '0,48 g ÷ 24,31 g/mol = 0,0197 mol Mg ergeben 0,0197 mol MgO · 40,30 = 0,796 g, die theoretische Ausbeute. 0,70 ÷ 0,796 · 100 % ≈ 88 %: Etwas Oxid ist als Rauch entwichen, oder etwas Magnesium ist nicht verbrannt.') },

  // ---------- u15.excess ----------
  { id: 'i15p', unit: 15, kind: 'choice', format: 'predict', withConfidence: true, concepts: ['u15.excess'],
    prompt: b('A school book heats copper with sulfur to make copper sulfide, and adds more sulfur than the equation needs. What is the point?', 'Ein Schulbuch erhitzt Kupfer mit Schwefel zu Kupfersulfid und gibt mehr Schwefel zu, als die Gleichung braucht. Wozu?'),
    options: [
      { text: b('So that all the copper is sure to react; the leftover sulfur is burned off afterwards', 'Damit sicher alles Kupfer reagiert; der übrige Schwefel wird danach abgebrannt'), correct: true },
      { text: b('So that more copper sulfide forms than the copper allows', 'Damit mehr Kupfersulfid entsteht, als das Kupfer zulässt') },
      { text: b('Because sulfur is the limiting reactant', 'Weil Schwefel das limitierende Edukt ist') },
      { text: b('So that the reaction needs less heat', 'Damit die Reaktion weniger Wärme braucht') },
    ],
    explain: b('With sulfur in excess, copper is the limiting reactant and is used up completely. The leftover sulfur burns off as gaseous SO₂, so only copper sulfide stays behind. The product is still capped by the copper.',
      'Mit Schwefel im Überschuss ist das Kupfer das limitierende Edukt und wird ganz verbraucht. Der übrige Schwefel verbrennt zu gasförmigem SO₂, sodass nur Kupfersulfid zurückbleibt. Die Produktmenge bleibt durch das Kupfer begrenzt.') },
  { id: 'i15q', unit: 15, kind: 'choice', format: 'why', evidence: 'explain', withConfidence: true, concepts: ['u15.excess'], targets: ['less-mass-limiting'],
    prompt: b('Industry often puts the cheaper reactant in excess. Why?', 'Die Industrie setzt oft das billigere Edukt im Überschuss ein. Warum?'),
    options: [
      { text: b('An excess raises the theoretical yield above what the costly reactant allows', 'Ein Überschuss hebt die theoretische Ausbeute über das, was das teure Edukt zulässt') },
      { text: b('More of the costly reactant gets used up, and losing some of the cheap one costs little', 'Vom teuren Edukt wird mehr verbraucht, und ein Verlust des billigen kostet wenig'), correct: true },
      { text: b('The cheaper reactant is always the lighter one', 'Das billigere Edukt ist immer das leichtere'), mis: 'less-mass-limiting' },
      { text: b('An excess makes the coefficients bigger', 'Ein Überschuss macht die Koeffizienten größer') },
    ],
    explain: b('The costly reactant becomes the limiting one and as little of it as possible is wasted. The excess cannot make more product than the limiting reactant allows, and it costs something too: in an ammonia plant extra gas only takes up reactor space, so there the feed keeps the equation\'s 1 : 3.',
      'Das teure Edukt wird zum limitierenden, und möglichst wenig davon geht verloren. Der Überschuss kann nicht mehr Produkt ergeben, als das limitierende Edukt zulässt, und er hat seinen Preis: In einer Ammoniakanlage nimmt zusätzliches Gas nur Platz im Reaktor weg, deshalb bleibt der Zulauf dort beim Verhältnis 1 : 3 der Gleichung.') },
  { id: 'i15r', unit: 15, kind: 'choice', format: 'predict', evidence: 'transfer', withConfidence: true, concepts: ['u15.excess', 'u15.compare'], targets: ['less-mass-limiting', 'coefficients-mass-ratio'],
    prompt: b('A hydrogen–oxygen rocket engine is fed 5 kg of oxygen for every 1 kg of hydrogen. The equation needs 7.94 kg of oxygen per kilogram of hydrogen. What leaves the nozzle besides water?', 'Ein Wasserstoff-Sauerstoff-Raketentriebwerk erhält 5 kg Sauerstoff auf jedes Kilogramm Wasserstoff. Die Gleichung braucht 7,94 kg Sauerstoff pro Kilogramm Wasserstoff. Was verlässt die Düse außer Wasser?'),
    options: [
      { text: b('Unburned oxygen: there is five times more of it', 'Unverbrannter Sauerstoff: Davon ist fünfmal mehr da'), mis: 'less-mass-limiting' },
      { text: b('Unburned hydrogen: oxygen runs out first and limits the burn', 'Unverbrannter Wasserstoff: Der Sauerstoff ist zuerst aufgebraucht und limitiert die Verbrennung'), correct: true },
      { text: b('Nothing: 5 : 1 is close enough to 2 : 1', 'Nichts: 5 : 1 liegt nah genug an 2 : 1'), mis: 'coefficients-mass-ratio' },
      { text: b('Both gases, in equal amounts', 'Beide Gase, in gleichen Mengen') },
    ],
    explain: b('5 kg of oxygen is less than the 7.94 kg that 1 kg of hydrogen needs, so oxygen is limiting and hydrogen is in excess: 5 ÷ 7.94 = 63 % of the hydrogen burns. Engines do this on purpose: the light, unburned hydrogen leaves the nozzle fast and gives more thrust per kilogram of propellant.',
      '5 kg Sauerstoff sind weniger als die 7,94 kg, die 1 kg Wasserstoff braucht, also limitiert der Sauerstoff, und der Wasserstoff liegt im Überschuss vor: 5 ÷ 7,94 = 63 % des Wasserstoffs verbrennen. Triebwerke machen das absichtlich: Der leichte, unverbrannte Wasserstoff strömt schnell aus der Düse und bringt mehr Schub pro Kilogramm Treibstoff.') },
];
