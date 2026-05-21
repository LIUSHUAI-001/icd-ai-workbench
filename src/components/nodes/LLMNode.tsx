import { memo, useState } from 'react';
import { Handle, Position, useReactFlow, type NodeProps } from '@xyflow/react';
import { AlertCircle, Brain, Loader2, Send } from 'lucide-react';
import { LLM_MODELS } from '../../providers/models';
import { generateLlm } from '../../services/generation';
import { useUpdateNodeData } from './useUpdateNodeData';
import { useRunTrigger } from '../../hooks/useRunTrigger';

/**
 * LLMNode - 使用独立 LLM Key
 * 支持 GPT-5 / Claude 4.5 / Gemini 2.5 Pro
 */
const LLMNode = ({ id, data, selected }: NodeProps) => {
  const update = useUpdateNodeData(id);
  const { getEdges, getNodes } = useReactFlow();
  const [error, setError] = useState<string | null>(null);

  const d = data as any;
  const model = d?.model || LLM_MODELS[0].id;
  const status: 'idle' | 'generating' | 'success' | 'error' = d?.status || 'idle';
  const reply = d?.reply as string | undefined;
  const localPrompt = d?.prompt || '';
  const systemPrompt = d?.system || '';

  const collectUpstream = (): string => {
    const edges = getEdges();
    const nodes = getNodes();
    const upstreamIds = edges.filter((e) => e.target === id).map((e) => e.source);
    const parts: string[] = [];
    for (const uid of upstreamIds) {
      const n = nodes.find((x) => x.id === uid);
      const p = (n?.data as any)?.prompt;
      if (p) parts.push(p.trim());
    }
    return parts.join('\n').trim();
  };

  const handleSend = async () => {
    setError(null);
    const upstream = collectUpstream();
    const userText = (upstream || localPrompt || '').trim();
    if (!userText) {
      setError('未连接 text 节点也未填写 prompt');
      return;
    }
    update({ status: 'generating', error: null });
    try {
      const messages = [];
      if (systemPrompt) messages.push({ role: 'system' as const, content: systemPrompt });
      messages.push({ role: 'user' as const, content: userText });
      const res = await generateLlm({ model, messages });
      // 输出 prompt 字段以便下游节点(图像/文本)可消费
      update({ status: 'success', reply: res.content, prompt: res.content });
    } catch (e: any) {
      setError(e?.message || '调用失败');
      update({ status: 'error', error: e?.message });
    }
  };

  // 接入运行总线,供批量运行调起
  useRunTrigger(id, handleSend);

  return (
    <div
      className={`relative rounded-xl border-2 transition-all w-[280px] ${
        selected ? 'border-emerald-400 shadow-2xl shadow-emerald-500/20' : 'border-white/15 hover:border-white/30'
      }`}
      style={{ background: 'rgba(20,20,22,.92)', backdropFilter: 'blur(8px)' }}
    >
      <Handle type="target" position={Position.Left} className="!bg-emerald-400 !border-0" />
      <Handle type="source" position={Position.Right} className="!bg-emerald-400 !border-0" />

      <div className="flex items-center gap-2 px-3 py-2 border-b border-white/10">
        <div
          className="w-6 h-6 rounded flex items-center justify-center"
          style={{ background: 'rgba(16,185,129,.2)', color: '#6ee7b7', boxShadow: 'inset 0 0 0 1px rgba(16,185,129,.45)' }}
        >
          <Brain size={13} />
        </div>
        <div className="flex-1">
          <div className="text-sm font-semibold text-white">LLM / Vision</div>
          <div className="text-[10px] text-white/40">独立 Key · 额度隔离</div>
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
            {LLM_MODELS.map((m) => (
              <option key={m.id} value={m.id} className="bg-zinc-900">
                {m.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-[10px] text-white/50 block mb-1">系统提示(可选)</label>
          <textarea
            value={systemPrompt}
            onChange={(e) => update({ system: e.target.value })}
            placeholder="如:你是专业的 AI 绘画提示词助手"
            className="w-full h-12 resize-none rounded bg-white/5 border border-white/10 px-2 py-1 text-[11px] text-white outline-none focus:border-white/30 placeholder:text-white/30"
          />
        </div>

        <div>
          <label className="text-[10px] text-white/50 block mb-1">用户输入(优先取上游)</label>
          <textarea
            value={localPrompt}
            onChange={(e) => update({ prompt: e.target.value })}
            placeholder="备用:无上游连接时使用"
            className="w-full h-14 resize-none rounded bg-white/5 border border-white/10 px-2 py-1 text-[11px] text-white outline-none focus:border-white/30 placeholder:text-white/30"
          />
        </div>

        <button
          onClick={handleSend}
          disabled={status === 'generating'}
          className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-medium disabled:opacity-50 transition-colors"
        >
          {status === 'generating' ? (
            <>
              <Loader2 size={12} className="animate-spin" /> 思考中...
            </>
          ) : (
            <>
              <Send size={12} /> 发送
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

      {reply && (
        <div className="border-t border-white/10 p-2">
          <div className="text-[10px] text-white/40 mb-1">回复(可作为下游 prompt)</div>
          <div className="text-[11px] text-white/80 whitespace-pre-wrap max-h-40 overflow-y-auto scrollbar-hide bg-white/[0.03] rounded p-2">
            {reply}
          </div>
        </div>
      )}
    </div>
  );
};

export default memo(LLMNode);
