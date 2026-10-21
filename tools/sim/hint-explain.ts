// Show what the revised explain-back step displays for a text and a set of ticked ideas.
// Usage: npx tsx tools/sim/hint-explain.ts <unit 0|6> <en|de> "<ticked idea numbers, e.g. 1,2,4>" "<explanation text>"
import { UNIT0 } from '../../src/content/unit00';
import { UNIT6 } from '../../src/content/unit06';
import { ideaHints, looksLikeKeywordList } from '../../src/content/ideas';

const [unitArg, lang = 'en', tickArg = '', ...rest] = process.argv.slice(2);
const text = rest.join(' ');
const X = unitArg === '0' ? UNIT0.explain : UNIT6.explain;
const L = (b: { en: string; de: string }) => b[lang as 'en' | 'de'].replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, '$2').replace(/\{\{([^}]+)\}\}/g, '$1');
const ticked = new Set(tickArg.split(',').map((x) => Number(x.trim()) - 1).filter((x) => x >= 0));
const salad = looksLikeKeywordList(text);
const hints = salad ? new Set<string>() : ideaHints(text, X.ideas);
if (salad) console.log(lang === 'de' ? 'Das liest sich wie eine Liste von Stichwörtern. Versuch es in ganzen Sätzen.' : 'This reads like a list of keywords. Try it in full sentences: saying how the ideas connect is what makes them stick.');
X.ideas.forEach((i, n) => {
  const t = ticked.has(n), s = hints.has(i.id);
  const hint = t && !s ? (lang === 'de' ? '  ↳ Das finde ich in deinem Text nicht. Steht es wirklich da oder nur im Kopf?' : "  ↳ I can't spot this in your words. Is it really there, or only in your head?")
    : !t && s ? (lang === 'de' ? '  ↳ Dein Text sagt das vielleicht schon.' : '  ↳ Your text may already say this.') : '';
  console.log(`  ${t ? '☑' : '☐'} ${n + 1}. ${L(i.idea)}${hint ? '\n' + hint : ''}`);
});
console.log((lang === 'de' ? `Du hast ${ticked.size} von ${X.ideas.length} Kernideen abgehakt.` : `You ticked ${ticked.size} of ${X.ideas.length} key ideas.`));
console.log((lang === 'de' ? 'Geschärfte Fassung: ' : 'Tightened version: ') + L(X.tightened));
