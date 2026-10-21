"""Turn the single-file build into a page for the claude.ai artifact viewer
(the viewer supplies doctype/head/body; we provide title, meta, style, markup, script)."""
import re, sys
src = open('dist-single/index.html', encoding='utf-8').read()
styles = re.findall(r'<style[^>]*>.*?</style>', src, re.S)
scripts = re.findall(r'<script[^>]*>.*?</script>', src, re.S)
override = '<style>#app{padding-top:0}</style>'  # the viewer already pads for the status bar
out = ['<title>Orbitarium</title>', '<meta name="claude:viewport-fit-sides" content="cover">', '<meta name="theme-color" content="#121a33">']
out += styles + [override, '<div id="app" aria-live="polite"></div>']
out += [re.sub(r'<script type="module" crossorigin>', '<script type="module">', s) for s in scripts]
dest = sys.argv[1] if len(sys.argv) > 1 else 'dist-single/orbitarium.html'
open(dest, 'w', encoding='utf-8').write('\n'.join(out))
print(dest, sum(len(x) for x in out) // 1024, 'KB')
