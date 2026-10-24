# Batch brief: units <first>–<last>

A batch is about five units. The main session fills in this brief (one file per batch, e.g.
docs/process/batch-12-16.md) before starting any helper; every helper gets the brief plus the guide for its job.
Keep it short: the guides hold everything that does not change.

## Units

For each unit:

- **Unit N, <title>** (module M). Concepts (ids and names as in curriculum.ts, six per unit).
- Engine: <name>; Show shape; the explore task ids, which are key, which is the challenge, and the engine event that
  ticks each one.
- Hook and data: the puzzle idea, the real data it uses (with the data file or a source to fetch), ideas for the two
  predictions and the three worked examples (one "where the model breaks").
- Spot the flaw shape: number of lines, index of the first wrong step (vary it across the batch).
- Known misconceptions to target (existing ids, and new ones to add).
- German terms the unit must use (school vocabulary), and what to say once where books differ.

## New or extended engines

For each: files the helper owns, what it shows, controls, options, events (exact names and arguments), what show()
must do, what must be unmistakable at a glance, and how it is tested on the dev route. See docs/process/engines.md.

## Shared changes the main session makes first

Concepts in curriculum.ts, data in src/content/*.ts, Show variants in unitTypes.ts, placeholder UI classes,
step-context factories, dev-harness entries, empty bank files registered in items.ts. After the helpers: unit
players (src/units/uNN.ts), registry, PLAYERS, playable list, engine wiring (src/units/engines.ts), home blurbs, lab
entries, exporter descriptions, flow.py explore branches.

## Helper prompts (fresh general-purpose helpers, not forks)

- Engine: "Build the <engine> as specified in docs/process/batch-<…>.md, section <…>. Follow docs/process/engines.md.
  You own only <files>. Do not commit. Report in under 250 words."
- Unit: "Write unit N as specified in docs/process/batch-<…>.md. Follow docs/process/authoring.md. You own only
  src/content/unitNN.ts and src/content/bank/uNN.ts. Do not commit. Report as the guide says."
- Fix: "Fix unit N from <review dir>/issues-uN.md. Follow docs/process/authoring.md. You own only the unit's two
  files. Do not commit. Report in under 150 words: changes, rejections with reasons, Requests."
