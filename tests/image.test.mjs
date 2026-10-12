import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { generateImage } from '../crazyrouter-image-gen/scripts/main.mjs';

const args = { prompt: 'a square', output: 'image.png' };
function fixture(result, { endpoint = 'image-generation', downloadStatus = 200, apiStatus = 200 } = {}) {
  const calls = [], writes = [];
  return { calls, writes, options: {
    apiKey: 'test-secret',
    writeFile: async (...values) => writes.push(values),
    fetch: async (url, init = {}) => {
      calls.push({ url: String(url), init });
      if (String(url).endsWith('/api/pricing')) return Response.json({ data: [{ model_name: 'gpt-image-2', public_endpoint_types: [endpoint] }] });
      if (String(url).endsWith('/images/generations')) return Response.json(result, { status: apiStatus });
      return new Response(new Uint8Array([1, 2, 3]), { status: downloadStatus });
    }
  } };
}
test('writes base64 bytes and authenticates only generation', async () => {
  const f = fixture({ data: [{ b64_json: 'AQID' }] });
  assert.equal((await generateImage(args, f.options)).bytes, 3);
  assert.deepEqual(f.writes[0], ['image.png', Buffer.from([1, 2, 3])]);
  assert.equal(f.calls[0].init.headers, undefined);
  assert.equal(f.calls[1].init.headers.Authorization, 'Bearer test-secret');
  assert.deepEqual(JSON.parse(f.calls[1].init.body), { model: 'gpt-image-2', prompt: 'a square', n: 1 });
});
test('downloads URL output without forwarding API credentials', async () => {
  const f = fixture({ data: [{ url: 'https://images.example/result.png' }] });
  await generateImage(args, f.options);
  assert.equal(f.calls[2].init.headers, undefined);
  assert.equal(f.writes[0][1].length, 3);
});
test('rejects unsupported protocol model before billable request', async () => {
  const f = fixture({}, { endpoint: 'video-generation' });
  await assert.rejects(generateImage(args, f.options), /native task models/);
  assert.equal(f.calls.length, 1);
});
test('rejects multiple images and malformed base URL before network', async () => {
  const f = fixture({});
  await assert.rejects(generateImage({ ...args, n: 2 }, f.options), /n=1/);
  await assert.rejects(generateImage(args, { ...f.options, baseURL: 'https://example.com/v1?utm_source=github' }), /without query/);
  assert.equal(f.calls.length, 0);
});
test('rejects empty output, API failure, and failed downloads without writing', async () => {
  for (const f of [fixture({ data: [] }), fixture({}, { apiStatus: 400 }), fixture({ data: [{ url: 'https://images.example/no.png' }] }, { downloadStatus: 404 })]) {
    await assert.rejects(generateImage(args, f.options));
    assert.equal(f.writes.length, 0);
  }
});
test('retired helpers fail and installer excludes them', () => {
  for (const name of ['video', 'music']) {
    const p = spawnSync(process.execPath, [`crazyrouter-${name}-gen/scripts/main.mjs`, '--prompt', 'test'], { encoding: 'utf8' });
    assert.equal(p.status, 1); assert.match(p.stderr, /retired|removed|unsupported|unavailable/i);
  }
  const p = spawnSync(process.execPath, ['bin/cli.mjs', 'list'], { encoding: 'utf8' });
  assert.equal(p.status, 0); assert.doesNotMatch(p.stdout, /crazyrouter-(video|music)-gen/);
});
test('uninstall rejects path traversal before filesystem changes', () => {
  const p = spawnSync(process.execPath, ['bin/cli.mjs', 'uninstall', '../../outside'], { encoding: 'utf8' });
  assert.equal(p.status, 1); assert.match(p.stderr, /Unknown skill/);
});
