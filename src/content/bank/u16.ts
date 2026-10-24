// Review bank for unit 16 (written by the unit helper; see docs/process/authoring.md).
// Numbers from src/content/stoich.ts (molar masses from elements.ts): NaCl 58.44, glucose 180.16, sucrose 342.30,
// CaCl₂ 110.98, KMnO₄ 158.03, CuSO₄·5H₂O 249.68 (CuSO₄ 159.60; water 36 % of the crystal), NaOH 40.00 g/mol.
// 10 g in 1 L: NaCl 0.171 mol → 0.342 mol of ions; CaCl₂ 0.0901 mol → 0.270; glucose 0.0555; sucrose 0.0292.
// NaCl : glucose particles at equal grams 6.17. 500 mL of 0.154 mol/L NaCl: 4.50 g. Matching saline's 308 mmol/L of
// particles with glucose alone: 55.5 g/L.
// Sources (fetched): 1 mol NaCl made up with 1 L of water gives "slightly greater than one liter" (LibreTexts,
// Introductory Chemistry (CK-12) 16.9). Plasma sodium 135–145 mmol/L (DocCheck Flexikon, "Isotone Kochsalzlösung").
// WHO/UNICEF reduced-osmolarity ORS: NaCl 2.6 g/L (Na⁺ 75 mmol/L with the citrate's sodium), glucose 13.5 g/L =
// 75 mmol/L (rehydrate.org). Normal saline 9 g/L, 308 mOsm/L (Sodium Chloride 0.9 % SmPC, medicines.org.uk).
import type { Bi } from '../../i18n';
import type { Item } from '../items';

const b = (en: string, de: string): Bi => ({ en, de });

export const BANK_U16: Item[] = [
  // ---------- u16.concentration ----------
  { id: 'i16a', unit: 16, kind: 'choice', format: 'predict', withConfidence: true, concepts: ['u16.concentration'],
    prompt: b('0.50 mol of sodium chloride is dissolved and made up to 250 mL of solution. What is its concentration c?', '0,50 mol Natriumchlorid werden gelöst und auf 250 mL Lösung aufgefüllt. Wie groß ist die Konzentration c?'),
    options: [
      { text: b('0.125 mol/L', '0,125 mol/L') },
      { text: b('2.0 mol/L', '2,0 mol/L'), correct: true },
      { text: b('0.0020 mol/L', '0,0020 mol/L') },
      { text: b('0.50 mol/L', '0,50 mol/L') },
    ],
    explain: b('c = n / V with V in litres: 0.50 mol ÷ 0.250 L = 2.0 mol/L. A quarter of a litre holds 0.50 mol, so a whole litre would hold four times as much. 0.0020 comes from dividing by 250 instead of 0.250.', 'c = n / V mit V in Litern: 0,50 mol : 0,250 L = 2,0 mol/L. Ein Viertelliter enthält 0,50 mol, ein ganzer Liter enthielte also viermal so viel. 0,0020 entsteht, wenn man durch 250 statt durch 0,250 teilt.') },
  { id: 'i16b', unit: 16, kind: 'choice', format: 'why', evidence: 'explain', withConfidence: true, concepts: ['u16.concentration'],
    prompt: b('Flask A holds 0.020 mol of copper sulfate in 50 mL of solution, flask B 0.20 mol in 500 mL. Poured into identical test tubes, both look the same shade of blue. Why?', 'Kolben A enthält 0,020 mol Kupfersulfat in 50 mL Lösung, Kolben B 0,20 mol in 500 mL. In gleiche Reagenzgläser gefüllt, haben beide denselben Blauton. Warum?'),
    options: [
      { text: b('B holds ten times as many moles, so it should look darker; the eye cannot tell', 'B enthält zehnmal so viel Stoffmenge und müsste dunkler aussehen; das Auge merkt es nur nicht') },
      { text: b('Copper sulfate always gives the same blue, however much is dissolved', 'Kupfersulfat ergibt immer dasselbe Blau, egal wie viel gelöst ist') },
      { text: b('Both hold the same moles per litre, 0.40 mol/L: ten times the moles in ten times the volume', 'Beide enthalten gleich viel Mol pro Liter, 0,40 mol/L: zehnmal so viel Stoffmenge in zehnmal so viel Volumen'), correct: true },
      { text: b('The bigger flask spreads the colour over more glass, which makes up for the extra moles', 'Im größeren Kolben verteilt sich die Farbe auf mehr Glas, das gleicht die zusätzliche Stoffmenge aus') },
    ],
    explain: b('How blue a solution looks through the same thickness depends on how many particles there are per volume, which is what c gives: 0.020 ÷ 0.050 = 0.20 ÷ 0.500 = 0.40 mol/L. n says how much there is in total; c says how crowded it is.', 'Wie blau eine Lösung bei gleicher Schichtdicke aussieht, hängt davon ab, wie viele Teilchen auf ein Volumen kommen, und genau das gibt c an: 0,020 : 0,050 = 0,20 : 0,500 = 0,40 mol/L. n gibt an, wie viel insgesamt da ist; c gibt an, wie dicht es verteilt ist.') },
  { id: 'i16c', unit: 16, kind: 'choice', format: 'predict', evidence: 'transfer', withConfidence: true, concepts: ['u16.concentration'],
    prompt: b('A drink contains 6.0 g of sugar per 100 mL; take it all as glucose (180.16 g/mol). What is the glucose concentration in mol/L?', 'Ein Getränk enthält 6,0 g Zucker pro 100 mL; nimm an, es ist alles Glucose (180,16 g/mol). Wie groß ist die Glucosekonzentration in mol/L?'),
    options: [
      { text: b('0.033 mol/L', '0,033 mol/L') },
      { text: b('60 mol/L', '60 mol/L') },
      { text: b('0.33 mol/L', '0,33 mol/L'), correct: true },
      { text: b('3.0 mol/L', '3,0 mol/L') },
    ],
    explain: b('Per litre that is 60 g (ρ = 60 g/L), and 60 g ÷ 180.16 g/mol = 0.33 mol: c = 0.33 mol/L. 0.033 is the moles in 100 mL, not per litre; 60 is the grams per litre, not moles.', 'Pro Liter sind das 60 g (β = 60 g/L), und 60 g : 180,16 g/mol = 0,33 mol: c = 0,33 mol/L. 0,033 ist die Stoffmenge in 100 mL, nicht pro Liter; 60 sind die Gramm pro Liter, nicht Mol.') },

  // ---------- u16.solution-volume ----------
  { id: 'i16d', unit: 16, kind: 'choice', format: 'predict', withConfidence: true, concepts: ['u16.solution-volume'], targets: ['volume-of-water'],
    prompt: b('You have weighed 5.84 g of sodium chloride (0.100 mol) and want 100 mL of solution with c = 1.00 mol/L. What do you do?', 'Du hast 5,84 g Natriumchlorid (0,100 mol) abgewogen und willst 100 mL Lösung mit c = 1,00 mol/L. Was tust du?'),
    options: [
      { text: b('Stir the salt into 100 mL of water measured in a cylinder', 'Das Salz in 100 mL Wasser einrühren, abgemessen mit einem Messzylinder'), mis: 'volume-of-water' },
      { text: b('Dissolve it in a little water in a 100 mL volumetric flask, then fill to the ring mark', 'Es in wenig Wasser in einem 100-mL-Messkolben lösen, dann bis zur Eichmarke auffüllen'), correct: true },
      { text: b('Put it in a 100 mL flask and add exactly 100 mL of water', 'Es in einen 100-mL-Messkolben geben und genau 100 mL Wasser dazugeben'), mis: 'volume-of-water' },
      { text: b('Dissolve it in 94 mL of water, since the salt itself takes up 6 mL', 'Es in 94 mL Wasser lösen, da das Salz selbst 6 mL einnimmt') },
    ],
    explain: b('c = n / V counts per litre of solution, so the solution, not the water, must end at 100 mL. Filling a volumetric flask to its mark does exactly that, whatever volume the dissolved salt adds. Guessing the salt\'s share of the volume does not work: dissolved ions do not keep the volume of the crystal.', 'c = n / V bezieht sich auf einen Liter Lösung, also muss die Lösung, nicht das Wasser, am Ende 100 mL betragen. Genau das erreicht das Auffüllen eines Messkolbens bis zur Marke, egal wie viel Volumen das gelöste Salz beiträgt. Den Volumenanteil des Salzes zu schätzen funktioniert nicht: Gelöste Ionen behalten nicht das Volumen des Kristalls.') },
  { id: 'i16e', unit: 16, kind: 'choice', format: 'why', evidence: 'explain', withConfidence: true, concepts: ['u16.solution-volume'], targets: ['volume-of-water'],
    prompt: b('1.00 mol of sodium chloride stirred into 1.000 L of water does not give a solution of exactly 1.00 mol/L. Why?', '1,00 mol Natriumchlorid, in 1,000 L Wasser eingerührt, ergibt keine Lösung mit genau 1,00 mol/L. Warum?'),
    options: [
      { text: b('It does: c counts the moles per litre of water added, so it is exactly 1.00 mol/L', 'Doch: c gibt die Mol pro Liter zugegebenes Wasser an, also sind es genau 1,00 mol/L'), mis: 'volume-of-water' },
      { text: b('Some of the salt reacts with the water and is lost', 'Ein Teil des Salzes reagiert mit dem Wasser und geht verloren') },
      { text: b('Part of the water evaporates while the salt dissolves', 'Ein Teil des Wassers verdunstet, während sich das Salz löst') },
      { text: b('The solution ends up slightly more than 1 L, so there is a little less than 1 mol per litre of it', 'Die Lösung hat am Ende etwas mehr als 1 L, also kommt etwas weniger als 1 mol auf einen Liter davon'), correct: true },
    ],
    explain: b('The dissolved ions take up room too, so the volume of the solution is slightly greater than one litre, and c = n / V comes out a little below 1.00 mol/L. Nothing reacts or evaporates. A volumetric flask filled to the mark avoids the problem.', 'Auch die gelösten Ionen brauchen Platz, also ist das Volumen der Lösung etwas größer als ein Liter, und c = n / V liegt etwas unter 1,00 mol/L. Nichts reagiert oder verdunstet. Ein bis zur Marke aufgefüllter Messkolben vermeidet das Problem.') },
  { id: 'i16f', unit: 16, kind: 'choice', format: 'predict', evidence: 'transfer', withConfidence: true, concepts: ['u16.solution-volume'], targets: ['volume-of-water'],
    prompt: b('A home recipe for saline says: stir 9 g of salt into 1 litre of water. Hospital saline is 9 g in 1 litre of solution. Compared with hospital saline, the home version is…', 'Ein Hausrezept für Kochsalzlösung lautet: 9 g Salz in 1 Liter Wasser einrühren. Infusions-Kochsalzlösung enthält 9 g in 1 Liter Lösung. Verglichen mit ihr ist die selbst gemachte Lösung…'),
    options: [
      { text: b('slightly more dilute: its volume ends a little over 1 L', 'etwas verdünnter: Ihr Volumen liegt am Ende etwas über 1 L'), correct: true },
      { text: b('exactly the same: V is the 1 L of water in both', 'genau gleich: V ist in beiden Fällen der 1 L Wasser'), mis: 'volume-of-water' },
      { text: b('slightly more concentrated: the salt takes up some of the water', 'etwas konzentrierter: Das Salz nimmt einen Teil des Wassers auf') },
      { text: b('twice as concentrated: in water the salt splits into two ions', 'doppelt so konzentriert: Im Wasser zerfällt das Salz in zwei Ionen') },
    ],
    explain: b('The salt adds a little volume, so the home version is slightly more than a litre of solution and a little more dilute; for 9 g the difference is small. Both split into the same ions in the same way, so that cannot make one of them more concentrated.', 'Das Salz bringt etwas Volumen mit, also ergibt das Hausrezept etwas mehr als einen Liter Lösung und ist ein wenig verdünnter; bei 9 g ist der Unterschied klein. Beide zerfallen auf dieselbe Weise in dieselben Ionen, das kann keine von beiden konzentrierter machen.') },

  // ---------- u16.make ----------
  { id: 'i16g', unit: 16, kind: 'choice', format: 'predict', withConfidence: true, concepts: ['u16.make'],
    prompt: b('How many grams of potassium permanganate ({{KMnO4}}, 158.03 g/mol) do you need for 250 mL of solution with c = 0.0200 mol/L?', 'Wie viel Gramm Kaliumpermanganat ({{KMnO4}}, 158,03 g/mol) brauchst du für 250 mL Lösung mit c = 0,0200 mol/L?'),
    options: [
      { text: b('3.16 g', '3,16 g') },
      { text: b('790 g', '790 g') },
      { text: b('0.0050 g', '0,0050 g') },
      { text: b('0.790 g', '0,790 g'), correct: true },
    ],
    explain: b('n = c × V = 0.0200 mol/L × 0.250 L = 0.00500 mol, and m = n × M = 0.00500 × 158.03 = 0.790 g. 3.16 g is for a whole litre, 790 g forgets to turn mL into L, and 0.0050 is the moles, not the grams.', 'n = c · V = 0,0200 mol/L · 0,250 L = 0,00500 mol, und m = n · M = 0,00500 · 158,03 = 0,790 g. 3,16 g reichen für einen ganzen Liter, bei 790 g fehlt die Umrechnung von mL in L, und 0,0050 ist die Stoffmenge, nicht die Masse.') },
  { id: 'i16h', unit: 16, kind: 'choice', format: 'why', evidence: 'explain', withConfidence: true, concepts: ['u16.make'],
    prompt: b('To make copper sulfate solution from the blue crystals, you calculate with 249.68 g/mol, not with 159.60 g/mol for {{CuSO4}}. Why?', 'Um aus den blauen Kristallen Kupfersulfatlösung anzusetzen, rechnest du mit 249,68 g/mol, nicht mit 159,60 g/mol für {{CuSO4}}. Warum?'),
    options: [
      { text: b('The crystals hold five water molecules per formula unit, about 36 % of their mass, and you weigh them too', 'Die Kristalle enthalten fünf Wassermoleküle pro Formeleinheit, etwa 36 % ihrer Masse, und die wiegst du mit'), correct: true },
      { text: b('Copper sulfate grows heavier as it takes up water from the flask', 'Kupfersulfat wird schwerer, wenn es im Kolben Wasser aufnimmt') },
      { text: b('159.60 g/mol is for copper sulfate gas, not the solid', '159,60 g/mol gilt für gasförmiges Kupfersulfat, nicht für den Feststoff') },
      { text: b('It makes no difference: both give the same concentration', 'Es macht keinen Unterschied: Beide ergeben dieselbe Konzentration') },
    ],
    explain: b('CuSO₄·5H₂O carries water of crystallisation: 5 × 18.015 = 90.08 of its 249.68 g/mol is water. The balance weighs that water too, so each gram of crystals holds less copper sulfate than a gram of the dry salt would. With 159.60 the solution would come out only 64 % as concentrated as planned.', 'CuSO₄·5H₂O enthält Kristallwasser: 5 · 18,015 = 90,08 seiner 249,68 g/mol sind Wasser. Die Waage wiegt dieses Wasser mit, also enthält jedes Gramm Kristalle weniger Kupfersulfat als ein Gramm des wasserfreien Salzes. Mit 159,60 hätte die Lösung nur 64 % der geplanten Konzentration.') },
  { id: 'i16i', unit: 16, kind: 'estimate', format: 'estimate', evidence: 'transfer', concepts: ['u16.make'],
    prompt: b('A pharmacy makes 500 mL of sodium chloride solution with c = 0.154 mol/L (58.44 g/mol). How many grams of salt does it weigh out?', 'Eine Apotheke setzt 500 mL Natriumchloridlösung mit c = 0,154 mol/L an (58,44 g/mol). Wie viel Gramm Salz wiegt sie ab?'),
    min: 0, max: 20, step: 0.1, answer: 4.5, tolerance: 0.1, suffix: ' g',
    near: [
      { value: 9, tol: 0.2, note: b('That is the salt for a whole litre. 500 mL needs half of it.', 'Das ist das Salz für einen ganzen Liter. 500 mL brauchen die Hälfte.') },
    ],
    explain: b('n = 0.154 mol/L × 0.500 L = 0.0770 mol; m = 0.0770 × 58.44 = 4.50 g. That is half a litre of normal saline: 9 g per litre.', 'n = 0,154 mol/L · 0,500 L = 0,0770 mol; m = 0,0770 · 58,44 = 4,50 g. Das ist ein halber Liter physiologische Kochsalzlösung: 9 g pro Liter.') },

  // ---------- u16.dilution ----------
  { id: 'i16j', unit: 16, kind: 'choice', format: 'predict', withConfidence: true, concepts: ['u16.dilution'], targets: ['volume-of-water'],
    prompt: b('You pipette 25 mL of a 0.40 mol/L solution into a 250 mL volumetric flask and fill it to the mark. What is c now?', 'Du pipettierst 25 mL einer Lösung mit 0,40 mol/L in einen 250-mL-Messkolben und füllst bis zur Marke auf. Wie groß ist c jetzt?'),
    options: [
      { text: b('0.040 mol/L', '0,040 mol/L'), correct: true },
      { text: b('0.036 mol/L', '0,036 mol/L'), mis: 'volume-of-water' },
      { text: b('4.0 mol/L', '4,0 mol/L') },
      { text: b('0.40 mol/L', '0,40 mol/L') },
    ],
    explain: b('c₂ = c₁ × V₁ ÷ V₂ = 0.40 × 25 ÷ 250 = 0.040 mol/L: ten times the volume, one tenth the concentration. 0.036 divides by 275 mL, as if 250 mL of water had been added; filling to the mark makes the whole solution 250 mL.', 'c₂ = c₁ · V₁ : V₂ = 0,40 · 25 : 250 = 0,040 mol/L: zehnfaches Volumen, ein Zehntel der Konzentration. 0,036 teilt durch 275 mL, als wären 250 mL Wasser dazugekommen; das Auffüllen bis zur Marke macht die ganze Lösung 250 mL.') },
  { id: 'i16k', unit: 16, kind: 'choice', format: 'why', evidence: 'explain', withConfidence: true, concepts: ['u16.dilution'],
    prompt: b('Why does the dilution formula c₁ × V₁ = c₂ × V₂ work?', 'Warum gilt die Verdünnungsformel c₁ · V₁ = c₂ · V₂?'),
    options: [
      { text: b('The concentration stays the same when you add water', 'Die Konzentration bleibt beim Zugeben von Wasser gleich') },
      { text: b('c × V is the moles of solute, and the water added brings none, so the moles before and after are equal', 'c · V ist die Stoffmenge des gelösten Stoffs, und das zugegebene Wasser bringt keine mit, also ist sie vorher und nachher gleich'), correct: true },
      { text: b('The volume of the solution stays the same when you dilute it', 'Das Volumen der Lösung bleibt beim Verdünnen gleich') },
      { text: b('The water added has the same mass as the solution', 'Das zugegebene Wasser hat dieselbe Masse wie die Lösung') },
    ],
    explain: b('n = c × V on both sides. Everything the pipette carried ends up in the new flask, and pure water adds no solute, so n₁ = n₂: c₁ × V₁ = c₂ × V₂. The volume grows and c falls in the same proportion.', 'Auf beiden Seiten steht n = c · V. Alles, was die Pipette mitgebracht hat, landet im neuen Kolben, und reines Wasser bringt keinen gelösten Stoff mit, also n₁ = n₂: c₁ · V₁ = c₂ · V₂. Das Volumen wächst, und c sinkt im selben Verhältnis.') },
  { id: 'i16l', unit: 16, kind: 'choice', format: 'predict', evidence: 'transfer', withConfidence: true, concepts: ['u16.dilution'], targets: ['volume-of-water'],
    prompt: b('You have a stock solution with c = 1.00 mol/L and need 0.100 mol/L. Which of these gives it?', 'Du hast eine Stammlösung mit c = 1,00 mol/L und brauchst 0,100 mol/L. Was davon ergibt sie?'),
    options: [
      { text: b('10 mL of stock in a 50 mL flask, filled to the mark', '10 mL Stammlösung in einem 50-mL-Messkolben, bis zur Marke aufgefüllt') },
      { text: b('5 mL of stock mixed with 50 mL of water', '5 mL Stammlösung, mit 50 mL Wasser gemischt'), mis: 'volume-of-water' },
      { text: b('5 mL of stock in a 50 mL flask, filled to the mark', '5 mL Stammlösung in einem 50-mL-Messkolben, bis zur Marke aufgefüllt'), correct: true },
      { text: b('50 mL of stock in a 100 mL flask, filled to the mark', '50 mL Stammlösung in einem 100-mL-Messkolben, bis zur Marke aufgefüllt') },
    ],
    explain: b('A tenfold dilution: V₂ = 10 × V₁. 5 mL made up to 50 mL gives 1.00 × 5 ÷ 50 = 0.100 mol/L. 5 mL plus 50 mL of water makes about 55 mL, so about 0.091 mol/L; 10 mL into 50 mL gives 0.200 and 50 mL into 100 mL gives 0.500 mol/L.', 'Eine Verdünnung auf ein Zehntel: V₂ = 10 · V₁. 5 mL, auf 50 mL aufgefüllt, ergeben 1,00 · 5 : 50 = 0,100 mol/L. 5 mL plus 50 mL Wasser ergeben etwa 55 mL, also etwa 0,091 mol/L; 10 mL auf 50 mL ergeben 0,200 und 50 mL auf 100 mL 0,500 mol/L.') },

  // ---------- u16.portion ----------
  { id: 'i16m', unit: 16, kind: 'choice', format: 'predict', withConfidence: true, concepts: ['u16.portion'], targets: ['portion-diluted'],
    prompt: b('A 250 mL flask holds glucose solution with c = 0.200 mol/L. You pipette 10 mL of it into a beaker. What is c in the beaker?', 'Ein 250-mL-Messkolben enthält Glucoselösung mit c = 0,200 mol/L. Du pipettierst 10 mL davon in ein Becherglas. Wie groß ist c im Becherglas?'),
    options: [
      { text: b('0.00800 mol/L', '0,00800 mol/L'), mis: 'portion-diluted' },
      { text: b('0.0020 mol/L', '0,0020 mol/L'), mis: 'portion-diluted' },
      { text: b('0.200 mol/L', '0,200 mol/L'), correct: true },
      { text: b('5.0 mol/L', '5,0 mol/L') },
    ],
    explain: b('It is the same solution, so c is still 0.200 mol/L. The beaker holds fewer moles, 0.200 × 0.010 = 0.0020 mol, but in proportionally less volume. 0.0020 is that amount in mol, not a concentration.', 'Es ist dieselbe Lösung, also bleibt c bei 0,200 mol/L. Im Becherglas ist weniger Stoffmenge, 0,200 · 0,010 = 0,0020 mol, aber in entsprechend weniger Volumen. 0,0020 ist diese Stoffmenge in Mol, keine Konzentration.') },
  { id: 'i16n', unit: 16, kind: 'choice', format: 'why', evidence: 'explain', withConfidence: true, concepts: ['u16.portion'], targets: ['portion-diluted'],
    prompt: b('A cup of tea poured from a well-stirred pot tastes just as strong as the tea left in the pot. Why?', 'Eine Tasse Tee aus einer gut umgerührten Kanne schmeckt genauso stark wie der Tee, der in der Kanne bleibt. Warum?'),
    options: [
      { text: b('The cup holds fewer dissolved particles, so it is weaker, but the tongue cannot tell', 'Die Tasse enthält weniger gelöste Teilchen, ist also schwächer, aber die Zunge merkt es nicht'), mis: 'portion-diluted' },
      { text: b('The strongest tea sinks to the bottom, where it is poured from', 'Der stärkste Tee sinkt nach unten, und von dort wird ausgegossen') },
      { text: b('The cup holds fewer particles, but in proportionally less water, so the same concentration', 'Die Tasse enthält weniger Teilchen, aber in entsprechend weniger Wasser, also dieselbe Konzentration'), correct: true },
      { text: b('Pouring mixes in air, which makes the tea taste stronger', 'Beim Ausgießen kommt Luft dazu, und dadurch schmeckt der Tee stärker') },
    ],
    explain: b('A well-mixed solution is the same all the way through: every millilitre holds the same number of dissolved particles. A cup takes a share of the particles and the same share of the water, so its concentration matches the pot\'s.', 'Eine gut gemischte Lösung ist überall gleich: Jeder Milliliter enthält gleich viele gelöste Teilchen. Eine Tasse nimmt einen Anteil der Teilchen und denselben Anteil des Wassers mit, also stimmt ihre Konzentration mit der in der Kanne überein.') },
  { id: 'i16o', unit: 16, kind: 'choice', format: 'predict', evidence: 'transfer', withConfidence: true, concepts: ['u16.portion'], targets: ['portion-diluted'],
    prompt: b('A lab measures sodium in a 2 mL blood sample: 140 mmol/L (normal is 135–145). What does that say about the sodium in the patient\'s blood as a whole?', 'Ein Labor misst Natrium in einer Blutprobe von 2 mL: 140 mmol/L (normal sind 135–145). Was sagt das über das Natrium im ganzen Blut des Patienten?'),
    options: [
      { text: b('Its concentration is also about 140 mmol/L', 'Seine Konzentration beträgt ebenfalls etwa 140 mmol/L'), correct: true },
      { text: b('It is far more concentrated: 2 mL is only a tiny part of the blood', 'Es ist viel konzentrierter: 2 mL sind nur ein winziger Teil des Bluts'), mis: 'portion-diluted' },
      { text: b('The sample holds 0.28 mmol, so the blood has 0.28 mmol/L', 'Die Probe enthält 0,28 mmol, also hat das Blut 0,28 mmol/L'), mis: 'portion-diluted' },
      { text: b('Nothing: a sample that small cannot show the concentration', 'Nichts: Eine so kleine Probe kann die Konzentration nicht zeigen') },
    ],
    explain: b('A small sample of a well-mixed liquid has the same concentration as the whole, which is why a 2 mL tube is enough. The tube holds 140 mmol/L × 0.002 L = 0.28 mmol of sodium; that is its amount, not a concentration.', 'Eine kleine Probe einer gut gemischten Flüssigkeit hat dieselbe Konzentration wie das Ganze; deshalb reicht ein Röhrchen mit 2 mL. Es enthält 140 mmol/L · 0,002 L = 0,28 mmol Natrium; das ist seine Stoffmenge, keine Konzentration.') },

  // ---------- u16.particles ----------
  { id: 'i16p', unit: 16, kind: 'rank', format: 'rank', concepts: ['u16.particles'], mis: 'grams-per-litre-counts', targets: ['grams-per-litre-counts'],
    prompt: b('10 g of each is dissolved and made up to 1 L. Rank by the number of dissolved particles, most first. Sodium chloride {{NaCl}} (58.44 g/mol, splits into 2 ions), calcium chloride {{CaCl2}} (110.98 g/mol, 3 ions), glucose (180.16 g/mol, stays whole), sucrose (342.30 g/mol, stays whole).',
      'Von jedem Stoff werden 10 g gelöst und auf 1 L aufgefüllt. Ordne nach der Zahl der gelösten Teilchen, die meisten zuerst. Natriumchlorid {{NaCl}} (58,44 g/mol, zerfällt in 2 Ionen), Calciumchlorid {{CaCl2}} (110,98 g/mol, 3 Ionen), Glucose (180,16 g/mol, bleibt ganz), Saccharose (342,30 g/mol, bleibt ganz).'),
    order: [b('sodium chloride', 'Natriumchlorid'), b('calcium chloride', 'Calciumchlorid'), b('glucose', 'Glucose'), b('sucrose', 'Saccharose')],
    explain: b('Particles = 10 g ÷ M × ions per formula unit: NaCl 0.171 × 2 = 0.342 mol, CaCl₂ 0.0901 × 3 = 0.270, glucose 0.0555, sucrose 0.0292. Same grams, more than ten times the particles from first to last. Calcium chloride splits into more ions, but its formula unit is almost twice as heavy.', 'Teilchen = 10 g : M · Ionen pro Formeleinheit: NaCl 0,171 · 2 = 0,342 mol, CaCl₂ 0,0901 · 3 = 0,270, Glucose 0,0555, Saccharose 0,0292. Gleiche Grammzahl, vom ersten zum letzten mehr als zehnmal so viele Teilchen. Calciumchlorid zerfällt in mehr Ionen, aber seine Formeleinheit ist fast doppelt so schwer.') },
  { id: 'i16q', unit: 16, kind: 'choice', format: 'why', evidence: 'explain', withConfidence: true, concepts: ['u16.particles'], targets: ['grams-per-litre-counts'],
    prompt: b('One litre holds 10 g of sodium chloride, another 10 g of glucose. The salt solution holds about six times as many dissolved particles. Why?', 'Ein Liter enthält 10 g Natriumchlorid, ein anderer 10 g Glucose. Die Salzlösung enthält etwa sechsmal so viele gelöste Teilchen. Warum?'),
    options: [
      { text: b('It does not: equal grams per litre mean equal numbers of particles', 'Stimmt nicht: Gleiche Gramm pro Liter bedeuten gleich viele Teilchen'), mis: 'grams-per-litre-counts' },
      { text: b('A formula unit of NaCl is about three times lighter than a glucose molecule, and it splits into two ions', 'Eine Formeleinheit NaCl ist etwa dreimal leichter als ein Glucosemolekül, und sie zerfällt in zwei Ionen'), correct: true },
      { text: b('Salt is denser than sugar, so more of it fits into a litre', 'Salz hat eine größere Dichte als Zucker, also passt mehr davon in einen Liter') },
      { text: b('Glucose molecules stick together in pairs in water', 'Glucosemoleküle lagern sich im Wasser paarweise zusammen') },
    ],
    explain: b('10 g ÷ 58.44 = 0.171 mol of NaCl, but 10 g ÷ 180.16 = 0.0555 mol of glucose: 3.08 times as many formula units. Each splits into Na⁺ and Cl⁻, so 2 × 3.08 ≈ 6.2 times as many particles. Grams per litre (ρ) do not count particles; c and the number of ions do.', '10 g : 58,44 = 0,171 mol NaCl, aber 10 g : 180,16 = 0,0555 mol Glucose: 3,08-mal so viele Formeleinheiten. Jede zerfällt in Na⁺ und Cl⁻, also 2 · 3,08 ≈ 6,2-mal so viele Teilchen. Gramm pro Liter (β) geben keine Teilchenzahl an; das tun c und die Zahl der Ionen.') },
  { id: 'i16r', unit: 16, kind: 'choice', format: 'predict', evidence: 'transfer', withConfidence: true, concepts: ['u16.particles'], targets: ['grams-per-litre-counts'],
    prompt: b('The oral rehydration solution recommended by WHO and UNICEF holds, per litre, 2.6 g of sodium chloride (58.44 g/mol) and 13.5 g of glucose (180.16 g/mol), with two other salts. Which of the two gives more dissolved particles?', 'Die orale Rehydratationslösung (Trinklösung gegen Durchfall), die WHO und UNICEF empfehlen, enthält pro Liter 2,6 g Natriumchlorid (58,44 g/mol) und 13,5 g Glucose (180,16 g/mol), dazu zwei weitere Salze. Welcher der beiden Stoffe liefert mehr gelöste Teilchen?'),
    options: [
      { text: b('Glucose, by about five times: it has five times the grams', 'Glucose, etwa fünfmal so viele: Sie hat fünfmal so viele Gramm'), mis: 'grams-per-litre-counts' },
      { text: b('About the same, since both come to roughly 0.05 mol', 'Etwa gleich viele, da beide auf etwa 0,05 mol kommen') },
      { text: b('Sodium chloride: about 89 mmol of ions against 75 mmol of glucose', 'Natriumchlorid: etwa 89 mmol Ionen gegenüber 75 mmol Glucose'), correct: true },
      { text: b('Glucose, because sugar molecules are bigger than salt particles', 'Glucose, weil Zuckermoleküle größer sind als Salzteilchen') },
    ],
    explain: b('Salt: 2.6 ÷ 58.44 = 0.0445 mol, two ions each, 89 mmol. Glucose: 13.5 ÷ 180.16 = 0.0749 mol = 75 mmol (the figure WHO gives). Five times the grams of glucose still gives fewer particles than the salt.', 'Salz: 2,6 : 58,44 = 0,0445 mol, je zwei Ionen, 89 mmol. Glucose: 13,5 : 180,16 = 0,0749 mol = 75 mmol (der Wert, den die WHO angibt). Fünfmal so viele Gramm Glucose liefern trotzdem weniger Teilchen als das Salz.') },
  { id: 'i16s', unit: 16, kind: 'estimate', format: 'estimate', evidence: 'transfer', concepts: ['u16.particles', 'u16.make'], targets: ['grams-per-litre-counts'],
    prompt: b('Normal saline holds 308 mmol of dissolved particles per litre. How many grams of glucose (180.16 g/mol) per litre would give the same number of particles?', 'Physiologische Kochsalzlösung enthält 308 mmol gelöste Teilchen pro Liter. Wie viel Gramm Glucose (180,16 g/mol) pro Liter ergäben gleich viele Teilchen?'),
    min: 0, max: 120, step: 0.5, answer: 55.5, tolerance: 1.5, suffix: ' g',
    near: [
      { value: 9, tol: 0.5, note: b('That is saline\'s grams, but glucose molecules are about three times heavier than NaCl formula units.', 'Das sind die Gramm der Kochsalzlösung, aber Glucosemoleküle sind etwa dreimal so schwer wie Formeleinheiten von NaCl.') },
      { value: 27.7, tol: 1.5, note: b('That matches 154 mmol, the NaCl formula units. Each splits into two ions; glucose stays whole, so it needs twice as many molecules.', 'Das passt zu 154 mmol, den Formeleinheiten NaCl. Jede zerfällt in zwei Ionen; Glucose bleibt ganz, braucht also doppelt so viele Moleküle.') },
    ],
    explain: b('0.308 mol × 180.16 g/mol = 55.5 g. The real glucose drip uses 50 g per litre (278 mmol), close to it: both sit near blood\'s 275–295 (iso-osmotic).', '0,308 mol · 180,16 g/mol = 55,5 g. Die echte Glucoselösung enthält 50 g pro Liter (278 mmol), nicht weit davon: Beide liegen nahe an den 275–295 des Bluts.') },
];
