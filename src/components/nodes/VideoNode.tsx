import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { Handle, Position, useReactFlow, type NodeProps } from '@xyflow/react';
import { AlertCircle, Loader2, Video as VideoIcon, Sparkles, Square } from 'lucide-react';
import { VIDEO_MODELS } from '../../providers/models';
import { submitVideo, queryVideo } from '../../services/generation';
import { useUpdateNodeData } from './useUpdateNodeData';
import { useRunTrigger } from '../../hooks/useRunTrigger';

/**
 * VideoNode - 异步视频生成
 * 支持 veo-3.1 / grok-video / seedance-2.0
 * 流程: submit → poll(5s 间隔) → 转存 → 展示
 * 优先取上游 text 节点的 prompt + 上游 image 节点的 imageUrl 作首帧
 */
const VideoNode = ({ id, data, selected }: NodeProps) => {
  const update = useUpdateNodeData(id);
  const { getEdges, getNodes } = useReactFlow();
  const [error, setError] = useState<string | null>(null);
  const pollTimer = useRef<number | null>(null);

  const d = data as any;
  const model = d?.model || VIDEO_MODELS[0].id;
  const aspectRatio = d?.aspectRatio || VIDEO_MODELS[0].defaultAspectRatio;
  const status: 'idle' | 'submitting' | 'polling' | 'success' | 'error' = d?.status || 'idle';
  const taskId: string | undefined = d?.taskId;
  const videoUrl: string | undefined = d?.videoUrl;
  const progress: string = d?.progress || '';
  const localPrompt: string = d?.prompt || '';

  const modelDef = useMemo(() => VIDEO_MODELS.find((m) => m.id === model) || VIDEO_MODELS[0], [model]);

  // 收集上游 prompt + 首帧图
  const collectUpstream = (): { prompt: string; imageUrls: string[] } => {
    const edges = getEdges();
    const nodes = getNodes();
    const upstreamIds = edges.filter((e) => e.target === id).map((e) => e.source);
    const prompts: string[] = [];
    const imageUrls: string[] = [];
    for (const uid of upstreamIds) {
      const n = nodes.find((x) => x.id === uid);
      const p = (n?.data as any)?.prompt;
      if (p && typeof p === 'string') prompts.push(p.trim());
      const u = (n?.data as any)?.imageUrl;
      if (u && typeof u === 'string') imageUrls.push(u);
    }
    return { prompt: prompts.join('\n').trim(), imageUrls };
  };

  // 把本地 URL 转为 base64
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

  const stopPoll = () => {
    if (pollTimer.current) {
      window.clearInterval(pollTimer.current);
      pollTimer.current = null;
    }
  };

  useEffect(() => () => stopPoll(), []);

  const startPolling = (tid: string) => {
    stopPoll();
    let elapsed = 0;
    const POLL_INT = 5000;
    const MAX = 480; // 40 分钟
    pollTimer.current = window.setInterval(async () => {
      elapsed += 1;
      if (elapsed > MAX) {
        stopPoll();
        update({ status: 'error', error: '轮询超时' });
        setError('轮询超时');
        return;
      }
      try {
        const r = await queryVideo(tid);
        if (r.status === 'SUCCESS' && r.videoUrl) {
          stopPoll();
          update({ status: 'success', videoUrl: r.videoUrl, progress: '100%' });
        } else if (r.status === 'FAILURE') {
          stopPoll();
          update({ status: 'error', error: r.failReason || '生成失败' });
          setError(r.failReason || '生成失败');
        } else {
          update({ status: 'polling', progress: r.progress || '' });
        }
      } catch (e: any) {
        // 偶尔失败不停止
        console.warn('轮询出错', e?.message);
      }
    }, POLL_INT);
  };

  const handleGenerate = async () => {
    setError(null);
    const { prompt: upstreamPrompt, imageUrls } = collectUpstream();
    const finalPrompt = (upstreamPrompt || localPrompt || '').trim();
    if (!finalPrompt) {
      setError('未连接 text 节点也未填写 prompt');
      return;
    }
    update({ status: 'submitting', error: null, videoUrl: null, taskId: null });
    try {
      // 转 base64(可选)
      let images: string[] | undefined;
      if (modelDef.supportImages && imageUrls.length > 0) {
        const arr: string[] = [];
        for (const u of imageUrls.slice(0, 3)) {
          try {
            arr.push(await urlToBase64(u));
          } catch (e) {
            console.warn('图像编码失败', e);
          }
        }
        if (arr.length) images = arr;
      }
      const r = await submitVideo({
        model,
        prompt: finalPrompt,
        aspect_ratio: aspectRatio,
        images,
      });
      update({ status: 'polling', taskId: r.taskId, lastPrompt: finalPrompt });
      startPolling(r.taskId);
    } catch (e: any) {
      setError(e?.message || '提交失败');
      update({ status: 'error', error: e?.message });
    }
  };

  const handleStop = () => {
    stopPoll();
    update({ status: 'idle' });
  };

  // 接入运行总线,供批量运行调起(仅不能重复调起正在轮询中的任务)
  useRunTrigger(id, async () => {
    if (status === 'submitting' || status === 'polling') return;
    await handleGenerate();
  });

  const isBusy = status === 'submitting' || status === 'polling';

  return (
    <div
      className={`relative rounded-xl border-2 transition-all w-[280px] ${
        selected ? 'border-rose-400 shadow-2xl shadow-rose-500/20' : 'border-white/15 hover:border-white/30'
      }`}
      style={{ background: 'rgba(20,20,22,.92)', backdropFilter: 'blur(8px)' }}
    >
      <Handle type="target" position={Position.Left} className="!bg-rose-400 !border-0" />
      <Handle type="source" position={Position.Right} className="!bg-rose-400 !border-0" />

      <div className="flex items-center gap-2 px-3 py-2 border-b border-white/10">
        <div
          className="w-6 h-6 rounded flex items-center justify-center"
          style={{ background: 'rgba(244,63,94,.2)', color: '#fda4af', boxShadow: 'inset 0 0 0 1px rgba(244,63,94,.45)' }}
        >
          <VideoIcon size={13} />
        </div>
        <div className="flex-1">
          <div className="text-sm font-semibold text-white">视频</div>
          <div className="text-[10px] text-white/40">{modelDef.label}</div>
        </div>
      </div>

      <div className="p-2.5 space-y-2" onMouseDown={(e) => e.stopPropagation()}>
        <div>
          <label className="text-[10px] text-white/50 block mb-1">模型</label>
          <select
            value={model}
            onChange={(e) => update({ model: e.target.value })}
            className="w-full rounded bg-white/5 border border-white/10 px-2 py-1 text-xs text-white outline-none focus:border-white/30"
          >
            {VIDEO_MODELS.map((m) => (
              <option key={m.id} value={m.id} className="bg-zinc-900">
                {m.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-[10px] text-white/50 block mb-1">宽高比</label>
          <select
            value={aspectRatio}
            onChange={(e) => update({ aspectRatio: e.target.value })}
            className="w-full rounded bg-white/5 border border-white/10 px-2 py-1 text-xs text-white outline-none focus:border-white/30"
          >
            {(modelDef.aspectRatios || ['16:9']).map((r) => (
              <option key={r} value={r} className="bg-zinc-900">
                {r}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-[10px] text-white/50 block mb-1">本地 Prompt(可选)</label>
          <textarea
            value={localPrompt}
            onChange={(e) => update({ prompt: e.target.value })}
            placeholder="备用:无上游连接时使用"
            className="w-full h-12 resize-none rounded bg-white/5 border border-white/10 px-2 py-1 text-[11px] text-white outline-none focus:border-white/30 placeholder:text-white/30"
          />
        </div>

        {!isBusy ? (
          <button
            onClick={handleGenerate}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 text-xs font-medium transition-colors"
          >
            <Sparkles size={12} /> 生成视频
          </button>
        ) : (
          <button
            onClick={handleStop}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded bg-zinc-500/20 hover:bg-zinc-500/30 text-zinc-200 text-xs font-medium transition-colors"
          >
            <Square size={11} /> 停止({progress || (status === 'submitting' ? '提交中' : '排队中')})
          </button>
        )}

        {isBusy && (
          <div className="flex items-center gap-1 text-[10px] text-rose-200/80">
            <Loader2 size={11} className="animate-spin" />
            {status === 'submitting' ? '提交任务...' : `轮询中 ${progress}`}
            {taskId && <span className="ml-auto text-white/30">{taskId.slice(0, 10)}…</span>}
          </div>
        )}

        {error && (
          <div className="flex items-start gap-1 text-[10px] text-red-300 bg-red-500/10 border border-red-500/20 rounded px-2 py-1">
            <AlertCircle size={11} className="mt-0.5 flex-shrink-0" />
            <span className="break-all">{error}</span>
          </div>
        )}
      </div>

      {videoUrl && (
        <div className="border-t border-white/10 p-2">
          <video
            src={videoUrl}
            controls
            className="w-full rounded"
            style={{ aspectRatio: aspectRatio.replace(':', '/') }}
          />
        </div>
      )}
    </div>
  );
};

export default memo(VideoNode);
