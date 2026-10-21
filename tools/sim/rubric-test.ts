// Adversarial and paraphrase tests for the explain-back rubric (the regexes in unit00/unit06).
// Each case has a human judgement of how many key ideas it really states correctly.
import { writeFileSync } from 'node:fs';
import { UNIT0 } from '../../src/content/unit00';
import { UNIT6 } from '../../src/content/unit06';

interface Case { unit: 0 | 6; kind: string; text: string; trulyCorrect: number; note: string }
const C: Case[] = [
  // ---- unit 0 ----
  { unit: 0, kind: 'keyword salad', trulyCorrect: 0, note: 'no sentence, just the words', text: 'atomic number row shell column outer similar block' },
  { unit: 0, kind: 'wrong but keyword-rich', trulyCorrect: 0, note: 'order by mass, rows and columns swapped', text: 'The table is ordered by mass. The row gives the number of outer electrons and the column gives the number of shells, protons are not important. Metals are on the left.' },
  { unit: 0, kind: 'correct, plain words', trulyCorrect: 4, note: 'layer instead of shell, outside instead of outer, act instead of behave', text: 'Going along a row you add one proton each time. Each new row means a new layer of electrons. Elements in the same column act the same way because they have the same number of electrons on the outside.' },
  { unit: 0, kind: 'correct, technical', trulyCorrect: 5, note: 'textbook phrasing', text: 'Elements are arranged by increasing Z. The period number equals the principal quantum number of the valence shell, the main-group number gives the valence electron count, so groups share their chemistry; the s, p, d and f blocks show which subshell is being filled.' },
  { unit: 0, kind: 'correct, German, plain', trulyCorrect: 4, note: 'Ebene for shell, außen as adverb', text: 'Die Elemente sind nach der Anzahl der Protonen sortiert. Jede neue Zeile ist eine neue Elektronenebene. In einer Spalte haben alle gleich viele Elektronen außen und reagieren deshalb ähnlich.' },
  { unit: 0, kind: 'correct, German, school', trulyCorrect: 4, note: 'Hauptgruppe/Valenzelektronen, Perioden = Schalen', text: 'Ordnungszahl = Protonenzahl. Periode = Anzahl der Schalen, Hauptgruppe = Anzahl Valenzelektronen. Elemente einer Hauptgruppe haben ähnliche Eigenschaften.' },
  { unit: 0, kind: 'negated', trulyCorrect: 0, note: 'denies every idea', text: 'The column does not tell you anything about outer electrons, and the row has nothing to do with shells. Elements in a family are not similar at all.' },
  // ---- unit 6 ----
  { unit: 6, kind: 'keyword salad', trulyCorrect: 0, note: 'no sentence', text: 'repel lone pair octet shape atoms squeeze' },
  { unit: 6, kind: 'wrong but keyword-rich', trulyCorrect: 1, note: 'only "bonds repel" is right; says lone pairs take no space and NH3 is flat', text: 'The bonds repel each other. Lone pairs do not take any space, so they are ignored and ammonia is flat. The octet rule does not matter for shape.' },
  { unit: 6, kind: 'correct, plain words', trulyCorrect: 3, note: 'Marie-style: get away, pairs that are not bonded, more room, pushed closer', text: 'The electrons around the middle atom all try to get away from each other. The pairs that are not bonded still take up room, even more room, so the hydrogens get pushed closer together.' },
  { unit: 6, kind: 'correct, technical', trulyCorrect: 4, note: 'VSEPR language: electron domains, nonbonding domains, angular space', text: 'VSEPR: electron domains around the central atom minimise repulsion. Nonbonding domains occupy more angular space than bonding domains, so the molecular geometry, which describes nuclear positions only, deviates from the electron-domain geometry: NH3 107°, H2O 104.5°.' },
  { unit: 6, kind: 'correct, German, school shorthand', trulyCorrect: 3, note: 'Jonas-style: EP for Elektronenpaare (EPA model)', text: 'die elektronenpaare stoßen sich ab, freie EP brauchen mehr platz deshalb kleinerer winkel' },
  { unit: 6, kind: 'correct, German, full', trulyCorrect: 5, note: 'complete answer in German', text: 'Um das Zentralatom sitzen vier Elektronenpaare (Oktett), Bindungen und freie Paare. Sie stoßen sich ab und gehen so weit wie möglich auseinander. Freie Elektronenpaare brauchen mehr Platz und stauchen die Bindungswinkel. Benannt wird die Form nur nach den Atomen.' },
  { unit: 6, kind: 'negated', trulyCorrect: 0, note: 'denies the ideas', text: 'Lone pairs do not push and do not take up a direction; the shape is not about the atoms; the angles are never squeezed.' },
];

const rows = C.map((c) => {
  const X = c.unit === 0 ? UNIT0.explain : UNIT6.explain;
  const hits = X.ideas.filter((i) => i.en.test(c.text) || i.de.test(c.text)).map((i) => i.id);
  return { ...c, rubric: hits.length, hits, verdict: hits.length >= 3 ? 'good' : 'not yet' };
});
for (const r of rows) console.log(`u${r.unit} ${r.kind.padEnd(34)} rubric ${r.rubric}/5 (${r.verdict.padEnd(7)}) truly ${r.trulyCorrect}/5  hits: ${r.hits.join(',')}`);
writeFileSync('/home/claude/sim-out/rubric-tests.json', JSON.stringify(rows, null, 1));
