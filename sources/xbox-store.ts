import { config, configList } from './config';
import type { Candidate, Raw, Source } from './types';
import { fetchRaw, formatBytes } from './util';

/**
 * Microsoft Store display-catalog watcher.
 *
 * The public catalog API is the highest-signal-per-line source we have: release
 * date, package size, edition list and pre-order availability all land here
 * before anyone writes a story about them.
 */

const ENDPOINT = 'https://displaycatalog.mp.microsoft.com/v7.0/products';

interface CatalogSku {
  SkuId?: string;
  LocalizedProperties?: { SkuTitle?: string }[];
  Properties?: {
    Packages?: { MaxDownloadSizeInBytes?: number }[];
  };
}

interface CatalogAvailability {
  Properties?: { OriginalReleaseDate?: string };
  OrderManagementData?: {
    Price?: { ListPrice?: number; CurrencyCode?: string };
  };
}

interface CatalogProduct {
  ProductId?: string;
  LocalizedProperties?: { ProductTitle?: string }[];
  MarketProperties?: { OriginalReleaseDate?: string }[];
  DisplaySkuAvailabilities?: {
    Sku?: CatalogSku;
    Availabilities?: CatalogAvailability[];
  }[];
}

const xboxStore: Source = {
  id: 'xbox-store',
  label: 'Microsoft Store listing',
  sourceType: 'storefront',
  provenance: 'official',
  baseConfidence: 0.9,

  async poll(): Promise<Raw | null> {
    const productIds = configList('xbox-store', 'productIds');
    if (productIds.length === 0) return null;

    const url =
      `${ENDPOINT}?bigIds=${productIds.join(',')}` +
      `&market=${config('xbox-store', 'market')}` +
      `&languages=${config('xbox-store', 'language')}` +
      `&MS-CV=${randomCorrelationVector()}`;

    return fetchRaw(url, { headers: { accept: 'application/json' } });
  },

  parse(raw: Raw): Candidate[] {
    const payload = JSON.parse(raw.body) as { Products?: CatalogProduct[] };
    const candidates: Candidate[] = [];

    for (const product of payload.Products ?? []) {
      const productId = product.ProductId;
      if (!productId) continue;

      const title =
        product.LocalizedProperties?.[0]?.ProductTitle ?? productId;
      const storeUrl = `https://www.xbox.com/en-US/games/store/_/${productId}`;

      const push = (
        key: string,
        headline: string,
        description: string,
        fields: Candidate['fields'],
        occurredAt = raw.fetchedAt,
      ) => {
        candidates.push({
          id: `xbox-store:${productId}:${key}`,
          sourceId: 'xbox-store',
          sourceType: 'storefront',
          provenance: 'official',
          title: headline,
          description,
          url: storeUrl,
          sourceLabel: 'Microsoft Store listing',
          occurredAt,
          fields,
        });
      };

      const releaseDate = product.MarketProperties?.[0]?.OriginalReleaseDate;
      if (releaseDate) {
        push(
          'release-date',
          `${title}: Microsoft Store release date reads ${isoDay(releaseDate)}`,
          `The Microsoft Store catalog entry lists a release date of ${releaseDate} for ${title}. Storefront metadata usually moves before an announcement does.`,
          { releaseDate },
        );
      }

      const skuTitles: string[] = [];
      let preorder = false;

      for (const availability of product.DisplaySkuAvailabilities ?? []) {
        const sku = availability.Sku;
        const skuId = sku?.SkuId;
        if (!skuId) continue;

        const skuTitle = sku?.LocalizedProperties?.[0]?.SkuTitle ?? skuId;
        skuTitles.push(`${skuId}:${skuTitle}`);

        const bytes = sku?.Properties?.Packages?.find(
          (pkg) => typeof pkg.MaxDownloadSizeInBytes === 'number',
        )?.MaxDownloadSizeInBytes;

        if (typeof bytes === 'number' && bytes > 0) {
          push(
            `${skuId}:size`,
            `${title}: package size published as ${formatBytes(bytes)}`,
            `The Microsoft Store catalog now reports a maximum download size of ${bytes.toLocaleString('en-US')} bytes (${formatBytes(bytes)}) for SKU ${skuTitle}. A size appearing or changing is one of the earliest hard signals that builds are being staged for preload.`,
            { skuId, bytes },
          );
        }

        for (const entry of availability.Availabilities ?? []) {
          if (entry.Properties?.OriginalReleaseDate) preorder = true;
          const price = entry.OrderManagementData?.Price;
          if (typeof price?.ListPrice === 'number' && price.ListPrice > 0) {
            push(
              `${skuId}:price`,
              `${title}: listed at ${price.ListPrice} ${price.CurrencyCode ?? ''}`.trim(),
              `The Microsoft Store lists ${skuTitle} at ${price.ListPrice} ${price.CurrencyCode ?? ''}.`.trim(),
              { skuId, listPrice: price.ListPrice, currency: price.CurrencyCode ?? null },
            );
          }
        }
      }

      if (skuTitles.length > 0) {
        push(
          'editions',
          `${title}: ${skuTitles.length} edition(s) listed on Microsoft Store`,
          `Edition line-up currently on the listing: ${skuTitles
            .map((entry) => entry.split(':').slice(1).join(':'))
            .join(', ')}.`,
          { editions: skuTitles.sort().join('|'), preorder: String(preorder) },
        );
      }
    }

    return candidates;
  },
};

function isoDay(iso: string): string {
  return iso.slice(0, 10);
}

function randomCorrelationVector(): string {
  // MS-CV is a request-correlation header; any well-formed value is accepted.
  const alphabet =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let value = '';
  for (let index = 0; index < 16; index += 1) {
    value += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return `${value}.1`;
}

export default xboxStore;
