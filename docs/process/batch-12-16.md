# Batch brief: units 12–16 (module 4, the mole)

Five units on one idea: a sample can be read at four scales, grams → moles → number of particles → the particles
themselves, and the equation's numbers are counts of particles, never grams. Units 12–15 use the new **Zoom Ladder**,
unit 16 the new **Lab Bench**.

Already done by the main session (do not redo): concepts in curriculum.ts; `src/content/stoich.ts` (N_A, the formula
parser, `molarMass()`, `massShares()`, `sideCount()`, LADDER_SAMPLES, EQUATIONS, SOLUTES, FLASKS, PIPETTES); the
`ladder` and `bench` Show variants and the `Rung` type in unitTypes.ts; placeholder `src/sim/zoomLadderUI.ts` and
`src/sim/labBenchUI.ts` with their final options; `ctx.ladder()` and `ctx.bench()`; dev routes `#/dev/ladder` (takes
`?mode=equation|reaction&start=<id>`) and `#/dev/bench`; empty banks `src/content/bank/u12.ts`–`u16.ts`, registered.

**Numbers:** every molar mass, mass fraction and count in the text must equal what stoich.ts computes (from the
elements.ts masses), rounded sensibly; check with a tsx one-liner, e.g.
`npx tsx -e "import {molarMass} from './src/content/stoich.ts'; console.log(molarMass('Fe2O3'))"`.
Measured values (densities, mixture ratios, yields, blood values) need a fetched source named in a comment.
N_A = 6.022 × 10²³ mol⁻¹ in text (exact value 6.02214076 × 10²³ since the 2019 SI; say once in unit 12 that the mole
is now defined by this count, no longer by 12 g of carbon-12).

**Scientific notation in text:** EN "6.022 × 10²³", DE "6,022 · 10²³" (Unicode superscripts).

**Glossary ids per unit** (add only your own; you may use the others' ids as [[chips]], they exist after wiring;
`mole` already exists, unit 12): 12 `avogadro`, `molar-mass` · 13 `formula-unit`, `mass-fraction`,
`empirical-formula` · 14 `coefficient`, `conservation-of-mass`, `reactant` · 15 `limiting-reactant`, `excess`,
`percent-yield` · 16 `concentration`, `volumetric-flask`, `dilution`.

**Bank ids:** i12a, i12b, … (i13a… etc.).

## Units

### Unit 12, Counting by weighing (module 4)

- Concepts: u12.too-many, u12.weigh-to-count, u12.mole, u12.molar-mass, u12.n-m-M, u12.equal-moles.
- Engine: Zoom Ladder, sample mode. Explore creates `ctx.ladder({ mode: 'sample', start: 'C', grams: 12, samples:
  ['C', 'Mg', 'Al', 'Fe', 'Cu', 'Au', 'Pb', 'H2', 'H2O'], controls: { compare: true } })`.
- Tasks (event that ticks):
  - `zoom` **key**: visit all four rungs (`rung` events cover grams, moles, count, particles).
  - `onemol` **key**: put 1 mol of carbon on the balance (`mass('C', g, mol, count)`, |mol − 1| ≤ 0.01).
  - `same-mass` **key**: compare equal masses of two different elements (`compare(a, b, 'mass')`, b ≠ null, b ≠ a).
  - `same-moles`: compare equal amounts of two different elements (`compare(a, b, 'moles')`).
  - `water`: weigh out 1 mol of water and read the count (`mass('H2O', …)`, |mol − 1| ≤ 0.02).
  - `light` **challenge**: find a sample of at most 10 g with more than 10²⁴ particles (`mass(id, g, mol, count)`,
    g ≤ 10 and count > 1e24; only hydrogen does it).
- Hook: three blocks of 100 g each, aluminium, copper and gold. Which holds the most atoms? Data: atomic mass (u, from
  elements.ts), density (g/cm³, measured, fetch a source) and block volume (computed). Clash: the gold block is
  the smallest and its atoms are packed tightest, yet … Trap options: "all the same, 100 g is 100 g"
  (equal-mass-equal-count), "gold, packed tightest". Answer: aluminium (lightest atoms).
- Predictions: (1) equal amounts (say 0.5 mol) of magnesium and lead on two pans: which is heavier and about how many
  times? (2) **transfer**: 1 kg of iron nails against 1 kg of aluminium foil: about how many times more atoms in the
  foil (55.845 / 26.982 ≈ 2.07)?
- Examples: 18 g of water (one mouthful) is 1 mol, 6.022 × 10²³ molecules; a 5 g gold ring in moles and atoms;
  **where the model breaks**: counting by weighing assumes the usual isotope mix. Chlorine's 35.45 u is an average,
  no single atom has it; 18 g of heavy water (D₂O, 20.03 g/mol) is not 1 mol.
- Spot the flaw: **4 lines, first wrong step index 2.**
- Misconceptions: reuse `mass-is-one-atom` (unit 0); new `equal-mass-equal-count` (Equal masses hold equal numbers of
  atoms / Gleiche Massen enthalten gleich viele Atome), `mole-is-mass` (The mole is a mass, 1 mol = 1 g or 12 g /
  Das Mol ist eine Masse).
- German: Stoffmenge n (Einheit Mol), Teilchenzahl N, Avogadro-Konstante N_A, molare Masse M (g/mol), atomare
  Masseneinheit u, n = m / M, N = n · N_A. Say once: older books call N_A "Loschmidt-Zahl"; physics uses "Avogadro-
  Konstante". "molare Masse", never "wiegt … g/mol".

### Unit 13, Formulas and molar mass (module 4)

- Concepts: u13.formula-count, u13.molar-mass-sum, u13.mol-of-atoms, u13.formula-unit, u13.mass-fraction,
  u13.empirical.
- Engine: Zoom Ladder, sample mode with the formula breakdown. Explore creates `ctx.ladder({ mode: 'sample',
  start: 'H2O', grams: 18, samples: ['H2O', 'CO2', 'CO', 'N2', 'C2H4', 'NH3', 'C6H12O6', 'NaCl', 'Ca(OH)2', 'CaCO3',
  'FeO', 'Fe2O3', 'Fe3O4'], controls: { compare: true, breakdown: true } })`.
- Tasks:
  - `water` **key**: open the breakdown of water (`breakdown('H2O', M)`).
  - `glucose` **key**: open the breakdown of glucose (`breakdown('C6H12O6', M)`).
  - `salt` **key**: look at table salt on the particle rung (current sample 'NaCl' while `rung('particles')`; the
    wiring tracks both from `sample` and `rung`).
  - `bracket`: open the breakdown of Ca(OH)₂ (`breakdown('Ca(OH)2', M)`).
  - `ores`: open the breakdowns of two different iron oxides (any two of FeO, Fe2O3, Fe3O4).
  - `twins` **challenge**: find two different substances whose molar masses differ by less than 0.1 g/mol (two
    `breakdown` events, different ids, |M₁ − M₂| < 0.1: CO, N₂, C₂H₄).
- Hook: iron ores. Which holds the most iron per kilogram: FeO (wüstite, rare), Fe₂O₃ (haematite), Fe₃O₄
  (magnetite), FeS₂ (pyrite)? Data table: formula, iron atoms per formula unit, molar mass (no percentages: those are
  the answer). Trap: Fe₃O₄, "the most iron atoms per formula". Answer: FeO (77.7 %; Fe₃O₄ 72.4 %, Fe₂O₃ 69.9 %,
  FeS₂ 46.6 %).
- Predictions: (1) molar mass of Ca(OH)₂ (74.09; traps: 58.09 if the bracket only multiplies H, 57.09 if it is ignored).
  (2) **transfer**: how many moles of H atoms in 90 g of glucose (0.5 mol glucose → 6 mol H)?
- Examples: water is 88.8 % oxygen by mass though only one atom in three; table salt has no molecules, 58.44 g/mol
  is per formula unit (Na⁺ and Cl⁻ in a 1:1 lattice, unit 4); **where the model breaks**: glucose (C₆H₁₂O₆), acetic
  acid (C₂H₄O₂) and formaldehyde (CH₂O) have the same mass fractions, so analysis gives only CH₂O; the molar mass is
  needed for the real formula.
- Spot the flaw: **5 lines, first wrong step index 4** (the last step).
- Misconceptions: new `formula-count-once` (Each element's mass counted once, ignoring the subscript / Jede Atommasse
  nur einmal gezählt, Index übersehen), `ionic-molecules` (Salts are made of molecules / Salze bestehen aus
  Molekülen), `atoms-count-share` (More atoms of an element in the formula means a bigger mass share / Mehr Atome eines
  Elements in der Formel bedeuten einen größeren Massenanteil).
- German: Summenformel (also Molekülformel; say once), Verhältnisformel (empirical formula), Formeleinheit, Index,
  Massenanteil w (in %), molare Masse M. Say once: Verhältnisformel is what salts are always written with.

### Unit 14, Balancing equations (module 4)

- Concepts: u14.conservation, u14.coefficients, u14.ratio, u14.mass, u14.method, u14.diatomic.
- Engine: Zoom Ladder, equation mode. Explore creates `ctx.ladder({ mode: 'equation', start: 'h2o', equations:
  ['h2o', 'mgo', 'ch4', 'nh3', 'c2h6'], controls: { trap: true } })`. Predictions and examples should use other
  equations from EQUATIONS (al2o3, fe2o3, photo, glucose, c3h8, caco3, zn, nacl) so explore gives nothing away.
- Tasks:
  - `water` **key**: balance hydrogen burning (`balanced('h2o', coeffs, true)`).
  - `methane` **key**: balance methane burning (`balanced('ch4', coeffs, true)`).
  - `subscript` **key**: try the subscript "fix" and read why it is not allowed (`subscript(eqId, alt)`).
  - `ammonia`: balance the ammonia synthesis (`balanced('nh3', coeffs, true)`).
  - `grams`: look at a balanced equation on the grams rung (balanced state and `rung('grams')` at the same time).
  - `ethane` **challenge**: balance ethane burning (`balanced('c2h6', coeffs, true)`; needs 7 O₂, the half trap).
- Hook: burning changes mass in opposite ways. Steel wool or magnesium gets heavier when it burns, a candle or wood
  gets lighter; in a sealed flask the mass does not change (Lavoisier). Measured values need a fetched source; if you
  use calculated masses instead, say "calculated". Trap: "burning destroys matter" (mass-lost-burning).
- Predictions: (1) **transfer**: the coefficient of O₂ in aluminium burning (4 Al + 3 O₂ → 2 Al₂O₃). (2) 2 H₂ + O₂ →
  2 H₂O: 4 g of hydrogen burns with how many grams of oxygen (32 g; trap 2 g, the coefficients read as masses)?
- Examples: methane on a gas stove counted atom by atom; ethane needs 3½ O₂, so double everything; **where the model
  breaks**: photosynthesis, 6 CO₂ + 6 H₂O → C₆H₁₂O₆ + 6 O₂, balances, but the equation cannot say which molecule each
  atom came from (isotope experiments showed the O₂ comes from the water); a balanced equation counts atoms, it is not
  a mechanism.
- Spot the flaw: **3 lines, first wrong step index 0.**
- Misconceptions: new `balance-by-subscript` (Balancing by changing subscripts / Ausgleichen durch Ändern der Indizes),
  `coefficients-mass-ratio` (Coefficients give mass ratios / Koeffizienten geben Massenverhältnisse an),
  `mass-lost-burning` (Burning destroys matter, so mass is lost / Verbrennen vernichtet Materie).
- German: Reaktionsgleichung, Edukte, Produkte, Koeffizient (also stöchiometrischer Faktor), Index, Gesetz von der
  Erhaltung der Masse. Say once: German schools say "ausgleichen" or "einrichten" for balancing.

### Unit 15, Limiting reagent and yield (module 4)

- Concepts: u15.ratio, u15.limiting, u15.compare, u15.theoretical, u15.percent, u15.excess.
- Engine: Zoom Ladder, reaction mode. Explore creates `ctx.ladder({ mode: 'reaction', start: 'h2o', equations:
  ['h2o', 'nh3', 'mgo', 'ch4'], controls: { yield: true } })`.
- Tasks:
  - `exact` **key**: run a reaction with nothing left over (`react(…, limiting = -1, …)`).
  - `leftover` **key**: run a reaction with one reactant left over (`react` with limiting ≥ 0).
  - `heavier` **key**: run a reaction where the limiting reactant is the one with the larger mass (the wiring computes
    grams = amounts × molarMass; limiting's grams > every other reactant's grams).
  - `grams`: set a reaction up in grams and run it (`react(…, by = 'g')`).
  - `yield`: enter an actual yield and read the percent yield (`yield(eqId, g, pct)`).
  - `haber` **challenge**: make exactly 2 mol of ammonia with nothing left over (`react('nh3', …)`, limiting = −1,
    product[0] within 1 % of 2).
- Hook: the Space Shuttle main engines (RS-25) burned hydrogen and oxygen at a mass ratio of about 6 : 1 (oxygen :
  hydrogen; fetch a NASA source). The equation needs 7.94 : 1 (from stoich.ts). Which runs out first? Trap: hydrogen,
  "there is six times less of it" (less-mass-limiting). Answer: oxygen; the hydrogen excess was on purpose (lighter
  exhaust, more thrust per kilogram of propellant; say it at that level).
- Predictions: (1) 10 g H₂ with 10 g O₂: how much water forms (11.26 g; traps 20 g, 90 g)? (2) **transfer**: 28 g N₂
  with 3 g H₂ for ammonia: which is limiting, and how much NH₃ (H₂; 0.992 mol NH₃, 16.9 g)?
- Examples: a sandwich recipe as the plain picture (2 bread + 1 cheese), then hydrogen and oxygen; percent yield of a
  real preparation (find a sourced school or industrial yield); **where the model breaks**: some reactions stop before
  the limiting reactant is used up (equilibrium, unit 24): the Haber process converts only part of the gas per pass
  (fetch a source), so yield < 100 % is not only spillage. A yield over 100 % means a wet or impure product.
- Spot the flaw: **5 lines, first wrong step index 1.**
- Misconceptions: new `less-mass-limiting` (The reactant with the smaller mass runs out first / Das Edukt mit der
  kleineren Masse ist zuerst verbraucht), `ratio-ignored-limiting` (Comparing moles without the coefficients /
  Stoffmengen ohne Koeffizienten verglichen); reuse `coefficients-mass-ratio` (unit 14).
- German: limitierendes Edukt (also "im Unterschuss"), im Überschuss, Stoffmengenverhältnis, theoretische Ausbeute,
  Ausbeute in Prozent (prozentuale Ausbeute).

### Unit 16, Concentration (module 4)

- Concepts: u16.concentration, u16.solution-volume, u16.make, u16.dilution, u16.portion, u16.particles.
- Engine: Lab Bench. Explore creates `ctx.bench({ start: 'CuSO4-5H2O', solutes: ['CuSO4-5H2O', 'NaCl', 'C6H12O6',
  'KMnO4'], controls: { dilute: true, sample: true, beaker: true, zoom: true } })`.
- Tasks:
  - `make` **key**: make a solution in a volumetric flask (`made(id, g, flask, c)`).
  - `target` **key**: make 250 mL of 0.100 mol/L copper sulfate (`made('CuSO4-5H2O', g, 250, c)`, |c − 0.1| ≤ 0.001).
  - `dilute` **key**: dilute a solution you made (`diluted(id, c1, pipette, flask, c2)`).
  - `sample`: pour off a portion and compare (`sample(id, mL, c, n)`).
  - `beaker`: dissolve the solid in water in a beaker instead of filling to the mark (`beaker(id, g, waterML)`).
  - `tenfold` **challenge**: make 100 mL of a solution one tenth as concentrated (`diluted(…, flask = 100, c2)`,
    |c2 − c1/10| ≤ 1 % of c2).
- Hook: hospital drips. Normal saline is 9 g/L NaCl (0.9 %), the glucose drip 50 g/L (5 %); both roughly match the
  particle concentration of blood (osmolality about 275–295 mOsm/kg; fetch sources). Clash: over five times more
  grams per litre, yet both match. Answer: glucose particles are about three times heavier (180.16 vs 58.44 g/mol)
  and each NaCl gives two ions: 154 mmol/L NaCl → 308 mmol/L particles, 278 mmol/L glucose. Trap: "blood only notices
  grams per litre" (grams-per-litre-counts).
- Predictions: (1) grams of copper sulfate pentahydrate for 250 mL of 0.100 mol/L (6.24 g; traps 24.97 g for 1 L,
  3.99 g forgetting the water of crystallisation). (2) **transfer**: 10 mL of a 1.0 mol/L stock made up to 100 mL,
  then 50 mL poured off: the concentration of that 50 mL (0.10 mol/L; trap 0.05, portion-diluted).
- Examples: saline 9 g/L → 0.154 mol/L; a dilution series of potassium permanganate (colour as a visible guide, the
  bench calls it a model picture); **where the model breaks**: volumes do not simply add (50 mL ethanol + 50 mL water
  ≈ 96 mL, unit 11), which is why you fill to the mark rather than add volumes; and c changes slightly with
  temperature because the solution expands.
- Spot the flaw: **4 lines, first wrong step index 3** (the last step).
- Misconceptions: new `volume-of-water` (V is the volume of water added / V ist das Volumen des zugegebenen Wassers),
  `portion-diluted` (A smaller portion is less concentrated / Eine kleinere Portion ist weniger konzentriert),
  `grams-per-litre-counts` (Equal grams per litre means equal particles / Gleiche Gramm pro Liter bedeuten gleich viele
  Teilchen).
- German: Stoffmengenkonzentration c (mol/L), Massenkonzentration β (g/L), Messkolben, Eichmarke (Ringmarke),
  Vollpipette, Verdünnen, Verdünnungsformel c₁ · V₁ = c₂ · V₂, Kristallwasser. Say once: older books write "Molarität"
  or "molar (M)" for mol/L.

## New engines

### Zoom Ladder (units 12–15; later 31)

Files the helper owns: `src/sim/zoomLadder.ts` (the Stage3D), `src/sim/zoomLadderUI.ts` (replace the placeholder;
keep `ZoomLadderUI` and `ZoomLadderUIOptions` with at least the fields it has now), `src/sim/zoomLadder.css`.
Data only from stoich.ts and elements.ts; colours from the shared rules in engines.md.

What it shows: one sample on a **ladder of four rungs**, always visible as a strip of four rung buttons that carry the
live value of each rung: **Grams** ("18,02 g"), **Moles** ("1,000 mol"), **Count** ("6,02 · 10²³ molecules"),
**Particles** ("H₂O molecule"). Tapping a rung zooms the 3D view to it (a smooth camera move, a cut under
reducedMotion):
- grams: a lab balance with a heap of the sample on the pan and a digital readout;
- moles: the heap split into "1 mol" portions (equal scoops or boxes, a part-filled one for the fraction), with
  `n = m / M` written out with the numbers;
- count: the number of particles, `N = n × N_A`, written out in scientific notation, with a picture that makes the
  size of 10²³ felt (e.g. a power-of-ten zoom into the heap); no everyday comparison without a source;
- particles: a handful (at most about 12) of individual particles in 3D: atoms as spheres; molecules as schematic
  clusters (simple true shapes for small molecules, a compact cluster for big ones, the word "schematic" once);
  formula units as a small ion lattice piece (cations blue, anions red, signs labelled, "formula unit Na⁺ Cl⁻ 1 : 1").

Mass control (sample mode): steppers −10/−1/−0.1/+0.1/+1/+10 g, and a unit switch to set the amount in mol instead.
Sample chips from `samples`. All rungs update together.

**Sample mode** (units 12, 13):
- `controls.compare`: a second sample beside the first with **the same mass** or **the same amount** (a two-way
  switch). Both balances, both counts, both particle groups side by side so the difference is unmistakable.
- `controls.breakdown`: a "What's in the formula?" panel for the current sample: atoms per particle (H × 2, O × 1),
  the molar-mass sum written out (2 × 1,008 + 15,999 = 18,015 g/mol) and a mass-share bar per element with %.

**Equation mode** (unit 14): the equation from EQUATIONS as a line of species with a coefficient stepper (1–9) in front
of each; an element tally (left count | right count, ✓ or ≠ per element, never colour alone); the particles rung shows
coefficient × molecules of each species on each side of the arrow; the grams rung shows total mass left and right
(equal once balanced). `controls.trap`: a "change a subscript instead" button when the equation has a `trap`: it
swaps that species to `alt`, the tally then works, and a band says plainly that this is a different substance
(`altName`) and is not allowed; a second tap undoes it. No `balanced` event while the trap is on.

**Reaction mode** (unit 15): the balanced equation (fixed coefficients). For each reactant an amount input in the
current unit: molecules at the particles rung (0–12), mol at the moles rung, g at the grams rung. **React** animates at
the particles rung: groups combine by the coefficients into product molecules until a reactant runs out; leftover
molecules stay, marked "left over". Readouts: the limiting reactant by name, n ÷ coefficient for each reactant, the
leftover, the product in mol and g (theoretical yield). When amounts were given in mol or g, the particles rung
shows the same ratio with small numbers and says so ("the picture keeps the ratio, not every molecule").
`controls.yield`: an "actual mass collected" stepper for the first product → percent yield.

Events (exact names and arguments):
- `sample(id: string, which: 1 | 2)` · `mass(id: string, grams: number, mol: number, count: number)` after any mass or
  amount change settles and after a sample change (for sample 1 only) · `rung(r: Rung)` ·
  `compare(a: string, b: string | null, by: 'mass' | 'moles')` · `breakdown(id: string, M: number)`
- `equation(id: string)` · `coeffs(eqId: string, coeffs: number[], balanced: boolean)` ·
  `balanced(eqId: string, coeffs: number[], smallest: boolean)` (smallest = the coefficients share no factor) ·
  `subscript(eqId: string, alt: string)`
- `react(eqId: string, amounts: number[], limiting: number, leftover: number[], product: number[], by: 'particles' |
  'mol' | 'g')`: amounts, leftover per reactant and product per product all in mol; limiting is the reactant index,
  or −1 when nothing is left over · `yield(eqId: string, actualGrams: number, pct: number)`

`show(s)` (Show `ladder` in unitTypes.ts; idempotent, reusable on one compact instance): sample mode when `sub` is set
(load it with `grams` or `mol`, optional `compare`/`by`, `breakdown`); equation mode when `eq` and no `amounts`
(coefficients `coeffs`, `trap`); reaction mode when `eq` and `amounts` (`react` runs it, `actual` adds the yield);
`rung` zooms (defaults: grams for samples, particles otherwise). Compact: smaller stage, no chips and no steppers,
the rung strip read-only.

Must be unmistakable at a glance: which rung you are on; that all four rungs describe the same sample; on equation
mode whether each element balances; on reaction mode which reactant ran out and what is left over.

Test on `#/dev/ladder`, `#/dev/ladder?mode=equation&start=ch4`, `#/dev/ladder?mode=reaction&start=nh3` (port 5181),
compact with `?compact=1`, in EN and DE, at 412 × 915.

### Lab Bench (unit 16; later pH, buffers, titration, cells)

Files the helper owns: `src/sim/labBench.ts`, `src/sim/labBenchUI.ts` (replace the placeholder; keep `LabBenchUI` and
`LabBenchUIOptions`), `src/sim/labBench.css`. Build it so later units can add instruments (pH meter, burette,
electrodes) as further pieces on the same bench; only unit 16's pieces now.

What it shows: a 3D bench with a balance and weighing boat, a volumetric flask (choose 50, 100, 250, 500 or 1000 mL;
neck with a ring mark), a beaker, a bulb pipette and, after diluting, a second flask. A readout panel lists
m (g), M (g/mol), n (mol), V (mL and L), c (mol/L, mmol/L when small) and β (g/L), with `c = n / V` written out with
the numbers. Solutions have their real colour (copper sulfate blue, permanganate purple, the others colourless),
shaded by concentration, labelled once as a model picture.

Controls: solute chips (`solutes`); mass steppers −10/−1/−0.1/−0.01/+0.01/+0.1/+1/+10 g onto the boat; flask chips;
**Dissolve and fill to the mark** (the level rises to the ring); `controls.beaker`: **Dissolve in water instead**
(choose 100, 250, 500 or 1000 mL of water in a beaker: the level ends a little above that volume, labelled "more than
… mL of solution, so c is lower than planned"; no invented exact volume); `controls.dilute`: **Dilute** (pipette chips
from PIPETTES, flask chips; the pipetted portion goes into a new flask, filled to the mark; the colour fades);
`controls.sample`: **Pour off** 10, 25 or 50 mL into a beaker (c stays, n shrinks); `controls.zoom`: a particle inset
(a circle with dots in proportion to c, at most about 60: cations blue "+", anions red "−", glucose neutral, labelled
"each dot stands for very many particles").

Events (exact):
- `solute(id: string)` · `weighed(id: string, grams: number)` (settled) · `flask(mL: number)`
- `made(id: string, grams: number, flaskML: number, c: number)` · `beaker(id: string, grams: number, waterML: number)`
- `diluted(id: string, c1: number, pipetteML: number, flaskML: number, c2: number)`
- `sample(id: string, mL: number, c: number, n: number)` · `zoom(on: boolean)`

`show(s)` (Show `bench`; idempotent): set the solute and `grams`, choose `flask`; `made` fills to the mark; `water`
uses the beaker case instead; `dilute` adds the second flask; `sample` pours off; `zoom` opens the inset. Compact:
smaller stage, no chips or steppers, readouts kept.

Must be unmistakable: the ring mark and whether the level is on it; that c and n are different numbers; that a
poured-off portion has the same colour and c.

Test on `#/dev/bench` (port 5182) and compact, EN and DE, 412 × 915.

## Helper prompts

- Engine: "Build the <Zoom Ladder | Lab Bench> as specified in docs/process/batch-12-16.md, section New engines.
  Follow docs/process/engines.md. You own only <its three files>. Do not commit. Report in under 250 words."
- Unit: "Write unit N as specified in docs/process/batch-12-16.md. Follow docs/process/authoring.md. You own only
  src/content/unitNN.ts and src/content/bank/uNN.ts. Do not commit. Report as the guide says."
