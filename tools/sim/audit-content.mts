// Static checks on units 1–5: concept coverage, trap tagging, glossary chips, misconception ids, readings.
import { CONTENT_UNITS } from '../../src/content/registry';
import { BANK } from '../../src/content/items';
import { MISCONCEPTIONS, unitByN } from '../../src/content/curriculum';
import { GLOSSARY } from '../../src/content/glossary';

const problems: string[] = [];
for (const U of CONTENT_UNITS) {
  const n = U.n;
  const unitItems: any[] = [U.puzzle.question, U.explore.check, ...U.predictions.map((p) => p.item), U.flaw, U.deeper];
  const bank = BANK.filter((i) => i.unit === n);
  const all = [...unitItems, ...bank];
  console.log(`\nUnit ${n}: ${bank.length} bank items, ${unitItems.length} unit items`);
  for (const c of unitByN(n).concepts) {
    const its = bank.filter((i) => i.concepts.includes(c.id));
    const ev = (i: any) => i.evidence ?? (i.format === 'why' ? 'explain?' : 'predict');
    const kinds = its.map(ev);
    const line = `  ${c.id.padEnd(22)} ${its.length} [${kinds.join(', ')}]`;
    console.log(line);
    if (its.length < 3) problems.push(`u${n}: ${c.id} has ${its.length} bank items`);
    if (!kinds.includes('explain')) problems.push(`u${n}: ${c.id} has no explain item`);
    if (!kinds.includes('transfer')) problems.push(`u${n}: ${c.id} has no transfer item`);
  }
  const misIds = new Set(MISCONCEPTIONS.map((m) => m.id));
  const count = new Map<string, number>();
  for (const it of all) {
    const ids = new Set([...(it.targets ?? []), ...((it.options ?? []).map((o: any) => o.mis).filter(Boolean)), ...(it.mis ? [it.mis] : [])]);
    for (const id of ids) { count.set(id, (count.get(id) ?? 0) + 1); if (!misIds.has(id)) problems.push(`u${n}: ${it.id} uses unknown misconception ${id}`); }
    for (const o of it.options ?? []) if (o.mis && !(it.targets ?? []).includes(o.mis)) problems.push(`u${n}: ${it.id} option mis ${o.mis} not in targets`);
    if (it.options && it.options.filter((o: any) => o.correct).length !== 1) problems.push(`u${n}: ${it.id} has ${it.options.filter((o: any) => o.correct).length} correct options`);
  }
  for (const m of U.misconceptions) if ((count.get(m.id) ?? 0) < 3) problems.push(`u${n}: misconception ${m.id} targeted by ${count.get(m.id) ?? 0} items`);
  console.log('  misconceptions:', [...count.entries()].map(([k, v]) => `${k}×${v}`).join(', '));
  // glossary chips in every string
  const strings: string[] = [];
  const walk = (x: any) => { if (typeof x === 'string') strings.push(x); else if (x && typeof x === 'object') for (const v of Object.values(x)) walk(v); };
  walk(U); walk(bank);
  for (const s of strings) for (const m of s.matchAll(/\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g)) if (!GLOSSARY[m[1]]) problems.push(`u${n}: unknown glossary chip [[${m[1]}]]`);
  for (const t of U.terms) if (!GLOSSARY[t]) problems.push(`u${n}: term pair ${t} not in glossary`);
  for (const r of U.readings) if (!/^https:\/\//.test(r.url)) problems.push(`u${n}: reading url ${r.url}`);
  if (!U.readings.some((r) => r.lang === 'de')) problems.push(`u${n}: no German reading`);
  // ids
  const ids = all.map((i) => i.id);
  for (const id of ids) if (BANK.filter((b) => b.id === id).length > 1) problems.push(`duplicate bank id ${id}`);
  for (const it of unitItems) if (!it.id.startsWith(`u${n}-`)) problems.push(`u${n}: unit item id ${it.id}`);
}
console.log('\nProblems:', problems.length ? '\n- ' + [...new Set(problems)].join('\n- ') : 'none');
