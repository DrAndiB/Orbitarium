// Run an explain-back answer through the app's real rubric and print what the app would show.
// Usage: npx tsx tools/sim/score-explain.ts <unit 0|6> <en|de> "<your explanation>"
import { UNIT0 } from '../../src/content/unit00';
import { UNIT6 } from '../../src/content/unit06';

const [unitArg, lang = 'en', ...rest] = process.argv.slice(2);
const text = rest.join(' ');
const X = unitArg === '0' ? UNIT0.explain : UNIT6.explain;
const L = (b: { en: string; de: string }) => b[lang as 'en' | 'de'].replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, '$2').replace(/\{\{([^}]+)\}\}/g, '$1');
const hits = X.ideas.filter((i) => i.en.test(text) || i.de.test(text));
const good = hits.length >= 3;
const n = X.ideas.length;
console.log(good
  ? (lang === 'de' ? `Du hast ${hits.length} von ${n} Kernideen getroffen.` : `You covered ${hits.length} of ${n} key ideas.`)
  : (lang === 'de' ? `Bisher ${hits.length} von ${n} Kernideen. Die offenen Kreise zeigen, was fehlt.` : `${hits.length} of ${n} key ideas so far. The open circles show what is missing.`));
for (const i of X.ideas) console.log(`  ${hits.includes(i) ? '●' : '○'} ${L(i.idea)}`);
console.log((lang === 'de' ? 'Musterformulierung: ' : 'Tightened version: ') + L(X.tightened));
