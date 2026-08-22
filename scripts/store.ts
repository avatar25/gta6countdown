import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type {
  EventsFile,
  LedgerFile,
  PendingFile,
  SnapshotFile,
} from '../sources/types';

const here = dirname(fileURLToPath(import.meta.url));
export const DATA_DIR = join(here, '..', 'data');

export interface TargetFile {
  version: number;
  name: string;
  shortName: string;
  releaseDate: string;
  releaseDateLabel: string;
  preloadDate: string | null;
  platforms: string[];
  confirmedBy: string;
  storefrontReleaseDates: Record<string, string>;
}

function read<T>(name: string): T {
  return JSON.parse(readFileSync(join(DATA_DIR, name), 'utf8')) as T;
}

/** Writes with a trailing newline and stable key order so diffs stay readable. */
function write(name: string, value: unknown): void {
  writeFileSync(join(DATA_DIR, name), `${JSON.stringify(value, null, 2)}\n`);
}

export const readEvents = () => read<EventsFile>('events.json');
export const writeEvents = (value: EventsFile) => write('events.json', value);

export const readPending = () => read<PendingFile>('pending.json');
export const writePending = (value: PendingFile) => write('pending.json', value);

export const readSnapshots = () => read<SnapshotFile>('snapshots.json');
export const writeSnapshots = (value: SnapshotFile) =>
  write('snapshots.json', value);

export const readLedger = () => read<LedgerFile>('ledger.json');
export const writeLedger = (value: LedgerFile) => write('ledger.json', value);

export const readTarget = () => read<TargetFile>('target.json');
export const writeTarget = (value: TargetFile) => write('target.json', value);
