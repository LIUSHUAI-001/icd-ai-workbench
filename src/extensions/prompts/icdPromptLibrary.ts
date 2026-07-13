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
    prompt: '高级住宅客厅，安静的当代建筑气质，天然石材，温暖胡桃木，柔软亚麻家具，层次丰富的间接照明，细腻的材质转折，建筑杂志摄影感，真实比例，高细节。',
    category: '空间类型',
    tags: ['住宅', '客厅', '高级感'],
    isFavorite: false,
  },
  {
    id: 'prompt-hotel-lobby',
    title: '精品酒店大堂',
    description: '用于酒店、会所和接待空间，强调尺度、秩序与到达体验。',
    prompt: '精品酒店大堂，开阔有序的空间序列，雕塑感接待台，纹理石材，拉丝黄铜细节，温暖环境光，精心选择的家具，安静奢华，电影感建筑摄影，真实材质。',
    category: '空间类型',
    tags: ['酒店', '大堂', '商业空间'],
    isFavorite: false,
  },
  {
    id: 'prompt-retail',
    title: '精品零售空间',
    description: '适合品牌店、展厅和商业空间的陈列与氛围生成。',
    prompt: '高端零售空间，清晰的产品陈列节奏，简洁的建筑外壳，具有触感的表面，柔和定向射灯，鲜明的品牌氛围，优雅的动线，高端商业空间摄影。',
    category: '空间类型',
    tags: ['零售', '展厅', '陈列'],
    isFavorite: false,
  },
  {
    id: 'prompt-minimal',
    title: '当代极简',
    description: '用克制的体块、留白和材质关系，建立安静的空间表达。',
    prompt: '当代极简主义，克制的几何体块，充足留白，无缝一体化柜体，安静的中性色调，精准细节，柔和日光，平静且经得起时间考验的建筑构图。',
    category: '风格表达',
    tags: ['极简', '留白', '当代'],
    isFavorite: false,
  },
  {
    id: 'prompt-wabi-sabi',
    title: '侘寂自然',
    description: '强调手工质感、自然不规则和时间感，适合东方气质空间。',
    prompt: '侘寂室内空间，不完美的手工灰泥，具有时间感的木材，天然石材，低饱和大地色，有机形态，富有触感的表面，安静日光，日式克制，真实自然的材质老化。',
    category: '风格表达',
    tags: ['侘寂', '自然', '东方'],
    isFavorite: false,
  },
  {
    id: 'prompt-industrial',
    title: '精致工业风',
    description: '保留结构感和原始材质，同时控制空间的精致度与舒适度。',
    prompt: '精致工业风室内空间，清水混凝土，黑化钢材，温暖橡木，复古皮革，清晰建筑线条，柔和暖光，平衡粗粝与精致材质，成熟而舒适的氛围。',
    category: '风格表达',
    tags: ['工业风', '混凝土', '金属'],
    isFavorite: false,
  },
  {
    id: 'prompt-stone-wood',
    title: '石材与木饰面',
    description: '用于控制主要硬装材质的组合关系，适合住宅和酒店效果图。',
    prompt: '材质方向：细磨浅色石灰岩，温暖胡桃木饰面，细腻洞石纹理，哑光表面，精确的木纹对齐，自然触感变化，平衡石材与木材的明暗对比。',
    category: '材质与色彩',
    tags: ['石材', '木饰面', '硬装'],
    isFavorite: false,
  },
  {
    id: 'prompt-warm-neutral',
    title: '暖中性色方案',
    description: '建立米白、沙色、木色和暖灰的低饱和空间色彩。',
    prompt: '暖中性色彩方案，象牙白、沙色、燕麦色、暖灰和天然木色，低饱和度，细微的色调层次，优雅放松的氛围，避免强烈对比。',
    category: '材质与色彩',
    tags: ['配色', '暖色', '低饱和'],
    isFavorite: false,
  },
  {
    id: 'prompt-night-light',
    title: '夜景灯光氛围',
    description: '适合把白天空间转换成有层次的夜间效果图。',
    prompt: '夜间室内灯光，层次丰富的间接灯槽照明，2700K 至 3000K 暖色温，柔和的光池，受控阴影，细微反射，亲密的高端氛围，真实曝光。',
    category: '灯光与镜头',
    tags: ['夜景', '灯光', '氛围'],
    isFavorite: false,
  },
  {
    id: 'prompt-editorial',
    title: '建筑杂志镜头',
    description: '统一效果图的摄影语言，让空间更接近建筑杂志成片。',
    prompt: '建筑杂志摄影，平视相机视角，24毫米广角镜头，垂直线条保持平衡，自然透视，精心安排的前景与背景，柔和定向日光，高端建筑杂志成片质量。',
    category: '灯光与镜头',
    tags: ['摄影', '镜头', '建筑杂志'],
    isFavorite: false,
  },
  {
    id: 'prompt-material-swap',
    title: '材质替换任务',
    description: '适合在保留空间结构的前提下，只替换指定墙面、地面或家具材质。',
    prompt: '保持原有建筑、布局、相机角度和家具位置不变。仅将指定材质替换为【材质】。保持真实尺度、接缝、纹理方向、边缘细节和自然光照。',
    category: '改造任务',
    tags: ['材质替换', '保持结构', '局部修改'],
    isFavorite: false,
  },
  {
    id: 'prompt-sketch-to-render',
    title: '草图转效果图',
    description: '将概念草图扩展为完整空间，同时尽量保留原始构图和设计意图。',
    prompt: '将提供的建筑草图转化为真实室内效果图。保留原始构图、比例、开口和核心设计意图。以统一的建筑逻辑补充材质、灯光、家具和空间细节。',
    category: '改造任务',
    tags: ['草图', '效果图', '构图保持'],
    isFavorite: false,
  },
  {
    id: 'prompt-no-people',
    title: '空间干净输出',
    description: '用于控制画面干净度，减少人物、杂物和不需要的视觉噪声。',
    prompt: '不要人物，不要动物，不要杂物，不要随机物体，不要文字，不要标志，不要水印，不要干扰性装饰，保持建筑效果图画面干净，细节统一且真实。',
    category: '负面控制',
    tags: ['干净画面', '负面词', '无人物'],
    isFavorite: false,
  },
  {
    id: 'prompt-avoid-distortion',
    title: '避免建筑变形',
    description: '针对生成结果中的结构漂移、透视错误和材质溢出进行约束。',
    prompt: '避免建筑变形、透视错误、家具悬浮、物体重复、几何结构破损、尺度不一致、材质融化、曝光过度、色彩过饱和和不真实反射。',
    category: '负面控制',
    tags: ['结构稳定', '透视', '负面词'],
    isFavorite: false,
  },
];
