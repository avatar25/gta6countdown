import { config } from './config';
import type { Candidate, Raw, Source } from './types';
import { fetchRaw, isoDatesIn, metaContent, pageTitle, truncate } from './util';

/**
 * The official product site.
 *
 * Marketing pages churn on every request, so we diff a handful of extracted
 * fields instead of the response body: the page title, the social description
 * and any date the page states about itself.
 */
const rockstarSite: Source = {
  id: 'rockstar-site',
  label: 'Official Grand Theft Auto VI site',
  sourceType: 'official',
  provenance: 'official',
  baseConfidence: 0.95,

  async poll(): Promise<Raw | null> {
    const url = config('rockstar-site', 'url');
    if (!url) return null;
    return fetchRaw(url);
  },

  parse(raw: Raw): Candidate[] {
    const candidates: Candidate[] = [];
    const description = metaContent(raw.body, 'og:description');
    const title = pageTitle(raw.body);

    const spelledDates = [
      ...new Set(
        [
          ...raw.body.matchAll(
            /\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2}),?\s+(20\d{2})\b/g,
          ),
        ].map((match) => `${match[1]} ${match[2]}, ${match[3]}`),
      ),
    ].sort();

    if (title || description) {
      candidates.push({
        id: 'rockstar-site:page-copy',
        sourceId: 'rockstar-site',
        sourceType: 'official',
        provenance: 'official',
        title: 'Official site copy changed',
        description: truncate(
          `The official site is now headed "${title ?? 'untitled'}" and describes itself as: ${description ?? 'no description published'}`,
        ),
        url: raw.url,
        sourceLabel: 'Official site',
        occurredAt: raw.fetchedAt,
        fields: { title, description },
      });
    }

    if (spelledDates.length > 0) {
      candidates.push({
        id: 'rockstar-site:stated-dates',
        sourceId: 'rockstar-site',
        sourceType: 'official',
        provenance: 'official',
        title: `Official site now states: ${spelledDates.join(', ')}`,
        description: `Dates printed on the official site: ${spelledDates.join(', ')}. A date appearing, moving or disappearing here is a first-party statement, not a rumour.`,
        url: raw.url,
        sourceLabel: 'Official site',
        occurredAt: raw.fetchedAt,
        fields: { dates: spelledDates.join('|') },
      });
    }

    const machineDates = isoDatesIn(raw.body).slice(0, 12);
    if (machineDates.length > 0) {
      candidates.push({
        id: 'rockstar-site:embedded-dates',
        sourceId: 'rockstar-site',
        sourceType: 'official',
        provenance: 'official',
        title: 'Machine-readable dates on the official site changed',
        description: `Timestamps embedded in the page markup: ${machineDates.join(', ')}.`,
        url: raw.url,
        sourceLabel: 'Official site',
        occurredAt: raw.fetchedAt,
        fields: { dates: machineDates.join('|') },
      });
    }

    return candidates;
  },
};

export default rockstarSite;
