// German wording checker: finds the mistakes that reviewers kept reporting, so reviews can focus on chemistry and
// teaching. Reads the German side of every bilingual string in the content, the glossary and the simulation screens.
//   npx tsx tools/sim/lint-de.mts           → all findings ("error" ones make the exit code 1)
//   npx tsx tools/sim/lint-de.mts unit08    → only files whose path contains "unit08"
// A string that must keep a flagged word: add the exact phrase to ALLOW below.
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../src/', import.meta.url));
const filter = process.argv[2] ?? '';
const files = [
  ...readdirSync(root + 'content').filter((f) => f.endsWith('.ts')).map((f) => 'content/' + f),
  ...readdirSync(root + 'content/bank').filter((f) => f.endsWith('.ts')).map((f) => 'content/bank/' + f),
  ...readdirSync(root + 'sim').filter((f) => f.endsWith('.ts')).map((f) => 'sim/' + f),
  ...readdirSync(root + 'ui').filter((f) => f.endsWith('.ts')).map((f) => 'ui/' + f),
  'i18n.ts',
].filter((f) => f.includes(filter) && !/elementData|elementText/.test(f));

type Rule = { id: string; level: 'error' | 'warn'; re: RegExp; msg: string; unless?: RegExp };
const RULES: Rule[] = [
  { id: 'decimal', level: 'error', re: /(?<![\w.\/-])\d+\.\d+(?![\w.\/])/, msg: 'Dezimalpunkt in deutschem Text: Komma schreiben (1,8)', unless: /https?:|Abb\.|Kapitel|Section|\d+\.\d+\.\d+|Orbitarium \d/ },
  { id: 'thousands', level: 'error', re: /\b\d{1,3}\.\d{3}\b/, msg: 'Tausenderpunkt: bis vier Stellen ohne Trennzeichen (9921), ab fünf mit schmalem Leerzeichen (26 700)' },
  { id: 'five-digits', level: 'warn', re: /(?<![\d,.  ])\d{5,}\b/, msg: 'Ab fünf Stellen mit schmalem Leerzeichen gruppieren (26 700)', unless: /https?:/ },
  { id: 'times-ten', level: 'error', re: / [×x] 10/, msg: 'Zehnerpotenz im Deutschen mit Malpunkt: 6 · 10⁷' },
  { id: 'gegen', level: 'error', re: /\d[^.;:]{0,25}\sgegen\s+[−-]?\d/, msg: 'Vergleich von Zahlen: „gegenüber“ statt „gegen“' },
  { id: 'heisst', level: 'warn', re: /(?<!\b(im|in|der|die|den|dem|des|einer|einem|sehr|zu)\s)\bhei(ß|ss)(t|en)\s+(?!(sie|es|das|der|die|wörtlich|auf|so|auch|im|in|bei)\b)[a-zäöüß]/, msg: '„heißt/heißen“ für „bedeutet“? („X heißt Y“ als Name ist in Ordnung)', unless: /warum heißt|wie .{0,30}heißt|auf Englisch|genannt/i },
  { id: 'calque', level: 'error', re: /Riesengitter|Nettozug|Lichtpaket|genaue Farbe|Bohr-Bild|geschärfte? Fassung|fair genug|nochmal|Plusplatte|Minusplatte/, msg: 'Lehnübersetzung oder überholter App-Begriff (siehe CLAUDE.md, Deutsch)' },
  { id: 'zug', level: 'warn', re: /\bZ[üu]ge?\b/, msg: '„Zug“ für eine Anziehung: „Anziehung“, „effektive Kernladung“ oder „Bindungsdipol“' },
  { id: 'journal', level: 'error', re: /\bJournal\b/, msg: 'Im Deutschen heißt es „Lerntagebuch“' },
  { id: 'zeile', level: 'warn', re: /\bZeilen?\b/, msg: 'Im Periodensystem: „Periode“ statt „Zeile“', unless: /Zeilen? (des|der) Tabelle|Tabellenzeile|Zieh die Zeilen|Zeilen oder/ },
  { id: 'chi', level: 'warn', re: /χ/, msg: 'Im Deutschen EN/ΔEN statt χ (χ nur einmal als internationales Zeichen nennen)', unless: /international/ },
  { id: 'siedepunkt', level: 'warn', re: /Siedepunkt|Schmelzpunkt/, msg: 'Einheitlich „Siedetemperatur“/„Schmelztemperatur“' },
  { id: 'dispersion', level: 'warn', re: /\bDispersion\b(?![-\s]?(skr|Kr))/, msg: '„Dispersionskräfte“ statt bloß „Dispersion“' },
  { id: 'spenden', level: 'warn', re: /(spendet|spenden|abgeben|annehmen|nimmt .{0,15}an)\b[^.]{0,40}Wasserstoffbrücke|Wasserstoffbrücke[^.]{0,40}\b(spendet|spenden|zum Abgeben)/, msg: 'Wasserstoffbrücke: Donor/Akzeptor-Formulierung („bildet als Donor eine Wasserstoffbrücke zu …“)' },
  { id: 'wiegen', level: 'warn', re: /wieg(t|en)\b[^.]{0,30}g\/mol/, msg: '„hat eine molare Masse von … g/mol“ statt „wiegt … g/mol“' },
  { id: 'gespalten', level: 'warn', re: /Wasser\w*[^.]{0,40}gespalten/, msg: 'Autoprotolyse: Ein Molekül gibt ein Proton an ein anderes ab, es wird nicht „gespalten“' },
  { id: 'quotes', level: 'warn', re: /"[^"]{2,}"/, msg: 'Deutsche Anführungszeichen „…“' },
  { id: 'exclaim', level: 'warn', re: /![^=]|!$/, msg: 'Keine Ausrufezeichen', unless: /https?:/ },
];
const ALLOW: string[] = [
  // exact phrases that are correct although a rule matches
  'Gleichbedeutend: Siedepunkt', 'Jede Zeile ist eine Periode',
];

// The German side of b('en', 'de'), and de: '…' / de: `…` properties.
const STR = String.raw`'(?:[^'\\]|\\.)*'|\x60(?:[^\x60\\]|\\.)*\x60`;
const reB = new RegExp(String.raw`\bb\(\s*(?:${STR})\s*,\s*(${STR})`, 'g');
const reDe = new RegExp(String.raw`\bde:\s*(${STR})`, 'g');
const unq = (s: string) => s.slice(1, -1).replace(/\\'/g, "'").replace(/\{\{([^}]+)\}\}/g, '$1').replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, '$2').replace(/\[\[([^\]]+)\]\]/g, 'Fachbegriff').replace(/\$\{[^}]*\}/g, '…');

let errors = 0, warns = 0;
const byRule = new Map<string, number>();
for (const f of files) {
  const src = readFileSync(root + f, 'utf8');
  const lineOf = (i: number) => src.slice(0, i).split('\n').length;
  for (const re of [reB, reDe]) {
    re.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(src))) {
      const text = unq(m[1]);
      for (const r of RULES) {
        const hit = r.re.exec(text);
        if (!hit || (r.unless && r.unless.test(text)) || ALLOW.some((a) => text.includes(a))) continue;
        const at = Math.max(0, hit.index - 30);
        console.log(`${r.level === 'error' ? '✗' : '·'} ${f}:${lineOf(m.index)} [${r.id}] ${r.msg}\n    …${text.slice(at, hit.index + hit[0].length + 30)}…`);
        byRule.set(r.id, (byRule.get(r.id) ?? 0) + 1);
        if (r.level === 'error') errors++; else warns++;
      }
    }
  }
}
console.log(`\n${errors} errors, ${warns} warnings in ${files.length} files.` + (byRule.size ? ' ' + [...byRule].map(([k, v]) => `${k} ${v}`).join(', ') : ''));
if (errors) process.exitCode = 1;
