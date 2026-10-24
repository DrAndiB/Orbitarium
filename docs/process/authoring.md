# Writing a unit (authoring guide)

How to write the content of one Orbitarium unit. A helper that writes a unit gets this guide plus a short batch brief
(docs/process/batch-brief-template.md, filled in): which unit, its six concepts, the engine and its task ids, ideas for
the puzzle and examples, the flaw shape. Everything else is here.

Write so that Marie (nervous adult beginner, English) can follow it, Jonas (German Gymnasium student before his
Abitur, wants exam language) recognises his textbook, and Priya (chemistry undergraduate) finds nothing to unteach.

Read first, as the quality bar: src/content/unit05.ts and unit10.ts with src/content/bank/u05.ts and u10.ts (mature
content in the UnitContent format), src/content/unitTypes.ts (UnitContent, Show), src/content/items.ts (item types),
src/content/ideas.ts (how explain-back hints match), src/content/curriculum.ts (your concepts and existing
misconception ids), src/content/glossary.ts. Data: src/content/elements.ts, atoms.ts, ions.ts, bonds.ts,
substances.ts. Engines and their Show shapes: docs/process/engines.md.

## What you write (only these two files; do not edit anything else)

1. `src/content/unitNN.ts` (two digits, e.g. unit12.ts) exporting `export const UNITN: UnitContent = { … }`.
2. `src/content/bank/uNN.ts` exporting `BANK_UN: Item[]` (the main session creates an empty one and registers it; keep any existing item ids).

If you need something outside these files (an engine feature, a fix to an existing glossary term or item in
another unit, a data value that is wrong), do NOT edit it: list it under "Requests" in your final report.

## The seven steps and what each needs

1. Warm-up (automatic, from the bank of earlier units). You only supply `lead`: one line on what the unit explains.
2. Puzzle: `puzzle.title`, `lead`, a small `data` table of REAL measured values, `clash` (why the data is
   surprising, ending in a question), a 4-option `question` (kind 'choice', format 'predict', withConfidence:
   true, evidence 'predict', id `uN-puzzle`), and `after` (one line pointing to the explore step).
   Tag trap options with `mis`, list them in `targets`.
3. Explore: the engine plus a "things to try" list. Use EXACTLY the task ids given in your batch brief (the
   player ticks them from engine events). Mark the ones given as key with `key: true`, the challenge with
   `challenge: true`. `notes` (optional) are short texts shown when a task is ticked. `check` is one quick item
   (id `uN-check`) shown when the key tasks are done (a rank works well, as in unit 6).
   The explore step must not give away the answers to the predictions in step 4.
4. Predict: exactly 2 predictions. Each: a choice item (ids `uN-…`, format 'predict', withConfidence, evidence
   'transfer' when it is a new situation, else 'predict'), a `show` (what the engine displays after answering,
   see Show in unitTypes.ts and the engine notes below), `revealText` (the measured value and how the model
   explains it, 2–3 sentences), and `extra`: a 3–4 step worked example shown only after a miss, in very plain
   words (this was the students' favourite addition in round 2).
5. Worked examples: exactly 3 `examples`, each with a `tag` (formula or symbol, {{…}} not needed here, e.g.
   'O', 'K', 'NaCl', 'H–Cl'), a `show`, three `numbers` ({v, label}; v uses '.' decimals, the player turns them
   into commas in German), `body` (the reasoning, 2–3 sentences) and `soWhat` (a real-world link, 1–2
   sentences). At least one example should show where the simple model breaks (the "model you can break"
   pattern every student liked).
   Then `flaw`: a spot-the-flaw item (id `uN-flaw`, format 'flaw', evidence 'transfer', prompt exactly
   "Where does this reasoning first go wrong?" / "Wo geht diese Überlegung zum ersten Mal schief?"), 3–5 lines
   in the shape your batch brief assigns, one clearly first false step (`flaw`, 0-based index), later steps that are false only because they follow
   from it in `alsoFalse`, and a `near` note for the most tempting true step. The explanation names every step.
   And `deeper`: one optional harder item (id `uN-deeper`, evidence 'transfer'). Prefer one where the learner
   produces something (an estimate with the method in the prompt, or a rank with a twist), not recall.
6. Explain back: `prompt` ("In your own words: …"), 5 `ideas` (each tied to one of your six concepts; one
   concept may stay out), each with lowercase `en` and `de` regexes, and a `tightened` version (3–4
   sentences) that states every idea. Regexes must accept plain words (Marie), technical words (Priya) and
   German school shorthand (Jonas: abbreviations like "EN", "Ox-Zahl", "Edelgaskonfig"). Add a `contra` to
   the ideas that the unit's main misconception contradicts. Matching is per clause (split at . ; : ! ? newline,
   ", " and the words and/but/so/while/und/aber/also/deshalb), and a clause with a negation outside the match
   is ignored. TEST them (see Checks).
7. Wrap-up: `terms` (4–6 glossary ids for optional term pairs) and `readings`: one EN 'quick', one EN 'deeper'
   and one DE reading (kind 'deeper' or 'quick'). Plain language: Andreas, the owner, finds Wikipedia too
   jargon-heavy, so do not use Wikipedia. Good sources: chemguide.co.uk, BBC Bitesize, Royal Society of
   Chemistry (edu.rsc.org), Khan Academy, LibreTexts introductory chapters, Purdue genchem topic reviews,
   LEIFIphysik, Lernhelfer Schülerlexikon, chemie.de lexikon, Studyflix (articles, not only videos),
   Chemie.de, seilnacht.com. Every URL must be fetched with WebFetch to check it loads and covers the topic.
   Each reading has 3 `lookFor` prompts tied to a number, picture or claim the learner met in the unit
   (e.g. "the 656 nm line: which jump does the article give for it?"). EN readings have '' as the de text and
   vice versa, as in unit 6.

Also export in the unit object:
- `misconceptions`: new misconceptions this unit introduces (id kebab-case, name EN/DE). Existing ones you may
  reuse: bohr-orbits, d-in-shell-2 (unit 1), kbr-charges (unit 3), and any in curriculum.ts.
- `glossary`: new glossary terms (same shape as glossary.ts, with `unit: N`). Only add a term if you use it as a
  [[chip]] or in `terms`. Do not redefine existing ids.

## The bank (src/content/bank/uNN.ts)

- At least three variants per concept, six concepts → at least 18 items, including the existing ones (keep
  their ids; you may improve their text, fix errors, add `mis`/`targets`). New ids continue the pattern
  (i7a, i7b, … for unit 7; i8c… for unit 8; i10b… for unit 10).
- For each concept: one 'predict' item (evidence default), one 'why' item (format 'why', evidence 'explain':
  choose the best explanation), one transfer item (evidence 'transfer': the same idea in a new situation).
  Rank, estimate and odd-one-out formats are welcome for variety (kind 'rank' / 'estimate' / 'choice' with
  format 'odd').
- Every wrong option that reflects a known misconception gets `mis: '<id>'`, and the item lists it in
  `targets`. Each misconception your unit introduces must be targeted by at least 3 items across the unit's
  own items and the bank.
- Data on the page: if an answer needs a value (a radius, an IE, χ), either give it in the prompt or set
  `table: '<overlay>'` so the item links to the periodic table (overlays: category, shells, outer, block, mass,
  chi, radius, ie, ion, met). Never require memorised data except the unit's core facts.
- Options of similar length; the correct option's position varies; no "all of the above"; no option that is
  right for a trivial reason. 3–4 options per choice item; withConfidence: true on predict and why items.
- Explanations: 1–3 sentences, say why the right answer is right and, where useful, what the tempting wrong
  one gets wrong.

## Authoring checklist (from two rounds of student and expert review)

- Accuracy first. Every number must come from the app's data files or a source you state in a comment. Use the
  app's own values so cards, engine and text agree (radii: elements.ts empirical radii, e.g. Na 180, Cl 100,
  K 220 pm; ionic radii: ions.ts Shannon values; IE: atoms.ts IONIZATION; χ: elements table, Pauling;
  lattice energies and melting points: ions.ts; bonds: bonds.ts).
- No teleology: atoms do not "want" or "like" anything. Say what it costs or what is lower in energy. Do not
  call an electron "cheap"; say it is far easier to remove than the next one, with numbers.
- Down a group, size grows because of DISTANCE (a new shell), not because of "more shielding": the extra
  protons and extra inner electrons cancel in the simple model (Z_eff stays about the same).
- Removing an electron always costs energy (first IE > 0). Ions form in reactions because something else pays
  it back (lattice energy, unit 4).
- An ion with a noble gas's electron arrangement is not that noble gas (different nucleus, different charge).
- Polarity colours, as in textbook potential maps: red = δ− / negative, blue = δ+ / positive. Cations are drawn
  blue, anions red.
- Use "directions" (not "pairs") when counting around a central atom (unit 6 language), "shared pair" for a
  bond.
- Orbitals are regions where an electron is likely to be found, not paths. Never describe electrons orbiting
  in a circle except when presenting the Bohr picture as the older, simpler model.
- 4s fills before 3d because 4s is lower in energy for those atoms (K, Ca); for the transition metals the order
  is subtle (4s electrons are also the first removed). Keep claims at that level or say "for potassium and
  calcium".
- Never refer to Andreas's chat lessons, dates, or "earlier this year". The app stands on its own. Refer to
  other units by number ("unit 4 shows why").
- German: natural German school terminology (Schalenmodell, Orbitalmodell, Unterschale, Elektronenkonfiguration,
  effektive Kernladung, Ionisierungsenergie, Ionenladung, Edelgaskonfiguration, Ionengitter, Gitterenergie,
  Elektronenpaarbindung/Atombindung, Elektronegativität, Partialladung, polare Atombindung), du-form,
  „…“ quotes, decimal commas in German text ("1,8"), and the German Hauptgruppen numbering where it helps
  ("Gruppe 17, die VII. Hauptgruppe").
- Markup in text: {{H2O}} renders a formula with subscripts (charges: {{Na+}}, {{Mg2+}}, {{O2-}}),
  [[term-id]] or [[term-id|shown text]] renders a glossary chip (only existing ids or ones you add),
  **bold** sparingly, Z_{eff} for subscripts in plain text.
- Tone: short sentences, concrete, warm but not chatty. No exclamation marks. No "Great job". The trap note
  after a misconception option is generated by the app; do not write "this is a common mistake".
- Unit length target: about 25 minutes. Keep explanations tight.

## Lessons from the reviews of units 1–11 (apply them from the start)

- Spot the flaw: use the shape your batch brief assigns (number of lines, which step is the first wrong one); students learn
  to answer from a fixed position otherwise.
- Explain-back patterns must accept: effect-before-cause order ("X boils higher because …"), inflections, German
  school phrasings (see your unit's German list), charges typed any way (the matcher normalises them; write charge
  patterns in ASCII like /\bna\+|\bcl-/), and must NOT tick on a single result word without the mechanism. The
  tightened version must hit all five ideas in EN and DE (`npx tsx tools/sim/regress-hints.mts` reports any that do not).
  Common school shorthand (VdW, WW, H-Brücke, EP, Sdt./Sdp., Smp., IMF, bp, bewegl., ähnl., Lsg.) is spelled out by
  the shared dictionary in ideas.ts, so patterns only need the full words. For every false hint you fix, list the learner
  text in your report under "Hint test texts"; the main session adds it to the fixture so it stays fixed.
- German: school terms (Periode, Hauptgruppe on first use "Gruppe 17 (VII. Hauptgruppe)", Ionengitter, effektive
  Kernladung, EN/ΔEN, Partialladung δ+/δ−, Elektronenpaarbindung, Oktettregel); comparisons with "gegenüber", not
  "gegen"; "bedeutet", not "heißt", for "means"; no calques ("genaue Farbe", "Riesengitter", "Nettozug", "Zug" for a
  pull). Numbers: decimal commas; no thousands separator up to four digits (9921); a narrow no-break space from five
  digits (26 700). Write °C and K correctly (−185,8 °C, 87 K).
- Where the unit rejects a school shortcut, add one sentence saying what a student may still write in an exam.
- Gloss every symbol in plain words where the learner first meets it in your unit (δ, D for debye, K, S/m, pm,
  kJ/mol, g/cm³).
- Example cards: each `numbers` entry reads as "<v> <label>", so write labels that read naturally after the number
  ("−0.5 °C" + "boiling point of butane").
- The third worked example ("where the model breaks") opens with one plain sentence a beginner can keep.
- Units ran about 30 minutes; the target is 25. Keep the puzzle lead to three sentences, explanations to 1–3
  sentences, example bodies to three sentences.
- Strong learners asked for more stretch: make `deeper` a production task (estimate with the method given, or a
  rank with a twist), and let one of the two predictions be a genuine transfer to a new substance.
- Never claim more than the data shows. Boiling points are measured; the Particle Box's what-if is a model estimate
  and must be called that.

- More lessons from units 7–11:
  - Never imply that breaking a bond releases energy; reactions release energy when the new bonds are stronger.
  - Dissolving and mixing are a balance of energy AND disorder (entropy); never explain them by energy alone.
  - State school rules as rules, with one plain sentence on what they leave out (hydrogen bonds "need" N, O or F;
    like dissolves like); HCl does form a real hydrogen bond with water.
  - A prediction must not be answerable from the screen before it (a check's feedback, the puzzle table).
  - When the engine cannot show the exact case, say in the reveal what the picture stands in for.
  - "Go deeper" opens after two right predictions at any confidence: make it a reasoning task (factors that compete,
    or a pattern that breaks), with the data on the page and the method NOT in the prompt.
  - Count hydrogen bonds one way: a water molecule takes part in up to four; each bond joins two molecules, so ice
    has two per molecule when each bond is counted once.
  - German: Kathode/Anode with Minuspol/Pluspol; "Van-der-Waals-Kräfte" (some books: all forces between molecules,
    some: dispersion only; say so once); Siedetemperatur/Schmelztemperatur; Donor/Akzeptor wording for hydrogen bonds
    (not "spenden/annehmen"); "molare Masse", not "wiegt … g/mol"; Autoprotolyse, not "gespalten".

## Checks before you finish

1. `npx tsc --noEmit -p . 2>&1 | grep -E "unitNN|bank/uNN"` shows nothing.
2. `npx tsx tools/sim/lint-de.mts unitNN` and `npx tsx tools/sim/lint-de.mts bank/uNN`: no errors, no warnings (or a
   reason for each one you keep).
3. Explain-back: `npx tsx tools/sim/hint-explain.mts N en|de "<ticked idea numbers>" "<text>"` on at least: a correct
   plain-English answer, a correct technical answer, a correct German school-shorthand answer, a keyword list, an answer
   stating the unit's main misconception, and one that negates the ideas. Correct texts get no "couldn't find" hint on
   ideas they state; the misconception and negated texts get no credit. Do not edit the shared fixture file: list these
   texts in your report under "Hint test texts" (unit, language, text); the main session adds them to
   tools/sim/fixtures/explain-texts.json. `npx tsx tools/sim/regress-hints.mts` must show no changes in other units.
4. `npx tsx tools/sim/audit-content.mts` stays "Problems: none" (once the main session has registered the unit).
5. Every reading URL fetched with WebFetch and on topic; every number checked against the data files or a fetched
   source named in a comment.

## Final report (your last message, under 200 words)

What you wrote (bank items per concept, misconceptions targeted ×n), the explain-back results, reading URLs checked,
data sources, and "Requests": anything needed outside your two files (engine features, data corrections). Do not paste
the content.
