import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  SEEDANCE_NZ_MODEL_OPTIONS,
  SEEDANCE_NZ_RATIO_OPTIONS,
  SEEDANCE_NZ_NATIVE_RESOLUTION_OPTIONS,
} from '../src/config/seedance.ts';

const read = (relative: string) => readFileSync(new URL(relative, import.meta.url), 'utf8');

test('Seedance shared frontend catalog exposes six families that expand to 18 task models', () => {
  assert.equal(SEEDANCE_NZ_MODEL_OPTIONS.length, 6);
  assert.deepEqual(SEEDANCE_NZ_RATIO_OPTIONS, ['16:9', '9:16', '1:1', '4:3', '3:4', '21:9', 'adaptive']);
  assert.ok(SEEDANCE_NZ_NATIVE_RESOLUTION_OPTIONS.includes('native4k'));
});

test('new SD2 and director nodes default to automatic main API while old data stays legacy-compatible', () => {
  const canvas = read('../src/components/Canvas.tsx');
  const seedanceNode = read('../src/components/nodes/SeedanceNode.tsx');
  const directorNode = read('../src/components/nodes/DirectorStoryboardNode.tsx');

  assert.match(canvas, /seedance:\s*\{[\s\S]*seedanceApiSource: 'auto'[\s\S]*seedanceNzModel: 'fast'/);
  assert.match(canvas, /'director-storyboard':\s*\{[\s\S]*seedanceApiSource: 'auto'[\s\S]*seedanceNzModel: 'fast'/);
  assert.match(seedanceNode, /savedBuiltinSource[\s\S]*: 'zhenzhen-legacy'/);
  assert.match(directorNode, /savedBuiltinSource[\s\S]*: 'zhenzhen-legacy'/);
});

test('SD2 node exposes built-in provider choices and preserves provider during polling', () => {
  const node = read('../src/components/nodes/SeedanceNode.tsx');
  const generation = read('../src/services/generation.ts');

  assert.match(node, /主力 API（自动：优先贞贞 SD2）/);
  assert.match(node, /贞贞 SD2 · api\.seedance\.nz/);
  assert.match(node, /旧贞贞工坊 · ai\.t8star\.org/);
  assert.match(node, /taskProvider: builtinSource/);
  assert.match(node, /querySeedance\(tid, taskProvider\)/);
  assert.match(node, /lastTaskProvider/);
  assert.match(generation, /taskProvider=\$\{encodeURIComponent\(taskProvider\)\}/);
});

test('proxy routes seedance.nz independently and immediately stores completed output locally', () => {
  const proxy = read('../backend/src/routes/proxy.js');
  const settings = read('../backend/src/routes/settings.js');

  assert.match(proxy, /requestedTaskProvider === seedanceNz\.PROVIDER_ID/);
  assert.match(proxy, /seedanceNz\.submitTask/);
  assert.match(proxy, /seedanceNz\.queryTask/);
  assert.match(proxy, /saveRemoteVideo\(videoUrl, seedanceNz\.fetchRemote\)/);
  assert.match(proxy, /provider: 'zhenzhen-legacy'/);
  assert.match(settings, /zhenzhenSd2ApiKey/);
  assert.match(settings, /zhenzhenSd2BaseUrl: config\.ZHENZHEN_SD2_BASE_URL/);
});
