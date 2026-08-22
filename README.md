# countdown.shiben.dev — release-signal monitor

A countdown page that keeps itself current. Storefront listings and first-party
channels are polled every 15 minutes; anything that moves is hashed, diffed and
parked in a review queue. Nothing reaches the public timeline without a human
approving it.

```
GitHub Actions (*/15)
  → poll sources
  → hash, diff against the last snapshot
  → queue candidates in data/pending.json
  → human approves  →  data/events.json
  → Vercel redeploys the static site
```

The site itself stays static: every route is prerendered, the data files are
bundled at build, and git history is the audit log — what was observed, when,
and what a human did about it.

## Layout

| Path | What it is |
|---|---|
| `sources/` | One file per source. Each exports `{ id, poll(), parse(raw) }`. |
| `scripts/poll.ts` | The monitor loop: poll, diff, queue, notify. |
| `scripts/approve.ts` | The manual gate. The only path to publication. |
| `scripts/ledger.ts` | Credibility ledger — per-source accuracy over time. |
| `scripts/notify.ts` | Discord / Telegram webhooks. |
| `data/events.json` | The published timeline. |
| `data/pending.json` | Awaiting review, plus a rejection list that suppresses re-queues. |
| `data/snapshots.json` | Change-detection state. **Hashes only, never payloads.** |
| `data/ledger.json` | Computed source scores. |
| `data/target.json` | What is being counted down to. Drives the countdown. |

## Day-to-day

```bash
npm run poll                # poll everything, queue what moved
npm run poll -- --dry-run   # poll and report, write nothing
npm run poll -- xbox-store  # poll one source
npm run queue               # list what is awaiting review
npm run queue -- show <id>  # full detail on one candidate
npm run approve -- <id>     # publish it
npm run queue -- reject <id> "why"
npm run ledger -- --print   # source scorecard
```

Approving accepts `--title=`, `--description=`, `--badge=`, `--confidence=` and
`--provenance=` to rewrite an entry before it goes live.

### Adding a source

Drop a file in `sources/`, export a `Source`, register it in `sources/index.ts`,
then run `npm run poll -- --baseline <id>` once. Baseline records what the source
currently says without queueing it, so the queue starts at "no change since"
rather than at every value the listing happens to hold today.

Nothing downstream knows what any source is watching, and every URL and id is
overridable by environment variable (`MONITOR_<SOURCE_ID>_<KEY>`), so the whole
pipeline can be repointed at another unannounced title after November 19.

## Sources

| id | type | what it catches |
|---|---|---|
| `xbox-store` | storefront | Release date, package size, editions, pricing, pre-order state, straight from the public Microsoft catalog API. Package size appearing is the earliest hard preload signal. |
| `playstation-store` | storefront | Release date, price, platform and publisher fields off the product listing. |
| `rockstar-youtube` | official | New uploads, at the second they go public. Shorts are collapsed into their full-length counterpart. |
| `rockstar-site` | official | Dates and copy printed on the official site. |
| `netflix-premiere` | official | Scheduled premiere timestamps. |
| `press-coverage` | press | Outlet coverage, filtered to an allowlist of publications and to headlines that actually claim a shipping fact. |

Deliberately absent: any scraper pointed at leak communities. Unverified material
stays hand-curated.

## Environment

| Variable | Used for |
|---|---|
| `DISCORD_WEBHOOK_URL` | Alerts on new candidates. Optional. |
| `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` | Same, via Telegram. Optional. |
| `NOTIFY_ON_APPROVE=1` | Also announce entries when they are published. |
| `MONITOR_DISABLED_SOURCES` | Comma-separated ids to skip. |
| `MONITOR_MAX_CANDIDATES` | Cap per source per poll. Default 10. |
| `SITE_URL`, `NEXT_PUBLIC_SITE_URL` | Canonical URL for alerts and metadata. |

Webhook secrets go in the repository's Actions secrets. `npm run notify:test`
sends a single line to whatever is configured.

## Public interfaces

- `/api/events.json` — the timeline, the credibility ledger and the stated
  provenance policy. Static, CORS-open.
- `/llms.txt` — a plain-text brief for agents, written so a summariser cannot
  flatten a rumour into a fact.

## Editorial rules, enforced in code

- Two provenance tags, `official` and `unverified leak`, on every entry, in the
  page and in the feed.
- No leaked media is hosted, and claims link to outlet coverage rather than to
  the thread hosting the material.
- Unverified entries are announced by webhook without their description and
  without a link — the alert says a claim surfaced, not what it shows.
- `press-coverage` drops headlines centred on named individuals.
- No user-submitted input ships, so there is no 512(c) exposure to register a
  DMCA agent against. That changes the day any submission form does.
