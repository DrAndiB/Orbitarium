// Show what the revised explain-back step displays for a text and a set of ticked ideas.
// Usage: npx tsx tools/sim/hint-explain.mts <unit 0–11> <en|de> "<ticked idea numbers, e.g. 1,2,4>" "<explanation text>"
import { ideaHints, looksLikeKeywordList } from '../../src/content/ideas';
import type { Idea } from '../../src/content/unit06';
import type { Bi } from '../../src/i18n';

const [unitArg, lang = 'en', tickArg = '', ...rest] = process.argv.slice(2);
const text = rest.join(' ');
const n = Number(unitArg);
const mod = await import(`../../src/content/unit${String(n).padStart(2, "0")}.ts`);
const content = mod[`UNIT${n}`] as { explain: { ideas: Idea[]; tightened: Bi } };
const X = content.explain;
const L = (b: { en: string; de: string }) => b[lang as 'en' | 'de'].replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, '$2').replace(/\{\{([^}]+)\}\}/g, '$1');
const ticked = new Set(tickArg.split(',').map((x) => Number(x.trim()) - 1).filter((x) => x >= 0));
const salad = looksLikeKeywordList(text);
const hints = salad ? new Set<string>() : ideaHints(text, X.ideas);
if (salad) console.log(lang === 'de' ? 'Das liest sich wie eine Liste von Stichwörtern. Versuch es in ganzen Sätzen.' : 'This reads like a list of keywords. Try it in full sentences: saying how the ideas connect is what makes them stick.');
X.ideas.forEach((i, n) => {
  const t = ticked.has(n), s = hints.has(i.id);
  const hint = t && !s ? (lang === 'de' ? '  ↳ Das finde ich in deinem Text nicht. Wenn du es anders formuliert hast, lass das Häkchen stehen.' : "  ↳ I couldn't find this in your words. If you said it your own way, keep the tick.")
    : !t && s ? (lang === 'de' ? '  ↳ Dein Text sagt das vielleicht schon.' : '  ↳ Your text may already say this.') : '';
  console.log(`  ${t ? '☑' : '☐'} ${n + 1}. ${L(i.idea)}${hint ? '\n' + hint : ''}`);
});
console.log((lang === 'de' ? `Du hast ${ticked.size} von ${X.ideas.length} Kernideen abgehakt.` : `You ticked ${ticked.size} of ${X.ideas.length} key ideas.`));
console.log((lang === 'de' ? 'Musterformulierung: ' : 'Tightened version: ') + L(X.tightened));
