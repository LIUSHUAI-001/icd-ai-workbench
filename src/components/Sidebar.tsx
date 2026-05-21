import { useState } from 'react';
import * as Icons from 'lucide-react';
import { ChevronDown, ChevronRight, Search } from 'lucide-react';
import { NODE_GROUPS } from '../config/nodeRegistry';
import type { NodeMeta, NodeType } from '../types/canvas';
import { useThemeStore } from '../stores/theme';

const COLOR_HEX: Record<string, string> = {
  sky: '#7dd3fc',
  amber: '#fcd34d',
  rose: '#fda4af',
  fuchsia: '#f0abfc',
  violet: '#c4b5fd',
  emerald: '#6ee7b7',
  cyan: '#67e8f9',
  indigo: '#a5b4fc',
  orange: '#fdba74',
  pink: '#f9a8d4',
  slate: '#cbd5e1',
};

interface SidebarProps {
  onAddNode: (type: NodeType) => void;
}

export default function Sidebar({ onAddNode }: SidebarProps) {
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [keyword, setKeyword] = useState('');

  const toggle = (key: string) => setCollapsed((s) => ({ ...s, [key]: !s[key] }));

  const renderNode = (n: NodeMeta) => {
    const Icon = (Icons as any)[n.icon] || Icons.Box;
    const colorHex = COLOR_HEX[n.color] || COLOR_HEX.slate;
    return (
      <button
        key={n.type}
        onClick={() => onAddNode(n.type)}
        title={n.description}
        className={`w-full text-left flex items-center gap-2 px-2 py-1.5 rounded-md transition-colors text-xs ${
          isDark
            ? 'hover:bg-white/10 text-zinc-200'
            : 'hover:bg-black/5 text-zinc-800'
        }`}
      >
        <span
          className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0"
          style={{ background: colorHex + '22', color: colorHex, boxShadow: `inset 0 0 0 1px ${colorHex}55` }}
        >
          <Icon size={13} />
        </span>
        <span className="flex-1 min-w-0 truncate">{n.label}</span>
      </button>
    );
  };

  // 搜索过滤
  const filterNodes = (nodes: NodeMeta[]) => {
    if (!keyword.trim()) return nodes;
    const k = keyword.toLowerCase();
    return nodes.filter(
      (n) =>
        n.label.toLowerCase().includes(k) ||
        n.type.toLowerCase().includes(k) ||
        n.description.toLowerCase().includes(k)
    );
  };

  return (
    <div
      className={`w-64 flex flex-col border-r overflow-hidden ${
        isDark ? 'bg-zinc-900 border-white/10' : 'bg-white border-black/10'
      }`}
    >
      {/* 搜索框 */}
      <div className={`p-2 border-b ${isDark ? 'border-white/10' : 'border-black/10'}`}>
        <div
          className={`flex items-center gap-2 px-2 py-1.5 rounded-md ${
            isDark ? 'bg-white/5' : 'bg-black/5'
          }`}
        >
          <Search size={14} className="opacity-50" />
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="搜索节点..."
            className={`flex-1 bg-transparent outline-none text-xs ${
              isDark ? 'text-white placeholder:text-white/30' : 'text-zinc-900 placeholder:text-zinc-400'
            }`}
          />
        </div>
      </div>

      {/* 节点分组列表 */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-hide">
        {Object.entries(NODE_GROUPS).map(([key, group]) => {
          const visible = filterNodes(group.nodes);
          if (visible.length === 0) return null;
          const isCollapsed = collapsed[key];
          return (
            <div key={key} className="mb-1">
              <button
                onClick={() => toggle(key)}
                className={`w-full flex items-center gap-1 px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider ${
                  isDark ? 'text-white/50 hover:text-white/80' : 'text-zinc-500 hover:text-zinc-800'
                }`}
              >
                {isCollapsed ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
                <span className="flex-1 text-left">{group.label}</span>
                <span className="opacity-60">{visible.length}</span>
              </button>
              {!isCollapsed && <div className="space-y-0.5 mt-0.5">{visible.map(renderNode)}</div>}
            </div>
          );
        })}
      </div>

      {/* 底部版本信息 */}
      <div className={`px-3 py-2 border-t text-[10px] ${
        isDark ? 'border-white/10 text-white/30' : 'border-black/10 text-zinc-400'
      }`}>
        T8-penguin-canvas · v1.0.0
      </div>
    </div>
  );
}
