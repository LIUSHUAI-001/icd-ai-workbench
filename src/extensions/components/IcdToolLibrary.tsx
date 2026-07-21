import { useEffect, type FC } from 'react';
import { Boxes, ChevronRight, ClipboardList, Palette, Wallpaper, X } from 'lucide-react';

interface IcdToolLibraryProps {
  open: boolean;
  activeTool: IcdToolId | null;
  onClose: () => void;
  onSelectTool: (tool: IcdToolId) => void;
}

const TOOLS = [
  {
    id: 'color-plan',
    title: '一键彩平',
    description: '上传户型图一键生成彩平效果图',
    icon: Palette,
  },
  {
    id: 'material-list',
    title: '物料清单',
    description: 'AI自动生成各类设计物料清单',
    icon: ClipboardList,
  },
  {
    id: 'texture-extract',
    title: '材质贴图提取',
    description: '一键生成无缝贴图',
    icon: Wallpaper,
  },
] as const;

export type IcdToolId = (typeof TOOLS)[number]['id'];

export const IcdToolLibrary: FC<IcdToolLibraryProps> = ({ open, activeTool, onClose, onSelectTool }) => {
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <aside className="icd-tool-library" aria-label="工具库" data-canvas-floating-ui>
      <div className="icd-tool-library__header">
        <div className="icd-tool-library__title">
          <Boxes size={17} strokeWidth={1.9} aria-hidden="true" />
          <h2>工具库</h2>
        </div>
        <button type="button" className="icd-tool-library__close" onClick={onClose} aria-label="关闭工具库">
          <X size={17} strokeWidth={1.8} aria-hidden="true" />
        </button>
      </div>

      <div className="icd-tool-library__list" aria-label="可用工具">
        {TOOLS.map((tool) => {
          const Icon = tool.icon;
          const active = activeTool === tool.id;
          return (
            <button
              key={tool.id}
              type="button"
              className={`icd-tool-library__item${active ? ' is-active' : ''}`}
              onClick={() => onSelectTool(tool.id)}
              aria-pressed={active}
            >
              <span className="icd-tool-library__item-icon" aria-hidden="true">
                <Icon size={18} strokeWidth={1.8} />
              </span>
              <span className="icd-tool-library__item-copy">
                <strong>{tool.title}</strong>
                <span>{tool.description}</span>
              </span>
              {active && <ChevronRight className="icd-tool-library__item-arrow" size={16} aria-hidden="true" />}
            </button>
          );
        })}
      </div>
    </aside>
  );
};
