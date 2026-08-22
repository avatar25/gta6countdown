/**
 * Discord / Telegram webhooks.
 *
 * Two hard rules live here, not in the callers:
 *
 *  1. Unverified material is announced, never described. The alert says a claim
 *     surfaced and points at the site; it does not repeat what the claim shows.
 *  2. Links only ever go to first-party listings or to outlet coverage. A
 *     community-sourced entry is sent without a link.
 *
 * Configured entirely by environment:
 *   DISCORD_WEBHOOK_URL
 *   TELEGRAM_BOT_TOKEN + TELEGRAM_CHAT_ID
 *   SITE_URL (defaults to https://countdown.shiben.dev)
 */
import type { PendingEntry, TimelineEvent } from '../sources/types';

const SITE_URL = process.env.SITE_URL ?? 'https://countdown.shiben.dev';

type Announceable = PendingEntry | TimelineEvent;

export interface NotifyOptions {
  /** "queued" for review alerts, "published" once a human approved it. */
  stage?: 'queued' | 'published';
}

export async function notify(
  entries: Announceable[],
  options: NotifyOptions = {},
): Promise<void> {
  if (entries.length === 0) return;

  const stage = options.stage ?? 'queued';
  const lines = entries.map((entry) => formatLine(entry));
  const heading =
    stage === 'published'
      ? `${entries.length} update(s) published`
      : `${entries.length} signal(s) detected — awaiting review`;

  const message = [`**${heading}**`, ...lines, SITE_URL].join('\n');

  const results = await Promise.allSettled([
    sendDiscord(heading, lines),
    sendTelegram(message),
  ]);

  for (const result of results) {
    if (result.status === 'rejected') {
      console.error(`notify: ${result.reason}`);
    }
  }
}

/**
 * One line per entry. Everything that is not first-party gets stated as a
 * claim, and unverified entries carry no description and no link.
 */
function formatLine(entry: Announceable): string {
  const label = entry.sourceType.toUpperCase();

  if (entry.provenance === 'unverified leak' || entry.sourceType === 'community') {
    return `• [${label} · UNVERIFIED] ${entry.title} — details on the site.`;
  }

  const url = 'url' in entry ? entry.url : entry.source;
  return `• [${label}] ${entry.title}\n  ${url}`;
}

async function sendDiscord(heading: string, lines: string[]): Promise<void> {
  const webhook = process.env.DISCORD_WEBHOOK_URL;
  if (!webhook) return;

  const response = await fetch(webhook, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    signal: AbortSignal.timeout(15_000),
    body: JSON.stringify({
      username: 'Release Signal Monitor',
      embeds: [
        {
          title: heading,
          description: lines.join('\n').slice(0, 3_800),
          url: SITE_URL,
          color: 0xfacc15,
          timestamp: new Date().toISOString(),
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`discord ${response.status} ${await response.text()}`);
  }
}

async function sendTelegram(message: string): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;

  const response = await fetch(
    `https://api.telegram.org/bot${token}/sendMessage`,
    {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      signal: AbortSignal.timeout(15_000),
      body: JSON.stringify({
        chat_id: chatId,
        text: message.slice(0, 4_000),
        parse_mode: 'Markdown',
        disable_web_page_preview: true,
      }),
    },
  );

  if (!response.ok) {
    throw new Error(`telegram ${response.status} ${await response.text()}`);
  }
}

/** `npm run notify -- --test` sends a single line to whatever is configured. */
if (process.argv.includes('--test')) {
  void notify(
    [
      {
        id: 'test',
        sourceId: 'test',
        sourceType: 'official',
        provenance: 'official',
        title: 'Webhook test',
        description: 'If you can read this, the webhook is wired up.',
        url: SITE_URL,
        sourceLabel: 'Monitor',
        occurredAt: new Date().toISOString(),
        detectedAt: new Date().toISOString(),
        firstSeenAt: new Date().toISOString(),
        contentHash: 'test',
        timesSeen: 1,
        confidence: 1,
        corroborations: [],
      },
    ],
    { stage: 'queued' },
  );
}
