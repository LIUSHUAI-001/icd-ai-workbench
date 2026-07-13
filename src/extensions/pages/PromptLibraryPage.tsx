import { type FC, useEffect, useMemo, useState } from 'react';
import { IcdNavbar } from './IcdNavbar';
import { useIcdNavigate } from '../icdRouter';
import { queueIcdCanvasIntent } from '../icdCanvasIntent';
import { useCanvasStore } from '../../stores/canvas';
import { ICD_PROMPT_LIBRARY, type IcdPromptCategory, type IcdPromptRecord } from '../prompts/icdPromptLibrary';

type PromptFilter = '全部' | IcdPromptCategory;
const CATEGORIES: PromptFilter[] = ['全部', '空间类型', '风格表达', '材质与色彩', '灯光与镜头', '改造任务', '负面控制'];
const STORAGE_KEY = 'icd-ai-canvas:prompts:v1';
const STORAGE_VERSION = 1;

function loadPrompts(): IcdPromptRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?._v === STORAGE_VERSION && Array.isArray(parsed.items)) return parsed.items;
    }
  } catch { /* ignore */ }
  savePrompts(ICD_PROMPT_LIBRARY);
  return ICD_PROMPT_LIBRARY;
}

function savePrompts(items: IcdPromptRecord[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ _v: STORAGE_VERSION, items })); } catch { /* ignore */ }
}

export const PromptLibraryPage: FC = () => {
  const navigate = useIcdNavigate();
  const [items, setItems] = useState(loadPrompts);
  const [category, setCategory] = useState<PromptFilter>('全部');
  const [query, setQuery] = useState('');
  const [favoriteOnly, setFavoriteOnly] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState(ICD_PROMPT_LIBRARY[0]?.id ?? '');

  useEffect(() => { setItems(loadPrompts()); }, []);

  const persist = (next: IcdPromptRecord[]) => { setItems(next); savePrompts(next); };
  const toggleFavorite = (id: string) => persist(items.map((item) => item.id === id ? { ...item, isFavorite: !item.isFavorite } : item));

  const filtered = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return items.filter((item) => {
      if (category !== '全部' && item.category !== category) return false;
      if (favoriteOnly && !item.isFavorite) return false;
      return !keyword || [item.title, item.description, item.prompt, item.category, ...item.tags]
        .some((value) => value.toLowerCase().includes(keyword));
    });
  }, [category, favoriteOnly, items, query]);

  const selected = filtered.find((item) => item.id === selectedId) ?? filtered[0] ?? null;

  useEffect(() => {
    if (filtered.length > 0 && !filtered.some((item) => item.id === selectedId)) {
      setSelectedId(filtered[0].id);
    }
  }, [filtered, selectedId]);

  const copyPrompt = async (item: IcdPromptRecord) => {
    await navigator.clipboard.writeText(item.prompt);
    setCopiedId(item.id);
    window.setTimeout(() => setCopiedId((current) => current === item.id ? null : current), 1600);
  };

  const addToCanvas = async (item: IcdPromptRecord) => {
    queueIcdCanvasIntent({ kind: 'add-prompt', title: item.title, text: item.prompt });
    await useCanvasStore.getState().loadCanvases();
    const canvasState = useCanvasStore.getState();
    if (!canvasState.activeId) await canvasState.createCanvas(`画布 ${canvasState.canvases.length + 1}`);
    navigate('canvas');
  };

  return (
    <div className="icd-page icd-page--prompts">
      <IcdNavbar />
      <main className="icd-prompts">
        <section className="icd-prompts__hero">
          <div className="icd-prompts__hero-copy">
            <p className="icd-prompts__kicker">AI 生成工作台</p>
            <h1>提示词库</h1>
            <p className="icd-prompts__sub">把空间类型、风格、材质、灯光和改造任务整理成可直接使用的生成提示词。</p>
            <div className="icd-prompts__stats">
              <span data-label="条提示词">{String(items.length).padStart(2, '0')}</span>
              <span data-label="条收藏">{String(items.filter((item) => item.isFavorite).length).padStart(2, '0')}</span>
              <span data-label="个分类">{String(CATEGORIES.length - 1).padStart(2, '0')}</span>
            </div>
          </div>
        </section>

        <div className="icd-prompts__toolbar">
          <label className="icd-prompts__search">
            <span aria-hidden="true">⌕</span>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索提示词、场景、风格或材质" />
          </label>
          <button className={`icd-chip icd-chip--icon${favoriteOnly ? ' is-active' : ''}`} onClick={() => setFavoriteOnly((value) => !value)}>
            {favoriteOnly ? '★' : '☆'} 仅看收藏
          </button>
        </div>

        <div className="icd-prompts__workspace">
          <aside className="icd-prompts__sidebar" aria-label="提示词分类">
            <p className="icd-prompts__sidebar-title">提示词分类</p>
            {CATEGORIES.map((item) => (
              <button key={item} className={`icd-prompts__category${category === item ? ' is-active' : ''}`} onClick={() => setCategory(item)}>
                <span>{item}</span>
                <small>{item === '全部' ? items.length : items.filter((prompt) => prompt.category === item).length}</small>
              </button>
            ))}
          </aside>

          <section className="icd-prompts__results" aria-label="提示词列表">
            <div className="icd-prompts__results-head">
              <div><strong>{category === '全部' ? '全部提示词' : category}</strong><span>{filtered.length} 条结果</span></div>
              <span>点击卡片查看完整内容</span>
            </div>
            <div className="icd-prompts__grid">
              {filtered.map((item) => (
                <article className={`icd-prompts__card${selected?.id === item.id ? ' is-selected' : ''}`} key={item.id} onClick={() => setSelectedId(item.id)}>
                  <div className="icd-prompts__card-head">
                    <span>{item.category}</span>
                    <button className={`icd-prompts__fav${item.isFavorite ? ' is-active' : ''}`} onClick={(event) => { event.stopPropagation(); toggleFavorite(item.id); }} aria-label={item.isFavorite ? '取消收藏' : '收藏'}>{item.isFavorite ? '★' : '☆'}</button>
                  </div>
                  <h2>{item.title}</h2>
                  <p className="icd-prompts__description">{item.description}</p>
                  <div className="icd-prompts__prompt">{item.prompt}</div>
                  <div className="icd-prompts__tags">{item.tags.map((tag) => <span className="icd-tag" key={tag}>{tag}</span>)}</div>
                </article>
              ))}
            </div>
            {filtered.length === 0 && <div className="icd-empty-state"><strong>没有符合条件的提示词</strong><p>换一个分类或清除搜索条件后再试。</p></div>}
          </section>

          {selected && (
            <aside className="icd-prompts__detail" aria-label="提示词详情">
              <div className="icd-prompts__detail-head"><span>{selected.category}</span><button className={`icd-prompts__fav${selected.isFavorite ? ' is-active' : ''}`} onClick={() => toggleFavorite(selected.id)} aria-label="收藏">{selected.isFavorite ? '★' : '☆'}</button></div>
              <h2>{selected.title}</h2>
              <p className="icd-prompts__detail-description">{selected.description}</p>
              <p className="icd-prompts__detail-label">完整提示词</p>
              <div className="icd-prompts__detail-prompt">{selected.prompt}</div>
              <div className="icd-prompts__tags">{selected.tags.map((tag) => <span className="icd-tag" key={tag}>{tag}</span>)}</div>
              <div className="icd-prompts__detail-actions">
                <button className="icd-btn-sm icd-btn-sm--primary" onClick={() => void copyPrompt(selected)}>{copiedId === selected.id ? '已复制' : '复制提示词'}</button>
                <button className="icd-btn-sm icd-btn-sm--ghost" onClick={() => void addToCanvas(selected)}>加入画布</button>
              </div>
            </aside>
          )}
        </div>
      </main>
      <footer className="icd-footer"><strong>ICD STUDIO</strong><span>空间设计智能工作台</span></footer>
    </div>
  );
};
