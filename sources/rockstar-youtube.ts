import { config } from './config';
import type { Candidate, Raw, Source } from './types';
import { fetchRaw, parseFeed, truncate } from './util';

/**
 * Rockstar's YouTube uploads feed.
 *
 * Trailers land here at the same second they go public, and the Atom feed is a
 * documented, unauthenticated endpoint — zero risk, high value.
 */
const rockstarYoutube: Source = {
  id: 'rockstar-youtube',
  label: 'Rockstar Games on YouTube',
  sourceType: 'official',
  provenance: 'official',
  baseConfidence: 0.95,

  async poll(): Promise<Raw | null> {
    const channelId = config('rockstar-youtube', 'channelId');
    if (!channelId) return null;
    return fetchRaw(
      `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`,
    );
  },

  parse(raw: Raw): Candidate[] {
    const items = parseFeed(raw.body).filter((item) => item.link);

    // Rockstar posts most videos twice: once as a Short, once full length.
    // Queueing both would be noise, so the Short is dropped when its full
    // counterpart is in the same feed.
    const fullLengthTitles = new Set(
      items
        .filter((item) => !item.link.includes('/shorts/'))
        .map((item) => item.title.toLowerCase()),
    );

    return items
      .filter(
        (item) =>
          !item.link.includes('/shorts/') ||
          !fullLengthTitles.has(item.title.toLowerCase()),
      )
      .slice(0, 15)
      .map((item) => ({
        id: `rockstar-youtube:${item.id || item.link}`,
        sourceId: 'rockstar-youtube',
        sourceType: 'official' as const,
        provenance: 'official' as const,
        title: `Rockstar published a new video: ${item.title}`,
        description: truncate(
          item.summary ||
            `A new video titled "${item.title}" was published to the official Rockstar Games YouTube channel.`,
        ),
        url: item.link,
        sourceLabel: 'Rockstar Games on YouTube',
        occurredAt: item.published ?? raw.fetchedAt,
        fields: { videoId: item.id, title: item.title },
      }));
  },
};

export default rockstarYoutube;
