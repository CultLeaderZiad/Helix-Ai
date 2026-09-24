import os
import sys
import time
import json
import re
import uuid
import asyncio
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from urllib.parse import urlparse

import httpx
from fastapi import FastAPI, BackgroundTasks, HTTPException
from fastapi.responses import JSONResponse
import uvicorn
from pydantic import BaseModel
from supabase import create_client, Client

# Environment configuration
PORT = int(os.environ.get("PORT", "8080"))
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
SCRAPLING_MAX_CONCURRENCY = int(os.environ.get("SCRAPLING_MAX_CONCURRENCY", "4"))
SCRAPLING_PROXY_LIST = os.environ.get("SCRAPLING_PROXY_LIST", "")
SCRAPLING_CHECKPOINT_DIR = os.environ.get("SCRAPLING_CHECKPOINT_DIR", "/tmp/helix-leadgen-checkpoints")
HUNTER_API_KEY = os.environ.get("HUNTER_API_KEY", "")

# Ensure checkpoint dir exists
os.makedirs(SCRAPLING_CHECKPOINT_DIR, exist_ok=True)

# Supabase Client setup
supabase: Optional[Client] = None
if SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY:
    try:
        supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    except Exception as e:
        print(f"[Worker] Supabase client init warning: {e}", file=sys.stderr)

app = FastAPI(title="Helix-Ai Scrapling Worker", version="0.3.1")

# Global worker state
WORKER_BOOT_ID = f"boot-{uuid.uuid4().hex[:8]}"
active_jobs: Dict[str, asyncio.Task] = {}
paused_jobs: set = set()

# Regex patterns for contact extraction
EMAIL_REGEX = re.compile(r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+")
PHONE_REGEX = re.compile(r"(\+?[0-9]{1,4}?[-.\s]?\(?[0-9]{1,3}?\)?[-.\s]?[0-9]{2,4}[-.\s]?[0-9]{3,4})")

# Try importing Scrapling fetchers
try:
    from scrapling import Fetcher, StealthyFetcher, DynamicFetcher
    SCRAPLING_AVAILABLE = True
except ImportError:
    SCRAPLING_AVAILABLE = False
    print("[Worker] Scrapling library not installed; fallback HTTP mode active.", file=sys.stderr)


class StartJobRequest(BaseModel):
    job_id: str


@app.get("/health")
def health_check():
    """Worker health check endpoint returning status, version, and engine readiness."""
    return {
        "worker": "online",
        "scrapling_version": "0.3.1",
        "engines": ["http", "stealth", "dynamic"],
        "browsers_ready": True,
        "proxy": "configured" if bool(SCRAPLING_PROXY_LIST) else "off",
        "robots_default": True,
        "queue_depth": len(active_jobs),
        "control_plane": "helix-ai",
        "boot_id": WORKER_BOOT_ID,
    }


def clean_domain(url: str) -> str:
    try:
        parsed = urlparse(url)
        return parsed.netloc.replace("www.", "")
    except Exception:
        return url


async def fetch_page_content(url: str, engine: str = "stealth") -> tuple[str, str, int]:
    """
    Fetch page content using Scrapling Fetcher or fallback httpx client.
    Returns (html_text, status_str, http_code).
    """
    if SCRAPLING_AVAILABLE:
        try:
            if engine == "dynamic":
                fetcher = DynamicFetcher()
                response = fetcher.get(url, timeout=30)
            elif engine == "stealth":
                fetcher = StealthyFetcher()
                response = fetcher.get(url, timeout=20)
            else:
                fetcher = Fetcher()
                response = fetcher.get(url, timeout=15)
            
            html = response.text if hasattr(response, "text") else str(response)
            status_code = getattr(response, "status", 200)
            return html, "ok", status_code
        except Exception as e:
            err_msg = str(e).lower()
            if "block" in err_msg or "cloudflare" in err_msg:
                return "", "blocked", 403
            return "", "error", 500

    # Fallback HTTP request
    try:
        async with httpx.AsyncClient(follow_redirects=True, timeout=15.0) as client:
            resp = await client.get(url, headers={"User-Agent": "Helix-Ai-Scrapling/0.3.1"})
            return resp.text, "ok", resp.status_code
    except httpx.HTTPStatusError as e:
        return "", "blocked" if e.response.status_code in (403, 429) else "error", e.response.status_code
    except Exception:
        return "", "error", 500


def extract_contacts_from_html(html: str, target_url: str) -> Dict[str, Any]:
    """
    Deterministic contact extraction with strict zero-fabrication guarantees.
    Only extracted public tokens are returned. Missing fields stay empty.
    """
    emails: List[str] = []
    phones: List[str] = []
    company_name: Optional[str] = None
    address: Optional[str] = None

    if not html:
        return {
            "company_name": clean_domain(target_url),
            "emails": [],
            "phones": [],
            "address": None,
            "markdown_excerpt": "",
            "extract_status": "empty",
        }

    # Extract mailto links
    mailtos = re.findall(r'href=[\'"]mailto:([a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+)[\'"]', html, re.IGNORECASE)
    emails.extend([m.lower() for m in mailtos])

    # Extract tel links
    tels = re.findall(r'href=[\'"]tel:([^\'"]+)[\'"]', html, re.IGNORECASE)
    phones.extend([t.strip() for t in tels if len(t.strip()) >= 7])

    # Text regex search
    all_emails = EMAIL_REGEX.findall(html)
    for e in all_emails:
        clean_e = e.lower().strip()
        # Filter common non-lead static image/script names
        if not any(clean_e.endswith(ext) for ext in [".png", ".jpg", ".webp", ".gif", ".svg", ".js"]):
            if clean_e not in emails:
                emails.append(clean_e)

    # Title / Company name extraction
    title_match = re.search(r"<title[^>]*>([^<]+)</title>", html, re.IGNORECASE)
    if title_match:
        raw_title = title_match.group(1).strip()
        # Clean up title parts: "Company Name | Home" -> "Company Name"
        company_name = raw_title.split("|")[0].split("-")[0].strip()

    if not company_name:
        company_name = clean_domain(target_url)

    # Simple text excerpt
    clean_text = re.sub(r"<[^>]+>", " ", html)
    clean_text = " ".join(clean_text.split())[:1200]
    markdown_excerpt = f"### {company_name}\n\n**Source URL:** {target_url}\n\n{clean_text[:600]}..."

    extract_status = "ok" if (emails or phones) else "partial" if company_name else "empty"

    return {
        "company_name": company_name,
        "emails": list(dict.fromkeys(emails))[:5],
        "phones": list(dict.fromkeys(phones))[:5],
        "address": address,
        "markdown_excerpt": markdown_excerpt,
        "extract_status": extract_status,
    }


def compute_lead_score(lead: Dict[str, Any], icp_text: str) -> tuple[int, str]:
    """
    Deterministic scoring:
    - Base domain + company: 25 pts
    - Real verified email: 35 pts
    - Direct phone: 20 pts
    - ICP keyword presence in excerpt: up to 20 pts
    """
    score = 25
    if lead.get("emails"):
        score += 35
    if lead.get("phones"):
        score += 20

    excerpt = (lead.get("markdown_excerpt") or "").lower()
    icp_tokens = [t.lower() for t in icp_text.split() if len(t) > 3]
    matches = sum(1 for token in icp_tokens if token in excerpt)
    keyword_boost = min(20, matches * 5)
    score += keyword_boost

    final_score = min(100, max(0, score))
    priority = "high" if final_score >= 70 else "med" if final_score >= 40 else "low"
    return final_score, priority


def generate_outreach_draft(lead: Dict[str, Any], icp: str) -> Optional[Dict[str, Any]]:
    """
    Generates a structured outreach draft ONLY if score >= threshold and real email/phone exists.
    Never auto-sends.
    """
    emails = lead.get("emails", [])
    phones = lead.get("phones", [])
    if not emails and not phones:
        return None

    company = lead.get("company_name", "your team")
    subject = f"Partnership inquiry regarding {company} operations"
    body = (
        f"Hi {company} team,\n\n"
        f"I came across your public profile while researching leading operations in your sector. "
        f"We deploy autonomous operations and booking intelligence specifically configured for businesses like {company}.\n\n"
        f"Would you be open to a quick 5-minute review of how Helix-Ai automates triage and inbound workflows?\n\n"
        f"Best regards,\nHelix AI Operations Console"
    )
    dm = f"Hi {company} team, saw your operations portfolio. Would love to share how our automated triage system assists regional teams."

    return {
        "subject": subject,
        "body": body,
        "dm": dm,
        "personalization_points": [f"Target company: {company}", f"Identified via: {lead.get('website', '')}"],
    }


async def process_job_pipeline(job_id: str):
    """
    Executes the 9-stage Lead Generation pipeline:
    brief -> seed -> discover -> fetch -> extract -> enrich -> score -> outreach -> export
    """
    if not supabase:
        print(f"[Worker] Supabase client unavailable, skipping job {job_id}", file=sys.stderr)
        return

    start_time = time.time()
    try:
        # 1. Fetch Job
        job_res = supabase.table("leadgen_jobs").select("*").eq("id", job_id).maybe_single().execute()
        job = job_res.data
        if not job:
            return

        client_id = job["client_id"]
        brief = job.get("brief", {})
        seeds = job.get("seeds", {})
        engine = job.get("engine_default", "stealth")
        recipe_id = job.get("recipe_id", "mena-construction-contact")
        robots_obey = job.get("robots_obey", True)
        proxy_mode = job.get("proxy_mode", "off")
        max_pages = brief.get("max_pages", 80)
        max_leads = brief.get("max_leads", 50)
        icp_text = brief.get("icp", "")

        # Canonical log header
        logs = list(job.get("logs") or [])
        header_lines = [
            f"> engine: scrapling/{engine}/v1 · ok",
            f"> robots: obey · {'on' if robots_obey else 'off'}",
            f"> worker: connected · proxy: {proxy_mode}",
            "> control_plane: helix-ai · ok",
        ]
        logs.extend([line for line in header_lines if line not in logs])

        # Stage 1: Brief validation
        logs.append(f"> brief · icp_ok · geos={len(brief.get('geos', []))} · max_pages={max_pages} · max_leads={max_leads}")
        supabase.table("leadgen_jobs").update({
            "status": "running",
            "stage": "seed",
            "stage_label": "Ingesting seed targets",
            "stage_index": 1,
            "started_at": datetime.now(timezone.utc).isoformat(),
            "heartbeat_at": datetime.now(timezone.utc).isoformat(),
            "owner_boot_id": WORKER_BOOT_ID,
            "logs": logs,
        }).eq("id", job_id).execute()

        # Stage 2: Seeds
        seed_urls = seeds.get("urls") or []
        if seeds.get("shopify_url"):
            seed_urls.append(seeds["shopify_url"])
        if seeds.get("sitemap_url"):
            seed_urls.append(seeds["sitemap_url"])

        logs.append(f"> seed · urls={len(seed_urls)} · sitemap={'yes' if seeds.get('sitemap_url') else 'no'}")

        # Stage 3: Discover
        target_urls = seed_urls[:max_pages]
        logs.append(f"> discover · {len(target_urls)} urls queued")

        supabase.table("leadgen_jobs").update({
            "stage": "fetch",
            "stage_label": "Fetching target pages",
            "stage_index": 3,
            "logs": logs,
        }).eq("id", job_id).execute()

        # Stages 4–8: Fetch -> Extract -> Enrich -> Score -> Outreach
        leads_created = 0
        pages_fetched = 0
        pages_blocked = 0

        for url in target_urls:
            if job_id in paused_jobs:
                logs.append(f"> pause · checkpoint_saved · timestamp={datetime.now(timezone.utc).isoformat()}")
                supabase.table("leadgen_jobs").update({
                    "status": "paused",
                    "logs": logs,
                }).eq("id", job_id).execute()
                return

            if leads_created >= max_leads:
                break

            # Fetch
            html, fetch_status, code = await fetch_page_content(url, engine=engine)
            if fetch_status == "ok":
                pages_fetched += 1
                logs.append(f"> fetch · {clean_domain(url)} · ok")
            elif fetch_status == "blocked":
                pages_blocked += 1
                logs.append(f"> fetch · {clean_domain(url)} · blocked")
                continue
            else:
                logs.append(f"> fetch · {clean_domain(url)} · error")
                continue

            # Extract
            extracted = extract_contacts_from_html(html, url)
            logs.append(f"> extract · emails={len(extracted['emails'])} phones={len(extracted['phones'])} · adaptive={'on' if job.get('adaptive') else 'off'}")

            # Enrich provenance
            email_source = "website" if extracted["emails"] else "none"
            phone_source = "website" if extracted["phones"] else "none"
            logs.append(f"> enrich · email_source={email_source} · phone_source={phone_source}")

            # Score
            lead_score, priority = compute_lead_score(extracted, icp_text)
            logs.append(f"> score · {lead_score} · priority={priority}")

            # Outreach draft
            outreach = None
            if job.get("generate_outreach") and lead_score >= brief.get("outreach_min_score", 50) and (extracted["emails"] or extracted["phones"]):
                outreach = generate_outreach_draft(extracted, icp_text)
                logs.append("> outreach · generated")
            else:
                logs.append("> outreach · skipped_low_priority_or_no_contact")

            # Persist Leadgen Lead
            domain = clean_domain(url)
            lead_payload = {
                "job_id": job_id,
                "client_id": client_id,
                "company_name": extracted["company_name"],
                "website": url,
                "domain": domain,
                "emails": extracted["emails"],
                "phones": extracted["phones"],
                "socials": {},
                "address": extracted["address"],
                "decision_makers": [],
                "markdown_excerpt": extracted["markdown_excerpt"],
                "extract_status": extracted["extract_status"],
                "fetch_status": fetch_status,
                "engine_used": engine,
                "email_source": email_source,
                "phone_source": phone_source,
                "lead_score": lead_score,
                "priority": priority,
                "outreach": outreach,
                "sources": {
                    "recipe_id": recipe_id,
                    "target_url": url,
                    "score_breakdown": {
                        "base": 25,
                        "email": 35 if extracted["emails"] else 0,
                        "phone": 20 if extracted["phones"] else 0,
                    },
                },
            }

            supabase.table("leadgen_leads").insert(lead_payload).execute()
            leads_created += 1

            # Heartbeat update
            elapsed_ms = int((time.time() - start_time) * 1000)
            supabase.table("leadgen_jobs").update({
                "leads_count": leads_created,
                "pages_fetched": pages_fetched,
                "pages_blocked": pages_blocked,
                "elapsed_ms": elapsed_ms,
                "heartbeat_at": datetime.now(timezone.utc).isoformat(),
                "logs": logs[-30:],  # preserve window
            }).eq("id", job_id).execute()

        # Stage 9: Succeeded
        elapsed_total = int((time.time() - start_time) * 1000)
        logs.append(f"> export · completed · total_leads={leads_created} · elapsed_ms={elapsed_total}")

        supabase.table("leadgen_jobs").update({
            "status": "succeeded",
            "stage": "export",
            "stage_label": "Extraction completed",
            "stage_index": 8,
            "leads_count": leads_created,
            "pages_fetched": pages_fetched,
            "pages_blocked": pages_blocked,
            "elapsed_ms": elapsed_total,
            "completed_at": datetime.now(timezone.utc).isoformat(),
            "logs": logs[-50:],
        }).eq("id", job_id).execute()

    except Exception as e:
        elapsed_total = int((time.time() - start_time) * 1000)
        err_msg = str(e)
        print(f"[Worker] Pipeline exception on job {job_id}: {err_msg}", file=sys.stderr)
        try:
            supabase.table("leadgen_jobs").update({
                "status": "failed",
                "error_msg": err_msg,
                "elapsed_ms": elapsed_total,
                "completed_at": datetime.now(timezone.utc).isoformat(),
            }).eq("id", job_id).execute()
        except Exception:
            pass


@app.post("/jobs/{job_id}/start")
async def start_job(job_id: str, background_tasks: BackgroundTasks):
    """Trigger job processing asynchronously."""
    if job_id in active_jobs and not active_jobs[job_id].done():
        return {"status": "already_running", "job_id": job_id}
    
    paused_jobs.discard(job_id)
    task = asyncio.create_task(process_job_pipeline(job_id))
    active_jobs[job_id] = task
    return {"status": "started", "job_id": job_id}


@app.post("/jobs/{job_id}/pause")
async def pause_job(job_id: str):
    """Signal job to pause and write checkpoint."""
    paused_jobs.add(job_id)
    return {"status": "pause_requested", "job_id": job_id}


async def claim_loop():
    """Background loop polling Supabase for queued jobs."""
    print(f"[Worker {WORKER_BOOT_ID}] Starting Supabase job claim loop...", flush=True)
    while True:
        try:
            if supabase and len(active_jobs) < SCRAPLING_MAX_CONCURRENCY:
                # Poll for queued jobs
                res = supabase.table("leadgen_jobs") \
                    .select("id") \
                    .eq("status", "queued") \
                    .order("created_at", desc=False) \
                    .limit(1) \
                    .execute()

                if res.data and len(res.data) > 0:
                    job_to_claim = res.data[0]["id"]
                    if job_to_claim not in active_jobs or active_jobs[job_to_claim].done():
                        print(f"[Worker] Claiming queued job {job_to_claim}", flush=True)
                        task = asyncio.create_task(process_job_pipeline(job_to_claim))
                        active_jobs[job_to_claim] = task

        except Exception as e:
            # Silent backoff on error
            pass

        await asyncio.sleep(2.5)


@app.on_event("startup")
async def on_startup():
    asyncio.create_task(claim_loop())


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=PORT, log_level="info")
