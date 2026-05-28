import { useEffect, useMemo, useRef, useState } from 'react';
import { Box, CheckCircle2, ExternalLink, Library, MonitorUp, PackagePlus, Send as SendIcon, UploadCloud, X } from 'lucide-react';
import type { CanvasListItem } from '../types/canvas';
import { useThemeStore } from '../stores/theme';
import type { SendTargetMode, SendableMaterial } from '../utils/sendMaterials';
import { bucketSendableMaterials, summarizeSendableMaterials } from '../utils/sendMaterials';

interface SendMaterialsModalProps {
  open: boolean;
  materials: SendableMaterial[];
  sourceLabel: string;
  defaultMode?: SendTargetMode;
  canvases: CanvasListItem[];
  activeCanvasId: string | null;
  onClose: () => void;
  onSendToCanvas: (targetCanvasId: string, mode: SendTargetMode, switchAfter: boolean) => Promise<void> | void;
  onSaveToResource: () => Promise<void> | void;
  onSendToEagle: () => Promise<void> | void;
}

const MODE_OPTIONS: Array<{ value: SendTargetMode; label: string; desc: string; icon: typeof PackagePlus }> = [
  { value: 'auto', label: '智能保持', desc: '尽量按来源类型还原到目标画布', icon: MonitorUp },
  { value: 'material-set', label: '合并素材集', desc: '同类型素材打包成素材集，方便继续传给生成节点', icon: PackagePlus },
  { value: 'upload', label: '上传素材', desc: '图像/视频/音频以合集上传节点出现，文本生成文本节点', icon: UploadCloud },
  { value: 'split-upload', label: '拆成多个上传', desc: '每个媒体单独一个上传节点，适合逐个调整', icon: Box },
  { value: 'output', label: '输出素材', desc: '以输出素材节点展示，适合跨画布归档结果', icon: MonitorUp },
];

export default function SendMaterialsModal({
  open,
  materials,
  sourceLabel,
  defaultMode = 'auto',
  canvases,
  activeCanvasId,
  onClose,
  onSendToCanvas,
  onSaveToResource,
  onSendToEagle,
}: SendMaterialsModalProps) {
  const { theme, style } = useThemeStore();
  const isDark = theme === 'dark';
  const isPixel = style === 'pixel';
  const [mode, setMode] = useState<SendTargetMode>(defaultMode);
  const [targetId, setTargetId] = useState('');
  const [q, setQ] = useState('');
  const [switchAfter, setSwitchAfter] = useState(false);
  const [busy, setBusy] = useState('');
  const busyRef = useRef(false);

  useEffect(() => {
    if (!open) return;
    setMode(defaultMode);
    setTargetId((prev) => prev || activeCanvasId || canvases[0]?.id || '');
    setQ('');
    setSwitchAfter(false);
    setBusy('');
    busyRef.current = false;
  }, [open, defaultMode, activeCanvasId, canvases]);

  const buckets = useMemo(() => bucketSendableMaterials(materials), [materials]);
  const summary = useMemo(() => summarizeSendableMaterials(materials), [materials]);
  const filteredCanvases = useMemo(() => {
    const keyword = q.trim().toLowerCase();
    if (!keyword) return canvases;
    return canvases.filter((canvas) => canvas.name.toLowerCase().includes(keyword));
  }, [canvases, q]);
  const selectedCanvas = useMemo(
    () => canvases.find((canvas) => canvas.id === targetId) || null,
    [canvases, targetId],
  );
  const selectedMode = useMemo(
    () => MODE_OPTIONS.find((opt) => opt.value === mode) || MODE_OPTIONS[0],
    [mode],
  );

  if (!open) return null;

  const panelCls = isPixel
    ? 'border-2 border-[var(--px-ink)] bg-[var(--px-surface)] text-[var(--px-ink)] shadow-[4px_4px_0_var(--px-ink)]'
    : isDark
      ? 'border border-white/12 bg-zinc-950 text-zinc-100 shadow-2xl shadow-black/50'
      : 'border border-black/10 bg-white text-zinc-900 shadow-2xl shadow-black/20';
  const inputCls = isPixel
    ? 'px-input'
    : `rounded-md border px-3 py-2 text-sm outline-none ${isDark ? 'border-white/10 bg-white/5 text-white placeholder:text-white/35' : 'border-black/10 bg-black/5 text-zinc-900 placeholder:text-zinc-400'}`;
  const ghostBtn = isPixel
    ? 'px-btn px-btn--sm px-btn--ghost'
    : `rounded-md border px-3 py-2 text-sm ${isDark ? 'border-white/10 hover:bg-white/10' : 'border-black/10 hover:bg-black/5'}`;
  const primaryBtn = isPixel
    ? 'px-btn px-btn--sm px-btn--mint'
    : 'rounded-md border border-[var(--t8-primary)] bg-[var(--t8-primary)] px-3 py-2 text-sm font-semibold text-[var(--t8-on-primary)] hover:brightness-105';

  const runAction = async (label: string, action: () => Promise<void> | void) => {
    if (busyRef.current) return;
    try {
      busyRef.current = true;
      setBusy(label);
      await action();
    } finally {
      busyRef.current = false;
      setBusy('');
    }
  };

  return (
    <div data-canvas-floating-ui="send-materials-modal" className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/45" onClick={busy ? undefined : onClose} />
      <section className={`relative w-[760px] max-w-[calc(100vw-24px)] overflow-hidden rounded-xl ${panelCls}`}>
        <header className={`flex items-center justify-between gap-3 px-4 py-3 ${isPixel ? 'border-b-2 border-[var(--px-ink)] bg-[var(--px-muted)]' : isDark ? 'border-b border-white/10' : 'border-b border-black/10'}`}>
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-base font-semibold">
              <SendIcon size={18} />
              <span>发送素材</span>
            </div>
            <div className="mt-1 truncate text-xs opacity-65">{sourceLabel} · {summary}</div>
          </div>
          <button type="button" className="t8-mini-icon-button" title="关闭" onClick={onClose} disabled={!!busy}>
            <X size={16} />
          </button>
        </header>

        <div className="grid gap-3 p-4 md:grid-cols-[280px_1fr]">
          <aside className={`rounded-lg p-3 ${isPixel ? 'border-2 border-[var(--px-ink)] bg-[var(--px-muted)]' : isDark ? 'border border-white/10 bg-white/[0.04]' : 'border border-black/10 bg-black/[0.025]'}`}>
            <div className="text-xs font-semibold opacity-70">素材概览</div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              {(['image', 'video', 'audio', 'text'] as const).map((kind) => (
                <div key={kind} className={`rounded-md px-2 py-2 ${isPixel ? 'border-2 border-[var(--px-ink)] bg-[var(--px-surface)]' : isDark ? 'bg-black/25' : 'bg-white'}`}>
                  <div className="opacity-55">{kind === 'image' ? '图像' : kind === 'video' ? '视频' : kind === 'audio' ? '音频' : '文本'}</div>
                  <div className="mt-1 text-lg font-bold">{buckets[kind].length}</div>
                </div>
              ))}
            </div>
            <div className="mt-3 max-h-40 space-y-1 overflow-y-auto pr-1 text-[11px] opacity-75">
              {materials.slice(0, 12).map((item, index) => (
                <div key={`${item.id}-${index}`} className="truncate">
                  {index + 1}. {item.name || item.text || item.url || item.kind}
                </div>
              ))}
              {materials.length > 12 && <div>还有 {materials.length - 12} 项...</div>}
            </div>
          </aside>

          <main className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-semibold opacity-70">发送方式</label>
              <div className="grid grid-cols-2 gap-2">
                {MODE_OPTIONS.map((opt) => {
                  const Icon = opt.icon;
                  const active = mode === opt.value;
                  const activeCls = isPixel
                    ? 'bg-[var(--px-mint)] text-[var(--px-ink)] shadow-[3px_3px_0_var(--px-ink)] ring-2 ring-[var(--px-ink)]'
                    : 'border-[var(--t8-primary)] bg-[var(--t8-primary)] text-[var(--t8-on-primary)] shadow-lg shadow-[var(--t8-primary)]/25 ring-2 ring-[var(--t8-primary)]/35';
                  const inactiveCls = isPixel
                    ? 'bg-[var(--px-surface)] text-[var(--px-ink)] hover:bg-[var(--px-yellow)]'
                    : isDark
                      ? 'border-white/10 bg-white/5 hover:bg-white/10'
                      : 'border-black/10 bg-black/[0.03] hover:bg-black/[0.06]';
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setMode(opt.value)}
                      aria-pressed={active}
                      className={`relative text-left transition ${isPixel ? 'px-btn px-btn--sm' : 'rounded-md border px-3 py-2'} ${active ? activeCls : inactiveCls}`}
                    >
                      <span className="flex items-center gap-2 pr-12 text-sm font-semibold"><Icon size={14} />{opt.label}</span>
                      <span className="mt-1 block text-[11px] opacity-70">{opt.desc}</span>
                      {active && (
                        <span className={`absolute right-2 top-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${isPixel ? 'bg-[var(--px-ink)] text-[var(--px-surface)]' : 'bg-black/20 text-current'}`}>
                          <CheckCircle2 size={11} />
                          已选
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold opacity-70">目标画布</label>
              <input
                value={q}
                onChange={(event) => setQ(event.target.value)}
                placeholder="搜索画布..."
                className={`mb-2 h-9 w-full ${inputCls}`}
              />
              <div className={`max-h-36 overflow-y-auto rounded-lg ${isPixel ? 'border-2 border-[var(--px-ink)]' : isDark ? 'border border-white/10' : 'border border-black/10'}`}>
                {filteredCanvases.map((canvas) => {
                  const active = targetId === canvas.id;
                  return (
                    <button
                      key={canvas.id}
                      type="button"
                      aria-pressed={active}
                      className={`flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm transition ${active ? 'bg-[var(--t8-primary)] font-semibold text-[var(--t8-on-primary)]' : isDark ? 'hover:bg-white/8' : 'hover:bg-black/5'}`}
                      onClick={() => setTargetId(canvas.id)}
                    >
                      <span className="flex min-w-0 items-center gap-2">
                        {active && <CheckCircle2 size={14} className="shrink-0" />}
                        <span className="truncate">{canvas.name}</span>
                      </span>
                      <span className="shrink-0 text-[11px] opacity-70">
                        {active ? '已选' : canvas.id === activeCanvasId ? '当前' : `${canvas.nodeCount || 0} 节点`}
                      </span>
                    </button>
                  );
                })}
                {filteredCanvases.length === 0 && <div className="px-3 py-5 text-center text-xs opacity-55">没有匹配的画布</div>}
              </div>
              <label className="mt-2 flex items-center gap-2 text-xs opacity-75">
                <input type="checkbox" checked={switchAfter} onChange={(event) => setSwitchAfter(event.target.checked)} />
                发送后切换到目标画布
              </label>
            </div>
          </main>
        </div>

        <footer className={`flex flex-wrap items-center justify-between gap-2 px-4 py-3 ${isPixel ? 'border-t-2 border-[var(--px-ink)]' : isDark ? 'border-t border-white/10' : 'border-t border-black/10'}`}>
          <div className="basis-full text-xs opacity-70">
            当前选择：{selectedMode.label} → {selectedCanvas?.name || '未选择画布'}{switchAfter ? '，发送后会自动切换并定位到新素材' : ''}
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className={ghostBtn}
              disabled={!!busy || materials.length === 0}
              onClick={() => runAction('resource', onSaveToResource)}
            >
              <Library size={14} className="inline-block mr-1" />
              {busy === 'resource' ? '保存中...' : '保存到资源库'}
            </button>
            <button
              type="button"
              className={ghostBtn}
              disabled={!!busy || materials.length === 0}
              onClick={() => runAction('eagle', onSendToEagle)}
              title="发送到本机 Eagle，需先启动 Eagle"
            >
              <ExternalLink size={14} className="inline-block mr-1" />
              {busy === 'eagle' ? '发送中...' : '发送到 Eagle'}
            </button>
          </div>
          <button
            type="button"
            className={primaryBtn}
            disabled={!!busy || materials.length === 0 || !targetId}
            onClick={() => runAction('canvas', () => onSendToCanvas(targetId, mode, switchAfter))}
          >
            <SendIcon size={14} className="inline-block mr-1" />
            {busy === 'canvas' ? '发送中...' : '发送到画布'}
          </button>
        </footer>
      </section>
    </div>
  );
}
