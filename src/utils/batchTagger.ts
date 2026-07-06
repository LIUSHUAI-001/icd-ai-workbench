export type BatchTagMediaKind = 'image' | 'video';
export type BatchTagMode = 'tags' | 'caption' | 'short' | 'json' | 'custom';
export type BatchTagSidecarFormat = 'txt' | 'json';

export interface BatchTagPromptOptions {
  mode: BatchTagMode;
  mediaKind: BatchTagMediaKind;
  fileName?: string;
  language?: string;
  maxTags?: number;
  customPrompt?: string;
}

export interface BatchTagParseResult {
  text: string;
  tags: string[];
  caption: string;
  shortCaption: string;
  metadata: Record<string, any> | null;
  rawText: string;
}

export interface BatchTagSidecarNameInput {
  name?: string;
  relativePath?: string;
  formats?: BatchTagSidecarFormat[];
}

const IMAGE_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif', '.bmp', '.avif']);
const VIDEO_EXTENSIONS = new Set(['.mp4', '.webm', '.mov', '.m4v', '.avi', '.mkv']);
const MODELSCOPE_QWEN3_VL_235B = 'Qwen/Qwen3-VL-235B-A22B-Instruct';
const MODELSCOPE_QWEN3_TEXT_235B = 'Qwen/Qwen3-235B-A22B';

function extname(value: string): string {
  const clean = String(value || '').split(/[?#]/)[0] || '';
  const slashSafe = clean.split(/[\\/]/).pop() || clean;
  const index = slashSafe.lastIndexOf('.');
  if (index <= 0) return '';
  return slashSafe.slice(index).toLowerCase();
}

function splitName(value?: string): { base: string; ext: string } {
  const raw = String(value || 'batch-item').split(/[\\/]/).pop() || 'batch-item';
  const ext = extname(raw);
  const base = ext ? raw.slice(0, -ext.length) : raw;
  return { base: base || 'batch-item', ext };
}

export function classifyBatchTagFile(fileName: string, mime = ''): BatchTagMediaKind | null {
  const normalizedMime = String(mime || '').toLowerCase();
  if (normalizedMime.startsWith('image/')) return 'image';
  if (normalizedMime.startsWith('video/')) return 'video';
  const ext = extname(fileName);
  if (IMAGE_EXTENSIONS.has(ext)) return 'image';
  if (VIDEO_EXTENSIONS.has(ext)) return 'video';
  return null;
}

export function sanitizeBatchTagPathPart(value: string, fallback = 'item'): string {
  const cleaned = String(value || '')
    .trim()
    .replace(/[<>:"/\\|?*\x00-\x1f\x7f]/g, '_')
    .replace(/\s+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^\.+$/, '')
    .slice(0, 160);
  return cleaned || fallback;
}

export function buildBatchTagSidecarNames(input: BatchTagSidecarNameInput): Partial<Record<BatchTagSidecarFormat, string>> {
  const formats = input.formats?.length ? input.formats : ['txt'];
  const relative = String(input.relativePath || input.name || 'batch-item').replace(/\\/g, '/');
  const parts = relative.split('/').filter(Boolean);
  const fileName = parts.pop() || input.name || 'batch-item';
  const { base } = splitName(fileName);
  const safeDirs = parts
    .filter((part) => part !== '.' && part !== '..')
    .map((part) => sanitizeBatchTagPathPart(part, 'folder'));
  const safeBase = sanitizeBatchTagPathPart(base, 'batch-item');
  const prefix = safeDirs.length ? `${safeDirs.join('/')}/` : '';
  const out: Partial<Record<BatchTagSidecarFormat, string>> = {};
  for (const format of formats) {
    if (format !== 'txt' && format !== 'json') continue;
    out[format] = `${prefix}${safeBase}.${format}`;
  }
  return out;
}

function modeLabel(mode: BatchTagMode): string {
  if (mode === 'caption') return '自然语言描述';
  if (mode === 'short') return '短句 caption';
  if (mode === 'json') return '标准 JSON';
  if (mode === 'custom') return '自定义格式';
  return 'TAG 标签';
}

export function buildBatchTagPrompt(options: BatchTagPromptOptions): string {
  if (String(options.customPrompt || '').trim()) {
    return String(options.customPrompt || '').trim();
  }
  const mode = options.mode || 'tags';
  const mediaText = options.mediaKind === 'video' ? '视频' : '图像';
  const fileLine = options.fileName ? `素材文件名：${options.fileName}` : '';
  const languageLine = String(options.language || 'zh-CN').toLowerCase().startsWith('en')
    ? 'Output language: English.'
    : '输出语言：中文，必要的训练标签可保留英文通用 tag。';
  const maxTags = Math.max(1, Math.min(200, Math.round(Number(options.maxTags) || 30)));
  const base = [
    `你是训练素材批量打标助手。请严格根据当前${mediaText}可见内容输出${modeLabel(mode)}。`,
    fileLine,
    languageLine,
    '不要编造不可见主体、人物身份、品牌或文字；不要输出 Markdown 解释。',
  ].filter(Boolean);

  if (mode === 'caption') {
    return [
      ...base,
      '输出一段自然语言描述，覆盖主体、场景、构图、光线、材质、色彩和风格。',
      '只输出描述正文。',
    ].join('\n');
  }
  if (mode === 'short') {
    return [
      ...base,
      '输出一句 8-30 字的短句 caption，适合作为训练集 sidecar 文本。',
      '只输出短句正文。',
    ].join('\n');
  }
  if (mode === 'json') {
    const videoFields = options.mediaKind === 'video'
      ? '视频必须包含 "segments" 数组，元素可含 start、end、caption、tags；如果无法理解音轨，设置 "audioUnsupported": true。'
      : '图像的 "segments" 使用空数组。';
    return [
      ...base,
      `输出严格 JSON，不要 Markdown。字段：{"tags":[],"caption":"","shortCaption":"","segments":[],"confidence":0,"audioUnsupported":false}。tags 最多 ${maxTags} 个。`,
      videoFields,
    ].join('\n');
  }
  return [
    ...base,
    `输出逗号分隔 TAG，最多 ${maxTags} 个。`,
    '优先输出主体、动作、场景、构图、光线、材质、色彩、风格；不要加编号。',
  ].join('\n');
}

function stripCodeFence(value: string): string {
  return String(value || '')
    .trim()
    .replace(/^```(?:json|JSON|txt|text)?\s*/i, '')
    .replace(/```$/i, '')
    .trim();
}

function extractJsonObjectText(value: string): string {
  const text = String(value || '').trim();
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start >= 0 && end > start) return text.slice(start, end + 1);
  return text;
}

export function normalizeBatchTags(values: unknown, maxTags = 200): string[] {
  const raw = Array.isArray(values)
    ? values
    : String(values || '').split(/[,，;；\n]/);
  const out: string[] = [];
  const seen = new Set<string>();
  for (const value of raw) {
    const tag = String(value || '').trim().replace(/\s+/g, ' ');
    const key = tag.toLowerCase();
    if (!tag || seen.has(key)) continue;
    seen.add(key);
    out.push(tag);
    if (out.length >= maxTags) break;
  }
  return out;
}

export function parseBatchTagOutput(rawText: string, mode: BatchTagMode): BatchTagParseResult {
  const raw = String(rawText || '').trim();
  const clean = stripCodeFence(raw);
  let metadata: Record<string, any> | null = null;
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
  const tags = normalizeBatchTags(metadata?.tags ?? (mode === 'tags' ? clean : []));
  const caption = String(metadata?.caption || (mode === 'caption' ? clean : '')).trim();
  const shortCaption = String(metadata?.shortCaption || metadata?.short_caption || (mode === 'short' ? clean : '')).trim();
  const text = mode === 'tags'
    ? tags.join(', ')
    : mode === 'short'
      ? shortCaption
      : mode === 'caption'
        ? caption
        : clean;
  return {
    text,
    tags,
    caption,
    shortCaption,
    metadata,
    rawText: raw,
  };
}

export function recommendedBatchTagModel(input: {
  providerSource?: string;
  requestedModel?: string;
  mediaKind?: BatchTagMediaKind;
  chatModels?: string[];
}): string {
  const requested = String(input.requestedModel || '').trim();
  const providerSource = String(input.providerSource || '').trim().toLowerCase();
  if (providerSource === 'modelscope' && (input.mediaKind === 'image' || input.mediaKind === 'video')) {
    const models = Array.isArray(input.chatModels) ? input.chatModels : [];
    const hasVl = models.some((model) => model === MODELSCOPE_QWEN3_VL_235B) || !models.length;
    if ((!requested || requested === MODELSCOPE_QWEN3_TEXT_235B) && hasVl) return MODELSCOPE_QWEN3_VL_235B;
  }
  if (requested) return requested;
  if (providerSource === 'zhenzhen') return 'gpt-4o-mini';
  return input.chatModels?.find((model) => String(model || '').trim()) || 'gpt-4o-mini';
}

export const BATCH_TAGGER_DEFAULT_MODEL = {
  zhenzhen: 'gpt-4o-mini',
  modelscope: MODELSCOPE_QWEN3_VL_235B,
};
