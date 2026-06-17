import type { SeedanceSubmitRequest } from '../services/generation';
import type { MediaMention, MediaMentionKind } from '../components/nodes/mediaMentions';

export type DirectorStoryboardFrameMode = 'auto' | 'first' | 'firstlast' | 'multiframe';
export type DirectorStoryboardJobKind = 'shot' | 'bridge';
export type DirectorStoryboardJobStatus = 'success' | 'error' | 'cancelled';
export type DirectorStoryboardReferenceKind = 'image' | 'video' | 'audio';
export type DirectorStoryboardBridgeSourceMode = 'auto-video' | 'manual-video' | 'manual-image';
export type DirectorStoryboardBridgeStatus =
  | 'idle'
  | 'extracting'
  | 'ready'
  | 'submitting'
  | 'polling'
  | 'success'
  | 'error'
  | 'cancelled';

export interface DirectorStoryboardMentionMaterial {
  kind: MediaMentionKind;
  url: string;
  label?: string;
  mentionKey?: string;
  mentionToken?: string;
}

export interface DirectorStoryboardReferenceItem {
  kind: DirectorStoryboardReferenceKind;
  url: string;
}

export interface DirectorStoryboardShot {
  id: string;
  title: string;
  durationSec: number;
  prompt: string;
  negativePrompt?: string;
  promptMentions?: MediaMention[];
  frameMode: DirectorStoryboardFrameMode;
  localRefImages: string[];
  localRefVideos: string[];
  localRefAudios: string[];
  localRefOrder: DirectorStoryboardReferenceItem[];
  seed?: number;
  modelOverride?: string;
  ratioOverride?: string;
  resolutionOverride?: string;
  status?: string;
  taskId?: string | null;
  videoUrl?: string | null;
  error?: string | null;
}

export interface DirectorStoryboardInputShot {
  id?: string;
  title?: string;
  durationSec?: number;
  prompt?: string;
  negativePrompt?: string;
  promptMentions?: MediaMention[];
  frameMode?: DirectorStoryboardFrameMode;
  localRefImages?: string[];
  localRefVideos?: string[];
  localRefAudios?: string[];
  localRefOrder?: DirectorStoryboardReferenceItem[];
  seed?: number;
  modelOverride?: string;
  ratioOverride?: string;
  resolutionOverride?: string;
  status?: string;
  taskId?: string | null;
  videoUrl?: string | null;
  error?: string | null;
}

export interface DirectorStoryboardBridge {
  id: string;
  fromShotId: string;
  toShotId: string;
  durationSec: number;
  prompt: string;
  sourceMode: DirectorStoryboardBridgeSourceMode;
  firstFrameUrl?: string;
  lastFrameUrl?: string;
  previousVideoUrl?: string;
  nextVideoUrl?: string;
  status?: DirectorStoryboardBridgeStatus;
  taskId?: string | null;
  videoUrl?: string | null;
  error?: string | null;
}

export interface DirectorStoryboardInputBridge {
  id?: string;
  fromShotId?: string;
  toShotId?: string;
  durationSec?: number;
  prompt?: string;
  sourceMode?: DirectorStoryboardBridgeSourceMode;
  firstFrameUrl?: string;
  lastFrameUrl?: string;
  previousVideoUrl?: string;
  nextVideoUrl?: string;
  status?: DirectorStoryboardBridgeStatus;
  taskId?: string | null;
  videoUrl?: string | null;
  error?: string | null;
}

export interface DirectorStoryboardSettings {
  model: string;
  ratio: string;
  resolution: string;
  generateAudio: boolean;
  returnLastFrame: boolean;
  watermark: boolean;
  webSearch: boolean;
  seed: number;
  bridgeEnabled?: boolean;
  bridgeDurationSec?: number;
  bridgePrompt?: string;
  providerParams?: Record<string, any>;
}

export interface BuildDirectorShotPayloadContext {
  upstreamPrompt?: string;
  mentionMaterials?: DirectorStoryboardMentionMaterial[];
  globalImages?: string[];
  globalVideos?: string[];
  globalAudios?: string[];
}

export interface DirectorStoryboardJob {
  id: string;
  shotId: string;
  order: number;
  kind: DirectorStoryboardJobKind;
  title: string;
  payload: SeedanceSubmitRequest;
}

export interface DirectorStoryboardJobResult {
  job: DirectorStoryboardJob;
  status: DirectorStoryboardJobStatus;
  videoUrl?: string;
  error?: string;
}

export interface DirectorStoryboardRunResult {
  results: DirectorStoryboardJobResult[];
  videoUrls: string[];
}

export interface DirectorStoryboardOutputResultLike {
  status?: string;
  videoUrl?: string | null;
  error?: string | null;
}

export interface DirectorStoryboardOutputItem {
  jobId: string;
  shotId: string;
  kind: DirectorStoryboardJobKind;
  order: number;
  title: string;
  prompt: string;
  durationSec: number;
  videoUrl: string;
  text: string;
}

export interface RunDirectorStoryboardJobsOptions {
  signal?: AbortSignal;
  onJobComplete?: (result: DirectorStoryboardJobResult) => void;
}

export const DIRECTOR_STORYBOARD_DEFAULT_DURATION_SEC = 5;
export const DIRECTOR_STORYBOARD_MIN_DURATION_SEC = 4;
export const DIRECTOR_STORYBOARD_MAX_DURATION_SEC = 15;
export const DIRECTOR_STORYBOARD_DEFAULT_BRIDGE_DURATION_SEC = 4;

export interface DirectorTimelineDragDurationInput {
  startDurationSec: number;
  startClientX: number;
  currentClientX: number;
  timelineWidthPx: number;
  totalDurationSec: number;
}
const TOKEN_PREFIX: Record<MediaMentionKind, string> = {
  image: 'image',
  video: 'video',
  audio: 'audio',
  text: 'text',
};
type DirectorStoryboardMediaRefKind = DirectorStoryboardReferenceKind;

const IMAGE_REF_RE = /\.(png|jpe?g|webp|gif|bmp|avif|tiff?)(?:[?#].*)?$/i;
const VIDEO_REF_RE = /\.(mp4|webm|mov|m4v|mkv|avi)(?:[?#].*)?$/i;
const AUDIO_REF_RE = /\.(mp3|wav|ogg|m4a|flac|aac)(?:[?#].*)?$/i;

function makeShotId(index: number): string {
  return `shot-${Date.now().toString(36)}-${index + 1}-${Math.random().toString(36).slice(2, 7)}`;
}

function normalizeString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function sanitizeDurationSec(value: unknown): number {
  const raw = Number(value);
  if (!Number.isFinite(raw)) return DIRECTOR_STORYBOARD_DEFAULT_DURATION_SEC;
  return Math.max(DIRECTOR_STORYBOARD_MIN_DURATION_SEC, Math.min(DIRECTOR_STORYBOARD_MAX_DURATION_SEC, Math.round(raw)));
}

function sanitizeBridgeStatus(value: unknown): DirectorStoryboardBridgeStatus {
  return value === 'extracting'
    || value === 'ready'
    || value === 'submitting'
    || value === 'polling'
    || value === 'success'
    || value === 'error'
    || value === 'cancelled'
    ? value
    : 'idle';
}

function sanitizeBridgeSourceMode(value: unknown): DirectorStoryboardBridgeSourceMode {
  return value === 'manual-video' || value === 'manual-image' ? value : 'auto-video';
}

function bridgePairId(fromShotId: string, toShotId: string): string {
  return `bridge-${fromShotId}-${toShotId}`;
}

export function calculateDirectorTimelineDragDuration(input: DirectorTimelineDragDurationInput): number {
  const totalDurationSec = Math.max(
    DIRECTOR_STORYBOARD_MIN_DURATION_SEC,
    Number.isFinite(input.totalDurationSec) ? input.totalDurationSec : DIRECTOR_STORYBOARD_DEFAULT_DURATION_SEC,
  );
  const timelineWidthPx = Math.max(1, Number.isFinite(input.timelineWidthPx) ? input.timelineWidthPx : 1);
  const pxPerSecond = Math.max(2, timelineWidthPx / totalDurationSec);
  const delta = Math.round((input.currentClientX - input.startClientX) / pxPerSecond);
  return sanitizeDurationSec(input.startDurationSec + delta);
}

function sanitizeFrameMode(value: unknown): DirectorStoryboardFrameMode {
  return value === 'first' || value === 'firstlast' || value === 'multiframe' ? value : 'auto';
}

function sanitizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return dedupeStrings(value.filter((item): item is string => typeof item === 'string').map((item) => item.trim()));
}

function referenceKey(item: DirectorStoryboardReferenceItem): string {
  return `${item.kind}:${item.url}`;
}

function sanitizeReferenceOrderInput(value: unknown): DirectorStoryboardReferenceItem[] {
  if (!Array.isArray(value)) return [];
  const refs: DirectorStoryboardReferenceItem[] = [];
  value.forEach((item) => {
    if (!item || typeof item !== 'object') return;
    const kind = (item as any).kind;
    if (kind !== 'image' && kind !== 'video' && kind !== 'audio') return;
    const url = normalizeString((item as any).url);
    if (!url) return;
    refs.push({ kind, url });
  });
  return refs;
}

function classifyDirectorStoryboardMediaRef(
  url: string,
  fallback: DirectorStoryboardMediaRefKind,
): DirectorStoryboardMediaRefKind {
  const clean = String(url || '').trim();
  if (/^data:image\//i.test(clean) || IMAGE_REF_RE.test(clean)) return 'image';
  if (/^data:video\//i.test(clean) || VIDEO_REF_RE.test(clean)) return 'video';
  if (/^data:audio\//i.test(clean) || AUDIO_REF_RE.test(clean)) return 'audio';
  return fallback;
}

function normalizeDirectorStoryboardMediaRefs(shot: DirectorStoryboardInputShot): {
  images: string[];
  videos: string[];
  audios: string[];
  order: DirectorStoryboardReferenceItem[];
} {
  const buckets: Record<DirectorStoryboardMediaRefKind, string[]> = {
    image: [],
    video: [],
    audio: [],
  };
  const collectedOrder: DirectorStoryboardReferenceItem[] = [];
  const push = (value: string, fallback: DirectorStoryboardMediaRefKind) => {
    const clean = String(value || '').trim();
    if (!clean) return;
    const kind = classifyDirectorStoryboardMediaRef(clean, fallback);
    buckets[kind].push(clean);
    collectedOrder.push({ kind, url: clean });
  };

  sanitizeStringArray(shot.localRefImages).forEach((value) => push(value, 'image'));
  sanitizeStringArray(shot.localRefVideos).forEach((value) => push(value, 'video'));
  sanitizeStringArray(shot.localRefAudios).forEach((value) => push(value, 'audio'));

  const images = dedupeStrings(buckets.image);
  const videos = dedupeStrings(buckets.video);
  const audios = dedupeStrings(buckets.audio);
  const fallbackOrder = dedupeReferenceOrder(collectedOrder).filter((item) => (
    item.kind === 'image' ? images.includes(item.url) : item.kind === 'video' ? videos.includes(item.url) : audios.includes(item.url)
  ));
  const order = mergeReferenceOrder(sanitizeReferenceOrderInput(shot.localRefOrder), fallbackOrder, { images, videos, audios });

  return { images, videos, audios, order };
}

function dedupeReferenceOrder(items: DirectorStoryboardReferenceItem[]): DirectorStoryboardReferenceItem[] {
  const seen = new Set<string>();
  const result: DirectorStoryboardReferenceItem[] = [];
  items.forEach((item) => {
    const key = referenceKey(item);
    if (!item.url || seen.has(key)) return;
    seen.add(key);
    result.push(item);
  });
  return result;
}

function mergeReferenceOrder(
  preferred: DirectorStoryboardReferenceItem[],
  fallback: DirectorStoryboardReferenceItem[],
  refs: { images: string[]; videos: string[]; audios: string[] },
): DirectorStoryboardReferenceItem[] {
  const valid = new Set<string>([
    ...refs.images.map((url) => `image:${url}`),
    ...refs.videos.map((url) => `video:${url}`),
    ...refs.audios.map((url) => `audio:${url}`),
  ]);
  const merged = dedupeReferenceOrder([...preferred, ...fallback]).filter((item) => valid.has(referenceKey(item)));
  const seen = new Set(merged.map(referenceKey));
  [
    ...refs.images.map((url) => ({ kind: 'image' as const, url })),
    ...refs.videos.map((url) => ({ kind: 'video' as const, url })),
    ...refs.audios.map((url) => ({ kind: 'audio' as const, url })),
  ].forEach((item) => {
    const key = referenceKey(item);
    if (!seen.has(key)) {
      seen.add(key);
      merged.push(item);
    }
  });
  return merged;
}

export function dedupeStrings(values: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const value of values) {
    const clean = value.trim();
    if (!clean || seen.has(clean)) continue;
    seen.add(clean);
    result.push(clean);
  }
  return result;
}

export function sanitizeDirectorStoryboardShots(input: DirectorStoryboardInputShot[]): DirectorStoryboardShot[] {
  const raw = Array.isArray(input) ? input : [];
  const source = raw.length > 0 ? raw : [{ title: 'S1', durationSec: DIRECTOR_STORYBOARD_DEFAULT_DURATION_SEC }];
  return source.map((shot, index) => {
    const title = normalizeString(shot.title) || `S${index + 1}`;
    const refs = normalizeDirectorStoryboardMediaRefs(shot);
    return {
      id: normalizeString(shot.id) || makeShotId(index),
      title,
      durationSec: sanitizeDurationSec(shot.durationSec),
      prompt: normalizeString(shot.prompt),
      negativePrompt: normalizeString(shot.negativePrompt),
      promptMentions: Array.isArray(shot.promptMentions) ? shot.promptMentions : [],
      frameMode: sanitizeFrameMode(shot.frameMode),
      localRefImages: refs.images,
      localRefVideos: refs.videos,
      localRefAudios: refs.audios,
      localRefOrder: refs.order,
      seed: typeof shot.seed === 'number' && Number.isFinite(shot.seed) ? Math.trunc(shot.seed) : undefined,
      modelOverride: normalizeString(shot.modelOverride) || undefined,
      ratioOverride: normalizeString(shot.ratioOverride) || undefined,
      resolutionOverride: normalizeString(shot.resolutionOverride) || undefined,
      status: normalizeString(shot.status) || undefined,
      taskId: shot.taskId || null,
      videoUrl: shot.videoUrl || null,
      error: shot.error || null,
    };
  });
}

export function buildDirectorStoryboardReferenceOrder(shot: Pick<DirectorStoryboardShot, 'localRefImages' | 'localRefVideos' | 'localRefAudios'> & {
  localRefOrder?: DirectorStoryboardReferenceItem[];
}): DirectorStoryboardReferenceItem[] {
  const images = sanitizeStringArray(shot.localRefImages);
  const videos = sanitizeStringArray(shot.localRefVideos);
  const audios = sanitizeStringArray(shot.localRefAudios);
  return mergeReferenceOrder(
    sanitizeReferenceOrderInput(shot.localRefOrder),
    [
      ...images.map((url) => ({ kind: 'image' as const, url })),
      ...videos.map((url) => ({ kind: 'video' as const, url })),
      ...audios.map((url) => ({ kind: 'audio' as const, url })),
    ],
    { images, videos, audios },
  );
}

export function reorderDirectorStoryboardReference(
  shot: DirectorStoryboardShot,
  fromIndex: number,
  toIndex: number,
): DirectorStoryboardShot {
  const order = buildDirectorStoryboardReferenceOrder(shot);
  if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0 || fromIndex >= order.length || toIndex >= order.length) {
    return { ...shot, localRefOrder: order };
  }
  const next = order.slice();
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return {
    ...shot,
    localRefImages: next.filter((item) => item.kind === 'image').map((item) => item.url),
    localRefVideos: next.filter((item) => item.kind === 'video').map((item) => item.url),
    localRefAudios: next.filter((item) => item.kind === 'audio').map((item) => item.url),
    localRefOrder: next,
  };
}

export function sanitizeDirectorStoryboardBridges(
  input: DirectorStoryboardInputBridge[],
  shots: DirectorStoryboardShot[],
): DirectorStoryboardBridge[] {
  const shotIds = new Set(shots.map((shot) => shot.id));
  const adjacentPairs = shots.slice(0, -1).map((shot, index) => ({
    fromShotId: shot.id,
    toShotId: shots[index + 1].id,
  }));
  const adjacentKeys = new Set(adjacentPairs.map((pair) => `${pair.fromShotId}:${pair.toShotId}`));
  const byPair = new Map<string, DirectorStoryboardInputBridge>();
  if (Array.isArray(input)) {
    for (const bridge of input) {
      const fromShotId = normalizeString(bridge.fromShotId);
      const toShotId = normalizeString(bridge.toShotId);
      const key = `${fromShotId}:${toShotId}`;
      if (!fromShotId || !toShotId || !shotIds.has(fromShotId) || !shotIds.has(toShotId) || !adjacentKeys.has(key)) continue;
      if (!byPair.has(key)) byPair.set(key, bridge);
    }
  }

  return adjacentPairs.map((pair) => {
    const saved = byPair.get(`${pair.fromShotId}:${pair.toShotId}`) || {};
    return {
      id: normalizeString(saved.id) || bridgePairId(pair.fromShotId, pair.toShotId),
      fromShotId: pair.fromShotId,
      toShotId: pair.toShotId,
      durationSec: sanitizeDurationSec(saved.durationSec || DIRECTOR_STORYBOARD_DEFAULT_BRIDGE_DURATION_SEC),
      prompt: normalizeString(saved.prompt),
      sourceMode: sanitizeBridgeSourceMode(saved.sourceMode),
      firstFrameUrl: normalizeString(saved.firstFrameUrl) || undefined,
      lastFrameUrl: normalizeString(saved.lastFrameUrl) || undefined,
      previousVideoUrl: normalizeString(saved.previousVideoUrl) || undefined,
      nextVideoUrl: normalizeString(saved.nextVideoUrl) || undefined,
      status: sanitizeBridgeStatus(saved.status),
      taskId: saved.taskId || null,
      videoUrl: saved.videoUrl || null,
      error: saved.error || null,
    };
  });
}

function materialKey(material: DirectorStoryboardMentionMaterial): string {
  const custom = normalizeString(material.mentionKey);
  return custom || `${material.kind}:${material.url}`;
}

function tokenForMaterial(material: DirectorStoryboardMentionMaterial, materials: DirectorStoryboardMentionMaterial[]): string {
  const custom = normalizeString(material.mentionToken);
  if (custom) return custom;
  let index = 0;
  for (const candidate of materials) {
    if (candidate.kind !== material.kind) continue;
    index += 1;
    if (materialKey(candidate) === materialKey(material)) return `@${TOKEN_PREFIX[material.kind]}${index}`;
  }
  return `@${TOKEN_PREFIX[material.kind]}?`;
}

function mentionTokenMatchesKind(mention: Pick<MediaMention, 'kind' | 'token'>): boolean {
  if (mention.kind === 'image' && /^@img\d+\b/.test(mention.token)) return true;
  if (mention.kind === 'video' && /^@vid\d+\b/.test(mention.token)) return true;
  if (mention.kind === 'audio' && /^@aud\d+\b/.test(mention.token)) return true;
  if (mention.kind === 'text' && /^@txt\d+\b/.test(mention.token)) return true;
  return new RegExp(`^@${TOKEN_PREFIX[mention.kind]}\\d+\\b`).test(mention.token);
}

function resolveShotPrompt(
  prompt: string,
  mentions: MediaMention[] | undefined,
  materials: DirectorStoryboardMentionMaterial[],
): string {
  if (!mentions?.length) return prompt;
  const byKey = new Map(materials.map((material) => [materialKey(material), material]));
  let next = prompt;
  const valid = mentions
    .filter((mention) => mentionTokenMatchesKind(mention) && prompt.slice(mention.start, mention.end) === mention.token)
    .sort((a, b) => b.start - a.start);

  for (const mention of valid) {
    const material = byKey.get(mention.materialKey);
    if (!material) continue;
    const replacement = mention.kind === 'text' ? material.url : tokenForMaterial(material, materials);
    next = `${next.slice(0, mention.start)}${replacement}${next.slice(mention.end)}`;
  }
  return next;
}

function collectMentionedMedia(
  prompt: string,
  mentions: MediaMention[] | undefined,
  materials: DirectorStoryboardMentionMaterial[],
) {
  const images: string[] = [];
  const videos: string[] = [];
  const audios: string[] = [];
  if (!mentions?.length) return { images, videos, audios };
  const byKey = new Map(materials.map((material) => [materialKey(material), material]));

  for (const mention of mentions) {
    if (!mentionTokenMatchesKind(mention)) continue;
    if (prompt.slice(mention.start, mention.end) !== mention.token) continue;
    const material = byKey.get(mention.materialKey);
    if (!material) continue;
    if (material.kind === 'image') images.push(material.url);
    if (material.kind === 'video') videos.push(material.url);
    if (material.kind === 'audio') audios.push(material.url);
  }

  return {
    images: dedupeStrings(images),
    videos: dedupeStrings(videos),
    audios: dedupeStrings(audios),
  };
}

function normalizeProviderParams(value: unknown): Record<string, any> | undefined {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return undefined;
  const entries = Object.entries(value as Record<string, any>).filter(([, entryValue]) => {
    if (entryValue == null) return false;
    if (typeof entryValue === 'string') return entryValue.trim().length > 0;
    return true;
  });
  return entries.length ? Object.fromEntries(entries) : undefined;
}

function applyProviderParams(payload: SeedanceSubmitRequest, settings: DirectorStoryboardSettings) {
  const providerParams = normalizeProviderParams(settings.providerParams);
  if (providerParams) payload.providerParams = providerParams;
}

function collectDirectorShotSeedanceMedia(
  shot: DirectorStoryboardShot,
  context: BuildDirectorShotPayloadContext = {},
  options: { includeGlobal?: boolean } = {},
) {
  const mentionMaterials = context.mentionMaterials || [];
  const mentioned = collectMentionedMedia(shot.prompt, shot.promptMentions, mentionMaterials);
  const includeGlobal = options.includeGlobal !== false;
  return {
    images: dedupeStrings([
      ...(includeGlobal ? (context.globalImages || []) : []),
      ...mentioned.images,
      ...(shot.localRefImages || []),
    ]),
    videos: dedupeStrings([
      ...(includeGlobal ? (context.globalVideos || []) : []),
      ...mentioned.videos,
      ...(shot.localRefVideos || []),
    ]),
    audios: dedupeStrings([
      ...(includeGlobal ? (context.globalAudios || []) : []),
      ...mentioned.audios,
      ...(shot.localRefAudios || []),
    ]),
  };
}

export function buildDirectorShotSeedancePayload(
  shot: DirectorStoryboardShot,
  settings: DirectorStoryboardSettings,
  context: BuildDirectorShotPayloadContext = {},
): SeedanceSubmitRequest {
  const mentionMaterials = context.mentionMaterials || [];
  const { images, videos, audios } = collectDirectorShotSeedanceMedia(shot, context);

  const localPrompt = resolveShotPrompt(shot.prompt, shot.promptMentions, mentionMaterials).trim();
  const prompt = [context.upstreamPrompt, localPrompt].map((item) => normalizeString(item)).filter(Boolean).join('\n\n');
  const payload: SeedanceSubmitRequest = {
    model: shot.modelOverride || settings.model,
    prompt,
    duration: sanitizeDurationSec(shot.durationSec),
    ratio: shot.ratioOverride || settings.ratio,
    resolution: shot.resolutionOverride || settings.resolution,
    generate_audio: settings.generateAudio,
    return_last_frame: settings.returnLastFrame,
    watermark: settings.watermark,
    web_search: settings.webSearch,
  };
  applyProviderParams(payload, settings);

  const seed = typeof shot.seed === 'number' ? shot.seed : settings.seed;
  if (typeof seed === 'number' && seed !== -1) payload.seed = seed;

  if (shot.frameMode === 'first' && images.length >= 1) {
    payload.firstFrame = images[0];
    const refImages = images.slice(1);
    if (refImages.length) payload.refImages = refImages;
  } else if (shot.frameMode === 'firstlast' && images.length >= 1) {
    payload.firstFrame = images[0];
    if (images[1]) payload.lastFrame = images[1];
    const refImages = images.slice(2);
    if (refImages.length) payload.refImages = refImages;
  } else if (images.length) {
    payload.refImages = images;
  }

  if (videos.length) payload.videos = videos;
  if (audios.length) payload.audios = audios;
  return payload;
}

function bridgeFallbackPrompt(previous: DirectorStoryboardShot, next: DirectorStoryboardShot): string {
  return `Smooth transition from ${previous.title} to ${next.title}`;
}

export function buildDirectorStoryboardBridgeRunPlan(
  bridges: DirectorStoryboardBridge[],
  shots: DirectorStoryboardShot[],
  settings: DirectorStoryboardSettings,
): DirectorStoryboardJob[] {
  const shotById = new Map(shots.map((shot, index) => [shot.id, { shot, index }]));
  const jobs: DirectorStoryboardJob[] = [];

  for (const bridge of bridges) {
    const previousEntry = shotById.get(bridge.fromShotId);
    const nextEntry = shotById.get(bridge.toShotId);
    if (!previousEntry || !nextEntry || nextEntry.index !== previousEntry.index + 1) continue;
    const firstFrame = normalizeString(bridge.firstFrameUrl);
    const lastFrame = normalizeString(bridge.lastFrameUrl);
    if (!firstFrame || !lastFrame) continue;

    const payload: SeedanceSubmitRequest = {
      model: settings.model,
      prompt: normalizeString(bridge.prompt) || bridgeFallbackPrompt(previousEntry.shot, nextEntry.shot),
      duration: sanitizeDurationSec(bridge.durationSec || DIRECTOR_STORYBOARD_DEFAULT_BRIDGE_DURATION_SEC),
      ratio: settings.ratio,
      resolution: settings.resolution,
      generate_audio: settings.generateAudio,
      return_last_frame: settings.returnLastFrame,
      watermark: settings.watermark,
      web_search: settings.webSearch,
      firstFrame,
      lastFrame,
    };
    applyProviderParams(payload, settings);
    if (typeof settings.seed === 'number' && settings.seed !== -1) payload.seed = settings.seed;

    jobs.push({
      id: `bridge-${bridge.id}`,
      shotId: `${bridge.fromShotId}:${bridge.toShotId}`,
      order: previousEntry.index + 0.5,
      kind: 'bridge',
      title: `${previousEntry.shot.title} → ${nextEntry.shot.title}`,
      payload,
    });
  }

  return jobs.sort((a, b) => a.order - b.order);
}

function lastImage(shot: DirectorStoryboardShot, context: BuildDirectorShotPayloadContext): string {
  const images = collectDirectorShotSeedanceMedia(shot, context, { includeGlobal: false }).images;
  return images[images.length - 1] || '';
}

function firstImage(shot: DirectorStoryboardShot, context: BuildDirectorShotPayloadContext): string {
  return collectDirectorShotSeedanceMedia(shot, context, { includeGlobal: false }).images[0] || '';
}

function buildBridgeJob(
  previous: DirectorStoryboardShot,
  next: DirectorStoryboardShot,
  settings: DirectorStoryboardSettings,
  order: number,
  context: BuildDirectorShotPayloadContext = {},
): DirectorStoryboardJob | null {
  const firstFrame = lastImage(previous, context);
  const lastFrame = firstImage(next, context);
  if (!firstFrame || !lastFrame) return null;
  const payload: SeedanceSubmitRequest = {
    model: settings.model,
    prompt: normalizeString(settings.bridgePrompt) || `Smooth transition from ${previous.title} to ${next.title}`,
    duration: sanitizeDurationSec(settings.bridgeDurationSec || 4),
    ratio: settings.ratio,
    resolution: settings.resolution,
    generate_audio: settings.generateAudio,
    return_last_frame: settings.returnLastFrame,
    watermark: settings.watermark,
    web_search: settings.webSearch,
    firstFrame,
    lastFrame,
  };
  applyProviderParams(payload, settings);
  return {
    id: `bridge-${previous.id}-${next.id}`,
    shotId: `${previous.id}:${next.id}`,
    order,
    kind: 'bridge',
    title: `${previous.title} → ${next.title}`,
    payload,
  };
}

export function buildDirectorStoryboardRunPlan(
  shots: DirectorStoryboardShot[],
  settings: DirectorStoryboardSettings,
  context: BuildDirectorShotPayloadContext = {},
): DirectorStoryboardJob[] {
  return shots.map((shot, index) => ({
      id: `shot-${shot.id}`,
      shotId: shot.id,
      order: index,
      kind: 'shot',
      title: shot.title,
      payload: buildDirectorShotSeedancePayload(shot, settings, context),
  }));
}

export function buildDirectorStoryboardOutputItems(
  jobs: DirectorStoryboardJob[],
  results: Record<string, DirectorStoryboardOutputResultLike | undefined>,
): DirectorStoryboardOutputItem[] {
  const orderedJobs = [...jobs].sort((a, b) => a.order - b.order);
  const shotOrdinalByJobId = new Map<string, number>();
  let shotOrdinal = 0;
  for (const job of orderedJobs) {
    if (job.kind !== 'shot') continue;
    shotOrdinal += 1;
    shotOrdinalByJobId.set(job.id, shotOrdinal);
  }

  return orderedJobs.flatMap((job) => {
    const result = results[job.id];
    const videoUrl = typeof result?.videoUrl === 'string' ? result.videoUrl.trim() : '';
    if (result?.status !== 'success' || !videoUrl) return [];
    const prompt = normalizeString(job.payload.prompt) || '未填写提示词';
    const durationSec = sanitizeDurationSec((job.payload as any).duration);
    const title = job.kind === 'bridge'
      ? `首尾帧桥接 · ${job.title}`
      : `分镜 ${shotOrdinalByJobId.get(job.id) || job.order + 1} · ${job.title}`;
    const text = `${title} · ${durationSec}s\n${prompt}`;
    return [{
      jobId: job.id,
      shotId: job.shotId,
      kind: job.kind,
      order: job.order,
      title,
      prompt,
      durationSec,
      videoUrl,
      text,
    }];
  });
}

export function buildDirectorStoryboardOutputSummary(items: DirectorStoryboardOutputItem[]): string {
  if (items.length === 0) return '';
  const lines = ['导演分镜台输出'];
  items.forEach((item, index) => {
    lines.push(`${index + 1}. ${item.title} · ${item.durationSec}s · ${item.prompt} -> ${item.videoUrl}`);
  });
  return lines.join('\n');
}

export function buildDirectorStoryboardOutputNodeData(item: DirectorStoryboardOutputItem): Record<string, any> {
  const videoUrl = normalizeString(item.videoUrl);
  if (!videoUrl) return {};
  const text = normalizeString(item.text);
  return {
    directOutputSingleSnapshot: true,
    directorStoryboardOutputSnapshot: {
      jobId: item.jobId,
      shotId: item.shotId,
      kind: item.kind,
      order: item.order,
      title: item.title,
      durationSec: item.durationSec,
    },
    videoUrl,
    videoUrls: [videoUrl],
    directVideoUrl: videoUrl,
    directVideoUrls: [videoUrl],
    prompt: text,
    text,
    reply: text,
    outputText: '',
    directOutputText: text,
    directTextSegments: text ? [text] : [],
    textSegments: text ? [text] : [],
    segments: text ? [text] : [],
  };
}

export async function runDirectorStoryboardJobs(
  jobs: DirectorStoryboardJob[],
  runJob: (job: DirectorStoryboardJob, signal?: AbortSignal) => Promise<string>,
  options: RunDirectorStoryboardJobsOptions = {},
): Promise<DirectorStoryboardRunResult> {
  const orderedJobs = [...jobs].sort((a, b) => a.order - b.order);
  const settled = await Promise.all(
    orderedJobs.map(async (job): Promise<DirectorStoryboardJobResult> => {
      if (options.signal?.aborted) {
        const cancelled: DirectorStoryboardJobResult = { job, status: 'cancelled', error: '用户已停止' };
        options.onJobComplete?.(cancelled);
        return cancelled;
      }
      try {
        const videoUrl = await runJob(job, options.signal);
        const result: DirectorStoryboardJobResult = { job, status: 'success', videoUrl };
        options.onJobComplete?.(result);
        return result;
      } catch (error: any) {
        const status: DirectorStoryboardJobStatus = options.signal?.aborted ? 'cancelled' : 'error';
        const result: DirectorStoryboardJobResult = {
          job,
          status,
          error: error?.message || (status === 'cancelled' ? '用户已停止' : '生成失败'),
        };
        options.onJobComplete?.(result);
        return result;
      }
    }),
  );

  const byOrder = [...settled].sort((a, b) => a.job.order - b.job.order);
  return {
    results: byOrder,
    videoUrls: byOrder.flatMap((item) => item.status === 'success' && item.videoUrl ? [item.videoUrl] : []),
  };
}
