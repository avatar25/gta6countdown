import type { RejectedEntry, RejectionCategory, TimelineEvent } from '../sources/types';

/** Reject an observed value, while letting a later version reach review. */
export function isRejectedVersion(
  id: string,
  contentHash: string,
  rejected: RejectedEntry[],
): boolean {
  return rejected.some(
    (entry) =>
      entry.id === id &&
      (entry.contentHash === undefined || entry.contentHash === contentHash),
  );
}

export function rejectionCategory(value = 'other'): RejectionCategory {
  const categories: RejectionCategory[] = [
    'duplicate', 'out-of-scope', 'stale', 'incorrect', 'other',
  ];
  if (!categories.includes(value as RejectionCategory)) {
    throw new Error(`unknown rejection category: ${value}`);
  }
  return value as RejectionCategory;
}

/** Editorial noise is separate from a source making an incorrect claim. */
export function countsAgainstAccuracy(entry: RejectedEntry): boolean {
  return entry.reasonCategory === undefined ||
    entry.reasonCategory === 'incorrect' || entry.reasonCategory === 'other';
}

/** Only a reviewer can identify independent evidence for the same claim. */
export function reviewedCorroborations(
  value: string | undefined,
  entryId: string,
  events: TimelineEvent[],
): string[] {
  const ids = [...new Set((value ?? '').split(',').map((id) => id.trim()).filter(Boolean))];
  for (const id of ids) {
    if (id === entryId || !events.some((event) => event.id === id)) {
      throw new Error(`corroboration must name another published event: ${id}`);
    }
  }
  return ids;
}

export function reviewedSource(value: string): string {
  const url = new URL(value);
  if (url.protocol !== 'https:') throw new Error('source must be an HTTPS URL');
  return url.href;
}
