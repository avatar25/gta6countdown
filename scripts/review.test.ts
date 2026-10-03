import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import rockstarYoutube from '../sources/rockstar-youtube';
import type { Candidate, RejectedEntry, TimelineEvent } from '../sources/types';
import { countsAgainstAccuracy, isRejectedVersion, reviewedCorroborations } from './review';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

test('rejected versions do not disable future schedule changes', () => {
  const rejected: RejectedEntry[] = [{
    id: 'netflix-premiere:schedule', sourceId: 'netflix-premiere', title: 'Schedule',
    reason: 'stale', rejectedAt: '2026-10-03T00:00:00Z', contentHash: 'old', reasonCategory: 'stale',
  }];
  assert.equal(isRejectedVersion('netflix-premiere:schedule', 'old', rejected), true);
  assert.equal(isRejectedVersion('netflix-premiere:schedule', 'new', rejected), false);
  assert.equal(isRejectedVersion('another-id', 'old', rejected), false);
  const legacy = [{ ...rejected[0], contentHash: undefined }];
  assert.equal(isRejectedVersion('netflix-premiere:schedule', 'new', legacy), true);
});

test('editorial duplicate and scope decisions do not imply incorrect claims', () => {
  for (const reasonCategory of ['duplicate', 'stale', 'out-of-scope'] as const) {
    assert.equal(countsAgainstAccuracy({ reasonCategory } as RejectedEntry), false);
  }
  assert.equal(countsAgainstAccuracy({ reasonCategory: 'incorrect' } as RejectedEntry), true);
  assert.equal(countsAgainstAccuracy({} as RejectedEntry), true);
});

test('corroboration is explicit and must reference a published event', () => {
  const events = [{ id: 'rating', occurredAt: '2026-10-01T12:00:00Z' }] as TimelineEvent[];
  assert.deepEqual(reviewedCorroborations(undefined, 'pricing-opinion', events), []);
  assert.deepEqual(reviewedCorroborations('rating,rating', 'another-rating', events), ['rating']);
  assert.throws(() => reviewedCorroborations('unknown', 'another-rating', events));
  assert.throws(() => reviewedCorroborations('rating', 'rating', events));
});

test('promotional Shorts collapse into the full upload, distinct Shorts remain', () => {
  const entry = (id: string, title: string, url: string) => `<entry><id>${id}</id><title>${title}</title><link href="${url}"/><published>2026-08-28T01:00:00Z</published></entry>`;
  const body = `<feed>${[
    entry('short1', 'Grand Theft Auto VI: An Extended Look — Now Playing', 'https://www.youtube.com/shorts/one'),
    entry('short2', 'Grand Theft Auto VI: An Extended Look - Now Playing', 'https://www.youtube.com/shorts/two'),
    entry('full', 'Grand Theft Auto VI: An Extended Look', 'https://www.youtube.com/watch?v=full'),
    entry('distinct', 'Grand Theft Auto VI: A Different Announcement', 'https://www.youtube.com/shorts/different'),
  ].join('')}</feed>`;
  const candidates = rockstarYoutube.parse({ url: 'https://www.youtube.com/feed', body, contentType: 'application/atom+xml', fetchedAt: '2026-08-28T02:00:00Z' });
  assert.deepEqual(candidates.map((entry) => entry.id), ['rockstar-youtube:full', 'rockstar-youtube:distinct']);
});

function fixture() {
  const path = mkdtempSync(join(tmpdir(), 'gta6-review-'));
  cpSync(join(root, 'scripts'), join(path, 'scripts'), { recursive: true });
  cpSync(join(root, 'sources'), join(path, 'sources'), { recursive: true });
  mkdirSync(join(path, 'data'));
  const write = (name: string, value: unknown) => writeFileSync(join(path, 'data', name), JSON.stringify(value));
  const read = (name: string) => JSON.parse(readFileSync(join(path, 'data', name), 'utf8'));
  const run = (script: string, ...args: string[]) => execFileSync(process.execPath, ['--import', 'tsx', join(path, 'scripts', script), ...args], {
    cwd: root, env: { ...process.env, NOTIFY_ON_APPROVE: '0', DISCORD_WEBHOOK_URL: '', TELEGRAM_BOT_TOKEN: '', TELEGRAM_CHAT_ID: '' }, encoding: 'utf8',
  });
  write('events.json', { version: 1, updatedAt: '', events: [] });
  write('pending.json', { version: 1, updatedAt: '', pending: [], rejected: [] });
  write('snapshots.json', { version: 1, updatedAt: '', sources: {} });
  write('ledger.json', { version: 1, updatedAt: '', sources: {} });
  return { path, write, read, run, remove: () => rmSync(path, { recursive: true, force: true }) };
}

const candidate: Candidate = {
  id: 'netflix-premiere:schedule', sourceId: 'netflix-premiere', sourceType: 'official', provenance: 'official',
  title: 'Schedule changed', description: 'Schedule', url: 'https://www.netflix.com/GTAVI', sourceLabel: 'Netflix',
  occurredAt: '2026-08-27T00:00:00Z', fields: { schedule: '2026-08-27T19:00:00Z' },
};

test('poll → reject → poll suppresses that version and queues a later change', () => {
  const f = fixture();
  try {
    writeFileSync(join(f.path, 'sources/index.ts'), `import { readFileSync } from 'node:fs';
      import { join } from 'node:path'; import { DATA_DIR } from '../scripts/store';
      export default [{ id: 'netflix-premiere', baseConfidence: 0.9,
        poll: async () => ({ body: readFileSync(join(DATA_DIR, 'fixture.json'), 'utf8') }),
        parse: (raw: {body: string}) => [JSON.parse(raw.body)] }];`);
    f.write('fixture.json', candidate);
    f.run('poll.ts');
    assert.equal(f.read('pending.json').pending.length, 1);
    assert.deepEqual(f.read('pending.json').pending[0].corroborations, []);
    f.run('approve.ts', 'reject', candidate.id, 'Old schedule', '--category=stale');
    const rejected = f.read('pending.json').rejected[0];
    assert.ok(rejected.contentHash);
    assert.equal(rejected.reasonCategory, 'stale');
    assert.equal(rejected.reason, 'Old schedule');
    f.run('poll.ts');
    assert.equal(f.read('pending.json').pending.length, 0);
    f.write('fixture.json', { ...candidate, description: 'New premiere', fields: { schedule: '2026-09-01T19:00:00Z' } });
    f.run('poll.ts');
    assert.equal(f.read('pending.json').pending.length, 1);
    assert.notEqual(f.read('pending.json').pending[0].contentHash, rejected.contentHash);
  } finally { f.remove(); }
});

test('approval uses verified source and drops stale and same-day corroborations', () => {
  const f = fixture();
  try {
    f.write('pending.json', { version: 1, updatedAt: '', rejected: [], pending: [{
      ...candidate, firstSeenAt: candidate.occurredAt, detectedAt: candidate.occurredAt,
      contentHash: 'hash', timesSeen: 1, confidence: 0.9, corroborations: ['unrelated-pending'],
    }] });
    f.write('events.json', { version: 1, updatedAt: '', events: [{
      id: 'unrelated-published', sourceId: 'press-coverage', occurredAt: candidate.occurredAt,
    }] });
    f.run('approve.ts', 'approve', candidate.id, '--title=Preview Released', '--source=https://www.rockstargames.com/VI/an-extended-look', '--sourceLabel=Rockstar Games');
    const event = f.read('events.json').events.find((entry: TimelineEvent) => entry.id === candidate.id);
    assert.equal(event.source, 'https://www.rockstargames.com/VI/an-extended-look');
    assert.equal(event.sourceLabel, 'Rockstar Games');
    assert.equal(event.title, 'Preview Released');
    assert.deepEqual(event.corroborations, []);
    assert.equal(f.read('pending.json').pending.length, 0);
  } finally { f.remove(); }
});

test('ledger reports editorial rejects without penalizing accuracy for duplicate promotions', () => {
  const f = fixture();
  try {
    f.run('ledger.ts');
    const prior = f.read('ledger.json').sources['rockstar-youtube'].score;
    const rejected = Array.from({ length: 6 }, (_, i) => ({
      id: `short-${i}`, sourceId: 'rockstar-youtube', title: 'Promo',
      reason: 'Duplicate campaign', reasonCategory: 'duplicate', contentHash: `hash-${i}`,
      rejectedAt: '2026-10-03T00:00:00Z',
    }));
    f.write('pending.json', { version: 1, updatedAt: '', pending: [], rejected });
    f.run('ledger.ts');
    const afterDuplicates = f.read('ledger.json').sources['rockstar-youtube'];
    assert.equal(afterDuplicates.score, prior);
    assert.equal(afterDuplicates.rejected, 6);
    assert.equal(afterDuplicates.approvalRate, 0);
    f.write('pending.json', { version: 1, updatedAt: '', pending: [], rejected: [
      ...rejected, { ...rejected[0], id: 'wrong-claim', reasonCategory: 'incorrect' },
    ] });
    f.run('ledger.ts');
    assert.ok(f.read('ledger.json').sources['rockstar-youtube'].score < prior);
  } finally { f.remove(); }
});
