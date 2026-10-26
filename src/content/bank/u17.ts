// Review bank for unit 17 (written by the unit helper; see docs/process/authoring.md).
// Bond energies from bonds.ts (OpenStax Chemistry 2e, Table 7.2): H–H 436, Cl–Cl 243, F–F 160, O=O 498, C–H 415,
// O–H 464, H–F 569, C–F 439, C–C 345, C=C 611, C≡C 837, C=O 741 kJ/mol. Estimates: ethene + H₂ 1047 / 1175 / −128;
// 2 H₂ + O₂ 1370 / 1856 / −486; ethane → ethene + H₂ +128; ethyne + H₂ → ethene 1273 − 1441 = −168 (only H–H and C–H:
// 436 − 830 = −394). Measured with dH() in thermo.ts: nh3 −91.8, hcl −184.6, ch4-burn-g −802.6, caco3 +179.2,
// thermite −851.8, ice-melt +6.01.
// Sources (fetched): C–H in methane 1662/4 = 415.5 kJ/mol and C=O in carbon dioxide +805 kJ/mol, a mean of two different
// steps (≈532 + ≈1076 = 1609; LibreTexts, Physical and Theoretical Chemistry, Supplemental Modules, "Bond Enthalpies").
// Dissolving ammonium nitrate is endothermic (instant cold packs; qualitative only here, unit 19 gives the value).
// Condensing water at 100 °C gives out 40.65 kJ/mol (water-boil-100 in thermo.ts); burning methane to liquid instead of
// vapour water gives out 890.6 − 802.6 = 88.0 kJ/mol more = 2 × 44.0 (thermo.ts, water-boil at 25 °C).
import type { Bi } from '../../i18n';
import type { Item } from '../items';

const b = (en: string, de: string): Bi => ({ en, de });

export const BANK_U17: Item[] = [
  // ---------- u17.break-make ----------
  { id: 'i17a', unit: 17, kind: 'choice', format: 'predict', withConfidence: true, concepts: ['u17.break-make'], targets: ['breaking-releases'],
    prompt: b('One mole of hydrogen molecules, H₂, is split into separate hydrogen atoms (H–H: 436 kJ/mol). What happens to energy?', 'Ein Mol H₂-Moleküle wird in einzelne Atome gespalten (H–H: 436 kJ/mol). Was passiert mit der Energie?'),
    options: [
      { text: b('436 kJ are given out: the bond\'s energy is set free', '436 kJ werden abgegeben: Die Energie der Bindung wird frei'), mis: 'breaking-releases' },
      { text: b('436 kJ must be taken in to pull the atoms apart', '436 kJ müssen aufgenommen werden, um die Atome zu trennen'), correct: true },
      { text: b('Nothing: no new substance forms, so no energy changes', 'Nichts: Es entsteht kein neuer Stoff, also ändert sich keine Energie') },
      { text: b('218 kJ are taken in, half for each atom', '218 kJ werden aufgenommen, die Hälfte für jedes Atom') },
    ],
    explain: b('Breaking a bond always costs energy: 436 kJ per mole of H–H bonds. The atoms end higher in energy than the molecule. Nothing is given out until new bonds form.', 'Eine Bindung zu spalten kostet immer Energie: 436 kJ pro Mol H–H-Bindungen. Die Atome liegen danach energetisch höher als das Molekül. Abgegeben wird erst etwas, wenn neue Bindungen geknüpft werden.') },
  { id: 'i17b', unit: 17, kind: 'choice', format: 'why', evidence: 'explain', withConfidence: true, concepts: ['u17.break-make'], targets: ['breaking-releases'],
    prompt: b('Why does breaking a covalent bond always cost energy?', 'Warum kostet das Spalten einer Atombindung immer Energie?'),
    options: [
      { text: b('Bonds store energy, which escapes as the bond breaks', 'Bindungen speichern Energie, die beim Spalten entweicht'), mis: 'breaking-releases' },
      { text: b('The atoms are attached and resist being moved', 'Die Atome hängen aneinander und wehren sich gegen das Trennen') },
      { text: b('Energy is only needed to start; the bond then gives it back', 'Energie braucht man nur zum Start; die Bindung gibt sie danach zurück') },
      { text: b('The shared pair attracts both nuclei; separating them works against that', 'Das gemeinsame Elektronenpaar zieht beide Kerne an; beim Trennen arbeitet man gegen diese Anziehung'), correct: true },
    ],
    explain: b('Both nuclei are attracted to the shared pair between them, so the bonded atoms are lower in energy than the separated ones. Separating them means doing work against that attraction. A bond is not a store of energy; energy is given out when it forms.', 'Beide Kerne werden vom gemeinsamen Elektronenpaar zwischen ihnen angezogen, deshalb liegen die gebundenen Atome energetisch tiefer als die getrennten. Um sie zu trennen, muss man gegen diese Anziehung Arbeit verrichten. Eine Bindung ist kein Energiespeicher; Energie wird frei, wenn sie entsteht.') },
  { id: 'i17c', unit: 17, kind: 'choice', format: 'predict', evidence: 'transfer', withConfidence: true, concepts: ['u17.break-make'], targets: ['breaking-releases'],
    prompt: b('Two chlorine atoms meet and form a Cl–Cl bond (243 kJ/mol). What happens to energy, per mole of Cl₂ formed?', 'Zwei Chloratome treffen sich und bilden eine Cl–Cl-Bindung (243 kJ/mol). Was passiert mit der Energie, pro Mol entstehendem Cl₂?'),
    options: [
      { text: b('243 kJ are given out', '243 kJ werden abgegeben'), correct: true },
      { text: b('243 kJ must be taken in to join them', '243 kJ müssen aufgenommen werden, um sie zu verbinden'), mis: 'breaking-releases' },
      { text: b('486 kJ are given out, 243 by each atom', '486 kJ werden abgegeben, 243 von jedem Atom') },
      { text: b('Nothing: the atoms simply stick together', 'Nichts: Die Atome bleiben einfach aneinander haften') },
    ],
    explain: b('Making a bond is breaking it in reverse: the 243 kJ it costs to break one mole of Cl–Cl bonds is given out when they form. The value is per mole of bonds, not per atom.', 'Eine Bindung zu knüpfen ist das Spalten rückwärts: Die 243 kJ, die das Spalten von einem Mol Cl–Cl-Bindungen kostet, werden beim Knüpfen frei. Der Wert gilt pro Mol Bindungen, nicht pro Atom.') },

  // ---------- u17.balance ----------
  { id: 'i17d', unit: 17, kind: 'choice', format: 'predict', withConfidence: true, concepts: ['u17.balance'], targets: ['breaking-releases'],
    prompt: b('In C₂H₄ + H₂ → C₂H₆, breaking the bonds takes in 1047 kJ and forming the new ones gives out 1175 kJ. What does the reaction do overall?', 'Bei C₂H₄ + H₂ → C₂H₆ kostet das Spalten der Bindungen 1047 kJ, beim Knüpfen der neuen werden 1175 kJ frei. Was macht die Reaktion insgesamt?'),
    options: [
      { text: b('Takes in about 128 kJ: forming bonds costs more', 'Sie nimmt etwa 128 kJ auf: Knüpfen kostet mehr'), mis: 'breaking-releases' },
      { text: b('Gives out 2222 kJ: both steps give out energy', 'Sie gibt 2222 kJ ab: Beide Schritte geben Energie ab'), mis: 'breaking-releases' },
      { text: b('Gives out about 128 kJ: the new bonds are stronger', 'Sie gibt etwa 128 kJ ab: Die neuen Bindungen sind stärker'), correct: true },
      { text: b('Takes in 1047 kJ: breaking always wins', 'Sie nimmt 1047 kJ auf: Das Spalten überwiegt immer') },
    ],
    explain: b('More comes out (1175 kJ) than goes in (1047 kJ), so the reaction gives out about 1047 − 1175 = −128 kJ/mol. It gives out energy because the bonds formed are stronger in total than the bonds broken.', 'Es kommt mehr heraus (1175 kJ), als hineingeht (1047 kJ), also gibt die Reaktion etwa 1047 − 1175 = −128 kJ/mol ab. Sie gibt Energie ab, weil die geknüpften Bindungen insgesamt stärker sind als die gespaltenen.') },
  { id: 'i17e', unit: 17, kind: 'choice', format: 'why', evidence: 'explain', withConfidence: true, concepts: ['u17.balance'], targets: ['breaking-releases'],
    prompt: b('Burning hydrogen, 2 H₂ + O₂ → 2 H₂O (gas), gives out a lot of energy. Bonds: H–H 436, O=O 498, O–H 464 kJ/mol. Which explanation is best?', 'Die Verbrennung von Wasserstoff, 2 H₂ + O₂ → 2 H₂O (gasförmig), gibt viel Energie ab. Bindungen: H–H 436, O=O 498, O–H 464 kJ/mol. Welche Erklärung ist die beste?'),
    options: [
      { text: b('The four O–H bonds formed (1856 kJ) outweigh the bonds broken (1370 kJ)', 'Die vier geknüpften O–H-Bindungen (1856 kJ) überwiegen die gespaltenen (1370 kJ)'), correct: true },
      { text: b('Breaking the H–H bonds sets their stored energy free', 'Beim Spalten der H–H-Bindungen wird ihre gespeicherte Energie frei'), mis: 'breaking-releases' },
      { text: b('Hydrogen is a fuel, and fuels contain heat that burning lets out', 'Wasserstoff ist ein Brennstoff, und Brennstoffe enthalten Wärme, die beim Verbrennen herauskommt') },
      { text: b('O=O is the strongest bond, so it gives out the most energy', 'O=O ist die stärkste Bindung, also gibt sie am meisten Energie ab') },
    ],
    explain: b('Breaking two H–H and one O=O costs 2 × 436 + 498 = 1370 kJ; forming four O–H gives out 4 × 464 = 1856 kJ. The difference, about 486 kJ, goes to the surroundings. The energy is not stored in the fuel\'s bonds: it comes from forming stronger ones.', 'Das Spalten von zwei H–H und einer O=O kostet 2 · 436 + 498 = 1370 kJ; beim Knüpfen von vier O–H werden 4 · 464 = 1856 kJ frei. Die Differenz, etwa 486 kJ, geht an die Umgebung. Die Energie steckt nicht in den Bindungen des Brennstoffs: Sie kommt vom Knüpfen stärkerer Bindungen.') },
  { id: 'i17f', unit: 17, kind: 'choice', format: 'predict', evidence: 'transfer', withConfidence: true, concepts: ['u17.balance'], targets: ['breaking-releases'],
    prompt: b('Fluorine reacts with almost everything and gives out a lot of energy. Bond energies: F–F 160, H–F 569, C–F 439 kJ/mol. Which feature explains it best?', 'Fluor reagiert mit fast allem und gibt dabei viel Energie ab. Bindungsenthalpien: F–F 160, H–F 569, C–F 439 kJ/mol. Was erklärt das am besten?'),
    options: [
      { text: b('Fluorine atoms want electrons more than any others', 'Fluoratome wollen Elektronen mehr als alle anderen') },
      { text: b('Breaking the weak F–F bond sets a lot of energy free', 'Beim Spalten der schwachen F–F-Bindung wird viel Energie frei'), mis: 'breaking-releases' },
      { text: b('Fluorine molecules move faster than other molecules', 'Fluormoleküle bewegen sich schneller als andere Moleküle') },
      { text: b('F–F costs little to break, and fluorine\'s new bonds are strong', 'F–F kostet wenig zum Spalten, und die neuen Bindungen des Fluors sind stark'), correct: true },
    ],
    explain: b('Only 160 kJ/mol goes in to break F–F, while H–F (569) or C–F (439) give out much more when they form. Cheap to break, strong to make: that difference is the energy given out. Atoms do not "want" anything; the numbers say what costs and what pays.', 'Nur 160 kJ/mol gehen in das Spalten von F–F, während H–F (569) oder C–F (439) beim Knüpfen viel mehr abgeben. Leicht zu spalten, stark zu knüpfen: Diese Differenz ist die abgegebene Energie. Atome „wollen“ nichts; die Zahlen geben an, was Energie kostet und was Energie abgibt.') },

  // ---------- u17.sign ----------
  { id: 'i17g', unit: 17, kind: 'choice', format: 'predict', withConfidence: true, concepts: ['u17.sign'], targets: ['dh-sign'],
    prompt: b('The ammonia synthesis, N₂ + 3 H₂ → 2 NH₃, has ΔH = −91.8 kJ/mol. What happens to the surroundings while it runs?', 'Die Ammoniaksynthese, N₂ + 3 H₂ → 2 NH₃, hat ΔH = −91,8 kJ/mol. Was passiert mit der Umgebung, während sie abläuft?'),
    options: [
      { text: b('They cool down: a negative ΔH means energy is taken in', 'Sie kühlt ab: Ein negatives ΔH bedeutet, dass Energie aufgenommen wird'), mis: 'dh-sign' },
      { text: b('They warm up: the reaction gives energy to them', 'Sie erwärmt sich: Die Reaktion gibt Energie an sie ab'), correct: true },
      { text: b('Nothing: ΔH is about bonds, not about heat', 'Nichts: ΔH betrifft Bindungen, nicht Wärme') },
      { text: b('They cool down, because 91.8 kJ are used up', 'Sie kühlt ab, weil 91,8 kJ verbraucht werden'), mis: 'dh-sign' },
    ],
    explain: b('ΔH is the change for the system, the reacting substances. Negative means the system ends with less energy: 91.8 kJ per mole of reaction went to the surroundings, which warm up. The reaction is exothermic.', 'ΔH ist die Änderung für das System, die reagierenden Stoffe. Negativ bedeutet, dass das System am Ende weniger Energie hat: 91,8 kJ pro Mol (bezogen auf die Reaktionsgleichung) gingen an die Umgebung, die sich erwärmt. Die Reaktion ist exotherm.') },
  { id: 'i17h', unit: 17, kind: 'choice', format: 'why', evidence: 'explain', withConfidence: true, concepts: ['u17.sign'], targets: ['dh-sign'],
    prompt: b('Why does an exothermic reaction have a negative ΔH?', 'Warum hat eine exotherme Reaktion ein negatives ΔH?'),
    options: [
      { text: b('Negative means the surroundings lose energy to the reaction', 'Negativ bedeutet, dass die Umgebung Energie an die Reaktion verliert'), mis: 'dh-sign' },
      { text: b('ΔH is counted for the reacting substances: they end with less energy', 'ΔH wird für die reagierenden Stoffe gerechnet: Sie haben am Ende weniger Energie'), correct: true },
      { text: b('Exothermic reactions destroy some of their energy', 'Exotherme Reaktionen vernichten einen Teil ihrer Energie') },
      { text: b('The minus sign shows that the reaction runs backwards', 'Das Minuszeichen zeigt, dass die Reaktion rückwärts läuft') },
    ],
    explain: b('ΔH = H(products) − H(reactants) is seen from the system. When energy leaves the system as heat, the products have less energy than the reactants, so ΔH < 0. The surroundings gain exactly that energy; none is destroyed.', 'ΔH = H(Produkte) − H(Edukte) wird vom System aus betrachtet. Verlässt Energie das System als Wärme, haben die Produkte weniger Energie als die Edukte, also ΔH < 0. Die Umgebung erhält genau diese Energie; nichts wird vernichtet.') },
  { id: 'i17i', unit: 17, kind: 'choice', format: 'predict', evidence: 'transfer', withConfidence: true, concepts: ['u17.sign'], targets: ['dh-sign'],
    prompt: b('An instant cold pack holds ammonium nitrate and water. Squeeze it, the solid dissolves and the pack feels cold. Which describes the dissolving?', 'Eine Kältekompresse enthält Ammoniumnitrat und Wasser. Drückt man sie, löst sich der Feststoff, und die Kompresse fühlt sich kalt an. Was beschreibt das Lösen?'),
    options: [
      { text: b('ΔH < 0: the pack\'s temperature falls', 'ΔH < 0: Die Temperatur der Kompresse sinkt'), mis: 'dh-sign' },
      { text: b('ΔH = 0: dissolving is not a reaction', 'ΔH = 0: Lösen ist keine Reaktion') },
      { text: b('ΔH > 0, endothermic: energy flows in from your hand', 'ΔH > 0, endotherm: Energie fließt aus deiner Hand hinein'), correct: true },
      { text: b('ΔH < 0, exothermic: cold is given out', 'ΔH < 0, exotherm: Kälte wird abgegeben') },
    ],
    explain: b('The dissolving takes in energy from its surroundings, the water and your hand, which is why they feel cold: ΔH > 0, endothermic. "Cold" is not something given out; it is energy leaving your hand.', 'Das Lösen nimmt Energie aus seiner Umgebung auf, dem Wasser und deiner Hand, deshalb fühlen sie sich kalt an: ΔH > 0, endotherm. „Kälte“ wird nicht abgegeben; es ist Energie, die deine Hand verlässt.') },

  // ---------- u17.estimate ----------
  { id: 'i17j', unit: 17, kind: 'choice', format: 'predict', withConfidence: true, concepts: ['u17.estimate'], targets: ['breaking-releases'],
    prompt: b('Ethyne takes up hydrogen: HC≡CH + H₂ → H₂C=CH₂. Bonds: C≡C 837, H–H 436, C=C 611, C–H 415 kJ/mol. Estimate ΔH.', 'Ethin nimmt Wasserstoff auf: HC≡CH + H₂ → H₂C=CH₂. Bindungen: C≡C 837, H–H 436, C=C 611, C–H 415 kJ/mol. Schätze ΔH ab.'),
    options: [
      { text: b('+168 kJ/mol', '+168 kJ/mol'), mis: 'breaking-releases' },
      { text: b('−394 kJ/mol', '−394 kJ/mol') },
      { text: b('+2714 kJ/mol', '+2714 kJ/mol') },
      { text: b('−168 kJ/mol', '−168 kJ/mol'), correct: true },
    ],
    explain: b('Broken: C≡C and H–H, 837 + 436 = 1273 kJ. Formed: C=C and two new C–H, 611 + 2 × 415 = 1441 kJ. ΔH ≈ 1273 − 1441 = −168 kJ/mol. −394 forgets that the triple bond becomes a double bond, and +168 subtracts the wrong way round.', 'Gespalten: C≡C und H–H, 837 + 436 = 1273 kJ. Geknüpft: C=C und zwei neue C–H, 611 + 2 · 415 = 1441 kJ. ΔH ≈ 1273 − 1441 = −168 kJ/mol. Bei −394 fehlt, dass aus der Dreifach- eine Doppelbindung wird, und bei +168 ist falsch herum subtrahiert.') },
  { id: 'i17k', unit: 17, kind: 'choice', format: 'why', evidence: 'explain', withConfidence: true, concepts: ['u17.estimate'], targets: ['breaking-releases'],
    prompt: b('To estimate ΔH you take the bonds broken minus the bonds formed. Why this way round?', 'Um ΔH abzuschätzen, rechnet man gespaltene minus geknüpfte Bindungen. Warum in dieser Reihenfolge?'),
    options: [
      { text: b('Breaking takes energy in (+), forming gives it out (−); ΔH is the system\'s total', 'Spalten nimmt Energie auf (+), Knüpfen gibt sie ab (−); ΔH ist die Summe für das System'), correct: true },
      { text: b('Products always have more bonds than reactants', 'Produkte haben immer mehr Bindungen als Edukte') },
      { text: b('Breaking gives energy out and forming takes it in', 'Spalten gibt Energie ab, und Knüpfen nimmt sie auf'), mis: 'breaking-releases' },
      { text: b('It is only a convention; the other order works as well', 'Das ist nur eine Konvention; die andere Reihenfolge geht genauso') },
    ],
    explain: b('ΔH counts what the system gains: + for every bond broken, − for every bond formed. Adding these up gives broken − formed. The other order gives the same size with the wrong sign, so exothermic would look endothermic.', 'ΔH gibt an, was das System gewinnt: + für jede gespaltene Bindung, − für jede geknüpfte. Zusammengerechnet ergibt das gespalten − geknüpft. Die andere Reihenfolge liefert denselben Betrag mit falschem Vorzeichen, sodass exotherm wie endotherm aussähe.') },
  { id: 'i17l', unit: 17, kind: 'estimate', format: 'estimate', evidence: 'transfer', concepts: ['u17.estimate', 'u17.sign'], targets: ['breaking-releases'],
    prompt: b('Cracking ethane: C₂H₆ → C₂H₄ + H₂. Bonds: C–C 345, C–H 415, C=C 611, H–H 436 kJ/mol. Estimate ΔH.', 'Cracken von Ethan: C₂H₆ → C₂H₄ + H₂. Bindungen: C–C 345, C–H 415, C=C 611, H–H 436 kJ/mol. Schätze ΔH ab.'),
    min: -500, max: 500, step: 1, answer: 128, tolerance: 6, suffix: ' kJ/mol',
    near: [
      { value: -128, tol: 6, note: b('The size is right, the sign is not: here the bonds broken cost more than the bonds formed give out, so ΔH is positive.', 'Der Betrag stimmt, das Vorzeichen nicht: Hier kostet das Spalten mehr, als das Knüpfen abgibt, also ist ΔH positiv.') },
      { value: -217, tol: 6, note: b('The C–C single bond breaks too: it becomes the C=C double bond.', 'Auch die C–C-Einfachbindung wird gespalten: Aus ihr wird die C=C-Doppelbindung.') },
    ],
    explain: b('Broken: C–C and two C–H, 345 + 2 × 415 = 1175 kJ. Formed: C=C and H–H, 611 + 436 = 1047 kJ. ΔH ≈ 1175 − 1047 = +128 kJ/mol: endothermic, which is why cracking needs strong heating. It is the ethene reaction from the Energy Landscape run backwards.', 'Gespalten: C–C und zwei C–H, 345 + 2 · 415 = 1175 kJ. Geknüpft: C=C und H–H, 611 + 436 = 1047 kJ. ΔH ≈ 1175 − 1047 = +128 kJ/mol: endotherm, deshalb muss man beim Cracken stark erhitzen. Es ist die Ethen-Reaktion aus der Energielandschaft, rückwärts.') },

  // ---------- u17.average ----------
  { id: 'i17m', unit: 17, kind: 'choice', format: 'predict', withConfidence: true, concepts: ['u17.average'],
    prompt: b('Breaking all four C–H bonds in one mole of methane takes 1662 kJ in total. Tables give C–H as 415 kJ/mol. What does 415 stand for?', 'Alle vier C–H-Bindungen in einem Mol Methan zu spalten, kostet zusammen 1662 kJ. Tabellen geben für C–H 415 kJ/mol an. Wofür steht 415?'),
    options: [
      { text: b('The energy to break the first C–H bond', 'Die Energie, um die erste C–H-Bindung zu spalten') },
      { text: b('An average: about 1662 ÷ 4; each bond in turn takes a different amount', 'Ein Mittelwert: etwa 1662 : 4; jede Bindung nacheinander kostet etwas anderes'), correct: true },
      { text: b('The exact energy of every C–H bond in every molecule', 'Die genaue Energie jeder C–H-Bindung in jedem Molekül') },
      { text: b('The energy to break all four bonds at once', 'Die Energie, um alle vier Bindungen auf einmal zu spalten') },
    ],
    explain: b('1662 ÷ 4 = 415.5: the table value is a mean. Each C–H bond broken in turn takes a different amount, because what is left of the molecule changes, and tables also average over many molecules. That is why estimates from such values are approximate.', '1662 : 4 = 415,5: Der Tabellenwert ist ein Mittelwert. Jede C–H-Bindung, die nacheinander gespalten wird, kostet etwas anderes, weil sich der Rest des Moleküls ändert, und Tabellen mitteln zusätzlich über viele Moleküle. Deshalb sind Schätzungen mit solchen Werten nur Näherungen.') },
  { id: 'i17n', unit: 17, kind: 'choice', format: 'why', evidence: 'explain', withConfidence: true, concepts: ['u17.average'], targets: ['breaking-releases'],
    prompt: b('Bond energies predict H₂ + Cl₂ almost exactly (−185 estimated, −184.6 measured, in kJ/mol) but methane burning poorly (−682 estimated, −802.6 measured). Why?', 'Mit Bindungsenthalpien trifft man H₂ + Cl₂ fast genau (geschätzt −185, gemessen −184,6 kJ/mol), die Verbrennung von Methan aber schlecht (geschätzt −682, gemessen −802,6). Warum?'),
    options: [
      { text: b('Some of methane\'s bonds give out energy as they break', 'Einige Bindungen im Methan geben beim Spalten Energie ab'), mis: 'breaking-releases' },
      { text: b('Methane burns too fast for its energy to be measured', 'Methan verbrennt zu schnell, um seine Energie zu messen') },
      { text: b('Two-atom bonds are measured exactly; C=O and C–H are averages', 'Bindungen in zweiatomigen Molekülen sind genau gemessen; C=O und C–H sind Mittelwerte'), correct: true },
      { text: b('Larger molecules give out less energy per bond', 'Größere Moleküle geben pro Bindung weniger Energie ab') },
    ],
    explain: b('A two-atom molecule has only one bond, so its table value is measured on exactly that molecule. C=O and C–H values are averages over many molecules; the C=O bonds in CO₂ are stronger than average, so the estimate gives out too little.', 'Ein zweiatomiges Molekül hat nur eine Bindung, also ist sein Tabellenwert genau an diesem Molekül gemessen. Die Werte für C=O und C–H sind Mittelwerte über viele Moleküle; die C=O-Bindungen in CO₂ sind stärker als der Durchschnitt, also gibt die Schätzung zu wenig ab.') },
  { id: 'i17o', unit: 17, kind: 'choice', format: 'predict', evidence: 'transfer', withConfidence: true, concepts: ['u17.average'],
    prompt: b('A table gives C=O as 741 kJ/mol, an average over many molecules. In carbon dioxide, the two C=O bonds take about 805 kJ/mol each on average (the two steps differ). Using 741, the energy given out when one mole of CO₂ forms from its atoms comes out…', 'Eine Tabelle gibt für C=O 741 kJ/mol an, einen Mittelwert über viele Moleküle. In Kohlenstoffdioxid kosten die beiden C=O-Bindungen im Mittel je etwa 805 kJ/mol (die beiden Schritte unterscheiden sich). Mit 741 gerechnet, wird die Energie, die beim Bilden von einem Mol CO₂ aus seinen Atomen frei wird, …'),
    options: [
      { text: b('about 64 kJ too small', 'etwa 64 kJ zu klein') },
      { text: b('about 128 kJ too large', 'etwa 128 kJ zu groß') },
      { text: b('exactly right, since averages fit every molecule', 'genau richtig, weil Mittelwerte zu jedem Molekül passen') },
      { text: b('about 128 kJ too small', 'etwa 128 kJ zu klein'), correct: true },
    ],
    explain: b('Two bonds, on average about 64 kJ/mol stronger than the table value: 2 × (805 − 741) = 128 kJ more is really given out. Averages fit no single molecule exactly.', 'Zwei Bindungen, im Mittel etwa 64 kJ/mol stärker als der Tabellenwert: 2 · (805 − 741) = 128 kJ mehr werden tatsächlich frei. Mittelwerte passen zu keinem einzelnen Molekül genau.') },

  // ---------- u17.diagram ----------
  { id: 'i17p', unit: 17, kind: 'choice', format: 'predict', withConfidence: true, concepts: ['u17.diagram', 'u17.sign'], targets: ['dh-sign'],
    prompt: b('On an energy diagram for burning limestone, CaCO₃ → CaO + CO₂, the products sit 179.2 kJ/mol above the reactant. Which is true?', 'Im Energiediagramm des Kalkbrennens, CaCO₃ → CaO + CO₂, liegen die Produkte 179,2 kJ/mol über dem Edukt. Was stimmt?'),
    options: [
      { text: b('ΔH = −179.2: the arrow goes up, and taking in energy is negative', 'ΔH = −179,2: Der Pfeil geht nach oben, und Energie aufnehmen ist negativ'), mis: 'dh-sign' },
      { text: b('ΔH = +179.2: endothermic, energy taken in from the surroundings', 'ΔH = +179,2: endotherm, Energie wird aus der Umgebung aufgenommen'), correct: true },
      { text: b('ΔH = +179.2, so 179.2 kJ are given out', 'ΔH = +179,2, also werden 179,2 kJ abgegeben') },
      { text: b('ΔH = −179.2: the products have stronger bonds', 'ΔH = −179,2: Die Produkte haben stärkere Bindungen') },
    ],
    explain: b('Higher products mean the system gained energy: ΔH = +179.2 kJ/mol, endothermic. That is why lime kilns must be heated strongly. Up on the diagram is always +, down is always −.', 'Höher liegende Produkte bedeuten, dass das System Energie gewonnen hat: ΔH = +179,2 kJ/mol, endotherm. Deshalb muss man Kalköfen stark heizen. Nach oben im Diagramm ist immer +, nach unten immer −.') },
  { id: 'i17q', unit: 17, kind: 'choice', format: 'why', evidence: 'explain', withConfidence: true, concepts: ['u17.diagram', 'u17.break-make'], targets: ['breaking-releases'],
    prompt: b('In the Energy Landscape, the separated atoms are always drawn above both the reactants and the products. Why?', 'In der Energielandschaft liegen die getrennten Atome immer über den Edukten und den Produkten. Warum?'),
    options: [
      { text: b('Breaking the bonds sets their energy free, which lifts the atoms', 'Beim Spalten wird die Energie der Bindungen frei, und das hebt die Atome an'), mis: 'breaking-releases' },
      { text: b('Atoms are drawn on top only to keep the picture tidy', 'Die Atome stehen nur oben, damit das Bild übersichtlich bleibt') },
      { text: b('Any bonded molecules are lower in energy than their atoms apart', 'Gebundene Moleküle liegen immer energetisch tiefer als ihre getrennten Atome'), correct: true },
      { text: b('Separated atoms are hotter, so they sit higher', 'Getrennte Atome sind heißer, also liegen sie höher') },
    ],
    explain: b('Every bond lowers the energy of the atoms it joins, so taking all bonds apart always costs energy: the atoms sit above any arrangement of molecules made from them. Reactants and products are both somewhere below, and ΔH is their difference.', 'Jede Bindung senkt die Energie der Atome, die sie verbindet, also kostet das Trennen aller Bindungen immer Energie: Die Atome liegen über jeder Anordnung von Molekülen, die aus ihnen besteht. Edukte und Produkte liegen beide irgendwo darunter, und ΔH ist ihr Unterschied.') },
  { id: 'i17s', unit: 17, kind: 'choice', format: 'why', evidence: 'explain', withConfidence: true, concepts: ['u17.break-make', 'u17.diagram'], targets: ['vapour-carries-energy', 'breaking-releases'],
    prompt: b('Steam at 100 °C scalds worse than water at 100 °C, although both have the same temperature. What is the main reason?', 'Dampf von 100 °C verbrüht stärker als Wasser von 100 °C, obwohl beide dieselbe Temperatur haben. Was ist der Hauptgrund?'),
    options: [
      { text: b('The steam holds more heat, which it simply hands to the skin', 'Der Dampf enthält mehr Wärme, die er einfach an die Haut weitergibt'), mis: 'vapour-carries-energy' },
      { text: b('Steam moves faster, so it hits the skin harder', 'Dampf bewegt sich schneller und trifft die Haut härter') },
      { text: b('The bonds inside steam molecules break on the skin and release energy', 'Die Bindungen in den Dampfmolekülen brechen auf der Haut auf und setzen Energie frei'), mis: 'breaking-releases' },
      { text: b('Steam condenses on the skin, which gives out about 41 kJ per mole', 'Dampf kondensiert auf der Haut, dabei werden etwa 41 kJ pro Mol frei'), correct: true },
    ],
    explain: b('Condensing one mole of steam to liquid water at 100 °C gives out about 41 kJ, the same energy that boiling takes in. That is far more than the water then gives out by cooling down, so most of the burn comes from the condensing. The bonds inside the molecules stay as they are, and breaking them would cost energy, not release it.', 'Wenn ein Mol Dampf bei 100 °C zu flüssigem Wasser kondensiert, werden etwa 41 kJ frei, genau die Energie, die das Sieden aufnimmt. Das ist weit mehr, als das Wasser danach beim Abkühlen abgibt, also kommt der größte Teil der Verbrühung vom Kondensieren. Die Bindungen in den Molekülen bleiben, wie sie sind, und sie zu spalten würde Energie kosten, nicht freisetzen.') },
  { id: 'i17t', unit: 17, kind: 'choice', format: 'predict', evidence: 'transfer', withConfidence: true, concepts: ['u17.diagram', 'u17.break-make'], targets: ['vapour-carries-energy', 'breaking-releases'],
    prompt: b('Burning methane gives out 802.6 kJ/mol when the water ends up as vapour and 890.6 kJ/mol when it ends up as liquid (both at 25 °C). Where do the extra 88.0 kJ/mol come from?', 'Beim Verbrennen von Methan werden 802,6 kJ/mol frei, wenn das Wasser als Dampf entsteht, und 890,6 kJ/mol, wenn es flüssig entsteht (beide bei 25 °C). Woher kommen die zusätzlichen 88,0 kJ/mol?'),
    options: [
      { text: b('Two moles of water condense: 2 × 44.0 kJ more is given out', 'Zwei Mol Wasser kondensieren: Dabei werden 2 · 44,0 kJ zusätzlich frei'), correct: true },
      { text: b('In the first case the vapour carries that energy away with it', 'Im ersten Fall nimmt der Dampf diese Energie mit'), mis: 'vapour-carries-energy' },
      { text: b('Breaking the hydrogen bonds in liquid water releases it', 'Beim Spalten der Wasserstoffbrücken im flüssigen Wasser wird sie frei'), mis: 'breaking-releases' },
      { text: b('Some of the CO₂ dissolves in the liquid water', 'Ein Teil des CO₂ löst sich im flüssigen Wasser') },
    ],
    explain: b('The only difference between the two cases is the state of the water: 2 mol of H₂O condense and give out 2 × 44.0 = 88.0 kJ more. Both end at 25 °C, so the vapour does not carry energy away; the molecules attracting each other in the liquid is what gives out the extra energy.', 'Der einzige Unterschied ist der Zustand des Wassers: 2 mol H₂O kondensieren und geben 2 · 44,0 = 88,0 kJ zusätzlich ab. Beide enden bei 25 °C, der Dampf nimmt also keine Energie mit; die Anziehung der Moleküle in der Flüssigkeit setzt die zusätzliche Energie frei.') },
  { id: 'i17r', unit: 17, kind: 'rank', format: 'rank', evidence: 'transfer', concepts: ['u17.diagram', 'u17.sign'], targets: ['dh-sign'], mis: 'dh-sign',
    prompt: b('Rank by where the products sit on an energy diagram compared with the reactants, lowest first.', 'Ordne danach, wo die Produkte im Energiediagramm im Vergleich zu den Edukten liegen, die tiefsten zuerst.'),
    order: [
      b('thermite, ΔH = −851.8 kJ/mol', 'Thermitreaktion, ΔH = −851,8 kJ/mol'),
      b('hydrogen + chlorine, ΔH = −184.6 kJ/mol', 'Wasserstoff + Chlor, ΔH = −184,6 kJ/mol'),
      b('ice melting, ΔH = +6.01 kJ/mol', 'Eis schmilzt, ΔH = +6,01 kJ/mol'),
      b('burning limestone, ΔH = +179.2 kJ/mol', 'Kalkbrennen, ΔH = +179,2 kJ/mol'),
    ],
    explain: b('The products sit ΔH below or above the reactants: the most negative ΔH is lowest. Thermite gives out the most energy, so its products drop furthest; limestone takes in the most, so its products end highest. Size alone is not enough: the sign says up or down.', 'Die Produkte liegen um ΔH unter oder über den Edukten: Das negativste ΔH liegt am tiefsten. Die Thermitreaktion gibt am meisten Energie ab, ihre Produkte fallen am weitesten; das Kalkbrennen nimmt am meisten auf, seine Produkte liegen am höchsten. Der Betrag allein genügt nicht: Das Vorzeichen sagt, ob nach oben oder unten.') },
];
