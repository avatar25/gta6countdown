import { createHash } from 'node:crypto';
import type { Raw } from './types';

const USER_AGENT =
  process.env.MONITOR_USER_AGENT ??
  'countdown.shiben.dev release-signal monitor (+https://countdown.shiben.dev)';

export function sha256(input: string): string {
  return createHash('sha256').update(input).digest('hex');
}

/** Short hash — plenty for change detection, keeps the snapshot file readable. */
export function shortHash(input: string): string {
  return sha256(input).slice(0, 16);
}

export interface FetchOptions {
  headers?: Record<string, string>;
  timeoutMs?: number;
  attempts?: number;
}

export async function fetchRaw(
  url: string,
  options: FetchOptions = {},
): Promise<Raw> {
  const { timeoutMs = 25_000, attempts = 3 } = options;
  let lastError: unknown;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(url, {
        redirect: 'follow',
        signal: AbortSignal.timeout(timeoutMs),
        headers: {
          'user-agent': USER_AGENT,
          'accept-language': 'en-US,en;q=0.9',
          ...options.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status} ${response.statusText}`);
      }

      return {
        url,
        body: await response.text(),
        contentType: response.headers.get('content-type') ?? 'unknown',
        fetchedAt: new Date().toISOString(),
      };
    } catch (error) {
      lastError = error;
      if (attempt < attempts) {
        await sleep(attempt * 1_500);
      }
    }
  }

  throw new Error(
    `fetch failed for ${url}: ${lastError instanceof Error ? lastError.message : String(lastError)}`,
  );
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/* ------------------------------------------------------------------ */
/* Text helpers                                                        */
/* ------------------------------------------------------------------ */

export function stripHtml(input: string): string {
  return decodeEntities(
    input
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' '),
  )
    .replace(/\s+/g, ' ')
    .trim();
}

export function decodeEntities(input: string): string {
  return input
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) =>
      String.fromCodePoint(Number.parseInt(hex, 16)),
    )
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(Number(dec)))
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
}

export function truncate(input: string, max = 320): string {
  const clean = input.trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1).trimEnd()}…`;
}

export function metaContent(html: string, property: string): string | null {
  const pattern = new RegExp(
    `<meta[^>]+(?:property|name)=["']${property}["'][^>]*content=["']([^"']*)["']`,
    'i',
  );
  const match = html.match(pattern);
  if (match) return decodeEntities(match[1]).trim();

  const reversed = new RegExp(
    `<meta[^>]+content=["']([^"']*)["'][^>]*(?:property|name)=["']${property}["']`,
    'i',
  );
  const reverseMatch = html.match(reversed);
  return reverseMatch ? decodeEntities(reverseMatch[1]).trim() : null;
}

export function pageTitle(html: string): string | null {
  const match = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  return match ? decodeEntities(match[1]).trim() : null;
}

/** Every distinct ISO-8601 timestamp embedded anywhere in a document. */
export function isoDatesIn(html: string): string[] {
  const matches = html.matchAll(
    /(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2})?(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})?)/g,
  );
  return [...new Set([...matches].map((match) => match[1]))].sort();
}

/* ------------------------------------------------------------------ */
/* Feed parsing (RSS 2.0 + Atom)                                       */
/* ------------------------------------------------------------------ */

export interface FeedItem {
  id: string;
  title: string;
  link: string;
  published: string | null;
  summary: string;
  author: string | null;
}

export function parseFeed(xml: string): FeedItem[] {
  const blocks = [
    ...xml.matchAll(/<item\b[\s\S]*?<\/item>/gi),
    ...xml.matchAll(/<entry\b[\s\S]*?<\/entry>/gi),
  ].map((match) => match[0]);

  return blocks.map((block) => {
    const link =
      tagText(block, 'link') ||
      attr(block, /<link[^>]+rel=["']alternate["'][^>]*href=["']([^"']+)["']/i) ||
      attr(block, /<link[^>]+href=["']([^"']+)["']/i) ||
      '';

    const published =
      tagText(block, 'pubDate') ||
      tagText(block, 'published') ||
      tagText(block, 'updated') ||
      tagText(block, 'dc:date');

    const summary =
      tagText(block, 'media:description') ||
      tagText(block, 'summary') ||
      tagText(block, 'description') ||
      tagText(block, 'content') ||
      '';

    return {
      id: tagText(block, 'guid') || tagText(block, 'id') || link,
      title: stripHtml(tagText(block, 'title') || ''),
      link: link.trim(),
      published: published ? toIso(published) : null,
      summary: stripHtml(summary),
      author:
        stripHtml(tagText(block, 'name') || tagText(block, 'dc:creator') || '') ||
        null,
    };
  });
}

function tagText(block: string, tag: string): string {
  const pattern = new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)</${tag}>`, 'i');
  const match = block.match(pattern);
  if (!match) return '';
  return decodeEntities(
    match[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1'),
  ).trim();
}

function attr(block: string, pattern: RegExp): string {
  const match = block.match(pattern);
  return match ? decodeEntities(match[1]) : '';
}

export function toIso(value: string): string | null {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

/** Formats an ISO timestamp the way the timeline has always displayed dates. */
export function displayDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

export function formatBytes(bytes: number): string {
  const gb = bytes / 1024 ** 3;
  if (gb >= 1) return `${gb.toFixed(1)} GB`;
  return `${(bytes / 1024 ** 2).toFixed(0)} MB`;
}

/** Depth-first search for every value stored under a given key. */
export function deepCollect(input: unknown, key: string, limit = 25): unknown[] {
  const found: unknown[] = [];
  const stack: unknown[] = [input];

  while (stack.length > 0 && found.length < limit) {
    const node = stack.pop();
    if (!node || typeof node !== 'object') continue;

    if (Array.isArray(node)) {
      stack.push(...node);
      continue;
    }

    for (const [entryKey, value] of Object.entries(node)) {
      if (entryKey === key) found.push(value);
      if (value && typeof value === 'object') stack.push(value);
    }
  }

  return found;
}
