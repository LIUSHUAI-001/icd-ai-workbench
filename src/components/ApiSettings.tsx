import { useEffect, useState } from 'react';
import { Eye, EyeOff, KeyRound, Loader2, Lock, Save, X } from 'lucide-react';
import { useApiKeysStore, FIXED_ZHENZHEN_BASE, RH_BASE } from '../stores/apiKeys';
import { useThemeStore } from '../stores/theme';

interface ApiSettingsModalProps {
  open: boolean;
  onClose: () => void;
}

export default function ApiSettingsModal({ open, onClose }: ApiSettingsModalProps) {
  const { theme, style } = useThemeStore();
  const { settings, loading, error, load, save, loaded } = useApiKeysStore();
  const isDark = theme === 'dark';
  const isPixel = style === 'pixel';

  const [zhenzhenKey, setZhenzhenKey] = useState('');
  const [rhKey, setRhKey] = useState('');
  const [llmKey, setLlmKey] = useState('');
  const [showZ, setShowZ] = useState(false);
  const [showR, setShowR] = useState(false);
  const [showL, setShowL] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (open && !loaded) load();
  }, [open, loaded, load]);

  // 重置表单(脱敏 Key 不直接填充,留空则保持后端原值)
  useEffect(() => {
    if (open) {
      setZhenzhenKey('');
      setRhKey('');
      setLlmKey('');
      setSaved(false);
    }
  }, [open]);

  if (!open) return null;

  const handleSave = async () => {
    const patch: any = {};
    if (zhenzhenKey.trim()) patch.zhenzhenApiKey = zhenzhenKey.trim();
    if (rhKey.trim()) patch.rhApiKey = rhKey.trim();
    if (llmKey.trim()) patch.llmApiKey = llmKey.trim();
    if (Object.keys(patch).length === 0) {
      onClose();
      return;
    }
    await save(patch);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 800);
  };

  const inputCls = isPixel
    ? 'flex-1 px-3 py-2 rounded-[10px] text-sm outline-none px-input'
    : `flex-1 px-3 py-2 rounded-md text-sm outline-none border ${
        isDark
          ? 'bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-white/30'
          : 'bg-black/5 border-black/10 text-zinc-900 placeholder:text-zinc-400 focus:border-black/30'
      }`;

  const labelCls = isPixel
    ? 'text-[var(--px-ink)]'
    : isDark ? 'text-white/70' : 'text-zinc-700';
  const hintCls = isPixel
    ? 'text-[var(--px-ink-soft)]'
    : isDark ? 'text-white/40' : 'text-zinc-500';
  const eyeBtnCls = isPixel
    ? 'px-btn px-btn--icon px-btn--ghost'
    : `p-2 rounded-md ${isDark ? 'hover:bg-white/10' : 'hover:bg-black/5'}`;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm ${
        isPixel ? 'px-modal-mask' : 'bg-black/60'
      }`}
    >
      <div
        className={
          isPixel
            ? 'w-full max-w-2xl mx-4 px-card overflow-hidden'
            : `w-full max-w-2xl mx-4 rounded-2xl shadow-2xl overflow-hidden ${
                isDark ? 'bg-zinc-900 border border-white/10' : 'bg-white border border-black/10'
              }`
        }
      >
        {/* 头部 */}
        <div
          className={`flex items-center gap-3 px-5 py-4 border-b ${
            isPixel
              ? 'border-[var(--px-ink)] bg-[var(--px-yellow)]'
              : isDark
                ? 'border-white/10'
                : 'border-black/10'
          }`}
        >
          <KeyRound size={18} className={isPixel ? 'text-[var(--px-ink)]' : isDark ? 'text-white/80' : 'text-zinc-700'} />
          <div className="flex-1">
            <h2
              className={`text-base font-semibold ${
                isPixel ? 'px-title text-[var(--px-ink)]' : isDark ? 'text-white' : 'text-zinc-900'
              }`}
            >
              API Key 设置(三套独立)
            </h2>
            <p className={`text-xs mt-0.5 ${hintCls}`}>
              留空表示保持后端已存的 Key 不变;输入新值即覆盖。
            </p>
          </div>
          <button
            onClick={onClose}
            className={
              isPixel
                ? 'px-btn px-btn--icon px-btn--ghost'
                : `p-1.5 rounded-md ${isDark ? 'hover:bg-white/10' : 'hover:bg-black/5'}`
            }
          >
            <X size={18} />
          </button>
        </div>

        {/* 表单 */}
        <div className="p-5 space-y-5">
          {/* 1. 贞贞工坊 Key */}
          <div className="space-y-2">
            <label className={`text-sm font-medium flex items-center gap-2 ${labelCls}`}>
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              贞贞工坊 API Key
              <span className={`text-[11px] font-normal ${hintCls}`}>
                · 用于图像/视频/音频生成
              </span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type={showZ ? 'text' : 'password'}
                value={zhenzhenKey}
                onChange={(e) => setZhenzhenKey(e.target.value)}
                placeholder={settings.zhenzhenApiKey || '请输入 sk-...'}
                className={inputCls}
              />
              <button
                onClick={() => setShowZ(!showZ)}
                className={eyeBtnCls}
              >
                {showZ ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <div className={`flex items-center gap-1.5 text-[11px] ${hintCls}`}>
              <Lock size={11} /> Base URL 锁定: <code>{FIXED_ZHENZHEN_BASE}</code>
            </div>
          </div>

          {/* 2. RunningHub Key */}
          <div className="space-y-2">
            <label className={`text-sm font-medium flex items-center gap-2 ${labelCls}`}>
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              RunningHub API Key
              <span className={`text-[11px] font-normal ${hintCls}`}>· 用于 RH 工作流</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type={showR ? 'text' : 'password'}
                value={rhKey}
                onChange={(e) => setRhKey(e.target.value)}
                placeholder={settings.rhApiKey || '请输入 RunningHub Key'}
                className={inputCls}
              />
              <button
                onClick={() => setShowR(!showR)}
                className={eyeBtnCls}
              >
                {showR ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <div className={`text-[11px] ${hintCls}`}>
              Base URL: <code>{RH_BASE}</code>
            </div>
          </div>

          {/* 3. LLM 独立 Key */}
          <div className="space-y-2">
            <label className={`text-sm font-medium flex items-center gap-2 ${labelCls}`}>
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              LLM 独立 API Key
              <span className={`text-[11px] font-normal ${hintCls}`}>
                · 额度隔离 · 用于 LLM/Vision
              </span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type={showL ? 'text' : 'password'}
                value={llmKey}
                onChange={(e) => setLlmKey(e.target.value)}
                placeholder={settings.llmApiKey || '请输入 LLM 独立 Key'}
                className={inputCls}
              />
              <button
                onClick={() => setShowL(!showL)}
                className={eyeBtnCls}
              >
                {showL ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <div className={`flex items-center gap-1.5 text-[11px] ${hintCls}`}>
              <Lock size={11} /> Base URL 锁定: <code>{FIXED_ZHENZHEN_BASE}</code>(与贞贞同地址,Key 独立)
            </div>
          </div>

          {error && (
            <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-md px-3 py-2">
              ❌ {error}
            </div>
          )}
        </div>

        {/* 底部按钮 */}
        <div
          className={`flex items-center justify-end gap-2 px-5 py-3 border-t ${
            isPixel
              ? 'border-[var(--px-ink)] bg-[var(--px-muted)]'
              : isDark
                ? 'border-white/10 bg-white/[0.02]'
                : 'border-black/10 bg-black/[0.02]'
          }`}
        >
          <button
            onClick={onClose}
            className={
              isPixel
                ? 'px-btn'
                : `px-4 py-2 text-sm rounded-md ${
                    isDark ? 'hover:bg-white/10 text-white/80' : 'hover:bg-black/5 text-zinc-700'
                  }`
            }
          >
            取消
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className={
              isPixel
                ? 'px-btn px-btn--mint disabled:opacity-50 flex items-center gap-2'
                : 'px-4 py-2 text-sm rounded-md bg-emerald-500 hover:bg-emerald-600 text-white flex items-center gap-2 disabled:opacity-50'
            }
          >
            {loading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : saved ? (
              <span>✓ 已保存</span>
            ) : (
              <Save size={14} />
            )}
            {!loading && !saved && '保存'}
          </button>
        </div>
      </div>
    </div>
  );
}
