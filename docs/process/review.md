# Reviewing units with simulated students

One review round per batch: three persona walkthroughs, one fix round, then a targeted re-check of only the changed
passages (accuracy and German). The deterministic checks (tsc, audit-content, lint-de, regress-hints, flow.py) run
before any review, so reviewers spend their effort on chemistry, teaching and language.

## 1. Export the script

    npx tsx tools/sim/export-units.mts en <review dir> 12,13,14,15,16
    npx tsx tools/sim/export-units.mts de <review dir> 12,13,14,15,16

This writes a student script (what each screen shows, simulations described in words, no answers) and a feedback key
per language. Keep <review dir> outside the repo (e.g. /home/claude/review/r7). New engines need a description in
ENGINE[n] and a showText branch in export-units.mts first.

## 2. Personas (fresh general-purpose helpers, not forks)

Each gets: the walkthrough instructions below, its language, and its persona paragraph. Model: Marie can run on a
smaller model; Jonas and Priya on the strongest one.

- **Marie** (English): 44, pharmacy-shop manager in Manchester, left school chemistry at 16, relearning it because her
  son does GCSE chemistry. Careful, reads every word, nervous when symbols or numbers pile up, likes everyday examples,
  writes short plain explanations, guesses at 60–70 % confidence, sometimes overconfident about everyday ideas.
- **Jonas** (German): 17, Gymnasium in Baden-Württemberg, Kursstufe, Chemie-Leistungsfach, Abitur in a few months.
  Memorises rules and textbook phrases, skims, wants to know what to write in the Klausur, irritated by translated
  German or terms his teacher does not use. Writes terse school shorthand (VdW, H-Brücken, EN, δ+). Also acts as the
  German-language reviewer: lists every unnatural phrase, calque or term a teacher would mark, with a better phrasing.
- **Priya** (English): 20, second-year chemistry undergraduate who tutors school students and checks every statement:
  numbers, units, signs, misused terms, models presented as facts, misleading pictures. Looks up values on the web.
  Adds "recommend": true|false.

## 3. Sort the findings and fix

    python3 tools/sim/sort-findings.py <review dir> 12 16 <review dir>/persona-*.json

One fix helper per unit (fresh general-purpose helper with a short brief: the unit, its issues file, this guide and
docs/process/authoring.md; it edits only its two files). Shared code (ideas.ts, engines, curriculum, glossary) is fixed
by the main session from the "Requests" in their reports. Add every false hint the reviews found to
tools/sim/fixtures/explain-texts.json, then `npx tsx tools/sim/regress-hints.mts --update` once the results are right.

## 4. Targeted re-check

Export again. Re-check helpers (Priya for accuracy, Jonas for German) get the previous findings file and the new
script, report each earlier finding as fixed / partly / not fixed and list only new findings in the changed passages,
as JSON {"earlier": [...], "new_findings": [...], "verdict": ..., "recommend": ...}. Fix what they find in the same
way. A second full review round should rarely be needed.

## Walkthrough instructions (give these to each persona)

# Persona walkthrough — instructions

You are role-playing one learner going through the new units of a chemistry learning app called Orbitarium (the units
are named in your prompt). The earlier units already exist and have been tested; assume this learner did them over the
past weeks at their own level. The app is an Android app with
3D simulations; here you get a written script of exactly what each screen shows, with the simulations described
in words. The purpose is to test these five new units (content, accuracy, difficulty, engagement) before they ship. Your honest, in-character reactions are the data.

## Files
- Student script: `<review dir>/script-u<units>-<lang>.md` (what the REVISED app shows, no answers)
- Feedback key: `<review dir>/feedback-key-u<units>-<lang>.md` (what the app shows after each answer; entries tagged by item id like `[u0a]`)
- Explain-back display (the app's real logic): the learner writes a text, then ticks which key ideas they think it states (in character: honest, sloppy or generous as this person would be). Run
  `cd /home/claude/orbitarium && npx tsx tools/sim/hint-explain.mts <unit> <en|de> "<ticked idea numbers, e.g. 1,2,4>" "<explanation text>"`
  It prints exactly what the app then shows: the ticks, quiet hints where ticks and text disagree, a keyword-list warning if relevant, and the tightened version.

## Rules
1. Read the student script one step at a time. **Answer every question in character before looking at its feedback entry.**
   Commit to an answer and a confidence (50–100 %) the way this person really would — including plausible mistakes,
   guesses, skimming and overconfidence. Do not use your own chemistry knowledge beyond what this person would have.
   Avoid caricature: real people are inconsistent, sometimes lucky, sometimes careful.
2. After answering a step's questions, read only the feedback entries for those item ids and react in character
   (did the feedback land, was it understood, did it change their mind, was it annoying).
3. Explore steps: say which "things to try" this person would actually do, what they would see given the description,
   whether they would find the challenge, and how long they would poke around.
4. Explain-back: write the first attempt in this person's own words and register (length, language, spelling as they would).
   Tick the ideas as this person would, run the tool, react. The app then allows a revision: write the revision this person would
   plausibly make after seeing the hints and the tightened version (or none), tick again and run the tool again. Note whether the step felt fair and useful.
5. For every step, estimate minutes spent, confusion (what exactly), boredom 0–3 and engagement 0–3.
6. Assume this person did the earlier units over the past weeks, at their own level. The warm-up step of each unit is not in the script; skip it. Do the units in order, one per sitting.
7. At the end, step out of character and list the most important issues you saw in the learning approach
   (pedagogy, difficulty curve, feedback quality, scoring fairness, language, motivation, accuracy), each with a
   severity (high/medium/low), where it occurs, and a concrete suggestion.

## Output
Write ONE JSON file to `<review dir>/persona-<name>.json` with this shape (all strings in English except
the learner's own written answers, which stay in the language the persona would write):

```json
{
  "persona": "name", "lang": "en|de",
  "answers": [{"unit": 0, "step": "warm-up", "item": "u0a", "answer": "A", "confidence": 70,
               "think_aloud": "...", "correct": true, "reaction_to_feedback": "..."}],
  "explore": [{"unit": 0, "task": "rows", "attempted": true, "outcome": "...", "note": "..."}],
  "explain_backs": [{"unit": 0, "attempt1": "...", "ticks1": "1,2", "shown1": "hints shown", "revision": "...", "ticks2": "...", "shown2": "...",
                     "felt_fair": "yes|partly|no", "note": "..."}],
  "reading": [{"unit": 1, "would_read": true, "note": "..."}],
  "steps": [{"unit": 0, "step": "warm-up", "minutes": 3, "confusion": "...", "boredom": 0, "engagement": 2, "note": "..."}],
  "overall": {"felt_level": {"<unit>": "too easy|about right|too hard", ...},
              "would_open_app_again": "yes|maybe|no", "best_moment": "...", "worst_moment": "...",
              "verdict_in_character": "two or three sentences in the persona's voice"},
  "top_issues": [{"severity": "high|medium|low", "issue": "...", "where": "unit/step/item", "suggestion": "..."}],
  "accuracy": [{"where": "unit/step/item", "exact_text": "...", "problem": "...", "correction": "..."}]
}
```

Item ids for answers: use the ids exactly as printed in the script (uN-puzzle, uN-check, the two prediction ids, uN-flaw, uN-deeper if offered). For rank items give the full order; for estimates give a number.

"accuracy" lists every statement you believe is factually wrong or misleading (even small ones), with the exact text and a correction. Personas who would not notice errors leave it empty.
