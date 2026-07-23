import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent, type FC } from 'react';
import { AlertCircle, CheckCircle2, ChevronRight, ImagePlus, Loader2, Sparkles, Upload, Wrench, X } from 'lucide-react';
import { generateImage, generateLlm, type LlmContentPart } from '../../services/generation';
import { uploadFileBlob } from '../../services/imageOps';
import { DEFAULT_LLM_MODEL, IMAGE_MODELS } from '../../providers/models';
import type { NodeType } from '../../types/canvas';
import type { CanvasSelectionSummary } from '../../utils/canvasCreativeWorkflow';
import type { IcdToolId } from './IcdToolLibrary';

interface IcdToolDetailDrawerProps {
  tool: IcdToolId | null;
  hasCanvas: boolean;
  onClose: () => void;
  onGetCanvasSelection: () => CanvasSelectionSummary | null;
  onAddNode: (type: NodeType, data: Record<string, any>) => void;
}

type RunState = 'idle' | 'running' | 'success' | 'error';

const COLOR_PLAN_STRUCTURE_PROMPT =
  '这是图像编辑任务，不是重新设计平面方案。仅改变图面的材质、配色、光影与视觉表现。严格保持输入图的构图范围、画布比例、墙体中心线与厚度、门窗开口、柱体、楼梯、房间边界、交通关系、家具数量和摆放位置，不得新增、删除、移动或合并任何空间与构件。墙体、门窗、家具、洁具、橱柜、灯具和绿植只允许改变材质、颜色与光影，不允许重绘成不同构件。';

const COLOR_PLAN_OUTPUT_PROMPT =
  '输出完整、清晰的专业室内彩平图，不裁切图纸，不增加边框、说明文字、Logo 或水印。不新增或改写任何尺寸数字和文字标签；无法准确保留原有标注时，宁可弱化文字，也不要生成伪文字。';

const COLOR_PLAN_STYLES = [
  {
    id: 'modern',
    label: '现代简约',
    prompt:
      '保持严格正交俯视。采用浅灰抛光大理石、白色墙面、白灰黑中性家具、玻璃与金属细节，阳台使用浅木纹并点缀少量绿植；整体干净明亮、精致克制，光影柔和。',
  },
  {
    id: 'natural',
    label: '自然温馨',
    prompt:
      '保持严格正交俯视。采用自然橡木、奶油色墙面、米色与原木家具、亚麻和棉质软装，卫生间使用米色瓷砖，并点缀少量室内植物；呈现柔和自然光和轻水彩质感。',
  },
  {
    id: 'marker',
    label: '马克笔手绘',
    prompt:
      '保持严格正交俯视。使用清晰黑色建筑线稿、马克笔平涂和轻水彩晕染，带有粗纹理纸张质感与可见笔触；色彩柔和内敛，空间层级清楚。',
  },
  {
    id: 'realistic',
    label: '超写实 3D',
    prompt:
      '保持 90 度正俯视，不改成透视视角。采用超写实 3D 室内渲染，自然光与柔和真实阴影，准确表现实木、织物、皮革、石材和金属纹理，细节高清但不过度锐化。',
  },
  {
    id: 'clay',
    label: '黏土微缩',
    prompt:
      '采用轻微斜俯视的 3D 微缩建筑模型与黏土渲染风格，墙体呈现合理厚度但布局完全不变；使用奶油色、原木色和浅灰色，搭配哑光木材与布艺，整体全局照明柔和。',
  },
  {
    id: 'parisian',
    label: '经典法式',
    prompt:
      '保持严格正交俯视。墙体剖面使用黑色与高级灰，主色为珍珠白、灰蓝和香槟色；卧室铺浅橡木人字或鱼骨拼地板，公共区采用浅灰白大理石，搭配弧形丝绒家具和克制黄铜细节。',
  },
  {
    id: 'quiet-luxury',
    label: '意式静奢',
    prompt:
      '保持严格正交俯视。墙体剖面使用黑色与高级灰，采用阿玛尼灰、碳黑、冷茶色和灰褐色；材质以深灰莱姆石、微水泥、哑光真皮、碳化木和黑钛金属为主，光线细腻柔和。',
  },
  {
    id: 'vector',
    label: '商业矢量',
    prompt:
      '保持严格正交俯视。采用扁平商业插画表达，墙体使用黑色与高级灰，配色为莫兰迪灰蓝、豆沙色和暖褐色；不使用渐变和写实阴影，根据实际功能区用克制色块、网格或线条分区，家具简化为二维几何图形。',
  },
] as const;

const MATERIAL_STYLES = [
  { id: 'apple', label: '高级材质分析图', prompt: 'Apple 极简产品板式，深色背景，材质样品与标注清晰，专业 moodboard' },
  { id: 'axon', label: '2.5D轴测建筑分析图', prompt: '2.5D 轴测建筑分析板，空间分解与材料标注，清晰专业' },
  { id: 'soft', label: '软装物料板', prompt: '室内软装物料板，家具灯具面料有序排版，编辑设计感' },
  { id: 'photo', label: '专业设计情绪板', prompt: '专业室内设计情绪板，真实物料摄影，留白克制，高级杂志感' },
  { id: 'kinfolk', label: 'Kinfolk编辑风', prompt: 'Kinfolk 编辑风格，米白底色，网格排版，安静自然，材质摄影' },
  { id: 'grid', label: '马卡龙前期分析展板', prompt: '前期设计分析展板，柔和色块与网格信息，可读性强' },
] as const;

const TOOL_TITLES: Record<IcdToolId, string> = {
  'color-plan': '一键彩平',
  'material-list': '物料清单',
  'texture-extract': '材质贴图提取',
};

const IMAGE_MODEL_OPTIONS = IMAGE_MODELS.filter((model) => model.capabilities.includes('i2i'));

function addImageNode(onAddNode: IcdToolDetailDrawerProps['onAddNode'], url: string, title: string) {
  onAddNode('upload', {
    uploadType: 'image',
    imageUrl: url,
    fileName: title,
    mime: 'image/png',
    fileSize: 0,
    source: 'icd-tool-library',
  });
}

export const IcdToolDetailDrawer: FC<IcdToolDetailDrawerProps> = ({
  tool,
  hasCanvas,
  onClose,
  onGetCanvasSelection,
  onAddNode,
}) => {
  const floorInputRef = useRef<HTMLInputElement>(null);
  const materialInputRef = useRef<HTMLInputElement>(null);
  const materialReferenceInputRef = useRef<HTMLInputElement>(null);
  const textureInputRef = useRef<HTMLInputElement>(null);
  const generationInFlightRef = useRef(false);
  const [floorImage, setFloorImage] = useState('');
  const [materialImage, setMaterialImage] = useState('');
  const [materialReference, setMaterialReference] = useState('');
  const [textureImage, setTextureImage] = useState('');
  const [colorStyle, setColorStyle] = useState<(typeof COLOR_PLAN_STYLES)[number]['id']>('modern');
  const [colorExtraPrompt, setColorExtraPrompt] = useState('');
  const [materialStyle, setMaterialStyle] = useState<(typeof MATERIAL_STYLES)[number]['id']>('apple');
  const [modelId, setModelId] = useState(IMAGE_MODEL_OPTIONS[0]?.id || 'gpt-image-2');
  const [uploading, setUploading] = useState(false);
  const [runState, setRunState] = useState<RunState>('idle');
  const [message, setMessage] = useState('');

  useEffect(() => {
    setRunState('idle');
    setMessage('');
  }, [tool]);

  const selectedModel = useMemo(
    () => IMAGE_MODEL_OPTIONS.find((model) => model.id === modelId) || IMAGE_MODEL_OPTIONS[0],
    [modelId],
  );

  const currentImage = tool === 'color-plan'
    ? floorImage
    : tool === 'material-list'
      ? materialImage
      : textureImage;

  const canRun = Boolean(tool && hasCanvas && currentImage && !uploading && runState !== 'running' && selectedModel);

  const uploadImage = useCallback(async (event: ChangeEvent<HTMLInputElement>, setter: (url: string) => void, prefix: string) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setUploading(true);
    setMessage('正在上传图片…');
    try {
      const url = await uploadFileBlob(file, `${prefix}-${Date.now()}-${file.name || 'image.png'}`);
      setter(url);
      setRunState('idle');
      setMessage('图片已就绪');
    } catch (error: any) {
      setRunState('error');
      setMessage(error?.message || '图片上传失败');
    } finally {
      setUploading(false);
    }
  }, []);

  const useCanvasImage = useCallback((setter: (url: string) => void) => {
    const summary = onGetCanvasSelection();
    const url = summary?.images?.[0]?.url || '';
    if (!url) {
      setRunState('error');
      setMessage('请先在画布中选中一个包含图片的节点');
      return;
    }
    setter(url);
    setRunState('idle');
    setMessage('已使用画布选中的图片');
  }, [onGetCanvasSelection]);

  const runImageTool = useCallback(async (prompt: string, images: string[], outputTitle: string) => {
    if (!selectedModel) throw new Error('没有可用的图像模型');
    const result = await generateImage({
      model: selectedModel.id,
      apiModel: selectedModel.apiModel,
      paramKind: selectedModel.paramKind,
      prompt,
      images,
      aspectRatio: selectedModel.defaultAspectRatio,
      aspect_ratio: selectedModel.defaultAspectRatio,
      sizeLevel: selectedModel.defaultSize,
      image_size: selectedModel.defaultSize,
      size: selectedModel.paramKind === 'seedream-v5'
        ? selectedModel.defaultSize
        : undefined,
      n: 1,
    });
    const outputUrl = result.urls.find(Boolean);
    if (!outputUrl) throw new Error('生成接口没有返回图片');
    addImageNode(onAddNode, outputUrl, outputTitle);
    return [outputUrl];
  }, [onAddNode, selectedModel]);

  const handleGenerate = useCallback(async () => {
    if (!tool || !canRun || !selectedModel || generationInFlightRef.current) return;
    generationInFlightRef.current = true;
    setRunState('running');
    setMessage('AI 正在处理中…');
    try {
      if (tool === 'color-plan') {
        const style = COLOR_PLAN_STYLES.find((item) => item.id === colorStyle) || COLOR_PLAN_STYLES[0];
        const extraPrompt = colorExtraPrompt.trim();
        await runImageTool(
          `${COLOR_PLAN_STRUCTURE_PROMPT} 风格表现：${style.prompt}${extraPrompt ? ` 用户补充要求：${extraPrompt}` : ''} ${COLOR_PLAN_OUTPUT_PROMPT}`,
          [floorImage],
          `一键彩平-${style.label}`,
        );
      } else if (tool === 'material-list') {
        const style = MATERIAL_STYLES.find((item) => item.id === materialStyle) || MATERIAL_STYLES[0];
        const content: LlmContentPart[] = [
          {
            type: 'text',
            text: '分析这张室内或建筑效果图，输出中文物料清单。按空间部位、材料名称、颜色、表面工艺、建议规格、可替代材料整理。内容简洁准确，使用 Markdown 表格，不要虚构品牌和价格。',
          },
          { type: 'image_url', image_url: { url: materialImage } },
        ];
        const analysis = await generateLlm({
          model: DEFAULT_LLM_MODEL,
          messages: [
            { role: 'system', content: '你是建筑与室内设计物料分析师，擅长从效果图识别材料并形成可执行清单。' },
            { role: 'user', content },
          ],
          temperature: 0.2,
          max_tokens: 4096,
        });
        onAddNode('text', {
          label: 'AI 物料清单',
          text: analysis.content,
          prompt: analysis.content,
          source: 'icd-tool-library',
        });
        try {
          await runImageTool(
            `基于输入的设计效果图制作一张专业物料清单视觉展板。准确提取并展示主要石材、木材、金属、玻璃、面料、涂料和家具材质样品。版式方向：${style.prompt}。参考清单：${analysis.content.slice(0, 1800)}。文字尽量少且清晰，不要虚构品牌和价格。`,
            [materialImage, ...(materialReference ? [materialReference] : [])],
            `物料清单-${style.label}`,
          );
        } catch (visualError: any) {
          setRunState('success');
          setMessage(`清单文字已加入画布；视觉展板生成失败：${visualError?.message || '未知错误'}`);
          return;
        }
      } else {
        await runImageTool(
          '从输入效果图中提取占比最大的主要表面材质，生成正交俯视、均匀光照、无透视、无阴影、无物体遮挡的方形 PBR 风格基础色贴图。纹理边缘连续、可平铺、色彩真实、高细节，不包含文字、边框和其他物体。',
          [textureImage],
          '材质贴图提取',
        );
      }
      setRunState('success');
      setMessage('处理完成，结果已加入当前画布');
    } catch (error: any) {
      setRunState('error');
      setMessage(error?.message || '处理失败');
    } finally {
      generationInFlightRef.current = false;
    }
  }, [canRun, colorExtraPrompt, colorStyle, floorImage, materialImage, materialReference, materialStyle, onAddNode, runImageTool, selectedModel, textureImage, tool]);

  if (!tool) return null;

  const inputConfig = tool === 'color-plan'
    ? { label: '上传户型图', image: floorImage, setter: setFloorImage, ref: floorInputRef, prefix: 'color-plan' }
    : tool === 'material-list'
      ? { label: '上传设计效果图', image: materialImage, setter: setMaterialImage, ref: materialInputRef, prefix: 'material-list' }
      : { label: '上传效果图', image: textureImage, setter: setTextureImage, ref: textureInputRef, prefix: 'texture-extract' };

  return (
    <aside className="icd-tool-detail" aria-label={`${TOOL_TITLES[tool]}参数`} data-icd-tool-detail data-canvas-floating-ui>
      <header className="icd-tool-detail__header">
        <span className="icd-tool-detail__brand"><Wrench size={14} /> AI工具</span>
        <span className="icd-tool-detail__title">{TOOL_TITLES[tool]} <ChevronRight size={13} /></span>
        <button type="button" onClick={onClose} aria-label="关闭工具参数"><X size={16} /></button>
      </header>

      <div className="icd-tool-detail__body">
        <section className="icd-tool-detail__section">
          <h3>{inputConfig.label}</h3>
          <div className={`icd-tool-upload${inputConfig.image ? ' has-image' : ''}`}>
            {inputConfig.image ? <img src={inputConfig.image} alt="已选择的输入图片" /> : <ImagePlus size={24} />}
            <div className="icd-tool-upload__actions">
              <button type="button" onClick={() => inputConfig.ref.current?.click()} disabled={uploading}>
                <Upload size={13} /> {inputConfig.image ? '重新上传' : '上传图片'}
              </button>
              <button type="button" onClick={() => useCanvasImage(inputConfig.setter)}>从画布选择</button>
            </div>
            {!inputConfig.image && <span>支持 PNG / JPG / WEBP</span>}
          </div>
          <input
            ref={inputConfig.ref}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            hidden
            onChange={(event) => void uploadImage(event, inputConfig.setter, inputConfig.prefix)}
          />
        </section>

        {tool === 'color-plan' && (
          <>
            <section className="icd-tool-detail__section">
              <h3>选择风格模板</h3>
              <div className="icd-tool-style-grid">
                {COLOR_PLAN_STYLES.map((style) => (
                  <button key={style.id} type="button" className={colorStyle === style.id ? 'is-active' : ''} onClick={() => setColorStyle(style.id)}>
                    <Sparkles size={15} /><strong>{style.label}</strong>
                  </button>
                ))}
              </div>
            </section>
            <section className="icd-tool-detail__section">
              <h3>补充要求（可选）</h3>
              <textarea
                className="icd-tool-detail__prompt"
                value={colorExtraPrompt}
                onChange={(event) => setColorExtraPrompt(event.target.value)}
                maxLength={800}
                placeholder="例如：地面统一浅灰色，保留所有原有家具，不要添加植物"
                aria-label="一键彩平补充要求"
              />
              <small className="icd-tool-detail__hint">会追加到默认结构保护规则之后</small>
            </section>
          </>
        )}

        {tool === 'material-list' && (
          <>
            <section className="icd-tool-detail__section">
              <h3>选择生成风格</h3>
              <div className="icd-tool-style-grid">
                {MATERIAL_STYLES.map((style) => (
                  <button key={style.id} type="button" className={materialStyle === style.id ? 'is-active' : ''} onClick={() => setMaterialStyle(style.id)}>
                    <Sparkles size={15} /><strong>{style.label}</strong>
                  </button>
                ))}
              </div>
            </section>
            <section className="icd-tool-detail__section">
              <h3>上传参考图（可选，用于排版参考）</h3>
              <button type="button" className="icd-tool-detail__reference" onClick={() => materialReferenceInputRef.current?.click()}>
                {materialReference ? <img src={materialReference} alt="物料清单排版参考" /> : <><ImagePlus size={17} /> 上传参考图</>}
              </button>
              <input ref={materialReferenceInputRef} type="file" accept="image/*" hidden onChange={(event) => void uploadImage(event, setMaterialReference, 'material-reference')} />
            </section>
          </>
        )}

        <section className="icd-tool-detail__section">
          <h3>选择生图模型</h3>
          <select value={modelId} onChange={(event) => setModelId(event.target.value)}>
            {IMAGE_MODEL_OPTIONS.map((model) => <option key={model.id} value={model.id}>{model.label}</option>)}
          </select>
        </section>
      </div>

      <footer className="icd-tool-detail__footer">
        {message && (
          <div className={`icd-tool-detail__status is-${runState}`}>
            {runState === 'running' ? <Loader2 className="animate-spin" size={13} /> : runState === 'error' ? <AlertCircle size={13} /> : runState === 'success' ? <CheckCircle2 size={13} /> : null}
            <span>{message}</span>
          </div>
        )}
        <button type="button" className="icd-tool-detail__generate" disabled={!canRun} onClick={() => void handleGenerate()}>
          {runState === 'running' ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
          {runState === 'running' ? '处理中…' : tool === 'texture-extract' ? '提取材质' : '立即生成'}
        </button>
        {!hasCanvas && <small>请先创建或选择一个画布</small>}
        {hasCanvas && !currentImage && <small>请先上传图片或从画布选择</small>}
      </footer>
    </aside>
  );
};
