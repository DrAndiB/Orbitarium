// Review bank for unit 20 (written by the unit helper; see docs/process/authoring.md).
// Every value from thermo.ts (dH, dS, dG, crossover; OpenStax Chemistry 2e Appendix G, calcite from the CRC Handbook,
// ice and water at their own temperatures from OpenStax section 10.3). ΔG = ΔH − T·ΔS/1000 in kJ/mol.
// ice-melt +6.01 / +22.0: ΔG(263) +0.22, ΔG(283) −0.22, ΔG(298) −0.55; hcl −184.6 / +20.0: ΔG(298) −190.6;
// c-co −110.5 / +89.4: ΔG(298) −137.1; caco3 +179.2 / +160.2: ΔG(298) +131, 1119 K (model value; measured about 898 °C, source in unit20.ts); c2h5oh-burn −1366.9 / −138.7:
// ΔG(298) −1325.6; water-boil +44.0 / +118.8: 370 K; water-boil-100 +40.65 / +108.9: 373 K; ethene-h2 −136.4 /
// −120.8: 1129 K (856 °C); no2-dimer −55.3 / −175.8: 315 K; nh3 −91.8 / −198.1: 463 K; h2o2 −196.1 / +126.0:
// ΔG(298) −234; h2-burn-l ΔG(298) −474; diamond-graphite ΔG(298) −2.9.
// Diamond → graphite too slow to notice: Chemistry Student, IB notes "Interpreting ΔG and temperature effects" (fetched).
import type { Bi } from '../../i18n';
import type { Item } from '../items';

const b = (en: string, de: string): Bi => ({ en, de });

export const BANK_U20: Item[] = [
  // ---------- u20.gibbs ----------
  { id: 'i20a', unit: 20, kind: 'choice', format: 'predict', withConfidence: true, concepts: ['u20.gibbs'], targets: ['units-j-kj'],
    prompt: b('Ice melting: ΔH = +6.01 kJ/mol, ΔS = +22.0 J/(mol·K). What is ΔG at 25 °C (298 K)?', 'Eis schmilzt: ΔH = +6,01 kJ/mol, ΔS = +22,0 J/(mol·K). Wie groß ist ΔG bei 25 °C (298 K)?'),
    options: [
      { text: b('+12.57 kJ/mol', '+12,57 kJ/mol') },
      { text: b('−0.55 kJ/mol', '−0,55 kJ/mol'), correct: true },
      { text: b('−6550 kJ/mol', '−6550 kJ/mol'), mis: 'units-j-kj' },
      { text: b('+6.01 kJ/mol', '+6,01 kJ/mol') },
    ],
    explain: b('Convert ΔS to kJ/(mol·K) first: 0.0220 kJ/(mol·K). ΔG = 6.01 − 298 × 0.0220 = 6.01 − 6.56 = −0.55 kJ/mol: just below zero, so at 25 °C ice can melt by itself. −6550 comes from using 22.0 J as if it were kJ; +12.57 adds the entropy term instead of subtracting it.',
      'Rechne ΔS zuerst in kJ/(mol·K) um: 0,0220 kJ/(mol·K). ΔG = 6,01 − 298 · 0,0220 = 6,01 − 6,56 = −0,55 kJ/mol: knapp unter null, also kann Eis bei 25 °C freiwillig schmelzen. −6550 entsteht, wenn man 22,0 J wie kJ verwendet; +12,57 addiert den Entropieterm, statt ihn abzuziehen.') },
  { id: 'i20b', unit: 20, kind: 'choice', format: 'why', evidence: 'explain', withConfidence: true, concepts: ['u20.gibbs'], targets: ['spontaneous-exothermic'],
    prompt: b('ΔG = ΔH − T·ΔS. Why does whether a reaction can run by itself depend on both ΔH and ΔS?', 'ΔG = ΔH − T·ΔS. Warum hängt es von ΔH und von ΔS ab, ob eine Reaktion freiwillig ablaufen kann?'),
    options: [
      { text: b('Only ΔH really decides; ΔS is just a small correction to it', 'Eigentlich entscheidet nur ΔH; ΔS ist nur eine kleine Korrektur dazu'), mis: 'spontaneous-exothermic' },
      { text: b('ΔS is the energy needed to start it, ΔH the energy given out', 'ΔS ist die Energie zum Starten, ΔH die abgegebene Energie') },
      { text: b('ΔH sets the entropy change of the surroundings, ΔS that of the substances', 'ΔH bestimmt die Entropieänderung der Umgebung, ΔS die der Stoffe selbst'), correct: true },
      { text: b('ΔH says whether it can run at all, ΔS how far it gets', 'ΔH gibt an, ob sie überhaupt ablaufen kann, ΔS, wie weit sie kommt') },
    ],
    explain: b('What decides is whether the total entropy rises. Energy given out as heat spreads into the surroundings and raises their entropy (unit 19); ΔS is the change in the substances themselves. ΔG weighs both; for melting ice or burning limestone the ΔS part wins when it is warm enough, so ΔH alone cannot decide.',
      'Entscheidend ist, ob die Entropie insgesamt steigt. Als Wärme abgegebene Energie verteilt sich in der Umgebung und erhöht deren Entropie (Einheit 19); ΔS ist die Änderung der Stoffe selbst. ΔG wägt beides ab; beim Schmelzen von Eis oder beim Kalkbrennen gewinnt der ΔS-Anteil, wenn es warm genug ist, also kann ΔH allein nicht entscheiden.') },
  { id: 'i20c', unit: 20, kind: 'choice', format: 'predict', evidence: 'transfer', withConfidence: true, concepts: ['u20.gibbs'], targets: ['units-j-kj'],
    prompt: b('Hydrogen and chlorine form hydrogen chloride: H₂ + Cl₂ → 2 HCl, ΔH = −184.6 kJ/mol, ΔS = +20.0 J/(mol·K). What is ΔG at 298 K?', 'Wasserstoff und Chlor bilden Chlorwasserstoff: H₂ + Cl₂ → 2 HCl, ΔH = −184,6 kJ/mol, ΔS = +20,0 J/(mol·K). Wie groß ist ΔG bei 298 K?'),
    options: [
      { text: b('−178.6 kJ/mol', '−178,6 kJ/mol') },
      { text: b('−6144.6 kJ/mol', '−6144,6 kJ/mol'), mis: 'units-j-kj' },
      { text: b('−184.6 kJ/mol', '−184,6 kJ/mol') },
      { text: b('−190.6 kJ/mol', '−190,6 kJ/mol'), correct: true },
    ],
    explain: b('ΔS = 0.0200 kJ/(mol·K), so ΔG = −184.6 − 298 × 0.0200 = −184.6 − 6.0 = −190.6 kJ/mol. A positive ΔS makes ΔG more negative than ΔH; −178.6 has the entropy term with the wrong sign.',
      'ΔS = 0,0200 kJ/(mol·K), also ΔG = −184,6 − 298 · 0,0200 = −184,6 − 6,0 = −190,6 kJ/mol. Ein positives ΔS macht ΔG negativer als ΔH; bei −178,6 hat der Entropieterm das falsche Vorzeichen.') },
  { id: 'i20d', unit: 20, kind: 'estimate', format: 'estimate', evidence: 'transfer', concepts: ['u20.gibbs', 'u20.sign'], targets: ['units-j-kj'],
    prompt: b('Carbon burning in little oxygen: C + ½ O₂ → CO, ΔH = −110.5 kJ/mol, ΔS = +89.4 J/(mol·K). Calculate ΔG at 25 °C (298 K).', 'Kohlenstoff verbrennt bei wenig Sauerstoff: C + ½ O₂ → CO, ΔH = −110,5 kJ/mol, ΔS = +89,4 J/(mol·K). Berechne ΔG bei 25 °C (298 K).'),
    min: -300, max: 100, step: 0.1, answer: -137.1, tolerance: 1.5, suffix: ' kJ/mol',
    near: [
      { value: -83.9, tol: 1.5, note: b('The entropy term has the wrong sign: ΔG = ΔH − T·ΔS, and with ΔS > 0 that makes ΔG more negative than ΔH.', 'Der Entropieterm hat das falsche Vorzeichen: ΔG = ΔH − T·ΔS, und mit ΔS > 0 wird ΔG negativer als ΔH.') },
      { value: -110.5, tol: 1, note: b('That is ΔH alone. Add the entropy term: −T·ΔS = −298 × 0.0894 kJ/(mol·K).', 'Das ist nur ΔH. Rechne den Entropieterm dazu: −T·ΔS = −298 · 0,0894 kJ/(mol·K).') },
    ],
    explain: b('ΔG = −110.5 − 298 × 0.0894 = −110.5 − 26.6 = −137.1 kJ/mol: exergonic. With ΔH < 0 and ΔS > 0 it is exergonic at every temperature.',
      'ΔG = −110,5 − 298 · 0,0894 = −110,5 − 26,6 = −137,1 kJ/mol: exergonisch. Mit ΔH < 0 und ΔS > 0 ist die Reaktion bei jeder Temperatur exergonisch.') },

  // ---------- u20.sign ----------
  { id: 'i20e', unit: 20, kind: 'choice', format: 'predict', withConfidence: true, concepts: ['u20.sign'], targets: ['negative-dg-fast'],
    prompt: b('At 25 °C, burning limestone (CaCO₃ → CaO + CO₂) has ΔG = +131 kJ/mol. What does that tell you?', 'Bei 25 °C hat das Kalkbrennen (CaCO₃ → CaO + CO₂) ein ΔG von +131 kJ/mol. Was sagt dir das?'),
    options: [
      { text: b('It runs by itself, but only very slowly', 'Es läuft freiwillig ab, aber nur sehr langsam'), mis: 'negative-dg-fast' },
      { text: b('It runs by itself and gives out 131 kJ/mol', 'Es läuft freiwillig ab und gibt 131 kJ/mol ab') },
      { text: b('At 25 °C it cannot run by itself: it is endergonic', 'Bei 25 °C kann es nicht freiwillig ablaufen: Es ist endergonisch'), correct: true },
      { text: b('It gives out 131 kJ/mol of heat to the surroundings', 'Es gibt 131 kJ/mol Wärme an die Umgebung ab') },
    ],
    explain: b('ΔG > 0: at 25 °C and 1 bar of CO₂ limestone does not decompose by itself, however long you wait (almost only CaCO₃ is left at equilibrium); the reverse, quicklime taking up CO₂, can. Slowness is a different question, and the heat exchanged is ΔH, not ΔG.',
      'ΔG > 0: Bei 25 °C und 1 bar CO₂ zerfällt Kalkstein nicht freiwillig, egal wie lange man wartet (im Gleichgewicht bleibt fast nur CaCO₃ übrig); die Rückreaktion, Branntkalk nimmt CO₂ auf, kann es. Langsamkeit ist eine andere Frage, und die ausgetauschte Wärme ist ΔH, nicht ΔG.') },
  { id: 'i20f', unit: 20, kind: 'choice', format: 'why', evidence: 'explain', withConfidence: true, concepts: ['u20.sign'], targets: ['spontaneous-exothermic', 'negative-dg-fast'],
    prompt: b('Why does ΔG < 0 mean that a reaction can run by itself?', 'Warum bedeutet ΔG < 0, dass eine Reaktion freiwillig ablaufen kann?'),
    options: [
      { text: b('The entropy of the substances and surroundings together rises', 'Die Entropie von Stoffen und Umgebung zusammen steigt'), correct: true },
      { text: b('The products hold less energy than the reactants did', 'Die Produkte enthalten weniger Energie als vorher die Edukte'), mis: 'spontaneous-exothermic' },
      { text: b('The reaction is fast enough for you to notice it', 'Die Reaktion ist schnell genug, dass man sie bemerkt'), mis: 'negative-dg-fast' },
      { text: b('Heat flows into the substances from the surroundings', 'Wärme fließt aus der Umgebung in die Stoffe hinein') },
    ],
    explain: b('−ΔG ÷ T is the entropy gained by the substances and the surroundings together, and things run by themselves when that total rises (unit 19). Lower energy alone (ΔH < 0) is not enough, as NO₂ pairing at 100 °C shows, and ΔG says nothing about speed.',
      '−ΔG : T ist die Entropie, die Stoffe und Umgebung zusammen gewinnen, und Vorgänge laufen freiwillig ab, wenn diese Summe steigt (Einheit 19). Weniger Energie allein (ΔH < 0) reicht nicht, wie die Verbindung von NO₂ bei 100 °C zeigt, und über die Geschwindigkeit sagt ΔG nichts.') },
  { id: 'i20g', unit: 20, kind: 'choice', format: 'predict', evidence: 'transfer', withConfidence: true, concepts: ['u20.sign', 'u20.gibbs'], targets: ['units-j-kj', 'negative-dg-fast'],
    prompt: b('Ethanol burns: C₂H₅OH + 3 O₂ → 2 CO₂ + 3 H₂O(l), ΔH = −1366.9 kJ/mol, ΔS = −138.7 J/(mol·K). At 25 °C, is it exergonic or endergonic?', 'Ethanol verbrennt: C₂H₅OH + 3 O₂ → 2 CO₂ + 3 H₂O(l), ΔH = −1366,9 kJ/mol, ΔS = −138,7 J/(mol·K). Ist die Reaktion bei 25 °C exergonisch oder endergonisch?'),
    options: [
      { text: b('Endergonic: ΔS < 0, so it cannot run by itself', 'Endergonisch: ΔS < 0, also kann sie nicht freiwillig ablaufen') },
      { text: b('Endergonic: −1366.9 + 298 × 138.7 ≈ +39 966 kJ/mol', 'Endergonisch: −1366,9 + 298 · 138,7 ≈ +39 966 kJ/mol'), mis: 'units-j-kj' },
      { text: b('Exergonic: ΔG ≈ −1326 kJ/mol, so it can run by itself', 'Exergonisch: ΔG ≈ −1326 kJ/mol, also kann sie freiwillig ablaufen'), correct: true },
      { text: b('Neither: it needs a flame, so ΔG cannot be negative', 'Keins von beiden: Sie braucht eine Flamme, also kann ΔG nicht negativ sein'), mis: 'negative-dg-fast' },
    ],
    explain: b('ΔG = −1366.9 + 298 × 0.1387 = −1366.9 + 41.3 = −1325.6 kJ/mol: exergonic. The falling entropy costs only 41 kJ/mol, while 1367 kJ/mol are given out. Needing a flame to start is about speed, not about ΔG.',
      'ΔG = −1366,9 + 298 · 0,1387 = −1366,9 + 41,3 = −1325,6 kJ/mol: exergonisch. Die sinkende Entropie kostet nur 41 kJ/mol; abgegeben werden 1367 kJ/mol. Dass eine Flamme sie starten muss, betrifft die Geschwindigkeit, nicht ΔG.') },

  // ---------- u20.temperature ----------
  { id: 'i20h', unit: 20, kind: 'choice', format: 'predict', withConfidence: true, concepts: ['u20.temperature'], targets: ['t-irrelevant'],
    prompt: b('Ice melting: ΔH = +6.01 kJ/mol, ΔS = +22.0 J/(mol·K). What happens to ΔG as you warm the ice from 263 K to 283 K?', 'Eis schmilzt: ΔH = +6,01 kJ/mol, ΔS = +22,0 J/(mol·K). Was passiert mit ΔG, wenn du das Eis von 263 K auf 283 K erwärmst?'),
    options: [
      { text: b('It stays the same: temperature does not enter it', 'Es bleibt gleich: Die Temperatur geht nicht ein'), mis: 't-irrelevant' },
      { text: b('It rises: warmer ice is harder to melt', 'Es steigt: Wärmeres Eis schmilzt schwerer') },
      { text: b('It falls, but only the speed of melting changes', 'Es sinkt, aber nur die Geschwindigkeit des Schmelzens ändert sich'), mis: 't-irrelevant' },
      { text: b('It falls from +0.22 to −0.22 kJ/mol and changes sign', 'Es sinkt von +0,22 auf −0,22 kJ/mol und wechselt das Vorzeichen'), correct: true },
    ],
    explain: b('ΔG(263 K) = 6.01 − 263 × 0.0220 = +0.22 kJ/mol; ΔG(283 K) = 6.01 − 283 × 0.0220 = −0.22 kJ/mol. The sign flips at 273 K: below it ice cannot melt by itself, above it it can.',
      'ΔG(263 K) = 6,01 − 263 · 0,0220 = +0,22 kJ/mol; ΔG(283 K) = 6,01 − 283 · 0,0220 = −0,22 kJ/mol. Bei 273 K wechselt das Vorzeichen: Darunter kann Eis nicht freiwillig schmelzen, darüber schon.') },
  { id: 'i20i', unit: 20, kind: 'choice', format: 'why', evidence: 'explain', withConfidence: true, concepts: ['u20.temperature'], targets: ['t-irrelevant'],
    prompt: b('Heating helps limestone decompose but stops NO₂ pairing up into N₂O₄. Why does temperature work in opposite directions?', 'Erhitzen hilft beim Zerfall von Kalkstein, verhindert aber, dass sich NO₂ zu N₂O₄ verbindet. Warum wirkt die Temperatur in entgegengesetzte Richtungen?'),
    options: [
      { text: b('−T·ΔS grows with T: with ΔS > 0 it pulls ΔG down, with ΔS < 0 it pushes ΔG up', '−T·ΔS wächst mit T: Mit ΔS > 0 senkt es ΔG, mit ΔS < 0 hebt es ΔG an'), correct: true },
      { text: b('Heat only changes how fast reactions go, never which way they can run', 'Wärme ändert nur, wie schnell Reaktionen laufen, nie, in welche Richtung sie können'), mis: 't-irrelevant' },
      { text: b('Heating turns endothermic reactions into exothermic ones', 'Erhitzen macht aus endothermen Reaktionen exotherme') },
      { text: b('ΔH grows with temperature for one reaction and shrinks for the other', 'ΔH wächst bei der einen Reaktion mit der Temperatur und schrumpft bei der anderen') },
    ],
    explain: b('In ΔG = ΔH − T·ΔS, T multiplies ΔS. Limestone has ΔS = +160.2 J/(mol·K), so heating makes ΔG more negative; NO₂ pairing has ΔS = −175.8 J/(mol·K), so heating makes ΔG more positive.',
      'In ΔG = ΔH − T·ΔS wird ΔS mit T multipliziert. Kalkstein hat ΔS = +160,2 J/(mol·K), also wird ΔG beim Erhitzen negativer; die Verbindung von NO₂ hat ΔS = −175,8 J/(mol·K), also wird ΔG beim Erhitzen positiver.') },
  { id: 'i20j', unit: 20, kind: 'choice', format: 'predict', evidence: 'transfer', withConfidence: true, concepts: ['u20.temperature', 'u20.four-cases'], targets: ['t-irrelevant'],
    prompt: b('Water vapour condensing: H₂O(g) → H₂O(l), ΔH = −44.0 kJ/mol, ΔS = −118.8 J/(mol·K) (25 °C data). Steam condenses on a cold window. Which statement fits?', 'Wasserdampf kondensiert: H₂O(g) → H₂O(l), ΔH = −44,0 kJ/mol, ΔS = −118,8 J/(mol·K) (Daten bei 25 °C). Dampf kondensiert an einer kalten Scheibe. Welche Aussage passt?'),
    options: [
      { text: b('ΔG < 0 at every temperature, because condensing gives out energy', 'ΔG < 0 bei jeder Temperatur, weil beim Kondensieren Energie frei wird'), mis: 't-irrelevant' },
      { text: b('ΔG < 0 below about 370 K: cool vapour condenses by itself, hot vapour does not', 'ΔG < 0 unter etwa 370 K: Kühler Dampf kondensiert freiwillig, heißer nicht'), correct: true },
      { text: b('ΔG < 0 only above about 370 K, because heat speeds condensing up', 'ΔG < 0 nur über etwa 370 K, weil Wärme das Kondensieren beschleunigt') },
      { text: b('ΔG > 0 at every temperature, because the entropy falls', 'ΔG > 0 bei jeder Temperatur, weil die Entropie sinkt') },
    ],
    explain: b('ΔH < 0 and ΔS < 0: the case that runs only when cold enough. ΔG = 0 at 44.0 ÷ 0.1188 = 370 K (measured boiling point 373 K): below it vapour condenses by itself, above it water evaporates.',
      'ΔH < 0 und ΔS < 0: der Fall, der nur bei genügend tiefer Temperatur abläuft. ΔG = 0 bei 44,0 : 0,1188 = 370 K (gemessene Siedetemperatur 373 K): Darunter kondensiert Dampf freiwillig, darüber verdampft Wasser.') },

  // ---------- u20.crossover ----------
  { id: 'i20k', unit: 20, kind: 'estimate', format: 'estimate', concepts: ['u20.crossover'], targets: ['units-j-kj'],
    prompt: b('Ethene takes up hydrogen: C₂H₄ + H₂ → C₂H₆, ΔH = −136.4 kJ/mol, ΔS = −120.8 J/(mol·K). Above which temperature can it no longer run by itself? Answer in kelvin.', 'Ethen nimmt Wasserstoff auf: C₂H₄ + H₂ → C₂H₆, ΔH = −136,4 kJ/mol, ΔS = −120,8 J/(mol·K). Oberhalb welcher Temperatur kann die Reaktion nicht mehr freiwillig ablaufen? Antworte in Kelvin.'),
    min: 0, max: 3000, step: 1, answer: 1129, tolerance: 15, suffix: ' K',
    near: [
      { value: 1, tol: 1, note: b('J and kJ are mixed: −120.8 J/(mol·K) is −0.1208 kJ/(mol·K).', 'J und kJ sind vermischt: −120,8 J/(mol·K) sind −0,1208 kJ/(mol·K).') },
      { value: 856, tol: 10, note: b('That is the temperature in °C. The answer asks for kelvin: add 273.', 'Das ist die Temperatur in °C. Gefragt ist Kelvin: Addiere 273.') },
    ],
    explain: b('ΔG = 0 at T = ΔH ÷ ΔS = 136.4 ÷ 0.1208 = 1129 K (856 °C). Below it ΔG < 0; above it the −T·ΔS term, positive here, outweighs ΔH.',
      'ΔG = 0 bei T = ΔH : ΔS = 136,4 : 0,1208 = 1129 K (856 °C). Darunter ist ΔG < 0; darüber ist der hier positive Term −T·ΔS größer als der Betrag von ΔH.') },
  { id: 'i20l', unit: 20, kind: 'choice', format: 'why', evidence: 'explain', withConfidence: true, concepts: ['u20.crossover'], targets: ['negative-dg-fast'],
    prompt: b('Why is T = ΔH ÷ ΔS the temperature where the sign of ΔG changes?', 'Warum ist T = ΔH : ΔS die Temperatur, bei der ΔG das Vorzeichen wechselt?'),
    options: [
      { text: b('There the reaction runs fastest', 'Dort läuft die Reaktion am schnellsten'), mis: 'negative-dg-fast' },
      { text: b('There ΔH and ΔS are equal', 'Dort sind ΔH und ΔS gleich groß') },
      { text: b('There the reaction stops taking in energy', 'Dort hört die Reaktion auf, Energie aufzunehmen') },
      { text: b('There ΔG = 0, so ΔH = T·ΔS', 'Dort ist ΔG = 0, also ΔH = T·ΔS'), correct: true },
    ],
    explain: b('Set ΔG = ΔH − T·ΔS = 0: then T·ΔS = ΔH and T = ΔH ÷ ΔS, with ΔS in kJ/(mol·K). On one side of this temperature ΔG < 0, on the other ΔG > 0; it says nothing about speed, and ΔH and ΔS are not equal there (they do not even have the same unit).',
      'Setze ΔG = ΔH − T·ΔS = 0: Dann ist T·ΔS = ΔH und T = ΔH : ΔS, mit ΔS in kJ/(mol·K). Auf der einen Seite dieser Temperatur ist ΔG < 0, auf der anderen ΔG > 0; über die Geschwindigkeit sagt das nichts, und ΔH und ΔS sind dort nicht gleich (sie haben nicht einmal dieselbe Einheit).') },
  { id: 'i20m', unit: 20, kind: 'choice', format: 'predict', evidence: 'transfer', withConfidence: true, concepts: ['u20.crossover'], targets: ['units-j-kj'],
    prompt: b('Water boiling, measured at 100 °C: ΔH = +40.65 kJ/mol, ΔS = +108.9 J/(mol·K). At which temperature is ΔG = 0?', 'Wasser siedet, gemessen bei 100 °C: ΔH = +40,65 kJ/mol, ΔS = +108,9 J/(mol·K). Bei welcher Temperatur ist ΔG = 0?'),
    options: [
      { text: b('0.37 K', '0,37 K'), mis: 'units-j-kj' },
      { text: b('373 K', '373 K'), correct: true },
      { text: b('2.7 K', '2,7 K') },
      { text: b('4427 K', '4427 K') },
    ],
    explain: b('T = ΔH ÷ ΔS = 40.65 ÷ 0.1089 = 373 K, water\'s boiling point. 0.37 K comes from dividing kJ by J without converting; 2.7 K divides the wrong way round, and 4427 K multiplies.',
      'T = ΔH : ΔS = 40,65 : 0,1089 = 373 K, die Siedetemperatur von Wasser. 0,37 K entsteht, wenn man kJ durch J teilt, ohne umzurechnen; 2,7 K teilt andersherum, und 4427 K multipliziert.') },
  { id: 'i20n', unit: 20, kind: 'rank', format: 'rank', evidence: 'transfer', concepts: ['u20.crossover', 'u20.four-cases'],
    prompt: b('Rank by the temperature where ΔG = 0, lowest first. Ice melting: +6.01 kJ/mol, +22.0 J/(mol·K). NO₂ pairing up: −55.3, −175.8. Water evaporating (25 °C data): +44.0, +118.8. Ammonia synthesis: −91.8, −198.1.',
      'Ordne nach der Temperatur, bei der ΔG = 0 ist, die niedrigste zuerst. Eis schmilzt: +6,01 kJ/mol, +22,0 J/(mol·K). NO₂ verbindet sich: −55,3; −175,8. Wasser verdampft (Daten bei 25 °C): +44,0; +118,8. Ammoniaksynthese: −91,8; −198,1.'),
    order: [b('Ice melting', 'Eis schmilzt'), b('NO₂ pairing up', 'NO₂ verbindet sich'), b('Water evaporating', 'Wasser verdampft'), b('Ammonia synthesis', 'Ammoniaksynthese')],
    explain: b('T = ΔH ÷ ΔS with ΔS in kJ/(mol·K): ice 273 K, NO₂ 315 K, water 370 K, ammonia 463 K. Ice and water need T above it to run; NO₂ and ammonia need T below it.',
      'T = ΔH : ΔS mit ΔS in kJ/(mol·K): Eis 273 K, NO₂ 315 K, Wasser 370 K, Ammoniak 463 K. Eis und Wasser brauchen eine Temperatur darüber, NO₂ und Ammoniak eine darunter.') },

  // ---------- u20.four-cases ----------
  { id: 'i20o', unit: 20, kind: 'choice', format: 'predict', withConfidence: true, concepts: ['u20.four-cases'],
    prompt: b('A reaction gives out energy (ΔH < 0) and its entropy rises (ΔS > 0). At which temperatures can it run by itself?', 'Eine Reaktion gibt Energie ab (ΔH < 0), und ihre Entropie steigt (ΔS > 0). Bei welchen Temperaturen kann sie freiwillig ablaufen?'),
    options: [
      { text: b('Only at low temperatures', 'Nur bei tiefen Temperaturen') },
      { text: b('Only at high temperatures', 'Nur bei hohen Temperaturen') },
      { text: b('At every temperature', 'Bei jeder Temperatur'), correct: true },
      { text: b('At no temperature', 'Bei keiner Temperatur') },
    ],
    explain: b('Both parts are negative: ΔH < 0 and −T·ΔS < 0, so ΔG < 0 at every temperature. Hydrogen peroxide decomposing is such a case (ΔH = −196.1 kJ/mol, ΔS = +126.0 J/(mol·K)).',
      'Beide Anteile sind negativ: ΔH < 0 und −T·ΔS < 0, also ist ΔG < 0 bei jeder Temperatur. Der Zerfall von Wasserstoffperoxid ist so ein Fall (ΔH = −196,1 kJ/mol, ΔS = +126,0 J/(mol·K)).') },
  { id: 'i20p', unit: 20, kind: 'choice', format: 'why', evidence: 'explain', withConfidence: true, concepts: ['u20.four-cases'], targets: ['spontaneous-exothermic', 'negative-dg-fast'],
    prompt: b('Water and oxygen forming hydrogen peroxide, 2 H₂O + O₂ → 2 H₂O₂, has ΔH = +196.1 kJ/mol and ΔS = −126.0 J/(mol·K). Why can it run by itself at no temperature?', 'Die Bildung von Wasserstoffperoxid aus Wasser und Sauerstoff, 2 H₂O + O₂ → 2 H₂O₂, hat ΔH = +196,1 kJ/mol und ΔS = −126,0 J/(mol·K). Warum kann sie bei keiner Temperatur freiwillig ablaufen?'),
    options: [
      { text: b('It takes in energy, and only reactions that give out energy can run', 'Sie nimmt Energie auf, und nur Reaktionen, die Energie abgeben, können ablaufen'), mis: 'spontaneous-exothermic' },
      { text: b('ΔH and −T·ΔS are both positive, so ΔG > 0 at every temperature', 'ΔH und −T·ΔS sind beide positiv, also ist ΔG > 0 bei jeder Temperatur'), correct: true },
      { text: b('It is far too slow at every temperature', 'Sie ist bei jeder Temperatur viel zu langsam'), mis: 'negative-dg-fast' },
      { text: b('Its entropy falls, and a falling entropy always makes ΔG positive', 'Ihre Entropie sinkt, und sinkende Entropie macht ΔG immer positiv') },
    ],
    explain: b('ΔH > 0 pushes ΔG up, and with ΔS < 0 the term −T·ΔS is positive too: ΔG > 0 at every temperature. Taking in energy alone does not rule a reaction out (melting ice runs above 273 K), and a falling entropy alone does not either (NO₂ pairs up when cold).',
      'ΔH > 0 hebt ΔG an, und mit ΔS < 0 ist auch −T·ΔS positiv: ΔG > 0 bei jeder Temperatur. Energieaufnahme allein schließt eine Reaktion nicht aus (Eis schmilzt oberhalb von 273 K), und sinkende Entropie allein auch nicht (NO₂ verbindet sich in der Kälte).') },
  { id: 'i20q', unit: 20, kind: 'choice', format: 'predict', evidence: 'transfer', withConfidence: true, concepts: ['u20.four-cases', 'u20.temperature'],
    prompt: b('Which of these can run by itself only when it is hot enough?', 'Welche dieser Reaktionen kann nur dann freiwillig ablaufen, wenn es heiß genug ist?'),
    options: [
      { text: b('NO₂ pairing up: ΔH = −55.3 kJ/mol, ΔS = −175.8 J/(mol·K)', 'NO₂ verbindet sich: ΔH = −55,3 kJ/mol, ΔS = −175,8 J/(mol·K)') },
      { text: b('H₂ + Cl₂ → 2 HCl: ΔH = −184.6 kJ/mol, ΔS = +20.0 J/(mol·K)', 'H₂ + Cl₂ → 2 HCl: ΔH = −184,6 kJ/mol, ΔS = +20,0 J/(mol·K)') },
      { text: b('Ammonia synthesis: ΔH = −91.8 kJ/mol, ΔS = −198.1 J/(mol·K)', 'Ammoniaksynthese: ΔH = −91,8 kJ/mol, ΔS = −198,1 J/(mol·K)') },
      { text: b('Burning limestone: ΔH = +179.2 kJ/mol, ΔS = +160.2 J/(mol·K)', 'Kalkbrennen: ΔH = +179,2 kJ/mol, ΔS = +160,2 J/(mol·K)'), correct: true },
    ],
    explain: b('Only when hot: ΔH > 0 and ΔS > 0, so the entropy term must outweigh ΔH (limestone above about 1119 K on this model). NO₂ pairing and ammonia run only when cold enough; hydrogen and chlorine at every temperature.',
      'Nur bei Hitze: ΔH > 0 und ΔS > 0, also muss der Entropieterm ΔH übertreffen (Kalkstein nach dem Modell oberhalb von etwa 1119 K). Die Verbindung von NO₂ und die Ammoniaksynthese laufen nur bei genügend tiefer Temperatur ab, Wasserstoff und Chlor bei jeder Temperatur.') },

  // ---------- u20.not-rate ----------
  { id: 'i20r', unit: 20, kind: 'choice', format: 'predict', withConfidence: true, concepts: ['u20.not-rate'], targets: ['negative-dg-fast'],
    prompt: b('Diamond turning into graphite has ΔG = −2.9 kJ/mol at 25 °C. What do you expect for a diamond in a ring?', 'Der Übergang von Diamant zu Graphit hat bei 25 °C ΔG = −2,9 kJ/mol. Was erwartest du für einen Diamanten im Ring?'),
    options: [
      { text: b('It turns into graphite within days, because ΔG < 0', 'Er wird innerhalb von Tagen zu Graphit, weil ΔG < 0 ist'), mis: 'negative-dg-fast' },
      { text: b('It stays a diamond as long as anyone watches: ΔG says nothing about speed', 'Er bleibt ein Diamant, solange man zusieht: ΔG sagt nichts über die Geschwindigkeit'), correct: true },
      { text: b('It can never turn into graphite, because ΔG is so small', 'Er kann nie zu Graphit werden, weil ΔG so klein ist') },
      { text: b('It turns into graphite only when heated, because ΔG < 0 only when hot', 'Er wird nur beim Erhitzen zu Graphit, weil ΔG nur bei Hitze negativ ist') },
    ],
    explain: b('ΔG < 0 at every temperature says diamond can turn into graphite by itself. To do so its carbon atoms must first break strong bonds, which at room temperature is far too slow to notice (unit 21 shows this barrier).',
      'ΔG < 0 bei jeder Temperatur gibt an, dass Diamant freiwillig zu Graphit werden kann. Dazu müssten seine Kohlenstoffatome erst starke Bindungen spalten, und das geschieht bei Raumtemperatur unmerklich langsam (Einheit 21 zeigt diese Hürde).') },
  { id: 'i20s', unit: 20, kind: 'choice', format: 'why', evidence: 'explain', withConfidence: true, concepts: ['u20.not-rate'], targets: ['negative-dg-fast'],
    prompt: b('A mixture of hydrogen and oxygen can stand unchanged at room temperature, although 2 H₂ + O₂ → 2 H₂O(l) has ΔG = −474 kJ/mol at 25 °C. Why is that no contradiction?', 'Ein Gemisch aus Wasserstoff und Sauerstoff kann bei Raumtemperatur unverändert stehen, obwohl 2 H₂ + O₂ → 2 H₂O(l) bei 25 °C ΔG = −474 kJ/mol hat. Warum ist das kein Widerspruch?'),
    options: [
      { text: b('With ΔG this negative it must already be reacting quickly', 'Bei so negativem ΔG muss es schon schnell reagieren'), mis: 'negative-dg-fast' },
      { text: b('At room temperature ΔG for this reaction is positive', 'Bei Raumtemperatur ist ΔG dieser Reaktion positiv') },
      { text: b('ΔG says it can run, not how fast; without a spark it is very slow', 'ΔG gibt an, dass sie ablaufen kann, nicht wie schnell; ohne Funken ist sie sehr langsam'), correct: true },
      { text: b('ΔG only applies once the reaction has been started', 'ΔG gilt erst, wenn die Reaktion gestartet ist') },
    ],
    explain: b('ΔG < 0: water can form by itself. How fast is a separate question: at room temperature hardly any collisions are energetic enough, and a spark starts the explosive reaction (units 21–22).',
      'ΔG < 0: Wasser kann freiwillig entstehen. Wie schnell, ist eine andere Frage: Bei Raumtemperatur sind kaum Zusammenstöße energiereich genug, und ein Funke startet die explosive Reaktion (Einheiten 21–22).') },
  { id: 'i20t', unit: 20, kind: 'choice', format: 'predict', evidence: 'transfer', withConfidence: true, concepts: ['u20.not-rate', 'u20.sign'], targets: ['negative-dg-fast'],
    prompt: b('At 25 °C, diamond → graphite has ΔG = −2.9 kJ/mol and hydrogen peroxide decomposing has ΔG = −234 kJ/mol. What do these values tell you?', 'Bei 25 °C hat der Übergang Diamant → Graphit ΔG = −2,9 kJ/mol und der Zerfall von Wasserstoffperoxid ΔG = −234 kJ/mol. Was sagen dir diese Werte?'),
    options: [
      { text: b('Hydrogen peroxide decomposes about 80 times faster', 'Wasserstoffperoxid zerfällt etwa 80-mal so schnell'), mis: 'negative-dg-fast' },
      { text: b('Only hydrogen peroxide can change; −2.9 is too close to zero', 'Nur Wasserstoffperoxid kann sich umwandeln; −2,9 liegt zu nah an null') },
      { text: b('Diamond changes faster, because a small ΔG means a small barrier', 'Diamant wandelt sich schneller um, weil ein kleines ΔG eine kleine Hürde bedeutet'), mis: 'negative-dg-fast' },
      { text: b('Both can run by themselves; which is faster, ΔG does not say', 'Beide können freiwillig ablaufen; welcher schneller ist, gibt ΔG nicht an'), correct: true },
    ],
    explain: b('Both values are negative, so both changes can run by themselves. Speed depends on the barrier the particles must get over (unit 21), not on ΔG: a large negative ΔG can be slow and a small one fast.',
      'Beide Werte sind negativ, also können beide Vorgänge freiwillig ablaufen. Die Geschwindigkeit hängt von der Hürde ab, die die Teilchen überwinden müssen (Einheit 21), nicht von ΔG: Ein stark negatives ΔG kann langsam sein und ein schwach negatives schnell.') },
];
