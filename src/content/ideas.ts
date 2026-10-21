// Hint matching for explain-back key ideas. Pure functions, no DOM, so the simulation tools can use them too.
import type { Idea } from './unit06';

const NEG = /\b(not|no|never|nothing|neither|don't|doesn't|isn't|aren't|can't|cannot|won't|nicht|nichts|kein\w*|nie|weder)\b/;
const FUNCTION_WORDS = /^(the|a|an|is|are|be|of|to|in|on|at|by|it|its|they|their|that|this|which|so|and|but|as|with|for|has|have|der|die|das|den|dem|des|ein|eine|einen|einer|eines|einem|ist|sind|und|aber|sich|zu|von|mit|im|in|am|es|sie|dass|weil|wird|werden|hat|haben|beim|bei|nach|vor|wie|nur|kein|keine|nicht|also|auf|für|aus|man|wenn|dann|deshalb|je|desto)$/;

/** A run of terms with no sentence around them. Hints are pointless there; the learner is asked for sentences. */
export function looksLikeKeywordList(text: string): boolean {
  const words = text.toLowerCase().split(/[^a-zäöüß']+/).filter(Boolean);
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
export function ideaHints(text: string, ideas: Idea[]): Set<string> {
  const norm = text.toLowerCase().replace(/[’‘`´]/g, "'").replace(/\s+/g, ' ');
  // A comma ends a clause unless it opens or closes a subordinate clause ("ein Atom, das Elektronen abgibt, wird
  // kleiner"; "je mehr …, desto …"), so the parts of one statement stay together.
  const clauses = norm.split(/[.;:!?\n]|,\s(?!(?:der|die|das|dem|den|deren|dessen|welche\w*|weil|wenn|dass|ob|obwohl|sodass|desto|umso|wird|werden|ist|sind|hat|haben|bleibt|bleiben|which|who|whose|where)\b)|\s(?:and|but|while|whereas|so|und|aber|während|sondern|deshalb|also)\s/).map((c) => c.trim()).filter(Boolean);
  const hits = new Set<string>();
  for (const idea of ideas) {
    // A clause that states the opposite of the idea (e.g. "the shape depends on the number of atoms") rules it out.
    if (idea.contra && clauses.some((c) => idea.contra!.en.test(c) || idea.contra!.de.test(c))) continue;
    for (const c of clauses) {
      const m = c.match(idea.en) ?? c.match(idea.de);
      if (!m) continue;
      const rest = c.slice(0, m.index) + ' ' + c.slice((m.index ?? 0) + m[0].length);
      if (NEG.test(rest)) continue;
      // A negation inside the match only counts when the idea itself is phrased that way ("can't see the lone pairs").
      const inner = new RegExp(NEG.source + '\\s+\\S+').exec(m[0]);
      if (inner && !(idea.en.source + idea.de.source).includes(inner[0])) continue;
      hits.add(idea.id);
      break;
    }
  }
  return hits;
}

