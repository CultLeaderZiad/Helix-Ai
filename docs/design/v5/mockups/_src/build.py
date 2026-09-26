"""Build self-contained mockup HTML (inline CSS, logo, icons) and render PNGs with Playwright.
Usage: python3 build.py [render]
"""
import re, sys, pathlib, asyncio
SRC = pathlib.Path(__file__).parent
OUT = SRC.parent
CSS = (SRC / "v5.css").read_text()
LOGO = ('<svg viewBox="0 0 200 210" aria-label="Helix" role="img" fill="currentColor">'
        '<path d="M52 4 L52 86 L42 94 L42 168 L4 198 L4 32 Z"/>'
        '<path d="M196 28 L196 178 L158 208 L158 92 L148 84 L148 4 Z"/>'
        '<path d="M58 98 L138 48 L138 78 L58 128 Z"/></svg>')
I = {
 "arrow":'<path d="M5 12h14M13 6l6 6-6 6"/>',
 "phone-missed":'<path d="M16 2l6 6M22 2l-6 6"/><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z"/>',
 "phone":'<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z"/>',
 "message":'<path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 8.6 8.6 0 0 1-3.8-.9L3 21l1.9-5.2A8.4 8.4 0 0 1 12 3a8.5 8.5 0 0 1 9 8.5z"/>',
 "calendar":'<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
 "calendar-check":'<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/><path d="m9 16 2 2 4-4"/>',
 "check":'<path d="M20 6 9 17l-5-5"/>',
 "user":'<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
 "users":'<circle cx="9" cy="8" r="4"/><path d="M2 21a7 7 0 0 1 14 0"/><path d="M16 3.1a4 4 0 0 1 0 7.8M22 21a7 7 0 0 0-4-6.3"/>',
 "shield":'<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>',
 "globe":'<circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
 "headset":'<path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3"/>',
 "moon":'<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z"/>',
 "key":'<circle cx="7.5" cy="15.5" r="5.5"/><path d="m21 2-9.6 9.6M15.5 7.5l3 3L22 7l-3-3"/>',
 "plus":'<path d="M12 5v14M5 12h14"/>',
 "minus":'<path d="M5 12h14"/>',
 "chart":'<path d="M3 3v18h18"/><path d="M8 17v-6M13 17V7M18 17v-4"/>',
 "refresh":'<path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/><path d="M3 21v-5h5"/>',
 "target":'<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
 "receipt":'<path d="M4 2v20l3-2 3 2 3-2 3 2 3-2 3 2V2l-3 2-3-2-3 2-3-2-3 2z"/><path d="M8 8h8M8 12h8M8 16h5"/>',
 "mic":'<path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v3"/>',
 "search":'<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
 "grid":'<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/>',
 "inbox":'<path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.5 5.1 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.5-6.9A2 2 0 0 0 16.8 4H7.2a2 2 0 0 0-1.7 1.1z"/>',
 "settings":'<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M2 12h3M19 12h3M4.9 19.1 7 17M17 7l2.1-2.1"/>',
 "plug":'<path d="M12 22v-5M9 8V2M15 8V2M18 8v5a6 6 0 0 1-12 0V8z"/>',
 "card":'<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/>',
 "help":'<circle cx="12" cy="12" r="10"/><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3M12 17h.01"/>',
 "bell":'<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.9 1.9 0 0 0 3.4 0"/>',
 "eye":'<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
 "lock":'<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
 "alert":'<circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>',
 "clock":'<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
 "chev":'<path d="m6 9 6 6 6-6"/>',
 "sliders":'<path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/>',
 "download":'<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>',
 "mail":'<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/>',
 "home":'<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
 "contacts":'<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="12" cy="10" r="3"/><path d="M7 18a5 5 0 0 1 10 0"/>',
 "menu":'<path d="M4 7h16M4 12h16M4 17h16"/>',
 "x":'<path d="M18 6 6 18M6 6l12 12"/>',
}
FONTS = ('<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>'
         '<link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Geist+Mono:wght@400;500&family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&family=Instrument+Serif:ital@0;1&display=swap" rel="stylesheet">')
def icon(m):
    name, cls = m.group(1), (m.group(2) or "").strip()
    return f'<svg class="ico {cls}" viewBox="0 0 24 24" aria-hidden="true">{I[name]}</svg>'
def build(src):
    h = src.read_text()
    h = h.replace("<!--FONTS-->", FONTS).replace("<!--CSS-->", f"<style>\n{CSS}\n</style>").replace("{{logo}}", LOGO)
    h = re.sub(r"\{\{i:([a-z\-]+)\s*([^}]*)\}\}", icon, h)
    (OUT / src.name).write_text(h)
    return OUT / src.name
JOBS = [  # (html, png, width, height, full_page)
 ("home-en.html","home-dark-1440.png",1440,900,True),
 ("home-en.html","home-mobile-390.png",390,844,True),
 ("home-ar.html","home-ar-rtl-1440.png",1440,900,True),
 ("pricing.html","pricing-1440.png",1440,900,True),
 ("login.html","login-1440.png",1440,900,False),
 ("login.html","login-390.png",390,844,True),
 ("dashboard-overview.html","dashboard-overview-1440.png",1440,1000,True),
]
async def render(only=None):
    from playwright.async_api import async_playwright
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--no-sandbox"])
        for html, png, w, hgt, full in JOBS:
            if only and not any(o in png for o in only): continue
            if not (OUT/html).exists(): continue
            pg = await b.new_page(viewport={"width": w, "height": hgt}, device_scale_factor=2 if w < 800 else 1)
            await pg.goto((OUT/html).as_uri()); await pg.wait_for_load_state("networkidle")
            await pg.evaluate("document.fonts.ready"); await pg.wait_for_timeout(600)
            await pg.screenshot(path=str(OUT/png), full_page=full)
            print("rendered", png); await pg.close()
        await b.close()
if __name__ == "__main__":
    for s in sorted(SRC.glob("*.html")): print("built", build(s).name)
    if len(sys.argv) > 1 and sys.argv[1] == "render": asyncio.run(render(sys.argv[2:] or None))
