const express = require('express');
const fs = require('fs');
const path = require('path');
const config = require('../config');
const settingsRouter = require('./settings');
const { normalizeAdvancedProviders, maskAdvancedProviders } = require('../providers/registry');
const { generateChatWithProvider } = require('../providers/adapters');

const router = express.Router();

const DEFAULT_TIMEOUT_MS = 30 * 60 * 1000;
const DEFAULT_ZHENZHEN_MODEL = 'gpt-4o-mini';
const MODELSCOPE_QWEN3_VL_235B = 'Qwen/Qwen3-VL-235B-A22B-Instruct';
const MODELSCOPE_QWEN3_TEXT_235B = 'Qwen/Qwen3-235B-A22B';
const SIDE_FORMATS = new Set(['txt', 'json']);

function cleanText(value, maxLen = 4000) {
  return String(value || '').replace(/\s+/g, ' ').trim().slice(0, maxLen);
}

function mediaKind(value) {
  const kind = String(value || '').trim().toLowerCase();
  return kind === 'video' ? 'video' : 'image';
}

function sidecarFormats(value) {
  const raw = Array.isArray(value) ? value : String(value || 'txt,json').split(/[,，\s]+/);
  const out = [];
  for (const item of raw) {
    const format = String(item || '').trim().toLowerCase();
    if (SIDE_FORMATS.has(format) && !out.includes(format)) out.push(format);
  }
  return out.length ? out : ['txt'];
}

function sanitizePathPart(value, fallback = 'item') {
  const cleaned = String(value || '')
    .trim()
    .replace(/[<>:"/\\|?*\x00-\x1f\x7f]/g, '_')
    .replace(/\s+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^\.+$/, '')
    .slice(0, 160);
  return cleaned || fallback;
}

function splitSourceName(value) {
  const raw = String(value || 'batch-item').split(/[\\/]/).pop() || 'batch-item';
  const ext = path.extname(raw);
  return {
    base: ext ? raw.slice(0, -ext.length) : raw,
    ext,
  };
}

function buildSidecarNames(item = {}, formats = ['txt']) {
  const relative = String(item.relativePath || item.name || 'batch-item').replace(/\\/g, '/');
  const parts = relative.split('/').filter(Boolean);
  const fileName = parts.pop() || item.name || 'batch-item';
  const { base } = splitSourceName(fileName);
  const safeDirs = parts
    .filter((part) => part !== '.' && part !== '..')
    .map((part) => sanitizePathPart(part, 'folder'));
  const prefix = safeDirs.length ? `${safeDirs.join('/')}/` : '';
  const safeBase = sanitizePathPart(base, 'batch-item');
  return Object.fromEntries(
    sidecarFormats(formats).map((format) => [format, `${prefix}${safeBase}.${format}`]),
  );
}

function stripCodeFence(value) {
  return String(value || '')
    .trim()
    .replace(/^```(?:json|JSON|txt|text)?\s*/i, '')
    .replace(/```$/i, '')
    .trim();
}

function extractJsonObjectText(value) {
  const text = String(value || '').trim();
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start >= 0 && end > start) return text.slice(start, end + 1);
  return text;
}

function normalizeTags(value, maxTags = 200) {
  const raw = Array.isArray(value) ? value : String(value || '').split(/[,，;；\n]/);
  const out = [];
  const seen = new Set();
  for (const item of raw) {
    const tag = String(item || '').trim().replace(/\s+/g, ' ');
    const key = tag.toLowerCase();
    if (!tag || seen.has(key)) continue;
    seen.add(key);
    out.push(tag);
    if (out.length >= maxTags) break;
  }
  return out;
}

function parseBatchTagOutput(rawText, mode = 'tags') {
  const raw = String(rawText || '').trim();
  const clean = stripCodeFence(raw);
  let metadata = null;
  if (mode === 'json') {
    try {
      const parsed = JSON.parse(clean);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) metadata = parsed;
    } catch {
      try {
        const parsed = JSON.parse(extractJsonObjectText(clean));
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) metadata = parsed;
      } catch {
        metadata = null;
      }
    }
  }
  const tags = normalizeTags(metadata?.tags ?? (mode === 'tags' ? clean : []));
  const caption = String(metadata?.caption || (mode === 'caption' ? clean : '')).trim();
  const shortCaption = String(metadata?.shortCaption || metadata?.short_caption || (mode === 'short' ? clean : '')).trim();
  return {
    text: mode === 'tags' ? tags.join(', ') : mode === 'caption' ? caption : mode === 'short' ? shortCaption : clean,
    tags,
    caption,
    shortCaption,
    metadata,
    rawText: raw,
  };
}

function buildBatchTagPrompt(options = {}) {
  if (cleanText(options.customPrompt, 8000)) return cleanText(options.customPrompt, 8000);
  const mode = String(options.mode || 'tags').trim();
  const kind = mediaKind(options.mediaKind);
  const fileName = cleanText(options.fileName, 240);
  const maxTags = Math.max(1, Math.min(200, Math.round(Number(options.maxTags) || 30)));
  const base = [
    `你是训练素材批量打标助手。请严格根据当前${kind === 'video' ? '视频' : '图像'}可见内容输出。`,
    fileName ? `素材文件名：${fileName}` : '',
    '输出语言：中文，必要的训练标签可保留英文通用 tag。',
    '不要编造不可见主体、人物身份、品牌或文字；不要输出 Markdown 解释。',
  ].filter(Boolean);
  if (mode === 'caption') return [...base, '输出一段自然语言描述，只输出描述正文。'].join('\n');
  if (mode === 'short') return [...base, '输出一句 8-30 字短句 caption，只输出短句正文。'].join('\n');
  if (mode === 'json') {
    return [
      ...base,
      `输出严格 JSON，不要 Markdown。字段：{"tags":[],"caption":"","shortCaption":"","segments":[],"confidence":0,"audioUnsupported":false}。tags 最多 ${maxTags} 个。`,
      kind === 'video'
        ? '视频必须包含 segments 数组；如果无法理解音轨，设置 audioUnsupported: true。'
        : '图像的 segments 使用空数组。',
    ].join('\n');
  }
  return [...base, `输出逗号分隔 TAG，最多 ${maxTags} 个。不要编号。`].join('\n');
}

function buildBatchTagMessages(input = {}) {
  const item = input.item || {};
  const kind = mediaKind(item.kind || input.mediaKind);
  const prompt = cleanText(input.prompt, 8000) || buildBatchTagPrompt({
    mode: input.mode,
    mediaKind: kind,
    fileName: item.name,
    maxTags: input.maxTags,
    customPrompt: input.customPrompt,
  });
  const url = String(item.url || item.imageUrl || item.videoUrl || '').trim();
  const content = [{ type: 'text', text: prompt }];
  if (url) {
    if (kind === 'video') content.push({ type: 'video_url', video_url: { url } });
    else content.push({ type: 'image_url', image_url: { url } });
  }
  return [{ role: 'user', content }];
}

function resolveBatchTagModel(provider, input = {}, kind = 'image') {
  const requested = cleanText(input.model || input.providerModel, 240);
  if (provider?.protocol === 'modelscope' && (kind === 'image' || kind === 'video')) {
    const models = Array.isArray(provider.chatModels) ? provider.chatModels : [];
    const hasVl = !models.length || models.includes(MODELSCOPE_QWEN3_VL_235B);
    if ((!requested || requested === MODELSCOPE_QWEN3_TEXT_235B) && hasVl) return MODELSCOPE_QWEN3_VL_235B;
  }
  return requested || provider?.defaults?.chatModel || provider?.chatModels?.[0] || DEFAULT_ZHENZHEN_MODEL;
}

function ensureInside(root, target) {
  const resolvedRoot = path.resolve(root);
  const resolvedTarget = path.resolve(target);
  if (resolvedTarget !== resolvedRoot && !resolvedTarget.startsWith(resolvedRoot + path.sep)) {
    throw new Error('输出路径不安全。');
  }
  return resolvedTarget;
}

function uniqueFilePath(root, name, overwrite = false) {
  const parsed = path.parse(name);
  let currentName = name;
  let currentPath = ensureInside(root, path.join(root, currentName));
  if (overwrite || !fs.existsSync(currentPath)) return { name: currentName, path: currentPath };
  for (let index = 2; index < 10000; index += 1) {
    currentName = path.join(parsed.dir, `${parsed.name}-${index}${parsed.ext}`).replace(/\\/g, '/');
    currentPath = ensureInside(root, path.join(root, currentName));
    if (!fs.existsSync(currentPath)) return { name: currentName, path: currentPath };
  }
  throw new Error('无法生成不冲突的输出文件名。');
}

function buildJsonPayload({ item = {}, parsed = {}, providerId = '', model = '', mode = 'tags' } = {}) {
  return {
    sourceFile: item.name || '',
    sourceUrl: item.url || '',
    relativePath: item.relativePath || '',
    mediaType: item.kind || '',
    providerId,
    model,
    mode,
    tags: Array.isArray(parsed.tags) ? parsed.tags : [],
    caption: parsed.caption || '',
    shortCaption: parsed.shortCaption || '',
    text: parsed.text || '',
    rawText: parsed.rawText || '',
    metadata: parsed.metadata || null,
    createdAt: new Date().toISOString(),
  };
}

function writeBatchTagSidecars(input = {}) {
  const outputRoot = path.resolve(input.outputRoot || path.join(config.OUTPUT_DIR, 'batch-tags'));
  fs.mkdirSync(outputRoot, { recursive: true });
  const formats = sidecarFormats(input.formats);
  const names = buildSidecarNames(input.item, formats);
  const saved = [];
  for (const format of formats) {
    const name = names[format];
    if (!name) continue;
    const target = uniqueFilePath(outputRoot, name, input.overwrite === true);
    fs.mkdirSync(path.dirname(target.path), { recursive: true });
    const payload = format === 'json'
      ? `${JSON.stringify(buildJsonPayload(input), null, 2)}\n`
      : `${input.parsed?.text || input.parsed?.caption || input.parsed?.shortCaption || input.parsed?.tags?.join(', ') || input.parsed?.rawText || ''}\n`;
    fs.writeFileSync(target.path, payload, 'utf8');
    saved.push({
      format,
      name: target.name.replace(/\\/g, '/'),
      path: target.path,
      url: `/files/output/batch-tags/${target.name.replace(/\\/g, '/')}`,
    });
  }
  return saved;
}

function maskedProvider(provider) {
  return maskAdvancedProviders([provider])[0] || null;
}

function zhenzhenProvider(settings, requestedModel) {
  if (!settings?.llmApiKey) {
    return {
      ok: false,
      code: 'missing_llm_api_key',
      error: '未配置 LLM 独立 API Key，请先在 API 设置里填写。',
    };
  }
  const model = cleanText(requestedModel, 240) || DEFAULT_ZHENZHEN_MODEL;
  return {
    ok: true,
    provider: {
      id: 'zhenzhen',
      label: 'LLM 独立 Key',
      protocol: 'openai-compatible',
      baseUrl: `${config.ZHENZHEN_BASE_URL.replace(/\/+$/, '')}/v1`,
      enabled: true,
      apiKey: settings.llmApiKey,
      chatModels: [model],
      defaults: { chatModel: model },
    },
  };
}

function resolveAdvancedProvider(body, providers) {
  const providerId = cleanText(body.providerId || body.provider_id, 80);
  if (body.provider && typeof body.provider === 'object') {
    const normalized = normalizeAdvancedProviders([body.provider], providers);
    const id = cleanText(body.provider.id, 80);
    return normalized.find((provider) => provider.id === id) || normalized[0] || null;
  }
  return providers.find((provider) => provider.id === providerId) || null;
}

function resolveBatchTagProvider(body, settings) {
  const source = cleanText(body.providerSource || body.provider_source || body.providerId, 80).toLowerCase();
  if (!source || source === 'zhenzhen') return zhenzhenProvider(settings, body.model || body.providerModel);
  const providers = normalizeAdvancedProviders(settings.advancedProviders);
  const provider = resolveAdvancedProvider(body, providers);
  if (!provider) {
    return { ok: false, code: 'provider_not_found', error: '未找到扩展平台配置。' };
  }
  if (!provider.enabled) {
    return { ok: false, code: 'provider_disabled', error: '扩展平台未启用，请先在 API 设置中启用。', provider };
  }
  return { ok: true, provider };
}

router.post('/tag', async (req, res) => {
  let clientGone = false;
  req.on('aborted', () => { clientGone = true; });
  res.on('close', () => {
    if (!res.writableEnded) clientGone = true;
  });
  try {
    const body = req.body || {};
    const item = body.item && typeof body.item === 'object' ? body.item : {};
    const kind = mediaKind(item.kind || body.mediaKind);
    const url = String(item.url || item.imageUrl || item.videoUrl || '').trim();
    if (!url) {
      return res.status(400).json({ success: false, code: 'missing_media', error: '请提供要打标的图像或视频素材。' });
    }

    const settings = settingsRouter.loadSettings({ persistMigrations: false });
    const resolved = resolveBatchTagProvider(body, settings);
    if (!resolved.ok) {
      return res.status(400).json({
        success: false,
        code: resolved.code,
        error: resolved.error,
        data: resolved.provider ? { provider: maskedProvider(resolved.provider) } : undefined,
      });
    }

    const model = resolveBatchTagModel(resolved.provider, body, kind);
    const messages = buildBatchTagMessages({
      item: { ...item, kind, url },
      mode: body.mode || body.batchTagMode || 'tags',
      model,
      maxTags: body.maxTags,
      customPrompt: body.customPrompt,
      prompt: body.prompt,
    });

    const result = await generateChatWithProvider(resolved.provider, {
      model,
      messages,
      temperature: body.temperature ?? 0.2,
      maxTokens: body.maxTokens || body.max_tokens || 1200,
      llmVideoMode: body.videoMode || body.llmVideoMode || 'frames',
      videoFrameCount: body.frameCount || body.videoFrameCount || 8,
      videoMaxWidth: body.videoMaxWidth || 720,
      videoMaxHeight: body.videoMaxHeight || 720,
      videoMaxBase64Mb: body.videoMaxBase64Mb || 8,
      videoCrf: body.videoCrf || 32,
    }, {
      timeoutMs: Number(body.timeoutMs) || DEFAULT_TIMEOUT_MS,
      baseUrl: `http://127.0.0.1:${config.PORT}`,
    });
    if (clientGone) return undefined;
    if (!result.ok) {
      return res.status(502).json({
        success: false,
        code: result.code || 'batch_tag_failed',
        error: result.error || '打标 API 调用失败。',
        data: { provider: maskedProvider(resolved.provider), raw: result.raw },
      });
    }

    const mode = body.mode || body.batchTagMode || 'tags';
    const parsed = parseBatchTagOutput(result.text || '', mode);
    if (clientGone) return undefined;
    const outputFiles = body.save === false
      ? []
      : writeBatchTagSidecars({
        outputRoot: path.join(config.OUTPUT_DIR, 'batch-tags'),
        item: { ...item, kind, url },
        parsed,
        formats: body.formats || body.outputFormats || ['txt', 'json'],
        overwrite: body.overwrite === true,
        providerId: resolved.provider.id,
        model,
        mode,
      });

    return res.json({
      success: true,
      data: {
        text: parsed.text,
        tags: parsed.tags,
        caption: parsed.caption,
        shortCaption: parsed.shortCaption,
        metadata: parsed.metadata,
        rawText: parsed.rawText,
        outputFiles,
        provider: maskedProvider(resolved.provider),
        model,
        videoMode: body.videoMode || body.llmVideoMode || 'frames',
        raw: result.raw,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      code: 'batch_tag_error',
      error: error?.message || String(error),
    });
  }
});

module.exports = router;
module.exports.buildBatchTagMessages = buildBatchTagMessages;
module.exports.buildBatchTagPrompt = buildBatchTagPrompt;
module.exports.parseBatchTagOutput = parseBatchTagOutput;
module.exports.resolveBatchTagModel = resolveBatchTagModel;
module.exports.writeBatchTagSidecars = writeBatchTagSidecars;
module.exports.buildSidecarNames = buildSidecarNames;
