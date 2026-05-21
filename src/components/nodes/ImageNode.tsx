import { memo, useMemo, useState } from 'react';
import { Handle, Position, useReactFlow, type NodeProps } from '@xyflow/react';
import { AlertCircle, Image as ImageIcon, Loader2, Sparkles } from 'lucide-react';
import { IMAGE_MODELS } from '../../providers/models';
import { generateImage } from '../../services/generation';
import { useUpdateNodeData } from './useUpdateNodeData';
import { useRunTrigger } from '../../hooks/useRunTrigger';

/**
 * ImageNode - ZhenzhenMagic
 * 支持 gpt-image-2 / nano-banana-2 / nano-banana-pro
 * 自动从上游连接的 text 节点读取 prompt
 */
const ImageNode = ({ id, data, selected }: NodeProps) => {
  const update = useUpdateNodeData(id);
  const { getEdges, getNodes } = useReactFlow();

  const [error, setError] = useState<string | null>(null);
  const d = data as any;
  const model = d?.model || IMAGE_MODELS[0].id;
  const size = d?.size || IMAGE_MODELS[0].defaultSize;
  const status: 'idle' | 'generating' | 'success' | 'error' = d?.status || 'idle';
  const imageUrl = d?.imageUrl as string | undefined;
  const localPrompt = d?.prompt || '';

  const modelDef = useMemo(() => IMAGE_MODELS.find((m) => m.id === model) || IMAGE_MODELS[0], [model]);

  // 从上游节点收集 prompt + image
  const collectUpstream = (): { prompt: string; imageUrl?: string } => {
    const edges = getEdges();
    const nodes = getNodes();
    const upstreamIds = edges.filter((e) => e.target === id).map((e) => e.source);
    const prompts: string[] = [];
    let imageUrl: string | undefined;
    for (const uid of upstreamIds) {
      const n = nodes.find((x) => x.id === uid);
      const p = (n?.data as any)?.prompt;
      if (p && typeof p === 'string') prompts.push(p.trim());
      const u = (n?.data as any)?.imageUrl;
      if (u && typeof u === 'string' && !imageUrl) imageUrl = u;
    }
    return { prompt: prompts.join('\n').trim(), imageUrl };
  };

  // 本地 URL 转 base64(仅需要时)
  const urlToBase64 = async (url: string): Promise<string> => {
    const r = await fetch(url);
    const blob = await r.blob();
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const handleGenerate = async () => {
    setError(null);
    const { prompt: upstreamPrompt, imageUrl: upstreamImage } = collectUpstream();
    const finalPrompt = (upstreamPrompt || localPrompt || '').trim();
    if (!finalPrompt) {
      setError('未连接 text 节点也未填写 prompt');
      return;
    }
    update({ status: 'generating', error: null });
    try {
      // 如果上游有图像且模型支持 i2i,转 base64
      let imageParam: string | undefined;
      const supportsI2I = modelDef.capabilities.includes('i2i') || modelDef.capabilities.includes('edit');
      if (supportsI2I && upstreamImage) {
        try {
          imageParam = await urlToBase64(upstreamImage);
        } catch (e) {
          console.warn('上游图像转码失败', e);
        }
      }
      const res = await generateImage({
        model,
        prompt: finalPrompt,
        size,
        n: 1,
        image: imageParam,
      });
      const url = res.urls?.[0];
      if (!url) throw new Error('上游未返回有效图像');
      update({
        status: 'success',
        imageUrl: url,
        lastPrompt: finalPrompt,
        usedI2I: !!imageParam,
      });
    } catch (e: any) {
      setError(e?.message || '生成失败');
      update({ status: 'error', error: e?.message });
    }
  };

  // 接入运行总线,供批量运行调起
  useRunTrigger(id, handleGenerate);

  return (
    <div
      className={`relative rounded-xl border-2 transition-all w-[280px] ${
        selected ? 'border-amber-400 shadow-2xl shadow-amber-500/20' : 'border-white/15 hover:border-white/30'
      }`}
      style={{ background: 'rgba(20,20,22,.92)', backdropFilter: 'blur(8px)' }}
    >
      <Handle type="target" position={Position.Left} className="!bg-amber-400 !border-0" />
      <Handle type="source" position={Position.Right} className="!bg-amber-400 !border-0" />

      {/* 头部 */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-white/10">
        <div
          className="w-6 h-6 rounded flex items-center justify-center"
          style={{ background: 'rgba(245,158,11,.2)', color: '#fcd34d', boxShadow: 'inset 0 0 0 1px rgba(245,158,11,.45)' }}
        >
          <ImageIcon size={13} />
        </div>
        <div className="flex-1">
          <div className="text-sm font-semibold text-white">ZhenzhenMagic</div>
          <div className="text-[10px] text-white/40">{modelDef.label}</div>
        </div>
      </div>

      {/* 配置区 */}
      <div className="p-2.5 space-y-2" onMouseDown={(e) => e.stopPropagation()}>
        {/* 模型选择 */}
        <div>
          <label className="text-[10px] text-white/50 block mb-1">模型</label>
          <select
            value={model}
            onChange={(e) => update({ model: e.target.value })}
            className="w-full rounded bg-white/5 border border-white/10 px-2 py-1 text-xs text-white outline-none focus:border-white/30"
          >
            {IMAGE_MODELS.map((m) => (
              <option key={m.id} value={m.id} className="bg-zinc-900">
                {m.label}
              </option>
            ))}
          </select>
        </div>
        {/* 尺寸 */}
        <div>
          <label className="text-[10px] text-white/50 block mb-1">尺寸</label>
          <select
            value={size}
            onChange={(e) => update({ size: e.target.value })}
            className="w-full rounded bg-white/5 border border-white/10 px-2 py-1 text-xs text-white outline-none focus:border-white/30"
          >
            {modelDef.sizes.map((s) => (
              <option key={s} value={s} className="bg-zinc-900">
                {s}
              </option>
            ))}
          </select>
        </div>

        {/* 备用本地 prompt(若无上游) */}
        <div>
          <label className="text-[10px] text-white/50 block mb-1">本地 Prompt(可选,优先取上游 text)</label>
          <textarea
            value={localPrompt}
            onChange={(e) => update({ prompt: e.target.value })}
            placeholder="备用:无上游连接时使用此提示词"
            className="w-full h-14 resize-none rounded bg-white/5 border border-white/10 px-2 py-1 text-[11px] text-white outline-none focus:border-white/30 placeholder:text-white/30"
          />
        </div>

        {/* 生成按钮 */}
        <button
          onClick={handleGenerate}
          disabled={status === 'generating'}
          className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-medium disabled:opacity-50 transition-colors"
        >
          {status === 'generating' ? (
            <>
              <Loader2 size={12} className="animate-spin" /> 生成中...
            </>
          ) : (
            <>
              <Sparkles size={12} /> 生成
            </>
          )}
        </button>

        {error && (
          <div className="flex items-start gap-1 text-[10px] text-red-300 bg-red-500/10 border border-red-500/20 rounded px-2 py-1">
            <AlertCircle size={11} className="mt-0.5 flex-shrink-0" />
            <span className="break-all">{error}</span>
          </div>
        )}
      </div>

      {/* 结果展示 */}
      {imageUrl && (
        <div className="border-t border-white/10 p-2">
          <img
            src={imageUrl}
            alt="生成结果"
            className="w-full rounded object-cover"
            style={{ aspectRatio: size.replace('x', '/') }}
          />
        </div>
      )}
    </div>
  );
};

export default memo(ImageNode);
