export type PanoramaRatioId =
  | 'square'
  | 'portrait'
  | 'landscape'
  | 'portrait43'
  | 'landscape43'
  | 'story'
  | 'wide'
  | 'ultrawide'
  | 'ultratall'
  | 'custom';

export interface PanoramaRatio {
  w: number;
  h: number;
}

export const PANORAMA_RATIO_PRESETS: Record<Exclude<PanoramaRatioId, 'custom'>, PanoramaRatio> = {
  square: { w: 1, h: 1 },
  portrait: { w: 2, h: 3 },
  landscape: { w: 3, h: 2 },
  portrait43: { w: 3, h: 4 },
  landscape43: { w: 4, h: 3 },
  story: { w: 9, h: 16 },
  wide: { w: 16, h: 9 },
  ultrawide: { w: 21, h: 9 },
  ultratall: { w: 9, h: 21 },
};

export const PANORAMA_RATIO_OPTIONS: Array<{ id: PanoramaRatioId; label: string }> = [
  { id: 'square', label: '1:1' },
  { id: 'portrait', label: '2:3' },
  { id: 'landscape', label: '3:2' },
  { id: 'portrait43', label: '3:4' },
  { id: 'landscape43', label: '4:3' },
  { id: 'story', label: '9:16' },
  { id: 'wide', label: '16:9' },
  { id: 'ultrawide', label: '21:9' },
  { id: 'ultratall', label: '9:21' },
  { id: 'custom', label: '自定义' },
];

export type PanoramaGenerationMode = 'text' | 'image';
export type PanoramaPanelMode = 'preview' | PanoramaGenerationMode;
export type PanoramaSizeLevel = '1K' | '2K';

export interface PanoramaGenerationHistoryItem {
  url: string;
  mode: PanoramaGenerationMode;
  sizeLevel: PanoramaSizeLevel;
  prompt: string;
  promptFinal: string;
  referenceUrl?: string;
  createdAt: string;
}

export interface PanoramaCameraView {
  id: string;
  name: string;
  yaw: number;
  pitch: number;
  fov: number;
  isDefault?: boolean;
  snapshotUrl?: string;
  createdAt: string;
}

export interface PanoramaHotspot {
  id: string;
  label: string;
  yaw: number;
  pitch: number;
  fov?: number;
  targetNodeId?: string;
  targetYaw?: number;
  targetPitch?: number;
  targetFov?: number;
  createdAt: string;
}

export interface PanoramaPromptContext {
  viewerPosition?: unknown;
  viewCenter?: unknown;
}

export interface PanoramaViewAngles {
  yaw: number;
  pitch: number;
  fov: number;
}

export const PANORAMA_CAMERA_VIEW_LIMIT = 8;
export const PANORAMA_HOTSPOT_LIMIT = 16;

export type PanoramaQualityLevel = 'excellent' | 'good' | 'warning' | 'unknown';

export interface PanoramaImageQuality {
  level: PanoramaQualityLevel;
  seamScore: number | null;
  seamLabel: string;
  aspectLabel: string;
  width: number;
  height: number;
  hint: string;
}

export const PANORAMA_FIXED_PROMPT =
  '将参考图生成一个720度的全景VR图，左右边缘100%像素级无缝衔接，可无限循环拼接；上下极点（南北极）自然过渡，无明显断层或拉伸，场景一致性，以及场景的逻辑性，封闭场景需要有门。';

export const PANORAMA_SIZE_LEVELS: PanoramaSizeLevel[] = ['1K', '2K'];
export const PANORAMA_PROMPT_TEMPLATES = ['室内展厅', '科幻基地', '古风庭院', '自然峡谷', '游戏关卡', '产品展台'];
export const PANORAMA_CAMERA_PRESETS: Array<{ id: string; label: string; yaw: number; pitch: number; fov: number }> = [
  { id: 'front', label: '正前', yaw: 0, pitch: 0, fov: 75 },
  { id: 'left', label: '左侧', yaw: -90, pitch: 0, fov: 75 },
  { id: 'right', label: '右侧', yaw: 90, pitch: 0, fov: 75 },
  { id: 'back', label: '背面', yaw: 180, pitch: 0, fov: 75 },
  { id: 'zenith', label: '天顶', yaw: 0, pitch: 78, fov: 80 },
  { id: 'nadir', label: '地面', yaw: 0, pitch: -72, fov: 80 },
];

export function safePanoramaPanelMode(value: unknown): PanoramaPanelMode {
  return value === 'preview' || value === 'image' ? value : 'text';
}

export function safePanoramaGenerationMode(value: unknown): PanoramaGenerationMode {
  return value === 'image' ? 'image' : 'text';
}

export function safePanoramaSizeLevel(value: unknown): PanoramaSizeLevel {
  return value === '2K' ? '2K' : '1K';
}

function cleanPanoramaText(value: unknown, max = 80) {
  if (typeof value !== 'string') return '';
  return value.replace(/\s+/g, ' ').trim().slice(0, max);
}

export function buildPanoramaCameraContextPrompt(context: PanoramaPromptContext = {}) {
  const parts: string[] = [];
  const viewerPosition = cleanPanoramaText(context.viewerPosition);
  const viewCenter = cleanPanoramaText(context.viewCenter);
  if (viewerPosition) parts.push(`观看者站位：${viewerPosition}。`);
  if (viewCenter) parts.push(`初始视线中心：${viewCenter}。`);
  if (parts.length === 0) return '';
  return `摄像机位置要求：${parts.join('')}`;
}

export function buildPanoramaPromptFinal(userPrompt: unknown, context: PanoramaPromptContext = {}) {
  const extra = typeof userPrompt === 'string' ? userPrompt.trim() : '';
  const camera = buildPanoramaCameraContextPrompt(context);
  return [PANORAMA_FIXED_PROMPT, camera, extra].filter(Boolean).join('\n');
}

export function validatePanoramaGeneration(params: {
  mode: PanoramaGenerationMode;
  prompt?: unknown;
  referenceUrl?: unknown;
}) {
  const prompt = typeof params.prompt === 'string' ? params.prompt.trim() : '';
  const referenceUrl = typeof params.referenceUrl === 'string' ? params.referenceUrl.trim() : '';
  if (params.mode === 'text' && !prompt) {
    return { ok: false as const, error: '文生全景需要填写场景提示词' };
  }
  if (params.mode === 'image' && !referenceUrl) {
    return { ok: false as const, error: '图生全景需要上游图片或节点内参考图' };
  }
  return { ok: true as const };
}

export function buildPanoramaImageRequest(params: {
  mode: PanoramaGenerationMode;
  prompt?: unknown;
  sizeLevel?: unknown;
  referenceUrl?: unknown;
  viewerPosition?: unknown;
  viewCenter?: unknown;
}) {
  const prompt = typeof params.prompt === 'string' ? params.prompt.trim() : '';
  const referenceUrl = typeof params.referenceUrl === 'string' ? params.referenceUrl.trim() : '';
  const sizeLevel = safePanoramaSizeLevel(params.sizeLevel);
  return {
    model: 'gpt-image-2',
    apiModel: 'gpt-image-2',
    paramKind: 'gpt-size' as const,
    prompt: buildPanoramaPromptFinal(prompt, {
      viewerPosition: params.viewerPosition,
      viewCenter: params.viewCenter,
    }),
    aspectRatio: '21:9',
    aspect_ratio: '21:9',
    sizeLevel,
    image_size: sizeLevel,
    images: params.mode === 'image' && referenceUrl ? [referenceUrl] : [],
    n: 1,
  };
}

function makePanoramaId(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function cleanPanoramaName(value: unknown, fallback: string) {
  const text = cleanPanoramaText(value, 18);
  return text || fallback;
}

export function normalizePanoramaYaw(value: unknown) {
  const n = clampPanoramaNumber(value, -99999, 99999, 0);
  const wrapped = ((n + 180) % 360 + 360) % 360 - 180;
  return Object.is(wrapped, -0) ? 0 : Math.round(wrapped * 100) / 100;
}

export function sanitizePanoramaViewAngles(value: Partial<PanoramaViewAngles> = {}): PanoramaViewAngles {
  return {
    yaw: normalizePanoramaYaw(value.yaw),
    pitch: clampPanoramaNumber(value.pitch, -85, 85, 0),
    fov: clampPanoramaNumber(value.fov, 35, 100, 75),
  };
}

export function sanitizePanoramaCameraViews(value: unknown, maxItems = PANORAMA_CAMERA_VIEW_LIMIT): PanoramaCameraView[] {
  const list = Array.isArray(value) ? value : [];
  return list
    .filter((item): item is Record<string, any> => !!item && typeof item === 'object')
    .map((item, index) => {
      const angles = sanitizePanoramaViewAngles(item);
      return {
        id: cleanPanoramaText(item.id, 48) || `view_${index + 1}`,
        name: cleanPanoramaName(item.name, `机位 ${index + 1}`),
        ...angles,
        isDefault: Boolean(item.isDefault),
        snapshotUrl: cleanPanoramaText(item.snapshotUrl, 500),
        createdAt: cleanPanoramaText(item.createdAt, 40) || new Date(0).toISOString(),
      };
    })
    .slice(0, Math.max(1, maxItems))
    .map((item, index, arr) => ({
      ...item,
      isDefault: item.isDefault && arr.findIndex((entry) => entry.isDefault) === index,
    }));
}

export function upsertPanoramaCameraView(
  current: unknown,
  view: Partial<PanoramaCameraView> & Partial<PanoramaViewAngles>,
  maxItems = PANORAMA_CAMERA_VIEW_LIMIT,
): PanoramaCameraView[] {
  const list = sanitizePanoramaCameraViews(current, maxItems);
  const id = cleanPanoramaText(view.id, 48) || makePanoramaId('view');
  const angles = sanitizePanoramaViewAngles(view);
  const item: PanoramaCameraView = {
    id,
    name: cleanPanoramaName(view.name, `机位 ${Math.min(list.length + 1, maxItems)}`),
    ...angles,
    isDefault: Boolean(view.isDefault),
    snapshotUrl: cleanPanoramaText(view.snapshotUrl, 500),
    createdAt: cleanPanoramaText(view.createdAt, 40) || new Date().toISOString(),
  };
  const next = [item, ...list.filter((entry) => entry.id !== id)].slice(0, Math.max(1, maxItems));
  return item.isDefault ? markPanoramaDefaultCameraView(next, item.id) : next;
}

export function markPanoramaDefaultCameraView(current: unknown, id: string): PanoramaCameraView[] {
  const target = cleanPanoramaText(id, 48);
  return sanitizePanoramaCameraViews(current).map((item) => ({
    ...item,
    isDefault: Boolean(target && item.id === target),
  }));
}

export function deletePanoramaCameraView(current: unknown, id: string): PanoramaCameraView[] {
  const target = cleanPanoramaText(id, 48);
  return sanitizePanoramaCameraViews(current).filter((item) => item.id !== target);
}

export function sanitizePanoramaHotspots(value: unknown, maxItems = PANORAMA_HOTSPOT_LIMIT): PanoramaHotspot[] {
  const list = Array.isArray(value) ? value : [];
  return list
    .filter((item): item is Record<string, any> => !!item && typeof item === 'object')
    .map((item, index) => {
      const angles = sanitizePanoramaViewAngles(item);
      const targetAngles = sanitizePanoramaViewAngles({
        yaw: item.targetYaw ?? angles.yaw,
        pitch: item.targetPitch ?? angles.pitch,
        fov: item.targetFov ?? angles.fov,
      });
      return {
        id: cleanPanoramaText(item.id, 48) || `hotspot_${index + 1}`,
        label: cleanPanoramaName(item.label, `热点 ${index + 1}`),
        yaw: angles.yaw,
        pitch: angles.pitch,
        fov: angles.fov,
        targetNodeId: cleanPanoramaText(item.targetNodeId, 80),
        targetYaw: targetAngles.yaw,
        targetPitch: targetAngles.pitch,
        targetFov: targetAngles.fov,
        createdAt: cleanPanoramaText(item.createdAt, 40) || new Date(0).toISOString(),
      };
    })
    .slice(0, Math.max(1, maxItems));
}

export function upsertPanoramaHotspot(
  current: unknown,
  hotspot: Partial<PanoramaHotspot> & Partial<PanoramaViewAngles>,
  maxItems = PANORAMA_HOTSPOT_LIMIT,
): PanoramaHotspot[] {
  const list = sanitizePanoramaHotspots(current, maxItems);
  const id = cleanPanoramaText(hotspot.id, 48) || makePanoramaId('hotspot');
  const angles = sanitizePanoramaViewAngles(hotspot);
  const targetAngles = sanitizePanoramaViewAngles({
    yaw: hotspot.targetYaw ?? hotspot.yaw,
    pitch: hotspot.targetPitch ?? hotspot.pitch,
    fov: hotspot.targetFov ?? hotspot.fov,
  });
  const item: PanoramaHotspot = {
    id,
    label: cleanPanoramaName(hotspot.label, `热点 ${Math.min(list.length + 1, maxItems)}`),
    yaw: angles.yaw,
    pitch: angles.pitch,
    fov: angles.fov,
    targetNodeId: cleanPanoramaText(hotspot.targetNodeId, 80),
    targetYaw: targetAngles.yaw,
    targetPitch: targetAngles.pitch,
    targetFov: targetAngles.fov,
    createdAt: cleanPanoramaText(hotspot.createdAt, 40) || new Date().toISOString(),
  };
  return [item, ...list.filter((entry) => entry.id !== id)].slice(0, Math.max(1, maxItems));
}

export function deletePanoramaHotspot(current: unknown, id: string): PanoramaHotspot[] {
  const target = cleanPanoramaText(id, 48);
  return sanitizePanoramaHotspots(current).filter((item) => item.id !== target);
}

export function updatePanoramaHotspot(current: unknown, id: string, patch: Partial<PanoramaHotspot>): PanoramaHotspot[] {
  const target = cleanPanoramaText(id, 48);
  return sanitizePanoramaHotspots(current).map((item) => (
    item.id === target
      ? sanitizePanoramaHotspots([{ ...item, ...patch }], 1)[0]
      : item
  ));
}

function angleDelta(target: number, current: number) {
  return normalizePanoramaYaw(target - current);
}

export function projectPanoramaHotspot(params: {
  hotspot: Pick<PanoramaHotspot, 'yaw' | 'pitch'>;
  view: PanoramaViewAngles;
  aspect?: number;
}) {
  const aspect = Math.max(0.25, Number(params.aspect) || 16 / 9);
  const view = sanitizePanoramaViewAngles(params.view);
  const dx = angleDelta(params.hotspot.yaw, view.yaw);
  const dy = clampPanoramaNumber(params.hotspot.pitch, -85, 85, 0) - view.pitch;
  const horizontalFov = Math.max(35, Math.min(170, view.fov * aspect));
  const verticalFov = view.fov;
  if (Math.abs(dx) > horizontalFov / 2 || Math.abs(dy) > verticalFov / 2) {
    return { visible: false as const, x: 50, y: 50 };
  }
  return {
    visible: true as const,
    x: 50 + (dx / horizontalFov) * 100,
    y: 50 - (dy / verticalFov) * 100,
  };
}

export function screenPointToPanoramaAngles(params: {
  xRatio: number;
  yRatio: number;
  view: PanoramaViewAngles;
  aspect?: number;
}) {
  const aspect = Math.max(0.25, Number(params.aspect) || 16 / 9);
  const view = sanitizePanoramaViewAngles(params.view);
  const horizontalFov = Math.max(35, Math.min(170, view.fov * aspect));
  const x = clampPanoramaNumber(params.xRatio, 0, 1, 0.5) - 0.5;
  const y = clampPanoramaNumber(params.yRatio, 0, 1, 0.5) - 0.5;
  return sanitizePanoramaViewAngles({
    yaw: view.yaw + x * horizontalFov,
    pitch: view.pitch - y * view.fov,
    fov: view.fov,
  });
}

export function prependPanoramaHistory(
  current: unknown,
  item: PanoramaGenerationHistoryItem,
  maxItems = 3,
): PanoramaGenerationHistoryItem[] {
  const list = Array.isArray(current) ? current : [];
  return [
    item,
    ...list
      .filter((entry): entry is PanoramaGenerationHistoryItem => {
        return !!entry && typeof entry === 'object' && typeof (entry as any).url === 'string';
      })
      .filter((entry) => entry.url !== item.url),
  ].slice(0, Math.max(1, maxItems));
}

export function clampPanoramaNumber(value: unknown, min: number, max: number, fallback: number) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, n));
}

export function resolvePanoramaRatio(id: unknown, customW: unknown, customH: unknown): PanoramaRatio {
  const key = typeof id === 'string' ? id : 'wide';
  if (key !== 'custom' && Object.prototype.hasOwnProperty.call(PANORAMA_RATIO_PRESETS, key)) {
    return PANORAMA_RATIO_PRESETS[key as Exclude<PanoramaRatioId, 'custom'>];
  }
  return {
    w: clampPanoramaNumber(customW, 1, 999, 16),
    h: clampPanoramaNumber(customH, 1, 999, 9),
  };
}

export function panoramaRenderSize(ratio: PanoramaRatio, longSide = 1536) {
  const safeW = Math.max(1, Number(ratio.w) || 16);
  const safeH = Math.max(1, Number(ratio.h) || 9);
  const aspect = safeW / safeH;
  if (aspect >= 1) {
    return { width: longSide, height: Math.max(1, Math.round(longSide / aspect)) };
  }
  return { width: Math.max(1, Math.round(longSide * aspect)), height: longSide };
}

export function classifyPanoramaSeamScore(score: number | null): Pick<PanoramaImageQuality, 'level' | 'seamLabel' | 'hint'> {
  if (score == null || !Number.isFinite(score)) {
    return { level: 'unknown', seamLabel: '无法检测', hint: '当前图片无法读取像素，可能是跨域图片或浏览器安全限制。' };
  }
  if (score >= 90) return { level: 'excellent', seamLabel: '接缝优秀', hint: '左右边缘像素差异很小，适合继续预览或入库。' };
  if (score >= 76) return { level: 'good', seamLabel: '接缝可用', hint: '左右边缘有轻微差异，建议旋转检查主体边缘。' };
  return { level: 'warning', seamLabel: '可能有缝', hint: '左右边缘差异较明显，建议重新生成或补充“边缘无缝衔接”。' };
}

function panoramaAspectLabel(width: number, height: number) {
  const aspect = width / Math.max(1, height);
  if (aspect >= 2.25 && aspect <= 2.45) return '21:9';
  if (aspect >= 1.9 && aspect <= 2.1) return '2:1';
  return `非标准 ${aspect.toFixed(2)}:1`;
}

export function estimatePanoramaImageQuality(image: HTMLImageElement): PanoramaImageQuality {
  const width = Math.max(0, image.naturalWidth || image.width || 0);
  const height = Math.max(0, image.naturalHeight || image.height || 0);
  const unknown = classifyPanoramaSeamScore(null);
  if (!width || !height || typeof document === 'undefined') {
    return {
      ...unknown,
      seamScore: null,
      aspectLabel: width && height ? panoramaAspectLabel(width, height) : '未知比例',
      width,
      height,
    };
  }
  try {
    const sampleW = Math.max(64, Math.min(384, Math.round(width)));
    const sampleH = Math.max(32, Math.min(192, Math.round(height)));
    const strip = Math.max(4, Math.min(12, Math.round(sampleW * 0.025)));
    const canvas = document.createElement('canvas');
    canvas.width = sampleW;
    canvas.height = sampleH;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) throw new Error('canvas context unavailable');
    ctx.drawImage(image, 0, 0, sampleW, sampleH);
    const left = ctx.getImageData(0, 0, strip, sampleH).data;
    const right = ctx.getImageData(sampleW - strip, 0, strip, sampleH).data;
    let diff = 0;
    let count = 0;
    for (let i = 0; i < left.length; i += 4) {
      diff += Math.abs(left[i] - right[i]) + Math.abs(left[i + 1] - right[i + 1]) + Math.abs(left[i + 2] - right[i + 2]);
      count += 3;
    }
    const normalized = count > 0 ? diff / (count * 255) : 1;
    const score = Math.max(0, Math.min(100, Math.round((1 - normalized) * 100)));
    const classified = classifyPanoramaSeamScore(score);
    const aspectLabel = panoramaAspectLabel(width, height);
    return {
      ...classified,
      seamScore: score,
      aspectLabel,
      width,
      height,
      hint: aspectLabel.startsWith('非标准')
        ? `${classified.hint} 当前不是常见 2:1 或 21:9 全景比例，预览可能出现拉伸。`
        : classified.hint,
    };
  } catch {
    return {
      ...unknown,
      seamScore: null,
      aspectLabel: panoramaAspectLabel(width, height),
      width,
      height,
    };
  }
}

export function isLikelyPanoramaImage(meta: {
  url?: string;
  label?: string;
  title?: string;
  prompt?: string;
  width?: number;
  height?: number;
}) {
  const text = [meta.url, meta.label, meta.title, meta.prompt].filter(Boolean).join(' ');
  if (/(?:360|720|全景|环景|panorama|equirect|spherical|vr\b)/i.test(text)) return true;
  const w = Number(meta.width || 0);
  const h = Number(meta.height || 0);
  if (!(w > 0 && h > 0)) return false;
  const aspect = w / h;
  return aspect >= 1.9 && aspect <= 2.1;
}
