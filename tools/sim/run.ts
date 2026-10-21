// Ten-week learner simulation on the app's real learner model (src/model/*).
// Each simulated learner has a hidden "true" memory per concept (its own forgetting model, independent of FSRS)
// and answers items accordingly; the app's own code picks the warm-ups, records answers and estimates recall.
// Usage: npx tsx tools/sim/run.ts [out.json] [variant]
// Variants: base (as built) | fixed (proposed changes, see FIXES below)

// ---------- shims: the store reads localStorage and location.search ----------
const mem = new Map<string, string>();
(globalThis as any).localStorage = { getItem: (k: string) => mem.get(k) ?? null, setItem: (k: string, v: string) => { mem.set(k, v); }, removeItem: (k: string) => { mem.delete(k); } };
const loc = { search: '' };
(globalThis as any).location = loc;
let seed = 1;
const rnd = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };
Math.random = rnd;

const { writeFileSync } = await import('node:fs');
const store = await import('../../src/model/store');
const learner = await import('../../src/model/learner');
const fsrs = await import('../../src/model/fsrs');
const items = await import('../../src/content/items');
const { UNIT0 } = await import('../../src/content/unit00');
const { UNIT6 } = await import('../../src/content/unit06');
type Item = import('../../src/content/items').Item;

const OUT = process.argv[2] ?? '/home/claude/sim-out/model-sim.json';
const VARIANT = (process.argv[3] ?? 'base') as 'base' | 'fixed';
const DAYS = 70;
const START = '2026-10-26'; // a Monday
const UNIT_COUNT = 30;

// ---------- content: unit 0 and unit 6 are real; every other unit is a clone of unit 6 with renamed ids ----------
const realBank = items.BANK.slice();
const u6bank = realBank.filter((i) => i.unit === 6);
const u0bank = realBank.filter((i) => i.unit === 0);
items.BANK.length = 0;
items.BANK.push(...u0bank);

interface InUnit { kind: 'item'; item: Item } // answered through the same path as renderItem
interface Special { kind: 'special'; id: string; concepts: string[]; evidence: 'explain' | 'transfer'; targets?: string[]; p: 'challenge' | 'know'; options?: number }
type Step = InUnit | Special;
interface UnitDef { n: number; concepts: string[]; mis: string[]; steps: Step[]; ideas: { concept: string }[]; firstWarmup?: string[] }

function rename(n: number, id: string) { return id.replace(/^u6\./, `s${n}.`); }
function renameMis(n: number, id: string) { return `s${n}:${id}`; }
function cloneItem(n: number, it: Item, idPrefix: string): Item {
  const c: any = JSON.parse(JSON.stringify(it));
  c.id = `${idPrefix}${n}-${it.id}`; c.unit = n;
  c.concepts = it.concepts.map((x: string) => rename(n, x));
  if (it.targets) c.targets = it.targets.map((x) => renameMis(n, x));
  if ((it as any).options) c.options = (it as any).options.map((o: any) => ({ ...o, mis: o.mis ? renameMis(n, o.mis) : undefined }));
  if ((it as any).mis) c.mis = renameMis(n, (it as any).mis);
  return c;
}
const u6concepts = ['u6.pairs-repel', 'u6.lp-count', 'u6.shape-from-atoms', 'u6.lp-squeeze', 'u6.multiple-bond', 'u6.symmetry'];
const u6mis = [...new Set([UNIT6.puzzle.question, UNIT6.explore.rank, ...UNIT6.predictions.map((p) => p.item), UNIT6.flaw, ...u6bank].flatMap((i: any) => [...(i.targets ?? []), ...((i.options ?? []).map((o: any) => o.mis).filter(Boolean))]))];

function unit6Like(n: number): UnitDef {
  const real = n === 6;
  const ci = (it: Item) => (real ? it : cloneItem(n, it, 'x'));
  const R = (id: string) => (real ? id : rename(n, id));
  const M = (id: string) => (real ? id : renameMis(n, id));
  return {
    n, concepts: u6concepts.map(R), mis: u6mis.map(M),
    steps: [
      { kind: 'item', item: ci(UNIT6.puzzle.question as Item) },
      { kind: 'item', item: ci(UNIT6.explore.rank as Item) },
      { kind: 'special', id: `u${n}-build`, concepts: [R('u6.symmetry')], evidence: 'transfer', targets: [M('polar-bonds-polar-molecule')], p: 'challenge' },
      ...UNIT6.predictions.map((p) => ({ kind: 'item' as const, item: ci(p.item as Item) })),
      { kind: 'special', id: `u${n}-draw`, concepts: [R('u6.symmetry'), R('u6.lp-count')], evidence: 'explain', p: 'know', options: 8 },
      { kind: 'item', item: ci(UNIT6.flaw as Item) },
    ],
    ideas: UNIT6.explain.ideas.map((i) => ({ concept: R(i.concept) })),
  };
}
function unit0(): UnitDef {
  return {
    n: 0, concepts: ['u0.rows-shells', 'u0.columns-outer', 'u0.families', 'u0.blocks', 'u0.core-elements', 'u0.mass-average'],
    mis: ['mass-is-one-atom', 'order-by-mass'],
    firstWarmup: ['u0a', 'u0b', 'u0c'],
    steps: [
      { kind: 'item', item: UNIT0.puzzle.item as Item },
      { kind: 'special', id: 'u0-order', concepts: ['u0.families'], evidence: 'transfer', targets: ['order-by-mass'], p: 'challenge' },
      { kind: 'item', item: items.itemById('u0h')! },
      ...UNIT0.predictions.map((p) => ({ kind: 'item' as const, item: p.item as Item })),
      { kind: 'special', id: 'u0-locate', concepts: UNIT0.locate.concepts, evidence: 'explain', p: 'know', options: 20 },
      { kind: 'item', item: UNIT0.flaw as Item },
    ],
    ideas: UNIT0.explain.ideas.map((i) => ({ concept: i.concept })),
  };
}
const UNITS: UnitDef[] = [];
for (let n = 0; n < UNIT_COUNT; n++) {
  const def = n === 0 ? unit0() : unit6Like(n);
  UNITS.push(def);
  if (n === 6) items.BANK.push(...u6bank);
  else if (n !== 0) items.BANK.push(...u6bank.map((it) => cloneItem(n, it, 'b')));
}
const ALL_MIS = UNITS.flatMap((u) => u.mis);

// ---------- FIXES (variant 'fixed'): what the proposed changes would do ----------
// 1. Warm-up size follows the due backlog: 3 items, plus one per 6 due concepts, at most 8.
// 2. Concept-first picking: choose the most-faded *concept*, then the least-recently-seen item for it
//    (item variants rotate, so the same item is not repeated while others exist).
// 3. Each concept gets three bank variants (generated per concept in the fixed curriculum).
// 4. Transfer items in the bank: one variant per concept is marked 'transfer', so level 4 is reachable after 7 days.
// 5. Adaptive unit: when a learner gets fewer than half the unit items right, the next session repeats the unit's core
//    (a short "second pass" session of the unit's items) before moving on.
if (VARIANT === 'fixed') {
  items.BANK.length = 0;
  items.BANK.push(...u0bank);
  for (const u of UNITS) {
    if (u.n === 0) continue;
    for (const c of u.concepts) {
      for (let v = 0; v < 3; v++) {
        const base: any = cloneItem(u.n, u6bank[v % u6bank.length], 'f');
        base.id = `f${u.n}-${c}-${v}`; base.concepts = [c];
        if (v === 2) base.evidence = 'transfer';
        items.BANK.push(base);
      }
    }
  }
  for (const c of UNITS[0].concepts) if (!u0bank.some((i) => i.concepts.includes(c))) {
    for (let v = 0; v < 2; v++) { const base: any = JSON.parse(JSON.stringify(u0bank[0])); base.id = `f0-${c}-${v}`; base.concepts = [c]; items.BANK.push(base); }
  }
  // mark one unit-0 variant per concept as transfer
  const seenC = new Set<string>();
  for (const it of items.BANK) if (it.unit === 0 && it.concepts.length === 1 && !seenC.has(it.concepts[0])) { seenC.add(it.concepts[0]); (it as any).evidence = (it as any).evidence ?? 'predict'; }
}
function pickFixed(n: number, exclude: number | undefined, now: string): Item[] {
  const st = store.getState();
  const due = learner.dueConcepts().filter((d) => !UNITS[exclude ?? -1]?.concepts.includes(d.id));
  const size = Math.min(8, 3 + Math.floor(due.length / 6));
  const lastSeen = new Map<string, string>();
  for (const a of st.attempts) lastSeen.set(a.item, a.at);
  const out: Item[] = [];
  const pool = due.length ? due : Object.keys(st.concepts).map((id) => ({ id, r: learner.recall(id) })).sort((a, b) => a.r - b.r);
  for (const d of pool) {
    if (out.length >= size) break;
    const cands = items.BANK.filter((it) => it.unit !== exclude && it.concepts.includes(d.id) && !out.includes(it));
    if (!cands.length) continue;
    cands.sort((a, b) => (lastSeen.get(a.id) ?? '0000').localeCompare(lastSeen.get(b.id) ?? '0000'));
    const it = cands[0];
    if (lastSeen.get(it.id) && fsrs.daysBetween(lastSeen.get(it.id)!, now) < 2) continue;
    out.push(it);
  }
  return out.length ? out : learner.pickWarmup(3, exclude);
}

// ---------- learners ----------
interface Profile {
  name: string; label: string;
  S0: number;           // true stability after first learning (days)
  gain: number;         // spacing gain on successful retrieval
  pLearn: number;       // chance a concept is really understood in its unit
  pFix: number;         // chance that feedback on a wrong answer fixes understanding
  pMis: number;         // chance of arriving with each misconception
  pFixMis: number;      // chance a unit's confrontation, or feedback on a trap, removes a misconception
  explain: number;      // chance an understood idea makes it into the explain-back text and is recognised
  challenge: number;    // chance of solving an explore challenge
  bias: number;         // confidence bias (+ overconfident)
  answerMem: number;    // how well answers to repeated items are remembered (multiplier on item memory stability)
  schedule: (day: number, dow: number) => 'unit' | 'rekindle' | null;
}
const P: Profile[] = [
  { name: 'struggling', label: 'Struggling beginner', S0: 1.5, gain: 1.8, pLearn: 0.55, pFix: 0.35, pMis: 0.6, pFixMis: 0.3, explain: 0.55, challenge: 0.2, bias: -0.08, answerMem: 1.0,
    schedule: (d, w) => ([0, 2, 4].includes(w) ? (rnd() < 0.7 ? 'unit' : null) : w === 5 && rnd() < 0.15 ? 'rekindle' : null) },
  { name: 'average', label: 'Average adult', S0: 3, gain: 2.4, pLearn: 0.8, pFix: 0.5, pMis: 0.35, pFixMis: 0.45, explain: 0.75, challenge: 0.5, bias: 0.04, answerMem: 1.0,
    schedule: (d, w) => ([0, 2, 4].includes(w) ? (rnd() < 0.9 ? 'unit' : null) : w === 5 && rnd() < 0.5 ? 'rekindle' : null) },
  { name: 'strong', label: 'Strong, disciplined', S0: 6, gain: 3, pLearn: 0.95, pFix: 0.7, pMis: 0.15, pFixMis: 0.6, explain: 0.9, challenge: 0.8, bias: 0, answerMem: 1.0,
    schedule: (d, w) => ([0, 2, 4].includes(w) ? 'unit' : w === 6 ? 'rekindle' : null) },
  { name: 'irregular', label: 'Irregular, overconfident', S0: 3, gain: 2.2, pLearn: 0.75, pFix: 0.4, pMis: 0.4, pFixMis: 0.35, explain: 0.6, challenge: 0.4, bias: 0.18, answerMem: 1.4,
    schedule: (d, w) => { const wk = Math.floor(d / 7); const per = [5, 4, 1, 0, 0, 3, 5, 2, 0, 4][wk]; const days = [[0, 1, 2, 3, 4], [0, 1, 3, 5], [2], [], [], [1, 3, 5], [0, 1, 2, 3, 4], [1, 4], [], [0, 1, 3, 5]][wk]; return days.includes(w) && per ? 'unit' : null; } },
];

interface Truth { u: boolean; S: number; last: string; diff: number }
const day = (i: number) => fsrs.addDays(START, i);

function runProfile(p0: Profile, runSeed: number) {
  const p = { ...p0, gain: p0.gain * Number(process.env.GAINX ?? 1), S0: p0.S0 * Number(process.env.S0X ?? 1) };
  seed = runSeed;
  mem.clear();
  store.replaceState({ ...store.defaultState(), onboarded: true, learner: p.name });
  const truth = new Map<string, Truth>();
  const itemMem = new Map<string, { S: number; last: string; n: number }>();
  const held = new Set<string>();
  const crossUnit = new Set<string>();
  // hyperbolic (power-law) forgetting, deliberately not the app's FSRS curve: R = 1 / (1 + 0.2·t/S)
  const R = (c: string, now: string) => { const t = truth.get(c); return t ? 1 / (1 + 0.2 * fsrs.daysBetween(t.last, now) / t.S) : 0; };
  const knows = (c: string, now: string) => { const t = truth.get(c); return !!t && t.u && rnd() < R(c, now); };
  const retrieve = (c: string, now: string, ok: boolean) => {
    const t = truth.get(c); if (!t) return;
    const r = R(c, now);
    if (ok && t.u) t.S = t.S * (1 + p.gain * Math.max(0.02, 1 - r) / t.diff);
    else if (!ok) { if (!t.u && rnd() < p.pFix) t.u = true; t.S = Math.max(p.S0 * 0.5, t.S * 0.6); }
    t.last = now;
  };

  const log: any = { daily: [], units: [], warmups: [], probes: null };
  let nextUnit = 0;
  let repeatPending: number | null = null;
  let answerMemCorrect = 0, warmupAnswers = 0, warmupRepeats = 0, servedReviews = 0;
  const unitFirstReview = new Map<string, string>();
  const conceptUnit = new Map<string, number>();
  for (const u of UNITS) for (const c of u.concepts) conceptUnit.set(c, u.n);

  function answer(it: Item, now: string, ctx: 'warmup' | 'unit') {
    for (const c of it.concepts) if (!truth.has(c)) { const diff = 0.7 + rnd() * 0.6; truth.set(c, { u: rnd() < p.pLearn * 0.6, S: p.S0 / diff, last: now, diff }); crossUnit.add(c); }
    const im = itemMem.get(it.id);
    const memHit = !!im && rnd() < 1 / (1 + 0.2 * fsrs.daysBetween(im.last, now) / im.S);
    const targetsHeld = (it.targets ?? []).filter((m) => held.has(m));
    const opts: any[] = (it as any).options ?? [];
    const misOpt = opts.findIndex((o) => o.mis && held.has(o.mis));
    let know = it.concepts.every((c) => knows(c, now));
    if (targetsHeld.length && rnd() < 0.6) know = false; // a held misconception overrides knowledge
    let correct = false, partial = false, chosenMis: string | undefined, conf: number | undefined;
    if (know) correct = rnd() > 0.04;
    else if (memHit && !targetsHeld.length) { correct = true; if (ctx === 'warmup') answerMemCorrect++; }
    else if (it.kind === 'choice') {
      if (misOpt >= 0 && rnd() < 0.75) chosenMis = opts[misOpt].mis;
      else { const k = rnd() * opts.length | 0; correct = !!opts[k].correct; if (!correct) chosenMis = opts[k].mis; }
    } else if (it.kind === 'rank') { const r = rnd(); correct = r < 0.17; partial = !correct && r < 0.55; if (!correct && !partial && targetsHeld.length) chosenMis = (it as any).mis; }
    else if (it.kind === 'estimate') { const r = rnd(); correct = r < 0.2; partial = !correct && r < 0.5; }
    else if (it.kind === 'flaw') { correct = rnd() < 1 / it.lines.length; if (!correct) chosenMis = it.targets?.[0]; }
    if (it.kind === 'choice' && (it as any).withConfidence) {
      const subj = (know ? 0.88 : memHit ? 0.8 : 0.6) + p.bias + (rnd() - 0.5) * 0.16;
      conf = Math.round(Math.min(1, Math.max(0.5, subj)) * 20) / 20;
    }
    // what the app records — same fields as the UI
    const rec: any = { item: it.id, concepts: it.concepts, correct, partial, targets: it.targets, evidence: it.evidence ?? (it.kind === 'flaw' ? 'transfer' : 'predict') };
    if (it.kind === 'choice') { rec.conf = conf; rec.chosenMis = correct ? undefined : chosenMis; rec.partial = undefined; }
    if (it.kind === 'rank') rec.chosenMis = chosenMis;
    if (it.kind === 'flaw') { rec.chosenMis = correct ? undefined : it.targets?.[0]; rec.partial = undefined; }
    learner.recordAnswer(rec);
    // the learner's truth after feedback
    for (const c of it.concepts) retrieve(c, now, correct && know);
    if (chosenMis && held.has(chosenMis) && rnd() < p.pFixMis) held.delete(chosenMis);
    itemMem.set(it.id, im ? { S: im.S * 2.5 * p.answerMem, last: now, n: im.n + 1 } : { S: 3 * p.answerMem, last: now, n: 1 });
    return { correct, partial, know, memHit, repeat: !!im };
  }

  function warmup(n: number | undefined, now: string, kind: 'warmup' | 'rekindle') {
    const its = VARIANT === 'fixed' ? pickFixed(3, n, now) : kind === 'rekindle' ? learner.pickRekindle(3) : learner.pickWarmup(3, n);
    const dueBefore = learner.dueConcepts().length;
    let right = 0;
    for (const it of its) {
      const r = answer(it, now, 'warmup');
      warmupAnswers++; if (r.repeat) warmupRepeats++; if (r.correct) right++;
      servedReviews += it.concepts.length;
      for (const c of it.concepts) if (!unitFirstReview.has(c)) unitFirstReview.set(c, now);
    }
    log.warmups.push({ date: now, kind, items: its.map((i) => i.id), right, dueBefore });
  }

  function doUnit(u: UnitDef, now: string, secondPass = false) {
    learner.markSeen(u.concepts);
    for (const c of u.concepts) if (!truth.has(c)) {
      const diff = 0.7 + rnd() * 0.6;
      truth.set(c, { u: rnd() < p.pLearn / diff * 0.9 + 0.05, S: p.S0 / diff, last: now, diff });
    }
    if (!secondPass) for (const m of u.mis) if (rnd() < p.pMis) held.add(m);
    const st = store.getState();
    const firstTime = u.firstWarmup && !st.attempts.some((a) => a.item.startsWith('u0'));
    if (firstTime) for (const id of u.firstWarmup!) answer(items.itemById(id)!, now, 'unit');
    else warmup(u.n, now, 'warmup');
    let right = 0, total = 0;
    for (const s of u.steps) {
      if (s.kind === 'item') { const r = answer(s.item, now, 'unit'); total++; if (r.correct) right++; }
      else if (s.p === 'challenge') {
        if (rnd() < p.challenge) learner.recordAnswer({ item: s.id, concepts: s.concepts, correct: true, evidence: s.evidence, targets: s.targets });
      } else {
        const know = s.concepts.every((c) => knows(c, now));
        const correct = know || rnd() < 1 / (s.options ?? 4);
        learner.recordAnswer({ item: s.id, concepts: s.concepts, correct, evidence: s.evidence });
        for (const c of s.concepts) retrieve(c, now, correct && know);
        total++; if (correct) right++;
      }
    }
    // the unit's confrontation can dissolve a held misconception
    for (const m of u.mis) if (held.has(m) && rnd() < p.pFixMis) held.delete(m);
    // explain-back, scored like the app (≥1 hit records explain evidence for hit concepts, misses as partial)
    const hits = u.ideas.filter((i) => truth.get(i.concept)?.u && rnd() < p.explain);
    const hc = [...new Set(hits.map((h) => h.concept))];
    if (hc.length) learner.recordAnswer({ item: `u${u.n}-explain`, concepts: hc, correct: true, conf: 0.8, evidence: 'explain' });
    const missed = [...new Set(u.ideas.map((i) => i.concept))].filter((c) => !hc.includes(c));
    if (missed.length) learner.recordAnswer({ item: `u${u.n}-explain-missed`, concepts: missed, correct: false, partial: true });
    for (const c of hc) retrieve(c, now, true);
    learner.logSession('unit', u.n);
    st.units[u.n] = { status: 'done', completedAt: now };
    const acc = right / total;
    log.units.push({ date: now, unit: u.n, secondPass, acc, trueUnderstood: u.concepts.filter((c) => truth.get(c)!.u).length / u.concepts.length });
    return acc;
  }

  for (let i = 0; i < DAYS; i++) {
    const now = day(i);
    loc.search = `?today=${now}`;
    const dow = i % 7; // 0 = Monday
    const what = p.schedule(i, dow);
    if (what === 'unit' && nextUnit < UNITS.length) {
      if (VARIANT === 'fixed' && repeatPending !== null) { doUnit(UNITS[repeatPending], now, true); repeatPending = null; }
      else {
        const acc = doUnit(UNITS[nextUnit], now);
        if (VARIANT === 'fixed' && acc < 0.5) repeatPending = nextUnit;
        nextUnit++;
      }
    } else if (what === 'rekindle' && learner.dueConcepts().length) { warmup(undefined, now, 'rekindle'); learner.logSession('rekindle'); }
    // daily snapshot
    const st = store.getState();
    const seen = Object.keys(st.concepts);
    const appR = seen.map((c) => learner.recall(c));
    const trueK = seen.map((c) => (truth.get(c)?.u ? R(c, now) : 0));
    log.daily.push({
      date: now, session: what, unitsDone: nextUnit, seen: seen.length,
      due: learner.dueConcepts().length,
      appRecall: appR.length ? appR.reduce((a, b) => a + b, 0) / appR.length : null,
      trueKnow: trueK.length ? trueK.reduce((a, b) => a + b, 0) / trueK.length : null,
      neverReviewed: seen.filter((c) => !unitFirstReview.has(c) && conceptUnit.get(c)! < nextUnit - 1).length,
      misHeld: held.size,
      misApp: Object.values(st.misconceptions).filter((m) => m.status !== 'resolved').length,
    });
  }

  // end-of-run probe: a brand-new question on every concept seen
  const now = day(DAYS - 1);
  const st = store.getState();
    const probe = Object.keys(st.concepts).filter((c) => truth.has(c)).map((c) => {
    const t = truth.get(c)!;
    const pk = t.u ? R(c, now) : 0;
    return { c, unit: conceptUnit.get(c), app: learner.recall(c), level: st.concepts[c].level, trueKnow: pk, understood: t.u, reps: st.concepts[c].reps };
  });
  const levels = [0, 1, 2, 3, 4].map((l) => probe.filter((x) => x.level === l).length);
  const falseMastery = probe.filter((x) => x.app >= 0.8 && x.trueKnow < 0.5).length;
  const hiddenKnow = probe.filter((x) => x.app < 0.5 && x.trueKnow >= 0.8).length;
  const misStates = Object.entries(st.misconceptions).map(([id, m]) => ({ id, status: m.status, held: held.has(id) }));
  const bins = [0.5, 0.6, 0.7, 0.8, 0.9].map((lo) => {
    const xs = probe.filter((x) => x.app >= lo - (lo === 0.5 ? 0.5 : 0) && x.app < lo + 0.1 + (lo === 0.9 ? 0.01 : 0));
    return { bin: lo === 0.5 ? '<60%' : `${lo * 100}–${lo * 100 + 10}%`, n: xs.length, app: xs.length ? xs.reduce((a, b) => a + b.app, 0) / xs.length : null, actual: xs.length ? xs.reduce((a, b) => a + b.trueKnow, 0) / xs.length : null };
  });
  const lowAccUnits = log.units.filter((u: any) => !u.secondPass && u.acc < 0.5).length;
  const calib = st.calib;
  const firstReviewLag = [...unitFirstReview.entries()].map(([c, d]) => {
    const u = log.units.find((x: any) => x.unit === conceptUnit.get(c)); return u ? fsrs.daysBetween(u.date, d) : null;
  }).filter((x) => x !== null) as number[];
  const reviewedShare = probe.filter((x) => unitFirstReview.has(x.c)).length / probe.length;
  return {
    profile: p.name, label: p.label, variant: VARIANT,
    summary: {
      unitsDone: nextUnit, sessions: st.sessions.length, conceptsSeen: probe.length,
      dueAtEnd: learner.dueConcepts().length,
      appRecallMean: probe.reduce((a, b) => a + b.app, 0) / probe.length,
      trueKnowMean: probe.reduce((a, b) => a + b.trueKnow, 0) / probe.length,
      understoodShare: probe.filter((x) => x.understood).length / probe.length,
      levels, falseMastery, hiddenKnow,
      warmupAnswers, warmupRepeatShare: warmupRepeats / Math.max(1, warmupAnswers), answerMemShare: answerMemCorrect / Math.max(1, warmupAnswers),
      reviewedShare, medianFirstReviewLag: firstReviewLag.sort((a, b) => a - b)[Math.floor(firstReviewLag.length / 2)] ?? null,
      servedReviews, misSpotted: misStates.length, misResolved: misStates.filter((m) => m.status === 'resolved').length,
      misResolvedButHeld: misStates.filter((m) => m.status === 'resolved' && m.held).length,
      crossUnitConcepts: [...crossUnit],
      misHeldUnseen: [...held].filter((m) => !st.misconceptions[m]).length, misHeldTotal: held.size,
      lowAccUnitsAdvanced: lowAccUnits, calib, bins,
    },
    daily: log.daily, units: log.units, warmups: log.warmups,
  };
}

const results: any[] = [];
for (const p of P) {
  // average over several seeds for the summary; keep the first run's daily series
  const runs = [11, 23, 37, 41, 53, 67, 71, 89].map((s) => runProfile(p, s));
  const keys = ['unitsDone', 'sessions', 'conceptsSeen', 'dueAtEnd', 'appRecallMean', 'trueKnowMean', 'understoodShare', 'falseMastery', 'hiddenKnow', 'warmupAnswers', 'warmupRepeatShare', 'answerMemShare', 'reviewedShare', 'medianFirstReviewLag', 'servedReviews', 'misSpotted', 'misResolved', 'misResolvedButHeld', 'misHeldUnseen', 'misHeldTotal', 'lowAccUnitsAdvanced'];
  const avg: any = {};
  for (const k of keys) avg[k] = runs.reduce((a, r) => a + ((r.summary as any)[k] ?? 0), 0) / runs.length;
  avg.levels = [0, 1, 2, 3, 4].map((l) => runs.reduce((a, r) => a + r.summary.levels[l], 0) / runs.length);
  avg.bins = runs[0].summary.bins.map((_: any, i: number) => {
    const n = runs.reduce((a, r) => a + r.summary.bins[i].n, 0);
    const app = runs.reduce((a, r) => a + (r.summary.bins[i].app ?? 0) * r.summary.bins[i].n, 0) / Math.max(1, n);
    const actual = runs.reduce((a, r) => a + (r.summary.bins[i].actual ?? 0) * r.summary.bins[i].n, 0) / Math.max(1, n);
    return { bin: runs[0].summary.bins[i].bin, n: n / runs.length, app, actual };
  });
  const dailyAvg = runs[0].daily.map((d: any, i: number) => ({
    date: d.date,
    due: runs.reduce((a, r) => a + r.daily[i].due, 0) / runs.length,
    seen: runs.reduce((a, r) => a + r.daily[i].seen, 0) / runs.length,
    appRecall: runs.reduce((a, r) => a + (r.daily[i].appRecall ?? 0), 0) / runs.length,
    trueKnow: runs.reduce((a, r) => a + (r.daily[i].trueKnow ?? 0), 0) / runs.length,
    unitsDone: runs.reduce((a, r) => a + r.daily[i].unitsDone, 0) / runs.length,
    misHeld: runs.reduce((a, r) => a + r.daily[i].misHeld, 0) / runs.length,
    misApp: runs.reduce((a, r) => a + r.daily[i].misApp, 0) / runs.length,
  }));
  results.push({ profile: p.name, label: p.label, variant: VARIANT, avg, dailyAvg, example: runs[0] });
  const f = (x: number, d = 2) => x.toFixed(d);
  console.log(`\n== ${p.label} (${VARIANT}) ==`);
  console.log(`units ${f(avg.unitsDone, 1)}  sessions ${f(avg.sessions, 1)}  concepts ${f(avg.conceptsSeen, 0)}  due at end ${f(avg.dueAtEnd, 0)}`);
  console.log(`app recall ${f(avg.appRecallMean)}  true know ${f(avg.trueKnowMean)}  understood ${f(avg.understoodShare)}  false mastery ${f(avg.falseMastery, 1)}  hidden know ${f(avg.hiddenKnow, 1)}`);
  console.log(`levels 0-4 ${avg.levels.map((x: number) => f(x, 1)).join(' / ')}`);
  console.log(`warm-up answers ${f(avg.warmupAnswers, 0)}  repeat share ${f(avg.warmupRepeatShare)}  right-by-answer-memory ${f(avg.answerMemShare)}  concepts ever reviewed ${f(avg.reviewedShare)}  median first-review lag ${f(avg.medianFirstReviewLag, 1)} d`);
  console.log(`misconceptions held at end ${f(avg.misHeldTotal, 1)} (app never spotted ${f(avg.misHeldUnseen, 1)})  app spotted ${f(avg.misSpotted, 1)} resolved ${f(avg.misResolved, 1)} (resolved but still held ${f(avg.misResolvedButHeld, 1)})`);
  console.log(`units passed with <50 % right ${f(avg.lowAccUnitsAdvanced, 1)}`);
  console.log('calibration (app recall bin → actual on new question):', avg.bins.map((b: any) => `${b.bin}: n=${f(b.n, 1)} app ${f(b.app)} actual ${f(b.actual)}`).join(' | '));
}
writeFileSync(OUT, JSON.stringify(results, null, 1));
console.log('\nwritten', OUT);
