/**
 * The monitor loop, run from GitHub Actions every 15 minutes.
 *
 *   poll sources -> hash -> diff against the last snapshot -> queue candidates
 *
 * Nothing here writes to the public timeline. Every candidate lands in
 * data/pending.json and waits for `npm run approve`. Git history is the audit
 * log: what was seen, when it was seen, and what a human did about it.
 *
 * Usage:
 *   npm run poll                 poll every registered source
 *   npm run poll -- xbox-store   poll one source (useful when adding one)
 *   npm run poll -- --dry-run    poll and report, write nothing
 *   npm run poll -- --baseline   record what is there now without queueing it
 *                                (run once when adding a source, so the queue
 *                                 starts at "no change since" rather than at
 *                                 every value the listing happens to hold)
 */
import sources from '../sources/index';
import { MAX_CANDIDATES_PER_POLL, isDisabled } from '../sources/config';
import type {
  Candidate,
  PendingEntry,
  Source,
  SourceSnapshot,
} from '../sources/types';
import { shortHash } from '../sources/util';
import {
  readEvents,
  readLedger,
  readPending,
  readSnapshots,
  writePending,
  writeSnapshots,
} from './store';
import { notify } from './notify';

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const baseline = args.includes('--baseline');
const only = args.filter((arg) => !arg.startsWith('--'));

async function main(): Promise<void> {
  const snapshots = readSnapshots();
  const pendingFile = readPending();
  const events = readEvents();
  const ledger = readLedger();

  const rejectedIds = new Set(pendingFile.rejected.map((entry) => entry.id));
  const liveIds = new Set(events.events.map((event) => event.id));
  const pendingById = new Map(
    pendingFile.pending.map((entry) => [entry.id, entry]),
  );

  const selected = sources.filter(
    (source) =>
      (only.length === 0 || only.includes(source.id)) && !isDisabled(source.id),
  );

  if (selected.length === 0) {
    console.error(`no sources matched${only.length ? `: ${only.join(', ')}` : ''}`);
    process.exitCode = 1;
    return;
  }

  const fresh: PendingEntry[] = [];
  const now = new Date().toISOString();

  for (const source of selected) {
    const previous: SourceSnapshot = snapshots.sources[source.id] ?? {
      lastPolledAt: 'never',
      status: 'skipped',
      candidates: {},
      polls: 0,
      errors: 0,
    };

    const snapshot: SourceSnapshot = {
      ...previous,
      lastPolledAt: now,
      polls: previous.polls + 1,
      status: 'ok',
    };
    delete snapshot.error;

    try {
      const raw = await source.poll();

      if (raw === null) {
        snapshot.status = 'skipped';
        snapshot.polls = previous.polls;
        snapshots.sources[source.id] = snapshot;
        console.log(`· ${source.id}: skipped (not configured)`);
        continue;
      }

      const bodyHash = shortHash(raw.body);
      if (bodyHash === previous.bodyHash) {
        snapshot.status = 'unchanged';
        snapshot.bodyHash = bodyHash;
        snapshots.sources[source.id] = snapshot;
        console.log(`· ${source.id}: unchanged`);
        continue;
      }
      snapshot.bodyHash = bodyHash;

      const candidates = source.parse(raw).slice(0, MAX_CANDIDATES_PER_POLL);
      const seen: Record<string, string> = { ...previous.candidates };
      let changed = 0;

      for (const candidate of candidates) {
        const hash = contentHash(candidate);

        if (rejectedIds.has(candidate.id)) continue;
        if (seen[candidate.id] === hash) continue;

        seen[candidate.id] = hash;
        if (baseline) continue;

        changed += 1;
        const existing = pendingById.get(candidate.id);
        const entry: PendingEntry = {
          ...candidate,
          detectedAt: now,
          firstSeenAt: existing?.firstSeenAt ?? now,
          contentHash: hash,
          timesSeen: (existing?.timesSeen ?? 0) + 1,
          confidence: scoreFor(source, ledger.sources[source.id]?.score),
          corroborations: corroborate(candidate, candidates),
          // A value that is already published and has now moved is the single
          // most interesting thing this pipeline can find.
          supersedes: liveIds.has(candidate.id) ? candidate.id : undefined,
        };
        pendingById.set(candidate.id, entry);
        // A first sighting is news; a re-fire of a known candidate is an update.
        if (!existing) fresh.push(entry);
      }

      snapshot.candidates = seen;
      snapshots.sources[source.id] = snapshot;
      console.log(
        `✓ ${source.id}: ${candidates.length} observation(s), ${changed} changed`,
      );
    } catch (error) {
      snapshot.status = 'error';
      snapshot.errors = previous.errors + 1;
      snapshot.error = error instanceof Error ? error.message : String(error);
      snapshots.sources[source.id] = snapshot;
      console.error(`✗ ${source.id}: ${snapshot.error}`);
    }
  }

  snapshots.updatedAt = now;
  pendingFile.pending = [...pendingById.values()].sort((a, b) =>
    b.detectedAt.localeCompare(a.detectedAt),
  );
  pendingFile.updatedAt = now;

  if (baseline && !dryRun) {
    snapshots.updatedAt = now;
    writeSnapshots(snapshots);
    console.log('\nbaseline recorded — nothing queued');
    return;
  }

  if (dryRun) {
    console.log(`\ndry run — ${fresh.length} new candidate(s), nothing written`);
    for (const entry of fresh) console.log(`  - [${entry.sourceId}] ${entry.title}`);
    return;
  }

  writeSnapshots(snapshots);
  writePending(pendingFile);

  console.log(
    `\n${fresh.length} new candidate(s) queued · ${pendingFile.pending.length} awaiting review`,
  );

  if (fresh.length > 0) {
    await notify(fresh);
  }
}

/**
 * Hash of the values that decide whether an observation actually moved.
 *
 * `occurredAt` is deliberately excluded: sources that have no date of their own
 * fall back to the fetch time, which would otherwise make every poll look like
 * a change and refill the queue every quarter of an hour.
 */
function contentHash(candidate: Candidate): string {
  return shortHash(
    JSON.stringify({
      title: candidate.title,
      description: candidate.description,
      url: candidate.url,
      fields: candidate.fields ?? null,
    }),
  );
}

/**
 * Confidence starts at the source's prior and moves toward its measured
 * accuracy once the credibility ledger has something to say about it.
 */
function scoreFor(source: Source, ledgerScore: number | undefined): number {
  if (ledgerScore === undefined) return source.baseConfidence;
  return Number(((source.baseConfidence + ledgerScore) / 2).toFixed(2));
}

/**
 * Two observations from the same poll that name the same date corroborate each
 * other. Cross-source corroboration is applied at approval time, where the full
 * event set is in scope.
 */
function corroborate(candidate: Candidate, batch: Candidate[]): string[] {
  const day = candidate.occurredAt.slice(0, 10);
  return batch
    .filter(
      (other) =>
        other.id !== candidate.id && other.occurredAt.slice(0, 10) === day,
    )
    .map((other) => other.id);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
