# Walk one unit through all seven steps in a phone-sized headless Chromium, tick every explore task through the real
# engine controls, and print the task list, the stored progress and any console errors.
#   python3 tools/sim/flow.py http://localhost:5174/ en <screenshot dir> <unit> [wrong]
# Needs the dev server (npx vite --port 5174) and Playwright's Chromium. A new unit needs its explore() branch below.
# Software GL in the test browser is slow: keep heavy scenes light before leaving a step (see unit 8).
import sys, asyncio
from playwright.async_api import async_playwright
BASE = sys.argv[1]; LANG = sys.argv[2]; OUT = sys.argv[3]; UNIT = int(sys.argv[4])
WRONG = len(sys.argv) > 5 and sys.argv[5] == 'wrong'

async def shot(pg, name): await pg.screenshot(path=f"{OUT}/{LANG}-u{UNIT}-{name}.png", full_page=True, timeout=90000)

async def answer(pg, pick=1):
    q = pg.locator(".q").last
    opts = q.locator(".option:not([disabled])")
    if await opts.count():
        await opts.nth(min(pick, await opts.count() - 1)).click()
    rng = q.locator("input[type=range]")
    if await rng.count() and not await opts.count():
        await pg.evaluate("""() => { const qs=[...document.querySelectorAll('.q')]; const i=qs[qs.length-1].querySelector('input[type=range]'); if(i){ i.value = String((+i.min + +i.max)/2); i.dispatchEvent(new Event('input')); } }""")
    await pg.wait_for_timeout(100)
    chk = q.locator("button:has-text('Check'), button:has-text('Prüfen')")
    if await chk.count(): await chk.first.click(force=True)
    await pg.wait_for_timeout(250)

async def cta(pg):
    b = pg.locator(".sticky-cta:not([hidden]) button")
    await b.wait_for(state="visible", timeout=10000)
    await b.click(); await pg.wait_for_timeout(800)

async def setrange(pg, sel, v):
    await pg.evaluate(f"""() => {{ const i=document.querySelector("{sel}"); i.value='{v}'; i.dispatchEvent(new Event('input')); }}""")
    await pg.wait_for_timeout(500)

async def click(pg, sel, n=1, wait=350):
    for _ in range(n):
        await pg.locator(sel).first.click(); await pg.wait_for_timeout(wait)

async def explore(pg):
    if UNIT == 1:
        for j in ['3 → 2', '4 → 2', '2 → 1']: await click(pg, f".spectrum-panel .chip:text-is('{j}')")
        await setrange(pg, ".atom-stepper input[type=range]", 3)
        await click(pg, ".atom-buttons .btn:not(.quiet)", 7, 500)
        await click(pg, ".chip[data-view='clouds']")
        await click(pg, ".ob-row:has(.ob-label:text-is('2p'))")
        await setrange(pg, ".atom-stepper input[type=range]", 19)
        await setrange(pg, ".atom-stepper input[type=range]", 24)
    elif UNIT == 2:
        for z in [17, 3, 19, 11]: await setrange(pg, ".atom-stepper input[type=range]", z)
        await setrange(pg, ".wb-equation input[type=range]", 10)
        await setrange(pg, ".wb-equation input[type=range]", 100)
        for k in ['11+1', '17-1', '8-2', '9-1', '12+2']: await click(pg, f"[data-ion='{k}']")
    elif UNIT == 3:
        pull = ".ie-panel .atom-buttons .btn:not(.quiet)"
        await click(pg, pull, 2)
        for z, n in [(12, 3), (13, 4), (18, 1), (20, 2)]:
            await setrange(pg, ".atom-stepper input[type=range]", z); await click(pg, pull, n)
    elif UNIT == 4:
        await click(pg, "button:has-text('Make the ions'), button:has-text('Ionen bilden')", 1, 1500)
        await click(pg, "button:has-text('Show the centre ion'), button:has-text('Das mittlere Ion zeigen')")
        for s in ['MgO', 'NaCl']: await click(pg, f".chip[data-id='{s}']", 1, 600)
        await setrange(pg, ".heat input[type=range]", 900)
        await setrange(pg, ".heat input[type=range]", 25)
        for s in ['NaF', 'NaI', 'KCl', 'NaBr', 'LiF', 'CaO']: await click(pg, f".chip[data-id='{s}']", 1, 600)
    elif UNIT == 7:
        await click(pg, "button:has-text('Connect the battery'), button:has-text('Batterie anschließen')", 1, 2600)
        await click(pg, ".chip[data-id='NaCl']", 1, 2600)
        await click(pg, "button:has-text('Heat past 801'), button:has-text('Über 801')", 1, 2600)
        await click(pg, "button:has-text('Swap the poles'), button:has-text('Pole tauschen')", 1, 1500)
        await click(pg, ".chip[data-id='NaCl-aq']", 1, 2000)
        await click(pg, ".chip[data-id='sugar-aq']", 1, 2000)
    elif UNIT in (8, 9, 11):
        r1 = "[aria-label='Substance'] .chip, [aria-label='Stoff'] .chip"
        r2 = "[aria-label='Compare with'] .chip, [aria-label='Vergleichen mit'] .chip"
        async def b1(i): await pg.locator(f"[aria-label='Substance'] .chip[data-id='{i}'], [aria-label='Stoff'] .chip[data-id='{i}']").first.click(); await pg.wait_for_timeout(700)
        async def b2(i): await pg.locator(f"[aria-label='Compare with'] .chip[data-id='{i}'], [aria-label='Vergleichen mit'] .chip[data-id='{i}']").first.click(); await pg.wait_for_timeout(700)
        async def temp(v): await setrange(pg, ".pbox input[type=range]", v)
        async def view(v): await pg.locator(f".pbox .chip[data-view='{v}']").first.click(); await pg.wait_for_timeout(500)
        async def mix(m, w=1500): await pg.locator(f".pbox .chip[data-mix='{m}']").first.click(); await pg.wait_for_timeout(w)
        if UNIT == 8:
            await view('clouds')
            await b2('Xe')
            await b1('C5H12'); await b2('neoC5H12'); await temp(20)
            await temp(50)
            for x in ['F2', 'Cl2', 'Br2', 'I2']: await b1(x)
            await temp(20); await b1('C4H10'); await b1('C5H12')
            await view('plain'); await b2('')   # lighter scene before leaving: software GL in the test browser is slow
        elif UNIT == 9:
            await view('dipoles')
            await b2('C4H10'); await temp(20)
            await pg.locator(".pbox .switch").first.click(); await pg.wait_for_timeout(600)
            await b1('CO2')
            await b1('HCl'); await b2('HI')
            await b1('CH3COCH3'); await temp(55)
        else:
            await view('hbonds')
            await temp(-10); await pg.wait_for_timeout(1500); await temp(20)
            await mix('C6H14'); await mix('C2H5OH'); await mix('C4H9OH')
            await mix('NaCl', 14000)
    elif UNIT == 10:
        mol = lambda i: f"[aria-label='Molecule'] .chip[data-id='{i}'], [aria-label='Molekül'] .chip[data-id='{i}']"
        par = lambda i: f"[aria-label='Partner'] .chip[data-id='{i}']"
        await click(pg, mol('H2O'))
        await click(pg, par('H2O'))
        await click(pg, par('CH4'))
        await click(pg, par('CH3OCH3'))
        await click(pg, mol('CH3OCH3'))
        await click(pg, "button:has-text('Water with four neighbours'), button:has-text('Wasser mit vier Nachbarn')")
    elif UNIT == 5:
        for b in ['H–H', 'H–Cl', 'Na–Cl', 'C–H', 'O–H', 'N≡N', 'F–F', 'H–Cl']: await click(pg, f".chip[data-id='{b}']", 1, 700)
        await setrange(pg, ".wb-equation input[type=range]", 4.3)

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"])
        ctx = await b.new_context(viewport={"width": 412, "height": 915}, device_scale_factor=1.5)
        pg = await ctx.new_page(); pg.set_default_timeout(90000)
        logs = []
        pg.on("console", lambda m: logs.append(f"{m.type}: {m.text}") if m.type in ("error", "warning") and 'vibrate' not in m.text and 'Clock' not in m.text else None)
        pg.on("pageerror", lambda e: logs.append(f"PAGEERROR: {e}"))
        await pg.goto(BASE); await pg.wait_for_timeout(600)
        if LANG == "de": await pg.click("text=Deutsch"); await pg.wait_for_timeout(200)
        await pg.click(".ob-choice.primary"); await pg.wait_for_timeout(600)
        await pg.goto(BASE + f"#/unit/{UNIT}"); await pg.wait_for_timeout(900)
        # 1 warm-up
        for i in range(10):
            if await pg.locator(".sticky-cta:not([hidden])").count(): break
            await answer(pg)
            nxt = pg.locator("button:has-text('Next question'), button:has-text('Nächste Frage'), .stack > button:has-text('Continue'), .stack > button:has-text('Weiter')").first
            if await nxt.count(): await nxt.click(); await pg.wait_for_timeout(300)
        await shot(pg, "1-warmup"); await cta(pg)
        # 2 puzzle
        await answer(pg, 0 if WRONG else 1); await shot(pg, "2-puzzle"); await cta(pg)
        # 3 explore
        await pg.wait_for_timeout(1500)
        await explore(pg)
        await pg.wait_for_timeout(800)
        await shot(pg, "3-explore")
        done = await pg.evaluate("() => [...document.querySelectorAll('.tasks li')].map(l => (l.classList.contains('done') ? '✓ ' : '· ') + l.textContent.slice(0, 60))")
        print("tasks:", *done, sep="\n  ")
        if await pg.locator(".q").count():
            await answer(pg)
        await cta(pg)
        # 4 predict
        await pg.wait_for_timeout(1200)
        for i in range(2):
            await answer(pg, 0 if WRONG else 1); await pg.wait_for_timeout(2500)
            if i == 0: await shot(pg, "4-predict")
            await pg.locator("button:has-text('Next prediction'), button:has-text('Nächste Vorhersage'), button:has-text('Done predicting'), button:has-text('Vorhersagen abgeschlossen')").first.click()
            await pg.wait_for_timeout(300)
        await cta(pg)
        # 5 examples + flaw
        await pg.wait_for_timeout(1500)
        await pg.locator(".flaw-lines .option").nth(1).click()
        await pg.locator(".q:has(.flaw-lines) button:has-text('Check'), .q:has(.flaw-lines) button:has-text('Prüfen')").click()
        await pg.wait_for_timeout(500)
        await shot(pg, "5-examples"); await cta(pg)
        # 6 explain
        await pg.fill("textarea", "The electrons sit at fixed energies and the pattern follows from that, so the model explains the numbers we saw." if LANG == 'en' else "Die Elektronen haben feste Energien, und daraus folgt das Muster, das wir gesehen haben.")
        await pg.locator("button:has-text('Next: check it'), button:has-text('Weiter: mit den Kernideen')").click(); await pg.wait_for_timeout(300)
        cbs = pg.locator(".selfcheck input[type=checkbox]")
        for i in [0, 1]: await cbs.nth(i).check()
        await pg.locator("button:has-text('Compare with'), button:has-text('Mit einer Musterformulierung')").click(); await pg.wait_for_timeout(400)
        await shot(pg, "6-explain"); await cta(pg)
        await pg.wait_for_timeout(300)
        await shot(pg, "7-wrap"); await cta(pg)
        await pg.wait_for_timeout(1200)
        st = await pg.evaluate(f"""async () => {{ const s = await import('/src/model/store.ts'); const st = s.getState(); return {{ u: st.units[{UNIT}], levels: Object.fromEntries(Object.entries(st.concepts).filter(([k]) => k.startsWith('u{UNIT}')).map(([k, v]) => [k, v.level])), mis: Object.keys(st.misconceptions) }}; }}""")
        print(st)
        for l in logs: print(l)
        await b.close()
asyncio.run(main())
