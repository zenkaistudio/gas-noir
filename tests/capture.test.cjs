// Tests for js/capture.js — the lead capture used by the booking, contact and opt-in forms.
// Run: node --test tests/
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { create } = require(path.join(__dirname, '..', 'js', 'capture.js'));

function memStore() {
  const m = new Map();
  return { getItem: k => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: k => m.delete(k) };
}
function fakeFetch(...replies) {
  const calls = [];
  const fn = async (url, opts) => {
    calls.push({ url, opts, body: JSON.parse(opts.body) });
    const r = replies.length > 1 ? replies.shift() : replies[0];
    if (r === 'network') throw new TypeError('Failed to fetch');
    return { status: r, ok: r >= 200 && r < 300 };
  };
  fn.calls = calls;
  return fn;
}
const base = (fetch, storage = memStore()) =>
  create({ url: 'https://x.supabase.co', key: 'pub_123', table: 'site_requests', fetch, storage, page: '/book' });

test('posts the request to the Supabase REST table with the publishable key', async () => {
  const f = fakeFetch(201);
  await base(f).submit('booking', { name: 'Ada', email: 'ada@example.com', message: 'hi' });
  assert.equal(f.calls.length, 1);
  assert.equal(f.calls[0].url, 'https://x.supabase.co/rest/v1/site_requests');
  assert.equal(f.calls[0].opts.method, 'POST');
  assert.equal(f.calls[0].opts.headers.apikey, 'pub_123');
  assert.equal(f.calls[0].opts.headers.Authorization, 'Bearer pub_123');
  assert.deepEqual(
    { kind: f.calls[0].body.kind, name: f.calls[0].body.name, email: f.calls[0].body.email, page: f.calls[0].body.page },
    { kind: 'booking', name: 'Ada', email: 'ada@example.com', page: '/book' });
  assert.match(f.calls[0].body.id, /^[0-9a-f-]{36}$/);
});

test('a saved request reports ok and leaves nothing queued', async () => {
  const c = base(fakeFetch(201));
  assert.deepEqual(await c.submit('booking', { email: 'a@b.co' }), { ok: true });
  assert.equal(c.queued(), 0);
});

test('a network failure keeps the request on the device instead of losing it', async () => {
  const c = base(fakeFetch('network'));
  assert.deepEqual(await c.submit('booking', { email: 'a@b.co' }), { ok: false, queued: true });
  assert.equal(c.queued(), 1);
});

test('a server error keeps the request queued', async () => {
  const c = base(fakeFetch(503));
  assert.deepEqual(await c.submit('contact', { email: 'a@b.co' }), { ok: false, queued: true });
  assert.equal(c.queued(), 1);
});

test('a duplicate (409) counts as saved, so a retry can never double-book', async () => {
  const c = base(fakeFetch(409));
  assert.deepEqual(await c.submit('booking', { email: 'a@b.co' }), { ok: true });
  assert.equal(c.queued(), 0);
});

test('a request the server rejects as invalid is not retried forever', async () => {
  const c = base(fakeFetch(400));
  assert.deepEqual(await c.submit('booking', { email: 'nope' }), { ok: false, queued: false });
  assert.equal(c.queued(), 0);
});

test('flush resends what was queued and clears what got through', async () => {
  const store = memStore();
  await base(fakeFetch('network'), store).submit('booking', { email: 'a@b.co' });
  await base(fakeFetch('network'), store).submit('contact', { email: 'c@d.co' });
  const f = fakeFetch(201, 503);
  const c = base(f, store);
  assert.equal(c.queued(), 2);
  assert.equal(await c.flush(), 1);
  assert.equal(c.queued(), 1);
  assert.equal(f.calls[0].body.email, 'a@b.co');
});

test('a retry reuses the same id, so the server can spot the duplicate', async () => {
  const store = memStore();
  const f1 = fakeFetch('network');
  await base(f1, store).submit('booking', { email: 'a@b.co' });
  const f2 = fakeFetch(201);
  await base(f2, store).flush();
  assert.equal(f2.calls[0].body.id, f1.calls[0].body.id);
});

test('a filled honeypot is dropped without contacting the server', async () => {
  const f = fakeFetch(201);
  assert.deepEqual(await base(f).submit('booking', { email: 'bot@x.co', website: 'http://spam' }), { ok: true });
  assert.equal(f.calls.length, 0);
});

test('blocked storage (private mode) does not stop the request being sent', async () => {
  const broken = { getItem() { throw new Error('denied'); }, setItem() { throw new Error('denied'); }, removeItem() {} };
  const f = fakeFetch(201);
  assert.deepEqual(await base(f, broken).submit('booking', { email: 'a@b.co' }), { ok: true });
  assert.equal(f.calls.length, 1);
});

test('unconfigured capture says so instead of pretending to send', async () => {
  const c = create({ url: '', key: '', table: 'site_requests', fetch: fakeFetch(201), storage: memStore() });
  assert.equal(c.ready, false);
  assert.deepEqual(await c.submit('booking', { email: 'a@b.co' }), { ok: false, queued: false });
});
