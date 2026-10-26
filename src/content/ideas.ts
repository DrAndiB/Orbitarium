// Hint matching for explain-back key ideas. Pure functions, no DOM, so the simulation tools can use them too.
import type { Idea } from './unit06';

const NEG = /\b(not|no|never|nothing|neither|don't|doesn't|isn't|aren't|can't|cannot|won't|nicht|nichts|kein\w*|nie|weder)\b/;
const FUNCTION_WORDS = /^(the|a|an|is|are|be|of|to|in|on|at|by|it|its|they|their|that|this|which|so|and|but|as|with|for|has|have|der|die|das|den|dem|des|ein|eine|einen|einer|eines|einem|ist|sind|und|aber|sich|zu|von|mit|im|in|am|es|sie|dass|weil|wird|werden|hat|haben|beim|bei|nach|vor|wie|nur|kein|keine|nicht|also|auf|für|aus|man|wenn|dann|deshalb|je|desto|zum|zur|um|er|ihm|ihn|ihr|ihre|ihren|sein|seine|seinen|seiner|dabei|damit|daher|so|oder|or|than|als|more|mehr|because|when|if|from|into|each|jedes|jede|jeder|würde|würden|ohne|machen|macht|können|kann|sehr|durch|über|unter|zwischen|auch|noch|da|denn|would|without|make|makes|can|very|through|between|only|also|even|still|these|those|was|were|been)$/;

/** A run of terms with no sentence around them. Hints are pointless there; the learner is asked for sentences. */
export function looksLikeKeywordList(text: string): boolean {
  // One-letter fragments ("H-", "°C") are not words.
  const words = text.toLowerCase().split(/[^a-zäöüß']+/).filter((w) => w.length > 1);
  if (words.length < 6) return false;
  // Symbols that link ideas ("row = shells", "octet -> 4 pairs") count like small words.
  const links = (text.match(/=|->|→|⇒/g) ?? []).length;
  return (words.filter((w) => FUNCTION_WORDS.test(w)).length + links) / words.length < 0.12;
}

/**
 * Which key ideas a text seems to state. Used only as a hint next to the learner's own ticks, never as a grade.
 * Matching works clause by clause (so "row … shells" and "column … outer" must stay together), ignores
 * clauses that negate the idea, and treats curly and straight apostrophes alike.
 */
// One spelling for charges in both the text and the patterns: "Mg²⁺" and "Mg2+" both become "mg2+",
// "Cl⁻" and "Cl−" become "cl-". (En dashes in bond names such as "H–Cl" are left alone.)
const SUP: Record<string, string> = { '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4', '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9', '⁺': '+', '⁻': '-', '−': '-' };
const asciiCharges = (s: string) => s.replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻−]/g, (c) => SUP[c]);
const reCache = new Map<RegExp, RegExp>();
/** The same pattern with charges spelled in ASCII; a plus sign is escaped so it stays a literal. */
function asciiRe(re: RegExp): RegExp {
  let r = reCache.get(re);
  if (!r) { r = new RegExp(re.source.replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻−]/g, (c) => (c === '⁺' ? '\\+' : SUP[c])), re.flags); reCache.set(re, r); }
  return r;
}

// A comma ends a clause unless it opens or closes a subordinate clause ("ein Atom, das Elektronen abgibt, wird
// kleiner"; "je mehr …, desto …"), so the parts of one statement stay together. Cause and effect and contrast stay
// together ("…, so …", "… but …", "…, deshalb …"); a list of numbers ("2, 8, 18") is not split either.
const SOFT = /(,\s(?!(?:\d|so\b|and so|therefore|which means|der|die|das|dem|den|deren|dessen|welche\w*|weil|da|denn|wie|wieviel\w*|how|weshalb|wodurch|wobei|womit|wohingegen|wenn|dass|ob|obwohl|obgleich|auch wenn|although|even though|though|sodass|desto|umso|deshalb|daher|also|wird|werden|ist|sind|hat|haben|bleibt|bleiben|which|who|whose|where|because|since|as|hence|thus|whereby)\b)|\s(?:and|while|whereas|und|während|sondern)\s(?!\d))/;
// A clause that opens with a subordinate part keeps its main clause after the first comma: "When it boils, the
// molecules move apart"; "The stronger the attraction, the higher the boiling point"; "Wenn es siedet, trennen sich …".
// German verb-first conditions count as fronted too: "Ist ΔH negativ, gibt …", "Gießt man eine Portion ab, bleibt …".
const FRONTED = /^(when|whenever|if|because|since|as|once|although|though|while|after|before|unless|the (?:more|less|fewer|bigger|smaller|larger|higher|lower|stronger|weaker|longer|shorter|greater|heavier|lighter|closer|further|farther|faster|slower|hotter|colder|warmer|cooler|easier|harder|better|worse)|wenn|weil|da|sobald|obwohl|als|nachdem|bevor|während|falls|je|ist|sind|wird|werden|gibt|hat|haben|kann|steigt|sinkt|fällt|liegt|bleibt|nimmt|kehrt|dreht|verdoppelt|halbiert|erhöht|senkt|gießt|mischt|teilt|löst|erhitzt|kühlt|verdünnt|multipliziert|spaltet|knüpft|bildet|entsteht|läuft|laufen)\b/;
// Abbreviations keep their sentence together ("bzw.", "z. B.", "Sdp.", "e.g."); a full stop only ends a sentence when a
// space or the end follows, so "0.917" and "2.5" stay whole. A colon does not split: "Wasser: 2 Donoren, 2 Akzeptoren"
// is one statement.
// (?<!\p{L}) instead of \b: in JavaScript \b does not see a boundary before an umlaut ("ähnl.").
const ABBR = /(?<!\p{L})(bzw|z\. ?b|d\. ?h|u\. ?a|ca|max|min|sdp|sdt|smp|vgl|evtl|ggf|usw|etc|e\.g|i\.e|approx|vs|resp|bp|mp|no|bewegl|ähnl|\p{L}*lsg|temp|induz|perm|molek|elektr|pos|neg|vollst|entspr|abh|lim|theor|fl|gasf)\./gu;
/** "bewegl. ladungsträger": a short lowercase word with a full stop, followed by a lowercase word, is an abbreviation. */
const SHORT_ABBR = /(?<!\p{L})([a-zäöüß]{1,6})\.(?=\s+[a-zäöüß])/gu;
function clausesOf(norm: string): string[] {
  const out: string[] = [];
  const text = norm.replace(ABBR, (m) => m.replace(/\./g, ''));
  for (const sentence of text.split(/[;!?\n]|\.(?=\s|$)/)) {
    const parts = sentence.split(SOFT);
    let cur = parts[0];
    let joined = false;
    for (let i = 1; i < parts.length; i += 2) {
      const delim = parts[i], next = parts[i + 1] ?? '';
      // Inside a fronted subordinate part ("je mehr Elektronen und je größer …, desto …") an "and" does not split either.
      if (!joined && FRONTED.test(cur.trim()) && !delim.startsWith(',')) { cur += delim + next; continue; }
      if (!joined && delim.startsWith(',') && FRONTED.test(cur.trim())) { cur += delim + next; joined = true; continue; }
      out.push(cur); cur = next; joined = false;
    }
    out.push(cur);
  }
  return out.map((c) => c.trim()).filter(Boolean);
}

/**
 * School shorthand, spelled out once for every unit, so unit patterns only need the full words. The learner's text is
 * matched both as written and in this expanded form (a clause counts if either matches), so a pattern that does know
 * the abbreviation keeps working. Lowercase; applied after abbreviation dots are removed.
 */
const SHORTHAND: [RegExp, string][] = [
  [/\bvdw\b/g, 'van-der-waals'],
  [/\bww\b/g, 'wechselwirkung'],
  [/\bh-brücke(n?)\b/g, 'wasserstoffbrücke$1'],
  [/\bh-br\b/g, 'wasserstoffbrücke'],
  [/\bh-bonds?\b/g, 'hydrogen bond'],
  [/\beps\b/g, 'elektronenpaare'],
  [/\bep\b/g, 'elektronenpaar'],
  [/\bsd[pt]\b/g, 'siedetemperatur'],
  [/\bsm[pt]\b/g, 'schmelztemperatur'],
  [/\bimfs\b/g, 'intermolecular forces'],
  [/\bimf\b/g, 'intermolecular force'],
  [/\bbp\b/g, 'boiling point'],
  [/\bmp\b/g, 'melting point'],
  [/\bbewegl\b/g, 'beweglich'],
  [/(?<!\p{L})ähnl\b/gu, 'ähnlich'],
  [/\blsg\b/g, 'lösung'],
  [/\binduz\b/g, 'induziert'],
  [/\bmolek\b/g, 'molekül'],
  [/\blim\b/g, 'limitierend'],
  [/(?<!\p{L})fl(?!\p{L})/gu, 'flüssig'],
  [/(?<!\p{L})gasf(?!\p{L})/gu, 'gasförmig'],
  [/\btheor\b/g, 'theoretisch'],
  [/\bggü\b/g, 'gegenüber'],
  [/\bzw\b/g, 'zwischen'],
  [/\bm\.?w\.?\b/g, 'mit anderen worten'],
];
const expand = (s: string) => SHORTHAND.reduce((t, [re, w]) => t.replace(re, w), s);

export function ideaHints(text: string, ideas: Idea[]): Set<string> {
  const norm = asciiCharges(text.replace(SHORT_ABBR, '$1').toLowerCase().replace(/[’‘`´]/g, "'")).replace(/\s+/g, ' ');
  const plain = clausesOf(norm);
  const spelled = clausesOf(expand(norm.replace(ABBR, (m) => m.replace(/\./g, ''))));
  const clauses = [...plain, ...spelled.filter((c) => !plain.includes(c))];
  const hits = new Set<string>();
  for (const idea of ideas) {
    // An idea that is itself a negative statement ("solid salt does not conduct", "no free charges") keeps a clause
    // with a negation in it; for the others a negation elsewhere in the clause rules the clause out.
    const negIdea = NEG.test(idea.idea.en.toLowerCase()) || NEG.test(idea.idea.de.toLowerCase());
    // A clause that states the opposite of the idea (e.g. "the shape depends on the number of atoms") rules it out.
    if (idea.contra && clauses.some((c) => asciiRe(idea.contra!.en).test(c) || asciiRe(idea.contra!.de).test(c))) continue;
    for (const c of clauses) {
      const m = c.match(asciiRe(idea.en)) ?? c.match(asciiRe(idea.de));
      if (!m) continue;
      const rest = c.slice(0, m.index) + ' ' + c.slice((m.index ?? 0) + m[0].length);
      if (!negIdea && NEG.test(rest)) continue;
      // A negation inside the match only counts when the idea itself is phrased that way ("can't see the lone pairs").
      const inner = new RegExp(NEG.source + "\\s+[\\p{L}']+", 'u').exec(m[0]);
      if (inner && !(asciiRe(idea.en).source + asciiRe(idea.de).source).includes(inner[0])) continue;
      hits.add(idea.id);
      break;
    }
  }
  return hits;
}

