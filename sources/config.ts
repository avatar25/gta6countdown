/**
 * Per-source configuration.
 *
 * Every value can be overridden with an environment variable so the monitor can
 * be repointed at a different title without touching source code:
 *
 *   MONITOR_<SOURCE_ID>_<KEY>   e.g. MONITOR_XBOX_STORE_PRODUCTIDS
 *
 * A source whose required config resolves to an empty string reports `skipped`
 * rather than failing the run.
 */

type SourceDefaults = Record<string, Record<string, string>>;

const defaults: SourceDefaults = {
  'xbox-store': {
    // Microsoft Store big-catalog ids: standard edition, ultimate edition.
    productIds: '9P3H4968GRSM,9NNZSNHLR63L',
    market: 'US',
    language: 'en-us',
  },
  'playstation-store': {
    productIds:
      'EP1004-PPSA01547_00-GTAVISTANDARD001,EP1004-PPSA01547_00-GTAVIULTIMATE001',
    locale: 'en-us',
  },
  'rockstar-youtube': {
    channelId: 'UC6VcWc1rAoWdBCM0JxrRQ3A',
  },
  'rockstar-site': {
    url: 'https://www.rockstargames.com/VI',
  },
  'netflix-premiere': {
    url: 'https://www.netflix.com/GTAVI',
  },
  'press-coverage': {
    query: '"Grand Theft Auto VI"',
    edition: 'en-US:en',
  },
};

export function config(sourceId: string, key: string): string {
  const envKey = `MONITOR_${sourceId.replace(/[^a-z0-9]+/gi, '_')}_${key}`
    .toUpperCase();
  const fromEnv = process.env[envKey];
  if (fromEnv !== undefined) return fromEnv.trim();
  return defaults[sourceId]?.[key]?.trim() ?? '';
}

export function configList(sourceId: string, key: string): string[] {
  return config(sourceId, key)
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
}

/** Sources listed here are skipped entirely (comma-separated ids). */
export function isDisabled(sourceId: string): boolean {
  return (process.env.MONITOR_DISABLED_SOURCES ?? '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)
    .includes(sourceId);
}

/** Hard cap on candidates a single source may queue in one poll. */
export const MAX_CANDIDATES_PER_POLL = Number(
  process.env.MONITOR_MAX_CANDIDATES ?? 10,
);
