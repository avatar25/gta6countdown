import { config } from './config';
import type { Candidate, Raw, Source } from './types';
import { fetchRaw, isoDatesIn, metaContent, pageTitle, truncate } from './util';

/**
 * The Netflix premiere listing.
 *
 * Streaming listings carry a scheduled start time in machine-readable form long
 * before the broadcast, which makes them a clean, first-party clock.
 */
const netflixPremiere: Source = {
  id: 'netflix-premiere',
  label: 'Netflix premiere listing',
  sourceType: 'official',
  provenance: 'official',
  baseConfidence: 0.9,

  async poll(): Promise<Raw | null> {
    const url = config('netflix-premiere', 'url');
    if (!url) return null;
    return fetchRaw(url);
  },

  parse(raw: Raw): Candidate[] {
    const candidates: Candidate[] = [];
    const description = metaContent(raw.body, 'og:description');
    const title = metaContent(raw.body, 'og:title') ?? pageTitle(raw.body);
    const scheduled = isoDatesIn(raw.body).slice(0, 8);

    if (title || description) {
      candidates.push({
        id: 'netflix-premiere:listing',
        sourceId: 'netflix-premiere',
        sourceType: 'official',
        provenance: 'official',
        title: 'Netflix listing copy changed',
        description: truncate(
          `The Netflix listing now reads "${title ?? 'untitled'}": ${description ?? 'no description published'}`,
        ),
        url: raw.url,
        sourceLabel: 'Netflix listing',
        occurredAt: raw.fetchedAt,
        fields: { title, description },
      });
    }

    if (scheduled.length > 0) {
      candidates.push({
        id: 'netflix-premiere:schedule',
        sourceId: 'netflix-premiere',
        sourceType: 'official',
        provenance: 'official',
        title: `Netflix listing schedule reads ${scheduled[0]}`,
        description: `Scheduled timestamps published on the Netflix listing: ${scheduled.join(', ')}.`,
        url: raw.url,
        sourceLabel: 'Netflix listing',
        // The event is the listing changing today, not the date it announces:
        // the announced date is the payload, and lives in `fields`.
        occurredAt: raw.fetchedAt,
        fields: { schedule: scheduled.join('|') },
      });
    }

    return candidates;
  },
};

export default netflixPremiere;
