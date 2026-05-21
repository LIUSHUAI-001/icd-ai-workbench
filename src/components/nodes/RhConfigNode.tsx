import { memo, useState } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Plus, Settings2, Trash2 } from 'lucide-react';
import { useUpdateNodeData } from './useUpdateNodeData';

interface NodeInfo {
  nodeId: string;
  fieldName: string;
  fieldValue: string;
}

/**
 * RhConfigNode - RunningHub 工作流参数注入
 * 多条 nodeId / fieldName / fieldValue 三元组,作为 nodeInfoList 输出给 RunningHubNode
 */
const RhConfigNode = ({ id, data, selected }: NodeProps) => {
  const update = useUpdateNodeData(id);
  const d = data as any;
  const [list, setList] = useState<NodeInfo[]>(d?.nodeInfoList || []);

  const sync = (next: NodeInfo[]) => {
    setList(next);
    update({ nodeInfoList: next });
  };

  const add = () => sync([...list, { nodeId: '', fieldName: '', fieldValue: '' }]);
  const remove = (i: number) => sync(list.filter((_, idx) => idx !== i));
  const updateAt = (i: number, k: keyof NodeInfo, v: string) =>
    sync(list.map((x, idx) => (idx === i ? { ...x, [k]: v } : x)));

  return (
    <div
      className={`relative rounded-xl border-2 transition-all w-[320px] ${
        selected ? 'border-cyan-400 shadow-2xl shadow-cyan-500/20' : 'border-white/15 hover:border-white/30'
      }`}
      style={{ background: 'rgba(20,20,22,.92)', backdropFilter: 'blur(8px)' }}
    >
      <Handle type="source" position={Position.Right} className="!bg-cyan-400 !border-0" />

      <div className="flex items-center gap-2 px-3 py-2 border-b border-white/10">
        <div
          className="w-6 h-6 rounded flex items-center justify-center"
          style={{ background: 'rgba(6,182,212,.2)', color: '#67e8f9', boxShadow: 'inset 0 0 0 1px rgba(6,182,212,.45)' }}
        >
          <Settings2 size={13} />
        </div>
        <div className="flex-1">
          <div className="text-sm font-semibold text-white">RH 配置</div>
          <div className="text-[10px] text-white/40">注入 {list.length} 个参数</div>
        </div>
      </div>

      <div className="p-2.5 space-y-2 max-h-[360px] overflow-auto" onMouseDown={(e) => e.stopPropagation()}>
        {list.length === 0 && (
          <div className="text-[10px] text-white/40 text-center py-2">点击 + 添加节点参数</div>
        )}
        {list.map((item, i) => (
          <div key={i} className="rounded border border-white/10 bg-white/5 p-2 space-y-1">
            <div className="flex items-center justify-between">
              <div className="text-[10px] text-white/50">#{i + 1}</div>
              <button
                onClick={() => remove(i)}
                className="text-red-300/70 hover:text-red-300"
                title="删除"
              >
                <Trash2 size={10} />
              </button>
            </div>
            <input
              type="text"
              value={item.nodeId}
              onChange={(e) => updateAt(i, 'nodeId', e.target.value)}
              placeholder="nodeId(如 6)"
              className="w-full rounded bg-white/5 border border-white/10 px-2 py-1 text-[11px] text-white outline-none focus:border-white/30 placeholder:text-white/30"
            />
            <input
              type="text"
              value={item.fieldName}
              onChange={(e) => updateAt(i, 'fieldName', e.target.value)}
              placeholder="fieldName(如 prompt)"
              className="w-full rounded bg-white/5 border border-white/10 px-2 py-1 text-[11px] text-white outline-none focus:border-white/30 placeholder:text-white/30"
            />
            <textarea
              value={item.fieldValue}
              onChange={(e) => updateAt(i, 'fieldValue', e.target.value)}
              placeholder="fieldValue"
              className="w-full h-12 resize-none rounded bg-white/5 border border-white/10 px-2 py-1 text-[11px] text-white outline-none focus:border-white/30 placeholder:text-white/30"
            />
          </div>
        ))}
        <button
          onClick={add}
          className="w-full flex items-center justify-center gap-1 py-1.5 rounded border border-dashed border-white/20 hover:border-white/40 text-white/60 hover:text-white text-xs transition-colors"
        >
          <Plus size={11} /> 添加参数
        </button>
      </div>
    </div>
  );
};

export default memo(RhConfigNode);
