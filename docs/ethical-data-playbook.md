# LocalLink Ethical Data Growth Playbook

How we grow a national, niche, **local** scholarship database while staying legal and aligned with the product promise (real contacts, obtainable awards). Legal counsel has approved careful collection of public primary-source listing data; we still avoid commercial aggregators and bulk proprietary dumps.

**Current geographic focus:** thorough **Pennsylvania** coverage first (Pittsburgh + Philadelphia niche depth), then expand state by state.

---

## Principles

1. **No scraping of commercial aggregators** (Fastweb, Scholarships.com, Cappex, etc.) or bulk proprietary database dumps.
2. **Allowlisted public primary sources only** for automated collection (community foundations, public agencies, official org pages) via `npm run scrape:pa`.
3. **Every live row has provenance** (`source_url`, `source_method`, last verified date).
4. **Prefer primary sources**: the awarding organization, their official PDF/form, or a direct confirmation email.
5. **Students win through relationships** — we store contact people, not just “apply here” links.
6. **When unsure, leave it out** or mark as a research lead — never invent awards.
7. **LocalLink is not affiliated** with any listed sponsor; listings are informational only.

---

## What we collect (minimum viable row)

| Field | Why it matters |
|--------|----------------|
| Scholarship name | Identity |
| Provider / org | Trust + matching |
| City + state | Local matching |
| Eligibility tags | Matcher accuracy |
| Amount (if public) | Student planning |
| Deadline (if public) | Urgency |
| Contact person + email/URL | Outreach / relationship |
| Application link | Official source |
| Why obtainable | Product differentiator |
| Source + last verified date | Ethics / freshness |

Do **not** store personal student data from applications. Do not republish copyrighted essay prompts in full if the org forbids it — a short fair-use eligibility summary is enough.

---

## Legal growth channels (allowed)

### 1. Organization self-submission (best)
- Orgs use `/submit` → `scholarship_submissions` → admin review → publish to `scholarships`.
- Pitch: free distribution to motivated local students; you control the listing.

### 2. Direct outreach (highest quality for VFW / Rotary / law firms)
- Use **research leads** (`scholarship_leads`) as a to-do list, not as awards.
- Email or call the org: “Do you offer a local scholarship? May we list it with your contact?”
- Only enter data they confirm or that appears on **their** public materials after a human reads it.

### 3. Manual human curation from primary sources
- A person opens the org’s own site / PDF and types facts into the CSV template.
- That is **research**, not scraping: no bots, no bulk extraction, rate-limited human review.
- Record `source_url` and `last_verified_date`.

### 4. Community foundations & school counselors
- Partner with community foundations (they often administer dozens of local funds).
- Counselors submit awards they already promote legally in schools.
- Offer co-branded “region packs” (e.g. “Central Texas Local Awards”).

### 5. Public government / education lists (when terms allow)
- Some state DOE / GEAR UP / higher-ed agencies publish scholarship lists for reuse.
- **Read terms of use first.** Prefer linking + summarizing over full republication.
- Attribute the agency as source.

### 6. Crowdsourced student tips → verification
- Students can suggest “my town’s Elks lodge has one.”
- Never auto-publish. Staff verifies with the org before it goes live.

---

## Automated PA collection (approved pattern)

```bash
# Seed + allowlisted live fetches → Supabase scholarships (same columns as CSV import)
npm run scrape:pa

# Preview without writing
npm run scrape:pa -- --dry-run

# JSON seed only (no HTTP)
npm run scrape:pa -- --seed-only
```

- Seed file: `data/imports/pa-pittsburgh-philadelphia-niche.json`
- Script: `scripts/scrape-pa-niche.js`
- `source_method`: `public_web_scrape` | `public_agency` | `human_primary_source` | …

## Channels we avoid

| Avoid | Why |
|--------|-----|
| Scraping Fastweb / Scholarships.com / Cappex etc. | ToS + copyright risk |
| Buying scraped datasets | Same risk, often stale |
| Copying from closed Facebook groups without permission | Privacy / terms |
| Inventing contact emails | Harms trust + legality |
| Mass emailing scraped personal addresses | CAN-SPAM / reputation |
| High-rate bots without delays | Server abuse / blocks |

---

## Niche org types that fit LocalLink (national playbook)

These networks exist in almost every metro; awards are local and under-applied:

| Category | Examples | Typical student angle |
|----------|----------|------------------------|
| Veterans / military family | VFW posts & auxiliaries, American Legion, AMVETS | Military connection, community service |
| Service clubs | Rotary, Lions, Kiwanis, Optimist, Elks, Moose | Local resident + leadership/service |
| Women’s / equity orgs | AAUW branches, Zonta, business & professional women | Gender, field of study, county |
| Community foundations | County / city foundations, “funds under management” | Residency, high school, need |
| Trades & employers | Credit unions, hospitals, utilities, unions | Career path, employee family |
| Civic / public safety | Fire department auxiliaries, police associations | Residency, public service |
| Legal community | County bar associations, law firm foundations | Interest in justice / local HS |
| Cultural / faith (careful) | Ethnic associations, house of worship funds | Membership / heritage rules |
| Chambers of commerce | Local chambers, young professionals | Business interest, residency |

**Rule:** research the **local chapter**, not only the national brand. National brands often fund local posts that run separate awards.

---

## Operating cadence (how to grow every week)

### Monday — Lead generation (30–45 min)
- Seed or pull 20 open research leads for a target metro (see scripts).
- Assign owner + due date.

### Tue–Thu — Outreach & curation (2–4 hrs)
- Send 10 polite outreach emails (template below).
- Manually curate 5–10 awards from primary sources into CSV.
- Import with `npm run import:scholarships`.

### Friday — Verify & publish
- Re-check 10 oldest rows (`Last Verified Date`).
- Admin: approve pending submissions → publish.
- Spot-check matcher for the metro you worked on.

**Target velocity (realistic):** 25–50 *verified* awards / week with one part-time curator. Quality > volume.

---

## Outreach email template (to orgs)

```
Subject: Listing your local scholarship for students in [City]

Hello [Name / Scholarship Chair],

I'm with LocalLink, a free tool that helps students find obtainable local scholarships
and reach out personally to organizers (not just national lists).

We noticed many students miss awards from organizations like yours. If you offer a
scholarship for students in [City / County], we'd love to list it with:
• award name & rough amount
• eligibility (residency, school level, etc.)
• deadline
• a contact person for questions
• link to your official application

There is no fee. You control the listing and can update or remove it anytime.
Would you be open to a short reply with those details, or a link to your page?

Thank you for investing in local students,
[Your name]
LocalLink
```

---

## Verification checklist (before publish)

- [ ] Org name matches official site or letterhead  
- [ ] Application link is on the **org’s domain** (or trusted foundation portal)  
- [ ] Contact is a role inbox or named public contact — not a private personal address taken from a scrape  
- [ ] Geography is explicit (city / county / state)  
- [ ] Deadline year is current or clearly “rolling / check site”  
- [ ] Eligibility tags are neutral and accurate (no invented requirements)  
- [ ] `Last Verified Date` set to today  

---

## Technical workflows in this repo

| Workflow | Command / path |
|----------|----------------|
| Human-curated bulk import | `npm run import:scholarships -- data/imports/my-batch.csv` |
| CSV template | `data/templates/scholarships-import.csv` |
| Seed research leads (outreach queue) | `npm run seed:leads` |
| Enrich city/state from existing text | `npm run enrich:geo` |
| Org self-serve | `/submit` |
| Moderation | `/admin` (approve publishes to `scholarships`) |

SQL for the leads table: `sql/001_scholarship_growth.sql`.

---

## National expansion order (suggested)

1. **Deepen PA** (you already have strength) — fill city/state, VFW/Rotary gaps by county  
2. **Adjacent metros** with similar density: NJ suburbs, DE, MD, Upstate NY  
3. **Hub metros** with strong civic networks: Chicago, Dallas–Fort Worth, Atlanta, Phoenix, Minneapolis  
4. **Rural county packs** via community foundations (high need, low competition)

For each metro, run the same niche checklist: VFW → Legion → Rotary → Lions → community foundation → bar association → hospital foundation → chamber.

---

## Success metrics

- % of rows with `city` + `state` filled  
- % with real contact (email or named person)  
- % verified in last 12 months  
- Submissions from orgs vs staff-curated  
- Matcher sessions that return ≥3 local hits for a city  

---

## Summary

Grow LocalLink like a **newsroom + partnerships desk**, not a scraper:

> Research leads → ask or read primary sources → human enter → verify → publish.

That stays ethical, legal, and produces the niche local awards (VFW posts, service clubs, nonprofits, law firms, foundations) that national databases bury.
