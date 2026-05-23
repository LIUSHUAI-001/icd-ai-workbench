import { memo, useMemo, useState } from 'react';
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  rectSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import {
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  Video as VideoIcon,
  Music,
  Type as TypeIcon,
  Plus,
  Layers,
} from 'lucide-react';
import MaterialThumbnail from './MaterialThumbnail';
import type { Material } from './useUpstreamMaterials';

/**
 * MaterialPreviewSection - 上游素材聚合预览区
 *
 * 职责:
 *   1. 分组渲染 (text / image / video / audio) 上游聚合素材 + 本地上传素材
 *   2. dnd-kit 跨类型自由排序, onReorder 回调输出新 order 数组 (写到 data.materialOrder)
 *   3. 折叠/展开切换, 折叠态显示头条 + 一行迷你预览, 让用户清楚知道是「折叠」而不是「空」
 *   4. 双主题适配 (科技风 dark / 像素风 pixel-light), 通过 isDark + isPixel props 切换
 *
 * 折叠默认值规则:
 *   - selected=true   → 默认展开, 用户可点头条手动折叠
 *   - selected=false  → 默认折叠, 节省垂直空间, 用户可点头条手动展开
 *   - 用户手动操作过则保留手动状态 (forceCollapsed 优先于 selected)
 *
 * 调用方:
 *   - ImageNode (主战场, 含本地上传 + 多张参考图)
 *   - 后续 VideoNode / SeedanceNode / AudioNode / LLMNode / RunningHubNode 复用
 *
 * 与 xyflow 的协同:
 *   - 顶层 onMouseDown stopPropagation 防止触发节点拖动
 *   - 内部 dnd-kit useSortable 给每个缩略加 className="nodrag"
 *   - 头部按钮也是 nodrag, 不会被节点拖动捕获
 */

interface UploadAction {
  onClick: () => void;
  title?: string;
  remaining?: number;
}

interface Props {
  texts?: Material[];
  images?: Material[];
  videos?: Material[];
  audios?: Material[];
  /** 当前显示顺序 (data.materialOrder) */
  order: string[];
  /** 用户拖动后, 输出新 order */
  onReorder: (newOrder: string[]) => void;
  /** 仅 origin='local' 的素材会显示删除按钮, 点击触发本回调 */
  onRemoveLocal?: (m: Material) => void;
  /** 节点是否被 selected, 用于决定默认折叠状态 */
  selected?: boolean;
  isDark: boolean;
  isPixel: boolean;
  /** 显示的分组及顺序, 默认 ['text','image','video','audio'] */
  groups?: ReadonlyArray<'text' | 'image' | 'video' | 'audio'>;
  /** 在 image 分组末尾追加 [+] 上传按钮 (仅 ImageNode 等需要本地上传的节点用) */
  imageUploadAction?: UploadAction;
  /** 自定义头部标题, 默认「上游素材」 */
  title?: string;
}

const ICON_MAP = {
  text: TypeIcon,
  image: ImageIcon,
  video: VideoIcon,
  audio: Music,
};
const LABEL_MAP = {
  text: '文本',
  image: '图像',
  video: '视频',
  audio: '音频',
};

const MaterialPreviewSection = ({
  texts = [],
  images = [],
  videos = [],
  audios = [],
  order,
  onReorder,
  onRemoveLocal,
  selected,
  isDark,
  isPixel,
  groups = ['text', 'image', 'video', 'audio'],
  imageUploadAction,
  title = '上游素材',
}: Props) => {
  const total = texts.length + images.length + videos.length + audios.length;

  // 折叠状态: null = 跟随 selected, true/false = 用户手动覆盖
  const [forceCollapsed, setForceCollapsed] = useState<boolean | null>(null);
  const collapsed = forceCollapsed != null ? forceCollapsed : !selected;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
  );

  const allItems = useMemo(() => {
    const m: Record<string, Material[]> = {
      text: texts,
      image: images,
      video: videos,
      audio: audios,
    };
    return groups.flatMap((g) => m[g] || []);
  }, [groups, texts, images, videos, audios]);

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const ids = allItems.map((it) => it.id);
    const oldIdx = ids.indexOf(String(active.id));
    const newIdx = ids.indexOf(String(over.id));
    if (oldIdx < 0 || newIdx < 0) return;
    const moved = arrayMove(ids, oldIdx, newIdx);
    onReorder(moved);
  };

  // 没有任何素材也没有上传入口 → 不渲染
  if (total === 0 && !imageUploadAction) return null;

  // ============== 主题样式 ==============
  const headerStyle: React.CSSProperties = isPixel
    ? {
        background: collapsed ? '#cffafe' : '#67e8f9',
        color: '#1a1a1a',
        border: '1.5px solid #1a1a1a',
        boxShadow: '1px 1px 0 #1a1a1a',
        padding: '4px 8px',
        fontWeight: 700,
        fontSize: 11,
      }
    : {
        background: collapsed
          ? isDark
            ? 'rgba(20,184,166,.10)'
            : 'rgba(20,184,166,.08)'
          : isDark
            ? 'rgba(20,184,166,.20)'
            : 'rgba(20,184,166,.15)',
        color: isDark ? '#5eead4' : '#0d9488',
        border: `1px solid ${isDark ? 'rgba(94,234,212,.35)' : 'rgba(13,148,136,.35)'}`,
        borderRadius: 6,
        padding: '4px 8px',
        fontWeight: 600,
        fontSize: 11,
      };
  const headerCountStyle: React.CSSProperties = isPixel
    ? {
        background: '#fde047',
        border: '1.5px solid #1a1a1a',
        color: '#1a1a1a',
        padding: '0 4px',
        fontSize: 10,
        lineHeight: '14px',
      }
    : {
        background: isDark ? 'rgba(0,0,0,.3)' : 'rgba(255,255,255,.6)',
        borderRadius: 4,
        padding: '0 5px',
        fontSize: 10,
        lineHeight: '14px',
      };

  // 折叠时迷你预览方块的样式
  const miniBoxStyle: React.CSSProperties = isPixel
    ? { border: '1.5px solid #1a1a1a', background: '#fefce8' }
    : { border: `1px solid ${isDark ? 'rgba(255,255,255,.18)' : 'rgba(0,0,0,.12)'}`, borderRadius: 3 };

  const groupLabelStyle: React.CSSProperties = isPixel
    ? { color: '#1a1a1a', fontWeight: 700, fontSize: 10 }
    : { color: isDark ? 'rgba(255,255,255,.55)' : 'rgba(0,0,0,.55)', fontSize: 10 };

  const uploadBtnStyle: React.CSSProperties = isPixel
    ? {
        width: 56,
        height: 56,
        background: '#fefce8',
        border: '1.5px dashed #1a1a1a',
        boxShadow: '1px 1px 0 #1a1a1a',
        color: '#1a1a1a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        flexShrink: 0,
      }
    : {
        width: 56,
        height: 56,
        background: isDark ? 'rgba(255,255,255,.04)' : 'rgba(0,0,0,.04)',
        border: `2px dashed ${isDark ? 'rgba(255,255,255,.20)' : 'rgba(0,0,0,.20)'}`,
        borderRadius: 6,
        color: isDark ? 'rgba(255,255,255,.45)' : 'rgba(0,0,0,.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        flexShrink: 0,
      };

  return (
    <div
      className="space-y-1.5"
      onMouseDown={(e) => e.stopPropagation()}
    >
      {/* ============== 折叠头 ============== */}
      <button
        type="button"
        onClick={() => setForceCollapsed(!collapsed)}
        className="nodrag w-full flex items-center gap-1.5 cursor-pointer select-none"
        style={headerStyle}
        title={collapsed ? '点击展开素材列表' : '点击折叠素材列表'}
      >
        <Layers size={12} />
        <span style={{ flex: 1, textAlign: 'left' }}>{title}</span>
        <span style={headerCountStyle}>{total}</span>
        {collapsed ? <ChevronDown size={12} /> : <ChevronUp size={12} />}
      </button>

      {/* ============== 折叠态 - 迷你预览条 ============== */}
      {collapsed && total > 0 && (
        <div className="flex flex-wrap gap-1 px-0.5">
          {allItems.slice(0, 8).map((m, i) => {
            const Ic = ICON_MAP[m.kind];
            return (
              <div
                key={m.id}
                style={{
                  ...miniBoxStyle,
                  width: 18,
                  height: 18,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                }}
                title={`${LABEL_MAP[m.kind]} ${i + 1} · ${m.label || ''}`}
              >
                {m.kind === 'image' ? (
                  <img
                    src={m.url}
                    alt=""
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <Ic size={10} color={isPixel ? '#1a1a1a' : isDark ? '#5eead4' : '#0d9488'} />
                )}
              </div>
            );
          })}
          {allItems.length > 8 && (
            <span
              style={{
                fontSize: 10,
                alignSelf: 'center',
                color: isPixel ? '#1a1a1a' : isDark ? 'rgba(255,255,255,.5)' : 'rgba(0,0,0,.5)',
                fontWeight: isPixel ? 700 : 500,
              }}
            >
              +{allItems.length - 8}
            </span>
          )}
        </div>
      )}

      {/* ============== 展开态 - 分组 + dnd-kit ============== */}
      {!collapsed && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={allItems.map((m) => m.id)}
            strategy={rectSortingStrategy}
          >
            {groups.map((g) => {
              const list =
                g === 'text' ? texts : g === 'image' ? images : g === 'video' ? videos : audios;
              const showUpload = g === 'image' && imageUploadAction;
              if (!list.length && !showUpload) return null;
              const Ic = ICON_MAP[g];
              const indexOffset = (() => {
                let off = 0;
                for (const gg of groups) {
                  if (gg === g) break;
                  off += (gg === 'text' ? texts : gg === 'image' ? images : gg === 'video' ? videos : audios).length;
                }
                return off;
              })();
              return (
                <div key={g} className="space-y-1">
                  <div className="flex items-center gap-1" style={groupLabelStyle}>
                    <Ic size={10} />
                    <span>
                      {LABEL_MAP[g]} ({list.length}
                      {showUpload && imageUploadAction?.remaining != null
                        ? `/${list.length + imageUploadAction.remaining}`
                        : ''}
                      )
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {list.map((m, i) => (
                      <MaterialThumbnail
                        key={m.id}
                        material={m}
                        index={indexOffset + i}
                        isPixel={isPixel}
                        isDark={isDark}
                        draggable
                        removable={m.origin === 'local'}
                        onRemove={onRemoveLocal ? () => onRemoveLocal(m) : undefined}
                      />
                    ))}
                    {showUpload && imageUploadAction && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          imageUploadAction.onClick();
                        }}
                        onPointerDown={(e) => e.stopPropagation()}
                        className="nodrag"
                        style={uploadBtnStyle}
                        title={imageUploadAction.title || '上传本地素材'}
                      >
                        <Plus size={16} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
};

export default memo(MaterialPreviewSection);
