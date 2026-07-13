export type IcdPromptCategory =
  | '空间类型'
  | '风格表达'
  | '材质与色彩'
  | '灯光与镜头'
  | '改造任务'
  | '负面控制';

export interface IcdPromptRecord {
  id: string;
  title: string;
  description: string;
  prompt: string;
  category: IcdPromptCategory;
  tags: string[];
  isFavorite: boolean;
}

export const ICD_PROMPT_LIBRARY: IcdPromptRecord[] = [
  {
    id: 'prompt-living-room',
    title: '高级住宅客厅',
    description: '适合从草图或参考图开始，快速建立完整的住宅空间基调。',
    prompt: 'High-end residential living room, calm contemporary architecture, natural stone, warm walnut, soft linen furniture, layered indirect lighting, refined material transitions, editorial interior photography, realistic proportions, highly detailed.',
    category: '空间类型',
    tags: ['住宅', '客厅', '高级感'],
    isFavorite: false,
  },
  {
    id: 'prompt-hotel-lobby',
    title: '精品酒店大堂',
    description: '用于酒店、会所和接待空间，强调尺度、秩序与到达体验。',
    prompt: 'Boutique hotel lobby, generous spatial sequence, sculptural reception desk, textured stone, brushed brass details, warm ambient lighting, curated furniture, quiet luxury, cinematic architectural photography, realistic materials.',
    category: '空间类型',
    tags: ['酒店', '大堂', '商业空间'],
    isFavorite: false,
  },
  {
    id: 'prompt-retail',
    title: '精品零售空间',
    description: '适合品牌店、展厅和商业空间的陈列与氛围生成。',
    prompt: 'Premium retail interior, clear product display rhythm, minimal architectural shell, tactile surfaces, soft directional spotlights, strong brand atmosphere, elegant circulation, high-end commercial interior photography.',
    category: '空间类型',
    tags: ['零售', '展厅', '陈列'],
    isFavorite: false,
  },
  {
    id: 'prompt-minimal',
    title: '当代极简',
    description: '用克制的体块、留白和材质关系，建立安静的空间表达。',
    prompt: 'Contemporary minimalism, restrained geometry, generous negative space, seamless built-in elements, quiet neutral palette, precise details, soft daylight, calm and timeless architectural composition.',
    category: '风格表达',
    tags: ['极简', '留白', '当代'],
    isFavorite: false,
  },
  {
    id: 'prompt-wabi-sabi',
    title: '侘寂自然',
    description: '强调手工质感、自然不规则和时间感，适合东方气质空间。',
    prompt: 'Wabi-sabi interior, imperfect handmade plaster, aged timber, natural stone, muted earth tones, organic shapes, tactile surfaces, quiet sunlight, Japanese restraint, authentic material aging.',
    category: '风格表达',
    tags: ['侘寂', '自然', '东方'],
    isFavorite: false,
  },
  {
    id: 'prompt-industrial',
    title: '精致工业风',
    description: '保留结构感和原始材质，同时控制空间的精致度与舒适度。',
    prompt: 'Refined industrial interior, exposed concrete, blackened steel, warm oak, vintage leather, crisp architectural lines, soft warm lighting, balanced raw and refined materials, sophisticated atmosphere.',
    category: '风格表达',
    tags: ['工业风', '混凝土', '金属'],
    isFavorite: false,
  },
  {
    id: 'prompt-stone-wood',
    title: '石材与木饰面',
    description: '用于控制主要硬装材质的组合关系，适合住宅和酒店效果图。',
    prompt: 'Material direction: honed light limestone, warm walnut veneer, subtle travertine texture, matte finish, refined grain alignment, natural tactile variation, balanced contrast between stone and wood.',
    category: '材质与色彩',
    tags: ['石材', '木饰面', '硬装'],
    isFavorite: false,
  },
  {
    id: 'prompt-warm-neutral',
    title: '暖中性色方案',
    description: '建立米白、沙色、木色和暖灰的低饱和空间色彩。',
    prompt: 'Warm neutral color palette, ivory, sand, oatmeal, warm gray and natural wood, low saturation, subtle tonal layering, elegant and restful atmosphere, no harsh contrast.',
    category: '材质与色彩',
    tags: ['配色', '暖色', '低饱和'],
    isFavorite: false,
  },
  {
    id: 'prompt-night-light',
    title: '夜景灯光氛围',
    description: '适合把白天空间转换成有层次的夜间效果图。',
    prompt: 'Nighttime interior lighting, layered indirect cove lighting, warm 2700K to 3000K color temperature, soft pools of light, controlled shadows, subtle reflections, intimate high-end atmosphere, realistic exposure.',
    category: '灯光与镜头',
    tags: ['夜景', '灯光', '氛围'],
    isFavorite: false,
  },
  {
    id: 'prompt-editorial',
    title: '建筑杂志镜头',
    description: '统一效果图的摄影语言，让空间更接近建筑杂志成片。',
    prompt: 'Editorial architectural photography, eye-level camera, 24mm wide-angle lens, balanced verticals, natural perspective, carefully composed foreground and background, soft directional daylight, premium architecture magazine quality.',
    category: '灯光与镜头',
    tags: ['摄影', '镜头', '建筑杂志'],
    isFavorite: false,
  },
  {
    id: 'prompt-material-swap',
    title: '材质替换任务',
    description: '适合在保留空间结构的前提下，只替换指定墙面、地面或家具材质。',
    prompt: 'Keep the original architecture, layout, camera angle and furniture placement unchanged. Replace only the specified material with [MATERIAL]. Preserve realistic scale, seams, texture direction, edge details and natural lighting.',
    category: '改造任务',
    tags: ['材质替换', '保持结构', '局部修改'],
    isFavorite: false,
  },
  {
    id: 'prompt-sketch-to-render',
    title: '草图转效果图',
    description: '将概念草图扩展为完整空间，同时尽量保留原始构图和设计意图。',
    prompt: 'Transform the provided architectural sketch into a realistic interior visualization. Preserve the original composition, proportions, openings and key design intent. Complete the materials, lighting, furniture and spatial details with coherent architectural logic.',
    category: '改造任务',
    tags: ['草图', '效果图', '构图保持'],
    isFavorite: false,
  },
  {
    id: 'prompt-no-people',
    title: '空间干净输出',
    description: '用于控制画面干净度，减少人物、杂物和不需要的视觉噪声。',
    prompt: 'No people, no animals, no clutter, no random objects, no text, no logo, no watermark, no distracting decorations, clean architectural visualization, coherent and realistic details.',
    category: '负面控制',
    tags: ['干净画面', '负面词', '无人物'],
    isFavorite: false,
  },
  {
    id: 'prompt-avoid-distortion',
    title: '避免建筑变形',
    description: '针对生成结果中的结构漂移、透视错误和材质溢出进行约束。',
    prompt: 'Avoid warped architecture, distorted perspective, floating furniture, duplicated objects, broken geometry, inconsistent scale, melted materials, overexposure, oversaturation and unrealistic reflections.',
    category: '负面控制',
    tags: ['结构稳定', '透视', '负面词'],
    isFavorite: false,
  },
];
