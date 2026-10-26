# Batch brief: units 17–20 (module 5, thermodynamics)

Four units on one question: what decides whether a reaction gives out energy, and whether it can run by itself?
Units 17, 18 and 20 use the new **Energy Landscape**; unit 19 uses the **Particle Box** with a new spreading view.

Already done by the main session (do not redo): concepts in curriculum.ts; `src/content/thermo.ts` (THERMO table of
ΔfH°, ΔfG°, S° from OpenStax Chemistry 2e Appendix G, calcite from the CRC Handbook; REACTIONS with `dH()`, `dS()`,
`dG(id, T)`, `crossover(id)`; BOND_REACTIONS with `bondEstimate(id)` and `bondEnergy(key)` from bonds.ts); the
`energy` Show variant and the box `spread` field in unitTypes.ts; placeholder `src/sim/energyLandscapeUI.ts` with its
final options; `ctx.energy()`; dev route `#/dev/energy?mode=bonds|hess|gibbs&start=<id>`; empty banks u17–u20.

**Numbers:** every ΔH, ΔS, ΔG and crossover temperature in the text must equal what thermo.ts computes, rounded
sensibly. Check with a tsx one-liner, e.g. `npx tsx -e "import {dH,dS,crossover} from './src/content/thermo.ts';
console.log(dH('caco3'), dS('caco3'), crossover('caco3'))"`. Values already computed (kJ/mol, J/(mol·K), K):
ch4-burn −890.6 (liquid water) / ch4-burn-g −802.6; h2-burn-l −571.7 / h2-burn-g −483.6; c-co2 −393.5; co-co2 −283.0;
c-co −110.5; diamond-graphite −1.89 (ΔG −2.9); nh3 −91.8, ΔS −198.1, crossover 463 K; caco3 +179.2, ΔS +160.2,
crossover 1119 K (845 °C); no2-dimer −55.3, ΔS −175.8, crossover 315 K (41 °C); h2o2 −196.1, ΔS +126.0; ice-melt
+6.01, ΔS +22.0, 273 K; water-boil (25 °C data) +44.0, ΔS +118.8, 370 K against the measured 373 K; thermite −851.8.
Bond estimates (bonds.ts): hcl −185 (measured −184.6); h2o −486 (−483.6); nh3 −86 (−91.8); ethene −128 (−136.4);
ch4 −682 against the measured −802.6; hf −542 (no measured value in the table). Any measured value not in thermo.ts or
bonds.ts (cold packs, kiln temperatures, ice entropy, the C=O bond in CO₂) needs a fetched source named in a comment.

**Signs and units:** ΔH in kJ/mol, ΔS in J/(mol·K), T in K. When combining, convert ΔS to kJ: ΔG = ΔH − T·ΔS/1000.
State once per unit that ΔH and ΔS are treated as constant with temperature (a model). "Spontaneous" (EN) and
"freiwillig" / "spontan" (DE) mean "can run by itself", never "fast".

**Glossary ids per unit** (add only your own; you may use the others' ids as chips, they exist after wiring):
17 `enthalpy`, `exothermic`, `endothermic`, `bond-energy` · 18 `hess-law`, `enthalpy-of-formation` · 19 `entropy`,
`spontaneous` · 20 `gibbs-energy`, `exergonic`. **Bank ids:** i17a, i17b, … (i18a… etc.).

**German (all units):** school terms; du-form; „…“; decimal commas; ":" for division, never "÷"; "angeben", not
"zählen", for what a number states; no calques ("tragen", "bringt", "sechsmal weniger"). Lessons from batch 12–16
reviews: keep units to 25 minutes (puzzle lead three sentences, example bodies three sentences); worked steps end in
an exam-style answer sentence; explain-back patterns must accept "=" shorthand ("ΔH = gespalten − geknüpft"),
inverted German word order, and plain words ("heat", "Wärme", "the most you can get").

## Units

### Unit 17, Bond energy and enthalpy (module 5)

- Concepts: u17.break-make, u17.balance, u17.sign, u17.estimate, u17.average, u17.diagram.
- Engine: Energy Landscape, bonds mode. Explore creates `ctx.energy({ mode: 'bonds', start: 'hcl', reactions:
  ['hcl', 'h2o', 'nh3', 'ethene'], controls: { measured: true } })`. Keep 'hf' and 'ch4' for predictions and examples.
- Tasks (event that ticks):
  - `break` **key**: break the bonds of any reaction (`broken(id, kJ)`).
  - `make` **key**: make the new bonds and read ΔH (`formed(id, kJ, dH)`).
  - `compare` **key**: compare the estimate with the measured value for two different reactions (`measured(id, est,
    meas)`, two distinct ids).
  - `water`: complete hydrogen burning (`formed('h2o', …)`).
  - `ammonia`: complete the ammonia synthesis (`formed('nh3', …)`).
  - `highest` **challenge**: find the reaction whose separated atoms sit highest above the reactants (`broken('nh3',
    …)`: 2254 kJ, the N≡N bond alone costs 946).
- Hook: a gas flame. Breaking bonds costs energy, yet burning methane releases 890 kJ/mol. Data table: the bonds in
  CH₄ + 2 O₂ and in CO₂ + 2 H₂O with their average energies (bonds.ts) and the measured ΔH. Question: where does the
  flame's energy come from? Traps: "from breaking the fuel's bonds" (breaking-releases), "from the match that lit it".
  Answer: the bonds formed are stronger than those broken.
- Predictions: (1) **transfer**: estimate ΔH for H₂ + F₂ → 2 HF (−542 kJ/mol; traps +542 sign, −160 only F–F).
  (2) hydrogen burning to liquid water or to water vapour: which releases more, and why (liquid, −571.7 against
  −483.6 per 2 mol: condensing releases energy too).
- Examples: H₂ + Cl₂ (estimate −185, measured −184.6); a hand warmer (iron oxidising, fe-rust −1648.4 per 4 mol Fe;
  find a source for a commercial pack's iron content if you give per-pack energy); **where the model breaks**:
  methane, estimate −682 against measured −802.6 kJ/mol. Average bond energies are averages over many molecules; the
  C=O bonds in CO₂ are stronger than an average C=O (find a fetched value and source).
- Spot the flaw: **4 lines, first wrong step index 1.**
- Misconceptions: new `breaking-releases` (Breaking bonds releases energy / Beim Spalten von Bindungen wird Energie
  frei), `dh-sign` (A negative ΔH means the reaction takes in energy / Ein negatives ΔH bedeutet, dass die Reaktion
  Energie aufnimmt).
- German: Enthalpie H, Reaktionsenthalpie Δ_rH, exotherm / endotherm, System und Umgebung, Energiediagramm,
  (mittlere) Bindungsenthalpie. Say once: books say "Bindungsenergie" or "Bindungsenthalpie"; at school they are used
  for the same value.

### Unit 18, Hess's law (module 5)

- Concepts: u18.path, u18.reverse, u18.scale, u18.formation, u18.products-reactants, u18.unmeasurable.
- Engine: Energy Landscape, hess mode. Explore creates `ctx.energy({ mode: 'hess', start: 'c-co', reactions: ['c-co',
  'diamond-graphite', 'caco3'], steps: ['c-co2', 'co-co2', 'diamond-burn'], controls: { elements: true } })`.
  Predictions and examples use other reactions (thermite, lime-slake, ch4-burn, ethene-h2, c2h5oh-burn).
- Tasks:
  - `co` **key**: build a complete route for C → CO (`route('c-co', steps, true, dH)`).
  - `flip` **key**: reverse a step (`flip(stepId, reversed)` with reversed true).
  - `elements` **key**: open the route via the elements for any reaction (`elements(id)`).
  - `diamond`: build a complete route for diamond → graphite (`route('diamond-graphite', …, true, …)`).
  - `limestone`: open limestone via the elements (`elements('caco3')`).
  - `double` **challenge**: build a complete route that uses a doubled or halved step (`route(…, true, …)` where a
    step has factor ≠ 1; the wiring checks the `steps` argument for a "2*" or "0.5*" prefix).
- Hook: carbon monoxide's enthalpy of formation cannot be measured directly: burning carbon in little oxygen gives a
  mixture of CO and CO₂. Data: measured ΔH of C → CO₂ (−393.5) and CO + ½ O₂ → CO₂ (−283.0). Question: ΔH of
  C + ½ O₂ → CO? Answer −110.5; traps −676.5 (added: reverse-keeps-sign), +110.5, "cannot be known without measuring
  it" (path-dependent).
- Predictions: (1) **transfer**: diamond → graphite from the two combustions (−1.89 kJ/mol; give both combustion
  values, −395.4 and −393.5). (2) slaking lime from formation enthalpies (lime-slake −64.5 kJ/mol; give the three ΔfH).
- Examples: thermite via the elements (−851.8; Al and Fe count zero); burning methane to liquid water or vapour
  (−890.6 against −802.6: the route via condensing adds 2 × 44.0); **where the model breaks** or the unmeasurable
  case: a Born–Haber cycle for sodium chloride, linking unit 4. Take the lattice energy from ions.ts and every other
  step from a fetched source; show that the steps add up to ΔfH(NaCl) = −411.2 within rounding, or say why not.
- Spot the flaw: **5 lines, first wrong step index 3.**
- Misconceptions: new `reverse-keeps-sign` (A reversed step keeps the sign of its ΔH / Ein umgekehrter Schritt behält
  das Vorzeichen), `path-dependent` (ΔH depends on the route taken / ΔH hängt vom Reaktionsweg ab), `elements-nonzero`
  (Elements such as O₂ have an enthalpy of formation that must be counted / Elemente wie O₂ haben eine
  Bildungsenthalpie, die man mitrechnen muss).
- German: Satz von Hess, (molare) Standardbildungsenthalpie Δ_fH°, Energiekreisprozess (Kreisprozess),
  Born-Haber-Kreisprozess, Zustandsgröße. Say once: a Zustandsgröße depends only on the state, not on the way there.

### Unit 19, Entropy (module 5)

- Concepts: u19.not-energy, u19.ways, u19.probable, u19.states, u19.gas-moles, u19.mixing.
- Engine: Particle Box with the new spreading view. Explore creates `ctx.box({ start: 'Ar', subs: ['Ar', 'H2O'],
  temp: 20, controls: { spread: true, temp: true, compare: false } })`.
- Tasks:
  - `open` **key**: remove the partition with 10 particles (`partition(true, 10)`).
  - `back` **key**: see all particles back on the left by chance with 4 particles (`allLeft(4)`).
  - `many` **key**: remove the partition with 100 particles (`partition(true, 100)`).
  - `ways`: open the ways panel (`ways(n)`).
  - `mix`: mix two gases (`mixed(true)`).
  - `melt` **challenge**: let ice melt at room temperature in the H₂O box (`melt('H2O')`, the existing event).
- Hook: a cold pack (ammonium nitrate dissolving) and ice melting at room temperature both take in energy, yet run by
  themselves. Data: ΔH of melting ice +6.01 kJ/mol (thermo.ts); the enthalpy of solution of NH₄NO₃ (fetch, about
  +25.7 kJ/mol). Question: why do they happen? Traps: "they secretly release energy" (spontaneous-exothermic), "the
  particles want more room" (particles-want-space). Answer: spreading out has vastly more ways.
- Predictions: (1) **transfer**: the sign of ΔS for 2 H₂O₂(l) → 2 H₂O(l) + O₂(g) (+126.0: a gas forms). (2) four
  particles in two halves: how many of the 16 arrangements have two on each side (6), and the chance that all four
  are on the left (1 in 16).
- Examples: water evaporating (ΔS +118.8; S° 70.0 → 188.8); the ammonia synthesis (4 mol gas → 2 mol gas, ΔS −198.1);
  **where the model breaks**: "entropy is disorder". A shuffled pack of cards or an untidy room is not thermodynamic
  entropy, and water freezing below 0 °C lowers the water's entropy while the heat it gives off raises the
  surroundings' entropy more.
- Spot the flaw: **3 lines, first wrong step index 2** (the last).
- Misconceptions: new `spontaneous-exothermic` (Only processes that release energy run by themselves / Nur exotherme
  Vorgänge laufen von selbst ab), `entropy-messiness` (Entropy is visible messiness / Entropie ist sichtbare
  Unordnung), `particles-want-space` (Particles spread because they want room / Teilchen verteilen sich, weil sie Platz
  wollen).
- German: Entropie S in J/(mol·K), freiwillig (spontan) ablaufend, Anordnungsmöglichkeiten (Mikrozustände: say once),
  Teilchenzahl. Say once: many books call entropy "Maß der Unordnung"; what to write in an exam, and what it leaves out.

### Unit 20, Free energy (module 5)

- Concepts: u20.gibbs, u20.sign, u20.temperature, u20.crossover, u20.four-cases, u20.not-rate.
- Engine: Energy Landscape, gibbs mode. Explore creates `ctx.energy({ mode: 'gibbs', start: 'ice-melt', reactions:
  ['ice-melt', 'caco3', 'no2-dimer', 'h2o2'], controls: { temp: true } })`. Keep 'nh3' and 'water-boil' for
  predictions and examples.
- Tasks:
  - `ice` **key**: move the temperature across ice's melting point (`crossover('ice-melt', T)`).
  - `lime` **key**: find the temperature where limestone starts to decompose (`crossover('caco3', T)`).
  - `always` **key**: show a reaction that can run at every temperature (`reaction('h2o2')` then any `temp` event).
  - `cold`: find a reaction that runs only when cold enough (`crossover('no2-dimer', T)`).
  - `reverse`: reverse a reaction (`reverse(id, true)`).
  - `never` **challenge**: find a reaction that cannot run by itself at any temperature (`reverse('h2o2', true)`:
    ΔH > 0, ΔS < 0).
- Hook: lime kilns heat limestone to around 900 °C (fetch a source). Data: ΔH +179.2 kJ/mol, ΔS +160.2 J/(mol·K).
  Question: above which temperature can limestone decompose by itself? Answer about 845 °C (1119 K); traps "about
  1 K" (J and kJ mixed: units-j-kj), "never, it is endothermic" (spontaneous-exothermic, unit 19), "at room
  temperature, if you wait long enough".
- Predictions: (1) **transfer**: brown NO₂ and colourless N₂O₄ at 0 °C and at 100 °C: which side does ΔG favour
  (crossover 41 °C; cold favours N₂O₄). (2) the ammonia synthesis: above about 190 °C ΔG turns positive, yet the
  Haber process runs at about 450 °C (fetch a source): why? (rate; equilibrium follows in units 24–25).
- Examples: ice at 0 °C (6.01 ÷ 0.0220 = 273 K); water boiling from 25 °C data (370 K against the measured 373 K:
  ΔH and ΔS change slightly with temperature, **where the model breaks**); diamond → graphite (ΔG −2.9 kJ/mol, yet
  diamonds last: not-rate).
- Spot the flaw: **4 lines, first wrong step index 0.**
- Misconceptions: new `negative-dg-fast` (ΔG < 0 means the reaction is fast / Ein negatives ΔG bedeutet eine schnelle
  Reaktion), `units-j-kj` (J and kJ mixed in ΔH − T·ΔS / J und kJ in ΔH − T·ΔS vermischt), `t-irrelevant` (Whether a
  reaction can run does not depend on temperature / Ob eine Reaktion ablaufen kann, hängt nicht von der Temperatur
  ab); reuse `spontaneous-exothermic` (unit 19).
- German: Freie Enthalpie G (Gibbs-Energie: say once), Gibbs-Helmholtz-Gleichung ΔG = ΔH − T·ΔS, exergonisch /
  endergonisch, Temperatur in Kelvin. Say once: "spontan" in chemistry does not mean "schnell".

## New and extended engines

### Energy Landscape (units 17, 18, 20; later 23)

Files the helper owns: `src/sim/energyLandscape.ts` (the Stage3D), `src/sim/energyLandscapeUI.ts` (replace the
placeholder; keep `EnergyLandscapeUI` and `EnergyLandscapeUIOptions` with at least the fields it has now),
`src/sim/energyLandscape.css`. Data only from thermo.ts, bonds.ts and stoich.ts. Build it so unit 23 can later add an
activation-energy path (a hump between levels) and a catalyst; not now.

What it shows: energy as height. Each state (reactants, products, separated atoms, the elements, an intermediate) is a
labelled **level**: a flat terrace in 3D with its formulas on it (small ball-and-stick molecules where they fit, else
labels), seen from the side with a vertical energy axis in kJ/mol. Vertical **arrows** between levels carry their
values; an arrow up means energy taken in (+), down means released (−). The ΔH arrow from reactants to products is
always drawn and labelled, with "exothermic" or "endothermic" written beside it (never colour alone). Energy scales
differ hugely (−1.89 to +2656 kJ), so the axis rescales per reaction and says so.

- **bonds mode** (unit 17): reactants at 0. "Break the bonds" lifts them to the separated-atoms level (+ the sum of
  bonds broken, with a list such as "4 × C–H 415 = 1660"), atoms drawn apart. "Make the new bonds" drops them to the
  products (− the sum formed). Then the estimate ΔH = broken − formed is written out. `controls.measured`: shows the
  measured ΔH from thermo.ts (gas phase) beside the estimate, with the difference.
- **hess mode** (unit 18): the target reaction's ΔH is first unknown ("?"). A tray of step cards from `steps`, each
  with its equation and ΔH; tapping a card adds it to the route; each card on the route can be reversed (sign flips,
  equation turns around) and scaled (×½, ×2). The engine keeps a species tally and says when the route adds up to the
  target (species that appear on both sides cancel), then shows the cycle: the direct arrow and the route arrows
  around it, equal in sum. `controls.elements`: "via the elements" draws the elements at 0, the reactants at
  Σ ΔfH(reactants) and the products at Σ ΔfH(products), and ΔrH = products − reactants written out.
- **gibbs mode** (unit 20): three bars for the reaction at temperature T: ΔH, −T·ΔS (in kJ/mol) and their sum ΔG,
  with "ΔG < 0: can run by itself (exergonic)" or "ΔG > 0: cannot run by itself (endergonic)". `controls.temp`: a
  temperature slider in K with °C beside it (range per reaction so the crossover is inside it, else 200–2000 K), the
  crossover temperature marked on it ("ΔG = 0 at 1119 K (845 °C)") or "no crossover: same sign at every temperature".
  A "Reverse the reaction" button flips ΔH and ΔS. A small 2 × 2 card shows the four sign cases with the current one
  highlighted. A one-line note: "ΔH and ΔS treated as constant: a model".

Events (exact names and arguments):
- all modes: `reaction(id: string)`
- bonds: `broken(id: string, kJ: number)` · `formed(id: string, kJ: number, dH: number)` · `measured(id: string,
  est: number, meas: number)`
- hess: `step(stepKey: string)` when a card is added (stepKey like "c-co2", "-co-co2", "2*c-co2") · `flip(stepId:
  string, reversed: boolean)` · `route(targetId: string, steps: string[], complete: boolean, dH: number)` after every
  change · `elements(id: string)`
- gibbs: `temp(id: string, T: number, dG: number)` (settled) · `crossover(id: string, T: number)` when the slider
  passes the crossover · `reverse(id: string, on: boolean)`

`show(s)` (Show `energy`; idempotent, reusable on one compact instance): mode from `s.mode` (default bonds when the id
is in BOND_REACTIONS, else gibbs); bonds: `stage` 'broken' | 'formed' | 'both' (both = full diagram with the estimate);
hess: `route: 'steps'` lays out `steps` (the same key syntax) as a complete cycle, `'elements'` the elements view,
`'direct'` just the reaction; gibbs: bars at `temp` K. Compact: smaller stage, no chips, no tray, no slider.

Must be unmistakable at a glance: which way energy goes (up = taken in, down = released) with signed numbers; in hess
mode whether the route is complete; in gibbs mode the sign of ΔG and where the crossover lies.

Test on `#/dev/energy`, `#/dev/energy?mode=hess&start=c-co`, `#/dev/energy?mode=gibbs&start=caco3` (port 5181),
compact with `?compact=1`, EN and DE, 412 × 915.

### Particle Box: spreading view (unit 19)

Files the helper owns: `src/sim/particleBox.ts`, `src/sim/particleBoxUI.ts`, `src/sim/particleBox.css`. Do not change
existing options, events or Show fields (units 8, 9, 11 use them); add only.

New option `controls.spread`: a chip row "Spread out" switches box 1 to the spreading view with a vertical partition
in the middle and N gas particles (chips 4, 10, 40, 100) all in the left half; plain spheres, no clouds. Buttons
"Remove the partition" / "Put it back (all particles to the left)". Live readout "left: k · right: N − k" and a small
histogram of how often each k occurred since the partition opened. A "Ways to arrange" panel: for the current N, the
number of arrangements with k on the left, C(N, k), as bars (for N = 4: 1, 4, 6, 4, 1 of 16; for large N write the
numbers in scientific notation) and "chance that all N are on the left at a given moment: 1 in 2^N" (for N = 100:
"1 in 1.27 · 10³⁰"). A "Two gases" switch fills the right half with a second gas (different colour and label) for
mixing. Motion obeys the existing temperature; under reducedMotion slower. A one-line note that each sphere is one
particle and real samples hold about 10²³ (unit 12).

New events: `spread(n: number)` · `partition(open: boolean, n: number)` · `allLeft(n: number)` (fires when, after the
partition was opened, all n are on the left at once) · `ways(n: number)` (panel opened) · `mixed(on: boolean)`.
Show: the box Show's new `spread: { n, open?, mixed? }` loads that state (with `open`, the particles are already spread).

Test on `#/dev/box` (port 5182) with `__dev.show({ engine: 'box', sub: 'Ar', spread: { n: 10, open: true } })`,
compact, EN and DE. Make sure units 8, 9 and 11 still look and behave as before (one screenshot each).

## Helper prompts (fresh general-purpose helpers, not forks; at most three running at a time)

- Engine: "Build the <Energy Landscape | Particle Box spreading view> as specified in docs/process/batch-17-20.md,
  section New and extended engines. Follow docs/process/engines.md. You own only <its files>. Do not commit. Report
  in under 250 words."
- Unit: "Write unit N as specified in docs/process/batch-17-20.md. Follow docs/process/authoring.md. You own only
  src/content/unitNN.ts and src/content/bank/uNN.ts. Do not commit. Report as the guide says."
