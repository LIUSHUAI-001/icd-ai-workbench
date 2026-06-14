export type AnimeTagOutputMode = 'tags' | 'image';
export type AnimeTagSource = 'builtin' | 'custom' | 'danbooru' | 'gelbooru';

export interface AnimeTagCategory {
  id: string;
  name: string;
  description?: string;
  builtIn?: boolean;
}

export interface AnimeTagItem {
  id: string;
  name: string;
  chineseName: string;
  categoryId: string;
  categoryName: string;
  tags: readonly string[];
  prompt: string;
  negativePrompt?: string;
  source: AnimeTagSource;
  imageUrl?: string;
  thumbnailUrl?: string;
  sourceUrl?: string;
  attributes?: string;
  postCount?: number;
  userCreated?: boolean;
}

export interface AnimeTagSearchOptions {
  query?: string;
  category?: string;
  source?: string;
  limit?: number;
}

export interface AnimeTagUserLibrary {
  categories: AnimeTagCategory[];
  items: AnimeTagItem[];
}

export interface AnimeTagMaterialInput {
  imageUrl: string;
  title?: string;
  prompt: string;
  negativePrompt?: string;
  categoryName?: string;
  tags?: string[];
  sourceNodeId?: string;
}

export interface AnimeTagOutputPayload {
  kind: 'text' | 'image';
  data: {
    directOutputText: string;
    outputText: string;
    prompt: string;
    text: string;
    directImageUrl?: string;
    imageUrl?: string;
    directImageUrls?: string[];
    imageUrls?: string[];
    lastPrompt?: string;
    animeTagId?: string;
    animeTagName?: string;
    animeTagChineseName?: string;
    animeTags?: string[];
  };
}

export interface AnimeTagExportPack extends AnimeTagUserLibrary {
  schema: typeof ANIME_TAG_MASTER_EXPORT_SCHEMA;
  exportedAt: string;
}

export interface AnimeTagOnlineProvider {
  id: 'danbooru' | 'gelbooru';
  label: string;
  aliases: string[];
  categories: readonly string[];
}

export type AnimeTagOnlineProviderInput = AnimeTagOnlineProvider['id'] | 'galbooru' | 'gel' | 'dan' | string;

export interface OnlineSearchOptions {
  category?: string;
  limit?: number;
  safe?: boolean;
  signal?: AbortSignal;
}

export const ANIME_TAG_MASTER_STORAGE_KEY = 't8-anime-tag-master:user-library:v1';
export const ANIME_TAG_MASTER_EXPORT_SCHEMA = 't8-anime-tag-master@1';
export const ANIME_TAG_MASTER_EVENT = 'penguin:anime-tag-master-changed';

export const ANIME_TAG_ONLINE_PROVIDERS: readonly AnimeTagOnlineProvider[] = [
  {
    id: 'danbooru',
    label: 'Danbooru',
    aliases: ['danbooru', 'dan'],
    categories: ['artist', 'copyright', 'character', 'general', 'meta'],
  },
  {
    id: 'gelbooru',
    label: 'Gelbooru / Galbooru',
    aliases: ['gelbooru', 'galbooru', 'gel'],
    categories: ['artist', 'copyright', 'character', 'general'],
  },
];

const COLLATOR = new Intl.Collator('zh-Hans-CN');

export function normalizeAnimeTagProvider(provider: AnimeTagOnlineProviderInput): AnimeTagOnlineProvider['id'] {
  const value = textOf(provider).toLowerCase();
  if (value === 'gelbooru' || value === 'galbooru' || value === 'gel') return 'gelbooru';
  if (value === 'danbooru' || value === 'dan') return 'danbooru';
  return 'danbooru';
}

function textOf(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function uniqueStrings(values: unknown[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  values.forEach((value) => {
    const item = textOf(value);
    if (!item) return;
    const key = item.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    result.push(item);
  });
  return result;
}

function simpleHash(value: string): string {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = ((hash << 5) - hash + value.charCodeAt(i)) | 0;
  }
  return Math.abs(hash).toString(36);
}

function splitTags(value: string): string[] {
  return uniqueStrings(
    value
      .replace(/\n+/g, ',')
      .split(/[,\s，、]+/)
      .map((item) => item.trim())
      .filter(Boolean),
  );
}

function fileNameFromUrl(url: string): string {
  try {
    const parsed = url.startsWith('http') ? new URL(url) : new URL(url, 'http://local');
    return decodeURIComponent(parsed.pathname.split('/').pop() || '') || 'anime-tag';
  } catch {
    return url.split(/[\\/]/).pop()?.split(/[?#]/)[0] || 'anime-tag';
  }
}

function stripExtension(value: string): string {
  return value.replace(/\.[a-z0-9]{2,8}$/i, '').trim();
}

export function slugifyAnimeTag(value: string): string {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug || 'anime-tag';
}

export function normalizeAnimeTagItem(input: Partial<AnimeTagItem> & { name?: string }): AnimeTagItem {
  const name = textOf(input.name) || 'anime tag';
  const chineseName = textOf(input.chineseName) || name;
  const categoryName = textOf(input.categoryName) || '未分类';
  const categoryId = textOf(input.categoryId) || slugifyAnimeTag(categoryName);
  const prompt = textOf(input.prompt) || uniqueStrings([...(Array.isArray(input.tags) ? input.tags : []), name]).join(', ');
  const tags = uniqueStrings([
    ...(Array.isArray(input.tags) ? input.tags : []),
    ...splitTags(prompt),
    name,
    chineseName,
    categoryName,
  ]);

  return {
    id: textOf(input.id) || `${slugifyAnimeTag(name)}-${simpleHash(`${name}\n${prompt}`)}`,
    name,
    chineseName,
    categoryId,
    categoryName,
    tags,
    prompt,
    negativePrompt: textOf(input.negativePrompt),
    source: input.source || 'custom',
    imageUrl: textOf(input.imageUrl),
    thumbnailUrl: textOf(input.thumbnailUrl) || textOf(input.imageUrl),
    sourceUrl: textOf(input.sourceUrl),
    attributes: textOf(input.attributes),
    postCount: Number.isFinite(input.postCount) ? Number(input.postCount) : undefined,
    userCreated: input.userCreated ?? input.source === 'custom',
  };
}

export function normalizeAnimeTagLibrary(input: Partial<AnimeTagUserLibrary> | null | undefined): AnimeTagUserLibrary {
  const categories = Array.isArray(input?.categories)
    ? input.categories
        .map((item) => ({
          id: textOf(item?.id) || slugifyAnimeTag(textOf(item?.name)),
          name: textOf(item?.name) || textOf(item?.id) || '未分类',
          description: textOf(item?.description),
          builtIn: Boolean(item?.builtIn),
        }))
        .filter((item) => item.id && item.name)
    : [];
  const items = Array.isArray(input?.items)
    ? input.items
        .map((item) => normalizeAnimeTagItem(item))
        .filter((item) => item.name && item.tags.length)
    : [];

  return {
    categories: dedupeCategories(categories),
    items: dedupeItems(items),
  };
}

function dedupeCategories(categories: AnimeTagCategory[]): AnimeTagCategory[] {
  const byId = new Map<string, AnimeTagCategory>();
  categories.forEach((item) => byId.set(item.id, item));
  return Array.from(byId.values()).sort((a, b) => COLLATOR.compare(a.name, b.name));
}

function dedupeItems(items: AnimeTagItem[]): AnimeTagItem[] {
  const byId = new Map<string, AnimeTagItem>();
  items.forEach((item) => byId.set(item.id, item));
  return Array.from(byId.values()).sort((a, b) => COLLATOR.compare(a.chineseName || a.name, b.chineseName || b.name));
}

export function searchAnimeTags(items: readonly AnimeTagItem[], options: AnimeTagSearchOptions = {}): AnimeTagItem[] {
  const query = textOf(options.query).toLowerCase();
  const terms = query.split(/\s+/).filter(Boolean);
  const category = textOf(options.category);
  const source = textOf(options.source);
  const limit = Number.isFinite(options.limit) ? Math.max(1, Number(options.limit)) : undefined;

  const matches = items
    .filter((item) => {
      if (category && category !== 'all' && item.categoryId !== category && item.categoryName !== category) return false;
      if (source && source !== 'all' && item.source !== source) return false;
      if (!terms.length) return true;
      const haystack = [
        item.name,
        item.chineseName,
        item.categoryId,
        item.categoryName,
        item.prompt,
        item.negativePrompt,
        item.attributes,
        item.source,
        ...item.tags,
      ].join(' ').toLowerCase();
      return terms.every((term) => haystack.includes(term));
    })
    .sort((a, b) => {
      const scoreA = (a.source === 'builtin' ? 0 : 1) + (a.imageUrl ? 0 : 0.4);
      const scoreB = (b.source === 'builtin' ? 0 : 1) + (b.imageUrl ? 0 : 0.4);
      return scoreA - scoreB || COLLATOR.compare(a.chineseName || a.name, b.chineseName || b.name);
    });

  return typeof limit === 'number' ? matches.slice(0, limit) : matches;
}

export function buildAnimeTagPrompt(item: AnimeTagItem): string {
  const tags = uniqueStrings(item.tags as string[]).join(', ');
  return [
    `Anime tag reference: ${item.name} (${item.chineseName})`,
    `中文分类: ${item.categoryName}`,
    `Tags: ${tags}`,
    item.prompt ? `Prompt: ${item.prompt}` : '',
    item.negativePrompt ? `Negative prompt: ${item.negativePrompt}` : '',
    item.attributes ? `Attributes: ${item.attributes}` : '',
  ].filter(Boolean).join('\n');
}

export function buildAnimeTagTextOutputPayload(item: AnimeTagItem): AnimeTagOutputPayload {
  const prompt = buildAnimeTagPrompt(item);
  return {
    kind: 'text',
    data: {
      directOutputText: prompt,
      outputText: prompt,
      prompt,
      text: prompt,
      lastPrompt: prompt,
      animeTagId: item.id,
      animeTagName: item.name,
      animeTagChineseName: item.chineseName,
      animeTags: [...item.tags],
    },
  };
}

export function buildAnimeTagImageOutputPayload(item: AnimeTagItem): AnimeTagOutputPayload {
  const prompt = buildAnimeTagPrompt(item);
  const imageUrl = getAnimeTagFullImageUrl(item);
  return {
    kind: 'image',
    data: {
      directOutputText: prompt,
      outputText: prompt,
      prompt,
      text: prompt,
      lastPrompt: prompt,
      directImageUrl: imageUrl,
      imageUrl,
      directImageUrls: imageUrl ? [imageUrl] : [],
      imageUrls: imageUrl ? [imageUrl] : [],
      animeTagId: item.id,
      animeTagName: item.name,
      animeTagChineseName: item.chineseName,
      animeTags: [...item.tags],
    },
  };
}

export function buildAnimeTagOutputPayload(item: AnimeTagItem, mode: AnimeTagOutputMode): AnimeTagOutputPayload {
  return mode === 'image' ? buildAnimeTagImageOutputPayload(item) : buildAnimeTagTextOutputPayload(item);
}

export function createAnimeTagFromMaterial(input: AnimeTagMaterialInput): AnimeTagItem {
  const imageUrl = textOf(input.imageUrl);
  const prompt = textOf(input.prompt);
  const title = stripExtension(textOf(input.title) || fileNameFromUrl(imageUrl));
  const categoryName = textOf(input.categoryName) || '素材收藏';
  const tags = uniqueStrings([
    ...(Array.isArray(input.tags) ? input.tags : []),
    ...splitTags(prompt),
    categoryName,
    textOf(input.sourceNodeId),
  ]);

  return normalizeAnimeTagItem({
    id: `material-${slugifyAnimeTag(title)}-${simpleHash(`${imageUrl}\n${prompt}`)}`,
    name: title || 'anime-reference',
    chineseName: title || '动漫参考',
    categoryId: slugifyAnimeTag(categoryName),
    categoryName,
    tags,
    prompt,
    negativePrompt: input.negativePrompt,
    source: 'custom',
    imageUrl,
    thumbnailUrl: imageUrl,
    attributes: '从画布素材右键保存的动漫标签参考',
    userCreated: true,
  });
}

export function createAnimeTagExport(library: AnimeTagUserLibrary): AnimeTagExportPack {
  const normalized = normalizeAnimeTagLibrary(library);
  return {
    schema: ANIME_TAG_MASTER_EXPORT_SCHEMA,
    exportedAt: new Date().toISOString(),
    ...normalized,
  };
}

export function importAnimeTagExport(input: unknown): AnimeTagUserLibrary {
  const candidate = input as Partial<AnimeTagExportPack> | null | undefined;
  if (!candidate || candidate.schema !== ANIME_TAG_MASTER_EXPORT_SCHEMA) {
    throw new Error('不是有效的动漫标签大师导出文件');
  }
  return normalizeAnimeTagLibrary(candidate);
}

export function mergeAnimeTagLibraries(base: AnimeTagUserLibrary, incoming: AnimeTagUserLibrary): AnimeTagUserLibrary {
  return normalizeAnimeTagLibrary({
    categories: [...base.categories, ...incoming.categories],
    items: [...base.items, ...incoming.items],
  });
}

export function upsertAnimeTagInLibrary(
  library: AnimeTagUserLibrary,
  item: AnimeTagItem,
  category?: AnimeTagCategory,
): AnimeTagUserLibrary {
  const categories = category ? [...library.categories, category] : library.categories;
  const items = library.items.map((current) => (current.id === item.id ? item : current));
  if (!items.some((current) => current.id === item.id)) items.push(item);
  return normalizeAnimeTagLibrary({ categories, items });
}

function withSafeTag(query: string, safe: boolean | undefined): string {
  const value = query.trim();
  if (!safe) return value;
  return /\brating:/i.test(value) ? value : `${value} rating:general`;
}

export function buildDanbooruPostsUrl(query: string, options: OnlineSearchOptions = {}): string {
  const tags = encodeURIComponent(withSafeTag(query || '1girl', options.safe !== false));
  const limit = Math.max(1, Math.min(Number(options.limit || 12), 20));
  return `https://danbooru.donmai.us/posts.json?tags=${tags}&limit=${limit}&only=id,tag_string,large_file_url,file_url,preview_file_url,source,rating,score`;
}

export function buildGelbooruPostsUrl(query: string, options: OnlineSearchOptions = {}): string {
  const tags = encodeURIComponent(withSafeTag(query || '1girl', options.safe !== false));
  const limit = Math.max(1, Math.min(Number(options.limit || 12), 20));
  return `https://gelbooru.com/index.php?page=dapi&s=post&q=index&json=1&pid=0&tags=${tags}&limit=${limit}`;
}

export function buildAnimeTagProxySearchUrl(
  provider: AnimeTagOnlineProviderInput,
  query: string,
  options: OnlineSearchOptions = {},
): string {
  const normalizedProvider = normalizeAnimeTagProvider(provider);
  const params = new URLSearchParams({
    provider: normalizedProvider,
    q: query || '1girl',
    limit: String(Math.max(1, Math.min(Number(options.limit || 12), 20))),
    safe: options.safe === false ? '0' : '1',
  });
  return `/api/anime-tags/search?${params.toString()}`;
}

export function normalizeAnimeTagPreviewQuery(value: string): string {
  const first = textOf(value)
    .replace(/^@+/, '')
    .replace(/^artist:/i, '')
    .replace(/\([^)]*\)/g, ' ')
    .split(/[,\n，、]/)
    .map((item) => item.trim())
    .find(Boolean) || '';
  return first
    .replace(/:[0-9.]+$/g, '')
    .replace(/\s+/g, '_')
    .replace(/^_+|_+$/g, '');
}

export function pickAnimeTagPreviewQuery(item?: AnimeTagItem | null): string {
  if (!item) return '';
  const candidates = uniqueStrings([
    ...(Array.isArray(item.tags) ? item.tags : []),
    item.name,
    item.prompt,
    item.chineseName,
  ]);
  for (const candidate of candidates) {
    const normalized = normalizeAnimeTagPreviewQuery(candidate);
    if (normalized && !/[\u4e00-\u9fa5]/.test(normalized)) return normalized;
  }
  return normalizeAnimeTagPreviewQuery(item.name || '1girl') || '1girl';
}

export function buildAnimeTagPreviewUrl(
  provider: AnimeTagOnlineProviderInput,
  query: string,
  options: OnlineSearchOptions = {},
): string {
  const normalizedProvider = normalizeAnimeTagProvider(provider);
  const params = new URLSearchParams({
    provider: normalizedProvider,
    q: normalizeAnimeTagPreviewQuery(query) || '1girl',
    safe: options.safe === false ? '0' : '1',
  });
  return `/api/anime-tags/preview?${params.toString()}`;
}

export function buildAnimeTagLivePreviewImageUrl(
  provider: AnimeTagOnlineProviderInput,
  query: string,
  options: OnlineSearchOptions = {},
): string {
  const normalizedProvider = normalizeAnimeTagProvider(provider);
  const params = new URLSearchParams({
    provider: normalizedProvider,
    q: normalizeAnimeTagPreviewQuery(query) || '1girl',
    safe: options.safe === false ? '0' : '1',
  });
  return `/api/anime-tags/preview-image?${params.toString()}`;
}

function normalizeRemoteImageUrl(value: unknown): string {
  const url = textOf(value);
  if (!url) return '';
  if (url.startsWith('//')) return `https:${url}`;
  return url;
}

function escapeSvgText(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function shortLabel(value: string, max = 20): string {
  const text = value.trim();
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

function categoryPreviewColors(categoryId: string) {
  const palettes: Record<string, { a: string; b: string; c: string }> = {
    character: { a: '#22d3ee', b: '#a78bfa', c: '#f472b6' },
    pose: { a: '#fb923c', b: '#facc15', c: '#34d399' },
    expression: { a: '#f472b6', b: '#fde047', c: '#60a5fa' },
    outfit: { a: '#38bdf8', b: '#c084fc', c: '#fb7185' },
    composition: { a: '#2dd4bf', b: '#60a5fa', c: '#facc15' },
    style: { a: '#a78bfa', b: '#f0abfc', c: '#22d3ee' },
    lighting: { a: '#f59e0b', b: '#fde68a', c: '#38bdf8' },
    quality: { a: '#34d399', b: '#fbbf24', c: '#818cf8' },
    negative: { a: '#94a3b8', b: '#475569', c: '#f87171' },
  };
  return palettes[categoryId] || { a: '#22c55e', b: '#38bdf8', c: '#facc15' };
}

export function buildAnimeTagProxyImageUrl(imageUrl: string): string {
  const url = normalizeRemoteImageUrl(imageUrl);
  if (!url) return '';
  if (url.startsWith('/api/anime-tags/image?') || url.startsWith('/api/anime-tags/preview-image?')) return url;
  if (!/^https?:\/\//i.test(url)) return url;
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.toLowerCase();
    const supported = hostname === 'cdn.donmai.us'
      || hostname === 'danbooru.donmai.us'
      || hostname === 'gelbooru.com'
      || hostname.endsWith('.donmai.us')
      || hostname.endsWith('.gelbooru.com');
    return supported ? `/api/anime-tags/image?u=${encodeURIComponent(parsed.toString())}` : url;
  } catch {
    return url;
  }
}

export function shouldUseAnimeTagLivePreview(item?: AnimeTagItem | null): boolean {
  if (!item) return false;
  if (textOf(item.thumbnailUrl) || textOf(item.imageUrl)) return false;
  return item.source !== 'custom';
}

function livePreviewProviderFor(item: AnimeTagItem): AnimeTagOnlineProvider['id'] {
  return normalizeAnimeTagProvider(item.source === 'gelbooru' ? 'gelbooru' : 'danbooru');
}

export function createAnimeTagPreviewFallbackSvg(item?: Pick<AnimeTagItem, 'name' | 'chineseName' | 'categoryId' | 'categoryName' | 'tags'> | null): string {
  const name = shortLabel(textOf(item?.name) || 'anime tag', 24);
  const chineseName = shortLabel(textOf(item?.chineseName) || name, 16);
  const category = shortLabel(textOf(item?.categoryName) || '动漫标签', 12);
  const tagLines = uniqueStrings(Array.isArray(item?.tags) ? [...item.tags] : [])
    .slice(0, 5)
    .map((tag) => shortLabel(tag.replace(/_/g, ' '), 17));
  const colors = categoryPreviewColors(textOf(item?.categoryId));
  const chips = tagLines.map((tag, index) => {
    const y = 238 + index * 32;
    const width = Math.min(252, Math.max(96, tag.length * 11 + 34));
    return `<g opacity="${index > 3 ? '0.74' : '0.92'}"><rect x="38" y="${y}" width="${width}" height="22" rx="11" fill="rgba(255,255,255,0.16)" stroke="rgba(255,255,255,0.22)"/><text x="52" y="${y + 16}" font-size="13" fill="#eaf6ff">${escapeSvgText(tag)}</text></g>`;
  }).join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="360" height="360" viewBox="0 0 360 360">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#08111f"/>
      <stop offset="0.48" stop-color="${colors.a}"/>
      <stop offset="1" stop-color="#101827"/>
    </linearGradient>
    <linearGradient id="chip" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="${colors.b}"/>
      <stop offset="1" stop-color="${colors.c}"/>
    </linearGradient>
    <pattern id="dots" width="22" height="22" patternUnits="userSpaceOnUse">
      <circle cx="3" cy="3" r="1.4" fill="rgba(255,255,255,0.3)"/>
    </pattern>
  </defs>
  <rect width="360" height="360" rx="22" fill="url(#bg)"/>
  <rect width="360" height="360" rx="22" fill="url(#dots)" opacity="0.55"/>
  <circle cx="282" cy="72" r="58" fill="${colors.c}" opacity="0.28"/>
  <circle cx="78" cy="292" r="88" fill="#020617" opacity="0.28"/>
  <g transform="translate(58 58)" opacity="0.96">
    <rect x="32" y="0" width="72" height="72" rx="12" fill="${colors.a}" stroke="#eaf6ff" stroke-width="4"/>
    <rect x="106" y="0" width="72" height="72" rx="12" fill="${colors.b}" stroke="#eaf6ff" stroke-width="4"/>
    <rect x="69" y="74" width="72" height="72" rx="12" fill="${colors.c}" stroke="#eaf6ff" stroke-width="4"/>
    <rect x="143" y="74" width="72" height="72" rx="12" fill="#111827" stroke="#eaf6ff" stroke-width="4" opacity="0.86"/>
  </g>
  <rect x="28" y="184" width="304" height="38" rx="19" fill="url(#chip)" opacity="0.94"/>
  <text x="180" y="210" text-anchor="middle" font-size="21" font-weight="800" fill="#07111f">${escapeSvgText(chineseName)}</text>
  <text x="30" y="38" font-size="15" font-weight="800" fill="#ecfeff">${escapeSvgText(category)}</text>
  <text x="30" y="332" font-size="15" font-weight="800" fill="#eaf6ff" opacity="0.9">${escapeSvgText(name)}</text>
  ${chips}
</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export function getAnimeTagPreviewImageUrl(item?: AnimeTagItem | null): string {
  if (!item) return '';
  const imageUrl = textOf(item.thumbnailUrl) || textOf(item.imageUrl);
  if (imageUrl) return buildAnimeTagProxyImageUrl(imageUrl);
  if (shouldUseAnimeTagLivePreview(item)) {
    return buildAnimeTagLivePreviewImageUrl(livePreviewProviderFor(item), pickAnimeTagPreviewQuery(item), { safe: true });
  }
  return createAnimeTagPreviewFallbackSvg(item);
}

export function getAnimeTagFullImageUrl(item?: AnimeTagItem | null): string {
  if (!item) return '';
  const imageUrl = textOf(item.imageUrl) || textOf(item.thumbnailUrl);
  if (imageUrl) return buildAnimeTagProxyImageUrl(imageUrl);
  if (shouldUseAnimeTagLivePreview(item)) {
    return buildAnimeTagLivePreviewImageUrl(livePreviewProviderFor(item), pickAnimeTagPreviewQuery(item), { safe: true });
  }
  return createAnimeTagPreviewFallbackSvg(item);
}

export function extractGelbooruPostRecords(data: any, key = 'post'): any[] {
  if (Array.isArray(data)) return data.filter((item) => item && typeof item === 'object');
  if (!data || typeof data !== 'object') return [];
  const direct = data[key];
  if (Array.isArray(direct)) return direct.filter((item) => item && typeof item === 'object');
  if (direct && typeof direct === 'object') return [direct];
  const plural = data[`${key}s`];
  if (Array.isArray(plural)) return plural.filter((item) => item && typeof item === 'object');
  if (plural && typeof plural === 'object') {
    const nested = plural[key];
    if (Array.isArray(nested)) return nested.filter((item) => item && typeof item === 'object');
    if (nested && typeof nested === 'object') return [nested];
  }
  if (key === 'post' && (data.file_url || data.preview_url || data.sample_url)) return [data];
  return [];
}

export function mapDanbooruPostToAnimeTagItem(post: any, query: string): AnimeTagItem {
  const tags = splitTags(String(post?.tag_string || query || 'danbooru'));
  const imageUrl = normalizeRemoteImageUrl(post?.large_file_url || post?.file_url || post?.preview_file_url);
  const thumb = normalizeRemoteImageUrl(post?.preview_file_url || imageUrl);
  const name = tags.slice(0, 3).join(', ') || `danbooru-${post?.id || Date.now()}`;
  return normalizeAnimeTagItem({
    id: `danbooru-${post?.id || simpleHash(`${name}\n${imageUrl}`)}`,
    name,
    chineseName: `Danbooru ${name}`,
    categoryId: 'online-danbooru',
    categoryName: '在线图库 Danbooru',
    tags,
    prompt: tags.join(', '),
    source: 'danbooru',
    imageUrl,
    thumbnailUrl: thumb,
    sourceUrl: textOf(post?.source) || (post?.id ? `https://danbooru.donmai.us/posts/${post.id}` : ''),
    attributes: `Danbooru lazy preview · score ${post?.score ?? '-'}`,
    postCount: undefined,
    userCreated: false,
  });
}

export function mapGelbooruPostToAnimeTagItem(post: any, query: string): AnimeTagItem {
  const tags = splitTags(String(post?.tags || query || 'gelbooru'));
  const imageUrl = normalizeRemoteImageUrl(post?.file_url || post?.sample_url || post?.preview_url);
  const thumb = normalizeRemoteImageUrl(post?.preview_url || post?.sample_url || imageUrl);
  const idValue = post?.id || simpleHash(`${tags.join(',')}\n${imageUrl}`);
  const name = tags.slice(0, 3).join(', ') || `gelbooru-${idValue}`;
  return normalizeAnimeTagItem({
    id: `gelbooru-${idValue}`,
    name,
    chineseName: `Gelbooru ${name}`,
    categoryId: 'online-gelbooru',
    categoryName: '在线图库 Gelbooru',
    tags,
    prompt: tags.join(', '),
    source: 'gelbooru',
    imageUrl,
    thumbnailUrl: thumb,
    sourceUrl: post?.id ? `https://gelbooru.com/index.php?page=post&s=view&id=${post.id}` : '',
    attributes: `Gelbooru lazy preview · score ${post?.score ?? '-'}`,
    userCreated: false,
  });
}

export async function searchOnlineAnimeTags(
  provider: AnimeTagOnlineProviderInput,
  query: string,
  options: OnlineSearchOptions = {},
): Promise<AnimeTagItem[]> {
  const normalizedProvider = normalizeAnimeTagProvider(provider);
  const proxyUrl = buildAnimeTagProxySearchUrl(normalizedProvider, query, options);
  let proxyError: Error | null = null;
  try {
    const proxyResponse = await fetch(proxyUrl, {
      signal: options.signal,
      headers: { Accept: 'application/json' },
    });
    if (proxyResponse.ok) {
      const payload = await proxyResponse.json();
      const items = Array.isArray(payload?.data?.items) ? payload.data.items : [];
      return items
        .map((row: any) => normalizeAnimeTagItem(row))
        .filter((item: AnimeTagItem) => item.imageUrl || item.tags.length);
    }
    let message = `本地在线图库代理 HTTP ${proxyResponse.status}`;
    try {
      const payload = await proxyResponse.json();
      message = payload?.error || message;
    } catch {
      /* ignore */
    }
    proxyError = new Error(message);
  } catch (error: any) {
    proxyError = error instanceof Error ? error : new Error(String(error || '本地在线图库代理不可用'));
  }

  const url = normalizedProvider === 'gelbooru'
    ? buildGelbooruPostsUrl(query, options)
    : buildDanbooruPostsUrl(query, options);
  try {
    const response = await fetch(url, {
      signal: options.signal,
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) {
      throw new Error(`${normalizedProvider} HTTP ${response.status}`);
    }
    const data = await response.json();
    const rows = normalizedProvider === 'gelbooru'
      ? extractGelbooruPostRecords(data, 'post')
      : (Array.isArray(data) ? data : []);
    return rows
      .map((row: any) => (normalizedProvider === 'gelbooru'
        ? mapGelbooruPostToAnimeTagItem(row, query)
        : mapDanbooruPostToAnimeTagItem(row, query)))
      .filter((item: AnimeTagItem) => item.imageUrl || item.tags.length);
  } catch (error: any) {
    const directMessage = error?.message || `${normalizedProvider} 在线图库加载失败`;
    if (proxyError) throw new Error(`${proxyError.message}；直连也失败：${directMessage}`);
    throw new Error(directMessage);
  }
}
