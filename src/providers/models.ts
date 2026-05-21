/**
 * 模型注册表 - 集中定义可扩展模型清单
 * 后续要新增模型只需在对应数组里追加即可
 */

export type ProviderType = 'zhenzhen' | 'llm-direct' | 'runninghub';

// ========== 图像 ==========
export interface ImageModelDef {
  id: string;
  label: string;
  provider: ProviderType;
  capabilities: ('t2i' | 'i2i' | 'edit' | 'text-render')[];
  sizes: string[]; // 支持的尺寸
  defaultSize: string;
  description?: string;
}

export const IMAGE_MODELS: ImageModelDef[] = [
  {
    id: 'gpt-image-2',
    label: 'GPT Image 2',
    provider: 'zhenzhen',
    capabilities: ['t2i', 'i2i', 'edit', 'text-render'],
    sizes: ['1024x1024', '1024x1536', '1536x1024'],
    defaultSize: '1024x1024',
    description: '支持文生图/图生图/编辑/文字渲染',
  },
  {
    id: 'nano-banana-2',
    label: 'Nano Banana 2',
    provider: 'zhenzhen',
    capabilities: ['t2i', 'i2i'],
    sizes: ['1024x1024', '1024x1792', '1792x1024'],
    defaultSize: '1024x1024',
    description: '高速生成,适合迭代',
  },
  {
    id: 'nano-banana-pro',
    label: 'Nano Banana Pro',
    provider: 'zhenzhen',
    capabilities: ['t2i', 'i2i', 'edit'],
    sizes: ['1024x1024', '1024x1792', '1792x1024', '2048x2048'],
    defaultSize: '1024x1024',
    description: '高品质 Pro 版本',
  },
];

// ========== 视频 ==========
export interface VideoModelDef {
  id: string;
  label: string;
  provider: ProviderType;
  description?: string;
  durations?: number[]; // 秒
  aspectRatios?: string[];
  defaultAspectRatio?: string;
  supportImages?: boolean; // 是否支持首帧参考图
}

export const VIDEO_MODELS: VideoModelDef[] = [
  {
    id: 'veo-3.1',
    label: 'Veo 3.1',
    provider: 'zhenzhen',
    durations: [5, 10],
    aspectRatios: ['16:9', '9:16', '1:1'],
    defaultAspectRatio: '16:9',
    supportImages: true,
    description: 'Google Veo 高品质视频',
  },
  {
    id: 'grok-video',
    label: 'Grok Video',
    provider: 'zhenzhen',
    durations: [5, 10],
    aspectRatios: ['16:9', '9:16'],
    defaultAspectRatio: '16:9',
    supportImages: true,
    description: 'xAI 视频模型',
  },
  {
    id: 'seedance-2.0',
    label: 'Seedance 2.0',
    provider: 'zhenzhen',
    durations: [5, 10, 15],
    aspectRatios: ['16:9', '9:16', '1:1'],
    defaultAspectRatio: '16:9',
    supportImages: true,
    description: '字节 Seedance 分镜',
  },
];

// ========== 音频(Suno) ==========
export interface AudioModelDef {
  id: string;
  label: string;
  provider: ProviderType;
  mode: 'generate' | 'cover' | 'extend';
  description?: string;
}

export const AUDIO_MODELS: AudioModelDef[] = [
  { id: 'suno-v5.5-generate', label: 'Suno V5.5 生成', provider: 'zhenzhen', mode: 'generate' },
  { id: 'suno-v5.5-cover', label: 'Suno V5.5 翻唱', provider: 'zhenzhen', mode: 'cover' },
  { id: 'suno-v5.5-extend', label: 'Suno V5.5 续写', provider: 'zhenzhen', mode: 'extend' },
];

// ========== LLM/Vision ==========
export interface LlmModelDef {
  id: string;
  label: string;
  provider: ProviderType;
  vision?: boolean;
  contextLength?: number;
  description?: string;
}

export const LLM_MODELS: LlmModelDef[] = [
  { id: 'gpt-5', label: 'GPT-5', provider: 'llm-direct', vision: true, contextLength: 200_000 },
  { id: 'claude-sonnet-4.5', label: 'Claude Sonnet 4.5', provider: 'llm-direct', vision: true, contextLength: 200_000 },
  { id: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro', provider: 'llm-direct', vision: true, contextLength: 1_000_000 },
];
