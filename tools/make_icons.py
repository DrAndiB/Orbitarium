"""Generate Orbitarium launcher icons and splash screens for the Android project.
Run from the project root:  python tools/make_icons.py   (needs Pillow)"""
import glob, math
from PIL import Image, ImageDraw, ImageFilter

BG = (18, 26, 51); ORBIT = (70, 86, 150); NUCLEUS = (210, 191, 166); LP = (180, 140, 255); E = (90, 169, 255); AMBER = (255, 193, 94)
RES = 'android/app/src/main/res'

def mark(size, bg=None, scale=1.0):
    S = size * 4
    im = Image.new('RGBA', (S, S), bg + (255,) if bg else (0, 0, 0, 0))
    c = S / 2
    def ellipse_pts(rx, ry, rot):
        pts = []
        for i in range(361):
            t = math.radians(i)
            x, y = rx * math.cos(t), ry * math.sin(t)
            r = math.radians(rot)
            pts.append((c + x * math.cos(r) - y * math.sin(r), c + x * math.sin(r) + y * math.cos(r)))
        return pts
    d = ImageDraw.Draw(im)
    w = max(2, int(S * 0.018))
    for rot in (-28, 32):
        d.line(ellipse_pts(S * 0.36 * scale, S * 0.135 * scale, rot), fill=ORBIT + (255,), width=w, joint='curve')
    # lone-pair lobe (soft)
    lobe = Image.new('RGBA', (S, S), (0, 0, 0, 0))
    ld = ImageDraw.Draw(lobe)
    lw, lh = S * 0.075 * scale, S * 0.12 * scale
    ly = c - S * 0.17 * scale
    ld.ellipse((c - lw, ly - lh, c + lw, ly + lh), fill=LP + (150,))
    lobe = lobe.filter(ImageFilter.GaussianBlur(S * 0.004))
    im.alpha_composite(lobe)
    d = ImageDraw.Draw(im)
    r = S * 0.095 * scale
    d.ellipse((c - r, c - r, c + r, c + r), fill=NUCLEUS + (255,))
    for (ex, ey, er, col) in ((0.30, -0.155, 0.032, E), (-0.30, 0.205, 0.032, E), (0.235, 0.27, 0.022, AMBER)):
        x, y, rr = c + S * ex * scale, c + S * ey * scale, S * er * scale
        d.ellipse((x - rr, y - rr, x + rr, y + rr), fill=col + (255,))
    for dx in (-0.022, 0.022):
        x, y, rr = c + S * dx * scale, ly - S * 0.02 * scale, S * 0.012 * scale
        d.ellipse((x - rr, y - rr, x + rr, y + rr), fill=(236, 226, 255, 255))
    return im.resize((size, size), Image.LANCZOS)

for f in glob.glob(f'{RES}/mipmap-*/ic_launcher_foreground.png'):
    n = Image.open(f).size[0]
    mark(n, None, 0.62).save(f)          # adaptive icon: keep inside the 66/108 safe zone
for f in glob.glob(f'{RES}/mipmap-*/ic_launcher.png'):
    n = Image.open(f).size[0]
    base = Image.new('RGBA', (n, n), (0, 0, 0, 0))
    sq = Image.new('RGBA', (n * 4, n * 4), (0, 0, 0, 0))
    ImageDraw.Draw(sq).rounded_rectangle((0, 0, n * 4 - 1, n * 4 - 1), radius=n * 4 * 0.22, fill=BG + (255,))
    base.alpha_composite(sq.resize((n, n), Image.LANCZOS)); base.alpha_composite(mark(n, None, 0.9)); base.save(f)
for f in glob.glob(f'{RES}/mipmap-*/ic_launcher_round.png'):
    n = Image.open(f).size[0]
    base = Image.new('RGBA', (n, n), (0, 0, 0, 0))
    ci = Image.new('RGBA', (n * 4, n * 4), (0, 0, 0, 0))
    ImageDraw.Draw(ci).ellipse((0, 0, n * 4 - 1, n * 4 - 1), fill=BG + (255,))
    base.alpha_composite(ci.resize((n, n), Image.LANCZOS)); base.alpha_composite(mark(n, None, 0.85)); base.save(f)
for f in glob.glob(f'{RES}/drawable*/splash.png'):
    w, h = Image.open(f).size
    im = Image.new('RGBA', (w, h), BG + (255,))
    m = int(min(w, h) * 0.42)
    im.alpha_composite(mark(m, None, 1.0), ((w - m) // 2, (h - m) // 2))
    im.convert('RGB').save(f)
print('icons and splash screens written')
