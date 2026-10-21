"""Regenerate src/content/elementData.ts from Periodic-Table-JSON (numbers compiled from Wikipedia).
Run from the project root:  python tools/make_elements.py"""
import json, urllib.request
URL = 'https://raw.githubusercontent.com/Bowserinator/Periodic-Table-JSON/master/PeriodicTableJSON.json'
d = json.load(urllib.request.urlopen(URL))['elements'][:118]

def cat(c):
    c = c.lower()
    for key, val in (('noble gas', 'noble'), ('alkaline earth', 'alkaline'), ('alkali', 'alkali'), ('lanthanide', 'lanthanide'),
                     ('actinide', 'actinide'), ('post-transition', 'post'), ('transition metal', 'transition'), ('metalloid', 'metalloid'), ('nonmetal', 'nonmetal')):
        if key in c: return val
    return 'unknown'
PREDICTED = {109: 'transition', 110: 'transition', 111: 'transition', 113: 'post', 114: 'post', 115: 'post', 116: 'post', 117: 'nonmetal', 118: 'noble'}
k2c = lambda k: None if k is None else round(k - 273.15, 1)
rows = []
for e in d:
    z = e['number']; c = cat(e['category'])
    if c == 'unknown': c = PREDICTED.get(z, 'unknown')
    r = e['atomic_radii'] or {}
    rows.append([z, e['symbol'], e['name'], round(e['atomic_mass'], 3) if z < 95 else round(e['atomic_mass']),
                 None if e['symbol'] in ('He', 'Ne', 'Ar') else e.get('electronegativity_pauling'),
                 (r.get('empirical') or r.get('calculated') or [None])[0], (e.get('ionization_energies') or [None])[0],
                 e['xpos'], e['ypos'], e['group'], e['period'], e['block'], c, e['shells'],
                 e['electron_configuration_semantic'].replace('*', ''), (e['phase'] or '')[:1].lower(), k2c(e.get('melt')), k2c(e.get('boil'))])
head = open('src/content/elementData.ts', encoding='utf-8').read().split('const RAW: unknown[][] = [')[0]
body = '\n'.join('  [' + ','.join('null' if v is None else json.dumps(v, ensure_ascii=False) for v in row) + '],' for row in rows)
tail = "\n];\nexport const ELEMENT_DATA: ElementData[] = RAW.map((row) => Object.fromEntries(K.map((k, i) => [k, row[i]])) as unknown as ElementData);\n"
open('src/content/elementData.ts', 'w', encoding='utf-8').write(head + 'const RAW: unknown[][] = [\n' + body + tail)
print(len(rows), 'elements written')
