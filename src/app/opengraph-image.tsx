import { ImageResponse } from 'next/og';
import { events, target } from '@/lib/events';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'Release Signal Monitor';

/**
 * Rendered once at build time, so the card reflects whatever the data said on
 * the deploy that produced it.
 */
export default function OpengraphImage() {
  const daysOut = Math.max(
    0,
    Math.ceil((Date.parse(target.releaseDate) - Date.now()) / 86_400_000),
  );
  const official = events.filter(
    (event) => event.provenance === 'official',
  ).length;

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background:
            'linear-gradient(135deg, #0b0511 0%, #1a0b2e 45%, #3b0764 100%)',
          padding: 72,
          fontFamily: 'sans-serif',
          color: '#ffffff',
        }}
      >
        <div
          style={{
            display: 'flex',
            fontSize: 26,
            letterSpacing: 8,
            textTransform: 'uppercase',
            color: '#facc15',
          }}
        >
          Release Signal Monitor
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', fontSize: 150, fontWeight: 900, lineHeight: 1 }}>
            {daysOut} days
          </div>
          <div style={{ display: 'flex', fontSize: 44, color: '#e9d5ff' }}>
            until {target.name} · {target.releaseDateLabel}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            fontSize: 26,
            color: '#a5b4fc',
          }}
        >
          {official} first-party updates tracked · storefronts polled every 15
          minutes · nothing published without review
        </div>
      </div>
    ),
    size,
  );
}
