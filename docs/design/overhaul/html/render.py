import asyncio, sys, json
from playwright.async_api import async_playwright
BASE="/workspace/helix-nexus-automation/helix-ai-analysis/design-research/"
# jobs: (html, out, width, clip) clip = None (full page) or (top_selector, bottom_selector) or ('px', y0, y1)
async def main(jobs):
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path="/usr/bin/google-chrome",args=["--no-sandbox","--font-render-hinting=none"])
        for html,out,w,clip in jobs:
            pg=await b.new_page(viewport={"width":w,"height":900},device_scale_factor=1)
            await pg.goto("file://"+BASE+"html/"+html,wait_until="networkidle",timeout=60000)
            await pg.evaluate("document.fonts.ready")
            await pg.wait_for_timeout(1200)
            if clip is None:
                hh=await pg.evaluate("document.documentElement.scrollHeight")
                await pg.set_viewport_size({"width":w,"height":hh}); await pg.wait_for_timeout(300)
                await pg.screenshot(path=BASE+out,full_page=True)
            elif clip[0]=='px':
                await pg.screenshot(path=BASE+out,full_page=True,clip={"x":0,"y":clip[1],"width":w,"height":clip[2]-clip[1]})
            else:
                y0=await pg.evaluate(f"document.querySelector('{clip[0]}').getBoundingClientRect().top+scrollY")
                y1=await pg.evaluate(f"(e=>e.getBoundingClientRect().bottom+scrollY)(document.querySelector('{clip[1]}'))")
                await pg.screenshot(path=BASE+out,full_page=True,clip={"x":0,"y":y0,"width":w,"height":y1-y0})
            h=await pg.evaluate("document.documentElement.scrollHeight")
            print(out,"page h",h)
            await pg.close()
        await b.close()
jobs=json.loads(sys.argv[1])
asyncio.run(main(jobs))
