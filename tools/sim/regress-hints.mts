// Snapshot test for the explain-back hint matcher.
// For every unit's tightened version (must hit every idea) and every recorded learner text in
// fixtures/explain-texts.json, it computes which key ideas the matcher finds and compares with the saved snapshot.
//   npx tsx tools/sim/regress-hints.mts            → prints only what changed, plus any tightened version below 5/5
//   npx tsx tools/sim/regress-hints.mts --update   → saves the current results as the new snapshot
//   npx tsx tools/sim/regress-hints.mts 8          → also prints every line for unit 8
// Add a text to the fixture whenever a review finds a false hint, so it stays fixed.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { CONTENT_UNITS } from '../../src/content/registry';
import { UNIT0 } from '../../src/content/unit00';
import { UNIT6 } from '../../src/content/unit06';
import { ideaHints, looksLikeKeywordList } from '../../src/content/ideas';
import type { Idea } from '../../src/content/unit06';
import type { Bi } from '../../src/i18n';

const dir = fileURLToPath(new URL('./fixtures/', import.meta.url));
const SNAP = dir + 'explain-hits.json';
const args = process.argv.slice(2);
const update = args.includes('--update');
const show = new Set(args.filter((a) => /^\d+$/.test(a)).map(Number));

const units = new Map<number, { ideas: Idea[]; tightened: Bi }>();
units.set(0, UNIT0.explain);
units.set(6, UNIT6.explain);
for (const U of CONTENT_UNITS) units.set(U.n, U.explain);

const strip = (s: string) => s.replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, '$2').replace(/\[\[([^\]]+)\]\]/g, '$1').replace(/\{\{([^}]+)\}\}/g, '$1').replace(/_\{([^}]+)\}/g, '$1');
const code = (n: number, text: string) => {
  const X = units.get(n)!;
  if (looksLikeKeywordList(text)) return 'list';
  const h = ideaHints(text, X.ideas);
  return X.ideas.map((i, k) => (h.has(i.id) ? String(k + 1) : '·')).join('');
};

const now: Record<string, string> = {};
let problems = 0;
for (const [n, X] of [...units].sort((a, b) => a[0] - b[0])) {
  for (const lang of ['en', 'de'] as const) {
    const c = code(n, strip(X.tightened[lang]));
    now[`u${n} tightened ${lang}`] = c;
    if (c.includes('·') || c === 'list') { problems++; console.log(`✗ u${n} tightened ${lang}: [${c}] must state every idea`); }
  }
}
const texts: { unit: number; lang: string; source: string; text: string }[] = JSON.parse(readFileSync(dir + 'explain-texts.json', 'utf8'));
for (const t of texts) if (units.has(t.unit)) now[`u${t.unit} ${t.source} ${t.lang} | ${t.text.slice(0, 70)}`] = code(t.unit, t.text);

const before: Record<string, string> = existsSync(SNAP) ? JSON.parse(readFileSync(SNAP, 'utf8')) : {};
let changed = 0;
for (const [k, v] of Object.entries(now)) {
  const n = Number(k.slice(1, k.indexOf(' ')));
  if (before[k] !== undefined && before[k] !== v) { changed++; console.log(`~ ${k}\n    was [${before[k]}]  now [${v}]`); }
  else if (before[k] === undefined && !update) console.log(`+ ${k}  [${v}] (new)`);
  else if (show.has(n)) console.log(`  ${k}  [${v}]`);
}
if (update) { writeFileSync(SNAP, JSON.stringify(now, null, 1)); console.log(`snapshot saved: ${Object.keys(now).length} lines`); }
else console.log(`${Object.keys(now).length} texts checked, ${changed} changed since the snapshot, ${problems} tightened versions incomplete.`);
if (problems) process.exitCode = 1;
