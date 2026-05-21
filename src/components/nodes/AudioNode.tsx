import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { Handle, Position, useReactFlow, type NodeProps } from '@xyflow/react';
import { AlertCircle, Loader2, Music, Sparkles, Square } from 'lucide-react';
import { submitAudio, queryAudio, type AudioMode } from '../../services/generation';
import { useUpdateNodeData } from './useUpdateNodeData';
import { useRunTrigger } from '../../hooks/useRunTrigger';

/**
 * AudioNode - Suno V5.5 (generate / cover / extend)
 * 异步任务,2 clips,本地轮询每 5s
 */
const SUNO_VERSIONS = [
  { id: 'suno-v5.5', label: 'Suno V5.5' },
  { id: 'suno-v5', label: 'Suno V5' },
  { id: 'suno-v4.5', label: 'Suno V4.5' },
  { id: 'suno-v4', label: 'Suno V4' },
];

const MODES: Array<{ id: AudioMode; label: string }> = [
  { id: 'generate', label: '生成' },
  { id: 'cover', label: '翻唱' },
  { id: 'extend', label: '续写' },
];

const AudioNode = ({ id, data, selected }: NodeProps) => {
  const update = useUpdateNodeData(id);
  const { getEdges, getNodes } = useReactFlow();
  const [error, setError] = useState<string | null>(null);
  const pollTimer = useRef<number | null>(null);

  const d = data as any;
  const mode: AudioMode = d?.mode || 'generate';
  const version: string = d?.version || 'suno-v5.5';
  const title: string = d?.title || '';
  const tags: string = d?.tags || '';
  const localPrompt: string = d?.prompt || '';
  const continueAt: number = d?.continueAt ?? 28;
  const continueClipId: string = d?.continueClipId || '';
  const coverClipId: string = d?.coverClipId || '';
  const status: 'idle' | 'submitting' | 'polling' | 'success' | 'error' = d?.status || 'idle';
  const taskId: string | undefined = d?.taskId;
  const tracks: Array<{ audioUrl: string; imageUrl?: string; title?: string }> = d?.tracks || [];

  const stopPoll = () => {
    if (pollTimer.current) {
      window.clearInterval(pollTimer.current);
      pollTimer.current = null;
    }
  };
  useEffect(() => () => stopPoll(), []);

  const collectUpstreamPrompt = (): string => {
    const edges = getEdges();
    const nodes = getNodes();
    const upstreamIds = edges.filter((e) => e.target === id).map((e) => e.source);
    const prompts: string[] = [];
    for (const uid of upstreamIds) {
      const n = nodes.find((x) => x.id === uid);
      const p = (n?.data as any)?.prompt;
      if (p && typeof p === 'string') prompts.push(p.trim());
    }
    return prompts.join('\n').trim();
  };

  const startPolling = (clipIds: string[]) => {
    stopPoll();
    let elapsed = 0;
    const POLL_INT = 5000;
    const MAX = 120; // 10 分钟
    pollTimer.current = window.setInterval(async () => {
      elapsed += 1;
      if (elapsed > MAX) {
        stopPoll();
        update({ status: 'error', error: '轮询超时' });
        setError('轮询超时');
        return;
      }
      try {
        const r = await queryAudio(clipIds);
        if (r.status === 'SUCCESS' && r.tracks.length > 0) {
          stopPoll();
          update({ status: 'success', tracks: r.tracks });
        } else {
          update({ status: 'polling', completed: r.completed, total: r.total });
        }
      } catch (e: any) {
        console.warn('音频轮询出错', e?.message);
      }
    }, POLL_INT);
  };

  const useDef: any = useMemo(() => ({}), []);
  void useDef;

  const handleGenerate = async () => {
    setError(null);
    const upstreamPrompt = collectUpstreamPrompt();
    const finalPrompt = (upstreamPrompt || localPrompt || '').trim();
    if (mode !== 'extend' && !finalPrompt) {
      setError('请填写歌词/提示词');
      return;
    }
    if (mode === 'cover' && !coverClipId) {
      setError('翻唱模式需提供 cover_clip_id');
      return;
    }
    if (mode === 'extend' && !continueClipId) {
      setError('续写模式需提供 continue_clip_id');
      return;
    }
    update({ status: 'submitting', error: null, tracks: [] });
    try {
      const r = await submitAudio({
        mode,
        prompt: finalPrompt,
        title,
        tags,
        version,
        cover_clip_id: mode === 'cover' ? coverClipId : undefined,
        continue_clip_id: mode === 'extend' ? continueClipId : undefined,
        continue_at: mode === 'extend' ? continueAt : undefined,
      });
      update({ status: 'polling', taskId: r.taskId, clipIds: r.clipIds, lastPrompt: finalPrompt });
      if (r.clipIds && r.clipIds.length > 0) {
        startPolling(r.clipIds);
      } else {
        // 极端情况下没拿到 clipIds,直接拿 taskId 查
        startPolling([r.taskId]);
      }
    } catch (e: any) {
      setError(e?.message || '提交失败');
      update({ status: 'error', error: e?.message });
    }
  };

  const handleStop = () => {
    stopPoll();
    update({ status: 'idle' });
  };

  // 接入运行总线,供批量运行调起(不重复调起轮询中的任务)
  useRunTrigger(id, async () => {
    if (status === 'submitting' || status === 'polling') return;
    await handleGenerate();
  });

  const isBusy = status === 'submitting' || status === 'polling';

  return (
    <div
      className={`relative rounded-xl border-2 transition-all w-[300px] ${
        selected ? 'border-violet-400 shadow-2xl shadow-violet-500/20' : 'border-white/15 hover:border-white/30'
      }`}
      style={{ background: 'rgba(20,20,22,.92)', backdropFilter: 'blur(8px)' }}
    >
      <Handle type="target" position={Position.Left} className="!bg-violet-400 !border-0" />
      <Handle type="source" position={Position.Right} className="!bg-violet-400 !border-0" />

      <div className="flex items-center gap-2 px-3 py-2 border-b border-white/10">
        <div
          className="w-6 h-6 rounded flex items-center justify-center"
          style={{ background: 'rgba(139,92,246,.2)', color: '#c4b5fd', boxShadow: 'inset 0 0 0 1px rgba(139,92,246,.45)' }}
        >
          <Music size={13} />
        </div>
        <div className="flex-1">
          <div className="text-sm font-semibold text-white">音频 Suno</div>
          <div className="text-[10px] text-white/40">
            {SUNO_VERSIONS.find((v) => v.id === version)?.label} · {MODES.find((m) => m.id === mode)?.label}
          </div>
        </div>
      </div>

      <div className="p-2.5 space-y-2" onMouseDown={(e) => e.stopPropagation()}>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] text-white/50 block mb-1">模式</label>
            <select
              value={mode}
              onChange={(e) => update({ mode: e.target.value })}
              className="w-full rounded bg-white/5 border border-white/10 px-2 py-1 text-xs text-white outline-none focus:border-white/30"
            >
              {MODES.map((m) => (
                <option key={m.id} value={m.id} className="bg-zinc-900">
                  {m.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[10px] text-white/50 block mb-1">版本</label>
            <select
              value={version}
              onChange={(e) => update({ version: e.target.value })}
              className="w-full rounded bg-white/5 border border-white/10 px-2 py-1 text-xs text-white outline-none focus:border-white/30"
            >
              {SUNO_VERSIONS.map((v) => (
                <option key={v.id} value={v.id} className="bg-zinc-900">
                  {v.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="text-[10px] text-white/50 block mb-1">标题</label>
          <input
            type="text"
            value={title}
            onChange={(e) => update({ title: e.target.value })}
            placeholder="My Song"
            className="w-full rounded bg-white/5 border border-white/10 px-2 py-1 text-xs text-white outline-none focus:border-white/30 placeholder:text-white/30"
          />
        </div>
        <div>
          <label className="text-[10px] text-white/50 block mb-1">风格 Tags</label>
          <input
            type="text"
            value={tags}
            onChange={(e) => update({ tags: e.target.value })}
            placeholder="pop, electronic, female vocal"
            className="w-full rounded bg-white/5 border border-white/10 px-2 py-1 text-xs text-white outline-none focus:border-white/30 placeholder:text-white/30"
          />
        </div>
        <div>
          <label className="text-[10px] text-white/50 block mb-1">歌词 / 提示词</label>
          <textarea
            value={localPrompt}
            onChange={(e) => update({ prompt: e.target.value })}
            placeholder="[Verse]..."
            className="w-full h-16 resize-none rounded bg-white/5 border border-white/10 px-2 py-1 text-[11px] text-white outline-none focus:border-white/30 placeholder:text-white/30"
          />
        </div>

        {mode === 'cover' && (
          <div>
            <label className="text-[10px] text-white/50 block mb-1">cover_clip_id</label>
            <input
              type="text"
              value={coverClipId}
              onChange={(e) => update({ coverClipId: e.target.value })}
              placeholder="原曲 clip id"
              className="w-full rounded bg-white/5 border border-white/10 px-2 py-1 text-xs text-white outline-none focus:border-white/30 placeholder:text-white/30"
            />
          </div>
        )}
        {mode === 'extend' && (
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2">
              <label className="text-[10px] text-white/50 block mb-1">continue_clip_id</label>
              <input
                type="text"
                value={continueClipId}
                onChange={(e) => update({ continueClipId: e.target.value })}
                placeholder="续写 clip id"
                className="w-full rounded bg-white/5 border border-white/10 px-2 py-1 text-xs text-white outline-none focus:border-white/30 placeholder:text-white/30"
              />
            </div>
            <div>
              <label className="text-[10px] text-white/50 block mb-1">续点(s)</label>
              <input
                type="number"
                value={continueAt}
                onChange={(e) => update({ continueAt: parseInt(e.target.value) || 28 })}
                className="w-full rounded bg-white/5 border border-white/10 px-2 py-1 text-xs text-white outline-none focus:border-white/30"
              />
            </div>
          </div>
        )}

        {!isBusy ? (
          <button
            onClick={handleGenerate}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded bg-violet-500/20 hover:bg-violet-500/30 text-violet-200 text-xs font-medium transition-colors"
          >
            <Sparkles size={12} /> 生成音频
          </button>
        ) : (
          <button
            onClick={handleStop}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded bg-zinc-500/20 hover:bg-zinc-500/30 text-zinc-200 text-xs font-medium transition-colors"
          >
            <Square size={11} /> 停止
          </button>
        )}

        {isBusy && (
          <div className="flex items-center gap-1 text-[10px] text-violet-200/80">
            <Loader2 size={11} className="animate-spin" />
            {status === 'submitting' ? '提交任务...' : `轮询中`}
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

      {tracks.length > 0 && (
        <div className="border-t border-white/10 p-2 space-y-2">
          {tracks.map((t, i) => (
            <div key={i} className="space-y-1">
              {t.title && <div className="text-[10px] text-white/60 truncate">🎵 {t.title}</div>}
              <audio src={t.audioUrl} controls className="w-full h-8" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default memo(AudioNode);
