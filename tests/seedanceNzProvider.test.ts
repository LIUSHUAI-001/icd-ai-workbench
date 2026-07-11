import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';

const require = createRequire(import.meta.url);
const seedanceNz = require('../backend/src/providers/seedanceNz.js');

test('seedance.nz keeps TLS verification enabled with the pinned official root', () => {
  const source = readFileSync(new URL('../backend/src/providers/seedanceNz.js', import.meta.url), 'utf8');

  assert.match(source, /LETS_ENCRYPT_ROOT_YR/);
  assert.match(source, /rejectUnauthorized:\s*true/);
  assert.doesNotMatch(source, /rejectUnauthorized:\s*false/);
});

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

test('seedance.nz derives all 18 official model IDs from family and task type', () => {
  const families = [
    'standard', 'fast', 'mini',
    'global-standard', 'global-fast', 'global-mini',
  ];
  const taskTypes = ['t2v', 'i2v', 'multi'];
  const models = families.flatMap((family) => taskTypes.map((taskType) => (
    seedanceNz.resolveModel(family, taskType)
  )));

  assert.equal(new Set(models).size, 18);
  assert.ok(models.includes('seedance-2.0-standard-t2v'));
  assert.ok(models.includes('seedance-2.0-global-mini-multi'));
});

test('seedance.nz builds i2v payload with official images field and normalized native4k', async () => {
  seedanceNz.resetCachesForTests();
  const built = await seedanceNz.buildPayload({
    model: 'standard',
    prompt: 'A calm camera move',
    duration: 5,
    ratio: '16:9',
    resolution: 'native4K',
    firstFrame: 'https://assets.example.com/first.png',
    lastFrame: 'https://assets.example.com/last.png',
  }, 'test-key', { uploadIntervalMs: 0 });

  assert.equal(built.taskType, 'i2v');
  assert.equal(built.model, 'seedance-2.0-standard-i2v');
  assert.deepEqual(built.payload.images, [
    'https://assets.example.com/first.png',
    'https://assets.example.com/last.png',
  ]);
  assert.equal(built.payload.metadata.resolution, 'native4k');
  assert.equal(built.payload.seconds, '5');
  assert.equal('content' in built.payload.metadata, false);
});

test('seedance.nz uploads one image, one video and one audio then builds multi content', async () => {
  seedanceNz.resetCachesForTests();
  const uploads: Array<{ url: string; body: FormData }> = [];
  let uploadIndex = 0;
  const fetchImpl = async (url: string, init?: RequestInit) => {
    assert.match(url, /\/v1\/files\/upload$/);
    assert.ok(init?.body instanceof FormData);
    uploads.push({ url, body: init.body as FormData });
    uploadIndex += 1;
    return jsonResponse({ url: `https://cdn.example.com/ref-${uploadIndex}` });
  };

  const tinyPng = 'data:image/png;base64,iVBORw0KGgo=';
  const tinyMp4 = 'data:video/mp4;base64,AAAAHGZ0eXBpc29t';
  const tinyMp3 = 'data:audio/mpeg;base64,SUQzAwAAAAA=';
  const built = await seedanceNz.buildPayload({
    model: 'global-mini',
    prompt: 'Use @image_1, @VIDEO-1 and @audio1 together',
    duration: 4,
    ratio: 'adaptive',
    resolution: '480p',
    generate_audio: false,
    refImages: [tinyPng],
    videos: [tinyMp4],
    audios: [tinyMp3],
  }, 'test-key', { fetchImpl, uploadIntervalMs: 0 });

  assert.equal(uploads.length, 3);
  assert.equal(built.taskType, 'multi');
  assert.equal(built.model, 'seedance-2.0-global-mini-multi');
  assert.equal(built.payload.prompt, 'Use @Image 1, @Video 1 and @Audio 1 together');
  assert.deepEqual(built.payload.metadata.content, [
    { type: 'image_url', image_url: { url: 'https://cdn.example.com/ref-1' } },
    { type: 'video_url', video_url: { url: 'https://cdn.example.com/ref-2' } },
    { type: 'audio_url', audio_url: { url: 'https://cdn.example.com/ref-3' } },
  ]);
});

test('seedance.nz rejects mixed first-frame and multi-reference payloads', async () => {
  await assert.rejects(
    seedanceNz.buildPayload({
      model: 'mini',
      prompt: 'invalid mixed mode',
      firstFrame: 'https://assets.example.com/first.png',
      audios: ['https://assets.example.com/audio.mp3'],
    }, 'test-key'),
    /不能同时混入参考图、视频或音频/,
  );
});

test('seedance.nz submit and query use official endpoints and normalize completed output', async () => {
  const calls: Array<{ url: string; init?: RequestInit }> = [];
  const fetchImpl = async (url: string, init?: RequestInit) => {
    calls.push({ url, init });
    if (url.endsWith('/v1/videos')) return jsonResponse({ id: 'task-123', status: 'queued' });
    return jsonResponse({ status: 'completed', progress: 100, metadata: { url: 'https://cdn.example.com/result.mp4' } });
  };

  const submitted = await seedanceNz.submitTask({
    model: 'mini',
    prompt: 'minimal test',
    duration: 4,
    ratio: '16:9',
    resolution: '480p',
  }, 'test-key', { baseUrl: 'https://api.seedance.nz', fetchImpl });
  const queried = await seedanceNz.queryTask('task-123', 'test-key', {
    baseUrl: 'https://api.seedance.nz',
    fetchImpl,
  });

  assert.equal(submitted.taskId, 'task-123');
  assert.equal(submitted.model, 'seedance-2.0-mini-t2v');
  assert.equal(calls[0].url, 'https://api.seedance.nz/v1/videos');
  assert.equal(calls[1].url, 'https://api.seedance.nz/v1/videos/task-123');
  assert.equal(queried.status, 'succeeded');
  assert.equal(queried.videoUrl, 'https://cdn.example.com/result.mp4');
});

test('seedance.nz builds official Seedream t2i and i2i payloads without mixing video fields', async () => {
  seedanceNz.resetCachesForTests();
  const t2i = await seedanceNz.buildImagePayload({
    prompt: 'a blue ceramic cup on a white table',
    resolution: '2k',
    output_format: 'png',
  }, 'test-key');

  assert.equal(t2i.model, 'seedream-v5-pro-t2i');
  assert.equal(t2i.taskType, 't2i');
  assert.deepEqual(t2i.payload, {
    model: 'seedream-v5-pro-t2i',
    prompt: 'a blue ceramic cup on a white table',
    metadata: { resolution: '2k', output_format: 'png' },
  });

  const fetchImpl = async (url: string, init?: RequestInit) => {
    assert.match(url, /\/v1\/files\/upload$/);
    assert.ok(init?.body instanceof FormData);
    return jsonResponse({ url: 'https://cdn.example.com/reference.png' });
  };
  const i2i = await seedanceNz.buildImagePayload({
    prompt: 'change the cup to glossy red',
    images: ['data:image/png;base64,iVBORw0KGgo='],
    size: '1280x960',
    output_format: 'jpeg',
  }, 'test-key', { fetchImpl, uploadIntervalMs: 0 });

  assert.equal(i2i.model, 'seedream-v5-pro-i2i');
  assert.equal(i2i.taskType, 'i2i');
  assert.deepEqual(i2i.payload, {
    model: 'seedream-v5-pro-i2i',
    prompt: 'change the cup to glossy red',
    images: ['https://cdn.example.com/reference.png'],
    metadata: { width: 1280, height: 960, output_format: 'jpeg' },
  });
  assert.equal('seconds' in i2i.payload, false);
});

test('seedance.nz Seedream submit and query use the documented image endpoints', async () => {
  const calls: Array<{ url: string; init?: RequestInit }> = [];
  const fetchImpl = async (url: string, init?: RequestInit) => {
    calls.push({ url, init });
    if (url.endsWith('/v1/image/generations')) {
      return jsonResponse({ id: 'image-task-123', task_id: 'image-task-123', status: 'queued' });
    }
    return jsonResponse({
      code: 'success',
      data: {
        task_id: 'image-task-123',
        status: 'SUCCESS',
        progress: '100%',
        result_url: 'https://cdn.example.com/result.png',
      },
    });
  };

  const submitted = await seedanceNz.submitImageTask({
    prompt: 'a minimal product photograph',
    resolution: '1k',
  }, 'test-key', { baseUrl: 'https://api.seedance.nz', fetchImpl });
  const queried = await seedanceNz.queryImageTask(submitted.taskId, 'test-key', {
    baseUrl: 'https://api.seedance.nz',
    fetchImpl,
  });

  assert.equal(calls[0].url, 'https://api.seedance.nz/v1/image/generations');
  assert.equal(calls[1].url, 'https://api.seedance.nz/v1/image/generations/image-task-123');
  assert.equal(submitted.model, 'seedream-v5-pro-t2i');
  assert.equal(queried.status, 'succeeded');
  assert.equal(queried.imageUrl, 'https://cdn.example.com/result.png');
});
