import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  buildBatchTagPrompt,
  buildBatchTagSidecarNames,
  classifyBatchTagFile,
  parseBatchTagOutput,
  recommendedBatchTagModel,
  type BatchTagMode,
  type BatchTagMediaKind,
} from '../src/utils/batchTagger.ts';

const require = createRequire(import.meta.url);

function read(rel: string) {
  return readFileSync(new URL(`../${rel}`, import.meta.url), 'utf8');
}

test('batch tagger utilities classify image/video files and keep sidecar names aligned to source prefixes', () => {
  assert.equal(classifyBatchTagFile('portrait.PNG', 'image/png'), 'image');
  assert.equal(classifyBatchTagFile('clip.webm', ''), 'video');
  assert.equal(classifyBatchTagFile('notes.txt', 'text/plain'), null);

  assert.deepEqual(
    buildBatchTagSidecarNames({
      name: '角色 01.final.png',
      relativePath: 'sets/角色 01.final.png',
      formats: ['txt', 'json'],
    }),
    {
      txt: 'sets/角色_01.final.txt',
      json: 'sets/角色_01.final.json',
    },
  );

  assert.equal(
    buildBatchTagSidecarNames({
      name: 'clip.mp4',
      relativePath: 'video/day/clip.mp4',
      formats: ['txt'],
    }).txt,
    'video/day/clip.txt',
  );
});

test('batch tagger prompt and parser support tags, short captions, and structured JSON output', () => {
  const tagsPrompt = buildBatchTagPrompt({
    mode: 'tags',
    mediaKind: 'image',
    fileName: 'demo.png',
    language: 'zh-CN',
    maxTags: 12,
  });
  assert.match(tagsPrompt, /逗号分隔/);
  assert.match(tagsPrompt, /最多 12 个/);
  assert.match(tagsPrompt, /不要输出 Markdown/);
  assert.equal(
    buildBatchTagPrompt({
      mode: 'tags',
      mediaKind: 'image',
      customPrompt: '只输出英文训练标签',
    }),
    '只输出英文训练标签',
  );

  const videoPrompt = buildBatchTagPrompt({
    mode: 'json',
    mediaKind: 'video',
    fileName: 'clip.mp4',
    language: 'zh-CN',
    maxTags: 20,
  });
  assert.match(videoPrompt, /segments/);
  assert.match(videoPrompt, /audioUnsupported/);

  assert.deepEqual(parseBatchTagOutput('cat, blue eyes, blue eyes, studio light', 'tags'), {
    text: 'cat, blue eyes, studio light',
    tags: ['cat', 'blue eyes', 'studio light'],
    caption: '',
    shortCaption: '',
    metadata: null,
    rawText: 'cat, blue eyes, blue eyes, studio light',
  });

  assert.equal(parseBatchTagOutput('一只蓝眼猫坐在窗边', 'short').shortCaption, '一只蓝眼猫坐在窗边');

  const parsedJson = parseBatchTagOutput('```json\n{"tags":["cat"],"caption":"a cat","segments":[]}\n```', 'json');
  assert.deepEqual(parsedJson.tags, ['cat']);
  assert.equal(parsedJson.caption, 'a cat');
  assert.equal(parsedJson.metadata?.caption, 'a cat');

  const wrappedJson = parseBatchTagOutput('结果如下：\n{"tags":["cup"],"caption":"blue cup","segments":[]}\n请保存。', 'json');
  assert.deepEqual(wrappedJson.tags, ['cup']);
  assert.equal(wrappedJson.caption, 'blue cup');
});

test('batch tagger recommends ModelScope Qwen3-VL 235B for visual tagging', () => {
  assert.equal(
    recommendedBatchTagModel({
      providerSource: 'modelscope',
      requestedModel: '',
      mediaKind: 'image',
      chatModels: ['Qwen/Qwen3-235B-A22B', 'Qwen/Qwen3-VL-235B-A22B-Instruct'],
    }),
    'Qwen/Qwen3-VL-235B-A22B-Instruct',
  );
  assert.equal(
    recommendedBatchTagModel({
      providerSource: 'modelscope',
      requestedModel: 'Qwen/Qwen3-235B-A22B',
      mediaKind: 'video',
      chatModels: ['Qwen/Qwen3-235B-A22B', 'Qwen/Qwen3-VL-235B-A22B-Instruct'],
    }),
    'Qwen/Qwen3-VL-235B-A22B-Instruct',
  );
  assert.equal(
    recommendedBatchTagModel({
      providerSource: 'zhenzhen',
      requestedModel: '',
      mediaKind: 'image',
    }),
    'gpt-4o-mini',
  );
});

test('batch tagger node is registered as an image/video toolbox node with UI and feature metadata', () => {
  const registry = read('src/config/nodeRegistry.ts');
  const ports = read('src/config/portTypes.ts');
  const types = read('src/types/canvas.ts');
  const canvas = read('src/components/Canvas.tsx');
  const actionBar = read('src/components/NodeActionBar.tsx');
  const loop = read('src/components/nodes/LoopNode.tsx');
  const placement = read('src/utils/nodePlacement.ts');
  const server = read('backend/src/server.js');
  const postBuild = read('electron/_post_build.cjs');
  const node = read('src/components/nodes/BatchTaggerNode.tsx');
  const features = read('features.json');

  assert.match(registry, /type:\s*'batch-tagger'[\s\S]*label:\s*'批量打标'[\s\S]*category:\s*'toolbox'/);
  assert.match(ports, /'batch-tagger':\s*\{\s*inputs:\s*\['image',\s*'video',\s*'text'\],\s*outputs:\s*\['text',\s*'metadata'\]\s*\}/);
  assert.match(types, /\|\s*'batch-tagger'/);
  assert.match(canvas, /const BatchTaggerNode = lazyCanvasNode\(\(\) => import\('\.\/nodes\/BatchTaggerNode'\)/);
  assert.match(canvas, /'batch-tagger':\s*BatchTaggerNode/);
  assert.match(canvas, /'batch-tagger':\s*\{[\s\S]*batchTagMode:\s*'tags'/);
  assert.match(actionBar, /'batch-tagger'/);
  assert.match(loop, /'aggregate-parser',\s*'batch-processor',\s*'batch-tagger'/);
  assert.match(placement, /'batch-tagger':\s*\{\s*w:\s*720,\s*h:\s*620\s*\}/);
  assert.match(server, /batchTagsRouter/);
  assert.match(postBuild, /routes',\s*'batchTags\.t8c'/);
  assert.match(features, /"nodeType":\s*"batch-tagger"/);
  assert.match(node, /Qwen\/Qwen3-VL-235B-A22B-Instruct/);
  assert.match(node, /webkitdirectory/);
  assert.match(node, /停止/);
  assert.match(node, /output\/batch-tags/);
  assert.match(node, /gridTemplateColumns:\s*'minmax\(0, 1fr\) 300px'/);
  assert.match(node, /gridTemplateColumns:\s*'14px 38px minmax\(0, 1fr\) 64px'/);
  assert.match(node, /upstream\.texts/);
  assert.match(node, /已使用上游文本/);
  assert.doesNotMatch(node, /batchTagMode:\s*event\.target\.value\.trim\(\)\s*\?/);
});

test('batch tagger route helpers build provider messages and write same-prefix txt/json sidecars', async () => {
  const route = require('../backend/src/routes/batchTags.js');
  assert.equal(typeof route.buildBatchTagMessages, 'function');
  assert.equal(typeof route.writeBatchTagSidecars, 'function');
  assert.match(read('backend/src/routes/batchTags.js'), /clientGone/);

  const modes: BatchTagMode[] = ['tags', 'caption', 'short', 'json'];
  const kinds: BatchTagMediaKind[] = ['image', 'video'];
  assert.equal(modes.includes('json') && kinds.includes('video'), true);

  const messages = route.buildBatchTagMessages({
    item: {
      kind: 'video',
      url: '/files/input/clip.mp4',
      name: 'clip.mp4',
    },
    mode: 'json',
    model: 'Qwen/Qwen3-VL-235B-A22B-Instruct',
    videoMode: 'frames',
    frameCount: 8,
  });
  assert.equal(messages[0].role, 'user');
  assert.equal(messages[0].content.some((part: any) => part.type === 'video_url'), true);
  assert.match(messages[0].content[0].text, /JSON/);

  const dir = mkdtempSync(join(tmpdir(), 't8-batch-tags-'));
  try {
    const saved = route.writeBatchTagSidecars({
      outputRoot: dir,
      item: { name: '角色 01.png', relativePath: 'setA/角色 01.png' },
      parsed: {
        text: 'cat, blue eyes',
        tags: ['cat', 'blue eyes'],
        caption: 'a cat',
        shortCaption: '',
        metadata: { tags: ['cat'], caption: 'a cat' },
        rawText: 'cat, blue eyes',
      },
      formats: ['txt', 'json'],
      overwrite: false,
    });

    assert.equal(saved.length, 2);
    assert.equal(saved[0].name, 'setA/角色_01.txt');
    assert.equal(saved[1].name, 'setA/角色_01.json');
    assert.match(readFileSync(saved[0].path, 'utf8'), /cat, blue eyes/);
    assert.equal(JSON.parse(readFileSync(saved[1].path, 'utf8')).sourceFile, '角色 01.png');
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
