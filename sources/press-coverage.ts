import { config } from './config';
import type { Candidate, Raw, Source } from './types';
import { fetchRaw, parseFeed, truncate } from './util';

/**
 * Aggregated press coverage.
 *
 * This source exists to satisfy the project's standing rule: when something
 * surfaces, link the outlet that covered it rather than the thread hosting the
 * material. It is a firehose by default, so it is filtered twice — once on the
 * outlet, once on whether the headline actually claims a release-relevant fact.
 */

const OUTLETS = (
  process.env.MONITOR_PRESS_OUTLETS ??
  [
    'IGN',
    'PC Gamer',
    'Eurogamer',
    'GameSpot',
    'Polygon',
    'Kotaku',
    'Rock Paper Shotgun',
    'VGC',
    'Video Games Chronicle',
    'The Verge',
    'Engadget',
    'Bloomberg',
    'Bloomberg.com',
    'Reuters',
    'Game Developer',
    'GamesIndustry.biz',
    'Windows Central',
    'Push Square',
    'Digital Foundry',
  ].join(',')
)
  .split(',')
  .map((outlet) => outlet.trim().toLowerCase())
  .filter(Boolean);

/** Headlines must claim something about shipping, not about discourse. */
const SIGNAL = new RegExp(
  [
    'release date',
    'launch (date|time|day)',
    'delay(ed|s)?',
    'pre-?load',
    'pre-?order',
    '(file|download|install) size',
    'gone gold',
    'unlock time',
    'esrb|pegi|usk|rating board|age rating',
    'trailer',
    'review embargo',
    'editions?',
    'price|pricing',
    'confirm(s|ed)',
    'announce(s|d|ment)',
    'certification|submitted to',
  ].join('|'),
  'i',
);

/**
 * Coverage centred on a named individual is out of scope by policy, however
 * widely it is syndicated.
 */
const OUT_OF_SCOPE = /leaker|hacker|arrest|sentenc|teen|suspect|court date|trial/i;

const pressCoverage: Source = {
  id: 'press-coverage',
  label: 'Press coverage',
  sourceType: 'press',
  provenance: 'official',
  baseConfidence: 0.6,

  async poll(): Promise<Raw | null> {
    const query = config('press-coverage', 'query');
    if (!query) return null;

    const [hl, lang] = (config('press-coverage', 'edition') || 'en-US:en').split(':');
    const country = hl.split('-')[1] ?? 'US';
    const url =
      'https://news.google.com/rss/search' +
      `?q=${encodeURIComponent(query)}` +
      `&hl=${hl}&gl=${country}&ceid=${country}:${lang}`;

    return fetchRaw(url, { headers: { accept: 'application/rss+xml' } });
  },

  parse(raw: Raw): Candidate[] {
    const outletById = new Map<string, string>();
    for (const match of raw.body.matchAll(
      /<item>[\s\S]*?<guid[^>]*>([^<]+)<\/guid>[\s\S]*?<source[^>]*>([^<]+)<\/source>[\s\S]*?<\/item>/g,
    )) {
      outletById.set(match[1], match[2]);
    }

    return parseFeed(raw.body)
      .filter((item) => {
        const outlet = outletById.get(item.id) ?? '';
        if (!OUTLETS.includes(outlet.toLowerCase())) return false;
        if (!SIGNAL.test(item.title)) return false;
        if (OUT_OF_SCOPE.test(item.title)) return false;
        return Boolean(item.link);
      })
      .slice(0, 8)
      .map((item) => {
        const outlet = outletById.get(item.id) ?? 'Press';
        return {
          id: `press-coverage:${item.id}`,
          sourceId: 'press-coverage',
          sourceType: 'press' as const,
          provenance: 'official' as const,
          title: item.title.replace(
            new RegExp(`\\s*-\\s*${escapeRegex(outlet)}$`),
            '',
          ),
          description: truncate(
            `${outlet} published: "${item.title}". Reported coverage, not a first-party statement — confirm against the official sources before the confidence on this entry goes up.`,
          ),
          url: item.link,
          sourceLabel: outlet,
          occurredAt: item.published ?? raw.fetchedAt,
          fields: { outlet, headline: item.title },
        };
      });
  },
};

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export default pressCoverage;
