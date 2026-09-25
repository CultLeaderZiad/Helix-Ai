import re
def icon(n,c="",st=""): return f'<i data-lucide="{n}" class="{c}" style="{st}"></i>'
def shell(active, crumb, body, extra_head="", extra_body=""):
    nav=[("primary",[("layout-dashboard","Overview",None),("search","Search","new"),("radar","Lead Generation",None),("users","Contacts",None),("kanban-square","CRM",None),("inbox","Attention queue","3")]),
         ("Systems",[("bot","Studio",None),("plug","Integrations",None),("file-bar-chart","Reports",None)]),
         ("Account",[("credit-card","Billing",None),("life-buoy","Support",None),("settings","Settings",None)])]
    h=['<aside class="sb"><div class="ws"><span class="m"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round"><path d="M7 3c0 6 10 6 10 12s-10 3-10 6" stroke="#34E0A1"/><path d="M17 3c0 6-10 6-10 12s10 3 10 6" stroke="#fff"/></svg></span><div class="grow"><div style="font-size:13.5px;font-weight:500">Helix AI</div><div style="font-size:11.5px;color:#8a867f">Demo Dental · client</div></div>'+icon("chevrons-up-down","s14")+'</div>']
    for g,items in nav:
        if g!="primary": h.append(f'<div class="sbl">{g}</div>')
        for ic,l,b in items:
            badge='' if not b else (f'<span class="new">New</span>' if b=="new" else f'<span class="b">{b}</span>')
            h.append(f'<div class="nv {"on" if l==active else ""}">{icon(ic)}<span>{l}</span>{badge}</div>')
    h.append('<div class="grow"></div><div class="nv" style="border:1px solid var(--sb-line);background:var(--sb2)"><span style="width:26px;height:26px;border-radius:50%;background:#34E0A1;color:#04130D;display:grid;place-items:center;font-size:11px;font-weight:600">ZS</span><div><div style="font-size:13px;color:#fff">Ziad Sabry</div><div style="font-size:11px;color:#8a867f">Agency admin</div></div></div></aside>')
    top=f'<header class="top"><div class="crumb">Demo Dental <span style="color:#c9c3b7">/</span> <b>{crumb}</b></div><div class="cmdk">{icon("search","s14")}<span class="grow">Search or jump to…</span><span class="kbd">⌘K</span></div><div class="seg"><span class="on">EN</span><span>عربي</span></div><span class="ib">{icon("bell","s14")}<span style="position:absolute;top:8px;right:9px;width:6px;height:6px;border-radius:50%;background:#D97706"></span></span></header>'
    return f'''<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Helix dashboard — {crumb}</title><link rel="stylesheet" href="dash.css"><script src="https://unpkg.com/lucide@0.468.0/dist/umd/lucide.min.js"></script>{extra_head}</head><body><div class="app">{"".join(h)}<main class="main">{top}<div class="page">{body}</div></main></div>{extra_body}<script>lucide.createIcons();</script></body></html>'''

def spark(points,color="#12A579",w=104,h=36):
    mx,mn=max(points),min(points); n=len(points)
    pts=" ".join(f"{i*(w/(n-1)):.1f},{h-4-(p-mn)/(mx-mn+1e-9)*(h-8):.1f}" for i,p in enumerate(points))
    area=f"0,{h} "+pts+f" {w},{h}"
    return f'<svg width="{w}" height="{h}" viewBox="0 0 {w} {h}"><defs><linearGradient id="g{abs(hash(pts))%9999}" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="{color}" stop-opacity=".22"/><stop offset="1" stop-color="{color}" stop-opacity="0"/></linearGradient></defs><polygon points="{area}" fill="url(#g{abs(hash(pts))%9999})"/><polyline points="{pts}" fill="none" stroke="{color}" stroke-width="1.75" stroke-linejoin="round" stroke-linecap="round"/></svg>'

# ---------------- OVERVIEW ----------------
kpis=[("Conversations handled","1,284","+12.4%","message-square",[8,10,9,12,11,14,13,15,14,17,16,19]),
      ("Bookings created","96","+8","calendar-check",[3,4,4,5,6,5,7,6,8,7,9,10]),
      ("Leads found","412","+140","radar",[10,12,11,20,18,22,30,28,35,33,40,44]),
      ("Median first reply","4.2s","−0.6s","timer",[9,8,8,7,7,6,6,6,5,5,4.6,4.2])]
k=''.join(f'''<div class="card" style="padding:16px 18px"><div class="row" style="justify-content:space-between"><span style="font-size:13px;color:var(--muted)">{t}</span><span style="color:var(--subtle)">{icon(ic,"s14")}</span></div>
<div class="row" style="justify-content:space-between;align-items:flex-end;margin-top:10px"><div><div class="num" style="font-size:32px;font-weight:600;letter-spacing:-.03em">{v}</div><div class="row" style="gap:6px;margin-top:6px"><span class="chip ok">{d}</span><span style="font-size:12px;color:var(--subtle)">vs prev.</span></div></div>{spark(sp)}</div></div>''' for t,v,d,ic,sp in kpis)
import random
random.seed(4)
bars=''
for i in range(14):
    wa=random.randint(30,70); vo=random.randint(10,30); em=random.randint(4,14)
    bars+=f'<div class="col" style="flex:1;justify-content:flex-end;gap:2px;height:100%"><div style="height:{em}%;background:#D9D3C7;border-radius:3px"></div><div style="height:{vo}%;background:#7CCBB0;border-radius:3px"></div><div style="height:{wa}%;background:#0B6E4F;border-radius:3px"></div></div>'
systems=[("Booking receptionist","Live","ok","phone-call","412 calls · 30d"),("Missed-call triage","Live","ok","phone-missed","188 text-backs · 30d"),("Lead reactivation","Paused","warn","refresh-cw","Paused by you · Sep 21"),("Lead Gen worker","Online","ok","server","HTTP · Dynamic engines"),("AR collections","Not installed","","receipt","Add from Studio")]
sy=''.join(f'<div class="row" style="gap:12px;padding:12px 18px;border-bottom:1px solid var(--line)"><span style="width:32px;height:32px;border-radius:9px;display:grid;place-items:center;background:var(--surface2);border:1px solid var(--line);color:var(--muted)">{icon(ic,"s14")}</span><div class="grow"><div style="font-size:13.5px;font-weight:500">{n}</div><div style="font-size:12px;color:var(--subtle)">{m}</div></div><span class="chip {c}">{"<span class=\'dot pulse\'></span>" if c=="ok" else ""}{s}</span></div>' for n,s,c,ic,m in systems)
acts=[("message-circle","WhatsApp reply qualified as <b>booking</b>","+971 50 *** 4182 · Probable","2m","info"),
      ("calendar-check","Booking held <b>Thu 17:15</b> on Cal.com","Booking receptionist","6m","ok"),
      ("radar","Lead Gen job <b>dental clinics Dubai</b> enriched 14/20","Find leads · running","9m","ok"),
      ("alert-triangle","Fact needs review: <b>caller name</b> uncertain","Attention queue","21m","warn"),
      ("phone-missed","Missed call → WhatsApp sent in <b>4.1s</b>","Missed-call triage","34m","ok"),
      ("database","12 contacts upserted to CRM","Lead Gen export","1h","")]
ac=''.join(f'<div class="row" style="gap:12px;padding:11px 18px;{"background:linear-gradient(90deg,#F1F8F4,transparent);" if i==0 else ""}border-bottom:1px solid var(--line)"><span class="chip {c}" style="width:30px;height:30px;padding:0;justify-content:center;border-radius:9px">{icon(ic,"s14")}</span><div class="grow"><div style="font-size:13.5px">{t}</div><div style="font-size:12px;color:var(--subtle)">{s}</div></div><span class="mono" style="font-size:12px;color:var(--subtle)">{tm}</span></div>' for i,(ic,t,s,tm,c) in enumerate(acts))
jobs=[("dental clinics in Dubai","Find leads","14 / 20 enriched",70,"running"),("acme-roofing.sa + 11 URLs","Enrich websites","12 / 12 done",100,"done"),("Instagram fitness coaches Cairo","Find leads","Queued",0,"queued")]
jb=''.join(f'<div style="padding:12px 18px;border-bottom:1px solid var(--line)"><div class="row" style="justify-content:space-between"><div><div style="font-size:13.5px;font-weight:500">{q}</div><div style="font-size:12px;color:var(--subtle)">{m}</div></div><span class="chip {"info" if s=="running" else ("ok" if s=="done" else "")}">{s}</span></div><div class="row" style="gap:10px;margin-top:10px"><div class="bar grow"><i style="width:{p}%"></i></div><span class="mono" style="font-size:12px;color:var(--muted)">{st}</span></div></div>' for q,m,st,p,s in jobs)
cmdk='''<div id="cmdk" style="display:none;position:fixed;inset:0;background:rgba(20,20,20,.28);backdrop-filter:blur(2px);z-index:30;align-items:flex-start;justify-content:center;padding-top:110px">
<div style="width:640px;background:#fff;border:1px solid var(--line);border-radius:16px;box-shadow:0 30px 80px -20px rgba(0,0,0,.35);overflow:hidden">
<div class="row" style="gap:10px;padding:14px 16px;border-bottom:1px solid var(--line)">'''+icon("search","s18","color:var(--subtle)")+'''<span style="font-size:16px">lead</span><span style="width:1px;height:20px;background:var(--accent)"></span><span class="grow"></span><span class="kbd">esc</span></div>
<div style="padding:8px"><div class="label" style="padding:8px 10px">Pages</div>
<div class="row" style="gap:10px;padding:10px;border-radius:10px;background:#F1F8F4">'''+icon("radar","s14","color:var(--accent)")+'''<span><b>Lead</b> Generation</span><span class="grow"></span><span class="kbd">G L</span></div>
<div class="row" style="gap:10px;padding:10px;border-radius:10px">'''+icon("search","s14","color:var(--muted)")+'''<span>Search</span><span class="grow"></span><span class="kbd">G S</span></div>
<div class="label" style="padding:8px 10px">Actions</div>
<div class="row" style="gap:10px;padding:10px;border-radius:10px">'''+icon("plus","s14","color:var(--muted)")+'''<span>New “Find <b>lead</b>s” job</span></div>
<div class="row" style="gap:10px;padding:10px;border-radius:10px">'''+icon("globe","s14","color:var(--muted)")+'''<span>Enrich a website…</span></div>
<div class="row" style="gap:10px;padding:10px;border-radius:10px">'''+icon("download","s14","color:var(--muted)")+'''<span>Export last job (.xlsx)</span></div>
<div class="label" style="padding:8px 10px">Recent jobs</div>
<div class="row" style="gap:10px;padding:10px;border-radius:10px">'''+icon("history","s14","color:var(--muted)")+'''<span>dental clinics in Dubai</span><span class="grow"></span><span class="chip info">running</span></div></div>
<div class="row" style="gap:14px;padding:10px 16px;border-top:1px solid var(--line);font-size:12px;color:var(--subtle);background:var(--surface2)"><span><span class="kbd">↑↓</span> navigate</span><span><span class="kbd">↵</span> open</span><span class="grow"></span><span>cmdk · shadcn Command</span></div></div></div>
<script>if(location.hash==="#cmdk"){document.getElementById("cmdk").style.display="flex";document.querySelector(".toast").style.display="none"}</script>'''
body=f'''<div class="row" style="justify-content:space-between;align-items:flex-end"><div><div class="row" style="gap:10px"><h1 class="pt">Overview</h1><span class="sample">Sample data</span></div><div class="sub">3 systems live · last event 2 minutes ago</div></div><div class="row" style="gap:10px"><div class="seg"><span>7d</span><span class="on">30d</span><span>90d</span></div><span class="btn btn-out">{icon("download","s14")}Report</span><span class="btn btn-acc">{icon("plus","s14")}New job</span></div></div>
<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-top:22px">{k}</div>
<div style="display:grid;grid-template-columns:1fr 380px;gap:16px;margin-top:16px">
 <div class="card"><div class="ch"><h3>Conversations by channel</h3><span style="font-size:12px;color:var(--subtle)">last 14 days</span><span class="grow"></span><span class="row" style="gap:12px;font-size:12px;color:var(--muted)"><span class="row" style="gap:5px"><i style="width:8px;height:8px;border-radius:2px;background:#0B6E4F;display:block"></i>WhatsApp</span><span class="row" style="gap:5px"><i style="width:8px;height:8px;border-radius:2px;background:#7CCBB0;display:block"></i>Voice</span><span class="row" style="gap:5px"><i style="width:8px;height:8px;border-radius:2px;background:#D9D3C7;display:block"></i>Email</span></span></div>
  <div style="padding:18px 18px 12px;display:grid;grid-template-columns:36px 1fr;gap:8px"><div class="col mono" style="justify-content:space-between;font-size:11px;color:var(--subtle);height:220px;padding-bottom:18px"><span>120</span><span>80</span><span>40</span><span>0</span></div><div><div class="row" style="gap:10px;height:202px;align-items:stretch;border-bottom:1px solid var(--line);background:repeating-linear-gradient(to top,transparent 0 66px,#F0ECE4 66px 67px)">{bars}</div><div class="row mono" style="justify-content:space-between;font-size:11px;color:var(--subtle);margin-top:6px"><span>Sep 12</span><span>Sep 15</span><span>Sep 18</span><span>Sep 21</span><span>Sep 25</span></div></div></div></div>
 <div class="card"><div class="ch"><h3>Systems</h3><span class="grow"></span><span class="btn btn-ghost" style="height:28px;padding:0 6px">Manage {icon("arrow-right","s14")}</span></div>{sy}</div>
</div>
<div style="display:grid;grid-template-columns:1fr 440px;gap:16px;margin-top:16px">
 <div class="card"><div class="ch"><h3>Activity</h3><span class="chip ok"><span class="dot pulse"></span>Live</span><span class="grow"></span><span style="font-size:12px;color:var(--subtle)">Realtime · Supabase</span></div>{ac}</div>
 <div class="card"><div class="ch"><h3>Lead Gen jobs</h3><span class="grow"></span><span class="btn btn-ghost" style="height:28px;padding:0 6px">Open {icon("arrow-right","s14")}</span></div>{jb}<div class="row" style="gap:12px;padding:14px 18px"><span class="chip warn">{icon("alert-triangle","s12")}3 facts need review</span><span class="grow"></span><span class="btn btn-out" style="height:30px">Review</span></div></div>
</div>'''
toast=f'<div class="toast"><span style="width:28px;height:28px;border-radius:50%;background:rgba(52,224,161,.16);color:#34E0A1;display:grid;place-items:center;flex:none">{icon("check","s14")}</span><div class="grow"><div style="font-size:13.5px;font-weight:500">Enrich job finished</div><div style="font-size:12.5px;color:#A39F97;margin-top:2px">acme-roofing.sa + 11 URLs · 12 websites checked</div></div><span style="font-size:12.5px;color:#34E0A1;font-weight:500">View</span></div>'
open("dashboard_overview.html","w").write(shell("Overview","Overview",body+'<div style="height:96px"></div>',extra_body=toast+cmdk))
print("overview ok")

# ---------------- LEAD GEN ----------------
def soc(*names): return '<span class="row" style="gap:6px;color:var(--muted)">'+''.join(icon(n,"s14") for n in names)+'</span>'
rows=[("Pearl Smile Dental","pearlsmile.example","Family and cosmetic dentistry in Jumeirah; WhatsApp bookings.","info@pearlsmile…","+971 4 3•• ••••",soc("instagram","message-circle"),"Dubai",86,"Google Maps · site",True),
      ("Marina Dental Care","marinadental.example","Implants, orthodontics and emergency dental care.","—","+971 4 4•• ••••",soc("instagram","facebook"),"Dubai",78,"Google Maps",False),
      ("Al Barsha Dental Studio","barshadental.example","Clinic page lists Arabic & English speaking staff.","hello@barsha…","+971 50 •••",soc("message-circle"),"Dubai",72,"Web search · site",False),
      ("Jumeirah Family Clinic","jfc.example","Multi-specialty clinic; dental department on 2nd floor.","—","+971 4 3•• ••••",soc("linkedin"),"Dubai",61,"OSM · site",False),
      ("Deira Smile Centre","deirasmile.example","Description not found on site","—","—",'<span style="color:var(--subtle)">—</span>',"Dubai",40,"Google Maps",False)]
def score(v):
    c="ok" if v>=70 else ("warn" if v>=50 else "")
    return f'<div class="row" style="gap:8px"><div class="bar" style="width:44px"><i style="width:{v}%;{"background:#D97706" if c=="warn" else ("background:#C9C3B7" if c=="" else "")}"></i></div><span class="mono" style="font-size:12.5px">{v}</span></div>'
trs=''.join(f'''<tr class="{"sel" if sel else ""}"><td><div class="row" style="gap:10px"><span style="width:16px;height:16px;border-radius:4px;border:1.5px solid {"var(--accent)" if sel else "var(--line2)"};background:{"var(--accent)" if sel else "#fff"};display:grid;place-items:center;color:#fff">{icon("check","s12") if sel else ""}</span><div><div style="font-weight:500">{n}</div><div class="mono" style="font-size:11.5px;color:var(--subtle)">{d}</div></div></div></td>
<td style="max-width:260px;color:{"var(--subtle)" if "not found" in de else "var(--muted)"};font-size:12.5px;{"font-style:italic" if "not found" in de else ""}">{de}</td><td class="mono" style="font-size:12px;color:{"var(--subtle)" if e=="—" else "var(--ink)"}">{e}</td><td class="mono" style="font-size:12px;color:{"var(--subtle)" if p=="—" else "var(--ink)"}">{p}</td><td>{so}</td><td>{c}</td><td>{score(s)}</td><td><span class="chip" style="font-size:11px">{src}</span></td></tr>''' for n,d,de,e,p,so,c,s,src,sel in rows)
sk=''.join(f'<tr><td><div class="row" style="gap:10px"><span style="width:16px;height:16px;border-radius:4px;border:1.5px solid var(--line2)"></span><div class="col" style="gap:6px"><div class="skel" style="width:{w}px;height:10px"></div><div class="skel" style="width:90px;height:8px"></div></div></div></td><td><div class="skel" style="width:220px;height:10px"></div></td><td><div class="skel" style="width:90px;height:10px"></div></td><td><div class="skel" style="width:90px;height:10px"></div></td><td><div class="skel" style="width:40px;height:10px"></div></td><td><div class="skel" style="width:50px;height:10px"></div></td><td><span class="chip info" style="font-size:11px">{icon("loader","s12")}enriching</span></td><td></td></tr>' for w in (150,120))
lg=f'''<div class="row" style="justify-content:space-between;align-items:flex-end"><div><div class="row" style="gap:10px"><h1 class="pt">Lead Generation</h1><span class="sample">Sample data</span></div><div class="sub">Find businesses or enrich your own list. Every field shows where it came from — empty stays empty.</div></div><div class="row" style="gap:10px"><span class="btn btn-out">{icon("history","s14")}History · 12 jobs</span></div></div>
<div class="card row" style="margin-top:18px;padding:10px 16px;gap:18px;font-size:12.5px;color:var(--muted);flex-wrap:wrap"><span class="row" style="gap:6px"><span class="dot pulse"></span><b style="color:var(--ink);font-weight:500">Worker online</b></span><span style="color:var(--line2)">|</span><span class="row" style="gap:6px">Engines: <span class="dot"></span>HTTP <span class="dot"></span>Dynamic <span class="dot off"></span>Stealth</span><span style="color:var(--line2)">|</span><span>Hunter <b class="mono" style="color:var(--ink);font-weight:500">38</b> credits</span><span style="color:var(--line2)">|</span><span>Web search <b class="mono" style="color:var(--ink);font-weight:500">450</b>/h left</span><span class="grow"></span><span class="row" style="gap:6px;color:var(--subtle)">{icon("shield-check","s14")}robots.txt respected</span></div>
<div style="display:grid;grid-template-columns:1fr 420px;gap:16px;margin-top:16px">
 <div class="card" style="padding:18px">
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
   <div style="border:1px solid var(--line);border-radius:12px;padding:14px 16px;background:var(--surface2)"><div class="row" style="gap:10px"><span style="width:32px;height:32px;border-radius:9px;display:grid;place-items:center;background:#fff;border:1px solid var(--line);color:var(--muted)">{icon("globe","s14")}</span><div class="grow"><div style="font-weight:500">Enrich websites</div><div style="font-size:12.5px;color:var(--muted)">Paste up to 25 URLs you already have</div></div><span style="width:16px;height:16px;border-radius:50%;border:1.5px solid var(--line2)"></span></div></div>
   <div style="border:1.5px solid var(--accent);border-radius:12px;padding:14px 16px;background:#F3FAF6;box-shadow:0 0 0 4px rgba(18,165,121,.10)"><div class="row" style="gap:10px"><span style="width:32px;height:32px;border-radius:9px;display:grid;place-items:center;background:var(--accent);color:#fff">{icon("radar","s14")}</span><div class="grow"><div style="font-weight:500">Find leads</div><div style="font-size:12.5px;color:var(--muted)">Describe who you want — we search maps + web</div></div><span style="width:16px;height:16px;border-radius:50%;border:5px solid var(--accent)"></span></div></div>
  </div>
  <div style="margin-top:18px;font-size:13px;font-weight:500">What are you looking for?</div>
  <div class="row" style="margin-top:8px;height:48px;border:1px solid var(--ink);border-radius:12px;padding:0 14px;gap:10px;box-shadow:0 0 0 3px rgba(20,20,20,.06)">{icon("search","s18","color:var(--subtle)")}<span style="font-size:15px">dental clinics in Dubai with WhatsApp</span><span style="width:1px;height:20px;background:var(--ink)"></span><span class="grow"></span><span class="chip">{icon("map-pin","s12")}AE · auto</span></div>
  <div class="row" style="gap:8px;margin-top:10px;font-size:12.5px;color:var(--subtle)">Try: <span class="chip">roofing contractors in Jeddah</span><span class="chip">Instagram fitness coaches in Cairo</span></div>
  <div class="row" style="gap:22px;margin-top:18px;flex-wrap:wrap">
   <div><div class="label">Sources</div><div class="row" style="gap:6px;margin-top:8px"><span class="chip ok"><span class="dot"></span>Google Maps</span><span class="chip" style="color:var(--subtle)"><span class="dot off"></span>Foursquare</span><span class="chip ok"><span class="dot"></span>OpenStreetMap</span><span class="chip ok"><span class="dot"></span>Web search</span></div></div>
   <div><div class="label">How many</div><div class="seg" style="margin-top:8px"><span>10</span><span class="on">20</span><span>40</span><span>60</span></div></div>
   <div><div class="label">Emails</div><div class="row" style="gap:8px;margin-top:12px;font-size:13px"><span style="width:16px;height:16px;border-radius:4px;background:var(--accent);display:grid;place-items:center;color:#fff">{icon("check","s12")}</span>Hunter decision-makers</div></div>
  </div>
  <div class="row" style="margin-top:20px;padding-top:16px;border-top:1px solid var(--line);gap:12px"><span class="row" style="gap:6px;font-size:13px;color:var(--muted)">{icon("chevron-right","s14")}Advanced</span><span class="grow"></span><span class="mono" style="font-size:12px;color:var(--muted)">≈ 24 credits</span><span class="btn btn-acc" style="height:40px;padding:0 18px">{icon("radar","s14")}Find leads</span></div>
 </div>
 <div class="card">
  <div class="ch"><h3>Job progress</h3><span class="chip info">{icon("loader","s12")}running</span><span class="grow"></span><span class="mono" style="font-size:12px;color:var(--subtle)">#a41f</span></div>
  <div style="padding:16px 18px">
   <div class="row" style="justify-content:space-between;align-items:flex-end"><div><div class="num" style="font-size:34px;font-weight:600;letter-spacing:-.03em">70<span style="font-size:18px;color:var(--muted)">%</span></div><div style="font-size:12.5px;color:var(--muted)">14 of 20 websites enriched · ~1 min left</div></div><div class="row" style="gap:6px"><span class="btn btn-out" style="height:30px;padding:0 10px">{icon("pause","s12")}Pause</span></div></div>
   <div class="bar" style="height:8px;margin-top:12px"><i style="width:70%"></i></div>
   <div class="col" style="gap:0;margin-top:16px">
    {''.join(f'<div class="row" style="gap:10px;padding:7px 0"><span style="width:20px;height:20px;border-radius:50%;display:grid;place-items:center;{st}">{ic}</span><span class="grow" style="font-size:13px;{tc}">{t}</span><span class="mono" style="font-size:12px;color:var(--subtle)">{m}</span></div>' for t,m,st,ic,tc in [
      ("Search sources","18 found","background:var(--accent-soft);color:var(--accent)",icon("check","s12"),""),
      ("Collect websites","15 sites · 3 no site","background:var(--accent-soft);color:var(--accent)",icon("check","s12"),""),
      ("Enrich contacts","14 / 20","background:var(--info-soft);color:var(--info);box-shadow:0 0 0 3px rgba(14,116,144,.12)",icon("loader","s12"),"font-weight:500"),
      ("Score &amp; dedupe","waiting","border:1.5px solid var(--line2)","","color:var(--subtle)"),
      ("Ready to export","waiting","border:1.5px solid var(--line2)","","color:var(--subtle)")])}
   </div>
   <div class="mono" style="margin-top:12px;background:#141414;color:#C9C3B7;border-radius:10px;padding:10px 12px;font-size:11.5px;line-height:1.8">
    <div><span style="color:#6d6a64">12:04:18</span> fetch pearlsmile.example/contact · 200</div>
    <div><span style="color:#6d6a64">12:04:19</span> email found · source=site</div>
    <div><span style="color:#6d6a64">12:04:21</span> barshadental.example · JS page → dynamic</div>
    <div style="color:#34E0A1"><span style="color:#6d6a64">12:04:23</span> 14/20 enriched ▍</div>
   </div>
  </div>
 </div>
</div>
<div class="card" style="margin-top:16px;overflow:hidden">
 <div class="ch"><h3>Results</h3><span style="font-size:12.5px;color:var(--muted)">20 leads · 14 enriched · 1 selected</span><span class="grow"></span><span class="btn btn-out" style="height:32px">{icon("file-spreadsheet","s14")}Export .xlsx</span><span class="btn btn-out" style="height:32px">CSV</span><span class="btn btn-ink" style="height:32px">{icon("database","s14")}Send to CRM</span></div>
 <table class="tbl"><tr><th>Company</th><th>Description</th><th>Email</th><th>Phone</th><th>Socials</th><th>City</th><th>Score</th><th>Source</th></tr>{trs}{sk}</table>
</div>'''
open("dashboard_leadgen.html","w").write(shell("Lead Generation","Lead Generation",lg))

# ---------------- SEARCH ----------------
def res(kind,title,domain,desc,meta,sources,actions,badge="",state=""):
    kc={"Business":"ok","Web":"","Social profile":"info"}[kind]
    cb=f'<span style="width:16px;height:16px;border-radius:4px;border:1.5px solid {"var(--accent)" if state=="sel" else "var(--line2)"};background:{"var(--accent)" if state=="sel" else "#fff"};display:grid;place-items:center;color:#fff;flex:none;margin-top:3px">{icon("check","s12") if state=="sel" else ""}</span>'
    if state=="enrich":
        inner=f'<div class="col" style="gap:8px;margin-top:10px"><div class="skel" style="width:80%;height:10px"></div><div class="skel" style="width:55%;height:10px"></div></div><div class="row" style="gap:8px;margin-top:12px"><span class="chip info">{icon("loader","s12")}Enriching · checking contact page</span></div>'
    else:
        inner=f'<div style="font-size:13.5px;color:var(--muted);margin-top:6px;line-height:1.55">{desc}</div><div class="row" style="gap:14px;margin-top:10px;font-size:12.5px;color:var(--muted);flex-wrap:wrap">{meta}</div><div class="row" style="gap:8px;margin-top:12px"><span style="font-size:12px;color:var(--subtle)">Sources:</span>{"".join(f"<span class=chip style=font-size:11px>{s}</span>" for s in sources)}<span class="grow"></span>{actions}</div>'
    return f'<div style="padding:16px 18px;border-bottom:1px solid var(--line);{"background:#F3FAF6;" if state=="sel" else ""}"><div class="row" style="gap:12px;align-items:flex-start">{cb}<div class="grow"><div class="row" style="gap:10px"><span style="font-size:15px;font-weight:600;letter-spacing:-.01em">{title}</span><span class="mono" style="font-size:12px;color:var(--subtle)">{domain}</span>{badge}<span class="grow"></span><span class="chip {kc}">{kind}</span></div>{inner}</div></div></div>'
A=lambda *xs: ''.join(f'<span class="btn {"btn-out" if i else "btn-ink"}" style="height:30px;padding:0 10px;font-size:12.5px">{x}</span>' for i,x in enumerate(xs))
results=''.join([
 res("Business","Red Sea Roofing Co.","redsearoofing.example","Commercial roofing and waterproofing contractor serving Jeddah and Makkah.",f'<span class="row" style="gap:5px">{icon("map-pin","s12")}Jeddah, SA</span><span class="row mono" style="gap:5px">{icon("phone","s12")}+966 12 6•• ••••</span><span class="row mono" style="gap:5px">{icon("mail","s12")}info@redsea…</span>{soc("instagram","message-circle","linkedin")}',["Google Maps","Web search"],A(icon("scan-search","s12")+"Enrich",icon("bookmark-plus","s12")+"Save",icon("bell-plus","s12")+"Watch"),state="sel"),
 res("Business","Al Hamra Waterproofing","alhamra-wp.example","Page description: “Roof insulation, membranes and maintenance contracts.”",f'<span class="row" style="gap:5px">{icon("map-pin","s12")}Jeddah, SA</span><span class="row mono" style="gap:5px">{icon("phone","s12")}+966 55 •••</span><span style="color:var(--subtle)">no email found</span>',["Google Maps"],A("Open lead"),badge='<span class="chip ok">'+icon("check","s12")+'Already in your leads</span>'),
 res("Business","Obhur Building Services","obhur-bs.example","",'',[],"",state="enrich"),
 res("Web","Top roofing companies in Jeddah — directory","dir.example","Directory page listing 30+ roofing and insulation contractors with phone numbers.",f'<span class="row" style="gap:5px">{icon("globe","s12")}Web page · Arabic + English</span>',["Web search"],A(icon("list-plus","s12")+"Extract companies",icon("external-link","s12")+"Open")),
 res("Social profile","@jeddah.roofing.pro","instagram.com","Bio: “Roof repair & waterproofing · Jeddah · WhatsApp in bio” — URL, title and snippet only.",f'<span class="row" style="gap:5px">{icon("instagram","s12")}Instagram</span><span>bio website: jrp.example</span>',["Web search"],A(icon("scan-search","s12")+"Enrich bio website")),
])
recent=''.join(f'<div class="row" style="gap:10px;padding:9px 0;border-bottom:1px solid var(--line);font-size:13px">{icon("history","s14","color:var(--subtle)")}<span class="grow">{q}</span><span class="mono" style="font-size:11.5px;color:var(--subtle)">{n}</span></div>' for q,n in [("dental clinics Dubai","20"),("clinics Riyadh with WhatsApp","34"),("Shopify brands Kuwait","12"),("construction fit-out Doha","18")])
sp=f'''<div class="row" style="justify-content:space-between;align-items:flex-end"><div><div class="row" style="gap:10px"><h1 class="pt">Search</h1><span class="sample">Sample data</span></div><div class="sub">Search the web and maps for companies. Nothing is saved until you choose Save.</div></div></div>
<div class="row" style="gap:10px;margin-top:18px"><div class="row grow" style="height:52px;border:1px solid var(--line2);background:#fff;border-radius:14px;padding:0 16px;gap:12px;box-shadow:0 1px 2px rgba(0,0,0,.04),0 8px 24px -12px rgba(20,20,20,.12)">{icon("search","s18","color:var(--subtle)")}<span style="font-size:16px">roofing contractors in Jeddah</span><span class="grow"></span><span class="chip">{icon("map-pin","s12")}SA · ar + en</span><span class="kbd">↵</span></div><span class="btn btn-acc" style="height:52px;padding:0 22px;border-radius:14px;font-size:14.5px">Search</span></div>
<div class="row" style="gap:18px;margin-top:14px;border-bottom:1px solid var(--line)">
 {''.join(f'<span style="padding:8px 2px 11px;font-size:13.5px;{"color:var(--ink);font-weight:500;border-bottom:2px solid var(--ink);margin-bottom:-1px" if i==0 else "color:var(--muted)"}">{t} <span class="mono" style="font-size:11.5px;color:var(--subtle)">{n}</span></span>' for i,(t,n) in enumerate([("Everything","18"),("Businesses","12"),("Web","4"),("Social profiles","2"),("News","0")]))}
 <span class="grow"></span><span class="row" style="gap:12px;font-size:12px;color:var(--muted);padding-bottom:8px"><span class="row" style="gap:5px"><span class="dot"></span>Web search</span><span class="row" style="gap:5px"><span class="dot"></span>Google Maps</span><span class="row" style="gap:5px"><span class="dot off"></span>Foursquare</span><span class="row" style="gap:5px"><span class="dot"></span>OSM</span><span class="row" style="gap:5px"><span class="dot"></span>Page fetch</span><span class="row" style="gap:5px"><span class="dot"></span>Hunter 38</span><span class="row" style="gap:5px"><span class="dot off"></span>Agent</span></span>
</div>
<div style="display:grid;grid-template-columns:1fr 320px;gap:16px;margin-top:16px">
 <div class="card" style="overflow:hidden"><div class="ch" style="background:var(--surface2)"><span style="font-size:13px;color:var(--muted)"><b style="color:var(--ink)">18 results</b> · Google Maps 12 · Web 9 · OSM 2 · <span class="mono">2.4s</span></span><span class="grow"></span><span class="btn btn-out" style="height:30px">{icon("bookmark-plus","s14")}Save all as leads</span></div>{results}
  <div class="row" style="justify-content:center;padding:14px"><span class="btn btn-ghost">Load more {icon("chevron-down","s14")}</span></div></div>
 <div class="col" style="gap:16px">
  <div class="card" style="padding:14px 16px"><div class="label">Recent searches</div><div style="margin-top:6px">{recent}</div></div>
  <div class="card" style="padding:14px 16px"><div class="label">Watches</div><div style="font-size:13px;color:var(--muted);margin-top:8px;line-height:1.55">Get an alert when a saved search finds new companies.</div><span class="btn btn-out" style="margin-top:12px;height:32px">{icon("bell-plus","s14")}Create watch</span></div>
  <div class="card" style="padding:14px 16px;background:#141414;color:#fff;border-color:#141414"><div class="row" style="gap:10px"><span class="num" style="font-size:22px;font-weight:600">1</span><span style="font-size:13px;color:#A39F97">selected</span><span class="grow"></span><span class="kbd" style="background:#1F1E1B;border-color:#333;color:#A39F97">⌘S</span></div><div class="row" style="gap:8px;margin-top:12px"><span class="btn" style="background:#34E0A1;color:#04130D;height:32px">Save as leads</span><span class="btn" style="border-color:#333;color:#fff;height:32px">Enrich</span></div></div>
 </div>
</div>'''
open("dashboard_search.html","w").write(shell("Search","Search",sp))
print("all ok")
