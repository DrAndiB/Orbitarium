# Simulation engines

Each engine is a 3D stage (a subclass of Stage3D in src/sim/stage.ts) plus a screen component (…UI.ts) with the
same small surface: `el`, `on(event, f)`, `show(s)` for reveals and worked examples, `dispose()`, and an options object
with `compact` (smaller, no chips, for reveals). Units wire engine events to explore tasks in src/units/engines.ts; the
player creates engines through the step context (src/units/types.ts, src/ui/player.ts); the free lab lists them in
src/ui/lab.ts; the dev route `#/dev/<name>` (src/ui/dev.ts, dev server only) mounts one engine alone and exposes it as
`window.__dev` for Playwright tests.

## Engines that exist

| Engine | Files | Units | Show (src/content/unitTypes.ts) | Main events |
|---|---|---|---|---|
| Periodic table | ui/ptable.ts, sim/tableLandscape.ts | 0 | – (own player, u00.ts) | callbacks in TableOptions |
| Orbital Viewer | sim/orbitals.ts, orbitalsUI.ts | 1–3 | `atom`: z, charge, view, highlight, pull, jump, size | element, view, highlight, shielding, pulled, jump, ion |
| Lattice Builder | sim/lattice.ts, latticeUI.ts | 4 | `lattice`: salt, compare, mode, temp | salt, transfer(-start), neighbours, heat, shift(-start) |
| Charge Field | sim/bond.ts, bondUI.ts | 5 | `bond`: a, b, order | bond, dial |
| Molecule Workbench | sim/workbench.ts, workbenchUI.ts | 6 | – (own player, u06.ts) | loaded, built, toggle, lambda, settled |
| Conductivity tester | sim/conduct.ts, conductUI.ts | 7 | `conduct`: material, on, reversed | material, power, reverse, drift, noCurrent |
| Particle Box | sim/particleBox.ts, particleBoxUI.ts | 8, 9, 11 (later 19, 21–25, 28) | `box`: sub, temp, compare, view, dipoleOff, mix | substance, temp, state, boil, melt, freeze, view, dipoleOff, mix, dissolved, hbonds |
| Hydrogen-bond view | sim/hbond.ts, hbondUI.ts | 10 | `hbond`: a, b, swap, cluster | molecule, partner, swap, cluster |

Still to build (curriculum.ts names them): Zoom Ladder (units 12–15, 31), Lab Bench (16, 27, 29, 30, 32–34), Energy
Landscape (17, 18, 20, 23). Later units reuse the Particle Box and the Molecule Workbench (26, 35–45; the Workbench
handles one central atom, so organic molecules need an extension).

## Building a new engine

The helper that builds an engine owns only its own files (src/sim/<name>.ts, <name>UI.ts, <name>.css, the CSS imported
from the UI file). The main session first adds: the Show variant in unitTypes.ts, a placeholder UI class with the final
name, the step-context factory, the dev-harness entry and (later) the lab entry. Write the engine's spec as a short
section like the ones below in the batch brief: what it shows, the controls, options, events (exact names and
arguments), what `show()` must do, and what must look unmistakable at a glance.

## Read first (patterns to follow)

- src/sim/stage.ts: Stage3D base (renderer, camera, orbit controls, labels, events via on/emit, tick(dt, t), dispose).
- src/sim/lattice.ts + latticeUI.ts and src/sim/bond.ts + bondUI.ts: how an engine and its screen component are
  split; HUD, chip rows (`.chip-row`, `.chip` with aria-pressed), `.atom-buttons`, panels, the heat slider with a
  melting-point marker, `show(sh)` for reveals, compact mode, `refresh()`, i18n.
- src/sim/workbench.ts: CHARGE colours, ATOM_COLOR, COLORS.lonePair; the data files in src/content/; src/content/unitTypes.ts (Show).
- src/ui/dom.ts (h, chem, rich), src/i18n.ts (L, num, numTrim, getLang), src/platform.ts (buzz).

## Shared rules

- Every visible string in English and German (`L({ en, de })`), natural German school terms, du-form, decimal commas
  via num(). Formulas through chem() in HTML, and with Unicode subscripts in 3D labels (H₂O).
- Colour convention (textbook potential maps): red = δ− / negative (0xff6b6b), blue = δ+ / positive (0x5aa9ff).
  Cations blue, anions red, electrons small red-pink dots (0xff8f8f, as in the Orbital Viewer). Lone pairs purple
  (0xb48cff, as in the Molecule Workbench). Atom bodies neutral (ATOM_COLOR). Hydrogen bonds: dashed purple-white
  lines. Do not use colour as the only cue: label the poles "−"/"+", and the δ ends.
- Phone first: the engine must run smoothly at 412 px width on a mid-range phone. Use InstancedMesh or merged
  geometry for many particles, at most about 100 moving particles per box, no per-frame allocations, a fixed physics
  step with at most 3 substeps per frame. Respect `reducedMotion` (slower, calmer motion; no flicker).
- Compact mode (reveals and worked examples): smaller stage (the `.wb-stage.compact` class), no chip rows, only what
  `show()` needs; auto-rotation off or slow.
- Events: emit through the UI component's own `on(evt, f)` (forward from the stage like LatticeUI does). Event names
  and arguments exactly as listed below; the unit wiring ticks explore tasks from them.
- `show(s)` must be idempotent and work when called repeatedly with different values on the same instance (the
  reveal and the worked-example cards reuse one compact engine).
- Honest models: where the picture is a model (e.g. a what-if), the UI says so in plain words ("model estimate").
  Numbers shown on screen come from substances.ts.
- `npx tsc --noEmit -p .` must show no errors in your files. Remove debug code. No console output.


## Testing an engine

Start a dev server on a free port (`npx vite --port 518X --strictPort`, in the background), open
`http://localhost:518X/#/dev/<name>` in Playwright's Chromium with `--use-gl=angle --use-angle=swiftshader
--enable-unsafe-swiftshader --ignore-gpu-blocklist` at 412×915, device scale 1.5, call `__dev.show({...})`, take
screenshots and look at them. Software GL is slow: frame times in the test browser say nothing about a phone. Check
compact mode and German (switch the language in the app's settings or read the strings). tools/sim/flow.py then walks a
whole unit once the unit is wired.
