# Orbitarium: handoff for the next session

Orbitarium is Andreas's offline chemistry learning app for Android, in English and German, built from his chemistry
curriculum (10 modules, units 0–45, listed in src/content/curriculum.ts). Private first. Vite + TypeScript (strict,
noUnusedLocals) + Three.js, wrapped with Capacitor; GitHub Actions builds the APK.

**Status:** units 0–11 are playable and reviewed (modules 1–3: periodic table, atoms, bonding, forces between
molecules). **Next:** module 4, units 12–16 (counting by weighing, formulas and molar mass, balancing equations,
limiting reagent and yield, concentration). They need two new engines, the Zoom Ladder (12–15) and the Lab Bench (16).
**Batch 12–16 (2026-10-24):** engines and units 12–16 built, wired, checked and shipped as build-29 (before review). One
review round done (Marie, Jonas, Priya); the fix round was paused before any unit edits. Open: per-unit fixes (top: unit
16's "isotonic" glucose claim, false explain-back hints, units too long at 31–42 min, German calques), shared fixes (Pb
207.2 in elements.ts, "=" shorthand in ideas.ts), targeted re-check, then push, web preview and Learner Simulation doc.

**Owner preferences:** Andreas works on Windows: give command-line examples for PowerShell, not bash or curl. He
likes workflows and data flows shown visually. He reads English and German (native German).

## Where things are

- `src/content/`: unit content (unitNN.ts, UnitContent format), review banks (bank/uNN.ts), curriculum (concepts,
  misconceptions, playable units), glossary, data (elements, atoms, ions, bonds, substances), `ideas.ts` (explain-back
  hint matcher), `registry.ts` (registers content units).
- `src/sim/`: the engines (see docs/process/engines.md). `src/units/`: the generic seven-step player (generic.ts),
  engine wiring and explore-task ticking (engines.ts), one small file per unit. `src/ui/`: screens. `src/model/`:
  learner model (FSRS memory, understanding ladder, misconception ledger), progress file.
- `tools/sim/`: checks and simulations (below). `docs/process/`: how to write units, build engines, review, and the
  batch-brief template. `android/`, `.github/workflows/android.yml`: the APK build.

## Commands (run in the repo; on Windows PowerShell write `python` for `python3`, otherwise the same)

    npm install
    npx vite --port 5174                          # dev server for flow.py (engine helpers use 5181–5189 each);
                                                  # #/dev/box, #/dev/conduct, #/dev/hbond mount one engine
    npx tsc --noEmit -p .                         # must be clean before any commit
    npx tsx tools/sim/audit-content.mts           # content coverage, traps, glossary: must print "Problems: none"
    npx tsx tools/sim/lint-de.mts [unitNN]        # German wording rules: new units must have no errors or warnings
                                                  # (units 0–6 and the UI still carry 43 old warnings: clean them when touched)
    npx tsx tools/sim/regress-hints.mts [--update]# explain-back snapshot: tightened versions 5/5, no unintended changes
    npx tsx tools/sim/rubric-test.ts [out.json]   # wrong, negated and keyword-list answers get no credit (✓/✗ line)
    npx tsx tools/sim/hint-explain.mts N de "1,2" "<text>"   # what the explain step shows for one text
    python3 tools/sim/flow.py http://localhost:5174/ de <dir> N   # walk unit N in a phone-sized browser
    npx tsx tools/sim/export-units.mts en <dir> 12,13          # student script + feedback key for reviews
    npx tsx tools/sim/run.ts [out.json]           # ten-week learner model on the real units (default model-sim.json)
    npm run build:single && python3 tools/make_artifact.py <out.html>   # single-file web preview

## Release and secrets

- Every push to `main` builds an APK and publishes it as release `build-N` (pre-release). Andreas has agreed that
  finished, checked work is committed and pushed to `main` this way. Push only when tsc and the checks pass: a
  half-finished push publishes a broken build or a failing run.
- Builds are signed with Andreas's own key from the repository secrets (ANDROID_KEYSTORE_B64,
  ANDROID_KEYSTORE_PASSWORD, ANDROID_KEY_ALIAS), so each APK installs over the previous one and keeps progress.
  Certificate SHA-256 `3B:21:43:85:D7:91:F1:13:EA:AA:9A:B2:49:43:48:EB:3E:24:5D:9F:62:C0:05:7B:7E:7F:4F:CB:0B:1B:21:3C`;
  check a release with `python3 -I tools/sim/apk-cert.py <apk>` (needs `pip install androguard`). Download release
  assets with `gh api -H "Accept: application/octet-stream" repos/DrAndiB/Orbitarium/releases/assets/<id>`.
- The repo is public. Never commit a keystore, a password or `seed.local.md` (Andreas's personal progress seed;
  git-ignored; CI reads it from the SEED_PROGRESS secret).
- Web preview: the claude.ai artifact https://claude.ai/artifact/GGQ15QkdxibE2FQ7VC6yQu (update it in place with the
  Artifact tool and that url). Review history: the Claude Doc "Orbitarium — Learner Simulation" (artifact id
  4dsupNqDzzMWwJ5xx6vaJN; edit it with the Claude Docs tools, one section per batch, newest on top).

## Conventions (details in docs/process/authoring.md)

- Every visible string is bilingual: `b('en', 'de')` in content, `L({ en, de })` in code. German: school terms,
  du-form, „…“ quotes, decimal commas, no thousands separator up to four digits, narrow space from five, "6 · 10⁷".
- Colours follow textbook potential maps: red = δ− / negative, blue = δ+ / positive; cations blue, anions red,
  electrons small red-pink dots, lone pairs purple. Never colour alone: label the sign.
- Content markup: {{H2O}} formulas, [[term-id]] glossary chips, **bold**, Z_{eff} subscripts.
- No teleology (atoms do not "want"), models are called models, every number comes from a data file or a cited source.
- Regular expressions over German text: `\b` does not see a boundary before an umlaut; use `(?<!\p{L})` with the u flag.

## How to build a batch of units cheaply

The batch of units 7–11 cost about 13 million helper tokens, 90 % of it because each helper was forked from a very long
conversation and started with its whole history. Work like this instead:

1. **Start each batch in a fresh session.** Read this file, then write `docs/process/batch-<first>-<last>.md` from
   docs/process/batch-brief-template.md (concepts, engine specs, task ids, ideas, flaw shapes). Do the shared changes
   it lists (concepts, data, Show types, placeholders, factories, empty banks) and commit.
2. **Use fresh general-purpose helpers with short prompts, never forks.** Each prompt names its job, the batch brief,
   the guide (authoring.md, engines.md or review.md) and the files it owns. Run the engine helpers and the unit
   helpers in parallel; unit helpers only need the engine spec, not the finished engine.
3. **Pick the model by judgement needed:** engines, unit writing and Priya's accuracy check on the strongest model;
   Marie's walkthrough, German lint follow-ups, test runs and exports on a smaller one.
4. **Wire and check** (main session): unit players `src/units/uNN.ts`; `PLAYERS` in `src/ui/player.ts`;
   `CONTENT_UNITS` in `src/content/registry.ts`; the playable list at the end of `src/content/curriculum.ts`; engine
   wiring in `src/units/engines.ts`; `src/ui/lab.ts`; unit blurbs in `src/ui/home.ts`; `ENGINE[n]` and `showText` in
   `tools/sim/export-units.mts`; an explore branch in `tools/sim/flow.py`. Add the helpers' hint test texts to
   `tools/sim/fixtures/explain-texts.json` and update the snapshot. Then tsc, audit, lint-de, regress-hints,
   rubric-test, flow.py in EN and DE. Commit and push.
5. **One review round** (docs/process/review.md): three personas, sort-findings.py, one fix helper per unit, shared
   fixes in the main session, add every false hint to tools/sim/fixtures/explain-texts.json and update the snapshot.
6. **Targeted re-check** of changed passages only (Priya, Jonas), one more small fix round if needed.
7. **Ship:** push, wait for the build, check the signature, update the web preview and the Learner Simulation doc,
   tell Andreas the APK link and what changed in plain words.

Keep the main session lean: read only the parts of files you need, ask helpers for short reports, look at screenshots
as one contact sheet, and do not paste long outputs into the conversation.

**Lessons from batch 12–16** (about 3.4 M helper tokens up to the fix round, against 13 M for 7–11; but seven Opus
helpers at once used up the account's usage window in about 90 minutes and stalled the batch for three hours):
- Pace the helpers: **at most three at a time**. Start the two engines and one unit, then the next units as slots free.
- Every helper spends about 140 k tokens reading CLAUDE.md, the brief and the guides before it edits anything, so
  never start a helper you might stop, and resume a stopped helper with SendMessage instead of starting a new one.
- Models: Opus for engines, unit writing and Priya; **Sonnet for fix helpers, Marie and Jonas**.
- Fix a unit with about ten findings or fewer in the main session instead of a helper.
- Priya's accuracy review is the most expensive step (about 2½ hours, 100+ tool calls); give her a numbers list from
  stoich.ts up front so she checks claims rather than recomputing every value.
