import { memo } from 'react';
import { Maximize2 } from 'lucide-react';
import type { NodeProps } from '@xyflow/react';
import { ImageOpFrame } from './ImageOpFrame';
import { useUpdateNodeData } from './useUpdateNodeData';
import { opResize } from '../../services/imageOps';

const ResizeNode = (p: NodeProps) => {
  const update = useUpdateNodeData(p.id);
  const d = p.data as any;
  const width = d?.width || 1024;
  const height = d?.height || 1024;
  const fit = d?.fit || 'inside';
  return (
    <ImageOpFrame
      id={p.id}
      data={p.data}
      selected={p.selected}
      title="尺寸调整"
      subtitle={`${width}×${height} · ${fit}`}
      icon={<Maximize2 size={13} />}
      colorHex="#fb923c"
      bgRgba="rgba(251,146,60,.2)"
      shadowRgba="rgba(251,146,60,.2)"
      textHex="#fed7aa"
      buttonClasses="bg-orange-500/20 hover:bg-orange-500/30 text-orange-200"
      renderSettings={() => (
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] text-white/50 block mb-1">宽</label>
            <input
              type="number"
              value={width}
              onChange={(e) => update({ width: parseInt(e.target.value) || 0 })}
              className="w-full rounded bg-white/5 border border-white/10 px-2 py-1 text-xs text-white outline-none focus:border-white/30"
            />
          </div>
          <div>
            <label className="text-[10px] text-white/50 block mb-1">高</label>
            <input
              type="number"
              value={height}
              onChange={(e) => update({ height: parseInt(e.target.value) || 0 })}
              className="w-full rounded bg-white/5 border border-white/10 px-2 py-1 text-xs text-white outline-none focus:border-white/30"
            />
          </div>
          <div className="col-span-2">
            <label className="text-[10px] text-white/50 block mb-1">Fit</label>
            <select
              value={fit}
              onChange={(e) => update({ fit: e.target.value })}
              className="w-full rounded bg-white/5 border border-white/10 px-2 py-1 text-xs text-white outline-none focus:border-white/30"
            >
              {['inside', 'cover', 'contain', 'fill'].map((x) => (
                <option key={x} value={x} className="bg-zinc-900">
                  {x}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
      runOp={async (img) => opResize(img as string, width, height, fit)}
    />
  );
};

export default memo(ResizeNode);
