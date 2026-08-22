import { config, configList } from './config';
import type { Candidate, Raw, Source } from './types';
import { decodeEntities, fetchRaw, stripHtml } from './util';

/**
 * PlayStation Store product-page watcher.
 *
 * The store renders most of the catalogue client-side, but the server-rendered
 * shell still carries the fields we care about (release date, price, platform,
 * edition name), so we scrape those rather than reverse-engineering the
 * GraphQL persisted-query hashes, which rotate.
 */

interface Envelope {
  [productId: string]: string;
}

const playstationStore: Source = {
  id: 'playstation-store',
  label: 'PlayStation Store listing',
  sourceType: 'storefront',
  provenance: 'official',
  baseConfidence: 0.9,

  async poll(): Promise<Raw | null> {
    const productIds = configList('playstation-store', 'productIds');
    if (productIds.length === 0) return null;

    const locale = config('playstation-store', 'locale') || 'en-us';
    const envelope: Envelope = {};

    for (const productId of productIds) {
      const url = productUrl(productId, locale);
      const raw = await fetchRaw(url);
      // Keep only the region of the document that carries product metadata:
      // the rest is marketing chrome with per-request ids that never settle.
      envelope[productId] = extractSignalRegion(raw.body);
    }

    return {
      url: `https://store.playstation.com/${locale}/product/${productIds[0]}`,
      body: JSON.stringify(envelope),
      contentType: 'application/json',
      fetchedAt: new Date().toISOString(),
    };
  },

  parse(raw: Raw): Candidate[] {
    const envelope = JSON.parse(raw.body) as Envelope;
    const locale = config('playstation-store', 'locale') || 'en-us';
    const candidates: Candidate[] = [];

    for (const [productId, html] of Object.entries(envelope)) {
      const url = productUrl(productId, locale);
      const name = productName(html) ?? productId;

      const push = (
        key: string,
        title: string,
        description: string,
        fields: Candidate['fields'],
        occurredAt = raw.fetchedAt,
      ) => {
        candidates.push({
          id: `playstation-store:${productId}:${key}`,
          sourceId: 'playstation-store',
          sourceType: 'storefront',
          provenance: 'official',
          title,
          description,
          url,
          sourceLabel: 'PlayStation Store listing',
          occurredAt,
          fields,
        });
      };

      const releaseDate = html.match(/"releaseDate":"([^"]+)"/)?.[1];
      if (releaseDate) {
        push(
          'release-date',
          `${name}: PlayStation Store release date reads ${releaseDate.slice(0, 10)}`,
          `The PlayStation Store listing carries a release date of ${releaseDate}. Unlock times are expressed in UTC on this listing, so a change here can move the countdown.`,
          { releaseDate },
        );
      }

      const price = dataQaValue(html, 'finalPrice') ?? dataQaValue(html, 'displayPrice');
      if (price) {
        push('price', `${name}: listed at ${price}`, `The PlayStation Store lists ${name} at ${price}.`, { price });
      }

      const platform = dataQaValue(html, 'platform-value');
      const publisher = dataQaValue(html, 'publisher-value');
      if (platform) {
        push(
          'platforms',
          `${name}: platform metadata reads ${platform}`,
          `The PlayStation Store platform field for ${name} currently reads ${platform}.`,
          { platform },
        );
      }

      if (publisher) {
        push(
          'publisher',
          `${name}: publisher metadata reads ${publisher}`,
          `The PlayStation Store publisher field for ${name} currently reads ${publisher}.`,
          { publisher },
        );
      }

      const downloadSize = html.match(
        /(?:download size|file size)[^0-9]{0,40}([\d.,]+\s?(?:GB|MB|TB))/i,
      )?.[1];
      if (downloadSize) {
        push(
          'download-size',
          `${name}: PlayStation Store shows a ${downloadSize} download`,
          `A download size of ${downloadSize} is now published on the PlayStation Store listing. Sizes typically appear only once builds are staged for preload.`,
          { downloadSize },
        );
      }
    }

    return candidates;
  },
};

function productUrl(productId: string, locale: string): string {
  return `https://store.playstation.com/${locale}/product/${productId}`;
}

/**
 * Narrows a 400 KB store page to the parts whose values are stable between
 * requests. Without this, per-request script ids would make every poll look
 * like a change.
 */
function extractSignalRegion(html: string): string {
  const parts: string[] = [];

  const releaseDate = html.match(/"releaseDate":"[^"]+"/g);
  if (releaseDate) parts.push(...new Set(releaseDate));

  // Keep the full data-qa path: the same field name appears under several
  // widgets (the buy box, the edition carousel, related products) and only the
  // path tells them apart.
  for (const match of html.matchAll(/data-qa="([^"]+)"[^>]*>([^<]{0,80})</g)) {
    const value = decodeEntities(match[2]).trim();
    if (value) parts.push(`${match[1]}=${value}`);
  }

  const title = html.match(/<h1[^>]*>([\s\S]{0,200}?)<\/h1>/i);
  if (title) parts.push(`h1=${stripHtml(title[1])}`);

  const sizeHint = html.match(
    /(?:download size|file size)[^0-9]{0,40}[\d.,]+\s?(?:GB|MB|TB)/i,
  );
  if (sizeHint) parts.push(sizeHint[0]);

  return [...new Set(parts)].sort().join('\n');
}

/**
 * Reads a field out of the extracted region by the tail of its data-qa path,
 * preferring the buy box over the carousels that repeat the same field names.
 */
function dataQaValue(region: string, key: string): string | null {
  const matches = region
    .split('\n')
    .filter((line) => line.split('=')[0].endsWith(key))
    .map((line) => ({
      path: line.split('=')[0],
      value: line.slice(line.indexOf('=') + 1).trim(),
    }))
    .filter((entry) => entry.value.length > 0);

  if (matches.length === 0) return null;

  const primary =
    matches.find((entry) => entry.path.startsWith('mfeCtaMain')) ??
    matches.find((entry) => entry.path.startsWith('gameInfo')) ??
    matches[0];

  return primary.value;
}

function productName(region: string): string | null {
  const heading = region.match(/^h1=(.+)$/m);
  return heading ? heading[1].trim() : null;
}

export default playstationStore;
