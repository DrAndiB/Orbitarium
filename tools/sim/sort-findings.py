# Sort the findings of persona walkthroughs and re-checks into one Markdown list per unit, for the fix helpers.
#   python3 tools/sim/sort-findings.py <out dir> <first unit> <last unit> persona-marie.json persona-jonas.json …
# Reads top_issues + accuracy (walkthrough files) and earlier (status != fixed) + new_findings (re-check files).
# Writes <out dir>/issues-u<N>.md for each unit and issues-general.md for findings that name no unit.
import json, re, sys, collections, os

out, lo, hi, files = sys.argv[1], int(sys.argv[2]), int(sys.argv[3]), sys.argv[4:]
per, general = collections.defaultdict(list), []

def add(where, line):
    units = {int(x) for x in re.findall(r'(?:unit|u|Einheit)\s*-?0?(\d+)', where or '', re.I) if lo <= int(x) <= hi}
    for u in units: per[u].append(line)
    if not units: general.append(line)

for f in files:
    d = json.load(open(f)); who = d.get('persona', os.path.basename(f))
    for t in d.get('top_issues', []):
        add(t.get('where', ''), f"- [{who}, {t.get('severity')}] {t.get('issue')} | where: {t.get('where')} | suggestion: {t.get('suggestion')}")
    for a in d.get('accuracy', []):
        add(a.get('where', ''), f"- [{who}, accuracy] {a.get('problem')} | where: {a.get('where')} | text: {a.get('exact_text')} | correction: {a.get('correction')}")
    for e in d.get('earlier', []):
        if e.get('status') != 'fixed':
            add(f"{e.get('issue', '')} {e.get('note', '')}", f"- [{who}, earlier, {e.get('status')}] {e.get('issue')} | note: {e.get('note')}")
    for n in d.get('new_findings', []):
        add(n.get('where', ''), f"- [{who}, new, {n.get('severity')}] {n.get('problem')} | where: {n.get('where')} | text: {n.get('exact_text')} | fix: {n.get('correction') or n.get('better')}")

os.makedirs(out, exist_ok=True)
for u in range(lo, hi + 1):
    open(f'{out}/issues-u{u}.md', 'w').write(f'# Unit {u}: findings\n\n' + '\n'.join(per[u]) + '\n')
    print(f'unit {u}: {len(per[u])}')
open(f'{out}/issues-general.md', 'w').write('# Findings that name no unit\n\n' + '\n'.join(general) + '\n')
print(f'general: {len(general)}')
