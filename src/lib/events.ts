/**
 * The site's read model.
 *
 * Everything the page renders comes from the JSON in `data/`, which the monitor
 * writes and a human approves. Nothing is fetched at request time: the files are
 * bundled at build, so the site stays static and every published value is
 * traceable to a commit.
 */
import eventsFile from '../../data/events.json';
import ledgerFile from '../../data/ledger.json';
import snapshotsFile from '../../data/snapshots.json';
import targetFile from '../../data/target.json';
import type {
  EventsFile,
  LedgerFile,
  SnapshotFile,
  TimelineEvent,
} from '../../sources/types';

export type { TimelineEvent };

export interface Target {
  name: string;
  shortName: string;
  releaseDate: string;
  releaseDateLabel: string;
  preloadDate: string | null;
  platforms: string[];
}

const parsedEvents = eventsFile as unknown as EventsFile;
const parsedLedger = ledgerFile as unknown as LedgerFile;
const parsedSnapshots = snapshotsFile as unknown as SnapshotFile;

export const target = targetFile as unknown as Target;

/**
 * Newest first. A reader arriving cold should land on what just happened,
 * not scroll through four years of history to reach it.
 */
export const events: TimelineEvent[] = [...parsedEvents.events].sort((a, b) =>
  b.occurredAt.localeCompare(a.occurredAt),
);

/** When the published timeline last changed. */
export const updatedAt: string = parsedEvents.updatedAt;

/** When the monitor last completed a poll, changed or not. */
export const lastCheckedAt: string = parsedSnapshots.updatedAt;

/**
 * The newest day on the timeline. Everything sharing that day is highlighted,
 * which replaces the hand-maintained `latest: true` flags.
 */
const newestDay = events[0]?.occurredAt.slice(0, 10) ?? '';

export function isLatest(event: TimelineEvent): boolean {
  return event.occurredAt.slice(0, 10) === newestDay;
}

export function isUnverified(event: TimelineEvent): boolean {
  return event.provenance === 'unverified leak';
}

export const sourceHealth = parsedLedger.sources;

export function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'UTC',
    timeZoneName: 'short',
  });
}

export function formatDay(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

/** How each provenance tag is described to a reader who asks. */
export const provenanceCopy: Record<string, string> = {
  official: 'Stated by the publisher or published on a first-party listing.',
  'unverified leak':
    'Circulating claim. Not authenticated by the publisher, and no leaked media is hosted or linked here.',
};
