import { type FC, useEffect, useMemo, useState } from 'react';
import { FolderOpen, Grid2X2, List, MoreHorizontal, Pencil, Plus, Search, Trash2, X } from 'lucide-react';
import { useCanvasStore } from '../../stores/canvas';
import { useIcdNavigate } from '../icdRouter';
import { IcdNavbar } from './IcdNavbar';

type WorkspaceView = 'grid' | 'list';

function formatProjectTime(timestamp: number) {
  const elapsed = Date.now() - timestamp;
  const minute = 60_000;
  const hour = minute * 60;
  const day = hour * 24;
  if (elapsed < minute) return '刚刚更新';
  if (elapsed < hour) return `${Math.max(1, Math.floor(elapsed / minute))} 分钟前`;
  if (elapsed < day) return `${Math.floor(elapsed / hour)} 小时前`;
  if (elapsed < day * 30) return `${Math.floor(elapsed / day)} 天前`;
  return new Date(timestamp).toLocaleDateString('zh-CN');
}

function projectInitial(name: string) {
  return name.trim().slice(0, 1).toUpperCase() || 'I';
}

export const WorkspacePage: FC = () => {
  const navigate = useIcdNavigate();
  const {
    canvases,
    loading,
    error,
    loadCanvases,
    createCanvas,
    deleteCanvas,
    renameCanvas,
    setActive,
  } = useCanvasStore();
  const [query, setQuery] = useState('');
  const [view, setView] = useState<WorkspaceView>('grid');
  const [menuId, setMenuId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    void loadCanvases();
  }, [loadCanvases]);

  useEffect(() => {
    const closeMenu = () => setMenuId(null);
    window.addEventListener('click', closeMenu);
    return () => window.removeEventListener('click', closeMenu);
  }, []);

  const projects = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return canvases;
    return canvases.filter((canvas) => canvas.name.toLowerCase().includes(keyword));
  }, [canvases, query]);

  const openProject = (id: string) => {
    setActive(id);
    navigate('canvas', id);
  };

  const handleCreate = async () => {
    if (creating) return;
    setCreating(true);
    const name = projectName.trim() || `未命名项目 ${canvases.length + 1}`;
    const project = await createCanvas(name);
    setCreating(false);
    if (!project) return;
    setCreateOpen(false);
    setProjectName('');
    openProject(project.id);
  };

  const handleRename = async (id: string, currentName: string) => {
    const nextName = window.prompt('修改项目名称', currentName)?.trim();
    if (!nextName || nextName === currentName) return;
    await renameCanvas(id, nextName);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`确定删除项目“${name}”吗？项目画布数据也会一并删除，此操作不可撤销。`)) return;
    await deleteCanvas(id);
  };

  return (
    <div className="icd-page icd-page--workspace">
      <IcdNavbar />
      <main className="icd-workspace">
        <header className="icd-workspace__heading">
          <div>
            <span className="icd-workspace__eyebrow">个人工作空间</span>
            <h1>项目</h1>
            <p>从新项目开始，或继续处理之前的设计画布。</p>
          </div>
          <button type="button" className="icd-workspace__new" onClick={() => setCreateOpen(true)}>
            <Plus size={16} /> 新建项目
          </button>
        </header>

        <div className="icd-workspace__toolbar">
          <label className="icd-workspace__search">
            <Search size={16} aria-hidden="true" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索项目" />
          </label>
          <span className="icd-workspace__count">{projects.length} 个项目</span>
          <div className="icd-workspace__views" aria-label="项目显示方式">
            <button type="button" className={view === 'grid' ? 'is-active' : ''} onClick={() => setView('grid')} aria-label="网格视图"><Grid2X2 size={16} /></button>
            <button type="button" className={view === 'list' ? 'is-active' : ''} onClick={() => setView('list')} aria-label="列表视图"><List size={16} /></button>
          </div>
        </div>

        {error && <div className="icd-workspace__error">{error}</div>}

        <section className={`icd-workspace__projects is-${view}`} aria-label="项目列表">
          <button type="button" className="icd-project-card icd-project-card--new" onClick={() => setCreateOpen(true)}>
            <span><Plus size={24} /></span>
            <strong>新建项目</strong>
            <small>创建一张新的 AI 设计画布</small>
          </button>

          {projects.map((project, index) => (
            <article className="icd-project-card" key={project.id}>
              <button type="button" className={`icd-project-card__cover tone-${index % 5}`} onClick={() => openProject(project.id)}>
                <span className="icd-project-card__initial">{projectInitial(project.name)}</span>
                <span className="icd-project-card__cover-meta"><FolderOpen size={14} /> {project.nodeCount} 个节点</span>
              </button>
              <div className="icd-project-card__info">
                <button type="button" className="icd-project-card__open" onClick={() => openProject(project.id)}>
                  <strong>{project.name}</strong>
                  <small>{formatProjectTime(project.updatedAt)}</small>
                </button>
                <div className="icd-project-card__menu-wrap">
                  <button
                    type="button"
                    className="icd-project-card__menu-trigger"
                    aria-label={`${project.name}项目菜单`}
                    aria-expanded={menuId === project.id}
                    onClick={(event) => {
                      event.stopPropagation();
                      setMenuId((current) => current === project.id ? null : project.id);
                    }}
                  >
                    <MoreHorizontal size={17} />
                  </button>
                  {menuId === project.id && (
                    <div className="icd-project-card__menu" onClick={(event) => event.stopPropagation()}>
                      <button type="button" onClick={() => void handleRename(project.id, project.name)}><Pencil size={13} /> 重命名</button>
                      <button type="button" className="is-danger" onClick={() => void handleDelete(project.id, project.name)}><Trash2 size={13} /> 删除项目</button>
                    </div>
                  )}
                </div>
              </div>
            </article>
          ))}
        </section>

        {!loading && canvases.length > 0 && projects.length === 0 && (
          <div className="icd-workspace__empty">没有找到包含“{query}”的项目</div>
        )}
        {loading && canvases.length === 0 && <div className="icd-workspace__empty">正在读取项目…</div>}
      </main>

      {createOpen && (
        <div className="icd-project-create" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setCreateOpen(false); }}>
          <form className="icd-project-create__dialog" onSubmit={(event) => { event.preventDefault(); void handleCreate(); }}>
            <header>
              <div><span>工作空间</span><h2>新建项目</h2></div>
              <button type="button" onClick={() => setCreateOpen(false)} aria-label="关闭新建项目"><X size={17} /></button>
            </header>
            <label>
              <span>项目名称</span>
              <input autoFocus value={projectName} onChange={(event) => setProjectName(event.target.value)} placeholder={`未命名项目 ${canvases.length + 1}`} maxLength={60} />
            </label>
            <p>创建后将直接进入项目画布。</p>
            <footer>
              <button type="button" onClick={() => setCreateOpen(false)}>取消</button>
              <button type="submit" className="is-primary" disabled={creating}>{creating ? '正在创建…' : '创建并进入'}</button>
            </footer>
          </form>
        </div>
      )}
    </div>
  );
};
